# Tổng hợp yêu cầu bảo trì – Inventory Manager

## Phạm vi

Sản phẩm là ứng dụng quản lý tồn kho dùng Spring Boot, React, TypeScript và H2. Nhóm chọn 8 yêu cầu: 3 hiệu chỉnh, 3 hoàn thiện và 2 dự phòng. Phần thích ứng đã bỏ theo yêu cầu giảm phạm vi của thầy.

## Các yêu cầu

| Mã | Yêu cầu | Kết quả mong đợi |
| --- | --- | --- |
| HC-01 | Chuẩn hóa và kiểm tra mã SKU | Xóa khoảng trắng đầu/cuối, thống nhất chữ hoa và ngăn SKU trùng sau chuẩn hóa. Cần kiểm chứng hiện trạng trước khi sửa. |
| HC-02 | Khắc phục phân trang sau khi xóa | Khi trang hiện tại không còn hợp lệ sau khi xóa, chuyển về trang hợp lệ gần nhất và tải lại danh sách. |
| HC-03 | Phân biệt hết hàng và sắp hết hàng | Số lượng 0 hiển thị hết hàng; số lượng dương không vượt ngưỡng hiển thị sắp hết hàng; trên ngưỡng hiển thị còn hàng. Số lượng 0 là hợp lệ. |
| HT-01 | Xuất danh sách sản phẩm CSV | Xuất danh sách theo điều kiện tìm kiếm và lọc hiện tại. |
| HT-02 | Sắp xếp danh sách sản phẩm | Sắp xếp tăng/giảm theo cột và kết hợp được với tìm kiếm, lọc, phân trang. |
| HT-03 | Điều chỉnh tồn kho có lý do | Cho phép tăng/giảm số lượng, nhập lý do và ghi nhận lịch sử; không cho tồn kho âm. |
| DP-01 | Xác thực và phân quyền | Đăng nhập và kiểm tra quyền trước các thao tác thay đổi dữ liệu. |
| DP-02 | Nhật ký thay đổi và chống ghi đè dữ liệu | Ghi nhận thay đổi và cảnh báo khi bản ghi đã được phiên khác cập nhật. |

## Hiện trạng và các điểm cần xem xét

- **HC-02:** Đã quan sát bảng trống sau khi xóa ở trang cuối dù tổng sản phẩm vẫn còn.
- **HC-03:** Đã quan sát sản phẩm có số lượng 0 hiển thị “Low stock”.
- **HC-01:** Báo cáo nêu nguy cơ trùng SKU, nhưng cần kiểm thử thực tế và đối chiếu mã nguồn trước khi khẳng định lỗi.
- **Dữ liệu khi khởi động lại:** Backend trở về 12 sản phẩm mẫu. Lưu trữ bền vững không nằm trong phạm vi đã chốt, nhưng ảnh hưởng đến khả năng giữ tài khoản, lịch sử và dữ liệu demo; cần thống nhất phương án khi thiết kế.
- **Phân quyền:** Đặc tả cần được kiểm tra tính thống nhất giữa quyền nhân viên xem/xuất dữ liệu, quyền điều chỉnh tồn kho và quyền quản trị thay đổi dữ liệu.
- **Giải pháp mục 2.3:** Cần kiểm tra từng phiếu phân tích tác động có đủ ít nhất hai giải pháp và có nhân lực, công cụ, thời gian, chi phí.
- **Biểu mẫu:** Điền thông tin thành viên và thay các nội dung giữ chỗ trước khi nộp; kiểm tra lại mức ưu tiên và nội dung HC-03 giữa các phiếu.

## Tiến độ và việc tiếp theo

- Phân tích tác động và đặc tả yêu cầu đã được nhóm hoàn thành; cần rà soát các điểm ở trên.
- Thiết kế thay đổi cho 8 yêu cầu, xác định giao diện, xử lý, API và dữ liệu cần sửa.
- Triển khai từng yêu cầu và kiểm thử, bao gồm kiểm thử hồi quy; lưu kết quả và bằng chứng phù hợp.
- Cập nhật tài liệu thiết kế, kiểm thử, hướng dẫn sử dụng và báo cáo theo kết quả thực tế.
- Chuẩn bị slide và kịch bản demo.

Các kết quả mong đợi trong tài liệu là yêu cầu đề xuất, không đồng nghĩa chức năng đã được triển khai hay kiểm thử thành công.
