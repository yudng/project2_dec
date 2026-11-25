const fs = require('fs');
const {
  AlignmentType, BorderStyle, Document, HeadingLevel, PageBreak, Packer,
  Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} = require('docx');

const output = 'D:/yudtime/2026/BaNghi/Project2/Project 2/BaoCao/DacTaYeuCau.docx';
const border = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const labelWidth = 2700;
const contentWidth = 6660;
const requirements = [
  { code: 'HC-01', name: 'Chuẩn hóa và kiểm tra mã SKU', purpose: 'Ngăn tạo mã sản phẩm trùng do khác viết hoa hoặc khoảng trắng.',
    user: 'Nhân viên quản lý kho, quản trị viên.', pre: 'Người dùng đang ở biểu mẫu thêm hoặc chỉnh sửa sản phẩm.',
    process: 'Hệ thống loại bỏ khoảng trắng ở đầu/cuối và chuyển SKU về chữ in hoa trước khi kiểm tra. Nếu SKU rỗng hoặc đã tồn tại sau khi chuẩn hóa, hệ thống báo lỗi và không lưu dữ liệu.',
    result: 'Mỗi sản phẩm có một SKU duy nhất, được lưu ở dạng chữ in hoa đã chuẩn hóa.', note: 'Kiểm thử các trường hợp SKU trùng do khác chữ hoa/thường hoặc có khoảng trắng.' },
  { code: 'HC-02', name: 'Khắc phục phân trang sau khi xóa', purpose: 'Hiển thị đúng danh sách sản phẩm sau khi xóa sản phẩm cuối trang.',
    user: 'Nhân viên quản lý kho, quản trị viên.', pre: 'Danh sách có từ hai trang trở lên; người dùng đang xem một trang có sản phẩm.',
    process: 'Sau khi xóa thành công, hệ thống tải lại dữ liệu. Nếu trang hiện tại không còn bản ghi và số trang lớn hơn một, hệ thống tự chuyển về trang hợp lệ gần nhất rồi tải lại danh sách.',
    result: 'Không xuất hiện tình trạng số lượng tổng còn dữ liệu nhưng bảng hiển thị “Không tìm thấy sản phẩm”.', note: 'Kiểm thử khi xóa bản ghi cuối của trang đầu, trang giữa và trang cuối.' },
  { code: 'HC-03', name: 'Phân biệt trạng thái hết hàng và sắp hết hàng', purpose: 'Hiển thị chính xác tình trạng tồn kho của sản phẩm.',
    user: 'Nhân viên quản lý kho, quản trị viên.', pre: 'Sản phẩm đã có số lượng tồn kho và ngưỡng cảnh báo tồn kho thấp.',
    process: 'Nếu số lượng bằng 0, hiển thị trạng thái “Hết hàng”. Nếu số lượng lớn hơn 0 và không vượt ngưỡng cảnh báo, hiển thị “Sắp hết hàng”. Các trường hợp còn lại hiển thị “Còn hàng”.',
    result: 'Người dùng phân biệt được sản phẩm chưa còn tồn kho với sản phẩm vẫn còn nhưng cần nhập thêm.', note: 'Kiểm thử các mức số lượng 0, bằng ngưỡng, dưới ngưỡng và trên ngưỡng.' },
  { code: 'HT-01', name: 'Xuất danh sách sản phẩm CSV', purpose: 'Hỗ trợ người dùng xuất dữ liệu để lưu trữ và lập báo cáo.',
    user: 'Nhân viên quản lý kho, quản trị viên.', pre: 'Người dùng có quyền xem danh sách sản phẩm; dữ liệu sản phẩm đã được tải.',
    process: 'Người dùng chọn chức năng xuất CSV. Hệ thống xuất các cột SKU, tên, danh mục, số lượng, đơn giá, giá trị tồn và trạng thái theo kết quả tìm kiếm/lọc hiện tại.',
    result: 'Trình duyệt tải về một tệp CSV có tên kèm ngày giờ xuất; dữ liệu hiển thị đúng dấu tiếng Việt và đúng cột.', note: 'Cần kiểm thử với danh sách rỗng, danh sách đã lọc và tên sản phẩm có dấu tiếng Việt.' },
  { code: 'HT-02', name: 'Sắp xếp danh sách sản phẩm', purpose: 'Giúp người dùng xem dữ liệu theo thứ tự phù hợp.',
    user: 'Nhân viên quản lý kho, quản trị viên.', pre: 'Danh sách sản phẩm có ít nhất hai bản ghi.',
    process: 'Người dùng nhấp tiêu đề cột SKU, tên, danh mục, số lượng, đơn giá hoặc giá trị tồn. Lần nhấp đầu sắp xếp tăng dần; lần nhấp tiếp theo đảo thành giảm dần. Tìm kiếm, lọc và phân trang vẫn được áp dụng.',
    result: 'Bảng danh sách hiển thị đúng thứ tự theo cột và chiều sắp xếp đã chọn.', note: 'Cần thể hiện trực quan cột đang sắp xếp và chiều tăng/giảm.' },
  { code: 'HT-03', name: 'Điều chỉnh tồn kho có lý do', purpose: 'Theo dõi nguyên nhân tăng hoặc giảm số lượng tồn kho.',
    user: 'Nhân viên quản lý kho, quản trị viên.', pre: 'Sản phẩm tồn tại; người dùng có quyền điều chỉnh tồn kho.',
    process: 'Người dùng chọn sản phẩm, nhập số lượng điều chỉnh tăng hoặc giảm và lý do. Hệ thống kiểm tra số lượng tồn sau điều chỉnh không âm, lưu giao dịch điều chỉnh và cập nhật số lượng hiện tại.',
    result: 'Số lượng tồn kho được cập nhật; lịch sử ghi nhận thời gian, người thực hiện, số lượng thay đổi, số lượng sau thay đổi và lý do.', note: 'Không cho phép xóa trực tiếp lịch sử điều chỉnh tồn kho.' },
  { code: 'DP-01', name: 'Xác thực và phân quyền', purpose: 'Bảo vệ các thao tác thay đổi dữ liệu sản phẩm.',
    user: 'Quản trị viên, nhân viên quản lý kho.', pre: 'Tài khoản người dùng đã được tạo và được gán vai trò.',
    process: 'Người dùng đăng nhập bằng tài khoản và mật khẩu. Hệ thống xác thực, tạo phiên làm việc và kiểm tra quyền trước mỗi thao tác. Vai trò nhân viên được xem/tìm kiếm/xuất dữ liệu; vai trò quản trị được thêm, sửa, xóa và điều chỉnh tồn kho.',
    result: 'Người chưa đăng nhập bị chuyển đến màn hình đăng nhập; người không có quyền nhận thông báo từ chối thao tác.', note: 'Mật khẩu không được lưu dạng văn bản thuần; cần kiểm thử truy cập trái quyền.' },
  { code: 'DP-02', name: 'Nhật ký và chống ghi đè dữ liệu', purpose: 'Tăng khả năng truy vết và hạn chế xung đột cập nhật.',
    user: 'Quản trị viên, nhân viên quản lý kho.', pre: 'Người dùng đã đăng nhập; bản ghi sản phẩm có thông tin phiên bản hoặc thời điểm cập nhật.',
    process: 'Khi thêm, sửa, xóa hoặc điều chỉnh tồn kho, hệ thống lưu nhật ký gồm người thực hiện, thời gian, thao tác và dữ liệu trước/sau. Khi cập nhật, hệ thống kiểm tra phiên bản bản ghi; nếu bản ghi đã bị người khác thay đổi, hệ thống từ chối lưu và yêu cầu tải lại dữ liệu.',
    result: 'Có thể tra cứu lịch sử thay đổi; giảm nguy cơ ghi đè dữ liệu mới hơn.', note: 'Chỉ quản trị viên được xem toàn bộ nhật ký; cần kiểm thử hai phiên cập nhật cùng một sản phẩm.' },
];

function paragraph(text = '', opts = {}) {
  return new Paragraph({
    text,
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    heading: opts.heading,
    spacing: { before: opts.before ?? 0, after: opts.after ?? 100, line: 276 },
    children: opts.children,
  });
}
function cell(text, width, label = false) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: { top: border, bottom: border, left: border, right: border },
    shading: label ? { type: ShadingType.CLEAR, color: 'E7E6E6', fill: 'E7E6E6' } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text, bold: label })], spacing: { before: 40, after: 40, line: 240 } })],
  });
}
function specTable(req, isChanged) {
  const rows = [
    ...(isChanged ? [['Mã yêu cầu gốc', 'Chức năng quản lý sản phẩm hiện có']] : []),
    ['Mã yêu cầu', req.code],
    ['Tên yêu cầu', req.name],
    ['Mục đích', req.purpose],
    ['Đối tượng sử dụng', req.user],
    ['Tiền điều kiện', req.pre],
    ['Cách xử lý', req.process],
    ['Kết quả', req.result],
    ['Ghi chú', req.note],
  ];
  return new Table({
    width: { size: labelWidth + contentWidth, type: WidthType.DXA },
    columnWidths: [labelWidth, contentWidth],
    rows: rows.map(row => new TableRow({ children: [cell(row[0], labelWidth, true), cell(row[1], contentWidth)] })),
  });
}
function qualityTable(rows) {
  return new Table({
    width: { size: labelWidth + contentWidth, type: WidthType.DXA },
    columnWidths: [labelWidth, contentWidth],
    rows: rows.map(row => new TableRow({ children: [cell(row[0], labelWidth, true), cell(row[1], contentWidth)] })),
  });
}
function heading(text, level = 1) {
  return paragraph(text, { heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2, before: 220, after: 100 });
}

const children = [
  paragraph('ĐẶC TẢ YÊU CẦU', { center: true, before: 1050, children: [new TextRun({ text: 'ĐẶC TẢ YÊU CẦU', bold: true, size: 36 })] }),
  paragraph('PHẦN MỀM BẢO TRÌ', { center: true, children: [new TextRun({ text: 'PHẦN MỀM BẢO TRÌ', bold: true, size: 36 })] }),
  paragraph('cho', { center: true, before: 720 }),
  paragraph('Inventory Manager', { center: true, before: 180, children: [new TextRun({ text: 'Inventory Manager', bold: true, size: 32 })] }),
  paragraph('Phiên bản 1.0', { center: true, before: 620 }),
  paragraph('Được chuẩn bị bởi: <Tên thành viên / Nhóm>', { center: true, before: 420 }),
  paragraph('<Tổ chức / Lớp>', { center: true, before: 180 }),
  paragraph('<Ngày tạo tài liệu>', { center: true, before: 420 }),
  new Paragraph({ children: [new PageBreak()] }),
  heading('Theo dõi phiên bản tài liệu'),
  new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [2200, 1600, 4000, 1560], rows: [
    new TableRow({ children: ['Tên', 'Ngày', 'Lý do thay đổi', 'Phiên bản'].map((x, i) => cell(x, [2200,1600,4000,1560][i], true)) }),
    new TableRow({ children: ['Nhóm thực hiện', '24/11/2026', 'Tạo mới tài liệu đặc tả yêu cầu', '1.0'].map((x, i) => cell(x, [2200,1600,4000,1560][i])) }),
  ] }),
  heading('1. Giới thiệu'),
  heading('1.1 Mục đích', 2), paragraph('Tài liệu mô tả các yêu cầu thay đổi của hệ thống Inventory Manager dựa trên kết quả phân tích tác động.'),
  heading('1.2 Nhóm người đọc', 2), paragraph('Nhóm phát triển, kiểm thử viên, giảng viên hướng dẫn và người quản lý dự án.'),
  heading('1.3 Phạm vi sản phẩm', 2), paragraph('Phạm vi gồm các yêu cầu hiệu chỉnh lỗi, hoàn thiện chức năng và dự phòng đã được nhóm lựa chọn.'),
  heading('1.4 Bảng chú giải thuật ngữ', 2),
  new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [800, 2800, 5760], rows: [
    new TableRow({ children: ['STT', 'Thuật ngữ / Từ viết tắt', 'Định nghĩa / Mô tả'].map((x,i)=>cell(x,[800,2800,5760][i],true)) }),
    new TableRow({ children: ['1', 'SKU', 'Mã định danh duy nhất của sản phẩm.'].map((x,i)=>cell(x,[800,2800,5760][i])) }),
    new TableRow({ children: ['2', 'CSV', 'Tệp dữ liệu phân tách bằng dấu phẩy.'].map((x,i)=>cell(x,[800,2800,5760][i])) }),
  ] }),
  heading('1.5 Tài liệu tham khảo', 2), paragraph('Bài tập nhóm số 02 – Bảo trì một sản phẩm phần mềm; mã nguồn và README của Inventory Manager.'),
  heading('1.6 Qui ước về cách trình bày', 2), paragraph('Các yêu cầu được đánh mã HC, HT và DP theo loại bảo trì; phần có dấu chấm là nội dung nhóm tự bổ sung.'),
  heading('2. Yêu cầu của khách hàng'),
  heading('2.1 Yêu cầu chức năng', 2),
  heading('2.1.1 Những yêu cầu chức năng cần được điều chỉnh', 2),
];

for (const req of requirements.slice(0, 3)) {
  children.push(paragraph('', { after: 80 }), specTable(req, true));
}
children.push(heading('2.1.2 Những yêu cầu chức năng mới', 2));
for (const req of requirements.slice(3)) {
  children.push(paragraph('', { after: 80 }), specTable(req, false));
}
children.push(
  heading('2.2 Những yêu cầu phi chức năng', 2),
  heading('2.2.1 Những yêu cầu phi chức năng cần được điều chỉnh', 2),
  paragraph('Không có yêu cầu phi chức năng cần điều chỉnh độc lập. Các ràng buộc về hiển thị và tính đúng đắn được thực hiện cùng các yêu cầu HC-01, HC-02 và HC-03.'),
  heading('2.2.2 Những yêu cầu phi chức năng mới', 2),
  qualityTable([
    ['Mã yêu cầu', 'NFR-01'],
    ['Tên yêu cầu', 'Bảo mật và kiểm soát truy cập'],
    ['Nội dung', 'Mật khẩu phải được lưu dưới dạng băm; các API thay đổi dữ liệu chỉ xử lý khi người dùng đã xác thực và có quyền phù hợp.'],
    ['Tiêu chí chấp nhận', 'Người chưa đăng nhập hoặc không có quyền không thể thêm, sửa, xóa hay điều chỉnh tồn kho.'],
    ['Liên quan', 'DP-01 – Xác thực và phân quyền.'],
  ]),
  paragraph('', { after: 60 }),
  qualityTable([
    ['Mã yêu cầu', 'NFR-02'],
    ['Tên yêu cầu', 'Tính toàn vẹn và khả năng truy vết'],
    ['Nội dung', 'Mọi thay đổi sản phẩm và tồn kho phải được ghi nhận; hệ thống không cho phép cập nhật khi bản ghi đã thay đổi bởi phiên làm việc khác.'],
    ['Tiêu chí chấp nhận', 'Có thể xem thông tin người thực hiện, thời gian và nội dung thay đổi; hệ thống cảnh báo khi xảy ra xung đột cập nhật.'],
    ['Liên quan', 'DP-02 – Nhật ký và chống ghi đè dữ liệu.'],
  ]),
  heading('3. Các tính năng của hệ thống đề nghị'),
  heading('3.1 Các tính năng được điều chỉnh', 2), paragraph('Kiểm tra và chuẩn hóa mã SKU; làm mới phân trang sau khi xóa; hiển thị riêng trạng thái hết hàng, sắp hết hàng và còn hàng.'),
  heading('3.2 Các tính năng mới', 2), paragraph('Xuất danh sách CSV; sắp xếp danh sách; điều chỉnh tồn kho có lý do; đăng nhập và phân quyền; nhật ký thay đổi và kiểm soát xung đột cập nhật.')
);

const document = new Document({
  creator: 'Nhóm thực hiện',
  title: 'Đặc tả yêu cầu phần mềm bảo trì - Inventory Manager',
  styles: { default: { document: { run: { font: 'Times New Roman', size: 26 }, paragraph: { spacing: { after: 100 } } }, heading1: { run: { font: 'Times New Roman', size: 30, bold: true }, paragraph: { spacing: { before: 240, after: 120 }, keepNext: true } }, heading2: { run: { font: 'Times New Roman', size: 26, bold: true }, paragraph: { spacing: { before: 180, after: 90 }, keepNext: true } } } },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } } }, children }],
});
Packer.toBuffer(document).then(buffer => fs.writeFileSync(output, buffer));
