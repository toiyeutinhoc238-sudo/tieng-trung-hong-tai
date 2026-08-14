const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const excelPath = path.join(__dirname, '../../filetuvung/Từ vựng HSK 3 3.0 new.xlsx');
const dbPath = path.join(__dirname, '../database.json');

if (!fs.existsSync(excelPath)) {
  console.error('File not found:', excelPath);
  process.exit(1);
}

const wb = xlsx.readFile(excelPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log(`Read ${rows.length} rows from Excel file: ${path.basename(excelPath)}`);

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

  if (titleRaw !== undefined && titleRaw !== null && String(titleRaw).trim() !== '') {
    currentLessonId++;
    currentLessonTitle = String(titleRaw).trim();
  }

  // Format lesson title: ensure it has standard format "Bài X: <Title>"
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
    level: 3,
    curriculum: 'hsk',
    hskVersion: '3.0',
    volume: null,
    lessonId: currentLessonId,
    lessonTitle: formattedLessonTitle,
    lessonDesc: `Toàn bộ từ vựng ${formattedLessonTitle} chuẩn HSK 3 (v3.0)`,
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

// Map existing HSK 3 (v3.0) items
const existingHsk3Map = new Map();
db.forEach(w => {
  if (w.level === 3 && (w.hskVersion === '3.0' || !w.hskVersion) && !w.isCustom) {
    existingHsk3Map.set(w.word.trim(), w);
  }
});

let updatedCount = 0;
let newCount = 0;

const finalHsk3Items = parsedWords.map((pw, index) => {
  const existing = existingHsk3Map.get(pw.word);
  if (existing) {
    updatedCount++;
    return Object.assign({}, existing, {
      pinyin: pw.pinyin || existing.pinyin,
      meaning: pw.meaning || existing.meaning,
      category: pw.category || existing.category,
      level: 3,
      curriculum: 'hsk',
      hskVersion: '3.0',
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
      id: 40000 + index + 1,
      isMemorized: false,
      isStarred: false,
      isCustom: false
    });
  }
});

console.log(`Updated ${updatedCount} existing HSK 3 (3.0) items, added ${newCount} new items.`);

// Re-assemble database: non-HSK3 3.0 items + updated HSK 3 3.0 items
const nonHsk3Items = db.filter(w => !(w.level === 3 && (w.hskVersion === '3.0' || !w.hskVersion) && !w.isCustom));
const updatedDb = [...nonHsk3Items, ...finalHsk3Items];

fs.writeFileSync(dbPath, JSON.stringify(updatedDb, null, 2), 'utf8');
console.log(`Successfully saved ${updatedDb.length} items to database.json!`);
