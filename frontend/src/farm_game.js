/**
 * 我的农场 · Nông Trại Của Tôi — bản 2.1 theo tài liệu thiết kế (Prompt_Game_My_Farm_Wo_De_Nongchang)
 *   - Bản đồ 2D nhìn từ trên xuống, chia ô vuông; điều khiển point-and-click, nhân vật tự tìm đường (A*) đi từng ô.
 *   - Không cấp độ / EXP / nhiệm vụ hằng ngày / xưởng chế biến. Tiến trình = 10 MỐC PHÁT TRIỂN mở quyền mua & khu vực.
 *   - Ngày chỉ qua khi lên giường ngủ. Thời tiết 晴 / 阴 / 雨 (mưa tự tưới). Năng lượng 100, ăn món ăn để hồi.
 *   - Khu vực: nông trại chính (nhà, giếng, vườn rau, 4 chuồng, chợ, lối ra sau nhà) · trong nhà · trong chuồng · rừng sau nhà (vườn cây, ao cá).
 *   - NPC ngẫu nhiên ở cổng, hội thoại có lựa chọn; sổ tay từ vựng 10 nhóm có tìm kiếm & phát âm.
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
  step() { this.tone(180, 0.04, { type: 'triangle', vol: 0.05 }); }
  dig() { this.tone(140, 0.14, { type: 'sawtooth', vol: 0.1, slideTo: 90 }); }
  plant() { this.tone(260, 0.12, { type: 'triangle', slideTo: 180, vol: 0.22 }); }
  water() { this.tone(900, 0.18, { type: 'sine', vol: 0.12, slideTo: 300 }); this.tone(700, 0.15, { vol: 0.08, delay: 0.08, slideTo: 250 }); }
  harvest() { this.tone(660, 0.1, { type: 'triangle', vol: 0.2 }); this.tone(990, 0.12, { type: 'triangle', vol: 0.16, delay: 0.07 }); }
  cluck() { this.tone(900, 0.06, { type: 'square', vol: 0.08, slideTo: 600 }); this.tone(900, 0.06, { type: 'square', vol: 0.08, slideTo: 600, delay: 0.1 }); }
  coin() { this.tone(1800, 0.12, { vol: 0.16 }); this.tone(2400, 0.12, { vol: 0.14, delay: 0.03 }); }
  error() { this.tone(160, 0.3, { type: 'sawtooth', vol: 0.2, slideTo: 110 }); }
  door() { this.tone(300, 0.12, { type: 'triangle', vol: 0.15, slideTo: 200 }); }
  splash() { this.tone(500, 0.25, { type: 'sine', vol: 0.15, slideTo: 120 }); }
  unlock() { [659.25, 880, 1174.66].forEach((f, i) => this.tone(f, 0.28, { type: 'triangle', vol: 0.2, delay: i * 0.09 })); }
  fanfare() { [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => this.tone(f, 0.4, { type: 'triangle', vol: 0.22, delay: i * 0.11 })); }
  sleep() { [523.25, 440, 349.23].forEach((f, i) => this.tone(f, 0.5, { type: 'sine', vol: 0.16, delay: i * 0.25 })); }
  speak(text) {
    if (!this.voiceEnabled || !('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 0.85;
      if (!this.voices.length) this.voices = window.speechSynthesis.getVoices();
      const zh = this.voices.find(v => /zh|cmn/i.test(v.lang));
      if (zh) u.voice = zh;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
}

// ============================================================================
// 2. TIỆN ÍCH
// ============================================================================
const SAVE_VERSION = 3;
const STAGE_W = 1280;
const STAGE_H = 720;
const PORTRAIT_W = 480;
const PORTRAIT_MIN_H = 900;
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pickOne = (arr) => (Array.isArray(arr) && arr.length ? arr[randInt(0, arr.length - 1)] : null);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const NUM_CHN = ['零', '一', '两', '三', '四', '五', '六', '七', '八', '九', '十'];
const numChn = (n) => (n <= 10 ? NUM_CHN[n] : String(n));

// Biểu tượng tự vẽ (không có emoji phù hợp)
const ICON_SVG = {
  radish: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 22c12 0 16 10 12 22-3 9-9 16-12 18-3-2-9-9-12-18-4-12 0-22 12-22z" fill="#f7f7f2" stroke="#c9c9bd" stroke-width="2"/><path d="M26 34h8M30 42h6M28 50h5" stroke="#d6d6cc" stroke-width="2" stroke-linecap="round"/><path d="M32 24C28 14 20 10 16 8c6 8 10 12 14 16M32 24c2-10 8-16 14-20-4 8-8 14-12 20M32 24c0-8 0-14 2-20" stroke="#4caf50" stroke-width="5" fill="none" stroke-linecap="round"/></svg>',
  hoe: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M14 54L46 14" stroke="#a0703c" stroke-width="6" stroke-linecap="round"/><path d="M40 8l16 10-6 6-14-8z" fill="#90a4ae" stroke="#546e7a" stroke-width="2"/></svg>',
  can: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="16" y="24" width="28" height="28" rx="6" fill="#4fc3f7" stroke="#0277bd" stroke-width="3"/><path d="M44 32l14-12" stroke="#0277bd" stroke-width="5" stroke-linecap="round"/><circle cx="58" cy="19" r="4" fill="#0277bd"/><path d="M22 24c0-10 16-10 16 0" fill="none" stroke="#0277bd" stroke-width="4"/></svg>',
  sack_y: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M18 18h28l4 36c0 4-36 4-36 0z" fill="#ffe082" stroke="#b28704" stroke-width="3"/><path d="M20 18c4-8 20-8 24 0" fill="#fff3c4" stroke="#b28704" stroke-width="3"/><circle cx="32" cy="38" r="7" fill="#f9a825"/></svg>',
  sack_p: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M18 18h28l4 36c0 4-36 4-36 0z" fill="#f8bbd0" stroke="#ad1457" stroke-width="3"/><path d="M20 18c4-8 20-8 24 0" fill="#fce4ec" stroke="#ad1457" stroke-width="3"/><circle cx="32" cy="38" r="7" fill="#ec407a"/></svg>',
  sack_b: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M18 18h28l4 36c0 4-36 4-36 0z" fill="#b3e5fc" stroke="#0277bd" stroke-width="3"/><path d="M20 18c4-8 20-8 24 0" fill="#e1f5fe" stroke="#0277bd" stroke-width="3"/><path d="M24 38c6-6 12-6 16 0-4 6-10 6-16 0zM40 38l6-4v8z" fill="#29b6f6"/></svg>',
  hay: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="10" y="20" width="44" height="30" rx="6" fill="#e6c25a" stroke="#a07a18" stroke-width="3"/><path d="M14 28h36M14 36h36M14 44h36" stroke="#c9a23a" stroke-width="2"/><path d="M24 20v30M40 20v30" stroke="#8d5a1a" stroke-width="3"/></svg>',
  rice: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M16 16h32l3 38H13z" fill="#fff" stroke="#9e9e9e" stroke-width="3"/><text x="32" y="44" font-size="20" text-anchor="middle" fill="#d32f2f" font-family="sans-serif">米</text></svg>',
  oil: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="22" y="8" width="20" height="8" rx="2" fill="#f57f17"/><path d="M20 18h24l2 36H18z" fill="#ffd54f" stroke="#f57f17" stroke-width="3"/><text x="32" y="44" font-size="16" text-anchor="middle" fill="#bf360c" font-family="sans-serif">油</text></svg>',
  fry: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M10 20h44v30c0 6-44 6-44 0z" fill="#e1f5fe" stroke="#4fc3f7" stroke-width="3" opacity=".9"/><path d="M18 34c4-4 8-4 11 0-3 4-7 4-11 0zM29 34l4-3v6zM34 42c4-4 8-4 11 0-3 4-7 4-11 0zM45 42l4-3v6z" fill="#ff8a65"/></svg>',
  wool: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="24" cy="34" r="12" fill="#fafafa" stroke="#bdbdbd" stroke-width="2"/><circle cx="40" cy="30" r="13" fill="#fff" stroke="#bdbdbd" stroke-width="2"/><circle cx="34" cy="42" r="11" fill="#f5f5f5" stroke="#bdbdbd" stroke-width="2"/></svg>',
  pail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M14 22h36l-4 32H18z" fill="#cfd8dc" stroke="#607d8b" stroke-width="3"/><path d="M14 22c0-14 36-14 36 0" fill="none" stroke="#607d8b" stroke-width="3"/><path d="M18 30h28" stroke="#fff" stroke-width="4"/></svg>',
  rod: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M10 56L50 8" stroke="#8d6e63" stroke-width="4" stroke-linecap="round"/><path d="M50 8c6 10 6 26 2 40" fill="none" stroke="#90a4ae" stroke-width="1.5"/><circle cx="52" cy="50" r="4" fill="#e53935"/><circle cx="18" cy="46" r="5" fill="#455a64"/></svg>'
};
const iconImgCache = {};
const iconSrc = (key) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(ICON_SVG[key])}`;
const iconHtml = (icon, cls = '') => (icon && icon.startsWith('svg:')
  ? `<img class="fi-svg ${cls}" src="${iconSrc(icon.slice(4))}" alt="">`
  : `<span class="fi-emo ${cls}">${icon || ''}</span>`);

// ============================================================================
// 3. DỮ LIỆU GAME
// ============================================================================
// Rau củ: seed = giá hạt (元), sell = giá thu mua 1 cái, days = số ngày được tưới để chín, yield = số thu được, ms = mốc mở
const CROPS = [
  { id: 'baicai', chn: '白菜', pin: 'báicài', vi: 'cải thảo', icon: '🥬', q: '棵', seed: 3, sell: 8, days: 3, yield: 2, ms: 0 },
  { id: 'luobo', chn: '萝卜', pin: 'luóbo', vi: 'củ cải', icon: 'svg:radish', q: '个', seed: 3, sell: 7, days: 3, yield: 2, ms: 0 },
  { id: 'kongxincai', chn: '空心菜', pin: 'kōngxīncài', vi: 'rau muống', icon: '🌿', q: '把', seed: 2, sell: 5, days: 2, yield: 2, ms: 0 },
  { id: 'huluobo', chn: '胡萝卜', pin: 'húluóbo', vi: 'cà rốt', icon: '🥕', q: '根', seed: 4, sell: 10, days: 4, yield: 2, ms: 6 },
  { id: 'xihongshi', chn: '西红柿', pin: 'xīhóngshì', vi: 'cà chua', icon: '🍅', q: '个', seed: 5, sell: 11, days: 4, yield: 3, ms: 6 },
  { id: 'tudou', chn: '土豆', pin: 'tǔdòu', vi: 'khoai tây', icon: '🥔', q: '个', seed: 4, sell: 9, days: 5, yield: 3, ms: 6 },
  { id: 'yumi', chn: '玉米', pin: 'yùmǐ', vi: 'ngô', icon: '🌽', q: '根', seed: 5, sell: 12, days: 5, yield: 2, ms: 6 },
  { id: 'xigua', chn: '西瓜', pin: 'xīguā', vi: 'dưa hấu', icon: '🍉', q: '个', seed: 8, sell: 32, days: 7, yield: 1, ms: 6 }
];
// Cây ăn quả: sap = giá cây giống, grow = số ngày tưới để trưởng thành, regrow = số ngày cho lứa quả kế tiếp
const FRUITS = [
  { id: 'pingguo', chn: '苹果', pin: 'píngguǒ', vi: 'táo', icon: '🍎', q: '个', sap: 40, sell: 10, grow: 5, regrow: 3, yield: 3, ms: 8 },
  { id: 'juzi', chn: '橘子', pin: 'júzi', vi: 'quýt', icon: '🍊', q: '个', sap: 40, sell: 9, grow: 5, regrow: 3, yield: 3, ms: 8 },
  { id: 'taozi', chn: '桃子', pin: 'táozi', vi: 'đào', icon: '🍑', q: '个', sap: 50, sell: 12, grow: 6, regrow: 3, yield: 3, ms: 10 },
  { id: 'li', chn: '梨', pin: 'lí', vi: 'lê', icon: '🍐', q: '个', sap: 50, sell: 12, grow: 6, regrow: 3, yield: 3, ms: 10 },
  { id: 'putao', chn: '葡萄', pin: 'pútao', vi: 'nho', icon: '🍇', q: '串', sap: 60, sell: 15, grow: 6, regrow: 2, yield: 2, ms: 10 },
  { id: 'xiangjiao', chn: '香蕉', pin: 'xiāngjiāo', vi: 'chuối', icon: '🍌', q: '根', sap: 60, sell: 12, grow: 7, regrow: 3, yield: 3, ms: 10 }
];
// Cá: fry = giá cá giống, days = số ngày được cho ăn để đủ lớn câu được
const FISH = [
  { id: 'liyu', chn: '鲤鱼', pin: 'lǐyú', vi: 'cá chép', icon: '🐟', fry: 10, sell: 25, days: 3, ms: 9 },
  { id: 'jiyu', chn: '鲫鱼', pin: 'jìyú', vi: 'cá diếc', icon: '🐟', fry: 8, sell: 20, days: 3, ms: 9 },
  { id: 'caoyu', chn: '草鱼', pin: 'cǎoyú', vi: 'cá trắm cỏ', icon: '🐟', fry: 12, sell: 30, days: 4, ms: 10 },
  { id: 'jinyu', chn: '金鱼', pin: 'jīnyú', vi: 'cá vàng', icon: '🐠', fry: 15, sell: 35, days: 3, ms: 10 },
  { id: 'nianyu', chn: '鲶鱼', pin: 'niányú', vi: 'cá trê', icon: '🐟', fry: 14, sell: 32, days: 4, ms: 10 }
];
const POND_CAP = 10;
// Vật nuôi: slots = số chỗ trong chuồng (gà: 6 ổ / 6 khay ăn / 6 khay nước)
const ANIMALS = {
  chicken: { id: 'chicken', chn: '鸡', pin: 'jī', vi: 'gà', icon: '🐔', q: '只', price: 20, sell: 15, pen: { chn: '鸡舍', pin: 'jīshè', vi: 'chuồng gà', cost: 0, ms: 0 }, food: 'feed_chicken', product: 'egg', cycle: 1, slots: 6, tool: null },
  pig: { id: 'pig', chn: '猪', pin: 'zhū', vi: 'heo', icon: '🐷', q: '头', price: 60, sell: 50, sellGrown: 160, growDays: 6, pen: { chn: '猪舍', pin: 'zhūshè', vi: 'chuồng heo', cost: 150, ms: 3 }, food: 'feed_pig', product: null, cycle: 0, slots: 2, tool: null },
  sheep: { id: 'sheep', chn: '羊', pin: 'yáng', vi: 'cừu', icon: '🐑', q: '只', price: 80, sell: 60, pen: { chn: '羊舍', pin: 'yángshè', vi: 'chuồng cừu', cost: 200, ms: 4 }, food: 'hay', product: 'wool', cycle: 3, slots: 2, tool: 'shears' },
  cow: { id: 'cow', chn: '牛', pin: 'niú', vi: 'bò', icon: '🐄', q: '头', price: 120, sell: 90, pen: { chn: '牛舍', pin: 'niúshè', vi: 'chuồng bò', cost: 300, ms: 5 }, food: 'hay', product: 'milk', cycle: 2, slots: 2, tool: 'pail' }
};
const ANIMAL_IDS = ['chicken', 'pig', 'sheep', 'cow'];
// Món ăn (bếp): need = nguyên liệu (mảng = dùng 1 trong các loại), energy = năng lượng hồi khi ăn
const RECIPES = [
  { id: 'mifan', chn: '米饭', pin: 'mǐfàn', vi: 'cơm trắng', icon: '🍚', need: { rice: 1, water: 1 }, energy: 15 },
  { id: 'chaojidan', chn: '炒鸡蛋', pin: 'chǎo jīdàn', vi: 'trứng chiên', icon: '🍳', need: { egg: 1, oil: 1 }, energy: 20 },
  { id: 'qingcaitang', chn: '青菜汤', pin: 'qīngcài tāng', vi: 'canh rau', icon: '🥣', need: { veg: 1, water: 1 }, energy: 20 },
  { id: 'xhscjd', chn: '西红柿炒鸡蛋', pin: 'xīhóngshì chǎo jīdàn', vi: 'cà chua xào trứng', icon: '🥘', need: { xihongshi: 1, egg: 1 }, energy: 35 },
  { id: 'hlbtang', chn: '胡萝卜汤', pin: 'húluóbo tāng', vi: 'canh cà rốt', icon: '🍲', need: { huluobo: 1, water: 1 }, energy: 25 }
];
const VEG_ANY = ['baicai', 'kongxincai'];   // "rau" cho canh rau

// Kho đồ: mọi vật phẩm (id → thông tin). kind quyết định quầy bán & sức chứa
const ITEMS = {};
const addItem = (o) => { ITEMS[o.id] = o; return o; };
CROPS.forEach(c => {
  addItem({ ...c, kind: 'crop', group: 'veg' });
  addItem({ id: `seed_${c.id}`, chn: `${c.chn}种子`, pin: `${c.pin} zhǒngzi`, vi: `hạt giống ${c.vi}`, icon: c.icon, seedOf: c.id, kind: 'seed', q: '包', buy: c.seed, ms: c.ms, group: 'plant' });
});
FRUITS.forEach(f => {
  addItem({ ...f, kind: 'fruit', group: 'fruit' });
  addItem({ id: `sap_${f.id}`, chn: `${f.chn}树苗`, pin: `${f.pin} shùmiáo`, vi: `cây giống ${f.vi}`, icon: '🌱', sapOf: f.id, kind: 'sapling', q: '棵', buy: f.sap, ms: f.ms, group: 'plant' });
});
FISH.forEach(f => {
  addItem({ ...f, kind: 'fish', q: '条', group: 'fish' });
  addItem({ id: `fry_${f.id}`, chn: `${f.chn}苗`, pin: `${f.pin} miáo`, vi: `${f.vi} giống`, icon: 'svg:fry', fryOf: f.id, kind: 'fry', q: '条', buy: f.fry, ms: f.ms, group: 'fish' });
});
[
  { id: 'egg', chn: '鸡蛋', pin: 'jīdàn', vi: 'trứng gà', icon: '🥚', q: '个', kind: 'product', sell: 3, group: 'food' },
  { id: 'milk', chn: '牛奶', pin: 'niúnǎi', vi: 'sữa bò', icon: '🥛', q: '瓶', kind: 'product', sell: 25, group: 'food' },
  { id: 'wool', chn: '羊毛', pin: 'yángmáo', vi: 'lông cừu', icon: 'svg:wool', q: '团', kind: 'product', sell: 40, group: 'animal' },
  { id: 'feed_chicken', chn: '鸡饲料', pin: 'jī sìliào', vi: 'thức ăn cho gà', icon: 'svg:sack_y', q: '份', kind: 'feed', buy: 1, ms: 0, group: 'animal' },
  { id: 'feed_pig', chn: '猪饲料', pin: 'zhū sìliào', vi: 'thức ăn cho heo', icon: 'svg:sack_p', q: '份', kind: 'feed', buy: 3, ms: 3, group: 'animal' },
  { id: 'hay', chn: '草料', pin: 'cǎoliào', vi: 'cỏ khô (cho cừu, bò)', icon: 'svg:hay', q: '份', kind: 'feed', buy: 3, ms: 4, group: 'animal' },
  { id: 'fishfood', chn: '鱼食', pin: 'yúshí', vi: 'thức ăn cho cá', icon: 'svg:sack_b', q: '份', kind: 'feed', buy: 2, ms: 9, group: 'fish' },
  { id: 'rice', chn: '大米', pin: 'dàmǐ', vi: 'gạo', icon: 'svg:rice', q: '份', kind: 'food', buy: 2, ms: 0, group: 'food' },
  { id: 'oil', chn: '食用油', pin: 'shíyòngyóu', vi: 'dầu ăn', icon: 'svg:oil', q: '份', kind: 'food', buy: 3, ms: 0, group: 'food' },
  { id: 'water', chn: '水', pin: 'shuǐ', vi: 'nước', icon: '💧', q: '份', kind: 'water', group: 'life' },
  { id: 'hoe', chn: '锄头', pin: 'chútou', vi: 'cái cuốc', icon: 'svg:hoe', q: '把', kind: 'tool', buy: 20, ms: 0, group: 'tool' },
  { id: 'can', chn: '喷壶', pin: 'pēnhú', vi: 'bình tưới', icon: 'svg:can', q: '个', kind: 'tool', buy: 20, ms: 0, group: 'tool' },
  { id: 'shears', chn: '剪刀', pin: 'jiǎndāo', vi: 'kéo cắt lông', icon: '✂️', q: '把', kind: 'tool', buy: 30, ms: 4, group: 'tool' },
  { id: 'pail', chn: '奶桶', pin: 'nǎitǒng', vi: 'thùng vắt sữa', icon: 'svg:pail', q: '个', kind: 'tool', buy: 30, ms: 5, group: 'tool' },
  { id: 'rod', chn: '鱼竿', pin: 'yúgān', vi: 'cần câu', icon: 'svg:rod', q: '根', kind: 'tool', buy: 50, ms: 9, group: 'tool' },
  { id: 'bait', chn: '鱼饵', pin: 'yú\'ěr', vi: 'mồi câu', icon: '🪱', q: '份', kind: 'bait', buy: 1, ms: 9, group: 'tool' }
].forEach(addItem);
RECIPES.forEach(r => addItem({ ...r, kind: 'dish', q: '份', group: 'food' }));
const itemOf = (id) => ITEMS[id];
const BAG_CAP = 60;            // túi: tính mọi thứ trừ dụng cụ, mồi câu, nước
const WATER_CAP = 20;          // nước mang theo tối đa
const FRIDGE_CAP = 300;
const countsInBag = (it) => it && !['tool', 'bait', 'water'].includes(it.kind);
const SELLABLE = ['crop', 'fruit', 'fish', 'product'];

// Năng lượng tiêu hao cho từng việc
const ENERGY = { draw: 2, hoe: 3, plant: 1, water: 1, harvest: 2, feed: 1, fill: 1, clean: 2, egg: 0, collect: 2, tree: 3, fishfeed: 1, fish: 4, cook: 2 };
const ENERGY_MAX = 100;
const WELL_DRAW = 5;

// Thời tiết (晴天 nắng · 阴天 nhiều mây · 雨天 mưa: tự tưới)
const WEATHERS = {
  sunny: { id: 'sunny', chn: '晴天', pin: 'qíngtiān', vi: 'trời nắng', icon: '☀️', note: 'Cây ngoài trời cần tưới bằng tay.' },
  cloudy: { id: 'cloudy', chn: '阴天', pin: 'yīntiān', vi: 'trời nhiều mây', icon: '⛅', note: 'Không mưa — nhớ kiểm tra và tưới cây.' },
  rain: { id: 'rain', chn: '雨天', pin: 'yǔtiān', vi: 'trời mưa', icon: '🌧️', note: 'Mưa đã tưới hết ruộng và cây ngoài trời!' }
};
const rollWeather = () => { const r = Math.random(); return r < 0.5 ? 'sunny' : r < 0.75 ? 'cloudy' : 'rain'; };

// Đất: số ô được phép mua theo mốc; giá 1 ô
const PLOT_POS = [[9, 3], [10, 3], [11, 3], [12, 3], [9, 2], [10, 2], [11, 2], [12, 2]];
const PLOT_PRICE = 30;
const ORCHARD_POS = [[3, 3], [6, 3], [3, 6], [6, 6], [3, 9], [6, 9]];
const START = { money: 100, bag: { hoe: 1, can: 1, water: 5, seed_baicai: 3, seed_kongxincai: 2, feed_chicken: 4, rice: 2 } };

// 10 mốc phát triển (tích lũy tự nhiên — không phải nhiệm vụ hằng ngày)
const MILESTONES = [
  { n: 1, need: 'Thu hoạch rau 1 lần và nhặt 2 quả trứng', test: g => g.stats.harvests >= 1 && g.stats.eggs >= 2, unlock: 'Được mua thêm 1 ô đất (tổng 2 ô).' },
  { n: 2, need: 'Nhặt tổng cộng 6 quả trứng', test: g => g.stats.eggs >= 6, unlock: 'Được nuôi tối đa 5 con gà (mua ở quầy 动物).' },
  { n: 3, need: 'Đàn gà có từ 4 con trở lên', test: g => g.animalCount('chicken') >= 4, unlock: 'Mở 猪舍 chuồng heo (mua chuồng) và quyền mua 2 con heo.' },
  { n: 4, need: 'Có heo và đã cho heo ăn đủ 3 lần', test: g => g.animalCount('pig') >= 1 && g.stats.pigFed >= 3, unlock: 'Mở 羊舍 chuồng cừu và quyền mua 2 con cừu, kéo 剪刀.' },
  { n: 5, need: 'Có cả heo và cừu', test: g => g.animalCount('pig') >= 1 && g.animalCount('sheep') >= 1, unlock: 'Mở 牛舍 chuồng bò và quyền mua 2 con bò, 奶桶.' },
  { n: 6, need: 'Có bò trong chuồng', test: g => g.animalCount('cow') >= 1, unlock: 'Được mua thêm đất (tối đa 8 ô) và 5 giống rau mới.' },
  { n: 7, need: 'Thu hoạch rau tổng cộng 15 lần', test: g => g.stats.harvests >= 15, unlock: 'Mở lối đi ra sau nhà → khu rừng và vườn cây ăn quả.' },
  { n: 8, need: 'Đi vào khu rừng phía sau nhà', test: g => g.stats.forest >= 1, unlock: 'Được mua cây giống 苹果 táo và 橘子 quýt.' },
  { n: 9, need: 'Trồng 2 cây ăn quả', test: g => g.stats.trees >= 2, unlock: 'Mở 鱼塘 ao cá, cần câu, mồi câu, cá giống 鲤鱼 鲫鱼.' },
  { n: 10, need: 'Câu được 1 con cá', test: g => g.stats.fishCaught >= 1, unlock: 'Thêm cá giống 草鱼 金鱼 鲶鱼 và cây giống 桃 梨 葡萄 香蕉.' }
];

// Quầy chợ
const BOOTHS = [
  { id: 'animal', chn: '动物', pin: 'dòngwù', vi: 'quầy động vật', icon: '🐣', x: 14, color: '#ef6c00', hello: { zh: '你好！你想买什么动物？', pin: 'Nǐ hǎo! Nǐ xiǎng mǎi shénme dòngwù?', vi: 'Chào bạn! Bạn muốn mua con gì?' } },
  { id: 'seed', chn: '种子', pin: 'zhǒngzi', vi: 'hạt giống & cây giống', icon: '🌱', x: 16, color: '#43a047', hello: { zh: '我们的种子很便宜，你要几包？', pin: 'Wǒmen de zhǒngzi hěn piányi, nǐ yào jǐ bāo?', vi: 'Hạt giống chỗ tôi rẻ lắm, bạn lấy mấy gói?' } },
  { id: 'feed', chn: '饲料', pin: 'sìliào', vi: 'thức ăn & nguyên liệu', icon: '🌾', x: 18, color: '#c0892b', hello: { zh: '饲料和大米都有，你要什么？', pin: 'Sìliào hé dàmǐ dōu yǒu, nǐ yào shénme?', vi: 'Thức ăn gia súc và gạo đều có, bạn cần gì?' } },
  { id: 'tool', chn: '工具', pin: 'gōngjù', vi: 'dụng cụ', icon: '🧰', x: 20, color: '#5c6bc0', hello: { zh: '欢迎光临！工具都在这儿。', pin: 'Huānyíng guānglín! Gōngjù dōu zài zhèr.', vi: 'Chào mừng! Dụng cụ đều ở đây.' } },
  { id: 'sell', chn: '收购', pin: 'shōugòu', vi: 'quầy thu mua', icon: '⚖️', x: 22, color: '#8e24aa', hello: { zh: '你有什么要卖？我都收。', pin: 'Nǐ yǒu shénme yào mài? Wǒ dōu shōu.', vi: 'Bạn có gì muốn bán? Tôi mua hết.' } }
];

// NPC ngẫu nhiên ở cổng nông trại
const NPCS = {
  neighbor: { chn: '邻居', pin: 'línjū', vi: 'hàng xóm', face: '👵', color: '#f8bbd0' },
  friend: { chn: '朋友', pin: 'péngyou', vi: 'bạn bè', face: '🧑', color: '#bbdefb' },
  customer: { chn: '顾客', pin: 'gùkè', vi: 'khách mua hàng', face: '👩', color: '#ffe0b2' },
  merchant: { chn: '商人', pin: 'shāngrén', vi: 'người bán hàng', face: '🧔', color: '#d7ccc8' },
  courier: { chn: '送货员', pin: 'sònghuòyuán', vi: 'người giao hàng', face: '🧑‍✈️', color: '#c5e1a5' },
  farmer: { chn: '农民', pin: 'nóngmín', vi: 'bác nông dân', face: '👨‍🌾', color: '#dcedc8' }
};
const L = (zh, pin, vi) => ({ zh, pin, vi });
// Hội thoại: câu NPC → lựa chọn (ok: đúng) → câu đáp. Trả lời sai: giải thích nhẹ, vẫn tiếp tục được.
const DIALOGUES = [
  { npc: 'neighbor', say: L('你好！你在做什么？', 'Nǐ hǎo! Nǐ zài zuò shénme?', 'Chào bạn! Bạn đang làm gì thế?'),
    choices: [{ ...L('我在给菜浇水。', 'Wǒ zài gěi cài jiāoshuǐ.', 'Tôi đang tưới rau.'), ok: true }, { ...L('我要六个。', 'Wǒ yào liù gè.', 'Tôi muốn sáu cái.'), why: 'Hàng xóm hỏi bạn đang làm gì, nên trả lời bằng "我在……" (tôi đang…).' }, { ...L('一共十二元。', 'Yígòng shí\'èr yuán.', 'Tổng cộng 12 tệ.'), why: 'Đây là câu tính tiền, không hợp khi được hỏi đang làm gì.' }],
    reply: L('真勤劳！你的菜长得真好。', 'Zhēn qínláo! Nǐ de cài zhǎng de zhēn hǎo.', 'Chăm chỉ quá! Rau của bạn mọc đẹp thật.') },
  { npc: 'neighbor', say: L('你种了什么菜？', 'Nǐ zhòng le shénme cài?', 'Bạn trồng rau gì vậy?'),
    choices: [{ ...L('我种了白菜和西红柿。', 'Wǒ zhòng le báicài hé xīhóngshì.', 'Tôi trồng cải thảo và cà chua.'), ok: true }, { ...L('我养了两只鸡。', 'Wǒ yǎng le liǎng zhī jī.', 'Tôi nuôi hai con gà.'), why: 'Câu hỏi về 菜 (rau), nên trả lời bằng "我种了……" (tôi đã trồng…).' }, { ...L('我去钓鱼。', 'Wǒ qù diàoyú.', 'Tôi đi câu cá.'), why: 'Chưa trả lời đúng câu hỏi "trồng rau gì".' }],
    reply: L('白菜很好吃，我也想种。', 'Báicài hěn hǎochī, wǒ yě xiǎng zhòng.', 'Cải thảo ngon lắm, tôi cũng muốn trồng.') },
  { npc: 'friend', say: L('最近怎么样？', 'Zuìjìn zěnmeyàng?', 'Dạo này thế nào?'),
    choices: [{ ...L('挺好的，每天都很忙。', 'Tǐng hǎo de, měitiān dōu hěn máng.', 'Khá tốt, ngày nào cũng bận.'), ok: true }, { ...L('多少钱？', 'Duōshao qián?', 'Bao nhiêu tiền?'), why: '"最近怎么样" là hỏi thăm dạo này ra sao, nên trả lời về bản thân.' }, { ...L('我不要。', 'Wǒ bú yào.', 'Tôi không cần.'), why: 'Câu này dùng để từ chối, không hợp khi bạn bè hỏi thăm.' }],
    reply: L('农场生活很充实啊！', 'Nóngchǎng shēnghuó hěn chōngshí a!', 'Cuộc sống nông trại thật đầy đủ nhỉ!') },
  { npc: 'friend', say: L('你喜欢农场生活吗？', 'Nǐ xǐhuan nóngchǎng shēnghuó ma?', 'Bạn có thích cuộc sống nông trại không?'),
    choices: [{ ...L('喜欢，这里的空气很新鲜。', 'Xǐhuan, zhèlǐ de kōngqì hěn xīnxiān.', 'Thích, không khí ở đây rất trong lành.'), ok: true }, { ...L('我在睡觉。', 'Wǒ zài shuìjiào.', 'Tôi đang ngủ.'), why: 'Câu hỏi "……吗？" cần trả lời 喜欢 (thích) hoặc 不喜欢 (không thích).' }, { ...L('鸡蛋三元一个。', 'Jīdàn sān yuán yí gè.', 'Trứng 3 tệ một quả.'), why: 'Đây là câu báo giá, không phải câu trả lời.' }],
    reply: L('有空我来帮你喂鸡！', 'Yǒu kòng wǒ lái bāng nǐ wèi jī!', 'Rảnh tôi sẽ đến giúp bạn cho gà ăn!') },
  { npc: 'merchant', say: L('我的种子很便宜，你要买吗？', 'Wǒ de zhǒngzi hěn piányi, nǐ yào mǎi ma?', 'Hạt giống của tôi rẻ lắm, bạn có mua không?'),
    choices: [{ ...L('多少钱一包？', 'Duōshao qián yì bāo?', 'Bao nhiêu tiền một gói?'), ok: true }, { ...L('我种了白菜。', 'Wǒ zhòng le báicài.', 'Tôi trồng cải thảo.'), why: 'Khi người bán mời mua, hãy hỏi giá: "多少钱……？"' }, { ...L('你好，我很好。', 'Nǐ hǎo, wǒ hěn hǎo.', 'Chào bạn, tôi khỏe.'), why: 'Chưa trả lời lời mời mua hàng.' }],
    reply: L('三块钱一包。去集市的种子摊买吧！', 'Sān kuài qián yì bāo. Qù jíshì de zhǒngzi tān mǎi ba!', '3 đồng một gói. Ra quầy hạt giống ở chợ mua nhé!') },
  { npc: 'merchant', say: L('今天的饲料很便宜！', 'Jīntiān de sìliào hěn piányi!', 'Hôm nay thức ăn gia súc rẻ lắm!'),
    choices: [{ ...L('太好了，我买五份。', 'Tài hǎo le, wǒ mǎi wǔ fèn.', 'Tuyệt quá, tôi mua năm phần.'), ok: true }, { ...L('我是农民。', 'Wǒ shì nóngmín.', 'Tôi là nông dân.'), why: 'Người bán báo giá rẻ, nên đáp lại việc mua: "我买……".' }, { ...L('下雨了。', 'Xià yǔ le.', 'Mưa rồi.'), why: 'Câu này nói về thời tiết, không liên quan.' }],
    reply: L('好的，去集市的饲料摊吧！', 'Hǎo de, qù jíshì de sìliào tān ba!', 'Được, ra quầy thức ăn ở chợ nhé!') },
  { npc: 'courier', say: L('你好，有你的快递，请签收。', 'Nǐ hǎo, yǒu nǐ de kuàidì, qǐng qiānshōu.', 'Chào bạn, có bưu kiện của bạn, mời ký nhận.'),
    choices: [{ ...L('好的，谢谢你！', 'Hǎo de, xièxie nǐ!', 'Vâng, cảm ơn anh!'), ok: true }, { ...L('我不吃米饭。', 'Wǒ bù chī mǐfàn.', 'Tôi không ăn cơm.'), why: 'Nhận hàng thì nên cảm ơn: "谢谢你".' }, { ...L('我要买鸡。', 'Wǒ yào mǎi jī.', 'Tôi muốn mua gà.'), why: 'Người giao hàng không bán gà đâu nhé.' }],
    reply: L('不客气，再见！', 'Bú kèqi, zàijiàn!', 'Không có gì, tạm biệt!') },
  { npc: 'farmer', say: L('天气好的时候，要记得给菜浇水。', 'Tiānqì hǎo de shíhou, yào jìde gěi cài jiāoshuǐ.', 'Khi trời nắng đẹp nhớ tưới rau nhé.'),
    choices: [{ ...L('谢谢你，我记住了。', 'Xièxie nǐ, wǒ jìzhù le.', 'Cảm ơn bác, cháu nhớ rồi.'), ok: true }, { ...L('一共八元。', 'Yígòng bā yuán.', 'Tổng cộng 8 tệ.'), why: 'Bác nông dân cho lời khuyên — hãy cảm ơn.' }, { ...L('我要六个。', 'Wǒ yào liù gè.', 'Tôi muốn sáu cái.'), why: 'Câu này dùng khi mua hàng.' }],
    reply: L('下雨天就不用浇水了。', 'Xià yǔ tiān jiù bú yòng jiāoshuǐ le.', 'Trời mưa thì không cần tưới.') },
  { npc: 'farmer', say: L('鸡舍要每天打扫，鸡才健康。', 'Jīshè yào měitiān dǎsǎo, jī cái jiànkāng.', 'Chuồng gà phải quét dọn mỗi ngày thì gà mới khỏe.'),
    choices: [{ ...L('好的，我每天都打扫。', 'Hǎo de, wǒ měitiān dōu dǎsǎo.', 'Vâng, ngày nào cháu cũng dọn.'), ok: true }, { ...L('我喜欢西瓜。', 'Wǒ xǐhuan xīguā.', 'Tôi thích dưa hấu.'), why: 'Chưa trả lời lời khuyên về việc dọn chuồng.' }, { ...L('你有鸡蛋吗？', 'Nǐ yǒu jīdàn ma?', 'Bạn có trứng không?'), why: 'Đây là câu hỏi mua trứng.' }],
    reply: L('还要记得给鸡加水。', 'Hái yào jìde gěi jī jiā shuǐ.', 'Còn phải nhớ thêm nước cho gà nữa.') }
];
// Khách mua hàng (động): hỏi có món X không → bán tại chỗ giá thu mua +20%
const CUSTOMER_GOODS = ['egg', 'baicai', 'luobo', 'kongxincai', 'huluobo', 'xihongshi', 'pingguo', 'juzi', 'liyu', 'milk'];

// Sổ tay từ vựng: 10 nhóm theo tài liệu
const V = (chn, pin, vi) => ({ chn, pin, vi });
const VOCAB_GROUPS = [
  { id: 'plant', chn: '植物', pin: 'zhíwù', vi: 'Thực vật', words: [V('植物', 'zhíwù', 'thực vật'), V('种子', 'zhǒngzi', 'hạt giống'), V('树苗', 'shùmiáo', 'cây giống'), V('果树', 'guǒshù', 'cây ăn quả'), V('树', 'shù', 'cây'), V('草地', 'cǎodì', 'bãi cỏ'), V('花', 'huā', 'hoa'), V('菜地', 'càidì', 'ô đất trồng rau'), V('发芽', 'fāyá', 'nảy mầm'), V('成熟', 'chéngshú', 'chín, trưởng thành')] },
  { id: 'animal', chn: '动物', pin: 'dòngwù', vi: 'Động vật', words: [V('动物', 'dòngwù', 'động vật'), V('鸡', 'jī', 'gà'), V('猪', 'zhū', 'heo'), V('羊', 'yáng', 'cừu'), V('牛', 'niú', 'bò'), V('鸡舍', 'jīshè', 'chuồng gà'), V('猪舍', 'zhūshè', 'chuồng heo'), V('羊舍', 'yángshè', 'chuồng cừu'), V('牛舍', 'niúshè', 'chuồng bò'), V('鸡窝', 'jīwō', 'ổ gà'), V('食槽', 'shícáo', 'khay thức ăn'), V('水槽', 'shuǐcáo', 'khay nước'), V('饲料', 'sìliào', 'thức ăn gia súc'), V('鸡饲料', 'jī sìliào', 'thức ăn cho gà'), V('猪饲料', 'zhū sìliào', 'thức ăn cho heo'), V('草料', 'cǎoliào', 'cỏ khô'), V('羊毛', 'yángmáo', 'lông cừu'), V('粪便', 'fènbiàn', 'phân'), V('健康', 'jiànkāng', 'khỏe mạnh'), V('饿', 'è', 'đói')] },
  { id: 'fruit', chn: '水果', pin: 'shuǐguǒ', vi: 'Trái cây', words: [V('水果', 'shuǐguǒ', 'trái cây'), ...FRUITS.map(f => V(f.chn, f.pin, f.vi)), V('果园', 'guǒyuán', 'vườn cây ăn quả')] },
  { id: 'veg', chn: '蔬菜', pin: 'shūcài', vi: 'Rau củ', words: [V('蔬菜', 'shūcài', 'rau củ'), ...CROPS.map(c => V(c.chn, c.pin, c.vi))] },
  { id: 'fish', chn: '鱼类', pin: 'yúlèi', vi: 'Các loài cá', words: [V('鱼', 'yú', 'cá'), ...FISH.map(f => V(f.chn, f.pin, f.vi)), V('鱼苗', 'yúmiáo', 'cá giống'), V('鱼塘', 'yútáng', 'ao cá'), V('鱼食', 'yúshí', 'thức ăn cho cá'), V('钓鱼', 'diàoyú', 'câu cá')] },
  { id: 'food', chn: '食物', pin: 'shíwù', vi: 'Thực phẩm', words: [V('食物', 'shíwù', 'thực phẩm'), V('鸡蛋', 'jīdàn', 'trứng gà'), V('牛奶', 'niúnǎi', 'sữa bò'), V('大米', 'dàmǐ', 'gạo'), V('食用油', 'shíyòngyóu', 'dầu ăn'), ...RECIPES.map(r => V(r.chn, r.pin, r.vi))] },
  { id: 'tool', chn: '工具', pin: 'gōngjù', vi: 'Dụng cụ', words: [V('工具', 'gōngjù', 'dụng cụ'), V('锄头', 'chútou', 'cái cuốc'), V('喷壶', 'pēnhú', 'bình tưới'), V('剪刀', 'jiǎndāo', 'cái kéo'), V('奶桶', 'nǎitǒng', 'thùng vắt sữa'), V('鱼竿', 'yúgān', 'cần câu'), V('鱼饵', 'yú\'ěr', 'mồi câu'), V('井', 'jǐng', 'giếng'), V('背包', 'bēibāo', 'túi đồ')] },
  { id: 'life', chn: '生活', pin: 'shēnghuó', vi: 'Sinh hoạt', words: [V('生活', 'shēnghuó', 'cuộc sống'), V('农场', 'nóngchǎng', 'nông trại'), V('房子', 'fángzi', 'ngôi nhà'), V('门', 'mén', 'cửa'), V('床', 'chuáng', 'giường'), V('睡觉', 'shuìjiào', 'đi ngủ'), V('厨房', 'chúfáng', 'nhà bếp'), V('做饭', 'zuòfàn', 'nấu cơm'), V('冰箱', 'bīngxiāng', 'tủ lạnh'), V('饭桌', 'fànzhuō', 'bàn ăn'), V('吃饭', 'chīfàn', 'ăn cơm'), V('水', 'shuǐ', 'nước'), V('打水', 'dǎ shuǐ', 'múc nước'), V('浇水', 'jiāoshuǐ', 'tưới nước'), V('锄地', 'chú dì', 'cuốc đất'), V('播种', 'bōzhǒng', 'gieo hạt'), V('收获', 'shōuhuò', 'thu hoạch'), V('喂', 'wèi', 'cho ăn'), V('加水', 'jiā shuǐ', 'thêm nước'), V('捡鸡蛋', 'jiǎn jīdàn', 'nhặt trứng'), V('打扫', 'dǎsǎo', 'quét dọn'), V('体力', 'tǐlì', 'thể lực, năng lượng'), V('累', 'lèi', 'mệt'), V('天气', 'tiānqì', 'thời tiết'), ...Object.values(WEATHERS).map(w => V(w.chn, w.pin, w.vi)), V('天', 'tiān', 'ngày'), V('后院', 'hòuyuàn', 'sân sau'), V('树林', 'shùlín', 'khu rừng'), V('小路', 'xiǎolù', 'đường mòn')] },
  { id: 'trade', chn: '买卖', pin: 'mǎimai', vi: 'Mua bán', words: [V('买卖', 'mǎimai', 'mua bán'), V('集市', 'jíshì', 'chợ'), V('买', 'mǎi', 'mua'), V('卖', 'mài', 'bán'), V('钱', 'qián', 'tiền'), V('元', 'yuán', 'đồng (tệ)'), V('多少钱', 'duōshao qián', 'bao nhiêu tiền'), V('一共', 'yígòng', 'tổng cộng'), V('便宜', 'piányi', 'rẻ'), V('贵', 'guì', 'đắt'), V('收购', 'shōugòu', 'thu mua'), V('老板', 'lǎobǎn', 'ông chủ, chủ quầy'), V('顾客', 'gùkè', 'khách hàng'), V('商人', 'shāngrén', 'người buôn bán'), V('欢迎光临', 'huānyíng guānglín', 'chào mừng quý khách')] },
  { id: 'social', chn: '交际', pin: 'jiāojì', vi: 'Giao tiếp', words: [V('交际', 'jiāojì', 'giao tiếp'), V('你好', 'nǐ hǎo', 'xin chào'), V('谢谢', 'xièxie', 'cảm ơn'), V('不客气', 'bú kèqi', 'không có gì'), V('不好意思', 'bù hǎoyìsi', 'xin lỗi, ngại quá'), V('再见', 'zàijiàn', 'tạm biệt'), V('邻居', 'línjū', 'hàng xóm'), V('朋友', 'péngyou', 'bạn bè'), V('农民', 'nóngmín', 'nông dân'), V('送货员', 'sònghuòyuán', 'người giao hàng'), V('快递', 'kuàidì', 'bưu kiện'), V('喜欢', 'xǐhuan', 'thích'), V('最近怎么样', 'zuìjìn zěnmeyàng', 'dạo này thế nào'), V('你在做什么', 'nǐ zài zuò shénme', 'bạn đang làm gì')] }
];
const VOCAB_INDEX = {};
VOCAB_GROUPS.forEach(g => g.words.forEach(w => { if (!VOCAB_INDEX[w.chn]) VOCAB_INDEX[w.chn] = { ...w, group: g.id }; }));
const VOCAB_TOTAL = Object.keys(VOCAB_INDEX).length;
const wordOf = (chn) => VOCAB_INDEX[chn] || (Object.values(ITEMS).find(i => i.chn === chn)) || null;

// ============================================================================
// 4. BẢN ĐỒ (lưới ô vuông) & TÌM ĐƯỜNG A*
// ============================================================================
// Mã ô nền: g cỏ · p đường đất · t cây rừng (chặn) · b bụi cây (chặn) · f sàn gỗ · w tường (chặn) · d sàn chuồng · W nước (chặn) · x hoa
const SCENES = {
  farm: { cols: 24, rows: 14, chn: '农场', pin: 'nóngchǎng', vi: 'Nông trại chính', icon: '🏡' },
  house: { cols: 12, rows: 8, chn: '房子', pin: 'fángzi', vi: 'Trong nhà', icon: '🛏️' },
  pen_chicken: { cols: 13, rows: 9, chn: '鸡舍', pin: 'jīshè', vi: 'Chuồng gà', icon: '🐔', animal: 'chicken' },
  pen_pig: { cols: 13, rows: 9, chn: '猪舍', pin: 'zhūshè', vi: 'Chuồng heo', icon: '🐷', animal: 'pig' },
  pen_sheep: { cols: 13, rows: 9, chn: '羊舍', pin: 'yángshè', vi: 'Chuồng cừu', icon: '🐑', animal: 'sheep' },
  pen_cow: { cols: 13, rows: 9, chn: '牛舍', pin: 'niúshè', vi: 'Chuồng bò', icon: '🐄', animal: 'cow' },
  forest: { cols: 24, rows: 14, chn: '后院树林', pin: 'hòuyuàn shùlín', vi: 'Rừng sau nhà', icon: '🌲' }
};
const PEN_X = { chicken: 2, pig: 7, sheep: 12, cow: 17 };   // chuồng 3×2 ô ở hàng y = 6..7, cửa ở (x+1, 7)
const POND = { x0: 15, y0: 4, x1: 21, y1: 10 };
const FEEDER = [14, 3];

const grid = (cols, rows, ch) => Array.from({ length: rows }, () => Array(cols).fill(ch));
const seeded = (x, y) => { const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return s - Math.floor(s); };

// Dựng 1 khu vực từ trạng thái game → { cols, rows, base, block, objs }
function buildScene(g, id) {
  const meta = SCENES[id];
  const { cols, rows } = meta;
  const base = grid(cols, rows, 'g');
  const objs = [];
  const add = (o) => { objs.push({ w: 1, h: 1, ...o }); return o; };

  if (id === 'farm') {
    for (let x = 0; x < cols; x++) { base[0][x] = 't'; base[rows - 1][x] = 't'; }
    for (let y = 0; y < rows; y++) { base[y][0] = 't'; base[y][cols - 1] = 't'; }
    for (let x = 1; x < cols - 1; x++) { base[4][x] = 'p'; base[8][x] = 'p'; }
    for (let y = 4; y <= 9; y++) base[y][1] = 'p';
    for (let y = 8; y <= 12; y++) base[y][22] = 'p';
    for (let x = 13; x <= 22; x++) base[12][x] = 'p';
    base[9][0] = 'p';                                  // cổng nông trại
    base[12][23] = 'p';                                // lối ra sau nhà
    for (let y = 9; y <= 12; y++) for (let x = 2; x <= 21; x++) {
      if (base[y][x] !== 'g') continue;
      const r = seeded(x, y);
      if (y === 9 && x <= 3) continue;
      if (r < 0.07) base[y][x] = 'b'; else if (r < 0.2) base[y][x] = 'x';
    }
    add({ id: 'house', kind: 'house', x: 2, y: 1, w: 4, h: 3, word: '房子', stand: [[3, 4]] });
    add({ id: 'well', kind: 'well', x: 7, y: 2, word: '井' });
    PLOT_POS.forEach(([x, y], i) => add({ id: `plot${i}`, kind: 'plot', idx: i, x, y, word: '菜地' }));
    BOOTHS.forEach(b => add({ id: `booth_${b.id}`, kind: 'booth', booth: b.id, x: b.x, y: 2, word: b.id === 'sell' ? '收购' : '集市', stand: [[b.x, 3]] }));
    ANIMAL_IDS.forEach(a => add({ id: `pen_${a}`, kind: 'pen', animal: a, x: PEN_X[a], y: 6, w: 3, h: 2, word: ANIMALS[a].pen.chn, stand: [[PEN_X[a] + 1, 8]] }));
    add({ id: 'exit_forest', kind: 'exit', to: 'forest', x: 23, y: 12, word: '后院', stand: [[22, 12]] });
    add({ id: 'gate', kind: 'gate', x: 0, y: 9, word: '农场', walk: false, stand: [[1, 9]] });
    if (g.npc && !g.npc.done) add({ id: 'npc', kind: 'npc', x: 2, y: 9, word: NPCS[g.npc.type].chn });
  } else if (id === 'house') {
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) base[y][x] = (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) ? 'w' : 'f';
    base[rows - 1][6] = 'f';
    add({ id: 'bed', kind: 'bed', x: 1, y: 1, w: 2, h: 2, word: '床' });
    add({ id: 'stove', kind: 'stove', x: 5, y: 1, word: '厨房' });
    add({ id: 'fridge', kind: 'fridge', x: 7, y: 1, word: '冰箱' });
    add({ id: 'table', kind: 'table', x: 5, y: 4, w: 2, h: 1, word: '饭桌' });
    add({ id: 'door_out', kind: 'exit', to: 'farm', x: 6, y: rows - 1, word: '门', stand: [[6, rows - 2]] });
  } else if (id.startsWith('pen_')) {
    const a = ANIMALS[meta.animal];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) base[y][x] = (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) ? 'w' : 'd';
    base[rows - 1][6] = 'd';
    const pen = g.pens[a.id];
    const rowsOf = a.slots === 6 ? [2, 3, 4, 5, 6, 7] : [3, 5];
    rowsOf.forEach((y, i) => {
      add({ id: `food${i}`, kind: 'tray', tray: 'food', slot: i, x: 1, y, word: '食槽', stand: [[2, y]] });
      add({ id: `water${i}`, kind: 'tray', tray: 'water', slot: i, x: cols - 2, y, word: '水槽', stand: [[cols - 3, y]] });
    });
    if (a.id === 'chicken') {
      for (let i = 0; i < 6; i++) add({ id: `nest${i}`, kind: 'nest', slot: i, x: 3 + i, y: 1, word: '鸡窝', stand: [[3 + i, 2]] });
    } else {
      pen.animals.forEach((an, i) => add({ id: `animal${i}`, kind: 'animal', slot: i, x: i === 0 ? 4 : 8, y: 2, word: a.chn }));
    }
    (pen.poops || []).forEach(([x, y], i) => add({ id: `poop${i}`, kind: 'poop', idx: i, x, y, walk: true, word: '粪便' }));
    add({ id: 'door_out', kind: 'exit', to: 'farm', x: 6, y: rows - 1, word: '门', stand: [[6, rows - 2]] });
  } else if (id === 'forest') {
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      if (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) base[y][x] = 't';
      else if (seeded(x + 3, y + 7) < 0.1 && (x < 9 || x > 13) && !(x >= POND.x0 - 1 && x <= POND.x1 + 1 && y >= POND.y0 - 1 && y <= POND.y1 + 1) && !(x >= 2 && x <= 7 && y >= 2 && y <= 10)) base[y][x] = 't';
    }
    for (let y = 0; y < rows - 1; y++) { base[y][11] = 'p'; base[y][12] = 'p'; }
    for (let y = POND.y0; y <= POND.y1; y++) for (let x = POND.x0; x <= POND.x1; x++) base[y][x] = 'W';
    // bo góc ao
    [[POND.x0, POND.y0], [POND.x1, POND.y0], [POND.x0, POND.y1], [POND.x1, POND.y1]].forEach(([x, y]) => { base[y][x] = 'g'; });
    for (let x = 2; x <= 8; x++) if (base[1][x] === 'g') base[1][x] = 'x';
    add({ id: 'exit_farm', kind: 'exit', to: 'farm', x: 11, y: 0, w: 2, h: 1, word: '农场', stand: [[11, 1], [12, 1]] });
    ORCHARD_POS.forEach(([x, y], i) => add({ id: `tree${i}`, kind: 'tree', idx: i, x, y, word: '果树' }));
    add({ id: 'feeder', kind: 'feeder', x: FEEDER[0], y: FEEDER[1], word: '鱼塘' });
    add({ id: 'pond', kind: 'pond', x: POND.x0, y: POND.y0, w: POND.x1 - POND.x0 + 1, h: POND.y1 - POND.y0 + 1, word: '鱼塘', isPond: true });
  }

  const block = base.map(row => row.map(ch => ['t', 'b', 'w', 'W'].includes(ch)));
  objs.forEach(o => {
    if (o.walk || o.isPond) return;
    for (let y = o.y; y < o.y + o.h; y++) for (let x = o.x; x < o.x + o.w; x++) if (block[y]) block[y][x] = true;
  });
  // cửa ra (trên tường / bìa rừng) vẫn chặn — chỉ đứng ở ô "stand"
  return { id, cols, rows, base, block, objs, meta };
}

const objAt = (sc, x, y) => {
  // ưu tiên vật nhỏ nằm trên (phân, NPC) rồi tới vật lớn
  const hits = sc.objs.filter(o => x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h);
  if (!hits.length) return null;
  return hits.sort((a, b) => (a.w * a.h) - (b.w * b.h))[0];
};

// Ô đứng để tương tác: chỉ định sẵn, hoặc các ô đi được kề cạnh vật (với ao: ô bờ kề nước)
function standTiles(sc, o) {
  const ok = ([x, y]) => x >= 0 && y >= 0 && x < sc.cols && y < sc.rows && !sc.block[y][x];
  if (o.stand) return o.stand.filter(ok);
  if (o.walk) return [[o.x, o.y], [o.x + 1, o.y], [o.x - 1, o.y], [o.x, o.y + 1], [o.x, o.y - 1]].filter(ok);
  const out = [];
  for (let y = o.y - 1; y <= o.y + o.h; y++) for (let x = o.x - 1; x <= o.x + o.w; x++) {
    const inside = x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h;
    const diag = (x < o.x || x >= o.x + o.w) && (y < o.y || y >= o.y + o.h);
    if (inside || diag) continue;
    if (o.isPond) { const nx = clamp(x, o.x, o.x + o.w - 1); const ny = clamp(y, o.y, o.y + o.h - 1); if (sc.base[ny][nx] !== 'W') continue; }
    if (ok([x, y])) out.push([x, y]);
  }
  return out;
}

// A* 4 hướng, nhiều đích; trả về danh sách ô (không gồm ô xuất phát) hoặc null
function findPath(sc, from, goals) {
  const key = (x, y) => y * sc.cols + x;
  const goalSet = new Set(goals.map(([x, y]) => key(x, y)));
  if (!goalSet.size) return null;
  const sk = key(from[0], from[1]);
  if (goalSet.has(sk)) return [];
  const h = (x, y) => Math.min(...goals.map(([gx, gy]) => Math.abs(gx - x) + Math.abs(gy - y)));
  const open = [{ x: from[0], y: from[1], g: 0, f: h(from[0], from[1]) }];
  const came = new Map();
  const gScore = new Map([[sk, 0]]);
  const closed = new Set();
  let guard = 0;
  while (open.length && guard++ < 5000) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (open[i].f < open[bi].f) bi = i;
    const cur = open.splice(bi, 1)[0];
    const ck = key(cur.x, cur.y);
    if (closed.has(ck)) continue;
    closed.add(ck);
    if (goalSet.has(ck)) {
      const path = [];
      let k = ck;
      while (k !== sk) { path.unshift([k % sc.cols, Math.floor(k / sc.cols)]); k = came.get(k); }
      return path;
    }
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const nx = cur.x + dx;
      const ny = cur.y + dy;
      if (nx < 0 || ny < 0 || nx >= sc.cols || ny >= sc.rows || sc.block[ny][nx]) return;
      const nk = key(nx, ny);
      const ng = cur.g + 1;
      if (ng < (gScore.get(nk) ?? Infinity)) {
        gScore.set(nk, ng);
        came.set(nk, ck);
        open.push({ x: nx, y: ny, g: ng, f: ng + h(nx, ny) });
      }
    });
  }
  return null;
}

// ============================================================================
// 5. VẼ BẢN ĐỒ (canvas 2D, phong cách hoạt hình đơn giản)
// ============================================================================
const EMOJI_FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
const MIN_TILE = 34;

function drawIcon(ctx, icon, cx, cy, size) {
  if (!icon) return;
  if (icon.startsWith('svg:')) {
    const k = icon.slice(4);
    let img = iconImgCache[k];
    if (!img) { img = new Image(); img.src = iconSrc(k); iconImgCache[k] = img; }
    if (img.complete && img.naturalWidth) ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
    return;
  }
  ctx.font = `${Math.round(size)}px ${EMOJI_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, cx, cy + size * 0.06);
}
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function label(ctx, text, cx, y, T, bg = 'rgba(255,253,245,0.92)', fg = '#4a2c12') {
  ctx.font = `700 ${Math.max(10, Math.round(T * 0.3))}px "LXGW WenKai Lite","Be Vietnam Pro",sans-serif`;
  const w = ctx.measureText(text).width + T * 0.24;
  const h = T * 0.4;
  rr(ctx, cx - w / 2, y - h / 2, w, h, h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, y + 1);
}
function sparkle(ctx, cx, cy, T, t) {
  for (let i = 0; i < 3; i++) {
    const a = t / 400 + i * 2.1;
    const x = cx + Math.cos(a) * T * 0.32;
    const y = cy + Math.sin(a * 1.3) * T * 0.22 - T * 0.1;
    const s = T * (0.06 + 0.04 * Math.sin(t / 150 + i));
    ctx.fillStyle = i % 2 ? '#fff59d' : '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x, y - s * 2); ctx.lineTo(x + s * 0.6, y - s * 0.6); ctx.lineTo(x + s * 2, y); ctx.lineTo(x + s * 0.6, y + s * 0.6);
    ctx.lineTo(x, y + s * 2); ctx.lineTo(x - s * 0.6, y + s * 0.6); ctx.lineTo(x - s * 2, y); ctx.lineTo(x - s * 0.6, y - s * 0.6);
    ctx.closePath();
    ctx.fill();
  }
}

function drawTile(ctx, ch, tx, ty, X, Y, T, t, sceneId) {
  const v = seeded(tx, ty);
  const grassA = sceneId === 'forest' ? '#7cbf5a' : '#8fd16a';
  const grassB = sceneId === 'forest' ? '#74b552' : '#86c962';
  if (['g', 't', 'b', 'x'].includes(ch)) {
    ctx.fillStyle = (tx + ty) % 2 ? grassA : grassB;
    ctx.fillRect(X, Y, T + 0.5, T + 0.5);
    if (v < 0.35 && ch === 'g') { ctx.strokeStyle = 'rgba(40,110,30,0.35)'; ctx.lineWidth = 1.2; ctx.beginPath(); const gx = X + v * T * 2; const gy = Y + T * 0.7; ctx.moveTo(gx, gy); ctx.lineTo(gx - 2, gy - 6); ctx.moveTo(gx + 3, gy); ctx.lineTo(gx + 4, gy - 7); ctx.stroke(); }
  }
  if (ch === 'p') {
    ctx.fillStyle = '#e6c793'; ctx.fillRect(X, Y, T + 0.5, T + 0.5);
    ctx.fillStyle = 'rgba(160,120,70,0.35)';
    ctx.beginPath(); ctx.arc(X + T * (0.2 + v * 0.6), Y + T * (0.3 + v * 0.4), T * 0.05, 0, 7); ctx.fill();
  } else if (ch === 't') {
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(X + T / 2, Y + T * 0.85, T * 0.38, T * 0.12, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#7b4f2c'; ctx.fillRect(X + T * 0.43, Y + T * 0.55, T * 0.14, T * 0.32);
    ctx.fillStyle = v < 0.5 ? '#2e7d32' : '#388e3c';
    ctx.beginPath(); ctx.arc(X + T / 2, Y + T * 0.38, T * 0.38, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.arc(X + T * 0.4, Y + T * 0.28, T * 0.15, 0, 7); ctx.fill();
  } else if (ch === 'b') {
    ctx.fillStyle = '#43a047';
    [[0.3, 0.6, 0.22], [0.62, 0.58, 0.24], [0.47, 0.42, 0.24]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.arc(X + T * a, Y + T * b, T * r, 0, 7); ctx.fill(); });
    ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.arc(X + T * 0.6, Y + T * 0.45, T * 0.05, 0, 7); ctx.fill();
  } else if (ch === 'x') {
    const cols = ['#ff8fb1', '#fff176', '#ffffff', '#ce93d8'];
    for (let i = 0; i < 3; i++) { ctx.fillStyle = cols[(i + Math.floor(v * 4)) % 4]; ctx.beginPath(); ctx.arc(X + T * (0.2 + ((v * 7 + i * 0.3) % 0.6)), Y + T * (0.25 + ((v * 5 + i * 0.27) % 0.55)), T * 0.07, 0, 7); ctx.fill(); }
  } else if (ch === 'f') {
    ctx.fillStyle = ty % 2 ? '#d9a86a' : '#d19e60'; ctx.fillRect(X, Y, T + 0.5, T + 0.5);
    ctx.strokeStyle = 'rgba(120,70,30,0.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X, Y + T - 0.5); ctx.lineTo(X + T, Y + T - 0.5); ctx.moveTo(X + ((tx + ty) % 3) * T / 3, Y); ctx.lineTo(X + ((tx + ty) % 3) * T / 3, Y + T); ctx.stroke();
  } else if (ch === 'w') {
    ctx.fillStyle = '#8d6e63'; ctx.fillRect(X, Y, T + 0.5, T + 0.5);
    ctx.fillStyle = '#a1887f'; ctx.fillRect(X, Y, T + 0.5, T * 0.25);
    ctx.strokeStyle = 'rgba(60,30,10,0.25)'; ctx.strokeRect(X + 0.5, Y + 0.5, T - 1, T - 1);
  } else if (ch === 'd') {
    ctx.fillStyle = (tx + ty) % 2 ? '#ead59c' : '#e3cc8f'; ctx.fillRect(X, Y, T + 0.5, T + 0.5);
    ctx.strokeStyle = 'rgba(170,130,50,0.45)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X + T * v, Y + T * 0.3); ctx.lineTo(X + T * v + 6, Y + T * 0.36); ctx.moveTo(X + T * (1 - v), Y + T * 0.7); ctx.lineTo(X + T * (1 - v) - 6, Y + T * 0.76); ctx.stroke();
  } else if (ch === 'W') {
    ctx.fillStyle = '#4fb3e8'; ctx.fillRect(X, Y, T + 0.5, T + 0.5);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5; ctx.beginPath();
    const o = Math.sin(t / 700 + tx + ty) * T * 0.08;
    ctx.moveTo(X + T * 0.15 + o, Y + T * 0.4); ctx.quadraticCurveTo(X + T * 0.3 + o, Y + T * 0.32, X + T * 0.45 + o, Y + T * 0.4);
    ctx.stroke();
  }
}

function drawPlayer(ctx, cx, cy, T, face, walking, t) {
  const s = T / 40;
  const bob = walking ? Math.sin(t / 70) * 1.6 * s : 0;
  const leg = walking ? Math.sin(t / 70) * 4 * s : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(cx, cy + 15 * s, 11 * s, 4 * s, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#5d4037';
  if (face === 'left' || face === 'right') { ctx.fillRect(cx - 3 * s + leg, cy + 6 * s, 5 * s, 9 * s); ctx.fillRect(cx - 2 * s - leg, cy + 6 * s, 5 * s, 9 * s); } else { ctx.fillRect(cx - 6 * s, cy + 6 * s + Math.max(0, leg), 5 * s, 9 * s - Math.max(0, leg)); ctx.fillRect(cx + 1 * s, cy + 6 * s + Math.max(0, -leg), 5 * s, 9 * s - Math.max(0, -leg)); }
  const by = cy + bob;
  ctx.fillStyle = '#e53935'; rr(ctx, cx - 9 * s, by - 4 * s, 18 * s, 13 * s, 4 * s); ctx.fill();            // áo
  ctx.fillStyle = '#1e88e5'; rr(ctx, cx - 8 * s, by + 1 * s, 16 * s, 9 * s, 3 * s); ctx.fill();              // yếm
  ctx.fillStyle = '#ffd7b5'; ctx.beginPath(); ctx.arc(cx, by - 11 * s, 9 * s, 0, 7); ctx.fill();            // đầu
  ctx.fillStyle = '#3e2723';
  if (face === 'up') { ctx.beginPath(); ctx.arc(cx, by - 12 * s, 9 * s, 0, 7); ctx.fill(); }
  else if (face === 'down') { ctx.fillRect(cx - 4 * s, by - 12 * s, 2.2 * s, 3 * s); ctx.fillRect(cx + 2 * s, by - 12 * s, 2.2 * s, 3 * s); ctx.fillStyle = '#ef9a9a'; ctx.beginPath(); ctx.arc(cx - 5.5 * s, by - 8 * s, 1.8 * s, 0, 7); ctx.arc(cx + 5.5 * s, by - 8 * s, 1.8 * s, 0, 7); ctx.fill(); }
  else { const d = face === 'left' ? -1 : 1; ctx.fillRect(cx + d * 4 * s - 1 * s, by - 12 * s, 2.2 * s, 3 * s); }
  ctx.fillStyle = '#f2c14e'; ctx.beginPath(); ctx.ellipse(cx, by - 16 * s, 14 * s, 4.5 * s, 0, 0, 7); ctx.fill();   // nón rơm
  ctx.fillStyle = '#e0ac2c'; ctx.beginPath(); ctx.ellipse(cx, by - 19 * s, 8 * s, 5 * s, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#d84315'; ctx.fillRect(cx - 8 * s, by - 18 * s, 16 * s, 2 * s);
}

// Vẽ vật thể theo loại
function drawObj(ctx, g, sc, o, X, Y, T, t) {
  const W = o.w * T;
  const H = o.h * T;
  const cx = X + W / 2;
  const cy = Y + H / 2;
  switch (o.kind) {
    case 'house': {
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(X + 6, Y + H - 6, W - 4, 8);
      ctx.fillStyle = '#f3e2c0'; ctx.fillRect(X + T * 0.15, Y + T * 1.0, W - T * 0.3, H - T * 1.0);
      ctx.strokeStyle = '#a77b4b'; ctx.lineWidth = 2; ctx.strokeRect(X + T * 0.15, Y + T * 1.0, W - T * 0.3, H - T * 1.0);
      ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.moveTo(X - T * 0.05, Y + T * 1.1); ctx.lineTo(X + W * 0.5, Y + T * 0.05); ctx.lineTo(X + W + T * 0.05, Y + T * 1.1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#962d22'; ctx.fillRect(X - T * 0.05, Y + T * 1.0, W + T * 0.1, T * 0.14);
      ctx.fillStyle = '#7b4f2c'; ctx.fillRect(X + W * 0.72, Y + T * 0.2, T * 0.3, T * 0.5);
      ctx.fillStyle = '#8b5a2b'; rr(ctx, X + T * 1.18, Y + H - T * 0.95, T * 0.64, T * 0.95, 4); ctx.fill();
      ctx.fillStyle = '#ffd54f'; ctx.beginPath(); ctx.arc(X + T * 1.7, Y + H - T * 0.45, T * 0.05, 0, 7); ctx.fill();
      [[2.3, 1.45], [3.1, 1.45], [0.4, 1.45]].forEach(([a, b]) => { ctx.fillStyle = '#bfe6fb'; ctx.fillRect(X + T * a, Y + T * b, T * 0.55, T * 0.5); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(X + T * a, Y + T * b, T * 0.55, T * 0.5); });
      label(ctx, '我的家', cx, Y + T * 0.75, T);
      break;
    }
    case 'well': {
      ctx.fillStyle = '#9e9e9e'; ctx.beginPath(); ctx.ellipse(cx, cy + T * 0.12, T * 0.42, T * 0.32, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#29b6f6'; ctx.beginPath(); ctx.ellipse(cx, cy + T * 0.08, T * 0.27, T * 0.18, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = '#6d4c41'; ctx.lineWidth = T * 0.07; ctx.beginPath(); ctx.moveTo(cx - T * 0.38, cy + T * 0.1); ctx.lineTo(cx - T * 0.38, cy - T * 0.45); ctx.lineTo(cx + T * 0.38, cy - T * 0.45); ctx.lineTo(cx + T * 0.38, cy + T * 0.1); ctx.stroke();
      ctx.fillStyle = '#8d6e63'; ctx.beginPath(); ctx.moveTo(cx - T * 0.5, cy - T * 0.42); ctx.lineTo(cx, cy - T * 0.7); ctx.lineTo(cx + T * 0.5, cy - T * 0.42); ctx.fill();
      drawIcon(ctx, '🪣', cx, cy - T * 0.18, T * 0.3);
      break;
    }
    case 'plot': drawPlot(ctx, g, o, X, Y, T, t); break;
    case 'booth': {
      const b = BOOTHS.find(x => x.id === o.booth);
      ctx.fillStyle = '#a1693c'; ctx.fillRect(X + T * 0.06, Y + T * 0.45, T * 0.88, T * 0.5);
      ctx.fillStyle = '#c58a52'; ctx.fillRect(X + T * 0.02, Y + T * 0.4, T * 0.96, T * 0.12);
      for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#fffaf0' : b.color; ctx.beginPath(); ctx.moveTo(X + i * T / 4, Y + T * 0.05); ctx.lineTo(X + (i + 1) * T / 4, Y + T * 0.05); ctx.lineTo(X + (i + 1) * T / 4, Y + T * 0.3); ctx.arc(X + (i + 0.5) * T / 4, Y + T * 0.3, T / 8, 0, Math.PI); ctx.closePath(); ctx.fill(); }
      drawIcon(ctx, b.icon, cx, Y + T * 0.66, T * 0.42);
      label(ctx, b.chn, cx, Y - T * 0.12, T, b.color, '#fff');
      break;
    }
    case 'pen': drawPenBuilding(ctx, g, o, X, Y, T); break;
    case 'exit': {
      if (o.to === 'forest') {
        const open = g.milestone >= 7;
        ctx.fillStyle = '#e6c793'; ctx.fillRect(X, Y, T, T);
        if (!open) { ctx.strokeStyle = '#8d5a2b'; ctx.lineWidth = T * 0.08; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(X + T * (0.2 + i * 0.3), Y + T * 0.1); ctx.lineTo(X + T * (0.2 + i * 0.3), Y + T * 0.9); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(X, Y + T * 0.4); ctx.lineTo(X + T, Y + T * 0.4); ctx.moveTo(X, Y + T * 0.7); ctx.lineTo(X + T, Y + T * 0.7); ctx.stroke(); drawIcon(ctx, '🔒', cx, cy, T * 0.4); }
        else drawIcon(ctx, '🌲', cx, cy, T * 0.6);
        label(ctx, '后院 ➜', cx, Y - T * 0.15, T, open ? '#2e7d32' : '#9e9e9e', '#fff');
      } else if (o.to === 'farm' && sc.id === 'forest') {
        ctx.fillStyle = '#e6c793'; ctx.fillRect(X, Y, W, H);
        label(ctx, '⬆ 回农场', cx, Y + T * 0.6, T, '#ef6c00', '#fff');
      } else {
        ctx.fillStyle = '#6d4c41'; ctx.fillRect(X + T * 0.1, Y, T * 0.8, T * 0.6);
        ctx.fillStyle = '#c62828'; rr(ctx, X + T * 0.05, Y + T * 0.55, T * 0.9, T * 0.4, 6); ctx.fill();
        label(ctx, '门', cx, Y + T * 0.3, T);
      }
      break;
    }
    case 'gate': {
      ctx.fillStyle = '#e6c793'; ctx.fillRect(X, Y, T, T);
      ctx.fillStyle = '#8d5a2b'; ctx.fillRect(X + T * 0.05, Y - T * 0.3, T * 0.14, T * 1.3); ctx.fillRect(X + T * 0.81, Y - T * 0.3, T * 0.14, T * 1.3);
      ctx.fillRect(X, Y - T * 0.35, T, T * 0.14);
      break;
    }
    case 'npc': {
      const n = NPCS[g.npc.type];
      const b = Math.sin(t / 300) * 2;
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(cx, Y + T * 0.88, T * 0.28, T * 0.09, 0, 0, 7); ctx.fill();
      ctx.fillStyle = n.color; ctx.beginPath(); ctx.arc(cx, cy + b, T * 0.4, 0, 7); ctx.fill();
      drawIcon(ctx, n.face, cx, cy + b, T * 0.6);
      label(ctx, '💬 ' + n.chn, cx, Y - T * 0.2 + b, T, '#ffffff', '#c2410c');
      break;
    }
    case 'bed': {
      ctx.fillStyle = '#8d6e63'; rr(ctx, X + 4, Y + 4, W - 8, H - 8, 8); ctx.fill();
      ctx.fillStyle = '#fff'; rr(ctx, X + 10, Y + 8, W - 20, T * 0.45, 6); ctx.fill();
      ctx.fillStyle = '#64b5f6'; rr(ctx, X + 8, Y + T * 0.65, W - 16, H - T * 0.75, 6); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 3; i++) ctx.fillRect(X + 12, Y + T * 0.8 + i * T * 0.35, W - 24, 3);
      label(ctx, '床 · 睡觉', cx, Y - T * 0.1, T);
      break;
    }
    case 'stove': {
      ctx.fillStyle = '#795548'; rr(ctx, X + 3, Y + 4, T - 6, T - 6, 6); ctx.fill();
      ctx.fillStyle = '#424242'; ctx.beginPath(); ctx.arc(cx, cy, T * 0.26, 0, 7); ctx.fill();
      drawIcon(ctx, '🍳', cx, cy, T * 0.4);
      label(ctx, '厨房', cx, Y - T * 0.1, T);
      break;
    }
    case 'fridge': {
      ctx.fillStyle = '#eceff1'; rr(ctx, X + 6, Y + 2, T - 12, T - 4, 6); ctx.fill();
      ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 2; ctx.stroke(); ctx.beginPath(); ctx.moveTo(X + 6, Y + T * 0.4); ctx.lineTo(X + T - 6, Y + T * 0.4); ctx.stroke();
      ctx.fillStyle = '#90a4ae'; ctx.fillRect(X + T - 14, Y + T * 0.15, 3, T * 0.15); ctx.fillRect(X + T - 14, Y + T * 0.5, 3, T * 0.2);
      label(ctx, '冰箱', cx, Y - T * 0.1, T);
      break;
    }
    case 'table': {
      ctx.fillStyle = '#a1693c'; rr(ctx, X + 4, Y + 6, W - 8, T - 12, 8); ctx.fill();
      ctx.fillStyle = '#c58a52'; rr(ctx, X + 8, Y + 9, W - 16, T - 20, 6); ctx.fill();
      drawIcon(ctx, '🍚', X + T * 0.6, cy, T * 0.36); drawIcon(ctx, '🥢', X + T * 1.3, cy, T * 0.36);
      label(ctx, '饭桌', cx, Y - T * 0.1, T);
      break;
    }
    case 'tray': drawTray(ctx, g, sc, o, X, Y, T); break;
    case 'nest': {
      ctx.fillStyle = '#c8a24a'; ctx.beginPath(); ctx.ellipse(cx, cy + T * 0.1, T * 0.4, T * 0.26, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#a07a2a'; ctx.beginPath(); ctx.ellipse(cx, cy + T * 0.05, T * 0.26, T * 0.14, 0, 0, 7); ctx.fill();
      const pen = g.pens.chicken;
      if (pen.nests[o.slot]) { drawIcon(ctx, '🥚', cx, cy - T * 0.02, T * 0.38); sparkle(ctx, cx, cy, T, t); }
      if (o.slot >= pen.animals.length) { ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(cx, cy + T * 0.1, T * 0.42, T * 0.28, 0, 0, 7); ctx.fill(); }
      break;
    }
    case 'animal': {
      const a = ANIMALS[SCENES[sc.id].animal];
      const an = g.pens[a.id].animals[o.slot];
      if (!an) break;
      ctx.fillStyle = '#d7b979'; rr(ctx, X - T * 0.4, Y - T * 0.1, T * 1.8, T * 1.2, 10); ctx.fill();
      const b = Math.sin(t / 500 + o.slot) * 2;
      const big = a.id === 'pig' ? 0.55 + 0.35 * Math.min(1, an.growth / a.growDays) : 0.85;
      drawIcon(ctx, a.icon, cx, cy + b, T * big);
      if (an.ready) { drawIcon(ctx, itemOf(a.product).icon, cx + T * 0.45, Y - T * 0.05, T * 0.38); sparkle(ctx, cx, cy, T, t); }
      if (a.id === 'pig' && an.growth >= a.growDays) label(ctx, '长大了', cx, Y - T * 0.2, T, '#43a047', '#fff');
      if (an.health < 40) label(ctx, '🤒', cx - T * 0.45, Y, T, 'rgba(255,255,255,0.9)');
      break;
    }
    case 'poop': {
      ctx.fillStyle = '#795548';
      ctx.beginPath(); ctx.ellipse(cx, cy + T * 0.15, T * 0.2, T * 0.09, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, cy + T * 0.04, T * 0.14, T * 0.08, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, cy - T * 0.05, T * 0.08, T * 0.06, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(120,140,40,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); const w = Math.sin(t / 300) * 2; ctx.moveTo(cx - 5, cy - T * 0.18); ctx.quadraticCurveTo(cx - 8 + w, cy - T * 0.3, cx - 4, cy - T * 0.42); ctx.moveTo(cx + 5, cy - T * 0.18); ctx.quadraticCurveTo(cx + 2 + w, cy - T * 0.3, cx + 6, cy - T * 0.42); ctx.stroke();
      break;
    }
    case 'tree': drawTreeSlot(ctx, g, o, X, Y, T, t); break;
    case 'feeder': {
      const open = g.milestone >= 9;
      ctx.fillStyle = '#8d5a2b'; ctx.fillRect(cx - T * 0.06, cy - T * 0.2, T * 0.12, T * 0.6);
      ctx.fillStyle = open ? '#fff3e0' : '#e0e0e0'; rr(ctx, X + T * 0.05, Y + T * 0.05, T * 0.9, T * 0.42, 6); ctx.fill();
      ctx.strokeStyle = '#8d5a2b'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#4a2c12'; ctx.font = `700 ${Math.round(T * 0.26)}px "LXGW WenKai Lite",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(open ? '鱼塘' : '🔒', cx, Y + T * 0.27);
      break;
    }
    case 'pond': {
      const open = g.milestone >= 9;
      if (open) (g.pond.fish || []).forEach((f, i) => {
        const a = t / (1800 + i * 170) + i * 1.7;
        const fx = X + W / 2 + Math.cos(a) * (W * 0.32 - (i % 3) * T * 0.4);
        const fy = Y + H / 2 + Math.sin(a * 1.3) * (H * 0.3 - (i % 2) * T * 0.4);
        ctx.fillStyle = FISH.find(s => s.id === f.sp)?.id === 'jinyu' ? 'rgba(255,140,40,0.75)' : 'rgba(30,60,90,0.35)';
        const sz = T * (0.14 + 0.08 * Math.min(1, f.age / 4));
        ctx.beginPath(); ctx.ellipse(fx, fy, sz * 1.6, sz * 0.7, a + Math.PI / 2, 0, 7); ctx.fill();
      });
      if (!open) {
        ctx.strokeStyle = '#8d5a2b'; ctx.lineWidth = 4; ctx.setLineDash([10, 6]); ctx.strokeRect(X - 4, Y - 4, W + 8, H + 8); ctx.setLineDash([]);
        label(ctx, '🔒 鱼塘 · mốc 9', cx, cy, T, 'rgba(255,255,255,0.92)');
      } else if (g.pond.fedToday) drawIcon(ctx, '✨', X + W - T * 0.5, Y + T * 0.5, T * 0.4);
      break;
    }
    default: break;
  }
}

function drawPlot(ctx, g, o, X, Y, T, t) {
  const p = g.plots[o.idx];
  const cx = X + T / 2;
  const cy = Y + T / 2;
  if (!p || p.state === 'locked') return;
  if (p.state === 'sale') {
    ctx.strokeStyle = 'rgba(120,70,30,0.6)'; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.strokeRect(X + 4, Y + 4, T - 8, T - 8); ctx.setLineDash([]);
    label(ctx, `出售 ${PLOT_PRICE}元`, cx, cy, T, '#fff8e1', '#b45309');
    return;
  }
  if (p.state === 'grass') {
    ctx.fillStyle = '#9ccc65'; rr(ctx, X + 3, Y + 3, T - 6, T - 6, 5); ctx.fill();
    ctx.strokeStyle = '#7cb342'; ctx.lineWidth = 1.5; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(X + T * (0.2 + i * 0.2), Y + T * 0.75); ctx.lineTo(X + T * (0.18 + i * 0.2), Y + T * 0.55); ctx.stroke(); }
    return;
  }
  ctx.fillStyle = p.watered ? '#6d4426' : '#a0703c'; rr(ctx, X + 3, Y + 3, T - 6, T - 6, 5); ctx.fill();
  ctx.strokeStyle = p.watered ? 'rgba(40,20,5,0.5)' : 'rgba(90,55,20,0.5)'; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(X + 7, Y + T * (0.3 + i * 0.22)); ctx.lineTo(X + T - 7, Y + T * (0.3 + i * 0.22)); ctx.stroke(); }
  if (p.crop) {
    const c = itemOf(p.crop);
    const prog = p.ripe ? 1 : p.grow / c.days;
    if (p.ripe) { drawIcon(ctx, c.icon, cx, cy - T * 0.05, T * 0.62); sparkle(ctx, cx, cy, T, t); }
    else if (prog < 0.34) { ctx.fillStyle = '#4e342e'; [[-0.15, 0], [0.15, 0.05], [0, -0.12]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(cx + a * T, cy + b * T, T * 0.04, 0, 7); ctx.fill(); }); if (p.grow > 0) drawIcon(ctx, '🌱', cx, cy, T * 0.38); }
    else drawIcon(ctx, prog < 0.7 ? '🌱' : '🌿', cx, cy - T * 0.05, T * (0.4 + prog * 0.2));
    if (!p.watered && !p.ripe) drawIcon(ctx, '💧', X + T * 0.82, Y + T * 0.2, T * 0.26);
  }
}

function drawTray(ctx, g, sc, o, X, Y, T) {
  const a = ANIMALS[SCENES[sc.id].animal];
  const pen = g.pens[a.id];
  const full = o.tray === 'food' ? pen.food[o.slot] : pen.water[o.slot];
  const cx = X + T / 2;
  const cy = Y + T / 2;
  ctx.fillStyle = o.tray === 'food' ? '#8d6e63' : '#78909c'; rr(ctx, X + 5, Y + T * 0.25, T - 10, T * 0.5, 6); ctx.fill();
  ctx.fillStyle = full ? (o.tray === 'food' ? (a.food === 'hay' ? '#e6c25a' : a.food === 'feed_pig' ? '#f48fb1' : '#ffca28') : '#4fc3f7') : '#4e3b31';
  rr(ctx, X + 8, Y + T * 0.32, T - 16, T * 0.3, 4); ctx.fill();
  if (o.slot >= pen.animals.length) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(X + 4, Y + T * 0.22, T - 8, T * 0.56); }
  else if (!full) drawIcon(ctx, o.tray === 'food' ? '❗' : '💧', cx, cy - T * 0.3, T * 0.24);
}

function drawPenBuilding(ctx, g, o, X, Y, T) {
  const a = ANIMALS[o.animal];
  const pen = g.pens[a.id];
  const W = o.w * T;
  const H = o.h * T;
  const cx = X + W / 2;
  const cols = { chicken: ['#f6c453', '#c0392b'], pig: ['#f8bbd0', '#ad1457'], sheep: ['#eceff1', '#546e7a'], cow: ['#d7ccc8', '#5d4037'] }[a.id];
  if (!pen.owned) {
    const can = g.milestone >= a.pen.ms;
    ctx.strokeStyle = '#8d5a2b'; ctx.lineWidth = 4;
    ctx.strokeRect(X + 6, Y + 6, W - 12, H - 12);
    for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(X + 6 + i * (W - 12) / 6, Y + 6); ctx.lineTo(X + 6 + i * (W - 12) / 6, Y + 12); ctx.stroke(); }
    drawIcon(ctx, a.icon, cx, Y + H * 0.45, T * 0.6);
    label(ctx, can ? `${a.pen.chn} · 出售 ${a.pen.cost}元` : `🔒 ${a.pen.chn} · mốc ${a.pen.ms}`, cx, Y + H * 0.85, T, can ? '#fff8e1' : 'rgba(255,255,255,0.9)', can ? '#b45309' : '#757575');
    return;
  }
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(X + 6, Y + H - 4, W - 6, 6);
  ctx.fillStyle = cols[0]; ctx.fillRect(X + 4, Y + T * 0.55, W - 8, H - T * 0.55);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.strokeRect(X + 4, Y + T * 0.55, W - 8, H - T * 0.55);
  ctx.fillStyle = cols[1]; ctx.beginPath(); ctx.moveTo(X - 2, Y + T * 0.62); ctx.lineTo(X + T * 0.3, Y + T * 0.05); ctx.lineTo(X + W - T * 0.3, Y + T * 0.05); ctx.lineTo(X + W + 2, Y + T * 0.62); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6d4c41'; rr(ctx, cx - T * 0.32, Y + H - T * 0.8, T * 0.64, T * 0.8, 4); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - T * 0.32, Y + H - T * 0.8); ctx.lineTo(cx + T * 0.32, Y + H); ctx.moveTo(cx + T * 0.32, Y + H - T * 0.8); ctx.lineTo(cx - T * 0.32, Y + H); ctx.stroke();
  drawIcon(ctx, a.icon, X + T * 0.55, Y + T * 1.15, T * 0.5);
  label(ctx, `${a.pen.chn} ${pen.animals.length}${a.icon}`, cx, Y + T * 0.3, T);
  if (g.penNeedsCare(a.id)) drawIcon(ctx, '❗', X + W - T * 0.4, Y + T * 1.1, T * 0.4);
}

function drawTreeSlot(ctx, g, o, X, Y, T, t) {
  const tr = g.trees[o.idx];
  const cx = X + T / 2;
  const cy = Y + T / 2;
  ctx.fillStyle = 'rgba(110,70,30,0.35)'; ctx.beginPath(); ctx.ellipse(cx, cy + T * 0.25, T * 0.42, T * 0.18, 0, 0, 7); ctx.fill();
  if (!tr) { if (g.milestone >= 8) label(ctx, '＋树苗', cx, cy, T, 'rgba(255,255,255,0.85)', '#2e7d32'); return; }
  const f = FRUITS.find(x => x.id === tr.sp);
  if (tr.grow < f.grow) {
    drawIcon(ctx, tr.grow < f.grow / 2 ? '🌱' : '🌳', cx, cy, T * (0.45 + 0.4 * tr.grow / f.grow));
  } else {
    ctx.fillStyle = '#6d4c2c'; ctx.fillRect(cx - T * 0.08, cy, T * 0.16, T * 0.42);
    ctx.fillStyle = '#2e8b3e'; ctx.beginPath(); ctx.arc(cx, cy - T * 0.12, T * 0.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#3aa34c'; ctx.beginPath(); ctx.arc(cx - T * 0.15, cy - T * 0.25, T * 0.25, 0, 7); ctx.fill();
    if (tr.ripe) { [[-0.22, -0.2], [0.2, -0.05], [0.02, -0.38], [-0.05, 0.08]].slice(0, f.yield + 1).forEach(([a, b]) => drawIcon(ctx, f.icon, cx + a * T, cy + b * T, T * 0.28)); sparkle(ctx, cx, cy - T * 0.1, T, t); }
  }
  if (!tr.watered && !tr.ripe) drawIcon(ctx, '💧', X + T * 0.9, Y, T * 0.26);
}

// Vẽ toàn cảnh
function renderScene(ctx, g, view, t) {
  const sc = g.scene;
  const T = view.T;
  ctx.fillStyle = sc.id === 'forest' ? '#2f6b2b' : sc.id === 'farm' ? '#3f8c3a' : '#5d4037';
  ctx.fillRect(0, 0, view.cw, view.ch);
  const x0 = Math.max(0, Math.floor(-view.ox / T));
  const y0 = Math.max(0, Math.floor(-view.oy / T));
  const x1 = Math.min(sc.cols - 1, Math.ceil((view.cw - view.ox) / T));
  const y1 = Math.min(sc.rows - 1, Math.ceil((view.ch - view.oy) / T));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const ch = sc.base[y][x];
    if (ch === 't' || ch === 'b') drawTile(ctx, 'g', x, y, view.ox + x * T, view.oy + y * T, T, t, sc.id);
    else drawTile(ctx, ch, x, y, view.ox + x * T, view.oy + y * T, T, t, sc.id);
  }
  // mục tiêu đang đi tới
  if (g.walk && g.walk.target) {
    const [tx, ty] = g.walk.target;
    const p = 0.5 + 0.5 * Math.sin(t / 160);
    ctx.strokeStyle = `rgba(255,255,255,${0.5 + p * 0.4})`; ctx.lineWidth = 3;
    rr(ctx, view.ox + tx * T + 3, view.oy + ty * T + 3, T - 6, T - 6, 8); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    (g.walk.path || []).forEach(([px, py]) => { ctx.beginPath(); ctx.arc(view.ox + px * T + T / 2, view.oy + py * T + T / 2, T * 0.06, 0, 7); ctx.fill(); });
  }
  // vật thể + cây rừng + người, sắp theo hàng (y) để không che sai
  const items = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const ch = sc.base[y][x]; if (ch === 't' || ch === 'b') items.push({ y: y + 0.9, draw: () => drawTile(ctx, ch, x, y, view.ox + x * T, view.oy + y * T, T, t, sc.id) }); }
  sc.objs.forEach(o => items.push({ y: o.kind === 'poop' || o.kind === 'plot' || o.isPond ? o.y : o.y + o.h - 0.5, draw: () => drawObj(ctx, g, sc, o, view.ox + o.x * T, view.oy + o.y * T, T, t) }));
  if (sc.id === 'pen_chicken') g.pens.chicken.animals.forEach((an, i) => {
    const a = t / (2500 + i * 300) + i * 2;
    const hx = 6.5 + Math.cos(a) * 2.6 + (i % 2) * 0.4;
    const hy = 4.6 + Math.sin(a * 1.4) * 1.3;
    items.push({ y: hy + 0.4, draw: () => { drawIcon(ctx, '🐔', view.ox + hx * T, view.oy + hy * T - Math.abs(Math.sin(t / 200 + i)) * 3, T * 0.62); if (an.health < 40) drawIcon(ctx, '🤒', view.ox + hx * T + T * 0.3, view.oy + hy * T - T * 0.35, T * 0.26); } });
  });
  const pl = g.player;
  items.push({ y: pl.y + 0.95, draw: () => drawPlayer(ctx, view.ox + pl.x * T + T / 2, view.oy + pl.y * T + T * 0.45, T, pl.face, !!(g.walk && g.walk.moving), t) });
  items.sort((a, b) => a.y - b.y).forEach(it => it.draw());
  // chữ bay
  g.floaters = g.floaters.filter(f => t - f.t0 < 1600);
  g.floaters.forEach(f => {
    const k = (t - f.t0) / 1600;
    ctx.globalAlpha = 1 - k * k;
    label(ctx, f.text, view.ox + f.x * T + T / 2, view.oy + f.y * T - T * 0.4 - k * T * 0.8, T * 1.15, 'rgba(255,255,255,0.95)', f.color || '#c2410c');
    ctx.globalAlpha = 1;
  });
  // mưa
  if (g.weather === 'rain' && (sc.id === 'farm' || sc.id === 'forest')) {
    ctx.strokeStyle = 'rgba(200,230,255,0.55)'; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let i = 0; i < 70; i++) { const rx = (seeded(i, 1) * view.cw + t * 0.05 * (1 + seeded(i, 2))) % view.cw; const ry = (seeded(i, 3) * view.ch + t * 0.6) % view.ch; ctx.moveTo(rx, ry); ctx.lineTo(rx - 3, ry + 10); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(40,60,90,0.12)'; ctx.fillRect(0, 0, view.cw, view.ch);
  } else if (g.weather === 'cloudy' && (sc.id === 'farm' || sc.id === 'forest')) { ctx.fillStyle = 'rgba(80,90,110,0.1)'; ctx.fillRect(0, 0, view.cw, view.ch); }
}

// ============================================================================
// 6. MÁY CHỦ: TÀI KHOẢN, LƯU TIẾN TRÌNH, BẢNG XẾP HẠNG
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
// 7. GAME
// ============================================================================
const newAnimal = () => ({ health: 100, growth: 0, prog: 0, ready: false });
const SPEED = 4.2;   // ô / giây

class FarmGame {
  constructor() {
    this.audio = new FarmAudio();
    this.showPinyin = true;
    this.showVietnamese = true;
    this.autoVoice = true;
    this.inspect = false;
    this.floaters = [];
    this.walk = null;
    this.dirty = false;
    this.lastCloudSave = 0;
    this.view = { T: 40, ox: 0, oy: 0, cw: 0, ch: 0 };
    this.hover = null;
    const lu = GameCloud.localUser();
    this.owner = lu ? String(lu.email).toLowerCase().trim() : 'guest';
    this.cloud = { checked: false, loggedIn: false, offline: false, name: '', picture: '', best: null, history: [] };
    this.rankTab = 'global';
    const local = LocalSave.read(this.owner);
    if (!(local && this.applySnapshot(local))) this.newFarm();
    this.initDOM();
    this.fitStage();
    this.renderHUD();
    this.showTitleScreen();
    this.lastFrame = performance.now();
    const loop = (ts) => { this.frame(ts); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    this.cloudReady = this.initCloud().catch(() => {}).finally(() => {
      this.cloud.checked = true;
      this.renderAccountChip();
      if (this.isTitleVisible()) this.showTitleScreen();
    });
  }

  // --------------------------------------------------------------------------
  // Trạng thái
  // --------------------------------------------------------------------------
  resetState() {
    this.day = 1;
    this.weather = 'sunny';
    this.money = START.money;
    this.energy = ENERGY_MAX;
    this.milestone = 0;
    this.bag = { ...START.bag };
    this.fridge = {};
    this.plots = PLOT_POS.map((_, i) => ({ state: i === 0 ? 'grass' : 'locked', crop: null, grow: 0, watered: false, ripe: false }));
    this.trees = ORCHARD_POS.map(() => null);
    this.pens = {};
    ANIMAL_IDS.forEach(id => {
      const a = ANIMALS[id];
      this.pens[id] = { owned: id === 'chicken', animals: [], food: Array(a.slots).fill(false), water: Array(a.slots).fill(false), nests: Array(id === 'chicken' ? 6 : 0).fill(false), poops: [] };
    });
    this.pens.chicken.animals = [newAnimal(), newAnimal()];
    this.pens.chicken.nests[0] = true;
    this.pens.chicken.nests[1] = true;
    this.pond = { fish: [], fedToday: false };
    this.sceneId = 'farm';
    this.player = { x: 3, y: 5, face: 'down' };
    this.npc = null;
    this.stats = { harvests: 0, eggs: 0, pigFed: 0, forest: 0, trees: 0, fishCaught: 0, sold: 0, income: 0, cleaned: 0, talks: 0 };
    this.dayIncome = 0;
    this.learned = new Set(['农场', '你好']);
    this.records = [];
    this.savedAt = 0;
  }
  newFarm() { this.resetState(); this.refreshUnlocks(true); this.rebuild(); }

  snapshot() {
    return {
      v: SAVE_VERSION, updatedAt: Date.now(),
      day: this.day, weather: this.weather, money: this.money, energy: this.energy, milestone: this.milestone,
      bag: this.bag, fridge: this.fridge, plots: this.plots, trees: this.trees, pens: this.pens, pond: this.pond,
      sceneId: this.sceneId, player: { x: this.player.x, y: this.player.y, face: this.player.face },
      npc: this.npc, stats: this.stats, dayIncome: this.dayIncome,
      vocab: [...this.learned], records: this.records.slice(-60),
      settings: { pinyin: this.showPinyin, vi: this.showVietnamese, voice: this.autoVoice }
    };
  }
  applySnapshot(s) {
    if (!s || s.v !== SAVE_VERSION) return false;
    const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
    const int = (v, lo, hi, d) => clamp(Math.round(num(v, d)), lo, hi);
    const counts = (o, cap) => { const out = {}; if (o && typeof o === 'object') Object.keys(o).forEach(k => { if (ITEMS[k]) { const n = int(o[k], 0, cap, 0); if (n) out[k] = n; } }); return out; };
    this.resetState();
    this.day = int(s.day, 1, 100000, 1);
    this.weather = WEATHERS[s.weather] ? s.weather : 'sunny';
    this.money = int(s.money, 0, 1e9, START.money);
    this.energy = int(s.energy, 0, ENERGY_MAX, ENERGY_MAX);
    this.milestone = int(s.milestone, 0, MILESTONES.length, 0);
    this.bag = counts(s.bag, 9999);
    this.fridge = counts(s.fridge, 9999);
    if (Array.isArray(s.plots)) s.plots.slice(0, PLOT_POS.length).forEach((p, i) => {
      if (!p || typeof p !== 'object') return;
      const st = ['locked', 'sale', 'grass', 'tilled'].includes(p.state) ? p.state : 'locked';
      const crop = p.crop && ITEMS[p.crop] && ITEMS[p.crop].kind === 'crop' ? p.crop : null;
      this.plots[i] = { state: st, crop: st === 'tilled' ? crop : null, grow: int(p.grow, 0, 99, 0), watered: !!p.watered, ripe: !!p.ripe };
    });
    if (Array.isArray(s.trees)) s.trees.slice(0, ORCHARD_POS.length).forEach((t, i) => {
      if (t && FRUITS.some(f => f.id === t.sp)) this.trees[i] = { sp: t.sp, grow: int(t.grow, 0, 99, 0), prog: int(t.prog, 0, 99, 0), watered: !!t.watered, ripe: !!t.ripe };
    });
    if (s.pens && typeof s.pens === 'object') ANIMAL_IDS.forEach(id => {
      const src = s.pens[id];
      const a = ANIMALS[id];
      if (!src || typeof src !== 'object') return;
      const bools = (arr, n) => Array.from({ length: n }, (_, i) => !!(Array.isArray(arr) && arr[i]));
      this.pens[id] = {
        owned: id === 'chicken' ? true : !!src.owned,
        animals: (Array.isArray(src.animals) ? src.animals : []).slice(0, a.slots).map(an => ({ health: int(an && an.health, 0, 100, 100), growth: int(an && an.growth, 0, 999, 0), prog: int(an && an.prog, 0, 99, 0), ready: !!(an && an.ready) })),
        food: bools(src.food, a.slots), water: bools(src.water, a.slots), nests: bools(src.nests, id === 'chicken' ? 6 : 0),
        poops: (Array.isArray(src.poops) ? src.poops : []).filter(p => Array.isArray(p) && p.length === 2).slice(0, 10).map(([x, y]) => [int(x, 2, 10, 5), int(y, 2, 7, 4)])
      };
    });
    if (s.pond && typeof s.pond === 'object') this.pond = { fedToday: !!s.pond.fedToday, fish: (Array.isArray(s.pond.fish) ? s.pond.fish : []).filter(f => f && FISH.some(x => x.id === f.sp)).slice(0, POND_CAP).map(f => ({ sp: f.sp, age: int(f.age, 0, 999, 0) })) };
    this.sceneId = SCENES[s.sceneId] ? s.sceneId : 'farm';
    if (s.player) this.player = { x: int(s.player.x, 0, 30, 3), y: int(s.player.y, 0, 20, 5), face: ['up', 'down', 'left', 'right'].includes(s.player.face) ? s.player.face : 'down' };
    this.npc = s.npc && NPCS[s.npc.type] ? { type: s.npc.type, dlg: int(s.npc.dlg, 0, 99, 0), done: !!s.npc.done, good: s.npc.good || null, qty: int(s.npc.qty, 0, 20, 0) } : null;
    if (s.stats && typeof s.stats === 'object') Object.keys(this.stats).forEach(k => { this.stats[k] = int(s.stats[k], 0, 1e9, 0); });
    this.dayIncome = int(s.dayIncome, 0, 1e9, 0);
    if (Array.isArray(s.vocab)) s.vocab.forEach(w => { if (typeof w === 'string') this.learned.add(w); });
    this.records = Array.isArray(s.records) ? s.records.filter(r => r && Number.isFinite(Number(r.day))) : [];
    if (s.settings) { this.showPinyin = s.settings.pinyin !== false; this.showVietnamese = s.settings.vi !== false; this.autoVoice = s.settings.voice !== false; }
    this.savedAt = num(s.updatedAt, 0);
    this.refreshUnlocks(true);
    this.rebuild();
    const sc = this.scene;
    if (this.player.x >= sc.cols || this.player.y >= sc.rows || sc.block[this.player.y][this.player.x]) { this.sceneId = 'farm'; this.rebuild(); this.player = { x: 3, y: 5, face: 'down' }; }
    return true;
  }

  markDirty() { this.dirty = true; }
  saveNow(force = false) {
    if (!this.dirty && !force) return;
    const snap = this.snapshot();
    this.savedAt = snap.updatedAt;
    LocalSave.write(this.owner, snap);
    this.dirty = false;
    const t = Date.now();
    if (this.cloud.loggedIn && (force || t - this.lastCloudSave > 20000)) {
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
    const el = document.createElement('div');
    el.className = `g-toast ${kind}`;
    el.innerHTML = `<span class="t-icon">${icon}</span><span>${escapeHtml(text)}</span>`;
    box.appendChild(el);
    while (box.children.length > (this.isPortrait ? 1 : 2)) box.firstChild.remove();
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 3000);
  }
  warn(icon, text) { this.audio.error(); this.showToast(icon, text, 'warn'); }
  learn(word) {
    if (!word || this.learned.has(word)) return;
    if (!VOCAB_INDEX[word]) return;
    this.learned.add(word);
    this.setText('hud-vocab-val', `${this.learnedCount()}/${VOCAB_TOTAL}`);
    this.markDirty();
  }
  learnedCount() { return Object.keys(VOCAB_INDEX).filter(w => this.learned.has(w)).length; }
  say(word) { if (this.autoVoice) this.audio.speak(word); }
  float(text, color) { this.floaters.push({ text, x: this.player.x, y: this.player.y, t0: performance.now(), color }); }
  // nói + hiện chữ bay cho 1 hành động (vd 浇水)
  actWord(chn, extra = '') {
    const w = wordOf(chn);
    this.learn(chn);
    this.float(`${chn}${w && this.showPinyin ? ` ${w.pin}` : ''}${extra}`);
    this.say(chn);
  }
  isModalOpen() { return [...document.querySelectorAll('.g-modal')].some(m => m.style.display === 'flex'); }
  isTitleVisible() { const t = this.$('title-screen'); return !!t && !t.classList.contains('hidden'); }
  openModal(id) { const m = this.$(id); if (m) m.style.display = 'flex'; }
  closeModal(id) { const m = this.$(id); if (m) m.style.display = 'none'; }
  isOpen(id) { const m = this.$(id); return !!m && m.style.display === 'flex'; }
  wordLine(w) {
    return `<div class="w-line"><b class="zh">${escapeHtml(w.zh || w.chn)}</b><button type="button" class="say-btn" data-say-chn="${escapeHtml(w.zh || w.chn)}" title="Nghe"><i class="fa-solid fa-volume-high"></i></button>
      ${this.showPinyin ? `<div class="w-pin">${escapeHtml(w.pin)}</div>` : ''}${this.showVietnamese ? `<div class="w-vi">${escapeHtml(w.vi)}</div>` : ''}</div>`;
  }

  // --------------------------------------------------------------------------
  // Túi đồ, tủ lạnh, tiền, năng lượng
  // --------------------------------------------------------------------------
  has(id, n = 1) { return (this.bag[id] || 0) >= n; }
  bagUsed() { return Object.keys(this.bag).reduce((s, k) => s + (countsInBag(ITEMS[k]) ? this.bag[k] : 0), 0); }
  fridgeUsed() { return Object.values(this.fridge).reduce((s, n) => s + n, 0); }
  bagFree() { return BAG_CAP - this.bagUsed(); }
  canAdd(id, n) {
    const it = ITEMS[id];
    if (it.kind === 'water') return (this.bag.water || 0) + n <= WATER_CAP;
    if (it.kind === 'tool') return !this.has(id);
    if (!countsInBag(it)) return true;
    return this.bagFree() >= n;
  }
  give(id, n) { this.bag[id] = (this.bag[id] || 0) + n; this.markDirty(); }
  take(id, n = 1) {
    if ((this.bag[id] || 0) < n) return false;
    this.bag[id] -= n;
    if (!this.bag[id]) delete this.bag[id];
    this.markDirty();
    return true;
  }
  // lấy nguyên liệu: ưu tiên tủ lạnh rồi túi
  stockAll(id) { return (this.bag[id] || 0) + (this.fridge[id] || 0); }
  takeAny(id, n = 1) {
    if (this.stockAll(id) < n) return false;
    const f = Math.min(this.fridge[id] || 0, n);
    if (f) { this.fridge[id] -= f; if (!this.fridge[id]) delete this.fridge[id]; }
    if (n - f) this.take(id, n - f);
    this.markDirty();
    return true;
  }
  needEnergy(n) {
    if (this.energy >= n) return true;
    this.learn('累');
    this.learn('体力');
    this.warn('😩', `累了！Không đủ năng lượng (cần ${n}, còn ${this.energy}). Vào nhà ăn món ăn ở 饭桌 hoặc lên giường ngủ.`);
    this.say('我累了');
    return false;
  }
  useEnergy(n) { this.energy = clamp(this.energy - n, 0, ENERGY_MAX); this.renderHUD(); this.markDirty(); }
  addMoney(n, sold = 0) {
    this.money += n;
    if (n > 0) { this.stats.income += n; this.dayIncome += n; this.stats.sold += sold; }
    this.audio.coin();
    this.renderHUD();
    this.markDirty();
  }
  animalCount(id) { return this.pens[id].owned ? this.pens[id].animals.length : 0; }
  maxAnimals(id) {
    if (id === 'chicken') return this.milestone >= 2 ? 5 : 2;
    return this.milestone >= ANIMALS[id].pen.ms ? 2 : 0;
  }
  plotsAllowed() { return this.milestone >= 6 ? 8 : this.milestone >= 1 ? 2 : 1; }
  penNeedsCare(id) {
    const p = this.pens[id];
    if (!p.owned) return false;
    return p.animals.some((_, i) => !p.food[i] || !p.water[i]) || p.poops.length > 0 || p.nests.some(Boolean) || p.animals.some(a => a.ready);
  }

  // Mở mốc phát triển kế tiếp (có thể mở liên tiếp nhiều mốc)
  refreshUnlocks(silent = false) {
    const gained = [];
    while (this.milestone < MILESTONES.length && MILESTONES[this.milestone].test(this)) { this.milestone += 1; gained.push(MILESTONES[this.milestone - 1]); }
    const allowed = this.plotsAllowed();
    this.plots.forEach((p, i) => { if (i < allowed && p.state === 'locked') p.state = 'sale'; });
    if (gained.length) {
      this.markDirty();
      this.rebuild();
      if (!silent) this.showMilestones(gained);
    }
    return gained;
  }

  // --------------------------------------------------------------------------
  // Khu vực & di chuyển
  // --------------------------------------------------------------------------
  rebuild() { this.scene = buildScene(this, this.sceneId); }
  changeScene(id, x, y, face = 'down') {
    this.sceneId = id;
    this.walk = null;
    this.rebuild();
    this.player = { x, y, face };
    this.audio.door();
    if (id === 'forest') { this.stats.forest += 1; this.learn('后院'); this.learn('树林'); }
    this.learn(SCENES[id].chn);
    this.renderHUD();
    this.markDirty();
    this.refreshUnlocks();
  }

  // Nhấp vào bản đồ
  onMapClick(tx, ty) {
    if (this.isModalOpen() || this.isTitleVisible()) return;
    const sc = this.scene;
    if (tx < 0 || ty < 0 || tx >= sc.cols || ty >= sc.rows) return;
    this.audio.init();
    const o = objAt(sc, tx, ty);
    if (this.inspect) { this.inspectAt(o, tx, ty); return; }
    if (o) { this.interact(o, tx, ty); return; }
    if (sc.block[ty][tx]) { this.warn('🚧', 'Không đi vào ô này được (cây, tường hoặc vật cản).'); return; }
    this.walkTo([[tx, ty]], null, [tx, ty]);
  }

  // Tìm đường tới 1 trong các ô đích; onArrive chạy khi tới nơi (lệnh mới thay lệnh cũ)
  walkTo(goals, onArrive, target) {
    const w = this.walk;
    const from = w && w.to ? w.to : [this.player.x, this.player.y];
    const path = findPath(this.scene, from, goals);
    if (!path) { this.warn('🚫', 'Không có đường đi tới đó — thử chỗ khác nhé.'); return false; }
    if (w && w.to) { w.queue = path; w.onArrive = onArrive; w.target = target; w.path = path; }
    else this.walk = { queue: path, onArrive, target, path, to: null, from: null, k: 0, moving: false };
    if (!path.length && !(w && w.to)) this.arrive();
    return true;
  }
  arrive() {
    const w = this.walk;
    this.walk = null;
    if (w && w.onArrive) w.onArrive();
  }
  updateWalk(dt) {
    const w = this.walk;
    if (!w) return;
    if (!w.to) {
      if (!w.queue.length) { this.arrive(); return; }
      w.from = [this.player.x, this.player.y];
      w.to = w.queue.shift();
      w.k = 0;
      w.moving = true;
      const dx = w.to[0] - w.from[0];
      const dy = w.to[1] - w.from[1];
      this.player.face = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
    }
    w.k += dt * SPEED;
    if (w.k >= 1) {
      this.player.x = w.to[0];
      this.player.y = w.to[1];
      w.to = null;
      w.path = w.queue;
      if (Math.random() < 0.5) this.audio.step();
      if (!w.queue.length) { w.moving = false; this.arrive(); }
      return;
    }
    this.player.x = w.from[0] + (w.to[0] - w.from[0]) * w.k;
    this.player.y = w.from[1] + (w.to[1] - w.from[1]) * w.k;
  }
  faceTo(o) {
    const cx = o.x + (o.w - 1) / 2;
    const cy = o.y + (o.h - 1) / 2;
    const dx = cx - this.player.x;
    const dy = cy - this.player.y;
    this.player.face = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  }
  // đi tới vật rồi làm việc
  goDo(o, fn, tx, ty) {
    const goals = standTiles(this.scene, o, tx, ty);
    if (o.isPond && tx != null) goals.sort((a, b) => (Math.abs(a[0] - tx) + Math.abs(a[1] - ty)) - (Math.abs(b[0] - tx) + Math.abs(b[1] - ty)));
    const pick = o.isPond && tx != null ? goals.slice(0, 4) : goals;
    this.walkTo(pick, () => { this.faceTo(o.isPond && tx != null ? { x: tx, y: ty, w: 1, h: 1 } : o); fn(); }, [o.x, o.y]);
  }

  // --------------------------------------------------------------------------
  // Khung hình
  // --------------------------------------------------------------------------
  frame(ts) {
    const dt = Math.min(0.05, (ts - this.lastFrame) / 1000);
    this.lastFrame = ts;
    if (this.isTitleVisible()) return;
    if (!this.isModalOpen()) this.updateWalk(dt);
    this.layoutView();
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    renderScene(ctx, this, this.view, ts);
    if (this.hover && !this.walk) {
      const [hx, hy] = this.hover;
      const T = this.view.T;
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(this.view.ox + hx * T + 2, this.view.oy + hy * T + 2, T - 4, T - 4);
      ctx.setLineDash([]);
    }
    if (ts - (this._lastSave || 0) > 8000) { this._lastSave = ts; this.saveNow(); }
  }
  layoutView() {
    const cv = this.$('farm-canvas');
    if (!cv) return;
    const wrap = cv.parentElement;
    const cw = wrap.clientWidth;
    const ch = wrap.clientHeight;
    const dpr = Math.min(2.5, (window.devicePixelRatio || 1) * (this.stageScale || 1));
    if (cv.width !== Math.round(cw * dpr) || cv.height !== Math.round(ch * dpr)) {
      cv.width = Math.round(cw * dpr);
      cv.height = Math.round(ch * dpr);
      cv.style.width = `${cw}px`;
      cv.style.height = `${ch}px`;
    }
    this.ctx = this.ctx || cv.getContext('2d');
    this.dpr = dpr;
    const sc = this.scene;
    const fit = Math.min(cw / sc.cols, ch / sc.rows);
    // vừa khung thì hiện cả bản đồ; màn hẹp (điện thoại dọc) thì phóng ô cho kín chiều cao, camera đi theo nhân vật
    const T = fit >= MIN_TILE ? Math.floor(fit) : clamp(Math.floor(ch / sc.rows), MIN_TILE, 58);
    const mw = sc.cols * T;
    const mh = sc.rows * T;
    const px = (this.player.x + 0.5) * T;
    const py = (this.player.y + 0.5) * T;
    const ox = mw <= cw ? (cw - mw) / 2 : clamp(cw / 2 - px, cw - mw, 0);
    const oy = mh <= ch ? (ch - mh) / 2 : clamp(ch / 2 - py, ch - mh, 0);
    this.view = { T, ox, oy, cw, ch };
  }
  eventTile(e) {
    const cv = this.$('farm-canvas');
    const r = cv.getBoundingClientRect();
    const k = cv.clientWidth / r.width;
    const x = (e.clientX - r.left) * k;
    const y = (e.clientY - r.top) * k;
    return [Math.floor((x - this.view.ox) / this.view.T), Math.floor((y - this.view.oy) / this.view.T)];
  }

  // --------------------------------------------------------------------------
  // Tương tác: kiểm tra điều kiện TRƯỚC khi đi, đi tới ô đứng, tới nơi kiểm tra lại rồi làm
  // --------------------------------------------------------------------------
  interact(o, tx, ty) {
    const k = o.kind;
    if (k === 'plot') return this.tapPlot(o);
    if (k === 'well') {
      if ((this.bag.water || 0) >= WATER_CAP) return this.warn('💧', `Túi đã đầy nước (${WATER_CAP} phần).`);
      if (!this.needEnergy(ENERGY.draw)) return;
      return this.goDo(o, () => this.drawWater());
    }
    if (k === 'house') return this.goDo(o, () => { this.learn('门'); this.changeScene('house', 6, 6, 'up'); });
    if (k === 'booth') return this.goDo(o, () => this.openMarket(o.booth));
    if (k === 'pen') return this.tapPen(o);
    if (k === 'exit') return this.tapExit(o);
    if (k === 'gate') return this.showToast('🚪', '农场 nóngchǎng · Cổng nông trại. Thỉnh thoảng có người ghé thăm ở đây.');
    if (k === 'npc') return this.goDo(o, () => this.openDialogue());
    if (k === 'bed') return this.goDo(o, () => this.askSleep());
    if (k === 'stove') return this.goDo(o, () => this.openKitchen());
    if (k === 'fridge') return this.goDo(o, () => this.openFridge());
    if (k === 'table') return this.goDo(o, () => this.openEat());
    if (k === 'tray') return this.tapTray(o);
    if (k === 'nest') return this.tapNest(o);
    if (k === 'animal') return this.tapAnimal(o);
    if (k === 'poop') {
      if (!this.needEnergy(ENERGY.clean)) return;
      return this.goDo(o, () => this.cleanPoop(o.idx));
    }
    if (k === 'tree') return this.tapTree(o);
    if (k === 'feeder') {
      if (this.milestone < 9) return this.warn('🔒', 'Ao cá mở ở mốc 9 (trồng 2 cây ăn quả).');
      return this.goDo(o, () => this.openPond());
    }
    if (k === 'pond') return this.tapPond(o, tx, ty);
    return null;
  }

  // ---- giếng
  drawWater() {
    if (!this.needEnergy(ENERGY.draw)) return;
    const n = Math.min(WELL_DRAW, WATER_CAP - (this.bag.water || 0));
    if (n <= 0) return;
    this.give('water', n);
    this.useEnergy(ENERGY.draw);
    this.audio.water();
    this.actWord('打水', ` +${n}💧`);
    this.learn('井');
  }

  // ---- ruộng
  tapPlot(o) {
    const p = this.plots[o.idx];
    if (p.state === 'locked') return this.warn('🔒', `Ô đất này chưa mở. ${this.milestone < 1 ? 'Mốc 1: thu hoạch rau 1 lần và nhặt 2 trứng.' : 'Mốc 6: có bò trong chuồng.'}`);
    if (p.state === 'sale') return this.goDo(o, () => this.confirm('🟫 Mua ô đất', `<p>Mua thêm 1 ô <b class="zh">菜地</b> càidì (ô đất trồng rau) giá <b>${PLOT_PRICE}元</b>?</p>`, '买 Mua', () => {
      if (this.money < PLOT_PRICE) return this.warn('💰', `Chưa đủ tiền (cần ${PLOT_PRICE}元).`);
      this.money -= PLOT_PRICE;
      p.state = 'grass';
      this.learn('菜地');
      this.audio.unlock();
      this.showToast('🟫', `Đã mua ô đất mới! Dùng 锄头 cuốc đất rồi gieo hạt nhé.`);
      this.renderHUD();
      this.markDirty();
    }));
    if (p.state === 'grass') {
      if (!this.has('hoe')) return this.warn('⛏️', 'Cần 锄头 chútou (cái cuốc) — mua ở quầy 工具.');
      if (!this.needEnergy(ENERGY.hoe)) return;
      return this.goDo(o, () => {
        if (!this.needEnergy(ENERGY.hoe)) return;
        p.state = 'tilled';
        this.useEnergy(ENERGY.hoe);
        this.audio.dig();
        this.actWord('锄地');
        this.markDirty();
      });
    }
    if (!p.crop) {
      const seeds = Object.keys(this.bag).filter(k => ITEMS[k].kind === 'seed');
      if (!seeds.length) return this.warn('🌱', 'Túi không có hạt giống — mua ở quầy 种子 trong chợ.');
      if (!this.needEnergy(ENERGY.plant)) return;
      const plant = (sid) => this.goDo(o, () => {
        if (p.crop || !this.take(sid, 1) || !this.needEnergy(ENERGY.plant)) return;
        p.crop = ITEMS[sid].seedOf;
        p.grow = 0;
        p.ripe = false;
        p.watered = this.weather === 'rain';
        this.useEnergy(ENERGY.plant);
        this.audio.plant();
        this.learn('种子');
        this.learn(ITEMS[p.crop].chn);
        this.actWord('播种');
        this.markDirty();
      });
      if (seeds.length === 1) return plant(seeds[0]);
      return this.pick('🌱 <span class="zh">播种</span> · Chọn hạt giống', seeds.map(id => ({ id, icon: ITEMS[id].icon, chn: ITEMS[id].chn, pin: ITEMS[id].pin, vi: ITEMS[id].vi, note: `×${this.bag[id]} · ${CROPS.find(c => c.id === ITEMS[id].seedOf).days} ngày` })), plant);
    }
    const c = itemOf(p.crop);
    if (p.ripe) {
      if (this.bagFree() < c.yield) return this.warn('🎒', `Túi đầy (${this.bagUsed()}/${BAG_CAP}). Cất đồ vào 冰箱 trong nhà hoặc bán ở chợ.`);
      if (!this.needEnergy(ENERGY.harvest)) return;
      return this.goDo(o, () => {
        if (!p.ripe || this.bagFree() < c.yield || !this.needEnergy(ENERGY.harvest)) return;
        this.give(c.id, c.yield);
        p.crop = null; p.ripe = false; p.grow = 0; p.watered = false; p.state = 'grass';
        this.stats.harvests += 1;
        this.useEnergy(ENERGY.harvest);
        this.audio.harvest();
        this.learn(c.chn);
        this.learn('成熟');
        this.actWord('收获', ` +${c.yield}${c.icon.startsWith('svg:') ? '' : c.icon}`);
        this.refreshUnlocks();
      });
    }
    if (p.watered) return this.showToast(c.icon, `${c.chn} ${c.pin} · ${c.vi}: đã tưới hôm nay. Còn ${c.days - p.grow} ngày được tưới nữa thì chín.`);
    if (!this.has('can')) return this.warn('🚿', 'Cần 喷壶 pēnhú (bình tưới) — mua ở quầy 工具.');
    if (!this.has('water')) return this.warn('💧', 'Hết nước! Ra 井 (giếng) múc nước trước.');
    if (!this.needEnergy(ENERGY.water)) return;
    return this.goDo(o, () => {
      if (p.watered || !this.take('water', 1) || !this.needEnergy(ENERGY.water)) return;
      p.watered = true;
      this.useEnergy(ENERGY.water);
      this.audio.water();
      this.actWord('浇水');
      this.markDirty();
    });
  }

  // ---- chuồng (bên ngoài)
  tapPen(o) {
    const a = ANIMALS[o.animal];
    const pen = this.pens[a.id];
    if (pen.owned) return this.goDo(o, () => this.changeScene(`pen_${a.id}`, 6, 7, 'up'));
    if (this.milestone < a.pen.ms) return this.warn('🔒', `${a.pen.chn} (${a.pen.vi}) mở ở mốc ${a.pen.ms}: ${MILESTONES[a.pen.ms - 1].need}.`);
    return this.goDo(o, () => this.confirm(`${a.icon} Mua ${a.pen.vi}`, `<p>Xây <b class="zh">${a.pen.chn}</b> ${a.pen.pin} (${a.pen.vi}) giá <b>${a.pen.cost}元</b>?</p><p class="farm-note">Mua chuồng xong, ra quầy <b class="zh">动物</b> ở chợ mua ${a.vi} (tối đa ${this.maxAnimals(a.id)} con).</p>`, '买 Mua', () => {
      if (this.money < a.pen.cost) return this.warn('💰', `Chưa đủ tiền (cần ${a.pen.cost}元).`);
      this.money -= a.pen.cost;
      pen.owned = true;
      this.learn(a.pen.chn);
      this.audio.unlock();
      this.showToast(a.icon, `Đã xây ${a.pen.chn}! Ra quầy 动物 mua ${a.vi} nhé.`);
      this.rebuild();
      this.renderHUD();
      this.markDirty();
    }));
  }
  tapExit(o) {
    if (o.to === 'forest') {
      if (this.milestone < 7) return this.warn('🔒', `Lối ra sau nhà mở ở mốc 7: ${MILESTONES[6].need} (đã ${this.stats.harvests}/15).`);
      return this.goDo(o, () => this.changeScene('forest', 11, 1, 'down'));
    }
    return this.goDo(o, () => {
      const from = this.sceneId;
      if (from === 'house') this.changeScene('farm', 3, 4, 'down');
      else if (from === 'forest') this.changeScene('farm', 22, 12, 'left');
      else { const a = SCENES[from].animal; this.changeScene('farm', PEN_X[a] + 1, 8, 'down'); }
    });
  }

  // ---- trong chuồng
  penHere() { const a = SCENES[this.sceneId].animal; return a ? { a: ANIMALS[a], pen: this.pens[a] } : null; }
  tapTray(o) {
    const { a, pen } = this.penHere();
    if (o.slot >= pen.animals.length) return this.warn(a.icon, `Ô này chưa có ${a.vi}. Mua thêm ở quầy 动物 trong chợ.`);
    const isFood = o.tray === 'food';
    const arr = isFood ? pen.food : pen.water;
    if (arr[o.slot]) return this.showToast(isFood ? '🍽️' : '💧', `${isFood ? '食槽 khay thức ăn' : '水槽 khay nước'} số ${o.slot + 1} đã đầy cho hôm nay.`);
    const need = isFood ? a.food : 'water';
    if (!this.has(need)) return this.warn(itemOf(need).icon.startsWith('svg:') ? '🎒' : itemOf(need).icon, isFood ? `Túi hết ${itemOf(need).chn} (${itemOf(need).vi}) — mua ở quầy 饲料.` : 'Túi hết nước — ra 井 múc nước.');
    if (!this.needEnergy(ENERGY.fill)) return;
    return this.goDo(o, () => {
      if (arr[o.slot] || !this.take(need, 1) || !this.needEnergy(ENERGY.fill)) return;
      arr[o.slot] = true;
      this.useEnergy(ENERGY.fill);
      if (isFood && a.id === 'pig') this.stats.pigFed += 1;
      if (a.id === 'chicken') this.audio.cluck(); else this.audio.pop();
      this.learn(isFood ? '食槽' : '水槽');
      this.learn(itemOf(need).chn);
      this.actWord(isFood ? '喂' : '加水');
      this.markDirty();
      this.refreshUnlocks();
    });
  }
  tapNest(o) {
    const pen = this.pens.chicken;
    if (!pen.nests[o.slot]) return this.showToast('🪺', `鸡窝 jīwō (ổ gà) số ${o.slot + 1} chưa có trứng. Gà được ăn & uống đủ hôm nay thì sáng mai đẻ trứng.`);
    if (this.bagFree() < 1) return this.warn('🎒', 'Túi đầy — cất bớt vào 冰箱.');
    return this.goDo(o, () => {
      if (!pen.nests[o.slot] || this.bagFree() < 1) return;
      pen.nests[o.slot] = false;
      this.give('egg', 1);
      this.stats.eggs += 1;
      this.audio.harvest();
      this.learn('鸡蛋');
      this.learn('鸡窝');
      this.actWord('捡鸡蛋', ' +1🥚');
      this.refreshUnlocks();
    });
  }
  tapAnimal(o) {
    const { a, pen } = this.penHere();
    const an = pen.animals[o.slot];
    if (!an) return;
    this.learn(a.chn);
    if (an.ready && a.product) {
      const prod = itemOf(a.product);
      if (!this.has(a.tool)) return this.warn(prod.icon.startsWith('svg:') ? '🧰' : prod.icon, `Cần ${itemOf(a.tool).chn} ${itemOf(a.tool).pin} (${itemOf(a.tool).vi}) để lấy ${prod.chn} — mua ở quầy 工具.`);
      if (this.bagFree() < 1) return this.warn('🎒', 'Túi đầy — cất bớt vào 冰箱.');
      if (!this.needEnergy(ENERGY.collect)) return;
      return this.goDo(o, () => {
        if (!an.ready || this.bagFree() < 1 || !this.needEnergy(ENERGY.collect)) return;
        an.ready = false;
        this.give(prod.id, 1);
        this.useEnergy(ENERGY.collect);
        this.audio.harvest();
        this.learn(prod.chn);
        this.actWord(prod.chn, ' +1');
      });
    }
    const fed = pen.food[o.slot] && pen.water[o.slot];
    const extra = a.id === 'pig' ? ` · lớn ${Math.min(an.growth, a.growDays)}/${a.growDays} ngày${an.growth >= a.growDays ? ' (长大了 — bán được giá cao ở quầy 动物)' : ''}`
      : a.product ? ` · ${itemOf(a.product).chn} sau ${Math.max(0, a.cycle - an.prog)} ngày được chăm` : '';
    this.say(a.chn);
    this.showToast(a.icon, `${a.chn} ${a.pin} · ${a.vi} số ${o.slot + 1}: ${an.health >= 70 ? '健康 khỏe' : an.health >= 40 ? 'hơi yếu' : '🤒 ốm — cho ăn, uống, dọn chuồng'} (${an.health}%) · hôm nay ${fed ? 'đã no' : '饿 còn đói/khát'}${extra}`);
    return null;
  }
  cleanPoop(idx) {
    const { pen } = this.penHere();
    if (!pen.poops[idx] || !this.needEnergy(ENERGY.clean)) return;
    pen.poops.splice(idx, 1);
    this.stats.cleaned += 1;
    this.useEnergy(ENERGY.clean);
    this.audio.pop();
    this.learn('粪便');
    this.actWord('打扫');
    this.rebuild();
    this.markDirty();
  }

  // ---- vườn cây ăn quả
  tapTree(o) {
    const tr = this.trees[o.idx];
    if (this.milestone < 8) return this.warn('🔒', 'Vườn cây mở quyền mua cây giống ở mốc 8.');
    if (!tr) {
      const saps = Object.keys(this.bag).filter(k => ITEMS[k].kind === 'sapling');
      if (!saps.length) return this.warn('🌱', 'Túi không có 树苗 (cây giống) — mua ở quầy 种子 trong chợ.');
      if (!this.needEnergy(ENERGY.tree)) return;
      const plant = (sid) => this.goDo(o, () => {
        if (this.trees[o.idx] || !this.take(sid, 1) || !this.needEnergy(ENERGY.tree)) return;
        this.trees[o.idx] = { sp: ITEMS[sid].sapOf, grow: 0, prog: 0, watered: this.weather === 'rain', ripe: false };
        this.stats.trees += 1;
        this.useEnergy(ENERGY.tree);
        this.audio.plant();
        this.learn('树苗');
        this.learn('果树');
        this.actWord('播种');
        this.refreshUnlocks();
      });
      if (saps.length === 1) return plant(saps[0]);
      return this.pick('🌱 Chọn cây giống', saps.map(id => ({ id, icon: FRUITS.find(f => f.id === ITEMS[id].sapOf).icon, chn: ITEMS[id].chn, pin: ITEMS[id].pin, vi: ITEMS[id].vi, note: `×${this.bag[id]}` })), plant);
    }
    const f = FRUITS.find(x => x.id === tr.sp);
    if (tr.ripe) {
      if (this.bagFree() < f.yield) return this.warn('🎒', 'Túi đầy — cất bớt vào 冰箱.');
      if (!this.needEnergy(ENERGY.harvest)) return;
      return this.goDo(o, () => {
        if (!tr.ripe || this.bagFree() < f.yield || !this.needEnergy(ENERGY.harvest)) return;
        tr.ripe = false; tr.prog = 0;
        this.give(f.id, f.yield);
        this.useEnergy(ENERGY.harvest);
        this.audio.harvest();
        this.learn(f.chn);
        this.learn('水果');
        this.actWord('收获', ` +${f.yield}${f.icon}`);
      });
    }
    if (tr.watered) return this.showToast(f.icon, `${f.chn}树: đã tưới hôm nay. ${tr.grow < f.grow ? `Còn ${f.grow - tr.grow} ngày tưới nữa thì trưởng thành.` : `Còn ${f.regrow - tr.prog} ngày tưới nữa thì có quả.`}`);
    if (!this.has('can')) return this.warn('🚿', 'Cần 喷壶 (bình tưới).');
    if (!this.has('water')) return this.warn('💧', 'Hết nước! Về 井 (giếng) ở nông trại múc nước.');
    if (!this.needEnergy(ENERGY.water)) return;
    return this.goDo(o, () => {
      if (tr.watered || !this.take('water', 1) || !this.needEnergy(ENERGY.water)) return;
      tr.watered = true;
      this.useEnergy(ENERGY.water);
      this.audio.water();
      this.actWord('浇水');
      this.markDirty();
    });
  }

  // ---- ao cá: câu cá
  matureFish() { return this.pond.fish.filter(f => f.age >= FISH.find(s => s.id === f.sp).days); }
  tapPond(o, tx, ty) {
    if (this.milestone < 9) return this.warn('🔒', 'Ao cá mở ở mốc 9 (trồng 2 cây ăn quả).');
    if (!this.has('rod')) return this.warn('🎣', 'Cần 鱼竿 yúgān (cần câu) — mua ở quầy 工具.');
    if (!this.has('bait')) return this.warn('🪱', 'Hết 鱼饵 yú\'ěr (mồi câu) — mua ở quầy 工具.');
    if (!this.pond.fish.length) return this.warn('🐟', 'Ao chưa có cá. Mua 鱼苗 (cá giống) ở quầy 种子 rồi thả ở bảng 鱼塘.');
    if (!this.matureFish().length) return this.warn('🐟', 'Chưa có con cá nào đủ lớn. Cho cá ăn mỗi ngày ở bảng 鱼塘.');
    if (this.bagFree() < 1) return this.warn('🎒', 'Túi đầy — cất bớt vào 冰箱.');
    if (!this.needEnergy(ENERGY.fish)) return;
    return this.goDo(o, () => this.startFishing(), tx, ty);
  }

  // --------------------------------------------------------------------------
  // Ngủ → ngày mới
  // --------------------------------------------------------------------------
  askSleep() {
    this.learn('床');
    this.confirm('🛏️ <span class="zh">睡觉</span> · Đi ngủ', `<p>Đi ngủ và chuyển sang <b>第${this.day + 1}天</b> (ngày ${this.day + 1})?</p><p class="farm-note">Cây đã tưới sẽ lớn thêm 1 ngày; vật nuôi được ăn & uống đủ sẽ cho sản phẩm. Khay ăn/nước trong chuồng sẽ hết và cần thêm lại. Đồ trong túi được giữ nguyên.</p>`, '睡觉 Ngủ', () => this.sleep());
  }
  sleep() {
    const sum = [];
    let grown = 0;
    let ripe = 0;
    this.plots.forEach(p => {
      if (p.crop && !p.ripe && p.watered) { p.grow += 1; grown += 1; if (p.grow >= itemOf(p.crop).days) { p.ripe = true; ripe += 1; } }
      p.watered = false;
    });
    if (grown) sum.push(`🌱 ${grown} ô rau lớn thêm${ripe ? `, <b>${ripe} ô đã chín</b> ✨` : ''}.`);
    let fruits = 0;
    this.trees.forEach(tr => {
      if (!tr) return;
      const f = FRUITS.find(x => x.id === tr.sp);
      if (tr.watered && !tr.ripe) {
        if (tr.grow < f.grow) tr.grow += 1;
        else { tr.prog += 1; if (tr.prog >= f.regrow) { tr.ripe = true; fruits += 1; } }
      }
      tr.watered = false;
    });
    if (fruits) sum.push(`🍎 ${fruits} cây ăn quả có quả chín.`);
    ANIMAL_IDS.forEach(id => {
      const a = ANIMALS[id];
      const pen = this.pens[id];
      if (!pen.owned || !pen.animals.length) return;
      let fedN = 0;
      let made = 0;
      pen.animals.forEach((an, i) => {
        const fed = pen.food[i] && pen.water[i];
        if (fed) { fedN += 1; an.health = clamp(an.health + 10, 0, 100); an.growth += 1; if (a.cycle) an.prog += 1; } else an.health = clamp(an.health - 20, 0, 100);
        an.health = clamp(an.health - 5 * pen.poops.length, 0, 100);
        if (a.cycle && fed && an.health >= 40 && an.prog >= a.cycle) {
          an.prog = 0;
          if (id === 'chicken') { if (!pen.nests[i]) { pen.nests[i] = true; made += 1; } } else if (!an.ready) { an.ready = true; made += 1; }
        }
      });
      pen.food = pen.food.map(() => false);
      pen.water = pen.water.map(() => false);
      pen.animals.forEach(() => {
        if (Math.random() < 0.5 && pen.poops.length < 8) {
          const spots = [];
          for (let y = 3; y <= 6; y++) for (let x = 3; x <= 9; x++) if (!pen.poops.some(p => p[0] === x && p[1] === y) && !(id !== 'chicken' && y <= 3 && (x === 4 || x === 8))) spots.push([x, y]);
          const s = pickOne(spots);
          if (s) pen.poops.push(s);
        }
      });
      const sick = pen.animals.filter(an => an.health < 40).length;
      sum.push(`${a.icon} ${a.pen.chn}: ${fedN}/${pen.animals.length} con được chăm đủ${made ? ` · có <b>${made} ${itemOf(a.product).chn}</b>` : ''}${sick ? ` · <span class="bad">${sick} con 🤒 yếu</span>` : ''}${pen.poops.length ? ` · ${pen.poops.length} chỗ phân cần dọn` : ''}.`);
    });
    if (this.pond.fish.length) {
      if (this.pond.fedToday) { this.pond.fish.forEach(f => { f.age += 1; }); sum.push(`🐟 Cá trong ao lớn thêm 1 ngày (${this.matureFish().length} con câu được).`); } else sum.push('🐟 Hôm qua cá chưa được cho ăn nên không lớn.');
      this.pond.fedToday = false;
    }
    this.records.push({ day: this.day, earnings: this.dayIncome, date: new Date().toLocaleDateString('vi-VN') });
    if (this.cloud.loggedIn) this.pushDayResult();
    this.day += 1;
    this.dayIncome = 0;
    this.weather = rollWeather();
    this.energy = ENERGY_MAX;
    const w = WEATHERS[this.weather];
    if (this.weather === 'rain') {
      this.plots.forEach(p => { if (p.crop && !p.ripe) p.watered = true; });
      this.trees.forEach(tr => { if (tr && !tr.ripe) tr.watered = true; });
    }
    this.npc = Math.random() < 0.5 ? this.makeNpc() : null;
    if (this.npc) sum.push(`💬 Có <b class="zh">${NPCS[this.npc.type].chn}</b> (${NPCS[this.npc.type].vi}) đang đợi ở cổng nông trại.`);
    this.sceneId = 'house';
    this.walk = null;
    this.rebuild();
    this.player = { x: 3, y: 2, face: 'left' };
    this.learn('睡觉');
    this.learn('天');
    this.learn(w.chn);
    this.learn('天气');
    this.audio.sleep();
    this.saveNow(true);
    this.renderHUD();
    const box = this.$('day-body');
    if (box) box.innerHTML = `
      <div class="day-big"><span class="zh">第${this.day}天</span> · Ngày ${this.day}</div>
      <div class="day-weather">${w.icon} ${this.wordLine({ zh: `今天${w.chn}`, pin: `Jīntiān ${w.pin}`, vi: `Hôm nay ${w.vi}` })}<small>${w.note}</small></div>
      <div class="day-energy">⚡ Năng lượng hồi đầy <b>${ENERGY_MAX}/${ENERGY_MAX}</b></div>
      <ul class="day-sum">${sum.map(s => `<li>${s}</li>`).join('') || '<li>Một đêm yên bình.</li>'}</ul>`;
    this.openModal('modal-day');
    setTimeout(() => this.say(`第${this.day}天，今天${w.chn}。`), 500);
    this.refreshUnlocks();
  }
  async pushDayResult() {
    const sold = Math.max(1, Math.min(1000000, this.stats.sold));
    const r = { day: this.day, earnings: this.stats.income, served: sold, total: sold, lost: 0, avg: 100, stars: Math.min(3, Math.floor(this.milestone / 3)) };
    try {
      const res = await GameCloud.post({ dayResult: r, save: this.snapshot() });
      if (res && res.best) this.cloud.best = res.best;
      if (res && Array.isArray(res.history)) this.cloud.history = res.history;
    } catch (e) {}
  }

  // --------------------------------------------------------------------------
  // Hộp thoại dùng chung: xác nhận, chọn, thẻ từ vựng
  // --------------------------------------------------------------------------
  confirm(title, html, okLabel, onOk) {
    this.$('cf-title').innerHTML = title;
    this.$('cf-body').innerHTML = html;
    this.$('cf-ok').innerHTML = okLabel;
    this._cfOk = onOk;
    this.openModal('modal-confirm');
  }
  pick(title, options, onPick) {
    this.$('pk-title').innerHTML = title;
    this.$('pk-grid').innerHTML = options.map(o => `<button type="button" class="pk-opt" data-pk="${o.id}">${iconHtml(o.icon, 'big')}<b class="zh">${escapeHtml(o.chn)}</b>${this.showPinyin ? `<small class="pin">${escapeHtml(o.pin)}</small>` : ''}<small>${escapeHtml(o.vi)}</small>${o.note ? `<em>${escapeHtml(o.note)}</em>` : ''}</button>`).join('');
    this._pkFn = onPick;
    this.openModal('modal-pick');
  }
  showCard(chn, extra = '') {
    const w = wordOf(chn);
    if (!w) return;
    this.learn(chn);
    const it = Object.values(ITEMS).find(i => i.chn === chn);
    this.$('card-body').innerHTML = `
      <div class="card-icon">${it ? iconHtml(it.icon, 'huge') : '📖'}</div>
      <div class="card-zh zh">${escapeHtml(chn)}</div>
      <div class="card-pin">${escapeHtml(w.pin)}</div>
      <div class="card-vi">${escapeHtml(w.vi)}</div>
      ${extra ? `<div class="card-extra">${extra}</div>` : ''}
      <button type="button" class="g-btn-primary" data-say-chn="${escapeHtml(chn)}"><i class="fa-solid fa-volume-high"></i> Nghe phát âm</button>`;
    this.openModal('modal-card');
    this.audio.speak(chn);
  }
  inspectAt(o, tx, ty) {
    if (o) {
      let w = o.word;
      if (o.kind === 'plot' && this.plots[o.idx].crop) w = itemOf(this.plots[o.idx].crop).chn;
      if (o.kind === 'tree' && this.trees[o.idx]) w = FRUITS.find(f => f.id === this.trees[o.idx].sp).chn;
      if (o.kind === 'booth') w = BOOTHS.find(b => b.id === o.booth).chn === '收购' ? '收购' : '集市';
      if (o.kind === 'npc') w = NPCS[this.npc.type].chn;
      if (o.kind === 'pen') w = ANIMALS[o.animal].pen.chn;
      return this.showCard(w);
    }
    const ch = this.scene.base[ty][tx];
    const map = { g: '草地', x: '花', p: '小路', t: '树', b: '树', W: '水', f: '房子', w: '房子', d: SCENES[this.sceneId].chn };
    this.showCard(map[ch] || '农场');
  }

  // --------------------------------------------------------------------------
  // Chợ
  // --------------------------------------------------------------------------
  openMarket(id) {
    this.boothId = id;
    this.boothTab = 'buy';
    this.boothTalk = null;
    const b = BOOTHS.find(x => x.id === id);
    this.learn('集市');
    this.learn(b.chn);
    this.renderMarket();
    this.openModal('modal-market');
    this.say(b.hello.zh);
  }
  boothItems(id) {
    const unlocked = (it) => (it.ms || 0) <= this.milestone;
    if (id === 'seed') return Object.values(ITEMS).filter(i => ['seed', 'sapling', 'fry'].includes(i.kind)).map(it => ({ it, locked: !unlocked(it) }));
    if (id === 'feed') return ['feed_chicken', 'feed_pig', 'hay', 'fishfood', 'rice', 'oil'].map(k => ({ it: ITEMS[k], locked: !unlocked(ITEMS[k]) }));
    if (id === 'tool') return ['hoe', 'can', 'shears', 'pail', 'rod', 'bait'].map(k => ({ it: ITEMS[k], locked: !unlocked(ITEMS[k]) }));
    return [];
  }
  renderMarket() {
    const b = BOOTHS.find(x => x.id === this.boothId);
    this.$('mk-title').innerHTML = `${b.icon} <span class="zh">${b.chn}</span> · ${escapeHtml(b.vi)}`;
    this.$('mk-money').textContent = `${this.money}元`;
    this.$('mk-bag').textContent = `${this.bagUsed()}/${BAG_CAP}`;
    const talk = this.boothTalk || b.hello;
    this.$('mk-talk').innerHTML = `<span class="mk-face">🧑‍🌾</span>${this.wordLine(talk)}`;
    const tabs = this.$('mk-tabs');
    const grid = this.$('mk-grid');
    const card = (o) => `<div class="mk-item ${o.locked ? 'locked' : ''}">
        <span class="mi-ico">${o.iconHtml || iconHtml(o.icon, 'big')}</span>
        <b class="zh">${escapeHtml(o.chn)}</b>${this.showPinyin ? `<small class="pin">${escapeHtml(o.pin)}</small>` : ''}<small>${escapeHtml(o.vi)}</small>
        <span class="mi-price">${o.price}</span>
        <span class="mi-btns">${o.locked ? `<em>🔒 ${escapeHtml(o.lockText)}</em>` : o.btns}</span></div>`;
    if (this.boothId === 'animal') {
      tabs.hidden = false;
      tabs.innerHTML = [['buy', '买 Mua'], ['sell', '卖 Bán']].map(([k, l]) => `<button type="button" class="vocab-tab ${this.boothTab === k ? 'active' : ''}" data-mtab="${k}">${l}</button>`).join('');
      if (this.boothTab === 'buy') {
        grid.innerHTML = ANIMAL_IDS.map(id => {
          const a = ANIMALS[id];
          const pen = this.pens[id];
          const max = this.maxAnimals(id);
          const n = this.animalCount(id);
          const locked = !pen.owned || max === 0;
          return card({ icon: a.icon, chn: a.chn, pin: a.pin, vi: `${a.vi} · ${n}/${max || a.slots} con`, price: `${a.price}元/${a.q}`, locked, lockText: max === 0 ? `mốc ${a.pen.ms}` : `cần xây ${a.pen.chn}`,
            btns: `<button type="button" class="g-btn-chip" data-buyanimal="${id}" ${n < max && this.money >= a.price ? '' : 'disabled'}>买 1</button>` });
        }).join('');
      } else {
        const rows = [];
        ANIMAL_IDS.forEach(id => {
          const a = ANIMALS[id];
          this.pens[id].animals.forEach((an, i) => {
            const price = a.id === 'pig' && an.growth >= a.growDays ? a.sellGrown : a.sell;
            rows.push(card({ icon: a.icon, chn: `${a.chn} #${i + 1}`, pin: a.pin, vi: `${a.vi}${a.id === 'pig' ? (an.growth >= a.growDays ? ' · 长大了' : ` · lớn ${an.growth}/${a.growDays}`) : ''} · ${an.health}%`, price: `${price}元`, btns: `<button type="button" class="g-btn-chip" data-sellanimal="${id}:${i}">卖</button>` }));
          });
        });
        grid.innerHTML = rows.join('') || '<p class="farm-note">Chưa có con vật nào để bán.</p>';
      }
      return;
    }
    tabs.hidden = true;
    if (this.boothId === 'sell') {
      const list = Object.keys(this.bag).filter(k => SELLABLE.includes(ITEMS[k].kind));
      grid.innerHTML = list.map(k => { const it = ITEMS[k]; return card({ icon: it.icon, chn: it.chn, pin: it.pin, vi: `${it.vi} · có ${this.bag[k]}`, price: `${it.sell}元/${it.q}`, btns: `<button type="button" class="g-btn-chip" data-sell="${k}:1">卖 1</button><button type="button" class="g-btn-chip" data-sell="${k}:all">卖全部</button>` }); }).join('')
        || '<p class="farm-note">Túi chưa có nông sản, trái cây, cá, trứng, sữa hay lông cừu để bán. (Đồ trong 冰箱 phải lấy ra túi trước.)</p>';
      return;
    }
    grid.innerHTML = this.boothItems(this.boothId).map(({ it, locked }) => {
      const tool = it.kind === 'tool';
      const owned = tool && this.has(it.id);
      return card({ icon: it.icon, chn: it.chn, pin: it.pin, vi: `${it.vi}${this.bag[it.id] && !tool ? ` · có ${this.bag[it.id]}` : ''}`, price: `${it.buy}元/${it.q}`, locked, lockText: `mốc ${it.ms}`,
        btns: owned ? '<em class="ok">✔ Đã có</em>' : tool ? `<button type="button" class="g-btn-chip" data-buy="${it.id}:1" ${this.money >= it.buy ? '' : 'disabled'}>买</button>`
          : `<button type="button" class="g-btn-chip" data-buy="${it.id}:1" ${this.money >= it.buy ? '' : 'disabled'}>买 1</button><button type="button" class="g-btn-chip" data-buy="${it.id}:5" ${this.money >= it.buy * 5 ? '' : 'disabled'}>买 5</button>` });
    }).join('');
  }
  buyItem(id, n) {
    const it = ITEMS[id];
    if ((it.ms || 0) > this.milestone) return;
    const cost = it.buy * n;
    if (this.money < cost) return this.warn('💰', `Không đủ tiền (cần ${cost}元).`);
    if (!this.canAdd(id, n)) return this.warn('🎒', it.kind === 'tool' ? 'Bạn đã có dụng cụ này rồi.' : `Túi không đủ chỗ (${this.bagUsed()}/${BAG_CAP}). Cất đồ vào 冰箱 trong nhà.`);
    this.money -= cost;
    this.give(id, n);
    this.learn(it.chn);
    this.learn('买');
    this.learn('一共');
    this.audio.coin();
    this.boothTalk = { zh: `好的，${numChn(n)}${it.q}${it.chn}，一共${cost}元。`, pin: `Hǎo de, ${n} ${it.q} ${it.pin}, yígòng ${cost} yuán.`, vi: `Được, ${n} ${it.vi}, tổng cộng ${cost} tệ.` };
    this.say(this.boothTalk.zh);
    this.renderHUD();
    this.renderMarket();
    this.markDirty();
    this.refreshUnlocks();
  }
  buyAnimal(id) {
    const a = ANIMALS[id];
    const pen = this.pens[id];
    if (!pen.owned || this.animalCount(id) >= this.maxAnimals(id)) return this.warn(a.icon, `Đã đủ số ${a.vi} được phép nuôi.`);
    if (this.money < a.price) return this.warn('💰', `Không đủ tiền (cần ${a.price}元).`);
    this.money -= a.price;
    pen.animals.push(newAnimal());
    this.learn(a.chn);
    this.learn('动物');
    this.audio.coin();
    this.boothTalk = { zh: `好的，一${a.q}${a.chn}，${a.price}元。`, pin: `Hǎo de, yì ${a.q} ${a.pin}, ${a.price} yuán.`, vi: `Được, một con ${a.vi}, ${a.price} tệ.` };
    this.say(this.boothTalk.zh);
    this.showToast(a.icon, `Đã mua 1 ${a.vi}! Nhớ cho ăn & uống ở ${a.pen.chn} mỗi ngày.`);
    this.renderHUD();
    this.renderMarket();
    this.markDirty();
    this.refreshUnlocks();
  }
  sellAnimal(id, i) {
    const a = ANIMALS[id];
    const pen = this.pens[id];
    const an = pen.animals[i];
    if (!an) return;
    const price = a.id === 'pig' && an.growth >= a.growDays ? a.sellGrown : a.sell;
    this.confirm(`${a.icon} Bán ${a.vi}`, `<p>Bán ${a.vi} số ${i + 1} (con vật sống) giá <b>${price}元</b>?</p>`, '卖 Bán', () => {
      pen.animals.splice(i, 1);
      if (id === 'chicken') { pen.nests.splice(i, 1); pen.nests.push(false); }
      pen.food.splice(i, 1); pen.food.push(false);
      pen.water.splice(i, 1); pen.water.push(false);
      this.addMoney(price, 1);
      this.learn('卖');
      this.boothTalk = { zh: `这${a.q}${a.chn}我收了，给你${price}元。`, pin: `Zhè ${a.q} ${a.pin} wǒ shōu le, gěi nǐ ${price} yuán.`, vi: `Con ${a.vi} này tôi mua, đưa bạn ${price} tệ.` };
      this.say(this.boothTalk.zh);
      this.renderMarket();
      this.openModal('modal-market');
    });
  }
  sellItem(id, mode) {
    const it = ITEMS[id];
    const n = mode === 'all' ? (this.bag[id] || 0) : 1;
    if (!n || !this.take(id, n)) return;
    const total = it.sell * n;
    this.addMoney(total, n);
    this.learn('卖');
    this.learn('收购');
    this.learn(it.chn);
    this.boothTalk = { zh: `${numChn(n)}${it.q}${it.chn}，一共${total}元，给你钱。`, pin: `${n} ${it.q} ${it.pin}, yígòng ${total} yuán, gěi nǐ qián.`, vi: `${n} ${it.vi}, tổng cộng ${total} tệ, tiền của bạn đây.` };
    this.say(this.boothTalk.zh);
    this.renderMarket();
  }

  // --------------------------------------------------------------------------
  // Túi đồ & tủ lạnh
  // --------------------------------------------------------------------------
  openBag() { this.audio.pop(); this.learn('背包'); this.renderBag(); this.openModal('modal-bag'); }
  renderBag() {
    this.$('bag-cap').textContent = `${this.bagUsed()}/${BAG_CAP}`;
    const keys = Object.keys(this.bag).filter(k => this.bag[k] > 0);
    const tools = keys.filter(k => ITEMS[k].kind === 'tool' || ITEMS[k].kind === 'bait');
    const water = this.bag.water || 0;
    const rest = keys.filter(k => countsInBag(ITEMS[k]));
    const cell = (k) => { const it = ITEMS[k]; return `<button type="button" class="bag-cell" data-card="${escapeHtml(it.chn)}">${iconHtml(it.icon, 'big')}<b class="zh">${escapeHtml(it.chn)}</b><small>${escapeHtml(it.vi)}</small>${it.kind === 'tool' ? '' : `<em>${this.bag[k]}</em>`}</button>`; };
    this.$('bag-body').innerHTML = `
      <div class="bag-row"><span class="bag-sec">🧰 <span class="zh">工具</span> Dụng cụ</span><div class="bag-grid">${tools.map(cell).join('') || '<p class="farm-note">Chưa có.</p>'}</div></div>
      <div class="bag-row"><span class="bag-sec">💧 <span class="zh">水</span> Nước</span><div class="water-bar"><i style="width:${(water / WATER_CAP) * 100}%"></i><b>${water}/${WATER_CAP}</b></div></div>
      <div class="bag-row"><span class="bag-sec">🎒 Đồ trong túi</span><div class="bag-grid">${rest.map(cell).join('') || '<p class="farm-note">Túi trống.</p>'}</div></div>
      <p class="farm-note">Chạm vào món đồ để xem thẻ từ vựng và nghe phát âm.</p>`;
  }
  openFridge() { this.audio.door(); this.learn('冰箱'); this.renderFridge(); this.openModal('modal-fridge'); }
  renderFridge() {
    this.$('fr-cap').textContent = `Túi ${this.bagUsed()}/${BAG_CAP} · Tủ ${this.fridgeUsed()}/${FRIDGE_CAP}`;
    const row = (k, n, dir) => { const it = ITEMS[k]; return `<div class="fr-item">${iconHtml(it.icon)}<span><b class="zh">${escapeHtml(it.chn)}</b> <small>${escapeHtml(it.vi)}</small></span><em>${n}</em><button type="button" class="g-btn-chip" data-fr="${dir}:${k}:1">${dir === 'in' ? 'Cất 1 ➜' : '⬅ Lấy 1'}</button><button type="button" class="g-btn-chip" data-fr="${dir}:${k}:all">${dir === 'in' ? 'Cất hết' : 'Lấy hết'}</button></div>`; };
    const bagKeys = Object.keys(this.bag).filter(k => countsInBag(ITEMS[k]));
    this.$('fr-bag').innerHTML = bagKeys.map(k => row(k, this.bag[k], 'in')).join('') || '<p class="farm-note">Túi trống.</p>';
    this.$('fr-fridge').innerHTML = Object.keys(this.fridge).map(k => row(k, this.fridge[k], 'out')).join('') || '<p class="farm-note">Tủ lạnh trống.</p>';
  }
  moveFridge(dir, id, mode) {
    if (dir === 'in') {
      const n = mode === 'all' ? (this.bag[id] || 0) : 1;
      const m = Math.min(n, FRIDGE_CAP - this.fridgeUsed());
      if (m <= 0) return this.warn('🧊', 'Tủ lạnh đã đầy.');
      this.take(id, m);
      this.fridge[id] = (this.fridge[id] || 0) + m;
    } else {
      const n = mode === 'all' ? (this.fridge[id] || 0) : 1;
      const m = Math.min(n, this.bagFree());
      if (m <= 0) return this.warn('🎒', 'Túi đầy.');
      this.fridge[id] -= m;
      if (!this.fridge[id]) delete this.fridge[id];
      this.give(id, m);
    }
    this.audio.pop();
    this.markDirty();
    this.renderFridge();
  }
  storeAll() {
    Object.keys(this.bag).filter(k => countsInBag(ITEMS[k]) && !['seed', 'sapling', 'fry', 'feed'].includes(ITEMS[k].kind)).forEach(k => {
      const m = Math.min(this.bag[k], FRIDGE_CAP - this.fridgeUsed());
      if (m > 0) { this.take(k, m); this.fridge[k] = (this.fridge[k] || 0) + m; }
    });
    this.audio.pop();
    this.renderFridge();
  }

  // --------------------------------------------------------------------------
  // Bếp & bàn ăn
  // --------------------------------------------------------------------------
  needOk(id, n) { return id === 'veg' ? VEG_ANY.some(v => this.stockAll(v) >= n) : this.stockAll(id) >= n; }
  openKitchen() { this.audio.pop(); this.learn('厨房'); this.learn('做饭'); this.renderKitchen(); this.openModal('modal-kitchen'); }
  renderKitchen() {
    this.$('kc-energy').textContent = `⚡ ${this.energy}/${ENERGY_MAX}`;
    this.$('kc-list').innerHTML = RECIPES.map(r => {
      const ok = Object.entries(r.need).every(([k, n]) => this.needOk(k, n));
      const need = Object.entries(r.need).map(([k, n]) => {
        const it = k === 'veg' ? { icon: '🥬', chn: '白菜/空心菜' } : ITEMS[k];
        const have = k === 'veg' ? VEG_ANY.reduce((s, v) => s + this.stockAll(v), 0) : this.stockAll(k);
        return `<span class="${have >= n ? 'ok' : 'miss'}">${iconHtml(it.icon)}<span class="zh">${it.chn}</span> ${Math.min(have, n)}/${n}</span>`;
      }).join('');
      return `<div class="rc-card"><span class="rc-ico">${r.icon}</span><div class="rc-info"><b class="zh">${r.chn}</b>${this.showPinyin ? ` <small class="pin">${escapeHtml(r.pin)}</small>` : ''} <small>${escapeHtml(r.vi)}</small><div class="rc-need">${need}</div><small>Ăn hồi ⚡ +${r.energy} · nấu tốn ⚡${ENERGY.cook}</small></div>
        <button type="button" class="g-btn-primary" data-cook="${r.id}" ${ok ? '' : 'disabled'}>做 Nấu</button></div>`;
    }).join('');
  }
  cook(id) {
    const r = RECIPES.find(x => x.id === id);
    if (!Object.entries(r.need).every(([k, n]) => this.needOk(k, n))) return this.warn('🥣', 'Chưa đủ nguyên liệu.');
    if (!this.needEnergy(ENERGY.cook)) return;
    Object.entries(r.need).forEach(([k, n]) => { if (k === 'veg') this.takeAny(VEG_ANY.find(v => this.stockAll(v) >= n), n); else this.takeAny(k, n); });
    this.useEnergy(ENERGY.cook);
    if (this.bagFree() >= 1) this.give(r.id, 1); else this.fridge[r.id] = (this.fridge[r.id] || 0) + 1;
    this.audio.harvest();
    this.learn(r.chn);
    this.learn('做饭');
    this.showToast(r.icon, `做好了！${r.chn} ${r.pin} · ${r.vi}. Mang ra 饭桌 (bàn ăn) để ăn.`);
    this.say(`${r.chn}做好了`);
    this.renderKitchen();
  }
  openEat() { this.audio.pop(); this.learn('饭桌'); this.learn('吃饭'); this.renderEat(); this.openModal('modal-eat'); }
  renderEat() {
    this.$('eat-energy').textContent = `⚡ ${this.energy}/${ENERGY_MAX}`;
    const dishes = RECIPES.filter(r => this.stockAll(r.id) > 0);
    this.$('eat-list').innerHTML = dishes.map(r => `<div class="rc-card"><span class="rc-ico">${r.icon}</span><div class="rc-info"><b class="zh">${r.chn}</b> <small>${escapeHtml(r.vi)}</small><small>Có ${this.stockAll(r.id)} phần · ⚡ +${r.energy}</small></div><button type="button" class="g-btn-primary" data-eat="${r.id}" ${this.energy >= ENERGY_MAX ? 'disabled' : ''}>吃 Ăn</button></div>`).join('')
      || '<p class="farm-note">Chưa có món ăn nào. Vào 厨房 (bếp) nấu 米饭, 炒鸡蛋, 青菜汤… trước nhé.</p>';
  }
  eat(id) {
    const r = RECIPES.find(x => x.id === id);
    if (this.energy >= ENERGY_MAX) return this.showToast('😋', 'Năng lượng đang đầy rồi.');
    if (!this.takeAny(id, 1)) return;
    this.energy = clamp(this.energy + r.energy, 0, ENERGY_MAX);
    this.audio.harvest();
    this.learn('吃饭');
    this.learn(r.chn);
    this.showToast(r.icon, `真好吃！Ăn ${r.chn} · năng lượng +${r.energy} → ${this.energy}.`);
    this.say('真好吃');
    this.renderHUD();
    this.renderEat();
    this.markDirty();
  }

  // --------------------------------------------------------------------------
  // Ao cá & câu cá
  // --------------------------------------------------------------------------
  openPond() { this.audio.pop(); this.learn('鱼塘'); this.renderPond(); this.openModal('modal-pond'); }
  renderPond() {
    const byS = {};
    this.pond.fish.forEach(f => { const s = FISH.find(x => x.id === f.sp); const k = f.sp; byS[k] = byS[k] || { s, n: 0, ok: 0 }; byS[k].n += 1; if (f.age >= s.days) byS[k].ok += 1; });
    const fries = Object.keys(this.bag).filter(k => ITEMS[k].kind === 'fry');
    this.$('pond-body').innerHTML = `
      <div class="pond-cap">🐟 Cá trong ao: <b>${this.pond.fish.length}/${POND_CAP}</b> · Hôm nay ${this.pond.fedToday ? '<b class="ok">đã cho ăn ✔</b>' : '<b class="bad">chưa cho ăn</b>'}</div>
      <div class="pond-fish">${Object.values(byS).map(x => `<span>${x.s.icon} <b class="zh">${x.s.chn}</b> ${x.n} con · ${x.ok} con câu được</span>`).join('') || '<p class="farm-note">Ao chưa có cá.</p>'}</div>
      <div class="pond-actions">
        <button type="button" class="g-btn-primary" id="btn-pond-feed" ${this.pond.fedToday || !this.pond.fish.length ? 'disabled' : ''}>${iconHtml('svg:sack_b')} <span class="zh">喂鱼</span> Cho cá ăn (1 鱼食 · ⚡${ENERGY.fishfeed})</button>
      </div>
      <div class="bag-sec">Thả cá giống từ túi:</div>
      <div class="pond-fry">${fries.map(k => `<button type="button" class="g-btn-chip" data-release="${k}">${iconHtml(ITEMS[k].icon)} ${ITEMS[k].chn} ×${this.bag[k]} → thả 1</button>`).join('') || '<p class="farm-note">Túi không có 鱼苗 — mua ở quầy 种子.</p>'}</div>
      <p class="farm-note">Câu cá: chạm vào mặt nước (cần 鱼竿 + 鱼饵, ⚡${ENERGY.fish}). Cá được cho ăn mỗi ngày sẽ lớn; đủ ngày mới câu được.</p>`;
  }
  feedFish() {
    if (this.pond.fedToday || !this.pond.fish.length) return;
    if (!this.has('fishfood')) return this.warn('🐟', 'Túi hết 鱼食 (thức ăn cho cá) — mua ở quầy 饲料.');
    if (!this.needEnergy(ENERGY.fishfeed)) return;
    this.take('fishfood', 1);
    this.pond.fedToday = true;
    this.useEnergy(ENERGY.fishfeed);
    this.audio.splash();
    this.learn('鱼食');
    this.actWord('喂');
    this.renderPond();
  }
  releaseFry(k) {
    if (this.pond.fish.length >= POND_CAP) return this.warn('🐟', `Ao đã đủ ${POND_CAP} con.`);
    if (!this.take(k, 1)) return;
    this.pond.fish.push({ sp: ITEMS[k].fryOf, age: 0 });
    this.audio.splash();
    this.learn('鱼苗');
    this.learn(itemOf(ITEMS[k].fryOf).chn);
    this.showToast('🐟', `Đã thả 1 ${ITEMS[k].chn} xuống ao.`);
    this.renderPond();
  }
  startFishing() {
    if (!this.has('rod') || !this.has('bait') || !this.matureFish().length || this.bagFree() < 1 || !this.needEnergy(ENERGY.fish)) return;
    this.take('bait', 1);
    this.useEnergy(ENERGY.fish);
    this.learn('钓鱼');
    this.learn('鱼竿');
    this.learn('鱼饵');
    this.say('钓鱼');
    this.fishState = 'wait';
    this.renderFishing();
    this.openModal('modal-fish');
    clearTimeout(this._fishT);
    this._fishT = setTimeout(() => {
      if (!this.isOpen('modal-fish')) return;
      this.fishState = 'bite';
      this.audio.splash();
      this.renderFishing();
      this._fishT = setTimeout(() => { if (this.fishState === 'bite') { this.fishState = 'miss'; this.renderFishing(); } }, 1300);
    }, randInt(1300, 3000));
  }
  pullFish() {
    if (this.fishState !== 'bite') {
      if (this.fishState === 'wait') { clearTimeout(this._fishT); this.fishState = 'early'; this.renderFishing(); }
      return;
    }
    clearTimeout(this._fishT);
    const pool = this.matureFish();
    const f = pickOne(pool);
    this.pond.fish.splice(this.pond.fish.indexOf(f), 1);
    const s = FISH.find(x => x.id === f.sp);
    this.give(s.id, 1);
    this.stats.fishCaught += 1;
    this.fishState = 'got';
    this.fishGot = s;
    this.audio.fanfare();
    this.learn(s.chn);
    this.learn('鱼');
    this.say(`钓到了一条${s.chn}！`);
    this.renderFishing();
    this.markDirty();
    this.refreshUnlocks();
  }
  renderFishing() {
    const st = this.fishState;
    const s = this.fishGot;
    const msg = {
      wait: '<b>Chờ cá cắn câu…</b><small>Khi phao chìm và hiện ❗ thì bấm 拉 thật nhanh!</small>',
      bite: '<b class="bite">❗ Cá cắn câu! Bấm 拉 ngay!</b>',
      miss: '<b>Cá chạy mất rồi…</b><small>Mất 1 mồi câu. Thử lại nhé!</small>',
      early: '<b>Kéo sớm quá, cá sợ bơi đi mất!</b><small>Mất 1 mồi câu. Chờ hiện ❗ rồi hãy kéo.</small>',
      got: s ? `<b>钓到了！Câu được ${s.icon} ${s.chn}</b>${this.wordLine({ zh: `我钓到了一条${s.chn}。`, pin: `Wǒ diào dào le yì tiáo ${s.pin}.`, vi: `Tôi câu được một con ${s.vi}.` })}` : ''
    }[st];
    this.$('fish-body').innerHTML = `<div class="fish-scene ${st}"><span class="bobber">${st === 'bite' ? '💦' : '🔴'}</span></div><div class="fish-msg">${msg}</div>
      <div class="fish-btns">${st === 'wait' || st === 'bite' ? '<button type="button" class="g-btn-primary big" id="btn-fish-pull">🎣 <span class="zh">拉</span> Kéo!</button>'
        : `<button type="button" class="g-btn-ghost" data-close="modal-fish">Xong</button>${this.has('bait') && this.matureFish().length && this.energy >= ENERGY.fish && this.bagFree() > 0 ? '<button type="button" class="g-btn-primary" id="btn-fish-again">🎣 Câu tiếp</button>' : ''}`}</div>`;
  }

  // --------------------------------------------------------------------------
  // NPC & hội thoại
  // --------------------------------------------------------------------------
  makeNpc() {
    if (Math.random() < 0.3) return { type: 'customer', dlg: 0, done: false, good: null, qty: 0 };
    const i = randInt(0, DIALOGUES.length - 1);
    return { type: DIALOGUES[i].npc, dlg: i, done: false };
  }
  customerDialogue() {
    const n = this.npc;
    if (!n.good) {
      const have = CUSTOMER_GOODS.filter(k => this.has(k));
      n.good = have.length && Math.random() < 0.8 ? pickOne(have) : pickOne(CUSTOMER_GOODS.filter(k => (ITEMS[k].ms || 0) <= this.milestone || ITEMS[k].kind !== 'crop'));
      n.qty = randInt(2, 6);
    }
    const it = ITEMS[n.good];
    const has = this.has(it.id);
    return {
      npc: 'customer',
      say: L(`你好！你有${it.chn}吗？`, `Nǐ hǎo! Nǐ yǒu ${it.pin} ma?`, `Chào bạn! Bạn có ${it.vi} không?`),
      choices: [
        { ...L(`有，你要几${it.q}？`, `Yǒu, nǐ yào jǐ ${it.q}?`, `Có, bạn muốn mấy ${it.vi}?`), ok: has, why: `Túi bạn đang không có ${it.chn}, nên trả lời "没有" nhé.`, sell: true },
        { ...L('没有，不好意思。', 'Méiyǒu, bù hǎoyìsi.', 'Không có, xin lỗi nhé.'), ok: !has, why: `Túi bạn đang có ${it.chn} (${this.bag[it.id] || 0}) — có thể bán cho khách đấy!` },
        { ...L('我在给菜浇水。', 'Wǒ zài gěi cài jiāoshuǐ.', 'Tôi đang tưới rau.'), why: 'Khách hỏi bạn có hàng không — trả lời 有 (có) hoặc 没有 (không có).' }
      ],
      reply: has ? null : L('没关系，下次再来。', 'Méi guānxi, xiàcì zài lái.', 'Không sao, lần sau tôi lại đến.')
    };
  }
  currentDialogue() { return this.npc.type === 'customer' ? this.customerDialogue() : DIALOGUES[this.npc.dlg]; }
  openDialogue() {
    if (!this.npc || this.npc.done) return;
    const d = this.currentDialogue();
    const n = NPCS[this.npc.type];
    this.learn(n.chn);
    this.learn('你好');
    this.dlgState = { d, step: 'ask', why: '' };
    this.renderDialogue();
    this.openModal('modal-talk');
    this.say(d.say.zh);
  }
  renderDialogue() {
    const { d, step, why, done } = this.dlgState;
    const n = NPCS[this.npc.type];
    const head = `<div class="talk-npc"><span class="talk-face" style="background:${n.color}">${n.face}</span><div><b class="zh">${n.chn}</b> <small>${n.pin} · ${n.vi}</small></div></div>`;
    let body = `<div class="talk-bubble">${this.wordLine(d.say)}</div>`;
    if (step === 'ask') {
      body += `${why ? `<div class="talk-why">💡 ${escapeHtml(why)}<br><small>Không sao, chọn lại nhé!</small></div>` : '<div class="talk-hint">Chọn câu trả lời bằng tiếng Trung:</div>'}
        <div class="talk-choices">${d.choices.map((c, i) => `<button type="button" class="talk-choice" data-choice="${i}"><b class="zh">${escapeHtml(c.zh)}</b>${this.showPinyin ? `<small class="pin">${escapeHtml(c.pin)}</small>` : ''}${this.showVietnamese ? `<small>${escapeHtml(c.vi)}</small>` : ''}</button>`).join('')}</div>`;
    } else {
      body += `<div class="talk-bubble me">${this.wordLine(done.me)}</div>${done.reply ? `<div class="talk-bubble">${this.wordLine(done.reply)}</div>` : ''}${done.extra || ''}
        <div class="talk-end"><button type="button" class="g-btn-primary" data-close="modal-talk"><span class="zh">再见</span> Tạm biệt</button></div>`;
    }
    this.$('talk-body').innerHTML = head + body;
  }
  chooseAnswer(i) {
    const st = this.dlgState;
    const c = st.d.choices[i];
    if (!c) return;
    this.audio.speak(c.zh);
    if (!c.ok) { st.why = c.why || 'Câu này chưa hợp lắm.'; this.audio.error(); this.renderDialogue(); return; }
    let reply = st.d.reply;
    let extra = '';
    if (c.sell) {
      const it = ITEMS[this.npc.good];
      const q = Math.min(this.npc.qty, this.bag[it.id] || 0);
      const price = Math.round(it.sell * 1.2);
      const total = q * price;
      this.take(it.id, q);
      this.addMoney(total, q);
      this.learn(it.chn);
      this.learn('一共');
      this.learn('顾客');
      reply = L(`我要${numChn(this.npc.qty)}${it.q}。`, `Wǒ yào ${this.npc.qty} ${it.q}.`, `Tôi muốn ${this.npc.qty} ${it.vi}.`);
      extra = `<div class="talk-bubble me">${this.wordLine(L(`${q < this.npc.qty ? `我只有${numChn(q)}${it.q}。` : ''}一共${total}元。`, `${q < this.npc.qty ? `Wǒ zhǐ yǒu ${q} ${it.q}. ` : ''}Yígòng ${total} yuán.`, `${q < this.npc.qty ? `Tôi chỉ có ${q}. ` : ''}Tổng cộng ${total} tệ.`))}</div>
        <div class="talk-bubble">${this.wordLine(L('好的，给你钱。谢谢！', 'Hǎo de, gěi nǐ qián. Xièxie!', 'Được, tiền của bạn đây. Cảm ơn!'))}</div><div class="talk-paid">💰 +${total}元 (giá tốt hơn quầy thu mua)</div>`;
      setTimeout(() => this.audio.speak(`一共${total}元`), 1200);
    }
    this.npc.done = true;
    this.stats.talks += 1;
    this.learn('谢谢');
    this.learn('再见');
    ['喜欢', '朋友', '邻居', '农民', '送货员', '快递', '商人'].forEach(w => { if (st.d.say.zh.includes(w) || c.zh.includes(w)) this.learn(w); });
    if (st.d.say.zh.includes('最近怎么样')) this.learn('最近怎么样');
    if (st.d.say.zh.includes('你在做什么')) this.learn('你在做什么');
    st.step = 'done';
    st.done = { me: c, reply, extra };
    this.audio.unlock();
    this.renderDialogue();
    if (reply) setTimeout(() => this.audio.speak(reply.zh), 900);
    this.rebuild();
    this.markDirty();
  }

  // --------------------------------------------------------------------------
  // Mốc phát triển & bản đồ
  // --------------------------------------------------------------------------
  showMilestones(list) {
    const m = list[list.length - 1];
    this.$('ms-body').innerHTML = `<div class="lu-burst">🏁</div><h3><span class="zh">新的里程碑！</span> Mốc ${m.n}</h3>${list.map(x => `<div class="ms-unlock"><b>Mốc ${x.n}</b> · ${escapeHtml(x.unlock)}</div>`).join('')}<p class="farm-note">Mốc chỉ mở quyền mua / khu vực — bạn vẫn dùng tiền để mua.</p>`;
    this.audio.fanfare();
    this.openModal('modal-milestone');
  }
  openMap() {
    this.audio.pop();
    const areas = [
      { id: 'farm', open: true }, { id: 'house', open: true }, { id: 'pen_chicken', open: true },
      { id: 'pen_pig', open: this.pens.pig.owned, need: 'mốc 3 + mua chuồng' }, { id: 'pen_sheep', open: this.pens.sheep.owned, need: 'mốc 4 + mua chuồng' }, { id: 'pen_cow', open: this.pens.cow.owned, need: 'mốc 5 + mua chuồng' },
      { id: 'forest', open: this.milestone >= 7, need: 'mốc 7' }
    ];
    this.$('map-body').innerHTML = `
      <div class="map-areas">${areas.map(a => { const s = SCENES[a.id]; return `<div class="map-area ${a.open ? '' : 'locked'} ${this.sceneId === a.id ? 'here' : ''}"><span>${s.icon}</span><b class="zh">${s.chn}</b><small>${escapeHtml(s.vi)}</small>${this.sceneId === a.id ? '<em>📍 Bạn ở đây</em>' : a.open ? '' : `<em>🔒 ${a.need}</em>`}</div>`; }).join('')}</div>
      <h4>🏁 Mốc phát triển (${this.milestone}/${MILESTONES.length})</h4>
      <ol class="ms-list">${MILESTONES.map(m => `<li class="${m.n <= this.milestone ? 'done' : m.n === this.milestone + 1 ? 'next' : ''}"><b>${m.n <= this.milestone ? '✅' : m.n === this.milestone + 1 ? '▶' : '🔒'} Mốc ${m.n}</b> <span>${escapeHtml(m.need)}</span><small>→ ${escapeHtml(m.unlock)}</small></li>`).join('')}</ol>`;
    this.openModal('modal-map');
  }

  // --------------------------------------------------------------------------
  // Từ vựng
  // --------------------------------------------------------------------------
  openVocab() { this.audio.pop(); this.vocabTab = this.vocabTab || 'plant'; this.renderVocab(); this.openModal('modal-vocab'); }
  renderVocab() {
    const q = (this.$('vocab-search').value || '').trim().toLowerCase();
    this.$('vocab-tabs').innerHTML = VOCAB_GROUPS.map(gp => `<button type="button" class="vocab-tab ${gp.id === this.vocabTab && !q ? 'active' : ''}" data-vtab="${gp.id}"><span class="zh">${gp.chn}</span> ${gp.vi}</button>`).join('');
    const words = q ? Object.values(VOCAB_INDEX).filter(w => w.chn.includes(q) || w.pin.toLowerCase().replace(/[^a-z ]/g, '').includes(q.replace(/[^a-z ]/g, '') || '§') || w.pin.toLowerCase().includes(q) || w.vi.toLowerCase().includes(q))
      : VOCAB_GROUPS.find(gp => gp.id === this.vocabTab).words;
    this.$('vocab-items-grid').innerHTML = words.map(v => `
      <div class="vc ${this.learned.has(v.chn) ? 'learned' : ''}"><span class="zh">${escapeHtml(v.chn)}</span><div class="pin">${escapeHtml(v.pin)}</div><div class="vi">${escapeHtml(v.vi)}</div>
        <button type="button" data-say-chn="${escapeHtml(v.chn)}" title="Nghe phát âm"><i class="fa-solid fa-volume-high"></i></button></div>`).join('') || '<p class="farm-note">Không tìm thấy từ nào.</p>';
    this.setText('vocab-count', `Đã gặp ${this.learnedCount()}/${VOCAB_TOTAL} từ`);
  }

  // --------------------------------------------------------------------------
  // Thanh trên, màn hình chờ, sự kiện DOM
  // --------------------------------------------------------------------------
  renderHUD() {
    const w = WEATHERS[this.weather];
    this.setText('hud-day', `第${this.day}天`);
    this.setText('hud-day-vi', `Ngày ${this.day}`);
    const wc = this.$('hud-weather');
    if (wc) wc.innerHTML = `${w.icon} <span class="zh">${w.chn}</span> <small>${w.vi}</small>`;
    this.setText('hud-money', `${this.money}元`);
    this.setText('hud-energy-val', `${this.energy}/${ENERGY_MAX}`);
    const f = this.$('hud-energy-fill');
    if (f) { f.style.width = `${(this.energy / ENERGY_MAX) * 100}%`; f.classList.toggle('low', this.energy < 20); }
    this.setText('hud-vocab-val', `${this.learnedCount()}/${VOCAB_TOTAL}`);
    this.setText('hud-bag-val', `${this.bagUsed()}/${BAG_CAP}`);
    const s = SCENES[this.sceneId];
    const loc = this.$('loc-chip');
    if (loc) loc.innerHTML = `${s.icon} <span class="zh">${s.chn}</span> <small>${s.vi}</small>`;
    const ins = this.$('btn-inspect');
    if (ins) ins.classList.toggle('on', this.inspect);
  }

  showTitleScreen() {
    const el = this.$('title-screen');
    if (el) el.classList.remove('hidden');
    document.body.classList.add('on-title');
    const loading = !this.cloud.checked && GameCloud.signedIn();
    const started = this.day > 1 || this.stats.harvests > 0 || this.stats.eggs > 0;
    this.setText('title-play-vi', loading ? 'Đang tải…' : started ? `Tiếp tục · ngày ${this.day}` : 'Vào nông trại');
    const play = this.$('btn-title-play');
    if (play) play.disabled = !!loading;
    const prog = this.$('title-progress');
    if (prog) prog.innerHTML = started
      ? `<span>📅 第${this.day}天</span><span>💰 ${this.money}元</span><span>🏁 Mốc ${this.milestone}/${MILESTONES.length}</span>`
      : '<span>✨ Vừa làm nông · vừa học tiếng Trung</span>';
  }
  onTitlePlay() {
    if (!this.cloud.checked && GameCloud.signedIn()) return;
    this.audio.init();
    this.audio.pop();
    const el = this.$('title-screen');
    if (el) el.classList.add('hidden');
    document.body.classList.remove('on-title');
    this.rebuild();
    this.renderHUD();
    const w = WEATHERS[this.weather];
    this.learn(w.chn);
    this.showToast(w.icon, `第${this.day}天 · ${w.chn} ${w.pin} · ${w.vi}. ${w.note}`);
    if (this.day === 1 && !this.stats.harvests && !this.stats.eggs) setTimeout(() => this.showToast('👆', 'Nhấp vào vật thể (ô đất, giếng, chuồng gà…) — nhân vật sẽ tự đi tới và làm việc.'), 1800);
    else if (this.npc && !this.npc.done) setTimeout(() => this.showToast('💬', `Có ${NPCS[this.npc.type].chn} (${NPCS[this.npc.type].vi}) đang đợi ở cổng nông trại.`), 1800);
  }
  async resetGame() {
    if (!confirm('Chơi lại từ đầu? Nông trại (tiền, đất, vật nuôi, mốc phát triển) sẽ bị xóa. Kỷ lục trên bảng xếp hạng vẫn được giữ.')) return;
    LocalSave.clear(this.owner);
    if (this.cloud.loggedIn) { try { await GameCloud.post({ resetSave: true }); } catch (e) {} }
    location.reload();
  }

  initDOM() {
    const on = (id, ev, fn) => { const el = this.$(id); if (el) el.addEventListener(ev, fn); };
    window.addEventListener('resize', () => this.fitStage());
    window.addEventListener('orientationchange', () => setTimeout(() => this.fitStage(), 200));
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.saveNow(true); });
    window.addEventListener('pagehide', () => this.saveNow(true));

    on('btn-title-play', 'click', () => this.onTitlePlay());
    on('btn-title-guide', 'click', () => { this.audio.pop(); this.openModal('modal-guide'); });
    on('btn-title-rank', 'click', () => { this.audio.pop(); this.openRankModal(); });
    on('btn-hud-home', 'click', () => { this.audio.pop(); this.saveNow(true); this.showTitleScreen(); });
    on('btn-pause-game', 'click', () => { this.audio.pop(); this.openModal('modal-settings'); });
    on('btn-fullscreen', 'click', () => this.toggleFullscreen());
    on('btn-rotate-fullscreen', 'click', () => this.toggleFullscreen());
    on('btn-open-vocab', 'click', () => this.openVocab());
    on('btn-bag', 'click', () => this.openBag());
    on('btn-map', 'click', () => this.openMap());
    on('btn-inspect', 'click', () => { this.inspect = !this.inspect; this.audio.pop(); this.renderHUD(); this.showToast('🔍', this.inspect ? 'Chế độ 识字: nhấp vào bất cứ thứ gì để xem thẻ từ vựng (không làm việc).' : 'Tắt chế độ thẻ từ — nhấp để làm việc như bình thường.'); });
    on('hud-weather', 'click', () => { const w = WEATHERS[this.weather]; this.showCard(w.chn, escapeHtml(w.note)); });
    on('btn-energy', 'click', () => this.showToast('⚡', `体力 tǐlì · năng lượng ${this.energy}/${ENERGY_MAX}. Ăn món ăn ở 饭桌 (bàn ăn trong nhà) hoặc ngủ để hồi.`));

    const cv = this.$('farm-canvas');
    if (cv) {
      cv.addEventListener('click', (e) => { const [x, y] = this.eventTile(e); this.onMapClick(x, y); });
      cv.addEventListener('mousemove', (e) => {
        const [x, y] = this.eventTile(e);
        const sc = this.scene;
        this.hover = x >= 0 && y >= 0 && x < sc.cols && y < sc.rows ? [x, y] : null;
        cv.style.cursor = this.hover && objAt(sc, x, y) ? 'pointer' : 'default';
      });
      cv.addEventListener('mouseleave', () => { this.hover = null; });
    }

    // hộp thoại dùng chung
    on('cf-ok', 'click', () => { this.closeModal('modal-confirm'); const fn = this._cfOk; this._cfOk = null; if (fn) fn(); });
    on('pk-grid', 'click', (e) => { const b = e.target.closest('[data-pk]'); if (!b) return; this.closeModal('modal-pick'); const fn = this._pkFn; this._pkFn = null; if (fn) fn(b.dataset.pk); });
    on('modal-market', 'click', (e) => {
      const t = e.target.closest('[data-mtab]');
      if (t) { this.boothTab = t.dataset.mtab; this.audio.pop(); this.renderMarket(); return; }
      const b = e.target.closest('[data-buy]');
      if (b && !b.disabled) { const [id, n] = b.dataset.buy.split(':'); this.buyItem(id, +n); return; }
      const s = e.target.closest('[data-sell]');
      if (s) { const [id, m] = s.dataset.sell.split(':'); this.sellItem(id, m); return; }
      const ba = e.target.closest('[data-buyanimal]');
      if (ba && !ba.disabled) { this.buyAnimal(ba.dataset.buyanimal); return; }
      const sa = e.target.closest('[data-sellanimal]');
      if (sa) { const [id, i] = sa.dataset.sellanimal.split(':'); this.sellAnimal(id, +i); }
    });
    on('modal-bag', 'click', (e) => { const c = e.target.closest('[data-card]'); if (c) this.showCard(c.dataset.card); });
    on('modal-fridge', 'click', (e) => { const b = e.target.closest('[data-fr]'); if (b) { const [d, id, m] = b.dataset.fr.split(':'); this.moveFridge(d, id, m); } });
    on('btn-store-all', 'click', () => this.storeAll());
    on('modal-kitchen', 'click', (e) => { const b = e.target.closest('[data-cook]'); if (b && !b.disabled) this.cook(b.dataset.cook); });
    on('modal-eat', 'click', (e) => { const b = e.target.closest('[data-eat]'); if (b && !b.disabled) this.eat(b.dataset.eat); });
    on('modal-pond', 'click', (e) => {
      if (e.target.closest('#btn-pond-feed')) { this.feedFish(); return; }
      const r = e.target.closest('[data-release]');
      if (r) this.releaseFry(r.dataset.release);
    });
    on('modal-fish', 'click', (e) => {
      if (e.target.closest('#btn-fish-pull')) { this.pullFish(); return; }
      if (e.target.closest('#btn-fish-again')) { this.closeModal('modal-fish'); this.startFishing(); }
    });
    on('modal-talk', 'click', (e) => { const c = e.target.closest('[data-choice]'); if (c) this.chooseAnswer(+c.dataset.choice); });
    on('vocab-tabs', 'click', (e) => { const t = e.target.closest('[data-vtab]'); if (t) { this.vocabTab = t.dataset.vtab; this.$('vocab-search').value = ''; this.audio.pop(); this.renderVocab(); } });
    on('vocab-search', 'input', () => this.renderVocab());

    document.addEventListener('click', (e) => {
      const say = e.target.closest('[data-say-chn]');
      if (say) { this.audio.speak(say.dataset.sayChn); this.learn(say.dataset.sayChn); }
      const cl = e.target.closest('[data-close]');
      if (cl) {
        this.closeModal(cl.dataset.close);
        if (cl.dataset.close === 'modal-fish') clearTimeout(this._fishT);
        this.renderHUD();
        this.saveNow();
      }
    });
    document.querySelectorAll('.rank-tab').forEach(btn => btn.addEventListener('click', () => { this.audio.pop(); this.switchRankTab(btn.dataset.rankTab); }));

    on('setting-sfx', 'change', (e) => { this.audio.sfxEnabled = e.target.checked; });
    on('setting-voice', 'change', (e) => { this.audio.voiceEnabled = e.target.checked; });
    on('setting-autovoice', 'change', (e) => { this.autoVoice = e.target.checked; this.markDirty(); });
    on('setting-pinyin', 'change', (e) => { this.showPinyin = e.target.checked; this.markDirty(); });
    on('setting-vietnamese', 'change', (e) => { this.showVietnamese = e.target.checked; this.markDirty(); });
    on('btn-back-to-title', 'click', () => { this.closeModal('modal-settings'); this.saveNow(true); this.showTitleScreen(); });
    on('btn-reset-save', 'click', () => this.resetGame());
    this.syncSettings();
  }
  syncSettings() {
    const set = (id, v) => { const el = this.$(id); if (el) el.checked = v; };
    set('setting-pinyin', this.showPinyin);
    set('setting-vietnamese', this.showVietnamese);
    set('setting-autovoice', this.autoVoice);
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

  // --------------------------------------------------------------------------
  // Tài khoản & bảng xếp hạng (xếp theo tổng thu nhập 元)
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
    if (server && sTime >= lTime && this.applySnapshot(server)) { if (email) LocalSave.write(email, server); }
    else if (local && this.applySnapshot(local)) GameCloud.post({ save: local }).catch(() => {});
    else this.newFarm();
    this.syncSettings();
    this.renderHUD();
    this.renderAccountChip();
  }
  switchOwner(owner) {
    if (this.owner === owner) return;
    this.owner = owner;
    const s = LocalSave.read(owner);
    if (!(s && this.applySnapshot(s))) this.newFarm();
    this.renderHUD();
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
      this.setText('title-account-status', c.best ? `☁️ Đã lưu · Tổng thu nhập ${Math.round(c.best.earnings)}元` : '☁️ Nông trại được lưu vào tài khoản');
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
    this.setText('rank-note', 'Mỗi người 1 dòng · Xếp theo tổng thu nhập (元) từ bán hàng · ghi nhận mỗi lần đi ngủ');
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
      <div class="rs-item"><span>💰</span><strong>${me ? Math.round(me.earnings) : this.stats.income}元</strong><small>Tổng thu nhập</small></div>
      <div class="rs-item"><span>📅</span><strong>${me ? me.day : this.day}</strong><small>Ngày</small></div>`;
    const cta = !data.loggedIn ? '<div class="rank-cta"><span>🔐 Bạn đang chơi với tư cách khách — đăng nhập để ghi tên lên bảng!</span><a href="index.html">Đăng nhập</a></div>' : '';
    const top = Array.isArray(data.top) ? data.top : [];
    if (!top.length) { list.innerHTML = cta + '<div class="rank-empty">🌾 Chưa có ai trên bảng xếp hạng.<br>Bán nông sản rồi đi ngủ để ghi tên đầu tiên!</div>'; return; }
    const medals = ['🥇', '🥈', '🥉'];
    const row = (r) => `
      <div class="rank-row ${r.rank <= 3 ? 'top' : ''} ${r.isMe ? 'me' : ''}">
        <span class="rr-pos">${medals[r.rank - 1] || r.rank}</span>
        <span class="rr-player">${r.picture ? `<img class="rr-avatar" src="${escapeHtml(r.picture)}" alt="" referrerpolicy="no-referrer" loading="lazy">` : '<span class="rr-avatar"><i class="fa-solid fa-user"></i></span>'}
          <span class="rr-name"><b>${escapeHtml(r.name)}${r.isMe ? '<span class="rr-me">Bạn</span>' : ''}</b><small>${r.achievedAt ? new Date(r.achievedAt).toLocaleDateString('vi-VN') : ''}</small></span></span>
        <span class="rr-earn">💰 ${Math.round(r.earnings)}元</span>
        <span>📅 Ngày ${Number(r.day) || 1}</span>
        <span>🧺 ${r.served} món đã bán</span>
        <span class="rr-stars">${'⭐'.repeat(r.stars || 0)}</span>
      </div>`;
    const meOutside = me && !top.some(r => r.isMe);
    list.innerHTML = cta + top.map(row).join('') + (meOutside ? `<div class="rank-gap">⋮</div>${row(me)}` : '');
  }
  renderMyRank() {
    const list = this.$('rank-list');
    const summary = this.$('rank-summary');
    this.setText('rank-note', this.cloud.loggedIn ? '☁️ Thu nhập từng ngày đã lưu trong tài khoản' : 'Đang lưu trên máy này · Đăng nhập để lên bảng xếp hạng');
    if (summary) summary.innerHTML = `
      <div class="rs-item"><span>📅</span><strong>${this.day}</strong><small>Ngày</small></div>
      <div class="rs-item"><span>💰</span><strong>${this.stats.income}元</strong><small>Tổng thu nhập</small></div>
      <div class="rs-item"><span>🏁</span><strong>${this.milestone}/${MILESTONES.length}</strong><small>Mốc phát triển</small></div>
      <div class="rs-item"><span>📖</span><strong>${this.learnedCount()}</strong><small>Từ đã gặp</small></div>`;
    if (!list) return;
    const recs = [...this.records].sort((a, b) => b.day - a.day);
    list.innerHTML = !recs.length ? '<div class="rank-empty">🌾 Chưa ngủ đêm nào.<br>Làm việc rồi lên giường ngủ để ghi lại ngày đầu tiên!</div>'
      : recs.slice(0, 30).map(r => `<div class="rank-row"><span class="rr-pos">📅${r.day}</span><span class="rr-name"><b>Ngày ${r.day}</b><small>${escapeHtml(r.date || '')}</small></span><span class="rr-earn">💰 ${Math.round(r.earnings)}元</span><span></span><span></span><span></span></div>`).join('');
  }
}

(function bootFarm() {
  const start = () => { if (!window.farmGame) window.farmGame = new FarmGame(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
