const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const rootDir = path.join(__dirname, '../..');
const excelPath = path.join(rootDir, 'filetuvung/Từ vựng HSK 5 2.0.xlsx');
const dbPath = path.join(rootDir, 'backend/database.json');
const backupPath = path.join(rootDir, 'backend/database.json.bak_pre_hsk5');

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
console.log('✅ Backed up database.json to database.json.bak_pre_hsk5');

const db = JSON.parse(rawDb);
console.log(`Current total items in database.json: ${db.length}`);

// Existing HSK 5 words map to preserve IDs and learning progress
const existingHsk5Map = new Map();
db.forEach(w => {
  if (w.level === 5 && (w.hskVersion === '2.0' || !w.hskVersion) && !w.isCustom) {
    existingHsk5Map.set(w.word.trim(), w);
  }
});
console.log(`Found ${existingHsk5Map.size} existing HSK 5 (v2.0) words in database.`);

// 2. Read and parse Excel file
const wb = xlsx.readFile(excelPath);
const parsedWords = [];
let nextNewId = 520000;

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

    const word = (r[2] || '').toString().trim();
    if (!word) continue;

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

    const existing = existingHsk5Map.get(word);
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
      level: 5,
      curriculum: 'hsk',
      hskVersion: '2.0',
      volume,
      lessonId: currentBai,
      lessonTitle: formattedLessonTitle,
      lessonDesc: `Toàn bộ từ vựng ${formattedLessonTitle} chuẩn HSK 5 (v2.0)`,
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

console.log(`\nTotal parsed HSK 5 words from both sheets: ${parsedWords.length}`);

// 3. Filter out old HSK 5 (v2.0) words and combine with new ones
const nonHsk5Words = db.filter(w => !(w.level === 5 && (w.hskVersion === '2.0' || !w.hskVersion) && !w.isCustom));
console.log(`Non-HSK5 words count in database: ${nonHsk5Words.length}`);

const updatedDb = [...parsedWords, ...nonHsk5Words];
console.log(`New total database count: ${updatedDb.length}`);

// 4. Save to database.json
fs.writeFileSync(dbPath, JSON.stringify(updatedDb, null, 2), 'utf8');
console.log('✅ Successfully wrote updated database to backend/database.json!');

// 5. Verification summary
const hsk5Summary = {
  total: parsedWords.length,
  thuong: parsedWords.filter(w => w.volume === 'thuong').length,
  ha: parsedWords.filter(w => w.volume === 'ha').length,
  lessons: new Set(parsedWords.map(w => w.lessonTitle)).size
};
console.log('\n=== HSK 5 (v2.0) Import Summary ===');
console.log(hsk5Summary);
