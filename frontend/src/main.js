// HSK Vocabulary Flashcard - Main Frontend Controller
import './style.css';

// --- STATE MANAGEMENT ---
let vocabList = [];       // Master list of all vocabulary (seeded + custom)
let filteredList = [];    // Current active subset based on active filters/search
let currentIndex = 0;     // Selected card index in filteredList
let isFlipped = false;    // Card orientation state
let autoplayTimer = null; // Timer reference for autoplay loop
let isAutoplayActive = false; // Autoplay state
let activeLevel = '1';  // Level filter state: 'all', '1', '2', '3', '4'
let activeHskVersion = localStorage.getItem('active_hsk_version') || '3.0';
let activeStatus = 'all'; // Status filter state: 'all', 'unmemorized', 'memorized', 'starred', 'custom'
let searchQuery = '';     // Search query string
let chineseVoice = null;  // Reference to Web Speech Chinese voice object
let currentUser = null;   // Active authenticated user profile
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === ''
  ? 'http://localhost:5000'
  : 'https://tieng-trung-hong-tai.onrender.com';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id-here.apps.googleusercontent.com';

const premiumMockData = [
  // Du lịch
  { id: 'prem_1', word: '旅游', pinyin: 'lǚyóu', meaning: 'du lịch', level: 'premium', category: 'Du lịch', explanation: 'Chỉ hoạt động đi tham quan, vui chơi ở nơi khác.', example_zh: '我们去中国旅游。', example_vi: 'Chúng tôi đi du lịch Trung Quốc.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_2', word: '飞机', pinyin: 'fēijī', meaning: 'máy bay', level: 'premium', category: 'Du lịch', explanation: 'Phương tiện bay trên không.', example_zh: '坐飞机很快。', example_vi: 'Đi máy bay rất nhanh.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_3', word: '酒店', pinyin: 'jiǔdiàn', meaning: 'khách sạn', level: 'premium', category: 'Du lịch', explanation: 'Nơi lưu trú cho khách du lịch.', example_zh: '这家酒店很干净。', example_vi: 'Khách sạn này rất sạch sẽ.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_4', word: '门票', pinyin: 'ménpiào', meaning: 'vé vào cổng', level: 'premium', category: 'Du lịch', explanation: 'Vé để vào các điểm tham quan.', example_zh: '景点的门票很贵。', example_vi: 'Vé vào cổng của điểm tham quan rất đắt.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_5', word: '行李', pinyin: 'xíngli', meaning: 'hành lý', level: 'premium', category: 'Du lịch', explanation: 'Đồ đạc mang theo khi đi xa.', example_zh: '我的行李在哪儿？', example_vi: 'Hành lý của tôi ở đâu?', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_6', word: '导游', pinyin: 'dǎoyóu', meaning: 'hướng dẫn viên du lịch', level: 'premium', category: 'Du lịch', explanation: 'Người dẫn đoàn và giới thiệu cảnh đẹp.', example_zh: '他是我们的导游。', example_vi: 'Anh ấy là hướng dẫn viên của chúng tôi.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_7', word: '护照', pinyin: 'hùzhào', meaning: 'hộ chiếu', level: 'premium', category: 'Du lịch', explanation: 'Giấy tờ thông hành quốc tế.', example_zh: '请出示你的护照。', example_vi: 'Vui lòng xuất trình hộ chiếu của bạn.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_8', word: '景点', pinyin: 'jǐngdiǎn', meaning: 'địa điểm tham quan', level: 'premium', category: 'Du lịch', explanation: 'Nơi có phong cảnh đẹp để ngắm nhìn.', example_zh: '这个景点很有名。', example_vi: 'Địa điểm tham quan này rất nổi tiếng.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },

  // Giao tiếp công sở
  { id: 'prem_9', word: '加班', pinyin: 'jiābān', meaning: 'làm tăng ca / làm thêm giờ', level: 'premium', category: 'Công sở', explanation: 'Làm việc ngoài giờ quy định.', example_zh: '今天我要加班。', example_vi: 'Hôm nay tôi phải làm tăng ca.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_10', word: '会议', pinyin: 'huìyì', meaning: 'cuộc họp / hội nghị', level: 'premium', category: 'Công sở', explanation: 'Buổi gặp mặt thảo luận công việc.', example_zh: '下午两点有会议。', example_vi: 'Chiều hai giờ có cuộc họp.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_11', word: '报告', pinyin: 'bàogào', meaning: 'báo cáo', level: 'premium', category: 'Công sở', explanation: 'Trình bày kết quả công việc bằng văn bản hoặc lời nói.', example_zh: '我已经写好报告了。', example_vi: 'Tôi đã viết xong báo cáo rồi.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_12', word: '同事', pinyin: 'tóngshì', meaning: 'đồng nghiệp', level: 'premium', category: 'Công sở', explanation: 'Người cùng làm việc trong một cơ quan.', example_zh: '他是我的新同事。', example_vi: 'Anh ấy là đồng nghiệp mới của tôi.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_13', word: '出差', pinyin: 'chūchāi', meaning: 'đi công tác', level: 'premium', category: 'Công sở', explanation: 'Đi làm việc ở nơi khác theo phân công.', example_zh: '下周我要去北京出差。', example_vi: 'Tuần tới tôi phải đi công tác Bắc Kinh.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_14', word: '请假', pinyin: 'qǐngjià', meaning: 'xin nghỉ phép', level: 'premium', category: 'Công sở', explanation: 'Xin phép nghỉ làm.', example_zh: '我想请假一天。', example_vi: 'Tôi muốn xin nghỉ phép một ngày.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_15', word: '薪水', pinyin: 'xīnshuǐ', meaning: 'tiền lương', level: 'premium', category: 'Công sở', explanation: 'Tiền công trả cho người lao động.', example_zh: '这儿的薪水还可以。', example_vi: 'Lương ở đây cũng được.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_16', word: '退休', pinyin: 'tuìxiū', meaning: 'nghỉ hưu', level: 'premium', category: 'Công sở', explanation: 'Nghỉ làm việc khi đến tuổi quy định.', example_zh: '我爸爸明年就退休了。', example_vi: 'Bố tôi năm tới sẽ nghỉ hưu.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },

  // Đàm phán thương mại
  { id: 'prem_17', word: '合作', pinyin: 'hézuò', meaning: 'hợp tác', level: 'premium', category: 'Đàm phán', explanation: 'Cùng chung sức làm việc vì mục đích chung.', example_zh: '祝 chúng ta hợp tác vui vẻ！', example_vi: 'Chúc chúng ta hợp tác vui vẻ!', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_18', word: '合同', pinyin: 'hétong', meaning: 'hợp đồng', level: 'premium', category: 'Đàm phán', explanation: 'Văn bản ký kết thỏa thuận giữa các bên.', example_zh: '我们在合同上签字了。', example_vi: 'Chúng tôi đã ký tên trên hợp đồng.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_19', word: '价格', pinyin: 'jiàgé', meaning: 'giá cả', level: 'premium', category: 'Đàm phán', explanation: 'Giá của hàng hóa.', example_zh: '我们可以讨论一下价格。', example_vi: 'Chúng ta có thể thảo luận một chút về giá cả.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_20', word: '客户', pinyin: 'kèhù', meaning: 'khách hàng', level: 'premium', category: 'Đàm phán', explanation: 'Đối tác mua hàng hoặc sử dụng dịch vụ.', example_zh: '这位是我们的重要客户。', example_vi: 'Vị này là khách hàng quan trọng của chúng tôi.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_21', word: '折扣', pinyin: 'zhékòu', meaning: 'chiết khấu / giảm giá', level: 'premium', category: 'Đàm phán', explanation: 'Giảm bớt giá của hàng hóa.', example_zh: '如果买得多，有折扣吗？', example_vi: 'Nếu mua nhiều thì có giảm giá không?', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_22', word: '谈判', pinyin: 'tánpàn', meaning: 'đàm phán', level: 'premium', category: 'Đàm phán', explanation: 'Trao đổi, thỏa thuận điều kiện giữa các bên.', example_zh: '谈判进行得很顺利。', example_vi: 'Cuộc đàm phán diễn ra rất thuận lợi.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_23', word: '发票', pinyin: 'fāpiào', meaning: 'hóa đơn', level: 'premium', category: 'Đàm phán', explanation: 'Chứng từ mua bán hàng hóa.', example_zh: '请给我开一张发票。', example_vi: 'Vui lòng xuất cho tôi một tờ hóa đơn.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false },
  { id: 'prem_24', word: '定金', pinyin: 'dìngjīn', meaning: 'tiền đặt cọc', level: 'premium', category: 'Đàm phán', explanation: 'Tiền trả trước để bảo đảm thực hiện hợp đồng.', example_zh: '我们需要先付定金。', example_vi: 'Chúng ta cần thanh toán tiền cọc trước.', isCustom: false, isMemorized: false, isStarred: false, isWrong: false }
];

// --- ENHANCEMENT STATE MANAGEMENT ---
let studyMode = 'flip';         // 'flip' or 'type'
let typingAttempts = 3;         // Remaining attempts (starts at 3)
let isTypingAnswerFinished = false; // Whether current card has finished evaluation
let activeCustomList = 'Mặc định'; // Active custom list selected in sidebar
let customLists = ['Mặc định'];  // List of custom named lists
let studyCustomCategory = null; // Filter for active custom list being studied
let smartSelectedSubDeck = 'wrong'; // Default to wrong, but can be customized
let smartSelectedRange = 'all';     // 'all' or 'custom'
let smartSelectedLessons = [];      // Array of selected HSK lesson IDs
let studySelectedLessons = null;     // Array of lesson IDs being studied, or null
let studyWordLimit = 10;            // Limit for number of words in a study session

// --- NEW STATE VARIABLES FOR SMART TOPIC LAYOUT & QUIZ ---
let activeSmartTopic = 'personal'; // 'personal', 'hsk', 'premium'
let activeNotebook = null;        // active notebook key/ID
let studyNotebookId = null;       // active notebook filter being studied
let currentNotebookPage = 1;      // active page in vocabulary table
let dashboardActiveFilter = 'all';  // 'all', 'studied', 'unstudied', 'memorized', 'unmemorized', 'starred'
let selectedDashboardLessons = [];  // lessons filtered in notebook dashboard
const notebookPageSize = 10;      // 10 items per page
let quizQuestions = [];           // array of quiz questions
let currentQuizIndex = 0;         // current question index
let quizScore = 0;                // current score

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
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initVoices();
  await initAuth();
  await fetchVocabulary();
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
    if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    document.documentElement.classList.add('dark');
    if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  const icon = isDark ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
  if (themeToggleBtn) themeToggleBtn.innerHTML = icon;
  const sidebarToggle = document.getElementById('sidebar-theme-toggle');
  if (sidebarToggle) sidebarToggle.innerHTML = `${icon} Giao diện`;
  showToast(isDark ? 'Đã chuyển sang chế độ tối' : 'Đã chuyển sang chế độ sáng');
  if (!currentUser && typeof initGoogleSignIn === 'function') {
    initGoogleSignIn();
  }
}
window.toggleTheme = toggleTheme;

// --- TEXT TO SPEECH (TTS) SETUP ---
let speechVoice = localStorage.getItem('speech_voice') || 'baidu-female';
localStorage.setItem('speech_voice', 'baidu-female');
let speechPlaybackRate = parseFloat(localStorage.getItem('speech_playback_rate') || '1.0');
let activeAudioElement = null;

function initVoices() {
  const ttsVoiceSelect = document.getElementById('tts-voice-select');
  const ttsSpeedSelect = document.getElementById('tts-speed-select');

  if (ttsVoiceSelect) {
    const savedVoice = localStorage.getItem('speech_voice');
    if (savedVoice && savedVoice.startsWith('elevenlabs-')) {
      ttsVoiceSelect.value = savedVoice;
    } else {
      localStorage.setItem('speech_voice', ttsVoiceSelect.value || 'elevenlabs-adam');
    }

    ttsVoiceSelect.addEventListener('change', (e) => {
      speechVoice = e.target.value;
      localStorage.setItem('speech_voice', speechVoice);
    });
  }

  if (ttsSpeedSelect) {
    const savedSpeed = localStorage.getItem('speech_playback_rate');
    if (savedSpeed) {
      ttsSpeedSelect.value = savedSpeed;
    }
    ttsSpeedSelect.addEventListener('change', (e) => {
      speechPlaybackRate = parseFloat(e.target.value) || 1.0;
      localStorage.setItem('speech_playback_rate', speechPlaybackRate);
    });
  }
}

function cleanFrontendSpeechText(text) {
  if (!text) return '';
  let str = String(text).trim();
  str = str.replace(/<[^>]*>/g, '');
  // Strip both ASCII () and fullwidth Chinese （） parenthetical notes/parts of speech
  str = str.replace(/[\(\uff08][^\)\uff09]*[\)\uff09]/g, '');
  str = str.replace(/^[A-Z]:\s*/gm, '').replace(/\n[A-Z]:\s*/g, '，');
  if (str.includes('/') && !str.includes('http')) {
    str = str.split('/')[0].trim();
  }
  return str.trim();
}

function speakText(text) {
  if (!text) return;
  const cleanText = cleanFrontendSpeechText(text);
  if (!cleanText) return;

  // 1. Instantly stop previous playing audio element
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.src = '';
    } catch (e) { }
    activeAudioElement = null;
  }

  // 2. Fetch live selected voice & speed directly from DOM
  const voiceSelectEl = document.getElementById('tts-voice-select');
  const currentVoice = 'baidu-female';
  localStorage.setItem('speech_voice', 'baidu-female');

  const speedSelectEl = document.getElementById('tts-speed-select');
  const currentSpeed = (speedSelectEl && speedSelectEl.value) ? parseFloat(speedSelectEl.value) : (parseFloat(localStorage.getItem('speech_playback_rate')) || 1.0);
  localStorage.setItem('speech_playback_rate', currentSpeed.toString());

  // 3. Play pure ElevenLabs MP3 stream from server
  const url = `${API_BASE_URL}/api/tts?text=${encodeURIComponent(cleanText)}&voice=${encodeURIComponent(currentVoice)}&_t=${Date.now()}`;
  const audio = new Audio(url);
  audio.playbackRate = currentSpeed;
  activeAudioElement = audio;

  audio.play().catch(err => {
    console.warn("ElevenLabs audio playback failed, retrying...", err);
    setTimeout(() => {
      audio.play().catch(e => console.error("Audio retry error:", e));
    }, 300);
  });
}

// iOS Safari & Mobile Audio Autoplay Unlocker
function setupAudioUnlocker() {
  const unlock = () => {
    try {
      const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      silentAudio.play().then(() => {
        document.removeEventListener('touchstart', unlock);
        document.removeEventListener('click', unlock);
      }).catch(() => { });
    } catch (e) { }
  };
  document.addEventListener('touchstart', unlock, { once: true });
  document.addEventListener('click', unlock, { once: true });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupAudioUnlocker);
} else {
  setupAudioUnlocker();
}

function cleanPinyinText(str) {
  if (!str) return '';
  const parts = str.split(/[|/\\;]/);
  let first = parts[0].trim();
  if (!first && parts.length > 1) {
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].trim()) {
        first = parts[i].trim();
        break;
      }
    }
  }
  return first.replace(/\s+/g, ' ');
}

// --- API ACTIONS ---
async function fetchVocabulary() {
  try {
    const response = await fetch(API_BASE_URL + '/api/vocabulary', {
      headers: getAuthHeaders(),
      credentials: 'include',
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Không thể tải từ vựng từ API');
    vocabList = await response.json();

    // Filter out empty/incomplete database entries
    if (Array.isArray(vocabList)) {
      vocabList = vocabList.filter(w =>
        w &&
        w.word && w.word.trim() !== '' &&
        w.meaning && w.meaning.trim() !== '' &&
        w.pinyin && w.pinyin.trim() !== ''
      );
    }

    // Clean up pinyin formatting anomalies
    vocabList.forEach(w => {
      if (w.pinyin) {
        w.pinyin = cleanPinyinText(w.pinyin);
      }
    });

    // If guest, merge guest progress from localStorage
    if (!currentUser) {
      const guestProgress = JSON.parse(localStorage.getItem('guest_progress') || '{}');
      vocabList = vocabList.map(w => {
        const state = guestProgress[w.id];
        const isMem = state ? !!state.isMemorized : !!w.isMemorized;
        const isStar = state ? !!state.isStarred : !!w.isStarred;
        const isWr = state ? !!state.isWrong : !!w.isWrong;
        const isStd = state ? !!state.isStudied : !!w.isStudied;
        return {
          ...w,
          isMemorized: isMem,
          isStarred: isStar,
          isWrong: isWr,
          isStudied: isStd || isMem || isStar || isWr
        };
      });
    }

    initCustomLists();
    renderCustomLists();
    updateStats();
    applyFilters();
    renderCustomWordsTable();

    // Fetch initial stats and start timer
    loadInitialStats();
    startStudyTimer();
  } catch (error) {
    console.error('API Error:', error);
    showToast('Lỗi kết nối máy chủ backend!', true);

    // Merge premium topics mock data
    vocabList = [...vocabList, ...premiumMockData];

    vocabList.forEach(w => {
      if (w.pinyin) {
        w.pinyin = cleanPinyinText(w.pinyin);
      }
    });

    // Merge guest progress on fallback empty seed list if offline
    if (!currentUser) {
      const guestProgress = JSON.parse(localStorage.getItem('guest_progress') || '{}');
      vocabList = vocabList.map(w => {
        const state = guestProgress[w.id];
        return {
          ...w,
          isMemorized: state ? !!state.isMemorized : !!w.isMemorized,
          isStarred: state ? !!state.isStarred : !!w.isStarred,
          isWrong: state ? !!state.isWrong : !!w.isWrong,
          isStudied: state ? !!state.isStudied : !!w.isStudied
        };
      });
    }

    initCustomLists();
    renderCustomLists();
    updateStats();
    applyFilters();

    // Fetch initial stats and start timer
    loadInitialStats();
    startStudyTimer();
  }
}

function markWordAsStudied(wordId) {
  const index = vocabList.findIndex(w => w.id === wordId);
  if (index === -1) return;
  if (vocabList[index].isStudied) return; // already studied

  vocabList[index].isStudied = true;
  updateStats();

  if (!currentUser) {
    const guestProgress = JSON.parse(localStorage.getItem('guest_progress') || '{}');
    if (!guestProgress[wordId]) guestProgress[wordId] = {};
    guestProgress[wordId].isStudied = true;
    localStorage.setItem('guest_progress', JSON.stringify(guestProgress));
  } else {
    fetch(API_BASE_URL + '/api/vocabulary/set-studied', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ id: wordId, isStudied: true }),
      credentials: 'include'
    }).catch(err => console.warn('Failed to sync studied status:', err));
  }
}

async function toggleWordMemorized(id) {
  const index = vocabList.findIndex(w => w.id === id);
  if (index === -1) return;

  const oldMemorized = vocabList[index].isMemorized;
  const nextState = !oldMemorized;

  // Optimistic update
  vocabList[index].isMemorized = nextState;
  markWordAsStudied(id);
  updateStats();
  if (studyMode !== 'type') {
    applyFilters(true);
  }
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
      // Fallback guest progress save without logging out the user
      const guestProgress = JSON.parse(localStorage.getItem('guest_progress') || '{}');
      if (!guestProgress[id]) guestProgress[id] = {};
      guestProgress[id].isMemorized = !oldMemorized;
      vocabList[index].isMemorized = !oldMemorized;
      localStorage.setItem('guest_progress', JSON.stringify(guestProgress));
      updateStats();
      if (studyMode !== 'type') {
        applyFilters(true);
      }
      return;
    }
    if (!response.ok) throw new Error('Lỗi cập nhật trạng thái');
    const updatedWord = await response.json();

    // Confirm local state matches server
    Object.assign(vocabList[index], updatedWord);
    updateStats();
    if (studyMode !== 'type') {
      applyFilters(true);
    }
  } catch (error) {
    console.error('API Error:', error);
    showToast('Lỗi cập nhật trạng thái từ máy chủ!', true);

    // Rollback state on error
    vocabList[index].isMemorized = oldMemorized;
    updateStats();
    if (studyMode !== 'type') {
      applyFilters(true);
    }
  }
}

async function toggleWordStarred(id) {
  const index = vocabList.findIndex(w => w.id === id);
  if (index === -1) return;

  const oldStarred = vocabList[index].isStarred;
  const nextState = !oldStarred;

  // Optimistic update
  vocabList[index].isStarred = nextState;
  markWordAsStudied(id);
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
      // Fallback guest progress save without logging out the user
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

  // Update Indicator & Progress Fill (do this before potential early return in typing mode)
  if (currentCardNum) currentCardNum.textContent = currentIndex + 1;
  if (totalCardNum) totalCardNum.textContent = filteredList.length;

  if (filteredList.length > 0 && learningProgress && progressPercentage) {
    const progressPercent = Math.round(((currentIndex + 1) / filteredList.length) * 100);
    learningProgress.style.width = `${progressPercent}%`;
    progressPercentage.textContent = `${progressPercent}%`;
  }

  if (studyMode === 'type') {
    renderActiveCardTyping(current);
    return;
  }

  const getLevelLabel = (w) => {
    if (w.isCustom) return 'Cá nhân';
    if (w.level === 'premium') return 'Premium';
    return `HSK ${w.level} (v${w.hskVersion || '3.0'})`;
  };

  // Render Front Face
  cardWordFront.textContent = current.word;
  cardLevelFront.textContent = getLevelLabel(current);
  cardCategoryFront.textContent = current.category || 'Chưa phân loại';

  // Render Back Face
  cardPinyinBack.textContent = current.pinyin;
  cardMeaningBack.textContent = current.meaning;
  cardLevelBack.textContent = getLevelLabel(current);
  cardCategoryBack.textContent = current.category || 'Chưa phân loại';

  if (current.example_zh) {
    cardExampleZhBack.textContent = current.example_zh;
    cardExampleViBack.textContent = current.example_vi || '';
    document.querySelector('.example-box').style.display = 'block';
  } else {
    document.querySelector('.example-box').style.display = 'none';
  }

  // (Indicator & Progress Fill updated at the start of renderActiveCard)

  // Update HUD Button States
  const markUnmemorizedBtn = document.getElementById('mark-unmemorized-btn');
  if (current.isMemorized) {
    markMemorizedBtn.classList.add('active');
    if (markUnmemorizedBtn) markUnmemorizedBtn.classList.remove('active');
  } else if (current.isStudied) {
    markMemorizedBtn.classList.remove('active');
    if (markUnmemorizedBtn) markUnmemorizedBtn.classList.add('active');
  } else {
    markMemorizedBtn.classList.remove('active');
    if (markUnmemorizedBtn) markUnmemorizedBtn.classList.remove('active');
  }

  if (current.isStarred) {
    markStarredBtn.classList.add('active');
  } else {
    markStarredBtn.classList.remove('active');
  }
}

function updateStats() {
  // 1. Dynamic stats based on activeLevel and activeHskVersion
  let levelList = vocabList.filter(w => {
    if (w.isCustom) return true;
    if (w.level === 'premium') return true;
    return (w.hskVersion || '3.0') === activeHskVersion;
  });

  if (activeLevel !== 'all') {
    levelList = levelList.filter(w => w.level.toString() === activeLevel);
  }

  if (studyNotebookId) {
    const notebookWords = getNotebookWords(studyNotebookId);
    const ids = new Set(notebookWords.map(x => x.id));
    levelList = levelList.filter(w => ids.has(w.id));
  }

  // Adjust levelList if custom list or wrong/starred filter is active
  if (studySelectedLessons && studySelectedLessons.length > 0) {
    levelList = levelList.filter(w => w.lessonId && studySelectedLessons.includes(w.lessonId));
  } else if (activeStatus === 'custom' && studyCustomCategory) {
    levelList = vocabList.filter(w => w.isCustom && w.category === studyCustomCategory);
  } else if (activeStatus === 'wrong') {
    levelList = levelList.filter(w => w.isWrong);
  } else if (activeStatus === 'starred') {
    levelList = levelList.filter(w => w.isStarred);
  }

  const total = levelList.length;
  const memorized = levelList.filter(w => w.isMemorized).length;
  const unmemorized = levelList.filter(w => w.isStudied && !w.isMemorized).length;
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
  const mistakeCount = vocabList.filter(w => w.isWrong && (w.isCustom || w.level === 'premium' || (w.hskVersion || '3.0') === activeHskVersion)).length;
  const mistakeBadge = document.getElementById('mistake-count-badge');
  if (mistakeBadge) mistakeBadge.textContent = mistakeCount;

  // 3. Detailed Stats Grid Table
  renderDetailedStatsTable();

  // 4. Render Deck Selection Grid view
  renderDeckSelectionView();

  // 5. Update dynamic welcome stat cards
  if (typeof updateStatsUI === 'function') {
    updateStatsUI();
  }
}

function renderDeckSelectionView() {
  // Check if there is an active study or quiz session currently displayed
  const studyView = document.getElementById('flashcard-study-view');
  const quizView = document.getElementById('quiz-study-view');
  const isStudying = (studyView && studyView.style.display === 'block') ||
    (quizView && quizView.style.display === 'block');

  if (isStudying) {
    // Refresh the notebook data/statistics in the background without changing active view
    if (activeNotebook) {
      openNotebookDashboard(activeNotebook);
    } else if (activeSmartTopic) {
      renderSubdecksList();
    }
    return;
  }

  // Otherwise, handle screen visibility switching as normal
  if (activeNotebook) {
    showNotebookDashboardView(activeNotebook, true);
  } else if (activeSmartTopic) {
    showSubdecksView();
  } else {
    showTopicsView();
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

  // Update stats widget
  updateStats();

  // Apply filters to load cards
  applyFilters();

  // Explicitly ensure correct layout and HUD visibility for current studyMode
  setStudyMode(studyMode);

  // Scroll smooth
  const flashcardSection = document.getElementById('flashcard-section');
  if (flashcardSection) flashcardSection.scrollIntoView({ behavior: 'smooth' });
}

function renderDetailedStatsTable() {
  const tbody = document.getElementById('detailed-stats-rows');
  if (!tbody) return;

  tbody.innerHTML = '';
  const rowsData = [];

  // HSK Levels
  const maxLvl = activeHskVersion === '3.0' ? 6 : 6;
  for (let lvl = 1; lvl <= maxLvl; lvl++) {
    const lvlWords = vocabList.filter(w => !w.isCustom && matchLevel(w.level, lvl) && (w.hskVersion || '3.0') === activeHskVersion);
    const total = lvlWords.length;
    const memorized = lvlWords.filter(w => w.isMemorized).length;
    const unmemorized = total - memorized;
    const starred = lvlWords.filter(w => w.isStarred).length;

    rowsData.push({
      name: `HSK ${lvl} (v${activeHskVersion})`,
      total, memorized, unmemorized, starred
    });
  }

  // HSK 7-9 for HSK 3.0
  if (activeHskVersion === '3.0') {
    const lvl79Words = vocabList.filter(w => !w.isCustom && matchLevel(w.level, '7-9') && (w.hskVersion || '3.0') === activeHskVersion);
    const total = lvl79Words.length;
    const memorized = lvl79Words.filter(w => w.isMemorized).length;
    const unmemorized = total - memorized;
    const starred = lvl79Words.filter(w => w.isStarred).length;

    rowsData.push({
      name: `HSK Cấp 7-8-9 (Cao cấp)`,
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

  // Total (active version + custom + premium)
  const activeVersionWords = vocabList.filter(w => {
    if (w.isCustom) return true;
    if (w.level === 'premium') return true;
    return (w.hskVersion || '3.0') === activeHskVersion;
  });
  const allTotal = activeVersionWords.length;
  const allMemorized = activeVersionWords.filter(w => w.isMemorized).length;
  const allUnmemorized = allTotal - allMemorized;
  const allStarred = activeVersionWords.filter(w => w.isStarred).length;
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

function matchLevel(wLevel, targetLevel) {
  if (!targetLevel || targetLevel === 'all') return true;
  if (!wLevel) return false;
  const w = wLevel.toString().trim().toLowerCase().replace('hsk', '');
  const t = targetLevel.toString().trim().toLowerCase().replace('hsk', '');
  if (w === t) return true;
  const hsk79 = ['7', '8', '9', '7-9', '7_9'];
  if (hsk79.includes(w) && hsk79.includes(t)) return true;
  return false;
}

function applyFilters(preserveIndex = false) {
  const previousWordId = (filteredList.length > 0 && currentIndex < filteredList.length) ? filteredList[currentIndex].id : null;

  const newList = vocabList.filter(w => {
    // Check HSK Version first for standard HSK words
    if (!w.isCustom && w.level !== 'premium' && (w.hskVersion || '3.0') !== activeHskVersion) {
      return false;
    }

    // If studying a specific notebook
    if (studyNotebookId) {
      const notebookWords = getNotebookWords(studyNotebookId);
      const ids = new Set(notebookWords.map(x => x.id));
      if (!ids.has(w.id)) return false;

      // Filter by studySelectedLessons if studying an HSK notebook
      if (studyNotebookId.startsWith('hsk:') && studySelectedLessons && studySelectedLessons.length > 0) {
        if (!w.lessonId || !studySelectedLessons.includes(w.lessonId)) return false;
      }
    } else {
      // If studying a specific custom list, show only custom words in that list
      if (studyCustomCategory) {
        return w.isCustom && w.category === studyCustomCategory;
      }

      // 1. Level Filter
      if (activeLevel !== 'all' && !matchLevel(w.level, activeLevel)) return false;

      // 1.1 Lessons Filter (if studying custom selected HSK lessons)
      if (studySelectedLessons && studySelectedLessons.length > 0) {
        if (!w.lessonId || !studySelectedLessons.includes(w.lessonId)) return false;
      }
    }

    // 2. Status Filter
    if (activeStatus === 'memorized' && !w.isMemorized) return false;
    if (activeStatus === 'unmemorized' && (!w.isStudied || w.isMemorized)) return false;
    if (activeStatus === 'wrong' && !w.isWrong) return false;
    if (activeStatus === 'starred' && !w.isStarred) return false;
    if (activeStatus === 'custom' && !w.isCustom) return false;
    if (activeStatus === 'studied' && !w.isStudied) return false;
    if (activeStatus === 'unstudied' && w.isStudied) return false;

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

    // Apply study word limit
    if (studyWordLimit !== 'all' && filteredList.length > studyWordLimit) {
      filteredList = filteredList.slice(0, studyWordLimit);
    }
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

    // Re-apply study word limit if we just shuffled
    if (studyWordLimit !== 'all' && filteredList.length > studyWordLimit) {
      filteredList = filteredList.slice(0, studyWordLimit);
    }
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
    if (studySelectedLessons && studySelectedLessons.length > 0) {
      if (!w.lessonId || !studySelectedLessons.includes(w.lessonId)) return false;
    }
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

  if (studyMode === 'type') {
    const currentWord = filteredList[currentIndex];
    applyFilters(true);

    if (filteredList.length === 0) return;

    const stillExists = filteredList.some(w => w.id === currentWord.id);
    if (stillExists) {
      currentIndex = (currentIndex + 1) % filteredList.length;
      resetCardOrientation();
    } else {
      if (currentIndex >= filteredList.length) {
        currentIndex = 0;
      }
      resetCardOrientation();
    }
  } else {
    currentIndex = (currentIndex + 1) % filteredList.length;
    resetCardOrientation();
  }
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
  if (isFlipped) {
    markWordAsStudied(filteredList[currentIndex].id);
  }
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
  // Handle browser back button to always return to Home view
  window.history.pushState({ page: 'app' }, '', '');
  window.addEventListener('popstate', (e) => {
    showHomeView();
    window.history.pushState({ page: 'app' }, '', '');
  });


  // Bottom Navigation Bar Switcher
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      if (tabId) {
        switchTab(tabId);
      }
    });
  });

  // Quiz mode exit
  const exitQuizBtn = document.getElementById('exit-quiz-btn');
  if (exitQuizBtn) {
    exitQuizBtn.addEventListener('click', exitQuizMode);
  }

  // Notebook Dashboard limit buttons
  const limitBtns = document.querySelectorAll('.limit-btn');
  limitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      limitBtns.forEach(b => b.classList.remove('active-limit'));
      btn.classList.add('active-limit');
      const limitVal = btn.getAttribute('data-limit');
      studyWordLimit = limitVal === 'all' ? 'all' : parseInt(limitVal, 10);
    });
  });

  // Flashcard quick save dropdown toggle
  const fcQuickSaveBtn = document.getElementById('fc-quick-save-btn');
  const fcQuickSaveDropdown = document.getElementById('fc-quick-save-dropdown');
  if (fcQuickSaveBtn && fcQuickSaveDropdown) {
    fcQuickSaveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = fcQuickSaveDropdown.style.display === 'none';
      fcQuickSaveDropdown.style.display = isHidden ? 'flex' : 'none';
      if (isHidden && filteredList[currentIndex]) {
        renderFcQuickSaveDropdown(filteredList[currentIndex]);
      }
    });

    document.addEventListener('click', () => {
      fcQuickSaveDropdown.style.display = 'none';
    });
  }

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
        rangeTitle.textContent = `Toàn bộ từ vựng`;
      }

      smartSelectedLessons = []; // Reset selected lessons when level changes
      renderDeckSelectionView();
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

  // Select all / deselect all buttons for custom lessons
  const selectAllBtn = document.getElementById('smart-lessons-select-all');
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      let renderLevel = activeLevel;
      if (renderLevel === 'all') {
        renderLevel = '1';
      }
      const levelWords = vocabList.filter(w => !w.isCustom && w.level.toString() === renderLevel);
      const uniqueLessonIds = [...new Set(levelWords.map(w => w.lessonId).filter(Boolean))];
      smartSelectedLessons = uniqueLessonIds;
      smartSelectedSubDeck = null;
      renderDeckSelectionView();
    });
  }

  const deselectAllBtn = document.getElementById('smart-lessons-deselect-all');
  if (deselectAllBtn) {
    deselectAllBtn.addEventListener('click', () => {
      smartSelectedLessons = [];
      renderDeckSelectionView();
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
        studySelectedLessons = null;
        studyCustomCategory = null;
        startStudySession('unmemorized', activeLevel, `Học Từ Vựng HSK ${activeLevel}`, `Luyện ôn tập từ vựng chuẩn HSK Cấp ${activeLevel}`);
      } else {
        // If they have selected specific HSK lessons
        if (smartSelectedLessons.length > 0) {
          studySelectedLessons = [...smartSelectedLessons];
          studyCustomCategory = null;

          const title = `Ôn Tập ${smartSelectedLessons.length} Bài Học HSK ${activeLevel}`;
          const sortedIds = [...smartSelectedLessons].sort((a, b) => a - b);
          const lessonNames = sortedIds.map(id => `Bài ${id}`).join(', ');
          const desc = `Đang ôn tập từ vựng các bài: ${lessonNames}`;

          startStudySession('unmemorized', activeLevel, title, desc);
        } else {
          studySelectedLessons = null;
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
          } else {
            showToast('Vui lòng chọn ít nhất một bài học hoặc sổ tay để bắt đầu!', true);
          }
        }
      }
    });
  }

  // Curriculum Cards Interaction
  const hskCard = document.getElementById('curriculum-hsk-card');
  if (hskCard) {
    hskCard.addEventListener('click', () => {
      switchTab('lessons');
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
      switchTab('flashcards');
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
      studySelectedLessons = null;
      studyNotebookId = null;
      document.getElementById('flashcard-study-view').style.display = 'none';
      document.getElementById('deck-selection-view').style.display = 'block';
      if (activeNotebook) {
        showNotebookDashboardView(activeNotebook, true);
      } else {
        showTopicsView();
      }
      const flashcardSection = document.getElementById('flashcard-section');
      if (flashcardSection) flashcardSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Card Flip Click
  cardElement.addEventListener('click', (e) => {
    // Prevent flip if clicking a button, quick-save wrapper, or example box inside card actions
    if (e.target.closest('.circle-btn') || e.target.closest('.speak-example-btn') || e.target.closest('.example-box') || e.target.closest('.fc-quick-save-wrapper')) {
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
      markWordAsStudied(filteredList[currentIndex].id);
      speakText(filteredList[currentIndex].word);
    }
  });

  speakExampleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (filteredList.length > 0 && filteredList[currentIndex].example_zh) {
      markWordAsStudied(filteredList[currentIndex].id);
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

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      // Reset all filter controls
      studySelectedLessons = null;
      if (levelTabsContainer) {
        levelTabsContainer.querySelectorAll('.level-tab').forEach(t => {
          t.classList.toggle('active', t.getAttribute('data-level') === 'all');
        });
      }
      activeLevel = 'all';

      if (statusFilterSelect) {
        statusFilterSelect.value = 'all';
      }
      activeStatus = 'all';

      if (searchInput) {
        searchInput.value = '';
      }
      searchQuery = '';
      if (clearSearchBtn) {
        clearSearchBtn.style.display = 'none';
      }

      stopAutoplay();
      applyFilters();
    });
  }

  // Autoplay
  if (autoplayBtn) {
    autoplayBtn.addEventListener('click', toggleAutoplay);
  }


  // Logout (sidebar)
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  // Logout (navbar)
  const logoutBtnNav = document.getElementById('logout-btn-nav');
  if (logoutBtnNav) {
    logoutBtnNav.addEventListener('click', handleLogout);
  }

  // Theme Toggle
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

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

  // Game History Modal Triggers
  const gameHistoryBtn = document.getElementById('game-history-btn');
  const gameHistoryModal = document.getElementById('game-history-modal');
  const closeHistoryBtn1 = document.getElementById('close-game-history');
  const closeHistoryBtn2 = document.getElementById('close-game-history-btn');

  if (gameHistoryBtn && gameHistoryModal) {
    gameHistoryBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Close dropdown
      const activeDropdown = document.querySelector('.user-dropdown.show-menu');
      if (activeDropdown) activeDropdown.classList.remove('show-menu');

      // Show modal
      gameHistoryModal.style.display = 'flex';

      const tbody = document.getElementById('game-history-rows');
      const emptyDiv = document.getElementById('game-history-empty');

      if (tbody) tbody.innerHTML = '';
      if (emptyDiv) emptyDiv.style.display = 'none';

      let userEmail = '';
      try {
        const uStr = localStorage.getItem('user');
        if (uStr) {
          const uObj = JSON.parse(uStr);
          if (uObj && uObj.email) userEmail = uObj.email;
        }
      } catch (e) { }

      const token = localStorage.getItem('session_token');
      if (!token && !userEmail && !currentUser) {
        if (emptyDiv) emptyDiv.style.display = 'block';
        return;
      }

      const activeEmail = userEmail || (currentUser && currentUser.email) || '';
      const localKey = activeEmail ? `local_game_history_${activeEmail}` : 'local_game_history_guest';
      let localHistory = [];
      try {
        localHistory = JSON.parse(localStorage.getItem(localKey) || '[]');
      } catch (e) { }

      const fetchUrl = activeEmail
        ? `${API_BASE_URL}/api/user/game-history?email=${encodeURIComponent(activeEmail)}`
        : `${API_BASE_URL}/api/user/game-history`;

      const renderHistory = (historyArr) => {
        if (!historyArr || !Array.isArray(historyArr) || historyArr.length === 0) {
          if (emptyDiv) emptyDiv.style.display = 'block';
          return;
        }

        if (emptyDiv) emptyDiv.style.display = 'none';
        if (tbody) tbody.innerHTML = '';

        // Deduplicate records by playedAt timestamp
        const seen = new Set();
        const uniqueHistory = [];
        historyArr.forEach(item => {
          if (item && item.playedAt && !seen.has(item.playedAt)) {
            seen.add(item.playedAt);
            uniqueHistory.push(item);
          }
        });

        // Sort by newest played first
        uniqueHistory.sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));

        const modeNames = {
          'zh-vi': 'Chữ Hán ➔ Việt',
          'vi-zh': 'Việt ➔ Chữ Hán',
          'zh-pinyin': 'Chữ Hán ➔ Pinyin',
          'pinyin-zh': 'Pinyin ➔ Chữ Hán',
          'mix': 'Hỗn hợp'
        };

        uniqueHistory.forEach(item => {
          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid var(--border-glass)';
          tr.style.transition = 'background 0.2s';
          tr.onmouseover = () => tr.style.background = 'rgba(255,255,255,0.02)';
          tr.onmouseout = () => tr.style.background = 'transparent';

          const date = new Date(item.playedAt).toLocaleString('vi-VN', {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          });

          const modeName = modeNames[item.mode] || item.mode;
          const levelLabel = item.level === 'all' ? 'Tất cả' : `HSK ${item.level}`;

          tr.innerHTML = `
          <td style="padding: 12px 16px; color: var(--text-secondary);">${date}</td>
          <td style="padding: 12px 16px; font-weight: 500;">${modeName}</td>
          <td style="padding: 12px 16px; text-align: center; color: var(--accent-teal); font-weight: 600;">${levelLabel}</td>
          <td style="padding: 12px 16px; text-align: center; color: #ffd700; font-weight: 700; font-size: 1.05rem;">${item.score}</td>
          <td style="padding: 12px 16px; text-align: center;">${item.stage} câu</td>
          <td style="padding: 12px 16px; text-align: center; color: var(--success); font-weight: 600;">${item.combo}</td>
        `;
          tbody.appendChild(tr);
        });
      };

      // Show local history immediately for instant UI feedback
      if (localHistory.length > 0) {
        renderHistory(localHistory);
      }

      fetch(fetchUrl, {
        headers: getAuthHeaders()
      })
        .then(res => res.json())
        .then(history => {
          const serverArr = Array.isArray(history) ? history : [];
          const merged = [...localHistory, ...serverArr];
          renderHistory(merged);
        })
        .catch(err => {
          console.error("Error loading game history from server, showing local data:", err);
          if (localHistory.length > 0) {
            renderHistory(localHistory);
          } else if (emptyDiv) {
            emptyDiv.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="font-size: 2.5rem; margin-bottom: 12px; color: var(--danger);"></i><p>Không thể tải lịch sử chơi game từ máy chủ.</p>';
            emptyDiv.style.display = 'block';
          }
        });
    });

    const closeModal = () => {
      gameHistoryModal.style.display = 'none';
    };

    if (closeHistoryBtn1) closeHistoryBtn1.addEventListener('click', closeModal);
    if (closeHistoryBtn2) closeHistoryBtn2.addEventListener('click', closeModal);
    gameHistoryModal.addEventListener('click', (e) => {
      if (e.target === gameHistoryModal) {
        closeModal();
      }
    });
  }

  // Form submission
  addWordForm.addEventListener('submit', handleAddWordForm);

  // Keyboard navigation hotkeys (Only for HSK Exam Player)
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
      markWordAsStudied(current.id);
      typeHintBtn.innerHTML = `<i class="fa-solid fa-eye"></i> Pinyin: ${current.pinyin}`;
      typeHintBtn.disabled = true;
    });
  }

  const typeRevealBtn = document.getElementById('type-reveal-btn');
  if (typeRevealBtn) {
    typeRevealBtn.addEventListener('click', () => {
      if (filteredList.length === 0) return;
      const current = filteredList[currentIndex];
      markWordAsStudied(current.id);
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
      if (filteredList.length > 0) {
        markWordAsStudied(filteredList[currentIndex].id);
        speakText(filteredList[currentIndex].word);
      }
    });
  }

  const typeSpeakExBtn = document.getElementById('type-speak-example-btn');
  if (typeSpeakExBtn) {
    typeSpeakExBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (filteredList.length > 0 && filteredList[currentIndex].example_zh) {
        markWordAsStudied(filteredList[currentIndex].id);
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
      studySelectedLessons = null;
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
        studySelectedLessons = null;
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
        studySelectedLessons = null;
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
      if (activeHskVersion) params.set('hskVersion', activeHskVersion);

      window.open(`detail-list.html?${params.toString()}`, '_blank');
    });
  }

  // HSK Version Switcher click listeners
  const lv3Btn = document.getElementById('lessons-version-3-btn');
  const lv2Btn = document.getElementById('lessons-version-2-btn');
  const sv3Btn = document.getElementById('smart-hsk-version-3-btn');
  const sv2Btn = document.getElementById('smart-hsk-version-2-btn');
  const ev3Btn = document.getElementById('exams-version-3-btn');
  const ev2Btn = document.getElementById('exams-version-2-btn');

  const setHskVersion = (version) => {
    activeHskVersion = version;
    if (version === 'yct') {
      activeLessonsCurriculum = 'yct';
    } else {
      activeLessonsCurriculum = 'hsk';
    }
    localStorage.setItem('active_hsk_version', activeHskVersion);
    updateVersionButtonsUI();

    // Refresh lists and stats dynamically
    renderLessonsList();
    renderSubdecksList();
    updateStats();
    applyFilters();
    updateExamsVersionUI();
  };

  const svYctBtn = document.getElementById('smart-yct-version-btn');

  if (lv3Btn) lv3Btn.addEventListener('click', () => setHskVersion('3.0'));
  if (lv2Btn) lv2Btn.addEventListener('click', () => setHskVersion('2.0'));
  if (sv3Btn) sv3Btn.addEventListener('click', () => setHskVersion('3.0'));
  if (sv2Btn) sv2Btn.addEventListener('click', () => setHskVersion('2.0'));
  if (svYctBtn) svYctBtn.addEventListener('click', () => setHskVersion('yct'));
  if (ev3Btn) ev3Btn.addEventListener('click', () => setHskVersion('3.0'));
  if (ev2Btn) ev2Btn.addEventListener('click', () => setHskVersion('2.0'));

  // Initialize version switcher buttons UI state on load
  updateVersionButtonsUI();
  updateExamsVersionUI();

  // --- NEW NOTEBOOK & QUIZ EVENT LISTENERS ---
  const topicPersonalBtn = document.getElementById('topic-personal-btn');
  const topicHskBtn = document.getElementById('topic-hsk-btn');
  const topicPremiumBtn = document.getElementById('topic-premium-btn');
  const backToTopicsBtn = document.getElementById('back-to-topics-btn');
  const backToSubdecksBtn = document.getElementById('back-to-subdecks-btn');

  if (topicPersonalBtn) {
    topicPersonalBtn.addEventListener('click', () => {
      activeSmartTopic = 'personal';
      showSubdecksView();
    });
  }
  if (topicHskBtn) {
    topicHskBtn.addEventListener('click', () => {
      activeSmartTopic = 'hsk';
      showSubdecksView();
    });
  }
  if (topicPremiumBtn) {
    topicPremiumBtn.addEventListener('click', () => {
      activeSmartTopic = 'premium';
      showSubdecksView();
    });
  }
  if (backToTopicsBtn) {
    backToTopicsBtn.addEventListener('click', () => {
      showTopicsView();
    });
  }
  if (backToSubdecksBtn) {
    backToSubdecksBtn.addEventListener('click', () => {
      showSubdecksView();
    });
  }

  // Notebook Dashboard Buttons
  const nbStartFlashcardBtn = document.getElementById('nb-start-flashcard-btn');
  const nbStartTypingBtn = document.getElementById('nb-start-typing-btn');
  const nbStartQuizBtn = document.getElementById('nb-start-quiz-btn');
  const nbAddWordForm = document.getElementById('nb-add-word-form');
  const nbSearchInput = document.getElementById('nb-search-input');

  if (nbStartFlashcardBtn) {
    nbStartFlashcardBtn.addEventListener('click', () => {
      startStudySessionFromNotebook('flip');
    });
  }
  if (nbStartTypingBtn) {
    nbStartTypingBtn.addEventListener('click', () => {
      startStudySessionFromNotebook('type');
    });
  }
  if (nbStartQuizBtn) {
    nbStartQuizBtn.addEventListener('click', () => {
      startQuizSession();
    });
  }
  if (nbAddWordForm) {
    nbAddWordForm.addEventListener('submit', handleNotebookAddWordForm);
  }
  if (nbSearchInput) {
    nbSearchInput.addEventListener('input', () => {
      currentNotebookPage = 1;
      renderNotebookWordsTable();
    });
  }

  // Bind interactive statistics boxes in handbook dashboard
  document.querySelectorAll('#nb-stats-interactive-container .stat-box-interactive').forEach(box => {
    box.addEventListener('click', () => {
      // Remove active class and reset background from all
      document.querySelectorAll('#nb-stats-interactive-container .stat-box-interactive').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'rgba(255, 255, 255, 0.02)';
        b.style.borderColor = 'var(--border-glass)';
      });

      // Add active class and set background/border for clicked
      box.classList.add('active');
      const filter = box.getAttribute('data-filter');
      dashboardActiveFilter = filter;

      if (filter === 'all') {
        box.style.background = 'rgba(59, 130, 246, 0.08)';
        box.style.borderColor = 'var(--accent-blue)';
      } else if (filter === 'studied') {
        box.style.background = 'rgba(139, 92, 246, 0.08)';
        box.style.borderColor = 'var(--accent-purple)';
      } else if (filter === 'unstudied') {
        box.style.background = 'rgba(20, 184, 166, 0.08)';
        box.style.borderColor = 'var(--accent-teal)';
      } else if (filter === 'memorized') {
        box.style.background = 'rgba(16, 185, 129, 0.08)';
        box.style.borderColor = 'var(--success)';
      } else if (filter === 'unmemorized') {
        box.style.background = 'rgba(239, 68, 68, 0.08)';
        box.style.borderColor = 'var(--danger)';
      } else if (filter === 'starred') {
        box.style.background = 'rgba(245, 158, 11, 0.08)';
        box.style.borderColor = 'var(--warning)';
      }

      // Sync the filter buttons under "Phương thức ôn tập"
      const filterBtns = document.querySelectorAll('.filter-btn');
      filterBtns.forEach(b => {
        b.classList.toggle('active-filter', b.getAttribute('data-filter') === filter);
      });

      currentNotebookPage = 1;
      renderNotebookWordsTable();
    });
  });

  // Notebook Dashboard filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active-filter'));
      btn.classList.add('active-filter');
      const filterVal = btn.getAttribute('data-filter');
      dashboardActiveFilter = filterVal;

      // Update the active state in the top stats boxes to match this filter
      document.querySelectorAll('#nb-stats-interactive-container .stat-box-interactive').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'rgba(255, 255, 255, 0.02)';
        b.style.borderColor = 'var(--border-glass)';

        if (b.getAttribute('data-filter') === filterVal) {
          b.classList.add('active');
          if (filterVal === 'all') {
            b.style.background = 'rgba(59, 130, 246, 0.08)';
            b.style.borderColor = 'var(--accent-blue)';
          } else if (filterVal === 'studied') {
            b.style.background = 'rgba(139, 92, 246, 0.08)';
            b.style.borderColor = 'var(--accent-purple)';
          } else if (filterVal === 'unstudied') {
            b.style.background = 'rgba(20, 184, 166, 0.08)';
            b.style.borderColor = 'var(--accent-teal)';
          } else if (filterVal === 'memorized') {
            b.style.background = 'rgba(16, 185, 129, 0.08)';
            b.style.borderColor = 'var(--success)';
          } else if (filterVal === 'unmemorized') {
            b.style.background = 'rgba(239, 68, 68, 0.08)';
            b.style.borderColor = 'var(--danger)';
          } else if (filterVal === 'starred') {
            b.style.background = 'rgba(245, 158, 11, 0.08)';
            b.style.borderColor = 'var(--warning)';
          }
        }
      });

      currentNotebookPage = 1;
      renderNotebookWordsTable();
    });
  });

  // Quiz Game Buttons
  const quizBackBtn = document.getElementById('quiz-back-btn');
  const quizNextBtn = document.getElementById('quiz-next-btn');
  const quizRetryBtn = document.getElementById('quiz-retry-btn');
  const quizExitBtn = document.getElementById('quiz-exit-btn');

  if (quizBackBtn) {
    quizBackBtn.addEventListener('click', () => {
      showNotebookDashboardView(activeNotebook, true);
    });
  }
  if (quizNextBtn) {
    quizNextBtn.addEventListener('click', () => {
      currentQuizIndex++;
      renderQuizQuestion();
    });
  }
  if (quizRetryBtn) {
    quizRetryBtn.addEventListener('click', () => {
      startQuizSession();
    });
  }
  if (quizExitBtn) {
    quizExitBtn.addEventListener('click', () => {
      showNotebookDashboardView(activeNotebook, true);
    });
  }
  const markUnmemorizedBtn = document.getElementById('mark-unmemorized-btn');
  if (markUnmemorizedBtn) {
    markUnmemorizedBtn.addEventListener('click', () => {
      if (filteredList.length > 0) {
        const current = filteredList[currentIndex];
        if (current.isMemorized) {
          toggleWordMemorized(current.id);
        } else if (!current.isStudied) {
          markWordAsStudied(current.id);
          updateStats();
          applyFilters(true);
        }
      }
    });
  }

  // Click handler for game arena start button
  const nbStartGameArenaBtn = document.getElementById('nb-start-game-arena-btn');
  if (nbStartGameArenaBtn) {
    nbStartGameArenaBtn.addEventListener('click', () => {
      startGameArenaFromNotebook();
    });
  }

  // Click handler for game arena back button
  const gamePlayBackBtn = document.getElementById('game-play-back-btn');
  if (gamePlayBackBtn) {
    gamePlayBackBtn.addEventListener('click', () => {
      const gamePlayView = document.getElementById('game-play-view');
      if (gamePlayView) gamePlayView.style.display = 'none';

      const deckSelectionView = document.getElementById('deck-selection-view');
      if (deckSelectionView) deckSelectionView.style.display = 'block';

      const iframe = document.getElementById('game-play-iframe');
      if (iframe) iframe.src = '';

      if (activeNotebook) {
        openNotebookDashboard(activeNotebook);
      }
    });
  }

  // Handle messages sent from game iframe
  window.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'VOCAB_STATE_UPDATED') {
      console.log('Real-time sync: Vocab state updated in game, refreshing data...');
      await fetchVocabulary();
      if (activeNotebook) {
        openNotebookDashboard(activeNotebook);
      }
    }
  });
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

// --- AUTHENTICATION & LOGIN LOGIC ---

// Fetch current user from session / local storage and initialize Google Sign-In SDK
async function initAuth() {
  // 1. Load instantly from local storage so logged in user profile is rendered immediately
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

  // 2. Refresh active session with backend API
  try {
    const res = await fetch(API_BASE_URL + '/api/auth/me', {
      headers: getAuthHeaders(),
      credentials: 'include',
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        currentUser = data.user;
        localStorage.setItem('user', JSON.stringify(currentUser));
        renderUserProfile();
        return;
      } else if (!currentUser) {
        // Only clear if we had no offline session
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

  // 3. Initialize Google Identity Services if not logged in
  if (!currentUser) {
    renderUserProfile();
    initGoogleSignIn();
  }
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

      // Clear guest progress so it doesn't merge
      localStorage.removeItem('guest_progress');
      localStorage.removeItem('guest_custom_words');

      // Re-fetch vocabulary and reload user statistics
      await fetchVocabulary();
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

  // Reset guest stats in-memory
  guestStudyTime = 0;
  guestStreak = 0;
  guestLastActive = '';

  // Clear guest progress in local storage just in case
  localStorage.removeItem('guest_progress');
  localStorage.removeItem('guest_custom_words');

  // Re-fetch vocabulary to load guest state
  await fetchVocabulary();

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
  1: { time: 35, questionsCount: 40, listenCount: 20, readCount: 20, writeCount: 0, title: "Sơ cấp - HSK Cấp 1" },
  2: { time: 55, questionsCount: 60, listenCount: 35, readCount: 25, writeCount: 0, title: "Sơ cấp - HSK Cấp 2" },
  3: { time: 90, questionsCount: 80, listenCount: 40, readCount: 30, writeCount: 10, title: "Sơ cấp - HSK Cấp 3" },
  4: { time: 105, questionsCount: 100, listenCount: 45, readCount: 40, writeCount: 15, title: "Trung cấp - HSK Cấp 4" },
  5: { time: 125, questionsCount: 100, listenCount: 45, readCount: 45, writeCount: 10, title: "Trung cấp - HSK Cấp 5" },
  6: { time: 140, questionsCount: 101, listenCount: 50, readCount: 50, writeCount: 1, title: "Cao cấp - HSK Cấp 6" }
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
  let levelVocabs = vocabList.filter(w => {
    if (w.isCustom) return false;
    if (w.level === 'premium') return false;
    return matchLevel(w.level, level) && (w.hskVersion || '3.0') === activeHskVersion;
  });

  if (levelVocabs.length === 0) {
    levelVocabs = vocabList.filter(w => (w.hskVersion || '3.0') === activeHskVersion);
  }
  if (levelVocabs.length === 0) {
    levelVocabs = [
      { word: "我", pinyin: "wǒ", meaning: "tôi", level: 1, category: "Đại từ", example_zh: "我是学生。", example_vi: "tôi là học sinh." },
      { word: "nǐ", pinyin: "nǐ", meaning: "bạn", level: 1, category: "Đại từ", example_zh: "你好吗？", example_vi: "bạn khỏe không?" },
      { word: "他", pinyin: "tā", meaning: "anh ấy", level: 1, category: "Đại từ", example_zh: "他是老师。", example_vi: "anh ấy là giáo viên." },
      { word: "是", pinyin: "shì", meaning: "là", level: 1, category: "Động từ", example_zh: "我是学生。", example_vi: "tôi là học sinh." }
    ];
  }

  const meta = HSK_LEVELS_METADATA[level] || { time: 45, questionsCount: 40 };
  const qCount = meta.questionsCount;

  // Shuffle level vocabs deterministically per level
  const masterLevelVocab = seededShuffle(levelVocabs, level * 7919);

  // Shift index based on setNumber so each of the 20 sets gets a distinct, non-overlapping vocab slice
  const stepOffset = Math.max(1, Math.floor(masterLevelVocab.length / 20));
  const startOffset = (setNumber - 1) * stepOffset;

  let listenCount = meta.listenCount || Math.round(qCount * 0.4);
  let readCount = meta.readCount || Math.round(qCount * 0.5);

  const questions = [];

  for (let i = 0; i < qCount; i++) {
    const vocabIndex = (startOffset + i) % masterLevelVocab.length;
    const vocabItem = masterLevelVocab[vocabIndex];

    let section = "Phần II: Đọc hiểu (阅读)";
    let isListening = false;
    let isWriting = false;

    if (i < listenCount) {
      section = "Phần I: Nghe hiểu (听力)";
      isListening = true;
    } else if (i >= listenCount + readCount) {
      section = "Phần III: Viết & Viết luận (书写)";
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
    const roadmapSec = document.getElementById('roadmap-view-section');
    if (roadmapSec) roadmapSec.style.display = 'none';

    // Render lessons list
    renderLessonsList();
  }
  else if (tabId === 'roadmap') {
    // Hide home elements
    setDisp(homeViewSec, 'none');

    // Show roadmap section
    setDisp(flashcardSec, 'none');
    setDisp(customSec, 'none');
    setDisp(examsSec, 'none');
    setDisp(lessonsSec, 'none');
    const roadmapSec = document.getElementById('roadmap-view-section');
    if (roadmapSec) roadmapSec.style.display = 'block';

    renderGamifiedRoadmapPath();
  }
  else if (tabId === 'exams') {
    // Hide home elements
    setDisp(homeViewSec, 'none');

    // Show exams section
    setDisp(flashcardSec, 'none');
    setDisp(customSec, 'none');
    setDisp(examsSec, 'block');
    setDisp(lessonsSec, 'none');

    const libraryPanel = document.getElementById('exam-panel-library');
    if (libraryPanel) libraryPanel.style.display = 'block';
    renderExamLibrary('all');
  }
  else if (tabId === 'flashcards') {
    // Hide home elements
    setDisp(homeViewSec, 'none');

    // Show flashcards section
    setDisp(flashcardSec, 'block');
    setDisp(customSec, 'none');
    setDisp(examsSec, 'none');
    setDisp(lessonsSec, 'none');

    // Always show the topics view menu first
    showTopicsView();
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

  // If navigating away from flashcards, stop game iframe to prevent audio leak
  if (tabId !== 'flashcards') {
    const gameIframe = document.getElementById('game-play-iframe');
    if (gameIframe && gameIframe.src !== '') {
      gameIframe.src = '';
    }
    const gamePlaySec = document.getElementById('game-play-view');
    if (gamePlaySec) {
      gamePlaySec.style.display = 'none';
    }
  }

  // 3. Sync top navbar & left sidebar active state
  const homeBtn = document.getElementById('nav-home-btn');
  const flashcardsBtn = document.getElementById('nav-flashcards-btn');
  const customBtn = document.getElementById('nav-custom-btn');
  const examsBtn = document.getElementById('nav-exams-btn');

  if (homeBtn) homeBtn.classList.toggle('active', tabId === 'home');
  if (flashcardsBtn) flashcardsBtn.classList.toggle('active', tabId === 'flashcards');
  if (customBtn) customBtn.classList.toggle('active', tabId === 'dictionary');
  if (examsBtn) examsBtn.classList.toggle('active', tabId === 'exams');

  // Sync Left Sidebar items
  document.querySelectorAll('.sidebar-item').forEach(item => {
    const itemTab = item.getAttribute('data-tab');
    if (itemTab) {
      item.classList.toggle('active', itemTab === tabId);
    }
  });
}
window.switchTab = switchTab;

function showHomeView() {
  switchTab('home');
}

function showRoadmapView() {
  switchTab('roadmap');
}
window.showRoadmapView = showRoadmapView;

let activeRoadmapVersion = '3.0';

function renderGamifiedRoadmapPath() {
  const container = document.getElementById('roadmap-path-nodes-container');
  if (!container) return;

  const hskVer = activeRoadmapVersion || '3.0';

  let levelsData = [];
  if (hskVer === 'yct') {
    levelsData = [
      { level: 1, name: 'YCT Cấp 1', desc: 'Thiếu nhi sơ cấp 1 - 80 từ vựng cơ bản', count: '80 từ', color: '#10b981' },
      { level: 2, name: 'YCT Cấp 2', desc: 'Thiếu nhi sơ cấp 2 - 150 từ vựng thông dụng', count: '150 từ', color: '#3b82f6' },
      { level: 3, name: 'YCT Cấp 3', desc: 'Thiếu nhi trung cấp 3 - 300 từ vựng giao tiếp', count: '300 từ', color: '#f59e0b' },
      { level: 4, name: 'YCT Cấp 4', desc: 'Thiếu nhi cao cấp 4 - 600 từ vựng nâng cao', count: '600 từ', color: '#8b5cf6' }
    ];
  } else if (hskVer === '2.0') {
    levelsData = [
      { level: 1, name: 'HSK 1 (2.0)', desc: 'Nhập môn sơ cấp - 150 từ vựng cơ bản nhất', count: '150 từ', color: '#10b981' },
      { level: 2, name: 'HSK 2 (2.0)', desc: 'Giao tiếp cơ bản - 300 từ vựng sinh hoạt', count: '300 từ', color: '#3b82f6' },
      { level: 3, name: 'HSK 3 (2.0)', desc: 'Trung cấp 1 - 600 từ vựng giao tiếp tự tin', count: '600 từ', color: '#06b6d4' },
      { level: 4, name: 'HSK 4 (2.0)', desc: 'Trung cấp 2 - 1,200 từ vựng học tập & làm việc', count: '1,200 từ', color: '#f59e0b' },
      { level: 5, name: 'HSK 5 (2.0)', desc: 'Cao cấp 1 - 2,500 từ vựng báo chí & công sở', count: '2,500 từ', color: '#ec4899' },
      { level: 6, name: 'HSK 6 (2.0)', desc: 'Thành thạo - 5,000 từ vựng chuyên sâu & dịch thuật', count: '5,000 từ', color: '#8b5cf6' }
    ];
  } else {
    // HSK 3.0
    levelsData = [
      { level: 1, name: 'HSK 1 (3.0)', desc: 'Sơ cấp 1 - 500 từ vựng & âm tiết ngữ pháp cơ bản', count: '500 từ', color: '#10b981' },
      { level: 2, name: 'HSK 2 (3.0)', desc: 'Sơ cấp 2 - 1,272 từ vựng giao tiếp đa dạng', count: '1,272 từ', color: '#3b82f6' },
      { level: 3, name: 'HSK 3 (3.0)', desc: 'Sơ cấp 3 - 2,245 từ vựng hoàn thiện nền tảng', count: '2,245 từ', color: '#06b6d4' },
      { level: 4, name: 'HSK 4 (3.0)', desc: 'Trung cấp 4 - 3,245 từ vựng học thuật & đời sống', count: '3,245 từ', color: '#f59e0b' },
      { level: 5, name: 'HSK 5 (3.0)', desc: 'Trung cấp 5 - 4,316 từ vựng làm việc & công sở', count: '4,316 từ', color: '#ec4899' },
      { level: 6, name: 'HSK 6 (3.0)', desc: 'Trung cấp 6 - 5,456 từ vựng cao cấp & học thuật', count: '5,456 từ', color: '#8b5cf6' },
      { level: '7-9', name: 'New HSK 7-9 (3.0)', desc: 'Cao cấp HSK 7-9 - 6,016 từ vựng chuyên sâu cho bậc Đại học & Chuyên gia', count: '6,016 từ', color: '#a855f7' }
    ];
  }

  let html = '';
  const positions = ['pos-center', 'pos-left', 'pos-center', 'pos-right'];

  levelsData.forEach((item, idx) => {
    const isCompleted = idx === 0;
    const isActive = idx === 0 || idx === 1;

    const posClass = positions[idx % positions.length];
    const statusBadge = isCompleted
      ? `<span class="roadmap-badge done"><i class="fa-solid fa-circle-check"></i> Hoàn thành 100%</span>`
      : (isActive ? `<span class="roadmap-badge active-pulse"><i class="fa-solid fa-bolt"></i> Đang học</span>` : `<span class="roadmap-badge locked"><i class="fa-solid fa-lock"></i> Chưa mở khóa</span>`);

    const iconClass = isCompleted ? 'fa-check' : (isActive ? 'fa-graduation-cap' : 'fa-lock');
    const nodeState = isCompleted ? 'node-done' : (isActive ? 'node-active' : 'node-locked');

    html += `
      <div class="roadmap-node-item ${posClass} ${nodeState}">
        <div class="node-icon-circle" style="border-color: ${item.color};" onclick="goToRoadmapLevel('${hskVer}', ${item.level})">
          <i class="fa-solid ${iconClass}" style="color: ${item.color};"></i>
          <span class="node-num" style="color: #fff;">${item.level}</span>
        </div>

        <div class="node-info-card">
          <div class="node-card-top">
            <span class="node-card-title">${item.name}</span>
            ${statusBadge}
          </div>
          <div class="node-card-sub">${item.desc}</div>
          <div class="node-card-actions" style="display: flex; gap: 8px;">
            <button class="btn-node-start" style="background: ${item.color};" onclick="goToRoadmapLevel('${hskVer}', ${item.level})">
              Khám Phá Cấp ${item.level} <i class="fa-solid fa-arrow-right"></i>
            </button>
            <button class="btn-node-start" style="background: rgba(255,255,255,0.1); width: auto;" onclick="window.open('/quiz-game.html?level=${item.level}', '_blank')" title="Thi trắc nghiệm">
              <i class="fa-solid fa-gamepad"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    if (idx < levelsData.length - 1) {
      html += `
        <div style="text-align: center; color: rgba(255,255,255,0.3); font-size: 1.5rem; margin: -10px 0;">
          <i class="fa-solid fa-down-long"></i>
        </div>
      `;
    }
  });

  container.innerHTML = html;
}

window.renderGamifiedRoadmapPath = renderGamifiedRoadmapPath;
window.goToRoadmapLevel = function (ver, level) {
  if (window.setHskVersion) {
    window.setHskVersion(ver);
  }
  if (window.selectCurriculumLevel) {
    window.selectCurriculumLevel(level);
  }
  switchTab('lessons');
};
window.setRoadmapVersion = function (ver) {
  activeRoadmapVersion = ver;
  document.querySelectorAll('.roadmap-ver-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.ver === ver);
  });
  renderGamifiedRoadmapPath();
};

function showExamsView() {
  switchTab('exams');
}

function loadExamPapersList(level) {
  currentExamLevel = parseInt(level);
  document.getElementById('selected-level-title').textContent = `Đề Thi HSK Cấp ${currentExamLevel} (v${activeHskVersion})`;

  const papersGrid = document.getElementById('exam-papers-grid');
  papersGrid.innerHTML = '';

  const userKey = currentUser ? currentUser.email : 'guest';
  const progressKey = `hsk_exam_progress_${activeHskVersion === '2.0' ? 'v2_' : ''}${userKey}`;
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

// ===== REAL EXAM LIBRARY =====
const EXAM_DIRECT_DRIVE_LINKS = {
  "H1334": "https://drive.google.com/drive/folders/164VIGlRm4BEwtzc--hVgTBVNGgp3unDX",
  "H10000": "https://drive.google.com/drive/folders/1q1284TigDFFy-j0AHiKzVE2ptHpgj7Qu",
  "H10901": "https://drive.google.com/drive/folders/1RJDREa754e8cQ9Fh0pw05Tv3DuhhSMtZ",
  "H10902": "https://drive.google.com/drive/folders/1bn7E5CRft4tnY-nJnocpLRZ9f339v_PO",
  "H11003": "https://drive.google.com/drive/folders/1YRERGTZ3AsA2vkAIybBP6UZbZfTuk9kN",
  "H11004": "https://drive.google.com/drive/folders/1qTLhvHjsaUTzGPvJc11guTPg_03PsMdj",
  "H11005": "https://drive.google.com/drive/folders/15U4G9ytOqfIFbEDb3L_zVuuTe96oCd-J",
  "H11006": "https://drive.google.com/drive/folders/1uw9XYmjEjGdqwe3t1wkYSzHSrqwSuEKZ",
  "H11007": "https://drive.google.com/drive/folders/1Yb6gHwI_p0aVdsPgx_foZrNc2-zN4brf",
  "H11008": "https://drive.google.com/drive/folders/1AgvY-qjRLWkjFKwZ6o2eeC9IlCBIbbLy",
  "H11009": "https://drive.google.com/drive/folders/1Ule1XXp40J8mc_jRuRI0l89tymrYlhe7",
  "H11112": "https://drive.google.com/drive/folders/1qj30BD7gvg0141XVFDBzR7cSddRBYWDB",
  "H11113": "https://drive.google.com/drive/folders/1lIZKt-nD_rHY4Vx5aeWLREd-_U5KrGqf",
  "H11220": "https://drive.google.com/drive/folders/1oFFj-pbP16Y5djygXJWGuG02Y-LEZCiI",
  "H11221": "https://drive.google.com/drive/folders/12snkvPq9aIGPnfY2mfFgdXN4f6RUCnXh",
  "H11222": "https://drive.google.com/drive/folders/14rIQoLvHKsaCs2eYk6raPSEd4G5_-F_1",
  "H11223": "https://drive.google.com/drive/folders/15-3y3oxNmK1l1ZLxEAnyK0nhWUmNXID0",
  "H11329": "https://drive.google.com/drive/folders/1xAr7okZibW_0FAB_gDxB176SntW2iQ0w",
  "H11330": "https://drive.google.com/drive/folders/1gkHI6XsjRevokenVA3kqXznGY5cbqOlN",
  "H11331": "https://drive.google.com/drive/folders/1yQAcp01d-vUTHZqOJbbDizdMY3otrcQh",
  "H11332": "https://drive.google.com/drive/folders/1AO3xUuRrGkeffrfofRnfKp2cAQrcB3z1",
  "H20000": "https://drive.google.com/drive/folders/1vqVQasFve7y3zY_dUHg83dL_nQX3fWxD",
  "H20901": "https://drive.google.com/drive/folders/1q49tUSEoQgNjQvUPT5QcrDZp8hwOJlkL",
  "H20902": "https://drive.google.com/drive/folders/1ZgPFKwh2XZGwn-LcHqJHegJor0M1YVcC",
  "H21003": "https://drive.google.com/drive/folders/174wlmRov3CfTJi7JahLHuvZ9vVFDMTu-",
  "H21004": "https://drive.google.com/drive/folders/1J8DueJ1EX9EPavU8m76GweM6Lqk1qHK6",
  "H21005": "https://drive.google.com/drive/folders/1ymojRizeAr5-08yn1ftNdKhDot2CcHG5",
  "H21006": "https://drive.google.com/drive/folders/1J6xhFMdc-CYgCdmbVCizhawEeRAYIloO",
  "H21007": "https://drive.google.com/drive/folders/1x-kqUgx-7I3SKC8qJ12QHzdRVknOOMTd",
  "H21009": "https://drive.google.com/drive/folders/1XnBaT8ZpvqqbjHOY4gp7MFEOotblpB97",
  "H21112": "https://drive.google.com/drive/folders/1BQQCbV5Spgijiiv23sQvQbD9pN7tS9DS",
  "H21113": "https://drive.google.com/drive/folders/11N1wdiNraIuZCfGK0Mu6aswAjHLS18nU",
  "H21220": "https://drive.google.com/drive/folders/1taBGPNeobHN_zFcJFZB3rNxHgJRvenhI",
  "H21221": "https://drive.google.com/drive/folders/1wegjRw_dq3cWId5iD-UJNebmy2do_s4i",
  "H21222": "https://drive.google.com/drive/folders/1vPeMRSXgiK0UBdkzOUm4dK-hkFbiXIZJ",
  "H21223": "https://drive.google.com/drive/folders/1XDavGgAjvJhlqdLInKihQb0oyRBCexck",
  "H21329": "https://drive.google.com/drive/folders/1FsbRAHai7VEDJIAVy3v4V3hRoOQJMWin",
  "H21330": "https://drive.google.com/drive/folders/1kDIOIqA5q4uWDt8gmT_FQgC7uF8V8SSo",
  "H21331": "https://drive.google.com/drive/folders/1mD8SPEG__93VqBuzx_3QhNsgvrV9Sc6c",
  "H21334": "https://drive.google.com/drive/folders/1irvl5bpGWZ2YDPmeGGizimqIBn179jyX",
  "H30000": "https://drive.google.com/drive/folders/1y-iPBGX7onRq9YstFd4BzVmp6d49ta5b",
  "H31001": "https://drive.google.com/drive/folders/14Njw46pYlz6KsK6_AaWnGUVuzJRKE4P3",
  "H31002": "https://drive.google.com/drive/folders/1FqB7WOGXYZY_B39gKI-GujAhT6aP6RN4",
  "H31004": "https://drive.google.com/drive/folders/1xZYkYwLPzB8uShaNHUIshyWj1cNkMhke",
  "H31005": "https://drive.google.com/drive/folders/1KHi0HxhvxsiWsZh9PnoGbX0Vk7ZnTJt5",
  "H31006": "https://drive.google.com/drive/folders/1Gf22Cy2gXUgMVTSPP5vHVqCPIHO5GdXH",
  "H31007": "https://drive.google.com/drive/folders/1EIaBYK7XohkJ59g00zzCC92bpzeq-PKE",
  "H31008": "https://drive.google.com/drive/folders/1MGKg9rNhj4-WoAM8HzY2kgs4lXtRFDuC",
  "H31009": "https://drive.google.com/drive/folders/1unxdRr4p-9D6NrdGt61VVhxi2EFDGhfO",
  "H31110": "https://drive.google.com/drive/folders/1V5CLvq1AVx5P6JLeckKu152RVKWCrzzL",
  "H31111": "https://drive.google.com/drive/folders/1KLK4ligmkd3A5EkHk0nWz03BtVmXRcy7",
  "H31218": "https://drive.google.com/drive/folders/1_78QgpiTHjjctgZTdsNNUMHYGx7Mw3ov",
  "H31219": "https://drive.google.com/drive/folders/1QgNE5HocJ33Z78COc0x4d9q87lnXghRb",
  "H31220": "https://drive.google.com/drive/folders/1Y0IJRilhL7kbtkm7wnKoppge7ca7nUIz",
  "H31221": "https://drive.google.com/drive/folders/1dLqxrESMa33MeVeCgzTw-fr0pOqlUvhC",
  "H31327": "https://drive.google.com/drive/folders/1CmdWTe5n0I4lGjHUxxV5MEfrsPdahtlL",
  "H31332": "https://drive.google.com/drive/folders/1tGsT4roiLZ7M3Gsu4MCVnj1tXV5_Tjax",
  "H40000": "https://drive.google.com/drive/folders/12dVhEZ4MMOlPK4OCDAv3L2q-WyJxtRgL",
  "H41001": "https://drive.google.com/drive/folders/1SjmSjcqJthqRAi4qfEWcE2StSvV5Pysg",
  "H41002": "https://drive.google.com/drive/folders/1z1NkwavuBGGrzWjqxclSVTiDcRFB40Fa",
  "H41003": "https://drive.google.com/drive/folders/1AzwCVM7xSCTiren8qf225YWscGXaabOz",
  "H41004": "https://drive.google.com/drive/folders/1BBk7KOf8DfFM448lNn0KfAVkIvQ5oVDB",
  "H41005": "https://drive.google.com/drive/folders/1jxzrTK9qkRaH3mCEdmTTtYuHBjPb8M2x",
  "H41006": "https://drive.google.com/drive/folders/1AaUzUULDzmg3Z-if0hQn4YFZhkq4bANg",
  "H41007": "https://drive.google.com/drive/folders/1EyLCJFTwEGZ2BgcSgelni91BPvC8nZh0",
  "H41008": "https://drive.google.com/drive/folders/1Y1AsY_cp5h2-tKOBSMWGPa2ZfDQDGIv-",
  "H41009": "https://drive.google.com/drive/folders/1JN6Isbx298l4UUTyyqN0AVz7xM6GBcwe",
  "H41110": "https://drive.google.com/drive/folders/1pSTn49uZlTgfLtCmg-Bv1f3WGtFGDUCE",
  "H41111": "https://drive.google.com/drive/folders/1I6JgiO1c1MlnbkJ2x251eguKTVkRv4n2",
  "H41218": "https://drive.google.com/drive/folders/1RzC-XGdv8ojmUeO2vKsAiLHelcLhb6l0",
  "H41219": "https://drive.google.com/drive/folders/1tqmxZTSy_deHeWQ2NsmnzqYgxw93lVRc",
  "H41220": "https://drive.google.com/drive/folders/12LEdVK0OuiNnNj0BKa7MaeOwsDP5SKoD",
  "H41221": "https://drive.google.com/drive/folders/1sGWqnNWaRHCEZZw0S2fVgKTrGAUgnmZF",
  "H41327": "https://drive.google.com/drive/folders/12DozuF17bGh7OT5PCCrGY4g_5kKwGcMK",
  "H51001": "https://drive.google.com/drive/folders/1WXCroAbpPiFr4bKIwruGFxEBder6ukHh",
  "H51002": "https://drive.google.com/drive/folders/1K6pr4r0fssVGp5tKzFx57sSag8F4rSsV",
  "H51003": "https://drive.google.com/drive/folders/1wWsmhLHcdFMBK47Waj8Rzcu0Xf4wr1HS",
  "H51004": "https://drive.google.com/drive/folders/1MHMIA7lOxSd9XO-5hU6KnenSHHGiRw3e",
  "H51005": "https://drive.google.com/drive/folders/1NcDq1ZZ6btgzPgJcoYuIEuC7bywQlsyc",
  "H51007": "https://drive.google.com/drive/folders/1nYJZ65wC-izlObROWtFKG4barCT5YRWF",
  "H51008": "https://drive.google.com/drive/folders/1fwxmreCiYlgkwlZ_tCiUWF-jpDpvOAYv",
  "H51009": "https://drive.google.com/drive/folders/1Bec1_4as5Dg8X6A5JjVUfM0v3aHxYgTO",
  "H51110": "https://drive.google.com/drive/folders/1PpzP166-KGRuIx9xK7Jxm-EeUDa2c5go",
  "H51111": "https://drive.google.com/drive/folders/1F1bjPsx0e_rge31q8f_O2ob5xO2h4diQ",
  "H51218": "https://drive.google.com/drive/folders/1V1NbC-YFeMWC9nz7C9188fZE43XJ7XVU",
  "H51219": "https://drive.google.com/drive/folders/1lg2CZPAvBEZgVlmaKI4OO5daoO4Trzha",
  "H51220": "https://drive.google.com/drive/folders/1XADCoHuK7vciNRDzHnxA3h1-uP0eIHmw",
  "H51221": "https://drive.google.com/drive/folders/1j64QpnIFnaw7k2lr-ju-LTAenrYJe2bu",
  "H51327": "https://drive.google.com/drive/folders/1YbQsfSBeiRrCV8S0x821Y_hDzwkd6Drn",
  "H51328": "https://drive.google.com/drive/folders/1Tz2Q4hTRaBAqTbAr4smYSYuRtmeKfYJT",
  "H51329": "https://drive.google.com/drive/folders/166Mls6B6Cvf9ICrzLAPgk3J5AJ2xc3lw",
  "H51330": "https://drive.google.com/drive/folders/1FuHXdY_9-jSxi9EKUWFSrQICg7FfVQS3",
  "H51331": "https://drive.google.com/drive/folders/1Y9n8c1nzc7R4HTSqCswNaAVCQQNsFYAi",
  "H51332": "https://drive.google.com/drive/folders/1J39Jqnhq9VcIU8PIYoUlWHLXI2r4ulFJ",
  "H51333": "https://drive.google.com/drive/folders/1nTh-562IIpbLVUDwrAcyn4HgQEbUNoFn",
  "H51553B": "https://drive.google.com/drive/folders/1ubhf43vCosvZ8hsglSs4rGep9c4OwBad",
  "H51553C": "https://drive.google.com/drive/folders/1svx13FLqq5UPRogZ5Jo6-xh2li3jaOik",
  "H51553D": "https://drive.google.com/drive/folders/1CdtcY6DhX0Gf88wZs3lLiz7-cYQ-B9Dd",
  "H60000": "https://drive.google.com/drive/folders/1E8x9UQ8R3cE8xFQXVz3ZUTkm13tpjVqK",
  "H61001": "https://drive.google.com/drive/folders/19zbRhcDHrUsA1_kf_E2LjWKGxnojbmeI",
  "H61002": "https://drive.google.com/drive/folders/1lOwyl-4gX5bBQl-Lr79xVtx-gE3u_3Bh",
  "H61004": "https://drive.google.com/drive/folders/1R0DPatLPPpXM50CsmWUDgeA6zIHJg3X8",
  "H61005": "https://drive.google.com/drive/folders/1fVVYfe-KSeLVboWNCgnvyAHpifTIU9qG",
  "H61006": "https://drive.google.com/drive/folders/1JMwJf9jx4P-X3pER18cMi6-O2nP7bM4v",
  "H61007": "https://drive.google.com/drive/folders/1dlGDN16aOKk3B9Aj_8Nf7YheD0ZgOlzY",
  "H61008": "https://drive.google.com/drive/folders/1ljSj1oL0Knk0cAL3nsr8kJCZvCLvRKO0",
  "H61009": "https://drive.google.com/drive/folders/1dzYrhVf8wZUnafe_H5u36qThuAmoI7mJ",
  "H61110": "https://drive.google.com/drive/folders/1s7J2d_3hcUwOrnUNk96FTvPM3qAWtPTb",
  "H61111": "https://drive.google.com/drive/folders/1ZTe8_qa6n4Ya0L8Z2qvXmP92N5fYxOjx",
  "H61218": "https://drive.google.com/drive/folders/1feBIQgIWuGSxWJf3rwlVvMmcc2U-zYbQ",
  "H61219": "https://drive.google.com/drive/folders/14s5OG0r8PYENnCBYbQxd9JLWcrf3uH_s",
  "H61220": "https://drive.google.com/drive/folders/1cZFglKkEBLyM3XKCcwdLPvImQWwH8tU-",
  "H61221": "https://drive.google.com/drive/folders/1TOTbi9dUMhTeIhnCtwmGQ-McJAqZf2-W",
  "H61328": "https://drive.google.com/drive/folders/15SWovX-qweATO8nEhLcgm262jDuOvLmL",
  "H61329": "https://drive.google.com/drive/folders/1NLx8Dx6wFCX9ayOLVcTXMQE39bmDflh4",
  "H61330": "https://drive.google.com/drive/folders/1b7iandyBKiq6Zxhyz9B9hHLVQznRCgDW",
  "H61332": "https://drive.google.com/drive/folders/11lM1sQglIZ-ptLkl5E9OMSs6YaKauASS"
};
const DRIVE_BASE = 'https://drive.google.com/drive/folders/1F_NE_evsJwGQ-lD_0BM-y2X9kFUyyqu4?usp=sharing';

const EXAM_LEVEL_DRIVE_LINKS = {
  1: 'https://drive.google.com/drive/folders/1igjlfXAS-wWSYCqctMszsSuXm_rQifdt',
  2: 'https://drive.google.com/drive/folders/12UYGIBLlQZYPxgKfKooGyC9rO-X5x1wQ',
  3: 'https://drive.google.com/drive/folders/1oA5ue_Dmz6QDMKh3UAMw7OjD3jY_vNvG',
  4: 'https://drive.google.com/drive/folders/1i3uEqBMEHMgV87SxSWT6AXaBD-SWozZV',
  5: 'https://drive.google.com/drive/folders/1Nr6iAca2vWYUXkONwtrrOjE28hfp0hZZ',
  6: 'https://drive.google.com/drive/folders/1gmUsMb7XrWef0oc4G7pW0XiW9Xuc8ulb',
};

const EXAM_LEVEL_FOLDER_NAMES = {
  1: 'ĐỀ THI HSK 1 + FILE NGHE',
  2: 'ĐỀ THI HSK 2 + FILE NGHE',
  3: 'ĐỀ THI HSK 3 + FILE NGHE',
  4: 'ĐỀ THI HSK 4 + FILE NGHE',
  5: 'ĐỀ THI HSK 5 + FILE NGHE',
  6: 'ĐỀ THI HSK 6 + FILE NGHE',
};

const EXAM_LIBRARY_CATALOG = {
  1: ['H10000', 'H10901', 'H10902', 'H11003', 'H11004', 'H11005', 'H11006', 'H11007', 'H11008', 'H11009', 'H11112', 'H11113', 'H11220', 'H11221', 'H11222', 'H11223', 'H11329', 'H11330', 'H11331', 'H11332', 'H1334'],
  2: ['H20000', 'H20901', 'H20902', 'H21003', 'H21004', 'H21005', 'H21006', 'H21007', 'H21009', 'H21112', 'H21113', 'H21220', 'H21221', 'H21222', 'H21223', 'H21329', 'H21330', 'H21331', 'H21334'],
  3: ['H30000', 'H31001', 'H31002', 'H31004', 'H31005', 'H31006', 'H31007', 'H31008', 'H31009', 'H31110', 'H31111', 'H31218', 'H31219', 'H31220', 'H31221', 'H31327', 'H31332'],
  4: ['H40000', 'H41001', 'H41002', 'H41003', 'H41004', 'H41005', 'H41006', 'H41007', 'H41008', 'H41009', 'H41110', 'H41111', 'H41218', 'H41219', 'H41220', 'H41221', 'H41327'],
  5: ['H51001', 'H51002', 'H51003', 'H51004', 'H51005', 'H51007', 'H51008', 'H51009', 'H51110', 'H51111', 'H51218', 'H51219', 'H51220', 'H51221', 'H51327', 'H51328', 'H51329', 'H51330', 'H51331', 'H51332', 'H51333', 'H51553B', 'H51553C', 'H51553D'],
  6: ['H60000', 'H61001', 'H61002', 'H61004', 'H61005', 'H61006', 'H61007', 'H61008', 'H61009', 'H61110', 'H61111', 'H61218', 'H61219', 'H61220', 'H61221', 'H61328', 'H61329', 'H61330', 'H61332'],
};

function decodeExamCode(code) {
  const m = code.match(/^H(\d)(\d{2})(\d{2,3})$/);
  if (!m) return { year: null, session: null };
  const year = '20' + m[2];
  const session = parseInt(m[3]);
  return { year: year === '2000' ? 'Mẫu' : year, session };
}

function renderExamLibrary(filterLevel = 'all') {
  const grid = document.getElementById('exam-library-grid');
  if (!grid) return;
  grid.innerHTML = '';

  let allExams = [];
  for (const [lvl, codes] of Object.entries(EXAM_LIBRARY_CATALOG)) {
    codes.forEach(code => allExams.push({ level: parseInt(lvl), code }));
  }

  const filtered = filterLevel === 'all' ? allExams : allExams.filter(e => e.level === filterLevel);

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;padding:40px;">Không có đề thi nào.</p>';
    return;
  }

  filtered.forEach(({ level, code }) => {
    const { year, session } = decodeExamCode(code);
    const sessionText = year === 'Mẫu' ? 'Đề mẫu chính thức' : (session ? `Năm ${year} - Kỳ ${session}` : `Năm ${year}`);

    // Tự động định vị và lọc toàn bộ các file (Đề, Nghe, Đáp án, Bản dịch nghe 听力材料, Bài thi viết 书写) theo mã đề trên Google Drive
    // Link trực tiếp dẫn thẳng tới thư mục Google Drive chính xác của duy nhất mã đề này
    const directFolderUrl = EXAM_DIRECT_DRIVE_LINKS[code] || EXAM_LEVEL_DRIVE_LINKS[level] || DRIVE_BASE;
    const folderLink = directFolderUrl;
    const pdfLink = directFolderUrl;
    const mp3Link = directFolderUrl;
    const ansLink = directFolderUrl;
    const scriptLink = directFolderUrl;

    const card = document.createElement('div');
    card.className = 'exam-lib-card';
    card.setAttribute('data-lib-level', level);
    card.innerHTML = `
      <span class="exam-lib-card-level-badge">HSK ${level}</span>
      <p class="exam-lib-card-code">Đề thi ${code}</p>
      <p class="exam-lib-card-meta">
        <i class="fa-regular fa-calendar"></i> ${sessionText}
        &nbsp;·&nbsp; <i class="fa-solid fa-headphones"></i> Trọn bộ File nghe, Đáp án & Script
      </p>
      <div class="exam-lib-actions" style="display: flex; flex-wrap: wrap; gap: 8px;">
        <a class="exam-lib-btn exam-lib-btn-folder" href="${folderLink}" target="_blank" rel="noopener" title="Xem tất cả các file của đề thi ${code}" style="width: 100%; background: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.4); justify-content: center; font-weight: 700; padding: 8px 12px; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-folder-open"></i> Xem trọn bộ tài liệu đề ${code} (Full Files)
        </a>
        <a class="exam-lib-btn exam-lib-btn-pdf" href="${pdfLink}" target="_blank" rel="noopener" title="Mở file Đề thi PDF ${code} trên Google Drive">
          <i class="fa-solid fa-file-pdf"></i> Đề thi PDF
        </a>
        <a class="exam-lib-btn exam-lib-btn-mp3" href="${mp3Link}" target="_blank" rel="noopener" title="Mở file nghe MP3 ${code} trên Google Drive">
          <i class="fa-solid fa-headphones"></i> File nghe MP3
        </a>
        <a class="exam-lib-btn exam-lib-btn-ans" href="${ansLink}" target="_blank" rel="noopener" title="Mở file Đáp án ${code} trên Google Drive">
          <i class="fa-solid fa-key"></i> Đáp án
        </a>
        <a class="exam-lib-btn exam-lib-btn-script" href="${scriptLink}" target="_blank" rel="noopener" title="Mở Kịch bản nghe (听力材料) trên Google Drive" style="background: rgba(236, 72, 153, 0.15); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.3);">
          <i class="fa-solid fa-file-lines"></i> Kịch bản nghe
        </a>
      </div>
    `;
    grid.appendChild(card);
  });
}

window.switchExamTab = function (tab) {
  const libraryPanel = document.getElementById('exam-panel-library');
  if (libraryPanel) libraryPanel.style.display = 'block';
  renderExamLibrary('all');
};

window.filterExamLibrary = function (btn, level) {
  document.querySelectorAll('.exam-lib-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  renderExamLibrary(level === 'all' ? 'all' : parseInt(level));
};



function startExam(level, setNumber) {
  currentExamLevel = level;
  currentExamSet = setNumber;
  currentExamQuestions = generateExam(level, setNumber);
  currentExamAnswers = Array(currentExamQuestions.length).fill(null);
  activeQuestionIndex = 0;

  document.getElementById('player-exam-title').textContent = `Đề Thi HSK ${level} (v${activeHskVersion}) - Đề số ${setNumber.toString().padStart(2, '0')}`;
  document.getElementById('player-exam-level').textContent = `HSK ${level} (v${activeHskVersion})`;

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

    // Cập nhật nguồn audio của trình phát HTML5 sang ElevenLabs API
    const cleanText = cleanFrontendSpeechText(q.audioText);
    const currentVoice = localStorage.getItem('speech_voice') || 'elevenlabs-adam';
    const url = `${API_BASE_URL}/api/tts?text=${encodeURIComponent(cleanText)}&voice=${encodeURIComponent(currentVoice)}&_t=${Date.now()}`;

    if (examAudioPlayer) {
      examAudioPlayer.src = url;
    }
  } else {
    audioContainer.style.display = 'none';
    if (examAudioPlayer) examAudioPlayer.src = '';
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
  const progressKey = `hsk_exam_progress_${activeHskVersion === '2.0' ? 'v2_' : ''}${userKey}`;
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
      switchTab('exams');
    });
  }

  const navBrand = document.querySelector('.nav-brand');
  if (navBrand) {
    navBrand.addEventListener('click', () => {
      switchTab('home');
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

  // Explicitly hide hints and reveal button in typing mode as requested
  const typeHintBtn = document.getElementById('type-hint-pinyin-btn');
  const typeRevealBtn = document.getElementById('type-reveal-btn');
  if (typeHintBtn) {
    typeHintBtn.style.display = 'none';
  }
  if (typeRevealBtn) {
    typeRevealBtn.style.display = 'none';
  }

  // Explicitly hide/show bottom HUD buttons based on studyMode
  const markMemorizedBtn = document.getElementById('mark-memorized-btn');
  const markUnmemorizedBtn = document.getElementById('mark-unmemorized-btn');
  const markStarredBtn = document.getElementById('mark-starred-btn');
  if (mode === 'type') {
    if (markMemorizedBtn) markMemorizedBtn.style.display = 'none';
    if (markUnmemorizedBtn) markUnmemorizedBtn.style.display = 'none';
    if (markStarredBtn) markStarredBtn.style.display = 'none';
  } else {
    if (markMemorizedBtn) markMemorizedBtn.style.display = 'flex';
    if (markUnmemorizedBtn) markUnmemorizedBtn.style.display = 'flex';
    if (markStarredBtn) markStarredBtn.style.display = 'flex';
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

  if (typeLevel) {
    typeLevel.textContent = current.isCustom ? 'Cá nhân' : (current.level === 'premium' ? 'Premium' : `HSK ${current.level} (v${current.hskVersion || '3.0'})`);
  }
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
    hintBtn.style.display = 'none';
  }

  const typeRevealBtn = document.getElementById('type-reveal-btn');
  if (typeRevealBtn) {
    typeRevealBtn.style.display = 'none';
  }

  const checkBtn = document.getElementById('type-check-btn');
  if (checkBtn) {
    checkBtn.innerHTML = 'Kiểm tra';
  }
}

async function handleTypingCheck() {
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

  // Alternative Answers Validation: Split database word by |, /, ;, or commas
  const correctAnswerStr = current.word.trim();
  const acceptableAnswers = correctAnswerStr.split(/[\/|;；,，、]+/).map(ans => ans.trim().toLowerCase());
  const isCorrect = acceptableAnswers.includes(answer);

  if (answer === '') {
    feedback.textContent = 'Vui lòng nhập câu trả lời!';
    feedback.style.color = 'var(--warning)';
    return;
  }

  markWordAsStudied(current.id);

  if (isCorrect) {
    isTypingAnswerFinished = true;
    input.disabled = true;
    input.className = 'correct-glow';

    feedback.textContent = 'Chính xác! 🎉';
    feedback.style.color = 'var(--success)';

    speakText(current.word);

    if (current.isWrong) {
      setWordWrong(current.id, false);
    }

    // Nhập đúng là thuộc:
    if (!current.isMemorized) {
      await toggleWordMemorized(current.id);
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

      // Sai là không thuộc:
      if (current.isMemorized) {
        await toggleWordMemorized(current.id);
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
  window.updateChatbotOnLogin = function () {
    if (newBtn) newBtn.style.display = 'flex';
    if (historyBtn) historyBtn.style.display = 'flex';

    // Attempt to reload active thread or populate chatbot widget with latest cached thread
    activeThreadId = sessionStorage.getItem('hongtai_active_thread_id');
    if (activeThreadId) {
      loadActiveThread();
    }
  };

  // Global callback to migrate guest chats when logged in
  window.migrateGuestChatHistory = async function () {
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
  window.resetChatbotOnLogout = function () {
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
    { id: 1, title: 'Bài 1: Chào hỏi - 你好', desc: 'Học cách chào hỏi cơ bản, từ vựng thông dụng và cách nói lời xin lỗi.' },
    { id: 2, title: 'Bài 2: Cảm ơn - 谢谢 unit', desc: 'Học cách bày tỏ lòng biết ơn, nói lời tạm biệt và các đại từ chỉ bạn bè.' },
    { id: 3, title: 'Bài 3: Bạn tên là gì? - 你叫什么名字', desc: 'Học cách tự giới thiệu bản thân, quốc tịch, tên tuổi và nghề nghiệp.' },
    { id: 4, title: 'Bài 4: Cô ấy là giáo viên của tôi - 她是我的老师', desc: 'Học cách nói về mối quan hệ, nghề nghiệp và giới thiệu người khác.' },
    { id: 5, title: 'Bài 5: Gia đình tôi có 4 người - 我家有四口人', desc: 'Học cách đếm số, giới thiệu các thành viên trong gia đình.' },
    { id: 6, title: 'Bài 6: Tôi biết nói tiếng Trung - 我会说汉语', desc: 'Nói về khả năng, kỹ năng và các ngôn ngữ phổ biến.' },
    { id: 7, title: 'Bài 7: Hôm nay là thứ mấy? - 今天星期几', desc: 'Cách hỏi và trả lời về thời gian, ngày tháng trong tuần.' },
    { id: 8, title: 'Bài 8: Tôi muốn mua quả táo - 我想买苹果', desc: 'Học cách mua sắm, hỏi giá tiền và các loại hoa quả cơ bản.' },
    { id: 9, title: 'Bài 9: Thời tiết hôm nay thế nào? - 今天天气怎么样', desc: 'Mô tả thời tiết, nhiệt độ và các trạng thái tự nhiên.' },
    { id: 10, title: 'Bài 10: Tôi đang xem phim - 我在看电影', desc: 'Diễn tả các hành động đang xảy ra và sở thích giải trí.' }
  ],
  2: [
    { id: 1, title: 'Bài 1: Cuộc sống hàng ngày - 日常生活', desc: 'Học từ vựng mô tả thói quen sinh hoạt và ăn uống hàng ngày.' },
    { id: 2, title: 'Bài 2: Thể thao và Sức khỏe - 运动与健康', desc: 'Từ vựng các môn thể thao, rèn luyện thân thể và cảm giác cơ thể.' },
    { id: 3, title: 'Bài 3: Phương tiện giao thông - 交通工具', desc: 'Học từ vựng du lịch, các phương tiện đi lại như tàu hỏa, máy bay.' },
    { id: 4, title: 'Bài 4: Sở thích và giải trí - 兴趣与娱乐', desc: 'Thảo luận về âm nhạc, phim ảnh, đọc sách và các hoạt động thư giãn.' }
  ],
  3: [
    { id: 1, title: 'Bài 1: Giao tiếp văn phòng - 办公室', desc: 'Học từ vựng liên quan đến công việc, đồng nghiệp và công sở.' },
    { id: 2, title: 'Bài 2: Kỳ nghỉ lý thú - 快乐假期', desc: 'Học từ vựng đi du lịch nước ngoài, hỏi đường và trải nghiệm văn hóa.' },
    { id: 3, title: 'Bài 3: Mua sắm và Ẩm thực - 购物与美食', desc: 'Đặt món ăn tại nhà hàng, từ vựng các món ăn Trung Hoa nổi tiếng.' }
  ]
};

let activeVolumeFilter = 'all';

let activeYctLevel = 1;

function renderLessonsList() {
  const grid = document.getElementById('lessons-cards-grid');
  const objectivesText = document.getElementById('lessons-objectives-text');
  const lessonsLevelContainer = document.getElementById('lessons-level-pills-container');
  const yctLevelContainer = document.getElementById('lessons-yct-level-pills-container');
  const volumePillsContainer = document.getElementById('lessons-volume-pills-container');
  const levelSelect = document.getElementById('lessons-level-select');
  const yctLevelSelect = document.getElementById('lessons-yct-level-select');
  const volumeSelect = document.getElementById('lessons-volume-select');
  const hsk6Option = document.getElementById('hsk-level-6-option');

  const versionSelectorWrap = document.getElementById('lessons-version-selector-wrap');

  if (!grid) return;

  grid.innerHTML = '';

  if (activeLessonsCurriculum === 'yct') {
    if (lessonsLevelContainer) lessonsLevelContainer.style.display = 'none';
    if (volumePillsContainer) volumePillsContainer.style.display = 'none';
    if (versionSelectorWrap) versionSelectorWrap.style.display = 'none';
    if (yctLevelContainer) yctLevelContainer.style.display = 'flex';

    if (objectivesText) {
      if (activeYctLevel.toString() === '1') objectivesText.textContent = 'Mục tiêu: YCT Cấp 1 - Dành cho trẻ em mới bắt đầu (12 Bài học, 104 từ vựng)';
      else if (activeYctLevel.toString() === '2') objectivesText.textContent = 'Mục tiêu: YCT Cấp 2 - Dành cho trẻ em sơ cấp (12 Bài học, 85 từ vựng)';
      else if (activeYctLevel.toString() === '3') objectivesText.textContent = 'Mục tiêu: YCT Cấp 3 - Dành cho trẻ em trung cấp cơ bản (12 Bài học, 78 từ vựng)';
      else if (activeYctLevel.toString() === '4') objectivesText.textContent = 'Mục tiêu: YCT Cấp 4 - Dành cho trẻ em trung cấp hoàn chỉnh (12 Bài học, 84 từ vựng)';
      else objectivesText.textContent = `Mục tiêu: Ôn tập từ vựng YCT Cấp ${activeYctLevel}`;
    }

    const yctVocabs = vocabList.filter(w =>
      !w.isCustom &&
      (w.curriculum === 'yct' || w.hskVersion === 'yct') &&
      w.level.toString() === activeYctLevel.toString()
    );

    if (yctVocabs.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; color: var(--text-muted); font-style: italic;">
          Danh sách từ vựng YCT Cấp ${activeYctLevel} đang được tổng hợp! Vui lòng chờ ít phút.
        </div>
      `;
      return;
    }

    // Group dynamically by lessonId
    const lessonGroups = {};
    yctVocabs.forEach(w => {
      const les = w.lessonId || 1;
      if (!lessonGroups[les]) lessonGroups[les] = [];
      lessonGroups[les].push(w);
    });

    const uniqueLessonIds = Object.keys(lessonGroups).map(Number).sort((a, b) => a - b);

    uniqueLessonIds.forEach(lessonId => {
      const sliceWords = lessonGroups[lessonId] || [];
      const wordsCount = sliceWords.length;
      if (wordsCount === 0) return;

      const title = sliceWords[0].lessonTitle || `YCT ${activeYctLevel} - Bài ${lessonId}`;
      const desc = sliceWords[0].lessonDesc || `Từ vựng YCT (Thiếu nhi) Cấp ${activeYctLevel} Bài ${lessonId}`;

      const card = document.createElement('div');
      card.className = 'lesson-card';
      card.innerHTML = `
        <div>
          <span class="lesson-badge">YCT ${activeYctLevel} - Bài ${lessonId}</span>
          <h3 class="lesson-title">${title}</h3>
          <p class="lesson-desc">${desc}</p>
        </div>
        <div class="lesson-footer">
          <span class="lesson-words-indicator">
            <i class="fa-solid fa-book-open"></i> ${wordsCount} từ vựng
          </span>
          <span class="lesson-detail-link">Chi tiết bài học <i class="fa-solid fa-chevron-right"></i></span>
        </div>
      `;

      card.addEventListener('click', () => {
        startLessonStudy({ id: lessonId, title }, sliceWords);
      });

      grid.appendChild(card);
    });
    return;
  }

  // HSK Curriculum Mode
  if (yctLevelContainer) yctLevelContainer.style.display = 'none';
  if (lessonsLevelContainer) lessonsLevelContainer.style.display = 'flex';
  if (versionSelectorWrap) versionSelectorWrap.style.display = 'flex';

  // Toggle HSK 7-8-9 option physically in DOM (only available in HSK 3.0)
  if (levelSelect) {
    const existingOpt = levelSelect.querySelector('option[value="7-9"]');
    if (activeHskVersion === '2.0') {
      if (existingOpt) {
        window._hsk79OptionElement = existingOpt;
        existingOpt.remove();
      }
      if (activeLessonsLevel.toString() === '7-9') {
        activeLessonsLevel = 1;
      }
    } else {
      if (!existingOpt) {
        if (!window._hsk79OptionElement) {
          const opt = document.createElement('option');
          opt.value = '7-9';
          opt.id = 'hsk-level-79-option';
          opt.textContent = 'Cấp HSK 7-8-9 (Cao cấp)';
          window._hsk79OptionElement = opt;
        }
        levelSelect.appendChild(window._hsk79OptionElement);
      }
    }
  }

  // Sync level select value
  if (levelSelect && levelSelect.value !== activeLessonsLevel.toString()) {
    levelSelect.value = activeLessonsLevel.toString();
  }

  // Toggle Volume Dropdown visibility for HSK 4-9 (v2.0)
  if (volumePillsContainer) {
    if (activeLessonsLevel >= 4 && activeHskVersion === '2.0') {
      volumePillsContainer.style.display = 'flex';
      if (volumeSelect) volumeSelect.value = activeVolumeFilter;
    } else {
      volumePillsContainer.style.display = 'none';
      activeVolumeFilter = 'all';
      if (volumeSelect) volumeSelect.value = 'all';
    }
  }

  // Update objectives text - dynamically count words from vocabList
  if (objectivesText) {
    // Count total words in this level/version
    const totalWordsInLevel = vocabList.filter(w =>
      !w.isCustom &&
      w.curriculum !== 'yct' && w.hskVersion !== 'yct' &&
      matchLevel(w.level, activeLessonsLevel) &&
      (w.hskVersion || '3.0') === activeHskVersion
    ).length;
    const totalStr = totalWordsInLevel > 0 ? `, ${totalWordsInLevel.toLocaleString()} từ vựng` : '';

    const levelDescMap = {
      '2.0': {
        1: `HSK 2.0 Cấp 1 - Sơ cấp dành cho người mới bắt đầu`,
        2: `HSK 2.0 Cấp 2 - Sơ cấp nâng cao, giao tiếp đời sống cơ bản`,
        3: `HSK 2.0 Cấp 3 - Trung cấp, giao tiếp tự tin các chủ đề học tập/công việc`,
        4: `HSK 2.0 Cấp 4 - Trung cấp nâng cao, thảo luận nhiều chủ đề chuyên sâu`,
        5: `HSK 2.0 Cấp 5 - Cao cấp, đọc báo chí xem phim và thuyết trình tự nhiên`,
        6: `HSK 2.0 Cấp 6 - Thành thạo, đọc văn học và viết học thuật`,
        '7-9': `HSK 2.0 Cấp 7-8-9 - Nâng cao chuyên nghiệp, sử dụng ngôn ngữ tiếng Trung nước ngoài`,
      },
      '3.0': {
        1: `HSK 3.0 Cấp 1 - Sơ cấp dành cho người mới bắt đầu`,
        2: `HSK 3.0 Cấp 2 - Sơ cấp nâng cao`,
        3: `HSK 3.0 Cấp 3 - Sơ cấp hoàn chỉnh`,
        4: `HSK 3.0 Cấp 4 - Trung cấp cơ bản`,
        5: `HSK 3.0 Cấp 5 - Trung cấp nâng cao`,
        6: `HSK 3.0 Cấp 6 - Cao cấp`,
        '7-9': `HSK 3.0 Cấp 7-8-9 - Nâng cao chuyên nghiệp`,
      }
    };
    const desc = (levelDescMap[activeHskVersion] || {})[activeLessonsLevel]
      || `HSK ${activeHskVersion} Cấp ${activeLessonsLevel === '7-9' ? '7-8-9' : activeLessonsLevel}`;
    objectivesText.textContent = `Mục tiêu: ${desc}${totalStr}`;
  }

  // Filter HSK level vocabulary
  const levelVocabs = vocabList.filter(w => {
    if (w.isCustom) return false;
    if (w.curriculum === 'yct' || w.hskVersion === 'yct') return false;
    if (!matchLevel(w.level, activeLessonsLevel)) return false;
    if ((w.hskVersion || '3.0') !== activeHskVersion) return false;
    if ((activeLessonsLevel === 4 || activeLessonsLevel === 5) && activeHskVersion === '2.0' && activeVolumeFilter !== 'all') {
      if (w.volume) {
        if (w.volume !== activeVolumeFilter) return false;
      } else {
        const isThuong = activeLessonsLevel === 4 ? (w.lessonId <= 10) : (w.lessonId <= 18);
        if (activeVolumeFilter === 'thuong' && !isThuong) return false;
        if (activeVolumeFilter === 'ha' && isThuong) return false;
      }
    }
    return true;
  });

  // Group vocabulary dynamically by their lessonId field
  const lessonGroups = {};
  levelVocabs.forEach(w => {
    const les = w.lessonId || 1;
    if (!lessonGroups[les]) lessonGroups[les] = [];
    lessonGroups[les].push(w);
  });

  const uniqueLessonKeys = Object.keys(lessonGroups).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  uniqueLessonKeys.forEach(lessonKey => {
    const sliceWords = lessonGroups[lessonKey] || [];
    const wordsCount = sliceWords.length;
    if (wordsCount === 0) return;

    // Retrieve title and desc directly from the first word of the group
    const firstWord = sliceWords[0];
    const title = firstWord.lessonTitle || firstWord.category || `Bài ${lessonKey}`;
    const desc = firstWord.lessonDesc || `Ôn tập từ vựng bài học HSK Cấp ${activeLessonsLevel}`;
    const badgeLevelStr = activeLessonsLevel === '7-9' ? '7-8-9' : activeLessonsLevel;

    const card = document.createElement('div');
    card.className = 'lesson-card';
    card.innerHTML = `
      <div>
        <span class="lesson-badge">HSK ${badgeLevelStr} (${activeHskVersion}) - ${firstWord.category || ('Bài ' + lessonKey)}</span>
        <h3 class="lesson-title">${title}</h3>
        <p class="lesson-desc">${desc}</p>
      </div>
      <div class="lesson-footer">
        <span class="lesson-words-indicator">
          <i class="fa-solid fa-book-open"></i> ${wordsCount} từ vựng
        </span>
        <span class="lesson-detail-link">Chi tiết bài học <i class="fa-solid fa-chevron-right"></i></span>
      </div>
    `;

    card.addEventListener('click', () => {
      startLessonStudy({ id: lessonKey, title }, sliceWords);
    });

    grid.appendChild(card);
  });
}

function startLessonStudy(lesson, sliceWords) {
  if (sliceWords.length === 0) {
    showToast('Danh sách từ vựng của bài học này đang được chuẩn bị!', true);
    return;
  }

  // Switch tab to flashcards first (so its default showTopicsView doesn't override our dashboard view)
  switchTab('flashcards');

  // Set active smart topic to HSK or YCT
  activeSmartTopic = activeLessonsCurriculum === 'yct' ? 'yct' : 'hsk';

  // Highlight/select only this lesson on the notebook dashboard
  selectedDashboardLessons = [lesson.id];

  // Open HSK/YCT Notebook Dashboard
  showNotebookDashboardView(activeLessonsCurriculum === 'yct' ? `yct:${activeYctLevel}` : `hsk:${activeLessonsLevel}`, true);

  // Scroll to workspace smoothly
  const flashcardSec = document.getElementById('flashcard-section');
  if (flashcardSec) flashcardSec.scrollIntoView({ behavior: 'smooth' });

  showToast(`Đang hiển thị chi tiết bài học: ${lesson.title} 📖`);
}

// Setup event listeners for lessons curriculum pills
function initLessonsView() {
  const hskBtn = document.getElementById('lessons-curriculum-hsk-btn');
  const yctBtn = document.getElementById('lessons-curriculum-yct-btn');
  const levelSelect = document.getElementById('lessons-level-select');
  const yctLevelSelect = document.getElementById('lessons-yct-level-select');
  const volumeSelect = document.getElementById('lessons-volume-select');

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

  if (levelSelect) {
    levelSelect.addEventListener('change', () => {
      const val = levelSelect.value;
      activeLessonsLevel = /^\d+$/.test(val) ? parseInt(val) : val;
      renderLessonsList();
    });
  }

  if (yctLevelSelect) {
    yctLevelSelect.addEventListener('change', () => {
      activeYctLevel = parseInt(yctLevelSelect.value);
      renderLessonsList();
    });
  }

  if (volumeSelect) {
    volumeSelect.addEventListener('change', () => {
      activeVolumeFilter = volumeSelect.value || 'all';
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
  { title: "Gia đình tôi (YCT Thiếu Nhi)", text: "我家有四个人：爸爸、妈妈、哥哥和我。我们住在河内。我爱我的家人。" },
  { title: "Một ngày của tôi (HSK 2)", text: "我每天早上七点半起床。吃早饭以后去上学。我下午六点回宿舍。" },
  { title: "Sở thích & Giải trí (HSK 3)", text: "我的爱好是听音乐和看中国电影。我觉得写汉字很有趣，但是也很难。" },
  { title: "Lớp học của em (YCT Thiếu Nhi)", text: "我们的教室很大，也很干净。老师教我们画画和说汉语，我很喜欢上学。" }
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

  const q = query.trim().toLowerCase();

  // Khi chưa nhập từ khóa tìm kiếm: không hiển thị danh sách đề xuất
  if (!q) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px 16px; color: var(--text-muted); font-size: 0.85rem; font-style: italic;">
        <i class="fa-solid fa-keyboard" style="font-size: 1.8rem; margin-bottom: 10px; color: var(--accent-blue); opacity: 0.5; display: block;"></i>
        Nhập chữ Hán, Pinyin hoặc nghĩa Tiếng Việt ở ô trên để tra cứu từ vựng...
      </div>
    `;
    return;
  }

  // Tìm kiếm khớp với từ khóa người dùng gõ
  const filtered = vocabList.filter(w =>
    w.word.toLowerCase().includes(q) ||
    w.pinyin.toLowerCase().includes(q) ||
    w.meaning.toLowerCase().includes(q)
  );

  // Fallback nếu không tìm thấy từ khớp
  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px 16px; color: var(--text-muted); font-size: 0.85rem; font-style: italic;">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>
        Không tìm thấy từ vựng nào khớp với "${query}"!
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
  document.getElementById('dict-detail-level').textContent = w.isCustom ? 'Cá nhân' : (w.level === 'premium' ? 'Premium' : `HSK ${w.level} (v${w.hskVersion || '3.0'})`);
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

function renderFcQuickSaveDropdown(w) {
  const dropdown = document.getElementById('fc-quick-save-dropdown');
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

// --- STUDY TIME & PROGRESS TRACKING ---
let sessionStudyTime = 0;
let activeTimer = null;
let userStreak = 0;
let userStudyTime = 0; // cumulative study time in seconds

// In-memory guest stats (will be lost on page reload)
let guestStudyTime = 0;
let guestStreak = 0;
let guestLastActive = '';

function startStudyTimer() {
  if (activeTimer) clearInterval(activeTimer);
  activeTimer = setInterval(() => {
    if (document.hasFocus()) {
      sessionStudyTime++;

      const totalSecs = userStudyTime + sessionStudyTime;
      const totalMins = Math.floor(totalSecs / 60);
      const studyTimeValEl = document.getElementById('welcome-study-time-val');
      if (studyTimeValEl) {
        studyTimeValEl.textContent = `${totalMins} phút`;
      }

      if (sessionStudyTime >= 15) {
        syncStudyStats();
      }
    }
  }, 1000);
}

async function syncStudyStats() {
  const increment = sessionStudyTime;
  sessionStudyTime = 0;
  if (increment <= 0) return;

  const todayStr = new Date().toLocaleDateString('sv'); // YYYY-MM-DD

  if (currentUser) {
    try {
      const response = await fetch(API_BASE_URL + '/api/user/stats/sync', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ incrementStudyTime: increment, localDateStr: todayStr }),
        credentials: 'include'
      });
      if (response.ok) {
        const stats = await response.json();
        userStreak = stats.streak;
        userStudyTime = stats.studyTime;
        updateStatsUI();
      }
    } catch (err) {
      console.error('Failed to sync study stats:', err);
    }
  } else {
    // In-memory guest stats logic (no localStorage)
    guestStudyTime += increment;
    userStudyTime = guestStudyTime;

    if (!guestLastActive) {
      guestStreak = 1;
      guestLastActive = todayStr;
    } else if (guestLastActive !== todayStr) {
      const today = new Date(todayStr);
      const lastActive = new Date(guestLastActive);
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        guestStreak += 1;
      } else if (diffDays > 1) {
        guestStreak = 1;
      }
      guestLastActive = todayStr;
    }
    userStreak = guestStreak;
    updateStatsUI();
  }
}

function calculateCompletedLessons() {
  const textbookGroups = {};
  vocabList.forEach(w => {
    if (w.isCustom || !w.level || !w.lessonId) return;
    const key = `${w.level}_${w.lessonId}`;
    if (!textbookGroups[key]) textbookGroups[key] = [];
    textbookGroups[key].push(w);
  });

  let completedCount = 0;
  Object.entries(textbookGroups).forEach(([key, words]) => {
    if (words.length > 0 && words.every(w => w.isMemorized)) {
      completedCount++;
    }
  });

  return completedCount;
}

function renderCourseCompletionDashboard() {
  const enrolledEl = document.getElementById('dashboard-enrolled-count');
  const completedEl = document.getElementById('dashboard-completed-count');
  const memorizedEl = document.getElementById('dashboard-memorized-count');
  const completedPctEl = document.getElementById('dashboard-completed-pct');
  const remainingPctEl = document.getElementById('dashboard-remaining-pct');
  const pieSvg = document.getElementById('course-completion-pie-svg');
  const centerValue = document.getElementById('pie-center-value');

  const zubiCompleted = document.getElementById('zubi-completed-count');
  const zubiEnrolled = document.getElementById('zubi-enrolled-count');
  const zubiTotalWords = document.getElementById('zubi-total-words-count');
  const zubiStudyTime = document.getElementById('zubi-study-time-count');

  const activeVocabs = vocabList.filter(w => !w.isCustom);
  const totalMemorized = activeVocabs.filter(w => w.isMemorized).length;

  const textbookGroups = {};
  activeVocabs.forEach(w => {
    if (!w.level || !w.lessonId) return;
    const key = `${w.hskVersion || '3.0'}_${w.level}_${w.lessonId}`;
    if (!textbookGroups[key]) textbookGroups[key] = [];
    textbookGroups[key].push(w);
  });

  const totalEnrolled = Object.keys(textbookGroups).length || 220;
  let completedCount = 0;
  Object.values(textbookGroups).forEach(words => {
    if (words.length > 0 && words.every(w => w.isMemorized)) {
      completedCount++;
    }
  });

  const enrolled = totalEnrolled;
  const completed = completedCount;

  if (zubiCompleted) zubiCompleted.textContent = `${completed} Bài`;
  if (zubiEnrolled) zubiEnrolled.textContent = `${enrolled} Bài`;
  if (zubiTotalWords) zubiTotalWords.textContent = `${vocabList.length.toLocaleString()} Từ`;
  if (zubiStudyTime) {
    const mins = Math.floor(userStudyTime / 60);
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      zubiStudyTime.textContent = `${hrs}h ${remMins}m`;
    } else {
      zubiStudyTime.textContent = `${mins} phút`;
    }
  }

  // Render 100% dynamic overview table and recent cards
  renderZubiDashboardTableAndRecent();

  if (!pieSvg) return;

  const completedPct = enrolled > 0 ? Math.min(100, Math.round((completed / enrolled) * 100)) : 67;
  const remainingPct = 100 - completedPct;

  if (enrolledEl) enrolledEl.textContent = enrolled;
  if (completedEl) completedEl.textContent = completed;
  if (memorizedEl) memorizedEl.textContent = totalMemorized.toLocaleString();
  if (completedPctEl) completedPctEl.textContent = `${completedPct}%`;
  if (remainingPctEl) remainingPctEl.textContent = `${remainingPct}%`;
  if (centerValue) centerValue.textContent = `${completedPct}%`;

  // Draw SVG Pie Chart (Purple = Completed, Electric Blue = Remaining)
  const cx = 100, cy = 100, r = 85;
  if (completedPct === 100) {
    pieSvg.innerHTML = `<circle cx="100" cy="100" r="85" fill="#800080" stroke="#ffffff" stroke-width="2.5" />`;
  } else if (completedPct === 0) {
    pieSvg.innerHTML = `<circle cx="100" cy="100" r="85" fill="#0033ff" stroke="#ffffff" stroke-width="2.5" />`;
  } else {
    const angle1 = (completedPct / 100) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(0);
    const y1 = cy + r * Math.sin(0);
    const x2 = cx + r * Math.cos(angle1);
    const y2 = cy + r * Math.sin(angle1);
    const large1 = completedPct > 50 ? 1 : 0;
    const large2 = remainingPct > 50 ? 1 : 0;

    const path1 = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large1} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
    const path2 = `M ${cx} ${cy} L ${x2.toFixed(2)} ${y2.toFixed(2)} A ${r} ${r} 0 ${large2} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;

    pieSvg.innerHTML = `
      <path d="${path1}" fill="#800080" stroke="#ffffff" stroke-width="2.5" />
      <path d="${path2}" fill="#0033ff" stroke="#ffffff" stroke-width="2.5" />
    `;
  }
}

function updateStatsUI() {
  const streakEl = document.getElementById('welcome-streak-val');
  const completedEl = document.getElementById('welcome-completed-val');
  const studyTimeEl = document.getElementById('welcome-study-time-val');

  if (streakEl) streakEl.textContent = `${userStreak} ngày`;
  if (studyTimeEl) studyTimeEl.textContent = `${Math.floor((userStudyTime + sessionStudyTime) / 60)} phút`;

  const completedCount = calculateCompletedLessons();
  if (completedEl) completedEl.textContent = `${completedCount} bài`;

  renderCourseCompletionDashboard();
}

window.selectCurriculumAndGo = function (curr, level) {
  if (curr === 'yct') {
    activeLessonsCurriculum = 'yct';
    activeYctLevel = level.toString();
  } else {
    activeLessonsCurriculum = 'hsk';
    activeLessonsLevel = level.toString();
  }

  // Chuyển tab sang thẻ từ vựng
  if (window.switchTab) {
    window.switchTab('flashcards');
  }

  renderLessonsList();

  const flashcardSec = document.getElementById('flashcard-section');
  if (flashcardSec) {
    flashcardSec.style.display = 'block';
    flashcardSec.scrollIntoView({ behavior: 'smooth' });
  }
};

function renderZubiDashboardTableAndRecent() {
  const recentGrid = document.getElementById('zubi-recent-cards-grid');
  const tableBody = document.getElementById('zubi-table-body');

  const builtInVocabs = vocabList.filter(w => !w.isCustom);

  // Dynamic Total Unique Lessons calculation
  const lessonGroupsMap = {};
  builtInVocabs.forEach(w => {
    if (!w.level || !w.lessonId) return;
    const key = `${w.curriculum || 'hsk'}_${w.hskVersion || '3.0'}_${w.level}_${w.lessonId}`;
    lessonGroupsMap[key] = true;
  });
  const totalLessonsCount = Object.keys(lessonGroupsMap).length;
  const enrolledStatBadge = document.getElementById('zubi-enrolled-count');
  if (enrolledStatBadge && totalLessonsCount > 0) {
    enrolledStatBadge.textContent = `${totalLessonsCount} Bài`;
  }

  // 1. Dynamic Overview Table Rows
  if (tableBody) {
    const tiers = [
      { name: 'HSK Cấp 1', curriculum: 'HSK Chuẩn (v2.0 & v3.0)', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '1'), curriculumType: 'hsk', level: 1 },
      { name: 'HSK Cấp 2', curriculum: 'HSK Chuẩn (v2.0 & v3.0)', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '2'), curriculumType: 'hsk', level: 2 },
      { name: 'HSK Cấp 3', curriculum: 'HSK Chuẩn (v2.0 & v3.0)', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '3'), curriculumType: 'hsk', level: 3 },
      { name: 'HSK Cấp 4 (Thượng / Hạ)', curriculum: 'HSK Chuẩn 2.0', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '4'), curriculumType: 'hsk', level: 4 },
      { name: 'HSK Cấp 5 (Thượng / Hạ)', curriculum: 'HSK Chuẩn 2.0', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '5'), curriculumType: 'hsk', level: 5 },
      { name: 'HSK Cấp 6 (Thượng / Hạ)', curriculum: 'HSK Chuẩn 2.0', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '6'), curriculumType: 'hsk', level: 6 },
      { name: 'HSK Cấp 7-8-9 (Cao cấp)', curriculum: 'HSK 3.0 Chuyên nghiệp', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '7-9'), curriculumType: 'hsk', level: '7-9' },
      { name: 'YCT Cấp 1..4 (Thiếu nhi)', curriculum: 'Sắc màu YCT', filter: w => w.curriculum === 'yct' || w.hskVersion === 'yct', curriculumType: 'yct', level: 1 },
    ];

    let rowsHtml = '';
    tiers.forEach((tier, idx) => {
      const tierWords = builtInVocabs.filter(tier.filter);
      const total = tierWords.length;
      const memorized = tierWords.filter(w => w.isMemorized).length;
      const pct = total > 0 ? Math.round((memorized / total) * 100) : 0;
      const borderStyle = idx === tiers.length - 1 ? 'border-bottom: none;' : 'border-bottom: 1px solid rgba(255,255,255,0.05);';

      let badgeHtml = '';
      if (pct === 0) {
        badgeHtml = `<span class="zubi-pill danger" style="padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; background: rgba(239, 68, 68, 0.2); color: #f87171;">Chưa học</span>`;
      } else if (pct === 100) {
        badgeHtml = `<span class="zubi-pill success" style="padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; background: rgba(16, 185, 129, 0.2); color: #34d399;">Đã thuộc 100%</span>`;
      } else {
        badgeHtml = `<span class="zubi-pill warning" style="padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; background: rgba(217, 119, 6, 0.2); color: #fbbf24;">Đang học ${pct}%</span>`;
      }

      rowsHtml += `
        <tr style="cursor: pointer; transition: background 0.15s ease;" onclick="window.selectCurriculumAndGo('${tier.curriculumType}', '${tier.level}')" onmouseover="this.style.background='rgba(59,130,246,0.08)'" onmouseout="this.style.background='transparent'">
          <td class="zubi-td" style="padding: 16px;"><strong class="zubi-td-bold">${tier.name}</strong></td>
          <td class="zubi-td" style="padding: 16px;">${tier.curriculum}</td>
          <td class="zubi-td" style="padding: 16px;">${total.toLocaleString()} từ vựng</td>
          <td class="zubi-td" style="padding: 16px;">
            <div class="zubi-progress-bar-wrap">
              <div class="zubi-progress-bar" style="width: ${pct}%;"></div>
            </div>
          </td>
          <td class="zubi-td" style="padding: 16px;">${badgeHtml}</td>
          <td class="zubi-td" style="padding: 16px;">
            <button class="zubi-table-btn" style="background: rgba(59,130,246,0.15); color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); padding: 6px 14px; border-radius: 8px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;" onclick="event.stopPropagation(); window.selectCurriculumAndGo('${tier.curriculumType}', '${tier.level}')">Vào học <i class="fa-solid fa-arrow-right"></i></button>
          </td>
        </tr>
      `;
    });
    tableBody.innerHTML = rowsHtml;
  }

  // 2. Dynamic Recent Lessons Grid
  if (recentGrid) {
    const recentLessons = [
      { name: 'HSK 1 - Cấp độ Sơ cấp (v3.0 & v2.0)', level: 1, curr: 'hsk' },
      { name: 'HSK 2 - Cấp độ Sơ cấp nâng cao', level: 2, curr: 'hsk' },
      { name: 'YCT 1 - Tiếng Trung Thiếu nhi', level: 1, curr: 'yct' }
    ];

    const todayStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });

    let cardsHtml = '';
    recentLessons.forEach(les => {
      const lesWords = builtInVocabs.filter(w => (les.curr === 'yct' ? (w.curriculum === 'yct' || w.hskVersion === 'yct') : ((w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, les.level))));
      const count = lesWords.length;
      const memorized = lesWords.filter(w => w.isMemorized).length;
      const pct = count > 0 ? Math.round((memorized / count) * 100) : 0;

      let pillClass = 'warning';
      let pillText = `Đang học ${pct}%`;
      if (pct === 0) {
        pillClass = 'danger';
        pillText = 'Chưa học';
      } else if (pct === 100) {
        pillClass = 'success';
        pillText = 'Hoàn thành';
      }

      cardsHtml += `
        <div class="zubi-recent-card" style="background: rgba(30, 41, 59, 0.9); border-radius: 16px; padding: 20px 22px; box-shadow: 0 4px 16px rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; gap: 14px; cursor: pointer;" onclick="window.selectCurriculumAndGo('${les.curr}', '${les.level}')">
          <div class="recent-card-top" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
            <div class="recent-title" style="font-weight: 700; font-size: 0.95rem; color: #f8fafc; line-height: 1.3;">${les.name}</div>
            <i class="fa-regular fa-eye zubi-eye-icon" style="color: #94a3b8; font-size: 1rem; cursor: pointer;" title="Chi tiết bài học này" onclick="event.stopPropagation(); window.openZubiRecentLessonDetail('${les.curr}', '${les.level}')"></i>
          </div>
          <div class="recent-val green-text" style="font-family: var(--font-display, sans-serif); font-size: 1.6rem; font-weight: 800; color: #10b981;">${count.toLocaleString()} từ vựng</div>
          <div class="recent-card-footer" style="display: flex; justify-content: space-between; align-items: center;">
            <span class="zubi-pill ${pillClass}" style="padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; ${pillClass === 'success' ? 'background: rgba(16, 185, 129, 0.2); color: #34d399;' : pillClass === 'danger' ? 'background: rgba(239, 68, 68, 0.2); color: #f87171;' : 'background: rgba(217, 119, 6, 0.2); color: #fbbf24;'}">${pillText}</span>
            <span class="recent-date" style="font-size: 0.8rem; color: #94a3b8; font-weight: 500;">${todayStr}</span>
          </div>
        </div>
      `;
    });
    recentGrid.innerHTML = cardsHtml;
  }
}

function formatLessonFullName(item) {
  if (!item) return 'Bài học';
  const curr = (item.curriculum || 'hsk').toLowerCase();
  const ver = item.hskVersion || '3.0';
  const level = item.level;
  const lessonId = item.lessonId;

  if (curr === 'yct') {
    return `YCT Cấp ${level} (Thiếu nhi) - Bài ${lessonId}`;
  }

  if (ver === '2.0') {
    if (level.toString() === '4') {
      const vol = lessonId <= 10 ? 'Thượng' : (lessonId === 99 ? 'Bổ bổ sung' : 'Hạ');
      const volLesson = lessonId <= 10 ? lessonId : (lessonId === 99 ? '' : lessonId - 10);
      return `HSK 4 ${vol} (v2.0) ${volLesson ? '- Bài ' + volLesson : ''}`;
    }
    if (level.toString() === '5') {
      const vol = lessonId <= 18 ? 'Thượng' : 'Hạ';
      const volLesson = lessonId <= 18 ? lessonId : lessonId - 18;
      return `HSK 5 ${vol} (v2.0) - Bài ${volLesson}`;
    }
    if (level.toString() === '6') {
      const vol = lessonId <= 20 ? 'Thượng' : 'Hạ';
      const volLesson = lessonId <= 20 ? lessonId : lessonId - 20;
      return `HSK 6 ${vol} (v2.0) - Bài ${volLesson}`;
    }
    return `HSK ${level} (v2.0) - Bài ${lessonId}`;
  }

  return `HSK ${level} (v3.0) - Bài ${lessonId}`;
}

window.openZubiRecentLessonDetail = function (curr, level) {
  const modal = document.getElementById('zubi-stat-modal');
  const titleEl = document.getElementById('zubi-modal-title');
  const subtitleEl = document.getElementById('zubi-modal-subtitle');
  const iconEl = document.getElementById('zubi-modal-icon');
  const bodyEl = document.getElementById('zubi-modal-body');

  if (!modal || !bodyEl) return;

  const builtIn = vocabList.filter(w => !w.isCustom);
  const lesWords = builtIn.filter(w => (curr === 'yct' ? (w.curriculum === 'yct' || w.hskVersion === 'yct') : ((w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, level))));
  const total = lesWords.length;
  const memorized = lesWords.filter(w => w.isMemorized).length;
  const pct = total > 0 ? Math.round((memorized / total) * 100) : 0;

  titleEl.textContent = `${curr.toUpperCase()} Cấp độ ${level}`;
  subtitleEl.textContent = `Tổng quan chi tiết cấp độ bài học`;
  iconEl.className = 'zubi-circle-icon green';
  iconEl.style.background = 'rgba(16, 185, 129, 0.2)';
  iconEl.style.color = '#34d399';
  iconEl.innerHTML = '<i class="fa-solid fa-book-open"></i>';

  let html = `
    <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 18px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <span style="font-size: 0.8rem; text-transform: uppercase; color: #34d399; font-weight: 700;">Tiến độ hoàn thành cấp độ</span>
        <h2 style="font-size: 1.8rem; font-weight: 800; color: #ffffff; margin: 4px 0 0 0;">${memorized} / ${total.toLocaleString()} Từ (${pct}%)</h2>
      </div>
      <button class="btn btn-primary" style="padding: 10px 20px; border-radius: 12px; font-weight: 700;" onclick="document.getElementById('zubi-stat-modal').style.display='none'; window.selectCurriculumAndGo('${curr}', '${level}');">Vào học ngay</button>
    </div>
    <h4 style="color: #f8fafc; margin: 10px 0 4px 0; font-size: 1rem;">Mẫu từ vựng tiêu biểu trong cấp độ này:</h4>
    <div style="display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow-y: auto;">
  `;

  const samples = lesWords.slice(0, 10);
  samples.forEach(w => {
    html += `
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="color: #38bdf8; font-size: 1.1rem;">${w.word}</strong>
          <span style="color: #cbd5e1; margin-left: 10px; font-size: 0.9rem;">[ ${w.pinyin} ]</span>
        </div>
        <span style="color: #94a3b8; font-size: 0.85rem;">${w.meaning}</span>
      </div>
    `;
  });

  html += `</div>`;
  bodyEl.innerHTML = html;
  modal.style.display = 'flex';
};

window.openZubiStatDetail = function (type) {
  const modal = document.getElementById('zubi-stat-modal');
  const titleEl = document.getElementById('zubi-modal-title');
  const subtitleEl = document.getElementById('zubi-modal-subtitle');
  const iconEl = document.getElementById('zubi-modal-icon');
  const bodyEl = document.getElementById('zubi-modal-body');

  if (!modal || !bodyEl) return;

  const builtIn = vocabList.filter(w => !w.isCustom);

  if (type === 'completed') {
    titleEl.textContent = 'Bài học đã hoàn thành';
    subtitleEl.textContent = 'Danh sách các bài học bạn đã thuộc 100% từ vựng';
    iconEl.className = 'zubi-circle-icon pink';
    iconEl.style.background = 'rgba(236, 72, 153, 0.2)';
    iconEl.style.color = '#ec4899';
    iconEl.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i>';

    const textbookGroups = {};
    builtIn.forEach(w => {
      if (!w.level || !w.lessonId) return;
      const key = `${w.curriculum || 'hsk'}_${w.hskVersion || '3.0'}_${w.level}_${w.lessonId}`;
      if (!textbookGroups[key]) textbookGroups[key] = { key, level: w.level, lessonId: w.lessonId, curr: w.curriculum || 'hsk', words: [] };
      textbookGroups[key].words.push(w);
    });

    const completedLessons = Object.values(textbookGroups).filter(g => g.words.length > 0 && g.words.every(w => w.isMemorized));

    let html = `
      <div style="background: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 16px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #ec4899; font-weight: 700;">Tổng số bài đã xong</span>
          <h2 style="font-size: 1.8rem; font-weight: 800; color: #ffffff; margin: 4px 0 0 0;">${completedLessons.length} / ${Object.keys(textbookGroups).length} Bài</h2>
        </div>
        <div style="font-size: 2.2rem; color: #ec4899; opacity: 0.8;"><i class="fa-solid fa-trophy"></i></div>
      </div>
    `;

    if (completedLessons.length === 0) {
      html += `
        <div style="text-align: center; padding: 30px 20px;">
          <i class="fa-solid fa-book-bookmark" style="font-size: 3rem; color: #64748b; margin-bottom: 12px; display: block;"></i>
          <h4 style="color: #f1f5f9; margin: 0 0 6px 0; font-size: 1.1rem;">Chưa có bài học nào hoàn thành 100%</h4>
          <p style="color: #94a3b8; font-size: 0.85rem; margin: 0 0 16px 0;">Hãy tiếp tục lật flashcard và đánh dấu thuộc từ để hoàn thành bài nhé!</p>
          <button class="btn btn-primary" style="padding: 10px 24px; border-radius: 12px;" onclick="document.getElementById('zubi-stat-modal').style.display='none'; window.selectCurriculumAndGo('hsk', 1);">Bắt đầu học ngay</button>
        </div>
      `;
    } else {
      html += `<div style="display: flex; flex-direction: column; gap: 10px;">`;
      completedLessons.forEach(les => {
        const fullTitle = formatLessonFullName(les.words[0]);
        html += `
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: #f8fafc; font-size: 0.95rem;">${fullTitle}</strong>
              <div style="font-size: 0.8rem; color: #94a3b8;">${les.words.length} từ vựng đã ghi nhớ</div>
            </div>
            <span class="zubi-pill success" style="padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; background: rgba(16, 185, 129, 0.2); color: #34d399;">Hoàn thành</span>
          </div>
        `;
      });
      html += `</div>`;
    }
    bodyEl.innerHTML = html;

  } else if (type === 'time') {
    titleEl.textContent = 'Thời gian tham gia học';
    subtitleEl.textContent = 'Thống kê thời gian duy trì thói quen học tập của bạn';
    iconEl.className = 'zubi-circle-icon blue';
    iconEl.style.background = 'rgba(59, 130, 246, 0.2)';
    iconEl.style.color = '#3b82f6';
    iconEl.innerHTML = '<i class="fa-solid fa-clock"></i>';

    const totalCurrentSecs = userStudyTime + sessionStudyTime;
    const mins = Math.floor(totalCurrentSecs / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    const timeDisplay = hrs > 0 ? `${hrs} giờ ${remMins} phút` : `${mins} phút`;

    bodyEl.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <div style="background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 16px; padding: 18px; text-align: center;">
          <div style="font-size: 0.8rem; color: #60a5fa; font-weight: 700; text-transform: uppercase;">Tổng thời gian đã học</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #ffffff; margin-top: 6px;">${timeDisplay}</div>
        </div>
        <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; padding: 18px; text-align: center;">
          <div style="font-size: 0.8rem; color: #fbbf24; font-weight: 700; text-transform: uppercase;">Chuỗi ngày liên tục (Streak)</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #ffffff; margin-top: 6px;">🔥 ${userStreak} Ngày</div>
        </div>
      </div>
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 18px; display: flex; gap: 14px; align-items: flex-start;">
        <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(16, 185, 129, 0.2); color: #34d399; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.1rem;"><i class="fa-solid fa-lightbulb"></i></div>
        <div>
          <strong style="color: #ffffff; font-size: 0.95rem;">Mẹo học hiệu quả:</strong>
          <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 0.85rem; line-height: 1.5;">Duy trì khoảng 15 - 20 phút lật thẻ Flashcard & làm bài tập mỗi ngày sẽ giúp bộ não ghi nhớ từ vựng lâu hơn gấp 3 lần so với dồn học 1 buổi kéo dài!</p>
        </div>
      </div>
    `;

  } else if (type === 'enrolled') {
    const activeVocabs = vocabList.filter(w => !w.isCustom);
    
    // Group lessons dynamically
    const hsk3Lessons = new Set();
    const hsk2Lessons = new Set();
    const yctLessons = new Set();

    activeVocabs.forEach(w => {
      if (!w.lessonId) return;
      const isY = (w.curriculum || '').toString().toLowerCase().includes('yct') || (w.hskVersion || '').toString().toLowerCase().includes('yct');
      const isHsk2 = !isY && (w.hskVersion === '2.0' || w.hskVersion === 2);
      const isHsk3 = !isY && (w.hskVersion === '3.0' || w.hskVersion === 3 || !w.hskVersion);

      const key = `${w.level}_${w.lessonId}`;
      if (isY) yctLessons.add(key);
      else if (isHsk2) hsk2Lessons.add(key);
      else if (isHsk3) hsk3Lessons.add(key);
    });

    const totalDynamicLessons = hsk3Lessons.size + hsk2Lessons.size + yctLessons.size;

    titleEl.textContent = 'Bài học đang theo học';
    subtitleEl.textContent = `Tổng cộng ${totalDynamicLessons} bài học phân bổ chuẩn theo từng bộ giáo trình`;
    iconEl.className = 'zubi-circle-icon orange';
    iconEl.style.background = 'rgba(249, 115, 22, 0.2)';
    iconEl.style.color = '#f97316';
    iconEl.innerHTML = '<i class="fa-solid fa-hourglass-half"></i>';

    bodyEl.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
          <div><strong style="color: #ffffff;">HSK 3.0 (Tất cả cấp độ)</strong><div style="font-size: 0.8rem; color: #94a3b8;">Bộ giáo trình mới HSK 3.0</div></div>
          <span style="font-weight: 800; color: #f97316; font-size: 1.1rem;">${hsk3Lessons.size} Bài</span>
        </div>
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
          <div><strong style="color: #ffffff;">HSK 2.0 (Cấp 1..6)</strong><div style="font-size: 0.8rem; color: #94a3b8;">Bộ giáo trình HSK 2.0 truyền thống</div></div>
          <span style="font-weight: 800; color: #f97316; font-size: 1.1rem;">${hsk2Lessons.size} Bài</span>
        </div>
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
          <div><strong style="color: #ffffff;">YCT 1, 2, 3, 4 (Thiếu nhi)</strong><div style="font-size: 0.8rem; color: #94a3b8;">Giáo trình Tiếng Trung Trẻ Em YCT</div></div>
          <span style="font-weight: 800; color: #f97316; font-size: 1.1rem;">${yctLessons.size} Bài</span>
        </div>
      </div>
    `;

  } else if (type === 'words') {
    titleEl.textContent = 'Thống kê Từ vựng HSK & YCT';
    subtitleEl.textContent = `Phân bổ ${vocabList.length.toLocaleString()} từ vựng HSK 3.0 & 2.0 chuẩn hóa`;
    iconEl.className = 'zubi-circle-icon cyan';
    iconEl.style.background = 'rgba(2, 132, 199, 0.2)';
    iconEl.style.color = '#38bdf8';
    iconEl.innerHTML = '<i class="fa-solid fa-layer-group"></i>';

    const hsk30_1 = builtIn.filter(w => (w.hskVersion || '3.0') === '3.0' && w.level.toString() === '1').length;
    const hsk30_2 = builtIn.filter(w => (w.hskVersion || '3.0') === '3.0' && w.level.toString() === '2').length;
    const hsk30_3 = builtIn.filter(w => (w.hskVersion || '3.0') === '3.0' && w.level.toString() === '3').length;

    const hsk20_1 = builtIn.filter(w => w.hskVersion === '2.0' && w.level.toString() === '1').length;
    const hsk20_2 = builtIn.filter(w => w.hskVersion === '2.0' && w.level.toString() === '2').length;
    const hsk20_3 = builtIn.filter(w => w.hskVersion === '2.0' && w.level.toString() === '3').length;
    const hsk20_4 = builtIn.filter(w => w.hskVersion === '2.0' && w.level.toString() === '4').length;
    const hsk20_5 = builtIn.filter(w => w.hskVersion === '2.0' && w.level.toString() === '5').length;
    const hsk20_6 = builtIn.filter(w => w.hskVersion === '2.0' && w.level.toString() === '6').length;

    const yctCount = builtIn.filter(w => w.curriculum === 'yct' || w.hskVersion === 'yct').length;

    const hsk30Total = hsk30_1 + hsk30_2 + hsk30_3;
    const hsk20Total = hsk20_1 + hsk20_2 + hsk20_3 + hsk20_4 + hsk20_5 + hsk20_6;

    bodyEl.innerHTML = `
      <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div>
          <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #38bdf8; font-weight: 700;">TỔNG TỪ VỰNG CHUẨN HÓA</span>
          <h2 style="font-size: 1.8rem; font-weight: 800; color: #ffffff; margin: 4px 0 0 0;">${vocabList.length.toLocaleString()} Từ</h2>
        </div>
        <div style="font-size: 2.2rem; color: #38bdf8; opacity: 0.8;"><i class="fa-solid fa-book"></i></div>
      </div>

      <div style="max-height: 50vh; overflow-y: auto; padding-right: 4px; display: flex; flex-direction: column; gap: 14px;">
        <!-- HSK 3.0 Section -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 14px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px; margin-bottom: 10px;">
            <strong style="color: #38bdf8; font-size: 0.95rem;"><i class="fa-solid fa-layer-group"></i> Phân Loại HSK 3.0 (9 Cấp Mới)</strong>
            <span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; font-weight: 800; font-size: 0.85rem; padding: 2px 8px; border-radius: 10px;">${hsk30Total.toLocaleString()} từ</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #cbd5e1;"><span>HSK 3.0 Cấp 1</span><strong style="color: #ffffff;">${hsk30_1.toLocaleString()} từ</strong></div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #cbd5e1;"><span>HSK 3.0 Cấp 2</span><strong style="color: #ffffff;">${hsk30_2.toLocaleString()} từ</strong></div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #cbd5e1;"><span>HSK 3.0 Cấp 3</span><strong style="color: #ffffff;">${hsk30_3.toLocaleString()} từ</strong></div>
          </div>
        </div>

        <!-- HSK 2.0 Section -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 14px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px; margin-bottom: 10px;">
            <strong style="color: #c084fc; font-size: 0.95rem;"><i class="fa-solid fa-book-open"></i> Phân Loại HSK 2.0 (6 Cấp Cũ)</strong>
            <span style="background: rgba(168, 85, 247, 0.2); color: #c084fc; font-weight: 800; font-size: 0.85rem; padding: 2px 8px; border-radius: 10px;">${hsk20Total.toLocaleString()} từ</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #cbd5e1;"><span>HSK 2.0 Cấp 1</span><strong style="color: #ffffff;">${hsk20_1.toLocaleString()} từ</strong></div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #cbd5e1;"><span>HSK 2.0 Cấp 2</span><strong style="color: #ffffff;">${hsk20_2.toLocaleString()} từ</strong></div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #cbd5e1;"><span>HSK 2.0 Cấp 3</span><strong style="color: #ffffff;">${hsk20_3.toLocaleString()} từ</strong></div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #cbd5e1;"><span>HSK 2.0 Cấp 4 (Thượng & Hạ)</span><strong style="color: #ffffff;">${hsk20_4.toLocaleString()} từ</strong></div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #cbd5e1;"><span>HSK 2.0 Cấp 5 (Thượng & Hạ)</span><strong style="color: #ffffff;">${hsk20_5.toLocaleString()} từ</strong></div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #cbd5e1;"><span>HSK 2.0 Cấp 6 (Thượng & Hạ)</span><strong style="color: #ffffff;">${hsk20_6.toLocaleString()} từ</strong></div>
          </div>
        </div>

        <!-- YCT Section -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 14px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #fbbf24; font-size: 0.95rem;"><i class="fa-solid fa-child"></i> YCT Cấp 1..4 (Thiếu Nhi)</strong>
            <span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; font-weight: 800; font-size: 0.85rem; padding: 2px 8px; border-radius: 10px;">${yctCount.toLocaleString()} từ</span>
          </div>
        </div>
      </div>
    `;
  }

  modal.style.display = 'flex';
};

async function loadInitialStats() {
  if (currentUser) {
    try {
      const response = await fetch(API_BASE_URL + '/api/user/stats', {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (response.ok) {
        const stats = await response.json();
        userStreak = stats.streak;
        userStudyTime = stats.studyTime;
      }
    } catch (err) {
      console.error('Failed to load user stats:', err);
    }
  } else {
    // Pure in-memory reset for guest on load (loses progress on reload)
    userStudyTime = guestStudyTime;
    userStreak = guestStreak;
  }
  updateStatsUI();
}

// --- SMART FLASHCARD TOPICS & QUIZ LOGIC ---

// 1. Navigation functions
function showTopicsView() {
  const selectionView = document.getElementById('deck-selection-view');
  const topicsView = document.getElementById('flashcard-topics-view');
  const subdecksView = document.getElementById('flashcard-subdecks-view');
  const dashboardView = document.getElementById('notebook-dashboard-view');
  const studyView = document.getElementById('flashcard-study-view');
  const quizView = document.getElementById('quiz-study-view');

  if (selectionView) selectionView.style.display = 'block';
  if (topicsView) topicsView.style.display = 'block';
  if (subdecksView) subdecksView.style.display = 'none';
  if (dashboardView) dashboardView.style.display = 'none';
  if (studyView) studyView.style.display = 'none';
  if (quizView) quizView.style.display = 'none';

  activeNotebook = null;
  studyNotebookId = null;
}

function showSubdecksView() {
  const selectionView = document.getElementById('deck-selection-view');
  const topicsView = document.getElementById('flashcard-topics-view');
  const subdecksView = document.getElementById('flashcard-subdecks-view');
  const dashboardView = document.getElementById('notebook-dashboard-view');
  const studyView = document.getElementById('flashcard-study-view');
  const quizView = document.getElementById('quiz-study-view');

  if (selectionView) selectionView.style.display = 'block';
  if (topicsView) topicsView.style.display = 'none';
  if (subdecksView) subdecksView.style.display = 'block';
  if (dashboardView) dashboardView.style.display = 'none';
  if (studyView) studyView.style.display = 'none';
  if (quizView) quizView.style.display = 'none';

  // Toggle version selector based on activeSmartTopic
  const versionSelector = document.getElementById('smart-hsk-version-selector-wrap');
  if (versionSelector) {
    versionSelector.style.display = activeSmartTopic === 'hsk' ? 'flex' : 'none';
  }

  activeNotebook = null;
  studyNotebookId = null;

  renderSubdecksList();
}

function showNotebookDashboardView(notebookId, preserveLessons = false) {
  const selectionView = document.getElementById('deck-selection-view');
  const topicsView = document.getElementById('flashcard-topics-view');
  const subdecksView = document.getElementById('flashcard-subdecks-view');
  const dashboardView = document.getElementById('notebook-dashboard-view');
  const studyView = document.getElementById('flashcard-study-view');
  const quizView = document.getElementById('quiz-study-view');

  if (selectionView) selectionView.style.display = 'block';
  if (topicsView) topicsView.style.display = 'none';
  if (subdecksView) subdecksView.style.display = 'none';
  if (dashboardView) dashboardView.style.display = 'block';
  if (studyView) studyView.style.display = 'none';
  if (quizView) quizView.style.display = 'none';

  // Reset filters
  dashboardActiveFilter = 'all';
  if (!preserveLessons) {
    selectedDashboardLessons = [];
  }

  // Reset active classes/borders on interactive stats boxes
  const interactiveBoxes = document.querySelectorAll('#nb-stats-interactive-container .stat-box-interactive');
  if (interactiveBoxes.length > 0) {
    interactiveBoxes.forEach(b => {
      b.classList.remove('active');
      b.style.background = 'rgba(255, 255, 255, 0.02)';
      b.style.borderColor = 'var(--border-glass)';
    });
    const allBox = Array.from(interactiveBoxes).find(b => b.getAttribute('data-filter') === 'all');
    if (allBox) {
      allBox.classList.add('active');
      allBox.style.background = 'rgba(59, 130, 246, 0.08)';
      allBox.style.borderColor = 'var(--accent-blue)';
    }
  }

  activeNotebook = notebookId;
  openNotebookDashboard(notebookId);
}

// Helper: Get all words in a notebook
function getNotebookWords(notebookId) {
  if (!notebookId) return [];
  if (notebookId === 'wrong') {
    return vocabList.filter(w => w.isWrong);
  } else if (notebookId === 'starred') {
    return vocabList.filter(w => w.isStarred);
  } else if (notebookId.startsWith('custom:')) {
    const listName = notebookId.substring(7);
    return vocabList.filter(w => w.isCustom && w.category === listName);
  } else if (notebookId.startsWith('hsk:')) {
    const lvl = notebookId.substring(4);
    return vocabList.filter(w => !w.isCustom && matchLevel(w.level, lvl) && (w.hskVersion || '3.0') === activeHskVersion);
  } else if (notebookId.startsWith('premium:')) {
    const category = notebookId.substring(8);
    let catName = '';
    if (category === 'du-lich') catName = 'Du lịch';
    else if (category === 'cong-so') catName = 'Công sở';
    else if (category === 'dam-phan') catName = 'Đàm phán';
    return vocabList.filter(w => w.level === 'premium' && w.category === catName);
  }
  return [];
}

// 2. Render Subdecks list based on activeSmartTopic
function renderSubdecksList() {
  const grid = document.getElementById('subdecks-list-grid');
  const title = document.getElementById('subdecks-category-title');
  if (!grid || !title) return;

  grid.innerHTML = '';

  if (activeSmartTopic === 'personal') {
    title.textContent = 'Danh sách Sổ tay Cá nhân';

    // wrong words
    const wrongWords = vocabList.filter(w => w.isWrong);
    grid.appendChild(createSubdeckCard('Sổ tay Từ học sai', 'wrong', wrongWords.length, 'fa-circle-exclamation', 'var(--danger)'));

    // starred words
    const starredWords = vocabList.filter(w => w.isStarred);
    grid.appendChild(createSubdeckCard('Sổ tay Yêu thích', 'starred', starredWords.length, 'fa-star', 'var(--warning)'));

    // custom/personal lists
    customLists.forEach(listName => {
      const listWords = vocabList.filter(w => w.isCustom && w.category === listName);
      grid.appendChild(createSubdeckCard(listName, `custom:${listName}`, listWords.length, 'fa-folder', 'var(--accent-blue)'));
    });
  }
  else if (activeSmartTopic === 'hsk') {
    title.textContent = 'Danh sách Từ vựng';
    if (activeHskVersion === 'yct') {
      for (let lvl = 1; lvl <= 4; lvl++) {
        const lvlWords = vocabList.filter(w => (w.curriculum === 'yct' || w.hskVersion === 'yct') && matchLevel(w.level, lvl));
        grid.appendChild(createSubdeckCard(`YCT Cấp ${lvl}`, `yct:${lvl}`, lvlWords.length, 'fa-child', 'var(--accent-teal)'));
      }
    } else {
      const maxLvl = 6;
      for (let lvl = 1; lvl <= maxLvl; lvl++) {
        const lvlWords = vocabList.filter(w => !w.isCustom && matchLevel(w.level, lvl) && (w.hskVersion || '3.0') === activeHskVersion);
        grid.appendChild(createSubdeckCard(`HSK Cấp ${lvl}`, `hsk:${lvl}`, lvlWords.length, 'fa-graduation-cap', 'var(--success)'));
      }
      if (activeHskVersion === '3.0') {
        const hsk79Words = vocabList.filter(w => !w.isCustom && matchLevel(w.level, '7-9') && (w.hskVersion || '3.0') === activeHskVersion);
        grid.appendChild(createSubdeckCard(`HSK Cấp 7-8-9 (Cao cấp)`, `hsk:7-9`, hsk79Words.length, 'fa-award', '#a855f7'));
      }
    }
  }
  else if (activeSmartTopic === 'premium') {
    title.textContent = 'Danh sách Chủ đề Cao cấp';
    const topics = [
      { name: 'Du lịch Trung Quốc', id: 'premium:du-lich', icon: 'fa-plane', color: 'var(--accent-teal)', catName: 'Du lịch' },
      { name: 'Giao tiếp Công sở', id: 'premium:cong-so', icon: 'fa-briefcase', color: 'var(--accent-purple)', catName: 'Công sở' },
      { name: 'Đàm phán Thương mại', id: 'premium:dam-phan', icon: 'fa-handshake', color: 'var(--warning)', catName: 'Đàm phán' }
    ];
    topics.forEach(t => {
      const words = vocabList.filter(w => w.level === 'premium' && w.category === t.catName);
      grid.appendChild(createSubdeckCard(t.name, t.id, words.length, t.icon, t.color));
    });
  }
}

function createSubdeckCard(name, id, count, icon, color) {
  const card = document.createElement('div');
  card.className = 'topic-card glass-panel';
  card.style.padding = '20px';
  card.style.cursor = 'pointer';
  card.style.borderRadius = 'var(--radius-md)';
  card.style.border = '1px solid var(--border-glass)';
  card.style.transition = 'all 0.3s ease';
  card.style.display = 'flex';
  card.style.alignItems = 'center';
  card.style.gap = '16px';

  card.innerHTML = `
    <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.03); color: ${color}; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; border: 1px solid var(--border-glass);">
      <i class="fa-solid ${icon}"></i>
    </div>
    <div style="flex: 1; text-align: left;">
      <h4 style="margin: 0; font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${name}</h4>
      <span style="font-size: 0.78rem; color: var(--text-secondary);">${count} từ vựng</span>
    </div>
    <i class="fa-solid fa-chevron-right" style="color: var(--text-muted); font-size: 0.85rem;"></i>
  `;

  card.addEventListener('click', () => {
    showNotebookDashboardView(id);
  });
  return card;
}

function openNotebookDashboard(notebookId) {
  const titleEl = document.getElementById('dashboard-notebook-title');
  const descEl = document.getElementById('dashboard-notebook-desc');

  const baseWords = getNotebookWords(notebookId);

  let name = '';
  let desc = '';
  if (notebookId === 'wrong') {
    name = 'Sổ tay Từ học sai';
    desc = 'Tổng hợp các từ bạn đã trả lời sai trong quá trình luyện tập';
  } else if (notebookId === 'starred') {
    name = 'Sổ tay Yêu thích';
    desc = 'Những từ bạn đã đánh dấu sao yêu thích';
  } else if (notebookId.startsWith('custom:')) {
    const listName = notebookId.substring(7);
    name = `Sổ tay: ${listName}`;
    desc = `Danh sách từ vựng tự biên soạn`;
  } else if (notebookId.startsWith('hsk:')) {
    const lvl = notebookId.substring(4);
    if (selectedDashboardLessons && selectedDashboardLessons.length > 0) {
      // Find unique lessons to get their titles
      const uniqueLessons = {};
      baseWords.forEach(w => {
        if (w.lessonId) {
          uniqueLessons[w.lessonId] = w.lessonTitle || `Bài ${w.lessonId}`;
        }
      });
      const lessonNames = selectedDashboardLessons.map(id => uniqueLessons[id] || `Bài ${id}`).join(', ');
      name = `Từ vựng HSK Cấp ${lvl} - ${lessonNames}`;
      desc = `Các từ vựng thuộc ${lessonNames.toLowerCase()} của HSK Cấp ${lvl}`;
    } else {
      name = `Từ vựng HSK Cấp ${lvl}`;
      desc = `Toàn bộ từ vựng luyện thi HSK Cấp ${lvl}`;
    }
  } else if (notebookId.startsWith('premium:')) {
    const category = notebookId.substring(8);
    if (category === 'du-lich') {
      name = 'Chủ đề: Du lịch Trung Quốc';
      desc = 'Từ vựng thông dụng nhất khi đi du lịch và hỏi đường';
    } else if (category === 'cong-so') {
      name = 'Chủ đề: Giao tiếp Công sở';
      desc = 'Từ vựng văn phòng, báo cáo, đồng nghiệp và xin nghỉ phép';
    } else if (category === 'dam-phan') {
      name = 'Chủ đề: Đàm phán Thương mại';
      desc = 'Từ vựng đàm phán hợp đồng, giá cả, chiết khấu và hợp tác';
    }
  }

  if (titleEl) titleEl.textContent = name;
  if (descEl) descEl.textContent = desc;

  // Show/hide Add Word Form Container (Personal category subdecks only)
  const addFormContainer = document.getElementById('nb-add-word-form-container');
  if (addFormContainer) {
    if (activeSmartTopic === 'personal' && notebookId.startsWith('custom:')) {
      addFormContainer.style.display = 'block';
    } else {
      addFormContainer.style.display = 'none';
    }
  }

  // Update Stats Widget

  // Render HSK Lesson Selector Block if applicable (Chỉ hiển thị khi xem toàn bộ cấp độ HSK, ẩn khi đã nhấp chọn 1 bài học cụ thể)
  const lessonContainer = document.getElementById('nb-hsk-lesson-selector-container');
  if (lessonContainer) {
    if (notebookId.startsWith('hsk:') && Array.isArray(selectedDashboardLessons) && selectedDashboardLessons.length === 0) {
      lessonContainer.style.display = 'block';
      const lessonsList = document.getElementById('nb-hsk-lessons-list');
      if (lessonsList) {
        lessonsList.innerHTML = '';

        // Find unique lessons
        const uniqueLessons = {};
        baseWords.forEach(w => {
          if (w.lessonId) {
            uniqueLessons[w.lessonId] = w.lessonTitle || `Bài ${w.lessonId}`;
          }
        });

        const sortedLessonIds = Object.keys(uniqueLessons).map(Number).sort((a, b) => a - b);

        // Add "All" button
        const allBtn = document.createElement('button');
        allBtn.className = `btn btn-sm ${selectedDashboardLessons.length === 0 ? 'btn-primary' : 'btn-outline'}`;
        allBtn.style.fontSize = '0.75rem';
        allBtn.style.padding = '6px 12px';
        allBtn.style.borderRadius = '50px';
        allBtn.style.cursor = 'pointer';
        allBtn.textContent = 'Tất cả bài học';
        allBtn.addEventListener('click', () => {
          selectedDashboardLessons = [];
          openNotebookDashboard(notebookId); // Re-render
        });
        lessonsList.appendChild(allBtn);

        // Add individual lesson buttons
        sortedLessonIds.forEach(lId => {
          const btn = document.createElement('button');
          const isSelected = selectedDashboardLessons.includes(lId);
          btn.className = `btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`;
          btn.style.fontSize = '0.75rem';
          btn.style.padding = '6px 12px';
          btn.style.borderRadius = '50px';
          btn.style.cursor = 'pointer';
          btn.textContent = uniqueLessons[lId];
          btn.addEventListener('click', () => {
            if (isSelected) {
              selectedDashboardLessons = selectedDashboardLessons.filter(id => id !== lId);
            } else {
              selectedDashboardLessons.push(lId);
            }
            openNotebookDashboard(notebookId); // Re-render
          });
          lessonsList.appendChild(btn);
        });
      }
    } else {
      lessonContainer.style.display = 'none';
      if (!notebookId.startsWith('hsk:')) {
        selectedDashboardLessons = []; // Reset when leaving HSK notebook
      }
    }
  }

  // Toggle Left Column visibility & adjust grid layout dynamically
  const leftCol = document.getElementById('nb-left-col-container');
  const gridRow2 = document.getElementById('nb-row2-grid-container');
  const isLeftColVisible = (addFormContainer && addFormContainer.style.display !== 'none') || (lessonContainer && lessonContainer.style.display !== 'none');

  if (leftCol) {
    leftCol.style.display = isLeftColVisible ? 'flex' : 'none';
  }
  if (gridRow2) {
    gridRow2.style.gridTemplateColumns = isLeftColVisible ? '1.2fr 1fr' : '1fr';
  }

  // Filter baseWords for statistics if specific HSK lessons are selected
  let wordsForStats = baseWords;
  if (notebookId.startsWith('hsk:') && selectedDashboardLessons.length > 0) {
    wordsForStats = baseWords.filter(w => w.lessonId && selectedDashboardLessons.includes(w.lessonId));
  }

  const total = wordsForStats.length;
  const memorized = wordsForStats.filter(w => w.isMemorized).length;
  const studied = wordsForStats.filter(w => w.isStudied || w.isMemorized || w.isWrong || w.isStarred).length;
  const unstudied = total - studied;
  const unmemorized = total - memorized;
  const starred = wordsForStats.filter(w => w.isStarred).length;

  const nbStatTotal = document.getElementById('nb-stat-total');
  const nbStatMemorized = document.getElementById('nb-stat-memorized');
  const nbStatUnmemorized = document.getElementById('nb-stat-unmemorized');
  const nbStatStarred = document.getElementById('nb-stat-starred');
  const nbStatStudied = document.getElementById('nb-stat-studied');
  const nbStatUnstudied = document.getElementById('nb-stat-unstudied');

  if (nbStatTotal) nbStatTotal.textContent = total;
  if (nbStatMemorized) nbStatMemorized.textContent = memorized;
  if (nbStatUnmemorized) nbStatUnmemorized.textContent = unmemorized;
  if (nbStatStarred) nbStatStarred.textContent = starred;
  if (nbStatStudied) nbStatStudied.textContent = studied;
  if (nbStatUnstudied) nbStatUnstudied.textContent = unstudied;

  currentNotebookPage = 1;
  renderNotebookWordsTable();
}

// 4. Render vocabulary table for Notebook Dashboard
function renderNotebookWordsTable() {
  const tbody = document.getElementById('nb-words-table-rows');
  const paginationInfo = document.getElementById('nb-pagination-info');
  const paginationButtons = document.getElementById('nb-pagination-buttons');
  if (!tbody) return;

  tbody.innerHTML = '';

  let words = getNotebookWords(activeNotebook);

  // Filter HSK dashboard lessons if selected
  if (activeNotebook && activeNotebook.startsWith('hsk:') && selectedDashboardLessons.length > 0) {
    words = words.filter(w => w.lessonId && selectedDashboardLessons.includes(w.lessonId));
  }

  // Filter by dashboard active filter
  if (dashboardActiveFilter === 'studied') {
    words = words.filter(w => w.isStudied || w.isMemorized || w.isWrong || w.isStarred);
  } else if (dashboardActiveFilter === 'unstudied') {
    words = words.filter(w => !w.isStudied && !w.isMemorized && !w.isWrong && !w.isStarred);
  } else if (dashboardActiveFilter === 'memorized') {
    words = words.filter(w => w.isMemorized);
  } else if (dashboardActiveFilter === 'unmemorized') {
    words = words.filter(w => !w.isMemorized);
  } else if (dashboardActiveFilter === 'starred') {
    words = words.filter(w => w.isStarred);
  }

  // Apply quick search
  const searchInput = document.getElementById('nb-search-input');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  if (query) {
    words = words.filter(w =>
      w.word.toLowerCase().includes(query) ||
      w.pinyin.toLowerCase().includes(query) ||
      w.meaning.toLowerCase().includes(query)
    );
  }

  const total = words.length;

  if (total === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="padding: 24px; text-align: center; color: var(--text-muted);">Không tìm thấy từ vựng nào trong sổ tay này.</td></tr>`;
    if (paginationInfo) paginationInfo.textContent = 'Hiển thị 0 - 0 trong 0 từ';
    if (paginationButtons) paginationButtons.innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(total / notebookPageSize);
  if (currentNotebookPage > totalPages) currentNotebookPage = totalPages;
  if (currentNotebookPage < 1) currentNotebookPage = 1;

  const startIdx = (currentNotebookPage - 1) * notebookPageSize;
  const endIdx = Math.min(startIdx + notebookPageSize, total);

  const pageWords = words.slice(startIdx, endIdx);

  pageWords.forEach(w => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border-glass)';
    tr.style.transition = 'background 0.2s';

    const memorizedIcon = w.isMemorized ? 'fa-circle-check text-success' : 'fa-circle-check text-muted';
    const starredIcon = w.isStarred ? 'fa-star text-warning' : 'fa-star text-muted';

    let deleteBtn = '';
    if (w.isCustom) {
      deleteBtn = `<button class="btn btn-icon-only text-danger" title="Xóa từ" onclick="handleNotebookWordDelete('${w.id}')"><i class="fa-solid fa-trash"></i></button>`;
    }

    tr.innerHTML = `
      <td style="padding: 12px; font-family: var(--font-chinese); font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">${w.word}</td>
      <td style="padding: 12px; color: var(--accent-teal); font-weight: 500;">${w.pinyin}</td>
      <td style="padding: 12px; color: var(--text-secondary);">${w.meaning}</td>
      <td style="padding: 12px; text-align: center;">
        <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
          <button class="btn btn-icon-only" title="Nghe phát âm" onclick="handleNotebookWordPlay('${w.word.replace(/'/g, "\\'")}')">
            <i class="fa-solid fa-volume-high text-primary"></i>
          </button>
          <button class="btn btn-icon-only" title="Đánh dấu đã học" onclick="handleNotebookWordToggleMemorized('${w.id}')">
            <i class="fa-solid ${memorizedIcon}"></i>
          </button>
          <button class="btn btn-icon-only" title="Yêu thích" onclick="handleNotebookWordToggleStarred('${w.id}')">
            <i class="fa-solid ${starredIcon}"></i>
          </button>
          ${deleteBtn}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (paginationInfo) {
    paginationInfo.textContent = `Hiển thị ${startIdx + 1} - ${endIdx} trong ${total} từ`;
  }

  // Render pagination buttons
  if (paginationButtons) {
    paginationButtons.innerHTML = '';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-icon-only';
    prevBtn.style.padding = '4px 8px';
    prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    prevBtn.disabled = currentNotebookPage === 1;
    prevBtn.addEventListener('click', () => {
      currentNotebookPage--;
      renderNotebookWordsTable();
    });
    paginationButtons.appendChild(prevBtn);

    for (let p = 1; p <= totalPages; p++) {
      if (totalPages > 6 && Math.abs(p - currentNotebookPage) > 2 && p !== 1 && p !== totalPages) {
        if (p === 2 || p === totalPages - 1) {
          const dots = document.createElement('span');
          dots.textContent = '...';
          dots.style.padding = '0 6px';
          dots.style.color = 'var(--text-muted)';
          paginationButtons.appendChild(dots);
        }
        continue;
      }

      const pBtn = document.createElement('button');
      pBtn.className = `btn ${p === currentNotebookPage ? 'btn-primary' : 'btn-outline'}`;
      pBtn.style.padding = '2px 8px';
      pBtn.style.fontSize = '0.75rem';
      pBtn.style.minWidth = '28px';
      pBtn.textContent = p;
      pBtn.addEventListener('click', () => {
        pBtn.blur();
        currentNotebookPage = p;
        renderNotebookWordsTable();
      });
      paginationButtons.appendChild(pBtn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-icon-only';
    nextBtn.style.padding = '4px 8px';
    nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    nextBtn.disabled = currentNotebookPage === totalPages;
    nextBtn.addEventListener('click', () => {
      currentNotebookPage++;
      renderNotebookWordsTable();
    });
    paginationButtons.appendChild(nextBtn);
  }
}

// Window level functions for table actions so inline onclick works
window.handleNotebookWordPlay = function (wordText) {
  speakText(wordText);
};

window.handleNotebookWordToggleMemorized = async function (id) {
  const numericId = /^\d+$/.test(id) ? parseInt(id) : id;
  await toggleWordMemorized(numericId);
  openNotebookDashboard(activeNotebook);
};

window.handleNotebookWordToggleStarred = async function (id) {
  const numericId = /^\d+$/.test(id) ? parseInt(id) : id;
  await toggleWordStarred(numericId);
  openNotebookDashboard(activeNotebook);
};

window.handleNotebookWordDelete = async function (id) {
  const numericId = /^\d+$/.test(id) ? parseInt(id) : id;
  await handleDeleteCustomWord(numericId);
  openNotebookDashboard(activeNotebook);
};

// 5. Add custom word form submission handler
async function handleNotebookAddWordForm(e) {
  e.preventDefault();

  if (!activeNotebook || !activeNotebook.startsWith('custom:')) {
    showToast('Chỉ có thể thêm từ vựng vào sổ tay tự chọn!', true);
    return;
  }

  const listName = activeNotebook.substring(7);
  const word = document.getElementById('nb-add-word-zh').value.trim();
  const pinyin = document.getElementById('nb-add-word-pinyin').value.trim();
  const meaning = document.getElementById('nb-add-word-vi').value.trim();
  const explanation = document.getElementById('nb-add-word-desc').value.trim();
  const exampleInput = document.getElementById('nb-add-word-example').value.trim();

  let example_zh = '';
  let example_vi = '';
  if (exampleInput && exampleInput.includes('|')) {
    const parts = exampleInput.split('|');
    example_zh = parts[0].trim();
    example_vi = parts[1].trim();
  } else if (exampleInput) {
    example_zh = exampleInput.trim();
  }

  const payload = {
    word,
    pinyin,
    meaning,
    level: 99,
    category: listName,
    example_zh,
    example_vi,
    explanation
  };

  const form = document.getElementById('nb-add-word-form');

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

    showToast(`Đã lưu "${word}" vào sổ tay "${listName}"! 📁`);
    form.reset();
    openNotebookDashboard(activeNotebook);
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
      showToast(`Đã lưu "${word}" vào sổ tay "${listName}"! 📁`);
      form.reset();
      openNotebookDashboard(activeNotebook);
    } else {
      throw new Error('Lỗi từ API');
    }
  } catch (error) {
    console.error('API Error:', error);
    showToast('Lỗi lưu từ vựng mới vào sổ tay cá nhân!', true);
  }
}

// 6. Start Study Session From Notebook
function startStudySessionFromNotebook(mode) {
  if (!activeNotebook) return;

  studyNotebookId = activeNotebook;
  studyMode = mode;
  setStudyMode(mode);

  const notebookName = document.getElementById('dashboard-notebook-title').textContent;
  const notebookDesc = document.getElementById('dashboard-notebook-desc').textContent;

  // Pass HSK lesson selections if studying HSK
  if (activeNotebook.startsWith('hsk:')) {
    studySelectedLessons = selectedDashboardLessons.length > 0 ? [...selectedDashboardLessons] : null;
  } else {
    studySelectedLessons = null;
  }

  // Pass active filter to study session
  startStudySession(dashboardActiveFilter, 'all', notebookName, notebookDesc);
}

// 7. MULTIPLE-CHOICE QUIZ GAME ENGINE
function startQuizSession() {
  let words = getNotebookWords(activeNotebook);

  // Apply HSK lesson filters if selected
  if (activeNotebook.startsWith('hsk:') && selectedDashboardLessons.length > 0) {
    words = words.filter(w => w.lessonId && selectedDashboardLessons.includes(w.lessonId));
  }

  // Filter by dashboard active filter
  if (dashboardActiveFilter === 'studied') {
    words = words.filter(w => w.isStudied);
  } else if (dashboardActiveFilter === 'unstudied') {
    words = words.filter(w => !w.isStudied);
  } else if (dashboardActiveFilter === 'memorized') {
    words = words.filter(w => w.isMemorized);
  } else if (dashboardActiveFilter === 'unmemorized') {
    words = words.filter(w => w.isStudied && !w.isMemorized);
  } else if (dashboardActiveFilter === 'starred') {
    words = words.filter(w => w.isStarred);
  }

  if (words.length < 4) {
    showToast('Cần ít nhất 4 từ vựng thỏa mãn bộ lọc hiện tại để chơi trắc nghiệm!', true);
    return;
  }

  // Pick random words based on limit
  const limitCount = studyWordLimit === 'all' ? words.length : Math.min(studyWordLimit, words.length);
  const shuffledWords = shuffleArray([...words]);
  const quizWords = shuffledWords.slice(0, limitCount);

  quizQuestions = quizWords.map(word => {
    const candidates = vocabList.filter(w => w.id !== word.id);
    const shuffledCandidates = shuffleArray([...candidates]);
    const distractors = shuffledCandidates.slice(0, 3);

    const type = Math.floor(Math.random() * 3);

    let prompt = '';
    let subprompt = '';
    let correctOption = '';
    let options = [];
    let typeBadge = '';

    if (type === 0) {
      typeBadge = 'Đoán nghĩa của từ';
      prompt = word.word;
      subprompt = word.pinyin;
      correctOption = word.meaning;
      options = shuffleArray([word.meaning, ...distractors.map(d => d.meaning)]);
    } else if (type === 1) {
      typeBadge = 'Đoán chữ Hán từ Phiên âm';
      prompt = word.pinyin;
      subprompt = '';
      correctOption = word.word;
      options = shuffleArray([word.word, ...distractors.map(d => d.word)]);
    } else {
      typeBadge = 'Đoán Phiên âm của chữ';
      prompt = word.word;
      subprompt = '';
      correctOption = word.pinyin;
      options = shuffleArray([word.pinyin, ...distractors.map(d => d.pinyin)]);
    }

    return {
      word,
      typeBadge,
      prompt,
      subprompt,
      correctOption,
      options
    };
  });

  currentQuizIndex = 0;
  quizScore = 0;

  // Show quiz view
  document.getElementById('deck-selection-view').style.display = 'none';
  document.getElementById('quiz-study-view').style.display = 'block';
  document.getElementById('quiz-gameplay-panel').style.display = 'block';
  document.getElementById('quiz-result-panel').style.display = 'none';

  // Set header titles
  const quizDeckTitle = document.getElementById('quiz-deck-title');
  if (quizDeckTitle) {
    const notebookName = document.getElementById('dashboard-notebook-title').textContent;
    quizDeckTitle.textContent = `Trắc Nghiệm: ${notebookName}`;
  }

  renderQuizQuestion();
}

function renderQuizQuestion() {
  if (currentQuizIndex >= quizQuestions.length) {
    showQuizResult();
    return;
  }

  const q = quizQuestions[currentQuizIndex];

  const progressText = document.getElementById('quiz-progress-text');
  const progressFill = document.getElementById('quiz-progress-fill');
  const scoreText = document.getElementById('quiz-score-text');

  if (progressText) progressText.textContent = `Câu hỏi ${currentQuizIndex + 1} / ${quizQuestions.length}`;
  if (progressFill) progressFill.style.width = `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%`;
  if (scoreText) scoreText.innerHTML = `<i class="fa-solid fa-star"></i> Điểm: ${quizScore}`;

  const badge = document.getElementById('quiz-question-type-badge');
  const prompt = document.getElementById('quiz-question-prompt');
  const subprompt = document.getElementById('quiz-question-subprompt');

  if (badge) badge.textContent = q.typeBadge;
  if (prompt) {
    prompt.textContent = q.prompt;
    if (q.prompt.length > 10) {
      prompt.style.fontSize = '2.2rem';
    } else {
      prompt.style.fontSize = '3.5rem';
    }
  }

  if (subprompt) {
    if (q.subprompt) {
      subprompt.textContent = q.subprompt;
      subprompt.style.display = 'block';
    } else {
      subprompt.style.display = 'none';
    }
  }

  const optionsGrid = document.getElementById('quiz-options-grid');
  optionsGrid.innerHTML = '';

  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-outline quiz-option-btn';
    btn.style.width = '100%';
    btn.style.padding = '14px 20px';
    btn.style.borderRadius = '12px';
    btn.style.textAlign = 'left';
    btn.style.fontSize = '1.05rem';
    btn.style.fontWeight = '500';
    btn.style.background = 'rgba(255, 255, 255, 0.02)';
    btn.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    btn.style.color = 'var(--text-primary)';
    btn.style.transition = 'all 0.2s';
    btn.style.display = 'flex';
    btn.style.justifyContent = 'space-between';
    btn.style.alignItems = 'center';

    btn.innerHTML = `<span>${opt}</span><i class="fa-regular fa-circle" style="color: var(--text-muted);"></i>`;

    btn.addEventListener('click', () => {
      handleQuizAnswer(btn, opt, q.correctOption);
    });

    optionsGrid.appendChild(btn);
  });

  const feedback = document.getElementById('quiz-feedback');
  const nextBtn = document.getElementById('quiz-next-btn');

  if (feedback) {
    feedback.textContent = '';
    feedback.className = '';
  }
  if (nextBtn) nextBtn.style.display = 'none';
}

function handleQuizAnswer(selectedBtn, selectedOption, correctOption) {
  const buttons = document.querySelectorAll('.quiz-option-btn');
  buttons.forEach(btn => {
    btn.disabled = true;
    btn.style.cursor = 'default';
  });

  const feedback = document.getElementById('quiz-feedback');
  const nextBtn = document.getElementById('quiz-next-btn');
  const scoreText = document.getElementById('quiz-score-text');

  const q = quizQuestions[currentQuizIndex];

  // Mark word as studied
  markWordAsStudied(q.word.id);

  const isCorrect = selectedOption === correctOption;

  if (isCorrect) {
    quizScore += 10;
    selectedBtn.style.background = 'rgba(16, 185, 129, 0.15)';
    selectedBtn.style.borderColor = 'var(--success)';
    selectedBtn.style.color = 'var(--success)';
    selectedBtn.querySelector('i').className = 'fa-solid fa-circle-check';
    selectedBtn.querySelector('i').style.color = 'var(--success)';

    if (feedback) {
      feedback.textContent = 'Chính xác! Cố gắng phát huy nhé. 🎉';
      feedback.style.color = 'var(--success)';
    }

    speakText(q.word.word);
  } else {
    selectedBtn.style.background = 'rgba(239, 68, 68, 0.15)';
    selectedBtn.style.borderColor = 'var(--danger)';
    selectedBtn.style.color = 'var(--danger)';
    selectedBtn.querySelector('i').className = 'fa-solid fa-circle-xmark';
    selectedBtn.querySelector('i').style.color = 'var(--danger)';

    buttons.forEach(btn => {
      if (btn.querySelector('span').textContent === correctOption) {
        btn.style.background = 'rgba(16, 185, 129, 0.15)';
        btn.style.borderColor = 'var(--success)';
        btn.style.color = 'var(--success)';
        btn.querySelector('i').className = 'fa-solid fa-circle-check';
        btn.querySelector('i').style.color = 'var(--success)';
      }
    });

    if (feedback) {
      feedback.textContent = `Chưa chính xác! Đáp án đúng là: ${correctOption}`;
      feedback.style.color = 'var(--danger)';
    }

    markWordAsWrong(q.word.id);
  }

  if (scoreText) scoreText.innerHTML = `<i class="fa-solid fa-star"></i> Điểm: ${quizScore}`;
  if (nextBtn) nextBtn.style.display = 'flex';
}

function markWordAsWrong(wordId) {
  const index = vocabList.findIndex(w => w.id === wordId);
  if (index === -1) return;
  vocabList[index].isWrong = true;

  if (!currentUser) {
    const guestProgress = JSON.parse(localStorage.getItem('guest_progress') || '{}');
    if (!guestProgress[wordId]) guestProgress[wordId] = {};
    guestProgress[wordId].isWrong = true;
    localStorage.setItem('guest_progress', JSON.stringify(guestProgress));
  } else {
    fetch(`${API_BASE_URL}/api/vocabulary/${wordId}/wrong`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    }).catch(err => console.warn('Failed to report wrong word to server:', err));
  }
}

function showQuizResult() {
  document.getElementById('quiz-gameplay-panel').style.display = 'none';
  document.getElementById('quiz-result-panel').style.display = 'block';

  const resultMsg = document.getElementById('quiz-result-message');
  if (resultMsg) {
    const correctCount = quizScore / 10;
    resultMsg.textContent = `Chúc mừng! Bạn đã trả lời đúng ${correctCount}/${quizQuestions.length} câu hỏi. Tổng điểm: ${quizScore} điểm.`;
  }
}

function updateVersionButtonsUI() {
  const lv3Btn = document.getElementById('lessons-version-3-btn');
  const lv2Btn = document.getElementById('lessons-version-2-btn');
  const sv3Btn = document.getElementById('smart-hsk-version-3-btn');
  const sv2Btn = document.getElementById('smart-hsk-version-2-btn');
  const ev3Btn = document.getElementById('exams-version-3-btn');
  const ev2Btn = document.getElementById('exams-version-2-btn');

  if (lv3Btn && lv2Btn) {
    if (activeHskVersion === '3.0') {
      lv3Btn.classList.add('active');
      lv2Btn.classList.remove('active');
    } else {
      lv2Btn.classList.add('active');
      lv3Btn.classList.remove('active');
    }
  }

  const svYctBtn = document.getElementById('smart-yct-version-btn');

  if (sv3Btn && sv2Btn) {
    sv3Btn.classList.toggle('active', activeHskVersion === '3.0');
    sv2Btn.classList.toggle('active', activeHskVersion === '2.0');
    if (svYctBtn) svYctBtn.classList.toggle('active', activeHskVersion === 'yct');
  }

  if (ev3Btn && ev2Btn) {
    if (activeHskVersion === '3.0') {
      ev3Btn.classList.add('active');
      ev2Btn.classList.remove('active');
    } else {
      ev2Btn.classList.add('active');
      ev3Btn.classList.remove('active');
    }
  }
}

function updateExamsVersionUI() {
  const titleEl = document.getElementById('exams-section-title');
  const descEl = document.getElementById('exams-section-desc');
  if (titleEl) {
    titleEl.innerHTML = `<i class="fa-solid fa-graduation-cap text-primary"></i> Luyện Đề Thi HSK ${activeHskVersion}`;
  }
  if (descEl) {
    if (activeHskVersion === '3.0') {
      descEl.textContent = 'Chọn cấp độ để làm các bộ đề thi thử trực tuyến bám sát cấu trúc HSK 9 cấp mới nhất.';
    } else {
      descEl.textContent = 'Chọn cấp độ để làm các bộ đề thi thử trực tuyến bám sát cấu trúc HSK 6 cấp cũ.';
    }
  }

  // If the papers list is open, reload it
  const papersListScreen = document.getElementById('exam-papers-list');
  if (papersListScreen && papersListScreen.style.display === 'block') {
    if (currentExamLevel) {
      loadExamPapersList(currentExamLevel);
    }
  }
}

// 8. Launch Embedded game arena
function startGameArenaFromNotebook() {
  if (!activeNotebook) return;

  let levelParam = 'all';
  if (activeNotebook.startsWith('hsk:')) {
    const levelStr = activeNotebook.split(':')[1];
    if (levelStr && ['1', '2', '3', '4'].includes(levelStr)) {
      levelParam = levelStr;
    }
  }

  let lessonsParam = 'all';
  if (selectedDashboardLessons && selectedDashboardLessons.length > 0) {
    lessonsParam = selectedDashboardLessons.join(',');
  }

  const deckSelectionView = document.getElementById('deck-selection-view');
  if (deckSelectionView) deckSelectionView.style.display = 'none';

  const gamePlayView = document.getElementById('game-play-view');
  if (gamePlayView) gamePlayView.style.display = 'block';

  const iframe = document.getElementById('game-play-iframe');
  if (iframe) {
    iframe.src = `quiz-game.html?level=${levelParam}&lessons=${lessonsParam}&filter=${dashboardActiveFilter}&notebook=${activeNotebook}`;
  }
};

window.openAboutModal = function () {
  const modal = document.getElementById('about-hongtai-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
};

// --- NEW SIDEBAR DROPDOWN & FEATURE MODALS ---
window.toggleSidebarDropdown = function (element) {
  const group = element.closest('.sidebar-group');
  if (group) {
    group.classList.toggle('open');
  }
};

window.showHanVietRulesModal = function () {
  let modal = document.getElementById('han-viet-rules-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'han-viet-rules-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); z-index: 99999; align-items: center; justify-content: center; padding: 20px;';
    modal.innerHTML = `
      <div style="background: var(--bg-primary, #1e293b); border: 1px solid var(--border-glass, rgba(255,255,255,0.12)); border-radius: 20px; width: 100%; max-width: 800px; max-height: 85vh; overflow-y: auto; padding: 28px; color: var(--text-primary, #fff); position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        <button onclick="document.getElementById('han-viet-rules-modal').style.display='none'" style="position: absolute; top: 18px; right: 18px; background: none; border: none; color: var(--text-muted, #94a3b8); font-size: 1.5rem; cursor: pointer;">&times;</button>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="font-size: 2.2rem; background: rgba(59,130,246,0.15); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #3b82f6;">🗣️</div>
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; margin: 0;">Quy Tắc Chuyển Âm Hán-Việt ➔ Pinyin</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted, #94a3b8); margin: 4px 0 0 0;">Suy cách đọc Tiếng Trung từ âm Hán-Việt với quy luật phụ âm & thanh điệu chính xác</p>
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid var(--border-glass); padding-bottom: 12px;">
          <button class="btn btn-primary btn-sm">Phụ Âm Đầu</button>
          <button class="btn btn-secondary btn-sm">Thanh Điệu & Nguyên Âm</button>
          <button class="btn btn-secondary btn-sm">Ví Dụ Thực Tế</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
          <div style="background: var(--bg-secondary, #0f172a); border: 1px solid var(--border-glass); padding: 16px; border-radius: 14px;">
            <div style="font-weight: 700; color: #3b82f6; margin-bottom: 6px;">h- ➔ h</div>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Âm đầu h- giữ nguyên thành h trong Pinyin.</p>
            <div style="font-size: 0.85rem; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; margin-top: 8px;">
              <b>學</b> Học ➔ <b>húe</b> | <b>海</b> Hải ➔ <b>hǎi</b>
            </div>
          </div>
          <div style="background: var(--bg-secondary, #0f172a); border: 1px solid var(--border-glass); padding: 16px; border-radius: 14px;">
            <div style="font-weight: 700; color: #10b981; margin-bottom: 6px;">c / k / qu ➔ g / k</div>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Các âm gốc velar chuyển thành g hoặc k.</p>
            <div style="font-size: 0.85rem; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; margin-top: 8px;">
              <b>國</b> Quốc ➔ <b>guó</b> | <b>高</b> Cao ➔ <b>gāo</b>
            </div>
          </div>
          <div style="background: var(--bg-secondary, #0f172a); border: 1px solid var(--border-glass); padding: 16px; border-radius: 14px;">
            <div style="font-weight: 700; color: #f59e0b; margin-bottom: 6px;">t / th ➔ d / t</div>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Âm t- chuyển thành d-, th- chuyển thành t-.</p>
            <div style="font-size: 0.85rem; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px; margin-top: 8px;">
              <b>多</b> Đa ➔ <b>duō</b> | <b>天</b> Thiên ➔ <b>tiān</b>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
};

window.showWritingWorksheetModal = function () {
  let modal = document.getElementById('writing-worksheet-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'writing-worksheet-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); z-index: 99999; align-items: center; justify-content: center; padding: 20px;';
    modal.innerHTML = `
      <div style="background: var(--bg-primary, #1e293b); border: 1px solid var(--border-glass, rgba(255,255,255,0.12)); border-radius: 20px; width: 100%; max-width: 650px; padding: 28px; color: var(--text-primary, #fff); position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        <button onclick="document.getElementById('writing-worksheet-modal').style.display='none'" style="position: absolute; top: 18px; right: 18px; background: none; border: none; color: var(--text-muted, #94a3b8); font-size: 1.5rem; cursor: pointer;">&times;</button>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="font-size: 2.2rem; background: rgba(16,185,129,0.15); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #10b981;">📝</div>
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; margin: 0;">Tạo File Luyện Viết Chữ Hán</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted, #94a3b8); margin: 4px 0 0 0;">Xuất bản ô chữ Tianzige (田字格) kèm Pinyin để in ra luyện viết</p>
          </div>
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 6px;">Nhập danh sách từ vựng (Chữ Hán):</label>
          <textarea placeholder="VD: 你好, 谢谢, 学习, 中国..." style="width: 100%; height: 100px; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-glass); border-radius: 10px; color: #fff; resize: none;"></textarea>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button onclick="alert('File PDF Luyện viết đã được tạo thành công! Đang tiến hành tải xuống...')" class="btn btn-primary"><i class="fa-solid fa-file-pdf"></i> Tạo & Tải PDF In</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
};

window.showSentenceParserModal = function () {
  let modal = document.getElementById('sentence-parser-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'sentence-parser-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); z-index: 99999; align-items: center; justify-content: center; padding: 20px;';
    modal.innerHTML = `
      <div style="background: var(--bg-primary, #1e293b); border: 1px solid var(--border-glass, rgba(255,255,255,0.12)); border-radius: 20px; width: 100%; max-width: 750px; padding: 28px; color: var(--text-primary, #fff); position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        <button onclick="document.getElementById('sentence-parser-modal').style.display='none'" style="position: absolute; top: 18px; right: 18px; background: none; border: none; color: var(--text-muted, #94a3b8); font-size: 1.5rem; cursor: pointer;">&times;</button>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <div style="font-size: 2.2rem; background: rgba(245,158,11,0.15); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #f59e0b;">✨</div>
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; margin: 0;">Phân Tích Cú Pháp Câu AI</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted, #94a3b8); margin: 4px 0 0 0;">Tách từ, gắn nhãn từ loại và phân tích thành phần câu tự động</p>
          </div>
        </div>
        <div style="display: flex; gap: 10px; margin-bottom: 16px;">
          <input type="text" value="我每天都在学习汉语。" style="flex: 1; padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-glass); border-radius: 10px; color: #fff; font-size: 1rem;">
          <button class="btn btn-primary" onclick="alert('Đã phân tích xong câu!')"><i class="fa-solid fa-wand-magic-sparkles"></i> Phân Tích</button>
        </div>
        <div style="background: var(--bg-secondary); padding: 16px; border-radius: 12px; border: 1px solid var(--border-glass);">
          <div style="font-weight: 700; color: #f59e0b; margin-bottom: 8px;">Ví dụ phân tích:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <div style="background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; text-align: center;">
              <div style="font-size: 1.1rem; font-weight: 800;">我</div>
              <div style="font-size: 0.75rem; color: #3b82f6;">wǒ (Đại từ - Chủ ngữ)</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; text-align: center;">
              <div style="font-size: 1.1rem; font-weight: 800;">每天</div>
              <div style="font-size: 0.75rem; color: #10b981;">měitiān (Trạng ngữ)</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; text-align: center;">
              <div style="font-size: 1.1rem; font-weight: 800;">都在</div>
              <div style="font-size: 0.75rem; color: #f59e0b;">dōu zài (Phó từ/Trợ từ)</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; text-align: center;">
              <div style="font-size: 1.1rem; font-weight: 800;">学习</div>
              <div style="font-size: 0.75rem; color: #ef4444;">xuéxí (Động từ - Vị ngữ)</div>
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 8px; text-align: center;">
              <div style="font-size: 1.1rem; font-weight: 800;">汉语</div>
              <div style="font-size: 0.75rem; color: #8b5cf6;">hànyǔ (Danh từ - Tân ngữ)</div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
};

window.showLeaderboardModal = function () {
  let modal = document.getElementById('leaderboard-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'leaderboard-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); z-index: 99999; align-items: center; justify-content: center; padding: 20px;';
    modal.innerHTML = `
      <div style="background: var(--bg-primary, #1e293b); border: 1px solid var(--border-glass, rgba(255,255,255,0.12)); border-radius: 20px; width: 100%; max-width: 650px; padding: 28px; color: var(--text-primary, #fff); position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        <button onclick="document.getElementById('leaderboard-modal').style.display='none'" style="position: absolute; top: 18px; right: 18px; background: none; border: none; color: var(--text-muted, #94a3b8); font-size: 1.5rem; cursor: pointer;">&times;</button>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <div style="font-size: 2.2rem; background: rgba(251,191,36,0.15); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fbbf24;">🏆</div>
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; margin: 0;">Bảng Xếp Hạng Học Viên Thực Tế (MongoDB)</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted, #94a3b8); margin: 4px 0 0 0;">Xếp hạng ưu tiên theo: Số bài học hoàn thành nhiều nhất ➔ Thời gian hoàn thành sớm nhất</p>
          </div>
        </div>
        <div id="leaderboard-list-container" style="display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto; padding-right: 4px;">
          <div style="text-align: center; color: var(--text-muted); padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải bảng xếp hạng từ MongoDB...</div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';

  // Load real data from MongoDB backend API
  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === ''
    ? 'http://localhost:5000'
    : 'https://tieng-trung-hong-tai.onrender.com';

  fetch(`${API_BASE_URL}/api/leaderboard`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('leaderboard-list-container');
      if (!container) return;

      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">Chưa có học viên nào hoàn thành bài học. Hãy là người đầu tiên!</div>`;
        return;
      }

      let html = '';
      data.forEach(item => {
        let badgeIcon = `#${item.rank}`;
        let rankStyle = 'background: var(--bg-secondary); border: 1px solid var(--border-glass);';
        let rankColor = '#3b82f6';

        if (item.rank === 1) {
          badgeIcon = '🥇';
          rankStyle = 'background: rgba(251,191,36,0.12); border: 1px solid #fbbf24;';
          rankColor = '#fbbf24';
        } else if (item.rank === 2) {
          badgeIcon = '🥈';
          rankStyle = 'background: rgba(148,163,184,0.1); border: 1px solid #94a3b8;';
          rankColor = '#94a3b8';
        } else if (item.rank === 3) {
          badgeIcon = '🥉';
          rankStyle = 'background: rgba(180,83,9,0.1); border: 1px solid #b45309;';
          rankColor = '#b45309';
        }

        html += `
          <div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; ${rankStyle}">
            <span style="font-size: 1.2rem; font-weight: 800; width: 30px; text-align: center; color: ${rankColor};">${badgeIcon}</span>
            ${item.picture ? `<img src="${item.picture}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;">` : `<div style="width: 38px; height: 38px; border-radius: 50%; background: #3b82f6; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700;">${item.name.charAt(0)}</div>`}
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 800; font-size: 0.95rem; color: #fff; display: flex; align-items: center; gap: 6px;">
                ${item.name}
                ${item.isVip ? `<span style="font-size: 0.65rem; background: #fbbf24; color: #000; font-weight: 800; padding: 1px 6px; border-radius: 4px;">VIP</span>` : ''}
              </div>
              <div style="font-size: 0.75rem; color: #94a3b8;">Đã học thuộc: <strong style="color: #10b981;">${item.completedCount} từ / bài</strong></div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 800; color: ${rankColor}; font-size: 0.95rem;">${item.completedCount * 100} Điểm</div>
              <div style="font-size: 0.72rem; color: #94a3b8;">Thời gian học: ${item.studyTimeMinutes} phút</div>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
    })
    .catch(err => {
      console.error("Leaderboard fetch error:", err);
      const container = document.getElementById('leaderboard-list-container');
      if (container) {
        container.innerHTML = `<div style="text-align: center; color: #ef4444; padding: 20px;">Lỗi tải dữ liệu bảng xếp hạng từ server.</div>`;
      }
    });
};

window.showGrammarModal = function () {
  let modal = document.getElementById('grammar-hsk-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'grammar-hsk-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); z-index: 99999; align-items: center; justify-content: center; padding: 20px;';
    modal.innerHTML = `
      <div style="background: var(--bg-primary, #1e293b); border: 1px solid var(--border-glass, rgba(255,255,255,0.12)); border-radius: 20px; width: 100%; max-width: 900px; max-height: 88vh; display: flex; flex-direction: column; padding: 28px; color: var(--text-primary, #fff); position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        <button onclick="document.getElementById('grammar-hsk-modal').style.display='none'" style="position: absolute; top: 18px; right: 18px; background: none; border: none; color: var(--text-muted, #94a3b8); font-size: 1.5rem; cursor: pointer;">&times;</button>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <div style="font-size: 2.2rem; background: rgba(59,130,246,0.15); width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #3b82f6;">📖</div>
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; margin: 0;">Kho Tài Liệu Ngữ Pháp HSK (Từ HSK 1 Đến HSK 6)</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted, #94a3b8); margin: 4px 0 0 0;">Tổng hợp 6 bộ sách chuyên sâu ngữ pháp HSK, cấu trúc câu và ví dụ minh họa</p>
          </div>
        </div>

        <div id="grammar-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; overflow-y: auto; padding-right: 4px;">
          <div style="text-align: center; color: var(--text-muted); padding: 20px; grid-column: 1 / -1;"><i class="fa-solid fa-spinner fa-spin"></i> Đang danh sách bộ ngữ pháp HSK...</div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';

  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === ''
    ? 'http://localhost:5000'
    : 'https://tieng-trung-hong-tai.onrender.com';

  fetch(`${API_BASE_URL}/api/grammar/list`)
    .then(res => res.json())
    .then(list => {
      const grid = document.getElementById('grammar-cards-grid');
      if (!grid) return;

      let html = '';
      list.forEach(item => {
        html += `
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-glass); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 12px; transition: all 0.2s ease;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.75rem; font-weight: 800; padding: 3px 10px; border-radius: 20px; background: ${item.color}22; color: ${item.color}; border: 1px solid ${item.color}44;">${item.level}</span>
              <i class="fa-solid fa-file-pdf" style="color: ${item.color}; font-size: 1.4rem;"></i>
            </div>
            <div style="font-weight: 800; font-size: 1.1rem; color: #fff;">${item.title}</div>
            <p style="font-size: 0.8rem; color: #94a3b8; margin: 0; line-height: 1.4;">Tài liệu tổng hợp lý thuyết ngữ pháp, ví dụ Pinyin và cách dùng chuẩn HSK.</p>
            <div style="display: flex; gap: 8px; margin-top: auto; padding-top: 8px;">
              <a href="${item.file}" target="_blank" class="btn btn-primary btn-sm" style="flex: 1; text-align: center; text-decoration: none;"><i class="fa-solid fa-book-open"></i> Đọc Sách PDF</a>
              <a href="${item.file}" download class="btn btn-outline btn-sm" style="text-decoration: none;"><i class="fa-solid fa-download"></i></a>
            </div>
          </div>
        `;
      });

      grid.innerHTML = html;
    })
    .catch(err => {
      console.error("Error loading grammar list:", err);
    });
};


