/**
 * Bộ máy dùng chung cho 4 game tiệm nhập vai (Quần Áo · Bánh Mì · Cá Viên · Mỹ Phẩm).
 * Cơ cấu giống Tiệm Tạp Hóa / Tiệm Trà Sữa:
 *   - Màn hình chờ (Bắt đầu · Hướng dẫn · Xếp hạng) → mỗi ngày mở cửa 08:00 → 20:00 (tính theo thời gian), khách đến liên tục.
 *   - Mỗi khách đi qua 3 giai đoạn: 接待 Đón khách (nghe + nhận đơn) → 备货 Chuẩn bị đơn (phần riêng của từng tiệm)
 *     → 收银 Thanh toán bằng hội thoại tiếng Trung (shop_dialogue.js).
 *   - Tiền kiếm được dùng để mở thêm khu hàng và từng món ở 进货市场 (chợ nhập hàng).
 *   - Tiến trình lưu theo tài khoản (server + bản sao trên máy); kết quả mỗi ngày → bảng xếp hạng (giữ thành tích cao nhất).
 * Phần riêng của từng tiệm nằm ở shop_modes.js (sinh đơn, giao diện chuẩn bị, chấm đúng/sai, hóa đơn).
 */
import { pinyin } from 'pinyin-pro';
import { sceneHtml } from './shop_scene.js';
import { createCheckoutDialogue, pickOption, renderChatHtml, renderOptionsHtml } from './shop_dialogue.js';

const SAVE_VERSION = 1;
const MAX_LINE = 2;   // khách xếp hàng tối đa (thư thả, vì mỗi đơn có cả hội thoại thanh toán)
const OPEN_MIN = 8 * 60;
const CLOSE_MIN = 20 * 60;

// Thời tiết / ngày lễ / nâng cấp: cùng bộ với Tiệm Tạp Hóa
const WEATHERS = [
  { id: 'sunny', chn: '晴天', pin: 'qíngtiān', vi: 'trời nắng đẹp', icon: '☀️', demand: 1, w: 34, note: 'Trời đẹp, khách như mọi ngày.' },
  { id: 'cloudy', chn: '多云', pin: 'duōyún', vi: 'trời nhiều mây', icon: '⛅', demand: 1, w: 20, note: 'Trời râm mát, khách bình thường.' },
  { id: 'hot', chn: '烈日', pin: 'lièrì', vi: 'nắng gắt', icon: '🥵', demand: 0.85, w: 12, note: 'Nắng gắt, ít người ra đường.' },
  { id: 'rain', chn: '下雨', pin: 'xiàyǔ', vi: 'trời mưa', icon: '🌧️', demand: 0.75, w: 15, note: 'Trời mưa, khách ngại ra ngoài.' },
  { id: 'wind', chn: '大风', pin: 'dàfēng', vi: 'gió to', icon: '🌬️', demand: 0.7, w: 9, note: 'Gió to, khách ít hơn hẳn.' },
  { id: 'thunder', chn: '雷阵雨', pin: 'léizhènyǔ', vi: 'mưa dông', icon: '⛈️', demand: 0.6, w: 6, note: 'Mưa dông sấm sét, khách rất thưa.' },
  { id: 'typhoon', chn: '台风', pin: 'táifēng', vi: 'bão', icon: '🌀', demand: 0.45, w: 4, note: 'Có bão! Chỉ vài khách liều ra đường.' }
];
const HOLIDAYS = [
  { id: 'spring', chn: '春节', pin: 'Chūnjié', vi: 'Tết Nguyên Đán', icon: '🧧', greet: '新年快乐！', greetPin: 'Xīnnián kuàilè!', greetVi: 'Chúc mừng năm mới!' },
  { id: 'lantern', chn: '元宵节', pin: 'Yuánxiāojié', vi: 'Tết Nguyên Tiêu', icon: '🏮', greet: '元宵节快乐！', greetPin: 'Yuánxiāojié kuàilè!', greetVi: 'Chúc Tết Nguyên Tiêu vui vẻ!' },
  { id: 'valentine', chn: '情人节', pin: 'Qíngrénjié', vi: 'Lễ Tình nhân', icon: '💝', greet: '情人节快乐！', greetPin: 'Qíngrénjié kuàilè!', greetVi: 'Chúc mừng Lễ Tình nhân!' },
  { id: 'children', chn: '儿童节', pin: 'Értóngjié', vi: 'Quốc tế Thiếu nhi', icon: '🎈', greet: '儿童节快乐！', greetPin: 'Értóngjié kuàilè!', greetVi: 'Chúc mừng ngày Thiếu nhi!' },
  { id: 'dragonboat', chn: '端午节', pin: 'Duānwǔjié', vi: 'Tết Đoan Ngọ', icon: '🐉', greet: '端午节快乐！', greetPin: 'Duānwǔjié kuàilè!', greetVi: 'Chúc Tết Đoan Ngọ vui vẻ!' },
  { id: 'midautumn', chn: '中秋节', pin: 'Zhōngqiūjié', vi: 'Tết Trung Thu', icon: '🥮', greet: '中秋节快乐！', greetPin: 'Zhōngqiūjié kuàilè!', greetVi: 'Chúc Trung Thu vui vẻ!' },
  { id: 'national', chn: '国庆节', pin: 'Guóqìngjié', vi: 'Quốc khánh', icon: '🎆', greet: '国庆节快乐！', greetPin: 'Guóqìngjié kuàilè!', greetVi: 'Chúc mừng Quốc khánh!' },
  { id: 'christmas', chn: '圣诞节', pin: 'Shèngdànjié', vi: 'Giáng sinh', icon: '🎄', greet: '圣诞节快乐！', greetPin: 'Shèngdànjié kuàilè!', greetVi: 'Giáng sinh vui vẻ!' }
];
const EVENT_RULES = { holidayChance: 0.15, holidayDemand: 1.25, firstEventDay: 2 };
const UPGRADE_DEFS = [
  { id: 'sign', chn: '招牌', pin: 'zhāopai', vi: 'biển hiệu mới', icon: '🪧', desc: 'Thu hút thêm khách: +12% khách mỗi cấp', costs: [150, 300, 500] },
  { id: 'seats', chn: '座位', pin: 'zuòwèi', vi: 'ghế ngồi chờ', icon: '🪑', desc: 'Khách chịu chờ lâu hơn: +20 giây mỗi cấp', costs: [120, 250, 450] },
  { id: 'hours', chn: '延长营业', pin: 'yáncháng yíngyè', vi: 'kéo dài giờ mở cửa', icon: '🕘', desc: 'Mở cửa thêm 1 giờ (+25 giây chơi) mỗi cấp', costs: [200, 400, 650] }
];
const EXTRA_VOCAB = [
  { zh: '天气', pin: 'tiānqì', vi: 'thời tiết' }, { zh: '节日', pin: 'jiérì', vi: 'ngày lễ' }, { zh: '进货', pin: 'jìnhuò', vi: 'nhập hàng' }, { zh: '升级', pin: 'shēngjí', vi: 'nâng cấp' },
  ...WEATHERS.map((w) => ({ zh: w.chn, pin: w.pin, vi: w.vi })), ...HOLIDAYS.map((h) => ({ zh: h.chn, pin: h.pin, vi: h.vi })), ...UPGRADE_DEFS.map((u) => ({ zh: u.chn, pin: u.pin, vi: u.vi }))
];

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fmt = (v) => { const n = Math.round(Number(v) * 100) / 100; return Number.isInteger(n) ? String(n) : n.toFixed(2); };
export const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const pickOne = (arr) => (Array.isArray(arr) && arr.length ? arr[randInt(0, arr.length - 1)] : null);
export const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const py = (zh) => {
  try {
    return pinyin(zh, { toneType: 'symbol', nonZh: 'consecutive' })
      .replace(/\s+([，。！？、；：])/g, '$1').replace(/([，。！？、；：])(?=\S)/g, '$1 ').replace(/\s{2,}/g, ' ').trim();
  } catch (e) { return ''; }
};
export const say = (zh, vi) => ({ zh, pin: py(zh), vi });

const CUSTOMERS = [
  { id: 'xiaoyu', zh: '小雨', vi: 'Bé Mưa', img: '/assets/boba_customer_girl.jpg' },
  { id: 'xiaohao', zh: '小浩', vi: 'Tiểu Hạo', img: '/assets/boba_customer_boy.jpg' },
  { id: 'xiaotong', zh: '晓彤', vi: 'Hiểu Đồng', img: '/assets/boba_customer_xiaotong.jpg' },
  { id: 'linjie', zh: '林姐', vi: 'Chị Lâm', img: '/assets/boba_customer_linjie.jpg' },
  { id: 'wangshu', zh: '王叔', vi: 'Chú Vương', img: '/assets/boba_customer_wangshu.jpg' },
  { id: 'nainai', zh: '奶奶', vi: 'Bà nội', img: '/assets/boba_customer_grandma.jpg' },
  { id: 'abao', zh: '阿宝', vi: 'Gấu A Bảo', img: '/assets/boba_customer_abao.jpg' }
];

// ---------------------------------------------------------------------------------------------------------------------
// Âm thanh
// ---------------------------------------------------------------------------------------------------------------------
class ShopAudio {
  constructor() {
    this.ctx = null; this.sfx = true; this.voice = true; this.voices = [];
    if ('speechSynthesis' in window) {
      const load = () => { try { this.voices = window.speechSynthesis.getVoices(); } catch (e) { /* bỏ qua */ } };
      load();
      try { window.speechSynthesis.onvoiceschanged = load; } catch (e) { /* bỏ qua */ }
    }
  }
  init() {
    if (!this.ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) { try { this.ctx = new AC(); } catch (e) { this.ctx = null; } } }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }
  tone(freq, dur, { type = 'sine', vol = 0.22, delay = 0, slideTo = null } = {}) {
    if (!this.sfx) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.ctx.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  pick() { this.tone(330, 0.08, { slideTo: 560 }); }
  pop() { this.tone(420, 0.09, { slideTo: 700, vol: 0.18 }); }
  bell() { this.tone(1320, 0.5, { type: 'triangle', vol: 0.18 }); this.tone(1980, 0.4, { type: 'triangle', vol: 0.09, delay: 0.05 }); }
  error() { this.tone(160, 0.3, { type: 'sawtooth', slideTo: 110 }); }
  sad() { this.tone(400, 0.35, { type: 'triangle', vol: 0.16, slideTo: 220 }); }
  register() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 0.32, { type: 'triangle', delay: i * 0.08 })); }
  unlock() { [659.25, 880, 1174.66].forEach((f, i) => this.tone(f, 0.28, { type: 'triangle', delay: i * 0.09 })); }
  speak(text) {
    if (!this.voice || !('speechSynthesis' in window) || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN'; u.rate = 0.88; u.pitch = 1.05;
      if (!this.voices.length) this.voices = window.speechSynthesis.getVoices();
      const v = this.voices.find((x) => /zh|cmn/i.test(x.lang));
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) { /* bỏ qua */ }
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Máy chủ + bản lưu trên máy (tách theo tài khoản)
// ---------------------------------------------------------------------------------------------------------------------
function makeCloud(key) {
  const cloud = {
    key,
    apiBase() {
      const h = window.location.hostname;
      if (window.location.protocol === 'file:' || h === 'localhost' || h === '127.0.0.1' || h === '') return 'http://localhost:5000';
      if (h.includes('tieng-trung-hong-tai-1.onrender.com')) return 'https://tiengtrunghongtai.online';
      return window.location.origin;
    },
    token() {
      try { const t = localStorage.getItem('session_token') || localStorage.getItem('sessionToken') || ''; return t && !['null', 'undefined', 'guest'].includes(t) ? t : ''; } catch (e) { return ''; }
    },
    localUser() {
      try { const u = JSON.parse(localStorage.getItem('user') || localStorage.getItem('currentUser') || 'null'); return u && u.email ? u : null; } catch (e) { return null; }
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
      } finally { if (timer) clearTimeout(timer); }
    },
    getProgress() { return this.request(`/api/${key}/progress`); },
    post(body) { return this.request(`/api/${key}/progress`, { method: 'POST', body: JSON.stringify(body), keepalive: true }); },
    getLeaderboard() { return this.request(`/api/${key}/leaderboard?limit=50`); }
  };
  const local = {
    k(owner) { return `${key}_save_${owner || 'guest'}`; },
    read(owner) { try { const s = JSON.parse(localStorage.getItem(this.k(owner)) || 'null'); return s && s.v === SAVE_VERSION ? s : null; } catch (e) { return null; } },
    write(owner, s) { try { localStorage.setItem(this.k(owner), JSON.stringify(s)); } catch (e) { /* bỏ qua */ } },
    clear(owner) { try { localStorage.removeItem(this.k(owner)); } catch (e) { /* bỏ qua */ } }
  };
  return { cloud, local };
}

// ---------------------------------------------------------------------------------------------------------------------
// Khung HTML
// ---------------------------------------------------------------------------------------------------------------------
function template(cfg) {
  return `
<div class="sh-stage sh-${cfg.key}" id="sh-stage">
  <section class="sh-title" id="sh-title">
    <div class="sh-title-sun" aria-hidden="true"></div>
    <div class="sh-title-leaves" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span></div>
    <a href="/shop-games.html" class="sh-title-home"><i class="fa-solid fa-arrow-left"></i> Kệ game</a>
    <a href="/index.html" class="sh-account guest" id="sh-account" title="Đăng nhập để lưu thành tích">
      <span class="sh-account-av" id="sh-account-av"><i class="fa-solid fa-user"></i></span>
      <span class="sh-account-tx"><strong id="sh-account-name">Khách</strong><small id="sh-account-status">Đăng nhập để lưu thành tích</small></span>
    </a>
    <div class="sh-logo">
      <div class="sh-logo-awning" aria-hidden="true"></div>
      <div class="sh-logo-board"><span class="sh-logo-zh zh">${cfg.chn}</span><span class="sh-logo-pin">${cfg.pin}</span></div>
      <div class="sh-logo-ribbon">${esc(cfg.title)}</div>
      <div class="sh-title-progress" id="sh-title-progress"></div>
    </div>
    <div class="sh-menu">
      <button type="button" class="sh-btn-play" id="sh-btn-play"><span class="zh" id="sh-play-zh">开门营业</span><b id="sh-play-vi">Bắt đầu</b><i class="fa-solid fa-play"></i></button>
      <div class="sh-menu-sub">
        <button type="button" class="sh-btn-sub" id="sh-btn-guide"><span>📖</span><span><span class="zh">玩法说明</span> Hướng dẫn</span></button>
        <button type="button" class="sh-btn-sub" id="sh-btn-rank"><span>🏆</span><span><span class="zh">排行榜</span> Xếp hạng</span></button>
      </div>
    </div>
    <div class="sh-title-cat" aria-hidden="true"><span class="cat-body">${cfg.emoji}</span><span class="cat-zz">${cfg.mascotSay || '欢迎'}</span></div>
  </section>

  <header class="sh-hud">
    <div class="sh-hud-row">
      <button type="button" class="sh-circle" id="sh-hud-home" title="Về màn hình chính"><i class="fa-solid fa-house"></i></button>
      <button type="button" class="sh-circle" id="sh-hud-pause" title="Tạm dừng & cài đặt"><i class="fa-solid fa-pause"></i></button>
      <button type="button" class="sh-circle moon" id="sh-hud-close" title="打烊 · Đóng cửa sớm" style="display:none"><i class="fa-solid fa-moon"></i></button>
      <div class="sh-pill"><span>🪙</span><span class="sh-pill-tx"><small>资金 · Vốn</small><strong id="sh-money">0</strong></span></div>
      <div class="sh-pill"><span>📅</span><span class="sh-pill-tx"><small>Ngày</small><strong class="zh" id="sh-day">第1天</strong></span></div>
      <div class="sh-pill clock"><span id="sh-clock-ic">⏳</span><span class="sh-pill-tx"><small id="sh-clock-lb">Giờ bán</small><strong id="sh-clock">08:00</strong></span><span class="sh-bar"><i id="sh-clock-fill"></i></span></div>
      <div class="sh-pill" id="sh-weather-pill" title="Dự báo thời tiết"><span id="sh-weather-ic">☀️</span><span class="sh-pill-tx"><small>天气</small><strong class="zh" id="sh-weather">晴天</strong></span></div>
      <div class="sh-pill goal"><span>🎯</span><span class="sh-pill-tx"><small><span class="zh">今日目标</span></small><strong id="sh-goal">0 / 0</strong></span><span class="sh-bar"><i id="sh-goal-fill"></i></span></div>
      <button type="button" class="sh-pill action" id="sh-hud-vocab" title="Sổ từ vựng"><span>📖</span><span class="sh-pill-tx"><small class="zh">生词本</small><strong id="sh-vocab">0/0</strong></span></button>
      <button type="button" class="sh-pill action stock" id="sh-hud-market" title="Mở thêm hàng"><span>📦</span><span class="sh-pill-tx"><small class="zh">进货</small><strong>Nhập hàng</strong></span></button>
    </div>
  </header>

  <div class="sh-rail"><span class="sh-rail-lb">🧾 <span class="zh">排队</span></span><div class="sh-rail-q" id="sh-rail-q"></div><span class="sh-rail-info" id="sh-rail-info"></span></div>

  <main class="sh-main">
    <section class="sh-station active" id="st-greet"></section>
    <section class="sh-station" id="st-prep"></section>
    <section class="sh-station" id="st-pay"></section>
  </main>

  <nav class="sh-tabs">
    <button type="button" class="sh-tab active" data-st="greet"><span>🛎️</span><b class="zh">接待</b><small>1. Đón khách</small></button>
    <button type="button" class="sh-tab" data-st="prep"><span>${cfg.prepIcon}</span><b class="zh">${cfg.prepZh}</b><small>2. ${esc(cfg.prepVi)}</small></button>
    <button type="button" class="sh-tab" data-st="pay"><span>💬</span><b class="zh">收银台</b><small>3. Thanh toán</small></button>
  </nav>

  <div class="sh-toasts" id="sh-toasts"></div>
  <div id="sh-modals"></div>
</div>`;
}

export function buildGuide(prep, expand) {
  return [
    { icon: '🕗', title: 'Mở cửa 08:00 → 20:00', text: 'Mỗi ngày bán khoảng 5 phút, khách đến thong thả (mưa bão khách thưa, ngày lễ khách đông). Có mục tiêu doanh thu, số khách bỏ về và tỉ lệ hội thoại thanh toán đúng ngay lần đầu.' },
    { icon: '📦', title: '进货 · Nhập hàng trước khi mở cửa', text: 'Đầu ngày xem <b>天气预报 dự báo thời tiết</b>, bấm <b>Nhập hàng</b> để bổ sung kho rồi mới <b>Mở cửa</b>. Hết hàng thì khách ra về tay không.' },
    { icon: '🛎️', title: 'Đón khách', text: 'Khách xếp hàng; chờ quá lâu sẽ bỏ về. Nghe câu gọi hàng tiếng Trung rồi bấm <b>Nhận đơn</b>.' },
    prep,
    { icon: '💬', title: 'Thanh toán bằng hội thoại', text: 'Khách hỏi tính tiền. Đọc <b>hóa đơn</b>, chọn câu tiếng Trung đúng: nói tổng tiền và hỏi <b>转账 chuyển khoản</b> hay <b>现金 tiền mặt</b>, nhận tiền hoặc mời quét mã, rồi chào cảm ơn. Chọn sai sẽ bị trừ điểm.' },
    { icon: '🔧', title: '升级 · Mở rộng & nâng cấp', text: 'Dùng tiền kiếm được để mở ' + expand + ', nâng cấp biển hiệu, ghế chờ, giờ mở cửa. Cuối ngày xem <b>feedback của khách</b> và lãi lỗ.' }
  ];
}

function headCard(id, title, body, cls = '') {
  return '<div class="sh-modal" id="' + id + '" style="display:none"><div class="sh-card gcard ' + cls + '"><div class="sh-card-head"><h3>' + title + '</h3><button type="button" class="sh-close" data-close="' + id + '" aria-label="Đóng"><i class="fa-solid fa-xmark"></i></button></div>' + body + '</div></div>';
}

function modalShell(id, inner, cls = '') {
  return `<div class="sh-modal" id="${id}" style="display:none"><div class="sh-card ${cls}">${inner}</div></div>`;
}

// ---------------------------------------------------------------------------------------------------------------------
// GAME
// ---------------------------------------------------------------------------------------------------------------------
export class ShopGame {
  constructor(cfg, mode) {
    this.cfg = cfg;
    this.mode = mode;
    this.audio = new ShopAudio();
    const { cloud, local } = makeCloud(cfg.key);
    this.cloudApi = cloud;
    this.localSave = local;
    this.showPin = true;
    this.showVi = true;
    this.relaxed = false;
    this.pace = cfg.pace || 1;
    // giá vốn nhập hàng + sức chứa kho của từng món; sổ từ vựng gồm cả từ thời tiết / ngày lễ / nâng cấp
    this.mode.products.forEach((p) => { if (p.cost == null) p.cost = Math.round(p.price * (cfg.costRate || 0.55) * 100) / 100; if (!p.maxStock) p.maxStock = cfg.maxStock; });
    this.vocabList = [...mode.vocab, ...EXTRA_VOCAB];
    this.marketTab = 'stock';

    this.resetProgress();
    this.dayStarted = false; this.dayEnded = false; this.closed = false;
    this.gameTime = 0; this.lastTick = performance.now();
    this.line = []; this.current = null; this.ticketSeq = 0; this.deck = []; this.nextArrivalAt = 0;
    this.stats = this.freshStats();
    this.station = 'greet';
    this.sel = null;
    this.chatIdx = 0; this.nextChatAt = 0;

    const lu = this.cloudApi.localUser();
    this.owner = lu ? String(lu.email).toLowerCase().trim() : 'guest';
    this.cloud = { checked: false, loggedIn: false, offline: false, name: '', picture: '', best: null, history: [] };
    this.rankTab = 'global';
    const saved = this.localSave.read(this.owner);
    if (saved) this.applySnapshot(saved);

    this.mount();
    this.renderAll();
    this.showTitle();
    this.timer = setInterval(() => this.tick(), 200);
    this.initCloud().catch(() => {}).finally(() => { this.cloud.checked = true; this.renderAccount(); if (this.titleVisible()) this.showTitle(); });
  }

  // --------------------------------------------------------------------------- tiến trình
  resetProgress() {
    this.money = this.cfg.startMoney;
    this.day = 1;
    this.zonesOpen = new Set(this.mode.zones.filter((z) => !z.unlock).map((z) => z.id));
    this.itemsOpen = new Set(this.mode.products.filter((p) => !p.unlockCost).map((p) => p.id));
    this.vocab = new Set();
    this.records = [];
    this.savedAt = 0;
    this.stock = {};
    this.mode.products.forEach((p) => { if (this.itemsOpen.has(p.id) && this.zonesOpen.has(p.zone)) this.stock[p.id] = this.cfg.starter; });
    this.upgrades = { sign: 0, seats: 0, hours: 0 };
    this.todayEvent = null;
    this.restockQty = {};
  }
  snapshot(dayOverride = null) {
    return {
      v: SAVE_VERSION,
      day: dayOverride || this.day,
      money: Math.round(this.money * 100) / 100,
      zones: [...this.zonesOpen],
      items: [...this.itemsOpen],
      vocab: [...this.vocab].slice(0, 400),
      records: this.records.slice(-30),
      relaxed: !!this.relaxed,
      stock: Object.fromEntries(Object.entries(this.stock).filter(([, n]) => n > 0)),
      upgrades: { ...this.upgrades },
      event: this.todayEvent,
      updatedAt: Date.now()
    };
  }
  applySnapshot(s) {
    if (!s || s.v !== SAVE_VERSION) return false;
    const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
    this.resetProgress();
    this.day = Math.max(1, Math.round(num(s.day, 1)));
    this.money = Math.round(num(s.money, this.cfg.startMoney) * 100) / 100;
    if (Array.isArray(s.zones)) s.zones.forEach((z) => { if (this.mode.zones.some((x) => x.id === z)) this.zonesOpen.add(z); });
    if (Array.isArray(s.items)) s.items.forEach((i) => { if (this.mode.products.some((x) => x.id === i)) this.itemsOpen.add(i); });
    if (Array.isArray(s.vocab)) s.vocab.forEach((w) => { if (typeof w === 'string') this.vocab.add(w); });
    this.records = Array.isArray(s.records) ? s.records.filter((r) => r && Number.isFinite(Number(r.earnings))) : [];
    this.relaxed = !!s.relaxed;
    if (s.stock && typeof s.stock === 'object') {
      this.stock = {};
      Object.entries(s.stock).forEach(([id, n]) => { if (this.mode.products.some((x) => x.id === id)) this.stock[id] = Math.max(0, Math.min(this.cfg.maxStock, Math.round(num(n, 0)))); });
    }
    if (s.upgrades && typeof s.upgrades === 'object') UPGRADE_DEFS.forEach((u) => { this.upgrades[u.id] = Math.min(u.costs.length, Math.max(0, Math.round(num(s.upgrades[u.id], 0)))); });
    if (s.event && typeof s.event === 'object' && this.eventInfo(s.event)) this.todayEvent = { day: num(s.event.day, 0), kind: s.event.kind, id: s.event.id };
    // bản lưu cũ chưa có mặt hàng mới (vd: nước chấm của Cá Viên): luôn mở các khu / món miễn phí và cấp hàng khởi đầu
    this.mode.zones.forEach((z) => { if (!z.unlock) this.zonesOpen.add(z.id); });
    this.mode.products.forEach((p) => { if (!p.unlockCost) this.itemsOpen.add(p.id); });
    this.mode.products.forEach((p) => { if (this.itemsOpen.has(p.id) && this.zonesOpen.has(p.zone) && this.stock[p.id] === undefined) this.stock[p.id] = this.cfg.starter; });
    this.savedAt = num(s.updatedAt, 0);
    return true;
  }
  dayInProgress() { return this.dayStarted && !this.dayEnded; }
  saveProgress(dayOverride = null, force = false) {
    if (this.dayInProgress() && !dayOverride && !force) return;
    const snap = this.snapshot(dayOverride);
    this.savedAt = snap.updatedAt;
    this.localSave.write(this.owner, snap);
    if (this.cloud.loggedIn) this.cloudApi.post({ save: snap }).catch(() => { /* lần sau gửi lại */ });
  }

  // --------------------------------------------------------------------------- tiện ích
  $(id) { return document.getElementById(id); }
  setText(id, t) { const e = this.$(id); if (e) e.textContent = t; }
  unlockedProducts() {
    const list = this.mode.products.filter((p) => this.zonesOpen.has(p.zone) && this.itemsOpen.has(p.id));
    list.forEach((p) => { p.stockNow = this.stock[p.id] || 0; });   // thẻ hàng hiện số tồn kho
    return list;
  }
  toast(icon, text, kind = '') {
    const box = this.$('sh-toasts'); if (!box) return;
    const t = document.createElement('div');
    t.className = `sh-toast ${kind}`;
    t.innerHTML = `<span>${icon}</span><span>${esc(text)}</span>`;
    box.appendChild(t);
    while (box.children.length > 2) box.firstChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 2800);
  }
  learn(words) {
    (Array.isArray(words) ? words : [words]).forEach((w) => { if (w) this.vocab.add(w); });
    this.updateHud();
  }
  modalOpen() { return [...document.querySelectorAll('.sh-modal')].some((m) => m.style.display && m.style.display !== 'none'); }
  titleVisible() { const t = this.$('sh-title'); return !!t && !t.classList.contains('hidden'); }
  clockPaused() { return this.titleVisible() || this.modalOpen() || document.hidden; }
  openModal(id) { const m = this.$(id); if (m) m.style.display = 'flex'; }
  closeModal(id) { const m = this.$(id); if (m) m.style.display = 'none'; }
  zh(t) { return `<span class="zh">${esc(t)}</span>`; }
  sayHtml(s, cls = '') {
    return `<div class="sh-say ${cls}"><b class="zh">${esc(s.zh)}</b>${this.showPin ? `<small class="pin">${esc(s.pin)}</small>` : ''}${this.showVi ? `<small class="vi">${esc(s.vi)}</small>` : ''}</div>`;
  }

  // --------------------------------------------------------------------------- dựng DOM
  mount() {
    const root = document.getElementById('shop-root');
    root.innerHTML = template(this.cfg);
    const m = this.$('sh-modals');
    m.innerHTML = [
      headCard('m-guide', '📖 <span class="zh">玩法说明</span> · Hướng dẫn chơi',
        '<div class="sh-gsteps">' + this.cfg.guideSteps.map((s, i) => '<div class="sh-gstep"><i>' + (i + 1) + '</i><span>' + s.icon + '</span><div><b class="gt">' + s.title + '</b><p>' + s.text + '</p></div></div>').join('')
        + '<div class="sh-gtip">💾 Tiến trình được lưu: thoát ra vào lại vẫn ở đúng ngày (thoát giữa ngày thì chơi lại ngày đó). Đăng nhập để lưu vào tài khoản và ghi kỷ lục lên <b>Bảng xếp hạng</b>.</div></div>', 'guide'),
      headCard('m-rank', '🏆 <span class="zh">排行榜</span> · Bảng xếp hạng',
        '<div class="sh-ranktabs"><button type="button" class="sh-ranktab active" data-rank="global">🌏 <span class="zh">全服</span> Toàn hệ thống</button><button type="button" class="sh-ranktab" data-rank="mine">📒 <span class="zh">我的</span> Ngày bán của tôi</button></div>'
        + '<div class="sh-rank-sum" id="rank-sum"></div><div class="sh-rank-list" id="rank-list"></div><div class="sh-rank-note" id="rank-note"></div>', 'rank'),
      modalShell('m-fit', `<h3>🪞 <span class="zh">试衣间</span> Phòng thử đồ</h3><div class="sh-chat-box" id="fit-chat"></div><div id="fit-anim"></div><div class="sh-opts" id="fit-opts"></div><button type="button" class="sh-btn" id="btn-fit-done" style="display:none">Tiếp tục ➜</button>`, 'wide'),
      modalShell('m-vocab', `<h3>📖 <span class="zh">生词本</span> Sổ từ vựng</h3><div class="sh-vocab-sub" id="vocab-sub"></div><div class="sh-vocab" id="vocab-list"></div><button type="button" class="sh-btn" data-close="m-vocab">Đóng</button>`, 'wide'),
      modalShell('m-market', `<h3>📦 <span class="zh">进货市场</span> Chợ nhập hàng</h3><div class="sh-market-money" id="market-money"></div>
        <div class="sh-ranktabs"><button type="button" class="sh-ranktab" data-mtab="stock">📦 Nhập hàng</button><button type="button" class="sh-ranktab" data-mtab="unlock">🔓 Mở rộng</button><button type="button" class="sh-ranktab" data-mtab="upgrade">🔧 Nâng cấp</button></div>
        <div class="sh-market" id="market-list"></div><div class="sh-row" id="market-foot"></div><button type="button" class="sh-btn ghost" data-close="m-market">Đóng</button>`, 'wide'),
      modalShell('m-pause', `<h3>⏸️ Tạm dừng</h3>
        <label class="sh-set"><input type="checkbox" id="set-pin" checked> Hiện pinyin</label>
        <label class="sh-set"><input type="checkbox" id="set-vi" checked> Hiện nghĩa tiếng Việt</label>
        <label class="sh-set"><input type="checkbox" id="set-voice" checked> Đọc tiếng Trung thành tiếng</label>
        <label class="sh-set"><input type="checkbox" id="set-relaxed"> Chế độ thư thả (khách không bỏ về)</label>
        <button type="button" class="sh-btn" data-close="m-pause">▶️ Tiếp tục chơi</button>
        <button type="button" class="sh-btn ghost" id="btn-reset">🗑️ Chơi lại từ đầu</button>`),
      modalShell('m-mission', `<h3 id="mission-title"></h3><div id="mission-body"></div><div class="sh-row"><button type="button" class="sh-btn ghost" id="btn-mission-market">📦 <span class="zh">进货</span> Nhập hàng</button><button type="button" class="sh-btn" id="btn-open-shop"><span class="zh">开门</span> Mở cửa</button></div>`),
      modalShell('m-score', `<div id="score-body"></div><button type="button" class="sh-btn" id="btn-score-next"><span class="zh">继续营业</span> Tiếp tục bán hàng ➜</button>`, 'score'),
      modalShell('m-summary', `<div id="summary-body"></div>
        <div class="sh-row"><button type="button" class="sh-btn ghost" id="btn-sum-market">📦 Nhập hàng</button><button type="button" class="sh-btn" id="btn-sum-next"><span class="zh">下一天</span> Ngày mới</button></div>`, 'wide')
    ].join('');
    this.bind();
  }

  bind() {
    const on = (id, ev, fn) => { const e = this.$(id); if (e) e.addEventListener(ev, fn); };
    on('sh-btn-play', 'click', () => this.onPlay());
    on('sh-btn-guide', 'click', () => { this.audio.init(); this.openModal('m-guide'); });
    on('sh-btn-rank', 'click', () => { this.audio.init(); this.openRank(); });
    on('sh-hud-home', 'click', () => { this.audio.pop(); this.showTitle(); });
    on('sh-hud-pause', 'click', () => { this.audio.pop(); this.openModal('m-pause'); });
    on('sh-hud-close', 'click', () => this.closeEarly());
    on('sh-hud-vocab', 'click', () => { this.renderVocab(); this.openModal('m-vocab'); });
    on('sh-hud-market', 'click', () => { this.marketTab = 'stock'; this.renderMarket(); this.openModal('m-market'); });
    on('btn-open-shop', 'click', () => { this.closeModal('m-mission'); this.startDay(); });
    on('btn-mission-market', 'click', () => { this.openMarketFrom('m-mission'); });
    document.querySelectorAll('[data-mtab]').forEach((b) => b.addEventListener('click', () => { this.marketTab = b.dataset.mtab; this.renderMarket(); }));
    on('btn-score-next', 'click', () => this.closeScore());
    on('btn-sum-next', 'click', () => this.nextDay());
    on('btn-sum-market', 'click', () => { this.openMarketFrom('m-summary'); });
    on('btn-reset', 'click', () => this.resetAll());
    on('set-pin', 'change', (e) => { this.showPin = e.target.checked; this.renderAll(); });
    on('set-vi', 'change', (e) => { this.showVi = e.target.checked; this.renderAll(); });
    on('set-voice', 'change', (e) => { this.audio.voice = e.target.checked; });
    on('set-relaxed', 'change', (e) => { this.relaxed = e.target.checked; });
    document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => { this.closeModal(b.dataset.close); if (b.dataset.close === 'm-market') { this.restockQty = {}; this.saveProgress(null, true); this.updateHud(); if (this.marketBack) { const back = this.marketBack; this.marketBack = null; if (back === 'm-mission') this.showMission(); else this.openModal(back); } } }));
    document.querySelectorAll('.sh-ranktab').forEach((b) => b.addEventListener('click', () => this.switchRank(b.dataset.rank)));
    document.querySelectorAll('.sh-tab').forEach((b) => b.addEventListener('click', () => this.goStation(b.dataset.st)));
    const stage = this.$('sh-stage');
    stage.addEventListener('click', (e) => {
      const rf = e.target.closest('[data-refresh-phrase]');
      if (rf) { const p = pickOne(this.cfg.chat); const box = this.$('sh-phrase-body'); if (p && box) { box.innerHTML = this.sayHtml(p); this.audio.speak(p.zh); } return; }
      const sayBtn = e.target.closest('[data-say]');
      if (sayBtn) { this.audio.speak(sayBtn.dataset.say); return; }
      const opt = e.target.closest('[data-pay-opt]');
      if (opt) this.choosePay(+opt.dataset.payOpt);
    });
  }

  // --------------------------------------------------------------------------- màn hình chờ
  showTitle() {
    const t = this.$('sh-title'); if (t) t.classList.remove('hidden');
    document.body.classList.add('on-title');
    const next = this.dayInProgress();
    this.setText('sh-play-zh', next ? '继续营业' : '开门营业');
    this.setText('sh-play-vi', next ? `Tiếp tục · Ngày ${this.day}` : this.day > 1 ? `Chơi tiếp · Ngày ${this.day}` : 'Bắt đầu');
    const p = this.$('sh-title-progress');
    if (p) {
      const known = this.vocabList.filter((w) => this.vocab.has(w.zh)).length;
      p.innerHTML = this.day > 1 || this.records.length || this.dayInProgress()
        ? `<span>📅 <span class="zh">第${this.day}天</span></span><span>🪙 ${fmt(this.money)} ¥</span><span>📖 ${known}/${this.vocabList.length} từ</span>` : '';
    }
  }
  hideTitle() { const t = this.$('sh-title'); if (t) t.classList.add('hidden'); document.body.classList.remove('on-title'); }
  onPlay() {
    this.audio.init();
    this.hideTitle();
    if (!this.dayStarted) this.showMission();
  }

  // --------------------------------------------------------------------------- ngày
  freshStats() { return { revenue: 0, cost: 0, served: 0, spawned: 0, lost: 0, scoreSum: 0, firstTry: 0, dlgFirst: 0, reviews: [] }; }
  goal() { return this.cfg.goal(this.day); }
  dayMs() { return (this.cfg.dayMs || 300000) + (this.upgrades.hours || 0) * 25000; }
  closeMin() { return CLOSE_MIN + (this.upgrades.hours || 0) * 60; }
  patienceMs() { return this.relaxed ? Infinity : Math.max(110000, 170000 - (this.day - 1) * 3000) + (this.upgrades.seats || 0) * 20000; }
  demand() { const ev = this.eventInfo(this.todayEvent); return (ev ? ev.demand : 1) * (1 + 0.12 * (this.upgrades.sign || 0)); }
  // khách đến thưa thớt (~1 khách mỗi 50–70 giây thật) vì mỗi đơn còn có hội thoại thanh toán
  arrivalGap() { return ((Math.max(34000, 50000 - (this.day - 1) * 1200) + Math.random() * 20000) * this.pace) / this.demand(); }
  clockMinutes() {
    if (!this.dayStarted) return OPEN_MIN;
    return OPEN_MIN + Math.floor(Math.min(1, this.gameTime / this.dayMs()) * (this.closeMin() - OPEN_MIN));
  }
  eventInfo(e) {
    if (!e) return null;
    if (e.kind === 'holiday') { const h = HOLIDAYS.find((x) => x.id === e.id); return h ? { ...h, kind: 'holiday', demand: EVENT_RULES.holidayDemand } : null; }
    const w = WEATHERS.find((x) => x.id === e.id);
    return w ? { ...w, kind: 'weather' } : null;
  }
  rollEvent() {
    if (this.todayEvent && this.todayEvent.day === this.day) return this.todayEvent;
    let ev;
    if (this.day < EVENT_RULES.firstEventDay) ev = { kind: 'weather', id: 'sunny' };
    else if (Math.random() < EVENT_RULES.holidayChance) ev = { kind: 'holiday', id: pickOne(HOLIDAYS).id };
    else {
      const total = WEATHERS.reduce((a, w) => a + w.w, 0);
      let r = Math.random() * total;
      ev = { kind: 'weather', id: (WEATHERS.find((x) => (r -= x.w) < 0) || WEATHERS[0]).id };
    }
    this.todayEvent = { day: this.day, ...ev };
    return this.todayEvent;
  }
  eventSay(ev) { return ev.kind === 'holiday' ? '今天是' + ev.chn + '！' + ev.greet : '今天' + ev.chn + '。'; }
  stockCount() { return this.mode.products.filter((p) => this.zonesOpen.has(p.zone) && this.itemsOpen.has(p.id) && (this.stock[p.id] || 0) > 0).length; }

  showMission() {
    const g = this.goal();
    const ev = this.eventInfo(this.rollEvent());
    this.setText('mission-title', '第' + this.day + '天 · Ngày ' + this.day);
    let evHtml = '';
    if (ev) {
      const pct = Math.round((ev.demand * (1 + 0.12 * (this.upgrades.sign || 0)) - 1) * 100);
      const effect = pct > 0 ? '<b class="up">Khách +' + pct + '%</b>' : pct < 0 ? '<b class="down">Khách ' + pct + '%</b>' : '<b>Khách bình thường</b>';
      const head = ev.kind === 'holiday' ? '🎉 <span class="zh">节日</span> · Hôm nay là ngày lễ' : '📻 <span class="zh">天气预报</span> · Dự báo thời tiết';
      evHtml = '<div class="sh-event ' + ev.kind + '"><div class="sh-event-head">' + head + '</div><div class="sh-event-main"><span class="sh-event-ic">' + ev.icon + '</span><div><b class="zh">' + esc(ev.chn) + (ev.kind === 'holiday' ? ' ' + esc(ev.greet) : '') + '</b><small>' + esc(ev.pin) + ' · ' + esc(ev.vi) + '</small></div><button type="button" class="sh-say-btn" data-say="' + esc(this.eventSay(ev)) + '"><i class="fa-solid fa-volume-high"></i></button></div><div class="sh-event-eff">' + effect + ' · ' + esc(ev.kind === 'holiday' ? 'Ngày lễ khách đông hơn — nhập nhiều hàng nhé!' : ev.note) + '</div></div>';
      this.learn([ev.chn, ev.kind === 'holiday' ? '节日' : '天气']);
    }
    const open = this.mode.products.filter((p) => this.zonesOpen.has(p.zone) && this.itemsOpen.has(p.id));
    const have = this.stockCount();
    const stockLine = have === 0 ? '<div class="sh-mrow warn">⚠️ <b>Kho đang trống!</b> Hãy nhập hàng trước khi mở cửa.</div>' : '<div class="sh-mrow">📦 Kho: còn hàng <b>' + have + '/' + open.length + '</b> món — nhập thêm trước khi mở cửa nhé.</div>';
    this.$('mission-body').innerHTML = evHtml + '<div class="sh-mission">' + stockLine
      + '<div class="sh-mrow">🎯 Doanh thu đạt <b>' + fmt(g) + ' ¥</b></div><div class="sh-mrow">⭐ Điểm phục vụ trung bình từ <b>80%</b></div><div class="sh-mrow">💬 Hội thoại thanh toán đúng ngay lần đầu từ <b>80%</b> số khách</div>'
      + '<div class="sh-mnote">Tiệm mở 08:00 → 20:00 (tính theo thời gian), khách đến thong thả. Nhập hàng xong mới mở cửa; mỗi ⭐ đạt được thưởng thêm tiền.</div></div>';
    this.saveProgress(null, true);   // chốt luôn thời tiết hôm nay (tải lại trang không đổi được thời tiết)
    this.updateHud();
    this.openModal('m-mission');
  }

  startDay() {
    this.dayStarted = true; this.dayEnded = false; this.closed = false;
    this.gameTime = 0; this.nextArrivalAt = 2500; this.nextChatAt = 4000;
    this.line = []; this.current = null; this.sel = null;
    this.station = 'greet';
    this.saveProgress(null, true);   // mốc đầu ngày: thoát giữa ngày thì vào lại chơi lại từ đây
    this.audio.bell();
    this.renderAll();
  }

  closeEarly() {
    if (!this.dayInProgress() || this.closed) return;
    if (!window.confirm('Đóng cửa sớm? Khách đang chờ vẫn sẽ được phục vụ nốt.')) return;
    this.closed = true;
    this.renderAll();
  }

  tick() {
    const now = performance.now();
    const dt = Math.min(1000, now - this.lastTick);
    this.lastTick = now;
    if (this.clockPaused() || !this.dayInProgress()) return;
    this.gameTime += dt;
    if (!this.closed && this.gameTime >= this.dayMs()) {
      this.closed = true; this.audio.bell();
      this.toast('🌙', '打烊 Hết giờ bán hôm nay! Phục vụ nốt khách đang chờ nhé.');
      this.renderAll();
    }
    if (!this.closed && this.gameTime >= this.nextArrivalAt) {
      if (this.line.length < MAX_LINE) this.spawn(); else this.nextArrivalAt = this.gameTime + 2000;
    }
    if (!this.relaxed) {
      [...this.line].forEach((c) => { if (this.gameTime - c.arrivedAt >= this.patienceMs()) this.loseCustomer(c); });
      const cur = this.current;
      if (cur && !cur.takenAt && this.gameTime - cur.arrivedAt >= this.patienceMs()) this.loseCustomer(cur);
    }
    if (!this.current) this.promote();
    if (!this.current && this.dayStarted && !this.closed && this.gameTime >= this.nextChatAt) { this.chatIdx += 1; this.nextChatAt = this.gameTime + 6500; this.renderGreet(); }
    this.updateClock(); this.updatePatience();
    if (this.closed && !this.line.length && !this.current && !this.modalOpen()) this.showSummary();
  }

  nextProfile() {
    const present = new Set([...this.line.map((c) => c.profile.id), this.current && this.current.profile.id]);
    for (let i = 0; i < CUSTOMERS.length * 2; i++) {
      if (!this.deck.length) this.deck = shuffle(CUSTOMERS);
      const c = this.deck.shift();
      if (!present.has(c.id)) return c;
    }
    return pickOne(CUSTOMERS);
  }
  spawn() {
    this.ticketSeq += 1;
    const c = { id: this.ticketSeq, profile: this.nextProfile(), arrivedAt: this.gameTime, wrong: 0 };
    this.line.push(c);
    this.stats.spawned += 1;
    this.nextArrivalAt = this.gameTime + this.arrivalGap();
    this.audio.bell();
    if (this.current) this.toast('🔔', `${c.profile.zh} (${c.profile.vi}) vừa vào tiệm và đang xếp hàng.`);
    this.renderRail();
  }
  promote() {
    if (this.current || !this.line.length) return;
    const c = this.line.shift();
    const inStock = this.unlockedProducts().filter((p) => (this.stock[p.id] || 0) > 0);
    c.order = inStock.length ? this.mode.makeOrder({ day: this.day, products: inStock, stock: (id) => this.stock[id] || 0, fitChance: this.cfg.fitChance }) : null;
    if (!c.order) {
      this.current = c; this.sel = null; this.station = 'greet';
      this.audio.sad();
      this.toast('📦', 'Kho hết sạch hàng! Khách không mua được gì. Hãy bấm 进货 để nhập hàng!', 'warn');
      this.renderAll();
      setTimeout(() => { if (this.current === c) this.loseCustomer(c); }, 1800);
      return;
    }
    c.order.pay = Math.random() < 0.55 ? 'cash' : 'qr';
    this.current = c;
    this.sel = null;
    this.station = 'greet';
    this.renderAll();
    setTimeout(() => { if (this.current === c && !c.takenAt) this.audio.speak(c.order.say.zh); }, 450);
  }
  loseCustomer(c) {
    const isCur = this.current === c;
    if (isCur) { this.current = null; this.sel = null; } else this.line = this.line.filter((x) => x !== c);
    this.stats.lost += 1;
    this.audio.sad();
    this.toast('😠', c.order ? `${c.profile.zh} (${c.profile.vi}) chờ lâu quá nên bỏ về!` : `${c.profile.zh} (${c.profile.vi}) không mua được hàng nên ra về.`, 'warn');
    this.renderAll();
  }
  patienceUsed(c) { return c ? Math.min(1, (this.gameTime - c.arrivedAt) / this.patienceMs()) : 0; }

  // --------------------------------------------------------------------------- đơn hàng
  goStation(st) {
    if (st === 'prep' && !(this.current && this.current.takenAt)) return;
    if (st === 'pay' && !(this.current && this.current.billed)) return;
    this.station = st;
    this.renderAll();
  }
  takeOrder() {
    const c = this.current;
    if (!c || c.takenAt) return;
    c.takenAt = this.gameTime;
    c.waitScore = Math.max(50, Math.round(100 - 50 * this.patienceUsed(c)));
    this.learn(c.order.words || []);
    this.sel = this.mode.emptySel(c.order);
    this.station = 'prep';
    this.audio.pick();
    this.renderAll();
  }
  selChanged() { this.renderPrepFooter(); }
  confirmOrder() {
    const c = this.current;
    if (!c || !c.takenAt || c.billed) return;
    if (this.mode.pendingFit && this.mode.pendingFit(c)) {
      this.audio.error();
      this.toast('🪞', 'Khách xin thử đồ — hãy bấm “Đưa đi thử đồ” trước khi thanh toán nhé!', 'warn');
      return;
    }
    const bad = this.mode.diff(c.order, this.sel);
    if (bad.length) {
      c.wrong += 1;
      this.audio.error();
      this.toast('❌', `Chưa đúng: ${bad.join(' · ')}. Đọc lại lời khách rồi sửa nhé!`, 'warn');
      const b = this.$('btn-confirm'); if (b) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); }
      return;
    }
    // tiệm quần áo: thỉnh thoảng khách xin thử đồ trước khi tính tiền (có thể đổi size / màu hoặc mua thêm)
    if (this.mode.beforePay && !c.fitStarted) { c.fitStarted = true; if (this.mode.beforePay(this, c)) return; }
    this.startPayment(c);
  }
  startPayment(c) {
    c.billed = true;
    c.dlg = createCheckoutDialogue({ due: c.order.due, pay: c.order.pay });
    this.audio.register();
    this.station = 'pay';
    this.renderAll();
    if (c.dlg.log[0]) setTimeout(() => this.audio.speak(c.dlg.log[0].zh), 350);
  }
  tryOnClicked() {
    const c = this.current; if (!c || !c.takenAt || c.billed) return;
    if (!c.order.tryOn || c.fitDone) { this.toast('🪞', 'Khách không xin thử đồ.'); return; }
    const bad = this.mode.diff(c.order, this.sel);
    if (bad.length) { c.wrong += 1; this.audio.error(); this.toast('❌', 'Chọn đúng đồ cho khách rồi mới đưa đi thử: ' + bad.join(' · '), 'warn'); return; }
    c.fitDone = true;
    this.mode.startFitting(this, c);
  }
  finishFitting(c, res) {
    c.fitWrong = res.wrong || 0;
    if (this.current !== c) return;
    this.station = 'prep';
    this.renderAll();
    if (res.mutated) {
      this.toast('🪞', 'Khách thử đồ xong và đổi ý — sửa giỏ hàng cho đúng lời khách rồi bấm Thanh toán nhé!');
      if (c.order.say2) setTimeout(() => this.audio.speak(c.order.say2.zh), 400);
    } else this.toast('🪞', 'Khách thử xong và ưng ý — bấm “Thanh toán” nhé!');
  }
  choosePay(i) {
    const c = this.current;
    if (!c || !c.dlg || c.paid) return;
    const r = pickOption(c.dlg, i);
    if (r.ignored) return;
    if (!r.ok) { this.audio.error(); this.toast('❌', r.why || 'Chưa đúng, chọn lại nhé!', 'warn'); this.renderPay(); return; }
    this.audio.pick();
    this.renderPay();
    if (r.spoken && r.spoken.length) this.audio.speak(r.spoken.join('，'));
    if (r.finished) { c.paid = true; setTimeout(() => { if (this.current === c) this.completeOrder(); }, 900); }
  }

  completeOrder() {
    const c = this.current;
    if (!c) return;
    const units = this.mode.unitCount(c.order);
    const elapsed = this.gameTime - c.takenAt;
    const target = 45000 + 16000 * units;
    const scores = {
      pick: Math.max(0, 100 - 20 * c.wrong),
      speed: elapsed <= target ? 100 : Math.max(40, Math.round(100 - 60 * ((elapsed - target) / (2 * target)))),
      talk: Math.max(0, 100 - 25 * (c.dlg.wrong + (c.fitWrong || 0))),
      wait: c.waitScore ?? 100
    };
    const total = Math.round(scores.pick * 0.35 + scores.speed * 0.15 + scores.talk * 0.35 + scores.wait * 0.15);
    const busy = this.line.length >= 1;
    let tip = 0;
    if (busy && total >= 85 && c.dlg.wrong + (c.fitWrong || 0) === 0) tip = Math.round(this.cfg.tip * (total >= 95 ? 1.5 : 1) * 100) / 100;
    const earned = Math.round((c.order.due + tip) * 100) / 100;
    this.money = Math.round((this.money + earned) * 100) / 100;
    this.stats.revenue = Math.round((this.stats.revenue + earned) * 100) / 100;
    this.stats.served += 1;
    this.stats.scoreSum += total;
    if (c.wrong === 0 && c.dlg.wrong + (c.fitWrong || 0) === 0) this.stats.firstTry += 1;
    if (c.dlg.wrong + (c.fitWrong || 0) === 0) this.stats.dlgFirst += 1;
    this.mode.stockUse(c.order).forEach((u) => { this.stock[u.id] = Math.max(0, (this.stock[u.id] || 0) - u.qty); });
    this.audio.register();
    this.showScore(c, scores, total, tip, earned);
    this.current = null; this.sel = null;
    this.station = 'greet';   // thanh toán xong → tự nhảy về trạm Đón khách
    this.renderAll();
  }

  reviewFor(stars) {
    const list = this.cfg.reviews || [];
    let pool = list.filter((r) => r.stars === stars);
    if (!pool.length) {
      const tone = stars >= 4 ? ['Rất tích cực', 'Tích cực'] : stars === 3 ? ['Trung tính'] : ['Tiêu cực'];
      pool = list.filter((r) => tone.includes(r.tone));
    }
    return pickOne(pool.length ? pool : list);
  }
  showScore(c, scores, total, tip, earned) {
    const stars = total >= 90 ? 5 : total >= 75 ? 4 : total >= 60 ? 3 : total >= 40 ? 2 : 1;
    const rv = this.reviewFor(stars);
    if (rv) this.stats.reviews.push({ ...rv, stars, who: c.profile.zh + ' ' + c.profile.vi });
    const bar = (label, v) => `<div class="sh-sc-row"><span>${label}</span><div class="sh-sc-bar"><i style="width:${v}%"></i></div><b>${v}%</b></div>`;
    const tipBadge = tip > 0 ? '<small class="sh-tipb up">Phục vụ nhanh + đông khách nên có tip!</small>' : '<small class="sh-tipb">Bình thường không tip</small>';
    const phr = pickOne(this.cfg.chat);
    this.$('score-body').innerHTML =
      '<div class="sh-receipt-head"><span class="zh">🧾 结账小票</span><strong>Phiếu #' + c.id + ' · ' + esc(c.profile.zh) + '</strong></div>'
      + '<div class="sh-score-head"><img src="' + c.profile.img + '" alt=""><div><b>' + esc(c.profile.zh) + ' · ' + esc(c.profile.vi) + '</b><div class="sh-stars">' + '⭐'.repeat(stars) + '☆'.repeat(5 - stars) + '</div></div></div>'
      + (rv ? '<div class="sh-review"><div class="sh-review-tag">💬 <span class="zh">顾客评价</span> Đánh giá của khách</div>' + this.sayHtml(rv) + '<button type="button" class="sh-say-btn" data-say="' + esc(rv.zh) + '" title="Nghe lại"><i class="fa-solid fa-volume-high"></i></button></div>' : '')
      + '<div class="sh-sc-money"><div><span>Tiền hàng</span><b>' + fmt(c.order.due) + ' ¥</b></div><div><span>Tiền tip</span><b>' + (tip ? '+' + fmt(tip) : '0') + ' ¥</b>' + tipBadge + '</div><div class="tot"><span>Thực nhận</span><b>+' + fmt(earned) + ' ¥</b></div></div>'
      + bar('Chọn đúng đơn', scores.pick) + bar('Tốc độ', scores.speed) + bar('Hội thoại', scores.talk) + bar('Không để khách chờ', scores.wait)
      + '<div class="sh-sc-total">Điểm phục vụ: <b>' + total + '%</b></div>'
      + (phr ? '<div class="sh-phrase"><div class="sh-phrase-head"><span>🎓 <b>Mẫu câu giao tiếp</b> <small class="zh">(实用口语)</small></span><button type="button" class="sh-say-btn" data-refresh-phrase title="Đổi câu khác"><i class="fa-solid fa-rotate"></i></button></div><div class="sh-phrase-body" id="sh-phrase-body">' + this.sayHtml(phr) + '</div></div>' : '');
    this.openModal('m-score');
    if (rv) setTimeout(() => this.audio.speak(rv.zh), 300);
  }
  closeScore() {
    this.closeModal('m-score');
    this.station = 'greet';
    this.renderAll();
  }

  // --------------------------------------------------------------------------- tổng kết ngày
  evaluate() {
    const s = this.stats;
    const avg = s.served ? Math.round(s.scoreSum / s.served) : 0;
    const dlgPct = s.served ? Math.round((s.dlgFirst / s.served) * 100) : 0;
    return [
      { done: s.revenue >= this.goal(), text: `Doanh thu ≥ ${fmt(this.goal())} ¥`, value: `${fmt(s.revenue)} ¥` },
      { done: s.served > 0 && avg >= 80, text: 'Điểm phục vụ trung bình ≥ 80%', value: s.served ? `${avg}%` : '—' },
      { done: s.served > 0 && dlgPct >= 80, text: 'Hội thoại đúng ngay ≥ 80%', value: s.served ? `${dlgPct}%` : '—' }
    ];
  }
  showSummary() {
    if (this.dayEnded) return;
    this.dayEnded = true;
    const s = this.stats;
    const goals = this.evaluate();
    const stars = goals.filter((g) => g.done).length;
    const bonus = stars * this.cfg.starBonus;
    if (bonus > 0) this.money = Math.round((this.money + bonus) * 100) / 100;
    const avg = s.served ? Math.round(s.scoreSum / s.served) : 0;
    const first = s.served ? Math.round((s.dlgFirst / s.served) * 100) : 0;
    const msg = stars === 3 ? '🏆 Ngày hoàn hảo!' : goals[0].done ? '🎉 Đạt mục tiêu doanh thu!' : s.lost > s.served ? '😥 Nhiều khách bỏ về, mai nhanh tay hơn nhé!' : '💪 Chưa đạt mục tiêu, ngày mai cố lên!';
    this.$('summary-body').innerHTML = `
      <h3><span class="zh">第${this.day}天</span> · Tổng kết ngày</h3>
      <div class="sh-sum-grid">
        <div><small>Doanh thu</small><b>${fmt(s.revenue)} ¥</b></div>
        <div><small>Chi nhập hàng</small><b>${fmt(s.cost)} ¥</b></div>
        <div><small>Lãi</small><b class="${s.revenue - s.cost >= 0 ? 'pos' : 'neg'}">${s.revenue - s.cost >= 0 ? '+' : ''}${fmt(s.revenue - s.cost)} ¥</b></div>
        <div><small>Phục vụ</small><b>${s.served}/${s.spawned}</b></div>
        <div><small>Điểm TB</small><b>${s.served ? avg + '%' : '—'}</b></div>
        <div><small>Hội thoại đúng ngay</small><b>${s.served ? first + '%' : '—'}</b></div>
      </div>
      ${s.reviews.length ? '<div class="sh-fb"><div class="sh-fb-head">💬 <span class="zh">顾客反馈</span> Feedback của khách hôm nay · ⭐ ' + (s.reviews.reduce((a, r) => a + r.stars, 0) / s.reviews.length).toFixed(1) + '/5</div>' + s.reviews.slice(-4).map((r) => '<div class="sh-fb-row"><span>' + '⭐'.repeat(r.stars) + '</span><div><b class="zh">' + esc(r.zh) + '</b>' + (this.showVi ? '<small>' + esc(r.vi) + ' — ' + esc(r.who) + '</small>' : '') + '</div><button type="button" class="sh-say-btn" data-say="' + esc(r.zh) + '"><i class="fa-solid fa-volume-high"></i></button></div>').join('') + '</div>' : ''}
      <div class="sh-sum-msg">${msg}</div>
      <div class="sh-mres"><div class="sh-mres-head"><span>今日任务 · Nhiệm vụ</span><span>${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</span></div>
        ${goals.map((g) => `<div class="sh-mres-row ${g.done ? 'done' : 'fail'}"><span>${g.done ? '✅' : '❌'}</span><span>${esc(g.text)}</span><b>${esc(g.value)}</b></div>`).join('')}
        ${bonus ? `<div class="sh-mres-bonus">🎁 Thưởng nhiệm vụ: +${fmt(bonus)} ¥</div>` : ''}</div>`;
    const now = new Date();
    const record = { day: this.day, earnings: Math.round(s.revenue * 100) / 100, served: s.served, total: Math.max(1, s.spawned), lost: s.lost, avg, stars,
      date: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}` };
    this.records = this.records.filter((r) => r.day !== this.day);
    this.records.push(record);
    const snap = this.snapshot(this.day + 1);
    this.localSave.write(this.owner, snap);
    if (this.cloud.loggedIn) {
      if (s.spawned > 0 && s.served > 0) this.pushDayResult(record, snap); else this.cloudApi.post({ save: snap }).catch(() => {});
    } else if (this.cloud.checked) setTimeout(() => this.toast('🔐', 'Đăng nhập ở trang chủ để lưu thành tích lên bảng xếp hạng!'), 1500);
    this.updateHud();
    this.openModal('m-summary');
    this.audio.register();
  }
  nextDay() {
    this.closeModal('m-summary');
    this.day += 1;
    this.dayStarted = false; this.dayEnded = false; this.closed = false;
    this.line = []; this.current = null; this.sel = null;
    this.stats = this.freshStats();
    this.restockQty = {};
    this.saveProgress();
    this.renderAll();
    this.showMission();
  }
  resetAll() {
    if (!window.confirm('Xóa toàn bộ tiến trình của game này và chơi lại từ đầu?')) return;
    this.localSave.clear(this.owner);
    if (this.cloud.loggedIn) this.cloudApi.post({ resetSave: true }).catch(() => {});
    this.resetProgress();
    this.dayStarted = false; this.dayEnded = false; this.closed = false; this.line = []; this.current = null; this.sel = null;
    this.stats = this.freshStats();
    this.closeModal('m-pause');
    this.renderAll();
    this.showTitle();
  }

  // --------------------------------------------------------------------------- chợ nhập hàng (nhập hàng · mở rộng · nâng cấp)
  zoneName(z) { return z.icon + ' ' + esc(z.vi) + ' <span class="zh">' + esc(z.chn) + '</span>'; }
  zoneHint(z) { return this.mode.products.filter((p) => p.zone === z.id).length + ' món hàng'; }
  restockTotal() { return this.mode.products.reduce((a, p) => a + Math.round(p.cost * 100) * (this.restockQty[p.id] || 0), 0) / 100; }
  openMarketFrom(modalId) {
    this.marketBack = modalId;
    this.closeModal(modalId);
    this.marketTab = 'stock';
    this.renderMarket();
    this.openModal('m-market');
  }
  renderMarket() {
    this.setText('market-money', '🪙 Vốn hiện có: ' + fmt(this.money) + ' ¥' + (this.marketTab === 'stock' && this.restockTotal() > 0 ? '  ·  Đang chọn nhập: −' + fmt(this.restockTotal()) + ' ¥' : ''));
    document.querySelectorAll('[data-mtab]').forEach((b) => b.classList.toggle('active', b.dataset.mtab === this.marketTab));
    const box = this.$('market-list'); const foot = this.$('market-foot');
    foot.innerHTML = '';
    if (this.marketTab === 'upgrade') this.renderUpgrades(box);
    else if (this.marketTab === 'unlock') this.renderUnlock(box);
    else this.renderRestock(box, foot);
  }
  renderRestock(box, foot) {
    const html = [];
    this.mode.zones.filter((z) => this.zonesOpen.has(z.id)).forEach((z) => {
      const prods = this.mode.products.filter((p) => p.zone === z.id && this.itemsOpen.has(p.id));
      if (!prods.length) return;
      html.push('<h4>' + this.zoneName(z) + '</h4>');
      prods.forEach((p) => {
        const have = this.stock[p.id] || 0; const add = this.restockQty[p.id] || 0;
        html.push('<div class="sh-mk-row"><span class="sh-mk-name"><span class="sh-ico">' + p.icon + '</span> ' + esc(p.vi) + ' <span class="zh">' + esc(p.chn) + '</span><small>Kho ' + have + (add ? ' <b>+' + add + '</b>' : '') + '/' + p.maxStock + ' · vốn ' + fmt(p.cost) + ' ¥' + (p.price > 0 ? ' · bán ' + fmt(p.price) + ' ¥' : ' · tặng kèm') + '</small></span>'
          + '<span class="sh-qty"><button type="button" data-rs-dec="' + p.id + '">−</button><b>' + add + '</b><button type="button" data-rs-inc="' + p.id + '">+</button></span></div>');
      });
    });
    box.innerHTML = html.join('') || '<div class="sh-mk-done">Chưa có món nào để nhập.</div>';
    box.querySelectorAll('[data-rs-inc]').forEach((b) => b.addEventListener('click', () => this.changeRestock(b.dataset.rsInc, 1)));
    box.querySelectorAll('[data-rs-dec]').forEach((b) => b.addEventListener('click', () => this.changeRestock(b.dataset.rsDec, -1)));
    const total = this.restockTotal();
    foot.innerHTML = '<button type="button" class="sh-btn ghost" id="btn-rs-auto">⚡ Nhập đủ</button><button type="button" class="sh-btn" id="btn-rs-ok" ' + (total > 0 && total <= this.money + 1e-9 ? '' : 'disabled') + '>Nhập hàng (−' + fmt(total) + ' ¥)</button>';
    this.$('btn-rs-auto').addEventListener('click', () => this.autofillRestock());
    this.$('btn-rs-ok').addEventListener('click', () => this.confirmRestock());
  }
  changeRestock(id, delta) {
    const p = this.mode.products.find((x) => x.id === id);
    if (!p || !this.itemsOpen.has(id)) return;
    const cur = this.restockQty[id] || 0;
    const room = p.maxStock - (this.stock[id] || 0);
    const next = Math.max(0, Math.min(room, cur + delta));
    if (delta > 0 && this.restockTotal() + p.cost > this.money + 1e-9) { this.audio.error(); this.toast('🪙', 'Không đủ vốn để nhập thêm!', 'warn'); return; }
    if (next === cur) return;
    this.audio.pick();
    this.restockQty[id] = next;
    this.renderMarket();
  }
  // Nhập đủ: ưu tiên món còn ít hàng nhất cho tới khi hết vốn / đầy kho
  autofillRestock() {
    let budget = Math.round(this.money * 100) - Math.round(this.restockTotal() * 100);
    const list = this.mode.products.filter((p) => this.zonesOpen.has(p.zone) && this.itemsOpen.has(p.id)).sort((a, b) => (this.stock[a.id] || 0) - (this.stock[b.id] || 0));
    for (let round = 0; round < this.cfg.maxStock; round++) {
      let any = false;
      list.forEach((p) => {
        const c = Math.round(p.cost * 100);
        if ((this.stock[p.id] || 0) + (this.restockQty[p.id] || 0) < Math.min(p.maxStock, this.cfg.restockGoal || p.maxStock) && budget >= c) { this.restockQty[p.id] = (this.restockQty[p.id] || 0) + 1; budget -= c; any = true; }
      });
      if (!any) break;
    }
    this.audio.pop();
    this.renderMarket();
  }
  confirmRestock() {
    const total = this.restockTotal();
    if (total <= 0 || total > this.money + 1e-9) { this.audio.error(); return; }
    let units = 0;
    Object.entries(this.restockQty).forEach(([id, q]) => { if (q > 0) { this.stock[id] = (this.stock[id] || 0) + q; units += q; } });
    this.money = Math.round((this.money - total) * 100) / 100;
    this.stats.cost = Math.round((this.stats.cost + total) * 100) / 100;
    this.restockQty = {};
    this.audio.register();
    this.toast('📦', 'Đã nhập ' + units + ' món vào kho (−' + fmt(total) + ' ¥).');
    this.learn('进货');
    this.saveProgress(null, true);
    this.renderMarket(); this.updateHud();
  }
  renderUnlock(box) {
    const lockedZones = this.mode.zones.filter((z) => !this.zonesOpen.has(z.id));
    const html = [];
    if (lockedZones.length) {
      html.push('<h4>🏬 Mở khu hàng mới</h4>');
      lockedZones.forEach((z) => html.push('<div class="sh-mk-row"><span class="sh-mk-name">' + this.zoneName(z) + '<small>' + esc(this.zoneHint(z)) + '</small></span><button type="button" class="sh-btn small" data-buy-zone="' + z.id + '" ' + (this.money >= z.unlock ? '' : 'disabled') + '>Mở · ' + fmt(z.unlock) + ' ¥</button></div>'));
    }
    this.mode.zones.filter((z) => this.zonesOpen.has(z.id)).forEach((z) => {
      const prods = this.mode.products.filter((p) => p.zone === z.id);
      const locked = prods.filter((p) => !this.itemsOpen.has(p.id));
      html.push('<h4>' + this.zoneName(z) + ' <small>' + (prods.length - locked.length) + '/' + prods.length + ' món</small></h4>');
      if (!locked.length) { html.push('<div class="sh-mk-done">✨ Đã mở hết món trong khu này</div>'); return; }
      locked.forEach((p) => html.push('<div class="sh-mk-row"><span class="sh-mk-name"><span class="sh-ico">' + p.icon + '</span> ' + esc(p.vi) + ' <span class="zh">' + esc(p.chn) + '</span><small>' + esc(p.pin) + ' · bán ' + fmt(p.price) + ' ¥</small></span><button type="button" class="sh-btn small" data-buy-item="' + p.id + '" ' + (this.money >= p.unlockCost ? '' : 'disabled') + '>Mở · ' + fmt(p.unlockCost) + ' ¥</button></div>'));
    });
    box.innerHTML = html.join('');
    box.querySelectorAll('[data-buy-zone]').forEach((b) => b.addEventListener('click', () => this.buyZone(b.dataset.buyZone)));
    box.querySelectorAll('[data-buy-item]').forEach((b) => b.addEventListener('click', () => this.buyItem(b.dataset.buyItem)));
  }
  upgradeCost(u) { const lv = this.upgrades[u.id] || 0; return lv >= u.costs.length ? null : Math.round(u.costs[lv] * (this.cfg.upgradeScale || 1)); }
  renderUpgrades(box) {
    const off = !this.dayInProgress();
    box.innerHTML = '<h4>🔧 <span class="zh">升级</span> Nâng cấp tiệm</h4>' + (off ? '' : '<div class="sh-mk-done">⚠️ Chỉ nâng cấp được khi tiệm chưa mở cửa (đầu ngày).</div>')
      + UPGRADE_DEFS.map((u) => {
        const lv = this.upgrades[u.id] || 0; const cost = this.upgradeCost(u);
        return '<div class="sh-mk-row"><span class="sh-mk-name"><span class="sh-ico">' + u.icon + '</span> ' + esc(u.vi) + ' <span class="zh">' + esc(u.chn) + '</span> <small>Cấp ' + lv + '/' + u.costs.length + ' · ' + esc(u.desc) + '</small></span>'
          + (cost == null ? '<b class="sh-max">MAX</b>' : '<button type="button" class="sh-btn small" data-upgrade="' + u.id + '" ' + (off && this.money >= cost ? '' : 'disabled') + '>Nâng · ' + fmt(cost) + ' ¥</button>') + '</div>';
      }).join('');
    box.querySelectorAll('[data-upgrade]').forEach((b) => b.addEventListener('click', () => this.buyUpgrade(b.dataset.upgrade)));
  }
  buyUpgrade(id) {
    const u = UPGRADE_DEFS.find((x) => x.id === id); if (!u) return;
    const cost = this.upgradeCost(u);
    if (cost == null || this.dayInProgress() || this.money < cost) { this.audio.error(); return; }
    this.money = Math.round((this.money - cost) * 100) / 100;
    this.upgrades[id] = (this.upgrades[id] || 0) + 1;
    this.learn([u.chn, '升级']);
    this.audio.unlock();
    this.toast(u.icon, '升级 · Đã nâng cấp ' + u.chn + ' (' + u.vi + ') lên cấp ' + this.upgrades[id] + '!');
    this.saveProgress(null, true);
    this.renderMarket(); this.updateHud();
  }
  buyZone(id) {
    const z = this.mode.zones.find((x) => x.id === id);
    if (!z || this.zonesOpen.has(id) || this.money < z.unlock) return;
    this.money = Math.round((this.money - z.unlock) * 100) / 100;
    this.zonesOpen.add(id);
    this.mode.products.filter((p) => p.zone === id && this.itemsOpen.has(p.id)).forEach((p) => { this.stock[p.id] = Math.max(this.stock[p.id] || 0, this.cfg.starter); });
    this.audio.unlock();
    this.toast('🔓', 'Đã mở khu ' + z.vi + '!');
    this.learn(z.chn);
    this.saveProgress(null, true);
    this.renderMarket(); this.updateHud();
  }
  buyItem(id) {
    const p = this.mode.products.find((x) => x.id === id);
    if (!p || this.itemsOpen.has(id) || this.money < p.unlockCost) return;
    this.money = Math.round((this.money - p.unlockCost) * 100) / 100;
    this.itemsOpen.add(id);
    this.stock[id] = Math.max(this.stock[id] || 0, this.cfg.starter);
    this.audio.unlock();
    this.toast('🔓', 'Đã mở món ' + p.vi + '!');
    this.saveProgress(null, true);
    this.renderMarket(); this.updateHud();
  }

  // --------------------------------------------------------------------------- sổ từ vựng
  renderVocab() {
    const all = this.vocabList;
    const known = all.filter((w) => this.vocab.has(w.zh)).length;
    this.setText('vocab-sub', `Đã gặp ${known}/${all.length} từ · Từ mới xuất hiện khi khách gọi hoặc khi bạn mở khu mới`);
    this.$('vocab-list').innerHTML = all.map((w) => {
      const ok = this.vocab.has(w.zh);
      return `<div class="sh-voc ${ok ? 'ok' : 'lock'}"><b class="zh">${ok ? esc(w.zh) : '？？'}</b><span>${ok ? esc(w.pin) : '—'}</span><small>${ok ? esc(w.vi) : 'Chưa gặp'}</small>${ok ? `<button type="button" class="sh-say-btn" data-say="${esc(w.zh)}"><i class="fa-solid fa-volume-high"></i></button>` : ''}</div>`;
    }).join('');
  }

  // --------------------------------------------------------------------------- vẽ giao diện
  renderAll() {
    this.updateHud(); this.renderRail(); this.renderStations(); this.syncTabs();
  }
  updateHud() {
    this.setText('sh-money', `${fmt(this.money)} ¥`);
    this.setText('sh-day', `第${this.day}天`);
    const total = this.vocabList.length;
    this.setText('sh-vocab', `${this.vocabList.filter((w) => this.vocab.has(w.zh)).length}/${total}`);
    const g = this.goal();
    this.setText('sh-goal', `${fmt(this.stats.revenue)} / ${fmt(g)}`);
    const f = this.$('sh-goal-fill'); if (f) f.style.width = `${Math.min(100, (this.stats.revenue / g) * 100)}%`;
    const ev = this.eventInfo(this.todayEvent);
    if (ev) { this.setText('sh-weather-ic', ev.icon); this.setText('sh-weather', ev.chn); }
    const close = this.$('sh-hud-close'); if (close) close.style.display = this.dayInProgress() && !this.closed ? '' : 'none';
    this.updateClock();
  }
  updateClock() {
    const m = this.clockMinutes();
    this.setText('sh-clock', `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
    const f = this.$('sh-clock-fill'); if (f) f.style.width = `${100 - Math.min(100, (this.dayStarted ? this.gameTime / this.dayMs() : 0) * 100)}%`;
    this.setText('sh-clock-lb', this.closed ? '打烊 Đã đóng cửa' : 'Giờ bán');
    this.setText('sh-clock-ic', this.closed ? '🌙' : '⏳');
  }
  renderRail() {
    const q = this.$('sh-rail-q'); if (!q) return;
    const chip = (c, cur) => '<span class="sh-rq ' + (cur ? 'cur' : '') + '" data-cid="' + c.id + '" title="' + esc(c.profile.zh) + '"><img src="' + c.profile.img + '" alt=""><b class="zh">' + esc(c.profile.zh) + '</b><i class="pb"><u></u></i>' + (cur ? '<span>🛎️</span>' : '') + '</span>';
    q.innerHTML = (this.current ? chip(this.current, true) : '') + this.line.map((c) => chip(c, false)).join('') || '<small>Chưa có khách</small>';
    this.setText('sh-rail-info', this.dayStarted ? '✅ Đã phục vụ ' + this.stats.served + ' · 😠 Bỏ về ' + this.stats.lost + ' · Đang chờ ' + this.line.length + '/' + MAX_LINE : '');
    this.updateRailBars();
  }
  updateRailBars() {
    document.querySelectorAll('.sh-rq[data-cid]').forEach((el) => {
      const id = +el.dataset.cid; const c = (this.current && this.current.id === id) ? this.current : this.line.find((x) => x.id === id);
      const u = c && !c.takenAt && !this.relaxed ? this.patienceUsed(c) : 0;
      const bar = el.querySelector('u'); if (bar) { bar.style.width = ((1 - u) * 100) + '%'; bar.className = u > 0.75 ? 'red' : u > 0.5 ? 'amber' : ''; }
    });
  }
  syncTabs() {
    const c = this.current;
    document.querySelectorAll('.sh-tab').forEach((b) => {
      const st = b.dataset.st;
      b.classList.toggle('active', st === this.station);
      b.classList.toggle('off', (st === 'prep' && !(c && c.takenAt)) || (st === 'pay' && !(c && c.billed)));
    });
    document.querySelectorAll('.sh-station').forEach((s) => s.classList.toggle('active', s.id === `st-${this.station}`));
  }
  renderStations() { this.renderGreet(); this.renderPrep(); this.renderPay(); }

  renderGreet() {
    const el = this.$('st-greet'); if (!el) return;
    el.innerHTML = sceneHtml(this, say);
    ['btn-take', 'btn-take2'].forEach((id) => { const t = this.$(id); if (t) t.addEventListener('click', () => this.takeOrder()); });
    this.updatePatience();
  }
  todayBoard() {
    const s = this.stats;
    return `<div class="sh-board"><b class="zh">今日营收</b><strong>${fmt(s.revenue)} ¥</strong><span>✅ ${s.served} · 😠 ${s.lost}</span></div>`;
  }
  updatePatience() {
    this.updateRailBars();
    const el = this.$('sh-patience'); const c = this.current;
    if (!el || !c || c.takenAt) { if (el) el.style.display = c && c.takenAt ? 'none' : ''; return; }
    const u = this.relaxed ? 0 : this.patienceUsed(c);
    const i = el.querySelector('i'); if (i) { i.style.width = `${(1 - u) * 100}%`; i.className = u > 0.75 ? 'red' : u > 0.5 ? 'amber' : ''; }
    const m = this.$('sh-mood'); if (m) m.textContent = u > 0.75 ? '😠' : u > 0.5 ? '😐' : '😊';
  }

  renderPrep() {
    const el = this.$('st-prep'); if (!el) return;
    const c = this.current;
    if (!c || !c.takenAt) { el.innerHTML = '<div class="sh-wait">Hãy nhận đơn của khách ở bước 1 trước nhé.</div>'; return; }
    if (this.mode.stall) {   // quầy hàng toàn cảnh (Cá Viên): màn chuẩn bị tự có khách, bong bóng, nút xác nhận
      el.innerHTML = '<div class="sh-prep stall"><div class="sh-prep-body" id="prep-body"></div></div>';
      this.mode.renderPrep(this.$('prep-body'), this);
      return;
    }
    el.innerHTML = `
      <div class="sh-prep">
        <aside class="sh-ticket"><div class="sh-ticket-head">🧾 <span class="zh">客人的话</span> Lời khách <button type="button" class="sh-say-btn" data-say="${esc(c.order.say.zh)}"><i class="fa-solid fa-volume-high"></i></button></div>
          ${this.sayHtml(c.order.say)}${c.order.say2 ? '<div class="sh-ticket-say2"><b>🪞 Sau khi thử đồ, khách nói:</b>' + this.sayHtml(c.order.say2) + '</div>' : ''}${this.mode.ticketExtra ? this.mode.ticketExtra(c.order) : ''}</aside>
        <div class="sh-prep-body" id="prep-body"></div>
      </div>
      <div class="sh-footer sticky"><div class="sh-hint" id="prep-hint">${this.mode.hint}</div><button type="button" class="sh-btn next" id="btn-confirm" disabled><span class="zh">结账</span> Xác nhận · Sang thanh toán ➜</button></div>`;
    this.mode.renderPrep(this.$('prep-body'), this);
    this.$('btn-confirm').addEventListener('click', () => this.confirmOrder());
    this.renderPrepFooter();
  }
  renderPrepFooter() {
    const b = this.$('btn-confirm'); if (!b || !this.current) return;
    b.disabled = !this.mode.canConfirm(this.current.order, this.sel);
  }

  payHints(c) {
    const answered = c.dlg.log.filter((m) => m.who === 'me').length;
    if (answered === 0) return [['一共', 'yígòng', 'tổng cộng'], ['多少钱', 'duōshao qián', 'bao nhiêu tiền'], ['转账', 'zhuǎnzhàng', 'chuyển khoản'], ['现金', 'xiànjīn', 'tiền mặt']];
    if (answered === 1) return c.order.pay === 'cash' ? [['收您', 'shōu nín', 'nhận của bạn'], ['正好', 'zhènghǎo', 'vừa đủ'], ['现金', 'xiànjīn', 'tiền mặt'], ['谢谢', 'xièxie', 'cảm ơn']] : [['二维码', 'èrwéimǎ', 'mã QR'], ['扫码', 'sǎomǎ', 'quét mã'], ['付款', 'fùkuǎn', 'thanh toán'], ['转账', 'zhuǎnzhàng', 'chuyển khoản']];
    return [['谢谢惠顾', 'xièxie huìgù', 'cảm ơn quý khách'], ['欢迎下次再来', 'huānyíng xià cì zài lái', 'hoan nghênh lần sau lại đến'], ['再见', 'zàijiàn', 'tạm biệt']];
  }
  payTableHtml(c, lines) {
    const lastCust = [...c.dlg.log].reverse().find((m) => m.who === 'cust');
    const turn = c.dlg.turns[c.dlg.idx];
    const opts = turn && turn.who === 'me'
      ? '<div class="sh-ps-optgrid col">' + turn.options.map((o, i) => '<button type="button" class="pay-opt ' + (o.tried ? 'wrong' : '') + '" data-pay-opt="' + i + '" ' + (o.tried ? 'disabled' : '') + '><span class="lt">💬</span><span class="tx"><b class="zh">' + esc(o.zh) + '</b>' + (this.showPin ? '<small class="pin">' + esc(o.pin) + '</small>' : '') + (this.showVi ? '<small class="vi">' + esc(o.vi) + '</small>' : '') + '</span></button>').join('') + '</div>'
      : '<div class="pay-done">✅ Xong! Đang giao hàng…</div>';
    const rows = lines.map((l) => '<div class="sh-pt-row"><span class="pr"><span class="ic">' + (l.icon || '🛍️') + '</span><span class="nm"><b>' + esc(l.name || l.vi) + '</b><small class="zh">(' + esc(l.nameZh || l.zh) + ')</small></span></span><span class="sz"><i>' + esc(l.size || '—') + '</i></span><span class="qt"><i>' + l.qty + '</i></span><span class="un">¥' + fmt(l.unit != null ? l.unit : l.amount) + '</span><b class="sub">¥' + fmt(l.amount) + '</b></div>').join('');
    const cash = c.order.pay === 'cash';
    return '<div class="sh-payscene table">'
      + '<div class="sh-pt-left"><div class="sh-pt-custrow"><div class="sh-ps-cust"><div class="sh-ps-face"><img src="' + c.profile.img + '" alt=""></div><b class="zh">' + esc(c.profile.zh) + '</b></div>'
      + '<div class="sh-ps-bubble"><div class="sh-bubble-head"><span class="sh-ps-tag">Khách hàng</span><button type="button" class="sh-say-btn" data-say="' + esc(lastCust ? lastCust.zh : '') + '"><i class="fa-solid fa-volume-high"></i></button></div>' + (lastCust ? this.sayHtml(lastCust, 'big') : '') + '</div></div>'
      + '<div class="sh-ps-answer single"><div class="sh-opts" id="pay-opts">' + opts + '</div></div></div>'
      + '<div class="sh-pt-right"><div class="sh-pt-card"><div class="sh-pt-ribbon">🛒 Thanh toán <span class="zh">(结账)</span></div>'
      + '<div class="sh-pt-head"><span>Sản phẩm <span class="zh">(商品)</span></span><span>Size</span><span>SL</span><span>Đơn giá</span><span>Thành tiền</span></div>' + rows
      + '<div class="sh-pt-total"><span>Tổng cộng <span class="zh">(合计)</span>:</span><strong>¥' + fmt(c.order.due) + '</strong></div></div>'
      + '<div class="sh-pt-method"><div class="sh-pt-mh">Phương thức thanh toán <span class="zh">(支付方式)</span></div><div class="sh-pt-mrow">'
      + '<div class="sh-pt-m ' + (cash ? 'on' : '') + '"><span>💵</span><b>Tiền mặt</b><small class="zh">(现金)</small>' + (cash ? '<i>✔</i>' : '') + '</div>'
      + '<div class="sh-pt-m ' + (!cash ? 'on' : '') + '"><span>📱</span><b>Chuyển khoản</b><small class="zh">(转账 / 扫码)</small>' + (!cash ? '<i>✔</i>' : '') + '</div></div></div></div>'
      + '</div>';
  }
  renderPay() {
    const el = this.$('st-pay'); if (!el) return;
    const c = this.current;
    if (!c || !c.billed) { el.innerHTML = '<div class="sh-wait">Hoàn tất đơn ở bước 2 để sang thanh toán.</div>'; return; }
    const lines = this.mode.billLines(c.order);
    if (this.mode.payTable) { el.innerHTML = this.payTableHtml(c, lines); return; }
    const lastCust = [...c.dlg.log].reverse().find((m) => m.who === 'cust');
    const older = c.dlg.log.filter((m) => m !== lastCust).slice(-4);
    const tray = lines.map((l) => '<span class="sh-ps-item">' + (l.icon || '🛍️').repeat(Math.min(l.qty, 4)) + '</span>').join('');
    const hints = this.payHints(c);
    const turn = c.dlg.turns[c.dlg.idx];
    const opts = turn && turn.who === 'me'
      ? '<div class="sh-ps-topic">💬 ' + esc(turn.topic) + '</div><div class="sh-ps-optgrid">' + turn.options.map((o, i) => '<button type="button" class="pay-opt ' + (o.tried ? 'wrong' : '') + '" data-pay-opt="' + i + '" ' + (o.tried ? 'disabled' : '') + '><span class="lt">' + String.fromCharCode(65 + i) + '</span><span class="tx"><b class="zh">' + esc(o.zh) + '</b>' + (this.showPin ? '<small class="pin">' + esc(o.pin) + '</small>' : '') + (this.showVi ? '<small class="vi">' + esc(o.vi) + '</small>' : '') + '</span></button>').join('') + '</div>'
      : '<div class="pay-done">✅ Xong! Đang giao hàng…</div>';
    el.innerHTML = '<div class="sh-payscene">'
      + '<div class="sh-ps-top">'
      + '<div class="sh-ps-cust"><div class="sh-ps-face"><img src="' + c.profile.img + '" alt=""></div><b class="zh">' + esc(c.profile.zh) + '</b><span>' + esc(c.profile.vi) + '</span></div>'
      + '<div class="sh-ps-bubble"><div class="sh-bubble-head"><span class="sh-ps-tag">Khách hàng</span><button type="button" class="sh-say-btn" data-say="' + esc(lastCust ? lastCust.zh : '') + '"><i class="fa-solid fa-volume-high"></i></button></div>'
      + (lastCust ? this.sayHtml(lastCust, 'big') : '')
      + (older.length ? '<div class="sh-ps-log">' + older.map((m) => '<span class="' + (m.who === 'me' ? 'me' : '') + '">' + (m.who === 'me' ? '🧑‍🍳 ' : '🙂 ') + '<span class="zh">' + esc(m.zh) + '</span></span>').join('') + '</div>' : '') + '</div>'
      + '<div class="sh-ps-bill"><div class="sh-ps-bill-head">Đơn hàng</div>'
      + lines.map((l) => '<div class="sh-ps-row"><span class="ic">' + (l.icon || '🛍️') + '</span><span class="nm"><b>' + esc(l.vi) + '</b><small class="zh">' + esc(l.zh) + '</small></span><em>×' + l.qty + '</em><b>¥' + fmt(l.amount) + '</b></div>').join('')
      + '<div class="sh-ps-total"><span>Tổng cộng:</span><strong>¥' + fmt(c.order.due) + '</strong></div>'
      + '<div class="sh-ps-method">' + (c.order.pay === 'cash' ? '💵 Khách trả tiền mặt' : '📱 Khách chuyển khoản (QR)') + '</div></div>'
      + '<div class="sh-ps-thought"><span class="cloud">' + (tray || '🛍️') + '</span></div>'
      + '</div>'
      + '<div class="sh-ps-ribbon">Bạn sẽ trả lời thế nào?</div>'
      + '<div class="sh-ps-answer"><div class="sh-opts" id="pay-opts">' + opts + '</div>'
      + '<div class="sh-ps-hints"><div class="sh-ps-hint-head">💡 Từ vựng gợi ý</div>' + hints.map((h) => '<div class="sh-ps-hint"><b class="zh">' + h[0] + '</b><small>' + h[1] + '</small><span>' + h[2] + '</span></div>').join('') + '</div></div>'
      + '</div>';
  }
  // --------------------------------------------------------------------------- tài khoản · xếp hạng
  async initCloud() {
    let data;
    try { data = await this.cloudApi.getProgress(); } catch (e) {
      this.cloud.checked = true; this.cloud.offline = true;
      const lu = this.cloudApi.localUser(); if (lu) this.cloud.name = lu.name || lu.email;
      this.renderAccount(); return;
    }
    this.cloud.checked = true;
    if (!data || !data.loggedIn) { this.switchOwner('guest'); this.renderAccount(); return; }
    const lu = this.cloudApi.localUser();
    this.cloud.loggedIn = true;
    this.cloud.name = (data.user && data.user.name) || (lu && lu.name) || 'Bạn';
    this.cloud.picture = (data.user && data.user.picture) || (lu && lu.picture) || '';
    this.cloud.best = data.best || null;
    this.cloud.history = Array.isArray(data.history) ? data.history : [];
    const email = lu && lu.email ? String(lu.email).toLowerCase().trim() : '';
    this.owner = email || 'account';
    const server = data.save && data.save.v === SAVE_VERSION ? data.save : null;
    const local = email ? this.localSave.read(email) : null;
    const sTime = server ? Number(server.updatedAt) || 0 : -1;
    const lTime = local ? Number(local.updatedAt) || 0 : -1;
    if (!this.dayInProgress()) {
      if (server && sTime >= lTime) { this.applySnapshot(server); if (email) this.localSave.write(email, server); }
      else if (local) { this.applySnapshot(local); this.cloudApi.post({ save: local }).catch(() => {}); }
      else this.resetProgress();
      this.renderAll();
    }
    this.renderAccount();
  }
  switchOwner(owner) {
    if (this.owner === owner) return;
    this.owner = owner;
    if (this.dayInProgress()) return;
    const s = this.localSave.read(owner);
    if (s) this.applySnapshot(s); else this.resetProgress();
    this.renderAll();
  }
  renderAccount() {
    const chip = this.$('sh-account'); if (!chip) return;
    const c = this.cloud; const av = this.$('sh-account-av');
    if (c.loggedIn) {
      chip.classList.remove('guest'); chip.removeAttribute('href');
      this.setText('sh-account-name', c.name);
      this.setText('sh-account-status', c.best ? `☁️ Đã lưu · Kỷ lục ${fmt(c.best.earnings)} ¥` : '☁️ Tiến trình được lưu vào tài khoản');
      if (av) av.innerHTML = c.picture ? `<img src="${esc(c.picture)}" alt="" referrerpolicy="no-referrer">` : '<i class="fa-solid fa-user"></i>';
    } else {
      chip.classList.add('guest'); chip.setAttribute('href', '/index.html');
      this.setText('sh-account-name', c.offline && c.name ? c.name : 'Khách');
      this.setText('sh-account-status', c.offline ? '⚠️ Mất kết nối · lưu tạm trên máy' : 'Đăng nhập để lưu vào tài khoản');
      if (av) av.innerHTML = '<i class="fa-solid fa-user"></i>';
    }
  }
  async pushDayResult(record, save) {
    try {
      const r = await this.cloudApi.post({ dayResult: record, save });
      if (r && r.best) this.cloud.best = r.best;
      if (r && Array.isArray(r.history)) this.cloud.history = r.history;
      if (r && r.newBest) this.toast('🏆', `Kỷ lục mới: ${fmt(r.best.earnings)} ¥ — đã cập nhật bảng xếp hạng!`);
      this.renderAccount();
    } catch (e) { this.toast('⚠️', 'Chưa gửi được kết quả lên bảng xếp hạng (mất kết nối).', 'warn'); }
  }
  openRank(tab = this.rankTab) { this.openModal('m-rank'); this.switchRank(tab); }
  switchRank(tab) {
    this.rankTab = tab === 'mine' ? 'mine' : 'global';
    document.querySelectorAll('.sh-ranktab').forEach((b) => b.classList.toggle('active', b.dataset.rank === this.rankTab));
    if (this.rankTab === 'mine') this.renderMyRank(); else this.renderGlobalRank();
  }
  rankRow(r, medals, mine = false) {
    const rank = r.rank || 0;
    const pos = rank ? (medals[rank - 1] || rank) : '•';
    const stars = (r.stars || 0);
    const ava = r.picture ? '<img class="sh-rr-av" src="' + esc(r.picture) + '" alt="" referrerpolicy="no-referrer" loading="lazy">' : '<span class="sh-rr-av"><i class="fa-solid fa-user"></i></span>';
    const dayTxt = '<span class="zh">第' + (Number(r.day) || 1) + '天</span>';
    const when = r.achievedAt ? ' · ' + new Date(r.achievedAt).toLocaleDateString('vi-VN') : (r.date ? ' · ' + esc(r.date) : '');
    const who = mine
      ? '<span class="rr-name"><b class="zh">第' + (Number(r.day) || 1) + '天</b><small>' + esc(r.date || '') + '</small></span>'
      : ava + '<span class="rr-name"><b>' + esc(r.name || '') + (r.isMe ? '<span class="rr-me">Bạn</span>' : '') + '</b><small>' + dayTxt + when + '</small></span>';
    return '<div class="sh-rrow ' + ((rank && rank <= 3) || (mine && r.top) ? 'top' : '') + ' ' + (r.isMe ? 'me' : '') + '"><span class="rr-pos">' + pos + '</span><span class="rr-player">' + who + '</span>'
      + '<span class="rr-earn">' + fmt(r.earnings) + ' ¥</span><span class="rr-sv">🧺 ' + r.served + '/' + r.total + (r.lost ? ' · 😠 ' + r.lost : '') + '</span><span class="rr-avg">' + (r.served > 0 ? (r.avg || 0) + '%' : '—') + '</span>'
      + '<span class="rr-stars">' + '⭐'.repeat(stars) + '☆'.repeat(Math.max(0, 3 - stars)) + '</span></div>';
  }
  rankTile(icon, value, label) { return '<div class="sh-rs"><span>' + icon + '</span><strong>' + value + '</strong><small>' + label + '</small></div>'; }
  async renderGlobalRank() {
    const list = this.$('rank-list'); const sum = this.$('rank-sum'); if (!list) return;
    this.setText('rank-note', 'Mỗi người chỉ tính thành tích cao nhất · Xếp theo doanh thu 1 ngày → số sao → điểm trung bình');
    sum.innerHTML = '';
    list.innerHTML = '<div class="sh-rank-empty"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải bảng xếp hạng...</div>';
    const req = (this.rankReq = (this.rankReq || 0) + 1);
    let data;
    try { data = await this.cloudApi.getLeaderboard(); } catch (e) {
      if (req !== this.rankReq || this.rankTab !== 'global') return;
      list.innerHTML = '<div class="sh-rank-empty">📡 Không kết nối được máy chủ.<br>Kiểm tra mạng rồi thử lại nhé!<br><br><button type="button" class="sh-btn small" id="btn-rank-retry">🔄 Thử lại</button></div>';
      const rb = this.$('btn-rank-retry'); if (rb) rb.addEventListener('click', () => this.renderGlobalRank());
      return;
    }
    if (req !== this.rankReq || this.rankTab !== 'global') return;
    const me = data.me;
    sum.innerHTML = this.rankTile('👥', data.totalPlayers || 0, 'Chủ tiệm') + this.rankTile('🏅', me ? '#' + me.rank : '—', 'Hạng của bạn') + this.rankTile('🏆', me ? fmt(me.earnings) + ' ¥' : '—', 'Kỷ lục của bạn') + this.rankTile('📅', me ? (me.daysPlayed || 0) : '—', 'Ngày đã bán');
    const top = Array.isArray(data.top) ? data.top : [];
    const cta = !data.loggedIn ? '<div class="sh-rank-cta"><span>🔐 Bạn đang chơi với tư cách khách — đăng nhập để ghi tên lên bảng!</span><a href="/index.html">Đăng nhập</a></div>' : '';
    if (!top.length) { list.innerHTML = cta + '<div class="sh-rank-empty">🏪 Chưa có ai trên bảng xếp hạng.<br>Hoàn thành 1 ngày bán hàng để là người đầu tiên!</div>'; return; }
    const medals = ['🥇', '🥈', '🥉'];
    list.innerHTML = cta + top.map((r) => this.rankRow(r, medals)).join('') + (me && !top.some((r) => r.isMe) ? '<div class="sh-rank-gap">⋮</div>' + this.rankRow(me, medals) : '');
  }
  renderMyRank() {
    const list = this.$('rank-list'); const sum = this.$('rank-sum'); if (!list) return;
    const fmtDate = (iso) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN'); };
    const src = this.cloud.loggedIn ? this.cloud.history.map((h) => ({ ...h, date: fmtDate(h.playedAt) })) : this.records;
    this.setText('rank-note', this.cloud.loggedIn ? '☁️ Các ngày bán đã lưu trong tài khoản · Xếp theo doanh thu trong ngày' : 'Đang lưu trên máy này · Đăng nhập để lưu vào tài khoản và lên bảng xếp hạng');
    const recs = [...src].filter((r) => r && Number.isFinite(Number(r.earnings))).sort((a, b) => b.earnings - a.earnings);
    sum.innerHTML = this.rankTile('📅', recs.length, 'Ngày đã bán') + this.rankTile('🧺', recs.reduce((s, r) => s + (r.served || 0), 0), 'Khách đã phục vụ') + this.rankTile('🪙', fmt(recs.reduce((s, r) => s + Number(r.earnings), 0)) + ' ¥', 'Tổng doanh thu') + this.rankTile('⭐', recs.reduce((s, r) => s + (r.stars || 0), 0), 'Tổng sao');
    if (!recs.length) { list.innerHTML = '<div class="sh-rank-empty">🏪 Chưa có ngày bán nào.<br>Hoàn thành ngày đầu tiên để ghi kỷ lục!</div>'; return; }
    const medals = ['🥇', '🥈', '🥉'];
    list.innerHTML = recs.slice(0, 15).map((r, i) => this.rankRow({ ...r, rank: i + 1 }, medals, true)).join('');
  }
}

// Khởi tạo từ trang HTML: mountShop(cfg, mode)
export function mountShop(cfg, mode) {
  const start = () => { if (!window.shopGame) window.shopGame = new ShopGame(cfg, mode); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}
