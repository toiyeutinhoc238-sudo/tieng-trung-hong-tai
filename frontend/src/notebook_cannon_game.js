/**
 * Tiếng Trung HongTai - Notebook Mini-Game 1: BẮN PHÁO TỪ VỰNG (Pinyin Cannon Defense)
 * Giai đoạn: Thử nghiệm nội bộ (Beta Super Admin)
 */

function normalizePinyin(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ü/g, 'v')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

class GameSoundFX {
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
    this.playTone(600, 'sawtooth', 0.12, 180);
  }
  playHit() {
    this.playTone(350, 'triangle', 0.18, 80);
  }
  playBomb() {
    this.playTone(120, 'square', 0.35, 40);
  }
  playSkill() {
    this.playTone(450, 'sine', 0.25, 900);
  }
  playHeal() {
    this.playTone(300, 'sine', 0.3, 600);
  }
  playWarning() {
    this.playTone(587, 'sine', 0.15, 880);
  }
  playUrgentTick() {
    this.playTone(950, 'triangle', 0.06, 1200);
  }
  playGameOver() {
    this.playTone(320, 'sawtooth', 0.35, 90);
  }
}

export class CannonGameEngine {
  constructor(containerEl, wordsList, onExitCallback) {
    this.container = containerEl;
    this.rawWords = wordsList && wordsList.length > 0 ? wordsList : [
      { word: '老师', pinyin: 'lǎoshī', meaning: 'giáo viên' },
      { word: '学生', pinyin: 'xuéshēng', meaning: 'học sinh' },
      { word: '学校', pinyin: 'xuéxiào', meaning: 'trường học' },
      { word: '电脑', pinyin: 'diànnǎo', meaning: 'máy tính' },
      { word: '图书馆', pinyin: 'túshūguǎn', meaning: 'thư viện' },
      { word: '苹果', pinyin: 'píngguǒ', meaning: 'quả táo' },
      { word: '香蕉', pinyin: 'xiāngjiāo', meaning: 'quả chuối' },
      { word: '西瓜', pinyin: 'xīguā', meaning: 'dưa hấu' }
    ];
    this.onExit = onExitCallback;
    this.sfx = new GameSoundFX();

    // Game State
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 3;
    this.maxLives = 3;
    this.timeLeft = 60;
    this.isRunning = false;
    this.isPaused = false;
    this.lastFrameTime = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 2.3;
    this.wordsDestroyedCount = 0;

    // Active Falling Words
    this.activeWords = [];

    // Buffs
    this.slowMoTimer = 0;
    this.score2xTimer = 0;
    this.shieldTimer = 0;
    this.hasShield = false;

    // Cannon Angle
    this.cannonAngle = 0;
    this.correctWordsSet = new Set();

    this.timerInterval = null;
    this.animFrameId = null;

    this.renderLayout();
    this.bindEvents();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="cannon-game-wrapper">
        <!-- TOP HUD -->
        <div class="cannon-hud-bar">
          <button id="cannon-top-back-btn" class="btn btn-outline btn-sm" style="display: flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 50px; background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #ffffff;">
            <i class="fa-solid fa-arrow-left"></i> Quay lại chọn game
          </button>

          <div class="hud-item hud-score">
            <i class="fa-solid fa-star" style="color: #fbbf24;"></i>
            <div class="hud-content">
              <span class="hud-label">ĐIỂM:</span>
              <span class="hud-value" id="cannon-score-val">0</span>
            </div>
          </div>

          <div class="hud-item hud-combo">
            <i class="fa-solid fa-fire" style="color: #f97316;"></i>
            <div class="hud-content">
              <span class="hud-label">COMBO:</span>
              <span class="hud-value" id="cannon-combo-val">0</span>
            </div>
            <div class="hud-combo-meter">
              <div class="hud-combo-fill" id="cannon-combo-fill" style="width: 0%;"></div>
            </div>
          </div>

          <div class="hud-item hud-lives">
            <span class="hud-label">MẠNG:</span>
            <div class="hud-hearts" id="cannon-lives-container">
              <i class="fa-solid fa-heart" style="color: #ef4444;"></i>
              <i class="fa-solid fa-heart" style="color: #ef4444;"></i>
              <i class="fa-solid fa-heart" style="color: #ef4444;"></i>
            </div>
          </div>

          <div class="hud-item hud-timer" title="Thời gian đếm ngược của màn chơi này">
            <i class="fa-solid fa-clock" style="color: #38bdf8;"></i>
            <span class="hud-label">THỜI GIAN:</span>
            <span class="hud-value" id="cannon-timer-val">01:00</span>
          </div>

          <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
            <button type="button" id="cannon-pause-btn" class="btn btn-outline btn-sm" title="Tạm dừng"><i class="fa-solid fa-pause"></i></button>
            <button type="button" id="cannon-back-hub-top-btn" class="btn btn-secondary btn-sm" title="Đổi trò chơi khác" style="display: flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 50px; padding: 6px 14px;">
              <i class="fa-solid fa-arrow-left"></i> Đổi Game
            </button>
            <button type="button" id="cannon-exit-btn" class="btn btn-outline btn-sm" title="Thoát về sổ tay"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>

        <!-- MAIN ARENA & SIDEBAR -->
        <div class="cannon-arena-layout">
          <!-- BATTLEFIELD -->
          <div class="cannon-playfield" id="cannon-playfield">
            <div id="cannon-buff-banner" class="cannon-buff-banner" style="display: none;"></div>
            
            <!-- FALLING WORDS CONTAINER -->
            <div id="cannon-words-layer" class="cannon-words-layer"></div>

            <!-- PROJECTILES & PARTICLES LAYER -->
            <div id="cannon-fx-layer" class="cannon-fx-layer"></div>

            <!-- CANNON AT BOTTOM -->
            <div class="cannon-station" id="cannon-station">
              <div class="cannon-body-wrap" id="cannon-barrel">
                <div class="cannon-barrel-graphic"></div>
              </div>
              <div class="cannon-base-graphic"></div>
            </div>

            <!-- INPUT BAR -->
            <div class="cannon-input-bar">
              <div class="cannon-input-wrap">
                <input type="text" id="cannon-pinyin-input" class="cannon-pinyin-input" placeholder="Nhập pinyin của chữ..." autocomplete="off" autofocus />
                <button type="button" id="cannon-fire-btn" class="cannon-fire-btn" title="Bắn nhanh"><i class="fa-solid fa-bullseye"></i> BẮN (Space)</button>
              </div>
              <div class="cannon-input-hint">
                Gõ đúng <strong>từ thường</strong> để ghi điểm. Tránh gõ <strong>từ chứa bom 💣</strong>!
              </div>
            </div>
          </div>

          <!-- RIGHT SIDEBAR: SKILL SHOP -->
          <div class="cannon-sidebar">
            <div class="cannon-shop-header">
              <div style="font-size: 0.95rem; font-weight: 800; color: #ef4444;">COMBO = TIỀN KỸ NĂNG</div>
              <div style="font-size: 0.78rem; color: #94a3b8;">Tích đủ combo để mở khóa kỹ năng</div>
            </div>

            <div class="cannon-shop-title">CỬA HÀNG KỸ NĂNG</div>

            <div class="cannon-skills-list">
              <!-- Skill 1: Mưa Băng -->
              <button type="button" class="cannon-skill-card" id="skill-ice" data-cost="10" title="Nhấn để kích hoạt (Phím 1)">
                <div class="skill-icon-box" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">
                  <i class="fa-solid fa-snowflake"></i>
                </div>
                <div class="skill-info">
                  <div class="skill-name">MƯA BĂNG</div>
                  <div class="skill-desc">Làm chậm tất cả từ rơi trong 6 giây</div>
                </div>
                <div class="skill-cost-badge">10 <small>COMBO</small></div>
              </button>

              <!-- Skill 2: Tim Hồi Sinh -->
              <button type="button" class="cannon-skill-card" id="skill-heal" data-cost="20" title="Nhấn để kích hoạt (Phím 2)">
                <div class="skill-icon-box" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
                  <i class="fa-solid fa-heart"></i>
                </div>
                <div class="skill-info">
                  <div class="skill-name">TIM HỒI SINH</div>
                  <div class="skill-desc">Hồi lại 1 mạng</div>
                </div>
                <div class="skill-cost-badge">20 <small>COMBO</small></div>
              </button>

              <!-- Skill 3: Nhân Điểm -->
              <button type="button" class="cannon-skill-card" id="skill-x2" data-cost="30" title="Nhấn để kích hoạt (Phím 3)">
                <div class="skill-icon-box" style="background: rgba(168, 85, 247, 0.15); color: #a855f7;">
                  <i class="fa-solid fa-star"></i>
                </div>
                <div class="skill-info">
                  <div class="skill-name">NHÂN ĐIỂM</div>
                  <div class="skill-desc">Nhân đôi điểm trong 8 giây</div>
                </div>
                <div class="skill-cost-badge">30 <small>COMBO</small></div>
              </button>

              <!-- Skill 4: Lá Chắn -->
              <button type="button" class="cannon-skill-card" id="skill-shield" data-cost="20" title="Nhấn để kích hoạt (Phím 4)">
                <div class="skill-icon-box" style="background: rgba(148, 163, 184, 0.15); color: #94a3b8;">
                  <i class="fa-solid fa-shield-halved"></i>
                </div>
                <div class="skill-info">
                  <div class="skill-name">LÁ CHẮN</div>
                  <div class="skill-desc">Bảo vệ bạn khỏi 1 lỗi trong 6 giây</div>
                </div>
                <div class="skill-cost-badge">20 <small>COMBO</small></div>
              </button>
            </div>

            <!-- Current Combo Tracker in Sidebar -->
            <div class="cannon-sidebar-combo-box">
              <i class="fa-solid fa-fire" style="color: #f97316; font-size: 1.6rem;"></i>
              <div>
                <div style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">COMBO HIỆN TẠI</div>
                <div id="cannon-sidebar-combo-num" style="font-size: 1.4rem; font-weight: 900; color: #f97316;">0</div>
              </div>
            </div>

            <!-- Mascot & Tips -->
            <div class="cannon-mascot-box">
              <div class="mascot-tip">
                <strong>💡 MẸO:</strong> Giữ chuỗi combo thật cao để mở khóa kỹ năng mạnh!
              </div>
              <div class="mascot-dragon-img">🐉</div>
            </div>
          </div>
        </div>

        <!-- FOOTER: LEGEND & INSTRUCTIONS -->
        <div class="cannon-footer-rules">
          <div class="rules-column">
            <div class="rules-title">LOẠI TỪ TRONG GAME</div>
            <div class="word-types-grid">
              <div class="word-type-item">
                <span class="type-badge-normal">🟢 TỪ THƯỜNG</span>
                <p>Gõ đúng để <strong>+10 điểm</strong> và tăng combo</p>
                <div class="demo-card demo-normal">老师</div>
              </div>

              <div class="word-type-item">
                <span class="type-badge-bomb">🔴 TỪ CHỨA BOM</span>
                <p><strong>Không gõ!</strong> Nếu gõ sẽ -10 điểm và mất combo</p>
                <div class="demo-card demo-bomb">💣 苹果</div>
              </div>

              <div class="word-type-item">
                <span class="type-badge-bonus">⭐ TỪ NHÂN ĐIỂM</span>
                <p>Gõ đúng để nhận <strong>+5 combo</strong></p>
                <div class="demo-card demo-bonus">⭐ 学校</div>
              </div>
            </div>
          </div>

          <div class="rules-column">
            <div class="rules-title">CÁCH CHƠI</div>
            <ol class="rules-list">
              <li>Từ vựng rơi từ trên xuống.</li>
              <li>Gõ pinyin vào ô bên dưới để bắn từ thường.</li>
              <li>Tránh gõ từ chứa bom.</li>
              <li>Tăng combo để mở khóa kỹ năng.</li>
              <li>Sống sót và đạt điểm cao nhất!</li>
            </ol>
          </div>
        </div>

        <!-- GAME OVER / VICTORY OVERLAY -->
        <div id="cannon-modal-overlay" class="cannon-modal-overlay" style="display: none;">
          <div class="cannon-result-card">
            <button type="button" id="cannon-modal-close-x" class="result-modal-close-btn" title="Đóng">&times;</button>
            <div id="cannon-result-icon" class="result-icon">🏆</div>
            <h2 id="cannon-result-title" class="result-title">Hoàn Thành Màn Chơi!</h2>
            <p id="cannon-result-desc" class="result-desc">Bạn đã xuất sắc hoàn thành thời gian sinh tồn!</p>
            
            <div class="result-stats-grid">
              <div class="stat-pill">
                <span class="label">Tổng Điểm</span>
                <span class="val" id="res-score">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Combo Cao Nhất</span>
                <span class="val" id="res-combo">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Từ Đã Bắn Trúng</span>
                <span class="val" id="res-words">0</span>
              </div>
            </div>

            <!-- BẢNG TỔNG KẾT TỪ VỰNG ĐÚNG / SAI -->
            <div id="cannon-words-summary-wrap"></div>

            <div class="result-beta-note">
              <i class="fa-solid fa-flask"></i> <strong>Chế độ luyện tập:</strong> Hãy tiếp tục trau dồi vốn từ vựng HSK của bạn!
            </div>

            <div class="cannon-result-card-actions">
              <button type="button" id="cannon-retry-btn" class="btn btn-primary"><i class="fa-solid fa-rotate-right"></i> Chơi Lại</button>
              <button type="button" id="cannon-back-hub-btn" class="btn btn-secondary"><i class="fa-solid fa-gamepad"></i> Đổi Trò Chơi</button>
              <button type="button" id="cannon-finish-btn" class="btn btn-outline"><i class="fa-solid fa-book-bookmark"></i> Quay Lại Sổ Tay</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const topBackBtn = this.container.querySelector('#cannon-top-back-btn');
    const backHubTopBtn = this.container.querySelector('#cannon-back-hub-top-btn');
    const inputEl = this.container.querySelector('#cannon-pinyin-input');
    const fireBtn = this.container.querySelector('#cannon-fire-btn');
    const pauseBtn = this.container.querySelector('#cannon-pause-btn');
    const exitBtn = this.container.querySelector('#cannon-exit-btn');
    const closeXBtn = this.container.querySelector('#cannon-modal-close-x');
    const retryBtn = this.container.querySelector('#cannon-retry-btn');
    const backHubBtn = this.container.querySelector('#cannon-back-hub-btn');
    const finishBtn = this.container.querySelector('#cannon-finish-btn');

    if (topBackBtn) {
      topBackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.stopAndExit();
      });
    }

    if (backHubTopBtn) {
      backHubTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.stopAndExit();
      });
    }

    if (closeXBtn) {
      closeXBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.stopAndExit();
        if (typeof window.exitNotebookGamesHub === 'function') {
          window.exitNotebookGamesHub();
        }
      });
    }

    if (inputEl) {
      inputEl.addEventListener('input', () => this.handleInput(inputEl.value));
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          this.attemptShoot(inputEl.value.trim());
        }
      });
    }

    if (fireBtn) {
      fireBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (inputEl) this.attemptShoot(inputEl.value.trim());
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

    // Skills buttons
    this.container.querySelectorAll('.cannon-skill-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.id;
        if (id === 'skill-ice') this.activateSkill('ice');
        else if (id === 'skill-heal') this.activateSkill('heal');
        else if (id === 'skill-x2') this.activateSkill('x2');
        else if (id === 'skill-shield') this.activateSkill('shield');
      });
    });

    // Keyboard shortcuts (1, 2, 3, 4 for skills)
    this.keyHandler = (e) => {
      if (!this.isRunning || this.isPaused) return;
      if (e.key === '1' && (e.altKey || e.ctrlKey)) { e.preventDefault(); this.activateSkill('ice'); }
      if (e.key === '2' && (e.altKey || e.ctrlKey)) { e.preventDefault(); this.activateSkill('heal'); }
      if (e.key === '3' && (e.altKey || e.ctrlKey)) { e.preventDefault(); this.activateSkill('x2'); }
      if (e.key === '4' && (e.altKey || e.ctrlKey)) { e.preventDefault(); this.activateSkill('shield'); }
    };
    window.addEventListener('keydown', this.keyHandler);
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
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 3;
    this.timeLeft = 60;
    this.activeWords = [];
    this.wordsDestroyedCount = 0;
    this.lastFrameTime = performance.now();
    this.spawnTimer = 0;

    this.slowMoTimer = 0;
    this.score2xTimer = 0;
    this.shieldTimer = 0;
    this.hasShield = false;

    const overlay = this.container.querySelector('#cannon-modal-overlay');
    if (overlay) {
      overlay.style.setProperty('display', 'none', 'important');
    }
    const wordsLayer = this.container.querySelector('#cannon-words-layer');
    if (wordsLayer) wordsLayer.innerHTML = '';
    const fxLayer = this.container.querySelector('#cannon-fx-layer');
    if (fxLayer) fxLayer.innerHTML = '';
    const inputEl = this.container.querySelector('#cannon-pinyin-input');
    if (inputEl) {
      inputEl.value = '';
      setTimeout(() => inputEl.focus(), 60);
    }

    this.updateHUD();
    this.startTimers();
    this.loop(performance.now());
  }

  startTimers() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.isRunning || this.isPaused) return;
      this.timeLeft--;

      if (this.slowMoTimer > 0) this.slowMoTimer--;
      if (this.score2xTimer > 0) this.score2xTimer--;
      if (this.shieldTimer > 0) {
        this.shieldTimer--;
        if (this.shieldTimer === 0) this.hasShield = false;
      }
      this.updateBuffBanner();
      this.handleTimeCountdownAlert(this.timeLeft);

      if (this.timeLeft <= 0) {
        this.gameOver(true);
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
      const playfield = this.container.querySelector('#cannon-playfield') || this.container;
      playfield.appendChild(tickEl);
    }
    tickEl.textContent = num;
    tickEl.classList.remove('tick-anim');
    void tickEl.offsetWidth;
    tickEl.classList.add('tick-anim');
  }

  updateBuffBanner() {
    const banner = this.container.querySelector('#cannon-buff-banner');
    if (!banner) return;
    const buffs = [];
    if (this.slowMoTimer > 0) buffs.push(`❄️ Mưa Băng (${this.slowMoTimer}s)`);
    if (this.score2xTimer > 0) buffs.push(`⭐ Nhân Đôi Điểm (${this.score2xTimer}s)`);
    if (this.shieldTimer > 0) buffs.push(`🛡️ Khiên Bảo Vệ (${this.shieldTimer}s)`);

    if (buffs.length > 0) {
      banner.style.display = 'block';
      banner.innerHTML = buffs.join(' &nbsp;|&nbsp; ');
    } else {
      banner.style.display = 'none';
    }
  }

  spawnWord() {
    if (this.activeWords.length >= 7) return;
    const playfield = this.container.querySelector('#cannon-playfield');
    if (!playfield) return;
    const rect = playfield.getBoundingClientRect();
    const maxWidth = Math.max(240, rect.width - 150);

    const randomWordObj = this.rawWords[Math.floor(Math.random() * this.rawWords.length)];
    if (!randomWordObj) return;

    const randType = Math.random();
    let type = 'normal';
    if (randType < 0.20) type = 'bomb';
    else if (randType < 0.35) type = 'bonus';

    const wordId = 'word_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const xPos = 15 + Math.random() * maxWidth;
    const yPos = -35;
    const speed = (28 + Math.random() * 22) * (1 + (60 - this.timeLeft) * 0.008);

    const wordItem = {
      id: wordId,
      word: randomWordObj.word,
      pinyin: randomWordObj.pinyin,
      normPinyin: normalizePinyin(randomWordObj.pinyin),
      meaning: randomWordObj.meaning,
      type: type,
      x: xPos,
      y: yPos,
      speed: speed,
      el: null
    };

    const layer = this.container.querySelector('#cannon-words-layer');
    if (layer) {
      const el = document.createElement('div');
      el.id = wordId;
      el.className = `cannon-word-card type-${type}`;
      el.style.left = `${xPos}px`;
      el.style.top = `${yPos}px`;

      let iconHtml = '';
      if (type === 'bomb') iconHtml = '<span class="word-icon">💣</span>';
      else if (type === 'bonus') iconHtml = '<span class="word-icon">⭐</span>';

      el.innerHTML = `
        <div class="word-zh">${iconHtml} ${randomWordObj.word}</div>
        <div class="word-dash-line"></div>
      `;

      // Click on word card to speak pronunciation and focus input (do NOT auto-shoot)
      el.addEventListener('click', () => {
        if (window.speakText) window.speakText(randomWordObj.word);
        const inp = this.container.querySelector('#cannon-pinyin-input');
        if (inp) inp.focus();
      });

      layer.appendChild(el);
      wordItem.el = el;
    }

    this.activeWords.push(wordItem);
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

    this.spawnTimer += dt;
    const effectiveInterval = this.slowMoTimer > 0 ? this.spawnInterval * 1.8 : this.spawnInterval;
    if (this.spawnTimer >= effectiveInterval) {
      this.spawnTimer = 0;
      this.spawnWord();
    }

    const playfield = this.container.querySelector('#cannon-playfield');
    const bottomLimit = playfield ? playfield.clientHeight - 130 : 500;
    const speedMod = this.slowMoTimer > 0 ? 0.45 : 1.0;

    for (let i = this.activeWords.length - 1; i >= 0; i--) {
      const item = this.activeWords[i];
      item.y += item.speed * speedMod * dt;

      if (item.el) {
        item.el.style.top = `${item.y}px`;
      }

      if (item.y >= bottomLimit) {
        if (item.type === 'normal' || item.type === 'bonus') {
          if (!this.hasShield) {
            this.lives--;
            this.combo = 0;
            this.sfx.playBomb();
          } else {
            this.hasShield = false;
            this.shieldTimer = 0;
            this.showFloatingText(item.x, item.y, 'Lá Chắn Đã Chặn! 🛡️', '#38bdf8');
          }
          if (this.lives <= 0) {
            this.destroyWordByIndex(i, false);
            this.gameOver(false);
            return;
          }
        }
        this.destroyWordByIndex(i, false);
        this.updateHUD();
      }
    }

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  handleInput(val) {
    const norm = normalizePinyin(val);
    if (!norm) return;

    const target = this.activeWords.find(w => w.normPinyin === norm);
    if (target) {
      this.aimCannonAt(target.x, target.y);
    }
  }

  aimCannonAt(targetX, targetY) {
    const cannonEl = this.container.querySelector('#cannon-barrel');
    const playfield = this.container.querySelector('#cannon-playfield');
    if (!cannonEl || !playfield) return;

    const pfRect = playfield.getBoundingClientRect();
    const cannonX = pfRect.width / 2;
    const cannonY = pfRect.height - 70;

    const dx = targetX - cannonX;
    const dy = targetY - cannonY;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180 / Math.PI) + 90;

    this.cannonAngle = angleDeg;
    cannonEl.style.transform = `rotate(${angleDeg}deg)`;
  }

  attemptShoot(inputVal) {
    const raw = (inputVal || '').trim();
    const norm = normalizePinyin(raw);
    const inputEl = this.container.querySelector('#cannon-pinyin-input');
    if (!raw) return;

    // Find lowest matching word by pinyin OR by exact hanzi character
    const eligibleWords = this.activeWords
      .filter(w => !w.isDestroyed && !w.isTargeted && ((norm && w.normPinyin === norm) || w.word === raw))
      .sort((a, b) => b.y - a.y);

    if (eligibleWords.length > 0) {
      const target = eligibleWords[0];
      target.isTargeted = true;

      this.aimCannonAt(target.x, target.y);
      this.fireProjectile(target.x, target.y, () => {
        this.handleHitWord(target);
      });
      if (inputEl) inputEl.value = '';
    } else {
      this.sfx.playTone(180, 'sine', 0.08);
    }
  }

  fireProjectile(targetX, targetY, onImpact) {
    this.sfx.playShoot();
    const fxLayer = this.container.querySelector('#cannon-fx-layer');
    const playfield = this.container.querySelector('#cannon-playfield');
    if (!fxLayer || !playfield) {
      if (onImpact) onImpact();
      return;
    }

    const startX = playfield.clientWidth / 2;
    const startY = playfield.clientHeight - 70;

    const bullet = document.createElement('div');
    bullet.className = 'cannon-bullet';
    bullet.style.left = `${startX}px`;
    bullet.style.top = `${startY}px`;
    fxLayer.appendChild(bullet);

    const startTime = performance.now();
    const duration = 120;

    const animateBullet = (now) => {
      const p = Math.min(1, (now - startTime) / duration);
      const curX = startX + (targetX + 40 - startX) * p;
      const curY = startY + (targetY + 20 - startY) * p;
      bullet.style.left = `${curX}px`;
      bullet.style.top = `${curY}px`;

      if (p < 1) {
        requestAnimationFrame(animateBullet);
      } else {
        bullet.remove();
        if (onImpact) onImpact();
      }
    };
    requestAnimationFrame(animateBullet);
  }

  handleHitWord(targetItem) {
    if (!targetItem || targetItem.isDestroyed) return;
    targetItem.isDestroyed = true;

    const idx = this.activeWords.findIndex(w => w.id === targetItem.id);
    if (idx === -1) return;

    if (targetItem.type === 'normal') {
      this.sfx.playHit();
      const mult = this.score2xTimer > 0 ? 2 : 1;
      const pts = 10 * mult;
      this.score += pts;
      this.combo++;
      this.wordsDestroyedCount = (this.wordsDestroyedCount || 0) + 1;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;

      if (targetItem.word) this.correctWordsSet.add(targetItem.word);
      this.showFloatingText(targetItem.x, targetItem.y, `+${pts}`, '#10b981');
      if (window.speakText) window.speakText(targetItem.word);
    } else if (targetItem.type === 'bonus') {
      this.sfx.playHit();
      const mult = this.score2xTimer > 0 ? 2 : 1;
      const pts = 25 * mult;
      this.score += pts;
      this.combo += 5;
      this.wordsDestroyedCount = (this.wordsDestroyedCount || 0) + 1;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;

      if (targetItem.word) this.correctWordsSet.add(targetItem.word);
      this.showFloatingText(targetItem.x, targetItem.y, `⭐ +${pts} (+5 Combo)`, '#fbbf24');
      if (window.speakText) window.speakText(targetItem.word);
    } else if (targetItem.type === 'bomb') {
      this.sfx.playBomb();
      if (!this.hasShield) {
        this.score = Math.max(0, this.score - 10);
        this.combo = 0;
        this.showFloatingText(targetItem.x, targetItem.y, `💣 NỔ BOM! -10 (Mất Combo)`, '#ef4444');
      } else {
        this.hasShield = false;
        this.shieldTimer = 0;
        this.showFloatingText(targetItem.x, targetItem.y, `🛡️ Lá Chắn Đã Hút Bom!`, '#38bdf8');
      }
    }

    this.createExplosion(targetItem.x + 40, targetItem.y + 20, targetItem.type);
    this.destroyWordByIndex(idx, true);
    this.updateHUD();
  }

  showFloatingText(x, y, text, color) {
    const fxLayer = this.container.querySelector('#cannon-fx-layer');
    if (!fxLayer) return;
    const el = document.createElement('div');
    el.className = 'cannon-floating-text';
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = color;
    fxLayer.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  createExplosion(x, y, type) {
    const fxLayer = this.container.querySelector('#cannon-fx-layer');
    if (!fxLayer) return;
    const boom = document.createElement('div');
    boom.className = `cannon-explosion exp-${type}`;
    boom.style.left = `${x - 30}px`;
    boom.style.top = `${y - 30}px`;
    fxLayer.appendChild(boom);
    setTimeout(() => boom.remove(), 500);
  }

  destroyWordByIndex(idx, animated = true) {
    const item = this.activeWords[idx];
    if (item && item.el) {
      item.el.remove();
    }
    this.activeWords.splice(idx, 1);
  }

  activateSkill(skillKey) {
    const costs = { ice: 10, heal: 20, x2: 30, shield: 20 };
    const cost = costs[skillKey] || 999;

    if (this.combo < cost) {
      this.sfx.playTone(150, 'square', 0.1);
      this.showToast(`Cần ${cost} Combo để mở khóa kỹ năng này (Hiện có: ${this.combo} Combo)!`);
      return;
    }

    this.combo -= cost;
    this.sfx.playSkill();

    if (skillKey === 'ice') {
      this.slowMoTimer = 6;
      this.showToast('❄️ MƯA BĂNG: Đã làm chậm tất cả từ rơi trong 6s!');
    } else if (skillKey === 'heal') {
      if (this.lives < this.maxLives) {
        this.lives++;
        this.sfx.playHeal();
        this.showToast('💚 Đã hồi phục 1 Mạng!');
      } else {
        this.showToast('💚 Mạng của bạn đã đầy (3/3)!');
      }
    } else if (skillKey === 'x2') {
      this.score2xTimer = 8;
      this.showToast('⭐ NHÂN ĐÔI ĐIỂM: Điểm x2 trong 8 giây!');
    } else if (skillKey === 'shield') {
      this.hasShield = true;
      this.shieldTimer = 6;
      this.showToast('🛡️ LÁ CHẮN: Bảo vệ khỏi 1 lỗi trong 6 giây!');
    }

    this.updateBuffBanner();
    this.updateHUD();
  }

  updateHUD() {
    const scoreVal = this.container.querySelector('#cannon-score-val');
    const comboVal = this.container.querySelector('#cannon-combo-val');
    const sidebarComboVal = this.container.querySelector('#cannon-sidebar-combo-num');
    const comboFill = this.container.querySelector('#cannon-combo-fill');
    const livesContainer = this.container.querySelector('#cannon-lives-container');
    const timerVal = this.container.querySelector('#cannon-timer-val');

    if (scoreVal) scoreVal.textContent = this.score;
    if (comboVal) comboVal.textContent = this.combo;
    if (sidebarComboVal) sidebarComboVal.textContent = this.combo;

    if (comboFill) {
      const pct = Math.min(100, (this.combo / 30) * 100);
      comboFill.style.width = `${pct}%`;
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

    if (timerVal) {
      const min = Math.floor(this.timeLeft / 60);
      const sec = this.timeLeft % 60;
      timerVal.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    this.container.querySelectorAll('.cannon-skill-card').forEach(btn => {
      const cost = parseInt(btn.dataset.cost, 10) || 0;
      btn.classList.toggle('affordable', this.combo >= cost);
    });
  }

  showToast(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseBtn = this.container.querySelector('#cannon-pause-btn');
    if (pauseBtn) {
      pauseBtn.innerHTML = `<i class="fa-solid fa-${this.isPaused ? 'play' : 'pause'}"></i>`;
    }
    this.showToast(this.isPaused ? 'Đã tạm dừng game ⏸' : 'Tiếp tục chơi ▶️');
  }

  start() {
    this.isStopping = false;
    this.isRunning = true;
    this.isPaused = false;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 3;
    this.timeLeft = 60;
    this.activeWords = [];
    this.wordsDestroyedCount = 0;
    this.totalWordsCount = (this.rawWords || []).length;
    this.wordQueue = [...(this.rawWords || [])].sort(() => Math.random() - 0.5);
    this.lastFrameTime = performance.now();
    this.spawnTimer = 0;

    const overlay = this.container.querySelector('#cannon-modal-overlay');
    if (overlay) {
      overlay.style.setProperty('display', 'none', 'important');
    }

    this.updateHUD();
    this.startTimers();
    this.loop(performance.now());
  }

  startTimers() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.isRunning || this.isPaused) return;
      this.timeLeft--;

      if (this.slowMoTimer > 0) this.slowMoTimer--;
      if (this.score2xTimer > 0) this.score2xTimer--;
      if (this.shieldTimer > 0) {
        this.shieldTimer--;
        if (this.shieldTimer === 0) this.hasShield = false;
      }
      this.updateBuffBanner();

      if (this.timeLeft <= 0) {
        this.gameOver(true);
      }
      this.updateHUD();
    }, 1000);
  }

  updateBuffBanner() {
    const banner = this.container.querySelector('#cannon-buff-banner');
    if (!banner) return;
    const buffs = [];
    if (this.slowMoTimer > 0) buffs.push(`❄️ Mưa Băng (${this.slowMoTimer}s)`);
    if (this.score2xTimer > 0) buffs.push(`⭐ Nhân Đôi Điểm (${this.score2xTimer}s)`);
    if (this.shieldTimer > 0) buffs.push(`🛡️ Khiên Bảo Vệ (${this.shieldTimer}s)`);

    if (buffs.length > 0) {
      banner.style.display = 'block';
      banner.innerHTML = buffs.join(' &nbsp;|&nbsp; ');
    } else {
      banner.style.display = 'none';
    }
  }

  spawnWord() {
    if (this.activeWords.length >= 7) return;
    const playfield = this.container.querySelector('#cannon-playfield');
    if (!playfield) return;
    const rect = playfield.getBoundingClientRect();
    const width = rect.width || 600;

    if (!this.wordQueue || this.wordQueue.length === 0) {
      if (this.activeWords.length === 0) {
        this.gameOver(true);
      }
      return;
    }

    // Pick next unique word from queue
    const randomWordObj = this.wordQueue.pop();
    if (!randomWordObj) return;

    const wordTypeRoll = Math.random();
    let type = 'normal';
    if (wordTypeRoll < 0.18) type = 'bomb';
    else if (wordTypeRoll < 0.32) type = 'bonus';

    const wordEl = document.createElement('div');
    wordEl.className = `cannon-word-card ${type}`;
    const pyDisplay = randomWordObj.pinyin ? `<span class="word-py">${randomWordObj.pinyin}</span>` : '';
    const meaningDisplay = randomWordObj.meaning ? `<span class="word-mn">${randomWordObj.meaning}</span>` : '';
    const bombIcon = type === 'bomb' ? '<span class="bomb-badge">💣</span> ' : '';
    const bonusIcon = type === 'bonus' ? '<span class="bonus-badge">⭐</span> ' : '';

    wordEl.innerHTML = `
      <div class="word-zh">${bombIcon}${bonusIcon}${randomWordObj.word}</div>
      ${pyDisplay}
      ${meaningDisplay}
    `;

    const margin = 30;
    const spawnX = margin + Math.random() * (width - margin * 2 - 120);
    const spawnY = -20;

    const baseSpeed = 45 + (60 - this.timeLeft) * 0.8; // Accelerate as time elapses
    const speed = baseSpeed * (0.85 + Math.random() * 0.35);

    const wordItem = {
      id: Date.now() + Math.random(),
      wordObj: randomWordObj,
      type: type,
      x: spawnX,
      y: spawnY,
      speed: speed,
      el: wordEl
    };

    const wordsLayer = this.container.querySelector('#cannon-words-layer');
    if (wordsLayer) {
      wordsLayer.appendChild(wordEl);
      this.activeWords.push(wordItem);
      this.updateWordElementPosition(wordItem);
    }
  }

  updateWordElementPosition(item) {
    if (item.el) {
      item.el.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
    }
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    if (!this.isPaused) {
      const dt = (currentTime - this.lastFrameTime) / 1000;
      this.lastFrameTime = currentTime;

      // Spawning timer
      this.spawnTimer += dt * 1000;
      const spawnInterval = Math.max(1200, 2500 - (60 - this.timeLeft) * 25);
      if (this.spawnTimer >= spawnInterval) {
        this.spawnTimer = 0;
        this.spawnWord();
      }

      // Update falling words
      const playfield = this.container.querySelector('#cannon-playfield');
      const groundY = playfield ? playfield.clientHeight - 80 : 440;
      const wordsLayer = this.container.querySelector('#cannon-words-layer');

      for (let i = this.activeWords.length - 1; i >= 0; i--) {
        const item = this.activeWords[i];
        const effectiveSpeed = this.slowMoTimer > 0 ? item.speed * 0.45 : item.speed;
        item.y += effectiveSpeed * dt;
        this.updateWordElementPosition(item);

        // Check if word hits bottom
        if (item.y >= groundY) {
          if (item.el && item.el.parentNode) {
            item.el.parentNode.removeChild(item.el);
          }
          this.activeWords.splice(i, 1);

          if (item.type === 'normal' || item.type === 'bonus') {
            // Player loses a life unless shield active
            if (this.hasShield) {
              this.showFloatingText(item.x, groundY, '🛡️ ĐÃ CHẶN!', '#38bdf8');
            } else {
              this.lives--;
              this.combo = 0;
              this.playExplosionEffect(item.x, groundY, '#ef4444');
              this.shakePlayfield();
              if (this.lives <= 0) {
                this.gameOver(false);
                return;
              }
            }
          } else if (item.type === 'bomb') {
            // Bomb safely expired without penalty
            this.showFloatingText(item.x, groundY, '💣 AN TOÀN!', '#94a3b8');
          }

          if (this.wordQueue.length === 0 && this.activeWords.length === 0) {
            this.gameOver(true);
            return;
          }
          this.updateHUD();
        }
      }
    } else {
      this.lastFrameTime = currentTime;
    }

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  gameOver(isVictory) {
    this.isRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const overlay = this.container.querySelector('#cannon-modal-overlay');
    const icon = this.container.querySelector('#cannon-result-icon');
    const title = this.container.querySelector('#cannon-result-title');
    const desc = this.container.querySelector('#cannon-result-desc');
    const resScore = this.container.querySelector('#res-score');
    const resCombo = this.container.querySelector('#res-combo');
    const resWords = this.container.querySelector('#res-words');

    if (overlay) {
      overlay.style.setProperty('display', 'flex', 'important');
      if (isVictory) {
        if (this.sfx && this.sfx.playSkill) this.sfx.playSkill();
      } else {
        if (this.sfx && this.sfx.playGameOver) this.sfx.playGameOver();
      }

      if (icon) icon.textContent = isVictory ? '🏆' : '💥';
      if (title) title.textContent = isVictory ? 'Chiến Thắng Xuất Sắc!' : 'Hết Mạng - Game Over!';
      if (desc) desc.textContent = isVictory ? `Bạn đã hoàn thành xuất sắc toàn bộ ${this.wordsDestroyedCount || this.totalWordsCount}/${this.totalWordsCount} từ vựng!` : 'Đừng nản lòng! Hãy gõ pinyin thật nhanh và né bom nhé.';
      if (resScore) resScore.textContent = this.score;
      if (resCombo) resCombo.textContent = this.maxCombo;
      if (resWords) resWords.textContent = `${this.wordsDestroyedCount || 0}/${this.totalWordsCount || 0}`;

      // Render danh sách từ vựng Đúng / Sai
      const summaryWrap = overlay.querySelector('#cannon-words-summary-wrap');
      if (summaryWrap) {
        this.renderWordSummaryList(summaryWrap, this.rawWords, this.correctWordsSet);
      }

      const closeXBtn = overlay.querySelector('#cannon-modal-close-x');
      const retryBtn = overlay.querySelector('#cannon-retry-btn');
      const backHubBtn = overlay.querySelector('#cannon-back-hub-btn');
      const finishBtn = overlay.querySelector('#cannon-finish-btn');

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
    const overlay = this.container.querySelector('#cannon-modal-overlay');
    if (overlay) {
      overlay.style.setProperty('display', 'none', 'important');
    }
    const wordsLayer = this.container.querySelector('#cannon-words-layer');
    if (wordsLayer) wordsLayer.innerHTML = '';
    const fxLayer = this.container.querySelector('#cannon-fx-layer');
    if (fxLayer) fxLayer.innerHTML = '';

    this.start();
    const inputEl = this.container.querySelector('#cannon-pinyin-input');
    if (inputEl) {
      inputEl.value = '';
      inputEl.focus();
    }
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
    const wordsLayer = this.container.querySelector('#cannon-words-layer');
    if (wordsLayer) wordsLayer.innerHTML = '';
    const fxLayer = this.container.querySelector('#cannon-fx-layer');
    if (fxLayer) fxLayer.innerHTML = '';
    const cb = this.onExit;
    this.onExit = null;
    if (typeof cb === 'function') {
      cb();
    }
  }
}
