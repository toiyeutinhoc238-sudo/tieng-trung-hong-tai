const XLSX = require('xlsx');
const wb = XLSX.readFile('filetuvung/TV Hán ngữ 1.xlsx');
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });

for (let i = 1; i <= 20; i++) {
  const r = rows[i];
  console.log(`Row ${i}: Word: ${r[2]} | Pinyin: ${r[3]} | POS: ${r[4]} | Meaning: ${r[5]} | Note: ${r[6]} | ExZh: ${r[7]} | ExVi: ${r[8]} | ExQ: ${r[9]} | ExAns: ${r[10]}`);
}
