/**
 * Tiếng Trung HongTai - Plants vs Zombies: Hanzi Defense (植物大战僵尸 - PvZ 1 Style)
 * Game Thủ Thành Sân Cỏ 5 Làn Kinh Điển PvZ 1 Kết Hợp Ôn Luyện Từ Vựng Tiếng Trung Chuyên Sâu
 */

export class PvZGameEngine {
  constructor(containerEl, words = [], onExit = () => {}) {
    this.container = containerEl;
    this.rawWords = words.length > 0 ? words : [
      { word: '苹果', pinyin: 'píngguǒ', meaning: 'quả táo' },
      { word: '香蕉', pinyin: 'xiāngjiāo', meaning: 'quả chuối' },
      { word: '西瓜', pinyin: 'xīguā', meaning: 'dưa hấu' },
      { word: '猫', pinyin: 'māo', meaning: 'con mèo' },
      { word: '狗', pinyin: 'gǒu', meaning: 'con chó' },
      { word: '学校', pinyin: 'xuéxiào', meaning: 'trường học' },
      { word: '老师', pinyin: 'lǎoshī', meaning: 'giáo viên' },
      { word: '学生', pinyin: 'xuéshēng', meaning: 'học sinh' },
      { word: '朋友', pinyin: 'péngyou', meaning: 'bạn bè' },
      { word: '开心', pinyin: 'kāixīn', meaning: 'vui vẻ' }
    ];
    this.onExit = onExit;

    // Game state
    this.isRunning = false;
    this.isPaused = false;
    this.score = 0;
    this.suns = 150;
    this.wave = 1;
    this.maxWaves = 3;
    this.zombiesKilled = 0;
    this.wordsMasteredCount = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.currentVocabQuestion = null;

    // Grid configuration: 5 rows x 9 cols
    this.rows = 5;
    this.cols = 9;
    this.grid = Array(5).fill(null).map(() => Array(9).fill(null));

    // Entities
    this.plants = [];
    this.zombies = [];
    this.projectiles = [];
    this.fallingSuns = [];
    this.lawnmowers = [true, true, true, true, true]; // 1 for each row
    this.activeMowers = []; // Running mowers
    this.particleEffects = [];

    // Selected plant seed card
    this.selectedSeedType = null;

    // Available Plants Definitions (PvZ 1 Classic Roster - All Unlocked)
    this.plantDefs = {
      sunflower: {
        id: 'sunflower',
        name: 'Hướng Dương',
        zh: '向日葵',
        cost: 50,
        cooldown: 5000,
        hp: 300,
        icon: '🌻',
        desc: 'Định kỳ sản xuất 25 Mặt Trời ☀️'
      },
      peashooter: {
        id: 'peashooter',
        name: 'Súng Đậu',
        zh: '豌豆射手',
        cost: 100,
        cooldown: 5000,
        hp: 300,
        attackSpeed: 1500,
        damage: 20,
        icon: '🟢',
        desc: 'Bắn đạn đậu thẳng về phía trước'
      },
      snowpea: {
        id: 'snowpea',
        name: 'Đậu Băng',
        zh: '寒冰射手',
        cost: 175,
        cooldown: 7500,
        hp: 300,
        attackSpeed: 1500,
        damage: 20,
        slows: true,
        icon: '❄️',
        desc: 'Bắn đạn băng làm chậm 50% tốc độ Zombie'
      },
      repeater: {
        id: 'repeater',
        name: 'Đậu Bắn Đúp',
        zh: '双发射手',
        cost: 200,
        cooldown: 7500,
        hp: 300,
        attackSpeed: 1500,
        damage: 20,
        doubleShot: true,
        icon: '🥬',
        desc: 'Bắn liền 2 viên đạn đậu mỗi lượt'
      },
      wallnut: {
        id: 'wallnut',
        name: 'Quả Óc Chó',
        zh: '坚果墙',
        cost: 50,
        cooldown: 18000,
        hp: 2000,
        icon: '🥔',
        desc: 'Lớp giáp cực dày cản đường Zombie'
      },
      potatomine: {
        id: 'potatomine',
        name: 'Mìn Khoai Tây',
        zh: '土豆地雷',
        cost: 25,
        cooldown: 15000,
        hp: 300,
        armTime: 8000,
        icon: '🥔💥',
        desc: 'Nổ tung khi Zombie giẫm trúng'
      },
      chomper: {
        id: 'chomper',
        name: 'Cây Nuốt Chửng',
        zh: '大嘴花',
        cost: 150,
        cooldown: 10000,
        hp: 400,
        icon: '🍄',
        desc: 'Nuốt chọn 1 Zombie sau đó nhai từ từ'
      },
      cherrybomb: {
        id: 'cherrybomb',
        name: 'Bom Anh Đào',
        zh: '樱桃炸弹',
        cost: 150,
        cooldown: 25000,
        hp: 9999,
        instant: true,
        icon: '🍒',
        desc: 'Nổ tung toàn bộ Zombie trong ô 3x3'
      },
      jalapeno: {
        id: 'jalapeno',
        name: 'Ớt Lửa',
        zh: '火爆辣椒',
        cost: 125,
        cooldown: 25000,
        hp: 9999,
        instant: true,
        icon: '🌶️',
        desc: 'Thiêu rụi toàn bộ một làn hàng ngang'
      }
    };

    // Cooldown tracking for seeds
    this.seedCooldowns = {};
    Object.keys(this.plantDefs).forEach(k => {
      this.seedCooldowns[k] = 0;
    });

    // Sound FX generator (Web Audio API)
    this.initAudio();

    // Loop timers
    this.lastTime = 0;
    this.sunDropTimer = 0;
    this.zombieSpawnTimer = 0;
    this.waveTimer = 0;
    this.zombiesInWaveLeft = 0;

    this.renderLayout();
    this.bindEvents();
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch {
      this.audioCtx = null;
    }

    this.sfx = {
      playTone: (freq, type, duration, vol = 0.2) => {
        if (!this.audioCtx) return;
        try {
          if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
          gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start();
          osc.stop(this.audioCtx.currentTime + duration);
        } catch {}
      },
      playPlant: () => {
        this.sfx.playTone(320, 'sine', 0.15, 0.3);
        setTimeout(() => this.sfx.playTone(480, 'triangle', 0.2, 0.3), 80);
      },
      playShoot: () => {
        this.sfx.playTone(450, 'triangle', 0.08, 0.15);
      },
      playHit: () => {
        this.sfx.playTone(180, 'square', 0.05, 0.15);
      },
      playSun: () => {
        this.sfx.playTone(600, 'sine', 0.1, 0.25);
        setTimeout(() => this.sfx.playTone(850, 'sine', 0.15, 0.3), 60);
      },
      playExplode: () => {
        this.sfx.playTone(90, 'sawtooth', 0.4, 0.5);
      },
      playCorrect: () => {
        this.sfx.playTone(523.25, 'triangle', 0.1, 0.3);
        setTimeout(() => this.sfx.playTone(659.25, 'triangle', 0.1, 0.3), 80);
        setTimeout(() => this.sfx.playTone(783.99, 'triangle', 0.25, 0.35), 160);
      },
      playChomp: () => {
        this.sfx.playTone(220, 'square', 0.12, 0.25);
      },
      playMower: () => {
        this.sfx.playTone(140, 'sawtooth', 0.8, 0.4);
      }
    };
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="pvz-game-wrapper">
        <!-- TOP HUD & SEED PACKETS BAR -->
        <div class="pvz-top-hud">
          <!-- SUN COUNTER BOX -->
          <div class="pvz-sun-counter-box">
            <span class="sun-icon">☀️</span>
            <span class="sun-val" id="pvz-sun-val">150</span>
          </div>

          <!-- SEEDS SELECTOR BAR (PVZ 1 ROSTER) -->
          <div class="pvz-seeds-bar" id="pvz-seeds-bar">
            ${Object.values(this.plantDefs).map(p => `
              <div class="pvz-seed-card" id="seed-${p.id}" data-type="${p.id}" title="${p.name} (${p.cost}☀️) - ${p.desc}">
                <div class="seed-icon">${p.icon}</div>
                <div class="seed-name">${p.name}</div>
                <div class="seed-cost">${p.cost}☀️</div>
                <div class="seed-cooldown-overlay" id="cd-${p.id}"></div>
              </div>
            `).join('')}
          </div>

          <!-- RIGHT ACTIONS & STATUS -->
          <div class="pvz-top-right">
            <div class="hud-item pvz-wave-badge" id="pvz-wave-badge">
              <i class="fa-solid fa-skull" style="color: #ef4444;"></i> ĐỢT 1/3
            </div>
            <div class="hud-item" style="color: #38bdf8; font-weight: 800;">
              <i class="fa-solid fa-trophy"></i> <span id="pvz-score-val">0</span>
            </div>
            <button type="button" id="pvz-shovel-btn" class="btn btn-warning btn-sm pvz-shovel-btn" title="Xẻng nhổ cây">
              <i class="fa-solid fa-trowel"></i> XẺNG
            </button>
            <button type="button" id="pvz-pause-btn" class="btn btn-outline btn-sm" title="Tạm dừng"><i class="fa-solid fa-pause"></i></button>
            <button type="button" id="pvz-back-hub-top-btn" class="btn btn-secondary btn-sm" title="Đổi trò chơi khác" style="display: flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 50px; padding: 6px 14px;">
              <i class="fa-solid fa-arrow-left"></i> Đổi Game
            </button>
            <button type="button" id="pvz-exit-btn" class="btn btn-outline btn-sm" title="Quay lại Sổ tay"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>

        <!-- MAIN LAWN PLAYFIELD ARENA -->
        <div class="pvz-lawn-container" id="pvz-lawn-container">
          <!-- 5 LAWNMOWERS ON LEFT -->
          <div class="pvz-mowers-column" id="pvz-mowers-column">
            ${[0, 1, 2, 3, 4].map(r => `
              <div class="pvz-mower-slot" id="mower-slot-${r}">
                <div class="pvz-lawnmower" id="mower-${r}">🚜</div>
              </div>
            `).join('')}
          </div>

          <!-- 5x9 LAWN TILES GRID -->
          <div class="pvz-lawn-grid" id="pvz-lawn-grid">
            ${Array(5).fill(0).map((_, r) => `
              <div class="pvz-lawn-row" data-row="${r}">
                ${Array(9).fill(0).map((_, c) => `
                  <div class="pvz-lawn-cell ${ (r + c) % 2 === 0 ? 'cell-dark' : 'cell-light' }" data-row="${r}" data-col="${c}"></div>
                `).join('')}
              </div>
            `).join('')}
          </div>

          <!-- DYNAMIC ENTITIES LAYER (Canvas/Overlay for Plants, Zombies, Bullets, Suns) -->
          <div class="pvz-entities-layer" id="pvz-entities-layer"></div>
          <canvas id="pvz-canvas" class="pvz-canvas"></canvas>
        </div>

        <!-- VOCABULARY KNOWLEDGE COMBAT & SUN BOOST BAR -->
        <div class="pvz-vocab-combat-bar" id="pvz-vocab-combat-bar">
          <div class="vocab-prompt-left">
            <div class="vocab-tag">⚡ THỬ THÁCH TỪ VỰNG TIẾP NĂNG LƯỢNG (+75☀️)</div>
            <div class="vocab-q-text" id="pvz-vocab-target-word">苹果 <span class="vocab-py">(píngguǒ)</span></div>
          </div>

          <div class="vocab-answers-grid" id="pvz-vocab-answers-grid">
            <!-- 3 Meaning answer options rendered dynamically -->
          </div>

          <div class="vocab-streak-badge">
            <span style="font-size: 0.72rem; color: #94a3b8; font-weight: 700;">CHUỖI ĐÚNG</span>
            <span style="font-size: 1.2rem; font-weight: 900; color: #fbbf24;" id="pvz-streak-val">0 🔥</span>
          </div>
        </div>

        <!-- MODAL OVERLAY (Result/Victory/Game Over) -->
        <div id="pvz-modal-overlay" class="cannon-modal-overlay" style="display: none;">
          <div class="cannon-result-card">
            <div id="pvz-result-icon" class="result-icon">🌻</div>
            <h2 id="pvz-result-title" class="result-title">Bảo Vệ Sân Vườn Thành Công!</h2>
            <p id="pvz-result-desc" class="result-desc">Đội quân cây trồng đã đẩy lùi toàn bộ đàn Zombie!</p>
            
            <div class="result-stats-grid">
              <div class="stat-pill">
                <span class="label">Tổng Điểm</span>
                <span class="val" id="pvz-res-score">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Zombie Đã Diệt</span>
                <span class="val" id="pvz-res-kills">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Từ Vựng Thuộc</span>
                <span class="val" id="pvz-res-words">0</span>
              </div>
            </div>

            <div class="result-beta-note">
              <i class="fa-solid fa-flask"></i> <strong>Chế độ thử nghiệm:</strong> Điểm số ôn tập tự do không lưu vào bảng xếp hạng Rank.
            </div>

            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
              <button type="button" id="pvz-retry-btn" class="btn btn-primary" style="padding: 10px 20px; font-weight: 800;"><i class="fa-solid fa-rotate-right"></i> Chơi Lại</button>
              <button type="button" id="pvz-back-hub-btn" class="btn btn-secondary" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-gamepad"></i> Đổi Trò Chơi</button>
              <button type="button" id="pvz-finish-btn" class="btn btn-outline" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-book-bookmark"></i> Quay Lại Sổ Tay</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const pauseBtn = this.container.querySelector('#pvz-pause-btn');
    const exitBtn = this.container.querySelector('#pvz-exit-btn');
    const shovelBtn = this.container.querySelector('#pvz-shovel-btn');

    if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
    if (exitBtn) exitBtn.addEventListener('click', () => {
      this.stopAndExit();
      if (typeof window.exitNotebookGamesHub === 'function') window.exitNotebookGamesHub();
    });

    if (shovelBtn) {
      shovelBtn.addEventListener('click', () => {
        this.selectedSeedType = this.selectedSeedType === 'shovel' ? null : 'shovel';
        this.updateSeedSelectionUI();
        if (this.selectedSeedType === 'shovel') {
          this.showToast('⛏️ Đã chọn Xẻng: Click vào ô có cây để đào bỏ!');
        }
      });
    }

    // Seed cards selection
    this.container.querySelectorAll('.pvz-seed-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const type = card.dataset.type;
        const pDef = this.plantDefs[type];
        if (!pDef) return;

        if (this.suns < pDef.cost) {
          this.showToast(`⚠️ Không đủ Mặt Trời! Cần ${pDef.cost}☀️ (Hiện có ${this.suns}☀️)`);
          return;
        }

        if (this.seedCooldowns[type] > 0) {
          this.showToast('⏳ Cây đang trong thời gian hồi chiêu!');
          return;
        }

        this.selectedSeedType = this.selectedSeedType === type ? null : type;
        this.updateSeedSelectionUI();
      });
    });

    // Lawn grid cell placement
    this.container.querySelectorAll('.pvz-lawn-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        e.preventDefault();
        const r = parseInt(cell.dataset.row, 10);
        const c = parseInt(cell.dataset.col, 10);
        this.handleCellClick(r, c);
      });
    });

    // Canvas click for sun collecting
    const canvas = this.container.querySelector('#pvz-canvas');
    if (canvas) {
      canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.handleCanvasClick(x, y);
      });
    }

    // Window resize
    this.resizeHandler = () => this.initCanvasSize();
    window.addEventListener('resize', this.resizeHandler);
  }

  initCanvasSize() {
    const canvas = this.container.querySelector('#pvz-canvas');
    const lawn = this.container.querySelector('#pvz-lawn-container');
    if (!canvas || !lawn) return;

    canvas.width = lawn.clientWidth || 900;
    canvas.height = lawn.clientHeight || 450;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
  }

  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.score = 0;
    this.suns = 150;
    this.wave = 1;
    this.zombiesKilled = 0;
    this.wordsMasteredCount = 0;
    this.streak = 0;
    this.maxStreak = 0;

    this.grid = Array(5).fill(null).map(() => Array(9).fill(null));
    this.plants = [];
    this.zombies = [];
    this.projectiles = [];
    this.fallingSuns = [];
    this.lawnmowers = [true, true, true, true, true];
    this.activeMowers = [];
    this.particleEffects = [];
    this.selectedSeedType = null;

    Object.keys(this.plantDefs).forEach(k => {
      this.seedCooldowns[k] = 0;
    });

    this.initCanvasSize();
    this.updateLawnmowerVisuals();
    this.nextVocabQuestion();
    this.updateHUD();

    this.sunDropTimer = 0;
    this.zombieSpawnTimer = 3000; // Spawn first zombie after 3s
    this.zombiesInWaveLeft = 8;
    this.lastTime = performance.now();

    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = requestAnimationFrame((t) => this.loop(t));

    this.showToast('🌻 SẴN SÀNG! Trồng cây và giải từ vựng để đẩy lùi đàn Zombie!');
  }

  updateLawnmowerVisuals() {
    for (let r = 0; r < 5; r++) {
      const mEl = this.container.querySelector(`#mower-${r}`);
      if (mEl) {
        mEl.style.display = this.lawnmowers[r] ? 'block' : 'none';
      }
    }
  }

  updateSeedSelectionUI() {
    this.container.querySelectorAll('.pvz-seed-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.type === this.selectedSeedType);
    });
    const shovel = this.container.querySelector('#pvz-shovel-btn');
    if (shovel) {
      shovel.classList.toggle('active', this.selectedSeedType === 'shovel');
    }
  }

  handleCellClick(r, c) {
    if (!this.isRunning || this.isPaused) return;

    if (this.selectedSeedType === 'shovel') {
      // Shovel action: Remove plant
      if (this.grid[r][c]) {
        const p = this.grid[r][c];
        this.plants = this.plants.filter(item => item !== p);
        this.grid[r][c] = null;
        this.selectedSeedType = null;
        this.updateSeedSelectionUI();
        this.sfx.playPlant();
        this.showToast('🗑️ Đã đào bỏ cây!');
      }
      return;
    }

    if (!this.selectedSeedType) return;
    const pDef = this.plantDefs[this.selectedSeedType];
    if (!pDef) return;

    if (this.grid[r][c]) {
      this.showToast('⚠️ Ô đất này đã có cây!');
      return;
    }

    if (this.suns < pDef.cost) {
      this.showToast(`⚠️ Không đủ Mặt Trời! Cần ${pDef.cost}☀️`);
      return;
    }

    // Place plant!
    this.suns -= pDef.cost;
    this.seedCooldowns[this.selectedSeedType] = pDef.cooldown;

    const plant = {
      id: `${pDef.id}_${Date.now()}`,
      type: pDef.id,
      row: r,
      col: c,
      hp: pDef.hp,
      maxHp: pDef.hp,
      icon: pDef.icon,
      name: pDef.name,
      zh: pDef.zh,
      cost: pDef.cost,
      attackCooldown: 0,
      sunCooldown: Math.random() * 3000 + 4000,
      armed: pDef.id === 'potatomine' ? false : true,
      armTimer: pDef.armTime || 0,
      chewingTimer: 0
    };

    this.grid[r][c] = plant;
    this.plants.push(plant);
    this.sfx.playPlant();

    // Instant plants activation
    if (pDef.id === 'cherrybomb') {
      setTimeout(() => this.triggerCherryExplosion(plant), 1200);
    } else if (pDef.id === 'jalapeno') {
      setTimeout(() => this.triggerJalapenoFlame(plant), 800);
    }

    this.selectedSeedType = null;
    this.updateSeedSelectionUI();
    this.updateHUD();
  }

  triggerCherryExplosion(plant) {
    this.sfx.playExplode();
    const r = plant.row;
    const c = plant.col;

    // Eliminate zombies in 3x3
    this.zombies.forEach(z => {
      if (Math.abs(z.row - r) <= 1 && Math.abs(z.col - c) <= 1.5) {
        z.hp = 0;
        this.createExplosionFX(z.x, z.y);
      }
    });

    this.grid[r][c] = null;
    this.plants = this.plants.filter(p => p !== plant);
    this.showToast('💥 BOOOOM! Bom Anh Đào đã quét sạch Zombie xung quanh!');
  }

  triggerJalapenoFlame(plant) {
    this.sfx.playExplode();
    const r = plant.row;

    // Eliminate all zombies in this row
    this.zombies.forEach(z => {
      if (z.row === r) {
        z.hp = 0;
        this.createExplosionFX(z.x, z.y);
      }
    });

    this.grid[r][plant.col] = null;
    this.plants = this.plants.filter(p => p !== plant);
    this.showToast('🌶️ PHÙUUU! Ớt Lửa đã thiêu rụi toàn bộ Zombie trên làn!');
  }

  createExplosionFX(x, y) {
    for (let i = 0; i < 12; i++) {
      this.particleEffects.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 8 + 6,
        color: ['#ef4444', '#f59e0b', '#fbbf24', '#ffffff'][Math.floor(Math.random() * 4)],
        life: 1.0
      });
    }
  }

  handleCanvasClick(x, y) {
    // 1. Check click on falling suns
    for (let i = this.fallingSuns.length - 1; i >= 0; i--) {
      const sun = this.fallingSuns[i];
      const dist = Math.hypot(sun.x - x, sun.y - y);
      if (dist <= 40) {
        this.suns += 25;
        this.sfx.playSun();
        this.createExplosionFX(sun.x, sun.y);
        this.fallingSuns.splice(i, 1);
        this.updateHUD();
        return;
      }
    }

    // 2. Check click on zombies to pronounce vocab word
    for (let i = 0; i < this.zombies.length; i++) {
      const z = this.zombies[i];
      const dist = Math.hypot(z.x - x, z.y - y);
      if (dist <= 38) {
        if (window.speakText) window.speakText(z.word);
        this.showToast(`🔊 ${z.word} (${z.pinyin}): ${z.meaning}`);
        return;
      }
    }

    // 3. Check click on lawn grid cells to plant / shovel
    const lawn = this.container.querySelector('#pvz-lawn-container');
    if (!lawn) return;
    const lawnWidth = lawn.clientWidth || 850;
    const lawnHeight = lawn.clientHeight || 440;
    const mowerWidth = 48;

    if (x >= mowerWidth && x <= lawnWidth && y >= 0 && y <= lawnHeight) {
      const cellWidth = (lawnWidth - mowerWidth) / 9;
      const cellHeight = lawnHeight / 5;

      const r = Math.min(4, Math.max(0, Math.floor(y / cellHeight)));
      const c = Math.min(8, Math.max(0, Math.floor((x - mowerWidth) / cellWidth)));

      this.handleCellClick(r, c);
    }
  }

  nextVocabQuestion() {
    if (this.rawWords.length === 0) return;
    const targetObj = this.rawWords[Math.floor(Math.random() * this.rawWords.length)];
    this.currentVocabQuestion = targetObj;

    const targetWordEl = this.container.querySelector('#pvz-vocab-target-word');
    if (targetWordEl) {
      targetWordEl.innerHTML = `${targetObj.word} <span class="vocab-py">(${targetObj.pinyin})</span>`;
    }

    // Build 3 answer options
    const distractors = this.rawWords
      .filter(w => w.word !== targetObj.word)
      .map(w => w.meaning);
    
    // Shuffle distractors
    const shuffledDistractors = distractors.sort(() => 0.5 - Math.random()).slice(0, 2);
    const options = [targetObj.meaning, ...shuffledDistractors].sort(() => 0.5 - Math.random());

    const grid = this.container.querySelector('#pvz-vocab-answers-grid');
    if (!grid) return;

    grid.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pvz-vocab-btn';
      btn.textContent = opt;
      btn.onclick = () => this.handleVocabAnswer(opt, btn);
      grid.appendChild(btn);
    });
  }

  handleVocabAnswer(chosenMeaning, btnEl) {
    if (!this.currentVocabQuestion || !this.isRunning || this.isPaused) return;

    const isCorrect = chosenMeaning === this.currentVocabQuestion.meaning;

    if (isCorrect) {
      btnEl.classList.add('correct');
      this.sfx.playCorrect();
      this.suns += 75;
      this.streak++;
      this.wordsMasteredCount++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;

      // Speak pronunciation
      if (window.speakText) window.speakText(this.currentVocabQuestion.word);

      this.showToast(`✨ CHÍNH XÁC! +75☀️ & Bão đạn liên thanh! (${this.currentVocabQuestion.word})`);

      // Plant Food Burst: All Peashooters shoot rapid burst
      this.plants.forEach(p => {
        if (p.type === 'peashooter' || p.type === 'snowpea' || p.type === 'repeater') {
          for (let b = 0; b < 3; b++) {
            setTimeout(() => {
              if (this.isRunning) this.spawnProjectile(p);
            }, b * 120);
          }
        }
      });

      this.updateHUD();
      setTimeout(() => this.nextVocabQuestion(), 800);
    } else {
      btnEl.classList.add('wrong');
      this.sfx.playHit();
      this.streak = 0;
      this.showToast(`❌ Chưa chính xác! Nghĩa đúng: "${this.currentVocabQuestion.meaning}"`);
      this.updateHUD();
      setTimeout(() => this.nextVocabQuestion(), 1200);
    }
  }

  spawnZombie() {
    const r = Math.floor(Math.random() * 5);
    const wordObj = this.rawWords[Math.floor(Math.random() * this.rawWords.length)];

    // Zombie types
    const types = [
      { type: 'normal', name: 'Zombie Thường', icon: '🧟', hp: 120, speed: 0.35 },
      { type: 'conehead', name: 'Zombie Nón Chóp', icon: '🧟👒', hp: 280, speed: 0.32 },
      { type: 'buckethead', name: 'Zombie Xô Sắt', icon: '🧟🪣', hp: 500, speed: 0.30 },
      { type: 'newspaper', name: 'Zombie Báo', icon: '🧟📰', hp: 200, speed: 0.35 },
      { type: 'football', name: 'Zombie Thể Thao', icon: '🧟🏈', hp: 450, speed: 0.55 }
    ];

    let zType = types[0];
    const rand = Math.random();
    if (this.wave === 1) {
      zType = rand < 0.6 ? types[0] : types[1];
    } else if (this.wave === 2) {
      zType = rand < 0.4 ? types[0] : (rand < 0.75 ? types[1] : types[3]);
    } else {
      zType = rand < 0.25 ? types[0] : (rand < 0.55 ? types[1] : (rand < 0.8 ? types[2] : types[4]));
    }

    const canvas = this.container.querySelector('#pvz-canvas');
    const startX = (canvas ? canvas.width : 850) - 20;
    const cellHeight = (canvas ? canvas.height : 440) / 5;

    const zombie = {
      id: `zombie_${Date.now()}_${Math.random()}`,
      type: zType.type,
      name: zType.name,
      icon: zType.icon,
      hp: zType.hp,
      maxHp: zType.hp,
      speed: zType.speed,
      baseSpeed: zType.speed,
      slowTimer: 0,
      row: r,
      col: 8.5,
      x: startX,
      y: r * cellHeight + cellHeight / 2,
      word: wordObj.word,
      pinyin: wordObj.pinyin,
      meaning: wordObj.meaning,
      eatingPlant: null
    };

    this.zombies.push(zombie);
    this.zombiesInWaveLeft--;
  }

  spawnSun(x, y, fromSky = true) {
    this.fallingSuns.push({
      x: x,
      y: y,
      targetY: fromSky ? Math.random() * 260 + 80 : y + 20,
      speedY: fromSky ? 1.2 : -1.5,
      life: 12000 // 12s to collect
    });
  }

  spawnProjectile(plant) {
    const canvas = this.container.querySelector('#pvz-canvas');
    const mowerWidth = 48;
    const canvasWidth = canvas ? canvas.width : 850;
    const canvasHeight = canvas ? canvas.height : 440;
    const cellWidth = (canvasWidth - mowerWidth) / 9;
    const cellHeight = canvasHeight / 5;

    const startX = mowerWidth + (plant.col + 0.8) * cellWidth;
    const startY = plant.row * cellHeight + cellHeight / 2;

    this.projectiles.push({
      x: startX,
      y: startY,
      row: plant.row,
      damage: 20,
      slows: plant.type === 'snowpea',
      color: plant.type === 'snowpea' ? '#38bdf8' : '#22c55e'
    });

    this.sfx.playShoot();
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    const dt = Math.min(50, currentTime - this.lastTime);
    this.lastTime = currentTime;

    if (!this.isPaused) {
      this.update(dt);
    }

    this.draw();
    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    const canvas = this.container.querySelector('#pvz-canvas');
    const mowerWidth = 48;
    const lawnWidth = canvas ? canvas.width : 850;
    const cellWidth = (lawnWidth - mowerWidth) / 9;

    // Update Seed Cooldowns
    Object.keys(this.seedCooldowns).forEach(k => {
      if (this.seedCooldowns[k] > 0) {
        this.seedCooldowns[k] -= dt;
        if (this.seedCooldowns[k] < 0) this.seedCooldowns[k] = 0;
      }
      const cdEl = this.container.querySelector(`#cd-${k}`);
      if (cdEl) {
        const pDef = this.plantDefs[k];
        const pct = (this.seedCooldowns[k] / pDef.cooldown) * 100;
        cdEl.style.height = `${pct}%`;
      }
    });

    // Sun drop from sky every 7s
    this.sunDropTimer += dt;
    if (this.sunDropTimer >= 7000) {
      this.sunDropTimer = 0;
      const rx = Math.random() * (lawnWidth - 200) + 120;
      this.spawnSun(rx, -20, true);
    }

    // Update Falling Suns
    for (let i = this.fallingSuns.length - 1; i >= 0; i--) {
      const sun = this.fallingSuns[i];
      if (sun.y < sun.targetY) {
        sun.y += sun.speedY;
      }
      sun.life -= dt;
      if (sun.life <= 0) {
        this.fallingSuns.splice(i, 1);
      }
    }

    // Update Plants
    this.plants.forEach(p => {
      // Sunflower production
      if (p.type === 'sunflower') {
        p.sunCooldown -= dt;
        if (p.sunCooldown <= 0) {
          p.sunCooldown = 9000;
          const sx = mowerWidth + (p.col + 0.5) * cellWidth;
          const sy = p.row * (canvas.height / 5) + 30;
          this.spawnSun(sx, sy, false);
          this.sfx.playSun();
        }
      }

      // Shooting plants
      if (p.type === 'peashooter' || p.type === 'snowpea' || p.type === 'repeater') {
        p.attackCooldown -= dt;
        // Check if zombie on row ahead
        const hasZombie = this.zombies.some(z => z.row === p.row && z.x > (mowerWidth + p.col * cellWidth));
        if (hasZombie && p.attackCooldown <= 0) {
          p.attackCooldown = 1500;
          this.spawnProjectile(p);
          if (p.type === 'repeater') {
            setTimeout(() => {
              if (this.isRunning && !this.isPaused) this.spawnProjectile(p);
            }, 180);
          }
        }
      }

      // Potato mine arming
      if (p.type === 'potatomine' && !p.armed) {
        p.armTimer -= dt;
        if (p.armTimer <= 0) {
          p.armed = true;
          this.showToast('🥔 Mìn Khoai Tây đã sẵn sàng nổ!');
        }
      }

      // Chomper chewing
      if (p.type === 'chomper' && p.chewingTimer > 0) {
        p.chewingTimer -= dt;
      }
    });

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += 6.5;

      // Check collision with zombies in same row
      let hit = false;
      for (let j = 0; j < this.zombies.length; j++) {
        const z = this.zombies[j];
        if (z.row === proj.row && Math.abs(z.x - proj.x) < 25) {
          z.hp -= proj.damage;
          this.sfx.playHit();
          if (proj.slows) {
            z.slowTimer = 4000;
            z.speed = z.baseSpeed * 0.5;
          }
          this.createExplosionFX(proj.x, proj.y);
          hit = true;
          break;
        }
      }

      if (hit || proj.x > lawnWidth + 50) {
        this.projectiles.splice(i, 1);
      }
    }

    // Spawn Zombies
    if (this.zombiesInWaveLeft > 0) {
      this.zombieSpawnTimer -= dt;
      if (this.zombieSpawnTimer <= 0) {
        this.spawnZombie();
        this.zombieSpawnTimer = Math.random() * 4000 + 4000;
      }
    }

    // Update Zombies
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];

      // Slow timer
      if (z.slowTimer > 0) {
        z.slowTimer -= dt;
        if (z.slowTimer <= 0) {
          z.speed = z.baseSpeed;
        }
      }

      // Check if eating plant
      const colIdx = Math.floor((z.x - mowerWidth) / cellWidth);
      z.col = colIdx;
      const targetPlant = (colIdx >= 0 && colIdx < 9) ? this.grid[z.row][colIdx] : null;

      if (targetPlant) {
        // Potato mine trigger
        if (targetPlant.type === 'potatomine' && targetPlant.armed) {
          this.sfx.playExplode();
          z.hp = 0;
          this.grid[z.row][colIdx] = null;
          this.plants = this.plants.filter(p => p !== targetPlant);
          this.createExplosionFX(z.x, z.y);
          this.showToast('💥 SPUDOW! Mìn khoai tây đã kích nổ!');
          continue;
        }

        // Chomper eating zombie
        if (targetPlant.type === 'chomper' && targetPlant.chewingTimer <= 0) {
          this.sfx.playChomp();
          z.hp = 0;
          targetPlant.chewingTimer = 18000; // Chew for 18s
          this.showToast('🍄 CHOMP! Cây nắp ấm đã nuốt trọn 1 Zombie!');
          continue;
        }

        // Regular biting plant
        targetPlant.hp -= (dt / 1000) * 100;
        this.sfx.playChomp();

        if (targetPlant.hp <= 0) {
          this.grid[z.row][colIdx] = null;
          this.plants = this.plants.filter(p => p !== targetPlant);
        }
      } else {
        // Move forward
        z.x -= z.speed * (dt / 16.66);
      }

      // Check if zombie died
      if (z.hp <= 0) {
        this.zombiesKilled++;
        this.score += 50;
        this.createExplosionFX(z.x, z.y);
        if (window.speakText) window.speakText(z.word);
        this.zombies.splice(i, 1);
        this.updateHUD();
        continue;
      }

      // Check if breached home (x <= mowerWidth + 10)
      if (z.x <= mowerWidth + 10) {
        // Check lawnmower
        if (this.lawnmowers[z.row]) {
          this.lawnmowers[z.row] = false;
          this.updateLawnmowerVisuals();
          this.sfx.playMower();
          this.showToast(`🚜 MÁY CẮT CỎ LÀN ${z.row + 1} ĐÃ KÍCH HOẠT!`);

          this.activeMowers.push({
            row: z.row,
            x: 10,
            speed: 12
          });
        } else {
          // Game Over: Zombies ate brains
          this.gameOver(false);
          return;
        }
      }
    }

    // Update Active Lawnmowers
    for (let i = this.activeMowers.length - 1; i >= 0; i--) {
      const mower = this.activeMowers[i];
      mower.x += mower.speed;

      // Crush zombies on this row
      this.zombies.forEach(z => {
        if (z.row === mower.row && Math.abs(z.x - mower.x) < 50) {
          z.hp = 0;
          this.createExplosionFX(z.x, z.y);
        }
      });

      if (mower.x > lawnWidth + 100) {
        this.activeMowers.splice(i, 1);
      }
    }

    // Check Wave Completion
    if (this.zombiesInWaveLeft <= 0 && this.zombies.length === 0) {
      if (this.wave < this.maxWaves) {
        this.wave++;
        this.zombiesInWaveLeft = 8 + this.wave * 4;
        this.zombieSpawnTimer = 3000;
        this.suns += 100;
        this.showToast(`🚩 ĐỢT ZOMBIE ${this.wave}/${this.maxWaves} ĐANG KÉO ĐẾN! (+100☀️)`);
        this.updateHUD();
      } else {
        // VICTORY!
        this.gameOver(true);
      }
    }

    // Update Particles
    for (let i = this.particleEffects.length - 1; i >= 0; i--) {
      const p = this.particleEffects[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt / 1000;
      if (p.life <= 0) {
        this.particleEffects.splice(i, 1);
      }
    }
  }

  draw() {
    const canvas = this.container.querySelector('#pvz-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const mowerWidth = 48;
    const cellWidth = (canvas.width - mowerWidth) / 9;
    const cellHeight = canvas.height / 5;

    // Draw Plants
    this.plants.forEach(p => {
      const px = mowerWidth + p.col * cellWidth + cellWidth / 2;
      const py = p.row * cellHeight + cellHeight / 2;

      ctx.save();
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.icon, px, py);

      // HP bar if damaged
      if (p.hp < p.maxHp) {
        const bw = 40;
        const bh = 5;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(px - bw / 2, py - 30, bw, bh);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(px - bw / 2, py - 30, (p.hp / p.maxHp) * bw, bh);
      }
      ctx.restore();
    });

    // Draw Projectiles
    this.projectiles.forEach(pr => {
      ctx.save();
      ctx.fillStyle = pr.color;
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = pr.color;
      ctx.shadowBlur = 10;
      ctx.restore();
    });

    // Draw Active Mowers
    this.activeMowers.forEach(m => {
      const my = m.row * cellHeight + cellHeight / 2;
      ctx.save();
      ctx.font = '36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚜💨', m.x, my);
      ctx.restore();
    });

    // Draw Zombies
    this.zombies.forEach(z => {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Zombie Body Icon
      ctx.font = '36px sans-serif';
      if (z.slowTimer > 0) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
      }
      ctx.fillText(z.icon, z.x, z.y);

      // Vocab Speech Banner over Zombie
      const bannerW = 75;
      const bannerH = 34;
      const bx = z.x - bannerW / 2;
      const by = z.y - 48;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = z.slowTimer > 0 ? '#38bdf8' : '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, by, bannerW, bannerH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
      ctx.fillText(z.word, z.x, by + 12);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px sans-serif';
      ctx.fillText(z.pinyin, z.x, by + 24);

      // HP Bar
      const bw = 46;
      const bh = 5;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(z.x - bw / 2, by + bannerH + 3, bw, bh);
      ctx.fillStyle = z.slowTimer > 0 ? '#38bdf8' : '#ef4444';
      ctx.fillRect(z.x - bw / 2, by + bannerH + 3, Math.max(0, (z.hp / z.maxHp) * bw), bh);

      ctx.restore();
    });

    // Draw Falling Suns
    this.fallingSuns.forEach(sun => {
      ctx.save();
      ctx.font = '34px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 15;
      ctx.fillText('☀️', sun.x, sun.y);
      ctx.restore();
    });

    // Draw Particles
    this.particleEffects.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  updateHUD() {
    const sunVal = this.container.querySelector('#pvz-sun-val');
    const scoreVal = this.container.querySelector('#pvz-score-val');
    const waveBadge = this.container.querySelector('#pvz-wave-badge');
    const streakVal = this.container.querySelector('#pvz-streak-val');

    if (sunVal) sunVal.textContent = this.suns;
    if (scoreVal) scoreVal.textContent = this.score;
    if (waveBadge) waveBadge.innerHTML = `<i class="fa-solid fa-skull" style="color: #ef4444;"></i> ĐỢT ${this.wave}/${this.maxWaves}`;
    if (streakVal) streakVal.textContent = `${this.streak} 🔥`;

    // Update affordability of seed cards
    this.container.querySelectorAll('.pvz-seed-card').forEach(card => {
      const type = card.dataset.type;
      const pDef = this.plantDefs[type];
      if (pDef) {
        card.classList.toggle('affordable', this.suns >= pDef.cost);
      }
    });
  }

  bindEvents() {
    const pauseBtn = this.container.querySelector('#pvz-pause-btn');
    const backHubTopBtn = this.container.querySelector('#pvz-back-hub-top-btn');
    const exitBtn = this.container.querySelector('#pvz-exit-btn');
    const shovelBtn = this.container.querySelector('#pvz-shovel-btn');

    if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
    if (backHubTopBtn) {
      backHubTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.stopAndExit();
      });
    }
    if (exitBtn) {
      exitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.stopAndExit();
        if (typeof window.exitNotebookGamesHub === 'function') window.exitNotebookGamesHub();
      });
    }

    if (shovelBtn) {
      shovelBtn.addEventListener('click', () => {
        this.selectedSeedType = this.selectedSeedType === 'shovel' ? null : 'shovel';
        this.updateSeedSelectionUI();
        if (this.selectedSeedType === 'shovel') {
          this.showToast('⛏️ Đã chọn Xẻng: Click vào ô có cây để đào bỏ!');
        }
      });
    }

    // Seed cards selection
    this.container.querySelectorAll('.pvz-seed-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const type = card.dataset.type;
        const pDef = this.plantDefs[type];
        if (!pDef) return;

        if (this.suns < pDef.cost) {
          this.showToast(`⚠️ Không đủ Mặt Trời! Cần ${pDef.cost}☀️ (Hiện có ${this.suns}☀️)`);
          return;
        }

        if (this.seedCooldowns[type] > 0) {
          this.showToast('⏳ Cây đang trong thời gian hồi chiêu!');
          return;
        }

        this.selectedSeedType = this.selectedSeedType === type ? null : type;
        this.updateSeedSelectionUI();
      });
    });
  }

  updateSeedSelectionUI() {
    this.container.querySelectorAll('.pvz-seed-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.type === this.selectedSeedType);
    });
    const shovelBtn = this.container.querySelector('#pvz-shovel-btn');
    if (shovelBtn) {
      shovelBtn.classList.toggle('active', this.selectedSeedType === 'shovel');
    }
  }

  showToast(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseBtn = this.container.querySelector('#pvz-pause-btn');
    if (pauseBtn) {
      pauseBtn.innerHTML = `<i class="fa-solid fa-${this.isPaused ? 'play' : 'pause'}"></i>`;
    }
    this.showToast(this.isPaused ? 'Đã tạm dừng game ⏸' : 'Tiếp tục chơi ▶️');
  }

  gameOver(isVictory) {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    const overlay = this.container.querySelector('#pvz-modal-overlay');
    const icon = this.container.querySelector('#pvz-result-icon');
    const title = this.container.querySelector('#pvz-result-title');
    const desc = this.container.querySelector('#pvz-result-desc');
    const resScore = this.container.querySelector('#pvz-res-score');
    const resKills = this.container.querySelector('#pvz-res-kills');
    const resWords = this.container.querySelector('#pvz-res-words');

    if (overlay) {
      overlay.style.display = 'flex';
      if (icon) icon.textContent = isVictory ? '🌻' : '🧟';
      if (title) title.textContent = isVictory ? 'Bảo Vệ Sân Vườn Thành Công!' : 'Zombies Ate Your Brains!';
      if (desc) desc.textContent = isVictory ? 'Bạn đã xuất sắc đẩy lùi 3 đợt Zombie và củng cố toàn bộ từ vựng!' : 'Đừng nản lòng! Hãy giải từ vựng thật nhanh để có nhiều Mặt Trời trồng cây nhé!';
      if (resScore) resScore.textContent = this.score;
      if (resKills) resKills.textContent = this.zombiesKilled;
      if (resWords) resWords.textContent = this.wordsMasteredCount;

      const retryBtn = overlay.querySelector('#pvz-retry-btn');
      const backHubBtn = overlay.querySelector('#pvz-back-hub-btn');
      const finishBtn = overlay.querySelector('#pvz-finish-btn');

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
    const overlay = this.container.querySelector('#pvz-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    this.start();
  }

  stopAndExit() {
    if (this.isStopping) return;
    this.isStopping = true;
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
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
