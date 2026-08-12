import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceDir = path.resolve(__dirname, '../..');

async function dumpRawLessons() {
  const docxPath = path.join(workspaceDir, 'filetuvung', 'Ngữ Pháp HSK 2 3.0 new.docx');
  const result = await mammoth.convertToHtml({ path: docxPath });
  const $ = cheerio.load(result.value);

  const rawLessons = [];
  let current = null;

  $('body').children().each((_, el) => {
    const tag = el.tagName.toLowerCase();
    const text = $(el).text().trim();
    const lessonMatch = text.match(/^Bài\s*(\d+)[:：]?/i);

    if (lessonMatch && (tag === 'p' || tag === 'h1' || tag === 'h2' || tag === 'h3')) {
      const id = parseInt(lessonMatch[1], 10);
      current = {
        lessonId: id,
        lessonKey: `Bài ${id}`,
        items: []
      };
      rawLessons.push(current);
      return;
    }

    if (current) {
      if (tag === 'table') {
        const rows = [];
        $(el).find('tr').each((_, tr) => {
          const row = [];
          $(tr).find('td, th').each((_, td) => {
            row.push($(td).text().trim());
          });
          if (row.length) rows.push(row);
        });
        current.items.push({ type: 'table', rows });
      } else if (text) {
        current.items.push({ type: tag, text, html: $(el).html() });
      }
    }
  });

  fs.writeFileSync(path.join(workspaceDir, 'scratch', 'hsk2_raw_extracted.json'), JSON.stringify(rawLessons, null, 2), 'utf-8');
  console.log(`Extracted ${rawLessons.length} lessons.`);
  rawLessons.forEach(l => {
    console.log(`Lesson ${l.lessonId}: ${l.items.length} items`);
  });
}

dumpRawLessons().catch(console.error);
