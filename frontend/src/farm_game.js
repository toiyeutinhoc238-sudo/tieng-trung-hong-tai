/**
 * Nông Trại Của Tôi (我的农场) — lối chơi nông trại liên tục, thời gian thật
 *   - Bản đồ isometric là màn chính: ruộng, chuồng trại, xưởng, kho lúa, nhà kho, bảng đơn, xe tải, quầy bán.
 *   - Cây / vật nuôi / xưởng chạy theo GIỜ THẬT (lưu mốc thời gian) → tắt game vẫn lớn.
 *   - Gieo 1 hạt (lấy từ kho lúa) → thu 2. Cấp độ & XP mở cây, vật nuôi, xưởng mới; lên cấp thưởng kim cương.
 *   - Bảng đơn hàng (6 đơn bằng tiếng Trung), xe tải (đơn lớn), quầy bán lẻ (khách trả tiền mặt → thối tiền).
 *   - Kho lúa (nông sản) & nhà kho (hàng chế biến, vật liệu) có sức chứa; nâng cấp bằng vật liệu 钉子 木板 油漆.
 *   - Kế thừa từ 2 tiệm: tài khoản & lưu tiến trình, bảng xếp hạng (theo cấp độ & XP), sổ từ vựng, thời tiết & ngày lễ,
 *     nâng cấp, phá sản, giọng đọc tiếng Trung, thối tiền.
 * Lưu ý: file này còn được nạp dạng <script> thường khi mở bằng file:// → không dùng import/export.
 */

// ============================================================================
// 1. ÂM THANH
// ============================================================================
class FarmAudio {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.voiceEnabled = true;
    this.voices = [];
    if ('speechSynthesis' in window) {
      const load = () => { try { this.voices = window.speechSynthesis.getVoices(); } catch (e) {} };
      load();
      try { window.speechSynthesis.onvoiceschanged = load; } catch (e) {}
    }
  }
  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { try { this.ctx = new AC(); } catch (e) { this.ctx = null; } }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }
  tone(freq, dur, { type = 'sine', vol = 0.25, delay = 0, slideTo = null } = {}) {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
  pop() { this.tone(420, 0.09, { slideTo: 700, vol: 0.2 }); }
  pick() { this.tone(330, 0.08, { slideTo: 560, vol: 0.22 }); }
  plant() { this.tone(260, 0.12, { type: 'triangle', slideTo: 180, vol: 0.22 }); }
  harvest() { this.tone(660, 0.1, { type: 'triangle', vol: 0.2 }); this.tone(990, 0.12, { type: 'triangle', vol: 0.16, delay: 0.07 }); }
  cluck() { this.tone(900, 0.06, { type: 'square', vol: 0.08, slideTo: 600 }); this.tone(900, 0.06, { type: 'square', vol: 0.08, slideTo: 600, delay: 0.1 }); }
  coin() { this.tone(1800, 0.12, { vol: 0.16 }); this.tone(2400, 0.12, { vol: 0.14, delay: 0.03 }); }
  bell() { this.tone(1320, 0.5, { type: 'triangle', vol: 0.2 }); this.tone(1980, 0.4, { type: 'triangle', vol: 0.1, delay: 0.05 }); }
  error() { this.tone(160, 0.3, { type: 'sawtooth', vol: 0.22, slideTo: 110 }); }
  register() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 0.32, { type: 'triangle', vol: 0.22, delay: i * 0.08 })); }
  sad() { this.tone(400, 0.35, { type: 'triangle', vol: 0.18, slideTo: 220 }); }
  unlock() { [659.25, 880, 1174.66].forEach((f, i) => this.tone(f, 0.28, { type: 'triangle', vol: 0.2, delay: i * 0.09 })); }
  fanfare() { [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => this.tone(f, 0.4, { type: 'triangle', vol: 0.22, delay: i * 0.11 })); }
  speak(text) {
    if (!this.voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 0.88;
      u.pitch = 1.05;
      if (!this.voices.length) this.voices = window.speechSynthesis.getVoices();
      const zh = this.voices.find(v => /zh|cmn/i.test(v.lang));
      if (zh) u.voice = zh;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
}

// ============================================================================
// 2. DỮ LIỆU
// ============================================================================
// kind: crop (để ở 粮仓 kho lúa) · product / feed / material (để ở 仓库 nhà kho)
// grow / time tính bằng GIÂY THẬT. price = giá trị 1 đơn vị (vàng), xp = kinh nghiệm khi thu / làm ra
const ITEMS = [
  { id: 'wheat', kind: 'crop', chn: '小麦', pin: 'xiǎomài', vi: 'lúa mì', q: '袋', qPin: 'dài', qVi: 'bao', icon: '🌾', grow: 120, price: 3, xp: 1, lvl: 1 },
  { id: 'corn', kind: 'crop', chn: '玉米', pin: 'yùmǐ', vi: 'ngô (bắp)', q: '根', qPin: 'gēn', qVi: 'bắp', icon: '🌽', grow: 300, price: 5, xp: 1, lvl: 2 },
  { id: 'carrot', kind: 'crop', chn: '胡萝卜', pin: 'húluóbo', vi: 'cà rốt', q: '根', qPin: 'gēn', qVi: 'củ', icon: '🥕', grow: 600, price: 7, xp: 2, lvl: 3 },
  { id: 'soybean', kind: 'crop', chn: '大豆', pin: 'dàdòu', vi: 'đậu nành', q: '袋', qPin: 'dài', qVi: 'bao', icon: '🫘', grow: 1200, price: 9, xp: 2, lvl: 5 },
  { id: 'sugarcane', kind: 'crop', chn: '甘蔗', pin: 'gānzhè', vi: 'mía', q: '根', qPin: 'gēn', qVi: 'cây', icon: '🎋', grow: 1800, price: 11, xp: 3, lvl: 7 },
  { id: 'tomato', kind: 'crop', chn: '西红柿', pin: 'xīhóngshì', vi: 'cà chua', q: '个', qPin: 'gè', qVi: 'quả', icon: '🍅', grow: 2700, price: 14, xp: 4, lvl: 9 },
  { id: 'strawberry', kind: 'crop', chn: '草莓', pin: 'cǎoméi', vi: 'dâu tây', q: '盒', qPin: 'hé', qVi: 'hộp', icon: '🍓', grow: 3600, price: 18, xp: 5, lvl: 11 },
  { id: 'chickenfeed', kind: 'feed', chn: '鸡饲料', pin: 'jī sìliào', vi: 'thức ăn gà', q: '袋', qPin: 'dài', qVi: 'bao', icon: '🟡', price: 4, xp: 1 },
  { id: 'cowfeed', kind: 'feed', chn: '牛饲料', pin: 'niú sìliào', vi: 'thức ăn bò', q: '袋', qPin: 'dài', qVi: 'bao', icon: '🟤', price: 6, xp: 1 },
  { id: 'egg', kind: 'product', chn: '鸡蛋', pin: 'jīdàn', vi: 'trứng gà', q: '个', qPin: 'gè', qVi: 'quả', icon: '🥚', price: 8, xp: 2 },
  { id: 'milk', kind: 'product', chn: '牛奶', pin: 'niúnǎi', vi: 'sữa bò', q: '瓶', qPin: 'píng', qVi: 'chai', icon: '🥛', price: 16, xp: 3 },
  { id: 'bread', kind: 'product', chn: '面包', pin: 'miànbāo', vi: 'bánh mì', q: '个', qPin: 'gè', qVi: 'ổ', icon: '🍞', price: 25, xp: 4 },
  { id: 'carrotcake', kind: 'product', chn: '胡萝卜蛋糕', pin: 'húluóbo dàngāo', vi: 'bánh cà rốt', q: '块', qPin: 'kuài', qVi: 'miếng', icon: '🍰', price: 50, xp: 8 },
  { id: 'cream', kind: 'product', chn: '奶油', pin: 'nǎiyóu', vi: 'kem sữa', q: '盒', qPin: 'hé', qVi: 'hộp', icon: '🧈', price: 30, xp: 5 },
  { id: 'cheese', kind: 'product', chn: '奶酪', pin: 'nǎilào', vi: 'phô mai', q: '块', qPin: 'kuài', qVi: 'miếng', icon: '🧀', price: 45, xp: 7 },
  { id: 'sugar', kind: 'product', chn: '白糖', pin: 'báitáng', vi: 'đường trắng', q: '袋', qPin: 'dài', qVi: 'bao', icon: '🍬', price: 22, xp: 4 },
  { id: 'nail', kind: 'material', chn: '钉子', pin: 'dīngzi', vi: 'đinh', q: '颗', qPin: 'kē', qVi: 'cái', icon: '🔩' },
  { id: 'plank', kind: 'material', chn: '木板', pin: 'mùbǎn', vi: 'ván gỗ', q: '块', qPin: 'kuài', qVi: 'tấm', icon: '🪵' },
  { id: 'paint', kind: 'material', chn: '油漆', pin: 'yóuqī', vi: 'sơn', q: '桶', qPin: 'tǒng', qVi: 'thùng', icon: '🪣' }
];
const itemOf = (id) => ITEMS.find(i => i.id === id);
const CROPS = ITEMS.filter(i => i.kind === 'crop');
const MATERIALS = ['nail', 'plank', 'paint'];

// Chuồng trại & xưởng (vị trí cố định trên bản đồ: ô gốc + kích thước)
const BUILDINGS = [
  { id: 'feedmill', type: 'factory', chn: '饲料厂', pin: 'sìliàochǎng', vi: 'xưởng thức ăn gia súc', icon: '🏭', lvl: 2, cost: 30, slots: 2,
    recipes: [{ out: 'chickenfeed', n: 3, need: { wheat: 2, corn: 1 }, time: 120, lvl: 2 }, { out: 'cowfeed', n: 3, need: { corn: 1, soybean: 2 }, time: 240, lvl: 6 }],
    origin: [1, 6], size: [2, 2], wallL: '#8d6e63', wallR: '#a1887f', roofA: '#455a64', roofB: '#607d8b' },
  { id: 'coop', type: 'animal', chn: '鸡舍', pin: 'jīshè', vi: 'chuồng gà', icon: '🐔', lvl: 3, cost: 50,
    animal: { chn: '鸡', pin: 'jī', vi: 'gà', icon: '🐔', cost: 30, max: 6, start: 3 }, food: 'chickenfeed', product: 'egg', time: 300,
    origin: [4, 6], size: [2, 2], wallL: '#e3a92f', wallR: '#f6c453', roofA: '#a93226', roofB: '#c0392b' },
  { id: 'bakery', type: 'factory', chn: '面包房', pin: 'miànbāofáng', vi: 'lò bánh', icon: '🥐', lvl: 4, cost: 80, slots: 2,
    recipes: [{ out: 'bread', n: 1, need: { wheat: 3 }, time: 300, lvl: 4 }, { out: 'carrotcake', n: 1, need: { carrot: 2, egg: 2, wheat: 1 }, time: 900, lvl: 5 }],
    origin: [6, 6], size: [2, 2], wallL: '#d9c6a3', wallR: '#f0e1c4', roofA: '#c9681b', roofB: '#e67e22' },
  { id: 'cowshed', type: 'animal', chn: '牛棚', pin: 'niúpéng', vi: 'chuồng bò', icon: '🐄', lvl: 6, cost: 150,
    animal: { chn: '奶牛', pin: 'nǎiniú', vi: 'bò sữa', icon: '🐄', cost: 60, max: 4, start: 2 }, food: 'cowfeed', product: 'milk', time: 900,
    origin: [1, 8], size: [2, 2], wallL: '#a32d22', wallR: '#c0392b', roofA: '#5b3a29', roofB: '#74503a' },
  { id: 'dairy', type: 'factory', chn: '奶制品厂', pin: 'nǎizhìpǐnchǎng', vi: 'xưởng sữa', icon: '🧀', lvl: 7, cost: 200, slots: 2,
    recipes: [{ out: 'cream', n: 1, need: { milk: 1 }, time: 600, lvl: 7 }, { out: 'cheese', n: 1, need: { milk: 2 }, time: 1200, lvl: 8 }],
    origin: [4, 8], size: [2, 2], wallL: '#90caf9', wallR: '#bbdefb', roofA: '#1e88e5', roofB: '#42a5f5' },
  { id: 'sugarmill', type: 'factory', chn: '制糖厂', pin: 'zhìtángchǎng', vi: 'xưởng đường', icon: '🍬', lvl: 8, cost: 250, slots: 2,
    recipes: [{ out: 'sugar', n: 1, need: { sugarcane: 1 }, time: 600, lvl: 8 }],
    origin: [6, 8], size: [2, 2], wallL: '#ce93d8', wallR: '#e1bee7', roofA: '#8e24aa', roofB: '#ab47bc' }
];
const bldOf = (id) => BUILDINGS.find(b => b.id === id);
// Công trình cố định (luôn có): nhà kho, kho lúa, bảng đơn, quầy bán, xe tải
const FIXTURES = [
  { id: 'barn', chn: '仓库', vi: 'nhà kho', icon: '🏚️', origin: [9, 1], size: [2, 2], h: 58, wallL: '#a32d22', wallR: '#c0392b', roofA: '#6d4c41', roofB: '#8d6e63' },
  { id: 'silo', chn: '粮仓', vi: 'kho lúa', icon: '🌾', origin: [9, 3], size: [1, 1], h: 92, wallL: '#b0bec5', wallR: '#cfd8dc', roofA: '#78909c', roofB: '#90a4ae' },
  { id: 'board', chn: '订单板', vi: 'bảng đơn hàng', icon: '🧾', origin: [0, 2], size: [1, 1] },
  { id: 'stall', chn: '摊位', vi: 'quầy bán lẻ', icon: '🛎️', origin: [7, 3], size: [1, 1] },
  { id: 'truck', chn: '卡车', vi: 'xe tải', icon: '🚚', origin: [9, 8], size: [2, 2] }
];

// Ô ruộng: 6 ô có sẵn, mua thêm tới 18 ô
const PLOT_CELLS = [[1, 1], [2, 1], [3, 1], [1, 2], [2, 2], [3, 2], [4, 1], [4, 2], [1, 3], [2, 3], [3, 3], [4, 3], [5, 1], [5, 2], [5, 3], [6, 1], [6, 2], [6, 3]];
const PLOTS_START = 6;
const plotCost = (k) => 20 + 12 * (k - PLOTS_START);                 // giá ô thứ k (tính từ 0)
const plotLevel = (k) => 1 + Math.floor((k - PLOTS_START) / 2);       // cấp cần có

// Kinh nghiệm: tổng XP cần để đạt cấp L
const xpFor = (L) => 5 * (L - 1) * (L + 2);
const START = { coins: 50, gems: 5, storage: { wheat: 4 } };
const CAP_BASE = 50;
const CAP_STEP = 25;

// Nâng cấp
const UPGRADES = [
  { id: 'sprinkler', chn: '洒水器', pin: 'sǎshuǐqì', vi: 'máy tưới nước', icon: '💦', desc: 'Cây lớn nhanh hơn 20% mỗi cấp', costs: [150, 300, 500] },
  { id: 'sign', chn: '招牌', pin: 'zhāopai', vi: 'biển hiệu mới', icon: '🪧', desc: 'Khách mua lẻ ghé quầy thường xuyên hơn (+20% mỗi cấp)', costs: [100, 220, 400] },
  { id: 'seats', chn: '座位', pin: 'zuòwèi', vi: 'ghế ngồi chờ', icon: '🪑', desc: 'Khách mua lẻ chịu chờ lâu hơn (+1 phút mỗi cấp)', costs: [80, 180, 320] }
];

// Thời tiết & ngày lễ theo NGÀY THẬT (mọi người cùng 1 thời tiết trong ngày)
const WEATHERS = [
  { id: 'sunny', chn: '晴天', pin: 'qíngtiān', vi: 'trời nắng đẹp', icon: '☀️', grow: 1, w: 34, note: 'Trời đẹp, mọi thứ bình thường.' },
  { id: 'cloudy', chn: '多云', pin: 'duōyún', vi: 'trời nhiều mây', icon: '⛅', grow: 1, w: 20, note: 'Trời râm mát.' },
  { id: 'hot', chn: '烈日', pin: 'lièrì', vi: 'nắng gắt', icon: '🥵', grow: 0.85, w: 12, note: 'Nắng gắt: cây lớn chậm hơn.' },
  { id: 'rain', chn: '下雨', pin: 'xiàyǔ', vi: 'trời mưa', icon: '🌧️', grow: 1.3, w: 15, note: 'Trời mưa: cây lớn rất nhanh!' },
  { id: 'wind', chn: '大风', pin: 'dàfēng', vi: 'gió to', icon: '🌬️', grow: 0.9, w: 9, note: 'Gió to: cây lớn hơi chậm.' },
  { id: 'thunder', chn: '雷阵雨', pin: 'léizhènyǔ', vi: 'mưa dông', icon: '⛈️', grow: 1.2, w: 6, note: 'Mưa dông: cây được tưới no nước.' },
  { id: 'typhoon', chn: '台风', pin: 'táifēng', vi: 'bão', icon: '🌀', grow: 0.7, w: 4, note: 'Có bão! Cây lớn chậm.' }
];
const HOLIDAYS = [
  { id: 'spring', chn: '春节', pin: 'Chūnjié', vi: 'Tết Nguyên Đán', icon: '🧧', greet: '新年快乐！', greetPin: 'Xīnnián kuàilè!', greetVi: 'Chúc mừng năm mới!' },
  { id: 'lantern', chn: '元宵节', pin: 'Yuánxiāojié', vi: 'Tết Nguyên Tiêu', icon: '🏮', greet: '元宵节快乐！', greetPin: 'Yuánxiāojié kuàilè!', greetVi: 'Chúc Tết Nguyên Tiêu vui vẻ!' },
  { id: 'valentine', chn: '情人节', pin: 'Qíngrénjié', vi: 'Lễ Tình nhân', icon: '💝', greet: '情人节快乐！', greetPin: 'Qíngrénjié kuàilè!', greetVi: 'Chúc mừng Lễ Tình nhân!' },
  { id: 'labor', chn: '劳动节', pin: 'Láodòngjié', vi: 'Quốc tế Lao động', icon: '🛠️', greet: '劳动节快乐！', greetPin: 'Láodòngjié kuàilè!', greetVi: 'Chúc mừng ngày Lao động!' },
  { id: 'children', chn: '儿童节', pin: 'Értóngjié', vi: 'Quốc tế Thiếu nhi', icon: '🎈', greet: '儿童节快乐！', greetPin: 'Értóngjié kuàilè!', greetVi: 'Chúc mừng ngày Thiếu nhi!' },
  { id: 'dragonboat', chn: '端午节', pin: 'Duānwǔjié', vi: 'Tết Đoan Ngọ', icon: '🐉', greet: '端午节快乐！', greetPin: 'Duānwǔjié kuàilè!', greetVi: 'Chúc Tết Đoan Ngọ vui vẻ!' },
  { id: 'midautumn', chn: '中秋节', pin: 'Zhōngqiūjié', vi: 'Tết Trung Thu', icon: '🥮', greet: '中秋节快乐！', greetPin: 'Zhōngqiūjié kuàilè!', greetVi: 'Chúc Trung Thu vui vẻ!' },
  { id: 'teacher', chn: '教师节', pin: 'Jiàoshījié', vi: 'Ngày Nhà giáo', icon: '🍎', greet: '老师辛苦了！', greetPin: 'Lǎoshī xīnkǔ le!', greetVi: 'Thầy cô vất vả rồi!' },
  { id: 'national', chn: '国庆节', pin: 'Guóqìngjié', vi: 'Quốc khánh', icon: '🎆', greet: '国庆节快乐！', greetPin: 'Guóqìngjié kuàilè!', greetVi: 'Chúc mừng Quốc khánh!' },
  { id: 'christmas', chn: '圣诞节', pin: 'Shèngdànjié', vi: 'Giáng sinh', icon: '🎄', greet: '圣诞节快乐！', greetPin: 'Shèngdànjié kuàilè!', greetVi: 'Giáng sinh vui vẻ!' }
];
const HOLIDAY_RULES = { chance: 0.15, orderBonus: 1.2, stallBonus: 1.3 };

const CUSTOMERS = [
  { id: 'xiaoyu', nameChn: '小雨', nameVi: 'Bé Mưa', img: 'boba_customer_girl.jpg' },
  { id: 'xiaohao', nameChn: '小浩', nameVi: 'Tiểu Hạo', img: 'boba_customer_boy.jpg' },
  { id: 'xiaotong', nameChn: '晓彤', nameVi: 'Hiểu Đồng', img: 'boba_customer_xiaotong.jpg' },
  { id: 'linjie', nameChn: '林姐', nameVi: 'Chị Lâm', img: 'boba_customer_linjie.jpg' },
  { id: 'wangshu', nameChn: '王叔', nameVi: 'Chú Vương', img: 'boba_customer_wangshu.jpg' },
  { id: 'nainai', nameChn: '奶奶', nameVi: 'Bà nội', img: 'boba_customer_grandma.jpg' },
  { id: 'abao', nameChn: '阿宝', nameVi: 'Gấu A Bảo', img: 'boba_customer_abao.jpg' }
];

const ORDER_TEMPLATES = [
  { id: 'want', zh: (L) => `老板，我要${L}。`, pin: (P) => `Lǎobǎn, wǒ yào ${P}.`, vi: (V) => `Ông chủ ơi, tôi muốn mua ${V}.`, learn: ['老板'] },
  { id: 'fresh', zh: (L, F) => `今天的${F}新鲜吗？我要${L}。`, pin: (P, F) => `Jīntiān de ${F} xīnxiān ma? Wǒ yào ${P}.`, vi: (V, F) => `${F} hôm nay có tươi không? Cho tôi ${V}.`, learn: ['新鲜'] },
  { id: 'give', zh: (L) => `请给我${L}，谢谢！`, pin: (P) => `Qǐng gěi wǒ ${P}, xièxie!`, vi: (V) => `Làm ơn bán cho tôi ${V}, cảm ơn!`, learn: ['谢谢'] },
  { id: 'buy', zh: (L) => `我想买${L}。`, pin: (P) => `Wǒ xiǎng mǎi ${P}.`, vi: (V) => `Tôi muốn mua ${V}.`, learn: ['买'] },
  { id: 'need', zh: (L) => `我需要${L}，麻烦你了！`, pin: (P) => `Wǒ xūyào ${P}, máfan nǐ le!`, vi: (V) => `Tôi cần ${V}, làm phiền bạn nhé!`, learn: ['需要', '麻烦你了'] }
];

const VOCAB_TABS = [
  { id: 'crops', label: '🌾 Cây trồng', words: CROPS.map(c => ({ chn: c.chn, pin: c.pin, vi: c.vi })) },
  { id: 'products', label: '🥚 Sản phẩm', words: ITEMS.filter(i => i.kind === 'product' || i.kind === 'feed').map(i => ({ chn: i.chn, pin: i.pin, vi: i.vi })) },
  {
    id: 'places', label: '🏚️ Chuồng trại & xưởng',
    words: [
      { chn: '鸡', pin: 'jī', vi: 'con gà' }, { chn: '奶牛', pin: 'nǎiniú', vi: 'bò sữa' },
      ...BUILDINGS.map(b => ({ chn: b.chn, pin: b.pin, vi: b.vi })),
      { chn: '粮仓', pin: 'liángcāng', vi: 'kho lúa' }, { chn: '仓库', pin: 'cāngkù', vi: 'nhà kho' },
      { chn: '订单板', pin: 'dìngdānbǎn', vi: 'bảng đơn hàng' }, { chn: '卡车', pin: 'kǎchē', vi: 'xe tải' },
      { chn: '摊位', pin: 'tānwèi', vi: 'quầy, sạp hàng' },
      ...MATERIALS.map(id => ({ chn: itemOf(id).chn, pin: itemOf(id).pin, vi: itemOf(id).vi }))
    ]
  },
  {
    id: 'quantifiers', label: '🔢 Lượng từ',
    words: [
      { chn: '袋', pin: 'dài', vi: 'bao, túi' }, { chn: '根', pin: 'gēn', vi: 'cây/củ/bắp (vật dài)' }, { chn: '个', pin: 'gè', vi: 'cái, quả' },
      { chn: '盒', pin: 'hé', vi: 'hộp' }, { chn: '瓶', pin: 'píng', vi: 'chai' }, { chn: '块', pin: 'kuài', vi: 'miếng, tấm' },
      { chn: '颗', pin: 'kē', vi: 'hạt, viên, cái (vật nhỏ)' }, { chn: '桶', pin: 'tǒng', vi: 'thùng' }
    ]
  },
  {
    id: 'farm', label: '🚜 Nông trại',
    words: [
      { chn: '农场', pin: 'nóngchǎng', vi: 'nông trại' }, { chn: '种子', pin: 'zhǒngzi', vi: 'hạt giống' },
      { chn: '播种', pin: 'bōzhǒng', vi: 'gieo hạt' }, { chn: '收获', pin: 'shōuhuò', vi: 'thu hoạch' },
      { chn: '成熟', pin: 'chéngshú', vi: 'chín' }, { chn: '喂', pin: 'wèi', vi: 'cho ăn' },
      { chn: '饲料', pin: 'sìliào', vi: 'thức ăn gia súc' }, { chn: '田地', pin: 'tiándì', vi: 'ruộng đất' },
      { chn: '仓库满了', pin: 'cāngkù mǎn le', vi: 'kho đầy rồi' }, { chn: '新鲜', pin: 'xīnxiān', vi: 'tươi' },
      { chn: '升级', pin: 'shēngjí', vi: 'nâng cấp / lên cấp' }, { chn: '经验', pin: 'jīngyàn', vi: 'kinh nghiệm (XP)' },
      { chn: '金币', pin: 'jīnbì', vi: 'tiền vàng' }, { chn: '钻石', pin: 'zuànshí', vi: 'kim cương' },
      ...UPGRADES.map(u => ({ chn: u.chn, pin: u.pin, vi: u.vi }))
    ]
  },
  {
    id: 'business', label: '🛎️ Mua bán',
    words: [
      { chn: '老板', pin: 'lǎobǎn', vi: 'ông chủ' }, { chn: '买', pin: 'mǎi', vi: 'mua' }, { chn: '谢谢', pin: 'xièxie', vi: 'cảm ơn' },
      { chn: '需要', pin: 'xūyào', vi: 'cần' }, { chn: '麻烦你了', pin: 'máfan nǐ le', vi: 'làm phiền bạn rồi' },
      { chn: '订单', pin: 'dìngdān', vi: 'đơn hàng' }, { chn: '交货', pin: 'jiāohuò', vi: 'giao hàng' },
      { chn: '一共', pin: 'yígòng', vi: 'tổng cộng' }, { chn: '找零', pin: 'zhǎolíng', vi: 'thối tiền' },
      { chn: '不好意思', pin: 'bù hǎoyìsi', vi: 'xin lỗi, ngại quá' }, { chn: '破产', pin: 'pòchǎn', vi: 'phá sản' }
    ]
  },
  {
    id: 'events', label: '🌦️ Lễ & thời tiết',
    words: [
      { chn: '天气', pin: 'tiānqì', vi: 'thời tiết' }, { chn: '节日', pin: 'jiérì', vi: 'ngày lễ' }, { chn: '快乐', pin: 'kuàilè', vi: 'vui vẻ' },
      ...WEATHERS.map(w => ({ chn: w.chn, pin: w.pin, vi: w.vi })),
      ...HOLIDAYS.map(h => ({ chn: h.chn, pin: h.pin, vi: h.vi }))
    ]
  }
];
const VOCAB_TOTAL = VOCAB_TABS.reduce((s, t) => s + t.words.length, 0);

// Đơn hàng & quầy bán lẻ (thời gian thật, giây)
const ORDER_RULES = { slots: 6, refillSec: 15, discardSec: 60, truckCooldownSec: 180, materialChance: 0.2 };
const STALL_RULES = { gapMin: 90, gapMax: 150, patienceSec: 180, seatSec: 60 };
const HARVEST_MATERIAL_CHANCE = 0.08;

const STAGE_W = 1280;
const STAGE_H = 720;
const PORTRAIT_W = 480;
const PORTRAIT_MIN_H = 900;
const SAVE_VERSION = 2;

const ASSET = (f) => `./assets/${f}`;
const cents = (v) => Math.round(Number(v) * 100);
const fmt = (v) => (Math.round(Number(v) * 100) / 100).toFixed(2);
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NUM_CHN = { 1: '一', 2: '两', 3: '三', 4: '四', 5: '五', 6: '六' };
const NUM_PIN = { 2: 'liǎng', 3: 'sān', 4: 'sì', 5: 'wǔ', 6: 'liù' };
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pickOne = (arr) => (Array.isArray(arr) && arr.length ? arr[randInt(0, arr.length - 1)] : null);
const yiPinyin = (nextPin) => (/[àèìòùǜ]/.test(nextPin) ? 'yí' : 'yì');
const qtyPin = (n, qPin) => (n === 1 ? yiPinyin(qPin) : NUM_PIN[n] || String(n));
const now = () => Date.now();
const fmtSec = (s) => {
  s = Math.max(0, Math.ceil(s));
  if (s >= 3600) return `${Math.floor(s / 3600)}g ${Math.floor((s % 3600) / 60)}p`;
  if (s >= 60) return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  return `${s}s`;
};
const skipGems = (remainSec) => (remainSec <= 0 ? 0 : Math.max(1, Math.ceil(remainSec / 300)));
const dateKey = (t = now()) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };

// ---------------- Bản đồ isometric (SVG): ô thoi 80×40
const HW = 40;
const HH = 20;
const GRID_N = 11;
const iso = (gx, gy) => ({ x: (gx - gy) * HW, y: (gx + gy) * HH });
const pts = (arr) => arr.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
function diamond(gx, gy, s = 1) {
  const c = iso(gx, gy);
  return pts([{ x: c.x, y: c.y - HH * s }, { x: c.x + HW * s, y: c.y }, { x: c.x, y: c.y + HH * s }, { x: c.x - HW * s, y: c.y }]);
}
const PATH_CELLS = new Set([...Array(GRID_N).keys()].flatMap(i => [`8,${i}`, `${i},5`]));
const WATER_CELLS = new Set(['3,10', '4,10', '5,10']);
const DECOR = [
  { cell: [0, 0], icon: '🌳', size: 34 }, { cell: [10, 10], icon: '🌳', size: 36 }, { cell: [0, 10], icon: '🌲', size: 32 },
  { cell: [10, 0], icon: '🌲', size: 30 }, { cell: [7, 0], icon: '🌼', size: 18 }, { cell: [4, 10], icon: '🦆', size: 18 },
  { cell: [7, 9], icon: '🌻', size: 22 }, { cell: [10, 6], icon: '🌷', size: 18 }, { cell: [0, 7], icon: '🌳', size: 30 }
];

function boxSvg(f, h) {
  const [ox, oy] = f.origin;
  const [sx, sy] = f.size;
  const A = iso(ox - 0.5, oy - 0.5);
  const B = iso(ox + sx - 0.5, oy - 0.5);
  const C = iso(ox + sx - 0.5, oy + sy - 0.5);
  const D = iso(ox - 0.5, oy + sy - 0.5);
  const up = (p, d = h) => ({ x: p.x, y: p.y - d });
  const top = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 - h - (f.roofH || 34) };
  const lerp = (p, q, t) => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
  const d0 = lerp(D, C, 0.36), d1 = lerp(D, C, 0.64);
  const w0 = lerp(C, B, 0.32), w1 = lerp(C, B, 0.68);
  return `
    <polygon points="${pts([up(A), up(D), top])}" fill="${f.roofA}" opacity="0.92"/>
    <polygon points="${pts([up(A), up(B), top])}" fill="${f.roofB}" opacity="0.92"/>
    <polygon points="${pts([D, C, up(C), up(D)])}" fill="${f.wallL}" stroke="rgba(0,0,0,0.15)"/>
    <polygon points="${pts([C, B, up(B), up(C)])}" fill="${f.wallR}" stroke="rgba(0,0,0,0.12)"/>
    <polygon points="${pts([d0, d1, up(d1, Math.min(28, h * 0.6)), up(d0, Math.min(28, h * 0.6))])}" fill="#5d3a1a"/>
    <polygon points="${pts([up(w0, h * 0.4), up(w1, h * 0.4), up(w1, h * 0.72), up(w0, h * 0.72)])}" fill="#bfe6f7" stroke="#fff" stroke-width="2"/>
    <polygon points="${pts([up(D), up(C), top])}" fill="${f.roofA}"/>
    <polygon points="${pts([up(C), up(B), top])}" fill="${f.roofB}"/>
    <polyline points="${pts([up(D), top, up(B)])}" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" opacity="0.85"/>
    <text x="${top.x}" y="${top.y + 20}" text-anchor="middle" font-size="18">${f.icon}</text>`;
}
const footCenter = (f) => iso(f.origin[0] + (f.size[0] - 1) / 2, f.origin[1] + (f.size[1] - 1) / 2);

// ============================================================================
// 3. MÁY CHỦ: TÀI KHOẢN, LƯU TIẾN TRÌNH, BẢNG XẾP HẠNG
// ============================================================================
const GameCloud = {
  key: 'farm',
  apiBase() {
    const h = window.location.hostname;
    if (window.location.protocol === 'file:' || h === 'localhost' || h === '127.0.0.1' || h === '') return 'http://localhost:5000';
    if (h.includes('tieng-trung-hong-tai-1.onrender.com')) return 'https://tiengtrunghongtai.online';
    return window.location.origin;
  },
  token() {
    try {
      const t = localStorage.getItem('session_token') || localStorage.getItem('sessionToken') || '';
      return t && t !== 'null' && t !== 'undefined' && t !== 'guest' ? t : '';
    } catch (e) { return ''; }
  },
  signedIn() { return !!(this.token() || this.localUser()); },
  localUser() {
    try {
      const u = JSON.parse(localStorage.getItem('user') || localStorage.getItem('currentUser') || 'null');
      return u && u.email ? u : null;
    } catch (e) { return null; }
  },
  async request(path, options = {}, timeoutMs = 8000) {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
    const headers = { 'Content-Type': 'application/json' };
    const t = this.token();
    if (t) { headers.Authorization = `Bearer ${t}`; headers['x-session-token'] = t; }
    const lu = this.localUser();
    if (lu && lu.email) headers['x-user-email'] = String(lu.email).toLowerCase().trim();
    try {
      const res = await fetch(this.apiBase() + path, { credentials: 'include', cache: 'no-store', ...options, headers, signal: ctrl ? ctrl.signal : undefined });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      if (timer) clearTimeout(timer);
    }
  },
  getProgress() { return this.request(`/api/${this.key}/progress`); },
  post(body) { return this.request(`/api/${this.key}/progress`, { method: 'POST', body: JSON.stringify(body), keepalive: true }); },
  getLeaderboard() { return this.request(`/api/${this.key}/leaderboard?limit=50`); }
};

const LocalSave = {
  key(owner) { return `${GameCloud.key}_save_${owner || 'guest'}`; },
  read(owner) {
    try {
      const s = JSON.parse(localStorage.getItem(this.key(owner)) || 'null');
      return s && typeof s === 'object' && s.v === SAVE_VERSION ? s : null;
    } catch (e) { return null; }
  },
  write(owner, s) { try { localStorage.setItem(this.key(owner), JSON.stringify(s)); } catch (e) {} },
  clear(owner) { try { localStorage.removeItem(this.key(owner)); } catch (e) {} }
};

// ============================================================================
// 4. GAME
// ============================================================================
class FarmGame {
  constructor() {
    this.audio = new FarmAudio();
    this.showPinyin = true;
    this.showVietnamese = true;
    this.resetProgressState();
    this.seedTrayOpen = false;
    this.selectedSeed = 'wheat';
    this.storageTab = 'silo';
    this.shopZone = 'buildings';
    this.stallStep = 'pick';
    this.mapSig = '';
    this.dirty = false;
    this.lastLocalSave = 0;
    this.lastCloudSave = 0;

    const lu = GameCloud.localUser();
    this.owner = lu ? String(lu.email).toLowerCase().trim() : 'guest';
    this.cloud = { checked: false, loggedIn: false, offline: false, name: '', picture: '', best: null, history: [] };
    this.rankTab = 'global';

    const local = LocalSave.read(this.owner);
    if (local) this.applySnapshot(local); else this.newFarm();

    this.initDOM();
    this.fitStage();
    this.renderAll();
    this.showTitleScreen();
    this.tickTimer = setInterval(() => this.tick(), 1000);
    this.cloudReady = this.initCloud().catch(() => {}).finally(() => {
      this.cloud.checked = true;
      this.renderAccountChip();
      if (this.isTitleVisible()) this.showTitleScreen();
    });
  }

  resetProgressState() {
    this.level = 1;
    this.xp = 0;
    this.coins = START.coins;
    this.gems = START.gems;
    this.storage = { ...START.storage };
    this.siloLv = 0;
    this.barnLv = 0;
    this.plots = PLOT_CELLS.map(() => ({ crop: null, readyAt: 0 }));
    this.plotsOwned = PLOTS_START;
    this.blds = Object.fromEntries(BUILDINGS.map(b => [b.id, b.type === 'animal' ? { owned: false, n: 0, readyAt: 0 } : { owned: false, queue: [], slots: b.slots }]));
    this.orders = [];
    this.truck = null;
    this.stall = { customer: null, nextAt: 0 };
    this.upgrades = Object.fromEntries(UPGRADES.map(u => [u.id, 0]));
    this.learnedVocab = new Set(['农场', '老板']);
    this.records = [];
    this.stats = { orders: 0, trucks: 0, stall: 0, harvested: 0 };
    this.eventSeen = '';
    this.savedAt = 0;
  }

  // Ván mới: 6 ô lúa mì sắp chín để người chơi thu hoạch ngay (giống phần mở đầu của game nông trại)
  newFarm() {
    this.resetProgressState();
    const t = now();
    this.plots.forEach((p, i) => { if (i < PLOTS_START) { p.crop = 'wheat'; p.readyAt = t + (i < 3 ? 5000 : 40000); } });
    this.ensureOrders();
    this.stall.nextAt = t + 45000;
  }

  snapshot() {
    return {
      v: SAVE_VERSION,
      day: this.level,                    // máy chủ cần trường day → dùng cấp độ
      level: this.level, xp: this.xp, coins: this.coins, gems: this.gems,
      storage: { ...this.storage }, siloLv: this.siloLv, barnLv: this.barnLv,
      plots: this.plots.map(p => (p.crop ? [p.crop, p.readyAt, p.rate || 1] : 0)), plotsOwned: this.plotsOwned,
      blds: JSON.parse(JSON.stringify(this.blds)),
      orders: this.orders, truck: this.truck,
      stall: { customer: this.stall.customer ? { ...this.stall.customer, profile: this.stall.customer.profile.id } : null, nextAt: this.stall.nextAt },
      upgrades: { ...this.upgrades },
      vocab: [...this.learnedVocab].slice(0, 400),
      records: this.records.slice(-40),
      stats: { ...this.stats },
      eventSeen: this.eventSeen,
      updatedAt: Date.now()
    };
  }

  applySnapshot(s) {
    if (!s || s.v !== SAVE_VERSION) return false;
    const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
    const int = (v, lo, hi, d) => Math.max(lo, Math.min(hi, Math.round(num(v, d))));
    this.resetProgressState();
    this.level = int(s.level, 1, 999, 1);
    this.xp = int(s.xp, 0, 1e9, 0);
    this.coins = int(s.coins, 0, 1e9, START.coins);
    this.gems = int(s.gems, 0, 1e6, START.gems);
    this.storage = {};
    if (s.storage && typeof s.storage === 'object') ITEMS.forEach(it => { const n = int(s.storage[it.id], 0, 9999, 0); if (n) this.storage[it.id] = n; });
    this.siloLv = int(s.siloLv, 0, 50, 0);
    this.barnLv = int(s.barnLv, 0, 50, 0);
    this.plotsOwned = int(s.plotsOwned, PLOTS_START, PLOT_CELLS.length, PLOTS_START);
    if (Array.isArray(s.plots)) s.plots.forEach((p, i) => {
      if (i < this.plots.length && Array.isArray(p) && itemOf(p[0]) && itemOf(p[0]).kind === 'crop') this.plots[i] = { crop: p[0], readyAt: num(p[1], 0), rate: Math.max(0.3, Math.min(5, num(p[2], 1))) };
    });
    if (s.blds && typeof s.blds === 'object') BUILDINGS.forEach(b => {
      const src = s.blds[b.id];
      if (!src || typeof src !== 'object') return;
      if (b.type === 'animal') this.blds[b.id] = { owned: !!src.owned, n: int(src.n, 0, b.animal.max, 0), readyAt: num(src.readyAt, 0) };
      else this.blds[b.id] = {
        owned: !!src.owned, slots: int(src.slots, b.slots, 6, b.slots),
        queue: Array.isArray(src.queue) ? src.queue.filter(j => j && b.recipes.some(r => r.out === j.out)).map(j => ({ out: j.out, readyAt: num(j.readyAt, 0) })).slice(0, 6) : []
      };
    });
    const validOrder = (o) => o && typeof o === 'object' && (o.waitUntil != null || (Array.isArray(o.items) && o.items.every(x => Array.isArray(x) && itemOf(x[0]))));
    this.orders = Array.isArray(s.orders) ? s.orders.filter(validOrder).slice(0, ORDER_RULES.slots) : [];
    this.truck = validOrder(s.truck) ? s.truck : null;
    if (s.stall && typeof s.stall === 'object') {
      const cu = s.stall.customer;
      const prof = cu && CUSTOMERS.find(c => c.id === cu.profile);
      this.stall = {
        nextAt: num(s.stall.nextAt, 0),
        customer: prof && Array.isArray(cu.items) && cu.items.every(x => Array.isArray(x) && itemOf(x[0])) ? { ...cu, profile: prof, basket: Array.isArray(cu.basket) ? cu.basket : [], tray: [] } : null
      };
    }
    if (s.upgrades && typeof s.upgrades === 'object') UPGRADES.forEach(u => { this.upgrades[u.id] = int(s.upgrades[u.id], 0, u.costs.length, 0); });
    if (Array.isArray(s.vocab)) s.vocab.forEach(w => { if (typeof w === 'string') this.learnedVocab.add(w); });
    this.records = Array.isArray(s.records) ? s.records.filter(r => r && Number.isFinite(Number(r.earnings))) : [];
    if (s.stats && typeof s.stats === 'object') Object.keys(this.stats).forEach(k => { this.stats[k] = int(s.stats[k], 0, 1e9, 0); });
    this.eventSeen = typeof s.eventSeen === 'string' ? s.eventSeen : '';
    this.savedAt = num(s.updatedAt, 0);
    this.ensureOrders();
    return true;
  }

  // Lưu thường xuyên (game liên tục): trên máy ngay, lên tài khoản thưa hơn
  markDirty() { this.dirty = true; }
  saveNow(force = false) {
    const t = now();
    if (!this.dirty && !force) return;
    const snap = this.snapshot();
    this.savedAt = snap.updatedAt;
    LocalSave.write(this.owner, snap);
    this.lastLocalSave = t;
    this.dirty = false;
    if (this.cloud.loggedIn && (force || t - this.lastCloudSave > 30000)) {
      this.lastCloudSave = t;
      GameCloud.post({ save: snap }).catch(() => {});
    }
  }

  // --------------------------------------------------------------------------
  // Tiện ích
  // --------------------------------------------------------------------------
  $(id) { return document.getElementById(id); }
  setText(id, text) { const el = this.$(id); if (el) el.textContent = text; }
  showToast(icon, text, kind = '') {
    const box = this.$('g-toasts');
    if (!box) return;
    const t = document.createElement('div');
    t.className = `g-toast ${kind}`;
    t.innerHTML = `<span class="t-icon">${icon}</span><span>${escapeHtml(text)}</span>`;
    box.appendChild(t);
    while (box.children.length > (this.isPortrait ? 1 : 2)) box.firstChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 2800);
  }
  learn(word) {
    if (!word || this.learnedVocab.has(word)) return;
    this.learnedVocab.add(word);
    this.setText('hud-vocab-val', `${this.learnedCount()}/${VOCAB_TOTAL}`);
    this.markDirty();
  }
  isModalOpen() { return [...document.querySelectorAll('.g-modal')].some(m => m.style.display && m.style.display !== 'none'); }
  isTitleVisible() { const t = this.$('title-screen'); return !!t && !t.classList.contains('hidden'); }
  openModal(id) { const m = this.$(id); if (m) m.style.display = 'flex'; }
  closeModal(id) { const m = this.$(id); if (m) m.style.display = 'none'; }
  isOpen(id) { const m = this.$(id); return !!m && m.style.display === 'flex'; }
  stagePos(el) {
    const stage = this.$('g-stage').getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const s = this.stageScale || 1;
    return { x: (r.left - stage.left) / s, y: (r.top - stage.top) / s, w: r.width / s, h: r.height / s };
  }
  floatText(text, el) {
    const stage = this.$('g-stage');
    if (!stage || !el) return;
    const a = this.stagePos(el);
    const f = document.createElement('div');
    f.className = 'farm-float';
    f.textContent = text;
    f.style.left = `${a.x + a.w / 2}px`;
    f.style.top = `${a.y + a.h / 3}px`;
    stage.appendChild(f);
    setTimeout(() => f.remove(), 1100);
  }

  // --------------------------------------------------------------------------
  // Kho
  // --------------------------------------------------------------------------
  stockOf(id) { return this.storage[id] || 0; }
  siloCap() { return CAP_BASE + CAP_STEP * this.siloLv; }
  barnCap() { return CAP_BASE + CAP_STEP * this.barnLv; }
  usedOf(where) { return ITEMS.filter(it => (where === 'silo') === (it.kind === 'crop')).reduce((s, it) => s + this.stockOf(it.id), 0); }
  freeFor(id) { const it = itemOf(id); return it.kind === 'crop' ? this.siloCap() - this.usedOf('silo') : this.barnCap() - this.usedOf('barn'); }
  addItem(id, n) { this.storage[id] = this.stockOf(id) + n; this.markDirty(); }
  takeItem(id, n) {
    if (this.stockOf(id) < n) return false;
    this.storage[id] -= n;
    if (!this.storage[id]) delete this.storage[id];
    this.markDirty();
    return true;
  }
  // thả vật liệu nâng cấp ngẫu nhiên vào nhà kho
  maybeMaterial(chance, el) {
    if (Math.random() >= chance) return;
    const m = itemOf(pickOne(MATERIALS));
    if (this.freeFor(m.id) < 1) return;
    this.addItem(m.id, 1);
    this.learn(m.chn);
    this.showToast(m.icon, `Nhặt được 1 ${m.q}${m.chn} (${m.vi}) — dùng để nâng cấp kho!`);
    if (el) setTimeout(() => this.floatText(`+1 ${m.icon}`, el), 300);
  }

  // --------------------------------------------------------------------------
  // Cấp độ, XP, vàng, kim cương
  // --------------------------------------------------------------------------
  addXP(n) {
    if (n <= 0) return;
    this.xp += n;
    let leveled = false;
    while (this.xp >= xpFor(this.level + 1)) { this.level += 1; leveled = true; this.onLevelUp(); }
    if (leveled) this.renderAll();
    this.updateHUD();
    this.markDirty();
  }
  addCoins(n) { this.coins += Math.round(n); this.updateHUD(); this.markDirty(); }
  spend(n) {
    if (this.coins < n) { this.audio.error(); this.showToast('🪙', `Cần ${n} vàng — chưa đủ vàng.`, 'warn'); return false; }
    this.coins -= n;
    this.updateHUD();
    this.markDirty();
    return true;
  }
  spendGems(n) {
    if (this.gems < n) { this.audio.error(); this.showToast('💎', `Cần ${n} kim cương — lên cấp hoặc giao xe tải để có thêm.`, 'warn'); return false; }
    this.gems -= n;
    this.learn('钻石');
    this.updateHUD();
    this.markDirty();
    return true;
  }

  unlocksAt(L) {
    const out = [];
    CROPS.filter(c => c.lvl === L).forEach(c => out.push(`${c.icon} <span class="zh">${c.chn}</span> ${escapeHtml(c.vi)}`));
    BUILDINGS.filter(b => b.lvl === L).forEach(b => out.push(`${b.icon} <span class="zh">${b.chn}</span> ${escapeHtml(b.vi)}`));
    BUILDINGS.forEach(b => (b.recipes || []).filter(r => r.lvl === L && r.lvl !== b.lvl).forEach(r => { const it = itemOf(r.out); out.push(`${it.icon} <span class="zh">${it.chn}</span> ${escapeHtml(it.vi)}`); }));
    const plots = PLOT_CELLS.map((_, k) => k).filter(k => k >= PLOTS_START && plotLevel(k) === L).length;
    if (plots) out.push(`🟫 +${plots} ô ruộng có thể mua`);
    return out;
  }

  onLevelUp() {
    const L = this.level;
    const gems = L % 5 === 0 ? 3 : 1;
    const coins = 10 * L;
    this.gems += gems;
    this.coins += coins;
    this.learn('升级');
    this.learn('经验');
    this.records.push({ day: L, earnings: this.xp, served: this.stats.orders + this.stats.stall, total: Math.max(1, this.stats.orders + this.stats.stall), lost: 0, avg: 100, stars: Math.min(3, Math.floor(L / 5)), date: new Date().toLocaleDateString('vi-VN') });
    this.setText('lu-level', String(L));
    const rw = this.$('lu-reward');
    if (rw) rw.innerHTML = `<span>🪙 +${coins}</span><span>💎 +${gems}</span>`;
    const un = this.$('lu-unlocks');
    const list = this.unlocksAt(L);
    if (un) un.innerHTML = list.length ? `<b>🔓 Mở khóa:</b><ul>${list.map(x => `<li>${x}</li>`).join('')}</ul>` : '';
    this.audio.fanfare();
    this.openModal('modal-levelup');
    setTimeout(() => this.audio.speak(`升级了！${L}级！`), 300);
    this.saveNow(true);
    if (this.cloud.loggedIn) this.pushLevelResult();
  }

  async pushLevelResult() {
    const served = Math.max(1, Math.min(100000, this.stats.orders + this.stats.stall));
    const r = { day: this.level, earnings: this.xp, served, total: served, lost: 0, avg: 100, stars: Math.min(3, Math.floor(this.level / 5)) };
    try {
      const res = await GameCloud.post({ dayResult: r, save: this.snapshot() });
      if (res && res.best) this.cloud.best = res.best;
      if (res && Array.isArray(res.history)) this.cloud.history = res.history;
      this.renderAccountChip();
    } catch (e) {}
  }

  // --------------------------------------------------------------------------
  // Thời tiết & ngày lễ (theo ngày thật)
  // --------------------------------------------------------------------------
  todayEvent() {
    const key = dateKey();
    if (this._evKey === key) return this._ev;
    const r = hashStr(`farm-${key}`);
    let ev;
    if (r < HOLIDAY_RULES.chance) ev = { ...HOLIDAYS[Math.floor(hashStr(`h-${key}`) * HOLIDAYS.length)], kind: 'holiday', grow: 1 };
    else {
      const total = WEATHERS.reduce((t, w) => t + w.w, 0);
      let x = hashStr(`w-${key}`) * total;
      ev = { ...(WEATHERS.find(w => (x -= w.w) < 0) || WEATHERS[0]), kind: 'weather' };
    }
    this._evKey = key;
    this._ev = ev;
    return ev;
  }
  growRate() { return (this.todayEvent().grow || 1) * (1 + 0.2 * (this.upgrades.sprinkler || 0)); }
  orderBonus() { return this.todayEvent().kind === 'holiday' ? HOLIDAY_RULES.orderBonus : 1; }

  announceEvent() {
    const ev = this.todayEvent();
    const key = dateKey();
    this.learn(ev.kind === 'holiday' ? '节日' : '天气');
    this.learn(ev.chn);
    if (this.eventSeen === key) return;
    this.eventSeen = key;
    this.markDirty();
    const say = ev.kind === 'holiday' ? `今天是${ev.chn}！${ev.greet}` : `今天${ev.chn}。`;
    this.showToast(ev.icon, ev.kind === 'holiday'
      ? `${ev.chn} (${ev.pin}) · ${ev.vi} — ${ev.greet} Đơn hàng hôm nay thưởng thêm 20%!`
      : `${ev.chn} (${ev.pin}) · ${ev.vi} — ${ev.note}`);
    setTimeout(() => this.audio.speak(say), 600);
  }

  // --------------------------------------------------------------------------
  // Giao diện & sự kiện
  // --------------------------------------------------------------------------
  initDOM() {
    const on = (id, ev, fn) => { const el = this.$(id); if (el) el.addEventListener(ev, fn); };
    window.addEventListener('resize', () => this.fitStage());
    window.addEventListener('orientationchange', () => setTimeout(() => this.fitStage(), 200));
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.saveNow(true); else this.tick(); });
    window.addEventListener('pagehide', () => this.saveNow(true));

    on('btn-title-play', 'click', () => this.onTitlePlay());
    on('btn-title-guide', 'click', () => { this.audio.pop(); this.openModal('modal-guide'); });
    on('btn-title-rank', 'click', () => { this.audio.pop(); this.openRankModal(); });
    on('btn-hud-home', 'click', () => { this.audio.pop(); this.saveNow(true); this.showTitleScreen(); });
    on('btn-pause-game', 'click', () => { this.audio.pop(); this.openModal('modal-settings'); });
    on('btn-fullscreen', 'click', () => this.toggleFullscreen());
    on('btn-rotate-fullscreen', 'click', () => this.toggleFullscreen());
    on('btn-open-vocab', 'click', () => { this.audio.pop(); this.openVocabModal(); });
    on('btn-level', 'click', () => this.showLevelInfo());
    on('hud-weather', 'click', () => { const ev = this.todayEvent(); this.audio.speak(ev.kind === 'holiday' ? `今天是${ev.chn}！${ev.greet}` : `今天${ev.chn}。`); this.showToast(ev.icon, `${ev.chn} (${ev.pin}) · ${ev.vi} — ${ev.kind === 'holiday' ? 'đơn hàng thưởng +20%' : ev.note}`); });
    on('btn-bankrupt-restart', 'click', () => this.restartAfterBankrupt());
    on('btn-bankrupt-say', 'click', () => this.audio.speak('钱花光了，农场破产了！'));

    // dock
    on('btn-orders', 'click', () => this.openOrders());
    on('btn-truck', 'click', () => this.openTruck());
    on('btn-stall', 'click', () => this.openStall());
    on('btn-storage', 'click', () => this.openStorage());
    on('btn-shop', 'click', () => this.openShop());
    on('btn-harvest-all', 'click', () => this.harvestAll());

    // bản đồ
    on('farm-map', 'click', (e) => {
      const p = e.target.closest('[data-plot]');
      if (p) { this.tapPlot(+p.dataset.plot, p); return; }
      const b = e.target.closest('[data-bld]');
      if (b) { this.tapBuilding(b.dataset.bld, b); return; }
      const f = e.target.closest('[data-fix]');
      if (f) { this.tapFixture(f.dataset.fix); return; }
      this.hideTip();
    });
    on('seed-list', 'click', (e) => {
      const s = e.target.closest('[data-seed]');
      if (s) { this.chooseSeed(s.dataset.seed); return; }
      const b = e.target.closest('[data-buyseed]');
      if (b) this.buySeed(b.dataset.buyseed);
    });
    on('btn-seed-close', 'click', () => this.closeSeedTray());
    on('plot-tip', 'click', (e) => { const s = e.target.closest('[data-skip]'); if (s) this.skipPlot(+s.dataset.skip); });

    // modal: đơn hàng, xe tải, quầy, xưởng, kho, cửa hàng
    on('orders-grid', 'click', (e) => {
      const d = e.target.closest('[data-deliver]');
      if (d) { this.deliverOrder(+d.dataset.deliver); return; }
      const x = e.target.closest('[data-discard]');
      if (x) { this.discardOrder(+x.dataset.discard); return; }
      const say = e.target.closest('[data-say-order]');
      if (say) this.speakOrderText(this.orders[+say.dataset.sayOrder]);
    });
    on('truck-body', 'click', (e) => {
      if (e.target.closest('[data-truck-go]')) this.deliverTruck();
      if (e.target.closest('[data-say-truck]')) this.speakOrderText(this.truck);
    });
    on('stall-body', 'click', (e) => {
      const p = e.target.closest('[data-spick]');
      if (p) { this.stallPick(p.dataset.spick); return; }
      const r = e.target.closest('[data-sremove]');
      if (r) { this.stallRemove(r.dataset.sremove); return; }
      const m = e.target.closest('[data-money]');
      if (m) { this.stallAddMoney(parseFloat(m.dataset.money)); return; }
      const t = e.target.closest('[data-tray]');
      if (t) { this.stallRemoveMoney(+t.dataset.tray); return; }
      const a = e.target.closest('[data-sact]');
      if (a) this.stallAction(a.dataset.sact);
    });
    on('bld-body', 'click', (e) => {
      const a = e.target.closest('[data-bact]');
      if (a) this.buildingAction(a.dataset.bact, a.dataset.bid, a.dataset.arg);
    });
    on('storage-tabs', 'click', (e) => { const t = e.target.closest('[data-stab]'); if (t) { this.storageTab = t.dataset.stab; this.audio.pop(); this.renderStorage(); } });
    on('storage-body', 'click', (e) => { const u = e.target.closest('[data-upgrade-store]'); if (u) this.upgradeStorage(u.dataset.upgradeStore); });
    on('market-zones', 'click', (e) => { const z = e.target.closest('[data-mz]'); if (z) { this.shopZone = z.dataset.mz; this.audio.pop(); this.renderShop(); } });
    on('market-grid', 'click', (e) => {
      const b = e.target.closest('[data-buy]');
      if (!b || b.disabled) return;
      const [kind, id] = b.dataset.buy.split(':');
      if (kind === 'build') this.buyBuilding(id);
      else if (kind === 'animal') this.buyAnimal(id);
      else if (kind === 'plot') this.buyPlot();
      else if (kind === 'upgrade') this.buyUpgrade(id);
      else if (kind === 'slot') this.buySlot(id);
    });

    document.addEventListener('click', (e) => {
      const say = e.target.closest('[data-say-chn]');
      if (say) this.audio.speak(say.dataset.sayChn);
    });
    document.querySelectorAll('.rank-tab').forEach(btn => btn.addEventListener('click', () => { this.audio.pop(); this.switchRankTab(btn.dataset.rankTab); }));
    document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => {
      this.closeModal(btn.dataset.close);
      this.saveNow();
      this.renderMap(true);
      this.renderDock();
    }));

    on('setting-sfx', 'change', (e) => { this.audio.sfxEnabled = e.target.checked; });
    on('setting-voice', 'change', (e) => { this.audio.voiceEnabled = e.target.checked; });
    on('setting-pinyin', 'change', (e) => { this.showPinyin = e.target.checked; });
    on('setting-vietnamese', 'change', (e) => { this.showVietnamese = e.target.checked; });
    on('btn-back-to-title', 'click', () => { this.closeModal('modal-settings'); this.saveNow(true); this.showTitleScreen(); });
    on('btn-reset-save', 'click', () => this.resetGame());
  }

  fitStage() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const portrait = h > w * 1.05;
    let sw = STAGE_W;
    let sh = STAGE_H;
    if (portrait) {
      sw = PORTRAIT_W;
      sh = Math.round((PORTRAIT_W * h) / Math.max(1, w));
      if (sh < PORTRAIT_MIN_H) { sh = PORTRAIT_MIN_H; sw = Math.max(PORTRAIT_W, Math.round((PORTRAIT_MIN_H * w) / Math.max(1, h))); }
    }
    const scale = Math.min(w / sw, h / sh);
    this.stageScale = scale > 0 ? scale : 1;
    const root = document.documentElement.style;
    root.setProperty('--stage-scale', this.stageScale.toFixed(4));
    root.setProperty('--stage-w', `${sw}px`);
    root.setProperty('--stage-h', `${sh}px`);
    document.body.classList.toggle('stage-flush', portrait || (w - sw * this.stageScale < 24 && h - sh * this.stageScale < 24) || w < 900);
    this.isPortrait = portrait;
    document.body.classList.toggle('g-portrait', portrait);
  }

  toggleFullscreen() {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
      else if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    } catch (e) {}
  }

  showTitleScreen() {
    const el = this.$('title-screen');
    if (el) el.classList.remove('hidden');
    document.body.classList.add('on-title');
    const loading = !this.cloud.checked && GameCloud.signedIn();
    this.setText('title-play-vi', loading ? 'Đang tải…' : (this.level > 1 || this.xp > 0 ? `Vào nông trại · cấp ${this.level}` : 'Vào nông trại'));
    const play = this.$('btn-title-play');
    if (play) play.disabled = !!loading;
    const prog = this.$('title-progress');
    if (prog) prog.innerHTML = this.level > 1 || this.xp > 0
      ? `<span>⭐ Cấp ${this.level}</span><span>🪙 ${this.coins}</span><span>💎 ${this.gems}</span><span>🌾 ${this.plotsOwned} ô ruộng</span>`
      : '<span>✨ Vừa làm nông · vừa học tiếng Trung</span>';
  }

  onTitlePlay() {
    if (!this.cloud.checked && GameCloud.signedIn()) return;
    this.audio.init();
    this.audio.pop();
    const el = this.$('title-screen');
    if (el) el.classList.add('hidden');
    document.body.classList.remove('on-title');
    this.tick();
    this.renderAll();
    this.announceEvent();
    if (this.xp === 0 && this.level === 1) setTimeout(() => this.showToast('👆', 'Lúa mì sắp chín! Chạm vào ô ruộng có ✨ để thu hoạch, rồi chạm ô trống để gieo lại.'), 1500);
    this.checkBankrupt();
  }

  async restartAfterBankrupt() {
    const btn = this.$('btn-bankrupt-restart');
    if (btn) btn.disabled = true;
    LocalSave.clear(this.owner);
    if (this.cloud.loggedIn) { try { await GameCloud.post({ resetSave: true }); } catch (e) {} }
    location.reload();
  }

  async resetGame() {
    if (!confirm('Chơi lại từ đầu? Nông trại (cấp độ, vàng, ruộng, chuồng trại) sẽ bị xóa. Kỷ lục trên bảng xếp hạng vẫn được giữ.')) return;
    LocalSave.clear(this.owner);
    if (this.cloud.loggedIn) { try { await GameCloud.post({ resetSave: true }); } catch (e) {} }
    location.reload();
  }

  // Phá sản: kho không còn hạt nào, ruộng trống, không có gì đang làm, không đủ vàng mua hạt rẻ nhất
  isBankrupt() {
    const anyStock = ITEMS.some(it => it.kind !== 'material' && this.stockOf(it.id) > 0);
    const anyGrowing = this.plots.some(p => p.crop);
    const anyBusy = BUILDINGS.some(b => { const s = this.blds[b.id]; return s.owned && (b.type === 'animal' ? s.readyAt > 0 : s.queue.length > 0); });
    return !anyStock && !anyGrowing && !anyBusy && this.coins < itemOf('wheat').price;
  }
  checkBankrupt() {
    if (this.bankrupt || !this.isBankrupt()) return false;
    this.bankrupt = true;
    this.learn('破产');
    this.setText('bk-day', String(this.level));
    this.setText('bk-reason', 'Kho không còn gì, ruộng trống trơn và không đủ vàng mua dù chỉ 1 hạt giống.');
    this.openModal('modal-bankrupt');
    this.audio.sad();
    setTimeout(() => this.audio.speak('钱花光了，农场破产了！'), 400);
    return true;
  }

  // --------------------------------------------------------------------------
  // Vòng lặp: mỗi giây cập nhật đồng hồ thật
  // --------------------------------------------------------------------------
  tick() {
    const t = now();
    // ô đơn hàng trống đến giờ → có đơn mới; xe tải quay lại
    let changed = false;
    this.orders.forEach((o, i) => { if (o.waitUntil != null && t >= o.waitUntil) { this.orders[i] = this.makeOrder(); changed = true; } });
    if (this.truck && this.truck.waitUntil != null && t >= this.truck.waitUntil) { this.truck = this.makeTruckOrder(); changed = true; this.showToast('🚚', 'Xe tải đã quay lại với đơn hàng mới!'); }
    if (!this.truck) { this.truck = this.makeTruckOrder(); changed = true; }
    this.ensureOrders();
    // quầy bán lẻ: khách đến / bỏ về
    const st = this.stall;
    if (st.customer && !st.customer.servedAt && t > st.customer.leaveAt && !this.isOpen('modal-stall')) {
      this.showToast('😞', `${st.customer.profile.nameChn} chờ lâu ở quầy nên đã về.`, 'warn');
      this.clearStallBasket();
      st.customer = null;
      st.nextAt = t + this.stallGapMs();
      changed = true;
    }
    if (!st.customer && t >= st.nextAt && !this.isTitleVisible()) { this.spawnStallCustomer(); changed = true; }
    // vật nuôi xong / xưởng xong → nhắc 1 lần
    BUILDINGS.forEach(b => {
      const s = this.blds[b.id];
      if (!s.owned) return;
      const doneNow = b.type === 'animal' ? s.readyAt > 0 && t >= s.readyAt : s.queue.some(j => t >= j.readyAt);
      const k = `_done_${b.id}`;
      if (doneNow && !this[k] && !this.isTitleVisible()) this.showToast(b.type === 'animal' ? itemOf(b.product).icon : b.icon, `${b.chn} (${b.vi}) đã xong — chạm để thu!`);
      this[k] = doneNow;
    });
    if (changed) this.markDirty();
    if (!this.isTitleVisible()) {
      this.renderMap();
      this.renderDock();
      if (this.isOpen('modal-building') && this.openBld) this.renderBuildingModal(this.openBld);
      if (this.isOpen('modal-orders')) this.renderOrders();
      if (this.isOpen('modal-truck')) this.renderTruck();
      if (this.isOpen('modal-stall') && this.stallStep !== 'pay') this.renderStall();
      if (this.tipPlot != null) this.renderTip();
    }
    if (now() - this.lastLocalSave > 10000) this.saveNow();
    this.checkBankrupt();
  }

  // --------------------------------------------------------------------------
  // Ruộng
  // --------------------------------------------------------------------------
  plotReady(p, t = now()) { return !!p.crop && t >= p.readyAt; }
  plotProgress(p, t = now()) {
    if (!p.crop) return 0;
    const total = (itemOf(p.crop).grow * 1000) / (p.rate || 1);
    return Math.max(0, Math.min(1, 1 - (p.readyAt - t) / total));
  }

  tapPlot(i, el) {
    if (i >= this.plotsOwned) { this.openShop('land'); return; }
    const p = this.plots[i];
    if (!p.crop) {
      if (this.seedTrayOpen && this.selectedSeed && this.stockOf(this.selectedSeed) > 0) { this.plant(i, this.selectedSeed, el); return; }
      this.openSeedTray(i);
      return;
    }
    if (this.plotReady(p)) { this.harvest(i, el); return; }
    this.tipPlot = i;
    this.renderTip();
  }

  openSeedTray(i = null) {
    this.pendingPlot = i;
    this.seedTrayOpen = true;
    this.hideTip();
    this.learn('种子');
    this.renderSeedTray();
    const tray = this.$('seed-tray');
    if (tray) tray.hidden = false;
  }
  closeSeedTray() { this.seedTrayOpen = false; this.pendingPlot = null; const tray = this.$('seed-tray'); if (tray) tray.hidden = true; }

  chooseSeed(id) {
    const c = itemOf(id);
    if (!c || c.lvl > this.level) return;
    this.selectedSeed = id;
    this.audio.pick();
    if (this.stockOf(id) <= 0) { this.audio.error(); this.showToast(c.icon, `Kho lúa hết ${c.chn}! Bấm 🪙 để mua hạt.`, 'warn'); this.renderSeedTray(); return; }
    if (this.pendingPlot != null && !this.plots[this.pendingPlot].crop) this.plant(this.pendingPlot, id, document.querySelector(`[data-plot="${this.pendingPlot}"]`));
    this.pendingPlot = null;
    this.renderSeedTray();
  }

  buySeed(id) {
    const c = itemOf(id);
    if (!c) return;
    if (this.freeFor(id) < 1) { this.audio.error(); this.learn('仓库满了'); this.showToast('🏚️', '粮仓满了！Kho lúa đầy.', 'warn'); return; }
    if (!this.spend(c.price)) return;
    this.addItem(id, 1);
    this.audio.coin();
    this.renderSeedTray();
  }

  plant(i, id, el) {
    const p = this.plots[i];
    const c = itemOf(id);
    if (p.crop || !c) return false;
    if (!this.takeItem(id, 1)) { this.audio.error(); this.showToast(c.icon, `Kho lúa hết ${c.chn} để gieo!`, 'warn'); return false; }
    const rate = this.growRate();
    p.crop = id;
    p.rate = rate;
    p.readyAt = now() + (c.grow * 1000) / rate;
    this.learn('播种');
    this.learn(c.chn);
    this.audio.plant();
    this.renderMap(true);
    this.renderSeedTray();
    this.markDirty();
    return true;
  }

  harvest(i, el, quiet = false) {
    const p = this.plots[i];
    const c = itemOf(p.crop);
    if (!c || !this.plotReady(p)) return 0;
    if (this.freeFor(c.id) < 2) {
      if (!quiet) { this.audio.error(); this.learn('仓库满了'); this.showToast('🌾', `粮仓满了！Kho lúa đầy (${this.usedOf('silo')}/${this.siloCap()}). Giao đơn hoặc nâng cấp kho lúa.`, 'warn'); }
      return -1;
    }
    this.addItem(c.id, 2);
    p.crop = null;
    p.readyAt = 0;
    this.stats.harvested += 2;
    this.learn('收获');
    this.learn('成熟');
    this.learn(c.chn);
    if (!quiet) {
      this.audio.harvest();
      this.floatText(`+2 ${c.icon}  +${c.xp * 2}XP`, el);
    }
    this.addXP(c.xp * 2);
    this.maybeMaterial(HARVEST_MATERIAL_CHANCE, el);
    this.renderMap(true);
    return 2;
  }

  harvestAll() {
    let n = 0, full = false;
    this.plots.forEach((p, i) => {
      if (i >= this.plotsOwned || !this.plotReady(p)) return;
      const r = this.harvest(i, null, true);
      if (r > 0) n += r; else if (r < 0) full = true;
    });
    if (n) { this.audio.harvest(); this.showToast('🌾', `收获！Thu hoạch được ${n} nông sản.`); }
    if (full) { this.learn('仓库满了'); this.showToast('🏚️', '粮仓满了！Kho lúa đầy, còn ô chưa thu được.', 'warn'); }
    this.renderAll();
  }

  skipPlot(i) {
    const p = this.plots[i];
    if (!p.crop || this.plotReady(p)) return;
    const cost = skipGems((p.readyAt - now()) / 1000);
    if (!this.spendGems(cost)) return;
    p.readyAt = now();
    this.audio.unlock();
    this.hideTip();
    this.renderMap(true);
  }

  renderTip() {
    const tip = this.$('plot-tip');
    const i = this.tipPlot;
    if (!tip || i == null) return;
    const p = this.plots[i];
    if (!p || !p.crop || this.plotReady(p)) { this.hideTip(); this.renderMap(); return; }
    const c = itemOf(p.crop);
    const remain = (p.readyAt - now()) / 1000;
    tip.hidden = false;
    tip.innerHTML = `<span class="pt-ico">${c.icon}</span><span class="pt-txt"><b class="zh">${c.chn}</b> ${escapeHtml(c.vi)}<small>còn ${fmtSec(remain)} nữa chín</small></span>
      <button type="button" class="pt-skip" data-skip="${i}">⚡ Xong ngay · ${skipGems(remain)} 💎</button>`;
  }
  hideTip() { this.tipPlot = null; const tip = this.$('plot-tip'); if (tip) tip.hidden = true; }

  // --------------------------------------------------------------------------
  // Chuồng trại & xưởng
  // --------------------------------------------------------------------------
  animalPhase(b, s, t = now()) { return !s.n ? 'empty' : !s.readyAt ? 'hungry' : t >= s.readyAt ? 'ready' : 'busy'; }

  tapBuilding(id, el) {
    const b = bldOf(id);
    const s = this.blds[id];
    if (!s.owned) { this.openShop('buildings'); return; }
    if (b.type === 'animal') {
      const ph = this.animalPhase(b, s);
      if (ph === 'ready') { this.collectAnimals(id, el); return; }
      if (ph === 'hungry' && this.stockOf(b.food) >= s.n) { this.feedAnimals(id, el); return; }
    } else if (s.queue.some(j => now() >= j.readyAt)) { this.collectFactory(id, el); return; }
    this.openBuilding(id);
  }

  feedAnimals(id, el) {
    const b = bldOf(id);
    const s = this.blds[id];
    const food = itemOf(b.food);
    if (this.animalPhase(b, s) !== 'hungry') return;
    if (!this.takeItem(b.food, s.n)) { this.audio.error(); this.showToast(food.icon, `Cần ${s.n} ${food.q}${food.chn} (${food.vi}) để cho ${s.n} ${b.animal.vi} ăn — làm ở 饲料厂.`, 'warn'); return; }
    s.readyAt = now() + b.time * 1000;
    this.learn('喂'); this.learn('饲料'); this.learn(b.animal.chn); this.learn(food.chn);
    this.audio.cluck();
    this.showToast(b.animal.icon, `喂${b.animal.chn} · Đã cho ${s.n} ${b.animal.vi} ăn. ${fmtSec(b.time)} nữa có ${itemOf(b.product).chn}.`);
    this.markDirty();
    this.renderMap(true);
    if (this.isOpen('modal-building')) this.renderBuildingModal(id);
  }

  collectAnimals(id, el) {
    const b = bldOf(id);
    const s = this.blds[id];
    const prod = itemOf(b.product);
    if (this.animalPhase(b, s) !== 'ready') return;
    if (this.freeFor(prod.id) < s.n) { this.audio.error(); this.learn('仓库满了'); this.showToast('🏚️', `仓库满了！Nhà kho cần ${s.n} chỗ trống để lấy ${prod.chn}.`, 'warn'); return; }
    this.addItem(prod.id, s.n);
    s.readyAt = 0;
    this.learn(prod.chn);
    this.audio.harvest();
    this.floatText(`+${s.n} ${prod.icon}  +${prod.xp * s.n}XP`, el);
    this.addXP(prod.xp * s.n);
    this.renderMap(true);
    if (this.isOpen('modal-building')) this.renderBuildingModal(id);
  }

  startRecipe(id, out) {
    const b = bldOf(id);
    const s = this.blds[id];
    const r = b.recipes.find(x => x.out === out);
    if (!r || r.lvl > this.level) return;
    if (s.queue.length >= s.slots) { this.audio.error(); this.showToast(b.icon, 'Hàng chờ đã đầy — chờ xong bớt hoặc mua thêm ô chờ ở 商店.', 'warn'); return; }
    const need = Object.entries(r.need);
    const miss = need.filter(([k, v]) => this.stockOf(k) < v);
    if (miss.length) { this.audio.error(); this.showToast('📦', `Thiếu ${miss.map(([k, v]) => `${v - this.stockOf(k)} ${itemOf(k).chn}`).join(', ')}.`, 'warn'); return; }
    need.forEach(([k, v]) => this.takeItem(k, v));
    const start = Math.max(now(), ...s.queue.map(j => j.readyAt));
    s.queue.push({ out, readyAt: start + r.time * 1000 });
    this.learn(b.chn);
    this.learn(itemOf(out).chn);
    this.audio.pop();
    this.markDirty();
    this.renderBuildingModal(id);
    this.renderMap(true);
  }

  collectFactory(id, el) {
    const b = bldOf(id);
    const s = this.blds[id];
    const t = now();
    const done = s.queue.filter(j => t >= j.readyAt);
    if (!done.length) return;
    let got = 0, xp = 0, full = false;
    const left = [];
    s.queue.forEach(j => {
      if (t < j.readyAt) { left.push(j); return; }
      const r = b.recipes.find(x => x.out === j.out);
      if (this.freeFor(j.out) < r.n) { full = true; left.push(j); return; }
      this.addItem(j.out, r.n);
      got += r.n;
      xp += itemOf(j.out).xp * r.n;
      this.learn(itemOf(j.out).chn);
    });
    s.queue = left;
    if (got) { this.audio.harvest(); this.floatText(`+${got} ${itemOf(done[0].out).icon}  +${xp}XP`, el); this.addXP(xp); }
    if (full) { this.learn('仓库满了'); this.showToast('🏚️', '仓库满了！Nhà kho đầy — còn hàng chưa lấy được.', 'warn'); }
    this.markDirty();
    this.renderMap(true);
    if (this.isOpen('modal-building')) this.renderBuildingModal(id);
  }

  skipBuilding(id) {
    const b = bldOf(id);
    const s = this.blds[id];
    const t = now();
    if (b.type === 'animal') {
      if (this.animalPhase(b, s) !== 'busy') return;
      if (!this.spendGems(skipGems((s.readyAt - t) / 1000))) return;
      s.readyAt = t;
    } else {
      const j = s.queue.find(x => t < x.readyAt);
      if (!j) return;
      const shift = j.readyAt - t;
      if (!this.spendGems(skipGems(shift / 1000))) return;
      s.queue.forEach(x => { if (x.readyAt >= j.readyAt) x.readyAt -= shift; });
    }
    this.audio.unlock();
    this.markDirty();
    this.renderBuildingModal(id);
    this.renderMap(true);
  }

  openBuilding(id) {
    this.openBld = id;
    this.renderBuildingModal(id);
    this.openModal('modal-building');
  }

  buildingAction(act, id, arg) {
    if (act === 'feed') this.feedAnimals(id);
    else if (act === 'collect') this.collectAnimals(id);
    else if (act === 'make') this.startRecipe(id, arg);
    else if (act === 'fcollect') this.collectFactory(id);
    else if (act === 'skip') this.skipBuilding(id);
    else if (act === 'buy-animal') { this.buyAnimal(id); this.renderBuildingModal(id); }
  }

  renderBuildingModal(id) {
    const b = bldOf(id);
    const s = this.blds[id];
    const t = now();
    const title = this.$('bld-title');
    if (title) title.innerHTML = `${b.icon} <span class="zh">${b.chn}</span> · ${escapeHtml(b.vi)}`;
    const body = this.$('bld-body');
    if (!body) return;
    if (b.type === 'animal') {
      const food = itemOf(b.food);
      const prod = itemOf(b.product);
      const ph = this.animalPhase(b, s);
      const remain = ph === 'busy' ? (s.readyAt - t) / 1000 : 0;
      body.innerHTML = `
        <div class="bld-animals">${Array.from({ length: s.n }, () => `<span>${b.animal.icon}</span>`).join('')}<small>${s.n}/${b.animal.max} ${escapeHtml(b.animal.vi)}</small></div>
        <div class="bld-recipe"><span>1 ${food.icon} <span class="zh">${food.chn}</span></span><i class="fa-solid fa-arrow-right"></i><span>1 ${prod.icon} <span class="zh">${prod.chn}</span></span><small>mỗi con · ${fmtSec(b.time)}</small></div>
        <div class="bld-phase">${ph === 'hungry' ? `😋 Đang đói — cần ${s.n} ${food.icon} <span class="zh">${food.chn}</span> (kho có ${this.stockOf(food.id)})`
          : ph === 'busy' ? `⏳ Đang ${id === 'coop' ? 'đẻ trứng' : 'cho sữa'} — còn ${fmtSec(remain)}`
            : ph === 'ready' ? `✅ Có ${s.n} ${prod.icon} <span class="zh">${prod.chn}</span> chờ thu` : 'Chưa có con nào.'}</div>
        ${ph === 'busy' ? `<div class="bld-bar big"><i style="width:${Math.round(Math.min(1, 1 - remain / b.time) * 100)}%"></i></div>` : ''}
        <div class="bld-actions">
          <button type="button" class="g-btn-primary" data-bact="feed" data-bid="${id}" ${ph === 'hungry' ? '' : 'disabled'}>🍽️ <span class="zh">喂</span> Cho ăn</button>
          <button type="button" class="g-btn-primary" data-bact="collect" data-bid="${id}" ${ph === 'ready' ? '' : 'disabled'}>🧺 <span class="zh">收</span> Thu ${prod.chn}</button>
          ${ph === 'busy' ? `<button type="button" class="g-btn-ghost" data-bact="skip" data-bid="${id}">⚡ Xong ngay · ${skipGems(remain)} 💎</button>` : ''}
          <button type="button" class="g-btn-ghost" data-bact="buy-animal" data-bid="${id}" ${s.n < b.animal.max && this.coins >= b.animal.cost && ph !== 'busy' ? '' : 'disabled'}>➕ ${escapeHtml(b.animal.vi)} · 🪙${b.animal.cost}</button>
        </div>`;
    } else {
      const running = s.queue.find(j => t < j.readyAt);
      body.innerHTML = `
        <div class="recipe-list">${b.recipes.map(r => {
          const it = itemOf(r.out);
          const locked = r.lvl > this.level;
          const ok = !locked && Object.entries(r.need).every(([k, v]) => this.stockOf(k) >= v);
          return `<div class="recipe ${locked ? 'locked' : ''}">
            <span class="rc-out">${r.n > 1 ? `${r.n}×` : ''}${it.icon}<b class="zh">${it.chn}</b><small>${escapeHtml(it.vi)}</small></span>
            <span class="rc-need">${Object.entries(r.need).map(([k, v]) => `<span class="${this.stockOf(k) >= v ? 'ok' : 'miss'}">${itemOf(k).icon}${this.stockOf(k)}/${v}</span>`).join('')}</span>
            <span class="rc-time">⏱ ${fmtSec(r.time)}</span>
            ${locked ? `<span class="rc-lock">🔒 Cấp ${r.lvl}</span>` : `<button type="button" class="g-btn-chip" data-bact="make" data-bid="${id}" data-arg="${r.out}" ${ok && s.queue.length < s.slots ? '' : 'disabled'}>Làm</button>`}
          </div>`;
        }).join('')}</div>
        <div class="queue-row">${Array.from({ length: s.slots }, (_, k) => {
          const j = s.queue[k];
          if (!j) return '<div class="q-slot empty">Trống</div>';
          const it = itemOf(j.out);
          const r = b.recipes.find(x => x.out === j.out);
          const done = t >= j.readyAt;
          const startAt = j.readyAt - r.time * 1000;
          const p = done ? 1 : Math.max(0, (t - startAt) / (r.time * 1000));
          return `<div class="q-slot ${done ? 'done' : ''}"><span>${it.icon}</span><div class="bld-bar"><i style="width:${Math.round(p * 100)}%"></i></div><small>${done ? '✓ Xong' : t < startAt ? 'Chờ lượt' : fmtSec((j.readyAt - t) / 1000)}</small></div>`;
        }).join('')}</div>
        <div class="bld-actions">
          <button type="button" class="g-btn-primary" data-bact="fcollect" data-bid="${id}" ${s.queue.some(j => t >= j.readyAt) ? '' : 'disabled'}>🧺 Thu hàng đã xong</button>
          ${running ? `<button type="button" class="g-btn-ghost" data-bact="skip" data-bid="${id}">⚡ Xong ngay · ${skipGems((running.readyAt - t) / 1000)} 💎</button>` : ''}
        </div>`;
    }
  }

  tapFixture(id) {
    if (id === 'board') this.openOrders();
    else if (id === 'truck') this.openTruck();
    else if (id === 'stall') this.openStall();
    else if (id === 'silo') this.openStorage('silo');
    else if (id === 'barn') this.openStorage('barn');
  }

  // --------------------------------------------------------------------------
  // Đơn hàng (bảng đơn) & xe tải
  // --------------------------------------------------------------------------
  availableItems() {
    return ITEMS.filter(it => {
      if (it.kind === 'crop') return it.lvl <= this.level;
      if (it.kind === 'material') return false;
      const src = BUILDINGS.find(b => (b.product === it.id) || (b.recipes || []).some(r => r.out === it.id && r.lvl <= this.level));
      return !!src && this.blds[src.id].owned;
    });
  }

  makeOrder(big = false) {
    const pool = this.availableItems();
    if (!pool.length) return { waitUntil: now() + 30000 };
    const kinds = big ? Math.min(pool.length, randInt(3, 4)) : Math.min(pool.length, randInt(1, this.level >= 4 ? 3 : 2));
    // món rẻ (cấp thấp) hay xuất hiện hơn; món đang có trong kho cũng được ưu tiên
    const weighted = pool.flatMap(it => Array(Math.max(1, 4 - Math.floor((it.price || 3) / 12)) + (this.stockOf(it.id) > 0 ? 1 : 0)).fill(it));
    const chosen = [];
    let guard = 0;
    while (chosen.length < kinds && guard++ < 200) { const it = pickOne(weighted); if (!chosen.includes(it)) chosen.push(it); }
    const items = chosen.map(it => [it.id, big ? randInt(2, it.price >= 20 ? 3 : 5) : randInt(1, it.price >= 20 ? 2 : 3)]);
    const value = items.reduce((s, [id, q]) => s + itemOf(id).price * q, 0);
    const xp = items.reduce((s, [id, q]) => s + itemOf(id).xp * q, 0) + (big ? 6 : 2);
    return {
      id: `${now().toString(36)}${randInt(100, 999)}`,
      npc: pickOne(CUSTOMERS).id,
      tpl: pickOne(ORDER_TEMPLATES).id,
      items,
      coins: Math.round(value * (big ? 1.5 : 1.15 + Math.random() * 0.15) * this.orderBonus()),
      xp: Math.round(xp * (big ? 1.5 : 1)),
      gems: big && Math.random() < 0.3 ? 1 : 0
    };
  }
  makeTruckOrder() { return this.makeOrder(true); }

  ensureOrders() {
    while (this.orders.length < ORDER_RULES.slots) this.orders.push(this.makeOrder());
  }

  orderPhrase(o) {
    const lines = o.items.map(([id, q]) => ({ it: itemOf(id), q }));
    const zh = lines.map(x => `${NUM_CHN[x.q] || x.q}${x.it.q}${x.it.chn}`);
    const pin = lines.map(x => `${qtyPin(x.q, x.it.qPin)} ${x.it.qPin} ${x.it.pin}`);
    const vi = lines.map(x => `${x.q} ${x.it.qVi} ${x.it.vi}`);
    const t = ORDER_TEMPLATES.find(x => x.id === o.tpl) || ORDER_TEMPLATES[0];
    const first = lines[0].it;
    return {
      zh: t.zh(zh.join('和'), first.chn),
      zhHtml: t.zh(zh.map(z => `<em>${z}</em>`).join('和'), first.chn),
      pin: t.pin(pin.join(' hé '), first.pin),
      vi: t.vi(vi.join(' và '), first.vi),
      learn: t.learn
    };
  }
  speakOrderText(o) { if (o && o.items) this.audio.speak(this.orderPhrase(o).zh); }
  canFill(o) { return !!(o && o.items && o.items.every(([id, q]) => this.stockOf(id) >= q)); }

  openOrders() { this.audio.pop(); this.learn('订单'); this.renderOrders(); this.openModal('modal-orders'); }

  orderCardHtml(o, i, big = false) {
    if (o.waitUntil != null) return `<div class="order-card waiting"><span class="oc-wait">🕒</span><small>Đơn mới sau ${fmtSec((o.waitUntil - now()) / 1000)}</small></div>`;
    const prof = CUSTOMERS.find(c => c.id === o.npc) || CUSTOMERS[0];
    const ph = this.orderPhrase(o);
    const ok = this.canFill(o);
    return `<div class="order-card ${ok ? 'ready' : ''} ${big ? 'big' : ''}">
      <div class="oc-top"><img src="${ASSET(prof.img)}" alt=""><b class="zh">${prof.nameChn}</b>
        <button type="button" class="oc-say" ${big ? 'data-say-truck="1"' : `data-say-order="${i}"`} title="Nghe"><i class="fa-solid fa-volume-high"></i></button></div>
      <div class="oc-line zh">${ph.zhHtml}</div>
      ${this.showPinyin ? `<div class="oc-pin">${escapeHtml(ph.pin)}</div>` : ''}
      ${this.showVietnamese ? `<div class="oc-vi">${escapeHtml(ph.vi)}</div>` : ''}
      <div class="oc-items">${o.items.map(([id, q]) => { const it = itemOf(id); const have = this.stockOf(id); return `<span class="${have >= q ? 'ok' : 'miss'}">${it.icon}<b>${Math.min(have, q)}/${q}</b></span>`; }).join('')}</div>
      <div class="oc-reward"><span>🪙 ${o.coins}</span><span>⭐ ${o.xp} XP</span>${o.gems ? `<span>💎 ${o.gems}</span>` : ''}</div>
      <div class="oc-actions">
        ${big ? `<button type="button" class="g-btn-primary" data-truck-go="1" ${ok ? '' : 'disabled'}>🚚 <span class="zh">发车</span> Giao xe tải</button>`
          : `<button type="button" class="g-btn-primary" data-deliver="${i}" ${ok ? '' : 'disabled'}>✅ <span class="zh">交货</span> Giao hàng</button><button type="button" class="oc-trash" data-discard="${i}" title="Bỏ đơn này"><i class="fa-solid fa-trash"></i></button>`}
      </div>
    </div>`;
  }

  renderOrders() {
    const grid = this.$('orders-grid');
    if (grid) grid.innerHTML = this.orders.map((o, i) => this.orderCardHtml(o, i)).join('');
  }

  deliverOrder(i) {
    const o = this.orders[i];
    if (!o || o.waitUntil != null) return;
    if (!this.canFill(o)) { this.audio.error(); this.showToast('📦', 'Chưa đủ hàng cho đơn này.', 'warn'); return; }
    o.items.forEach(([id, q]) => this.takeItem(id, q));
    this.addCoins(o.coins);
    this.stats.orders += 1;
    (this.orderPhrase(o).learn || []).forEach(w => this.learn(w));
    o.items.forEach(([id]) => { this.learn(itemOf(id).chn); this.learn(itemOf(id).q); });
    this.learn('交货');
    this.audio.register();
    this.showToast('🧾', `交货！Giao đơn xong: +${o.coins} 🪙, +${o.xp} XP.`);
    this.orders[i] = { waitUntil: now() + ORDER_RULES.refillSec * 1000 };
    this.addXP(o.xp);
    this.maybeMaterial(ORDER_RULES.materialChance);
    this.markDirty();
    this.renderOrders();
    this.renderDock();
  }

  discardOrder(i) {
    if (!this.orders[i] || this.orders[i].waitUntil != null) return;
    this.orders[i] = { waitUntil: now() + ORDER_RULES.discardSec * 1000 };
    this.audio.pop();
    this.markDirty();
    this.renderOrders();
  }

  openTruck() { this.audio.pop(); this.learn('卡车'); this.renderTruck(); this.openModal('modal-truck'); }
  renderTruck() {
    const box = this.$('truck-body');
    if (!box) return;
    if (!this.truck || this.truck.waitUntil != null) {
      box.innerHTML = `<div class="truck-away">🚚💨<p>Xe tải đang đi giao hàng — quay lại sau <b>${fmtSec(this.truck ? (this.truck.waitUntil - now()) / 1000 : 0)}</b>.</p></div>`;
      return;
    }
    box.innerHTML = `<p class="farm-note">Đơn lớn của xe tải: thưởng nhiều vàng, XP${this.truck.gems ? ', có cả 💎' : ''} và hay rơi vật liệu nâng cấp.</p>${this.orderCardHtml(this.truck, -1, true)}`;
  }
  deliverTruck() {
    const o = this.truck;
    if (!o || o.waitUntil != null || !this.canFill(o)) { this.audio.error(); return; }
    o.items.forEach(([id, q]) => this.takeItem(id, q));
    this.addCoins(o.coins);
    if (o.gems) { this.gems += o.gems; this.learn('钻石'); }
    this.stats.trucks += 1;
    this.stats.orders += 1;
    o.items.forEach(([id]) => this.learn(itemOf(id).chn));
    this.learn('卡车');
    this.audio.fanfare();
    this.showToast('🚚', `发车！Xe tải chở hàng đi: +${o.coins} 🪙, +${o.xp} XP${o.gems ? `, +${o.gems} 💎` : ''}.`);
    this.truck = { waitUntil: now() + ORDER_RULES.truckCooldownSec * 1000 };
    this.addXP(o.xp);
    this.maybeMaterial(0.5);
    this.markDirty();
    this.renderTruck();
    this.renderDock();
  }

  // --------------------------------------------------------------------------
  // Quầy bán lẻ: khách trả tiền mặt → lấy đúng hàng → thối tiền
  // --------------------------------------------------------------------------
  stallGapMs() {
    const base = randInt(STALL_RULES.gapMin, STALL_RULES.gapMax) * 1000;
    const holiday = this.todayEvent().kind === 'holiday' ? HOLIDAY_RULES.stallBonus : 1;
    return base / ((1 + 0.2 * (this.upgrades.sign || 0)) * holiday);
  }

  spawnStallCustomer() {
    const inStock = this.availableItems().filter(it => this.stockOf(it.id) > 0);
    if (!inStock.length) { this.stall.nextAt = now() + 30000; return; }
    const kinds = Math.min(inStock.length, Math.random() < 0.35 ? 2 : 1);
    const chosen = [];
    while (chosen.length < kinds) { const it = pickOne(inStock); if (!chosen.includes(it)) chosen.push(it); }
    const items = chosen.map(it => [it.id, Math.max(1, Math.min(this.stockOf(it.id), randInt(1, it.price >= 20 ? 1 : 3)))]);
    const due = items.reduce((s, [id, q]) => s + itemOf(id).price * q, 0);
    const paid = this.pickPaidAmount(due);
    const prof = pickOne(CUSTOMERS);
    this.stall.customer = {
      profile: prof, tpl: pickOne(ORDER_TEMPLATES).id, items, due, paid, change: paid - due,
      leaveAt: now() + (STALL_RULES.patienceSec + STALL_RULES.seatSec * (this.upgrades.seats || 0)) * 1000,
      basket: [], tray: [], wrong: 0, changeWrong: 0
    };
    this.stallStep = 'pick';
    this.audio.bell();
    this.showToast('🛎️', `${prof.nameChn} (${prof.nameVi}) đang chờ ở quầy bán lẻ — chạm 🛎️ để bán!`);
    this.markDirty();
  }

  pickPaidAmount(due) {
    const options = new Set();
    const up = (step) => Math.ceil((due + 0.001) / step) * step;
    options.add(up(5));
    options.add(up(10));
    [20, 50, 100].forEach(n => { if (n > due) options.add(n); });
    const list = [...options].filter(v => v > due && v - due <= 47).sort((a, b) => a - b).slice(0, 3);
    return list.length ? pickOne(list) : up(10);
  }

  openStall() {
    this.audio.pop();
    this.learn('摊位');
    const cu = this.stall.customer;
    this.stallStep = cu && this.stallBasketDone() ? (this.stallStep || 'pick') : 'pick';
    this.renderStall();
    this.openModal('modal-stall');
    if (cu) setTimeout(() => this.speakOrderText(cu), 300);
  }

  stallQty(id) { const cu = this.stall.customer; const b = cu && cu.basket.find(x => x[0] === id); return b ? b[1] : 0; }
  stallBasketDone() { const cu = this.stall.customer; return !!cu && cu.items.every(([id, q]) => this.stallQty(id) === q); }
  clearStallBasket() {
    const cu = this.stall.customer;
    if (!cu) return;
    cu.basket.forEach(([id, q]) => this.addItem(id, q));
    cu.basket = [];
  }

  stallPick(id) {
    const cu = this.stall.customer;
    const it = itemOf(id);
    if (!cu || !it) return;
    const line = cu.items.find(x => x[0] === id);
    if (!line) { cu.wrong += 1; this.audio.error(); this.showToast('❌', `Khách không mua ${it.chn} (${it.vi})! Đọc lại lời khách nhé.`, 'warn'); return; }
    if (this.stallQty(id) >= line[1]) { this.audio.error(); this.showToast('✋', `Đủ ${line[1]} ${it.q}${it.chn} rồi!`, 'warn'); return; }
    if (!this.takeItem(id, 1)) { this.audio.error(); this.showToast('📦', `Kho hết ${it.chn}!`, 'warn'); return; }
    const b = cu.basket.find(x => x[0] === id);
    if (b) b[1] += 1; else cu.basket.push([id, 1]);
    this.learn(it.chn);
    this.audio.pick();
    if (this.stallBasketDone()) { this.stallStep = 'pay'; this.learn('一共'); this.showToast('✨', 'Đủ hàng rồi! Khách đưa tiền — tính tiền thối nhé.'); }
    this.renderStall();
  }

  stallRemove(id) {
    const cu = this.stall.customer;
    const b = cu && cu.basket.find(x => x[0] === id);
    if (!b) return;
    b[1] -= 1;
    this.addItem(id, 1);
    if (b[1] <= 0) cu.basket = cu.basket.filter(x => x !== b);
    this.stallStep = 'pick';
    this.audio.pop();
    this.renderStall();
  }

  stallAddMoney(v) { const cu = this.stall.customer; if (!cu || this.stallStep !== 'pay') return; cu.tray.push(v); this.audio.coin(); this.renderStall(); }
  stallRemoveMoney(i) { const cu = this.stall.customer; if (!cu) return; cu.tray.splice(i, 1); this.audio.coin(); this.renderStall(); }

  stallAction(act) {
    const cu = this.stall.customer;
    if (!cu) return;
    if (act === 'reset') { cu.tray = []; this.renderStall(); return; }
    if (act === 'back') { this.stallStep = 'pick'; this.renderStall(); return; }
    if (act === 'sorry') {
      this.learn('不好意思');
      this.audio.speak('不好意思，东西不够了。');
      this.clearStallBasket();
      this.stall.customer = null;
      this.stall.nextAt = now() + this.stallGapMs();
      this.showToast('🙇', '不好意思 · Đã xin lỗi khách, khách ra về.');
      this.markDirty();
      this.renderStall();
      this.renderDock();
      return;
    }
    if (act === 'pay') {
      const tray = cu.tray.reduce((s, v) => s + cents(v), 0);
      const need = cents(cu.change);
      if (tray !== need) {
        cu.changeWrong += 1;
        this.audio.error();
        this.audio.speak('老板，钱找错啦！');
        const diff = (tray - need) / 100;
        this.showToast('💢', diff > 0 ? `Thối THỪA ${fmt(diff)} 元 rồi! Đếm lại nhé.` : `Thối THIẾU ${fmt(-diff)} 元 rồi! Đếm lại nhé.`, 'warn');
        return;
      }
      const perfect = !cu.wrong && !cu.changeWrong;
      const tip = perfect ? Math.max(1, Math.round(cu.due * 0.1)) : 0;
      const xp = cu.items.reduce((s, [id, q]) => s + itemOf(id).xp * q, 0) + (perfect ? 3 : 1);
      this.addCoins(cu.due + tip);
      this.stats.stall += 1;
      this.learn('找零');
      this.learn('谢谢');
      this.audio.register();
      const zh = perfect ? '找零一分不差，谢谢老板！' : '谢谢，下次再来！';
      setTimeout(() => this.audio.speak(zh), 300);
      this.showToast('🛎️', `${zh} +${cu.due + tip} 🪙${tip ? ` (tip ${tip})` : ''}, +${xp} XP.`);
      this.stall.customer = null;
      this.stall.nextAt = now() + this.stallGapMs();
      this.stallStep = 'pick';
      this.addXP(xp);
      this.markDirty();
      this.renderStall();
      this.renderDock();
    }
  }

  renderStall() {
    const box = this.$('stall-body');
    if (!box) return;
    const cu = this.stall.customer;
    if (!cu) {
      box.innerHTML = `<div class="truck-away">🛎️<p>Chưa có khách ở quầy. Khách tiếp theo khoảng <b>${fmtSec((this.stall.nextAt - now()) / 1000)}</b> nữa.</p><small>Nâng cấp <span class="zh">招牌</span> để khách ghé thường xuyên hơn.</small></div>`;
      return;
    }
    const ph = this.orderPhrase(cu);
    const head = `<div class="stall-cust"><img src="${ASSET(cu.profile.img)}" alt="">
      <div class="sc-say"><div class="sc-name"><b class="zh">${cu.profile.nameChn}</b> ${escapeHtml(cu.profile.nameVi)} <button type="button" class="oc-say" data-say-chn="${escapeHtml(ph.zh)}"><i class="fa-solid fa-volume-high"></i></button>
        <small>chờ thêm ${fmtSec((cu.leaveAt - now()) / 1000)}</small></div>
        <div class="oc-line zh">${ph.zhHtml}</div>${this.showPinyin ? `<div class="oc-pin">${escapeHtml(ph.pin)}</div>` : ''}${this.showVietnamese ? `<div class="oc-vi">${escapeHtml(ph.vi)}</div>` : ''}</div></div>`;
    if (this.stallStep !== 'pay') {
      const pool = this.availableItems().filter(it => this.stockOf(it.id) > 0 || cu.items.some(x => x[0] === it.id));
      box.innerHTML = `${head}
        <div class="stall-pick">${pool.map(it => {
          const need = cu.items.find(x => x[0] === it.id);
          return `<button type="button" class="barn-item ${need && this.stallQty(it.id) >= need[1] ? 'done' : ''}" data-spick="${it.id}">
            <span class="bi-ico">${it.icon}</span><b class="zh">${it.chn}</b><small>${escapeHtml(it.pin)}</small><span class="bi-count">Kho: ${this.stockOf(it.id)}</span></button>`;
        }).join('')}</div>
        <div class="stall-basket">🧺 ${cu.basket.length ? cu.basket.map(([id, q]) => `<button type="button" class="sb-chip" data-sremove="${id}" title="Trả lại kho">${itemOf(id).icon}<span class="zh">${itemOf(id).chn}</span>×${q} <i class="fa-solid fa-minus"></i></button>`).join('') : '<span class="farm-note">Chạm món trong kho để bỏ vào giỏ (đúng món, đúng số lượng).</span>'}</div>
        <div class="bld-actions"><button type="button" class="g-btn-ghost danger" data-sact="sorry">🙇 <span class="zh">不好意思</span> Không đủ hàng</button></div>`;
      return;
    }
    const sum = cu.tray.reduce((s, v) => s + cents(v), 0) / 100;
    const note = (v) => (v >= 1 ? `<span class="rmb note ${({ 100: 'n100', 50: 'n50', 20: 'n20', 10: 'n10', 5: 'n5', 1: 'n1' })[v] || 'n1'}"><b>${v}</b><span class="zh">元</span></span>` : `<span class="rmb coin ${v === 0.5 ? 'c5' : 'c1'}"><b>${v === 0.5 ? 5 : 1}</b><span class="zh">角</span></span>`);
    const notes = [];
    let left = cents(cu.paid);
    [10000, 5000, 2000, 1000, 500, 100].forEach(d => { while (left >= d) { notes.push(d / 100); left -= d; } });
    box.innerHTML = `${head}
      <div class="stall-pay">
        <div class="paid-card">
          <div class="paid-row"><span><span class="zh">一共</span> Tổng tiền</span><strong>${cu.due} 元</strong></div>
          <div class="paid-row"><span><span class="zh">顾客付</span> Khách đưa</span><strong class="paid">${cu.paid} 元</strong></div>
          <div class="paid-row need"><span><span class="zh">找零</span> Cần thối</span><strong>? 元</strong></div>
          <div class="paid-bills small">${notes.map(note).join('')}</div>
        </div>
        <div class="stall-drawer">
          <div class="drawer-head"><i class="fa-solid fa-cash-register"></i> <span class="zh">钱箱</span> Chạm để lấy tiền thối</div>
          <div class="drawer-grid">${[20, 10, 5, 1].map(v => `<button type="button" class="rmb note n${v}" data-money="${v}"><b>${v}</b><span class="zh">元</span></button>`).join('')}</div>
          <div class="tray-tokens">${cu.tray.length ? cu.tray.map((v, i) => `<button type="button" class="token n${v}" data-tray="${i}">${v}<span class="zh">元</span></button>`).join('') : '<div class="tray-empty">Khay tiền thối trống</div>'}</div>
          <div class="tray-sum">Đã lấy: ${sum} 元</div>
          <div class="bld-actions">
            <button type="button" class="g-btn-ghost" data-sact="back">↩ Sửa giỏ</button>
            <button type="button" class="g-btn-ghost" data-sact="reset">Xếp lại</button>
            <button type="button" class="g-btn-primary" data-sact="pay"><span class="zh">找零</span> Thối tiền &amp; giao</button>
          </div>
        </div>
      </div>`;
  }

  // --------------------------------------------------------------------------
  // Kho lúa & nhà kho
  // --------------------------------------------------------------------------
  storageNeed(where) {
    const lv = where === 'silo' ? this.siloLv : this.barnLv;
    const mats = where === 'silo' ? { nail: lv + 1, paint: lv + 1 } : { plank: lv + 1, nail: lv + 1 };
    return { mats, coins: 20 * (lv + 1) };
  }

  openStorage(tab = null) {
    if (tab) this.storageTab = tab;
    this.audio.pop();
    this.learn(this.storageTab === 'silo' ? '粮仓' : '仓库');
    this.renderStorage();
    this.openModal('modal-storage');
  }

  renderStorage() {
    const tabs = this.$('storage-tabs');
    if (tabs) tabs.innerHTML = [['silo', `🌾 <span class="zh">粮仓</span> Kho lúa ${this.usedOf('silo')}/${this.siloCap()}`], ['barn', `🏚️ <span class="zh">仓库</span> Nhà kho ${this.usedOf('barn')}/${this.barnCap()}`]]
      .map(([id, label]) => `<button type="button" class="vocab-tab ${this.storageTab === id ? 'active' : ''}" data-stab="${id}">${label}</button>`).join('');
    const body = this.$('storage-body');
    if (!body) return;
    const where = this.storageTab;
    const list = ITEMS.filter(it => (where === 'silo') === (it.kind === 'crop') && this.stockOf(it.id) > 0);
    const cap = where === 'silo' ? this.siloCap() : this.barnCap();
    const used = this.usedOf(where);
    const need = this.storageNeed(where);
    const okMats = Object.entries(need.mats).every(([k, v]) => this.stockOf(k) >= v);
    body.innerHTML = `
      <div class="cap-bar ${used >= cap ? 'full' : ''}"><i style="width:${Math.min(100, Math.round((used / cap) * 100))}%"></i></div>
      <div class="storage-grid">${list.length ? list.map(it => `<div class="st-item" title="${escapeHtml(it.vi)}"><span>${it.icon}</span><b class="zh">${it.chn}</b><small>${escapeHtml(it.vi)}</small><em>${this.stockOf(it.id)}</em></div>`).join('') : '<p class="farm-note">Trống.</p>'}</div>
      <div class="store-upgrade">
        <span><b>⬆️ Nâng cấp ${where === 'silo' ? '<span class="zh">粮仓</span>' : '<span class="zh">仓库</span>'}</b> +${CAP_STEP} chỗ · cần
          ${Object.entries(need.mats).map(([k, v]) => `<span class="${this.stockOf(k) >= v ? 'ok' : 'miss'}">${itemOf(k).icon}<span class="zh">${itemOf(k).chn}</span> ${this.stockOf(k)}/${v}</span>`).join(' ')} · 🪙${need.coins}</span>
        <button type="button" class="g-btn-primary" data-upgrade-store="${where}" ${okMats && this.coins >= need.coins ? '' : 'disabled'}>Nâng cấp</button>
      </div>
      <p class="farm-note">Vật liệu <span class="zh">钉子、木板、油漆</span> rơi ngẫu nhiên khi thu hoạch, giao đơn và giao xe tải.</p>`;
  }

  upgradeStorage(where) {
    const need = this.storageNeed(where);
    if (!Object.entries(need.mats).every(([k, v]) => this.stockOf(k) >= v)) { this.audio.error(); this.showToast('🔩', 'Chưa đủ vật liệu nâng cấp.', 'warn'); return; }
    if (!this.spend(need.coins)) return;
    Object.entries(need.mats).forEach(([k, v]) => this.takeItem(k, v));
    if (where === 'silo') this.siloLv += 1; else this.barnLv += 1;
    this.learn('升级');
    this.audio.unlock();
    this.showToast('🏚️', `升级 · ${where === 'silo' ? '粮仓 kho lúa' : '仓库 nhà kho'} chứa được ${where === 'silo' ? this.siloCap() : this.barnCap()} món!`);
    this.markDirty();
    this.renderStorage();
    this.renderDock();
  }

  // --------------------------------------------------------------------------
  // Cửa hàng: công trình, vật nuôi, đất, nâng cấp
  // --------------------------------------------------------------------------
  openShop(zone = null) {
    if (zone) this.shopZone = zone;
    this.audio.pop();
    this.renderShop();
    this.openModal('modal-shop');
  }

  buyBuilding(id) {
    const b = bldOf(id);
    const s = this.blds[id];
    if (!b || s.owned) return;
    if (b.lvl > this.level) { this.audio.error(); this.showToast('🔒', `Cần cấp ${b.lvl} để xây ${b.chn}.`, 'warn'); return; }
    if (!this.spend(b.cost)) return;
    s.owned = true;
    if (b.type === 'animal') { s.n = b.animal.start; s.readyAt = 0; this.learn(b.animal.chn); }
    this.learn(b.chn);
    this.audio.unlock();
    this.showToast(b.icon, `Đã xây ${b.chn} (${b.vi})!${b.animal ? ` Tặng ${b.animal.start} ${b.animal.vi}.` : ''}`);
    this.markDirty();
    this.renderShop();
    this.renderMap(true);
  }

  buyAnimal(id) {
    const b = bldOf(id);
    const s = this.blds[id];
    if (!b || !b.animal || !s.owned) return;
    if (s.n >= b.animal.max) { this.audio.error(); this.showToast(b.icon, `${b.chn} đã đủ ${b.animal.max} con.`, 'warn'); return; }
    if (this.animalPhase(b, s) === 'busy') { this.audio.error(); this.showToast(b.icon, `Chờ ${b.animal.vi} xong lượt này rồi hãy mua thêm.`, 'warn'); return; }
    if (!this.spend(b.animal.cost)) return;
    s.n += 1;
    this.learn(b.animal.chn);
    this.audio.unlock();
    this.showToast(b.animal.icon, `Mua thêm 1 ${b.animal.vi}! ${b.chn} có ${s.n} con.`);
    this.markDirty();
    this.renderShop();
    this.renderMap(true);
  }

  buyPlot() {
    const k = this.plotsOwned;
    if (k >= PLOT_CELLS.length) return;
    if (plotLevel(k) > this.level) { this.audio.error(); this.showToast('🔒', `Cần cấp ${plotLevel(k)} để mua thêm ô ruộng.`, 'warn'); return; }
    if (!this.spend(plotCost(k))) return;
    this.plotsOwned += 1;
    this.learn('田地');
    this.audio.unlock();
    this.showToast('🟫', `Đã mua thêm 1 ô ruộng (có ${this.plotsOwned} ô).`);
    this.markDirty();
    this.renderShop();
    this.renderMap(true);
  }

  buySlot(id) {
    const b = bldOf(id);
    const s = this.blds[id];
    if (!b || !s.owned || s.slots >= 6) return;
    if (!this.spend(40 * s.slots)) return;
    s.slots += 1;
    this.audio.unlock();
    this.showToast(b.icon, `${b.chn} có ${s.slots} ô hàng chờ.`);
    this.markDirty();
    this.renderShop();
  }

  buyUpgrade(id) {
    const u = UPGRADES.find(x => x.id === id);
    const lv = this.upgrades[id] || 0;
    if (!u || lv >= u.costs.length || !this.spend(u.costs[lv])) return;
    this.upgrades[id] = lv + 1;
    this.learn(u.chn);
    this.learn('升级');
    this.audio.unlock();
    this.showToast(u.icon, `升级 · ${u.chn} (${u.vi}) lên cấp ${lv + 1}!`);
    this.markDirty();
    this.renderShop();
    this.renderHUDWeather();
  }

  renderShop() {
    const zonesBox = this.$('market-zones');
    const head = this.$('market-zone-head');
    const grid = this.$('market-grid');
    if (!grid) return;
    const lvNow = UPGRADES.reduce((t, u) => t + (this.upgrades[u.id] || 0), 0);
    const zones = [
      { id: 'buildings', icon: '🏭', chn: '建筑', sub: 'Chuồng trại & xưởng', state: `${BUILDINGS.filter(b => this.blds[b.id].owned).length}/${BUILDINGS.length}` },
      { id: 'land', icon: '🟫', chn: '土地', sub: 'Mở rộng ruộng', state: `${this.plotsOwned}/${PLOT_CELLS.length}` },
      { id: 'upgrades', icon: '⬆️', chn: '升级', sub: 'Nâng cấp', state: `${lvNow}/${UPGRADES.length * 3} cấp` }
    ];
    if (zonesBox) zonesBox.innerHTML = zones.map(z => `<button type="button" class="mz ${z.id === this.shopZone ? 'active' : ''}" data-mz="${z.id}"><span class="mz-icon">${z.icon}</span><span class="mz-txt"><b class="zh">${z.chn}</b><small>${z.sub}</small></span><span class="mz-state">${z.state}</span></button>`).join('');
    const card = (o) => `<div class="mk-card ${o.owned ? 'owned' : 'locked'}"><span class="mk-emoji farm-emoji">${o.icon}</span><b class="zh mk-name">${o.chn}</b><span class="mk-pin">${escapeHtml(o.pin || '')}</span><span class="mk-vi">${escapeHtml(o.vi)}</span>${o.lv ? `<span class="mk-lv">${o.lv}</span>` : ''}<span class="mk-price">${o.info}</span>${o.btn}</div>`;
    const btn = (key, label, ok) => `<button type="button" class="mk-unlock" data-buy="${key}" ${ok ? '' : 'disabled'}>${label}</button>`;
    if (this.shopZone === 'buildings') {
      if (head) head.innerHTML = '<span class="mzh-icon">🏭</span><div><b class="zh">建筑</b> <span class="mzh-pin">jiànzhù</span><small>Xây chuồng trại & xưởng (mở theo cấp độ), mua thêm vật nuôi & ô hàng chờ</small></div>';
      grid.innerHTML = BUILDINGS.map(b => {
        const s = this.blds[b.id];
        const info = b.type === 'animal' ? `${itemOf(b.food).chn} → ${itemOf(b.product).chn} · ${fmtSec(b.time)} · ${s.owned ? `${s.n}/${b.animal.max} con` : `tặng ${b.animal.start} con`}`
          : b.recipes.map(r => itemOf(r.out).chn).join('、') + (s.owned ? ` · ${s.slots} ô chờ` : '');
        let action;
        if (!s.owned) action = b.lvl > this.level ? `<span class="mk-owned lock">🔒 Cấp ${b.lvl}</span>` : btn(`build:${b.id}`, `<i class="fa-solid fa-hammer"></i> Xây · 🪙${b.cost}`, this.coins >= b.cost);
        else if (b.type === 'animal' && s.n < b.animal.max) action = btn(`animal:${b.id}`, `➕ ${escapeHtml(b.animal.vi)} · 🪙${b.animal.cost}`, this.coins >= b.animal.cost);
        else if (b.type === 'factory' && s.slots < 6) action = btn(`slot:${b.id}`, `➕ Ô chờ · 🪙${40 * s.slots}`, this.coins >= 40 * s.slots);
        else action = '<span class="mk-owned"><i class="fa-solid fa-check"></i> Đã đủ</span>';
        return card({ owned: s.owned, icon: b.icon, chn: b.chn, pin: b.pin, vi: b.vi, info, btn: action });
      }).join('');
    } else if (this.shopZone === 'land') {
      if (head) head.innerHTML = '<span class="mzh-icon">🟫</span><div><b class="zh">土地</b> <span class="mzh-pin">tǔdì</span><small>Mua thêm ô ruộng để trồng được nhiều hơn</small></div>';
      const k = this.plotsOwned;
      grid.innerHTML = k >= PLOT_CELLS.length ? '<p class="farm-note">Đã mở hết ô ruộng!</p>'
        : card({ owned: false, icon: '🟫', chn: '田地', pin: 'tiándì', vi: `ô ruộng thứ ${k + 1}`, info: `Đang có ${k} ô`, btn: plotLevel(k) > this.level ? `<span class="mk-owned lock">🔒 Cấp ${plotLevel(k)}</span>` : btn('plot:1', `➕ Mua · 🪙${plotCost(k)}`, this.coins >= plotCost(k)) });
    } else {
      if (head) head.innerHTML = '<span class="mzh-icon">⬆️</span><div><b class="zh">升级</b> <span class="mzh-pin">shēngjí</span><small>Máy tưới, biển hiệu, ghế ngồi cho khách</small></div>';
      grid.innerHTML = UPGRADES.map(u => {
        const lv = this.upgrades[u.id] || 0;
        const max = lv >= u.costs.length;
        return card({ owned: lv > 0, icon: u.icon, chn: u.chn, pin: u.pin, vi: u.vi, lv: `${'★'.repeat(lv)}${'☆'.repeat(u.costs.length - lv)} · Cấp ${lv}/${u.costs.length}`, info: escapeHtml(u.desc),
          btn: max ? '<span class="mk-owned"><i class="fa-solid fa-check"></i> Tối đa</span>' : btn(`upgrade:${u.id}`, `<i class="fa-solid fa-arrow-up"></i> Cấp ${lv + 1} · 🪙${u.costs[lv]}`, this.coins >= u.costs[lv]) });
      }).join('');
    }
    this.setText('shop-coins', `🪙 ${this.coins}`);
    this.setText('shop-level', `⭐ ${this.level}`);
  }

  // --------------------------------------------------------------------------
  // Từ vựng
  // --------------------------------------------------------------------------
  openVocabModal() { this.renderVocabTabs('crops'); this.openModal('modal-vocab'); }
  renderVocabTabs(active) {
    const box = this.$('vocab-tabs');
    if (box) {
      box.innerHTML = VOCAB_TABS.map(t => `<button type="button" class="vocab-tab ${t.id === active ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`).join('');
      box.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => this.renderVocabTabs(btn.dataset.tab)));
    }
    const grid = this.$('vocab-items-grid');
    if (!grid) return;
    const tab = VOCAB_TABS.find(t => t.id === active) || VOCAB_TABS[0];
    grid.innerHTML = tab.words.map(v => `
      <div class="vc ${this.learnedVocab.has(v.chn) ? 'learned' : ''}"><span class="zh">${v.chn}</span><div class="pin">${escapeHtml(v.pin)}</div><div class="vi">${escapeHtml(v.vi)}</div>
        <button type="button" data-say-chn="${escapeHtml(v.chn)}" title="Nghe phát âm"><i class="fa-solid fa-volume-high"></i></button></div>`).join('');
  }
  learnedCount() { let n = 0; VOCAB_TABS.forEach(t => t.words.forEach(v => { if (this.learnedVocab.has(v.chn)) n += 1; })); return n; }

  showLevelInfo() {
    const next = xpFor(this.level + 1);
    const list = this.unlocksAt(this.level + 1);
    this.audio.pop();
    this.showToast('⭐', `Cấp ${this.level}: ${this.xp}/${next} XP. Cấp ${this.level + 1} mở: ${list.length ? list.map(x => x.replace(/<[^>]+>/g, '')).join(', ') : 'thêm phần thưởng'}.`);
  }

  // --------------------------------------------------------------------------
  // VẼ
  // --------------------------------------------------------------------------
  renderAll() {
    this.updateHUD();
    this.renderHUDWeather();
    this.renderMap(true);
    this.renderDock();
    if (this.seedTrayOpen) this.renderSeedTray();
  }

  updateHUD() {
    const cur = xpFor(this.level);
    const next = xpFor(this.level + 1);
    this.setText('hud-level', String(this.level));
    this.setText('hud-xp-text', `${this.xp - cur}/${next - cur} XP`);
    const fill = this.$('hud-xp-fill');
    if (fill) fill.style.width = `${Math.round(Math.min(1, (this.xp - cur) / Math.max(1, next - cur)) * 100)}%`;
    this.setText('hud-coins', String(this.coins));
    this.setText('hud-gems', String(this.gems));
    this.setText('hud-vocab-val', `${this.learnedCount()}/${VOCAB_TOTAL}`);
  }

  renderHUDWeather() {
    const el = this.$('hud-weather');
    if (!el) return;
    const ev = this.todayEvent();
    const rate = this.growRate();
    el.innerHTML = `${ev.icon} <span class="zh">${ev.chn}</span> <small>${ev.kind === 'holiday' ? 'Đơn +20%' : `Cây ×${rate.toFixed(2).replace(/\.?0+$/, '')}`}</small>`;
  }

  renderDock() {
    const t = now();
    const fillable = this.orders.filter(o => o.waitUntil == null && this.canFill(o)).length;
    const setBadge = (id, txt) => { const b = this.$(id); if (!b) return; b.hidden = !txt; b.textContent = txt || ''; };
    setBadge('badge-orders', fillable ? `${fillable}✓` : '');
    setBadge('badge-truck', this.truck && this.truck.waitUntil == null && this.canFill(this.truck) ? '✓' : '');
    setBadge('badge-stall', this.stall.customer ? '1' : '');
    const anyReady = this.plots.some((p, i) => i < this.plotsOwned && this.plotReady(p, t));
    const hb = this.$('btn-harvest-all');
    if (hb) hb.hidden = !anyReady;
    this.setText('dock-storage', `${this.usedOf('silo')}/${this.siloCap()} · ${this.usedOf('barn')}/${this.barnCap()}`);
  }

  renderSeedTray() {
    const box = this.$('seed-list');
    if (!box) return;
    box.innerHTML = CROPS.map(c => {
      const locked = c.lvl > this.level;
      const n = this.stockOf(c.id);
      return `<div class="seed-opt ${locked ? 'locked' : ''} ${c.id === this.selectedSeed && !locked ? 'on' : ''}">
        <button type="button" class="seed-pick" data-seed="${c.id}" ${locked ? 'disabled' : ''} title="${escapeHtml(c.vi)}">
          <span class="so-ico">${locked ? '🔒' : c.icon}</span><b class="zh">${c.chn}</b>
          <small>${locked ? `Cấp ${c.lvl}` : `${n} hạt · ${fmtSec(c.grow / this.growRate())}`}</small>
        </button>
        ${!locked && n === 0 ? `<button type="button" class="seed-buy" data-buyseed="${c.id}" title="Mua 1 hạt">🪙${c.price}</button>` : ''}
      </div>`;
    }).join('');
  }

  // Bản đồ: vẽ lại khi trạng thái đổi (chín / xong / mua mới), còn lại chỉ cập nhật thanh tiến độ
  mapSignature() {
    const t = now();
    return [
      this.plotsOwned,
      this.plots.map(p => (p.crop ? `${p.crop}${this.plotReady(p, t) ? 'R' : Math.floor(this.plotProgress(p, t) * 3)}` : '-')).join(''),
      BUILDINGS.map(b => { const s = this.blds[b.id]; return b.type === 'animal' ? `${s.owned}${s.n}${this.animalPhase(b, s, t)}` : `${s.owned}${s.queue.length}${s.queue.filter(j => t >= j.readyAt).length}`; }).join('|'),
      this.stall.customer ? 1 : 0,
      this.truck && this.truck.waitUntil == null ? (this.canFill(this.truck) ? 'T' : 't') : '-',
      this.orders.filter(o => o.waitUntil == null && this.canFill(o)).length,
      this.level
    ].join('#');
  }

  renderMap(force = false) {
    const box = this.$('farm-map');
    if (!box) return;
    const sig = this.mapSignature();
    if (!force && sig === this.mapSig) { this.updateMapBars(); return; }
    this.mapSig = sig;
    const t = now();
    const tiles = [];
    const objects = [];
    const plotIndex = new Map(PLOT_CELLS.map(([x, y], i) => [`${x},${y}`, i]));
    for (let gy = 0; gy < GRID_N; gy++) {
      for (let gx = 0; gx < GRID_N; gx++) {
        const key = `${gx},${gy}`;
        const water = WATER_CELLS.has(key);
        const path = PATH_CELLS.has(key);
        tiles.push(`<polygon points="${diamond(gx, gy)}" fill="${water ? '#5dade2' : path ? '#e2c48f' : ((gx + gy) % 2 ? '#8fd16a' : '#9bd877')}" stroke="${water ? '#4a9bd0' : path ? '#cfae74' : '#7fc25c'}" stroke-width="1"/>`);
        const i = plotIndex.get(key);
        if (i == null) continue;
        const c = iso(gx, gy);
        if (i >= this.plotsOwned) {
          if (i === this.plotsOwned) tiles.push(`<g class="plot-lock" data-plot="${i}"><polygon points="${diamond(gx, gy, 0.86)}" fill="rgba(255,255,255,0.3)" stroke="#6e4426" stroke-width="2" stroke-dasharray="5 4"/><text x="${c.x}" y="${c.y + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#5a3216">＋🪙${plotCost(i)}</text></g>`);
          continue;
        }
        const p = this.plots[i];
        const ready = this.plotReady(p, t);
        tiles.push(`<g class="plot ${ready ? 'is-ready' : ''} ${p.crop ? '' : 'is-empty'}" data-plot="${i}"><polygon points="${diamond(gx, gy, 0.88)}" fill="${p.crop ? '#7a4a28' : '#8d5a34'}" stroke="#5e3a1d" stroke-width="2"/>
          <path d="M${c.x - 22},${c.y - 3} L${c.x + 5},${c.y - 15} M${c.x - 15},${c.y + 5} L${c.x + 19},${c.y - 10} M${c.x - 5},${c.y + 12} L${c.x + 24},${c.y - 2}" stroke="#5e3a1d" stroke-width="2" opacity="0.5"/></g>`);
        if (p.crop) objects.push({ key: gx + gy + 0.1, svg: this.cropSvg(p, i, c, t) });
      }
    }
    BUILDINGS.forEach(b => {
      const s = this.blds[b.id];
      const front = b.origin[0] + b.size[0] - 1 + b.origin[1] + b.size[1] - 1;
      objects.push({ key: front + 0.2, svg: `<g class="bld ${s.owned ? '' : 'lot'}" data-bld="${b.id}">${s.owned ? boxSvg({ ...b, roofH: 30 }, 42) + this.bldBubble(b, s, t) : this.lotSvg(b)}</g>` });
      if (s.owned && b.type === 'animal') objects.push({ key: front + 0.6, svg: this.animalsSvg(b, s, t) });
    });
    FIXTURES.forEach(f => {
      const front = f.origin[0] + f.size[0] - 1 + f.origin[1] + f.size[1] - 1;
      objects.push({ key: front + 0.3, svg: `<g class="fix" data-fix="${f.id}">${this.fixtureSvg(f)}</g>` });
    });
    DECOR.forEach(d => { const c = iso(d.cell[0], d.cell[1]); objects.push({ key: d.cell[0] + d.cell[1], svg: `<text x="${c.x}" y="${c.y + 5}" text-anchor="middle" font-size="${d.size}">${d.icon}</text>` }); });
    objects.sort((a, b) => a.key - b.key);
    box.innerHTML = `<svg viewBox="-450 -125 900 560" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Nông trại">
      <defs><filter id="fsh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-opacity="0.25"/></filter></defs>
      <g class="ground">${tiles.join('')}</g><g class="objects" filter="url(#fsh)">${objects.map(o => o.svg).join('')}</g></svg>`;
    if (this.isPortrait && !this.mapCentered && box.scrollWidth > box.clientWidth) { box.scrollLeft = (box.scrollWidth - box.clientWidth) / 2; this.mapCentered = true; }
  }

  cropSvg(p, i, c, t) {
    const crop = itemOf(p.crop);
    const prog = this.plotProgress(p, t);
    let inner;
    if (this.plotReady(p, t)) inner = `<text class="crop-ripe" x="${c.x}" y="${c.y - 5}" text-anchor="middle" font-size="28">${crop.icon}</text><text x="${c.x + 16}" y="${c.y - 20}" font-size="12">✨</text>`;
    else if (prog < 0.34) inner = `<text x="${c.x}" y="${c.y - 1}" text-anchor="middle" font-size="15">🌱</text>`;
    else if (prog < 0.67) inner = `<text x="${c.x}" y="${c.y - 2}" text-anchor="middle" font-size="17" opacity="0.8">${crop.icon}</text>`;
    else inner = `<text x="${c.x}" y="${c.y - 3}" text-anchor="middle" font-size="22">${crop.icon}</text>`;
    const bar = this.plotReady(p, t) ? '' : `<rect x="${c.x - 18}" y="${c.y + 8}" width="36" height="5" rx="2.5" fill="rgba(0,0,0,0.35)"/><rect data-pbar="${i}" x="${c.x - 18}" y="${c.y + 8}" width="${(36 * prog).toFixed(1)}" height="5" rx="2.5" fill="#ffd54a"/>`;
    return `<g class="crop" data-plot="${i}">${inner}${bar}</g>`;
  }

  lotSvg(b) {
    const [ox, oy] = b.origin;
    const [sx, sy] = b.size;
    const A = iso(ox - 0.5, oy - 0.5), B = iso(ox + sx - 0.5, oy - 0.5), C = iso(ox + sx - 0.5, oy + sy - 0.5), D = iso(ox - 0.5, oy + sy - 0.5);
    const c = footCenter(b);
    const locked = b.lvl > this.level;
    return `<polygon points="${pts([A, B, C, D])}" fill="#d8b98a" stroke="#b28a55" stroke-width="2" stroke-dasharray="7 5"/>
      <g class="lot-sign"><rect x="${c.x - 48}" y="${c.y - 36}" width="96" height="40" rx="9" fill="#fff8ea" stroke="#b07240" stroke-width="2"/>
      <text x="${c.x}" y="${c.y - 20}" text-anchor="middle" font-size="13" fill="#5a3216">${b.icon} ${b.chn}</text>
      <text x="${c.x}" y="${c.y - 5}" text-anchor="middle" font-size="11" font-weight="800" fill="${locked ? '#9a3412' : '#047857'}">${locked ? `🔒 Cấp ${b.lvl}` : `🪙${b.cost} · Xây`}</text></g>`;
  }

  bldBubble(b, s, t) {
    const c = footCenter(b);
    const x = c.x;
    const y = c.y - 100;
    let content;
    if (b.type === 'animal') {
      const ph = this.animalPhase(b, s, t);
      if (ph === 'ready') content = `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="17" class="bubble-pop">${itemOf(b.product).icon}×${s.n}</text>`;
      else if (ph === 'busy') content = `<text x="${x - 14}" y="${y + 5}" text-anchor="middle" font-size="13">⏳</text><rect x="${x - 4}" y="${y - 3}" width="26" height="6" rx="3" fill="rgba(0,0,0,0.25)"/><rect data-bbar="${b.id}" x="${x - 4}" y="${y - 3}" width="${(26 * Math.min(1, 1 - (s.readyAt - t) / (b.time * 1000))).toFixed(1)}" height="6" rx="3" fill="#22c55e"/>`;
      else content = `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="13">🍽️${itemOf(b.food).icon}</text>`;
    } else {
      const done = s.queue.filter(j => t >= j.readyAt);
      const run = s.queue.find(j => t < j.readyAt);
      if (done.length) content = `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="17" class="bubble-pop">${itemOf(done[0].out).icon}✓</text>`;
      else if (run) content = `<text x="${x - 14}" y="${y + 5}" text-anchor="middle" font-size="13">⚙️</text><rect x="${x - 4}" y="${y - 3}" width="26" height="6" rx="3" fill="rgba(0,0,0,0.25)"/><rect data-fbar="${b.id}" x="${x - 4}" y="${y - 3}" width="0" height="6" rx="3" fill="#f59e0b"/>`;
      else content = `<text x="${x}" y="${y + 5}" text-anchor="middle" font-size="13">💤</text>`;
    }
    return `<g class="bld-bubble"><rect x="${x - 26}" y="${y - 14}" width="52" height="26" rx="13" fill="#fffdf7" stroke="#b07240" stroke-width="2"/>${content}</g>`;
  }

  animalsSvg(b, s, t) {
    const [ox, oy] = b.origin;
    const D = iso(ox - 0.5, oy + b.size[1] - 0.5);
    const C = iso(ox + b.size[0] - 0.5, oy + b.size[1] - 0.5);
    const hungry = this.animalPhase(b, s, t) === 'hungry';
    let out = '';
    for (let k = 0; k < s.n; k++) {
      const f = (k + 1) / (s.n + 1);
      out += `<text class="animal ${hungry ? 'hungry' : ''}" x="${(D.x + (C.x - D.x) * f + 8).toFixed(1)}" y="${(D.y + (C.y - D.y) * f + 16).toFixed(1)}" text-anchor="middle" font-size="${b.id === 'coop' ? 16 : 22}" style="animation-delay:${(k * 0.37).toFixed(2)}s">${b.animal.icon}</text>`;
    }
    return `<g data-bld="${b.id}">${out}</g>`;
  }

  fixtureSvg(f) {
    const c = footCenter(f);
    const t = now();
    if (f.id === 'barn' || f.id === 'silo') {
      const used = this.usedOf(f.id);
      const cap = f.id === 'silo' ? this.siloCap() : this.barnCap();
      const y = c.y - f.h - 50;
      return `${boxSvg({ ...f, roofH: f.id === 'silo' ? 22 : 36 }, f.h)}
        <g class="bld-bubble"><rect x="${c.x - 30}" y="${y - 12}" width="60" height="22" rx="11" fill="${used >= cap ? '#fee2e2' : '#fffdf7'}" stroke="#b07240" stroke-width="2"/><text x="${c.x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="800" fill="#5a3216">${used}/${cap}</text></g>`;
    }
    if (f.id === 'board') {
      const n = this.orders.filter(o => o.waitUntil == null && this.canFill(o)).length;
      return `<rect x="${c.x - 4}" y="${c.y - 34}" width="8" height="36" fill="#7d4a24"/><rect x="${c.x - 30}" y="${c.y - 62}" width="60" height="38" rx="5" fill="#c58a4f" stroke="#7d4a24" stroke-width="3"/>
        <text x="${c.x}" y="${c.y - 38}" text-anchor="middle" font-size="18">🧾</text>
        ${n ? `<g class="bubble-pop"><circle cx="${c.x + 28}" cy="${c.y - 62}" r="10" fill="#16a34a"/><text x="${c.x + 28}" y="${c.y - 58}" text-anchor="middle" font-size="11" font-weight="900" fill="#fff">${n}</text></g>` : ''}`;
    }
    if (f.id === 'stall') {
      const cu = this.stall.customer;
      return `<rect x="${c.x - 26}" y="${c.y - 30}" width="52" height="26" rx="4" fill="#d9a46c" stroke="#7d4a24" stroke-width="2"/><path d="M${c.x - 32},${c.y - 30} L${c.x + 32},${c.y - 30} L${c.x + 26},${c.y - 46} L${c.x - 26},${c.y - 46} Z" fill="#4caf50" stroke="#2e7d32" stroke-width="2"/>
        <text x="${c.x}" y="${c.y - 12}" text-anchor="middle" font-size="13">🥕🥚</text>
        ${cu ? `<g class="bubble-pop"><text x="${c.x + 24}" y="${c.y - 50}" text-anchor="middle" font-size="22">🙋</text></g>` : ''}`;
    }
    const away = !this.truck || this.truck.waitUntil != null;
    const ok = !away && this.canFill(this.truck);
    return `<text x="${c.x}" y="${c.y + 6}" text-anchor="middle" font-size="44" opacity="${away ? 0.35 : 1}">🚚</text>
      ${ok ? `<g class="bubble-pop"><circle cx="${c.x + 26}" cy="${c.y - 34}" r="10" fill="#16a34a"/><text x="${c.x + 26}" y="${c.y - 30}" text-anchor="middle" font-size="11" font-weight="900" fill="#fff">✓</text></g>` : ''}
      ${away && this.truck ? `<text x="${c.x}" y="${c.y - 30}" text-anchor="middle" font-size="11" font-weight="800" fill="#5a3216">${fmtSec((this.truck.waitUntil - t) / 1000)}</text>` : ''}`;
  }

  updateMapBars() {
    const t = now();
    document.querySelectorAll('[data-pbar]').forEach(el => { const p = this.plots[+el.dataset.pbar]; if (p && p.crop) el.setAttribute('width', (36 * this.plotProgress(p, t)).toFixed(1)); });
    document.querySelectorAll('[data-bbar]').forEach(el => { const b = bldOf(el.dataset.bbar); const s = this.blds[b.id]; el.setAttribute('width', (26 * Math.max(0, Math.min(1, 1 - (s.readyAt - t) / (b.time * 1000)))).toFixed(1)); });
    document.querySelectorAll('[data-fbar]').forEach(el => {
      const b = bldOf(el.dataset.fbar);
      const j = this.blds[b.id].queue.find(x => t < x.readyAt);
      if (!j) return;
      const r = b.recipes.find(x => x.out === j.out);
      el.setAttribute('width', (26 * Math.max(0, Math.min(1, 1 - (j.readyAt - t) / (r.time * 1000)))).toFixed(1));
    });
  }

  // --------------------------------------------------------------------------
  // Tài khoản & bảng xếp hạng (xếp theo cấp độ & XP)
  // --------------------------------------------------------------------------
  async initCloud() {
    let data;
    try {
      data = await GameCloud.getProgress();
    } catch (e) {
      this.cloud.checked = true;
      this.cloud.offline = true;
      const lu = GameCloud.localUser();
      if (lu) this.cloud.name = lu.name || lu.email;
      this.renderAccountChip();
      return;
    }
    this.cloud.checked = true;
    if (!data || !data.loggedIn) { this.switchOwner('guest'); this.renderAccountChip(); return; }
    const lu = GameCloud.localUser();
    this.cloud.loggedIn = true;
    this.cloud.name = (data.user && data.user.name) || (lu && lu.name) || 'Bạn';
    this.cloud.picture = (data.user && data.user.picture) || (lu && lu.picture) || '';
    this.cloud.best = data.best || null;
    this.cloud.history = Array.isArray(data.history) ? data.history : [];
    const email = lu && lu.email ? String(lu.email).toLowerCase().trim() : '';
    this.owner = email || 'account';
    const server = data.save && data.save.v === SAVE_VERSION ? data.save : null;
    const local = email ? LocalSave.read(email) : null;
    const sTime = server ? Number(server.updatedAt) || 0 : -1;
    const lTime = local ? Number(local.updatedAt) || 0 : -1;
    if (server && sTime >= lTime) { this.applySnapshot(server); if (email) LocalSave.write(email, server); }
    else if (local) { this.applySnapshot(local); GameCloud.post({ save: local }).catch(() => {}); }
    else this.newFarm();
    this.renderAll();
    this.renderAccountChip();
  }

  switchOwner(owner) {
    if (this.owner === owner) return;
    this.owner = owner;
    const s = LocalSave.read(owner);
    if (s) this.applySnapshot(s); else this.newFarm();
    this.renderAll();
  }

  renderAccountChip() {
    const chip = this.$('title-account');
    if (!chip) return;
    const c = this.cloud;
    const avatar = this.$('title-account-avatar');
    if (c.loggedIn) {
      chip.classList.remove('guest');
      chip.removeAttribute('href');
      this.setText('title-account-name', c.name);
      this.setText('title-account-status', c.best ? `☁️ Đã lưu · Kỷ lục cấp ${c.best.day}` : '☁️ Nông trại được lưu vào tài khoản');
      if (avatar) avatar.innerHTML = c.picture ? `<img src="${escapeHtml(c.picture)}" alt="" referrerpolicy="no-referrer">` : '<i class="fa-solid fa-user"></i>';
    } else {
      chip.classList.add('guest');
      chip.setAttribute('href', 'index.html');
      this.setText('title-account-name', c.offline && c.name ? c.name : 'Khách');
      this.setText('title-account-status', c.offline ? '⚠️ Mất kết nối · lưu tạm trên máy' : 'Đăng nhập để lưu vào tài khoản');
      if (avatar) avatar.innerHTML = '<i class="fa-solid fa-user"></i>';
    }
  }

  openRankModal(tab = this.rankTab || 'global') { this.openModal('modal-rank'); this.switchRankTab(tab); }
  switchRankTab(tab) {
    this.rankTab = tab === 'mine' ? 'mine' : 'global';
    document.querySelectorAll('.rank-tab').forEach(b => b.classList.toggle('active', b.dataset.rankTab === this.rankTab));
    if (this.rankTab === 'mine') this.renderMyRank(); else this.renderGlobalRank();
  }

  async renderGlobalRank() {
    const list = this.$('rank-list');
    const summary = this.$('rank-summary');
    if (!list || !summary) return;
    this.setText('rank-note', 'Mỗi người 1 dòng · Xếp theo tổng kinh nghiệm (XP) · ghi nhận mỗi lần lên cấp');
    summary.innerHTML = '';
    list.innerHTML = '<div class="rank-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải bảng xếp hạng...</div>';
    const req = (this.rankReq = (this.rankReq || 0) + 1);
    let data;
    try { data = await GameCloud.getLeaderboard(); } catch (e) {
      if (req !== this.rankReq || this.rankTab !== 'global') return;
      list.innerHTML = '<div class="rank-empty">📡 Không kết nối được máy chủ.<br>Kiểm tra mạng rồi thử lại nhé!<br><br><button type="button" class="g-btn-chip" id="btn-rank-retry">🔄 Thử lại</button></div>';
      this.$('btn-rank-retry')?.addEventListener('click', () => this.renderGlobalRank());
      return;
    }
    if (req !== this.rankReq || this.rankTab !== 'global') return;
    const me = data.me;
    summary.innerHTML = `
      <div class="rs-item"><span>👥</span><strong>${data.totalPlayers || 0}</strong><small>Chủ trại</small></div>
      <div class="rs-item"><span>🏅</span><strong>${me ? `#${me.rank}` : '—'}</strong><small>Hạng của bạn</small></div>
      <div class="rs-item"><span>⭐</span><strong>${me ? `Cấp ${me.day}` : `Cấp ${this.level}`}</strong><small>Cấp độ</small></div>
      <div class="rs-item"><span>📈</span><strong>${me ? Math.round(me.earnings) : this.xp}</strong><small>XP</small></div>`;
    const cta = !data.loggedIn ? '<div class="rank-cta"><span>🔐 Bạn đang chơi với tư cách khách — đăng nhập để ghi tên lên bảng!</span><a href="index.html">Đăng nhập</a></div>' : '';
    const top = Array.isArray(data.top) ? data.top : [];
    if (!top.length) { list.innerHTML = cta + '<div class="rank-empty">🌾 Chưa có ai trên bảng xếp hạng.<br>Lên cấp 2 để ghi tên đầu tiên!</div>'; return; }
    const medals = ['🥇', '🥈', '🥉'];
    const row = (r) => `
      <div class="rank-row ${r.rank <= 3 ? 'top' : ''} ${r.isMe ? 'me' : ''}">
        <span class="rr-pos">${medals[r.rank - 1] || r.rank}</span>
        <span class="rr-player">${r.picture ? `<img class="rr-avatar" src="${escapeHtml(r.picture)}" alt="" referrerpolicy="no-referrer" loading="lazy">` : '<span class="rr-avatar"><i class="fa-solid fa-user"></i></span>'}
          <span class="rr-name"><b>${escapeHtml(r.name)}${r.isMe ? '<span class="rr-me">Bạn</span>' : ''}</b><small>${r.achievedAt ? new Date(r.achievedAt).toLocaleDateString('vi-VN') : ''}</small></span></span>
        <span class="rr-earn">⭐ Cấp ${Number(r.day) || 1}</span>
        <span>📈 ${Math.round(r.earnings)} XP</span>
        <span>🧾 ${r.served} đơn</span>
        <span class="rr-stars">${'⭐'.repeat(r.stars || 0)}</span>
      </div>`;
    const meOutside = me && !top.some(r => r.isMe);
    list.innerHTML = cta + top.map(row).join('') + (meOutside ? `<div class="rank-gap">⋮</div>${row(me)}` : '');
  }

  renderMyRank() {
    const list = this.$('rank-list');
    const summary = this.$('rank-summary');
    const src = this.cloud.loggedIn ? this.cloud.history.map(h => ({ ...h, date: new Date(h.playedAt).toLocaleDateString('vi-VN') })) : this.records;
    this.setText('rank-note', this.cloud.loggedIn ? '☁️ Các lần lên cấp đã lưu trong tài khoản' : 'Đang lưu trên máy này · Đăng nhập để lên bảng xếp hạng');
    if (summary) summary.innerHTML = `
      <div class="rs-item"><span>⭐</span><strong>${this.level}</strong><small>Cấp độ</small></div>
      <div class="rs-item"><span>📈</span><strong>${this.xp}</strong><small>Tổng XP</small></div>
      <div class="rs-item"><span>🧾</span><strong>${this.stats.orders}</strong><small>Đơn đã giao</small></div>
      <div class="rs-item"><span>🛎️</span><strong>${this.stats.stall}</strong><small>Khách mua lẻ</small></div>`;
    if (!list) return;
    const recs = [...src].filter(r => r && Number.isFinite(Number(r.day))).sort((a, b) => b.day - a.day);
    list.innerHTML = !recs.length ? '<div class="rank-empty">🌾 Chưa lên cấp lần nào.<br>Thu hoạch & giao đơn để lên cấp 2!</div>'
      : recs.slice(0, 20).map(r => `<div class="rank-row"><span class="rr-pos">⭐${r.day}</span><span class="rr-name"><b>Lên cấp ${r.day}</b><small>${escapeHtml(r.date || '')}</small></span><span class="rr-earn">${Math.round(r.earnings)} XP</span><span>🧾 ${r.served} đơn</span><span></span><span></span></div>`).join('');
  }
}

(function bootFarm() {
  const start = () => { if (!window.farmGame) window.farmGame = new FarmGame(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
