/**
 * Tiếng Trung HongTai - Notebook Mini-Game 4: MẠT CHƯỢC NỐI CẶP THẦN TỐC (Hanzi Mahjong / Onet)
 * Giai đoạn: Thử nghiệm nội bộ (Beta Super Admin)
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
  playSelect() {
    this.playTone(400, 'sine', 0.08, 600);
  }
  playMatch() {
    this.playTone(523.25, 'triangle', 0.12, 783.99); // C5 to G5
  }
  playMismatch() {
    this.playTone(200, 'sawtooth', 0.2, 120);
  }
  playPowerup() {
    this.playTone(450, 'sine', 0.25, 900);
  }
}

export class MahjongGameEngine {
  constructor(containerEl, wordsList, onExitCallback) {
    this.container = containerEl;
    this.rawWords = wordsList && wordsList.length >= 4 ? wordsList : [
      { word: '苹果', pinyin: 'píngguǒ', meaning: 'quả táo' },
      { word: '香蕉', pinyin: 'xiāngjiāo', meaning: 'quả chuối' },
      { word: '西瓜', pinyin: 'xīguā', meaning: 'dưa hấu' },
      { word: '葡萄', pinyin: 'pútao', meaning: 'quả nho' },
      { word: '学校', pinyin: 'xuéxiào', meaning: 'trường học' },
      { word: '老师', pinyin: 'lǎoshī', meaning: 'giáo viên' },
      { word: '学生', pinyin: 'xuéshēng', meaning: 'học sinh' },
      { word: '朋友', pinyin: 'péngyou', meaning: 'bạn bè' }
    ];
    this.onExit = onExitCallback;
    this.sfx = new MahjongSoundFX();

    // Grid Dimensions (including 1 cell padding border for Onet outside-routing)
    this.rows = 6;
    this.cols = 6;
    this.grid = []; // 2D array [row][col]

    // Game Core State
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeLeft = 90;
    this.pairsLeft = 0;
    this.totalPairs = 0;
    this.isPaused = false;
    this.isRunning = false;

    // Selection
    this.selectedTile = null; // { r, c }

    // Helpers
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
        <div class="cannon-hud-bar">
          <button type="button" id="mahjong-top-back-btn" class="btn btn-outline btn-sm" style="display: flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 50px;">
            <i class="fa-solid fa-arrow-left"></i> Quay lại chọn game
          </button>

          <div class="hud-item-title">
            <span style="font-size: 1.4rem;">🀄</span>
            <strong style="color: #10b981;">MẠT CHƯỢC NỐI TỪ</strong>
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

          <div class="hud-item hud-timer">
            <i class="fa-solid fa-clock" style="color: #38bdf8;"></i>
            <span class="hud-value" id="mahjong-timer-val">01:30</span>
          </div>

          <div style="margin-left: auto; display: flex; gap: 8px;">
            <button type="button" id="mahjong-pause-btn" class="btn btn-outline btn-sm" title="Tạm dừng"><i class="fa-solid fa-pause"></i></button>
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
              Nối 2 quân cùng từ vựng (Chữ Hán ↔ Pinyin hoặc Chữ Hán ↔ Nghĩa) theo đường không quá 3 đoạn gấp khúc.
            </div>
          </div>
        </div>

        <!-- MODAL OVERLAY -->
        <div id="mahjong-modal-overlay" class="cannon-modal-overlay" style="display: none;">
          <div class="cannon-result-card">
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

            <div class="result-beta-note">
              <i class="fa-solid fa-flask"></i> <strong>Chế độ thử nghiệm:</strong> Điểm số và thành tích không lưu vào hồ sơ trong giai đoạn Beta Super Admin.
            </div>

            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
              <button type="button" id="mahjong-retry-btn" class="btn btn-primary" style="padding: 10px 20px; font-weight: 800;"><i class="fa-solid fa-rotate-right"></i> Chơi Lại</button>
              <button type="button" id="mahjong-back-hub-btn" class="btn btn-secondary" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-gamepad"></i> Đổi Trò Chơi</button>
              <button type="button" id="mahjong-finish-btn" class="btn btn-outline" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-book-bookmark"></i> Quay Lại Sổ Tay</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const topBackBtn = this.container.querySelector('#mahjong-top-back-btn');
    const pauseBtn = this.container.querySelector('#mahjong-pause-btn');
    const exitBtn = this.container.querySelector('#mahjong-exit-btn');
    const retryBtn = this.container.querySelector('#mahjong-retry-btn');
    const backHubBtn = this.container.querySelector('#mahjong-back-hub-btn');
    const finishBtn = this.container.querySelector('#mahjong-finish-btn');

    const hintBtn = this.container.querySelector('#tool-hint');
    const shuffleBtn = this.container.querySelector('#tool-shuffle');
    const bombBtn = this.container.querySelector('#tool-bomb');

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

    if (hintBtn) hintBtn.addEventListener('click', () => this.useHint());
    if (shuffleBtn) shuffleBtn.addEventListener('click', () => this.useShuffle());
    if (bombBtn) bombBtn.addEventListener('click', () => this.useBomb());
  }

  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeLeft = 90;
    this.hintCount = 3;
    this.shuffleCount = 3;
    this.bombCount = 2;
    this.selectedTile = null;

    this.initBoard();
    this.updateHUD();
    this.startTimers();
  }

  startTimers() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.isRunning || this.isPaused) return;
      this.timeLeft--;

      if (this.timeLeft <= 0) {
        this.gameOver(false);
      }
      this.updateHUD();
    }, 1000);
  }

  initBoard() {
    // Generate pairs of tiles: 6x6 board inside = 16 pairs (32 tiles total + 4 empty/bonus or 18 pairs = 36 tiles)
    const totalTiles = (this.rows - 2) * (this.cols - 2); // 4x4 inner = 16 tiles (8 pairs) or 6x6 inner = 18 pairs
    const pairsNeeded = totalTiles / 2;
    this.totalPairs = pairsNeeded;
    this.pairsLeft = pairsNeeded;

    const tilesList = [];
    for (let i = 0; i < pairsNeeded; i++) {
      const wordObj = this.rawWords[i % this.rawWords.length];
      const pairId = 'pair_' + i;

      // Tile 1: Hanzi
      tilesList.push({
        pairId: pairId,
        word: wordObj.word,
        text: wordObj.word,
        type: 'hanzi',
        pinyin: wordObj.pinyin,
        meaning: wordObj.meaning
      });

      // Tile 2: Alternates between Pinyin and Meaning
      if (i % 2 === 0) {
        tilesList.push({
          pairId: pairId,
          word: wordObj.word,
          text: wordObj.pinyin,
          type: 'pinyin',
          pinyin: wordObj.pinyin,
          meaning: wordObj.meaning
        });
      } else {
        tilesList.push({
          pairId: pairId,
          word: wordObj.word,
          text: wordObj.meaning,
          type: 'meaning',
          pinyin: wordObj.pinyin,
          meaning: wordObj.meaning
        });
      }
    }

    // Shuffle tiles
    tilesList.sort(() => 0.5 - Math.random());

    // Initialize 2D grid with 0 padding for outer border paths
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
          this.grid[r][c] = null; // empty border for routing
        } else {
          const item = tilesList.pop();
          this.grid[r][c] = item || null;
        }
      }
    }

    this.renderBoard();
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
        tile.className = `mahjong-tile type-${item ? item.type : 'empty'}`;

        if (item) {
          tile.innerHTML = `
            <span class="tile-inner-text">${item.text}</span>
            <span class="tile-type-tag">${item.type === 'hanzi' ? 'HÁN' : item.type === 'pinyin' ? 'PINYIN' : 'NGHĨA'}</span>
          `;
          tile.addEventListener('click', () => this.handleTileClick(r, c));
        } else {
          tile.classList.add('cleared');
          tile.disabled = true;
        }

        gridEl.appendChild(tile);
      }
    }

    this.updateSelectionHighlights();
  }

  handleTileClick(r, c) {
    const clickedItem = this.grid[r][c];
    if (!clickedItem) return;

    this.sfx.playSelect();

    if (!this.selectedTile) {
      // First tile selected
      this.selectedTile = { r, c };
      this.updateSelectionHighlights();
    } else {
      // Second tile selected
      if (this.selectedTile.r === r && this.selectedTile.c === c) {
        // Deselect
        this.selectedTile = null;
        this.updateSelectionHighlights();
        return;
      }

      const firstTile = this.selectedTile;
      const firstItem = this.grid[firstTile.r][firstTile.c];

      if (firstItem && firstItem.pairId === clickedItem.pairId) {
        // Check Onet path (at most 2 turns)
        const path = this.findOnetPath(firstTile.r, firstTile.c, r, c);
        if (path) {
          this.handleMatch(firstTile, { r, c }, path);
        } else {
          this.sfx.playMismatch();
          this.showToast('Không có đường nối thông thoáng! (Tối đa 2 góc gập)');
          this.selectedTile = { r, c };
          this.updateSelectionHighlights();
        }
      } else {
        // Mismatch
        this.sfx.playMismatch();
        this.selectedTile = { r, c };
        this.updateSelectionHighlights();
      }
    }
  }

  updateSelectionHighlights() {
    this.container.querySelectorAll('.mahjong-tile').forEach(t => t.classList.remove('selected', 'hint-pulse'));
    if (this.selectedTile) {
      const selectedEl = this.container.querySelector(`#tile_${this.selectedTile.r}_${this.selectedTile.c}`);
      if (selectedEl) selectedEl.classList.add('selected');
    }
  }

  // Classic Onet 3-Line / 2-Turn Path Algorithm
  findOnetPath(r1, c1, r2, c2) {
    // Direct Line (0 turn)
    if (this.canConnectDirect(r1, c1, r2, c2)) {
      return [{ r: r1, c: c1 }, { r: r2, c: c2 }];
    }

    // 1 Turn (L shape)
    // Corner 1: (r1, c2)
    if (this.isEmptyCell(r1, c2) && this.canConnectDirect(r1, c1, r1, c2) && this.canConnectDirect(r1, c2, r2, c2)) {
      return [{ r: r1, c: c1 }, { r: r1, c: c2 }, { r: r2, c: c2 }];
    }
    // Corner 2: (r2, c1)
    if (this.isEmptyCell(r2, c1) && this.canConnectDirect(r1, c1, r2, c1) && this.canConnectDirect(r2, c1, r2, c2)) {
      return [{ r: r1, c: c1 }, { r: r2, c: c1 }, { r: r2, c: c2 }];
    }

    // 2 Turns (Z or U shape)
    // Scan horizontal lines
    for (let c = 0; c < this.cols; c++) {
      if (c === c1 || c === c2) continue;
      if (this.isEmptyCell(r1, c) && this.isEmptyCell(r2, c)) {
        if (this.canConnectDirect(r1, c1, r1, c) && this.canConnectDirect(r1, c, r2, c) && this.canConnectDirect(r2, c, r2, c2)) {
          return [{ r: r1, c: c1 }, { r: r1, c }, { r: r2, c }, { r: r2, c: c2 }];
        }
      }
    }

    // Scan vertical lines
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
    const item1 = this.grid[tile1.r][tile1.c];
    this.sfx.playMatch();

    this.score += 20 + this.combo * 5;
    this.combo++;
    this.pairsLeft--;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    // Draw Laser beam line on canvas
    this.drawLaserPath(path);

    if (window.speakText && item1) window.speakText(item1.word);

    // Clear grid positions
    this.grid[tile1.r][tile1.c] = null;
    this.grid[tile2.r][tile2.c] = null;
    this.selectedTile = null;

    setTimeout(() => {
      this.clearLaserPath();
      this.renderBoard();
      this.updateHUD();

      if (this.pairsLeft <= 0) {
        this.gameOver(true);
      }
    }, 280);
  }

  drawLaserPath(path) {
    const canvas = this.container.querySelector('#mahjong-line-canvas');
    const board = this.container.querySelector('#mahjong-tiles-grid');
    if (!canvas || !board || !path) return;

    const bRect = board.getBoundingClientRect();
    canvas.width = bRect.width;
    canvas.height = bRect.height;
    const ctx = canvas.getContext('2d');

    const cellW = bRect.width / (this.cols - 2);
    const cellH = bRect.height / (this.rows - 2);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    path.forEach((pt, idx) => {
      // Map coordinate from 0..rows-1 to inner bounds
      const x = (pt.c - 0.5) * cellW;
      const y = (pt.r - 0.5) * cellH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  clearLaserPath() {
    const canvas = this.container.querySelector('#mahjong-line-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  useHint() {
    if (this.hintCount <= 0) {
      this.showToast('Đã dùng hết Kính Lúp gợi ý!');
      return;
    }

    // Find any valid pair
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
              this.hintCount--;
              this.sfx.playPowerup();
              const el1 = this.container.querySelector(`#tile_${r1}_${c1}`);
              const el2 = this.container.querySelector(`#tile_${r2}_${c2}`);
              if (el1) el1.classList.add('hint-pulse');
              if (el2) el2.classList.add('hint-pulse');
              this.updateHUD();
              this.showToast('🔍 Đã tìm thấy 1 cặp có thể nối!');
              return;
            }
          }
        }
      }
    }
    this.showToast('Không còn cặp nối trực tiếp, hãy dùng Gió Lốc đảo bài!');
  }

  useShuffle() {
    if (this.shuffleCount <= 0) {
      this.showToast('Đã dùng hết Gió Lốc đảo bài!');
      return;
    }

    this.shuffleCount--;
    this.sfx.playPowerup();

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
          this.grid[r][c] = currentTiles.pop();
        }
      }
    }

    this.selectedTile = null;
    this.renderBoard();
    this.updateHUD();
    this.showToast('🌪️ Đã xáo trộn lại toàn bộ bàn cờ!');
  }

  useBomb() {
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

    const bHint = this.container.querySelector('#badge-hint');
    const bShuffle = this.container.querySelector('#badge-shuffle');
    const bBomb = this.container.querySelector('#badge-bomb');

    if (scoreVal) scoreVal.textContent = this.score;
    if (pairsVal) pairsVal.textContent = `${this.pairsLeft}/${this.totalPairs}`;

    if (timerVal) {
      const min = Math.floor(this.timeLeft / 60);
      const sec = this.timeLeft % 60;
      timerVal.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    if (bHint) bHint.textContent = `x${this.hintCount}`;
    if (bShuffle) bShuffle.textContent = `x${this.shuffleCount}`;
    if (bBomb) bBomb.textContent = `x${this.bombCount}`;
  }

  start() {
    this.isStopping = false;
    this.isRunning = true;
    this.isPaused = false;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeLeft = 90;
    this.hintCount = 3;
    this.shuffleCount = 3;
    this.bombCount = 2;
    this.selectedTile = null;

    const overlay = this.container.querySelector('#mahjong-modal-overlay');
    if (overlay) {
      overlay.style.setProperty('display', 'none', 'important');
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

      if (this.timeLeft <= 0) {
        this.gameOver(false);
      }
      this.updateHUD();
    }, 1000);
  }

  initBoard() {
    // Generate pairs of tiles: 6x6 board inside = 16 pairs (32 tiles total + 4 empty/bonus or 18 pairs = 36 tiles)
    const totalTiles = (this.rows - 2) * (this.cols - 2); // 4x4 inner = 16 tiles (8 pairs) or 6x6 inner = 18 pairs
    const pairsNeeded = totalTiles / 2;
    this.totalPairs = pairsNeeded;
    this.pairsLeft = pairsNeeded;

    const tilesList = [];
    for (let i = 0; i < pairsNeeded; i++) {
      const wordObj = this.rawWords[i % this.rawWords.length];
      const pairId = 'pair_' + i;

      // Tile 1: Hanzi
      tilesList.push({
        pairId: pairId,
        word: wordObj.word,
        text: wordObj.word,
        type: 'hanzi',
        pinyin: wordObj.pinyin,
        meaning: wordObj.meaning
      });

      // Tile 2: Alternates between Pinyin and Meaning
      if (i % 2 === 0) {
        tilesList.push({
          pairId: pairId,
          word: wordObj.word,
          text: wordObj.pinyin,
          type: 'pinyin',
          pinyin: wordObj.pinyin,
          meaning: wordObj.meaning
        });
      } else {
        tilesList.push({
          pairId: pairId,
          word: wordObj.word,
          text: wordObj.meaning,
          type: 'meaning',
          pinyin: wordObj.pinyin,
          meaning: wordObj.meaning
        });
      }
    }

    // Shuffle tiles
    tilesList.sort(() => 0.5 - Math.random());

    // Place into inner grid
    let idx = 0;
    this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));

    for (let r = 1; r < this.rows - 1; r++) {
      for (let c = 1; c < this.cols - 1; c++) {
        if (idx < tilesList.length) {
          this.grid[r][c] = {
            ...tilesList[idx],
            row: r,
            col: c,
            matched: false
          };
          idx++;
        }
      }
    }

    this.renderBoardDOM();
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
      if (icon) icon.textContent = isVictory ? '👑' : '⏰';
      if (title) title.textContent = isVictory ? 'Đại Sư Mạt Chược!' : 'Hết Giờ - Game Over!';
      if (desc) desc.textContent = isVictory ? 'Bạn đã xuất sắc nối sạch toàn bộ cặp bài trong thời gian quy định!' : 'Hãy tận dụng Kính Lúp và Gió Lốc để nối nhanh hơn nhé!';
      if (resScore) resScore.textContent = this.score;
      if (resCombo) resCombo.textContent = this.maxCombo;
      if (resPairs) resPairs.textContent = this.totalPairs - this.pairsLeft;

      const retryBtn = overlay.querySelector('#mahjong-retry-btn');
      const backHubBtn = overlay.querySelector('#mahjong-back-hub-btn');
      const finishBtn = overlay.querySelector('#mahjong-finish-btn');

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
