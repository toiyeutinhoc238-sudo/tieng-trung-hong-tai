/**
 * Tiệm Trà Sữa Của Tôi (我的奶茶店 - Papa's Boba Cafe)
 * Core Game Engine: Papa's Freezeria Station-Based Simulation System
 */

const customerGirlImg = './assets/boba_customer_girl.jpg';
const customerBoyImg = './assets/boba_customer_boy.jpg';
const customerLinJieImg = './assets/boba_customer_linjie.jpg';
const customerXiaoTongImg = './assets/boba_customer_xiaotong.jpg';
const customerWangShuImg = './assets/boba_customer_wangshu.jpg';
const customerABaoImg = './assets/boba_customer_abao.jpg';
const customerGrandmaImg = './assets/boba_customer_grandma.jpg';

// ============================================================================
// 1. AUDIO SYNTHESIZER (WEB AUDIO API & TTS)
// ============================================================================
class PapaBobaAudio {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.voiceEnabled = true;
    this.cachedVoices = [];

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        try { this.cachedVoices = window.speechSynthesis.getVoices(); } catch (e) {}
      };
      try { this.cachedVoices = window.speechSynthesis.getVoices(); } catch (e) {}
    }
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPop() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playPour() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(340, now + 0.25);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playPlop() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  playCashRegister() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.08;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.36);
    });
  }

  playShakerSound() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.15);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.16);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  playTrash() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Metallic trash can clank + dump thud
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.exponentialRampToValueAtTime(40, now + 0.22);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.23);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.24);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(320, now + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(70, now + 0.28);
    gain2.gain.setValueAtTime(0.3, now + 0.04);
    gain2.gain.linearRampToValueAtTime(0.01, now + 0.29);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.3);
  }

  playDrain() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.linearRampToValueAtTime(160, now + 0.22);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.23);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  playUndo() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(560, now);
    osc.frequency.linearRampToValueAtTime(280, now + 0.12);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  speak(text) {
    if (!this.voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'zh-CN';
      utter.rate = 0.9;
      utter.pitch = 1.05;

      if (!this.cachedVoices || this.cachedVoices.length === 0) {
        this.cachedVoices = window.speechSynthesis.getVoices();
      }
      const zhVoice = this.cachedVoices.find(v => v.lang.includes('zh') || v.lang.includes('cmn'));
      if (zhVoice) utter.voice = zhVoice;

      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('TTS warning:', e);
    }
  }
}

// ============================================================================
// 2. VOCABULARY & GAME CONSTANTS
// ============================================================================
const BOBA_VOCAB = {
  teas: [
    { id: 'milktea', hanzi: '奶茶', pinyin: 'nǎichá', vi: 'Trà sữa', color: '#df9b58' },
    { id: 'blacktea', hanzi: '红茶', pinyin: 'hóngchá', vi: 'Hồng trà', color: '#853713' },
    { id: 'greentea', hanzi: '绿茶', pinyin: 'lǜchá', vi: 'Trà xanh', color: '#84cc16' },
    { id: 'taro', hanzi: '芋泥奶茶', pinyin: 'yùní nǎichá', vi: 'Trà khoai môn', color: '#b58bc4' },
    { id: 'milk', hanzi: '鲜奶', pinyin: 'xiānnǎi', vi: 'Sữa tươi', color: '#f8fafc' }
  ],
  sugars: [
    { id: 'extra_sugar', hanzi: '多糖', pinyin: 'duō táng', vi: 'Nhiều đường (100%)', percent: 100 },
    { id: 'less_sugar', hanzi: '少糖', pinyin: 'shǎo táng', vi: 'Ít đường (70%)', percent: 70 },
    { id: 'half_sugar', hanzi: '半糖', pinyin: 'bàn táng', vi: 'Nửa đường (50%)', percent: 50 },
    { id: 'micro_sugar', hanzi: '微糖', pinyin: 'wēi táng', vi: 'Hơi ngọt (30%)', percent: 30 },
    { id: 'no_sugar', hanzi: '无糖', pinyin: 'wú táng', vi: 'Không đường (0%)', percent: 0 }
  ],
  ices: [
    { id: 'extra_ice', hanzi: '多冰', pinyin: 'duō bīng', vi: 'Nhiều đá' },
    { id: 'regular_ice', hanzi: '正常冰', pinyin: 'zhèngcháng bīng', vi: 'Đá vừa' },
    { id: 'less_ice', hanzi: '少冰', pinyin: 'shǎo bīng', vi: 'Ít đá' },
    { id: 'no_ice', hanzi: '去冰', pinyin: 'qù bīng', vi: 'Không đá' }
  ],
  toppings: [
    { id: 'boba', hanzi: '珍珠', pinyin: 'zhēnzhū', vi: 'Trân châu', icon: '🧋' },
    { id: 'mango', hanzi: '芒果布丁', pinyin: 'mángguǒ bùdīng', vi: 'Pudding xoài', icon: '🥭' },
    { id: 'redbean', hanzi: '红豆', pinyin: 'hóngdòu', vi: 'Đậu đỏ', icon: '🫘' },
    { id: 'matcha', hanzi: '抹茶冻', pinyin: 'mǒchádòng', vi: 'Thạch matcha', icon: '🍵' },
    { id: 'coconut', hanzi: '椰果', pinyin: 'yēguǒ', vi: 'Thạch dừa', icon: '🥥' },
    { id: 'taroball', hanzi: '芋圆', pinyin: 'yùyuán', vi: 'Khoai dẻo', icon: '🍠' }
  ]
};

// Customer Roster (Đa dạng 7 nhân vật khách hàng anime 3D Chibi)
const PAPA_CUSTOMERS = [
  { id: 'xiaoyu', nameChn: '小雨', nameVi: 'Bé Mưa', role: 'Bé gái dễ thương', emoji: '👧', image: customerGirlImg },
  { id: 'xiaohao', nameChn: '小浩', nameVi: 'Tiểu Hạo', role: 'Học sinh năng động', emoji: '👦', image: customerBoyImg },
  { id: 'linjie', nameChn: '林姐', nameVi: 'Chị Lâm', role: 'Chị gái văn phòng thanh lịch', emoji: '👩‍💼', image: customerLinJieImg },
  { id: 'xiaotong', nameChn: '晓彤', nameVi: 'Hiểu Đồng', role: 'Nữ sinh tóc 2 bên sành điệu', emoji: '👩‍🎓', image: customerXiaoTongImg },
  { id: 'wangshu', nameChn: '王叔', nameVi: 'Chú Vương', role: 'Chú hàng xóm ấm áp', emoji: '👨', image: customerWangShuImg },
  { id: 'abao', nameChn: '阿宝', nameVi: 'Gấu A Bảo', role: 'Gấu trúc linh vật kawaii', emoji: '🐼', image: customerABaoImg },
  { id: 'grandma', nameChn: '李奶奶', nameVi: 'Bà Lý', role: 'Bà lão hiền từ phúc hậu', emoji: '👵', image: customerGrandmaImg }
];

// Tổng số từ vựng trong sổ tay (trà + đường + đá + topping)
const BOBA_TOTAL_WORDS = BOBA_VOCAB.teas.length + BOBA_VOCAB.sugars.length + BOBA_VOCAB.ices.length + BOBA_VOCAB.toppings.length;

// Các key localStorage thuộc riêng game này (chơi lại chỉ xóa những key này)
const BOBA_SAVE_KEYS = ['boba_coins', 'boba_level', 'boba_exp', 'boba_orders', 'boba_words', 'boba_day', 'boba_tickets', 'boba_relaxed', 'boba_records', 'boba_saved_at', 'boba_owner'];

// ============================================================================
// ĐỒNG BỘ VỚI HỆ THỐNG (tài khoản đăng nhập ở trang chủ → lưu tiến trình & xếp hạng)
// Dùng chung phiên đăng nhập của web: localStorage 'session_token' + 'user'
// ============================================================================
const BobaCloud = {
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
  headers() {
    const h = { 'Content-Type': 'application/json' };
    const t = this.token();
    if (t) { h['Authorization'] = `Bearer ${t}`; h['x-session-token'] = t; }
    return h;
  },
  async request(path, options = {}, timeoutMs = 8000) {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
    try {
      const res = await fetch(this.apiBase() + path, {
        credentials: 'include',
        cache: 'no-store',
        ...options,
        headers: { ...this.headers(), ...(options.headers || {}) },
        signal: ctrl ? ctrl.signal : undefined
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      if (timer) clearTimeout(timer);
    }
  },
  getProgress() { return this.request('/api/boba/progress'); },
  saveProgress(body, keepalive = false) {
    return this.request('/api/boba/progress', { method: 'POST', body: JSON.stringify(body), keepalive });
  },
  getLeaderboard() { return this.request('/api/boba/leaderboard?limit=50'); }
};

const escapeHtml = (str) => String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ============================================================================
// NHIỆM VỤ NGÀY (今日任务): mục tiêu doanh thu + giữ khách + chất lượng
// ============================================================================
const MISSION_RULES = {
  revenuePerGuest: 18,     // mục tiêu doanh thu = số khách × 18 ¥ (giá 1 ly 18¥ + tip tối đa 7.5¥)
  roundTo: 5,              // làm tròn mục tiêu lên bội số của 5
  maxLostRatio: 0.25,      // được phép mất tối đa 25% số khách (ít nhất 1)
  minAvgScore: 80,         // điểm trung bình tối thiểu
  bonusPerStar: 10,        // thưởng mỗi nhiệm vụ hoàn thành
  maxRecords: 30           // số kỷ lục ngày lưu lại
};

// ============================================================================
// PAPA'S QUEUE RULES (khách đến theo lịch + giới hạn thời gian chờ)
// ============================================================================
const QUEUE_RULES = {
  maxInShop: 4,            // tối đa số khách cùng lúc trong quán (xếp hàng + chờ món)
  lineMaxMs: 45000,        // chờ được GHI PHIẾU tối đa 45 giây
  drinkBaseMs: 150000,     // chờ NHẬN MÓN: 150 giây ở Lv.1 ...
  drinkPerLevelMs: 10000,  // ... mỗi level bớt 10 giây ...
  drinkMinMs: 80000,       // ... nhưng không dưới 80 giây
  arriveBaseMs: 35000,     // khoảng cách giữa 2 khách: 35 giây ở Lv.1 ...
  arrivePerLevelMs: 2500,  // ... mỗi level nhanh hơn 2.5 giây ...
  arriveMinMs: 18000,      // ... nhưng không dưới 18 giây
  arriveJitterMs: 6000,    // ± ngẫu nhiên cho tự nhiên
  perDayBase: 3,           // số khách mỗi ngày = 3 + level ...
  perDayMax: 8             // ... tối đa 8
};

// Ly trống mới
function freshCup() {
  return {
    tea: null,
    pourLevel: 0, // 0 to 100
    sugar: null,
    ice: null,
    isShaken: false,
    shakeScore: 0,
    toppings: [], // Array of toppings added (can add, remove, undo)
    hasLid: false,
    strawColor: null
  };
}

function isCupEmpty(cup) {
  return !cup.tea && cup.pourLevel === 0 && !cup.sugar && !cup.ice && !cup.isShaken &&
    cup.toppings.length === 0 && !cup.hasLid && !cup.strawColor;
}

// Thứ tự các trạm (để biết hướng lia máy quay khi chuyển trạm)
const STATION_ORDER = ['view-order-station', 'view-pour-station', 'view-shake-station', 'view-top-station'];

// Kích thước thiết kế của sân khấu game
const STAGE_W = 1280;
const STAGE_H = 720;

// Chỉ ra đơn với loại trà có vòi rót ở CẢ Quầy Toàn Cảnh lẫn Trạm Rót Trà
// (vd 绿茶 chưa có vòi -> không ra đơn, nhưng vẫn có trong Sổ Từ)
function getOrderableTeas() {
  const list = BOBA_VOCAB.teas.filter(t =>
    document.querySelector(`.m-dispenser-urn[data-tea="${t.id}"]`) &&
    document.querySelector(`.btn-spout-lever[data-tea="${t.id}"]`)
  );
  return list.length > 0 ? list : BOBA_VOCAB.teas;
}

// ============================================================================
// 3. PAPA'S BOBA ENGINE CLASS
// ============================================================================
class PapaBobaGame {
  constructor() {
    this.audio = new PapaBobaAudio();

    // Stats
    this.coins = 120;
    this.level = 1;
    this.exp = 20;
    this.completedOrders = 1;
    this.learnedWords = new Set(['珍珠', '奶茶', '少糖', '去冰']);

    // Stations
    this.currentStation = 'view-master-counter';

    // Customer queue (Papa's style): khách đến theo lịch, xếp hàng, ghi phiếu, chờ món
    this.customerDeck = []; // Shuffle bag to guarantee high variety without repetition
    this.tickets = [];      // khách đang trong quán: status 'line' (xếp hàng) | 'waiting' (chờ món)
    this.activeTicketId = null;
    this.ticketSeq = 0;     // số thứ tự phiếu (lưu lại)
    this.day = 1;
    this.dayStats = null;
    this.dayEnded = false;
    this.nextArrivalAt = 0;
    this.servingTicket = null;
    this.counterUid = null;
    this.relaxedMode = false;

    // Đồng hồ game (chỉ chạy khi không tạm dừng)
    this.gameTime = 0;
    this.lastTickAt = performance.now();
    this.tickTimer = null;

    // Cup Crafting State: mỗi phiếu có 1 ly riêng; spareCup = ly khi chưa chọn phiếu nào
    this.spareCup = freshCup();
    this.cup = this.spareCup;

    // Shaker interactive loop
    this.shakerRunning = false;
    this.shakerAngle = -70; // -70deg to +70deg
    this.shakerDirection = 1;
    this.shakerTimer = null;
    this.shakerSfxTimer = null;

    // Pour holding timer
    this.pourInterval = null;
    this.currentPouringTea = null;
    this.toastTimeout = null;

    // Settings
    this.showPinyin = true;
    this.showVietnamese = true;
    this.showGuide = true;

    // Stage / serve flow
    this.stageScale = 1;
    this.isServing = false;
    this.guideTimer = null;

    // Nhiệm vụ ngày & kỷ lục
    this.mission = null;
    this.records = [];

    // Đồng bộ tài khoản
    this.cloud = { checked: false, loggedIn: false, offline: false, email: null, name: '', picture: '', best: null, timer: null, pending: false };
    this.rankTab = 'global';

    this.loadSave();
    this.initDOM();
    this.renderCounter();
    this.renderRail();
    this.showTitleScreen();
    this.tickTimer = setInterval(() => this.tick(), 200);
    this.cloudReady = this.initCloud()
      .catch(() => {})
      .finally(() => { this.cloud.checked = true; this.renderAccountChip(); });
  }

  // ---------------------------------------------------------------- Tài khoản & bảng xếp hạng
  // QUY TẮC: mỗi lần tải trang = 1 ván mới (không lưu tiến trình ở máy hay server).
  // Chỉ KẾT QUẢ mỗi ngày bán hàng được gửi lên tài khoản → server giữ thành tích cao nhất.
  async initCloud() {
    if (!BobaCloud.token()) {
      this.cloud.checked = true;
      this.renderAccountChip();
      return;
    }
    let data;
    try {
      data = await BobaCloud.getProgress();
    } catch (e) {
      this.cloud.checked = true;
      this.cloud.offline = true;
      const lu = BobaCloud.localUser();
      if (lu) { this.cloud.name = lu.name || lu.email; this.cloud.picture = lu.picture || ''; }
      this.renderAccountChip();
      return;
    }
    this.cloud.checked = true;
    if (!data || !data.loggedIn) {
      this.renderAccountChip();
      return;
    }
    const lu = BobaCloud.localUser();
    this.cloud.loggedIn = true;
    this.cloud.name = (data.user && data.user.name) || (lu && lu.name) || 'Bạn';
    this.cloud.picture = (data.user && data.user.picture) || (lu && lu.picture) || '';
    this.cloud.best = data.best || null;
    this.cloud.history = Array.isArray(data.history) ? data.history : [];
    this.cloud.totals = data.totals || null;
    this.renderAccountChip();
    if (this.isTitleVisible()) this.showTitleScreen();
  }

  renderAccountChip() {
    const chip = document.getElementById('title-account');
    if (!chip) return;
    const nameEl = document.getElementById('title-account-name');
    const statusEl = document.getElementById('title-account-status');
    const avatarEl = document.getElementById('title-account-avatar');
    const c = this.cloud;
    if (c.loggedIn) {
      chip.classList.remove('guest');
      chip.removeAttribute('href');
      chip.title = 'Thành tích cao nhất được lưu vào tài khoản';
      if (nameEl) nameEl.textContent = c.name;
      if (statusEl) statusEl.textContent = c.best ? `🏆 Kỷ lục ${Number(c.best.earnings).toFixed(1)} ¥` : '☁️ Chưa có kỷ lục · Chơi để lên bảng!';
      if (avatarEl) avatarEl.innerHTML = c.picture ? `<img src="${escapeHtml(c.picture)}" alt="" referrerpolicy="no-referrer">` : '<i class="fa-solid fa-user"></i>';
    } else {
      chip.classList.add('guest');
      chip.setAttribute('href', 'index.html');
      if (c.offline && c.name) {
        if (nameEl) nameEl.textContent = c.name;
        if (statusEl) statusEl.textContent = '⚠️ Mất kết nối máy chủ';
      } else {
        if (nameEl) nameEl.textContent = 'Khách';
        if (statusEl) statusEl.textContent = 'Đăng nhập để lưu thành tích';
      }
      if (avatarEl) avatarEl.innerHTML = '<i class="fa-solid fa-user"></i>';
    }
  }

  // Gửi kết quả 1 ngày bán hàng → server cập nhật thành tích cao nhất của tài khoản
  async pushDayResult(dayResult) {
    if (!this.cloud.loggedIn || !dayResult) return null;
    try {
      // keepalive: vẫn gửi xong kể cả khi người chơi tải lại / đóng trang ngay sau khi tổng kết
      const r = await BobaCloud.saveProgress({ dayResult }, true);
      if (r && r.best) this.cloud.best = r.best;
      if (r && Array.isArray(r.history)) this.cloud.history = r.history;
      if (r && r.totals) this.cloud.totals = r.totals;
      if (r && r.newBest) {
        this.showToast('🏆', `Kỷ lục mới của bạn: ${Number(r.best.earnings).toFixed(1)} ¥ — đã cập nhật bảng xếp hạng!`);
      }
      this.renderAccountChip();
      return r;
    } catch (e) {
      this.showToast('⚠️', 'Chưa gửi được kết quả lên bảng xếp hạng (mất kết nối).');
      return null;
    }
  }

  // Không khôi phục gì: dọn sạch dữ liệu cũ mà các phiên bản trước đã lưu trên trình duyệt
  loadSave() {
    try {
      BOBA_SAVE_KEYS.forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  }

  // Ván chơi chỉ sống trong phiên hiện tại → không ghi gì xuống trình duyệt
  saveGame() {}

  initDOM() {
    this.updateHUD();

    // Sân khấu 1280×720 tự co giãn vừa màn hình (hỗ trợ Màn hình Dọc trên điện thoại)
    this.fitStage();
    window.addEventListener('resize', () => {
      this.fitStage();
      this.positionGuideTag();
    });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.fitStage();
        this.positionGuideTag();
      }, 150);
    });

    // Nút chuyển đổi chế độ Màn hình Dọc (Portrait) / Ngang (Landscape)
    document.getElementById('btn-toggle-orientation')?.addEventListener('click', () => {
      const isCurrentlyPortrait = document.body.classList.contains('portrait');
      this.forcePortrait = !isCurrentlyPortrait;
      this.fitStage();
      this.showToast('📱', this.forcePortrait ? 'Đã bật Màn hình Dọc (Mobile Portrait)' : 'Đã chuyển về Màn hình Ngang (Landscape)');
    });

    // Toàn màn hình
    ['btn-fullscreen-boba', 'btn-rotate-fullscreen'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', () => this.toggleFullscreen());
    });

    // Bật/tắt gợi ý bước tiếp theo
    document.getElementById('toggle-guide')?.addEventListener('change', (e) => {
      this.showGuide = e.target.checked;
      this.updateGuide();
    });

    // Bottom Station Tab Switching
    document.querySelectorAll('.station-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        this.switchStation(target);
      });
    });

    // Navigation buttons between stations
    document.getElementById('btn-goto-pour-from-order')?.addEventListener('click', () => {
      this.switchStation('view-pour-station');
    });
    document.getElementById('btn-back-to-order')?.addEventListener('click', () => {
      this.switchStation('view-order-station');
    });
    document.getElementById('btn-goto-shake')?.addEventListener('click', () => {
      this.switchStation('view-shake-station');
    });
    document.getElementById('btn-back-to-pour')?.addEventListener('click', () => {
      this.switchStation('view-pour-station');
    });
    document.getElementById('btn-goto-top')?.addEventListener('click', () => {
      this.switchStation('view-top-station');
    });
    document.getElementById('btn-back-to-shake')?.addEventListener('click', () => {
      this.switchStation('view-shake-station');
    });

    // Take Order Buttons (Trạm Đón Khách + Quầy Toàn Cảnh)
    ['btn-take-order-action', 'btn-master-take-order'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.takeOrder();
      });
    });

    // Listen to speech button
    document.getElementById('btn-listen-order-speech')?.addEventListener('click', () => {
      this.speakOrder();
    });

    // Hủy ly bất cứ lúc nào (nút trên HUD, dùng được ở mọi trạm / chế độ)
    document.getElementById('btn-hud-trash')?.addEventListener('click', () => {
      const origin = {
        'view-master-counter': 'master',
        'view-order-station': 'order',
        'view-pour-station': 'pour',
        'view-shake-station': 'shake',
        'view-top-station': 'top'
      }[this.currentStation] || 'pour';
      this.trashCup(origin);
    });

    // Chế độ thư giãn: không giới hạn thời gian chờ
    const relaxedToggle = document.getElementById('toggle-relaxed');
    if (relaxedToggle) relaxedToggle.checked = this.relaxedMode;
    relaxedToggle?.addEventListener('change', (e) => {
      this.relaxedMode = e.target.checked;
      this.saveGame();
      this.updatePatienceUI();
      this.showToast(this.relaxedMode ? '🍃' : '⏱️', this.relaxedMode
        ? 'Chế độ thư giãn: khách chờ bao lâu cũng được.'
        : 'Chế độ thường: khách chờ quá lâu sẽ bỏ về!');
    });

    // Tổng kết ngày -> nhiệm vụ ngày mới
    document.getElementById('btn-start-next-day')?.addEventListener('click', () => {
      this.startNextDay();
    });

    // Màn hình chờ: Bắt đầu · Hướng dẫn · Xếp hạng
    document.getElementById('btn-title-play')?.addEventListener('click', () => this.onTitlePlay());
    document.getElementById('btn-title-guide')?.addEventListener('click', () => this.openModal('modal-guide'));
    document.getElementById('btn-title-rank')?.addEventListener('click', () => this.openRankModal());
    document.querySelectorAll('#modal-rank .rank-tab').forEach(btn => {
      btn.addEventListener('click', () => { this.audio.playPop(); this.switchRankTab(btn.dataset.rankTab); });
    });
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = document.getElementById(btn.dataset.close);
        if (m) m.style.display = 'none';
      });
    });

    // Nhiệm vụ đầu ngày -> mở cửa
    document.getElementById('btn-mission-start')?.addEventListener('click', () => this.startMissionDay());

    // Cài đặt -> quay về màn hình chính (đồng hồ dừng, bấm Tiếp tục để chơi tiếp)
    document.getElementById('btn-back-to-title')?.addEventListener('click', () => {
      const pm = document.getElementById('boba-pause-modal');
      if (pm) pm.style.display = 'none';
      this.showTitleScreen();
    });

    // Pour Dispensers (Hold to pour)
    document.querySelectorAll('.btn-spout-lever').forEach(btn => {
      const teaKey = btn.dataset.tea;
      // Mouse events
      btn.addEventListener('mousedown', () => this.startPouring(teaKey));
      btn.addEventListener('mouseup', () => this.stopPouring());
      btn.addEventListener('mouseleave', () => this.stopPouring());
      // Touch events
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.startPouring(teaKey); });
      btn.addEventListener('touchend', (e) => { e.preventDefault(); this.stopPouring(); });
    });

    // Drain Liquid button in Pour Station
    document.getElementById('btn-drain-liquid-pour')?.addEventListener('click', () => {
      this.drainLiquid();
    });

    // Sugar buttons (Toggle select/deselect)
    document.querySelectorAll('.btn-opt-sugar').forEach(btn => {
      btn.addEventListener('click', () => {
        const sId = btn.dataset.sugar;
        this.toggleSugar(sId);
      });
    });

    // Ice buttons (Toggle select/deselect)
    document.querySelectorAll('.btn-opt-ice').forEach(btn => {
      btn.addEventListener('click', () => {
        const iId = btn.dataset.ice;
        this.toggleIce(iId);
      });
    });

    // Clear Sugar & Ice button
    document.getElementById('btn-clear-sugar-ice')?.addEventListener('click', () => {
      this.clearSugarIce();
    });

    // Shake Station Trigger
    document.getElementById('btn-shaker-trigger')?.addEventListener('click', () => {
      this.toggleShaker();
    });

    // Reset Shaker button
    document.getElementById('btn-reset-shaker')?.addEventListener('click', () => {
      this.resetShaker();
    });

    // Top Station Topping selection (Add Topping)
    document.querySelectorAll('.topping-tub-card').forEach(card => {
      card.addEventListener('click', () => {
        const topId = card.dataset.topping;
        this.addTopping(topId);
      });
    });

    // Undo Last Topping button
    document.getElementById('btn-undo-topping')?.addEventListener('click', () => {
      this.undoLastTopping();
    });

    // Clear All Toppings button
    document.getElementById('btn-clear-toppings')?.addEventListener('click', () => {
      this.clearAllToppings();
    });

    // Seal Lid Button
    document.getElementById('btn-action-lid')?.addEventListener('click', () => {
      this.sealLid();
    });

    // Remove Lid Button
    document.getElementById('btn-remove-lid')?.addEventListener('click', () => {
      this.removeLid();
    });

    // Straw selection
    document.querySelectorAll('.btn-color-straw').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        this.insertStraw(color);
      });
    });

    // Remove Straw Button
    document.getElementById('btn-remove-straw')?.addEventListener('click', () => {
      this.removeStraw();
    });

    // Trash Can actions across stations
    document.getElementById('btn-trash-pour-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.trashCup('pour');
    });
    document.getElementById('trash-bin-pour')?.addEventListener('click', () => {
      this.trashCup('pour');
    });

    document.getElementById('btn-trash-shake-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.trashCup('shake');
    });
    document.getElementById('trash-bin-shake')?.addEventListener('click', () => {
      this.trashCup('shake');
    });

    document.getElementById('btn-trash-top-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.trashCup('top');
    });
    document.getElementById('trash-bin-top')?.addEventListener('click', () => {
      this.trashCup('top');
    });

    // Drag and drop cups into Trash Can
    ['pour-cup-glass', 'final-boba-cup'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', 'boba-cup');
          e.dataTransfer.effectAllowed = 'move';
        });
      }
    });

    document.querySelectorAll('.papa-trash-bin-unit').forEach(unit => {
      unit.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        unit.classList.add('drag-over');
      });
      unit.addEventListener('dragleave', () => {
        unit.classList.remove('drag-over');
      });
      unit.addEventListener('drop', (e) => {
        e.preventDefault();
        unit.classList.remove('drag-over');
        this.trashCup(unit.dataset.station);
      });
    });

    // Finish & Serve Button
    document.getElementById('btn-finish-and-serve')?.addEventListener('click', () => {
      this.serveDrinkToCustomer();
    });

    // Scorecard -> tiếp tục bán (khách mới đến theo lịch, không tự sinh)
    document.getElementById('btn-next-customer-papa')?.addEventListener('click', () => {
      document.getElementById('modal-papa-score').style.display = 'none';
      this.isServing = false;
      this.servingTicket = null;
      this.activateNextWaiting(); // tự chuyển sang phiếu chờ lâu nhất
      this.renderCounter();
      this.renderRail();
      if (this.currentStation !== 'view-master-counter') {
        // Còn khách xếp hàng -> về quầy ghi phiếu; còn phiếu chờ -> đi pha tiếp
        const target = this.getLineTickets().length > 0 || !this.activeTicket ? 'view-order-station' : 'view-pour-station';
        this.switchStation(target);
      } else {
        this.updateAllCupVisuals();
      }
    });

    // Open cookbook
    document.getElementById('btn-open-cookbook')?.addEventListener('click', () => {
      this.openCookbookModal();
    });

    // Pause / Settings modal
    document.getElementById('btn-pause-boba')?.addEventListener('click', () => {
      this.stopPouring();
      const modal = document.getElementById('boba-pause-modal');
      if (modal) modal.style.display = 'flex';
      this.audio.playPop();
    });

    // Mascot encouragement
    document.getElementById('hud-mascot-dragon')?.addEventListener('click', () => {
      this.audio.speak('加油！');
      this.showToast('🐲', '加油！Cố lên nhé, chủ quán!');
    });

    // Chơi lại từ đầu: ván mới (kỷ lục trên bảng xếp hạng vẫn giữ trong tài khoản)
    document.getElementById('btn-reset-boba-save')?.addEventListener('click', () => {
      if (confirm('Bạn có muốn chơi lại từ đầu không? (Kỷ lục trên bảng xếp hạng vẫn được giữ)')) {
        location.reload();
      }
    });

    // Settings toggles
    document.getElementById('toggle-sfx')?.addEventListener('change', (e) => {
      this.audio.sfxEnabled = e.target.checked;
    });
    document.getElementById('toggle-voice')?.addEventListener('change', (e) => {
      this.audio.voiceEnabled = e.target.checked;
    });
    document.getElementById('toggle-pinyin')?.addEventListener('change', (e) => {
      this.showPinyin = e.target.checked;
      this.updateSpeechBalloonUI();
    });
    document.getElementById('toggle-vi')?.addEventListener('change', (e) => {
      this.showVietnamese = e.target.checked;
      this.updateSpeechBalloonUI();
    });

    // Add coin bonus
    document.getElementById('btn-add-coin')?.addEventListener('click', () => {
      this.coins += 50;
      this.audio.playCashRegister();
      this.updateHUD();
      this.saveGame();
    });

    // ========================================================================
    // MASTER COUNTER CONTROLS (QUẦY TOÀN CẢNH THEO MẪU TRANH GỐC)
    // ========================================================================
    // Mode Switcher Button in HUD
    document.getElementById('btn-toggle-game-mode')?.addEventListener('click', () => {
      this.audio.playPop();
      if (this.currentStation === 'view-master-counter') {
        this.switchStation('view-order-station');
      } else {
        this.switchStation('view-master-counter');
      }
    });

    // 4 Tea Dispensers in Master Counter
    document.querySelectorAll('.m-dispenser-urn').forEach(urn => {
      urn.addEventListener('click', () => {
        const teaId = urn.dataset.tea;
        const tea = BOBA_VOCAB.teas.find(t => t.id === teaId);
        if (!tea) return;
        this.cup.tea = tea;
        this.cup.pourLevel = 70;
        this.audio.playPour();
        this.updateAllCupVisuals();
        this.showToast('🍵', `Đã rót ${tea.hanzi} (${tea.vi}) vào ly!`);
      });
    });

    // 6 Topping Boxes in Master Counter
    document.querySelectorAll('.m-topping-box').forEach(box => {
      box.addEventListener('click', () => {
        this.addTopping(box.dataset.topping);
      });
    });

    // Sugar buttons in Master Counter (bấm lại để bỏ chọn, giống trạm Rót Trà)
    document.querySelectorAll('.btn-m-sugar').forEach(btn => {
      btn.addEventListener('click', () => {
        this.toggleSugar(btn.dataset.sugar);
      });
    });

    // Ice buttons in Master Counter
    document.querySelectorAll('.btn-m-ice').forEach(btn => {
      btn.addEventListener('click', () => {
        this.toggleIce(btn.dataset.ice);
      });
    });

    // Shaker in Master Counter (chế độ quầy: bấm là lắc chuẩn)
    document.getElementById('master-shaker-wrap')?.addEventListener('click', () => {
      this.audio.playShakerSound();
      const shakerBody = document.getElementById('master-shaker-body');
      shakerBody?.classList.add('shakerShakeAnim');
      setTimeout(() => shakerBody?.classList.remove('shakerShakeAnim'), 700);
      this.cup.isShaken = true;
      this.cup.shakeScore = 100;
      this.updateAllCupVisuals();
      this.showToast('🌪️', 'Đã lắc đều ly trà sữa thơm ngon!');
    });

    // Lids box in Master Counter
    document.getElementById('master-lids-box')?.addEventListener('click', () => {
      this.cup.hasLid = true;
      if (!this.cup.strawColor) this.cup.strawColor = '#f43f5e';
      this.audio.playPop();
      this.updateAllCupVisuals();
      this.showToast('🐻', 'Đã đóng nắp và cắm ống hút!');
    });

    // Trash in Master Counter
    document.getElementById('btn-master-trash')?.addEventListener('click', () => {
      this.trashCup('master');
    });

    // Undo topping in Master Counter
    document.getElementById('btn-master-undo')?.addEventListener('click', () => {
      this.undoLastTopping();
    });

    // Speech audio in Master Counter
    document.getElementById('btn-master-speech-audio')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.speakOrder();
    });
    document.getElementById('master-speech-bubble')?.addEventListener('click', () => {
      this.speakOrder();
    });

    // Finish & Serve button in Master Counter
    document.getElementById('btn-master-finish-drink')?.addEventListener('click', () => {
      this.serveDrinkToCustomer();
    });

    // Full-screen Ticket Zoom Modal Handlers
    document.querySelectorAll('.btn-quick-zoom-ticket').forEach(b => {
      b.addEventListener('click', () => this.openTicketZoomModal());
    });
    document.getElementById('btn-close-zoom-ticket')?.addEventListener('click', () => {
      this.closeTicketZoomModal();
    });
    document.getElementById('btn-zoom-back-to-work')?.addEventListener('click', () => {
      this.closeTicketZoomModal();
    });
    document.getElementById('btn-zoom-listen')?.addEventListener('click', () => {
      this.speakZoomTicket();
    });

    // Tab ẩn -> đồng hồ game dừng (khách không bỏ về khi bạn rời tab)
    document.addEventListener('visibilitychange', () => {
      this.lastTickAt = performance.now();
    });
  }

  // Switch Station smoothly
  switchStation(stationId) {
    // Rời trạm Lắc khi máy đang chạy -> tắt máy (tránh tiếng kêu liên tục ở trạm khác)
    if (this.shakerRunning && stationId !== 'view-shake-station') {
      this.stopShakerLoop();
      this.resetShakerUI();
    }
    this.stopPouring();
    const prevStation = this.currentStation;
    this.currentStation = stationId;

    if (stationId === 'view-master-counter') {
      document.body?.classList.add('mode-master');
      const modeText = document.getElementById('hud-mode-text');
      if (modeText) modeText.textContent = 'Chế độ Trạm';
    } else {
      document.body?.classList.remove('mode-master');
      const modeText = document.getElementById('hud-mode-text');
      if (modeText) modeText.textContent = 'Quầy Toàn Cảnh (Gốc)';
    }

    // View visibility
    document.querySelectorAll('.station-view').forEach(view => {
      view.classList.remove('active');
    });
    const targetView = document.getElementById(stationId);
    if (targetView) {
      targetView.classList.add('active');
      // Lia máy quay theo thứ tự trạm: đi tới -> trượt từ phải, quay lại -> trượt từ trái
      const from = STATION_ORDER.indexOf(prevStation);
      const to = STATION_ORDER.indexOf(stationId);
      targetView.classList.remove('pan-from-right', 'pan-from-left');
      if (from !== -1 && to !== -1 && from !== to) {
        void targetView.offsetWidth; // restart animation
        targetView.classList.add(to > from ? 'pan-from-right' : 'pan-from-left');
      }
    }

    // Bottom tab active state
    document.querySelectorAll('.station-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.target === stationId);
    });

    this.updateAllCupVisuals();
    this.audio.playPop();
  }

  // Synchronize cup visual representation across Master Counter & Stations
  updateAllCupVisuals() {
    // 1. MASTER COUNTER CUP
    const masterLiquid = document.getElementById('master-cup-liquid');
    const masterIce = document.getElementById('master-cup-ice-layer');
    const masterTop = document.getElementById('master-cup-toppings-layer');
    const masterLid = document.getElementById('master-cup-lid');
    const masterPills = document.getElementById('master-cup-pills');

    if (masterLiquid) {
      if (this.cup.tea) {
        masterLiquid.className = `m-cup-liquid liquid-${this.cup.tea.id}`;
        masterLiquid.style.background = '';
        masterLiquid.style.height = `${Math.min(85, Math.max(30, this.cup.pourLevel))}%`;
      } else {
        masterLiquid.className = 'm-cup-liquid';
        masterLiquid.style.background = 'transparent';
        masterLiquid.style.height = '0%';
      }
    }

    if (masterIce) {
      masterIce.innerHTML = '';
      if (this.cup.ice && this.cup.ice.id !== 'no_ice') {
        const count = this.cup.ice.id === 'extra_ice' ? 4 : (this.cup.ice.id === 'less_ice' ? 2 : 3);
        for (let i = 0; i < count; i++) {
          const cube = document.createElement('span');
          cube.className = 'm-ice-cube';
          cube.style.setProperty('--r', `${(i % 2 === 0 ? 1 : -1) * (6 + i * 4)}deg`);
          masterIce.appendChild(cube);
        }
      }
    }

    if (masterTop) {
      masterTop.innerHTML = '';
      this.cup.toppings.forEach(top => {
        const count = (top.id === 'boba' || top.id === 'redbean') ? 4 : 2;
        for (let k = 0; k < count; k++) {
          const dot = document.createElement('span');
          dot.className = `m-top-dot t-${top.id}`;
          masterTop.appendChild(dot);
        }
      });
    }

    if (masterLid) {
      masterLid.style.display = this.cup.hasLid ? 'flex' : 'none';
    }
    const masterStraw = document.getElementById('master-cup-straw');
    if (masterStraw) {
      masterStraw.style.display = this.cup.strawColor ? '' : 'none';
      if (this.cup.strawColor) masterStraw.style.background = this.cup.strawColor;
    }

    if (masterPills) {
      const parts = [];
      if (this.cup.tea) parts.push(`<span class="m-pill" style="background:#fef3c7; color:#92400e;">${this.cup.tea.hanzi}</span>`);
      if (this.cup.sugar) parts.push(`<span class="m-pill" style="background:#ffedd5; color:#9a3412;">${this.cup.sugar.hanzi}</span>`);
      if (this.cup.ice) parts.push(`<span class="m-pill" style="background:#e0f2fe; color:#0369a1;">${this.cup.ice.hanzi}</span>`);
      if (this.cup.toppings.length > 0) parts.push(`<span class="m-pill" style="background:#fce7f3; color:#9d174d;">${this.cup.toppings.map(t => t.hanzi).join('+')}</span>`);

      masterPills.innerHTML = parts.length > 0 ? parts.join(' ') : '<span class="m-pill empty">Ly Trống</span>';
    }

    // 2. STATIONS CUP SYNC (để 2 chế độ luôn hiển thị cùng 1 ly)
    this.updatePourCupUI();
    const finalLiq = document.getElementById('final-cup-liquid');
    if (finalLiq) {
      if (this.cup.tea) {
        finalLiq.style.background = this.cup.tea.color;
        finalLiq.style.height = `${Math.min(85, Math.max(25, this.cup.pourLevel))}%`;
      } else {
        finalLiq.style.background = 'transparent';
        finalLiq.style.height = '0%';
      }
    }
    const finalLid = document.getElementById('final-cup-lid');
    if (finalLid) finalLid.style.display = this.cup.hasLid ? 'flex' : 'none';
    const finalStraw = document.getElementById('final-cup-straw');
    if (finalStraw) {
      finalStraw.style.display = this.cup.strawColor ? 'block' : 'none';
      if (this.cup.strawColor) finalStraw.style.background = this.cup.strawColor;
    }
    document.getElementById('btn-action-lid')?.style.setProperty('display', this.cup.hasLid ? 'none' : 'inline-flex');
    document.getElementById('btn-remove-lid')?.style.setProperty('display', this.cup.hasLid ? 'inline-flex' : 'none');

    // Nút đường / đá đang chọn (cả Quầy Toàn Cảnh lẫn Trạm Rót)
    const sugarId = this.cup.sugar ? this.cup.sugar.id : null;
    const iceId = this.cup.ice ? this.cup.ice.id : null;
    document.querySelectorAll('.btn-opt-sugar, .btn-m-sugar').forEach(b => b.classList.toggle('active', b.dataset.sugar === sugarId));
    document.querySelectorAll('.btn-opt-ice, .btn-m-ice').forEach(b => b.classList.toggle('active', b.dataset.ice === iceId));

    this.updateToppingsUI();

    // 3. LEFT BOARD STATS SYNC
    const mRev = document.getElementById('m-rev-val');
    if (mRev) mRev.textContent = `${this.coins} ¥`;
    const mOrd = document.getElementById('m-order-val');
    if (mOrd) mOrd.textContent = this.completedOrders.toString();
    const mWords = document.getElementById('m-words-val');
    if (mWords) mWords.textContent = this.learnedWords.size.toString();

    this.updateGuide();
  }

  // ==========================================================================
  // STAGE SCALING & FULLSCREEN
  // ==========================================================================
  fitStage() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Tự động phát hiện hoặc thủ công Màn hình Dọc (Portrait)
    const isPortrait = (this.forcePortrait !== undefined)
      ? this.forcePortrait
      : (h > w || (w <= 640 && h >= w));

    document.body?.classList.toggle('portrait', isPortrait);

    if (isPortrait) {
      this.stageScale = 1;
      // Trên máy tính bảng / iPad (w >= 768), cho phép độ rộng co giãn tới 560px
      const stageW = (w >= 768) ? Math.min(w * 0.85, 560) : Math.min(w, 480);
      document.documentElement.style.setProperty('--stage-w', stageW + 'px');
      document.documentElement.style.setProperty('--stage-h', h + 'px');
      document.documentElement.style.setProperty('--stage-scale', '1');
      document.body?.classList.add('stage-flush');
      // Ở chế độ dọc, ưu tiên chuyển về Quầy Toàn Cảnh để điều khiển trọn vẹn
      if (this.currentStation !== 'view-master-counter') {
        this.switchStation('view-master-counter');
      }
    } else {
      const scale = Math.min(w / STAGE_W, h / STAGE_H);
      this.stageScale = scale > 0 ? scale : 1;
      document.documentElement.style.setProperty('--stage-scale', this.stageScale.toFixed(4));
      document.documentElement.style.removeProperty('--stage-w');
      document.documentElement.style.removeProperty('--stage-h');
      const flush = (w - STAGE_W * this.stageScale < 24 && h - STAGE_H * this.stageScale < 24) || w < 900;
      document.body?.classList.toggle('stage-flush', flush);
    }
  }

  toggleFullscreen() {
    const doc = document;
    const el = document.documentElement;
    try {
      if (!doc.fullscreenElement && el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
  }

  // ==========================================================================
  // NEXT-STEP GUIDE (viền xanh + nhãn chỉ chỗ cần thao tác tiếp)
  // ==========================================================================
  getGuideStep() {
    const c = this.cup;
    const hasLine = this.getLineTickets().length > 0;
    // Chưa có phiếu đang làm: ưu tiên ghi phiếu cho khách đang xếp hàng
    if (!this.activeTicket) {
      if (this.currentStation === 'view-master-counter' && hasLine) return ['#btn-master-take-order', '接单', 'Ghi phiếu', 'below'];
      if (this.currentStation === 'view-order-station' && hasLine) return ['#btn-take-order-action', '接单', 'Ghi phiếu', 'below'];
      return null;
    }
    // Đang làm dở nhưng có khách mới xếp hàng quá nửa thời gian -> nhắc ghi phiếu kẻo mất khách
    const urgent = this.getLineTickets()[0];
    if (urgent && !this.relaxedMode && this.patienceUsed(urgent) > 0.5) {
      if (this.currentStation === 'view-master-counter') return ['#btn-master-take-order', '接单', 'Khách đang chờ ghi phiếu!', 'below'];
      if (this.currentStation === 'view-order-station') return ['#btn-take-order-action', '接单', 'Khách đang chờ ghi phiếu!', 'below'];
    }
    switch (this.currentStation) {
      case 'view-master-counter':
        if (!c.tea) return ['.master-dispensers-rack', '倒茶', 'Chọn loại trà'];
        if (!c.sugar) return ['.master-sugar-ice-rack', '选糖', 'Chọn đường'];
        if (!c.ice) return ['.master-sugar-ice-rack', '选冰', 'Chọn đá'];
        if (c.toppings.length === 0) return ['.master-toppings-rack', '加料', 'Thêm topping'];
        if (!c.isShaken) return ['#master-shaker-wrap', '摇匀', 'Lắc đều'];
        if (!c.hasLid) return ['#master-lids-box', '封口', 'Đóng nắp'];
        return ['#btn-master-finish-drink', '出餐', 'Giao món'];
      case 'view-order-station':
        if (hasLine) return ['#btn-take-order-action', '接单', 'Ghi phiếu', 'below'];
        return ['#btn-goto-pour-from-order', '前往', 'Đi pha chế'];
      case 'view-pour-station':
        if (c.pourLevel > 75) return ['#btn-drain-liquid-pour', '倒掉', 'Quá vạch, đổ đi rót lại'];
        if (!c.tea || c.pourLevel < 65) return ['.dispensers-row', '按住', 'Nhấn giữ vòi tới vạch 70%'];
        if (!c.sugar) return ['.sugar-box', '选糖', 'Chọn đường'];
        if (!c.ice) return ['.ice-box', '选冰', 'Chọn đá'];
        return ['#btn-goto-shake', '下一步', 'Sang máy lắc'];
      case 'view-shake-station':
        if (this.shakerRunning) return ['#btn-shaker-trigger', '停', 'Dừng ở vùng xanh', 'left'];
        if (!c.isShaken) return ['#btn-shaker-trigger', '启动', 'Bắt đầu lắc', 'left'];
        return ['#btn-goto-top', '下一步', 'Sang trạm topping'];
      case 'view-top-station':
        if (c.toppings.length === 0) return ['.toppings-cells-6', '加料', 'Thêm topping'];
        if (!c.hasLid) return ['#btn-action-lid', '封口', 'Đóng nắp'];
        if (!c.strawColor) return ['.straw-colors-row', '吸管', 'Cắm ống hút', 'below'];
        return ['#btn-finish-and-serve', '出餐', 'Giao món'];
      default:
        return null;
    }
  }

  updateGuide() {
    const tag = document.getElementById('guide-tag');
    const step = this.showGuide && !this.isServing ? this.getGuideStep() : null;
    const target = step ? document.querySelector(`#${this.currentStation} ${step[0]}`) : null;
    const visible = !!target && target.offsetParent !== null;

    // Không đổi gì -> giữ nguyên (tránh nhấp nháy vì gọi lại liên tục mỗi giây)
    const key = visible ? `${this.currentStation}|${step[0]}|${step[2]}` : 'none';
    if (key === this.guideKey && (!visible || target === this.guideTarget)) return;
    this.guideKey = key;

    document.querySelectorAll('.guide-glow').forEach(el => el.classList.remove('guide-glow'));
    this.guideTarget = null;
    if (!visible) {
      if (tag) tag.style.display = 'none';
      return;
    }

    target.classList.add('guide-glow');
    this.guideTarget = target;

    // Nút ghi phiếu đã có chữ rõ ràng -> nút tự phát sáng (guide-glow), không hiện thêm tag xanh đè bên dưới gây hiểu lầm là 2 nút
    if (step[0] === '#btn-master-take-order' || step[0] === '#btn-take-order-action') {
      if (tag) tag.style.display = 'none';
      return;
    }

    this.guidePlacement = step[3] || 'above';
    if (tag) {
      tag.innerHTML = `<span class="kaiti-font">${step[1]}</span>${step[2]}`;
      tag.classList.toggle('place-below', this.guidePlacement === 'below');
      tag.classList.toggle('place-left', this.guidePlacement === 'left');
      tag.style.display = 'block';
    }
    this.positionGuideTag();
    // Đợi hiệu ứng lia trạm xong rồi đặt lại vị trí cho chuẩn
    if (this.guideTimer) clearTimeout(this.guideTimer);
    this.guideTimer = setTimeout(() => this.positionGuideTag(), 420);
  }

  positionGuideTag() {
    const tag = document.getElementById('guide-tag');
    const viewport = document.querySelector('.boba-main-viewport');
    const target = this.guideTarget;
    if (!tag || !viewport || !target || tag.style.display === 'none') return;
    const s = this.stageScale || 1;
    const vr = viewport.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    let x;
    let y;
    if (this.guidePlacement === 'left') {
      x = (tr.left - vr.left) / s;
      y = (tr.top + tr.height / 2 - vr.top) / s;
    } else {
      x = (tr.left + tr.width / 2 - vr.left) / s;
      y = ((this.guidePlacement === 'below' ? tr.bottom : tr.top) - vr.top) / s;
      // Giữ nhãn trong khung hình
      x = Math.max(110, Math.min(viewport.clientWidth - 110, x));
      if (this.guidePlacement !== 'below') y = Math.max(46, y);
    }
    tag.style.left = `${x}px`;
    tag.style.top = `${y}px`;
  }

  // ==========================================================================
  // CUSTOMER ENTER / LEAVE & FLOATING COINS
  // ==========================================================================
  getCustomerEls() {
    return [
      document.querySelector('.master-customer-avatar-wrap'),
      document.getElementById('customer-figure-wrap')
    ].filter(Boolean);
  }

  playCustomerAnim(cls) {
    this.getCustomerEls().forEach(el => {
      el.classList.remove('customer-enter', 'customer-leave');
      void el.offsetWidth;
      el.classList.add(cls);
      if (cls === 'customer-enter') {
        el.addEventListener('animationend', () => el.classList.remove('customer-enter'), { once: true });
      }
    });
  }

  floatCoins(amountText) {
    const viewport = document.querySelector('.boba-main-viewport');
    const anchor = this.currentStation === 'view-master-counter'
      ? document.querySelector('.master-customer-avatar-wrap')
      : document.getElementById('customer-figure-wrap');
    if (!viewport || !anchor) return;
    const s = this.stageScale || 1;
    const vr = viewport.getBoundingClientRect();
    const ar = anchor.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'coin-float';
    el.textContent = `+${amountText} ¥ 🪙`;
    el.style.left = `${(ar.left + ar.width / 2 - vr.left) / s}px`;
    el.style.top = `${(ar.top + ar.height * 0.35 - vr.top) / s}px`;
    viewport.appendChild(el);
    setTimeout(() => el.remove(), 1300);

    const coinPill = document.querySelector('.hud-stat-pill');
    if (coinPill) {
      coinPill.classList.remove('bump');
      void coinPill.offsetWidth;
      coinPill.classList.add('bump');
    }
  }

  // ==========================================================================
  // PAPA'S DAY & CUSTOMER QUEUE ENGINE
  //  - Mỗi ngày có N khách, đến rải rác theo lịch (không đến cùng lúc)
  //  - Khách mới XẾP HÀNG ở quầy -> người đứng đầu hàng được ghi phiếu
  //  - Phiếu kẹp lên thanh ray; mỗi phiếu có 1 ly riêng, bấm phiếu để đổi ly đang làm
  //  - 2 thanh kiên nhẫn: chờ ghi phiếu (lineMaxMs) + chờ nhận món (drinkMaxMs)
  //    Hết kiên nhẫn -> khách bỏ về (mất khách). Còn kiên nhẫn -> tính điểm chờ.
  // ==========================================================================
  get activeTicket() {
    return this.tickets.find(t => t.uid === this.activeTicketId) || null;
  }

  // Đơn đang được hiển thị cho các thẻ công thức (ưu tiên phiếu đang làm)
  get currentOrder() {
    const t = this.activeTicket || this.getCounterTicket();
    return t ? t.order : null;
  }

  getLineTickets() {
    return this.tickets.filter(t => t.status === 'line').sort((a, b) => a.arrivedAt - b.arrivedAt);
  }

  getWaitingTickets() {
    return this.tickets.filter(t => t.status === 'waiting').sort((a, b) => a.orderTakenAt - b.orderTakenAt);
  }

  // Khách đang đứng ở quầy: đang giao món > đầu hàng chờ ghi phiếu > khách của phiếu đang làm
  getCounterTicket() {
    if (this.servingTicket) return this.servingTicket;
    return this.getLineTickets()[0] || this.activeTicket || null;
  }

  getDrinkMaxMs() {
    return Math.max(QUEUE_RULES.drinkMinMs, QUEUE_RULES.drinkBaseMs - (this.level - 1) * QUEUE_RULES.drinkPerLevelMs);
  }

  getArrivalGapMs() {
    const base = Math.max(QUEUE_RULES.arriveMinMs, QUEUE_RULES.arriveBaseMs - (this.level - 1) * QUEUE_RULES.arrivePerLevelMs);
    return base + (Math.random() * 2 - 1) * QUEUE_RULES.arriveJitterMs;
  }

  // Phần kiên nhẫn đã dùng (0 -> 1) của khách ở giai đoạn hiện tại
  patienceUsed(t) {
    if (t.status === 'line') return (this.gameTime - t.arrivedAt) / t.lineMaxMs;
    return (this.gameTime - t.orderTakenAt) / t.drinkMaxMs;
  }

  // Điểm chờ kiểu Papa's: phục vụ trong 35% thời gian đầu = 100%, sau đó giảm dần tới 40%
  waitPhaseScore(used) {
    if (this.relaxedMode || used <= 0.35) return 100;
    return Math.max(40, Math.round(100 - ((Math.min(1, used) - 0.35) / 0.65) * 60));
  }

  isClockPaused() {
    if (document.hidden) return true;
    if (this.isTitleVisible()) return true;
    return ['boba-pause-modal', 'boba-cookbook-modal', 'modal-papa-score', 'modal-day-summary', 'modal-day-mission'].some(id => {
      const el = document.getElementById(id);
      return el && el.style.display !== 'none' && el.style.display !== '';
    });
  }

  getCustomersPerDay() {
    return Math.min(QUEUE_RULES.perDayMax, QUEUE_RULES.perDayBase + this.level);
  }

  // Nhiệm vụ của ngày: doanh thu, số khách được phép mất, điểm trung bình
  buildMission() {
    const total = this.getCustomersPerDay();
    const step = MISSION_RULES.roundTo;
    return {
      day: this.day,
      total,
      target: Math.ceil((total * MISSION_RULES.revenuePerGuest) / step) * step,
      maxLost: Math.max(1, Math.floor(total * MISSION_RULES.maxLostRatio)),
      minAvg: MISSION_RULES.minAvgScore
    };
  }

  // Chấm nhiệm vụ (dùng cả lúc đang chơi để hiện tiến độ)
  evaluateMission() {
    const m = this.mission;
    const s = this.dayStats;
    if (!m || !s) return [];
    const avg = s.served > 0 ? Math.round(s.scoreSum / s.served) : 0;
    return [
      { key: 'revenue', icon: '💰', chn: '今日营业额', text: `Doanh thu đạt ít nhất ${m.target} ¥`, value: `${s.earnings.toFixed(1)} / ${m.target} ¥`, done: s.earnings >= m.target, main: true },
      { key: 'lost', icon: '😊', chn: '留住顾客', text: `Không để quá ${m.maxLost} khách bỏ về`, value: `${s.lost} / ${m.maxLost} khách`, done: s.lost <= m.maxLost },
      { key: 'avg', icon: '⭐', chn: '服务质量', text: `Điểm trung bình từ ${m.minAvg}% trở lên`, value: s.served > 0 ? `${avg}%` : '—', done: s.served > 0 && avg >= m.minAvg }
    ];
  }

  showMissionBriefing() {
    this.mission = this.buildMission();
    const m = this.mission;
    const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    set('mission-day-chn', `第${m.day}天`);
    set('mission-sub', `Ngày ${m.day} · Hôm nay tiệm sẽ đón ${m.total} vị khách. Hoàn thành nhiệm vụ để nhận ⭐!`);
    const list = document.getElementById('mission-goals');
    if (list) {
      list.innerHTML = [
        { icon: '💰', chn: '今日营业额', text: `Kiếm được ít nhất <b>${m.target} ¥</b> doanh thu`, tag: 'Nhiệm vụ chính' },
        { icon: '😊', chn: '留住顾客', text: `Không để quá <b>${m.maxLost}</b> khách bỏ về vì chờ lâu` },
        { icon: '⭐', chn: '服务质量', text: `Điểm phục vụ trung bình từ <b>${m.minAvg}%</b> trở lên` }
      ].map(g => `
        <li class="mission-goal${g.tag ? ' main' : ''}">
          <span class="mg-icon">${g.icon}</span>
          <span class="mg-body"><span class="mg-chn kaiti-font">${g.chn}</span><span class="mg-text">${g.text}</span></span>
          ${g.tag ? `<span class="mg-tag">${g.tag}</span>` : ''}
        </li>`).join('');
    }
    const modal = document.getElementById('modal-day-mission');
    if (modal) modal.style.display = 'flex';
    this.audio.playPop();
  }

  startMissionDay() {
    const modal = document.getElementById('modal-day-mission');
    if (modal) modal.style.display = 'none';
    if (!this.mission || this.mission.day !== this.day) this.mission = this.buildMission();
    this.lastTickAt = performance.now();
    this.startDay();
    this.audio.playCashRegister();
  }

  // ---------------------------------------------------------------------------
  // TITLE SCREEN · HƯỚNG DẪN · XẾP HẠNG
  // ---------------------------------------------------------------------------
  isTitleVisible() {
    const el = document.getElementById('title-screen');
    return !!el && !el.classList.contains('hidden');
  }

  isDayInProgress() {
    return !!this.dayStats && !this.dayEnded;
  }

  showTitleScreen() {
    this.stopPouring();
    if (this.shakerRunning) {
      this.stopShakerLoop();
      this.resetShakerUI();
    }
    const el = document.getElementById('title-screen');
    if (el) el.classList.remove('hidden');
    document.body.classList.add('on-title');

    const inProgress = this.isDayInProgress();
    const set = (id, text) => { const e = document.getElementById(id); if (e) e.textContent = text; };
    set('title-play-chn', inProgress ? '继续营业' : '开始营业');
    set('title-play-vi', inProgress ? `Tiếp tục ngày ${this.day}` : (this.day > 1 ? `Bắt đầu ngày ${this.day}` : 'Bắt đầu'));

    const prog = document.getElementById('title-progress');
    if (prog) {
      const best = this.records.reduce((b, r) => (r.earnings > (b ? b.earnings : -1) ? r : b), null);
      prog.innerHTML = this.day > 1 || this.records.length > 0
        ? `<span>📅 Ngày ${this.day}</span><span>🏪 Lv.${this.level}</span><span>🪙 ${this.coins} ¥</span>${best ? `<span>🏆 Kỷ lục ${best.earnings.toFixed(1)} ¥</span>` : ''}`
        : '<span>✨ Vừa bán trà sữa · vừa học tiếng Trung HSK1</span>';
    }
    const tag = document.getElementById('guide-tag');
    if (tag) tag.style.display = 'none';
    this.guideKey = null;
  }

  hideTitleScreen() {
    const el = document.getElementById('title-screen');
    if (el) el.classList.add('hidden');
    document.body.classList.remove('on-title');
    this.lastTickAt = performance.now();
  }

  onTitlePlay() {
    this.audio.init();
    this.audio.playPop();
    this.hideTitleScreen();
    if (this.isDayInProgress()) {
      this.showToast('▶️', `Tiếp tục ngày ${this.day}!`);
      this.updateGuide();
    } else if (!this.dayEnded) {
      this.showMissionBriefing();
    }
    // dayEnded: bảng tổng kết vẫn đang mở bên dưới
  }

  openModal(id) {
    const m = document.getElementById(id);
    if (m) m.style.display = 'flex';
    this.audio.playPop();
  }

  openRankModal(tab = this.rankTab || 'global') {
    this.openModal('modal-rank');
    this.switchRankTab(tab);
  }

  switchRankTab(tab) {
    this.rankTab = tab === 'mine' ? 'mine' : 'global';
    document.querySelectorAll('#modal-rank .rank-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.rankTab === this.rankTab);
    });
    if (this.rankTab === 'mine') this.renderMyRank();
    else this.renderGlobalRank();
  }

  // Bảng xếp hạng toàn hệ thống: mỗi người 1 dòng = thành tích cao nhất
  async renderGlobalRank() {
    const list = document.getElementById('rank-list');
    const summary = document.getElementById('rank-summary');
    const note = document.getElementById('rank-note');
    if (!list || !summary) return;
    if (note) note.textContent = 'Mỗi người chỉ tính thành tích cao nhất · Xếp theo doanh thu 1 ngày → số sao → điểm trung bình';
    summary.innerHTML = '';
    list.innerHTML = '<div class="rank-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải bảng xếp hạng...</div>';
    const reqId = (this.rankReqId = (this.rankReqId || 0) + 1);

    let data;
    try {
      data = await BobaCloud.getLeaderboard();
    } catch (e) {
      if (reqId !== this.rankReqId || this.rankTab !== 'global') return;
      list.innerHTML = `<div class="rank-empty">📡 Không kết nối được máy chủ.<br>Kiểm tra mạng rồi mở lại bảng xếp hạng nhé!<br><br>
        <button type="button" class="rank-tab active" style="flex:none;padding:6px 16px" id="btn-rank-retry">🔄 Thử lại</button></div>`;
      document.getElementById('btn-rank-retry')?.addEventListener('click', () => this.renderGlobalRank());
      return;
    }
    if (reqId !== this.rankReqId || this.rankTab !== 'global') return; // người dùng đã đổi tab

    const me = data.me;
    summary.innerHTML = `
      <div class="rs-item"><span>👥</span><strong>${data.totalPlayers || 0}</strong><small>Chủ quán</small></div>
      <div class="rs-item"><span>🏅</span><strong>${me ? `#${me.rank}` : '—'}</strong><small>Hạng của bạn</small></div>
      <div class="rs-item"><span>🏆</span><strong>${me ? `${Number(me.earnings).toFixed(1)} ¥` : '—'}</strong><small>Kỷ lục của bạn</small></div>
      <div class="rs-item"><span>📅</span><strong>${me ? me.daysPlayed || 0 : (this.cloud.loggedIn ? 0 : '—')}</strong><small>Ngày đã bán</small></div>`;

    const loginCta = !data.loggedIn
      ? `<div class="rank-login-cta"><span>🔐 Bạn đang chơi với tư cách khách — đăng nhập để ghi tên lên bảng!</span><a href="index.html">Đăng nhập</a></div>`
      : '';
    const top = Array.isArray(data.top) ? data.top : [];
    if (top.length === 0) {
      list.innerHTML = loginCta + '<div class="rank-empty">🏪 Chưa có ai trên bảng xếp hạng.<br>Hoàn thành 1 ngày bán hàng để trở thành người đầu tiên!</div>';
      return;
    }
    const medals = ['🥇', '🥈', '🥉'];
    const row = (r, extra = '') => `
      <div class="rank-row global${r.rank <= 3 ? ' top' : ''}${r.isMe ? ' me' : ''}${extra}">
        <span class="rr-pos">${medals[r.rank - 1] || r.rank}</span>
        <span class="rr-player">
          ${r.picture ? `<img class="rr-avatar" src="${escapeHtml(r.picture)}" alt="" referrerpolicy="no-referrer" loading="lazy">` : '<span class="rr-avatar"><i class="fa-solid fa-user"></i></span>'}
          <span class="rr-name"><b>${escapeHtml(r.name)}${r.isMe ? '<span class="rr-me-tag">Bạn</span>' : ''}</b><small><span class="kaiti-font">第${Number(r.day) || 1}天</span>${r.achievedAt ? ` · ${new Date(r.achievedAt).toLocaleDateString('vi-VN')}` : ''}</small></span>
        </span>
        <span class="rr-earn">${Number(r.earnings).toFixed(1)} ¥</span>
        <span class="rr-served">🧋 ${r.served}/${r.total}${r.lost ? ` · 😠 ${r.lost}` : ''}</span>
        <span class="rr-avg">${r.served > 0 ? `${r.avg}%` : '—'}</span>
        <span class="rr-stars">${'⭐'.repeat(r.stars || 0)}${'☆'.repeat(3 - (r.stars || 0))}</span>
      </div>`;
    const meOutside = me && !top.some(r => r.isMe);
    list.innerHTML = loginCta + top.map(r => row(r)).join('') +
      (meOutside ? `<div class="rank-gap">⋮</div>${row(me, ' me-detached')}` : '');
  }

  // Các ngày bán hàng của chính mình (lưu trên máy + đồng bộ tài khoản)
  renderMyRank() {
    const list = document.getElementById('rank-list');
    const summary = document.getElementById('rank-summary');
    const note = document.getElementById('rank-note');
    // Đã đăng nhập: lịch sử các ngày bán lưu trong tài khoản; khách: chỉ ván đang chơi
    const fmtDate = (iso) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN'); };
    const source = this.cloud.loggedIn && Array.isArray(this.cloud.history)
      ? this.cloud.history.map(h => ({ ...h, date: h.date || fmtDate(h.playedAt) }))
      : this.records;
    if (note) note.textContent = this.cloud.loggedIn
      ? '☁️ Các ngày bán đã lưu trong tài khoản · Xếp theo doanh thu trong ngày'
      : 'Chỉ tính ván đang chơi (tải lại trang là ván mới) · Đăng nhập để lưu thành tích';
    const recs = [...source].filter(r => r && Number.isFinite(Number(r.earnings))).sort((a, b) => b.earnings - a.earnings);
    if (summary) {
      const totalEarn = recs.reduce((s, r) => s + Number(r.earnings), 0);
      const totalServed = recs.reduce((s, r) => s + (r.served || 0), 0);
      const totalStars = recs.reduce((s, r) => s + (r.stars || 0), 0);
      summary.innerHTML = `
        <div class="rs-item"><span>📅</span><strong>${recs.length}</strong><small>Ngày đã bán</small></div>
        <div class="rs-item"><span>🧋</span><strong>${totalServed}</strong><small>Ly đã giao</small></div>
        <div class="rs-item"><span>🪙</span><strong>${totalEarn.toFixed(0)} ¥</strong><small>Tổng doanh thu</small></div>
        <div class="rs-item"><span>⭐</span><strong>${totalStars}</strong><small>Tổng sao</small></div>`;
    }
    if (list) {
      if (recs.length === 0) {
        list.innerHTML = '<div class="rank-empty">🏪 Chưa có kỷ lục nào.<br>Hoàn thành ngày bán hàng đầu tiên để ghi tên lên bảng!</div>';
      } else {
        const medals = ['🥇', '🥈', '🥉'];
        list.innerHTML = recs.slice(0, 10).map((r, i) => `
          <div class="rank-row${i < 3 ? ' top' : ''}">
            <span class="rr-pos">${medals[i] || i + 1}</span>
            <span class="rr-day"><span class="kaiti-font">第${r.day}天</span><small>${r.date || ''}</small></span>
            <span class="rr-earn">${Number(r.earnings).toFixed(1)} ¥</span>
            <span class="rr-served">🧋 ${r.served}/${r.total}${r.lost ? ` · 😠 ${r.lost}` : ''}</span>
            <span class="rr-avg">${r.served > 0 ? `${r.avg}%` : '—'}</span>
            <span class="rr-stars">${'⭐'.repeat(r.stars || 0)}${'☆'.repeat(3 - (r.stars || 0))}</span>
          </div>`).join('');
      }
    }
  }

  startDay() {
    const total = this.mission ? this.mission.total : this.getCustomersPerDay();
    this.dayStats = { total, spawned: 0, served: 0, lost: 0, earnings: 0, scoreSum: 0 };
    this.dayEnded = false;
    this.nextArrivalAt = this.gameTime + 600; // khách đầu tiên đến gần như ngay lập tức
    this.renderCounter();
    this.renderRail();
    this.showToast('🌅', `第${this.day}天 · Mở cửa! Mục tiêu hôm nay: ${this.mission ? this.mission.target : '?'} ¥ từ ${total} khách.`);
  }

  tick() {
    const now = performance.now();
    const dt = Math.min(1000, now - this.lastTickAt);
    this.lastTickAt = now;
    if (this.isClockPaused() || !this.dayStats) return;
    this.gameTime += dt;

    // 1. Khách đến theo lịch (quán đầy thì khách sau đợi)
    if (this.dayStats.spawned < this.dayStats.total && this.gameTime >= this.nextArrivalAt) {
      if (this.tickets.length < QUEUE_RULES.maxInShop) {
        this.spawnArrival();
      } else {
        this.nextArrivalAt = this.gameTime + 3000;
      }
    }

    // 2. Hết kiên nhẫn -> khách bỏ về
    if (!this.relaxedMode) {
      this.tickets.slice().forEach(t => {
        if (this.patienceUsed(t) >= 1) this.loseCustomer(t);
      });
    }

    // 3. Cập nhật thanh kiên nhẫn (+ gợi ý mỗi giây, vd nhắc ghi phiếu khi khách sắp bỏ về)
    this.updatePatienceUI();
    this.guideTickCount = (this.guideTickCount || 0) + 1;
    if (this.guideTickCount % 5 === 0) this.updateGuide();

    // 4. Hết khách trong ngày -> tổng kết
    if (!this.dayEnded && !this.isServing && this.dayStats.spawned >= this.dayStats.total && this.tickets.length === 0) {
      this.dayEnded = true;
      this.showDaySummary();
    }
  }

  // Bốc khách tiếp theo (không trùng người đang có mặt trong quán)
  getNextCustomer() {
    const present = new Set(this.tickets.map(t => t.customer.id));
    for (let tries = 0; tries < PAPA_CUSTOMERS.length * 2; tries++) {
      if (!this.customerDeck || this.customerDeck.length === 0) {
        this.customerDeck = [...PAPA_CUSTOMERS].sort(() => Math.random() - 0.5);
      }
      const c = this.customerDeck.shift();
      if (!present.has(c.id)) return c;
    }
    return PAPA_CUSTOMERS[Math.floor(Math.random() * PAPA_CUSTOMERS.length)];
  }

  makeRandomOrder() {
    const teas = getOrderableTeas();
    return {
      tea: teas[Math.floor(Math.random() * teas.length)],
      topping: BOBA_VOCAB.toppings[Math.floor(Math.random() * BOBA_VOCAB.toppings.length)],
      sugar: BOBA_VOCAB.sugars[Math.floor(Math.random() * BOBA_VOCAB.sugars.length)],
      ice: BOBA_VOCAB.ices[Math.floor(Math.random() * BOBA_VOCAB.ices.length)]
    };
  }

  spawnArrival() {
    const isVeryFirst = this.ticketSeq === 0 && this.day === 1 && this.dayStats.spawned === 0;
    const customer = isVeryFirst ? PAPA_CUSTOMERS[0] : this.getNextCustomer();
    const order = isVeryFirst
      ? {
        tea: BOBA_VOCAB.teas.find(t => t.id === 'milktea'),
        topping: BOBA_VOCAB.toppings.find(t => t.id === 'boba'),
        sugar: BOBA_VOCAB.sugars.find(s => s.id === 'less_sugar'),
        ice: BOBA_VOCAB.ices.find(i => i.id === 'no_ice')
      }
      : this.makeRandomOrder();

    this.ticketSeq += 1;
    const ticket = {
      uid: `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      no: 100 + this.ticketSeq,
      customer,
      order,
      status: 'line',
      arrivedAt: this.gameTime,
      orderTakenAt: 0,
      lineMaxMs: QUEUE_RULES.lineMaxMs,
      drinkMaxMs: this.getDrinkMaxMs(),
      lineScore: 100,
      cup: null
    };
    this.tickets.push(ticket);
    this.dayStats.spawned += 1;
    this.nextArrivalAt = this.gameTime + this.getArrivalGapMs();
    this.saveGame();

    const lineLen = this.getLineTickets().length;
    if (lineLen > 1) {
      this.showToast('🛎️', `Khách mới: ${customer.nameChn} (${customer.nameVi}) đang xếp hàng (${lineLen} người)`);
    }
    this.renderCounter();
    this.renderRail();
    this.updateGuide();
  }

  // Ghi phiếu cho khách đứng đầu hàng
  takeOrder() {
    const t = this.getLineTickets()[0];
    if (!t) {
      this.showToast('ℹ️', 'Chưa có khách nào đang chờ ghi phiếu.');
      return;
    }
    // Tính điểm chờ giai đoạn xếp hàng TRƯỚC khi đổi trạng thái (patienceUsed phụ thuộc status)
    t.lineScore = this.waitPhaseScore(this.patienceUsed(t));
    t.status = 'waiting';
    t.orderTakenAt = this.gameTime;
    this.audio.playPop();

    // Chưa làm phiếu nào -> phiếu này thành phiếu đang làm (dùng luôn ly đang cầm)
    if (!this.activeTicket) {
      this.setActiveTicket(t.uid, { inheritSpare: true, silent: true });
    }

    this.showToast('📝', `已接单 #${t.no} ${t.customer.nameChn}: ${t.order.topping.hanzi}${t.order.tea.hanzi} · ${t.order.sugar.hanzi} · ${t.order.ice.hanzi}`);
    this.renderCounter();
    this.renderRail();
    this.updateAllCupVisuals();
  }

  // Chọn phiếu để làm (mỗi phiếu giữ ly riêng của nó)
  setActiveTicket(uid, opts = {}) {
    const t = this.tickets.find(x => x.uid === uid && x.status === 'waiting');
    if (!t) return;
    if (this.activeTicketId === uid && !opts.inheritSpare) return;

    this.stopPouring();
    this.stopShakerLoop();

    if (!t.cup) {
      if (opts.inheritSpare && !this.activeTicket) {
        t.cup = this.spareCup;
        this.spareCup = freshCup();
      } else {
        t.cup = freshCup();
      }
    }
    this.activeTicketId = uid;
    this.cup = t.cup;
    this.applyCupToUI();
    this.renderRail();
    this.renderCounter();
    if (!opts.silent) {
      this.audio.playPop();
      this.showToast('📌', `Đang làm phiếu #${t.no} · ${t.customer.nameChn} (${t.customer.nameVi})`);
    }
  }

  // Sau khi phiếu đang làm biến mất (giao xong / khách bỏ về): chuyển sang phiếu chờ lâu nhất
  activateNextWaiting() {
    const next = this.getWaitingTickets()[0];
    if (next) {
      this.setActiveTicket(next.uid, { silent: true });
    } else {
      this.activeTicketId = null;
      this.cup = this.spareCup;
      this.applyCupToUI();
    }
  }

  loseCustomer(t) {
    const wasActive = t.uid === this.activeTicketId;
    const wasAtCounter = this.getCounterTicket() === t;
    this.tickets = this.tickets.filter(x => x !== t);
    this.dayStats.lost += 1;

    this.audio.playTrash();
    const phase = t.status === 'line' ? 'chờ ghi phiếu' : 'chờ món';
    this.showToast('😠', `${t.customer.nameChn} (${t.customer.nameVi}) đã bỏ về vì ${phase} quá lâu! Mất khách.`);

    if (wasActive) this.activateNextWaiting();
    if (wasAtCounter) {
      this.playCustomerAnim('customer-leave');
      setTimeout(() => this.renderCounter(), 600);
    } else {
      this.renderCounter();
    }
    this.renderRail();
    this.updateGuide();
  }

  // ---------------------------------------------------------------------------
  // RENDER: khách ở quầy (cả Quầy Toàn Cảnh & Trạm Đón Khách)
  // ---------------------------------------------------------------------------
  renderCounter() {
    const ct = this.getCounterTicket();
    const views = [document.getElementById('view-master-counter'), document.getElementById('view-order-station')];
    views.forEach(v => v?.classList.toggle('counter-empty', !ct));

    // Khách trống quầy: báo thời gian khách tiếp theo
    const emptyText = this.getEmptyCounterText();
    document.querySelectorAll('.counter-empty-hint').forEach(el => { el.innerHTML = emptyText; });

    const takeBtns = [document.getElementById('btn-take-order-action'), document.getElementById('btn-master-take-order')];
    const nextBtn = document.getElementById('btn-goto-pour-from-order');
    const hint = document.getElementById('order-footer-hint');

    if (!ct) {
      this.counterUid = null;
      takeBtns.forEach(b => b && (b.style.display = 'none'));
      if (nextBtn) nextBtn.style.display = this.activeTicket ? 'flex' : 'none';
      if (hint) hint.innerHTML = emptyText;
      this.renderRecipeCards();
      return;
    }

    const changed = this.counterUid !== ct.uid;
    this.counterUid = ct.uid;
    const c = ct.customer;

    const masterCustImg = document.getElementById('master-customer-img');
    const stationCustImg = document.getElementById('customer-avatar-img');
    if (masterCustImg && c.image) masterCustImg.src = c.image;
    if (stationCustImg && c.image) stationCustImg.src = c.image;

    const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    setText('master-customer-name', c.nameChn);
    setText('master-customer-role', `(${c.nameVi})`);
    setText('customer-name-label', c.nameChn);
    setText('customer-role-label', `(${c.nameVi})`);

    const inLine = ct.status === 'line' && !this.servingTicket;
    takeBtns.forEach(b => b && (b.style.display = inLine ? 'flex' : 'none'));
    document.querySelectorAll('.counter-status-tag').forEach(el => {
      el.textContent = this.servingTicket ? '🧋 Nhận món' : (inLine ? '顾客点单 (Khách gọi món)' : `⏳ Chờ món · #${ct.no}`);
      el.classList.toggle('waiting', !inLine && !this.servingTicket);
    });

    if (nextBtn) nextBtn.style.display = !inLine && this.activeTicket ? 'flex' : 'none';
    if (hint) {
      const lineLen = this.getLineTickets().length;
      hint.innerHTML = inLine
        ? `💡 Bấm <strong>"接单 (Ghi Phiếu)"</strong> để nhận yêu cầu của khách.${lineLen > 1 ? ` <strong>Còn ${lineLen - 1} khách</strong> đang xếp hàng!` : ''}`
        : '✅ <strong>Đã ghi phiếu!</strong> Sang <strong>调制台 (Trạm Rót Trà)</strong> để pha chế, hoặc bấm phiếu khác trên thanh ray.';
    }

    this.updateSpeechBalloonUI();
    this.renderRecipeCards();
    this.updatePatienceUI();

    if (changed && !this.servingTicket) {
      this.playCustomerAnim('customer-enter');
      if (inLine) setTimeout(() => this.speakOrder(), 450);
    }
  }

  getEmptyCounterText() {
    if (!this.dayStats) return '🏪 Tiệm chưa mở cửa · Nhận nhiệm vụ rồi bấm <strong>开始营业</strong> để bắt đầu!';
    const left = this.dayStats.total - this.dayStats.spawned;
    if (left <= 0) {
      return this.tickets.length > 0
        ? '🧋 Hết khách mới hôm nay — hoàn thành nốt các phiếu đang chờ!'
        : '🌙 Đã hết khách hôm nay!';
    }
    const secs = Math.max(1, Math.ceil((this.nextArrivalAt - this.gameTime) / 1000));
    return `🚶 Chưa có khách ở quầy · Khách tiếp theo đến sau khoảng <strong>${secs}s</strong> (còn ${left} khách hôm nay)`;
  }

  // ---------------------------------------------------------------------------
  // RENDER: thanh ray phiếu order (nhiều phiếu) + thông tin ngày
  // ---------------------------------------------------------------------------
  renderRail() {
    const wrap = document.getElementById('rail-tickets');
    if (wrap) {
      const waiting = this.getWaitingTickets();
      if (waiting.length === 0) {
        wrap.innerHTML = '<span class="rail-empty">Chưa có phiếu · Ghi phiếu cho khách ở quầy trước nhé</span>';
      } else {
        wrap.innerHTML = waiting.map(t => `
          <button type="button" class="rail-ticket-chip${t.uid === this.activeTicketId ? ' active' : ''}" data-uid="${t.uid}"
            title="Bấm để làm phiếu này (mỗi phiếu có ly riêng)">
            <span class="chip-top">
              <span class="chip-no">#${t.no}</span>
              <span class="chip-name kaiti-font">${t.customer.emoji} ${t.customer.nameChn}</span>
              ${t.cup && !isCupEmpty(t.cup) ? '<span class="chip-cup" title="Ly đang làm dở">🧋</span>' : ''}
            </span>
            <span class="chip-order kaiti-font">${t.order.topping.hanzi}${t.order.tea.hanzi}·${t.order.sugar.hanzi}·${t.order.ice.hanzi}</span>
            <span class="patience-meter mini" data-uid="${t.uid}"><span class="patience-fill"></span></span>
          </button>
        `).join('');
        wrap.querySelectorAll('.rail-ticket-chip').forEach(chip => {
          chip.addEventListener('click', () => this.setActiveTicket(chip.dataset.uid));
        });
      }
    }

    const lineEl = document.getElementById('rail-line-count');
    if (lineEl) {
      const n = this.getLineTickets().length;
      lineEl.textContent = `👥 Xếp hàng: ${n}`;
      lineEl.classList.toggle('has-line', n > 0);
    }
    const dayEl = document.getElementById('rail-day-info');
    if (dayEl && this.dayStats) {
      dayEl.innerHTML = `<span class="kaiti-font">第${this.day}天</span> · Khách ${this.dayStats.served + this.dayStats.lost}/${this.dayStats.total}`;
    }
    // Tiến độ nhiệm vụ doanh thu
    const goalEl = document.getElementById('rail-goal-info');
    if (goalEl) {
      if (this.mission && this.dayStats) {
        const pct = Math.min(100, Math.round((this.dayStats.earnings / this.mission.target) * 100));
        goalEl.style.display = '';
        goalEl.classList.toggle('reached', this.dayStats.earnings >= this.mission.target);
        goalEl.innerHTML = `🎯 <span class="goal-val">${this.dayStats.earnings.toFixed(0)}/${this.mission.target} ¥</span><span class="goal-bar"><span style="width:${pct}%"></span></span>`;
      } else {
        goalEl.style.display = 'none';
      }
    }
    this.updatePatienceUI();
  }

  updatePatienceUI() {
    document.body.classList.toggle('relaxed-mode', this.relaxedMode);
    const paint = (meter, t) => {
      if (!meter || !t) return;
      const left = Math.max(0, 1 - this.patienceUsed(t));
      const fill = meter.querySelector('.patience-fill');
      if (fill) fill.style.width = `${Math.round(left * 100)}%`;
      meter.classList.toggle('mid', left <= 0.6 && left > 0.3);
      meter.classList.toggle('low', left <= 0.3);
      const mood = meter.parentElement?.querySelector('.patience-mood');
      if (mood) mood.textContent = left > 0.6 ? '😊' : (left > 0.3 ? '😐' : '😠');
    };

    document.querySelectorAll('.patience-meter[data-uid]').forEach(m => {
      paint(m, this.tickets.find(t => t.uid === m.dataset.uid));
    });
    const ct = this.getCounterTicket();
    document.querySelectorAll('.counter-patience').forEach(wrap => {
      const show = ct && !this.servingTicket && this.tickets.includes(ct);
      wrap.style.display = show ? '' : 'none';
      if (show) paint(wrap.querySelector('.patience-meter'), ct);
    });

    // Cập nhật đếm ngược khách tiếp theo khi quầy trống
    if (!ct) {
      const txt = this.getEmptyCounterText();
      document.querySelectorAll('.counter-empty-hint').forEach(el => { el.innerHTML = txt; });
      const hint = document.getElementById('order-footer-hint');
      if (hint) hint.innerHTML = txt;
    }
  }

  // Thẻ công thức ở trạm 2-4 + thanh ray: theo PHIẾU ĐANG LÀM
  renderRecipeCards() {
    const ord = this.activeTicket ? this.activeTicket.order : null;
    ['pour', 'shake', 'top'].forEach(s => {
      const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
      set(`wb-tea-${s}`, ord ? `${ord.topping.hanzi}${ord.tea.hanzi}` : '—');
      set(`wb-sugar-${s}`, ord ? `${ord.sugar.hanzi}(${ord.sugar.percent}%)` : '—');
      set(`wb-ice-${s}`, ord ? ord.ice.hanzi : '—');
      set(`wb-top-${s}`, ord ? ord.topping.hanzi : '—');
    });
    document.querySelectorAll('.workbench-recipe-card').forEach(card => card.classList.toggle('no-ticket', !ord));
  }

  showDaySummary() {
    const s = this.dayStats;
    const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    set('day-summary-title', `第${this.day}天 · Tổng kết ngày ${this.day}`);
    set('day-sum-served', `${s.served}/${s.total}`);
    set('day-sum-lost', `${s.lost}`);
    set('day-sum-earn', `${s.earnings.toFixed(2)} ¥`);
    set('day-sum-avg', s.served > 0 ? `${Math.round(s.scoreSum / s.served)}%` : '—');

    // Chấm nhiệm vụ ngày -> sao & tiền thưởng
    const goals = this.evaluateMission();
    const stars = goals.filter(g => g.done).length;
    const bonus = stars * MISSION_RULES.bonusPerStar;
    const mainDone = goals.length > 0 && goals[0].done;
    // Mỗi ngày chỉ thưởng 1 lần (chống cộng trùng nếu tổng kết bị gọi lại)
    if (bonus > 0 && this.mission && this.mission.rewardedBonus === undefined) {
      this.coins += bonus;
      this.updateHUD();
    }
    if (this.mission) this.mission.rewardedBonus = bonus;
    const box = document.getElementById('day-mission-results');
    if (box) {
      box.innerHTML = `
        <div class="mr-head">
          <span><span class="kaiti-font">今日任务</span> · Nhiệm vụ hôm nay</span>
          <span class="mr-stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</span>
        </div>
        ${goals.map(g => `
          <div class="mr-row ${g.done ? 'done' : 'fail'}">
            <span class="mr-check">${g.done ? '✅' : '❌'}</span>
            <span class="mr-text">${g.icon} ${g.text}</span>
            <span class="mr-val">${g.value}</span>
          </div>`).join('')}
        ${bonus > 0 ? `<div class="mr-bonus">🎁 Thưởng nhiệm vụ: <b>+${bonus} ¥</b></div>` : ''}`;
    }

    let msg;
    if (stars === 3) msg = '🏆 Ngày hoàn hảo! Hoàn thành tất cả nhiệm vụ!';
    else if (mainDone) msg = '🎉 Đạt mục tiêu doanh thu! Cố thêm để lấy đủ 3 ⭐ nhé!';
    else if (s.lost >= s.total / 2) msg = '😥 Mất nhiều khách quá, ngày mai cố nhanh tay hơn nhé!';
    else msg = '💪 Chưa đạt mục tiêu doanh thu, ngày mai cố gắng hơn nhé!';
    set('day-sum-msg', msg);

    // Lưu kỷ lục ngày vào bảng xếp hạng
    const now = new Date();
    this.records = this.records.filter(r => r.day !== this.day); // 1 kỷ lục / ngày
    this.records.push({
      day: this.day,
      earnings: Math.round(s.earnings * 100) / 100,
      served: s.served,
      total: s.total,
      lost: s.lost,
      avg: s.served > 0 ? Math.round(s.scoreSum / s.served) : 0,
      stars,
      date: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
    });
    this.records = this.records.sort((a, b) => b.earnings - a.earnings).slice(0, MISSION_RULES.maxRecords);
    const dayRecord = this.records.find(r => r.day === this.day);
    if (this.cloud.loggedIn) {
      this.pushDayResult(dayRecord);
    } else if (this.cloud.checked) {
      setTimeout(() => this.showToast('🔐', 'Đăng nhập ở trang chủ để lưu thành tích lên bảng xếp hạng toàn hệ thống!'), 1500);
    }

    const modal = document.getElementById('modal-day-summary');
    if (modal) modal.style.display = 'flex';
    this.audio.playCashRegister();
  }

  startNextDay() {
    const modal = document.getElementById('modal-day-summary');
    if (modal) modal.style.display = 'none';
    this.day += 1;
    this.dayStats = null;
    this.dayEnded = false;
    this.saveGame();
    this.renderCounter();
    this.renderRail();
    this.showMissionBriefing();
  }

  // Full-screen Ticket Zoom Modal (phiếu đang làm, nếu chưa có thì khách ở quầy)
  openTicketZoomModal() {
    const modal = document.getElementById('boba-ticket-zoom-modal');
    const t = this.activeTicket || this.getCounterTicket();
    if (!modal || !t) {
      this.showToast('ℹ️', 'Chưa có phiếu order nào.');
      return;
    }
    const ord = t.order;
    const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    set('zoom-cust-avatar', t.customer.emoji || '🙂');
    set('zoom-cust-name', `${t.customer.nameChn} (${t.customer.nameVi})`);
    set('zoom-order-code', `订单编号: #${t.no}${t.status === 'line' ? ' · (chưa ghi phiếu)' : ''}`);
    set('zoom-tea-chn', `${ord.topping.hanzi}${ord.tea.hanzi}`);
    set('zoom-tea-pin', ord.tea.pinyin);
    set('zoom-tea-vi', ord.tea.vi);
    set('zoom-sugar-chn', `${ord.sugar.hanzi} (${ord.sugar.percent}%)`);
    set('zoom-sugar-pin', ord.sugar.pinyin);
    set('zoom-sugar-vi', ord.sugar.vi);
    set('zoom-ice-chn', ord.ice.hanzi);
    set('zoom-ice-pin', ord.ice.pinyin);
    set('zoom-ice-vi', ord.ice.vi);
    set('zoom-top-chn', ord.topping.hanzi);
    set('zoom-top-pin', ord.topping.pinyin);
    set('zoom-top-vi', ord.topping.vi);
    this.zoomTicket = t;
    modal.style.display = 'flex';
    this.audio.playPop();
  }

  closeTicketZoomModal() {
    const modal = document.getElementById('boba-ticket-zoom-modal');
    if (modal) modal.style.display = 'none';
    this.audio.playPop();
  }

  updateHUD() {
    const coinEl = document.getElementById('hud-coin-val');
    if (coinEl) coinEl.textContent = `${this.coins} ¥`;

    const levelTag = document.getElementById('hud-level-tag');
    if (levelTag) levelTag.innerHTML = `<i class="fa-solid fa-store" style="color: #ea580c;"></i> Lv.${this.level}`;

    const fillEl = document.getElementById('hud-level-fill');
    const textEl = document.getElementById('hud-level-text');
    const pct = Math.min(100, Math.round((this.exp / 100) * 100));
    if (fillEl) fillEl.style.width = `${pct}%`;
    if (textEl) textEl.textContent = `${this.exp}/100`;

    const bookVal = document.getElementById('hud-book-val');
    if (bookVal) bookVal.textContent = `${this.learnedWords.size}/${BOBA_TOTAL_WORDS}`;

    const revEl = document.getElementById('clipboard-rev-val');
    if (revEl) revEl.textContent = `${this.coins} ¥`;

    const ordEl = document.getElementById('clipboard-order-val');
    if (ordEl) ordEl.textContent = this.completedOrders.toString();

    const wordsEl = document.getElementById('clipboard-words-val');
    if (wordsEl) wordsEl.textContent = this.learnedWords.size.toString();
  }

  // Bong bóng lời gọi món: theo KHÁCH ĐANG Ở QUẦY
  updateSpeechBalloonUI() {
    const ct = this.getCounterTicket();
    if (!ct) return;
    const ord = ct.order;

    // 1. Order Station Balloon
    const chnEl = document.getElementById('order-chinese-sentence');
    const pinEl = document.getElementById('order-pinyin-sentence');
    const viEl = document.getElementById('order-vietnamese-sentence');

    if (chnEl) {
      chnEl.innerHTML = `我要一杯<strong>${ord.topping.hanzi}${ord.tea.hanzi}</strong>，<span class="highlight-accent">${ord.sugar.hanzi} · ${ord.ice.hanzi}</span>。`;
    }

    if (pinEl) {
      pinEl.style.display = this.showPinyin ? 'block' : 'none';
      pinEl.textContent = `Wǒ yào yībēi ${ord.topping.pinyin} ${ord.tea.pinyin}, ${ord.sugar.pinyin}, ${ord.ice.pinyin}.`;
    }

    if (viEl) {
      viEl.style.display = this.showVietnamese ? 'block' : 'none';
      viEl.textContent = `(Cho tôi 1 ly ${ord.tea.vi.toLowerCase()} ${ord.topping.vi.toLowerCase()}, ${ord.sugar.vi.toLowerCase()}, ${ord.ice.vi.toLowerCase()})`;
    }

    // 2. Master Counter Balloon
    const mTea = document.getElementById('master-order-tea');
    const mSugIce = document.getElementById('master-order-sugar-ice');
    const mPin = document.getElementById('master-speech-pin');
    const mVi = document.getElementById('master-speech-vi');

    if (mTea) mTea.textContent = `${ord.topping.hanzi}${ord.tea.hanzi}`;
    if (mSugIce) mSugIce.textContent = `${ord.sugar.hanzi} · ${ord.ice.hanzi}`;
    if (mPin) {
      mPin.style.display = this.showPinyin ? '' : 'none';
      mPin.textContent = `Wǒ yào yībēi ${ord.topping.pinyin} ${ord.tea.pinyin}, ${ord.sugar.pinyin}, ${ord.ice.pinyin}.`;
    }
    if (mVi) {
      mVi.style.display = this.showVietnamese ? '' : 'none';
      mVi.textContent = `Cho tôi 1 ly ${ord.tea.vi.toLowerCase()} ${ord.topping.vi.toLowerCase()}, ${ord.sugar.vi.toLowerCase()}, ${ord.ice.vi.toLowerCase()}`;
    }
  }

  speakOrder() {
    const t = this.getCounterTicket() || this.activeTicket;
    if (!t) return;
    const ord = t.order;
    const sentence = `我要一杯${ord.topping.hanzi}${ord.tea.hanzi}，${ord.sugar.hanzi}，${ord.ice.hanzi}。`;
    this.audio.speak(sentence);
  }

  // Đọc phiếu trong cửa sổ phóng to
  speakZoomTicket() {
    const t = this.zoomTicket || this.activeTicket || this.getCounterTicket();
    if (!t) return;
    const ord = t.order;
    this.audio.speak(`我要一杯${ord.topping.hanzi}${ord.tea.hanzi}，${ord.sugar.hanzi}，${ord.ice.hanzi}。`);
  }

  // ==========================================================================
  // STATION 2: POUR STATION (HOLD TO POUR)
  // ==========================================================================
  startPouring(teaKey) {
    if (this.pourInterval) clearInterval(this.pourInterval);
    this.currentPouringTea = BOBA_VOCAB.teas.find(t => t.id === teaKey);
    this.cup.tea = this.currentPouringTea;

    // Visual liquid stream flow
    if (!this.currentPouringTea) return;
    document.querySelectorAll('.btn-spout-lever').forEach(b => b.classList.toggle('pouring', b.dataset.tea === teaKey));

    const stream = document.getElementById('liquid-stream-flow');
    if (stream) {
      stream.style.display = 'block';
      stream.style.background = this.currentPouringTea.color;
    }

    // Pour interval
    this.pourInterval = setInterval(() => {
      if (this.cup.pourLevel < 100) {
        this.cup.pourLevel += 2;
        this.updatePourCupUI();
        this.audio.playPour();
      }
    }, 60);
  }

  stopPouring() {
    if (this.pourInterval) {
      clearInterval(this.pourInterval);
      this.pourInterval = null;
    }
    const stream = document.getElementById('liquid-stream-flow');
    if (stream) stream.style.display = 'none';

    const wasPouring = document.querySelector('.btn-spout-lever.pouring');
    document.querySelectorAll('.btn-spout-lever').forEach(b => b.classList.remove('pouring'));
    if (wasPouring) this.updateGuide();
  }

  updatePourCupUI() {
    const liquid = document.getElementById('pour-cup-liquid');
    const meterVal = document.getElementById('pour-meter-val');
    const badge = document.getElementById('pour-meter-badge');

    if (liquid) {
      liquid.style.height = `${this.cup.pourLevel}%`;
      if (this.cup.tea) liquid.style.background = this.cup.tea.color;
    }

    if (meterVal) meterVal.textContent = `${this.cup.pourLevel}%`;

    if (badge) {
      if (this.cup.pourLevel === 0) {
        badge.textContent = 'Chưa rót';
        badge.style.color = '#64748b';
      } else if (this.cup.pourLevel >= 65 && this.cup.pourLevel <= 75) {
        badge.textContent = '🌟 Hoàn hảo (70%)';
        badge.style.color = '#10b981';
      } else if (this.cup.pourLevel < 65) {
        badge.textContent = 'Chưa đầy';
        badge.style.color = '#f59e0b';
      } else {
        badge.textContent = 'Hơi quá tay';
        badge.style.color = '#ef4444';
      }
    }
  }

  // ==========================================================================
  // STATION 3: MIX / SHAKE STATION
  // ==========================================================================
  toggleShaker() {
    const triggerBtn = document.getElementById('btn-shaker-trigger');
    const motorLight = document.getElementById('shaker-motor-light');
    const cupSlot = document.querySelector('.shaker-cup-slot');

    if (!this.shakerRunning) {
      // START SHAKER
      this.shakerRunning = true;
      if (triggerBtn) {
        triggerBtn.classList.add('running');
        triggerBtn.innerHTML = '<i class="fa-solid fa-stop"></i> <span>停止摇匀 (Dừng Lắc Đúng Lúc!)</span>';
      }
      if (motorLight) motorLight.classList.add('active');
      if (cupSlot) cupSlot.classList.add('vibrating');

      // Gauge needle animation
      this.shakerAngle = -70;
      this.shakerDirection = 1;
      this.shakerTimer = setInterval(() => {
        this.shakerAngle += 2.5 * this.shakerDirection;
        if (this.shakerAngle >= 75) {
          this.shakerDirection = -1;
        } else if (this.shakerAngle <= -75) {
          this.shakerDirection = 1;
        }
        this.updateShakerGaugeUI();
      }, 50);

      this.shakerSfxTimer = setInterval(() => {
        this.audio.playShakerSound();
      }, 180);
      this.updateGuide();

    } else {
      // STOP SHAKER
      this.stopShakerLoop();

      if (triggerBtn) {
        triggerBtn.classList.remove('running');
        triggerBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>摇匀完成 (Đã Lắc Xong!)</span>';
        triggerBtn.disabled = true;
      }
      if (motorLight) motorLight.classList.remove('active');
      if (cupSlot) cupSlot.classList.remove('vibrating');

      // Evaluate Shaker score
      // Green Zone: -15deg to +15deg
      const distance = Math.abs(this.shakerAngle);
      if (distance <= 15) {
        this.cup.shakeScore = 100;
      } else if (distance <= 35) {
        this.cup.shakeScore = 85;
      } else {
        this.cup.shakeScore = 70;
      }
      this.cup.isShaken = true;

      const statusText = document.getElementById('gauge-status-text');
      if (statusText) {
        statusText.innerHTML = `🌟 Độ lắc: <strong>${this.cup.shakeScore}%</strong> (${distance <= 15 ? 'Hoàn hảo!' : 'Đã lắc xong'})`;
        statusText.style.color = distance <= 15 ? '#10b981' : '#f59e0b';
      }

      this.audio.playPop();
      this.updateGuide();
    }
  }

  updateShakerGaugeUI() {
    const needle = document.getElementById('gauge-needle');
    if (needle) {
      needle.style.transform = `rotate(${this.shakerAngle}deg)`;
    }
    const statusText = document.getElementById('gauge-status-text');
    if (statusText) {
      if (Math.abs(this.shakerAngle) <= 15) {
        statusText.textContent = '🎯 VÙNG XANH HOÀN HẢO! BẤM DỪNG!';
        statusText.style.color = '#10b981';
      } else {
        statusText.textContent = 'Đang lắc đều trà sữa...';
        statusText.style.color = '#64748b';
      }
    }
  }

  // ==========================================================================
  // STATION 2 ACTIONS: DRAIN LIQUID, SUGAR & ICE TOGGLES
  // ==========================================================================
  drainLiquid() {
    if (this.cup.pourLevel === 0 && !this.cup.tea) return;
    this.cup.pourLevel = 0;
    this.cup.tea = null;
    this.updateAllCupVisuals();
    this.audio.playDrain();
    this.showToast('💧', '已倒空水杯！请按住龙头重新倒茶。(Đã đổ hết nước đi! Hãy rót lại.)');
  }

  toggleSugar(sId) {
    const sugar = BOBA_VOCAB.sugars.find(s => s.id === sId);
    if (!sugar) return;
    if (this.cup.sugar && this.cup.sugar.id === sId) {
      this.cup.sugar = null;
      this.audio.playUndo();
      this.showToast('🍬', '已取消选择糖度 (Đã bỏ chọn đường)');
    } else {
      this.cup.sugar = sugar;
      this.audio.playPop();
      this.showToast('🍬', `Chọn đường: ${sugar.hanzi} (${sugar.vi})`);
    }
    this.updateAllCupVisuals();
  }

  toggleIce(iId) {
    const ice = BOBA_VOCAB.ices.find(i => i.id === iId);
    if (!ice) return;
    if (this.cup.ice && this.cup.ice.id === iId) {
      this.cup.ice = null;
      this.audio.playUndo();
      this.showToast('❄️', '已取消选择冰量 (Đã bỏ chọn đá)');
    } else {
      this.cup.ice = ice;
      this.audio.playPop();
      this.showToast('🧊', `Chọn đá: ${ice.hanzi} (${ice.vi})`);
    }
    this.updateAllCupVisuals();
  }

  clearSugarIce() {
    this.cup.sugar = null;
    this.cup.ice = null;
    this.updateAllCupVisuals();
    this.audio.playUndo();
    this.showToast('✨', '重置糖度与冰量 (Đã xóa chọn đường và đá)');
  }

  // ==========================================================================
  // STATION 3 ACTIONS: SHAKER RESET
  // ==========================================================================
  // Dừng hẳn vòng lặp kim đồng hồ + âm thanh máy lắc
  stopShakerLoop() {
    if (this.shakerTimer) clearInterval(this.shakerTimer);
    if (this.shakerSfxTimer) clearInterval(this.shakerSfxTimer);
    this.shakerTimer = null;
    this.shakerSfxTimer = null;
    this.shakerRunning = false;
  }

  resetShaker() {
    this.stopShakerLoop();
    this.cup.isShaken = false;
    this.cup.shakeScore = 0;
    this.resetShakerUI();
    this.audio.playPop();
    this.updateGuide();
    this.showToast('🌪️', '重新安装摇杯，请看准绿区停机！(Đã reset máy lắc!)');
  }

  // Đưa máy lắc về trạng thái chờ (không phát âm thanh)
  resetShakerUI() {
    this.shakerAngle = -70;
    const triggerBtn = document.getElementById('btn-shaker-trigger');
    if (triggerBtn) {
      triggerBtn.disabled = false;
      triggerBtn.classList.remove('running');
      triggerBtn.innerHTML = '<i class="fa-solid fa-play"></i> <span>启动摇匀 (Bắt Đầu Lắc)</span>';
    }
    const needle = document.getElementById('gauge-needle');
    if (needle) needle.style.transform = 'rotate(-70deg)';
    const statusText = document.getElementById('gauge-status-text');
    if (statusText) {
      statusText.textContent = 'Chưa khởi động máy lắc';
      statusText.style.color = '#64748b';
    }
    const motorLight = document.getElementById('shaker-motor-light');
    if (motorLight) motorLight.classList.remove('active');
    const cupSlot = document.querySelector('.shaker-cup-slot');
    if (cupSlot) cupSlot.classList.remove('vibrating');
  }

  // ==========================================================================
  // STATION 4: TOP STATION (ADD / REMOVE TOPPINGS, LID, STRAW)
  // ==========================================================================
  // Báo ly đã đóng nắp (toast thay cho alert để không chặn màn hình)
  warnLidClosed() {
    this.audio.playUndo();
    this.showToast('🔒', '杯子已封口！请先【取下杯盖】。(Ly đã đóng nắp! Hãy tháo nắp trước khi sửa topping)');
  }

  addTopping(topId) {
    if (this.cup.hasLid) {
      this.warnLidClosed();
      return;
    }
    if (this.cup.toppings.length >= 6) {
      this.showToast('⚠️', '杯子配料已满，无法再加！(Ly đã đầy topping!)');
      return;
    }

    const topObj = BOBA_VOCAB.toppings.find(t => t.id === topId);
    if (topObj) {
      this.cup.toppings.push(topObj);
      this.audio.playPlop();
      this.updateAllCupVisuals();
      this.showToast(topObj.icon, `已添加配料: ${topObj.hanzi} (Đã thêm ${topObj.vi})`);
    }
  }

  removeTopping(index) {
    if (this.cup.hasLid) {
      this.warnLidClosed();
      return;
    }
    if (index >= 0 && index < this.cup.toppings.length) {
      const removed = this.cup.toppings.splice(index, 1)[0];
      this.audio.playUndo();
      this.updateAllCupVisuals();
      this.showToast('↩️', `已撤下: ${removed.hanzi} (Đã bớt ${removed.vi})`);
    }
  }

  undoLastTopping() {
    if (this.cup.hasLid) {
      this.warnLidClosed();
      return;
    }
    if (this.cup.toppings.length > 0) {
      this.removeTopping(this.cup.toppings.length - 1);
    } else {
      this.showToast('ℹ️', '杯中暂无配料可撤销 (Không có topping để bớt)');
    }
  }

  clearAllToppings() {
    if (this.cup.hasLid) {
      this.warnLidClosed();
      return;
    }
    if (this.cup.toppings.length === 0) return;
    this.cup.toppings = [];
    this.audio.playDrain();
    this.updateAllCupVisuals();
    this.showToast('🗑️', '已清空所有配料！(Đã xóa hết topping)');
  }

  updateToppingsUI() {
    // 1. Visual floating icons in cup preview
    const topLayer = document.getElementById('final-cup-toppings');
    if (topLayer) {
      topLayer.innerHTML = this.cup.toppings.map(t => `<span style="font-size:1.3rem;">${t.icon}</span>`).join(' ');
    }

    // 2. Interactive chips tray
    const tray = document.getElementById('added-toppings-tray');
    if (tray) {
      if (this.cup.toppings.length === 0) {
        tray.innerHTML = '<span class="empty-toppings-hint">Chưa có topping trong ly</span>';
      } else {
        tray.innerHTML = this.cup.toppings.map((t, idx) => `
          <div class="topping-in-cup-pill">
            <span>${t.icon}</span>
            <span class="kaiti-font">${t.hanzi}</span>
            <button type="button" class="btn-remove-this-top" data-idx="${idx}" title="Bớt topping này">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        `).join('');

        // Wire individual remove buttons
        tray.querySelectorAll('.btn-remove-this-top').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.idx, 10);
            this.removeTopping(idx);
          });
        });
      }
    }

    // 3. Status description
    const desc = document.getElementById('final-cup-status-desc');
    if (desc) {
      if (this.cup.toppings.length === 0) {
        desc.textContent = 'Chưa thêm topping';
      } else {
        desc.textContent = `Topping trong ly: ${this.cup.toppings.map(t => t.hanzi).join(' + ')}`;
      }
    }
  }

  sealLid() {
    this.cup.hasLid = true;
    this.audio.playPop();
    this.updateAllCupVisuals();

    const desc = document.getElementById('final-cup-status-desc');
    if (desc) desc.textContent = '✅ 已盖上杯盖封口！(Đã dập màng nắp ly chắc chắn)';
    this.showToast('🐻', '已封口杯盖！(Đã đóng nắp ly)');
  }

  removeLid() {
    this.cup.hasLid = false;
    this.audio.playUndo();
    this.updateAllCupVisuals();

    const desc = document.getElementById('final-cup-status-desc');
    if (desc) desc.textContent = '🔓 已取下杯盖，可自由加减配料！';
    this.showToast('🔓', '已取下杯盖，可自由修改配料！(Đã tháo nắp ra)');
  }

  insertStraw(color) {
    this.cup.strawColor = color;
    this.audio.playPop();
    this.updateAllCupVisuals();

    const desc = document.getElementById('final-cup-status-desc');
    if (desc) desc.textContent = '✨ 插入吸管完毕！(Đã cắm ống hút)';
    this.showToast('🥤', '已插入吸管！(Đã cắm ống hút)');
  }

  removeStraw() {
    if (!this.cup.strawColor) return;
    this.cup.strawColor = null;
    this.audio.playUndo();
    this.updateAllCupVisuals();

    const desc = document.getElementById('final-cup-status-desc');
    if (desc) desc.textContent = '已拔出吸管 (Đã rút ống hút ra)';
    this.showToast('🥤', '已拔出吸管 (Đã rút ống hút)');
  }

  // ==========================================================================
  // PAPA'S TRASH CAN: DISCARD RUINED CUP AND START FRESH
  // ==========================================================================
  // Hủy ly đang làm (bất cứ lúc nào, ở bất kỳ trạm/chế độ nào). Phiếu vẫn giữ, chỉ thay ly mới.
  trashCup(stationOrigin = 'pour') {
    if (this.isServing) return;
    if (isCupEmpty(this.cup)) {
      this.showToast('🫙', 'Ly đang trống, chưa có gì để hủy.');
      return;
    }
    this.audio.playTrash();
    this.resetCup();

    // Trigger open lid animation visual
    const trashUnit = document.getElementById(`trash-bin-${stationOrigin}`);
    if (trashUnit) {
      trashUnit.classList.add('drag-over');
      setTimeout(() => trashUnit.classList.remove('drag-over'), 600);
    }
    const hudTrash = document.getElementById('btn-hud-trash');
    if (hudTrash) {
      hudTrash.classList.remove('trash-pop');
      void hudTrash.offsetWidth;
      hudTrash.classList.add('trash-pop');
    }

    const t = this.activeTicket;
    this.showToast('🗑️', `已丢弃！Đã hủy ly${t ? ` của phiếu #${t.no}` : ''}, lấy ly mới làm lại.`);
    this.renderRail();

    // Hủy từ máy lắc / trạm topping -> quay về trạm rót để làm lại
    if (stationOrigin === 'shake' || stationOrigin === 'top') {
      setTimeout(() => {
        this.switchStation('view-pour-station');
      }, 700);
    }
  }

  showToast(icon, text) {
    const banner = document.getElementById('papa-toast-banner');
    const ic = document.getElementById('toast-icon');
    const tx = document.getElementById('toast-text');
    if (!banner || !ic || !tx) return;
    ic.textContent = icon;
    tx.textContent = text;
    banner.style.display = 'flex';
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      banner.style.display = 'none';
    }, 2400);
  }

  // ==========================================================================
  // SERVE & PAPA'S FREEZERIA SCORE CARD
  // ==========================================================================
  serveDrinkToCustomer() {
    if (this.isServing) return; // chống bấm giao món 2 lần
    const ticket = this.activeTicket;
    if (!ticket) {
      this.showToast('📝', this.getLineTickets().length > 0
        ? 'Chưa ghi phiếu! Bấm 接单 (Ghi phiếu) cho khách trước đã.'
        : 'Chưa có phiếu order nào để giao món.');
      return;
    }
    if (isCupEmpty(this.cup)) {
      this.showToast('🫙', 'Ly còn trống trơn, pha trà trước khi giao nhé!');
      return;
    }
    this.isServing = true;
    this.stopPouring();
    this.stopShakerLoop();
    if (!this.cup.hasLid) {
      this.cup.hasLid = true;
      this.cup.strawColor = '#f43f5e';
    }

    // Điểm chờ (Papa's Waiting score): 30% lúc chờ ghi phiếu + 70% lúc chờ món
    const drinkWaitScore = this.waitPhaseScore(this.patienceUsed(ticket));
    const waitScore = Math.round(ticket.lineScore * 0.3 + drinkWaitScore * 0.7);

    // Phiếu hoàn tất: rời thanh ray, khách ra quầy nhận món
    this.tickets = this.tickets.filter(x => x !== ticket);
    this.servingTicket = ticket;
    this.activeTicketId = null;
    this.spareCup = freshCup();
    this.renderCounter();
    this.renderRail();

    const wasMaster = (this.currentStation === 'view-master-counter');
    if (!wasMaster) {
      this.switchStation('view-order-station');
    }

    // Calculate Papa's Freezeria Criteria
    const ord = ticket.order;

    // 1. Order Match Accuracy (40%)
    let orderMatch = 100;
    if (!this.cup.tea || this.cup.tea.id !== ord.tea.id) orderMatch -= 40;

    // Check multi-toppings
    const reqTopId = ord.topping.id;
    const hasReqTop = this.cup.toppings.some(t => t.id === reqTopId);
    if (!hasReqTop) {
      orderMatch -= 30; // Missing requested topping
    } else {
      // Check for extraneous toppings
      const extraTops = this.cup.toppings.filter(t => t.id !== reqTopId);
      if (extraTops.length > 0) {
        orderMatch -= Math.min(15, extraTops.length * 5);
      }
    }

    if (!this.cup.sugar || this.cup.sugar.id !== ord.sugar.id) orderMatch -= 15;
    if (!this.cup.ice || this.cup.ice.id !== ord.ice.id) orderMatch -= 15;
    orderMatch = Math.max(30, orderMatch);

    // 2. Pour Station Accuracy (Level 70%)
    let pourScore = 100;
    const pourDiff = Math.abs(this.cup.pourLevel - 70);
    pourScore = Math.max(40, 100 - pourDiff * 2);

    // 3. Mix Station Accuracy
    const mixScore = this.cup.isShaken ? this.cup.shakeScore : 50;

    // 4. Top Station Accuracy
    let topScore = 100;
    if (this.cup.toppings.length === 0) topScore -= 40;
    if (!this.cup.hasLid) topScore -= 30;
    if (!this.cup.strawColor) topScore -= 30;
    topScore = Math.max(40, topScore);

    // Overall Score (đúng món 35% · rót 20% · lắc 15% · topping 15% · thời gian chờ 15%)
    const totalScore = Math.round((orderMatch * 0.35) + (pourScore * 0.2) + (mixScore * 0.15) + (topScore * 0.15) + (waitScore * 0.15));

    // Calculate Tip
    const basePrice = 18.00;
    const tip = parseFloat(((totalScore / 100) * 7.50).toFixed(2));
    const finalReceive = basePrice + tip;

    // Update stats
    this.coins += Math.round(finalReceive);
    this.exp += 25;
    if (this.exp >= 100) {
      this.level += 1;
      this.exp = 0;
    }
    this.completedOrders += 1;
    this.learnedWords.add(ord.tea.hanzi);
    this.learnedWords.add(ord.topping.hanzi);
    this.learnedWords.add(ord.sugar.hanzi);
    this.learnedWords.add(ord.ice.hanzi);
    if (this.dayStats) {
      this.dayStats.served += 1;
      this.dayStats.earnings += finalReceive;
      this.dayStats.scoreSum += totalScore;
    }
    this.renderRail(); // cập nhật tiến độ nhiệm vụ doanh thu

    this.updateHUD();
    this.saveGame();

    const barWait = document.getElementById('score-bar-wait');
    const valWait = document.getElementById('score-val-wait');
    if (barWait) barWait.style.width = `${waitScore}%`;
    if (valWait) valWait.textContent = `${waitScore}%`;
    const scoreTitle = document.getElementById('score-ticket-title');
    if (scoreTitle) scoreTitle.textContent = `#${ticket.no} · ${ticket.customer.nameChn} (${ticket.customer.nameVi})`;

    // Render Papa's Scorecard
    const barOrder = document.getElementById('score-bar-order');
    const valOrder = document.getElementById('score-val-order');
    if (barOrder) barOrder.style.width = `${orderMatch}%`;
    if (valOrder) valOrder.textContent = `${orderMatch}%`;

    const barPour = document.getElementById('score-bar-pour');
    const valPour = document.getElementById('score-val-pour');
    if (barPour) barPour.style.width = `${pourScore}%`;
    if (valPour) valPour.textContent = `${pourScore}%`;

    const barShake = document.getElementById('score-bar-shake');
    const valShake = document.getElementById('score-val-shake');
    if (barShake) barShake.style.width = `${mixScore}%`;
    if (valShake) valShake.textContent = `${mixScore}%`;

    const barTop = document.getElementById('score-bar-top');
    const valTop = document.getElementById('score-val-top');
    if (barTop) barTop.style.width = `${topScore}%`;
    if (valTop) valTop.textContent = `${topScore}%`;

    const valTotal = document.getElementById('score-val-total');
    if (valTotal) valTotal.textContent = `${totalScore}%`;

    const baseEl = document.getElementById('score-base-price');
    const tipEl = document.getElementById('score-tip-price');
    const finalEl = document.getElementById('score-final-receive');
    if (baseEl) baseEl.textContent = `${basePrice.toFixed(2)} ¥`;
    if (tipEl) tipEl.textContent = `+${tip.toFixed(2)} ¥`;
    if (finalEl) finalEl.textContent = `${finalReceive.toFixed(2)} ¥`;

    // Customer reaction text
    const reactChn = document.getElementById('score-reaction-chn');
    const reactVi = document.getElementById('score-reaction-vi');
    let reactionTextChn = '“太棒了！味道刚刚好，真是太好喝了！谢谢老板！”';
    let reactionTextVi = '(Ngon tuyệt cú mèo! Vị vừa vặn hoàn hảo, cảm ơn chủ quán!)';

    if (totalScore < 75) {
      reactionTextChn = '“嗯...味道有点奇怪，不过还是谢谢老板。”';
      reactionTextVi = '(Hơi lạ một chút, nhưng vẫn cảm ơn chủ quán nhé.)';
    } else if (waitScore < 70) {
      reactionTextChn = '“等了好久啊……不过很好喝，谢谢老板。”';
      reactionTextVi = '(Chờ lâu quá à… nhưng ngon lắm, cảm ơn chủ quán.)';
    }
    const reactAvatar = document.querySelector('.reaction-avatar');
    if (reactAvatar) reactAvatar.textContent = totalScore >= 90 ? '🥰' : (totalScore >= 75 ? '🙂' : '😕');

    if (reactChn) reactChn.textContent = reactionTextChn;
    if (reactVi) reactVi.textContent = reactionTextVi;

    // Khách nhận món: tiền bay lên -> khách rời quầy -> hiện bảng điểm
    // (Từ trạm khác quay về quầy: đợi lia máy quay xong ~400ms rồi mới cho tiền bay)
    this.updateGuide();
    this.audio.playCashRegister();
    const panDelay = wasMaster ? 0 : 400;
    setTimeout(() => this.floatCoins(finalReceive.toFixed(2)), panDelay);
    setTimeout(() => {
      this.audio.speak(reactionTextChn.replace(/“|”/g, ''));
    }, 600);
    setTimeout(() => this.playCustomerAnim('customer-leave'), panDelay + 550);
    setTimeout(() => {
      const modal = document.getElementById('modal-papa-score');
      if (modal) modal.style.display = 'flex';
    }, panDelay + 1050);
  }

  // Thay ly đang cầm bằng ly trống (ly thuộc phiếu đang làm, hoặc ly dự phòng)
  resetCup() {
    const cup = freshCup();
    const t = this.activeTicket;
    if (t) t.cup = cup;
    else this.spareCup = cup;
    this.cup = cup;
    this.applyCupToUI();
  }

  // Vẽ lại toàn bộ giao diện theo this.cup (dùng khi hủy ly hoặc đổi phiếu)
  applyCupToUI() {
    // Ly mới -> tắt vòi rót & máy lắc đang chạy (nếu có)
    this.stopPouring();
    this.stopShakerLoop();

    // Reset UI in Pour Station
    const liquid = document.getElementById('pour-cup-liquid');
    if (liquid) {
      liquid.style.height = '0%';
      liquid.style.background = 'linear-gradient(180deg, #e5a468 0%, #c47c38 100%)';
    }
    const meterVal = document.getElementById('pour-meter-val');
    if (meterVal) meterVal.textContent = '0%';
    const badge = document.getElementById('pour-meter-badge');
    if (badge) {
      badge.textContent = 'Chưa rót';
      badge.style.color = '#64748b';
    }
    document.querySelectorAll('.btn-opt-sugar, .btn-opt-ice').forEach(b => b.classList.remove('active'));

    // Reset UI in Shake Station
    const triggerBtn = document.getElementById('btn-shaker-trigger');
    if (triggerBtn) {
      triggerBtn.disabled = false;
      triggerBtn.classList.remove('running');
      triggerBtn.innerHTML = '<i class="fa-solid fa-play"></i> <span>启动摇匀 (Bắt Đầu Lắc)</span>';
    }
    const needle = document.getElementById('gauge-needle');
    if (needle) needle.style.transform = 'rotate(-70deg)';
    const statusText = document.getElementById('gauge-status-text');
    if (statusText) {
      statusText.textContent = 'Chưa khởi động máy lắc';
      statusText.style.color = '#64748b';
    }
    const motorLight = document.getElementById('shaker-motor-light');
    if (motorLight) motorLight.classList.remove('active');
    const cupSlot = document.querySelector('.shaker-cup-slot');
    if (cupSlot) cupSlot.classList.remove('vibrating');

    // Reset UI in Top Station
    document.querySelectorAll('.topping-tub-card').forEach(c => c.classList.remove('selected'));
    const finalTop = document.getElementById('final-cup-toppings');
    if (finalTop) finalTop.innerHTML = '';
    const tray = document.getElementById('added-toppings-tray');
    if (tray) tray.innerHTML = '<span class="empty-toppings-hint">Chưa có topping trong ly</span>';
    const finalLid = document.getElementById('final-cup-lid');
    if (finalLid) finalLid.style.display = 'none';
    const finalStraw = document.getElementById('final-cup-straw');
    if (finalStraw) finalStraw.style.display = 'none';
    const desc = document.getElementById('final-cup-status-desc');
    if (desc) desc.textContent = 'Chưa thêm topping';

    document.getElementById('btn-action-lid')?.style.setProperty('display', 'inline-flex');
    document.getElementById('btn-remove-lid')?.style.setProperty('display', 'none');
    document.querySelectorAll('.btn-m-sugar, .btn-m-ice').forEach(b => b.classList.remove('active'));

    // Ly đã lắc rồi (đổi sang phiếu có ly làm dở) -> hiện trạng thái đã lắc xong
    if (this.cup.isShaken) {
      if (triggerBtn) {
        triggerBtn.disabled = true;
        triggerBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>摇匀完成 (Đã Lắc Xong!)</span>';
      }
      if (statusText) {
        statusText.innerHTML = `🌟 Độ lắc: <strong>${this.cup.shakeScore}%</strong> (Đã lắc xong)`;
        statusText.style.color = this.cup.shakeScore >= 100 ? '#10b981' : '#f59e0b';
      }
    }
    this.updateAllCupVisuals();
  }

  // ==========================================================================
  // COOKBOOK VOCAB MODAL
  // ==========================================================================
  openCookbookModal() {
    const modal = document.getElementById('boba-cookbook-modal');
    const scroll = document.getElementById('cookbook-categories-scroll');
    if (!modal || !scroll) return;

    scroll.innerHTML = `
      <div class="cookbook-cat-block">
        <h4 class="cookbook-cat-title kaiti-font">🍵 茶饮底料 (Các Loại Trà)</h4>
        <div class="cookbook-items-grid">
          ${BOBA_VOCAB.teas.map(t => `
            <div class="cookbook-item-pill" onclick="window.bobaGame.audio.speak('${t.hanzi}')">
              <div>
                <strong class="kaiti-font" style="font-size:1.05rem;color:#7c2d12;">${t.hanzi}</strong>
                <div style="font-size:0.72rem;color:#ea580c;">${t.pinyin}</div>
                <div style="font-size:0.7rem;color:#64748b;">${t.vi}</div>
              </div>
              <i class="fa-solid fa-volume-high" style="color:#ea580c;"></i>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="cookbook-cat-block">
        <h4 class="cookbook-cat-title kaiti-font">🧋 经典配料 (Topping & Thạch)</h4>
        <div class="cookbook-items-grid">
          ${BOBA_VOCAB.toppings.map(tp => `
            <div class="cookbook-item-pill" onclick="window.bobaGame.audio.speak('${tp.hanzi}')">
              <div>
                <strong class="kaiti-font" style="font-size:1.05rem;color:#7c2d12;">${tp.icon} ${tp.hanzi}</strong>
                <div style="font-size:0.72rem;color:#ea580c;">${tp.pinyin}</div>
                <div style="font-size:0.7rem;color:#64748b;">${tp.vi}</div>
              </div>
              <i class="fa-solid fa-volume-high" style="color:#ea580c;"></i>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="cookbook-cat-block">
        <h4 class="cookbook-cat-title kaiti-font">🍬 糖度与冰量 (Đường & Đá)</h4>
        <div class="cookbook-items-grid">
          ${BOBA_VOCAB.sugars.map(s => `
            <div class="cookbook-item-pill" onclick="window.bobaGame.audio.speak('${s.hanzi}')">
              <div>
                <strong class="kaiti-font" style="font-size:1.05rem;color:#7c2d12;">${s.hanzi}</strong>
                <div style="font-size:0.72rem;color:#ea580c;">${s.pinyin}</div>
                <div style="font-size:0.7rem;color:#64748b;">${s.vi}</div>
              </div>
              <i class="fa-solid fa-volume-high" style="color:#ea580c;"></i>
            </div>
          `).join('')}
          ${BOBA_VOCAB.ices.map(i => `
            <div class="cookbook-item-pill" onclick="window.bobaGame.audio.speak('${i.hanzi}')">
              <div>
                <strong class="kaiti-font" style="font-size:1.05rem;color:#7c2d12;">${i.hanzi}</strong>
                <div style="font-size:0.72rem;color:#ea580c;">${i.pinyin}</div>
                <div style="font-size:0.7rem;color:#64748b;">${i.vi}</div>
              </div>
              <i class="fa-solid fa-volume-high" style="color:#ea580c;"></i>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }
}

// Khởi tạo game khi load trang (Hỗ trợ cả file:/// và server, chống duplicate run)
function initPapaBobaGame() {
  if (window.__boba_game_instance__) return;
  window.__boba_game_instance__ = new PapaBobaGame();
  window.bobaGame = window.__boba_game_instance__;
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initPapaBobaGame);
} else {
  initPapaBobaGame();
}
