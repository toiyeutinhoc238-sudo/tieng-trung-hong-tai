/**
 * Tiệm Tạp Hóa Của Tôi (我的小卖部 - Papa's Chinese Grocery)
 * Core Game Engine: Papa's Freezeria Station-Based Simulation System
 */

// ============================================================================
// 1. AUDIO SYNTHESIZER (WEB AUDIO API & TTS)
// ============================================================================
class PapaGroceryAudio {
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

  playPickItem() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.08);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playScanBeep() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, now); // A6 beep
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  playCoinClink() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [1800, 2400].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.03;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.13);
    });
  }

  playErrorBuzz() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.setValueAtTime(120, now + 0.15);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  speak(text) {
    if (!this.voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'zh-CN';
      utter.rate = 0.88;
      utter.pitch = 1.05;

      if (!this.cachedVoices || this.cachedVoices.length === 0) {
        this.cachedVoices = window.speechSynthesis.getVoices();
      }
      const zhVoice = this.cachedVoices.find(v => v.lang.includes('zh') || v.lang.includes('cmn'));
      if (zhVoice) utter.voice = zhVoice;

      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  }
}

// ============================================================================
// 2. ITEMS DATABASE
// ============================================================================
const GROCERY_ITEMS = [
  // 5 Gian hàng ban đầu
  {
    id: 'latiao',
    shelfIndex: 1,
    nameChn: '辣条',
    pinyin: 'làtiáo',
    nameVi: 'Que Cay Tứ Xuyên',
    quantifier: '包',
    quantifierVi: 'gói',
    cost: 1.00,
    price: 2.00,
    maxStock: 12,
    emoji: '🥢',
    category: 'snacks',
    unlocked: true,
    unlockCost: 0
  },
  {
    id: 'rabbit_candy',
    shelfIndex: 2,
    nameChn: '大白兔奶糖',
    pinyin: 'dàbáitù nǎitáng',
    nameVi: 'Kẹo Sữa Đại Bạch Thỏ',
    quantifier: '包',
    quantifierVi: 'gói',
    cost: 1.50,
    price: 3.00,
    maxStock: 10,
    emoji: '🍬',
    category: 'snacks',
    unlocked: true,
    unlockCost: 0
  },
  {
    id: 'iced_tea',
    shelfIndex: 3,
    nameChn: '冰红茶',
    pinyin: 'bīnghóngchá',
    nameVi: 'Trà Đỏ Lạnh Khang Sư Phụ',
    quantifier: '瓶',
    quantifierVi: 'chai',
    cost: 2.00,
    price: 3.50,
    maxStock: 8,
    emoji: '🧃',
    category: 'drinks',
    unlocked: true,
    unlockCost: 0
  },
  {
    id: 'instant_noodles',
    shelfIndex: 4,
    nameChn: '方便面',
    pinyin: 'fāngbiànmiàn',
    nameVi: 'Mì Ăn Liền Khang Sư Phụ',
    quantifier: '桶',
    quantifierVi: 'tô',
    cost: 3.00,
    price: 5.00,
    maxStock: 8,
    emoji: '🍜',
    category: 'snacks',
    unlocked: true,
    unlockCost: 0
  },
  {
    id: 'mimi_shrimp',
    shelfIndex: 5,
    nameChn: '咪咪虾条',
    pinyin: 'mīmī xiātiáo',
    nameVi: 'Snack Tôm MiMi',
    quantifier: '包',
    quantifierVi: 'gói',
    cost: 1.00,
    price: 2.00,
    maxStock: 12,
    emoji: '🦐',
    category: 'snacks',
    unlocked: true,
    unlockCost: 0
  },
  // Gian hàng mở rộng
  {
    id: 'wangzai_milk',
    shelfIndex: 6,
    nameChn: '旺仔牛奶',
    pinyin: 'wàngzǎi niúnǎi',
    nameVi: 'Sữa Lon Vượng Tử Wangzai',
    quantifier: '罐',
    quantifierVi: 'lon',
    cost: 3.50,
    price: 6.00,
    maxStock: 8,
    emoji: '🥛',
    category: 'drinks',
    unlocked: false,
    unlockCost: 45.00
  },
  {
    id: 'moyu_shuang',
    shelfIndex: 7,
    nameChn: '卫龙魔芋爽',
    pinyin: 'wèilóng móyùshuǎng',
    nameVi: 'Mực Chay Vệ Long',
    quantifier: '包',
    quantifierVi: 'gói',
    cost: 2.50,
    price: 4.50,
    maxStock: 10,
    emoji: '🌶️',
    category: 'snacks',
    unlocked: false,
    unlockCost: 75.00
  },
  {
    id: 'cola',
    shelfIndex: 8,
    nameChn: '快乐肥宅水',
    pinyin: 'kuàilè féizhǎishuǐ',
    nameVi: 'Nước Ngọt Có Ga Coca',
    quantifier: '瓶',
    quantifierVi: 'chai',
    cost: 2.00,
    price: 3.50,
    maxStock: 8,
    emoji: '🥤',
    category: 'drinks',
    unlocked: false,
    unlockCost: 110.00
  },
  {
    id: 'lays_chips',
    shelfIndex: 9,
    nameChn: '乐事薯片',
    pinyin: 'lèshì shǔpiàn',
    nameVi: 'Khoai Tây Chiên Lay\'s',
    quantifier: '包',
    quantifierVi: 'gói',
    cost: 4.50,
    price: 7.00,
    maxStock: 8,
    emoji: '🥔',
    category: 'snacks',
    unlocked: false,
    unlockCost: 150.00
  },
  {
    id: 'fruit_jelly',
    shelfIndex: 10,
    nameChn: '喜之郎果冻',
    pinyin: 'xǐzhīláng guǒdòng',
    nameVi: 'Thạch Hoa Quả Hỉ Chi Lang',
    quantifier: '袋',
    quantifierVi: 'túi',
    cost: 3.00,
    price: 5.00,
    maxStock: 10,
    emoji: '🍮',
    category: 'snacks',
    unlocked: false,
    unlockCost: 200.00
  },
  {
    id: 'sunflower_seeds',
    shelfIndex: 11,
    nameChn: '洽洽瓜子',
    pinyin: 'qiàqià guāzǐ',
    nameVi: 'Hạt Hướng Dương ChaCheer',
    quantifier: '包',
    quantifierVi: 'gói',
    cost: 3.50,
    price: 6.00,
    maxStock: 10,
    emoji: '🌻',
    category: 'snacks',
    unlocked: false,
    unlockCost: 260.00
  },
  {
    id: 'suanlafen',
    shelfIndex: 12,
    nameChn: '重庆酸辣粉',
    pinyin: 'chóngqìng suānlàfěn',
    nameVi: 'Miến Chua Cay Trùng Khánh',
    quantifier: '碗',
    quantifierVi: 'bát',
    cost: 5.00,
    price: 8.50,
    maxStock: 8,
    emoji: '🍲',
    category: 'snacks',
    unlocked: false,
    unlockCost: 330.00
  }
];

const GROCERY_CUSTOMERS = [
  { id: 'xiaohao', nameChn: '小浩', nameVi: 'Tiểu Hạo', role: 'Học sinh tiểu học', emoji: '👦' },
  { id: 'xiaoyu', nameChn: '小雨', nameVi: 'Bé Mưa', role: 'Bé gái hàng xóm', emoji: '👧' },
  { id: 'xiaotong', nameChn: '晓彤', nameVi: 'Hiểu Đồng', role: 'Nữ sinh trung học', emoji: '👩‍🎓' },
  { id: 'linjie', nameChn: '林姐', nameVi: 'Chị Lâm', role: 'Chị gái văn phòng', emoji: '👩‍💼' },
  { id: 'wangshu', nameChn: '王叔', nameVi: 'Chú Vương', role: 'Bác hàng xóm', emoji: '👨' },
  { id: 'abao', nameChn: '阿宝', nameVi: 'Gấu A Bảo', role: 'Linh vật đáng yêu', emoji: '🐼' }
];

const VOCAB_DATABASE = {
  snacks: [
    { chn: '辣条', pin: 'làtiáo', vi: 'Que cay Tứ Xuyên' },
    { chn: '大白兔奶糖', pin: 'dàbáitù nǎitáng', vi: 'Kẹo sữa Đại Bạch Thỏ' },
    { chn: '方便面', pin: 'fāngbiànmiàn', vi: 'Mì ăn liền' },
    { chn: '咪咪虾条', pin: 'mīmī xiātiáo', vi: 'Snack tôm MiMi' },
    { chn: '魔芋爽', pin: 'móyù shuǎng', vi: 'Mực chay ma dục sảng' },
    { chn: '薯片', pin: 'shǔpiàn', vi: 'Khoai tây chiên' }
  ],
  drinks: [
    { chn: '冰红茶', pin: 'bīnghóngchá', vi: 'Trà đỏ chanh lạnh' },
    { chn: '旺仔牛奶', pin: 'wàngzǎi niúnǎi', vi: 'Sữa lon Vượng Tử' },
    { chn: '可乐 / 肥宅水', pin: 'kělè / féizhǎishuǐ', vi: 'Nước ngọt Coca' }
  ],
  quantifiers: [
    { chn: '包', pin: 'bāo', vi: 'Gói, túi (nhỏ)' },
    { chn: '瓶', pin: 'píng', vi: 'Chai (nước)' },
    { chn: '罐 / 听', pin: 'guàn / tīng', vi: 'Lon (nước ngọt, sữa)' },
    { chn: '桶 / 碗', pin: 'tǒng / wǎn', vi: 'Tô, bát (mì)' }
  ],
  business: [
    { chn: '小卖部', pin: 'xiǎomàibù', vi: 'Tiệm tạp hóa nhỏ' },
    { chn: '货架', pin: 'huòjià', vi: 'Kệ trưng bày hàng' },
    { chn: '进货', pin: 'jìnhuò', vi: 'Nhập hàng hóa' },
    { chn: '找零', pin: 'zhǎolíng', vi: 'Thối tiền thừa' },
    { chn: '打烊', pin: 'dǎyàng', vi: 'Đóng cửa tiệm' }
  ]
};

// ============================================================================
// 3. MAIN PAPA'S GROCERY GAME ENGINE
// ============================================================================
class PapaGroceryGame {
  constructor() {
    this.audio = new PapaGroceryAudio();

    // Stats
    this.money = 50.00;
    this.day = 1;
    this.dayTimeMinutes = 8 * 60 + 30; // 08:30 sáng
    this.isDayActive = true;
    this.timerInterval = null;

    // Shelves
    this.shelves = JSON.parse(JSON.stringify(GROCERY_ITEMS));
    this.shelves.forEach(item => {
      item.currentStock = item.unlocked ? 6 : 0;
    });

    // Today stats
    this.todayRevenue = 0.00;
    this.todayCost = 0.00;
    this.todayCustomersServed = 0;
    this.changeCalculationsCount = 0;
    this.changeCalculationsCorrect = 0;
    this.learnedVocab = new Set(['辣条', '大白兔奶糖', '冰红茶', '找零', '包', '瓶']);

    // Stations: 'view-order-station', 'view-shelves-station', 'view-scan-station', 'view-change-station'
    this.currentStation = 'view-order-station';

    // Order & Shopping state
    this.currentCustomer = null;
    this.currentOrder = null;
    this.isOrderTaken = false;

    // Basket & Scanning
    this.basket = []; // [{ item, qty }]
    this.scannedItems = []; // queue of single items scanned

    // Change tray
    this.changeTray = [];

    // Settings
    this.showPinyin = true;
    this.showVietnamese = true;

    this.loadSave();
    this.initDOM();
    this.startDayClock();
    this.spawnNewCustomer();
  }

  loadSave() {
    try {
      const savedMoney = localStorage.getItem('grocery_money');
      if (savedMoney !== null) this.money = parseFloat(savedMoney);
      const savedDay = localStorage.getItem('grocery_day');
      if (savedDay !== null) this.day = parseInt(savedDay, 10);
      const savedShelves = localStorage.getItem('grocery_shelves');
      if (savedShelves) {
        const parsed = JSON.parse(savedShelves);
        parsed.forEach(p => {
          const target = this.shelves.find(s => s.id === p.id);
          if (target) {
            target.unlocked = p.unlocked;
            target.currentStock = p.currentStock;
          }
        });
      }
    } catch (e) {}
  }

  saveGame() {
    try {
      localStorage.setItem('grocery_money', this.money.toFixed(2));
      localStorage.setItem('grocery_day', this.day.toString());
      localStorage.setItem('grocery_shelves', JSON.stringify(this.shelves.map(s => ({
        id: s.id,
        unlocked: s.unlocked,
        currentStock: s.currentStock
      }))));
    } catch (e) {}
  }

  initDOM() {
    this.updateHUD();

    // Bottom Station Tab Switching
    document.querySelectorAll('.station-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        this.switchStation(target);
      });
    });

    // Navigation buttons
    document.getElementById('btn-goto-shelves-from-order')?.addEventListener('click', () => {
      this.switchStation('view-shelves-station');
    });
    document.getElementById('btn-back-to-order-from-shelves')?.addEventListener('click', () => {
      this.switchStation('view-order-station');
    });
    document.getElementById('btn-goto-scan')?.addEventListener('click', () => {
      this.prepareScanStation();
      this.switchStation('view-scan-station');
    });
    document.getElementById('btn-back-to-shelves-from-scan')?.addEventListener('click', () => {
      this.switchStation('view-shelves-station');
    });
    document.getElementById('btn-goto-change')?.addEventListener('click', () => {
      this.prepareChangeStation();
      this.switchStation('view-change-station');
    });
    document.getElementById('btn-back-to-scan')?.addEventListener('click', () => {
      this.switchStation('view-scan-station');
    });

    // Take Order Button
    document.getElementById('btn-take-order-action')?.addEventListener('click', () => {
      this.takeOrder();
    });

    // Replay speech
    document.getElementById('btn-replay-order-audio')?.addEventListener('click', () => {
      this.speakOrder();
    });

    // Ticket zoom
    document.getElementById('active-grocery-ticket')?.addEventListener('click', (e) => {
      e.currentTarget.classList.toggle('zoomed');
    });

    // Clear basket
    document.getElementById('btn-clear-basket-station')?.addEventListener('click', () => {
      this.clearBasket();
    });

    // Scan Button
    document.getElementById('btn-trigger-scanner')?.addEventListener('click', () => {
      this.scanNextItem();
    });

    // Denominations buttons in Change Station
    document.querySelectorAll('.btn-money-bill, .btn-money-coin').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseFloat(btn.dataset.val);
        this.addChangeToTray(val);
      });
    });

    // Reset tray
    document.getElementById('btn-reset-tray-action')?.addEventListener('click', () => {
      this.resetChangeTray();
    });

    // Confirm & Deliver in Change Station
    document.getElementById('btn-confirm-and-deliver')?.addEventListener('click', () => {
      this.verifyAndDeliverGoods();
    });

    // Scorecard continue
    document.getElementById('btn-next-customer-grocery')?.addEventListener('click', () => {
      document.getElementById('modal-grocery-score').style.display = 'none';
      this.spawnNewCustomer();
      this.switchStation('view-order-station');
    });

    // Early Close
    document.getElementById('btn-early-close')?.addEventListener('click', () => {
      this.triggerEarlyClose();
    });

    // Restock modal
    document.getElementById('btn-open-restock')?.addEventListener('click', () => this.openRestockModal());
    document.getElementById('btn-quick-restock-header')?.addEventListener('click', () => this.openRestockModal());
    document.getElementById('btn-autofill-all-stock')?.addEventListener('click', () => this.autofillAllStockInModal());
    document.getElementById('btn-confirm-restock-open')?.addEventListener('click', () => this.confirmRestockAndResume());

    // Unlock shelf
    document.getElementById('btn-unlock-shelf-header')?.addEventListener('click', () => this.openUnlockModal());

    // Vocab modal
    document.getElementById('btn-open-vocab')?.addEventListener('click', () => this.openVocabModal());
    document.querySelectorAll('.vocab-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.vocab-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderVocabCategory(btn.dataset.tab);
      });
    });

    // Day summary next day
    document.getElementById('btn-next-day-start')?.addEventListener('click', () => this.startNextDay());

    // Pause / Settings
    document.getElementById('btn-pause-game')?.addEventListener('click', () => {
      document.getElementById('modal-settings').style.display = 'flex';
    });
    document.getElementById('setting-sfx')?.addEventListener('change', (e) => {
      this.audio.sfxEnabled = e.target.checked;
    });
    document.getElementById('setting-voice')?.addEventListener('change', (e) => {
      this.audio.voiceEnabled = e.target.checked;
    });
    document.getElementById('setting-pinyin')?.addEventListener('change', (e) => {
      this.showPinyin = e.target.checked;
      this.updateSpeechBalloonUI();
    });
    document.getElementById('setting-vietnamese')?.addEventListener('change', (e) => {
      this.showVietnamese = e.target.checked;
      this.updateSpeechBalloonUI();
    });
    document.getElementById('btn-reset-save')?.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn chơi lại từ đầu không?')) {
        localStorage.clear();
        location.reload();
      }
    });

    // Mascot
    document.getElementById('hud-mascot-dragon')?.addEventListener('click', () => {
      this.audio.speak('生意兴隆，财源广进！加油！');
    });
  }

  switchStation(stationId) {
    this.currentStation = stationId;

    document.querySelectorAll('.grocery-station-view').forEach(view => {
      view.classList.remove('active');
    });
    const target = document.getElementById(stationId);
    if (target) target.classList.add('active');

    document.querySelectorAll('.station-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.target === stationId);
    });

    this.audio.playPickItem();
  }

  updateHUD() {
    const moneyEl = document.getElementById('hud-money-val');
    if (moneyEl) moneyEl.textContent = `${this.money.toFixed(2)} ¥`;

    const dayEl = document.getElementById('hud-day-val');
    if (dayEl) dayEl.textContent = `第 ${this.day} 天`;

    const vocabBadge = document.getElementById('hud-vocab-badge');
    if (vocabBadge) vocabBadge.textContent = `${this.learnedVocab.size}/25`;

    const revEl = document.getElementById('stats-rev-val');
    if (revEl) revEl.textContent = `${this.todayRevenue.toFixed(2)} ¥`;

    const custEl = document.getElementById('stats-cust-val');
    if (custEl) custEl.textContent = this.todayCustomersServed.toString();

    const wordsEl = document.getElementById('stats-words-val');
    if (wordsEl) wordsEl.textContent = this.learnedVocab.size.toString();

    this.updateClockUI();
  }

  startDayClock() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.isDayActive = true;
    this.timerInterval = setInterval(() => {
      if (!this.isDayActive) return;
      this.dayTimeMinutes += 10;
      this.updateClockUI();
      if (this.dayTimeMinutes >= 20 * 60) {
        this.finishDay(false);
      }
    }, 2500);
  }

  updateClockUI() {
    const hours = Math.floor(this.dayTimeMinutes / 60);
    const mins = this.dayTimeMinutes % 60;
    const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    const clockEl = document.getElementById('hud-clock-val');
    if (clockEl) clockEl.textContent = timeStr;

    const elapsed = Math.max(0, this.dayTimeMinutes - (8 * 60));
    const pct = Math.min(100, Math.round((elapsed / 720) * 100));
    const fillEl = document.getElementById('hud-time-fill');
    if (fillEl) fillEl.style.width = `${pct}%`;
  }

  // ==========================================================================
  // STATION 1: ORDER STATION
  // ==========================================================================
  spawnNewCustomer() {
    this.basket = [];
    this.scannedItems = [];
    this.changeTray = [];

    this.currentCustomer = GROCERY_CUSTOMERS[Math.floor(Math.random() * GROCERY_CUSTOMERS.length)];

    // Avatar
    const emojiVisual = document.querySelector('.customer-chibi-visual');
    const nameLabel = document.querySelector('#customer-name-badge .c-name');
    const roleLabel = document.querySelector('#customer-name-badge .c-role');
    if (emojiVisual) emojiVisual.innerHTML = `<span class="customer-emoji-avatar">${this.currentCustomer.emoji}</span>`;
    if (nameLabel) nameLabel.textContent = this.currentCustomer.nameChn;
    if (roleLabel) roleLabel.textContent = `(${this.currentCustomer.role})`;

    // Order items
    const availableItems = this.shelves.filter(s => s.unlocked && s.currentStock > 0);
    let chosen = [];

    if (availableItems.length === 0) {
      this.currentOrder = null;
      const chnEl = document.getElementById('order-chn-text');
      if (chnEl) chnEl.textContent = '老板，货架上没零食啦，快补货吧！';
      return;
    }

    const count = Math.min(availableItems.length, Math.random() > 0.4 ? 2 : 1);
    const shuffled = [...availableItems].sort(() => 0.5 - Math.random());
    for (let i = 0; i < count; i++) {
      const it = shuffled[i];
      const maxCanBuy = Math.min(it.currentStock, 2);
      const qty = Math.floor(Math.random() * maxCanBuy) + 1;
      chosen.push({ item: it, qty });
    }

    const dueAmount = chosen.reduce((sum, ci) => sum + ci.item.price * ci.qty, 0);

    // Paid Cash
    let paidAmount = dueAmount;
    const candidates = [1, 2, 5, 10, 20, 50, 100].filter(val => val >= dueAmount);
    if (candidates.length > 0) {
      paidAmount = candidates[Math.floor(Math.random() * Math.min(candidates.length, 3))];
    } else {
      paidAmount = Math.ceil(dueAmount / 10) * 10;
    }
    const changeNeeded = parseFloat((paidAmount - dueAmount).toFixed(2));

    this.currentOrder = {
      items: chosen,
      dueAmount,
      paidAmount,
      changeNeeded
    };

    this.isOrderTaken = false;

    // Reset ticket header
    const ticketCust = document.getElementById('ticket-header-name');
    if (ticketCust) ticketCust.textContent = this.currentCustomer.nameChn;

    // Ticket items list
    const ticketList = document.getElementById('ticket-items-list');
    if (ticketList) {
      ticketList.innerHTML = this.currentOrder.items.map(ci => {
        const qStr = ci.qty === 2 ? '两' : (ci.qty === 1 ? '一' : ci.qty.toString());
        return `
          <div class="ticket-item-row">
            <span class="t-emoji">${ci.item.emoji}</span>
            <strong class="t-name kaiti-font">${qStr}${ci.item.quantifier} ${ci.item.nameChn}</strong>
          </div>
        `;
      }).join('');
    }

    this.updateSpeechBalloonUI();

    const nextBtn = document.getElementById('btn-goto-shelves-from-order');
    if (nextBtn) nextBtn.style.display = 'none';

    setTimeout(() => {
      this.speakOrder();
    }, 400);

    this.renderShelvesGrid();
    this.renderBasketUI();
  }

  updateSpeechBalloonUI() {
    if (!this.currentOrder) return;
    const parts = this.currentOrder.items.map(ci => {
      const qtyStr = ci.qty === 2 ? '两' : (ci.qty === 1 ? '一' : ci.qty.toString());
      return `${qtyStr}${ci.item.quantifier}${ci.item.nameChn}`;
    });

    const chnEl = document.getElementById('order-chn-text');
    const pinEl = document.getElementById('order-pin-text');
    const viEl = document.getElementById('order-vi-text');

    if (chnEl) chnEl.textContent = `老板，我要${parts.join('和')}！`;
    if (pinEl) {
      pinEl.style.display = this.showPinyin ? 'block' : 'none';
      pinEl.textContent = `Lǎobǎn, wǒ yào ${this.currentOrder.items.map(ci => `${ci.qty === 2 ? 'liǎng' : 'yī'} ${ci.item.pinyin}`).join(' hé ')}!`;
    }
    if (viEl) {
      viEl.style.display = this.showVietnamese ? 'block' : 'none';
      viEl.textContent = `(Cho tôi ${this.currentOrder.items.map(ci => `${ci.qty} ${ci.item.quantifierVi} ${ci.item.nameVi.toLowerCase()}`).join(' và ')}!)`;
    }
  }

  speakOrder() {
    if (!this.currentOrder) return;
    const parts = this.currentOrder.items.map(ci => {
      const qtyStr = ci.qty === 2 ? '两' : (ci.qty === 1 ? '一' : ci.qty.toString());
      return `${qtyStr}${ci.item.quantifier}${ci.item.nameChn}`;
    });
    this.audio.speak(`老板，我要${parts.join('和')}！`);
  }

  takeOrder() {
    this.isOrderTaken = true;
    this.audio.playPickItem();

    const ticket = document.getElementById('active-grocery-ticket');
    if (ticket) {
      ticket.classList.add('zoomed');
      setTimeout(() => ticket.classList.remove('zoomed'), 1200);
    }

    const hint = document.getElementById('order-footer-hint');
    if (hint) {
      hint.innerHTML = '✅ <strong>Đã ghi phiếu mua hàng!</strong> Hãy chuyển sang <strong>货架区 (Kệ Hàng)</strong> để nhặt đồ vào giỏ!';
    }
    const nextBtn = document.getElementById('btn-goto-shelves-from-order');
    if (nextBtn) nextBtn.style.display = 'flex';
  }

  // ==========================================================================
  // STATION 2: SHELF STATION
  // ==========================================================================
  renderShelvesGrid() {
    const rack = document.getElementById('shelves-display-rack');
    if (!rack) return;
    rack.innerHTML = '';

    this.shelves.forEach(item => {
      if (item.unlocked) {
        const isOut = item.currentStock <= 0;
        const card = document.createElement('div');
        card.className = `shelf-prod-card ${isOut ? 'out-of-stock' : ''}`;
        card.innerHTML = `
          <span class="stock-tag ${item.currentStock <= 2 ? 'low' : ''}">
            ${item.currentStock > 0 ? `Còn ${item.currentStock}` : 'Hết'}
          </span>
          <div class="prod-visual">${item.emoji}</div>
          <div class="prod-info">
            <span class="prod-name-chn kaiti-font">${item.nameChn}</span>
            <span class="prod-pinyin">${item.pinyin}</span>
            <strong class="prod-price">${item.price.toFixed(2)} ¥</strong>
          </div>
        `;
        if (!isOut) {
          card.addEventListener('click', () => {
            this.pickItemToBasket(item);
          });
        }
        rack.appendChild(card);
      }
    });
  }

  pickItemToBasket(item) {
    if (item.currentStock <= 0) return;
    item.currentStock -= 1;
    this.audio.playPickItem();

    const existing = this.basket.find(b => b.item.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.basket.push({ item, qty: 1 });
    }

    this.learnedVocab.add(item.nameChn);
    this.learnedVocab.add(item.quantifier);

    this.renderShelvesGrid();
    this.renderBasketUI();
  }

  removeItemFromBasket(itemId) {
    const idx = this.basket.findIndex(b => b.item.id === itemId);
    if (idx === -1) return;
    const bItem = this.basket[idx];
    const shelfItem = this.shelves.find(s => s.id === itemId);
    if (shelfItem) shelfItem.currentStock += 1;

    bItem.qty -= 1;
    if (bItem.qty <= 0) this.basket.splice(idx, 1);

    this.audio.playPickItem();
    this.renderShelvesGrid();
    this.renderBasketUI();
  }

  clearBasket() {
    this.basket.forEach(b => {
      const shelfItem = this.shelves.find(s => s.id === b.item.id);
      if (shelfItem) shelfItem.currentStock += b.qty;
    });
    this.basket = [];
    this.renderShelvesGrid();
    this.renderBasketUI();
  }

  renderBasketUI() {
    const scroll = document.getElementById('basket-items-scroll');
    const countBadge = document.getElementById('basket-items-count-badge');
    const subtotalEl = document.getElementById('basket-subtotal-val');
    const statusEl = document.getElementById('basket-match-status');
    const gotoScanBtn = document.getElementById('btn-goto-scan');

    if (!scroll) return;

    if (this.basket.length === 0) {
      scroll.innerHTML = `
        <div class="basket-empty-hint">
          <i class="fa-solid fa-basket-shopping" style="font-size:2.5rem;opacity:0.4;"></i>
          <p>Chạm vào hàng hóa trên kệ gỗ để nhặt vào giỏ</p>
        </div>
      `;
      if (countBadge) countBadge.textContent = '0 món';
      if (subtotalEl) subtotalEl.textContent = '0.00 ¥';
      if (statusEl) {
        statusEl.className = 'basket-match-status';
        statusEl.textContent = '⚠️ Giỏ hàng đang rỗng!';
      }
      if (gotoScanBtn) gotoScanBtn.disabled = true;
      return;
    }

    let totalCount = 0;
    let subtotal = 0;
    scroll.innerHTML = '';

    this.basket.forEach(b => {
      totalCount += b.qty;
      subtotal += b.item.price * b.qty;

      const pill = document.createElement('div');
      pill.className = 'basket-row-pill';
      pill.innerHTML = `
        <div class="basket-row-left">
          <span class="em">${b.item.emoji}</span>
          <span class="txt kaiti-font">${b.item.nameChn}</span>
        </div>
        <div class="basket-row-right">
          <span class="qty">${b.item.price.toFixed(2)}¥ × ${b.qty}</span>
          <button type="button" class="btn-del-item" title="Bớt 1 món"><i class="fa-solid fa-circle-minus"></i></button>
        </div>
      `;
      pill.querySelector('.btn-del-item')?.addEventListener('click', () => {
        this.removeItemFromBasket(b.item.id);
      });
      scroll.appendChild(pill);
    });

    if (countBadge) countBadge.textContent = `${totalCount} món`;
    if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)} ¥`;

    const isMatch = this.isBasketMatchingOrder();
    if (statusEl) {
      if (isMatch) {
        statusEl.className = 'basket-match-status ready';
        statusEl.textContent = '✨ Đã nhặt đủ theo đơn! Có thể sang Quét Mã!';
      } else {
        statusEl.className = 'basket-match-status';
        statusEl.textContent = '⚠️ Nhặt chưa đúng món hoặc chưa đủ số lượng!';
      }
    }
    if (gotoScanBtn) gotoScanBtn.disabled = !isMatch;
  }

  isBasketMatchingOrder() {
    if (!this.currentOrder) return false;
    const ordItems = this.currentOrder.items;
    if (this.basket.length !== ordItems.length) return false;
    for (const oi of ordItems) {
      const inB = this.basket.find(b => b.item.id === oi.item.id);
      if (!inB || inB.qty !== oi.qty) return false;
    }
    return true;
  }

  // ==========================================================================
  // STATION 3: SCAN STATION
  // ==========================================================================
  prepareScanStation() {
    // Flatten basket into individual items queue
    this.scannedItems = [];
    this.basket.forEach(b => {
      for (let i = 0; i < b.qty; i++) {
        this.scannedItems.push({
          item: b.item,
          scanned: false,
          instanceId: `${b.item.id}_${i}`
        });
      }
    });

    this.renderConveyorBelt();
    this.updateScanPOS();
  }

  renderConveyorBelt() {
    const track = document.getElementById('conveyor-items-track');
    if (!track) return;
    track.innerHTML = '';

    this.scannedItems.forEach(si => {
      const card = document.createElement('div');
      card.className = `conveyor-item-card ${si.scanned ? 'scanned' : ''}`;
      card.innerHTML = `
        ${si.scanned ? '<span class="scanned-stamp">ĐÃ QUÉT</span>' : ''}
        <span style="font-size:2.2rem;">${si.item.emoji}</span>
        <strong class="kaiti-font" style="font-size:0.85rem;color:#7c2d12;margin-top:4px;">${si.item.nameChn}</strong>
        <span style="font-size:0.75rem;color:#ea580c;font-weight:800;">${si.item.price.toFixed(2)}¥</span>
      `;
      track.appendChild(card);
    });
  }

  scanNextItem() {
    const nextUnscanned = this.scannedItems.find(si => !si.scanned);
    if (!nextUnscanned) {
      alert('Tất cả sản phẩm đã được quét mã hoàn tất!');
      return;
    }

    nextUnscanned.scanned = true;
    this.audio.playScanBeep();

    this.renderConveyorBelt();
    this.updateScanPOS();
  }

  updateScanPOS() {
    const totalCount = this.scannedItems.length;
    const scannedCount = this.scannedItems.filter(si => si.scanned).length;

    const countEl = document.getElementById('scan-scanned-count');
    if (countEl) countEl.textContent = `${scannedCount} / ${totalCount}`;

    // Total due
    const scannedTotal = this.scannedItems
      .filter(si => si.scanned)
      .reduce((sum, si) => sum + si.item.price, 0);

    const dueEl = document.getElementById('scan-total-due');
    if (dueEl) dueEl.textContent = `${scannedTotal.toFixed(2)} ¥`;

    // Receipt Tape
    const linesEl = document.getElementById('receipt-items-lines');
    if (linesEl) {
      linesEl.innerHTML = this.scannedItems.filter(si => si.scanned).map(si => `
        <div style="display:flex;justify-content:space-between;">
          <span class="kaiti-font">${si.item.nameChn}</span>
          <strong>${si.item.price.toFixed(2)}¥</strong>
        </div>
      `).join('');
    }

    const receiptTotal = document.getElementById('receipt-total-num');
    if (receiptTotal) receiptTotal.textContent = `${scannedTotal.toFixed(2)} ¥`;

    const gotoChangeBtn = document.getElementById('btn-goto-change');
    if (gotoChangeBtn) {
      gotoChangeBtn.disabled = scannedCount < totalCount;
    }
  }

  // ==========================================================================
  // STATION 4: CHANGE STATION
  // ==========================================================================
  prepareChangeStation() {
    if (!this.currentOrder) return;
    const dueEl = document.getElementById('change-due-amount');
    const paidEl = document.getElementById('change-paid-amount');
    const neededEl = document.getElementById('change-needed-amount');
    const billRender = document.getElementById('customer-bill-render');

    if (dueEl) dueEl.textContent = `${this.currentOrder.dueAmount.toFixed(2)} ¥`;
    if (paidEl) paidEl.textContent = `${this.currentOrder.paidAmount.toFixed(2)} ¥`;
    if (neededEl) neededEl.textContent = `${this.currentOrder.changeNeeded.toFixed(2)} ¥`;

    if (billRender) {
      billRender.innerHTML = `<span class="bill-large-badge">💵 ${this.currentOrder.paidAmount.toFixed(2)} 元</span>`;
    }

    this.resetChangeTray();
  }

  addChangeToTray(val) {
    this.changeTray.push(val);
    this.audio.playCoinClink();
    this.renderChangeTrayUI();
  }

  removeChangeFromTray(index) {
    this.changeTray.splice(index, 1);
    this.audio.playCoinClink();
    this.renderChangeTrayUI();
  }

  resetChangeTray() {
    this.changeTray = [];
    this.renderChangeTrayUI();
  }

  renderChangeTrayUI() {
    const container = document.getElementById('tray-dropped-tokens');
    const sumEl = document.getElementById('tray-total-picked');
    if (!container) return;

    if (this.changeTray.length === 0) {
      container.innerHTML = '<span class="tray-placeholder">Chạm mệnh giá bên cạnh để nhặt tiền thối vào khay</span>';
      if (sumEl) sumEl.textContent = 'Đã nhặt: 0.00 ¥';
      return;
    }

    const sum = this.changeTray.reduce((s, v) => s + v, 0);
    if (sumEl) sumEl.textContent = `Đã nhặt: ${sum.toFixed(2)} ¥`;

    container.innerHTML = '';
    this.changeTray.forEach((val, idx) => {
      const token = document.createElement('div');
      if (val >= 1) {
        token.className = 'token-bill';
        token.innerHTML = `💵 ${val}元 <i class="fa-solid fa-xmark" style="font-size:0.6rem;opacity:0.6;"></i>`;
      } else {
        token.className = 'token-coin';
        token.innerHTML = `${val === 0.5 ? '5角' : '1角'}`;
      }
      token.title = 'Bấm để gỡ tờ này';
      token.addEventListener('click', () => this.removeChangeFromTray(idx));
      container.appendChild(token);
    });
  }

  verifyAndDeliverGoods() {
    if (!this.currentOrder) return;

    const traySum = parseFloat(this.changeTray.reduce((s, v) => s + v, 0).toFixed(2));
    const targetChange = this.currentOrder.changeNeeded;

    this.changeCalculationsCount += 1;

    if (Math.abs(traySum - targetChange) < 0.01) {
      // 100% CORRECT CHANGE!
      this.changeCalculationsCorrect += 1;

      // Calculate Scores
      const orderMatch = 100;
      const shelfScore = 98;
      const scanScore = 96;
      const changeScore = 100;
      const totalScore = Math.round((orderMatch + shelfScore + scanScore + changeScore) / 4);

      // Money & Tip
      const basePrice = this.currentOrder.dueAmount;
      const tip = parseFloat(((totalScore / 100) * 5.50).toFixed(2));
      const totalEarned = basePrice + tip;

      this.money += totalEarned;
      this.todayRevenue += basePrice;
      this.todayCustomersServed += 1;

      this.updateHUD();
      this.saveGame();

      // Render Scorecard
      const barOrd = document.getElementById('score-bar-order');
      const valOrd = document.getElementById('score-val-order');
      if (barOrd) barOrd.style.width = `${orderMatch}%`;
      if (valOrd) valOrd.textContent = `${orderMatch}%`;

      const barShelves = document.getElementById('score-bar-shelves');
      const valShelves = document.getElementById('score-val-shelves');
      if (barShelves) barShelves.style.width = `${shelfScore}%`;
      if (valShelves) valShelves.textContent = `${shelfScore}%`;

      const barScan = document.getElementById('score-bar-scan');
      const valScan = document.getElementById('score-val-scan');
      if (barScan) barScan.style.width = `${scanScore}%`;
      if (valScan) valScan.textContent = `${scanScore}%`;

      const barChange = document.getElementById('score-bar-change');
      const valChange = document.getElementById('score-val-change');
      if (barChange) barChange.style.width = `${changeScore}%`;
      if (valChange) valChange.textContent = `${changeScore}%`;

      const valTotal = document.getElementById('score-val-total');
      if (valTotal) valTotal.textContent = `${totalScore}%`;

      const baseEl = document.getElementById('score-base-price');
      const tipEl = document.getElementById('score-tip-price');
      const finalEl = document.getElementById('score-final-receive');
      if (baseEl) baseEl.textContent = `${basePrice.toFixed(2)} ¥`;
      if (tipEl) tipEl.textContent = `+${tip.toFixed(2)} ¥`;
      if (finalEl) finalEl.textContent = `${totalEarned.toFixed(2)} ¥`;

      const reactChn = document.getElementById('score-reaction-chn');
      const reactVi = document.getElementById('score-reaction-vi');
      const speechText = '老板服务真好，找零一分不差，谢谢您！';
      if (reactChn) reactChn.textContent = `“${speechText}”`;
      if (reactVi) reactVi.textContent = '(Chủ tiệm phục vụ chu đáo quá, thối tiền chuẩn từng đồng, cảm ơn nhé!)';

      const modal = document.getElementById('modal-grocery-score');
      if (modal) modal.style.display = 'flex';

      this.audio.playCashRegister();
      setTimeout(() => {
        this.audio.speak(speechText);
      }, 500);

    } else {
      this.audio.playErrorBuzz();
      this.audio.speak('老板，钱找错啦！');

      const diff = traySum - targetChange;
      let msg = '';
      if (diff > 0) {
        msg = `Thối THỪA tiền cho khách rồi! Khách chỉ cần thối ${targetChange.toFixed(2)}¥, bạn đang thối ${traySum.toFixed(2)}¥ (Thừa +${diff.toFixed(2)}¥).`;
      } else {
        msg = `Thối THIẾU tiền cho khách rồi! Khách cần thối ${targetChange.toFixed(2)}¥, bạn mới thối ${traySum.toFixed(2)}¥ (Thiếu ${Math.abs(diff).toFixed(2)}¥).`;
      }
      alert(`⚠️ ${msg}\nHãy xếp lại tiền cho chuẩn xác nhé!`);
    }
  }

  // ==========================================================================
  // DAY CYCLE & MODALS
  // ==========================================================================
  triggerEarlyClose() {
    if (!this.isDayActive) return;
    if (confirm('Bạn có muốn đóng cửa sớm để tổng kết doanh thu và sang ngày mới không?')) {
      this.finishDay(true);
    }
  }

  finishDay(isEarlyClose = false) {
    this.isDayActive = false;
    if (this.timerInterval) clearInterval(this.timerInterval);

    const profit = this.todayRevenue - this.todayCost;
    const accuracy = this.changeCalculationsCount > 0
      ? Math.round((this.changeCalculationsCorrect / this.changeCalculationsCount) * 100)
      : 100;

    const titleEl = document.getElementById('summary-day-title');
    if (titleEl) titleEl.textContent = `第 ${this.day} 天 · 每日营业结算`;

    const revEl = document.getElementById('summary-revenue-val');
    if (revEl) revEl.textContent = `${this.todayRevenue.toFixed(2)} ¥`;

    const costEl = document.getElementById('summary-cost-val');
    if (costEl) costEl.textContent = `${this.todayCost.toFixed(2)} ¥`;

    const profitEl = document.getElementById('summary-profit-val');
    if (profitEl) {
      profitEl.textContent = `${profit >= 0 ? '+' : ''}${profit.toFixed(2)} ¥`;
      profitEl.className = profit >= 0 ? 'value text-emerald' : 'value text-rose';
    }

    const custEl = document.getElementById('summary-customers-val');
    if (custEl) custEl.textContent = `${this.todayCustomersServed} người`;

    const accEl = document.getElementById('summary-accuracy-val');
    if (accEl) accEl.textContent = `${accuracy}%`;

    const wordsEl = document.getElementById('summary-words-val');
    if (wordsEl) wordsEl.textContent = `${this.learnedVocab.size} từ`;

    const modal = document.getElementById('modal-day-summary');
    if (modal) modal.style.display = 'flex';

    this.audio.playCashRegister();
  }

  startNextDay() {
    document.getElementById('modal-day-summary').style.display = 'none';
    this.day += 1;
    this.dayTimeMinutes = 8 * 60 + 30;
    this.todayRevenue = 0.00;
    this.todayCost = 0.00;
    this.todayCustomersServed = 0;
    this.changeCalculationsCount = 0;
    this.changeCalculationsCorrect = 0;

    this.updateHUD();
    this.saveGame();
    this.openRestockModal();
  }

  // RESTOCK MODAL
  openRestockModal() {
    const modal = document.getElementById('modal-restock');
    if (!modal) return;
    this.renderRestockTable();
    this.updateRestockModalCalculations();
    modal.style.display = 'flex';
  }

  closeRestockModal() {
    const modal = document.getElementById('modal-restock');
    if (modal) modal.style.display = 'none';
  }

  renderRestockTable() {
    const tbody = document.getElementById('stock-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    this.shelves.filter(s => s.unlocked).forEach(item => {
      const tr = document.createElement('tr');
      const maxCanAdd = item.maxStock - item.currentStock;

      tr.innerHTML = `
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:1.4rem;">${item.emoji}</span>
            <div>
              <strong class="kaiti-font" style="font-size:0.95rem;color:#7c2d12;">${item.nameChn}</strong>
              <div style="font-size:0.68rem;color:#64748b;">${item.pinyin} (${item.nameVi})</div>
            </div>
          </div>
        </td>
        <td><strong>${item.currentStock}</strong> / ${item.maxStock} ${item.quantifier}</td>
        <td style="color:#e11d48;font-weight:700;">${item.cost.toFixed(2)} ¥</td>
        <td style="color:#059669;font-weight:700;">${item.price.toFixed(2)} ¥</td>
        <td>
          <input type="number" class="stock-input-qty" id="stock-in-${item.id}"
            min="0" max="${maxCanAdd}" value="0">
        </td>
        <td id="stock-row-cost-${item.id}" style="font-weight:800;color:#ea580c;">0.00 ¥</td>
      `;

      const input = tr.querySelector('.stock-input-qty');
      input?.addEventListener('input', () => {
        let val = parseInt(input.value, 10) || 0;
        if (val < 0) val = 0;
        if (val > maxCanAdd) val = maxCanAdd;
        input.value = val;

        const rowCost = val * item.cost;
        const cell = document.getElementById(`stock-row-cost-${item.id}`);
        if (cell) cell.textContent = `${rowCost.toFixed(2)} ¥`;

        this.updateRestockModalCalculations();
      });

      tbody.appendChild(tr);
    });
  }

  autofillAllStockInModal() {
    let avail = this.money;
    this.shelves.filter(s => s.unlocked).forEach(item => {
      const input = document.getElementById(`stock-in-${item.id}`);
      if (!input) return;
      const needed = item.maxStock - item.currentStock;
      const affordable = Math.floor(avail / item.cost);
      const toAdd = Math.min(needed, affordable);

      input.value = toAdd;
      avail -= toAdd * item.cost;

      const cell = document.getElementById(`stock-row-cost-${item.id}`);
      if (cell) cell.textContent = `${(toAdd * item.cost).toFixed(2)} ¥`;
    });
    this.updateRestockModalCalculations();
  }

  updateRestockModalCalculations() {
    let totalCost = 0;
    this.shelves.filter(s => s.unlocked).forEach(item => {
      const input = document.getElementById(`stock-in-${item.id}`);
      const qty = parseInt(input?.value, 10) || 0;
      totalCost += qty * item.cost;
    });

    const curBal = document.getElementById('modal-stock-current-bal');
    const costEl = document.getElementById('modal-stock-total-cost');
    const remBal = document.getElementById('modal-stock-remaining-bal');

    if (curBal) curBal.textContent = `${this.money.toFixed(2)} ¥`;
    if (costEl) costEl.textContent = `${totalCost.toFixed(2)} ¥`;
    if (remBal) {
      const rem = this.money - totalCost;
      remBal.textContent = `${rem.toFixed(2)} ¥`;
      remBal.className = rem >= 0 ? 'text-emerald' : 'text-rose';
    }

    const confirmBtn = document.getElementById('btn-confirm-restock-open');
    if (confirmBtn) confirmBtn.disabled = (this.money - totalCost) < 0;
  }

  confirmRestockAndResume() {
    let totalCost = 0;
    const additions = [];

    this.shelves.filter(s => s.unlocked).forEach(item => {
      const input = document.getElementById(`stock-in-${item.id}`);
      const qty = parseInt(input?.value, 10) || 0;
      if (qty > 0) {
        totalCost += qty * item.cost;
        additions.push({ item, qty });
      }
    });

    if (totalCost > this.money) {
      alert('Vốn không đủ để nhập số lượng này!');
      return;
    }

    this.money -= totalCost;
    this.todayCost += totalCost;
    additions.forEach(add => { add.item.currentStock += add.qty; });

    this.closeRestockModal();
    this.updateHUD();
    this.renderShelvesGrid();
    this.saveGame();
    this.audio.playCashRegister();

    this.startDayClock();
    this.spawnNewCustomer();
  }

  // UNLOCK SHELF MODAL
  openUnlockModal() {
    const modal = document.getElementById('modal-unlock-shelf');
    const list = document.getElementById('unlock-shelves-list');
    if (!modal || !list) return;

    list.innerHTML = '';
    const locked = this.shelves.filter(s => !s.unlocked);

    if (locked.length === 0) {
      list.innerHTML = `
        <div style="text-align:center;padding:24px;color:#059669;font-weight:800;">
          <i class="fa-solid fa-crown" style="font-size:2rem;margin-bottom:8px;"></i>
          <p>Chúc mừng! Toàn bộ gian hàng đã được mở khóa!</p>
        </div>
      `;
      modal.style.display = 'flex';
      return;
    }

    locked.forEach(item => {
      const canAfford = this.money >= item.unlockCost;
      const row = document.createElement('div');
      row.className = 'unlock-shelf-row';
      row.innerHTML = `
        <div class="unlock-shelf-info">
          <span class="shelf-preview-icon">${item.emoji}</span>
          <div>
            <strong class="shelf-title-chn kaiti-font">Kệ ${item.shelfIndex}: ${item.nameChn}</strong>
            <div class="shelf-desc-vi">Giá bán: ${item.price.toFixed(2)}¥ · Lợi nhuận cao</div>
          </div>
        </div>
        <button type="button" class="btn-modal-primary" ${canAfford ? '' : 'disabled'}
          style="${canAfford ? '' : 'background:#cbd5e1;cursor:not-allowed;'}">
          ${canAfford ? `Mở Khóa (${item.unlockCost.toFixed(2)} ¥)` : `Thiếu (${item.unlockCost.toFixed(2)} ¥)`}
        </button>
      `;
      row.querySelector('button')?.addEventListener('click', () => {
        if (canAfford) {
          this.money -= item.unlockCost;
          item.unlocked = true;
          item.currentStock = 4;
          this.learnedVocab.add(item.nameChn);
          this.updateHUD();
          this.renderShelvesGrid();
          this.saveGame();
          modal.style.display = 'none';
          this.audio.playCashRegister();
          alert(`🎉 Chúc mừng! Đã mở khóa Kệ ${item.shelfIndex}: ${item.nameChn}!`);
        }
      });
      list.appendChild(row);
    });

    modal.style.display = 'flex';
  }

  // VOCAB MODAL
  openVocabModal() {
    const modal = document.getElementById('modal-vocab');
    if (!modal) return;
    this.renderVocabCategory('snacks');
    modal.style.display = 'flex';
  }

  renderVocabCategory(cat) {
    const grid = document.getElementById('vocab-items-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const list = VOCAB_DATABASE[cat] || [];
    list.forEach(v => {
      const card = document.createElement('div');
      card.className = 'vocab-card';
      card.innerHTML = `
        <div>
          <span class="vocab-chn kaiti-font">${v.chn}</span>
          <div class="vocab-pin">${v.pin}</div>
          <div class="vocab-vi">${v.vi}</div>
        </div>
        <button type="button" class="btn-vocab-audio" title="Nghe phát âm">
          <i class="fa-solid fa-volume-high"></i>
        </button>
      `;
      card.querySelector('.btn-vocab-audio')?.addEventListener('click', () => {
        this.audio.speak(v.chn);
      });
      grid.appendChild(card);
    });
  }
}

// Khởi tạo game khi load trang
window.addEventListener('DOMContentLoaded', () => {
  window.groceryGame = new PapaGroceryGame();
});
