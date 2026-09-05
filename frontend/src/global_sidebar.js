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
      const stored = localStorage.getItem('user') || localStorage.getItem('hongtai_current_user') || localStorage.getItem('currentUser') || sessionStorage.getItem('user');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  }

  // Update user profile card in DOM if user state changes
  function updateSidebarUserProfile() {
    const user = getCurrentUser();
    const sidebars = document.querySelectorAll('.app-sidebar, .global-app-sidebar');
    sidebars.forEach(sidebar => {
      const nameEl = sidebar.querySelector('.user-name, #user-display-name');
      const emailEl = sidebar.querySelector('.user-sub, #user-display-email');
      const roleEl = sidebar.querySelector('.user-role-badge, #user-display-role');
      const avatarWrap = sidebar.querySelector('.sidebar-avatar-wrap');

      if (user && (user.name || user.email)) {
        const displayName = user.name || user.displayName || (user.email ? user.email.split('@')[0] : 'Học viên');
        const displayEmail = user.email || '';
        const displayRole = user.role === 'super_admin' ? 'Super Admin' : (user.role === 'admin' ? 'Admin' : (user.role === 'teacher' ? 'Giáo viên' : 'Học viên'));
        const displayAvatar = user.picture || user.avatar || '';

        if (nameEl) nameEl.textContent = displayName;
        if (emailEl) emailEl.textContent = displayEmail;
        if (roleEl) roleEl.textContent = displayRole;
        if (avatarWrap) {
          if (displayAvatar) {
            avatarWrap.innerHTML = `<img class="user-avatar-img" src="${displayAvatar}" alt="Avatar" style="display: block; width: 44px; height: 44px; border-radius: 50%; object-fit: cover;">`;
          } else {
            avatarWrap.innerHTML = `<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>`;
          }
        }
      } else {
        if (nameEl) nameEl.textContent = 'Khách (Chưa đăng nhập)';
        if (emailEl) emailEl.textContent = 'Đăng nhập để lưu tiến độ học';
        if (roleEl) roleEl.textContent = 'Khách';
        if (avatarWrap) {
          avatarWrap.innerHTML = `<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>`;
        }
      }
    });
  }

  // Generate Sidebar Drawer HTML
  function buildSidebarHTML() {
    const activeKey = getActiveRouteKey();
    const user = getCurrentUser();

    const userName = user ? (user.name || user.displayName || (user.email ? user.email.split('@')[0] : 'Học viên')) : 'Khách (Chưa đăng nhập)';
    const userEmail = user ? (user.email || '') : 'Đăng nhập để lưu tiến độ học';
    const userRole = user ? (user.role === 'super_admin' ? 'Super Admin' : (user.role === 'admin' ? 'Admin' : (user.role === 'teacher' ? 'Giáo viên' : 'Học viên'))) : 'Khách';
    const userAvatar = user && (user.picture || user.avatar) ? (user.picture || user.avatar) : '';

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
            ${userAvatar ? `<img class="user-avatar-img" src="${userAvatar}" alt="Avatar" style="display: block; width: 44px; height: 44px; border-radius: 50%; object-fit: cover;">` : `<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>`}
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

        <!-- DANH MỤC: GIAO DIỆN -->
        <div class="sidebar-section-label">Giao Diện</div>
        <ul class="sidebar-menu" style="margin-bottom: 24px;">
          <li class="sidebar-item" onclick="window.toggleTheme && window.toggleTheme()">
            <i class="fa-solid fa-moon" style="color: #60a5fa;"></i> <span>Chế độ Sáng / Tối</span>
          </li>
          <li class="sidebar-item" onclick="window.toggleSeasonalParticles && window.toggleSeasonalParticles()">
            <i class="fa-solid fa-snowflake" style="color: #38bdf8;"></i> <span>Hiệu ứng Mùa rơi</span>
          </li>
        </ul>
      </div>
    </aside>
    `;
  }

  // Toggle & Control Functions
  window.openGlobalSidebar = function () {
    updateSidebarUserProfile();
    const isIndex = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
    if (isIndex && window.innerWidth >= 768) {
      document.body.classList.remove('sidebar-collapsed');
      localStorage.setItem('sidebar_collapsed', 'false');
      return;
    }

    const sidebar = document.querySelector('.app-sidebar') || document.getElementById('global-app-sidebar');
    const backdrop = document.querySelector('.sidebar-backdrop') || document.getElementById('global-sidebar-backdrop');
    if (sidebar) {
      sidebar.classList.add('open', 'active');
      sidebar.style.pointerEvents = 'auto';
    }
    if (backdrop && (!isIndex || window.innerWidth < 768)) {
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
    const isIndex = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
    if (isIndex && window.innerWidth >= 768) {
      if (window.toggleSidebarCollapse) {
        window.toggleSidebarCollapse();
      } else {
        document.body.classList.toggle('sidebar-collapsed');
      }
      return;
    }

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
    const isIndex = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');

    // On desktop and tablet index page (>= 768px), default to expanded sidebar
    if (isIndex && window.innerWidth >= 768) {
      document.body.classList.remove('sidebar-collapsed');
      localStorage.setItem('sidebar_collapsed', 'false');
    }

    // 1. Ensure Backdrop exists
    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop' + (isIndex ? ' on-index' : '');
      backdrop.id = 'global-sidebar-backdrop';
      document.body.appendChild(backdrop);
    } else if (isIndex) {
      backdrop.classList.add('on-index');
    }
    backdrop.addEventListener('click', function (e) {
      window.closeGlobalSidebar();
    });

    // 2. If no sidebar on this page (i.e. not index.html), inject global sidebar
    let existingSidebar = document.querySelector('.app-sidebar');
    
    if (!existingSidebar && !isIndex) {
      const container = document.createElement('div');
      container.id = 'global-sidebar-mount';
      container.innerHTML = buildSidebarHTML();
      document.body.insertBefore(container.firstElementChild, document.body.firstChild);
    }

    // Synchronize user profile into sidebar
    updateSidebarUserProfile();
    window.addEventListener('storage', updateSidebarUserProfile);
    window.addEventListener('user-auth-changed', updateSidebarUserProfile);
    setTimeout(updateSidebarUserProfile, 500);
    setTimeout(updateSidebarUserProfile, 1500);

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

    // 5. Initialize Floating Menu Bubble Widget (Style Bong Bóng giống nút Chatbot)
    initMenuBubbleWidget();

    // 6. Connect all existing and new hamburger / menu toggle buttons
    const bindMenuButtons = () => {
      document.querySelectorAll('.menu-toggle-btn, .global-hamburger-btn, .sidebar-open-btn, .top-menu-btn, #top-sidebar-toggle-btn, #sidebar-expand-float-btn, .sidebar-expand-float-btn, #mobile-nav-toggle-btn').forEach(btn => {
        btn.onclick = window.toggleGlobalSidebar;
      });
    };
    bindMenuButtons();
    setTimeout(bindMenuButtons, 500);
  }

  // Floating Menu Bubble Widget (Style Bong Bóng giống nút Chatbot AI)
  function initMenuBubbleWidget() {
    if (document.getElementById('menu-bubble-widget')) return;

    const isIndex = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
    const bubbleWidget = document.createElement('div');
    bubbleWidget.className = 'menu-bubble-widget' + (isIndex ? ' on-index-page' : '');
    bubbleWidget.id = 'menu-bubble-widget';

    const bubbleBtn = document.createElement('button');
    bubbleBtn.className = 'menu-bubble-btn';
    bubbleBtn.id = 'menu-bubble-btn';
    bubbleBtn.title = 'Mở Menu Danh Mục (☰)';
    bubbleBtn.setAttribute('aria-label', 'Mở Menu Danh Mục');
    bubbleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';

    bubbleWidget.appendChild(bubbleBtn);
    document.body.appendChild(bubbleWidget);

    enableBubbleDrag(bubbleWidget, bubbleBtn);
  }

  function enableBubbleDrag(widgetEl, btnEl) {
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;
    let hasMoved = false;

    function getCoords(e) {
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    }

    function onPointerDown(e) {
      if (e.button && e.button !== 0) return;
      const coords = getCoords(e);
      startX = coords.x;
      startY = coords.y;
      const rect = widgetEl.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      hasMoved = false;
      isDragging = true;
      widgetEl.style.transition = 'none';
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      const coords = getCoords(e);
      const dx = coords.x - startX;
      const dy = coords.y - startY;

      if (!hasMoved && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        hasMoved = true;
      }

      if (hasMoved) {
        if (e.cancelable) e.preventDefault();
        const maxX = window.innerWidth - widgetEl.offsetWidth - 10;
        const maxY = window.innerHeight - widgetEl.offsetHeight - 10;
        const newX = Math.max(10, Math.min(maxX, initialLeft + dx));
        const newY = Math.max(10, Math.min(maxY, initialTop + dy));

        widgetEl.style.left = `${newX}px`;
        widgetEl.style.top = `${newY}px`;
        widgetEl.style.bottom = 'auto';
        widgetEl.style.right = 'auto';
      }
    }

    function onPointerUp(e) {
      if (!isDragging) return;
      isDragging = false;
      widgetEl.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';

      if (!hasMoved) {
        window.toggleGlobalSidebar();
      } else {
        const rect = widgetEl.getBoundingClientRect();
        const midX = window.innerWidth / 2;
        const isLeft = (rect.left + rect.width / 2) < midX;
        if (isLeft) {
          widgetEl.style.left = '16px';
          widgetEl.style.right = 'auto';
        } else {
          widgetEl.style.left = `${window.innerWidth - rect.width - 16}px`;
          widgetEl.style.right = 'auto';
        }
      }
    }

    btnEl.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);

    btnEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
  }

  function injectTopMenuButtonIfMissing() {
    // Keep navbar insertion only for pages that have standard nav-container or top-bar
    const alreadyHasBtn = document.querySelector('.global-hamburger-btn, #mobile-nav-toggle-btn, #top-sidebar-toggle-btn');
    if (alreadyHasBtn) {
      alreadyHasBtn.onclick = window.toggleGlobalSidebar;
      return;
    }

    const headerConfigs = [
      { container: '.navbar .nav-container', insertBefore: '.nav-brand' },
      { container: '.top-bar', insertBefore: ':first-child' },
      { container: '.rd-header-left', insertBefore: ':first-child' },
      { container: '.dict-top-nav', insertBefore: '.dict-brand' }
    ];

    for (const cfg of headerConfigs) {
      const parent = document.querySelector(cfg.container);
      if (parent) {
        if (parent.querySelector('.global-hamburger-btn, .menu-toggle-btn, #sidebar-expand-float-btn')) {
          break;
        }

        const menuBtn = document.createElement('button');
        menuBtn.className = 'menu-toggle-btn global-hamburger-btn';
        menuBtn.id = 'global-hamburger-btn';
        menuBtn.title = 'Mở Menu Danh Mục';
        menuBtn.setAttribute('aria-label', 'Mở Menu Danh Mục');
        menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
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
        break;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalSidebar);
  } else {
    initGlobalSidebar();
  }

})();
