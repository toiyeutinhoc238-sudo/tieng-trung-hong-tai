/**
 * Tiếng Trung HongTai - In-Notebook Games Hub Coordinator (Arcade 6 Mini-Games)
 * Tích hợp 6 Mini-Game học tập Native trực tiếp vào Sổ tay từ vựng
 * Giới hạn thử nghiệm: Super Admin Only
 */

import { CannonGameEngine } from './notebook_cannon_game.js';
import { SnakeGameEngine } from './notebook_snake_game.js';
import { AlchemistGameEngine } from './notebook_alchemist_game.js';
import { MahjongGameEngine } from './notebook_mahjong_game.js';
import { ToneRhythmGameEngine } from './notebook_tone_rhythm_game.js';
import { GoldMinerGameEngine } from './notebook_goldminer_game.js';

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
    this.currentUser = options.currentUser || null;
    this.onExit = options.onExit || (() => {});

    this.currentGameEngine = null;
    this.activeGameType = null;

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
              <h2 class="games-hub-title"><i class="fa-solid fa-gamepad" style="color: #ec4899;"></i> Game Ôn Tập Sổ Tay (6 Mini-Games)</h2>
              <p class="games-hub-sub">${this.notebookTitle} • ${this.words.length} từ vựng khả dụng</p>
            </div>
          </div>

          <div class="hub-header-badge">
            <span class="beta-pill"><i class="fa-solid fa-crown" style="color: #fbbf24;"></i> Beta Thử Nghiệm Super Admin</span>
          </div>
        </div>

        <!-- MAIN HUB BODY -->
        <div id="games-hub-content" class="games-hub-content">
          ${isSuper ? this.renderSelectorCards() : this.renderAccessDeniedCard()}
        </div>
      </div>
    `;

    this.bindHubEvents();
  }

  renderSelectorCards() {
    return `
      <div class="games-selector-container">
        <div class="games-selector-intro">
          <h3>Chọn trò chơi để bắt đầu ôn tập thực chiến</h3>
          <p>Dữ liệu câu hỏi được lấy trực tiếp từ <strong>${this.notebookTitle}</strong> giúp bạn rèn luyện phản xạ toàn diện!</p>
        </div>

        <div class="games-selector-grid-6">
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
            <button type="button" class="btn btn-primary game-launch-btn">Chơi Bắn Pháo <i class="fa-solid fa-play"></i></button>
          </div>

          <!-- CARD GAME 2: SNAKE -->
          <div class="game-choice-card card-snake" id="btn-choose-snake" style="cursor: pointer;">
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
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #10b981, #059669);">Chơi Nuôi Rắn <i class="fa-solid fa-play"></i></button>
          </div>

          <!-- CARD GAME 3: ALCHEMIST -->
          <div class="game-choice-card card-alchemist" id="btn-choose-alchemist" style="cursor: pointer;">
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
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #a855f7, #7e22ce);">Chơi Luyện Chữ <i class="fa-solid fa-play"></i></button>
          </div>

          <!-- CARD GAME 4: MAHJONG -->
          <div class="game-choice-card card-mahjong" id="btn-choose-mahjong" style="cursor: pointer;">
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
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #f59e0b, #d97706);">Chơi Mạt Chược <i class="fa-solid fa-play"></i></button>
          </div>

          <!-- CARD GAME 5: RHYTHM -->
          <div class="game-choice-card card-rhythm" id="btn-choose-rhythm" style="cursor: pointer;">
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
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #ec4899, #be185d);">Chơi Phím Đàn <i class="fa-solid fa-play"></i></button>
          </div>

          <!-- CARD GAME 6: GOLD MINER -->
          <div class="game-choice-card card-miner" id="btn-choose-miner" style="cursor: pointer;">
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
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #0ea5e9, #0284c7);">Chơi Đào Vàng <i class="fa-solid fa-play"></i></button>
          </div>
        </div>
      </div>
    `;
  }

  renderAccessDeniedCard() {
    return `
      <div class="games-access-denied-card">
        <div style="font-size: 3.5rem; margin-bottom: 14px;">🔒</div>
        <h3 style="font-size: 1.4rem; font-weight: 800; color: #fbbf24; margin-bottom: 8px;">Tính Năng Đang Thử Nghiệm Nội Bộ</h3>
        <p style="color: #cbd5e1; font-size: 0.95rem; max-width: 520px; margin: 0 auto 20px auto; line-height: 1.6;">
          Hệ thống <strong>6 Mini-Game Sổ Tay Arcade</strong> hiện đang trong giai đoạn thử nghiệm nội bộ dành riêng cho tài khoản <strong>Super Admin</strong>.
          <br><br>
          Tính năng sẽ sớm được phát hành chính thức cho toàn bộ học viên!
        </p>
        <button type="button" id="btn-denied-back" class="btn btn-primary" style="padding: 10px 24px; border-radius: 50px; font-weight: 800; cursor: pointer;">
          Quay lại Sổ tay
        </button>
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

    const deniedBack = this.container.querySelector('#btn-denied-back');
    if (deniedBack) {
      deniedBack.addEventListener('click', (e) => {
        e.preventDefault();
        this.exitHub();
      });
    }

    // Connect all 6 Game Cards
    const games = [
      { id: '#btn-choose-cannon', type: 'cannon' },
      { id: '#btn-choose-snake', type: 'snake' },
      { id: '#btn-choose-alchemist', type: 'alchemist' },
      { id: '#btn-choose-mahjong', type: 'mahjong' },
      { id: '#btn-choose-rhythm', type: 'rhythm' },
      { id: '#btn-choose-miner', type: 'miner' }
    ];

    games.forEach(g => {
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
    this.render();
  }

  exitHub() {
    if (this.currentGameEngine && this.currentGameEngine.stopAndExit) {
      this.currentGameEngine.stopAndExit();
    }
    this.currentGameEngine = null;
    this.activeGameType = null;
    if (this.onExit) {
      this.onExit();
    }
    if (typeof window.exitNotebookGamesHub === 'function') {
      window.exitNotebookGamesHub();
    }
  }
}
