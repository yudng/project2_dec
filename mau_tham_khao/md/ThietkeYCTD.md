Thiết Kế Phần Mềm Bảo Trì
cho
<Dự Án >
Phiên bản X.X được phê chuẩn
Được chuẩn bị bởi <Tác giả>
<Tổ chức>
<Ngày tạo ra bản đặc tả>

Thiết kế phần mềm bảo trì Page ii
Mục Lục
Mục Lục ........................................................................................................................................ ii
Theo dõi phiên bản tài liệu ..................................................................................................... iii
1. Giới thiệu .................................................................................................................................1
1.1 Mục đích .........................................................................................................................1
1.2 Nhóm người đọc ...........................................................................................................1
1.3 Phạm vi sản phẩm ........................................................................................................1
1.4 Bảng chú giải thuật ngữ ...............................................................................................1
1.5 Tài liệu tham khảo .........................................................................................................1
1.6 Qui ước về cách trình bày ...........................................................................................1
2. Kiến trúc hệ thống ................................................................................................................2
2.1 Thiết kế kiến trúc ...........................................................................................................2
2.2 Mô tả sự phân rã ...........................................................................................................2
2.3 Cơ sở thiết kế ................................................................................................................2
3. Thiết kế dữ liệu ......................................................................................................................3
3.1 Mô tả dữ liệu ..................................................................................................................3
3.2 Từ điển dữ liệu ..............................................................................................................3
4. Thiết kế theo chức năng .....................................................................................................3
4.1 Những thiết kế cho các chức năng cần được điều chỉnh ......................................3
4.2 Những thiết kế cho các chức năng mới ....................................................................4
5. Bảng tham khảo tới các yêu cầu ......................................................................................4
Bài tập nhóm số 02 - học phần Bảo trì phần mềm, Khoa CNTT&TT, Đại học Cần Thơ

| Thiết kế phần mềm bảo trì  |     |     |     | Page iii  |
| -------------------------- | --- | --- | --- | --------- |
Theo dõi phiên bản tài liệu
| Tên  | Ngày  | Lý do thay đổi  |     | Phiên bản  |
| ---- | ----- | --------------- | --- | ---------- |
|      |       |                 |     |            |
|      |       |                 |     |            |

Bài tập nhóm số 02 - học phần Bảo trì phần mềm, Khoa CNTT&TT, Đại học Cần Thơ

Thiết kế phần mềm bảo trì Page 1
1. Giới thiệu
1.1 Mục đích
<Trình bày mục tiêu của tài liệu thiết kế phần mềm bảo trì.>
1.2 Nhóm người đọc
<Xác định các nhóm người đọc tài liệu này (VD: lập trình viên, kiểm thử viên, người quản lý, v.v.).
Mô tả nội dung và cách tổ chức các phần còn lại của tài liệu này. Đề xuất các đề mục nên đọc với
từng nhóm người đọc.>
1.3 Phạm vi sản phẩm
<Cung cấp một mô tả ngắn về phần mềm bảo trì sẽ được thiết kế và mục đích của nó, bao gồm
các lợi ích, mục tiêu liên quan. Liên hệ phần mềm với các mục tiêu hợp tác. >
1.4 Bảng chú giải thuật ngữ
<Định nghĩa các từ viết tắt, các thuật ngữ được sử dụng trong tài liệu
STT Thuật ngữ / Từ viết tắt Định nghĩa / Mô tả
>
1.5 Tài liệu tham khảo
<Liệt kê ra bất cứ tài liệu hay địa chỉ website nào mà bản thiết kế này tham khảo tới. Ta phải cung
cấp đủ thông tin để người đọc có thể tìm bản sao của từng tài liệu tham khảo, bao gồm: tiêu đề,
tác giả, số phiên bản, ngày, nguồn hay nơi cung cấp. >
1.6 Qui ước về cách trình bày
<Ta cần quy ước cách thức dùng font chữ, kích cỡ chữ, màu chữ, v.v để người đọc có thể phân
biệt được ngay những điểm cần điều chỉnh, điểm mới trong thiết kế.>
Bài tập nhóm số 02 - học phần Bảo trì phần mềm, Khoa CNTT&TT, Đại học Cần Thơ

Thiết kế phần mềm bảo trì Page 2
2. Kiến trúc hệ thống
2.1 Thiết kế kiến trúc
< Thiết kế kiến trúc: Phát triển một cấu trúc chương trình theo mô đun và giải thích các mối quan
hệ giữa các mô đun để đạt được chức năng hoàn chỉnh của hệ thống. Đây là sự tổng quan mức
cao về cách thức các trách nhiệm của hệ thống được phân chia và sau đó gán chúng cho các hệ
thống con. Định danh từng hệ thống con mức cao và các vai trò hay các trách nhiệm được gán
cho nó. Mô tả cách thức các hệ thống con cộng tác với nhau để đạt được chức năng mong đợi.
Không đi quá chi tiết vào từng hệ thống con. Mục đích chính là đạt được một sự hiểu biết chung
về cách thức và lý do hệ thống được phân rã, và cách thức các thành phần riêng lẻ làm việc cùng
nhau. Cung cấp một sơ đồ chỉ ra các các hệ thống con chính và các kho dữ liệu và sự nối kết
giữa chúng. Mô tả sơ đồ nếu thấy cần thiết.
Lưu ý: Vẽ lại thiết kế kiến trúc nếu có các chỉnh sửa, bổ sung. Cần phải sử dụng màu sắc,
font chữ, ghi chú, v.v để người đọc nhìn thấy ngay được những điểm khác biệt so với thiết
kế kiến trúc gốc.
>
2.2 Mô tả sự phân rã
<Mô tả sự phân rã: Cung cấp sự phân rã của các hệ thống con trong thiết kế kiến trúc. Bổ sung
bằng văn bản nếu thấy cần. Bạn có thể lựa chọn cách mô tả theo chức năng hoặc mô tả theo
hướng đối tượng. Đối với mô tả chức năng, sử dụng lưu đồ dòng dữ liệu và các sơ đồ phân rã
cấu trúc. Đối với mô tả theo hướng đối tượng, sử dụng mô hình hệ thống con, các sơ đồ đối
tượng, sơ đồ phân cấp tổng quát hóa (nếu có), sơ đồ phân cấp kết hợp (nếu có), các đặc tả giao
diện và các sơ đồ tuần tự.
Lưu ý: Mô tả lại sự phân rã nếu có các chỉnh sửa, bổ sung. Cần phải sử dụng màu sắc, font
chữ, ghi chú, v.v để người đọc nhìn thấy ngay được những điểm khác biệt so với sự mô tả
gốc.
>
2.3 Cơ sở thiết kế
<Cơ sở thiết kế: Thảo luận lý do cơ bản cho việc chọn lựa kiến trúc được mô tả trong mục 2.1
bao gồm các vấn đề quan trọng và các thỏa hiệp được cân nhắc. Bạn có thể thảo luận các kiến
trúc khác mà chúng được cân nhắc, miễn là bạn giải thích được tại sao bạn không chọn chúng.
Lưu ý: Bổ sung thêm cơ sở thiết kế (nếu có). Cần phải sử dụng màu sắc, font chữ, ghi chú,
v.v để người đọc nhìn thấy ngay được những điểm khác biệt so với sự mô tả gốc.
>
Bài tập nhóm số 02 - học phần Bảo trì phần mềm, Khoa CNTT&TT, Đại học Cần Thơ

| Thiết kế phần mềm bảo trì  |     |     |     |     |     |     | Page 3  |
| -------------------------- | --- | --- | --- | --- | --- | --- | ------- |
3. Thiết kế dữ liệu
3.1  Mô tả dữ liệu
<Giải thích cách thức lĩnh vực thông tin của hệ thống được chuyển sang các cấu trúc dữ liệu. Mô
tả cách thức dữ liệu chính hay các thực thể của hệ thống được lưu trữ, được xử lý và được tổ
chức. Liệt kê các cơ sở dữ liệu hay các mục lưu trữ dữ liệu.

Lưu ý: Vẽ lại các mô hình (VD: mô hình thực thể - quan hệ, sơ đồ lớp, v.v.) nếu có các
chỉnh sửa, bổ sung. Cần phải sử dụng màu sắc, font chữ, ghi chú, v.v để người đọc nhìn
thấy ngay được những điểm khác biệt so với thiết kế dữ liệu gốc.
>
3.2  Từ điển dữ liệu
<Liệt kê theo bảng chữ cái các thực thể của hệ thống hay dữ liệu chính cùng với kiểu và các mô
tả chúng. Nếu bạn đã sử dụng mô tả theo chức năng trong mục 2.2, liệt kê tất cả các chức năng
và các đối số. Nếu bạn đã sử dụng mô tả theo hướng đối tượng, liệt kê tất cả các đối tượng , các
thuộc tính, các phương thức, và các đối số của phương thức theo từng đối tượng.>
4. Thiết kế theo chức năng
4.1  Những thiết kế cho các chức năng cần được điều chỉnh
4.1.1  Chức năng XX (XX: tên cụ thể)
< Lưu ý: Trình bày theo các mục như dưới đây. Cần phải sử dụng màu sắc, font chữ, ghi
chú, v.v để người đọc nhìn thấy ngay được những điểm khác biệt so với thiết kế gốc.

-  Mã số thiết kế gốc: (mã số đã có trong tài liệu thiết kế cũ – tài liệu đi kèm với chương trình cần
bảo trì)
| -   | Mục đích:   |     |     |     |     |     |     |
| --- | ----------- | --- | --- | --- | --- | --- | --- |
-  Giao diện: Hiển thị các ảnh giao diện từ góc nhìn của người sử dụng. Chúng có thể
được vẽ bằng tay hay dùng công cụ vẽ tự động. Tạo ra chúng chính xác như có thể.
| -   | Các thành phần trong giao diện:  |     |     |     |     |     |     |
| --- | -------------------------------- | --- | --- | --- | --- | --- | --- |

|     | STT  | Loại điều khiển  | Giá trị mặc định  |     |     | Lưu ý  |     |
| --- | ---- | ---------------- | ----------------- | --- | --- | ------ | --- |
|     |      |                  |                   |     |     |        |     |

| -   | Sử dụng dữ liệu  |     |     |     |     |     |     |
| --- | ---------------- | --- | --- | --- | --- | --- | --- |
Phương thức
|     | STT  | Tên bảng  |       |      |      |           |     |
| --- | ---- | --------- | ----- | ---- | ---- | --------- | --- |
|     |      |           | Thêm  | Sửa  | Xóa  | Truy vấn  |     |
|     |      |           |       |      |      |           |     |

-  Cách xử lý: Giải thích bằng lời hoặc vẽ sơ đồ mô tả dòng xử lý trên giao diện.
-  Hàm/ sự kiện (nếu có): Mô tả giải thuật cho từng biến cố bằng sơ đồ hoặc bằng ngôn
ngữ giả.
Bài tập nhóm số 02 - học phần Bảo trì phần mềm, Khoa CNTT&TT, Đại học Cần Thơ

| Thiết kế phần mềm bảo trì  |                           |     |     |     |     |     | Page 4  |
| -------------------------- | ------------------------- | --- | --- | --- | --- | --- | ------- |
| -                          | Các ràng buộc (nếu có):   |     |     |     |     |     |         |
>
4.1.2  Chức năng YY (YY: tên cụ thể)
<Có các mục tương tự như chức năng XX>
4.1.3  …
4.2  Những thiết kế cho các chức năng mới
4.2.1  Chức năng XX (XX: tên cụ thể)
<
| -   | Mục đích:   |     |     |     |     |     |     |
| --- | ----------- | --- | --- | --- | --- | --- | --- |
-  Giao diện: Hiển thị các ảnh giao diện từ góc nhìn của người sử dụng. Chúng có thể
được vẽ bằng tay hay dùng công cụ vẽ tự động. Tạo ra chúng chính xác như có thể.
| -   | Các thành phần trong giao diện:  |     |     |     |     |     |     |
| --- | -------------------------------- | --- | --- | --- | --- | --- | --- |

|     | STT  | Loại điều khiển  | Giá trị mặc định  |     |     | Lưu ý  |     |
| --- | ---- | ---------------- | ----------------- | --- | --- | ------ | --- |
|     |      |                  |                   |     |     |        |     |

| -   | Sử dụng dữ liệu  |     |     |     |     |     |     |
| --- | ---------------- | --- | --- | --- | --- | --- | --- |
Phương thức
|     | STT  | Tên bảng  |       |      |      |           |     |
| --- | ---- | --------- | ----- | ---- | ---- | --------- | --- |
|     |      |           | Thêm  | Sửa  | Xóa  | Truy vấn  |     |
|     |      |           |       |      |      |           |     |

-  Cách xử lý: Giải thích bằng lời hoặc vẽ sơ đồ mô tả dòng xử lý trên giao diện.
-  Hàm/ sự kiện (nếu có): Mô tả giải thuật cho từng biến cố bằng sơ đồ hoặc bằng ngôn
ngữ giả.
| -   | Các ràng buộc (nếu có):   |     |     |     |     |     |     |
| --- | ------------------------- | --- | --- | --- | --- | --- | --- |
>
4.2.2  Chức năng YY (YY: tên cụ thể)
<Có các mục tương tự như chức năng XX>
4.2.3  …
5. Bảng tham khảo tới các yêu cầu
<Sử dụng theo định dạng bảng để chỉ ra thành phần nào của hệ thống đáp ứng từng yêu cầu
chức năng trong tài liệu đặc tả yêu cầu phần mềm. Tham chiếu tới các yêu cầu chức năng thông
qua mã số mà bạn đã gán cho chúng trong tài liệu đặc tả.

Lưu ý: Cập nhật lại bảng tham khảo cho các yêu cầu được điều chỉnh hoặc yêu cầu mới
thông qua việc sử dụng màu sắc, font chữ, ghi chú, v.v để người đọc nhìn thấy ngay được
những điểm khác biệt so với bảng tham khảo gốc.  >
Bài tập nhóm số 02 - học phần Bảo trì phần mềm, Khoa CNTT&TT, Đại học Cần Thơ