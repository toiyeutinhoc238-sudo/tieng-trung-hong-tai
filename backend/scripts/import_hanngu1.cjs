const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const excelPath = path.resolve('filetuvung/TV Hán ngữ 1.xlsx');
if (!fs.existsSync(excelPath)) {
  console.error('File not found:', excelPath);
  process.exit(1);
}

const wb = XLSX.readFile(excelPath);
const sheetName = wb.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });

console.log('Read', rows.length, 'rows from', excelPath);

const words = [];
let currentLessonId = 1;
let currentLessonTitle = '';

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || r.length === 0) continue;

  if (r[0] !== undefined && r[0] !== null && String(r[0]).trim() !== '') {
    const parsedId = parseInt(String(r[0]).trim());
    if (!isNaN(parsedId)) {
      currentLessonId = parsedId;
    }
  }

  if (r[1] !== undefined && r[1] !== null && String(r[1]).trim() !== '') {
    currentLessonTitle = String(r[1]).trim();
  }

  const word = r[2] !== undefined && r[2] !== null ? String(r[2]).trim() : '';
  if (!word) continue;

  const pinyin = r[3] !== undefined && r[3] !== null ? String(r[3]).trim() : '';
  const category = r[4] !== undefined && r[4] !== null ? String(r[4]).trim() : 'Từ vựng';
  const meaning = r[5] !== undefined && r[5] !== null ? String(r[5]).trim() : '';
  const note = r[6] !== undefined && r[6] !== null ? String(r[6]).trim() : '';
  const example_zh = r[7] !== undefined && r[7] !== null ? String(r[7]).trim() : '';
  const example_vi = r[8] !== undefined && r[8] !== null ? String(r[8]).trim() : '';
  const question = r[9] !== undefined && r[9] !== null ? String(r[9]).trim() : '';
  const answer = r[10] !== undefined && r[10] !== null ? String(r[10]).trim() : '';

  const id = 700000 + words.length + 1;

  const wordObj = {
    id,
    word,
    pinyin,
    meaning,
    level: 1,
    curriculum: 'hanngu',
    hskVersion: 'hanngu',
    volume: 1,
    lessonId: currentLessonId,
    lessonTitle: `Bài ${currentLessonId}: ${currentLessonTitle}`,
    lessonDesc: `Toàn bộ từ vựng Bài ${currentLessonId}: ${currentLessonTitle} - Giáo trình Hán ngữ Quyển 1`,
    category,
    example_zh,
    example_vi,
    question,
    answer,
    note,
    isMemorized: false,
    isStarred: false,
    isCustom: false,
    isWrong: false,
    isStudied: false
  };

  words.push(wordObj);
}

console.log(`Parsed ${words.length} vocabulary words for Hán ngữ Quyển 1 across 15 lessons.`);

// Read and update backend/database.json
const dbPath = path.resolve('backend/database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Filter out old hanngu 1 words if already present
const filteredDb = db.filter(w => !(w.curriculum === 'hanngu' && w.volume === 1));
const newDb = [...filteredDb, ...words];

fs.writeFileSync(dbPath, JSON.stringify(newDb, null, 2), 'utf8');
console.log(`Updated ${dbPath}: Total words now = ${newDb.length} (added ${words.length} Hán ngữ 1 words).`);

// Group by lesson for verification
const lessonsSummary = {};
words.forEach(w => {
  if (!lessonsSummary[w.lessonId]) {
    lessonsSummary[w.lessonId] = { title: w.lessonTitle, count: 0 };
  }
  lessonsSummary[w.lessonId].count++;
});

console.log('Lessons breakdown:');
Object.keys(lessonsSummary).forEach(id => {
  console.log(`- Lesson ${id}: ${lessonsSummary[id].title} (${lessonsSummary[id].count} words)`);
});
