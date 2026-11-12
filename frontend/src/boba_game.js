/**
 * Tiệm Trà Sữa Của Tôi (我的奶茶店 - Papa's Boba Cafe)
 * Core Game Engine: Papa's Freezeria Station-Based Simulation System
 */

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
  { id: 'xiaoyu', nameChn: '小雨', nameVi: 'Bé Mưa', role: 'Bé gái dễ thương', emoji: '👧' },
  { id: 'xiaohao', nameChn: '小浩', nameVi: 'Tiểu Hạo', role: 'Học sinh tiểu học', emoji: '👦' },
  { id: 'xiaotong', nameChn: '晓彤', nameVi: 'Hiểu Đồng', role: 'Nữ sinh trung học', emoji: '👩‍🎓' },
  { id: 'linjie', nameChn: '林姐', nameVi: 'Chị Lâm', role: 'Chị gái văn phòng', emoji: '👩‍💼' },
  { id: 'wangshu', nameChn: '王叔', nameVi: 'Chú Vương', role: 'Bác hàng xóm', emoji: '👨' },
  { id: 'abao', nameChn: '阿宝', nameVi: 'Gấu A Bảo', role: 'Linh vật đáng yêu', emoji: '🐼' }
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
    this.currentStation = 'view-order-station';

    // Order State
    this.currentCustomer = null;
    this.currentOrder = null;
    this.isOrderTaken = false;

    // Cup Crafting State in Stations
    this.cup = {
      tea: null,
      pourLevel: 0, // 0 to 100
      sugar: null,
      ice: null,
      isShaken: false,
      shakeScore: 0,
      topping: null,
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

    // Ticket Rail zoom
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

    // Sugar buttons
    document.querySelectorAll('.btn-opt-sugar').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-opt-sugar').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const sId = btn.dataset.sugar;
        this.cup.sugar = BOBA_VOCAB.sugars.find(s => s.id === sId);
        this.audio.playPop();
      });
    });

    // Ice buttons
    document.querySelectorAll('.btn-opt-ice').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-opt-ice').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const iId = btn.dataset.ice;
        this.cup.ice = BOBA_VOCAB.ices.find(i => i.id === iId);
        this.audio.playPop();
      });
    });

    // Shake Station Trigger
    document.getElementById('btn-shaker-trigger')?.addEventListener('click', () => {
      this.toggleShaker();
    });

    // Top Station Topping selection
    document.querySelectorAll('.topping-tub-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.topping-tub-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const topId = card.dataset.topping;
        this.selectTopping(topId);
      });
    });

    // Seal Lid Button
    document.getElementById('btn-action-lid')?.addEventListener('click', () => {
      this.sealLid();
    });

    // Straw selection
    document.querySelectorAll('.btn-color-straw').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        this.insertStraw(color);
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
      this.switchStation('view-order-station');
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
  // STATION 1: ORDER STATION
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

    // Render customer avatar
    const nameLabel = document.getElementById('customer-name-label');
    const roleLabel = document.getElementById('customer-role-label');
    const emojiSpan = document.querySelector('.customer-chibi-emoji');
    if (nameLabel) nameLabel.textContent = this.currentCustomer.nameChn;
    if (roleLabel) roleLabel.textContent = `(${this.currentCustomer.nameVi})`;
    if (emojiSpan) emojiSpan.textContent = this.currentCustomer.emoji;

    // Reset order ticket
    const ticketHeader = document.getElementById('ticket-header-name');
    if (ticketHeader) ticketHeader.textContent = this.currentCustomer.nameChn;

    const teaText = document.getElementById('ticket-tea-text');
    const sugText = document.getElementById('ticket-sugar-text');
    const iceText = document.getElementById('ticket-ice-text');
    const topText = document.getElementById('ticket-topping-text');

    if (teaText) teaText.textContent = this.currentOrder.tea.hanzi;
    if (sugText) sugText.textContent = this.currentOrder.sugar.hanzi;
    if (iceText) iceText.textContent = this.currentOrder.ice.hanzi;
    if (topText) topText.textContent = this.currentOrder.topping.hanzi;

    this.updateSpeechBalloonUI();

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
  // STATION 4: TOP STATION (TOPPING, LID, STRAW)
  // ==========================================================================
  selectTopping(topId) {
    this.cup.topping = BOBA_VOCAB.toppings.find(t => t.id === topId);
    this.audio.playPlop();

    // Render topping in final cup
    const topLayer = document.getElementById('final-cup-toppings');
    const desc = document.getElementById('final-cup-status-desc');
    if (topLayer && this.cup.topping) {
      topLayer.innerHTML = `
        <span style="font-size:1.6rem;">${this.cup.topping.icon}</span>
        <span style="font-size:1.4rem;">${this.cup.topping.icon}</span>
        <span style="font-size:1.2rem;">${this.cup.topping.icon}</span>
      `;
    }
    if (desc) {
      desc.textContent = `Đã thêm: ${this.cup.topping.hanzi} (${this.cup.topping.vi})`;
    }
  }

  sealLid() {
    this.cup.hasLid = true;
    this.audio.playPop();

    const lid = document.getElementById('final-cup-lid');
    if (lid) lid.style.display = 'flex';

    const desc = document.getElementById('final-cup-status-desc');
    if (desc) desc.textContent = '✅ Đã dập màng nắp ly chắc chắn!';
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
    if (desc) desc.textContent = '✨ Cắm ống hút hoàn tất!';
  }

  // ==========================================================================
  // SERVE & PAPA'S FREEZERIA SCORE CARD
  // ==========================================================================
  serveDrinkToCustomer() {
    if (!this.cup.hasLid) {
      alert('Vui lòng dập nắp ly trước khi trả món cho khách!');
      return;
    }
    if (!this.cup.strawColor) {
      alert('Vui lòng cắm ống hút cho ly trà sữa!');
      return;
    }

    // Switch to Order Station
    this.switchStation('view-order-station');

    // Calculate 4 Papa's Freezeria Criteria
    const ord = this.currentOrder;

    // 1. Order Match Accuracy (40%)
    let orderMatch = 100;
    if (!this.cup.tea || this.cup.tea.id !== ord.tea.id) orderMatch -= 40;
    if (!this.cup.topping || this.cup.topping.id !== ord.topping.id) orderMatch -= 30;
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
    if (!this.cup.topping) topScore -= 40;
    if (!this.cup.hasLid) topScore -= 30;
    if (!this.cup.strawColor) topScore -= 30;

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
      topping: null,
      hasLid: false,
      strawColor: null
    };

    // Reset UI in Pour Station
    const liquid = document.getElementById('pour-cup-liquid');
    if (liquid) liquid.style.height = '0%';
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

    // Reset UI in Top Station
    document.querySelectorAll('.topping-tub-card').forEach(c => c.classList.remove('selected'));
    const finalTop = document.getElementById('final-cup-toppings');
    if (finalTop) finalTop.innerHTML = '';
    const finalLid = document.getElementById('final-cup-lid');
    if (finalLid) finalLid.style.display = 'none';
    const finalStraw = document.getElementById('final-cup-straw');
    if (finalStraw) finalStraw.style.display = 'none';
    const desc = document.getElementById('final-cup-status-desc');
    if (desc) desc.textContent = 'Chưa thêm topping';
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
