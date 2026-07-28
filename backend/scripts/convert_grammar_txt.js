import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
  { id: 'hsk1', file: 'backend/grammar_json/ngu phap hsk 1.content.txt', level: 'HSK 1', title: 'Ngữ Pháp HSK 1 Chi Tiết' },
  { id: 'hsk2', file: 'backend/grammar_json/ngu phap hsk 2.content.txt', level: 'HSK 2', title: 'Ngữ Pháp HSK 2 Chi Tiết' },
  { id: 'hsk3', file: 'backend/grammar_json/ngu phap hsk 3.content.txt', level: 'HSK 3', title: 'Ngữ Pháp HSK 3 Chi Tiết' },
  { id: 'hsk4', file: 'backend/grammar_json/ngu phap hsk 4.content.txt', level: 'HSK 4', title: 'Ngữ Pháp HSK 4 Chi Tiết' },
  { id: 'hsk5', file: 'backend/grammar_json/ngu phap hsk 5.content.txt', level: 'HSK 5', title: 'Ngữ Pháp HSK 5 Chi Tiết' },
  { id: 'hsk6', file: 'backend/grammar_json/ngu phap hsk 6.content.txt', level: 'HSK 6', title: 'Ngữ Pháp HSK 6 Chi Tiết' },
  { id: 'hsk123', file: 'backend/grammar_json/ngu phap hsk 1 2 3.content.txt', level: 'Sơ Cấp', title: 'Tổng Hợp Ngữ Pháp HSK 1-2-3' }
];

function cleanText(str) {
  if (!str) return '';
  return str.replace(/----------------Page \(\d+\) Break----------------/g, '\n\n')
            .replace(/\r\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
}

const grammarData = {};

files.forEach(item => {
  const fullPath = path.join(__dirname, '..', '..', item.file);
  let textContent = '';
  if (fs.existsSync(fullPath)) {
    textContent = fs.readFileSync(fullPath, 'utf-8');
  } else {
    console.warn('File not found:', fullPath);
  }

  grammarData[item.id] = {
    id: item.id,
    level: item.level,
    title: item.title,
    content: cleanText(textContent)
  };
});

const outputPath = path.join(__dirname, '..', 'hsk_grammar_full.json');
fs.writeFileSync(outputPath, JSON.stringify(grammarData, null, 2), 'utf-8');
console.log('Successfully generated backend/hsk_grammar_full.json!');
