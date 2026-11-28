# Danh mục Sơ đồ Draw.io (`SD-01` – `SD-24`), Ảnh Minh chứng (`IMG-01` – `IMG-16`) và Hạng mục Cần hoàn thiện

Tài liệu này đồng bộ trực tiếp với Báo cáo tổng hợp `BaoCao/BaoCao_BaoTri_InventoryManager.docx`.

> **Lưu ý quan trọng khi vẽ sơ đồ và chụp ảnh:**
> - **Không chú thích quá nhiều trong ảnh:** trên sơ đồ Draw.io chỉ ghi nhãn từ khóa ngắn gọn (tên khối, điều kiện nhánh rẽ, tên tác nhân, tên cột); toàn bộ giải thích chi tiết nghiệp vụ đã nằm ở phần văn bản báo cáo ngay cạnh hình.
> - **Ảnh chụp màn hình:** chụp gọn đúng vùng giao diện/terminal cần minh họa, không chèn khung chữ giải thích dày đặc đè lên ảnh.

---

## 1. Danh mục 24 Sơ đồ Draw.io (`resources/diagram_drawio/`)

Toàn bộ 24 tệp nguồn `.drawio` và ảnh xuất `.png` (nền trắng, độ phân giải 2x) đã được tạo trong `resources/diagram_drawio/` và nhúng trực tiếp vào báo cáo:

| Mã | Vị trí trong Báo cáo tổng hợp | Tên sơ đồ | Tên tệp đã tạo | Trạng thái |
| --- | --- | --- | --- | --- |
| `SD-01` | Phần I (1.1 — Tổ chức) | Sơ đồ tổ chức nhóm bảo trì và kênh giao tiếp | `SD-01.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-02` | Phần I (1.2 — Lịch trình) | Biểu đồ Gantt kế hoạch bảo trì (11/11/2026 – 02/12/2026) | `SD-02.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-03` | Phần I (2 — Quy trình) | Sơ đồ quy trình bảo trì 7 giai đoạn IEEE 1219 | `SD-03.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-04` | Phần II (1 — Tác động CCB) | Lưu đồ tiếp nhận, phân tích tác động & phê duyệt (CCB) | `SD-04.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-05` | Phần III (1.1.1 / `HC-01`) | **Flowchart so sánh Cũ \| Mới:** Xử lý & chuẩn hóa SKU | `SD-05.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-06` | Phần III (1.1.1 / `HC-02`) | **Flowchart so sánh Cũ \| Mới:** Xóa sản phẩm & Phân trang | `SD-06.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-07` | Phần III (1.1.1 / `HC-03`) | **Flowchart so sánh Cũ \| Mới:** Trạng thái tồn kho & Dashboard | `SD-07.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-08` | Phần III (1.1.2 / `HT-01`, `HT-02`) | **Flowchart so sánh Trước \| Sau:** Xuất CSV & Sắp xếp 6 cột | `SD-08.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-09` | Phần III (1.1.2 / `HT-03`) | **Flowchart so sánh Cũ \| Mới:** Đổi số lượng vs Adjust Stock + Khóa Edit | `SD-09.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-10` | Phần III (1.1.2 / `DP-01`, `DP-02`) | **Flowchart so sánh Trước \| Sau:** JWT/RBAC, `@Version` 409 & Audit Log | `SD-10.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-11` | Phần III (2 — Use Case) | Sơ đồ Use Case tổng quát hệ thống Inventory Manager sau bảo trì | `SD-11.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-12` | Phần IV (1.1 — Kiến trúc) | Kiến trúc tổng thể 3 tầng (Trước & Sau bảo trì) | `SD-12.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-13` | Phần IV (1.2 — Lớp) | Sơ đồ lớp (Class Diagram) Domain, Service & Controller | `SD-13.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-14` | Phần IV (1.2 — Tuần tự) | Sơ đồ tuần tự — Xác thực JWT & RBAC (`DP-01`) | `SD-14.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-15` | Phần IV (1.2 — Tuần tự) | Sơ đồ tuần tự — Điều chỉnh tồn kho + `@Version` + Audit Log | `SD-15.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-16` | Phần IV (2.1 — ERD) | Sơ đồ thực thể kết hợp (ERD) 1 bảng (Cũ) vs 4 bảng (Mới) | `SD-16.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-17` | Phần IV (3.1.1 — `HC-01`) | Lưu đồ thuật toán — Chuẩn hóa & chống trùng mã SKU | `SD-17.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-18` | Phần IV (3.1.2 — `HC-02`) | Lưu đồ thuật toán — Điều hướng phân trang sau khi xóa | `SD-18.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-19` | Phần IV (3.1.3 — `HC-03`) | Lưu đồ thuật toán — Phân loại 3 trạng thái & 4 thẻ Dashboard | `SD-19.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-20` | Phần IV (3.2.1 — `HT-01`) | Lưu đồ thuật toán — Xuất CSV RFC 4180 & Formula Guard | `SD-20.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-21` | Phần IV (3.2.2 — `HT-02`) | Lưu đồ thuật toán — Sắp xếp 6 cột bằng JPA Criteria API | `SD-21.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-22` | Phần IV (3.2.3 — `HT-03`) | Lưu đồ thuật toán — Điều chỉnh tồn kho có lý do | `SD-22.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-23` | Phần IV (3.2.4 — `DP-01`) | Lưu đồ thuật toán — Kiểm tra JWT & RBAC trên mỗi Request | `SD-23.drawio`, `.png` | [x] Đã vẽ & nhúng |
| `SD-24` | Phần IV (3.2.5 — `DP-02`) | Lưu đồ thuật toán — Chống ghi đè `@Version` & UI Reload 409 | `SD-24.drawio`, `.png` | [x] Đã vẽ & nhúng |

---

## 2. Danh mục 16 Ảnh minh chứng Before / After cần chụp (`IMG-01` .. `IMG-16`)

Chạy trên máy có Node.js 18+ cho bản gốc `inventory-manager/` (Before) và bản bảo trì `inventory-manager-fixed/` (After):

| Mã | Vị trí | Nội dung ảnh cần chụp | Nguồn chạy | Trạng thái |
| --- | --- | --- | --- | --- |
| `IMG-01` | Phần IV (`HC-01`) | Before: tạo trùng `' sku-1001 '` ở bản gốc; After: tự viết hoa & báo 409 | `inventory-manager/` & `-fixed/` | [ ] Chưa chụp |
| `IMG-02` | Phần IV (`HC-02`) | Before: trang 2 rỗng & mất phân trang sau xóa; After: tự lùi Trang 1 | `inventory-manager/` & `-fixed/` | [ ] Chưa chụp |
| `IMG-03` | Phần IV (`HC-03`) | Before: `qty=0` hiện badge vàng; After: badge đỏ `Out of stock` | `inventory-manager/` & `-fixed/` | [ ] Chưa chụp |
| `IMG-04` | Phần IV (`HC-03`) | Hàng Dashboard nâng cấp từ 3 thẻ lên 4 thẻ (`Out-of-stock items`) | `inventory-manager-fixed/` | [ ] Chưa chụp |
| `IMG-05` | Phần IV (`HT-01`) | Nút `Export CSV`, thông báo rỗng & file CSV mở chuẩn `27" 4K Monitor` | `inventory-manager-fixed/` | [ ] Chưa chụp |
| `IMG-06` | Phần IV (`HT-02`) | Bảng 6 tiêu đề cột có nút sắp xếp `▲/▼/↕` đang sort theo `Value` | `inventory-manager-fixed/` | [ ] Chưa chụp |
| `IMG-07` | Phần IV (`HT-03`) | Modal `Adjust stock` (`delta`, `reason`) và ô `Quantity` bị khóa xám trên Edit | `inventory-manager-fixed/` | [ ] Chưa chụp |
| `IMG-08` | Phần IV (`HT-03`) | Modal `Stock History` hiển thị lịch sử tăng/giảm kho của 1 sản phẩm | `inventory-manager-fixed/` | [ ] Chưa chụp |
| `IMG-09` | Phần IV (`DP-01`) | Màn hình `LoginForm` với tài khoản demo `ADMIN` / `STAFF` | `inventory-manager-fixed/` | [ ] Chưa chụp |
| `IMG-10` | Phần IV (`DP-01`) | Giao diện khi đăng nhập `STAFF` (ẩn các nút `Add/Edit/Adjust/Delete/Audit Log`) | `inventory-manager-fixed/` | [ ] Chưa chụp |
| `IMG-11` | Phần IV (`DP-02`) | Banner `409 Conflict` + nút `Reload latest data` khi sửa cùng sản phẩm trên 2 tab | `inventory-manager-fixed/` | [ ] Chưa chụp |
| `IMG-12` | Phần IV (`DP-02`) | Modal `System Audit Log` lọc theo `CREATE/UPDATE/ADJUST_STOCK/DELETE` & từ khóa | `inventory-manager-fixed/` | [ ] Chưa chụp |
| `IMG-13` | Phần V (2.8) | Terminal chạy `mvn test` Backend đạt `22/22 Passed` | Backend `mvn test` | [ ] Chưa chụp |
| `IMG-14` | Phần V (2.8) | Kiểm thử hồi quy tìm kiếm + lọc danh mục + sửa Tên/Giá sau bảo trì | `inventory-manager-fixed/` | [ ] Chưa chụp |
| `IMG-15` | Phần V (2.8) | Kiểm thử API qua Swagger UI (`/swagger-ui.html`) đã Authorize Bearer JWT | `inventory-manager-fixed/` | [ ] Chưa chụp |
| `IMG-16` | Phần V (2.8) | DevTools Network minh chứng JSON `ApiError` mã `401` và `403` | `inventory-manager-fixed/` | [ ] Chưa chụp |

---

## 3. Các mục `[CẦN ĐIỀN]` thủ công trước khi nộp

1. **Logo Đại học Cần Thơ / Trường CNTT&TT** trên Trang bìa của `BaoCao/BaoCao_BaoTri_InventoryManager.docx`.
2. **Thông tin nhóm đầy đủ & Bảng phân công nhiệm vụ** (chỉ còn duy nhất tại Trang bìa và Mục `M.3` ở Phần Mở đầu: tên GVHD, Nhóm 17, họ tên/MSSV các thành viên còn lại, `% hoàn thành`, `Tinh thần kỷ luật`).
3. **Kết quả chạy UI trình duyệt** điền vào 22 ca đánh dấu `[Chờ kiểm thử UI]` trong Phần V sau khi chạy `npm install && npm run dev`.
4. **Cập nhật Mục lục trong Word:** nhấn `Ctrl + A` rồi `F9` -> `Update entire table`.
