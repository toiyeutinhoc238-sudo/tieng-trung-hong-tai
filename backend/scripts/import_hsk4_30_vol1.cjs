const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const excelPath = path.join(__dirname, '../../filetuvung/Từ vựng HSK 4 3.0 quyển 1.xlsx');
const dbPath = path.join(__dirname, '../database.json');
const backupPath = path.join(__dirname, '../database.backup_before_hsk4_30.json');
const archivePath = path.join(__dirname, '../../scratch/archived_hsk4_30_draft_words.json');

if (!fs.existsSync(excelPath)) {
  console.error('File not found:', excelPath);
  process.exit(1);
}

// 1. Read Excel file
const wb = xlsx.readFile(excelPath);
const sheetName = wb.SheetNames[0];
const ws = wb.Sheets[sheetName];
const rawRows = xlsx.utils.sheet_to_json(ws, { defval: '' });

console.log(`=== IMPORTING HSK 4 3.0 QUYỂN 1 ===`);
console.log(`Excel file: ${excelPath}`);
console.log(`Sheet name: ${sheetName}`);
console.log(`Total rows in Excel: ${rawRows.length}`);

let currentLessonId = 0;
let currentLessonTitle = '';
const parsedWords = [];

for (let i = 0; i < rawRows.length; i++) {
  const r = rawRows[i];
  if (!r) continue;

  const baiRaw = r['Bài'];
  const titleRaw = r['tên bài'];
  const word = String(r['Từ vựng'] || '').trim();

  if (!word) {
    console.warn(`Row ${i + 2} has empty word, skipping.`);
    continue;
  }

  if (baiRaw !== '' && baiRaw !== undefined && baiRaw !== null) {
    const num = parseInt(baiRaw, 10);
    if (!isNaN(num)) {
      currentLessonId = num;
    }
  }

  if (titleRaw !== '' && titleRaw !== undefined && titleRaw !== null) {
    currentLessonTitle = String(titleRaw).trim();
  }

  let cleanTitle = currentLessonTitle;
  cleanTitle = cleanTitle.replace(/^Bài\s*\d+\s*[:：\-–]?\s*/i, '').trim();
  const formattedLessonTitle = `Bài ${currentLessonId}: ${cleanTitle}`;

  const pinyin = String(r['Pinyin'] || '').trim();
  const category = String(r['Từ loại'] || '').trim() || 'Từ vựng';
  const meaning = String(r['Nghĩa'] || '').trim();
  const note = String(r['Chú ý'] || '').trim();
  const example_zh = String(r['Ví dụ'] || '').trim();
  const example_vi = String(r['Nghĩa ví dụ '] !== undefined ? r['Nghĩa ví dụ '] : (r['Nghĩa ví dụ'] || '')).trim();
  const question = String(r['Bài tập Dịch'] || '').trim();
  const answer = String(r['Gợi ý'] || '').trim();

  parsedWords.push({
    word,
    pinyin,
    meaning,
    category,
    level: 4,
    curriculum: 'hsk',
    hskVersion: '3.0',
    volume: 1,
    lessonId: currentLessonId,
    lessonTitle: formattedLessonTitle,
    lessonDesc: `Toàn bộ từ vựng ${formattedLessonTitle} chuẩn HSK 4 Quyển 1 (v3.0)`,
    note,
    example_zh,
    example_vi,
    question,
    answer
  });
}

console.log(`Successfully parsed ${parsedWords.length} vocabulary items across lessons.`);

// Lesson breakdown check
const lessonSummary = {};
parsedWords.forEach(w => {
  lessonSummary[w.lessonTitle] = (lessonSummary[w.lessonTitle] || 0) + 1;
});
console.log('\nLessons Breakdown:');
Object.entries(lessonSummary).forEach(([title, count]) => {
  console.log(`  - ${title}: ${count} từ`);
});

// 2. Read database.json
if (!fs.existsSync(dbPath)) {
  console.error('database.json not found at:', dbPath);
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
console.log(`\nExisting database has ${db.length} total items.`);

// Backup current database
fs.writeFileSync(backupPath, JSON.stringify(db, null, 2), 'utf8');
console.log(`Backup created at: ${backupPath}`);

// Archive old HSK 4 3.0 draft items
const oldHsk4_30 = db.filter(w => (w.level === 4 || w.level === '4') && w.hskVersion === '3.0' && !w.isCustom);
fs.writeFileSync(archivePath, JSON.stringify(oldHsk4_30, null, 2), 'utf8');
console.log(`Archived ${oldHsk4_30.length} previous HSK 4 3.0 draft items to: ${archivePath}`);

// 3. Assign sequential IDs starting at 2528 (standard HSK 4 block)
let startId = 2528;
const finalHsk4Items = parsedWords.map((pw, index) => {
  return Object.assign({}, pw, {
    id: startId + index,
    isMemorized: false,
    isStarred: false,
    isCustom: false
  });
});

console.log(`Assigned IDs from ${finalHsk4Items[0].id} to ${finalHsk4Items[finalHsk4Items.length - 1].id}.`);

// 4. Re-assemble database: replace in-place where old HSK 4 3.0 was (index 5057)
const firstIdx = db.findIndex(w => (w.level === 4 || w.level === '4') && w.hskVersion === '3.0' && !w.isCustom);
let updatedDb;
if (firstIdx !== -1) {
  const before = db.slice(0, firstIdx);
  const after = db.filter((w, idx) => idx > firstIdx && !((w.level === 4 || w.level === '4') && w.hskVersion === '3.0' && !w.isCustom));
  updatedDb = [...before, ...finalHsk4Items, ...after];
} else {
  const nonHsk4_30 = db.filter(w => !((w.level === 4 || w.level === '4') && w.hskVersion === '3.0' && !w.isCustom));
  updatedDb = [...nonHsk4_30, ...finalHsk4Items];
}
console.log(`Updated database will have ${updatedDb.length} total items.`);

// 5. Save to database.json
fs.writeFileSync(dbPath, JSON.stringify(updatedDb, null, 2), 'utf8');
console.log(`\nSUCCESS: Saved ${updatedDb.length} items to ${dbPath}!`);
