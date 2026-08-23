/**
 * Tiếng Trung HongTai - In-Notebook Games Hub Coordinator (Arcade 8 Mini-Games)
 * Tích hợp Đấu Trường Quiz Game (Unlocked All) + 7 Mini-Game Arcade Native (Beta Super Admin)
 */

import { CannonGameEngine } from './notebook_cannon_game.js';
import { SnakeGameEngine } from './notebook_snake_game.js';
import { AlchemistGameEngine } from './notebook_alchemist_game.js';
import { MahjongGameEngine } from './notebook_mahjong_game.js';
import { ToneRhythmGameEngine } from './notebook_tone_rhythm_game.js';
import { GoldMinerGameEngine } from './notebook_goldminer_game.js';
import { PvZGameEngine } from './notebook_pvz_game.js';

function isSuperAdminUser(user) {
  if (!user) return false;
  if (user.isSuperAdmin || user.role === 'super_admin') return true;
  const email = (user.email || '').toLowerCase().trim();
  return email.includes('toiyeutinhoc238') || email.includes('phanphiphu') || email.includes('thaihong162004');
}

export class NotebookGamesHub {
  constructor(containerEl, options = {}) {
    this.container = containerEl;
    this.words = options.words || [];
    this.notebookTitle = options.title || 'Sổ tay Từ Vựng';
    this.notebookDesc = options.desc || 'Ôn tập tương tác trực tiếp';
    this.notebookKey = options.notebookKey || '';
    this.hskVersion = options.hskVersion || '3.0';
    this.currentUser = options.currentUser || null;
    this.onExit = options.onExit || (() => {});

    this.currentGameEngine = null;
    this.activeGameType = null;
    this.messageListener = null;

    this.render();
  }

  render() {
    const isSuper = isSuperAdminUser(this.currentUser);

    this.container.innerHTML = `
      <div class="notebook-games-hub-wrapper">
        <!-- HUB TOP BAR -->
        <div class="games-hub-header">
          <div class="hub-header-left">
            <button type="button" id="games-hub-back-btn" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 8px; border-radius: 50px; font-weight: 700; padding: 8px 18px; cursor: pointer; z-index: 10;">
              <i class="fa-solid fa-arrow-left"></i> Quay Lại Sổ Tay
            </button>
            <div>
              <h2 class="games-hub-title"><i class="fa-solid fa-gamepad" style="color: #ec4899;"></i> Game Ôn Tập Sổ Tay</h2>
              <p class="games-hub-sub">${this.notebookTitle} • ${this.words.length} từ vựng khả dụng</p>
            </div>
          </div>

          <div class="hub-header-badge">
            ${isSuper
              ? '<span class="beta-pill"><i class="fa-solid fa-crown" style="color: #fbbf24;"></i> Super Admin (8 Games)</span>'
              : '<span class="beta-pill" style="background: rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.4); color: #34d399;"><i class="fa-solid fa-circle-check"></i> Chế Độ Ôn Tập (Không Tính Điểm)</span>'
            }
          </div>
        </div>

        <!-- MAIN HUB BODY -->
        <div id="games-hub-content" class="games-hub-content">
          ${this.renderSelectorCards(isSuper)}
        </div>
      </div>
    `;

    this.bindHubEvents();
  }

  renderSelectorCards(isSuper) {
    return `
      <div class="games-selector-container">
        <div class="games-selector-intro">
          <h3>Chọn trò chơi để bắt đầu ôn tập thực chiến</h3>
          <p>Dữ liệu câu hỏi được lấy trực tiếp từ <strong>${this.notebookTitle}</strong> giúp bạn rèn luyện phản xạ toàn diện!</p>
        </div>

        <div class="games-selector-grid-6">
          <!-- CARD GAME 0: QUIZ GAME (UNLOCKED ALL) -->
          <div class="game-choice-card card-quiz-highlight" id="btn-choose-quiz" style="cursor: pointer;">
            <div class="card-tag" style="background: rgba(99, 102, 241, 0.25); color: #a5b4fc; border-color: rgba(99, 102, 241, 0.45);">
              ⭐ GAME ĐỀ XUẤT • TRẮC NGHIỆM 4 ĐÁP ÁN
            </div>
            <div class="card-icon-hero">🎮 ⚡</div>
            <h3 class="card-title">Đấu Trường Quiz Game</h3>
            <p class="card-desc">
              Trò chơi trắc nghiệm 4 đáp án kiểu Quizizz kinh điển! Ôn tập nhận diện chữ Hán, Pinyin, nghĩa tiếng Việt và phản xạ nghe âm thanh với chuỗi Combo nhân điểm!
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-brain"></i> 4 Lựa chọn nhanh</span>
              <span><i class="fa-solid fa-shield-halved"></i> Ôn tập tự do (Không trừ điểm)</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #6366f1, #4f46e5); box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);">
              Chơi Quiz Game Ngay <i class="fa-solid fa-play"></i>
            </button>
          </div>

          <!-- CARD GAME PVZ: PLANTS VS ZOMBIES 1 -->
          <div class="game-choice-card card-pvz ${!isSuper ? 'card-locked-beta' : ''}" id="btn-choose-pvz" style="cursor: pointer;">
            ${!isSuper ? '<div class="card-locked-badge"><i class="fa-solid fa-lock"></i> Beta Admin</div>' : ''}
            <div class="card-tag" style="background: rgba(34, 197, 94, 0.2); color: #4ade80; border-color: rgba(34, 197, 94, 0.4);">🌻 PLANTS VS ZOMBIES 1 • CHIẾN THUẬT</div>
            <div class="card-icon-hero">🌻 🧟</div>
            <h3 class="card-title">Đại Chiến Zombie Từ Vựng</h3>
            <p class="card-desc">
              Thủ thành sân cỏ 5 làn kinh điển PvZ 1! Trồng <strong>9 loại cây</strong> bảo vệ ngôi nhà trước đàn Zombie. Giải từ vựng nhận <strong>+75☀️ Mặt Trời</strong> và bão đạn liên thanh!
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-seedling"></i> 9 Cây trồng PvZ 1</span>
              <span><i class="fa-solid fa-bolt"></i> Giải từ nạp +75☀️</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #22c55e, #15803d);">
              ${isSuper ? 'Chơi Plants vs Zombies <i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-lock"></i> Thử Nghiệm Admin'}
            </button>
          </div>

          <!-- CARD GAME 1: CANNON -->
          <div class="game-choice-card card-cannon ${!isSuper ? 'card-locked-beta' : ''}" id="btn-choose-cannon" style="cursor: pointer;">
            ${!isSuper ? '<div class="card-locked-badge"><i class="fa-solid fa-lock"></i> Beta Admin</div>' : ''}
            <div class="card-tag">PHẢN XẠ PINYIN & BẢN ĐỒ BOM</div>
            <div class="card-icon-hero">💥 🚀</div>
            <h3 class="card-title">Bắn Pháo Pinyin</h3>
            <p class="card-desc">
              Từ vựng rơi từ trên cao! Nhanh tay gõ <strong>Pinyin</strong> để khẩu pháo xoay nòng bắn nổ chữ Hán. Tránh xa các thẻ có <strong>BOM 💣</strong> và dùng Combo mở khóa <strong>Mưa Băng, Lá Chắn</strong>!
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-bolt"></i> Luyện gõ Pinyin</span>
              <span><i class="fa-solid fa-snowflake"></i> Kỹ năng làm chậm</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn">
              ${isSuper ? 'Chơi Bắn Pháo <i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-lock"></i> Thử Nghiệm Admin'}
            </button>
          </div>

          <!-- CARD GAME 2: SNAKE -->
          <div class="game-choice-card card-snake ${!isSuper ? 'card-locked-beta' : ''}" id="btn-choose-snake" style="cursor: pointer;">
            ${!isSuper ? '<div class="card-locked-badge"><i class="fa-solid fa-lock"></i> Beta Admin</div>' : ''}
            <div class="card-tag" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border-color: rgba(16, 185, 129, 0.4);">NHẬN DIỆN MẶT CHỮ & NGHĨA</div>
            <div class="card-icon-hero">🐍 🍏</div>
            <h3 class="card-title">Nuôi Rắn Từ Vựng</h3>
            <p class="card-desc">
              Quan sát chữ Hán đề bài ở trên, điều khiển chú rắn ăn quả táo mang <strong>nghĩa Tiếng Việt chính xác</strong>. Tích đủ <strong>10 chuỗi ngọc</strong> để lên cấp và nhặt vật phẩm may mắn!
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-book-open"></i> Nhớ nghĩa tiếng Việt</span>
              <span><i class="fa-solid fa-layer-group"></i> 5 Cấp độ thử thách</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #10b981, #059669);">
              ${isSuper ? 'Chơi Nuôi Rắn <i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-lock"></i> Thử Nghiệm Admin'}
            </button>
          </div>

          <!-- CARD GAME 3: ALCHEMIST -->
          <div class="game-choice-card card-alchemist ${!isSuper ? 'card-locked-beta' : ''}" id="btn-choose-alchemist" style="cursor: pointer;">
            ${!isSuper ? '<div class="card-locked-badge"><i class="fa-solid fa-lock"></i> Beta Admin</div>' : ''}
            <div class="card-tag" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border-color: rgba(168, 85, 247, 0.4);">CHIẾT TỰ & BỘ THỦ</div>
            <div class="card-icon-hero">⚗️ ✨</div>
            <h3 class="card-title">Lò Luyện Chiết Tự</h3>
            <p class="card-desc">
              Trở thành nhà giả kim! Chọn các <strong>Bộ thủ nguyên liệu</strong> nạp vào vạc luyện kim thần kỳ để hợp nhất chế tạo ra chữ Hán mục tiêu.
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-gem"></i> Nhớ sâu gốc rễ bộ thủ</span>
              <span><i class="fa-solid fa-wand-magic-sparkles"></i> Luyện hợp thể chữ</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #a855f7, #7e22ce);">
              ${isSuper ? 'Chơi Luyện Chữ <i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-lock"></i> Thử Nghiệm Admin'}
            </button>
          </div>

          <!-- CARD GAME 4: MAHJONG -->
          <div class="game-choice-card card-mahjong ${!isSuper ? 'card-locked-beta' : ''}" id="btn-choose-mahjong" style="cursor: pointer;">
            ${!isSuper ? '<div class="card-locked-badge"><i class="fa-solid fa-lock"></i> Beta Admin</div>' : ''}
            <div class="card-tag" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border-color: rgba(245, 158, 11, 0.4);">PHẢN XẠ NỐI CẶP ONET</div>
            <div class="card-icon-hero">🀄 🔍</div>
            <h3 class="card-title">Mạt Chược Nối Từ</h3>
            <p class="card-desc">
              Tìm và nối các cặp quân bài mạt chược tương ứng (<strong>Chữ Hán ↔ Pinyin ↔ Nghĩa</strong>) theo quy tắc đường gấp khúc tối đa 3 đoạn thẳng!
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-link"></i> Nối đường gấp khúc</span>
              <span><i class="fa-solid fa-shuffle"></i> Gió lốc & Bom hỗ trợ</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
              ${isSuper ? 'Chơi Mạt Chược <i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-lock"></i> Thử Nghiệm Admin'}
            </button>
          </div>

          <!-- CARD GAME 5: RHYTHM -->
          <div class="game-choice-card card-rhythm ${!isSuper ? 'card-locked-beta' : ''}" id="btn-choose-rhythm" style="cursor: pointer;">
            ${!isSuper ? '<div class="card-locked-badge"><i class="fa-solid fa-lock"></i> Beta Admin</div>' : ''}
            <div class="card-tag" style="background: rgba(236, 72, 153, 0.2); color: #f472b6; border-color: rgba(236, 72, 153, 0.4);">ÂM NHẠC & BẮT THANH ĐIỆU</div>
            <div class="card-icon-hero">🎵 🎹</div>
            <h3 class="card-title">Phím Đàn Thanh Điệu</h3>
            <p class="card-desc">
              Lắng nghe phát âm và bấm đúng <strong>4 phím thanh điệu (—, ／, ∨, ＼)</strong> khi nốt nhạc trượt vào vạch nhịp để kích hoạt <strong>Fever Mode x4 Điểm</strong>!
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-headphones"></i> Luyện đôi tai bắt thanh điệu</span>
              <span><i class="fa-solid fa-fire"></i> Chuỗi Fever Mode</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #ec4899, #be185d);">
              ${isSuper ? 'Chơi Phím Đàn <i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-lock"></i> Thử Nghiệm Admin'}
            </button>
          </div>

          <!-- CARD GAME 6: GOLD MINER -->
          <div class="game-choice-card card-miner ${!isSuper ? 'card-locked-beta' : ''}" id="btn-choose-miner" style="cursor: pointer;">
            ${!isSuper ? '<div class="card-locked-badge"><i class="fa-solid fa-lock"></i> Beta Admin</div>' : ''}
            <div class="card-tag" style="background: rgba(14, 165, 233, 0.2); color: #38bdf8; border-color: rgba(14, 165, 233, 0.4);">CĂN GÓC THẢ NEO & TRƯỜNG NGHĨA</div>
            <div class="card-icon-hero">⛏️ 💎</div>
            <h3 class="card-title">Thợ Mỏ Đào Vàng</h3>
            <p class="card-desc">
              Canh góc lắc mỏ neo thả dây kéo đúng các thỏi vàng mang từ vựng mục tiêu, kéo kim cương và dùng thuốc nổ TNT phá bỏ tảng đá nặng!
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-anchor"></i> Căn góc mỏ neo</span>
              <span><i class="fa-solid fa-coins"></i> Vượt 3 màn đào vàng</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #0ea5e9, #0284c7);">
              ${isSuper ? 'Chơi Đào Vàng <i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-lock"></i> Thử Nghiệm Admin'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindHubEvents() {
    const isSuper = isSuperAdminUser(this.currentUser);

    const backBtn = this.container.querySelector('#games-hub-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.exitHub();
      });
    }

    // Quiz Game card (Unlocked for everyone)
    const quizCard = this.container.querySelector('#btn-choose-quiz');
    if (quizCard) {
      quizCard.addEventListener('click', (e) => {
        e.preventDefault();
        this.launchGame('quiz');
      });
    }

    // Native Mini-Games
    const nativeGames = [
      { id: '#btn-choose-pvz', type: 'pvz' },
      { id: '#btn-choose-cannon', type: 'cannon' },
      { id: '#btn-choose-snake', type: 'snake' },
      { id: '#btn-choose-alchemist', type: 'alchemist' },
      { id: '#btn-choose-mahjong', type: 'mahjong' },
      { id: '#btn-choose-rhythm', type: 'rhythm' },
      { id: '#btn-choose-miner', type: 'miner' }
    ];

    nativeGames.forEach(g => {
      const card = this.container.querySelector(g.id);
      if (card) {
        card.addEventListener('click', (e) => {
          e.preventDefault();
          if (isSuper) {
            this.launchGame(g.type);
          } else {
            if (typeof window.showToast === 'function') {
              window.showToast('🔒 Trò chơi này đang trong giai đoạn thử nghiệm nội bộ cho Super Admin. Bạn hãy chơi Đấu Trường Quiz Game nhé!', true);
            }
          }
        });
      }
    });
  }

  launchGame(gameType) {
    if (this.words.length < 2) {
      if (typeof window.showToast === 'function') {
        window.showToast('Cần ít nhất 2 từ vựng trong sổ tay này để chơi game!', true);
      }
      return;
    }

    const contentArea = this.container.querySelector('#games-hub-content');
    if (!contentArea) return;

    this.activeGameType = gameType;

    if (gameType === 'quiz') {
      const params = new URLSearchParams();
      params.set('source', 'notebook');
      params.set('no_score', 'true');
      if (this.notebookKey) params.set('notebook', this.notebookKey);
      if (this.hskVersion) params.set('version', this.hskVersion);

      contentArea.innerHTML = `
        <div class="embedded-quiz-wrapper" style="width: 100%; display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 14px; padding: 8px 16px;">
            <button type="button" id="btn-quiz-return-hub" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px; border-radius: 50px; font-weight: 700; cursor: pointer;">
              <i class="fa-solid fa-arrow-left"></i> Đổi Trò Chơi
            </button>
            <div style="font-size: 0.9rem; font-weight: 800; color: #fbbf24; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-gamepad" style="color: #6366f1;"></i> Đấu Trường Quiz Game (Ôn Tập Sổ Tay)
            </div>
            <button type="button" id="btn-quiz-exit-all" class="btn btn-outline btn-sm" style="border-radius: 50px; font-weight: 700; cursor: pointer;">
              <i class="fa-solid fa-book-bookmark"></i> Sổ Tay
            </button>
          </div>
          <iframe id="notebook-quiz-iframe" src="/quiz-game.html?${params.toString()}" style="width: 100%; height: 750px; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 18px; background: #0f172a;" frameborder="0" allow="autoplay"></iframe>
        </div>
      `;

      const returnHubBtn = contentArea.querySelector('#btn-quiz-return-hub');
      if (returnHubBtn) {
        returnHubBtn.onclick = (e) => {
          e.preventDefault();
          this.returnToSelector();
        };
      }

      const exitAllBtn = contentArea.querySelector('#btn-quiz-exit-all');
      if (exitAllBtn) {
        exitAllBtn.onclick = (e) => {
          e.preventDefault();
          this.exitHub();
        };
      }

      if (!this.messageListener) {
        this.messageListener = (event) => {
          if (event.data && (event.data.type === 'CLOSE_GAME_IFRAME' || event.data.type === 'EXIT_GAME')) {
            this.returnToSelector();
          }
        };
        window.addEventListener('message', this.messageListener);
      }
      return;
    }

    contentArea.innerHTML = '<div id="game-active-viewport" class="game-active-viewport"></div>';
    const viewport = contentArea.querySelector('#game-active-viewport');

    const onExit = () => this.returnToSelector();

    if (gameType === 'pvz') {
      this.currentGameEngine = new PvZGameEngine(viewport, this.words, onExit);
    } else if (gameType === 'cannon') {
      this.currentGameEngine = new CannonGameEngine(viewport, this.words, onExit);
    } else if (gameType === 'snake') {
      this.currentGameEngine = new SnakeGameEngine(viewport, this.words, onExit);
    } else if (gameType === 'alchemist') {
      this.currentGameEngine = new AlchemistGameEngine(viewport, this.words, onExit);
    } else if (gameType === 'mahjong') {
      this.currentGameEngine = new MahjongGameEngine(viewport, this.words, onExit);
    } else if (gameType === 'rhythm') {
      this.currentGameEngine = new ToneRhythmGameEngine(viewport, this.words, onExit);
    } else if (gameType === 'miner') {
      this.currentGameEngine = new GoldMinerGameEngine(viewport, this.words, onExit);
    }

    if (this.currentGameEngine && this.currentGameEngine.start) {
      this.currentGameEngine.start();
    }
  }

  returnToSelector() {
    if (this.currentGameEngine && this.currentGameEngine.stopAndExit) {
      this.currentGameEngine.stopAndExit();
    }
    this.currentGameEngine = null;
    this.activeGameType = null;
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }
    this.render();
  }

  exitHub() {
    if (this.currentGameEngine && this.currentGameEngine.stopAndExit) {
      this.currentGameEngine.stopAndExit();
    }
    this.currentGameEngine = null;
    this.activeGameType = null;
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }
    if (this.onExit) {
      this.onExit();
    }
    if (typeof window.exitNotebookGamesHub === 'function') {
      window.exitNotebookGamesHub();
    }
  }
}
