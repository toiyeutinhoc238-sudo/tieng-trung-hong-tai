const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const excelPath = path.join(__dirname, '../../filetuvung/Từ vựng HSK 1 3.0 VER3.xlsx');
const dbPath = path.join(__dirname, '../database.json');

if (!fs.existsSync(excelPath)) {
  console.error('File not found:', excelPath);
  process.exit(1);
}

const wb = xlsx.readFile(excelPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log(`Read ${rows.length} rows from Excel file: ${path.basename(excelPath)}`);

const cnList = [
  ['十五', 15], ['十四', 14], ['十三', 13], ['十二', 12], ['十一', 11],
  ['十', 10], ['九', 9], ['八', 8], ['七', 7], ['六', 6], ['五', 5], ['四', 4], ['三', 3], ['二', 2], ['一', 1]
];

function parseLessonId(baiRaw, lastLessonId) {
  if (!baiRaw) return lastLessonId || 1;
  const str = String(baiRaw).trim();
  const digitMatch = str.match(/\d+/);
  if (digitMatch) {
    return parseInt(digitMatch[0], 10);
  }
  for (const [key, val] of cnList) {
    if (str.includes(key)) {
      return val;
    }
  }
  return lastLessonId || 1;
}

const parsedWords = [];
let lastLessonId = 1;
let lastLessonTitle = '';

// Skip header row
rows.slice(1).forEach((r, idx) => {
  const baiRaw = (r[0] || '').toString().trim();
  const titleRaw = (r[1] || '').toString().trim();
  const word = (r[2] || '').toString().trim();

  if (!word) return; // Skip empty rows

  if (baiRaw) {
    lastLessonId = parseLessonId(baiRaw, lastLessonId);
  }
  if (titleRaw) {
    lastLessonTitle = titleRaw;
  }

  let formattedLessonTitle = lastLessonTitle || `Bài ${lastLessonId}`;
  if (!formattedLessonTitle.toLowerCase().startsWith('bài')) {
    formattedLessonTitle = `Bài ${lastLessonId}: ${formattedLessonTitle}`;
  }

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
    level: 1,
    curriculum: 'hsk',
    hskVersion: '3.0',
    volume: null,
    lessonId: lastLessonId,
    lessonTitle: formattedLessonTitle,
    lessonDesc: `Toàn bộ từ vựng ${formattedLessonTitle} chuẩn HSK 1 (v3.0)`,
    category,
    example_zh,
    example_vi,
    question,
    answer,
    note
  });
});

console.log(`Parsed ${parsedWords.length} vocabulary items from Excel.`);

// Read existing database.json
let db = [];
if (fs.existsSync(dbPath)) {
  db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  console.log(`Existing database contains ${db.length} total items.`);
}

// Separate HSK 1 (v3.0) items and non-HSK1 items
const existingHsk1Map = new Map();
db.forEach(w => {
  if (w.level === 1 && (w.hskVersion === '3.0' || !w.hskVersion) && !w.isCustom) {
    existingHsk1Map.set(`${w.word}_${w.lessonId || 1}`, w);
  }
});

let updatedCount = 0;
let newCount = 0;

// Update or create items
const finalHsk1Items = parsedWords.map((pw, index) => {
  const key = `${pw.word}_${pw.lessonId}`;
  const existing = existingHsk1Map.get(key) || Array.from(existingHsk1Map.values()).find(e => e.word === pw.word);

  if (existing) {
    updatedCount++;
    return Object.assign({}, existing, {
      pinyin: pw.pinyin || existing.pinyin,
      meaning: pw.meaning || existing.meaning,
      category: pw.category || existing.category,
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

console.log(`Updated ${updatedCount} existing HSK 1 items, added ${newCount} new items.`);

// Re-assemble database: non-HSK1 items + updated HSK 1 items
const nonHsk1Items = db.filter(w => !(w.level === 1 && (w.hskVersion === '3.0' || !w.hskVersion) && !w.isCustom));

const updatedDb = [...nonHsk1Items, ...finalHsk1Items];

fs.writeFileSync(dbPath, JSON.stringify(updatedDb, null, 2), 'utf8');
console.log(`Successfully saved ${updatedDb.length} items to database.json!`);
