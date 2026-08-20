import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodes = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../scratch/hsk1_ver3_nodes.json'), 'utf-8'));

// Let's parse the nodes into structured lessons and inspect each
function extractAll() {
  const result = [];
  let currentLesson = null;
  let currentPoint = null;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const text = (node.text || '').trim();

    if (text.startsWith('Phụ lục:')) {
      // Reached appendix, stop or store
      break;
    }

    // Check lesson heading
    const lessonMatch = text.match(/^(?:第([一二三四五六七八九十\d]+)课|Bài\s*(\d+))\s*[:：]\s*(.*)$/i);
    if (lessonMatch) {
      const numStr = lessonMatch[1] || lessonMatch[2];
      currentLesson = {
        lessonIndex: result.length + 1,
        lessonNumRaw: numStr,
        lessonTitleZh: lessonMatch[3].trim(),
        fullHeader: text,
        points: []
      };
      result.push(currentLesson);
      currentPoint = null;
      continue;
    }

    // Check grammar point
    if (text.includes('💡') || (node.tagName === 'h2' && text.length > 0)) {
      if (!currentLesson) {
        currentLesson = {
          lessonIndex: 1,
          lessonNumRaw: '一',
          lessonTitleZh: 'AI小语，你好！',
          fullHeader: '第一课：AI小语，你好！',
          points: []
        };
        result.push(currentLesson);
      }

      currentPoint = {
        pointIndex: currentLesson.points.length + 1,
        titleRaw: text,
        contentNodes: []
      };
      currentLesson.points.push(currentPoint);
      continue;
    }

    if (currentPoint) {
      currentPoint.contentNodes.push(node);
    }
  }

  return result;
}

const parsed = extractAll();
console.log(`Parsed ${parsed.length} lessons.`);
fs.writeFileSync(path.resolve(__dirname, '../../scratch/hsk1_ver3_parsed_all.json'), JSON.stringify(parsed, null, 2), 'utf-8');

parsed.forEach(l => {
  console.log(`\n========================================`);
  console.log(`LESSON ${l.lessonIndex}: ${l.fullHeader} (${l.points.length} points)`);
  l.points.forEach(p => {
    console.log(`  [Point ${p.pointIndex}] ${p.titleRaw}`);
    p.contentNodes.forEach(cn => {
      console.log(`    <${cn.tagName}>: ${cn.text.slice(0, 100)}`);
    });
  });
});
