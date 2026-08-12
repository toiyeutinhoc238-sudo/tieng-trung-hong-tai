import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceDir = path.resolve(__dirname, '../..');

async function analyzeDocx() {
  const docxPath = path.join(workspaceDir, 'filetuvung', 'Ngữ Pháp HSK 2 3.0 new.docx');
  const result = await mammoth.convertToHtml({ path: docxPath });
  const html = result.value;
  const $ = cheerio.load(html);

  // Group elements by Lesson
  const lessons = [];
  let currentLesson = null;

  $('body').children().each((idx, el) => {
    const tag = el.tagName.toLowerCase();
    const text = $(el).text().trim();
    
    // Check for Lesson header like "Bài 1:" or "Bài 1" or "Bài 2:"
    const lessonMatch = text.match(/^Bài\s*(\d+)[:：]?\s*(.*)$/i);
    if (lessonMatch && (tag === 'p' || tag === 'h1' || tag === 'h2' || tag === 'h3')) {
      const lessonNum = parseInt(lessonMatch[1], 10);
      currentLesson = {
        lessonId: lessonNum,
        lessonKey: `Bài ${lessonNum}`,
        rawHeader: text,
        elements: []
      };
      lessons.push(currentLesson);
      return;
    }

    if (currentLesson) {
      currentLesson.elements.push({
        tag,
        text,
        html: $.html(el)
      });
    }
  });

  console.log(`Found ${lessons.length} lessons.`);
  lessons.forEach(l => {
    console.log(`\n========================================`);
    console.log(`LESSON ${l.lessonId} (${l.lessonKey}) - Elements count: ${l.elements.length}`);
    console.log(`========================================`);
    l.elements.forEach((e, ei) => {
      if (e.tag === 'table') {
        console.log(`  [Table ${ei}] Rows: ${cheerio.load(e.html)('tr').length}`);
      } else if (e.text.length > 0) {
        console.log(`  [${e.tag}] ${e.text.substring(0, 90)}`);
      }
    });
  });

  // Save structured analysis
  fs.writeFileSync(path.join(workspaceDir, 'scratch', 'hsk2_lessons_dump.json'), JSON.stringify(lessons, null, 2), 'utf-8');
}

analyzeDocx().catch(console.error);
