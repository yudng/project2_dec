package com.jackoup.inventory.service;

import com.jackoup.inventory.dto.AdjustStockRequest;
import com.jackoup.inventory.exception.InvalidRequestException;
import com.jackoup.inventory.exception.OptimisticConflictException;
import com.jackoup.inventory.exception.ProductNotFoundException;
import com.jackoup.inventory.model.AuditAction;
import com.jackoup.inventory.model.Product;
import com.jackoup.inventory.model.StockAdjustment;
import com.jackoup.inventory.repository.ProductRepository;
import com.jackoup.inventory.repository.StockAdjustmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Objects;

@Service
@Transactional
public class StockAdjustmentService {

    private final ProductRepository productRepository;
    private final StockAdjustmentRepository stockAdjustmentRepository;
    private final AuditLogService auditLogService;

    public StockAdjustmentService(
            ProductRepository productRepository,
            StockAdjustmentRepository stockAdjustmentRepository,
            AuditLogService auditLogService) {
        this.productRepository = productRepository;
        this.stockAdjustmentRepository = stockAdjustmentRepository;
        this.auditLogService = auditLogService;
    }

    public StockAdjustment adjustStock(Long productId, AdjustStockRequest request, String actor) {
        if (request.delta() == null || request.delta() == 0) {
            throw new InvalidRequestException("Adjustment quantity (delta) must not be zero");
        }
        String trimmedReason = request.reason() != null ? request.reason().trim() : "";
        if (trimmedReason.isEmpty()) {
            throw new InvalidRequestException("Reason is required for stock adjustment");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        if (request.version() == null || !Objects.equals(request.version(), product.getVersion())) {
            throw new OptimisticConflictException(
                    "Product was modified by another session. Please reload the latest data and try again.");
        }

        int previousQuantity = product.getQuantity();
        int newQuantity = previousQuantity + request.delta();
        if (newQuantity < 0) {
            throw new InvalidRequestException(
                    "Resulting stock quantity cannot be negative (current: " + previousQuantity + ")");
        }

        product.setQuantity(newQuantity);
        productRepository.saveAndFlush(product);

        String safeActor = (actor == null || actor.isBlank()) ? "system" : actor.trim();
        StockAdjustment adjustment = new StockAdjustment(
                product.getId(),
                product.getSku(),
                product.getName(),
                request.delta(),
                previousQuantity,
                newQuantity,
                trimmedReason,
                safeActor,
                Instant.now());

        StockAdjustment saved = stockAdjustmentRepository.save(adjustment);
        auditLogService.record(
                safeActor,
                AuditAction.ADJUST_STOCK,
                product.getId(),
                product.getSku(),
                product.getName(),
                String.format(
                        "Adjusted stock delta=%+d (%d -> %d); reason: %s",
                        request.delta(), previousQuantity, newQuantity, trimmedReason));
        return saved;
    }

    @Transactional(readOnly = true)
    public Page<StockAdjustment> getAdjustments(Long productId, Pageable pageable) {
        if (!productRepository.existsById(productId)) {
            throw new ProductNotFoundException(productId);
        }
        return stockAdjustmentRepository.findByProductIdOrderByAdjustedAtDescIdDesc(productId, pageable);
    }
}
