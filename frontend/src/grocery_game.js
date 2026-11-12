/**
 * Tiệm Tạp Hóa Của Tôi (我的小卖部)
 * Mô phỏng quản lý tiệm tạp hóa kiểu Papa's: khách đến theo lịch & xếp hàng,
 * nhận đơn → nhặt hàng → quét mã → thu tiền & thối tiền → chấm điểm.
 *
 * QUY TẮC LƯU: mỗi lần tải trang là 1 ván mới (không lưu tiến trình).
 * Chỉ KẾT QUẢ mỗi ngày bán hàng được gửi lên tài khoản → bảng xếp hạng giữ thành tích cao nhất.
 *
 * Lưu ý: file này còn được nạp dạng <script> thường khi mở bằng file:// → không dùng import/export.
 */

// ============================================================================
// 1. ÂM THANH (Web Audio + giọng đọc tiếng Trung)
// ============================================================================
class GroceryAudio {
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
  beep() { this.tone(1760, 0.1, { vol: 0.28 }); }
  coin() { this.tone(1800, 0.12, { vol: 0.16 }); this.tone(2400, 0.12, { vol: 0.14, delay: 0.03 }); }
  bell() { this.tone(1320, 0.5, { type: 'triangle', vol: 0.2 }); this.tone(1980, 0.4, { type: 'triangle', vol: 0.1, delay: 0.05 }); }
  error() { this.tone(160, 0.3, { type: 'sawtooth', vol: 0.22, slideTo: 110 }); }
  register() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 0.32, { type: 'triangle', vol: 0.22, delay: i * 0.08 })); }
  sad() { this.tone(400, 0.35, { type: 'triangle', vol: 0.18, slideTo: 220 }); }

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
// 2. DỮ LIỆU: HÀNG HÓA · KHÁCH · TỪ VỰNG
// ============================================================================
const GROCERY_ITEMS = [
  { id: 'latiao', nameChn: '辣条', pinyin: 'làtiáo', nameVi: 'que cay', quantifier: '包', qPin: 'bāo', quantifierVi: 'gói', cost: 1.0, price: 2.0, maxStock: 12, emoji: '🌶️', unlocked: true, unlockCost: 0 },
  { id: 'rabbit_candy', nameChn: '大白兔奶糖', pinyin: 'dàbáitù nǎitáng', nameVi: 'kẹo sữa Thỏ Trắng', quantifier: '包', qPin: 'bāo', quantifierVi: 'gói', cost: 1.5, price: 3.0, maxStock: 10, emoji: '🍬', unlocked: true, unlockCost: 0 },
  { id: 'iced_tea', nameChn: '冰红茶', pinyin: 'bīnghóngchá', nameVi: 'trà đá chanh', quantifier: '瓶', qPin: 'píng', quantifierVi: 'chai', cost: 2.0, price: 3.5, maxStock: 8, emoji: '🧃', unlocked: true, unlockCost: 0 },
  { id: 'instant_noodles', nameChn: '方便面', pinyin: 'fāngbiànmiàn', nameVi: 'mì ăn liền', quantifier: '桶', qPin: 'tǒng', quantifierVi: 'hộp', cost: 3.0, price: 5.0, maxStock: 8, emoji: '🍜', unlocked: true, unlockCost: 0 },
  { id: 'shrimp_snack', nameChn: '虾条', pinyin: 'xiātiáo', nameVi: 'snack tôm', quantifier: '包', qPin: 'bāo', quantifierVi: 'gói', cost: 1.0, price: 2.0, maxStock: 12, emoji: '🦐', unlocked: true, unlockCost: 0 },
  { id: 'milk_can', nameChn: '牛奶', pinyin: 'niúnǎi', nameVi: 'sữa lon', quantifier: '罐', qPin: 'guàn', quantifierVi: 'lon', cost: 3.5, price: 6.0, maxStock: 8, emoji: '🥛', unlocked: false, unlockCost: 45 },
  { id: 'cola', nameChn: '可乐', pinyin: 'kělè', nameVi: 'nước ngọt cola', quantifier: '瓶', qPin: 'píng', quantifierVi: 'chai', cost: 2.0, price: 3.5, maxStock: 8, emoji: '🥤', unlocked: false, unlockCost: 70 },
  { id: 'chips', nameChn: '薯片', pinyin: 'shǔpiàn', nameVi: 'khoai tây chiên', quantifier: '包', qPin: 'bāo', quantifierVi: 'gói', cost: 4.5, price: 7.0, maxStock: 8, emoji: '🥔', unlocked: false, unlockCost: 110 },
  { id: 'jelly', nameChn: '果冻', pinyin: 'guǒdòng', nameVi: 'thạch trái cây', quantifier: '袋', qPin: 'dài', quantifierVi: 'túi', cost: 3.0, price: 5.0, maxStock: 10, emoji: '🍮', unlocked: false, unlockCost: 150 },
  { id: 'seeds', nameChn: '瓜子', pinyin: 'guāzǐ', nameVi: 'hạt hướng dương', quantifier: '包', qPin: 'bāo', quantifierVi: 'gói', cost: 3.5, price: 6.0, maxStock: 10, emoji: '🌻', unlocked: false, unlockCost: 200 },
  { id: 'lollipop', nameChn: '棒棒糖', pinyin: 'bàngbàngtáng', nameVi: 'kẹo mút', quantifier: '根', qPin: 'gēn', quantifierVi: 'cây', cost: 0.5, price: 1.5, maxStock: 15, emoji: '🍭', unlocked: false, unlockCost: 260 },
  { id: 'noodle_bowl', nameChn: '酸辣粉', pinyin: 'suānlàfěn', nameVi: 'miến chua cay', quantifier: '碗', qPin: 'wǎn', quantifierVi: 'bát', cost: 5.0, price: 8.5, maxStock: 8, emoji: '🍲', unlocked: false, unlockCost: 330 }
];

const SHELF_SLOTS = 12; // 3 tầng × 4 ô

const GROCERY_CUSTOMERS = [
  { id: 'xiaoyu', nameChn: '小雨', nameVi: 'Bé Mưa', img: 'boba_customer_girl.jpg' },
  { id: 'xiaohao', nameChn: '小浩', nameVi: 'Tiểu Hạo', img: 'boba_customer_boy.jpg' },
  { id: 'xiaotong', nameChn: '晓彤', nameVi: 'Hiểu Đồng', img: 'boba_customer_xiaotong.jpg' },
  { id: 'linjie', nameChn: '林姐', nameVi: 'Chị Lâm', img: 'boba_customer_linjie.jpg' },
  { id: 'wangshu', nameChn: '王叔', nameVi: 'Chú Vương', img: 'boba_customer_wangshu.jpg' },
  { id: 'nainai', nameChn: '奶奶', nameVi: 'Bà nội', img: 'boba_customer_grandma.jpg' },
  { id: 'abao', nameChn: '阿宝', nameVi: 'Gấu A Bảo', img: 'boba_customer_abao.jpg' }
];

const VOCAB_DATABASE = {
  snacks: GROCERY_ITEMS.filter(i => !['iced_tea', 'cola', 'milk_can'].includes(i.id)).map(i => ({ chn: i.nameChn, pin: i.pinyin, vi: i.nameVi })),
  drinks: GROCERY_ITEMS.filter(i => ['iced_tea', 'cola', 'milk_can'].includes(i.id)).map(i => ({ chn: i.nameChn, pin: i.pinyin, vi: i.nameVi })),
  quantifiers: [
    { chn: '包', pin: 'bāo', vi: 'gói, bịch' },
    { chn: '瓶', pin: 'píng', vi: 'chai' },
    { chn: '罐', pin: 'guàn', vi: 'lon' },
    { chn: '桶', pin: 'tǒng', vi: 'hộp, thùng (mì ly)' },
    { chn: '袋', pin: 'dài', vi: 'túi' },
    { chn: '根', pin: 'gēn', vi: 'cây, que' },
    { chn: '碗', pin: 'wǎn', vi: 'bát' }
  ],
  business: [
    { chn: '小卖部', pin: 'xiǎomàibù', vi: 'tiệm tạp hóa nhỏ' },
    { chn: '欢迎光临', pin: 'huānyíng guānglín', vi: 'chào mừng quý khách' },
    { chn: '老板', pin: 'lǎobǎn', vi: 'ông chủ, chủ tiệm' },
    { chn: '货架', pin: 'huòjià', vi: 'kệ hàng' },
    { chn: '一共', pin: 'yígòng', vi: 'tổng cộng' },
    { chn: '找零', pin: 'zhǎolíng', vi: 'thối tiền' },
    { chn: '进货', pin: 'jìnhuò', vi: 'nhập hàng' },
    { chn: '打烊', pin: 'dǎyàng', vi: 'đóng cửa tiệm' },
    { chn: '猫', pin: 'māo', vi: 'con mèo' }
  ]
};
const VOCAB_TOTAL = Object.values(VOCAB_DATABASE).reduce((s, l) => s + l.length, 0);

// ============================================================================
// 3. LUẬT CHƠI
// ============================================================================
const QUEUE_RULES = {
  maxLine: 3,              // tối đa 3 người đứng chờ (không tính người ở quầy)
  patienceMs: 50000,       // chờ quá 50s (tính cả lúc đứng ở quầy trước khi nhận đơn) → bỏ về
  firstArrivalMs: 700,
  arriveBaseMs: 26000,
  arrivePerDayMs: 1500,
  arriveMinMs: 14000,
  arriveJitterMs: 5000,
  perDayBase: 3,
  perDayMax: 8
};

const MISSION_RULES = {
  revenuePerGuest: 9,      // mục tiêu doanh thu = số khách × 9 ¥ (làm tròn lên bội số 5)
  roundTo: 5,
  maxLostRatio: 0.25,
  minChangeAccuracy: 80,   // % khách được thối đúng ngay lần đầu
  bonusPerStar: 10
};

const SCORE_RULES = {
  pickPenalty: 20,         // mỗi lần nhặt nhầm
  changePenalty: 30,       // mỗi lần thối sai
  hintPenalty: 20,         // dùng gợi ý số tiền thối
  speedBaseMs: 24000,
  speedPerUnitMs: 6000,
  tipMax: 5.5,
  weights: { pick: 0.3, speed: 0.2, change: 0.3, wait: 0.2 }
};

const STAGE_W = 1280;
const STAGE_H = 720;
const STATION_ORDER = ['view-order-station', 'view-shelves-station', 'view-scan-station', 'view-change-station'];
const ASSET = (f) => `./assets/${f}`;
const cents = (v) => Math.round(Number(v) * 100);
const fmt = (v) => (Math.round(Number(v) * 100) / 100).toFixed(2);
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NUM_CHN = { 1: '一', 2: '两', 3: '三' };
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

// "一" đổi thanh: yí trước thanh 4, yì trước các thanh khác
function yiPinyin(nextPin) {
  return /[àèìòùǜ]/.test(nextPin) ? 'yí' : 'yì';
}

// ============================================================================
// 4. ĐỒNG BỘ TÀI KHOẢN (chỉ gửi kết quả ngày → bảng xếp hạng)
// ============================================================================
const GameCloud = {
  key: 'grocery',
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
    try {
      const res = await fetch(this.apiBase() + path, { credentials: 'include', cache: 'no-store', ...options, headers, signal: ctrl ? ctrl.signal : undefined });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      if (timer) clearTimeout(timer);
    }
  },
  getProgress() { return this.request(`/api/${this.key}/progress`); },
  sendDayResult(dayResult) { return this.request(`/api/${this.key}/progress`, { method: 'POST', body: JSON.stringify({ dayResult }), keepalive: true }); },
  getLeaderboard() { return this.request(`/api/${this.key}/leaderboard?limit=50`); }
};

// ============================================================================
// 5. GAME
// ============================================================================
class GroceryGame {
  constructor() {
    this.audio = new GroceryAudio();

    // Không khôi phục gì: dọn dữ liệu do phiên bản cũ để lại trên trình duyệt
    try { ['grocery_money', 'grocery_day', 'grocery_shelves'].forEach(k => localStorage.removeItem(k)); } catch (e) {}

    this.money = 50;
    this.day = 1;
    this.shelves = GROCERY_ITEMS.map(it => ({ ...it, currentStock: it.unlocked ? 6 : 0 }));
    this.learnedVocab = new Set(['小卖部', '老板']);

    this.showPinyin = true;
    this.showVietnamese = true;
    this.relaxedMode = false;

    // Vòng đời ngày
    this.gameTime = 0;
    this.lastTickAt = performance.now();
    this.dayStarted = false;
    this.dayEnded = false;
    this.stats = this.freshStats(this.getCustomersPerDay());
    this.mission = null;
    this.records = [];

    // Khách
    this.line = [];
    this.current = null;
    this.ticketSeq = 0;
    this.customerDeck = [];
    this.nextArrivalAt = 0;

    // Bàn làm việc của đơn hiện tại
    this.basket = [];
    this.scanItems = [];
    this.changeTray = [];
    this.restockQty = {};
    this.currentStation = 'view-order-station';

    this.cloud = { checked: false, loggedIn: false, offline: false, name: '', picture: '', best: null, history: [] };
    this.rankTab = 'global';

    this.initDOM();
    this.fitStage();
    this.renderAll();
    this.showTitleScreen();
    this.tickTimer = setInterval(() => this.tick(), 200);
    this.cloudReady = this.initCloud().catch(() => {}).finally(() => { this.cloud.checked = true; this.renderAccountChip(); });
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
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 2800);
  }

  learn(word) {
    if (!word || this.learnedVocab.has(word)) return;
    this.learnedVocab.add(word);
    this.updateHUD();
  }

  isModalOpen() {
    return [...document.querySelectorAll('.g-modal')].some(m => m.style.display && m.style.display !== 'none');
  }

  isTitleVisible() {
    const t = this.$('title-screen');
    return !!t && !t.classList.contains('hidden');
  }

  isClockPaused() {
    return this.isTitleVisible() || this.isModalOpen() || document.hidden;
  }

  openModal(id) {
    const m = this.$(id);
    if (m) m.style.display = 'flex';
  }

  closeModal(id) {
    const m = this.$(id);
    if (m) m.style.display = 'none';
  }

  stagePos(el) {
    const stage = this.$('g-stage').getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const s = this.stageScale || 1;
    return { x: (r.left - stage.left) / s, y: (r.top - stage.top) / s, w: r.width / s, h: r.height / s };
  }

  // --------------------------------------------------------------------------
  // Khởi tạo giao diện & sự kiện
  // --------------------------------------------------------------------------
  initDOM() {
    const on = (id, ev, fn) => { const el = this.$(id); if (el) el.addEventListener(ev, fn); };

    window.addEventListener('resize', () => this.fitStage());
    window.addEventListener('orientationchange', () => setTimeout(() => this.fitStage(), 200));
    document.addEventListener('visibilitychange', () => { this.lastTickAt = performance.now(); });

    // Màn hình chờ
    on('btn-title-play', 'click', () => this.onTitlePlay());
    on('btn-title-guide', 'click', () => { this.audio.pop(); this.openModal('modal-guide'); });
    on('btn-title-rank', 'click', () => { this.audio.pop(); this.openRankModal(); });

    // HUD
    on('btn-hud-home', 'click', () => { this.audio.pop(); this.showTitleScreen(); });
    on('btn-pause-game', 'click', () => { this.audio.pop(); this.openModal('modal-settings'); });
    on('btn-fullscreen', 'click', () => this.toggleFullscreen());
    on('btn-rotate-fullscreen', 'click', () => this.toggleFullscreen());
    on('btn-open-vocab', 'click', () => { this.audio.pop(); this.openVocabModal(); });
    on('btn-open-restock', 'click', () => this.openRestockModal());

    // Trạm
    document.querySelectorAll('.g-tab').forEach(btn => btn.addEventListener('click', () => this.switchStation(btn.dataset.target)));
    on('btn-goto-shelves-from-order', 'click', () => this.switchStation('view-shelves-station'));
    on('btn-goto-scan', 'click', () => this.switchStation('view-scan-station'));
    on('btn-goto-change', 'click', () => this.switchStation('view-change-station'));

    on('btn-take-order-action', 'click', () => this.takeOrder());
    on('btn-replay-order-audio', 'click', () => this.speakOrder());
    on('btn-cat', 'click', () => this.petCat());
    on('btn-clear-basket-station', 'click', () => this.clearBasket());
    on('btn-unlock-shelf-header', 'click', () => this.openUnlockModal());
    on('btn-quick-restock-header', 'click', () => this.openRestockModal());
    on('btn-trigger-scanner', 'click', () => this.scanNextItem());
    on('btn-reset-tray-action', 'click', () => this.resetTray());
    on('btn-change-hint', 'click', () => this.useChangeHint());
    on('btn-confirm-and-deliver', 'click', () => this.deliver());
    document.querySelectorAll('.drawer-grid .rmb').forEach(btn => btn.addEventListener('click', () => this.addToTray(parseFloat(btn.dataset.val))));

    // Bảng điểm, nhiệm vụ, tổng kết
    on('btn-next-customer-grocery', 'click', () => this.closeScorecard());
    on('btn-mission-start', 'click', () => this.startDay());
    on('btn-mission-restock', 'click', () => this.openRestockModal());
    on('btn-next-day-start', 'click', () => this.startNextDay());

    // Nhập hàng
    on('btn-autofill-all-stock', 'click', () => this.autofillRestock());
    on('btn-confirm-restock-open', 'click', () => this.confirmRestock());

    // Từ vựng
    document.querySelectorAll('.vocab-tab').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('.vocab-tab').forEach(b => b.classList.toggle('active', b === btn));
      this.renderVocab(btn.dataset.tab);
    }));

    // Xếp hạng
    document.querySelectorAll('.rank-tab').forEach(btn => btn.addEventListener('click', () => { this.audio.pop(); this.switchRankTab(btn.dataset.rankTab); }));

    // Đóng modal
    document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => {
      this.closeModal(btn.dataset.close);
      this.lastTickAt = performance.now();
    }));

    // Cài đặt
    on('setting-sfx', 'change', (e) => { this.audio.sfxEnabled = e.target.checked; });
    on('setting-voice', 'change', (e) => { this.audio.voiceEnabled = e.target.checked; });
    on('setting-pinyin', 'change', (e) => { this.showPinyin = e.target.checked; this.renderSpeech(); });
    on('setting-vietnamese', 'change', (e) => { this.showVietnamese = e.target.checked; this.renderSpeech(); });
    on('setting-relaxed', 'change', (e) => {
      this.relaxedMode = e.target.checked;
      this.updatePatienceUI();
      this.showToast(this.relaxedMode ? '🍃' : '⏱️', this.relaxedMode ? 'Chế độ thư giãn: khách chờ bao lâu cũng được.' : 'Chế độ thường: khách chờ quá lâu sẽ bỏ về!');
    });
    on('btn-back-to-title', 'click', () => { this.closeModal('modal-settings'); this.showTitleScreen(); });
    on('btn-reset-save', 'click', () => {
      if (confirm('Chơi lại từ đầu? (Kỷ lục trên bảng xếp hạng vẫn được giữ)')) location.reload();
    });
  }

  fitStage() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const scale = Math.min(w / STAGE_W, h / STAGE_H);
    this.stageScale = scale > 0 ? scale : 1;
    document.documentElement.style.setProperty('--stage-scale', this.stageScale.toFixed(4));
    const flush = (w - STAGE_W * this.stageScale < 24 && h - STAGE_H * this.stageScale < 24) || w < 900;
    document.body.classList.toggle('stage-flush', flush);
  }

  toggleFullscreen() {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
          .then(() => screen.orientation?.lock?.('landscape').catch(() => {}))
          .catch(() => {});
      } else if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
  }

  // --------------------------------------------------------------------------
  // Màn hình chờ
  // --------------------------------------------------------------------------
  isDayInProgress() {
    return this.dayStarted && !this.dayEnded;
  }

  showTitleScreen() {
    const el = this.$('title-screen');
    if (el) el.classList.remove('hidden');
    document.body.classList.add('on-title');
    const busy = this.isDayInProgress();
    this.setText('title-play-chn', busy ? '继续营业' : '开门营业');
    this.setText('title-play-vi', busy ? `Tiếp tục ngày ${this.day}` : (this.day > 1 ? `Bắt đầu ngày ${this.day}` : 'Bắt đầu'));
    const prog = this.$('title-progress');
    if (prog) {
      const best = this.records.reduce((b, r) => (!b || r.earnings > b.earnings ? r : b), null);
      prog.innerHTML = (this.day > 1 || this.dayStarted)
        ? `<span>📅 Ngày ${this.day}</span><span>🪙 ${fmt(this.money)} ¥</span>${best ? `<span>🏆 Ván này: ${fmt(best.earnings)} ¥</span>` : ''}`
        : '<span>✨ Vừa bán tạp hóa · vừa học tiếng Trung</span>';
    }
  }

  hideTitleScreen() {
    const el = this.$('title-screen');
    if (el) el.classList.add('hidden');
    document.body.classList.remove('on-title');
    this.lastTickAt = performance.now();
  }

  onTitlePlay() {
    this.audio.init();
    this.audio.pop();
    this.hideTitleScreen();
    if (this.isDayInProgress()) {
      this.showToast('▶️', `Tiếp tục ngày ${this.day}!`);
    } else if (!this.dayEnded) {
      this.showMissionBriefing();
    }
  }

  // --------------------------------------------------------------------------
  // Nhiệm vụ ngày
  // --------------------------------------------------------------------------
  getCustomersPerDay() {
    return Math.min(QUEUE_RULES.perDayMax, QUEUE_RULES.perDayBase + this.day);
  }

  freshStats(total) {
    return { total, spawned: 0, served: 0, lost: 0, revenue: 0, cost: 0, scoreSum: 0, changeFirstTry: 0 };
  }

  buildMission() {
    const total = this.getCustomersPerDay();
    const target = Math.ceil((total * MISSION_RULES.revenuePerGuest) / MISSION_RULES.roundTo) * MISSION_RULES.roundTo;
    const maxLost = Math.max(1, Math.floor(total * MISSION_RULES.maxLostRatio));
    return { day: this.day, total, target, maxLost, minAccuracy: MISSION_RULES.minChangeAccuracy, rewarded: false };
  }

  showMissionBriefing() {
    this.mission = this.buildMission();
    this.stats.total = this.mission.total;
    const m = this.mission;
    this.setText('mission-day-chn', `第${this.day}天`);
    const unlocked = this.shelves.filter(s => s.unlocked);
    const lowStock = unlocked.filter(s => s.currentStock <= 2).length;
    this.setText('mission-sub', `Hôm nay có ${m.total} khách ghé tiệm.${lowStock ? ` ⚠️ ${lowStock} món sắp hết hàng — nên nhập thêm!` : ''}`);
    const goals = this.$('mission-goals');
    if (goals) {
      goals.innerHTML = `
        <div class="mgoal main"><span class="mg-icon">💰</span><span>Doanh thu đạt <b>${m.target} ¥</b></span><span class="mg-star">⭐</span></div>
        <div class="mgoal"><span class="mg-icon">😊</span><span>Không để quá <b>${m.maxLost}</b> khách bỏ về</span><span class="mg-star">⭐</span></div>
        <div class="mgoal"><span class="mg-icon">💴</span><span>Thối đúng ngay lần đầu cho <b>${m.minAccuracy}%</b> khách</span><span class="mg-star">⭐</span></div>`;
    }
    this.renderHUDGoal();
    this.openModal('modal-day-mission');
  }

  startDay() {
    this.closeModal('modal-day-mission');
    this.audio.init();
    this.audio.bell();
    this.dayStarted = true;
    this.dayEnded = false;
    this.nextArrivalAt = this.gameTime + QUEUE_RULES.firstArrivalMs;
    this.learn('欢迎光临');
    this.lastTickAt = performance.now();
    this.switchStation('view-order-station', true);
    this.renderAll();
    this.showToast('🌅', `第${this.day}天 · Mở cửa! Mục tiêu: ${this.mission.target} ¥ từ ${this.mission.total} khách.`);
  }

  evaluateMission() {
    const m = this.mission;
    const s = this.stats;
    if (!m) return [];
    const accuracy = s.served > 0 ? Math.round((s.changeFirstTry / s.served) * 100) : 0;
    return [
      { icon: '💰', text: `Doanh thu ${m.target} ¥`, value: `${fmt(s.revenue)} ¥`, done: s.revenue >= m.target },
      { icon: '😊', text: `Tối đa ${m.maxLost} khách bỏ về`, value: `${s.lost} khách`, done: s.lost <= m.maxLost },
      { icon: '💴', text: `Thối đúng ngay ≥ ${m.minAccuracy}%`, value: s.served > 0 ? `${accuracy}%` : '—', done: s.served > 0 && accuracy >= m.minAccuracy }
    ];
  }

  // --------------------------------------------------------------------------
  // Đồng hồ & hàng đợi
  // --------------------------------------------------------------------------
  tick() {
    const now = performance.now();
    const dt = Math.min(1000, now - this.lastTickAt);
    this.lastTickAt = now;
    if (this.isClockPaused() || !this.dayStarted || this.dayEnded) return;
    this.gameTime += dt;

    // Khách mới đến
    if (this.stats.spawned < this.stats.total && this.gameTime >= this.nextArrivalAt) {
      if (this.line.length < QUEUE_RULES.maxLine) {
        this.spawnArrival();
      } else {
        this.nextArrivalAt = this.gameTime + 3000; // hàng đầy → khách tới sau
      }
    }

    // Hết kiên nhẫn → bỏ về (chỉ khi chưa được nhận đơn)
    if (!this.relaxedMode) {
      [...this.line].forEach(c => { if (this.gameTime - c.arrivedAt >= QUEUE_RULES.patienceMs) this.loseCustomer(c); });
      const cur = this.current;
      if (cur && !cur.takenAt && !cur.leaving && this.gameTime - cur.arrivedAt >= QUEUE_RULES.patienceMs) this.loseCustomer(cur);
    }

    if (!this.current) this.promoteNext();
    this.updatePatienceUI();
    this.checkDayEnd();
  }

  getArrivalGapMs() {
    const base = Math.max(QUEUE_RULES.arriveMinMs, QUEUE_RULES.arriveBaseMs - (this.day - 1) * QUEUE_RULES.arrivePerDayMs);
    return base + Math.random() * QUEUE_RULES.arriveJitterMs;
  }

  nextCustomerProfile() {
    const present = new Set([...this.line.map(c => c.profile.id), this.current && this.current.profile.id]);
    for (let i = 0; i < GROCERY_CUSTOMERS.length * 2; i++) {
      if (!this.customerDeck.length) this.customerDeck = [...GROCERY_CUSTOMERS].sort(() => Math.random() - 0.5);
      const c = this.customerDeck.shift();
      if (!present.has(c.id)) return c;
    }
    return GROCERY_CUSTOMERS[randInt(0, GROCERY_CUSTOMERS.length - 1)];
  }

  spawnArrival() {
    this.ticketSeq += 1;
    const c = { id: this.ticketSeq, profile: this.nextCustomerProfile(), arrivedAt: this.gameTime };
    this.line.push(c);
    this.stats.spawned += 1;
    this.nextArrivalAt = this.gameTime + this.getArrivalGapMs();
    this.audio.bell();
    const bell = document.querySelector('.door-bell');
    if (bell) { bell.classList.remove('ring'); void bell.offsetWidth; bell.classList.add('ring'); }
    if (this.current) this.showToast('🔔', `${c.profile.nameChn} (${c.profile.nameVi}) vừa vào tiệm và đang xếp hàng.`);
    this.renderRail();
  }

  promoteNext() {
    if (this.current || !this.line.length) return;
    const c = this.line.shift();
    c.order = this.makeOrder();
    c.wrongPicks = 0;
    c.changeWrong = 0;
    c.hintUsed = false;
    this.current = c;
    this.resetWorkbench();
    if (!c.order) {
      // Kệ trống trơn → khách thất vọng bỏ về
      this.renderCounter(true);
      this.audio.sad();
      this.showToast('📦', `Kệ hết sạch hàng! ${c.profile.nameChn} không mua được gì. Hãy nhập hàng ngay!`, 'warn');
      c.leaving = true;
      setTimeout(() => { if (this.current === c) this.loseCustomer(c, true); }, 2600);
      return;
    }
    this.renderCounter(true);
    this.renderRail();
    setTimeout(() => { if (this.current === c && !c.takenAt) this.speakOrder(); }, 450);
  }

  loseCustomer(c, silent = false) {
    const isCurrent = this.current === c;
    if (isCurrent) {
      // trả hàng đã nhặt (nếu có) về kệ
      this.clearBasket(true);
      this.current = null;
      const door = this.$('door-customer');
      if (door) { door.classList.remove('enter'); door.classList.add('leave', 'angry'); }
    } else {
      this.line = this.line.filter(x => x !== c);
    }
    this.stats.lost += 1;
    if (!silent) {
      this.audio.sad();
      this.showToast('😠', `${c.profile.nameChn} (${c.profile.nameVi}) chờ lâu quá nên bỏ về!`, 'warn');
    }
    this.renderRail();
    setTimeout(() => { this.promoteNext(); this.renderCounter(); }, isCurrent ? 550 : 0);
  }

  checkDayEnd() {
    if (!this.dayStarted || this.dayEnded) return;
    const s = this.stats;
    if (s.spawned >= s.total && !this.line.length && !this.current && !this.isModalOpen()) {
      this.showDaySummary();
    }
  }

  patienceUsed(c) {
    if (!c) return 0;
    return Math.min(1, (this.gameTime - c.arrivedAt) / QUEUE_RULES.patienceMs);
  }

  // --------------------------------------------------------------------------
  // Đơn hàng
  // --------------------------------------------------------------------------
  makeOrder() {
    const avail = this.shelves.filter(s => s.unlocked && s.currentStock > 0);
    if (!avail.length) return null;
    const wantTwo = Math.random() < Math.min(0.75, 0.35 + this.day * 0.08);
    const count = Math.min(avail.length, wantTwo ? 2 : 1);
    const picked = [...avail].sort(() => Math.random() - 0.5).slice(0, count);
    const items = picked.map(it => {
      const maxQ = Math.min(it.currentStock, this.day >= 3 ? 3 : 2);
      return { item: it, qty: randInt(1, maxQ) };
    });
    const due = items.reduce((s, x) => s + cents(x.item.price) * x.qty, 0) / 100;
    const paid = this.pickPaidAmount(due);
    return { items, due, paid, change: Math.round((paid - due) * 100) / 100 };
  }

  // Khách trả bằng tờ tiền "tròn" lớn hơn số phải trả
  pickPaidAmount(due) {
    const options = new Set();
    const up = (step) => Math.ceil((due + 0.001) / step) * step;
    options.add(up(5));
    options.add(up(10));
    [20, 50].forEach(n => { if (n > due) options.add(n); });
    const list = [...options].filter(v => v > due && v - due <= 47).sort((a, b) => a - b).slice(0, 3);
    return list.length ? list[randInt(0, list.length - 1)] : up(10);
  }

  orderPhrase(order) {
    const zh = order.items.map(x => `${NUM_CHN[x.qty] || x.qty}${x.item.quantifier}${x.item.nameChn}`);
    const pin = order.items.map(x => {
      const num = x.qty === 1 ? yiPinyin(x.item.qPin) : x.qty === 2 ? 'liǎng' : 'sān';
      return `${num} ${x.item.qPin} ${x.item.pinyin}`;
    });
    const vi = order.items.map(x => `${x.qty} ${x.item.quantifierVi} ${x.item.nameVi}`);
    return {
      zh: `老板，我要${zh.join('和')}！`,
      zhHtml: `老板，我要${order.items.map((x, i) => `<em>${zh[i]}</em>`).join('和')}！`,
      pin: `Lǎobǎn, wǒ yào ${pin.join(' hé ')}!`,
      vi: `(Ông chủ ơi, cho tôi ${vi.join(' và ')}!)`
    };
  }

  speakOrder() {
    if (!this.current || !this.current.order) return;
    this.audio.speak(this.orderPhrase(this.current.order).zh);
  }

  takeOrder() {
    const c = this.current;
    if (!c || !c.order || c.takenAt) return;
    this.audio.pick();
    c.takenAt = this.gameTime;
    // Điểm chờ: nhận đơn trong 25% thời gian kiên nhẫn = 100 điểm, càng trễ càng thấp (tối thiểu 40)
    const used = this.patienceUsed(c);
    c.waitScore = this.relaxedMode ? 100 : Math.round(100 - 60 * Math.max(0, Math.min(1, (used - 0.25) / 0.75)));
    c.order.items.forEach(x => { this.learn(x.item.quantifier); });
    this.learn('老板');
    this.renderCounter();
    this.renderOrderChecklist();
    this.renderShelves();
    this.renderRail();
    this.setAttention('view-shelves-station');
    this.showToast('📝', 'Đã nhận đơn! Sang 货架区 để nhặt hàng vào giỏ.');
  }

  resetWorkbench() {
    this.basket = [];
    this.scanItems = [];
    this.changeTray = [];
    this.renderBasket();
    this.renderScan();
    this.renderChange();
    this.renderOrderChecklist();
    this.renderShelves();
  }

  // --------------------------------------------------------------------------
  // Trạm
  // --------------------------------------------------------------------------
  switchStation(id, silent = false) {
    if (!STATION_ORDER.includes(id)) return;
    const prevIdx = STATION_ORDER.indexOf(this.currentStation);
    const nextIdx = STATION_ORDER.indexOf(id);
    this.currentStation = id;
    document.querySelectorAll('.g-station').forEach(v => {
      const active = v.id === id;
      v.classList.toggle('from-left', !active && STATION_ORDER.indexOf(v.id) < nextIdx);
      v.classList.toggle('active', active);
    });
    document.querySelectorAll('.g-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.target === id);
      if (b.dataset.target === id) b.classList.remove('attention');
    });
    if (id === 'view-shelves-station') this.learn('货架');
    if (id === 'view-scan-station') this.prepareScan();
    if (id === 'view-change-station') this.prepareChange();
    if (!silent && prevIdx !== nextIdx) this.audio.pop();
  }

  setAttention(id) {
    document.querySelectorAll('.g-tab').forEach(b => b.classList.toggle('attention', b.dataset.target === id && this.currentStation !== id));
  }

  // ---------------- Trạm 2: kệ hàng
  pickItem(item, el) {
    const c = this.current;
    if (!c || !c.takenAt) {
      this.audio.error();
      this.showToast('🛎️', 'Chưa có đơn! Hãy về 点单台 nhận đơn của khách trước.', 'warn');
      return;
    }
    if (item.currentStock <= 0) return;
    const need = c.order.items.find(x => x.item.id === item.id);
    const inBasket = this.basket.find(b => b.item.id === item.id);
    const have = inBasket ? inBasket.qty : 0;
    if (!need || have >= need.qty) {
      // Nhặt nhầm: không đúng món hoặc vượt số lượng → trừ điểm, không bỏ vào giỏ
      c.wrongPicks += 1;
      this.audio.error();
      if (el) { el.classList.remove('wrong'); void el.offsetWidth; el.classList.add('wrong'); }
      this.showToast('❌', need ? `Khách chỉ cần ${need.qty}${item.quantifier} ${item.nameChn} thôi!` : `Khách không mua ${item.nameChn} (${item.nameVi})!`, 'warn');
      return;
    }
    item.currentStock -= 1;
    if (inBasket) inBasket.qty += 1; else this.basket.push({ item, qty: 1 });
    this.learn(item.nameChn);
    this.audio.pick();
    this.flyToBasket(item, el);
    this.renderShelves();
    this.renderBasket();
    this.renderOrderChecklist();
    if (this.isBasketComplete()) {
      this.setAttention('view-scan-station');
      this.showToast('✨', 'Đã nhặt đủ hàng! Sang 扫码台 để quét mã.');
    }
  }

  flyToBasket(item, el) {
    const target = document.querySelector('.basket-card');
    const stage = this.$('g-stage');
    if (!el || !target || !stage) return;
    const a = this.stagePos(el);
    const b = this.stagePos(target);
    const f = document.createElement('div');
    f.className = 'fly-item';
    f.textContent = item.emoji;
    f.style.left = `${a.x + a.w / 2 - 16}px`;
    f.style.top = `${a.y + 10}px`;
    stage.appendChild(f);
    requestAnimationFrame(() => {
      f.style.transform = `translate(${b.x + b.w / 2 - (a.x + a.w / 2)}px, ${b.y + b.h / 2 - a.y}px) scale(0.6)`;
      f.style.opacity = '0.2';
    });
    setTimeout(() => f.remove(), 600);
  }

  removeFromBasket(itemId) {
    const idx = this.basket.findIndex(b => b.item.id === itemId);
    if (idx < 0) return;
    const b = this.basket[idx];
    b.item.currentStock += 1;
    b.qty -= 1;
    if (b.qty <= 0) this.basket.splice(idx, 1);
    this.audio.pick();
    this.scanItems = [];
    this.renderShelves();
    this.renderBasket();
    this.renderOrderChecklist();
  }

  clearBasket(silent = false) {
    this.basket.forEach(b => { b.item.currentStock += b.qty; });
    this.basket = [];
    this.scanItems = [];
    this.changeTray = [];
    if (!silent) this.audio.pick();
    this.renderShelves();
    this.renderBasket();
    this.renderOrderChecklist();
  }

  isBasketComplete() {
    const c = this.current;
    if (!c || !c.order || !c.takenAt) return false;
    return c.order.items.every(x => {
      const b = this.basket.find(y => y.item.id === x.item.id);
      return b && b.qty === x.qty;
    }) && this.basket.length === c.order.items.length;
  }

  // ---------------- Trạm 3: quét mã
  prepareScan() {
    if (!this.isBasketComplete()) { this.renderScan(); return; }
    const already = this.scanItems.length > 0;
    if (!already) {
      this.scanItems = [];
      this.basket.forEach(b => { for (let i = 0; i < b.qty; i++) this.scanItems.push({ item: b.item, scanned: false }); });
    }
    this.learn('一共');
    this.renderScan();
  }

  scanItem(idx) {
    const si = this.scanItems[idx];
    if (!si || si.scanned) return;
    si.scanned = true;
    this.audio.beep();
    const laser = this.$('scanner-laser');
    if (laser) { laser.classList.remove('fire'); void laser.offsetWidth; laser.classList.add('fire'); }
    this.renderScan(idx);
    if (this.scanItems.every(x => x.scanned)) {
      this.setAttention('view-change-station');
      const total = this.current ? this.current.order.due : 0;
      this.audio.speak(`一共${fmt(total).replace(/\.00$/, '').replace(/\.50$/, '块五').replace(/^(\d+)$/, '$1块')}`);
      this.showToast('🧾', `Đã in hóa đơn: 一共 ${fmt(total)} ¥. Sang 找零台 thu tiền!`);
    }
  }

  scanNextItem() {
    const idx = this.scanItems.findIndex(x => !x.scanned);
    if (idx >= 0) this.scanItem(idx);
  }

  // ---------------- Trạm 4: thu tiền & thối tiền
  prepareChange() {
    this.renderChange();
    if (this.current && this.current.order && this.scanItems.length && this.scanItems.every(x => x.scanned)) this.learn('找零');
  }

  isReadyToCharge() {
    return !!(this.current && this.current.takenAt && this.isBasketComplete() && this.scanItems.length && this.scanItems.every(x => x.scanned));
  }

  addToTray(val) {
    if (!this.isReadyToCharge()) {
      this.audio.error();
      this.showToast('📠', 'Chưa quét xong hàng! Hoàn tất 扫码台 trước khi thối tiền.', 'warn');
      return;
    }
    this.changeTray.push(val);
    this.audio.coin();
    this.renderTray();
  }

  removeFromTray(i) {
    this.changeTray.splice(i, 1);
    this.audio.coin();
    this.renderTray();
  }

  resetTray() {
    this.changeTray = [];
    this.renderTray();
  }

  useChangeHint() {
    const c = this.current;
    if (!c || !c.order || c.hintUsed || !this.isReadyToCharge()) return;
    c.hintUsed = true;
    this.renderChange();
  }

  deliver() {
    const c = this.current;
    if (!this.isReadyToCharge()) {
      this.audio.error();
      this.showToast('⚠️', 'Chưa đủ bước: nhận đơn → nhặt đủ hàng → quét mã → rồi mới thối tiền.', 'warn');
      return;
    }
    const tray = this.changeTray.reduce((s, v) => s + cents(v), 0);
    const need = cents(c.order.change);
    if (tray !== need) {
      c.changeWrong += 1;
      this.audio.error();
      this.audio.speak('老板，钱找错啦！');
      const diff = (tray - need) / 100;
      this.showToast('💢', diff > 0 ? `Thối THỪA ${fmt(diff)} ¥ rồi! Đếm lại nhé.` : `Thối THIẾU ${fmt(-diff)} ¥ rồi! Đếm lại nhé.`, 'warn');
      return;
    }
    this.completeOrder();
  }

  completeOrder() {
    const c = this.current;
    const o = c.order;
    const units = o.items.reduce((s, x) => s + x.qty, 0);
    const elapsed = this.gameTime - c.takenAt;
    const target = SCORE_RULES.speedBaseMs + SCORE_RULES.speedPerUnitMs * units;
    const scores = {
      pick: Math.max(0, 100 - SCORE_RULES.pickPenalty * c.wrongPicks),
      speed: elapsed <= target ? 100 : Math.max(40, Math.round(100 - 60 * ((elapsed - target) / (2 * target)))),
      change: Math.max(0, 100 - SCORE_RULES.changePenalty * c.changeWrong - (c.hintUsed ? SCORE_RULES.hintPenalty : 0)),
      wait: c.waitScore ?? 100
    };
    const w = SCORE_RULES.weights;
    const total = Math.round(scores.pick * w.pick + scores.speed * w.speed + scores.change * w.change + scores.wait * w.wait);
    const tip = Math.round((total / 100) * SCORE_RULES.tipMax * 100) / 100;
    const earned = Math.round((o.due + tip) * 100) / 100;

    this.money = Math.round((this.money + earned) * 100) / 100;
    this.stats.revenue = Math.round((this.stats.revenue + earned) * 100) / 100;
    this.stats.served += 1;
    this.stats.scoreSum += total;
    if (c.changeWrong === 0 && !c.hintUsed) this.stats.changeFirstTry += 1;

    this.audio.register();
    this.floatCoins();
    this.showScorecard(c, scores, total, tip, earned);

    // Dọn bàn làm việc, khách rời quầy
    this.current = null;
    this.basket = [];
    this.scanItems = [];
    this.changeTray = [];
    this.renderAll();
  }

  floatCoins() {
    const stage = this.$('g-stage');
    const from = document.querySelector('.change-tray') || document.querySelector('.shop-counter');
    const to = document.querySelector('.g-pill.money');
    if (!stage || !from || !to) return;
    const a = this.stagePos(from);
    const b = this.stagePos(to);
    for (let i = 0; i < 6; i++) {
      const coin = document.createElement('div');
      coin.className = 'coin-float';
      coin.textContent = '🪙';
      const x = a.x + a.w / 2 + (Math.random() * 80 - 40);
      const y = a.y + a.h / 2 + (Math.random() * 40 - 20);
      coin.style.left = `${x}px`;
      coin.style.top = `${y}px`;
      coin.style.setProperty('--dx', `${b.x + 20 - x}px`);
      coin.style.setProperty('--dy', `${b.y + 6 - y}px`);
      coin.style.animationDelay = `${i * 60}ms`;
      stage.appendChild(coin);
      setTimeout(() => coin.remove(), 1300);
    }
    const pill = to;
    setTimeout(() => { pill.classList.remove('bump'); void pill.offsetWidth; pill.classList.add('bump'); }, 700);
  }

  showScorecard(c, scores, total, tip, earned) {
    const set = (bar, val, v) => {
      const b = this.$(bar);
      if (b) { b.style.width = '0%'; setTimeout(() => { b.style.width = `${v}%`; }, 60); }
      this.setText(val, `${v}%`);
    };
    set('score-bar-pick', 'score-val-pick', scores.pick);
    set('score-bar-speed', 'score-val-speed', scores.speed);
    set('score-bar-change', 'score-val-change', scores.change);
    set('score-bar-wait', 'score-val-wait', scores.wait);
    this.setText('score-val-total', `${total}%`);
    const stars = total >= 90 ? 3 : total >= 75 ? 2 : total >= 50 ? 1 : 0;
    this.setText('score-stars', '⭐'.repeat(stars) + '☆'.repeat(3 - stars));
    this.setText('score-base-price', `${fmt(c.order.due)} ¥`);
    this.setText('score-tip-price', `+${fmt(tip)} ¥`);
    this.setText('score-final-receive', `${fmt(earned)} ¥`);
    this.setText('score-ticket-title', `Phiếu #G-${c.id} · ${c.profile.nameChn} (${c.profile.nameVi})`);
    const img = this.$('score-reaction-img');
    if (img) img.src = ASSET(c.profile.img);
    let zh, vi;
    if (total >= 90) { zh = '老板服务真好，找零一分不差，谢谢您！'; vi = '(Chủ tiệm phục vụ tốt quá, thối tiền chuẩn từng xu, cảm ơn nhé!)'; }
    else if (total >= 70) { zh = '谢谢老板，下次再来！'; vi = '(Cảm ơn chủ tiệm, lần sau tôi lại đến!)'; }
    else { zh = '嗯……下次快一点吧。'; vi = '(Ừm… lần sau nhanh hơn chút nhé.)'; }
    this.setText('score-reaction-chn', `“${zh}”`);
    this.setText('score-reaction-vi', vi);
    this.openModal('modal-grocery-score');
    setTimeout(() => this.audio.speak(zh), 500);
  }

  closeScorecard() {
    this.closeModal('modal-grocery-score');
    this.lastTickAt = performance.now();
    this.switchStation('view-order-station');
    this.promoteNext();
    this.renderAll();
    this.checkDayEnd();
  }

  petCat() {
    this.audio.speak('喵～');
    this.learn('猫');
    const cat = this.$('btn-cat');
    if (cat) { cat.classList.remove('meow'); void cat.offsetWidth; cat.classList.add('meow'); }
    this.showToast('🐈', '猫 (māo) · Con mèo đang phơi nắng trên quầy. 喵～');
  }

  // --------------------------------------------------------------------------
  // Tổng kết ngày
  // --------------------------------------------------------------------------
  showDaySummary() {
    this.dayEnded = true;
    this.learn('打烊');
    const s = this.stats;
    const goals = this.evaluateMission();
    const stars = goals.filter(g => g.done).length;
    const bonus = stars * MISSION_RULES.bonusPerStar;
    if (this.mission && !this.mission.rewarded) {
      this.mission.rewarded = true;
      if (bonus > 0) this.money += bonus;
    }
    const avg = s.served > 0 ? Math.round(s.scoreSum / s.served) : 0;
    const accuracy = s.served > 0 ? Math.round((s.changeFirstTry / s.served) * 100) : 0;
    const profit = s.revenue - s.cost;

    const title = this.$('summary-day-title');
    if (title) title.innerHTML = `<span class="zh">第${this.day}天</span> · Tổng kết ngày`;
    this.setText('summary-revenue-val', `${fmt(s.revenue)} ¥`);
    this.setText('summary-cost-val', `${fmt(s.cost)} ¥`);
    this.setText('summary-profit-val', `${profit >= 0 ? '+' : ''}${fmt(profit)} ¥`);
    const pEl = this.$('summary-profit-val');
    if (pEl) pEl.className = profit >= 0 ? 'green' : 'rose';
    this.setText('summary-customers-val', `${s.served}/${s.total}`);
    this.setText('summary-avg-val', s.served ? `${avg}%` : '—');
    this.setText('summary-accuracy-val', s.served ? `${accuracy}%` : '—');

    let msg;
    if (stars === 3) msg = '🏆 Ngày hoàn hảo! Hoàn thành mọi nhiệm vụ!';
    else if (goals[0] && goals[0].done) msg = '🎉 Đạt mục tiêu doanh thu! Cố thêm để lấy đủ 3 ⭐ nhé!';
    else if (s.lost >= s.total / 2) msg = '😥 Nhiều khách bỏ về quá, ngày mai nhanh tay hơn nhé!';
    else msg = '💪 Chưa đạt mục tiêu doanh thu, ngày mai cố lên!';
    this.setText('summary-msg', msg);

    const box = this.$('day-mission-results');
    if (box) {
      box.innerHTML = `
        <div class="mr-head"><span><span class="zh">今日任务</span> · Nhiệm vụ hôm nay</span><span>${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</span></div>
        ${goals.map(g => `<div class="mr-row ${g.done ? 'done' : 'fail'}"><span>${g.done ? '✅' : '❌'}</span><span>${g.icon} ${g.text}</span><span class="mr-val">${g.value}</span></div>`).join('')}
        ${bonus > 0 ? `<div class="mr-bonus">🎁 Thưởng nhiệm vụ: +${bonus} ¥</div>` : ''}`;
    }

    const now = new Date();
    const record = {
      day: this.day,
      earnings: Math.round(s.revenue * 100) / 100,
      served: s.served,
      total: s.total,
      lost: s.lost,
      avg,
      stars,
      date: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
    };
    this.records = this.records.filter(r => r.day !== this.day);
    this.records.push(record);
    if (this.cloud.loggedIn) {
      this.pushDayResult(record);
    } else if (this.cloud.checked) {
      setTimeout(() => this.showToast('🔐', 'Đăng nhập ở trang chủ để lưu thành tích lên bảng xếp hạng!'), 1500);
    }

    this.updateHUD();
    this.openModal('modal-day-summary');
    this.audio.register();
  }

  startNextDay() {
    this.closeModal('modal-day-summary');
    this.day += 1;
    this.dayStarted = false;
    this.dayEnded = false;
    this.line = [];
    this.current = null;
    this.stats = this.freshStats(this.getCustomersPerDay());
    this.resetWorkbench();
    this.renderAll();
    this.showMissionBriefing();
  }

  // --------------------------------------------------------------------------
  // Nhập hàng & mở kệ
  // --------------------------------------------------------------------------
  openRestockModal() {
    this.audio.pop();
    this.restockQty = {};
    this.learn('进货');
    this.renderRestock();
    this.openModal('modal-restock');
  }

  restockTotal() {
    return this.shelves.reduce((s, it) => s + cents(it.cost) * (this.restockQty[it.id] || 0), 0) / 100;
  }

  changeRestock(id, delta) {
    const it = this.shelves.find(s => s.id === id);
    if (!it) return;
    const room = it.maxStock - it.currentStock;
    const cur = this.restockQty[id] || 0;
    const next = Math.max(0, Math.min(room, cur + delta));
    if (delta > 0 && this.restockTotal() + it.cost > this.money + 1e-9) {
      this.audio.error();
      this.showToast('🪙', 'Không đủ vốn để nhập thêm!', 'warn');
      return;
    }
    this.restockQty[id] = next;
    this.renderRestock();
  }

  autofillRestock() {
    let budget = cents(this.money);
    this.restockQty = {};
    // ưu tiên món còn ít hàng
    [...this.shelves].filter(s => s.unlocked).sort((a, b) => a.currentStock - b.currentStock).forEach(it => {
      const room = it.maxStock - it.currentStock;
      const afford = Math.floor(budget / cents(it.cost));
      const q = Math.max(0, Math.min(room, afford));
      this.restockQty[it.id] = q;
      budget -= q * cents(it.cost);
    });
    this.audio.pop();
    this.renderRestock();
  }

  confirmRestock() {
    const total = this.restockTotal();
    if (total > this.money + 1e-9) { this.audio.error(); return; }
    let units = 0;
    this.shelves.forEach(it => {
      const q = this.restockQty[it.id] || 0;
      if (q > 0) { it.currentStock += q; units += q; }
    });
    this.money = Math.round((this.money - total) * 100) / 100;
    this.stats.cost = Math.round((this.stats.cost + total) * 100) / 100;
    this.restockQty = {};
    this.closeModal('modal-restock');
    this.lastTickAt = performance.now();
    if (units > 0) {
      this.audio.register();
      this.showToast('📦', `Đã nhập ${units} món lên kệ (−${fmt(total)} ¥).`);
    }
    this.renderAll();
    // Đang chờ ở màn nhiệm vụ → cập nhật cảnh báo hết hàng
    if (this.$('modal-day-mission').style.display === 'flex') this.showMissionBriefing();
  }

  openUnlockModal() {
    this.audio.pop();
    const list = this.$('unlock-shelves-list');
    if (!list) return;
    const locked = this.shelves.filter(s => !s.unlocked);
    if (!locked.length) {
      list.innerHTML = '<div class="ul-done">👑 Đã mở khóa toàn bộ kệ hàng!</div>';
    } else {
      list.innerHTML = locked.map(it => {
        const ok = this.money >= it.unlockCost;
        return `<div class="ul-row">
          <span class="em">${it.emoji}</span>
          <div><span class="zh">${it.nameChn}</span> <b>${escapeHtml(it.pinyin)}</b><small>${escapeHtml(it.nameVi)} · bán ${fmt(it.price)} ¥ / ${it.quantifier} (${it.quantifierVi}) · lãi ${fmt(it.price - it.cost)} ¥</small></div>
          <button type="button" class="g-btn-primary" data-unlock="${it.id}" ${ok ? '' : 'disabled'}>${ok ? `Mở khóa · ${fmt(it.unlockCost)} ¥` : `Cần ${fmt(it.unlockCost)} ¥`}</button>
        </div>`;
      }).join('');
      list.querySelectorAll('[data-unlock]').forEach(btn => btn.addEventListener('click', () => this.unlockShelf(btn.dataset.unlock)));
    }
    this.openModal('modal-unlock-shelf');
  }

  unlockShelf(id) {
    const it = this.shelves.find(s => s.id === id);
    if (!it || it.unlocked || this.money < it.unlockCost) return;
    this.money = Math.round((this.money - it.unlockCost) * 100) / 100;
    it.unlocked = true;
    it.currentStock = 4;
    this.learn(it.nameChn);
    this.audio.register();
    this.closeModal('modal-unlock-shelf');
    this.lastTickAt = performance.now();
    this.showToast('🎉', `Đã mở kệ mới: ${it.nameChn} (${it.nameVi})! Khách sẽ bắt đầu hỏi mua món này.`);
    this.renderAll();
  }

  // --------------------------------------------------------------------------
  // Từ vựng
  // --------------------------------------------------------------------------
  openVocabModal() {
    document.querySelectorAll('.vocab-tab').forEach((b, i) => b.classList.toggle('active', i === 0));
    this.renderVocab('snacks');
    this.openModal('modal-vocab');
  }

  renderVocab(cat) {
    const grid = this.$('vocab-items-grid');
    if (!grid) return;
    const list = VOCAB_DATABASE[cat] || [];
    grid.innerHTML = list.map((v, i) => `
      <div class="vc ${this.learnedVocab.has(v.chn) ? 'learned' : ''}">
        <span class="zh">${v.chn}</span>
        <div class="pin">${escapeHtml(v.pin)}</div>
        <div class="vi">${escapeHtml(v.vi)}</div>
        <button type="button" data-say="${i}" title="Nghe phát âm"><i class="fa-solid fa-volume-high"></i></button>
      </div>`).join('');
    grid.querySelectorAll('[data-say]').forEach(btn => btn.addEventListener('click', () => this.audio.speak(list[+btn.dataset.say].chn)));
  }

  learnedCount() {
    let n = 0;
    Object.values(VOCAB_DATABASE).forEach(l => l.forEach(v => { if (this.learnedVocab.has(v.chn)) n += 1; }));
    return n;
  }

  // --------------------------------------------------------------------------
  // VẼ GIAO DIỆN
  // --------------------------------------------------------------------------
  renderAll() {
    this.updateHUD();
    this.renderRail();
    this.renderCounter();
    this.renderShelves();
    this.renderBasket();
    this.renderOrderChecklist();
    this.renderScan();
    this.renderChange();
    this.renderChalkboard();
  }

  updateHUD() {
    this.setText('hud-money-val', `${fmt(this.money)} ¥`);
    this.setText('hud-day-val', `第${this.day}天`);
    this.setText('hud-vocab-val', `${this.learnedCount()}/${VOCAB_TOTAL}`);
    this.setText('hud-guest-val', `${this.stats.served + this.stats.lost} / ${this.stats.total}`);
    this.setText('stats-rev-val', `${fmt(this.stats.revenue)} ¥`);
    this.setText('stats-cust-val', String(this.stats.served));
    this.setText('stats-lost-val', String(this.stats.lost));
    this.renderHUDGoal();
  }

  renderHUDGoal() {
    const target = this.mission ? this.mission.target : 0;
    const rev = this.stats.revenue;
    this.setText('hud-goal-val', `${fmt(rev)} / ${target} ¥`);
    const fill = this.$('hud-goal-fill');
    if (fill) fill.style.width = `${target ? Math.min(100, (rev / target) * 100) : 0}%`;
    const g = this.$('hud-goal');
    if (g) g.classList.toggle('reached', target > 0 && rev >= target);
  }

  renderRail() {
    const box = this.$('rail-queue');
    if (!box) return;
    const people = [];
    if (this.current) people.push({ c: this.current, serving: true });
    this.line.forEach(c => people.push({ c, serving: false }));
    if (!people.length) {
      box.innerHTML = `<span class="q-empty">${!this.dayStarted ? 'Tiệm chưa mở cửa' : this.stats.spawned >= this.stats.total ? 'Hết khách hôm nay' : 'Chưa có ai xếp hàng…'}</span>`;
    } else {
      box.innerHTML = people.map(({ c, serving }) => `
        <span class="q-chip ${serving ? 'serving' : ''}" data-cid="${c.id}">
          <img src="${ASSET(c.profile.img)}" alt="">
          <span class="zh">${c.profile.nameChn}</span>
          ${serving && c.takenAt ? '' : '<span class="mini-pat"><i></i></span>'}
        </span>`).join('');
    }
    const s = this.stats;
    this.setText('rail-info', this.dayStarted ? `Đã đến ${s.spawned}/${s.total} · Đang chờ ${this.line.length}` : '');
    this.updatePatienceUI();
    this.updateHUD();
  }

  updatePatienceUI() {
    const level = (u) => (u >= 0.75 ? 'low' : u >= 0.45 ? 'mid' : '');
    document.querySelectorAll('.q-chip').forEach(chip => {
      const id = +chip.dataset.cid;
      const c = (this.current && this.current.id === id) ? this.current : this.line.find(x => x.id === id);
      const bar = chip.querySelector('.mini-pat');
      if (!c || !bar) return;
      const u = this.relaxedMode ? 0 : this.patienceUsed(c);
      bar.className = `mini-pat ${level(u)}`;
      bar.firstElementChild.style.width = `${Math.round((1 - u) * 100)}%`;
    });
    const p = this.$('counter-patience');
    if (p) {
      const c = this.current;
      if (!c || c.takenAt || this.relaxedMode) {
        p.classList.add('off');
      } else {
        const u = this.patienceUsed(c);
        p.className = `patience ${level(u)}`;
        p.querySelector('.patience-fill').style.width = `${Math.round((1 - u) * 100)}%`;
        p.querySelector('.patience-mood').textContent = u >= 0.75 ? '😠' : u >= 0.45 ? '😐' : '😊';
      }
    }
  }

  renderCounter(entering = false) {
    const door = this.$('shop-door');
    const c = this.current;
    const bubble = this.$('speech-bubble');
    const tag = this.$('customer-tag');
    const nextBtn = this.$('btn-goto-shelves-from-order');
    const hint = this.$('order-footer-hint');
    const reg = this.$('reg-screen');
    if (!door) return;

    if (!c) {
      door.classList.add('empty');
      bubble?.classList.add('hidden');
      tag?.classList.add('hidden');
      if (nextBtn) nextBtn.style.display = 'none';
      const s = this.stats;
      let text = 'Đang chờ khách...';
      if (!this.dayStarted) text = 'Tiệm chưa mở cửa';
      else if (s.spawned >= s.total) text = 'Đã hết khách hôm nay';
      else if (s.spawned > 0) text = `Khách tiếp theo sắp tới (${s.spawned}/${s.total})`;
      this.setText('door-empty-text', text);
      if (hint) hint.innerHTML = this.dayStarted ? '💡 Chờ khách bước vào tiệm… Nhân lúc rảnh hãy <b>nhập hàng</b> hoặc <b>mở kệ mới</b>.' : '💡 Bấm <b>Mở cửa bán hàng</b> để bắt đầu ngày mới.';
      if (reg) reg.textContent = '0.00';
      return;
    }

    door.classList.remove('empty');
    const wrap = this.$('door-customer');
    const img = this.$('customer-img');
    if (img && !img.src.endsWith(c.profile.img)) img.src = ASSET(c.profile.img);
    if (wrap) {
      wrap.classList.remove('leave', 'angry');
      if (entering) { wrap.classList.remove('enter'); void wrap.offsetWidth; wrap.classList.add('enter'); }
    }
    tag?.classList.remove('hidden');
    this.setText('customer-name-chn', c.profile.nameChn);
    this.setText('customer-name-vi', c.profile.nameVi);

    if (!c.order) {
      bubble?.classList.remove('hidden', 'taken');
      const chn = this.$('order-chn-text');
      if (chn) chn.textContent = '老板，货架上怎么都空了？';
      this.setText('order-pin-text', 'Lǎobǎn, huòjià shàng zěnme dōu kōng le?');
      this.setText('order-vi-text', '(Ông chủ ơi, sao kệ hàng trống trơn vậy?)');
      const btn = this.$('btn-take-order-action');
      if (btn) btn.style.display = 'none';
      return;
    }
    const btn = this.$('btn-take-order-action');
    if (btn) btn.style.display = '';
    bubble?.classList.remove('hidden');
    bubble?.classList.toggle('taken', !!c.takenAt);
    this.renderSpeech();
    if (nextBtn) nextBtn.style.display = c.takenAt ? 'inline-flex' : 'none';
    if (hint) hint.innerHTML = c.takenAt
      ? `✅ Đã nhận đơn <b>#G-${c.id}</b>. Sang <b>货架区</b> nhặt hàng → <b>扫码台</b> quét mã → <b>找零台</b> thối tiền.`
      : '💡 Nghe khách gọi hàng rồi bấm <b>Nhận đơn</b>. Để khách chờ lâu sẽ bị trừ điểm và có thể bỏ về!';
    if (reg) reg.textContent = c.takenAt ? fmt(c.order.due) : '0.00';
    this.updatePatienceUI();
  }

  renderSpeech() {
    const c = this.current;
    if (!c || !c.order) return;
    const p = this.orderPhrase(c.order);
    const chn = this.$('order-chn-text');
    if (chn) chn.innerHTML = p.zhHtml;
    const pin = this.$('order-pin-text');
    if (pin) { pin.textContent = p.pin; pin.style.display = this.showPinyin ? '' : 'none'; }
    const vi = this.$('order-vi-text');
    if (vi) { vi.textContent = p.vi; vi.style.display = this.showVietnamese ? '' : 'none'; }
  }

  renderChalkboard() {
    const ul = this.$('chalk-specials');
    if (!ul) return;
    ul.innerHTML = this.shelves.filter(s => s.unlocked).slice(-4).reverse()
      .map(s => `<li><span>${s.emoji} <span class="zh">${s.nameChn}</span></span><b>${fmt(s.price)}¥</b></li>`).join('');
  }

  renderShelves() {
    const rack = this.$('shelves-display-rack');
    if (!rack) return;
    const c = this.current;
    const wanted = new Set(c && c.takenAt && c.order ? c.order.items.map(x => x.item.id) : []);
    const slots = [];
    for (let i = 0; i < SHELF_SLOTS; i++) slots.push(this.shelves[i] || null);
    const rows = [0, 1, 2].map(r => slots.slice(r * 4, r * 4 + 4));
    rack.innerHTML = rows.map(row => `<div class="shelf-row">${row.map(it => {
      if (!it) return '<div class="prod locked" style="visibility:hidden"></div>';
      if (!it.unlocked) return `<button type="button" class="prod locked" data-locked="${it.id}"><i class="fa-solid fa-lock"></i>${it.emoji} Mở khóa<br>${fmt(it.unlockCost)} ¥</button>`;
      const out = it.currentStock <= 0;
      const stackN = Math.max(1, Math.min(3, it.currentStock));
      return `<button type="button" class="prod ${out ? 'out' : ''} ${wanted.has(it.id) ? 'wanted' : ''}" data-pid="${it.id}" title="${escapeHtml(it.nameVi)}">
        <span class="prod-stock ${it.currentStock <= 2 ? 'low' : ''}">${out ? 'Hết hàng' : `Còn ${it.currentStock}`}</span>
        <span class="prod-tag">${fmt(it.price)}¥</span>
        <span class="prod-stack">${out ? '<span style="opacity:.35">📦</span>' : `<span>${it.emoji}</span>`.repeat(stackN)}</span>
        <span class="prod-name zh">${it.nameChn}</span>
        <span class="prod-pin">${escapeHtml(it.pinyin)}</span>
      </button>`;
    }).join('')}</div>`).join('');
    rack.querySelectorAll('[data-pid]').forEach(el => el.addEventListener('click', () => {
      const it = this.shelves.find(s => s.id === el.dataset.pid);
      if (it && it.currentStock > 0) this.pickItem(it, el);
      else if (it) { this.audio.error(); this.showToast('📦', `${it.nameChn} hết hàng rồi! Bấm "Nhập hàng".`, 'warn'); }
    }));
    rack.querySelectorAll('[data-locked]').forEach(el => el.addEventListener('click', () => this.openUnlockModal()));
  }

  renderOrderChecklist() {
    const list = this.$('oc-list');
    if (!list) return;
    const c = this.current;
    this.setText('oc-ticket-id', c ? `#G-${c.id}` : '');
    if (!c || !c.takenAt || !c.order) {
      list.innerHTML = '<div class="oc-none">Chưa có đơn. Về 点单台 nhận đơn của khách.</div>';
    } else {
      list.innerHTML = c.order.items.map(x => {
        const b = this.basket.find(y => y.item.id === x.item.id);
        const have = b ? b.qty : 0;
        return `<div class="oc-item ${have === x.qty ? 'done' : ''}">
          <span class="em">${x.item.emoji}</span>
          <span><span class="zh">${NUM_CHN[x.qty] || x.qty}${x.item.quantifier}${x.item.nameChn}</span></span>
          <span class="cnt">${have}/${x.qty}</span>
        </div>`;
      }).join('');
    }
    const next = this.$('btn-goto-scan');
    if (next) next.disabled = !this.isBasketComplete();
    const hint = this.$('shelves-hint');
    if (hint) hint.innerHTML = this.isBasketComplete()
      ? '✨ Đủ hàng rồi! Bấm <b>Sang quét mã</b>.'
      : '💡 Chạm vào món trên kệ để bỏ vào giỏ. Các món khách cần được <b>tô vàng</b>. Nhặt nhầm bị trừ điểm!';
  }

  renderBasket() {
    const box = this.$('basket-items-scroll');
    if (!box) return;
    if (!this.basket.length) {
      box.innerHTML = '<div class="basket-empty"><span>🧺</span>Giỏ còn trống</div>';
    } else {
      box.innerHTML = this.basket.map(b => `
        <div class="basket-row">
          <span class="em">${b.item.emoji}</span>
          <span class="zh">${b.item.nameChn}</span>
          <span class="qty">${fmt(b.item.price)}¥ × ${b.qty}</span>
          <button type="button" data-remove="${b.item.id}" title="Trả 1 món về kệ"><i class="fa-solid fa-minus"></i></button>
        </div>`).join('');
      box.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', () => this.removeFromBasket(btn.dataset.remove)));
    }
    const sub = this.basket.reduce((s, b) => s + cents(b.item.price) * b.qty, 0) / 100;
    this.setText('basket-subtotal-val', `${fmt(sub)} ¥`);
  }

  renderScan(flashIdx = -1) {
    const track = this.$('conveyor-items-track');
    if (!track) return;
    const ready = this.isBasketComplete();
    if (!ready || !this.scanItems.length) {
      track.innerHTML = `<div class="basket-empty" style="color:#e2e8f0">${ready ? '' : '🧺 Chưa có hàng trên băng chuyền.<br>Nhặt đủ hàng ở 货架区 trước.'}</div>`;
      if (ready) this.prepareScan();
    } else {
      track.innerHTML = this.scanItems.map((si, i) => `
        <button type="button" class="belt-item ${si.scanned ? 'scanned' : ''} ${i === flashIdx ? 'beep' : ''}" data-scan="${i}">
          <span class="em">${si.item.emoji}</span>
          <span class="zh">${si.item.nameChn}</span>
          <span class="pr">${fmt(si.item.price)}¥</span>
          <span class="barcode"></span>
        </button>`).join('');
      track.querySelectorAll('[data-scan]').forEach(el => el.addEventListener('click', () => this.scanItem(+el.dataset.scan)));
    }
    const scanned = this.scanItems.filter(x => x.scanned);
    const total = scanned.reduce((s, x) => s + cents(x.item.price), 0) / 100;
    this.setText('scan-scanned-count', `${scanned.length} / ${this.scanItems.length}`);
    this.setText('scan-total-due', `${fmt(total)} ¥`);
    this.setText('receipt-total-num', `${fmt(total)} ¥`);
    const lines = this.$('receipt-items-lines');
    if (lines) lines.innerHTML = scanned.map(x => `<div><span class="zh">${x.item.nameChn}</span><b>${fmt(x.item.price)}</b></div>`).join('');
    const all = this.scanItems.length > 0 && scanned.length === this.scanItems.length;
    const btn = this.$('btn-trigger-scanner');
    if (btn) btn.disabled = !this.scanItems.length || all;
    const next = this.$('btn-goto-change');
    if (next) next.disabled = !all;
    document.querySelector('.conveyor-belt')?.classList.toggle('paused', !this.scanItems.length || all);
    const hint = this.$('scan-hint');
    if (hint) hint.innerHTML = all ? '🧾 Đã in hóa đơn! Bấm <b>Sang thu tiền</b>.' : '💡 Chạm từng món trên băng chuyền (hoặc nút quét) để quét mã.';
  }

  renderChange() {
    const c = this.current;
    const ready = this.isReadyToCharge();
    this.setText('change-due-amount', ready ? `${fmt(c.order.due)} ¥` : '—');
    this.setText('change-paid-amount', ready ? `${fmt(c.order.paid)} ¥` : '—');
    this.setText('change-needed-amount', ready && c.hintUsed ? `${fmt(c.order.change)} ¥` : '? ¥');
    const hintBtn = this.$('btn-change-hint');
    if (hintBtn) {
      hintBtn.classList.toggle('used', !!(c && c.hintUsed));
      hintBtn.innerHTML = c && c.hintUsed ? '<i class="fa-solid fa-lightbulb"></i> Đã xem gợi ý' : '<i class="fa-solid fa-lightbulb"></i> Gợi ý (−20 điểm)';
    }
    const bills = this.$('customer-bill-render');
    if (bills) {
      if (!ready) {
        bills.innerHTML = '<div class="tray-empty" style="color:#fff4dd">Khách sẽ đưa tiền khi bạn quét xong hàng.</div>';
      } else {
        bills.innerHTML = this.splitIntoNotes(c.order.paid).map(v => this.noteHtml(v, true)).join('');
      }
    }
    this.renderTray();
  }

  splitIntoNotes(amount) {
    const out = [];
    let left = cents(amount);
    [10000, 5000, 2000, 1000, 500, 100, 50, 10].forEach(d => { while (left >= d) { out.push(d / 100); left -= d; } });
    return out;
  }

  noteHtml(v, big = false) {
    if (v >= 1) {
      const cls = { 100: 'n100', 50: 'n50', 20: 'n20', 10: 'n10', 5: 'n5', 1: 'n1' }[v] || 'n1';
      return `<span class="rmb note ${cls}" style="width:${big ? 120 : 90}px;height:${big ? 66 : 50}px;cursor:default"><b>${v}</b><span class="zh">元</span></span>`;
    }
    return `<span class="rmb coin ${v === 0.5 ? 'c5' : 'c1'}" style="width:56px;height:56px;cursor:default"><b>${v === 0.5 ? 5 : 1}</b><span class="zh">角</span></span>`;
  }

  renderTray() {
    const box = this.$('tray-dropped-tokens');
    if (!box) return;
    if (!this.changeTray.length) {
      box.innerHTML = `<div class="tray-empty">${this.isReadyToCharge() ? 'Chạm tờ tiền/đồng xu trong ngăn kéo để lấy tiền thối.' : 'Hoàn tất quét mã trước khi thối tiền.'}</div>`;
    } else {
      box.innerHTML = this.changeTray.map((v, i) => {
        if (v >= 1) {
          const cls = { 20: 'n20', 10: 'n10', 5: 'n5', 1: 'n1' }[v] || 'n1';
          return `<button type="button" class="token ${cls}" data-tray="${i}" title="Bỏ lại ngăn kéo">${v}<span class="zh">元</span></button>`;
        }
        return `<button type="button" class="token coin ${v === 0.5 ? 'c5' : 'c1'}" data-tray="${i}" title="Bỏ lại ngăn kéo">${v === 0.5 ? 5 : 1}<span class="zh">角</span></button>`;
      }).join('');
      box.querySelectorAll('[data-tray]').forEach(el => el.addEventListener('click', () => this.removeFromTray(+el.dataset.tray)));
    }
    const sum = this.changeTray.reduce((s, v) => s + cents(v), 0) / 100;
    const sumEl = this.$('tray-total-picked');
    if (sumEl) {
      sumEl.textContent = `Đã lấy: ${fmt(sum)} ¥`;
      const c = this.current;
      sumEl.classList.toggle('match', !!(c && c.hintUsed && this.isReadyToCharge() && cents(sum) === cents(c.order.change)));
    }
    const btn = this.$('btn-confirm-and-deliver');
    if (btn) btn.disabled = !this.isReadyToCharge();
  }

  renderRestock() {
    const list = this.$('stock-table-body');
    if (!list) return;
    list.innerHTML = this.shelves.filter(s => s.unlocked).map(it => {
      const q = this.restockQty[it.id] || 0;
      const room = it.maxStock - it.currentStock;
      return `<div class="rs-row">
        <div class="rs-name"><span class="em">${it.emoji}</span><div style="min-width:0"><span class="zh">${it.nameChn}</span><small>${escapeHtml(it.pinyin)} · ${escapeHtml(it.nameVi)}</small></div></div>
        <div>Tồn ${it.currentStock}/${it.maxStock}<div class="rs-stock-bar"><i style="width:${Math.round((it.currentStock / it.maxStock) * 100)}%"></i></div></div>
        <div class="rs-cost">Nhập ${fmt(it.cost)} ¥</div>
        <div class="rs-qty"><button type="button" data-rs="${it.id}" data-d="-1" ${q <= 0 ? 'disabled' : ''}>−</button><b>${q}</b><button type="button" data-rs="${it.id}" data-d="1" ${q >= room ? 'disabled' : ''}>+</button></div>
        <div class="rs-total">${fmt(q * it.cost)} ¥</div>
      </div>`;
    }).join('');
    list.querySelectorAll('[data-rs]').forEach(btn => btn.addEventListener('click', () => this.changeRestock(btn.dataset.rs, +btn.dataset.d)));
    const total = this.restockTotal();
    this.setText('modal-stock-current-bal', `${fmt(this.money)} ¥`);
    this.setText('modal-stock-total-cost', `${fmt(total)} ¥`);
    this.setText('modal-stock-remaining-bal', `${fmt(this.money - total)} ¥`);
    const confirm = this.$('btn-confirm-restock-open');
    if (confirm) confirm.disabled = total > this.money + 1e-9;
  }

  // --------------------------------------------------------------------------
  // Tài khoản & bảng xếp hạng
  // --------------------------------------------------------------------------
  async initCloud() {
    if (!GameCloud.token()) { this.cloud.checked = true; this.renderAccountChip(); return; }
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
    if (!data || !data.loggedIn) { this.renderAccountChip(); return; }
    const lu = GameCloud.localUser();
    this.cloud.loggedIn = true;
    this.cloud.name = (data.user && data.user.name) || (lu && lu.name) || 'Bạn';
    this.cloud.picture = (data.user && data.user.picture) || (lu && lu.picture) || '';
    this.cloud.best = data.best || null;
    this.cloud.history = Array.isArray(data.history) ? data.history : [];
    this.renderAccountChip();
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
      this.setText('title-account-status', c.best ? `🏆 Kỷ lục ${fmt(c.best.earnings)} ¥` : '☁️ Chưa có kỷ lục · Chơi để lên bảng!');
      if (avatar) avatar.innerHTML = c.picture ? `<img src="${escapeHtml(c.picture)}" alt="" referrerpolicy="no-referrer">` : '<i class="fa-solid fa-user"></i>';
    } else {
      chip.classList.add('guest');
      chip.setAttribute('href', 'index.html');
      this.setText('title-account-name', c.offline && c.name ? c.name : 'Khách');
      this.setText('title-account-status', c.offline ? '⚠️ Mất kết nối máy chủ' : 'Đăng nhập để lưu thành tích');
      if (avatar) avatar.innerHTML = '<i class="fa-solid fa-user"></i>';
    }
  }

  async pushDayResult(dayResult) {
    try {
      const r = await GameCloud.sendDayResult(dayResult);
      if (r && r.best) this.cloud.best = r.best;
      if (r && Array.isArray(r.history)) this.cloud.history = r.history;
      if (r && r.newBest) this.showToast('🏆', `Kỷ lục mới: ${fmt(r.best.earnings)} ¥ — đã cập nhật bảng xếp hạng!`);
      this.renderAccountChip();
    } catch (e) {
      this.showToast('⚠️', 'Chưa gửi được kết quả lên bảng xếp hạng (mất kết nối).', 'warn');
    }
  }

  openRankModal(tab = this.rankTab || 'global') {
    this.openModal('modal-rank');
    this.switchRankTab(tab);
  }

  switchRankTab(tab) {
    this.rankTab = tab === 'mine' ? 'mine' : 'global';
    document.querySelectorAll('.rank-tab').forEach(b => b.classList.toggle('active', b.dataset.rankTab === this.rankTab));
    if (this.rankTab === 'mine') this.renderMyRank(); else this.renderGlobalRank();
  }

  async renderGlobalRank() {
    const list = this.$('rank-list');
    const summary = this.$('rank-summary');
    if (!list || !summary) return;
    this.setText('rank-note', 'Mỗi người chỉ tính thành tích cao nhất · Xếp theo doanh thu 1 ngày → số sao → điểm trung bình');
    summary.innerHTML = '';
    list.innerHTML = '<div class="rank-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải bảng xếp hạng...</div>';
    const req = (this.rankReq = (this.rankReq || 0) + 1);
    let data;
    try {
      data = await GameCloud.getLeaderboard();
    } catch (e) {
      if (req !== this.rankReq || this.rankTab !== 'global') return;
      list.innerHTML = '<div class="rank-empty">📡 Không kết nối được máy chủ.<br>Kiểm tra mạng rồi thử lại nhé!<br><br><button type="button" class="g-btn-chip" id="btn-rank-retry">🔄 Thử lại</button></div>';
      this.$('btn-rank-retry')?.addEventListener('click', () => this.renderGlobalRank());
      return;
    }
    if (req !== this.rankReq || this.rankTab !== 'global') return;
    const me = data.me;
    summary.innerHTML = `
      <div class="rs-item"><span>👥</span><strong>${data.totalPlayers || 0}</strong><small>Chủ tiệm</small></div>
      <div class="rs-item"><span>🏅</span><strong>${me ? `#${me.rank}` : '—'}</strong><small>Hạng của bạn</small></div>
      <div class="rs-item"><span>🏆</span><strong>${me ? `${fmt(me.earnings)} ¥` : '—'}</strong><small>Kỷ lục của bạn</small></div>
      <div class="rs-item"><span>📅</span><strong>${me ? me.daysPlayed || 0 : '—'}</strong><small>Ngày đã bán</small></div>`;
    const cta = !data.loggedIn ? '<div class="rank-cta"><span>🔐 Bạn đang chơi với tư cách khách — đăng nhập để ghi tên lên bảng!</span><a href="index.html">Đăng nhập</a></div>' : '';
    const top = Array.isArray(data.top) ? data.top : [];
    if (!top.length) {
      list.innerHTML = cta + '<div class="rank-empty">🏪 Chưa có ai trên bảng xếp hạng.<br>Hoàn thành 1 ngày bán hàng để là người đầu tiên!</div>';
      return;
    }
    const medals = ['🥇', '🥈', '🥉'];
    const row = (r) => `
      <div class="rank-row ${r.rank <= 3 ? 'top' : ''} ${r.isMe ? 'me' : ''}">
        <span class="rr-pos">${medals[r.rank - 1] || r.rank}</span>
        <span class="rr-player">
          ${r.picture ? `<img class="rr-avatar" src="${escapeHtml(r.picture)}" alt="" referrerpolicy="no-referrer" loading="lazy">` : '<span class="rr-avatar"><i class="fa-solid fa-user"></i></span>'}
          <span class="rr-name"><b>${escapeHtml(r.name)}${r.isMe ? '<span class="rr-me">Bạn</span>' : ''}</b><small><span class="zh">第${Number(r.day) || 1}天</span>${r.achievedAt ? ` · ${new Date(r.achievedAt).toLocaleDateString('vi-VN')}` : ''}</small></span>
        </span>
        <span class="rr-earn">${fmt(r.earnings)} ¥</span>
        <span>🧺 ${r.served}/${r.total}${r.lost ? ` · 😠 ${r.lost}` : ''}</span>
        <span class="rr-avg">${r.served > 0 ? `${r.avg}%` : '—'}</span>
        <span class="rr-stars">${'⭐'.repeat(r.stars || 0)}${'☆'.repeat(3 - (r.stars || 0))}</span>
      </div>`;
    const meOutside = me && !top.some(r => r.isMe);
    list.innerHTML = cta + top.map(row).join('') + (meOutside ? `<div class="rank-gap">⋮</div>${row(me)}` : '');
  }

  renderMyRank() {
    const list = this.$('rank-list');
    const summary = this.$('rank-summary');
    const fmtDate = (iso) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN'); };
    const src = this.cloud.loggedIn ? this.cloud.history.map(h => ({ ...h, date: fmtDate(h.playedAt) })) : this.records;
    this.setText('rank-note', this.cloud.loggedIn
      ? '☁️ Các ngày bán đã lưu trong tài khoản · Xếp theo doanh thu trong ngày'
      : 'Chỉ tính ván đang chơi (tải lại trang là ván mới) · Đăng nhập để lưu thành tích');
    const recs = [...src].filter(r => r && Number.isFinite(Number(r.earnings))).sort((a, b) => b.earnings - a.earnings);
    if (summary) {
      const totalEarn = recs.reduce((s, r) => s + Number(r.earnings), 0);
      const served = recs.reduce((s, r) => s + (r.served || 0), 0);
      const stars = recs.reduce((s, r) => s + (r.stars || 0), 0);
      summary.innerHTML = `
        <div class="rs-item"><span>📅</span><strong>${recs.length}</strong><small>Ngày đã bán</small></div>
        <div class="rs-item"><span>🧺</span><strong>${served}</strong><small>Khách đã phục vụ</small></div>
        <div class="rs-item"><span>🪙</span><strong>${fmt(totalEarn)} ¥</strong><small>Tổng doanh thu</small></div>
        <div class="rs-item"><span>⭐</span><strong>${stars}</strong><small>Tổng sao</small></div>`;
    }
    if (!list) return;
    if (!recs.length) {
      list.innerHTML = '<div class="rank-empty">🏪 Chưa có ngày bán nào.<br>Hoàn thành ngày đầu tiên để ghi kỷ lục!</div>';
      return;
    }
    const medals = ['🥇', '🥈', '🥉'];
    list.innerHTML = recs.slice(0, 15).map((r, i) => `
      <div class="rank-row ${i < 3 ? 'top' : ''}">
        <span class="rr-pos">${medals[i] || i + 1}</span>
        <span class="rr-name"><b class="zh">第${r.day}天</b><small>${escapeHtml(r.date || '')}</small></span>
        <span class="rr-earn">${fmt(r.earnings)} ¥</span>
        <span>🧺 ${r.served}/${r.total}${r.lost ? ` · 😠 ${r.lost}` : ''}</span>
        <span class="rr-avg">${r.served > 0 ? `${r.avg}%` : '—'}</span>
        <span class="rr-stars">${'⭐'.repeat(r.stars || 0)}${'☆'.repeat(3 - (r.stars || 0))}</span>
      </div>`).join('');
  }
}

// Khởi tạo (module: DOM đã sẵn sàng; script thường ở cuối body cũng vậy)
(function bootGrocery() {
  const start = () => { if (!window.groceryGame) window.groceryGame = new GroceryGame(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
