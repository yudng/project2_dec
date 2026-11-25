const fs = require('fs');
const path = require('path');
const {
  AlignmentType, BorderStyle, Document, HeadingLevel, PageBreak, Packer,
  Paragraph, Table, TableCell, TableRow, TextRun, WidthType
} = require('docx');

const output = 'D:/yudtime/2026/BaNghi/Project2/Project 2/docs/Phantichsutacdong_HoanChinh.docx';
const border = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const pageWidth = 9360;

const changes = [
  ['HC-01', 'Hiệu chỉnh', 'Chuẩn hóa và kiểm tra mã SKU', 'SKU chưa được chuẩn hóa khoảng trắng/chữ hoa-thường; có nguy cơ tạo mã trùng về mặt nghiệp vụ.', 'Frontend form; ProductService; ProductRepository; kiểm thử CRUD.', 'Chuẩn hóa trim + in hoa trước khi kiểm tra/lưu; truy vấn trùng không phân biệt hoa-thường.', 'Cao'],
  ['HC-02', 'Hiệu chỉnh', 'Khắc phục phân trang sau khi xóa', 'Xóa bản ghi cuối trang cuối làm bảng trống dù dashboard vẫn còn sản phẩm.', 'App.tsx; ProductTable; luồng xóa; kiểm thử phân trang.', 'Sau khi xóa, nếu trang hiện tại rỗng thì tải lại trang hợp lệ trước đó.', 'Cao'],
  ['HC-03', 'Hiệu chỉnh', 'Thông báo lỗi dashboard', 'Khi API thống kê lỗi, dashboard chỉ hiện dấu gạch ngang và không nêu nguyên nhân.', 'Dashboard; App.tsx; API client; kiểm thử lỗi kết nối.', 'Lưu trạng thái lỗi thống kê, hiển thị thông báo rõ ràng và nút thử lại.', 'Trung bình'],
  ['TU-01', 'Thích ứng', 'Cấu hình cổng và API URL', 'Cổng chạy và địa chỉ API phụ thuộc cấu hình cố định.', 'application.yml; vite.config.ts; .env.example; README.', 'Đọc cổng/API URL từ biến môi trường và cung cấp giá trị mẫu.', 'Cao'],
  ['TU-02', 'Thích ứng', 'Lưu trữ H2 dạng tệp', 'Dữ liệu mất sau khi backend restart vì đang dùng H2 in-memory.', 'application.yml; profile cấu hình; hướng dẫn chạy; kiểm thử restart.', 'Bổ sung profile H2 file-based để dữ liệu tồn tại qua lần khởi động lại.', 'Cao'],
  ['TU-03', 'Thích ứng', 'Bản địa hóa tiếng Việt và VND', 'Giao diện dùng tiếng Anh và tiền tệ USD, chưa phù hợp người dùng Việt Nam.', 'Component React; thông báo; hàm format tiền tệ.', 'Việt hóa chuỗi hiển thị và dùng định dạng tiền VND.', 'Trung bình'],
  ['HT-01', 'Hoàn thiện', 'Xuất danh sách sản phẩm CSV', 'Không có cách lấy dữ liệu danh sách ra phục vụ báo cáo/lưu trữ.', 'API sản phẩm; service; nút frontend; kiểm thử tệp xuất.', 'Thêm API và nút xuất CSV theo bộ lọc hiện hành.', 'Trung bình'],
  ['HT-02', 'Hoàn thiện', 'Sắp xếp danh sách sản phẩm', 'Danh sách chỉ dùng một thứ tự mặc định theo tên.', 'ProductController; repository/service; SearchFilterBar; App.tsx.', 'Cho chọn cột sắp xếp và chiều tăng/giảm, tương thích lọc/phân trang.', 'Trung bình'],
  ['HT-03', 'Hoàn thiện', 'Điều chỉnh tồn kho có lý do', 'Số lượng bị sửa trực tiếp nên không biết nguyên nhân tăng/giảm.', 'Entity/bảng lịch sử; service; API; modal giao diện; kiểm thử.', 'Thêm nghiệp vụ điều chỉnh tồn, lý do và lưu lịch sử thay đổi.', 'Cao'],
  ['DP-01', 'Dự phòng', 'Xác thực và phân quyền', 'Bất kỳ người dùng nào cũng có thể thêm, sửa hoặc xóa sản phẩm.', 'Spring Security; entity người dùng; API auth; route frontend.', 'Bổ sung đăng nhập và phân quyền theo vai trò.', 'Cao'],
  ['DP-02', 'Dự phòng', 'Audit log và chống ghi đè', 'Không có lịch sử thay đổi; người dùng đồng thời có thể ghi đè dữ liệu.', 'Entity Product; bảng audit; service update; xử lý xung đột.', 'Thêm audit log và optimistic locking bằng trường version.', 'Cao'],
];

function para(text = '', options = {}) {
  return new Paragraph({
    text,
    alignment: options.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    heading: options.heading,
    spacing: { before: options.before ?? 0, after: options.after ?? 100, line: 276 },
    children: options.children,
  });
}
function cell(text, width, bold = false) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: { top: border, bottom: border, left: border, right: border },
    children: [new Paragraph({ children: [new TextRun({ text, bold })], spacing: { after: 30, line: 240 } })],
  });
}
function table(headers, rows, widths) {
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ children: headers.map((x, i) => cell(x, widths[i], true)) }),
      ...rows.map(row => new TableRow({ children: row.map((x, i) => cell(String(x), widths[i])) })),
    ],
  });
}
function twoCol(rows) { return table(['Mục', 'Nội dung'], rows, [2600, 6760]); }
function heading(text, level = 1) { return para(text, { heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2, before: 220, after: 90 }); }
function changeRows(c) {
  return [
    ['Mã số yêu cầu', c[0]], ['Tên yêu cầu', c[2]], ['Loại bảo trì', c[1]],
    ['Hiện trạng', c[3]], ['Yêu cầu thay đổi', c[5]], ['Mức ưu tiên', c[6]],
    ['Người yêu cầu', '<Tên thành viên/nhóm>'], ['Ngày yêu cầu', '<Ngày điền tài liệu>'],
  ];
}
function solutionText(c) {
  return `Giải pháp 1: ${c[5]} Nhân lực: 01 lập trình viên, 01 kiểm thử viên; công cụ: Java 21, Maven, Node.js, React và trình duyệt; thời gian dự kiến: 0,5–2 ngày tùy yêu cầu; chi phí: sử dụng công cụ mã nguồn mở.\n\nGiải pháp 2: Chỉ hướng dẫn người dùng xử lý thủ công hoặc giữ nguyên cấu hình hiện tại. Chi phí triển khai thấp nhưng không loại bỏ nguyên nhân gốc và khó kiểm thử lâu dài.\n\nGiải pháp đề nghị: Chọn Giải pháp 1 vì xử lý trực tiếp nguyên nhân, có thể kiểm thử tự động/thủ công và nâng cao khả năng bảo trì.`;
}

const children = [];
children.push(
  para('PHÂN TÍCH SỰ TÁC ĐỘNG CỦA', { center: true, before: 1000, children: [new TextRun({ text: 'PHÂN TÍCH SỰ TÁC ĐỘNG CỦA', bold: true, size: 34 })] }),
  para('CÁC YÊU CẦU THAY ĐỔI', { center: true, children: [new TextRun({ text: 'CÁC YÊU CẦU THAY ĐỔI', bold: true, size: 34 })] }),
  para('cho', { center: true, before: 720, children: [new TextRun({ text: 'cho', bold: true, size: 28 })] }),
  para('Inventory Manager', { center: true, before: 180, children: [new TextRun({ text: 'Inventory Manager', bold: true, size: 34 })] }),
  para('Phiên bản 1.0', { center: true, before: 720, children: [new TextRun({ text: 'Phiên bản 1.0', bold: true, size: 26 })] }),
  para('Được chuẩn bị bởi: <Tên thành viên / Nhóm>', { center: true, before: 600 }),
  para('<Tổ chức / Lớp>', { center: true, before: 240 }),
  para('<Ngày tạo tài liệu>', { center: true, before: 520 }),
  new Paragraph({ children: [new PageBreak()] }),
  heading('Theo dõi phiên bản tài liệu'),
  table(['Tên', 'Ngày', 'Lý do thay đổi', 'Phiên bản'], [['<Người soạn>', '<Ngày>', 'Tạo mới tài liệu phân tích tác động', '1.0']], [1900, 1600, 4200, 1660]),
  heading('1. Giới thiệu'),
  heading('1.1 Mục đích', 2),
  para('Tài liệu này ghi nhận, tiếp nhận, đánh giá và phê duyệt các yêu cầu thay đổi đối với hệ thống Inventory Manager. Mục tiêu là xác định tác động lên mã nguồn, cấu hình, dữ liệu, giao diện và kiểm thử trước khi triển khai bảo trì.'),
  heading('1.2 Nhóm người đọc', 2),
  para('Tài liệu dành cho nhóm phát triển/bảo trì, kiểm thử viên, giảng viên hướng dẫn và người quản lý dự án. Nhóm phát triển tập trung vào mục 2.3; kiểm thử viên dùng mục 2.1–2.3 để xây dựng test case; người quản lý theo dõi ưu tiên và quyết định tại mục 2.4.'),
  heading('1.3 Bảng chú giải thuật ngữ', 2),
  table(['STT', 'Thuật ngữ / Từ viết tắt', 'Định nghĩa / Mô tả'], [['1', 'API', 'Giao diện lập trình ứng dụng giữa frontend và backend.'], ['2', 'H2', 'Hệ quản trị cơ sở dữ liệu nhúng đang dùng cho hệ thống.'], ['3', 'SKU', 'Mã định danh duy nhất của sản phẩm.'], ['4', 'CSV', 'Định dạng tệp dữ liệu phân tách bằng dấu phẩy.'], ['5', 'Audit log', 'Nhật ký ghi nhận thay đổi dữ liệu.'], ['6', 'Optimistic locking', 'Cơ chế phát hiện xung đột khi nhiều người cùng cập nhật dữ liệu.']], [700, 3000, 5660]),
  heading('1.4 Tài liệu tham khảo', 2),
  table(['STT', 'Tài liệu', 'Nguồn'], [['1', 'Đề bài nhóm số 02 - Bảo trì một sản phẩm phần mềm', 'Yeucau_Project2.pdf'], ['2', 'Mã nguồn Inventory Manager', 'Thư mục inventory-manager'], ['3', 'Tổng hợp yêu cầu bảo trì', 'docs/TONG_HOP_YEU_CAU_BAO_TRI.md']], [700, 4800, 3860]),
  heading('2. Phân tích sự tác động của các yêu cầu thay đổi')
);

children.push(heading('2.1 Đề xuất các yêu cầu thay đổi', 2));
for (const c of changes) {
  children.push(heading(`${c[0]} - ${c[2]}`, 2), twoCol(changeRows(c)));
}

children.push(new Paragraph({ children: [new PageBreak()] }), heading('2.2 Tiếp nhận các yêu cầu thay đổi', 2));
children.push(table(['Mã', 'Yêu cầu gốc', 'Loại', 'Ưu tiên', 'Trạng thái tiếp nhận'], changes.map(c => [c[0], 'Không áp dụng / chức năng hiện có', c[1], c[6], 'Đã tiếp nhận để phân tích']), [900, 3000, 1500, 1200, 2760]));
children.push(para('Người tiếp nhận: <Tên thành viên/nhóm>. Ngày tiếp nhận: <Ngày điền tài liệu>. Các yêu cầu được phân loại dựa trên hiện trạng đã quan sát, mã nguồn và mục tiêu bảo trì của dự án.'));

children.push(new Paragraph({ children: [new PageBreak()] }), heading('2.3 Phân tích sự tác động', 2));
for (const c of changes) {
  children.push(
    heading(`${c[0]} - ${c[2]}`, 2),
    twoCol([
      ['Loại yêu cầu', c[1]],
      ['Thành phần chương trình bị ảnh hưởng', c[4]],
      ['Tài liệu bị ảnh hưởng', 'Tài liệu đặc tả yêu cầu, thiết kế bảo trì, tài liệu kiểm thử, hướng dẫn sử dụng và kịch bản demo.'],
      ['Đánh giá thay đổi', `Phạm vi ${c[6].toLowerCase()}. Cần cập nhật mã nguồn, kiểm thử hồi quy các chức năng CRUD, tìm kiếm, lọc và phân trang liên quan.`],
      ['Các giải pháp và nguồn lực', solutionText(c)],
      ['Đề xuất giải pháp tốt nhất', c[5]],
      ['Người phân tích / Ngày phân tích', '<Tên thành viên/nhóm> / <Ngày điền tài liệu>'],
    ])
  );
}

children.push(new Paragraph({ children: [new PageBreak()] }), heading('2.4 Phê duyệt các yêu cầu thay đổi', 2));
children.push(para('Ban quản lý sự thay đổi: <Tên các thành viên nhóm và giảng viên hướng dẫn nếu cần>. Các yêu cầu sau được đề xuất phê duyệt để triển khai theo thứ tự ưu tiên.'));
children.push(table(['Mã', 'Tên yêu cầu', 'Quyết định', 'Ghi chú'], changes.map(c => [c[0], c[2], 'Đề nghị chấp nhận', `Ưu tiên ${c[6].toLowerCase()}`]), [900, 4000, 2400, 2060]));
children.push(para('Ngày phê duyệt: <Ngày điền tài liệu>. Chữ ký/xác nhận: <Đại diện nhóm>.', { before: 240 }));

const document = new Document({
  creator: 'Nhóm thực hiện',
  title: 'Phân tích sự tác động của các yêu cầu thay đổi - Inventory Manager',
  styles: { default: { document: { run: { font: 'Times New Roman', size: 26 }, paragraph: { spacing: { after: 100 } } }, heading1: { run: { font: 'Times New Roman', size: 30, bold: true }, paragraph: { spacing: { before: 240, after: 120 }, keepNext: true } }, heading2: { run: { font: 'Times New Roman', size: 26, bold: true }, paragraph: { spacing: { before: 180, after: 90 }, keepNext: true } } } },
  sections: [{ properties: { page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }, size: { width: 11906, height: 16838 } } }, children }],
});

Packer.toBuffer(document).then(buffer => fs.writeFileSync(output, buffer));
