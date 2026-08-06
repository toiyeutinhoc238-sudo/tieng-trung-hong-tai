import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import path from 'path';
import fs from 'fs';

async function parseReadingTexts() {
  const filePath = path.resolve('../filetuvung/Bài khoá HSK 1 3.0.docx');
  const result = await mammoth.convertToHtml({ path: filePath });
  const html = result.value;
  const $ = cheerio.load(html);

  const lessons = [];
  let currentLesson = null;
  let currentText = null;

  $('p, ul, ol').each((idx, el) => {
    const text = $(el).text().trim();
    if (!text) return;

    // Detect Lesson Header e.g. "第一课： AI小语，你好" or "第二课： 我叫李文"
    const lessonMatch = text.match(/^(第[一二三四五六七八九十]+课|一课|[\d]+)\s*[:：]\s*(.*)/i);
    if (lessonMatch) {
      const rawNum = lessonMatch[1];
      const title = lessonMatch[2].trim();
      const numMap = {
        '一课': 1, '第一课': 1, '第二课': 2, '第三课': 3, '第四课': 4, '第五课': 5,
        '第六课': 6, '第七课': 7, '第八课': 8, '第九课': 9, '第十课': 10,
        '第十一课': 11, '第十二课': 12, '第十三课': 13, '第十四课': 14, '第十五课': 15
      };
      const lessonNum = numMap[rawNum] || (lessons.length + 1);

      currentLesson = {
        lessonId: lessonNum,
        lessonTitle: `Bài ${lessonNum}: ${title}`,
        texts: []
      };
      lessons.push(currentLesson);
      currentText = null;
      return;
    }

    if (!currentLesson) {
      currentLesson = {
        lessonId: 1,
        lessonTitle: 'Bài 1: AI小语，你好',
        texts: []
      };
      lessons.push(currentLesson);
    }

    // Detect Text Header e.g. "课文1:", "课文二", "课文三："
    const textMatch = text.match(/^(课文[一二三四五六七八九十\d]+)\s*[:：]?/i);
    if (textMatch) {
      currentText = {
        title: textMatch[1],
        lines: [],
        notes: []
      };
      currentLesson.texts.push(currentText);
      return;
    }

    if (!currentText) {
      currentText = {
        title: '课文一',
        lines: [],
        notes: []
      };
      currentLesson.texts.push(currentText);
    }

    // Check if line is a note e.g. "Chú ý: 您 là đại từ..."
    if (text.toLowerCase().startsWith('chú ý:') || text.toLowerCase().startsWith('chú ý :')) {
      currentText.notes.push(text.replace(/^chú ý\s*[:：]\s*/i, '').trim());
    } else {
      currentText.lines.push(text);
    }
  });

  console.log('Parsed Lessons count:', lessons.length);
  lessons.forEach(l => {
    console.log(`\nLesson ${l.lessonId}: ${l.lessonTitle} (${l.texts.length} dialogues)`);
    l.texts.forEach(t => {
      console.log(`  - ${t.title}: ${t.lines.length} lines, ${t.notes.length} notes`);
      console.log(`    Sample line: ${t.lines[0] || 'Empty'}`);
    });
  });

  fs.writeFileSync('../scratch/hsk1_reading_texts_parsed.json', JSON.stringify(lessons, null, 2));
}

parseReadingTexts().catch(console.error);
