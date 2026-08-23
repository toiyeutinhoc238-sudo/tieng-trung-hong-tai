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
      word: randomObj.word,
      pinyin: randomObj.pinyin,
      meaning: randomObj.meaning,
      tone: tone, // 1, 2, 3, 4
      y: -50,
      speed: 130 + (60 - this.timeLeft) * 1.5,
      hasSpoken: false,
      el: null
    };

    const layer = this.container.querySelector('#rhythm-notes-layer');
    if (layer) {
      const el = document.createElement('div');
      el.id = noteId;
      el.className = `rhythm-note note-tone-${tone}`;
      el.style.top = `${note.y}px`;
      el.style.left = `${(tone - 1) * 25}%`;

      el.innerHTML = `
        <div class="note-zh">${randomObj.word}</div>
        <div class="note-pinyin">${randomObj.pinyin}</div>
      `;

      layer.appendChild(el);
      note.el = el;
    }

    this.activeNotes.push(note);
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
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnNote();
    }

    const highway = this.container.querySelector('#rhythm-highway');
    const hitZoneY = highway ? highway.clientHeight - 110 : 380;
    const missLimitY = highway ? highway.clientHeight - 30 : 450;

    for (let i = this.activeNotes.length - 1; i >= 0; i--) {
      const note = this.activeNotes[i];
      note.y += note.speed * dt;

      if (note.el) {
        note.el.style.top = `${note.y}px`;
      }

      // Voice trigger when approaching judgment line
      if (!note.hasSpoken && note.y >= hitZoneY - 120) {
        note.hasSpoken = true;
        if (window.speakText) window.speakText(note.word);
      }

      // Missed note falling off screen
      if (note.y >= missLimitY) {
        this.handleMiss(i);
      }
    }

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  triggerLaneHit(lane) {
    this.sfx.playHit(lane);

    // Visual ripple effect on pad
    const pad = this.container.querySelector(`#pad-${lane}`);
    if (pad) {
      pad.classList.add('active-hit');
      setTimeout(() => pad.classList.remove('active-hit'), 150);
    }

    const highway = this.container.querySelector('#rhythm-highway');
    const hitZoneY = highway ? highway.clientHeight - 110 : 380;

    // Check closest note in this lane
    let closestIdx = -1;
    let closestDist = 999;

    for (let i = 0; i < this.activeNotes.length; i++) {
      const note = this.activeNotes[i];
      if (note.tone === lane) {
        const dist = Math.abs(note.y - hitZoneY);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      }
    }

    if (closestIdx !== -1 && closestDist <= 75) {
      // Perfect or Great
      const isPerfect = closestDist <= 35;
      this.handleHitSuccess(closestIdx, isPerfect);
    } else {
      // False hit in wrong timing or lane
      this.showJudgmentFloatingText(lane, 'MISS', '#ef4444');
    }
  }

  handleHitSuccess(idx, isPerfect) {
    const note = this.activeNotes[idx];
    if (!note) return;

    this.sfx.playPerfect();
    this.notesHitCount++;
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    const multiplier = this.combo >= 20 ? 4 : this.combo >= 10 ? 3 : this.combo >= 5 ? 2 : 1;
    const basePts = isPerfect ? 100 : 60;
    const pts = basePts * multiplier;
    this.score += pts;

    const text = isPerfect ? `PERFECT! +${pts}` : `GREAT! +${pts}`;
    const color = isPerfect ? '#fbbf24' : '#38bdf8';
    this.showJudgmentFloatingText(note.tone, text, color);

    if (note.el) note.el.remove();
    this.activeNotes.splice(idx, 1);

    this.updateHUD();
  }

  handleMiss(idx) {
    const note = this.activeNotes[idx];
    if (!note) return;

    this.sfx.playMiss();
    this.lives--;
    this.combo = 0;

    this.showJudgmentFloatingText(note.tone, 'MISS 💔', '#ef4444');
    if (note.el) note.el.remove();
    this.activeNotes.splice(idx, 1);

    if (this.lives <= 0) {
      this.gameOver(false);
    }
    this.updateHUD();
  }

  showJudgmentFloatingText(lane, text, color) {
    const layer = this.container.querySelector('#rhythm-notes-layer');
    const highway = this.container.querySelector('#rhythm-highway');
    if (!layer || !highway) return;

    const hitZoneY = highway.clientHeight - 120;
    const el = document.createElement('div');
    el.className = 'rhythm-floating-judge';
    el.textContent = text;
    el.style.left = `${(lane - 1) * 25 + 5}%`;
    el.style.top = `${hitZoneY}px`;
    el.style.color = color;

    layer.appendChild(el);
    setTimeout(() => el.remove(), 700);
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
      overlay.style.display = 'flex';
      if (icon) icon.textContent = isVictory ? '🏆' : '💔';
      if (title) title.textContent = isVictory ? 'Bậc Thầy Thanh Điệu!' : 'Hết Tim - Game Over!';
      if (desc) desc.textContent = isVictory ? 'Bạn đã hoàn thành xuất sắc bản nhạc và phân biệt thanh điệu siêu chuẩn!' : 'Hãy lắng nghe thanh điệu thật kỹ để bắt trọn nhịp nhé!';
      if (resScore) resScore.textContent = this.score;
      if (resCombo) resCombo.textContent = this.maxCombo;
      if (resNotes) resNotes.textContent = this.notesHitCount;

      const retryBtn = overlay.querySelector('#rhythm-retry-btn');
      const backHubBtn = overlay.querySelector('#rhythm-back-hub-btn');
      const finishBtn = overlay.querySelector('#rhythm-finish-btn');

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
    const overlay = this.container.querySelector('#rhythm-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    const layer = this.container.querySelector('#rhythm-notes-layer');
    if (layer) layer.innerHTML = '';
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
    const cb = this.onExit;
    this.onExit = null;
    if (typeof cb === 'function') {
      cb();
    }
  }
}
