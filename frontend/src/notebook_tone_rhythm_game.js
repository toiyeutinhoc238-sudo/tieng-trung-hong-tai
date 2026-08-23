/**
 * Tiếng Trung HongTai - Notebook Mini-Game 5: PHÍM ĐÀN TIẾT TẤU THANH ĐIỆU (Tone Rhythm Master)
 * Giai đoạn: Thử nghiệm nội bộ (Beta Super Admin)
 */

function extractToneFromPinyin(pinyinStr) {
  if (!pinyinStr) return 1;
  const str = pinyinStr.toLowerCase();
  
  // Tone 1: ā ē ī ō ū ǖ
  if (/[āēīōūǖ]/.test(str)) return 1;
  // Tone 2: á é í ó ú ǘ
  if (/[áéíóúǘ]/.test(str)) return 2;
  // Tone 3: ǎ ě ǐ ǒ ǔ ǚ
  if (/[ǎěǐǒǔǚ]/.test(str)) return 3;
  // Tone 4: à è ì ò ù ǜ
  if (/[àèìòùǜ]/.test(str)) return 4;

  // Check number at end if numerical pinyin (e.g. ma1, ma2)
  const match = str.match(/([1-4])$/);
  if (match) return parseInt(match[1], 10);

  return 1;
}

class RhythmSoundFX {
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
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }
  playHit(lane) {
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    this.playTone(freqs[lane - 1] || 523.25, 'triangle', 0.12);
  }
  playPerfect() {
    this.playTone(880, 'sine', 0.15, 1320);
  }
  playMiss() {
    this.playTone(160, 'sawtooth', 0.25, 80);
  }
}

export class ToneRhythmGameEngine {
  constructor(containerEl, wordsList, onExitCallback) {
    this.container = containerEl;
    this.rawWords = wordsList && wordsList.length >= 4 ? wordsList : [
      { word: '妈', pinyin: 'mā', meaning: 'mẹ' },
      { word: '麻', pinyin: 'má', meaning: 'cây gai, tê' },
      { word: '马', pinyin: 'mǎ', meaning: 'con ngựa' },
      { word: '骂', pinyin: 'mà', meaning: 'mắng chửi' },
      { word: '八', pinyin: 'bā', meaning: 'số 8' },
      { word: '拔', pinyin: 'bá', meaning: 'nhổ lên' },
      { word: '把', pinyin: 'bǎ', meaning: 'nắm, cầm' },
      { word: '爸', pinyin: 'bà', meaning: 'bố' }
    ];
    this.onExit = onExitCallback;
    this.sfx = new RhythmSoundFX();

    // Game Core State
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 3;
    this.maxLives = 3;
    this.timeLeft = 60;
    this.isPaused = false;
    this.isRunning = false;

    this.notesHitCount = 0;
    this.activeNotes = []; // array of falling notes
    this.spawnTimer = 0;
    this.spawnInterval = 1.6;
    this.lastFrameTime = 0;

    this.timerInterval = null;
    this.animFrameId = null;

    this.renderLayout();
    this.bindEvents();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="rhythm-game-wrapper">
        <!-- TOP HUD -->
        <div class="cannon-hud-bar">
          <button type="button" id="rhythm-top-back-btn" class="btn btn-outline btn-sm" style="display: flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 50px;">
            <i class="fa-solid fa-arrow-left"></i> Quay lại chọn game
          </button>

          <div class="hud-item-title">
            <span style="font-size: 1.4rem;">🎵</span>
            <strong style="color: #ec4899;">PHÍM ĐÀN THANH ĐIỆU</strong>
          </div>

          <div class="hud-item hud-score">
            <i class="fa-solid fa-star" style="color: #fbbf24;"></i>
            <span class="hud-label">ĐIỂM:</span>
            <span class="hud-value" id="rhythm-score-val">0</span>
          </div>

          <div class="hud-item hud-combo">
            <i class="fa-solid fa-fire" style="color: #f97316;"></i>
            <span class="hud-label">COMBO:</span>
            <span class="hud-value" id="rhythm-combo-val">0</span>
          </div>

          <div class="hud-item hud-lives">
            <span class="hud-label">TIM:</span>
            <div class="hud-hearts" id="rhythm-lives-container">
              <i class="fa-solid fa-heart" style="color: #ef4444;"></i>
              <i class="fa-solid fa-heart" style="color: #ef4444;"></i>
              <i class="fa-solid fa-heart" style="color: #ef4444;"></i>
            </div>
          </div>

          <div class="hud-item hud-timer">
            <i class="fa-solid fa-clock" style="color: #38bdf8;"></i>
            <span class="hud-value" id="rhythm-timer-val">01:00</span>
          </div>

          <div style="margin-left: auto; display: flex; gap: 8px;">
            <button type="button" id="rhythm-pause-btn" class="btn btn-outline btn-sm" title="Tạm dừng"><i class="fa-solid fa-pause"></i></button>
            <button type="button" id="rhythm-exit-btn" class="btn btn-outline btn-sm" title="Thoát về sổ tay"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>

        <!-- MAIN HIGHWAY TRACK -->
        <div class="rhythm-arena-container">
          <!-- FEVER METER -->
          <div class="rhythm-fever-banner" id="rhythm-fever-banner" style="display: none;">
            🔥 FEVER MODE x4 SCORE! 🔥
          </div>

          <!-- 4 LANES TRACK -->
          <div class="rhythm-highway" id="rhythm-highway">
            <!-- FALLING NOTES LAYER -->
            <div class="rhythm-notes-layer" id="rhythm-notes-layer"></div>

            <!-- JUDGMENT / HIT ZONE LINE -->
            <div class="rhythm-hit-zone" id="rhythm-hit-zone">
              <div class="hit-indicator hit-lane-1"></div>
              <div class="hit-indicator hit-lane-2"></div>
              <div class="hit-indicator hit-lane-3"></div>
              <div class="hit-indicator hit-lane-4"></div>
            </div>

            <!-- 4 HIT BUTTON PADS AT BOTTOM -->
            <div class="rhythm-pads-row">
              <!-- Lane 1: Tone 1 -->
              <button type="button" class="rhythm-pad pad-1" data-lane="1" id="pad-1">
                <span class="pad-symbol">—</span>
                <span class="pad-title">THANH 1</span>
                <span class="pad-key">Phím D / 1</span>
              </button>

              <!-- Lane 2: Tone 2 -->
              <button type="button" class="rhythm-pad pad-2" data-lane="2" id="pad-2">
                <span class="pad-symbol">／</span>
                <span class="pad-title">THANH 2</span>
                <span class="pad-key">Phím F / 2</span>
              </button>

              <!-- Lane 3: Tone 3 -->
              <button type="button" class="rhythm-pad pad-3" data-lane="3" id="pad-3">
                <span class="pad-symbol">∨</span>
                <span class="pad-title">THANH 3</span>
                <span class="pad-key">Phím J / 3</span>
              </button>

              <!-- Lane 4: Tone 4 -->
              <button type="button" class="rhythm-pad pad-4" data-lane="4" id="pad-4">
                <span class="pad-symbol">＼</span>
                <span class="pad-title">THANH 4</span>
                <span class="pad-key">Phím K / 4</span>
              </button>
            </div>
          </div>
        </div>

        <!-- MODAL OVERLAY -->
        <div id="rhythm-modal-overlay" class="cannon-modal-overlay" style="display: none;">
          <div class="cannon-result-card">
            <div id="rhythm-result-icon" class="result-icon">🎵</div>
            <h2 id="rhythm-result-title" class="result-title">Hoàn Thành Bản Nhạc!</h2>
            <p id="rhythm-result-desc" class="result-desc">Bạn đã xuất sắc bắt trọn các thanh điệu theo nhịp điệu!</p>
            
            <div class="result-stats-grid">
              <div class="stat-pill">
                <span class="label">Tổng Điểm</span>
                <span class="val" id="rhythm-res-score">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Combo Cao Nhất</span>
                <span class="val" id="rhythm-res-combo">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Số Nốt Trúng</span>
                <span class="val" id="rhythm-res-notes">0</span>
              </div>
            </div>

            <div class="result-beta-note">
              <i class="fa-solid fa-flask"></i> <strong>Chế độ thử nghiệm:</strong> Điểm số và thành tích không lưu vào hồ sơ trong giai đoạn Beta Super Admin.
            </div>

            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
              <button type="button" id="rhythm-retry-btn" class="btn btn-primary" style="padding: 10px 20px; font-weight: 800;"><i class="fa-solid fa-rotate-right"></i> Chơi Lại</button>
              <button type="button" id="rhythm-back-hub-btn" class="btn btn-secondary" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-gamepad"></i> Đổi Trò Chơi</button>
              <button type="button" id="rhythm-finish-btn" class="btn btn-outline" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-book-bookmark"></i> Quay Lại Sổ Tay</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const topBackBtn = this.container.querySelector('#rhythm-top-back-btn');
    const pauseBtn = this.container.querySelector('#rhythm-pause-btn');
    const exitBtn = this.container.querySelector('#rhythm-exit-btn');
    const retryBtn = this.container.querySelector('#rhythm-retry-btn');
    const backHubBtn = this.container.querySelector('#rhythm-back-hub-btn');
    const finishBtn = this.container.querySelector('#rhythm-finish-btn');

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

    // Touch and click on lane pads
    this.container.querySelectorAll('.rhythm-pad').forEach(pad => {
      const lane = parseInt(pad.dataset.lane, 10);
      pad.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.triggerLaneHit(lane);
      }, { passive: false });

      pad.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.triggerLaneHit(lane);
      });
    });

    // Keyboard handlers (D=1, F=2, J=3, K=4 or 1, 2, 3, 4)
    this.keyHandler = (e) => {
      if (!this.isRunning || this.isPaused) return;
      const key = e.key.toLowerCase();
      if (key === 'd' || key === '1') { this.triggerLaneHit(1); e.preventDefault(); }
      else if (key === 'f' || key === '2') { this.triggerLaneHit(2); e.preventDefault(); }
      else if (key === 'j' || key === '3') { this.triggerLaneHit(3); e.preventDefault(); }
      else if (key === 'k' || key === '4') { this.triggerLaneHit(4); e.preventDefault(); }
      else if (key === ' ') { this.togglePause(); e.preventDefault(); }
    };
    window.addEventListener('keydown', this.keyHandler);
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
    this.notesHitCount = 0;
    this.activeNotes = [];
    this.spawnTimer = 0;
    this.lastFrameTime = performance.now();

    const overlay = this.container.querySelector('#rhythm-modal-overlay');
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

      if (this.timeLeft <= 0) {
        this.gameOver(true);
      }
      this.updateHUD();
    }, 1000);
  }

  spawnNote() {
    if (this.activeNotes.length >= 6) return;
    const randomObj = this.rawWords[Math.floor(Math.random() * this.rawWords.length)];
    if (!randomObj) return;

    const tone = extractToneFromPinyin(randomObj.pinyin);
    const noteId = 'rnote_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    const note = {
      id: noteId,
      wordObj: randomObj,
      lane: tone, // 1, 2, 3, 4
      y: -50,
      speed: 160 + (60 - this.timeLeft) * 1.5, // gradual increase
      hit: false,
      el: null
    };

    const layer = this.container.querySelector('#rhythm-notes-layer');
    if (!layer) return;

    const el = document.createElement('div');
    el.className = `rhythm-falling-note note-lane-${tone}`;
    el.id = noteId;
    el.innerHTML = `
      <div class="note-char">${randomObj.word}</div>
      <div class="note-pinyin">${randomObj.pinyin}</div>
    `;

    // Position horizontally based on lane (0%, 25%, 50%, 75%)
    el.style.left = `${(tone - 1) * 25}%`;
    el.style.top = `-50px`;

    layer.appendChild(el);
    note.el = el;
    this.activeNotes.push(note);
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    if (!this.isPaused) {
      const dt = (currentTime - this.lastFrameTime) / 1000;
      this.lastFrameTime = currentTime;

      // Spawn note periodically
      this.spawnTimer += dt * 1000;
      const spawnInterval = Math.max(900, 1800 - (60 - this.timeLeft) * 15);
      if (this.spawnTimer >= spawnInterval) {
        this.spawnTimer = 0;
        this.spawnNote();
      }

      // Update notes
      const highway = this.container.querySelector('#rhythm-highway');
      const trackHeight = highway ? highway.clientHeight : 440;

      for (let i = this.activeNotes.length - 1; i >= 0; i--) {
        const note = this.activeNotes[i];
        note.y += note.speed * dt;

        if (note.el) {
          note.el.style.transform = `translate3d(0, ${note.y}px, 0)`;
        }

        // Missed note (passed hit zone completely)
        if (note.y > trackHeight - 20 && !note.hit) {
          if (note.el && note.el.parentNode) {
            note.el.parentNode.removeChild(note.el);
          }
          this.activeNotes.splice(i, 1);
          this.triggerMiss(note.lane);
        }
      }
    } else {
      this.lastFrameTime = currentTime;
    }

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  triggerLaneHit(lane) {
    if (!this.isRunning || this.isPaused) return;

    // Visual pad effect
    const pad = this.container.querySelector(`#pad-${lane}`);
    if (pad) {
      pad.classList.add('hit-active');
      setTimeout(() => pad.classList.remove('hit-active'), 120);
    }

    const highway = this.container.querySelector('#rhythm-highway');
    const trackHeight = highway ? highway.clientHeight : 440;
    const targetHitY = trackHeight - 75;

    // Find nearest note in this lane
    let nearestNote = null;
    let minDiff = Infinity;
    let nearestIdx = -1;

    for (let i = 0; i < this.activeNotes.length; i++) {
      const note = this.activeNotes[i];
      if (note.lane === lane && !note.hit) {
        const diff = Math.abs(note.y - targetHitY);
        if (diff < minDiff) {
          minDiff = diff;
          nearestNote = note;
          nearestIdx = i;
        }
      }
    }

    if (nearestNote && minDiff < 90) {
      // Perfect or Good Hit!
      nearestNote.hit = true;
      if (nearestNote.el && nearestNote.el.parentNode) {
        nearestNote.el.parentNode.removeChild(nearestNote.el);
      }
      this.activeNotes.splice(nearestIdx, 1);

      const isPerfect = minDiff < 40;
      const pts = (isPerfect ? 30 : 15) * (this.isFeverMode ? 4 : 1);
      this.score += pts;
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      this.notesHitCount++;

      this.sfx.playHit(lane);
      this.showHitFeedback(lane, isPerfect ? 'PERFECT! 🌟' : 'GOOD! ✨', isPerfect ? '#fbbf24' : '#38bdf8');

      if (this.combo % 8 === 0 && !this.isFeverMode) {
        this.triggerFever();
      }

      this.updateHUD();
    } else {
      // Mistimed or empty hit
      this.triggerMiss(lane);
    }
  }

  triggerMiss(lane) {
    this.combo = 0;
    this.lives--;
    this.isFeverMode = false;
    const feverBanner = this.container.querySelector('#rhythm-fever-banner');
    if (feverBanner) feverBanner.style.display = 'none';

    this.sfx.playMiss();
    this.showHitFeedback(lane, 'MISS ❌', '#ef4444');

    if (this.lives <= 0) {
      this.gameOver(false);
      return;
    }
    this.updateHUD();
  }

  triggerFever() {
    this.isFeverMode = true;
    this.sfx.playFever();
    const banner = this.container.querySelector('#rhythm-fever-banner');
    if (banner) {
      banner.style.display = 'block';
      setTimeout(() => {
        if (this.isFeverMode) {
          this.isFeverMode = false;
          banner.style.display = 'none';
        }
      }, 8000);
    }
  }

  showHitFeedback(lane, text, color) {
    const highway = this.container.querySelector('#rhythm-highway');
    if (!highway) return;

    const el = document.createElement('div');
    el.className = 'rhythm-hit-feedback';
    el.style.left = `${(lane - 1) * 25 + 12.5}%`;
    el.style.color = color;
    el.textContent = text;

    highway.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 800);
  }

  updateHUD() {
    const scoreVal = this.container.querySelector('#rhythm-score-val');
    const comboVal = this.container.querySelector('#rhythm-combo-val');
    const livesContainer = this.container.querySelector('#rhythm-lives-container');
    const timerVal = this.container.querySelector('#rhythm-timer-val');
    const feverBanner = this.container.querySelector('#rhythm-fever-banner');

    if (scoreVal) scoreVal.textContent = this.score;
    if (comboVal) comboVal.textContent = this.combo;

    if (feverBanner) {
      feverBanner.style.display = this.combo >= 20 ? 'block' : 'none';
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
  }

  showToast(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseBtn = this.container.querySelector('#rhythm-pause-btn');
    if (pauseBtn) {
      pauseBtn.innerHTML = `<i class="fa-solid fa-${this.isPaused ? 'play' : 'pause'}"></i>`;
    }
    this.showToast(this.isPaused ? 'Đã tạm dừng game ⏸' : 'Tiếp tục chơi ▶️');
  }

  gameOver(isVictory) {
    this.isRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const overlay = this.container.querySelector('#rhythm-modal-overlay');
    const icon = this.container.querySelector('#rhythm-result-icon');
    const title = this.container.querySelector('#rhythm-result-title');
    const desc = this.container.querySelector('#rhythm-result-desc');
    const resScore = this.container.querySelector('#rhythm-res-score');
    const resCombo = this.container.querySelector('#rhythm-res-combo');
    const resNotes = this.container.querySelector('#rhythm-res-notes');

    if (overlay) {
      overlay.style.setProperty('display', 'flex', 'important');
      if (icon) icon.textContent = isVictory ? '🏆' : '💔';
      if (title) title.textContent = isVictory ? 'Bậc Thầy Thanh Điệu!' : 'Hết Tim - Game Over!';
      if (desc) desc.textContent = isVictory ? 'Bạn đã hoàn thành xuất sắc bản nhạc và phân biệt thanh điệu siêu chuẩn!' : 'Hãy lắng nghe thanh điệu thật kỹ để bắt trọn nhịp nhé!';
      if (resScore) resScore.textContent = this.score;
      if (resCombo) resCombo.textContent = this.maxCombo;
      if (resNotes) resNotes.textContent = this.notesHitCount;

      const retryBtn = overlay.querySelector('#rhythm-retry-btn');
      const backHubBtn = overlay.querySelector('#rhythm-back-hub-btn');
      const finishBtn = overlay.querySelector('#rhythm-finish-btn');

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
    const overlay = this.container.querySelector('#rhythm-modal-overlay');
    if (overlay) {
      overlay.style.setProperty('display', 'none', 'important');
    }
    const layer = this.container.querySelector('#rhythm-notes-layer');
    if (layer) layer.innerHTML = '';
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
    const overlay = this.container.querySelector('#rhythm-modal-overlay');
    if (overlay) {
      overlay.style.setProperty('display', 'none', 'important');
    }
    if (typeof this.onExit === 'function') {
      this.onExit();
    }
  }
}
