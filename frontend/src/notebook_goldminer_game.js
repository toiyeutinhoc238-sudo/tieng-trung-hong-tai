/**
 * Tiếng Trung HongTai - Notebook Mini-Game 6: THỢ MỎ ĐÀO VÀNG TỪ VỰNG (Gold Miner Vocab)
 * Nâng Cấp Toàn Diện: KHÔNG để lộ đáp án, giao diện đồng nhất, cơ chế vật lý kéo & thuốc nổ chuẩn xác, phát âm TTS
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
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
      }
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  playShoot() {
    this.playTone(320, 'sine', 0.15, 120);
  }

  playGrabTarget() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.04);
        gain.gain.setValueAtTime(0.12, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.04 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.25);
      });
    } catch (e) {}
  }

  playGrabDistractor() {
    this.playTone(392, 'triangle', 0.18, 330);
  }

  playGrabRock() {
    this.playTone(130, 'square', 0.2, 65);
  }

  playExplode() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  playPowerup() {
    this.playTone(440, 'sine', 0.25, 880);
  }
}

const DEFAULT_MINER_VOCAB = [
  { word: '你们', pinyin: 'nǐmen', meaning: 'các bạn' },
  { word: '谢谢', pinyin: 'xièxie', meaning: 'cảm ơn' },
  { word: '不客气', pinyin: 'bù kèqi', meaning: 'đừng khách sáo' },
  { word: '再见', pinyin: 'zàijiàn', meaning: 'tạm biệt' },
  { word: '没关系', pinyin: 'méi guānxi', meaning: 'không sao đâu' },
  { word: '学习', pinyin: 'xuéxí', meaning: 'học tập' },
  { word: '高兴', pinyin: 'gāoxìng', meaning: 'vui vẻ' },
  { word: '难过', pinyin: 'nánguò', meaning: 'buồn bã' },
  { word: '买', pinyin: 'mǎi', meaning: 'mua' },
  { word: '卖', pinyin: 'mài', meaning: 'bán' },
  { word: '朋友', pinyin: 'péngyou', meaning: 'bạn bè' },
  { word: '老师', pinyin: 'lǎoshī', meaning: 'thầy cô giáo' }
];

export class GoldMinerGameEngine {
  constructor(containerEl, wordsList, onExitCallback) {
    this.container = containerEl;
    this.rawWords = (wordsList && wordsList.length >= 3) ? wordsList : DEFAULT_MINER_VOCAB;
    this.onExit = onExitCallback;
    this.sfx = new MinerSoundFX();

    // Game Progression State
    this.score = 0;
    this.targetScore = 350;
    this.level = 1;
    this.maxLevel = 3;
    this.timeLeft = 65;
    this.dynamiteCount = 2;
    this.isPaused = false;
    this.isRunning = false;
    this.isStopping = false;
    this.targetsGrabbedCount = 0;
    this.levelTargetGoals = 2; // Need to find 2 target words or reach money to pass
    this.targetsCompletedInLevel = 0;

    // Buff: Super Strength Potion
    this.strengthBuffTimer = 0;

    // Hook State
    this.hook = {
      x: 400,
      y: 65,
      angle: 0,
      angleDir: 1,
      angleSpeed: 1.5, // rad/s
      length: 42,
      minLen: 42,
      maxLen: 560,
      state: 'SWINGING', // 'SWINGING' | 'SHOOTING' | 'RETRACTING'
      speed: 400,
      grabbedItem: null
    };

    // Miner Cart & Crank Animation
    this.crankAngle = 0;

    // Underground objects
    this.currentTargetWord = null;
    this.items = [];
    this.particles = [];
    this.floatingTexts = [];

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
            <i class="fa-solid fa-arrow-left"></i> Quay lại
          </button>

          <div class="hud-item-title">
            <span style="font-size: 1.3rem;">⛏️</span>
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
            <span class="hud-label">CHỈ TIÊU:</span>
            <span class="hud-value" id="miner-target-score-val">$350</span>
          </div>

          <div class="hud-item hud-timer">
            <i class="fa-solid fa-clock" style="color: #38bdf8;"></i>
            <span class="hud-value" id="miner-timer-val">01:05</span>
          </div>

          <div style="margin-left: auto; display: flex; align-items: center; gap: 6px;">
            <button type="button" id="miner-guide-btn" class="btn btn-outline btn-sm" title="Hướng dẫn cách chơi" style="font-weight: 700; border-radius: 50px; padding: 5px 12px; color: #fbbf24; border-color: #f59e0b;">
              <i class="fa-solid fa-circle-question"></i> Luật chơi
            </button>
            <button type="button" id="miner-pause-btn" class="btn btn-outline btn-sm" title="Tạm dừng"><i class="fa-solid fa-pause"></i></button>
            <button type="button" id="miner-exit-btn" class="btn btn-outline btn-sm" title="Thoát về sổ tay"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>

        <!-- MAIN CANVAS ARENA -->
        <div class="miner-arena-container" id="miner-arena-container">
          <!-- STRENGTH BUFF BANNER -->
          <div class="miner-buff-banner" id="miner-buff-banner" style="display: none;">
            ⚡ NƯỚC TĂNG LỰC: Tốc độ kéo x3! (<span id="miner-buff-sec">15s</span>)
          </div>

          <!-- QUEST PROMPT BANNER (NO ANSWER LEAKAGE: ONLY VIETNAMESE MEANING) -->
          <div class="miner-quest-banner" id="miner-quest-banner">
            <div class="quest-title-tag">MỤC TIÊU HIỆN TẠI</div>
            <div class="quest-text-wrap">
              🎯 Hãy tìm & kéo từ có nghĩa: <strong class="quest-highlight" id="miner-target-meaning">...</strong>
              <span style="font-size: 0.8rem; opacity: 0.85; margin-left: 8px;">(Đã bắt: <span id="miner-target-progress">0/2</span>)</span>
            </div>
          </div>

          <!-- 2D CANVAS -->
          <canvas id="miner-canvas" class="miner-canvas"></canvas>

          <!-- BOTTOM ACTION LAUNCH BAR -->
          <div class="miner-action-bar">
            <button type="button" id="miner-launch-btn" class="btn miner-launch-btn">
              <i class="fa-solid fa-anchor"></i> THẢ MỎ NEO (Phím Space / Phím ↓)
            </button>
            <button type="button" id="miner-tnt-btn" class="btn miner-tnt-btn" title="Kích nổ vật nặng đang kéo để giải phóng mỏ neo">
              🧨 KÍCH NỔ TNT (<span id="miner-tnt-count">x2</span>) (Phím ↑ / W)
            </button>
          </div>
        </div>

        <!-- HOW-TO-PLAY GUIDE MODAL -->
        <div id="miner-guide-overlay" class="miner-guide-overlay" style="display: none;">
          <div class="miner-guide-card">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px;">
              <h3 style="margin: 0; display: flex; align-items: center; gap: 8px; color: #d97706;">
                <i class="fa-solid fa-gem"></i> Hướng Dẫn: Thợ Mỏ Đào Vàng Từ Vựng
              </h3>
              <button type="button" id="miner-guide-close-btn" class="btn btn-outline btn-sm" style="border-radius: 50%; width: 32px; height: 32px; padding: 0;">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div style="font-size: 0.9rem; line-height: 1.6;">
              <p>🎯 <strong>Mục tiêu học tập:</strong> Nhìn nghĩa tiếng Việt được yêu cầu trên thanh mục tiêu, quan sát các thỏi vàng chữ Hán dưới lòng đất và căn góc thả mỏ neo trúng từ tương ứng.</p>

              <div style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 10px 14px; border-radius: 6px; margin: 12px 0;">
                💎 <strong>Quy tắc vật phẩm dưới lòng đất:</strong>
                <ul style="margin: 6px 0 0 16px; padding: 0;">
                  <li>🪙 <strong>Thỏi Vàng Chữ Hán:</strong> Tất cả các từ đều có giao diện vàng đồng nhất. Đọc đúng chữ Hán mục tiêu để kéo: <strong>+$150 vàng & phát âm chuẩn</strong>.</li>
                  <li>⚠️ <strong>Kéo nhầm từ khác:</strong> Vẫn nhận được một ít vàng nhỏ (+$30) và dọn đường, nhưng bạn cần nhắm kéo đúng từ mục tiêu!</li>
                  <li>🪨 <strong>Đá Tảng:</strong> Rất nặng và kéo rất chậm (+$10). Bạn có thể bấm <strong>🧨 Thuốc Nổ TNT</strong> để phá đá ngay lập tức và thu mỏ neo về nhanh!</li>
                  <li>💎 <strong>Kim Cương:</strong> Nhẹ, kéo cực nhanh và giá trị cao (+$120).</li>
                  <li>🎁 <strong>Túi Bí Ẩn:</strong> Chứa phần thưởng ngẫu nhiên (Thêm TNT, thêm thời gian, tiền thưởng, hoặc Nước Tăng Lực kéo siêu tốc).</li>
                  <li>🛢️ <strong>Thùng Thuốc Nổ:</strong> Chạm vào sẽ nổ tung phá hủy các chướng ngại vật xung quanh!</li>
                </ul>
              </div>

              <p>🎮 <strong>Phím điều khiển:</strong></p>
              <ul>
                <li><strong>Thả mỏ neo:</strong> Bấm nút <code>Thả Mỏ Neo</code> / Phím <code>Space</code> / Phím <code>Mũi tên xuống ↓</code> / Chạm màn hình.</li>
                <li><strong>Kích nổ TNT:</strong> Bấm nút <code>Kích Nổ TNT</code> / Phím <code>Mũi tên lên ↑</code> / Phím <code>W</code>.</li>
              </ul>

              <div style="text-align: center; margin-top: 16px;">
                <button type="button" id="miner-guide-start-btn" class="btn btn-primary" style="padding: 10px 28px; font-weight: 800; border-radius: 50px; background: #d97706;">
                  Đã Hiểu - Đào Vàng Thôi! 🚀
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- RESULT MODAL OVERLAY -->
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
              <i class="fa-solid fa-flask"></i> <strong>Chế độ ghi nhớ chủ động (Active Recall):</strong> Nhận diện chữ Hán trực tiếp từ nghĩa tiếng Việt mà không cần gợi ý Pinyin lộ sẵn.
            </div>

            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
              <button type="button" id="miner-retry-btn" class="btn btn-primary" style="padding: 10px 20px; font-weight: 800;"><i class="fa-solid fa-rotate-right"></i> Chơi Lại</button>
              <button type="button" id="miner-back-hub-btn" class="btn btn-secondary" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-gamepad"></i> Đổi Trò Chơi</button>
              <button type="button" id="miner-finish-btn" class="btn btn-outline" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-book-bookmark"></i> Thoát</button>
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
    const width = Math.min(840, (container && container.clientWidth) ? (container.clientWidth - 32) : 800);
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
    const guideBtn = this.container.querySelector('#miner-guide-btn');
    const guideOverlay = this.container.querySelector('#miner-guide-overlay');
    const guideCloseBtn = this.container.querySelector('#miner-guide-close-btn');
    const guideStartBtn = this.container.querySelector('#miner-guide-start-btn');
    const launchBtn = this.container.querySelector('#miner-launch-btn');
    const tntBtn = this.container.querySelector('#miner-tnt-btn');

    if (topBackBtn) topBackBtn.addEventListener('click', () => this.stopAndExit());
    if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
    if (exitBtn) exitBtn.addEventListener('click', () => {
      this.stopAndExit();
      if (typeof window.exitNotebookGamesHub === 'function') window.exitNotebookGamesHub();
    });

    if (guideBtn && guideOverlay) {
      guideBtn.addEventListener('click', () => {
        this.isPaused = true;
        guideOverlay.style.display = 'flex';
      });
    }
    if (guideCloseBtn && guideOverlay) {
      guideCloseBtn.addEventListener('click', () => {
        guideOverlay.style.display = 'none';
        this.isPaused = false;
      });
    }
    if (guideStartBtn && guideOverlay) {
      guideStartBtn.addEventListener('click', () => {
        guideOverlay.style.display = 'none';
        this.isPaused = false;
      });
    }

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
      } else if (e.key === 'p' || e.code === 'Escape') {
        this.togglePause();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', this.keyHandler);

    this.resizeHandler = () => this.initCanvas();
    window.addEventListener('resize', this.resizeHandler);
  }

  start() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.isStopping = false;
    this.isRunning = true;
    this.isPaused = false;
    this.score = 0;
    this.level = 1;
    this.targetScore = 350;
    this.timeLeft = 65;
    this.dynamiteCount = 2;
    this.targetsGrabbedCount = 0;
    this.targetsCompletedInLevel = 0;
    this.strengthBuffTimer = 0;
    this.particles = [];
    this.floatingTexts = [];
    this.lastFrameTime = performance.now();

    const overlay = this.container.querySelector('#miner-modal-overlay');
    if (overlay) overlay.style.setProperty('display', 'none', 'important');

    this.initCanvas();
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

      if (this.strengthBuffTimer > 0) {
        this.strengthBuffTimer--;
        const buffEl = this.container.querySelector('#miner-buff-banner');
        const buffSec = this.container.querySelector('#miner-buff-sec');
        if (buffEl && buffSec) {
          if (this.strengthBuffTimer > 0) {
            buffEl.style.display = 'block';
            buffSec.textContent = `${this.strengthBuffTimer}s`;
          } else {
            buffEl.style.display = 'none';
          }
        }
      }

      if (this.timeLeft <= 0) {
        if (this.score >= this.targetScore || this.targetsCompletedInLevel >= this.levelTargetGoals) {
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
    this.hook.speed = 400;
  }

  spawnLevelItems() {
    this.items = [];
    const w = this.canvas ? this.canvas.width : 800;
    const h = this.canvas ? this.canvas.height : 500;

    // Pick 4-6 distinct words from rawWords
    const shuffledWords = [...this.rawWords].sort(() => Math.random() - 0.5);
    const selectedWords = shuffledWords.slice(0, Math.min(shuffledWords.length, 5));

    // Choose the first one as current target
    this.currentTargetWord = selectedWords[0];
    this.targetsCompletedInLevel = 0;
    this.levelTargetGoals = Math.min(2 + (this.level - 1), selectedWords.length);

    this.updateTargetPrompt();

    // Spawn gold nuggets for all selected words (ALL HAVE THE EXACT SAME GOLDEN APPEARANCE!)
    selectedWords.forEach((wordObj, idx) => {
      const isTarget = (wordObj.word === this.currentTargetWord.word);
      // Place words across underground grid to prevent overlapping
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const cellW = (w - 160) / 3;
      const cellH = (h - 220) / 2;

      const x = 80 + col * cellW + Math.random() * (cellW - 60);
      const y = 170 + row * cellH + Math.random() * (cellH - 40);

      this.items.push({
        type: 'gold_word',
        word: wordObj.word,
        pinyin: wordObj.pinyin,
        meaning: wordObj.meaning,
        isTarget: isTarget,
        x: x,
        y: y,
        radius: 32,
        value: 150,
        weight: 1.1
      });
    });

    // Spawn Rocks (Obstacles: heavy, slow, low value)
    const rockCount = 2 + this.level;
    for (let i = 0; i < rockCount; i++) {
      this.items.push({
        type: 'rock',
        x: 60 + Math.random() * (w - 120),
        y: 150 + Math.random() * (h - 200),
        radius: 24 + Math.random() * 12,
        value: 10,
        weight: 3.2
      });
    }

    // Spawn Diamonds (Fast, valuable)
    this.items.push({
      type: 'diamond',
      x: 70 + Math.random() * (w - 140),
      y: 220 + Math.random() * (h - 260),
      radius: 14,
      value: 120,
      weight: 0.4
    });

    // Spawn Lucky Mystery Bag
    this.items.push({
      type: 'bag',
      x: 80 + Math.random() * (w - 160),
      y: 180 + Math.random() * (h - 240),
      radius: 20,
      value: 50,
      weight: 0.8
    });

    // Spawn TNT Barrels (Explosive hazard/shortcut)
    if (this.level >= 2 || Math.random() < 0.5) {
      this.items.push({
        type: 'tnt_barrel',
        x: 100 + Math.random() * (w - 200),
        y: 200 + Math.random() * (h - 240),
        radius: 22,
        value: 0,
        weight: 1.0
      });
    }
  }

  updateTargetPrompt() {
    const meaningEl = this.container.querySelector('#miner-target-meaning');
    const progEl = this.container.querySelector('#miner-target-progress');
    if (meaningEl && this.currentTargetWord) {
      // ONLY SHOW VIETNAMESE MEANING TO PROMPT ACTIVE RECALL! NO CHARACTER / NO PINYIN LEAK
      meaningEl.textContent = `"${this.currentTargetWord.meaning}"`;
    }
    if (progEl) {
      progEl.textContent = `${this.targetsCompletedInLevel}/${this.levelTargetGoals}`;
    }
  }

  pickNextTargetFromBoard() {
    const remainingGoldWords = this.items.filter(it => it.type === 'gold_word');
    if (remainingGoldWords.length > 0) {
      // Randomly pick one from remaining on board
      const nextItem = remainingGoldWords[Math.floor(Math.random() * remainingGoldWords.length)];
      this.currentTargetWord = {
        word: nextItem.word,
        pinyin: nextItem.pinyin,
        meaning: nextItem.meaning
      };
      // Mark correct item
      remainingGoldWords.forEach(it => {
        it.isTarget = (it.word === this.currentTargetWord.word);
      });
      this.updateTargetPrompt();
    } else {
      // No more words on board -> Level cleared!
      this.levelUp();
    }
  }

  shootHook() {
    if (this.hook.state === 'SWINGING') {
      this.hook.state = 'SHOOTING';
      this.hook.speed = 420;
      this.sfx.playShoot();
    }
  }

  useDynamite() {
    if (this.hook.state === 'RETRACTING' && this.hook.grabbedItem) {
      if (this.dynamiteCount > 0) {
        this.dynamiteCount--;
        this.sfx.playExplode();
        this.triggerExplosion(this.hook.grabbedItem.x, this.hook.grabbedItem.y);
        this.hook.grabbedItem = null;
        this.hook.state = 'RETRACTING';
        this.hook.speed = 460;
        this.showToast('🧨 Đã kích nổ giải phóng mỏ neo!');
        this.updateHUD();
      } else {
        this.showToast('Hết thuốc nổ TNT!');
      }
    }
  }

  triggerExplosion(x, y) {
    // Screen shake
    const container = this.container.querySelector('#miner-arena-container');
    if (container) {
      container.classList.add('miner-screen-shake');
      setTimeout(() => container.classList.remove('miner-screen-shake'), 450);
    }

    // Particle explosion
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 4,
        color: ['#ef4444', '#f59e0b', '#fbbf24', '#ffffff'][Math.floor(Math.random() * 4)],
        alpha: 1.0,
        life: 0.6
      });
    }
  }

  loop(currentTime) {
    if (!this.isRunning) return;
    if (this.isPaused) {
      this.lastFrameTime = currentTime;
      this.animFrameId = requestAnimationFrame((t) => this.loop(t));
      return;
    }

    const dt = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = currentTime;

    this.update(dt);
    this.draw();

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    const maxAngle = (72 * Math.PI) / 180;

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

      // Check collision with underground items
      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        const dist = Math.hypot(hookEnd.x - item.x, hookEnd.y - item.y);
        if (dist <= item.radius + 12) {
          if (item.type === 'tnt_barrel') {
            this.sfx.playExplode();
            this.triggerExplosion(item.x, item.y);
            // Destroy nearby rocks
            for (let j = this.items.length - 1; j >= 0; j--) {
              if (j !== i && Math.hypot(this.items[j].x - item.x, this.items[j].y - item.y) < 110) {
                this.items.splice(j, 1);
              }
            }
            this.items.splice(i, 1);
            this.resetHook();
            this.showToast('💥 Thùng thuốc nổ phát nổ dọn sạch khu vực!');
            return;
          }

          this.hook.grabbedItem = item;
          this.items.splice(i, 1);
          this.hook.state = 'RETRACTING';

          const speedMultiplier = (this.strengthBuffTimer > 0) ? 2.5 : 1.0;
          this.hook.speed = Math.max(80, (360 / item.weight) * speedMultiplier);

          if (item.type === 'gold_word' && item.isTarget) {
            this.sfx.playGrabTarget();
          } else if (item.type === 'gold_word') {
            this.sfx.playGrabDistractor();
          } else if (item.type === 'rock') {
            this.sfx.playGrabRock();
          } else if (item.type === 'diamond' || item.type === 'bag') {
            this.sfx.playPowerup();
          }
          break;
        }
      }

      // Check out of bounds
      const w = this.canvas.width;
      const h = this.canvas.height;
      if (hookEnd.x < 10 || hookEnd.x > w - 10 || hookEnd.y > h - 10 || this.hook.length >= this.hook.maxLen) {
        this.hook.state = 'RETRACTING';
        this.hook.speed = 360;
      }
    } else if (this.hook.state === 'RETRACTING') {
      this.hook.length -= this.hook.speed * dt;
      this.crankAngle += 12 * dt; // animate cart crank

      if (this.hook.length <= this.hook.minLen) {
        this.handleRetractComplete();
        this.resetHook();
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= dt / p.life;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 28 * dt;
      ft.alpha -= dt * 1.2;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
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

    if (item.type === 'gold_word') {
      if (item.isTarget) {
        // Correct Target Word Grabbed!
        this.score += item.value;
        this.targetsGrabbedCount++;
        this.targetsCompletedInLevel++;

        if (typeof window.speakText === 'function') {
          window.speakText(item.word);
        }

        this.addFloatingText(`+$${item.value} ✨ CHÍNH XÁC!`, '#fbbf24');
        this.showToast(`🎉 Xuất sắc! Từ「${item.word}」(${item.pinyin}) nghĩa là "${item.meaning}"! +$${item.value}`);

        // Check if level goals completed
        if (this.targetsCompletedInLevel >= this.levelTargetGoals || this.score >= this.targetScore) {
          setTimeout(() => this.levelUp(), 600);
        } else {
          // Switch target to next word on board
          setTimeout(() => this.pickNextTargetFromBoard(), 400);
        }
      } else {
        // Non-target distractor word grabbed
        const distractorVal = 30;
        this.score += distractorVal;
        if (typeof window.speakText === 'function') {
          window.speakText(item.word);
        }
        this.addFloatingText(`+$${distractorVal}`, '#cbd5e1');
        this.showToast(`⚠️ Bạn đã kéo từ「${item.word}」(${item.pinyin}: ${item.meaning}). Mục tiêu đang tìm: "${this.currentTargetWord.meaning}"`);
      }
    } else if (item.type === 'rock') {
      this.score += item.value;
      this.addFloatingText(`+$${item.value}`, '#94a3b8');
      this.showToast(`Đá tảng nặng! +$${item.value}`);
    } else if (item.type === 'diamond') {
      this.score += item.value;
      this.addFloatingText(`+$${item.value} 💎`, '#38bdf8');
      this.showToast(`💎 Bắt trọn kim cương quý hiếm! +$${item.value}`);
    } else if (item.type === 'bag') {
      // Random mystery bag reward
      const roll = Math.random();
      if (roll < 0.35) {
        this.dynamiteCount++;
        this.addFloatingText(`+1 TNT 🧨`, '#ef4444');
        this.showToast(`🎁 Túi bí ẩn: Nhận thêm 1 Thuốc nổ TNT!`);
      } else if (roll < 0.65) {
        this.timeLeft += 12;
        this.addFloatingText(`+12 Giây ⏰`, '#38bdf8');
        this.showToast(`🎁 Túi bí ẩn: Thêm 12 giây đào vàng!`);
      } else if (roll < 0.85) {
        this.strengthBuffTimer = 15;
        this.addFloatingText(`NƯỚC TĂNG LỰC ⚡`, '#f59e0b');
        this.showToast(`🎁 Túi bí ẩn: Nước Tăng Lực kéo siêu tốc trong 15 giây!`);
      } else {
        this.score += 100;
        this.addFloatingText(`+$100 💰`, '#fbbf24');
        this.showToast(`🎁 Túi bí ẩn: Thưởng nóng $100 vàng!`);
      }
    }

    this.updateHUD();
  }

  addFloatingText(text, color) {
    this.floatingTexts.push({
      text: text,
      color: color,
      x: this.hook.x,
      y: this.hook.y + 40,
      alpha: 1.0
    });
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Underground Rich Soil Background
    const soilGrad = ctx.createLinearGradient(0, 65, 0, h);
    soilGrad.addColorStop(0, '#311b0e');
    soilGrad.addColorStop(0.5, '#221208');
    soilGrad.addColorStop(1, '#160a04');
    ctx.fillStyle = soilGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Top Sky & Grass Surface
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, w, 55);

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(0, 50, w, 15);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 62, w, 4);

    // 3. Aiming Laser Guide Line (Subtle dotted line when swinging)
    if (this.hook.state === 'SWINGING') {
      const rad = this.hook.angle + Math.PI / 2;
      const aimLen = 140;
      ctx.save();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(this.hook.x, this.hook.y);
      ctx.lineTo(this.hook.x + Math.cos(rad) * aimLen, this.hook.y + Math.sin(rad) * aimLen);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Draw Underground Items
    this.items.forEach(item => this.drawItem(ctx, item));

    // 5. Draw Grabbed Item attached to hook
    const hookEnd = this.getHookEndPos();
    if (this.hook.grabbedItem) {
      this.hook.grabbedItem.x = hookEnd.x;
      this.hook.grabbedItem.y = hookEnd.y + this.hook.grabbedItem.radius * 0.7;
      this.drawItem(ctx, this.hook.grabbedItem);
    }

    // 6. Draw Hook Rope / Steel Chain
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.hook.x, this.hook.y);
    ctx.lineTo(hookEnd.x, hookEnd.y);
    ctx.stroke();

    // 7. Draw Hook Mechanical Claw
    ctx.save();
    ctx.translate(hookEnd.x, hookEnd.y);
    ctx.rotate(this.hook.angle);
    ctx.strokeStyle = '#e2e8f0';
    ctx.fillStyle = '#475569';
    ctx.lineWidth = 3.5;

    const isOpen = (this.hook.state === 'SHOOTING' || this.hook.state === 'SWINGING');
    const clawSpread = isOpen ? 12 : 5;

    ctx.beginPath();
    ctx.arc(0, 0, 7, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Left claw prong
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-clawSpread, 16);
    ctx.lineTo(-clawSpread + 4, 18);
    ctx.stroke();

    // Right claw prong
    ctx.beginPath();
    ctx.moveTo(5, 0);
    ctx.lineTo(clawSpread, 16);
    ctx.lineTo(clawSpread - 4, 18);
    ctx.stroke();
    ctx.restore();

    // 8. Draw Miner Character & Cart at top
    this.drawMinerCart(ctx, this.hook.x, 50);

    // 9. Draw Particles & Explosions
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 10. Draw Floating Judgments / Scores
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  drawMinerCart(ctx, x, y) {
    ctx.save();
    // Wooden Mine Cart
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 28, y - 24, 56, 26);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 28, y - 24, 56, 26);

    // Wheels
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(x - 18, y + 2, 7, 0, Math.PI * 2);
    ctx.arc(x + 18, y + 2, 7, 0, Math.PI * 2);
    ctx.fill();

    // Miner Body & Hat
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(x, y - 26, 12, 0, Math.PI * 2);
    ctx.fill();

    // Yellow Miner Helmet
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(x, y - 32, 14, Math.PI, 0);
    ctx.fill();

    // Headlamp with light beam
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y - 32, 4, 0, Math.PI * 2);
    ctx.fill();

    // Crank Wheel
    ctx.save();
    ctx.translate(x + 22, y - 12);
    ctx.rotate(this.crankAngle);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(6, 0);
    ctx.moveTo(0, -6);
    ctx.lineTo(0, 6);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  drawItem(ctx, item) {
    ctx.save();

    if (item.type === 'gold_word') {
      // UNIFORM GOLD VISUALS FOR ALL CHINESE WORDS (NO COLOR/AURA LEAKAGE!)
      const grad = ctx.createRadialGradient(
        item.x - item.radius * 0.3, item.y - item.radius * 0.3, item.radius * 0.1,
        item.x, item.y, item.radius
      );
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.3, '#f59e0b');
      grad.addColorStop(0.85, '#d97706');
      grad.addColorStop(1, '#b45309');

      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Metallic Sheen Highlight
      ctx.beginPath();
      ctx.arc(item.x - item.radius * 0.35, item.y - item.radius * 0.35, item.radius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fill();

      // Chinese Character (Clear, High Contrast)
      ctx.fillStyle = '#0f172a';
      const fontSize = item.word.length > 2 ? (item.radius * 0.65) : (item.radius * 0.78);
      ctx.font = `900 ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.word, item.x, item.y);
    } else if (item.type === 'rock') {
      // Realistic Grey Stone Texture
      const rGrad = ctx.createRadialGradient(
        item.x - item.radius * 0.2, item.y - item.radius * 0.2, 2,
        item.x, item.y, item.radius
      );
      rGrad.addColorStop(0, '#94a3b8');
      rGrad.addColorStop(0.7, '#475569');
      rGrad.addColorStop(1, '#1e293b');

      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
      ctx.fillStyle = rGrad;
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🪨', item.x, item.y);
    } else if (item.type === 'diamond') {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💎', item.x, item.y);
    } else if (item.type === 'bag') {
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎁', item.x, item.y);
    } else if (item.type === 'tnt_barrel') {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🛢️', item.x, item.y);
    }

    ctx.restore();
  }

  levelUp() {
    if (this.level < this.maxLevel) {
      this.level++;
      this.targetScore += 350;
      this.timeLeft = 65;
      this.dynamiteCount = Math.min(4, this.dynamiteCount + 1);
      this.showToast(`🎉 QUA MÀN ${this.level}! Mục tiêu tiếp theo: $${this.targetScore}`);
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
      overlay.style.setProperty('display', 'flex', 'important');
      if (icon) icon.textContent = isVictory ? '👑' : '⛏️';
      if (title) title.textContent = isVictory ? 'Vua Mỏ Vàng Từ Vựng!' : 'Hết Thời Gian - Cố Gắng Nhé!';
      if (desc) desc.textContent = isVictory ? 'Bạn đã xuất sắc hoàn thành toàn bộ các màn thử thách đào vàng từ vựng!' : 'Hãy căn góc thật chuẩn và dùng TNT phá đá để kéo nhanh hơn nhé!';
      if (resLevel) resLevel.textContent = `MÀN ${this.level}`;
      if (resScore) resScore.textContent = `$${this.score}`;
      if (resWords) resWords.textContent = this.targetsGrabbedCount;

      const retryBtn = overlay.querySelector('#miner-retry-btn');
      const backHubBtn = overlay.querySelector('#miner-back-hub-btn');
      const finishBtn = overlay.querySelector('#miner-finish-btn');

      if (retryBtn) {
        retryBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.restart();
        };
      }
      if (backHubBtn) {
        backHubBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.stopAndExit();
        };
      }
      if (finishBtn) {
        finishBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.stopAndExit();
          if (typeof window.exitNotebookGamesHub === 'function') {
            window.exitNotebookGamesHub();
          }
        };
      }
    }
  }

  restart() {
    const overlay = this.container.querySelector('#miner-modal-overlay');
    if (overlay) overlay.style.setProperty('display', 'none', 'important');
    this.start();
  }

  stopAndExit() {
    this.isRunning = false;
    this.isStopping = true;
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
    const overlay = this.container.querySelector('#miner-modal-overlay');
    if (overlay) overlay.style.setProperty('display', 'none', 'important');
    if (typeof this.onExit === 'function') {
      this.onExit();
    }
  }
}
