package com.jackoup.inventory;

import com.jackoup.inventory.controller.ProductController;
import com.jackoup.inventory.dto.InventoryStats;
import com.jackoup.inventory.model.Product;
import com.jackoup.inventory.service.ProductService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    private Product sampleProduct() {
        Product product = new Product("SKU-1001", "Wireless Mouse", "Electronics",
                48, new BigDecimal("24.99"), 10);
        return product;
    }

    @Test
    void listProducts_returnsPagedResults() throws Exception {
        Mockito.when(productService.getProducts(isNull(), isNull(), any()))
                .thenReturn(new PageImpl<>(List.of(sampleProduct()), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].sku").value("SKU-1001"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void getStats_returnsSummary() throws Exception {
        Mockito.when(productService.getInventoryStats())
                .thenReturn(new InventoryStats(12L, new BigDecimal("1499.50"), 3L));

        mockMvc.perform(get("/api/products/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProducts").value(12))
                .andExpect(jsonPath("$.lowStockCount").value(3));
    }

    @Test
    void createProduct_withValidBody_returns201() throws Exception {
        Mockito.when(productService.createProduct(any(Product.class))).thenAnswer(invocation -> {
            Product product = invocation.getArgument(0);
            return product;
        });

        String body = """
                {"sku":"SKU-2001","name":"HDMI Cable","category":"Electronics",
                 "quantity":100,"price":12.50,"lowStockThreshold":20}""";

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sku").value("SKU-2001"));
    }

    @Test
    void createProduct_withInvalidBody_returns400WithFieldErrors() throws Exception {
        String body = """
                {"sku":"","name":"","category":"Electronics",
                 "quantity":-5,"price":-1.00,"lowStockThreshold":20}""";

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.sku").exists())
                .andExpect(jsonPath("$.fieldErrors.quantity").exists());
    }
}
