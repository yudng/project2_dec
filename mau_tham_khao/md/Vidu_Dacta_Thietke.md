ĐẶC TẢ
Thêm đơn vị điện lực
Mã yêu cầu REQ04
Tên yêu cầu Thêm đơn vị điện lực
Đối tượng sử dụng Phòng KH-KT Công ty Điện lực Cà Mau
Tiền điều kiện Phải đăng nhập thành công vào hệ thống với tài khoản
của phòng KH-KT.
Cách xử lí Bước 1: Nhập vào các thông tin(MaDV, TenDV,
TaiKhoan, MatKhau)
Bước 2: Chọn nút “Thêm” để tiến hành lưu thông tin
vào CSDL, nếu không có sự cố ngoài ý muốn, hệ thống
sẽ thông báo đơn vị thành viên đã được thêm thành
công, ngược lại nếu có sự cố xảy ra như: chưa nhập đầy
đủ các thông tin hoặc có một trường nào đó chưa nhập
đúng với yêu cầu định dạng đặt ra… hệ thống sẽ thống
báo cụ thể từng lỗi và tiếp tục Bước 1 cho đến khi thành
công hoặc người dùng chọn “Hủy” để hủy thao tác
nhập.
Kết quả Thêm thành công đơn vị thành viên hoặc thất bại
Ghi chú Bắt buộc phải nhập đầy đủ thông tin của các mục. Có
thể thêm bằng file excel.
Báo cáo:
Mã yêu cầu REQ07
Tên yêu cầu Báo cáo
Đối tượng sử dụng Phòng KH-KT Công ty Điện lực Cà Mau và các đơn vị
thành viên.
Tiền điều kiện Phải đăng nhập thành công vào hệ thống với tài khoản
của phòng KH-KT hoặc của các đơn vị thành viên.

Cách xử lí Bước 1: Vào phần Báo cáo, chọn Đơn vị và tình trạng.
Bước 2: Hệ thống sẽ dựa vào mục chọn, rồi lấy thông
tin từ CSDL, rồi thể hiện dữ liệu ra dạng bảng thống kê
trên màn hình. Trong trường hợp không có dữ liệu, hệ
thống sẽ xuất ra thông báo “Không có dữ liệu” để người
dùng nhận biết.
Bước 3: Chọn nút “Xuât file Excel”. Hệ thống sẽ in dữ
liệu theo một định dạng trước.
Kết quả Xuất file thành công hay thất bại
Ghi chú Trước khi xuất file, người dùng nên kiểm tra lại dữ liệu
đã xuất trên màn hình, tránh trường hợp nhầm lẫn. Phải
chọn một trong các mục báo cáo.

THIẾT KẾ
1. Thiết kế kiến trúc
Mô hình triển khai ứng dụng

Kiến trúc phần mềm - Mô hình MVC
Model (thành phần chứa tất cả các nghiệp vụ logic, phương thức xử lý, truy xuất
database, đối tượng mô tả dữ liệu như các Class, hàm xử lý...) viết cụ thể
View (thành phần đảm nhận việc hiển thị thông tin, tương tác với người dùng, nơi
chứa tất cả các đối tượng GUI như textbox, images...) viết cụ thể
Controlle (thành phần giữ nhiệm vụ nhận điều hướng các yêu cầu từ người dùng và
gọi đúng những phương thức xử lý chúng) viết cụ thể

2. Thiết kế dữ liệu

Miền  Chấp
|      |             |       |      |       | Khóa        |     |     | Mô tả  |
| ---- | ----------- | ----- | ---- | ----- | ----------- | --- | --- | ------ |
| Stt  | Thuộc tính  | Kiểu  | giá  | nhận  | Khóa Ngoại  |     |     |        |
|      |             |       |      |       | Chính       |     |     |        |
trị  Null
| 1   | Ma_DV      | Varchar  | 5    |     | <pk>  |     | Mã đơn vị           |     |
| --- | ---------- | -------- | ---- | --- | ----- | --- | ------------------- | --- |
| 2   | Ten_DV     | Varchar  | 100  | X   |       |     | Tên đơn vị          |     |
| 3   | TaiKhoan   | Varchar  | 10   | X   |       |     | Tài khoản           |     |
| 4   | MatKhau    | Varchar  | 10   | X   |       |     | Mật khẩu            |     |
| 5   | Quyen_SD   | Int      | 5    |     |       |     | Quyền sử dụng       |     |
| 6   | SuDung_DV  | Int      | 1    |     |       |     | ĐV đang hoạt động   |     |
| 7   | ???        |          |      |     |       |     |                     |     |

3. Thiết kế chức năng
Cập nhật Đơn vị
  Mục đích: Giúp cho các đơn vị cập nhật thông tin Trạm mà đơn vị đó quản
lý bao gồm thêm, sửa, xóa Đơn vị điện lực.
  Giao diện:

   Các thành phần trong giao diện :
| STT  Loại điều khiển  | Nội dung  | Lưu ý                                |
| --------------------- | --------- | ------------------------------------ |
| 1  Button             | Thêm      | Click khi muốn thêm Đơn vị mới       |
| 2  Button             | Sửa       | Click khi muốn sửa thông tin Đơn vị  |
| 3  Button             | Xóa       | Click khi muốn xóa Đơn vị            |
| 4  Button             | Hủy       | Click khi muốn hủy công việc đang    |
thực hiện. form thông tin sẽ reset lại
5  Input, type=’text’  Mã đơn vị  Bắt buộc nhập, tối đa 5 ký tự
6  Input, type=’text’  Tên đơn vị  Bắt buộc nhập, tối đa 100 ký tự
7  Input, type=’text’  Tài khoản  Bắt buộc nhập, tối đa 10 ký tự
| 8  Input,  | Mật khẩu  | Bắt buộc nhập, tối đa 10 ký tự  |
| ---------- | --------- | ------------------------------- |
type=’password’

9 Input, type=’text’ Quyền sử Bắt buộc nhập, tối đa 1 ký tự số
dụng
???
 Ghi chú chung:
Các thao tác thêm, sửa, xóa dữ liệu hoàn thành khi nhấn các chức năng tương
ứng và mọi sự thay đổi sẽ được thể hiện ngay trên bảng dữ liệu.
Mỗi lần thay đổi thông tin, phải nhập lại Mật khẩu để tránh sai sót và mật khẩu
được bảo mật.
Quyền sử dụng thể hiện mức độ quyền thao tác trên hệ thống, cao nhất là 1,
thấp nhất là 3.
 Sử dụng dữ liệu :
Phương thức
STT Bảng
Thêm Sửa Xóa Truy vấn
1 DonVi x x x x
 Cách xử lý
Bắt Đầu
Lấy Thông Tin Đơn vị
Thêm, Sửa Xóa
Nhập thông Lưu
tin Đơn vị
Kiểm Tra Thông Tin
Sai Đúng
Thông Báo Cập nhật lại dữ liệu
Lỗi trên màn hình
Kết thúc