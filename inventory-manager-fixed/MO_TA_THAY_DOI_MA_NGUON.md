# Mô tả chi tiết các thay đổi mã nguồn (`inventory-manager` → `inventory-manager-fixed`)

Tài liệu này mô tả toàn bộ thiết kế kỹ thuật và danh sách thay đổi mã nguồn giữa bản gốc `inventory-manager/` (v1.0.0) và bản sau bảo trì `inventory-manager-fixed/` (v1.1), tương ứng với 8 yêu cầu đã chốt trong báo cáo.

---

## 1. Tổng quan kiến trúc & CSDL thay đổi

### 1.1. Backend (`inventory-manager-fixed/backend`)
- **Phụ thuộc mới (`pom.xml`):**
  - Thêm `spring-boot-starter-security`, `spring-security-test` (test) và `io.jsonwebtoken:jjwt-{api,impl,jackson}` (`0.12.5`) cho xác thực JWT stateless (`DP-01`).
- **Cấu hình (`application.yml` & `data.sql`):**
  - Bổ sung `app.jwt.secret` và `app.jwt.expiration-ms` (`86400000` ms = 24 giờ).
  - Bổ sung giá trị `version = 0` vào câu lệnh `INSERT INTO products` trong `data.sql` để tương thích với cột `@Version` không null trên H2.
- **Mô hình dữ liệu (4 bảng chính):**
  1. `products` *(điều chỉnh)*: bổ sung cột `version` (`@Version`, `BIGINT NOT NULL DEFAULT 0`).
  2. `users` *(mới — `AppUser.java`)*: `id`, `username` (unique, <= 50), `password_hash` (BCrypt), `full_name`, `role` (`ADMIN` / `STAFF`).
  3. `stock_adjustments` *(mới — `StockAdjustment.java`)*: `id`, `product_id`, `product_sku`, `product_name`, `delta`, `previous_quantity`, `new_quantity`, `reason`, `adjusted_by`, `adjusted_at`.
  4. `audit_logs` *(mới — `AuditLog.java`)*: `id`, `actor`, `action` (`CREATE`, `UPDATE`, `DELETE`, `ADJUST_STOCK`), `entity_type`, `entity_id`, `product_sku`, `product_name`, `details`, `created_at`.

### 1.2. Frontend (`inventory-manager-fixed/frontend`)
- **Kiểu dữ liệu (`src/types.ts`):** Bổ sung `version` trên `Product`, `outOfStockCount` trên `InventoryStats`, các kiểu `Role`, `AuthSession`, `StockAdjustment`, `AuditLog`.
- **API Client (`src/api/client.ts`):** Tự động gắn `Authorization: Bearer <token>`, xử lý `401` đăng xuất tự động, thêm hàm `login`, `me`, `exportProductsCsv`, `listAdjustments`, `adjustStock`, `listAuditLogs`, `getProduct`.
- **Thành phần giao diện mới & cập nhật:**
  - *Mới:* `LoginForm.tsx`, `StockAdjustModal.tsx`, `StockHistoryModal.tsx`, `AuditLogModal.tsx`.
  - *Cập nhật:* `App.tsx`, `Dashboard.tsx`, `SearchFilterBar.tsx`, `ProductTable.tsx`, `ProductFormModal.tsx`, `index.css`.

---

## 2. Chi tiết thay đổi theo từng yêu cầu

### `HC-01` – Chuẩn hóa và kiểm tra trùng mã SKU
- **Backend:**
  - `ProductRepository.java`: thay/bổ sung `existsBySkuIgnoreCase(String sku)` và `existsBySkuIgnoreCaseAndIdNot(String sku, Long id)`.
  - `ProductService.java`: bổ sung hàm `normalizeSku(String sku)` (`trim().toUpperCase(Locale.ROOT)`), áp dụng trước khi kiểm tra trùng và trước khi lưu ở cả `createProduct` và `updateProduct`. Nếu chuỗi sau `trim()` rỗng thì ném `InvalidRequestException` (`400 Bad Request`).
- **Frontend:**
  - `ProductFormModal.tsx`: tự động loại bỏ khoảng trắng đầu/cuối và chuyển chữ hoa khi nhập/gửi SKU; hiển thị rõ lỗi `400` hoặc `409 Conflict`.

### `HC-02` – Khắc phục phân trang sau khi xóa
- **Frontend (`App.tsx`):**
  - Trong `handleDeleteConfirmed()`: nếu trang hiện tại chỉ có đúng `1` bản ghi (`page?.content.length === 1`) và `pageIndex > 0`, tự động lùi `pageIndex` về `pageIndex - 1` trước khi tải lại.
  - Trong `loadProducts()`: bổ sung cơ chế tự phục hồi nếu API trả về `result.content.length === 0 && result.totalPages > 0 && pageNum >= result.totalPages` → tự động đặt `setPageIndex(Math.max(0, result.totalPages - 1))`.
  - Vẫn đảm bảo thanh phân trang không bị kẹt ẩn người dùng ở trang `> 0` khi tổng trang giảm từ `2` xuống `1`.

### `HC-03` – Phân biệt 3 trạng thái tồn kho & Dashboard 4 thẻ
- **Backend:**
  - `InventoryStats.java`: bổ sung trường `outOfStockCount`.
  - `ProductRepository.java`: sửa `countLowStock()` thành `WHERE p.quantity > 0 AND p.quantity <= p.lowStockThreshold` và thêm `countOutOfStock()` (`WHERE p.quantity = 0`).
  - `ProductService.java`: cập nhật `getInventoryStats()` trả đủ 4 chỉ số.
- **Frontend:**
  - `Dashboard.tsx`: hiển thị 4 thẻ: `Total products`, `Inventory value`, `Low-stock items`, `Out-of-stock items`.
  - `ProductTable.tsx` & `index.css`: phân loại theo thứ tự ưu tiên: `quantity === 0` → badge đỏ `Out of stock` (`.badge-danger`, kể cả khi `lowStockThreshold === 0`); `0 < quantity <= lowStockThreshold` → badge vàng `Low stock` (`.badge-warning`); ngược lại → badge xanh lá `In stock` (`.badge-ok`).

### `HT-01` – Xuất danh sách sản phẩm CSV
- **Backend:**
  - `CsvExportService.java` *(mới)*: nhận danh sách sản phẩm đã lọc và sắp xếp, xuất UTF-8 có BOM (`\uFEFF`), dòng tiêu đề tiếng Anh `SKU,Name,Category,Quantity,Price,Value,Status`, escape chuẩn RFC 4180 (xử lý `'27" 4K Monitor'` thành `"""27"""" 4K Monitor"""` -> `"27"" 4K Monitor"`), vô hiệu hóa CSV Formula Injection bằng tiền tố `'` với ô bắt đầu bằng `=`, `+`, `-`, `@`, `\t`, `\r`.
  - `ProductController.java`: thêm `GET /api/products/export` trả `Content-Type: text/csv; charset=utf-8` và `Content-Disposition: attachment; filename="products_YYYYMMDD_HHmmss.csv"`.
- **Frontend:**
  - `SearchFilterBar.tsx` & `App.tsx`: thêm nút `Export CSV` (hiển thị cho cả `ADMIN` và `STAFF`). Nếu tổng kết quả lọc hiện hành `=== 0`, hiển thị thông báo `"No products match the current filter to export."` thay vì tải file rỗng.

### `HT-02` – Sắp xếp danh sách sản phẩm theo 6 cột
- **Backend:**
  - `ProductRepositoryCustom.java`, `ProductRepositoryImpl.java`, `ProductService.java`: whitelist 6 trường hợp lệ (`sku`, `name`, `category`, `quantity`, `price`, `value`); từ chối trường khác (kể cả `status`) bằng `InvalidRequestException` (`400 Bad Request`).
  - Hỗ trợ sắp xếp theo cột dẫn xuất `value` bằng biểu thức Criteria API `cb.prod(cb.toBigDecimal(root.get("quantity")), root.get("price"))`, kết hợp đồng thời điều kiện `name` và `category` và phân trang `Pageable`.
- **Frontend:**
  - `ProductTable.tsx` & `App.tsx`: biến 6 tiêu đề cột (`SKU`, `Name`, `Category`, `Quantity`, `Price`, `Value`) thành nút sắp xếp có biểu tượng `▲`/`▼`; lần nhấp đầu sắp xếp tăng dần (`asc`), nhấp lại đảo chiều (`desc`), đặt lại `pageIndex = 0`.

### `HT-03` – Điều chỉnh tồn kho có lý do & Khóa sửa trực tiếp `Quantity`
- **Backend:**
  - `StockAdjustment.java`, `StockAdjustmentRepository.java`, `StockAdjustmentService.java`, `AdjustStockRequest.java`:
    - `POST /api/products/{id}/adjustments` (chỉ `ADMIN`): kiểm tra `delta != 0`, `reason` không rỗng, kiểm tra `version` (`DP-02`), kiểm tra `currentQty + delta >= 0`, cập nhật tồn kho, lưu `stock_adjustments` và ghi `AuditLog` (`ADJUST_STOCK`) trong cùng `@Transactional`.
    - `GET /api/products/{id}/adjustments` (`ADMIN` + `STAFF`): trả danh sách lịch sử điều chỉnh phân trang mới nhất trước.
  - `ProductService.updateProduct()`: bỏ qua mọi thay đổi `quantity` từ payload `PUT /api/products/{id}` (giữ nguyên `existing.getQuantity()`).
- **Frontend:**
  - `ProductFormModal.tsx`: khóa ô `Quantity` (`disabled`) khi đang ở chế độ Edit và hiển thị gợi ý `"Quantity is locked during Edit. Use \"Adjust\" to update stock with a reason."`.
  - `StockAdjustModal.tsx` & `StockHistoryModal.tsx`: giao diện điều chỉnh tăng/giảm có lý do và xem lịch sử điều chỉnh của sản phẩm.

### `DP-01` – Xác thực JWT và Phân quyền RBAC
- **Backend:**
  - `AppUser.java`, `Role.java`, `UserRepository.java`, `DataInitializer.java`: tự khởi tạo 2 tài khoản demo trên H2 (`admin` / `admin123` vai trò `ADMIN`; `staff` / `staff123` vai trò `STAFF`) với mật khẩu mã hóa `BCryptPasswordEncoder`.
  - `JwtService.java`, `JwtAuthenticationFilter.java`, `SecurityConfig.java`, `AuthController.java`:
    - `POST /api/auth/login` trả JWT token + thông tin người dùng.
    - `GET /api/auth/me` trả thông tin phiên hiện tại.
    - Ma trận quyền (Phương án A): `STAFF` được xem `GET /api/products/**`, `GET /api/products/export`, `GET /api/products/{id}/adjustments`; chỉ `ADMIN` được `POST/PUT/DELETE /api/products/**`, `POST /api/products/{id}/adjustments`, `GET /api/audit-logs`.
    - Trả JSON `ApiError` thống nhất cho `401 Unauthorized` và `403 Forbidden`; giữ `/swagger-ui/**`, `/api-docs/**`, `/h2-console/**` truy cập được khi demo.
- **Frontend:**
  - `LoginForm.tsx` + thanh người dùng trên Header `App.tsx` (hiển thị tên đăng nhập, vai trò, nút `Logout`).
  - Ẩn các nút thao tác quản trị (`+ Add product`, `Edit`, `Delete`, `Adjust`, `Audit Log`) đối với tài khoản `STAFF`.

### `DP-02` – Nhật ký Audit Log và Chống ghi đè (`@Version`)
- **Backend:**
  - `Product.java`: thêm `@Version @Column(nullable = false) private Long version = 0L;`.
  - `OptimisticConflictException.java` + `GlobalExceptionHandler.java`: bắt `OptimisticConflictException` và `ObjectOptimisticLockingFailureException` trả HTTP `409 Conflict` theo chuẩn `ApiError`.
  - `ProductService.java` & `StockAdjustmentService.java`: bắt buộc đối chiếu `version` gửi từ client với `existing.getVersion()`; sau khi `CREATE`, `UPDATE`, `DELETE`, `ADJUST_STOCK` gọi `AuditLogService.record(...)` ghi vào `audit_logs` (không dùng khóa ngoại cascade xóa mất log).
  - `ProductController` / `AuditLogController`: `GET /api/audit-logs` (chỉ `ADMIN`, hỗ trợ lọc theo `action` và từ khóa `keyword`).
- **Frontend:**
  - `ProductFormModal.tsx` & `StockAdjustModal.tsx`: gửi kèm `version`; khi nhận `409 Conflict` do xung đột phiên bản, hiển thị cảnh báo rõ ràng cùng nút `Reload latest data` để nạp lại dữ liệu mới nhất.
  - `AuditLogModal.tsx`: bảng tra cứu nhật ký kiểm toán dành cho `ADMIN`.

---

## 3. Danh sách tệp tạo mới / sửa đổi trong `inventory-manager-fixed/`

| Thành phần | Tệp sửa đổi từ bản gốc | Tệp thêm mới |
| --- | --- | --- |
| **Backend Config & Resources** | `pom.xml`, `application.yml`, `data.sql`, `OpenApiConfig.java` | `config/DataInitializer.java`, `config/SecurityConfig.java` |
| **Backend Model & DTO** | `model/Product.java`, `dto/InventoryStats.java` | `model/AppUser.java`, `model/Role.java`, `model/StockAdjustment.java`, `model/AuditAction.java`, `model/AuditLog.java`, `dto/ProductRequest.java`, `dto/AdjustStockRequest.java`, `dto/LoginRequest.java`, `dto/LoginResponse.java`, `dto/UserProfileResponse.java` |
| **Backend Repository & Service** | `repository/ProductRepository.java`, `service/ProductService.java` | `repository/ProductRepositoryCustom.java`, `repository/ProductRepositoryImpl.java`, `repository/UserRepository.java`, `repository/StockAdjustmentRepository.java`, `repository/AuditLogRepository.java`, `service/CsvExportService.java`, `service/StockAdjustmentService.java`, `service/AuditLogService.java`, `service/CustomUserDetailsService.java`, `security/JwtService.java`, `security/JwtAuthenticationFilter.java` |
| **Backend Controller & Exception** | `controller/ProductController.java`, `exception/GlobalExceptionHandler.java` | `controller/AuthController.java`, `controller/AuditLogController.java`, `exception/InvalidRequestException.java`, `exception/OptimisticConflictException.java` |
| **Backend Tests** | `ProductServiceTest.java` (10), `ProductControllerTest.java` (7) | `SecurityAndIntegrationTest.java` (5) — đã chạy `mvn test`: 22/22 Passed (`0 failed, 0 errors, 0 skipped`) |
| **Frontend** | `src/types.ts`, `src/api/client.ts`, `src/App.tsx`, `src/components/Dashboard.tsx`, `src/components/SearchFilterBar.tsx`, `src/components/ProductTable.tsx`, `src/components/ProductFormModal.tsx`, `src/index.css` | `src/components/LoginForm.tsx`, `src/components/StockAdjustModal.tsx`, `src/components/StockHistoryModal.tsx`, `src/components/AuditLogModal.tsx` |
