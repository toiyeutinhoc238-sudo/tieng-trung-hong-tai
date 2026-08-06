import fs from 'fs';
import path from 'path';

function replaceHsk130() {
  const extractedPath = path.resolve('../scratch/hsk1_30_docx_extracted.json');
  const dbPath = path.resolve('database.json');

  if (!fs.existsSync(extractedPath)) {
    console.error('Extracted JSON file not found at:', extractedPath);
    return;
  }

  const { words: docxWords, exercises } = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  console.log('Current DB total items:', db.length);

  // Filter out existing HSK 1 (v3.0) entries
  const remainingDb = db.filter(w => !((w.hskVersion === '3.0' || w.version === '3.0') && String(w.level) === '1'));
  console.log('DB items after removing old HSK 1 (v3.0):', remainingDb.length);

  // Find max ID in remaining DB
  let maxId = 0;
  remainingDb.forEach(w => {
    const numId = parseInt(w.id, 10);
    if (!isNaN(numId) && numId > maxId) maxId = numId;
  });

  // Assign clean IDs to docxWords
  const newHsk130Words = docxWords.map((w, idx) => {
    maxId++;
    return {
      id: maxId,
      word: w.word,
      pinyin: w.pinyin,
      meaning: w.meaning,
      level: 1,
      curriculum: 'hsk',
      hskVersion: '3.0',
      volume: null,
      lessonId: w.lessonId,
      lessonTitle: w.lessonTitle,
      lessonDesc: `Toàn bộ từ vựng ${w.lessonTitle} chuẩn HSK 1 (v3.0)`,
      category: w.category || 'Từ vựng',
      example_zh: w.example_zh || w.answer || '',
      example_vi: w.example_vi || w.question || w.meaning || '',
      question: w.question || '',
      answer: w.answer || '',
      note: w.note || '',
      isMemorized: false,
      isStarred: false,
      isCustom: false
    };
  });

  const updatedDb = [...remainingDb, ...newHsk130Words];
  console.log('Updated DB total items:', updatedDb.length);

  fs.writeFileSync(dbPath, JSON.stringify(updatedDb, null, 2));
  console.log('Successfully updated database.json with 323 docx HSK 1 (v3.0) words!');

  // Also update lessons_data.json if needed
  const lessonsDataPath = path.resolve('lessons_data.json');
  if (fs.existsSync(lessonsDataPath)) {
    const lessonsData = JSON.parse(fs.readFileSync(lessonsDataPath, 'utf8'));
    lessonsData['hsk1_30'] = newHsk130Words;
    fs.writeFileSync(lessonsDataPath, JSON.stringify(lessonsData, null, 2));
    console.log('Successfully updated lessons_data.json hsk1_30!');
  }
}

replaceHsk130();
