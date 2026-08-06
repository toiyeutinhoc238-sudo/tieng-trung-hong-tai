import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import path from 'path';

async function parseTextDocx() {
  const filePath = path.resolve('../filetuvung/Bài khoá HSK 1 3.0.docx');
  const result = await mammoth.convertToHtml({ path: filePath });
  const html = result.value;
  const $ = cheerio.load(html);

  console.log('Docx HTML converted length:', html.length);
  console.log('Headings / Paragraphs count:', $('p, h1, h2, h3, h4').length);
  console.log('Tables count:', $('table').length);

  console.log('\n--- SAMPLE HTML OUTPUT ---');
  console.log(html.slice(0, 2500));
}

parseTextDocx().catch(console.error);
