package com.jackoup.inventory.service;

import com.jackoup.inventory.dto.InventoryStats;
import com.jackoup.inventory.exception.DuplicateSkuException;
import com.jackoup.inventory.exception.ProductNotFoundException;
import com.jackoup.inventory.model.Product;
import com.jackoup.inventory.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public Page<Product> getProducts(String name, String category, Pageable pageable) {
        String normalizedName = (name == null || name.isBlank()) ? null : name.trim();
        String normalizedCategory = (category == null || category.isBlank()) ? null : category.trim();
        return productRepository.search(normalizedName, normalizedCategory, pageable);
    }

    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }

    public Product createProduct(Product product) {
        if (productRepository.existsBySku(product.getSku())) {
            throw new DuplicateSkuException(product.getSku());
        }
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updated) {
        Product existing = getProductById(id);
        if (!existing.getSku().equals(updated.getSku()) && productRepository.existsBySku(updated.getSku())) {
            throw new DuplicateSkuException(updated.getSku());
        }
        existing.setSku(updated.getSku());
        existing.setName(updated.getName());
        existing.setCategory(updated.getCategory());
        existing.setQuantity(updated.getQuantity());
        existing.setPrice(updated.getPrice());
        existing.setLowStockThreshold(updated.getLowStockThreshold());
        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }
        productRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public InventoryStats getInventoryStats() {
        BigDecimal inventoryValue = productRepository.getTotalInventoryValue();
        return new InventoryStats(
                productRepository.count(),
                inventoryValue != null ? inventoryValue : BigDecimal.ZERO,
                productRepository.countLowStock());
    }

    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return productRepository.findDistinctCategories();
    }
}
