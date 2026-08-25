/**
 * Tiếng Trung HongTai - In-Notebook Games Hub Coordinator (Arcade 8 Mini-Games)
 * Tích hợp Đấu Trường Quiz Game (Unlocked All) + 7 Mini-Game Arcade Native (Beta Super Admin)
 */

import { CannonGameEngine } from './notebook_cannon_game.js';
import { SnakeGameEngine } from './notebook_snake_game.js';
import { AlchemistGameEngine } from './notebook_alchemist_game.js';
import { MahjongGameEngine } from './notebook_mahjong_game.js';
import { ToneRhythmGameEngine } from './notebook_tone_rhythm_game.js';

function isSuperAdminUser(user) {
  if (!user) return false;
  if (user.isSuperAdmin || user.role === 'super_admin') return true;
  const email = (user.email || '').toLowerCase().trim();
  return email.includes('phanphiphu') || email.includes('thaihong162004');
}

export class NotebookGamesHub {
  constructor(containerEl, options = {}) {
    this.container = containerEl;
    const rawWords = options.words || [];
    this.words = rawWords
      .map(w => {
        if (!w) return null;
        const word = (w.word || w.hanzi || w.text || '').trim();
        const pinyin = (w.pinyin || '').trim();
        const meaning = (w.meaning || w.vietnamese || (Array.isArray(w.translations) ? w.translations.join(', ') : '') || '').trim();
        return { word, pinyin, meaning };
      })
      .filter(w => w && w.word && (w.meaning || w.pinyin));

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
    this.container.innerHTML = `
      <div class="notebook-games-hub-wrapper">
        <!-- HUB TOP BAR -->
        <div class="games-hub-header">
          <div class="hub-header-left">
            <button type="button" id="games-hub-back-btn" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 8px; border-radius: 50px; font-weight: 700; padding: 8px 18px; cursor: pointer; z-index: 10;">
              <i class="fa-solid fa-arrow-left"></i> Quay Lại
            </button>
            <div>
              <h2 class="games-hub-title"><i class="fa-solid fa-gamepad" style="color: #f59e0b;"></i> Trò Chơi Ôn Tập Từ Vựng</h2>
              <p class="games-hub-sub">${this.notebookTitle} • ${this.words.length} từ vựng khả dụng • Ôn luyện tự do (Không tính xếp hạng)</p>
            </div>
          </div>

          <div class="hub-header-badge">
            <span class="beta-pill" style="background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.4); color: #fbbf24;"><i class="fa-solid fa-wand-magic-sparkles"></i> Đầy đủ 6 Trò Chơi Ôn Luyện (Miễn Phí)</span>
          </div>
        </div>

        <!-- MAIN HUB BODY -->
        <div id="games-hub-content" class="games-hub-content">
          ${this.renderSelectorCards()}
        </div>
      </div>
    `;

    this.bindHubEvents();
  }

  renderSelectorCards() {
    return `
      <div class="games-selector-container">
        <div class="games-selector-intro">
          <h3>Chọn 1 trong 6 trò chơi để bắt đầu ôn luyện từ vựng</h3>
          <p>Học tập và rèn luyện phản xạ nhẹ nhàng từ <strong>${this.notebookTitle}</strong>, không tính điểm xếp hạng hay khóa cấp!</p>
        </div>

        <div class="games-selector-grid-6">
          <!-- CARD GAME 0: QUIZ GAME (UNLOCKED ALL) -->
          <div class="game-choice-card card-quiz-highlight" id="btn-choose-quiz" style="cursor: pointer;">
            <div class="card-tag">⭐ GAME ĐỀ XUẤT • TRẮC NGHIỆM 4 ĐÁP ÁN</div>
            <div class="card-icon-hero">🎮 ⚡</div>
            <h3 class="card-title">Đấu Trường Quiz Game</h3>
            <p class="card-desc">
              Trò chơi trắc nghiệm 4 đáp án kiểu Quizizz kinh điển! Ôn tập nhận diện chữ Hán, Pinyin, nghĩa tiếng Việt và phản xạ nghe âm thanh với chuỗi Combo nhân điểm!
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-brain"></i> 4 Lựa chọn nhanh</span>
              <span><i class="fa-solid fa-shield-halved"></i> Ôn tập tự do</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff;">
              Chơi Quiz Game <i class="fa-solid fa-play"></i>
            </button>
          </div>

          <!-- CARD GAME 1: CANNON -->
          <div class="game-choice-card card-cannon" id="btn-choose-cannon" style="cursor: pointer;">
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
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: #ffffff;">
              Chơi Bắn Pháo <i class="fa-solid fa-play"></i>
            </button>
          </div>

          <!-- CARD GAME 2: SNAKE -->
          <div class="game-choice-card card-snake" id="btn-choose-snake" style="cursor: pointer;">
            <div class="card-tag">NHẬN DIỆN MẶT CHỮ & NGHĨA</div>
            <div class="card-icon-hero">🐍 🍏</div>
            <h3 class="card-title">Nuôi Rắn Từ Vựng</h3>
            <p class="card-desc">
              Quan sát chữ Hán đề bài ở trên, điều khiển chú rắn ăn quả táo mang <strong>nghĩa Tiếng Việt chính xác</strong>. Tích đủ <strong>10 chuỗi ngọc</strong> để lên cấp và nhặt vật phẩm may mắn!
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-book-open"></i> Nhớ nghĩa tiếng Việt</span>
              <span><i class="fa-solid fa-layer-group"></i> 5 Cấp độ thử thách</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #059669, #047857); color: #ffffff;">
              Chơi Nuôi Rắn <i class="fa-solid fa-play"></i>
            </button>
          </div>

          <!-- CARD GAME 3: ALCHEMIST -->
          <div class="game-choice-card card-alchemist" id="btn-choose-alchemist" style="cursor: pointer;">
            <div class="card-tag">CHIẾT TỰ & BỘ THỦ</div>
            <div class="card-icon-hero">⚗️ ✨</div>
            <h3 class="card-title">Lò Luyện Chiết TỰ</h3>
            <p class="card-desc">
              Trở thành nhà giả kim! Chọn các <strong>Bộ thủ nguyên liệu</strong> nạp vào vạc luyện kim thần kỳ để hợp nhất chế tạo ra chữ Hán mục tiêu.
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-gem"></i> Nhớ sâu gốc rễ bộ thủ</span>
              <span><i class="fa-solid fa-wand-magic-sparkles"></i> Luyện hợp thể chữ</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #9333ea, #7e22ce); color: #ffffff;">
              Chơi Luyện Chữ <i class="fa-solid fa-play"></i>
            </button>
          </div>

          <!-- CARD GAME 4: MAHJONG -->
          <div class="game-choice-card card-mahjong" id="btn-choose-mahjong" style="cursor: pointer;">
            <div class="card-tag">PHẢN XẠ NỐI CẶP ONET</div>
            <div class="card-icon-hero">🀄 🔍</div>
            <h3 class="card-title">Mạt Chược Nối Từ</h3>
            <p class="card-desc">
              Tìm và nối các cặp quân bài mạt chược tương ứng (<strong>Chữ Hán ↔ Pinyin ↔ Nghĩa</strong>) theo quy tắc đường gấp khúc tối đa 3 đoạn thẳng!
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-link"></i> Nối đường gấp khúc</span>
              <span><i class="fa-solid fa-shuffle"></i> Gió lốc & Bom hỗ trợ</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #d97706, #b45309); color: #ffffff;">
              Chơi Mạt Chược <i class="fa-solid fa-play"></i>
            </button>
          </div>

          <!-- CARD GAME 5: RHYTHM -->
          <div class="game-choice-card card-rhythm" id="btn-choose-rhythm" style="cursor: pointer;">
            <div class="card-tag">ÂM NHẠC & BẮT THANH ĐIỆU</div>
            <div class="card-icon-hero">🎵 🎹</div>
            <h3 class="card-title">Phím Đàn Thanh Điệu</h3>
            <p class="card-desc">
              Lắng nghe phát âm và bấm đúng <strong>4 phím thanh điệu (—, ／, ∨, ＼)</strong> khi nốt nhạc trượt vào vạch nhịp để kích hoạt <strong>Fever Mode x4 Điểm</strong>!
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-headphones"></i> Luyện đôi tai bắt thanh điệu</span>
              <span><i class="fa-solid fa-fire"></i> Chuỗi Fever Mode</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #db2777, #be185d); color: #ffffff;">
              Chơi Phím Đàn <i class="fa-solid fa-play"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindHubEvents() {
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

    // Native Mini-Games (Unlocked for everyone)
    const nativeGames = [
      { id: '#btn-choose-cannon', type: 'cannon' },
      { id: '#btn-choose-snake', type: 'snake' },
      { id: '#btn-choose-alchemist', type: 'alchemist' },
      { id: '#btn-choose-mahjong', type: 'mahjong' },
      { id: '#btn-choose-rhythm', type: 'rhythm' }
    ];

    nativeGames.forEach(g => {
      const card = this.container.querySelector(g.id);
      if (card) {
        card.addEventListener('click', (e) => {
          e.preventDefault();
          this.launchGame(g.type);
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
      if (this.notebookKey) {
        params.set('notebook', this.notebookKey);
        if (this.notebookKey.startsWith('hsk:')) {
          params.set('level', this.notebookKey.replace('hsk:', ''));
        } else if (this.notebookKey.startsWith('yct:')) {
          params.set('level', 'yct' + this.notebookKey.replace('yct:', ''));
        } else if (!isNaN(this.notebookKey)) {
          params.set('level', this.notebookKey);
        }
      }
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

    if (gameType === 'cannon') {
      this.currentGameEngine = new CannonGameEngine(viewport, this.words, onExit);
    } else if (gameType === 'snake') {
      this.currentGameEngine = new SnakeGameEngine(viewport, this.words, onExit);
    } else if (gameType === 'alchemist') {
      this.currentGameEngine = new AlchemistGameEngine(viewport, this.words, onExit);
    } else if (gameType === 'mahjong') {
      this.currentGameEngine = new MahjongGameEngine(viewport, this.words, onExit);
    } else if (gameType === 'rhythm') {
      this.currentGameEngine = new ToneRhythmGameEngine(viewport, this.words, onExit);
    }

    if (this.currentGameEngine && this.currentGameEngine.start) {
      this.currentGameEngine.start();
    }
  }

  returnToSelector() {
    const engine = this.currentGameEngine;
    this.currentGameEngine = null; // Detach immediately before calling stopAndExit
    this.activeGameType = null;
    if (engine && engine.stopAndExit) {
      try {
        engine.stopAndExit();
      } catch (err) {
        console.warn('Error stopping engine on returnToSelector:', err);
      }
    }
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }
    this.render();
  }

  exitHub() {
    const engine = this.currentGameEngine;
    this.currentGameEngine = null; // Detach immediately
    this.activeGameType = null;
    if (engine && engine.stopAndExit) {
      try {
        engine.stopAndExit();
      } catch (err) {
        console.warn('Error stopping engine on exitHub:', err);
      }
    }
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }
    if (this.onExit) {
      try {
        this.onExit();
      } catch (err) {
        console.warn('Error calling onExit:', err);
      }
    }
    if (typeof window.exitNotebookGamesHub === 'function') {
      window.exitNotebookGamesHub();
    }
  }
}
