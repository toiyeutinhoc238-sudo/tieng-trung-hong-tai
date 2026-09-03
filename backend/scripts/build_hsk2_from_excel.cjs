const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { pinyin } = require('pinyin-pro');

const excelPath = path.resolve('filetuvung/Bài khóa hsk 2 3.0 NEW VER2.xlsx');
const wb = xlsx.readFile(excelPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

function getFullPinyin(zhText) {
  if (!zhText) return '';
  return pinyin(zhText, { toneType: 'symbol', nonZh: 'consecutive' }).trim();
}

function parseTF(tfText, tfAns) {
  if (!tfText || !tfAns) return [];
  const qLines = tfText.toString().split('\n').map(s => s.trim()).filter(Boolean);
  
  const ansMap = {};
  const ansMatches = tfAns.toString().match(/(?:(?:[(（]?(\d+)[)）]?)|(\d+))\s*[.:,]?\s*(Đúng|Sai|True|False|对|错)/gi) || [];
  ansMatches.forEach(m => {
    const numMatch = m.match(/\d+/);
    const valMatch = m.match(/Đúng|Sai|True|False|对|错/i);
    if (numMatch && valMatch) {
      const val = valMatch[0].toLowerCase();
      ansMap[parseInt(numMatch[0])] = (val === 'đúng' || val === 'true' || val === '对') ? 'Đúng' : 'Sai';
    }
  });

  return qLines.map((line, idx) => {
    const qNum = idx + 1;
    const ans = ansMap[qNum] || 'Sai';
    return {
      id: qNum,
      type: 'true_false',
      category: 'Phán đoán đúng sai',
      question: line,
      options: ['Đúng', 'Sai'],
      answer: ans
    };
  });
}

function parseMC(mcText, mcAns) {
  if (!mcText || !mcAns) return [];
  
  const ansMap = {};
  const ansMatches = mcAns.toString().match(/(?:[(（]?(\d+)[)）]?|\b(\d+))\s*[.:,]?\s*([A-Da-d])/g) || [];
  ansMatches.forEach(m => {
    const numMatch = m.match(/\d+/);
    const letterMatch = m.match(/[A-Da-d]$/);
    if (numMatch && letterMatch) {
      ansMap[parseInt(numMatch[0])] = letterMatch[0].toUpperCase();
    }
  });

  const lines = mcText.toString().split('\n').map(s => s.trim()).filter(Boolean);
  const questions = [];
  let currentQ = null;

  lines.forEach(l => {
    const qHeaderMatch = l.match(/^(?:[(（]?(\d+)[)）.:]\s*|(\d+)[.:]\s*)(.*)/);
    const optMatch = l.match(/^([A-D])[.:]\s*(.*)/i);

    if (optMatch && currentQ) {
      currentQ.options.push({
        letter: optMatch[1].toUpperCase(),
        text: optMatch[2].trim()
      });
    } else if (qHeaderMatch) {
      if (currentQ) questions.push(currentQ);
      const qNum = parseInt(qHeaderMatch[1] || qHeaderMatch[2] || (questions.length + 1));
      currentQ = {
        qNum: qNum,
        rawQuestion: l,
        options: []
      };
    } else if (currentQ) {
      if (currentQ.options.length === 0) {
        currentQ.rawQuestion += ' ' + l;
      }
    }
  });
  if (currentQ) questions.push(currentQ);

  return questions.map((q, idx) => {
    const targetLetter = ansMap[q.qNum] || ansMap[idx + 1] || 'A';
    const chosenOpt = q.options.find(o => o.letter === targetLetter);
    const answerText = chosenOpt ? chosenOpt.text : (q.options[0]?.text || '');

    return {
      id: idx + 1,
      type: 'multiple_choice',
      category: 'Chọn đáp án đúng',
      question: q.rawQuestion,
      options: q.options.map(o => o.text),
      answerLetter: targetLetter,
      answer: answerText
    };
  });
}

function parseLines(zhRaw, viRaw) {
  if (!zhRaw) return [];
  const zhLines = zhRaw.toString().split('\n').map(s => s.trim()).filter(Boolean);
  const viLines = (viRaw || '').toString().split('\n').map(s => s.trim()).filter(Boolean);

  const result = [];

  zhLines.forEach((zhL, idx) => {
    const viL = viLines[idx] || '';
    
    const zhColon = zhL.match(/^([^：:]{1,15})[：:](.*)/);
    const viColon = viL.match(/^([^：:]{1,30})[：:](.*)/);

    let speaker = '';
    let zh = zhL;
    let vi = viL;

    if (zhColon) {
      speaker = zhColon[1].trim();
      zh = zhColon[2].trim();
    }
    if (viColon) {
      vi = viColon[2].trim();
      if (!speaker) speaker = viColon[1].trim();
    }

    result.push({
      speaker: speaker || (zhLines.length > 1 ? `Người ${idx % 2 === 0 ? 'A' : 'B'}` : 'Bài đọc'),
      zh: zh,
      pinyin: getFullPinyin(zh),
      vi: vi
    });
  });

  return result;
}

const lessonTitles = {
  1: 'Bài 1: 她请我们去了北京烤鸭',
  2: 'Bài 2: 还是打车去北大吧',
  3: 'Bài 3: 我想去西安旅游',
  4: 'Bài 4: 你穿红色的很好看',
  5: 'Bài 5: 第一次去中国朋友家',
  6: 'Bài 6: 小雪，生日快乐！',
  7: 'Bài 7: 他篮球打得很好',
  8: 'Bài 8: 虽然你忘了，但是我记得',
  9: 'Bài 9: 我去买杯奶茶',
  10: 'Bài 10: 就要考试了',
  11: 'Bài 11: 我最喜欢吃中国菜',
  12: 'Bài 12: 这里比北京冷多了',
  13: 'Bài 13: 我们爱上中文课',
  14: 'Bài 14: 一个人过年多没意思啊',
  15: 'Bài 15: 我想再去一次中国'
};

const outputLessons = [];

for (let l = 1; l <= 15; l++) {
  const startRow = (l - 1) * 4 + 1;
  const dialogues = [];

  for (let d = 1; d <= 4; d++) {
    const rowIdx = startRow + (d - 1);
    const row = data[rowIdx];
    if (!row) continue;

    const audioTrack = (d * 2) - 1; // 1, 3, 5, 7
    const vocabTrack = d * 2;       // 2, 4, 6, 8

    const lines = parseLines(row[2], row[3]);
    let tfQuestions = parseTF(row[4], row[5]);
    let mcQuestions = parseMC(row[6], row[7]);

    if (l === 1 && d === 1 && mcQuestions.length === 0 && tfQuestions.length === 0) {
      mcQuestions = [
        {
          id: 1,
          type: 'multiple_choice',
          category: 'Chọn đáp án đúng',
          question: '（1）王一雪是谁的姐姐？',
          options: ['王一飞老师', '白家月', '安妮'],
          answerLetter: 'A',
          answer: '王一飞老师'
        },
        {
          id: 2,
          type: 'multiple_choice',
          category: 'Chọn đáp án đúng',
          question: '（2）王一雪为什么来接白家月和安妮？',
          options: ['她想去旅游', '王一飞给她打电话了', '她也是学生'],
          answerLetter: 'B',
          answer: '王一飞给她打电话了'
        }
      ];
    }

    const allQuestions = [...tfQuestions, ...mcQuestions];

    dialogues.push({
      id: d,
      title: `Bài Khóa ${d}`,
      isPassage: (d === 4),
      audio: `/audio/hsk2_texts/${l}-${audioTrack}.mp3`,
      vocabAudio: `/audio/hsk2_texts/${l}-${vocabTrack}.mp3`,
      lines: lines,
      notes: [],
      quiz: {
        instruction: d === 4 
          ? 'Nghe file audio đoạn văn bài khóa và làm các bài tập phán đoán đúng sai & chọn đáp án đúng bên dưới:'
          : 'Nghe file audio bài khóa và chọn đáp án đúng cho các câu hỏi bên dưới:',
        tf_questions: tfQuestions,
        mc_questions: mcQuestions,
        questions: allQuestions
      }
    });
  }

  outputLessons.push({
    lessonId: l,
    lessonTitle: lessonTitles[l] || `Bài ${l}`,
    dialogues: dialogues
  });
}

console.log('Total parsed lessons:', outputLessons.length);
let totalLines = 0;
let totalQuizzes = 0;
outputLessons.forEach(ls => {
  ls.dialogues.forEach(dg => {
    totalLines += dg.lines.length;
    totalQuizzes += dg.quiz.questions.length;
  });
});
console.log('Total dialogue lines across all 15 lessons:', totalLines);
console.log('Total quiz questions across all 15 lessons:', totalQuizzes);

// Save output
const outPublic = path.resolve('frontend/public/hsk2_reading_texts.json');
const outDist = path.resolve('frontend/dist/hsk2_reading_texts.json');

fs.writeFileSync(outPublic, JSON.stringify(outputLessons, null, 2), 'utf8');
if (fs.existsSync(path.dirname(outDist))) {
  fs.writeFileSync(outDist, JSON.stringify(outputLessons, null, 2), 'utf8');
}
console.log('Saved to', outPublic, 'and', outDist);
