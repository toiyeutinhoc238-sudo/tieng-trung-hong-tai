/**
 * Tiếng Trung HongTai - Chuyên Trang Luyện Đọc Tiếng Trung (Reading & Mastery)
 * Tích hợp: Danh sách chọn bài dạng Lưới (như Shadowing), Audio giọng chuẩn, Ruby Pinyin, Luyện viết & Trắc nghiệm
 */

class ReadingPracticeApp {
  constructor() {
    this.articles = [];
    this.filteredArticles = [];
    this.currentArticle = null;
    this.currentLevel = 'all';
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.currentView = 'catalog'; // 'catalog' (Dàn ra như Shadowing) | 'workspace' (Đọc & Học chi tiết)
    this.activeTab = 'read'; // 'read' | 'quiz' | 'write'
    this.showPinyin = false;
    this.fontSizeRem = 1.35;
    this.audioSpeed = 1.0;
    this.isPlaying = false;
    this.speechUtterance = null;
    this.activeSentenceIndex = -1;
    this.currentPlayingIndex = 0;
    
    // Typing state
    this.typingSentenceIndex = 0;
    this.typingSentences = [];
    this.hideTypingPinyin = false;

    // Quiz state
    this.quizAnswers = {};

    // Persistent state
    this.readArticles = new Set(JSON.parse(localStorage.getItem('reading_completed_articles') || '[]'));
    this.lastArticleId = localStorage.getItem('reading_last_article_id') || '';

    this.init();
  }

  async init() {
    this.bindDOMEvents();
    await this.loadArticlesData();
    this.applyURLParams();
    this.renderFilterPills();
    this.applyFilters();
  }

  async loadArticlesData() {
    try {
      const res = await fetch('/reading_practice_data.json');
      if (res.ok) {
        this.articles = await res.json();
        const b = document.getElementById('rd-catalog-badge-count');
        if (b) b.textContent = this.articles.length;
      }
    } catch (e) {
      console.error('Failed to load reading data:', e);
    }
  }

  applyURLParams() {
    const params = new URLSearchParams(window.location.search);
    const lvl = params.get('level');
    const cat = params.get('category');
    const id = params.get('id');
    const tab = params.get('tab');
    const view = params.get('view');

    if (lvl) this.currentLevel = lvl;
    if (cat) this.currentCategory = cat;
    if (tab && ['read', 'quiz', 'write'].includes(tab)) this.activeTab = tab;
    if (id) {
      this.lastArticleId = id;
      this.currentView = 'workspace';
    }
    if (view === 'workspace' || view === 'catalog') this.currentView = view;
  }

  bindDOMEvents() {
    // View Switcher buttons (Danh sách bài / Đang đọc)
    const btnCatalog = document.getElementById('btn-view-catalog');
    const btnReader = document.getElementById('btn-view-reader');
    if (btnCatalog) {
      btnCatalog.addEventListener('click', () => this.switchView('catalog'));
    }
    if (btnReader) {
      btnReader.addEventListener('click', () => {
        if (!this.currentArticle && this.filteredArticles.length > 0) {
          this.selectArticle(this.filteredArticles[0]);
        }
        this.switchView('workspace');
      });
    }

    // Back to catalog button
    const backCatBtn = document.getElementById('rd-back-to-catalog-btn');
    if (backCatBtn) {
      backCatBtn.addEventListener('click', () => this.switchView('catalog'));
    }

    // Level chips
    document.querySelectorAll('#rd-level-chips .rd-chip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('#rd-level-chips .rd-chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentLevel = btn.getAttribute('data-level') || 'all';
        this.applyFilters();
      });
    });

    // Category chips
    document.querySelectorAll('#rd-category-chips .rd-chip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('#rd-category-chips .rd-chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.getAttribute('data-category') || 'all';
        this.applyFilters();
      });
    });

    // Search Input
    const searchInput = document.getElementById('rd-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = (e.target.value || '').trim().toLowerCase();
        this.applyFilters();
      });
    }

    // Article select dropdown
    const selectEl = document.getElementById('rd-article-select');
    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        const id = e.target.value;
        const found = this.articles.find(a => a.id === id);
        if (found) this.selectArticle(found);
      });
    }

    // Prev / Next article buttons
    const prevBtn = document.getElementById('rd-prev-article-btn');
    const nextBtn = document.getElementById('rd-next-article-btn');
    if (prevBtn) prevBtn.addEventListener('click', () => this.navigateArticle(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => this.navigateArticle(1));

    // Continue study button
    const continueBtn = document.getElementById('rd-continue-study-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        if (this.lastArticleId) {
          const found = this.articles.find(a => a.id === this.lastArticleId);
          if (found) {
            this.selectArticle(found);
            this.switchView('workspace');
            this.showToast(`Đã mở bài: ${found.title_vi || found.title_zh}`);
            return;
          }
        }
        const unread = this.articles.find(a => !this.readArticles.has(a.id));
        if (unread) {
          this.selectArticle(unread);
          this.switchView('workspace');
          this.showToast(`Đọc bài tiếp theo: ${unread.title_vi || unread.title_zh}`);
        } else if (this.articles[0]) {
          this.selectArticle(this.articles[0]);
          this.switchView('workspace');
        }
      });
    }

    // Main Mode Tabs (Đọc - Trả lời câu hỏi - Luyện viết)
    document.querySelectorAll('.rd-mode-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Audio Play / Pause
    const playBtn = document.getElementById('rd-audio-play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => this.toggleAudio());
    }

    // Audio Speed
    const speedBtn = document.getElementById('rd-audio-speed-btn');
    if (speedBtn) {
      speedBtn.addEventListener('click', () => {
        const speeds = [0.75, 1.0, 1.25];
        const curIdx = speeds.indexOf(this.audioSpeed);
        this.audioSpeed = speeds[(curIdx + 1) % speeds.length];
        speedBtn.textContent = `${this.audioSpeed}x`;
        if (this.isPlaying) {
          this.stopAudio();
          this.playAudio();
        }
        this.showToast(`Tốc độ phát: ${this.audioSpeed}x`);
      });
    }

    // Audio timeline click to seek
    const timelineEl = document.getElementById('rd-audio-timeline');
    if (timelineEl) {
      timelineEl.addEventListener('click', (e) => {
        const rect = timelineEl.getBoundingClientRect();
        const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const sentences = this.currentArticle?.sentences || [];
        if (sentences.length > 0) {
          const targetIdx = Math.min(sentences.length - 1, Math.floor(clickRatio * sentences.length));
          this.speakSentence(sentences[targetIdx].text_zh, targetIdx);
        }
      });
    }

    // Toggle Pinyin
    const pinyinBtn = document.getElementById('rd-toggle-pinyin-btn');
    if (pinyinBtn) {
      pinyinBtn.addEventListener('click', () => {
        this.showPinyin = !this.showPinyin;
        pinyinBtn.classList.toggle('active', this.showPinyin);
        const label = document.getElementById('rd-py-btn-text');
        if (label) label.textContent = this.showPinyin ? 'Ẩn Pinyin' : 'Hiện Pinyin';
        this.renderReadingContent();
        this.showToast(this.showPinyin ? 'Đã bật hiển thị Pinyin' : 'Đã ẩn Pinyin');
      });
    }

    // Mark as done button
    const markDoneBtn = document.getElementById('rd-mark-done-btn');
    if (markDoneBtn) {
      markDoneBtn.addEventListener('click', () => {
        if (!this.currentArticle) return;
        if (this.readArticles.has(this.currentArticle.id)) {
          this.readArticles.delete(this.currentArticle.id);
          this.showToast('Đã bỏ đánh dấu hoàn thành');
        } else {
          this.readArticles.add(this.currentArticle.id);
          this.showToast('🎉 Đã hoàn thành bài đọc này!');
        }
        localStorage.setItem('reading_completed_articles', JSON.stringify([...this.readArticles]));
        this.updateHeaderStats();
        this.updateMarkDoneButton();
        this.renderArticleDropdown();
        this.renderCatalogGrid();
      });
    }

    // Font size inc / dec
    const fontIncBtn = document.getElementById('rd-font-inc-btn');
    const fontDecBtn = document.getElementById('rd-font-dec-btn');
    if (fontIncBtn) {
      fontIncBtn.addEventListener('click', () => {
        this.fontSizeRem = Math.min(2.4, this.fontSizeRem + 0.15);
        const bodyEl = document.getElementById('rd-chinese-body');
        if (bodyEl) bodyEl.style.fontSize = `${this.fontSizeRem}rem`;
      });
    }
    if (fontDecBtn) {
      fontDecBtn.addEventListener('click', () => {
        this.fontSizeRem = Math.max(1.0, this.fontSizeRem - 0.15);
        const bodyEl = document.getElementById('rd-chinese-body');
        if (bodyEl) bodyEl.style.fontSize = `${this.fontSizeRem}rem`;
      });
    }

    // Translation Accordion toggle
    const transHeader = document.getElementById('rd-translation-header');
    if (transHeader) {
      transHeader.addEventListener('click', () => {
        const box = document.getElementById('rd-translation-accordion');
        if (box) box.classList.toggle('open');
      });
    }

    // Sidebar Accordions toggle
    ['vocab', 'idiom', 'phrase'].forEach(key => {
      const header = document.getElementById(`rd-side-${key}-header`);
      if (header) {
        header.addEventListener('click', () => {
          const card = document.getElementById(`rd-side-${key}-card`);
          if (card) card.classList.toggle('open');
        });
      }
    });

    // Typing Mode: Hide Pinyin Checkbox
    const hidePyChk = document.getElementById('rd-hide-pinyin-chk');
    if (hidePyChk) {
      hidePyChk.addEventListener('change', (e) => {
        this.hideTypingPinyin = e.target.checked;
        const pinyinLine = document.getElementById('rd-cur-ghost-pinyin-text');
        if (pinyinLine) pinyinLine.style.opacity = this.hideTypingPinyin ? '0' : '1';
      });
    }

    // Typing Input Box
    const typingInput = document.getElementById('rd-typing-input-box');
    if (typingInput) {
      typingInput.addEventListener('input', (e) => this.handleTypingInput(e));
      typingInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.advanceTypingSentence();
        }
      });
    }
  }

  switchView(viewName) {
    this.currentView = viewName;
    const catSec = document.getElementById('rd-catalog-view-section');
    const workSec = document.getElementById('rd-workspace-view-section');
    const btnCat = document.getElementById('btn-view-catalog');
    const btnRead = document.getElementById('btn-view-reader');

    if (btnCat) btnCat.classList.toggle('active', viewName === 'catalog');
    if (btnRead) btnRead.classList.toggle('active', viewName === 'workspace');

    if (catSec) catSec.style.display = (viewName === 'catalog') ? 'flex' : 'none';
    if (workSec) workSec.style.display = (viewName === 'workspace') ? 'flex' : 'none';

    if (viewName === 'workspace') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  renderFilterPills() {
    document.querySelectorAll('#rd-level-chips .rd-chip-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-level') === this.currentLevel);
    });
    document.querySelectorAll('#rd-category-chips .rd-chip-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-category') === this.currentCategory);
    });
  }

  applyFilters() {
    this.filteredArticles = this.articles.filter(a => {
      if (this.currentLevel !== 'all' && a.level !== this.currentLevel) return false;
      if (this.currentCategory !== 'all' && a.category !== this.currentCategory) return false;
      if (this.searchQuery) {
        const query = this.searchQuery;
        const matchTitle = (a.title_zh && a.title_zh.toLowerCase().includes(query)) || (a.title_vi && a.title_vi.toLowerCase().includes(query));
        const matchContent = a.content_zh && a.content_zh.toLowerCase().includes(query);
        const matchVocab = Array.isArray(a.vocabulary) && a.vocabulary.some(v => v.word.includes(query) || (v.meaning && v.meaning.toLowerCase().includes(query)));
        if (!matchTitle && !matchContent && !matchVocab) return false;
      }
      return true;
    });

    const matchCountEl = document.getElementById('rd-matching-count-val');
    if (matchCountEl) matchCountEl.textContent = this.filteredArticles.length;

    this.renderCatalogGrid();
    this.renderArticleDropdown();

    if (this.filteredArticles.length > 0) {
      const stillThere = this.filteredArticles.find(a => this.currentArticle && a.id === this.currentArticle.id);
      if (stillThere) {
        this.selectArticle(stillThere, false);
      } else {
        const matchingLast = this.filteredArticles.find(a => a.id === this.lastArticleId);
        this.selectArticle(matchingLast || this.filteredArticles[0], false);
      }
    } else {
      this.currentArticle = null;
      this.renderEmptyState();
    }

    this.updateHeaderStats();
  }

  // -------------------------------------------------------------
  // VIEW MODE A: RENDER ARTICLE CATALOG GRID (DÀN RA NHƯ SHADOWING)
  // -------------------------------------------------------------

  renderCatalogGrid() {
    const grid = document.getElementById('rd-catalog-cards-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (this.filteredArticles.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--rd-text-muted);">
          <i class="fa-solid fa-book-open" style="font-size: 2.5rem; margin-bottom: 12px; color: var(--rd-accent);"></i>
          <div style="font-size: 1.1rem; font-weight: 800;">Không tìm thấy bài đọc nào phù hợp với bộ lọc</div>
          <p style="font-size: 0.85rem; margin-top: 6px;">Hãy thử chọn cấp độ khác hoặc từ khóa tìm kiếm khác</p>
        </div>
      `;
      return;
    }

    const isDark = document.documentElement.classList.contains('dark');
    const catColors = isDark ? {
      daily: 'linear-gradient(135deg, #1e293b 0%, #334155 40%, #b45309 100%)',
      textbook: 'linear-gradient(135deg, #1e293b 0%, #334155 40%, #0369a1 100%)',
      hskk: 'linear-gradient(135deg, #1e293b 0%, #334155 40%, #be185d 100%)',
      idiom: 'linear-gradient(135deg, #1e293b 0%, #334155 40%, #6b21a8 100%)',
      fairy_tale: 'linear-gradient(135deg, #1e293b 0%, #334155 40%, #047857 100%)',
      news: 'linear-gradient(135deg, #1e293b 0%, #334155 40%, #b91c1c 100%)'
    } : {
      daily: 'linear-gradient(135deg, #f59e0b 0%, #d97706 40%, #b45309 100%)',
      textbook: 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #1d4ed8 100%)',
      hskk: 'linear-gradient(135deg, #ec4899 0%, #db2777 40%, #be185d 100%)',
      idiom: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 40%, #6d28d9 100%)',
      fairy_tale: 'linear-gradient(135deg, #10b981 0%, #059669 40%, #047857 100%)',
      news: 'linear-gradient(135deg, #ef4444 0%, #dc2626 40%, #b91c1c 100%)'
    };

    const catIcons = {
      daily: 'fa-sun',
      textbook: 'fa-book-bookmark',
      hskk: 'fa-microphone-lines',
      idiom: 'fa-feather',
      fairy_tale: 'fa-wand-magic-sparkles',
      news: 'fa-newspaper'
    };

    this.filteredArticles.forEach((article) => {
      const isDone = this.readArticles.has(article.id);
      const card = document.createElement('div');
      card.className = 'rd-card-article';
      card.dataset.id = article.id;

      const bannerBg = catColors[article.category] || (isDark ? 'linear-gradient(135deg, #1e293b, #334155)' : 'linear-gradient(135deg, #0284c7, #0369a1)');
      const catIcon = catIcons[article.category] || 'fa-book-open';
      const vocabCount = Array.isArray(article.vocabulary) ? article.vocabulary.length : 0;
      const idiomCount = Array.isArray(article.idioms) ? article.idioms.length : 0;
      const previewText = article.content_zh.slice(0, 80) + (article.content_zh.length > 80 ? '...' : '');

      card.innerHTML = `
        <div class="rd-card-banner" style="background: ${bannerBg};">
          <div class="rd-card-banner-overlay"></div>
          <div class="rd-card-banner-top">
            <span class="rd-badge-lvl">${article.level}</span>
            ${isDone ? '<span class="rd-badge-done"><i class="fa-solid fa-circle-check"></i> Đã đọc</span>' : ''}
          </div>
          <div class="rd-card-category-tag">
            <i class="fa-solid ${catIcon}"></i> ${article.category_name || 'Bài đọc'}
          </div>
        </div>

        <div class="rd-card-body">
          <div class="rd-card-title-zh">${article.title_zh}</div>
          <div class="rd-card-title-vi">${article.title_vi || ''}</div>
          <div class="rd-card-preview">${previewText}</div>
        </div>

        <div class="rd-card-footer">
          <div class="rd-card-meta">
            <span><i class="fa-solid fa-book-bookmark" style="color: var(--rd-accent);"></i> ${vocabCount} từ</span>
            ${idiomCount > 0 ? `<span><i class="fa-solid fa-feather" style="color: var(--rd-accent-gold);"></i> ${idiomCount} thành ngữ</span>` : ''}
          </div>
          <button type="button" class="rd-card-btn-action" title="Đọc bài này">
            Đọc ngay <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectArticle(article);
        this.switchView('workspace');
      });

      grid.appendChild(card);
    });
  }

  renderArticleDropdown() {
    const selectEl = document.getElementById('rd-article-select');
    if (!selectEl) return;
    selectEl.innerHTML = '';

    if (this.filteredArticles.length === 0) {
      selectEl.innerHTML = '<option value="">Không có bài đọc</option>';
      return;
    }

    this.filteredArticles.forEach((a) => {
      const opt = document.createElement('option');
      opt.value = a.id;
      const isDone = this.readArticles.has(a.id) ? '✅ ' : '';
      opt.textContent = `${isDone}[${a.level}] ${a.title_zh}`;
      selectEl.appendChild(opt);
    });

    if (this.currentArticle) {
      selectEl.value = this.currentArticle.id;
    }
  }

  selectArticle(article, shouldUpdateUI = true) {
    if (!article) return;
    this.currentArticle = article;
    this.lastArticleId = article.id;
    localStorage.setItem('reading_last_article_id', article.id);

    const selectEl = document.getElementById('rd-article-select');
    if (selectEl && selectEl.value !== article.id) {
      selectEl.value = article.id;
    }

    this.stopAudio();
    this.quizAnswers = {};
    this.renderArtBanner();
    this.renderReadingContent();
    this.renderTranslation();
    this.renderSidebarData();
    this.renderQuizMode();
    this.renderTypingMode();
    this.updateMarkDoneButton();
    this.updateNavButtons();
  }

  navigateArticle(direction) {
    if (this.filteredArticles.length === 0 || !this.currentArticle) return;
    const curIdx = this.filteredArticles.findIndex(a => a.id === this.currentArticle.id);
    if (curIdx === -1) return;
    const nextIdx = curIdx + direction;
    if (nextIdx >= 0 && nextIdx < this.filteredArticles.length) {
      this.selectArticle(this.filteredArticles[nextIdx]);
    }
  }

  updateNavButtons() {
    const curIdx = this.filteredArticles.findIndex(a => this.currentArticle && a.id === this.currentArticle.id);
    const prevBtn = document.getElementById('rd-prev-article-btn');
    const nextBtn = document.getElementById('rd-next-article-btn');
    if (prevBtn) prevBtn.disabled = (curIdx <= 0);
    if (nextBtn) nextBtn.disabled = (curIdx >= this.filteredArticles.length - 1 || curIdx === -1);
  }

  updateHeaderStats() {
    const readVal = document.getElementById('rd-read-count-val');
    const totalVal = document.getElementById('rd-total-count-val');
    if (readVal) readVal.textContent = this.readArticles.size;
    if (totalVal) totalVal.textContent = this.articles.length;
  }

  updateMarkDoneButton() {
    const btn = document.getElementById('rd-mark-done-btn');
    const txt = document.getElementById('rd-done-btn-text');
    if (!btn || !txt || !this.currentArticle) return;

    const isDone = this.readArticles.has(this.currentArticle.id);
    btn.classList.toggle('active', isDone);
    btn.innerHTML = isDone
      ? '<i class="fa-solid fa-circle-check" style="color:#10b981;"></i> <span id="rd-done-btn-text">Đã đọc xong</span>'
      : '<i class="fa-regular fa-circle-check"></i> <span id="rd-done-btn-text">Đánh dấu đã đọc</span>';
  }

  switchTab(tabKey) {
    this.activeTab = tabKey;
    document.querySelectorAll('.rd-mode-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabKey);
    });

    ['read', 'quiz', 'write'].forEach(k => {
      const pane = document.getElementById(`view-mode-${k}`);
      if (pane) pane.style.display = (k === tabKey) ? 'block' : 'none';
    });

    if (tabKey === 'write') {
      const box = document.getElementById('rd-typing-input-box');
      if (box) setTimeout(() => box.focus(), 150);
    }
  }

  // -------------------------------------------------------------
  // RENDERING FUNCTIONS
  // -------------------------------------------------------------

  renderArtBanner() {
    const a = this.currentArticle;
    if (!a) return;

    const tagEl = document.getElementById('rd-art-tag');
    const titleZhEl = document.getElementById('rd-art-title-zh');
    const titleViEl = document.getElementById('rd-art-title-vi');
    const bannerEl = document.getElementById('rd-art-banner');

    const catIcons = {
      daily: 'fa-sun',
      textbook: 'fa-book-bookmark',
      hskk: 'fa-microphone-lines',
      idiom: 'fa-feather',
      fairy_tale: 'fa-wand-magic-sparkles',
      news: 'fa-newspaper'
    };

    const isDark = document.documentElement.classList.contains('dark');

    const catColors = isDark ? {
      daily: 'linear-gradient(135deg, #1e293b 0%, #334155 40%, #b45309 100%)',
      textbook: 'linear-gradient(135deg, #1e293b 0%, #334155 40%, #0369a1 100%)',
      hskk: 'linear-gradient(135deg, #1e293b 0%, #334155 40%, #be185d 100%)',
      idiom: 'linear-gradient(135deg, #1e293b 0%, #334155 40%, #6b21a8 100%)',
      fairy_tale: 'linear-gradient(135deg, #1e293b 0%, #334155 40%, #047857 100%)',
      news: 'linear-gradient(135deg, #1e293b 0%, #334155 40%, #b91c1c 100%)'
    } : {
      daily: 'linear-gradient(135deg, #f59e0b 0%, #d97706 40%, #b45309 100%)',
      textbook: 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #1d4ed8 100%)',
      hskk: 'linear-gradient(135deg, #ec4899 0%, #db2777 40%, #be185d 100%)',
      idiom: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 40%, #6d28d9 100%)',
      fairy_tale: 'linear-gradient(135deg, #10b981 0%, #059669 40%, #047857 100%)',
      news: 'linear-gradient(135deg, #ef4444 0%, #dc2626 40%, #b91c1c 100%)'
    };

    if (tagEl) {
      tagEl.innerHTML = `<i class="fa-solid ${catIcons[a.category] || 'fa-book-open'}"></i> ${a.level} • ${a.category_name || 'BÀI ĐỌC'}`;
    }
    if (titleZhEl) titleZhEl.textContent = a.title_zh;
    if (titleViEl) titleViEl.textContent = a.title_vi || a.title_zh;
    if (bannerEl) {
      bannerEl.style.background = catColors[a.category] || (isDark ? 'linear-gradient(135deg, #1e293b, #334155)' : 'linear-gradient(135deg, #0284c7, #0369a1)');
    }
  }

  renderReadingContent() {
    const a = this.currentArticle;
    const bodyEl = document.getElementById('rd-chinese-body');
    if (!bodyEl || !a) return;

    bodyEl.innerHTML = '';
    const sentences = Array.isArray(a.sentences) && a.sentences.length > 0
      ? a.sentences
      : a.content_zh.split(/(?<=[。！？\n])/g).map((s, idx) => ({ index: idx, text_zh: s.trim(), pinyin: '', tokens: [] })).filter(s => s.text_zh);

    sentences.forEach((sObj, sIdx) => {
      const sSpan = document.createElement('span');
      sSpan.className = 'rd-chinese-sentence';
      sSpan.dataset.sidx = sIdx;
      sSpan.title = 'Nhấn để nghe câu này';

      if (this.showPinyin && Array.isArray(sObj.tokens) && sObj.tokens.length > 0) {
        const rubyHTML = sObj.tokens.map(t => {
          if (t.pinyin && t.pinyin.trim()) {
            return `<ruby style="margin-right:2px;">${t.word}<rt style="font-size:0.75rem;color:var(--rd-accent);user-select:none;">${t.pinyin}</rt></ruby>`;
          }
          return t.word;
        }).join('');
        sSpan.innerHTML = rubyHTML + ' ';
      } else {
        sSpan.textContent = sObj.text_zh + ' ';
      }

      sSpan.addEventListener('click', () => {
        this.speakSentence(sObj.text_zh, sIdx);
      });

      bodyEl.appendChild(sSpan);
    });
  }

  renderTranslation() {
    const a = this.currentArticle;
    const bodyEl = document.getElementById('rd-translation-body');
    if (bodyEl && a) {
      bodyEl.textContent = a.content_vi || 'Đang cập nhật bản dịch tiếng Việt...';
    }
  }

  renderSidebarData() {
    const a = this.currentArticle;
    if (!a) return;

    // 1. Vocab
    const vBadge = document.getElementById('rd-vocab-count-badge');
    const vBody = document.getElementById('rd-vocab-list-body');
    const vocabList = Array.isArray(a.vocabulary) ? a.vocabulary : [];
    if (vBadge) vBadge.textContent = vocabList.length;
    if (vBody) {
      vBody.innerHTML = '';
      if (vocabList.length === 0) {
        vBody.innerHTML = '<div style="padding:10px;color:var(--rd-text-muted);font-size:0.82rem;text-align:center;">Không có từ vựng riêng trong bài này.</div>';
      } else {
        vocabList.forEach(v => {
          const item = document.createElement('div');
          item.className = 'rd-item-card';
          item.innerHTML = `
            <div class="rd-item-top">
              <div>
                <span class="rd-item-zh">${v.word}</span>
                <span class="rd-item-py">[${v.pinyin}]</span>
              </div>
              <button type="button" class="rd-item-speak-btn" title="Nghe phát âm">
                <i class="fa-solid fa-volume-high"></i>
              </button>
            </div>
            <div class="rd-item-meaning">${v.meaning}</div>
          `;
          const sBtn = item.querySelector('.rd-item-speak-btn');
          if (sBtn) sBtn.onclick = (e) => { e.stopPropagation(); this.speakText(v.word); };
          item.onclick = () => this.speakText(v.word);
          vBody.appendChild(item);
        });
      }
    }

    // 2. Idioms
    const iBadge = document.getElementById('rd-idiom-count-badge');
    const iBody = document.getElementById('rd-idiom-list-body');
    const idiomList = Array.isArray(a.idioms) ? a.idioms : [];
    if (iBadge) iBadge.textContent = idiomList.length;
    if (iBody) {
      iBody.innerHTML = '';
      if (idiomList.length === 0) {
        iBody.innerHTML = '<div style="padding:10px;color:var(--rd-text-muted);font-size:0.82rem;text-align:center;">Bài đọc này không có thành ngữ 4 chữ.</div>';
      } else {
        idiomList.forEach(i => {
          const item = document.createElement('div');
          item.className = 'rd-item-card';
          item.innerHTML = `
            <div class="rd-item-top">
              <div>
                <span class="rd-item-zh" style="color:var(--rd-accent-gold);">${i.word}</span>
                <span class="rd-item-py" style="color:var(--rd-accent-gold);">[${i.pinyin}]</span>
              </div>
              <button type="button" class="rd-item-speak-btn" title="Nghe phát âm">
                <i class="fa-solid fa-volume-high"></i>
              </button>
            </div>
            <div class="rd-item-meaning">${i.meaning}</div>
          `;
          const sBtn = item.querySelector('.rd-item-speak-btn');
          if (sBtn) sBtn.onclick = (e) => { e.stopPropagation(); this.speakText(i.word); };
          item.onclick = () => this.speakText(i.word);
          iBody.appendChild(item);
        });
      }
    }

    // 3. Fixed Phrases / Quán dụng ngữ
    const pBadge = document.getElementById('rd-phrase-count-badge');
    const pBody = document.getElementById('rd-phrase-list-body');
    const phraseList = Array.isArray(a.fixed_phrases) ? a.fixed_phrases : [];
    if (pBadge) pBadge.textContent = phraseList.length;
    if (pBody) {
      pBody.innerHTML = '';
      if (phraseList.length === 0) {
        pBody.innerHTML = '<div style="padding:10px;color:var(--rd-text-muted);font-size:0.82rem;text-align:center;">Không có quán dụng ngữ trong bài này.</div>';
      } else {
        phraseList.forEach(p => {
          const item = document.createElement('div');
          item.className = 'rd-item-card';
          item.innerHTML = `
            <div class="rd-item-top">
              <div>
                <span class="rd-item-zh" style="color:var(--rd-accent-green);">${p.word}</span>
                <span class="rd-item-py" style="color:var(--rd-accent-green);">[${p.pinyin || ''}]</span>
              </div>
              <button type="button" class="rd-item-speak-btn" title="Nghe phát âm">
                <i class="fa-solid fa-volume-high"></i>
              </button>
            </div>
            <div class="rd-item-meaning">${p.meaning}</div>
          `;
          const sBtn = item.querySelector('.rd-item-speak-btn');
          if (sBtn) sBtn.onclick = (e) => { e.stopPropagation(); this.speakText(p.word); };
          item.onclick = () => this.speakText(p.word);
          pBody.appendChild(item);
        });
      }
    }
  }

  // -------------------------------------------------------------
  // TAB 2: COMPREHENSION QUIZ MODE
  // -------------------------------------------------------------

  renderQuizMode() {
    const a = this.currentArticle;
    const wrap = document.getElementById('rd-quiz-workspace');
    if (!wrap || !a) return;

    wrap.innerHTML = '';
    const questions = Array.isArray(a.questions) ? a.questions : [];

    if (questions.length === 0) {
      wrap.innerHTML = '<div style="text-align:center;padding:30px;color:var(--rd-text-muted);">Đang chuẩn bị câu hỏi trắc nghiệm cho bài học này...</div>';
      return;
    }

    questions.forEach((q, qIdx) => {
      const card = document.createElement('div');
      card.className = 'rd-quiz-card';

      const optHTML = q.options.map((opt, oIdx) => `
        <button type="button" class="rd-quiz-opt-btn" data-qidx="${qIdx}" data-oidx="${oIdx}">
          <span><strong>${String.fromCharCode(65 + oIdx)}.</strong> ${opt.text_zh} ${opt.text_vi ? `<span style="font-size:0.82rem;color:var(--rd-text-muted);margin-left:6px;">(${opt.text_vi})</span>` : ''}</span>
          <i class="fa-regular fa-circle"></i>
        </button>
      `).join('');

      card.innerHTML = `
        <div class="rd-quiz-q-title">
          <span>Câu ${qIdx + 1}:</span>
          <div>
            <div>${q.question_zh}</div>
            <div class="rd-quiz-q-sub">${q.question_vi}</div>
          </div>
        </div>
        <div class="rd-quiz-options-list">${optHTML}</div>
        <div class="rd-quiz-explain-box" id="rd-explain-${qIdx}">
          💡 <strong>Giải thích:</strong> ${q.explanation_vi}
        </div>
      `;

      card.querySelectorAll('.rd-quiz-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const oIdx = parseInt(btn.getAttribute('data-oidx'), 10);
          const isCorrect = (oIdx === q.answer_index);
          this.quizAnswers[qIdx] = oIdx;

          card.querySelectorAll('.rd-quiz-opt-btn').forEach(b => {
            b.disabled = true;
            const idx = parseInt(b.getAttribute('data-oidx'), 10);
            if (idx === q.answer_index) {
              b.classList.add('correct');
              b.querySelector('i').className = 'fa-solid fa-circle-check';
            }
          });

          if (!isCorrect) {
            btn.classList.add('wrong');
            btn.querySelector('i').className = 'fa-solid fa-circle-xmark';
          }

          const expBox = card.querySelector(`#rd-explain-${qIdx}`);
          if (expBox) expBox.style.display = 'block';

          if (isCorrect) {
            this.showToast('🎉 Chính xác!');
          } else {
            this.showToast('Chưa chính xác, hãy xem lại giải thích nhé!', true);
          }

          this.checkQuizCompletion(questions);
        });
      });

      wrap.appendChild(card);
    });
  }

  checkQuizCompletion(questions) {
    if (Object.keys(this.quizAnswers).length === questions.length) {
      let correctCount = 0;
      questions.forEach((q, idx) => {
        if (this.quizAnswers[idx] === q.answer_index) correctCount++;
      });

      const wrap = document.getElementById('rd-quiz-workspace');
      if (!wrap) return;

      const scoreBanner = document.createElement('div');
      scoreBanner.className = 'rd-quiz-card';
      scoreBanner.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.35))';
      scoreBanner.style.borderColor = '#10b981';
      scoreBanner.style.textAlign = 'center';
      scoreBanner.style.padding = '24px';
      scoreBanner.innerHTML = `
        <h3 style="font-size:1.3rem;font-weight:900;color:#059669;margin-bottom:8px;">
          🏆 Kết quả: Đúng ${correctCount} / ${questions.length} câu (${Math.round((correctCount / questions.length) * 100)}%)
        </h3>
        <p style="font-size:0.92rem;color:var(--rd-text-main);margin-bottom:14px;">
          ${correctCount === questions.length ? 'Xuất sắc! Bạn đã hiểu toàn bộ nội dung bài đọc.' : 'Rất tốt! Bạn có thể xem lại các phần giải thích ở trên.'}
        </p>
        <button type="button" class="rd-continue-btn" id="rd-reset-quiz-btn" style="margin: 0 auto;">
          <i class="fa-solid fa-rotate-right"></i> Làm lại bài trắc nghiệm
        </button>
      `;

      wrap.appendChild(scoreBanner);

      const resetBtn = scoreBanner.querySelector('#rd-reset-quiz-btn');
      if (resetBtn) {
        resetBtn.onclick = () => {
          this.quizAnswers = {};
          this.renderQuizMode();
        };
      }

      if (correctCount >= Math.ceil(questions.length * 0.6)) {
        this.readArticles.add(this.currentArticle.id);
        localStorage.setItem('reading_completed_articles', JSON.stringify([...this.readArticles]));
        this.updateHeaderStats();
        this.updateMarkDoneButton();
        this.renderCatalogGrid();
      }
    }
  }

  // -------------------------------------------------------------
  // TAB 3: DICTATION & TYPING PRACTICE MODE (Ảnh 2)
  // -------------------------------------------------------------

  renderTypingMode() {
    const a = this.currentArticle;
    const container = document.getElementById('rd-ghost-text-container');
    const input = document.getElementById('rd-typing-input-box');
    if (!container || !a) return;

    this.typingSentenceIndex = 0;
    this.typingSentences = Array.isArray(a.sentences) && a.sentences.length > 0
      ? a.sentences
      : a.content_zh.split(/(?<=[。！？\n])/g).map((s, idx) => ({ index: idx, text_zh: s.trim(), pinyin: '' })).filter(s => s.text_zh);
    
    if (input) input.value = '';

    this.renderGhostSentences();
    this.updateTypingProgress();
  }

  renderGhostSentences() {
    const container = document.getElementById('rd-ghost-text-container');
    if (!container || !this.typingSentences) return;
    container.innerHTML = '';

    const currentObj = this.typingSentences[this.typingSentenceIndex] || { text_zh: '', pinyin: '' };
    const currentSentence = currentObj.text_zh || '';
    const currentPinyin = currentObj.pinyin || '';

    const block = document.createElement('div');
    block.className = 'rd-ghost-sentence-block';

    const chars = Array.from(currentSentence);
    const hanziSpanHTML = chars.map((ch, cIdx) => {
      const isTarget = (cIdx === 0);
      return `<span class="rd-char-span${isTarget ? ' current-target' : ''}" data-cidx="${cIdx}">${ch}</span>`;
    }).join('');

    block.innerHTML = `
      <div class="rd-ghost-pinyin-line" id="rd-cur-ghost-pinyin">
        <span style="color:var(--rd-text-muted);font-size:0.85rem;margin-right:8px;">[Câu ${this.typingSentenceIndex + 1}/${this.typingSentences.length}]:</span>
        <span id="rd-cur-ghost-pinyin-text" style="opacity:${this.hideTypingPinyin ? '0' : '1'};transition:opacity 0.2s;">
          ${currentPinyin || 'Pinyin'}
        </span>
      </div>
      <div class="rd-ghost-hanzi-line" id="rd-cur-ghost-hanzi">
        ${hanziSpanHTML}
      </div>
    `;

    container.appendChild(block);
  }

  handleTypingInput(e) {
    const val = (e.target.value || '').trim();
    if (!this.typingSentences) return;

    const curObj = this.typingSentences[this.typingSentenceIndex] || { text_zh: '', pinyin: '' };
    const curSentence = curObj.text_zh || '';
    const cleanCur = curSentence.replace(/[.,!?:;="\'"()[\]{}，。！？；：\s\-_~`]/g, '');
    const cleanVal = val.replace(/[.,!?:;="\'"()[\]{}，。！？；：\s\-_~`]/g, '');

    const charSpans = document.querySelectorAll('#rd-cur-ghost-hanzi .rd-char-span');

    charSpans.forEach((span, idx) => {
      if (idx < cleanVal.length && cleanVal[idx] === cleanCur[idx]) {
        span.className = 'rd-char-span typed-correct';
      } else if (idx === cleanVal.length) {
        span.className = 'rd-char-span current-target';
      } else {
        span.className = 'rd-char-span';
      }
    });

    if (cleanVal.length > 0 && cleanCur.startsWith(cleanVal)) {
      if (cleanVal.length === cleanCur.length) {
        this.showToast('🎉 Hoàn thành câu!');
        this.speakText(curSentence);
        setTimeout(() => this.advanceTypingSentence(), 400);
      }
    } else if (cleanVal.length > 0 && !cleanCur.startsWith(cleanVal)) {
      e.target.classList.add('wrong-shake');
      setTimeout(() => e.target.classList.remove('wrong-shake'), 300);
    }

    this.updateTypingProgress();
  }

  advanceTypingSentence() {
    if (this.typingSentenceIndex < this.typingSentences.length - 1) {
      this.typingSentenceIndex++;
      const input = document.getElementById('rd-typing-input-box');
      if (input) input.value = '';
      this.renderGhostSentences();
      this.updateTypingProgress();
      this.showToast(`Chuyển sang câu ${this.typingSentenceIndex + 1}/${this.typingSentences.length}`);
    } else {
      this.showToast('🏆 Xuất sắc! Bạn đã gõ xong toàn bộ bài đọc!');
      this.readArticles.add(this.currentArticle.id);
      localStorage.setItem('reading_completed_articles', JSON.stringify([...this.readArticles]));
      this.updateHeaderStats();
      this.updateMarkDoneButton();
      this.renderCatalogGrid();
    }
  }

  updateTypingProgress() {
    const textEl = document.getElementById('rd-typing-progress-text');
    if (!textEl || !this.typingSentences || this.typingSentences.length === 0) return;
    const pct = Math.round(((this.typingSentenceIndex) / this.typingSentences.length) * 100);
    textEl.textContent = `Tiến độ: ${pct}% (Câu ${this.typingSentenceIndex + 1}/${this.typingSentences.length})`;
  }

  // -------------------------------------------------------------
  // AUDIO & SPEECH SYNTHESIS
  // -------------------------------------------------------------

  toggleAudio() {
    if (this.isPlaying) {
      this.stopAudio();
    } else {
      this.playAudio();
    }
  }

  playAudio() {
    if (!this.currentArticle || !('speechSynthesis' in window)) {
      this.showToast('Trình duyệt không hỗ trợ phát âm thanh Web Speech', true);
      return;
    }

    window.speechSynthesis.cancel();
    const text = this.currentArticle.content_zh;
    this.speechUtterance = new SpeechSynthesisUtterance(text);
    this.speechUtterance.lang = 'zh-CN';
    this.speechUtterance.rate = this.audioSpeed;

    this.speechUtterance.onstart = () => {
      this.isPlaying = true;
      this.updatePlayButton();
      this.startTimelineSim();
    };

    this.speechUtterance.onend = () => {
      this.stopAudio();
      this.showToast('Đã đọc xong bài');
    };

    this.speechUtterance.onerror = () => {
      this.stopAudio();
    };

    window.speechSynthesis.speak(this.speechUtterance);
  }

  stopAudio() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isPlaying = false;
    this.updatePlayButton();
    this.resetTimeline();
    document.querySelectorAll('.rd-chinese-sentence').forEach(s => s.classList.remove('active-speaking'));
  }

  updatePlayButton() {
    const btn = document.getElementById('rd-audio-play-btn');
    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-${this.isPlaying ? 'pause' : 'play'}"></i>`;
      btn.title = this.isPlaying ? 'Tạm dừng' : 'Phát âm thanh bài đọc';
    }
  }

  startTimelineSim() {
    const fill = document.getElementById('rd-audio-timeline-fill');
    const curTime = document.getElementById('rd-audio-current-time');
    const totTime = document.getElementById('rd-audio-total-time');
    if (!fill) return;

    const estDuration = Math.max(15, Math.round((this.currentArticle.content_zh.length * 0.28) / this.audioSpeed));
    if (totTime) totTime.textContent = this.formatTime(estDuration);

    let start = Date.now();
    if (this._timeTimer) clearInterval(this._timeTimer);

    this._timeTimer = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(this._timeTimer);
        return;
      }
      const elapsed = (Date.now() - start) / 1000;
      const pct = Math.min(100, (elapsed / estDuration) * 100);
      fill.style.width = `${pct}%`;
      if (curTime) curTime.textContent = this.formatTime(elapsed);

      if (elapsed >= estDuration) {
        clearInterval(this._timeTimer);
      }
    }, 200);
  }

  resetTimeline() {
    if (this._timeTimer) clearInterval(this._timeTimer);
    const fill = document.getElementById('rd-audio-timeline-fill');
    const curTime = document.getElementById('rd-audio-current-time');
    if (fill) fill.style.width = '0%';
    if (curTime) curTime.textContent = '0:00';
  }

  formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  speakSentence(sentence, sIdx) {
    if (!sentence || !('speechSynthesis' in window)) return;
    this.stopAudio();

    document.querySelectorAll('.rd-chinese-sentence').forEach(s => s.classList.remove('active-speaking'));
    const targetSpan = document.querySelector(`.rd-chinese-sentence[data-sidx="${sIdx}"]`);
    if (targetSpan) targetSpan.classList.add('active-speaking');

    const u = new SpeechSynthesisUtterance(sentence);
    u.lang = 'zh-CN';
    u.rate = this.audioSpeed;
    u.onend = () => {
      if (targetSpan) targetSpan.classList.remove('active-speaking');
    };
    window.speechSynthesis.speak(u);
  }

  speakText(text) {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }

  showToast(msg, isError = false) {
    const toast = document.getElementById('rd-toast');
    const msgEl = document.getElementById('rd-toast-msg');
    if (!toast || !msgEl) return;

    msgEl.textContent = msg;
    toast.style.borderColor = isError ? '#ef4444' : 'var(--rd-accent)';
    const icon = toast.querySelector('i');
    if (icon) icon.className = isError ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check';
    if (icon) icon.style.color = isError ? '#ef4444' : '#10b981';

    toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  renderEmptyState() {
    const bodyEl = document.getElementById('rd-chinese-body');
    if (bodyEl) bodyEl.innerHTML = '<div style="padding:40px;text-align:center;color:var(--rd-text-muted);">Không tìm thấy bài đọc nào phù hợp với bộ lọc hiện tại.</div>';
  }
}

// Auto init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.readingApp = new ReadingPracticeApp();
});
