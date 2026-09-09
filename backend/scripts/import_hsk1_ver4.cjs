const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const rootDir = path.resolve(__dirname, '../..');
const filetuvungDir = path.join(rootDir, 'filetuvung');
const dbPath = path.join(rootDir, 'backend/database.json');
const backupPath = path.join(rootDir, `backend/database.json.bak_${Date.now()}`);

console.log('=== IMPORT HSK 1 VER4 TO DATABASE.JSON ===');

if (!fs.existsSync(dbPath)) {
  console.error('Database file not found at:', dbPath);
  process.exit(1);
}

// 1. Load existing database.json
const rawDb = fs.readFileSync(dbPath, 'utf8');
const db = JSON.parse(rawDb);
console.log(`Current database contains ${db.length} items.`);

// Backup database
fs.writeFileSync(backupPath, rawDb, 'utf8');
console.log(`Backup created at: ${backupPath}`);

// Map of existing items
const existing20 = db.filter(w => w.level === 1 && w.hskVersion === '2.0' && !w.isCustom);
const existing30 = db.filter(w => (w.level === 1 || w.level === '1') && (w.hskVersion === '3.0' || !w.hskVersion) && !w.isCustom);
const otherItems = db.filter(w => !(w.level === 1 || w.level === '1' || w.hskVersion === '2.0' || w.hskVersion === '3.0') || w.isCustom);

console.log(`Existing HSK 1 (2.0): ${existing20.length}`);
console.log(`Existing HSK 1 (3.0): ${existing30.length}`);
console.log(`Other items (preserved): ${otherItems.length}`);

// Helper to clean pinyin
function cleanPinyinText(text) {
  if (!text) return '';
  const parts = String(text).split(/[|/\\;]/);
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

// =========================================================================
// PART A: IMPORT HSK 1 (2.0) NEW VER4
// =========================================================================
const file20 = path.join(filetuvungDir, 'TV HSK 1 2.0 NEW VER4.xlsx');
if (!fs.existsSync(file20)) {
  console.error('File not found:', file20);
  process.exit(1);
}

const wb20 = xlsx.readFile(file20);
const rows20 = xlsx.utils.sheet_to_json(wb20.Sheets[wb20.SheetNames[0]], { header: 1 });

let curLId20 = 0;
let curTitle20 = '';
const parsed20 = [];

for (let i = 1; i < rows20.length; i++) {
  const r = rows20[i];
  if (!r || !r[2]) continue;

  const titleRaw = r[1];
  const word = String(r[2]).trim();
  if (!word) continue;

  if (titleRaw !== undefined && titleRaw !== null && String(titleRaw).trim() !== '') {
    curLId20++;
    curTitle20 = String(titleRaw).trim();
  }

  let cleanTitle = curTitle20.replace(/^Bài\s*\d+\s*[:：\-–]?\s*/i, '').trim();
  const formattedLessonTitle = `Bài ${curLId20}: ${cleanTitle}`;
  const formattedLessonDesc = `Toàn bộ từ vựng ${formattedLessonTitle} chuẩn HSK 1 (v2.0)`;

  const pinyin = cleanPinyinText((r[3] || '').toString().trim());
  const category = (r[4] || '').toString().trim() || 'Từ vựng';
  const meaning = (r[5] || '').toString().trim();
  const note = (r[6] || '').toString().trim();
  const example_zh = (r[7] || '').toString().trim();
  const example_vi = (r[8] || '').toString().trim();
  const question = (r[9] || '').toString().trim();
  const answer = (r[10] || '').toString().trim();

  parsed20.push({
    word,
    pinyin,
    meaning,
    level: 1,
    curriculum: 'hsk',
    hskVersion: '2.0',
    volume: null,
    lessonId: curLId20,
    lessonTitle: formattedLessonTitle,
    lessonDesc: formattedLessonDesc,
    category,
    example_zh,
    example_vi,
    question,
    answer,
    note
  });
}

console.log(`\nParsed ${parsed20.length} words across ${curLId20} lessons from HSK 1 2.0 VER4.`);

// Match with existing 2.0
// Build a pool of existing 2.0 items
const pool20 = [...existing20];
let updatedCount20 = 0;
let newCount20 = 0;

const finalHsk1_20 = parsed20.map((pw, idx) => {
  // Try to find matching item by word + lessonId (+ category if duplicate)
  let foundIdx = pool20.findIndex(e => e.word === pw.word && e.lessonId === pw.lessonId && e.category === pw.category);
  if (foundIdx === -1) {
    foundIdx = pool20.findIndex(e => e.word === pw.word && e.lessonId === pw.lessonId);
  }
  if (foundIdx === -1) {
    foundIdx = pool20.findIndex(e => e.word === pw.word);
  }

  let existing = null;
  if (foundIdx !== -1) {
    existing = pool20[foundIdx];
    pool20.splice(foundIdx, 1); // remove from pool so duplicates don't collide
  }

  if (existing) {
    updatedCount20++;
    return Object.assign({}, existing, {
      pinyin: pw.pinyin || existing.pinyin,
      meaning: pw.meaning || existing.meaning,
      category: pw.category || existing.category,
      level: 1,
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
    newCount20++;
    return Object.assign({}, pw, {
      id: 200000 + idx + 1,
      isMemorized: false,
      isStarred: false,
      isCustom: false
    });
  }
});

console.log(`HSK 1 (2.0): ${updatedCount20} updated, ${newCount20} new.`);

// =========================================================================
// PART B: IMPORT HSK 1 (3.0) NEW VER4
// =========================================================================
const file30Candidates = [
  path.join(filetuvungDir, 'Từ vựng HSK 1 3.0 VER4.xlsx'),
  path.join(filetuvungDir, 'Từ vựng HSK 1 3.0 NEW VER4.xlsx')
];
const file30 = file30Candidates.find(f => fs.existsSync(f));
if (!file30) {
  console.error('File not found in candidates:', file30Candidates);
  process.exit(1);
}
console.log('Reading HSK 1 (3.0) from:', file30);

const wb30 = xlsx.readFile(file30);
const rows30 = xlsx.utils.sheet_to_json(wb30.Sheets[wb30.SheetNames[0]], { header: 1 });

const cnList = [
  ['十五', 15], ['十四', 14], ['十三', 13], ['十二', 12], ['十一', 11],
  ['十', 10], ['九', 9], ['八', 8], ['七', 7], ['六', 6], ['五', 5], ['四', 4], ['三', 3], ['二', 2], ['一', 1]
];

function parseLessonId30(b, last) {
  if (!b) return last || 1;
  const s = String(b).trim();
  const d = s.match(/\d+/);
  if (d) return parseInt(d[0], 10);
  for (const [k, v] of cnList) {
    if (s.includes(k)) return v;
  }
  return last || 1;
}

let lastL30 = 1;
let lastTitle30 = '';
const parsed30 = [];

for (let i = 1; i < rows30.length; i++) {
  const r = rows30[i];
  if (!r || !r[2]) continue;

  const baiRaw = r[0];
  const titleRaw = r[1];
  const word = String(r[2]).trim();
  if (!word) continue;

  if (baiRaw) lastL30 = parseLessonId30(baiRaw, lastL30);
  if (titleRaw) lastTitle30 = String(titleRaw).trim();

  let cleanTitle = lastTitle30.replace(/^Bài\s*\d+\s*[:：\-–]?\s*/i, '').trim();
  const formattedLessonTitle = `Bài ${lastL30}: ${cleanTitle}`;
  const formattedLessonDesc = `Toàn bộ từ vựng ${formattedLessonTitle} chuẩn HSK 1 (v3.0)`;

  const pinyin = cleanPinyinText((r[3] || '').toString().trim());
  let category = (r[4] || '').toString().trim();
  let meaning = (r[5] || '').toString().trim();
  const note = (r[6] || '').toString().trim();
  const example_zh = (r[7] || '').toString().trim();
  const example_vi = (r[8] || '').toString().trim();
  const question = (r[9] || '').toString().trim();
  const answer = (r[10] || '').toString().trim();

  // Special fallback for empty meaning (e.g. 的)
  if (!meaning) {
    if (word === '的') meaning = 'của (trợ từ sở hữu)';
    else meaning = 'Từ vựng ' + word;
  }

  // Fallback for empty category
  if (!category) {
    if (word === '你好') category = 'Chào hỏi';
    else if (word === '做饭') category = 'Động từ';
    else category = 'Từ vựng';
  }

  parsed30.push({
    word,
    pinyin,
    meaning,
    level: 1,
    curriculum: 'hsk',
    hskVersion: '3.0',
    volume: null,
    lessonId: lastL30,
    lessonTitle: formattedLessonTitle,
    lessonDesc: formattedLessonDesc,
    category,
    example_zh,
    example_vi,
    question,
    answer,
    note
  });
}

console.log(`\nParsed ${parsed30.length} words across lessons from HSK 1 3.0 VER4.`);

// Match with existing 3.0
const pool30 = [...existing30];
let updatedCount30 = 0;
let newCount30 = 0;

const finalHsk1_30 = parsed30.map((pw, idx) => {
  let foundIdx = pool30.findIndex(e => e.word === pw.word && e.lessonId === pw.lessonId);
  if (foundIdx === -1) {
    foundIdx = pool30.findIndex(e => e.word === pw.word);
  }

  let existing = null;
  if (foundIdx !== -1) {
    existing = pool30[foundIdx];
    pool30.splice(foundIdx, 1);
  }

  if (existing) {
    updatedCount30++;
    return Object.assign({}, existing, {
      pinyin: pw.pinyin || existing.pinyin,
      meaning: pw.meaning || existing.meaning,
      category: pw.category || existing.category,
      level: 1,
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
    newCount30++;
    return Object.assign({}, pw, {
      id: 300000 + idx + 1,
      isMemorized: false,
      isStarred: false,
      isCustom: false
    });
  }
});

console.log(`HSK 1 (3.0): ${updatedCount30} updated, ${newCount30} new.`);

// =========================================================================
// PART C: ASSEMBLE NEW DATABASE AND WRITE
// =========================================================================
// Filter out old HSK 1 built-in words from db and append updated items
const nonHsk1Db = db.filter(w => {
  const isHsk1_20 = w.level === 1 && w.hskVersion === '2.0' && !w.isCustom;
  const isHsk1_30 = (w.level === 1 || w.level === '1') && (w.hskVersion === '3.0' || !w.hskVersion) && !w.isCustom;
  return !isHsk1_20 && !isHsk1_30;
});

const newDb = [...finalHsk1_20, ...finalHsk1_30, ...nonHsk1Db];
console.log(`\nNew total database count: ${newDb.length} (original: ${db.length})`);

// Sanity check
let badWords = 0;
newDb.forEach(w => {
  if (!w.word || !w.word.trim() || !w.meaning || !w.meaning.trim() || !w.pinyin || !w.pinyin.trim()) {
    badWords++;
    console.warn('Incomplete word:', w);
  }
});
if (badWords > 0) {
  console.error(`WARNING: Found ${badWords} incomplete words! Aborting write.`);
  process.exit(1);
}

fs.writeFileSync(dbPath, JSON.stringify(newDb, null, 2), 'utf8');
console.log('✅ Successfully wrote updated vocabulary to backend/database.json!');
