import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'database.json');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// 5 IDs chưa match ở lượt chạy trước do chuỗi exact match hoặc ký tự xuống dòng / unicode:
// 1004, 1688, 184, 640, 2082

const remainingFixes = [
  {
    id: 1004, // 不如
    field: 'example_vi',
    fixFunc: (current) => {
      // Sửa câu đầu tiên trong chuỗi đa dòng: "Tiếng Trung của anh ấy không giỏi bằng tôi." -> "Tiếng Trung của tôi không giỏi bằng anh ấy."
      return current.replace('Tiếng Trung của anh ấy không giỏi bằng tôi.', 'Tiếng Trung của tôi không giỏi bằng anh ấy.');
    }
  },
  {
    id: 1688, // 气候 (HSK 3.0 / HSK cấp độ khác)
    field: 'example_vi',
    fixFunc: (current) => {
      // 气候 có 2 entry hoặc giá trị thực tế khác. Kiểm tra xem nếu có 不一样 thì sửa thành khác nhau
      if (current.includes('giống nhau')) {
        return current.replace('giống nhau', 'khác nhau');
      }
      return current;
    }
  },
  {
    id: 184, // 那些
    field: 'example_vi',
    fixFunc: (current) => {
      // 那些 = những cái đó (chỉ xa)
      return current.replace(/này/gi, 'đó');
    }
  },
  {
    id: 640, // 斤
    field: 'example_vi',
    fixFunc: (current) => {
      // 两斤 = 2 cân, không phải 1 cân
      return current.replace('một cân', 'hai cân').replace('một cân', 'hai cân');
    }
  },
  {
    id: 2082, // 通常
    field: 'example_vi',
    fixFunc: (current) => {
      // Chuẩn hóa
      return 'Thông thường, tôi dậy lúc 7 giờ.';
    }
  }
];

let count = 0;
for (const fix of remainingFixes) {
  const entry = db.find(e => e.id === fix.id);
  if (entry) {
    const oldVal = entry[fix.field];
    const newVal = fix.fixFunc(oldVal);
    if (oldVal !== newVal) {
      entry[fix.field] = newVal;
      count++;
      console.log(`✅ Fixed ID ${fix.id} [${fix.field}]`);
      console.log(`   FROM: ${JSON.stringify(oldVal)}`);
      console.log(`   TO:   ${JSON.stringify(newVal)}\n`);
    } else {
      console.log(`ℹ️  ID ${fix.id} unchanged or already fixed.`);
    }
  } else {
    console.log(`❌ ID ${fix.id} not found in database.`);
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
console.log(`\n🎉 Đã hoàn tất sửa thêm ${count} lỗi còn lại.`);
