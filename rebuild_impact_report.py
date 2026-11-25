from copy import deepcopy
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

SOURCE = r"D:\yudtime\2026\BaNghi\Project2\Project 2\Phantichsutacdong.docx"
BACKUP = r"D:\yudtime\2026\BaNghi\Project2\Project 2\Phantichsutacdong_truoc_khi_dien.docx"

R = [
 ('HC-01','Chuẩn hóa và kiểm tra mã SKU','Hiệu chỉnh lỗi','Cao','SKU chưa được chuẩn hóa khoảng trắng, chữ hoa và chữ thường; có nguy cơ tạo mã hàng trùng về mặt nghiệp vụ.','Chuẩn hóa mã SKU, kiểm tra trùng không phân biệt chữ hoa/thường trước khi lưu.','ProductFormModal, ProductService, ProductRepository, kiểm thử CRUD.'),
 ('HC-02','Khắc phục phân trang sau khi xóa','Hiệu chỉnh lỗi','Cao','Xóa sản phẩm cuối cùng ở trang cuối làm bảng trống dù dashboard vẫn còn dữ liệu.','Nếu trang hiện tại rỗng sau khi xóa, tự động tải lại trang hợp lệ gần nhất.','App.tsx, ProductTable, luồng xóa, phân trang và kiểm thử giao diện.'),
 ('HC-03','Thông báo lỗi dashboard','Hiệu chỉnh lỗi','Trung bình','Khi API thống kê lỗi, dashboard chỉ hiện dấu gạch ngang và không nêu nguyên nhân.','Hiển thị lỗi riêng cho dashboard và nút thử lại.','Dashboard, App.tsx, API client và kiểm thử lỗi kết nối.'),
 ('TU-01','Cấu hình cổng và địa chỉ API','Thích ứng','Cao','Cổng chạy và địa chỉ API phụ thuộc cấu hình cố định, dễ xung đột với dự án khác.','Đọc cổng và API URL từ biến môi trường, kèm cấu hình mẫu.','application.yml, vite.config.ts, .env.example, README.'),
 ('TU-02','Lưu trữ dữ liệu H2 dạng tệp','Thích ứng','Cao','Dữ liệu mất sau khi backend khởi động lại vì H2 đang chạy trong bộ nhớ.','Bổ sung profile H2 file-based để dữ liệu tồn tại sau khi restart.','application.yml, profile cơ sở dữ liệu, README, kiểm thử restart.'),
 ('TU-03','Việt hóa giao diện và định dạng VND','Thích ứng','Trung bình','Giao diện dùng tiếng Anh và tiền tệ USD, chưa phù hợp người dùng Việt Nam.','Việt hóa nhãn/thông báo và định dạng tiền tệ theo VND.','Các component React, thông báo, hàm định dạng tiền và test giao diện.'),
 ('HT-01','Xuất danh sách sản phẩm CSV','Hoàn thiện','Trung bình','Hệ thống chưa hỗ trợ xuất danh sách sản phẩm phục vụ báo cáo hoặc lưu trữ.','Thêm API và nút xuất danh sách đang lọc ra tệp CSV.','ProductController, ProductService, API xuất tệp, frontend, test CSV.'),
 ('HT-02','Sắp xếp danh sách sản phẩm','Hoàn thiện','Trung bình','Danh sách chỉ hiển thị theo một thứ tự mặc định.','Cho phép chọn cột sắp xếp và chiều tăng/giảm, kết hợp lọc/phân trang.','ProductController, ProductRepository, App.tsx, SearchFilterBar.'),
 ('HT-03','Điều chỉnh tồn kho có lý do','Hoàn thiện','Cao','Người dùng sửa trực tiếp số lượng nên không biết nguyên nhân tăng hoặc giảm tồn kho.','Thêm thao tác điều chỉnh tồn kho, bắt buộc nhập số lượng và lý do.','Entity dữ liệu, service, API nghiệp vụ, modal giao diện, test lịch sử.'),
 ('DP-01','Xác thực và phân quyền','Dự phòng','Cao','Bất kỳ ai mở ứng dụng đều có thể thêm, sửa hoặc xóa sản phẩm.','Bổ sung đăng nhập, vai trò người dùng và bảo vệ các thao tác thay đổi dữ liệu.','Spring Security, entity người dùng, API auth, route frontend, test bảo mật.'),
 ('DP-02','Nhật ký và chống ghi đè dữ liệu','Dự phòng','Cao','Không có lịch sử thay đổi; người dùng đồng thời có thể ghi đè dữ liệu.','Ghi audit log và dùng optimistic locking để phát hiện xung đột cập nhật.','Entity Product, bảng audit, service cập nhật, xử lý xung đột, test đồng thời.'),
]

def text(e): return ''.join(t.text or '' for t in e.iter(qn('w:t')))
def ps(e): return list(e.iter(qn('w:p')))
def setp(p, value):
    ts=list(p.iter(qn('w:t')))
    if not ts:
        run=OxmlElement('w:r'); p.append(run); node=OxmlElement('w:t'); run.append(node); ts=[node]
    ts[0].text=value
    for t in ts[1:]: t.text=''
def tail(p,value):
    ts=list(p.iter(qn('w:t')))
    if ts: ts[-1].text=value
    else: setp(p,value)
def pagebreak():
    p=OxmlElement('w:p'); r=OxmlElement('w:r'); br=OxmlElement('w:br'); br.set(qn('w:type'),'page'); r.append(br); p.append(r); return p
def empty(): return OxmlElement('w:p')
def find_table(doc, prefix): return next(t for t in doc.tables if text(t._tbl).startswith(prefix))
def replace_series(body, template, make):
    i=body.index(template._tbl); body.remove(template._tbl)
    for n,item in enumerate(R):
        if n: body.insert(i,pagebreak()); i+=1
        clone=deepcopy(template._tbl); make(clone,item); body.insert(i,clone); i+=1

def proposal(tbl,x):
    c,title,kind,prio,current,need,impact=x; p=ps(tbl)
    tail(p[1],': '+c); tail(p[2],'Inventory Manager'); tail(p[3],'Nhóm thực hiện'); tail(p[4],'24/11/2026')
    setp(p[6],'Khoa Công nghệ Thông tin và Truyền thông'); setp(p[7],'Đại học Cần Thơ'); setp(p[8],'')
    tail(p[9],'<Số điện thoại đại diện nhóm>'); tail(p[10],'<Email đại diện nhóm>')
    for i,v in enumerate([current,'']): setp(p[12+i],v)
    for i in range(14,17): setp(p[i],'')
    for i,v in enumerate([need,'']): setp(p[18+i],v)
    for i in range(20,23): setp(p[i],'')
    setp(p[24],f'Loại bảo trì: {kind.lower()}.'); setp(p[25],'Cần triển khai mã nguồn, kiểm thử và cập nhật tài liệu liên quan.'); setp(p[26],'')
def receipt(tbl,x):
    c,title,kind,prio,current,need,impact=x; p=ps(tbl)
    tail(p[1],': '+c); setp(p[3],'Nhóm thực hiện'); setp(p[5],'24/11/2026'); setp(p[7],'Khoa Công nghệ Thông tin và Truyền thông'); setp(p[8],'Đại học Cần Thơ'); setp(p[9],'')
    tail(p[10],'<Số điện thoại đại diện nhóm>'); tail(p[11],'<Email đại diện nhóm>'); setp(p[13],'Chức năng quản lý sản phẩm hiện có'); setp(p[15],kind); setp(p[16],title); setp(p[18],f'Ưu tiên {prio.lower()} do ảnh hưởng đến vận hành hệ thống.'); setp(p[19],'Đưa vào phạm vi bảo trì phiên bản 1.0.'); setp(p[21],'Đã tiếp nhận để phân tích tác động.'); setp(p[22],'')
def analysis(a,b,x):
    c,title,kind,prio,current,need,impact=x; p=ps(a)
    tail(p[1],': '+c); setp(p[3],'Nhóm thực hiện'); setp(p[5],'24/11/2026'); setp(p[7],'Khoa Công nghệ Thông tin và Truyền thông'); setp(p[8],'Đại học Cần Thơ'); setp(p[9],''); tail(p[10],'<Số điện thoại đại diện nhóm>'); tail(p[11],'<Email đại diện nhóm>')
    setp(p[13],kind); setp(p[15],impact); setp(p[16],'Tài liệu đặc tả, thiết kế, kiểm thử, hướng dẫn sử dụng và kịch bản demo.'); setp(p[17],'Cần kiểm thử hồi quy các chức năng CRUD, tìm kiếm, lọc và phân trang liên quan.')
    q=ps(b); setp(q[1],f'Phạm vi {prio.lower()}; cần cập nhật mã nguồn, test case và tài liệu liên quan.'); setp(q[2],'Không thay đổi nghiệp vụ ngoài yêu cầu đã tiếp nhận.'); setp(q[3],''); setp(q[5],f'Giải pháp 1: {need} Nhân lực: 01 lập trình viên, 01 kiểm thử viên.'); setp(q[6],'Công cụ: Java 21, Maven, Node.js, React và trình duyệt; thời gian 0,5–2 ngày; sử dụng công cụ mã nguồn mở.'); setp(q[9],f'Chọn Giải pháp 1 vì xử lý trực tiếp nguyên nhân: {need}'); setp(q[10],'Giải pháp 2 chỉ hướng dẫn xử lý thủ công nên không giải quyết nguyên nhân gốc.'); setp(q[12],'Chạy kiểm thử hồi quy trước khi đưa vào phiên bản chính.'); setp(q[13],'')
def approval(tbl,x):
    c,title,kind,prio,current,need,impact=x; p=ps(tbl)
    tail(p[1],': '+c); setp(p[3],'Nhóm thực hiện'); setp(p[4],'<Giảng viên hướng dẫn nếu có>'); setp(p[7],'24/11/2026'); setp(p[9],'Khoa Công nghệ Thông tin và Truyền thông'); setp(p[10],'Đại học Cần Thơ'); setp(p[11],''); tail(p[12],'<Số điện thoại đại diện nhóm>'); tail(p[13],'<Email đại diện nhóm>'); setp(p[15],f'Chấp nhận yêu cầu {c} - {title} để triển khai trong phiên bản 1.0.'); setp(p[16],f'Mức ưu tiên: {prio}. Thực hiện theo phân tích tác động.'); setp(p[17],''); setp(p[19],'Yêu cầu có mã nguồn, kiểm thử và bằng chứng trước/sau khi hoàn thành.'); setp(p[20],'')

doc=Document(BACKUP)
for p in doc.paragraphs:
    s=p.text
    if s.startswith('<Trình bày mục tiêu'): setp(p._p,'Tài liệu này ghi nhận, tiếp nhận, đánh giá và phê duyệt các yêu cầu thay đổi đối với Inventory Manager; đồng thời xác định tác động lên mã nguồn, cấu hình, dữ liệu, giao diện và kiểm thử trước khi triển khai bảo trì.')
    elif s.startswith('<Xác định các nhóm người đọc'): setp(p._p,'Tài liệu dành cho nhóm phát triển/bảo trì, kiểm thử viên, giảng viên hướng dẫn và người quản lý dự án. Nhóm phát triển dùng phần phân tích tác động để triển khai; kiểm thử viên dùng để xây dựng test case; người quản lý theo dõi ưu tiên và phê duyệt yêu cầu.')
    elif s.startswith('<Liệt kê ra bất cứ tài liệu'): setp(p._p,'Tài liệu tham khảo gồm đề bài nhóm số 02 của học phần Bảo trì phần mềm; mã nguồn và README của Inventory Manager; tài liệu Spring Boot, React và Vite được dùng trong quá trình phân tích, thiết kế, triển khai và kiểm thử.')

body=doc._body._element
replace_series(body,find_table(doc,'PHIẾU ĐỀ XUẤT YÊU CẦU THAY ĐỔI'),proposal)
replace_series(body,find_table(doc,'PHIẾU TIẾP NHẬN YÊU CẦU THAY ĐỔI'),receipt)

a=find_table(doc,'PHÂN TÍCH SỰ TÁC ĐỘNG CỦA YÊU CẦU THAY ĐỔI'); b=find_table(doc,'Đánh giá sự thay đổi:')
i=body.index(a._tbl); j=body.index(b._tbl)
for e in list(body)[i:j+1]: body.remove(e)
for n,x in enumerate(R):
    if n: body.insert(i,pagebreak()); i+=1
    aa=deepcopy(a._tbl); bb=deepcopy(b._tbl); analysis(aa,bb,x); body.insert(i,aa); i+=1; body.insert(i,empty()); i+=1; body.insert(i,bb); i+=1

replace_series(body,find_table(doc,'PHÊ DUYỆT YÊU CẦU THAY ĐỔI'),approval)
doc.save(SOURCE)
print('Rebuilt report with valid Word package.')
