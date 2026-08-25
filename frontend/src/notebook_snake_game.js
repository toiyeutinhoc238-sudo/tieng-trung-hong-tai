/**
 * Tiếng Trung HongTai - Notebook Mini-Game 2: NUÔI RẮN TỪ VỰNG (Vocabulary Snake Game)
 * Giai đoạn: Thử nghiệm nội bộ (Beta Super Admin)
 */

class SnakeSoundFX {
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
  playEatCorrect() {
    this.playTone(523.25, 'triangle', 0.12, 659.25);
  }
  playEatWrong() {
    this.playTone(180, 'sawtooth', 0.25, 90);
  }
  playPowerup() {
    this.playTone(400, 'sine', 0.2, 800);
  }
  playLevelUp() {
    this.playTone(440, 'sine', 0.15, 880);
    setTimeout(() => this.playTone(880, 'sine', 0.3, 1174.66), 160);
  }
}

export class SnakeGameEngine {
  constructor(containerEl, wordsList, onExitCallback) {
    this.container = containerEl;
    this.rawWords = wordsList && wordsList.length >= 4 ? wordsList : [
      { word: '勤奋', pinyin: 'qínfèn', meaning: 'chăm chỉ' },
      { word: '懒惰', pinyin: 'lǎnduò', meaning: 'lười biếng' },
      { word: '聪明', pinyin: 'cōngmíng', meaning: 'thông minh' },
      { word: '骄傲', pinyin: 'jiāo\'ào', meaning: 'kiêu ngạo' },
      { word: '快乐', pinyin: 'kuàilè', meaning: 'vui vẻ' },
      { word: '热情', pinyin: 'rèqíng', meaning: 'nhiệt tình' },
      { word: '诚实', pinyin: 'chéngshí', meaning: 'thành thật' },
      { word: '勇敢', pinyin: 'yǒnggǎn', meaning: 'dũng cảm' }
    ];
    this.onExit = onExitCallback;
    this.sfx = new SnakeSoundFX();

    // Game Core State
    this.level = 1;
    this.maxLevel = 5;
    this.streak = 0;
    this.maxStreakNeeded = 10;
    this.score = 0;
    this.lives = 3;
    this.maxLives = 3;
    this.isPaused = false;
    this.isRunning = false;
    this.wordsEatenCorrect = 0;

    // Power-up Buffs
    this.invincibleTimer = 0;
    this.powerups = [];

    // Grid config (optimized for larger cells & clear text badges)
    this.cols = 20;
    this.rows = 14;
    this.cellSize = 40;

    // Snake State
    this.snake = [
      { x: 6, y: 7 },
      { x: 5, y: 7 },
      { x: 4, y: 7 }
    ];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };

    // Targets & Obstacles
    this.currentQuestion = null;
    this.apples = [];
    this.obstacles = [];

    this.tickInterval = 220;
    this.lastTickTime = 0;
    this.animFrameId = null;
    this.timerInterval = null;

    this.renderLayout();
    this.initCanvas();
    this.bindEvents();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="snake-game-wrapper">
        <!-- TOP HUD -->
        <div class="snake-hud-bar">
          <button type="button" id="snake-top-back-btn" class="btn btn-outline btn-sm" style="display: flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 50px;">
            <i class="fa-solid fa-arrow-left"></i> Chọn game khác
          </button>

          <div class="hud-item-title">
            <span class="snake-badge-icon">🐍</span>
            <strong>NUÔI RẮN TỪ VỰNG</strong>
          </div>

          <div class="hud-item hud-level-badge" id="snake-level-badge">CẤP 1</div>

          <div class="hud-item hud-streak-wrap">
            <span class="hud-label">CHUỖI: <strong id="snake-streak-text">0/10</strong></span>
            <div class="hud-beads-container" id="snake-beads-container">
              ${Array(10).fill(0).map(() => '<span class="bead"></span>').join('')}
            </div>
          </div>

          <div class="hud-item hud-score">
            <i class="fa-solid fa-star" style="color: #fbbf24;"></i>
            <span class="hud-label">ĐIỂM:</span>
            <span class="hud-value" id="snake-score-val">0</span>
          </div>

          <div class="hud-item hud-lives">
            <span class="hud-label">TIM:</span>
            <div class="hud-hearts" id="snake-lives-container">
              <i class="fa-solid fa-heart" style="color: #ef4444;"></i>
              <i class="fa-solid fa-heart" style="color: #ef4444;"></i>
              <i class="fa-solid fa-heart" style="color: #ef4444;"></i>
            </div>
          </div>

          <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
            <button type="button" id="snake-pause-btn" class="btn btn-outline btn-sm" title="Tạm dừng"><i class="fa-solid fa-pause"></i> Tạm dừng</button>
            <button type="button" id="snake-exit-btn" class="btn btn-outline btn-sm" title="Thoát về sổ tay"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>

        <!-- MAIN ARENA & SIDEBAR -->
        <div class="snake-arena-layout">
          <!-- BATTLEFIELD / CANVAS & CONTROLS -->
          <div class="snake-battle-column">
            <!-- TARGET WORD PROMPT BANNER (NO LEAKED ANSWER) -->
            <div class="snake-target-banner" id="snake-target-card">
              <div class="target-badge-label"><i class="fa-solid fa-bullseye"></i> TỪ VỰNG CẦN TÌM NGHĨA</div>
              <div class="target-word-row">
                <span class="target-zh" id="target-zh-text">勤奋</span>
                <span class="target-pinyin" id="target-pinyin-text">(qínfèn)</span>
              </div>
              <div class="target-action-hint">
                <i class="fa-solid fa-apple-whole" style="color: #ef4444;"></i> Hãy lái rắn ăn quả có <strong>NGHĨA TIẾNG VIỆT ĐÚNG</strong> bên dưới!
              </div>
            </div>

            <!-- CANVAS CONTAINER -->
            <div class="snake-canvas-container" id="snake-canvas-container">
              <canvas id="snake-canvas" class="snake-canvas"></canvas>
            </div>

            <!-- CONTROLS & D-PAD (TOUCH / MOUSE / KEYBOARD) -->
            <div class="snake-controls-panel">
              <div class="snake-dpad-wrapper">
                <div class="dpad-row dpad-row-top">
                  <button type="button" class="dpad-btn dpad-up" data-dir="up" title="Đi Lên (Phím Mũi Tên Lên hoặc W)">
                    <i class="fa-solid fa-chevron-up"></i>
                    <span>Lên</span>
                  </button>
                </div>
                <div class="dpad-row dpad-row-mid">
                  <button type="button" class="dpad-btn dpad-left" data-dir="left" title="Sang Trái (Phím Mũi Tên Trái hoặc A)">
                    <i class="fa-solid fa-chevron-left"></i>
                    <span>Trái</span>
                  </button>
                  <button type="button" class="dpad-btn dpad-down" data-dir="down" title="Đi Xuống (Phím Mũi Tên Xuống hoặc S)">
                    <i class="fa-solid fa-chevron-down"></i>
                    <span>Xuống</span>
                  </button>
                  <button type="button" class="dpad-btn dpad-right" data-dir="right" title="Sang Phải (Phím Mũi Tên Phải hoặc D)">
                    <i class="fa-solid fa-chevron-right"></i>
                    <span>Phải</span>
                  </button>
                </div>
              </div>

              <div class="snake-keys-guide">
                <div class="guide-title"><i class="fa-solid fa-gamepad"></i> Hướng Dẫn Điều Khiển</div>
                <div class="guide-tags">
                  <span class="guide-tag"><kbd>⬆️</kbd><kbd>⬅️</kbd><kbd>⬇️</kbd><kbd>➡️</kbd> Phím mũi tên</span>
                  <span class="guide-tag"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Bàn phím chữ</span>
                  <span class="guide-tag"><i class="fa-solid fa-hand-pointer"></i> Vuốt màn hình cảm ứng</span>
                  <span class="guide-tag"><kbd>Space</kbd> Tạm dừng</span>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT SIDEBAR: INSTRUCTIONS & ITEMS -->
          <div class="snake-sidebar">
            <div class="snake-sidebar-card">
              <div class="sidebar-sec-title"><i class="fa-solid fa-compass"></i> CÁCH LÁI RẮN & CHƠI</div>
              <ul class="sidebar-bullets">
                <li><strong>Bước 1:</strong> Nhìn từ vựng Chữ Hán & Pinyin hiển thị trên ô mục tiêu màu xanh phía trên.</li>
                <li><strong>Bước 2:</strong> Dùng <strong>phím mũi tên / WASD</strong>, <strong>vuốt ngón tay</strong> hoặc <strong>bấm nút D-Pad</strong> để chuyển hướng con rắn.</li>
                <li><strong>Bước 3:</strong> Lái rắn ăn quả táo có <strong>nghĩa tiếng Việt đúng</strong> của từ đó để tích lũy chuỗi 10 điểm lên cấp!</li>
                <li><strong>Cảnh báo:</strong> Tránh đâm vào thân rắn, tránh đâm vào đá/bụi rậm và không ăn nhầm nghĩa sai kẻo mất Tim 💔!</li>
              </ul>
            </div>

            <div class="snake-sidebar-card" style="margin-top: 14px;">
              <div class="sidebar-sec-title"><i class="fa-solid fa-wand-magic-sparkles"></i> VẬT PHẨM MAY MẮN</div>
              
              <div class="powerup-item-row">
                <div class="p-icon" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;"><i class="fa-solid fa-heart"></i></div>
                <div>
                  <div class="p-title">HỒI 1 TIM</div>
                  <div class="p-desc">Hồi lại 1 tim đã mất.</div>
                </div>
              </div>

              <div class="powerup-item-row">
                <div class="p-icon" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;"><i class="fa-solid fa-coins"></i></div>
                <div>
                  <div class="p-title">X2 CHUỖI</div>
                  <div class="p-desc">Nhân đôi chuỗi hiện tại (ví dụ: 5 → 10).</div>
                </div>
              </div>

              <div class="powerup-item-row">
                <div class="p-icon" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;"><i class="fa-solid fa-shield-halved"></i></div>
                <div>
                  <div class="p-title">BẤT TỬ 5 GIÂY</div>
                  <div class="p-desc">Rắn không bị mất tim khi ăn sai trong 5 giây.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- BOTTOM PANEL: DETAILED RULES & LEVEL PROGRESSION -->
        <div class="snake-footer-rules">
          <div class="snake-rules-main-card">
            <div class="rules-title">QUY TẮC TÍNH ĐIỂM & TIẾN TRÌNH</div>
            
            <div class="snake-rules-flow-grid">
              <div class="flow-block flow-correct">
                <div class="flow-tag tag-correct">ĂN ĐÚNG</div>
                <div class="flow-desc">Ăn đúng nghĩa của từ vựng</div>
                <div class="flow-steps">
                  <div class="step-card">
                    <span class="apple-emoji">🍏</span>
                    <strong>Chuỗi +1</strong>
                  </div>
                  <i class="fa-solid fa-arrow-right step-arrow"></i>
                  <div class="step-card">
                    <strong>Đủ 10 lên cấp</strong>
                    <small>Chuỗi về 0</small>
                  </div>
                </div>
              </div>

              <div class="flow-block flow-wrong">
                <div class="flow-tag tag-wrong">ĂN SAI</div>
                <div class="flow-desc">Ăn sai nghĩa của từ vựng</div>
                <div class="flow-steps">
                  <div class="step-card">
                    <span class="apple-emoji">🍎</span>
                    <strong style="color: #ef4444;">-1 TIM</strong>
                  </div>
                  <i class="fa-solid fa-arrow-right step-arrow"></i>
                  <div class="step-card">
                    <strong style="color: #ef4444;">Hết tim</strong>
                    <small>Game over</small>
                  </div>
                </div>
              </div>

              <div class="flow-block flow-summary">
                <div class="rules-title" style="margin-bottom: 8px;">TỔNG KẾT</div>
                <ul class="summary-list">
                  <li>👑 <strong>Lên cấp khi đạt chuỗi 10</strong></li>
                  <li>💔 <strong>Ăn sai mất tim</strong></li>
                  <li>✨ <strong>Vật phẩm may mắn giúp rắn mạnh hơn</strong></li>
                </ul>
              </div>
            </div>

            <!-- LEVEL STEPPER -->
            <div class="snake-stepper-row">
              <span class="stepper-label">TIẾN TRÌNH CẤP:</span>
              <div class="stepper-pills">
                <span class="step-pill active" id="step-lvl-1">CẤP 1</span>
                <i class="fa-solid fa-arrow-right"></i>
                <span class="step-pill" id="step-lvl-2">CẤP 2</span>
                <i class="fa-solid fa-arrow-right"></i>
                <span class="step-pill" id="step-lvl-3">CẤP 3</span>
                <i class="fa-solid fa-arrow-right"></i>
                <span class="step-pill" id="step-lvl-4">CẤP 4</span>
                <i class="fa-solid fa-arrow-right"></i>
                <span class="step-pill" id="step-lvl-5"><i class="fa-solid fa-lock"></i> CẤP 5</span>
              </div>
              <div class="stepper-notes">
                Cấp càng cao: Rắn dài hơn • Rắn nhanh hơn • Nhiều chướng ngại vật hơn • Từ vựng khó hơn
              </div>
            </div>
          </div>
        </div>

        <!-- GAME OVER / LEVEL UP MODAL -->
        <div id="snake-modal-overlay" class="cannon-modal-overlay" style="display: none;">
          <div class="cannon-result-card">
            <div id="snake-result-icon" class="result-icon">🏆</div>
            <h2 id="snake-result-title" class="result-title">Hoàn Thành Thử Thách!</h2>
            <p id="snake-result-desc" class="result-desc">Chúc mừng bạn đã chinh phục các cấp độ Nuôi Rắn!</p>
            
            <div class="result-stats-grid">
              <div class="stat-pill">
                <span class="label">Cấp Độ Đạt Được</span>
                <span class="val" id="snake-res-level">CẤP 1</span>
              </div>
              <div class="stat-pill">
                <span class="label">Tổng Điểm</span>
                <span class="val" id="snake-res-score">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Số Từ Ăn Đúng</span>
                <span class="val" id="snake-res-words">0</span>
              </div>
            </div>

            <div class="result-beta-note">
              <i class="fa-solid fa-flask"></i> <strong>Chế độ thử nghiệm:</strong> Điểm số và thành tích không lưu vào hồ sơ trong giai đoạn Beta Super Admin.
            </div>

            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
              <button type="button" id="snake-retry-btn" class="btn btn-primary" style="padding: 10px 20px; font-weight: 800;"><i class="fa-solid fa-rotate-right"></i> Chơi Lại</button>
              <button type="button" id="snake-back-hub-btn" class="btn btn-secondary" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-gamepad"></i> Đổi Trò Chơi</button>
              <button type="button" id="snake-finish-btn" class="btn btn-outline" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-book-bookmark"></i> Quay Lại Sổ Tay</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  initCanvas() {
    this.canvas = this.container.querySelector('#snake-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    const container = this.container.querySelector('#snake-canvas-container');
    const width = Math.min(840, Math.max(320, (container ? container.clientWidth : 800) || 800));
    const height = Math.round(width * (this.rows / this.cols));

    this.canvas.width = width;
    this.canvas.height = height;
    this.cellSize = width / this.cols;
  }

  bindEvents() {
    const topBackBtn = this.container.querySelector('#snake-top-back-btn');
    const pauseBtn = this.container.querySelector('#snake-pause-btn');
    const exitBtn = this.container.querySelector('#snake-exit-btn');
    const retryBtn = this.container.querySelector('#snake-retry-btn');
    const backHubBtn = this.container.querySelector('#snake-back-hub-btn');
    const finishBtn = this.container.querySelector('#snake-finish-btn');

    if (topBackBtn) {
      topBackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.stopAndExit();
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.togglePause();
      });
    }

    if (exitBtn) {
      exitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof window.exitNotebookGamesHub === 'function') {
          this.stopAndExit();
          window.exitNotebookGamesHub();
        } else {
          this.stopAndExit();
        }
      });
    }

    if (retryBtn) {
      retryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.restart();
      });
    }

    if (backHubBtn) {
      backHubBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.stopAndExit();
      });
    }

    if (finishBtn) {
      finishBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.stopAndExit();
        if (typeof window.exitNotebookGamesHub === 'function') {
          window.exitNotebookGamesHub();
        }
      });
    }

    // Arrow keys & WASD
    this.keyHandler = (e) => {
      if (!this.isRunning || this.isPaused) return;
      const key = e.key.toLowerCase();

      if (key === 'arrowup' || key === 'w') {
        if (this.dir.y === 0) this.nextDir = { x: 0, y: -1 };
        e.preventDefault();
      } else if (key === 'arrowdown' || key === 's') {
        if (this.dir.y === 0) this.nextDir = { x: 0, y: 1 };
        e.preventDefault();
      } else if (key === 'arrowleft' || key === 'a') {
        if (this.dir.x === 0) this.nextDir = { x: -1, y: 0 };
        e.preventDefault();
      } else if (key === 'arrowright' || key === 'd') {
        if (this.dir.x === 0) this.nextDir = { x: 1, y: 0 };
        e.preventDefault();
      } else if (key === ' ') {
        this.togglePause();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', this.keyHandler);

    // Touch Swipe Gestures on Canvas (Real-time responsive without page dragging)
    if (this.canvas) {
      let touchStartX = 0;
      let touchStartY = 0;
      let isTouchActive = false;

      this.touchStartHandler = (e) => {
        e.preventDefault();
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          isTouchActive = true;
        }
      };

      this.touchMoveHandler = (e) => {
        e.preventDefault(); // Prevent whole webpage scrolling / rubber-banding on touchscreen
        if (!isTouchActive || !this.isRunning || this.isPaused) return;
        if (e.touches && e.touches[0]) {
          const dx = e.touches[0].clientX - touchStartX;
          const dy = e.touches[0].clientY - touchStartY;
          const minSwipeDist = 14; // Quick, responsive direction change

          if (Math.abs(dx) >= minSwipeDist || Math.abs(dy) >= minSwipeDist) {
            if (Math.abs(dx) > Math.abs(dy)) {
              if (dx > 0 && this.dir.x === 0) {
                this.nextDir = { x: 1, y: 0 };
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
              } else if (dx < 0 && this.dir.x === 0) {
                this.nextDir = { x: -1, y: 0 };
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
              }
            } else {
              if (dy > 0 && this.dir.y === 0) {
                this.nextDir = { x: 0, y: 1 };
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
              } else if (dy < 0 && this.dir.y === 0) {
                this.nextDir = { x: 0, y: -1 };
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
              }
            }
          }
        }
      };

      this.touchEndHandler = (e) => {
        e.preventDefault();
        isTouchActive = false;
      };

      this.canvas.addEventListener('touchstart', this.touchStartHandler, { passive: false });
      this.canvas.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
      this.canvas.addEventListener('touchend', this.touchEndHandler, { passive: false });
      this.canvas.addEventListener('touchcancel', this.touchEndHandler, { passive: false });
    }

    // Directional D-Pad buttons (touch + click support)
    const handleDirAction = (dir) => {
      if (!this.isRunning || this.isPaused) return;
      if (dir === 'up' && this.dir.y === 0) this.nextDir = { x: 0, y: -1 };
      else if (dir === 'down' && this.dir.y === 0) this.nextDir = { x: 0, y: 1 };
      else if (dir === 'left' && this.dir.x === 0) this.nextDir = { x: -1, y: 0 };
      else if (dir === 'right' && this.dir.x === 0) this.nextDir = { x: 1, y: 0 };
    };

    this.container.querySelectorAll('.dpad-btn').forEach(btn => {
      const dir = btn.dataset.dir;
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        btn.classList.add('active');
        handleDirAction(dir);
      }, { passive: false });

      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        btn.classList.remove('active');
      }, { passive: false });

      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        btn.classList.add('active');
        handleDirAction(dir);
      });
      btn.addEventListener('mouseup', () => btn.classList.remove('active'));
      btn.addEventListener('mouseleave', () => btn.classList.remove('active'));
    });

    this.resizeHandler = () => this.initCanvas();
    window.addEventListener('resize', this.resizeHandler);
  }

  resetSnake() {
    this.snake = [
      { x: 6, y: 7 },
      { x: 5, y: 7 },
      { x: 4, y: 7 }
    ];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.calculateSpeed();
  }

  calculateSpeed() {
    this.tickInterval = Math.max(110, 220 - (this.level - 1) * 25);
  }

  spawnObstacles() {
    this.obstacles = [];
    const count = (this.level - 1) * 2;
    for (let i = 0; i < count; i++) {
      let pos = this.getRandomEmptyCell(2);
      if (pos) {
        this.obstacles.push({
          type: i % 2 === 0 ? 'rock' : 'bush',
          x: pos.x,
          y: pos.y
        });
      }
    }
  }

  nextWordQuestion() {
    const randomTarget = this.rawWords[Math.floor(Math.random() * this.rawWords.length)];
    if (!randomTarget) return;

    this.currentQuestion = randomTarget;
    this.updateTargetPrompt();

    const otherWords = this.rawWords.filter(w => w.word !== randomTarget.word);
    const shuffled = [...otherWords].sort(() => 0.5 - Math.random());
    const distractors = shuffled.slice(0, 3);

    this.apples = [];

    let pos = this.getRandomEmptyCell(2.5);
    if (pos) {
      this.apples.push({
        word: randomTarget.word,
        meaning: randomTarget.meaning,
        isCorrect: true,
        x: pos.x,
        y: pos.y
      });
    }

    distractors.forEach(d => {
      let dPos = this.getRandomEmptyCell(2.5);
      if (dPos) {
        this.apples.push({
          word: d.word,
          meaning: d.meaning,
          isCorrect: false,
          x: dPos.x,
          y: dPos.y
        });
      }
    });

    if (this.powerups.length === 0 && Math.random() < 0.28) {
      let pPos = this.getRandomEmptyCell(2);
      if (pPos) {
        const types = ['heal', 'x2', 'shield'];
        const pType = types[Math.floor(Math.random() * types.length)];
        this.powerups.push({ type: pType, x: pPos.x, y: pPos.y });
      }
    }
  }

  getRandomEmptyCell(minDistFromApples = 2) {
    for (let tries = 0; tries < 200; tries++) {
      const rx = Math.floor(Math.random() * (this.cols - 4)) + 2;
      const ry = Math.floor(Math.random() * (this.rows - 4)) + 2;

      const onSnake = this.snake.some(s => Math.abs(s.x - rx) <= 1 && Math.abs(s.y - ry) <= 1);
      const onApple = this.apples.some(a => {
        const dist = Math.hypot(a.x - rx, a.y - ry);
        return dist < (minDistFromApples || 2.2);
      });
      const onObs = this.obstacles.some(o => Math.abs(o.x - rx) <= 1 && Math.abs(o.y - ry) <= 1);
      const onPow = this.powerups.some(p => Math.abs(p.x - rx) <= 1 && Math.abs(p.y - ry) <= 1);

      if (!onSnake && !onApple && !onObs && !onPow) {
        return { x: rx, y: ry };
      }
    }

    for (let tries = 0; tries < 50; tries++) {
      const rx = Math.floor(Math.random() * (this.cols - 2)) + 1;
      const ry = Math.floor(Math.random() * (this.rows - 2)) + 1;
      const onSnake = this.snake.some(s => s.x === rx && s.y === ry);
      const onApple = this.apples.some(a => a.x === rx && a.y === ry);
      const onObs = this.obstacles.some(o => o.x === rx && o.y === ry);
      if (!onSnake && !onApple && !onObs) return { x: rx, y: ry };
    }
    return null;
  }

  updateTargetPrompt() {
    if (!this.currentQuestion) return;
    const zhEl = this.container.querySelector('#target-zh-text');
    const pyEl = this.container.querySelector('#target-pinyin-text');

    if (zhEl) zhEl.textContent = this.currentQuestion.word;
    if (pyEl) pyEl.textContent = `(${this.currentQuestion.pinyin})`;
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    if (!this.isPaused) {
      if (currentTime - this.lastTickTime >= this.tickInterval) {
        this.lastTickTime = currentTime;
        this.updateGame();
      }
    }

    this.draw();
    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  updateGame() {
    this.dir = this.nextDir;
    const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };

    if (head.x < 0) head.x = this.cols - 1;
    if (head.x >= this.cols) head.x = 0;
    if (head.y < 0) head.y = this.rows - 1;
    if (head.y >= this.rows) head.y = 0;

    const hitSelf = this.snake.slice(1).some(s => s.x === head.x && s.y === head.y);
    if (hitSelf) {
      this.handleMistake('Đâm trúng thân rắn!');
      return;
    }

    const hitObs = this.obstacles.find(o => o.x === head.x && o.y === head.y);
    if (hitObs) {
      this.handleMistake('Đâm trúng chướng ngại vật!');
      return;
    }

    this.snake.unshift(head);

    const appleIdx = this.apples.findIndex(a => a.x === head.x && a.y === head.y);
    if (appleIdx !== -1) {
      const apple = this.apples[appleIdx];
      if (apple.isCorrect) {
        this.handleEatCorrect(apple);
      } else {
        this.handleEatWrong(apple);
        this.snake.pop();
      }
    } else {
      const powIdx = this.powerups.findIndex(p => p.x === head.x && p.y === head.y);
      if (powIdx !== -1) {
        this.handleEatPowerup(this.powerups[powIdx]);
        this.powerups.splice(powIdx, 1);
      }
      this.snake.pop();
    }
  }

  handleEatCorrect(apple) {
    this.sfx.playEatCorrect();
    this.score += 20 * this.level;
    this.streak++;
    this.wordsEatenCorrect = (this.wordsEatenCorrect || 0) + 1;

    if (window.speakText) window.speakText(this.currentQuestion.word);

    if (this.streak >= this.maxStreakNeeded) {
      this.levelUp();
    } else {
      this.nextWordQuestion();
    }
    this.updateHUD();
  }

  handleEatWrong(apple) {
    this.sfx.playEatWrong();
    if (this.invincibleTimer <= 0) {
      this.lives--;
      this.showFloatingMessage('Ăn sai nghĩa! -1 Tim 💔');
    } else {
      this.showFloatingMessage('🛡️ Bất tử bảo vệ!');
    }

    if (this.lives <= 0) {
      this.gameOver(false);
    } else {
      this.nextWordQuestion();
    }
    this.updateHUD();
  }

  handleEatPowerup(pow) {
    this.sfx.playPowerup();
    if (pow.type === 'heal') {
      if (this.lives < this.maxLives) {
        this.lives++;
        this.showFloatingMessage('💚 Hồi 1 Tim!');
      } else {
        this.showFloatingMessage('💚 Tim đã đầy!');
      }
    } else if (pow.type === 'x2') {
      this.streak = Math.min(this.maxStreakNeeded, this.streak * 2 || 2);
      this.showFloatingMessage(`🪙 x2 Chuỗi! (Chuỗi: ${this.streak}/10)`);
      if (this.streak >= this.maxStreakNeeded) {
        this.levelUp();
        return;
      }
    } else if (pow.type === 'shield') {
      this.invincibleTimer = 5;
      this.showFloatingMessage('🛡️ Bất Tử Trong 5 Giây!');
    }
    this.updateHUD();
  }

  handleMistake(reason) {
    this.sfx.playEatWrong();
    if (this.invincibleTimer <= 0) {
      this.lives--;
      this.showFloatingMessage(`${reason} -1 Tim 💔`);
    } else {
      this.showFloatingMessage('🛡️ Bất tử bảo vệ!');
    }

    if (this.lives <= 0) {
      this.gameOver(false);
    } else {
      this.resetSnake();
    }
    this.updateHUD();
  }

  levelUp() {
    this.sfx.playLevelUp();
    if (this.level < this.maxLevel) {
      this.level++;
      this.streak = 0;
      this.showFloatingMessage(`🎉 LÊN CẤP ${this.level}! Tốc độ tăng tốc!`);
      this.calculateSpeed();
      this.spawnObstacles();
      this.nextWordQuestion();
    } else {
      this.gameOver(true);
    }
    this.updateHUD();
  }

  showFloatingMessage(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    }
  }

  updateHUD() {
    const lvlEl = this.container.querySelector('#snake-level-badge');
    const streakText = this.container.querySelector('#snake-streak-text');
    const beadsContainer = this.container.querySelector('#snake-beads-container');
    const scoreVal = this.container.querySelector('#snake-score-val');
    const livesContainer = this.container.querySelector('#snake-lives-container');

    if (lvlEl) lvlEl.textContent = `CẤP ${this.level}`;
    if (streakText) streakText.textContent = `${this.streak}/10`;
    if (scoreVal) scoreVal.textContent = this.score;

    if (beadsContainer) {
      beadsContainer.innerHTML = '';
      for (let i = 0; i < 10; i++) {
        const bead = document.createElement('span');
        bead.className = `bead ${i < this.streak ? 'filled' : ''}`;
        beadsContainer.appendChild(bead);
      }
    }

    if (livesContainer) {
      livesContainer.innerHTML = '';
      for (let i = 0; i < this.maxLives; i++) {
        const heart = document.createElement('i');
        heart.className = i < this.lives ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        heart.style.color = i < this.lives ? '#ef4444' : 'rgba(255,255,255,0.3)';
        livesContainer.appendChild(heart);
      }
    }

    for (let i = 1; i <= 5; i++) {
      const pill = this.container.querySelector(`#step-lvl-${i}`);
      if (pill) {
        pill.classList.toggle('active', i === this.level);
        pill.classList.toggle('done', i < this.level);
      }
    }
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cs = this.cellSize;

    // Board background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= this.cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cs, 0);
      ctx.lineTo(c * cs, h);
      ctx.stroke();
    }
    for (let r = 0; r <= this.rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cs);
      ctx.lineTo(w, r * cs);
      ctx.stroke();
    }

    // Obstacles
    this.obstacles.forEach(o => {
      const ox = o.x * cs + cs / 2;
      const oy = o.y * cs + cs / 2;
      ctx.font = `${cs * 0.85}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(o.type === 'rock' ? '🪨' : '🌿', ox, oy);
    });

    // Powerups
    this.powerups.forEach(p => {
      const px = p.x * cs + cs / 2;
      const py = p.y * cs + cs / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, cs * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = p.type === 'heal' ? 'rgba(239, 68, 68, 0.25)' : p.type === 'x2' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(56, 189, 248, 0.25)';
      ctx.fill();
      ctx.font = `${cs * 0.65}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.type === 'heal' ? '❤️' : p.type === 'x2' ? '🪙' : '🛡️', px, py);
      ctx.restore();
    });

    // Apples / Fruits (ALL neutral appearance - NO LEAKING ANSWER)
    this.apples.forEach(a => {
      const ax = a.x * cs + cs / 2;
      const ay = a.y * cs + cs / 2;

      ctx.save();

      // 1. Shiny Juicy Red Apple Body (Uniform for all apples)
      const grad = ctx.createRadialGradient(ax - 3, ay - 6, 2, ax, ay - 4, cs * 0.44);
      grad.addColorStop(0, '#ff6b6b');
      grad.addColorStop(0.65, '#ef4444');
      grad.addColorStop(1, '#b91c1c');

      ctx.beginPath();
      ctx.arc(ax, ay - 4, cs * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetY = 2;
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // 2. Glossy Highlight
      ctx.beginPath();
      ctx.ellipse(ax - 4, ay - 9, cs * 0.14, cs * 0.08, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();

      // 3. Stem
      ctx.beginPath();
      ctx.moveTo(ax, ay - cs * 0.42 - 2);
      ctx.quadraticCurveTo(ax + 2, ay - cs * 0.42 - 6, ax + 4, ay - cs * 0.42 - 7);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 4. Green Leaf
      ctx.beginPath();
      ctx.ellipse(ax + 5, ay - cs * 0.42 - 4, 4.5, 2.8, Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.fill();

      // 5. Spacious Pill Badge for Meaning - FULL TEXT, NEVER CUT OFF
      const meaningText = (a.meaning || '').trim();
      const fontSize = cs > 36 ? 12 : 11;
      ctx.font = `bold ${fontSize}px "Lexend", system-ui, sans-serif`;
      const textMetrics = ctx.measureText(meaningText);
      const pillWidth = Math.max(cs * 1.6, textMetrics.width + 16);
      const pillHeight = cs > 36 ? 24 : 20;
      const pillX = ax - pillWidth / 2;
      const pillY = ay + cs * 0.22;

      // Badge container
      ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillWidth, pillHeight, pillHeight / 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Badge border
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Badge text
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(meaningText, ax, pillY + pillHeight / 2);

      ctx.restore();
    });

    // Snake Body & Head
    this.snake.forEach((segment, idx) => {
      const sx = segment.x * cs;
      const sy = segment.y * cs;

      ctx.save();
      if (idx === 0) {
        // Snake Head
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.roundRect(sx + 2, sy + 2, cs - 4, cs - 4, 10);
        ctx.fill();

        // Eyes oriented by direction
        ctx.fillStyle = '#ffffff';
        let eye1X = sx + 10, eye1Y = sy + 10, eye2X = sx + 10, eye2Y = sy + cs - 10;
        if (this.dir.x > 0) {
          eye1X = sx + cs - 10; eye1Y = sy + 10;
          eye2X = sx + cs - 10; eye2Y = sy + cs - 10;
        } else if (this.dir.x < 0) {
          eye1X = sx + 10; eye1Y = sy + 10;
          eye2X = sx + 10; eye2Y = sy + cs - 10;
        } else if (this.dir.y > 0) {
          eye1X = sx + 10; eye1Y = sy + cs - 10;
          eye2X = sx + cs - 10; eye2Y = sy + cs - 10;
        } else if (this.dir.y < 0) {
          eye1X = sx + 10; eye1Y = sy + 10;
          eye2X = sx + cs - 10; eye2Y = sy + 10;
        }

        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, 3.5, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, 1.8, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Shield aura if invincible
        if (this.invincibleTimer > 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(sx + cs / 2, sy + cs / 2, cs * 0.72, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        // Body segments
        ctx.fillStyle = idx % 2 === 0 ? '#22c55e' : '#4ade80';
        ctx.beginPath();
        ctx.roundRect(sx + 3, sy + 3, cs - 6, cs - 6, 8);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseBtn = this.container.querySelector('#snake-pause-btn');
    if (pauseBtn) {
      pauseBtn.innerHTML = `<i class="fa-solid fa-${this.isPaused ? 'play' : 'pause'}"></i> ${this.isPaused ? 'Tiếp tục' : 'Tạm dừng'}`;
    }
    this.showFloatingMessage(this.isPaused ? 'Đã tạm dừng game ⏸' : 'Tiếp tục chơi ▶️');
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
    this.level = 1;
    this.streak = 0;
    this.score = 0;
    this.lives = 3;
    this.wordsEatenCorrect = 0;
    this.timeLeft = 60;
    this.invincibleTimer = 0;
    this.powerups = [];
    this.obstacles = [];
    this.apples = [];

    this.snake = [
      { x: 6, y: 7 },
      { x: 5, y: 7 },
      { x: 4, y: 7 }
    ];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.lastTickTime = performance.now();
    this.calculateSpeed();

    const overlay = this.container.querySelector('#snake-modal-overlay');
    if (overlay) {
      overlay.style.setProperty('display', 'none', 'important');
    }

    this.initCanvas();
    this.spawnObstacles();
    this.nextWordQuestion();
    this.updateHUD();

    this.timerInterval = setInterval(() => {
      if (!this.isRunning || this.isPaused) return;
      if (this.invincibleTimer > 0) {
        this.invincibleTimer--;
      }
    }, 1000);

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  gameOver(isVictory) {
    this.isRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const overlay = this.container.querySelector('#snake-modal-overlay');
    const icon = this.container.querySelector('#snake-result-icon');
    const title = this.container.querySelector('#snake-result-title');
    const desc = this.container.querySelector('#snake-result-desc');
    const resLevel = this.container.querySelector('#snake-res-level');
    const resScore = this.container.querySelector('#snake-res-score');
    const resWords = this.container.querySelector('#snake-res-words');

    if (overlay) {
      overlay.style.setProperty('display', 'flex', 'important');
      if (icon) icon.textContent = isVictory ? '👑' : '🐍';
      if (title) title.textContent = isVictory ? 'Vua Nuôi Rắn Từ Vựng!' : 'Hết Tim - Game Over!';
      if (desc) desc.textContent = isVictory ? 'Bạn đã xuất sắc vượt qua toàn bộ 5 Cấp độ thử thách!' : 'Hãy chú ý quan sát từ vựng và chọn đúng quả táo nhé!';
      if (resLevel) resLevel.textContent = `CẤP ${this.level}`;
      if (resScore) resScore.textContent = this.score;
      if (resWords) resWords.textContent = this.wordsEatenCorrect || 0;

      const retryBtn = overlay.querySelector('#snake-retry-btn');
      const backHubBtn = overlay.querySelector('#snake-back-hub-btn');
      const finishBtn = overlay.querySelector('#snake-finish-btn');

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
    const overlay = this.container.querySelector('#snake-modal-overlay');
    if (overlay) {
      overlay.style.setProperty('display', 'none', 'important');
    }
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
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    if (this.canvas && this.touchStartHandler) {
      this.canvas.removeEventListener('touchstart', this.touchStartHandler);
      this.canvas.removeEventListener('touchmove', this.touchMoveHandler);
      this.canvas.removeEventListener('touchend', this.touchEndHandler);
      this.canvas.removeEventListener('touchcancel', this.touchEndHandler);
      this.touchStartHandler = null;
      this.touchMoveHandler = null;
      this.touchEndHandler = null;
    }
    const cb = this.onExit;
    this.onExit = null;
    if (typeof cb === 'function') {
      cb();
    }
  }
}
