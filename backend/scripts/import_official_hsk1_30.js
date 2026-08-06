import xlsx from 'xlsx';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import path from 'path';
import fs from 'fs';

async function importOfficialHsk130() {
  console.log('=== STEP 1: PARSING OFFICIAL VOCABULARY EXCEL (Từ vựng HSK 1 3.0.xlsx) ===');
  const excelPath = path.resolve('../filetuvung/Từ vựng HSK 1 3.0.xlsx');
  if (!fs.existsSync(excelPath)) {
    console.error('Excel file not found:', excelPath);
    return;
  }

  const workbook = xlsx.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const numMap = {
    '一课': 1, '第一课': 1, '第二课': 2, '第三课': 3, '第四课': 4, '第五课': 5,
    '第六课': 6, '第七课': 7, '第八课': 8, '第九课': 9, '第十课': 10,
    '第十一课': 11, '第十二课': 12, '第十三课': 13, '第十四课': 14, '第十五课': 15
  };

  const cleanTitle = (raw, id) => {
    if (!raw) return `Bài ${id}`;
    let str = String(raw).replace(/^(?:(Bài|Lesson|第.*?课|一课|第二课|第三课|第四课|第五课|第六课|第七课|第八课|第九课|第十课|第十一课|第十二课|第十三课|第十四课|第十五课)\s*[:：\-–—]?\s*)+/gi, '').trim();
    str = str.replace(/^(?:AI小语[，,]?\s*)/i, '').trim();
    return str ? `Bài ${id}: ${str}` : `Bài ${id}`;
  };

  const vocabWords = [];
  const translationExercises = [];

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const rawLesson = String(row[0] || '').trim();
    const rawLessonTitle = String(row[1] || '').trim();
    const word = String(row[2] || '').trim();
    const pinyin = String(row[3] || '').trim();
    const category = String(row[4] || '').trim();
    const meaning = String(row[5] || '').trim();
    const note = String(row[6] || '').trim();
    const example_zh = String(row[7] || '').trim();
    const question = String(row[8] || '').trim();
    const answer = String(row[9] || '').trim();

    if (!word && !meaning) continue;

    let lessonId = numMap[rawLesson] || parseInt(rawLesson.replace(/\D/g, '')) || 1;
    let titleStr = cleanTitle(rawLessonTitle, lessonId);

    vocabWords.push({
      id: 210 + vocabWords.length, // Start at ID 210 to preserve user progress
      word,
      pinyin,
      meaning,
      level: 1,
      curriculum: 'hsk',
      hskVersion: '3.0',
      volume: null,
      lessonId: lessonId,
      lessonTitle: titleStr,
      lessonDesc: `Toàn bộ từ vựng ${titleStr} chuẩn HSK 1 (v3.0)`,
      category: category || 'Từ vựng',
      example_zh: example_zh || answer || '',
      example_vi: question || meaning || '',
      question: question || '',
      answer: answer || '',
      note: note || '',
      isMemorized: false,
      isStarred: false,
      isCustom: false
    });

    if (question || answer) {
      translationExercises.push({
        id: `ex_hsk1_30_L${lessonId}_${r}`,
        lessonId: lessonId,
        lessonTitle: titleStr,
        level: 1,
        hskVersion: '3.0',
        vocabWord: word,
        question: question,
        answer: answer
      });
    }
  }

  console.log(`Parsed ${vocabWords.length} vocabulary words and ${translationExercises.length} translation exercises from Excel.`);

  // Update backend/database.json
  const dbPath = path.resolve('database.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  const remainingDb = db.filter(w => !((w.hskVersion === '3.0' || w.version === '3.0') && String(w.level) === '1'));
  const updatedDb = [...remainingDb, ...vocabWords];

  fs.writeFileSync(dbPath, JSON.stringify(updatedDb, null, 2));
  console.log('Updated backend/database.json successfully.');

  // Update backend/lessons_data.json
  const lessonsDataPath = path.resolve('lessons_data.json');
  if (fs.existsSync(lessonsDataPath)) {
    const lessonsData = JSON.parse(fs.readFileSync(lessonsDataPath, 'utf8'));
    lessonsData['hsk1_30'] = vocabWords;
    fs.writeFileSync(lessonsDataPath, JSON.stringify(lessonsData, null, 2));
    console.log('Updated backend/lessons_data.json successfully.');
  }

  console.log('\n=== STEP 2: PARSING OFFICIAL READING DIALOGUES DOCX (Bài khoá HSK 1 3.0.docx) ===');
  const docxPath = path.resolve('../filetuvung/Bài khoá HSK 1 3.0.docx');
  if (fs.existsSync(docxPath)) {
    const result = await mammoth.convertToHtml({ path: docxPath });
    const $ = cheerio.load(result.value);

    const lessonsTextMap = {};

    let currentLId = 1;
    $('p, ul, ol').each((_, el) => {
      const text = $(el).text().trim();
      if (!text) return;

      const lessonMatch = text.match(/^(第[一二三四五六七八九十\d]+课|一课|[\d]+)\s*[:：]\s*(.*)/i);
      if (lessonMatch) {
        const rawNum = lessonMatch[1];
        currentLId = numMap[rawNum] || parseInt(rawNum.replace(/\D/g, '')) || (currentLId + 1);
        if (!lessonsTextMap[currentLId]) {
          lessonsTextMap[currentLId] = {
            lessonId: currentLId,
            lessonTitle: `Bài ${currentLId}`,
            dialogues: []
          };
        }
        return;
      }

      if (!lessonsTextMap[currentLId]) {
        lessonsTextMap[currentLId] = {
          lessonId: currentLId,
          lessonTitle: `Bài ${currentLId}`,
          dialogues: []
        };
      }

      const textMatch = text.match(/^(课文[一二三四五六七八九十\d]+)\s*[:：]?/i);
      if (textMatch) {
        lessonsTextMap[currentLId].dialogues.push({
          title: textMatch[1],
          lines: [],
          notes: []
        });
        return;
      }

      const currentText = lessonsTextMap[currentLId].dialogues[lessonsTextMap[currentLId].dialogues.length - 1];
      if (currentText) {
        if (text.toLowerCase().startsWith('chú ý:') || text.toLowerCase().startsWith('chú ý :')) {
          currentText.notes.push(text.replace(/^chú ý\s*[:：]\s*/i, '').trim());
        } else {
          currentText.lines.push(text);
        }
      } else {
        lessonsTextMap[currentLId].dialogues.push({
          title: '课文一',
          lines: [text],
          notes: []
        });
      }
    });

    const readingTextsOutput = Object.values(lessonsTextMap);
    fs.writeFileSync('hsk1_reading_texts.json', JSON.stringify(readingTextsOutput, null, 2));
    fs.writeFileSync('../frontend/public/hsk1_reading_texts.json', JSON.stringify(readingTextsOutput, null, 2));
    console.log(`Saved ${readingTextsOutput.length} lessons of reading dialogues to hsk1_reading_texts.json & frontend/public/hsk1_reading_texts.json!`);
  }
}

importOfficialHsk130().catch(console.error);
