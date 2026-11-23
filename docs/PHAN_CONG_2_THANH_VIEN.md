# Phân công bảo trì - Nhóm 2 thành viên

> Thay `Thành viên A/B` bằng họ tên và MSSV trước khi đưa vào báo cáo.

## Nguyên tắc làm việc

- Không làm trực tiếp trên `main`.
- Mỗi người tạo nhánh riêng theo tên công việc, ví dụ `feature/member-a-validation`.
- Một yêu cầu chỉ có một người chịu trách nhiệm chính; người còn lại kiểm tra và chạy lại test.
- Mỗi phần hoàn thành phải gồm: source code, test case/ảnh minh chứng và cập nhật tài liệu liên quan.
- Chỉ hợp nhất vào `main` khi ứng dụng chạy được và không làm hỏng chức năng cũ.

## Phân công yêu cầu thay đổi

| Loại | Mã | Nội dung | Phụ trách chính | Kiểm tra chéo |
| --- | --- | --- | --- | --- |
| Hiệu chỉnh | HC-01 | Không chuyển ô số để trống thành `0`; hiển thị lỗi nhập liệu phù hợp. | Thành viên A | Thành viên B |
| Hiệu chỉnh | HC-02 | Sau khi xóa sản phẩm cuối ở trang cuối, tự chuyển về trang hợp lệ. | Thành viên B | Thành viên A |
| Hiệu chỉnh | HC-03 | Hiển thị rõ lỗi tải dashboard/thống kê thay vì để trống dữ liệu. | Thành viên B | Thành viên A |
| Thích ứng | TU-01 | Cấu hình được cổng frontend, backend và địa chỉ API qua biến môi trường. | Thành viên A | Thành viên B |
| Thích ứng | TU-02 | Bổ sung chế độ H2 lưu tệp để dữ liệu không mất khi dừng backend. | Thành viên B | Thành viên A |
| Thích ứng | TU-03 | Việt hóa giao diện và định dạng tiền tệ VND. | Thành viên A | Thành viên B |
| Hoàn thiện | HT-01 | Xuất danh sách sản phẩm ra CSV. | Thành viên B | Thành viên A |
| Hoàn thiện | HT-02 | Sắp xếp danh sách theo tên, số lượng, giá và giá trị tồn kho. | Thành viên A | Thành viên B |
| Hoàn thiện | HT-03 | Thêm nghiệp vụ điều chỉnh tồn kho thay vì sửa trực tiếp số lượng. | Thành viên B | Thành viên A |
| Dự phòng | DP-01 | Bổ sung xác thực và phân quyền thao tác thêm/sửa/xóa. | Thành viên A | Thành viên B |
| Dự phòng | DP-02 | Thêm lịch sử thay đổi và cơ chế tránh ghi đè khi cùng sửa dữ liệu. | Thành viên B | Thành viên A |

## Chia tài liệu báo cáo

| Hạng mục | Người soạn chính | Người rà soát |
| --- | --- | --- |
| Kế hoạch bảo trì và phân công công việc | Thành viên A | Thành viên B |
| Phân tích tác động của yêu cầu HC-01, TU-01, TU-03, HT-02, DP-01 | Thành viên A | Thành viên B |
| Phân tích tác động của yêu cầu HC-02, HC-03, TU-02, HT-01, HT-03, DP-02 | Thành viên B | Thành viên A |
| Đặc tả và thiết kế thay đổi | Người phụ trách yêu cầu tương ứng | Người còn lại |
| Tài liệu kiểm thử | Thành viên B | Thành viên A |
| Slide và kịch bản demo | Cùng thực hiện | Cùng rà soát |

## Quy trình đưa phần hoàn thành lên GitHub

```powershell
# Lấy thay đổi mới nhất
git switch main
git pull origin main

# Ví dụ Thành viên A bắt đầu một yêu cầu
git switch -c feature/member-a-validation

# Sau khi hoàn thành, kiểm tra và commit đúng phần đã làm
git status
git add <danh-sách-file-liên-quan>
git commit -m "fix: validate empty numeric product fields"
git push -u origin feature/member-a-validation
```

Sau đó tạo Pull Request từ nhánh `feature/...` vào `main`, để người còn lại kiểm tra trước khi hợp nhất. Nếu chưa dùng Pull Request, chỉ merge vào `main` sau khi cả hai đã cùng chạy lại ứng dụng.

## Tiêu chí hoàn thành một yêu cầu

- Có mô tả hiện trạng và ảnh/chứng cứ trước khi sửa.
- Có source code thay đổi và chạy được.
- Có test case với kết quả mong đợi và kết quả thực tế.
- Có ảnh/video ngắn chứng minh sau khi sửa.
- Đã cập nhật đúng phần tài liệu bảo trì liên quan.
