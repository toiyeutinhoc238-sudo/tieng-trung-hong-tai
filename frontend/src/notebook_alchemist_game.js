/**
 * Tiếng Trung HongTai - Notebook Mini-Game 3: LÒ LUYỆN CHIẾT TỰ (Hanzi Alchemist)
 * Giai đoạn: Thử nghiệm nội bộ (Beta Super Admin)
 */

// Extensive Character-to-Radical Decomposition Database for Chinese Learning (200+ HSK Hanzi)
const RADICAL_DECOMPOSITIONS = {
  // Bộ Ngôn (言 / 讠)
  '课': ['讠', '果'],
  '语': ['讠', '吾'],
  '话': ['讠', '舌'],
  '读': ['讠', '卖'],
  '说': ['讠', '兑'],
  '请': ['讠', '青'],
  '谢': ['讠', '身', '寸'],
  '识': ['讠', '只'],
  '认': ['讠', '人'],
  '谁': ['讠', '隹'],
  '记': ['讠', '己'],
  '许': ['讠', '午'],
  '让': ['讠', '上'],
  '该': ['讠', '亥'],
  '试': ['讠', '式'],
  '词': ['讠', '司'],
  '讲': ['讠', '井'],

  // Bộ Nhân (人 / 亻)
  '你': ['亻', '尔'],
  '他': ['亻', '也'],
  '们': ['亻', '门'],
  '休': ['亻', '木'],
  '体': ['亻', '本'],
  '住': ['亻', '主'],
  '位': ['亻', '立'],
  '件': ['亻', '牛'],
  '保': ['亻', '呆'],
  '便': ['亻', '更'],
  '信': ['亻', '言'],
  '俩': ['亻', '两'],
  '倒': ['亻', '到'],
  '借': ['亻', '昔'],
  '做': ['亻', '故'],
  '作': ['亻', '乍'],
  '化': ['亻', '匕'],
  '代': ['亻', '弋'],

  // Bộ Nhật / Nguyệt / Minh (日 / 月 / 木)
  '明': ['日', '月'],
  '晴': ['日', '青'],
  '时': ['日', '寸'],
  '早': ['日', '十'],
  '星': ['日', '生'],
  '晚': ['日', '免'],
  '昨': ['日', '乍'],
  '暖': ['日', '爰'],
  '相': ['木', '目'],
  '林': ['木', '木'],
  '森': ['木', '木', '木'],
  '校': ['木', '交'],
  '桥': ['木', '乔'],
  '机': ['木', '几'],
  '杯': ['木', '不'],
  '树': ['木', '又', '寸'],
  '李': ['木', '子'],
  '板': ['木', '反'],
  '极': ['木', '及'],
  '椅': ['木', '奇'],
  '桌': ['卜', '日', '木'],
  '朋': ['月', '月'],
  '脸': ['月', '佥'],
  '腿': ['月', '退'],
  '脚': ['月', '去', '卩'],
  '肚': ['月', '土'],
  '胖': ['月', '半'],
  '服': ['月', '卩', '又'],

  // Bộ Nữ (女) & Bộ Phụ (父)
  '好': ['女', '子'],
  '她': ['女', '也'],
  '妈': ['女', '马'],
  '姐': ['女', '且'],
  '妹': ['女', '未'],
  '奶': ['女', '乃'],
  '姓': ['女', '生'],
  '姑': ['女', '古'],
  '姨': ['女', '夷'],
  '爸': ['父', '巴'],
  '爷': ['父', '卩'],

  // Bộ Thủy / Băng (氵 / 冫)
  '河': ['氵', '可'],
  '江': ['氵', '工'],
  '海': ['氵', '每'],
  '湖': ['氵', '古', '月'],
  '池': ['氵', '也'],
  '汉': ['氵', '又'],
  '洗': ['氵', '先'],
  '清': ['氵', '青'],
  '泪': ['氵', '目'],
  '游': ['氵', '方', '子'],
  '漂': ['氵', '票'],
  '冷': ['冫', '令'],
  '冰': ['冫', '水'],
  '凉': ['冫', '京'],
  '冬': ['夂', '冫'],

  // Bộ Thảo (艹) & Hòa (禾) & Trúc (⺮)
  '草': ['艹', '早'],
  '花': ['艹', '化'],
  '茶': ['艹', '人', '木'],
  '药': ['艹', '约'],
  '苹': ['艹', '平'],
  '菜': ['艹', '爫', '木'],
  '蓝': ['艹', '监'],
  '英': ['艹', '央'],
  '节': ['艹', '卩'],
  '和': ['禾', '口'],
  '种': ['禾', '中'],
  '秋': ['禾', '火'],
  '秒': ['禾', '少'],
  '租': ['禾', '且'],
  '科': ['禾', '斗'],
  '程': ['禾', '呈'],
  '笔': ['⺮', '毛'],
  '笑': ['⺮', '夭'],
  '等': ['⺮', '寺'],
  '第': ['⺮', '弟'],
  '答': ['⺮', '合'],
  '管': ['⺮', '官'],
  '箱': ['⺮', '相'],
  '篇': ['⺮', '扁'],
  '符': ['⺮', '付'],

  // Bộ Miên / Quán (宀 / 冖 / 囗 / 门)
  '学': ['⺌', '冖', '子'],
  '字': ['宀', '子'],
  '家': ['宀', '豕'],
  '安': ['宀', '女'],
  '客': ['宀', '各'],
  '室': ['宀', '至'],
  '定': ['宀', '正'],
  '写': ['冖', '与'],
  '军': ['冖', '车'],
  '国': ['囗', '玉'],
  '园': ['囗', '元'],
  '因': ['囗', '大'],
  '团': ['囗', '才'],
  '问': ['门', '口'],
  '间': ['门', '日'],
  '闭': ['门', '才'],
  '闪': ['门', '人'],
  '阔': ['门', '活'],

  // Bộ Khẩu (口) & Thủ (扌 / 手) & Tâm (心 / 忄)
  '吃': ['口', '乞'],
  '喝': ['口', '曷'],
  '唱': ['口', '昌'],
  '听': ['口', '斤'],
  '叫': ['口', '丩'],
  '吧': ['口', '巴'],
  '吗': ['口', '马'],
  '呢': ['口', '尼'],
  '响': ['口', '向'],
  '打': ['扌', '丁'],
  '找': ['扌', '戈'],
  '把': ['扌', '巴'],
  '抱': ['扌', '包'],
  '提': ['扌', '是'],
  '掉': ['扌', '卓'],
  '推': ['扌', '隹'],
  '拉': ['扌', '立'],
  '看': ['手', '目'],
  '想': ['相', '心'],
  '您': ['你', '心'],
  '思': ['田', '心'],
  '情': ['忄', '青'],
  '忙': ['忄', '亡'],
  '快': ['忄', '夬'],
  '慢': ['忄', '曼'],

  // Bộ Hỏa (火 / 灬) & Thực (饣) & Túc (⻊) & Khuyển (犭) & Dực (羽)
  '炎': ['火', '火'],
  '灯': ['火', '丁'],
  '灭': ['一', '火'],
  '烧': ['火', '尧'],
  '热': ['执', '灬'],
  '照': ['昭', '灬'],
  '点': ['占', '灬'],
  '黑': ['里', '灬'],
  '饭': ['饣', '反'],
  '饮': ['饣', '欠'],
  '饱': ['饣', '包'],
  '馆': ['饣', '官'],
  '饺': ['饣', '交'],
  '跑': ['⻊', '包'],
  '跳': ['⻊', '兆'],
  '踢': ['⻊', '易'],
  '路': ['⻊', '各'],
  '跟': ['⻊', '艮'],
  '狗': ['犭', '句'],
  '猫': ['犭', '苗'],
  '猪': ['犭', '者'],
  '鸡': ['又', '鸟'],
  '鸭': ['甲', '鸟'],
  '鹅': ['我', '鸟'],

  // Bộ Quai xước (辶) & Mịch (纟) & Thổ (土) & Điền (田) & Mỹ (美)
  '过': ['辶', '寸'],
  '进': ['辶', '井'],
  '远': ['辶', '元'],
  '近': ['辶', '斤'],
  '送': ['辶', '关'],
  '还': ['辶', '不'],
  '边': ['辶', '力'],
  '迟': ['辶', '尺'],
  '道': ['辶', '首'],
  '通': ['辶', '甬'],
  '红': ['纟', '工'],
  '给': ['纟', '合'],
  '绿': ['纟', '录'],
  '结': ['纟', '吉'],
  '细': ['纟', '田'],
  '级': ['纟', '及'],
  '线': ['纟', '戋'],
  '练': ['纟', '东'],
  '地': ['土', '也'],
  '场': ['土', '昜'],
  '城': ['土', '成'],
  '块': ['土', '夬'],
  '男': ['田', '力'],
  '累': ['田', '糸'],
  '界': ['田', '介'],
  '美': ['⺶', '大'],
  '友': ['𠂇', '又']
};

// High-quality single-character fallback dictionary when rawWords contains isolated unknown symbols
const FALLBACK_SINGLE_WORDS = [
  { word: '课', pinyin: 'kè', meaning: 'bài học, tiết học', parts: ['讠', '果'] },
  { word: '明', pinyin: 'míng', meaning: 'sáng sủa, rõ ràng', parts: ['日', '月'] },
  { word: '好', pinyin: 'hǎo', meaning: 'tốt, đẹp, hay', parts: ['女', '子'] },
  { word: '休', pinyin: 'xiū', meaning: 'nghỉ ngơi', parts: ['亻', '木'] },
  { word: '谢', pinyin: 'xiè', meaning: 'cảm ơn', parts: ['讠', '身', '寸'] },
  { word: '茶', pinyin: 'chá', meaning: 'trà, nước chè', parts: ['艹', '人', '木'] },
  { word: '学', pinyin: 'xué', meaning: 'học tập', parts: ['⺌', '冖', '子'] },
  { word: '草', pinyin: 'cǎo', meaning: 'cỏ', parts: ['艹', '早'] },
  { word: '河', pinyin: 'hé', meaning: 'con sông', parts: ['氵', '可'] },
  { word: '晴', pinyin: 'qíng', meaning: 'trời nắng ráo', parts: ['日', '青'] },
  { word: '打', pinyin: 'dǎ', meaning: 'đánh, gõ', parts: ['扌', '丁'] },
  { word: '看', pinyin: 'kàn', meaning: 'nhìn, xem', parts: ['手', '目'] },
  { word: '听', pinyin: 'tīng', meaning: 'nghe', parts: ['口', '斤'] },
  { word: '吃', pinyin: 'chī', meaning: 'ăn', parts: ['口', '乞'] },
  { word: '跑', pinyin: 'pǎo', meaning: 'chạy bộ', parts: ['⻊', '包'] },
  { word: '饭', pinyin: 'fàn', meaning: 'cơm, bữa ăn', parts: ['饣', '反'] }
];

class AlchemistSoundFX {
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
  playBubble() {
    this.playTone(320, 'sine', 0.1, 580);
  }
  playSuccess() {
    this.playTone(440, 'triangle', 0.15, 660);
    setTimeout(() => this.playTone(660, 'triangle', 0.25, 880), 120);
  }
  playFail() {
    this.playTone(220, 'sawtooth', 0.3, 110);
  }
  playChime() {
    this.playTone(880, 'sine', 0.35, 1320);
  }
}

export class AlchemistGameEngine {
  constructor(containerEl, wordsList, onExitCallback) {
    this.container = containerEl;
    this.rawWords = wordsList && wordsList.length >= 1 ? wordsList : [
      { word: '课', pinyin: 'kè', meaning: 'bài học, tiết học' },
      { word: '美国', pinyin: 'Měiguó', meaning: 'Nước Mỹ' },
      { word: '明', pinyin: 'míng', meaning: 'sáng sủa, rõ ràng' },
      { word: '好', pinyin: 'hǎo', meaning: 'tốt, đẹp' },
      { word: '老师', pinyin: 'lǎoshī', meaning: 'thầy cô giáo' },
      { word: '休', pinyin: 'xiū', meaning: 'nghỉ ngơi' },
      { word: '学生', pinyin: 'xuéshēng', meaning: 'học sinh' },
      { word: '苹果', pinyin: 'píngguǒ', meaning: 'quả táo' }
    ];
    this.onExit = onExitCallback;
    this.sfx = new AlchemistSoundFX();

    // Game Core State
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.lives = 3;
    this.maxLives = 3;
    this.timeLeft = 80;
    this.isPaused = false;
    this.isRunning = false;
    this.craftedCount = 0;

    // Current Target & Cauldron State
    this.currentTarget = null;
    this.cauldronSlots = []; // items currently in cauldron
    this.availableRadicals = []; // items shown on shelf
    this.isRevealed = false;
    this.isProcessing = false;

    this.timerInterval = null;

    this.renderLayout();
    this.bindEvents();
  }

  renderLayout() {
    this.container.innerHTML = `
      <div class="alchemist-game-wrapper">
        <!-- TOP HUD -->
        <div class="cannon-hud-bar">
          <button type="button" id="alchemist-top-back-btn" class="btn btn-outline btn-sm" style="display: flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 50px;">
            <i class="fa-solid fa-arrow-left"></i> Quay lại chọn game
          </button>

          <div class="hud-item-title">
            <span style="font-size: 1.4rem;">⚗️</span>
            <strong style="color: #a855f7;">LÒ LUYỆN CHIẾT TỰ</strong>
          </div>

          <div class="hud-item hud-score">
            <i class="fa-solid fa-star" style="color: #fbbf24;"></i>
            <span class="hud-label">ĐIỂM:</span>
            <span class="hud-value" id="alchemist-score-val">0</span>
          </div>

          <div class="hud-item hud-combo">
            <i class="fa-solid fa-fire" style="color: #f97316;"></i>
            <span class="hud-label">CHUỖI:</span>
            <span class="hud-value" id="alchemist-streak-val">0</span>
          </div>

          <div class="hud-item hud-lives">
            <span class="hud-label">TIM:</span>
            <div class="hud-hearts" id="alchemist-lives-container">
              <i class="fa-solid fa-heart" style="color: #ef4444;"></i>
              <i class="fa-solid fa-heart" style="color: #ef4444;"></i>
              <i class="fa-solid fa-heart" style="color: #ef4444;"></i>
            </div>
          </div>

          <div class="hud-item hud-timer">
            <i class="fa-solid fa-clock" style="color: #38bdf8;"></i>
            <span class="hud-value" id="alchemist-timer-val">01:20</span>
          </div>

          <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
            <button type="button" id="alchemist-pause-btn" class="btn btn-outline btn-sm" title="Tạm dừng"><i class="fa-solid fa-pause"></i></button>
            <button type="button" id="alchemist-back-hub-top-btn" class="btn btn-secondary btn-sm" title="Đổi trò chơi khác" style="display: flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 50px; padding: 6px 14px;">
              <i class="fa-solid fa-arrow-left"></i> Đổi Game
            </button>
            <button type="button" id="alchemist-exit-btn" class="btn btn-outline btn-sm" title="Thoát về sổ tay"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>

        <!-- MAIN ARENA LAYOUT -->
        <div class="alchemist-arena-grid">
          <!-- LEFT: TARGET QUESTION CARD (ACTIVE RECALL - NO SPOILER ANSWER) -->
          <div class="alchemist-target-card">
            <div class="alchemist-quest-tag" id="alchemist-quest-type-tag">
              <i class="fa-solid fa-flask"></i> LUYỆN BỘ THỦ CHỮ HÁN
            </div>
            
            <div class="alchemist-target-main">
              <!-- MYSTERY TARGET ORB -->
              <div class="target-mystery-box">
                <div class="target-mystery-orb" id="alchemist-mystery-orb">
                  <span class="mystery-question-mark">?</span>
                  <span class="revealed-hanzi" id="alchemist-revealed-hanzi">明</span>
                </div>
              </div>

              <!-- PINYIN & AUDIO -->
              <div class="target-pinyin-wrap">
                <div class="target-pinyin-glow" id="alchemist-target-pinyin">(míng)</div>
                <button type="button" id="alchemist-audio-hint-btn" class="pinyin-speaker-btn" title="Nghe phát âm">
                  <i class="fa-solid fa-volume-high"></i>
                </button>
              </div>

              <!-- VIETNAMESE MEANING (CHALLENGE PROMPT) -->
              <div class="target-meaning-box">
                <span class="meaning-label">Nghĩa tiếng Việt:</span>
                <div class="meaning-val" id="alchemist-target-meaning">sáng sủa, rõ ràng</div>
              </div>
            </div>

            <div class="alchemist-hint-box">
              <i class="fa-solid fa-wand-magic-sparkles" style="color: #c084fc; font-size: 1.1rem; flex-shrink: 0;"></i>
              <span>Nhớ cách viết của từ mang nghĩa này, rồi chọn các mảnh ghép nạp vào vạc luyện kim!</span>
            </div>
          </div>

          <!-- CENTER: MAGICAL CAULDRON (DYNAMIC WIDE POT) -->
          <div class="alchemist-cauldron-container">
            <div class="cauldron-aura"></div>
            
            <!-- CAULDRON VISUAL -->
            <div class="cauldron-pot slots-2" id="alchemist-cauldron-pot">
              <div class="cauldron-rim"></div>
              <div class="cauldron-liquid" id="cauldron-liquid">
                <div class="cauldron-bubble b1"></div>
                <div class="cauldron-bubble b2"></div>
                <div class="cauldron-bubble b3"></div>
              </div>
              
              <!-- DYNAMIC SLOTS FOR CHOSEN RADICALS / CHARACTERS -->
              <div class="cauldron-slots-wrap" id="cauldron-slots-wrap">
                <!-- Dynamically populated slots -->
              </div>
            </div>

            <!-- ACTION BUTTONS -->
            <div class="cauldron-actions">
              <button type="button" id="btn-clear-cauldron" class="btn btn-outline" style="border-radius: 50px; font-weight: 700;">
                <i class="fa-solid fa-arrow-rotate-left"></i> Đổ Lại
              </button>
              <button type="button" id="btn-fuse-cauldron" class="btn btn-primary btn-fuse-glow">
                <i class="fa-solid fa-wand-magic-sparkles"></i> LUYỆN HÓA ✨
              </button>
            </div>
          </div>

          <!-- RIGHT: INGREDIENTS SHELF (BỘ THỦ / CHỮ NGUYÊN LIỆU) -->
          <div class="alchemist-shelf-card">
            <div class="shelf-title">
              <i class="fa-solid fa-gem" style="color: #38bdf8;"></i> KỆ NGUYÊN LIỆU CHIẾT TỰ
            </div>
            <div class="shelf-hint">Nhấp vào nguyên liệu để nạp vào vạc luyện kim</div>

            <div class="radicals-grid" id="radicals-shelf-grid">
              <!-- Dynamically populated radical crystal buttons -->
            </div>
          </div>
        </div>

        <!-- MODAL OVERLAY (VICTORY / GAME OVER) -->
        <div id="alchemist-modal-overlay" class="cannon-modal-overlay" style="display: none;">
          <div class="cannon-result-card">
            <div id="alchemist-result-icon" class="result-icon">⚗️</div>
            <h2 id="alchemist-result-title" class="result-title">Hoàn Thành Màn Chơi!</h2>
            <p id="alchemist-result-desc" class="result-desc">Bạn đã xuất sắc luyện thành công các chữ Hán!</p>
            
            <div class="result-stats-grid">
              <div class="stat-pill">
                <span class="label">Tổng Điểm</span>
                <span class="val" id="alchemist-res-score">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Chuỗi Tối Đa</span>
                <span class="val" id="alchemist-res-streak">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Chữ Đã Luyện</span>
                <span class="val" id="alchemist-res-words">0</span>
              </div>
            </div>

            <div class="result-beta-note">
              <i class="fa-solid fa-flask"></i> <strong>Chế độ thử nghiệm:</strong> Điểm số và thành tích không lưu vào hồ sơ trong giai đoạn Beta Super Admin.
            </div>

            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
              <button type="button" id="alchemist-retry-btn" class="btn btn-primary" style="padding: 10px 20px; font-weight: 800;"><i class="fa-solid fa-rotate-right"></i> Chơi Lại</button>
              <button type="button" id="alchemist-back-hub-btn" class="btn btn-secondary" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-gamepad"></i> Đổi Trò Chơi</button>
              <button type="button" id="alchemist-finish-btn" class="btn btn-outline" style="padding: 10px 18px; font-weight: 700;"><i class="fa-solid fa-book-bookmark"></i> Quay Lại Sổ Tay</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const pauseBtn = this.container.querySelector('#alchemist-pause-btn');
    const backHubTopBtn = this.container.querySelector('#alchemist-back-hub-top-btn');
    const topBackBtn = this.container.querySelector('#alchemist-top-back-btn');
    const exitBtn = this.container.querySelector('#alchemist-exit-btn');
    const retryBtn = this.container.querySelector('#alchemist-retry-btn');
    const backHubBtn = this.container.querySelector('#alchemist-back-hub-btn');
    const finishBtn = this.container.querySelector('#alchemist-finish-btn');
    const clearBtn = this.container.querySelector('#btn-clear-cauldron');
    const fuseBtn = this.container.querySelector('#btn-fuse-cauldron');
    const audioBtn = this.container.querySelector('#alchemist-audio-hint-btn');

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.togglePause());
    }

    if (topBackBtn) {
      topBackBtn.addEventListener('click', () => this.stopAndExit());
    }

    if (backHubTopBtn) {
      backHubTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.stopAndExit();
      });
    }

    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        this.stopAndExit();
        if (typeof window.exitNotebookGamesHub === 'function') {
          window.exitNotebookGamesHub();
        }
      });
    }

    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.restart());
    }

    if (backHubBtn) {
      backHubBtn.addEventListener('click', () => this.stopAndExit());
    }

    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        this.stopAndExit();
        if (typeof window.exitNotebookGamesHub === 'function') {
          window.exitNotebookGamesHub();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearCauldron());
    }

    if (fuseBtn) {
      fuseBtn.addEventListener('click', () => this.attemptFusion());
    }

    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        if (this.currentTarget && this.currentTarget.fullWord && window.speakText) {
          window.speakText(this.currentTarget.fullWord);
        }
      });
    }
  }

  start() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.isStopping = false;
    this.isRunning = true;
    this.isPaused = false;
    this.isProcessing = false;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.lives = 3;

    const overlay = this.container.querySelector('#alchemist-modal-overlay');
    if (overlay) {
      overlay.style.setProperty('display', 'none', 'important');
    }
    this.timeLeft = 80;
    this.craftedCount = 0;
    this.cauldronSlots = [];
    this.totalWordsCount = (this.rawWords || []).length;
    this.wordQueue = [...(this.rawWords || [])].sort(() => Math.random() - 0.5);

    this.nextQuestion();
    this.updateHUD();
    this.startTimers();
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

  /**
   * Smart Word Decomposition Engine
   * Ensures 100% data integrity between Word, Pinyin, and Meaning!
   */
  decomposeWordTarget(rawObj) {
    if (!rawObj || !rawObj.word) {
      const fb = FALLBACK_SINGLE_WORDS[Math.floor(Math.random() * FALLBACK_SINGLE_WORDS.length)];
      return {
        type: 'radical',
        fullWord: fb.word,
        pinyin: fb.pinyin,
        meaning: fb.meaning,
        requiredParts: fb.parts
      };
    }

    const cleanWord = rawObj.word.trim();

    // CASE 1: Multi-character compound word (2+ syllables, e.g. 美国, 老师, 苹果, 喜欢, 电脑)
    if (cleanWord.length >= 2) {
      return {
        type: 'compound',
        fullWord: cleanWord,
        pinyin: rawObj.pinyin || '',
        meaning: rawObj.meaning || 'Từ ghép',
        requiredParts: cleanWord.split('')
      };
    }

    // CASE 2: Single-character word (1 Hanzi, e.g. 课, 好, 明, 休, 谢, 茶)
    if (RADICAL_DECOMPOSITIONS[cleanWord]) {
      return {
        type: 'radical',
        fullWord: cleanWord,
        pinyin: rawObj.pinyin || '',
        meaning: rawObj.meaning || 'Từ đơn',
        requiredParts: RADICAL_DECOMPOSITIONS[cleanWord]
      };
    }

    // CASE 3: Single character not found in RADICAL_DECOMPOSITIONS -> Pick from FALLBACK with matched pinyin & meaning
    const fb = FALLBACK_SINGLE_WORDS[Math.floor(Math.random() * FALLBACK_SINGLE_WORDS.length)];
    return {
      type: 'radical',
      fullWord: fb.word,
      pinyin: fb.pinyin,
      meaning: fb.meaning,
      requiredParts: fb.parts
    };
  }

  nextQuestion() {
    this.cauldronSlots = [];
    this.isRevealed = false;
    this.isProcessing = false;
    
    if (!this.wordQueue || this.wordQueue.length === 0) {
      // Đã hoàn thành toàn bộ danh sách từ vựng mà không lặp lại
      this.gameOver(true);
      return;
    }

    // Pick next target from wordQueue
    const randomObj = this.wordQueue.pop();
    this.currentTarget = this.decomposeWordTarget(randomObj);

    // Update target card displays (ACTIVE RECALL: NO SPOILER ANSWER!)
    const questTag = this.container.querySelector('#alchemist-quest-type-tag');
    const mysteryOrb = this.container.querySelector('#alchemist-mystery-orb');
    const revealedHanzi = this.container.querySelector('#alchemist-revealed-hanzi');
    const pyEl = this.container.querySelector('#alchemist-target-pinyin');
    const mnEl = this.container.querySelector('#alchemist-target-meaning');

    if (questTag) {
      if (this.currentTarget.type === 'compound') {
        questTag.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> LUYỆN TỪ VỰNG GHÉP`;
      } else {
        questTag.innerHTML = `<i class="fa-solid fa-flask"></i> LUYỆN BỘ THỦ CHIẾT TỰ`;
      }
    }

    if (mysteryOrb) {
      mysteryOrb.classList.remove('revealed');
    }
    if (revealedHanzi) {
      revealedHanzi.textContent = this.currentTarget.fullWord;
    }
    if (pyEl) {
      pyEl.textContent = this.currentTarget.pinyin ? `(${this.currentTarget.pinyin})` : '';
    }
    if (mnEl) {
      mnEl.textContent = this.currentTarget.meaning;
    }

    // Configure Dynamic Cauldron Pot & Slots
    this.setupCauldronSlots();

    // Build Shelf of Radical / Character Ingredients
    this.buildIngredientsShelf();

    this.renderShelf();
    this.updateCauldronDisplay();
  }

  setupCauldronSlots() {
    const neededCount = this.currentTarget.requiredParts.length;
    const pot = this.container.querySelector('#alchemist-cauldron-pot');
    const wrap = this.container.querySelector('#cauldron-slots-wrap');
    if (!wrap) return;

    // Adjust Cauldron Width Class
    if (pot) {
      pot.className = `cauldron-pot slots-${Math.min(4, Math.max(2, neededCount))}`;
    }

    // Generate Dynamic Slots HTML
    let slotsHTML = '';
    for (let i = 0; i < neededCount; i++) {
      if (i > 0) {
        slotsHTML += `<div class="slot-plus">+</div>`;
      }
      slotsHTML += `
        <div class="cauldron-slot" data-index="${i}" id="slot-${i}" title="Nhấp để gỡ nguyên liệu">
          <span class="slot-placeholder">?</span>
        </div>
      `;
    }
    wrap.innerHTML = slotsHTML;
  }

  buildIngredientsShelf() {
    const correctParts = [...this.currentTarget.requiredParts];
    const neededDistractorsCount = Math.max(6, 9 - correctParts.length);

    let distractorPool = [];
    if (this.currentTarget.type === 'compound') {
      // Pick other Chinese characters for multi-character compound mode
      distractorPool = ['中', '美', '国', '人', '大', '小', '老', '师', '学', '生', '朋', '友', '苹', '果', '电', '脑', '天', '气', '汉', '语', '喜', '欢', '北', '京', '吃', '饭', '喝', '水', '看', '书', '高', '兴'];
    } else {
      // Pick radicals for single character decomposition mode
      distractorPool = ['氵', '木', '日', '月', '亻', '口', '女', '子', '讠', '心', '忄', '扌', '火', '门', '辶', '艹', '土', '纟', '饣', '禾', '目', '宀', '夂', '⻊', '父', '巴', '果', '青', '吾', '舌'];
    }

    const filteredDistractors = distractorPool.filter(r => !correctParts.includes(r));
    const shuffledDistractors = [...filteredDistractors].sort(() => 0.5 - Math.random()).slice(0, neededDistractorsCount);

    this.availableRadicals = [...correctParts, ...shuffledDistractors].sort(() => 0.5 - Math.random());
  }

  renderShelf() {
    const grid = this.container.querySelector('#radicals-shelf-grid');
    if (!grid) return;

    grid.innerHTML = '';
    this.availableRadicals.forEach((rad) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'radical-crystal-btn';
      card.innerHTML = `
        <span class="rad-char">${rad}</span>
        <span class="rad-sparkle">✨</span>
      `;
      card.addEventListener('click', () => {
        if (!this.isProcessing) {
          this.addRadicalToCauldron(rad);
        }
      });
      grid.appendChild(card);
    });
  }

  addRadicalToCauldron(rad) {
    const maxSlots = this.currentTarget.requiredParts.length;
    if (this.cauldronSlots.length >= maxSlots) {
      this.showToast('Vạc đã đủ nguyên liệu! Nhấn LUYỆN HÓA hoặc Đổ Lại.');
      return;
    }

    this.sfx.playBubble();
    this.cauldronSlots.push(rad);
    this.updateCauldronDisplay();

    // Auto-fuse if all slots are filled
    if (this.cauldronSlots.length === maxSlots) {
      setTimeout(() => this.attemptFusion(), 250);
    }
  }

  removeSlotItem(index) {
    if (this.isProcessing) return;
    if (this.cauldronSlots[index]) {
      this.cauldronSlots.splice(index, 1);
      this.updateCauldronDisplay();
    }
  }

  clearCauldron() {
    if (this.isProcessing) return;
    this.cauldronSlots = [];
    this.updateCauldronDisplay();
  }

  updateCauldronDisplay() {
    const maxSlots = this.currentTarget ? this.currentTarget.requiredParts.length : 2;
    for (let i = 0; i < maxSlots; i++) {
      const slotEl = this.container.querySelector(`#slot-${i}`);
      if (slotEl) {
        const item = this.cauldronSlots[i];
        if (item) {
          slotEl.innerHTML = `<span class="slot-filled-char">${item}</span>`;
          slotEl.classList.add('filled');
          slotEl.onclick = () => this.removeSlotItem(i);
        } else {
          slotEl.innerHTML = `<span class="slot-placeholder">?</span>`;
          slotEl.classList.remove('filled');
          slotEl.onclick = null;
        }
      }
    }
  }

  attemptFusion() {
    if (!this.currentTarget || this.isProcessing) return;
    if (this.cauldronSlots.length === 0) {
      this.showToast('Hãy chọn các bộ thủ / mảnh ghép trên kệ nạp vào vạc trước!');
      return;
    }

    this.isProcessing = true;

    // Compare strictly or ordered depending on mode
    const required = [...this.currentTarget.requiredParts];
    const current = [...this.cauldronSlots];

    let isMatch = false;
    if (this.currentTarget.type === 'compound') {
      // For compound words (like 美国), sequence matters [美] + [国]
      isMatch = required.length === current.length && required.every((val, idx) => val === current[idx]);
    } else {
      // For radicals decomposition (like 课 = 讠 + 果), order can be flexible
      const reqSorted = [...required].sort();
      const curSorted = [...current].sort();
      isMatch = reqSorted.length === curSorted.length && reqSorted.every((val, idx) => val === curSorted[idx]);
    }

    const liquid = this.container.querySelector('#cauldron-liquid');
    const mysteryOrb = this.container.querySelector('#alchemist-mystery-orb');

    if (isMatch) {
      // SUCCESS!
      this.sfx.playSuccess();
      if (liquid) liquid.classList.add('fusion-success');
      
      // Reveal the mysterious Chinese character with golden/emerald glow!
      if (mysteryOrb) mysteryOrb.classList.add('revealed');

      const pts = 35 + this.streak * 5;
      this.score += pts;
      this.streak++;
      this.craftedCount++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;

      // Pronounce the word
      if (window.speakText) {
        try { window.speakText(this.currentTarget.fullWord); } catch(e) {}
      }

      this.showToast(`✨ Luyện Thành Công:「${this.currentTarget.fullWord}」! +${pts} Điểm`);

      setTimeout(() => {
        if (liquid) liquid.classList.remove('fusion-success');
        this.nextQuestion();
        this.updateHUD();
      }, 1200);

    } else {
      // FAIL!
      this.sfx.playFail();
      if (liquid) liquid.classList.add('fusion-fail');
      this.lives--;
      this.streak = 0;
      this.showToast('💨 Hợp thể thất bại! Sai thành phần, hãy thử lại.', true);

      setTimeout(() => {
        if (liquid) liquid.classList.remove('fusion-fail');
        this.clearCauldron();
        this.isProcessing = false;
        if (this.lives <= 0) {
          this.gameOver(false);
        }
        this.updateHUD();
      }, 750);
    }
  }

  updateHUD() {
    const scoreVal = this.container.querySelector('#alchemist-score-val');
    const streakVal = this.container.querySelector('#alchemist-streak-val');
    const livesContainer = this.container.querySelector('#alchemist-lives-container');
    const timerVal = this.container.querySelector('#alchemist-timer-val');

    if (scoreVal) scoreVal.textContent = this.score;
    if (streakVal) streakVal.textContent = this.streak;

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

  showToast(msg, isError = false) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, isError);
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseBtn = this.container.querySelector('#alchemist-pause-btn');
    if (pauseBtn) {
      pauseBtn.innerHTML = `<i class="fa-solid fa-${this.isPaused ? 'play' : 'pause'}"></i>`;
    }
    this.showToast(this.isPaused ? 'Đã tạm dừng game ⏸' : 'Tiếp tục chơi ▶️');
  }

  gameOver(isVictory) {
    this.isRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);

    const overlay = this.container.querySelector('#alchemist-modal-overlay');
    const icon = this.container.querySelector('#alchemist-result-icon');
    const title = this.container.querySelector('#alchemist-result-title');
    const desc = this.container.querySelector('#alchemist-result-desc');
    const resScore = this.container.querySelector('#alchemist-res-score');
    const resStreak = this.container.querySelector('#alchemist-res-streak');
    const resWords = this.container.querySelector('#alchemist-res-words');

    if (overlay) {
      overlay.style.setProperty('display', 'flex', 'important');
      if (icon) icon.textContent = isVictory ? '🏆' : '💨';
      if (title) title.textContent = isVictory ? 'Nhà Giả Kim Xuất Sắc!' : 'Hết Tim - Luyện Thất Bại!';
      if (desc) desc.textContent = isVictory ? `Bạn đã xuất sắc chiết tự và ghép thành công toàn bộ ${this.craftedCount || this.totalWordsCount}/${this.totalWordsCount} từ vựng!` : 'Hãy chú ý quan sát các nét bộ thủ cấu thành chữ Hán nhé!';
      if (resScore) resScore.textContent = this.score;
      if (resStreak) resStreak.textContent = this.maxStreak;
      if (resWords) resWords.textContent = `${this.craftedCount || 0}/${this.totalWordsCount || 0}`;

      const retryBtn = overlay.querySelector('#alchemist-retry-btn');
      const backHubBtn = overlay.querySelector('#alchemist-back-hub-btn');
      const finishBtn = overlay.querySelector('#alchemist-finish-btn');

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
    const overlay = this.container.querySelector('#alchemist-modal-overlay');
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
    const overlay = this.container.querySelector('#alchemist-modal-overlay');
    if (overlay) {
      overlay.style.setProperty('display', 'none', 'important');
    }
    if (typeof this.onExit === 'function') {
      this.onExit();
    }
  }
}
