import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceDir = path.resolve(__dirname, '../..');

const lessonsDump = JSON.parse(fs.readFileSync(path.join(workspaceDir, 'scratch', 'hsk2_lessons_dump.json'), 'utf-8'));

lessonsDump.forEach(l => {
  console.log(`\n========================================================================`);
  console.log(`LESSON ${l.lessonId}: ${l.lessonKey}`);
  console.log(`========================================================================`);
  l.elements.forEach((el, idx) => {
    console.log(`[${idx}] <${el.tag}> ${el.text}`);
  });
});
