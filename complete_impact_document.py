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

REQUESTS = [
    {"code":"HC-01", "title":"Chuẩn hóa và kiểm tra mã SKU", "kind":"Bảo trì hiệu chỉnh lỗi", "priority":"Cao", "impact":"ProductFormModal, ProductService, ProductRepository, test CRUD và tài liệu kiểm thử.", "solution":"Chuẩn hóa trim và chữ hoa trước khi kiểm tra/lưu SKU; kiểm tra trùng không phân biệt chữ hoa, chữ thường."},
    {"code":"HC-02", "title":"Khắc phục phân trang sau khi xóa", "kind":"Bảo trì hiệu chỉnh lỗi", "priority":"Cao", "impact":"App.tsx, ProductTable, luồng xóa sản phẩm, phân trang và test giao diện.", "solution":"Sau khi xóa, nếu trang hiện tại rỗng thì tự tải lại trang hợp lệ gần nhất."},
    {"code":"HC-03", "title":"Thông báo lỗi dashboard", "kind":"Bảo trì hiệu chỉnh lỗi", "priority":"Trung bình", "impact":"Dashboard, App.tsx, API client và kiểm thử lỗi kết nối/API.", "solution":"Lưu trạng thái lỗi dashboard, hiển thị thông báo riêng và nút thử lại."},
    {"code":"TU-01", "title":"Cấu hình cổng và địa chỉ API", "kind":"Bảo trì thích ứng", "priority":"Cao", "impact":"application.yml, vite.config.ts, .env.example, README và kiểm thử chạy đa môi trường.", "solution":"Đọc cổng và API URL từ biến môi trường; cung cấp cấu hình mẫu."},
    {"code":"TU-02", "title":"Lưu trữ dữ liệu H2 dạng tệp", "kind":"Bảo trì thích ứng", "priority":"Cao", "impact":"application.yml, profile cơ sở dữ liệu, README và kiểm thử restart backend.", "solution":"Bổ sung profile H2 file-based để dữ liệu tồn tại sau khi khởi động lại."},
    {"code":"TU-03", "title":"Việt hóa giao diện và định dạng VND", "kind":"Bảo trì thích ứng", "priority":"Trung bình", "impact":"Các component React, thông báo, hàm định dạng tiền tệ và test giao diện.", "solution":"Việt hóa toàn bộ chuỗi hiển thị và định dạng tiền tệ theo VND."},
    {"code":"HT-01", "title":"Xuất danh sách sản phẩm CSV", "kind":"Bảo trì hoàn thiện", "priority":"Trung bình", "impact":"ProductController, ProductService, API xuất tệp, nút frontend và kiểm thử CSV.", "solution":"Thêm API và nút xuất dữ liệu sản phẩm đang lọc ra tệp CSV."},
    {"code":"HT-02", "title":"Sắp xếp danh sách sản phẩm", "kind":"Bảo trì hoàn thiện", "priority":"Trung bình", "impact":"ProductController, ProductRepository, App.tsx, SearchFilterBar và kiểm thử phân trang.", "solution":"Cho chọn cột sắp xếp hợp lệ và chiều tăng/giảm, kết hợp với lọc/phân trang."},
    {"code":"HT-03", "title":"Điều chỉnh tồn kho có lý do", "kind":"Bảo trì hoàn thiện", "priority":"Cao", "impact":"Entity dữ liệu, service, API nghiệp vụ, modal giao diện và kiểm thử lịch sử tồn kho.", "solution":"Thêm thao tác tăng/giảm tồn kho, yêu cầu lý do và lưu lịch sử điều chỉnh."},
    {"code":"DP-01", "title":"Xác thực và phân quyền", "kind":"Bảo trì dự phòng", "priority":"Cao", "impact":"Spring Security, entity người dùng, API auth, route frontend và test bảo mật.", "solution":"Bổ sung đăng nhập, vai trò người dùng và bảo vệ thao tác thêm/sửa/xóa."},
    {"code":"DP-02", "title":"Nhật ký và chống ghi đè dữ liệu", "kind":"Bảo trì dự phòng", "priority":"Cao", "impact":"Entity Product, bảng audit, service cập nhật, xử lý xung đột và test đồng thời.", "solution":"Ghi audit log và dùng optimistic locking để phát hiện xung đột cập nhật."},
]

def text_of(node):
    return "".join(x.text or "" for x in node.iter(f"{{{NS}}}t"))

def paragraphs(node):
    return list(node.iter(f"{{{NS}}}p"))

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
    if not items:
        set_text(paragraph, value)
    else:
        items[-1].text = value

def blank_paragraph():
    return ET.Element(f"{{{NS}}}p")

def page_break():
    p = ET.Element(f"{{{NS}}}p")
    r = ET.SubElement(p, f"{{{NS}}}r")
    br = ET.SubElement(r, f"{{{NS}}}br")
    br.set(f"{{{NS}}}type", "page")
    return p

def fill_receipt(table, item):
    p = paragraphs(table)
    replace_tail(p[1], f": {item['code']}")
    set_text(p[3], "Nhóm thực hiện")
    set_text(p[5], "24/11/2026")
    set_text(p[7], "Khoa Công nghệ Thông tin và Truyền thông")
    set_text(p[8], "Đại học Cần Thơ")
    set_text(p[9], "")
    replace_tail(p[10], "<Số điện thoại đại diện nhóm>")
    replace_tail(p[11], "<Email đại diện nhóm>")
    set_text(p[13], "Chức năng quản lý sản phẩm hiện có")
    set_text(p[15], item['kind'])
    set_text(p[16], item['title'])
    set_text(p[18], f"Ưu tiên {item['priority'].lower()} do ảnh hưởng trực tiếp đến việc vận hành hệ thống.")
    set_text(p[19], "Được đưa vào phạm vi bảo trì phiên bản 1.0.")
    set_text(p[21], "Đã tiếp nhận để phân tích tác động và lập kế hoạch triển khai.")
    set_text(p[22], "")

def fill_analysis(first, second, item):
    p = paragraphs(first)
    replace_tail(p[1], f": {item['code']}")
    set_text(p[3], "Nhóm thực hiện")
    set_text(p[5], "24/11/2026")
    set_text(p[7], "Khoa Công nghệ Thông tin và Truyền thông")
    set_text(p[8], "Đại học Cần Thơ")
    set_text(p[9], "")
    replace_tail(p[10], "<Số điện thoại đại diện nhóm>")
    replace_tail(p[11], "<Email đại diện nhóm>")
    set_text(p[13], item['kind'])
    set_text(p[15], item['impact'])
    set_text(p[16], "Tài liệu đặc tả yêu cầu, thiết kế, kiểm thử, hướng dẫn sử dụng và kịch bản demo.")
    set_text(p[17], "Các chức năng CRUD, tìm kiếm, lọc và phân trang liên quan cần được kiểm thử hồi quy.")

    q = paragraphs(second)
    set_text(q[1], f"Thay đổi có phạm vi {item['priority'].lower()}; cần cập nhật mã nguồn, test case và tài liệu liên quan.")
    set_text(q[2], "Không thay đổi phạm vi nghiệp vụ ngoài yêu cầu đã tiếp nhận.")
    set_text(q[3], "")
    set_text(q[5], f"Giải pháp 1: {item['solution']} Nhân lực: 01 lập trình viên, 01 kiểm thử viên.")
    set_text(q[6], "Công cụ: Java 21, Maven, Node.js, React và trình duyệt; thời gian dự kiến 0,5–2 ngày; sử dụng công cụ mã nguồn mở.")
    set_text(q[9], f"Chọn Giải pháp 1 vì xử lý trực tiếp nguyên nhân và có thể kiểm thử, bảo trì lâu dài: {item['solution']}")
    set_text(q[10], "Giải pháp 2 chỉ hướng dẫn thao tác thủ công, không xử lý nguyên nhân gốc nên không được chọn.")
    set_text(q[12], "Cần chạy kiểm thử hồi quy trước khi hợp nhất thay đổi vào phiên bản chính.")
    set_text(q[13], "")

def fill_approval(table, item):
    p = paragraphs(table)
    replace_tail(p[1], f": {item['code']}")
    set_text(p[3], "Nhóm thực hiện")
    set_text(p[4], "<Giảng viên hướng dẫn nếu có>")
    set_text(p[7], "24/11/2026")
    set_text(p[9], "Khoa Công nghệ Thông tin và Truyền thông")
    set_text(p[10], "Đại học Cần Thơ")
    set_text(p[11], "")
    replace_tail(p[12], "<Số điện thoại đại diện nhóm>")
    replace_tail(p[13], "<Email đại diện nhóm>")
    set_text(p[15], f"Chấp nhận yêu cầu {item['code']} - {item['title']} để triển khai trong phiên bản 1.0.")
    set_text(p[16], f"Mức ưu tiên: {item['priority']}. Thực hiện theo phân tích tác động đã được lập.")
    set_text(p[17], "")
    set_text(p[19], "Yêu cầu phải có mã nguồn, kiểm thử và bằng chứng trước/sau khi hoàn thành.")
    set_text(p[20], "")

def clone_table_series(body, template, filler):
    position = list(body).index(template)
    body.remove(template)
    for index, item in enumerate(REQUESTS):
        if index:
            body.insert(position, page_break())
            position += 1
        cloned = copy.deepcopy(template)
        filler(cloned, item)
        body.insert(position, cloned)
        position += 1

if not os.path.exists(BACKUP):
    shutil.copy2(SOURCE, BACKUP)

with zipfile.ZipFile(SOURCE, "r") as zin:
    root = ET.fromstring(zin.read("word/document.xml"))

# Fill introductory prose without changing the existing paragraph styles.
for paragraph in root.iter(f"{{{NS}}}p"):
    text = text_of(paragraph)
    if text.startswith("<Trình bày mục tiêu của tài liệu phân tích"):
        set_text(paragraph, "Tài liệu này ghi nhận, tiếp nhận, đánh giá và phê duyệt các yêu cầu thay đổi đối với hệ thống Inventory Manager. Mục tiêu là xác định tác động lên mã nguồn, cấu hình, dữ liệu, giao diện và kiểm thử trước khi triển khai bảo trì.")
    elif text.startswith("<Xác định các nhóm người đọc"):
        set_text(paragraph, "Tài liệu dành cho nhóm phát triển/bảo trì, kiểm thử viên, giảng viên hướng dẫn và người quản lý dự án. Nhóm phát triển sử dụng phần phân tích tác động để triển khai; kiểm thử viên dùng tài liệu để xây dựng test case; người quản lý theo dõi mức ưu tiên và quyết định phê duyệt.")
    elif text.startswith("<Liệt kê ra bất cứ tài liệu"):
        set_text(paragraph, "Tài liệu tham khảo gồm đề bài nhóm số 02 của học phần Bảo trì phần mềm; mã nguồn và README của Inventory Manager; tài liệu Spring Boot, React và Vite được sử dụng trong quá trình phân tích, thiết kế, triển khai và kiểm thử.")

body = root.find(f"{{{NS}}}body")
receipt = next(t for t in body.iter(f"{{{NS}}}tbl") if text_of(t).startswith("PHIẾU TIẾP NHẬN YÊU CẦU THAY ĐỔI"))
clone_table_series(body, receipt, fill_receipt)

analysis_first = next(t for t in body.iter(f"{{{NS}}}tbl") if text_of(t).startswith("PHÂN TÍCH SỰ TÁC ĐỘNG CỦA YÊU CẦU THAY ĐỔI"))
analysis_second = next(t for t in body.iter(f"{{{NS}}}tbl") if text_of(t).startswith("Đánh giá sự thay đổi:"))
start = list(body).index(analysis_first)
end = list(body).index(analysis_second)
for element in list(body)[start:end + 1]:
    body.remove(element)
position = start
for index, item in enumerate(REQUESTS):
    if index:
        body.insert(position, page_break())
        position += 1
    first = copy.deepcopy(analysis_first)
    second = copy.deepcopy(analysis_second)
    fill_analysis(first, second, item)
    body.insert(position, first)
    position += 1
    body.insert(position, blank_paragraph())
    position += 1
    body.insert(position, second)
    position += 1

approval = next(t for t in body.iter(f"{{{NS}}}tbl") if text_of(t).startswith("PHÊ DUYỆT YÊU CẦU THAY ĐỔI"))
clone_table_series(body, approval, fill_approval)

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

print("Completed impact-analysis forms.")
