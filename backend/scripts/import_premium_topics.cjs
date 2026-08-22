const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const dir = path.join(__dirname, '..', '..', 'filetuvung');
const dbPath = path.join(__dirname, '..', 'database.json');
const frontendDataPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'premium_topics_data.js');

function clean(v) {
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

function cleanPinyin(py) {
  if (!py) return '';
  return String(py).replace(/\s+/g, ' ').trim();
}

const allWords = [];
let nextId = 60001;

console.log('--- 1. Reading Động từ li hợp.xlsx ---');
const p1 = path.join(dir, 'Động từ li hợp.xlsx');
if (fs.existsSync(p1)) {
  const wb = xlsx.readFile(p1);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1 });
  let count = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[1]) continue;
    const word = clean(r[1]);
    const pinyin = cleanPinyin(r[2]);
    const meaning = clean(r[3]);
    const ex_zh = clean(r[4]);
    const ex_py = clean(r[5]);
    const ex_vi = clean(r[6]);
    if (!word || !meaning) continue;
    allWords.push({
      id: nextId++,
      word,
      pinyin,
      meaning,
      level: 'premium',
      curriculum: 'hsk',
      hskVersion: '3.0',
      category: 'Động từ ly hợp',
      example_zh: ex_zh,
      example_vi: ex_vi,
      note: 'Động từ ly hợp (có thể tách rời hoặc chèn thành phần vào giữa)',
      isMemorized: false,
      isStarred: false,
      isWrong: false,
      isCustom: false
    });
    count++;
  }
  console.log(` -> Imported ${count} words from Động từ li hợp`);
}

console.log('--- 2. Reading Quán dụng ngữ.xlsx ---');
const p2 = path.join(dir, 'Quán dụng ngữ.xlsx');
if (fs.existsSync(p2)) {
  const wb = xlsx.readFile(p2);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1 });
  let count = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[1]) continue;
    const word = clean(r[1]);
    const pinyin = cleanPinyin(r[2]);
    const meaning = clean(r[3]);
    const ex_zh = clean(r[4]);
    const ex_py = clean(r[5]);
    const ex_vi = clean(r[6]);
    if (!word || !meaning) continue;
    allWords.push({
      id: nextId++,
      word,
      pinyin,
      meaning,
      level: 'premium',
      curriculum: 'hsk',
      hskVersion: '3.0',
      category: 'Quán dụng ngữ',
      example_zh: ex_zh,
      example_vi: ex_vi,
      note: 'Quán dụng ngữ thường dùng trong giao tiếp tiếng Trung đời sống',
      isMemorized: false,
      isStarred: false,
      isWrong: false,
      isCustom: false
    });
    count++;
  }
  console.log(` -> Imported ${count} words from Quán dụng ngữ`);
}

console.log('--- 3. Reading Lượng Từ.xlsx ---');
const p3 = path.join(dir, 'Lượng Từ.xlsx');
if (fs.existsSync(p3)) {
  const wb = xlsx.readFile(p3);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1 });
  let count = 0;
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[1]) continue;
    const word = clean(r[1]);
    const pinyin = cleanPinyin(r[2]);
    const u1 = clean(r[3]), ex1_zh = clean(r[4]), ex1_py = clean(r[5]), ex1_vi = clean(r[6]);
    const u2 = clean(r[7]), ex2_zh = clean(r[8]), ex2_py = clean(r[9]), ex2_vi = clean(r[10]);
    const u3 = clean(r[11]), ex3_zh = clean(r[12]), ex3_py = clean(r[13]), ex3_vi = clean(r[14]);

    const usages = [u1, u2, u3].filter(u => u && u !== '-');
    const meaning = usages.join('; ') || 'Lượng từ';

    const examplesZh = [ex1_zh, ex2_zh, ex3_zh].filter(e => e && e !== '-');
    const examplesVi = [ex1_vi, ex2_vi, ex3_vi].filter(e => e && e !== '-');

    const ex_zh = examplesZh[0] || '';
    const ex_vi = examplesVi[0] || '';

    let noteText = '';
    if (usages.length > 0) {
      noteText = 'Cách dùng: ' + usages.join(' | ');
    }

    if (!word || !meaning) continue;
    allWords.push({
      id: nextId++,
      word,
      pinyin,
      meaning,
      level: 'premium',
      curriculum: 'hsk',
      hskVersion: '3.0',
      category: 'Lượng từ',
      example_zh: ex_zh,
      example_vi: ex_vi,
      note: noteText || 'Tổng hợp lượng từ tiếng Trung',
      isMemorized: false,
      isStarred: false,
      isWrong: false,
      isCustom: false
    });
    count++;
  }
  console.log(` -> Imported ${count} words from Lượng Từ`);
}

console.log('--- 4. Reading Chủ đề lẻ_.xlsx ---');
const p4 = path.join(dir, 'Chủ đề lẻ_.xlsx');
if (fs.existsSync(p4)) {
  const wb = xlsx.readFile(p4);
  let totalCount = 0;
  wb.SheetNames.forEach(sheetName => {
    const ws = wb.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(ws, { header: 1 });
    let sheetCount = 0;

    let catName = sheetName.trim();
    if (catName === 'Tích cách') catName = 'Tính cách';
    if (catName === 'Bộ Phận cơ thể người') catName = 'Bộ phận cơ thể';

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || (!r[0] && !r[1])) continue;
      const word = clean(r[0]);
      if (!word) continue;
      const pinyin = cleanPinyin(r[1]);
      const meaning = clean(r[2]);
      const note = clean(r[3]);
      const ex_zh = clean(r[4]);
      const ex_py = clean(r[5]);
      const ex_vi = clean(r[6]);

      if (!meaning) continue;

      allWords.push({
        id: nextId++,
        word,
        pinyin,
        meaning,
        level: 'premium',
        curriculum: 'hsk',
        hskVersion: '3.0',
        category: catName,
        example_zh: ex_zh,
        example_vi: ex_vi,
        note: note || `Chủ đề: ${catName}`,
        isMemorized: false,
        isStarred: false,
        isWrong: false,
        isCustom: false
      });
      sheetCount++;
    }
    totalCount += sheetCount;
  });
  console.log(` -> Imported ${totalCount} words from Chủ đề lẻ across ${wb.SheetNames.length} sheets`);
}

// 5. Check Chủ đề chuyên ngành.xlsx if any data
const p5 = path.join(dir, 'Chủ đề chuyên ngành.xlsx');
if (fs.existsSync(p5)) {
  const wb = xlsx.readFile(p5);
  let specCount = 0;
  wb.SheetNames.forEach(sheetName => {
    const ws = wb.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(ws, { header: 1 });
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || !r[0]) continue;
      const word = clean(r[0]);
      const pinyin = cleanPinyin(r[1]);
      const meaning = clean(r[2]);
      if (!word || !meaning) continue;
      allWords.push({
        id: nextId++,
        word,
        pinyin,
        meaning,
        level: 'premium',
        curriculum: 'hsk',
        hskVersion: '3.0',
        category: 'Chuyên ngành',
        example_zh: clean(r[4]),
        example_vi: clean(r[6]),
        note: clean(r[3]) || 'Chuyên ngành',
        isMemorized: false,
        isStarred: false,
        isWrong: false,
        isCustom: false
      });
      specCount++;
    }
  });
  if (specCount > 0) {
    console.log(` -> Imported ${specCount} words from Chủ đề chuyên ngành`);
  }
}

console.log('========================================================');
console.log('TOTAL EXTRACTED PREMIUM WORDS:', allWords.length);

// Also include previous 3 baseline topics (Du lịch, Công sở, Đàm phán)
const baselineTopics = [
  { word: "旅游", pinyin: "lǚyóu", meaning: "du lịch", category: "Du lịch", explanation: "Chỉ hoạt động đi tham quan, vui chơi ở nơi khác.", example_zh: "我们去中国旅游。", example_vi: "Chúng tôi đi du lịch Trung Quốc." },
  { word: "飞机", pinyin: "fēijī", meaning: "máy bay", category: "Du lịch", explanation: "Phương tiện bay trên không.", example_zh: "坐飞机很快。", example_vi: "Đi máy bay rất nhanh." },
  { word: "酒店", pinyin: "jiǔdiàn", meaning: "khách sạn", category: "Du lịch", explanation: "Nơi lưu trú cho khách du lịch.", example_zh: "这家酒店很干净。", example_vi: "Khách sạn này rất sạch sẽ." },
  { word: "门票", pinyin: "ménpiào", meaning: "vé vào cổng", category: "Du lịch", explanation: "Vé để vào các điểm tham quan.", example_zh: "景点的门票很贵。", example_vi: "Vé vào cổng của điểm tham quan rất đắt." },
  { word: "行李", pinyin: "xíngli", meaning: "hành lý", category: "Du lịch", explanation: "Đồ đạc mang theo khi đi xa.", example_zh: "我的行李在哪儿？", example_vi: "Hành lý của tôi ở đâu?" },
  { word: "导游", pinyin: "dǎoyóu", meaning: "hướng dẫn viên du lịch", category: "Du lịch", explanation: "Người dẫn đoàn và giới thiệu cảnh đẹp.", example_zh: "他是我们的导游。", example_vi: "Anh ấy là hướng dẫn viên của chúng tôi." },
  { word: "护照", pinyin: "hùzhào", meaning: "hộ chiếu", category: "Du lịch", explanation: "Giấy tờ thông hành quốc tế.", example_zh: "请出示你的护照。", example_vi: "Vui lòng xuất trình hộ chiếu của bạn." },
  { word: "景点", pinyin: "jǐngdiǎn", meaning: "địa điểm tham quan", category: "Du lịch", explanation: "Nơi có phong cảnh đẹp để ngắm nhìn.", example_zh: "这个景点很有名。", example_vi: "Địa điểm tham quan này rất nổi tiếng." },
  { word: "加班", pinyin: "jiābān", meaning: "làm tăng ca / làm thêm giờ", category: "Công sở", explanation: "Làm việc ngoài giờ quy định.", example_zh: "今天我要加班。", example_vi: "Hôm nay tôi phải làm tăng ca." },
  { word: "会议", pinyin: "huìyì", meaning: "cuộc họp / hội nghị", category: "Công sở", explanation: "Buổi gặp mặt thảo luận công việc.", example_zh: "下午两点有会议。", example_vi: "Chiều hai giờ có cuộc họp." },
  { word: "报告", pinyin: "bàogào", meaning: "báo cáo", category: "Công sở", explanation: "Trình bày kết quả công việc bằng văn bản hoặc lời nói.", example_zh: "我已经写好报告了。", example_vi: "Tôi đã viết xong báo cáo rồi." },
  { word: "同事", pinyin: "tóngshì", meaning: "đồng nghiệp", category: "Công sở", explanation: "Người cùng làm việc trong một cơ quan.", example_zh: "他是我的新同事。", example_vi: "Anh ấy là đồng nghiệp mới của tôi." },
  { word: "出差", pinyin: "chūchāi", meaning: "đi công tác", category: "Công sở", explanation: "Đi làm việc ở nơi khác theo phân công.", example_zh: "下周我要去北京出差。", example_vi: "Tuần tới tôi phải đi công tác Bắc Kinh." },
  { word: "请假", pinyin: "qǐngjià", meaning: "xin nghỉ phép", category: "Công sở", explanation: "Xin phép nghỉ làm.", example_zh: "我想请假一天。", example_vi: "Tôi muốn xin nghỉ phép một ngày." },
  { word: "薪水", pinyin: "xīnshuǐ", meaning: "tiền lương", category: "Công sở", explanation: "Tiền công trả cho người lao động.", example_zh: "这儿的薪水还可以。", example_vi: "Lương ở đây cũng được." },
  { word: "退休", pinyin: "tuìxiū", meaning: "nghỉ hưu", category: "Công sở", explanation: "Nghỉ làm việc khi đến tuổi quy định.", example_zh: "我爸爸明年就退休了。", example_vi: "Bố tôi năm tới sẽ nghỉ hưu." },
  { word: "合作", pinyin: "hézuò", meaning: "hợp tác", category: "Đàm phán", explanation: "Cùng chung sức làm việc vì mục đích chung.", example_zh: "祝 chúng ta hợp tác vui vẻ！", example_vi: "Chúc chúng ta hợp tác vui vẻ!" },
  { word: "合同", pinyin: "hétong", meaning: "hợp đồng", category: "Đàm phán", explanation: "Văn bản ký kết thỏa thuận giữa các bên.", example_zh: "我们在合同上签字了。", example_vi: "Chúng tôi đã ký tên trên hợp đồng." },
  { word: "价格", pinyin: "jiàgé", meaning: "giá cả", category: "Đàm phán", explanation: "Giá của hàng hóa.", example_zh: "我们可以讨论一下价格。", example_vi: "Chúng ta có thể thảo luận một chút về giá cả." },
  { word: "客户", pinyin: "kèhù", meaning: "khách hàng", category: "Đàm phán", explanation: "Đối tác mua hàng hoặc sử dụng dịch vụ.", example_zh: "这位是我们的重要客户。", example_vi: "Vị này là khách hàng quan trọng của chúng tôi." },
  { word: "折扣", pinyin: "zhékòu", meaning: "chiết khấu / giảm giá", category: "Đàm phán", explanation: "Giảm bớt giá của hàng hóa.", example_zh: "如果买得多，有折扣吗？", example_vi: "Nếu mua nhiều thì có giảm giá không?" },
  { word: "谈判", pinyin: "tánpàn", meaning: "đàm phán", category: "Đàm phán", explanation: "Trao đổi, thỏa thuận điều kiện giữa các bên.", example_zh: "谈判进行得很顺利。", example_vi: "Cuộc đàm phán diễn ra rất thuận lợi." },
  { word: "发票", pinyin: "fāpiào", meaning: "hóa đơn", category: "Đàm phán", explanation: "Chứng từ mua bán hàng hóa.", example_zh: "请给我开一张发票。", example_vi: "Vui lòng xuất cho tôi một tờ hóa đơn." },
  { word: "定金", pinyin: "dìngjīn", meaning: "tiền đặt cọc", category: "Đàm phán", explanation: "Tiền trả trước để bảo đảm thực hiện hợp đồng.", example_zh: "我们需要先付定金。", example_vi: "Chúng ta cần thanh toán tiền cọc trước." }
];

baselineTopics.forEach(b => {
  allWords.push({
    id: nextId++,
    word: b.word,
    pinyin: b.pinyin,
    meaning: b.meaning,
    level: 'premium',
    curriculum: 'hsk',
    hskVersion: '3.0',
    category: b.category,
    example_zh: b.example_zh,
    example_vi: b.example_vi,
    note: b.explanation,
    isMemorized: false,
    isStarred: false,
    isWrong: false,
    isCustom: false
  });
});

console.log('Final Total Premium Words (including baseline):', allWords.length);

// 6. Update backend/database.json
const dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const nonPremiumDb = dbContent.filter(w => w.level !== 'premium');
const updatedDb = [...nonPremiumDb, ...allWords];
fs.writeFileSync(dbPath, JSON.stringify(updatedDb, null, 2), 'utf-8');
console.log(`Updated backend/database.json with ${updatedDb.length} total words (${allWords.length} premium words).`);

// 7. Generate frontend/src/premium_topics_data.js for client fallback and rich metadata
const categoryMap = {};
allWords.forEach(w => {
  if (!categoryMap[w.category]) {
    categoryMap[w.category] = [];
  }
  categoryMap[w.category].push(w);
});

console.log('\n--- Category Breakdown ---');
Object.keys(categoryMap).forEach(cat => {
  console.log(` - ${cat}: ${categoryMap[cat].length} words`);
});

const frontendFileContent = `// Auto-generated Premium Topics Dataset
export const PREMIUM_WORDS = ${JSON.stringify(allWords, null, 2)};
`;

fs.writeFileSync(frontendDataPath, frontendFileContent, 'utf-8');
console.log(`Saved frontend/src/premium_topics_data.js successfully!`);
