import './particles.js';
import './screen_drawing.js';
import './chatbot_widget.js';
import './quick_dict_widget.js';

/**
 * Tiếng Trung HongTai - Global Navigation Sidebar & Mobile Drawer Coordinator
 * Cung cấp thanh menu điều hướng thống nhất xuyên suốt tất cả các trang.
 */

(function () {
  'use strict';

  // Do not render global sidebar or mobile navigation inside iframes
  if (window.self !== window.top) return;

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
    if (path.includes('translation-practice') || path.includes('paragraph-practice')) return 'translation';
    if (path.includes('writing-practice')) return 'writing';
    if (path.includes('speaking-practice')) return 'speaking';
    if (path.includes('sentence-reorder')) return 'sentence-reorder';
    if (path.includes('ai-dialogue')) return 'ai-dialogue';
    if (path.includes('reading-practice')) return 'reading';
    if (path.includes('chinese-phonetics')) return 'phonetics';
    if (path.includes('chinese-radicals')) return 'radicals';
    if (path.includes('hanzi-writer')) return 'hanzi';
    if (path.includes('hsk-grammar')) return 'grammar';
    if (path.includes('lesson-texts')) return 'texts';
    if (path.includes('vocab-practice')) return 'vocab-practice';
    if (path.includes('detail-list')) return 'vocabulary';
    if (path.includes('quiz-game')) return 'games';
    if (path.includes('han-viet-rules')) return 'rules';
    if (path.includes('rank')) return 'rank';
    if (path.includes('documents')) return 'documents';
    return '';
  }

  // Global toggle for sidebar dropdowns
  window.toggleSidebarDropdown = function (el) {
    if (!el) return;
    const group = el.closest('.sidebar-group');
    if (group) group.classList.toggle('open');
  };

  const GOOGLE_CLIENT_ID = '316017385374-7nnvn1q2mcej8n9r2ii7ofrmbu6mdhra.apps.googleusercontent.com';

  function getResolvedApiBaseUrl() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '') {
      return 'http://localhost:5000';
    }
    if (window.location.hostname.includes('tieng-trung-hong-tai-1.onrender.com')) {
      return 'https://tiengtrunghongtai.online';
    }
    return window.location.origin || 'https://tiengtrunghongtai.online';
  }
  const API_BASE_URL = getResolvedApiBaseUrl();

  function isSuperAdmin(email) {
    if (!email) return false;
    const em = email.toLowerCase().trim();
    return em.includes('phanphiphu') || em.includes('thaihong162004') || em.includes('toiyeutinhoc') || em === 'super_admin';
  }

  function isUserAdmin(email) {
    if (!email) return false;
    const em = email.toLowerCase().trim();
    return isSuperAdmin(em) || em.includes('hongtai') || em.includes('admin') || em.includes('teacher');
  }

  // Get current user info from localStorage or session
  function getCurrentUser() {
    try {
      const stored = localStorage.getItem('user') || localStorage.getItem('hongtai_current_user') || localStorage.getItem('currentUser') || sessionStorage.getItem('user');
      if (stored) return JSON.parse(stored);
    } catch (e) { }
    return null;
  }
  window.getCurrentUser = getCurrentUser;

  // Check if a valid authenticated user session exists
  function isUserLoggedIn() {
    try {
      const stored = localStorage.getItem('user') || localStorage.getItem('hongtai_current_user') || localStorage.getItem('currentUser') || sessionStorage.getItem('user');
      if (!stored) return false;
      const u = JSON.parse(stored);
      if (!u) return false;
      const email = (u.email || '').toLowerCase().trim();
      if (email && email !== 'guest' && !email.startsWith('guest_')) return true;
      if (u.id || u._id || u.sub) return true;
      return false;
    } catch (e) {
      return false;
    }
  }
  window.isUserLoggedIn = isUserLoggedIn;

  // Dynamically ensure Google Identity Services script is present in document
  function ensureGoogleGsiScript() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) return;
    if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
  ensureGoogleGsiScript();

  // Inject sleek modern styles for Global Auth Guard Modal & Toast
  function ensureGlobalAuthStyles() {
    if (document.getElementById('global-auth-guard-styles')) return;
    const style = document.createElement('style');
    style.id = 'global-auth-guard-styles';
    style.textContent = `
      @keyframes globalAuthFadeIn {
        from { opacity: 0; backdrop-filter: blur(0px); }
        to { opacity: 1; backdrop-filter: blur(20px); }
      }
      @keyframes globalAuthCardPop {
        from { opacity: 0; transform: scale(0.92) translateY(18px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .global-auth-modal-overlay {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 9999999 !important;
        background: rgba(8, 13, 25, 0.88) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 16px !important;
        box-sizing: border-box !important;
        animation: globalAuthFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .global-auth-card {
        position: relative !important;
        width: 100% !important;
        max-width: 480px !important;
        background: linear-gradient(150deg, #0f172a 0%, #1e293b 100%) !important;
        border: 1.5px solid rgba(56, 189, 248, 0.38) !important;
        border-radius: 28px !important;
        padding: 32px 28px !important;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 45px rgba(56, 189, 248, 0.15) !important;
        color: #ffffff !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
        gap: 18px !important;
        box-sizing: border-box !important;
        animation: globalAuthCardPop 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .global-auth-close-btn {
        position: absolute !important;
        top: 18px !important;
        right: 18px !important;
        background: rgba(255, 255, 255, 0.08) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        color: #cbd5e1 !important;
        font-size: 1.25rem !important;
        line-height: 1 !important;
        cursor: pointer !important;
        width: 36px !important;
        height: 36px !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.2s ease !important;
      }
      .global-auth-close-btn:hover {
        background: rgba(239, 68, 68, 0.2) !important;
        color: #f87171 !important;
        border-color: rgba(239, 68, 68, 0.4) !important;
        transform: rotate(90deg);
      }
      .global-auth-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 14px;
        border-radius: 999px;
        background: rgba(56, 189, 248, 0.12);
        border: 1px solid rgba(56, 189, 248, 0.32);
        color: #38bdf8;
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .global-auth-icon-circle {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(139, 92, 246, 0.3));
        border: 2px solid rgba(56, 189, 248, 0.45);
        color: #38bdf8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.1rem;
        box-shadow: 0 10px 30px rgba(56, 189, 248, 0.3);
      }
      .global-auth-title {
        font-size: 1.45rem !important;
        font-weight: 800 !important;
        color: #ffffff !important;
        margin: 0 !important;
        letter-spacing: -0.01em;
      }
      .global-auth-desc {
        font-size: 0.92rem !important;
        color: #94a3b8 !important;
        margin: 0 !important;
        line-height: 1.55 !important;
      }
      .global-auth-features-box {
        width: 100%;
        background: rgba(255, 255, 255, 0.035);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        padding: 14px 18px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        text-align: left;
        box-sizing: border-box;
      }
      .global-auth-feature-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.88rem;
        color: #e2e8f0;
        font-weight: 500;
      }
      .global-auth-feature-item i {
        color: #34d399;
        font-size: 1.05rem;
        flex-shrink: 0;
      }
      .global-auth-action-box {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        margin-top: 4px;
      }
      .global-google-btn-slot {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        min-height: 48px;
      }
      .global-auth-home-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #94a3b8;
        text-decoration: none;
        font-size: 0.88rem;
        font-weight: 600;
        padding: 8px 18px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.2s ease;
      }
      .global-auth-home-btn:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }
      .global-auth-toast-pill {
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000000;
        padding: 12px 22px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(56, 189, 248, 0.4);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.2);
        color: #ffffff;
        font-size: 0.92rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
        pointer-events: none;
        animation: globalAuthFadeIn 0.25s ease forwards;
      }
    `;
    document.head.appendChild(style);
  }

  // Ensure modal DOM node exists
  function ensureGlobalAuthModal() {
    ensureGlobalAuthStyles();
    let modal = document.getElementById('global-auth-required-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.className = 'modal-overlay global-auth-modal-overlay';
    modal.id = 'global-auth-required-modal';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="modal-card global-auth-card">
        <button class="global-auth-close-btn" id="global-auth-close-btn" title="Đóng" onclick="window.hideGlobalAuthModal && window.hideGlobalAuthModal()">&times;</button>
        <div class="global-auth-badge-wrap">
          <span class="global-auth-badge"><i class="fa-solid fa-shield-halved"></i> Yêu Cầu Đăng Nhập</span>
        </div>
        <div class="global-auth-icon-circle">
          <i class="fa-solid fa-user-lock"></i>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h3 class="global-auth-title" id="global-auth-title">Đăng Nhập Để Trải Nghiệm</h3>
          <p class="global-auth-desc" id="global-auth-desc">
            Vui lòng đăng nhập với tài khoản Google để sử dụng tính năng, theo dõi tiến độ và lưu kết quả học tập của bạn.
          </p>
        </div>
        <div class="global-auth-features-box">
          <div class="global-auth-feature-item">
            <i class="fa-solid fa-circle-check"></i>
            <span>Mở khóa toàn bộ bài học &amp; tính năng luyện tập</span>
          </div>
          <div class="global-auth-feature-item">
            <i class="fa-solid fa-circle-check"></i>
            <span>Chấm điểm phát âm AI, luyện viết &amp; thi thử HSK</span>
          </div>
          <div class="global-auth-feature-item">
            <i class="fa-solid fa-circle-check"></i>
            <span>Tự động lưu từ vựng sổ tay, streak điểm danh hàng ngày</span>
          </div>
        </div>
        <div class="global-auth-action-box">
          <div id="global-google-signin-btn-container" class="global-google-btn-slot">
            <div style="color: #94a3b8; font-size: 0.88rem; display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-circle-notch fa-spin"></i> Đang tải đăng nhập Google...
            </div>
          </div>
        </div>
        <div id="global-auth-home-btn-wrap" style="display: none; margin-top: 2px;">
          <a href="/" class="global-auth-home-btn">
            <i class="fa-solid fa-house"></i> Quay về Trang Chủ
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal && !window._isMandatoryPageLockActive) {
        window.hideGlobalAuthModal();
      }
    });

    return modal;
  }

  // Global Google Sign-In Renderer
  let _gsiRenderInterval = null;
  function renderGlobalGoogleSignInButton() {
    const container = document.getElementById('global-google-signin-btn-container');
    if (!container) return;

    if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
      ensureGoogleGsiScript();
      clearInterval(_gsiRenderInterval);
      let attempts = 0;
      _gsiRenderInterval = setInterval(() => {
        attempts++;
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
          clearInterval(_gsiRenderInterval);
          renderGlobalGoogleSignInButton();
        } else if (attempts > 30) {
          clearInterval(_gsiRenderInterval);
          container.innerHTML = `
            <button onclick="window.renderGlobalGoogleSignInButton && window.renderGlobalGoogleSignInButton()" style="display: flex; align-items: center; gap: 10px; padding: 10px 18px; border-radius: 999px; background: #2563eb; color: #fff; border: none; font-weight: 600; cursor: pointer;">
              <i class="fa-brands fa-google"></i> Thử lại đăng nhập Google
            </button>
          `;
        }
      }, 300);
      return;
    }

    try {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGlobalCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: !window._isMandatoryPageLockActive
      });

      container.innerHTML = '';
      google.accounts.id.renderButton(
        container,
        {
          theme: 'filled_blue',
          size: 'large',
          type: 'standard',
          shape: 'pill',
          text: 'signin_with',
          logo_alignment: 'left',
          width: 290
        }
      );
    } catch (e) {
      console.error('Google Sign-In initialization failed:', e);
    }
  }
  window.renderGlobalGoogleSignInButton = renderGlobalGoogleSignInButton;

  // Google credential response handler
  async function handleGlobalCredentialResponse(response) {
    if (!response || !response.credential) return;
    try {
      let clientDecodedUser = null;
      try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const p = JSON.parse(jsonPayload);
        if (p && p.email) {
          const em = p.email.toLowerCase().trim();
          const isSuper = isSuperAdmin(em);
          const isTeach = em.includes('hongtai') || em.includes('teacher');
          clientDecodedUser = {
            name: p.name || em.split('@')[0],
            email: em,
            picture: p.picture || '',
            role: isSuper ? 'super_admin' : (isTeach ? 'teacher' : 'user'),
            isSuperAdmin: isSuper,
            isAdmin: isSuper || isTeach
          };
        }
      } catch (err) {
        console.warn('Global Auth JWT decode fallback error:', err);
      }

      let data = null;
      try {
        const res = await fetch(API_BASE_URL + '/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
          credentials: 'include'
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {
        console.warn('Backend /api/auth/google error:', err);
      }

      let userObj = null;
      if (data && data.success && data.user) {
        userObj = data.user;
        if (data.token) {
          localStorage.setItem('session_token', data.token);
        }
      } else if (clientDecodedUser) {
        userObj = clientDecodedUser;
      } else {
        throw new Error('Không nhận được dữ liệu xác thực Google');
      }

      const emailStr = (userObj.email || '').toLowerCase().trim();
      if (isSuperAdmin(emailStr)) {
        userObj.role = 'super_admin';
        userObj.isSuperAdmin = true;
        userObj.isAdmin = true;
      } else if (isUserAdmin(emailStr)) {
        userObj.isAdmin = true;
      }

      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('currentUser', JSON.stringify(userObj));

      updateSidebarUserProfile();
      window.dispatchEvent(new CustomEvent('user-auth-changed', { detail: userObj }));
      window.dispatchEvent(new CustomEvent('hongtai-auth-success', { detail: userObj }));

      hideGlobalAuthModal();

      const userName = userObj.name || (userObj.email ? userObj.email.split('@')[0] : 'Học viên');
      showGlobalAuthToast(`Chào mừng ${userName} đã đăng nhập thành công! 👋`);

      // If on subpage and previously locked, reload page so full user-specific data initializes
      const isIndex = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || window.location.pathname === '';
      if (!isIndex) {
        setTimeout(() => {
          window.location.reload();
        }, 350);
        return;
      }

      // Execute pending guarded callback if any
      if (typeof window._pendingGuardedAuthCallback === 'function') {
        const cb = window._pendingGuardedAuthCallback;
        window._pendingGuardedAuthCallback = null;
        try { cb(); } catch (e) { console.error('Error executing pending auth callback:', e); }
      }
    } catch (e) {
      console.error('Google Auth Error:', e);
      showGlobalAuthToast('Đăng nhập Google thất bại! Vui lòng thử lại.', true);
    }
  }
  window.handleGlobalCredentialResponse = handleGlobalCredentialResponse;

  function showGlobalAuthModal(opts = {}) {
    const modal = ensureGlobalAuthModal();
    window._isMandatoryPageLockActive = !!opts.isMandatoryPageLock;
    window._pendingGuardedAuthCallback = opts.callback || null;

    const titleEl = document.getElementById('global-auth-title');
    const descEl = document.getElementById('global-auth-desc');
    const closeBtn = document.getElementById('global-auth-close-btn');
    const homeBtnWrap = document.getElementById('global-auth-home-btn-wrap');

    if (titleEl) {
      titleEl.innerHTML = opts.title || (opts.actionName ? `Đăng Nhập Để ${opts.actionName}` : 'Đăng Nhập Để Trải Nghiệm');
    }
    if (descEl) {
      descEl.innerHTML = opts.desc || `Vui lòng đăng nhập với tài khoản Google để sử dụng tính năng ${opts.actionName ? `<strong>${opts.actionName}</strong>` : ''}, mở khóa học tập và tự động lưu tiến độ của bạn.`;
    }
    if (closeBtn) {
      closeBtn.style.display = opts.isMandatoryPageLock ? 'none' : 'flex';
    }
    if (homeBtnWrap) {
      homeBtnWrap.style.display = opts.isMandatoryPageLock ? 'block' : 'none';
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderGlobalGoogleSignInButton();
  }
  window.showGlobalAuthModal = showGlobalAuthModal;

  function hideGlobalAuthModal() {
    if (window._isMandatoryPageLockActive && !isUserLoggedIn()) {
      return; // Do not close if page is locked and still unauthenticated
    }
    const modal = document.getElementById('global-auth-required-modal');
    if (modal) modal.style.display = 'none';
    const oldModal = document.getElementById('auth-required-modal');
    if (oldModal) oldModal.style.display = 'none';
    document.body.style.overflow = '';
    window._isMandatoryPageLockActive = false;
  }
  window.hideGlobalAuthModal = hideGlobalAuthModal;

  window.openLoginPrompt = function (actionName, callback) {
    if (isUserLoggedIn()) {
      if (typeof callback === 'function') callback();
      return;
    }
    showGlobalAuthModal({
      isMandatoryPageLock: false,
      actionName: typeof actionName === 'string' ? actionName : '',
      callback: typeof callback === 'function' ? callback : (typeof actionName === 'function' ? actionName : null)
    });
  };

  window.openAuthRequiredModal = window.openLoginPrompt;

  window.requireAuth = function (callback, actionName = 'sử dụng tính năng này') {
    if (isUserLoggedIn()) {
      if (typeof callback === 'function') callback();
      return true;
    }
    showGlobalAuthModal({
      isMandatoryPageLock: false,
      actionName: actionName,
      callback: callback
    });
    return false;
  };

  function showGlobalAuthToast(msg, isError = false) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, isError);
      return;
    }
    const existing = document.getElementById('global-auth-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'global-auth-toast';
    toast.className = 'global-auth-toast-pill';
    if (isError) {
      toast.style.borderColor = 'rgba(239, 68, 68, 0.4)';
      toast.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(239, 68, 68, 0.2)';
    }
    toast.innerHTML = `
      <i class="fa-solid ${isError ? 'fa-circle-exclamation text-danger' : 'fa-circle-check text-success'}" style="color: ${isError ? '#f87171' : '#34d399'}; font-size: 1.1rem;"></i>
      <span>${msg}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-10px)';
      setTimeout(() => toast.remove(), 320);
    }, 3200);
  }

  // Page-Level Auth Guard: locks subpages for unauthenticated users
  function checkPageAuthGuard() {
    const path = window.location.pathname.toLowerCase();
    const isIndex = path === '/' || path.endsWith('/index.html') || path === '';
    if (isIndex) return;

    if (!isUserLoggedIn()) {
      let featureName = 'tính năng này';
      if (path.includes('speaking-practice')) featureName = 'Luyện Nói HSKK & AI';
      else if (path.includes('writing-practice')) featureName = 'Luyện Viết Tiếng Trung';
      else if (path.includes('reading-practice')) featureName = 'Luyện Đọc Hiểu';
      else if (path.includes('video-dictation')) featureName = 'Chép Chính Tả & Shadowing Video';
      else if (path.includes('quiz-game')) featureName = 'Trò Chơi Đố Vui HSK';
      else if (path.includes('vocab-practice')) featureName = 'Luyện Từ Vựng 5 Dạng';
      else if (path.includes('translation-practice')) featureName = 'Luyện Dịch Câu & Đoạn Văn';
      else if (path.includes('sentence-reorder')) featureName = 'Bài Tập Sắp Xếp Câu';
      else if (path.includes('ai-dialogue')) featureName = 'Hội Thoại Trợ Lý AI';
      else if (path.includes('chinese-phonetics')) featureName = 'Ngữ Âm Pinyin';
      else if (path.includes('chinese-radicals')) featureName = '214 Bộ Thủ Chữ Hán';
      else if (path.includes('hanzi-writer')) featureName = 'Tập Viết Chữ Hán (Hanzi)';
      else if (path.includes('hsk-grammar')) featureName = 'Cẩm Nang Ngữ Pháp HSK';
      else if (path.includes('lesson-texts')) featureName = 'Bài Khóa Giáo Trình';
      else if (path.includes('lesson-online')) featureName = 'Khóa Học Trực Tuyến';
      else if (path.includes('documents')) featureName = 'Kho Tài Liệu Học Tập';
      else if (path.includes('detail-list')) featureName = 'Tra Cứu Từ Vựng Chi Tiết';
      else if (path.includes('chat-history')) featureName = 'Lịch Sử Hội Thoại';
      else if (path.includes('rank')) featureName = 'Bảng Xếp Hạng Học Viên';

      showGlobalAuthModal({
        isMandatoryPageLock: true,
        actionName: featureName,
        title: `Đăng Nhập Để Dùng: ${featureName}`,
        desc: `Hệ thống yêu cầu bạn đăng nhập bằng Google trước khi sử dụng <strong>${featureName}</strong> để đồng bộ tiến độ và lưu kết quả học tập.`
      });
    }
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
      const logoutLi = sidebar.querySelector('.sidebar-auth-action-item');

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
        if (logoutLi) {
          logoutLi.innerHTML = `
            <a href="javascript:void(0)" class="logout-link" onclick="window.handleGlobalLogout && window.handleGlobalLogout(event)" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #f87171; font-size: 0.88rem; font-weight: 600; text-decoration: none; transition: all 0.2s;">
              <i class="fa-solid fa-right-from-bracket" style="color: #f87171;"></i> <span>Đăng xuất</span>
            </a>
          `;
        }
      } else {
        if (nameEl) nameEl.textContent = 'Khách (Chưa đăng nhập)';
        if (emailEl) emailEl.textContent = 'Đăng nhập để lưu tiến độ học';
        if (roleEl) roleEl.textContent = 'Khách';
        if (avatarWrap) {
          avatarWrap.innerHTML = `<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>`;
        }
        if (logoutLi) {
          logoutLi.innerHTML = `
            <a href="javascript:void(0)" onclick="window.openLoginPrompt && window.openLoginPrompt()" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #4ade80; font-size: 0.88rem; font-weight: 700; text-decoration: none; transition: all 0.2s;">
              <i class="fa-brands fa-google" style="color: #4ade80;"></i> <span>Đăng nhập Google</span>
            </a>
          `;
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
    <aside class="app-sidebar global-sidebar-drawer" id="global-app-sidebar">
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

      <!-- User Account Card with Interactive Dropdown -->
      <div class="auth-container ${user ? 'logged-in' : 'logged-out'}" style="width: 100%; border-bottom: 1px solid var(--border-glass, rgba(255,255,255,0.12)); padding-bottom: 12px; margin-bottom: 12px; position: relative;">
        <div class="user-dropdown" style="width: 100%; position: relative;">
          <div class="user-profile sidebar-profile-card" onclick="window.toggleGlobalUserDropdown && window.toggleGlobalUserDropdown(event)"
            style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: rgba(255, 255, 255, 0.04); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.2s ease;">
            <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
              <div class="sidebar-avatar-wrap" style="flex-shrink: 0;">
                ${userAvatar ? `<img class="user-avatar-img" src="${userAvatar}" alt="Avatar" style="display: block; width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-blue, #38bdf8);">` : `<div class="user-avatar sidebar-avatar-placeholder" style="width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white;"><i class="fa-solid fa-user"></i></div>`}
              </div>
              <div class="user-info" style="min-width: 0; flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                <span class="user-name" style="font-weight: 700; font-size: 0.92rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${userName}</span>
                <span class="user-sub" style="font-size: 0.72rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${userEmail}</span>
                <span class="user-role-badge" style="font-size: 0.68rem; margin-top: 2px; align-self: flex-start;">${userRole}</span>
              </div>
            </div>
            <i class="fa-solid fa-chevron-down profile-chevron" style="color: #94a3b8; font-size: 0.8rem; margin-left: 8px; transition: transform 0.2s ease;"></i>
          </div>

          <!-- Dropdown menu with 3 options -->
          <ul class="profile-dropdown-menu" style="position: absolute; top: calc(100% + 6px); left: 0; right: 0; width: 100%; background: #1e293b; background-color: rgba(30, 41, 59, 0.98); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 12px; box-shadow: 0 14px 35px rgba(0,0,0,0.6); padding: 8px 6px; list-style: none; z-index: 9999; margin: 0; box-sizing: border-box;">
            <li>
              <a href="/chat-history.html" class="history-link" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #cbd5e1; font-size: 0.88rem; font-weight: 500; text-decoration: none; transition: all 0.2s;">
                <i class="fa-solid fa-clock-rotate-left" style="color: #38bdf8;"></i> <span>Lịch sử cuộc trò chuyện</span>
              </a>
            </li>
            <li>
              <a href="/rank.html" id="game-history-btn" class="history-link" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #cbd5e1; font-size: 0.88rem; font-weight: 500; text-decoration: none; transition: all 0.2s;">
                <i class="fa-solid fa-gamepad" style="color: #fbbf24;"></i> <span>Lịch sử chơi &amp; Xếp hạng</span>
              </a>
            </li>
            <li class="sidebar-auth-action-item">
              ${user ? `
              <a href="javascript:void(0)" class="logout-link" onclick="window.handleGlobalLogout && window.handleGlobalLogout(event)" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #f87171; font-size: 0.88rem; font-weight: 600; text-decoration: none; transition: all 0.2s;">
                <i class="fa-solid fa-right-from-bracket" style="color: #f87171;"></i> <span>Đăng xuất</span>
              </a>
              ` : `
              <a href="javascript:void(0)" onclick="window.openLoginPrompt && window.openLoginPrompt()" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #4ade80; font-size: 0.88rem; font-weight: 700; text-decoration: none; transition: all 0.2s;">
                <i class="fa-brands fa-google" style="color: #4ade80;"></i> <span>Đăng nhập Google</span>
              </a>
              `}
            </li>
          </ul>
        </div>
      </div>

      <div class="sidebar-menu-wrapper" style="width: 100%; box-sizing: border-box;">
        <!-- TRANG CHỦ -->
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${activeKey === 'home' ? 'active' : ''}" onclick="window.location.href = '/'">
            <i class="fa-solid fa-house"></i> <span>Trang chủ</span>
          </li>
        </ul>

        <!-- DANH MỤC 1: HỌC TẬP -->
        <div class="sidebar-section-label">Học Tập</div>
        <ul class="sidebar-menu" style="margin-bottom: 8px;">
          <li class="sidebar-item ${activeKey === 'roadmap' ? 'active' : ''}" onclick="window.location.href = '/index.html#roadmap'">
            <i class="fa-solid fa-route" style="color: #60a5fa;"></i> <span>Lộ trình</span>
          </li>
        </ul>

        <!-- Từ vựng (Dropdown giống index.html) -->
        <div class="sidebar-group ${['vocabulary', 'radicals', 'phonetics', 'flashcards', 'hanzi'].includes(activeKey) ? 'open' : ''}">
          <div class="sidebar-item sidebar-dropdown-toggle" onclick="window.toggleSidebarDropdown(this)">
            <i class="fa-solid fa-font"></i> <span>Từ vựng</span>
            <i class="fa-solid fa-chevron-down dropdown-arrow"></i>
          </div>
          <ul class="sidebar-submenu">
            <li class="sidebar-subitem ${activeKey === 'radicals' ? 'active' : ''}" onclick="window.location.href = '/chinese-radicals.html'">
              <i class="fa-solid fa-shapes" style="color: #2563eb;"></i> <span>Bộ thủ</span>
            </li>
            <li class="sidebar-subitem ${activeKey === 'phonetics' ? 'active' : ''}" onclick="window.location.href = '/chinese-phonetics.html'">
              <i class="fa-solid fa-table-cells"></i> <span>Bảng phiên âm (Pinyin)</span>
            </li>
            <li class="sidebar-subitem ${activeKey === 'flashcards' ? 'active' : ''}" onclick="window.location.href = '/index.html?tab=flashcards'">
              <i class="fa-solid fa-book-bookmark" style="color: #38bdf8;"></i> <span>Sổ tay</span>
            </li>
            <li class="sidebar-subitem ${activeKey === 'hanzi' ? 'active' : ''}" onclick="window.location.href = '/hanzi-writer.html'">
              <i class="fa-solid fa-pen-nib"></i> <span>Luyện viết &amp; In phiếu tập viết</span>
            </li>
          </ul>
        </div>

        <!-- Sổ tay Ngữ Pháp (Single Item) -->
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${activeKey === 'grammar' ? 'active' : ''}" onclick="window.location.href = '/hsk-grammar.html'">
            <i class="fa-solid fa-spell-check" style="color: #38bdf8;"></i> <span>Sổ tay Ngữ Pháp</span>
          </li>
        </ul>

        <!-- DANH MỤC: TRÒ CHƠI -->
        <div class="sidebar-section-label">Trò Chơi</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${activeKey === 'games' ? 'active' : ''}" onclick="window.location.href = '/quiz-game.html'">
            <i class="fa-solid fa-gamepad" style="color: #f59e0b;"></i> <span>Trò Chơi</span>
          </li>
        </ul>

        <!-- DANH MỤC 2: KỸ NĂNG -->
        <div class="sidebar-section-label">Kỹ Năng</div>
        <ul class="sidebar-menu" style="margin-bottom: 8px;">
          <li class="sidebar-item ${activeKey === 'shadowing' ? 'active' : ''}" onclick="window.location.href = '/video-dictation.html?mode=shadowing'">
            <i class="fa-solid fa-microphone-lines" style="color: #10b981; font-size: 1.1rem;"></i> <span>Shadowing</span>
          </li>
          <li class="sidebar-item ${activeKey === 'dictation' ? 'active' : ''}" onclick="window.location.href = '/video-dictation.html?mode=dictation'">
            <i class="fa-solid fa-pen-to-square" style="color: #38bdf8; font-size: 1.1rem;"></i> <span>Nghe Chép</span>
          </li>
          <li class="sidebar-item ${activeKey === 'reading' ? 'active' : ''}" onclick="window.location.href = '/reading-practice.html'">
            <i class="fa-solid fa-book-open-reader" style="color: #38bdf8; font-size: 1.1rem;"></i> <span>Luyện Đọc</span>
          </li>
          <li class="sidebar-item ${activeKey === 'writing' ? 'active' : ''}" onclick="window.location.href = '/writing-practice.html'" style="cursor: pointer;">
            <i class="fa-solid fa-feather-pointed" style="color: #a855f7; font-size: 1.1rem;"></i> <span>Luyện Viết</span>
          </li>
          <li class="sidebar-item ${activeKey === 'speaking' ? 'active' : ''}" onclick="window.location.href = '/speaking-practice.html'" style="cursor: pointer;">
            <i class="fa-solid fa-microphone-lines" style="color: #f59e0b; font-size: 1.1rem;"></i> <span>Luyện Nói</span>
          </li>
          <li class="sidebar-item ${activeKey === 'translation' ? 'active' : ''}" onclick="window.location.href = '/translation-practice.html'" style="cursor: pointer;">
            <i class="fa-solid fa-language" style="color: #06b6d4; font-size: 1.1rem;"></i> <span>Luyện Dịch</span>
          </li>
          <li class="sidebar-item ${activeKey === 'sentence-reorder' ? 'active' : ''}" onclick="window.location.href = '/sentence-reorder.html'" style="cursor: pointer;">
            <i class="fa-solid fa-arrow-down-short-wide" style="color: #38bdf8; font-size: 1.1rem;"></i> <span>Sắp xếp câu</span>
          </li>
          <li class="sidebar-item ${activeKey === 'ai-dialogue' ? 'active' : ''}" onclick="window.location.href = '/ai-dialogue.html'" style="cursor: pointer;">
            <i class="fa-solid fa-comments" style="color: #a855f7; font-size: 1.1rem;"></i> <span>Hội thoại AI</span>
          </li>
        </ul>

        <!-- DANH MỤC 3: LUYỆN ĐỀ -->
        <div class="sidebar-section-label">Luyện Đề</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item" onclick="if(window.showComingSoonNotice){ window.showComingSoonNotice('Luyện Đề Thi HSK'); } else { alert('Tính năng Đề thi HSK đang được hoàn thiện và sẽ sớm ra mắt!'); }">
            <i class="fa-solid fa-file-signature" style="color: #64748b;"></i> <span>Đề thi HSK</span>
            <span style="font-size:0.68rem; background:rgba(245,158,11,0.2); color:#f59e0b; border:1px solid rgba(245,158,11,0.3); padding:2px 6px; border-radius:6px; font-weight:700; margin-left:auto; white-space:nowrap;">🔒 Sắp ra mắt</span>
          </li>
        </ul>

        <!-- DANH MỤC 4: CỘNG ĐỒNG -->
        <div class="sidebar-section-label">Cộng Đồng</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item" onclick="if(window.openSurveyModal){ window.openSurveyModal(); } else { window.open('https://forms.gle/WaqZsrYrCZfAN5xn6', '_blank'); }" style="cursor: pointer;">
            <i class="fa-solid fa-clipboard-question" style="color: #ec4899;"></i> <span>Khảo sát ý kiến</span>
          </li>
          <li class="sidebar-item" onclick="if(window.showComingSoonNotice){ window.showComingSoonNotice('Kho Sách & Tài Liệu'); } else { alert('Tính năng Kho Sách & Tài Liệu đang tạm khóa để cập nhật bản quyền, sẽ sớm ra mắt nhé!'); }" style="cursor: pointer;">
            <i class="fa-solid fa-book-bookmark" style="color: #64748b;"></i> <span>Kho Sách &amp; Tài Liệu</span>
            <span style="font-size:0.68rem; background:rgba(245,158,11,0.2); color:#f59e0b; border:1px solid rgba(245,158,11,0.3); padding:2px 6px; border-radius:6px; font-weight:700; margin-left:auto; white-space:nowrap;">🔒 Sắp ra mắt</span>
          </li>
          <li class="sidebar-item" onclick="window.location.href = '/?openDiscussion=true'" style="cursor: pointer;">
            <i class="fa-solid fa-comments" style="color: #38bdf8;"></i> <span>Thảo luận &amp; Góp ý</span>
          </li>
          <li class="sidebar-item ${activeKey === 'rank' ? 'active' : ''}" onclick="window.location.href = '/rank.html'">
            <i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span>Xếp hạng</span>
          </li>
        </ul>

        ${(user && (user.role === 'super_admin' || user.role === 'admin' || user.role === 'teacher' || (user.email && (user.email.includes('phanphiphu') || user.email.includes('thaihong162004') || user.email.includes('hongtai'))))) ? `
        <!-- DANH MỤC: QUẢN TRỊ VIÊN -->
        <div class="sidebar-section-label" style="color: #f43f5e; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-crown" style="font-size: 0.75rem;"></i> Quản Trị Hệ Thống
        </div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item" onclick="if(window.openAdminManagementModal){ window.openAdminManagementModal(); } else { window.location.href = '/?openAdmin=true'; }"
            style="cursor: pointer; background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: 10px;">
            <i class="fa-solid fa-users-gear" style="color: #f43f5e;"></i> <span>Quản lý Học viên</span>
            <span style="font-size:0.68rem; background:linear-gradient(135deg, #f43f5e, #e11d48); color:white; padding:2px 6px; border-radius:6px; font-weight:800; margin-left:auto; white-space:nowrap;">Admin</span>
          </li>
        </ul>
        ` : ''}

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
    if (isIndex && window.innerWidth > 900) {
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
    if (backdrop && (!isIndex || window.innerWidth <= 900)) {
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
    if (isIndex && window.innerWidth > 900) {
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

  // User Dropdown Handlers
  window.toggleGlobalUserDropdown = function (e) {
    if (e) {
      e.stopPropagation();
      if (typeof e.preventDefault === 'function') e.preventDefault();
    }
    const currentDropdown = (e && e.target) ? e.target.closest('.user-dropdown') : null;
    if (currentDropdown) {
      currentDropdown.classList.toggle('show-menu');
    } else {
      const dropdowns = document.querySelectorAll('.user-dropdown');
      dropdowns.forEach(d => d.classList.toggle('show-menu'));
    }
  };
  window.toggleUserDropdown = window.toggleGlobalUserDropdown;

  window.handleGlobalLogout = async function (e) {
    if (e) {
      e.stopPropagation();
      if (typeof e.preventDefault === 'function') e.preventDefault();
    }
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {}

    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('hongtai_user');
    localStorage.removeItem('hongtai_current_user');
    localStorage.removeItem('session_token');
    sessionStorage.removeItem('user');

    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      try { google.accounts.id.disableAutoSelect(); } catch (e) {}
    }

    const isIndex = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || window.location.pathname === '';
    if (!isIndex) {
      window.location.href = '/?logged_out=true';
      return;
    }

    if (typeof window.handleLogout === 'function') {
      window.handleLogout(e);
    } else {
      window.location.reload();
    }
  };

  // Attach global keyboard ESC listener
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      window.closeGlobalSidebar();
      document.querySelectorAll('.user-dropdown.show-menu').forEach(d => d.classList.remove('show-menu'));
    }
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.user-dropdown')) {
      document.querySelectorAll('.user-dropdown.show-menu').forEach(d => d.classList.remove('show-menu'));
    }
  });

  // Announcement Ticker Bar Controller
  window.closeAnnouncementTicker = function () {
    const ticker = document.getElementById('home-announcement-ticker') || document.querySelector('.announcement-ticker-bar');
    if (ticker) {
      ticker.classList.add('dismissed');
      setTimeout(() => {
        ticker.style.display = 'none';
      }, 350);
      try {
        sessionStorage.setItem('hongtai_ticker_dismissed', 'true');
      } catch (e) {}
    }
  };

  function initAnnouncementTicker() {
    try {
      if (sessionStorage.getItem('hongtai_ticker_dismissed') === 'true') {
        const ticker = document.getElementById('home-announcement-ticker') || document.querySelector('.announcement-ticker-bar');
        if (ticker) ticker.style.display = 'none';
      }
    } catch (e) {}
  }

  // Inject or setup on DOM Ready
  function initGlobalSidebar() {
    initAnnouncementTicker();
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

    // 3. Stop click propagation on sidebars to prevent accidental closing but close dropdown if clicking elsewhere in sidebar
    document.querySelectorAll('.app-sidebar, .global-app-sidebar').forEach(sb => {
      sb.addEventListener('click', (e) => {
        if (!e.target.closest('.user-dropdown')) {
          document.querySelectorAll('.user-dropdown.show-menu').forEach(d => d.classList.remove('show-menu'));
        }
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

    // 5. Remove any redundant menu bubble widget if previously created
    const existingBubble = document.getElementById('menu-bubble-widget');
    if (existingBubble) existingBubble.remove();

    // 6. Floating Theme & Particle Widget (Chuyển nền 🌙 & Bông tuyết ❄️) chỉ hiển thị ở Trang Chủ (index.html).
    // Ở các trang con khác đã có sẵn các nút này trong thanh điều hướng, nên tự động dọn dẹp để không bị trùng lặp!
    const isIndexPage = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || window.location.pathname === '';
    if (!isIndexPage) {
      const floatTheme = document.getElementById('floating-theme-widget');
      if (floatTheme) floatTheme.remove();
    }

    // 7. Inject top menu button if missing on the page
    injectTopMenuButtonIfMissing();
    setTimeout(injectTopMenuButtonIfMissing, 300);

    // 8. Connect all existing and new hamburger / menu toggle buttons
    const bindMenuButtons = () => {
      document.querySelectorAll('.menu-toggle-btn, .global-hamburger-btn, .sidebar-open-btn, .top-menu-btn, #top-sidebar-toggle-btn, #sidebar-expand-float-btn, .sidebar-expand-float-btn, #mobile-nav-toggle-btn, .header-icon-btn, .sidebar-toggle-btn, .topbar-comic-menu-btn, #mobile-sidebar-toggle-btn').forEach(btn => {
        btn.onclick = window.toggleGlobalSidebar;
      });
    };
    bindMenuButtons();
    setTimeout(bindMenuButtons, 500);
    setTimeout(bindMenuButtons, 1200);

    // 9. Guarantee pristine, zero-failure SVG vector icons for header navigation
    ensureHeaderButtonSVGs();
    setTimeout(ensureHeaderButtonSVGs, 150);
    setTimeout(ensureHeaderButtonSVGs, 600);
    setTimeout(ensureHeaderButtonSVGs, 1500);
    setTimeout(ensureFontAwesomeLoaded, 800);

    // 10. Attach Universal Auth Guard: check if subpage requires login & guard sidebar links
    checkPageAuthGuard();
    setTimeout(checkPageAuthGuard, 350);
    attachSidebarAuthProtection();
    setTimeout(attachSidebarAuthProtection, 600);
  }

  // Zero-Failure Vector SVG Icons for Header Navigation
  const HEADER_ICONS = {
    bars: `<svg class="header-svg-icon" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3.5" y1="6" x2="20.5" y2="6"></line><line x1="3.5" y1="12" x2="20.5" y2="12"></line><line x1="3.5" y1="18" x2="20.5" y2="18"></line></svg>`,
    snowflake: (enabled = true) => `<svg class="header-svg-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="${enabled ? '#38bdf8' : '#94a3b8'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="${enabled ? '' : 'opacity: 0.4;'}"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line><line x1="4.93" y1="19.07" x2="19.07" y2="4.93"></line><polyline points="9 3.5 12 6.5 15 3.5"></polyline><polyline points="9 20.5 12 17.5 15 20.5"></polyline><polyline points="3.5 9 6.5 12 3.5 15"></polyline><polyline points="20.5 9 17.5 12 20.5 15"></polyline></svg>`,
    sun: `<svg class="header-svg-icon icon-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"></circle><line x1="12" y1="1.5" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22.5"></line><line x1="4.22" y1="4.22" x2="6" y2="6"></line><line x1="18" y1="18" x2="19.78" y2="19.78"></line><line x1="1.5" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22.5" y2="12"></line><line x1="4.22" y1="19.78" x2="6" y2="18"></line><line x1="18" y1="6" x2="19.78" y2="4.22"></line></svg>`,
    moon: `<svg class="header-svg-icon icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
    home: `<svg class="header-svg-icon icon-home" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20v-9.5z"></path><polyline points="9 21 9 12 15 12 15 21"></polyline></svg>`
  };

  function ensureHeaderButtonSVGs() {
    const isLight = document.documentElement.classList.contains('light-mode') || document.documentElement.classList.contains('light');
    const particlesEnabled = localStorage.getItem('particles_enabled') !== 'false';

    // 1. Hamburger buttons
    document.querySelectorAll('.global-hamburger-btn, #mobile-nav-toggle-btn, #top-sidebar-toggle-btn').forEach(btn => {
      if (!btn.querySelector('svg.header-svg-icon')) {
        btn.innerHTML = HEADER_ICONS.bars;
      }
    });

    // 2. Home buttons
    document.querySelectorAll('.rank-nav-btn, .btn-home, a.header-icon-btn[href="/"], a.header-icon-btn[href="/index.html"], a.header-icon-btn[title="Trang chủ"]').forEach(btn => {
      if (!btn.querySelector('svg.header-svg-icon')) {
        btn.innerHTML = HEADER_ICONS.home;
      }
    });

    // 3. Particle toggle buttons
    document.querySelectorAll('#particle-toggle-btn, .particle-toggle-btn').forEach(btn => {
      if (!btn.querySelector('svg.header-svg-icon')) {
        btn.innerHTML = HEADER_ICONS.snowflake(particlesEnabled);
      }
    });

    // 4. Theme toggle buttons
    document.querySelectorAll('.theme-toggle-btn, #theme-toggle-btn, .rank-theme-btn').forEach(btn => {
      if (!btn.querySelector('svg.header-svg-icon')) {
        btn.innerHTML = isLight ? HEADER_ICONS.moon : HEADER_ICONS.sun;
        btn.setAttribute('title', isLight ? 'Chuyển sang Chế độ Tối' : 'Chuyển sang Chế độ Sáng');
      }
    });
  }
  window.ensureHeaderButtonSVGs = ensureHeaderButtonSVGs;

  // Intercept/hook updateToggleBtns so any page-level theme toggle renders crisp SVGs
  const _origUpdateToggleBtns = window.updateToggleBtns;
  window.updateToggleBtns = function (isLight) {
    if (typeof _origUpdateToggleBtns === 'function') {
      try { _origUpdateToggleBtns(isLight); } catch (e) {}
    }
    document.querySelectorAll('.theme-toggle-btn, #theme-toggle-btn, .rank-theme-btn').forEach(btn => {
      btn.innerHTML = isLight ? HEADER_ICONS.moon : HEADER_ICONS.sun;
      btn.setAttribute('title', isLight ? 'Chuyển sang Chế độ Tối' : 'Chuyển sang Chế độ Sáng');
    });
  };

  // FontAwesome fallback loader in case primary CDN is blocked or fails
  function ensureFontAwesomeLoaded() {
    const isLoaded = document.fonts && document.fonts.check ? document.fonts.check('16px "Font Awesome 6 Free"') : true;
    if (!isLoaded && !document.querySelector('link[data-fa-fallback="true"]')) {
      const fallback = document.createElement('link');
      fallback.rel = 'stylesheet';
      fallback.setAttribute('data-fa-fallback', 'true');
      fallback.href = 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css';
      document.head.appendChild(fallback);
    }
  }

  function attachSidebarAuthProtection() {
    document.querySelectorAll('.app-sidebar a, .global-app-sidebar a, .app-sidebar .sidebar-item, .global-app-sidebar .sidebar-item, .app-sidebar .sidebar-subitem, .global-app-sidebar .sidebar-subitem').forEach(el => {
      if (el.classList.contains('sidebar-dropdown-toggle')) return;
      const href = el.getAttribute('href') || el.getAttribute('onclick') || '';
      const isSubpageLink = href.includes('.html') && !href.includes('index.html');
      if (isSubpageLink) {
        el.addEventListener('click', (e) => {
          if (!isUserLoggedIn()) {
            e.preventDefault();
            e.stopPropagation();
            const text = el.textContent.trim().split('\n')[0] || 'tính năng này';
            showGlobalAuthModal({
              isMandatoryPageLock: false,
              actionName: text,
              title: `Đăng Nhập Để Dùng: ${text}`,
              desc: `Vui lòng đăng nhập với tài khoản Google để sử dụng tính năng <strong>${text}</strong>.`
            });
          }
        }, true);
      }
    });
  }

  // Intercept any click on subpage by unauthenticated guest users
  document.addEventListener('click', function (e) {
    const isIndex = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || window.location.pathname === '';
    if (!isIndex && !isUserLoggedIn()) {
      if (e.target.closest('#global-auth-required-modal')) return;
      e.preventDefault();
      e.stopPropagation();
      showGlobalAuthModal({ isMandatoryPageLock: true });
    }
  }, true);

  function injectTopMenuButtonIfMissing() {
    // Check if page already has a hamburger button
    const alreadyHasBtn = document.querySelector('.global-hamburger-btn, #mobile-nav-toggle-btn, #top-sidebar-toggle-btn, #mobile-sidebar-toggle-btn');
    if (alreadyHasBtn) {
      alreadyHasBtn.onclick = window.toggleGlobalSidebar;
      return;
    }

    const headerConfigs = [
      { container: '.navbar .nav-container', insertBefore: '.nav-brand' },
      { container: '.app-top-nav-inner > div:first-child', insertBefore: ':first-child' },
      { container: '.reorder-header-inner > div:first-child', insertBefore: ':first-child' },
      { container: '.diag-header-inner > div:first-child', insertBefore: ':first-child' },
      { container: '.top-bar', insertBefore: ':first-child' },
      { container: '.rd-header-left', insertBefore: '.rd-back-btn' },
      { container: '.dict-top-nav', insertBefore: '.dict-brand' },
      { container: '.rank-header-nav', insertBefore: '.rank-brand-logo' },
      { container: '.header-title-wrap', insertBefore: '.back-btn' },
      { container: '.phonetics-header .brand-box', insertBefore: ':first-child' },
      { container: '.hanzi-header .brand-box', insertBefore: ':first-child' },
      { container: '.grammar-header .brand-box', insertBefore: ':first-child' },
      { container: '.header-card > div:first-child', insertBefore: ':first-child' },
      { container: '.header-panel .logo', insertBefore: ':first-child' },
      { container: '.rules-header .rules-title-group', insertBefore: ':first-child' },
      { container: '.topbar-left-cluster', insertBefore: ':first-child' }
    ];

    for (const cfg of headerConfigs) {
      const parent = document.querySelector(cfg.container);
      if (parent) {
        if (parent.querySelector('.global-hamburger-btn, .menu-toggle-btn, #sidebar-expand-float-btn, #mobile-sidebar-toggle-btn')) {
          break;
        }

        const menuBtn = document.createElement('button');
        menuBtn.className = 'header-icon-btn global-hamburger-btn';
        menuBtn.id = 'global-hamburger-btn';
        menuBtn.title = 'Mở Menu Danh Mục';
        menuBtn.setAttribute('aria-label', 'Mở Menu Danh Mục');
        menuBtn.innerHTML = HEADER_ICONS.bars;
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
