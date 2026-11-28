# Project 2 – Bảo trì phần mềm (CT244H): Inventory Manager

Repository này chứa toàn bộ mã nguồn ứng dụng **Inventory Manager** (bản gốc đối chiếu và bản sau bảo trì), bộ báo cáo Word hoàn chỉnh, sơ đồ Draw.io, mẫu tham khảo và slide bài giảng phục vụ Bài tập nhóm số 02 môn học **Bảo trì phần mềm (CT244H)**.

---

## Cấu trúc thư mục và Nội dung chi tiết

```text
project2_dec/
├── README.md                             # Tài liệu tổng quan repository & hướng dẫn chạy nhanh
├── .gitignore                            # Quy tắc loại trừ thư mục build/tệp tạm cho Git
├── BaoCao/                               # Báo cáo tổng hợp, báo cáo thành phần (.docx) & đề bài
├── CT244H-20261127T203424Z-1-001/        # Tài liệu & slide bài giảng học phần CT244H
├── docs/                                 # Tài liệu tổng hợp 8 yêu cầu bảo trì của nhóm
├── inventory-manager/                    # Mã nguồn ứng dụng gốc (v1.0.0 - Baseline)
├── inventory-manager-fixed/              # Mã nguồn ứng dụng sau bảo trì (v1.1.0)
├── mau_tham_khao/                        # Biểu mẫu & ví dụ hướng dẫn viết báo cáo
└── resources/                            # Tài liệu hỗ trợ, mô tả thay đổi mã nguồn & sơ đồ Draw.io
```

### 1. `BaoCao/` — Sản phẩm báo cáo nộp và đề bài Project 2

Chứa các tệp báo cáo bảo trì chính thức (Word `.docx`) và đề bài gốc:

| Tệp | Mô tả nội dung |
| --- | --- |
| `BaoCao.docx` | Báo cáo tổng hợp hợp nhất hoàn chỉnh (Trang bìa, Mục lục, Phần Mở đầu dùng chung, Phần I–VI và Phụ lục A–C). |
| `KeHoachBaoTri.docx` | Tài liệu thành phần — Kế hoạch bảo trì phần mềm (tổ chức, WBS, Gantt, Function Point, IEEE 1219, quản lý cấu hình & chất lượng). |
| `PhanTichTacDong.docx` | Tài liệu thành phần — Phân tích sự tác động (đề xuất, tiếp nhận, phân tích tác động >= 2 giải pháp & phê duyệt CCB). |
| `DacTaYeuCau.docx` | Tài liệu thành phần — Đặc tả yêu cầu phần mềm bảo trì (yêu cầu chức năng kèm Flowchart so sánh Cũ/Mới, NFR & Use Case). |
| `ThietKe.docx` | Tài liệu thành phần — Tài liệu thiết kế (kiến trúc 3 tầng, sơ đồ lớp/tuần tự, ERD 4 bảng, từ điển dữ liệu & thiết kế 8 chức năng). |
| `KiemThu.docx` | Tài liệu thành phần — Tài liệu kiểm thử (kế hoạch, quản lý kiểm thử & bộ 47 Test Cases). |
| `Yeucau_Project2.pdf` | Tệp đề bài và yêu cầu chính thức của Project 2 học phần Bảo trì phần mềm. |

### 2. `CT244H-20261127T203424Z-1-001/` — Tài liệu bài giảng môn học

Chứa thư mục con `CT244H/` gồm các slide lý thuyết học phần Bảo trì phần mềm dùng làm cơ sở chuẩn hóa quy trình IEEE 1219 và ước lượng Function Point:

- `Introduction.pdf`: Giới thiệu tổng quan học phần CT244H.
- `Phan_I_EN.pdf`, `Phan_II_EN.pdf`, `Phan_III _EN.pdf`: Nội dung lý thuyết về khái niệm, mô hình/quy trình bảo trì, phân tích tác động, quản lý cấu hình và đo lường/ước lượng phần mềm.

### 3. `docs/` — Tổng hợp yêu cầu bảo trì

- `TONG_HOP_YEU_CAU_BAO_TRI.md`: Tài liệu chốt phạm vi **8 yêu cầu bảo trì** của nhóm gồm:
  - Hiệu chỉnh lỗi (`Corrective`): `HC-01` (chuẩn hóa & chống trùng SKU), `HC-02` (phân trang sau khi xóa), `HC-03` (tách trạng thái `Out of stock` / `Low stock` & Dashboard 4 thẻ).
  - Hoàn thiện (`Perfective`): `HT-01` (xuất CSV chuẩn RFC 4180 + UTF-8 BOM + chống Formula Injection), `HT-02` (sắp xếp 6 cột phía server), `HT-03` (điều chỉnh tồn kho có lý do & khóa sửa `Quantity` khi Edit).
  - Dự phòng (`Preventive`): `DP-01` (xác thực JWT & phân quyền RBAC `ADMIN`/`STAFF`), `DP-02` (chống ghi đè đồng thời với `@Version` & lưu Audit Log).

### 4. `inventory-manager/` — Ứng dụng gốc (Baseline `v1.0.0`)

Mã nguồn gốc ban đầu trước khi bảo trì (được giữ nguyên trạng để làm mốc đối chiếu lỗi và chụp ảnh Before/After):

- `backend/`: REST API Spring Boot 3.2.5 (Java 17, Maven, Spring Data JPA, H2 In-Memory database, cấu hình `pom.xml`).
- `frontend/`: Giao diện React 18 + TypeScript + Vite (`package.json`, `vite.config.ts`, `index.html`, `src/`).
- `docker-compose.yml`, `README.md`, `LICENSE`, `.gitignore`: Cấu hình Docker tùy chọn (PostgreSQL) và hướng dẫn ứng dụng gốc.

### 5. `inventory-manager-fixed/` — Ứng dụng sau khi thực hiện bảo trì (`v1.1.0`)

- `MO_TA_THAY_DOI_MA_NGUON.md`: Ghi chép kỹ thuật đối chiếu chi tiết từng tệp mã nguồn Backend/Frontend trước và sau bảo trì.

Mã nguồn ứng dụng đã hoàn thiện cả 8 yêu cầu bảo trì `HC-01..03`, `HT-01..03`, `DP-01..02`:

- `backend/`: Bổ sung Spring Security + JWT (`AuthController`, `JwtService`, `JwtAuthenticationFilter`), bảng `users`, `stock_adjustments`, `audit_logs`, cột `version` (`@Version`), dịch vụ xuất CSV (`CsvExportService`), JPA Criteria sorting (`ProductRepositoryImpl`), `GlobalExceptionHandler` chuẩn hóa `ApiError` và bộ kiểm thử tự động (`ProductServiceTest`, `ProductControllerTest`, `SecurityAndIntegrationTest`).
- `frontend/`: Bổ sung đăng nhập `LoginForm`, phân quyền UI theo vai trò `ADMIN`/`STAFF`, biểu mẫu điều chỉnh kho (`StockAdjustModal`, `StockHistoryModal`), màn hình nhật ký kiểm toán (`AuditLogModal`), sắp xếp 6 cột, nút `Export CSV`, xử lý `409 Conflict` (`Reload latest data`) và Dashboard 4 thẻ.
- `docker-compose.yml`, `README.md`, `LICENSE`, `.gitignore`: Cấu hình và mô tả riêng của phiên bản `1.1.0`.

### 6. `mau_tham_khao/` — Mẫu trình bày tài liệu báo cáo

Chứa bộ biểu mẫu chuẩn của học phần để đối chiếu cấu trúc từng phần báo cáo:

- `mau_tham_khao/md/`: Các bản chuyển đổi Markdown giúp tra cứu nhanh (`Yeucau_Project2.md`, `KehoachBT.md`, `Phantichsutacdong.md`, `DactaYCTD.md`, `ThietkeYCTD.md`, `Vidu_Dacta_Thietke.md`, `Tài liệu kiểm thử.md`).
- `mau_tham_khao/pdf/`: Các tệp biểu mẫu gốc từ giảng viên (`Yeucau_Project2.pdf`, `KehoachBT.pdf`, `Phantichsutacdong.pdf`, `DactaYCTD.pdf`, `ThietkeYCTD.pdf`, `Vidu_Dacta_Thietke.pdf`, `Tài liệu kiểm thử.docx`).

### 7. `resources/` — Tài liệu hỗ trợ & Bộ 24 sơ đồ Draw.io

- `DANH_MUC_HINH_VA_ANH.md`: Danh sách kiểm tra `24` sơ đồ Draw.io (`SD-01`–`SD-24`), `16` ảnh chụp minh chứng Before/After (`IMG-01`–`IMG-16`) và các mục cần điền thủ công trước khi nộp.
- `diagram_drawio/`: Chứa `README.md` cùng đầy đủ **24 tệp nguồn `.drawio`** (`SD-01.drawio`–`SD-24.drawio`) và **24 ảnh xuất `.png`** (`SD-01.png`–`SD-24.png`).

---

## Hướng dẫn chạy nhanh ứng dụng

Mặc định cả hai phiên bản `inventory-manager/` và `inventory-manager-fixed/` dùng **H2 in-memory database** nên **không cần Docker hay cài đặt PostgreSQL** (dữ liệu mẫu tự nạp khi khởi động và đặt lại sau khi dừng tiến trình).

### Yêu cầu môi trường

- **Java JDK:** 17 trở lên (`java -version`)
- **Apache Maven:** 3.9 trở lên (`mvn -version`)
- **Node.js & npm:** Node 18+ (`node --version`, `npm --version`)

### Chạy Backend (ví dụ bản sau bảo trì `inventory-manager-fixed`)

```powershell
cd inventory-manager-fixed\backend
mvn spring-boot:run
```

> Để chạy bản gốc đối chiếu, thay đường dẫn thành `cd inventory-manager\backend`.

Khi Backend khởi động xong (`Started InventoryManagerApplication`):

- **REST API:** `http://localhost:8080`
- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **H2 Console:** `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:inventorydb`, Username: `sa`, Password để trống)
- **Tài khoản mẫu bản `1.1.0`:** `admin` / `admin123` (`ADMIN`) và `staff` / `staff123` (`STAFF`)

### Chạy Frontend

Mở một cửa sổ PowerShell khác tại thư mục gốc repository:

```powershell
cd inventory-manager-fixed\frontend
npm install
npm run dev
```

Mở trình duyệt tại địa chỉ Vite hiển thị (mặc định `http://localhost:5173`).

### Chạy kiểm thử tự động Backend

```powershell
cd inventory-manager-fixed\backend
mvn test
```

### Chạy bằng Docker (tùy chọn profile PostgreSQL)

Docker chỉ cần dùng nếu muốn chạy cùng PostgreSQL thay vì H2 in-memory mặc định (xem `docker-compose.yml` trong từng thư mục ứng dụng).
