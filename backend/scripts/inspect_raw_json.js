import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceDir = path.resolve(__dirname, '../..');

const rawLessons = JSON.parse(fs.readFileSync(path.join(workspaceDir, 'scratch', 'hsk2_raw_extracted.json'), 'utf-8'));

rawLessons.forEach(l => {
  console.log(`\n========================================================`);
  console.log(`LESSON ${l.lessonId}: ${l.lessonKey}`);
  console.log(`========================================================`);
  l.items.forEach((it, idx) => {
    if (it.type === 'table') {
      console.log(`[Item ${idx}] TABLE with ${it.rows.length} rows`);
      console.log('  Headers/First row:', it.rows[0]);
      if (it.rows[1]) console.log('  Second row:', it.rows[1]);
    } else {
      console.log(`[Item ${idx}] <${it.type}> ${it.text}`);
    }
  });
});
