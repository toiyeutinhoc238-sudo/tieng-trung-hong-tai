import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parsed = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../scratch/hsk1_ver3_parsed_all.json'), 'utf-8'));

for (let i = 0; i < 10; i++) {
  const l = parsed[i];
  console.log(`\n========================================`);
  console.log(`LESSON ${l.lessonIndex}: ${l.fullHeader} (${l.points.length} points)`);
  l.points.forEach(p => {
    console.log(`  [Point ${p.pointIndex}] ${p.titleRaw}`);
    p.contentNodes.forEach(cn => {
      console.log(`    <${cn.tagName}>: ${cn.text}`);
    });
  });
}
