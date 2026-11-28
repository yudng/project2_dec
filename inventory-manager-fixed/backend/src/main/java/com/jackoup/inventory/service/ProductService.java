package com.jackoup.inventory.service;

import com.jackoup.inventory.dto.InventoryStats;
import com.jackoup.inventory.dto.ProductRequest;
import com.jackoup.inventory.exception.DuplicateSkuException;
import com.jackoup.inventory.exception.InvalidRequestException;
import com.jackoup.inventory.exception.OptimisticConflictException;
import com.jackoup.inventory.exception.ProductNotFoundException;
import com.jackoup.inventory.model.AuditAction;
import com.jackoup.inventory.model.Product;
import com.jackoup.inventory.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

@Service
@Transactional
public class ProductService {

    public static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "sku", "name", "category", "quantity", "price", "value");

    private final ProductRepository productRepository;
    private final AuditLogService auditLogService;

    public ProductService(ProductRepository productRepository, AuditLogService auditLogService) {
        this.productRepository = productRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public Page<Product> getProducts(String name, String category, Pageable pageable) {
        validateSort(pageable.getSort());
        return productRepository.searchProducts(
                normalizeFilter(name),
                normalizeFilter(category),
                pageable);
    }

    @Transactional(readOnly = true)
    public List<Product> getProductsForExport(String name, String category, Sort sort) {
        Sort effectiveSort = (sort == null || sort.isUnsorted()) ? Sort.by(Sort.Order.asc("name")) : sort;
        validateSort(effectiveSort);
        return productRepository.findAllMatchingSorted(
                normalizeFilter(name),
                normalizeFilter(category),
                effectiveSort);
    }

    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }

    public Product createProduct(ProductRequest request, String actor) {
        String normalizedSku = normalizeSku(request.sku());
        if (productRepository.existsBySkuIgnoreCase(normalizedSku)) {
            throw new DuplicateSkuException(normalizedSku);
        }

        Product product = new Product(
                normalizedSku,
                request.name().trim(),
                normalizeFilter(request.category()),
                request.quantity(),
                request.price(),
                request.lowStockThreshold());

        Product saved = productRepository.saveAndFlush(product);
        auditLogService.record(
                actor,
                AuditAction.CREATE,
                saved.getId(),
                saved.getSku(),
                saved.getName(),
                String.format(
                        "Created product qty=%d, price=%s, threshold=%d",
                        saved.getQuantity(), saved.getPrice(), saved.getLowStockThreshold()));
        return saved;
    }

    public Product updateProduct(Long id, ProductRequest request, String actor) {
        Product existing = getProductById(id);

        if (request.version() == null || !Objects.equals(request.version(), existing.getVersion())) {
            throw new OptimisticConflictException(
                    "Product was modified by another session. Please reload the latest data and try again.");
        }

        String normalizedSku = normalizeSku(request.sku());
        if (productRepository.existsBySkuIgnoreCaseAndIdNot(normalizedSku, id)) {
            throw new DuplicateSkuException(normalizedSku);
        }

        String beforeSummary = String.format(
                "sku=%s, name=%s, category=%s, price=%s, threshold=%d",
                existing.getSku(), existing.getName(), existing.getCategory(),
                existing.getPrice(), existing.getLowStockThreshold());

        // HT-03: direct editing of quantity is locked during product update; use stock adjustment instead.
        existing.setSku(normalizedSku);
        existing.setName(request.name().trim());
        existing.setCategory(normalizeFilter(request.category()));
        existing.setPrice(request.price());
        existing.setLowStockThreshold(request.lowStockThreshold());

        Product saved = productRepository.saveAndFlush(existing);
        String afterSummary = String.format(
                "sku=%s, name=%s, category=%s, price=%s, threshold=%d",
                saved.getSku(), saved.getName(), saved.getCategory(),
                saved.getPrice(), saved.getLowStockThreshold());

        auditLogService.record(
                actor,
                AuditAction.UPDATE,
                saved.getId(),
                saved.getSku(),
                saved.getName(),
                "Before [" + beforeSummary + "] -> After [" + afterSummary + "]");
        return saved;
    }

    public void deleteProduct(Long id, String actor) {
        Product existing = getProductById(id);
        String snapshot = String.format(
                "Deleted product qty=%d, price=%s, category=%s",
                existing.getQuantity(), existing.getPrice(), existing.getCategory());

        auditLogService.record(
                actor,
                AuditAction.DELETE,
                existing.getId(),
                existing.getSku(),
                existing.getName(),
                snapshot);
        productRepository.delete(existing);
    }

    @Transactional(readOnly = true)
    public InventoryStats getInventoryStats() {
        BigDecimal inventoryValue = productRepository.getTotalInventoryValue();
        return new InventoryStats(
                productRepository.count(),
                inventoryValue != null ? inventoryValue : BigDecimal.ZERO,
                productRepository.countLowStock(),
                productRepository.countOutOfStock());
    }

    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return productRepository.findDistinctCategories();
    }

    public String normalizeSku(String rawSku) {
        if (rawSku == null || rawSku.trim().isEmpty()) {
            throw new InvalidRequestException("SKU is required");
        }
        String normalized = rawSku.trim().toUpperCase(Locale.ROOT);
        if (normalized.length() > 50) {
            throw new InvalidRequestException("SKU must be at most 50 characters");
        }
        return normalized;
    }

    public void validateSort(Sort sort) {
        if (sort == null || sort.isUnsorted()) {
            return;
        }
        for (Sort.Order order : sort) {
            if (!ALLOWED_SORT_FIELDS.contains(order.getProperty())) {
                throw new InvalidRequestException("Unsupported sort field: " + order.getProperty());
            }
        }
    }

    private String normalizeFilter(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
