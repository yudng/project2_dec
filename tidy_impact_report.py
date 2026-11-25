from docx import Document

SOURCE = r"D:\yudtime\2026\BaNghi\Project2\Project 2\Phantichsutacdong.docx"
doc = Document(SOURCE)

for p in doc.paragraphs:
    if p.text.strip() == '>':
        p.text = ''

for table in doc.tables:
    header = ' '.join(cell.text for cell in table.rows[0].cells).strip() if table.rows else ''
    if 'Thuật ngữ / Từ viết tắt' in header:
        while len(table.rows) < 6:
            table.add_row()
        data = [
            ('1', 'API', 'Giao diện lập trình ứng dụng kết nối frontend với backend.'),
            ('2', 'H2', 'Cơ sở dữ liệu nhúng đang được sử dụng trong hệ thống.'),
            ('3', 'SKU', 'Mã định danh duy nhất của sản phẩm.'),
            ('4', 'CSV', 'Tệp dữ liệu phân tách bằng dấu phẩy.'),
            ('5', 'Audit log', 'Nhật ký ghi nhận các thay đổi dữ liệu.'),
        ]
        for row, values in zip(table.rows[1:], data):
            for cell, value in zip(row.cells, values):
                cell.text = value
    if 'Lý do thay đổi' in header and 'Phiên bản' in header and len(table.rows) > 1:
        values = ('Nhóm thực hiện', '24/11/2026', 'Tạo mới tài liệu phân tích tác động', '1.0')
        for cell, value in zip(table.rows[1].cells, values):
            cell.text = value

doc.save(SOURCE)
print('Tidied report.')
