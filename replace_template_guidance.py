from docx import Document
from docx.oxml.ns import qn

SOURCE = r"D:\yudtime\2026\BaNghi\Project2\Project 2\Phantichsutacdong.docx"

def set_text(paragraph, value):
    nodes = list(paragraph._p.iter(qn('w:t')))
    if not nodes:
        paragraph.add_run(value)
        return
    nodes[0].text = value
    for node in nodes[1:]:
        node.text = ''

replacements = {
    '<Định nghĩa các từ viết tắt': 'Các thuật ngữ và từ viết tắt được sử dụng trong tài liệu được trình bày như sau:',
    '<Người đề xuất yêu cầu thay đổi': 'Mỗi yêu cầu thay đổi được lập thành một phiếu đề xuất như sau:',
    '<Người tiếp nhận yêu cầu thay đổi': 'Sau khi tiếp nhận, nhóm bảo trì phân loại yêu cầu, xác định mức ưu tiên và ghi nhận theo phiếu sau:',
    '<Người được giao nhiệm vụ phân tích': 'Mỗi yêu cầu đã tiếp nhận được phân tích tác động đối với mã nguồn, tài liệu, dữ liệu và kiểm thử theo phiếu sau:',
    '<Phiếu đề xuất, phiếu tiếp nhận': 'Các yêu cầu đã được đề xuất, tiếp nhận và phân tích được trình Ban quản lý sự thay đổi xem xét, phê duyệt theo phiếu sau:',
}

doc = Document(SOURCE)
for paragraph in doc.paragraphs:
    value = paragraph.text
    for prefix, replacement in replacements.items():
        if value.startswith(prefix):
            set_text(paragraph, replacement)
            break
doc.save(SOURCE)
print('Replaced template guidance text.')
