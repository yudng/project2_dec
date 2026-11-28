package com.jackoup.inventory;

import com.jackoup.inventory.dto.InventoryStats;
import com.jackoup.inventory.dto.ProductRequest;
import com.jackoup.inventory.exception.DuplicateSkuException;
import com.jackoup.inventory.exception.InvalidRequestException;
import com.jackoup.inventory.exception.OptimisticConflictException;
import com.jackoup.inventory.exception.ProductNotFoundException;
import com.jackoup.inventory.model.AuditAction;
import com.jackoup.inventory.model.Product;
import com.jackoup.inventory.repository.ProductRepository;
import com.jackoup.inventory.service.AuditLogService;
import com.jackoup.inventory.service.ProductService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct() {
        Product product = new Product("SKU-1001", "Wireless Mouse", "Electronics",
                48, new BigDecimal("24.99"), 10);
        product.setVersion(0L);
        return product;
    }

    @Test
    void createProduct_normalizesSkuAndSavesProduct() {
        ProductRequest request = new ProductRequest(
                "  sku-1001  ", "Wireless Mouse", "Electronics",
                48, new BigDecimal("24.99"), 10, null);
        Mockito.when(productRepository.existsBySkuIgnoreCase("SKU-1001")).thenReturn(false);
        Mockito.when(productRepository.saveAndFlush(any(Product.class))).thenAnswer(i -> i.getArgument(0));

        Product created = productService.createProduct(request, "admin");

        assertEquals("SKU-1001", created.getSku());
        verify(auditLogService).record(eq("admin"), eq(AuditAction.CREATE), any(), eq("SKU-1001"), eq("Wireless Mouse"), any());
    }

    @Test
    void createProduct_withDuplicateNormalizedSku_throwsException() {
        ProductRequest request = new ProductRequest(
                " sku-1001 ", "Wireless Mouse", "Electronics",
                48, new BigDecimal("24.99"), 10, null);
        Mockito.when(productRepository.existsBySkuIgnoreCase("SKU-1001")).thenReturn(true);

        assertThrows(DuplicateSkuException.class, () -> productService.createProduct(request, "admin"));
    }

    @Test
    void createProduct_withBlankSku_throwsInvalidRequest() {
        ProductRequest request = new ProductRequest(
                "   ", "Wireless Mouse", "Electronics",
                48, new BigDecimal("24.99"), 10, null);

        assertThrows(InvalidRequestException.class, () -> productService.createProduct(request, "admin"));
    }

    @Test
    void getProductById_withUnknownId_throwsException() {
        Mockito.when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ProductNotFoundException.class, () -> productService.getProductById(999L));
    }

    @Test
    void getInventoryStats_aggregatesFourMetrics() {
        Mockito.when(productRepository.count()).thenReturn(12L);
        Mockito.when(productRepository.getTotalInventoryValue()).thenReturn(new BigDecimal("1499.50"));
        Mockito.when(productRepository.countLowStock()).thenReturn(2L);
        Mockito.when(productRepository.countOutOfStock()).thenReturn(1L);

        InventoryStats stats = productService.getInventoryStats();

        assertEquals(12L, stats.getTotalProducts());
        assertEquals(0, new BigDecimal("1499.50").compareTo(stats.getInventoryValue()));
        assertEquals(2L, stats.getLowStockCount());
        assertEquals(1L, stats.getOutOfStockCount());
    }

    @Test
    void updateProduct_withMismatchedVersion_throwsOptimisticConflict() {
        Product existing = sampleProduct();
        existing.setVersion(2L);
        Mockito.when(productRepository.findById(1L)).thenReturn(Optional.of(existing));

        ProductRequest request = new ProductRequest(
                "SKU-1001", "Updated Mouse", "Electronics",
                48, new BigDecimal("25.99"), 10, 1L);

        assertThrows(OptimisticConflictException.class, () -> productService.updateProduct(1L, request, "admin"));
    }

    @Test
    void updateProduct_preservesExistingQuantityAndNormalizesSku() {
        Product existing = sampleProduct();
        Mockito.when(productRepository.findById(1L)).thenReturn(Optional.of(existing));
        Mockito.when(productRepository.existsBySkuIgnoreCaseAndIdNot("SKU-1001", 1L)).thenReturn(false);
        Mockito.when(productRepository.saveAndFlush(any(Product.class))).thenAnswer(i -> i.getArgument(0));

        ProductRequest request = new ProductRequest(
                " sku-1001 ", "Wireless Mouse Pro", "Electronics",
                999, new BigDecimal("29.99"), 5, 0L);

        Product updated = productService.updateProduct(1L, request, "admin");

        assertEquals("SKU-1001", updated.getSku());
        assertEquals(48, updated.getQuantity());
        assertEquals("Wireless Mouse Pro", updated.getName());
    }

    @Test
    void updateProduct_withChangedSkuToExistingOne_throwsException() {
        Product existing = sampleProduct();
        Mockito.when(productRepository.findById(1L)).thenReturn(Optional.of(existing));
        Mockito.when(productRepository.existsBySkuIgnoreCaseAndIdNot("SKU-9999", 1L)).thenReturn(true);

        ProductRequest request = new ProductRequest(
                "sku-9999", "Wireless Mouse", "Electronics",
                48, new BigDecimal("24.99"), 10, 0L);

        assertThrows(DuplicateSkuException.class, () -> productService.updateProduct(1L, request, "admin"));
    }

    @Test
    void getProducts_withUnsupportedSortField_throwsInvalidRequest() {
        PageRequest pageable = PageRequest.of(0, 10, Sort.by("status"));
        assertThrows(InvalidRequestException.class, () -> productService.getProducts(null, null, pageable));
    }

    @Test
    void deleteProduct_recordsAuditLogAndDeletesEntity() {
        Product existing = sampleProduct();
        Mockito.when(productRepository.findById(1L)).thenReturn(Optional.of(existing));

        productService.deleteProduct(1L, "admin");

        verify(auditLogService).record(eq("admin"), eq(AuditAction.DELETE), any(), eq("SKU-1001"), eq("Wireless Mouse"), any());
        verify(productRepository).delete(existing);
    }
}
