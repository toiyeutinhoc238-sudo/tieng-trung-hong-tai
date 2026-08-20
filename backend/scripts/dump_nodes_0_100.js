import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodes = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../scratch/hsk1_ver3_nodes.json'), 'utf-8'));

for (let i = 0; i <= 100; i++) {
  const n = nodes[i];
  console.log(`[${i}] <${n.tagName}>: ${n.text ? n.text.slice(0, 120) : '(empty)'}`);
}
