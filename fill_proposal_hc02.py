import os
import shutil
import tempfile
import zipfile
import xml.etree.ElementTree as ET

source = r"D:\yudtime\2026\BaNghi\Project2\Project 2\Phantichsutacdong.docx"
backup = r"D:\yudtime\2026\BaNghi\Project2\Project 2\Phantichsutacdong_truoc_khi_dien.docx"
ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
ET.register_namespace("w", ns)

def paragraph_text(paragraph):
    return "".join(node.text or "" for node in paragraph.iter(f"{{{ns}}}t"))

def replace_last_text(paragraph, replacement):
    nodes = list(paragraph.iter(f"{{{ns}}}t"))
    if not nodes:
        raise RuntimeError("Không thể thay nội dung dòng biểu mẫu.")
    nodes[-1].text = replacement

def set_text(paragraph, value):
    nodes = list(paragraph.iter(f"{{{ns}}}t"))
    if not nodes:
        run = ET.SubElement(paragraph, f"{{{ns}}}r")
        node = ET.SubElement(run, f"{{{ns}}}t")
        node.text = value
        return
    nodes[0].text = value
    for node in nodes[1:]:
        node.text = ""

if not os.path.exists(backup):
    shutil.copy2(source, backup)

with zipfile.ZipFile(source, "r") as zin:
    root = ET.fromstring(zin.read("word/document.xml"))
    paragraphs = list(root.iter(f"{{{ns}}}p"))

start = next(i for i, p in enumerate(paragraphs) if paragraph_text(p) == "PHIẾU ĐỀ XUẤT YÊU CẦU THAY ĐỔI")
form = paragraphs[start:start + 27]

replace_last_text(form[1], ": HC-02")
replace_last_text(form[2], "Inventory Manager")
replace_last_text(form[3], "Nhóm thực hiện")
replace_last_text(form[4], "24/11/2026")
set_text(form[6], "Khoa Công nghệ Thông tin và Truyền thông")
set_text(form[7], "Đại học Cần Thơ")
set_text(form[8], "")
replace_last_text(form[9], "<Số điện thoại đại diện nhóm>")
replace_last_text(form[10], "<Email đại diện nhóm>")

for index, value in {
    12: "Khi xóa sản phẩm cuối cùng ở trang cuối, hệ thống vẫn giữ trang hiện tại.",
    13: "Bảng thông báo không tìm thấy sản phẩm mặc dù dashboard vẫn còn dữ liệu.",
    14: "Người dùng có thể hiểu nhầm toàn bộ sản phẩm đã bị xóa.",
    15: "",
    16: "",
    18: "Hệ thống cần kiểm tra số lượng sản phẩm còn lại sau khi xóa.",
    19: "Nếu trang hiện tại không còn dữ liệu và vẫn còn trang trước, tự động chuyển về trang hợp lệ gần nhất.",
    20: "Hệ thống cần tải lại danh sách sản phẩm sau khi chuyển trang.",
    21: "",
    22: "",
    24: "Đây là yêu cầu bảo trì hiệu chỉnh lỗi.",
    25: "Cần kiểm thử lại tìm kiếm, lọc danh mục và phân trang sau khi sửa.",
    26: "",
}.items():
    set_text(form[index], value)

new_xml = ET.tostring(root, encoding="utf-8", xml_declaration=True)
fd, temporary = tempfile.mkstemp(suffix=".docx")
os.close(fd)
try:
    with zipfile.ZipFile(temporary, "w", zipfile.ZIP_DEFLATED) as zout:
        with zipfile.ZipFile(source, "r") as zin:
            for item in zin.infolist():
                content = new_xml if item.filename == "word/document.xml" else zin.read(item.filename)
                zout.writestr(item, content)
    shutil.move(temporary, source)
finally:
    if os.path.exists(temporary):
        os.remove(temporary)

print("Đã điền phiếu đề xuất HC-02.")
