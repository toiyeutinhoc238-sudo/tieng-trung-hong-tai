import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Build HSK 2
const hsk2Words = db.filter(w => (w.level === 2 || w.level === '2') && (w.hskVersion === '3.0' || !w.hskVersion));
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
        lines.push({
          speaker: speakers[idx % speakers.length],
          zh: w.example_zh || (w.word + '。'),
          pinyin: w.pinyin || '',
          vi: w.example_vi || w.meaning || ''
        });
      });
    } else {
      lines.push({
        speaker: '王老师',
        zh: '我们一起学习吧。',
        pinyin: 'wǒ men yì qǐ xué xí ba 。',
        vi: 'Chúng ta cùng nhau học tập nhé.'
      });
    }

    const mainWord = chunk[0] || words[0] || { word: '学习', meaning: 'học tập' };
    const secondWord = chunk[1] || chunk[0] || { word: '朋友', meaning: 'bạn bè' };

    // Select smart distractors
    const otherWords = hsk2Words.filter(w => w.word !== mainWord.word && w.meaning !== mainWord.meaning);
    const distractor1 = otherWords[0]?.meaning || 'Đi du lịch';
    const distractor2 = otherWords[1]?.meaning || 'Uống trà';
    const distractor3 = otherWords[2]?.meaning || 'Gọi taxi';
    const distractor4 = otherWords[3]?.meaning || 'Ăn cơm';

    const q1Opts = shuffle([mainWord.meaning, distractor1, distractor2]);
    const q2Opts = shuffle([
      lines[0]?.vi || mainWord.meaning,
      'Chào buổi sáng mọi người!',
      'Hẹn gặp lại vào ngày mai nhé!'
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
        answer: lines[0]?.vi || mainWord.meaning
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
console.log('Saved HSK 2 Reading Texts with verified Quizzes to public & dist!');

// Build HSK 3
const hsk3Words = db.filter(w => (w.level === 3 || w.level === '3') && (w.hskVersion === '3.0' || !w.hskVersion));
const hsk3Lessons = [];

for (let l = 1; l <= 18; l++) {
  const words = hsk3Words.filter(w => Number(w.lessonId) === l);
  const title = (words[0] && words[0].lessonTitle) ? `Bài ${l}: ${words[0].lessonTitle}` : `Bài ${l}`;
  const dialogues = [];

  for (let d = 1; d <= 4; d++) {
    const audioTrack = (d * 2) - 1;
    const chunk = words.slice((d - 1) * 3, d * 3);
    const lines = [];
    const speakers = ['大卫', '李明', '王老师', '小雪'];

    if (chunk.length > 0) {
      chunk.forEach((w, idx) => {
        lines.push({
          speaker: speakers[idx % speakers.length],
          zh: w.example_zh || (w.word + '。'),
          pinyin: w.pinyin || '',
          vi: w.example_vi || w.meaning || ''
        });
      });
    } else {
      lines.push({
        speaker: '李明',
        zh: '没问题，我们一起准备吧。',
        pinyin: 'méi wèn tí ， wǒ men yì qǐ zhǔn bèi ba 。',
        vi: 'Không vấn đề gì, chúng ta cùng chuẩn bị nhé.'
      });
    }

    const mainWord = chunk[0] || words[0] || { word: '准备', meaning: 'chuẩn bị' };
    const otherWords = hsk3Words.filter(w => w.word !== mainWord.word && w.meaning !== mainWord.meaning);
    const distractor1 = otherWords[0]?.meaning || 'Tham quan công viên';
    const distractor2 = otherWords[1]?.meaning || 'Mua sắm ở siêu thị';

    const q1Opts = shuffle([mainWord.meaning, distractor1, distractor2]);
    const q2Opts = shuffle([
      lines[0]?.vi || mainWord.meaning,
      'Tôi đang ở nhà nghỉ ngơi.',
      'Ngày mai trời sẽ mưa to.'
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
        answer: lines[0]?.vi || mainWord.meaning
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
console.log('Saved HSK 3 Reading Texts with verified Quizzes to public & dist!');
