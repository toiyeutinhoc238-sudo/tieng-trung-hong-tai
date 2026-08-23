/**
 * Tiếng Trung HongTai - In-Notebook Games Hub Coordinator
 * Tích hợp 2 Mini-Game học tập Native trực tiếp vào Sổ tay từ vựng
 * Giới hạn thử nghiệm: Super Admin Only
 */

import { CannonGameEngine } from './notebook_cannon_game.js';
import { SnakeGameEngine } from './notebook_snake_game.js';

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
              <h2 class="games-hub-title"><i class="fa-solid fa-gamepad" style="color: #ec4899;"></i> Game Ôn Tập Sổ Tay</h2>
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
          <h3>Chọn trò chơi để bắt đầu ôn tập</h3>
          <p>Dữ liệu câu hỏi được lấy trực tiếp từ <strong>${this.notebookTitle}</strong> để bạn củng cố kiến thức thực chiến!</p>
        </div>

        <div class="games-selector-grid">
          <!-- CARD GAME 1: CANNON -->
          <div class="game-choice-card card-cannon" id="btn-choose-cannon" style="cursor: pointer;">
            <div class="card-tag">PHẢN XẠ PINYIN & BẢN ĐỒ BOM</div>
            <div class="card-icon-hero">💥 🚀</div>
            <h3 class="card-title">Bắn Pháo Từ Vựng</h3>
            <p class="card-desc">
              Các từ vựng rơi từ trên cao! Nhanh tay gõ <strong>Pinyin</strong> để khẩu pháo xoay nòng bắn nổ chữ Hán. Tránh xa các thẻ có <strong>BOM 💣</strong> và dùng Combo mở khóa <strong>Mưa Băng, Lá Chắn</strong>!
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-bolt"></i> Luyện gõ Pinyin</span>
              <span><i class="fa-solid fa-snowflake"></i> Kỹ năng làm chậm</span>
              <span><i class="fa-solid fa-shield"></i> Né bom bẫy</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" id="btn-launch-cannon-inner">Chơi Bắn Pháo <i class="fa-solid fa-play"></i></button>
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
              <span><i class="fa-solid fa-heart"></i> Hồi tim & X2 chuỗi</span>
              <span><i class="fa-solid fa-layer-group"></i> 5 Cấp độ thử thách</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" id="btn-launch-snake-inner" style="background: linear-gradient(135deg, #10b981, #059669);">Chơi Nuôi Rắn <i class="fa-solid fa-play"></i></button>
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
          Hệ thống <strong>2 Mini-Game Sổ Tay (Bắn Pháo Pinyin & Nuôi Rắn Từ Vựng)</strong> hiện đang trong giai đoạn thử nghiệm nội bộ dành riêng cho tài khoản <strong>Super Admin</strong>.
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

    const cannonCard = this.container.querySelector('#btn-choose-cannon');
    if (cannonCard) {
      cannonCard.addEventListener('click', (e) => {
        e.preventDefault();
        this.launchGame('cannon');
      });
    }

    const snakeCard = this.container.querySelector('#btn-choose-snake');
    if (snakeCard) {
      snakeCard.addEventListener('click', (e) => {
        e.preventDefault();
        this.launchGame('snake');
      });
    }
  }

  launchGame(gameType) {
    if (this.words.length < 4) {
      if (typeof window.showToast === 'function') {
        window.showToast('Cần ít nhất 4 từ vựng trong sổ tay này để chơi game!', true);
      }
      return;
    }

    const contentArea = this.container.querySelector('#games-hub-content');
    if (!contentArea) return;

    this.activeGameType = gameType;
    contentArea.innerHTML = '<div id="game-active-viewport" class="game-active-viewport"></div>';
    const viewport = contentArea.querySelector('#game-active-viewport');

    if (gameType === 'cannon') {
      this.currentGameEngine = new CannonGameEngine(viewport, this.words, () => {
        this.returnToSelector();
      });
      this.currentGameEngine.start();
    } else if (gameType === 'snake') {
      this.currentGameEngine = new SnakeGameEngine(viewport, this.words, () => {
        this.returnToSelector();
      });
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
