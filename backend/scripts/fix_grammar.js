import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'database.json');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

console.log(`Đã nạp ${db.length} từ vựng từ database.json để rà soát ngữ pháp.`);

let fixedCount = 0;
const errors = [];

db.forEach(item => {
  if (!item.example_zh || !item.example_vi) return;

  let zh = item.example_zh;
  let vi = item.example_vi;
  let originalZh = zh;
  let originalVi = vi;

  // 1. Sửa lỗi chính tả & dấu câu tiếng Trung
  zh = zh.replace(/。。$/g, '。').replace(/？？$/g, '？').replace(/！！$/g, '！');

  // 2. Chỉnh sửa vị trí ngữ pháp tiêu chuẩn trong tài liệu HSK 1 2 3 PDF

  // A 不如 B = A không bằng B (ngữ pháp HSK 2-3)
  if (zh.includes('不如') && vi.includes('không giỏi bằng')) {
    // ví dụ ID 1004: 我的中文不如他的好 -> Tiếng Trung của tôi không giỏi bằng anh ấy
    if (item.id === 1004 && vi.includes('anh ấy không giỏi bằng tôi')) {
      vi = 'Tiếng Trung của tôi không giỏi bằng anh ấy.';
    }
  }

  // 不一样 = khác nhau (ngữ pháp HSK 2)
  if (zh.includes('不一样') && vi.includes('giống nhau')) {
    vi = vi.replace('giống nhau', 'khác nhau');
  }

  // 都不 = đều không (phủ định toàn bộ) vs 不都 = không phải đều (phủ định một phần)
  // (Theo trang 7 PDF Ngữ pháp HSK 1)
  if (zh.includes('都不') && vi.includes('không đều')) {
    vi = vi.replace('không đều', 'đều không');
  }

  // Cấu trúc 比: A 比 B + tính từ
  if (item.id === 184 && vi.includes('Những cuốn sách này')) {
    vi = vi.replace('Những cuốn sách này', 'Những cuốn sách đó');
  }

  if (zh !== originalZh || vi !== originalVi) {
    item.example_zh = zh;
    item.example_vi = vi;
    fixedCount++;
    errors.push({ id: item.id, word: item.word, fromZh: originalZh, toZh: zh, fromVi: originalVi, toVi: vi });
  }
});

// Lưu lại database đã rà soát
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');

console.log(`✅ Đã hoàn tất rà soát ngữ pháp! Đã hiệu chỉnh ${fixedCount} lỗi ngữ pháp/câu ví dụ.`);
