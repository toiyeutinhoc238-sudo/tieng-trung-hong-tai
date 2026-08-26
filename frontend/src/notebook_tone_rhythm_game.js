/**
 * Tiếng Trung HongTai - Notebook Mini-Game 5: PHÍM ĐÀN TIẾT TẤU THANH ĐIỆU (Tone Rhythm Master)
 * Đầy đủ 5 Thanh Điệu (Thanh 1, 2, 3, 4 + Thanh Nhẹ 0) & Hỗ trợ bóc tách từ ghép đa âm tiết
 */

// Helper: Extract tone number (1, 2, 3, 4, or 0 for neutral tone)
function extractToneFromSyllable(syllable) {
  if (!syllable) return 0;
  const s = syllable.toLowerCase().trim();

  // Tone 1: ā ē ī ō ū ǖ
  if (/[āēīōūǖ]/.test(s)) return 1;
  // Tone 2: á é í ó ú ǘ
  if (/[áéíóúǘ]/.test(s)) return 2;
  // Tone 3: ǎ ě ǐ ǒ ǔ ǚ
  if (/[ǎěǐǒǔǚ]/.test(s)) return 3;
  // Tone 4: à è ì ò ù ǜ
  if (/[àèìòùǜ]/.test(s)) return 4;

  // Numerical tone format (e.g. ma1, ni3, men0, men5)
  const numMatch = s.match(/([0-5])$/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    return (num >= 1 && num <= 4) ? num : 0;
  }

  // No tone mark -> Tone 0 (Thanh nhẹ / Khinh thanh)
  return 0;
}

// Helper: Decompose any Chinese vocabulary word (single or compound word) into individual syllable beats
function decomposeWordToSyllables(wordItem) {
  if (!wordItem) return [];
  const word = (wordItem.word || wordItem.char || '').trim();
  const pinyin = (wordItem.pinyin || '').trim();
  const meaning = (wordItem.meaning || wordItem.vn || '').trim();

  const chars = Array.from(word);
  if (chars.length === 0) return [];

  if (chars.length === 1) {
    const tone = extractToneFromSyllable(pinyin);
    return [{
      char: chars[0],
      pinyin: pinyin,
      tone: tone,
      fullWord: word,
      meaning: meaning
    }];
  }

  // Check if pinyin contains space/apostrophe delimiters (e.g. "nǐ men", "méi guān xi")
  const spaceParts = pinyin.split(/[\s']+/).filter(Boolean);
  if (spaceParts.length === chars.length) {
    return chars.map((c, idx) => ({
      char: c,
      pinyin: spaceParts[idx],
      tone: extractToneFromSyllable(spaceParts[idx]),
      fullWord: word,
      meaning: meaning
    }));
  }

  // Continuous pinyin string matching (e.g. "nǐmen", "méiguānxi", "xièxie", "zàijiàn")
  const pinyinRegex = /([bcdfghjklmnpqrstwxyzBCDFGHJKLMNPQRSTWXYZ]*[aāáǎàeēéěèiīíǐìoōóǒòuūúǔùüǖǘǚǜ]+(?:ng|n|r)?)/gi;
  const matches = pinyin.match(pinyinRegex) || [];

  if (matches.length === chars.length) {
    return chars.map((c, idx) => ({
      char: c,
      pinyin: matches[idx],
      tone: extractToneFromSyllable(matches[idx]),
      fullWord: word,
      meaning: meaning
    }));
  }

  // Fallback: distribute evenly
  return chars.map((c, idx) => {
    const py = matches[idx] || (idx === 0 ? pinyin : '');
    return {
      char: c,
      pinyin: py,
      tone: extractToneFromSyllable(py),
      fullWord: word,
      meaning: meaning
    };
  });
}

// Sound Synthesizer for 5 Chinese Tones
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

  playToneTrack(lane) {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (lane === 1) {
        // Tone 1: High sustained horizontal pitch (523.25 Hz - C5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (lane === 2) {
        // Tone 2: Rising pitch (G4 -> D5)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(392.00, now);
        osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.18);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (lane === 3) {
        // Tone 3: Dip down and bounce up (F4 -> C4 -> A4)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(349.23, now);
        osc.frequency.linearRampToValueAtTime(261.63, now + 0.09);
        osc.frequency.exponentialRampToValueAtTime(440.00, now + 0.22);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.24);
      } else if (lane === 4) {
        // Tone 4: Sharp falling pitch (E5 -> C4)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.16);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } else {
        // Tone 0 (Thanh Nhẹ / Khinh thanh): Short, soft wooden pop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(783.99, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    } catch (e) {}
  }

  playPerfectChord() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.03);
        gain.gain.setValueAtTime(0.12, now + i * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.03 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.03);
        osc.stop(now + i * 0.03 + 0.25);
      });
    } catch (e) {}
  }

  playMiss() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.22);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  playFever() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.05);
        gain.gain.setValueAtTime(0.15, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.35);
      });
    } catch (e) {}
  }
}

// Fallback vocabulary covering all 5 tones (Thanh 1, 2, 3, 4, and Thanh Nhẹ 0)
const DEFAULT_RHYTHM_VOCAB = [
  { word: '妈妈', pinyin: 'māma', meaning: 'mẹ' },
  { word: '爸爸', pinyin: 'bàba', meaning: 'bố' },
  { word: '你们', pinyin: 'nǐmen', meaning: 'các bạn' },
  { word: '他们', pinyin: 'tāmen', meaning: 'họ, bọn họ' },
  { word: '没关系', pinyin: 'méi guān xi', meaning: 'không có gì' },
  { word: '谢谢', pinyin: 'xièxie', meaning: 'cảm ơn' },
  { word: '再见', pinyin: 'zàijiàn', meaning: 'tạm biệt' },
  { word: '学习', pinyin: 'xuéxí', meaning: 'học tập' },
  { word: '你好', pinyin: 'nǐhǎo', meaning: 'xin chào' },
  { word: '老师', pinyin: 'lǎoshī', meaning: 'thầy cô giáo' },
  { word: '苹果', pinyin: 'píngguǒ', meaning: 'quả táo' },
  { word: '西瓜', pinyin: 'xīguā', meaning: 'dưa hấu' },
  { word: '中国', pinyin: 'zhōngguó', meaning: 'Trung Quốc' },
  { word: '喜欢', pinyin: 'xǐhuan', meaning: 'thích' },
  { word: '桌子', pinyin: 'zhuōzi', meaning: 'cái bàn' },
  { word: '朋友', pinyin: 'péngyou', meaning: 'bạn bè' },
  { word: '好吗', pinyin: 'hǎo ma', meaning: 'được không' }
];

export class ToneRhythmGameEngine {
  constructor(containerEl, wordsList, onExitCallback) {
    this.container = containerEl;
    this.rawWords = (wordsList && wordsList.length >= 2) ? wordsList : DEFAULT_RHYTHM_VOCAB;
    this.onExit = onExitCallback;
    this.sfx = new RhythmSoundFX();

    // Decompose all words into flat syllable beats
    this.syllableDeck = [];
    this.buildSyllableDeck();

    // Speed setting: 'easy' (50 px/s, 2400ms), 'normal' (80 px/s, 1600ms), 'hard' (125 px/s, 1100ms)
    this.speedMode = 'easy';
    this.baseSpeed = 50;
    this.spawnIntervalMs = 2400;
    this.maxLives = 5;
    this.maxActiveNotes = 3;
    this.speedGrowth = 0.08;

    // Game display modes: 'normal' | 'hide-pinyin' | 'hide-hanzi' | 'listen-only'
    this.gameMode = 'normal';

    // Game state
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = 5;
    this.timeLeft = 60;
    this.isPaused = false;
    this.isRunning = false;
    this.isStopping = false;
    this.isFeverMode = false;
    this.correctWordsSet = new Set();

    this.notesHitCount = 0;
    this.activeNotes = [];
    this.spawnTimer = 0;
    this.deckIndex = 0;
    this.lastFrameTime = 0;

    this.timerInterval = null;
    this.animFrameId = null;
    this.countdownTimer = null;

    this.renderLayout();
    this.bindEvents();
  }

  buildSyllableDeck() {
    this.syllableDeck = [];
    // Shuffle raw words once to ensure no duplicate repetitions
    const shuffled = [...this.rawWords].sort(() => Math.random() - 0.5);
    shuffled.forEach(w => {
      const syllables = decomposeWordToSyllables(w);
      this.syllableDeck.push(...syllables);
    });
    this.totalSyllablesCount = this.syllableDeck.length;
    this.deckIndex = 0;
  }

  getNextSyllable() {
    if (this.deckIndex >= this.syllableDeck.length) {
      return null;
    }
    const item = this.syllableDeck[this.deckIndex];
    this.deckIndex++;
    return item;
  }

  setSpeed(mode) {
    this.speedMode = mode;
    if (mode === 'easy') {
      this.baseSpeed = 50;
      this.spawnIntervalMs = 2400;
      this.maxLives = 5;
      this.maxActiveNotes = 3;
      this.speedGrowth = 0.08;
    } else if (mode === 'normal') {
      this.baseSpeed = 80;
      this.spawnIntervalMs = 1600;
      this.maxLives = 4;
      this.maxActiveNotes = 4;
      this.speedGrowth = 0.18;
    } else if (mode === 'hard') {
      this.baseSpeed = 125;
      this.spawnIntervalMs = 1100;
      this.maxLives = 3;
      this.maxActiveNotes = 5;
      this.speedGrowth = 0.32;
    }

    if (!this.isRunning) {
      this.lives = this.maxLives;
      this.updateHUD();
    }

    // Update active speeds of any existing notes
    this.activeNotes.forEach(note => {
      note.speed = this.calculateCurrentSpeed();
    });

    // Sync in-game speed buttons
    this.container.querySelectorAll('.speed-opt-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.speed === mode);
    });

    // Sync start screen difficulty cards
    this.container.querySelectorAll('.start-diff-card').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.speed === mode);
    });
  }

  calculateCurrentSpeed() {
    return this.baseSpeed + (60 - this.timeLeft) * this.speedGrowth;
  }

  setGameMode(mode) {
    this.gameMode = mode;
    this.container.querySelectorAll('.rhythm-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    this.container.querySelectorAll('.start-mode-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Re-render active notes with new display mode
    this.activeNotes.forEach(note => {
      if (note.el) {
        note.el.className = `rhythm-falling-note mode-${this.gameMode}`;
        note.el.innerHTML = this.renderNoteHtml(note.syllable);
      }
    });

    const modeLabels = {
      'normal': 'Bình thường (Hiện đủ Hán + Pinyin)',
      'hide-pinyin': 'Ẩn Pinyin (Chỉ nhìn Chữ Hán)',
      'hide-hanzi': 'Ẩn Chữ Hán (Chỉ nhìn Pinyin)',
      'listen-only': '👑 VIP Luyện Nghe (Ẩn cả Hán + Pinyin, nghe âm thanh để chọn thanh)'
    };
    this.showToast(`🎯 Chế độ: ${modeLabels[mode] || mode}`);

    if (mode === 'listen-only' && this.activeNotes.length > 0 && typeof window.speakText === 'function') {
      const topNote = this.activeNotes.filter(n => !n.hit).sort((a, b) => b.y - a.y)[0];
      if (topNote) {
        try { window.speakText(topNote.syllable.char); } catch(e) {}
      }
    }
  }

  renderNoteHtml(syllable) {
    if (this.gameMode === 'hide-pinyin') {
      return `
        <div class="note-char">${syllable.char}</div>
        <div class="note-pinyin note-hidden-pinyin"><i class="fa-solid fa-eye-slash"></i> Ẩn Pinyin</div>
        <div class="note-word-ctx" title="${syllable.fullWord}: ${syllable.meaning}">[${syllable.fullWord}]</div>
      `;
    } else if (this.gameMode === 'hide-hanzi') {
      return `
        <div class="note-char note-hidden-hanzi">❓</div>
        <div class="note-pinyin">[ ${syllable.pinyin} ]</div>
        <div class="note-word-ctx" title="${syllable.meaning}">[${syllable.meaning}]</div>
      `;
    } else if (this.gameMode === 'listen-only') {
      return `
        <div class="note-char note-listen-icon"><i class="fa-solid fa-headphones"></i></div>
        <div class="note-pinyin note-listen-txt">🎧 Nghe chọn thanh</div>
        <div class="note-word-ctx" title="Đang phát âm...">🔊 [Đang đọc]</div>
      `;
    } else {
      // Normal mode: Both Hanzi & Pinyin
      return `
        <div class="note-char">${syllable.char}</div>
        <div class="note-pinyin">[ ${syllable.pinyin} ]</div>
        <div class="note-word-ctx" title="${syllable.fullWord}: ${syllable.meaning}">[${syllable.fullWord}]</div>
      `;
    }
  }

  getLaneIndexForTone(tone) {
    if (tone === 1) return 0; // Column 1 - Pad 1 (Thanh 1)
    if (tone === 2) return 1; // Column 2 - Pad 2 (Thanh 2)
    if (tone === 3) return 2; // Column 3 - Pad 3 (Thanh 3)
    if (tone === 4) return 3; // Column 4 - Pad 4 (Thanh 4)
    return 4; // Column 5 - Pad 0 (Thanh Nhẹ)
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="rhythm-game-wrapper">
        <!-- TOP HUD -->
        <div class="rhythm-hud-bar">
          <button type="button" id="rhythm-top-back-btn" class="btn btn-outline btn-sm">
            <i class="fa-solid fa-arrow-left"></i> Quay lại chọn game
          </button>

          <div class="hud-item-title">
            <span class="hud-icon">🎵</span>
            <strong>PHÍM ĐÀN THANH ĐIỆU</strong>
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
              <i class="fa-solid fa-heart" style="color: #ef4444;"></i>
              <i class="fa-solid fa-heart" style="color: #ef4444;"></i>
            </div>
          </div>

          <div class="hud-item hud-timer" title="Thời gian đếm ngược của màn chơi này">
            <i class="fa-solid fa-clock" style="color: #0284c7;"></i>
            <span class="hud-label">THỜI GIAN:</span>
            <span class="hud-value" id="rhythm-timer-val">01:00</span>
          </div>

          <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
            <button type="button" id="rhythm-guide-btn" class="btn btn-outline btn-sm" title="Hướng dẫn cách chơi">
              <i class="fa-solid fa-circle-question"></i> Luật chơi
            </button>
            <button type="button" id="rhythm-pause-btn" class="btn btn-outline btn-sm" title="Tạm dừng"><i class="fa-solid fa-pause"></i></button>
            <button type="button" id="rhythm-exit-btn" class="btn btn-outline btn-sm" title="Thoát về sổ tay"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>

        <!-- RHYTHM MODE & SPEED CONTROLS BAR -->
        <div class="rhythm-controls-bar">
          <div class="rhythm-mode-selector-wrap">
            <span class="control-label"><i class="fa-solid fa-layer-group" style="color: #0284c7;"></i> Chế độ:</span>
            <div class="rhythm-mode-tabs">
              <button type="button" class="rhythm-mode-btn active" data-mode="normal" title="Hiện đầy đủ cả Chữ Hán và Pinyin">
                <i class="fa-solid fa-eye"></i> Bình thường
              </button>
              <button type="button" class="rhythm-mode-btn" data-mode="hide-pinyin" title="Ẩn Pinyin, chỉ nhìn Chữ Hán để chọn thanh điệu">
                <i class="fa-solid fa-eye-slash"></i> Ẩn Pinyin
              </button>
              <button type="button" class="rhythm-mode-btn" data-mode="hide-hanzi" title="Ẩn Chữ Hán, chỉ nhìn Pinyin">
                <i class="fa-solid fa-font"></i> Ẩn Chữ Hán
              </button>
              <button type="button" class="rhythm-mode-btn vip-btn" data-mode="listen-only" title="Ẩn cả Hán & Pinyin, phát âm thanh để luyện nghe và chọn thanh điệu">
                <i class="fa-solid fa-headphones"></i> 👑 VIP Luyện Nghe
              </button>
            </div>
          </div>

          <div class="rhythm-speed-wrap">
            <span class="control-label"><i class="fa-solid fa-gauge-high" style="color: #059669;"></i> Tốc độ:</span>
            <div class="rhythm-speed-tabs">
              <button type="button" class="speed-opt-btn active" data-speed="easy">🐢 Dễ</button>
              <button type="button" class="speed-opt-btn" data-speed="normal">🚶 Vừa</button>
              <button type="button" class="speed-opt-btn" data-speed="hard">⚡ Nhanh</button>
            </div>
          </div>
        </div>

        <!-- MAIN HIGHWAY TRACK -->
        <div class="rhythm-arena-container">
          <!-- FEVER BANNER -->
          <div class="rhythm-fever-banner" id="rhythm-fever-banner" style="display: none;">
            🔥 FEVER MODE x4 SCORE! 🔥
          </div>

          <!-- 5 LANES TRACK HIGHWAY -->
          <div class="rhythm-highway" id="rhythm-highway">
            <!-- 5 LANES BACKGROUND TRACKS -->
            <div class="rhythm-highway-lanes">
              <div class="highway-lane-track lane-1-bg"></div>
              <div class="highway-lane-track lane-2-bg"></div>
              <div class="highway-lane-track lane-3-bg"></div>
              <div class="highway-lane-track lane-4-bg"></div>
              <div class="highway-lane-track lane-0-bg"></div>
            </div>

            <!-- FALLING NOTES LAYER -->
            <div class="rhythm-notes-layer" id="rhythm-notes-layer"></div>

            <!-- READY COUNTDOWN OVERLAY -->
            <div class="rhythm-countdown-overlay" id="rhythm-countdown-overlay" style="display: none;">
              <div class="countdown-num" id="rhythm-countdown-text">3</div>
            </div>

            <!-- JUDGMENT / HIT ZONE LINE -->
            <div class="rhythm-hit-zone" id="rhythm-hit-zone">
              <div class="hit-indicator hit-lane-1" id="hit-beam-1"></div>
              <div class="hit-indicator hit-lane-2" id="hit-beam-2"></div>
              <div class="hit-indicator hit-lane-3" id="hit-beam-3"></div>
              <div class="hit-indicator hit-lane-4" id="hit-beam-4"></div>
              <div class="hit-indicator hit-lane-0" id="hit-beam-0"></div>
            </div>

            <!-- 5 HIT BUTTON PADS AT BOTTOM -->
            <div class="rhythm-pads-row">
              <!-- Lane 1: Tone 1 -->
              <button type="button" class="rhythm-pad pad-1" data-lane="1" id="pad-1" title="Thanh 1 (Âm ngang —)">
                <span class="pad-symbol">—</span>
                <span class="pad-title">THANH 1</span>
                <span class="pad-key">Phím 1 / A</span>
              </button>

              <!-- Lane 2: Tone 2 -->
              <button type="button" class="rhythm-pad pad-2" data-lane="2" id="pad-2" title="Thanh 2 (Âm sắc ／)">
                <span class="pad-symbol">／</span>
                <span class="pad-title">THANH 2</span>
                <span class="pad-key">Phím 2 / S</span>
              </button>

              <!-- Lane 3: Tone 3 -->
              <button type="button" class="rhythm-pad pad-3" data-lane="3" id="pad-3" title="Thanh 3 (Âm hỏi ∨)">
                <span class="pad-symbol">∨</span>
                <span class="pad-title">THANH 3</span>
                <span class="pad-key">Phím 3 / D</span>
              </button>

              <!-- Lane 4: Tone 4 -->
              <button type="button" class="rhythm-pad pad-4" data-lane="4" id="pad-4" title="Thanh 4 (Âm huyền ＼)">
                <span class="pad-symbol">＼</span>
                <span class="pad-title">THANH 4</span>
                <span class="pad-key">Phím 4 / F</span>
              </button>

              <!-- Lane 0: Tone 0 (Thanh Nhẹ) -->
              <button type="button" class="rhythm-pad pad-0" data-lane="0" id="pad-0" title="Thanh Nhẹ (Khinh thanh •)">
                <span class="pad-symbol">•</span>
                <span class="pad-title">THANH NHẸ</span>
                <span class="pad-key">Phím 5 / Space</span>
              </button>
            </div>
          </div>
        </div>

        <!-- START / DIFFICULTY SELECTION MODAL OVERLAY -->
        <div id="rhythm-start-overlay" class="rhythm-start-overlay" style="display: flex;">
          <div class="rhythm-start-card">
            <div class="start-card-hero">
              <span class="hero-icon">🎵</span>
              <h2>PHÍM ĐÀN THANH ĐIỆU</h2>
              <p class="hero-sub">Luyện phản xạ 5 thanh điệu tiếng Trung chuẩn HSK (Thanh 1, 2, 3, 4 & Thanh Nhẹ)</p>
            </div>

            <!-- CHỌN ĐỘ KHÓ (TỐC ĐỘ RƠI) -->
            <div class="start-section-box">
              <div class="section-title">
                <i class="fa-solid fa-gauge-high" style="color: #059669;"></i>
                <span>1. CHỌN ĐỘ KHÓ (TỐC ĐỘ RƠI NỐT):</span>
              </div>
              <div class="start-difficulty-grid">
                <button type="button" class="start-diff-card active" data-speed="easy">
                  <div class="diff-badge badge-easy">🐢 DỄ (Khuyên dùng)</div>
                  <div class="diff-speed-desc">Tốc độ chậm rãi, 5 Tim ❤️</div>
                  <div class="diff-detail">Nốt rơi thong thả (~8.5s), tha hồ nhìn chữ Hán & nhận diện thanh điệu!</div>
                </button>
                <button type="button" class="start-diff-card" data-speed="normal">
                  <div class="diff-badge badge-normal">🚶 VỪA (Tiêu chuẩn)</div>
                  <div class="diff-speed-desc">Nhịp điệu vừa phải, 4 Tim ❤️</div>
                  <div class="diff-detail">Cân bằng giữa quan sát chữ và phản xạ ngón tay (~5.5s)!</div>
                </button>
                <button type="button" class="start-diff-card" data-speed="hard">
                  <div class="diff-badge badge-hard">⚡ KHÓ (Siêu tốc)</div>
                  <div class="diff-speed-desc">Tốc độ nhanh, 3 Tim ❤️</div>
                  <div class="diff-detail">Dành cho cao thủ luyện phản xạ và nhận diện thần tốc (~3.5s)!</div>
                </button>
              </div>
            </div>

            <!-- CHỌN CHẾ ĐỘ HIỂN THỊ -->
            <div class="start-section-box">
              <div class="section-title">
                <i class="fa-solid fa-layer-group" style="color: #0284c7;"></i>
                <span>2. CHỌN CHẾ ĐỘ HIỂN THỊ:</span>
              </div>
              <div class="start-modes-grid">
                <button type="button" class="start-mode-pill active" data-mode="normal">
                  <i class="fa-solid fa-eye"></i> Bình thường (Hiện cả Chữ & Pinyin)
                </button>
                <button type="button" class="start-mode-pill" data-mode="hide-pinyin">
                  <i class="fa-solid fa-eye-slash"></i> Ẩn Pinyin (Chỉ nhìn Chữ Hán)
                </button>
                <button type="button" class="start-mode-pill" data-mode="hide-hanzi">
                  <i class="fa-solid fa-font"></i> Ẩn Chữ Hán (Chỉ nhìn Pinyin)
                </button>
                <button type="button" class="start-mode-pill vip-pill" data-mode="listen-only">
                  <i class="fa-solid fa-headphones"></i> 👑 VIP Luyện Nghe (Nghe âm thanh)
                </button>
              </div>
            </div>

            <!-- HƯỚNG DẪN PHÍM BẤM -->
            <div class="start-keys-bar">
              <div class="key-pill pill-1"><span class="k-code">1 / A</span> <span class="k-name">Thanh 1 (—)</span></div>
              <div class="key-pill pill-2"><span class="k-code">2 / S</span> <span class="k-name">Thanh 2 (／)</span></div>
              <div class="key-pill pill-3"><span class="k-code">3 / D</span> <span class="k-name">Thanh 3 (∨)</span></div>
              <div class="key-pill pill-4"><span class="k-code">4 / F</span> <span class="k-name">Thanh 4 (＼)</span></div>
              <div class="key-pill pill-0"><span class="k-code">5 / Space</span> <span class="k-name">Thanh Nhẹ (•)</span></div>
            </div>

            <div class="start-actions-row">
              <button type="button" id="rhythm-start-launch-btn" class="btn btn-primary start-play-btn">
                <i class="fa-solid fa-play"></i> BẮT ĐẦU CHƠI NGAY 🚀
              </button>
              <button type="button" id="rhythm-start-guide-btn" class="btn btn-secondary start-sub-btn">
                <i class="fa-solid fa-circle-question"></i> Luật Chơi
              </button>
              <button type="button" id="rhythm-start-back-btn" class="btn btn-outline start-sub-btn">
                <i class="fa-solid fa-arrow-left"></i> Quay Lại
              </button>
            </div>
          </div>
        </div>

        <!-- HOW-TO-PLAY GUIDE MODAL -->
        <div id="rhythm-guide-overlay" class="rhythm-guide-overlay" style="display: none;">
          <div class="rhythm-guide-card">
            <div class="rhythm-guide-header">
              <h3 class="rhythm-guide-title">
                <i class="fa-solid fa-music"></i> Hướng Dẫn: Phím Đàn Thanh Điệu
              </h3>
              <button type="button" id="rhythm-guide-close-btn" class="btn btn-outline btn-sm">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div class="rhythm-guide-body">
              <p>🎯 <strong>Mục tiêu:</strong> Nhìn nốt chữ Hán & Pinyin đang trôi xuống theo từng cột thanh điệu. Khi nốt chạm vào <strong>Vạch Bắt Nhịp</strong> ở đáy, hãy bấm phím hoặc nút tương ứng.</p>

              <table class="guide-tone-table">
                <thead>
                  <tr>
                    <th>Phím</th>
                    <th>Thanh Điệu</th>
                    <th>Dấu Pinyin</th>
                    <th>Ví dụ mẫu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong style="color: #0284c7;">Phím 1 / A</strong></td>
                    <td>Thanh 1 (Ngang —)</td>
                    <td><code>ā, ē, ī, ō, ū, ǖ</code></td>
                    <td><code>mā</code> (mẹ), <code>bā</code> (tám)</td>
                  </tr>
                  <tr>
                    <td><strong style="color: #059669;">Phím 2 / S</strong></td>
                    <td>Thanh 2 (Sắc ／)</td>
                    <td><code>á, é, í, ó, ú, ǘ</code></td>
                    <td><code>má</code> (tê), <code>xué</code> (học)</td>
                  </tr>
                  <tr>
                    <td><strong style="color: #d97706;">Phím 3 / D</strong></td>
                    <td>Thanh 3 (Hỏi ∨)</td>
                    <td><code>ǎ, ě, ǐ, ǒ, ǔ, ǚ</code></td>
                    <td><code>nǐ</code> (bạn), <code>hǎo</code> (tốt)</td>
                  </tr>
                  <tr>
                    <td><strong style="color: #e11d48;">Phím 4 / F</strong></td>
                    <td>Thanh 4 (Huyền ＼)</td>
                    <td><code>à, è, ì, ò, ù, ǜ</code></td>
                    <td><code>bà</code> (bố), <code>zài</code> (ở)</td>
                  </tr>
                  <tr>
                    <td><strong style="color: #7c3aed;">Phím 5 / Space</strong></td>
                    <td><strong>Thanh Nhẹ (Khinh thanh •)</strong></td>
                    <td><strong>Không có dấu</strong></td>
                    <td><code>men</code> (trong <code>nǐmen</code>), <code>ma</code> (trong <code>māma</code>)</td>
                  </tr>
                </tbody>
              </table>

              <div class="guide-modes-box">
                💡 <strong>4 Chế độ chơi đa dạng:</strong><br/>
                <ul>
                  <li><strong>Bình thường:</strong> Hiện đủ cả Chữ Hán và Pinyin.</li>
                  <li><strong>Ẩn Pinyin:</strong> Chỉ hiện chữ Hán, thử thách bạn nhớ thanh điệu!</li>
                  <li><strong>Ẩn Chữ Hán:</strong> Chỉ hiện Pinyin để bạn đoán thanh và mặt chữ.</li>
                  <li><strong>👑 VIP Luyện Nghe:</strong> Ẩn cả Hán & Pinyin, nốt rơi sẽ tự động phát âm thanh để bạn nghe và bấm đúng thanh điệu!</li>
                </ul>
              </div>

              <div style="text-align: center; margin-top: 16px;">
                <button type="button" id="rhythm-guide-start-btn" class="btn btn-primary start-play-btn">
                  Đã Hiểu - Bắt Đầu Chơi! 🚀
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- RESULT MODAL OVERLAY -->
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

            <!-- BẢNG TỔNG KẾT TỪ VỰNG ĐÚNG / SAI -->
            <div id="rhythm-words-summary-wrap"></div>

            <div class="result-beta-note">
              <i class="fa-solid fa-flask"></i> <strong>Chế độ luyện phản xạ:</strong> Bắt trọn vẹn cả 4 thanh điệu chính và thanh nhẹ trong tiếng Trung chuẩn HSK.
            </div>

            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 14px; flex-wrap: wrap;">
              <button type="button" id="rhythm-retry-btn" class="btn btn-primary" style="padding: 10px 20px; font-weight: 800;"><i class="fa-solid fa-rotate-right"></i> Chơi Lại</button>
              <button type="button" id="rhythm-back-hub-btn" class="btn btn-secondary" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-gamepad"></i> Đổi Trò Chơi</button>
              <button type="button" id="rhythm-finish-btn" class="btn btn-outline" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-book-bookmark"></i> Thoát</button>
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
    const guideBtn = this.container.querySelector('#rhythm-guide-btn');
    const guideOverlay = this.container.querySelector('#rhythm-guide-overlay');
    const guideCloseBtn = this.container.querySelector('#rhythm-guide-close-btn');
    const guideStartBtn = this.container.querySelector('#rhythm-guide-start-btn');

    const startOverlay = this.container.querySelector('#rhythm-start-overlay');
    const startLaunchBtn = this.container.querySelector('#rhythm-start-launch-btn');
    const startGuideBtn = this.container.querySelector('#rhythm-start-guide-btn');
    const startBackBtn = this.container.querySelector('#rhythm-start-back-btn');

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
        if (this.isRunning) this.isPaused = false;
      });
    }
    if (guideStartBtn && guideOverlay) {
      guideStartBtn.addEventListener('click', () => {
        guideOverlay.style.display = 'none';
        if (!this.isRunning) {
          if (startOverlay) startOverlay.style.display = 'none';
          this.beginActualGame();
        } else {
          this.isPaused = false;
        }
      });
    }

    // Start Screen difficulty selection cards
    this.container.querySelectorAll('.start-diff-card').forEach(card => {
      card.addEventListener('click', () => {
        const speed = card.dataset.speed;
        this.setSpeed(speed);
        this.showToast(`Đã chọn độ khó: ${card.querySelector('.diff-badge')?.textContent.trim() || speed}`);
      });
    });

    // Start Screen game mode pills
    this.container.querySelectorAll('.start-mode-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const mode = pill.dataset.mode;
        this.setGameMode(mode);
      });
    });

    // Start Screen Launch Button
    if (startLaunchBtn) {
      startLaunchBtn.addEventListener('click', () => {
        if (startOverlay) startOverlay.style.display = 'none';
        this.beginActualGame();
      });
    }

    // Start Screen Guide & Back Buttons
    if (startGuideBtn && guideOverlay) {
      startGuideBtn.addEventListener('click', () => {
        guideOverlay.style.display = 'flex';
      });
    }
    if (startBackBtn) {
      startBackBtn.addEventListener('click', () => {
        this.stopAndExit();
      });
    }

    // Toolbar Mode selector buttons (Bình thường / Ẩn Pinyin / Ẩn Chữ Hán / VIP Luyện Nghe)
    this.container.querySelectorAll('.rhythm-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setGameMode(btn.dataset.mode);
      });
    });

    // Toolbar Speed selector buttons
    this.container.querySelectorAll('.speed-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setSpeed(btn.dataset.speed);
        this.showToast(`Đã chọn tốc độ: ${btn.textContent.trim()}`);
      });
    });

    // Touch and click on 5 lane pads
    this.container.querySelectorAll('.rhythm-pad').forEach(pad => {
      const lane = parseInt(pad.dataset.lane, 10);
      const handleTrigger = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.triggerLaneHit(lane);
      };
      pad.addEventListener('touchstart', handleTrigger, { passive: false });
      pad.addEventListener('pointerdown', handleTrigger);
    });

    // Keyboard handlers (1,2,3,4,5 or A,S,D,F,Space or D,F,J,K,L)
    this.keyHandler = (e) => {
      if (!this.isRunning || this.isPaused) return;
      const key = e.key.toLowerCase();
      const code = e.code;

      if (key === '1' || key === 'a') {
        this.triggerLaneHit(1);
        e.preventDefault();
      } else if (key === '2' || key === 's') {
        this.triggerLaneHit(2);
        e.preventDefault();
      } else if (key === '3' || (key === 'd' && !e.ctrlKey)) {
        this.triggerLaneHit(3);
        e.preventDefault();
      } else if (key === '4' || key === 'f') {
        this.triggerLaneHit(4);
        e.preventDefault();
      } else if (key === '5' || key === ' ' || code === 'Space' || key === 'l' || key === 'g') {
        this.triggerLaneHit(0);
        e.preventDefault();
      } else if (key === 'p' || code === 'Escape') {
        this.togglePause();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', this.keyHandler);
  }

  start() {
    // When start() is called, show the Start / Difficulty selection screen
    const startOverlay = this.container.querySelector('#rhythm-start-overlay');
    if (startOverlay) {
      startOverlay.style.display = 'flex';
    }
    const resultOverlay = this.container.querySelector('#rhythm-modal-overlay');
    if (resultOverlay) {
      resultOverlay.style.setProperty('display', 'none', 'important');
    }
    this.updateHUD();
  }

  beginActualGame() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.countdownTimer) {
      clearTimeout(this.countdownTimer);
      this.countdownTimer = null;
    }

    this.isStopping = false;
    this.isRunning = true;
    this.isPaused = false;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = this.maxLives;
    this.timeLeft = 60;
    this.notesHitCount = 0;
    this.activeNotes = [];
    this.spawnTimer = 0;
    this.correctWordsSet = new Set();
    this.buildSyllableDeck();

    const startOverlay = this.container.querySelector('#rhythm-start-overlay');
    if (startOverlay) startOverlay.style.display = 'none';

    const overlay = this.container.querySelector('#rhythm-modal-overlay');
    if (overlay) overlay.style.setProperty('display', 'none', 'important');

    const layer = this.container.querySelector('#rhythm-notes-layer');
    if (layer) layer.innerHTML = '';

    this.updateHUD();

    // Start 3-2-1 countdown before game starts
    this.runCountdown(() => {
      if (!this.isRunning || this.isStopping) return;
      this.lastFrameTime = performance.now();
      this.startTimers();
      this.loop(performance.now());
    });
  }

  runCountdown(onComplete) {
    const overlay = this.container.querySelector('#rhythm-countdown-overlay');
    const textEl = this.container.querySelector('#rhythm-countdown-text');
    if (!overlay || !textEl) {
      onComplete();
      return;
    }

    let count = 3;
    overlay.style.display = 'flex';
    textEl.textContent = '3';

    const countInterval = setInterval(() => {
      count--;
      if (count > 0) {
        textEl.textContent = String(count);
      } else if (count === 0) {
        textEl.textContent = 'BẮT ĐẦU!';
        textEl.style.fontSize = '3rem';
      } else {
        clearInterval(countInterval);
        overlay.style.display = 'none';
        textEl.style.fontSize = '4.5rem';
        onComplete();
      }
    }, 700);
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
    if (this.activeNotes.length >= this.maxActiveNotes) return;
    const syllable = this.getNextSyllable();
    if (!syllable) {
      if (this.activeNotes.length === 0) {
        this.gameOver(true);
      }
      return;
    }

    const noteId = 'rnote_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const speed = this.calculateCurrentSpeed();
    const laneIndex = this.getLaneIndexForTone(syllable.tone);

    const note = {
      id: noteId,
      syllable: syllable,
      laneIndex: laneIndex,
      y: -75,
      speed: speed,
      hit: false,
      hasSpoken: false,
      el: null
    };

    const layer = this.container.querySelector('#rhythm-notes-layer');
    if (!layer) return;

    const el = document.createElement('div');
    el.className = `rhythm-falling-note mode-${this.gameMode}`;
    el.id = noteId;

    el.style.left = `${laneIndex * 20 + 0.75}%`;
    el.style.top = `-75px`;
    el.innerHTML = this.renderNoteHtml(syllable);

    // Click on note card to speak pronunciation if desired
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof window.speakText === 'function') {
        window.speakText(syllable.char);
      }
    });

    layer.appendChild(el);
    note.el = el;
    this.activeNotes.push(note);

    // If VIP Listen-Only Mode: Auto-pronounce syllable as soon as it spawns!
    if (this.gameMode === 'listen-only' && typeof window.speakText === 'function') {
      try {
        window.speakText(syllable.char);
        note.hasSpoken = true;
      } catch (e) {}
    }
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    if (!this.isPaused) {
      const dt = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1);
      this.lastFrameTime = currentTime;

      // Spawn timer
      this.spawnTimer += dt * 1000;
      if (this.spawnTimer >= this.spawnIntervalMs) {
        this.spawnTimer = 0;
        this.spawnNote();
      }

      // Update notes
      const highway = this.container.querySelector('#rhythm-highway');
      const trackHeight = highway ? highway.clientHeight : 500;

      for (let i = this.activeNotes.length - 1; i >= 0; i--) {
        const note = this.activeNotes[i];
        note.y += note.speed * dt;

        if (note.el) {
          note.el.style.transform = `translate3d(0, ${note.y}px, 0)`;
        }

        // Passed hit zone completely -> MISS
        if (note.y > trackHeight - 15 && !note.hit) {
          if (note.el && note.el.parentNode) {
            note.el.parentNode.removeChild(note.el);
          }
          this.activeNotes.splice(i, 1);
          this.triggerMiss(note.laneIndex, 'BỎ LỠ! ❌');
        }
      }

      if (this.deckIndex >= this.syllableDeck.length && this.activeNotes.length === 0) {
        this.gameOver(true);
        return;
      }
    } else {
      this.lastFrameTime = currentTime;
    }

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  triggerLaneHit(pressedTone) {
    if (!this.isRunning || this.isPaused) return;

    // Visual pad effect & beam flash for the pressed key
    const pad = this.container.querySelector(`#pad-${pressedTone}`);
    if (pad) {
      pad.classList.add('hit-active');
      setTimeout(() => pad.classList.remove('hit-active'), 140);
    }

    const beam = this.container.querySelector(`#hit-beam-${pressedTone}`);
    if (beam) {
      beam.classList.add('active-beam');
      setTimeout(() => beam.classList.remove('active-beam'), 150);
    }

    const highway = this.container.querySelector('#rhythm-highway');
    const trackHeight = highway ? highway.clientHeight : 500;
    const targetHitY = trackHeight - 88;

    // 1. Check notes matching pressedTone that are near the hit line
    const matchingNotes = this.activeNotes
      .filter(n => !n.hit && n.syllable.tone === pressedTone && n.y > -20)
      .sort((a, b) => b.y - a.y);

    // 2. Check the lowest active note
    const lowestNote = this.activeNotes
      .filter(n => !n.hit && n.y > -20)
      .sort((a, b) => b.y - a.y)[0];

    if (matchingNotes.length > 0) {
      const targetNote = matchingNotes[0];
      const diff = Math.abs(targetNote.y - targetHitY);

      // Generous hit tolerance window
      if (diff <= 170 || (lowestNote && lowestNote.id === targetNote.id)) {
        this.handleCorrectHit(targetNote, diff);
        return;
      }
    }

    // If no matching note, but player pressed wrong tone when a note is near the target line
    if (lowestNote) {
      const lowestDiff = Math.abs(lowestNote.y - targetHitY);
      if (lowestDiff <= 170) {
        this.handleWrongHit(lowestNote, pressedTone);
        return;
      }
    }
  }

  handleCorrectHit(targetNote, diff) {
    targetNote.hit = true;
    if (targetNote.el) {
      targetNote.el.classList.add('correct-hit');
    }

    // Tone synthesizer sound & TTS Chinese character
    this.sfx.playToneTrack(targetNote.syllable.tone);
    this.sfx.playPerfectChord();
    if (typeof window.speakText === 'function') {
      try { window.speakText(targetNote.syllable.char); } catch(e) {}
    }

    const isPerfect = diff < 65;
    const pts = (isPerfect ? 30 : 20) * (this.isFeverMode ? 4 : 1);
    this.score += pts;
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    this.notesHitCount++;

    if (targetNote.syllable && targetNote.syllable.fullWord) {
      this.correctWordsSet.add(targetNote.syllable.fullWord);
    }

    this.showHitFeedback(targetNote.laneIndex, isPerfect ? `PERFECT! 🌟 +${pts}` : `CHÍNH XÁC! ✨ +${pts}`, isPerfect ? '#fbbf24' : '#34d399');

    if (this.combo >= 8 && !this.isFeverMode) {
      this.triggerFever();
    }

    setTimeout(() => {
      if (targetNote.el && targetNote.el.parentNode) {
        targetNote.el.parentNode.removeChild(targetNote.el);
      }
      const idx = this.activeNotes.indexOf(targetNote);
      if (idx !== -1) this.activeNotes.splice(idx, 1);

      if (this.deckIndex >= this.syllableDeck.length && this.activeNotes.length === 0) {
        this.gameOver(true);
      }
    }, 180);

    this.updateHUD();
  }

  handleWrongHit(targetNote, pressedTone) {
    if (targetNote.el) {
      targetNote.el.classList.add('wrong-hit');
      setTimeout(() => {
        if (targetNote.el) targetNote.el.classList.remove('wrong-hit');
      }, 380);
    }

    const arena = this.container.querySelector('#rhythm-highway');
    if (arena) {
      arena.classList.add('rhythm-screen-shake');
      setTimeout(() => arena.classList.remove('rhythm-screen-shake'), 380);
    }

    this.sfx.playMiss();
    this.lives--;
    this.combo = 0;
    this.isFeverMode = false;
    const feverBanner = this.container.querySelector('#rhythm-fever-banner');
    if (feverBanner) feverBanner.style.display = 'none';

    const correctName = targetNote.syllable.tone === 0 ? 'Thanh Nhẹ' : `Thanh ${targetNote.syllable.tone}`;
    this.showHitFeedback(targetNote.laneIndex, `SAI! ❌ (Là ${correctName}) -1 Tim 💔`, '#ef4444');

    if (this.lives <= 0) {
      this.gameOver(false);
      return;
    }
    this.updateHUD();
  }

  triggerMiss(laneIndex = 2, label = 'MISS ❌') {
    this.combo = 0;
    this.lives--;
    this.isFeverMode = false;
    const feverBanner = this.container.querySelector('#rhythm-fever-banner');
    if (feverBanner) feverBanner.style.display = 'none';

    this.sfx.playMiss();
    this.showHitFeedback(laneIndex, label, '#ef4444');

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
      }, 9000);
    }
  }

  showHitFeedback(laneIndex, text, color) {
    const highway = this.container.querySelector('#rhythm-highway');
    if (!highway) return;

    const el = document.createElement('div');
    el.className = 'rhythm-hit-feedback';
    el.style.left = `${laneIndex * 20 + 1}%`;
    el.style.color = color;
    el.textContent = text;

    highway.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 850);
  }

  updateHUD() {
    const scoreVal = this.container.querySelector('#rhythm-score-val');
    const comboVal = this.container.querySelector('#rhythm-combo-val');
    const livesContainer = this.container.querySelector('#rhythm-lives-container');
    const timerVal = this.container.querySelector('#rhythm-timer-val');

    if (scoreVal) scoreVal.textContent = this.score;
    if (comboVal) comboVal.textContent = this.combo;

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
      if (title) title.textContent = isVictory ? 'Bậc Thầy Thanh Điệu!' : 'Hết Tim - Cố Gắng Nhé!';
      if (desc) desc.textContent = isVictory ? `Bạn đã xuất sắc bắt trọn ${this.notesHitCount || this.totalSyllablesCount}/${this.totalSyllablesCount} âm tiết từ vựng!` : 'Hãy chú ý dấu thanh điệu trên Pinyin và luyện tập lại nhé!';
      if (resScore) resScore.textContent = this.score;
      if (resCombo) resCombo.textContent = this.maxCombo;
      if (resNotes) resNotes.textContent = `${this.notesHitCount || 0}/${this.totalSyllablesCount || 0}`;

      // Render danh sách từ vựng Đúng / Sai
      const summaryWrap = overlay.querySelector('#rhythm-words-summary-wrap');
      if (summaryWrap) {
        this.renderWordSummaryList(summaryWrap, this.rawWords, this.correctWordsSet);
      }

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
    const overlay = this.container.querySelector('#rhythm-modal-overlay');
    if (overlay) overlay.style.setProperty('display', 'none', 'important');
    const layer = this.container.querySelector('#rhythm-notes-layer');
    if (layer) layer.innerHTML = '';
    this.beginActualGame();
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
    if (this.countdownTimer) {
      clearTimeout(this.countdownTimer);
      this.countdownTimer = null;
    }
    window.removeEventListener('keydown', this.keyHandler);
    const overlay = this.container.querySelector('#rhythm-modal-overlay');
    if (overlay) overlay.style.setProperty('display', 'none', 'important');
    if (typeof this.onExit === 'function') {
      this.onExit();
    }
  }
}
