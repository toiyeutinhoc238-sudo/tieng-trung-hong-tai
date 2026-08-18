// HSK Vocabulary Flashcard - Main Frontend Controller
import { HSK1_STRUCTURED_GRAMMAR } from '../grammar_hsk1.js';
import { HSK2_STRUCTURED_GRAMMAR } from '../grammar_hsk2.js';
import './screen_drawing.js';
if (typeof window !== 'undefined') {
  window.HSK1_STRUCTURED_GRAMMAR = HSK1_STRUCTURED_GRAMMAR;
  window.HSK2_STRUCTURED_GRAMMAR = HSK2_STRUCTURED_GRAMMAR;
}
let radicalsData = { radicals: [], comparisons: [] };
async function loadRadicalsData() {
  try {
    let res = await fetch('/radicals_data.json');
    if (!res.ok) {
      res = await fetch('/src/radicals_data.json');
    }
    if (res.ok) {
      radicalsData = await res.json();
    }
  } catch (e) {
    console.warn("Could not load radicals_data.json:", e);
  }
}
function cleanLessonTitle(rawTitle, lessonId) {
  if (!rawTitle && !lessonId) return '';
  if (!rawTitle) return `Bài ${lessonId}`;
  let str = String(rawTitle).trim();
  str = str.replace(/^(?:(Bài|Lesson)\s*\d+\s*[:\-–—]?\s*)+/gi, '').trim();
  if (lessonId) {
    return str ? `Bài ${lessonId}: ${str}` : `Bài ${lessonId}`;
  }
  return str ? `Bài ${str}` : '';
}
window.cleanLessonTitle = cleanLessonTitle;

// --- MEANING CLEANING & NOTE EXTRACTION HELPERS ---
function cleanMeaningText(m) {
  if (!m) return '';
  let str = String(m).trim();
  str = str.replace(/^(.+?\([^\)]+\))\s*[\(（][^\)］]+[\)］]\s*$/, '$1').trim();
  str = str.replace(/\s*[\(（](?:Ngôi|Chỉ|Có thể|Chào|Đáp|Dùng|Được|Quy tắc|Phủ|Trợ|Xem|Tôi|Thường|Thành|Biểu|Đặt|Khi|xem|dùng|nghĩa|thường|cấu trúc|biến điệu|Chương|Ví dụ|Hình|Đại từ|Tôn trọng)[^\)］]*[\)］]\s*$/gi, '').trim();
  return str;
}

function extractNoteFromMeaning(m) {
  if (!m) return '';
  const str = String(m).trim();
  const doubleMatch = str.match(/^.+?\([^\)]+\)\s*[\(（]([^\)］]+)[\)］]\s*$/);
  if (doubleMatch) return doubleMatch[1].trim();

  const singleMatch = str.match(/^.+?\s*[\(（]([^\)］]+)[\)］]\s*$/);
  if (singleMatch) {
    const parenText = singleMatch[1].trim();
    if (/^(Ngôi|Chỉ|Có thể|Chào|Đáp|Dùng|Được|Quy tắc|Phủ|Trợ|Xem|Tôi|Thường|Thành|Biểu|Đặt|Khi|xem|dùng|nghĩa|thường|cấu trúc|biến điệu|Chương|Ví dụ|Hình|Đại từ|Tôn trọng)/i.test(parenText) || parenText.length > 15 || /[.!?；;:]/.test(parenText)) {
      return parenText;
    }
  }
  return '';
}

// --- RADICAL LOOKUP HELPERS & ETYMOLOGY DICTIONARY MAP ---
const CHARACTER_RADICAL_MAP = {
  '王': [{ radical: '王', name: 'VƯƠNG', meaning: 'Vua, họ Vương' }],
  '老': [{ radical: '老', variant: '耂', name: 'LÃO', meaning: 'Già, người già' }],
  '师': [{ radical: '巾', name: 'CÂN', meaning: 'Khăn trùm' }],
  '你': [{ radical: '人', variant: '亻', name: 'NHÂN', meaning: 'Người' }],
  '好': [{ radical: '女', name: 'NỮ', meaning: 'Phụ nữ' }, { radical: '子', name: 'TỬ', meaning: 'Con cái' }],
  '我': [{ radical: '戈', name: 'QUA', meaning: 'Binh khí cổ' }],
  '们': [{ radical: '人', variant: '亻', name: 'NHÂN', meaning: 'Người' }],
  '他': [{ radical: '人', variant: '亻', name: 'NHÂN', meaning: 'Người' }],
  '她': [{ radical: '女', name: 'NỮ', meaning: 'Phụ nữ' }],
  '它': [{ radical: '宀', name: 'MIÊN', meaning: 'Mái nhà' }],
  '学': [{ radical: '子', name: 'TỬ', meaning: 'Trẻ con' }],
  '习': [{ radical: '羽', name: 'VŨ', meaning: 'Lông chim' }],
  '校': [{ radical: '木', name: 'MỘC', meaning: 'Cây gỗ' }],
  '语': [{ radical: '言', variant: '讠', name: 'NGÔN', meaning: 'Lời nói' }],
  '言': [{ radical: '言', variant: '讠', name: 'NGÔN', meaning: 'Lời nói' }],
  '谢': [{ radical: '言', variant: '讠', name: 'NGÔN', meaning: 'Lời nói' }],
  '话': [{ radical: '言', variant: '讠', name: 'NGÔN', meaning: 'Lời nói' }],
  '说': [{ radical: '言', variant: '讠', name: 'NGÔN', meaning: 'Lời nói' }],
  '请': [{ radical: '言', variant: '讠', name: 'NGÔN', meaning: 'Lời nói' }],
  '读': [{ radical: '言', variant: '讠', name: 'NGÔN', meaning: 'Lời nói' }],
  '识': [{ radical: '言', variant: '讠', name: 'NGÔN', meaning: 'Lời nói' }],
  '认': [{ radical: '言', variant: '讠', name: 'NGÔN', meaning: 'Lời nói' }],
  '吃': [{ radical: '口', name: 'KHẨU', meaning: 'Cái miệng' }],
  '喝': [{ radical: '口', name: 'KHẨU', meaning: 'Cái miệng' }],
  '叫': [{ radical: '口', name: 'KHẨU', meaning: 'Cái miệng' }],
  '听': [{ radical: '口', name: 'KHẨU', meaning: 'Cái miệng' }],
  '响': [{ radical: '口', name: 'KHẨU', meaning: 'Cái miệng' }],
  '吗': [{ radical: '口', name: 'KHẨU', meaning: 'Cái miệng' }],
  '呢': [{ radical: '口', name: 'KHẨU', meaning: 'Cái miệng' }],
  '吧': [{ radical: '口', name: 'KHẨU', meaning: 'Cái miệng' }],
  '汉': [{ radical: '水', variant: '氵', name: 'THỦY', meaning: 'Dòng nước' }],
  '河': [{ radical: '水', variant: '氵', name: 'THỦY', meaning: 'Dòng nước' }],
  '海': [{ radical: '水', variant: '氵', name: 'THỦY', meaning: 'Dòng nước' }],
  '游': [{ radical: '水', variant: '氵', name: 'THỦY', meaning: 'Dòng nước' }],
  '洗': [{ radical: '水', variant: '氵', name: 'THỦY', meaning: 'Dòng nước' }],
  '没': [{ radical: '水', variant: '氵', name: 'THỦY', meaning: 'Dòng nước' }],
  '漂': [{ radical: '水', variant: '氵', name: 'THỦY', meaning: 'Dòng nước' }],
  '亮': [{ radical: '亠', name: 'ĐẦU', meaning: 'Nét đầu' }],
  '情': [{ radical: '心', variant: '忄', name: 'TÂM', meaning: 'Quả tim, tình cảm' }],
  '想': [{ radical: '心', name: 'TÂM', meaning: 'Quả tim, tư tưởng' }],
  '思': [{ radical: '心', name: 'TÂM', meaning: 'Quả tim, suy nghĩ' }],
  '忙': [{ radical: '心', variant: '忄', name: 'TÂM', meaning: 'Tâm trí bận rộn' }],
  '快': [{ radical: '心', variant: '忄', name: 'TÂM', meaning: 'Tâm trạng vui vẻ/nhanh' }],
  '打': [{ radical: '手', variant: '扌', name: 'THỦ', meaning: 'Cái tay' }],
  '找': [{ radical: '手', variant: '扌', name: 'THỦ', meaning: 'Cái tay' }],
  '拿': [{ radical: '手', name: 'THỦ', meaning: 'Cái tay' }],
  '推': [{ radical: '手', variant: '扌', name: 'THỦ', meaning: 'Cái tay' }],
  '拉': [{ radical: '手', variant: '扌', name: 'THỦ', meaning: 'Cái tay' }],
  '热': [{ radical: '火', variant: '灬', name: 'HỎA', meaning: 'Ngọn lửa, sức nóng' }],
  '点': [{ radical: '火', variant: '灬', name: 'HỎA', meaning: 'Ngọn lửa nhỏ' }],
  '照': [{ radical: '火', variant: '灬', name: 'HỎA', meaning: 'Ánh sáng ngọn lửa' }],
  '猫': [{ radical: '犬', variant: '犭', name: 'KHUYỂN', meaning: 'Con chó, loài thú' }],
  '狗': [{ radical: '犬', variant: '犭', name: 'KHUYỂN', meaning: 'Con chó, loài thú' }],
  '猪': [{ radical: '犬', variant: '犭', name: 'KHUYỂN', meaning: 'Con chó, loài thú' }],
  '视': [{ radical: '示', variant: '礻', name: 'THỊ', meaning: 'Hiển thị, thần linh' }],
  '礼': [{ radical: '示', variant: '礻', name: 'THỊ', meaning: 'Lễ nghi' }],
  '裤': [{ radical: '衣', variant: '衤', name: 'Y', meaning: 'Áo quần' }],
  '衫': [{ radical: '衣', variant: '衤', name: 'Y', meaning: 'Áo quần' }],
  '衬': [{ radical: '衣', variant: '衤', name: 'Y', meaning: 'Áo quần' }],
  '国': [{ radical: '囗', name: 'VI', meaning: 'Bao quanh' }],
  '园': [{ radical: '囗', name: 'VI', meaning: 'Bao quanh' }],
  '图': [{ radical: '囗', name: 'VI', meaning: 'Bao quanh' }],
  '因': [{ radical: '囗', name: 'VI', meaning: 'Bao quanh' }],
  '家': [{ radical: '宀', name: 'MIÊN', meaning: 'Mái nhà' }],
  '字': [{ radical: '宀', name: 'MIÊN', meaning: 'Mái nhà' }],
  '安': [{ radical: '宀', name: 'MIÊN', meaning: 'Mái nhà' }],
  '客': [{ radical: '宀', name: 'MIÊN', meaning: 'Mái nhà' }],
  '室': [{ radical: '宀', name: 'MIÊN', meaning: 'Mái nhà' }],
  '休': [{ radical: '人', variant: '亻', name: 'NHÂN', meaning: 'Người dựa vào cây nghỉ' }],
  '体': [{ radical: '人', variant: '亻', name: 'NHÂN', meaning: 'Cơ thể người' }],
  '作': [{ radical: '人', variant: '亻', name: 'NHÂN', meaning: 'Hành động của người' }],
  '做': [{ radical: '人', variant: '亻', name: 'NHÂN', meaning: 'Hành động của người' }],
  '住': [{ radical: '人', variant: '亻', name: 'NHÂN', meaning: 'Nơi người ở' }],
  '位': [{ radical: '人', variant: '亻', name: 'NHÂN', meaning: 'Vị trí của người' }],
  '使': [{ radical: '人', variant: '亻', name: 'NHÂN', meaning: 'Sứ giả, con người' }],
  '便': [{ radical: '人', variant: '亻', name: 'NHÂN', meaning: 'Thuận tiện' }],
  '借': [{ radical: '人', variant: '亻', name: 'NHÂN', meaning: 'Mượn' }],
  '假': [{ radical: '人', variant: '亻', name: 'NHÂN', meaning: 'Nghỉ phép' }],
  '保': [{ radical: '人', variant: '亻', name: 'NHÂN', meaning: 'Bảo vệ' }],
  '信': [{ radical: '人', variant: '亻', name: 'NHÂN', meaning: 'Lòng tin con người' }],
  '修': [{ radical: '人', variant: '亻', name: 'NHÂN', meaning: 'Sửa chữa' }],
  '健': [{ radical: '人', variant: '亻', name: 'NHÂN', meaning: 'Sức khỏe con người' }],
  '康': [{ radical: '广', name: 'NGHIỄM', meaning: 'Mái nhà rộng' }],
  '库': [{ radical: '广', name: 'NGHIỄM', meaning: 'Kho bãi' }],
  '店': [{ radical: '广', name: 'NGHIỄM', meaning: 'Cửa hàng' }],
  '座': [{ radical: '广', name: 'NGHIỄM', meaning: 'Chỗ ngồi' }],
  '庭': [{ radical: '广', name: 'NGHIỄM', meaning: 'Sân nhà' }],
  '床': [{ radical: '广', name: 'NGHIỄM', meaning: 'Cái giường' }]
};

function findRadicalsForWord(word) {
  if (!word || !radicalsData || !radicalsData.radicals) return [];
  const found = [];
  const chars = Array.from(word);
  const seenKeys = new Set();

  for (const char of chars) {
    // 1. Check curated etymological dictionary first
    if (CHARACTER_RADICAL_MAP[char]) {
      for (const item of CHARACTER_RADICAL_MAP[char]) {
        const radMatch = radicalsData.radicals.find(r => r.radical === item.radical) || item;
        const key = radMatch.id || (radMatch.radical + '_' + radMatch.name);
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          found.push(radMatch);
        }
      }
      continue;
    }

    // 2. Try exact main radical match in database
    const exactMain = radicalsData.radicals.find(r => r.radical === char);
    if (exactMain) {
      const key = exactMain.id || exactMain.radical;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        found.push(exactMain);
      }
      continue;
    }

    // 3. Try exact variant match in database
    const exactVar = radicalsData.radicals.find(r => r.variant && r.variant === char);
    if (exactVar) {
      const key = exactVar.id || exactVar.radical;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        found.push(exactVar);
      }
      continue;
    }
  }

  return found;
}

function getRadicalBadgeHtml(word) {
  const rads = findRadicalsForWord(word);
  if (!rads || rads.length === 0) return '';

  const badgesHtml = rads.slice(0, 3).map(r => `
    <span style="background: rgba(37, 99, 235, 0.12); color: #2563eb; border: 1px solid rgba(37, 99, 235, 0.28); padding: 3px 10px; border-radius: 6px; font-weight: 600; font-size: 0.88rem; display: flex; align-items: center; gap: 5px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
      <strong style="font-family: var(--font-hanzi); font-size: 1.05rem; color: #1d4ed8;">${r.variant ? `${r.radical} (${r.variant})` : r.radical}</strong>
      <span>(${r.name} - ${r.meaning})</span>
    </span>
  `).join('');

  return `
    <div style="margin-top: 2px; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
      <div style="font-size: 0.82rem; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 4px;">
        <i class="fa-solid fa-shapes"></i> Bộ thủ:
      </div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
        ${badgesHtml}
      </div>
    </div>
  `;
}

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
let studyMode = 'lesson';       // 'lesson', 'flip', or 'type'
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
  if (localStorage.getItem('sidebar_collapsed') === 'true') {
    document.body.classList.add('sidebar-collapsed');
  }
  initTheme();
  initSeasonalParticles();
  initVoices();
  await initAuth();

  const pathname = window.location.pathname;
  const isMainAppPage = !pathname.includes('.html') || pathname.endsWith('index.html') || pathname === '/';

  if (isMainAppPage) {
    await fetchVocabulary();
    renderGamifiedRoadmapPath();
    setupEventListeners();
    initExams();
    initLessonsView();
    initChatbot();
    const urlParams = new URLSearchParams(window.location.search);
    const targetTab = urlParams.get('tab') || (window.location.hash ? window.location.hash.replace('#', '') : '');
    const targetLevel = urlParams.get('level');
    const targetVersion = urlParams.get('version') || localStorage.getItem('active_hsk_version') || '3.0';

    const openVocabLesson = urlParams.get('openVocab');
    const openGrammarLesson = urlParams.get('openGrammar');

    if (targetTab === 'lessons' || targetLevel) {
      const lvl = targetLevel || 1;
      goToRoadmapLevel(targetVersion, lvl);
      if (openVocabLesson) {
        setTimeout(() => window.openLessonVocabStudy(openVocabLesson), 250);
      } else if (openGrammarLesson) {
        setTimeout(() => window.openLessonGrammarModal(openGrammarLesson), 250);
      }
    } else if (openVocabLesson) {
      goToRoadmapLevel(targetVersion, targetLevel || 1);
      setTimeout(() => window.openLessonVocabStudy(openVocabLesson), 250);
    } else if (openGrammarLesson) {
      goToRoadmapLevel(targetVersion, targetLevel || 1);
      setTimeout(() => window.openLessonGrammarModal(openGrammarLesson), 250);
    } else if (targetTab === 'roadmap') {
      showRoadmapView();
    } else if (targetTab === 'exams') {
      switchTab('exams');
    } else if (targetTab === 'flashcards') {
      switchTab('flashcards');
    } else if (targetTab === 'dictionary') {
      switchTab('dictionary');
    } else {
      showHomeView();
    }
  } else {
    try {
      await fetchVocabulary();
    } catch (e) {
      console.warn("Subpage vocab fetch:", e);
    }
  }
});

// --- SEASONAL FALLING PARTICLES ENGINE (Xuân - Hạ - Thu - Đông) ---
function initSeasonalParticles() {
  if (window.seasonalParticlesInitialized) return;
  window.seasonalParticlesInitialized = true;

  let canvas = document.getElementById('seasonal-particle-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'seasonal-particle-canvas';
    canvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 2;';
    if (document.body) {
      document.body.appendChild(canvas);
    } else {
      document.addEventListener('DOMContentLoaded', () => document.body.appendChild(canvas));
    }
  }

  const ctx = canvas ? canvas.getContext('2d') : null;
  if (!ctx) return;

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const month = new Date().getMonth() + 1; // 1 to 12
  let season = 'spring';
  if (month >= 1 && month <= 3) season = 'spring';      // Tháng 1-3: Hoa đào xuân
  else if (month >= 4 && month <= 6) season = 'summer'; // Tháng 4-6: Lá xanh
  else if (month >= 7 && month <= 9) season = 'autumn'; // Tháng 7-9: Lá vàng thu
  else season = 'winter';                              // Tháng 10-12: Tuyết rơi

  // Hardware Profiler: Detect low-power/older chipsets automatically
  const cores = navigator.hardwareConcurrency || 4;
  const isLowEndDevice = cores <= 4 || window.innerWidth < 768;
  const particleCount = isLowEndDevice ? (window.innerWidth < 480 ? 10 : 14) : 22;
  const targetFps = isLowEndDevice ? 35 : 60;
  const frameInterval = 1000 / targetFps;

  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: season === 'winter' ? (Math.random() * 2.5 + 2) : (Math.random() * 5 + 4),
      speedY: Math.random() * 0.9 + 0.4,
      speedX: Math.sin(Math.random() * Math.PI) * 0.4,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 1.0,
      opacity: Math.random() * 0.4 + 0.35
    });
  }

  let lastFrameTime = performance.now();
  let animationFrameId = null;

  function render(currentTime) {
    if (document.hidden || localStorage.getItem('particles_enabled') === 'false') {
      animationFrameId = setTimeout(() => requestAnimationFrame(render), 300);
      return;
    }

    const delta = currentTime - lastFrameTime;
    if (delta >= frameInterval) {
      lastFrameTime = currentTime - (delta % frameInterval);

      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.01) * 0.35;
        p.rotation += p.rotSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;

        if (season === 'winter') {
          // Soft snowflakes
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (season === 'spring') {
          // Sakura petals
          ctx.fillStyle = 'rgba(255, 183, 197, 0.85)';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (season === 'summer') {
          // Summer green leaves
          ctx.fillStyle = 'rgba(74, 222, 128, 0.8)';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.4, 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else if (season === 'autumn') {
          // Autumn golden maple leaves
          ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
  const enabled = localStorage.getItem('particles_enabled') !== 'false';
  updateParticleToggleBtns(enabled);
}

function updateParticleToggleBtns(enabled) {
  const btns = document.querySelectorAll('#particle-toggle-btn, .particle-toggle-btn');
  btns.forEach(btn => {
    if (enabled) {
      btn.classList.remove('particles-off');
      btn.innerHTML = '<i class="fa-solid fa-snowflake" style="color: #60a5fa;"></i>';
      btn.title = 'Tắt hiệu ứng rơi động (Đang BẬT)';
    } else {
      btn.classList.add('particles-off');
      btn.innerHTML = '<i class="fa-solid fa-snowflake" style="opacity: 0.4;"></i>';
      btn.title = 'Bật hiệu ứng rơi động (Đang TẮT)';
    }
  });
}

window.toggleSeasonalParticles = function() {
  const current = localStorage.getItem('particles_enabled') !== 'false';
  const next = !current;
  localStorage.setItem('particles_enabled', next ? 'true' : 'false');
  updateParticleToggleBtns(next);

  const canvas = document.getElementById('seasonal-particle-canvas');
  if (canvas) {
    canvas.style.display = next ? 'block' : 'none';
  }

  if (typeof showToast === 'function') {
    showToast(next ? 'Đã BẬT hiệu ứng thời tiết mùa' : 'Đã TẮT hiệu ứng thời tiết mùa');
  }
};
window.updateParticleToggleBtns = updateParticleToggleBtns;

// Global listener for particle toggle button
document.addEventListener('click', (e) => {
  const particleBtn = e.target.closest('#particle-toggle-btn, .particle-toggle-btn');
  if (particleBtn) {
    e.preventDefault();
    e.stopPropagation();
    window.toggleSeasonalParticles();
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSeasonalParticles);
} else {
  initSeasonalParticles();
}

// --- THEME MANAGEMENT ---
function applyThemeClass(isDark) {
  const bgUrl = isDark ? "url('/assets/app_bg_night_v3.png')" : "url('/assets/app_bg_day_v3.png')";
  document.documentElement.style.setProperty('background-image', bgUrl, 'important');
  document.documentElement.style.setProperty('background-size', 'cover', 'important');
  document.documentElement.style.setProperty('background-position', 'center center', 'important');
  document.documentElement.style.setProperty('background-attachment', 'fixed', 'important');
  document.documentElement.style.setProperty('background-repeat', 'no-repeat', 'important');

  if (isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light', 'light-mode');
    if (document.body) {
      document.body.classList.remove('light', 'light-mode');
      document.body.classList.add('dark');
      document.body.style.setProperty('background-image', bgUrl, 'important');
    }
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light', 'light-mode');
    if (document.body) {
      document.body.classList.remove('dark');
      document.body.classList.add('light-mode');
      document.body.style.setProperty('background-image', bgUrl, 'important');
    }
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  const isDark = savedTheme !== 'light';
  applyThemeClass(isDark);
  const icon = isDark ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>';
  const floatingToggle = document.getElementById('floating-theme-toggle-btn');
  if (floatingToggle) floatingToggle.innerHTML = icon;
  const headerToggle = document.getElementById('theme-toggle-btn');
  if (headerToggle) headerToggle.innerHTML = icon;
  if (themeToggleBtn) themeToggleBtn.innerHTML = icon;
}

function toggleTheme() {
  const isCurrentlyDark = document.documentElement.classList.contains('dark');
  const nextDark = !isCurrentlyDark;
  applyThemeClass(nextDark);
  localStorage.setItem('theme', nextDark ? 'dark' : 'light');

  const icon = nextDark ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>';
  const floatingToggle = document.getElementById('floating-theme-toggle-btn');
  if (floatingToggle) floatingToggle.innerHTML = icon;
  const headerToggle = document.getElementById('theme-toggle-btn');
  if (headerToggle) headerToggle.innerHTML = icon;
  if (themeToggleBtn) themeToggleBtn.innerHTML = icon;

  showToast(nextDark ? 'Đã chuyển sang chế độ tối' : 'Đã chuyển sang chế độ sáng');
  if (!currentUser && typeof initGoogleSignIn === 'function') {
    initGoogleSignIn();
  }
}
window.toggleTheme = toggleTheme;

// Global listener for theme toggle button across all pages
document.addEventListener('click', (e) => {
  const toggleBtn = e.target.closest('#theme-toggle-btn, .rank-theme-btn');
  if (toggleBtn) {
    toggleTheme();
  }
});

// --- TEXT TO SPEECH (TTS) SETUP ---
let speechVoice = localStorage.getItem('speech_voice') || 'baidu-female';
localStorage.setItem('speech_voice', 'baidu-female');
let speechPlaybackRate = parseFloat(localStorage.getItem('speech_playback_rate') || '0.85');
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

  // 2. Speed settings (Slightly slower for clear learning: default 0.78)
  const speedSelectEl = document.getElementById('tts-speed-select');
  let currentSpeed = (speedSelectEl && speedSelectEl.value) ? parseFloat(speedSelectEl.value) : (parseFloat(localStorage.getItem('speech_playback_rate')) || 0.78);
  if (currentSpeed > 0.85) currentSpeed = 0.78;
  localStorage.setItem('speech_playback_rate', currentSpeed.toString());

  // 3. Request Baidu Female Voice MP3 stream from backend server with speed=3 (chậm rãi, tròn vành rõ chữ)
  const currentVoice = 'baidu-female';
  const url = `${API_BASE_URL}/api/tts?text=${encodeURIComponent(cleanText)}&voice=${encodeURIComponent(currentVoice)}&speed=3`;
  
  const audio = new Audio(url);
  audio.playbackRate = currentSpeed;
  activeAudioElement = audio;

  audio.play().catch(err => {
    console.warn("Retrying Baidu female voice audio playback...", err);
    setTimeout(() => {
      audio.play().catch(e => {
        console.error("Audio playback error:", e);
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = 'zh-CN';
          utterance.rate = currentSpeed;
          window.speechSynthesis.speak(utterance);
        }
      });
    }, 200);
  });
}
window.speakText = speakText;

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

    // Merge user/guest progress from localStorage to ensure progress is never lost across login/logout
    const userKey = currentUser ? (currentUser._id || currentUser.id || currentUser.email || 'user') : 'guest';
    const userProg = JSON.parse(localStorage.getItem(`user_progress_${userKey}`) || '{}');
    const guestProg = JSON.parse(localStorage.getItem('guest_progress') || '{}');
    const mergedProg = { ...guestProg, ...userProg };

    vocabList = vocabList.map(w => {
      // Dual lookup: check w.id, String(w.id), or w.word to ensure user progress is never lost
      const state = mergedProg[w.id] || mergedProg[String(w.id)] || (w.word ? mergedProg[w.word] : null);
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
  showToast(nextState ? 'Đã thuộc từ này! 🎉 (+100 điểm)' : 'Đã bỏ thuộc! Từ này quay lại danh sách cần ôn tập ⚠️ (-100 điểm)');

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

async function markLessonWordMemorized(id) {
  if (!id) return;
  const index = vocabList.findIndex(w => w.id === id);
  if (index !== -1) {
    vocabList[index].isMemorized = true;
    vocabList[index].isStudied = true;
  }

  const userKey = currentUser ? (currentUser._id || currentUser.id || currentUser.email || 'user') : 'guest';
  const progressKey = `user_progress_${userKey}`;

  try {
    const userProg = JSON.parse(localStorage.getItem(progressKey) || '{}');
    userProg[id] = { isMemorized: true, isStudied: true, level: vocabList[index] ? vocabList[index].level : '1' };
    localStorage.setItem(progressKey, JSON.stringify(userProg));

    const guestProg = JSON.parse(localStorage.getItem('guest_progress') || '{}');
    guestProg[id] = { isMemorized: true, isStudied: true, level: vocabList[index] ? vocabList[index].level : '1' };
    localStorage.setItem('guest_progress', JSON.stringify(guestProg));
  } catch(e) {}

  updateStats();

  if (currentUser) {
    try {
      await fetch(API_BASE_URL + '/api/vocabulary/toggle-memorized', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ id, isMemorized: true }),
        credentials: 'include'
      });
    } catch(e) {
      console.warn('Sync lesson word progress error:', e);
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

let activeLessonHanziWriter = null;

function renderActiveCardLesson(current) {
  const lessonCard = document.getElementById('lesson-study-card');
  if (!lessonCard) return;

  // 1. Pinyin Badge
  const pinyinBadge = document.getElementById('lesson-pinyin-badge');
  if (pinyinBadge) pinyinBadge.textContent = current.pinyin || '';

  // 2. Meaning Text
  const meaningEl = document.getElementById('lesson-meaning-text');
  const cleanMeaning = cleanMeaningText(current.meaning || '');
  if (meaningEl) meaningEl.textContent = cleanMeaning;

  // 3. Word Type Badge
  const wordTypeBadge = document.getElementById('lesson-wordtype-badge');
  if (wordTypeBadge) wordTypeBadge.textContent = current.category || current.word_type || 'Từ vựng';

  // 4. Level Badge
  const levelBadge = document.getElementById('lesson-level-badge');
  if (levelBadge) {
    levelBadge.textContent = current.isCustom ? 'Cá nhân' : `HSK ${current.level || 1} (v${current.hskVersion || '3.0'})`;
  }

  // 5. Note / Usage Text
  const noteEl = document.getElementById('lesson-note-text');
  if (noteEl) {
    const extractedNote = extractNoteFromMeaning(current.meaning);
    if (current.note || current.description || extractedNote) {
      noteEl.textContent = current.note || current.description || extractedNote;
    } else {
      noteEl.textContent = `Bài học từ vựng HSK ${current.level || 1} - Lộ trình học Tiếng Trung Hồng Thái`;
    }
  }

  // 6. Example & Translation Exercise Prompts
  const promptText = document.getElementById('lesson-prompt-text');
  const inputEl = document.getElementById('lesson-typing-input');
  const feedbackCorrect = document.getElementById('lesson-feedback-correct');
  const feedbackWrong = document.getElementById('lesson-feedback-wrong');
  const answerBox = document.getElementById('lesson-standard-answer-box');
  const standardZhText = document.getElementById('lesson-standard-zh-text');

  if (inputEl) {
    inputEl.value = '';
    inputEl.style.borderColor = '#cbd5e1';
  }
  if (feedbackCorrect) feedbackCorrect.style.display = 'none';
  if (feedbackWrong) feedbackWrong.style.display = 'none';
  if (answerBox) answerBox.style.display = 'none';

  const egZh = (current.example_zh || '').trim();
  const egVi = (current.example_vi || '').trim();

  // Smart split Chinese & Vietnamese examples
  const egZhLines = egZh ? egZh.split(/(?<=[！。？\n])\s*/).map(s => s.trim()).filter(Boolean) : [];
  const egViLines = egVi ? egVi.split(/(?<=[.!?\n])\s*/).map(s => s.trim()).filter(Boolean) : [];

  let targetZhSentence = current.word;
  let promptViSentence = cleanMeaning;

  if (egZhLines.length > 0 && egViLines.length > 0 && egViLines[0] && egViLines[0] !== cleanMeaning) {
    targetZhSentence = egZhLines[0];
    promptViSentence = egViLines[0];
  } else {
    targetZhSentence = current.word;
    promptViSentence = cleanMeaning;
  }

  if (promptText) promptText.textContent = `"${promptViSentence}"`;
  if (standardZhText) standardZhText.textContent = targetZhSentence;

  // 6b. Render Word Hint Cards using the randomly selected target Chinese sentence
  renderLessonWordHintCards(targetZhSentence);

  // 7. HanziWriter Tianzige Grid
  const targetContainer = document.getElementById('lesson-hanzi-target');
  if (targetContainer) {
    targetContainer.innerHTML = '';
    if (window.HanziWriter && current.word) {
      const charToDraw = current.word[0];
      try {
        const isDark = document.documentElement.classList.contains('dark');
        activeLessonHanziWriter = HanziWriter.create('lesson-hanzi-target', charToDraw, {
          width: 160,
          height: 160,
          padding: 5,
          showOutline: true,
          strokeColor: '#2563eb',
          radicalColor: '#ef4444',
          outlineColor: isDark ? '#475569' : '#94a3b8',
          strokeAnimationSpeed: 1.2,
          onLoadCharDataError: function(err) {
            targetContainer.innerHTML = `<span style="font-size: 4.5rem; font-weight: 900; color: #ef4444;">${current.word}</span>`;
          }
        });
        activeLessonHanziWriter.animateCharacter().catch(() => {});
      } catch (err) {
        console.warn('HanziWriter error:', err);
        targetContainer.innerHTML = `<span style="font-size: 5rem; font-weight: 900; color: #ef4444;">${current.word}</span>`;
      }
    } else {
      targetContainer.innerHTML = `<span style="font-size: 5rem; font-weight: 900; color: #ef4444;">${current.word}</span>`;
    }
  }

  // 7b. Render Radicals Box in Left Column (Fills empty layout space)
  const radsContainer = document.getElementById('lesson-radicals-badges-list');
  const radsWrapper = document.getElementById('lesson-radicals-container-left');
  if (radsContainer) {
    const rads = findRadicalsForWord(current.word);
    if (rads && rads.length > 0) {
      if (radsWrapper) radsWrapper.style.display = 'flex';
      radsContainer.innerHTML = rads.map(r => `
        <div style="background: rgba(37, 99, 235, 0.08); border: 1.5px solid rgba(37, 99, 235, 0.22); border-radius: 10px; padding: 6px 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-family: var(--font-chinese); font-size: 1.2rem; font-weight: 900; color: #1d4ed8;">${r.variant ? `${r.radical} (${r.variant})` : r.radical}</span>
            <span style="font-weight: 800; font-size: 0.85rem; color: #0f172a;">${r.name}</span>
          </div>
          <span style="font-size: 0.78rem; font-weight: 700; color: #475569;">${r.meaning}</span>
        </div>
      `).join('');
    } else {
      if (radsWrapper) radsWrapper.style.display = 'none';
    }
  }

  // Update HUD Button States
  const markMemorizedBtn = document.getElementById('mark-memorized-btn');
  const markUnmemorizedBtn = document.getElementById('mark-unmemorized-btn');
  const markStarredBtn = document.getElementById('mark-starred-btn');
  if (markMemorizedBtn && markUnmemorizedBtn && markStarredBtn) {
    if (current.isMemorized) {
      markMemorizedBtn.classList.add('active');
      markUnmemorizedBtn.classList.remove('active');
    } else if (current.isStudied) {
      markMemorizedBtn.classList.remove('active');
      markUnmemorizedBtn.classList.add('active');
    } else {
      markMemorizedBtn.classList.remove('active');
      markUnmemorizedBtn.classList.remove('active');
    }
    if (current.isStarred) {
      markStarredBtn.classList.add('active');
    } else {
      markStarredBtn.classList.remove('active');
    }
  }
}

// Render Eye Hint Cards matching Image 2 EXACTLY
function renderLessonWordHintCards(sentence) {
  let container = document.getElementById('lesson-word-chips-container');
  let hintSection = document.getElementById('lesson-image2-hint-section');

  // Dynamic fallback: If hintSection is missing (e.g. stale index.html in browser cache), create it!
  if (!hintSection || !container) {
    const inputEl = document.getElementById('lesson-typing-input');
    if (inputEl && inputEl.parentElement) {
      if (!hintSection) {
        hintSection = document.createElement('div');
        hintSection.id = 'lesson-image2-hint-section';
        hintSection.style.cssText = 'margin-top: 14px; display: flex; flex-direction: column; gap: 12px; align-items: center; width: 100%;';
        hintSection.innerHTML = `
          <div id="lesson-word-chips-container" style="display: flex; gap: 14px; flex-wrap: wrap; align-items: center; justify-content: center; width: 100%;"></div>
          <div style="font-size: 0.9rem; font-weight: 700; color: #64748b; text-align: center;">Nhấp vào biểu tượng con mắt để hiện từ</div>
          <button id="lesson-reveal-all-words-btn" type="button"
            style="width: 100%; background: #facc15; color: #000000; font-weight: 900; font-size: 1.05rem; border: 2.5px solid #000000; border-radius: 14px; padding: 14px 20px; cursor: pointer; box-shadow: 0 4px 0 #000000; transition: all 0.15s ease; text-transform: uppercase; letter-spacing: 0.5px;">
            HIỆN TẤT CẢ TỪ
          </button>
        `;
        inputEl.parentElement.after(hintSection);
      }
      container = document.getElementById('lesson-word-chips-container');
    }
  }

  if (!container) return;
  const revealAllBtn = document.getElementById('lesson-reveal-all-words-btn');
  const clearBtn = document.getElementById('lesson-clear-btn');

  if (clearBtn) {
    clearBtn.onclick = () => {
      const inputEl = document.getElementById('lesson-typing-input');
      if (inputEl) {
        inputEl.value = '';
        inputEl.style.borderColor = '#cbd5e1';
      }
      const feedbackCorrect = document.getElementById('lesson-feedback-correct');
      const feedbackWrong = document.getElementById('lesson-feedback-wrong');
      if (feedbackCorrect) feedbackCorrect.style.display = 'none';
      if (feedbackWrong) feedbackWrong.style.display = 'none';

      // Reset all cards
      container.querySelectorAll('.image2-hint-card').forEach(card => {
        card.setAttribute('data-revealed', 'false');
        const dotsEl = card.querySelector('.card-dots');
        const zhEl = card.querySelector('.card-zh');
        if (dotsEl) dotsEl.style.display = 'block';
        if (zhEl) zhEl.style.display = 'none';
      });
    };
  }

  const cleanSentence = sentence.replace(/[.,!?:;="'"()\[\]{}，。！？；：\s\-_~`]/g, '');
  if (!cleanSentence) {
    if (hintSection) hintSection.style.display = 'none';
    return;
  }
  if (hintSection) hintSection.style.display = 'flex';

  // Break sentence into 1 to 2 character word chunks
  const wordTokens = [];
  let idx = 0;
  while (idx < cleanSentence.length) {
    const chunkSize = (cleanSentence.length - idx >= 2) ? 2 : 1;
    wordTokens.push(cleanSentence.substring(idx, idx + chunkSize));
    idx += chunkSize;
  }

  let html = '';
  wordTokens.forEach((token, index) => {
    // Spaced dots matching char count: e.g. ". ." or ". . ."
    const dotsFormatted = Array(token.length).fill('.').join(' ');

    html += `
      <div class="image2-hint-card" id="image2-card-${index}" data-word="${token}" data-revealed="false"
        style="width: 76px; height: 96px; background: #ffffff; border: 2.5px solid #1e293b; border-radius: 16px; padding: 10px 8px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; box-shadow: 0 4px 10px rgba(0,0,0,0.08); cursor: pointer; user-select: none; transition: transform 0.15s ease;"
        onclick="window.toggleImage2CardHint(${index})"
        onmouseover="this.style.transform='translateY(-3px)';"
        onmouseout="this.style.transform='none';">
        
        <!-- Eye Icon Circle at top matching Image 2 -->
        <div style="width: 28px; height: 26px; border-radius: 50%; border: 1.5px solid #1e293b; display: flex; align-items: center; justify-content: center; background: #ffffff; color: #1e293b; font-size: 0.85rem;">
          <i class="fa-regular fa-eye"></i>
        </div>

        <!-- Masked Dots or Revealed Chinese Word in middle/bottom matching Image 2 -->
        <div class="card-dots" style="font-family: monospace, sans-serif; font-size: 1.4rem; font-weight: 900; color: #0f172a; letter-spacing: 2px; text-align: center; line-height: 1;">
          ${dotsFormatted}
        </div>

        <div class="card-zh" style="display: none; font-family: var(--font-chinese); font-size: 1.15rem; font-weight: 900; color: #2563eb; text-align: center; word-break: break-all; line-height: 1.1;">
          ${token}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  if (revealAllBtn) {
    revealAllBtn.onclick = () => {
      // Reveal all cards matching Image 2 & fill full input
      wordTokens.forEach((_, i) => {
        const card = document.getElementById(`image2-card-${i}`);
        if (card) {
          card.setAttribute('data-revealed', 'true');
          const dotsEl = card.querySelector('.card-dots');
          const zhEl = card.querySelector('.card-zh');
          if (dotsEl) dotsEl.style.display = 'none';
          if (zhEl) zhEl.style.display = 'block';
        }
      });

      const inputEl = document.getElementById('lesson-typing-input');
      if (inputEl) {
        inputEl.value = cleanSentence;
        checkLessonTranslationAnswer();
      }
    };
  }
}

window.toggleImage2CardHint = function(index) {
  const card = document.getElementById(`image2-card-${index}`);
  if (!card) return;

  const isRevealed = card.getAttribute('data-revealed') === 'true';
  const word = card.getAttribute('data-word');
  const dotsEl = card.querySelector('.card-dots');
  const zhEl = card.querySelector('.card-zh');
  const inputEl = document.getElementById('lesson-typing-input');

  if (isRevealed) {
    card.setAttribute('data-revealed', 'false');
    if (dotsEl) dotsEl.style.display = 'block';
    if (zhEl) zhEl.style.display = 'none';
  } else {
    card.setAttribute('data-revealed', 'true');
    if (dotsEl) dotsEl.style.display = 'none';
    if (zhEl) zhEl.style.display = 'block';

    // Also append word to typing input
    if (inputEl) {
      inputEl.value += word;
      checkLessonTranslationAnswer();
    }
  }
};

function normalizeTextForMatch(str) {
  if (!str) return '';
  return str.toString()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip diacritics / tones
    .replace(/[.,!?:;="'"()\[\]{}，。！？；：\s\-_~`]/g, '') // strip punctuation
    .toLowerCase();
}

function checkLessonTranslationAnswer() {
  if (!filteredList || filteredList.length === 0) return;
  const current = filteredList[currentIndex];
  if (!current) return;

  const inputEl = document.getElementById('lesson-typing-input');
  if (!inputEl) return;

  const rawInput = inputEl.value.trim();
  const normUser = normalizeTextForMatch(rawInput);
  const normTargetZh = normalizeTextForMatch(current.example_zh || current.word);
  const normWordZh = normalizeTextForMatch(current.word);
  const normPinyin = normalizeTextForMatch(current.pinyin);
  const normMeaning = normalizeTextForMatch(current.meaning);
  const normExampleVi = normalizeTextForMatch(current.example_vi);

  const feedbackCorrect = document.getElementById('lesson-feedback-correct');
  const feedbackWrong = document.getElementById('lesson-feedback-wrong');

  const isMatch = normUser.length > 0 && (
    normUser === normTargetZh ||
    normTargetZh.includes(normUser) ||
    normUser.includes(normTargetZh) ||
    normUser === normWordZh ||
    normUser === normPinyin ||
    (normMeaning.length > 2 && normUser === normMeaning) ||
    (normExampleVi.length > 2 && normUser === normExampleVi)
  );

  if (isMatch) {
    if (feedbackCorrect) feedbackCorrect.style.display = 'inline-flex';
    if (feedbackWrong) feedbackWrong.style.display = 'none';
    inputEl.style.borderColor = '#22c55e';
    if (typeof playAudioSuccess === 'function') playAudioSuccess();
  } else {
    if (feedbackWrong) feedbackWrong.style.display = 'inline-flex';
    if (feedbackCorrect) feedbackCorrect.style.display = 'none';
    inputEl.style.borderColor = '#ef4444';
    if (typeof playAudioError === 'function') playAudioError();
  }
}

function toggleLessonStandardAnswer() {
  const answerBox = document.getElementById('lesson-standard-answer-box');
  if (answerBox) {
    answerBox.style.display = (answerBox.style.display === 'none' || !answerBox.style.display) ? 'block' : 'none';
  }
}

// --- RENDER FUNCTIONS ---
function renderActiveCard() {
  if (!filteredList) return;
  if (filteredList.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
    if (cardViewport) cardViewport.style.display = 'none';
    if (cardHudControls) cardHudControls.style.display = 'none';
    if (cardPageIndicator) cardPageIndicator.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (cardViewport) cardViewport.style.display = 'block';
  if (cardHudControls) cardHudControls.style.display = 'flex';
  if (cardPageIndicator) cardPageIndicator.style.display = 'block';

  // Ensure index is within boundaries
  if (currentIndex >= filteredList.length) currentIndex = 0;
  if (currentIndex < 0) currentIndex = filteredList.length - 1;

  const current = filteredList[currentIndex];
  if (!current) return;

  // Update Indicator & Progress Fill
  if (currentCardNum) currentCardNum.textContent = currentIndex + 1;
  if (totalCardNum) totalCardNum.textContent = filteredList.length;

  if (filteredList.length > 0 && learningProgress && progressPercentage) {
    const progressPercent = Math.round(((currentIndex + 1) / filteredList.length) * 100);
    learningProgress.style.width = `${progressPercent}%`;
    progressPercentage.textContent = `${progressPercent}%`;
  }

  if (studyMode === 'lesson') {
    renderActiveCardLesson(current);
    return;
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
  if (cardWordFront) cardWordFront.textContent = current.word;
  if (cardLevelFront) cardLevelFront.textContent = getLevelLabel(current);
  if (cardCategoryFront) cardCategoryFront.textContent = current.category || 'Chưa phân loại';

  // Render Back Face
  if (cardPinyinBack) cardPinyinBack.textContent = current.pinyin;
  if (cardMeaningBack) cardMeaningBack.textContent = current.meaning;
  if (cardLevelBack) cardLevelBack.textContent = getLevelLabel(current);
  if (cardCategoryBack) cardCategoryBack.textContent = current.category || 'Chưa phân loại';

  const exampleBox = document.querySelector('.example-box');
  if (current.example_zh) {
    const zhLines = current.example_zh.split(/(?<=[！。？\n])\s*/).map(s => s.trim()).filter(Boolean);
    const viLines = (current.example_vi || '').split(/(?<=[.!?\n])\s*/).map(s => s.trim()).filter(Boolean);

    if (cardExampleZhBack) {
      cardExampleZhBack.innerHTML = zhLines.map((line, i) => `<div style="${i > 0 ? 'margin-top: 4px;' : ''}">${line}</div>`).join('');
    }
    if (cardExampleViBack) {
      cardExampleViBack.innerHTML = viLines.map((line, i) => `<div style="${i > 0 ? 'margin-top: 4px;' : ''}">${line}</div>`).join('');
    }
    if (exampleBox) exampleBox.style.display = 'block';
  } else {
    if (exampleBox) exampleBox.style.display = 'none';
  }

  // Update HUD Button States
  const markMemorizedBtn = document.getElementById('mark-memorized-btn');
  const markUnmemorizedBtn = document.getElementById('mark-unmemorized-btn');
  const markStarredBtn = document.getElementById('mark-starred-btn');

  if (markMemorizedBtn) {
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
  }

  if (markStarredBtn) {
    if (current.isStarred) {
      markStarredBtn.classList.add('active');
    } else {
      markStarredBtn.classList.remove('active');
    }
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
    levelList = levelList.filter(w => w.lessonId && studySelectedLessons.some(id => String(id) === String(w.lessonId)));
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

  // Hide deck selector & notebook dashboard, show study workspace
  const deckSel = document.getElementById('deck-selection-view');
  if (deckSel) deckSel.style.display = 'none';

  const nbDash = document.getElementById('notebook-dashboard-view');
  if (nbDash) nbDash.style.display = 'none';

  const fcStudy = document.getElementById('flashcard-study-view');
  if (fcStudy) fcStudy.style.display = 'block';

  // Apply filters to load cards (this already calls renderActiveCard inside)
  applyFilters();

  // Fix UI layout for the current studyMode WITHOUT re-rendering the card again
  // (call lightweight version that just toggles CSS/display, not renderActiveCard)
  _applyStudyModeUI(studyMode);

  // Scroll smooth (deferred so DOM updates first)
  requestAnimationFrame(() => {
    const flashcardSection = document.getElementById('flashcard-section');
    if (flashcardSection) flashcardSection.scrollIntoView({ behavior: 'smooth' });
  });
}

// Lightweight version of setStudyMode that only adjusts UI without re-rendering cards
function _applyStudyModeUI(mode) {
  studyMode = mode;
  const modeLessonBtn = document.getElementById('mode-lesson-btn');
  const modeFlipBtn = document.getElementById('mode-flip-btn');
  const modeTypeBtn = document.getElementById('mode-type-btn');

  const lessonStudyCard = document.getElementById('lesson-study-card');
  const flashcardContainer = document.getElementById('flashcard-card-container');
  const typingContainer = document.getElementById('typing-card-container');
  const cardViewportEl = document.querySelector('.card-viewport');

  if (cardViewportEl) {
    if (mode === 'type') {
      cardViewportEl.classList.add('typing-mode-active');
    } else {
      cardViewportEl.classList.remove('typing-mode-active');
    }
  }

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

  const resetBtnStyles = (btn) => {
    if (!btn) return;
    btn.classList.remove('active-mode');
    btn.style.background = 'transparent';
    btn.style.color = 'var(--text-secondary)';
  };

  const setBtnActive = (btn) => {
    if (!btn) return;
    btn.classList.add('active-mode');
    btn.style.background = 'var(--accent-blue)';
    btn.style.color = 'white';
  };

  resetBtnStyles(modeLessonBtn);
  resetBtnStyles(modeFlipBtn);
  resetBtnStyles(modeTypeBtn);

  if (mode === 'lesson') {
    setBtnActive(modeLessonBtn);
    if (lessonStudyCard) lessonStudyCard.style.display = 'block';
    if (flashcardContainer) flashcardContainer.style.display = 'none';
    if (typingContainer) typingContainer.style.display = 'none';
  } else if (mode === 'flip') {
    setBtnActive(modeFlipBtn);
    if (lessonStudyCard) lessonStudyCard.style.display = 'none';
    if (flashcardContainer) flashcardContainer.style.display = 'block';
    if (typingContainer) typingContainer.style.display = 'none';
  } else if (mode === 'type') {
    setBtnActive(modeTypeBtn);
    if (lessonStudyCard) lessonStudyCard.style.display = 'none';
    if (flashcardContainer) flashcardContainer.style.display = 'none';
    if (typingContainer) typingContainer.style.display = 'flex';
  }
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
  const customWordsListEl = document.getElementById('custom-words-list');
  if (!customWordsListEl) return;

  const customs = vocabList.filter(w => w.isCustom && w.category === activeCustomList);
  customWordsListEl.innerHTML = '';

  if (customs.length === 0) {
    customWordsListEl.innerHTML = `
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

  // Optimized: Pre-compute source list outside the loop (prevents O(N^2) browser freeze)
  let sourceList = vocabList;
  if (studyNotebookId) {
    sourceList = getNotebookWords(studyNotebookId);
  }

  const newList = sourceList.filter(w => {
    // Check HSK Version first for standard HSK words
    if (!w.isCustom && w.level !== 'premium' && (w.hskVersion || '3.0') !== activeHskVersion) {
      return false;
    }

    // If studying a specific notebook
    if (studyNotebookId) {
      // Filter by studySelectedLessons if studying an HSK or YCT notebook
      if ((studyNotebookId.startsWith('hsk:') || studyNotebookId.startsWith('yct:')) && studySelectedLessons && studySelectedLessons.length > 0) {
        if (!w.lessonId || !studySelectedLessons.some(id => String(id) === String(w.lessonId))) return false;
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
        if (!w.lessonId || !studySelectedLessons.some(id => String(id) === String(w.lessonId))) return false;
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
  if (cardElement) cardElement.classList.remove('flipped');
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
      if (!w.lessonId || !studySelectedLessons.some(id => String(id) === String(w.lessonId))) return false;
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
  let toastEl = document.getElementById('toast') || document.getElementById('toast-msg');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.style.borderLeftColor = isError ? 'var(--danger, #ef4444)' : 'var(--accent-blue, #3b82f6)';
  toastEl.classList.add('show');

  setTimeout(() => {
    toastEl.classList.remove('show');
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
      if (tabId === 'roadmap') {
        if (window.returnToHskLevelSelection) {
          window.returnToHskLevelSelection();
        } else {
          switchTab('roadmap');
        }
      } else if (tabId) {
        switchTab(tabId);
      }
    });
  });

  const sidebarRoadmap = document.getElementById('sidebar-nav-roadmap');
  if (sidebarRoadmap) {
    sidebarRoadmap.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.returnToHskLevelSelection) {
        window.returnToHskLevelSelection();
      } else {
        showRoadmapView();
      }
    });
  }

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

      // Restore normal flashcards elements display
      const quickCards = document.querySelector('.quick-dashboard-cards');
      if (quickCards) quickCards.style.display = 'grid';

      const statsSummary = document.querySelector('.stats-summary-container');
      if (statsSummary) statsSummary.style.display = 'block';

      const controlsDash = document.querySelector('.controls-dashboard');
      if (controlsDash) controlsDash.style.display = 'flex';

      if (isLessonVocabStudyMode) {
        isLessonVocabStudyMode = false;
        studySelectedLessons = null;
        studyNotebookId = null;
        if (typeof returnToHskLevelSelection === 'function') {
          switchTab('lessons');
        } else {
          switchTab('lessons');
        }
        return;
      }

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

        // Sort by newest played first
        historyArr.sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));

        // Deduplicate records by checking if they are within 60 seconds of each other with same stats
        const uniqueHistory = [];
        historyArr.forEach(item => {
          if (!item || !item.playedAt) return;
          const itemTime = new Date(item.playedAt).getTime();
          
          const isDuplicate = uniqueHistory.some(existing => {
            const existingTime = new Date(existing.playedAt).getTime();
            const timeDiff = Math.abs(itemTime - existingTime);
            return timeDiff < 60000 && 
                   existing.score == item.score && 
                   existing.stage == item.stage && 
                   existing.level == item.level;
          });

          if (!isDuplicate) {
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

          const modeName = modeNames[item.mode] || item.mode || 'Thử thách Nghe Pinyin';
          const levelLabel = item.level === 'all' ? 'Tất cả' : (item.level ? `HSK ${item.level}` : 'Phiên Âm');
          const stageText = item.stage ? `${item.stage} câu` : (item.total ? `${item.total} câu` : '100 câu');
          const comboText = typeof item.combo !== 'undefined' ? item.combo : '-';

          tr.innerHTML = `
          <td style="padding: 12px 16px; color: var(--text-secondary);">${date}</td>
          <td style="padding: 12px 16px; font-weight: 500;">${modeName}</td>
          <td style="padding: 12px 16px; text-align: center; color: var(--accent-teal); font-weight: 600;">${levelLabel}</td>
          <td style="padding: 12px 16px; text-align: center; color: #ffd700; font-weight: 700; font-size: 1.05rem;">${item.score}</td>
          <td style="padding: 12px 16px; text-align: center;">${stageText}</td>
          <td style="padding: 12px 16px; text-align: center; color: var(--success); font-weight: 600;">${comboText}</td>
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

    // Check if Lesson Flashcard Mode is active
    if (isLessonVocabStudyMode) {
      if (key === 'arrowleft') {
        e.preventDefault();
        window.navigateLessonFlashcard(-1);
      } else if (key === 'arrowright') {
        e.preventDefault();
        window.navigateLessonFlashcard(1);
      } else if (key === ' ' || key === 'spacebar' || e.code === 'Space') {
        e.preventDefault();
        const cur = currentLessonVocabWords[currentLessonVocabIndex];
        if (cur) window.speakLessonWord(cur.word || cur.simplified || cur.character);
      } else if (key === 'f') {
        e.preventDefault();
        window.toggleFlashcardFullscreen();
      } else if (key === 's') {
        e.preventDefault();
        if (typeof window.toggleLessonWordStar === 'function') {
          window.toggleLessonWordStar();
        }
      } else if (key === 'escape') {
        if (isFlashcardFullscreen) {
          e.preventDefault();
          window.exitFlashcardFullscreen(true);
        }
      }
      return;
    }

    // Check if standard flashcard study view is active
    const fcStudy = document.getElementById('flashcard-study-view');
    if (fcStudy && fcStudy.style.display === 'block') {
      if (key === 'f') {
        e.preventDefault();
        window.toggleFlashcardFullscreen();
      } else if (key === 'escape' && isFlashcardFullscreen) {
        e.preventDefault();
        window.exitFlashcardFullscreen(true);
      }
    }

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
  const modeLessonBtn = document.getElementById('mode-lesson-btn');
  const modeFlipBtn = document.getElementById('mode-flip-btn');
  const modeTypeBtn = document.getElementById('mode-type-btn');

  if (modeLessonBtn) modeLessonBtn.addEventListener('click', () => setStudyMode('lesson'));
  if (modeFlipBtn) modeFlipBtn.addEventListener('click', () => setStudyMode('flip'));
  if (modeTypeBtn) modeTypeBtn.addEventListener('click', () => setStudyMode('type'));

  // Lesson Interactive Study Card Event Listeners
  const lessonAnimateBtn = document.getElementById('lesson-animate-stroke-btn');
  if (lessonAnimateBtn) {
    lessonAnimateBtn.addEventListener('click', () => {
      if (activeLessonHanziWriter) {
        activeLessonHanziWriter.animateCharacter();
      }
    });
  }

  const lessonSpeakBtn = document.getElementById('lesson-speak-btn');
  if (lessonSpeakBtn) {
    lessonSpeakBtn.addEventListener('click', () => {
      if (!filteredList || filteredList.length === 0) return;
      const current = filteredList[currentIndex];
      if (current) speakText(current.word, 'zh-CN');
    });
  }

  const lessonSpeakExampleBtn = document.getElementById('lesson-speak-example-btn');
  if (lessonSpeakExampleBtn) {
    lessonSpeakExampleBtn.addEventListener('click', () => {
      if (!filteredList || filteredList.length === 0) return;
      const current = filteredList[currentIndex];
      if (current && (current.example_zh || current.word)) {
        speakText(current.example_zh || current.word, 'zh-CN');
      }
    });
  }

  const lessonCheckBtn = document.getElementById('lesson-check-btn');
  if (lessonCheckBtn) {
    lessonCheckBtn.addEventListener('click', checkLessonTranslationAnswer);
  }

  const lessonTypingInput = document.getElementById('lesson-typing-input');
  if (lessonTypingInput) {
    lessonTypingInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        checkLessonTranslationAnswer();
      }
    });
  }

  const lessonRevealBtn = document.getElementById('lesson-reveal-hint-btn');
  if (lessonRevealBtn) {
    lessonRevealBtn.addEventListener('click', toggleLessonStandardAnswer);
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

window.toggleRoadmapEyeCard = function(index, targetSentence) {
  const card = document.getElementById(`roadmap-eye-card-${index}`);
  if (!card) return;

  const isRevealed = card.getAttribute('data-revealed') === 'true';
  const word = card.getAttribute('data-word');
  const dotsEl = card.querySelector('.card-dots');
  const zhEl = card.querySelector('.card-zh');
  const inputEl = document.getElementById('roadmap-sentence-input');

  if (isRevealed) {
    card.setAttribute('data-revealed', 'false');
    if (dotsEl) dotsEl.style.display = 'block';
    if (zhEl) zhEl.style.display = 'none';
  } else {
    card.setAttribute('data-revealed', 'true');
    if (dotsEl) dotsEl.style.display = 'none';
    if (zhEl) zhEl.style.display = 'block';

    if (inputEl) {
      inputEl.value += word;
      if (typeof handleRoadmapTranslationInput === 'function') {
        handleRoadmapTranslationInput(targetSentence);
      }
    }
  }
};

window.revealAllRoadmapEyeCards = function(targetSentence) {
  const cards = document.querySelectorAll('.image2-hint-card[id^="roadmap-eye-card-"]');
  cards.forEach(card => {
    card.setAttribute('data-revealed', 'true');
    const dotsEl = card.querySelector('.card-dots');
    const zhEl = card.querySelector('.card-zh');
    if (dotsEl) dotsEl.style.display = 'none';
    if (zhEl) zhEl.style.display = 'block';
  });

  const inputEl = document.getElementById('roadmap-sentence-input');
  if (inputEl) {
    inputEl.value = targetSentence;
    if (typeof handleRoadmapTranslationInput === 'function') {
      handleRoadmapTranslationInput(targetSentence);
    }
  }
};

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
      showNotebookDashboardView('wrong');
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

      window.location.href = `detail-list.html?${params.toString()}`;
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
      if (!activeNotebook || activeNotebook === 'starred' || activeNotebook === 'wrong' || activeNotebook.startsWith('custom:')) {
        showTopicsView();
      } else {
        showSubdecksView();
      }
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
    let nbSearchDebounceTimer = null;
    nbSearchInput.addEventListener('input', () => {
      clearTimeout(nbSearchDebounceTimer);
      nbSearchDebounceTimer = setTimeout(() => {
        currentNotebookPage = 1;
        renderNotebookWordsTable();
      }, 150);
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

      const iframe = document.getElementById('game-play-iframe');
      if (iframe) iframe.src = '';

      if (activeNotebook) {
        showNotebookDashboardView(activeNotebook, true);
      } else if (activeSmartTopic) {
        showSubdecksView();
      } else {
        showTopicsView();
      }
    });
  }

  // Handle messages sent from game iframe
  window.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'CLOSE_GAME_IFRAME') {
      const gamePlayView = document.getElementById('game-play-view');
      if (gamePlayView) gamePlayView.style.display = 'none';

      const iframe = document.getElementById('game-play-iframe');
      if (iframe) iframe.src = '';

      if (activeNotebook) {
        showNotebookDashboardView(activeNotebook, true);
      } else if (activeSmartTopic) {
        showSubdecksView();
      } else {
        showTopicsView();
      }
      return;
    }
    if (event.data && event.data.type === 'VOCAB_STATE_UPDATED') {
      console.log('Real-time sync: Vocab state updated in game, refreshing data...');
      await fetchVocabulary();
      if (activeNotebook) {
        showNotebookDashboardView(activeNotebook, true);
      }
    }
  });
}

function getAuthHeaders(customHeaders = {}) {
  const token = localStorage.getItem('session_token');
  const headers = { 'Content-Type': 'application/json', ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-session-token'] = token;
  }
  if (currentUser && currentUser.email) {
    headers['x-user-email'] = currentUser.email;
  }
  return headers;
}

// --- AUTHENTICATION & LOGIN LOGIC ---

// Fetch current user from session / local storage (giữ đăng nhập vĩnh viễn, không tự động đăng xuất)
async function initAuth() {
  // 1. Kiểm tra tài khoản đã lưu trên trình duyệt (giữ đăng nhập liên tục)
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      const userKey = currentUser._id || currentUser.id || currentUser.email || 'user';
      const cachedStats = JSON.parse(localStorage.getItem(`user_stats_${userKey}`) || 'null');
      if (cachedStats) {
        userStreak = cachedStats.streak || 0;
        userStudyTime = cachedStats.studyTime || 0;
      }
    } catch (e) {
      console.warn("Parse saved user error:", e);
    }
  }

  // Double check and calculate from dailyStudyHistory if userStudyTime is 0
  const history = getDailyStudyHistory();
  let totalHistorySecs = 0;
  Object.values(history).forEach(s => { totalHistorySecs += (s || 0); });
  if (totalHistorySecs > userStudyTime) {
    userStudyTime = totalHistorySecs;
  }
  const calcStreak = calculateStreakFromHistory(history);
  if (calcStreak > userStreak) {
    userStreak = calcStreak;
  }

  renderUserProfile();
  updateStatsUI();
  renderWeeklyStudyChart();

  // 2. Đồng bộ phiên đăng nhập với Server nếu có kết nối
  try {
    const res = await fetch(API_BASE_URL + '/api/auth/me', {
      headers: getAuthHeaders(),
      credentials: 'include',
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        currentUser = data.user;
        localStorage.setItem('user', JSON.stringify(currentUser));
        renderUserProfile();
        return;
      }
    }
  } catch (err) {
    console.warn('Backend session retrieval failed, keeping local persistent user:', err);
  }

  // 3. Nếu chưa đăng nhập thì khởi tạo Google Sign-In
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
    const modalBtnWrapper = document.getElementById('modal-google-signin-button');

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    });

    if (signinBtnWrapper) {
      signinBtnWrapper.innerHTML = '';
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
    }

    if (modalBtnWrapper) {
      modalBtnWrapper.innerHTML = '';
      google.accounts.id.renderButton(
        modalBtnWrapper,
        {
          theme: 'filled_blue',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'signin_with',
          logo_alignment: 'left',
          width: 300
        }
      );
    }
  } catch (err) {
    console.error('Google Sign-In initialization failed:', err);
  }
}

window.openAuthRequiredModal = function() {
  const modal = document.getElementById('auth-required-modal');
  if (modal) {
    modal.style.display = 'flex';
    initGoogleSignIn();
  }
};

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
      const authModal = document.getElementById('auth-required-modal');
      if (authModal) authModal.style.display = 'none';

      // Migrate guest chat history to user account
      if (typeof window.migrateGuestChatHistory === 'function') {
        window.migrateGuestChatHistory();
      }

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

    // Dynamically update profile role badge
    const displayRole = document.getElementById('user-display-role') || document.querySelector('.app-sidebar .user-role-badge');
    if (displayRole) {
      const email = (currentUser.email || '').toLowerCase().trim();
      const isSuper = email.includes('toiyeutinhoc238') || email.includes('phanphiphu') || email.includes('thaihong162004') || currentUser.isSuperAdmin || currentUser.role === 'super_admin';
      const isTeacher = currentUser.role === 'teacher' || email.includes('hongtai');
      const isAdmin = isSuper || isTeacher || currentUser.isAdmin || currentUser.role === 'admin' || isUserAdmin(email);

      if (isSuper) {
        displayRole.innerHTML = '<i class="fa-solid fa-crown"></i> Super Admin';
        displayRole.style.color = '#f43f5e';
        displayRole.style.fontWeight = '800';
      } else if (isTeacher) {
        displayRole.innerHTML = '<i class="fa-solid fa-chalkboard-user"></i> Giáo viên';
        displayRole.style.color = '#38bdf8';
        displayRole.style.fontWeight = '800';
      } else if (isAdmin) {
        displayRole.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Quản trị viên';
        displayRole.style.color = '#a855f7';
        displayRole.style.fontWeight = '800';
      } else {
        displayRole.innerHTML = '<i class="fa-solid fa-graduation-cap"></i> Học viên';
        displayRole.style.color = 'var(--accent-blue)';
        displayRole.style.fontWeight = '700';
      }
    }

    if (navChatHistoryLi) navChatHistoryLi.style.display = 'block';

    // Auto-reveal admin panel in sidebar if current user is admin/teacher
    const adminSection = document.getElementById('sidebar-admin-section');
    const isAdminUser = currentUser && (currentUser.isAdmin || currentUser.isSuperAdmin || isUserAdmin(currentUser.email));
    if (adminSection) {
      adminSection.style.display = isAdminUser ? 'block' : 'none';
    }

    if (typeof window.updateChatbotOnLogin === 'function') {
      window.updateChatbotOnLogin();
    }
  } else {
    authContainer.classList.remove('logged-in');
    authContainer.classList.add('logged-out');

    if (navChatHistoryLi) navChatHistoryLi.style.display = 'none';

    const adminSection = document.getElementById('sidebar-admin-section');
    if (adminSection) adminSection.style.display = 'none';
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

function switchTab(tabId, skipShowTopics = false) {
  if (tabId !== 'flashcards' && typeof isFlashcardFullscreen !== 'undefined' && isFlashcardFullscreen) {
    window.exitFlashcardFullscreen(true);
  }
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
  const roadmapLearningSec = document.getElementById('roadmap-learning-section');

  // Helper function to set display
  const setDisp = (el, val) => { if (el) el.style.display = val; };

  // Always hide all first to simplify
  setDisp(homeViewSec, 'none');
  setDisp(flashcardSec, 'none');
  setDisp(customSec, 'none');
  setDisp(examsSec, 'none');
  setDisp(lessonsSec, 'none');
  setDisp(roadmapLearningSec, 'none');
  const roadmapSec = document.getElementById('roadmap-view-section');
  if (roadmapSec) roadmapSec.style.display = 'none';

  if (tabId === 'home') {
    setDisp(homeViewSec, 'block');
  }
  else if (tabId === 'roadmap') {
    setDisp(roadmapSec, 'block');
    setDisp(lessonsSec, 'none');
    renderGamifiedRoadmapPath();
  }
  else if (tabId === 'lessons') {
    setDisp(lessonsSec, 'block');
    if (roadmapSec) roadmapSec.style.display = 'none';
    renderLessonsList();
  }
  else if (tabId === 'exams') {
    setDisp(examsSec, 'block');
    const libraryPanel = document.getElementById('exam-panel-library');
    if (libraryPanel) libraryPanel.style.display = 'block';
    renderExamLibrary('all');
  }
  else if (tabId === 'flashcards') {
    setDisp(flashcardSec, 'block');
    if (!skipShowTopics) {
      showTopicsView();
    }
  }
  else if (tabId === 'dictionary') {
    setDisp(customSec, 'block');
  }
  else if (tabId === 'roadmap-learning') {
    setDisp(roadmapLearningSec, 'block');
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
      item.classList.toggle('active', itemTab === tabId || ((tabId === 'lessons' || tabId === 'roadmap') && itemTab === 'roadmap'));
    }
  });

  // Always scroll to top smoothly when switching tab (e.g. clicking Trang chủ)
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.switchTab = switchTab;

function showHomeView() {
  switchTab('home');
}

function showRoadmapView() {
  switchTab('roadmap');
}
window.showRoadmapView = showRoadmapView;

window.returnToHskLevelSelection = function() {
  const roadmapSec = document.getElementById('roadmap-view-section');
  const lessonsSec = document.getElementById('lessons-section');
  if (lessonsSec) lessonsSec.style.display = 'none';
  if (roadmapSec) roadmapSec.style.display = 'block';
  switchTab('roadmap');
};

let activeRoadmapVersion = '3.0';


function getUnlockedLevelsMap() {
  try {
    return JSON.parse(localStorage.getItem('unlocked_levels_map') || '{}');
  } catch (err) {
    return {};
  }
}

function isLevelUnlocked(ver, level, levelIndex, levelsData, builtInVocabs) {
  // YCT: Temporarily locked
  if (ver === 'yct' || ver === 'YCT') {
    return false;
  }
  // HSK 2.0: Only Level 1 is verified and unlocked. Levels 2..6 are temporarily locked.
  if (ver === '2.0') {
    return String(level) === '1';
  }
  // HSK 3.0: Only Levels 1, 2, 3 are public and unlocked. Levels 4, 5, 6, 7-9 are temporarily locked.
  if (ver === '3.0' || !ver || ver === 'hsk') {
    const lvlStr = String(level).trim();
    return ['1', '2', '3'].includes(lvlStr);
  }
  return false;
}

function isRoadmapLessonUnlocked(hskVersion, level, lessonKey, sortedLessonKeys) {
  if (!sortedLessonKeys || sortedLessonKeys.length === 0) return true;
  const lKeyStr = String(lessonKey);
  const idx = sortedLessonKeys.findIndex(k => String(k) === lKeyStr);
  
  // Lesson 1 is always unlocked
  if (idx <= 0) return true;

  // Check previous lessons in sequence
  for (let i = 0; i < idx; i++) {
    const prevKey = sortedLessonKeys[i];
    
    // Check if user earned quiz stars
    const starKey = `quiz_stars_${hskVersion}_${level}_${prevKey}`;
    const quizStars = parseInt(localStorage.getItem(starKey) || '0', 10);

    // Check vocabulary words memorized/studied in prevKey
    const prevWords = vocabList.filter(w => {
      if (w.isCustom) return false;
      if (w.curriculum === 'yct' || w.hskVersion === 'yct') {
        return (hskVersion === 'yct') && String(w.level) === String(level) && String(w.lessonId || 1) === String(prevKey);
      }
      const lvlMatch = String(w.level || '').replace('hsk', '').trim() === String(level).replace('hsk', '').trim();
      return (w.hskVersion || '3.0') === hskVersion && lvlMatch && String(w.lessonId || 1) === String(prevKey);
    });

    if (prevWords.length === 0) continue;

    const memorizedCount = prevWords.filter(w => w.isMemorized).length;
    const studiedCount = prevWords.filter(w => w.isStudied || w.isMemorized || w.isWrong || w.isStarred).length;

    const isPrevPassed = (quizStars >= 1) || 
                         (memorizedCount >= Math.ceil(prevWords.length * 0.4)) || 
                         (studiedCount >= Math.ceil(prevWords.length * 0.7));

    if (!isPrevPassed) {
      return false; // Chain broken: this lesson is locked
    }
  }

  return true;
}

window.isRoadmapLessonUnlocked = isRoadmapLessonUnlocked;

window.unlockRoadmapLevel = function(ver, level) {
  try {
    const map = getUnlockedLevelsMap();
    if (!map[ver]) map[ver] = [];
    if (!map[ver].includes(level)) map[ver].push(level);
    localStorage.setItem('unlocked_levels_map', JSON.stringify(map));
    showToast(`🔓 Đã mở khóa ${ver.toUpperCase()} Cấp ${level} thành công!`);
    renderGamifiedRoadmapPath();
  } catch (err) {
    console.error('Failed to unlock level:', err);
  }
};

window.lockRoadmapLevel = function(ver, level) {
  try {
    const map = getUnlockedLevelsMap();
    if (map[ver]) {
      map[ver] = map[ver].filter(l => String(l) !== String(level));
      localStorage.setItem('unlocked_levels_map', JSON.stringify(map));
    }
    showToast(`🔒 Đã khóa lại ${ver.toUpperCase()} Cấp ${level}!`);
    renderGamifiedRoadmapPath();
  } catch (err) {
    console.error('Failed to lock level:', err);
  }
};

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
      { level: 1, name: 'HSK 1 (2.0)', desc: 'Nhập môn sơ cấp - 150 từ vựng cơ bản nhất', count: '150 từ', color: '#58cc02', shadow: '#46a302' },
      { level: 2, name: 'HSK 2 (2.0)', desc: 'Giao tiếp cơ bản - 300 từ vựng sinh hoạt', count: '300 từ', color: '#1cb0f6', shadow: '#1899d6' },
      { level: 3, name: 'HSK 3 (2.0)', desc: 'Trung cấp 1 - 600 từ vựng giao tiếp tự tin', count: '600 từ', color: '#ffc800', shadow: '#e5b200', textCol: '#4b3200' },
      { level: 4, name: 'HSK 4 (2.0)', desc: 'Trung cấp 2 - 1,200 từ vựng học tập & làm việc', count: '1,200 từ', color: '#ce82ff', shadow: '#b45be6' },
      { level: 5, name: 'HSK 5 (2.0)', desc: 'Cao cấp 1 - 2,500 từ vựng báo chí & công sở', count: '2,500 từ', color: '#58cc02', shadow: '#46a302' },
      { level: 6, name: 'HSK 6 (2.0)', desc: 'Thành thạo - 5,000 từ vựng chuyên sâu & dịch thuật', count: '5,000 từ', color: '#1cb0f6', shadow: '#1899d6' }
    ];
  } else {
    // HSK 3.0
    levelsData = [
      { level: 1, name: 'HSK 1 (3.0)', desc: 'Sơ cấp 1 - 500 âm tiết & từ vựng cơ bản', color: '#58cc02', shadow: '#46a302' },
      { level: 2, name: 'HSK 2 (3.0)', desc: 'Sơ cấp 2 - Từ vựng giao tiếp đời sống', color: '#1cb0f6', shadow: '#1899d6' },
      { level: 3, name: 'HSK 3 (3.0)', desc: 'Sơ cấp 3 - Từ vựng hoàn thiện nền tảng', color: '#ffc800', shadow: '#e5b200', textCol: '#4b3200' },
      { level: 4, name: 'HSK 4 (3.0)', desc: 'Trung cấp 4 - Từ vựng học thuật & đời sống', color: '#ce82ff', shadow: '#b45be6' },
      { level: 5, name: 'HSK 5 (3.0)', desc: 'Trung cấp 5 - Từ vựng làm việc & công sở', color: '#58cc02', shadow: '#46a302' },
      { level: 6, name: 'HSK 6 (3.0)', desc: 'Trung cấp 6 - Từ vựng cao cấp & học thuật', color: '#1cb0f6', shadow: '#1899d6' },
      { level: '7-9', name: 'New HSK 7-9 (3.0)', desc: 'Cao cấp HSK 7-9 - 10 Chủ đề chuyên sâu cho bậc Đại học & Chuyên gia', color: '#ffc800', shadow: '#e5b200', textCol: '#4b3200' }
    ];
  }

  let html = '';
  const positions = ['pos-center', 'pos-left', 'pos-center', 'pos-right'];
  const builtInVocabs = vocabList.filter(w => !w.isCustom);

  levelsData.forEach((item, idx) => {
    // Căn cứ thực tế từ dữ liệu vocabList
    const levelWords = builtInVocabs.filter(w => {
      const curr = (w.curriculum || 'hsk').toLowerCase();
      const ver = (w.hskVersion || '3.0').toLowerCase();

      if (hskVer === 'yct') {
        return (curr.includes('yct') || ver.includes('yct')) && matchLevel(w.level, item.level);
      }
      if (hskVer === '2.0') {
        return !curr.includes('yct') && !ver.includes('yct') && (ver.includes('2') || ver === '2.0') && matchLevel(w.level, item.level);
      }
      // HSK 3.0
      return !curr.includes('yct') && !ver.includes('yct') && (ver.includes('3') || ver === '3.0' || w.hskVersion === '3.0') && matchLevel(w.level, item.level);
    });

    const totalWords = levelWords.length;
    const memorizedWords = levelWords.filter(w => w.isMemorized).length;
    const pct = totalWords > 0 ? Math.round((memorizedWords / totalWords) * 100) : 0;

    const isUnlocked = isLevelUnlocked(hskVer, item.level, idx, levelsData, builtInVocabs);
    const isCompleted = pct === 100 && totalWords > 0;
    const isStarted = pct > 0 || idx === 0;
    const prevItemName = idx > 0 ? levelsData[idx - 1].name : '';

    let statusBadge = '';
    if (isCompleted) {
      statusBadge = `<span class="roadmap-badge done"><i class="fa-solid fa-circle-check"></i> Hoàn thành 100%</span>`;
    } else if (pct > 0) {
      statusBadge = `<span class="roadmap-badge active-pulse"><i class="fa-solid fa-bolt"></i> Đang học ${pct}%</span>`;
    } else if (isUnlocked) {
      statusBadge = `<span class="roadmap-badge active-pulse"><i class="fa-solid fa-play"></i> Bắt đầu học</span>`;
    } else {
      statusBadge = `<span class="roadmap-badge locked" style="background: rgba(245, 158, 11, 0.18); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);"><i class="fa-solid fa-lock"></i> 🔒 Sắp ra mắt</span>`;
    }

    const nodeState = isCompleted ? 'node-done' : (isUnlocked ? 'node-active' : 'node-locked');

    const crownHtml = isCompleted ? `<div style="position: absolute; top: -14px; font-size: 1.2rem; color: #fbbf24; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); z-index: 10;"><i class="fa-solid fa-crown"></i></div>` : '';
    const starsHtml = `<div style="display: flex; gap: 3px; position: absolute; bottom: -16px; z-index: 10;">
      <i class="fa-solid fa-star" style="font-size: 0.75rem; color: ${pct >= 33 ? '#fbbf24' : '#64748b'}; text-shadow: 0 1px 2px rgba(0,0,0,0.5);"></i>
      <i class="fa-solid fa-star" style="font-size: 0.85rem; color: ${pct >= 66 ? '#fbbf24' : '#64748b'}; text-shadow: 0 1px 2px rgba(0,0,0,0.5); transform: translateY(-2px);"></i>
      <i class="fa-solid fa-star" style="font-size: 0.75rem; color: ${pct === 100 ? '#fbbf24' : '#64748b'}; text-shadow: 0 1px 2px rgba(0,0,0,0.5);"></i>
    </div>`;

    let actionButtonsHtml = '';
    if (isUnlocked) {
      actionButtonsHtml = `
        <button class="btn-node-start" style="background: ${item.color}; box-shadow: 0 4px 0 ${item.shadow || '#000000'}; border-bottom: none; color: ${item.textCol || '#ffffff'}; transition: all 0.2s; border-radius: 12px; font-weight: 700; padding: 12px 20px; font-size: 0.9rem;" onclick="goToRoadmapLevel('${hskVer}', '${item.level}')" onmousedown="this.style.transform='translateY(3px)'; this.style.boxShadow='0 1px 0 ${item.shadow || '#000000'}';" onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 0 ${item.shadow || '#000000'}';" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 0 ${item.shadow || '#000000'}';">
          Khám Phá Cấp ${item.level} <i class="fa-solid fa-arrow-right"></i>
        </button>
        <button class="btn-node-start" style="background: rgba(255,255,255,0.1); width: auto;" onclick="window.location.href='/quiz-game.html?level=${item.level}&version=${hskVer}'" title="Thi trắc nghiệm">
          <i class="fa-solid fa-gamepad"></i>
        </button>
      `;
    } else {
      actionButtonsHtml = `
        <button class="btn-node-start btn-node-locked" style="background: rgba(100, 116, 139, 0.35); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.15); cursor: pointer; border-radius: 12px; font-weight: 700; padding: 12px 20px; font-size: 0.88rem; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="window.showComingSoonNotice('Lộ trình ' + (${hskVer === 'yct' ? "'YCT Cấp ' + '" + item.level + "'" : "'HSK ' + '" + item.level + "'" + (hskVer === '2.0' ? "' (2.0)'" : "''")}))">
          <i class="fa-solid fa-lock" style="color: #fbbf24;"></i> Sắp ra mắt (Đang biên soạn)
        </button>
      `;
    }

    html += `
      <div class="roadmap-node-item ${nodeState}">
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          ${crownHtml}
          <div class="node-icon-circle ${!isUnlocked ? 'node-circle-locked' : ''}" onclick="goToRoadmapLevel('${hskVer}', '${item.level}')" style="${!isUnlocked ? 'background: #334155; border-color: #64748b; color: #94a3b8; cursor: pointer;' : ''}">
            <span class="node-num">${!isUnlocked ? '<i class="fa-solid fa-lock" style="color: #cbd5e1;"></i>' : item.level}</span>
          </div>
          ${starsHtml}
        </div>

        <div class="node-info-card ${!isUnlocked ? 'card-locked-style' : ''}" style="${!isUnlocked ? 'opacity: 0.88; filter: grayscale(0.15);' : ''}">
          <div class="node-card-top">
            <span class="node-card-title">${item.name}</span>
            ${statusBadge}
          </div>
          <div class="node-card-sub">${item.desc} (${memorizedWords}/${totalWords} từ)</div>
          <div class="node-card-actions" style="display: flex; gap: 8px;">
            ${actionButtonsHtml}
          </div>
        </div>
      </div>
    `;

    if (idx < levelsData.length - 1) {
      let icon = "fa-arrow-down";
      if (idx % 4 === 0) icon = "fa-arrow-turn-down";
      else if (idx % 4 === 1) icon = "fa-arrow-down";
      else if (idx % 4 === 2) icon = "fa-arrow-turn-down fa-flip-horizontal";
      else if (idx % 4 === 3) icon = "fa-arrow-down";

      html += `
        <div class="roadmap-connector-arrow">
          <i class="fa-solid ${icon}"></i>
        </div>
      `;
    }
  });

  container.innerHTML = html;

  // --- Update header banner progress bar & level badge with real data ---
  const builtInVocabsAll = vocabList.filter(w => !w.isCustom);
  // Filter to active curriculum
  const activeVocabsForRoadmap = builtInVocabsAll.filter(w => {
    const curr = (w.curriculum || 'hsk').toLowerCase();
    const ver = (w.hskVersion || '3.0').toLowerCase();
    if (hskVer === 'yct') return curr.includes('yct') || ver.includes('yct');
    if (hskVer === '2.0') return !curr.includes('yct') && !ver.includes('yct') && (ver.includes('2') || ver === '2.0');
    return !curr.includes('yct') && !ver.includes('yct') && (ver.includes('3') || ver === '3.0' || w.hskVersion === '3.0');
  });
  const totalRoadmapWords = activeVocabsForRoadmap.length;
  const memorizedRoadmapWords = activeVocabsForRoadmap.filter(w => w.isMemorized).length;
  const overallPct = totalRoadmapWords > 0 ? Math.round((memorizedRoadmapWords / totalRoadmapWords) * 100) : 0;

  const pctTextEl = document.getElementById('roadmap-pct-text');
  const progressBarFillEl = document.getElementById('roadmap-progress-bar-fill');
  const levelBadgeEl = document.getElementById('roadmap-current-level-badge');

  if (pctTextEl) pctTextEl.textContent = `${overallPct}%`;
  if (progressBarFillEl) progressBarFillEl.style.width = `${overallPct}%`;

  // Determine current level: highest level with any memorized words
  if (levelBadgeEl) {
    let currentLevelDisplay = levelsData[0] ? levelsData[0].name : 'HSK 1';
    for (let i = levelsData.length - 1; i >= 0; i--) {
      const ld = levelsData[i];
      const lvWords = builtInVocabsAll.filter(w => {
        const curr2 = (w.curriculum || 'hsk').toLowerCase();
        const ver2 = (w.hskVersion || '3.0').toLowerCase();
        if (hskVer === 'yct') return (curr2.includes('yct') || ver2.includes('yct')) && matchLevel(w.level, ld.level);
        if (hskVer === '2.0') return !curr2.includes('yct') && !ver2.includes('yct') && (ver2.includes('2') || ver2 === '2.0') && matchLevel(w.level, ld.level);
        return !curr2.includes('yct') && !ver2.includes('yct') && (ver2.includes('3') || ver2 === '3.0' || w.hskVersion === '3.0') && matchLevel(w.level, ld.level);
      });
      if (lvWords.some(w => w.isMemorized)) {
        currentLevelDisplay = ld.name;
        break;
      }
    }
    levelBadgeEl.textContent = `Bạn đang ở ${currentLevelDisplay}`;
  }
}

window.renderGamifiedRoadmapPath = renderGamifiedRoadmapPath;
window.goToRoadmapLevel = function (ver, level) {
  const hskVer = ver || activeRoadmapVersion || '3.0';
  let levelsData = [];
  if (hskVer === 'yct') {
    levelsData = [
      { level: 1, name: 'YCT Cấp 1' },
      { level: 2, name: 'YCT Cấp 2' },
      { level: 3, name: 'YCT Cấp 3' },
      { level: 4, name: 'YCT Cấp 4' }
    ];
  } else if (hskVer === '2.0') {
    levelsData = [
      { level: 1, name: 'HSK 1 (2.0)' },
      { level: 2, name: 'HSK 2 (2.0)' },
      { level: 3, name: 'HSK 3 (2.0)' },
      { level: 4, name: 'HSK 4 (2.0)' },
      { level: 5, name: 'HSK 5 (2.0)' },
      { level: 6, name: 'HSK 6 (2.0)' }
    ];
  } else {
    levelsData = [
      { level: 1, name: 'HSK 1 (3.0)' },
      { level: 2, name: 'HSK 2 (3.0)' },
      { level: 3, name: 'HSK 3 (3.0)' },
      { level: 4, name: 'HSK 4 (3.0)' },
      { level: 5, name: 'HSK 5 (3.0)' },
      { level: 6, name: 'HSK 6 (3.0)' },
      { level: '7-9', name: 'New HSK 7-9 (3.0)' }
    ];
  }

  const nodeIndex = levelsData.findIndex(item => String(item.level) === String(level));
  const builtInVocabs = vocabList.filter(w => !w.isCustom);
  if (!currentUser) {
    window.openAuthRequiredModal();
    return;
  }

  const unlocked = isLevelUnlocked(hskVer, level, nodeIndex >= 0 ? nodeIndex : 0, levelsData, builtInVocabs);

  if (!unlocked) {
    window.showComingSoonNotice(`Lộ trình bài học ${hskVer === 'yct' ? `YCT Cấp ${level}` : `HSK ${level}${hskVer === '2.0' ? ' (2.0)' : ''}`}`);
    return;
  }

  // Set version
  if (ver === 'yct') {
    activeHskVersion = 'yct';
    activeRoadmapVersion = 'yct';
    activeLessonsCurriculum = 'yct';
    activeYctLevel = level.toString();
    localStorage.setItem('active_hsk_version', 'yct');
  } else {
    activeHskVersion = ver || '3.0';
    activeRoadmapVersion = ver || '3.0';
    activeLessonsCurriculum = 'hsk';
    localStorage.setItem('active_hsk_version', activeHskVersion);
    // Parse level correctly: '7-9' stays string, numbers become int
    activeLessonsLevel = /^\d+$/.test(level.toString()) ? parseInt(level) : level.toString();
  }

  // Sync version selector UI buttons
  if (typeof updateVersionButtonsUI === 'function') updateVersionButtonsUI();
  if (typeof updateExamsVersionUI === 'function') updateExamsVersionUI();

  // Switch to Lessons selection view showing Bài 1, Bài 2, Bài 3... for this HSK Level
  switchTab('lessons');
  const lessonsSection = document.getElementById('lessons-section');
  if (lessonsSection) {
    lessonsSection.scrollIntoView({ behavior: 'smooth' });
  }
};

// --- ROADMAP LEARNING VIEW LOGIC ---
let currentRoadmapLearningVocabs = [];
let currentRoadmapLearningIndex = 0;

window.openRoadmapLearningView = function (ver, level) {
  window.goToRoadmapLevel(ver, level);
};

window.renderRoadmapLearningList = function() {
  const grid = document.getElementById('roadmap-learning-vocab-list');
  if (!grid) return;
  grid.innerHTML = '';
  
  currentRoadmapLearningVocabs.forEach((w, index) => {
    const item = document.createElement('div');
    item.className = 'learning-vocab-item glass-panel';
    item.style.cssText = `
      padding: 14px 18px;
      border-radius: 16px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255,255,255,0.05);
      background: rgba(255,255,255,0.02);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    `;
    
    // Hover effect dynamically added
    item.onmouseenter = () => { if (currentRoadmapLearningIndex !== index) { item.style.transform = 'translateY(-2px)'; item.style.background = 'rgba(255,255,255,0.05)'; item.style.borderColor = 'rgba(255,255,255,0.1)'; } };
    item.onmouseleave = () => { if (currentRoadmapLearningIndex !== index) { item.style.transform = 'translateY(0)'; item.style.background = 'rgba(255,255,255,0.02)'; item.style.borderColor = 'rgba(255,255,255,0.05)'; } };

    const hz = w.word || w.hanzi || '---';
    const py = w.pinyin || '';
    const mn = w.meaning || '';

    item.innerHTML = `
      <div style="font-family: var(--font-hanzi); font-size: 1.6rem; color: var(--text-color); line-height: 1.2;">${hz}</div>
      <div style="font-size: 0.9rem; color: var(--text-muted); font-family: var(--font-pinyin); letter-spacing: 0.5px;">${py}</div>
      <div style="font-size: 0.95rem; color: var(--text-color); opacity: 0.9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px;">${mn}</div>
    `;
    item.onclick = () => showLearningFlashcard(index);
    grid.appendChild(item);
  });
};

let roadmapHanziWriters = [];
let roadmapStrokeTimeout = null;
let roadmapAnimationSequence = 0;

function renderLearningTianzige(word) {
  roadmapAnimationSequence++;
  const currentRenderSeq = roadmapAnimationSequence;

  if (roadmapStrokeTimeout) {
    clearTimeout(roadmapStrokeTimeout);
    roadmapStrokeTimeout = null;
  }

  roadmapHanziWriters.forEach(w => {
    try {
      if (w && typeof w.cancelAnimation === 'function') w.cancelAnimation();
    } catch(e){}
  });
  roadmapHanziWriters = [];

  const container = document.getElementById('roadmap-tianzige-container');
  if (!container) return;
  container.innerHTML = '';

  if (!word || word === '---') return;

  const cleanChars = Array.from(word).filter(c => /[\u4e00-\u9fa5]/.test(c));
  if (cleanChars.length === 0) {
    container.innerHTML = `<span style="font-size: 3.5rem; font-weight: 800; color: #dc2626;">${word}</span>`;
    return;
  }

  // Determine cell size based on character count to expand paper card horizontally
  let cellSize = 150;
  if (cleanChars.length === 2) cellSize = 130;
  else if (cleanChars.length >= 3) cellSize = 110;

  // Single Merged Outer Frame ("Tờ giấy dài ra")
  const frame = document.createElement('div');
  frame.className = 'tianzige-merged-frame';
  frame.style.cssText = `
    display: flex;
    border: 2.5px solid #dc2626;
    border-radius: 14px;
    overflow: hidden;
    background-color: #ffffff;
    box-shadow: 0 4px 20px rgba(220, 38, 38, 0.18);
    cursor: pointer;
  `;
  frame.title = "Nhấp để phát lại nét bút viết";
  frame.onclick = () => animateRoadmapStroke();

  cleanChars.forEach((char, idx) => {
    const cell = document.createElement('div');
    cell.style.cssText = `
      width: ${cellSize}px;
      height: ${cellSize}px;
      position: relative;
      border-right: ${idx < cleanChars.length - 1 ? '2px solid #dc2626' : 'none'};
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    cell.innerHTML = `
      <div style="position: absolute; inset: 0; pointer-events: none; background-image: 
        linear-gradient(to right, transparent 49%, rgba(220, 38, 38, 0.3) 49%, rgba(220, 38, 38, 0.3) 51%, transparent 51%),
        linear-gradient(to bottom, transparent 49%, rgba(220, 38, 38, 0.3) 49%, rgba(220, 38, 38, 0.3) 51%, transparent 51%),
        linear-gradient(45deg, transparent 49.5%, rgba(220, 38, 38, 0.2) 49.5%, rgba(220, 38, 38, 0.2) 50.5%, transparent 50.5%),
        linear-gradient(-45deg, transparent 49.5%, rgba(220, 38, 38, 0.2) 49.5%, rgba(220, 38, 38, 0.2) 50.5%, transparent 50.5%);">
      </div>
      <div id="roadmap-tianzige-target-${idx}" style="z-index: 2; display: flex; align-items: center; justify-content: center;"></div>
    `;
    frame.appendChild(cell);
  });

  container.appendChild(frame);

  if (window.HanziWriter) {
    let loadedCount = 0;

    const isDark = document.documentElement.classList.contains('dark');
    cleanChars.forEach((char, idx) => {
      try {
        const writer = HanziWriter.create(`roadmap-tianzige-target-${idx}`, char, {
          width: cellSize - 8,
          height: cellSize - 8,
          padding: 4,
          showOutline: true,
          strokeColor: isDark ? '#38bdf8' : '#2563eb',
          radicalColor: '#ef4444',
          outlineColor: isDark ? '#475569' : '#94a3b8',
          onLoadCharDataSuccess: function() {
            try { writer.hideCharacter(); } catch(e){}
            if (currentRenderSeq !== roadmapAnimationSequence) return;
            loadedCount++;
            if (loadedCount === cleanChars.length) {
              startCleanSequentialAnimation();
            }
          },
          onLoadCharDataError: function() {
            const targetEl = document.getElementById(`roadmap-tianzige-target-${idx}`);
            if (targetEl) targetEl.innerHTML = `<span style="font-size: 2.2rem; font-weight: 800; color: #dc2626;">${char}</span>`;
            if (currentRenderSeq !== roadmapAnimationSequence) return;
            loadedCount++;
            if (loadedCount === cleanChars.length) {
              startCleanSequentialAnimation();
            }
          }
        });
        roadmapHanziWriters.push(writer);
      } catch (e) {
        const targetEl = document.getElementById(`roadmap-tianzige-target-${idx}`);
        if (targetEl) targetEl.innerHTML = `<span style="font-size: 2.2rem; font-weight: 800; color: #dc2626;">${char}</span>`;
        if (currentRenderSeq === roadmapAnimationSequence) {
          loadedCount++;
          if (loadedCount === cleanChars.length) {
            startCleanSequentialAnimation();
          }
        }
      }
    });
  }
}

function startCleanSequentialAnimation() {
  roadmapAnimationSequence++;
  const currentSeq = roadmapAnimationSequence;

  if (roadmapStrokeTimeout) {
    clearTimeout(roadmapStrokeTimeout);
    roadmapStrokeTimeout = null;
  }

  roadmapHanziWriters.forEach(w => {
    try {
      if (w) {
        w.cancelAnimation();
        w.hideCharacter();
      }
    } catch(e){}
  });

  roadmapStrokeTimeout = setTimeout(() => {
    if (currentSeq === roadmapAnimationSequence) {
      runSequentialStrokeChain(currentSeq);
    }
  }, 100);
}

async function runSequentialStrokeChain(seq) {
  if (seq !== roadmapAnimationSequence) return;

  for (let i = 0; i < roadmapHanziWriters.length; i++) {
    if (seq !== roadmapAnimationSequence) return;

    const writer = roadmapHanziWriters[i];
    if (!writer) continue;

    try {
      await writer.animateCharacter();

      if (seq !== roadmapAnimationSequence) return;

      await new Promise(resolve => {
        roadmapStrokeTimeout = setTimeout(resolve, 300);
      });
    } catch (e) {
      // Ignore animation cancels
    }
  }

  if (seq === roadmapAnimationSequence) {
    roadmapStrokeTimeout = setTimeout(() => {
      if (seq === roadmapAnimationSequence) {
        startCleanSequentialAnimation();
      }
    }, 2500);
  }
}

window.animateRoadmapStroke = function() {
  startCleanSequentialAnimation();
};

let currentRoadmapTargetAns = '';

window.handleRoadmapTranslationInput = function(targetAns) {
  const inputEl = document.getElementById('roadmap-sentence-input');
  const feedbackEl = document.getElementById('roadmap-sentence-feedback');
  if (!inputEl || !feedbackEl) return;

  const typed = inputEl.value;
  if (!typed) {
    feedbackEl.innerHTML = '';
    return;
  }

  const cleanTyped = typed.replace(/[.,!?:;="'"()\[\]{}，。！？；：\s]/g, '');
  if (!cleanTyped) {
    feedbackEl.innerHTML = '';
    return;
  }

  // Build list of all valid candidate targets for the current vocabulary word
  const candidateTargets = [];
  if (targetAns) {
    candidateTargets.push(targetAns.replace(/[.,!?:;="'"()\[\]{}，。！？；：\s]/g, ''));
  }

  const w = (typeof currentRoadmapLearningVocabs !== 'undefined' && currentRoadmapLearningVocabs[currentRoadmapLearningIndex]) ? currentRoadmapLearningVocabs[currentRoadmapLearningIndex] : null;
  if (w) {
    const egZh = w.example_zh || '';
    const egZhLines = egZh ? egZh.split(/(?<=[！。？\n])\s*/).map(s => s.trim()).filter(Boolean) : [];
    egZhLines.forEach(line => {
      const clean = line.replace(/[.,!?:;="'"()\[\]{}，。！？；：\s]/g, '');
      if (clean && !candidateTargets.includes(clean)) candidateTargets.push(clean);
    });
    const cleanWord = (w.word || w.hanzi || '').replace(/[.,!?:;="'"()\[\]{}，。！？；：\s]/g, '');
    if (cleanWord && !candidateTargets.includes(cleanWord)) candidateTargets.push(cleanWord);
  }

  // Find best matching candidate target
  let bestCleanTarget = candidateTargets[0] || '';
  
  // 1. Exact match check
  const exactMatch = candidateTargets.find(cand => cand === cleanTyped);
  if (exactMatch) {
    bestCleanTarget = exactMatch;
  } else {
    // 2. Prefix match check
    const prefixMatch = candidateTargets.find(cand => cand.startsWith(cleanTyped));
    if (prefixMatch) {
      bestCleanTarget = prefixMatch;
    } else {
      // 3. Max overlap match
      let maxOverlap = -1;
      candidateTargets.forEach(cand => {
        let overlap = 0;
        for (let i = 0; i < Math.min(cleanTyped.length, cand.length); i++) {
          if (cleanTyped[i] === cand[i]) overlap++;
          else break;
        }
        if (overlap > maxOverlap) {
          maxOverlap = overlap;
          bestCleanTarget = cand;
        }
      });
    }
  }

  let html = '<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">';
  
  let isFullMatch = true;
  for (let i = 0; i < cleanTyped.length; i++) {
    const userChar = cleanTyped[i];
    const targetChar = bestCleanTarget[i];

    if (targetChar && userChar === targetChar) {
      html += `<span style="background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1.5px solid #22c55e; padding: 4px 12px; border-radius: 8px; font-weight: 700; font-family: var(--font-hanzi); font-size: 1.15rem;">${userChar}</span>`;
    } else {
      isFullMatch = false;
      html += `<span style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1.5px solid #ef4444; padding: 4px 12px; border-radius: 8px; font-weight: 700; font-family: var(--font-hanzi); font-size: 1.15rem;">${userChar}</span>`;
    }
  }

  if (cleanTyped.length === bestCleanTarget.length && isFullMatch) {
    html += `<span style="color: #22c55e; font-weight: 700; display: flex; align-items: center; margin-left: 8px; font-size: 1rem;"><i class="fa-solid fa-circle-check" style="margin-right: 4px;"></i> Chính xác 100%! 🎉</span>`;
  }

  html += '</div>';
  feedbackEl.innerHTML = html;
};

window.revealNextRoadmapHint = function(targetAns) {
  const inputEl = document.getElementById('roadmap-sentence-input');
  if (!inputEl) return;

  const cleanTarget = targetAns.replace(/[.,!?:;="'"()\[\]{}，。！？；：\s]/g, '');
  const cleanTyped = inputEl.value.replace(/[.,!?:;="'"()\[\]{}，。！？；：\s]/g, '');

  const nextIndex = cleanTyped.length;
  if (nextIndex < cleanTarget.length) {
    const nextChar = cleanTarget[nextIndex];
    inputEl.value += nextChar;
    handleRoadmapTranslationInput(targetAns);
  } else {
    showToast('Bạn đã điền hoàn tất câu rồi!', false);
  }
};

window.showLearningFlashcard = function(index) {
  if (index < 0 || index >= currentRoadmapLearningVocabs.length) return;
  currentRoadmapLearningIndex = index;
  const w = currentRoadmapLearningVocabs[index];
  
  const flashcard = document.getElementById('roadmap-learning-flashcard');
  if (!flashcard) return;

  const hz = w.word || w.hanzi || '---';
  const py = w.pinyin || '---';
  const pos = w.category || w.word_type || w.hanviet || 'Từ vựng';
  const rawMeaning = w.meaning || '---';
  const mn = cleanMeaningText(rawMeaning);
  const extractedNote = extractNoteFromMeaning(rawMeaning);
  
  const egZh = w.example_zh || '';
  const egVi = w.example_vi || '';
  
  // Smart split Chinese examples by sentence-ending punctuation (！, 。, ？) or newline
  const egZhLines = egZh ? egZh.split(/(?<=[！。？\n])\s*/).map(s => s.trim()).filter(Boolean) : [];
  
  // Smart split Vietnamese examples by sentence-ending punctuation (. ! ?) or newline
  const egViLines = egVi ? egVi.split(/(?<=[.!?\n])\s*/).map(s => s.trim()).filter(Boolean) : [];

  const rawUsage = w.note || w.explanation || w.usage || extractedNote || (egViLines[0] ? `Dùng trong câu: "${egViLines[0]}"` : '');
  const usageLines = rawUsage ? rawUsage.split(/\r?\n/).map(s => s.trim()).filter(Boolean) : [];

  // Always show translation exercise
  const hasExercise = true;
  
  // Align exercise prompt and target answer
  let sentenceQ = mn;
  let sentenceAns = hz;
  if (egZhLines.length > 0 && egViLines.length > 0 && egViLines[0] && egViLines[0] !== mn) {
    sentenceQ = egViLines[0];
    sentenceAns = egZhLines[0];
  } else {
    sentenceQ = mn;
    sentenceAns = hz;
  }

  flashcard.style.opacity = '0';
  flashcard.style.transform = 'scale(0.98)';

  setTimeout(() => {
    flashcard.innerHTML = `
      <!-- TOP SECTION: 2 COLUMNS (TIANZIGE LEFT, DETAILS RIGHT) -->
      <div style="display: flex; gap: 24px; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; text-align: left; width: 100%; ${hasExercise ? 'margin-bottom: 24px;' : ''}">
        
        <!-- LEFT COLUMN: TIANZIGE GRID + TỪ LOẠI BADGE -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
          <div id="roadmap-tianzige-container"></div>

          <!-- Từ loại badge -->
          <div style="background: rgba(37, 99, 235, 0.12); color: #2563eb; border: 1.5px solid rgba(37, 99, 235, 0.3); font-weight: 700; font-size: 0.9rem; padding: 4px 18px; border-radius: 99px; text-align: center; letter-spacing: 0.5px;">
            ${pos}
          </div>
        </div>

        <!-- RIGHT COLUMN: PINYIN, NGHĨA, CHÚ Ý, VÍ DỤ -->
        <div style="flex: 1; min-width: 260px; display: flex; flex-direction: column; gap: 8px;">
          <!-- Pinyin & Audio -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <span style="font-family: var(--font-pinyin); font-size: 1.8rem; font-weight: 700; color: #2563eb; letter-spacing: 1px;">
              ${py}
            </span>
            <button onclick="speakText('${hz.replace(/'/g, "\\'")}')" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; width: 42px; height: 42px; border-radius: 50%; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); display: flex; align-items: center; justify-content: center; transition: transform 0.2s;" onmousedown="this.style.transform='scale(0.95)'" onmouseup="this.style.transform='scale(1)'">
              <i class="fa-solid fa-volume-high"></i>
            </button>
          </div>

          <!-- Bộ thủ (Ngay dưới phiên âm) -->
          ${getRadicalBadgeHtml(hz)}

          <!-- Nghĩa -->
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-color); border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 6px; margin-bottom: 4px;">
            ${mn}
          </div>

          <!-- Chú ý / Cách dùng -->
          ${usageLines.length > 0 ? `
            <div style="font-size: 0.95rem; color: var(--text-muted); font-style: italic; line-height: 1.4; display: flex; flex-direction: column; gap: 4px;">
              ${usageLines.map(line => `<div><i class="fa-solid fa-circle-info" style="color: #3b82f6; margin-right: 4px;"></i> ${line}</div>`).join('')}
            </div>
          ` : ''}

          <!-- Ví dụ minh họa (Từng câu xuống dòng là 1 ví dụ) -->
          ${egZhLines.length > 0 ? `
            <div style="background: rgba(255,255,255,0.04); border-left: 3px solid #2563eb; padding: 10px 14px; border-radius: 0 8px 8px 0; margin-top: 6px; display: flex; flex-direction: column; gap: 8px;">
              <div style="font-size: 0.85rem; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-book-open"></i> Ví dụ minh họa:
              </div>
              ${egZhLines.map((zhLine, i) => `
                <div style="${i > 0 ? 'border-top: 1px dashed rgba(255,255,255,0.12); padding-top: 6px;' : ''}">
                  <div style="font-family: var(--font-hanzi); font-size: 1.15rem; color: var(--text-color); font-weight: 600; line-height: 1.3;">${zhLine}</div>
                  ${egViLines[i] ? `<div style="font-size: 0.92rem; color: var(--text-muted); font-style: italic; margin-top: 2px;">${egViLines[i]}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>

      <!-- BOTTOM SECTION: DỊCH CÂU MATCHING IMAGE 2 EXACTLY -->
      ${hasExercise ? `
        <div style="border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 18px; width: 100%; text-align: left;">
          
          <!-- Prompt Row: Dịch sang tiếng Trung: "..." with Nghe Audio Button -->
          <div style="display: flex; align-items: center; justify-content: space-between; font-weight: 700; font-size: 1.05rem; color: var(--text-color); margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <i class="fa-solid fa-language text-primary" style="font-size: 1.15rem;"></i>
              <span>Dịch sang tiếng Trung:</span>
              <span style="font-weight: 800; color: #38bdf8; font-size: 1.05rem;">"${sentenceQ}"</span>
            </div>
            <button onclick="window.speakText('${sentenceAns.replace(/'/g, "\\'")}')" class="btn btn-sm" style="background: rgba(56, 189, 248, 0.18); border: 1.5px solid rgba(56, 189, 248, 0.4); color: #38bdf8; border-radius: 12px; padding: 4px 12px; font-size: 0.85rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s;" title="Nghe phát âm câu mẫu" onmouseover="this.style.background='rgba(56, 189, 248, 0.3)'" onmouseout="this.style.background='rgba(56, 189, 248, 0.18)'">
              <i class="fa-solid fa-volume-high"></i> Nghe
            </button>
          </div>

          <!-- Clean Full Width Input Box matching Image 2 -->
          <div style="position: relative; width: 100%; margin-bottom: 14px;">
            <input type="text" id="roadmap-sentence-input" placeholder="Gõ chữ Hán vào đây..." 
              style="width: 100%; padding: 14px 18px; border-radius: 14px; border: 2.5px solid rgba(255,255,255,0.25); background: rgba(15, 23, 42, 0.6); color: #ffffff; font-size: 1.15rem; font-family: var(--font-hanzi); font-weight: 800; outline: none; transition: border-color 0.2s ease;"
              oninput="handleRoadmapTranslationInput('${sentenceAns.replace(/'/g, "\\'")}')" />
          </div>

          <!-- IMAGE 2 HINT SECTION: Eye Cards + Text + Big Yellow Button -->
          <div style="display: flex; flex-direction: column; gap: 12px; align-items: center; width: 100%;">
            
            <!-- Eye Cards Row -->
            <div id="roadmap-eye-cards-row" style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center; justify-content: center; width: 100%;">
              ${(() => {
                const cleanSentenceAns = sentenceAns.replace(/[.,!?:;="'"()\[\]{}，。！？；：\s\-_~`]/g, '');
                const wordTokens = [];
                let tokenIdx = 0;
                while (tokenIdx < cleanSentenceAns.length) {
                  const chunkSize = (cleanSentenceAns.length - tokenIdx >= 2) ? 2 : 1;
                  wordTokens.push(cleanSentenceAns.substring(tokenIdx, tokenIdx + chunkSize));
                  tokenIdx += chunkSize;
                }
                return wordTokens.map((token, index) => {
                  const dotsFormatted = Array(token.length).fill('.').join(' ');
                  return `
                    <div class="image2-hint-card" id="roadmap-eye-card-${index}" data-word="${token}" data-revealed="false"
                      style="width: 76px; height: 96px; background: #ffffff; border: 2.5px solid #1e293b; border-radius: 16px; padding: 10px 8px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; box-shadow: 0 4px 10px rgba(0,0,0,0.08); cursor: pointer; user-select: none; transition: transform 0.15s ease;"
                      onclick="window.toggleRoadmapEyeCard(${index}, '${cleanSentenceAns.replace(/'/g, "\\'")}')"
                      onmouseover="this.style.transform='translateY(-3px)';"
                      onmouseout="this.style.transform='none';">
                      
                      <!-- Eye Icon Circle at top matching Image 2 -->
                      <div style="width: 28px; height: 26px; border-radius: 50%; border: 1.5px solid #1e293b; display: flex; align-items: center; justify-content: center; background: #ffffff; color: #1e293b; font-size: 0.85rem;">
                        <i class="fa-regular fa-eye"></i>
                      </div>

                      <!-- Masked Dots or Revealed Chinese Word in middle/bottom matching Image 2 -->
                      <div class="card-dots" style="font-family: monospace, sans-serif; font-size: 1.4rem; font-weight: 900; color: #0f172a; letter-spacing: 2px; text-align: center; line-height: 1;">
                        ${dotsFormatted}
                      </div>

                      <div class="card-zh" style="display: none; font-family: var(--font-chinese); font-size: 1.15rem; font-weight: 900; color: #2563eb; text-align: center; word-break: break-all; line-height: 1.1;">
                        ${token}
                      </div>
                    </div>
                  `;
                }).join('');
              })()}
            </div>

            <!-- Instruction Text matching Image 2 -->
            <div style="font-size: 0.9rem; font-weight: 700; color: #94a3b8; text-align: center;">
              Nhấp vào biểu tượng con mắt để hiện từ
            </div>

            <!-- Big Yellow Button matching Image 2 -->
            <button id="roadmap-reveal-all-btn" type="button"
              onclick="window.revealAllRoadmapEyeCards('${sentenceAns.replace(/[.,!?:;="'"()\[\]{}，。！？；：\s\-_~`]/g, '').replace(/'/g, "\\'")}')"
              style="width: 100%; background: #facc15; color: #000000; font-weight: 900; font-size: 1.05rem; border: 2.5px solid #000000; border-radius: 14px; padding: 14px 20px; cursor: pointer; box-shadow: 0 4px 0 #000000; transition: all 0.15s ease; text-transform: uppercase; letter-spacing: 0.5px;"
              onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 0 #000000';"
              onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 0 #000000';">
              HIỆN TẤT CẢ TỪ
            </button>
          </div>

          <!-- Real-time Character Matching Feedback (Green / Red) -->
          <div id="roadmap-sentence-feedback" style="margin-top: 10px; min-height: 32px;"></div>
        </div>
      ` : ''}
    `;

    flashcard.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    flashcard.style.opacity = '1';
    flashcard.style.transform = 'scale(1)';

    // Render Tianzige HanziWriter
    renderLearningTianzige(hz);
  }, 50);

  // Highlight list item
  const listItems = document.querySelectorAll('#roadmap-learning-vocab-list .learning-vocab-item');
  listItems.forEach((item, i) => {
    if (i === index) {
      item.style.background = 'rgba(var(--primary-rgb), 0.15)';
      item.style.borderColor = 'var(--primary-color)';
      item.style.transform = 'translateY(-2px)';
      item.style.boxShadow = '0 6px 16px rgba(var(--primary-rgb), 0.2)';
    } else {
      item.style.background = 'rgba(255,255,255,0.02)';
      item.style.borderColor = 'rgba(255,255,255,0.05)';
      item.style.transform = 'translateY(0)';
      item.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
    }
  });

  // Auto scroll to item inside list container ONLY (prevents page/modal viewport jumping)
  const listContainer = document.getElementById('roadmap-learning-vocab-list');
  if (listContainer && listItems[index]) {
    const targetItem = listItems[index];
    const scrollTop = targetItem.offsetTop - (listContainer.clientHeight / 2) + (targetItem.offsetHeight / 2);
    listContainer.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
  }
};

window.prevLearningFlashcard = function() {
  if (currentRoadmapLearningIndex > 0) {
    showLearningFlashcard(currentRoadmapLearningIndex - 1);
  }
};

window.nextLearningFlashcard = function() {
  if (currentRoadmapLearningIndex < currentRoadmapLearningVocabs.length - 1) {
    showLearningFlashcard(currentRoadmapLearningIndex + 1);
  }
};
// -----------------------------------
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
        <a class="exam-lib-btn exam-lib-btn-folder" href="${folderLink}" target="_blank" rel="noopener" title="Xem tất cả các file của đề thi ${code}" style="width: 100%; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; border: none; justify-content: center; font-weight: 700; padding: 10px 14px; border-radius: 10px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);">
          <i class="fa-solid fa-folder-open"></i> Xem trọn bộ tài liệu đề ${code} (Full Files)
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
  switchStudyMode(mode);
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
  window.toggleChatbotPanel = function () {
    const isHidden = panel.style.display === 'none';
    panel.style.display = isHidden ? 'flex' : 'none';
    if (isHidden) {
      if (badge) badge.style.display = 'none';
      if (input) input.focus();
      scrollChatToBottom();
    }
  };

  window.closeChatbotPanel = function () {
    panel.style.display = 'none';
  };

  toggleBtn.onclick = window.toggleChatbotPanel;
  closeBtn.onclick = window.closeChatbotPanel;

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
      window.location.href = '/chat-history.html';
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
      if (currentUser && currentUser.email) {
        payload.userEmail = currentUser.email;
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

window.initChatbot = initChatbot;

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

let activeLessonViewMode = 'map';

window.switchLessonViewMode = function (mode) {
  activeLessonViewMode = mode;
  renderLessonsList();
};

window.openLessonDetailModal = function (lessonKey) {
  const currentLvl = activeLessonsCurriculum === 'yct' ? activeYctLevel : activeLessonsLevel;
  const levelVocabs = vocabList.filter(w => {
    if (w.isCustom) return false;
    if (w.curriculum === 'yct' || w.hskVersion === 'yct') return false;
    if (!matchLevel(w.level, currentLvl)) return false;
    if ((w.hskVersion || '3.0') !== activeHskVersion) return false;
    return true;
  });

  const uniqueLessons = {};
  levelVocabs.forEach(w => {
    if (w.lessonId) uniqueLessons[w.lessonId] = true;
  });
  const sortedLessonIds = Object.keys(uniqueLessons).map(Number).sort((a, b) => a - b);
  const isUnlocked = isRoadmapLessonUnlocked(activeHskVersion, currentLvl, lessonKey, sortedLessonIds);
  if (!isUnlocked) {
    const idx = sortedLessonIds.findIndex(k => String(k) === String(lessonKey));
    const prevKey = idx > 0 ? sortedLessonIds[idx - 1] : 1;
    showToast(`🔒 Bài ${lessonKey} đang bị khóa! Vui lòng hoàn thành Bài ${prevKey} trong Lộ trình để mở khóa nhé.`, true);
    return;
  }

  const sliceWords = levelVocabs.filter(w => String(w.lessonId || 1) === String(lessonKey));
  if (sliceWords.length === 0) return;

  const firstWord = sliceWords[0];
  const title = cleanLessonTitle(firstWord.lessonTitle || firstWord.category, lessonKey);
  const desc = firstWord.lessonDesc || `Ôn tập từ vựng bài học HSK Cấp ${currentLvl}`;
  const memorizedCount = sliceWords.filter(w => w.isMemorized).length;
  const pct = Math.round((memorizedCount / sliceWords.length) * 100);

  const numCircle = document.getElementById('modal-lesson-number-circle');
  const badgeVal = document.getElementById('modal-lesson-badge-val');
  const titleVal = document.getElementById('modal-lesson-title-val');
  const descVal = document.getElementById('modal-lesson-desc-val');
  const progText = document.getElementById('modal-lesson-progress-text');
  const progFill = document.getElementById('modal-lesson-progress-fill');
  const vocabCount = document.getElementById('modal-lesson-vocab-count');
  const btnVocab = document.getElementById('modal-btn-mod-vocab');

  if (numCircle) numCircle.textContent = lessonKey.toString().replace(/\D/g, '') || lessonKey;
  if (badgeVal) badgeVal.textContent = `HSK ${currentLvl === '7-9' ? '7-8-9' : currentLvl} (${activeHskVersion}) • Bài ${lessonKey}`;
  if (titleVal) titleVal.textContent = title;
  if (descVal) descVal.textContent = desc;
  if (progText) progText.textContent = `${memorizedCount}/${sliceWords.length} từ (${pct}%)`;
  if (progFill) progFill.style.width = `${pct}%`;
  if (vocabCount) vocabCount.textContent = `${sliceWords.length} từ`;

  // Render grammar preview in lesson detail modal
  const numKey = parseInt(String(lessonKey).replace(/\D/g, ''), 10) || 1;
  const currentLvlStr = String(currentLvl);
  const grammarList = currentLvlStr === '2' ? (HSK2_STRUCTURED_GRAMMAR || []) : (HSK1_STRUCTURED_GRAMMAR || []);
  const grammarLesson = ((currentLvlStr === '1' || currentLvlStr === '2') && (activeHskVersion === '3.0' || !activeHskVersion)) ? grammarList.find(l => l.lessonId === numKey) : null;
  const grammarPreviewBox = document.getElementById('modal-lesson-grammar-preview-box');
  const grammarPreviewList = document.getElementById('modal-lesson-grammar-preview-list');
  const grammarPreviewTitle = document.getElementById('modal-lesson-grammar-preview-title');
  if (grammarPreviewBox && grammarPreviewList) {
    if (grammarLesson && grammarLesson.grammarPoints && grammarLesson.grammarPoints.length > 0) {
      grammarPreviewBox.style.display = 'block';
      if (grammarPreviewTitle) {
        grammarPreviewTitle.textContent = `Trọng tâm Ngữ pháp bài này (${grammarLesson.grammarPoints.length} điểm):`;
      }
      grammarPreviewList.innerHTML = grammarLesson.grammarPoints.map((p, idx) => {
        let fText = '';
        if (p.formula) {
          const cleanF = p.formula.replace(/^(Công thức chung|Cấu trúc|Công thức)\s*[:\-]?\s*/i, '').trim();
          const firstLine = cleanF.split('\n').filter(l => l.trim().length > 0)[0] || '';
          if (firstLine) {
            fText = `<span style="color: #38bdf8; font-size: 0.82rem; margin-left: 6px; font-weight: 600;">[ ${firstLine} ]</span>`;
          }
        }
        return `
          <li style="margin-bottom: 6px; line-height: 1.4;">
            <strong style="color: #ffffff;">${idx + 1}. ${p.title}</strong>
            ${fText}
          </li>
        `;
      }).join('');
    } else {
      grammarPreviewBox.style.display = 'none';
    }
  }

  if (btnVocab) {
    btnVocab.onclick = function () {
      const modalEl = document.getElementById('lesson-detail-popup-modal');
      if (modalEl) modalEl.style.display = 'none';
      startLessonStudy({ id: lessonKey, title }, sliceWords);
    };
  }

  const btnGrammar = document.getElementById('modal-btn-mod-grammar');
  if (btnGrammar) {
    const grammarBadge = btnGrammar.querySelector('small');
    const ptCount = (grammarLesson && grammarLesson.grammarPoints) ? grammarLesson.grammarPoints.length : 0;
    if (grammarBadge) {
      grammarBadge.textContent = ptCount > 0 ? `${ptCount} điểm NP 📖` : 'Học Ngữ Pháp 📖';
      grammarBadge.style.background = 'linear-gradient(135deg, #0284c7, #2563eb)';
      grammarBadge.style.color = '#ffffff';
    }
    btnGrammar.onclick = function () {
      const modalEl = document.getElementById('lesson-detail-popup-modal');
      if (modalEl) modalEl.style.display = 'none';
      window.openLessonGrammarStudy(lessonKey);
    };
  }

  const btnText = document.getElementById('modal-btn-mod-text');
  if (btnText) {
    const textBadge = btnText.querySelector('small');
    if (textBadge) {
      textBadge.textContent = 'Hội thoại 📖';
      textBadge.style.background = '#0284c7';
      textBadge.style.color = '#ffffff';
    }
    btnText.onclick = function () {
      const modalEl = document.getElementById('lesson-detail-popup-modal');
      if (modalEl) modalEl.style.display = 'none';
      window.openLessonTextStudy(lessonKey);
    };
  }

  // Handle 'Ôn Tập' (Quiz Game) unlock logic based on 100% completion
  const btnReview = document.getElementById('modal-btn-mod-review');
  let reviewBadge = document.getElementById('modal-review-badge');
  if (!reviewBadge && btnReview) {
    reviewBadge = btnReview.querySelector('small');
  }

  if (pct === 100) {
    if (reviewBadge) {
      reviewBadge.textContent = 'Mở khóa Trắc nghiệm 🎮';
      reviewBadge.style.background = '#10b981';
      reviewBadge.style.color = '#ffffff';
    }
    if (btnReview) {
      btnReview.style.opacity = '1';
      btnReview.onclick = function (e) {
        e.stopPropagation();
        const modalEl = document.getElementById('lesson-detail-popup-modal');
        if (modalEl) modalEl.style.display = 'none';
        window.location.href = `/quiz-game.html?lesson=${lessonKey}&level=${currentLvl}&version=${activeHskVersion}`;
      };
    }
  } else {
    if (reviewBadge) {
      reviewBadge.textContent = 'Cần 100%';
      reviewBadge.style.background = 'rgba(0,0,0,0.25)';
      reviewBadge.style.color = '#ffffff';
    }
    if (btnReview) {
      btnReview.style.opacity = '0.85';
      btnReview.onclick = function (e) {
        e.stopPropagation();
        showToast(`Bạn cần học đủ 100% từ vựng bài học này (hiện tại: ${pct}%) để mở khóa Ôn Tập Trắc Nghiệm!`, true);
      };
    }
  }

  const modal = document.getElementById('lesson-detail-popup-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
};

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
      objectivesText.textContent = `Mục tiêu: Giáo trình YCT - Tiếng Trung Thiếu nhi đang trong quá trình biên soạn & chuẩn hóa nội dung.`;
    }

    grid.innerHTML = `
      <div class="glass-panel" style="grid-column: 1 / -1; max-width: 650px; margin: 32px auto; padding: 36px 24px; text-align: center; border: 1.5px dashed rgba(245, 158, 11, 0.4); border-radius: 20px;">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(245, 158, 11, 0.15); color: #fbbf24; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 16px;">
          <i class="fa-solid fa-lock"></i>
        </div>
        <h3 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: #ffffff; margin-bottom: 8px;">
          Giáo trình YCT (Tiếng Trung Thiếu Nhi) Đang Tạm Khóa
        </h3>
        <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px;">
          Nội dung từ vựng & bài học của giáo trình YCT đang được đội ngũ giáo viên Tiếng Trung Hồng Thái chuẩn hóa và kiểm duyệt kỹ lưỡng để đảm bảo độ chính xác cao nhất. Mời bạn trải nghiệm Lộ trình HSK 3.0 (Cấp 1 - 3) hoặc HSK 1 (2.0)!
        </p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="goToRoadmapLevel('3.0', 1)" style="padding: 10px 20px; font-weight: 700; border-radius: 12px;">
            <i class="fa-solid fa-graduation-cap"></i> Học HSK 1 (3.0)
          </button>
          <button class="btn btn-secondary" onclick="window.returnToHskLevelSelection()" style="padding: 10px 20px; font-weight: 700; border-radius: 12px; background: rgba(255,255,255,0.08);">
            <i class="fa-solid fa-arrow-left"></i> Quay lại Lộ trình
          </button>
        </div>
      </div>
    `;
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

  // HSK 2.0 Levels 2..6 Locked Guard
  if (activeHskVersion === '2.0' && String(activeLessonsLevel) !== '1') {
    if (objectivesText) {
      objectivesText.textContent = `Mục tiêu: HSK 2.0 Cấp ${activeLessonsLevel} đang trong quá trình biên soạn & chuẩn hóa nội dung.`;
    }
    grid.innerHTML = `
      <div class="glass-panel" style="grid-column: 1 / -1; max-width: 650px; margin: 32px auto; padding: 36px 24px; text-align: center; border: 1.5px dashed rgba(245, 158, 11, 0.4); border-radius: 20px;">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(245, 158, 11, 0.15); color: #fbbf24; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 16px;">
          <i class="fa-solid fa-lock"></i>
        </div>
        <h3 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: #ffffff; margin-bottom: 8px;">
          Cấp độ HSK ${activeLessonsLevel} (2.0) Đang Tạm Khóa
        </h3>
        <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px;">
          Nội dung từ vựng & bài học của HSK 2.0 Cấp ${activeLessonsLevel} đang được giáo viên Tiếng Trung Hồng Thái chuẩn hóa và kiểm duyệt kỹ lưỡng để đảm bảo độ chính xác cao nhất.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="goToRoadmapLevel('2.0', 1)" style="padding: 10px 20px; font-weight: 700; border-radius: 12px;">
            <i class="fa-solid fa-graduation-cap"></i> Học HSK 1 (2.0)
          </button>
          <button class="btn btn-secondary" onclick="window.returnToHskLevelSelection()" style="padding: 10px 20px; font-weight: 700; border-radius: 12px; background: rgba(255,255,255,0.08);">
            <i class="fa-solid fa-arrow-left"></i> Quay lại Lộ trình
          </button>
        </div>
      </div>
    `;
    return;
  }

  // HSK 3.0 Levels 4..7-9 Locked Guard
  if ((activeHskVersion === '3.0' || !activeHskVersion) && !['1', '2', '3'].includes(String(activeLessonsLevel))) {
    if (objectivesText) {
      objectivesText.textContent = `Mục tiêu: HSK 3.0 Cấp ${activeLessonsLevel} đang trong quá trình biên soạn & chuẩn hóa nội dung.`;
    }
    grid.innerHTML = `
      <div class="glass-panel" style="grid-column: 1 / -1; max-width: 650px; margin: 32px auto; padding: 36px 24px; text-align: center; border: 1.5px dashed rgba(245, 158, 11, 0.4); border-radius: 20px;">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(245, 158, 11, 0.15); color: #fbbf24; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 16px;">
          <i class="fa-solid fa-lock"></i>
        </div>
        <h3 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: #ffffff; margin-bottom: 8px;">
          Cấp độ HSK ${activeLessonsLevel} (3.0) Đang Tạm Khóa
        </h3>
        <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.6; margin-bottom: 24px;">
          Nội dung từ vựng & bài học của HSK 3.0 Cấp ${activeLessonsLevel} đang được giáo viên Tiếng Trung Hồng Thái chuẩn hóa và kiểm duyệt kỹ lưỡng để đảm bảo độ chính xác cao nhất. Mời bạn trải nghiệm các cấp HSK 1, HSK 2, HSK 3!
        </p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="goToRoadmapLevel('3.0', 1)" style="padding: 10px 20px; font-weight: 700; border-radius: 12px;">
            <i class="fa-solid fa-graduation-cap"></i> Học HSK 1 (3.0)
          </button>
          <button class="btn btn-secondary" onclick="window.returnToHskLevelSelection()" style="padding: 10px 20px; font-weight: 700; border-radius: 12px; background: rgba(255,255,255,0.08);">
            <i class="fa-solid fa-arrow-left"></i> Quay lại Lộ trình
          </button>
        </div>
      </div>
    `;
    return;
  }

  // Update objectives text - dynamically count words from vocabList
  if (objectivesText) {
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

  // View Switcher Bar Header
  const viewSwitcherHtml = `
    <div class="saga-header-bar" style="grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; background: rgba(15, 23, 42, 0.85); padding: 12px 22px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.18); backdrop-filter: blur(16px); position: relative; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
      <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap; position: relative; z-index: 101;">
        <button onclick="event.preventDefault(); event.stopPropagation(); window.returnToHskLevelSelection();" title="Đổi Cấp Độ HSK" style="width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #2563eb, #1d4ed8); border: 1px solid rgba(255,255,255,0.3); color: #ffffff; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; transition: all 0.2s; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); position: relative; z-index: 999; pointer-events: auto;" onmouseenter="this.style.transform='scale(1.08)'" onmouseleave="this.style.transform='scale(1)'">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <span class="saga-header-title" style="font-family: var(--font-display); font-weight: 800; font-size: 1.2rem; color: #fbbf24; display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-map-location-dot" style="font-size: 1.35rem;"></i> BẢN ĐỒ BÀI HỌC HSK CẤP ${activeLessonsLevel === '7-9' ? '7-8-9' : activeLessonsLevel}
        </span>
      </div>
    </div>
  `;

  if (activeLessonViewMode === 'map') {
    let mapNodesHtml = '';
    let foundFirstActive = false;

    uniqueLessonKeys.forEach((lessonKey, idx) => {
      const sliceWords = lessonGroups[lessonKey] || [];
      const wordsCount = sliceWords.length;
      if (wordsCount === 0) return;

      const firstWord = sliceWords[0];
      const title = cleanLessonTitle(firstWord.lessonTitle || firstWord.category, lessonKey);
      const memorizedCount = sliceWords.filter(w => w.isMemorized).length;
      const pct = Math.round((memorizedCount / wordsCount) * 100);
      const isCompleted = memorizedCount === wordsCount && wordsCount > 0;

      // Get Quiz Game Stars for this lesson
      const starKey = `quiz_stars_${activeHskVersion}_${activeLessonsLevel}_${lessonKey}`;
      const quizStars = parseInt(localStorage.getItem(starKey) || '0', 10);

      // Check if lesson is unlocked based on roadmap progression
      const prevKey = idx > 0 ? uniqueLessonKeys[idx - 1] : null;
      const isUnlocked = isRoadmapLessonUnlocked(activeHskVersion, activeLessonsLevel, lessonKey, uniqueLessonKeys);

      let isCurrentActive = false;
      if (isUnlocked && !isCompleted && !foundFirstActive) {
        isCurrentActive = true;
        foundFirstActive = true;
      }

      // S-curve positioning
      const posIndex = idx % 4;
      let posStyle = 'align-self: center;';
      if (posIndex === 0) posStyle = 'align-self: flex-start; margin-left: 18%;';
      if (posIndex === 1) posStyle = 'align-self: center;';
      if (posIndex === 2) posStyle = 'align-self: flex-end; margin-right: 18%;';
      if (posIndex === 3) posStyle = 'align-self: center;';

      // Circle Button Gradient Styling
      let nodeStyle = '';
      if (!isUnlocked) {
        nodeStyle = 'background: linear-gradient(145deg, #334155, #1e293b); box-shadow: 0 8px 0 #0f172a; border-color: rgba(255,255,255,0.1); filter: grayscale(0.5); opacity: 0.85;';
      } else if (isCompleted) {
        nodeStyle = 'background: linear-gradient(145deg, #fbbf24, #d97706); box-shadow: 0 8px 0 #b45be6; border-color: #fef08a; color: #78350f;';
      } else if (isCurrentActive) {
        nodeStyle = 'background: linear-gradient(145deg, #10b981, #059669); box-shadow: 0 8px 0 #047857; border-color: #a7f3d0;';
      } else {
        nodeStyle = 'background: linear-gradient(145deg, #3b82f6, #1d4ed8); box-shadow: 0 8px 0 #1e40af; border-color: #bfdbfe;';
      }

      const numOnly = lessonKey.toString().replace(/\D/g, '') || lessonKey;
      const clickAction = isUnlocked
        ? `window.openLessonDetailModal('${lessonKey}')`
        : `showToast('Bạn cần học hoàn thành hoặc đạt ít nhất 1 Sao ở Bài ${prevKey} để mở khóa Bài ${lessonKey}!', true)`;

      mapNodesHtml += `
        <div class="saga-path-node-item" style="position: relative; display: flex; flex-direction: column; align-items: center; margin: 28px 0; z-index: 5; ${posStyle}">
          
          <!-- Floating Gold Crown for 100% completed lesson -->
          ${isCompleted ? `
            <div style="position: absolute; top: -18px; font-size: 1.4rem; color: #fbbf24; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.6)); z-index: 10;">
              <i class="fa-solid fa-crown"></i>
            </div>
          ` : ''}

          <!-- Candy Crush Style 3D Round Circle Button -->
          <button class="saga-node-circle ${!isUnlocked ? 'node-locked' : 'node-unlocked'} ${isCurrentActive ? 'active-pulse' : ''}"
                  onclick="${clickAction}"
                  title="${title}"
                  style="width: 84px; height: 84px; border-radius: 50%; font-family: var(--font-display); font-weight: 800; font-size: 1.6rem; color: #ffffff; position: relative; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); ${nodeStyle}">
            ${!isUnlocked ? '<i class="fa-solid fa-lock" style="font-size: 1.3rem; color: #cbd5e1;"></i>' : `<span>${numOnly}</span>`}
          </button>

          <!-- 3 Gold Stars under Node (based on Quiz Game result) -->
          <div style="display: flex; gap: 4px; margin-top: 8px;">
            <i class="fa-solid fa-star" style="font-size: 0.85rem; color: ${quizStars >= 1 ? '#fbbf24' : 'rgba(255,255,255,0.2)'}; text-shadow: 0 1px 3px rgba(0,0,0,0.6);"></i>
            <i class="fa-solid fa-star" style="font-size: 0.95rem; color: ${quizStars >= 2 ? '#fbbf24' : 'rgba(255,255,255,0.2)'}; text-shadow: 0 1px 3px rgba(0,0,0,0.6); transform: translateY(-2px);"></i>
            <i class="fa-solid fa-star" style="font-size: 0.85rem; color: ${quizStars === 3 ? '#fbbf24' : 'rgba(255,255,255,0.2)'}; text-shadow: 0 1px 3px rgba(0,0,0,0.6);"></i>
          </div>

          <!-- Lesson Tag Card -->
          <div class="saga-node-tag-card ${!isUnlocked ? 'tag-locked' : ''}" onclick="${clickAction}" style="margin-top: 8px; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); border: 1px solid ${!isUnlocked ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.2)'}; border-radius: 14px; padding: 8px 16px; text-align: center; max-width: 220px; cursor: pointer; box-shadow: 0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2); transition: all 0.2s; ${!isUnlocked ? 'opacity: 0.85;' : ''}">
            <div class="saga-tag-title" style="font-weight: 800; font-size: 0.95rem; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: var(--font-display);">${!isUnlocked ? '<i class="fa-solid fa-lock" style="font-size: 0.75rem; color: #fbbf24; margin-right: 4px;"></i>' : ''}${title}</div>
            <div class="saga-tag-sub" style="font-size: 0.78rem; color: ${!isUnlocked ? '#fbbf24' : '#94a3b8'}; margin-top: 2px; font-weight: 600;">
              ${!isUnlocked ? '🔒 Bài học bị khóa' : `${memorizedCount}/${wordsCount} từ ${isCompleted ? '• 🎉 Đã xong' : `• ${pct}%`}`}
            </div>
          </div>

          <!-- Connector Path Line / Arrow to Next Node -->
          ${idx < uniqueLessonKeys.length - 1 ? `
            <div class="saga-connector-line" style="height: 24px; width: 3px; background: repeating-linear-gradient(to bottom, ${isUnlocked ? '#10b981' : 'rgba(255,255,255,0.2)'} 0, ${isUnlocked ? '#10b981' : 'rgba(255,255,255,0.2)'} 6px, transparent 6px, transparent 12px); margin: 8px 0; position: relative;">
              <i class="fa-solid fa-chevron-down" style="position: absolute; bottom: -8px; left: -5px; font-size: 0.8rem; color: ${isUnlocked ? '#10b981' : 'rgba(255,255,255,0.3)'};"></i>
            </div>
          ` : ''}

        </div>
      `;
    });

    const sagaMapWrapper = `
      <div style="grid-column: 1 / -1; width: 100%;">
        ${viewSwitcherHtml}
        <div class="lessons-saga-map-wrapper" style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 27, 75, 0.8) 50%, rgba(15, 23, 42, 0.9) 100%); backdrop-filter: blur(40px) saturate(200%); -webkit-backdrop-filter: blur(40px) saturate(200%); border-radius: 32px; border: 1px solid rgba(255,255,255,0.18); padding: 48px 24px; box-shadow: 0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25); display: flex; flex-direction: column; align-items: center; position: relative; overflow: hidden;">
          
          <!-- Liquid Glass Ambient Glowing Orbs -->
          <div style="position: absolute; top: -100px; left: -100px; width: 350px; height: 350px; background: radial-gradient(circle, rgba(56, 189, 248, 0.35), transparent 70%); filter: blur(60px); pointer-events: none; border-radius: 50%; animation: liquidPulse 8s ease-in-out infinite alternate;"></div>
          <div style="position: absolute; top: 40%; right: -120px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(168, 85, 247, 0.35), transparent 70%); filter: blur(70px); pointer-events: none; border-radius: 50%; animation: liquidPulse 10s ease-in-out infinite alternate-reverse;"></div>
          <div style="position: absolute; bottom: -100px; left: 30%; width: 350px; height: 350px; background: radial-gradient(circle, rgba(16, 185, 129, 0.25), transparent 70%); filter: blur(60px); pointer-events: none; border-radius: 50%; animation: liquidPulse 9s ease-in-out infinite alternate;"></div>

          <style>
            @keyframes liquidPulse {
              0% { transform: scale(1) translateY(0); opacity: 0.6; }
              100% { transform: scale(1.2) translateY(-20px); opacity: 0.9; }
            }
            @keyframes floatMascot {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
            .saga-node-circle:hover {
              transform: scale(1.08) translateY(-4px);
              box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.2) !important;
            }
            .saga-node-circle:active {
              transform: scale(0.96) translateY(2px);
            }

            /* Light mode Liquid Glass theme adaptation */
            html.light-mode .lessons-saga-map-wrapper,
            html.light .lessons-saga-map-wrapper,
            body.light-mode .lessons-saga-map-wrapper {
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(238, 242, 255, 0.88) 50%, rgba(255, 255, 255, 0.82) 100%) !important;
              border: 1px solid rgba(255, 255, 255, 0.8) !important;
              box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
            }

            html.light-mode .saga-header-bar,
            html.light .saga-header-bar,
            body.light-mode .saga-header-bar {
              background: rgba(255, 255, 255, 0.88) !important;
              border: 1px solid rgba(255, 255, 255, 0.8) !important;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
            }

            html.light-mode .saga-header-title,
            html.light .saga-header-title,
            body.light-mode .saga-header-title {
              color: #1e3a8a !important;
            }

            html.light-mode .saga-node-tag-card,
            html.light .saga-node-tag-card,
            body.light-mode .saga-node-tag-card {
              background: rgba(255, 255, 255, 0.85) !important;
              border: 1px solid rgba(255, 255, 255, 0.9) !important;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1) !important;
            }

            html.light-mode .saga-tag-title,
            html.light .saga-tag-title,
            body.light-mode .saga-tag-title {
              color: #0f172a !important;
            }

            html.light-mode .saga-tag-sub,
            html.light .saga-tag-sub,
            body.light-mode .saga-tag-sub {
              color: #475569 !important;
            }
          </style>

          ${mapNodesHtml}
        </div>
      </div>
    `;

    grid.innerHTML = sagaMapWrapper;
    return;
  }

  // Cards List View Mode
  const cardsHeaderHtml = document.createElement('div');
  cardsHeaderHtml.style.cssText = 'grid-column: 1 / -1; width: 100%;';
  cardsHeaderHtml.innerHTML = viewSwitcherHtml;
  grid.appendChild(cardsHeaderHtml);

  uniqueLessonKeys.forEach((lessonKey, idx) => {
    const sliceWords = lessonGroups[lessonKey] || [];
    const wordsCount = sliceWords.length;
    if (wordsCount === 0) return;

    const isUnlocked = isRoadmapLessonUnlocked(activeHskVersion, activeLessonsLevel, lessonKey, uniqueLessonKeys);
    const prevKey = idx > 0 ? uniqueLessonKeys[idx - 1] : null;

    // Retrieve title and desc directly from the first word of the group
    const firstWord = sliceWords[0];
    const title = cleanLessonTitle(firstWord.lessonTitle || firstWord.category, lessonKey);
    const desc = firstWord.lessonDesc || `Ôn tập từ vựng bài học HSK Cấp ${activeLessonsLevel}`;
    const badgeLevelStr = activeLessonsLevel === '7-9' ? '7-8-9' : activeLessonsLevel;

    const card = document.createElement('div');
    card.className = `lesson-card glass-panel cartoon-lesson-card ${!isUnlocked ? 'lesson-card-locked' : ''}`;
    if (!isUnlocked) {
      card.style.opacity = '0.85';
      card.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    }

    card.innerHTML = `
      <div class="lesson-card-header">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
          <span class="lesson-badge hsk-badge-${Math.min(activeLessonsLevel === '7-9' ? 6 : Number(activeLessonsLevel), 6)}">HSK ${badgeLevelStr} (${activeHskVersion}) • ${firstWord.category || ('Bài ' + lessonKey)}</span>
          ${!isUnlocked ? `
            <span style="font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 99px; background: rgba(245, 158, 11, 0.18); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); display: inline-flex; align-items: center; gap: 4px;">
              <i class="fa-solid fa-lock" style="font-size: 0.65rem;"></i> Khóa
            </span>
          ` : ''}
        </div>
        <h3 class="lesson-title" style="margin-top: 8px; font-family: var(--font-display); font-size: 1.3rem;">${!isUnlocked ? '<i class="fa-solid fa-lock" style="font-size: 0.9rem; color: #fbbf24; margin-right: 6px;"></i>' : ''}${title}</h3>
        <p class="lesson-desc">${desc}</p>
      </div>
      <div class="lesson-modules-grid">
        <button class="lesson-mod-btn mod-vocab" onclick="event.stopPropagation(); ${isUnlocked ? `window.openLessonVocabStudy('${lessonKey}')` : `showToast('Bạn cần hoàn thành Bài ${prevKey} để mở khóa!', true)`}">
          <i class="fa-solid ${isUnlocked ? 'fa-book-bookmark' : 'fa-lock'}"></i>
          <span>Từ Vựng</span>
          <small>${wordsCount} từ</small>
        </button>
        <button class="lesson-mod-btn mod-grammar" style="position: relative;" onclick="event.stopPropagation(); ${isUnlocked ? `window.openLessonGrammarStudy('${lessonKey}')` : `showToast('Bạn cần hoàn thành Bài ${prevKey} để mở khóa!', true)`}">
          <i class="fa-solid ${isUnlocked ? 'fa-spell-check' : 'fa-lock'}"></i>
          <span>Ngữ Pháp</span>
          <small style="background: linear-gradient(135deg, #0284c7, #2563eb); color: #fff; padding: 1px 8px; border-radius: 99px; font-weight: 700;">Học Ngữ Pháp 📖</small>
        </button>
        <button class="lesson-mod-btn mod-text" onclick="event.stopPropagation(); ${isUnlocked ? `window.openLessonTextStudy('${lessonKey}')` : `showToast('Bạn cần hoàn thành Bài ${prevKey} để mở khóa!', true)`}">
          <i class="fa-solid ${isUnlocked ? 'fa-comments' : 'fa-lock'}"></i>
          <span>Bài Khóa</span>
          <small style="background: #0284c7; color: #fff; padding: 1px 6px; border-radius: 99px; font-weight: 700;">Hội thoại 📖</small>
        </button>
        <button class="lesson-mod-btn mod-review" style="opacity: 0.85; position: relative;" onclick="event.stopPropagation(); window.showComingSoonNotice('Ôn Tập')">
          <i class="fa-solid fa-circle-play"></i>
          <span>Ôn Tập</span>
          <small style="background: rgba(0,0,0,0.25); color: #fff; padding: 1px 6px; border-radius: 99px; font-weight: 700;">Sắp ra mắt</small>
        </button>
      </div>
    `;

    card.addEventListener('click', () => {
      if (!isUnlocked) {
        showToast(`🔒 Bạn cần hoàn thành Bài ${prevKey} để mở khóa Bài ${lessonKey}!`, true);
        return;
      }
      startLessonStudy({ id: lessonKey, title }, sliceWords);
    });

    grid.appendChild(card);
  });
}

let isLessonVocabStudyMode = false;
let currentLessonVocabIndex = 0;
let currentLessonVocabWords = [];
let currentLessonTitleStr = '';

function renderLessonHeroCardContent(w, index, total) {
  if (!w) return `<div style="text-align: center; padding: 40px; font-size: 1.1rem; color: #94a3b8;">Chưa có từ vựng</div>`;

  const char = w.word || w.simplified || w.character || w.hanzi || '';
  const pinyin = w.pinyin || '';
  const rawMeaning = w.meaning || w.definition || w.vietnamese || '';
  const meaning = cleanMeaningText(rawMeaning);
  const extractedNote = extractNoteFromMeaning(rawMeaning);
  const noteText = w.note || w.explanation || extractedNote;

  const hanviet = w.hanViet || w.han_viet || '';
  const category = w.category || w.pos || w.type || 'Từ vựng';

  // Extract all Chinese example sentences
  const rawExamplesZh = (w.example_zh || w.example_cn || w.example || w.sentence || '').split(/(?<=[！!?。\n])\s*/).map(s => s.trim()).filter(Boolean);
  const rawExamplesPy = (w.example_pinyin || w.examplePy || w.examplePinyin || '').split(/(?<=[!?.])\s*/).map(s => s.trim()).filter(Boolean);
  const rawExamplesVi = (w.example_vi || w.example_vietnamese || w.exampleVi || '').split(/(?<=[!?.])\s*/).map(s => s.trim()).filter(Boolean);

  // Align exercise prompt and target answer
  let exercisePrompt = meaning;
  let targetAnswer = char;

  if (w.question && w.answer && String(w.question).trim() !== '') {
    exercisePrompt = String(w.question).trim();
    targetAnswer = String(w.answer).trim();
  } else if (rawExamplesZh.length > 0 && rawExamplesVi.length > 0 && rawExamplesVi[0] && rawExamplesVi[0] !== meaning && rawExamplesVi[0] !== w.question) {
    exercisePrompt = rawExamplesVi[0];
    targetAnswer = rawExamplesZh[0];
  } else {
    exercisePrompt = meaning;
    targetAnswer = char;
  }

  // Valid typing answers
  const validAnswers = [targetAnswer, char, ...rawExamplesZh];
  if (w.answer) validAnswers.push(w.answer);
  const validAnswersJson = JSON.stringify(validAnswers).replace(/'/g, "\\'").replace(/"/g, '&quot;');

  // Hint cards matching targetAnswer
  const hintChars = targetAnswer.match(/[\u4e00-\u9fa5]/g) || [targetAnswer.charAt(0)];

  // Render all example sentences inside the VÍ DỤ MINH HỌA box
  const fallbackTranslations = {
    '大家好': 'Chào mọi người',
    '你们好': 'Chào các bạn',
    '我不是老师': 'Tôi không phải là giáo viên.',
    '老师好': 'Chào Thầy/Cô (giáo viên)!',
    '学生们': 'Các bạn học sinh'
  };

  const examplesHtml = rawExamplesZh.length > 0 ? rawExamplesZh.map((zh, i) => {
    let cleanVi = rawExamplesVi[i] || '';
    if (!cleanVi || cleanVi === meaning || (w.question && cleanVi === w.question && zh.trim() !== String(w.answer).trim())) {
      cleanVi = fallbackTranslations[zh.trim()] || (w.example_vi && w.example_vi !== meaning && w.example_vi !== w.question ? w.example_vi : '');
    }
    return `
      <div style="${i > 0 ? 'margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.12);' : ''}">
        <div style="font-size: 1.15rem; font-weight: 800; color: #ffffff; font-family: var(--font-display); margin-bottom: 2px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <span>${zh}</span>
          <button onclick="window.speakLessonWord('${zh.replace(/'/g, "\\'")}')" style="background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59,130,246,0.4); color: #60a5fa; cursor: pointer; font-size: 0.78rem; border-radius: 6px; padding: 2px 8px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;" title="Nghe câu này">
            <i class="fa-solid fa-volume-high"></i> Nghe
          </button>
        </div>
        ${rawExamplesPy[i] ? `<div style="font-size: 0.9rem; font-weight: 700; color: #60a5fa; margin-bottom: 2px;">${rawExamplesPy[i]}</div>` : ''}
        ${cleanVi ? `<div style="font-size: 0.88rem; color: #cbd5e1; font-weight: 500;">${cleanVi}</div>` : ''}
      </div>
    `;
  }).join('') : '';

  return `
    <div style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
      <!-- Top Grid: Stroke Box + Vocab Info -->
      <div style="display: flex; gap: 28px; align-items: flex-start; flex-wrap: wrap; width: 100%;">
        <!-- Left: Stroke Writer Container -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; min-width: 150px; margin: 0 auto;">
          <div id="lesson-hanzi-writer-box" style="width: 150px; height: 150px; background: rgba(255,255,255,0.06); border: 2px solid rgba(255,255,255,0.18); border-radius: 18px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; box-shadow: inset 0 0 20px rgba(0,0,0,0.2);">
            <div style="font-size: 4rem; font-weight: 800; font-family: var(--font-display); color: var(--text-primary);">${char}</div>
          </div>
          <button class="btn btn-sm btn-outline-primary" onclick="window.replayLessonHanziStrokes()" style="border-radius: 10px; font-size: 0.82rem; font-weight: 700; padding: 6px 14px; gap: 6px; display: flex; align-items: center;">
            <i class="fa-solid fa-pen-nib"></i> Phát lại nét
          </button>
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 2px;">
            <button class="stage-mini-nav-btn" onclick="window.navigateLessonFlashcard(-1)" title="Thẻ trước (←)" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); color: #60a5fa; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; transition: all 0.2s;" onmouseenter="this.style.background='rgba(59,130,246,0.4)'; this.style.transform='scale(1.08)';" onmouseleave="this.style.background='rgba(59,130,246,0.2)'; this.style.transform='scale(1)';">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <div style="font-size: 0.82rem; font-weight: 700; color: #60a5fa; background: rgba(59, 130, 246, 0.15); padding: 4px 12px; border-radius: 99px; border: 1px solid rgba(59, 130, 246, 0.3); white-space: nowrap;">
              Thẻ ${index + 1} / ${total}
            </div>
            <button class="stage-mini-nav-btn" onclick="window.navigateLessonFlashcard(1)" title="Thẻ tiếp theo (→)" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); color: #60a5fa; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; transition: all 0.2s;" onmouseenter="this.style.background='rgba(59,130,246,0.4)'; this.style.transform='scale(1.08)';" onmouseleave="this.style.background='rgba(59,130,246,0.2)'; this.style.transform='scale(1)';">
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- Right: Detailed Vocab Info -->
        <div style="flex: 1; min-width: 260px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 2.2rem; font-weight: 800; color: #3b82f6; font-family: var(--font-display);">${pinyin}</span>
              <button class="top-circle-btn" onclick="window.speakLessonWord('${char.replace(/'/g, "\\'")}')" title="Nghe phát âm" style="width: 38px; height: 38px; background: rgba(59, 130, 246, 0.2); color: #3b82f6; border-color: rgba(59,130,246,0.4);">
                <i class="fa-solid fa-volume-high"></i>
              </button>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button id="hero-star-toggle-btn" class="hero-star-btn ${w.isStarred ? 'active' : ''}" onclick="window.toggleLessonWordStar('${w.id}')" title="${w.isStarred ? 'Bỏ yêu thích (Xóa khỏi Sổ tay cá nhân)' : 'Yêu thích (Tự động lưu vào Sổ tay cá nhân)'}">
                <i class="${w.isStarred ? 'fa-solid' : 'fa-regular'} fa-star"></i>
                <span id="hero-star-btn-label">${w.isStarred ? 'Đã lưu sổ tay' : 'Lưu vào sổ tay'}</span>
              </button>
              <span class="hero-info-badge" style="font-size: 0.82rem; padding: 4px 10px;">${category}</span>
              <span class="hero-info-badge" style="font-size: 0.82rem; padding: 4px 10px; background: rgba(168, 85, 247, 0.18); border-color: rgba(168, 85, 247, 0.35); color: #c084fc;">HSK ${activeLessonsLevel}</span>
              <button class="card-fullscreen-quick-btn ${isFlashcardFullscreen ? 'active-fullscreen' : ''}" onclick="window.toggleFlashcardFullscreen()" title="${isFlashcardFullscreen ? 'Thu nhỏ (Phím F hoặc Esc)' : 'Phóng to toàn màn hình (Phím F)'}">
                <i class="fa-solid ${isFlashcardFullscreen ? 'fa-compress' : 'fa-expand'}"></i>
              </button>
            </div>
          </div>

          <div style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin-bottom: 10px;">
            ${meaning} ${hanviet ? `<span style="font-size: 1rem; color: #3b82f6; font-weight: 700;">(${hanviet})</span>` : ''}
          </div>

          ${noteText ? `
            <div style="font-size: 0.88rem; color: var(--text-secondary); background: rgba(255,255,255,0.05); padding: 10px 14px; border-radius: 12px; margin-bottom: 12px; border-left: 3px solid #3b82f6;">
              <i class="fa-solid fa-circle-info" style="color: #3b82f6; margin-right: 6px;"></i> ${noteText}
            </div>
          ` : ''}

          <!-- VÍ DỤ MINH HỌA -->
          ${rawExamplesZh.length > 0 ? `
            <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 14px; margin-top: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.2);">
              <div style="font-size: 0.82rem; font-weight: 800; color: #60a5fa; text-transform: uppercase; margin-bottom: 8px;">
                <i class="fa-solid fa-image"></i> VÍ DỤ MINH HỌA (${rawExamplesZh.length} ví dụ):
              </div>
              ${examplesHtml}
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Bottom Full Width Container: DỊCH SANG TIẾNG TRUNG (Typing & Hint Cards) -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.12); border-radius: 18px; padding: 18px 20px; width: 100%; box-sizing: border-box; box-shadow: 0 6px 20px rgba(0,0,0,0.25);">
        <div style="font-size: 0.95rem; font-weight: 800; color: #38bdf8; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span><i class="fa-solid fa-language"></i> Dịch sang tiếng Trung: <span style="color: #ffffff; font-weight: 800;">"${exercisePrompt}"</span></span>
            <button onclick="window.speakText('${targetAnswer.replace(/'/g, "\\'")}')" class="btn btn-sm" style="background: rgba(56, 189, 248, 0.18); border: 1.5px solid rgba(56, 189, 248, 0.4); color: #38bdf8; border-radius: 10px; padding: 3px 10px; font-size: 0.82rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: all 0.2s;" title="Nghe phát âm câu dịch mẫu" onmouseover="this.style.background='rgba(56, 189, 248, 0.3)'" onmouseout="this.style.background='rgba(56, 189, 248, 0.18)'">
              <i class="fa-solid fa-volume-high"></i> Nghe
            </button>
          </div>
          <div id="lesson-typing-feedback"></div>
        </div>

        <input type="text" id="lesson-typing-input" placeholder="Gõ chữ Hán hoặc câu ví dụ vào đây..." oninput="window.checkLessonTypingInput(${validAnswersJson})" style="width: 100%; padding: 12px 16px; background: rgba(0,0,0,0.4); border: 2px solid rgba(255,255,255,0.2); border-radius: 14px; color: #ffffff; font-size: 1.1rem; font-weight: 700; outline: none; transition: all 0.2s; margin-bottom: 14px; box-sizing: border-box;" />

        <!-- Eye-icon Character Hint Cards (Real-time typed validation) -->
        <div id="lesson-char-hints-container" data-target="${targetAnswer.replace(/'/g, "\\'").replace(/"/g, '&quot;')}" style="display: flex; gap: 10px; justify-content: center; margin-bottom: 14px; flex-wrap: wrap;">
          ${hintChars.map((c, i) => `
            <div class="lesson-hint-card" data-char="${c.replace(/'/g, "\\'")}" onclick="window.toggleLessonCharHint(this, '${c.replace(/'/g, "\\'")}')" title="Bấm để hiện chữ" style="width: 52px; height: 68px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #94a3b8; font-size: 1.2rem; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform='translateY(0)'">
              <i class="fa-solid fa-eye"></i>
            </div>
          `).join('')}
        </div>

        <button id="lesson-toggle-all-hints-btn" onclick="window.revealAllLessonCharHints('${targetAnswer.replace(/'/g, "\\'")}')" style="width: 100%; background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: #ffffff; font-weight: 800; font-size: 0.95rem; padding: 12px; border-radius: 14px; cursor: pointer; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4); transition: all 0.2s; letter-spacing: 0.5px;" onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform='scale(1)'">
          <i class="fa-solid fa-eye" style="margin-right: 6px;"></i> HIỆN GỢI Ý MẪU
        </button>
      </div>
    </div>
  `;
}

function renderLessonStepperNav(currentStep, lessonId, lessonTitle) {
  const numId = parseInt(String(lessonId).replace(/\D/g, ''), 10) || 1;
  const currentLvl = activeLessonsCurriculum === 'yct' ? activeYctLevel : (activeLessonsLevel || 1);
  const currentVer = activeLessonsCurriculum === 'yct' ? 'yct' : (activeHskVersion || activeRoadmapVersion || '3.0');
  const titleDisplay = lessonTitle ? cleanLessonTitle(lessonTitle, numId) : `Bài ${numId}`;
  const prevLessonNum = numId > 1 ? numId - 1 : null;
  const nextLessonNum = numId + 1;

  return `
    <div class="lesson-stepper-hub-bar">
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <button onclick="window.returnToLessonsMap()" class="btn btn-secondary" style="padding: 8px 12px; border-radius: 12px; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); color: #cbd5e1; cursor: pointer;" title="Quay về Bản đồ Lộ trình">
          <i class="fa-solid fa-map-location-dot"></i> <span class="nav-btn-label">Lộ trình</span>
        </button>

        ${prevLessonNum ? `
          <button onclick="window.goToPrevLesson(${numId})" class="prev-lesson-hub-btn" title="Chuyển sang Bài ${prevLessonNum}">
            <i class="fa-solid fa-arrow-left"></i> <span>Bài ${prevLessonNum}</span>
          </button>
        ` : ''}

        <div style="font-weight: 800; font-size: 1.02rem; color: #fbbf24; font-family: var(--font-display, sans-serif); display: flex; align-items: center; gap: 6px; padding: 0 4px;">
          <i class="fa-solid fa-bookmark" style="color: #38bdf8;"></i> ${titleDisplay}
        </div>

        <button onclick="window.goToNextLesson(${numId})" class="next-lesson-hub-btn" title="Chuyển sang Bài ${nextLessonNum}">
          <span>Bài ${nextLessonNum}</span> <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <!-- 4 Step Tabs -->
      <div class="lesson-stepper-tabs">
        <button onclick="window.goToLessonStep('vocab', '${numId}')" class="stepper-tab-btn ${currentStep === 'vocab' ? 'active active-vocab' : ''}" data-step="vocab" title="Bước 1: Học từ vựng Flashcard">
          <i class="fa-solid fa-book-bookmark"></i> 1. Từ Vựng
        </button>
        <button onclick="window.goToLessonStep('grammar', '${numId}')" class="stepper-tab-btn ${currentStep === 'grammar' ? 'active active-grammar' : ''}" data-step="grammar" title="Bước 2: Học cấu trúc ngữ pháp">
          <i class="fa-solid fa-spell-check"></i> 2. Ngữ Pháp
        </button>
        <button onclick="window.goToLessonStep('text', '${numId}')" class="stepper-tab-btn ${currentStep === 'text' ? 'active active-text' : ''}" data-step="text" title="Bước 3: Luyện đọc & nghe bài khóa">
          <i class="fa-solid fa-comments"></i> 3. Bài Khóa
        </button>
        <button onclick="window.goToLessonStep('quiz', '${numId}')" class="stepper-tab-btn ${currentStep === 'quiz' ? 'active active-quiz' : ''}" data-step="quiz" title="Bước 4: Làm bài tập ôn tập trắc nghiệm">
          <i class="fa-solid fa-circle-play"></i> 4. Ôn Tập
        </button>
      </div>

      <!-- Action Button (Toggle Toolbar Only) -->
      <div style="display: flex; align-items: center;">
        <button id="toggle-toolbar-btn" class="stepper-action-btn" onclick="window.toggleLessonToolbar()" title="Ẩn/Hiện thanh công cụ (Phím T)" style="color: #38bdf8;">
          <i class="fa-solid fa-chevron-up"></i>
        </button>
      </div>
    </div>
  `;
}

window.renderLessonStepperNav = renderLessonStepperNav;

window.toggleLessonToolbar = function() {
  window._isStepperBarCollapsed = !window._isStepperBarCollapsed;
  const bar = document.querySelector('.lesson-stepper-hub-bar');
  const btn = document.getElementById('toggle-toolbar-btn');
  if (bar) {
    bar.classList.toggle('toolbar-collapsed', window._isStepperBarCollapsed);
  }
  if (btn) {
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = `fa-solid ${window._isStepperBarCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}`;
    }
    btn.title = window._isStepperBarCollapsed ? 'Hiện thanh công cụ (Phím T)' : 'Ẩn thanh công cụ (Phím T)';
  }
  if (typeof showToast === 'function') {
    showToast(window._isStepperBarCollapsed ? 'Đã thu gọn thanh công cụ (Phím T để mở)' : 'Đã hiện thanh công cụ');
  }
};

window.goToNextLesson = function(currentLessonNum) {
  const num = parseInt(String(currentLessonNum).replace(/\D/g, ''), 10) || 1;
  const nextLessonId = num + 1;
  const currentLvl = activeLessonsCurriculum === 'yct' ? activeYctLevel : (activeLessonsLevel || 1);

  const levelVocabs = vocabList.filter(w => {
    if (w.isCustom) return false;
    if (w.curriculum === 'yct' || w.hskVersion === 'yct') return false;
    if (!matchLevel(w.level, currentLvl)) return false;
    if ((w.hskVersion || '3.0') !== activeHskVersion) return false;
    return true;
  });

  const nextWords = levelVocabs.filter(w => String(w.lessonId || 1) === String(nextLessonId));
  if (nextWords.length === 0) {
    // Check if there are any higher lesson numbers
    const higherWords = levelVocabs.filter(w => (parseInt(String(w.lessonId || 1).replace(/\D/g, ''), 10) || 1) > num);
    if (higherWords.length > 0) {
      const nextFoundId = parseInt(String(higherWords[0].lessonId || 1).replace(/\D/g, ''), 10) || (num + 1);
      if (typeof window.clearScreenDrawing === 'function') window.clearScreenDrawing();
      window.openLessonVocabStudy(nextFoundId);
    } else {
      showToast(`🎉 Bạn đã hoàn thành bài cuối cùng của Cấp độ HSK ${currentLvl}!`);
    }
    return;
  }

  if (typeof window.clearScreenDrawing === 'function') {
    window.clearScreenDrawing();
  }

  window.openLessonVocabStudy(nextLessonId);
  showToast(`🚀 Đã chuyển sang Bài ${nextLessonId}`);
};

window.goToPrevLesson = function(currentLessonNum) {
  const num = parseInt(String(currentLessonNum).replace(/\D/g, ''), 10) || 1;
  if (num <= 1) {
    showToast('Đây là bài học đầu tiên của cấp độ này!');
    return;
  }
  const prevLessonId = num - 1;

  if (typeof window.clearScreenDrawing === 'function') {
    window.clearScreenDrawing();
  }

  window.openLessonVocabStudy(prevLessonId);
  showToast(`⬅️ Đã chuyển về Bài ${prevLessonId}`);
};

window.toggleLessonWordStar = async function(wordId) {
  const targetId = wordId || (currentLessonVocabWords[currentLessonVocabIndex] ? currentLessonVocabWords[currentLessonVocabIndex].id : null);
  if (!targetId) return;

  const w = vocabList.find(item => item.id === targetId);
  const nextStarred = w ? !w.isStarred : true;

  // Call the core toggleWordStarred function
  await toggleWordStarred(targetId);

  // Sync state in memory for lesson words
  if (currentLessonVocabWords) {
    const localWord = currentLessonVocabWords.find(item => item.id === targetId);
    if (localWord) localWord.isStarred = nextStarred;
  }

  // Update hero star button UI if this word is currently displayed
  const currentWord = currentLessonVocabWords[currentLessonVocabIndex];
  if (currentWord && currentWord.id === targetId) {
    const heroBtn = document.getElementById('hero-star-toggle-btn');
    if (heroBtn) {
      if (nextStarred) {
        heroBtn.classList.add('active');
        heroBtn.innerHTML = `<i class="fa-solid fa-star"></i> <span id="hero-star-btn-label">Đã lưu sổ tay</span>`;
        heroBtn.title = 'Bỏ yêu thích (Xóa khỏi Sổ tay cá nhân)';
      } else {
        heroBtn.classList.remove('active');
        heroBtn.innerHTML = `<i class="fa-regular fa-star"></i> <span id="hero-star-btn-label">Lưu vào sổ tay</span>`;
        heroBtn.title = 'Yêu thích (Tự động lưu vào Sổ tay cá nhân)';
      }
    }
  }

  // Update mini cards UI
  const miniCards = document.querySelectorAll('.mini-rad-card');
  currentLessonVocabWords.forEach((item, idx) => {
    if (item.id === targetId && miniCards[idx]) {
      const miniStarBtn = miniCards[idx].querySelector('.mini-card-star-btn');
      if (miniStarBtn) {
        if (nextStarred) {
          miniStarBtn.classList.add('active');
          miniStarBtn.innerHTML = `<i class="fa-solid fa-star"></i>`;
          miniStarBtn.title = 'Bỏ yêu thích (Xóa khỏi Sổ tay cá nhân)';
        } else {
          miniStarBtn.classList.remove('active');
          miniStarBtn.innerHTML = `<i class="fa-regular fa-star"></i>`;
          miniStarBtn.title = 'Yêu thích (Tự động lưu vào Sổ tay cá nhân)';
        }
      }
    }
  });
};

window.goToLessonStep = function(step, lessonId) {
  if (!currentUser) {
    window.openAuthRequiredModal();
    return;
  }
  const numId = parseInt(String(lessonId).replace(/\D/g, ''), 10) || 1;
  const currentLvl = activeLessonsCurriculum === 'yct' ? activeYctLevel : (activeLessonsLevel || 1);
  const currentVer = activeLessonsCurriculum === 'yct' ? 'yct' : (activeHskVersion || activeRoadmapVersion || '3.0');

  // Close modals if open
  const grammarModal = document.getElementById('lesson-grammar-popup-modal');
  if (grammarModal && step !== 'grammar') grammarModal.style.display = 'none';

  const detailModal = document.getElementById('lesson-detail-popup-modal');
  if (detailModal) detailModal.style.display = 'none';

  if (step === 'vocab') {
    window.openLessonVocabStudy(numId);
  } else if (step === 'grammar') {
    window.openLessonGrammarModal(numId);
  } else if (step === 'text') {
    window.location.href = `/lesson-texts.html?lesson=${numId}&level=${currentLvl}&version=${currentVer}`;
  } else if (step === 'quiz') {
    window.location.href = `/quiz-game.html?lesson=${numId}&level=${currentLvl}&version=${currentVer}`;
  }
};

window.returnToLessonsMap = function() {
  const modal = document.getElementById('lesson-detail-modal');
  if (modal) {
    modal.classList.remove('active');
  }
  const studyView = document.getElementById('flashcard-study-view');
  if (studyView) {
    studyView.style.display = 'none';
  }
  const decksView = document.getElementById('decks-view');
  if (decksView) {
    decksView.style.display = 'block';
  }
  const roadmapSec = document.getElementById('roadmap-journey-section');
  if (roadmapSec) {
    roadmapSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

let isFlashcardFullscreen = false;

window.toggleFlashcardFullscreen = function(forceState) {
  const isDocFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
  const targetState = typeof forceState === 'boolean' ? forceState : (!isFlashcardFullscreen && !isDocFs);
  if (targetState) {
    window.enterFlashcardFullscreen();
  } else {
    window.exitFlashcardFullscreen(true);
  }
};

window.enterFlashcardFullscreen = function() {
  isFlashcardFullscreen = true;
  document.body.classList.add('flashcard-fullscreen-mode', 'app-fullscreen-mode');

  const studyView = document.getElementById('flashcard-study-view');
  if (studyView) {
    studyView.classList.add('fullscreen-flashcard-active');
  }

  const radicalView = document.getElementById('radical-study-workspace') || document.getElementById('radicals-flashcard-view');
  if (radicalView) {
    radicalView.classList.add('fullscreen-flashcard-active');
  }

  const docEl = document.documentElement;
  try {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      }
    }
  } catch (e) {
    console.warn('Native fullscreen request ignored:', e);
  }

  updateFlashcardFullscreenButtons();
  if (typeof showToast === 'function') {
    showToast('Đã mở toàn màn hình (Bấm nút trong thẻ, phím F hoặc Esc để thu nhỏ) ⛶');
  }
};

window.exitFlashcardFullscreen = function(callDocExit = true) {
  isFlashcardFullscreen = false;
  document.body.classList.remove('flashcard-fullscreen-mode', 'app-fullscreen-mode');

  const studyView = document.getElementById('flashcard-study-view');
  if (studyView) {
    studyView.classList.remove('fullscreen-flashcard-active');
  }

  const radicalView = document.getElementById('radical-study-workspace') || document.getElementById('radicals-flashcard-view');
  if (radicalView) {
    radicalView.classList.remove('fullscreen-flashcard-active');
  }

  if (callDocExit) {
    const isDocFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (isDocFs) {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } catch (e) {
        console.warn('Native exit fullscreen ignored:', e);
      }
    }
  }

  updateFlashcardFullscreenButtons();
};

function updateFlashcardFullscreenButtons() {
  const isDocFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
  const activeState = isFlashcardFullscreen || isDocFs;

  const allFullscreenBtns = document.querySelectorAll('.card-fullscreen-quick-btn, #radical-top-fullscreen-btn, #radical-fullscreen-toggle-btn');
  allFullscreenBtns.forEach(btn => {
    btn.classList.toggle('active-fullscreen', activeState);
    const label = btn.querySelector('.fs-btn-label');
    if (label) {
      label.textContent = activeState ? 'Thu Nhỏ' : 'Toàn Màn Hình';
    }
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = `fa-solid ${activeState ? 'fa-compress' : 'fa-expand'}`;
    }
    btn.title = activeState ? 'Thu nhỏ toàn màn hình (Phím Esc)' : 'Phóng to toàn màn hình (Phím F)';
  });
}

function renderLessonFlashcardWorkspace(lessonTitle, words, selectedIndex = 0) {
  currentLessonTitleStr = lessonTitle;
  currentLessonVocabWords = words || [];
  currentLessonVocabIndex = Math.max(0, Math.min(selectedIndex, currentLessonVocabWords.length - 1));

  const studyView = document.getElementById('flashcard-study-view');
  if (!studyView) return;

  const currentWord = currentLessonVocabWords[currentLessonVocabIndex];
  const firstWord = currentLessonVocabWords[0];
  const currentLessonIdNum = (firstWord && firstWord.lessonId) ? parseInt(String(firstWord.lessonId).replace(/\D/g, ''), 10) : 1;

  // Auto-mark word as studied and memorized when viewed to increase lesson progress
  if (currentWord) {
    markLessonWordMemorized(currentWord.id);
  }

  studyView.innerHTML = `
    <!-- Top Unified Lesson Stepper Bar -->
    ${renderLessonStepperNav('vocab', currentLessonIdNum, currentLessonTitleStr)}

    <!-- Hero Flashcard Stage (EXACTLY IMAGE 4) -->
    <div class="hero-stage-wrapper">
      <button class="stage-arrow-btn" onclick="window.navigateLessonFlashcard(-1)" title="Thẻ trước (&larr;)">
        <i class="fa-solid fa-chevron-left"></i>
      </button>

      <div class="hero-flashcard-card" id="hero-flashcard-card">
        ${renderLessonHeroCardContent(currentWord, currentLessonVocabIndex, currentLessonVocabWords.length)}
      </div>

      <button class="stage-arrow-btn" onclick="window.navigateLessonFlashcard(1)" title="Thẻ tiếp theo (&rarr;)">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>

    <!-- Bottom Carousel / Mini Cards Grid (EXACTLY IMAGE 4) -->
    <div class="bottom-list-card">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; flex-wrap: wrap; gap: 8px;">
        <div style="font-size: 1.15rem; font-weight: 800; color: #3b82f6; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-list-ul"></i> Danh sách từ vựng ( <span style="color: #60a5fa; font-weight: 800;">${currentLessonVocabWords.length} từ</span> )
        </div>

        <div style="font-size: 0.85rem; font-weight: 600; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-keyboard"></i> Phím &larr; &rarr; để đổi thẻ | Spacebar nghe đọc | Phím S lưu sổ tay ⭐
        </div>
      </div>

      <div class="mini-cards-grid">
        ${currentLessonVocabWords.map((w, idx) => `
          <div class="mini-rad-card ${idx === currentLessonVocabIndex ? 'active' : ''}" onclick="window.selectLessonFlashcardIndex(${idx})" style="position: relative;">
            <button class="mini-card-star-btn ${w.isStarred ? 'active' : ''}" onclick="event.stopPropagation(); window.toggleLessonWordStar('${w.id}');" title="${w.isStarred ? 'Bỏ yêu thích (Xóa khỏi Sổ tay cá nhân)' : 'Yêu thích (Tự động lưu vào Sổ tay cá nhân)'}">
              <i class="${w.isStarred ? 'fa-solid' : 'fa-regular'} fa-star"></i>
            </button>
            <div style="font-size: 1.6rem; font-weight: 800; font-family: var(--font-display); line-height: 1.2; margin-bottom: 4px; color: var(--text-primary);">
              ${w.word || w.simplified || w.character || w.hanzi || ''}
            </div>
            <div style="font-size: 0.85rem; font-weight: 700; color: #3b82f6; margin-bottom: 2px;">
              ${w.pinyin || ''}
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${w.meaning || w.definition || w.vietnamese || w.hanViet || ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Bottom Seamless Step Action Bar -->
    <div style="background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(16, 185, 129, 0.15)); border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 20px; padding: 18px 24px; margin-top: 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
      <div>
        <div style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">
          <i class="fa-solid fa-circle-check" style="color: #34d399;"></i> Đang Ở Bước 1: Từ Vựng (Bài ${currentLessonIdNum})
        </div>
        <div style="font-size: 1.12rem; font-weight: 800; color: #ffffff; font-family: var(--font-display);">
          Học xong từ vựng? Chọn bước tiếp theo:
        </div>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button onclick="window.returnToLessonsMap()" class="btn btn-secondary" style="padding: 12px 18px; border-radius: 14px; font-weight: 700; font-size: 0.92rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #cbd5e1; cursor: pointer;">
          <i class="fa-solid fa-arrow-left"></i> Lộ Trình
        </button>
        <button onclick="window.goToLessonStep('grammar', '${currentLessonIdNum}')" class="btn btn-primary" style="padding: 12px 20px; border-radius: 14px; font-weight: 800; font-size: 0.92rem; background: linear-gradient(135deg, #0284c7, #2563eb); border: none; color: #ffffff; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 6px 20px rgba(37,99,235,0.45); transition: all 0.2s;">
          <span>2. Học Ngữ Pháp</span> <i class="fa-solid fa-spell-check"></i>
        </button>
        <button onclick="window.goToNextLesson(${currentLessonIdNum})" class="next-lesson-big-btn" title="Chuyển nhanh sang từ vựng bài tiếp theo không cần quay lại lộ trình">
          <span>Sang Bài ${currentLessonIdNum + 1}</span> <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  `;

  // Attach HanziWriter
  if (currentWord && (currentWord.word || currentWord.simplified || currentWord.character)) {
    setTimeout(() => {
      initLessonHanziWriter(currentWord.word || currentWord.simplified || currentWord.character);
    }, 50);
  }
}

// fullscreenchange listeners được xử lý bởi screen_drawing.js universal handler

// Event delegation và keydown được xử lý duy nhất bởi screen_drawing.js (universal handler)
// để tránh double-fire khi cả hai file cùng lắng nghe

// Đồng bộ: screen_drawing.js sẽ gọi window.toggleAppFullscreen().
// Chúng ta redirect nó về hàm canonical của main.js để dùng chung 1 state duy nhất.
window.toggleAppFullscreen = window.toggleFlashcardFullscreen;
window.enterAppFullscreen = window.enterFlashcardFullscreen;
window.exitAppFullscreen = window.exitFlashcardFullscreen;


window.returnToLessonsMap = function() {
  if (isFlashcardFullscreen) {
    window.exitFlashcardFullscreen(true);
  }
  isLessonVocabStudyMode = false;
  switchTab('lessons');
};

window.toggleLessonCharHint = function(btnEl, char) {
  if (!btnEl) return;
  const isFlipped = btnEl.getAttribute('data-manual-flipped') === 'true';
  if (isFlipped) {
    btnEl.setAttribute('data-manual-flipped', 'false');
    btnEl.style.background = 'rgba(255,255,255,0.08)';
    btnEl.style.color = '#94a3b8';
    btnEl.style.border = '1px solid rgba(255,255,255,0.2)';
    btnEl.innerHTML = `<i class="fa-solid fa-eye"></i>`;
  } else {
    btnEl.setAttribute('data-manual-flipped', 'true');
    btnEl.style.background = '#ffffff';
    btnEl.style.color = '#0f172a';
    btnEl.style.border = '1px solid rgba(255,255,255,0.2)';
    btnEl.innerHTML = `<span style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-hanzi);">${char}</span>`;
  }
};

window.updateLessonCharHintCards = function(containerId, typedText, targetAnswer) {
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!container) return;

  const cards = container.querySelectorAll('.lesson-hint-card');
  if (cards.length === 0) return;

  const cleanTyped = (typedText || '').replace(/[.,!?:;="'"()\[\]{}，。！？；：\s\-_~`]/g, '');
  const cleanTarget = (targetAnswer || '').replace(/[.,!?:;="'"()\[\]{}，。！？；：\s\-_~`]/g, '');

  const typedChars = cleanTyped.match(/[\u4e00-\u9fa5]/g) || cleanTyped.split('');
  const targetChars = cleanTarget.match(/[\u4e00-\u9fa5]/g) || cleanTarget.split('');

  cards.forEach((card, idx) => {
    const targetChar = targetChars[idx] || card.getAttribute('data-char') || '';

    if (idx < typedChars.length) {
      const typedChar = typedChars[idx];
      if (typedChar === targetChar) {
        // Correct character for position idx: Auto-flip GREEN
        card.setAttribute('data-flipped', 'true');
        card.style.background = 'rgba(16, 185, 129, 0.25)';
        card.style.border = '2px solid #10b981';
        card.style.color = '#34d399';
        card.style.boxShadow = '0 0 16px rgba(16, 185, 129, 0.4)';
        card.innerHTML = `<span style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-hanzi);">${targetChar}</span>`;
      } else {
        // Wrong character typed for position idx: Do NOT flip character, show RED
        card.setAttribute('data-flipped', 'false');
        card.style.background = 'rgba(239, 68, 68, 0.25)';
        card.style.border = '2px solid #ef4444';
        card.style.color = '#f87171';
        card.style.boxShadow = '0 0 16px rgba(239, 68, 68, 0.4)';
        card.innerHTML = `<i class="fa-solid fa-eye" style="color: #f87171;"></i>`;
      }
    } else {
      // Position not typed yet
      const isManualFlipped = card.getAttribute('data-manual-flipped') === 'true';
      if (isManualFlipped) {
        card.style.background = '#ffffff';
        card.style.border = '1px solid rgba(255,255,255,0.2)';
        card.style.color = '#0f172a';
        card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        card.innerHTML = `<span style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-hanzi);">${targetChar}</span>`;
      } else {
        card.setAttribute('data-flipped', 'false');
        card.style.background = 'rgba(255,255,255,0.08)';
        card.style.border = '1px solid rgba(255,255,255,0.2)';
        card.style.color = '#94a3b8';
        card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        card.innerHTML = `<i class="fa-solid fa-eye"></i>`;
      }
    }
  });
};

window.revealAllLessonCharHints = function(fullWord) {
  const container = document.getElementById('lesson-char-hints-container');
  const toggleBtn = document.getElementById('lesson-toggle-all-hints-btn');
  if (!container) return;

  const cards = container.querySelectorAll('.lesson-hint-card');
  if (cards.length === 0) return;

  const allFlipped = Array.from(cards).every(c => c.getAttribute('data-flipped') === 'true');
  const chars = fullWord.match(/[\u4e00-\u9fa5]/g) || fullWord.split('');

  cards.forEach((card, idx) => {
    if (allFlipped) {
      card.setAttribute('data-flipped', 'false');
      card.setAttribute('data-manual-flipped', 'false');
      card.style.background = 'rgba(255,255,255,0.08)';
      card.style.color = '#94a3b8';
      card.style.border = '1px solid rgba(255,255,255,0.2)';
      card.innerHTML = `<i class="fa-solid fa-eye"></i>`;
    } else {
      if (chars[idx]) {
        card.setAttribute('data-flipped', 'true');
        card.setAttribute('data-manual-flipped', 'true');
        card.style.background = '#ffffff';
        card.style.color = '#0f172a';
        card.style.border = '1px solid rgba(255,255,255,0.2)';
        card.innerHTML = `<span style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-hanzi);">${chars[idx]}</span>`;
      }
    }
  });

  if (toggleBtn) {
    if (allFlipped) {
      toggleBtn.innerHTML = `<i class="fa-solid fa-eye" style="margin-right: 6px;"></i> HIỆN GỢI Ý MẪU`;
      toggleBtn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    } else {
      toggleBtn.innerHTML = `<i class="fa-solid fa-eye-slash" style="margin-right: 6px;"></i> ẨN GỢI Ý MẪU`;
      toggleBtn.style.background = 'linear-gradient(135deg, #64748b, #475569)';
    }
  }
};

window.checkLessonTypingInput = function(validAnswers) {
  const inputEl = document.getElementById('lesson-typing-input');
  const feedbackEl = document.getElementById('lesson-typing-feedback');
  if (!inputEl || !feedbackEl) return;

  const typed = inputEl.value.trim();
  const cleanTyped = typed.replace(/[.,!?:;="'"()\[\]{}，。！？；：\s\-_~`]/g, '').toLowerCase();

  if (!Array.isArray(validAnswers)) {
    validAnswers = [validAnswers];
  }

  // Target answer for real-time hint card status
  const container = document.getElementById('lesson-char-hints-container');
  const primaryTarget = container ? container.getAttribute('data-target') || validAnswers[0] : validAnswers[0];

  window.updateLessonCharHintCards('lesson-char-hints-container', typed, primaryTarget);

  // Check if typed string matches ANY valid answer
  const exactAnswer = validAnswers.find(ans => {
    if (!ans) return false;
    const cleanAns = ans.replace(/[.,!?:;="'"()\[\]{}，。！？；：\s\-_~`]/g, '').toLowerCase();
    return cleanTyped === cleanAns;
  });

  const isPartialMatch = validAnswers.some(ans => {
    if (!ans) return false;
    const cleanAns = ans.replace(/[.,!?:;="'"()\[\]{}，。！？；：\s\-_~`]/g, '').toLowerCase();
    return cleanAns.startsWith(cleanTyped) && cleanTyped.length > 0;
  });

  if (exactAnswer) {
    feedbackEl.innerHTML = `<span style="color: #10b981; font-weight: 800;"><i class="fa-solid fa-circle-check"></i> Chính xác!</span>`;
    inputEl.style.borderColor = '#10b981';
    window.speakLessonWord(typed);
  } else if (isPartialMatch) {
    feedbackEl.innerHTML = `<span style="color: #fbbf24; font-weight: 700;"><i class="fa-solid fa-pen"></i> Đang gõ...</span>`;
    inputEl.style.borderColor = '#fbbf24';
  } else if (typed.length > 0) {
    feedbackEl.innerHTML = `<span style="color: #ef4444; font-weight: 700;"><i class="fa-solid fa-circle-xmark"></i> Chưa đúng!</span>`;
    inputEl.style.borderColor = '#ef4444';
  } else {
    feedbackEl.innerHTML = '';
    inputEl.style.borderColor = 'rgba(255,255,255,0.2)';
  }
};

window.navigateLessonFlashcard = function(dir) {
  if (!currentLessonVocabWords || currentLessonVocabWords.length === 0) return;
  let nextIdx = currentLessonVocabIndex + dir;
  if (nextIdx < 0) nextIdx = currentLessonVocabWords.length - 1;
  if (nextIdx >= currentLessonVocabWords.length) nextIdx = 0;
  renderLessonFlashcardWorkspace(currentLessonTitleStr, currentLessonVocabWords, nextIdx);
};

window.selectLessonFlashcardIndex = function(idx) {
  if (!currentLessonVocabWords || !currentLessonVocabWords[idx]) return;
  renderLessonFlashcardWorkspace(currentLessonTitleStr, currentLessonVocabWords, idx);
};

window.speakLessonWord = function(text) {
  if (!text) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  }
};

let lessonWriterArray = [];

function initLessonHanziWriter(wordStr) {
  const box = document.getElementById('lesson-hanzi-writer-box');
  if (!box || !wordStr) return;
  box.innerHTML = '';
  lessonWriterArray = [];

  // Extract Chinese characters
  const chineseChars = wordStr.match(/[\u4e00-\u9fa5]/g) || [wordStr.charAt(0)];
  const numChars = chineseChars.length;

  // Dynamically calculate width based on character count
  const boxWidth = Math.min(numChars * 130 + (numChars - 1) * 8 + 16, 540);
  box.style.cssText = `width: ${boxWidth}px; height: 138px; background: rgba(255,255,255,0.06); border: 2px solid rgba(255,255,255,0.18); border-radius: 18px; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 8px; position: relative; overflow-x: auto; padding: 4px; box-shadow: inset 0 0 20px rgba(0,0,0,0.2); transition: all 0.3s ease;`;

  if (typeof HanziWriter !== 'undefined') {
    chineseChars.forEach((ch, idx) => {
      const charDiv = document.createElement('div');
      const divId = `lesson-hanzi-char-${idx}`;
      charDiv.id = divId;
      charDiv.style.cssText = 'width: 125px; height: 125px; flex-shrink: 0; background: transparent; display: flex; align-items: center; justify-content: center;';
      box.appendChild(charDiv);

      const isDark = document.documentElement.classList.contains('dark');
      try {
        const writer = HanziWriter.create(divId, ch, {
          width: 120,
          height: 120,
          padding: 4,
          strokeColor: isDark ? '#38bdf8' : '#2563eb',
          radicalColor: '#ef4444',
          outlineColor: isDark ? '#475569' : '#94a3b8',
          showOutline: true,
          showCharacter: true
        });
        lessonWriterArray.push(writer);
      } catch (e) {
        charDiv.innerHTML = `<div style="font-size: 3.2rem; font-weight: 800; font-family: var(--font-display); color: var(--text-primary);">${ch}</div>`;
      }
    });

    // Animate characters sequentially from left to right
    animateSequentially(0);
  } else {
    box.innerHTML = `<div style="font-size: 3.5rem; font-weight: 800; font-family: var(--font-display); color: var(--text-primary);">${wordStr}</div>`;
  }
}

function animateSequentially(idx) {
  if (idx < lessonWriterArray.length && lessonWriterArray[idx]) {
    lessonWriterArray[idx].animateCharacter({
      onComplete: () => {
        animateSequentially(idx + 1);
      }
    });
  }
}

window.replayLessonHanziStrokes = function() {
  if (lessonWriterArray && lessonWriterArray.length > 0) {
    animateSequentially(0);
  }
};

function startLessonStudy(lesson, sliceWords) {
  if (!currentUser) {
    window.openAuthRequiredModal();
    return;
  }
  if (!sliceWords || sliceWords.length === 0) {
    showToast('Danh sách từ vựng của bài học này đang được chuẩn bị!', true);
    return;
  }

  isLessonVocabStudyMode = true;

  // Close detail popup modal if open
  const modalEl = document.getElementById('lesson-detail-popup-modal');
  if (modalEl) modalEl.style.display = 'none';

  // Switch tab to flashcards
  switchTab('flashcards', true);

  const title = `Flashcard: ${lesson.title || ('Bài ' + lesson.id)}`;

  // HIDE ALL NOISE PANELS (Image 2 search bar, widgets, etc.)
  const quickCards = document.querySelector('.quick-dashboard-cards');
  if (quickCards) quickCards.style.display = 'none';

  const selectionView = document.getElementById('deck-selection-view');
  if (selectionView) selectionView.style.display = 'none';

  const topicsView = document.getElementById('flashcard-topics-view');
  if (topicsView) topicsView.style.display = 'none';

  const subdecksView = document.getElementById('flashcard-subdecks-view');
  if (subdecksView) subdecksView.style.display = 'none';

  const nbDash = document.getElementById('notebook-dashboard-view');
  if (nbDash) nbDash.style.display = 'none';

  const statsSummary = document.querySelector('.stats-summary-container');
  if (statsSummary) statsSummary.style.display = 'none';

  const detailedStats = document.getElementById('detailed-stats-panel');
  if (detailedStats) detailedStats.style.display = 'none';

  const controlsDash = document.querySelector('.controls-dashboard');
  if (controlsDash) controlsDash.style.display = 'none';

  // SHOW ONLY IMAGE 4 FLASHCARD WORKSPACE
  const studyView = document.getElementById('flashcard-study-view');
  if (studyView) studyView.style.display = 'block';

  renderLessonFlashcardWorkspace(title, sliceWords, 0);

  const flashcardSec = document.getElementById('flashcard-section');
  if (flashcardSec) flashcardSec.scrollIntoView({ behavior: 'smooth' });

  showToast(`Bắt đầu học Flashcard: ${lesson.title || ('Bài ' + lesson.id)} 🎴`);
}

let currentBkData = null;
let currentBkMode = 'read'; // 'read' | 'quiz' | 'dictation' | 'translate'
let currentBkLineIndex = 0;
let currentBkScore = 0;

window.switchBkTab = function(mode) {
  currentBkMode = mode;
  currentBkLineIndex = 0;
  currentBkScore = 0;
  renderBkModalContent();
};

function getBkLinesList(lessonData) {
  const lines = [];
  if (!lessonData || !lessonData.dialogues) return lines;
  lessonData.dialogues.forEach((diag, dIdx) => {
    diag.lines.forEach((line, lIdx) => {
      const parts = line.split(/[:：]/);
      let speaker = '';
      let speech = line;
      if (parts.length > 1 && parts[0].length <= 8) {
        speaker = parts[0].trim();
        speech = parts.slice(1).join('：').trim();
      }
      if (speech && speech.trim().length > 0 && !speech.startsWith('听两遍') && !speech.startsWith('（')) {
        lines.push({
          dialogueTitle: diag.title || `Hội thoại ${dIdx + 1}`,
          speaker,
          speech: speech.trim(),
          fullLine: line
        });
      }
    });
  });
  return lines;
}

// Vietnamese translation dictionary for HSK 1 lesson text lines
const bkLineTranslations = {
  'AI小语，你好！': 'Chào AI Tiểu Ngữ!',
  '王老师，你好！': 'Chào thầy/cô Vương!',
  '大家好！': 'Chào mọi người!',
  '老师，您好！': 'Chào Thầy/Cô ạ!',
  '你们好！': 'Chào các bạn!',
  '你好，小语！': 'Chào bạn, Tiểu Ngữ!',
  '谢谢！': 'Cảm ơn!',
  '不客气！': 'Không có chi!',
  '同学们，再见！': 'Chào tạm biệt các em học sinh!',
  '老师，再见！': 'Chào tạm biệt Thầy/Cô!',
  '请问，你叫什么名字？': 'Xin hỏi, bạn tên là gì?',
  '我叫陈天中。': 'Tôi tên là Trần Thiên Trung.',
  '你好，安妮！': 'Chào bạn, An Ni!',
  '你好，陈天中！我不是安妮，我是白家月。': 'Chào Trần Thiên Trung! Tôi không phải là An Ni, tôi là Bạch Gia Nguyệt.',
  '对不起！': 'Xin lỗi!',
  '没关系！': 'Không sao đâu!',
  '你好，我叫李文。': 'Chào bạn, tôi tên là Lý Văn.',
  '你好，我叫白家月。': 'Chào bạn, tôi tên là Bạch Gia Nguyệt.',
  '很高兴认识你。': 'Rất vui được quen biết bạn.',
  '认识你，我也很高兴。': 'Quen biết bạn, tôi cũng rất vui.',
  '我们在哪儿见呢？': 'Chúng ta gặp nhau ở đâu nhỉ?',
  '在学校书店前见吧。': 'Gặp nhau trước hiệu sách của trường đi.',
  '好的。下午两点能到吗？': 'Được. 2 giờ chiều có đến được không?',
  '我能到。我在学校吃午饭。': 'Tôi đến được. Tôi ăn trưa ở trường.'
};

function renderBkModalContent() {
  const container = document.getElementById('lesson-reading-text-modal-body');
  if (!container || !currentBkData) return;

  const linesList = getBkLinesList(currentBkData);

  // Update tab buttons state
  ['quiz', 'dictation', 'translate', 'read'].forEach(m => {
    const btn = document.getElementById(`bk-tab-${m}`);
    if (btn) {
      if (m === currentBkMode) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });

  if (currentBkMode === 'read') {
    let dialoguesHtml = '';
    currentBkData.dialogues.forEach((diag, dIdx) => {
      let linesHtml = '';
      diag.lines.forEach(line => {
        const parts = line.split(/[:：]/);
        let speaker = '';
        let speech = line;
        if (parts.length > 1 && parts[0].length <= 8) {
          speaker = parts[0].trim();
          speech = parts.slice(1).join('：').trim();
        }
        const cleanSpeech = speech.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const translation = bkLineTranslations[speech] || '';

        linesHtml += `
          <div style="display:flex; align-items:flex-start; gap:12px; margin-bottom:14px; font-size:1.15rem; line-height:1.6; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:10px;">
            ${speaker ? `
              <span style="background:rgba(37,99,235,0.18); color:#60a5fa; border:1px solid rgba(59,130,246,0.3); padding:4px 10px; border-radius:8px; font-weight:800; font-size:0.88rem; flex-shrink:0;">
                ${speaker}
              </span>
            ` : ''}
            <div style="flex:1; color:#f8fafc; font-family:var(--font-hanzi); font-weight:600; word-break:break-word;">
              <div>${speech}</div>
              ${translation ? `<div style="font-size:0.9rem; color:#94a3b8; font-weight:500; font-family:sans-serif; margin-top:2px;">${translation}</div>` : ''}
            </div>
            <button onclick="window.speakText('${cleanSpeech}')" style="background:rgba(59,130,246,0.2); border:1px solid rgba(59,130,246,0.4); color:#38bdf8; cursor:pointer; padding:6px 12px; border-radius:8px; font-size:0.9rem; font-weight:700; flex-shrink:0;" title="Phát âm">
              <i class="fa-solid fa-volume-high"></i> Nghe
            </button>
          </div>
        `;
      });

      let notesHtml = '';
      if (diag.notes && diag.notes.length > 0) {
        diag.notes.forEach(note => {
          notesHtml += `
            <div class="grammar-note-box" style="background:rgba(245,158,11,0.12); border-left:3px solid #f59e0b; padding:10px 14px; border-radius:0 10px 10px 0; margin-top:12px; font-size:0.92rem; color:var(--text-primary, #fef08a); line-height:1.5;">
              <strong class="grammar-note-title" style="color:#d97706;"><i class="fa-solid fa-lightbulb" style="margin-right:6px;"></i> Chú ý:</strong> <span class="grammar-note-text">${note}</span>
            </div>
          `;
        });
      }

      dialoguesHtml += `
        <div style="background:rgba(30,41,59,0.7); border:1px solid rgba(255,255,255,0.12); border-radius:18px; padding:20px; margin-bottom:20px; box-shadow:0 8px 24px rgba(0,0,0,0.3);">
          <h4 style="color:#38bdf8; font-size:1.1rem; margin-top:0; margin-bottom:14px; font-family:var(--font-display); display:flex; align-items:center; gap:8px;">
            <i class="fa-solid fa-comments" style="color:#38bdf8;"></i> ${diag.title || `Hội thoại ${dIdx + 1}`}
          </h4>
          ${linesHtml}
          ${notesHtml}
        </div>
      `;
    });

    container.innerHTML = dialoguesHtml;
  } else if (currentBkMode === 'quiz') {
    // Mode 1: Nghe chọn đáp án đúng
    if (linesList.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:40px; color:#94a3b8;">Chưa có dữ liệu câu hỏi cho bài này.</div>`;
      return;
    }

    const curLine = linesList[currentBkLineIndex % linesList.length];
    const cleanSpeech = curLine.speech.replace(/'/g, "\\'").replace(/"/g, '&quot;');

    // Generate options: correct choice + 2 distractors
    const otherLines = linesList.filter(l => l.speech !== curLine.speech);
    const distractor1 = otherLines.length > 0 ? otherLines[0].speech : '你好！';
    const distractor2 = otherLines.length > 1 ? otherLines[1].speech : '再见！';

    const rawOptions = [curLine.speech, distractor1, distractor2];
    // Deterministic shuffle based on line index
    const options = [rawOptions[(currentBkLineIndex) % 3], rawOptions[(currentBkLineIndex + 1) % 3], rawOptions[(currentBkLineIndex + 2) % 3]];
    window.currentBkQuizOptions = options;
    window.currentBkQuizTarget = curLine.speech;

    container.innerHTML = `
      <div style="background:rgba(30,41,59,0.7); border:1px solid rgba(255,255,255,0.12); border-radius:20px; padding:24px; text-align:center; max-width:650px; margin:0 auto; box-shadow:0 10px 30px rgba(0,0,0,0.4);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
          <span style="font-size:0.9rem; font-weight:800; color:#38bdf8;"><i class="fa-solid fa-circle-question"></i> Câu ${currentBkLineIndex + 1} / ${linesList.length}</span>
          <span style="font-size:0.9rem; font-weight:800; color:#10b981;"><i class="fa-solid fa-star"></i> Điểm: ${currentBkScore}</span>
        </div>

        <div style="margin-bottom:24px; padding:20px; background:rgba(15,23,42,0.6); border-radius:16px; border:1px solid rgba(255,255,255,0.1);">
          <div style="font-size:1.05rem; font-weight:700; color:#cbd5e1; margin-bottom:14px;">Bấm nút loa bên dưới để nghe và chọn đáp án đúng:</div>
          <button onclick="window.speakText(decodeURIComponent('${encodeURIComponent(curLine.speech)}'))" style="background:linear-gradient(135deg, #2563eb, #1d4ed8); border:none; color:#ffffff; padding:14px 28px; border-radius:99px; font-weight:800; font-size:1.1rem; cursor:pointer; box-shadow:0 6px 20px rgba(37,99,235,0.4); display:inline-flex; align-items:center; gap:10px;" onmousedown="this.style.transform='scale(0.96)'" onmouseup="this.style.transform='scale(1)'">
            <i class="fa-solid fa-volume-high" style="font-size:1.3rem;"></i> BẤM ĐỂ NGHE AUDIO
          </button>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px;">
          ${options.map((opt, oIdx) => `
            <button class="bk-quiz-opt-btn" onclick="window.checkBkQuizAnswer(${oIdx}, this)" style="background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.18); color:#f8fafc; padding:14px 20px; border-radius:14px; font-size:1.15rem; font-weight:700; cursor:pointer; font-family:var(--font-hanzi); text-align:left; transition:all 0.2s; display:flex; align-items:center; justify-content:space-between;">
              <span>${String.fromCharCode(65 + oIdx)}. ${opt}</span>
              <i class="fa-solid fa-circle-check opt-icon" style="opacity:0;"></i>
            </button>
          `).join('')}
        </div>

        <div id="bk-quiz-feedback" style="min-height:30px; margin-bottom:16px;"></div>

        <button id="bk-quiz-next-btn" onclick="window.nextBkQuizQuestion(${linesList.length})" style="display:none; width:100%; background:linear-gradient(135deg, #10b981, #059669); border:none; color:#ffffff; padding:12px; border-radius:12px; font-weight:800; font-size:1rem; cursor:pointer;">
          Câu tiếp theo <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    `;

    // Auto play audio once modal loads
    setTimeout(() => window.speakText(curLine.speech), 300);

  } else if (currentBkMode === 'dictation') {
    // Mode 2: Nghe nhập bài khóa
    if (linesList.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:40px; color:#94a3b8;">Chưa có dữ liệu bài khóa.</div>`;
      return;
    }

    const curLine = linesList[currentBkLineIndex % linesList.length];
    const cleanSpeech = curLine.speech.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const hintChars = curLine.speech.match(/[\u4e00-\u9fa5]/g) || curLine.speech.split('');

    container.innerHTML = `
      <div style="background:rgba(30,41,59,0.7); border:1px solid rgba(255,255,255,0.12); border-radius:20px; padding:24px; text-align:center; max-width:680px; margin:0 auto; box-shadow:0 10px 30px rgba(0,0,0,0.4);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
          <span style="font-size:0.9rem; font-weight:800; color:#38bdf8;"><i class="fa-solid fa-headphones"></i> Câu ${currentBkLineIndex + 1} / ${linesList.length}</span>
          ${curLine.speaker ? `<span style="background:rgba(37,99,235,0.2); color:#60a5fa; border:1px solid rgba(59,130,246,0.3); padding:4px 12px; border-radius:8px; font-weight:800; font-size:0.85rem;">Nhân vật: ${curLine.speaker}</span>` : ''}
        </div>

        <div style="margin-bottom:20px;">
          <button onclick="window.speakText('${cleanSpeech}')" style="background:linear-gradient(135deg, #3b82f6, #1d4ed8); border:none; color:#ffffff; padding:14px 28px; border-radius:99px; font-weight:800; font-size:1.1rem; cursor:pointer; box-shadow:0 6px 20px rgba(59,130,246,0.4); display:inline-flex; align-items:center; gap:10px;">
            <i class="fa-solid fa-volume-high" style="font-size:1.3rem;"></i> BẤM ĐỂ NGHE AUDIO CÂU THOẠI
          </button>
        </div>

        <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.12); border-radius:16px; padding:18px; margin-bottom:20px;">
          <div style="font-size:0.92rem; font-weight:800; color:#38bdf8; margin-bottom:10px; text-align:left; display:flex; justify-content:space-between;">
            <span>Gõ lại câu bằng chữ Hán/Pinyin:</span>
            <span id="bk-dictation-feedback"></span>
          </div>

          <input type="text" id="bk-dictation-input" placeholder="Gõ câu vừa nghe được..." oninput="window.checkBkDictationInput('${cleanSpeech}')" style="width:100%; padding:12px 16px; background:rgba(0,0,0,0.4); border:2px solid rgba(255,255,255,0.2); border-radius:12px; color:#ffffff; font-size:1.15rem; font-weight:700; outline:none; margin-bottom:14px; box-sizing:border-box;" />

          <div id="bk-dictation-hint-cards" style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-bottom:12px;">
            ${hintChars.map(c => `
              <div class="lesson-hint-card" onclick="window.toggleLessonCharHint(this, '${c.replace(/'/g, "\\'")}')" style="width:48px; height:60px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); border-radius:10px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#94a3b8; font-size:1.1rem;">
                <i class="fa-solid fa-eye"></i>
              </div>
            `).join('')}
          </div>

          <button onclick="window.revealAllLessonCharHints('${cleanSpeech}')" style="width:100%; background:linear-gradient(135deg, #f59e0b, #d97706); border:none; color:#ffffff; font-weight:800; padding:10px; border-radius:10px; cursor:pointer;">
            <i class="fa-solid fa-eye"></i> HIỆN GỢI Ý MẪU
          </button>
        </div>

        <div style="display:flex; justify-content:space-between; gap:12px;">
          <button onclick="window.navBkLine(-1, ${linesList.length})" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:10px 18px; border-radius:10px; font-weight:700; cursor:pointer;">
            &larr; Câu trước
          </button>
          <button onclick="window.navBkLine(1, ${linesList.length})" style="background:#2563eb; border:none; color:#fff; padding:10px 22px; border-radius:10px; font-weight:800; cursor:pointer;">
            Câu tiếp theo &rarr;
          </button>
        </div>
      </div>
    `;

    setTimeout(() => window.speakText(curLine.speech), 300);

  } else if (currentBkMode === 'translate') {
    // Mode 3: Dịch bài khóa
    if (linesList.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:40px; color:#94a3b8;">Chưa có dữ liệu dịch.</div>`;
      return;
    }

    const curLine = linesList[currentBkLineIndex % linesList.length];
    const cleanSpeech = curLine.speech.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const translationPrompt = bkLineTranslations[curLine.speech] || `Dịch câu thoại của ${curLine.speaker || 'nhân vật'}`;
    const hintChars = curLine.speech.match(/[\u4e00-\u9fa5]/g) || curLine.speech.split('');

    container.innerHTML = `
      <div style="background:rgba(30,41,59,0.7); border:1px solid rgba(255,255,255,0.12); border-radius:20px; padding:24px; text-align:center; max-width:680px; margin:0 auto; box-shadow:0 10px 30px rgba(0,0,0,0.4);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
          <span style="font-size:0.9rem; font-weight:800; color:#38bdf8;"><i class="fa-solid fa-language"></i> Câu ${currentBkLineIndex + 1} / ${linesList.length}</span>
          ${curLine.speaker ? `<span style="background:rgba(37,99,235,0.2); color:#60a5fa; border:1px solid rgba(59,130,246,0.3); padding:4px 12px; border-radius:8px; font-weight:800; font-size:0.85rem;">${curLine.speaker}</span>` : ''}
        </div>

        <div style="background:rgba(15,23,42,0.8); border:1.5px solid rgba(59,130,246,0.4); border-radius:16px; padding:20px; margin-bottom:20px; text-align:left;">
          <div style="font-size:0.85rem; font-weight:800; color:#60a5fa; text-transform:uppercase; margin-bottom:6px;">
            <i class="fa-solid fa-flag"></i> Câu tiếng Việt cần dịch:
          </div>
          <div style="font-size:1.3rem; font-weight:800; color:#ffffff;">
            "${translationPrompt}"
          </div>
        </div>

        <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,255,255,0.12); border-radius:16px; padding:18px; margin-bottom:20px;">
          <div style="font-size:0.92rem; font-weight:800; color:#38bdf8; margin-bottom:10px; text-align:left; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span>Dịch sang tiếng Trung:</span>
              <button onclick="window.speakText('${cleanSpeech}')" style="background:rgba(56,189,248,0.18); border:1.5px solid rgba(56,189,248,0.4); color:#38bdf8; border-radius:8px; padding:3px 10px; font-size:0.8rem; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all 0.2s;" title="Nghe phát âm câu mẫu">
                <i class="fa-solid fa-volume-high"></i> Nghe
              </button>
            </div>
            <span id="bk-translate-feedback"></span>
          </div>

          <input type="text" id="bk-translate-input" placeholder="Gõ câu dịch tiếng Trung vào đây..." oninput="window.checkBkTranslateInput('${cleanSpeech}')" style="width:100%; padding:12px 16px; background:rgba(0,0,0,0.4); border:2px solid rgba(255,255,255,0.2); border-radius:12px; color:#ffffff; font-size:1.15rem; font-weight:700; outline:none; margin-bottom:14px; box-sizing:border-box;" />

          <div id="bk-translate-hint-cards" style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-bottom:12px;">
            ${hintChars.map(c => `
              <div class="lesson-hint-card" onclick="window.toggleLessonCharHint(this, '${c.replace(/'/g, "\\'")}')" style="width:48px; height:60px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); border-radius:10px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#94a3b8; font-size:1.1rem;">
                <i class="fa-solid fa-eye"></i>
              </div>
            `).join('')}
          </div>

          <button onclick="window.revealAllLessonCharHints('${cleanSpeech}')" style="width:100%; background:linear-gradient(135deg, #f59e0b, #d97706); border:none; color:#ffffff; font-weight:800; padding:10px; border-radius:10px; cursor:pointer;">
            <i class="fa-solid fa-eye"></i> HIỆN GỢI Ý MẪU
          </button>
        </div>

        <div style="display:flex; justify-content:space-between; gap:12px;">
          <button onclick="window.navBkLine(-1, ${linesList.length})" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; padding:10px 18px; border-radius:10px; font-weight:700; cursor:pointer;">
            &larr; Câu trước
          </button>
          <button onclick="window.navBkLine(1, ${linesList.length})" style="background:#2563eb; border:none; color:#fff; padding:10px 22px; border-radius:10px; font-weight:800; cursor:pointer;">
            Câu tiếp theo &rarr;
          </button>
        </div>
      </div>
    `;
  }
}

window.checkBkQuizAnswer = function(oIdx, btnEl) {
  const options = window.currentBkQuizOptions || [];
  const selected = options[oIdx] || '';
  const target = window.currentBkQuizTarget || '';
  const feedback = document.getElementById('bk-quiz-feedback');
  const nextBtn = document.getElementById('bk-quiz-next-btn');
  const allBtns = document.querySelectorAll('.bk-quiz-opt-btn');

  allBtns.forEach(b => {
    b.disabled = true;
    b.style.opacity = '0.7';
  });

  const cleanSel = selected.replace(/[.,!?:;="'"()\[\]{}，。！？；：\s\-_~`]/g, '').toLowerCase();
  const cleanTarget = target.replace(/[.,!?:;="'"()\[\]{}，。！？；：\s\-_~`]/g, '').toLowerCase();

  if (cleanSel === cleanTarget) {
    if (btnEl) {
      btnEl.style.background = 'rgba(16, 185, 129, 0.25)';
      btnEl.style.borderColor = '#10b981';
      btnEl.style.color = '#34d399';
    }
    if (feedback) feedback.innerHTML = `<span style="color:#10b981; font-weight:800; font-size:1.1rem;"><i class="fa-solid fa-circle-check"></i> Chính xác! 🎉</span>`;
    currentBkScore += 10;
    window.speakText(target);
  } else {
    if (btnEl) {
      btnEl.style.background = 'rgba(239, 68, 68, 0.25)';
      btnEl.style.borderColor = '#ef4444';
      btnEl.style.color = '#f87171';
    }
    if (feedback) feedback.innerHTML = `<span style="color:#ef4444; font-weight:800; font-size:1.05rem;"><i class="fa-solid fa-circle-xmark"></i> Chưa đúng! Đáp án đúng là: ${target}</span>`;
  }

  if (nextBtn) nextBtn.style.display = 'block';
};

window.nextBkQuizQuestion = function(totalLines) {
  currentBkLineIndex = (currentBkLineIndex + 1) % totalLines;
  renderBkModalContent();
};

window.checkBkDictationInput = function(target) {
  const inputEl = document.getElementById('bk-dictation-input');
  const feedbackEl = document.getElementById('bk-dictation-feedback');
  if (!inputEl || !feedbackEl) return;

  const typed = inputEl.value.trim().replace(/[.,!?:;="'"()\[\]{}，。！？；：\s\-_~`]/g, '').toLowerCase();
  const cleanTarget = target.replace(/[.,!?:;="'"()\[\]{}，。！？；：\s\-_~`]/g, '').toLowerCase();

  if (typed === cleanTarget) {
    feedbackEl.innerHTML = `<span style="color:#10b981; font-weight:800;"><i class="fa-solid fa-circle-check"></i> Chính xác!</span>`;
    inputEl.style.borderColor = '#10b981';
    window.speakText(target);
  } else if (cleanTarget.startsWith(typed) && typed.length > 0) {
    feedbackEl.innerHTML = `<span style="color:#fbbf24; font-weight:700;"><i class="fa-solid fa-pen"></i> Đang gõ...</span>`;
    inputEl.style.borderColor = '#fbbf24';
  } else if (typed.length > 0) {
    feedbackEl.innerHTML = `<span style="color:#ef4444; font-weight:700;"><i class="fa-solid fa-circle-xmark"></i> Chưa đúng</span>`;
    inputEl.style.borderColor = '#ef4444';
  } else {
    feedbackEl.innerHTML = '';
    inputEl.style.borderColor = 'rgba(255,255,255,0.2)';
  }
};

window.checkBkTranslateInput = function(target) {
  const inputEl = document.getElementById('bk-translate-input');
  const feedbackEl = document.getElementById('bk-translate-feedback');
  if (!inputEl || !feedbackEl) return;

  const typed = inputEl.value.trim().replace(/[.,!?:;="'"()\[\]{}，。！？；：\s\-_~`]/g, '').toLowerCase();
  const cleanTarget = target.replace(/[.,!?:;="'"()\[\]{}，。！？；：\s\-_~`]/g, '').toLowerCase();

  if (typed === cleanTarget) {
    feedbackEl.innerHTML = `<span style="color:#10b981; font-weight:800;"><i class="fa-solid fa-circle-check"></i> Chính xác!</span>`;
    inputEl.style.borderColor = '#10b981';
    window.speakText(target);
  } else if (cleanTarget.startsWith(typed) && typed.length > 0) {
    feedbackEl.innerHTML = `<span style="color:#fbbf24; font-weight:700;"><i class="fa-solid fa-pen"></i> Đang gõ...</span>`;
    inputEl.style.borderColor = '#fbbf24';
  } else if (typed.length > 0) {
    feedbackEl.innerHTML = `<span style="color:#ef4444; font-weight:700;"><i class="fa-solid fa-circle-xmark"></i> Chưa đúng</span>`;
    inputEl.style.borderColor = '#ef4444';
  } else {
    feedbackEl.innerHTML = '';
    inputEl.style.borderColor = 'rgba(255,255,255,0.2)';
  }
};

window.navBkLine = function(dir, totalLines) {
  currentBkLineIndex = (currentBkLineIndex + dir + totalLines) % totalLines;
  renderBkModalContent();
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.openLessonGrammarModal = function(lessonKey) {
  if (!currentUser) {
    window.openAuthRequiredModal();
    return;
  }
  const modalEl = document.getElementById('lesson-grammar-popup-modal');
  const numKey = parseInt(String(lessonKey).replace(/\D/g, ''), 10) || 1;
  const currentLvl = activeLessonsCurriculum === 'yct' ? activeYctLevel : (activeLessonsLevel || 1);
  const currentVer = activeLessonsCurriculum === 'yct' ? 'yct' : (activeHskVersion || activeRoadmapVersion || '3.0');
  const lvlStr = String(currentLvl);

  // If not HSK 1 or HSK 2 or no data ready yet
  if ((lvlStr !== '1' && lvlStr !== '2') || currentVer === 'yct' || currentVer === '2.0') {
    showComingSoonNotice(`Ngữ Pháp HSK ${currentLvl}`);
    return;
  }

  const grammarList = lvlStr === '2' ? (HSK2_STRUCTURED_GRAMMAR || []) : (HSK1_STRUCTURED_GRAMMAR || []);
  const lessonData = grammarList.find(l => l.lessonId === numKey);
  if (!lessonData || !lessonData.grammarPoints || lessonData.grammarPoints.length === 0) {
    showToast(`Dữ liệu ngữ pháp Bài ${numKey} đang được cập nhật!`);
    return;
  }

  if (!modalEl) {
    window.location.href = `/hsk-grammar.html?level=${lvlStr}&lesson=${numKey}`;
    return;
  }

  // Update Header info & Stepper
  const titleEl = document.getElementById('grammar-modal-title');
  const badgeEl = document.getElementById('grammar-modal-badge');
  const countBadgeEl = document.getElementById('grammar-modal-count-badge');
  const bodyEl = document.getElementById('grammar-modal-body');
  const stepperContainer = document.getElementById('grammar-modal-stepper-container');

  if (titleEl) titleEl.textContent = `Bài ${lessonData.lessonId}: ${lessonData.lessonTitleZh || ''}`;
  if (badgeEl) badgeEl.textContent = `HSK ${lvlStr} (3.0)`;
  if (countBadgeEl) countBadgeEl.textContent = `${lessonData.grammarPoints.length} Điểm Ngữ Pháp`;

  if (stepperContainer) {
    stepperContainer.innerHTML = `
      <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
        <button onclick="window.goToLessonStep('vocab', '${numKey}')" class="stepper-tab-btn" data-step="vocab">
          <i class="fa-solid fa-book-bookmark"></i> 1. Từ Vựng
        </button>
        <button onclick="window.goToLessonStep('grammar', '${numKey}')" class="stepper-tab-btn active active-grammar" data-step="grammar">
          <i class="fa-solid fa-spell-check"></i> 2. Ngữ Pháp
        </button>
        <button onclick="window.goToLessonStep('text', '${numKey}')" class="stepper-tab-btn" data-step="text">
          <i class="fa-solid fa-comments"></i> 3. Bài Khóa
        </button>
        <button onclick="window.goToLessonStep('quiz', '${numKey}')" class="stepper-tab-btn" data-step="quiz">
          <i class="fa-solid fa-circle-play"></i> 4. Ôn Tập
        </button>
      </div>
    `;
  }

  // Render grammar points
  if (bodyEl) {
    let cardsHtml = '';
    lessonData.grammarPoints.forEach((pt, idx) => {
      // Formula / Structure
      let formulaHtml = '';
      if (pt.formula) {
        formulaHtml = `
          <div class="grammar-formula-box" style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #0284c7; border-radius: 12px; padding: 12px 16px; margin: 12px 0;">
            <div class="grammar-formula-title" style="font-size: 0.8rem; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-code"></i> Cấu trúc / Công thức
            </div>
            <div class="grammar-formula-text" style="font-family: var(--font-display, sans-serif); font-size: 1.02rem; font-weight: 700; color: var(--text-primary, #ffffff); white-space: pre-line; line-height: 1.5;">
              ${escapeHtml(pt.formula)}
            </div>
          </div>
        `;
      }

      // Explanation
      let expHtml = '';
      if (pt.explanation) {
        expHtml = `
          <div class="grammar-exp-text" style="font-size: 0.95rem; color: var(--text-primary, #e2e8f0); line-height: 1.6; margin: 10px 0;">
            ${escapeHtml(pt.explanation)}
          </div>
        `;
      }

      // Note
      let noteHtml = '';
      if (pt.note) {
        noteHtml = `
          <div class="grammar-note-box" style="background: rgba(245, 158, 11, 0.12); border-left: 4px solid #f59e0b; border-radius: 12px; padding: 10px 14px; margin: 10px 0;">
            <div class="grammar-note-title" style="font-size: 0.82rem; font-weight: 800; color: #d97706; margin-bottom: 3px; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-lightbulb"></i> Chú ý
            </div>
            <div class="grammar-note-text" style="font-size: 0.92rem; color: var(--text-primary, #fef08a); line-height: 1.5;">
              ${escapeHtml(pt.note)}
            </div>
          </div>
        `;
      }

      // Tables (e.g., bảng số từ 0 - 99 và số lớn >= 100)
      let tablesHtml = '';
      if (pt.tables && pt.tables.length > 0) {
        tablesHtml = pt.tables.map(tbl => `
          <div style="margin: 14px 0;">
            <div style="font-weight: 800; color: #10b981; font-size: 0.92rem; margin-bottom: 6px; display:flex; align-items:center; gap:6px;">
              <i class="fa-solid fa-table-list"></i> ${escapeHtml(tbl.title || 'Bảng tra cứu')}
            </div>
            <div style="overflow-x: auto; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
              <table class="custom-grammar-table">
                <thead>
                  <tr>${(tbl.headers || []).map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${(tbl.rows || []).map(r => `<tr>${(r || []).map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `).join('');
      }

      // Examples
      let examplesHtml = '';
      if (pt.examples && pt.examples.length > 0) {
        let exItems = pt.examples.map(ex => {
          const safeZh = (ex.zh || '').replace(/'/g, "\\'");
          return `
            <div class="grammar-example-item" style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; transition: all 0.2s;">
              <div style="flex: 1;">
                <div class="grammar-ex-zh" style="font-size: 1.18rem; font-weight: 700; color: var(--text-primary, #ffffff); font-family: 'Noto Sans SC', sans-serif; margin-bottom: 2px; letter-spacing: 0.5px;">
                  ${escapeHtml(ex.zh || '')}
                </div>
                <div class="grammar-ex-py" style="font-size: 0.92rem; color: #0284c7; font-family: var(--font-display, sans-serif); font-weight: 600; margin-bottom: 2px;">
                  ${escapeHtml(ex.pinyin || '')}
                </div>
                <div class="grammar-ex-vi" style="font-size: 0.88rem; color: var(--text-secondary, #cbd5e1);">
                  ${escapeHtml(ex.vi || '')}
                </div>
              </div>
              <button onclick="window.speakText('${safeZh}')" class="grammar-speak-btn" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #0284c7; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: all 0.2s;" title="Nghe phát âm">
                <i class="fa-solid fa-volume-high"></i>
              </button>
            </div>
          `;
        }).join('');

        examplesHtml = `
          <div style="margin-top: 14px;">
            <div style="font-size: 0.82rem; font-weight: 800; color: var(--text-muted, #94a3b8); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-list-check"></i> Ví dụ minh họa (${pt.examples.length} câu)
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${exItems}
            </div>
          </div>
        `;
      }

      cardsHtml += `
        <div class="grammar-card-box" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 10px; background: linear-gradient(135deg, #0284c7, #2563eb); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.95rem; flex-shrink: 0;">
              ${idx + 1}
            </div>
            <h4 class="grammar-card-title" style="margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--text-primary, #ffffff); font-family: var(--font-display, sans-serif);">
              ${escapeHtml(pt.title || '')}
            </h4>
          </div>
          ${formulaHtml}
          ${expHtml}
          ${noteHtml}
          ${tablesHtml}
          ${examplesHtml}
        </div>
      `;
    });

    bodyEl.innerHTML = cardsHtml;
  }

  // Prev / Next button handlers & Step Transitions
  const btnPrev = document.getElementById('grammar-modal-prev-btn');
  const btnNext = document.getElementById('grammar-modal-next-btn');
  const btnSoTay = document.getElementById('grammar-modal-so-tay-btn');
  const btnStepVocab = document.getElementById('grammar-modal-step-vocab-btn');
  const btnStepText = document.getElementById('grammar-modal-step-text-btn');

  if (btnStepVocab) {
    btnStepVocab.onclick = () => window.goToLessonStep('vocab', numKey);
  }

  if (btnStepText) {
    btnStepText.onclick = () => window.goToLessonStep('text', numKey);
  }

  if (btnPrev) {
    if (numKey > 1) {
      btnPrev.style.display = 'inline-flex';
      btnPrev.onclick = () => window.openLessonGrammarModal(numKey - 1);
    } else {
      btnPrev.style.display = 'none';
    }
  }

  if (btnNext) {
    if (numKey < grammarList.length) {
      btnNext.style.display = 'inline-flex';
      btnNext.onclick = () => window.openLessonGrammarModal(numKey + 1);
    } else {
      btnNext.style.display = 'none';
    }
  }

  if (btnSoTay) {
    btnSoTay.onclick = () => {
      window.location.href = `/hsk-grammar.html?level=${lvlStr}&lesson=${numKey}`;
    };
  }

  modalEl.style.display = 'flex';
};

window.openLessonVocabStudy = function(lessonKey) {
  if (!currentUser) {
    window.openAuthRequiredModal();
    return;
  }
  const currentLvl = activeLessonsCurriculum === 'yct' ? activeYctLevel : activeLessonsLevel;
  const levelVocabs = vocabList.filter(w => {
    if (w.isCustom) return false;
    if (w.curriculum === 'yct' || w.hskVersion === 'yct') return false;
    if (!matchLevel(w.level, currentLvl)) return false;
    if ((w.hskVersion || '3.0') !== activeHskVersion) return false;
    return true;
  });

  const sliceWords = levelVocabs.filter(w => String(w.lessonId || 1) === String(lessonKey));
  if (sliceWords.length === 0) {
    showToast('Chưa có từ vựng cho bài học này!', true);
    return;
  }
  const firstWord = sliceWords[0];
  const title = cleanLessonTitle(firstWord.lessonTitle || firstWord.category, lessonKey);
  startLessonStudy({ id: lessonKey, title }, sliceWords);
};

window.openLessonGrammarStudy = function(lessonId) {
  const modalEl = document.getElementById('lesson-detail-popup-modal');
  if (modalEl) modalEl.style.display = 'none';

  const numId = parseInt(String(lessonId).replace(/\D/g, ''), 10) || 1;
  window.openLessonGrammarModal(numId);
};

window.openLessonTextStudy = function(lessonId) {
  if (!currentUser) {
    window.openAuthRequiredModal();
    return;
  }
  const modalEl = document.getElementById('lesson-detail-popup-modal');
  if (modalEl) modalEl.style.display = 'none';

  const numId = parseInt(String(lessonId).replace(/\D/g, ''), 10) || 1;
  const currentLvl = activeLessonsCurriculum === 'yct' ? activeYctLevel : (activeLessonsLevel || 1);
  const currentVer = activeLessonsCurriculum === 'yct' ? 'yct' : (activeHskVersion || activeRoadmapVersion || '3.0');
  window.location.href = `/lesson-texts.html?lesson=${numId}&level=${currentLvl}&version=${currentVer}`;
};

window.openLessonReviewStudy = function(lessonId) {
  showComingSoonNotice('Ôn Tập');
};

window.openYctLevelVocabStudy = function(level) {
  const yctWords = vocabList.filter(w =>
    !w.isCustom &&
    (w.curriculum === 'yct' || w.hskVersion === 'yct') &&
    w.level.toString() === level.toString()
  );
  startLessonStudy({ id: `yct_${level}`, title: `YCT Cấp ${level}` }, yctWords);
};

window.startYctLevelFlashcard = function(level) {
  const yctWords = vocabList.filter(w =>
    !w.isCustom &&
    (w.curriculum === 'yct' || w.hskVersion === 'yct') &&
    w.level.toString() === level.toString()
  );
  if (typeof openSubdeckStudy === 'function') {
    openSubdeckStudy(`yct:${level}`);
  } else if (typeof openDeckModal === 'function') {
    openDeckModal(`YCT Cấp ${level}`, yctWords);
  }
};

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
        if (tabId === 'search') {
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
    const zhLines = w.example_zh.split(/(?<=[！。？\n])\s*/).map(s => s.trim()).filter(Boolean);
    const viLines = (w.example_vi || '').split(/(?<=[.!?\n])\s*/).map(s => s.trim()).filter(Boolean);

    const zhEl = document.getElementById('dict-detail-example-zh');
    const viEl = document.getElementById('dict-detail-example-vi');
    if (zhEl) zhEl.innerHTML = zhLines.map((line, i) => `<div style="${i > 0 ? 'margin-top: 4px;' : ''}">${line}</div>`).join('');
    if (viEl) viEl.innerHTML = viLines.map((line, i) => `<div style="${i > 0 ? 'margin-top: 4px;' : ''}">${line}</div>`).join('');

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
        outlineColor: isDark ? '#475569' : '#94a3b8',
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

function formatStudyTimeDisplay(totalMinutes) {
  const mins = Math.max(0, parseInt(totalMinutes, 10) || 0);
  if (mins < 60) {
    return `${mins} phút`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24) {
    return remMins > 0 ? `${hours} giờ ${remMins} phút` : `${hours} giờ`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days} ngày ${remHours} giờ` : `${days} ngày`;
}
window.formatStudyTimeDisplay = formatStudyTimeDisplay;

function calculateStreakFromHistory(dailyHistory) {
  if (!dailyHistory || typeof dailyHistory !== 'object') return 1;
  const dates = Object.keys(dailyHistory)
    .filter(d => (dailyHistory[d] || 0) > 0)
    .sort();
  if (dates.length === 0) return 1;

  const today = new Date();
  const todayStr = today.toLocaleDateString('sv');
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString('sv');

  let startStr = null;
  if (dates.includes(todayStr)) {
    startStr = todayStr;
  } else if (dates.includes(yesterdayStr)) {
    startStr = yesterdayStr;
  } else {
    startStr = dates[dates.length - 1];
  }

  let streak = 0;
  let checkDate = new Date(startStr);
  while (true) {
    const dateKey = checkDate.toLocaleDateString('sv');
    if (dailyHistory[dateKey] && dailyHistory[dateKey] > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return Math.max(streak, 1);
}
window.calculateStreakFromHistory = calculateStreakFromHistory;

function getDailyStudyHistoryKey() {
  if (currentUser && currentUser.email) {
    return `daily_study_history_${currentUser.email}`;
  }
  return 'daily_study_history_guest';
}

function getDailyStudyHistory() {
  try {
    const key = getDailyStudyHistoryKey();
    const raw = localStorage.getItem(key);
    let history = raw ? JSON.parse(raw) : {};

    // If user is logged in, also check if there was guest history to merge
    if (currentUser && currentUser.email) {
      const guestRaw = localStorage.getItem('daily_study_history_guest');
      if (guestRaw) {
        try {
          const guestHistory = JSON.parse(guestRaw);
          let merged = false;
          for (const [dateStr, secs] of Object.entries(guestHistory)) {
            if (secs && (!history[dateStr] || history[dateStr] < secs)) {
              history[dateStr] = secs;
              merged = true;
            }
          }
          if (merged) {
            localStorage.setItem(key, JSON.stringify(history));
          }
        } catch (e) {}
      }
    }
    return history;
  } catch (e) {
    return {};
  }
}

function saveDailyStudyHistory(history) {
  try {
    const key = getDailyStudyHistoryKey();
    localStorage.setItem(key, JSON.stringify(history));
  } catch (e) {}
}

function recordDailyStudyTime(secs) {
  if (!secs || secs <= 0) return;
  const todayStr = new Date().toLocaleDateString('sv'); // YYYY-MM-DD
  const history = getDailyStudyHistory();
  history[todayStr] = (history[todayStr] || 0) + secs;
  saveDailyStudyHistory(history);
  renderWeeklyStudyChart();
}

function renderWeeklyStudyChart() {
  const container = document.getElementById('home-weekly-chart-bars');
  if (!container) return;

  const history = getDailyStudyHistory();
  const now = new Date();

  // Get Monday of current week
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, ...
  const distanceToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  const mondayDate = new Date(now);
  mondayDate.setDate(now.getDate() - distanceToMonday);

  const dayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
  const todayStr = now.toLocaleDateString('sv');

  const weekDateStrs = [];
  const dayMinsMap = {};
  let weekPastMinsSum = 0;
  let weekSecsSum = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    const dateStr = d.toLocaleDateString('sv');
    weekDateStrs.push(dateStr);

    let recordedSecs = history[dateStr] || 0;
    if (dateStr === todayStr) {
      recordedSecs += sessionStudyTime;
    }
    weekSecsSum += recordedSecs;

    if (dateStr === todayStr) {
      dayMinsMap[dateStr] = 0;
    } else {
      // Past / future days in week:
      // Unstudied days (0s) remain 0 ('--').
      // Past studied days stay strictly fixed at Math.floor(recordedSecs / 60).
      const mins = Math.floor(recordedSecs / 60);
      dayMinsMap[dateStr] = mins;
      weekPastMinsSum += mins;
    }
  }

  // Today absorbs all current week minutes minus fixed past days,
  // ensuring extra rounding minutes are credited ONLY to today.
  const todaySecs = (history[todayStr] || 0) + sessionStudyTime;
  if (todaySecs > 0) {
    const weekTotalMins = Math.floor(weekSecsSum / 60);
    dayMinsMap[todayStr] = Math.max(Math.floor(todaySecs / 60), weekTotalMins - weekPastMinsSum);
  } else {
    dayMinsMap[todayStr] = 0;
  }

  let maxMins = 60; // baseline scale max
  for (let i = 0; i < 7; i++) {
    const dateStr = weekDateStrs[i];
    const m = dayMinsMap[dateStr] || 0;
    if (m > maxMins) maxMins = m;
  }

  let html = '';
  for (let i = 0; i < 7; i++) {
    const dateStr = weekDateStrs[i];
    const mins = dayMinsMap[dateStr] || 0;
    const isToday = dateStr === todayStr;

    const heightPct = mins > 0 ? Math.min(100, Math.max(22, Math.round((mins / maxMins) * 100))) : 12;
    const timeLabel = mins > 0 ? (mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 ? mins % 60 + 'm' : ''}` : `${mins}m`) : '--';

    const barGradient = isToday 
      ? 'linear-gradient(180deg, #f59e0b, #d97706); box-shadow: 0 4px 12px rgba(245,158,11,0.4);' 
      : (mins > 0 ? 'linear-gradient(180deg, #38bdf8, #2563eb); box-shadow: 0 4px 12px rgba(56,189,248,0.3);' : 'rgba(255,255,255,0.1);');

    const labelColor = isToday ? '#fbbf24; font-weight: 800;' : '#94a3b8; font-weight: 700;';
    const valColor = isToday ? '#fbbf24' : (mins > 0 ? '#38bdf8' : '#94a3b8');

    html += `
      <div class="chart-bar-col" style="display:flex; flex-direction:column; align-items:center; gap:8px; height:100%; justify-content:flex-end;">
        <div style="font-size:0.78rem; font-weight:800; color:${valColor};">${timeLabel}</div>
        <div style="width: 38px; height: ${heightPct}%; background: ${barGradient} border-radius: 10px 10px 4px 4px; transition: height 0.4s ease;"></div>
        <span style="font-size:0.85rem; color:${labelColor}">${dayLabels[i]}</span>
      </div>
    `;
  }

  container.innerHTML = html;
}
window.renderWeeklyStudyChart = renderWeeklyStudyChart;

function startStudyTimer() {
  window.__hasMainStudyTimer = true;
  if (activeTimer) clearInterval(activeTimer);
  activeTimer = setInterval(() => {
    if (document.hasFocus()) {
      sessionStudyTime++;

      const totalSecs = userStudyTime + sessionStudyTime;
      const mins = Math.floor(totalSecs / 60);
      const formattedText = formatStudyTimeDisplay(mins);

      const zubiStudyTime = document.getElementById('zubi-study-time-count');
      const homeTime = document.getElementById('home-time-val');
      const welcomeTime = document.getElementById('welcome-study-time-val');
      const modalTime = document.getElementById('zubi-modal-time-val');

      if (zubiStudyTime) zubiStudyTime.textContent = formattedText;
      if (homeTime) homeTime.textContent = formattedText;
      if (welcomeTime) welcomeTime.textContent = formattedText;
      if (modalTime) modalTime.textContent = formattedText;

      if (sessionStudyTime % 5 === 0) {
        renderWeeklyStudyChart();
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

  recordDailyStudyTime(increment);

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
        if (stats.dailyHistory && typeof stats.dailyHistory === 'object') {
          saveDailyStudyHistory(stats.dailyHistory);
        }
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
    if ((w.hskVersion || '3.0') !== activeHskVersion && (w.curriculum || 'hsk') !== activeRoadmapVersion) return;
    const key = `${w.curriculum || 'hsk'}_${w.hskVersion || '3.0'}_${w.level}_${w.lessonId}`;
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
  const zubiStreak = document.getElementById('zubi-streak-count');

  // Ensure userStudyTime and streak are consistent with history
  const history = getDailyStudyHistory();
  let totalHistorySecs = 0;
  Object.values(history).forEach(s => { totalHistorySecs += (s || 0); });
  if (totalHistorySecs > userStudyTime) {
    userStudyTime = totalHistorySecs;
  }
  const calcStreak = calculateStreakFromHistory(history);
  if (calcStreak > userStreak) {
    userStreak = calcStreak;
  }

  if (zubiStreak) zubiStreak.textContent = `${userStreak || 1} Ngày`;

  const activeVocabs = vocabList.filter(w => !w.isCustom);
  const totalMemorized = activeVocabs.filter(w => w.isMemorized).length;

  const textbookGroups = {};
  activeVocabs.forEach(w => {
    if (!w.level || !w.lessonId) return;
    if ((w.hskVersion || '3.0') !== activeHskVersion && (w.curriculum || 'hsk') !== activeRoadmapVersion) return;
    const key = `${w.curriculum || 'hsk'}_${w.hskVersion || '3.0'}_${w.level}_${w.lessonId}`;
    if (!textbookGroups[key]) textbookGroups[key] = [];
    textbookGroups[key].push(w);
  });

  const totalEnrolled = Object.keys(textbookGroups).length;
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
    const totalSecs = userStudyTime + sessionStudyTime;
    const mins = Math.floor(totalSecs / 60);
    if (mins >= 1440) { // >= 1 day
      const days = Math.floor(mins / 1440);
      const remHrs = Math.floor((mins % 1440) / 60);
      zubiStudyTime.textContent = remHrs > 0 ? `${days} ngày ${remHrs} giờ` : `${days} ngày`;
    } else if (mins >= 60) { // >= 1 hour
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      zubiStudyTime.textContent = remMins > 0 ? `${hrs} giờ ${remMins} phút` : `${hrs} giờ`;
    } else {
      const displayMins = Math.round(totalSecs / 60);
      zubiStudyTime.textContent = `${displayMins} phút`;
    }
  }

  // Render 100% dynamic overview table and recent cards
  renderZubiDashboardTableAndRecent();

  if (!pieSvg) return;

  const completedPct = enrolled > 0 ? Math.min(100, Math.round((completed / enrolled) * 100)) : 0;
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

function renderHomeLeaderboard() {
  const container = document.getElementById('home-leaderboard-list');
  if (!container) return;

  const API_BASE_URL = getResolvedApiBaseUrl();

  fetch(`${API_BASE_URL}/api/leaderboard`)
    .then(res => res.json())
    .then(data => {
      if (!container) return;
      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 16px;">Chưa có dữ liệu xếp hạng.</div>`;
        return;
      }

      // Display Top 20 Learners
      const top20Data = data.slice(0, 20);
      const rankBadges = ['🥇', '🥈', '🥉'];
      const rankColors = ['#fbbf24', '#cbd5e1', '#f97316'];
      const borderColors = ['rgba(245,158,11,0.35)', 'rgba(255,255,255,0.18)', 'rgba(249,115,22,0.25)'];

      let html = top20Data.map((item, idx) => {
        const medal = rankBadges[idx] || `<span style="font-size: 0.88rem; font-weight: 800; color: #94a3b8; width: 22px; text-align: center; display: inline-block;">${idx + 1}</span>`;
        const name = item.name || 'Học viên';
        const points = (item.completedCount || 0) * 100;
        const streak = item.streak || Math.max(1, item.completedCount || 1);
        const col = rankColors[idx] || '#38bdf8';
        const borderCol = borderColors[idx] || 'rgba(255,255,255,0.08)';
        const avatar = item.picture ? `<img src="${item.picture}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid ${col}; flex-shrink: 0;">` : `<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, ${col}, #2563eb); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.82rem; flex-shrink: 0;">${name.charAt(0).toUpperCase()}</div>`;

        return `
          <div style="background: rgba(255,255,255,0.05); border: 1px solid ${borderCol}; border-radius: 14px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
              <span style="font-size: 1.2rem; flex-shrink: 0;">${medal}</span>
              ${avatar}
              <div style="min-width: 0;">
                <div style="font-size: 0.92rem; font-weight: 800; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${name}</div>
                <div style="font-size: 0.78rem; color: ${col};">${streak} ngày liên tiếp</div>
              </div>
            </div>
            <span style="font-weight: 800; color: #10b981; font-size: 0.9rem; flex-shrink: 0;">+${points.toLocaleString()} điểm</span>
          </div>
        `;
      }).join('');

      container.innerHTML = html;
    })
    .catch(err => {
      console.warn('Load home leaderboard failed:', err);
    });
}
window.renderHomeLeaderboard = renderHomeLeaderboard;

function updateStatsUI() {
  const history = getDailyStudyHistory();
  let totalHistorySecs = 0;
  Object.values(history).forEach(s => { totalHistorySecs += (s || 0); });
  if (totalHistorySecs > userStudyTime) {
    userStudyTime = totalHistorySecs;
  }
  const calcStreak = calculateStreakFromHistory(history);
  if (calcStreak > userStreak) {
    userStreak = calcStreak;
  }

  const streakEl = document.getElementById('welcome-streak-val');
  const homeStreakEl = document.getElementById('home-streak-val');
  const completedEl = document.getElementById('welcome-completed-val');
  const studyTimeEl = document.getElementById('welcome-study-time-val');
  const homeTimeEl = document.getElementById('home-time-val');

  const zubiCompletedEl = document.getElementById('zubi-completed-count');
  const zubiTimeEl = document.getElementById('zubi-study-time-count');
  const zubiStreakEl = document.getElementById('zubi-streak-count');
  const zubiTotalWordsEl = document.getElementById('zubi-total-words-count');

  if (streakEl) streakEl.textContent = `${userStreak} ngày`;
  if (homeStreakEl) homeStreakEl.textContent = `${userStreak || 1}`;
  if (zubiStreakEl) zubiStreakEl.textContent = `${userStreak || 1} Ngày`;

  const minutes = Math.floor((userStudyTime + sessionStudyTime) / 60);
  const formattedTime = formatStudyTimeDisplay(minutes);

  if (studyTimeEl) studyTimeEl.textContent = formattedTime;
  if (homeTimeEl) homeTimeEl.textContent = formattedTime;
  if (zubiTimeEl) zubiTimeEl.textContent = formattedTime;

  const completedCount = calculateCompletedLessons();
  if (completedEl) completedEl.textContent = `${completedCount} bài`;
  if (zubiCompletedEl) zubiCompletedEl.textContent = `${completedCount} Bài`;

  if (zubiTotalWordsEl && Array.isArray(vocabList)) {
    zubiTotalWordsEl.textContent = `${vocabList.length.toLocaleString()} Từ`;
  }

  renderCourseCompletionDashboard();
  renderZubiDashboardTableAndRecent();
  renderWeeklyStudyChart();
  renderHomeLeaderboard();
}

window.selectCurriculumAndGo = function (curr, level, hskVersion) {
  // Navigate to the lesson list for this HSK level/version — same as clicking a roadmap node
  const ver = hskVersion || (curr === 'yct' ? 'yct' : activeHskVersion);
  window.goToRoadmapLevel(ver, level);
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

  // 1. Dynamic Overview Table Rows — all curricula (HSK 3.0, HSK 2.0, YCT)
  if (tableBody) {
    // Build tier entries for each curriculum separately
    const allTiers = [
      // ── HSK 3.0 ──
      { groupHeader: '🎓 HSK Chuẩn 3.0', type: 'header' },
      { name: 'HSK Cấp 1', curriculum: 'HSK Chuẩn (3.0)', hskVer: '3.0', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '1') && (w.hskVersion || '3.0') === '3.0', curriculumType: 'hsk', level: 1 },
      { name: 'HSK Cấp 2', curriculum: 'HSK Chuẩn (3.0)', hskVer: '3.0', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '2') && (w.hskVersion || '3.0') === '3.0', curriculumType: 'hsk', level: 2 },
      { name: 'HSK Cấp 3', curriculum: 'HSK Chuẩn (3.0)', hskVer: '3.0', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '3') && (w.hskVersion || '3.0') === '3.0', curriculumType: 'hsk', level: 3 },
      { name: 'HSK Cấp 4', curriculum: 'HSK Chuẩn (3.0)', hskVer: '3.0', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '4') && (w.hskVersion || '3.0') === '3.0', curriculumType: 'hsk', level: 4 },
      { name: 'HSK Cấp 5', curriculum: 'HSK Chuẩn (3.0)', hskVer: '3.0', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '5') && (w.hskVersion || '3.0') === '3.0', curriculumType: 'hsk', level: 5 },
      { name: 'HSK Cấp 6', curriculum: 'HSK Chuẩn (3.0)', hskVer: '3.0', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '6') && (w.hskVersion || '3.0') === '3.0', curriculumType: 'hsk', level: 6 },
      { name: 'HSK Cấp 7-8-9 (Cao cấp)', curriculum: 'HSK 3.0 Chuyên nghiệp', hskVer: '3.0', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '7-9') && (w.hskVersion || '3.0') === '3.0', curriculumType: 'hsk', level: '7-9' },
      // ── HSK 2.0 ──
      { groupHeader: '📘 HSK Chuẩn 2.0', type: 'header' },
      { name: 'HSK Cấp 1', curriculum: 'HSK Chuẩn (2.0)', hskVer: '2.0', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '1') && (w.hskVersion || '3.0') === '2.0', curriculumType: 'hsk', level: 1 },
      { name: 'HSK Cấp 2', curriculum: 'HSK Chuẩn (2.0)', hskVer: '2.0', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '2') && (w.hskVersion || '3.0') === '2.0', curriculumType: 'hsk', level: 2 },
      { name: 'HSK Cấp 3', curriculum: 'HSK Chuẩn (2.0)', hskVer: '2.0', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '3') && (w.hskVersion || '3.0') === '2.0', curriculumType: 'hsk', level: 3 },
      { name: 'HSK Cấp 4', curriculum: 'HSK Chuẩn (2.0)', hskVer: '2.0', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '4') && (w.hskVersion || '3.0') === '2.0', curriculumType: 'hsk', level: 4 },
      { name: 'HSK Cấp 5', curriculum: 'HSK Chuẩn (2.0)', hskVer: '2.0', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '5') && (w.hskVersion || '3.0') === '2.0', curriculumType: 'hsk', level: 5 },
      { name: 'HSK Cấp 6', curriculum: 'HSK Chuẩn (2.0)', hskVer: '2.0', filter: w => (w.curriculum === 'hsk' || !w.curriculum) && matchLevel(w.level, '6') && (w.hskVersion || '3.0') === '2.0', curriculumType: 'hsk', level: 6 },
      // ── YCT ──
      { groupHeader: '🌟 YCT – Tiếng Trung Thiếu nhi', type: 'header' },
      { name: 'YCT Cấp 1..4 (Thiếu nhi)', curriculum: 'Sắc màu YCT', hskVer: 'yct', filter: w => w.curriculum === 'yct' || w.hskVersion === 'yct', curriculumType: 'yct', level: 1 },
    ];

    let rowsHtml = '';
    allTiers.forEach((tier, idx) => {
      // Section header row
      if (tier.type === 'header') {
        rowsHtml += `
          <tr>
            <td colspan="6" style="padding: 12px 16px 6px; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted, #94a3b8); border-top: 1px solid rgba(255,255,255,0.07); border-bottom: none; background: transparent;">
              ${tier.groupHeader}
            </td>
          </tr>
        `;
        return;
      }

      const tierWords = builtInVocabs.filter(tier.filter);
      const total = tierWords.length;
      if (total === 0) return; // skip empty levels (e.g. HSK 2.0 level 7-9)
      const memorized = tierWords.filter(w => w.isMemorized).length;
      const pct = Math.round((memorized / total) * 100);

      const isTierUnlocked = isLevelUnlocked(tier.hskVer, tier.level, 0, [], builtInVocabs);

      let badgeHtml = '';
      if (!isTierUnlocked) {
        badgeHtml = `<span style="white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 700; background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);"><i class="fa-solid fa-lock" style="font-size: 0.7rem;"></i> Sắp ra mắt</span>`;
      } else if (pct === 0) {
        badgeHtml = `<span style="white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 700; background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.25);"><i class="fa-regular fa-circle" style="font-size: 0.7rem;"></i> Chưa học</span>`;
      } else if (pct === 100) {
        badgeHtml = `<span style="white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 700; background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35);"><i class="fa-solid fa-circle-check" style="font-size: 0.7rem;"></i> Đã thuộc 100%</span>`;
      } else {
        badgeHtml = `<span style="white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 700; background: rgba(217, 119, 6, 0.2); color: #fbbf24; border: 1px solid rgba(217, 119, 6, 0.35);"><i class="fa-solid fa-spinner fa-spin-pulse" style="font-size: 0.7rem;"></i> Đang học ${pct}%</span>`;
      }

      let btnHtml = '';
      if (isTierUnlocked) {
        btnHtml = `<button class="zubi-table-btn" style="background: rgba(59,130,246,0.15); color: #3b82f6; border: 1px solid rgba(59,130,246,0.3); padding: 6px 14px; border-radius: 8px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;" onclick="event.stopPropagation(); window.selectCurriculumAndGo('${tier.curriculumType}', '${tier.level}', '${tier.hskVer}')">Vào học <i class="fa-solid fa-arrow-right"></i></button>`;
      } else {
        btnHtml = `<button class="zubi-table-btn" style="background: rgba(100, 116, 139, 0.2); color: #94a3b8; border: 1px solid rgba(100, 116, 139, 0.3); padding: 6px 14px; border-radius: 8px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;" onclick="event.stopPropagation(); window.showComingSoonNotice('Lộ trình HSK ' + '${tier.level}' + (${tier.hskVer === '2.0' ? "' (2.0)'" : "''"}))"><i class="fa-solid fa-lock" style="color: #fbbf24;"></i> Khóa</button>`;
      }

      rowsHtml += `
        <tr style="cursor: pointer; transition: background 0.15s ease;" onclick="window.selectCurriculumAndGo('${tier.curriculumType}', '${tier.level}', '${tier.hskVer}')" onmouseover="this.style.background='rgba(59,130,246,0.08)'" onmouseout="this.style.background='transparent'">
          <td class="zubi-td" style="padding: 14px 16px;"><strong class="zubi-td-bold">${tier.name}</strong></td>
          <td class="zubi-td" style="padding: 14px 16px;">${tier.curriculum}</td>
          <td class="zubi-td" style="padding: 14px 16px;">${total.toLocaleString()} từ vựng</td>
          <td class="zubi-td" style="padding: 14px 16px;">
            <div class="zubi-progress-bar-wrap">
              <div class="zubi-progress-bar" style="width: ${pct}%;"></div>
            </div>
          </td>
          <td class="zubi-td" style="padding: 14px 16px;">${badgeHtml}</td>
          <td class="zubi-td" style="padding: 14px 16px;">
            ${btnHtml}
          </td>
        </tr>
      `;
    });
    tableBody.innerHTML = rowsHtml;
  }

  // 2. Dynamic Recent Lessons Grid — one card per curriculum+version actually in data
  if (recentGrid) {
    // Build distinct curriculum groups from real data
    const curricula = [];

    // HSK 3.0 — check if exists
    const hsk30Words = builtInVocabs.filter(w => (w.curriculum === 'hsk' || !w.curriculum) && (w.hskVersion || '3.0') === '3.0');
    if (hsk30Words.length > 0) {
      curricula.push({
        name: 'HSK Chuẩn 3.0 – Toàn bộ Cấp 1→7-9',
        curr: 'hsk', hskVer: '3.0', level: 1,
        words: hsk30Words,
        icon: '🎓'
      });
    }

    // HSK 2.0 — check if exists
    const hsk20Words = builtInVocabs.filter(w => (w.curriculum === 'hsk' || !w.curriculum) && (w.hskVersion || '3.0') === '2.0');
    if (hsk20Words.length > 0) {
      curricula.push({
        name: 'HSK Chuẩn 2.0 – Toàn bộ Cấp 1→6',
        curr: 'hsk', hskVer: '2.0', level: 1,
        words: hsk20Words,
        icon: '📘'
      });
    }

    // YCT — check if exists
    const yctWords = builtInVocabs.filter(w => w.curriculum === 'yct' || w.hskVersion === 'yct');
    if (yctWords.length > 0) {
      curricula.push({
        name: 'YCT – Tiếng Trung Thiếu nhi Cấp 1→4',
        curr: 'yct', hskVer: 'yct', level: 1,
        words: yctWords,
        icon: '🌟'
      });
    }

    const todayStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });

    let cardsHtml = '';
    curricula.forEach(les => {
      const count = les.words.length;
      const memorized = les.words.filter(w => w.isMemorized).length;
      const pct = count > 0 ? Math.round((memorized / count) * 100) : 0;

      let pillBg, pillColor, pillText;
      if (pct === 0) {
        pillBg = 'rgba(239,68,68,0.2)'; pillColor = '#f87171'; pillText = 'Chưa học';
      } else if (pct === 100) {
        pillBg = 'rgba(16,185,129,0.2)'; pillColor = '#34d399'; pillText = 'Hoàn thành';
      } else {
        pillBg = 'rgba(217,119,6,0.2)'; pillColor = '#fbbf24'; pillText = `Đang học ${pct}%`;
      }

      cardsHtml += `
        <div class="zubi-recent-card" style="backdrop-filter: blur(24px) saturate(180%); border-radius: 16px; padding: 20px 22px; box-shadow: 0 4px 16px rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.12); display: flex; flex-direction: column; gap: 14px; cursor: pointer;" onclick="window.goToRoadmapLevel('${les.hskVer}', '${les.level}')">
          <div class="recent-card-top" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
            <div class="recent-title" style="font-weight: 700; font-size: 0.95rem; color: #f8fafc; line-height: 1.3;">${les.icon} ${les.name}</div>
          </div>
          <div class="recent-val green-text" style="font-family: var(--font-display,sans-serif); font-size: 1.6rem; font-weight: 800; color: #10b981;">${count.toLocaleString()} từ vựng</div>
          <div class="recent-card-footer" style="display: flex; justify-content: space-between; align-items: center;">
            <span style="padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; background: ${pillBg}; color: ${pillColor};">${pillText}</span>
            <span style="font-size: 0.8rem; color: #94a3b8; font-weight: 500;">${todayStr}</span>
          </div>
        </div>
      `;
    });
    recentGrid.innerHTML = cardsHtml || '<p style="color:var(--text-muted);padding:16px;">Không có dữ liệu.</p>';
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

    // Đếm TẤT CẢ bài học thuộc mọi bộ giáo trình (HSK 2.0 + HSK 3.0 + YCT)
    const textbookGroups = {};
    builtIn.forEach(w => {
      if (!w.level || !w.lessonId) return;
      const key = `${w.curriculum || 'hsk'}_${w.hskVersion || '3.0'}_${w.level}_${w.lessonId}`;
      if (!textbookGroups[key]) textbookGroups[key] = { key, level: w.level, lessonId: w.lessonId, curr: w.curriculum || 'hsk', ver: w.hskVersion || '3.0', words: [] };
      textbookGroups[key].words.push(w);
    });

    const completedLessons = Object.values(textbookGroups).filter(g => g.words.length > 0 && g.words.every(w => w.isMemorized));
    const totalLessons = Object.keys(textbookGroups).length;

    // Phân loại số bài đã xong theo từng giáo trình
    const doneHsk3 = completedLessons.filter(g => !g.ver.toString().toLowerCase().includes('yct') && (g.ver === '3.0' || g.ver === 3 || !g.ver)).length;
    const doneHsk2 = completedLessons.filter(g => !g.ver.toString().toLowerCase().includes('yct') && (g.ver === '2.0' || g.ver === 2)).length;
    const doneYct  = completedLessons.filter(g => g.ver.toString().toLowerCase().includes('yct') || (g.curr || '').toLowerCase().includes('yct')).length;

    const totalHsk3 = Object.values(textbookGroups).filter(g => !g.ver.toString().toLowerCase().includes('yct') && (g.ver === '3.0' || g.ver === 3 || !g.ver)).length;
    const totalHsk2 = Object.values(textbookGroups).filter(g => !g.ver.toString().toLowerCase().includes('yct') && (g.ver === '2.0' || g.ver === 2)).length;
    const totalYct  = Object.values(textbookGroups).filter(g => g.ver.toString().toLowerCase().includes('yct') || (g.curr || '').toLowerCase().includes('yct')).length;

    let html = `
      <div style="background: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 16px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <div>
          <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #ec4899; font-weight: 700;">Tổng số bài đã xong (Tất cả giáo trình)</span>
          <h2 style="font-size: 1.8rem; font-weight: 800; color: #ffffff; margin: 4px 0 0 0;">${completedLessons.length} / ${totalLessons} Bài</h2>
        </div>
        <div style="font-size: 2.2rem; color: #ec4899; opacity: 0.8;"><i class="fa-solid fa-trophy"></i></div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 14px;">
        <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; padding: 12px; text-align: center;">
          <div style="font-size: 0.72rem; color: #60a5fa; font-weight: 700; text-transform: uppercase;">HSK 3.0</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: #fff; margin-top: 4px;">${doneHsk3} / ${totalHsk3}</div>
        </div>
        <div style="background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3); border-radius: 12px; padding: 12px; text-align: center;">
          <div style="font-size: 0.72rem; color: #c084fc; font-weight: 700; text-transform: uppercase;">HSK 2.0</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: #fff; margin-top: 4px;">${doneHsk2} / ${totalHsk2}</div>
        </div>
        <div style="background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); border-radius: 12px; padding: 12px; text-align: center;">
          <div style="font-size: 0.72rem; color: #fbbf24; font-weight: 700; text-transform: uppercase;">YCT</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: #fff; margin-top: 4px;">${doneYct} / ${totalYct}</div>
        </div>
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
        // Nhãn giáo trình
        const isYct = les.ver.toString().toLowerCase().includes('yct') || (les.curr || '').toLowerCase().includes('yct');
        const isHsk2 = !isYct && (les.ver === '2.0' || les.ver === 2);
        const currLabel = isYct ? 'YCT' : isHsk2 ? 'HSK 2.0' : 'HSK 3.0';
        const currColor = isYct ? '#fbbf24' : isHsk2 ? '#c084fc' : '#60a5fa';
        html += `
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="color: #f8fafc; font-size: 0.95rem;">${fullTitle}</strong>
              <div style="font-size: 0.8rem; color: #94a3b8;">${les.words.length} từ vựng đã ghi nhớ &nbsp;·&nbsp; <span style="color: ${currColor}; font-weight: 700;">${currLabel}</span></div>
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
    const timeDisplay = formatStudyTimeDisplay(mins);

    bodyEl.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div style="background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 16px; padding: 18px; text-align: center;">
          <div style="font-size: 0.8rem; color: #60a5fa; font-weight: 700; text-transform: uppercase;">Tổng thời gian đã học</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #ffffff; margin-top: 6px;" id="zubi-modal-time-val">${timeDisplay}</div>
        </div>
        <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; padding: 18px; text-align: center;">
          <div style="font-size: 0.8rem; color: #fbbf24; font-weight: 700; text-transform: uppercase;">Chuỗi ngày liên tục (Streak)</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #ffffff; margin-top: 6px;">🔥 ${userStreak || 1} ngày</div>
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

  } else if (type === 'streak') {
    titleEl.textContent = 'Ngày tham gia học (Streak)';
    subtitleEl.textContent = 'Thống kê chuỗi ngày duy trì thói quen học tập liên tục';
    iconEl.className = 'zubi-circle-icon orange';
    iconEl.style.background = 'rgba(249, 115, 22, 0.2)';
    iconEl.style.color = '#f97316';
    iconEl.innerHTML = '<i class="fa-solid fa-fire"></i>';

    const totalCurrentSecs = userStudyTime + sessionStudyTime;
    const mins = Math.floor(totalCurrentSecs / 60);
    const timeDisplay = formatStudyTimeDisplay(mins);

    bodyEl.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
        <div style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 16px; padding: 18px; text-align: center;">
          <div style="font-size: 0.8rem; color: #fbbf24; font-weight: 700; text-transform: uppercase;">Chuỗi ngày liên tục</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #ffffff; margin-top: 6px;">🔥 ${userStreak || 1} ngày</div>
        </div>
        <div style="background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 16px; padding: 18px; text-align: center;">
          <div style="font-size: 0.8rem; color: #60a5fa; font-weight: 700; text-transform: uppercase;">Tổng thời gian học</div>
          <div style="font-size: 1.6rem; font-weight: 800; color: #ffffff; margin-top: 6px;">${timeDisplay}</div>
        </div>
      </div>
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 18px; display: flex; gap: 14px; align-items: flex-start;">
        <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(249, 115, 22, 0.2); color: #f97316; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.1rem;"><i class="fa-solid fa-fire"></i></div>
        <div>
          <strong style="color: #ffffff; font-size: 0.95rem;">Giữ vững thói quen học tập:</strong>
          <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 0.85rem; line-height: 1.5;">Học mỗi ngày ít nhất 1 bài học hoặc 10 từ vựng để giữ lửa streak và tiếp thu kiến thức một cách tự nhiên nhất!</p>
        </div>
      </div>
    `;

  } else if (type === 'enrolled') {
    const activeVocabs = vocabList.filter(w => !w.isCustom);

    // Group lessons dynamically (Thống nhất 100% key với Dashboard)
    const hsk3Lessons = new Set();
    const hsk2Lessons = new Set();
    const yctLessons = new Set();

    activeVocabs.forEach(w => {
      if (!w.level || !w.lessonId) return;
      const curr = w.curriculum || 'hsk';
      const ver = w.hskVersion || '3.0';
      const key = `${curr}_${ver}_${w.level}_${w.lessonId}`;

      const isY = curr.toString().toLowerCase().includes('yct') || ver.toString().toLowerCase().includes('yct');
      const isHsk2 = !isY && (ver === '2.0' || ver === 2);
      const isHsk3 = !isY && (ver === '3.0' || ver === 3 || !ver);

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
    const activeVocabs = vocabList.filter(w => !w.isCustom);
    titleEl.textContent = 'Thống kê Từ vựng HSK & YCT';
    subtitleEl.textContent = `Phân bổ ${activeVocabs.length.toLocaleString()} từ vựng HSK 3.0 & 2.0 chuẩn hóa`;
    iconEl.className = 'zubi-circle-icon cyan';
    iconEl.style.background = 'rgba(2, 132, 199, 0.2)';
    iconEl.style.color = '#38bdf8';
    iconEl.innerHTML = '<i class="fa-solid fa-layer-group"></i>';

    const hsk30Levels = {};
    const hsk20Levels = {};
    const yctLevels = {};

    let hsk30Total = 0;
    let hsk20Total = 0;
    let yctTotal = 0;

    activeVocabs.forEach(w => {
      const curr = (w.curriculum || '').toString().toLowerCase();
      const ver = (w.hskVersion || '').toString().toLowerCase();
      const levelStr = (w.level || '1').toString();

      const isYct = curr.includes('yct') || ver.includes('yct');
      const isHsk2 = !isYct && (ver.includes('2') || ver === '2.0');

      if (isYct) {
        yctLevels[levelStr] = (yctLevels[levelStr] || 0) + 1;
        yctTotal++;
      } else if (isHsk2) {
        hsk20Levels[levelStr] = (hsk20Levels[levelStr] || 0) + 1;
        hsk20Total++;
      } else {
        hsk30Levels[levelStr] = (hsk30Levels[levelStr] || 0) + 1;
        hsk30Total++;
      }
    });

    // Generate HSK 3.0 Level rows
    const hsk30Rows = Object.keys(hsk30Levels).sort((a, b) => parseInt(a) - parseInt(b)).map(lvl => `
      <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #cbd5e1;">
        <span>HSK 3.0 Cấp ${lvl}</span>
        <strong style="color: #ffffff;">${hsk30Levels[lvl].toLocaleString()} từ</strong>
      </div>
    `).join('');

    // Generate HSK 2.0 Level rows
    const hsk20Rows = Object.keys(hsk20Levels).sort((a, b) => parseInt(a) - parseInt(b)).map(lvl => `
      <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #cbd5e1;">
        <span>HSK 2.0 Cấp ${lvl} ${parseInt(lvl) >= 4 ? '(Thượng & Hạ)' : ''}</span>
        <strong style="color: #ffffff;">${hsk20Levels[lvl].toLocaleString()} từ</strong>
      </div>
    `).join('');

    // Generate YCT Level rows
    const yctRows = Object.keys(yctLevels).sort((a, b) => parseInt(a) - parseInt(b)).map(lvl => `
      <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #cbd5e1;">
        <span>YCT Cấp ${lvl}</span>
        <strong style="color: #ffffff;">${yctLevels[lvl].toLocaleString()} từ</strong>
      </div>
    `).join('');

    bodyEl.innerHTML = `
      <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div>
          <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #38bdf8; font-weight: 700;">TỔNG TỪ VỰNG CHUẨN HÓA</span>
          <h2 style="font-size: 1.8rem; font-weight: 800; color: #ffffff; margin: 4px 0 0 0;">${activeVocabs.length.toLocaleString()} Từ</h2>
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
            ${hsk30Rows}
          </div>
        </div>

        <!-- HSK 2.0 Section -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 14px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px; margin-bottom: 10px;">
            <strong style="color: #c084fc; font-size: 0.95rem;"><i class="fa-solid fa-book-open"></i> Phân Loại HSK 2.0 (6 Cấp Cũ)</strong>
            <span style="background: rgba(168, 85, 247, 0.2); color: #c084fc; font-weight: 800; font-size: 0.85rem; padding: 2px 8px; border-radius: 10px;">${hsk20Total.toLocaleString()} từ</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${hsk20Rows}
          </div>
        </div>

        <!-- YCT Section -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 14px; padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px; margin-bottom: 10px;">
            <strong style="color: #fbbf24; font-size: 0.95rem;"><i class="fa-solid fa-child"></i> YCT Cấp 1..4 (Thiếu Nhi)</strong>
            <span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; font-weight: 800; font-size: 0.85rem; padding: 2px 8px; border-radius: 10px;">${yctTotal.toLocaleString()} từ</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
            ${yctRows}
          </div>
        </div>
      </div>
    `;
  }

  modal.style.display = 'flex';
};

async function loadInitialStats() {
  if (currentUser) {
    const userKey = currentUser._id || currentUser.id || currentUser.email || 'user';
    try {
      const response = await fetch(API_BASE_URL + '/api/user/stats', {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (response.ok) {
        const stats = await response.json();
        userStreak = stats.streak || 0;
        userStudyTime = stats.studyTime || 0;

        // Save user's exact backend CSDL dailyHistory
        const userHistory = stats.dailyHistory || {};
        saveDailyStudyHistory(userHistory);
      }
    } catch (err) {
      console.error('Failed to load user stats:', err);
    }
  }

  // Integrity validation from dailyStudyHistory
  const history = getDailyStudyHistory();
  let totalHistorySecs = 0;
  Object.values(history).forEach(s => { totalHistorySecs += (s || 0); });
  if (totalHistorySecs > userStudyTime) {
    userStudyTime = totalHistorySecs;
  }
  const calcStreak = calculateStreakFromHistory(history);
  if (calcStreak > userStreak) {
    userStreak = calcStreak;
  }

  if (currentUser) {
    const userKey = currentUser._id || currentUser.id || currentUser.email || 'user';
    localStorage.setItem(`user_stats_${userKey}`, JSON.stringify({
      streak: userStreak,
      studyTime: userStudyTime
    }));
  }

  updateStatsUI();
  renderWeeklyStudyChart();
}

// --- DYNAMIC NOTEBOOK BUILDER (TẠO SỔ TAY MỚI TỰ CHỌN TỪ VỰNG) ---
let createNbVersion = '3.0';
let createNbLevel = '1';
let createNbLesson = 'all';
let createNbSelectedWordsMap = new Map(); // wordId -> wordObj

window.openCreateNotebookModal = function() {
  const modal = document.getElementById('create-notebook-modal');
  if (!modal) return;

  const nameInput = document.getElementById('create-nb-name-input');
  if (nameInput) nameInput.value = '';

  const searchInput = document.getElementById('create-nb-word-search-input');
  if (searchInput) searchInput.value = '';

  createNbVersion = '3.0';
  createNbLevel = '1';
  createNbLesson = 'all';
  createNbSelectedWordsMap.clear();

  updateCreateNbPillsUI();
  renderCreateNbLevelPills();
  renderCreateNbLessonPills();
  window.renderCreateNbWordsList();
  updateCreateNbSelectedBadge();

  modal.style.display = 'flex';
};

window.setCreateNbVersion = function(ver) {
  createNbVersion = ver;
  if (ver === 'premium') {
    createNbLevel = 'Du lịch';
  } else if (ver === 'yct') {
    createNbLevel = '1';
  } else {
    createNbLevel = '1';
  }
  createNbLesson = 'all';

  updateCreateNbPillsUI();
  renderCreateNbLevelPills();
  renderCreateNbLessonPills();
  window.renderCreateNbWordsList();
};

function updateCreateNbPillsUI() {
  const vPills = document.querySelectorAll('#create-nb-version-pills .nb-picker-pill');
  vPills.forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-ver') === createNbVersion);
  });
}

function renderCreateNbLevelPills() {
  const container = document.getElementById('create-nb-level-pills');
  if (!container) return;

  let levels = [];
  if (createNbVersion === '3.0') {
    levels = [
      { id: '1', name: 'HSK 1' },
      { id: '2', name: 'HSK 2' },
      { id: '3', name: 'HSK 3' },
      { id: '4', name: 'HSK 4' },
      { id: '5', name: 'HSK 5' },
      { id: '6', name: 'HSK 6' },
      { id: '7-9', name: 'HSK 7-8-9' }
    ];
  } else if (createNbVersion === '2.0') {
    levels = [
      { id: '1', name: 'HSK 1' },
      { id: '2', name: 'HSK 2' },
      { id: '3', name: 'HSK 3' },
      { id: '4', name: 'HSK 4' },
      { id: '5', name: 'HSK 5' },
      { id: '6', name: 'HSK 6' }
    ];
  } else if (createNbVersion === 'yct') {
    levels = [
      { id: '1', name: 'YCT 1' },
      { id: '2', name: 'YCT 2' },
      { id: '3', name: 'YCT 3' },
      { id: '4', name: 'YCT 4' }
    ];
  } else if (createNbVersion === 'premium') {
    levels = [
      { id: 'Du lịch', name: '✈️ Du lịch' },
      { id: 'Công sở', name: '💼 Công sở' },
      { id: 'Đàm phán', name: '🤝 Đàm phán' }
    ];
  }

  container.innerHTML = levels.map(l => {
    return `
      <button type="button" class="nb-picker-pill ${String(createNbLevel) === String(l.id) ? 'active' : ''}" onclick="window.setCreateNbLevel('${l.id}')">
        ${l.name}
      </button>
    `;
  }).join('');
}

window.setCreateNbLevel = function(lvl) {
  createNbLevel = lvl;
  createNbLesson = 'all';
  renderCreateNbLevelPills();
  renderCreateNbLessonPills();
  window.renderCreateNbWordsList();
};

function renderCreateNbLessonPills() {
  const lessonContainer = document.getElementById('create-nb-lesson-container');
  const pillsWrap = document.getElementById('create-nb-lesson-pills');
  if (!lessonContainer || !pillsWrap) return;

  if (createNbVersion === 'premium') {
    lessonContainer.style.display = 'none';
    return;
  }

  lessonContainer.style.display = 'flex';

  // Find all available words for this version & level
  const baseWords = vocabList.filter(w => {
    if (w.isCustom) return false;
    if (createNbVersion === 'yct') {
      return (w.curriculum === 'yct' || w.hskVersion === 'yct') && String(w.level) === String(createNbLevel);
    }
    return (w.hskVersion || '3.0') === createNbVersion && w.curriculum !== 'yct' && matchLevel(w.level, createNbLevel);
  });

  const uniqueLessons = {};
  baseWords.forEach(w => {
    if (w.lessonId) {
      uniqueLessons[w.lessonId] = w.lessonTitle || `Bài ${w.lessonId}`;
    }
  });

  const sortedLessonIds = Object.keys(uniqueLessons).map(Number).sort((a, b) => a - b);

  let html = `
    <button type="button" class="nb-picker-pill ${createNbLesson === 'all' ? 'active' : ''}" onclick="window.setCreateNbLesson('all')">
      Tất cả bài (${baseWords.length} từ)
    </button>
  `;

  sortedLessonIds.forEach(id => {
    const lessonWords = baseWords.filter(w => String(w.lessonId || 1) === String(id));
    html += `
      <button type="button" class="nb-picker-pill ${String(createNbLesson) === String(id) ? 'active' : ''}" onclick="window.setCreateNbLesson('${id}')">
        ${uniqueLessons[id]} (${lessonWords.length})
      </button>
    `;
  });

  pillsWrap.innerHTML = html;
}

window.setCreateNbLesson = function(lessonId) {
  createNbLesson = lessonId;
  renderCreateNbLessonPills();
  window.renderCreateNbWordsList();
};

function getFilteredWordsForCreatePicker() {
  let list = vocabList.filter(w => !w.isCustom);

  if (createNbVersion === 'premium') {
    list = list.filter(w => w.level === 'premium');
    if (createNbLevel) {
      list = list.filter(w => w.category === createNbLevel);
    }
  } else if (createNbVersion === 'yct') {
    list = list.filter(w => (w.curriculum === 'yct' || w.hskVersion === 'yct') && String(w.level) === String(createNbLevel));
  } else {
    list = list.filter(w => (w.hskVersion || '3.0') === createNbVersion && w.curriculum !== 'yct' && matchLevel(w.level, createNbLevel));
    if (createNbLesson && createNbLesson !== 'all') {
      list = list.filter(w => String(w.lessonId || 1) === String(createNbLesson));
    }
  }

  const searchInput = document.getElementById('create-nb-word-search-input');
  const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
  if (q) {
    list = list.filter(w => {
      const char = (w.word || w.simplified || w.character || '').toLowerCase();
      const py = (w.pinyin || '').toLowerCase();
      const vi = (w.meaning || w.definition || w.vietnamese || '').toLowerCase();
      const hv = (w.hanViet || '').toLowerCase();
      return char.includes(q) || py.includes(q) || vi.includes(q) || hv.includes(q);
    });
  }

  return list;
}

window.renderCreateNbWordsList = function() {
  const container = document.getElementById('create-nb-words-list-container');
  const countEl = document.getElementById('create-nb-filter-matched-count');
  if (!container) return;

  const matchedWords = getFilteredWordsForCreatePicker();
  if (countEl) countEl.textContent = `${matchedWords.length} từ phù hợp`;

  if (matchedWords.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 32px 16px; color: #94a3b8; font-size: 0.9rem;">
        <i class="fa-solid fa-folder-open" style="font-size: 2rem; margin-bottom: 8px; opacity: 0.5; display: block;"></i>
        Không tìm thấy từ vựng nào phù hợp với bộ lọc hiện tại.
      </div>
    `;
    return;
  }

  container.innerHTML = matchedWords.map(w => {
    const isSelected = createNbSelectedWordsMap.has(w.id);
    const char = w.word || w.simplified || w.character || '';
    const py = w.pinyin || '';
    const vi = w.meaning || w.definition || w.vietnamese || '';
    const lvlText = (w.level === 'premium') ? w.category : `HSK ${w.level}`;

    return `
      <div class="create-nb-word-row ${isSelected ? 'selected' : ''}" onclick="window.toggleCreateNbWordSelection('${w.id}')">
        <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); window.toggleCreateNbWordSelection('${w.id}')" style="width: 18px; height: 18px; cursor: pointer; accent-color: #10b981;">
        <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-display); color: #ffffff; min-width: 70px;">
          ${char}
        </div>
        <div style="font-size: 0.88rem; font-weight: 700; color: #38bdf8; min-width: 100px;">
          ${py}
        </div>
        <div style="font-size: 0.85rem; color: #cbd5e1; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${vi}
        </div>
        <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 6px; background: rgba(255,255,255,0.06); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); white-space: nowrap;">
          ${lvlText}
        </span>
        <button type="button" onclick="event.stopPropagation(); window.speakLessonWord('${char.replace(/'/g, "\\'")}')" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.75rem;">
          <i class="fa-solid fa-volume-high"></i>
        </button>
      </div>
    `;
  }).join('');
};

window.toggleCreateNbWordSelection = function(wordId) {
  if (createNbSelectedWordsMap.has(wordId)) {
    createNbSelectedWordsMap.delete(wordId);
  } else {
    const w = vocabList.find(item => item.id === wordId);
    if (w) createNbSelectedWordsMap.set(wordId, w);
  }

  updateCreateNbSelectedBadge();
  window.renderCreateNbWordsList();
};

window.createNbSelectAllVisible = function(selectAll) {
  const visible = getFilteredWordsForCreatePicker();
  visible.forEach(w => {
    if (selectAll) {
      createNbSelectedWordsMap.set(w.id, w);
    } else {
      createNbSelectedWordsMap.delete(w.id);
    }
  });

  updateCreateNbSelectedBadge();
  window.renderCreateNbWordsList();
};

function updateCreateNbSelectedBadge() {
  const count = createNbSelectedWordsMap.size;
  const badge = document.getElementById('create-nb-total-selected-badge');
  if (badge) badge.textContent = `${count} từ`;
}

window.submitCreateCustomNotebook = async function() {
  const nameInput = document.getElementById('create-nb-name-input');
  const name = nameInput ? nameInput.value.trim() : '';

  if (!name) {
    showToast('Vui lòng nhập tên cho sổ tay mới!', true);
    if (nameInput) nameInput.focus();
    return;
  }

  if (customLists.includes(name)) {
    showToast('Tên sổ tay này đã tồn tại, vui lòng đặt tên khác!', true);
    if (nameInput) nameInput.focus();
    return;
  }

  if (createNbSelectedWordsMap.size === 0) {
    showToast('Vui lòng tick chọn ít nhất 1 từ vựng để thêm vào sổ tay!', true);
    return;
  }

  const selectedWords = Array.from(createNbSelectedWordsMap.values());

  // 1. Add list to customLists
  customLists.push(name);
  const userKey = currentUser ? currentUser.email : 'guest';
  localStorage.setItem(`custom_lists_${userKey}`, JSON.stringify(customLists));

  // 2. Clone selected words with isCustom: true and category: name
  const createdWords = [];
  selectedWords.forEach(w => {
    const clone = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
      word: w.word || w.simplified || w.character || '',
      pinyin: w.pinyin || '',
      meaning: w.meaning || w.definition || w.vietnamese || '',
      hanViet: w.hanViet || '',
      level: 'custom',
      category: name,
      explanation: w.explanation || w.note || '',
      example_zh: w.example_zh || w.example || '',
      example_pinyin: w.example_pinyin || '',
      example_vi: w.example_vi || '',
      isCustom: true,
      isStarred: !!w.isStarred,
      isStudied: false,
      isMemorized: false,
      isWrong: false
    };
    createdWords.push(clone);
    vocabList.push(clone);
  });

  // Save custom words to localStorage
  const guestCustom = JSON.parse(localStorage.getItem('guest_custom_words') || '[]');
  guestCustom.push(...createdWords);
  localStorage.setItem('guest_custom_words', JSON.stringify(guestCustom));

  // Close modal
  const modal = document.getElementById('create-notebook-modal');
  if (modal) modal.style.display = 'none';

  // Refresh UI
  renderHubCustomNotebooks();
  updateStats();
  applyFilters();

  showToast(`🎉 Đã tạo sổ tay "${name}" thành công với ${createdWords.length} từ vựng!`);

  // Navigate directly into this notebook dashboard
  showNotebookDashboardView(`custom:${name}`);
};

window.deleteCustomNotebook = function(name) {
  if (name === 'Mặc định') return;
  if (!confirm(`Bạn có chắc chắn muốn xóa sổ tay "${name}"? Các từ vựng trong sổ tay này sẽ bị xóa khỏi danh sách cá nhân.`)) return;

  vocabList = vocabList.filter(w => !(w.isCustom && w.category === name));
  customLists = customLists.filter(l => l !== name);

  const userKey = currentUser ? currentUser.email : 'guest';
  localStorage.setItem(`custom_lists_${userKey}`, JSON.stringify(customLists));

  const guestCustom = JSON.parse(localStorage.getItem('guest_custom_words') || '[]');
  const filteredGuest = guestCustom.filter(w => w.category !== name);
  localStorage.setItem('guest_custom_words', JSON.stringify(filteredGuest));

  renderHubCustomNotebooks();
  showTopicsView();
  showToast(`Đã xóa sổ tay "${name}".`);
};

function renderHubCustomNotebooks() {
  const grid = document.getElementById('hub-custom-notebooks-grid');
  const starredBadge = document.getElementById('hub-starred-badge');
  const wrongBadge = document.getElementById('hub-wrong-badge');

  // Update live counts on main hub cards
  const starredCount = vocabList.filter(w => w.isStarred).length;
  const wrongCount = vocabList.filter(w => w.isWrong).length;

  if (starredBadge) starredBadge.textContent = `${starredCount} từ ⭐`;
  if (wrongBadge) wrongBadge.textContent = `${wrongCount} từ sai`;

  if (!grid) return;

  // Filter custom lists (ignoring empty default if empty)
  const validLists = customLists.filter(name => {
    const count = vocabList.filter(w => w.isCustom && w.category === name).length;
    return count > 0 || name !== 'Mặc định';
  });

  if (validLists.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 28px 16px; background: rgba(255,255,255,0.02); border: 1.5px dashed rgba(255,255,255,0.15); border-radius: 14px; color: #94a3b8;">
        <i class="fa-solid fa-folder-plus" style="font-size: 2rem; color: #38bdf8; margin-bottom: 8px; display: block; opacity: 0.8;"></i>
        <div style="font-weight: 700; font-size: 0.95rem; color: #ffffff; margin-bottom: 4px;">Bạn chưa có sổ tay tự tạo nào</div>
        <div style="font-size: 0.82rem; margin-bottom: 12px;">Hãy bấm nút <strong>"+ Tạo Sổ Tay Mới"</strong> ở góc trên để tự chọn từ vựng HSK theo nhu cầu nhé!</div>
        <button onclick="window.openCreateNotebookModal()" class="btn btn-sm btn-primary" style="border-radius: 10px; padding: 6px 16px; font-weight: 700; cursor: pointer;">
          <i class="fa-solid fa-plus"></i> Tạo Sổ Tay Đầu Tiên
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = validLists.map(name => {
    const listWords = vocabList.filter(w => w.isCustom && w.category === name);
    return `
      <div class="custom-nb-hub-card">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">
              <i class="fa-solid fa-book"></i>
            </div>
            <div>
              <h4 style="margin: 0; font-size: 0.98rem; font-weight: 800; color: var(--text-primary); font-family: var(--font-display);">${name}</h4>
              <span style="font-size: 0.76rem; color: var(--text-secondary); font-weight: 600;">${listWords.length} từ vựng</span>
            </div>
          </div>
          ${name !== 'Mặc định' ? `
            <button onclick="event.stopPropagation(); window.deleteCustomNotebook('${name.replace(/'/g, "\\'")}')" title="Xóa sổ tay này" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); color: #f87171; border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.78rem;">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          ` : ''}
        </div>

        <div style="display: flex; gap: 8px; margin-top: 4px;">
          <button onclick="window.showNotebookDashboardView('custom:${name.replace(/'/g, "\\'")}')" class="btn btn-sm btn-primary" style="flex: 1; border-radius: 10px; font-weight: 700; font-size: 0.82rem; padding: 7px; cursor: pointer;">
            <i class="fa-solid fa-play"></i> Vào Ôn Tập
          </button>
        </div>
      </div>
    `;
  }).join('');
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

  const quickCards = document.querySelector('.quick-dashboard-cards');
  if (quickCards) quickCards.style.display = 'none';

  const statsSummary = document.querySelector('.stats-summary-container');
  if (statsSummary) statsSummary.style.display = 'none';

  const controlsDash = document.querySelector('.controls-dashboard');
  if (controlsDash) controlsDash.style.display = 'none';

  if (selectionView) selectionView.style.display = 'block';
  if (topicsView) topicsView.style.display = 'block';
  if (subdecksView) subdecksView.style.display = 'none';
  if (dashboardView) dashboardView.style.display = 'none';
  if (studyView) studyView.style.display = 'none';
  if (quizView) quizView.style.display = 'none';

  activeNotebook = null;
  studyNotebookId = null;
  isLessonVocabStudyMode = false;

  renderHubCustomNotebooks();
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

window.showNotebookDashboardView = showNotebookDashboardView;
window.showTopicsView = showTopicsView;
window.showSubdecksView = showSubdecksView;
window.renderHubCustomNotebooks = renderHubCustomNotebooks;

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
  } else if (notebookId.startsWith('yct:')) {
    const lvl = notebookId.substring(4);
    return vocabList.filter(w => !w.isCustom && (w.curriculum === 'yct' || w.hskVersion === 'yct') && String(w.level) === String(lvl));
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

    // Create New Notebook Action Card
    const createCard = document.createElement('div');
    createCard.className = 'subdeck-card glass-panel';
    createCard.style.cssText = 'padding: 24px; text-align: center; cursor: pointer; border-radius: var(--radius-lg); transition: all 0.3s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; border: 1.5px dashed rgba(56, 189, 248, 0.45); background: rgba(56, 189, 248, 0.05);';
    createCard.onclick = () => window.openCreateNotebookModal();
    createCard.innerHTML = `
      <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(56, 189, 248, 0.15); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
        <i class="fa-solid fa-plus"></i>
      </div>
      <h4 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: #38bdf8; font-family: var(--font-display);">+ Tạo Sổ Tay Mới</h4>
      <p style="margin: 0; font-size: 0.82rem; color: var(--text-secondary);">Tự chọn từ vựng HSK gom vào sổ tay cá nhân</p>
    `;
    grid.appendChild(createCard);
  }
  else if (activeSmartTopic === 'hsk') {
    title.textContent = 'Danh sách Từ vựng';
    if (activeHskVersion === 'yct') {
      for (let lvl = 1; lvl <= 4; lvl++) {
        const lvlWords = vocabList.filter(w => (w.curriculum === 'yct' || w.hskVersion === 'yct') && matchLevel(w.level, lvl));
        grid.appendChild(createSubdeckCard(`YCT Cấp ${lvl}`, `yct:${lvl}`, lvlWords.length, 'fa-child', 'var(--accent-teal)', false));
      }
    } else {
      const maxLvl = 6;
      for (let lvl = 1; lvl <= maxLvl; lvl++) {
        const lvlWords = vocabList.filter(w => !w.isCustom && matchLevel(w.level, lvl) && (w.hskVersion || '3.0') === activeHskVersion);
        grid.appendChild(createSubdeckCard(`HSK Cấp ${lvl}`, `hsk:${lvl}`, lvlWords.length, 'fa-graduation-cap', 'var(--success)', false));
      }
      if (activeHskVersion === '3.0') {
        const hsk79Words = vocabList.filter(w => !w.isCustom && matchLevel(w.level, '7-9') && (w.hskVersion || '3.0') === activeHskVersion);
        grid.appendChild(createSubdeckCard(`HSK Cấp 7-8-9 (Cao cấp)`, `hsk:7-9`, hsk79Words.length, 'fa-award', '#a855f7', false));
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
      grid.appendChild(createSubdeckCard(t.name, t.id, words.length, t.icon, t.color, false));
    });
  }
}

function createSubdeckCard(name, id, count, icon, color, isLocked = false) {
  const card = document.createElement('div');
  card.className = `topic-card glass-panel ${isLocked ? 'subdeck-card-locked' : ''}`;
  card.style.padding = '20px';
  card.style.cursor = isLocked ? 'not-allowed' : 'pointer';
  card.style.borderRadius = 'var(--radius-md)';
  card.style.border = isLocked ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-glass)';
  card.style.transition = 'all 0.3s ease';
  card.style.display = 'flex';
  card.style.alignItems = 'center';
  card.style.gap = '16px';
  card.style.position = 'relative';

  card.innerHTML = `
    <div style="width: 48px; height: 48px; border-radius: 50%; background: ${isLocked ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.03)'}; color: ${isLocked ? '#fbbf24' : color}; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; border: 1px solid ${isLocked ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-glass)'}; flex-shrink: 0;">
      <i class="fa-solid ${isLocked ? 'fa-lock' : icon}"></i>
    </div>
    <div style="flex: 1; text-align: left;">
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <h4 style="margin: 0; font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: ${isLocked ? '#cbd5e1' : 'var(--text-primary)'};">${name}</h4>
        ${isLocked ? `
          <span style="font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 99px; background: rgba(245, 158, 11, 0.18); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); display: inline-flex; align-items: center; gap: 4px;">
            <i class="fa-solid fa-lock" style="font-size: 0.65rem;"></i> Sắp ra mắt
          </span>
        ` : ''}
      </div>
      <span style="font-size: 0.78rem; color: var(--text-secondary);">${isLocked ? 'Đang hoàn thiện giáo trình' : `${count} từ vựng`}</span>
    </div>
    <i class="fa-solid ${isLocked ? 'fa-lock' : 'fa-chevron-right'}" style="color: ${isLocked ? '#fbbf24' : 'var(--text-muted)'}; font-size: 0.85rem;"></i>
  `;

  card.addEventListener('click', () => {
    if (isLocked) {
      showToast(`🔒 ${name} đang được hoàn thiện và chuẩn hóa giáo trình, sẽ mở khóa sớm nhé!`, true);
      return;
    }
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
  } else if (notebookId.startsWith('yct:')) {
    const lvl = notebookId.substring(4);
    if (selectedDashboardLessons && selectedDashboardLessons.length > 0) {
      const uniqueLessons = {};
      baseWords.forEach(w => {
        if (w.lessonId) {
          uniqueLessons[w.lessonId] = w.lessonTitle || `Bài ${w.lessonId}`;
        }
      });
      const lessonNames = selectedDashboardLessons.map(id => uniqueLessons[id] || `Bài ${id}`).join(', ');
      name = `Từ vựng YCT Cấp ${lvl} - ${lessonNames}`;
      desc = `Các từ vựng thuộc ${lessonNames.toLowerCase()} của YCT Cấp ${lvl}`;
    } else {
      name = `Từ vựng YCT Cấp ${lvl}`;
      desc = `Toàn bộ từ vựng luyện thi YCT Cấp ${lvl}`;
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

  // Update Back Button Label dynamically
  const backBtn = document.getElementById('back-to-subdecks-btn');
  if (backBtn) {
    if (notebookId === 'starred' || notebookId === 'wrong' || notebookId.startsWith('custom:')) {
      backBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Quay lại chủ đề chính';
    } else if (notebookId.startsWith('hsk:') || notebookId.startsWith('yct:')) {
      backBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Quay lại danh sách cấp độ';
    } else if (notebookId.startsWith('premium:')) {
      backBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Quay lại danh sách chủ đề';
    } else {
      backBtn.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Quay lại chủ đề chính';
    }
  }

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

  // Render HSK Lesson Selector Block if applicable (Luôn hiển thị khi xem sổ tay HSK / YCT)
  const lessonContainer = document.getElementById('nb-hsk-lesson-selector-container');
  if (lessonContainer) {
    if (notebookId.startsWith('hsk:') || notebookId.startsWith('yct:')) {
      lessonContainer.style.display = 'block';
      const lessonsList = document.getElementById('nb-hsk-lessons-list');
      const countBadge = document.getElementById('nb-selected-lessons-count-badge');
      const selectAllBtn = document.getElementById('nb-select-all-lessons-btn');
      const deselectAllBtn = document.getElementById('nb-deselect-all-lessons-btn');

      if (lessonsList) {
        lessonsList.innerHTML = '';

        const lvl = notebookId.substring(4);
        const allLvlWords = vocabList.filter(w => {
          if (w.isCustom) return false;
          if (notebookId.startsWith('yct:')) {
            return (w.curriculum === 'yct' || w.hskVersion === 'yct') && String(w.level) === String(lvl);
          }
          return matchLevel(w.level, lvl) && (w.hskVersion || '3.0') === activeHskVersion;
        });

        // Find unique lessons
        const uniqueLessons = {};
        allLvlWords.forEach(w => {
          if (w.lessonId) {
            uniqueLessons[w.lessonId] = w.lessonTitle || `Bài ${w.lessonId}`;
          }
        });

        const sortedLessonIds = Object.keys(uniqueLessons).map(Number).sort((a, b) => a - b);

        // Function to update count badge
        const updateCountBadge = () => {
          if (countBadge) {
            if (selectedDashboardLessons.length === 0) {
              countBadge.textContent = 'Tất cả bài';
            } else {
              countBadge.textContent = `Đã chọn: ${selectedDashboardLessons.length} / ${sortedLessonIds.length} bài`;
            }
          }
        };
        updateCountBadge();

        // Select all action
        if (selectAllBtn) {
          selectAllBtn.onclick = (e) => {
            e.preventDefault();
            selectedDashboardLessons = [...sortedLessonIds];
            document.querySelectorAll('#nb-hsk-lessons-list .nb-lesson-check-card').forEach(card => {
              card.classList.add('selected');
              const icon = card.querySelector('.nb-check-icon i');
              if (icon) {
                icon.className = 'fa-solid fa-square-check';
              }
            });
            updateCountBadge();
            updateNotebookDashboardStatsOnly(notebookId);
            currentNotebookPage = 1;
            renderNotebookWordsTable();
          };
        }

        // Deselect all action
        if (deselectAllBtn) {
          deselectAllBtn.onclick = (e) => {
            e.preventDefault();
            selectedDashboardLessons = [];
            document.querySelectorAll('#nb-hsk-lessons-list .nb-lesson-check-card').forEach(card => {
              card.classList.remove('selected');
              const icon = card.querySelector('.nb-check-icon i');
              if (icon) {
                icon.className = 'fa-regular fa-square';
              }
            });
            updateCountBadge();
            updateNotebookDashboardStatsOnly(notebookId);
            currentNotebookPage = 1;
            renderNotebookWordsTable();
          };
        }

        // Add individual lesson checkbox cards (All Unlocked)
        sortedLessonIds.forEach(lId => {
          const card = document.createElement('div');
          const isSelected = selectedDashboardLessons.includes(lId);

          card.className = `nb-lesson-check-card ${isSelected ? 'selected' : ''}`;
          card.setAttribute('data-lesson-id', lId);
          card.innerHTML = `
            <span class="nb-check-icon"><i class="fa-solid ${isSelected ? 'fa-square-check' : 'fa-regular fa-square'}"></i></span>
            <span class="nb-lesson-title">${uniqueLessons[lId]}</span>
          `;
          card.addEventListener('click', () => {
            const nowSelected = selectedDashboardLessons.includes(lId);
            if (nowSelected) {
              selectedDashboardLessons = selectedDashboardLessons.filter(id => id !== lId);
              card.classList.remove('selected');
              const icon = card.querySelector('.nb-check-icon i');
              if (icon) icon.className = 'fa-regular fa-square';
            } else {
              selectedDashboardLessons.push(lId);
              card.classList.add('selected');
              const icon = card.querySelector('.nb-check-icon i');
              if (icon) icon.className = 'fa-solid fa-square-check';
            }

            updateCountBadge();
            updateNotebookDashboardStatsOnly(notebookId);
            currentNotebookPage = 1;
            renderNotebookWordsTable();
          });
          lessonsList.appendChild(card);
        });
      }
    } else {
      lessonContainer.style.display = 'none';
      selectedDashboardLessons = [];
    }
  }

  updateNotebookDashboardStatsOnly(notebookId);

  updateNotebookDashboardStatsOnly(notebookId);

  currentNotebookPage = 1;
  renderNotebookWordsTable();
}

function updateNotebookDashboardStatsOnly(notebookId) {
  if (!notebookId) return;
  const baseWords = getNotebookWords(notebookId);

  // Filter baseWords for statistics if specific HSK / YCT lessons are selected
  let wordsForStats = baseWords;
  if ((notebookId.startsWith('hsk:') || notebookId.startsWith('yct:')) && selectedDashboardLessons.length > 0) {
    wordsForStats = baseWords.filter(w => w.lessonId && selectedDashboardLessons.some(id => String(id) === String(w.lessonId)));
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
}

// 4. Render vocabulary table for Notebook Dashboard with high-speed DocumentFragment
function renderNotebookWordsTable() {
  const tbody = document.getElementById('nb-words-table-rows');
  const paginationInfo = document.getElementById('nb-pagination-info');
  const paginationButtons = document.getElementById('nb-pagination-buttons');
  if (!tbody) return;

  tbody.innerHTML = '';

  let words = getNotebookWords(activeNotebook);

  // Filter HSK / YCT dashboard lessons if selected
  if (activeNotebook && (activeNotebook.startsWith('hsk:') || activeNotebook.startsWith('yct:')) && selectedDashboardLessons.length > 0) {
    words = words.filter(w => w.lessonId && selectedDashboardLessons.some(id => String(id) === String(w.lessonId)));
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
      (w.word && w.word.toLowerCase().includes(query)) ||
      (w.pinyin && w.pinyin.toLowerCase().includes(query)) ||
      (w.meaning && w.meaning.toLowerCase().includes(query))
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
  const fragment = document.createDocumentFragment();

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
      <td style="padding: 12px; font-family: var(--font-chinese); font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">${w.word || ''}</td>
      <td style="padding: 12px; color: var(--accent-teal); font-weight: 500;">${w.pinyin || ''}</td>
      <td style="padding: 12px; color: var(--text-secondary);">${w.meaning || ''}</td>
      <td style="padding: 12px; text-align: center;">
        <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
          <button class="btn btn-icon-only" title="Nghe phát âm" onclick="handleNotebookWordPlay('${(w.word || '').replace(/'/g, "\\'")}')">
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
    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);

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
  studyMode = mode; // set the variable directly — startStudySession will call setStudyMode() once

  const notebookName = document.getElementById('dashboard-notebook-title')?.textContent || '';
  const notebookDesc = document.getElementById('dashboard-notebook-desc')?.textContent || '';

  // Pass HSK or YCT lesson selections if studying HSK / YCT
  if (activeNotebook.startsWith('hsk:') || activeNotebook.startsWith('yct:')) {
    studySelectedLessons = selectedDashboardLessons.length > 0 ? [...selectedDashboardLessons] : null;
  } else {
    studySelectedLessons = null;
  }

  // Pass active filter to study session (this calls setStudyMode once internally)
  startStudySession(dashboardActiveFilter, 'all', notebookName, notebookDesc);
}

// Fast-path typing session: bypass applyFilters/updateStats entirely, just set filteredList directly
function startDirectTypingSession(words) {
  if (!words || words.length === 0) {
    showToast('Không có từ vựng nào để luyện gõ!', true);
    return;
  }

  // Set mode
  studyMode = 'type';

  // Set filteredList directly — NO applyFilters, NO updateStats, NO openNotebookDashboard
  filteredList = [...words];
  currentIndex = 0;
  isFlipped = false;

  // Switch views
  const deckView = document.getElementById('deck-selection-view');
  const studyView = document.getElementById('flashcard-study-view');
  const notebookDashboard = document.getElementById('notebook-dashboard-view');
  if (deckView) deckView.style.display = 'none';
  if (notebookDashboard) notebookDashboard.style.display = 'none';
  if (studyView) studyView.style.display = 'block';

  // Set header title
  const titleEl = document.getElementById('study-deck-title');
  const descEl = document.getElementById('study-deck-desc');
  if (titleEl) titleEl.textContent = document.getElementById('dashboard-notebook-title')?.textContent || 'Luyện Gõ Chữ & Nghĩa';
  if (descEl) descEl.textContent = `${words.length} từ vựng`;

  // Apply UI for type mode (no renderActiveCard yet)
  _applyStudyModeUI('type');

  // Render card ONCE
  renderActiveCard();

  // Scroll
  requestAnimationFrame(() => {
    const flashcardSection = document.getElementById('flashcard-section');
    if (flashcardSection) flashcardSection.scrollIntoView({ behavior: 'smooth' });
  });
}

// 7. MULTIPLE-CHOICE QUIZ GAME ENGINE
function startQuizSession() {
  let words = getNotebookWords(activeNotebook);

  // Apply HSK / YCT lesson filters if selected
  if ((activeNotebook.startsWith('hsk:') || activeNotebook.startsWith('yct:')) && selectedDashboardLessons.length > 0) {
    words = words.filter(w => w.lessonId && selectedDashboardLessons.some(id => String(id) === String(w.lessonId)));
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

function startGameArenaFromNotebook() {
  if (!activeNotebook) return;

  let levelParam = 'all';
  if (activeNotebook.startsWith('hsk:')) {
    const levelStr = activeNotebook.split(':')[1];
    if (levelStr && ['1', '2', '3', '4', '5', '6'].includes(levelStr)) {
      levelParam = levelStr;
    }
  } else if (activeNotebook.startsWith('yct:')) {
    const levelStr = activeNotebook.split(':')[1];
    if (levelStr) {
      levelParam = `yct${levelStr}`;
    }
  }

  let lessonsParam = 'all';
  if (selectedDashboardLessons && selectedDashboardLessons.length > 0) {
    lessonsParam = selectedDashboardLessons.join(',');
  }

  const deckSelectionView = document.getElementById('deck-selection-view');
  if (deckSelectionView) deckSelectionView.style.display = 'none';

  const notebookDashboardView = document.getElementById('notebook-dashboard-view');
  if (notebookDashboardView) notebookDashboardView.style.display = 'none';

  const flashcardStudyView = document.getElementById('flashcard-study-view');
  if (flashcardStudyView) flashcardStudyView.style.display = 'none';

  const gamePlayView = document.getElementById('game-play-view');
  if (gamePlayView) gamePlayView.style.display = 'block';

  const hskVer = activeHskVersion || '3.0';

  const iframe = document.getElementById('game-play-iframe');
  if (iframe) {
    iframe.src = `quiz-game.html?level=${encodeURIComponent(levelParam)}&lessons=${encodeURIComponent(lessonsParam)}&filter=${encodeURIComponent(dashboardActiveFilter)}&notebook=${encodeURIComponent(activeNotebook)}&version=${encodeURIComponent(hskVer)}&autostart=1`;
  }
};

window.openAboutModal = function () {
  const modal = document.getElementById('about-hongtai-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
};

// --- NEW SIDEBAR COLLAPSE, DROPDOWN & FEATURE MODALS ---
window.toggleSidebarCollapse = function () {
  document.body.classList.toggle('sidebar-collapsed');
  const isCollapsed = document.body.classList.contains('sidebar-collapsed');
  localStorage.setItem('sidebar_collapsed', isCollapsed ? 'true' : 'false');
};

window.toggleSidebarDropdown = function (element) {
  const group = element.closest('.sidebar-group');
  if (group) {
    group.classList.toggle('open');
  }
};

window.showComingSoonNotice = function (featureName = 'Tính năng') {
  let modal = document.getElementById('coming-soon-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'coming-soon-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); z-index: 99999; align-items: center; justify-content: center; padding: 20px;';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div style="background: var(--bg-primary, #1e293b); border: 1px solid var(--border-glass, rgba(255,255,255,0.15)); border-radius: 20px; width: 90%; max-width: 420px; padding: 28px; text-align: center; color: #fff; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
      <button onclick="document.getElementById('coming-soon-modal').style.display='none'" style="position: absolute; top: 14px; right: 14px; background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer;">&times;</button>
      <div style="font-size: 3rem; margin-bottom: 10px;">🚀</div>
      <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 8px; color: #f59e0b;">${featureName}</h3>
      <p style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 20px; line-height: 1.5;">Chức năng này đang được tối ưu phát triển và sẽ sớm ra mắt trong thời gian tới!</p>
      <button class="btn btn-primary" onclick="document.getElementById('coming-soon-modal').style.display='none'" style="background: #3b82f6; border: none; color: #fff; padding: 10px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; width: 100%;">Đã hiểu</button>
    </div>
  `;
  modal.style.display = 'flex';
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
  window.location.href = '/rank.html';
};

window.loadRankPageData = function () {
  const container = document.getElementById('leaderboard-list-container');
  if (!container) return;

  const API_BASE_URL = getResolvedApiBaseUrl();

  fetch(`${API_BASE_URL}/api/leaderboard`)
    .then(res => res.json())
    .then(data => {
      if (!container) return;

      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 30px;">Chưa có học viên nào hoàn thành bài học. Hãy là người đầu tiên lên bục vinh quang!</div>`;
        return;
      }

      // Find top 3 (Podium) and remaining learners
      const top1 = data.find(d => d.rank === 1) || data[0];
      const top2 = data.length > 1 ? (data.find(d => d.rank === 2) || data[1]) : null;
      const top3 = data.length > 2 ? (data.find(d => d.rank === 3) || data[2]) : null;
      const remaining = data.filter(d => d !== top1 && d !== top2 && d !== top3);

      function renderAvatar(item, size = 52, borderCol = '#fbbf24') {
        if (!item) return '';
        if (item.picture) {
          return `<img src="${item.picture}" style="width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover; border: 3px solid ${borderCol}; box-shadow: 0 0 12px ${borderCol}80;">`;
        }
        return `<div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: linear-gradient(135deg, ${borderCol}, #2563eb); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: ${size * 0.4}px; border: 3px solid ${borderCol}; box-shadow: 0 0 12px ${borderCol}80;">${item.name ? item.name.charAt(0).toUpperCase() : '?'}</div>`;
      }

      // Build Podium Stage HTML (Order: Rank 2 - Rank 1 - Rank 3)
      let html = `
        <div class="lb-podium-stage">
          
          <!-- Rank 2 Podium (Left) -->
          <div class="lb-podium-slot rank-2-slot ${!top2 ? 'empty' : ''}">
            ${top2 ? `
              <div class="lb-podium-crown">🥈</div>
              <div class="lb-podium-avatar-wrap">${renderAvatar(top2, 52, '#94a3b8')}</div>
              <div class="lb-podium-user">${top2.name}</div>
              <div class="lb-podium-score">${top2.completedCount * 100} Điểm</div>
            ` : '<div class="lb-podium-empty-txt">Đang chờ...</div>'}
            <div class="lb-podium-stand p-2">
              <span class="lb-podium-num">2</span>
            </div>
          </div>

          <!-- Rank 1 Podium (Center - Highest) -->
          <div class="lb-podium-slot rank-1-slot ${!top1 ? 'empty' : ''}">
            ${top1 ? `
              <div class="lb-podium-crown gold-crown">👑</div>
              <div class="lb-podium-avatar-wrap">${renderAvatar(top1, 64, '#fbbf24')}</div>
              <div class="lb-podium-user gold-user">${top1.name}</div>
              <div class="lb-podium-score gold-score">${top1.completedCount * 100} Điểm</div>
            ` : '<div class="lb-podium-empty-txt">Đang chờ...</div>'}
            <div class="lb-podium-stand p-1">
              <span class="lb-podium-num">1</span>
            </div>
          </div>

          <!-- Rank 3 Podium (Right) -->
          <div class="lb-podium-slot rank-3-slot ${!top3 ? 'empty' : ''}">
            ${top3 ? `
              <div class="lb-podium-crown">🥉</div>
              <div class="lb-podium-avatar-wrap">${renderAvatar(top3, 48, '#e11d48')}</div>
              <div class="lb-podium-user">${top3.name}</div>
              <div class="lb-podium-score">${top3.completedCount * 100} Điểm</div>
            ` : '<div class="lb-podium-empty-txt">Đang chờ...</div>'}
            <div class="lb-podium-stand p-3">
              <span class="lb-podium-num">3</span>
            </div>
          </div>

        </div>
      `;

      // Remaining Learners List Section (Rank 4+)
      if (remaining.length > 0) {
        html += `<div class="lb-rest-title">Bảng Xếp Hạng Tiếp Theo</div>`;
        html += `<div class="lb-rest-list">`;
        remaining.forEach((item, index) => {
          const rankNum = item.rank || (index + 4);
          html += `
            <div class="leaderboard-item rank-rest">
              <span class="lb-rank-num">#${rankNum}</span>
              ${item.picture ? `<img src="${item.picture}" class="lb-row-avatar">` : `<div class="lb-row-avatar-placeholder">${item.name.charAt(0)}</div>`}
              <div style="flex: 1; min-width: 0;">
                <div class="lb-user-name">${item.name}</div>
                <div class="lb-subtext">Đã học thuộc: <strong style="color: #059669;">${item.completedCount} từ vựng</strong></div>
              </div>
              <div style="text-align: right;">
                <div class="lb-score-val">${item.completedCount * 100} Điểm</div>
                <div class="lb-subtext">${item.studyTimeMinutes} phút</div>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }

      container.innerHTML = html;
    })
    .catch(err => {
      console.error("Leaderboard fetch error:", err);
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
      <div style="background: var(--bg-primary, #f4f6fd); border: 2px solid var(--border-glass, #e5e7eb); border-radius: 28px; width: 100%; max-width: 980px; max-height: 90vh; display: flex; flex-direction: column; padding: 32px; color: var(--text-primary, #2b3a4a); position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.35);">
        <button onclick="document.getElementById('grammar-hsk-modal').style.display='none'" style="position: absolute; top: 16px; right: 16px; background: var(--bg-secondary); border: 2px solid var(--border-glass); color: var(--text-secondary); font-size: 1.3rem; cursor: pointer; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">&times;</button>
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px; flex-shrink: 0;">
          <div style="font-size: 2.4rem; background: linear-gradient(135deg, #ff4b4b22 0%, #ffc80022 100%); width: 58px; height: 58px; border-radius: 18px; display: flex; align-items: center; justify-content: center; border: 2px solid #ffc80044; box-shadow: 0 4px 0 #e5e7eb; flex-shrink: 0;">📖</div>
          <div>
            <h2 style="font-size: 1.5rem; font-weight: 900; margin: 0; font-family: var(--font-display);">Kho Tài Liệu Ngữ Pháp HSK & YCT</h2>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin: 4px 0 0 0;">Tổng hợp 10 bộ ngữ pháp chuẩn, cấu trúc câu và ví dụ minh họa song ngữ</p>
          </div>
        </div>
        <div id="grammar-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; overflow-y: auto; padding-right: 4px; flex: 1;">
          <div style="text-align: center; color: var(--text-muted); padding: 40px; grid-column: 1 / -1;"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải danh sách ngữ pháp HSK...</div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';

  const API_BASE_URL = getResolvedApiBaseUrl();

  fetch(`${API_BASE_URL}/api/grammar/list`)
    .then(res => res.json())
    .then(list => {
      const grid = document.getElementById('grammar-cards-grid');
      if (!grid) return;

      let html = '';
      list.forEach(item => {
        html += `
          <div onclick="window.openGrammarDetail('${item.id}', '${API_BASE_URL}')" style="background: var(--bg-secondary, #fff); border: 2px solid ${item.color}33; border-radius: 20px; padding: 20px; display: flex; flex-direction: column; gap: 12px; transition: all 0.2s ease; cursor: pointer; box-shadow: 0 4px 0 ${item.color}22;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px ${item.color}33';" onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 0 ${item.color}22';">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.6rem;">${item.icon || '📘'}</span>
                <span style="font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 50px; background: ${item.color}22; color: ${item.color}; border: 1.5px solid ${item.color}44;">${item.level}</span>
              </div>
              <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); background: var(--bg-primary); padding: 3px 10px; border-radius: 50px; border: 1px solid var(--border-glass);">${item.pointCount} điểm</span>
            </div>
            <div style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary); font-family: var(--font-display);">${item.title}</div>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0; line-height: 1.5; flex: 1;">${item.desc || 'Tài liệu tổng hợp ngữ pháp chuẩn HSK.'}</p>
            <div style="display: flex; align-items: center; gap: 6px; color: ${item.color}; font-weight: 700; font-size: 0.85rem; padding-top: 8px; border-top: 1px dashed ${item.color}33;">
              <i class="fa-solid fa-book-open-reader"></i> Xem chi tiết ngữ pháp →
            </div>
          </div>
        `;
      });

      grid.innerHTML = html;
    })
    .catch(err => {
      const grid = document.getElementById('grammar-cards-grid');
      if (grid) grid.innerHTML = `<div style="text-align: center; color: var(--danger); padding: 40px; grid-column: 1/-1;"><i class="fa-solid fa-circle-exclamation"></i> Không thể tải dữ liệu ngữ pháp.</div>`;
      console.error("Error loading grammar list:", err);
    });
};

// Open grammar detail modal for a specific level
window.openGrammarDetail = function(grammarKey, apiBase) {
  const API_BASE_URL = apiBase || getResolvedApiBaseUrl();
  
  let detailModal = document.getElementById('grammar-detail-modal');
  if (!detailModal) {
    detailModal = document.createElement('div');
    detailModal.id = 'grammar-detail-modal';
    detailModal.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); z-index: 100000; align-items: center; justify-content: center; padding: 20px;';
    document.body.appendChild(detailModal);
  }
  
  detailModal.innerHTML = `
    <div style="background: var(--bg-primary); border: 2px solid var(--border-glass); border-radius: 28px; width: 100%; max-width: 820px; max-height: 90vh; display: flex; flex-direction: column; padding: 28px; color: var(--text-primary); position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
      <button onclick="document.getElementById('grammar-detail-modal').style.display='none'" style="position: absolute; top: 16px; right: 16px; background: var(--bg-secondary); border: 2px solid var(--border-glass); color: var(--text-secondary); font-size: 1.2rem; cursor: pointer; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">&times;</button>
      <div id="grammar-detail-header" style="margin-bottom: 20px; flex-shrink: 0;"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải...</div>
      <div style="overflow-y: auto; flex: 1; padding-right: 8px;" id="grammar-detail-content">
        <div style="text-align: center; padding: 40px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải nội dung ngữ pháp...</div>
      </div>
    </div>
  `;
  detailModal.style.display = 'flex';
  
  fetch(`${API_BASE_URL}/api/grammar/detail/${grammarKey}`)
    .then(res => res.json())
    .then(data => {
      const header = document.getElementById('grammar-detail-header');
      const content = document.getElementById('grammar-detail-content');
      if (!header || !content) return;
      
      header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 14px;">
          <span style="font-size: 2.2rem;">${data.icon || '📖'}</span>
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 0.75rem; font-weight: 800; padding: 3px 12px; border-radius: 50px; background: ${data.color}22; color: ${data.color}; border: 1.5px solid ${data.color}55;">${data.level}</span>
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">${data.pointCount} điểm ngữ pháp</span>
            </div>
            <h2 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 900; margin: 6px 0 0 0;">${data.title}</h2>
          </div>
        </div>
      `;
      
      let itemsHtml = '';
      (data.items || []).forEach((point, i) => {
        const examplesHtml = (point.examples || []).map(ex => `
          <div style="background: var(--bg-primary); border-left: 3px solid ${data.color}; border-radius: 0 10px 10px 0; padding: 10px 14px; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; font-family: var(--font-chinese);">${ex.replace(/[一-龯]+/g, (m) => `<strong style="color: ${data.color}; font-size: 1.1em;">${m}</strong>`)}</div>
        `).join('');
        
        itemsHtml += `
          <div style="background: var(--bg-secondary); border: 1.5px solid var(--border-glass); border-radius: 18px; padding: 18px 20px; margin-bottom: 12px;">
            <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: ${point.explanation ? '12px' : '0'};">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: ${data.color}22; border: 2px solid ${data.color}; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 900; color: ${data.color}; flex-shrink: 0;">${i + 1}</div>
              <div style="font-weight: 800; font-size: 1rem; color: var(--text-primary); font-family: var(--font-display); flex: 1; line-height: 1.4;">${point.title}</div>
            </div>
            ${point.explanation ? `<p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 12px 40px; line-height: 1.6;">${point.explanation}</p>` : ''}
            ${examplesHtml ? `<div style="display: flex; flex-direction: column; gap: 6px; margin-left: 40px;">${examplesHtml}</div>` : ''}
          </div>
        `;
      });
      
      content.innerHTML = itemsHtml || `<div style="text-align: center; padding: 40px; color: var(--text-muted);">Không có dữ liệu chi tiết cho cấp độ này.</div>`;
    })
    .catch(err => {
      const content = document.getElementById('grammar-detail-content');
      if (content) content.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--danger);"><i class="fa-solid fa-circle-exclamation"></i> Không thể tải chi tiết ngữ pháp.</div>`;
      console.error("Error loading grammar detail:", err);
    });
};

// Auto-initialize rank.html leaderboard if standalone rank page is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('rank.html')) {
      window.loadRankPageData();
    }
  });
} else {
  if (window.location.pathname.includes('rank.html')) {
    window.loadRankPageData();
  }
}

// Reset trigger removed to prevent wiping user database on new sessions


// --- 214 BỘ THỦ TIẾNG TRUNG CONTROLLER ---
let activeRadicalCategory = '50 bộ 1';

window.openRadicalsModal = function() {
  const modal = document.getElementById('radicals-study-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  window.switchRadicalTab('50 bộ 1');
};

window.switchRadicalTab = function(category) {
  activeRadicalCategory = category;
  
  // Active tab button styling
  const tabIds = {
    '50 bộ 1': 'rad-tab-50-1',
    '50 bộ 2': 'rad-tab-50-2',
    '50 bộ 3': 'rad-tab-50-3',
    'Bộ thủ còn lại': 'rad-tab-rest',
    'So sánh': 'rad-tab-comp'
  };

  Object.entries(tabIds).forEach(([cat, id]) => {
    const btn = document.getElementById(id);
    if (btn) {
      if (cat === category) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });

  const bodyEl = document.getElementById('radicals-modal-body');
  if (!bodyEl) return;

  if (category === 'So sánh') {
    // Render comparison list
    const compList = radicalsData.comparisons || [];
    let html = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="font-size: 0.9rem; color: var(--text-muted); font-style: italic;">
          <i class="fa-solid fa-circle-info" style="color: #3b82f6;"></i> Tổng hợp 25 cặp bộ thủ có hình dáng gần giống nhau và bí quyết phân biệt chính xác.
        </div>
    `;

    compList.forEach((c, idx) => {
      html += `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="background: rgba(37, 99, 235, 0.15); color: #3b82f6; border: 1px solid rgba(37, 99, 235, 0.3); font-weight: 800; padding: 4px 12px; border-radius: 8px; font-family: var(--font-hanzi); font-size: 1.25rem;">
                ${c.rad1} (${c.meaning1})
              </span>
              <span style="font-weight: 700; color: #ef4444; font-size: 1rem;">VS</span>
              <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); font-weight: 800; padding: 4px 12px; border-radius: 8px; font-family: var(--font-hanzi); font-size: 1.25rem;">
                ${c.rad2} (${c.meaning2})
              </span>
            </div>
          </div>
          <div style="font-size: 0.93rem; color: var(--text-color); line-height: 1.5;">
            <strong style="color: #fbbf24;">Cách phân biệt:</strong> ${c.difference}
          </div>
          ${c.example ? `
            <div style="font-size: 0.88rem; color: var(--text-muted); background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 8px;">
              <i class="fa-solid fa-book" style="color: #3b82f6; margin-right: 4px;"></i> <strong>Ví dụ:</strong> ${c.example}
            </div>
          ` : ''}
        </div>
      `;
    });

    html += `</div>`;
    bodyEl.innerHTML = html;
  } else {
    // Render radical cards
    const radList = (radicalsData.radicals || []).filter(r => r.category === category);
    
    let html = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px;">
    `;

    radList.forEach(r => {
      html += `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 8px; transition: all 0.2s; cursor: pointer;"
          onmouseenter="this.style.borderColor='rgba(37,99,235,0.4)'; this.style.transform='translateY(-2px)'"
          onmouseleave="this.style.borderColor='rgba(255,255,255,0.08)'; this.style.transform='translateY(0)'"
          onclick="speakText('${(r.radical || '').replace(/'/g, "\\'")}')">
          
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: baseline; gap: 8px;">
              <span style="font-family: var(--font-hanzi); font-size: 2.2rem; font-weight: 800; color: #2563eb;">
                ${r.radical}
              </span>
              ${r.variant ? `<span style="font-family: var(--font-hanzi); font-size: 1.4rem; color: #60a5fa; font-weight: 700;">(${r.variant})</span>` : ''}
            </div>
            <span style="font-family: var(--font-pinyin); font-size: 1.1rem; font-weight: 700; color: #38bdf8;">
              ${r.pinyin}
            </span>
          </div>

          <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-color);">
            Hán-Việt: ${r.name} - <span style="color: #34d399;">${r.meaning}</span>
          </div>

          ${r.note ? `
            <div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic; line-height: 1.35; background: rgba(0,0,0,0.15); padding: 6px 10px; border-radius: 6px;">
              <i class="fa-solid fa-circle-info" style="color: #3b82f6;"></i> ${r.note}
            </div>
          ` : ''}

          ${r.example ? `
            <div style="font-size: 0.85rem; color: var(--text-color); font-weight: 600; margin-top: 2px;">
              <i class="fa-solid fa-lightbulb" style="color: #fbbf24; margin-right: 4px;"></i> Ví dụ: ${r.example}
            </div>
          ` : ''}
        </div>
      `;
    });

    html += `</div>`;
    bodyEl.innerHTML = html;
  }
};

window.openDonateModal = function () {
  const modal = document.getElementById('donate-project-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
};

// ==========================================================================
// REAL-TIME PRESENCE & LIVE COMMUNITY STATS SYSTEM
// ==========================================================================
window.fetchLiveCommunityStats = async function () {
  try {
    const totalEl = document.getElementById('live-total-users-count');
    const onlineEl = document.getElementById('live-online-users-count');
    if (!totalEl && !onlineEl) return;

    const base = window.API_BASE_URL || '';
    const res = await fetch(`${base}/api/stats/community`);
    if (!res.ok) return;
    const data = await res.json();

    if (totalEl && data.totalUsers !== undefined) {
      totalEl.textContent = Number(data.totalUsers).toLocaleString('vi-VN') + ' Học viên';
    }
    if (onlineEl && data.onlineUsers !== undefined) {
      onlineEl.textContent = Number(data.onlineUsers).toLocaleString('vi-VN') + ' Đang online';
    }
  } catch (err) {
    console.debug('Could not fetch real presence stats:', err);
  }
};

window.sendPresenceHeartbeat = async function () {
  try {
    const base = window.API_BASE_URL || '';
    const token = localStorage.getItem('sessionToken') || '';
    await fetch(`${base}/api/presence/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ path: window.location.pathname, ts: Date.now() })
    });
  } catch (e) { }
};

// Start tracking immediately and periodic poll
if (typeof window !== 'undefined') {
  // Initial fetch
  setTimeout(() => {
    window.fetchLiveCommunityStats();
    window.sendPresenceHeartbeat();
  }, 100);

  // Periodic poll
  setInterval(() => {
    window.fetchLiveCommunityStats();
  }, 25000);

// Periodic presence heartbeat ping
  setInterval(() => {
    window.sendPresenceHeartbeat();
  }, 35000);
}

// ==========================================================================
// COMMUNITY DISCUSSION & FEEDBACK FORUM CLIENT MODULE
// ==========================================================================
let currentDiscussionCategory = 'all';
let currentDiscussionSearchQuery = '';
let discussionSyncInterval = null;
let cachedDiscussionsList = [];

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 45) return 'Vừa xong';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} ngày trước`;

  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function getCategoryMeta(category) {
  switch (category) {
    case 'feedback':
      return { label: '💡 Góp ý & Báo lỗi', className: 'disc-cat-feedback' };
    case 'study':
      return { label: '💬 Thảo luận học tập', className: 'disc-cat-study' };
    case 'qa':
      return { label: '❓ Hỏi đáp ngữ pháp', className: 'disc-cat-qa' };
    case 'tips':
      return { label: '🎉 Mẹo học & HSK', className: 'disc-cat-tips' };
    default:
      return { label: '💬 Thảo luận', className: 'disc-cat-study' };
  }
}

function isUserAdmin(email) {
  if (!email) return false;
  const em = email.toLowerCase();
  return em.includes('toiyeutinhoc238') || em.includes('phanphiphu') || em.includes('hongtai') || em.includes('admin');
}

window.openDiscussionModal = function () {
  const modal = document.getElementById('discussion-forum-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    window.fetchDiscussions(true);

    if (discussionSyncInterval) clearInterval(discussionSyncInterval);
    discussionSyncInterval = setInterval(() => {
      if (modal.style.display !== 'none') {
        window.fetchDiscussions(false);
      }
    }, 15000);
  }
};

window.closeDiscussionModal = function () {
  const modal = document.getElementById('discussion-forum-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
  if (discussionSyncInterval) {
    clearInterval(discussionSyncInterval);
    discussionSyncInterval = null;
  }
};

// Global click listener to close discussion modal on outside backdrop click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('discussion-forum-modal');
  if (modal && e.target === modal) {
    window.closeDiscussionModal();
  }
});

window.toggleCreateDiscussionForm = function (forceState) {
  const container = document.getElementById('disc-create-form-container');
  if (!container) return;

  const isCurrentlyOpen = container.style.display !== 'none';
  const nextState = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

  if (nextState && !currentUser) {
    if (typeof window.showAuthModal === 'function') {
      window.showAuthModal();
    } else {
      showToast('Vui lòng đăng nhập để đăng bài thảo luận & góp ý!', true);
    }
    return;
  }

  container.style.display = nextState ? 'block' : 'none';
  if (nextState) {
    const input = document.getElementById('disc-new-content');
    if (input) input.focus();
  }
};

window.filterDiscussionCategory = function (category) {
  currentDiscussionCategory = category;
  document.querySelectorAll('#disc-category-filter-container .disc-filter-pill').forEach(pill => {
    if (pill.getAttribute('data-category') === category) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });
  window.fetchDiscussions(true);
};

let searchDiscussionsDebounce = null;
window.handleDiscussionSearch = function (query) {
  clearTimeout(searchDiscussionsDebounce);
  searchDiscussionsDebounce = setTimeout(() => {
    currentDiscussionSearchQuery = query.trim();
    window.fetchDiscussions(true);
  }, 200);
};

window.fetchDiscussions = async function (showLoading) {
  const stream = document.getElementById('disc-posts-stream');
  if (!stream) return;

  if (showLoading && cachedDiscussionsList.length === 0) {
    stream.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; color: #94a3b8; gap: 12px;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: #38bdf8;"></i>
        <span>Đang đồng bộ bài viết thảo luận & góp ý...</span>
      </div>
    `;
  }

  try {
    let url = `${API_BASE_URL}/api/discussions?category=${currentDiscussionCategory}`;
    if (currentDiscussionSearchQuery) {
      url += `&search=${encodeURIComponent(currentDiscussionSearchQuery)}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Không thể tải bài viết');
    const data = await res.json();
    if (data.success && Array.isArray(data.discussions)) {
      cachedDiscussionsList = data.discussions;
      window.renderDiscussionsList(cachedDiscussionsList);
    }
  } catch (err) {
    console.error('Fetch discussions error:', err);
    if (showLoading) {
      stream.innerHTML = `
        <div style="text-align: center; padding: 36px; color: #94a3b8;">
          <i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b; font-size: 1.5rem; margin-bottom: 8px;"></i>
          <p>Không thể kết nối đến máy chủ thảo luận. Vui lòng thử lại sau.</p>
        </div>
      `;
    }
  }
};

window.renderDiscussionsList = function (discussions) {
  const stream = document.getElementById('disc-posts-stream');
  if (!stream) return;

  if (discussions.length === 0) {
    stream.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; background: rgba(30, 41, 59, 0.3); border-radius: 16px; border: 1px dashed rgba(255, 255, 255, 0.1); gap: 12px;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(56, 189, 248, 0.1); display: flex; align-items: center; justify-content: center; color: #38bdf8; font-size: 1.5rem;">
          <i class="fa-regular fa-comment-dots"></i>
        </div>
        <h4 style="color: #ffffff; margin: 0; font-size: 1.05rem; font-weight: 700;">Chưa có bài viết nào trong chuyên mục này</h4>
        <p style="color: #94a3b8; font-size: 0.85rem; margin: 0; max-width: 400px;">
          Hãy là người đầu tiên đặt câu hỏi, chia sẻ kinh nghiệm hoặc gửi góp ý cho đội ngũ Tiếng Trung Hongtai nhé!
        </p>
        <button type="button" class="btn btn-primary" onclick="window.toggleCreateDiscussionForm(true)" style="margin-top: 8px; padding: 8px 18px; border-radius: 10px; font-size: 0.85rem; font-weight: 700; background: linear-gradient(135deg, #0284c7, #2563eb);">
          <i class="fa-solid fa-pen-to-square"></i> Đăng bài đầu tiên
        </button>
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();

  discussions.forEach(post => {
    const card = document.createElement('div');
    card.className = 'disc-post-card';
    card.id = `disc-post-${post.id}`;

    const catMeta = getCategoryMeta(post.category);
    const isAdmin = isUserAdmin(post.authorEmail);
    const isOwner = currentUser && (currentUser.email === post.authorEmail || isUserAdmin(currentUser.email));
    const timeAgo = formatRelativeTime(post.createdAt);

    // Format author avatar
    const safeAuthorName = escapeHtml(post.authorName || 'Học viên');
    const safeTitle = escapeHtml(post.title || '');
    const safeContent = escapeHtml(post.content || '').replace(/\n/g, '<br>');
    const initial = safeAuthorName.charAt(0).toUpperCase();
    const avatarHtml = post.authorPicture
      ? `<img src="${post.authorPicture}" alt="${safeAuthorName}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1.5px solid rgba(56,189,248,0.4);" onerror="this.outerHTML='<div class=\\'disc-default-avatar\\'>${initial}</div>'">`
      : `<div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #0284c7, #38bdf8); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; border: 1.5px solid rgba(255,255,255,0.2);">${initial}</div>`;

    let adminBadge = '';
    if (post.isSuperAdmin || post.authorRole === 'super_admin' || isSuperAdmin(post.authorEmail)) {
      adminBadge = `<span style="background: linear-gradient(135deg, #f43f5e, #e11d48); color: white; font-size: 0.65rem; font-weight: 800; padding: 1px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px;"><i class="fa-solid fa-crown"></i> Super Admin</span>`;
    } else if (post.authorRole === 'teacher' || (post.authorEmail && post.authorEmail.includes('hongtai'))) {
      adminBadge = `<span style="background: linear-gradient(135deg, #0284c7, #2563eb); color: white; font-size: 0.65rem; font-weight: 800; padding: 1px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px;"><i class="fa-solid fa-chalkboard-user"></i> Giáo viên</span>`;
    } else if (post.isAdmin || post.authorRole === 'admin') {
      adminBadge = `<span style="background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; font-size: 0.65rem; font-weight: 800; padding: 1px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px;"><i class="fa-solid fa-shield-halved"></i> Quản trị viên</span>`;
    } else {
      adminBadge = `<span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; font-size: 0.65rem; font-weight: 700; padding: 1px 6px; border-radius: 4px;">Học viên</span>`;
    }

    const deleteBtnHtml = isOwner
      ? `<button type="button" class="btn btn-icon-only" title="Xóa bài viết" onclick="window.handleDeleteDiscussion('${post.id}')" style="width: 28px; height: 28px; border-radius: 6px; color: #ef4444; background: rgba(239, 68, 68, 0.1); border: none; cursor: pointer;">
          <i class="fa-solid fa-trash" style="font-size: 0.78rem;"></i>
        </button>`
      : '';

    card.innerHTML = `
      <!-- Post Top Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${avatarHtml}
          <div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="font-weight: 700; color: #ffffff; font-size: 0.95rem;">${safeAuthorName}</span>
              ${adminBadge}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
              <span class="disc-cat-badge ${catMeta.className}">${catMeta.label}</span>
              <span style="font-size: 0.75rem; color: #64748b;">${timeAgo}</span>
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          ${deleteBtnHtml}
        </div>
      </div>

      <!-- Post Body -->
      <div>
        ${safeTitle ? `<h3 style="font-size: 1.05rem; font-weight: 800; color: #38bdf8; margin: 0 0 6px 0; font-family: var(--font-display);">${safeTitle}</h3>` : ''}
        <div style="font-size: 0.9rem; color: #e2e8f0; line-height: 1.6; word-break: break-word;">${safeContent}</div>
      </div>

      <!-- Post Action Footer -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.06); flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; gap: 10px;">
          <button type="button" class="disc-action-btn ${post.hasLiked ? 'liked' : ''}" id="disc-like-btn-${post.id}" onclick="window.handleToggleLikeDiscussion('${post.id}')">
            <i class="fa-solid fa-heart"></i>
            <span id="disc-like-count-${post.id}">${post.likesCount || 0}</span>
          </button>
          <button type="button" class="disc-action-btn" onclick="window.togglePostComments('${post.id}')">
            <i class="fa-solid fa-comment"></i>
            <span id="disc-cmt-count-${post.id}">${post.commentsCount || 0}</span> phản hồi
          </button>
        </div>
        <button type="button" class="disc-action-btn" onclick="window.togglePostComments('${post.id}', true)" style="font-size: 0.78rem;">
          <i class="fa-solid fa-reply"></i> Trả lời
        </button>
      </div>

      <!-- Comments Thread Section (Initially Collapsed unless opened) -->
      <div id="disc-comments-container-${post.id}" style="display: none; flex-direction: column; gap: 10px; margin-top: 4px; padding-top: 12px; border-top: 1px dashed rgba(255, 255, 255, 0.1);">
        <div id="disc-comments-list-${post.id}" style="display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto;">
          <!-- Populated comments -->
        </div>

        <!-- Comment Input Box -->
        <form onsubmit="window.handlePostCommentSubmit(event, '${post.id}')" style="display: flex; gap: 8px; margin-top: 4px;">
          <input type="text" id="disc-cmt-input-${post.id}" required placeholder="Viết phản hồi / câu trả lời..." style="flex: 1; padding: 8px 12px; font-size: 0.85rem; border-radius: 8px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.15); color: #ffffff; outline: none;">
          <button type="submit" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.82rem; font-weight: 700; border-radius: 8px; background: linear-gradient(135deg, #0284c7, #2563eb); border: none; display: flex; align-items: center; gap: 4px; cursor: pointer;">
            <i class="fa-solid fa-paper-plane"></i> Gửi
          </button>
        </form>
      </div>
    `;

    fragment.appendChild(card);
  });

  stream.innerHTML = '';
  stream.appendChild(fragment);
};

window.handleCreateDiscussionSubmit = async function (e) {
  if (e) e.preventDefault();

  if (!currentUser) {
    if (typeof window.showAuthModal === 'function') {
      window.showAuthModal();
    } else {
      showToast('Vui lòng đăng nhập để đăng bài!', true);
    }
    return;
  }

  const category = document.getElementById('disc-new-category').value;
  const title = document.getElementById('disc-new-title').value.trim();
  const content = document.getElementById('disc-new-content').value.trim();
  const submitBtn = document.getElementById('disc-submit-btn');

  if (!content) {
    showToast('Vui lòng nhập nội dung bài viết.', true);
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang đăng...';
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/discussions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ category, title, content }),
      credentials: 'include'
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Đăng bài thất bại');
    }

    const data = await res.json();
    if (data.success && data.discussion) {
      showToast('🎉 Đăng bài thảo luận & góp ý thành công!');
      document.getElementById('disc-new-title').value = '';
      document.getElementById('disc-new-content').value = '';
      window.toggleCreateDiscussionForm(false);

      // Prepend to cached list & re-render
      cachedDiscussionsList.unshift(data.discussion);
      window.renderDiscussionsList(cachedDiscussionsList);
    }
  } catch (err) {
    console.error('Create discussion error:', err);
    showToast(err.message || 'Lỗi khi đăng bài!', true);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Đăng bài';
    }
  }
};

window.handleToggleLikeDiscussion = async function (postId) {
  if (!currentUser) {
    if (typeof window.showAuthModal === 'function') {
      window.showAuthModal();
    } else {
      showToast('Vui lòng đăng nhập để thả tim bài viết!', true);
    }
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/discussions/${postId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Không thể thả tim');
    const data = await res.json();
    if (data.success) {
      const likeBtn = document.getElementById(`disc-like-btn-${postId}`);
      const likeCount = document.getElementById(`disc-like-count-${postId}`);

      if (likeBtn) {
        if (data.hasLiked) {
          likeBtn.classList.add('liked');
        } else {
          likeBtn.classList.remove('liked');
        }
      }
      if (likeCount) {
        likeCount.textContent = data.likesCount;
      }

      // Update in cache
      const post = cachedDiscussionsList.find(d => d.id === postId);
      if (post) {
        post.likesCount = data.likesCount;
        post.hasLiked = data.hasLiked;
      }
    }
  } catch (err) {
    console.error('Like error:', err);
  }
};

window.togglePostComments = function (postId, focusInput) {
  const container = document.getElementById(`disc-comments-container-${postId}`);
  if (!container) return;

  const isVisible = container.style.display === 'flex';
  container.style.display = isVisible && !focusInput ? 'none' : 'flex';

  if (container.style.display === 'flex') {
    // Render comments list
    const post = cachedDiscussionsList.find(d => d.id === postId);
    const listEl = document.getElementById(`disc-comments-list-${postId}`);
    if (listEl && post && Array.isArray(post.comments)) {
      if (post.comments.length === 0) {
        listEl.innerHTML = '<div style="font-size: 0.78rem; color: #94a3b8; font-style: italic; padding: 4px;">Chưa có phản hồi nào. Hãy viết phản hồi đầu tiên nhé!</div>';
      } else {
        listEl.innerHTML = post.comments.map(c => {
          const safeCAuthor = escapeHtml(c.authorName || 'Học viên');
          const safeCContent = escapeHtml(c.content || '').replace(/\n/g, '<br>');
          const cInitial = safeCAuthor.charAt(0).toUpperCase();
          const cAvatar = c.authorPicture
            ? `<img src="${c.authorPicture}" alt="${safeCAuthor}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" onerror="this.outerHTML='<div class=\\'disc-mini-avatar\\'>${cInitial}</div>'">`
            : `<div style="width: 24px; height: 24px; border-radius: 50%; background: #0284c7; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700;">${cInitial}</div>`;

          let cAdminBadge = '';
          if (c.isSuperAdmin || c.authorRole === 'super_admin' || isSuperAdmin(c.authorEmail)) {
            cAdminBadge = '<span style="color: #f43f5e; font-size: 0.68rem; font-weight: 800;"><i class="fa-solid fa-crown"></i> [Super Admin]</span>';
          } else if (c.authorRole === 'teacher' || (c.authorEmail && c.authorEmail.includes('hongtai'))) {
            cAdminBadge = '<span style="color: #38bdf8; font-size: 0.68rem; font-weight: 800;"><i class="fa-solid fa-chalkboard-user"></i> [Giáo viên]</span>';
          } else if (c.isAdmin || c.authorRole === 'admin') {
            cAdminBadge = '<span style="color: #a855f7; font-size: 0.68rem; font-weight: 800;"><i class="fa-solid fa-shield-halved"></i> [Admin]</span>';
          }

          return `
            <div class="disc-comment-item">
              ${cAvatar}
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                  <span style="font-size: 0.82rem; font-weight: 700; color: #ffffff;">${safeCAuthor}</span>
                  ${cAdminBadge}
                  <span style="font-size: 0.7rem; color: #64748b; margin-left: auto;">${formatRelativeTime(c.createdAt)}</span>
                </div>
                <div style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.4;">${safeCContent}</div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    if (focusInput) {
      const input = document.getElementById(`disc-cmt-input-${postId}`);
      if (input) input.focus();
    }
  }
};

window.handlePostCommentSubmit = async function (e, postId) {
  if (e) e.preventDefault();

  if (!currentUser) {
    if (typeof window.showAuthModal === 'function') {
      window.showAuthModal();
    } else {
      showToast('Vui lòng đăng nhập để bình luận!', true);
    }
    return;
  }

  const input = document.getElementById(`disc-cmt-input-${postId}`);
  if (!input) return;
  const content = input.value.trim();
  if (!content) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/discussions/${postId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Không thể gửi bình luận');
    const data = await res.json();
    if (data.success && data.comment) {
      input.value = '';

      // Update post in cache
      const post = cachedDiscussionsList.find(d => d.id === postId);
      if (post) {
        if (!post.comments) post.comments = [];
        post.comments.push(data.comment);
        post.commentsCount = post.comments.length;

        const countEl = document.getElementById(`disc-cmt-count-${postId}`);
        if (countEl) countEl.textContent = post.commentsCount;

        // Re-render comments
        window.togglePostComments(postId, false);
      }
      showToast('Đã gửi phản hồi thành công!');
    }
  } catch (err) {
    console.error('Post comment error:', err);
    showToast('Lỗi khi gửi bình luận!', true);
  }
};

window.handleDeleteDiscussion = async function (postId) {
  if (!confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/discussions/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Không thể xóa bài viết');
    const data = await res.json();
    if (data.success) {
      showToast('Đã xóa bài viết thành công.');
      cachedDiscussionsList = cachedDiscussionsList.filter(d => d.id !== postId);
      const card = document.getElementById(`disc-post-${postId}`);
      if (card) card.remove();
      if (cachedDiscussionsList.length === 0) {
        window.renderDiscussionsList([]);
      }
    }
  } catch (err) {
    console.error('Delete discussion error:', err);
    showToast('Lỗi khi xóa bài viết!', true);
  }
};

// ==========================================================================
// ADMIN & LEARNER INTELLIGENCE MANAGEMENT CLIENT MODULE
// ==========================================================================
let adminCachedUsersList = [];
let currentAdminFilter = 'all';
let currentAdminSearchQuery = '';
let adminSyncInterval = null;

function isSuperAdmin(email) {
  if (!email) return false;
  const em = email.toLowerCase().trim();
  return em.includes('toiyeutinhoc238') || em.includes('phanphiphu') || em.includes('thaihong162004');
}

window.openAdminManagementModal = function () {
  const modal = document.getElementById('admin-management-modal');
  if (!modal) return;

  if (!currentUser || (!currentUser.isAdmin && !currentUser.isSuperAdmin && !isUserAdmin(currentUser.email))) {
    showToast('Bạn không có quyền truy cập bảng quản trị viên!', true);
    return;
  }

  const isSuper = !!currentUser.isSuperAdmin || isSuperAdmin(currentUser.email);
  const badge = document.getElementById('admin-my-role-badge');
  if (badge) {
    badge.textContent = isSuper ? 'Super Admin (Toàn quyền)' : 'Giáo viên / Admin';
  }

  const superGrantBox = document.getElementById('admin-super-grant-container');
  if (superGrantBox) {
    superGrantBox.style.display = isSuper ? 'block' : 'none';
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  window.fetchAdminUsersList(true);

  if (adminSyncInterval) clearInterval(adminSyncInterval);
  adminSyncInterval = setInterval(() => {
    if (modal.style.display !== 'none') {
      window.fetchAdminUsersList(false);
    }
  }, 10000);
};

window.closeAdminManagementModal = function () {
  const modal = document.getElementById('admin-management-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
  if (adminSyncInterval) {
    clearInterval(adminSyncInterval);
    adminSyncInterval = null;
  }
};

// Global click listener to close admin modal on outside click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('admin-management-modal');
  if (modal && e.target === modal) {
    window.closeAdminManagementModal();
  }
});

window.fetchAdminUsersList = async function (showLoading) {
  const container = document.getElementById('admin-users-table-container');
  if (!container) return;

  if (showLoading && adminCachedUsersList.length === 0) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; color: #94a3b8; gap: 12px;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: #f43f5e;"></i>
        <span>Đang nạp dữ liệu toàn bộ học viên & phân quyền...</span>
      </div>
    `;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Không thể tải danh sách quản trị');
    const data = await res.json();
    if (data.success && Array.isArray(data.users)) {
      adminCachedUsersList = data.users;

      // Update KPI counters
      const totalKpi = document.getElementById('admin-kpi-total-users');
      const onlineKpi = document.getElementById('admin-kpi-online-users');
      const adminKpi = document.getElementById('admin-kpi-admin-count');
      const hoursKpi = document.getElementById('admin-kpi-total-hours');

      if (totalKpi) totalKpi.textContent = data.totalUsers || adminCachedUsersList.length;
      if (onlineKpi) onlineKpi.textContent = data.onlineCount || 0;
      if (adminKpi) adminKpi.textContent = data.adminCount || 0;
      if (hoursKpi) hoursKpi.textContent = `${data.totalStudyTimeHours || 0}h`;

      // Update tab counts
      const countAll = document.getElementById('admin-tab-count-all');
      const countOnline = document.getElementById('admin-tab-count-online');
      const countAdmins = document.getElementById('admin-tab-count-admins');
      const countUsers = document.getElementById('admin-tab-count-users');

      if (countAll) countAll.textContent = adminCachedUsersList.length;
      if (countOnline) countOnline.textContent = adminCachedUsersList.filter(u => u.isOnline).length;
      if (countAdmins) countAdmins.textContent = adminCachedUsersList.filter(u => u.isAdmin || u.isSuperAdmin).length;
      if (countUsers) countUsers.textContent = adminCachedUsersList.filter(u => !u.isAdmin && !u.isSuperAdmin).length;

      window.renderAdminUsersTable();
    }
  } catch (err) {
    console.error('Fetch admin users error:', err);
    if (showLoading) {
      container.innerHTML = `
        <div style="text-align: center; padding: 36px; color: #94a3b8;">
          <i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b; font-size: 1.5rem; margin-bottom: 8px;"></i>
          <p>Không thể kết nối đến máy chủ quản trị. Vui lòng kiểm tra quyền hạn tài khoản.</p>
        </div>
      `;
    }
  }
};

window.filterAdminUsers = function (filterKey) {
  currentAdminFilter = filterKey;
  document.querySelectorAll('#admin-filter-tabs-container .disc-filter-pill').forEach(btn => {
    if (btn.getAttribute('data-admin-filter') === filterKey) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  window.renderAdminUsersTable();
};

let adminSearchDebounce = null;
window.handleAdminUserSearch = function (query) {
  clearTimeout(adminSearchDebounce);
  adminSearchDebounce = setTimeout(() => {
    currentAdminSearchQuery = query.trim().toLowerCase();
    window.renderAdminUsersTable();
  }, 150);
};

window.renderAdminUsersTable = function () {
  const container = document.getElementById('admin-users-table-container');
  if (!container) return;

  let filtered = [...adminCachedUsersList];

  if (currentAdminFilter === 'online') {
    filtered = filtered.filter(u => u.isOnline);
  } else if (currentAdminFilter === 'admins') {
    filtered = filtered.filter(u => u.isAdmin || u.isSuperAdmin);
  } else if (currentAdminFilter === 'users') {
    filtered = filtered.filter(u => !u.isAdmin && !u.isSuperAdmin);
  }

  if (currentAdminSearchQuery) {
    filtered = filtered.filter(u =>
      (u.name && u.name.toLowerCase().includes(currentAdminSearchQuery)) ||
      (u.email && u.email.toLowerCase().includes(currentAdminSearchQuery))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 48px; color: #94a3b8;">
        <i class="fa-solid fa-user-slash" style="font-size: 2rem; margin-bottom: 10px; color: #64748b;"></i>
        <p style="margin: 0; font-size: 0.95rem;">Không tìm thấy người học nào phù hợp với bộ lọc.</p>
      </div>
    `;
    return;
  }

  const isCurrentSuper = currentUser && (!!currentUser.isSuperAdmin || isSuperAdmin(currentUser.email));

  let html = `
    <table class="admin-users-table">
      <thead>
        <tr>
          <th style="min-width: 220px;">Học Viên</th>
          <th>Trạng Thái</th>
          <th>Vai Trò &amp; Quyền Hạn</th>
          <th>Điểm Thi &amp; Lộ Trình</th>
          <th>Chuỗi Học 🔥</th>
          <th>Thời Gian ⏱️</th>
          ${isCurrentSuper ? '<th style="text-align: right; min-width: 140px;">Thao Tác Quyền</th>' : ''}
        </tr>
      </thead>
      <tbody>
  `;

  filtered.forEach(u => {
    const safeName = escapeHtml(u.name || 'Học viên');
    const safeEmail = escapeHtml(u.email || '');
    const initial = safeName.charAt(0).toUpperCase();

    const avatarHtml = u.picture
      ? `<img src="${u.picture}" alt="${safeName}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1.5px solid rgba(255,255,255,0.15);" onerror="this.outerHTML='<div style=\\'width:36px;height:36px;border-radius:50%;background:#0284c7;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;\\'>${initial}</div>'">`
      : `<div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #0284c7, #38bdf8); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem;">${initial}</div>`;

    // Status HTML
    const statusHtml = u.isOnline
      ? `<span class="admin-status-online"><span class="dot"></span> Online</span>`
      : `<span class="admin-status-offline"><span class="dot"></span> ${u.lastSeen ? formatRelativeTime(u.lastSeen) : 'Chưa rõ'}</span>`;

    // Role HTML
    let roleBadge = '';
    if (u.isSuperAdmin) {
      roleBadge = `<span class="admin-role-badge admin-role-super"><i class="fa-solid fa-crown"></i> Super Admin</span>`;
    } else if (u.role === 'teacher' || (u.email && u.email.includes('hongtai'))) {
      roleBadge = `<span class="admin-role-badge admin-role-teacher"><i class="fa-solid fa-chalkboard-user"></i> Giáo viên</span>`;
    } else if (u.isAdmin || u.role === 'admin') {
      roleBadge = `<span class="admin-role-badge admin-role-admin"><i class="fa-solid fa-shield-halved"></i> Quản trị viên</span>`;
    } else {
      roleBadge = `<span class="admin-role-badge admin-role-user"><i class="fa-solid fa-graduation-cap"></i> Học viên</span>`;
    }

    // Scores & progress
    const highestScoreHtml = u.quizCount > 0
      ? `<span style="font-weight: 800; color: #22c55e;">${u.highestQuizScore}đ</span> <span style="font-size: 0.72rem; color: #94a3b8;">(${u.quizCount} đề)</span>`
      : `<span style="font-size: 0.78rem; color: #64748b;">Chưa thi</span>`;

    const wordsProgress = `<span style="font-size: 0.75rem; color: #38bdf8; display: block;">${u.memorizedWordsCount || 0} từ đã thuộc</span>`;

    // Format study time
    const studyHours = ((u.studyTime || 0) / 3600).toFixed(1);
    const studyMins = Math.round(((u.studyTime || 0) % 3600) / 60);
    const timeFormatted = u.studyTime > 3600 ? `${studyHours}h` : `${studyMins} phút`;

    // Actions
    let actionBtnHtml = '';
    if (isCurrentSuper) {
      if (u.isSuperAdmin) {
        actionBtnHtml = `<span style="font-size: 0.75rem; color: #f43f5e; font-weight: 700;"><i class="fa-solid fa-lock"></i> Cố định</span>`;
      } else {
        const currentRoleText = u.role === 'teacher' ? ' (GV)' : (u.role === 'admin' ? ' (Admin)' : '');
        actionBtnHtml = `
          <button type="button" onclick="window.openRolePickerModal('${safeEmail}', '${u.role || 'user'}', '${safeName}')" style="padding: 5px 12px; font-size: 0.76rem; font-weight: 800; border-radius: 8px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s;">
            <i class="fa-solid fa-shield-halved"></i> Cấp quyền${currentRoleText}
          </button>
        `;
      }
    }

    html += `
      <tr class="admin-user-row">
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            ${avatarHtml}
            <div>
              <div style="font-weight: 700; color: #ffffff; font-size: 0.88rem;">${safeName}</div>
              <div style="font-size: 0.72rem; color: #94a3b8;">${safeEmail}</div>
            </div>
          </div>
        </td>
        <td>${statusHtml}</td>
        <td>${roleBadge}</td>
        <td>
          <div>${highestScoreHtml}</div>
          ${wordsProgress}
        </td>
        <td>
          <span style="font-weight: 800; color: #f97316; font-size: 0.88rem;">
            <i class="fa-solid fa-fire"></i> ${u.streak || 0} ngày
          </span>
        </td>
        <td>
          <span style="font-weight: 700; color: #e2e8f0; font-size: 0.85rem;">
            ${timeFormatted}
          </span>
        </td>
        ${isCurrentSuper ? `<td style="text-align: right;">${actionBtnHtml}</td>` : ''}
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;
};

window.openRolePickerModal = function (targetEmail, currentRole, targetName) {
  let modal = document.getElementById('admin-role-picker-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-role-picker-modal';
    modal.style.cssText = 'position: fixed; inset: 0; z-index: 999999; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; padding: 16px;';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background: linear-gradient(180deg, #131d35 0%, #0d1527 100%); border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 24px; width: 100%; max-width: 480px; padding: 26px; box-shadow: 0 25px 60px rgba(0,0,0,0.8); color: #ffffff; position: relative; display: flex; flex-direction: column; gap: 18px; animation: zoomIn 0.2s ease-out;">
      <button type="button" onclick="document.getElementById('admin-role-picker-modal').style.display='none'" style="position: absolute; top: 18px; right: 18px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-size: 1.2rem; cursor: pointer; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <i class="fa-solid fa-xmark"></i>
      </button>

      <div style="display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 14px;">
        <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #0284c7, #2563eb); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: white;">
          <i class="fa-solid fa-shield-halved"></i>
        </div>
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; margin: 0;">Phân Quyền Tài Khoản</h3>
          <p style="font-size: 0.8rem; color: #94a3b8; margin: 2px 0 0 0;">${escapeHtml(targetName)} (${escapeHtml(targetEmail)})</p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <!-- Option 1: Giáo viên -->
        <div onclick="window.confirmChangeRole('${targetEmail}', 'teacher')" style="padding: 14px 16px; border-radius: 14px; background: ${currentRole === 'teacher' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.6)'}; border: 1.5px solid ${currentRole === 'teacher' ? '#38bdf8' : 'rgba(255,255,255,0.1)'}; cursor: pointer; display: flex; align-items: center; gap: 14px; transition: all 0.2s;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
            <i class="fa-solid fa-chalkboard-user"></i>
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 800; color: #38bdf8; font-size: 0.92rem; display: flex; align-items: center; gap: 6px;">
              🛡️ Giáo viên ${currentRole === 'teacher' ? '<span style="font-size: 0.7rem; background: #38bdf8; color: #000; padding: 1px 6px; border-radius: 99px; font-weight: 800;">Hiện tại</span>' : ''}
            </div>
            <div style="font-size: 0.78rem; color: #94a3b8; margin-top: 2px;">Dành cho giáo viên: quản lý bài học, huy hiệu Giáo viên, kiểm duyệt thảo luận.</div>
          </div>
        </div>

        <!-- Option 2: Quản trị viên (Admin) -->
        <div onclick="window.confirmChangeRole('${targetEmail}', 'admin')" style="padding: 14px 16px; border-radius: 14px; background: ${currentRole === 'admin' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(30, 41, 59, 0.6)'}; border: 1.5px solid ${currentRole === 'admin' ? '#a855f7' : 'rgba(255,255,255,0.1)'}; cursor: pointer; display: flex; align-items: center; gap: 14px; transition: all 0.2s;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(168, 85, 247, 0.15); color: #a855f7; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 800; color: #a855f7; font-size: 0.92rem; display: flex; align-items: center; gap: 6px;">
              👑 Quản trị viên (Admin) ${currentRole === 'admin' ? '<span style="font-size: 0.7rem; background: #a855f7; color: #fff; padding: 1px 6px; border-radius: 99px; font-weight: 800;">Hiện tại</span>' : ''}
            </div>
            <div style="font-size: 0.78rem; color: #94a3b8; margin-top: 2px;">Quản trị hệ thống, cấp quyền học viên, quản lý tài khoản và bài viết.</div>
          </div>
        </div>

        <!-- Option 3: Học viên thông thường -->
        <div onclick="window.confirmChangeRole('${targetEmail}', 'user')" style="padding: 14px 16px; border-radius: 14px; background: ${(!currentRole || currentRole === 'user') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(30, 41, 59, 0.6)'}; border: 1.5px solid ${(!currentRole || currentRole === 'user') ? '#10b981' : 'rgba(255,255,255,0.1)'}; cursor: pointer; display: flex; align-items: center; gap: 14px; transition: all 0.2s;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); color: #34d399; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 800; color: #34d399; font-size: 0.92rem; display: flex; align-items: center; gap: 6px;">
              🎓 Học viên ${(!currentRole || currentRole === 'user') ? '<span style="font-size: 0.7rem; background: #10b981; color: #fff; padding: 1px 6px; border-radius: 99px; font-weight: 800;">Hiện tại</span>' : ''}
            </div>
            <div style="font-size: 0.78rem; color: #94a3b8; margin-top: 2px;">Tài khoản học viên thông thường, thu hồi các quyền quản trị viên nếu có.</div>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
};

window.confirmChangeRole = async function (targetEmail, newRole) {
  const modal = document.getElementById('admin-role-picker-modal');
  if (modal) modal.style.display = 'none';
  await window.handleChangeUserRole(targetEmail, newRole);
};

window.handleGrantRoleSubmit = async function (e) {
  if (e) e.preventDefault();

  const emailInput = document.getElementById('admin-grant-email-input');
  const roleSelect = document.getElementById('admin-grant-role-select');
  if (!emailInput || !roleSelect) return;

  const email = emailInput.value.trim();
  const role = roleSelect.value;
  if (!email) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/users/role`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ targetEmail: email, role })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Cấp quyền thất bại');

    showToast(data.message || 'Cấp quyền thành công!');
    emailInput.value = '';
    window.fetchAdminUsersList(false);
  } catch (err) {
    console.error('Grant role error:', err);
    showToast(err.message || 'Lỗi cấp quyền quản trị!', true);
  }
};

window.handleChangeUserRole = async function (targetEmail, newRole) {
  const roleLabel = newRole === 'user' ? 'Học viên (Thu hồi quyền)' : (newRole === 'teacher' ? '🛡️ Giáo viên' : '👑 Quản trị viên');
  if (!confirm(`Bạn có chắc chắn muốn thay đổi quyền của tài khoản ${targetEmail} sang: ${roleLabel}?`)) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/users/role`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ targetEmail, role: newRole })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Thay đổi quyền thất bại');

    showToast(data.message || 'Cập nhật quyền thành công!');
    window.fetchAdminUsersList(false);
  } catch (err) {
    console.error('Change role error:', err);
    showToast(err.message || 'Lỗi cập nhật quyền!', true);
  }
};

