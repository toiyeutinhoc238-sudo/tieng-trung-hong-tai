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
  let elBookshelfView, elCatalogView, elBtnBookshelf, elBtnCatalog;
  let elReaderModal, elCanvas, elCanvasCtx, elPageInput, elTotalPages, elBookTitle, elBookMeta;
  let elBtnPrev, elBtnNext, elFloatPrev, elFloatNext, elSpinner;
  let elCommentsDrawer, elCommentsList, elCommentInput, elCommentSubmit;
  let elNotesDrawer, elNotesList, elNoteInput, elNoteSubmit;

  // View state
  let currentDocsView = 'bookshelf'; // 'bookshelf' or 'catalog'

  // Init application
  document.addEventListener('DOMContentLoaded', () => {
    initDOMElements();
    setupEventListeners();
    setupAntiDownloadProtection();
    loadBooksCatalog();
    renderBookshelves();
  });

  function initDOMElements() {
    elGrid = document.getElementById('documents-grid');
    elSearch = document.getElementById('documents-search-input');
    elSearchClear = document.getElementById('documents-search-clear');
    elFilterBtns = document.querySelectorAll('.documents-filter-btn');

    // Bookshelf & Catalog View elements
    elBookshelfView = document.getElementById('documents-bookshelf-view');
    elCatalogView = document.getElementById('documents-catalog-view');
    elBtnBookshelf = document.getElementById('btn-view-bookshelf');
    elBtnCatalog = document.getElementById('btn-view-catalog');

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
        renderBookshelves();
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

  // --- VIEW SWITCHER ---
  window.switchDocsView = function (mode) {
    currentDocsView = mode;
    if (!elBookshelfView || !elCatalogView) {
      elBookshelfView = document.getElementById('documents-bookshelf-view');
      elCatalogView = document.getElementById('documents-catalog-view');
      elBtnBookshelf = document.getElementById('btn-view-bookshelf');
      elBtnCatalog = document.getElementById('btn-view-catalog');
    }

    if (mode === 'bookshelf') {
      if (elBookshelfView) elBookshelfView.style.display = 'block';
      if (elCatalogView) elCatalogView.style.display = 'none';
      if (elBtnBookshelf) elBtnBookshelf.classList.add('active');
      if (elBtnCatalog) elBtnCatalog.classList.remove('active');
    } else {
      if (elBookshelfView) elBookshelfView.style.display = 'none';
      if (elCatalogView) elCatalogView.style.display = 'block';
      if (elBtnBookshelf) elBtnBookshelf.classList.remove('active');
      if (elBtnCatalog) elBtnCatalog.classList.add('active');
    }
  };

  // --- COMIC BOOKSHELF RENDERER (Matching User Reference Image) ---
  function renderBookshelves() {
    const container = elBookshelfView || document.getElementById('documents-bookshelf-view');
    if (!container) return;

    // Helper to get progress for a bookId
    function getBookProgressInfo(bookId) {
      if (!bookId) return null;
      const b = allBooks.find(item => item.id === bookId);
      const local = getLocalProgress(bookId);
      const prog = (b && b.userProgress) || local;
      return (prog && prog.lastPage > 1) ? prog : null;
    }

    const shelvesData = [
      {
        id: 'shelf-hsk2',
        accentColor: '#0284c7',
        mascotImg: '/assets/hongtai_dragon_mascot.png',
        title: 'Giáo Trình Chuẩn HSK 2.0',
        subtitle: 'Bộ giáo trình 6 cấp độ (HSK 1 - HSK 6)',
        books: [
          {
            level: 1,
            title: 'Giáo Trình Chuẩn HSK 1',
            coverUrl: '/covers/hsk2/hsk1.jpg',
            bookId: null,
            desc: 'Giáo trình chuẩn HSK 1 bao gồm 15 bài học nhập môn kèm file dịch tiếng Việt chuẩn của TS. Nguyễn Thị Minh Hồng.'
          },
          {
            level: 2,
            title: 'Giáo Trình Chuẩn HSK 2',
            coverUrl: '/covers/hsk2/hsk2.jpg',
            bookId: null,
            desc: 'Giáo trình chuẩn HSK 2 bao gồm 15 bài học sơ cấp nâng cao mở rộng vốn câu giao tiếp thực tế.'
          },
          {
            level: 3,
            title: 'Giáo Trình Chuẩn HSK 3',
            coverUrl: '/covers/hsk2/hsk3.jpg',
            bookId: null,
            desc: 'Giáo trình chuẩn HSK 3 bao gồm 20 bài học củng cố ngữ pháp trung cấp và diễn đạt mở rộng.'
          },
          {
            level: 4,
            title: 'Giáo Trình Chuẩn HSK 4',
            coverUrl: '/covers/hsk2/hsk4.jpg',
            bookId: null,
            desc: 'Giáo trình chuẩn HSK 4 gồm 2 tập Thượng và Hạ với 20 chủ đề chuyên sâu.'
          },
          {
            level: 5,
            title: 'Giáo Trình Chuẩn HSK 5 (Tập Dưới)',
            coverUrl: '/covers/hsk2/hsk5.jpg',
            bookId: 'book_8e6cd7',
            desc: 'Giáo trình chuẩn HSK 5 Tập Dưới (HSK 5 chuẩn下.pdf) bản số hóa sắc nét, đọc trực tuyến mượt mà.'
          },
          {
            level: 6,
            title: 'Giáo Trình Chuẩn HSK 6',
            coverUrl: '/covers/hsk2/hsk6.jpg',
            bookId: null,
            desc: 'Giáo trình chuẩn HSK 6 cao cấp dành cho người học thành thạo ngôn ngữ.'
          }
        ]
      },
      {
        id: 'shelf-hsk3',
        accentColor: '#10b981',
        mascotImg: '/assets/dragon_award_mascot.png',
        title: 'Giáo Trình HSK 3.0 Mới',
        subtitle: 'Bộ giáo trình tiêu chuẩn quốc tế mới nhất (Cấp 1 - Cấp 4)',
        books: [
          {
            level: 1,
            title: '新 HSK 教程 1 (HSK 3.0)',
            coverUrl: '/covers/hsk3/hsk1.jpg',
            bookId: null,
            desc: 'Giáo trình HSK cấp độ 1 tiêu chuẩn 3.0 mới nhất do NXB Giáo dục & Nghiên cứu Giảng dạy Ngôn ngữ Bắc Kinh xuất bản.'
          },
          {
            level: 2,
            title: '新 HSK 教程 2 (HSK 3.0)',
            coverUrl: '/covers/hsk3/hsk2.jpg',
            bookId: 'book_74e5v6',
            desc: 'Toàn bộ giáo trình HSK 2 mới chuẩn quốc tế 3.0 với đầy đủ bài khóa và hội thoại.'
          },
          {
            level: 3,
            title: '新 HSK 教程 3 (HSK 3.0)',
            coverUrl: '/covers/hsk3/hsk3.jpg',
            bookId: 'book_3b4cws',
            desc: 'Giáo trình HSK 3 mới chuẩn 3.0 củng cố hệ thống ngữ pháp và 1000 từ vựng cốt lõi.'
          },
          {
            level: 4,
            title: '新 HSK 教程 4 (Tập Trên - HSK 3.0)',
            coverUrl: '/covers/hsk3/hsk4.jpg',
            bookId: 'book_32gwjz',
            desc: 'Giáo trình HSK 4 mới Tập Trên chuẩn v3.0 kèm 10 bài học trung cấp cơ bản.'
          }
        ]
      },
      {
        id: 'shelf-hanngu',
        accentColor: '#f59e0b',
        mascotImg: '/assets/logo.png',
        title: 'Giáo Trình Hán Ngữ 6 Cuốn',
        subtitle: 'Bản dịch song ngữ Trung - Việt chuẩn Đại học (Tập 1 - 6)',
        books: [
          {
            volNum: 1,
            title: 'Giáo Trình Hán Ngữ 1',
            subtitle: 'Bản dịch song ngữ',
            bookId: 'book_m03mz1',
            color: '#eab308',
            tag: 'Quyển 1 Thượng',
            desc: 'Giáo trình Hán ngữ cơ sở quyển 1 chuẩn quốc tế, rèn luyện phát âm Pinyin, nét bút và giao tiếp nhập môn.'
          },
          {
            volNum: 2,
            title: 'Giáo Trình Hán Ngữ 2',
            subtitle: 'Bản dịch song ngữ',
            bookId: 'book_82zwgt',
            color: '#16a34a',
            tag: 'Quyển 1 Hạ',
            desc: 'Giáo trình Hán ngữ bộ 6 tập quyển 2, bản dịch chú giải tiếng Việt chuẩn xác cho học viên mới bắt đầu.'
          },
          {
            volNum: 3,
            title: 'Giáo Trình Hán Ngữ 3',
            subtitle: 'Bản dịch song ngữ',
            bookId: 'book_8emthg',
            color: '#ea580c',
            tag: 'Quyển 2 Thượng',
            desc: 'Giáo trình Hán ngữ quyển 3 (Tập 2 Thượng), bước ngoặt củng cố ngữ pháp trung cấp và diễn đạt mở rộng.'
          },
          {
            volNum: 4,
            title: 'Giáo Trình Hán Ngữ 4',
            subtitle: 'Bản dịch song ngữ',
            bookId: 'book_ow9jfp',
            color: '#2563eb',
            tag: 'Quyển 2 Hạ',
            desc: 'Giáo trình Hán ngữ quyển 4 (Tập 2 Hạ), nâng cao vốn từ vựng chuyên đề, câu phức và đối thoại chuyên sâu.'
          },
          {
            volNum: 5,
            title: 'Giáo Trình Hán Ngữ 5',
            subtitle: 'Bản dịch song ngữ',
            bookId: 'book_tn7sl6',
            color: '#9333ea',
            tag: 'Quyển 3 Thượng',
            desc: 'Giáo trình Hán ngữ quyển 5 (Tập 3 Thượng) nâng cao khả năng phân tích ngữ văn và nghị luận.'
          },
          {
            volNum: 6,
            title: 'Giáo Trình Hán Ngữ 6',
            subtitle: 'Bản dịch song ngữ',
            bookId: null,
            color: '#0f766e',
            tag: 'Quyển 3 Hạ',
            desc: 'Giáo trình Hán ngữ quyển 6 (Tập 3 Hạ) hoàn thiện kỹ năng đọc hiểu và văn phong bản xứ cao cấp.'
          }
        ]
      }
    ];

    container.innerHTML = shelvesData.map(shelf => {
      const booksHtml = shelf.books.map(b => {
        const prog = getBookProgressInfo(b.bookId);
        const hasPdf = Boolean(b.bookId);

        let badgeHtml = '';
        if (prog) {
          badgeHtml = `<span class="comic-book-status-badge reading"><i class="fa-solid fa-bookmark"></i> P.${prog.lastPage}</span>`;
        } else if (hasPdf) {
          badgeHtml = `<span class="comic-book-status-badge available"><i class="fa-solid fa-book-open"></i> Đọc ngay</span>`;
        } else {
          badgeHtml = `<span class="comic-book-status-badge"><i class="fa-solid fa-clock"></i> Sắp ra</span>`;
        }

        // Check if book has a custom stylized color cover (like Hán Ngữ) or real image cover
        let innerCoverHtml = '';
        if (b.coverUrl) {
          innerCoverHtml = `<img src="${b.coverUrl}" alt="${escapeHTML(b.title)}" class="comic-book-cover-img" loading="lazy">`;
        } else {
          // Beautiful stylized cover matching student book aesthetic from screenshot
          innerCoverHtml = `
            <div class="styled-vol-card" style="background: linear-gradient(145deg, ${b.color || '#3b82f6'}, #0f172a 130%);">
              <div class="vol-sub">${escapeHTML(b.tag || 'Giáo Trình')}</div>
              <div class="vol-name">${escapeHTML(b.title)}</div>
              <div class="vol-center-pattern">
                <div class="pattern-grid">
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.7);"></div>
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.3);"></div>
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.8);"></div>
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.4);"></div>
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.9);"></div>
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.5);"></div>
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.6);"></div>
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.85);"></div>
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.35);"></div>
                </div>
              </div>
              <div class="vol-footer">
                <div class="vol-foot-label">HongTai<br>Book</div>
                <div class="vol-number-badge">${b.volNum || b.level || ''}</div>
              </div>
            </div>
          `;
        }

        const safeTitle = escapeHTML(b.title);
        const safeCover = b.coverUrl ? escapeHTML(b.coverUrl) : '';
        const safeDesc = escapeHTML(b.desc || '');
        const safeId = b.bookId ? `'${b.bookId}'` : 'null';
        const levelArg = (b.level || b.volNum) ? `${b.level || b.volNum}` : 'null';

        return `
          <div class="comic-book-card" onclick="window.openShelfBook(${safeId}, '${safeTitle}', '${safeCover}', '${safeDesc}', ${levelArg})" title="${safeTitle}">
            <div class="comic-book-spine-overlay"></div>
            <div class="comic-book-gloss-overlay"></div>
            ${badgeHtml}
            ${innerCoverHtml}
          </div>
        `;
      }).join('');

      return `
        <section class="bookshelf-shelf" style="--shelf-accent: ${shelf.accentColor};">
          <div class="bookshelf-shelf-header">
            <div class="bookshelf-mascot-badge">
              <img src="${shelf.mascotImg}" alt="Mascot" class="bookshelf-mascot-img">
            </div>
            <div class="bookshelf-shelf-titles">
              <h2 class="bookshelf-shelf-title">${escapeHTML(shelf.title)}</h2>
              <p class="bookshelf-shelf-subtitle">${escapeHTML(shelf.subtitle)}</p>
            </div>
          </div>
          <div class="bookshelf-grid">
            ${booksHtml}
          </div>
        </section>
      `;
    }).join('');
  }

  // --- SHELF BOOK OPEN & MODAL HANDLERS ---
  window.openShelfBook = function (bookId, title, coverUrl, desc, level) {
    if (bookId) {
      window.openBookReader(bookId);
      return;
    }

    // Show pending modal
    const modal = document.getElementById('pending-book-modal');
    const imgEl = document.getElementById('pending-modal-cover');
    const titleEl = document.getElementById('pending-modal-title');
    const descEl = document.getElementById('pending-modal-desc');
    const actionsEl = document.getElementById('pending-modal-actions');

    if (modal && titleEl && descEl) {
      if (imgEl) {
        imgEl.src = coverUrl || '/assets/logo.png';
        imgEl.alt = title;
      }
      titleEl.textContent = title;
      descEl.textContent = desc || 'Bản số hóa chất lượng cao đang được cập nhật để mang lại trải nghiệm đọc tốt nhất cho bạn.';

      let actionsHtml = `
        <button onclick="window.closePendingBookModal()" class="topbar-comic-menu-btn" style="width: auto; padding: 8px 18px; font-size: 0.9rem; font-weight: 800;">
          Đóng
        </button>
      `;

      if (level) {
        actionsHtml += `
          <a href="/detail-list.html?level=${level}" class="topbar-comic-login-btn">
            <i class="fa-solid fa-graduation-cap"></i>
            <span>Học Từ Vựng Cấp ${level}</span>
          </a>
        `;
      }

      if (actionsEl) actionsEl.innerHTML = actionsHtml;
      modal.style.display = 'flex';
    }
  };

  window.closePendingBookModal = function (e) {
    if (e && e.target !== e.currentTarget) return;
    const modal = document.getElementById('pending-book-modal');
    if (modal) modal.style.display = 'none';
  };

  window.showMascotTipModal = function () {
    const modal = document.getElementById('pending-book-modal');
    const imgEl = document.getElementById('pending-modal-cover');
    const titleEl = document.getElementById('pending-modal-title');
    const descEl = document.getElementById('pending-modal-desc');
    const actionsEl = document.getElementById('pending-modal-actions');

    if (modal && titleEl && descEl) {
      if (imgEl) {
        imgEl.src = '/assets/hongtai_dragon_mascot.png';
        imgEl.alt = 'HongTai Dragon Mascot';
      }
      titleEl.textContent = 'Mẹo Đọc Sách Thông Minh Cùng HongTai';
      descEl.innerHTML = `
        <div style="text-align: left; font-size: 0.88rem; line-height: 1.6; color: #334155; display: flex; flex-direction: column; gap: 8px;">
          <div><strong style="color: #0284c7;">📖 Đọc trực tuyến:</strong> Không cần tải PDF, đọc siêu tốc trên mọi thiết bị máy tính và điện thoại.</div>
          <div><strong style="color: #10b981;">🔖 Tự động lưu trang:</strong> Đóng sách hệ thống tự động ghi nhớ trang đang đọc cho lần sau.</div>
          <div><strong style="color: #f59e0b;">💬 Thảo luận trang:</strong> Nhấn nút "Bình luận" để hỏi đáp và thảo luận trực tiếp theo từng trang.</div>
          <div><strong style="color: #ec4899;">✍️ Ghi chú cá nhân:</strong> Viết note riêng tư kèm nhãn màu đánh dấu kiến thức quan trọng.</div>
        </div>
      `;
      if (actionsEl) {
        actionsEl.innerHTML = `
          <button onclick="window.closePendingBookModal()" class="topbar-comic-login-btn" style="width: 100%; justify-content: center;">
            <i class="fa-solid fa-check"></i>
            <span>Đã hiểu, bắt đầu đọc sách ngay!</span>
          </button>
        `;
      }
      modal.style.display = 'flex';
    }
  };

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
