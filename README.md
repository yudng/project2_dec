# Project 2 - Bảo trì phần mềm

Repository này gồm tài liệu cho bài tập Project 2 và mã nguồn ứng dụng **Inventory Manager** dùng làm sản phẩm bảo trì.

## Cấu trúc chính

- `inventory-manager/`: ứng dụng quản lý kho (Spring Boot + React + TypeScript).
- `md/`: các mẫu/tài liệu báo cáo bảo trì ở định dạng Markdown.
- Các tệp PDF/DOCX ở thư mục gốc: tài liệu và biểu mẫu tham khảo của môn học.

## Chạy ứng dụng

Mặc định dự án **không cần Docker**. Backend sử dụng H2 in-memory nên không cần cài hoặc cấu hình PostgreSQL.

### Yêu cầu môi trường

- Java 17 trở lên
- Apache Maven 3.9 trở lên
- Node.js 18 trở lên và npm

Kiểm tra nhanh:

```powershell
java -version
mvn -version
node --version
npm --version
```

### 1. Chạy backend

Mở PowerShell tại thư mục gốc repository và chạy:

```powershell
cd inventory-manager\backend
mvn spring-boot:run
```

Khi log hiện `Started InventoryManagerApplication`, backend đã sẵn sàng tại:

- Ứng dụng API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- H2 Console: `http://localhost:8080/h2-console`

Thông số H2 Console: JDBC URL `jdbc:h2:mem:inventorydb`, username `sa`, để trống password.

### 2. Chạy frontend

Mở **một PowerShell khác**, tại thư mục gốc repository:

```powershell
cd inventory-manager\frontend
npm install
npm run dev
```

Mở địa chỉ mà Vite hiển thị (mặc định `http://localhost:5173`). Frontend đã được cấu hình gọi backend qua `http://localhost:8080`.

### Dừng ứng dụng

Trong mỗi terminal đang chạy backend hoặc frontend, nhấn `Ctrl + C`.

> Lưu ý: H2 là cơ sở dữ liệu trong bộ nhớ; dữ liệu thêm, sửa hoặc xóa sẽ mất khi dừng backend. Đây là cấu hình mặc định để thuận tiện chạy demo.

## Kiểm thử backend

```powershell
cd inventory-manager\backend
mvn test
```

## Docker

Docker chỉ cần khi muốn chạy profile PostgreSQL, không cần cho luồng chạy mặc định nêu trên.
