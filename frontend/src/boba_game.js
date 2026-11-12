/**
 * Tiệm Trà Sữa Của Tôi (我的奶茶店 - Papa's Boba Cafe)
 * Core Game Engine: Papa's Freezeria Station-Based Simulation System
 */

import customerGirlImg from './assets/boba_customer_girl.jpg';
import customerBoyImg from './assets/boba_customer_boy.jpg';

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
    { id: 'milktea', hanzi: '奶茶', pinyin: 'nǎichá', vi: 'Trà sữa truyền thống', color: '#df9b58' },
    { id: 'blacktea', hanzi: '红茶', pinyin: 'hóngchá', vi: 'Hồng trà thơm', color: '#853713' },
    { id: 'greentea', hanzi: '绿茶', pinyin: 'lǜchá', vi: 'Trà xanh nhài', color: '#84cc16' },
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
    { id: 'boba', hanzi: '珍珠', pinyin: 'zhēnzhū', vi: 'Trân châu đen', icon: '🧋' },
    { id: 'mango', hanzi: '芒果布丁', pinyin: 'mángguǒ bùdīng', vi: 'Pudding xoài', icon: '🥭' },
    { id: 'redbean', hanzi: '红豆', pinyin: 'hóngdòu', vi: 'Đậu đỏ bùi', icon: '🫘' },
    { id: 'matcha', hanzi: '抹茶冻', pinyin: 'mǒchádòng', vi: 'Thạch matcha', icon: '🍵' },
    { id: 'coconut', hanzi: '椰果', pinyin: 'yēguǒ', vi: 'Thạch dừa giòn', icon: '🥥' },
    { id: 'taroball', hanzi: '芋圆', pinyin: 'yùyuán', vi: 'Khoai dẻo', icon: '🍠' }
  ]
};

// Customer Roster
const PAPA_CUSTOMERS = [
  { id: 'xiaoyu', nameChn: '小雨', nameVi: 'Bé Mưa', role: 'Bé gái dễ thương', emoji: '👧', image: customerGirlImg },
  { id: 'xiaohao', nameChn: '小浩', nameVi: 'Tiểu Hạo', role: 'Học sinh tiểu học', emoji: '👦', image: customerBoyImg },
  { id: 'xiaotong', nameChn: '晓彤', nameVi: 'Hiểu Đồng', role: 'Nữ sinh trung học', emoji: '👩‍🎓', image: customerGirlImg },
  { id: 'linjie', nameChn: '林姐', nameVi: 'Chị Lâm', role: 'Chị gái văn phòng', emoji: '👩‍💼', image: customerGirlImg },
  { id: 'wangshu', nameChn: '王叔', nameVi: 'Chú Vương', role: 'Bác hàng xóm', emoji: '👨', image: customerBoyImg },
  { id: 'abao', nameChn: '阿宝', nameVi: 'Gấu A Bảo', role: 'Linh vật đáng yêu', emoji: '🐼', image: customerBoyImg }
];

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

    // Order State
    this.currentCustomer = null;
    this.currentOrder = null;
    this.isOrderTaken = false;

    // Cup Crafting State in Stations (Papa's tactile state)
    this.cup = {
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

    this.loadSave();
    this.initDOM();
    this.spawnNewCustomer(true);
  }

  loadSave() {
    try {
      const c = localStorage.getItem('boba_coins');
      if (c !== null) this.coins = parseInt(c, 10);
      const lv = localStorage.getItem('boba_level');
      if (lv !== null) this.level = parseInt(lv, 10);
      const ex = localStorage.getItem('boba_exp');
      if (ex !== null) this.exp = parseInt(ex, 10);
      const ord = localStorage.getItem('boba_orders');
      if (ord !== null) this.completedOrders = parseInt(ord, 10);
    } catch (e) {}
  }

  saveGame() {
    try {
      localStorage.setItem('boba_coins', this.coins.toString());
      localStorage.setItem('boba_level', this.level.toString());
      localStorage.setItem('boba_exp', this.exp.toString());
      localStorage.setItem('boba_orders', this.completedOrders.toString());
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

    // Take Order Button
    document.getElementById('btn-take-order-action')?.addEventListener('click', () => {
      this.takeOrder();
    });

    // Listen to speech button
    document.getElementById('btn-listen-order-speech')?.addEventListener('click', () => {
      this.speakOrder();
    });

    // Ticket Rail zoom & toggle
    document.getElementById('active-order-ticket')?.addEventListener('click', (e) => {
      e.currentTarget.classList.toggle('zoomed');
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

    // Scorecard next customer
    document.getElementById('btn-next-customer-papa')?.addEventListener('click', () => {
      document.getElementById('modal-papa-score').style.display = 'none';
      this.spawnNewCustomer();
      if (this.currentStation !== 'view-master-counter') {
        this.switchStation('view-order-station');
      } else {
        this.switchStation('view-master-counter');
      }
    });

    // Open cookbook
    document.getElementById('btn-open-cookbook')?.addEventListener('click', () => {
      this.openCookbookModal();
    });

    // Reset save
    document.getElementById('btn-reset-boba-save')?.addEventListener('click', () => {
      if (confirm('Bạn có muốn chơi lại từ đầu không?')) {
        localStorage.clear();
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
        const topId = box.dataset.topping;
        const top = BOBA_VOCAB.toppings.find(t => t.id === topId);
        if (!top) return;
        this.cup.toppings.push(top);
        this.audio.playPlop();
        this.updateAllCupVisuals();
        this.showToast(top.icon, `Đã thêm ${top.hanzi} (${top.vi})!`);
      });
    });

    // Sugar buttons in Master Counter
    document.querySelectorAll('.btn-m-sugar').forEach(btn => {
      btn.addEventListener('click', () => {
        const sId = btn.dataset.sugar;
        const sugar = BOBA_VOCAB.sugars.find(s => s.id === sId);
        if (!sugar) return;
        this.cup.sugar = sugar;
        this.audio.playPop();
        document.querySelectorAll('.btn-m-sugar').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateAllCupVisuals();
        this.showToast('🍬', `Chọn đường: ${sugar.hanzi} (${sugar.vi})`);
      });
    });

    // Ice buttons in Master Counter
    document.querySelectorAll('.btn-m-ice').forEach(btn => {
      btn.addEventListener('click', () => {
        const iId = btn.dataset.ice;
        const ice = BOBA_VOCAB.ices.find(i => i.id === iId);
        if (!ice) return;
        this.cup.ice = ice;
        this.audio.playPop();
        document.querySelectorAll('.btn-m-ice').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateAllCupVisuals();
        this.showToast('🧊', `Chọn đá: ${ice.hanzi} (${ice.vi})`);
      });
    });

    // Shaker in Master Counter
    document.getElementById('master-shaker-wrap')?.addEventListener('click', () => {
      this.audio.playShakerSound();
      const shakerBody = document.getElementById('master-shaker-body');
      shakerBody?.classList.add('shakerShakeAnim');
      setTimeout(() => shakerBody?.classList.remove('shakerShakeAnim'), 700);
      this.cup.isShaken = true;
      this.showToast('🌪️', 'Đã lắc đều ly trà sữa thơm ngon!');
    });

    // Lids box in Master Counter
    document.getElementById('master-lids-box')?.addEventListener('click', () => {
      this.cup.hasLid = true;
      this.cup.strawColor = '#f43f5e';
      this.audio.playPop();
      this.updateAllCupVisuals();
      this.showToast('🐻', 'Đã đóng nắp và cắm ống hút!');
    });

    // Trash in Master Counter
    document.getElementById('btn-master-trash')?.addEventListener('click', () => {
      this.audio.playTrash();
      this.resetCup();
      this.updateAllCupVisuals();
      this.showToast('🗑️', 'Đã vứt ly hỏng vào thùng rác!');
    });

    // Undo topping in Master Counter
    document.getElementById('btn-master-undo')?.addEventListener('click', () => {
      if (this.cup.toppings.length > 0) {
        const removed = this.cup.toppings.pop();
        this.audio.playUndo();
        this.updateAllCupVisuals();
        this.showToast('↩️', `Đã bớt 1 phần ${removed.hanzi}!`);
      } else {
        this.showToast('⚠️', 'Chưa có topping để bớt!');
      }
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
      if (!this.cup.hasLid) {
        this.cup.hasLid = true;
        this.cup.strawColor = '#f43f5e';
      }
      this.serveDrinkToCustomer();
    });

    // Full-screen Ticket Zoom Modal Handlers
    document.getElementById('active-order-ticket')?.addEventListener('click', () => {
      this.openTicketZoomModal();
    });
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
      this.speakOrder();
    });
  }

  // Switch Station smoothly
  switchStation(stationId) {
    this.currentStation = stationId;

    // View visibility
    document.querySelectorAll('.station-view').forEach(view => {
      view.classList.remove('active');
    });
    const targetView = document.getElementById(stationId);
    if (targetView) targetView.classList.add('active');

    // Bottom tab active state
    document.querySelectorAll('.station-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.target === stationId);
    });

    // Update HUD Mode text
    const modeText = document.getElementById('hud-mode-text');
    if (modeText) {
      modeText.textContent = (stationId === 'view-master-counter') ? 'Chế độ Trạm' : 'Quầy Toàn Cảnh (Gốc)';
    }

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
        masterLiquid.style.background = this.cup.tea.color;
        masterLiquid.style.height = `${Math.min(85, Math.max(30, this.cup.pourLevel))}%`;
      } else {
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
          cube.style.cssText = 'width: 14px; height: 14px; background: rgba(255, 255, 255, 0.75); border: 1.5px solid rgba(255, 255, 255, 0.95); border-radius: 3px; display: inline-block; box-shadow: 0 1px 3px rgba(0,0,0,0.1);';
          masterIce.appendChild(cube);
        }
      }
    }

    if (masterTop) {
      masterTop.innerHTML = '';
      this.cup.toppings.forEach(top => {
        const dot = document.createElement('span');
        let color = '#1e293b';
        if (top.id === 'mango') color = '#fbbf24';
        else if (top.id === 'redbean') color = '#991b1b';
        else if (top.id === 'matcha') color = '#65a30d';
        else if (top.id === 'coconut') color = '#e0f2fe';
        else if (top.id === 'taroball') color = '#a855f7';
        dot.style.cssText = `width: 12px; height: 12px; border-radius: 50%; background: ${color}; display: inline-block; box-shadow: 0 1px 2px rgba(0,0,0,0.25);`;
        masterTop.appendChild(dot);
      });
    }

    if (masterLid) {
      masterLid.style.display = this.cup.hasLid ? 'flex' : 'none';
    }

    if (masterPills) {
      const parts = [];
      if (this.cup.tea) parts.push(`<span class="m-pill" style="background:#fef3c7; color:#92400e;">${this.cup.tea.hanzi}</span>`);
      if (this.cup.sugar) parts.push(`<span class="m-pill" style="background:#ffedd5; color:#9a3412;">${this.cup.sugar.hanzi}</span>`);
      if (this.cup.ice) parts.push(`<span class="m-pill" style="background:#e0f2fe; color:#0369a1;">${this.cup.ice.hanzi}</span>`);
      if (this.cup.toppings.length > 0) parts.push(`<span class="m-pill" style="background:#fce7f3; color:#9d174d;">${this.cup.toppings.map(t => t.hanzi).join('+')}</span>`);

      masterPills.innerHTML = parts.length > 0 ? parts.join(' ') : '<span class="m-pill empty">Ly Trống</span>';
    }

    // 2. STATIONS CUP SYNC
    const pourLiq = document.getElementById('pour-cup-liquid');
    if (pourLiq) {
      pourLiq.style.height = `${this.cup.pourLevel}%`;
      if (this.cup.tea) pourLiq.style.background = this.cup.tea.color;
    }
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
    if (finalLid) finalLid.style.display = this.cup.hasLid ? 'block' : 'none';
    const finalStraw = document.getElementById('final-cup-straw');
    if (finalStraw) finalStraw.style.display = this.cup.strawColor ? 'block' : 'none';

    // 3. LEFT BOARD STATS SYNC
    const mRev = document.getElementById('m-rev-val');
    if (mRev) mRev.textContent = `${this.coins} ¥`;
    const mOrd = document.getElementById('m-order-val');
    if (mOrd) mOrd.textContent = this.completedOrders.toString();
    const mWords = document.getElementById('m-words-val');
    if (mWords) mWords.textContent = this.learnedWords.size.toString();
  }

  // Full-screen Ticket Zoom Modal
  openTicketZoomModal() {
    const modal = document.getElementById('boba-ticket-zoom-modal');
    if (!modal || !this.currentCustomer || !this.currentOrder) return;
    const ord = this.currentOrder;

    const nameEl = document.getElementById('zoom-cust-name');
    const orderIdEl = document.getElementById('zoom-order-id');
    const teaChn = document.getElementById('zoom-tea-chn');
    const teaVi = document.getElementById('zoom-tea-vi');
    const sugChn = document.getElementById('zoom-sugar-chn');
    const sugVi = document.getElementById('zoom-sugar-vi');
    const iceChn = document.getElementById('zoom-ice-chn');
    const iceVi = document.getElementById('zoom-ice-vi');
    const topChn = document.getElementById('zoom-top-chn');
    const topVi = document.getElementById('zoom-top-vi');

    if (nameEl) nameEl.textContent = `${this.currentCustomer.nameChn} (${this.currentCustomer.nameVi})`;
    if (orderIdEl) orderIdEl.textContent = `ORDER #${100 + this.completedOrders}`;

    if (teaChn) teaChn.textContent = `${ord.topping.hanzi}${ord.tea.hanzi}`;
    if (teaVi) teaVi.textContent = ord.tea.vi;

    if (sugChn) sugChn.textContent = `${ord.sugar.hanzi} (${ord.sugar.percent}%)`;
    if (sugVi) sugVi.textContent = ord.sugar.vi;

    if (iceChn) iceChn.textContent = ord.ice.hanzi;
    if (iceVi) iceVi.textContent = ord.ice.vi;

    if (topChn) topChn.textContent = ord.topping.hanzi;
    if (topVi) topVi.textContent = ord.topping.vi;

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
    if (bookVal) bookVal.textContent = `${this.learnedWords.size}/15`;

    const revEl = document.getElementById('clipboard-rev-val');
    if (revEl) revEl.textContent = `${this.coins} ¥`;

    const ordEl = document.getElementById('clipboard-order-val');
    if (ordEl) ordEl.textContent = this.completedOrders.toString();

    const wordsEl = document.getElementById('clipboard-words-val');
    if (wordsEl) wordsEl.textContent = this.learnedWords.size.toString();
  }

  // ==========================================================================
  // STATION 1: ORDER STATION & MASTER COUNTER SPAWN
  // ==========================================================================
  spawnNewCustomer(isFirst = false) {
    this.resetCup();

    if (isFirst) {
      this.currentCustomer = PAPA_CUSTOMERS[0]; // Bé Mưa Tiểu Vũ
      this.currentOrder = {
        tea: BOBA_VOCAB.teas.find(t => t.id === 'milktea'),
        topping: BOBA_VOCAB.toppings.find(t => t.id === 'boba'),
        sugar: BOBA_VOCAB.sugars.find(s => s.id === 'less_sugar'),
        ice: BOBA_VOCAB.ices.find(i => i.id === 'no_ice')
      };
    } else {
      this.currentCustomer = PAPA_CUSTOMERS[Math.floor(Math.random() * PAPA_CUSTOMERS.length)];
      const tea = BOBA_VOCAB.teas[Math.floor(Math.random() * BOBA_VOCAB.teas.length)];
      const topping = BOBA_VOCAB.toppings[Math.floor(Math.random() * BOBA_VOCAB.toppings.length)];
      const sugar = BOBA_VOCAB.sugars[Math.floor(Math.random() * BOBA_VOCAB.sugars.length)];
      const ice = BOBA_VOCAB.ices[Math.floor(Math.random() * BOBA_VOCAB.ices.length)];
      this.currentOrder = { tea, topping, sugar, ice };
    }

    this.isOrderTaken = false;

    // 1. Render customer avatars (3D Anime Chibi Render)
    const masterCustImg = document.getElementById('master-customer-img');
    const stationCustImg = document.getElementById('customer-avatar-img');
    if (masterCustImg && this.currentCustomer.image) masterCustImg.src = this.currentCustomer.image;
    if (stationCustImg && this.currentCustomer.image) stationCustImg.src = this.currentCustomer.image;

    // Names & roles
    const masterName = document.getElementById('master-customer-name');
    const masterRole = document.getElementById('master-customer-role');
    const stationName = document.getElementById('customer-name-label');
    const stationRole = document.getElementById('customer-role-label');
    if (masterName) masterName.textContent = this.currentCustomer.nameChn;
    if (masterRole) masterRole.textContent = `(${this.currentCustomer.nameVi})`;
    if (stationName) stationName.textContent = this.currentCustomer.nameChn;
    if (stationRole) stationRole.textContent = `(${this.currentCustomer.nameVi})`;

    // 2. Reset and populate Ticket Rail
    const ticketHeader = document.getElementById('ticket-header-name');
    const ticketId = document.getElementById('ticket-order-id');
    if (ticketHeader) ticketHeader.textContent = `${this.currentCustomer.nameChn} (${this.currentCustomer.nameVi})`;
    if (ticketId) ticketId.textContent = `#${100 + this.completedOrders}`;

    const teaText = document.getElementById('ticket-tea-text');
    const teaVi = document.getElementById('ticket-tea-vi');
    const sugText = document.getElementById('ticket-sugar-text');
    const sugVi = document.getElementById('ticket-sugar-vi');
    const iceText = document.getElementById('ticket-ice-text');
    const iceVi = document.getElementById('ticket-ice-vi');
    const topText = document.getElementById('ticket-topping-text');
    const topVi = document.getElementById('ticket-topping-vi');

    if (teaText) teaText.textContent = `${this.currentOrder.topping.hanzi}${this.currentOrder.tea.hanzi}`;
    if (teaVi) teaVi.textContent = this.currentOrder.tea.vi;
    if (sugText) sugText.textContent = `${this.currentOrder.sugar.hanzi} (${this.currentOrder.sugar.percent}%)`;
    if (sugVi) sugVi.textContent = this.currentOrder.sugar.vi;
    if (iceText) iceText.textContent = this.currentOrder.ice.hanzi;
    if (iceVi) iceVi.textContent = this.currentOrder.ice.vi;
    if (topText) topText.textContent = this.currentOrder.topping.hanzi;
    if (topVi) topVi.textContent = this.currentOrder.topping.vi;

    // 3. Populate Eyeline Recipe Cards in Stations 2, 3, 4
    ['pour', 'shake', 'top'].forEach(s => {
      const t = document.getElementById(`wb-tea-${s}`);
      const sug = document.getElementById(`wb-sugar-${s}`);
      const ic = document.getElementById(`wb-ice-${s}`);
      const tp = document.getElementById(`wb-top-${s}`);
      if (t) t.textContent = `${this.currentOrder.topping.hanzi}${this.currentOrder.tea.hanzi}`;
      if (sug) sug.textContent = `${this.currentOrder.sugar.hanzi}(${this.currentOrder.sugar.percent}%)`;
      if (ic) ic.textContent = this.currentOrder.ice.hanzi;
      if (tp) tp.textContent = this.currentOrder.topping.hanzi;
    });

    this.updateSpeechBalloonUI();
    this.updateAllCupVisuals();

    // Hide next station prompt until order is taken
    const nextBtn = document.getElementById('btn-goto-pour-from-order');
    if (nextBtn) nextBtn.style.display = 'none';

    // Speak customer request
    setTimeout(() => {
      this.speakOrder();
    }, 500);
  }

  updateSpeechBalloonUI() {
    if (!this.currentOrder) return;
    const ord = this.currentOrder;

    // 1. Order Station Balloon
    const chnEl = document.getElementById('order-chinese-sentence');
    const pinEl = document.getElementById('order-pinyin-sentence');
    const viEl = document.getElementById('order-vietnamese-sentence');

    if (chnEl) {
      chnEl.innerHTML = `
        我要一杯<br>
        <strong>${ord.topping.hanzi}${ord.tea.hanzi}</strong>，<br>
        <span class="highlight-accent">${ord.sugar.hanzi}，${ord.ice.hanzi}</span>。
      `;
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
    if (mSugIce) mSugIce.textContent = `${ord.sugar.hanzi}，${ord.ice.hanzi}`;
    if (mPin) mPin.textContent = `Wǒ yào yībēi ${ord.topping.pinyin} ${ord.tea.pinyin}, ${ord.sugar.pinyin}, ${ord.ice.pinyin}.`;
    if (mVi) mVi.textContent = `Cho tôi 1 ly ${ord.tea.vi.toLowerCase()} ${ord.topping.vi.toLowerCase()}, ${ord.sugar.vi.toLowerCase()}, ${ord.ice.vi.toLowerCase()}`;
  }

  speakOrder() {
    if (!this.currentOrder) return;
    const ord = this.currentOrder;
    const sentence = `我要一杯${ord.topping.hanzi}${ord.tea.hanzi}，${ord.sugar.hanzi}，${ord.ice.hanzi}。`;
    this.audio.speak(sentence);
  }

  takeOrder() {
    this.isOrderTaken = true;
    this.audio.playPop();

    // Animate Ticket
    const ticket = document.getElementById('active-order-ticket');
    if (ticket) {
      ticket.classList.add('zoomed');
      setTimeout(() => ticket.classList.remove('zoomed'), 1200);
    }

    // Update hints & show button to Pour Station
    const hint = document.getElementById('order-footer-hint');
    if (hint) {
      hint.innerHTML = '✅ <strong>Đã ghi phiếu!</strong> Hãy chuyển sang <strong>调制台 (Trạm Rót Trà)</strong> để bắt đầu pha chế!';
    }
    const nextBtn = document.getElementById('btn-goto-pour-from-order');
    if (nextBtn) nextBtn.style.display = 'flex';

    // Update Target hints in Pour and Top stations
    const pourHint = document.getElementById('pour-target-tea-name');
    if (pourHint) pourHint.textContent = `${this.currentOrder.tea.hanzi} · ${this.currentOrder.sugar.hanzi} · ${this.currentOrder.ice.hanzi}`;

    const topHint = document.getElementById('top-target-topping-name');
    if (topHint) topHint.textContent = `${this.currentOrder.topping.hanzi} (${this.currentOrder.topping.vi})`;
  }

  // ==========================================================================
  // STATION 2: POUR STATION (HOLD TO POUR)
  // ==========================================================================
  startPouring(teaKey) {
    if (this.pourInterval) clearInterval(this.pourInterval);
    this.currentPouringTea = BOBA_VOCAB.teas.find(t => t.id === teaKey);
    this.cup.tea = this.currentPouringTea;

    // Visual liquid stream flow
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

    document.querySelectorAll('.btn-spout-lever').forEach(b => b.classList.remove('pouring'));
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
      if (this.cup.pourLevel >= 65 && this.cup.pourLevel <= 75) {
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

    } else {
      // STOP SHAKER
      this.shakerRunning = false;
      if (this.shakerTimer) clearInterval(this.shakerTimer);
      if (this.shakerSfxTimer) clearInterval(this.shakerSfxTimer);

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
    this.updatePourCupUI();
    this.audio.playDrain();
    this.showToast('💧', '已倒空水杯！请按住龙头重新倒茶。(Đã đổ hết nước đi! Hãy rót lại.)');
  }

  toggleSugar(sId) {
    if (this.cup.sugar && this.cup.sugar.id === sId) {
      this.cup.sugar = null;
      document.querySelectorAll('.btn-opt-sugar').forEach(b => b.classList.remove('active'));
      this.audio.playUndo();
      this.showToast('🍬', '已取消选择糖度 (Đã bỏ chọn đường)');
    } else {
      this.cup.sugar = BOBA_VOCAB.sugars.find(s => s.id === sId);
      document.querySelectorAll('.btn-opt-sugar').forEach(b => {
        b.classList.toggle('active', b.dataset.sugar === sId);
      });
      this.audio.playPop();
    }
  }

  toggleIce(iId) {
    if (this.cup.ice && this.cup.ice.id === iId) {
      this.cup.ice = null;
      document.querySelectorAll('.btn-opt-ice').forEach(b => b.classList.remove('active'));
      this.audio.playUndo();
      this.showToast('❄️', '已取消选择冰量 (Đã bỏ chọn đá)');
    } else {
      this.cup.ice = BOBA_VOCAB.ices.find(i => i.id === iId);
      document.querySelectorAll('.btn-opt-ice').forEach(b => {
        b.classList.toggle('active', b.dataset.ice === iId);
      });
      this.audio.playPop();
    }
  }

  clearSugarIce() {
    this.cup.sugar = null;
    this.cup.ice = null;
    document.querySelectorAll('.btn-opt-sugar, .btn-opt-ice').forEach(b => b.classList.remove('active'));
    this.audio.playUndo();
    this.showToast('✨', '重置糖度与冰量 (Đã xóa chọn đường và đá)');
  }

  // ==========================================================================
  // STATION 3 ACTIONS: SHAKER RESET
  // ==========================================================================
  resetShaker() {
    if (this.shakerTimer) clearInterval(this.shakerTimer);
    if (this.shakerSfxTimer) clearInterval(this.shakerSfxTimer);
    this.shakerRunning = false;
    this.cup.isShaken = false;
    this.cup.shakeScore = 0;
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

    this.audio.playPop();
    this.showToast('🌪️', '重新安装摇杯，请看准绿区停机！(Đã reset máy lắc!)');
  }

  // ==========================================================================
  // STATION 4: TOP STATION (ADD / REMOVE TOPPINGS, LID, STRAW)
  // ==========================================================================
  addTopping(topId) {
    if (this.cup.hasLid) {
      alert('杯子已封口！如需添加或更改配料，请先点击【取下杯盖】。(Ly đã đóng nắp kín! Vui lòng bấm [取下杯盖 (Tháo nắp)] trước khi thêm topping)');
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
      this.updateToppingsUI();
      this.showToast(topObj.icon, `已添加配料: ${topObj.hanzi} (Đã thêm ${topObj.vi})`);
    }
  }

  removeTopping(index) {
    if (this.cup.hasLid) {
      alert('杯子已封口！请先点击【取下杯盖】后再调整配料。(Ly đã đóng nắp! Vui lòng bấm [取下杯盖 (Tháo nắp)] trước)');
      return;
    }
    if (index >= 0 && index < this.cup.toppings.length) {
      const removed = this.cup.toppings.splice(index, 1)[0];
      this.audio.playUndo();
      this.updateToppingsUI();
      this.showToast('↩️', `已撤下: ${removed.hanzi} (Đã bớt ${removed.vi})`);
    }
  }

  undoLastTopping() {
    if (this.cup.hasLid) {
      alert('杯子已封口！请先点击【取下杯盖】。(Ly đã đóng nắp!)');
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
      alert('杯子已封口！请先点击【取下杯盖】。(Ly đã đóng nắp!)');
      return;
    }
    if (this.cup.toppings.length === 0) return;
    this.cup.toppings = [];
    this.audio.playDrain();
    this.updateToppingsUI();
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

    const lid = document.getElementById('final-cup-lid');
    if (lid) lid.style.display = 'flex';

    document.getElementById('btn-action-lid')?.style.setProperty('display', 'none');
    document.getElementById('btn-remove-lid')?.style.setProperty('display', 'inline-flex');

    const desc = document.getElementById('final-cup-status-desc');
    if (desc) desc.textContent = '✅ 已盖上杯盖封口！(Đã dập màng nắp ly chắc chắn)';
    this.showToast('🐻', '已封口杯盖！(Đã đóng nắp ly)');
  }

  removeLid() {
    this.cup.hasLid = false;
    this.audio.playUndo();

    const lid = document.getElementById('final-cup-lid');
    if (lid) lid.style.display = 'none';

    document.getElementById('btn-action-lid')?.style.setProperty('display', 'inline-flex');
    document.getElementById('btn-remove-lid')?.style.setProperty('display', 'none');

    const desc = document.getElementById('final-cup-status-desc');
    if (desc) desc.textContent = '🔓 已取下杯盖，可自由加减配料！';
    this.showToast('🔓', '已取下杯盖，可自由修改配料！(Đã tháo nắp ra)');
  }

  insertStraw(color) {
    this.cup.strawColor = color;
    this.audio.playPop();

    const straw = document.getElementById('final-cup-straw');
    if (straw) {
      straw.style.display = 'block';
      straw.style.background = color;
    }

    const desc = document.getElementById('final-cup-status-desc');
    if (desc) desc.textContent = '✨ 插入吸管完毕！(Đã cắm ống hút)';
    this.showToast('🥤', '已插入吸管！(Đã cắm ống hút)');
  }

  removeStraw() {
    if (!this.cup.strawColor) return;
    this.cup.strawColor = null;
    this.audio.playUndo();

    const straw = document.getElementById('final-cup-straw');
    if (straw) straw.style.display = 'none';

    const desc = document.getElementById('final-cup-status-desc');
    if (desc) desc.textContent = '已拔出吸管 (Đã rút ống hút ra)';
    this.showToast('🥤', '已拔出吸管 (Đã rút ống hút)');
  }

  // ==========================================================================
  // PAPA'S TRASH CAN: DISCARD RUINED CUP AND START FRESH
  // ==========================================================================
  trashCup(stationOrigin = 'pour') {
    this.audio.playTrash();
    this.resetCup();

    // Trigger open lid animation visual
    const trashUnit = document.getElementById(`trash-bin-${stationOrigin}`);
    if (trashUnit) {
      trashUnit.classList.add('drag-over');
      setTimeout(() => trashUnit.classList.remove('drag-over'), 600);
    }

    this.showToast('🗑️', '已将做错的奶茶丢进垃圾桶！已拿取全新空杯重新制作。(Đã vứt ly hỏng vào thùng rác! Lấy ly mới làm lại)');

    // If trashed from shaker or top station, guide back to pour station
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
    if (!this.cup.hasLid) {
      this.cup.hasLid = true;
      this.cup.strawColor = '#f43f5e';
    }

    const wasMaster = (this.currentStation === 'view-master-counter');
    if (!wasMaster) {
      this.switchStation('view-order-station');
    }

    // Calculate 4 Papa's Freezeria Criteria
    const ord = this.currentOrder;

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

    // Overall Score
    const totalScore = Math.round((orderMatch * 0.4) + (pourScore * 0.25) + (mixScore * 0.2) + (topScore * 0.15));

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

    this.updateHUD();
    this.saveGame();

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
    }

    if (reactChn) reactChn.textContent = reactionTextChn;
    if (reactVi) reactVi.textContent = reactionTextVi;

    // Show Scorecard Modal
    const modal = document.getElementById('modal-papa-score');
    if (modal) modal.style.display = 'flex';

    this.audio.playCashRegister();
    setTimeout(() => {
      this.audio.speak(reactionTextChn.replace(/“|”/g, ''));
    }, 600);
  }

  resetCup() {
    this.cup = {
      tea: null,
      pourLevel: 0,
      sugar: null,
      ice: null,
      isShaken: false,
      shakeScore: 0,
      toppings: [],
      hasLid: false,
      strawColor: null
    };

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

// Khởi tạo game khi load trang
window.addEventListener('DOMContentLoaded', () => {
  window.bobaGame = new PapaBobaGame();
});
