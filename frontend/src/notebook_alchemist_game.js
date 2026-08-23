/**
 * Tiếng Trung HongTai - Notebook Mini-Game 3: LÒ LUYỆN CHIẾT TỰ (Hanzi Alchemist)
 * Giai đoạn: Thử nghiệm nội bộ (Beta Super Admin)
 */

// Common Character-to-Radical Decomposition Database for Chinese Learning
const RADICAL_DECOMPOSITIONS = {
  '明': ['日', '月'],
  '好': ['女', '子'],
  '休': ['亻', '木'],
  '林': ['木', '木'],
  '森': ['木', '木', '木'],
  '泪': ['氵', '目'],
  '相': ['木', '目'],
  '河': ['氵', '可'],
  '江': ['氵', '工'],
  '海': ['氵', '每'],
  '清': ['氵', '青'],
  '晴': ['日', '青'],
  '请': ['讠', '青'],
  '情': ['忄', '青'],
  '校': ['木', '交'],
  '桥': ['木', '乔'],
  '和': ['禾', '口'],
  '种': ['禾', '中'],
  '秋': ['禾', '火'],
  '炎': ['火', '火'],
  '灭': ['一', '火'],
  '灯': ['火', '丁'],
  '想': ['相', '心'],
  '您': ['你', '心'],
  '们': ['亻', '门'],
  '他': ['亻', '也'],
  '她': ['女', '也'],
  '地': ['土', '也'],
  '池': ['氵', '也'],
  '时': ['日', '寸'],
  '村': ['木', '寸'],
  '过': ['辶', '寸'],
  '打': ['扌', '丁'],
  '找': ['扌', '戈'],
  '把': ['扌', '巴'],
  '爸': ['父', '巴'],
  '吧': ['口', '巴'],
  '花': ['艹', '化'],
  '草': ['艹', '早'],
  '茶': ['艹', '人', '木'],
  '药': ['艹', '约'],
  '学': ['⺌', '冖', '子'],
  '字': ['宀', '子'],
  '家': ['宀', '豕'],
  '安': ['宀', '女'],
  '看': ['手', '目'],
  '听': ['口', '斤'],
  '吃': ['口', '乞'],
  '叫': ['口', '丩'],
  '唱': ['口', '昌'],
  '喝': ['口', '曷'],
  '问': ['门', '口'],
  '间': ['门', '日'],
  '闭': ['门', '才'],
  '闪': ['门', '人'],
  '语': ['讠', '吾'],
  '话': ['讠', '舌'],
  '读': ['讠', '卖'],
  '说': ['讠', '兑'],
  '课': ['讠', '果'],
  '谢': ['讠', '身', '寸'],
  '冷': ['冫', '令'],
  '冰': ['冫', '水'],
  '凉': ['冫', '京'],
  '冬': ['夂', '冫'],
  '饭': ['饣', '反'],
  '饮': ['饣', '欠'],
  '饱': ['饣', '包'],
  '跑': ['⻊', '包'],
  '抱': ['扌', '包'],
  '红': ['纟', '工'],
  '给': ['纟', '合'],
  '绿': ['纟', '录'],
  '结': ['纟', '吉']
};

class AlchemistSoundFX {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
  }
  playTone(freq, type, duration, endFreq = null) {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
      }
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }
  playBubble() {
    this.playTone(300, 'sine', 0.1, 550);
  }
  playSuccess() {
    this.playTone(440, 'triangle', 0.15, 660);
    setTimeout(() => this.playTone(660, 'triangle', 0.25, 880), 120);
  }
  playFail() {
    this.playTone(220, 'sawtooth', 0.3, 110);
  }
  playChime() {
    this.playTone(880, 'sine', 0.35, 1320);
  }
}

export class AlchemistGameEngine {
  constructor(containerEl, wordsList, onExitCallback) {
    this.container = containerEl;
    this.rawWords = wordsList && wordsList.length >= 2 ? wordsList : [
      { word: '明', pinyin: 'míng', meaning: 'sáng sủa, rõ ràng' },
      { word: '好', pinyin: 'hǎo', meaning: 'tốt, đẹp' },
      { word: '休', pinyin: 'xiū', meaning: 'nghỉ ngơi' },
      { word: '河', pinyin: 'hé', meaning: 'con sông' },
      { word: '晴', pinyin: 'qíng', meaning: 'trời nắng ráo' },
      { word: '请', pinyin: 'qǐng', meaning: 'mời, xin vui lòng' },
      { word: '打', pinyin: 'dǎ', meaning: 'đánh, gõ' },
      { word: '看', pinyin: 'kàn', meaning: 'nhìn, xem' }
    ];
    this.onExit = onExitCallback;
    this.sfx = new AlchemistSoundFX();

    // Game Core State
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.lives = 3;
    this.maxLives = 3;
    this.timeLeft = 75;
    this.isPaused = false;
    this.isRunning = false;
    this.craftedCount = 0;

    // Current Target & Cauldron State
    this.currentTarget = null;
    this.targetRadicals = [];
    this.cauldronSlots = []; // items currently in cauldron
    this.availableRadicals = []; // radicals shown on the shelf

    this.timerInterval = null;

    this.renderLayout();
    this.bindEvents();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="alchemist-game-wrapper">
        <!-- TOP HUD -->
        <div class="cannon-hud-bar">
          <button type="button" id="alchemist-top-back-btn" class="btn btn-outline btn-sm" style="display: flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 50px;">
            <i class="fa-solid fa-arrow-left"></i> Quay lại chọn game
          </button>

          <div class="hud-item-title">
            <span style="font-size: 1.4rem;">⚗️</span>
            <strong style="color: #a855f7;">LÒ LUYỆN CHIẾT TỰ</strong>
          </div>

          <div class="hud-item hud-score">
            <i class="fa-solid fa-star" style="color: #fbbf24;"></i>
            <span class="hud-label">ĐIỂM:</span>
            <span class="hud-value" id="alchemist-score-val">0</span>
          </div>

          <div class="hud-item hud-combo">
            <i class="fa-solid fa-fire" style="color: #f97316;"></i>
            <span class="hud-label">CHUỖI:</span>
            <span class="hud-value" id="alchemist-streak-val">0</span>
          </div>

          <div class="hud-item hud-lives">
            <span class="hud-label">TIM:</span>
            <div class="hud-hearts" id="alchemist-lives-container">
              <i class="fa-solid fa-heart" style="color: #ef4444;"></i>
              <i class="fa-solid fa-heart" style="color: #ef4444;"></i>
              <i class="fa-solid fa-heart" style="color: #ef4444;"></i>
            </div>
          </div>

          <div class="hud-item hud-timer">
            <i class="fa-solid fa-clock" style="color: #38bdf8;"></i>
            <span class="hud-value" id="alchemist-timer-val">01:15</span>
          </div>

          <div style="margin-left: auto; display: flex; gap: 8px;">
            <button type="button" id="alchemist-pause-btn" class="btn btn-outline btn-sm" title="Tạm dừng"><i class="fa-solid fa-pause"></i></button>
            <button type="button" id="alchemist-exit-btn" class="btn btn-outline btn-sm" title="Thoát về sổ tay"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>

        <!-- MAIN ARENA LAYOUT -->
        <div class="alchemist-arena-grid">
          <!-- LEFT: TARGET CHARACTER DISPLAY -->
          <div class="alchemist-target-card">
            <div class="alchemist-quest-tag">MỤC TIÊU CẦN LUYỆN THÀNH</div>
            
            <div class="alchemist-target-main">
              <div class="target-zh-glow" id="alchemist-target-zh">明</div>
              <div class="target-pinyin-glow" id="alchemist-target-pinyin">(míng)</div>
              <div class="target-meaning-box">
                <span class="meaning-label">Nghĩa tiếng Việt:</span>
                <div class="meaning-val" id="alchemist-target-meaning">sáng sủa, rõ ràng</div>
              </div>
            </div>

            <div class="alchemist-hint-box">
              <i class="fa-solid fa-wand-magic-sparkles" style="color: #c084fc;"></i>
              <span>Chọn các bộ thủ từ kệ nguyên liệu để hợp nhất tạo nên chữ Hán trên!</span>
            </div>
          </div>

          <!-- CENTER: MAGICAL CAULDRON (VẠC LUYỆN KIM) -->
          <div class="alchemist-cauldron-container">
            <div class="cauldron-aura"></div>
            
            <!-- CAULDRON VISUAL -->
            <div class="cauldron-pot">
              <div class="cauldron-rim"></div>
              <div class="cauldron-liquid" id="cauldron-liquid">
                <div class="cauldron-bubble b1"></div>
                <div class="cauldron-bubble b2"></div>
                <div class="cauldron-bubble b3"></div>
              </div>
              
              <!-- SLOTS FOR CHOSEN RADICALS -->
              <div class="cauldron-slots-wrap" id="cauldron-slots-wrap">
                <!-- Slot 1 -->
                <div class="cauldron-slot" data-index="0" id="slot-0">
                  <span class="slot-placeholder">?</span>
                </div>
                <div class="slot-plus">+</div>
                <!-- Slot 2 -->
                <div class="cauldron-slot" data-index="1" id="slot-1">
                  <span class="slot-placeholder">?</span>
                </div>
                <!-- Optional Slot 3 -->
                <div class="slot-plus slot-plus-3" style="display: none;">+</div>
                <div class="cauldron-slot slot-3" data-index="2" id="slot-2" style="display: none;">
                  <span class="slot-placeholder">?</span>
                </div>
              </div>
            </div>

            <!-- ACTION BUTTONS -->
            <div class="cauldron-actions">
              <button type="button" id="btn-clear-cauldron" class="btn btn-outline" style="border-radius: 50px; font-weight: 700;">
                <i class="fa-solid fa-arrow-rotate-left"></i> Đổ Lại
              </button>
              <button type="button" id="btn-fuse-cauldron" class="btn btn-primary btn-fuse-glow">
                <i class="fa-solid fa-wand-magic-sparkles"></i> LUYỆN HÓA ✨
              </button>
            </div>
          </div>

          <!-- RIGHT / BOTTOM: INGREDIENTS SHELF (BỘ THỦ NGUYÊN LIỆU) -->
          <div class="alchemist-shelf-card">
            <div class="shelf-title">
              <i class="fa-solid fa-gem" style="color: #38bdf8;"></i> KỆ BỘ THỦ NGUYÊN LIỆU
            </div>
            <div class="shelf-hint">Nhấp vào thẻ bộ thủ để nạp vào vạc luyện kim</div>

            <div class="radicals-grid" id="radicals-shelf-grid">
              <!-- Dynamically populated radical buttons -->
            </div>
          </div>
        </div>

        <!-- MODAL OVERLAY (VICTORY / GAME OVER) -->
        <div id="alchemist-modal-overlay" class="cannon-modal-overlay" style="display: none;">
          <div class="cannon-result-card">
            <div id="alchemist-result-icon" class="result-icon">⚗️</div>
            <h2 id="alchemist-result-title" class="result-title">Hoàn Thành Màn Chơi!</h2>
            <p id="alchemist-result-desc" class="result-desc">Bạn đã xuất sắc luyện thành công các chữ Hán!</p>
            
            <div class="result-stats-grid">
              <div class="stat-pill">
                <span class="label">Tổng Điểm</span>
                <span class="val" id="alchemist-res-score">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Chuỗi Tối Đa</span>
                <span class="val" id="alchemist-res-streak">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Chữ Đã Luyện</span>
                <span class="val" id="alchemist-res-words">0</span>
              </div>
            </div>

            <div class="result-beta-note">
              <i class="fa-solid fa-flask"></i> <strong>Chế độ thử nghiệm:</strong> Điểm số và thành tích không lưu vào hồ sơ trong giai đoạn Beta Super Admin.
            </div>

            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
              <button type="button" id="alchemist-retry-btn" class="btn btn-primary" style="padding: 10px 20px; font-weight: 800;"><i class="fa-solid fa-rotate-right"></i> Chơi Lại</button>
              <button type="button" id="alchemist-back-hub-btn" class="btn btn-secondary" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-gamepad"></i> Đổi Trò Chơi</button>
              <button type="button" id="alchemist-finish-btn" class="btn btn-outline" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-book-bookmark"></i> Quay Lại Sổ Tay</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const topBackBtn = this.container.querySelector('#alchemist-top-back-btn');
    const pauseBtn = this.container.querySelector('#alchemist-pause-btn');
    const exitBtn = this.container.querySelector('#alchemist-exit-btn');
    const retryBtn = this.container.querySelector('#alchemist-retry-btn');
    const backHubBtn = this.container.querySelector('#alchemist-back-hub-btn');
    const finishBtn = this.container.querySelector('#alchemist-finish-btn');
    const clearBtn = this.container.querySelector('#btn-clear-cauldron');
    const fuseBtn = this.container.querySelector('#btn-fuse-cauldron');

    if (topBackBtn) {
      topBackBtn.addEventListener('click', () => this.stopAndExit());
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.togglePause());
    }

    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        this.stopAndExit();
        if (typeof window.exitNotebookGamesHub === 'function') {
          window.exitNotebookGamesHub();
        }
      });
    }

    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.restart());
    }

    if (backHubBtn) {
      backHubBtn.addEventListener('click', () => this.stopAndExit());
    }

    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        this.stopAndExit();
        if (typeof window.exitNotebookGamesHub === 'function') {
          window.exitNotebookGamesHub();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearCauldron());
    }

    if (fuseBtn) {
      fuseBtn.addEventListener('click', () => this.attemptFusion());
    }
  }

  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.lives = 3;
    this.timeLeft = 75;
    this.craftedCount = 0;
    this.cauldronSlots = [];

    this.nextQuestion();
    this.updateHUD();
    this.startTimers();
  }

  startTimers() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.isRunning || this.isPaused) return;
      this.timeLeft--;

      if (this.timeLeft <= 0) {
        this.gameOver(true);
      }
      this.updateHUD();
    }, 1000);
  }

  getDecompositionForWord(word) {
    if (!word) return ['日', '月'];
    // Check single character dictionary
    for (let char of word) {
      if (RADICAL_DECOMPOSITIONS[char]) {
        return { char: char, parts: RADICAL_DECOMPOSITIONS[char] };
      }
    }
    // Dynamic fallbacks
    const firstChar = word[0] || '明';
    if (RADICAL_DECOMPOSITIONS[firstChar]) {
      return { char: firstChar, parts: RADICAL_DECOMPOSITIONS[firstChar] };
    }
    return { char: firstChar, parts: ['亻', '木'] };
  }

  nextQuestion() {
    this.cauldronSlots = [];
    
    // Pick random target from rawWords
    const randomObj = this.rawWords[Math.floor(Math.random() * this.rawWords.length)];
    const decomp = this.getDecompositionForWord(randomObj.word);

    this.currentTarget = {
      fullWord: randomObj.word,
      char: decomp.char,
      pinyin: randomObj.pinyin,
      meaning: randomObj.meaning,
      requiredParts: decomp.parts
    };

    // Update target displays
    const zhEl = this.container.querySelector('#alchemist-target-zh');
    const pyEl = this.container.querySelector('#alchemist-target-pinyin');
    const mnEl = this.container.querySelector('#alchemist-target-meaning');

    if (zhEl) zhEl.textContent = this.currentTarget.char;
    if (pyEl) pyEl.textContent = `(${this.currentTarget.pinyin})`;
    if (mnEl) mnEl.textContent = this.currentTarget.meaning;

    // Configure Cauldron Slots (2 or 3)
    const neededCount = this.currentTarget.requiredParts.length;
    const slot3 = this.container.querySelector('#slot-2');
    const plus3 = this.container.querySelector('.slot-plus-3');
    if (slot3 && plus3) {
      slot3.style.display = neededCount >= 3 ? 'flex' : 'none';
      plus3.style.display = neededCount >= 3 ? 'block' : 'none';
    }

    // Build Shelf of Radical Ingredients (Correct parts + Distractors)
    const distractorPool = ['氵', '木', '日', '月', '亻', '口', '女', '子', '讠', '心', '扌', '火', '门', '辶', '艹', '土', '纟', '饣', '禾', '目'];
    const correctParts = [...this.currentTarget.requiredParts];
    const neededDistractorsCount = Math.max(6, 10 - correctParts.length);

    const filteredDistractors = distractorPool.filter(r => !correctParts.includes(r));
    const shuffledDistractors = [...filteredDistractors].sort(() => 0.5 - Math.random()).slice(0, neededDistractorsCount);

    this.availableRadicals = [...correctParts, ...shuffledDistractors].sort(() => 0.5 - Math.random());

    this.renderShelf();
    this.updateCauldronDisplay();
  }

  renderShelf() {
    const grid = this.container.querySelector('#radicals-shelf-grid');
    if (!grid) return;

    grid.innerHTML = '';
    this.availableRadicals.forEach((rad, idx) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'radical-crystal-btn';
      card.innerHTML = `
        <span class="rad-char">${rad}</span>
        <span class="rad-sparkle">✨</span>
      `;
      card.addEventListener('click', () => {
        this.addRadicalToCauldron(rad);
      });
      grid.appendChild(card);
    });
  }

  addRadicalToCauldron(rad) {
    const maxSlots = this.currentTarget.requiredParts.length;
    if (this.cauldronSlots.length >= maxSlots) {
      this.showToast('Vạc đã đầy! Nhấn Luyện Hóa hoặc Đổ Lại.');
      return;
    }

    this.sfx.playBubble();
    this.cauldronSlots.push(rad);
    this.updateCauldronDisplay();

    // Auto-fuse if all slots are filled
    if (this.cauldronSlots.length === maxSlots) {
      setTimeout(() => this.attemptFusion(), 250);
    }
  }

  removeSlotItem(index) {
    if (this.cauldronSlots[index]) {
      this.cauldronSlots.splice(index, 1);
      this.updateCauldronDisplay();
    }
  }

  clearCauldron() {
    this.cauldronSlots = [];
    this.updateCauldronDisplay();
  }

  updateCauldronDisplay() {
    const maxSlots = this.currentTarget ? this.currentTarget.requiredParts.length : 2;
    for (let i = 0; i < 3; i++) {
      const slotEl = this.container.querySelector(`#slot-${i}`);
      if (slotEl) {
        const item = this.cauldronSlots[i];
        if (item) {
          slotEl.innerHTML = `<span class="slot-filled-char">${item}</span>`;
          slotEl.classList.add('filled');
          slotEl.onclick = () => this.removeSlotItem(i);
        } else {
          slotEl.innerHTML = `<span class="slot-placeholder">?</span>`;
          slotEl.classList.remove('filled');
          slotEl.onclick = null;
        }
      }
    }
  }

  attemptFusion() {
    if (!this.currentTarget) return;
    const required = [...this.currentTarget.requiredParts].sort();
    const current = [...this.cauldronSlots].sort();

    const isMatch = required.length === current.length && required.every((val, idx) => val === current[idx]);

    const liquid = this.container.querySelector('#cauldron-liquid');

    if (isMatch) {
      // SUCCESS!
      this.sfx.playSuccess();
      if (liquid) liquid.classList.add('fusion-success');
      
      const pts = 30 + this.streak * 5;
      this.score += pts;
      this.streak++;
      this.craftedCount++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;

      if (window.speakText) window.speakText(this.currentTarget.fullWord);
      this.showToast(`✨ Luyện Thành Công Chữ「${this.currentTarget.char}」! +${pts} Điểm`);

      setTimeout(() => {
        if (liquid) liquid.classList.remove('fusion-success');
        this.nextQuestion();
        this.updateHUD();
      }, 700);

    } else {
      // FAIL!
      this.sfx.playFail();
      if (liquid) liquid.classList.add('fusion-fail');
      this.lives--;
      this.streak = 0;
      this.showToast('💨 Hợp thể thất bại! Sai thành phần bộ thủ.', true);

      setTimeout(() => {
        if (liquid) liquid.classList.remove('fusion-fail');
        this.clearCauldron();
        if (this.lives <= 0) {
          this.gameOver(false);
        }
        this.updateHUD();
      }, 600);
    }
  }

  updateHUD() {
    const scoreVal = this.container.querySelector('#alchemist-score-val');
    const streakVal = this.container.querySelector('#alchemist-streak-val');
    const livesContainer = this.container.querySelector('#alchemist-lives-container');
    const timerVal = this.container.querySelector('#alchemist-timer-val');

    if (scoreVal) scoreVal.textContent = this.score;
    if (streakVal) streakVal.textContent = this.streak;

    if (livesContainer) {
      livesContainer.innerHTML = '';
      for (let i = 0; i < this.maxLives; i++) {
        const heart = document.createElement('i');
        heart.className = i < this.lives ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        heart.style.color = i < this.lives ? '#ef4444' : 'rgba(255,255,255,0.3)';
        livesContainer.appendChild(heart);
      }
    }

    if (timerVal) {
      const min = Math.floor(this.timeLeft / 60);
      const sec = this.timeLeft % 60;
      timerVal.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }
  }

  showToast(msg, isError = false) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, isError);
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseBtn = this.container.querySelector('#alchemist-pause-btn');
    if (pauseBtn) {
      pauseBtn.innerHTML = `<i class="fa-solid fa-${this.isPaused ? 'play' : 'pause'}"></i>`;
    }
    this.showToast(this.isPaused ? 'Đã tạm dừng game ⏸' : 'Tiếp tục chơi ▶️');
  }

  gameOver(isVictory) {
    this.isRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);

    const overlay = this.container.querySelector('#alchemist-modal-overlay');
    const icon = this.container.querySelector('#alchemist-result-icon');
    const title = this.container.querySelector('#alchemist-result-title');
    const desc = this.container.querySelector('#alchemist-result-desc');
    const resScore = this.container.querySelector('#alchemist-res-score');
    const resStreak = this.container.querySelector('#alchemist-res-streak');
    const resWords = this.container.querySelector('#alchemist-res-words');

    if (overlay) {
      overlay.style.display = 'flex';
      if (icon) icon.textContent = isVictory ? '🏆' : '💨';
      if (title) title.textContent = isVictory ? 'Nhà Giả Kim Xuất Sắc!' : 'Hết Tim - Luyện Thất Bại!';
      if (desc) desc.textContent = isVictory ? 'Bạn đã hoàn thành thời gian thử nghiệm và chế tạo nhiều chữ Hán!' : 'Hãy chú ý quan sát các nét bộ thủ cấu thành chữ Hán nhé!';
      if (resScore) resScore.textContent = this.score;
      if (resStreak) resStreak.textContent = this.maxStreak;
      if (resWords) resWords.textContent = this.craftedCount;

      const retryBtn = overlay.querySelector('#alchemist-retry-btn');
      const backHubBtn = overlay.querySelector('#alchemist-back-hub-btn');
      const finishBtn = overlay.querySelector('#alchemist-finish-btn');

      if (retryBtn) retryBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); this.restart(); };
      if (backHubBtn) backHubBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); this.stopAndExit(); };
      if (finishBtn) finishBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.stopAndExit();
        if (typeof window.exitNotebookGamesHub === 'function') window.exitNotebookGamesHub();
      };
    }
  }

  restart() {
    const overlay = this.container.querySelector('#alchemist-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    this.start();
  }

  stopAndExit() {
    this.isRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.onExit) this.onExit();
  }
}
