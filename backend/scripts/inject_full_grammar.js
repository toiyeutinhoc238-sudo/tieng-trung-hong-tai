import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '..', 'hsk_grammar_full.json');
const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const htmlPath = path.join(__dirname, '..', '..', 'frontend', 'hsk-grammar.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

const codeToInsert = `    function initBuiltInGrammar() {
      allGrammarData = {
        'hsk1': { id: 'hsk1', level: 'HSK 1', title: 'Tổng Hợp Ngữ Pháp HSK 1 Chi Tiết', content: ${JSON.stringify(json.hsk1.content)} },
        'hsk2': { id: 'hsk2', level: 'HSK 2', title: 'Tổng Hợp Ngữ Pháp HSK 2 Chi Tiết', content: ${JSON.stringify(json.hsk2.content)} },
        'hsk3': { id: 'hsk3', level: 'HSK 3', title: 'Tổng Hợp Ngữ Pháp HSK 3 Chi Tiết', content: ${JSON.stringify(json.hsk3.content)} },
        'hsk4': { id: 'hsk4', level: 'HSK 4', title: 'Tổng Hợp Ngữ Pháp HSK 4 Chi Tiết', content: ${JSON.stringify(json.hsk4.content)} },
        'hsk5': { id: 'hsk5', level: 'HSK 5', title: 'Tổng Hợp Ngữ Pháp HSK 5 Chi Tiết', content: ${JSON.stringify(json.hsk5.content)} },
        'hsk6': { id: 'hsk6', level: 'HSK 6', title: 'Tổng Hợp Ngữ Pháp HSK 6 Chi Tiết', content: ${JSON.stringify(json.hsk6.content)} }
      };
    }`;

const regex = /function initBuiltInGrammar\(\) \{[\s\S]*?\}\s*document\.addEventListener/m;
if (regex.test(html)) {
  html = html.replace(regex, codeToInsert + '\n\n    document.addEventListener');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log('Successfully injected 100% full raw text with all examples directly into hsk-grammar.html!');
} else {
  console.error('Regex match failed');
}
