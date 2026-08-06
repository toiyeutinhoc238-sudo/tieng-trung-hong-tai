import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import path from 'path';
import fs from 'fs';

async function buildHsk130FromDocx() {
  const docxPath = path.resolve('../filetuvung/Từ Vựng HSK 1 3.0.docx');
  const result = await mammoth.convertToHtml({ path: docxPath });
  const $ = cheerio.load(result.value);

  const cleanLessonTitle = (raw, id) => {
    if (!raw) return `Bài ${id}`;
    let str = raw.replace(/^(?:(Bài|Lesson|第.*?课|一课|第二课|第三课|第四课|第五课|第六课|第七课|第八课|第九课|第十课|第十一课|第十二课|第十三课|第十四课|第十五课)\s*[:：\-–—]?\s*)+/gi, '').trim();
    // Remove leading AI小语, etc if needed or clean up
    str = str.replace(/^(?:AI小语[，,]?\s*)/i, '').trim();
    return str ? `Bài ${id}: ${str}` : `Bài ${id}`;
  };

  const allWords = [];
  const allExercises = [];

  $('table').each((tableIdx, table) => {
    const lessonId = tableIdx + 1;
    let prevText = $(table).prev('p, h1, h2, h3, h4').text().trim();
    if (!prevText) {
      prevText = $(table).parent().prev('p, h1, h2, h3, h4').text().trim();
    }

    const titleStr = cleanLessonTitle(prevText, lessonId);

    const rows = [];
    $(table).find('tr').each((rIdx, tr) => {
      const cells = [];
      $(tr).find('td, th').each((cIdx, td) => {
        cells.push($(td).text().trim());
      });
      if (cells.length > 0) rows.push(cells);
    });

    if (rows.length <= 1) return;

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const word = (row[0] || '').trim();
      const pinyin = (row[1] || '').trim();
      const category = (row[2] || '').trim();
      const meaning = (row[3] || '').trim();
      const note = (row[4] || '').trim();
      const example_zh = (row[5] || '').trim();
      const question = (row[6] || '').trim();
      const answer = (row[7] || '').trim();

      if (!word && !meaning) continue;

      // Determine example_vi and example_zh
      let finalExZh = example_zh;
      let finalExVi = '';

      if (finalExZh) {
        // If example_zh contains line breaks or hyphens, clean it up
        finalExZh = finalExZh.replace(/^[\-•\*\s]+/gm, '').trim();
      }

      // If there is question & answer from teacher's translation exercise columns:
      if (question || answer) {
        allExercises.push({
          id: `ex_hsk1_30_L${lessonId}_${r}`,
          lessonId: lessonId,
          lessonTitle: titleStr,
          level: 1,
          hskVersion: '3.0',
          vocabWord: word,
          question: question, // Vietnamese question prompt
          answer: answer      // Chinese answer
        });
      }

      allWords.push({
        word,
        pinyin,
        category,
        meaning,
        note,
        example_zh: finalExZh || answer || '',
        example_vi: finalExVi || question || '',
        question: question || '',
        answer: answer || '',
        level: 1,
        curriculum: 'hsk',
        hskVersion: '3.0',
        volume: null,
        lessonId: lessonId,
        lessonTitle: titleStr,
        lessonDesc: `Toàn bộ từ vựng ${titleStr} chuẩn HSK 1 phiên bản 3.0`,
        isMemorized: false,
        isStarred: false,
        isCustom: false
      });
    }
  });

  console.log('Total extracted words:', allWords.length);
  console.log('Total extracted translation exercises:', allExercises.length);

  fs.writeFileSync('../scratch/hsk1_30_docx_extracted.json', JSON.stringify({
    words: allWords,
    exercises: allExercises
  }, null, 2));
}

buildHsk130FromDocx().catch(console.error);
