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
    this.correctWordsSet = new Set();

    // Game Mode State: 'zh-vi' | 'vi-zh' | 'pinyin-zh' | 'pinyin-vi' | 'mix'
    this.gameMode = 'zh-vi';
    this.activeQuestionMode = 'zh-vi';

    // Power-up Buffs
    this.invincibleTimer = 0;
    this.powerups = [];

    // Grid config
    this.cols = 20;
    this.rows = 13;
    this.cellSize = 38;

    // Snake State
    this.snake = [
      { x: 6, y: 6 },
      { x: 5, y: 6 },
      { x: 4, y: 6 }
    ];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };

    // Play & Speech Modes
    this.playMode = localStorage.getItem('snake_play_mode') || 'practice'; // 'practice' (infinite lives) or 'challenge' (3 hearts)
    this.autoSpeech = localStorage.getItem('snake_auto_speech') !== 'false'; // default true

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
            <i class="fa-solid fa-arrow-left"></i> Đổi Game
          </button>

          <div class="hud-item-title">
            <span class="snake-badge-icon">🐍</span>
            <strong>NUÔI RẮN</strong>
          </div>

          <!-- Play Mode Toggle Button -->
          <button type="button" id="snake-playmode-toggle-btn" class="btn btn-outline btn-sm" title="Chuyển chế độ Kiểm tra (Không tính tim) / Thi đấu (3 Tim)" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 800; border-radius: 50px; cursor: pointer; padding: 5px 12px;">
            <span id="snake-mode-icon-text">${this.playMode === 'practice' ? '<i class="fa-solid fa-infinity" style="color: #10b981;"></i> <span style="color:#10b981;">Kiểm tra</span>' : '<i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span style="color:#fbbf24;">Thi đấu</span>'}</span>
          </button>

          <!-- Auto Speech Toggle Button -->
          <button type="button" id="snake-speech-toggle-btn" class="btn btn-outline btn-sm" title="Bật/Tắt tự động đọc từ khi hiện câu hỏi" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 800; border-radius: 50px; cursor: pointer; padding: 5px 12px;">
            <i class="fa-solid ${this.autoSpeech ? 'fa-volume-high' : 'fa-volume-xmark'}" id="snake-speech-icon" style="color: ${this.autoSpeech ? '#22c55e' : '#94a3b8'};"></i>
            <span id="snake-speech-text" style="font-size: 0.78rem;">${this.autoSpeech ? 'Đọc tự động' : 'Tắt đọc'}</span>
          </button>

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
              ${this.playMode === 'practice' 
                ? '<span style="color: #10b981; font-weight: 900; font-size: 0.95rem;"><i class="fa-solid fa-infinity"></i> Vô Hạn</span>'
                : '<i class="fa-solid fa-heart" style="color: #ef4444;"></i><i class="fa-solid fa-heart" style="color: #ef4444;"></i><i class="fa-solid fa-heart" style="color: #ef4444;"></i>'
              }
            </div>
          </div>

          <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
            <button type="button" id="snake-pause-btn" class="btn btn-outline btn-sm" title="Tạm dừng"><i class="fa-solid fa-pause"></i> Tạm dừng</button>
            <button type="button" id="snake-exit-btn" class="btn btn-outline btn-sm" title="Thoát về sổ tay"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>

        <!-- MAIN ARENA & SIDEBAR -->
        <div class="snake-arena-layout">
          <!-- LEFT COLUMN: BATTLEFIELD / CANVAS & CONTROLS -->
          <div class="snake-battle-column">
            <!-- GAME MODE SELECTOR -->
            <div class="snake-mode-selector-bar" id="snake-mode-selector">
              <button type="button" class="snake-mode-btn active" data-mode="zh-vi" title="Chữ Hán ➔ Nghĩa Việt">
                <i class="fa-solid fa-language"></i> <span>Hán ➔ Việt</span>
              </button>
              <button type="button" class="snake-mode-btn" data-mode="vi-zh" title="Nghĩa Việt ➔ Chữ Hán">
                <i class="fa-solid fa-arrow-right-arrow-left"></i> <span>Việt ➔ Hán</span>
              </button>
              <button type="button" class="snake-mode-btn" data-mode="pinyin-zh" title="Pinyin ➔ Chữ Hán">
                <i class="fa-solid fa-spell-check"></i> <span>Pinyin ➔ Hán</span>
              </button>
              <button type="button" class="snake-mode-btn" data-mode="pinyin-vi" title="Pinyin ➔ Nghĩa Việt">
                <i class="fa-solid fa-volume-high"></i> <span>Pinyin ➔ Việt</span>
              </button>
              <button type="button" class="snake-mode-btn" data-mode="mix" title="Hỗn hợp ngẫu nhiên">
                <i class="fa-solid fa-shuffle"></i> <span>Hỗn hợp</span>
              </button>
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
                <div class="guide-title"><i class="fa-solid fa-gamepad"></i> Điều khiển:</div>
                <div class="guide-tags">
                  <span class="guide-tag"><kbd>⬆️</kbd><kbd>⬅️</kbd><kbd>⬇️</kbd><kbd>➡️</kbd> Mũi Tên</span>
                  <span class="guide-tag"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Bàn Phím</span>
                  <span class="guide-tag"><i class="fa-solid fa-hand-pointer"></i> Vuốt cảm ứng</span>
                  <span class="guide-tag"><kbd>Space</kbd> Tạm dừng</span>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT SIDEBAR: PROMINENT TARGET CARD & LUCKY ITEMS -->
          <div class="snake-sidebar">
            <!-- TARGET WORD PROMPT CARD (TOP-RIGHT CORNER) -->
            <div class="snake-target-banner" id="snake-target-card">
              <span class="target-badge-label" id="target-badge-type"><i class="fa-solid fa-bullseye"></i> ĐỀ BÀI CẦN TÌM:</span>
              <div class="target-word-row">
                <span class="target-zh" id="target-zh-text">勤奋</span>
                <button type="button" id="snake-speak-target-btn" class="target-speak-btn" title="Bấm để nghe phát âm">
                  <i class="fa-solid fa-volume-high"></i>
                </button>
              </div>
              <div class="target-action-hint" id="target-action-hint">
                <i class="fa-solid fa-apple-whole" style="color: #fde047;"></i> Lái rắn ăn quả có <strong>NGHĨA TIẾNG VIỆT ĐÚNG</strong>!
              </div>
            </div>

            <!-- LUCKY ITEMS CARD -->
            <div class="snake-sidebar-card">
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
                  <div class="p-desc">Nhân đôi chuỗi hiện tại.</div>
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
                    <small>Hết lượt chơi</small>
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
            <button type="button" id="snake-modal-close-x" class="result-modal-close-btn" title="Đóng">&times;</button>
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

            <!-- BẢNG TỔNG KẾT TỪ VỰNG ĐÚNG / SAI -->
            <div id="snake-words-summary-wrap"></div>

            <div class="result-beta-note">
              <i class="fa-solid fa-flask"></i> <strong>Chế độ luyện tập:</strong> Hãy tiếp tục trau dồi vốn từ vựng HSK của bạn!
            </div>

            <div class="cannon-result-card-actions">
              <button type="button" id="snake-retry-btn" class="btn btn-primary"><i class="fa-solid fa-rotate-right"></i> Chơi Lại</button>
              <button type="button" id="snake-back-hub-btn" class="btn btn-secondary"><i class="fa-solid fa-gamepad"></i> Đổi Trò Chơi</button>
              <button type="button" id="snake-finish-btn" class="btn btn-outline"><i class="fa-solid fa-book-bookmark"></i> Quay Lại Sổ Tay</button>
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
    const containerW = container ? container.clientWidth : 650;
    
    // TỐI ƯU BÀN CỜ RỘNG RÃI & CHIỀU CAO VỪA VẶN TẦM MẮT (20 cols x 13 rows)
    const targetW = Math.min(720, Math.max(300, containerW || 620));
    const targetH = Math.round(targetW * (this.rows / this.cols));

    this.canvas.width = targetW;
    this.canvas.height = targetH;
    this.cellSize = targetW / this.cols;
  }

  bindEvents() {
    const topBackBtn = this.container.querySelector('#snake-top-back-btn');
    const pauseBtn = this.container.querySelector('#snake-pause-btn');
    const exitBtn = this.container.querySelector('#snake-exit-btn');
    const retryBtn = this.container.querySelector('#snake-retry-btn');
    const backHubBtn = this.container.querySelector('#snake-back-hub-btn');
    const finishBtn = this.container.querySelector('#snake-finish-btn');

    const playmodeToggleBtn = this.container.querySelector('#snake-playmode-toggle-btn');
    if (playmodeToggleBtn) {
      playmodeToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.playMode = (this.playMode === 'practice') ? 'challenge' : 'practice';
        localStorage.setItem('snake_play_mode', this.playMode);
        const modeTextEl = this.container.querySelector('#snake-mode-icon-text');
        if (modeTextEl) {
          modeTextEl.innerHTML = (this.playMode === 'practice')
            ? '<i class="fa-solid fa-infinity" style="color: #10b981;"></i> <span style="color:#10b981;">Kiểm tra</span>'
            : '<i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span style="color:#fbbf24;">Thi đấu</span>';
        }
        this.updateHUD();
        this.showFloatingMessage(this.playMode === 'practice' ? '🎯 Chế độ Kiểm tra (♾️ Không tính tim)' : '🏆 Chế độ Thi đấu (❤️❤️❤️ 3 Tim)');
      });
    }

    const speechToggleBtn = this.container.querySelector('#snake-speech-toggle-btn');
    if (speechToggleBtn) {
      speechToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.autoSpeech = !this.autoSpeech;
        localStorage.setItem('snake_auto_speech', this.autoSpeech ? 'true' : 'false');
        const icon = this.container.querySelector('#snake-speech-icon');
        const text = this.container.querySelector('#snake-speech-text');
        if (icon) {
          icon.className = `fa-solid ${this.autoSpeech ? 'fa-volume-high' : 'fa-volume-xmark'}`;
          icon.style.color = this.autoSpeech ? '#22c55e' : '#94a3b8';
        }
        if (text) text.textContent = this.autoSpeech ? 'Đọc tự động' : 'Tắt đọc';
        this.showFloatingMessage(this.autoSpeech ? '🔊 Đã bật tự động đọc từ' : '🔇 Đã tắt tự động đọc');
      });
    }

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

    const closeXBtn = this.container.querySelector('#snake-modal-close-x');
    if (closeXBtn) {
      closeXBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.stopAndExit();
        if (typeof window.exitNotebookGamesHub === 'function') {
          window.exitNotebookGamesHub();
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

    const speakBtn = this.container.querySelector('#snake-speak-target-btn');
    if (speakBtn) {
      speakBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.currentQuestion && typeof window.speakText === 'function') {
          window.speakText(this.currentQuestion.word);
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
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      } else if (key === 'arrowdown' || key === 's') {
        if (this.dir.y === 0) this.nextDir = { x: 0, y: 1 };
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      } else if (key === 'arrowleft' || key === 'a') {
        if (this.dir.x === 0) this.nextDir = { x: -1, y: 0 };
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      } else if (key === 'arrowright' || key === 'd') {
        if (this.dir.x === 0) this.nextDir = { x: 1, y: 0 };
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      } else if (key === ' ') {
        this.togglePause();
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      }
    };
    window.addEventListener('keydown', this.keyHandler, true);

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

    // Game Mode Selector buttons
    this.container.querySelectorAll('.snake-mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const newMode = btn.dataset.mode;
        if (newMode === this.gameMode) return;
        this.container.querySelectorAll('.snake-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.gameMode = newMode;
        this.showFloatingMessage(`Đã chọn: ${btn.textContent.trim()}`);
        if (this.currentQuestion) {
          this.refreshCurrentQuestion();
        }
      });
    });

    this.resizeHandler = () => this.initCanvas();
    window.addEventListener('resize', this.resizeHandler);
  }

  cleanFormat(str) {
    if (!str) return '';
    return String(str).replace(/\([^)]*\)/g, '').replace(/（[^）]*）/g, '').trim();
  }

  refreshCurrentQuestion() {
    if (!this.currentQuestion) return;
    let mode = this.gameMode || 'zh-vi';
    if (mode === 'mix') {
      const pool = ['zh-vi', 'vi-zh', 'pinyin-zh', 'pinyin-vi'];
      mode = pool[Math.floor(Math.random() * pool.length)];
    }
    this.activeQuestionMode = mode;
    this.updateTargetPrompt();

    const target = this.currentQuestion;
    const isTargetHanzi = (mode === 'vi-zh' || mode === 'pinyin-zh');
    this.apples.forEach(a => {
      if (a.isCorrect) {
        a.displayText = isTargetHanzi ? target.word : this.cleanFormat(target.meaning);
      } else {
        a.displayText = isTargetHanzi ? a.word : this.cleanFormat(a.meaning);
      }
    });
  }

  resetSnake() {
    const baseLength = 3 + Math.max(0, this.level - 1);
    this.snake = [];
    for (let i = 0; i < baseLength; i++) {
      this.snake.push({ x: 6 - i, y: 7 });
    }
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
    if (!this.wordQueue || this.wordQueue.length === 0) {
      // Đã hoàn thành toàn bộ danh sách từ vựng mà không bị lặp lại!
      this.gameOver(true);
      return;
    }

    const nextTarget = this.wordQueue.pop();
    this.currentQuestion = nextTarget;

    let mode = this.gameMode || 'zh-vi';
    if (mode === 'mix') {
      const pool = ['zh-vi', 'vi-zh', 'pinyin-zh', 'pinyin-vi'];
      mode = pool[Math.floor(Math.random() * pool.length)];
    }
    this.activeQuestionMode = mode;
    this.updateTargetPrompt();

    const otherWords = (this.rawWords || []).filter(w => w && w.word !== nextTarget.word && w.meaning !== nextTarget.meaning);
    let candidatePool = [...otherWords];

    if (candidatePool.length < 3 && typeof window !== 'undefined' && Array.isArray(window.vocabList)) {
      const extraSameLevel = window.vocabList.filter(w =>
        w && w.word !== nextTarget.word && w.meaning !== nextTarget.meaning &&
        (w.isStudied || w.isMemorized || String(w.level) === String(nextTarget.level))
      );
      candidatePool.push(...extraSameLevel);
    }

    const shuffled = [...candidatePool].sort(() => Math.random() - 0.5);
    const seenWords = new Set([nextTarget.word]);
    const seenMeanings = new Set([nextTarget.meaning]);
    const distractors = [];

    for (const d of shuffled) {
      if (d && d.word && d.meaning && !seenWords.has(d.word) && !seenMeanings.has(d.meaning)) {
        seenWords.add(d.word);
        seenMeanings.add(d.meaning);
        distractors.push(d);
        if (distractors.length === 3) break;
      }
    }

    this.apples = [];

    const isTargetHanzi = (mode === 'vi-zh' || mode === 'pinyin-zh');
    const correctDisplayText = isTargetHanzi ? nextTarget.word : this.cleanFormat(nextTarget.meaning);

    let pos = this.getRandomEmptyCell(2.5);
    if (pos) {
      this.apples.push({
        word: nextTarget.word,
        meaning: nextTarget.meaning,
        pinyin: nextTarget.pinyin,
        displayText: correctDisplayText,
        isCorrect: true,
        x: pos.x,
        y: pos.y
      });
    }

    distractors.forEach(d => {
      let dPos = this.getRandomEmptyCell(2.5);
      if (dPos) {
        const dDisplayText = isTargetHanzi ? d.word : this.cleanFormat(d.meaning);
        this.apples.push({
          word: d.word,
          meaning: d.meaning,
          pinyin: d.pinyin,
          displayText: dDisplayText,
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
    const labelEl = this.container.querySelector('#snake-target-card .target-badge-label');
    const zhEl = this.container.querySelector('#target-zh-text');
    const hintEl = this.container.querySelector('#snake-target-card .target-action-hint');

    const mode = this.activeQuestionMode || 'zh-vi';
    const q = this.currentQuestion;

    if (mode === 'zh-vi') {
      if (labelEl) labelEl.innerHTML = `<i class="fa-solid fa-bullseye"></i> ĐỀ BÀI:`;
      if (zhEl) zhEl.textContent = q.word;
      if (hintEl) hintEl.innerHTML = `<i class="fa-solid fa-apple-whole" style="color: #fde047;"></i> Lái rắn ăn quả có <strong>NGHĨA VIỆT ĐÚNG</strong>!`;
    } else if (mode === 'vi-zh') {
      if (labelEl) labelEl.innerHTML = `<i class="fa-solid fa-bullseye"></i> ĐỀ BÀI:`;
      if (zhEl) zhEl.textContent = this.cleanFormat(q.meaning);
      if (hintEl) hintEl.innerHTML = `<i class="fa-solid fa-apple-whole" style="color: #fde047;"></i> Lái rắn ăn quả có <strong>CHỮ HÁN ĐÚNG</strong>!`;
    } else if (mode === 'pinyin-zh') {
      if (labelEl) labelEl.innerHTML = `<i class="fa-solid fa-bullseye"></i> ĐỀ BÀI:`;
      if (zhEl) zhEl.textContent = this.cleanFormat(q.meaning);
      if (hintEl) hintEl.innerHTML = `<i class="fa-solid fa-apple-whole" style="color: #fde047;"></i> Lái rắn ăn quả có <strong>CHỮ HÁN ĐÚNG</strong>!`;
    } else if (mode === 'pinyin-vi') {
      if (labelEl) labelEl.innerHTML = `<i class="fa-solid fa-bullseye"></i> ĐỀ BÀI:`;
      if (zhEl) zhEl.textContent = q.word;
      if (hintEl) hintEl.innerHTML = `<i class="fa-solid fa-apple-whole" style="color: #fde047;"></i> Lái rắn ăn quả có <strong>NGHĨA VIỆT ĐÚNG</strong>!`;
    }

    if (this.autoSpeech && q && q.word && typeof window.speakText === 'function') {
      window.speakText(q.word);
    }
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
        const willLevelUp = (this.streak + 1 >= this.maxStreakNeeded);
        if (!willLevelUp) {
          // Trong quá trình chơi bình thường (chuỗi 1-9): RẮN KHÔNG DÀI RA
          this.snake.pop();
        }
        // Khi đạt chuỗi 10 (Lên cấp): RẮN MỚI DÀI THÊM 1 KHÚC (không pop)
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

    if (this.currentQuestion && this.currentQuestion.word) {
      this.correctWordsSet.add(this.currentQuestion.word);
    }

    if (this.wordsEatenCorrect > 0 && this.wordsEatenCorrect % 10 === 0) {
      if (this.playMode === 'challenge' && this.lives < this.maxLives) {
        this.lives++;
        this.showFloatingMessage(`💖 Xuất sắc ăn đúng ${this.wordsEatenCorrect} từ! Hồi phục +1 Tim! ❤️`);
      } else {
        this.showFloatingMessage(`💖 Xuất sắc ăn đúng ${this.wordsEatenCorrect} từ!`);
      }
    }

    if (this.streak >= this.maxStreakNeeded) {
      this.levelUp();
    } else {
      this.nextWordQuestion();
    }
    this.updateHUD();
  }

  handleEatWrong(apple) {
    this.sfx.playEatWrong();
    if (this.playMode === 'practice') {
      this.showFloatingMessage('Ăn chưa đúng quả! Tiếp tục cố gắng nhé! 🎯');
      this.nextWordQuestion();
    } else {
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
    }
    this.updateHUD();
  }

  handleEatPowerup(pow) {
    this.sfx.playPowerup();
    if (pow.type === 'heal') {
      if (this.playMode === 'challenge' && this.lives < this.maxLives) {
        this.lives++;
        this.showFloatingMessage('💚 Hồi 1 Tim!');
      } else {
        this.showFloatingMessage('💚 Đã nhặt hồi máu!');
      }
    } else if (pow.type === 'x2') {
      this.score += 50;
      this.showFloatingMessage('🪙 Nhặt được đồng xu! +50 Điểm thưởng!');
    } else if (pow.type === 'shield') {
      this.invincibleTimer = 5;
      this.showFloatingMessage('🛡️ Bất Tử Trong 5 Giây!');
    }
    this.updateHUD();
  }

  handleMistake(reason) {
    this.sfx.playEatWrong();
    if (this.playMode === 'practice') {
      this.showFloatingMessage(`${reason} (Luyện tập không trừ tim) ♾️`);
      this.resetSnake();
    } else {
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
    }
    this.updateHUD();
  }

  levelUp() {
    this.sfx.playLevelUp();
    if (this.level < this.maxLevel) {
      this.level++;
      this.streak = 0;
      this.showFloatingMessage(`🎉 LÊN CẤP ${this.level}! Rắn dài thêm 1 khúc & tăng tốc!`);
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
      if (this.playMode === 'practice') {
        livesContainer.innerHTML = '<span style="color: #10b981; font-weight: 800; font-size: 0.92rem; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-infinity"></i> Vô hạn</span>';
      } else {
        livesContainer.innerHTML = '';
        for (let i = 0; i < this.maxLives; i++) {
          const heart = document.createElement('i');
          heart.className = i < this.lives ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
          heart.style.color = i < this.lives ? '#ef4444' : 'rgba(255,255,255,0.3)';
          livesContainer.appendChild(heart);
        }
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
      ctx.font = `${cs * 0.7}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.type === 'heal' ? '💚' : p.type === 'x2' ? '🪙' : '🛡️', px, py);
      ctx.restore();
    });

    // Apples (Word Targets & Distractors)
    const isHanziMode = (this.activeQuestionMode === 'vi-zh' || this.activeQuestionMode === 'pinyin-zh');
    this.apples.forEach(a => {
      const ax = a.x * cs + cs / 2;
      const ay = a.y * cs + cs / 2;

      // Draw Apple Icon
      ctx.font = `${cs * 0.75}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🍎', ax, ay - 6);

      // Draw Meaning/Hanzi Badge Underneath
      ctx.save();
      const text = a.displayText || (isHanziMode ? a.word : (a.meaning || ''));
      ctx.font = isHanziMode ? 'bold 15px "Noto Sans SC", sans-serif' : 'bold 12px Inter, sans-serif';
      const textMetrics = ctx.measureText(text);
      const textWidth = Math.max(textMetrics.width + 14, 46);
      const badgeH = isHanziMode ? 22 : 20;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(ax - textWidth / 2, ay + 8, textWidth, badgeH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, ax, ay + (isHanziMode ? 19 : 18));
      ctx.restore();
    });

    // Draw Snake
    this.snake.forEach((seg, idx) => {
      const sx = seg.x * cs;
      const sy = seg.y * cs;
      const pad = 2;

      ctx.save();
      if (idx === 0) {
        // Head
        ctx.fillStyle = this.invincibleTimer > 0 ? '#38bdf8' : '#22c55e';
        ctx.beginPath();
        ctx.roundRect(sx + pad, sy + pad, cs - pad * 2, cs - pad * 2, 8);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#ffffff';
        const eyeOffset = 6;
        let eye1 = { x: sx + cs / 2 - eyeOffset, y: sy + cs / 2 - eyeOffset };
        let eye2 = { x: sx + cs / 2 + eyeOffset, y: sy + cs / 2 - eyeOffset };

        if (this.dir.x === 1) {
          eye1 = { x: sx + cs - 8, y: sy + 8 };
          eye2 = { x: sx + cs - 8, y: sy + cs - 8 };
        } else if (this.dir.x === -1) {
          eye1 = { x: sx + 8, y: sy + 8 };
          eye2 = { x: sx + 8, y: sy + cs - 8 };
        } else if (this.dir.y === 1) {
          eye1 = { x: sx + 8, y: sy + cs - 8 };
          eye2 = { x: sx + cs - 8, y: sy + cs - 8 };
        }

        ctx.beginPath();
        ctx.arc(eye1.x, eye1.y, 3, 0, Math.PI * 2);
        ctx.arc(eye2.x, eye2.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(eye1.x, eye1.y, 1.5, 0, Math.PI * 2);
        ctx.arc(eye2.x, eye2.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Body segment
        const greenShade = idx % 2 === 0 ? '#4ade80' : '#86efac';
        ctx.fillStyle = this.invincibleTimer > 0 ? 'rgba(56, 189, 248, 0.75)' : greenShade;
        ctx.beginPath();
        ctx.roundRect(sx + pad, sy + pad, cs - pad * 2, cs - pad * 2, 6);
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
    this.totalWordsCount = this.rawWords.length;
    this.wordQueue = [...this.rawWords].sort(() => Math.random() - 0.5);
    this.timeLeft = 60;
    this.invincibleTimer = 0;
    this.powerups = [];
    this.obstacles = [];
    this.apples = [];

    this.resetSnake();
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
      if (title) title.textContent = isVictory ? 'Vua Nuôi Rắn Từ Vựng!' : 'Hết Tim - Kết Thúc Lượt Chơi!';
      if (desc) desc.textContent = isVictory ? `Bạn đã xuất sắc hoàn thành toàn bộ ${this.wordsEatenCorrect}/${this.totalWordsCount} từ vựng!` : 'Hãy chú ý quan sát từ vựng và chọn đúng quả táo nhé!';
      if (resLevel) resLevel.textContent = `CẤP ${this.level}`;
      if (resScore) resScore.textContent = this.score;
      if (resWords) resWords.textContent = `${this.wordsEatenCorrect || 0}/${this.totalWordsCount || 0}`;

      // Render danh sách từ vựng Đúng / Sai
      const summaryWrap = overlay.querySelector('#snake-words-summary-wrap');
      if (summaryWrap) {
        this.renderWordSummaryList(summaryWrap, this.rawWords, this.correctWordsSet);
      }

      const closeXBtn = overlay.querySelector('#snake-modal-close-x');
      const retryBtn = overlay.querySelector('#snake-retry-btn');
      const backHubBtn = overlay.querySelector('#snake-back-hub-btn');
      const finishBtn = overlay.querySelector('#snake-finish-btn');

      if (closeXBtn) {
        closeXBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.stopAndExit();
          if (typeof window.exitNotebookGamesHub === 'function') {
            window.exitNotebookGamesHub();
          }
        };
      }

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

  renderWordSummaryList(containerEl, allWords, correctWordsSet) {
    if (!containerEl) return;
    const total = allWords.length;
    const correctCount = allWords.filter(w => correctWordsSet.has(w.word)).length;
    const wrongCount = total - correctCount;

    containerEl.innerHTML = `
      <div class="game-results-word-summary">
        <div class="summary-tabs-header">
          <button type="button" class="summary-tab-btn active" data-tab="all">
            <i class="fa-solid fa-list-check"></i> Tất cả (${total})
          </button>
          <button type="button" class="summary-tab-btn correct-tab" data-tab="correct">
            <i class="fa-solid fa-circle-check"></i> Đúng (${correctCount})
          </button>
          <button type="button" class="summary-tab-btn wrong-tab" data-tab="wrong">
            <i class="fa-solid fa-circle-xmark"></i> Sai / Cần ôn (${wrongCount})
          </button>
        </div>
        <div class="summary-words-list"></div>
      </div>
    `;

    const listEl = containerEl.querySelector('.summary-words-list');
    const renderItems = (filter) => {
      listEl.innerHTML = '';
      const filtered = allWords.filter(w => {
        const isCor = correctWordsSet.has(w.word);
        if (filter === 'correct') return isCor;
        if (filter === 'wrong') return !isCor;
        return true;
      });

      if (filtered.length === 0) {
        listEl.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 20px; font-size: 0.85rem;">Không có từ vựng nào trong mục này.</div>`;
        return;
      }

      filtered.forEach(w => {
        const isCor = correctWordsSet.has(w.word);
        const card = document.createElement('div');
        card.className = `summary-word-card ${isCor ? 'is-correct' : 'is-wrong'}`;
        card.innerHTML = `
          <div class="sw-badge ${isCor ? 'badge-correct' : 'badge-wrong'}">
            <i class="fa-solid fa-${isCor ? 'check' : 'xmark'}"></i> ${isCor ? 'Đúng' : 'Sai'}
          </div>
          <div class="sw-main">
            <div class="sw-hanzi">${w.word}</div>
            <div class="sw-pinyin">${w.pinyin ? `[ ${w.pinyin} ]` : ''}</div>
            <div class="sw-meaning">${w.meaning || ''}</div>
          </div>
          <button type="button" class="sw-speak-btn" title="Nghe phát âm">
            <i class="fa-solid fa-volume-high"></i>
          </button>
        `;
        const speakBtn = card.querySelector('.sw-speak-btn');
        if (speakBtn) {
          speakBtn.onclick = (e) => {
            e.stopPropagation();
            if (typeof window.speakText === 'function') {
              window.speakText(w.word);
            }
          };
        }
        listEl.appendChild(card);
      });
    };

    renderItems('all');

    containerEl.querySelectorAll('.summary-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        containerEl.querySelectorAll('.summary-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderItems(btn.dataset.tab);
      });
    });
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
      window.removeEventListener('keydown', this.keyHandler, true);
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
