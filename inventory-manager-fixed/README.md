# 📦 Inventory Manager (Maintained v1.1.0)

Phiên bản sau bảo trì của ứng dụng quản lý tồn kho **Inventory Manager** (Spring Boot 3.2.5 + Java 17 + React 18 + TypeScript 5 + Vite 5 + H2).

## Các cải tiến đã hoàn thiện (8 yêu cầu bảo trì)

- **HC-01:** Chuẩn hóa (`trim` + chữ in hoa) và kiểm tra trùng SKU không phân biệt hoa/thường tại Backend và Frontend.
- **HC-02:** Tự động chuyển về trang hợp lệ gần nhất sau khi xóa sản phẩm cuối trang và giữ thanh phân trang hoạt động nhất quán.
- **HC-03:** Phân biệt rõ 3 trạng thái tồn kho (`Out of stock`, `Low stock`, `In stock`) và tách Dashboard thành 4 thẻ thống kê (thêm `Out-of-stock items`).
- **HT-01:** Xuất tệp CSV UTF-8 BOM chuẩn RFC 4180 theo điều kiện tìm kiếm, lọc và sắp xếp hiện hành (`/api/products/export`).
- **HT-02:** Sắp xếp tăng/giảm phía server theo 6 cột (`SKU`, `Name`, `Category`, `Quantity`, `Price`, `Value`).
- **HT-03:** Điều chỉnh tồn kho có lý do (`/api/products/{id}/adjustments`), lưu lịch sử và khóa sửa trực tiếp `Quantity` trong biểu mẫu Edit.
- **DP-01:** Xác thực JWT stateless và phân quyền RBAC (`ADMIN`, `STAFF`). Tài khoản mẫu khởi tạo sẵn trên H2:
  - Quản trị viên: `admin` / `admin123` (`ADMIN`)
  - Nhân viên kho: `staff` / `staff123` (`STAFF`)
- **DP-02:** Chống ghi đè đồng thời với `@Version` (trả `409 Conflict` kèm nút tải lại) và lưu nhật ký kiểm toán (`/api/audit-logs`).

## Chạy ứng dụng

### 1. Backend

```powershell
cd inventory-manager-fixed\backend
mvn spring-boot:run
```

- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- H2 Console: `http://localhost:8080/h2-console` (`jdbc:h2:mem:inventorydb`, user `sa`, password trống)

### 2. Frontend

```powershell
cd inventory-manager-fixed\frontend
npm install
npm run dev
```

Mở `http://localhost:5173`.

### 3. Kiểm thử Backend

```powershell
cd inventory-manager-fixed\backend
mvn test
```
