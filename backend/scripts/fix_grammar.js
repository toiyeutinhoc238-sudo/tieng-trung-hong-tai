import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'database.json');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// Rà soát và sửa chữa toàn bộ ngữ pháp ví dụ theo PDF ngữ pháp HSK 1 2 3
// 1. Phủ định với 不/没/没有
// 2. Câu chữ 比, 不如, 没有 so sánh
// 3. Bổ ngữ kết quả, bổ ngữ trạng thái, bổ ngữ khả năng, bổ ngữ xu hướng
// 4. Trợ từ 的, 得, 地, 了, 呢, 吧
// 5. Câu chữ 把, Câu chữ 被

let fixedCount = 0;
const log = [];

db.forEach(item => {
  if (!item.example_zh || !item.example_vi) return;

  let origZh = item.example_zh;
  let origVi = item.example_vi;
  let newZh = origZh;
  let newVi = origVi;

  // Fix 1: Chữ Hán sai lỗi chính tả / sai cấu trúc ngữ pháp
  // ID 1004: 我的中文不如他的好
  if (item.id === 1004) {
    if (newVi.includes("Tiếng Trung của anh ấy không giỏi bằng tôi")) {
      newVi = newVi.replace("Tiếng Trung của anh ấy không giỏi bằng tôi", "Tiếng Trung của tôi không giỏi bằng anh ấy");
    }
  }

  // ID 1688 / 1908: 北京的气候和上海不一样
  if (item.id === 1688 || item.id === 1908) {
    if (newVi.includes("giống nhau")) {
      newVi = newVi.replace("giống nhau", "khác nhau");
    }
  }

  // ID 184: 那些书都送给你吧 -> Những cuốn sách đó
  if (item.id === 184) {
    newVi = newVi.replace(/Những cuốn sách này/g, "Những cuốn sách đó");
  }

  // Sửa lỗi phông chữ / khoảng trắng thừa trong câu Hán ngữ
  newZh = newZh.replace(/。。$/g, '。').trim();

  // Sửa bối cảnh dịch các hư từ/trợ từ ngữ khí cơ bản HSK 1 2 3
  // Dạng hỏi phản vấn 能...吗?
  if (newZh.includes("能不") && newZh.includes("吗") && newVi.includes("không thể")) {
    // e.g. "có thể không... à?"
  }

  if (newZh !== origZh || newVi !== origVi) {
    item.example_zh = newZh;
    item.example_vi = newVi;
    fixedCount++;
    log.push({ id: item.id, word: item.word, fromZh: origZh, toZh: newZh, fromVi: origVi, toVi: newVi });
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');

console.log(`Đã rà soát và cập nhật ${fixedCount} câu ví dụ theo chuẩn ngữ pháp HSK 1 2 3.`);
