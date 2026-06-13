// HSK Vocabulary Flashcard - Main Frontend Controller

// --- STATE MANAGEMENT ---
let vocabList = [];       // Master list of all vocabulary (seeded + custom)
let filteredList = [];    // Current active subset based on active filters/search
let currentIndex = 0;     // Selected card index in filteredList
let isFlipped = false;    // Card orientation state
let autoplayTimer = null; // Timer reference for autoplay loop
let isAutoplayActive = false; // Autoplay state
let activeLevel = '1';  // Level filter state: 'all', '1', '2', '3', '4'
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
  if (studySelectedLessons && studySelectedLessons.length > 0) {
    levelList = levelList.filter(w => w.lessonId && studySelectedLessons.includes(w.lessonId));
  } else if (activeStatus === 'custom' && studyCustomCategory) {
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
    showNotebookDashboardView(activeNotebook);
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

  // Scroll smooth
  const flashcardSection = document.getElementById('flashcard-section');
  if (flashcardSection) flashcardSection.scrollIntoView({ behavior: 'smooth' });
}

function renderDetailedStatsTable() {
  const tbody = document.getElementById('detailed-stats-rows');
  if (!tbody) return;

  tbody.innerHTML = '';
  const rowsData = [];

  // HSK Levels 1-3
  for (let lvl = 1; lvl <= 3; lvl++) {
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
    // If studying a specific notebook
    if (studyNotebookId) {
      const notebookWords = getNotebookWords(studyNotebookId);
      const ids = new Set(notebookWords.map(x => x.id));
      if (!ids.has(w.id)) return false;
    } else {
      // If studying a specific custom list, show only custom words in that list
      if (studyCustomCategory) {
        return w.isCustom && w.category === studyCustomCategory;
      }

      // 1. Level Filter
      if (activeLevel !== 'all' && w.level.toString() !== activeLevel) return false;

      // 1.1 Lessons Filter (if studying custom selected HSK lessons)
      if (studySelectedLessons && studySelectedLessons.length > 0) {
        if (!w.lessonId || !studySelectedLessons.includes(w.lessonId)) return false;
      }
    }

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
      switchTab(tabId);
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
        showNotebookDashboardView(activeNotebook);
      } else {
        showTopicsView();
      }
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
      markWordAsStudied(filteredList[currentIndex].id);
      speakText(filteredList[currentIndex].word);
    }
  });

  speakExampleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (filteredList.length > 0 && filteredList[currentIndex].example_zh) {
      showToast("Đang tải phát âm ví dụ...", false);
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

  resetFiltersBtn.addEventListener('click', () => {
    // Reset all filter controls
    studySelectedLessons = null;
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
        markWordAsStudied(filteredList[currentIndex].id);
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

      window.open(`detail-list.html?${params.toString()}`, '_blank');
    });
  }

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
      showNotebookDashboardView(activeNotebook);
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
      showNotebookDashboardView(activeNotebook);
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
      credentials: 'include',
      cache: 'no-store'
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
      optGrid.appendChild(optDiv);
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

  markWordAsStudied(current.id);

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

  // Group vocabulary dynamically by their lessonId field
  const lessonGroups = {};
  levelVocabs.forEach(w => {
    const les = w.lessonId || 1;
    if (!lessonGroups[les]) lessonGroups[les] = [];
    lessonGroups[les].push(w);
  });

  const uniqueLessonIds = Object.keys(lessonGroups).map(Number).sort((a, b) => a - b);

  uniqueLessonIds.forEach(lessonId => {
    const sliceWords = lessonGroups[lessonId] || [];
    const wordsCount = sliceWords.length;
    if (wordsCount === 0) return;

    // Retrieve title and desc directly from the first word of the group
    const title = sliceWords[0].lessonTitle || `Bài ${lessonId}`;
    const desc = sliceWords[0].lessonDesc || `Ôn tập từ vựng bài học HSK Cấp ${activeLessonsLevel}`;

    const card = document.createElement('div');
    card.className = 'lesson-card';
    card.innerHTML = `
      <div>
        <span class="lesson-badge">HSK${activeLessonsLevel} - Bài ${lessonId}</span>
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
  { title: "Giới thiệu bản thân (HSK 1)", text: "你好！我叫小王。我是越南人。我学习汉语。很高兴认识nǐ！" },
  { title: "Một ngày của tôi (HSK 2)", text: "我每天早上七点半起床。吃早饭以后去上学。我下午六点回宿舍。" },
  { title: "Sở thích của tôi (HSK 3)", text: "Sở thích của tôi là nghe nhạc và xem phim Trung Quốc. Tôi cảm thấy viết chữ Hán rất thú vị, nhưng cũng rất khó." }
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

function updateStatsUI() {
  const streakEl = document.getElementById('welcome-streak-val');
  const completedEl = document.getElementById('welcome-completed-val');
  const studyTimeEl = document.getElementById('welcome-study-time-val');

  if (streakEl) streakEl.textContent = `${userStreak} ngày`;
  if (studyTimeEl) studyTimeEl.textContent = `${Math.floor(userStudyTime / 60)} phút`;

  const completedCount = calculateCompletedLessons();
  if (completedEl) completedEl.textContent = `${completedCount} bài`;
}

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

  renderSubdecksList();
}

function showNotebookDashboardView(notebookId) {
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
  selectedDashboardLessons = [];

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
    return vocabList.filter(w => !w.isCustom && w.level.toString() === lvl);
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
    title.textContent = 'Danh sách Từ vựng HSK';
    for (let lvl = 1; lvl <= 3; lvl++) {
      const lvlWords = vocabList.filter(w => !w.isCustom && w.level.toString() === lvl.toString());
      grid.appendChild(createSubdeckCard(`HSK Cấp ${lvl}`, `hsk:${lvl}`, lvlWords.length, 'fa-graduation-cap', 'var(--success)'));
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

// 3. Open Notebook Dashboard and populate stats, options, and table
function openNotebookDashboard(notebookId) {
  const titleEl = document.getElementById('dashboard-notebook-title');
  const descEl = document.getElementById('dashboard-notebook-desc');

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
    name = `Từ vựng HSK Cấp ${lvl}`;
    desc = `Toàn bộ từ vựng luyện thi HSK Cấp ${lvl}`;
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
  const baseWords = getNotebookWords(notebookId);

  // Render HSK Lesson Selector Block if applicable
  const lessonContainer = document.getElementById('nb-hsk-lesson-selector-container');
  if (lessonContainer) {
    if (notebookId.startsWith('hsk:')) {
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
      selectedDashboardLessons = []; // Reset when leaving HSK notebook
    }
  }

  // Filter baseWords for statistics if specific HSK lessons are selected
  let wordsForStats = baseWords;
  if (notebookId.startsWith('hsk:') && selectedDashboardLessons.length > 0) {
    wordsForStats = baseWords.filter(w => w.lessonId && selectedDashboardLessons.includes(w.lessonId));
  }

  const total = wordsForStats.length;
  const memorized = wordsForStats.filter(w => w.isMemorized).length;
  const unmemorized = total - memorized;
  const starred = wordsForStats.filter(w => w.isStarred).length;
  const studied = wordsForStats.filter(w => w.isStudied).length;
  const unstudied = total - studied;

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
    words = words.filter(w => w.isStudied);
  } else if (dashboardActiveFilter === 'unstudied') {
    words = words.filter(w => !w.isStudied);
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
    words = words.filter(w => !w.isMemorized);
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


