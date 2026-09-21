/**
 * Script trích xuất toàn bộ câu hỏi từ "filetuvung/Câu hỏi cho HSKK.xlsx"
 * Xuất ra JSON cho cả Backend và Frontend
 */

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const excelPath = path.resolve(__dirname, '../../filetuvung/Câu hỏi cho HSKK.xlsx');
if (!fs.existsSync(excelPath)) {
  console.error('Không tìm thấy file Excel tại:', excelPath);
  process.exit(1);
}

const wb = xlsx.readFile(excelPath);
const result = {
  so: [],
  trung: [],
  cao: []
};

// Sheet Sơ
if (wb.Sheets['Sơ']) {
  const rows = xlsx.utils.sheet_to_json(wb.Sheets['Sơ']);
  result.so = rows.map((r, idx) => {
    const q = (r['Câu hỏi'] || '').toString().trim();
    return {
      id: `so_${idx + 1}`,
      stt: r['STT'] || (idx + 1),
      level: 'so',
      levelName: 'Sơ cấp',
      hskLevel: 'HSKK Sơ cấp',
      question: q
    };
  }).filter(item => item.question.length > 0);
}

// Sheet Trung
if (wb.Sheets['Trung']) {
  const rows = xlsx.utils.sheet_to_json(wb.Sheets['Trung']);
  result.trung = rows.map((r, idx) => {
    const q = (r['Câu hỏi'] || '').toString().trim();
    return {
      id: `trung_${idx + 1}`,
      stt: r['STT'] || (idx + 1),
      level: 'trung',
      levelName: 'Trung cấp',
      hskLevel: 'HSKK Trung cấp',
      question: q
    };
  }).filter(item => item.question.length > 0);
}

// Sheet Cao
if (wb.Sheets['Cao']) {
  const rows = xlsx.utils.sheet_to_json(wb.Sheets['Cao']);
  result.cao = rows.map((r, idx) => {
    const q = (r['Câu hỏi'] || '').toString().trim();
    return {
      id: `cao_${idx + 1}`,
      stt: r['STT'] || (idx + 1),
      level: 'cao',
      levelName: 'Cao cấp',
      hskLevel: 'HSKK Cao cấp',
      question: q
    };
  }).filter(item => item.question.length > 0);
}

console.log(`Đã đọc thành công:`);
console.log(`- Sơ cấp: ${result.so.length} câu`);
console.log(`- Trung cấp: ${result.trung.length} câu`);
console.log(`- Cao cấp: ${result.cao.length} câu`);
console.log(`- Tổng cộng: ${result.so.length + result.trung.length + result.cao.length} câu`);

// Xuất file cho backend
const backendDataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(backendDataDir)) {
  fs.mkdirSync(backendDataDir, { recursive: true });
}
const backendOutPath = path.join(backendDataDir, 'hskk_questions.json');
fs.writeFileSync(backendOutPath, JSON.stringify(result, null, 2), 'utf8');
console.log('Đã lưu dữ liệu backend tại:', backendOutPath);

// Xuất file cho frontend
const frontendDataDir = path.resolve(__dirname, '../../frontend/public/data');
if (!fs.existsSync(frontendDataDir)) {
  fs.mkdirSync(frontendDataDir, { recursive: true });
}
const frontendOutPath = path.join(frontendDataDir, 'hskk_questions.json');
fs.writeFileSync(frontendOutPath, JSON.stringify(result, null, 2), 'utf8');
console.log('Đã lưu dữ liệu frontend tại:', frontendOutPath);
