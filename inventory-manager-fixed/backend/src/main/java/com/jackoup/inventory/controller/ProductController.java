package com.jackoup.inventory.controller;

import com.jackoup.inventory.dto.AdjustStockRequest;
import com.jackoup.inventory.dto.InventoryStats;
import com.jackoup.inventory.dto.ProductRequest;
import com.jackoup.inventory.model.Product;
import com.jackoup.inventory.model.StockAdjustment;
import com.jackoup.inventory.service.CsvExportService;
import com.jackoup.inventory.service.ProductService;
import com.jackoup.inventory.service.StockAdjustmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.SortDefault;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products", description = "Inventory product management endpoints")
public class ProductController {

    private static final DateTimeFormatter CSV_TS_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    private final ProductService productService;
    private final CsvExportService csvExportService;
    private final StockAdjustmentService stockAdjustmentService;

    public ProductController(
            ProductService productService,
            CsvExportService csvExportService,
            StockAdjustmentService stockAdjustmentService) {
        this.productService = productService;
        this.csvExportService = csvExportService;
        this.stockAdjustmentService = stockAdjustmentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "List products with pagination, name search, category filter and 6-column sorting")
    public Page<Product> getProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        return productService.getProducts(name, category, pageable);
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Export all filtered and sorted products to RFC 4180 UTF-8 CSV")
    public ResponseEntity<byte[]> exportProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @SortDefault(sort = "name", direction = Sort.Direction.ASC) Sort sort) {
        List<Product> products = productService.getProductsForExport(name, category, sort);
        byte[] csvBytes = csvExportService.exportProductsToCsv(products);

        String filename = "products_" + LocalDateTime.now().format(CSV_TS_FORMAT) + ".csv";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "csv", StandardCharsets.UTF_8));
        headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());
        return ResponseEntity.ok().headers(headers).body(csvBytes);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Get inventory summary statistics (including out-of-stock count)")
    public InventoryStats getStats() {
        return productService.getInventoryStats();
    }

    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "List all distinct product categories")
    public List<String> getCategories() {
        return productService.getCategories();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Get a product by its id")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new product (ADMIN only)")
    public ResponseEntity<Product> createProduct(
            @Valid @RequestBody ProductRequest request,
            Authentication authentication) {
        Product created = productService.createProduct(request, resolveActor(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing product with optimistic version check (ADMIN only)")
    public Product updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            Authentication authentication) {
        return productService.updateProduct(id, request, resolveActor(authentication));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a product (ADMIN only)")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            Authentication authentication) {
        productService.deleteProduct(id, resolveActor(authentication));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/adjustments")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Adjust product stock quantity with mandatory reason (ADMIN only)")
    public ResponseEntity<StockAdjustment> adjustStock(
            @PathVariable Long id,
            @Valid @RequestBody AdjustStockRequest request,
            Authentication authentication) {
        StockAdjustment saved = stockAdjustmentService.adjustStock(id, request, resolveActor(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}/adjustments")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "List stock adjustment history for a product")
    public Page<StockAdjustment> getAdjustments(
            @PathVariable Long id,
            @PageableDefault(size = 20) Pageable pageable) {
        return stockAdjustmentService.getAdjustments(id, pageable);
    }

    private String resolveActor(Authentication authentication) {
        return authentication != null ? authentication.getName() : "system";
    }
}
