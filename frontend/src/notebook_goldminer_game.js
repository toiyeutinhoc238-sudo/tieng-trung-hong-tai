/**
 * Tiếng Trung HongTai - Notebook Mini-Game 6: THỢ MỎ ĐÀO VÀNG TỪ VỰNG (Gold Miner Vocab)
 * Giai đoạn: Thử nghiệm nội bộ (Beta Super Admin)
 */

class MinerSoundFX {
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
  playShoot() {
    this.playTone(300, 'sine', 0.15, 120);
  }
  playGrabTarget() {
    this.playTone(587.33, 'triangle', 0.15, 880); // D5 to A5
  }
  playGrabRock() {
    this.playTone(140, 'square', 0.2, 70);
  }
  playExplode() {
    this.playTone(90, 'sawtooth', 0.35, 30);
  }
}

export class GoldMinerGameEngine {
  constructor(containerEl, wordsList, onExitCallback) {
    this.container = containerEl;
    this.rawWords = wordsList && wordsList.length >= 4 ? wordsList : [
      { word: '大', pinyin: 'dà', meaning: 'to lớn' },
      { word: '小', pinyin: 'xiǎo', meaning: 'nhỏ bé' },
      { word: '多', pinyin: 'duō', meaning: 'nhiều' },
      { word: '少', pinyin: 'shǎo', meaning: 'ít' },
      { word: '高兴', pinyin: 'gāoxìng', meaning: 'vui vẻ' },
      { word: '难过', pinyin: 'nánguò', meaning: 'buồn bã' },
      { word: '买', pinyin: 'mǎi', meaning: 'mua' },
      { word: '卖', pinyin: 'mài', meaning: 'bán' }
    ];
    this.onExit = onExitCallback;
    this.sfx = new MinerSoundFX();

    // Game State
    this.score = 0;
    this.targetScore = 300;
    this.level = 1;
    this.maxLevel = 3;
    this.timeLeft = 60;
    this.dynamiteCount = 2;
    this.isPaused = false;
    this.isRunning = false;
    this.targetsGrabbedCount = 0;

    // Hook State
    this.hook = {
      x: 400,
      y: 65,
      angle: 0,
      angleDir: 1,
      angleSpeed: 1.6, // rad/s
      length: 40,
      minLen: 40,
      maxLen: 550,
      state: 'SWINGING', // 'SWINGING' | 'SHOOTING' | 'RETRACTING'
      speed: 380,
      grabbedItem: null
    };

    // Underground objects
    this.currentTargetWord = null;
    this.items = [];

    this.timerInterval = null;
    this.animFrameId = null;
    this.lastFrameTime = 0;

    this.renderLayout();
    this.initCanvas();
    this.bindEvents();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="miner-game-wrapper">
        <!-- TOP HUD -->
        <div class="cannon-hud-bar">
          <button type="button" id="miner-top-back-btn" class="btn btn-outline btn-sm" style="display: flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 50px;">
            <i class="fa-solid fa-arrow-left"></i> Quay lại chọn game
          </button>

          <div class="hud-item-title">
            <span style="font-size: 1.4rem;">⛏️</span>
            <strong style="color: #fbbf24;">THỢ MỎ ĐÀO VÀNG</strong>
          </div>

          <div class="hud-item hud-level-badge" id="miner-level-badge">MÀN 1</div>

          <div class="hud-item hud-score">
            <i class="fa-solid fa-coins" style="color: #fbbf24;"></i>
            <span class="hud-label">TIỀN VÀNG:</span>
            <span class="hud-value" id="miner-score-val">$0</span>
          </div>

          <div class="hud-item hud-combo">
            <i class="fa-solid fa-bullseye" style="color: #38bdf8;"></i>
            <span class="hud-label">MỤC TIÊU:</span>
            <span class="hud-value" id="miner-target-score-val">$300</span>
          </div>

          <div class="hud-item hud-timer">
            <i class="fa-solid fa-clock" style="color: #38bdf8;"></i>
            <span class="hud-value" id="miner-timer-val">01:00</span>
          </div>

          <div style="margin-left: auto; display: flex; gap: 8px;">
            <button type="button" id="miner-pause-btn" class="btn btn-outline btn-sm" title="Tạm dừng"><i class="fa-solid fa-pause"></i></button>
            <button type="button" id="miner-exit-btn" class="btn btn-outline btn-sm" title="Thoát về sổ tay"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>

        <!-- MAIN CANVAS ARENA -->
        <div class="miner-arena-container" id="miner-arena-container">
          <!-- QUEST PROMPT BANNER -->
          <div class="miner-quest-banner" id="miner-quest-banner">
            <div class="quest-title-tag">MỤC TIÊU ĐÀO VÀNG</div>
            <div class="quest-text-wrap">
              HÃY KÉO TỪ CÓ NGHĨA: <strong class="quest-highlight" id="miner-target-meaning">to lớn</strong> 
              <span id="miner-target-pinyin-hint">(dà)</span>
            </div>
          </div>

          <!-- 2D CANVAS -->
          <canvas id="miner-canvas" class="miner-canvas"></canvas>

          <!-- BOTTOM ACTION LAUNCH BAR -->
          <div class="miner-action-bar">
            <button type="button" id="miner-launch-btn" class="btn btn-primary miner-launch-btn">
              <i class="fa-solid fa-anchor"></i> THẢ MỎ NEO (Phím Space / Mũi tên xuống)
            </button>
            <button type="button" id="miner-tnt-btn" class="btn btn-danger miner-tnt-btn" title="Nổ bỏ đồ nặng đang kéo">
              🧨 DÙNG THUỐC NỔ (<span id="miner-tnt-count">x2</span>)
            </button>
          </div>
        </div>

        <!-- MODAL OVERLAY -->
        <div id="miner-modal-overlay" class="cannon-modal-overlay" style="display: none;">
          <div class="cannon-result-card">
            <div id="miner-result-icon" class="result-icon">⛏️</div>
            <h2 id="miner-result-title" class="result-title">Hoàn Thành Màn Chơi!</h2>
            <p id="miner-result-desc" class="result-desc">Chúc mừng bạn đã đạt chỉ tiêu vàng thành công!</p>
            
            <div class="result-stats-grid">
              <div class="stat-pill">
                <span class="label">Màn Đạt Được</span>
                <span class="val" id="miner-res-level">MÀN 1</span>
              </div>
              <div class="stat-pill">
                <span class="label">Tổng Tiền Vàng</span>
                <span class="val" id="miner-res-score">$0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Từ Đúng Đã Đào</span>
                <span class="val" id="miner-res-words">0</span>
              </div>
            </div>

            <div class="result-beta-note">
              <i class="fa-solid fa-flask"></i> <strong>Chế độ thử nghiệm:</strong> Điểm số và thành tích không lưu vào hồ sơ trong giai đoạn Beta Super Admin.
            </div>

            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
              <button type="button" id="miner-retry-btn" class="btn btn-primary" style="padding: 10px 20px; font-weight: 800;"><i class="fa-solid fa-rotate-right"></i> Chơi Lại</button>
              <button type="button" id="miner-back-hub-btn" class="btn btn-secondary" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-gamepad"></i> Đổi Trò Chơi</button>
              <button type="button" id="miner-finish-btn" class="btn btn-outline" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-book-bookmark"></i> Quay Lại Sổ Tay</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  initCanvas() {
    this.canvas = this.container.querySelector('#miner-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    const container = this.container.querySelector('#miner-arena-container');
    const width = Math.min(840, container.clientWidth || 800);
    const height = 500;

    this.canvas.width = width;
    this.canvas.height = height;
    this.hook.x = width / 2;
    this.hook.y = 55;
  }

  bindEvents() {
    const topBackBtn = this.container.querySelector('#miner-top-back-btn');
    const pauseBtn = this.container.querySelector('#miner-pause-btn');
    const exitBtn = this.container.querySelector('#miner-exit-btn');
    const retryBtn = this.container.querySelector('#miner-retry-btn');
    const backHubBtn = this.container.querySelector('#miner-back-hub-btn');
    const finishBtn = this.container.querySelector('#miner-finish-btn');
    const launchBtn = this.container.querySelector('#miner-launch-btn');
    const tntBtn = this.container.querySelector('#miner-tnt-btn');

    if (topBackBtn) topBackBtn.addEventListener('click', () => this.stopAndExit());
    if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
    if (exitBtn) exitBtn.addEventListener('click', () => {
      this.stopAndExit();
      if (typeof window.exitNotebookGamesHub === 'function') window.exitNotebookGamesHub();
    });
    if (retryBtn) retryBtn.addEventListener('click', () => this.restart());
    if (backHubBtn) backHubBtn.addEventListener('click', () => this.stopAndExit());
    if (finishBtn) finishBtn.addEventListener('click', () => {
      this.stopAndExit();
      if (typeof window.exitNotebookGamesHub === 'function') window.exitNotebookGamesHub();
    });

    if (launchBtn) launchBtn.addEventListener('click', () => this.shootHook());
    if (tntBtn) tntBtn.addEventListener('click', () => this.useDynamite());

    if (this.canvas) {
      this.canvas.addEventListener('click', (e) => {
        e.preventDefault();
        this.shootHook();
      });
      this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.shootHook();
      }, { passive: false });
    }

    this.keyHandler = (e) => {
      if (!this.isRunning || this.isPaused) return;
      if (e.code === 'Space' || e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault();
        this.shootHook();
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        this.useDynamite();
      }
    };
    window.addEventListener('keydown', this.keyHandler);

    this.resizeHandler = () => this.initCanvas();
    window.addEventListener('resize', this.resizeHandler);
  }

  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.score = 0;
    this.level = 1;
    this.targetScore = 350;
    this.timeLeft = 60;
    this.dynamiteCount = 2;
    this.targetsGrabbedCount = 0;
    this.lastFrameTime = performance.now();

    this.resetHook();
    this.spawnLevelItems();
    this.updateHUD();
    this.startTimers();
    this.loop(performance.now());
  }

  startTimers() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.isRunning || this.isPaused) return;
      this.timeLeft--;

      if (this.timeLeft <= 0) {
        if (this.score >= this.targetScore) {
          this.levelUp();
        } else {
          this.gameOver(false);
        }
      }
      this.updateHUD();
    }, 1000);
  }

  resetHook() {
    this.hook.length = this.hook.minLen;
    this.hook.state = 'SWINGING';
    this.hook.grabbedItem = null;
    this.hook.speed = 380;
  }

  spawnLevelItems() {
    this.items = [];
    const w = this.canvas ? this.canvas.width : 800;
    const h = this.canvas ? this.canvas.height : 500;

    // Pick target word
    const randomTarget = this.rawWords[Math.floor(Math.random() * this.rawWords.length)];
    this.currentTargetWord = randomTarget;

    const meaningEl = this.container.querySelector('#miner-target-meaning');
    const pinyinEl = this.container.querySelector('#miner-target-pinyin-hint');
    if (meaningEl) meaningEl.textContent = randomTarget.meaning;
    if (pinyinEl) pinyinEl.textContent = `(${randomTarget.pinyin})`;

    // Target Gold Nugget (Big Gold + Glowing Aura)
    this.items.push({
      type: 'target_gold',
      word: randomTarget.word,
      pinyin: randomTarget.pinyin,
      meaning: randomTarget.meaning,
      x: 100 + Math.random() * (w - 200),
      y: 180 + Math.random() * (h - 250),
      radius: 36,
      value: 150,
      weight: 1.2
    });

    // Other Distractor Gold Nuggets
    const otherWords = this.rawWords.filter(x => x.word !== randomTarget.word);
    const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random()).slice(0, 3);

    shuffledOthers.forEach(ow => {
      this.items.push({
        type: 'gold',
        word: ow.word,
        pinyin: ow.pinyin,
        meaning: ow.meaning,
        x: 80 + Math.random() * (w - 160),
        y: 160 + Math.random() * (h - 220),
        radius: 28,
        value: 50,
        weight: 1.0
      });
    });

    // Rocks (heavy, low value)
    const rockCount = 2 + this.level;
    for (let i = 0; i < rockCount; i++) {
      this.items.push({
        type: 'rock',
        x: 60 + Math.random() * (w - 120),
        y: 160 + Math.random() * (h - 220),
        radius: 26 + Math.random() * 14,
        value: 15,
        weight: 2.8
      });
    }

    // Diamonds (small, fast, high value)
    this.items.push({
      type: 'diamond',
      x: 70 + Math.random() * (w - 140),
      y: 200 + Math.random() * (h - 250),
      radius: 14,
      value: 100,
      weight: 0.4
    });

    // TNT Barrels
    if (Math.random() < 0.6) {
      this.items.push({
        type: 'tnt',
        x: 100 + Math.random() * (w - 200),
        y: 200 + Math.random() * (h - 250),
        radius: 22,
        value: 0,
        weight: 1.0
      });
    }

    // Lucky Bag
    this.items.push({
      type: 'bag',
      x: 80 + Math.random() * (w - 160),
      y: 180 + Math.random() * (h - 240),
      radius: 20,
      value: 60,
      weight: 0.8
    });
  }

  shootHook() {
    if (this.hook.state === 'SWINGING') {
      this.hook.state = 'SHOOTING';
      this.hook.speed = 380;
      this.sfx.playShoot();
    }
  }

  useDynamite() {
    if (this.hook.state === 'RETRACTING' && this.hook.grabbedItem) {
      if (this.dynamiteCount > 0) {
        this.dynamiteCount--;
        this.sfx.playExplode();
        this.hook.grabbedItem = null;
        this.hook.state = 'RETRACTING';
        this.hook.speed = 420;
        this.showToast('🧨 Đã kích nổ vật nặng giải phóng mỏ neo!');
        this.updateHUD();
      } else {
        this.showToast('Hết thuốc nổ TNT!');
      }
    }
  }

  loop(currentTime) {
    if (!this.isRunning) return;
    if (this.isPaused) {
      this.lastFrameTime = currentTime;
      this.animFrameId = requestAnimationFrame((t) => this.loop(t));
      return;
    }

    const dt = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    this.update(dt);
    this.draw();

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    const maxAngle = (70 * Math.PI) / 180;

    if (this.hook.state === 'SWINGING') {
      this.hook.angle += this.hook.angleDir * this.hook.angleSpeed * dt;
      if (this.hook.angle > maxAngle) {
        this.hook.angle = maxAngle;
        this.hook.angleDir = -1;
      } else if (this.hook.angle < -maxAngle) {
        this.hook.angle = -maxAngle;
        this.hook.angleDir = 1;
      }
    } else if (this.hook.state === 'SHOOTING') {
      this.hook.length += this.hook.speed * dt;

      const hookEnd = this.getHookEndPos();

      // Check collision with items
      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        const dist = Math.hypot(hookEnd.x - item.x, hookEnd.y - item.y);
        if (dist <= item.radius + 12) {
          if (item.type === 'tnt') {
            this.sfx.playExplode();
            this.items.splice(i, 1);
            this.resetHook();
            this.showToast('💥 Chạm phải thùng thuốc nổ!');
            return;
          }

          this.hook.grabbedItem = item;
          this.items.splice(i, 1);
          this.hook.state = 'RETRACTING';
          this.hook.speed = Math.max(70, 320 / item.weight);

          if (item.type === 'target_gold') {
            this.sfx.playGrabTarget();
          } else if (item.type === 'rock') {
            this.sfx.playGrabRock();
          }
          break;
        }
      }

      // Check out of bounds
      const w = this.canvas.width;
      const h = this.canvas.height;
      if (hookEnd.x < 10 || hookEnd.x > w - 10 || hookEnd.y > h - 10 || this.hook.length >= this.hook.maxLen) {
        this.hook.state = 'RETRACTING';
        this.hook.speed = 340;
      }
    } else if (this.hook.state === 'RETRACTING') {
      this.hook.length -= this.hook.speed * dt;
      if (this.hook.length <= this.hook.minLen) {
        this.handleRetractComplete();
        this.resetHook();
      }
    }
  }

  getHookEndPos() {
    const rad = this.hook.angle + Math.PI / 2;
    return {
      x: this.hook.x + Math.cos(rad) * this.hook.length,
      y: this.hook.y + Math.sin(rad) * this.hook.length
    };
  }

  handleRetractComplete() {
    if (!this.hook.grabbedItem) return;
    const item = this.hook.grabbedItem;

    if (item.type === 'target_gold') {
      this.score += item.value;
      this.targetsGrabbedCount++;
      if (window.speakText) window.speakText(item.word);
      this.showToast(`✨ Đào đúng từ「${item.word}」! +$${item.value}`);

      // Spawn next target prompt
      setTimeout(() => this.spawnLevelItems(), 300);
    } else {
      this.score += item.value;
      if (item.type === 'gold' && window.speakText) window.speakText(item.word);
      this.showToast(`+$${item.value}`);
    }

    this.updateHUD();
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Underground soil background
    ctx.fillStyle = '#27170a';
    ctx.fillRect(0, 0, w, h);

    // Top surface grass & sky
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, 0, w, 65);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 60, w, 10);

    // Draw Miner Cart / Machine at center
    ctx.fillStyle = '#b45309';
    ctx.fillRect(this.hook.x - 25, 30, 50, 30);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(this.hook.x - 15, 60, 8, 0, Math.PI * 2);
    ctx.arc(this.hook.x + 15, 60, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw Items
    this.items.forEach(item => this.drawItem(ctx, item));

    // Draw Grabbed Item if retracting
    const hookEnd = this.getHookEndPos();
    if (this.hook.grabbedItem) {
      this.hook.grabbedItem.x = hookEnd.x;
      this.hook.grabbedItem.y = hookEnd.y + this.hook.grabbedItem.radius * 0.7;
      this.drawItem(ctx, this.hook.grabbedItem);
    }

    // Draw Hook Rope
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.hook.x, this.hook.y);
    ctx.lineTo(hookEnd.x, hookEnd.y);
    ctx.stroke();

    // Draw Claw
    ctx.save();
    ctx.translate(hookEnd.x, hookEnd.y);
    ctx.rotate(this.hook.angle);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 10, Math.PI, 0);
    ctx.lineTo(-8, 14);
    ctx.moveTo(8, 0);
    ctx.lineTo(8, 14);
    ctx.stroke();
    ctx.restore();
  }

  drawItem(ctx, item) {
    ctx.save();
    if (item.type === 'target_gold' || item.type === 'gold') {
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
      ctx.fillStyle = item.type === 'target_gold' ? '#f59e0b' : '#fbbf24';
      ctx.fill();
      ctx.strokeStyle = item.type === 'target_gold' ? '#38bdf8' : '#d97706';
      ctx.lineWidth = item.type === 'target_gold' ? 3 : 2;
      ctx.stroke();

      if (item.type === 'target_gold') {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
      }

      ctx.fillStyle = '#000000';
      ctx.font = `bold ${item.radius * 0.8}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.word || '$', item.x, item.y);
    } else if (item.type === 'rock') {
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#64748b';
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🪨', item.x, item.y);
    } else if (item.type === 'diamond') {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💎', item.x, item.y);
    } else if (item.type === 'tnt') {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧨', item.x, item.y);
    } else if (item.type === 'bag') {
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎁', item.x, item.y);
    }
    ctx.restore();
  }

  levelUp() {
    if (this.level < this.maxLevel) {
      this.level++;
      this.targetScore += 350;
      this.timeLeft = 60;
      this.showToast(`🎉 QUA MÀN ${this.level}! Mục tiêu: $${this.targetScore}`);
      this.spawnLevelItems();
      this.updateHUD();
    } else {
      this.gameOver(true);
    }
  }

  updateHUD() {
    const scoreVal = this.container.querySelector('#miner-score-val');
    const targetVal = this.container.querySelector('#miner-target-score-val');
    const levelEl = this.container.querySelector('#miner-level-badge');
    const timerVal = this.container.querySelector('#miner-timer-val');
    const tntCount = this.container.querySelector('#miner-tnt-count');

    if (scoreVal) scoreVal.textContent = `$${this.score}`;
    if (targetVal) targetVal.textContent = `$${this.targetScore}`;
    if (levelEl) levelEl.textContent = `MÀN ${this.level}`;
    if (tntCount) tntCount.textContent = `x${this.dynamiteCount}`;

    if (timerVal) {
      const min = Math.floor(this.timeLeft / 60);
      const sec = this.timeLeft % 60;
      timerVal.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }
  }

  showToast(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseBtn = this.container.querySelector('#miner-pause-btn');
    if (pauseBtn) {
      pauseBtn.innerHTML = `<i class="fa-solid fa-${this.isPaused ? 'play' : 'pause'}"></i>`;
    }
    this.showToast(this.isPaused ? 'Đã tạm dừng game ⏸' : 'Tiếp tục chơi ▶️');
  }

  gameOver(isVictory) {
    this.isRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const overlay = this.container.querySelector('#miner-modal-overlay');
    const icon = this.container.querySelector('#miner-result-icon');
    const title = this.container.querySelector('#miner-result-title');
    const desc = this.container.querySelector('#miner-result-desc');
    const resLevel = this.container.querySelector('#miner-res-level');
    const resScore = this.container.querySelector('#miner-res-score');
    const resWords = this.container.querySelector('#miner-res-words');

    if (overlay) {
      overlay.style.display = 'flex';
      if (icon) icon.textContent = isVictory ? '👑' : '⛏️';
      if (title) title.textContent = isVictory ? 'Vua Mỏ Vàng Từ Vựng!' : 'Chưa Đạt Chỉ Tiêu Vàng!';
      if (desc) desc.textContent = isVictory ? 'Bạn đã xuất sắc hoàn thành toàn bộ 3 màn đào vàng!' : 'Hãy căn góc thật chuẩn và dùng TNT phá đá để kéo nhanh hơn nhé!';
      if (resLevel) resLevel.textContent = `MÀN ${this.level}`;
      if (resScore) resScore.textContent = `$${this.score}`;
      if (resWords) resWords.textContent = this.targetsGrabbedCount;

      const retryBtn = overlay.querySelector('#miner-retry-btn');
      const backHubBtn = overlay.querySelector('#miner-back-hub-btn');
      const finishBtn = overlay.querySelector('#miner-finish-btn');

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
    const overlay = this.container.querySelector('#miner-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    this.start();
  }

  stopAndExit() {
    if (this.isStopping) return;
    this.isStopping = true;
    this.isRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    window.removeEventListener('keydown', this.keyHandler);
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    const cb = this.onExit;
    this.onExit = null;
    if (typeof cb === 'function') {
      cb();
    }
  }
}
