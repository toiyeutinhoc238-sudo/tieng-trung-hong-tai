/**
 * Tiệm Trà Sữa Của Tôi (我的奶茶店 - My Boba Tea Shop)
 * Game Engine & Interactive Learning System
 */

// ============================================================================
// AUDIO SYNTHESIZER (ZERO-LATENCY NATIVE WEB AUDIO API)
// ============================================================================
class BobaAudioSynth {
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
    gain.gain.setValueAtTime(0.4, now);
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
    osc.frequency.linearRampToValueAtTime(320, now + 0.35);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.38);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
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

  playIce() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [1200, 1500, 1800].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.04;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    });
  }

  playCoin() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [987.77, 1318.51]; // B5 -> E6
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.1;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  playSuccessChime() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.09;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  speak(text) {
    if (!this.voiceEnabled || !text) return;
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 0.85;
      const voices = (this.cachedVoices && this.cachedVoices.length) ? this.cachedVoices : window.speechSynthesis.getVoices();
      const zhVoice = voices.find(v => v.lang && (v.lang.toLowerCase().includes('zh') || v.lang.toLowerCase().includes('cmn')));
      if (zhVoice) u.voice = zhVoice;
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }
}

// ============================================================================
// VOCABULARY & RECIPES DATA
// ============================================================================
const BOBA_VOCAB = {
  teas: [
    { id: 'milktea', hanzi: '奶茶', pinyin: 'nǎichá', vi: 'Trà sữa', color: 'linear-gradient(180deg, #df9b58 0%, #b87431 100%)' },
    { id: 'blacktea', hanzi: '红茶', pinyin: 'hóngchá', vi: 'Hồng trà', color: 'linear-gradient(180deg, #993f18 0%, #682306 100%)' },
    { id: 'milk', hanzi: '鲜奶', pinyin: 'xiānnǎi', vi: 'Sữa tươi', color: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)' },
    { id: 'taro', hanzi: '芋泥奶茶', pinyin: 'yùní nǎichá', vi: 'Trà khoai môn', color: 'linear-gradient(180deg, #c084fc 0%, #9333ea 100%)' }
  ],
  toppings: [
    { id: 'boba', hanzi: '珍珠', pinyin: 'zhēnzhū', vi: 'Trân châu đen', icon: '🧋', visualColor: '#1e293b' },
    { id: 'mango', hanzi: '芒果布丁', pinyin: 'mángguǒ bùdīng', vi: 'Pudding xoài', icon: '🥭', visualColor: '#fbbf24' },
    { id: 'redbean', hanzi: '红豆', pinyin: 'hóngdòu', vi: 'Đậu đỏ', icon: '🫘', visualColor: '#b91c1c' },
    { id: 'matcha', hanzi: '抹茶冻', pinyin: 'mǒchádòng', vi: 'Thạch matcha', icon: '🍵', visualColor: '#15803d' },
    { id: 'coconut', hanzi: '椰果', pinyin: 'yēguǒ', vi: 'Thạch dừa', icon: '🥥', visualColor: '#f8fafc' },
    { id: 'taroballs', hanzi: '芋圆', pinyin: 'yùyuán', vi: 'Khoai dẻo', icon: '🍠', visualColor: '#a855f7' }
  ],
  sugars: [
    { id: 'less_sugar', hanzi: '少糖', pinyin: 'shǎo táng', vi: 'Ít đường (70%)' },
    { id: 'half_sugar', hanzi: '半糖', pinyin: 'bàn táng', vi: 'Nửa đường (50%)' },
    { id: 'full_sugar', hanzi: '多糖', pinyin: 'duō táng', vi: 'Nhiều đường (100%)' }
  ],
  ices: [
    { id: 'no_ice', hanzi: '去冰', pinyin: 'qù bīng', vi: 'Không đá' },
    { id: 'less_ice', hanzi: '少冰', pinyin: 'shǎo bīng', vi: 'Ít đá' },
    { id: 'normal_ice', hanzi: '正常', pinyin: 'zhèngcháng bīng', vi: 'Đá vừa' },
    { id: 'more_ice', hanzi: '多冰', pinyin: 'duō bīng', vi: 'Nhiều đá' }
  ]
};

// ============================================================================
// MAIN BOBA GAME ENGINE
// ============================================================================
export class BobaGameEngine {
  constructor() {
    this.audio = new BobaAudioSynth();

    // Player state
    this.coins = parseInt(localStorage.getItem('boba_coins') || '120', 10);
    this.level = parseInt(localStorage.getItem('boba_level') || '1', 10);
    this.exp = parseInt(localStorage.getItem('boba_exp') || '0', 10);
    this.completedOrders = parseInt(localStorage.getItem('boba_orders') || '1', 10);
    this.learnedWords = new Set(JSON.parse(localStorage.getItem('boba_learned') || '["珍珠", "奶茶"]'));

    // Display options
    this.showPinyin = true;
    this.showVietnamese = true;

    // Current in-progress cup
    this.cup = {
      hasCup: true,
      tea: null,
      toppings: [],
      sugar: null,
      ice: null,
      hasLid: false,
      hasStraw: false
    };

    // Current Customer order
    this.currentOrder = null;
    this.isOrderActive = false;

    // Initialize UI and game cycle
    this.initUI();
    this.bindEvents();
    this.generateNewOrder(true); // first order: 100% matches picture!
  }

  saveProgress() {
    try {
      localStorage.setItem('boba_coins', this.coins.toString());
      localStorage.setItem('boba_level', this.level.toString());
      localStorage.setItem('boba_exp', this.exp.toString());
      localStorage.setItem('boba_orders', this.completedOrders.toString());
      localStorage.setItem('boba_learned', JSON.stringify(Array.from(this.learnedWords)));
    } catch (e) {}
  }

  initUI() {
    this.updateHUD();
    this.updateLeftClipboard();
    this.renderCurrentCup();
  }

  updateHUD() {
    const coinEl = document.getElementById('hud-coin-val');
    if (coinEl) coinEl.textContent = this.coins.toLocaleString('vi-VN');

    const levelEl = document.getElementById('hud-level-tag');
    if (levelEl) levelEl.innerHTML = `<i class="fa-solid fa-store" style="color: #ea580c;"></i> Lv.${this.level}`;

    const expFill = document.getElementById('hud-level-fill');
    if (expFill) expFill.style.width = `${Math.min(100, this.exp)}%`;

    const expText = document.getElementById('hud-level-text');
    if (expText) expText.textContent = `${this.exp}/100`;

    const bookCount = document.getElementById('hud-book-val');
    if (bookCount) bookCount.textContent = `${this.learnedWords.size}/15`;
  }

  updateLeftClipboard() {
    const revEl = document.getElementById('clipboard-rev-val');
    if (revEl) revEl.textContent = `${this.coins} ¥`;

    const ordersEl = document.getElementById('clipboard-order-val');
    if (ordersEl) ordersEl.textContent = this.completedOrders;

    const wordsEl = document.getElementById('clipboard-words-val');
    if (wordsEl) wordsEl.textContent = this.learnedWords.size;
  }

  generateNewOrder(isFirst = false) {
    if (isFirst) {
      // 100% identical to the reference screenshot:
      // "我要一杯珍珠奶茶，少糖，去冰。"
      this.currentOrder = {
        tea: BOBA_VOCAB.teas.find(t => t.id === 'milktea'),
        topping: BOBA_VOCAB.toppings.find(t => t.id === 'boba'),
        sugar: BOBA_VOCAB.sugars.find(s => s.id === 'less_sugar'),
        ice: BOBA_VOCAB.ices.find(i => i.id === 'no_ice')
      };
    } else {
      // Dynamic random order matching level
      const tea = BOBA_VOCAB.teas[Math.floor(Math.random() * BOBA_VOCAB.teas.length)];
      const topping = BOBA_VOCAB.toppings[Math.floor(Math.random() * BOBA_VOCAB.toppings.length)];
      const sugar = BOBA_VOCAB.sugars[Math.floor(Math.random() * BOBA_VOCAB.sugars.length)];
      const ice = BOBA_VOCAB.ices[Math.floor(Math.random() * BOBA_VOCAB.ices.length)];

      this.currentOrder = { tea, topping, sugar, ice };
    }

    this.isOrderActive = true;
    this.renderCustomerBalloon();
    this.resetCup();

    // Auto speak customer order gently after small pause
    setTimeout(() => {
      this.speakOrder();
    }, 600);
  }

  renderCustomerBalloon() {
    const ord = this.currentOrder;
    if (!ord) return;

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
      if (this.showPinyin) {
        pinEl.style.display = 'block';
        pinEl.textContent = `Wǒ yào yībēi ${ord.topping.pinyin} ${ord.tea.pinyin}, ${ord.sugar.pinyin}, ${ord.ice.pinyin}.`;
      } else {
        pinEl.style.display = 'none';
      }
    }

    if (viEl) {
      if (this.showVietnamese) {
        viEl.style.display = 'block';
        viEl.textContent = `(Cho tôi 1 ly ${ord.tea.vi.toLowerCase()} ${ord.topping.vi.toLowerCase()}, ${ord.sugar.vi.toLowerCase()}, ${ord.ice.vi.toLowerCase()})`;
      } else {
        viEl.style.display = 'none';
      }
    }
  }

  speakOrder() {
    if (!this.currentOrder) return;
    const ord = this.currentOrder;
    const sentence = `我要一杯${ord.topping.hanzi}${ord.tea.hanzi}，${ord.sugar.hanzi}，${ord.ice.hanzi}。`;
    this.audio.speak(sentence);
  }

  resetCup() {
    this.cup = {
      hasCup: true,
      tea: null,
      toppings: [],
      sugar: null,
      ice: null,
      hasLid: false,
      hasStraw: false
    };

    // Reset UI button active states
    document.querySelectorAll('.boba-preset-btn').forEach(btn => btn.classList.remove('active'));

    this.renderCurrentCup();
  }

  renderCurrentCup() {
    const teaLayer = document.getElementById('cup-tea-layer');
    const topLayer = document.getElementById('cup-toppings-layer');
    const iceLayer = document.getElementById('cup-ice-layer');
    const lidEl = document.getElementById('live-cup-lid');
    const strawEl = document.getElementById('live-cup-straw');
    const finishBtn = document.getElementById('boba-finish-btn');

    // Render Tea
    if (teaLayer) {
      if (this.cup.tea) {
        teaLayer.style.height = '78%';
        teaLayer.style.background = this.cup.tea.color;
      } else {
        teaLayer.style.height = '0%';
      }
    }

    // Render Toppings
    if (topLayer) {
      if (this.cup.toppings.length > 0) {
        topLayer.style.height = '36px';
        topLayer.innerHTML = this.cup.toppings.map(t => `
          <span style="font-size: 0.95rem; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.4));">${t.icon}</span>
        `).join('');
      } else {
        topLayer.style.height = '0%';
        topLayer.innerHTML = '';
      }
    }

    // Render Ice
    if (iceLayer) {
      if (this.cup.ice && this.cup.ice.id !== 'no_ice') {
        iceLayer.style.display = 'flex';
        const count = (this.cup.ice.id === 'less_ice') ? 3 : (this.cup.ice.id === 'more_ice' ? 8 : 5);
        iceLayer.innerHTML = Array(count).fill('<div class="single-ice-cube"></div>').join('');
      } else {
        iceLayer.style.display = 'none';
        iceLayer.innerHTML = '';
      }
    }

    // Render Lid & Straw
    if (lidEl) lidEl.style.display = this.cup.hasLid ? 'block' : 'none';
    if (strawEl) strawEl.style.display = this.cup.hasStraw ? 'block' : 'none';

    // Finish button pulse
    if (finishBtn) {
      if (this.cup.tea && this.cup.toppings.length > 0 && this.cup.sugar && this.cup.ice) {
        finishBtn.classList.add('pulse');
      } else {
        finishBtn.classList.remove('pulse');
      }
    }
  }

  // User Actions
  addTea(teaId) {
    const tea = BOBA_VOCAB.teas.find(t => t.id === teaId);
    if (!tea) return;
    this.cup.tea = tea;
    this.audio.playPour();
    this.audio.speak(tea.hanzi);
    this.learnedWords.add(tea.hanzi);
    this.triggerCupBounce();
    this.renderCurrentCup();
  }

  addTopping(topId) {
    const topping = BOBA_VOCAB.toppings.find(t => t.id === topId);
    if (!topping) return;
    if (this.cup.toppings.length < 5) {
      this.cup.toppings.push(topping);
    }
    this.audio.playPlop();
    this.audio.speak(topping.hanzi);
    this.learnedWords.add(topping.hanzi);
    this.triggerCupBounce();
    this.renderCurrentCup();
  }

  setSugar(sugarId, btnEl) {
    const sugar = BOBA_VOCAB.sugars.find(s => s.id === sugarId);
    if (!sugar) return;
    this.cup.sugar = sugar;
    this.audio.playPop();
    this.audio.speak(sugar.hanzi);
    this.learnedWords.add(sugar.hanzi);

    document.querySelectorAll('.preset-btn-row:first-child .boba-preset-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    this.triggerCupBounce();
    this.renderCurrentCup();
  }

  setIce(iceId, btnEl) {
    const ice = BOBA_VOCAB.ices.find(i => i.id === iceId);
    if (!ice) return;
    this.cup.ice = ice;
    this.audio.playIce();
    this.audio.speak(ice.hanzi);
    this.learnedWords.add(ice.hanzi);

    document.querySelectorAll('.preset-btn-row:last-child .boba-preset-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');

    this.triggerCupBounce();
    this.renderCurrentCup();
  }

  putLid() {
    this.cup.hasLid = true;
    this.cup.hasStraw = true;
    this.audio.playPop();
    this.audio.speak('盖子');
    this.triggerCupBounce();
    this.renderCurrentCup();
  }

  shake() {
    const shakerEl = document.getElementById('shaker-cup-visual');
    if (shakerEl) {
      shakerEl.classList.add('shaking');
      this.audio.playIce();
      setTimeout(() => {
        shakerEl.classList.remove('shaking');
      }, 600);
    }
  }

  triggerCupBounce() {
    const cup = document.getElementById('live-crafting-cup');
    if (cup) {
      cup.classList.remove('bounce');
      void cup.offsetWidth; // re-flow
      cup.classList.add('bounce');
    }
  }

  // Complete & Evaluate
  finishCrafting() {
    if (!this.currentOrder) return;
    const target = this.currentOrder;
    const current = this.cup;

    // Checks
    if (!current.tea) {
      this.showToast('Bạn chưa rót trà vào cốc kìa! Hãy chọn 1 bình trà nhé 🍃');
      return;
    }
    if (current.toppings.length === 0) {
      this.showToast('Khách có yêu cầu thêm Topping kìa! Hãy múc topping nhé 🧋');
      return;
    }
    if (!current.sugar) {
      this.showToast('Hãy chọn mức Đường (少糖 / 半糖 / 多糖) nhé 🍬');
      return;
    }
    if (!current.ice) {
      this.showToast('Hãy chọn mức Đá (去冰 / 少冰 / 正常 / 多冰) nhé 🧊');
      return;
    }

    const isTeaCorrect = current.tea.id === target.tea.id;
    const hasTargetTopping = current.toppings.some(t => t.id === target.topping.id);
    const isSugarCorrect = current.sugar.id === target.sugar.id;
    const isIceCorrect = current.ice.id === target.ice.id;

    const isPerfect = isTeaCorrect && hasTargetTopping && isSugarCorrect && isIceCorrect;

    if (isPerfect) {
      // 100% PERFECT RECIPE
      this.coins += 120;
      this.exp += 25;
      this.completedOrders += 1;

      if (this.exp >= 100) {
        this.level += 1;
        this.exp = 0;
        this.audio.playSuccessChime();
      } else {
        this.audio.playCoin();
      }

      this.saveProgress();
      this.updateHUD();
      this.updateLeftClipboard();

      this.showFeedbackModal({
        success: true,
        title: '🎉 太好喝了！(Ngon Tuyệt Cú Mèo!)',
        chineseQuote: '“哇！珍珠好Q弹，味道正好，太感谢你啦！”',
        viQuote: '“Oa! Trân châu dai dẻo vừa miệng, đúng ý mình dặn luôn, cảm ơn bạn nhiều nha!”',
        rewardCoin: '+120 ¥',
        rewardExp: '+25 EXP'
      });
    } else {
      // Made mistake on something
      let mistakeDetail = '';
      if (!isTeaCorrect) mistakeDetail = `Khách chọn trà ${target.tea.hanzi} (${target.tea.vi}), bạn lại chọn ${current.tea.hanzi}!`;
      else if (!hasTargetTopping) mistakeDetail = `Khách yêu cầu topping ${target.topping.hanzi} (${target.topping.vi}) cơ mà!`;
      else if (!isSugarCorrect) mistakeDetail = `Khách dặn ${target.sugar.hanzi} (${target.sugar.vi}), bạn bấm nhầm ${current.sugar.hanzi}!`;
      else if (!isIceCorrect) mistakeDetail = `Khách dặn ${target.ice.hanzi} (${target.ice.vi}), bạn lại chọn ${current.ice.hanzi}!`;

      this.coins += 40; // consolation tip
      this.saveProgress();
      this.updateHUD();
      this.updateLeftClipboard();

      this.showFeedbackModal({
        success: false,
        title: '😅 哎呀！(Ủa, nhầm vị một chút nè...)',
        chineseQuote: '“好像和我想象的有点不一样呢...”',
        viQuote: mistakeDetail,
        rewardCoin: '+40 ¥ (Khách vẫn boa nhẹ)',
        rewardExp: '+10 EXP'
      });
    }
  }

  showFeedbackModal(data) {
    const modal = document.getElementById('boba-feedback-modal');
    if (!modal) return;

    const titleEl = document.getElementById('feedback-modal-title');
    const chnEl = document.getElementById('feedback-modal-chn');
    const viEl = document.getElementById('feedback-modal-vi');
    const coinEl = document.getElementById('feedback-reward-coin');
    const expEl = document.getElementById('feedback-reward-exp');

    if (titleEl) titleEl.textContent = data.title;
    if (chnEl) chnEl.textContent = data.chineseQuote;
    if (viEl) viEl.textContent = data.viQuote;
    if (coinEl) coinEl.textContent = data.rewardCoin;
    if (expEl) expEl.textContent = data.rewardExp;

    modal.style.display = 'flex';
  }

  closeFeedbackModal() {
    const modal = document.getElementById('boba-feedback-modal');
    if (modal) modal.style.display = 'none';
    this.generateNewOrder(false);
  }

  showCookbookModal() {
    const modal = document.getElementById('boba-cookbook-modal');
    const grid = document.getElementById('cookbook-cards-grid');
    if (!modal || !grid) return;

    let html = '';

    // Teas
    html += '<div style="font-weight: 800; color: #854019; margin: 10px 0 6px 0; font-size: 0.95rem;">🍃 Các Loại Trà (茶饮)</div><div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">';
    BOBA_VOCAB.teas.forEach(t => {
      const isLearned = this.learnedWords.has(t.hanzi);
      html += `
        <div style="background: #fff; border: 1.5px solid #fed7aa; border-radius: 10px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 1.05rem; font-weight: 800; font-family: var(--boba-font-chinese);">${t.hanzi}</div>
            <div style="font-size: 0.72rem; color: #64748b;">${t.pinyin} • ${t.vi}</div>
          </div>
          <button onclick="window.bobaGame.audio.speak('${t.hanzi}')" style="background: #e0f2fe; border: none; border-radius: 50%; width: 28px; height: 28px; color: #0284c7; cursor: pointer;">🔊</button>
        </div>
      `;
    });
    html += '</div>';

    // Toppings
    html += '<div style="font-weight: 800; color: #854019; margin: 14px 0 6px 0; font-size: 0.95rem;">🧋 Topping & Thạch (配料)</div><div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">';
    BOBA_VOCAB.toppings.forEach(t => {
      html += `
        <div style="background: #fff; border: 1.5px solid #fed7aa; border-radius: 10px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 1.05rem; font-weight: 800; font-family: var(--boba-font-chinese);">${t.icon} ${t.hanzi}</div>
            <div style="font-size: 0.72rem; color: #64748b;">${t.pinyin} • ${t.vi}</div>
          </div>
          <button onclick="window.bobaGame.audio.speak('${t.hanzi}')" style="background: #e0f2fe; border: none; border-radius: 50%; width: 28px; height: 28px; color: #0284c7; cursor: pointer;">🔊</button>
        </div>
      `;
    });
    html += '</div>';

    // Sugar & Ice
    html += '<div style="font-weight: 800; color: #854019; margin: 14px 0 6px 0; font-size: 0.95rem;">🍬 Đường & Đá (糖冰)</div><div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">';
    [...BOBA_VOCAB.sugars, ...BOBA_VOCAB.ices].forEach(t => {
      html += `
        <div style="background: #fff; border: 1.5px solid #fed7aa; border-radius: 10px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 1.05rem; font-weight: 800; font-family: var(--boba-font-chinese);">${t.hanzi}</div>
            <div style="font-size: 0.72rem; color: #64748b;">${t.pinyin} • ${t.vi}</div>
          </div>
          <button onclick="window.bobaGame.audio.speak('${t.hanzi}')" style="background: #e0f2fe; border: none; border-radius: 50%; width: 28px; height: 28px; color: #0284c7; cursor: pointer;">🔊</button>
        </div>
      `;
    });
    html += '</div>';

    grid.innerHTML = html;
    modal.style.display = 'flex';
  }

  showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: absolute;
      top: 70px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.9);
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 99px;
      font-size: 0.88rem;
      font-weight: 700;
      z-index: 999;
      box-shadow: 0 8px 20px rgba(0,0,0,0.4);
      pointer-events: none;
      transition: opacity 0.3s ease;
    `;
    toast.textContent = msg;
    document.querySelector('.boba-game-container').appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  }

  bindEvents() {
    // Cup Dispenser (Station 1)
    const cupStack = document.getElementById('station-cup-stack');
    if (cupStack) {
      cupStack.addEventListener('click', () => {
        this.audio.playPop();
        this.resetCup();
        this.showToast('Đã lấy 1 cốc mới lên bàn pha chế!');
      });
    }

    // Drinks (Station 2)
    document.querySelectorAll('.tea-dispenser-urn').forEach(urn => {
      urn.addEventListener('click', () => {
        const teaId = urn.dataset.tea;
        this.addTea(teaId);
      });
    });

    // Toppings (Station 3)
    document.querySelectorAll('.topping-slot-cell').forEach(slot => {
      slot.addEventListener('click', () => {
        const topId = slot.dataset.topping;
        this.addTopping(topId);
      });
    });

    // Sugar & Ice Buttons (Station 4)
    document.querySelectorAll('.sugar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setSugar(btn.dataset.sugar, btn);
      });
    });

    document.querySelectorAll('.ice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setIce(btn.dataset.ice, btn);
      });
    });

    // Shaker (Station 5)
    const shaker = document.getElementById('shaker-cup-visual');
    if (shaker) {
      shaker.addEventListener('click', () => this.shake());
    }

    // Lid Tray
    const lidBox = document.getElementById('lid-tray-box');
    if (lidBox) {
      lidBox.addEventListener('click', () => this.putLid());
    }

    // Finish Button
    const finishBtn = document.getElementById('boba-finish-btn');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => this.finishCrafting());
    }

    // Listen audio button
    const listenBtn = document.getElementById('order-audio-listen-btn');
    if (listenBtn) {
      listenBtn.addEventListener('click', () => this.speakOrder());
    }

    // Customer sprite click to speak
    const customerSprite = document.getElementById('customer-sprite-wrap');
    if (customerSprite) {
      customerSprite.addEventListener('click', () => this.speakOrder());
    }

    // Cookbook book icon in HUD
    const bookPill = document.getElementById('hud-book-pill');
    if (bookPill) {
      bookPill.addEventListener('click', () => this.showCookbookModal());
    }
  }
}

// Global Launch
window.addEventListener('DOMContentLoaded', () => {
  window.bobaGame = new BobaGameEngine();
});

