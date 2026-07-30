/**
 * Script điền Pinyin cho tất cả từ vựng bị thiếu Pinyin trong database.json
 * Chạy: node scripts/fill_missing_pinyin.cjs
 */

const fs = require('fs');
const path = require('path');
const { pinyin } = require('pinyin-pro');

function fillPinyin() {
  const dbPath = path.join(__dirname, '../database.json');
  let database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  console.log(`📂 Database: ${database.length} từ vựng`);

  let filledCount = 0;
  database.forEach(w => {
    if (w && w.word && (!w.pinyin || !w.pinyin.trim())) {
      const generated = pinyin(w.word, { toneType: 'symbol', type: 'array' }).join('');
      if (generated) {
        w.pinyin = generated;
        filledCount++;
      }
    }
  });

  console.log(`✨ Đã bổ sung Pinyin cho ${filledCount} từ vựng!`);

  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');
  console.log(`✅ Đã cập nhật database.json thành công!`);
}

fillPinyin();
