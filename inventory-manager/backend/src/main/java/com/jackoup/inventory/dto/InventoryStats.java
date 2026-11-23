package com.jackoup.inventory.dto;

import java.math.BigDecimal;

public class InventoryStats {

    private final long totalProducts;
    private final BigDecimal inventoryValue;
    private final long lowStockCount;

    public InventoryStats(long totalProducts, BigDecimal inventoryValue, long lowStockCount) {
        this.totalProducts = totalProducts;
        this.inventoryValue = inventoryValue;
        this.lowStockCount = lowStockCount;
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
}
