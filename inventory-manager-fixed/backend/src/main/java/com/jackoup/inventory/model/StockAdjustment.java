package com.jackoup.inventory.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "stock_adjustments")
public class StockAdjustment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false, length = 50)
    private String productSku;

    @Column(nullable = false, length = 200)
    private String productName;

    @Column(nullable = false)
    private Integer delta;

    @Column(nullable = false)
    private Integer previousQuantity;

    @Column(nullable = false)
    private Integer newQuantity;

    @Column(nullable = false, length = 500)
    private String reason;

    @Column(nullable = false, length = 50)
    private String adjustedBy;

    @Column(nullable = false)
    private Instant adjustedAt;

    public StockAdjustment() {
    }

    public StockAdjustment(
            Long productId,
            String productSku,
            String productName,
            Integer delta,
            Integer previousQuantity,
            Integer newQuantity,
            String reason,
            String adjustedBy,
            Instant adjustedAt) {
        this.productId = productId;
        this.productSku = productSku;
        this.productName = productName;
        this.delta = delta;
        this.previousQuantity = previousQuantity;
        this.newQuantity = newQuantity;
        this.reason = reason;
        this.adjustedBy = adjustedBy;
        this.adjustedAt = adjustedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductSku() {
        return productSku;
    }

    public String getProductName() {
        return productName;
    }

    public Integer getDelta() {
        return delta;
    }

    public Integer getPreviousQuantity() {
        return previousQuantity;
    }

    public Integer getNewQuantity() {
        return newQuantity;
    }

    public String getReason() {
        return reason;
    }

    public String getAdjustedBy() {
        return adjustedBy;
    }

    public Instant getAdjustedAt() {
        return adjustedAt;
    }
}
