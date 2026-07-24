import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hsk6ExtractedPath = path.join(__dirname, '..', 'hsk6_extracted.json');
const dbPath = path.join(__dirname, '..', 'database.json');

if (!fs.existsSync(hsk6ExtractedPath)) {
  console.error('ERROR: hsk6_extracted.json does not exist yet!');
  process.exit(1);
}

const extracted = JSON.parse(fs.readFileSync(hsk6ExtractedPath, 'utf8'));
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const thuongWords = extracted.thuong || [];
const haWords = extracted.ha || [];

console.log(`Loaded ${thuongWords.length} HSK 6 Thượng words and ${haWords.length} HSK 6 Hạ words from extraction output.`);

const processedWords = [];

// Process Thượng (20 lessons)
const thuongPerLesson = Math.ceil(thuongWords.length / 20) || 1;
thuongWords.forEach((w, idx) => {
  if (!w || !w.word || !w.word.trim() || !w.meaning || !w.meaning.trim()) return;

  let lessonNum = Math.floor(idx / thuongPerLesson) + 1;
  if (lessonNum > 20) lessonNum = 20;

  processedWords.push({
    id: `hsk6_v2_thuong_${idx + 1}`,
    word: w.word.trim(),
    pinyin: w.pinyin ? w.pinyin.trim() : '',
    category: w.category || 'từ vựng',
    meaning: w.meaning.trim(),
    example: w.example || '',
    exampleMeaning: w.exampleMeaning || '',
    curriculum: 'hsk',
    hskVersion: '2.0',
    level: 6,
    volume: 'thuong',
    lessonId: lessonNum,
    lessonTitle: `HSK 6 Thượng (v2.0) - Bài ${lessonNum}`,
    lessonDesc: `Từ vựng HSK 6 Thượng (v2.0) Bài ${lessonNum}`
  });
});

// Process Hạ (20 lessons, lessonId 21..40)
const haPerLesson = Math.ceil(haWords.length / 20) || 1;
haWords.forEach((w, idx) => {
  if (!w || !w.word || !w.word.trim() || !w.meaning || !w.meaning.trim()) return;

  let lessonNum = Math.floor(idx / haPerLesson) + 21;
  if (lessonNum > 40) lessonNum = 40;
  const volLesson = lessonNum - 20;

  processedWords.push({
    id: `hsk6_v2_ha_${idx + 1}`,
    word: w.word.trim(),
    pinyin: w.pinyin ? w.pinyin.trim() : '',
    category: w.category || 'từ vựng',
    meaning: w.meaning.trim(),
    example: w.example || '',
    exampleMeaning: w.exampleMeaning || '',
    curriculum: 'hsk',
    hskVersion: '2.0',
    level: 6,
    volume: 'ha',
    lessonId: lessonNum,
    lessonTitle: `HSK 6 Hạ (v2.0) - Bài ${volLesson}`,
    lessonDesc: `Từ vựng HSK 6 Hạ (v2.0) Bài ${volLesson}`
  });
});

// Remove existing HSK 6 (v2.0) items from DB
const cleanDb = db.filter(w => !(w.hskVersion === '2.0' && w.level === 6));

console.log(`Cleaned existing DB. Old count: ${db.length}, Base count: ${cleanDb.length}`);

const updatedDb = cleanDb.concat(processedWords);

fs.writeFileSync(dbPath, JSON.stringify(updatedDb, null, 2), 'utf8');

console.log(`\nSuccessfully merged HSK 6 (v2.0) into database.json!`);
console.log(`New total vocabulary items in database.json: ${updatedDb.length}`);
