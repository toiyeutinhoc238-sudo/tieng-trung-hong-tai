import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pinyin } from 'pinyin-pro';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate Pinyin for a Chinese sentence
function getFullPinyin(zhText) {
  if (!zhText) return '';
  return pinyin(zhText, { toneType: 'symbol', nonZh: 'consecutive' }).trim();
}

// Build HSK 2 Dialogues
const hsk2Words = db.filter(w => (w.level === 2 || w.level === '2') && (w.hskVersion === '3.0' || !w.hskVersion));
const allHsk2Examples = hsk2Words.filter(w => w.example_vi && w.example_vi.length > 5).map(w => w.example_vi);
const allHsk2Meanings = Array.from(new Set(hsk2Words.map(w => w.meaning).filter(Boolean)));

const hsk2Lessons = [];

for (let l = 1; l <= 15; l++) {
  const words = hsk2Words.filter(w => Number(w.lessonId) === l);
  const title = words[0] ? words[0].lessonTitle : `Bài ${l}`;
  const dialogues = [];

  for (let d = 1; d <= 4; d++) {
    const audioTrack = (d * 2) - 1;
    const chunk = words.slice((d - 1) * 3, d * 3);
    const lines = [];
    const speakers = ['王老师', '小语', '李明', '张华'];

    if (chunk.length > 0) {
      chunk.forEach((w, idx) => {
        const zh = w.example_zh || (w.word + '。');
        lines.push({
          speaker: speakers[idx % speakers.length],
          zh: zh,
          pinyin: getFullPinyin(zh),
          vi: w.example_vi || w.meaning || ''
        });
      });
    } else {
      const fallbackZh = '我们一起学习中文吧。';
      lines.push({
        speaker: '王老师',
        zh: fallbackZh,
        pinyin: getFullPinyin(fallbackZh),
        vi: 'Chúng ta cùng nhau học tiếng Trung nhé.'
      });
    }

    const mainWord = chunk[0] || words[0] || { word: '学习', meaning: 'học tập' };
    
    // Pick 2 realistic word meaning distractors
    const otherMeanings = allHsk2Meanings.filter(m => m !== mainWord.meaning);
    const distractorMeanings = shuffle(otherMeanings).slice(0, 2);
    const q1Opts = shuffle([mainWord.meaning, distractorMeanings[0] || 'đi du lịch', distractorMeanings[1] || 'ăn cơm']);

    // Pick 2 realistic sentence translation distractors
    const targetSentenceVi = lines[0]?.vi || mainWord.meaning;
    const otherSentences = allHsk2Examples.filter(s => s !== targetSentenceVi);
    const distractorSentences = shuffle(otherSentences).slice(0, 2);
    const q2Opts = shuffle([
      targetSentenceVi,
      distractorSentences[0] || 'Tôi muốn đi trường học đón bạn.',
      distractorSentences[1] || 'Hôm nay thời tiết rất đẹp.'
    ]);

    const questions = [
      {
        id: 1,
        question: `(1) Trong bài khóa, từ "${mainWord.word}" mang nghĩa là gì?`,
        options: q1Opts,
        answer: mainWord.meaning
      },
      {
        id: 2,
        question: `(2) Câu "${lines[0]?.zh || mainWord.word}" được dịch đúng là:`,
        options: q2Opts,
        answer: targetSentenceVi
      }
    ];

    dialogues.push({
      id: d,
      title: `Bài Khóa ${d}`,
      audio: `/audio/hsk2_texts/${l}-${audioTrack}.mp3`,
      vocabAudio: `/audio/hsk2_texts/${l}-${d * 2}.mp3`,
      lines,
      notes: [],
      quiz: {
        instruction: 'Nghe file audio bài khóa và chọn đáp án đúng cho 2 câu hỏi bên dưới:',
        questions
      }
    });
  }

  hsk2Lessons.push({
    lessonId: l,
    lessonTitle: title,
    dialogues
  });
}

const hsk2Dest1 = path.resolve(__dirname, '../../frontend/public/hsk2_reading_texts.json');
const hsk2Dest2 = path.resolve(__dirname, '../../frontend/dist/hsk2_reading_texts.json');
fs.writeFileSync(hsk2Dest1, JSON.stringify(hsk2Lessons, null, 2));
fs.writeFileSync(hsk2Dest2, JSON.stringify(hsk2Lessons, null, 2));
console.log('Saved HSK 2 Reading Texts with full Pinyin & authentic Quizzes!');

// Build HSK 3 Dialogues
const hsk3Words = db.filter(w => (w.level === 3 || w.level === '3') && (w.hskVersion === '3.0' || !w.hskVersion));
const allHsk3Examples = hsk3Words.filter(w => w.example_vi && w.example_vi.length > 5).map(w => w.example_vi);
const allHsk3Meanings = Array.from(new Set(hsk3Words.map(w => w.meaning).filter(Boolean)));

const hsk3Lessons = [];

for (let l = 1; l <= 18; l++) {
  const words = hsk3Words.filter(w => Number(w.lessonId) === l);
  let title = (words[0] && words[0].lessonTitle) ? words[0].lessonTitle : `Bài ${l}`;
  if (!title.toLowerCase().startsWith('bài')) {
    title = `Bài ${l}: ${title}`;
  }
  const dialogues = [];

  for (let d = 1; d <= 4; d++) {
    const audioTrack = (d * 2) - 1;
    const chunk = words.slice((d - 1) * 3, d * 3);
    const lines = [];
    const speakers = ['大卫', '李明', '王老师', '小雪'];

    if (chunk.length > 0) {
      chunk.forEach((w, idx) => {
        const zh = w.example_zh || (w.word + '。');
        lines.push({
          speaker: speakers[idx % speakers.length],
          zh: zh,
          pinyin: getFullPinyin(zh),
          vi: w.example_vi || w.meaning || ''
        });
      });
    } else {
      const fallbackZh = '没问题，我们一起准备吧。';
      lines.push({
        speaker: '李明',
        zh: fallbackZh,
        pinyin: getFullPinyin(fallbackZh),
        vi: 'Không vấn đề gì, chúng ta cùng chuẩn bị nhé.'
      });
    }

    const mainWord = chunk[0] || words[0] || { word: '准备', meaning: 'chuẩn bị' };
    
    // Pick 2 realistic word meaning distractors
    const otherMeanings = allHsk3Meanings.filter(m => m !== mainWord.meaning);
    const distractorMeanings = shuffle(otherMeanings).slice(0, 2);
    const q1Opts = shuffle([mainWord.meaning, distractorMeanings[0] || 'giúp đỡ', distractorMeanings[1] || 'du lịch']);

    // Pick 2 realistic sentence translation distractors
    const targetSentenceVi = lines[0]?.vi || mainWord.meaning;
    const otherSentences = allHsk3Examples.filter(s => s !== targetSentenceVi);
    const distractorSentences = shuffle(otherSentences).slice(0, 2);
    const q2Opts = shuffle([
      targetSentenceVi,
      distractorSentences[0] || 'Cuối tuần này bạn có kế hoạch gì không?',
      distractorSentences[1] || 'Chúng tôi đang chuẩn bị cho cuộc họp ngày mai.'
    ]);

    const questions = [
      {
        id: 1,
        question: `(1) Trong bài khóa, từ "${mainWord.word}" mang nghĩa là gì?`,
        options: q1Opts,
        answer: mainWord.meaning
      },
      {
        id: 2,
        question: `(2) Câu "${lines[0]?.zh || mainWord.word}" được dịch đúng là:`,
        options: q2Opts,
        answer: targetSentenceVi
      }
    ];

    dialogues.push({
      id: d,
      title: `Bài Khóa ${d}`,
      audio: `/audio/hsk3_texts/${l}-${audioTrack}.mp3`,
      vocabAudio: `/audio/hsk3_texts/${l}-${d * 2}.mp3`,
      lines,
      notes: [],
      quiz: {
        instruction: 'Nghe file audio bài khóa và chọn đáp án đúng cho 2 câu hỏi bên dưới:',
        questions
      }
    });
  }

  hsk3Lessons.push({
    lessonId: l,
    lessonTitle: title,
    dialogues
  });
}

const hsk3Dest1 = path.resolve(__dirname, '../../frontend/public/hsk3_reading_texts.json');
const hsk3Dest2 = path.resolve(__dirname, '../../frontend/dist/hsk3_reading_texts.json');
fs.writeFileSync(hsk3Dest1, JSON.stringify(hsk3Lessons, null, 2));
fs.writeFileSync(hsk3Dest2, JSON.stringify(hsk3Lessons, null, 2));
console.log('Saved HSK 3 Reading Texts with full Pinyin & authentic Quizzes!');
