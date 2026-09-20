/**
 * Tiếng Trung HongTai - Kho Sách & Tài Liệu Điện Tử (E-Book Reader)
 * Trình đọc sách PDF thông minh, bảo mật bản quyền, lưu tiến độ & tương tác học thuật.
 */

// Configure PDF.js worker
if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.js';
}

(function () {
  'use strict';

  const API_BASE = '';
  let allBooks = [];
  let currentCategory = 'all';
  let searchQuery = '';

  // Reader State
  let currentBook = null;
  let pdfDoc = null;
  let currentPageNum = 1;
  let totalPagesCount = 0;
  let pageRendering = false;
  let pageNumPending = null;
  let currentScale = 1.25;
  let autoFitMode = 'fitWidth'; // 'fitWidth', 'fitPage', 'custom'
  let progressSaveTimeout = null;
  let readerTheme = localStorage.getItem('hongtai_reader_theme') || 'dark';

  // Comments & Notes State
  let currentComments = [];
  let commentsFilterMode = 'page'; // 'page' or 'all'
  let currentNotes = [];
  let selectedNoteColor = '#fef08a';

  // Mobile Touch Swipe
  let touchStartX = 0;
  let touchStartY = 0;

  // DOM Elements cache
  let elGrid, elSearch, elSearchClear, elFilterBtns;
  let elReaderModal, elCanvas, elCanvasCtx, elPageInput, elTotalPages, elBookTitle, elBookMeta;
  let elBtnPrev, elBtnNext, elFloatPrev, elFloatNext, elSpinner;
  let elCommentsDrawer, elCommentsList, elCommentInput, elCommentSubmit;
  let elNotesDrawer, elNotesList, elNoteInput, elNoteSubmit;

  // Init application
  document.addEventListener('DOMContentLoaded', () => {
    initDOMElements();
    setupEventListeners();
    setupAntiDownloadProtection();
    loadBooksCatalog();
  });

  function initDOMElements() {
    elGrid = document.getElementById('documents-grid');
    elSearch = document.getElementById('documents-search-input');
    elSearchClear = document.getElementById('documents-search-clear');
    elFilterBtns = document.querySelectorAll('.documents-filter-btn');

    // Reader modal elements
    elReaderModal = document.getElementById('ebook-reader-modal');
    elCanvas = document.getElementById('pdf-render-canvas');
    if (elCanvas) elCanvasCtx = elCanvas.getContext('2d');
    elPageInput = document.getElementById('reader-page-input');
    elTotalPages = document.getElementById('reader-total-pages');
    elBookTitle = document.getElementById('reader-book-title');
    elBookMeta = document.getElementById('reader-book-meta');
    elBtnPrev = document.getElementById('reader-btn-prev');
    elBtnNext = document.getElementById('reader-btn-next');
    elFloatPrev = document.getElementById('reader-float-prev');
    elFloatNext = document.getElementById('reader-float-next');
    elSpinner = document.getElementById('reader-loading-overlay');

    // Drawers
    elCommentsDrawer = document.getElementById('reader-comments-drawer');
    elCommentsList = document.getElementById('reader-comments-list');
    elCommentInput = document.getElementById('reader-comment-input');
    elCommentSubmit = document.getElementById('btn-submit-comment');

    elNotesDrawer = document.getElementById('reader-notes-drawer');
    elNotesList = document.getElementById('reader-notes-list');
    elNoteInput = document.getElementById('reader-note-input');
    elNoteSubmit = document.getElementById('btn-submit-note');
  }

  function setupEventListeners() {
    // Search input
    if (elSearch) {
      elSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        if (elSearchClear) {
          elSearchClear.style.display = searchQuery ? 'block' : 'none';
        }
        renderBooksGrid();
      });
    }

    if (elSearchClear) {
      elSearchClear.addEventListener('click', () => {
        if (elSearch) elSearch.value = '';
        searchQuery = '';
        elSearchClear.style.display = 'none';
        renderBooksGrid();
      });
    }

    // Category pills
    elFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category') || 'all';
        renderBooksGrid();
      });
    });

    // Reader Nav
    if (elBtnPrev) elBtnPrev.addEventListener('click', onPrevPage);
    if (elBtnNext) elBtnNext.addEventListener('click', onNextPage);
    if (elFloatPrev) elFloatPrev.addEventListener('click', onPrevPage);
    if (elFloatNext) elFloatNext.addEventListener('click', onNextPage);

    if (elPageInput) {
      elPageInput.addEventListener('change', (e) => {
        const num = parseInt(e.target.value, 10);
        if (!isNaN(num) && num >= 1 && num <= totalPagesCount) {
          queueRenderPage(num);
        } else {
          elPageInput.value = currentPageNum;
        }
      });
    }

    // Zoom controls
    const btnZoomIn = document.getElementById('reader-zoom-in');
    const btnZoomOut = document.getElementById('reader-zoom-out');
    const btnZoomFit = document.getElementById('reader-zoom-fit');

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        autoFitMode = 'custom';
        currentScale = Math.min(3.0, currentScale + 0.2);
        queueRenderPage(currentPageNum);
      });
    }

    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        autoFitMode = 'custom';
        currentScale = Math.max(0.6, currentScale - 0.2);
        queueRenderPage(currentPageNum);
      });
    }

    if (btnZoomFit) {
      btnZoomFit.addEventListener('click', () => {
        autoFitMode = autoFitMode === 'fitWidth' ? 'fitPage' : 'fitWidth';
        showToast(autoFitMode === 'fitWidth' ? 'Đã chỉnh: Vừa chiều rộng' : 'Đã chỉnh: Vừa trang');
        queueRenderPage(currentPageNum);
      });
    }

    // Theme Switcher
    const btnTheme = document.getElementById('reader-theme-toggle');
    if (btnTheme) {
      btnTheme.addEventListener('click', toggleReaderTheme);
    }

    // Back to library button
    const btnBack = document.getElementById('reader-btn-back');
    if (btnBack) {
      btnBack.addEventListener('click', closeReader);
    }

    // Drawer Toggles
    const btnCommentsToggle = document.getElementById('reader-toggle-comments');
    if (btnCommentsToggle) {
      btnCommentsToggle.addEventListener('click', toggleCommentsDrawer);
    }

    const btnCloseComments = document.getElementById('drawer-close-comments');
    if (btnCloseComments) {
      btnCloseComments.addEventListener('click', () => closeDrawer(elCommentsDrawer));
    }

    const btnNotesToggle = document.getElementById('reader-toggle-notes');
    if (btnNotesToggle) {
      btnNotesToggle.addEventListener('click', toggleNotesDrawer);
    }

    const btnCloseNotes = document.getElementById('drawer-close-notes');
    if (btnCloseNotes) {
      btnCloseNotes.addEventListener('click', () => closeDrawer(elNotesDrawer));
    }

    // Comments filter tabs
    document.querySelectorAll('.drawer-filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.drawer-filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        commentsFilterMode = tab.getAttribute('data-mode') || 'page';
        renderCommentsList();
      });
    });

    // Note Color Pickers
    document.querySelectorAll('.color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        selectedNoteColor = dot.getAttribute('data-color') || '#fef08a';
      });
    });

    // Submit Comment
    if (elCommentSubmit) {
      elCommentSubmit.addEventListener('click', handleCommentSubmit);
    }

    // Submit Note
    if (elNoteSubmit) {
      elNoteSubmit.addEventListener('click', handleNoteSubmit);
    }

    // Keyboard Shortcuts for Reading
    window.addEventListener('keydown', (e) => {
      if (!elReaderModal || elReaderModal.style.display !== 'flex') return;

      // Ignore if user is typing in textarea or input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        onNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        onPrevPage();
      } else if (e.key === 'Escape') {
        closeReader();
      }
    });

    // Mobile Swipe Gestures
    const viewport = document.getElementById('reader-viewport');
    if (viewport) {
      viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      viewport.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1) {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          const deltaY = e.changedTouches[0].clientY - touchStartY;
          if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
            if (deltaX < 0) {
              onNextPage();
            } else {
              onPrevPage();
            }
          }
        }
      }, { passive: true });
    }
  }

  // --- ANTI-DOWNLOAD SECURITY SYSTEM ---
  function setupAntiDownloadProtection() {
    // 1. Disable context menu on reader
    if (elReaderModal) {
      elReaderModal.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showToast('🔒 Tài liệu được bảo vệ bản quyền - Chỉ hỗ trợ đọc trực tuyến trên Tiếng Trung HongTai', true);
        return false;
      });
    }

    // 2. Prevent save & print shortcut keys
    window.addEventListener('keydown', (e) => {
      if (elReaderModal && elReaderModal.style.display === 'flex') {
        if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          showToast('🔒 Tính năng in và lưu tệp bị vô hiệu hóa để bảo vệ bản quyền tác giả.', true);
          return false;
        }
      }
    });

    // 3. Prevent dragging canvas
    if (elCanvas) {
      elCanvas.addEventListener('dragstart', (e) => e.preventDefault());
    }
  }

  // --- FETCH & RENDER BOOKS CATALOG ---
  async function loadBooksCatalog() {
    try {
      const res = await fetch(`${API_BASE}/api/books`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.books)) {
        allBooks = data.books;
        updateCategoryCounts();
        renderBooksGrid();
      }
    } catch (err) {
      console.error('Failed to load books catalog:', err);
      if (elGrid) {
        elGrid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #ef4444;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 12px;"></i>
            <p style="font-weight: 700;">Không thể tải kho sách. Vui lòng kiểm tra kết nối máy chủ.</p>
          </div>
        `;
      }
    }
  }

  function updateCategoryCounts() {
    const counts = { all: allBooks.length };
    allBooks.forEach(b => {
      counts[b.category] = (counts[b.category] || 0) + 1;
    });

    elFilterBtns.forEach(btn => {
      const cat = btn.getAttribute('data-category');
      const countEl = btn.querySelector('.documents-filter-count');
      if (countEl) {
        countEl.textContent = counts[cat] || 0;
      }
    });
  }

  function renderBooksGrid() {
    if (!elGrid) return;

    let filtered = allBooks.filter(b => {
      const matchCat = (currentCategory === 'all' || b.category === currentCategory);
      const matchSearch = !searchQuery ||
        (b.titleVi && b.titleVi.toLowerCase().includes(searchQuery)) ||
        (b.titleOriginal && b.titleOriginal.toLowerCase().includes(searchQuery)) ||
        (b.category && b.category.toLowerCase().includes(searchQuery)) ||
        (b.description && b.description.toLowerCase().includes(searchQuery));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      elGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; color: #94a3b8;">
          <i class="fa-solid fa-book-open" style="font-size: 3rem; color: #475569; margin-bottom: 16px;"></i>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #cbd5e1; margin: 0 0 8px 0;">Không tìm thấy sách phù hợp</h3>
          <p style="margin: 0; font-size: 0.95rem;">Thử tìm với từ khóa khác hoặc chuyển sang danh mục Tất cả.</p>
        </div>
      `;
      return;
    }

    elGrid.innerHTML = filtered.map(book => {
      // Check progress from backend or localStorage
      const localProgress = getLocalProgress(book.id);
      const progress = book.userProgress || localProgress;
      const hasProgress = progress && progress.lastPage > 1;

      // Tag class for styling
      let tagClass = 'tag-van-hoa';
      if (book.category.includes('HSK')) tagClass = 'tag-hsk';
      else if (book.category.includes('Hán Ngữ')) tagClass = 'tag-han-ngu';
      else if (book.category.includes('Biên Phiên Dịch')) tagClass = 'tag-bien-dich';
      else if (book.category.includes('Giáo Viên')) tagClass = 'tag-giao-vien';
      else if (book.category.includes('Văn Học') || book.category.includes('Truyện')) tagClass = 'tag-van-hoc';
      else if (book.category.includes('Ngữ Pháp')) tagClass = 'tag-ngu-phap';

      return `
        <div class="book-card" id="card-${book.id}">
          <div class="book-card-spine"></div>
          
          <div class="book-card-header">
            <span class="book-category-tag ${tagClass}">${escapeHTML(book.category)}</span>
            <span class="book-size-chip"><i class="fa-regular fa-file-pdf"></i> ${book.sizeMB} MB</span>
          </div>

          <div class="book-card-body">
            <h3 class="book-title-vi" title="${escapeHTML(book.titleVi)}">${escapeHTML(book.titleVi)}</h3>
            <p class="book-title-original" title="${escapeHTML(book.titleOriginal)}">${escapeHTML(book.titleOriginal)}</p>
            <p class="book-desc">${escapeHTML(book.description)}</p>
          </div>

          ${hasProgress ? `
            <div class="book-card-progress">
              <div class="book-progress-text">
                <span><i class="fa-solid fa-bookmark" style="color: #38bdf8;"></i> Đang đọc: Trang ${progress.lastPage}${progress.totalPages ? '/' + progress.totalPages : ''}</span>
                <span>${progress.percentage || 0}%</span>
              </div>
              <div class="book-progress-bar-bg">
                <div class="book-progress-bar-fill" style="width: ${progress.percentage || 0}%;"></div>
              </div>
            </div>
          ` : ''}

          <div class="book-card-actions">
            <button class="btn-read-book ${hasProgress ? 'has-progress' : ''}" onclick="window.openBookReader('${book.id}')">
              <i class="fa-solid ${hasProgress ? 'fa-book-open-reader' : 'fa-book-open'}"></i>
              <span>${hasProgress ? `Tiếp tục đọc (Trang ${progress.lastPage})` : 'Đọc Sách Ngay'}</span>
            </button>
            <div class="book-interaction-badges">
              <span class="interaction-badge" title="Bình luận"><i class="fa-regular fa-comment"></i> ${book.totalComments || 0}</span>
              ${book.totalUserNotes > 0 ? `<span class="interaction-badge" title="Ghi chú cá nhân"><i class="fa-solid fa-pencil" style="color: #fbbf24;"></i> ${book.totalUserNotes}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- E-BOOK READER ENGINE (PDF.JS) ---
  window.openBookReader = async function (bookId) {
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;

    currentBook = book;
    if (elReaderModal) {
      elReaderModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      applyReaderTheme(readerTheme);
    }

    if (elBookTitle) elBookTitle.textContent = book.titleVi;
    if (elBookMeta) elBookMeta.innerHTML = `<span>${book.category}</span> • <span>${book.titleOriginal}</span>`;

    showReaderLoading(true, 'Đang mở sách và tải trang đầu...');

    // Determine start page
    const localProgress = getLocalProgress(bookId);
    const startPage = (book.userProgress && book.userProgress.lastPage) || (localProgress && localProgress.lastPage) || 1;
    currentPageNum = startPage;

    // Load comments and notes for this book
    fetchBookComments(bookId);
    fetchBookNotes(bookId);

    try {
      const streamUrl = `${API_BASE}/api/books/${bookId}/stream`;
      const loadingTask = window.pdfjsLib.getDocument({
        url: streamUrl,
        withCredentials: true,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true
      });

      pdfDoc = await loadingTask.promise;
      totalPagesCount = pdfDoc.numPages;

      if (elTotalPages) elTotalPages.textContent = `/ ${totalPagesCount}`;
      if (elPageInput) {
        elPageInput.max = totalPagesCount;
        elPageInput.value = currentPageNum;
      }

      showReaderLoading(false);
      renderPage(currentPageNum);

      if (startPage > 1) {
        showToast(`Đã khôi phục trang bạn đang đọc dở: Trang ${startPage}`);
      }
    } catch (err) {
      console.error('Error loading PDF:', err);
      showReaderLoading(false);
      showToast('Không thể mở tệp sách. Vui lòng thử lại sau.', true);
      closeReader();
    }
  };

  async function renderPage(num) {
    if (!pdfDoc) return;
    pageRendering = true;
    showReaderLoading(true, `Đang nạp trang ${num}...`);

    try {
      const page = await pdfDoc.getPage(num);

      // Calculate scale to fit width or fit page
      const viewportContainer = document.getElementById('reader-viewport');
      const unscaledViewport = page.getViewport({ scale: 1.0 });

      if (autoFitMode === 'fitWidth' && viewportContainer) {
        const availableWidth = viewportContainer.clientWidth - 48;
        currentScale = Math.max(0.6, Math.min(2.5, availableWidth / unscaledViewport.width));
      } else if (autoFitMode === 'fitPage' && viewportContainer) {
        const availableHeight = viewportContainer.clientHeight - 60;
        currentScale = Math.max(0.6, Math.min(2.0, availableHeight / unscaledViewport.height));
      }

      const pixelRatio = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: currentScale * pixelRatio });

      elCanvas.height = viewport.height;
      elCanvas.width = viewport.width;
      elCanvas.style.width = `${viewport.width / pixelRatio}px`;
      elCanvas.style.height = `${viewport.height / pixelRatio}px`;

      const renderContext = {
        canvasContext: elCanvasCtx,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      pageRendering = false;
      showReaderLoading(false);

      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }

      // Update UI
      currentPageNum = num;
      if (elPageInput) elPageInput.value = num;
      updateNavButtons();

      // Trigger debounced progress save
      debouncedSaveProgress(num, totalPagesCount);

      // Refresh drawer page views
      if (elCommentsDrawer && elCommentsDrawer.classList.contains('open') && commentsFilterMode === 'page') {
        renderCommentsList();
      }
    } catch (err) {
      console.error('Error rendering page:', err);
      pageRendering = false;
      showReaderLoading(false);
    }
  }

  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  function onPrevPage() {
    if (currentPageNum <= 1) return;
    queueRenderPage(currentPageNum - 1);
  }

  function onNextPage() {
    if (!pdfDoc || currentPageNum >= totalPagesCount) return;
    queueRenderPage(currentPageNum + 1);
  }

  function updateNavButtons() {
    const isFirst = currentPageNum <= 1;
    const isLast = !pdfDoc || currentPageNum >= totalPagesCount;

    if (elBtnPrev) elBtnPrev.disabled = isFirst;
    if (elBtnNext) elBtnNext.disabled = isLast;
    if (elFloatPrev) elFloatPrev.disabled = isFirst;
    if (elFloatNext) elFloatNext.disabled = isLast;
  }

  function showReaderLoading(show, message = 'Đang tải...') {
    if (!elSpinner) return;
    elSpinner.style.display = show ? 'flex' : 'none';
    const textEl = elSpinner.querySelector('.reader-loading-text');
    if (textEl) textEl.textContent = message;
  }

  function closeReader() {
    if (elReaderModal) {
      elReaderModal.style.display = 'none';
      document.body.style.overflow = '';
    }
    closeDrawer(elCommentsDrawer);
    closeDrawer(elNotesDrawer);
    if (pdfDoc) {
      pdfDoc.destroy();
      pdfDoc = null;
    }
    renderBooksGrid(); // Refresh progress on cards
  }

  // --- READING PROGRESS PERSISTENCE ---
  function debouncedSaveProgress(page, total) {
    if (progressSaveTimeout) clearTimeout(progressSaveTimeout);
    progressSaveTimeout = setTimeout(() => {
      saveReadingProgress(page, total);
    }, 1000);
  }

  async function saveReadingProgress(page, total) {
    if (!currentBook) return;
    const bookId = currentBook.id;

    // Save locally
    const progressData = {
      bookId,
      lastPage: page,
      totalPages: total,
      percentage: total ? Math.min(100, Math.round((page / total) * 100)) : 0,
      updatedAt: Date.now()
    };
    saveLocalProgress(bookId, progressData);

    // Sync to Backend
    try {
      await fetch(`${API_BASE}/api/books/${bookId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ page, totalPages: total })
      });
    } catch (e) {
      console.warn('Could not sync reading progress to server:', e);
    }
  }

  function getLocalProgress(bookId) {
    try {
      const data = localStorage.getItem(`hongtai_book_progress_${bookId}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function saveLocalProgress(bookId, data) {
    try {
      localStorage.setItem(`hongtai_book_progress_${bookId}`, JSON.stringify(data));
    } catch (e) { }
  }

  // --- COMMENTS MANAGEMENT ---
  async function fetchBookComments(bookId) {
    try {
      const res = await fetch(`${API_BASE}/api/books/${bookId}/comments`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.comments)) {
        currentComments = data.comments;
        updateCommentCountBadge();
        renderCommentsList();
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  }

  function updateCommentCountBadge() {
    const badge = document.getElementById('reader-comments-count-badge');
    if (badge) {
      badge.textContent = currentComments.length;
      badge.style.display = currentComments.length > 0 ? 'inline-block' : 'none';
    }
  }

  function toggleCommentsDrawer() {
    if (!elCommentsDrawer) return;
    closeDrawer(elNotesDrawer);
    const isOpen = elCommentsDrawer.classList.contains('open');
    if (isOpen) {
      closeDrawer(elCommentsDrawer);
    } else {
      elCommentsDrawer.classList.add('open');
      renderCommentsList();
    }
  }

  function renderCommentsList() {
    if (!elCommentsList) return;

    let list = currentComments;
    if (commentsFilterMode === 'page') {
      list = list.filter(c => Number(c.page) === Number(currentPageNum));
    }

    const titleEl = document.getElementById('comments-current-page-label');
    if (titleEl) {
      titleEl.textContent = commentsFilterMode === 'page' ? `Trang ${currentPageNum}` : 'Tất cả các trang';
    }

    if (list.length === 0) {
      elCommentsList.innerHTML = `
        <div style="text-align: center; padding: 40px 10px; color: #94a3b8;">
          <i class="fa-regular fa-comment-dots" style="font-size: 2.2rem; color: #475569; margin-bottom: 12px;"></i>
          <p style="font-size: 0.9rem; margin: 0;">Chưa có bình luận nào cho ${commentsFilterMode === 'page' ? `trang ${currentPageNum}` : 'sách này'}.</p>
          <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0 0;">Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ ý kiến!</p>
        </div>
      `;
      return;
    }

    elCommentsList.innerHTML = list.map(c => {
      const userInitial = (c.authorName || 'H').charAt(0).toUpperCase();
      const timeStr = formatRelativeTime(c.createdAt);

      return `
        <div class="comment-card" id="comment-${c.id}">
          <div class="comment-card-header">
            <div class="comment-user-info">
              ${c.authorPicture ? `<img src="${c.authorPicture}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;">` : `<div class="comment-avatar">${userInitial}</div>`}
              <span class="comment-author-name">${escapeHTML(c.authorName)}</span>
            </div>
            <span class="comment-page-badge" onclick="window.jumpToPage(${c.page})" style="cursor: pointer;" title="Nhảy tới trang ${c.page}">Trang ${c.page}</span>
          </div>
          <div class="comment-content">${escapeHTML(c.content)}</div>
          <div class="comment-time">${timeStr}</div>
        </div>
      `;
    }).join('');
  }

  async function handleCommentSubmit() {
    if (!elCommentInput || !currentBook) return;
    const content = elCommentInput.value.trim();
    if (!content) {
      showToast('Vui lòng nhập nội dung bình luận.', true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/books/${currentBook.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          page: currentPageNum,
          content
        })
      });

      const data = await res.json();
      if (data.success && data.comment) {
        currentComments.unshift(data.comment);
        elCommentInput.value = '';
        updateCommentCountBadge();
        renderCommentsList();
        showToast('Đã gửi bình luận thành công!');
      } else {
        showToast(data.error || 'Lỗi gửi bình luận', true);
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      showToast('Không thể gửi bình luận.', true);
    }
  }

  // --- PERSONAL NOTES MANAGEMENT ---
  async function fetchBookNotes(bookId) {
    try {
      const res = await fetch(`${API_BASE}/api/books/${bookId}/notes`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.notes)) {
        currentNotes = data.notes;
        updateNotesCountBadge();
        renderNotesList();
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  }

  function updateNotesCountBadge() {
    const badge = document.getElementById('reader-notes-count-badge');
    if (badge) {
      badge.textContent = currentNotes.length;
      badge.style.display = currentNotes.length > 0 ? 'inline-block' : 'none';
    }
  }

  function toggleNotesDrawer() {
    if (!elNotesDrawer) return;
    closeDrawer(elCommentsDrawer);
    const isOpen = elNotesDrawer.classList.contains('open');
    if (isOpen) {
      closeDrawer(elNotesDrawer);
    } else {
      elNotesDrawer.classList.add('open');
      renderNotesList();
    }
  }

  function renderNotesList() {
    if (!elNotesList) return;

    if (currentNotes.length === 0) {
      elNotesList.innerHTML = `
        <div style="text-align: center; padding: 40px 10px; color: #94a3b8;">
          <i class="fa-solid fa-feather-pointed" style="font-size: 2.2rem; color: #475569; margin-bottom: 12px;"></i>
          <p style="font-size: 0.9rem; margin: 0;">Bạn chưa có ghi chú nào cho cuốn sách này.</p>
          <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0 0;">Ghi lại từ mới, ngữ pháp hoặc lưu ý cá nhân tại từng trang.</p>
        </div>
      `;
      return;
    }

    elNotesList.innerHTML = currentNotes.map(n => {
      return `
        <div class="note-card" style="border-left-color: ${n.color || '#fef08a'};" onclick="window.jumpToPage(${n.page})">
          <div class="note-card-top">
            <span class="note-jump-badge"><i class="fa-solid fa-arrow-turn-down"></i> Trang ${n.page}</span>
            <button class="note-delete-btn" onclick="event.stopPropagation(); window.deleteNote('${n.id}')" title="Xóa ghi chú"><i class="fa-solid fa-trash-can"></i></button>
          </div>
          <div class="note-text">${escapeHTML(n.content)}</div>
        </div>
      `;
    }).join('');
  }

  async function handleNoteSubmit() {
    if (!elNoteInput || !currentBook) return;
    const content = elNoteInput.value.trim();
    if (!content) {
      showToast('Vui lòng nhập nội dung ghi chú.', true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/books/${currentBook.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          page: currentPageNum,
          content,
          color: selectedNoteColor
        })
      });

      const data = await res.json();
      if (data.success && data.note) {
        currentNotes.unshift(data.note);
        elNoteInput.value = '';
        updateNotesCountBadge();
        renderNotesList();
        showToast(`Đã lưu ghi chú cho Trang ${currentPageNum}!`);
      }
    } catch (err) {
      console.error('Error saving note:', err);
      showToast('Không thể lưu ghi chú.', true);
    }
  }

  window.deleteNote = async function (noteId) {
    if (!confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) return;
    if (!currentBook) return;

    try {
      const res = await fetch(`${API_BASE}/api/books/${currentBook.id}/notes/${noteId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        currentNotes = currentNotes.filter(n => n.id !== noteId);
        updateNotesCountBadge();
        renderNotesList();
        showToast('Đã xóa ghi chú.');
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      showToast('Lỗi xóa ghi chú.', true);
    }
  };

  window.jumpToPage = function (pageNum) {
    if (!pdfDoc || pageNum < 1 || pageNum > totalPagesCount) return;
    queueRenderPage(pageNum);
  };

  function closeDrawer(drawer) {
    if (drawer) drawer.classList.remove('open');
  }

  // --- THEME SWITCHING ---
  function toggleReaderTheme() {
    if (!elReaderModal) return;
    if (readerTheme === 'dark') readerTheme = 'sepia';
    else if (readerTheme === 'sepia') readerTheme = 'light';
    else readerTheme = 'dark';

    localStorage.setItem('hongtai_reader_theme', readerTheme);
    applyReaderTheme(readerTheme);
  }

  function applyReaderTheme(theme) {
    if (!elReaderModal) return;
    elReaderModal.classList.remove('theme-dark', 'theme-sepia', 'theme-light');
    elReaderModal.classList.add(`theme-${theme}`);

    const icon = document.querySelector('#reader-theme-toggle i');
    if (icon) {
      if (theme === 'dark') icon.className = 'fa-solid fa-moon';
      else if (theme === 'sepia') icon.className = 'fa-solid fa-sun';
      else icon.className = 'fa-regular fa-sun';
    }
  }

  // --- UTILITY HELPERS ---
  function getAuthHeaders() {
    const headers = {};
    try {
      const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
      if (user && user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
    } catch (e) { }

    // Guest ID fallback
    let guestId = localStorage.getItem('hongtai_guest_device_id');
    if (!guestId) {
      guestId = 'dev_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('hongtai_guest_device_id', guestId);
    }
    headers['x-guest-id'] = guestId;

    return headers;
  }

  function showToast(message, isError = false) {
    if (typeof window.showToast === 'function') {
      window.showToast(message, isError);
      return;
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: ${isError ? 'rgba(239, 68, 68, 0.95)' : 'rgba(15, 23, 42, 0.95)'};
      color: #ffffff;
      border: 1px solid ${isError ? '#f87171' : 'rgba(56, 189, 248, 0.4)'};
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 700;
      z-index: 10000000;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      backdrop-filter: blur(8px);
      transition: opacity 0.3s ease;
      text-align: center;
      max-width: 90vw;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatRelativeTime(dateStr) {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
    return new Date(dateStr).toLocaleDateString('vi-VN');
  }

})();
