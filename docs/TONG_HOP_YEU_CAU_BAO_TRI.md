# Tổng hợp yêu cầu bảo trì - Inventory Manager

## 1. Thông tin chung

- **Sản phẩm được bảo trì:** Inventory Manager
- **Loại sản phẩm:** Ứng dụng web quản lý hàng tồn kho
- **Công nghệ hiện tại:** Spring Boot, React, TypeScript và H2
- **Mục tiêu:** Khắc phục lỗi đã phát hiện, giúp hệ thống phù hợp môi trường sử dụng, bổ sung chức năng và hạn chế rủi ro khi vận hành.

## 2. Các hạn chế đã kiểm thử

| Mã hạn chế | Hiện trạng quan sát được | Tác động |
| --- | --- | --- |
| HL-01 | Khi để trống số lượng lúc thêm sản phẩm, giao diện chuyển giá trị thành `0` và vẫn tạo sản phẩm. | Dữ liệu tồn kho có thể sai mà người dùng không nhận được cảnh báo. |
| HL-02 | Khi xóa sản phẩm cuối cùng ở trang cuối, dashboard vẫn có dữ liệu nhưng bảng thông báo không tìm thấy sản phẩm. | Người dùng hiểu nhầm toàn bộ kho không còn dữ liệu. |
| HL-03 | Khi backend/API lỗi, dashboard chỉ hiện dấu `—`; thông báo hiển thị chung là `Request failed with status 500`. | Không xác định được khu vực lỗi và khó xử lý sự cố. |
| HL-04 | Khi dừng rồi chạy lại backend, dữ liệu vừa thao tác bị mất và hệ thống trở về 12 sản phẩm mẫu. | Không thể sử dụng ổn định với dữ liệu thực tế. |

## 3. Yêu cầu bảo trì hiệu chỉnh lỗi

### HC-01 - Kiểm tra trường số bắt buộc

- **Hiện trạng:** Giá trị rỗng của trường số lượng, giá hoặc ngưỡng tồn kho thấp có thể bị chuyển thành `0`.
- **Yêu cầu:** Kiểm tra riêng trường rỗng trước khi chuyển kiểu số; hiển thị thông báo bắt buộc nhập và không gửi dữ liệu không hợp lệ lên API.
- **Thành phần tác động dự kiến:** Form thêm/sửa sản phẩm ở frontend, test giao diện.
- **Kết quả mong đợi:** Không thể tạo/cập nhật sản phẩm nếu chưa nhập các trường số bắt buộc.

### HC-02 - Khắc phục phân trang sau khi xóa

- **Hiện trạng:** Xóa bản ghi cuối cùng ở trang cuối làm bảng trống dù trang trước vẫn có dữ liệu.
- **Yêu cầu:** Sau khi xóa, nếu trang hiện tại không còn dữ liệu và không phải trang đầu, tự chuyển về trang hợp lệ gần nhất.
- **Thành phần tác động dự kiến:** Luồng xóa và trạng thái phân trang ở frontend.
- **Kết quả mong đợi:** Danh sách luôn hiển thị sản phẩm còn lại sau thao tác xóa.

### HC-03 - Thông báo lỗi tải dashboard

- **Hiện trạng:** Khi không tải được thống kê, dashboard chỉ hiện dấu `—` và không nêu nguyên nhân.
- **Yêu cầu:** Hiển thị trạng thái lỗi riêng cho dashboard, thông báo dễ hiểu và nút thử lại.
- **Thành phần tác động dự kiến:** Component dashboard, API client và test lỗi kết nối.
- **Kết quả mong đợi:** Người dùng biết thống kê không tải được và có thể thử lại mà không cần tải lại trang.

## 4. Yêu cầu bảo trì thích ứng

### TU-01 - Cấu hình môi trường chạy

- **Hiện trạng:** Port frontend/backend và API URL đang phụ thuộc cấu hình cố định.
- **Yêu cầu:** Đọc port và API URL từ biến môi trường/cấu hình, kèm file cấu hình mẫu.
- **Thành phần tác động dự kiến:** Vite config, cấu hình Spring Boot, README.
- **Kết quả mong đợi:** Có thể chạy chung máy với các dự án khác mà không sửa trực tiếp source code.

### TU-02 - Lưu trữ dữ liệu bền vững

- **Hiện trạng:** H2 in-memory xóa dữ liệu sau mỗi lần restart backend.
- **Yêu cầu:** Bổ sung profile H2 file-based để dữ liệu tồn tại sau khi khởi động lại.
- **Thành phần tác động dự kiến:** `application.yml`, tài liệu hướng dẫn chạy, test khởi động lại.
- **Kết quả mong đợi:** Sản phẩm đã tạo trước khi dừng backend vẫn còn sau khi chạy lại.

### TU-03 - Bản địa hóa giao diện

- **Hiện trạng:** Giao diện dùng tiếng Anh và định dạng tiền tệ USD.
- **Yêu cầu:** Việt hóa nhãn, thông báo và hiển thị tiền theo VND.
- **Thành phần tác động dự kiến:** Component React, thông báo lỗi và hàm định dạng tiền.
- **Kết quả mong đợi:** Giao diện phù hợp người dùng Việt Nam.

## 5. Yêu cầu bảo trì hoàn thiện

### HT-01 - Xuất danh sách sản phẩm CSV

- **Hiện trạng:** Không thể lấy danh sách sản phẩm ra để lưu trữ hoặc báo cáo.
- **Yêu cầu:** Bổ sung chức năng xuất danh sách đang lọc ra tệp CSV.
- **Thành phần tác động dự kiến:** API xuất dữ liệu, nút giao diện và kiểm thử tệp xuất.
- **Kết quả mong đợi:** Người dùng tải được tệp CSV chứa các cột sản phẩm cần thiết.

### HT-02 - Sắp xếp danh sách sản phẩm

- **Hiện trạng:** Danh sách chỉ có thứ tự mặc định theo tên.
- **Yêu cầu:** Cho phép sắp xếp theo tên, số lượng, giá và giá trị tồn kho; hỗ trợ tăng/giảm.
- **Thành phần tác động dự kiến:** Query API, repository/service backend và điều khiển sắp xếp frontend.
- **Kết quả mong đợi:** Danh sách thay đổi đúng thứ tự được chọn, vẫn hoạt động với tìm kiếm và phân trang.

### HT-03 - Điều chỉnh tồn kho có lý do

- **Hiện trạng:** Người dùng sửa trực tiếp số lượng, không biết thay đổi do nhập hàng, bán hàng hay kiểm kê.
- **Yêu cầu:** Thêm thao tác tăng/giảm tồn kho, nhập số lượng và lý do điều chỉnh.
- **Thành phần tác động dự kiến:** Entity/bảng lịch sử điều chỉnh, API nghiệp vụ và modal giao diện.
- **Kết quả mong đợi:** Số lượng tồn được cập nhật theo thao tác và có thể truy vết lý do.

## 6. Yêu cầu bảo trì dự phòng

### DP-01 - Xác thực và phân quyền

- **Hiện trạng:** Bất kỳ ai mở ứng dụng đều có thể thêm, sửa hoặc xóa sản phẩm.
- **Yêu cầu:** Bổ sung đăng nhập và phân quyền; chỉ quản trị viên mới được thao tác thay đổi dữ liệu.
- **Thành phần tác động dự kiến:** Spring Security, entity người dùng, API xác thực, bảo vệ route frontend.
- **Kết quả mong đợi:** Người dùng chưa đăng nhập chỉ xem được theo quyền được cấp; thao tác nhạy cảm được bảo vệ.

### DP-02 - Nhật ký và kiểm soát ghi đè dữ liệu

- **Hiện trạng:** Không có lịch sử thay đổi và không phát hiện hai người cùng sửa một sản phẩm.
- **Yêu cầu:** Ghi audit log thay đổi; dùng versioning/optimistic locking để cảnh báo khi dữ liệu đã bị người khác cập nhật.
- **Thành phần tác động dự kiến:** Entity sản phẩm, bảng lịch sử, service cập nhật và xử lý lỗi xung đột.
- **Kết quả mong đợi:** Có thể xem người thay đổi, thời điểm, dữ liệu trước/sau; không ghi đè âm thầm khi xung đột.

## 7. Bảng kiểm yêu cầu số lượng

| Nhóm bảo trì | Số lượng yêu cầu | Đạt yêu cầu tối thiểu |
| --- | ---: | --- |
| Hiệu chỉnh lỗi | 3 | Có |
| Thích ứng | 3 | Có |
| Hoàn thiện | 3 | Có |
| Dự phòng | 2 | Có |
| **Tổng** | **11** | **Có** |

## 8. Thứ tự triển khai đề xuất

1. HC-01, HC-02, HC-03.
2. TU-01, TU-02, TU-03.
3. HT-01, HT-02, HT-03.
4. DP-01, DP-02.

Mỗi yêu cầu khi triển khai cần cập nhật đồng thời: mã nguồn, kiểm thử, ảnh chứng minh trước/sau và các phần liên quan trong tài liệu phân tích tác động, đặc tả, thiết kế và kiểm thử.
