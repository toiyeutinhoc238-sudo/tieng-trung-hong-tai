const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const rootDir = path.join(__dirname, '../..');
const excelPath = path.join(rootDir, 'filetuvung/Từ vựng HSK 6 2.0.xlsx');
const dbPath = path.join(rootDir, 'backend/database.json');
const backupPath = path.join(rootDir, 'backend/database.json.bak_pre_hsk6');

if (!fs.existsSync(excelPath)) {
  console.error('Excel file not found:', excelPath);
  process.exit(1);
}

if (!fs.existsSync(dbPath)) {
  console.error('database.json not found:', dbPath);
  process.exit(1);
}

// 1. Create a backup of database.json
const rawDb = fs.readFileSync(dbPath, 'utf8');
fs.writeFileSync(backupPath, rawDb, 'utf8');
console.log('✅ Backed up database.json to backend/database.json.bak_pre_hsk6');

const db = JSON.parse(rawDb);
console.log(`Current total items in database.json: ${db.length}`);

// Existing HSK 6 words map to preserve IDs and learning progress
const existingHsk6Map = new Map();
db.forEach(w => {
  if (w.level === 6 && (w.hskVersion === '2.0' || !w.hskVersion) && !w.isCustom) {
    const cleanKey = w.word ? w.word.replace(/^\*+/, '').trim() : '';
    if (cleanKey) {
      existingHsk6Map.set(cleanKey, w);
    }
  }
});
console.log(`Found ${existingHsk6Map.size} existing HSK 6 (v2.0) words in database.`);

// 2. Read and parse Excel file
const wb = xlsx.readFile(excelPath);
const parsedWords = [];
let nextNewId = 620000;

wb.SheetNames.forEach(sheetName => {
  const ws = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1 });
  const isQuyen1 = sheetName.includes('1') || sheetName.toLowerCase().includes('thuong');
  const volume = isQuyen1 ? 'thuong' : 'ha';
  const volumeName = isQuyen1 ? 'Quyển 1 (Thượng)' : 'Quyển 2 (Hạ)';

  console.log(`\n--- Parsing Sheet: ${sheetName} (${volumeName}) ---`);

  let currentBai = null;
  let currentTitle = null;
  let sheetWordCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;

    if (r[0] !== undefined && r[0] !== null && String(r[0]).trim() !== '') {
      const match = String(r[0]).match(/\d+/);
      if (match) {
        currentBai = parseInt(match[0], 10);
      }
    }

    if (r[1] !== undefined && r[1] !== null && String(r[1]).trim() !== '') {
      currentTitle = String(r[1]).trim();
    }

    const rawWord = (r[2] || '').toString().trim();
    if (!rawWord) continue;
    const word = rawWord.replace(/^\*+/, '').trim();

    const pinyin = (r[3] || '').toString().trim();
    const category = (r[4] || '').toString().trim() || 'Từ vựng';
    const meaning = (r[5] || '').toString().trim();
    const note = (r[6] || '').toString().trim();
    const example_zh = (r[7] || '').toString().trim();
    const example_vi = (r[8] || '').toString().trim();
    const question = (r[9] || '').toString().trim();
    const answer = (r[10] || '').toString().trim();

    let cleanTitle = currentTitle || '';
    cleanTitle = cleanTitle.replace(/^Bài\s*\d+\s*[:：\-–]?\s*/i, '').trim();
    const formattedLessonTitle = `Bài ${currentBai}: ${cleanTitle}`;

    const existing = existingHsk6Map.get(word);
    let wordId;
    let isMemorized = false;
    let isStarred = false;
    let isWrong = false;
    let isStudied = false;

    if (existing) {
      wordId = existing.id;
      isMemorized = !!existing.isMemorized;
      isStarred = !!existing.isStarred;
      isWrong = !!existing.isWrong;
      isStudied = !!existing.isStudied;
    } else {
      wordId = nextNewId++;
    }

    parsedWords.push({
      id: wordId,
      word,
      pinyin,
      meaning,
      level: 6,
      curriculum: 'hsk',
      hskVersion: '2.0',
      volume,
      lessonId: currentBai,
      lessonTitle: formattedLessonTitle,
      lessonDesc: `Toàn bộ từ vựng ${formattedLessonTitle} chuẩn HSK 6 (v2.0)`,
      category,
      example_zh,
      example_vi,
      question,
      answer,
      note,
      isMemorized,
      isStarred,
      isWrong,
      isStudied,
      isCustom: false
    });

    sheetWordCount++;
  }

  console.log(`Parsed ${sheetWordCount} words from ${sheetName}`);
});

console.log(`\nTotal parsed HSK 6 words from both sheets: ${parsedWords.length}`);

// 3. Filter out old HSK 6 (v2.0) words and combine with new ones
const nonHsk6Words = db.filter(w => !(w.level === 6 && (w.hskVersion === '2.0' || !w.hskVersion) && !w.isCustom));
console.log(`Non-HSK6 words count in database: ${nonHsk6Words.length}`);

const updatedDb = [...parsedWords, ...nonHsk6Words];
console.log(`New total database count: ${updatedDb.length}`);

// 4. Save to database.json
fs.writeFileSync(dbPath, JSON.stringify(updatedDb, null, 2), 'utf8');
console.log('✅ Successfully wrote updated database to backend/database.json!');

// 5. Verification summary
const hsk6Summary = {
  total: parsedWords.length,
  thuong: parsedWords.filter(w => w.volume === 'thuong').length,
  ha: parsedWords.filter(w => w.volume === 'ha').length,
  lessons: new Set(parsedWords.map(w => w.lessonTitle)).size,
  withExamples: parsedWords.filter(w => w.example_zh && w.example_zh.length > 0).length,
  withExercises: parsedWords.filter(w => w.question && w.question.length > 0).length
};
console.log('\n=== HSK 6 (v2.0) Import Summary ===');
console.log(hsk6Summary);
