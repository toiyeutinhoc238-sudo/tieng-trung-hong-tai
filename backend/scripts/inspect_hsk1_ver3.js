import mammoth from 'mammoth';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inspectDocx() {
  const docxPath = path.resolve(__dirname, '../../filetuvung/Ngữ pháp HSK 1 3.0 NEW VER3.docx');
  console.log('Docx path:', docxPath, 'Exists:', fs.existsSync(docxPath));
  
  const result = await mammoth.convertToHtml({ path: docxPath });
  const html = result.value;
  console.log('HTML length:', html.length);
  
  const scratchDir = path.resolve(__dirname, '../../scratch');
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  
  fs.writeFileSync(path.join(scratchDir, 'hsk1_ver3_raw.html'), html, 'utf-8');
  
  const textResult = await mammoth.extractRawText({ path: docxPath });
  fs.writeFileSync(path.join(scratchDir, 'hsk1_ver3_raw.txt'), textResult.value, 'utf-8');
  
  console.log('Text length:', textResult.value.length);
  console.log('First 2000 chars of text:\n' + textResult.value.slice(0, 2000));
}

inspectDocx().catch(console.error);
