// Sinh dữ liệu 4 game tiệm mới từ các file Excel ở thư mục gốc dự án:
//   Quần áo.xlsx · Bánh mì.xlsx · Cá viên.xlsx · Tiệm mĩ phẩm.xlsx
// → frontend/src/shop_data/{clothes,banhmi,cavien,mypham}.js
// Cách dùng (ở thư mục gốc dự án):  node scripts/gen_shop_data.cjs
// Sửa Excel rồi chạy lại; đừng sửa tay các file trong shop_data/.
const X = require('xlsx');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'frontend/src/shop_data');
fs.mkdirSync(OUT, { recursive: true });
const { pinyin } = require(path.join(ROOT, 'frontend/node_modules/pinyin-pro'));
const py = (zh) => { try { return pinyin(zh, { toneType: 'symbol' }); } catch (e) { return ''; } };

const load = (file) => X.readFile(path.join(ROOT, file + '.xlsx'));
const grid = (wb, name) => X.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' }).filter(r => r.some(c => String(c).trim() !== ''));
const s = (v) => String(v == null ? '' : v).trim();
// nghĩa tiếng Việt đôi khi lẫn chữ Hán trong file ("thật不错 / rất tốt") → bỏ phần chữ Hán thừa
const cleanVi = (v) => s(v).replace(/\s*\S*[一-鿿]\S*\s*\/\s*/g, ' ').replace(/[一-鿿]+/g, '').replace(/\s{2,}/g, ' ').trim();
const write = (name, data) => {
  const body = `// SINH TỰ ĐỘNG bởi scripts/gen_shop_data.cjs từ file Excel — đừng sửa tay.\nexport default ${JSON.stringify(data, null, 1)};\n`;
  fs.writeFileSync(path.join(OUT, name + '.js'), body);
  console.log('wrote', name, Math.round(body.length / 1024) + 'KB');
};
const unlockTier = (v) => { const m = s(v).match(/(\d+)/); return m ? +m[1] : 0; };
const list = (v) => s(v).split(/[;,]/).map(x => x.trim()).filter(Boolean);

// -------------------------------------------------------------------------------------------------------------------
// 1. QUẦN ÁO
// -------------------------------------------------------------------------------------------------------------------
(function clothes() {
  const wb = load('Quần áo');
  const GROUPS = [
    { id: 'ao', sheet: '01_Ao', chn: '上衣', pin: 'shàngyī', vi: 'Áo', icon: '👕', measure: '件', measureVi: 'chiếc' },
    { id: 'quan', sheet: '02_Quan', chn: '裤子', pin: 'kùzi', vi: 'Quần', icon: '👖', measure: '条', measureVi: 'chiếc' },
    { id: 'vay', sheet: '03_Vay', chn: '裙子', pin: 'qúnzi', vi: 'Váy', icon: '👗', measure: '条', measureVi: 'chiếc' },
    { id: 'giay', sheet: '04_Giay_dep', chn: '鞋子', pin: 'xiézi', vi: 'Giày dép', icon: '👟', measure: '双', measureVi: 'đôi' }
  ];
  const sizes = {}, colors = {};
  grid(wb, '05_Size_Mau').slice(2).forEach(r => {
    const [grp, val, zh, pin] = r.map(s);
    if (!val || !zh) return;
    (/^Size/.test(grp) ? sizes : colors)[val] = { zh, pin };
  });
  // màu có trong sản phẩm nhưng thiếu trong bảng màu → bổ sung
  const EXTRA_COLORS = { 'Xanh đậm': ['深蓝色', 'shēnlánsè'], 'Xanh rêu': ['军绿色', 'jūnlǜsè'], 'Nền trắng': ['白底', 'báidǐ'], 'Nền đen': ['黑底', 'hēidǐ'], 'Nền xanh': ['蓝底', 'lándǐ'], 'Nền hồng': ['粉底', 'fěndǐ'] };
  const items = [];
  GROUPS.forEach((g, gi) => {
    grid(wb, g.sheet).slice(2).forEach((r, i) => {
      const [code, vi, zh, pin, price, sz, col] = r.map(s);
      if (!code || !zh) return;
      const colList = list(col).map(c => c.charAt(0).toUpperCase() + c.slice(1));
      colList.forEach(c => { if (!colors[c]) { const e = EXTRA_COLORS[c]; if (!e) throw new Error('thiếu màu ' + c); colors[c] = { zh: e[0], pin: e[1] }; } });
      items.push({ id: code, group: g.id, chn: zh, pin: pin === 'T-xù' ? 'T xù' : pin, vi, price: +price, sizes: list(sz), colors: colList, tier: i < 4 ? 0 : i < 6 ? 1 : 2 });
    });
  });
  const dialogue = grid(wb, '06_Hoi_thoai').slice(1).map(r => ({ stage: s(r[0]), role: s(r[1]), topic: s(r[2]), zh: s(r[3]), pin: s(r[4]), vi: cleanVi(r[5]) })).filter(x => x.zh);
  const reviews = grid(wb, '07_Danh_gia').slice(1).map(r => ({ id: s(r[0]), tone: s(r[1]), topic: s(r[2]), zh: s(r[3]), pin: s(r[4]), vi: cleanVi(r[5]) })).filter(x => x.zh);
  write('clothes', { groups: GROUPS.map(({ sheet, ...g }) => g), items, sizes, colors, dialogue, reviews });
})();

// -------------------------------------------------------------------------------------------------------------------
// 2. BÁNH MÌ
// -------------------------------------------------------------------------------------------------------------------
(function banhmi() {
  const wb = load('Bánh mì');
  // từ điển nguyên liệu (file không có chữ Hán cho nguyên liệu của bánh mì Việt)
  const ING = {
    'bánh mì việt nam': ['越南面包', 'base'], 'bánh hamburger': ['汉堡面包', 'base'], 'bánh sandwich': ['三明治面包', 'base'],
    'pate': ['肝酱', 'sauce'], 'bơ': ['黄油', 'sauce'], 'dưa leo': ['黄瓜', 'veg'], 'ngò': ['香菜', 'veg'], 'đồ chua': ['腌萝卜', 'veg'],
    'chả lụa': ['越南火腿', 'meat'], 'thịt nguội': ['火腿', 'meat'], 'xá xíu': ['叉烧', 'meat'], 'xíu mại': ['肉丸', 'meat'], 'thịt gà xé': ['鸡丝', 'meat'],
    'trứng ốp la': ['煎蛋', 'egg'], 'trứng': ['鸡蛋', 'egg'], 'sốt xíu mại': ['肉丸酱', 'sauce'], 'tương ớt': ['辣椒酱', 'sauce'], 'sốt': ['酱汁', 'sauce'],
    'thịt bò': ['牛肉', 'meat'], 'gà chiên': ['炸鸡', 'meat'], 'thịt gà': ['鸡肉', 'meat'], 'cá ngừ': ['金枪鱼', 'meat'],
    'phô mai': ['芝士', 'dairy'], 'xà lách': ['生菜', 'veg'], 'cà chua': ['西红柿', 'veg'], 'hành tây': ['洋葱', 'veg'], 'mayonnaise': ['蛋黄酱', 'sauce'],
    'dưa chuột muối': ['酸黄瓜', 'veg']
  };
  const ICON = { 'pate': '🫕', 'bơ': '🧈', 'dưa leo': '🥒', 'ngò': '🌿', 'đồ chua': '🥕', 'chả lụa': '🥓', 'thịt nguội': '🍖', 'xá xíu': '🍖', 'xíu mại': '🍡', 'thịt gà xé': '🍗', 'trứng ốp la': '🍳', 'trứng': '🥚', 'sốt xíu mại': '🥫', 'tương ớt': '🌶️', 'sốt': '🥫', 'thịt bò': '🥩', 'gà chiên': '🍗', 'thịt gà': '🍗', 'cá ngừ': '🐟', 'phô mai': '🧀', 'xà lách': '🥬', 'cà chua': '🍅', 'hành tây': '🧅', 'mayonnaise': '🥫', 'dưa chuột muối': '🥒' };
  const ingredients = {};
  const ing = (vi) => {
    const key = vi.toLowerCase();
    if (!ING[key]) throw new Error('thiếu nguyên liệu: ' + vi);
    if (!ingredients[key]) ingredients[key] = { id: key, vi: vi.charAt(0).toUpperCase() + vi.slice(1), zh: ING[key][0], pin: py(ING[key][0]), kind: ING[key][1], icon: ICON[key] || '🥪' };
    return key;
  };
  const items = [];
  // Bánh mì Việt Nam
  grid(wb, '01_Banh_mi').slice(3).forEach(r => {
    const [code, vi, zh, pin, price, recipe, note, , unlock] = r.map(s);
    if (!code || !zh) return;
    items.push({ id: code, group: 'banhmi', chn: zh, pin, vi, price: Math.round(+price / 1000), ingredients: list(recipe).map(ing), note, tier: unlockTier(unlock) });
  });
  // Hamburger / Sandwich: công thức ghi bằng tên; có bảng mã topping riêng
  const hbRows = grid(wb, '02_Hamburger_Sandwich').slice(3);
  hbRows.forEach(r => {
    const [code, grp, vi, zh, pin, price, recipe, note, , unlock] = r.map(s);
    if (!code || !zh) return;
    items.push({ id: code, group: grp.toLowerCase() === 'hamburger' ? 'hamburger' : 'sandwich', chn: zh, pin, vi, price: Math.round(+price / 1000), ingredients: list(recipe).map(ing), note, tier: unlockTier(unlock) });
  });
  const drinks = grid(wb, '04_Nuoc_uong').slice(3).map(r => {
    const [code, vi, zh, pin, price, unlock] = r.map(s);
    return code && zh ? { id: code, group: 'drink', chn: zh, pin, vi, price: Math.round(+price / 1000), tier: unlockTier(unlock) } : null;
  }).filter(Boolean);
  // Nguyên liệu có thể thêm cho từng loại (lấy từ sheet topping: cột "Dùng cho")
  const addable = { hamburger: [], sandwich: [], banhmi: ['trứng ốp la', 'chả lụa', 'pate', 'tương ớt', 'xíu mại', 'bơ', 'dưa leo', 'đồ chua', 'ngò'] };
  const toppingNames = { TP01: 'thịt bò', TP02: 'thịt gà', TP03: 'thịt nguội', TP04: 'cá ngừ', TP05: 'trứng ốp la', TP06: 'trứng', TP07: 'phô mai', TP08: 'xà lách', TP09: 'cà chua', TP10: 'hành tây', TP11: 'dưa leo', TP12: 'dưa chuột muối', TP13: 'bơ', TP14: 'mayonnaise', TP15: 'tương cà', TP16: 'mù tạt', TP17: 'tương ớt', TP18: 'sốt bbq' };
  const EXTRA_ING = { 'tương cà': ['番茄酱', 'sauce', '🍅'], 'mù tạt': ['芥末酱', 'sauce', '🟡'], 'sốt bbq': ['烧烤酱', 'sauce', '🍖'] };
  Object.entries(EXTRA_ING).forEach(([k, v]) => { ING[k] = [v[0], v[1]]; ICON[k] = v[2]; });
  grid(wb, 'topping').slice(1, 19).forEach(r => {
    const [code, , , , , useFor] = r.map(s);
    const name = toppingNames[code]; if (!name) return;
    const id = ing(name);
    if (/Hamburger/.test(useFor)) addable.hamburger.push(id);
    if (/Sandwich/.test(useFor)) addable.sandwich.push(id);
  });
  // tên topping có thể lệch với công thức (thịt gà ↔ gà chiên): bảo đảm mọi nguyên liệu của công thức đều là lựa chọn hợp lệ
  items.forEach(it => it.ingredients.forEach(i => { if (it.group !== 'banhmi' && !addable[it.group].includes(i) && ingredients[i].kind !== 'base') addable[it.group].push(i); }));
  const groups = [
    { id: 'banhmi', chn: '越南面包', pin: 'yuènán miànbāo', vi: 'Bánh mì', icon: '🥖' },
    { id: 'hamburger', chn: '汉堡', pin: 'hànbǎo', vi: 'Hamburger', icon: '🍔' },
    { id: 'sandwich', chn: '三明治', pin: 'sānmíngzhì', vi: 'Sandwich', icon: '🥪' },
    { id: 'drink', chn: '饮料', pin: 'yǐnliào', vi: 'Nước uống', icon: '🥤' }
  ];
  write('banhmi', { groups, items, drinks, ingredients: Object.values(ingredients), addable });
})();

// -------------------------------------------------------------------------------------------------------------------
// 3. CÁ VIÊN
// -------------------------------------------------------------------------------------------------------------------
(function cavien() {
  const wb = load('Cá viên');
  const foods = grid(wb, 'Món ăn chín').slice(1).map(r => {
    const [code, zh, pin, vi, measures, sample, sampleVi, price, grp] = r.map(s);
    if (!code || !zh) return null;
    const m = sample.match(/^一(.)(.+)$/);
    return { id: code, group: grp, chn: zh, pin, vi, measures: measures.split(/[、,]/).map(x => x.trim()), measure: m ? m[1] : measures.split(/[、,]/)[0].trim(), nameSaid: m ? m[2] : zh, sampleVi, price: +price };
  }).filter(Boolean);
  const sauces = grid(wb, 'Nước chấm').slice(1).map(r => {
    const [code, zh, pin, vi, measure, sample, sampleVi, cls] = r.map(s);
    return code && zh ? { id: code, chn: zh, pin, vi, measure, kind: cls } : null;
  }).filter(Boolean);
  const drinks = grid(wb, 'Nước uống').map(r => {
    const [code, vi, zh, pin, price, unlock] = r.map(s);
    return code && zh ? { id: code, group: 'drink', chn: zh, pin, vi, price: Math.round(+price / 1000), tier: unlockTier(unlock) } : null;
  }).filter(Boolean);
  const phrases = grid(wb, 'Mẫu câu giao tiếp').slice(1).map(r => ({ zh: s(r[0]), pin: s(r[1]), vi: cleanVi(r[2]), topic: s(r[3]), who: /顾客/.test(s(r[4])) ? 'cust' : 'shop' })).filter(x => x.zh);
  const reviews = grid(wb, 'Feedback khách hàng').slice(1).map(r => ({ stars: +r[0] || 0, zh: s(r[1]), pin: s(r[2]), vi: cleanVi(r[3]), topic: s(r[4]), tone: s(r[5]) })).filter(x => x.zh);
  write('cavien', { foods, sauces, drinks, phrases, reviews });
})();

// -------------------------------------------------------------------------------------------------------------------
// 4. TIỆM MỸ PHẨM
// -------------------------------------------------------------------------------------------------------------------
(function mypham() {
  const wb = load('Tiệm mĩ phẩm');
  const GROUPS = [
    { id: 'da', sheet: 'Chăm sóc da', chn: '护肤', pin: 'hùfū', vi: 'Chăm sóc da', icon: '🧴' },
    { id: 'trangdiem', sheet: 'Trang điểm', chn: '彩妆', pin: 'cǎizhuāng', vi: 'Trang điểm', icon: '💄' },
    { id: 'chongnang', sheet: 'Chống nắng', chn: '防晒', pin: 'fángshài', vi: 'Chống nắng', icon: '🌞' },
    { id: 'toc', sheet: 'Chăm sóc tóc & cơ thể', chn: '洗护', pin: 'xǐhù', vi: 'Tóc & cơ thể', icon: '🧼' },
    { id: 'dungcu', sheet: 'Dụng cụ & phụ kiện', chn: '美妆工具', pin: 'měizhuāng gōngjù', vi: 'Dụng cụ & phụ kiện', icon: '🪞' }
  ];
  const items = [];
  GROUPS.forEach(g => {
    grid(wb, g.sheet).slice(1).forEach((r, i) => {
      const [code, zh, pin, vi, measures, sample, sampleVi, price] = r.map(s);
      if (!code || !zh) return;
      const m = sample.match(/^一(.)(.+)$/);
      items.push({
        id: code, group: g.id, chn: zh, pin, vi, price: +price,
        measure: m ? m[1] : measures.split(/[、,]/)[0].trim(), nameSaid: m ? m[2] : zh,
        measureVi: sampleVi.replace(/^một\s+/i, '').replace(vi, '').trim(),
        sampleVi, tier: i < 4 ? 0 : i < 7 ? 1 : 2
      });
    });
  });
  const phrases = grid(wb, 'Mẫu câu mua hàng').slice(1).map(r => ({ zh: s(r[0]), pin: s(r[1]), vi: cleanVi(r[2]), topic: s(r[3]), who: /顾客/.test(s(r[4])) ? 'cust' : 'shop' })).filter(x => x.zh);
  const reviews = grid(wb, 'Feedback khách hàng').slice(1).map(r => ({ stars: +r[0] || 0, zh: s(r[1]), pin: s(r[2]), vi: cleanVi(r[3]), topic: s(r[4]), tone: s(r[5]) })).filter(x => x.zh);
  const slang = grid(wb, 'Ghi chú tiếng lóng').slice(1).map(r => ({ zh: s(r[0]), pin: s(r[1]), vi: cleanVi(r[2]) })).filter(x => x.zh);
  write('mypham', { groups: GROUPS.map(({ sheet, ...g }) => g), items, phrases, reviews, slang });
})();
