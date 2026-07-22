import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'database.json'), 'utf8'));
const withEx = db.filter(w => w.example_zh && w.example_zh !== '');

// Export all examples as readable text
const lines = withEx.map(w => {
  return `ID ${w.id} | Level ${w.level} | ${w.word} (${w.pinyin}) | ${w.meaning}\nCN: ${w.example_zh}\nVI: ${w.example_vi}\n`;
});

fs.writeFileSync(path.join(__dirname, '..', '..', 'all_examples.txt'), lines.join('\n'), 'utf8');
console.log('Exported', withEx.length, 'examples to all_examples.txt');

// Also by level
for (const level of [1, 2, 3]) {
  const filtered = withEx.filter(w => w.level === level);
  const linesL = filtered.map(w => {
    return `ID ${w.id} | ${w.word} (${w.pinyin}) | ${w.meaning}\nCN: ${w.example_zh}\nVI: ${w.example_vi}\n`;
  });
  fs.writeFileSync(path.join(__dirname, '..', '..', `hsk${level}_examples.txt`), linesL.join('\n'), 'utf8');
  console.log(`Level ${level}:`, filtered.length, 'examples');
}
