// Sinh danh mục Tiệm Tạp Hóa từ "Tạp hóa.xlsx" rồi ghi thẳng vào frontend/src/grocery_game.js
// Cách dùng (ở thư mục gốc dự án):
//   npm i --no-save xlsx@0.18.5
//   node scripts/gen_grocery_catalog.cjs
//   cd frontend && npm run build
// Thêm món mới: thêm dòng vào sheet tương ứng + vẽ hình cho món đó trong scripts/gen_grocery_icons.cjs rồi chạy script đó.
const X = require('xlsx');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'Tạp hóa.xlsx');
const TARGET = path.join(ROOT, 'frontend/src/grocery_game.js');
const wb = X.readFile(SRC);
const rows = (n) => X.utils.sheet_to_json(wb.Sheets[n], { defval: '' }).filter(r => Object.values(r).some(v => String(v).trim()));

// 6 khu = 6 sheet (tên tiếng Trung, icon, tiền mở khu do game đặt)
const ZONES = [
  { sheet: 'Đồ ăn & gia vị', id: 'food', chn: '食品调料', pin: 'shípǐn tiáoliào', vi: 'Đồ ăn & gia vị', short: 'Đồ ăn', icon: '🍜', unlockCost: 0 },
  { sheet: 'Đồ uống', id: 'drinks', chn: '饮料', pin: 'yǐnliào', vi: 'Đồ uống', short: 'Đồ uống', icon: '🧃', unlockCost: 0 },
  { sheet: 'Sữa & thực phẩm lạnh', id: 'dairy', chn: '冷藏食品', pin: 'lěngcáng shípǐn', vi: 'Sữa & thực phẩm lạnh', short: 'Đồ lạnh', icon: '🧊', unlockCost: 150 },
  { sheet: 'Đồ vệ sinh & gia dụng', id: 'household', chn: '日用清洁', pin: 'rìyòng qīngjié', vi: 'Đồ vệ sinh & gia dụng', short: 'Gia dụng', icon: '🧺', unlockCost: 300 },
  { sheet: 'Chăm sóc cá nhân', id: 'personal', chn: '个人护理', pin: 'gèrén hùlǐ', vi: 'Chăm sóc cá nhân', short: 'Cá nhân', icon: '🧴', unlockCost: 400 },
  { sheet: 'Văn phòng phẩm & đồ dùng', id: 'stationery', chn: '文具', pin: 'wénjù', vi: 'Văn phòng phẩm & đồ dùng', short: 'Văn phòng phẩm', icon: '✏️', unlockCost: 200 }
];
// Hình của từng món nằm ở scripts/gen_grocery_icons.cjs (mỗi món đúng 1 hình, vẽ riêng — không dùng emoji)
const { ICONS } = require('./gen_grocery_icons.cjs');

// Lượng từ (sheet riêng): chữ → pinyin, cách dùng, ví dụ
const Q = rows('Lượng từ').map(r => ({ chn: String(r['Lượng từ']).trim(), pin: String(r['Pinyin']).trim(), use: String(r['Cách dùng']).trim(), ex: String(r['Ví dụ tiếng Trung']).trim(), exVi: String(r['Nghĩa tiếng Việt']).trim() }));
const qPin = Object.fromEntries(Q.map(q => [q.chn, q.pin]));

const NUMS = '一两二三四五六七八九十';
const round5 = (v) => Math.ceil(v / 5) * 5;
const half = (v) => Math.round(v * 2) / 2;
const problems = [];
const items = [];
for (const z of ZONES) {
  const list = rows(z.sheet).map((r, idx) => {
    const chn = String(r['Tên sản phẩm (中文)']).trim();
    const sample = String(r['Cụm từ mẫu']).trim();
    const sampleVi = String(r['Nghĩa cụm từ']).trim();
    // lượng từ dùng khi gọi món = chữ ngay sau số đếm trong "Cụm từ mẫu" (vd 一盒鸡蛋 → 盒)
    const qChar = NUMS.includes(sample[0]) ? sample[1] : String(r['Lượng từ thường dùng']).trim()[0];
    const qVi = sampleVi.replace(/^(một|hai|ba)\s+/i, '').split(/\s+/)[0];
    const price = Number(r['Giá game (¥)']);
    if (!qPin[qChar]) problems.push(`${chn}: lượng từ ${qChar} không có trong sheet Lượng từ`);
    if (!(price > 0)) problems.push(`${chn}: giá không hợp lệ`);
    if (!ICONS[String(r['Mã']).trim().toLowerCase()]) problems.push(`${chn} (${r['Mã']}): chưa có hình trong scripts/gen_grocery_icons.cjs`);
    return { idx, code: String(r['Mã']).trim(), chn, pin: String(r['Pinyin']).trim(), vi: String(r['Nghĩa tiếng Việt']).trim(), qChar, qVi, price, sample, sampleVi, note: String(r['Ghi chú']).trim() };
  });
  // 3 món rẻ nhất mỗi khu bán sẵn khi khu được mở; các món khác mở ở 批发市场
  const free = new Set([...list].sort((a, b) => a.price - b.price || a.idx - b.idx).slice(0, 3).map(x => x.code));
  for (const it of list) {
    const cost = Math.max(0.5, half(it.price * 0.6));
    const maxStock = it.price <= 5 ? 12 : it.price <= 12 ? 10 : it.price <= 25 ? 8 : 6;
    const unlockCost = free.has(it.code) ? 0 : round5(Math.max(10, it.price * 3));
    items.push({ zone: z.id, ...it, cost, maxStock, unlockCost });
  }
}
if (problems.length) { console.error('LỖI DỮ LIỆU:\n' + problems.join('\n')); process.exit(1); }

const S = rows('Mẫu câu').map(r => ({ chn: String(r['Câu tiếng Trung']).trim(), pin: String(r['Pinyin']).trim(), vi: String(r['Nghĩa tiếng Việt']).trim(), topic: String(r['Tình huống']).trim(), who: String(r['Người nói']).trim() }));

const js = (v) => JSON.stringify(v).replace(/"/g, "'").replace(/\\'/g, "\\'");
const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
let out = '';
out += `// ==== SINH TỰ ĐỘNG từ "Tạp hóa.xlsx" (scripts/gen_grocery_catalog.cjs) — sửa file Excel rồi chạy lại, đừng sửa tay khối này ====\n`;
out += `const GROCERY_ZONES = [\n${ZONES.map(z => `  { id: ${q(z.id)}, chn: ${q(z.chn)}, pin: ${q(z.pin)}, vi: ${q(z.vi)}, short: ${q(z.short)}, icon: ${q(z.icon)}, unlockCost: ${z.unlockCost} }`).join(',\n')}\n];\n\n`;
out += `// Hàng hóa (đúng tên / pinyin / nghĩa / lượng từ / giá trong file). unlockCost 0 = bán ngay khi khu được mở; còn lại mở ở 批发市场.\n`;
out += `const I = (zone, id, nameChn, pinyin, nameVi, quantifier, qPin, quantifierVi, cost, price, maxStock, emoji, unlockCost) =>\n  ({ zone, id, nameChn, pinyin, nameVi, quantifier, qPin, quantifierVi, cost, price, maxStock, emoji, unlockCost });\n\n`;
out += `const GROCERY_ITEMS = [\n`;
for (const z of ZONES) {
  out += `  // ${z.chn} · ${z.vi}\n`;
  for (const it of items.filter(i => i.zone === z.id)) {
    out += `  I(${q(z.id)}, ${q(it.code.toLowerCase())}, ${q(it.chn)}, ${q(it.pin)}, ${q(it.vi)}, ${q(it.qChar)}, ${q(qPin[it.qChar])}, ${q(it.qVi)}, ${it.cost}, ${it.price}, ${it.maxStock}, '', ${it.unlockCost}),\n`;
  }
}
out = out.replace(/,\n$/, '\n') + `];\n\n`;
out += `// Lượng từ (sheet "Lượng từ")\nconst QUANTIFIER_WORDS = [\n${Q.map(x => `  { chn: ${q(x.chn)}, pin: ${q(x.pin)}, vi: ${q(`${x.use} VD: ${x.ex} (${x.exVi})`)} }`).join(',\n')}\n];\n\n`;
out += `// Mẫu câu (sheet "Mẫu câu") — who: 顾客 khách / 店员 nhân viên\nconst SHOP_SENTENCES = [\n${S.map(x => `  { chn: ${q(x.chn)}, pin: ${q(x.pin)}, vi: ${q(x.vi)}, topic: ${q(x.topic)}, who: ${q(x.who)} }`).join(',\n')}\n];\n`;
out += `// ==== HẾT KHỐI SINH TỰ ĐỘNG ====\n`;
// ghép vào game: thay khối giữa 2 dấu SINH TỰ ĐỘNG
let game = fs.readFileSync(TARGET, 'utf8');
const a = game.indexOf('// ==== SINH TỰ ĐỘNG');
const bMark = '// ==== HẾT KHỐI SINH TỰ ĐỘNG ====\n';
const b = game.indexOf(bMark);
if (a < 0 || b < 0) { console.error('Không tìm thấy khối SINH TỰ ĐỘNG trong grocery_game.js'); process.exit(1); }
game = game.slice(0, a) + out + game.slice(b + bMark.length);
fs.writeFileSync(TARGET, game);
console.log(`OK: ${ZONES.length} khu, ${items.length} món, ${Q.length} lượng từ, ${S.length} mẫu câu`);
for (const z of ZONES) {
  const zi = items.filter(i => i.zone === z.id);
  console.log(`  ${z.chn} (${zi.length}): bán sẵn = ${zi.filter(i => !i.unlockCost).map(i => i.chn + ' ' + i.price + '¥').join(', ')}`);
}
console.log('Lượng từ khi gọi món:', [...new Set(items.map(i => i.qChar))].join(' '));
