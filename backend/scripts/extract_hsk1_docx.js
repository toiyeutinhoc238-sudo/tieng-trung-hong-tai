import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import path from 'path';
import fs from 'fs';

async function processDocx() {
  const filePath = path.resolve('../filetuvung/Từ Vựng HSK 1 3.0.docx');
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }

  const result = await mammoth.convertToHtml({ path: filePath });
  const $ = cheerio.load(result.value);

  const extractedWords = [];
  const translationExercises = [];

  let currentLessonId = 0;

  $('table').each((tableIdx, table) => {
    currentLessonId = tableIdx + 1;
    let prevText = $(table).prev('p, h1, h2, h3, h4').text().trim();
    if (!prevText) {
      prevText = $(table).parent().prev('p, h1, h2, h3, h4').text().trim();
    }

    const rows = [];
    $(table).find('tr').each((rIdx, tr) => {
      const cells = [];
      $(tr).find('td, th').each((cIdx, td) => {
        cells.push($(td).text().trim());
      });
      if (cells.length > 0) rows.push(cells);
    });

    if (rows.length <= 1) return;

    console.log(`\nLesson ${currentLessonId} (${prevText || 'Table ' + currentLessonId}): ${rows.length - 1} vocabulary items`);

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const word = row[0] || '';
      const pinyin = row[1] || '';
      const wordType = row[2] || '';
      const meaning = row[3] || '';
      const note = row[4] || '';
      const example = row[5] || '';
      const question = row[6] || '';
      const answer = row[7] || '';

      if (!word && !meaning) continue;

      extractedWords.push({
        lessonId: currentLessonId,
        lessonTitle: prevText || `Bài ${currentLessonId}`,
        word,
        pinyin,
        wordType,
        meaning,
        note,
        example_zh: example, // Example sentence
        question,            // Translation practice question (Việt -> Trung)
        answer               // Translation practice answer (Trung)
      });

      if (question || answer) {
        translationExercises.push({
          lessonId: currentLessonId,
          lessonTitle: prevText || `Bài ${currentLessonId}`,
          vocabWord: word,
          question,
          answer
        });
      }
    }
  });

  console.log('\n================ SUMMARY ================');
  console.log('Total extracted vocab words:', extractedWords.length);
  console.log('Total translation exercises:', translationExercises.length);

  console.log('\nSample Vocab Object (Row with Question/Answer):');
  const sampleWithQ = extractedWords.find(w => w.question && w.answer);
  console.log(JSON.stringify(sampleWithQ, null, 2));

  fs.writeFileSync('../scratch/hsk1_extracted_from_docx.json', JSON.stringify({
    words: extractedWords,
    exercises: translationExercises
  }, null, 2));
}

processDocx().catch(console.error);
