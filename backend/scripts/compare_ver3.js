import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodes = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../scratch/hsk1_ver3_nodes.json'), 'utf-8'));

// Group into lessons
const lessons = [];
let curLesson = null;
let curPoint = null;

for (let i = 0; i < nodes.length; i++) {
  const node = nodes[i];
  const t = node.text;

  // Lesson header like "第一课：AI小语，你好！" or "Phụ lục: Danh mục ngữ pháp HSK 1 (Bài 1 - 15)"
  const lessonMatch = t.match(/^(?:第([一二三四五六七八九十\d]+)课|Bài\s*(\d+))\s*[:：]\s*(.*)$/i);
  const isAppendix = t.startsWith('Phụ lục:');

  if (lessonMatch || isAppendix) {
    curLesson = {
      titleRaw: t,
      lessonNum: lessonMatch ? (lessonMatch[1] || lessonMatch[2]) : 'appendix',
      lessonTitleZh: lessonMatch ? lessonMatch[3].trim() : t,
      points: []
    };
    lessons.push(curLesson);
    curPoint = null;
    continue;
  }

  // Grammar point marker like "💡 Cách chào hỏi" or "💡 1. Câu cơ bản: ..."
  if (t.includes('💡') || (node.tagName === 'h2' && t.length < 80)) {
    if (!curLesson) {
      curLesson = {
        titleRaw: 'Bài 1: Khởi đầu',
        lessonNum: '1',
        lessonTitleZh: '你好',
        points: []
      };
      lessons.push(curLesson);
    }
    curPoint = {
      titleRaw: t,
      title: t.replace(/^💡\s*/, '').replace(/^\d+\.\s*/, '').trim(),
      elements: []
    };
    curLesson.points.push(curPoint);
    continue;
  }

  if (curPoint) {
    curPoint.elements.push(node);
  } else if (curLesson) {
    curLesson.points.push({
      titleRaw: 'Nội dung bài học',
      title: 'Nội dung bài học',
      elements: [node]
    });
    curPoint = curLesson.points[curLesson.points.length - 1];
  }
}

console.log(`Found ${lessons.length} lessons/sections in VER3.`);
lessons.forEach((l, idx) => {
  console.log(`\n=== Lesson ${idx + 1}: ${l.titleRaw} (${l.points.length} points) ===`);
  l.points.forEach((p, pIdx) => {
    console.log(`  Point ${pIdx + 1}: ${p.titleRaw} [elements: ${p.elements.length}]`);
    p.elements.forEach(el => {
      if (el.tagName === 'table') {
        console.log(`    [TABLE] rows inside table`);
      } else {
        console.log(`    [${el.tagName}] ${el.text.slice(0, 100)}`);
      }
    });
  });
});
