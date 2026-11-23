package com.jackoup.inventory;

import com.jackoup.inventory.dto.InventoryStats;
import com.jackoup.inventory.exception.DuplicateSkuException;
import com.jackoup.inventory.exception.ProductNotFoundException;
import com.jackoup.inventory.model.Product;
import com.jackoup.inventory.repository.ProductRepository;
import com.jackoup.inventory.service.ProductService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct() {
        return new Product("SKU-1001", "Wireless Mouse", "Electronics",
                48, new BigDecimal("24.99"), 10);
    }

    @Test
    void createProduct_withNewSku_savesProduct() {
        Product product = sampleProduct();
        Mockito.when(productRepository.existsBySku("SKU-1001")).thenReturn(false);
        Mockito.when(productRepository.save(any(Product.class))).thenAnswer(i -> i.getArgument(0));

        Product created = productService.createProduct(product);

        assertEquals("SKU-1001", created.getSku());
    }

    @Test
    void createProduct_withDuplicateSku_throwsException() {
        Mockito.when(productRepository.existsBySku("SKU-1001")).thenReturn(true);

        assertThrows(DuplicateSkuException.class, () -> productService.createProduct(sampleProduct()));
    }

    @Test
    void getProductById_withUnknownId_throwsException() {
        Mockito.when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ProductNotFoundException.class, () -> productService.getProductById(999L));
    }

    @Test
    void getInventoryStats_aggregatesRepositoryValues() {
        Mockito.when(productRepository.count()).thenReturn(12L);
        Mockito.when(productRepository.getTotalInventoryValue()).thenReturn(new BigDecimal("1499.50"));
        Mockito.when(productRepository.countLowStock()).thenReturn(3L);

        InventoryStats stats = productService.getInventoryStats();

        assertEquals(12L, stats.getTotalProducts());
        assertEquals(0, new BigDecimal("1499.50").compareTo(stats.getInventoryValue()));
        assertEquals(3L, stats.getLowStockCount());
    }

    @Test
    void updateProduct_withChangedSkuToExistingOne_throwsException() {
        Product existing = sampleProduct();
        Mockito.when(productRepository.findById(1L)).thenReturn(Optional.of(existing));
        Mockito.when(productRepository.existsBySku("SKU-9999")).thenReturn(true);

        Product updated = sampleProduct();
        updated.setSku("SKU-9999");

        assertThrows(DuplicateSkuException.class, () -> productService.updateProduct(1L, updated));
    }
}
