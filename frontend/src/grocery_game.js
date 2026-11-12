/**
 * Tiệm Tạp Hóa Của Tôi (我的小卖部 - My Chinese Grocery Store)
 * Core Game Engine & Simulation System
 */

// ============================================================================
// 1. AUDIO SYNTHESIZER (ZERO-LATENCY WEB AUDIO API & TTS)
// ============================================================================
class GroceryAudio {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.voiceEnabled = true;
    this.cachedVoices = [];

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        try {
          this.cachedVoices = window.speechSynthesis.getVoices();
        } catch (e) {}
      };
      try {
        this.cachedVoices = window.speechSynthesis.getVoices();
      } catch (e) {}
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

  // Tiếng leng keng chuông thu ngân khi nhận tiền đúng
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

  // Tiếng nhặt món hàng vào giỏ
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

  // Tiếng thả tiền vào khay thối
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

  // Tiếng sai tiền thối
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

  // Phát âm giọng đọc tiếng Trung
  speak(text) {
    if (!this.voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'zh-CN';
      utter.rate = 0.88; // Tốc độ vừa phải cho người học
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
// 2. ITEMS DATABASE (DANH MỤC HÀNG HÓA TẠP HÓA TUỔI THƠ TRUNG HOA)
// ============================================================================
const GROCERY_ITEMS = [
  // 5 Gian hàng ban đầu (Kệ 1 -> Kệ 5)
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

  // Các Gian Hàng Mở Rộng Tiếp Theo (Kệ 6 -> Kệ 12)
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

// Khách hàng Anime 3D
const GROCERY_CUSTOMERS = [
  { id: 'xiaohao', nameChn: '小浩', nameVi: 'Tiểu Hạo', role: 'Học sinh tiểu học', emoji: '👦', greeting: '老板好！我要买点零食。' },
  { id: 'xiaoyu', nameChn: '小雨', nameVi: 'Bé Mưa', role: 'Bé gái hàng xóm', emoji: '👧', greeting: '老板，请给我拿这些！' },
  { id: 'xiaotong', nameChn: '晓彤', nameVi: 'Hiểu Đồng', role: 'Nữ sinh trung học', emoji: '👩‍🎓', greeting: '你好老板，我想买这个。' },
  { id: 'linjie', nameChn: '林姐', nameVi: 'Chị Lâm', role: 'Chị gái văn phòng', emoji: '👩‍💼', greeting: '下班了，买点喝的！' },
  { id: 'wangshu', nameChn: '王叔', nameVi: 'Chú Vương', role: 'Bác hàng xóm', emoji: '👨', greeting: '老板，今天有什么新鲜好吃的？' },
  { id: 'abao', nameChn: '阿宝', nameVi: 'Gấu A Bảo', role: 'Linh vật đáng yêu', emoji: '🐼', greeting: '我要好多好吃的，谢谢老板！' }
];

// Danh mục từ vựng tạp hóa
const VOCAB_DATABASE = {
  snacks: [
    { chn: '辣条', pin: 'làtiáo', vi: 'Que cay Tứ Xuyên' },
    { chn: '大白兔奶糖', pin: 'dàbáitù nǎitáng', vi: 'Kẹo sữa Đại Bạch Thỏ' },
    { chn: '方便面', pin: 'fāngbiànmiàn', vi: 'Mì ăn liền' },
    { chn: '咪咪虾条', pin: 'mīmī xiātiáo', vi: 'Snack tôm MiMi' },
    { chn: '魔芋爽', pin: 'móyù shuǎng', vi: 'Mực chay ma dục sảng' },
    { chn: '薯片', pin: 'shǔpiàn', vi: 'Khoai tây chiên' },
    { chn: '果冻', pin: 'guǒdòng', vi: 'Thạch hoa quả' },
    { chn: '瓜子', pin: 'guāzǐ', vi: 'Hạt hướng dương' },
    { chn: '酸辣粉', pin: 'suānlàfěn', vi: 'Miến chua cay' }
  ],
  drinks: [
    { chn: '冰红茶', pin: 'bīnghóngchá', vi: 'Trà đỏ chanh lạnh' },
    { chn: '旺仔牛奶', pin: 'wàngzǎi niúnǎi', vi: 'Sữa lon Vượng Tử' },
    { chn: '可乐 / 肥宅水', pin: 'kělè / féizhǎishuǐ', vi: 'Nước ngọt Coca' },
    { chn: '矿泉水', pin: 'kuàngquánshuǐ', vi: 'Nước khoáng' },
    { chn: '绿茶', pin: 'lǜchá', vi: 'Trà xanh' }
  ],
  quantifiers: [
    { chn: '包', pin: 'bāo', vi: 'Gói, túi (nhỏ)' },
    { chn: '瓶', pin: 'píng', vi: 'Chai (nước)' },
    { chn: '罐 / 听', pin: 'guàn / tīng', vi: 'Lon (nước ngọt, sữa)' },
    { chn: '桶 / 碗', pin: 'tǒng / wǎn', vi: 'Tô, bát (mì)' },
    { chn: '袋', pin: 'dài', vi: 'Bao, túi (lớn)' },
    { chn: '根', pin: 'gēn', vi: 'Cây, que (kem, kẹo que)' },
    { chn: '个', pin: 'gè', vi: 'Cái, chiếc (chung)' }
  ],
  business: [
    { chn: '小卖部', pin: 'xiǎomàibù', vi: 'Tiệm tạp hóa nhỏ' },
    { chn: '货架', pin: 'huòjià', vi: 'Kệ trưng bày hàng' },
    { chn: '进货', pin: 'jìnhuò', vi: 'Nhập hàng hóa' },
    { chn: '标价 / 单价', pin: 'biāojià / dānjià', vi: 'Giá bán niêm yết' },
    { chn: '应付 / 应收', pin: 'yìngfù / yìngshōu', vi: 'Số tiền phải thanh toán' },
    { chn: '实付 / 实收', pin: 'shífù / shíshōu', vi: 'Số tiền khách thực trả' },
    { chn: '找零', pin: 'zhǎolíng', vi: 'Thối tiền thừa' },
    { chn: '现金', pin: 'xiànjīn', vi: 'Tiền mặt' },
    { chn: '零钱', pin: 'língqián', vi: 'Tiền lẻ' },
    { chn: '打烊', pin: 'dǎyàng', vi: 'Đóng cửa tiệm' }
  ]
};

// ============================================================================
// 3. MAIN GROCERY GAME ENGINE
// ============================================================================
class GroceryGameEngine {
  constructor() {
    this.audio = new GroceryAudio();

    // Game State
    this.money = 50.00; // Vốn tiền mặt khởi đầu
    this.day = 1;
    this.dayTimeMinutes = 8 * 60 + 30; // 08:30 sáng
    this.isDayActive = true;
    this.timerInterval = null;

    // Shelf items inventory
    this.shelves = JSON.parse(JSON.stringify(GROCERY_ITEMS));
    // Default initial stocks
    this.shelves.forEach(item => {
      item.currentStock = item.unlocked ? 6 : 0;
    });

    // Today's Stats
    this.todayRevenue = 0.00;
    this.todayCost = 0.00;
    this.todayCustomersServed = 0;
    this.changeCalculationsCount = 0;
    this.changeCalculationsCorrect = 0;
    this.learnedVocab = new Set(['辣条', '大白兔奶糖', '冰红茶', '找零', '包', '瓶']);

    // Current Customer & Order
    this.currentCustomer = null;
    this.currentOrder = null; // { items: [{ item, qty }], dueAmount, paidAmount, changeNeeded }

    // Current Basket
    this.basket = []; // [{ item, qty }]

    // Cashier Change Tray
    this.changeTray = []; // [50, 20, 10, 5, 1, 0.5, 0.1...]

    // Settings
    this.showPinyin = true;
    this.showVietnamese = true;

    this.loadSave();
    this.initDOM();
    this.startDayClock();
    this.spawnNewCustomer();
  }

  // Khôi phục lưu trữ từ LocalStorage
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
    } catch (e) {
      console.warn('Load save error:', e);
    }
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

  // Khởi tạo các sự kiện DOM
  initDOM() {
    this.updateHUD();
    this.renderShelvesGrid();
    this.renderBasket();
    this.renderChangeTray();

    // Denominations buttons
    document.querySelectorAll('.btn-money-bill, .btn-money-coin').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseFloat(btn.dataset.value);
        this.addChangeToTray(val);
      });
    });

    // Reset change tray
    document.getElementById('btn-reset-tray')?.addEventListener('click', () => {
      this.resetChangeTray();
    });

    // Verify change checkout
    document.getElementById('btn-verify-change')?.addEventListener('click', () => {
      this.verifyAndCompleteTransaction();
    });

    // Proceed to checkout button from basket
    document.getElementById('btn-proceed-checkout')?.addEventListener('click', () => {
      this.confirmBasketToCheckout();
    });

    // Clear basket
    document.getElementById('btn-clear-basket')?.addEventListener('click', () => {
      this.clearBasket();
    });

    // Early Close
    document.getElementById('btn-early-close')?.addEventListener('click', () => {
      this.triggerEarlyClose();
    });

    // Replay audio
    document.getElementById('btn-replay-order-audio')?.addEventListener('click', () => {
      this.speakOrder();
    });

    // Mascot
    document.getElementById('hud-mascot-dragon')?.addEventListener('click', () => {
      this.audio.speak('生意兴隆，财源广进！加油！');
    });

    // Restock Modal Buttons
    document.getElementById('btn-open-restock')?.addEventListener('click', () => {
      this.openRestockModal();
    });
    document.getElementById('btn-quick-restock')?.addEventListener('click', () => {
      this.openRestockModal();
    });
    document.getElementById('btn-autofill-all-stock')?.addEventListener('click', () => {
      this.autofillAllStockInModal();
    });
    document.getElementById('btn-confirm-restock-open')?.addEventListener('click', () => {
      this.confirmRestockAndResume();
    });

    // Unlock shelf button
    document.getElementById('btn-unlock-next-shelf')?.addEventListener('click', () => {
      this.openUnlockModal();
    });

    // Vocab Modal
    document.getElementById('btn-open-vocab')?.addEventListener('click', () => {
      this.openVocabModal();
    });

    // Day summary next day button
    document.getElementById('btn-next-day-start')?.addEventListener('click', () => {
      this.startNextDay();
    });

    // Settings
    document.getElementById('btn-pause-game')?.addEventListener('click', () => {
      document.getElementById('modal-settings').style.display = 'flex';
    });

    // Settings switches
    document.getElementById('setting-sfx')?.addEventListener('change', (e) => {
      this.audio.sfxEnabled = e.target.checked;
    });
    document.getElementById('setting-voice')?.addEventListener('change', (e) => {
      this.audio.voiceEnabled = e.target.checked;
    });
    document.getElementById('setting-pinyin')?.addEventListener('change', (e) => {
      this.showPinyin = e.target.checked;
      this.updateCustomerBalloon();
    });
    document.getElementById('setting-vietnamese')?.addEventListener('change', (e) => {
      this.showVietnamese = e.target.checked;
      this.updateCustomerBalloon();
    });

    // Reset game data button
    document.getElementById('btn-reset-save')?.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn chơi lại từ đầu không? Toàn bộ số vốn và ngày chơi sẽ được làm mới.')) {
        localStorage.clear();
        location.reload();
      }
    });

    // Vocab tabs
    document.querySelectorAll('.vocab-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.vocab-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderVocabCategory(btn.dataset.tab);
      });
    });
  }

  // Cập nhật thanh trạng thái Top HUD
  updateHUD() {
    const moneyEl = document.getElementById('hud-money-val');
    if (moneyEl) moneyEl.textContent = `${this.money.toFixed(2)} ¥`;

    const dayEl = document.getElementById('hud-day-val');
    if (dayEl) dayEl.textContent = `第 ${this.day} 天`;

    const vocabBadge = document.getElementById('hud-vocab-badge');
    if (vocabBadge) vocabBadge.textContent = `${this.learnedVocab.size}/25`;

    this.updateClockUI();
  }

  // Đồng hồ ca làm việc (08:00 -> 20:00)
  startDayClock() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.isDayActive = true;

    // Cứ 2.5 giây trôi qua 15 phút trong game (1 ngày kéo dài ~120 giây)
    this.timerInterval = setInterval(() => {
      if (!this.isDayActive) return;
      this.dayTimeMinutes += 10;
      this.updateClockUI();

      if (this.dayTimeMinutes >= 20 * 60) { // 20:00 tối hết giờ làm việc
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

    // Progress bar from 08:00 to 20:00 (720 minutes total)
    const elapsed = Math.max(0, this.dayTimeMinutes - (8 * 60));
    const pct = Math.min(100, Math.round((elapsed / 720) * 100));
    const fillEl = document.getElementById('hud-time-fill');
    if (fillEl) fillEl.style.width = `${pct}%`;
  }

  // ==========================================================================
  // CỘT 1: GIAN HÀNG / KỆ HÀNG (SHELVES)
  // ==========================================================================
  renderShelvesGrid() {
    const container = document.getElementById('shelf-rack-container');
    if (!container) return;
    container.innerHTML = '';

    this.shelves.forEach((item, idx) => {
      if (item.unlocked) {
        const isOutOfStock = item.currentStock <= 0;
        const card = document.createElement('div');
        card.className = `shelf-item-card ${isOutOfStock ? 'out-of-stock' : ''}`;
        card.innerHTML = `
          <span class="shelf-badge-slot">Kệ ${item.shelfIndex}</span>
          <span class="shelf-stock-pill ${item.currentStock <= 2 ? 'low-stock' : ''}">
            ${item.currentStock > 0 ? `Còn: ${item.currentStock} ${item.quantifier}` : 'Hết hàng'}
          </span>
          <div class="shelf-item-visual">${item.emoji}</div>
          <div class="shelf-item-details">
            <span class="shelf-item-name-chn kaiti-font">${item.nameChn}</span>
            <span class="shelf-item-pinyin">${item.pinyin}</span>
            <span class="shelf-item-name-vi">(${item.nameVi})</span>
          </div>
          <div class="shelf-item-price-bar">
            <span class="shelf-price-val">${item.price.toFixed(2)} ¥</span>
            <button type="button" class="btn-pick-to-basket" ${isOutOfStock ? 'disabled' : ''}>
              ${isOutOfStock ? 'Hết hàng' : '+ Nhặt giỏ'}
            </button>
          </div>
        `;

        if (!isOutOfStock) {
          card.addEventListener('click', () => {
            this.pickItemToBasket(item);
          });
        }
        container.appendChild(card);
      } else {
        // Ô Kệ Đang Khóa
        const lockedCard = document.createElement('div');
        lockedCard.className = 'shelf-item-locked';
        lockedCard.innerHTML = `
          <div class="lock-icon"><i class="fa-solid fa-lock"></i></div>
          <div class="lock-title">Kệ ${item.shelfIndex}: ${item.nameChn}</div>
          <div class="lock-cost">Cần vốn: ${item.unlockCost.toFixed(2)} ¥</div>
        `;
        lockedCard.addEventListener('click', () => {
          this.promptUnlockShelf(item);
        });
        container.appendChild(lockedCard);
      }
    });

    this.checkIfAllShelvesEmpty();
  }

  // Nhặt hàng vào giỏ
  pickItemToBasket(item) {
    if (item.currentStock <= 0) return;

    // Giảm tồn trên kệ
    item.currentStock -= 1;
    this.audio.playPickItem();

    // Thêm vào giỏ
    const existing = this.basket.find(b => b.item.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.basket.push({ item, qty: 1 });
    }

    // Học từ vựng
    this.learnedVocab.add(item.nameChn);
    this.learnedVocab.add(item.quantifier);

    this.renderShelvesGrid();
    this.renderBasket();
  }

  // Gỡ bớt hàng khỏi giỏ trả lại kệ
  removeItemFromBasket(itemId) {
    const idx = this.basket.findIndex(b => b.item.id === itemId);
    if (idx === -1) return;

    const basketItem = this.basket[idx];
    const shelfItem = this.shelves.find(s => s.id === itemId);
    if (shelfItem) shelfItem.currentStock += 1;

    basketItem.qty -= 1;
    if (basketItem.qty <= 0) {
      this.basket.splice(idx, 1);
    }

    this.audio.playPickItem();
    this.renderShelvesGrid();
    this.renderBasket();
  }

  clearBasket() {
    this.basket.forEach(b => {
      const shelfItem = this.shelves.find(s => s.id === b.item.id);
      if (shelfItem) shelfItem.currentStock += b.qty;
    });
    this.basket = [];
    this.renderShelvesGrid();
    this.renderBasket();
  }

  // Kiểm tra nếu tất cả kệ đã hết sạch hàng
  checkIfAllShelvesEmpty() {
    const totalRemaining = this.shelves
      .filter(s => s.unlocked)
      .reduce((sum, item) => sum + item.currentStock, 0);

    if (totalRemaining === 0 && this.isDayActive) {
      const statusBadge = document.getElementById('hud-status-badge');
      if (statusBadge) {
        statusBadge.innerHTML = '🔴 货架已售罄 (Hàng trên kệ đã hết sạch!)';
        statusBadge.style.color = '#e11d48';
      }
    }
  }

  // ==========================================================================
  // CỘT 2: GIỎ HÀNG & KHÁCH HÀNG (CUSTOMER & BASKET)
  // ==========================================================================
  spawnNewCustomer() {
    // Chọn ngẫu nhiên khách hàng anime
    this.currentCustomer = GROCERY_CUSTOMERS[Math.floor(Math.random() * GROCERY_CUSTOMERS.length)];

    // Cập nhật avatar khách
    const visualEl = document.getElementById('customer-chibi-visual');
    const badgeEl = document.getElementById('customer-name-badge');
    if (visualEl) visualEl.innerHTML = `<span class="customer-emoji-avatar">${this.currentCustomer.emoji}</span>`;
    if (badgeEl) {
      badgeEl.innerHTML = `
        <span class="c-name kaiti-font">${this.currentCustomer.nameChn}</span>
        <span class="c-role">(${this.currentCustomer.role})</span>
      `;
    }

    // Tạo đơn hàng ngẫu nhiên dựa trên các kệ ĐÃ MỞ KHÓA
    const availableItems = this.shelves.filter(s => s.unlocked && s.currentStock > 0);
    let chosenItems = [];

    if (availableItems.length === 0) {
      // Hết hàng toàn tiệm
      this.currentOrder = null;
      const chnEl = document.getElementById('order-chn-text');
      const pinEl = document.getElementById('order-pin-text');
      const viEl = document.getElementById('order-vi-text');
      if (chnEl) chnEl.textContent = '老板，货架上没东西啦，快补货吧！';
      if (pinEl) pinEl.textContent = 'Lǎobǎn, huòjià shàng méi dōngxi la, kuài bǔhuò ba!';
      if (viEl) viEl.textContent = '(Ông chủ ơi, trên kệ hết sạch đồ rồi, hãy đóng cửa hoặc nhập hàng nhé!)';
      return;
    }

    // Chọn từ 1 đến 2 món khác nhau
    const itemCount = Math.min(availableItems.length, Math.random() > 0.4 ? 2 : 1);
    const shuffled = [...availableItems].sort(() => 0.5 - Math.random());
    for (let i = 0; i < itemCount; i++) {
      const it = shuffled[i];
      const maxCanBuy = Math.min(it.currentStock, 2);
      const qty = Math.floor(Math.random() * maxCanBuy) + 1;
      chosenItems.push({ item: it, qty });
    }

    // Tính tổng tiền đơn hàng
    const dueAmount = chosenItems.reduce((sum, ci) => sum + ci.item.price * ci.qty, 0);

    // Xác định số tiền khách đưa (lớn hơn hoặc bằng dueAmount)
    let paidAmount = dueAmount;
    const candidates = [1, 2, 5, 10, 20, 50, 100].filter(val => val >= dueAmount);
    if (candidates.length > 0) {
      paidAmount = candidates[Math.floor(Math.random() * Math.min(candidates.length, 3))];
    } else {
      paidAmount = Math.ceil(dueAmount / 10) * 10;
    }

    const changeNeeded = parseFloat((paidAmount - dueAmount).toFixed(2));

    this.currentOrder = {
      items: chosenItems,
      dueAmount,
      paidAmount,
      changeNeeded
    };

    this.updateCustomerBalloon();
    this.renderPosTerminalReady();

    // Tự động phát âm lời gọi món sau 400ms
    setTimeout(() => {
      this.speakOrder();
    }, 400);
  }

  // Cập nhật bóng thoại yêu cầu của khách
  updateCustomerBalloon() {
    if (!this.currentOrder) return;

    const parts = this.currentOrder.items.map(ci => {
      const qtyStr = ci.qty === 2 ? '两' : (ci.qty === 1 ? '一' : ci.qty.toString());
      return `${qtyStr}${ci.item.quantifier}${ci.item.nameChn}`;
    });

    const sentenceChn = `老板，我要${parts.join('和')}！`;
    const sentencePin = this.generateOrderPinyin(this.currentOrder.items);
    const sentenceVi = `(Ông chủ, cho tôi ${this.currentOrder.items.map(ci => `${ci.qty} ${ci.item.quantifierVi} ${ci.item.nameVi.toLowerCase()}`).join(' và ')}!)`;

    const chnEl = document.getElementById('order-chn-text');
    const pinEl = document.getElementById('order-pin-text');
    const viEl = document.getElementById('order-vi-text');

    if (chnEl) chnEl.textContent = sentenceChn;
    if (pinEl) {
      pinEl.style.display = this.showPinyin ? 'block' : 'none';
      pinEl.textContent = sentencePin;
    }
    if (viEl) {
      viEl.style.display = this.showVietnamese ? 'block' : 'none';
      viEl.textContent = sentenceVi;
    }
  }

  generateOrderPinyin(items) {
    const parts = items.map(ci => {
      const q = ci.qty === 2 ? 'liǎng' : (ci.qty === 1 ? 'yī' : ci.qty.toString());
      return `${q} ${ci.item.pinyin}`;
    });
    return `Lǎobǎn, wǒ yào ${parts.join(' hé ')}!`;
  }

  speakOrder() {
    if (!this.currentOrder) return;
    const parts = this.currentOrder.items.map(ci => {
      const qtyStr = ci.qty === 2 ? '两' : (ci.qty === 1 ? '一' : ci.qty.toString());
      return `${qtyStr}${ci.item.quantifier}${ci.item.nameChn}`;
    });
    const sentence = `老板，我要${parts.join('和')}！`;
    this.audio.speak(sentence);
  }

  // Render Giỏ Hàng
  renderBasket() {
    const listEl = document.getElementById('basket-item-list');
    const countBadge = document.getElementById('basket-count-badge');
    const totalEl = document.getElementById('basket-total-amount');
    const proceedBtn = document.getElementById('btn-proceed-checkout');

    if (!listEl) return;

    if (this.basket.length === 0) {
      listEl.innerHTML = `
        <div class="basket-empty-state">
          <i class="fa-solid fa-cart-arrow-down"></i>
          <p>Chưa có món hàng nào. Hãy bấm vào các món ở Cột 1 (Gian Hàng) để nhặt cho khách!</p>
        </div>
      `;
      if (countBadge) countBadge.textContent = '0';
      if (totalEl) totalEl.textContent = '0.00 ¥';
      if (proceedBtn) proceedBtn.disabled = true;
      return;
    }

    let total = 0;
    let totalCount = 0;
    listEl.innerHTML = '';

    this.basket.forEach(b => {
      const subtotal = b.item.price * b.qty;
      total += subtotal;
      totalCount += b.qty;

      const row = document.createElement('div');
      row.className = 'basket-row-item';
      row.innerHTML = `
        <div class="basket-row-left">
          <span class="basket-item-emoji">${b.item.emoji}</span>
          <div class="basket-row-info">
            <span class="basket-item-title kaiti-font">${b.item.nameChn}</span>
            <span class="basket-item-sub">${b.item.price.toFixed(2)}¥ × ${b.qty}</span>
          </div>
        </div>
        <div class="basket-row-right">
          <div class="basket-item-qty-control">
            <button type="button" class="btn-qty btn-minus">-</button>
            <span class="basket-qty-val">${b.qty}</span>
            <button type="button" class="btn-qty btn-plus">+</button>
          </div>
          <span class="basket-item-subtotal">${subtotal.toFixed(2)} ¥</span>
        </div>
      `;

      row.querySelector('.btn-minus')?.addEventListener('click', () => {
        this.removeItemFromBasket(b.item.id);
      });
      row.querySelector('.btn-plus')?.addEventListener('click', () => {
        this.pickItemToBasket(b.item);
      });

      listEl.appendChild(row);
    });

    if (countBadge) countBadge.textContent = totalCount.toString();
    if (totalEl) totalEl.textContent = `${total.toFixed(2)} ¥`;

    // So khớp với đơn hàng của khách
    const isMatching = this.isBasketMatchingOrder();
    if (proceedBtn) {
      proceedBtn.disabled = !isMatching;
      if (isMatching) {
        proceedBtn.innerHTML = '<span>👉 Đã Nhặt Đủ! Chuyển Sang Thanh Toán</span>';
      } else {
        proceedBtn.innerHTML = '<span>⚠️ Nhặt chưa đúng yêu cầu khách!</span>';
      }
    }
  }

  // Kiểm tra giỏ hàng có trùng khớp 100% với yêu cầu khách
  isBasketMatchingOrder() {
    if (!this.currentOrder) return false;
    const orderItems = this.currentOrder.items;

    if (this.basket.length !== orderItems.length) return false;

    for (const oi of orderItems) {
      const inBasket = this.basket.find(b => b.item.id === oi.item.id);
      if (!inBasket || inBasket.qty !== oi.qty) return false;
    }
    return true;
  }

  // Xác nhận giỏ hàng và chuyển sang Quầy Thu Ngân
  confirmBasketToCheckout() {
    if (!this.isBasketMatchingOrder()) {
      alert('Vui lòng nhặt đúng và đủ các món đồ khách yêu cầu trong bóng thoại!');
      return;
    }
    this.renderPosTerminalActive();
    this.audio.playPickItem();
  }

  // ==========================================================================
  // CỘT 3: QUẦY THU NGÂN & TÍNH TIỀN THỐI (CASHIER & CHANGE)
  // ==========================================================================
  renderPosTerminalReady() {
    const dueEl = document.getElementById('pos-due-amount');
    const paidEl = document.getElementById('pos-paid-amount');
    const changeEl = document.getElementById('pos-change-needed');
    const cashPreview = document.getElementById('given-cash-display');

    if (!this.currentOrder) {
      if (dueEl) dueEl.textContent = '0.00 ¥';
      if (paidEl) paidEl.textContent = '0.00 ¥';
      if (changeEl) changeEl.textContent = '0.00 ¥';
      if (cashPreview) cashPreview.innerHTML = '<span style="color:#94a3b8;font-size:0.75rem;">Đang chờ khách...</span>';
      return;
    }

    if (dueEl) dueEl.textContent = `${this.currentOrder.dueAmount.toFixed(2)} ¥`;
    if (paidEl) paidEl.textContent = `${this.currentOrder.paidAmount.toFixed(2)} ¥`;
    if (changeEl) changeEl.textContent = `${this.currentOrder.changeNeeded.toFixed(2)} ¥`;

    if (cashPreview) {
      cashPreview.innerHTML = `
        <span class="cash-bill-badge">💵 ${this.currentOrder.paidAmount.toFixed(2)} 元</span>
      `;
    }

    this.resetChangeTray();
  }

  renderPosTerminalActive() {
    // Highlight POS screen
    const screen = document.querySelector('.pos-screen');
    if (screen) {
      screen.style.borderColor = '#38bdf8';
      screen.style.boxShadow = '0 0 15px rgba(56, 189, 248, 0.3)';
    }
  }

  // Thêm mệnh giá tiền vào khay thối
  addChangeToTray(value) {
    this.changeTray.push(value);
    this.audio.playCoinClink();
    this.renderChangeTray();
  }

  // Gỡ 1 tờ/xu khỏi khay
  removeChangeFromTray(index) {
    this.changeTray.splice(index, 1);
    this.audio.playCoinClink();
    this.renderChangeTray();
  }

  resetChangeTray() {
    this.changeTray = [];
    this.renderChangeTray();
  }

  renderChangeTray() {
    const container = document.getElementById('tray-coins-container');
    const sumEl = document.getElementById('tray-current-sum');
    if (!container) return;

    if (this.changeTray.length === 0) {
      container.innerHTML = `<span class="tray-placeholder">Chạm các mệnh giá tiền ở trên để nhặt tiền thối vào đây</span>`;
      if (sumEl) sumEl.textContent = 'Đã nhặt: 0.00 ¥';
      return;
    }

    const currentSum = this.changeTray.reduce((sum, v) => sum + v, 0);
    if (sumEl) sumEl.textContent = `Đã nhặt: ${currentSum.toFixed(2)} ¥`;

    container.innerHTML = '';
    this.changeTray.forEach((val, idx) => {
      const token = document.createElement('div');
      if (val >= 1) {
        token.className = 'tray-bill-token';
        token.innerHTML = `💵 ${val}元 <i class="fa-solid fa-xmark" style="font-size:0.6rem;opacity:0.6;"></i>`;
      } else {
        token.className = 'tray-coin-token';
        token.innerHTML = `${val === 0.5 ? '5角' : '1角'}`;
      }
      token.title = 'Bấm để gỡ bỏ tờ này';
      token.addEventListener('click', () => {
        this.removeChangeFromTray(idx);
      });
      container.appendChild(token);
    });
  }

  // Xác nhận và kiểm tra tiền thối
  verifyAndCompleteTransaction() {
    if (!this.currentOrder) return;

    if (!this.isBasketMatchingOrder()) {
      alert('Vui lòng nhặt đúng đơn hàng vào giỏ trước khi hoàn tất giao dịch!');
      return;
    }

    const currentTraySum = parseFloat(this.changeTray.reduce((sum, v) => sum + v, 0).toFixed(2));
    const targetChange = this.currentOrder.changeNeeded;

    this.changeCalculationsCount += 1;

    // Kiểm tra sai số số thực
    if (Math.abs(currentTraySum - targetChange) < 0.01) {
      // CHÍNH XÁC 100%!
      this.changeCalculationsCorrect += 1;
      this.audio.playCashRegister();

      // Cộng doanh thu vào tiền vốn
      const due = this.currentOrder.dueAmount;
      this.money += due;
      this.todayRevenue += due;
      this.todayCustomersServed += 1;

      this.audio.speak('谢谢老板！祝您生意兴隆！');

      // Reset giỏ hàng và khay thối
      this.basket = [];
      this.resetChangeTray();
      this.updateHUD();
      this.saveGame();

      // Hiện thông báo chúc mừng
      const statusBadge = document.getElementById('hud-status-badge');
      if (statusBadge) {
        statusBadge.innerHTML = '🎉 找零正确！交易成功！(Thối tiền chuẩn xác!)';
        statusBadge.style.color = '#15803d';
        setTimeout(() => {
          if (this.isDayActive) {
            statusBadge.innerHTML = '🟢 正在营业 (Đang mở cửa)';
            statusBadge.style.color = '#15803d';
          }
        }, 2000);
      }

      // Khách tiếp theo bước vào tiệm sau 800ms
      setTimeout(() => {
        this.renderBasket();
        this.spawnNewCustomer();
      }, 800);

    } else {
      // SAI TIỀN THỐI
      this.audio.playErrorBuzz();
      this.audio.speak('老板，钱找错啦！');

      const diff = currentTraySum - targetChange;
      let msg = '';
      if (diff > 0) {
        msg = `Thối THỪA tiền cho khách rồi! Khách chỉ cần thối ${targetChange.toFixed(2)}¥, bạn đang thối ${currentTraySum.toFixed(2)}¥ (Thừa +${diff.toFixed(2)}¥).`;
      } else {
        msg = `Thối THIẾU tiền cho khách rồi! Khách cần thối ${targetChange.toFixed(2)}¥, bạn mới thối ${currentTraySum.toFixed(2)}¥ (Thiếu ${Math.abs(diff).toFixed(2)}¥).`;
      }

      alert(`⚠️ ${msg}\nHãy xếp lại tiền cho đúng nhé!`);
    }
  }

  // ==========================================================================
  // CHU KỲ NGÀY & ĐÓNG CỬA SỚM (DAY CYCLE & EARLY CLOSE)
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

    // Tính lợi nhuận ròng
    const profit = this.todayRevenue - this.todayCost;
    const accuracy = this.changeCalculationsCount > 0
      ? Math.round((this.changeCalculationsCorrect / this.changeCalculationsCount) * 100)
      : 100;

    // Cập nhật Modal Tổng Kết Ngày
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

    // Mở Modal
    const modal = document.getElementById('modal-day-summary');
    if (modal) modal.style.display = 'flex';

    this.audio.playCashRegister();
  }

  startNextDay() {
    // Đóng modal tổng kết
    const modal = document.getElementById('modal-day-summary');
    if (modal) modal.style.display = 'none';

    // Sang ngày mới
    this.day += 1;
    this.dayTimeMinutes = 8 * 60 + 30; // 08:30 sáng
    this.todayRevenue = 0.00;
    this.todayCost = 0.00;
    this.todayCustomersServed = 0;
    this.changeCalculationsCount = 0;
    this.changeCalculationsCorrect = 0;

    this.updateHUD();
    this.saveGame();

    // Mở ngay Modal Nhập Hàng trước giờ mở cửa
    this.openRestockModal();
  }

  // ==========================================================================
  // MODAL 1: NHẬP HÀNG TRƯỚC GIỜ MỞ CỬA (进货与上架)
  // ==========================================================================
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
              <strong class="kaiti-font" style="font-size:1rem;color:#7c2d12;">${item.nameChn}</strong>
              <div style="font-size:0.7rem;color:#64748b;">${item.pinyin} (${item.nameVi})</div>
            </div>
          </div>
        </td>
        <td><strong>${item.currentStock}</strong> / ${item.maxStock} ${item.quantifier}</td>
        <td style="color:#e11d48;font-weight:700;">${item.cost.toFixed(2)} ¥</td>
        <td style="color:#059669;font-weight:700;">${item.price.toFixed(2)} ¥</td>
        <td>
          <input type="number" class="stock-input-qty" id="stock-in-${item.id}"
            min="0" max="${maxCanAdd}" value="0" data-item-id="${item.id}">
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
    let availableMoney = this.money;
    this.shelves.filter(s => s.unlocked).forEach(item => {
      const input = document.getElementById(`stock-in-${item.id}`);
      if (!input) return;

      const needed = item.maxStock - item.currentStock;
      const affordable = Math.floor(availableMoney / item.cost);
      const toAdd = Math.min(needed, affordable);

      input.value = toAdd;
      availableMoney -= toAdd * item.cost;

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

    const curBalEl = document.getElementById('modal-stock-current-bal');
    const costEl = document.getElementById('modal-stock-total-cost');
    const remBalEl = document.getElementById('modal-stock-remaining-bal');

    if (curBalEl) curBalEl.textContent = `${this.money.toFixed(2)} ¥`;
    if (costEl) costEl.textContent = `${totalCost.toFixed(2)} ¥`;
    if (remBalEl) {
      const rem = this.money - totalCost;
      remBalEl.textContent = `${rem.toFixed(2)} ¥`;
      remBalEl.className = rem >= 0 ? 'text-emerald' : 'text-rose';
    }

    const confirmBtn = document.getElementById('btn-confirm-restock-open');
    if (confirmBtn) {
      confirmBtn.disabled = (this.money - totalCost) < 0;
    }
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
      alert('Vốn không đủ để nhập số lượng này! Vui lòng giảm bớt.');
      return;
    }

    // Trừ tiền vốn và cập nhật kệ
    this.money -= totalCost;
    this.todayCost += totalCost;
    additions.forEach(add => {
      add.item.currentStock += add.qty;
    });

    this.closeRestockModal();
    this.updateHUD();
    this.renderShelvesGrid();
    this.saveGame();

    this.audio.playCashRegister();

    // Mở cửa và tiếp tục ngày
    this.startDayClock();
    this.spawnNewCustomer();
  }

  // ==========================================================================
  // MODAL 4: MỞ GIAN HÀNG MỚI (解锁新货架)
  // ==========================================================================
  openUnlockModal() {
    const modal = document.getElementById('modal-unlock-shelf');
    const list = document.getElementById('unlock-shelves-list');
    if (!modal || !list) return;

    list.innerHTML = '';
    const lockedShelves = this.shelves.filter(s => !s.unlocked);

    if (lockedShelves.length === 0) {
      list.innerHTML = `
        <div style="text-align:center;padding:30px;color:#059669;font-weight:800;">
          <i class="fa-solid fa-crown" style="font-size:2.5rem;margin-bottom:10px;"></i>
          <p>Chúc mừng! Bạn đã mở khóa toàn bộ gian hàng của tiệm tạp hóa!</p>
        </div>
      `;
      modal.style.display = 'flex';
      return;
    }

    lockedShelves.forEach(item => {
      const canAfford = this.money >= item.unlockCost;
      const row = document.createElement('div');
      row.className = 'unlock-shelf-row';
      row.innerHTML = `
        <div class="unlock-shelf-info">
          <span class="shelf-preview-icon">${item.emoji}</span>
          <div class="shelf-text-wrap">
            <span class="shelf-title-chn kaiti-font">Kệ ${item.shelfIndex}: ${item.nameChn} (${item.nameVi})</span>
            <span class="shelf-desc-vi">Giá bán: ${item.price.toFixed(2)}¥/ ${item.quantifierVi} · Lợi nhuận cao!</span>
          </div>
        </div>
        <button type="button" class="btn-modal-primary" ${canAfford ? '' : 'disabled'}
          style="${canAfford ? '' : 'background:#cbd5e1;cursor:not-allowed;'}">
          ${canAfford ? `Mở Khóa (${item.unlockCost.toFixed(2)} ¥)` : `Thiếu vốn (${item.unlockCost.toFixed(2)} ¥)`}
        </button>
      `;

      row.querySelector('button')?.addEventListener('click', () => {
        if (canAfford) {
          this.unlockShelfItem(item);
          modal.style.display = 'none';
        }
      });

      list.appendChild(row);
    });

    modal.style.display = 'flex';
  }

  promptUnlockShelf(item) {
    if (this.money >= item.unlockCost) {
      if (confirm(`Bạn có muốn dùng ${item.unlockCost.toFixed(2)} ¥ để mở khóa Gian hàng Kệ ${item.shelfIndex} (${item.nameChn}) không?`)) {
        this.unlockShelfItem(item);
      }
    } else {
      alert(`Bạn cần tích lũy đủ ${item.unlockCost.toFixed(2)} ¥ để mở khóa Kệ ${item.shelfIndex} (${item.nameChn}). Hiện bạn đang có ${this.money.toFixed(2)} ¥.`);
    }
  }

  unlockShelfItem(item) {
    this.money -= item.unlockCost;
    item.unlocked = true;
    item.currentStock = 4; // Tặng sẵn 4 sản phẩm mẫu khi mở kệ mới
    this.learnedVocab.add(item.nameChn);
    this.learnedVocab.add(item.quantifier);

    this.audio.playCashRegister();
    this.audio.speak(`恭喜解锁${item.nameChn}！`);

    this.updateHUD();
    this.renderShelvesGrid();
    this.saveGame();

    alert(`🎉 Chúc mừng! Bạn đã mở khóa thành công Kệ ${item.shelfIndex}: ${item.nameChn}!`);
  }

  // ==========================================================================
  // MODAL 3: SỔ TAY TỪ VỰNG TẠP HÓA (生词本)
  // ==========================================================================
  openVocabModal() {
    const modal = document.getElementById('modal-vocab');
    if (!modal) return;
    this.renderVocabCategory('snacks');
    modal.style.display = 'flex';
  }

  renderVocabCategory(catKey) {
    const grid = document.getElementById('vocab-items-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const list = VOCAB_DATABASE[catKey] || [];
    list.forEach(v => {
      const card = document.createElement('div');
      card.className = 'vocab-card';
      card.innerHTML = `
        <div class="vocab-card-left">
          <span class="vocab-chn kaiti-font">${v.chn}</span>
          <span class="vocab-pin">${v.pin}</span>
          <span class="vocab-vi">${v.vi}</span>
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
  window.groceryGame = new GroceryGameEngine();
});

