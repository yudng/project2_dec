package com.jackoup.inventory.dto;

import java.math.BigDecimal;

public class InventoryStats {

    private final long totalProducts;
    private final BigDecimal inventoryValue;
    private final long lowStockCount;
    private final long outOfStockCount;

    public InventoryStats(
            long totalProducts,
            BigDecimal inventoryValue,
            long lowStockCount,
            long outOfStockCount) {
        this.totalProducts = totalProducts;
        this.inventoryValue = inventoryValue;
        this.lowStockCount = lowStockCount;
        this.outOfStockCount = outOfStockCount;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public BigDecimal getInventoryValue() {
        return inventoryValue;
    }

    public long getLowStockCount() {
        return lowStockCount;
    }

    public long getOutOfStockCount() {
        return outOfStockCount;
    }
}
