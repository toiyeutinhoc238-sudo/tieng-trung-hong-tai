// HSK Vocabulary Flashcard - Main Frontend Controller

// --- STATE MANAGEMENT ---
let vocabList = [];       // Master list of all vocabulary (seeded + custom)
let filteredList = [];    // Current active subset based on active filters/search
let currentIndex = 0;     // Selected card index in filteredList
let isFlipped = false;    // Card orientation state
let autoplayTimer = null; // Timer reference for autoplay loop
let isAutoplayActive = false; // Autoplay state
let activeLevel = 'all';  // Level filter state: 'all', '1', '2', '3', '4'
let activeStatus = 'all'; // Status filter state: 'all', 'unmemorized', 'memorized', 'starred', 'custom'
let searchQuery = '';     // Search query string
let chineseVoice = null;  // Reference to Web Speech Chinese voice object
let currentUser = null;   // Active authenticated user profile
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === ''
  ? 'http://localhost:5000'
  : 'https://tieng-trung-hong-tai.onrender.com';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id-here.apps.googleusercontent.com';

// --- ENHANCEMENT STATE MANAGEMENT ---
let studyMode = 'flip';         // 'flip' or 'type'
let typingAttempts = 3;         // Remaining attempts (starts at 3)
let isTypingAnswerFinished = false; // Whether current card has finished evaluation
let activeCustomList = 'Mặc định'; // Active custom list selected in sidebar
let customLists = ['Mặc định'];  // List of custom named lists
let studyCustomCategory = null; // Filter for active custom list being studied
let smartSelectedSubDeck = 'hsk-1'; // Currently selected sub-deck in smart range custom selector
let smartSelectedRange = 'all';     // 'all' or 'custom'

// --- DOM ELEMENTS CACHE ---
const cardElement = document.getElementById('flashcard-card');
const cardWordFront = document.getElementById('card-word-front');
const cardLevelFront = document.getElementById('card-level-front');
const cardCategoryFront = document.getElementById('card-category-front');
const cardPinyinBack = document.getElementById('card-pinyin-back');
const cardMeaningBack = document.getElementById('card-meaning-back');
const cardLevelBack = document.getElementById('card-level-back');
const cardCategoryBack = document.getElementById('card-category-back');
const cardExampleZhBack = document.getElementById('card-example-zh-back');
const cardExampleViBack = document.getElementById('card-example-vi-back');

const prevCardBtn = document.getElementById('prev-card-btn');
const nextCardBtn = document.getElementById('next-card-btn');
const markMemorizedBtn = document.getElementById('mark-memorized-btn');
const markStarredBtn = document.getElementById('mark-starred-btn');
const speakBtnFront = document.getElementById('speak-btn-front');
const speakExampleBtn = document.getElementById('speak-example-btn');

const currentCardNum = document.getElementById('current-card-num');
const totalCardNum = document.getElementById('total-card-num');
const learningProgress = document.getElementById('learning-progress');
const progressPercentage = document.getElementById('progress-percentage');
const emptyState = document.getElementById('empty-state');
const cardViewport = document.querySelector('.flashcard-card-container');
const cardHudControls = document.getElementById('card-hud-controls');
const cardPageIndicator = document.getElementById('card-page-indicator');

const statsTotal = document.getElementById('stats-total');
const statsMemorized = document.getElementById('stats-memorized');
const statsStarred = document.getElementById('stats-starred');

const levelTabsContainer = document.getElementById('level-tabs');
const statusFilterSelect = document.getElementById('status-filter');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');

const autoplayBtn = document.getElementById('autoplay-btn');
const autoplayDelaySelect = document.getElementById('autoplay-delay');
const ttsVoiceSelect = document.getElementById('tts-voice-select');
const themeToggleBtn = document.getElementById('theme-toggle');

const addWordForm = document.getElementById('add-word-form');
const customWordsList = document.getElementById('custom-words-list');
const resetFiltersBtn = document.getElementById('reset-filters-btn');
const toastElement = document.getElementById('toast');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initVoices();
  fetchVocabulary();
  initAuth();
  setupEventListeners();
  initExams();
  initLessonsView();
  initDictionaryView();
  initChatbot();
  showHomeView();
});

// --- THEME MANAGEMENT ---
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    document.documentElement.classList.add('dark');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeToggleBtn.innerHTML = isDark
    ? '<i class="fa-solid fa-moon"></i>'
    : '<i class="fa-solid fa-sun"></i>';
  showToast(isDark ? 'Đã chuyển sang chế độ tối' : 'Đã chuyển sang chế độ sáng');
  if (!currentUser && typeof initGoogleSignIn === 'function') {
    initGoogleSignIn();
  }
}

// --- TEXT TO SPEECH (TTS) SETUP ---
function initVoices() {
  if (typeof speechSynthesis === 'undefined') return;

  const loadVoices = () => {
    const voices = speechSynthesis.getVoices();
    // Clear dropdown
    ttsVoiceSelect.innerHTML = '';

    // Look for Chinese voices (Chinese, Mandarin, zh-CN, zh-HK, zh-TW, etc.)
    const zhVoices = voices.filter(voice =>
      voice.lang.includes('zh') ||
      voice.name.toLowerCase().includes('chinese') ||
      voice.name.toLowerCase().includes('mandarin')
    );

    if (zhVoices.length > 0) {
      zhVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        // Default to Google 普通话 or Microsoft Yahei if possible
        if (voice.name.includes('Google') || voice.lang === 'zh-CN') {
          option.selected = true;
          chineseVoice = voice;
        }
        ttsVoiceSelect.appendChild(option);
      });
      if (!chineseVoice) chineseVoice = zhVoices[0];
    } else {
      const option = document.createElement('option');
      option.value = 'none';
      option.textContent = 'Không tìm thấy giọng tiếng Trung (Dùng giọng mặc định)';
      ttsVoiceSelect.appendChild(option);
    }
  };

  loadVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  ttsVoiceSelect.addEventListener('change', (e) => {
    const selectedVoiceName = e.target.value;
    const voices = speechSynthesis.getVoices();
    chineseVoice = voices.find(v => v.name === selectedVoiceName) || null;
  });
}

function speakText(text) {
  if (!text) return;

  // Xóa luôn dòng showToast "Đang tải phát âm..." vì nó đọc ngay lập tức, không cần đợi tải

  if (typeof speechSynthesis !== 'undefined') {
    // Tắt ngay âm thanh cũ nếu đang đọc dở để các câu không bị đè lên nhau
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN'; // Ép đọc tiếng Trung
    utterance.rate = 0.85;    // Tốc độ vừa phải cho dễ nghe

    // Lấy danh sách giọng đọc trong máy, ưu tiên chọn giọng tiếng Trung chuẩn nhất
    const voices = speechSynthesis.getVoices();
    const chineseVoice = voices.find(voice => voice.lang.includes('zh') || voice.lang.includes('cmn'));
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }

    speechSynthesis.speak(utterance);
  } else {
    showToast("Trình duyệt của bạn không hỗ trợ đọc offline!", true);
  }
}

function fallbackSpeakSpeechSynthesis(text) {
  if (typeof speechSynthesis === 'undefined') {
    showToast("Thiết bị không hỗ trợ phát âm thanh trực tiếp hoặc gián tiếp!", true);
    return;
  }

  try {
    showToast("Đang phát bằng giọng đọc hệ thống thiết bị...", false);
    const utterance = new SpeechSynthesisUtterance(text);
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    } else {
      utterance.lang = 'zh-CN';
    }
    utterance.rate = 0.85;
    speechSynthesis.speak(utterance);
  } catch (e) {
    console.error("Local SpeechSynthesis completely failed:", e);
    showToast("Không thể phát âm thanh bằng giọng đọc hệ thống!", true);
  }
}

// --- API ACTIONS ---
async function fetchVocabulary() {
  try {
    const response = await fetch(API_BASE_URL + '/api/vocabulary', {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Không thể tải từ vựng từ API');
    vocabList = await response.json();

    // If guest, merge guest progress from localStorage
    if (!currentUser) {
      const guestProgress = JSON.parse(localStorage.getItem('guest_progress') || '{}');
      vocabList = vocabList.map(w => {
        const state = guestProgress[w.id];
        return {
          ...w,
          isMemorized: state ? !!state.isMemorized : !!w.isMemorized,
          isStarred: state ? !!state.isStarred : !!w.isStarred,
          isWrong: state ? !!state.isWrong : !!w.isWrong
        };
      });
    }

    initCustomLists();
    renderCustomLists();
    updateStats();
    applyFilters();
    renderCustomWordsTable();
  } catch (error) {
    console.error('API Error:', error);
    showToast('Lỗi kết nối máy chủ backend!', true);

    // Merge guest progress on fallback empty seed list if offline
    if (!currentUser) {
      const guestProgress = JSON.parse(localStorage.getItem('guest_progress') || '{}');
      vocabList = vocabList.map(w => {
        const state = guestProgress[w.id];
        return {
          ...w,
          isMemorized: state ? !!state.isMemorized : !!w.isMemorized,
          isStarred: state ? !!state.isStarred : !!w.isStarred,
          isWrong: state ? !!state.isWrong : !!w.isWrong
        };
      });
    }

    initCustomLists();
    renderCustomLists();
    updateStats();
    applyFilters();
  }
}

async function toggleWordMemorized(id) {
  const index = vocabList.findIndex(w => w.id === id);
  if (index === -1) return;

  const oldMemorized = vocabList[index].isMemorized;
  const nextState = !oldMemorized;

  // Optimistic update
  vocabList[index].isMemorized = nextState;
  updateStats();
  applyFilters(true);
  showToast(nextState ? 'Đã thuộc từ này! 🎉' : 'Đã chuyển về danh sách cần ôn tập.');

  if (!currentUser) {
    const guestProgress = JSON.parse(localStorage.getItem('guest_progress') || '{}');
    if (!guestProgress[id]) guestProgress[id] = {};
    guestProgress[id].isMemorized = nextState;
    localStorage.setItem('guest_progress', JSON.stringify(guestProgress));
    return;
  }

  try {
    const response = await fetch(API_BASE_URL + '/api/vocabulary/toggle-memorized', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id }),
      credentials: 'include'
    });
    if (response.status === 401) {
      // Rollback optimistic state
      vocabList[index].isMemorized = oldMemorized;
      updateStats();
      applyFilters(true);

      localStorage.removeItem('user');
      localStorage.removeItem('session_token');
      currentUser = null;
      renderUserProfile();
      showToast('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.', true);

      const guestProgress = JSON.parse(localStorage.getItem('guest_progress') || '{}');
      if (!guestProgress[id]) guestProgress[id] = {};
      guestProgress[id].isMemorized = !oldMemorized;
      vocabList[index].isMemorized = !oldMemorized;
      localStorage.setItem('guest_progress', JSON.stringify(guestProgress));
      updateStats();
      applyFilters(true);
      return;
    }
    if (!response.ok) throw new Error('Lỗi cập nhật trạng thái');
    const updatedWord = await response.json();

    // Confirm local state matches server
    Object.assign(vocabList[index], updatedWord);
    updateStats();
    applyFilters(true);
  } catch (error) {
    console.error('API Error:', error);
    showToast('Lỗi cập nhật trạng thái từ máy chủ!', true);

    // Rollback state on error
    vocabList[index].isMemorized = oldMemorized;
    updateStats();
    applyFilters(true);
  }
}

async function toggleWordStarred(id) {
  const index = vocabList.findIndex(w => w.id === id);
  if (index === -1) return;

  const oldStarred = vocabList[index].isStarred;
  const nextState = !oldStarred;

  // Optimistic update
  vocabList[index].isStarred = nextState;
  updateStats();
  applyFilters(true);
  showToast(nextState ? 'Đã thêm vào yêu thích ⭐' : 'Đã bỏ yêu thích.');

  if (!currentUser) {
    const guestProgress = JSON.parse(localStorage.getItem('guest_progress') || '{}');
    if (!guestProgress[id]) guestProgress[id] = {};
    guestProgress[id].isStarred = nextState;
    localStorage.setItem('guest_progress', JSON.stringify(guestProgress));
    return;
  }

  try {
    const response = await fetch(API_BASE_URL + '/api/vocabulary/toggle-starred', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id }),
      credentials: 'include'
    });
    if (response.status === 401) {
      // Rollback optimistic state
      vocabList[index].isStarred = oldStarred;
      updateStats();
      applyFilters(true);

      localStorage.removeItem('user');
      localStorage.removeItem('session_token');
      currentUser = null;
      renderUserProfile();
      showToast('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.', true);

      const guestProgress = JSON.parse(localStorage.getItem('guest_progress') || '{}');
      if (!guestProgress[id]) guestProgress[id] = {};
      guestProgress[id].isStarred = !oldStarred;
      vocabList[index].isStarred = !oldStarred;
      localStorage.setItem('guest_progress', JSON.stringify(guestProgress));
      updateStats();
      applyFilters(true);
      return;
    }
    if (!response.ok) throw new Error('Lỗi cập nhật yêu thích');
    const updatedWord = await response.json();

    // Confirm local state matches server
    Object.assign(vocabList[index], updatedWord);
    updateStats();
    applyFilters(true);
  } catch (error) {
    console.error('API Error:', error);
    showToast('Lỗi cập nhật yêu thích từ máy chủ!', true);

    // Rollback state on error
    vocabList[index].isStarred = oldStarred;
    updateStats();
    applyFilters(true);
  }
}

async function handleAddWordForm(e) {
  e.preventDefault();

  const word = document.getElementById('input-word').value.trim();
  const pinyin = document.getElementById('input-pinyin').value.trim();
  const meaning = document.getElementById('input-meaning').value.trim();
  const level = parseInt(document.getElementById('input-level').value);
  const category = document.getElementById('input-category-select').value;
  const example_zh = document.getElementById('input-example-zh').value.trim();
  const example_vi = document.getElementById('input-example-vi').value.trim();

  try {
    const response = await fetch(API_BASE_URL + '/api/vocabulary', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        word, pinyin, meaning, level, category, example_zh, example_vi
      }),
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Lỗi khi thêm từ mới');

    const newWord = await response.json();
    vocabList.push(newWord);

    addWordForm.reset();

    // Auto sync select values
    if (!customLists.includes(category)) {
      customLists.push(category);
      const userKey = currentUser ? currentUser.email : 'guest';
      localStorage.setItem(`custom_lists_${userKey}`, JSON.stringify(customLists));
    }

    renderCustomLists();
    selectCustomList(category);
    updateStats();
    applyFilters(true);
    showToast('Thêm từ mới thành công!');

    // Jump to the newly added word if it's shown in the current filters
    const newIndex = filteredList.findIndex(w => w.id === newWord.id);
    if (newIndex !== -1) {
      currentIndex = newIndex;
      isFlipped = false;
      cardElement.classList.remove('flipped');
      renderActiveCard();
    }
  } catch (error) {
    console.error('API Error:', error);
    showToast('Thêm từ mới thất bại!', true);
  }
}

async function handleDeleteCustomWord(id) {
  if (!confirm('Bạn có chắc muốn xóa từ tự thêm này không?')) return;

  try {
    const response = await fetch(API_BASE_URL + '/api/vocabulary/' + id, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Không thể xóa từ');

    // Remove from local state
    vocabList = vocabList.filter(w => w.id !== id);

    updateStats();
    applyFilters();
    renderCustomWordsTable();
    showToast('Đã xóa từ vựng.');
  } catch (error) {
    console.error('API Error:', error);
    showToast('Không thể xóa từ vựng!', true);
  }
}

// --- RENDER FUNCTIONS ---
function renderActiveCard() {
  if (filteredList.length === 0) {
    emptyState.style.display = 'flex';
    cardViewport.style.display = 'none';
    cardHudControls.style.display = 'none';
    cardPageIndicator.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  cardViewport.style.display = 'block';
  cardHudControls.style.display = 'flex';
  cardPageIndicator.style.display = 'block';

  // Ensure index is within boundaries
  if (currentIndex >= filteredList.length) currentIndex = 0;
  if (currentIndex < 0) currentIndex = filteredList.length - 1;

  const current = filteredList[currentIndex];

  if (studyMode === 'type') {
    renderActiveCardTyping(current);
    return;
  }

  // Render Front Face
  cardWordFront.textContent = current.word;
  cardLevelFront.textContent = `HSK ${current.level}`;
  cardCategoryFront.textContent = current.category || 'Chưa phân loại';

  // Render Back Face
  cardPinyinBack.textContent = current.pinyin;
  cardMeaningBack.textContent = current.meaning;
  cardLevelBack.textContent = `HSK ${current.level}`;
  cardCategoryBack.textContent = current.category || 'Chưa phân loại';

  if (current.example_zh) {
    cardExampleZhBack.textContent = current.example_zh;
    cardExampleViBack.textContent = current.example_vi || '';
    document.querySelector('.example-box').style.display = 'block';
  } else {
    document.querySelector('.example-box').style.display = 'none';
  }

  // Update Indicator
  currentCardNum.textContent = currentIndex + 1;
  totalCardNum.textContent = filteredList.length;

  // Update Progress Fill
  const progressPercent = Math.round(((currentIndex + 1) / filteredList.length) * 100);
  learningProgress.style.width = `${progressPercent}%`;
  progressPercentage.textContent = `${progressPercent}%`;

  // Update HUD Button States
  if (current.isMemorized) {
    markMemorizedBtn.classList.add('active');
    document.getElementById('mark-btn-text').textContent = 'Đã thuộc';
  } else {
    markMemorizedBtn.classList.remove('active');
    document.getElementById('mark-btn-text').textContent = 'Đã thuộc';
  }

  if (current.isStarred) {
    markStarredBtn.classList.add('active');
  } else {
    markStarredBtn.classList.remove('active');
  }
}

function updateStats() {
  // 1. Dynamic stats based on activeLevel
  let levelList = vocabList;
  if (activeLevel !== 'all') {
    levelList = vocabList.filter(w => w.level.toString() === activeLevel);
  }

  // Adjust levelList if custom list or wrong/starred filter is active
  if (activeStatus === 'custom' && studyCustomCategory) {
    levelList = vocabList.filter(w => w.isCustom && w.category === studyCustomCategory);
  } else if (activeStatus === 'wrong') {
    levelList = vocabList.filter(w => w.isWrong);
  } else if (activeStatus === 'starred') {
    levelList = vocabList.filter(w => w.isStarred);
  }

  const total = levelList.length;
  const memorized = levelList.filter(w => w.isMemorized).length;
  const unmemorized = total - memorized;
  const starred = levelList.filter(w => w.isStarred).length;

  const statsTotal = document.getElementById('stats-total');
  const statsMemorized = document.getElementById('stats-memorized');
  const statsUnmemorized = document.getElementById('stats-unmemorized');
  const statsStarred = document.getElementById('stats-starred');

  if (statsTotal) statsTotal.textContent = total;
  if (statsMemorized) statsMemorized.textContent = memorized;
  if (statsUnmemorized) statsUnmemorized.textContent = unmemorized;
  if (statsStarred) statsStarred.textContent = starred;

  // 2. Mistake badge count
  const mistakeCount = vocabList.filter(w => w.isWrong).length;
  const mistakeBadge = document.getElementById('mistake-count-badge');
  if (mistakeBadge) mistakeBadge.textContent = mistakeCount;

  // 3. Detailed Stats Grid Table
  renderDetailedStatsTable();

  // 4. Render Deck Selection Grid view
  renderDeckSelectionView();
}

function renderDeckSelectionView() {
  const customGrid = document.getElementById('smart-custom-decks-grid');
  if (!customGrid) return;

  customGrid.innerHTML = '';

  // 1. Sổ tay từ làm sai
  const wrongWords = vocabList.filter(w => w.isWrong);
  const wrongCount = wrongWords.length;
  const wrongCard = document.createElement('div');
  wrongCard.className = `smart-mini-deck-card ${smartSelectedSubDeck === 'wrong' ? 'active' : ''}`;
  wrongCard.setAttribute('data-id', 'wrong');
  wrongCard.innerHTML = `
    <span class="smart-mini-deck-title"><i class="fa-solid fa-circle-exclamation text-danger" style="margin-right: 6px;"></i> Từ học sai</span>
    <span class="smart-mini-deck-count">${wrongCount} từ</span>
  `;
  wrongCard.addEventListener('click', () => {
    selectSmartSubDeck('wrong');
  });
  customGrid.appendChild(wrongCard);

  // 2. Từ vựng yêu thích
  const starredWords = vocabList.filter(w => w.isStarred);
  const starredCount = starredWords.length;
  const starredCard = document.createElement('div');
  starredCard.className = `smart-mini-deck-card ${smartSelectedSubDeck === 'starred' ? 'active' : ''}`;
  starredCard.setAttribute('data-id', 'starred');
  starredCard.innerHTML = `
    <span class="smart-mini-deck-title"><i class="fa-solid fa-star text-warning" style="margin-right: 6px;"></i> Yêu thích</span>
    <span class="smart-mini-deck-count">${starredCount} từ</span>
  `;
  starredCard.addEventListener('click', () => {
    selectSmartSubDeck('starred');
  });
  customGrid.appendChild(starredCard);

  // 3. Custom / Personal Lists
  customLists.forEach(listName => {
    const listWords = vocabList.filter(w => w.isCustom && w.category === listName);
    const listCount = listWords.length;
    const listCard = document.createElement('div');
    const subDeckId = `custom:${listName}`;
    listCard.className = `smart-mini-deck-card ${smartSelectedSubDeck === subDeckId ? 'active' : ''}`;
    listCard.setAttribute('data-id', subDeckId);
    listCard.innerHTML = `
      <span class="smart-mini-deck-title"><i class="fa-solid fa-folder text-primary" style="margin-right: 6px;"></i> ${listName}</span>
      <span class="smart-mini-deck-count">${listCount} từ</span>
    `;
    listCard.addEventListener('click', () => {
      selectSmartSubDeck(subDeckId);
    });
    customGrid.appendChild(listCard);
  });

  // 4. Free HSK Levels
  for (let lvl = 1; lvl <= 6; lvl++) {
    const lvlWords = vocabList.filter(w => !w.isCustom && w.level === lvl);
    const total = lvlWords.length;
    const subDeckId = `hsk-${lvl}`;
    const levelCard = document.createElement('div');
    levelCard.className = `smart-mini-deck-card ${smartSelectedSubDeck === subDeckId ? 'active' : ''}`;
    levelCard.setAttribute('data-id', subDeckId);
    levelCard.innerHTML = `
      <span class="smart-mini-deck-title"><i class="fa-solid fa-circle-check text-success" style="margin-right: 6px;"></i> HSK Cấp ${lvl}</span>
      <span class="smart-mini-deck-count">${total} từ</span>
    `;
    levelCard.addEventListener('click', () => {
      selectSmartSubDeck(subDeckId);
    });
    customGrid.appendChild(levelCard);
  }
}

function selectSmartSubDeck(subDeckId) {
  smartSelectedSubDeck = subDeckId;
  const customGrid = document.getElementById('smart-custom-decks-grid');
  if (customGrid) {
    customGrid.querySelectorAll('.smart-mini-deck-card').forEach(card => {
      if (card.getAttribute('data-id') === subDeckId) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }
}

function startStudySession(status, level, title, desc) {
  // Set filters
  activeStatus = status;
  activeLevel = level;

  // Sync inputs
  const statusFilterSelect = document.getElementById('status-filter');
  if (statusFilterSelect) statusFilterSelect.value = status;

  // Toggle level tabs active state in controls
  const levelTabsContainer = document.getElementById('level-tabs');
  if (levelTabsContainer) {
    levelTabsContainer.querySelectorAll('.level-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-level') === level);
    });
  }

  // Update header text
  const titleEl = document.getElementById('study-deck-title');
  const descEl = document.getElementById('study-deck-desc');
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;

  // Hide deck selector, show study workspace
  document.getElementById('deck-selection-view').style.display = 'none';
  document.getElementById('flashcard-study-view').style.display = 'block';

  // Apply filters to load cards
  applyFilters();

  // Scroll smooth
  const flashcardSection = document.getElementById('flashcard-section');
  if (flashcardSection) flashcardSection.scrollIntoView({ behavior: 'smooth' });
}

function renderDetailedStatsTable() {
  const tbody = document.getElementById('detailed-stats-rows');
  if (!tbody) return;

  tbody.innerHTML = '';
  const rowsData = [];

  // HSK Levels 1-6
  for (let lvl = 1; lvl <= 6; lvl++) {
    const lvlWords = vocabList.filter(w => !w.isCustom && w.level === lvl);
    const total = lvlWords.length;
    const memorized = lvlWords.filter(w => w.isMemorized).length;
    const unmemorized = total - memorized;
    const starred = lvlWords.filter(w => w.isStarred).length;

    rowsData.push({
      name: `HSK ${lvl}`,
      total, memorized, unmemorized, starred
    });
  }

  // Custom Words
  const customWords = vocabList.filter(w => w.isCustom);
  const cTotal = customWords.length;
  const cMemorized = customWords.filter(w => w.isMemorized).length;
  const cUnmemorized = cTotal - cMemorized;
  const cStarred = customWords.filter(w => w.isStarred).length;
  rowsData.push({
    name: 'Từ tự thêm ✏️',
    total: cTotal, memorized: cMemorized, unmemorized: cUnmemorized, starred: cStarred
  });

  // Total
  const allTotal = vocabList.length;
  const allMemorized = vocabList.filter(w => w.isMemorized).length;
  const allUnmemorized = allTotal - allMemorized;
  const allStarred = vocabList.filter(w => w.isStarred).length;
  rowsData.push({
    name: 'Tổng cộng',
    total: allTotal, memorized: allMemorized, unmemorized: allUnmemorized, starred: allStarred,
    isTotalRow: true
  });

  rowsData.forEach(row => {
    const tr = document.createElement('tr');
    if (row.isTotalRow) {
      tr.style.fontWeight = 'bold';
      tr.style.borderTop = '2px solid var(--border-glass)';
      tr.style.borderBottom = '2px dashed var(--border-glass)';
    } else {
      tr.style.borderBottom = '1px solid var(--border-glass)';
    }

    tr.innerHTML = `
      <td style="padding: 10px; text-align: left; font-weight: ${row.isTotalRow ? '700' : '500'};">${row.name}</td>
      <td style="padding: 10px; font-family: var(--font-display);">${row.total}</td>
      <td style="padding: 10px; font-family: var(--font-display); color: var(--success);">${row.memorized}</td>
      <td style="padding: 10px; font-family: var(--font-display); color: var(--danger);">${row.unmemorized}</td>
      <td style="padding: 10px; font-family: var(--font-display); color: var(--warning);">${row.starred}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCustomWordsTable() {
  const customs = vocabList.filter(w => w.isCustom && w.category === activeCustomList);
  customWordsList.innerHTML = '';

  if (customs.length === 0) {
    customWordsList.innerHTML = `
      <tr>
        <td colspan="5" class="table-empty">Chưa có từ nào trong danh sách "${activeCustomList}". Hãy điền form bên trái để thêm!</td>
      </tr>
    `;
    return;
  }

  customs.forEach(w => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family: var(--font-chinese); font-size: 1.15rem; font-weight: 500;">${w.word}</td>
      <td style="font-family: var(--font-display);">${w.pinyin}</td>
      <td>${w.meaning}</td>
      <td><span class="badge badge-level">HSK ${w.level}</span></td>
      <td>
        <button class="delete-btn" data-id="${w.id}" title="Xóa từ này">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;
    customWordsList.appendChild(tr);
  });

  // Attach delete events
  customWordsList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'));
      handleDeleteCustomWord(id);
    });
  });
}

// --- FILTERING LOGIC ---
function shuffleArray(array) {
  let shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function applyFilters(preserveIndex = false) {
  const previousWordId = (filteredList.length > 0 && currentIndex < filteredList.length) ? filteredList[currentIndex].id : null;

  const newList = vocabList.filter(w => {
    // If studying a specific custom list, show only custom words in that list
    if (studyCustomCategory) {
      return w.isCustom && w.category === studyCustomCategory;
    }

    // 1. Level Filter
    if (activeLevel !== 'all' && w.level.toString() !== activeLevel) return false;

    // 2. Status Filter
    if (activeStatus === 'memorized' && !w.isMemorized) return false;
    if (activeStatus === 'unmemorized' && w.isMemorized) return false;
    if (activeStatus === 'wrong' && !w.isWrong) return false;
    if (activeStatus === 'starred' && !w.isStarred) return false;
    if (activeStatus === 'custom' && !w.isCustom) return false;

    // 3. Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchWord = w.word.includes(q);
      const matchPinyin = w.pinyin.toLowerCase().includes(q);
      const matchMeaning = w.meaning.toLowerCase().includes(q);
      return matchWord || matchPinyin || matchMeaning;
    }

    return true;
  });

  if (!preserveIndex) {
    // Shuffle the list for a new study session
    filteredList = shuffleArray(newList);
  } else {
    // Keep the existing order, but filter out elements that are no longer valid
    const validIds = new Set(newList.map(w => w.id));
    filteredList = filteredList.filter(w => validIds.has(w.id));

    // Add any new elements from newList that were not in filteredList
    const existingIds = new Set(filteredList.map(w => w.id));
    newList.forEach(w => {
      if (!existingIds.has(w.id)) {
        filteredList.push(w);
      }
    });
  }

  // Handle Index Preservation
  if (preserveIndex && previousWordId) {
    const newIndex = filteredList.findIndex(w => w.id === previousWordId);
    if (newIndex !== -1) {
      currentIndex = newIndex;
    } else {
      if (currentIndex >= filteredList.length) {
        currentIndex = 0;
      }
    }
  } else {
    currentIndex = 0;
  }

  isFlipped = false;
  cardElement.classList.remove('flipped');
  renderActiveCard();
  renderFilteredWordsTable();
}

function renderFilteredWordsTable() {
  const tbody = document.getElementById('filtered-words-table-rows');
  const countBadge = document.getElementById('filtered-words-count');
  const noteEl = document.getElementById('filtered-words-table-note');

  if (!tbody || !countBadge) return;

  // Calculate base counts based on activeLevel and searchQuery (ignoring status)
  const baseFilteredList = vocabList.filter(w => {
    if (studyCustomCategory) {
      return w.isCustom && w.category === studyCustomCategory;
    }
    if (activeLevel !== 'all' && w.level.toString() !== activeLevel) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchWord = w.word.includes(q);
      const matchPinyin = w.pinyin.toLowerCase().includes(q);
      const matchMeaning = w.meaning.toLowerCase().includes(q);
      return matchWord || matchPinyin || matchMeaning;
    }
    return true;
  });

  const memorizedCount = baseFilteredList.filter(w => w.isMemorized).length;
  const unmemorizedCount = baseFilteredList.filter(w => !w.isMemorized).length;
  const starredCount = baseFilteredList.filter(w => w.isStarred).length;

  // Update tabs labels with dynamic counts
  const memorizedTab = document.querySelector('.list-tab-btn[data-tab="memorized"]');
  const unmemorizedTab = document.querySelector('.list-tab-btn[data-tab="unmemorized"]');
  const starredTab = document.querySelector('.list-tab-btn[data-tab="starred"]');

  if (memorizedTab) memorizedTab.innerHTML = `<i class="fa-solid fa-circle-check text-success"></i> Đã thuộc (${memorizedCount})`;
  if (unmemorizedTab) unmemorizedTab.innerHTML = `<i class="fa-solid fa-circle-xmark text-danger"></i> Chưa thuộc (${unmemorizedCount})`;
  if (starredTab) starredTab.innerHTML = `<i class="fa-solid fa-star text-warning"></i> Yêu thích (${starredCount})`;

  // Highlight the active tab button
  document.querySelectorAll('.list-tab-btn').forEach(btn => {
    const tab = btn.getAttribute('data-tab');
    if (tab === activeStatus) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  tbody.innerHTML = '';
  countBadge.textContent = filteredList.length;

  if (filteredList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="table-empty" style="text-align: center; padding: 24px; color: var(--text-muted); font-style: italic;">
          Không tìm thấy từ vựng nào khớp với bộ lọc hiện tại.
        </td>
      </tr>
    `;
    if (noteEl) noteEl.style.display = 'none';
    return;
  }

  // Cap display at 100 for maximum performance
  const displayLimit = 100;
  const listToDisplay = filteredList.slice(0, displayLimit);

  if (noteEl) {
    noteEl.style.display = filteredList.length > displayLimit ? 'block' : 'none';
  }

  listToDisplay.forEach((w) => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border-glass)';
    tr.innerHTML = `
      <td style="font-family: var(--font-chinese); font-size: 1.25rem; font-weight: 500; padding: 12px;">${w.word}</td>
      <td style="font-family: var(--font-display); padding: 12px; color: var(--accent-teal);">${w.pinyin}</td>
      <td style="padding: 12px; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${w.meaning}">${w.meaning}</td>
      <td style="padding: 12px;"><span class="badge badge-level" style="margin: 0;">${w.isCustom ? 'Cá nhân ✏️' : 'HSK ' + w.level}</span></td>
      <td style="padding: 12px; text-align: center;">
        <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
          <button class="circle-btn speak-row-btn" data-word="${w.word}" title="Nghe phát âm" style="width: 32px; height: 32px; font-size: 0.8rem; background: rgba(59, 130, 246, 0.1); color: var(--accent-blue); display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-volume-high"></i>
          </button>
          <button class="circle-btn study-row-btn" data-id="${w.id}" title="Học từ này" style="width: 32px; height: 32px; font-size: 0.8rem; background: rgba(16, 185, 129, 0.1); color: var(--success); display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-graduation-cap"></i>
          </button>
          <button class="circle-btn star-row-btn ${w.isStarred ? 'active' : ''}" data-id="${w.id}" title="Yêu thích" style="width: 32px; height: 32px; font-size: 0.8rem; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-star"></i>
          </button>
          <button class="circle-btn check-row-btn ${w.isMemorized ? 'active' : ''}" data-id="${w.id}" title="Đã thuộc" style="width: 32px; height: 32px; font-size: 0.8rem; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-circle-check"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Bind Speak Events
  tbody.querySelectorAll('.speak-row-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const word = btn.getAttribute('data-word');
      speakText(word);
    });
  });

  // Bind Study Jumps
  tbody.querySelectorAll('.study-row-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'));
      const newIndex = filteredList.findIndex(w => w.id === id);
      if (newIndex !== -1) {
        currentIndex = newIndex;
        resetCardOrientation();
        const cardSection = document.getElementById('flashcard-card');
        if (cardSection) {
          cardSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  });

  // Bind Star Toggles
  tbody.querySelectorAll('.star-row-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'));
      toggleWordStarred(id);
    });
  });

  // Bind Memorized Toggles
  tbody.querySelectorAll('.check-row-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'));
      toggleWordMemorized(id);
    });
  });
}

// --- AUTOPLAY LOOP ---
function toggleAutoplay() {
  if (isAutoplayActive) {
    stopAutoplay();
  } else {
    startAutoplay();
  }
}

function startAutoplay() {
  if (filteredList.length === 0) return;
  isAutoplayActive = true;
  autoplayBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Tạm dừng chạy';
  autoplayBtn.classList.add('btn-primary');
  autoplayBtn.classList.remove('btn-secondary');

  runAutoplayCycle();
}

function stopAutoplay() {
  isAutoplayActive = false;
  if (autoplayTimer) {
    clearTimeout(autoplayTimer);
    autoplayTimer = null;
  }
  autoplayBtn.innerHTML = '<i class="fa-solid fa-play"></i> Tự động chạy';
  autoplayBtn.classList.add('btn-secondary');
  autoplayBtn.classList.remove('btn-primary');
}

function runAutoplayCycle() {
  if (!isAutoplayActive || filteredList.length === 0) return;

  const current = filteredList[currentIndex];
  const delay = parseInt(autoplayDelaySelect.value);

  // 1. Pronounce front word
  if (!isFlipped) {
    speakText(current.word);

    // 2. Wait, then flip to back
    autoplayTimer = setTimeout(() => {
      flipCard();

      // 3. Wait 1s, then pronounce example (if exists) or just prepare next slide
      autoplayTimer = setTimeout(() => {
        if (current.example_zh) {
          speakText(current.example_zh);
        }

        // 4. Wait rest of the duration, then flip back and go to next card
        autoplayTimer = setTimeout(() => {
          nextCard();
          // Repeat cycle
          runAutoplayCycle();
        }, delay - 1000 > 1000 ? delay - 1000 : 1500);

      }, 1000);

    }, delay / 2);
  } else {
    // If somehow started while flipped, flip back first
    flipCard();
    autoplayTimer = setTimeout(runAutoplayCycle, 600);
  }
}

// --- NAVIGATION & INTERACTION ---
function nextCard() {
  if (filteredList.length === 0) return;
  currentIndex = (currentIndex + 1) % filteredList.length;
  resetCardOrientation();
}

function prevCard() {
  if (filteredList.length === 0) return;
  currentIndex = (currentIndex - 1 + filteredList.length) % filteredList.length;
  resetCardOrientation();
}

function flipCard() {
  if (filteredList.length === 0) return;
  isFlipped = !isFlipped;
  cardElement.classList.toggle('flipped', isFlipped);
}

function resetCardOrientation() {
  isFlipped = false;
  cardElement.classList.remove('flipped');
  // Add a slight delay to render so the front side transitions properly before content updates
  setTimeout(renderActiveCard, 100);
}

function showToast(message, isError = false) {
  toastElement.textContent = message;
  toastElement.style.borderLeftColor = isError ? 'var(--danger)' : 'var(--accent-blue)';
  toastElement.classList.add('show');

  setTimeout(() => {
    toastElement.classList.remove('show');
  }, 2500);
}

// --- EVENT LISTENERS ---
function setupEventListeners() {

  // Bottom Navigation Bar Switcher
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Smart Configuration View Events
  // 1. Step 1 Curriculum selector
  const curriculumHsk = document.getElementById('smart-curriculum-hsk');
  const curriculumYct = document.getElementById('smart-curriculum-yct');
  let activeCurriculum = 'hsk';

  if (curriculumHsk && curriculumYct) {
    curriculumHsk.addEventListener('click', () => {
      activeCurriculum = 'hsk';
      curriculumHsk.classList.add('active');
      curriculumYct.classList.remove('active');
    });

    curriculumYct.addEventListener('click', () => {
      showToast('Nội dung giáo trình YCT đang được biên soạn! Vui lòng ôn tập HSK.', false);
      activeCurriculum = 'yct';
      curriculumYct.classList.add('active');
      curriculumHsk.classList.remove('active');
    });
  }

  // 2. Step 2 Level pills
  const levelRow = document.getElementById('smart-level-row');
  if (levelRow) {
    levelRow.addEventListener('click', (e) => {
      const pill = e.target.closest('.level-pill');
      if (!pill) return;

      levelRow.querySelectorAll('.level-pill').forEach(btn => btn.classList.remove('active'));
      pill.classList.add('active');
      activeLevel = pill.getAttribute('data-level');

      // Update Step 4 range title
      const rangeTitle = document.getElementById('smart-range-all-title');
      if (rangeTitle) {
        rangeTitle.textContent = `Toàn bộ từ vựng cấp HSK ${activeLevel}`;
      }
    });
  }

  // 3. Step 3 Mode selector
  const modeFlip = document.getElementById('smart-mode-flip');
  const modeType = document.getElementById('smart-mode-type');
  if (modeFlip && modeType) {
    modeFlip.addEventListener('click', () => {
      studyMode = 'flip';
      modeFlip.classList.add('active');
      modeType.classList.remove('active');
    });

    modeType.addEventListener('click', () => {
      studyMode = 'type';
      modeType.classList.add('active');
      modeFlip.classList.remove('active');
    });
  }

  // 4. Step 4 Range selector
  const rangeAllCard = document.getElementById('smart-range-all-card');
  const rangeCustomCard = document.getElementById('smart-range-custom-card');
  const customPickerContainer = document.getElementById('smart-custom-picker-container');

  if (rangeAllCard && rangeCustomCard) {
    rangeAllCard.addEventListener('click', () => {
      smartSelectedRange = 'all';
      rangeAllCard.classList.add('active');
      rangeCustomCard.classList.remove('active');
      if (customPickerContainer) customPickerContainer.style.display = 'none';
    });

    rangeCustomCard.addEventListener('click', () => {
      smartSelectedRange = 'custom';
      rangeCustomCard.classList.add('active');
      rangeAllCard.classList.remove('active');
      if (customPickerContainer) customPickerContainer.style.display = 'block';
    });
  }

  // 5. Smart Study Start Button
  const startSmartBtn = document.getElementById('start-smart-study-btn');
  if (startSmartBtn) {
    startSmartBtn.addEventListener('click', () => {
      if (activeCurriculum === 'yct') {
        showToast('Giáo trình YCT đang được biên soạn! Vui lòng ôn tập giáo trình HSK.', true);
        return;
      }

      setStudyMode(studyMode);

      if (smartSelectedRange === 'all') {
        startStudySession('unmemorized', activeLevel, `Học Từ Vựng HSK ${activeLevel}`, `Luyện ôn tập từ vựng chuẩn HSK Cấp ${activeLevel}`);
      } else {
        // Custom sub-deck selection
        if (smartSelectedSubDeck === 'wrong') {
          studyCustomCategory = null;
          startStudySession('wrong', 'all', 'Sổ tay từ làm sai', 'Ôn tập các từ vựng bạn đã trả lời sai');
        } else if (smartSelectedSubDeck === 'starred') {
          studyCustomCategory = null;
          startStudySession('starred', 'all', 'Thẻ Yêu Thích', 'Học các từ vựng được đánh dấu sao yêu thích');
        } else if (smartSelectedSubDeck.startsWith('custom:')) {
          const listName = smartSelectedSubDeck.substring(7); // remove "custom:" prefix
          studyCustomCategory = listName;
          startStudySession('custom', 'all', `Sổ tay: ${listName}`, `Đang học danh sách tự biên soạn: ${listName}`);
        } else if (smartSelectedSubDeck.startsWith('hsk-')) {
          const lvl = smartSelectedSubDeck.substring(4); // remove "hsk-" prefix
          studyCustomCategory = null;
          startStudySession('unmemorized', lvl, `Học Từ Vựng HSK ${lvl}`, `Luyện ôn tập từ vựng chuẩn HSK Cấp ${lvl}`);
        }
      }
    });
  }

  // Curriculum Cards Interaction
  const hskCard = document.getElementById('curriculum-hsk-card');
  if (hskCard) {
    hskCard.addEventListener('click', () => {
      switchTab('lessons');
      // Go to level selection or auto select HSK level
      document.getElementById('exam-level-selection').style.display = 'block';
      document.getElementById('exam-papers-list').style.display = 'none';
    });
  }

  const yctCard = document.getElementById('curriculum-yct-card');
  if (yctCard) {
    yctCard.addEventListener('click', () => {
      showToast('Nội dung giáo trình YCT đang được biên soạn! Vui lòng quay lại sau.', false);
    });
  }

  // Welcome Banner Actions
  const bannerStartBtn = document.getElementById('banner-start-study-btn');
  if (bannerStartBtn) {
    bannerStartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('lessons');
    });
  }

  const bannerDictBtn = document.getElementById('banner-dictionary-btn');
  if (bannerDictBtn) {
    bannerDictBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('dictionary');
    });
  }

  // Back to Decks button click
  const backToDecksBtn = document.getElementById('back-to-decks-btn');
  if (backToDecksBtn) {
    backToDecksBtn.addEventListener('click', () => {
      stopAutoplay();
      document.getElementById('flashcard-study-view').style.display = 'none';
      document.getElementById('deck-selection-view').style.display = 'block';
      const flashcardSection = document.getElementById('flashcard-section');
      if (flashcardSection) flashcardSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Card Flip Click
  cardElement.addEventListener('click', (e) => {
    // Prevent flip if clicking a button inside card actions
    if (e.target.closest('.circle-btn') || e.target.closest('.speak-example-btn')) {
      return;
    }
    flipCard();
  });

  // HUD and Speak Controls
  prevCardBtn.addEventListener('click', () => {
    stopAutoplay();
    prevCard();
  });

  nextCardBtn.addEventListener('click', () => {
    stopAutoplay();
    nextCard();
  });

  markMemorizedBtn.addEventListener('click', () => {
    if (filteredList.length > 0) {
      toggleWordMemorized(filteredList[currentIndex].id);
    }
  });

  markStarredBtn.addEventListener('click', () => {
    if (filteredList.length > 0) {
      toggleWordStarred(filteredList[currentIndex].id);
    }
  });

  speakBtnFront.addEventListener('click', (e) => {
    e.stopPropagation();
    if (filteredList.length > 0) {
      showToast("Đang tải phát âm từ vựng...", false);
      speakText(filteredList[currentIndex].word);
    }
  });

  speakExampleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (filteredList.length > 0 && filteredList[currentIndex].example_zh) {
      showToast("Đang tải phát âm ví dụ...", false);
      speakText(filteredList[currentIndex].example_zh);
    }
  });

  // Filters Events
  levelTabsContainer.addEventListener('click', (e) => {
    const tab = e.target.closest('.level-tab');
    if (!tab) return;

    levelTabsContainer.querySelectorAll('.level-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeLevel = tab.getAttribute('data-level');
    stopAutoplay();
    applyFilters();
  });

  statusFilterSelect.addEventListener('change', (e) => {
    activeStatus = e.target.value;
    stopAutoplay();
    applyFilters();
  });

  // Search input events
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
    stopAutoplay();
    applyFilters();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    stopAutoplay();
    applyFilters();
  });

  resetFiltersBtn.addEventListener('click', () => {
    // Reset all filter controls
    levelTabsContainer.querySelectorAll('.level-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-level') === 'all');
    });
    activeLevel = 'all';

    statusFilterSelect.value = 'all';
    activeStatus = 'all';

    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';

    stopAutoplay();
    applyFilters();
  });

  // Autoplay
  autoplayBtn.addEventListener('click', toggleAutoplay);


  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Theme Toggle
  themeToggleBtn.addEventListener('click', toggleTheme);

  // User Profile Dropdown Toggle on Click
  const userProfile = document.querySelector('.user-profile');
  const userDropdown = document.querySelector('.user-dropdown');
  if (userProfile && userDropdown) {
    userProfile.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('show-menu');
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const activeDropdown = document.querySelector('.user-dropdown.show-menu');
    if (activeDropdown && !activeDropdown.contains(e.target)) {
      activeDropdown.classList.remove('show-menu');
    }
  });

  // Form submission
  addWordForm.addEventListener('submit', handleAddWordForm);

  // Keyboard navigation hotkeys
  document.addEventListener('keydown', (e) => {
    // Ignore key bindings if user is typing in inputs or select boxes
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    const key = e.key.toLowerCase();

    // Check if HSK Exam Player is active
    const examPlayer = document.getElementById('exam-player');
    if (examPlayer && examPlayer.style.display === 'block') {
      if (key === 'arrowright') {
        e.preventDefault();
        const nextBtn = document.getElementById('exam-next-btn');
        if (nextBtn && !nextBtn.disabled) nextBtn.click();
      } else if (key === 'arrowleft') {
        e.preventDefault();
        const prevBtn = document.getElementById('exam-prev-btn');
        if (prevBtn && !prevBtn.disabled) prevBtn.click();
      } else if (['a', 'b', 'c', 'd'].includes(key)) {
        e.preventDefault();
        const index = key.charCodeAt(0) - 97; // 'a' is 0, 'b' is 1, etc.
        const options = document.querySelectorAll('#active-question-options .option-item');
        if (options[index]) {
          options[index].click();
        }
      }
      return;
    }

    if (key === ' ' || e.code === 'Space') {
      e.preventDefault();
      flipCard();
    } else if (key === 'arrowright' || key === 'd') {
      stopAutoplay();
      nextCard();
    } else if (key === 'arrowleft' || key === 'a') {
      stopAutoplay();
      prevCard();
    } else if (key === 'enter' || key === 'w') {
      if (filteredList.length > 0) {
        toggleWordMemorized(filteredList[currentIndex].id);
      }
    } else if (key === 's') {
      if (filteredList.length > 0) {
        toggleWordStarred(filteredList[currentIndex].id);
      }
    } else if (key === 'v') {
      if (filteredList.length > 0) {
        if (isFlipped && filteredList[currentIndex].example_zh) {
          speakText(filteredList[currentIndex].example_zh);
        } else {
          speakText(filteredList[currentIndex].word);
        }
      }
    }
  });

  // Toggling Detailed Stats Panel
  const toggleStatsBtn = document.getElementById('toggle-detailed-stats');
  const statsPanel = document.getElementById('detailed-stats-panel');
  if (toggleStatsBtn && statsPanel) {
    toggleStatsBtn.addEventListener('click', () => {
      const isHidden = statsPanel.style.display === 'none';
      statsPanel.style.display = isHidden ? 'block' : 'none';
      toggleStatsBtn.innerHTML = isHidden
        ? '<i class="fa-solid fa-chart-simple"></i> Ẩn bảng thống kê'
        : '<i class="fa-solid fa-chart-simple"></i> Xem bảng thống kê chi tiết';
    });
  }

  // Segmented Study Mode Toggles
  const modeFlipBtn = document.getElementById('mode-flip-btn');
  const modeTypeBtn = document.getElementById('mode-type-btn');
  if (modeFlipBtn && modeTypeBtn) {
    modeFlipBtn.addEventListener('click', () => setStudyMode('flip'));
    modeTypeBtn.addEventListener('click', () => setStudyMode('type'));
  }

  // Typing Practice Controls
  const typeInput = document.getElementById('type-answer-input');
  if (typeInput) {
    typeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleTypingCheck();
      }
    });
  }

  const typeCheckBtn = document.getElementById('type-check-btn');
  if (typeCheckBtn) {
    typeCheckBtn.addEventListener('click', handleTypingCheck);
  }

  const typeHintBtn = document.getElementById('type-hint-pinyin-btn');
  if (typeHintBtn) {
    typeHintBtn.addEventListener('click', () => {
      if (filteredList.length === 0) return;
      const current = filteredList[currentIndex];
      typeHintBtn.innerHTML = `<i class="fa-solid fa-eye"></i> Pinyin: ${current.pinyin}`;
      typeHintBtn.disabled = true;
    });
  }

  const typeRevealBtn = document.getElementById('type-reveal-btn');
  if (typeRevealBtn) {
    typeRevealBtn.addEventListener('click', () => {
      if (filteredList.length === 0) return;
      const current = filteredList[currentIndex];
      isTypingAnswerFinished = true;
      const input = document.getElementById('type-answer-input');
      if (input) {
        input.value = current.word;
        input.disabled = true;
      }
      const feedback = document.getElementById('type-feedback-msg');
      if (feedback) {
        feedback.textContent = 'Đã hiện đáp án.';
        feedback.style.color = 'var(--text-muted)';
      }
      showRevealedDetails(current);
      const checkBtn = document.getElementById('type-check-btn');
      if (checkBtn) checkBtn.innerHTML = 'Tiếp tục <i class="fa-solid fa-chevron-right"></i>';
    });
  }

  const typeSpeakBtn = document.getElementById('type-speak-btn');
  if (typeSpeakBtn) {
    typeSpeakBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (filteredList.length > 0) speakText(filteredList[currentIndex].word);
    });
  }

  const typeSpeakExBtn = document.getElementById('type-speak-example-btn');
  if (typeSpeakExBtn) {
    typeSpeakExBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (filteredList.length > 0 && filteredList[currentIndex].example_zh) {
        speakText(filteredList[currentIndex].example_zh);
      }
    });
  }

  // Mistake Notebook Dashboard review button
  const practiceMistakesBtn = document.getElementById('practice-mistakes-btn');
  if (practiceMistakesBtn) {
    practiceMistakesBtn.addEventListener('click', () => {
      stopAutoplay();
      studyCustomCategory = null;
      startStudySession('wrong', 'all', 'Sổ tay từ làm sai', 'Ôn tập các từ vựng bạn đã trả lời sai');
      showToast('Đang tải danh sách từ vựng làm sai!');
    });
  }

  // Custom lists Manager events
  const addListBtn = document.getElementById('add-list-btn');
  const newListInput = document.getElementById('new-list-name-input');
  if (addListBtn && newListInput) {
    const createList = () => {
      const name = newListInput.value.trim();
      if (name === '') {
        showToast('Vui lòng nhập tên danh sách!', true);
        return;
      }
      if (customLists.includes(name)) {
        showToast('Danh sách này đã tồn tại!', true);
        return;
      }
      customLists.push(name);
      const userKey = currentUser ? currentUser.email : 'guest';
      localStorage.setItem(`custom_lists_${userKey}`, JSON.stringify(customLists));
      newListInput.value = '';
      renderCustomLists();
      selectCustomList(name);
      showToast(`Đã tạo danh sách: ${name}!`);
    };
    addListBtn.addEventListener('click', createList);
    newListInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        createList();
      }
    });
  }

  const categorySelect = document.getElementById('input-category-select');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      const name = e.target.value;
      if (customLists.includes(name)) {
        selectCustomList(name);
      }
    });
  }

  // Quick Stats Click Handlers to filter lists dynamically
  document.querySelectorAll('.stats-summary-widget .widget-item').forEach(item => {
    item.addEventListener('click', () => {
      const status = item.getAttribute('data-status');
      if (status) {
        activeStatus = status;
        statusFilterSelect.value = status;
        studyCustomCategory = null; // Clear custom categories if studying quick stats
        stopAutoplay();
        applyFilters();

        // Scroll to card interface
        const flashcardContainer = document.getElementById('flashcard-card');
        if (flashcardContainer) {
          flashcardContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        let label = 'Tất cả từ vựng HSK';
        if (status === 'memorized') label = 'Từ vựng đã thuộc 🎉';
        if (status === 'unmemorized') label = 'Từ vựng chưa thuộc 📝';
        if (status === 'starred') label = 'Từ vựng yêu thích ⭐';

        showToast(`Đang học: ${label}`);
      }
    });
  });

  // List Tab click events (Đã thuộc, Chưa thuộc, Yêu thích)
  document.querySelectorAll('.list-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) {
        activeStatus = tab;
        statusFilterSelect.value = tab;
        studyCustomCategory = null;
        stopAutoplay();
        applyFilters();
      }
    });
  });

  // View Full List button click handler
  const viewFullListBtn = document.getElementById('view-full-list-btn');
  if (viewFullListBtn) {
    viewFullListBtn.addEventListener('click', () => {
      const params = new URLSearchParams();
      params.set('level', activeLevel);
      params.set('status', activeStatus);
      if (searchQuery) params.set('search', searchQuery);
      if (studyCustomCategory) params.set('customCategory', studyCustomCategory);

      window.open(`detail-list.html?${params.toString()}`, '_blank');
    });
  }
}

function getAuthHeaders(customHeaders = {}) {
  const token = localStorage.getItem('session_token');
  const headers = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-session-token'] = token;
  }
  return headers;
}

// --- AUTHENTICATION & LOGIN LOGIC ---

// Fetch current user from session / local storage and initialize Google Sign-In SDK
async function initAuth() {
  // Check if session is active on backend
  try {
    const res = await fetch(API_BASE_URL + '/api/auth/me', {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        currentUser = data.user;
        renderUserProfile();
        return;
      } else {
        // Backend explicitly returned user: null, session is invalid/expired!
        localStorage.removeItem('user');
        localStorage.removeItem('session_token');
        currentUser = null;
        renderUserProfile();
        initGoogleSignIn();
        return;
      }
    }
  } catch (err) {
    console.warn('Backend session retrieval failed, using local storage:', err);
  }

  // Fallback to local storage only if backend offline/unreachable
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      renderUserProfile();
    } catch (e) {
      localStorage.removeItem('user');
      localStorage.removeItem('session_token');
    }
  }

  // Initialize Google Identity Services
  initGoogleSignIn();
}

function initGoogleSignIn() {
  if (typeof google === 'undefined') {
    // Retry in 1s if Google Identity Services script hasn't loaded yet
    setTimeout(initGoogleSignIn, 1000);
    return;
  }

  try {
    const signinBtnWrapper = document.getElementById('google-signin-button');
    if (!signinBtnWrapper) return;

    // Clear wrapper first in case of re-rendering
    signinBtnWrapper.innerHTML = '';

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    });

    google.accounts.id.renderButton(
      signinBtnWrapper,
      {
        theme: document.documentElement.classList.contains('dark') ? 'filled_black' : 'outline',
        size: 'medium',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        logo_alignment: 'left'
      }
    );
  } catch (err) {
    console.error('Google Sign-In initialization failed:', err);
  }
}

// Google Sign-In Credential Callback
async function handleCredentialResponse(response) {
  try {
    const res = await fetch(API_BASE_URL + '/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential }),
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Đăng nhập qua backend thất bại');

    const data = await res.json();
    if (data.success && data.user) {
      currentUser = data.user;
      if (data.token) {
        localStorage.setItem('session_token', data.token);
      }
      localStorage.setItem('user', JSON.stringify(currentUser));
      renderUserProfile();
      showToast(`Chào mừng ${currentUser.name} đã quay lại! 👋`);
      
      // Migrate guest chat history to user account
      if (typeof window.migrateGuestChatHistory === 'function') {
        window.migrateGuestChatHistory();
      }
    } else {
      throw new Error('Không nhận được dữ liệu người dùng');
    }
  } catch (err) {
    console.error('Auth Error:', err);
    showToast('Đăng nhập Google thất bại!', true);
  }
}


// Logout Click Handler
async function handleLogout(e) {
  if (e) e.preventDefault();

  try {
    await fetch(API_BASE_URL + '/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
  } catch (err) {
    console.warn('Backend logout call failed, cleaning up client anyway:', err);
  }

  currentUser = null;
  localStorage.removeItem('user');
  localStorage.removeItem('session_token');

  const userDropdownToggle = document.querySelector('.user-dropdown');
  if (userDropdownToggle) {
    userDropdownToggle.classList.remove('show-menu');
  }

  if (typeof google !== 'undefined') {
    try {
      google.accounts.id.disableAutoSelect();
    } catch (e) {
      console.warn(e);
    }
  }

  renderUserProfile();
  showToast('Đã đăng xuất thành công.');
  
  // Reset Chatbot interface and threads on logout
  if (typeof window.resetChatbotOnLogout === 'function') {
    window.resetChatbotOnLogout();
  }

  // Re-initialize Google Sign-In button since logged-out elements render again
  setTimeout(initGoogleSignIn, 100);
}

// Render profile view based on currentUser state
function renderUserProfile() {
  const authContainer = document.getElementById('auth-container');
  const avatarImg = document.getElementById('user-avatar-img');
  const avatarPlaceholder = document.getElementById('user-avatar-placeholder');
  const displayName = document.getElementById('user-display-name');
  const displayEmail = document.getElementById('user-display-email');

  const navChatHistoryLi = document.getElementById('nav-chat-history-li');

  if (!authContainer) return;

  if (currentUser) {
    authContainer.classList.remove('logged-out');
    authContainer.classList.add('logged-in');

    if (currentUser.picture) {
      avatarImg.src = currentUser.picture;
      avatarImg.style.display = 'block';
      avatarPlaceholder.style.display = 'none';
    } else {
      avatarImg.style.display = 'none';
      avatarPlaceholder.style.display = 'flex';
      avatarPlaceholder.textContent = currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'HT';
    }

    displayName.textContent = currentUser.name || 'Học viên';
    displayEmail.textContent = currentUser.email || 'demo@tiengtrunghongtai.com';

    if (navChatHistoryLi) navChatHistoryLi.style.display = 'block';

    if (typeof window.updateChatbotOnLogin === 'function') {
      window.updateChatbotOnLogin();
    }
  } else {
    authContainer.classList.remove('logged-in');
    authContainer.classList.add('logged-out');

    if (navChatHistoryLi) navChatHistoryLi.style.display = 'none';
  }

  // Refresh exam grid with current user's scores if papers screen is open
  const papersListScreen = document.getElementById('exam-papers-list');
  if (papersListScreen && papersListScreen.style.display === 'block' && currentExamLevel) {
    loadExamPapersList(currentExamLevel);
  }
}

// --- HSK MOCK EXAM ENGINE ---

const HSK_LEVELS_METADATA = {
  1: { time: 35, questionsCount: 40, title: "Sơ cấp - HSK Cấp 1" },
  2: { time: 55, questionsCount: 50, title: "Sơ cấp - HSK Cấp 2" },
  3: { time: 90, questionsCount: 80, title: "Sơ cấp - HSK Cấp 3" },
  4: { time: 105, questionsCount: 85, title: "Trung cấp - HSK Cấp 4" },
  5: { time: 125, questionsCount: 90, title: "Trung cấp - HSK Cấp 5" },
  6: { time: 140, questionsCount: 101, title: "Cao cấp - HSK Cấp 6" }
};

let currentExamLevel = null;
let currentExamSet = null;
let currentExamQuestions = [];
let currentExamAnswers = [];
let activeQuestionIndex = 0;
let examTimerInterval = null;
let examTimeRemaining = 0;
let examTotalSeconds = 0;

// Seeded PRNG for deterministic exam generation
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function seededShuffle(arr, seed) {
  let shuffled = [...arr];
  let currentSeed = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    currentSeed += 7;
    const r = seededRandom(currentSeed);
    const j = Math.floor(r * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}

function generateExam(level, setNumber) {
  let levelVocabs = vocabList.filter(w => w.level === level);

  if (levelVocabs.length === 0) {
    levelVocabs = vocabList;
  }
  if (levelVocabs.length === 0) {
    levelVocabs = [
      { word: "我", pinyin: "wǒ", meaning: "tôi", level: 1, category: "Đại từ", example_zh: "我是学生。", example_vi: "tôi là học sinh." },
      { word: "你", pinyin: "nǐ", meaning: "bạn", level: 1, category: "Đại từ", example_zh: "你好吗？", example_vi: "bạn khỏe không?" },
      { word: "他", pinyin: "tā", meaning: "anh ấy", level: 1, category: "Đại từ", example_zh: "他是老师。", example_vi: "anh ấy là giáo viên." },
      { word: "是", pinyin: "shì", meaning: "là", level: 1, category: "Động từ", example_zh: "我是学生。", example_vi: "tôi là học sinh." }
    ];
  }

  const meta = HSK_LEVELS_METADATA[level] || { time: 45, questionsCount: 40 };
  const qCount = meta.questionsCount;
  let baseSeed = level * 10000 + setNumber * 500;

  const shuffledVocab = seededShuffle(levelVocabs, baseSeed);

  let listenCount = Math.round(qCount * 0.4);
  let readCount = Math.round(qCount * 0.50);

  const questions = [];

  for (let i = 0; i < qCount; i++) {
    const vocabItem = shuffledVocab[i % shuffledVocab.length];

    let section = "Phần II: Đọc hiểu";
    let isListening = false;
    let isWriting = false;

    if (i < listenCount) {
      section = "Phần I: Nghe hiểu";
      isListening = true;
    } else if (i >= listenCount + readCount) {
      section = "Phần III: Viết & Củng cố";
      isWriting = true;
    }

    let qType = "meaning";
    let qSeed = baseSeed + i * 13;

    if (isListening) {
      qType = seededRandom(qSeed) > 0.5 ? "meaning" : "character";
    } else if (isWriting) {
      qType = vocabItem.example_zh ? "sentence" : "category";
    } else {
      const rVal = seededRandom(qSeed);
      if (rVal < 0.35) {
        qType = "pinyin";
      } else if (rVal < 0.70) {
        qType = "meaning";
      } else {
        qType = "character";
      }
    }

    let questionText = "";
    let audioText = "";
    let correctValue = "";
    let distractors = [];
    let explanation = "";

    const getDistractors = (field, correctVal, count = 3) => {
      let filtered = levelVocabs.filter(v => v[field] && v[field] !== correctVal);
      if (filtered.length < count) {
        filtered = vocabList.filter(v => v[field] && v[field] !== correctVal);
      }
      const shuffledDist = seededShuffle(filtered, qSeed + 99);
      const unique = [];
      for (let x of shuffledDist) {
        if (x[field] && x[field] !== correctVal && !unique.includes(x[field])) {
          unique.push(x[field]);
        }
        if (unique.length === count) break;
      }
      while (unique.length < count) {
        unique.push(`Đáp án nhiễu ${unique.length + 1}`);
      }
      return unique;
    };

    if (qType === "meaning") {
      correctValue = vocabItem.meaning;
      distractors = getDistractors("meaning", correctValue);

      if (isListening) {
        questionText = "Nghe phát âm từ vựng tiếng Trung này và chọn nghĩa tiếng Việt chính xác nhất.";
        audioText = vocabItem.word;
      } else {
        questionText = `Từ vựng chữ Hán "${vocabItem.word}" (${vocabItem.pinyin}) có nghĩa tiếng Việt là gì?`;
      }

      explanation = `
        <h5>Giải thích chi tiết:</h5>
        <p>Từ chữ Hán <strong>${vocabItem.word}</strong> có phiên âm Pinyin là <strong>${vocabItem.pinyin}</strong> và có nghĩa là <strong>"${vocabItem.meaning}"</strong>.</p>
        <p><strong>Từ loại</strong>: ${vocabItem.category || "Chưa phân loại"}</p>
        ${vocabItem.example_zh ? `<p><strong>Ví dụ minh họa</strong>: ${vocabItem.example_zh} (${vocabItem.example_vi})</p>` : ""}
      `;
    }
    else if (qType === "character") {
      correctValue = vocabItem.word;
      distractors = getDistractors("word", correctValue);

      if (isListening) {
        questionText = "Nghe phát âm từ vựng tiếng Trung này và chọn chữ Hán viết chính xác nhất.";
        audioText = vocabItem.word;
      } else {
        questionText = `Từ vựng tiếng Trung có nghĩa "${vocabItem.meaning}" và phiên âm "${vocabItem.pinyin}" được viết bằng chữ Hán nào?`;
      }

      explanation = `
        <h5>Giải thích chi tiết:</h5>
        <p>Đáp án đúng là <strong>${vocabItem.word}</strong>. Nghĩa của từ là <strong>"${vocabItem.meaning}"</strong>, phiên âm Pinyin: <strong>${vocabItem.pinyin}</strong>.</p>
        <p><strong>Từ loại</strong>: ${vocabItem.category || "Chưa phân loại"}</p>
        ${vocabItem.example_zh ? `<p><strong>Ví dụ minh họa</strong>: ${vocabItem.example_zh} (${vocabItem.example_vi})</p>` : ""}
      `;
    }
    else if (qType === "pinyin") {
      correctValue = vocabItem.pinyin;
      distractors = getDistractors("pinyin", correctValue);
      questionText = `Phiên âm Pinyin chính xác của từ chữ Hán "${vocabItem.word}" (nghĩa: "${vocabItem.meaning}") là gì?`;

      explanation = `
        <h5>Giải thích chi tiết:</h5>
        <p>Từ chữ Hán <strong>${vocabItem.word}</strong> (nghĩa: "${vocabItem.meaning}") phát âm Pinyin chính xác là <strong>${vocabItem.pinyin}</strong>.</p>
        <p><strong>Từ loại</strong>: ${vocabItem.category || "Chưa phân loại"}</p>
        ${vocabItem.example_zh ? `<p><strong>Ví dụ minh họa</strong>: ${vocabItem.example_zh} (${vocabItem.example_vi})</p>` : ""}
      `;
    }
    else if (qType === "sentence") {
      correctValue = vocabItem.word;
      distractors = getDistractors("word", correctValue);

      const blankSentence = vocabItem.example_zh.replaceAll(vocabItem.word, " _____ ");
      questionText = `Điền từ thích hợp vào chỗ trống để hoàn thành câu dưới đây:\n\n${blankSentence}\n\n(Dịch nghĩa: "${vocabItem.example_vi}")`;

      explanation = `
        <h5>Giải thích chi tiết:</h5>
        <p>Câu hoàn chỉnh: <strong>${vocabItem.example_zh}</strong></p>
        <p>Dịch nghĩa: <strong>"${vocabItem.example_vi}"</strong></p>
        <p>Trong câu này, ta cần dùng từ <strong>${vocabItem.word}</strong> (${vocabItem.pinyin} - nghĩa là "${vocabItem.meaning}") để tạo thành câu có nghĩa hợp lý nhất.</p>
        <p><strong>Phân tích ngữ pháp</strong>: Từ loại của <strong>${vocabItem.word}</strong> là ${vocabItem.category || "Chưa phân loại"}.</p>
      `;
    }
    else if (qType === "category") {
      correctValue = vocabItem.category || "Khác";
      distractors = getDistractors("category", correctValue);
      const standardCategories = ["Danh từ", "Động từ", "Tính từ", "Phó từ", "Đại từ", "Giới từ", "Liên từ", "Trợ từ"];
      let categoryDistractors = standardCategories.filter(c => c !== correctValue);
      categoryDistractors = seededShuffle(categoryDistractors, qSeed + 45);
      distractors = categoryDistractors.slice(0, 3);

      questionText = `Từ vựng "${vocabItem.word}" (${vocabItem.pinyin}) có nghĩa "${vocabItem.meaning}" thuộc từ loại nào?`;

      explanation = `
        <h5>Giải thích chi tiết:</h5>
        <p>Từ <strong>${vocabItem.word}</strong> (${vocabItem.pinyin} - nghĩa là "${vocabItem.meaning}") thuộc từ loại <strong>${correctValue}</strong> trong ngữ pháp tiếng Trung.</p>
        ${vocabItem.example_zh ? `<p><strong>Ví dụ minh họa</strong>: ${vocabItem.example_zh} (${vocabItem.example_vi})</p>` : ""}
      `;
    }

    let choices = [correctValue, ...distractors];
    choices = seededShuffle(choices, qSeed + 101);
    const answerIndex = choices.indexOf(correctValue);

    questions.push({
      id: i + 1,
      section: section,
      question: questionText,
      audioText: audioText,
      choices: choices,
      answer: answerIndex,
      explanation: explanation
    });
  }

  return questions;
}

function switchTab(tabId) {
  // Stop flashcard autoplay
  stopAutoplay();

  // 1. Update active states in bottom navigation bar
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 2. Hide/Show main content blocks based on selected tab
  const homeViewSec = document.getElementById('home-view-section');
  const flashcardSec = document.getElementById('flashcard-section');
  const customSec = document.getElementById('custom-section');
  const examsSec = document.getElementById('hsk-exams-section');
  const lessonsSec = document.getElementById('lessons-section');

  // Helper function to set display
  const setDisp = (el, val) => { if (el) el.style.display = val; };

  if (tabId === 'home') {
    // Show home page elements
    setDisp(homeViewSec, 'block');

    // Hide learning sections
    setDisp(flashcardSec, 'none');
    setDisp(customSec, 'none');
    setDisp(examsSec, 'none');
    setDisp(lessonsSec, 'none');
  } 
  else if (tabId === 'lessons') {
    // Hide home elements
    setDisp(homeViewSec, 'none');

    // Show lessons section
    setDisp(flashcardSec, 'none');
    setDisp(customSec, 'none');
    setDisp(examsSec, 'none');
    setDisp(lessonsSec, 'block');

    // Render lessons list
    renderLessonsList();
  } 
  else if (tabId === 'exams') {
    // Hide home elements
    setDisp(homeViewSec, 'none');

    // Show exams section
    setDisp(flashcardSec, 'none');
    setDisp(customSec, 'none');
    setDisp(examsSec, 'block');
    setDisp(lessonsSec, 'none');

    // Ensure level selection is displayed first
    setDisp(document.getElementById('exam-level-selection'), 'block');
    setDisp(document.getElementById('exam-papers-list'), 'none');
    setDisp(document.getElementById('exam-player'), 'none');
    setDisp(document.getElementById('exam-result-view'), 'none');
  }
  else if (tabId === 'flashcards') {
    // Hide home elements
    setDisp(homeViewSec, 'none');

    // Show flashcards section
    setDisp(flashcardSec, 'block');
    setDisp(customSec, 'none');
    setDisp(examsSec, 'none');
    setDisp(lessonsSec, 'none');
  } 
  else if (tabId === 'dictionary') {
    // Hide home elements
    setDisp(homeViewSec, 'none');

    // Show custom/dictionary section
    setDisp(flashcardSec, 'none');
    setDisp(customSec, 'block');
    setDisp(examsSec, 'none');
    setDisp(lessonsSec, 'none');
  }

  // 3. Sync top navbar active state
  const homeBtn = document.getElementById('nav-home-btn');
  const flashcardsBtn = document.getElementById('nav-flashcards-btn');
  const customBtn = document.getElementById('nav-custom-btn');
  const examsBtn = document.getElementById('nav-exams-btn');

  if (homeBtn) homeBtn.classList.toggle('active', tabId === 'home');
  if (flashcardsBtn) flashcardsBtn.classList.toggle('active', tabId === 'flashcards');
  if (customBtn) customBtn.classList.toggle('active', tabId === 'dictionary');
  if (examsBtn) examsBtn.classList.toggle('active', tabId === 'lessons');
}

function showHomeView() {
  switchTab('home');
}

function showExamsView() {
  switchTab('lessons');
}

function loadExamPapersList(level) {
  currentExamLevel = parseInt(level);
  document.getElementById('selected-level-title').textContent = `Đề Thi HSK Cấp ${currentExamLevel}`;

  const papersGrid = document.getElementById('exam-papers-grid');
  papersGrid.innerHTML = '';

  const userKey = currentUser ? currentUser.email : 'guest';
  const progressKey = `hsk_exam_progress_${userKey}`;
  const examProgress = JSON.parse(localStorage.getItem(progressKey) || '{}');

  const meta = HSK_LEVELS_METADATA[currentExamLevel] || { time: 45, questionsCount: 40 };

  for (let s = 1; s <= 20; s++) {
    const paperId = `${currentExamLevel}_${s}`;
    const scoreRecord = examProgress[paperId];

    let statusClass = 'status-todo';
    let statusText = 'Chưa làm';
    let scoreDisplay = '';

    if (scoreRecord) {
      statusClass = 'status-done';
      statusText = scoreRecord.status === 'PASS' ? 'ĐẠT' : 'CHƯA ĐẠT';
      scoreDisplay = `<div style="font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; color: var(--accent-blue); margin-top: 4px;">Điểm số: ${scoreRecord.score}/${scoreRecord.total} (${scoreRecord.percentage}%)</div>`;
    }

    const card = document.createElement('div');
    card.className = 'exam-paper-card glass-panel';
    card.innerHTML = `
      <h3>Đề thi thử số ${s.toString().padStart(2, '0')}</h3>
      <p class="exam-paper-meta">
        <span><i class="fa-regular fa-clock"></i> ${meta.time} phút</span>
        <span><i class="fa-solid fa-clipboard-question"></i> ${meta.questionsCount} câu</span>
      </p>
      ${scoreDisplay}
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; gap: 8px;">
        <span class="exam-paper-status ${statusClass}">${statusText}</span>
        <button class="btn btn-sm btn-primary start-paper-btn" data-set="${s}">Vào thi</button>
      </div>
    `;

    card.querySelector('.start-paper-btn').addEventListener('click', () => {
      startExam(currentExamLevel, s);
    });

    papersGrid.appendChild(card);
  }
}

function startExam(level, setNumber) {
  currentExamLevel = level;
  currentExamSet = setNumber;
  currentExamQuestions = generateExam(level, setNumber);
  currentExamAnswers = Array(currentExamQuestions.length).fill(null);
  activeQuestionIndex = 0;

  document.getElementById('player-exam-title').textContent = `Đề Thi HSK ${level} - Đề số ${setNumber.toString().padStart(2, '0')}`;
  document.getElementById('player-exam-level').textContent = `HSK ${level}`;

  const meta = HSK_LEVELS_METADATA[level] || { time: 45 };
  examTotalSeconds = meta.time * 60;
  examTimeRemaining = examTotalSeconds;

  updateTimerDisplay();
  if (examTimerInterval) clearInterval(examTimerInterval);
  examTimerInterval = setInterval(() => {
    examTimeRemaining--;
    updateTimerDisplay();
    if (examTimeRemaining <= 0) {
      clearInterval(examTimerInterval);
      showToast('Hết thời gian làm bài! Hệ thống tự động nộp bài.', true);
      submitExam(true);
    }
  }, 1000);

  renderQuestionNavigator();
  renderActiveQuestion();

  document.getElementById('exam-papers-list').style.display = 'none';
  document.getElementById('exam-player').style.display = 'block';

  showToast(`Bắt đầu làm bài thi HSK ${level} - Đề ${setNumber}!`);
}

function updateTimerDisplay() {
  const timerElement = document.getElementById('exam-timer');
  if (!timerElement) return;

  const minutes = Math.floor(examTimeRemaining / 60);
  const seconds = examTimeRemaining % 60;
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  timerElement.textContent = timeStr;

  if (examTimeRemaining < 300) {
    timerElement.parentElement.classList.add('warning-time');
  } else {
    timerElement.parentElement.classList.remove('warning-time');
  }
}

function renderQuestionNavigator() {
  const navContainer = document.getElementById('player-question-nav-sections');
  navContainer.innerHTML = '';

  const sections = {};
  currentExamQuestions.forEach((q, idx) => {
    if (!sections[q.section]) {
      sections[q.section] = [];
    }
    sections[q.section].push({ q, idx });
  });

  for (let sectionName in sections) {
    const secWrap = document.createElement('div');
    secWrap.className = 'nav-section-wrap';
    secWrap.innerHTML = `<h5 class="nav-section-title" style="margin-top: 8px;">${sectionName}</h5>`;

    const grid = document.createElement('div');
    grid.className = 'nav-questions-grid';

    sections[sectionName].forEach(({ q, idx }) => {
      const btn = document.createElement('button');
      btn.className = 'q-btn';
      btn.type = 'button';
      btn.textContent = idx + 1;

      if (idx === activeQuestionIndex) {
        btn.classList.add('active');
      }
      if (currentExamAnswers[idx] !== null) {
        btn.classList.add('answered');
      }

      btn.addEventListener('click', () => {
        activeQuestionIndex = idx;
        renderActiveQuestion();
        updateNavigatorActiveState();
      });

      grid.appendChild(btn);
    });

    secWrap.appendChild(grid);
    navContainer.appendChild(secWrap);
  }
}

function updateNavigatorActiveState() {
  const buttons = document.querySelectorAll('#player-question-nav-sections .q-btn');
  buttons.forEach((btn, idx) => {
    if (idx === activeQuestionIndex) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    if (currentExamAnswers[idx] !== null) {
      btn.classList.add('answered');
    } else {
      btn.classList.remove('answered');
    }
  });
}

function renderActiveQuestion() {
  if (currentExamQuestions.length === 0) return;

  const q = currentExamQuestions[activeQuestionIndex];

  document.getElementById('active-question-number').textContent = `Câu ${activeQuestionIndex + 1} / ${currentExamQuestions.length}`;
  document.getElementById('active-question-section').textContent = q.section;

  const audioContainer = document.getElementById('question-audio-container');
  const examAudioPlayer = document.getElementById('exam-audio-player');
  if (q.audioText) {
    audioContainer.style.display = 'flex';

    // Gắn sự kiện: Bấm vào cái loa là gọi thẳng hàm offline, không cần thẻ <audio> nữa
    audioContainer.onclick = () => {
      speakText(q.audioText);
    };

  } else {
    audioContainer.style.display = 'none';
    audioContainer.onclick = null; // Gỡ sự kiện click nếu câu hỏi không có âm thanh
  }

  document.getElementById('active-question-text').innerHTML = q.question.replace(/\n/g, '<br>');

  const optionsContainer = document.getElementById('active-question-options');
  optionsContainer.innerHTML = '';

  q.choices.forEach((choice, idx) => {
    const label = document.createElement('label');
    label.className = 'option-item';
    if (currentExamAnswers[activeQuestionIndex] === idx) {
      label.classList.add('selected');
    }

    label.innerHTML = `
      <input type="radio" name="exam-option" value="${idx}" ${currentExamAnswers[activeQuestionIndex] === idx ? 'checked' : ''}>
      <span class="option-label">${String.fromCharCode(65 + idx)}. ${choice}</span>
    `;

    label.addEventListener('click', (e) => {
      currentExamAnswers[activeQuestionIndex] = idx;

      const labels = optionsContainer.querySelectorAll('.option-item');
      labels.forEach(l => l.classList.remove('selected'));
      label.classList.add('selected');

      updateNavigatorActiveState();
    });

    optionsContainer.appendChild(label);
  });

  document.getElementById('exam-prev-btn').disabled = (activeQuestionIndex === 0);

  const nextBtn = document.getElementById('exam-next-btn');
  if (activeQuestionIndex === currentExamQuestions.length - 1) {
    nextBtn.innerHTML = `Hoàn thành <i class="fa-solid fa-circle-check"></i>`;
  } else {
    nextBtn.innerHTML = `Câu tiếp theo <i class="fa-solid fa-chevron-right"></i>`;
  }
}

function submitExam(isAuto = false) {
  if (!isAuto) {
    const unansweredCount = currentExamAnswers.filter(ans => ans === null).length;
    let message = 'Bạn có chắc chắn muốn nộp bài thi?';
    if (unansweredCount > 0) {
      message = `Bạn còn ${unansweredCount} câu hỏi chưa trả lời. Bạn có muốn nộp bài thi ngay không?`;
    }
    if (!confirm(message)) return;
  }

  if (examTimerInterval) clearInterval(examTimerInterval);

  let correctCount = 0;
  currentExamQuestions.forEach((q, idx) => {
    if (currentExamAnswers[idx] === q.answer) {
      correctCount++;
    }
  });

  const totalCount = currentExamQuestions.length;
  const percentage = Math.round((correctCount / totalCount) * 100);
  const timeSpentSeconds = examTotalSeconds - examTimeRemaining;
  const spentMinutes = Math.floor(timeSpentSeconds / 60);
  const spentSeconds = timeSpentSeconds % 60;
  const timeSpentStr = `${spentMinutes.toString().padStart(2, '0')}:${spentSeconds.toString().padStart(2, '0')}`;

  const status = percentage >= 60 ? 'PASS' : 'FAIL';

  const userKey = currentUser ? currentUser.email : 'guest';
  const progressKey = `hsk_exam_progress_${userKey}`;
  const examProgress = JSON.parse(localStorage.getItem(progressKey) || '{}');
  const paperId = `${currentExamLevel}_${currentExamSet}`;

  examProgress[paperId] = {
    score: correctCount,
    total: totalCount,
    percentage: percentage,
    timeSpent: timeSpentStr,
    status: status,
    date: new Date().toISOString()
  };
  localStorage.setItem(progressKey, JSON.stringify(examProgress));

  renderExamResults(correctCount, totalCount, percentage, timeSpentStr, status);

  document.getElementById('exam-player').style.display = 'none';
  document.getElementById('exam-result-view').style.display = 'block';

  showToast(status === 'PASS' ? 'Chúc mừng! Bạn đã ĐẠT bài thi! 🎉' : 'Rất tiếc! Bạn chưa đạt điểm chuẩn.', status === 'FAIL');
}

function renderExamResults(correct, total, percentage, timeSpent, status) {
  document.getElementById('result-exam-name').textContent = `Đề thi: Đề Thi HSK ${currentExamLevel} - Đề số ${currentExamSet.toString().padStart(2, '0')}`;
  document.getElementById('result-score').textContent = `${correct} / ${total}`;
  document.getElementById('result-percentage').textContent = `${percentage}%`;
  document.getElementById('result-time-spent').textContent = timeSpent;

  const badge = document.getElementById('result-status-badge');
  if (status === 'PASS') {
    badge.textContent = 'ĐẠT';
    badge.className = 'result-status-badge pass';
  } else {
    badge.textContent = 'TRƯỢT';
    badge.className = 'result-status-badge fail';
  }

  const reviewContainer = document.getElementById('review-questions-list');
  reviewContainer.innerHTML = '';

  currentExamQuestions.forEach((q, idx) => {
    const userAnswerIndex = currentExamAnswers[idx];
    const isCorrect = userAnswerIndex === q.answer;

    const qItem = document.createElement('div');
    qItem.className = 'review-q-item';

    const statusLabel = isCorrect
      ? '<span class="badge badge-category" style="background: var(--success-bg); color: var(--success); font-weight:700;"><i class="fa-solid fa-circle-check"></i> ĐÚNG</span>'
      : (userAnswerIndex === null
        ? '<span class="badge badge-category" style="background: var(--border-glass); color: var(--text-muted); font-weight:700;"><i class="fa-regular fa-circle"></i> BỎ QUA</span>'
        : '<span class="badge badge-category" style="background: var(--danger-bg); color: var(--danger); font-weight:700;"><i class="fa-solid fa-circle-xmark"></i> SAI</span>');

    qItem.innerHTML = `
      <div class="review-q-header">
        <span class="q-num">Câu ${idx + 1} (${q.section})</span>
        ${statusLabel}
      </div>
      <p class="question-text" style="font-size:1.1rem; margin-bottom:12px;">${q.question.replace(/\n/g, '<br>')}</p>
      <div class="review-options-list">
      </div>
      <div class="explanation-box">
        ${q.explanation}
      </div>
    `;

    const optionsGrid = qItem.querySelector('.review-options-list');
    q.choices.forEach((choice, optIdx) => {
      const optDiv = document.createElement('div');
      optDiv.className = 'rev-option';

      if (optIdx === q.answer) {
        optDiv.classList.add('correct');
      } else if (optIdx === userAnswerIndex) {
        optDiv.classList.add('wrong');
      }

      let prefix = '';
      if (optIdx === q.answer) {
        prefix = '<i class="fa-solid fa-check" style="margin-right: 8px;"></i> ';
      } else if (optIdx === userAnswerIndex) {
        prefix = '<i class="fa-solid fa-xmark" style="margin-right: 8px;"></i> ';
      }

      optDiv.innerHTML = `${prefix}${String.fromCharCode(65 + optIdx)}. ${choice}`;
      optionsGrid.appendChild(optDiv);
    });

    reviewContainer.appendChild(qItem);
  });
}

function initExams() {
  const navHomeBtn = document.getElementById('nav-home-btn');
  const navFlashcardsBtn = document.getElementById('nav-flashcards-btn');
  const navCustomBtn = document.getElementById('nav-custom-btn');
  const navExamsBtn = document.getElementById('nav-exams-btn');

  if (navHomeBtn) {
    navHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('home');
    });
  }

  if (navFlashcardsBtn) {
    navFlashcardsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('flashcards');
    });
  }

  if (navCustomBtn) {
    navCustomBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('dictionary');
    });
  }

  if (navExamsBtn) {
    navExamsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('lessons');
    });
  }

  const navBrand = document.querySelector('.nav-brand');
  if (navBrand) {
    navBrand.addEventListener('click', () => {
      switchTab('home');
    });
  }

  const levelCards = document.querySelectorAll('.level-card');
  levelCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const level = card.getAttribute('data-level');
      if (level) {
        document.getElementById('exam-level-selection').style.display = 'none';
        document.getElementById('exam-papers-list').style.display = 'block';
        loadExamPapersList(level);
      }
    });
  });

  const backToLevelsBtn = document.getElementById('back-to-levels-btn');
  if (backToLevelsBtn) {
    backToLevelsBtn.addEventListener('click', () => {
      document.getElementById('exam-papers-list').style.display = 'none';
      document.getElementById('exam-level-selection').style.display = 'block';
    });
  }

  const exitResultBtn = document.getElementById('exit-result-btn');
  if (exitResultBtn) {
    exitResultBtn.addEventListener('click', () => {
      document.getElementById('exam-result-view').style.display = 'none';
      document.getElementById('exam-papers-list').style.display = 'block';
      loadExamPapersList(currentExamLevel);
    });
  }

  const playQuestionAudioBtn = document.getElementById('play-question-audio');
  if (playQuestionAudioBtn) {
    playQuestionAudioBtn.addEventListener('click', () => {
      const examAudioPlayer = document.getElementById('exam-audio-player');
      if (examAudioPlayer && examAudioPlayer.src) {
        showToast("Đang phát âm thanh câu hỏi...", false);
        examAudioPlayer.play().catch(err => {
          console.warn("Failed to play native exam audio player, falling back to speakText:", err);
          const q = currentExamQuestions[activeQuestionIndex];
          if (q && q.audioText) speakText(q.audioText);
        });
      } else {
        const q = currentExamQuestions[activeQuestionIndex];
        if (q && q.audioText) {
          showToast("Đang tải phát âm câu hỏi...", false);
          speakText(q.audioText);
        } else {
          showToast("Lỗi: Không tìm thấy nội dung âm thanh câu hỏi!", true);
        }
      }
    });
  }

  const prevBtn = document.getElementById('exam-prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (activeQuestionIndex > 0) {
        activeQuestionIndex--;
        renderActiveQuestion();
        updateNavigatorActiveState();
      }
    });
  }

  const nextBtn = document.getElementById('exam-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (activeQuestionIndex < currentExamQuestions.length - 1) {
        activeQuestionIndex++;
        renderActiveQuestion();
        updateNavigatorActiveState();
      } else {
        submitExam();
      }
    });
  }

  const submitBtn = document.getElementById('exam-submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      submitExam();
    });
  }
}

// --- NEW HELPER FUNCTIONS FOR STATS, TYPING MODE & CUSTOM LISTS ---

function setStudyMode(mode) {
  studyMode = mode;
  const modeFlipBtn = document.getElementById('mode-flip-btn');
  const modeTypeBtn = document.getElementById('mode-type-btn');
  const cardViewportEl = document.querySelector('.card-viewport');

  if (cardViewportEl) {
    if (mode === 'type') {
      cardViewportEl.classList.add('typing-mode-active');
    } else {
      cardViewportEl.classList.remove('typing-mode-active');
    }
  }

  if (modeFlipBtn && modeTypeBtn) {
    if (mode === 'flip') {
      modeFlipBtn.classList.add('active-mode');
      modeFlipBtn.style.background = 'var(--accent-blue)';
      modeFlipBtn.style.color = 'white';

      modeTypeBtn.classList.remove('active-mode');
      modeTypeBtn.style.background = 'transparent';
      modeTypeBtn.style.color = 'var(--text-secondary)';

      document.getElementById('flashcard-card').style.display = 'block';
      document.getElementById('typing-card-container').style.display = 'none';
    } else {
      modeTypeBtn.classList.add('active-mode');
      modeTypeBtn.style.background = 'var(--accent-blue)';
      modeTypeBtn.style.color = 'white';

      modeFlipBtn.classList.remove('active-mode');
      modeFlipBtn.style.background = 'transparent';
      modeFlipBtn.style.color = 'var(--text-secondary)';

      document.getElementById('flashcard-card').style.display = 'none';
      document.getElementById('typing-card-container').style.display = 'flex';
    }
  }

  stopAutoplay();
  renderActiveCard();
}

function initCustomLists() {
  const userKey = currentUser ? currentUser.email : 'guest';
  const savedLists = localStorage.getItem(`custom_lists_${userKey}`);
  if (savedLists) {
    try {
      customLists = JSON.parse(savedLists);
    } catch (e) {
      customLists = ['Mặc định'];
    }
  } else {
    customLists = ['Mặc định'];
  }

  // Auto-collect categories from loaded custom words
  const customWords = vocabList.filter(w => w.isCustom);
  customWords.forEach(w => {
    const cat = w.category || 'Mặc định';
    if (!customLists.includes(cat)) {
      customLists.push(cat);
    }
  });

  if (!customLists.includes('Mặc định')) {
    customLists.unshift('Mặc định');
  }

  if (!customLists.includes(activeCustomList)) {
    activeCustomList = customLists[0] || 'Mặc định';
  }
}

function renderCustomLists() {
  const container = document.getElementById('custom-lists-pill-container');
  if (!container) return;

  container.innerHTML = '';

  customLists.forEach(name => {
    const count = vocabList.filter(w => w.isCustom && w.category === name).length;

    const pill = document.createElement('div');
    pill.className = 'list-pill';
    if (name === activeCustomList) {
      pill.classList.add('active-list');
    }

    const isDefault = name === 'Mặc định';
    const deleteHtml = isDefault
      ? ''
      : `<button class="list-action-btn delete-btn" data-name="${name}" title="Xóa danh sách"><i class="fa-solid fa-trash-can"></i></button>`;

    pill.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <i class="fa-regular fa-folder" style="color: ${name === activeCustomList ? 'var(--accent-blue)' : 'inherit'};"></i>
        <span class="list-name-text">${name}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="list-word-count">${count}</span>
        <div class="list-pill-actions">
          <button class="list-action-btn study-btn" data-name="${name}" title="Học danh sách này"><i class="fa-solid fa-graduation-cap"></i></button>
          ${deleteHtml}
        </div>
      </div>
    `;

    pill.addEventListener('click', (e) => {
      if (e.target.closest('.list-action-btn')) return;
      selectCustomList(name);
    });

    pill.querySelector('.study-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      studyCustomList(name);
    });

    const delBtn = pill.querySelector('.delete-btn');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCustomList(name);
      });
    }

    container.appendChild(pill);
  });

  updateCategorySelectOptions();
}

function selectCustomList(name) {
  activeCustomList = name;

  const formTitle = document.getElementById('custom-form-title');
  const listTitle = document.getElementById('custom-list-title');
  if (formTitle) formTitle.innerHTML = `<i class="fa-solid fa-plus-circle text-primary"></i> Thêm vào: ${name}`;
  if (listTitle) listTitle.innerHTML = `<i class="fa-solid fa-list-check text-success"></i> Danh sách: ${name}`;

  renderCustomLists();
  renderCustomWordsTable();
}

function studyCustomList(name) {
  studyCustomCategory = name;

  // Toggle DOM views
  const selectionView = document.getElementById('deck-selection-view');
  const studyView = document.getElementById('flashcard-study-view');
  if (selectionView) selectionView.style.display = 'none';
  if (studyView) studyView.style.display = 'block';

  const titleEl = document.getElementById('study-deck-title');
  const descEl = document.getElementById('study-deck-desc');
  if (titleEl) titleEl.textContent = `Sổ tay: ${name}`;
  if (descEl) descEl.textContent = `Đang học danh sách tự biên soạn: ${name}`;

  // Clear level tabs active states
  const levelTabsContainer = document.getElementById('level-tabs');
  if (levelTabsContainer) {
    levelTabsContainer.querySelectorAll('.level-tab').forEach(t => t.classList.remove('active'));
  }

  const statusFilterSelect = document.getElementById('status-filter');
  if (statusFilterSelect) {
    statusFilterSelect.value = 'custom';
  }
  activeStatus = 'custom';

  applyFilters();

  const flashcardSection = document.getElementById('flashcard-section');
  if (flashcardSection) {
    flashcardSection.scrollIntoView({ behavior: 'smooth' });
  }

  showToast(`Đang học danh sách: ${name}! 📝`);
}

function deleteCustomList(name) {
  if (name === 'Mặc định') return;
  if (!confirm(`Bạn có chắc chắn muốn xóa danh sách từ vựng "${name}"? Tất cả từ vựng trong danh sách này sẽ bị xóa khỏi cơ sở dữ liệu.`)) return;

  const wordsToMigrate = vocabList.filter(w => w.isCustom && w.category === name);

  Promise.all(wordsToMigrate.map(w => {
    return fetch(API_BASE_URL + '/api/vocabulary/' + w.id, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    })
      .catch(err => console.error("Error deleting word during list delete:", err));
  })).then(() => {
    customLists = customLists.filter(l => l !== name);
    const userKey = currentUser ? currentUser.email : 'guest';
    localStorage.setItem(`custom_lists_${userKey}`, JSON.stringify(customLists));

    vocabList = vocabList.filter(w => !(w.isCustom && w.category === name));

    if (activeCustomList === name) {
      activeCustomList = 'Mặc định';
    }

    if (studyCustomCategory === name) {
      studyCustomCategory = null;
    }

    selectCustomList(activeCustomList);
    updateStats();
    applyFilters();
    showToast(`Đã xóa danh sách: ${name}`);
  });
}

function updateCategorySelectOptions() {
  const select = document.getElementById('input-category-select');
  if (!select) return;
  select.innerHTML = '';
  customLists.forEach(list => {
    const opt = document.createElement('option');
    opt.value = list;
    opt.textContent = list;
    if (list === activeCustomList) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
}

function renderActiveCardTyping(current) {
  const typeLevel = document.getElementById('type-card-level');
  const typeCategory = document.getElementById('type-card-category');
  const typeMeaning = document.getElementById('type-card-meaning');

  if (typeLevel) typeLevel.textContent = current.isCustom ? 'Cá nhân' : `HSK ${current.level}`;
  if (typeCategory) typeCategory.textContent = current.category || 'Chưa phân loại';
  if (typeMeaning) typeMeaning.textContent = current.meaning;

  // Reset states
  typingAttempts = 3;
  isTypingAnswerFinished = false;

  // Reset dots styling
  [1, 2, 3].forEach(d => {
    const dot = document.getElementById(`attempt-dot-${d}`);
    if (dot) {
      dot.className = 'attempt-dot active-dot';
    }
  });

  const input = document.getElementById('type-answer-input');
  if (input) {
    input.value = '';
    input.disabled = false;
    input.className = '';
  }

  const feedback = document.getElementById('type-feedback-msg');
  if (feedback) {
    feedback.textContent = '';
    feedback.className = '';
  }

  const details = document.getElementById('type-revealed-details');
  if (details) {
    details.style.display = 'none';
  }

  const hintBtn = document.getElementById('type-hint-pinyin-btn');
  if (hintBtn) {
    hintBtn.innerHTML = '<i class="fa-solid fa-eye"></i> Gợi ý Pinyin';
    hintBtn.disabled = false;
  }

  const checkBtn = document.getElementById('type-check-btn');
  if (checkBtn) {
    checkBtn.innerHTML = 'Kiểm tra';
  }
}

function handleTypingCheck() {
  if (filteredList.length === 0) return;
  const current = filteredList[currentIndex];

  if (isTypingAnswerFinished) {
    nextCard();
    return;
  }

  const input = document.getElementById('type-answer-input');
  const feedback = document.getElementById('type-feedback-msg');
  const checkBtn = document.getElementById('type-check-btn');

  if (!input || !feedback) return;

  const answer = input.value.trim().toLowerCase();
  const correctAnswer = current.word.trim();

  if (answer === '') {
    feedback.textContent = 'Vui lòng nhập câu trả lời!';
    feedback.style.color = 'var(--warning)';
    return;
  }

  if (answer === correctAnswer) {
    isTypingAnswerFinished = true;
    input.disabled = true;
    input.className = 'correct-glow';

    feedback.textContent = 'Chính xác! 🎉';
    feedback.style.color = 'var(--success)';

    speakText(current.word);

    if (!current.isMemorized) {
      toggleWordMemorized(current.id);
    }

    if (current.isWrong) {
      setWordWrong(current.id, false);
    }

    showRevealedDetails(current);

    if (checkBtn) checkBtn.innerHTML = 'Tiếp tục <i class="fa-solid fa-chevron-right"></i>';
  } else {
    typingAttempts--;

    input.classList.remove('shake');
    void input.offsetWidth; // Trigger reflow to restart animation
    input.classList.add('shake');

    input.className = 'incorrect-glow';
    setTimeout(() => {
      if (!isTypingAnswerFinished) {
        input.className = '';
      }
    }, 500);

    const activeDots = document.querySelectorAll('.attempts-indicator .attempt-dot.active-dot');
    if (activeDots.length > 0) {
      activeDots[activeDots.length - 1].classList.remove('active-dot');
    }

    if (typingAttempts > 0) {
      feedback.textContent = `Chưa đúng! Bạn còn ${typingAttempts} lượt thử.`;
      feedback.style.color = 'var(--danger)';
    } else {
      isTypingAnswerFinished = true;
      input.disabled = true;
      input.className = 'incorrect-glow';

      feedback.textContent = `Sai rồi! Lượt học đã kết thúc.`;
      feedback.style.color = 'var(--danger)';

      if (current.isMemorized) {
        toggleWordMemorized(current.id);
      }

      if (!current.isWrong) {
        setWordWrong(current.id, true);
      }

      showRevealedDetails(current);

      if (checkBtn) checkBtn.innerHTML = 'Tiếp tục <i class="fa-solid fa-chevron-right"></i>';
    }
  }
}

function showRevealedDetails(current) {
  const details = document.getElementById('type-revealed-details');
  if (!details) return;

  const typeRevWord = document.getElementById('type-revealed-word');
  const typeRevPinyin = document.getElementById('type-revealed-pinyin');

  if (typeRevWord) typeRevWord.textContent = current.word;
  if (typeRevPinyin) typeRevPinyin.textContent = current.pinyin;

  const exBox = document.getElementById('type-revealed-example-box');
  const exZh = document.getElementById('type-revealed-example-zh');
  const exVi = document.getElementById('type-revealed-example-vi');

  if (current.example_zh) {
    if (exZh) exZh.textContent = current.example_zh;
    if (exVi) exVi.textContent = current.example_vi || '';
    if (exBox) exBox.style.display = 'block';
  } else {
    if (exBox) exBox.style.display = 'none';
  }

  details.style.display = 'flex';
}

async function setWordWrong(id, isWrong) {
  if (!currentUser) {
    const index = vocabList.findIndex(w => w.id === id);
    if (index !== -1) {
      vocabList[index].isWrong = isWrong;

      const guestProgress = JSON.parse(localStorage.getItem('guest_progress') || '{}');
      if (!guestProgress[id]) guestProgress[id] = {};
      guestProgress[id].isWrong = isWrong;
      localStorage.setItem('guest_progress', JSON.stringify(guestProgress));

      updateStats();
    }
    return;
  }

  try {
    const response = await fetch(API_BASE_URL + '/api/vocabulary/set-wrong', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id, isWrong }),
      credentials: 'include'
    });
    if (response.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('session_token');
      currentUser = null;
      renderUserProfile();
      showToast('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.', true);
      const index = vocabList.findIndex(w => w.id === id);
      if (index !== -1) {
        vocabList[index].isWrong = isWrong;
        const guestProgress = JSON.parse(localStorage.getItem('guest_progress') || '{}');
        if (!guestProgress[id]) guestProgress[id] = {};
        guestProgress[id].isWrong = isWrong;
        localStorage.setItem('guest_progress', JSON.stringify(guestProgress));
        updateStats();
      }
      return;
    }
    if (!response.ok) throw new Error('Lỗi cập nhật trạng thái sai');
    const updatedWord = await response.json();

    const index = vocabList.findIndex(w => w.id === updatedWord.id);
    if (index !== -1) {
      Object.assign(vocabList[index], updatedWord);
      updateStats();
    }
  } catch (error) {
    console.error('API Error:', error);
    const index = vocabList.findIndex(w => w.id === id);
    if (index !== -1) {
      vocabList[index].isWrong = isWrong;
      updateStats();
    }
  }
}

// --- AI CHATBOT CONTROLLER ---
function initChatbot() {
  const toggleBtn = document.getElementById('chatbot-toggle-btn');
  const panel = document.getElementById('chatbot-panel');
  const closeBtn = document.getElementById('chatbot-close-btn');
  const sendBtn = document.getElementById('chatbot-send-btn');
  const input = document.getElementById('chatbot-input');
  const messagesContainer = document.getElementById('chatbot-messages');
  const typingIndicator = document.getElementById('chatbot-typing');
  const badge = document.getElementById('chatbot-badge');

  const newBtn = document.getElementById('chatbot-new-btn');
  const historyBtn = document.getElementById('chatbot-history-btn');

  if (!toggleBtn || !panel || !closeBtn || !sendBtn || !input || !messagesContainer || !typingIndicator) {
    return;
  }

  let chatHistory = [];
  let activeThreadId = null;

  // Global callback to update chatbot buttons on login
  window.updateChatbotOnLogin = function() {
    if (newBtn) newBtn.style.display = 'flex';
    if (historyBtn) historyBtn.style.display = 'flex';
    
    // Attempt to reload active thread or populate chatbot widget with latest cached thread
    activeThreadId = sessionStorage.getItem('hongtai_active_thread_id');
    if (activeThreadId) {
      loadActiveThread();
    }
  };

  // Global callback to migrate guest chats when logged in
  window.migrateGuestChatHistory = async function() {
    if (chatHistory.length === 0) return;
    try {
      const response = await fetch(API_BASE_URL + '/api/chat/migrate', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ messages: chatHistory }),
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.threadId) {
          activeThreadId = data.threadId;
          sessionStorage.setItem('hongtai_active_thread_id', activeThreadId);
          if (newBtn) newBtn.style.display = 'flex';
          if (historyBtn) historyBtn.style.display = 'flex';
          showToast('Đã đồng bộ cuộc hội thoại vào tài khoản của bạn! 💾');
        }
      }
    } catch (e) {
      console.warn('Failed to migrate guest chat history:', e);
    }
  };

  // Global callback to reset chatbot panel on logout
  window.resetChatbotOnLogout = function() {
    activeThreadId = null;
    sessionStorage.removeItem('hongtai_active_thread_id');
    chatHistory = [];
    messagesContainer.innerHTML = `
      <div class="chat-message bot">
        Chào bạn! Tôi là **Trợ lý AI Hongtai** 🐼. Bạn cần tôi hỗ trợ giải nghĩa từ vựng HSK, sửa phát âm Pinyin hay luyện ngữ pháp tiếng Trung hôm nay không?
      </div>
    `;
    if (newBtn) newBtn.style.display = 'none';
    if (historyBtn) historyBtn.style.display = 'none';
  };

  // Toggle header action buttons based on user authentication
  if (currentUser) {
    if (newBtn) newBtn.style.display = 'flex';
    if (historyBtn) historyBtn.style.display = 'flex';
    
    // Load last active thread if stored in sessionStorage (tab-persistent)
    activeThreadId = sessionStorage.getItem('hongtai_active_thread_id');
    if (activeThreadId) {
      loadActiveThread();
    }
  } else {
    if (newBtn) newBtn.style.display = 'none';
    if (historyBtn) historyBtn.style.display = 'none';
  }

  // Load active thread messages from backend
  async function loadActiveThread() {
    try {
      const response = await fetch(API_BASE_URL + `/api/chat/threads/${activeThreadId}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (response.ok) {
        const thread = await response.json();
        messagesContainer.innerHTML = '';
        
        // Load messages history
        chatHistory = (thread.messages || []).map(m => ({
          role: m.role,
          content: m.content
        }));
        
        chatHistory.forEach(msg => {
          appendChatMessage(msg.role, msg.content);
        });
        
        if (badge) badge.style.display = 'none';
        scrollChatToBottom();

        // Cache messages for this thread
        if (currentUser) {
          localStorage.setItem('hongtai_thread_messages_cache_' + currentUser.email + '_' + activeThreadId, JSON.stringify(thread));
        }
      } else {
        throw new Error('Failed to load active thread');
      }
    } catch (e) {
      console.warn('Failed to load active chat thread:', e);
      if (currentUser) {
        const cached = localStorage.getItem('hongtai_thread_messages_cache_' + currentUser.email + '_' + activeThreadId);
        if (cached) {
          const thread = JSON.parse(cached);
          messagesContainer.innerHTML = '';
          chatHistory = (thread.messages || []).map(m => ({
            role: m.role,
            content: m.content
          }));
          chatHistory.forEach(msg => {
            appendChatMessage(msg.role, msg.content);
          });
          if (badge) badge.style.display = 'none';
          scrollChatToBottom();
          return;
        }
      }
      // If thread has been deleted or is invalid, reset local state
      sessionStorage.removeItem('hongtai_active_thread_id');
      activeThreadId = null;
    }
  }

  // Toggle Chat Panel visibility
  toggleBtn.addEventListener('click', () => {
    const isHidden = panel.style.display === 'none';
    panel.style.display = isHidden ? 'flex' : 'none';
    if (isHidden) {
      if (badge) badge.style.display = 'none';
      input.focus();
      scrollChatToBottom();
    }
  });

  closeBtn.addEventListener('click', () => {
    panel.style.display = 'none';
  });

  // Header Actions listeners
  if (newBtn) {
    newBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      activeThreadId = null;
      sessionStorage.removeItem('hongtai_active_thread_id');
      chatHistory = [];
      messagesContainer.innerHTML = `
        <div class="chat-message bot">
          Chào bạn! Tôi là **Trợ lý AI Hongtai** 🐼. Bạn cần tôi hỗ trợ giải nghĩa từ vựng HSK, sửa phát âm Pinyin hay luyện ngữ pháp tiếng Trung hôm nay không?
        </div>
      `;
      showToast('Đã bắt đầu cuộc hội thoại mới.');
      scrollChatToBottom();
    });
  }

  if (historyBtn) {
    historyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.open('/chat-history.html', '_blank');
    });
  }

  // Send message events
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  // Helper to format Markdown-like syntax to HTML
  function formatMarkdown(text) {
    if (!text) return '';
    // Escape HTML to prevent XSS
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold: **text** -> <strong>text</strong>
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Line breaks: \n -> <br>
    escaped = escaped.replace(/\n/g, '<br>');

    return escaped;
  }

  function appendChatMessage(role, content) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${role === 'assistant' ? 'bot' : 'user'}`;

    if (role === 'assistant') {
      msgDiv.innerHTML = formatMarkdown(content);
    } else {
      msgDiv.textContent = content;
    }

    messagesContainer.appendChild(msgDiv);
  }

  function scrollChatToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async function sendMessage() {
    const content = input.value.trim();
    if (!content) return;

    // Clear input
    input.value = '';

    // Append user message locally
    appendChatMessage('user', content);
    chatHistory.push({ role: 'user', content });

    scrollChatToBottom();

    // Show typing indicator
    typingIndicator.style.display = 'flex';
    scrollChatToBottom();

    try {
      const payload = {
        messages: chatHistory
      };
      if (activeThreadId) {
        payload.threadId = activeThreadId;
      }

      const response = await fetch(API_BASE_URL + '/api/chat', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      typingIndicator.style.display = 'none';

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      const reply = data.reply || 'Xin lỗi bạn, tôi không thể xử lý yêu cầu lúc này.';

      appendChatMessage('assistant', reply);
      chatHistory.push({ role: 'assistant', content: reply });
      
      // Save thread state if returned (persistent backend thread)
      if (data.threadId) {
        activeThreadId = data.threadId;
        sessionStorage.setItem('hongtai_active_thread_id', activeThreadId);

        // Cache messages!
        if (currentUser) {
          const threadData = {
            id: activeThreadId,
            messages: chatHistory.map(m => ({ role: m.role, content: m.content, timestamp: new Date().toISOString() }))
          };
          localStorage.setItem('hongtai_thread_messages_cache_' + currentUser.email + '_' + activeThreadId, JSON.stringify(threadData));
          
          let cachedThreads = [];
          const rawCached = localStorage.getItem('hongtai_threads_cache_' + currentUser.email);
          if (rawCached) {
            cachedThreads = JSON.parse(rawCached);
          }
          const existingIdx = cachedThreads.findIndex(t => t.id === activeThreadId);
          if (existingIdx !== -1) {
            cachedThreads[existingIdx].title = chatHistory[0]?.content?.substring(0, 30) || 'Cuộc trò chuyện';
          } else {
            cachedThreads.unshift({
              id: activeThreadId,
              title: chatHistory[0]?.content?.substring(0, 30) || 'Cuộc trò chuyện',
              createdAt: new Date().toISOString()
            });
          }
          localStorage.setItem('hongtai_threads_cache_' + currentUser.email, JSON.stringify(cachedThreads));
        }
      }

    } catch (err) {
      typingIndicator.style.display = 'none';
      console.error('Chatbot error:', err);
      appendChatMessage('assistant', 'Có lỗi kết nối xảy ra. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau!');
    }

    scrollChatToBottom();
  }
}

// --- LESSONS VIEW CONTROLLER ---
let activeLessonsLevel = 1;
let activeLessonsCurriculum = 'hsk';

const HSK_LESSONS_METADATA = {
  1: [
    { id: 1, title: 'Bài 1: Chào hỏi - 你好', desc: 'Học cách chào hỏi cơ bản, từ vựng thông dụng và cách nói lời xin lỗi.', startIdx: 0, endIdx: 15 },
    { id: 2, title: 'Bài 2: Cảm ơn - 谢谢你', desc: 'Học cách bày tỏ lòng biết ơn, nói lời tạm biệt và các đại từ chỉ bạn bè.', startIdx: 15, endIdx: 30 },
    { id: 3, title: 'Bài 3: Bạn tên là gì? - 你叫什么名字', desc: 'Học cách tự giới thiệu bản thân, quốc tịch, tên tuổi và nghề nghiệp.', startIdx: 30, endIdx: 45 },
    { id: 4, title: 'Bài 4: Cô ấy là giáo viên của tôi - 她是我的老师', desc: 'Học cách nói về mối quan hệ, nghề nghiệp và giới thiệu người khác.', startIdx: 45, endIdx: 60 },
    { id: 5, title: 'Bài 5: Gia đình tôi có 4 người - 我家有四口人', desc: 'Học cách đếm số, giới thiệu các thành viên trong gia đình.', startIdx: 60, endIdx: 75 },
    { id: 6, title: 'Bài 6: Tôi biết nói tiếng Trung - 我会说汉语', desc: 'Nói về khả năng, kỹ năng và các ngôn ngữ phổ biến.', startIdx: 75, endIdx: 90 },
    { id: 7, title: 'Bài 7: Hôm nay là thứ mấy? - 今天星期几', desc: 'Cách hỏi và trả lời về thời gian, ngày tháng trong tuần.', startIdx: 90, endIdx: 105 },
    { id: 8, title: 'Bài 8: Tôi muốn mua quả táo - 我想买苹果', desc: 'Học cách mua sắm, hỏi giá tiền và các loại hoa quả cơ bản.', startIdx: 105, endIdx: 120 },
    { id: 9, title: 'Bài 9: Thời tiết hôm nay thế nào? - 今天天气怎么样', desc: 'Mô tả thời tiết, nhiệt độ và các trạng thái tự nhiên.', startIdx: 120, endIdx: 135 },
    { id: 10, title: 'Bài 10: Tôi đang xem phim - 我在看电影', desc: 'Diễn tả các hành động đang xảy ra và sở thích giải trí.', startIdx: 135, endIdx: 150 }
  ],
  2: [
    { id: 1, title: 'Bài 1: Cuộc sống hàng ngày - 日常生活', desc: 'Học từ vựng mô tả thói quen sinh hoạt và ăn uống hàng ngày.', startIdx: 0, endIdx: 20 },
    { id: 2, title: 'Bài 2: Thể thao và Sức khỏe - 运动与健康', desc: 'Từ vựng các môn thể thao, rèn luyện thân thể và cảm giác cơ thể.', startIdx: 20, endIdx: 40 },
    { id: 3, title: 'Bài 3: Phương tiện giao thông - 交通工具', desc: 'Học từ vựng du lịch, các phương tiện đi lại như tàu hỏa, máy bay.', startIdx: 40, endIdx: 60 },
    { id: 4, title: 'Bài 4: Sở thích và giải trí - 兴趣与娱乐', desc: 'Thảo luận về âm nhạc, phim ảnh, đọc sách và các hoạt động thư giãn.', startIdx: 60, endIdx: 80 }
  ],
  3: [
    { id: 1, title: 'Bài 1: Giao tiếp văn phòng - 办公室', desc: 'Học từ vựng liên quan đến công việc, đồng nghiệp và công sở.', startIdx: 0, endIdx: 25 },
    { id: 2, title: 'Bài 2: Kỳ nghỉ lý thú - 快乐假期', desc: 'Học từ vựng đi du lịch nước ngoài, hỏi đường và trải nghiệm văn hóa.', startIdx: 25, endIdx: 50 },
    { id: 3, title: 'Bài 3: Mua sắm và Ẩm thực - 购物与美食', desc: 'Đặt món ăn tại nhà hàng, từ vựng các món ăn Trung Hoa nổi tiếng.', startIdx: 50, endIdx: 75 }
  ]
};

function renderLessonsList() {
  const grid = document.getElementById('lessons-cards-grid');
  const objectivesText = document.getElementById('lessons-objectives-text');
  const lessonsLevelContainer = document.getElementById('lessons-level-pills-container');

  if (!grid) return;

  grid.innerHTML = '';

  if (activeLessonsCurriculum === 'yct') {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; color: var(--text-muted); font-style: italic;">
        Giáo trình YCT (Trẻ em) đang được biên soạn! Vui lòng ôn tập giáo trình HSK.
      </div>
    `;
    if (objectivesText) objectivesText.textContent = 'Mục tiêu: Đang cập nhật nội dung cho thiếu nhi...';
    if (lessonsLevelContainer) lessonsLevelContainer.style.display = 'none';
    return;
  }

  if (lessonsLevelContainer) lessonsLevelContainer.style.display = 'flex';

  // Update objectives text
  if (objectivesText) {
    if (activeLessonsLevel === 1) objectivesText.textContent = 'Mục tiêu: Sơ cấp dành cho người mới bắt đầu (150 từ vựng cơ bản)';
    else if (activeLessonsLevel === 2) objectivesText.textContent = 'Mục tiêu: Sơ cấp nâng cao, giao tiếp đời sống cơ bản (300 từ vựng)';
    else if (activeLessonsLevel === 3) objectivesText.textContent = 'Mục tiêu: Trung cấp, giao tiếp tự tin các chủ đề học tập/công việc (600 từ vựng)';
    else objectivesText.textContent = `Mục tiêu: Ôn tập từ vựng HSK Cấp ${activeLessonsLevel}`;
  }

  // Filter HSK level vocabulary
  const levelVocabs = vocabList.filter(w => !w.isCustom && w.level === activeLessonsLevel);

  // Fallback default list if empty (seeded)
  const lessons = HSK_LESSONS_METADATA[activeLessonsLevel] || [
    { id: 1, title: `Bài 1: Tổng hợp HSK ${activeLessonsLevel} - Phần 1`, desc: `Ôn tập từ vựng HSK Cấp ${activeLessonsLevel} phần đầu tiên.`, startIdx: 0, endIdx: Math.max(15, Math.round(levelVocabs.length / 2)) },
    { id: 2, title: `Bài 2: Tổng hợp HSK ${activeLessonsLevel} - Phần 2`, desc: `Ôn tập từ vựng HSK Cấp ${activeLessonsLevel} phần tiếp theo.`, startIdx: Math.max(15, Math.round(levelVocabs.length / 2)), endIdx: levelVocabs.length }
  ];

  lessons.forEach(lesson => {
    // Slice vocab array
    const sliceWords = levelVocabs.slice(lesson.startIdx, lesson.endIdx);
    const wordsCount = sliceWords.length;

    const card = document.createElement('div');
    card.className = 'lesson-card';
    card.innerHTML = `
      <div>
        <span class="lesson-badge">HSK${activeLessonsLevel} - L${lesson.id}</span>
        <h3 class="lesson-title">${lesson.title}</h3>
        <p class="lesson-desc">${lesson.desc}</p>
      </div>
      <div class="lesson-footer">
        <span class="lesson-words-indicator">
          <i class="fa-solid fa-book-open"></i> ${wordsCount} từ vựng
        </span>
        <span class="lesson-detail-link">Chi tiết bài học <i class="fa-solid fa-chevron-right"></i></span>
      </div>
    `;

    card.addEventListener('click', () => {
      startLessonStudy(lesson, sliceWords);
    });

    grid.appendChild(card);
  });
}

function startLessonStudy(lesson, sliceWords) {
  if (sliceWords.length === 0) {
    showToast('Danh sách từ vựng của bài học này đang được chuẩn bị!', true);
    return;
  }

  // Filter flashcard study session directly to these words
  filteredList = shuffleArray(sliceWords);
  currentIndex = 0;
  isFlipped = false;
  
  // Set title & description of flashcard study
  const studyTitle = document.getElementById('study-deck-title');
  const studyDesc = document.getElementById('study-deck-desc');
  if (studyTitle) studyTitle.textContent = lesson.title;
  if (studyDesc) studyDesc.textContent = `Ghép nối kiến thức & từ vựng bài học`;

  // Sync mode flip/type
  setStudyMode(studyMode);

  // Jump to study screen directly
  document.getElementById('deck-selection-view').style.display = 'none';
  document.getElementById('flashcard-study-view').style.display = 'block';

  // Render first card
  renderActiveCard();

  // Switch tab to flashcards
  switchTab('flashcards');

  // Scroll to workspace smoothly
  const flashcardSec = document.getElementById('flashcard-section');
  if (flashcardSec) flashcardSec.scrollIntoView({ behavior: 'smooth' });

  showToast(`Đang học bài: ${lesson.title} 📖`);
}

// Setup event listeners for lessons curriculum pills
function initLessonsView() {
  const hskBtn = document.getElementById('lessons-curriculum-hsk-btn');
  const yctBtn = document.getElementById('lessons-curriculum-yct-btn');
  const levelPillsContainer = document.getElementById('lessons-level-pills-container');

  if (hskBtn && yctBtn) {
    hskBtn.addEventListener('click', () => {
      activeLessonsCurriculum = 'hsk';
      hskBtn.classList.add('active');
      yctBtn.classList.remove('active');
      renderLessonsList();
    });

    yctBtn.addEventListener('click', () => {
      activeLessonsCurriculum = 'yct';
      yctBtn.classList.add('active');
      hskBtn.classList.remove('active');
      renderLessonsList();
    });
  }

  if (levelPillsContainer) {
    levelPillsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.lessons-level-btn');
      if (!btn) return;

      levelPillsContainer.querySelectorAll('.lessons-level-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeLessonsLevel = parseInt(btn.getAttribute('data-level'));
      renderLessonsList();
    });
  }
}

// --- AI DICTIONARY CONTROLLER ---
let selectedDictWordId = null;
let activeHanziWriter = null;
let voiceRecognitionInstance = null;

const WRITING_PROMPTS = [
  { title: "Giới thiệu bản thân (HSK 1)", text: "你好！我叫小王。我是越南人。我学习汉语。很高兴认识你！" },
  { title: "Một ngày của tôi (HSK 2)", text: "我每天早上七点半起床。吃早饭以后去上学。我下午六点回宿舍。" },
  { title: "Sở thích của tôi (HSK 3)", text: "我的 hobby 是听音乐和看中国电影。我觉得写汉字很有意思，但是也很难。" },
  { title: "Lợi ích đọc sách (HSK 4)", text: "读书的好处非常多。阅读不仅能让我们获得丰富的知识，还可以减轻生活压力。" }
];

function initDictionaryView() {
  const tabButtons = document.querySelectorAll('.dict-tab-btn');
  const tabViews = document.querySelectorAll('.dict-tab-view');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');

      // Update switcher active states
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = 'var(--text-secondary)';
      });
      btn.classList.add('active');
      btn.style.background = 'var(--accent-blue)';
      btn.style.color = 'white';

      // Hide/Show tab views
      tabViews.forEach(v => {
        v.style.display = 'none';
        v.classList.remove('active-view');
      });

      const activeView = document.getElementById(`dict-view-${tabId}`);
      if (activeView) {
        if (tabId === 'notebook') {
          activeView.style.display = 'grid'; // Grid sidebar layout
        } else if (tabId === 'search') {
          activeView.style.display = 'grid';
        } else {
          activeView.style.display = 'block';
        }
        activeView.classList.add('active-view');
      }
    });
  });

  // Search input events
  const searchInput = document.getElementById('dict-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderDictPopularList(searchInput.value.trim());
    });
  }

  // AI Sentence Analyzer click listener
  const analyzeBtn = document.getElementById('dict-analyze-btn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', handleSentenceAnalysis);
  }

  // AI Essay Tutor click listener
  const tutorBtn = document.getElementById('dict-tutor-btn');
  if (tutorBtn) {
    tutorBtn.addEventListener('click', handleEssayCorrection);
  }

  // Bind speak buttons inside Details content
  const speakBtn = document.getElementById('dict-detail-speak-btn');
  if (speakBtn) {
    speakBtn.addEventListener('click', () => {
      const word = document.getElementById('dict-detail-word').textContent;
      speakText(word);
    });
  }

  const speakExBtn = document.getElementById('dict-detail-speak-ex-btn');
  if (speakExBtn) {
    speakExBtn.addEventListener('click', () => {
      const sentence = document.getElementById('dict-detail-example-zh').textContent;
      speakText(sentence);
    });
  }

  // Hanzi Writer visual controls
  const btnAnimate = document.getElementById('dict-stroke-btn-animate');
  if (btnAnimate) {
    btnAnimate.addEventListener('click', () => {
      if (activeHanziWriter) {
        activeHanziWriter.animateCharacter();
      }
    });
  }

  const btnQuiz = document.getElementById('dict-stroke-btn-quiz');
  const btnClear = document.getElementById('dict-stroke-btn-clear');
  if (btnQuiz) {
    btnQuiz.addEventListener('click', () => {
      if (activeHanziWriter) {
        if (btnClear) btnClear.style.display = 'inline-block';
        activeHanziWriter.quiz();
      }
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (activeHanziWriter) {
        activeHanziWriter.cancelQuiz();
        activeHanziWriter.quiz();
      }
    });
  }

  // Speech evaluation button
  const micBtn = document.getElementById('dict-speech-mic-btn');
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      const targetWord = document.getElementById('dict-detail-word').textContent;
      toggleSpeechRecognition(targetWord);
    });
  }

  // Quick save to Notebook dropdown toggle
  const quickSaveBtn = document.getElementById('dict-quick-save-btn');
  const quickSaveDropdown = document.getElementById('dict-quick-save-dropdown');
  if (quickSaveBtn && quickSaveDropdown) {
    quickSaveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = quickSaveDropdown.style.display === 'none';
      quickSaveDropdown.style.display = isHidden ? 'flex' : 'none';
    });

    document.addEventListener('click', () => {
      quickSaveDropdown.style.display = 'none';
    });
  }

  // Render suggested writing prompts for the AI tutor
  renderWritingPrompts();

  // Initial render
  renderDictPopularList();
}

function renderDictPopularList(query = '') {
  const container = document.getElementById('dict-popular-list');
  if (!container) return;

  container.innerHTML = '';

  let filtered = vocabList;
  if (query) {
    const q = query.toLowerCase();
    filtered = vocabList.filter(w => 
      w.word.includes(q) || 
      w.pinyin.toLowerCase().includes(q) || 
      w.meaning.toLowerCase().includes(q)
    );
  }

  // Fallback if empty
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.85rem; font-style: italic;">
        Không tìm thấy từ vựng nào!
      </div>
    `;
    return;
  }

  // Slice to first 50
  const list = filtered.slice(0, 50);

  list.forEach(w => {
    const item = document.createElement('div');
    item.className = `dict-popular-item ${selectedDictWordId === w.id ? 'active' : ''}`;
    item.setAttribute('data-id', w.id);
    item.innerHTML = `
      <div style="display: flex; align-items: baseline;">
        <span class="dict-popular-word">${w.word}</span>
        <span class="dict-popular-pinyin">[${w.pinyin}]</span>
      </div>
      <span class="dict-popular-meaning">${w.meaning}</span>
    `;

    item.addEventListener('click', () => {
      selectDictWord(w);
    });

    container.appendChild(item);
  });
}

function selectDictWord(w) {
  selectedDictWordId = w.id;

  // Update popular list active state
  const container = document.getElementById('dict-popular-list');
  if (container) {
    container.querySelectorAll('.dict-popular-item').forEach(item => {
      if (parseInt(item.getAttribute('data-id')) === w.id) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // Hide empty state, show content
  const emptyState = document.getElementById('dict-details-empty');
  const contentState = document.getElementById('dict-details-content');
  if (emptyState) emptyState.style.display = 'none';
  if (contentState) contentState.style.display = 'block';

  // Fill in data
  document.getElementById('dict-detail-word').textContent = w.word;
  document.getElementById('dict-detail-level').textContent = w.isCustom ? 'Cá nhân' : `HSK ${w.level}`;
  document.getElementById('dict-detail-pinyin').textContent = w.pinyin;
  document.getElementById('dict-detail-category').textContent = w.category || 'Chưa phân loại';
  document.getElementById('dict-detail-meaning').textContent = w.meaning;

  const exBox = document.getElementById('dict-detail-example-box');
  if (w.example_zh) {
    document.getElementById('dict-detail-example-zh').textContent = w.example_zh;
    document.getElementById('dict-detail-example-vi').textContent = w.example_vi || '';
    if (exBox) exBox.style.display = 'block';
  } else {
    if (exBox) exBox.style.display = 'none';
  }

  // Dynamic AI mnemonic generation or fallback based on character
  const decompText = document.getElementById('dict-detail-decomposition');
  const mnemonicText = document.getElementById('dict-detail-mnemonics');

  const mnemonics = {
    '你好': { decomp: 'Chữ 你 (bộ Nhân đứng 亻 + Nhĩ 尔) ghép với chữ 好 (bộ Nữ 女 + Tử 子 - phụ nữ sinh con trai là điều tốt lành).', tip: 'Gặp nhau chào hỏi (你好) mong cầu những điều tốt lành và tử tế đến với đối phương.' },
    '谢谢': { decomp: 'Chữ 谢 (bộ Ngôn 言 - lời nói + Thân 身 - cơ thể + Thốn 寸 - đo lường). Biểu đạt lời nói từ tận đáy lòng.', tip: 'Nói lời cảm ơn (谢谢) bằng sự chân thành từ tấm thân này.' },
    '学习': { decomp: 'Chữ 学 (bộ Tử 子 - đứa trẻ dưới mái nhà) + 习 (bộ Vũ 羽 - lông chim bay nhiều lần thành quen).', tip: 'Trẻ con học tập dưới mái nhà, rèn luyện chăm chỉ như chim non tập bay nhiều lần để tự lập.' }
  };

  const seed = mnemonics[w.word];
  if (seed) {
    if (decompText) decompText.textContent = seed.decomp;
    if (mnemonicText) mnemonicText.textContent = seed.tip;
  } else {
    if (decompText) decompText.textContent = `Chữ ghép cấu thành từ các nét vẽ tượng hình bộ thủ tiếng Trung cổ điển. Từ loại: ${w.category || "Chưa phân loại"}.`;
    if (mnemonicText) mnemonicText.textContent = `Hãy kết hợp nhìn chữ viết "${w.word}", ghi nhớ cách đọc âm Pinyin [${w.pinyin}] và nhẩm lại ý nghĩa "${w.meaning}" nhiều lần để tạo phản xạ.`;
  }

  // Reset Speech grader
  cleanupSpeechRecognition();
  document.getElementById('dict-speech-status').textContent = 'Nhấp vào Micro để bắt đầu luyện đọc từ này...';
  document.getElementById('dict-speech-result').style.display = 'none';
  document.getElementById('dict-speech-score-wrap').style.display = 'none';

  // Initialize Hanzi Writer
  const writerTarget = document.getElementById('dict-stroke-writer-target');
  if (writerTarget) {
    writerTarget.innerHTML = '';
    const charToDraw = w.word[0]; // Draw the first character of the word
    const isDark = document.documentElement.classList.contains('dark');
    if (window.HanziWriter) {
      activeHanziWriter = HanziWriter.create('dict-stroke-writer-target', charToDraw, {
        width: 100,
        height: 100,
        padding: 5,
        strokeColor: isDark ? '#38bdf8' : '#3b82f6',
        outlineColor: isDark ? '#374151' : '#e5e7eb',
        drawingColor: '#10b981', // green for user drawing
        showOutline: true
      });
      document.getElementById('dict-stroke-btn-clear').style.display = 'none';
    }
  }

  // Render custom notebooks inside the quick add dropdown
  renderQuickSaveDropdown(w);
}

function renderQuickSaveDropdown(w) {
  const dropdown = document.getElementById('dict-quick-save-dropdown');
  if (!dropdown) return;
  dropdown.innerHTML = '';

  customLists.forEach(listName => {
    const item = document.createElement('div');
    item.className = 'dict-quick-save-item';
    item.innerHTML = `<i class="fa-regular fa-folder text-primary"></i> <span>${listName}</span>`;
    item.addEventListener('click', async (e) => {
      e.stopPropagation();
      dropdown.style.display = 'none';
      await saveWordToCustomNotebook(w, listName);
    });
    dropdown.appendChild(item);
  });
}

async function saveWordToCustomNotebook(w, listName) {
  const exists = vocabList.some(item => item.isCustom && item.word === w.word && item.category === listName);
  if (exists) {
    showToast(`Từ "${w.word}" đã có sẵn trong sổ tay "${listName}"!`, true);
    return;
  }

  const payload = {
    word: w.word,
    pinyin: w.pinyin,
    meaning: w.meaning,
    level: w.level || '1',
    category: listName,
    example_zh: w.example_zh || '',
    example_vi: w.example_vi || ''
  };

  if (!currentUser) {
    // Guest local save
    const newWord = {
      ...payload,
      id: 100000 + Date.now() + Math.floor(Math.random() * 1000),
      isCustom: true,
      isMemorized: false,
      isStarred: false,
      isWrong: false
    };
    vocabList.push(newWord);

    const guestCustom = JSON.parse(localStorage.getItem('guest_custom_words') || '[]');
    guestCustom.push(newWord);
    localStorage.setItem('guest_custom_words', JSON.stringify(guestCustom));

    showToast(`Đã lưu "${w.word}" vào sổ tay "${listName}"! 📁`);
    updateStats();
    applyFilters();
    renderCustomLists();
    renderCustomWordsTable();
    return;
  }

  try {
    const response = await fetch(API_BASE_URL + '/api/vocabulary', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    if (response.ok) {
      const newWord = await response.json();
      vocabList.push({ ...newWord, isCustom: true });
      showToast(`Đã lưu "${w.word}" vào sổ tay "${listName}"! 📁`);
      updateStats();
      applyFilters();
      renderCustomLists();
      renderCustomWordsTable();
    } else {
      throw new Error('Save failed');
    }
  } catch (err) {
    console.error(err);
    showToast('Không thể lưu từ vựng. Vui lòng thử lại!', true);
  }
}

function toggleSpeechRecognition(targetWord) {
  const micBtn = document.getElementById('dict-speech-mic-btn');
  const statusText = document.getElementById('dict-speech-status');
  const resultText = document.getElementById('dict-speech-result');
  const scoreWrap = document.getElementById('dict-speech-score-wrap');
  const scoreVal = document.getElementById('dict-speech-score');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói!', true);
    return;
  }

  if (voiceRecognitionInstance) {
    voiceRecognitionInstance.stop();
    return;
  }

  voiceRecognitionInstance = new SpeechRecognition();
  voiceRecognitionInstance.lang = 'zh-CN';
  voiceRecognitionInstance.interimResults = false;
  voiceRecognitionInstance.maxAlternatives = 1;

  voiceRecognitionInstance.onstart = () => {
    micBtn.classList.add('mic-recording-pulse');
    statusText.textContent = `Đang nghe... Hãy đọc to: "${targetWord}"`;
    resultText.style.display = 'block';
    resultText.textContent = 'Đang nhận diện giọng nói...';
    scoreWrap.style.display = 'none';
  };

  voiceRecognitionInstance.onerror = (e) => {
    console.error(e);
    cleanupSpeechRecognition();
    statusText.textContent = 'Lỗi nhận diện hoặc không có âm thanh. Hãy nhấp Mic và thử lại!';
  };

  voiceRecognitionInstance.onend = () => {
    cleanupSpeechRecognition();
  };

  voiceRecognitionInstance.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    const confidence = event.results[0][0].confidence;
    resultText.textContent = `Phát hiện: "${transcript}"`;

    const cleanTarget = targetWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()？。，！]/g, "");
    const cleanTranscript = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()？。，！]/g, "");

    const isMatch = cleanTranscript === cleanTarget || cleanTranscript.includes(cleanTarget) || cleanTarget.includes(cleanTranscript);

    scoreWrap.style.display = 'flex';
    if (isMatch) {
      const score = Math.round(confidence * 100);
      scoreVal.textContent = `${score}%`;
      scoreVal.style.color = 'var(--success)';
      statusText.textContent = 'Phát âm hoàn hảo! Rất tuyệt.';
      showToast('Tuyệt vời! Phát âm chuẩn xác. 🎉');
    } else {
      scoreVal.textContent = '0%';
      scoreVal.style.color = 'var(--danger)';
      statusText.textContent = 'Chưa khớp lắm, hãy thử phát âm lại rõ ràng hơn nhé!';
    }
  };

  voiceRecognitionInstance.start();
}

function cleanupSpeechRecognition() {
  const micBtn = document.getElementById('dict-speech-mic-btn');
  if (micBtn) micBtn.classList.remove('mic-recording-pulse');
  voiceRecognitionInstance = null;
}

function renderWritingPrompts() {
  const container = document.getElementById('dict-tutor-prompts-container');
  if (!container) return;
  container.innerHTML = '';

  WRITING_PROMPTS.forEach(prompt => {
    const pill = document.createElement('button');
    pill.className = 'dict-tutor-prompt-pill';
    pill.textContent = prompt.title;
    pill.addEventListener('click', () => {
      const input = document.getElementById('dict-tutor-input');
      if (input) {
        input.value = prompt.text;
        showToast(`Đã tải chủ đề: ${prompt.title}`);
      }
    });
    container.appendChild(pill);
  });
}

async function handleSentenceAnalysis() {
  const textarea = document.getElementById('dict-analyze-input');
  const loader = document.getElementById('dict-analyze-loader');
  const results = document.getElementById('dict-analyze-results');

  if (!textarea) return;
  const sentence = textarea.value.trim();
  if (!sentence) {
    showToast('Vui lòng nhập câu cần phân tích!', true);
    return;
  }

  if (loader) loader.style.display = 'block';
  if (results) results.style.display = 'none';

  const systemPrompt = `Hãy đóng vai trò là một chuyên gia phân tích ngữ pháp tiếng Trung. Hãy bóc tách, dịch và giải thích chi tiết cấu trúc ngữ pháp cho câu sau: "${sentence}".
  Trả về KẾT QUẢ duy nhất dưới định dạng JSON có cấu trúc chính xác như sau (không kèm mã markdown \`\`\`json hay từ giải thích nào khác ngoài JSON):
  {
    "translation": "Bản dịch nghĩa tiếng Việt tự nhiên nhất.",
    "grammar": [
      { "structure": "Cấu trúc ngữ pháp trọng điểm 1", "explanation": "Giải thích chi tiết cách dùng..." },
      { "structure": "Cấu trúc ngữ pháp trọng điểm 2", "explanation": "Giải thích..." }
    ],
    "words": [
      { "word": "Từ Hán", "pinyin": "Pinyin", "category": "Từ loại", "meaning": "Ý nghĩa" }
    ]
  }`;

  try {
    const payload = {
      messages: [{ role: 'user', content: systemPrompt }]
    };

    const response = await fetch(API_BASE_URL + '/api/chat', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    if (loader) loader.style.display = 'none';

    if (!response.ok) throw new Error('Phân tích thất bại');

    const data = await response.json();
    const cleanReply = data.reply.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanReply);

    document.getElementById('dict-analyze-result-translation').textContent = parsed.translation || '';
    
    const grammarContainer = document.getElementById('dict-analyze-result-grammar');
    grammarContainer.innerHTML = '';
    (parsed.grammar || []).forEach(g => {
      const card = document.createElement('div');
      card.className = 'dict-grammar-card';
      card.innerHTML = `
        <div class="dict-grammar-title"><i class="fa-solid fa-bookmark text-primary" style="margin-right: 6px;"></i> ${g.structure}</div>
        <p class="dict-grammar-explain">${g.explanation}</p>
      `;
      grammarContainer.appendChild(card);
    });

    const wordsTable = document.getElementById('dict-analyze-result-words');
    wordsTable.innerHTML = '';
    (parsed.words || []).forEach(w => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border-glass)';
      tr.innerHTML = `
        <td style="padding: 10px; font-family: var(--font-chinese); font-size: 1.1rem; font-weight: 600;">${w.word}</td>
        <td style="padding: 10px; font-family: var(--font-display); color: var(--accent-teal);">${w.pinyin}</td>
        <td style="padding: 10px;"><span class="badge badge-level" style="margin:0;">${w.category}</span></td>
        <td style="padding: 10px; color: var(--text-secondary);">${w.meaning}</td>
      `;
      wordsTable.appendChild(tr);
    });

    if (results) results.style.display = 'flex';
  } catch (error) {
    if (loader) loader.style.display = 'none';
    console.error('Analysis error:', error);
    showToast('Lỗi phân tích câu bằng AI. Vui lòng thử lại!', true);
  }
}

async function handleEssayCorrection() {
  const textarea = document.getElementById('dict-tutor-input');
  const loader = document.getElementById('dict-tutor-loader');
  const results = document.getElementById('dict-tutor-results');

  if (!textarea) return;
  const essay = textarea.value.trim();
  if (!essay) {
    showToast('Vui lòng nhập bài viết cần chấm sửa!', true);
    return;
  }

  if (loader) loader.style.display = 'block';
  if (results) results.style.display = 'none';

  const systemPrompt = `Hãy đóng vai trò là một Gia sư tiếng Trung bản xứ HONGTAI. Hãy đọc kỹ, sửa lỗi chính tả, từ vựng và ngữ pháp cho đoạn văn sau của học sinh: "${essay}".
  Trả về KẾT QUẢ duy nhất dưới định dạng JSON có cấu trúc chính xác như sau (không kèm mã markdown \`\`\`json hay từ giải thích nào khác ngoài JSON):
  {
    "score": "A / B / C / D / F",
    "comment": "Nhận xét tổng quan bài viết của học sinh bằng tiếng Việt.",
    "correctedText": "Đoạn văn sau khi đã sửa sạch hết các lỗi.",
    "corrections": [
      { "original": "Lỗi sai", "fixed": "Bản sửa lại đúng", "explanation": "Giải thích tại sao sai ngữ pháp và cách sửa lỗi này bằng tiếng Việt..." }
    ]
  }`;

  try {
    const payload = {
      messages: [{ role: 'user', content: systemPrompt }]
    };

    const response = await fetch(API_BASE_URL + '/api/chat', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    if (loader) loader.style.display = 'none';

    if (!response.ok) throw new Error('Chấm sửa bài viết thất bại');

    const data = await response.json();
    const cleanReply = data.reply.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanReply);

    const scoreBadge = document.getElementById('dict-tutor-score');
    scoreBadge.textContent = parsed.score || 'A';
    
    document.getElementById('dict-tutor-comment').textContent = parsed.comment || '';
    document.getElementById('dict-tutor-original-text').textContent = essay;
    document.getElementById('dict-tutor-corrected-text').textContent = parsed.correctedText || '';

    const correctionsList = document.getElementById('dict-tutor-grammar-corrections');
    correctionsList.innerHTML = '';

    if (!parsed.corrections || parsed.corrections.length === 0) {
      correctionsList.innerHTML = `
        <div class="glass-panel" style="padding: 16px; border-color: var(--success-bg); background: rgba(16, 185, 129, 0.02); text-align: left; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-circle-check text-success" style="font-size: 1.25rem;"></i>
          <span style="font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">Tuyệt vời! Gia sư không phát hiện lỗi sai ngữ pháp nào trong đoạn văn của bạn.</span>
        </div>
      `;
    } else {
      parsed.corrections.forEach(c => {
        const item = document.createElement('div');
        item.className = 'dict-correction-item';
        item.innerHTML = `
          <div class="dict-correction-header error">
            <i class="fa-solid fa-circle-exclamation"></i> Phát hiện lỗi: <span class="dict-correction-original">${c.original}</span> <i class="fa-solid fa-arrow-right-long" style="color: var(--text-muted); font-size: 0.8rem;"></i> sửa thành <span class="dict-correction-fixed">${c.fixed}</span>
          </div>
          <p class="dict-correction-desc"><strong>Lý do sửa:</strong> ${c.explanation}</p>
        `;
        correctionsList.appendChild(item);
      });
    }

    if (results) results.style.display = 'flex';
  } catch (error) {
    if (loader) loader.style.display = 'none';
    console.error('Tutor correction error:', error);
    showToast('Lỗi gia sư AI sửa bài. Vui lòng thử lại!', true);
  }
}


