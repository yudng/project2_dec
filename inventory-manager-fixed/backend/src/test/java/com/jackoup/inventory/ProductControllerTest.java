package com.jackoup.inventory;

import com.jackoup.inventory.config.SecurityConfig;
import com.jackoup.inventory.controller.ProductController;
import com.jackoup.inventory.dto.InventoryStats;
import com.jackoup.inventory.dto.ProductRequest;
import com.jackoup.inventory.model.Product;
import com.jackoup.inventory.security.JwtService;
import com.jackoup.inventory.service.CsvExportService;
import com.jackoup.inventory.service.ProductService;
import com.jackoup.inventory.service.StockAdjustmentService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
@Import(SecurityConfig.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @MockBean
    private CsvExportService csvExportService;

    @MockBean
    private StockAdjustmentService stockAdjustmentService;

    @MockBean
    private JwtService jwtService;

    private Product sampleProduct() {
        return new Product("SKU-1001", "Wireless Mouse", "Electronics",
                48, new BigDecimal("24.99"), 10);
    }

    @Test
    void listProducts_withoutAuthentication_returns401() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @WithMockUser(username = "staff", roles = "STAFF")
    void listProducts_asStaff_returnsPagedResults() throws Exception {
        Mockito.when(productService.getProducts(isNull(), isNull(), any()))
                .thenReturn(new PageImpl<>(List.of(sampleProduct()), PageRequest.of(0, 10), 1));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].sku").value("SKU-1001"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(username = "staff", roles = "STAFF")
    void exportProducts_asStaff_returnsCsv() throws Exception {
        Mockito.when(productService.getProductsForExport(isNull(), isNull(), any()))
                .thenReturn(List.of(sampleProduct()));
        Mockito.when(csvExportService.exportProductsToCsv(any()))
                .thenReturn("SKU,Name\r\nSKU-1001,Wireless Mouse\r\n".getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(get("/api/products/export"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv;charset=UTF-8"));
    }

    @Test
    @WithMockUser(username = "staff", roles = "STAFF")
    void createProduct_asStaff_returns403() throws Exception {
        String body = """
                {"sku":"SKU-2001","name":"HDMI Cable","category":"Electronics",
                 "quantity":100,"price":12.50,"lowStockThreshold":20}""";

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "staff", roles = "STAFF")
    void getStats_returnsSummaryWithOutOfStock() throws Exception {
        Mockito.when(productService.getInventoryStats())
                .thenReturn(new InventoryStats(12L, new BigDecimal("1499.50"), 2L, 1L));

        mockMvc.perform(get("/api/products/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProducts").value(12))
                .andExpect(jsonPath("$.lowStockCount").value(2))
                .andExpect(jsonPath("$.outOfStockCount").value(1));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void createProduct_withValidBody_returns201() throws Exception {
        Mockito.when(productService.createProduct(any(ProductRequest.class), eq("admin")))
                .thenReturn(new Product("SKU-2001", "HDMI Cable", "Electronics",
                        100, new BigDecimal("12.50"), 20));

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
    @WithMockUser(username = "admin", roles = "ADMIN")
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
