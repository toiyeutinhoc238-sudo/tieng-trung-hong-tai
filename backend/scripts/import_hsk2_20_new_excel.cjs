const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const excelPath = path.join(__dirname, '../../filetuvung/Từ vựng HSK 2 2.0 new.xlsx');
const dbPath = path.join(__dirname, '../database.json');

if (!fs.existsSync(excelPath)) {
  console.error('File not found:', excelPath);
  process.exit(1);
}

const wb = xlsx.readFile(excelPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log(`Read ${rows.length} rows from Excel file: ${path.basename(excelPath)}`);

const lessonTitlesMap = {
  1: '九月去北京旅游最好',
  2: '我每天六点起床',
  3: '左边那个红色的是我的',
  4: '这个工作是他帮我介绍的',
  5: '就买这件吧',
  6: '你怎么不吃了？',
  7: '你家离公司远吗',
  8: '让我想想再告诉你',
  9: '题太多，我没做完',
  10: '别找了，手机在桌子上',
  11: '他比我大三岁',
  12: '你穿得太少了',
  13: '门开着呢',
  14: '你看过那个电影吗？',
  15: '新年就要到了'
};

let currentLessonId = 0;
let currentLessonTitle = '';
const parsedWords = [];

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || r.length === 0) continue;

  const baiRaw = r[0];
  const titleRaw = r[1];
  const word = (r[2] || '').toString().trim();

  if (!word) continue;

  if (baiRaw !== undefined && baiRaw !== null && String(baiRaw).trim() !== '') {
    const digitMatch = String(baiRaw).match(/\d+/);
    if (digitMatch) {
      currentLessonId = parseInt(digitMatch[0], 10);
    } else {
      currentLessonId++;
    }
  } else if (titleRaw !== undefined && titleRaw !== null && String(titleRaw).trim() !== '') {
    currentLessonId++;
  }

  if (titleRaw !== undefined && titleRaw !== null && String(titleRaw).trim() !== '') {
    currentLessonTitle = String(titleRaw).trim();
  } else if (lessonTitlesMap[currentLessonId]) {
    currentLessonTitle = lessonTitlesMap[currentLessonId];
  }

  // Format lesson title: ensure standard format "Bài X: <Title>"
  let cleanTitle = currentLessonTitle;
  cleanTitle = cleanTitle.replace(/^Bài\s*\d+\s*[:：\-–]?\s*/i, '').trim();
  const formattedLessonTitle = `Bài ${currentLessonId}: ${cleanTitle}`;

  const pinyin = (r[3] || '').toString().trim();
  const category = (r[4] || '').toString().trim() || 'Từ vựng';
  const meaning = (r[5] || '').toString().trim();
  const note = (r[6] || '').toString().trim();
  const example_zh = (r[7] || '').toString().trim();
  const example_vi = (r[8] || '').toString().trim();
  const question = (r[9] || '').toString().trim();
  const answer = (r[10] || '').toString().trim();

  parsedWords.push({
    word,
    pinyin,
    meaning,
    level: 2,
    curriculum: 'hsk',
    hskVersion: '2.0',
    volume: null,
    lessonId: currentLessonId,
    lessonTitle: formattedLessonTitle,
    lessonDesc: `Toàn bộ từ vựng ${formattedLessonTitle} chuẩn HSK 2 (v2.0)`,
    category,
    example_zh,
    example_vi,
    question,
    answer,
    note
  });
}

console.log(`Parsed ${parsedWords.length} vocabulary items across ${currentLessonId} lessons from Excel.`);

// Read existing database.json
let db = [];
if (fs.existsSync(dbPath)) {
  db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  console.log(`Existing database contains ${db.length} total items.`);
}

// Map existing HSK 2 (v2.0) items
const existingHsk2Map = new Map();
db.forEach(w => {
  if (w.level === 2 && w.hskVersion === '2.0' && !w.isCustom) {
    existingHsk2Map.set(w.word.trim(), w);
  }
});

let updatedCount = 0;
let newCount = 0;

// Preserve IDs and user state (starred, memorized) if existing
const finalHsk2Items = parsedWords.map((pw, index) => {
  const existing = existingHsk2Map.get(pw.word);
  if (existing) {
    updatedCount++;
    return Object.assign({}, existing, {
      pinyin: pw.pinyin || existing.pinyin,
      meaning: pw.meaning || existing.meaning,
      category: pw.category || existing.category,
      level: 2,
      curriculum: 'hsk',
      hskVersion: '2.0',
      volume: null,
      lessonId: pw.lessonId,
      lessonTitle: pw.lessonTitle,
      lessonDesc: pw.lessonDesc,
      example_zh: pw.example_zh,
      example_vi: pw.example_vi,
      question: pw.question,
      answer: pw.answer,
      note: pw.note
    });
  } else {
    newCount++;
    return Object.assign({}, pw, {
      id: 20000 + index + 1,
      isMemorized: false,
      isStarred: false,
      isCustom: false
    });
  }
});

console.log(`Updated ${updatedCount} existing HSK 2 (2.0) items, added ${newCount} new items.`);

// Re-assemble database: non-HSK2 2.0 items + updated HSK 2 2.0 items
const nonHsk2Items = db.filter(w => !(w.level === 2 && w.hskVersion === '2.0' && !w.isCustom));
const updatedDb = [...nonHsk2Items, ...finalHsk2Items];

fs.writeFileSync(dbPath, JSON.stringify(updatedDb, null, 2), 'utf8');
console.log(`Successfully saved ${updatedDb.length} items to database.json!`);
