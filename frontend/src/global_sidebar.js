/**
 * Tiếng Trung HongTai - Global Navigation Sidebar & Mobile Drawer Coordinator
 * Cung cấp thanh menu điều hướng thống nhất xuyên suốt tất cả các trang.
 */

(function () {
  'use strict';

  // Helper to determine active link
  function getActiveRouteKey() {
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();

    if (path === '/' || path.endsWith('/index.html')) {
      if (search.includes('tab=flashcards')) return 'flashcards';
      if (search.includes('view=roadmap') || window.location.hash.includes('roadmap')) return 'roadmap';
      return 'home';
    }
    if (path.includes('video-dictation')) {
      return search.includes('mode=shadowing') ? 'shadowing' : 'dictation';
    }
    if (path.includes('reading-practice')) return 'reading';
    if (path.includes('chinese-phonetics')) return 'phonetics';
    if (path.includes('chinese-radicals')) return 'radicals';
    if (path.includes('hanzi-writer')) return 'hanzi';
    if (path.includes('hsk-grammar')) return 'grammar';
    if (path.includes('lesson-texts')) return 'texts';
    if (path.includes('detail-list')) return 'vocabulary';
    if (path.includes('quiz-game')) return 'games';
    if (path.includes('han-viet-rules')) return 'rules';
    if (path.includes('rank')) return 'rank';
    return '';
  }

  // Get current user info from localStorage or session
  function getCurrentUser() {
    try {
      const stored = localStorage.getItem('hongtai_current_user') || localStorage.getItem('currentUser');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  }

  // Generate Sidebar Drawer HTML
  function buildSidebarHTML() {
    const activeKey = getActiveRouteKey();
    const user = getCurrentUser();

    const userName = user ? (user.name || user.displayName || 'Học viên') : 'Khách (Chưa đăng nhập)';
    const userEmail = user ? (user.email || '') : 'Đăng nhập để lưu tiến độ học';
    const userRole = user ? (user.role === 'super_admin' ? 'Super Admin' : (user.role === 'admin' ? 'Admin' : (user.role === 'teacher' ? 'Giáo viên' : 'Học viên'))) : 'Khách';
    const userAvatar = user && user.picture ? user.picture : '';

    return `
    <aside class="app-sidebar global-app-sidebar" id="global-app-sidebar">
      <div class="sidebar-header">
        <a href="/" style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1; text-decoration: none;">
          <img class="sidebar-logo" src="/assets/logo.png" alt="Hongtai Logo">
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary, #ffffff); letter-spacing: -0.01em;">Hongtai Chinese</span>
          </div>
        </a>
        <button class="sidebar-toggle-btn" onclick="window.closeGlobalSidebar()" title="Đóng Menu (✕)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- User Account Card -->
      <div class="auth-container" style="width: 100%; border-bottom: 1px solid var(--border-glass, rgba(255,255,255,0.12)); padding-bottom: 12px; margin-bottom: 12px;">
        <div class="sidebar-profile-card" onclick="if(window.location.pathname !== '/' && !window.location.pathname.endsWith('/index.html')) { window.location.href='/'; }">
          <div class="sidebar-avatar-wrap">
            ${userAvatar ? `<img class="user-avatar-img" src="${userAvatar}" alt="Avatar" style="display: block;">` : `<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>`}
          </div>
          <div class="user-info">
            <span class="user-name">${userName}</span>
            <span class="user-sub">${userEmail}</span>
            <span class="user-role-badge">${userRole}</span>
          </div>
        </div>
      </div>

      <div class="sidebar-menu-wrapper" style="width: 100%; box-sizing: border-box;">
        <!-- TRANG CHỦ -->
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${activeKey === 'home' ? 'active' : ''}" onclick="window.location.href = '/'">
            <i class="fa-solid fa-house"></i> <span>Trang chủ</span>
          </li>
        </ul>

        <!-- DANH MỤC: HỌC TẬP -->
        <div class="sidebar-section-label">Học Tập</div>
        <ul class="sidebar-menu" style="margin-bottom: 8px;">
          <li class="sidebar-item ${activeKey === 'roadmap' ? 'active' : ''}" onclick="window.location.href = '/index.html#roadmap'">
            <i class="fa-solid fa-route" style="color: #60a5fa;"></i> <span>Lộ trình</span>
          </li>
          <li class="sidebar-item ${activeKey === 'vocabulary' ? 'active' : ''}" onclick="window.location.href = '/detail-list.html'">
            <i class="fa-solid fa-font" style="color: #38bdf8;"></i> <span>Từ vựng HSK</span>
          </li>
          <li class="sidebar-item ${activeKey === 'radicals' ? 'active' : ''}" onclick="window.location.href = '/chinese-radicals.html'">
            <i class="fa-solid fa-shapes" style="color: #a855f7;"></i> <span>Bảng Bộ Thủ</span>
          </li>
          <li class="sidebar-item ${activeKey === 'phonetics' ? 'active' : ''}" onclick="window.location.href = '/chinese-phonetics.html'">
            <i class="fa-solid fa-table-cells" style="color: #38bdf8;"></i> <span>Bảng Phiên Âm (Pinyin)</span>
          </li>
          <li class="sidebar-item ${activeKey === 'hanzi' ? 'active' : ''}" onclick="window.location.href = '/hanzi-writer.html'">
            <i class="fa-solid fa-pen-nib" style="color: #f59e0b;"></i> <span>Tập viết chữ Hán</span>
          </li>
          <li class="sidebar-item ${activeKey === 'grammar' ? 'active' : ''}" onclick="window.location.href = '/hsk-grammar.html'">
            <i class="fa-solid fa-spell-check" style="color: #34d399;"></i> <span>Sổ tay Ngữ Pháp</span>
          </li>
          <li class="sidebar-item ${activeKey === 'texts' ? 'active' : ''}" onclick="window.location.href = '/lesson-texts.html'">
            <i class="fa-solid fa-comments" style="color: #fb923c;"></i> <span>Bài Khóa & Hội Thoại</span>
          </li>
        </ul>

        <!-- DANH MỤC: TRÒ CHƠI -->
        <div class="sidebar-section-label">Trò Chơi</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${activeKey === 'games' ? 'active' : ''}" onclick="window.location.href = '/quiz-game.html'">
            <i class="fa-solid fa-gamepad" style="color: #f59e0b;"></i> <span>Trò Chơi Ôn Tập</span>
            <span style="font-size:0.68rem; background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; padding:2px 7px; border-radius:6px; font-weight:800; margin-left:auto; white-space:nowrap;">🔥 5 Game</span>
          </li>
        </ul>

        <!-- DANH MỤC: KỸ NĂNG -->
        <div class="sidebar-section-label">Kỹ Năng & Video</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${activeKey === 'shadowing' ? 'active' : ''}" onclick="window.location.href = '/video-dictation.html?mode=shadowing'">
            <i class="fa-solid fa-microphone-lines" style="color: #10b981;"></i> <span>Shadowing Video</span>
            <span style="font-size:0.68rem; background:linear-gradient(135deg, #10b981, #059669); color:#fff; padding:2px 7px; border-radius:6px; font-weight:800; margin-left:auto; white-space:nowrap;">🔥 24 Video</span>
          </li>
          <li class="sidebar-item ${activeKey === 'dictation' ? 'active' : ''}" onclick="window.location.href = '/video-dictation.html?mode=dictation'">
            <i class="fa-solid fa-pen-to-square" style="color: #38bdf8;"></i> <span>Chép Chính Tả</span>
            <span style="font-size:0.68rem; background:linear-gradient(135deg, #0284c7, #2563eb); color:#fff; padding:2px 7px; border-radius:6px; font-weight:800; margin-left:auto; white-space:nowrap;">🔥 24 Video</span>
          </li>
          <li class="sidebar-item ${activeKey === 'reading' ? 'active' : ''}" onclick="window.location.href = '/reading-practice.html'">
            <i class="fa-solid fa-book-open-reader" style="color: #ec4899;"></i> <span>Luyện Đọc HSK</span>
            <span style="font-size:0.68rem; background:linear-gradient(135deg, #ec4899, #db2777); color:#fff; padding:2px 7px; border-radius:6px; font-weight:800; margin-left:auto; white-space:nowrap;">🔥 33 Bài</span>
          </li>
          <li class="sidebar-item ${activeKey === 'rules' ? 'active' : ''}" onclick="window.location.href = '/han-viet-rules.html'">
            <i class="fa-solid fa-book-bookmark" style="color: #8b5cf6;"></i> <span>Quy Tắc Hán Việt</span>
          </li>
          <li class="sidebar-item ${activeKey === 'rank' ? 'active' : ''}" onclick="window.location.href = '/rank.html'">
            <i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span>Bảng Xếp Hạng</span>
          </li>
        </ul>
      </div>
    </aside>
    `;
  }

  // Toggle & Control Functions
  window.openGlobalSidebar = function () {
    document.body.classList.remove('sidebar-collapsed');
    const sidebar = document.querySelector('.app-sidebar') || document.getElementById('global-app-sidebar');
    const backdrop = document.querySelector('.sidebar-backdrop') || document.getElementById('global-sidebar-backdrop');
    if (sidebar) {
      sidebar.classList.add('open', 'active');
      sidebar.style.pointerEvents = 'auto';
    }
    if (backdrop) {
      backdrop.classList.add('active');
    }
    document.body.classList.add('sidebar-open');
  };

  window.closeGlobalSidebar = function () {
    const sidebar = document.querySelector('.app-sidebar') || document.getElementById('global-app-sidebar');
    const backdrop = document.querySelector('.sidebar-backdrop') || document.getElementById('global-sidebar-backdrop');
    if (sidebar) {
      sidebar.classList.remove('open', 'active');
    }
    if (backdrop) {
      backdrop.classList.remove('active');
    }
    document.body.classList.remove('sidebar-open');
  };

  window.toggleGlobalSidebar = function () {
    const sidebar = document.querySelector('.app-sidebar') || document.getElementById('global-app-sidebar');
    if (sidebar && (sidebar.classList.contains('open') || sidebar.classList.contains('active') || document.body.classList.contains('sidebar-open'))) {
      window.closeGlobalSidebar();
    } else {
      window.openGlobalSidebar();
    }
  };

  // Attach global keyboard ESC listener
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      window.closeGlobalSidebar();
    }
  });

  // Inject or setup on DOM Ready
  function initGlobalSidebar() {
    // 1. Ensure Backdrop exists
    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      backdrop.id = 'global-sidebar-backdrop';
      document.body.appendChild(backdrop);
    }
    backdrop.addEventListener('click', function (e) {
      window.closeGlobalSidebar();
    });

    // 2. If no sidebar on this page (i.e. not index.html), inject global sidebar
    const isIndex = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
    let existingSidebar = document.querySelector('.app-sidebar');
    
    if (!existingSidebar && !isIndex) {
      const container = document.createElement('div');
      container.id = 'global-sidebar-mount';
      container.innerHTML = buildSidebarHTML();
      document.body.insertBefore(container.firstElementChild, document.body.firstChild);
    }

    // 3. Stop click propagation on sidebars to prevent accidental closing
    document.querySelectorAll('.app-sidebar, .global-app-sidebar').forEach(sb => {
      sb.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });

    // 4. Auto-close sidebar on mobile when any navigation item is clicked
    const bindItemClicks = () => {
      document.querySelectorAll('.app-sidebar .sidebar-item, .global-app-sidebar .sidebar-item, .app-sidebar .sidebar-subitem, .global-app-sidebar .sidebar-subitem').forEach(item => {
        if (item.classList.contains('sidebar-dropdown-toggle')) return;
        item.style.pointerEvents = 'auto';
        item.addEventListener('click', () => {
          if (window.innerWidth <= 900) {
            setTimeout(() => {
              window.closeGlobalSidebar();
            }, 120);
          }
        });
      });
    };
    bindItemClicks();
    setTimeout(bindItemClicks, 600);

    // 5. Inject top-left hamburger menu button if missing (runs across all pages, mobile & desktop)
    injectTopMenuButtonIfMissing();

    // 6. Connect all existing and new hamburger / menu toggle buttons
    const bindMenuButtons = () => {
      document.querySelectorAll('.menu-toggle-btn, .global-hamburger-btn, .sidebar-open-btn, .top-menu-btn, #top-sidebar-toggle-btn, #sidebar-expand-float-btn, .sidebar-expand-float-btn, #mobile-nav-toggle-btn').forEach(btn => {
        btn.onclick = window.toggleGlobalSidebar;
      });
    };
    bindMenuButtons();
    setTimeout(bindMenuButtons, 500);
  }

  function injectTopMenuButtonIfMissing() {
    // 1. Check if there's already an active hamburger button in any primary header
    const alreadyHasBtn = document.querySelector('.global-hamburger-btn, #mobile-nav-toggle-btn, #top-sidebar-toggle-btn');
    if (alreadyHasBtn) {
      alreadyHasBtn.onclick = window.toggleGlobalSidebar;
      return;
    }

    // 2. Comprehensive header insertion points across all pages in the app
    const headerConfigs = [
      { container: '.navbar .nav-container', insertBefore: '.nav-brand' },
      { container: '.top-bar', insertBefore: ':first-child' },
      { container: '.rd-header-left', insertBefore: ':first-child' },
      { container: '.rd-header-bar', insertBefore: ':first-child' },
      { container: '.dict-top-nav', insertBefore: '.dict-brand' },
      { container: '.grammar-header .brand-box', insertBefore: ':first-child' },
      { container: '.grammar-header', insertBefore: ':first-child' },
      { container: '.hanzi-header .brand-box', insertBefore: ':first-child' },
      { container: '.hanzi-header', insertBefore: ':first-child' },
      { container: '.phonetics-header .brand-box', insertBefore: ':first-child' },
      { container: '.phonetics-header', insertBefore: ':first-child' },
      { container: '.header-card > div:first-child', insertBefore: ':first-child' },
      { container: '.header-card', insertBefore: ':first-child' },
      { container: '.header-panel .logo', insertBefore: ':first-child' },
      { container: '.header-panel', insertBefore: ':first-child' },
      { container: '.rank-header-nav', insertBefore: '.rank-brand-logo' },
      { container: '.rules-header', insertBefore: '.rules-title-group' },
      { container: '.header-bar .header-title-wrap', insertBefore: ':first-child' },
      { container: '.chat-view-header', insertBefore: ':first-child' },
      { container: 'header', insertBefore: ':first-child' }
    ];

    let inserted = false;
    for (const cfg of headerConfigs) {
      const parent = document.querySelector(cfg.container);
      if (parent) {
        if (parent.querySelector('.global-hamburger-btn, .menu-toggle-btn, #sidebar-expand-float-btn')) {
          inserted = true;
          break;
        }

        const menuBtn = document.createElement('button');
        menuBtn.className = 'menu-toggle-btn global-hamburger-btn';
        menuBtn.id = 'global-hamburger-btn';
        menuBtn.title = 'Mở Menu Danh Mục';
        menuBtn.setAttribute('aria-label', 'Mở Menu Danh Mục');
        menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i> <span class="btn-text">Menu</span>';
        menuBtn.onclick = window.toggleGlobalSidebar;

        if (cfg.insertBefore === ':first-child') {
          parent.insertBefore(menuBtn, parent.firstChild);
        } else {
          const target = parent.querySelector(cfg.insertBefore);
          if (target) {
            parent.insertBefore(menuBtn, target);
          } else {
            parent.insertBefore(menuBtn, parent.firstChild);
          }
        }
        inserted = true;
        break;
      }
    }



    // 3. Fallback floating button if no standard header is present
    if (!inserted && !document.querySelector('.floating-menu-trigger-btn')) {
      const floatingBtn = document.createElement('button');
      floatingBtn.className = 'menu-toggle-btn global-hamburger-btn floating-menu-trigger-btn';
      floatingBtn.id = 'global-floating-menu-btn';
      floatingBtn.title = 'Mở Menu Danh Mục';
      floatingBtn.setAttribute('aria-label', 'Mở Menu Danh Mục');
      floatingBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      floatingBtn.onclick = window.toggleGlobalSidebar;
      document.body.appendChild(floatingBtn);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalSidebar);
  } else {
    initGlobalSidebar();
  }

})();
