/**
 * Global Quick Dictionary Widget (Bong bóng từ điển nổi toàn website)
 * Tiếng Trung Hongtai - Tra cứu từ vựng mọi lúc mọi nơi trên tất cả các trang
 */

(function () {
  'use strict';

  // Prevent duplicate mounts
  if (document.getElementById('quick-dict-widget')) return;

  let localDict = null;
  let isDictLoading = false;
  let activeSearchQuery = '';
  let searchDebounceTimer = null;
  let dockSide = localStorage.getItem('hongtai_quick_dict_dock') || 'right';

  // Load search history
  function getSearchHistory() {
    try {
      const h = localStorage.getItem('hongtai_dict_history');
      return h ? JSON.parse(h) : [];
    } catch (e) {
      return [];
    }
  }

  function addSearchHistory(word) {
    if (!word) return;
    try {
      let list = getSearchHistory().filter(w => w !== word);
      list.unshift(word);
      if (list.length > 8) list = list.slice(0, 8);
      localStorage.setItem('hongtai_dict_history', JSON.stringify(list));
      renderHistoryTags();
    } catch (e) { }
  }

  // Preload local dictionary in background
  async function loadLocalDict() {
    if (localDict) return localDict;
    if (isDictLoading) return null;
    isDictLoading = true;
    try {
      const res = await fetch('/reading_vocab_dict.json');
      if (res.ok) {
        localDict = await res.json();
      }
    } catch (e) {
      console.warn('Quick Dict: failed to load local dictionary, using API lookup', e);
    } finally {
      isDictLoading = false;
    }
    return localDict;
  }

  function normalizePinyin(py) {
    if (!py) return '';
    return py
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ü/g, 'v')
      .replace(/[^a-z0-9]/g, '');
  }

  function playTts(text) {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-CN';
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  }

  // Inject Styles
  const styleEl = document.createElement('style');
  styleEl.id = 'quick-dict-widget-styles';
  styleEl.textContent = `
    /* ==========================================================================
       QUICK DICT FLOATING WIDGET STYLES
       ========================================================================== */
    .quick-dict-widget {
      position: fixed;
      bottom: 96px;
      right: 24px;
      z-index: 99999;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      pointer-events: auto;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .quick-dict-widget.dock-left {
      right: auto !important;
      left: 24px !important;
    }

    /* Floating Bubble Button */
    .quick-dict-toggle-btn {
      width: 54px;
      height: 54px;
      border-radius: 50% !important;
      background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%) !important;
      border: 2px solid rgba(255, 255, 255, 0.85) !important;
      color: #ffffff !important;
      font-size: 1.35rem !important;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(13, 148, 136, 0.45), 0 0 16px rgba(5, 150, 105, 0.35) !important;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.25s ease !important;
      position: relative;
    }

    .quick-dict-toggle-btn:hover {
      transform: scale(1.1) rotate(4deg);
      box-shadow: 0 10px 30px rgba(13, 148, 136, 0.65), 0 0 24px rgba(2, 132, 199, 0.5) !important;
    }

    .quick-dict-toggle-btn:active {
      transform: scale(0.95);
    }

    .quick-dict-tag-pill {
      position: absolute;
      top: -6px;
      right: -6px;
      background: #ef4444;
      color: #ffffff;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 999px;
      border: 1.5px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      letter-spacing: 0.5px;
      pointer-events: none;
    }

    /* Dictionary Panel Modal */
    .quick-dict-panel {
      position: absolute;
      bottom: 66px;
      right: 0;
      width: 390px;
      max-width: calc(100vw - 32px);
      max-height: 580px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 20px;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.55), 0 0 35px rgba(13, 148, 136, 0.22);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: dictFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 100000;
      color: #f8fafc;
    }

    .quick-dict-widget.dock-left .quick-dict-panel {
      right: auto;
      left: 0;
    }

    @keyframes dictFadeIn {
      from {
        opacity: 0;
        transform: translateY(16px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Panel Header */
    .quick-dict-header {
      padding: 14px 16px;
      background: linear-gradient(135deg, rgba(13, 148, 136, 0.3) 0%, rgba(2, 132, 199, 0.2) 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .quick-dict-title-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .quick-dict-avatar {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: linear-gradient(135deg, #059669, #0284c7);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 1rem;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
    }

    .quick-dict-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      line-height: 1.2;
    }

    .quick-dict-sub {
      font-size: 0.72rem;
      color: #6ee7b7;
      font-weight: 500;
    }

    .quick-dict-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .quick-dict-action-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s ease;
    }

    .quick-dict-action-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      transform: translateY(-1px);
    }

    /* Search Box */
    .quick-dict-search-wrap {
      padding: 12px 16px;
      background: rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .quick-dict-input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .quick-dict-search-icon {
      position: absolute;
      left: 12px;
      color: #94a3b8;
      font-size: 0.9rem;
      pointer-events: none;
    }

    .quick-dict-input {
      width: 100%;
      background: rgba(30, 41, 59, 0.85);
      border: 1.5px solid rgba(13, 148, 136, 0.4);
      border-radius: 12px;
      padding: 9px 36px 9px 34px;
      color: #ffffff;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .quick-dict-input:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
      background: rgba(15, 23, 42, 0.95);
    }

    .quick-dict-clear-btn {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.85rem;
      padding: 4px;
      display: none;
    }

    .quick-dict-clear-btn:hover {
      color: #ffffff;
    }

    /* History & Suggestion Pills */
    .quick-dict-pills-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      overflow-x: auto;
      scrollbar-width: none;
      padding-bottom: 2px;
    }

    .quick-dict-pills-bar::-webkit-scrollbar {
      display: none;
    }

    .quick-dict-pill {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      font-size: 0.76rem;
      padding: 3px 9px;
      border-radius: 999px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
      font-family: 'LXGW WenKai Lite', 'Kaiti', 'KaiTi', serif;
    }

    .quick-dict-pill:hover {
      background: rgba(16, 185, 129, 0.25);
      border-color: #10b981;
      color: #ffffff;
    }

    /* Body / Content Area */
    .quick-dict-body {
      padding: 16px;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Default Empty State */
    .quick-dict-empty {
      text-align: center;
      padding: 28px 12px;
      color: #94a3b8;
    }

    .quick-dict-empty-icon {
      font-size: 2.2rem;
      color: #0d9488;
      margin-bottom: 10px;
      opacity: 0.8;
    }

    .quick-dict-empty-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: #e2e8f0;
      margin-bottom: 6px;
    }

    .quick-dict-empty-hint {
      font-size: 0.8rem;
      line-height: 1.5;
    }

    /* Word Card Result */
    .quick-dict-card {
      background: rgba(30, 41, 59, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .quick-dict-word-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 12px;
    }

    .quick-dict-hanzi {
      font-family: 'LXGW WenKai Lite', 'Kaiti', 'KaiTi', 'STKaiti', serif;
      font-size: 2.3rem;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.1;
      letter-spacing: 1px;
    }

    .quick-dict-badges-wrap {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 5px;
    }

    .quick-dict-hsk-badge {
      background: linear-gradient(135deg, #059669, #10b981);
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }

    .quick-dict-pos-badge {
      background: rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .quick-dict-pinyin-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .quick-dict-pinyin {
      font-size: 1.15rem;
      color: #38bdf8;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .quick-dict-speak-btn {
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38bdf8;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .quick-dict-speak-btn:hover {
      background: #38bdf8;
      color: #0f172a;
      transform: scale(1.1);
    }

    .quick-dict-meaning-box {
      background: rgba(15, 23, 42, 0.7);
      border-left: 3.5px solid #10b981;
      padding: 10px 12px;
      border-radius: 0 10px 10px 0;
    }

    .quick-dict-meaning-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      color: #10b981;
      font-weight: 700;
      margin-bottom: 3px;
      letter-spacing: 0.5px;
    }

    .quick-dict-meaning-text {
      font-size: 1.02rem;
      color: #f1f5f9;
      font-weight: 500;
      line-height: 1.5;
    }

    /* Example Box */
    .quick-dict-example-box {
      background: rgba(2, 132, 199, 0.1);
      border: 1px dashed rgba(56, 189, 248, 0.3);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .quick-dict-ex-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .quick-dict-ex-label {
      font-size: 0.72rem;
      color: #38bdf8;
      font-weight: 700;
      text-transform: uppercase;
    }

    .quick-dict-ex-zh {
      font-family: 'LXGW WenKai Lite', 'Kaiti', 'KaiTi', serif;
      font-size: 1.05rem;
      color: #ffffff;
      line-height: 1.4;
    }

    .quick-dict-ex-py {
      font-size: 0.85rem;
      color: #94a3b8;
    }

    .quick-dict-ex-vi {
      font-size: 0.88rem;
      color: #cbd5e1;
      font-style: italic;
    }

    .quick-dict-card-actions {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }

    .quick-dict-link-btn {
      flex: 1;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 7px 10px;
      color: #cbd5e1;
      font-size: 0.78rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .quick-dict-link-btn:hover {
      background: rgba(16, 185, 129, 0.2);
      border-color: #10b981;
      color: #ffffff;
    }

    /* Floating highlight mini tooltip */
    .quick-dict-selection-tooltip {
      position: fixed;
      background: #0f172a;
      border: 1px solid #10b981;
      color: #ffffff;
      padding: 5px 11px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(0,0,0,0.4), 0 0 12px rgba(16, 185, 129, 0.35);
      z-index: 100002;
      display: flex;
      align-items: center;
      gap: 6px;
      animation: dictFadeIn 0.18s ease;
      transition: transform 0.15s ease;
    }

    .quick-dict-selection-tooltip:hover {
      transform: scale(1.06);
      background: #047857;
    }

    /* Light Mode Overrides */
    html.light-mode .quick-dict-panel,
    body.light-mode .quick-dict-panel {
      background: rgba(255, 255, 255, 0.96) !important;
      border-color: rgba(0, 0, 0, 0.12) !important;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15), 0 0 35px rgba(13, 148, 136, 0.15) !important;
      color: #0f172a !important;
    }

    html.light-mode .quick-dict-header,
    body.light-mode .quick-dict-header {
      background: linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(2, 132, 199, 0.1) 100%) !important;
    }

    html.light-mode .quick-dict-name,
    body.light-mode .quick-dict-name {
      color: #0f172a !important;
    }

    html.light-mode .quick-dict-input,
    body.light-mode .quick-dict-input {
      background: #f8fafc !important;
      color: #0f172a !important;
      border-color: rgba(13, 148, 136, 0.3) !important;
    }

    html.light-mode .quick-dict-card,
    body.light-mode .quick-dict-card {
      background: #f1f5f9 !important;
      border-color: rgba(0, 0, 0, 0.08) !important;
    }

    html.light-mode .quick-dict-hanzi,
    body.light-mode .quick-dict-hanzi {
      color: #0f172a !important;
    }

    html.light-mode .quick-dict-meaning-text,
    body.light-mode .quick-dict-meaning-text {
      color: #1e293b !important;
    }

    html.light-mode .quick-dict-meaning-box,
    body.light-mode .quick-dict-meaning-box {
      background: #ffffff !important;
    }

    html.light-mode .quick-dict-ex-zh,
    body.light-mode .quick-dict-ex-zh {
      color: #0f172a !important;
    }
  `;
  document.head.appendChild(styleEl);

  // Mount Widget Element
  function mountWidget() {
    const widget = document.createElement('div');
    widget.className = `quick-dict-widget ${dockSide === 'left' ? 'dock-left' : ''}`;
    widget.id = 'quick-dict-widget';

    widget.innerHTML = `
      <!-- Floating Bubble Button -->
      <button class="quick-dict-toggle-btn" id="quick-dict-toggle-btn" title="Tra nhanh từ điển (Alt + D)">
        <i class="fa-solid fa-book-bookmark"></i>
        <span class="quick-dict-tag-pill" id="quick-dict-tag-pill" style="display: none;">TRA</span>
      </button>

      <!-- Panel Modal -->
      <div class="quick-dict-panel" id="quick-dict-panel" style="display: none;">
        <!-- Header -->
        <div class="quick-dict-header">
          <div class="quick-dict-title-wrap">
            <div class="quick-dict-avatar">
              <i class="fa-solid fa-language"></i>
            </div>
            <div>
              <h4 class="quick-dict-name">Từ Điển Tra Nhanh</h4>
              <span class="quick-dict-sub">Hongtai Smart Dictionary</span>
            </div>
          </div>
          <div class="quick-dict-actions">
            <button class="quick-dict-action-btn" id="quick-dict-dock-btn" title="Chuyển sang bên Trái/Phải">
              <i class="fa-solid fa-arrow-right-arrow-left"></i>
            </button>
            <button class="quick-dict-action-btn" id="quick-dict-close-btn" title="Đóng từ điển (Esc)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <!-- Search Input -->
        <div class="quick-dict-search-wrap">
          <div class="quick-dict-input-container">
            <i class="fa-solid fa-magnifying-glass quick-dict-search-icon"></i>
            <input type="text" class="quick-dict-input" id="quick-dict-input" placeholder="Nhập chữ Hán, Pinyin hoặc tiếng Việt..." autocomplete="off">
            <button class="quick-dict-clear-btn" id="quick-dict-clear-btn" title="Xóa tìm kiếm">
              <i class="fa-solid fa-circle-xmark"></i>
            </button>
          </div>
          <div class="quick-dict-pills-bar" id="quick-dict-pills-bar">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- Result / Body Area -->
        <div class="quick-dict-body" id="quick-dict-body">
          <div class="quick-dict-empty" id="quick-dict-empty-view">
            <div class="quick-dict-empty-icon">
              <i class="fa-solid fa-book-open-reader"></i>
            </div>
            <div class="quick-dict-empty-title">Tra cứu tức thì bất kỳ từ nào</div>
            <div class="quick-dict-empty-hint">
              Nhập từ cần tra ở trên hoặc bôi đen chữ Hán bất kỳ trên trang web để tra nghĩa nhanh, phát âm chuẩn và xem câu ví dụ.
            </div>
          </div>
          <div id="quick-dict-result-view" style="display: none;"></div>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    // Elements
    const toggleBtn = document.getElementById('quick-dict-toggle-btn');
    const panel = document.getElementById('quick-dict-panel');
    const closeBtn = document.getElementById('quick-dict-close-btn');
    const dockBtn = document.getElementById('quick-dict-dock-btn');
    const input = document.getElementById('quick-dict-input');
    const clearBtn = document.getElementById('quick-dict-clear-btn');

    // Toggle Open / Close
    function toggleDict(forceState) {
      const isVisible = panel.style.display !== 'none';
      const next = typeof forceState === 'boolean' ? forceState : !isVisible;
      if (next) {
        panel.style.display = 'flex';
        loadLocalDict();
        renderHistoryTags();
        setTimeout(() => input.focus(), 80);
      } else {
        panel.style.display = 'none';
      }
    }

    toggleBtn.addEventListener('click', () => toggleDict());
    closeBtn.addEventListener('click', () => toggleDict(false));

    // Clear Button
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      showEmptyState();
      input.focus();
    });

    // Dock Button
    dockBtn.addEventListener('click', () => {
      dockSide = dockSide === 'right' ? 'left' : 'right';
      localStorage.setItem('hongtai_quick_dict_dock', dockSide);
      widget.classList.toggle('dock-left', dockSide === 'left');
    });

    // Input Handler with Debounce
    input.addEventListener('input', () => {
      const q = input.value.trim();
      clearBtn.style.display = q ? 'block' : 'none';
      clearTimeout(searchDebounceTimer);
      if (!q) {
        showEmptyState();
        return;
      }
      searchDebounceTimer = setTimeout(() => {
        executeSearch(q);
      }, 200);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = input.value.trim();
        if (q) executeSearch(q);
      } else if (e.key === 'Escape') {
        toggleDict(false);
      }
    });

    // Keyboard shortcut Alt + D
    window.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        toggleDict();
      }
    });

    // Expose Global Helper
    window.openQuickDict = function (word) {
      toggleDict(true);
      if (word && typeof word === 'string') {
        input.value = word;
        clearBtn.style.display = 'block';
        executeSearch(word);
      }
    };
  }

  function showEmptyState() {
    const emptyView = document.getElementById('quick-dict-empty-view');
    const resultView = document.getElementById('quick-dict-result-view');
    if (emptyView) emptyView.style.display = 'block';
    if (resultView) {
      resultView.style.display = 'none';
      resultView.innerHTML = '';
    }
  }

  function renderHistoryTags() {
    const bar = document.getElementById('quick-dict-pills-bar');
    if (!bar) return;
    const history = getSearchHistory();
    const defaults = ['家', '学习', '朋友', '天气', '工作', '喜欢'];
    const tags = history.length > 0 ? history : defaults;

    bar.innerHTML = tags.map(t => `<button class="quick-dict-pill" data-word="${t}">${t}</button>`).join('');
    bar.querySelectorAll('.quick-dict-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const w = btn.dataset.word;
        const input = document.getElementById('quick-dict-input');
        const clearBtn = document.getElementById('quick-dict-clear-btn');
        if (input) {
          input.value = w;
          if (clearBtn) clearBtn.style.display = 'block';
          executeSearch(w);
        }
      });
    });
  }

  // Execute Search: Offline first + API fallback
  async function executeSearch(query) {
    if (!query) return;
    const q = query.trim();
    activeSearchQuery = q;

    const resultView = document.getElementById('quick-dict-result-view');
    const emptyView = document.getElementById('quick-dict-empty-view');
    if (emptyView) emptyView.style.display = 'none';
    if (resultView) {
      resultView.style.display = 'block';
      resultView.innerHTML = `
        <div style="text-align: center; padding: 24px; color: #94a3b8;">
          <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 1.5rem; color: #10b981; margin-bottom: 8px;"></i>
          <div>Đang tra cứu từ "${q}"...</div>
        </div>
      `;
    }

    // 1. Try local dictionary
    let dict = localDict;
    if (!dict) dict = await loadLocalDict();

    let match = null;
    if (dict) {
      // Exact Hanzi match
      if (dict[q]) {
        match = dict[q];
      } else {
        const cleanQ = q.replace(/[.,!?:;="\'"()[\]{}，。！？；：\s\-_~`]/g, '');
        if (dict[cleanQ]) {
          match = dict[cleanQ];
        } else {
          // Pinyin match
          const normQ = normalizePinyin(q);
          if (normQ) {
            match = Object.values(dict).find(entry => normalizePinyin(entry.pinyin) === normQ);
          }
          // Starts with Hanzi (only for 2+ chars)
          if (!match && cleanQ.length >= 2) {
            match = Object.values(dict).find(entry => entry.word && entry.word.startsWith(cleanQ));
          }
        }
      }
    }

    if (match) {
      renderResultCard({
        word: match.word,
        pinyin: match.pinyin,
        meaning: match.meaning,
        level: match.level || 'HSK',
        pos: match.pos || 'Từ vựng',
        example_zh: match.example_zh || '',
        example_py: match.example_py || '',
        example_vi: match.example_vi || '',
        note: match.note || ''
      });
      addSearchHistory(match.word);
      return;
    }

    // 2. Fallback to backend /api/dict/lookup
    try {
      const res = await fetch('/api/dict/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: q })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && activeSearchQuery === q) {
          renderResultCard({
            word: data.word || q,
            pinyin: data.pinyin || '',
            meaning: data.meaning || 'Nghĩa từ vựng',
            level: data.hskLevel || 'Tra cứu',
            pos: /[\u4e00-\u9fa5]/.test(q) ? (q.length === 1 ? 'Chữ Hán' : 'Từ vựng') : 'Từ khóa',
            example_zh: '',
            example_py: '',
            example_vi: ''
          });
          addSearchHistory(data.word || q);
          return;
        }
      }
    } catch (e) { }

    // If both fail
    if (activeSearchQuery === q && resultView) {
      resultView.innerHTML = `
        <div style="text-align: center; padding: 24px 12px; color: #94a3b8;">
          <div style="font-size: 2rem; color: #f59e0b; margin-bottom: 8px;">🤔</div>
          <div style="font-size: 1rem; font-weight: 700; color: #f1f5f9; margin-bottom: 4px;">Chưa tìm thấy từ "${q}"</div>
          <div style="font-size: 0.82rem; line-height: 1.5;">Vui lòng kiểm tra lại chính tả hoặc thử tra bằng Pinyin hoặc tiếng Việt.</div>
        </div>
      `;
    }
  }

  function renderResultCard(data) {
    const resultView = document.getElementById('quick-dict-result-view');
    if (!resultView) return;

    const isSingleChar = data.word && data.word.length === 1 && /[\u4e00-\u9fa5]/.test(data.word);

    resultView.innerHTML = `
      <div class="quick-dict-card">
        <!-- Head -->
        <div class="quick-dict-word-head">
          <div>
            <div class="quick-dict-hanzi" id="quick-dict-card-hanzi">${data.word}</div>
            <div class="quick-dict-pinyin-row" style="margin-top: 6px;">
              <span class="quick-dict-pinyin">${data.pinyin ? `[${data.pinyin}]` : ''}</span>
              <button class="quick-dict-speak-btn" id="quick-dict-card-speak-btn" title="Nghe phát âm">
                <i class="fa-solid fa-volume-high"></i>
              </button>
            </div>
          </div>
          <div class="quick-dict-badges-wrap">
            <span class="quick-dict-hsk-badge">${data.level}</span>
            <span class="quick-dict-pos-badge">${data.pos}</span>
          </div>
        </div>

        <!-- Meaning -->
        <div class="quick-dict-meaning-box">
          <div class="quick-dict-meaning-label">Nghĩa tiếng Việt:</div>
          <div class="quick-dict-meaning-text">${data.meaning}</div>
        </div>

        <!-- Example Sentence if available -->
        ${data.example_zh ? `
          <div class="quick-dict-example-box">
            <div class="quick-dict-ex-head">
              <span class="quick-dict-ex-label">Ví dụ minh họa</span>
              <button class="quick-dict-action-btn" id="quick-dict-ex-speak-btn" title="Nghe câu ví dụ" style="width: 24px; height: 24px;">
                <i class="fa-solid fa-volume-high" style="font-size: 0.72rem;"></i>
              </button>
            </div>
            <div class="quick-dict-ex-zh">${data.example_zh}</div>
            ${data.example_py ? `<div class="quick-dict-ex-py">${data.example_py}</div>` : ''}
            <div class="quick-dict-ex-vi">${data.example_vi}</div>
          </div>
        ` : ''}

        <!-- Bottom Actions -->
        <div class="quick-dict-card-actions">
          <button class="quick-dict-link-btn" id="quick-dict-copy-btn">
            <i class="fa-regular fa-copy"></i> Sao chép từ
          </button>
          <a class="quick-dict-link-btn" href="/hanzi-writer.html?word=${encodeURIComponent(data.word)}" target="_blank" title="Tập viết chữ này">
            <i class="fa-solid fa-pen-nib"></i> Tập viết chữ Hán
          </a>
        </div>
      </div>
    `;

    // Speak Button Listener
    const speakBtn = document.getElementById('quick-dict-card-speak-btn');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => playTts(data.word));
    }

    // Example Speak Button Listener
    const exSpeakBtn = document.getElementById('quick-dict-ex-speak-btn');
    if (exSpeakBtn && data.example_zh) {
      exSpeakBtn.addEventListener('click', () => playTts(data.example_zh));
    }

    // Copy Button Listener
    const copyBtn = document.getElementById('quick-dict-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(data.word).then(() => {
          copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Đã sao chép!';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Sao chép từ';
          }, 1500);
        });
      });
    }
  }

  // Global Selection Tooltip (Bôi đen tra từ)
  let activeTooltip = null;

  function removeSelectionTooltip() {
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
  }

  document.addEventListener('mouseup', (e) => {
    // Don't trigger if clicked inside the dictionary widget itself
    if (e.target.closest('#quick-dict-widget')) return;

    setTimeout(() => {
      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : '';

      removeSelectionTooltip();

      // If user selected 1-12 Chinese characters
      if (text && /[\u4e00-\u9fa5]/.test(text) && text.length <= 15) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        const tip = document.createElement('div');
        tip.className = 'quick-dict-selection-tooltip';
        tip.innerHTML = `<i class="fa-solid fa-book-bookmark"></i> Tra "${text.length > 5 ? text.slice(0, 5) + '...' : text}"`;
        tip.style.left = `${Math.max(10, rect.left + window.scrollX + (rect.width / 2) - 45)}px`;
        tip.style.top = `${Math.max(10, rect.top + window.scrollY - 38)}px`;

        tip.addEventListener('mousedown', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          removeSelectionTooltip();
          window.openQuickDict(text);
        });

        document.body.appendChild(tip);
        activeTooltip = tip;
      }
    }, 100);
  });

  document.addEventListener('mousedown', (e) => {
    if (activeTooltip && !activeTooltip.contains(e.target)) {
      removeSelectionTooltip();
    }
  });

  // Mount on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountWidget);
  } else {
    mountWidget();
  }
})();
