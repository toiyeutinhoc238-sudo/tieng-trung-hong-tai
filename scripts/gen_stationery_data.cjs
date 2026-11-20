// Sinh dữ liệu game "我的文具店" (Cửa hàng văn phòng phẩm) → frontend/src/shop_data/stationery.js
// Danh mục theo Master Prompt (6 nhóm, 41 sản phẩm, giá nhập/bán, màu, lượng từ). Sửa bảng bên dưới rồi chạy:  node scripts/gen_stationery_data.cjs
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { pinyin } = require(path.join(ROOT, 'frontend/node_modules/pinyin-pro'));
const py = (zh) => { try { return pinyin(zh, { toneType: 'symbol', nonZh: 'consecutive' }); } catch (e) { return ''; } };

const COLORS = {
  '蓝色': ['Xanh dương', '#1e88e5'], '红色': ['Đỏ', '#e53935'], '黑色': ['Đen', '#2b2b2b'], '黄色': ['Vàng', '#fdd835'], '粉色': ['Hồng', '#f48fb1'],
  '绿色': ['Xanh lá', '#43a047'], '紫色': ['Tím', '#8e24aa'], '白色': ['Trắng', '#fafafa'], '橙色': ['Cam', '#fb8c00']
};
const CATS = [
  { id: 'BEN', chn: '本子', vi: 'Vở và giấy', icon: '📓', unlock: 0 },
  { id: 'BUT', chn: '笔', vi: 'Các loại bút', icon: '🖊️', unlock: 0 },
  { id: 'DUNGCU', chn: '工具', vi: 'Dụng cụ học tập', icon: '📏', unlock: 100 },
  { id: 'CAP', chn: '书包和文具盒', vi: 'Cặp sách & hộp bút', icon: '🎒', unlock: 220 },
  { id: 'MYTHUAT', chn: '美术用品', vi: 'Dụng cụ mỹ thuật', icon: '🎨', unlock: 160 },
  { id: 'KHAC', chn: '其他用品', vi: 'Sản phẩm khác', icon: '🧮', unlock: 120 }
];
const ALL5 = ['蓝色', '红色', '黑色'];
const BRIGHT = ['黄色', '粉色', '绿色', '蓝色', '橙色'];
const CUTE = ['粉色', '蓝色', '紫色', '黄色'];
// [mã, nhóm, 中文, Việt, lượng từ, nghĩa lượng từ, giá bán, giá nhập, màu, icon]
const P = [
  ['BEN01', 'BEN', '笔记本', 'Vở ghi chép', '本', 'quyển', 6, 3.5, null, '📓'],
  ['BEN02', 'BEN', '练习本', 'Vở bài tập', '本', 'quyển', 4.5, 2.5, null, '📘'],
  ['BEN03', 'BEN', '作业本', 'Vở bài tập về nhà', '本', 'quyển', 3, 1.6, null, '📒'],
  ['BEN04', 'BEN', '日记本', 'Sổ nhật ký', '本', 'quyển', 12, 7, CUTE, '📔'],
  ['BEN05', 'BEN', '便签纸', 'Giấy ghi chú', '本', 'tập', 5, 2.8, BRIGHT, '🗒️'],
  ['BEN06', 'BEN', '彩纸', 'Giấy màu', '包', 'gói', 4, 2.2, BRIGHT, '📄'],
  ['BEN07', 'BEN', '画纸', 'Giấy vẽ', '本', 'tập', 5, 2.8, null, '🖼️'],
  ['BEN08', 'BEN', '文件夹', 'Bìa tài liệu', '个', 'cái', 8, 4.5, ['蓝色', '粉色', '绿色', '黄色'], '📁'],
  ['BUT01', 'BUT', '圆珠笔', 'Bút bi', '支', 'cây', 2.5, 1.5, ALL5, '🖊️'],
  ['BUT02', 'BUT', '铅笔', 'Bút chì', '支', 'cây', 1.5, 0.8, null, '✏️'],
  ['BUT03', 'BUT', '自动铅笔', 'Bút chì bấm', '支', 'cây', 4, 2.2, null, '✏️'],
  ['BUT04', 'BUT', '彩色笔', 'Bút màu', '盒', 'hộp', 12, 7, null, '🖍️'],
  ['BUT05', 'BUT', '荧光笔', 'Bút dạ quang', '支', 'cây', 3.5, 2, BRIGHT, '🖍️'],
  ['BUT06', 'BUT', '水彩笔', 'Bút màu nước', '盒', 'hộp', 15, 9, null, '🖌️'],
  ['BUT07', 'BUT', '钢笔', 'Bút máy', '支', 'cây', 18, 10, ['蓝色', '黑色', '红色'], '🖋️'],
  ['BUT08', 'BUT', '白板笔', 'Bút lông bảng', '支', 'cây', 4, 2.3, ['黑色', '蓝色', '红色'], '🖊️'],
  ['DUNGCU01', 'DUNGCU', '尺子', 'Thước kẻ', '把', 'cái', 3, 1.8, null, '📏'],
  ['DUNGCU02', 'DUNGCU', '橡皮', 'Cục tẩy', '块', 'cục', 1.5, 0.8, null, '🧽'],
  ['DUNGCU03', 'DUNGCU', '卷笔刀', 'Gọt bút chì', '个', 'cái', 2.5, 1.4, null, '🔧'],
  ['DUNGCU04', 'DUNGCU', '剪刀', 'Kéo', '把', 'cái', 6, 3.5, null, '✂️'],
  ['DUNGCU05', 'DUNGCU', '胶水', 'Hồ dán', '瓶', 'lọ', 3, 1.7, null, '🧴'],
  ['DUNGCU06', 'DUNGCU', '胶带', 'Băng keo', '卷', 'cuộn', 4, 2.2, null, '📼'],
  ['DUNGCU07', 'DUNGCU', '订书机', 'Dập ghim', '个', 'cái', 12, 7, null, '🗜️'],
  ['DUNGCU08', 'DUNGCU', '回形针', 'Kẹp giấy', '盒', 'hộp', 2, 1, null, '📎'],
  ['CAP01', 'CAP', '文具盒', 'Hộp bút', '个', 'cái', 15, 9, CUTE, '🧰'],
  ['CAP02', 'CAP', '笔袋', 'Túi đựng bút', '个', 'cái', 12, 7, CUTE, '👝'],
  ['CAP03', 'CAP', '书包', 'Cặp sách', '个', 'cái', 68, 45, ['粉色', '蓝色', '黄色'], '🎒'],
  ['CAP04', 'CAP', '文件袋', 'Túi tài liệu', '个', 'cái', 6, 3.4, ['蓝色', '粉色', '绿色'], '💼'],
  ['CAP05', 'CAP', '文件盒', 'Hộp hồ sơ', '个', 'cái', 18, 10, null, '🗃️'],
  ['CAP06', 'CAP', '画板', 'Bảng vẽ', '块', 'cái', 25, 14, null, '🖼️'],
  ['MYTHUAT01', 'MYTHUAT', '颜料', 'Màu vẽ', '盒', 'hộp', 10, 5.5, null, '🎨'],
  ['MYTHUAT02', 'MYTHUAT', '画笔', 'Cọ vẽ', '支', 'cây', 5, 2.8, null, '🖌️'],
  ['MYTHUAT03', 'MYTHUAT', '调色盘', 'Bảng pha màu', '个', 'cái', 6, 3.3, null, '🎨'],
  ['MYTHUAT04', 'MYTHUAT', '彩泥', 'Đất nặn màu', '盒', 'hộp', 8, 4.5, null, '🟣'],
  ['MYTHUAT05', 'MYTHUAT', '手工纸', 'Giấy thủ công', '包', 'gói', 5, 2.8, BRIGHT, '📜'],
  ['MYTHUAT06', 'MYTHUAT', '画册', 'Tập tranh', '本', 'quyển', 15, 8, null, '📖'],
  ['KHAC01', 'KHAC', '计算器', 'Máy tính', '个', 'cái', 35, 20, null, '🧮'],
  ['KHAC02', 'KHAC', '地球仪', 'Quả địa cầu', '个', 'cái', 30, 18, null, '🌐'],
  ['KHAC03', 'KHAC', '书签', 'Kẹp sách', '张', 'cái', 2, 1, BRIGHT, '🔖'],
  ['KHAC04', 'KHAC', '书皮', 'Bao bìa sách', '张', 'tấm', 2.5, 1.3, null, '📕'],
  ['KHAC05', 'KHAC', '订书钉', 'Ghim dập', '盒', 'hộp', 2, 1, null, '📌']
];
const perCat = {};
const items = P.map(([id, cat, zh, vi, m, mvi, price, cost, colors, icon]) => {
  const i = perCat[cat] = (perCat[cat] || 0) + 1;
  return { id, group: cat, chn: zh, pin: py(zh), vi, measure: m, measureVi: mvi, price, cost, colors, icon, tier: i <= 4 ? 0 : i <= 6 ? 1 : 2 };
});
const colors = Object.fromEntries(Object.entries(COLORS).map(([zh, [vi, hex]]) => [zh, { zh, pin: py(zh), vi, hex }]));
const data = { groups: CATS.map((c) => ({ ...c, pin: py(c.chn) })), items, colors };
fs.mkdirSync(path.join(ROOT, 'frontend/src/shop_data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'frontend/src/shop_data/stationery.js'), '// SINH TỰ ĐỘNG bởi scripts/gen_stationery_data.cjs — đừng sửa tay.\nexport default ' + JSON.stringify(data, null, 1) + ';\n');
console.log('products', items.length, 'colors', Object.keys(colors).length);
