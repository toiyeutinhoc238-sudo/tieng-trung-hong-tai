import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceDir = path.resolve(__dirname, '../..');

async function inspectDocx() {
  const filePath = path.join(workspaceDir, 'filetuvung', 'Ngữ Pháp HSK 2 3.0 new.docx');
  console.log('Inspecting file:', filePath);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }

  // 1. Raw text
  const rawTextResult = await mammoth.extractRawText({ path: filePath });
  const rawText = rawTextResult.value;
  fs.writeFileSync(path.join(workspaceDir, 'scratch', 'hsk2_raw_text.txt'), rawText, 'utf-8');
  console.log('Extracted raw text, length:', rawText.length);

  // 2. HTML conversion
  const htmlResult = await mammoth.convertToHtml({ path: filePath });
  const html = htmlResult.value;
  fs.writeFileSync(path.join(workspaceDir, 'scratch', 'hsk2_html.html'), html, 'utf-8');
  console.log('Converted to HTML, length:', html.length);

  const $ = cheerio.load(html);
  
  // Find headings, tables, paragraphs
  const elements = [];
  $('body').children().each((idx, el) => {
    const tag = el.tagName.toLowerCase();
    const text = $(el).text().trim();
    const isTable = tag === 'table';
    let rowCount = 0;
    let colCount = 0;
    if (isTable) {
      rowCount = $(el).find('tr').length;
      colCount = $(el).find('tr').first().find('td, th').length;
    }
    elements.push({
      index: idx,
      tag,
      textPreview: text.substring(0, 100),
      isTable,
      rowCount,
      colCount
    });
  });

  console.log('Total top-level elements:', elements.length);
  console.log('Sample elements:');
  elements.filter(el => /bài|lesson|ngữ pháp|table/i.test(el.textPreview) || el.isTable).slice(0, 40).forEach(el => {
    console.log(`[${el.index}] <${el.tag}> (isTable: ${el.isTable}, rows: ${el.rowCount}): ${el.textPreview}`);
  });
}

inspectDocx().catch(console.error);
