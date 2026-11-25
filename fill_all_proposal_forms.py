import copy
import os
import shutil
import tempfile
import zipfile
import xml.etree.ElementTree as ET

SOURCE = r"D:\yudtime\2026\BaNghi\Project2\Project 2\Phantichsutacdong.docx"
BACKUP = r"D:\yudtime\2026\BaNghi\Project2\Project 2\Phantichsutacdong_truoc_khi_dien.docx"
NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
ET.register_namespace("w", NS)

FORMS = [
    ("HC-01", "Chuẩn hóa và kiểm tra mã SKU", [
        "Mã SKU chưa được chuẩn hóa khoảng trắng, chữ hoa và chữ thường.",
        "Người dùng có thể tạo hai mã hàng về bản chất là giống nhau.",
    ], [
        "Chuẩn hóa mã SKU bằng cách bỏ khoảng trắng đầu/cuối và chuyển sang chữ hoa.",
        "Kiểm tra trùng mã không phân biệt chữ hoa, chữ thường trước khi lưu.",
    ], ["Yêu cầu thuộc nhóm bảo trì hiệu chỉnh lỗi.", "Cần kiểm thử thêm, sửa và báo lỗi mã SKU trùng."]),
    ("HC-02", "Khắc phục phân trang sau khi xóa", [
        "Khi xóa sản phẩm cuối cùng ở trang cuối, hệ thống vẫn giữ trang hiện tại.",
        "Bảng thông báo không tìm thấy sản phẩm dù dashboard vẫn còn dữ liệu.",
    ], [
        "Sau khi xóa, hệ thống phải kiểm tra số lượng sản phẩm còn lại trên trang hiện tại.",
        "Nếu trang hiện tại rỗng và vẫn còn trang trước, tự động chuyển về trang hợp lệ gần nhất.",
    ], ["Yêu cầu thuộc nhóm bảo trì hiệu chỉnh lỗi.", "Kiểm thử lại tìm kiếm, lọc danh mục và phân trang sau khi sửa."]),
    ("HC-03", "Thông báo lỗi dashboard", [
        "Khi API thống kê lỗi, dashboard chỉ hiện dấu gạch ngang.",
        "Thông báo chung không giúp người dùng biết phần thống kê không tải được.",
    ], [
        "Hiển thị thông báo lỗi riêng cho khu vực dashboard.",
        "Bổ sung nút thử lại để người dùng tải lại số liệu thống kê.",
    ], ["Yêu cầu thuộc nhóm bảo trì hiệu chỉnh lỗi.", "Cần kiểm thử khi backend ngừng hoạt động hoặc API trả về lỗi."]),
    ("TU-01", "Cấu hình cổng và địa chỉ API", [
        "Cổng chạy và địa chỉ API đang phụ thuộc vào cấu hình cố định.",
        "Dễ xảy ra xung đột khi chạy cùng các dự án khác trên một máy.",
    ], [
        "Cho phép cấu hình cổng backend, frontend và địa chỉ API qua biến môi trường.",
        "Cập nhật file cấu hình mẫu và hướng dẫn chạy hệ thống.",
    ], ["Yêu cầu thuộc nhóm bảo trì thích ứng.", "Không thay đổi dữ liệu và không sử dụng Docker trong phạm vi hiện tại."]),
    ("TU-02", "Lưu trữ dữ liệu H2 dạng tệp", [
        "Cơ sở dữ liệu H2 hiện chạy trong bộ nhớ nên dữ liệu mất khi backend khởi động lại.",
        "Thử nghiệm thực tế cho thấy hệ thống quay lại dữ liệu mẫu sau khi restart.",
    ], [
        "Bổ sung cấu hình H2 lưu dữ liệu theo tệp để dữ liệu tồn tại sau khi khởi động lại.",
        "Cung cấp hướng dẫn chọn profile phù hợp cho môi trường chạy.",
    ], ["Yêu cầu thuộc nhóm bảo trì thích ứng.", "Cần sao lưu tệp dữ liệu trước khi thay đổi cấu hình cơ sở dữ liệu."]),
    ("TU-03", "Việt hóa giao diện và định dạng VND", [
        "Giao diện hiện dùng tiếng Anh và giá tiền hiển thị theo USD.",
        "Cách hiển thị chưa phù hợp với người dùng Việt Nam.",
    ], [
        "Việt hóa các nhãn, nút bấm và thông báo của giao diện.",
        "Định dạng giá trị tiền tệ theo đồng Việt Nam.",
    ], ["Yêu cầu thuộc nhóm bảo trì thích ứng.", "Cần rà soát toàn bộ chuỗi hiển thị sau khi thay đổi."]),
    ("HT-01", "Xuất danh sách sản phẩm CSV", [
        "Hệ thống chưa hỗ trợ xuất danh sách sản phẩm phục vụ báo cáo hoặc lưu trữ.",
    ], [
        "Bổ sung chức năng xuất danh sách sản phẩm theo điều kiện lọc hiện hành ra tệp CSV.",
        "Tệp xuất cần gồm mã SKU, tên, danh mục, số lượng, giá và giá trị tồn kho.",
    ], ["Yêu cầu thuộc nhóm bảo trì hoàn thiện.", "Cần kiểm thử nội dung, tên tệp và dữ liệu bộ lọc trong tệp CSV."]),
    ("HT-02", "Sắp xếp danh sách sản phẩm", [
        "Danh sách hiện chỉ hiển thị theo thứ tự mặc định và không cho người dùng lựa chọn.",
    ], [
        "Cho phép sắp xếp theo tên, số lượng, giá và giá trị tồn kho.",
        "Cho phép chọn chiều tăng dần hoặc giảm dần cùng với tìm kiếm và phân trang.",
    ], ["Yêu cầu thuộc nhóm bảo trì hoàn thiện.", "Cần giới hạn các trường sắp xếp hợp lệ để tránh lỗi API."]),
    ("HT-03", "Điều chỉnh tồn kho có lý do", [
        "Người dùng sửa trực tiếp số lượng sản phẩm và không lưu nguyên nhân thay đổi.",
        "Không phân biệt được tăng kho do nhập hàng hay giảm kho do kiểm kê/bán hàng.",
    ], [
        "Bổ sung chức năng điều chỉnh tăng hoặc giảm tồn kho.",
        "Người dùng phải nhập số lượng điều chỉnh và lý do; hệ thống lưu lại lịch sử.",
    ], ["Yêu cầu thuộc nhóm bảo trì hoàn thiện.", "Không cho phép số lượng tồn kho sau điều chỉnh nhỏ hơn không."]),
    ("DP-01", "Xác thực và phân quyền", [
        "Bất kỳ ai mở ứng dụng đều có thể thêm, sửa hoặc xóa sản phẩm.",
    ], [
        "Bổ sung đăng nhập và phân quyền theo vai trò người dùng.",
        "Chỉ người có quyền quản trị mới được thêm, sửa hoặc xóa dữ liệu.",
    ], ["Yêu cầu thuộc nhóm bảo trì dự phòng.", "Không ghi mật khẩu dạng văn bản thuần; cần dùng cơ chế mã hóa phù hợp."]),
    ("DP-02", "Nhật ký và chống ghi đè dữ liệu", [
        "Hệ thống không lưu lịch sử thay đổi sản phẩm.",
        "Hai người dùng cùng sửa một sản phẩm có thể ghi đè dữ liệu của nhau.",
    ], [
        "Ghi nhật ký thay đổi gồm người thực hiện, thời gian và nội dung thay đổi.",
        "Bổ sung cơ chế phát hiện xung đột khi dữ liệu đã được người khác cập nhật.",
    ], ["Yêu cầu thuộc nhóm bảo trì dự phòng.", "Cần kiểm thử tình huống hai người dùng cập nhật cùng một sản phẩm."]),
]

def text_of(node):
    return "".join(x.text or "" for x in node.iter(f"{{{NS}}}t"))

def set_text(paragraph, value):
    items = list(paragraph.iter(f"{{{NS}}}t"))
    if not items:
        run = ET.SubElement(paragraph, f"{{{NS}}}r")
        items = [ET.SubElement(run, f"{{{NS}}}t")]
    items[0].text = value
    for item in items[1:]:
        item.text = ""

def replace_tail(paragraph, value):
    items = list(paragraph.iter(f"{{{NS}}}t"))
    items[-1].text = value

def fill_form(table, code, title, current, requested, notes):
    paragraphs = list(table.iter(f"{{{NS}}}p"))
    if len(paragraphs) < 27 or text_of(paragraphs[0]) != "PHIẾU ĐỀ XUẤT YÊU CẦU THAY ĐỔI":
        raise RuntimeError("Không nhận diện được đúng biểu mẫu đề xuất trong template.")
    replace_tail(paragraphs[1], f": {code}")
    replace_tail(paragraphs[2], "Inventory Manager")
    replace_tail(paragraphs[3], "Nhóm thực hiện")
    replace_tail(paragraphs[4], "24/11/2026")
    set_text(paragraphs[6], "Khoa Công nghệ Thông tin và Truyền thông")
    set_text(paragraphs[7], "Đại học Cần Thơ")
    set_text(paragraphs[8], "")
    replace_tail(paragraphs[9], "<Số điện thoại đại diện nhóm>")
    replace_tail(paragraphs[10], "<Email đại diện nhóm>")
    for offset, line in enumerate(current):
        set_text(paragraphs[12 + offset], line)
    for offset in range(len(current), 5):
        set_text(paragraphs[12 + offset], "")
    for offset, line in enumerate(requested):
        set_text(paragraphs[18 + offset], line)
    for offset in range(len(requested), 5):
        set_text(paragraphs[18 + offset], "")
    for offset, line in enumerate(notes):
        set_text(paragraphs[24 + offset], line)
    for offset in range(len(notes), 3):
        set_text(paragraphs[24 + offset], "")

def page_break():
    p = ET.Element(f"{{{NS}}}p")
    r = ET.SubElement(p, f"{{{NS}}}r")
    br = ET.SubElement(r, f"{{{NS}}}br")
    br.set(f"{{{NS}}}type", "page")
    return p

if not os.path.exists(BACKUP):
    shutil.copy2(SOURCE, BACKUP)

with zipfile.ZipFile(SOURCE, "r") as zin:
    root = ET.fromstring(zin.read("word/document.xml"))

body = root.find(f"{{{NS}}}body")
template = next(table for table in body.iter(f"{{{NS}}}tbl") if "PHIẾU ĐỀ XUẤT YÊU CẦU THAY ĐỔI" in text_of(table))
position = list(body).index(template)
body.remove(template)

for index, item in enumerate(FORMS):
    cloned = copy.deepcopy(template)
    fill_form(cloned, *item)
    if index:
        body.insert(position, page_break())
        position += 1
    body.insert(position, cloned)
    position += 1

updated = ET.tostring(root, encoding="utf-8", xml_declaration=True)
fd, temporary = tempfile.mkstemp(suffix=".docx")
os.close(fd)
try:
    with zipfile.ZipFile(temporary, "w", zipfile.ZIP_DEFLATED) as zout:
        with zipfile.ZipFile(SOURCE, "r") as zin:
            for item in zin.infolist():
                zout.writestr(item, updated if item.filename == "word/document.xml" else zin.read(item.filename))
    shutil.move(temporary, SOURCE)
finally:
    if os.path.exists(temporary):
        os.remove(temporary)

print("Đã điền 11 phiếu đề xuất theo đúng bảng mẫu gốc.")
