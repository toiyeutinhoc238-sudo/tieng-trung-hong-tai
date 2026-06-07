import XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.json');
const MAP_PATH = path.join(__dirname, 'lessons_mapping.json');

const files = [
  { level: 1, filename: 'TỔNG HỢP TỪ VỰNG HSK 1 PHIÊN BẢN 3.0.xlsx' },
  { level: 2, filename: 'TỔNG HỢP TỪ VỰNG HSK 2 PHIÊN BẢN 3.0.xlsx' },
  { level: 3, filename: 'TỔNG HỢP TỪ VỰNG HSK 3 PHIÊN BẢN 3.0.xlsx' }
];

const LESSONS_METADATA = {
  1: {
    1: { title: "Bài 1: Chào hỏi - 你好", desc: "Học cách chào hỏi cơ bản, từ vựng thông dụng và cách nói lời xin lỗi." },
    2: { title: "Bài 2: Cảm ơn - 谢谢你", desc: "Học cách bày tỏ lòng biết ơn, nói lời tạm biệt và các đại từ chỉ bạn bè." },
    3: { title: "Bài 3: Bạn tên là gì? - 你叫什么名字", desc: "Học cách tự giới thiệu bản thân, quốc tịch, tên tuổi và nghề nghiệp." },
    4: { title: "Bài 4: Cô ấy là giáo viên của tôi - 她是我的老师", desc: "Học cách nói về mối quan hệ, nghề nghiệp và giới thiệu người khác." },
    5: { title: "Bài 5: Gia đình tôi có 4 người - 我家有四口人", desc: "Học cách đếm số, giới thiệu các thành viên trong gia đình." },
    6: { title: "Bài 6: Tôi biết nói tiếng Trung - 我会说汉语", desc: "Nói về khả năng, kỹ năng và các ngôn ngữ phổ biến." },
    7: { title: "Bài 7: Hôm nay là thứ mấy? - 今天星期几", desc: "Cách hỏi và trả lời về thời gian, ngày tháng trong tuần." },
    8: { title: "Bài 8: Tôi muốn mua quả táo - 我想买苹果", desc: "Học cách mua sắm, hỏi giá tiền và các loại hoa quả cơ bản." },
    9: { title: "Bài 9: Thời tiết hôm nay thế nào? - 今天天气怎么样", desc: "Mô tả thời tiết, nhiệt độ và các trạng thái tự nhiên." },
    10: { title: "Bài 10: Tôi đang xem phim - 我在看电影", desc: "Diễn tả các hành động đang xảy ra và sở thích giải trí." },
    11: { title: "Bài 11: Thời gian và Công việc - 时间与工作", desc: "Học cách nói về giờ giấc, lịch trình hàng ngày và công việc." },
    12: { title: "Bài 12: Sức khỏe và Cảm xúc - 健康与情感", desc: "Học cách nói về cảm giác cơ thể, tình trạng sức khỏe và cảm xúc." },
    13: { title: "Bài 13: Ăn uống và Nhà hàng - 饮食与餐馆", desc: "Học từ vựng đặt món, ăn uống và giao tiếp tại nhà hàng." },
    14: { title: "Bài 14: Phương tiện giao thông - 交通出行", desc: "Học cách nói về các phương tiện đi lại như tàu hỏa, xe buýt." },
    15: { title: "Bài 15: Du lịch và Trải nghiệm - 旅游与体验", desc: "Học từ vựng về đi du lịch, hỏi đường và trải nghiệm văn hóa." }
  },
  2: {
    1: { title: "Bài 1: Cuộc sống hàng ngày - 日常生活", desc: "Học từ vựng mô tả thói quen sinh hoạt và ăn uống hàng ngày." },
    2: { title: "Bài 2: Thể thao và Sức khỏe - 运动与健康", desc: "Từ vựng các môn thể thao, rèn luyện thân thể và cảm giác cơ thể." },
    3: { title: "Bài 3: Phương tiện giao thông - 交通工具", desc: "Học từ vựng du lịch, các phương tiện đi lại như tàu hỏa, máy bay." },
    4: { title: "Bài 4: Sở thích và giải trí - 兴趣与娱乐", desc: "Thảo luận về âm nhạc, phim ảnh, đọc sách và các hoạt động thư giãn." },
    5: { title: "Bài 5: Gia đình và Bạn bè - 家庭与朋友", desc: "Mô tả các mối quan hệ xã hội, gia đình và bạn bè thân thiết." },
    6: { title: "Bài 6: Mua sắm và Thời trang - 购物与时尚", desc: "Học từ vựng quần áo, màu sắc, giá cả và mua sắm." },
    7: { title: "Bài 7: Trường học và Học tập - 学校与学习", desc: "Mô tả trường lớp, các môn học, thi cử và kết quả học tập." },
    8: { title: "Bài 8: Thời tiết và Bốn mùa - 天气与四季", desc: "Mô tả các mùa trong năm, nhiệt độ và trạng thái thời tiết." },
    9: { title: "Bài 9: Ăn uống và Ẩm thực - 饮食与 ẩm thực", desc: "Thảo luận món ăn yêu thích, các bữa ăn và văn hóa ẩm thực." },
    10: { title: "Bài 10: Công việc và Nghề nghiệp - 工作与职业", desc: "Nói về các nghề nghiệp phổ biến, nơi làm việc và công vụ." },
    11: { title: "Bài 11: Cơ thể và Sức khỏe - 身体与健康", desc: "Nói về các bộ phận cơ thể, triệu chứng ốm đau và khám bệnh." },
    12: { title: "Bài 12: Nhà cửa và Môi trường - 住宅与环境", desc: "Mô tả nhà cửa, phòng ốc và môi trường sống xung quanh." },
    13: { title: "Bài 13: Giao tiếp xã hội - 社交礼仪", desc: "Học cách chào hỏi lịch sự, cảm ơn, xin lỗi và giao tiếp lịch thiệp." },
    14: { title: "Bài 14: Lễ hội và Kỳ nghỉ - 节日与假期", desc: "Nói về các ngày lễ truyền thống, hoạt động vui chơi ngày nghỉ." },
    15: { title: "Bài 15: Kế hoạch tương lai - 计划与未来", desc: "Thảo luận dự định tương lai, ước mơ và kế hoạch cuộc sống." }
  },
  3: {
    1: { title: "Bài 1: Giao tiếp văn phòng - 办公室", desc: "Học từ vựng liên quan đến công việc, đồng nghiệp và công sở." },
    2: { title: "Bài 2: Kỳ nghỉ lý thú - 快乐假期", desc: "Học từ vựng đi du lịch nước ngoài, hỏi đường và trải nghiệm văn hóa." },
    3: { title: "Bài 3: Mua sắm và Ẩm thực - 购物与美食", desc: "Đặt món ăn tại nhà hàng, từ vựng các món ăn Trung Hoa nổi tiếng." },
    4: { title: "Bài 4: Sức khỏe và Thể thao - 健康与运动", desc: "Thảo luận về sức khỏe, các bài tập thể dục và thói quen lành mạnh." },
    5: { title: "Bài 5: Nhà cửa và Cuộc sống - Vị trí & Phòng", desc: "Mô tả cách bày trí phòng ốc, đồ gia dụng và dọn dẹp nhà cửa." },
    6: { title: "Bài 6: Giao thông và Đi lại - Du lịch & Vé", desc: "Từ vựng về phương tiện giao thông công cộng, mua vé và ga tàu." },
    7: { title: "Bài 7: Mối quan hệ và Giao tiếp - Hẹn hò & Gặp gỡ", desc: "Học từ vựng về giao tiếp xã hội, hẹn hò và kết nối bạn bè." },
    8: { title: "Bài 8: Thời tiết và Thiên nhiên - Khí hậu & Địa lý", desc: "Mô tả các hiện tượng thời tiết phức tạp và danh lam thắng cảnh." },
    9: { title: "Bài 9: Sở thích và Nghệ thuật - Âm nhạc & Phim", desc: "Nói về các sở thích cá nhân, nhạc cụ và các loại hình nghệ thuật." },
    10: { title: "Bài 10: Học tập và Ngôn ngữ - Trường học & Sách", desc: "Từ vựng về việc học tiếng Trung, sử dụng từ điển và đọc sách." },
    11: { title: "Bài 11: Công việc và Kinh doanh - Dự án & Họp", desc: "Thảo luận về các cuộc họp công sở, đàm phán và dự án." },
    12: { title: "Bài 12: Mua sắm và Dịch vụ - Giá cả & Thanh toán", desc: "Học từ vựng thanh toán, giao dịch ngân hàng và hoàn trả hàng hóa." },
    13: { title: "Bài 13: Động vật và Môi trường - Thú cưng & Bảo tồn", desc: "Nói về thế giới động vật, thú cưng và các vấn đề bảo vệ môi trường." },
    14: { title: "Bài 14: Lịch sử và Văn hóa - Truyền thống & Di sản", desc: "Học về các ngày lễ hội cổ truyền và nét đẹp văn hóa Trung Hoa." },
    15: { title: "Bài 15: Kế hoạch và Dự định - Tương lai & Ước mơ", desc: "Thảo luận về mục tiêu dài hạn, phỏng vấn xin việc và ước mơ." },
    16: { title: "Bài 16: Cảm xúc và Thái độ - Suy nghĩ & Hành vi", desc: "Bày tỏ cảm xúc vui buồn, sự lo lắng, tự tin và thái độ sống." },
    17: { title: "Bài 17: Khoa học và Công nghệ - Thiết bị & Internet", desc: "Từ vựng về sử dụng điện thoại thông minh, internet và công nghệ." },
    18: { title: "Bài 18: Tổng kết và Ôn tập - HSK 3", desc: "Bài học ôn tập tổng hợp toàn bộ từ vựng cốt lõi của giáo trình HSK 3." }
  }
};

// Helper to clean up pinyin by removing starting and trailing slashes
function cleanPinyin(pinyin) {
  if (!pinyin) return '';
  return pinyin.toString().replace(/^\/|\/$/g, '').trim();
}

// Helper to split a list of words into P parts as equal as possible
function splitIntoParts(array, maxChunkSize = 20, minChunkSize = 13) {
  const N = array.length;
  if (N < 26) {
    return [array];
  }
  
  let P = Math.ceil(N / maxChunkSize);
  // Ensure P doesn't create parts smaller than minChunkSize if we can avoid it
  if (P > 1 && Math.floor(N / P) < minChunkSize) {
    if (Math.floor(N / (P - 1)) <= maxChunkSize) {
      P = P - 1;
    }
  }
  
  const result = [];
  const baseSize = Math.floor(N / P);
  const extra = N % P;
  let offset = 0;
  for (let i = 0; i < P; i++) {
    const size = baseSize + (i < extra ? 1 : 0);
    result.push(array.slice(offset, offset + size));
    offset += size;
  }
  return result;
}

async function run() {
  console.log('Starting HSK vocabulary import...');

  // 1. Read existing database.json to preserve user state and custom words
  let customWords = [];
  const existingStatusMap = new Map(); // key: word_level -> { isMemorized, isStarred }

  try {
    const dbContent = await fs.readFile(DB_PATH, 'utf-8');
    const existingList = JSON.parse(dbContent);

    existingList.forEach(item => {
      if (item.isCustom) {
        customWords.push(item);
      } else {
        const key = `${item.word.trim()}_hsk${item.level}`;
        existingStatusMap.set(key, {
          isMemorized: !!item.isMemorized,
          isStarred: !!item.isStarred
        });
      }
    });
    console.log(`Loaded existing DB. Preserved custom words: ${customWords.length}. Map status count: ${existingStatusMap.size}`);
  } catch (err) {
    console.warn('Could not read existing database.json or it is empty. Starting fresh.', err.message);
  }

  // 2. Load lessons mapping from JSON
  let lessonsMapping = {};
  try {
    const mappingData = await fs.readFile(MAP_PATH, 'utf-8');
    lessonsMapping = JSON.parse(mappingData);
    console.log(`Loaded lessons mapping with ${Object.keys(lessonsMapping).length} entries.`);
  } catch (err) {
    console.warn('Could not read lessons_mapping.json. Will default to supplementary lesson grouping.', err.message);
  }

  // Build a fast lookup map for word to { level, lesson }
  const wordToPdfMap = new Map();
  for (const [key, lesson] of Object.entries(lessonsMapping)) {
    const match = key.match(/^(.*)_hsk(\d+)$/);
    if (match) {
      const word = match[1].trim();
      const level = parseInt(match[2]);
      wordToPdfMap.set(word, { level, lesson });
    }
  }

  function getPdfLessonInfo(word) {
    if (wordToPdfMap.has(word)) {
      return wordToPdfMap.get(word);
    }
    // Check split parts like "爸爸 | 爸"
    const parts = word.split('|').map(x => x.trim());
    for (const p of parts) {
      if (wordToPdfMap.has(p)) {
        return wordToPdfMap.get(p);
      }
    }
    return null;
  }

  // 3. Parse vocabulary from Excel files
  const parsedWords = [];

  for (const f of files) {
    const filePath = path.join(__dirname, '..', 'filetuvung', f.filename);
    console.log(`\nParsing Level ${f.level} from file: ${f.filename}`);
    try {
      const workbook = XLSX.readFile(filePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      let headerIdx = -1;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i] && rows[i][0] === 'STT') {
          headerIdx = i;
          break;
        }
      }

      if (headerIdx === -1) {
        console.error(`Could not find header row (starting with 'STT') in Level ${f.level} file!`);
        continue;
      }

      let lastWord = '';
      let lastPinyin = '';
      let fileItemCount = 0;

      for (let i = headerIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const sttValue = row[0];
        let wordVal = row[1];
        let pinyinVal = row[2];
        const categoryVal = row[3];
        const meaningVal = row[4];
        const exampleZhVal = row[5];
        const exampleViVal = row[7];

        let isSubMeaning = false;
        let isNewWord = false;

        if (sttValue && !isNaN(parseInt(sttValue.toString().trim()))) {
          isNewWord = true;
        } else if (!sttValue && (categoryVal || meaningVal)) {
          isSubMeaning = true;
        }

        if (isNewWord) {
          lastWord = (wordVal || '').toString().trim();
          lastPinyin = cleanPinyin(pinyinVal);
          if (!lastWord) continue;
        } else if (isSubMeaning) {
          wordVal = lastWord;
          pinyinVal = lastPinyin;
        } else {
          continue;
        }

        const word = (wordVal || lastWord).toString().trim();
        const pinyin = isSubMeaning ? lastPinyin : cleanPinyin(pinyinVal || lastPinyin);
        const category = (categoryVal || 'Chưa phân loại').toString().trim();
        const meaning = (meaningVal || '').toString().trim();
        const example_zh = (exampleZhVal || '').toString().trim();
        const example_vi = (exampleViVal || '').toString().trim();

        if (!word) continue;

        parsedWords.push({
          excelLevel: f.level,
          word,
          pinyin,
          meaning,
          category,
          example_zh,
          example_vi
        });

        fileItemCount++;
      }

      console.log(`Successfully parsed ${fileItemCount} items for Level ${f.level}.`);
    } catch (err) {
      console.error(`Error processing Level ${f.level}:`, err);
    }
  }

  // 4. Align level and lesson, grouping unmatched words into supplementary lessons
  const finalList = [];
  let currentId = 1;

  // Separate textbook words by level and PDF lesson
  const textbookGroups = {
    1: {},
    2: {},
    3: {}
  };

  const unmatchedByLevel = { 1: [], 2: [], 3: [] };

  parsedWords.forEach(item => {
    const pdfInfo = getPdfLessonInfo(item.word);
    
    if (pdfInfo) {
      const lvl = pdfInfo.level;
      const les = pdfInfo.lesson;
      if (!textbookGroups[lvl][les]) {
        textbookGroups[lvl][les] = [];
      }
      textbookGroups[lvl][les].push(item);
    } else {
      unmatchedByLevel[item.excelLevel].push(item);
    }
  });

  // Helper to append a word with its lessonId, lessonTitle, and lessonDesc
  function appendWordToList(item, level, lessonId, lessonTitle, lessonDesc) {
    const statusKey = `${item.word}_hsk${level}`;
    let isMemorized = false;
    let isStarred = false;
    if (existingStatusMap.has(statusKey)) {
      const status = existingStatusMap.get(statusKey);
      isMemorized = status.isMemorized;
      isStarred = status.isStarred;
    }

    finalList.push({
      id: currentId++,
      word: item.word,
      pinyin: item.pinyin,
      meaning: item.meaning,
      level: level,
      lessonId: lessonId,
      lessonTitle: lessonTitle,
      lessonDesc: lessonDesc,
      category: item.category,
      example_zh: item.example_zh,
      example_vi: item.example_vi,
      isMemorized,
      isStarred,
      isCustom: false
    });
  }

  // Process and split textbook lessons
  const nextLessonIdForLevel = { 1: 1, 2: 1, 3: 1 };

  for (let lvl = 1; lvl <= 3; lvl++) {
    const maxPdfLesson = lvl === 1 ? 15 : (lvl === 2 ? 15 : 18);
    
    for (let les = 1; les <= maxPdfLesson; les++) {
      const words = textbookGroups[lvl][les] || [];
      if (words.length === 0) continue;
      
      const meta = (LESSONS_METADATA[lvl] && LESSONS_METADATA[lvl][les]) || { title: `Bài ${les}`, desc: `Từ vựng HSK ${lvl} Bài ${les}` };
      
      // Split into parts of 13-20 words
      const parts = splitIntoParts(words, 20, 13);
      
      if (parts.length === 1) {
        const lessonId = nextLessonIdForLevel[lvl]++;
        parts[0].forEach(item => {
          appendWordToList(item, lvl, lessonId, meta.title, meta.desc);
        });
      } else {
        // If split, append (Phần 1), (Phần 2) to the title
        parts.forEach((partWords, pIdx) => {
          const lessonId = nextLessonIdForLevel[lvl]++;
          const partTitle = `${meta.title} (Phần ${pIdx + 1})`;
          partWords.forEach(item => {
            appendWordToList(item, lvl, lessonId, partTitle, meta.desc);
          });
        });
      }
    }
  }

  // Process unmatched words into supplementary lessons
  for (let lvl = 1; lvl <= 3; lvl++) {
    const list = unmatchedByLevel[lvl];
    
    // Sort unmatched list alphabetically to keep it clean
    list.sort((a, b) => a.word.localeCompare(b.word, 'zh'));

    const chunks = splitIntoParts(list, 20, 13);
    chunks.forEach((chunk, chunkIdx) => {
      const lessonId = nextLessonIdForLevel[lvl]++;
      const partNum = chunkIdx + 1;
      const title = `Từ vựng bổ sung - Phần ${partNum}`;
      const desc = `Ôn tập từ vựng mở rộng của HSK Cấp ${lvl} phần ${partNum}.`;
      
      chunk.forEach(item => {
        appendWordToList(item, lvl, lessonId, title, desc);
      });
    });
    console.log(`Level ${lvl}: Populated lessons up to Lesson ${nextLessonIdForLevel[lvl] - 1}.`);
  }

  // 5. Append custom words at the end of database list with updated IDs
  console.log(`\nImported built-in words: ${finalList.length}`);
  console.log(`Appending custom words: ${customWords.length}`);

  customWords.forEach(customItem => {
    finalList.push({
      ...customItem,
      id: currentId++
    });
  });

  // 6. Write back to database.json
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(finalList, null, 2), 'utf-8');
    console.log(`\nSuccessfully wrote ${finalList.length} total items to database.json!`);
  } catch (err) {
    console.error('Failed to save imported vocabulary list to database.json:', err);
  }
}

run();
