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
import { createCheckoutDialogue, pickOption, renderChatHtml, renderOptionsHtml } from './shop_dialogue.js';

const SAVE_VERSION = 1;
const MAX_LINE = 3;
const OPEN_MIN = 8 * 60;
const CLOSE_MIN = 20 * 60;

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
    <a href="/shop-games.html" class="sh-title-home"><i class="fa-solid fa-arrow-left"></i> Kệ game</a>
    <a href="/index.html" class="sh-account guest" id="sh-account">
      <span class="sh-account-av" id="sh-account-av"><i class="fa-solid fa-user"></i></span>
      <span class="sh-account-tx"><strong id="sh-account-name">Khách</strong><small id="sh-account-status">Đăng nhập để lưu thành tích</small></span>
    </a>
    <div class="sh-logo">
      <div class="sh-logo-emoji">${cfg.emoji}</div>
      <div class="sh-logo-board"><span class="sh-logo-zh zh">${cfg.chn}</span><span class="sh-logo-pin">${cfg.pin}</span></div>
      <div class="sh-logo-ribbon">${esc(cfg.title)}</div>
      <div class="sh-logo-progress" id="sh-title-progress"></div>
    </div>
    <div class="sh-menu">
      <button type="button" class="sh-btn-play" id="sh-btn-play"><span class="zh" id="sh-play-zh">开门营业</span><b id="sh-play-vi">Bắt đầu</b><i class="fa-solid fa-play"></i></button>
      <div class="sh-menu-sub">
        <button type="button" class="sh-btn-sub" id="sh-btn-guide">📖 <span class="zh">玩法说明</span> Hướng dẫn</button>
        <button type="button" class="sh-btn-sub" id="sh-btn-rank">🏆 <span class="zh">排行榜</span> Xếp hạng</button>
      </div>
    </div>
  </section>

  <header class="sh-hud">
    <div class="sh-hud-row">
      <button type="button" class="sh-circle" id="sh-hud-home" title="Về màn hình chính"><i class="fa-solid fa-house"></i></button>
      <button type="button" class="sh-circle" id="sh-hud-pause" title="Tạm dừng & cài đặt"><i class="fa-solid fa-pause"></i></button>
      <button type="button" class="sh-circle moon" id="sh-hud-close" title="打烊 · Đóng cửa sớm" style="display:none"><i class="fa-solid fa-moon"></i></button>
      <div class="sh-pill"><span>🪙</span><span class="sh-pill-tx"><small>资金 · Vốn</small><strong id="sh-money">0</strong></span></div>
      <div class="sh-pill"><span>📅</span><span class="sh-pill-tx"><small>Ngày</small><strong class="zh" id="sh-day">第1天</strong></span></div>
      <div class="sh-pill clock"><span id="sh-clock-ic">⏳</span><span class="sh-pill-tx"><small id="sh-clock-lb">Giờ bán</small><strong id="sh-clock">08:00</strong></span><span class="sh-bar"><i id="sh-clock-fill"></i></span></div>
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
  unlockedProducts() { return this.mode.products.filter((p) => this.zonesOpen.has(p.zone) && this.itemsOpen.has(p.id)); }
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
      modalShell('m-guide', `<h3>📖 <span class="zh">玩法说明</span> Hướng dẫn</h3><div class="sh-guide">${this.cfg.guideHtml}</div><button type="button" class="sh-btn" data-close="m-guide">Đã hiểu</button>`),
      modalShell('m-rank', `<h3>🏆 <span class="zh">排行榜</span> Bảng xếp hạng</h3>
        <div class="sh-ranktabs"><button type="button" class="sh-ranktab active" data-rank="global">🌏 Toàn hệ thống</button><button type="button" class="sh-ranktab" data-rank="mine">📜 Của tôi</button></div>
        <div class="sh-rank-sum" id="rank-sum"></div><div class="sh-rank-note" id="rank-note"></div><div class="sh-rank-list" id="rank-list"></div>
        <button type="button" class="sh-btn" data-close="m-rank">Đóng</button>`, 'wide'),
      modalShell('m-vocab', `<h3>📖 <span class="zh">生词本</span> Sổ từ vựng</h3><div class="sh-vocab-sub" id="vocab-sub"></div><div class="sh-vocab" id="vocab-list"></div><button type="button" class="sh-btn" data-close="m-vocab">Đóng</button>`, 'wide'),
      modalShell('m-market', `<h3>📦 <span class="zh">进货市场</span> Chợ nhập hàng</h3><div class="sh-market-money" id="market-money"></div><div class="sh-market" id="market-list"></div><button type="button" class="sh-btn" data-close="m-market">Đóng</button>`, 'wide'),
      modalShell('m-pause', `<h3>⏸️ Tạm dừng</h3>
        <label class="sh-set"><input type="checkbox" id="set-pin" checked> Hiện pinyin</label>
        <label class="sh-set"><input type="checkbox" id="set-vi" checked> Hiện nghĩa tiếng Việt</label>
        <label class="sh-set"><input type="checkbox" id="set-voice" checked> Đọc tiếng Trung thành tiếng</label>
        <label class="sh-set"><input type="checkbox" id="set-relaxed"> Chế độ thư thả (khách không bỏ về)</label>
        <button type="button" class="sh-btn" data-close="m-pause">▶️ Tiếp tục chơi</button>
        <button type="button" class="sh-btn ghost" id="btn-reset">🗑️ Chơi lại từ đầu</button>`),
      modalShell('m-mission', `<h3 id="mission-title"></h3><div id="mission-body"></div><button type="button" class="sh-btn" id="btn-open-shop"><span class="zh">开门</span> Mở cửa</button>`),
      modalShell('m-score', `<div id="score-body"></div><button type="button" class="sh-btn" id="btn-score-next">Khách tiếp theo ➜</button>`, 'score'),
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
    on('sh-hud-market', 'click', () => { this.renderMarket(); this.openModal('m-market'); });
    on('btn-open-shop', 'click', () => { this.closeModal('m-mission'); this.startDay(); });
    on('btn-score-next', 'click', () => this.closeScore());
    on('btn-sum-next', 'click', () => this.nextDay());
    on('btn-sum-market', 'click', () => { this.renderMarket(); this.openModal('m-market'); });
    on('btn-reset', 'click', () => this.resetAll());
    on('set-pin', 'change', (e) => { this.showPin = e.target.checked; this.renderAll(); });
    on('set-vi', 'change', (e) => { this.showVi = e.target.checked; this.renderAll(); });
    on('set-voice', 'change', (e) => { this.audio.voice = e.target.checked; });
    on('set-relaxed', 'change', (e) => { this.relaxed = e.target.checked; });
    document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => { this.closeModal(b.dataset.close); if (b.dataset.close === 'm-market') this.saveProgress(null, true); }));
    document.querySelectorAll('.sh-ranktab').forEach((b) => b.addEventListener('click', () => this.switchRank(b.dataset.rank)));
    document.querySelectorAll('.sh-tab').forEach((b) => b.addEventListener('click', () => this.goStation(b.dataset.st)));
    const stage = this.$('sh-stage');
    stage.addEventListener('click', (e) => {
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
    if (p) p.textContent = this.day > 1 || this.records.length ? `📅 Đang ở ngày ${this.day} · 🪙 ${fmt(this.money)} ¥` : '';
  }
  hideTitle() { const t = this.$('sh-title'); if (t) t.classList.add('hidden'); document.body.classList.remove('on-title'); }
  onPlay() {
    this.audio.init();
    this.hideTitle();
    if (!this.dayStarted) this.showMission();
  }

  // --------------------------------------------------------------------------- ngày
  freshStats() { return { revenue: 0, served: 0, spawned: 0, lost: 0, scoreSum: 0, firstTry: 0, dlgFirst: 0 }; }
  goal() { return this.cfg.goal(this.day); }
  dayMs() { return this.cfg.dayMs || 170000; }
  patienceMs() { return this.relaxed ? Infinity : Math.max(45000, 85000 - (this.day - 1) * 2500); }
  arrivalGap() { return Math.max(9000, 16000 - (this.day - 1) * 700) + Math.random() * 6000; }
  clockMinutes() {
    if (!this.dayStarted) return OPEN_MIN;
    return OPEN_MIN + Math.floor(Math.min(1, this.gameTime / this.dayMs()) * (CLOSE_MIN - OPEN_MIN));
  }

  showMission() {
    const g = this.goal();
    this.setText('mission-title', `第${this.day}天 · Ngày ${this.day}`);
    this.$('mission-body').innerHTML = `
      <div class="sh-mission">
        <div class="sh-mrow">🎯 Doanh thu đạt <b>${fmt(g)} ¥</b></div>
        <div class="sh-mrow">⭐ Điểm phục vụ trung bình từ <b>80%</b></div>
        <div class="sh-mrow">💬 Hội thoại thanh toán đúng ngay lần đầu từ <b>80%</b> số khách</div>
        <div class="sh-mnote">Tiệm mở 08:00 → 20:00 (tính theo thời gian). Mỗi ⭐ đạt được thưởng thêm tiền.</div>
      </div>`;
    this.openModal('m-mission');
  }

  startDay() {
    this.dayStarted = true; this.dayEnded = false; this.closed = false;
    this.gameTime = 0; this.nextArrivalAt = 1200; this.nextChatAt = 4000;
    this.line = []; this.current = null; this.sel = null;
    this.stats = this.freshStats();
    this.station = 'greet';
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
    c.order = this.mode.makeOrder({ day: this.day, products: this.unlockedProducts(), has: (id) => this.itemsOpen.has(id) });
    if (!c.order) { this.stats.spawned -= 1; this.promote(); return; }
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
    this.toast('😠', `${c.profile.zh} (${c.profile.vi}) chờ lâu quá nên bỏ về!`, 'warn');
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
    const bad = this.mode.diff(c.order, this.sel);
    if (bad.length) {
      c.wrong += 1;
      this.audio.error();
      this.toast('❌', `Chưa đúng: ${bad.join(' · ')}. Đọc lại lời khách rồi sửa nhé!`, 'warn');
      const b = this.$('btn-confirm'); if (b) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); }
      return;
    }
    c.billed = true;
    c.dlg = createCheckoutDialogue({ due: c.order.due, pay: c.order.pay });
    this.audio.register();
    this.station = 'pay';
    this.renderAll();
    if (c.dlg.log[0]) setTimeout(() => this.audio.speak(c.dlg.log[0].zh), 350);
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
    const target = 26000 + 9000 * units;
    const scores = {
      pick: Math.max(0, 100 - 20 * c.wrong),
      speed: elapsed <= target ? 100 : Math.max(40, Math.round(100 - 60 * ((elapsed - target) / (2 * target)))),
      talk: Math.max(0, 100 - 25 * c.dlg.wrong),
      wait: c.waitScore ?? 100
    };
    const total = Math.round(scores.pick * 0.35 + scores.speed * 0.15 + scores.talk * 0.35 + scores.wait * 0.15);
    const busy = this.line.length >= 1;
    let tip = 0;
    if (busy && total >= 85 && c.dlg.wrong === 0) tip = Math.round(this.cfg.tip * (total >= 95 ? 1.5 : 1) * 100) / 100;
    const earned = Math.round((c.order.due + tip) * 100) / 100;
    this.money = Math.round((this.money + earned) * 100) / 100;
    this.stats.revenue = Math.round((this.stats.revenue + earned) * 100) / 100;
    this.stats.served += 1;
    this.stats.scoreSum += total;
    if (c.wrong === 0 && c.dlg.wrong === 0) this.stats.firstTry += 1;
    if (c.dlg.wrong === 0) this.stats.dlgFirst += 1;
    this.audio.register();
    this.showScore(c, scores, total, tip, earned);
    this.current = null; this.sel = null;
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
    const bar = (label, v) => `<div class="sh-sc-row"><span>${label}</span><div class="sh-sc-bar"><i style="width:${v}%"></i></div><b>${v}%</b></div>`;
    this.$('score-body').innerHTML = `
      <div class="sh-score-head"><img src="${c.profile.img}" alt=""><div><b>${esc(c.profile.zh)} · ${esc(c.profile.vi)}</b><div class="sh-stars">${'⭐'.repeat(stars)}${'☆'.repeat(5 - stars)}</div></div></div>
      ${rv ? `<div class="sh-review">${this.sayHtml(rv)}<button type="button" class="sh-say-btn" data-say="${esc(rv.zh)}"><i class="fa-solid fa-volume-high"></i></button></div>` : ''}
      <div class="sh-sc-money"><div><span>Tiền hàng</span><b>${fmt(c.order.due)} ¥</b></div><div><span>Tip</span><b>${tip ? '+' + fmt(tip) : '0'} ¥</b></div><div class="tot"><span>Nhận được</span><b>+${fmt(earned)} ¥</b></div></div>
      ${bar('Chọn đúng đơn', scores.pick)}${bar('Tốc độ', scores.speed)}${bar('Hội thoại', scores.talk)}${bar('Không để khách chờ', scores.wait)}
      <div class="sh-sc-total">Điểm phục vụ: <b>${total}%</b></div>`;
    this.openModal('m-score');
    if (rv) setTimeout(() => this.audio.speak(rv.zh), 300);
  }
  closeScore() {
    this.closeModal('m-score');
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
        <div><small>Phục vụ</small><b>${s.served}/${s.spawned}</b></div>
        <div><small>Điểm TB</small><b>${s.served ? avg + '%' : '—'}</b></div>
        <div><small>Hội thoại đúng ngay</small><b>${s.served ? first + '%' : '—'}</b></div>
      </div>
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

  // --------------------------------------------------------------------------- chợ nhập hàng
  zoneName(z) { return `${z.icon} ${esc(z.vi)} <span class="zh">${esc(z.chn)}</span>`; }
  renderMarket() {
    this.setText('market-money', `🪙 Vốn hiện có: ${fmt(this.money)} ¥`);
    const lockedZones = this.mode.zones.filter((z) => !this.zonesOpen.has(z.id));
    const html = [];
    if (lockedZones.length) {
      html.push('<h4>🏬 Mở khu hàng mới</h4>');
      lockedZones.forEach((z) => html.push(`<div class="sh-mk-row"><span class="sh-mk-name">${this.zoneName(z)}<small>${esc(this.zoneHint(z))}</small></span>
        <button type="button" class="sh-btn small" data-buy-zone="${z.id}" ${this.money >= z.unlock ? '' : 'disabled'}>Mở · ${fmt(z.unlock)} ¥</button></div>`));
    }
    this.mode.zones.filter((z) => this.zonesOpen.has(z.id)).forEach((z) => {
      const prods = this.mode.products.filter((p) => p.zone === z.id);
      const locked = prods.filter((p) => !this.itemsOpen.has(p.id));
      html.push(`<h4>${this.zoneName(z)} <small>${prods.length - locked.length}/${prods.length} món</small></h4>`);
      if (!locked.length) { html.push('<div class="sh-mk-done">✨ Đã mở hết món trong khu này</div>'); return; }
      locked.forEach((p) => html.push(`<div class="sh-mk-row"><span class="sh-mk-name"><span class="sh-ico">${p.icon}</span> ${esc(p.vi)} <span class="zh">${esc(p.chn)}</span><small>${esc(p.pin)} · ${fmt(p.price)} ¥</small></span>
        <button type="button" class="sh-btn small" data-buy-item="${p.id}" ${this.money >= p.unlockCost ? '' : 'disabled'}>Mở · ${fmt(p.unlockCost)} ¥</button></div>`));
    });
    const box = this.$('market-list');
    box.innerHTML = html.join('');
    box.querySelectorAll('[data-buy-zone]').forEach((b) => b.addEventListener('click', () => this.buyZone(b.dataset.buyZone)));
    box.querySelectorAll('[data-buy-item]').forEach((b) => b.addEventListener('click', () => this.buyItem(b.dataset.buyItem)));
  }
  zoneHint(z) { const n = this.mode.products.filter((p) => p.zone === z.id).length; return `${n} món hàng`; }
  buyZone(id) {
    const z = this.mode.zones.find((x) => x.id === id);
    if (!z || this.zonesOpen.has(id) || this.money < z.unlock) return;
    this.money = Math.round((this.money - z.unlock) * 100) / 100;
    this.zonesOpen.add(id);
    this.audio.unlock();
    this.toast('🔓', `Đã mở khu ${z.vi}!`);
    this.learn(z.chn);
    this.saveProgress(null, true);
    this.renderMarket(); this.updateHud();
  }
  buyItem(id) {
    const p = this.mode.products.find((x) => x.id === id);
    if (!p || this.itemsOpen.has(id) || this.money < p.unlockCost) return;
    this.money = Math.round((this.money - p.unlockCost) * 100) / 100;
    this.itemsOpen.add(id);
    this.audio.unlock();
    this.toast('🔓', `Đã mở món ${p.vi}!`);
    this.saveProgress(null, true);
    this.renderMarket(); this.updateHud();
  }

  // --------------------------------------------------------------------------- sổ từ vựng
  renderVocab() {
    const all = this.mode.vocab;
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
    const total = this.mode.vocab.length;
    this.setText('sh-vocab', `${this.mode.vocab.filter((w) => this.vocab.has(w.zh)).length}/${total}`);
    const g = this.goal();
    this.setText('sh-goal', `${fmt(this.stats.revenue)} / ${fmt(g)}`);
    const f = this.$('sh-goal-fill'); if (f) f.style.width = `${Math.min(100, (this.stats.revenue / g) * 100)}%`;
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
    const cur = this.current ? `<span class="sh-rq cur" title="Đang phục vụ"><img src="${this.current.profile.img}" alt=""></span>` : '';
    q.innerHTML = cur + this.line.map((c) => `<span class="sh-rq" title="${esc(c.profile.zh)}"><img src="${c.profile.img}" alt=""></span>`).join('') || '<small>Chưa có khách</small>';
    this.setText('sh-rail-info', this.dayStarted ? `Đang chờ ${this.line.length}/${MAX_LINE} · Đã phục vụ ${this.stats.served} · Bỏ về ${this.stats.lost}` : '');
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
    const c = this.current;
    const chat = this.cfg.chat.length ? this.cfg.chat[this.chatIdx % this.cfg.chat.length] : null;
    if (!c) {
      el.innerHTML = `
        <div class="sh-greet empty">
          <div class="sh-shopfront"><div class="sh-awning"></div><div class="sh-door-empty"><b class="zh">欢迎光临</b><small>${this.dayInProgress() ? (this.closed ? 'Đã đóng cửa…' : 'Đang chờ khách…') : 'Bấm ▶ để mở cửa tiệm'}</small></div></div>
          ${chat && this.dayInProgress() ? `<div class="sh-chat"><span class="sh-chat-tag">🐈 <span class="zh">闲聊</span> Tám chuyện</span>${this.sayHtml(chat)}<button type="button" class="sh-say-btn" data-say="${esc(chat.zh)}"><i class="fa-solid fa-volume-high"></i></button></div>` : ''}
          ${this.todayBoard()}
        </div>`;
      return;
    }
    const o = c.order;
    el.innerHTML = `
      <div class="sh-greet">
        <div class="sh-customer"><img src="${c.profile.img}" alt=""><div class="sh-cname"><b class="zh">${esc(c.profile.zh)}</b><span>${esc(c.profile.vi)}</span></div>
          <div class="sh-patience" id="sh-patience"><i></i><span id="sh-mood">😊</span></div></div>
        <div class="sh-bubble">
          <div class="sh-bubble-head"><span>🗣️ Khách nói</span><button type="button" class="sh-say-btn" data-say="${esc(o.say.zh)}" title="Nghe lại"><i class="fa-solid fa-volume-high"></i></button></div>
          ${this.sayHtml(o.say, 'big')}
          ${c.takenAt ? '<div class="sh-taken">✅ Đã nhận đơn — sang bước 2 để chuẩn bị.</div>' : `<button type="button" class="sh-btn" id="btn-take"><span class="zh">接单</span> Nhận đơn</button>`}
        </div>
        ${this.todayBoard()}
      </div>`;
    const t = this.$('btn-take'); if (t) t.addEventListener('click', () => this.takeOrder());
    this.updatePatience();
  }
  todayBoard() {
    const s = this.stats;
    return `<div class="sh-board"><b class="zh">今日营收</b><strong>${fmt(s.revenue)} ¥</strong><span>✅ ${s.served} · 😠 ${s.lost}</span></div>`;
  }
  updatePatience() {
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
    el.innerHTML = `
      <div class="sh-prep">
        <aside class="sh-ticket"><div class="sh-ticket-head">🧾 <span class="zh">客人的话</span> Lời khách <button type="button" class="sh-say-btn" data-say="${esc(c.order.say.zh)}"><i class="fa-solid fa-volume-high"></i></button></div>
          ${this.sayHtml(c.order.say)}${this.mode.ticketExtra ? this.mode.ticketExtra(c.order) : ''}</aside>
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

  renderPay() {
    const el = this.$('st-pay'); if (!el) return;
    const c = this.current;
    if (!c || !c.billed) { el.innerHTML = '<div class="sh-wait">Hoàn tất đơn ở bước 2 để sang thanh toán.</div>'; return; }
    const lines = this.mode.billLines(c.order);
    el.innerHTML = `
      <div class="sh-pay">
        <div class="sh-bill"><div class="sh-bill-head">🧾 <span class="zh">账单</span> Hóa đơn</div>
          ${lines.map((l) => `<div class="sh-bill-row"><span><b class="zh">${esc(l.zh)}</b><small>${esc(l.vi)}</small></span><em>×${l.qty}</em><b>${fmt(l.amount)}</b></div>`).join('')}
          <div class="sh-bill-total"><span class="zh">合计</span><strong>${fmt(c.order.due)} ¥</strong></div>
          <div class="sh-bill-method">${c.order.pay === 'cash' ? '💵 Khách trả tiền mặt' : '📱 Khách chuyển khoản (QR)'}</div></div>
        <div class="sh-talk"><div class="sh-chat-box" id="pay-chat">${renderChatHtml(c.dlg, { showPinyin: this.showPin, showVi: this.showVi })}</div>
          <div class="sh-opts" id="pay-opts">${renderOptionsHtml(c.dlg, { showPinyin: this.showPin, showVi: this.showVi })}</div></div>
      </div>
      <div class="sh-footer"><div class="sh-hint">💬 Chọn câu tiếng Trung đúng để nói với khách. Chọn sai sẽ bị trừ điểm.</div></div>`;
    const chat = this.$('pay-chat'); if (chat) chat.scrollTop = chat.scrollHeight;
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
  rankRow(r, i, medals) {
    return `<div class="sh-rrow ${i < 3 ? 'top' : ''} ${r.isMe ? 'me' : ''}"><span class="pos">${medals[i] || i + 1}</span>
      <span class="who"><b>${esc(r.name || '')}${r.isMe ? ' <em>Bạn</em>' : ''}</b><small><span class="zh">第${Number(r.day) || 1}天</span></small></span>
      <span class="earn">${fmt(r.earnings)} ¥</span><span class="sv">🧺 ${r.served}/${r.total}</span><span class="stars">${'⭐'.repeat(r.stars || 0)}${'☆'.repeat(3 - (r.stars || 0))}</span></div>`;
  }
  async renderGlobalRank() {
    const list = this.$('rank-list'); const sum = this.$('rank-sum'); if (!list) return;
    this.setText('rank-note', 'Mỗi người chỉ tính thành tích cao nhất · Xếp theo doanh thu 1 ngày → số sao → điểm trung bình');
    sum.innerHTML = '';
    list.innerHTML = '<div class="sh-rank-empty"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải bảng xếp hạng…</div>';
    const req = (this.rankReq = (this.rankReq || 0) + 1);
    let data;
    try { data = await this.cloudApi.getLeaderboard(); } catch (e) {
      if (req !== this.rankReq || this.rankTab !== 'global') return;
      list.innerHTML = '<div class="sh-rank-empty">📡 Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại nhé!</div>'; return;
    }
    if (req !== this.rankReq || this.rankTab !== 'global') return;
    const me = data.me;
    sum.innerHTML = `<div><span>👥</span><b>${data.totalPlayers || 0}</b><small>Chủ tiệm</small></div><div><span>🏅</span><b>${me ? '#' + me.rank : '—'}</b><small>Hạng của bạn</small></div><div><span>🏆</span><b>${me ? fmt(me.earnings) + ' ¥' : '—'}</b><small>Kỷ lục</small></div>`;
    const top = Array.isArray(data.top) ? data.top : [];
    const cta = !data.loggedIn ? '<div class="sh-rank-cta">🔐 Đang chơi với tư cách khách — <a href="/index.html">đăng nhập</a> để ghi tên lên bảng!</div>' : '';
    if (!top.length) { list.innerHTML = cta + '<div class="sh-rank-empty">🏪 Chưa có ai trên bảng. Hoàn thành 1 ngày bán hàng để là người đầu tiên!</div>'; return; }
    const medals = ['🥇', '🥈', '🥉'];
    list.innerHTML = cta + top.map((r, i) => this.rankRow(r, i, medals)).join('') + (me && !top.some((r) => r.isMe) ? `<div class="sh-rank-gap">⋮</div>${this.rankRow(me, 99, medals)}` : '');
  }
  renderMyRank() {
    const list = this.$('rank-list'); const sum = this.$('rank-sum'); if (!list) return;
    const src = this.cloud.loggedIn ? this.cloud.history : this.records;
    this.setText('rank-note', this.cloud.loggedIn ? '☁️ Các ngày bán đã lưu trong tài khoản' : 'Đang lưu trên máy này · Đăng nhập để lên bảng xếp hạng');
    const recs = [...src].filter((r) => r && Number.isFinite(Number(r.earnings))).sort((a, b) => b.earnings - a.earnings);
    sum.innerHTML = `<div><span>📅</span><b>${recs.length}</b><small>Ngày đã bán</small></div><div><span>🪙</span><b>${fmt(recs.reduce((s, r) => s + Number(r.earnings), 0))} ¥</b><small>Tổng doanh thu</small></div>`;
    if (!recs.length) { list.innerHTML = '<div class="sh-rank-empty">Chưa có ngày bán nào.</div>'; return; }
    const medals = ['🥇', '🥈', '🥉'];
    list.innerHTML = recs.slice(0, 15).map((r, i) => this.rankRow({ ...r, name: r.date || `Ngày ${r.day}` }, i, medals)).join('');
  }
}

// Khởi tạo từ trang HTML: mountShop(cfg, mode)
export function mountShop(cfg, mode) {
  const start = () => { if (!window.shopGame) window.shopGame = new ShopGame(cfg, mode); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}
