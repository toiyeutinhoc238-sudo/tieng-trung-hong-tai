/**
 * Tiếng Trung HongTai - Notebook Mini-Game 4: MẠT CHƯỢC NỐI CẶP THẦN TỐC (Hanzi Mahjong / Onet Connect)
 * Giai đoạn: Hoàn thiện nâng cao & Tối ưu hóa trải nghiệm siêu mượt mà
 */

class MahjongSoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
  }

  playTone(freq, type, duration, endFreq = null, gainVal = 0.18) {
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
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playSelect() {
    this.playTone(480, 'sine', 0.09, 680, 0.15);
  }

  playMatch() {
    // Two-tone chime
    this.playTone(523.25, 'triangle', 0.18, 659.25, 0.22); // C5 -> E5
    setTimeout(() => {
      this.playTone(783.99, 'sine', 0.25, 1046.5, 0.25); // G5 -> C6
    }, 60);
  }

  playMismatch() {
    this.playTone(220, 'sawtooth', 0.18, 140, 0.16);
  }

  playPowerup() {
    this.playTone(400, 'sine', 0.28, 880, 0.22);
  }

  playBomb() {
    this.playTone(180, 'sawtooth', 0.35, 60, 0.3);
  }

  playWarning() {
    this.playTone(587.33, 'sine', 0.12, 880, 0.2);
  }

  playUrgentTick() {
    this.playTone(950, 'triangle', 0.06, 1200, 0.06);
  }

  playGameOver() {
    this.playTone(320, 'sawtooth', 0.35, 90, 0.35);
  }
}

const DEFAULT_MAHJONG_WORDS = [
  { word: '苹果', pinyin: 'píngguǒ', meaning: 'quả táo' },
  { word: '香蕉', pinyin: 'xiāngjiāo', meaning: 'quả chuối' },
  { word: '西瓜', pinyin: 'xīguā', meaning: 'dưa hấu' },
  { word: '葡萄', pinyin: 'pútao', meaning: 'quả nho' },
  { word: '学校', pinyin: 'xuéxiào', meaning: 'trường học' },
  { word: '老师', pinyin: 'lǎoshī', meaning: 'giáo viên' },
  { word: '学生', pinyin: 'xuéshēng', meaning: 'học sinh' },
  { word: '朋友', pinyin: 'péngyou', meaning: 'bạn bè' },
  { word: '汉语', pinyin: 'hànyǔ', meaning: 'tiếng Hán' },
  { word: '谢谢', pinyin: 'xièxie', meaning: 'cảm ơn' },
  { word: '再见', pinyin: 'zàijiàn', meaning: 'tạm biệt' },
  { word: '喜欢', pinyin: 'xǐhuan', meaning: 'thích' },
  { word: '喝茶', pinyin: 'hē chá', meaning: 'uống trà' },
  { word: '吃饭', pinyin: 'chī fàn', meaning: 'ăn cơm' },
  { word: '中国', pinyin: 'zhōngguó', meaning: 'Trung Quốc' },
  { word: '高兴', pinyin: 'gāoxìng', meaning: 'vui vẻ' }
];

export class MahjongGameEngine {
  constructor(containerEl, wordsList, onExitCallback) {
    this.container = containerEl;
    this.rawWords = Array.isArray(wordsList) && wordsList.length >= 4 ? wordsList : DEFAULT_MAHJONG_WORDS;
    this.onExit = onExitCallback;
    this.sfx = new MahjongSoundFX();

    // 6 rows x 8 cols total (includes 1-cell perimeter for outside routing)
    // Active playable grid: 4 rows x 6 cols = 24 tiles = 12 pairs
    this.rows = 6;
    this.cols = 8;
    this.grid = [];

    // Core State
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeLeft = 100;
    this.pairsLeft = 0;
    this.totalPairs = 0;
    this.isPaused = false;
    this.isRunning = false;
    this.isStopping = false;

    // Selection
    this.selectedTile = null; // { r, c }
    this.isResolvingMatch = false;
    this.clearedWordsSet = new Set();

    // Powerups
    this.hintCount = 3;
    this.shuffleCount = 3;
    this.bombCount = 2;

    this.timerInterval = null;

    this.renderLayout();
    this.bindEvents();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="mahjong-game-wrapper">
        <!-- TOP HUD -->
        <div class="mahjong-hud-bar">
          <button type="button" id="mahjong-top-back-btn" class="btn btn-outline btn-sm" style="display: flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 50px; background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #ffffff;">
            <i class="fa-solid fa-arrow-left"></i> Quay lại chọn game
          </button>

          <div class="hud-item-title">
            <span style="font-size: 1.4rem;">🀄</span>
            <strong style="color: #34d399;">MẠT CHƯỢC NỐI TỪ</strong>
          </div>

          <div class="hud-item" id="mahjong-level-badge" style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; font-weight: 800; padding: 4px 12px; border-radius: 20px; font-size: 0.82rem;">
            MÀN 1/1
          </div>

          <div class="hud-item hud-progress" style="display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-book-open" style="color: #a5b4fc;"></i>
            <span class="hud-label">TIẾN TRÌNH:</span>
            <span class="hud-value" id="mahjong-progress-val">0/0 từ</span>
          </div>

          <div class="hud-item hud-score">
            <i class="fa-solid fa-star" style="color: #fbbf24;"></i>
            <span class="hud-label">ĐIỂM:</span>
            <span class="hud-value" id="mahjong-score-val">0</span>
          </div>

          <div class="hud-item hud-combo">
            <i class="fa-solid fa-fire" style="color: #f97316;"></i>
            <span class="hud-label">CẶP CÒN:</span>
            <span class="hud-value" id="mahjong-pairs-val">0</span>
          </div>

          <div class="hud-item hud-timer" title="Thời gian đếm ngược của màn chơi này">
            <i class="fa-solid fa-clock" style="color: #38bdf8;"></i>
            <span class="hud-label">THỜI GIAN:</span>
            <span class="hud-value" id="mahjong-timer-val">01:40</span>
          </div>

          <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
            <button type="button" id="mahjong-pause-btn" class="btn btn-outline btn-sm" title="Tạm dừng"><i class="fa-solid fa-pause"></i></button>
            <button type="button" id="mahjong-back-hub-top-btn" class="btn btn-secondary btn-sm" title="Đổi trò chơi khác" style="display: flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 50px; padding: 6px 14px;">
              <i class="fa-solid fa-arrow-left"></i> Đổi Game
            </button>
            <button type="button" id="mahjong-exit-btn" class="btn btn-outline btn-sm" title="Thoát về sổ tay"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>

        <!-- MAIN MAHJONG ARENA & TOOLBAR -->
        <div class="mahjong-arena-layout">
          <!-- BOARD CONTAINER WITH CANVAS FOR LASER CONNECTORS -->
          <div class="mahjong-board-container" id="mahjong-board-container">
            <canvas id="mahjong-line-canvas" class="mahjong-line-canvas"></canvas>
            <div id="mahjong-tiles-grid" class="mahjong-tiles-grid"></div>
          </div>

          <!-- RIGHT TOOLBAR: SKILL ITEMS -->
          <div class="mahjong-tools-panel">
            <div class="tool-sec-title">VẬT PHẨM TRỢ GIÚP</div>

            <!-- Tool 1: Kính lúp (Hint) -->
            <button type="button" class="mahjong-tool-card" id="tool-hint" title="Gợi ý cặp nối">
              <div class="tool-icon" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">
                <i class="fa-solid fa-magnifying-glass"></i>
              </div>
              <div class="tool-info">
                <div class="tool-name">KÍNH LÚP</div>
                <div class="tool-desc">Tìm 1 cặp nối được</div>
              </div>
              <div class="tool-badge" id="badge-hint">x3</div>
            </button>

            <!-- Tool 2: Gió lốc (Shuffle) -->
            <button type="button" class="mahjong-tool-card" id="tool-shuffle" title="Đảo lại bàn cờ">
              <div class="tool-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
                <i class="fa-solid fa-shuffle"></i>
              </div>
              <div class="tool-info">
                <div class="tool-name">GIÓ LỐC</div>
                <div class="tool-desc">Xáo lại vị trí bàn cờ</div>
              </div>
              <div class="tool-badge" id="badge-shuffle">x3</div>
            </button>

            <!-- Tool 3: Bom hóa giải (Bomb) -->
            <button type="button" class="mahjong-tool-card" id="tool-bomb" title="Phá 1 cặp bất kỳ">
              <div class="tool-icon" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;">
                <i class="fa-solid fa-bomb"></i>
              </div>
              <div class="tool-info">
                <div class="tool-name">BOM THẦN KỲ</div>
                <div class="tool-desc">Triệt tiêu 1 cặp ngay</div>
              </div>
              <div class="tool-badge" id="badge-bomb">x2</div>
            </button>

            <div class="mahjong-rules-tip">
              <strong>💡 QUY TẮC NỐI:</strong><br>
              Nối 2 quân cùng từ vựng (Chữ Hán ↔ Nghĩa hoặc Chữ Hán ↔ Pinyin) theo đường đi không quá 2 góc gập (3 đoạn thẳng).
            </div>
          </div>
        </div>

        <!-- MODAL OVERLAY -->
        <div id="mahjong-modal-overlay" class="cannon-modal-overlay" style="display: none;">
          <div class="cannon-result-card">
            <button type="button" id="mahjong-modal-close-x" class="result-modal-close-btn" title="Đóng">&times;</button>
            <div id="mahjong-result-icon" class="result-icon">🀄</div>
            <h2 id="mahjong-result-title" class="result-title">Hoàn Thành Bàn Cờ!</h2>
            <p id="mahjong-result-desc" class="result-desc">Bạn đã xuất sắc dọn sạch toàn bộ quân cờ mạt chược!</p>
            
            <div class="result-stats-grid">
              <div class="stat-pill">
                <span class="label">Tổng Điểm</span>
                <span class="val" id="mahjong-res-score">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Combo Cao Nhất</span>
                <span class="val" id="mahjong-res-combo">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Cặp Đã Nối</span>
                <span class="val" id="mahjong-res-pairs">0</span>
              </div>
            </div>

            <!-- BẢNG TỔNG KẾT TỪ VỰNG ĐÚNG / SAI -->
            <div id="mahjong-words-summary-wrap"></div>

            <div class="result-beta-note">
              <i class="fa-solid fa-flask"></i> <strong>Chế độ luyện tập:</strong> Hãy tiếp tục trau dồi vốn từ vựng HSK của bạn!
            </div>

            <div class="cannon-result-card-actions">
              <button type="button" id="mahjong-retry-btn" class="btn btn-primary"><i class="fa-solid fa-rotate-right"></i> Chơi Lại</button>
              <button type="button" id="mahjong-back-hub-btn" class="btn btn-secondary"><i class="fa-solid fa-gamepad"></i> Đổi Trò Chơi</button>
              <button type="button" id="mahjong-finish-btn" class="btn btn-outline"><i class="fa-solid fa-book-bookmark"></i> Quay Lại Sổ Tay</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const topBackBtn = this.container.querySelector('#mahjong-top-back-btn');
    const backHubTopBtn = this.container.querySelector('#mahjong-back-hub-top-btn');
    const pauseBtn = this.container.querySelector('#mahjong-pause-btn');
    const exitBtn = this.container.querySelector('#mahjong-exit-btn');
    const closeXBtn = this.container.querySelector('#mahjong-modal-close-x');
    const retryBtn = this.container.querySelector('#mahjong-retry-btn');
    const backHubBtn = this.container.querySelector('#mahjong-back-hub-btn');
    const finishBtn = this.container.querySelector('#mahjong-finish-btn');

    const hintBtn = this.container.querySelector('#tool-hint');
    const shuffleBtn = this.container.querySelector('#tool-shuffle');
    const bombBtn = this.container.querySelector('#tool-bomb');

    if (topBackBtn) topBackBtn.addEventListener('click', () => this.stopAndExit());
    if (backHubTopBtn) backHubTopBtn.addEventListener('click', () => this.stopAndExit());
    if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
    if (exitBtn) exitBtn.addEventListener('click', () => {
      this.stopAndExit();
      if (typeof window.exitNotebookGamesHub === 'function') window.exitNotebookGamesHub();
    });

    if (closeXBtn) closeXBtn.addEventListener('click', () => {
      this.stopAndExit();
      if (typeof window.exitNotebookGamesHub === 'function') window.exitNotebookGamesHub();
    });
    if (retryBtn) retryBtn.addEventListener('click', () => this.restart());
    if (backHubBtn) backHubBtn.addEventListener('click', () => this.stopAndExit());
    if (finishBtn) finishBtn.addEventListener('click', () => {
      this.stopAndExit();
      if (typeof window.exitNotebookGamesHub === 'function') window.exitNotebookGamesHub();
    });

    if (hintBtn) hintBtn.addEventListener('click', () => this.useHint());
    if (shuffleBtn) shuffleBtn.addEventListener('click', () => this.useShuffle());
    if (bombBtn) bombBtn.addEventListener('click', () => this.useBomb());
  }

  start() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.isStopping = false;
    this.isRunning = true;
    this.isPaused = false;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeLeft = 100;
    this.hintCount = 3;
    this.shuffleCount = 3;
    this.bombCount = 2;
    this.selectedTile = null;
    this.isResolvingMatch = false;

    this.totalWordsCount = (this.rawWords || []).length;
    this.totalLevels = Math.max(1, Math.ceil(this.totalWordsCount / 12));
    this.currentLevel = 1;
    this.unplayedWordsPool = [...(this.rawWords || [])].sort(() => Math.random() - 0.5);
    this.totalUniqueWordsCleared = 0;
    this.currentLevelNewWordsCount = 0;

    const overlay = this.container.querySelector('#mahjong-modal-overlay');
    if (overlay) {
      overlay.style.setProperty('display', 'none', 'important');
    }

    // Reset HUD timer visual styles
    const hudTimer = this.container.querySelector('.hud-timer');
    if (hudTimer) {
      hudTimer.classList.remove('timer-warning-60', 'timer-warning-30', 'timer-urgent-10');
    }

    this.initBoard();
    this.updateHUD();
    this.startTimers();
  }

  startTimers() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.isRunning || this.isPaused) return;
      this.timeLeft--;

      this.handleTimeCountdownAlert(this.timeLeft);

      if (this.timeLeft <= 0) {
        this.gameOver(false);
      }
      this.updateHUD();
    }, 1000);
  }

  handleTimeCountdownAlert(t) {
    const hudTimer = this.container.querySelector('.hud-timer');

    if (t === 60) {
      if (this.sfx && this.sfx.playWarning) this.sfx.playWarning();
      this.showToast('⏳ Còn 60 giây!');
      if (hudTimer) {
        hudTimer.classList.add('timer-warning-60');
        setTimeout(() => hudTimer && hudTimer.classList.remove('timer-warning-60'), 2000);
      }
    } else if (t === 30) {
      if (this.sfx && this.sfx.playWarning) this.sfx.playWarning();
      this.showToast('⚠️ Còn 30 giây! Hãy tăng tốc!');
      if (hudTimer) {
        hudTimer.classList.add('timer-warning-30');
      }
    } else if (t <= 10 && t >= 1) {
      if (this.sfx && this.sfx.playUrgentTick) this.sfx.playUrgentTick();
      if (hudTimer) {
        hudTimer.classList.add('timer-urgent-10');
      }
      this.showCenterCountdownTick(t);
    }
  }

  showCenterCountdownTick(num) {
    let tickEl = this.container.querySelector('.game-center-countdown-tick');
    if (!tickEl) {
      tickEl = document.createElement('div');
      tickEl.className = 'game-center-countdown-tick';
      const board = this.container.querySelector('#mahjong-board-container') || this.container;
      board.appendChild(tickEl);
    }
    tickEl.textContent = num;
    tickEl.classList.remove('tick-anim');
    void tickEl.offsetWidth;
    tickEl.classList.add('tick-anim');
  }

  initBoard() {
    // Inner grid: (rows - 2) * (cols - 2) = 4 * 6 = 24 tiles -> 12 pairs
    const innerRows = this.rows - 2;
    const innerCols = this.cols - 2;
    const totalInnerTiles = innerRows * innerCols; // 24
    const pairsNeeded = totalInnerTiles / 2; // 12

    if (!this.unplayedWordsPool || this.unplayedWordsPool.length === 0) {
      this.gameOver(true);
      return;
    }

    // Lấy tối đa 12 từ mới từ kho từ vựng chưa ôn
    const newWords = this.unplayedWordsPool.splice(0, Math.min(pairsNeeded, this.unplayedWordsPool.length));
    this.currentLevelNewWordsCount = newWords.length;

    // Nếu màn cuối còn ít hơn 12 từ (ví dụ còn 4 từ), lấy thêm các từ trong danh sách để lấp đầy 12 cặp (24 quân)
    const activeWordsForBoard = [...newWords];
    let fillIdx = 0;
    while (activeWordsForBoard.length < pairsNeeded) {
      const fallbackWord = this.rawWords[fillIdx % this.rawWords.length] || DEFAULT_MAHJONG_WORDS[fillIdx % DEFAULT_MAHJONG_WORDS.length];
      activeWordsForBoard.push(fallbackWord);
      fillIdx++;
    }

    this.totalPairs = pairsNeeded;
    this.pairsLeft = pairsNeeded;

    const tilesList = [];
    for (let i = 0; i < pairsNeeded; i++) {
      const wordObj = activeWordsForBoard[i];
      const pairId = 'pair_' + i + '_' + Date.now();

      const cleanWord = wordObj.word || wordObj.text || '汉字';
      const cleanPinyin = wordObj.pinyin || 'hànzì';
      const cleanMeaning = wordObj.meaning || wordObj.vietnamese || 'từ vựng';

      // Tile 1: Always Chinese Hanzi
      tilesList.push({
        pairId: pairId,
        word: cleanWord,
        text: cleanWord,
        type: 'hanzi',
        pinyin: cleanPinyin,
        meaning: cleanMeaning
      });

      // Tile 2: Alternate between Meaning (70%) and Pinyin (30%) for great educational balance
      if (i % 3 === 0) {
        tilesList.push({
          pairId: pairId,
          word: cleanWord,
          text: cleanPinyin,
          type: 'pinyin',
          pinyin: cleanPinyin,
          meaning: cleanMeaning
        });
      } else {
        tilesList.push({
          pairId: pairId,
          word: cleanWord,
          text: cleanMeaning,
          type: 'meaning',
          pinyin: cleanPinyin,
          meaning: cleanMeaning
        });
      }
    }

    // Shuffle tiles
    tilesList.sort(() => 0.5 - Math.random());

    // Initialize 2D grid with null borders (row 0, row rows-1, col 0, col cols-1)
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
          this.grid[r][c] = null; // empty perimeter for routing
        } else {
          const item = tilesList.pop();
          this.grid[r][c] = item ? { ...item, r, c } : null;
        }
      }
    }

    // Ensure there's at least one valid move initially
    this.ensureSolvableBoard();
    this.renderBoard();
  }

  ensureSolvableBoard() {
    let moves = this.findAnyValidPair();
    let attempts = 0;
    while (!moves && attempts < 10) {
      // Shuffle inner tiles
      const innerItems = [];
      for (let r = 1; r < this.rows - 1; r++) {
        for (let c = 1; c < this.cols - 1; c++) {
          if (this.grid[r][c]) innerItems.push(this.grid[r][c]);
        }
      }
      innerItems.sort(() => 0.5 - Math.random());
      for (let r = 1; r < this.rows - 1; r++) {
        for (let c = 1; c < this.cols - 1; c++) {
          if (this.grid[r][c]) {
            const item = innerItems.pop();
            item.r = r;
            item.c = c;
            this.grid[r][c] = item;
          }
        }
      }
      moves = this.findAnyValidPair();
      attempts++;
    }
  }

  renderBoard() {
    const gridEl = this.container.querySelector('#mahjong-tiles-grid');
    if (!gridEl) return;

    gridEl.style.gridTemplateColumns = `repeat(${this.cols - 2}, 1fr)`;
    gridEl.style.gridTemplateRows = `repeat(${this.rows - 2}, 1fr)`;
    gridEl.innerHTML = '';

    for (let r = 1; r < this.rows - 1; r++) {
      for (let c = 1; c < this.cols - 1; c++) {
        const item = this.grid[r][c];
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.id = `tile_${r}_${c}`;
        tile.className = `mahjong-tile ${item ? 'type-' + item.type : 'cleared'}`;

        if (item) {
          const tagLabel = item.type === 'hanzi' ? 'HÁN' : item.type === 'pinyin' ? 'PINYIN' : 'NGHĨA';
          tile.innerHTML = `
            <span class="tile-inner-text">${item.text}</span>
            <span class="tile-type-tag">${tagLabel}</span>
          `;
          tile.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleTileClick(r, c);
          });
        } else {
          tile.disabled = true;
        }

        gridEl.appendChild(tile);
      }
    }

    this.updateSelectionHighlights();
  }

  handleTileClick(r, c) {
    if (this.isResolvingMatch || !this.isRunning || this.isPaused) return;
    const clickedItem = this.grid[r][c];
    if (!clickedItem) return;

    if (!this.selectedTile) {
      // First tile selected
      this.sfx.playSelect();
      this.selectedTile = { r, c };
      this.updateSelectionHighlights();
    } else {
      // Second tile clicked
      if (this.selectedTile.r === r && this.selectedTile.c === c) {
        // Deselect current
        this.sfx.playSelect();
        this.selectedTile = null;
        this.updateSelectionHighlights();
        return;
      }

      const firstTile = this.selectedTile;
      const firstItem = this.grid[firstTile.r][firstTile.c];

      if (firstItem && firstItem.pairId === clickedItem.pairId) {
        // Same pair vocabulary! Check if path is valid (<= 2 turns)
        const path = this.findOnetPath(firstTile.r, firstTile.c, r, c);
        if (path) {
          this.handleMatch(firstTile, { r, c }, path);
        } else {
          // Blocked path
          this.sfx.playMismatch();
          this.triggerTileShake(r, c);
          this.showToast('⚠️ Bị cản đường! Nối không quá 2 góc gập.');
          this.selectedTile = { r, c };
          this.updateSelectionHighlights();
        }
      } else {
        // Different vocabulary pair
        this.sfx.playMismatch();
        this.triggerTileShake(r, c);
        this.selectedTile = { r, c };
        this.updateSelectionHighlights();
      }
    }
  }

  triggerTileShake(r, c) {
    const tileEl = this.container.querySelector(`#tile_${r}_${c}`);
    if (tileEl) {
      tileEl.classList.remove('shake-tile');
      void tileEl.offsetWidth; // force reflow
      tileEl.classList.add('shake-tile');
      setTimeout(() => tileEl.classList.remove('shake-tile'), 380);
    }
  }

  updateSelectionHighlights() {
    this.container.querySelectorAll('.mahjong-tile').forEach(t => t.classList.remove('selected', 'hint-pulse'));
    if (this.selectedTile) {
      const selectedEl = this.container.querySelector(`#tile_${this.selectedTile.r}_${this.selectedTile.c}`);
      if (selectedEl) selectedEl.classList.add('selected');
    }
  }

  // ==========================================
  // ONET 3-LINE / 2-TURN PATHFINDING ALGORITHM
  // ==========================================
  findOnetPath(r1, c1, r2, c2) {
    // 1. Direct Line (0 turn)
    if (this.canConnectDirect(r1, c1, r2, c2)) {
      return [{ r: r1, c: c1 }, { r: r2, c: c2 }];
    }

    // 2. One Turn (L shape - 1 turn)
    // Corner A: (r1, c2)
    if (this.isEmptyCell(r1, c2) && this.canConnectDirect(r1, c1, r1, c2) && this.canConnectDirect(r1, c2, r2, c2)) {
      return [{ r: r1, c: c1 }, { r: r1, c: c2 }, { r: r2, c: c2 }];
    }
    // Corner B: (r2, c1)
    if (this.isEmptyCell(r2, c1) && this.canConnectDirect(r1, c1, r2, c1) && this.canConnectDirect(r2, c1, r2, c2)) {
      return [{ r: r1, c: c1 }, { r: r2, c: c1 }, { r: r2, c: c2 }];
    }

    // 3. Two Turns (Z or U shape - 2 turns)
    // Scan horizontal channels (from col 0 to cols-1)
    for (let c = 0; c < this.cols; c++) {
      if (c === c1 || c === c2) continue;
      if (this.isEmptyCell(r1, c) && this.isEmptyCell(r2, c)) {
        if (this.canConnectDirect(r1, c1, r1, c) && this.canConnectDirect(r1, c, r2, c) && this.canConnectDirect(r2, c, r2, c2)) {
          return [{ r: r1, c: c1 }, { r: r1, c }, { r: r2, c }, { r: r2, c: c2 }];
        }
      }
    }

    // Scan vertical channels (from row 0 to rows-1)
    for (let r = 0; r < this.rows; r++) {
      if (r === r1 || r === r2) continue;
      if (this.isEmptyCell(r, c1) && this.isEmptyCell(r, c2)) {
        if (this.canConnectDirect(r1, c1, r, c1) && this.canConnectDirect(r, c1, r, c2) && this.canConnectDirect(r, c2, r2, c2)) {
          return [{ r: r1, c: c1 }, { r, c: c1 }, { r, c: c2 }, { r: r2, c: c2 }];
        }
      }
    }

    return null;
  }

  isEmptyCell(r, c) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return true;
    return this.grid[r][c] === null;
  }

  canConnectDirect(r1, c1, r2, c2) {
    if (r1 === r2) {
      const minC = Math.min(c1, c2);
      const maxC = Math.max(c1, c2);
      for (let c = minC + 1; c < maxC; c++) {
        if (!this.isEmptyCell(r1, c)) return false;
      }
      return true;
    }
    if (c1 === c2) {
      const minR = Math.min(r1, r2);
      const maxR = Math.max(r1, r2);
      for (let r = minR + 1; r < maxR; r++) {
        if (!this.isEmptyCell(r, c1)) return false;
      }
      return true;
    }
    return false;
  }

  handleMatch(tile1, tile2, path) {
    this.isResolvingMatch = true;
    const item1 = this.grid[tile1.r][tile1.c];
    this.sfx.playMatch();

    this.score += 25 + this.combo * 10;
    this.combo++;
    this.pairsLeft--;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    // Highlight matched glow
    const el1 = this.container.querySelector(`#tile_${tile1.r}_${tile1.c}`);
    const el2 = this.container.querySelector(`#tile_${tile2.r}_${tile2.c}`);
    if (el1) el1.classList.add('matched-glow');
    if (el2) el2.classList.add('matched-glow');

    // Draw Smooth Neon Laser beam
    this.drawLaserPath(path);

    // Pronounce Hanzi
    if (item1 && item1.word) {
      this.clearedWordsSet.add(item1.word);
      if (window.speakText) {
        window.speakText(item1.word);
      }
    }

    // Vanish animation after brief laser show
    setTimeout(() => {
      if (el1) el1.classList.add('matched-vanish');
      if (el2) el2.classList.add('matched-vanish');
    }, 180);

    setTimeout(() => {
      this.clearLaserPath();
      this.grid[tile1.r][tile1.c] = null;
      this.grid[tile2.r][tile2.c] = null;
      this.selectedTile = null;
      this.isResolvingMatch = false;

      this.renderBoard();
      this.updateHUD();

      if (this.pairsLeft <= 0) {
        this.totalUniqueWordsCleared += this.currentLevelNewWordsCount;
        if (this.unplayedWordsPool && this.unplayedWordsPool.length > 0) {
          // QUA MÀN TIẾP THEO
          this.currentLevel++;
          this.sfx.playPowerup();
          this.timeLeft = Math.min(150, this.timeLeft + 50); // Thêm 50s thưởng
          this.hintCount = Math.min(5, this.hintCount + 1);
          this.shuffleCount = Math.min(5, this.shuffleCount + 1);
          this.bombCount = Math.min(4, this.bombCount + 1);
          this.showToast(`🎉 XUẤT SẮC QUA MÀN ${this.currentLevel - 1}! Sang Màn ${this.currentLevel}/${this.totalLevels} (${this.unplayedWordsPool.length} từ tiếp theo)...`);
          this.initBoard();
          this.updateHUD();
        } else {
          // HOÀN THÀNH TẤT CẢ CÁC MÀN
          this.gameOver(true);
        }
      } else {
        // Auto check if any valid moves remain
        const remainingMoves = this.findAnyValidPair();
        if (!remainingMoves && this.pairsLeft > 0) {
          this.showToast('🔄 Tự động xáo trộn cờ vì không còn đường đi!');
          this.autoShuffleBoard();
        }
      }
    }, 380);
  }

  // ==========================================
  // LASER BEAM RENDERING ENGINE (ULTRA SMOOTH)
  // ==========================================
  getPointCoordinates(r, c) {
    const container = this.container.querySelector('#mahjong-board-container');
    const gridEl = this.container.querySelector('#mahjong-tiles-grid');
    if (!container || !gridEl) return { x: 0, y: 0 };

    const cRect = container.getBoundingClientRect();
    const gRect = gridEl.getBoundingClientRect();

    const tileEl = this.container.querySelector(`#tile_${r}_${c}`);
    if (tileEl) {
      const tRect = tileEl.getBoundingClientRect();
      return {
        x: tRect.left + tRect.width / 2 - cRect.left,
        y: tRect.top + tRect.height / 2 - cRect.top
      };
    }

    // For perimeter outer boundary points (r=0, r=rows-1, c=0, c=cols-1)
    const innerCols = this.cols - 2;
    const innerRows = this.rows - 2;
    const cellW = gRect.width / innerCols;
    const cellH = gRect.height / innerRows;

    let x = 0;
    let y = 0;

    if (c === 0) {
      x = gRect.left - cRect.left - 18;
    } else if (c === this.cols - 1) {
      x = gRect.right - cRect.left + 18;
    } else {
      x = gRect.left - cRect.left + (c - 1 + 0.5) * cellW;
    }

    if (r === 0) {
      y = gRect.top - cRect.top - 18;
    } else if (r === this.rows - 1) {
      y = gRect.bottom - cRect.top + 18;
    } else {
      y = gRect.top - cRect.top + (r - 1 + 0.5) * cellH;
    }

    return { x, y };
  }

  drawLaserPath(path) {
    const canvas = this.container.querySelector('#mahjong-line-canvas');
    const container = this.container.querySelector('#mahjong-board-container');
    if (!canvas || !container || !path || path.length < 2) return;

    const cRect = container.getBoundingClientRect();
    canvas.width = cRect.width;
    canvas.height = cRect.height;
    const ctx = canvas.getContext('2d');

    const points = path.map(p => this.getPointCoordinates(p.r, p.c));

    // Clear previous
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Layer 1: Wide Soft Neon Halo
    ctx.save();
    ctx.beginPath();
    points.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 14;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.restore();

    // Layer 2: Radiant Electric Core
    ctx.save();
    ctx.beginPath();
    points.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#22d3ee';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.restore();

    // Layer 3: Blazing White Hot Center
    ctx.save();
    ctx.beginPath();
    points.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();

    // Glowing Node Circles at corners and endpoints
    points.forEach((pt) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();
    });
  }

  clearLaserPath() {
    const canvas = this.container.querySelector('#mahjong-line-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // ==========================================
  // POWERUPS & HELPERS
  // ==========================================
  findAnyValidPair() {
    for (let r1 = 1; r1 < this.rows - 1; r1++) {
      for (let c1 = 1; c1 < this.cols - 1; c1++) {
        const item1 = this.grid[r1][c1];
        if (!item1) continue;

        for (let r2 = 1; r2 < this.rows - 1; r2++) {
          for (let c2 = 1; c2 < this.cols - 1; c2++) {
            if (r1 === r2 && c1 === c2) continue;
            const item2 = this.grid[r2][c2];
            if (!item2 || item1.pairId !== item2.pairId) continue;

            const path = this.findOnetPath(r1, c1, r2, c2);
            if (path) {
              return { tile1: { r: r1, c: c1 }, tile2: { r: r2, c: c2 }, path };
            }
          }
        }
      }
    }
    return null;
  }

  useHint() {
    if (!this.isRunning || this.isPaused) return;
    if (this.hintCount <= 0) {
      this.showToast('Đã dùng hết Kính Lúp gợi ý!');
      return;
    }

    const match = this.findAnyValidPair();
    if (match) {
      this.hintCount--;
      this.sfx.playPowerup();
      const el1 = this.container.querySelector(`#tile_${match.tile1.r}_${match.tile1.c}`);
      const el2 = this.container.querySelector(`#tile_${match.tile2.r}_${match.tile2.c}`);
      if (el1) el1.classList.add('hint-pulse');
      if (el2) el2.classList.add('hint-pulse');
      this.updateHUD();
      this.showToast('🔍 Đã tìm thấy 1 cặp có thể nối!');
    } else {
      this.showToast('Không còn cặp nối trực tiếp, hãy dùng Gió Lốc đảo bài!');
    }
  }

  useShuffle() {
    if (!this.isRunning || this.isPaused) return;
    if (this.shuffleCount <= 0) {
      this.showToast('Đã dùng hết Gió Lốc đảo bài!');
      return;
    }

    this.shuffleCount--;
    this.sfx.playPowerup();
    this.autoShuffleBoard();
    this.updateHUD();
    this.showToast('🌪️ Đã xáo trộn lại toàn bộ bàn cờ!');
  }

  autoShuffleBoard() {
    const currentTiles = [];
    for (let r = 1; r < this.rows - 1; r++) {
      for (let c = 1; c < this.cols - 1; c++) {
        if (this.grid[r][c]) currentTiles.push(this.grid[r][c]);
      }
    }

    currentTiles.sort(() => 0.5 - Math.random());

    for (let r = 1; r < this.rows - 1; r++) {
      for (let c = 1; c < this.cols - 1; c++) {
        if (this.grid[r][c]) {
          const item = currentTiles.pop();
          item.r = r;
          item.c = c;
          this.grid[r][c] = item;
        }
      }
    }

    this.ensureSolvableBoard();
    this.selectedTile = null;
    this.renderBoard();
  }

  useBomb() {
    if (!this.isRunning || this.isPaused) return;
    if (this.bombCount <= 0) {
      this.showToast('Đã dùng hết Bom Thần Kỳ!');
      return;
    }

    for (let r1 = 1; r1 < this.rows - 1; r1++) {
      for (let c1 = 1; c1 < this.cols - 1; c1++) {
        const item1 = this.grid[r1][c1];
        if (!item1) continue;

        for (let r2 = 1; r2 < this.rows - 1; r2++) {
          for (let c2 = 1; c2 < this.cols - 1; c2++) {
            if (r1 === r2 && c1 === c2) continue;
            const item2 = this.grid[r2][c2];
            if (item2 && item1.pairId === item2.pairId) {
              this.bombCount--;
              this.sfx.playBomb();
              this.handleMatch({ r: r1, c: c1 }, { r: r2, c: c2 }, [{ r: r1, c: c1 }, { r: r2, c: c2 }]);
              this.showToast('💣 Bom Thần Kỳ đã hóa giải 1 cặp!');
              return;
            }
          }
        }
      }
    }
  }

  updateHUD() {
    const scoreVal = this.container.querySelector('#mahjong-score-val');
    const pairsVal = this.container.querySelector('#mahjong-pairs-val');
    const timerVal = this.container.querySelector('#mahjong-timer-val');
    const levelBadge = this.container.querySelector('#mahjong-level-badge');
    const progressVal = this.container.querySelector('#mahjong-progress-val');

    const bHint = this.container.querySelector('#badge-hint');
    const bShuffle = this.container.querySelector('#badge-shuffle');
    const bBomb = this.container.querySelector('#badge-bomb');

    if (scoreVal) scoreVal.textContent = this.score;
    if (pairsVal) pairsVal.textContent = `${this.pairsLeft}/${this.totalPairs}`;
    if (levelBadge) levelBadge.textContent = `MÀN ${this.currentLevel}/${this.totalLevels}`;

    if (progressVal) {
      const currentMatchedInLevel = Math.floor((this.totalPairs - this.pairsLeft) * (this.currentLevelNewWordsCount / this.totalPairs));
      const totalDone = Math.min(this.totalWordsCount, this.totalUniqueWordsCleared + currentMatchedInLevel);
      progressVal.textContent = `${totalDone}/${this.totalWordsCount} từ`;
    }

    if (timerVal) {
      const min = Math.floor(this.timeLeft / 60);
      const sec = this.timeLeft % 60;
      timerVal.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    if (bHint) bHint.textContent = `x${this.hintCount}`;
    if (bShuffle) bShuffle.textContent = `x${this.shuffleCount}`;
    if (bBomb) bBomb.textContent = `x${this.bombCount}`;
  }

  showToast(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseBtn = this.container.querySelector('#mahjong-pause-btn');
    if (pauseBtn) {
      pauseBtn.innerHTML = `<i class="fa-solid fa-${this.isPaused ? 'play' : 'pause'}"></i>`;
    }
    this.showToast(this.isPaused ? 'Đã tạm dừng game ⏸' : 'Tiếp tục chơi ▶️');
  }

  gameOver(isVictory) {
    this.isRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);

    const overlay = this.container.querySelector('#mahjong-modal-overlay');
    const icon = this.container.querySelector('#mahjong-result-icon');
    const title = this.container.querySelector('#mahjong-result-title');
    const desc = this.container.querySelector('#mahjong-result-desc');
    const resScore = this.container.querySelector('#mahjong-res-score');
    const resCombo = this.container.querySelector('#mahjong-res-combo');
    const resPairs = this.container.querySelector('#mahjong-res-pairs');

    if (overlay) {
      overlay.style.setProperty('display', 'flex', 'important');
      if (isVictory) {
        if (this.sfx && this.sfx.playMatch) this.sfx.playMatch();
      } else {
        if (this.sfx && this.sfx.playGameOver) this.sfx.playGameOver();
      }

      if (icon) icon.textContent = isVictory ? '👑' : '⏰';
      if (title) title.textContent = isVictory ? 'Đại Sư Mạt Chược - Hoàn Thành Xuất Sắc!' : 'Hết Giờ - Game Over!';
      if (desc) desc.textContent = isVictory ? `Bạn đã xuất sắc vượt qua toàn bộ ${this.totalLevels} Màn chơi và hoàn thành ${this.totalWordsCount}/${this.totalWordsCount} từ vựng!` : 'Hãy tận dụng Kính Lúp và Gió Lốc để nối nhanh hơn nhé!';
      if (resScore) resScore.textContent = this.score;
      if (resCombo) resCombo.textContent = this.maxCombo;
      if (resPairs) resPairs.textContent = `${this.totalWordsCount}/${this.totalWordsCount} từ (${this.currentLevel} Màn)`;

      // Render danh sách từ vựng Đúng / Sai
      const summaryWrap = overlay.querySelector('#mahjong-words-summary-wrap');
      if (summaryWrap) {
        this.renderWordSummaryList(summaryWrap, this.rawWords, this.clearedWordsSet);
      }

      const closeXBtn = overlay.querySelector('#mahjong-modal-close-x');
      const retryBtn = overlay.querySelector('#mahjong-retry-btn');
      const backHubBtn = overlay.querySelector('#mahjong-back-hub-btn');
      const finishBtn = overlay.querySelector('#mahjong-finish-btn');

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
    const overlay = this.container.querySelector('#mahjong-modal-overlay');
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
    const overlay = this.container.querySelector('#mahjong-modal-overlay');
    if (overlay) {
      overlay.style.setProperty('display', 'none', 'important');
    }
    if (typeof this.onExit === 'function') {
      this.onExit();
    }
  }
}
