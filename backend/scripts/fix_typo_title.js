import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let fixed = 0;
data.forEach(item => {
  if (item.lessonTitle && item.lessonTitle.includes('她es我的老师')) {
    item.lessonTitle = item.lessonTitle.replace('她es我的老师', '她是我的老师');
    fixed++;
  }
});

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Successfully fixed typo in ${fixed} items in database.json!`);
