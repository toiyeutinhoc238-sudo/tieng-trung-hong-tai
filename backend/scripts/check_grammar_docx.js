import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import path from 'path';

async function checkGrammarDocx() {
  const filePath = path.resolve('../filetuvung/Ngữ pháp HSK 1.docx');
  const result = await mammoth.convertToHtml({ path: filePath });
  const text = result.value;
  console.log('Grammar Docx Length:', text.length);
  console.log(text.slice(0, 1500));
}

checkGrammarDocx().catch(console.error);
