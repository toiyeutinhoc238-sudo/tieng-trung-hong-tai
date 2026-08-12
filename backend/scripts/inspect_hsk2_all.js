import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceDir = path.resolve(__dirname, '../..');

async function main() {
  // 1. Check Excel files for HSK 2 lesson titles
  const excelFiles = ['Từ vựng HSK 2 3.0 new.xlsx', 'TỔNG HỢP TỪ VỰNG HSK 2 PHIÊN BẢN 3.0.xlsx'];
  for (const f of excelFiles) {
    const p = path.join(workspaceDir, 'filetuvung', f);
    if (fs.existsSync(p)) {
      const wb = xlsx.readFile(p);
      console.log('\n=== Excel:', f, '===');
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet);
      console.log('Rows count:', rows.length);
      console.log('First 3 rows:', rows.slice(0, 3));
      // Extract unique lesson names
      const lessons = new Set();
      rows.forEach(r => {
        Object.keys(r).forEach(k => {
          if (/bài|lesson/i.test(k) || /bài|lesson/i.test(String(r[k]))) {
            lessons.add(`${k}: ${r[k]}`);
          }
        });
      });
      console.log('Unique lesson keys found:', Array.from(lessons).slice(0, 20));
    }
  }

  // 2. Inspect HTML of Ngữ Pháp HSK 2 3.0 new.docx
  const docxPath = path.join(workspaceDir, 'filetuvung', 'Ngữ Pháp HSK 2 3.0 new.docx');
  const result = await mammoth.convertToHtml({ path: docxPath });
  const $ = cheerio.load(result.value);

  console.log('\n=== DOCX ALL HEADINGS & PARAGRAPHS ===');
  let currentLesson = '';
  $('body').children().each((idx, el) => {
    const tag = el.tagName.toLowerCase();
    const text = $(el).text().trim();
    if (/^Bài\s*\d+/i.test(text)) {
      currentLesson = text;
      console.log(`\n>>> [LESSON HEADER] ${text}`);
    } else if (/^\d+\.\s+/.test(text)) {
      console.log(`   * [POINT] ${text}`);
    } else if (tag === 'table') {
      console.log(`   [TABLE in ${currentLesson}] Rows: ${$(el).find('tr').length}`);
    }
  });
}

main().catch(console.error);
