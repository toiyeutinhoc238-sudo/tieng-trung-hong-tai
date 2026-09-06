import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { pinyin } from 'pinyin-pro';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const cachePath = path.resolve(__dirname, '../../scratch/hsk3_processed_cache.json');
let cache = {};
if (fs.existsSync(cachePath)) {
  try {
    cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch (e) {
    cache = {};
  }
}

const rawPath = path.resolve(__dirname, '../../scratch/hsk3_extracted_raw.json');
const rawLessons = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

function getFullPinyin(zhText) {
  if (!zhText) return '';
  return pinyin(zhText, { toneType: 'symbol', nonZh: 'consecutive' }).trim();
}

function parseQuestions(qLines) {
  const questions = [];
  let curQ = null;

  qLines.forEach(l => {
    const qm = l.match(/^(?:[(（]?(\d+)[)）.:]\s*|(\d+)[.:]\s*)(.+)/);
    const optMatch = l.match(/^([A-C])[.:]\s*(.+)/i);

    if (optMatch && curQ) {
      curQ.options.push({
        letter: optMatch[1].toUpperCase(),
        text: optMatch[2].trim()
      });
    } else if (qm && !/^[A-C][.:]/.test(l)) {
      if (curQ) questions.push(curQ);
      curQ = {
        num: parseInt(qm[1] || qm[2]),
        question: l.trim(),
        options: []
      };
    } else if (curQ && curQ.options.length === 0) {
      curQ.question += ' ' + l;
    }
  });
  if (curQ) questions.push(curQ);
  return questions;
}

function splitPassageIntoSentences(contentLines) {
  const fullText = contentLines.join('\n');
  const rawSentences = fullText.split(/([。！？!?\n]+)/);
  const sentences = [];
  let temp = '';
  for (let i = 0; i < rawSentences.length; i++) {
    const chunk = rawSentences[i].trim();
    if (!chunk) continue;
    if (/^[。！？!?]+$/.test(chunk)) {
      temp += chunk;
      if (temp.trim()) {
        sentences.push(temp.trim());
        temp = '';
      }
    } else {
      if (temp.trim()) {
        sentences.push(temp.trim());
      }
      temp = chunk;
    }
  }
  if (temp.trim()) {
    sentences.push(temp.trim());
  }

  // Filter out standalone punctuation or greeting headers
  return sentences.filter(s => s && s.length > 0);
}

async function processDialogueWithAI(lessonId, diagId, rawLines, questions, isPassage) {
  const cacheKey = `${lessonId}-${diagId}`;
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  let linesToTranslate = [];
  if (isPassage) {
    const sents = splitPassageIntoSentences(rawLines);
    linesToTranslate = sents.map(s => {
      const parts = s.split(/[:：]/);
      let speaker = 'Bài đọc';
      let speech = s;
      if (parts.length > 1 && parts[0].length <= 8 && !parts[0].includes('。')) {
        speaker = parts[0].trim();
        speech = parts.slice(1).join('：').trim();
      }
      return { speaker, zh: speech };
    });
  } else {
    linesToTranslate = rawLines.map(l => {
      const parts = l.split(/[:：]/);
      let speaker = '';
      let speech = l;
      if (parts.length > 1 && parts[0].length <= 8) {
        speaker = parts[0].trim();
        speech = parts.slice(1).join('：').trim();
      }
      return { speaker, zh: speech };
    });
  }

  const prompt = `
You are an expert Chinese-Vietnamese language teacher.
Process this HSK 3 ${isPassage ? 'passage' : 'dialogue'} (Lesson ${lessonId}, Dialogue ${diagId}):

Content Lines:
${linesToTranslate.map((l, idx) => `${idx + 1}. ${l.speaker ? `[${l.speaker}]: ` : ''}${l.zh}`).join('\n')}

Quiz Questions:
${questions.map(q => `${q.question}\n${q.options.map(o => `${o.letter}. ${o.text}`).join('\n')}`).join('\n\n')}

TASK:
1. Provide the natural, accurate Vietnamese translation ('vi') for each content line. Keep the same order.
2. Carefully determine the correct answer option ('A', 'B', or 'C') and corresponding answer text for each quiz question based on the content.

Return ONLY valid JSON matching this exact schema:
{
  "translations": [
    { "index": 1, "speaker": "...", "zh": "...", "vi": "..." }
  ],
  "answers": [
    { "num": 1, "letter": "A", "answer": "..." },
    { "num": 2, "letter": "B", "answer": "..." }
  ]
}
`;

  let tries = 0;
  while (tries < 3) {
    try {
      tries++;
      const currentModel = tries === 1 ? 'openai/gpt-oss-120b' : 'openai/gpt-oss-20b';
      const comp = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: currentModel,
        response_format: { type: 'json_object' },
        temperature: 0.1
      });

      const resJson = JSON.parse(comp.choices[0].message.content);
      if (resJson && resJson.translations && resJson.answers) {
        cache[cacheKey] = {
          lines: linesToTranslate.map((l, idx) => {
            const tr = resJson.translations[idx] || resJson.translations.find(t => t.index === idx + 1) || {};
            return {
              speaker: l.speaker || tr.speaker || '',
              zh: l.zh,
              pinyin: getFullPinyin(l.zh),
              vi: tr.vi || ''
            };
          }),
          answers: resJson.answers
        };
        fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
        return cache[cacheKey];
      }
    } catch (err) {
      console.warn(`[L${lessonId} D${diagId}] Attempt ${tries} error:`, err.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Fallback if AI failed after 3 tries
  return {
    lines: linesToTranslate.map(l => ({
      speaker: l.speaker,
      zh: l.zh,
      pinyin: getFullPinyin(l.zh),
      vi: ''
    })),
    answers: questions.map((q, idx) => ({
      num: q.num || (idx + 1),
      letter: 'A',
      answer: q.options[0]?.text || ''
    }))
  };
}

async function main() {
  console.log(`Starting HSK 3 Reading Texts generation for ${rawLessons.length} lessons...`);

  const finalOutput = [];

  for (let i = 0; i < rawLessons.length; i++) {
    const rawLesson = rawLessons[i];
    console.log(`\nProcessing Lesson ${rawLesson.lessonId} (${rawLesson.lessonTitle})...`);

    const dialogues = [];

    for (let j = 0; j < rawLesson.dialogues.length; j++) {
      const rawDiag = rawLesson.dialogues[j];
      const questions = parseQuestions(rawDiag.rawQuizLines);
      const isPassage = rawDiag.isPassage || (rawDiag.id === 4);

      console.log(`  -> Processing Dialogue ${rawDiag.id}...`);
      const aiResult = await processDialogueWithAI(
        rawLesson.lessonId,
        rawDiag.id,
        rawDiag.rawContentLines,
        questions,
        isPassage
      );

      // Build quiz questions
      const mcQuestions = questions.map((q, qIdx) => {
        const foundAns = aiResult.answers.find(a => a.num === q.num) || aiResult.answers[qIdx] || {};
        const ansLetter = (foundAns.letter || 'A').toUpperCase();
        const chosenOpt = q.options.find(o => o.letter === ansLetter) || q.options[0];
        const ansText = chosenOpt ? chosenOpt.text : (foundAns.answer || q.options[0]?.text || '');

        return {
          id: qIdx + 1,
          type: 'multiple_choice',
          category: 'Chọn đáp án đúng',
          question: q.question,
          options: q.options.map(o => o.text),
          answerLetter: ansLetter,
          answer: ansText
        };
      });

      dialogues.push({
        id: rawDiag.id,
        title: rawDiag.title,
        isPassage: isPassage,
        context: rawDiag.context,
        audio: `/audio/hsk3_texts/${rawLesson.lessonId}-${rawDiag.id * 2 - 1}.mp3`,
        vocabAudio: `/audio/hsk3_texts/${rawLesson.lessonId}-${rawDiag.id * 2}.mp3`,
        lines: aiResult.lines,
        notes: [],
        comprehension_questions: rawDiag.rawQaLines,
        quiz: {
          instruction: 'Nghe file audio bài khóa và chọn đáp án đúng cho các câu hỏi bên dưới:',
          tf_questions: [],
          mc_questions: mcQuestions,
          questions: mcQuestions
        }
      });

      // Brief delay to be gentle on rate limits
      await new Promise(r => setTimeout(r, 600));
    }

    finalOutput.push({
      lessonId: rawLesson.lessonId,
      lessonTitle: rawLesson.lessonTitle,
      dialogues: dialogues
    });
  }

  const outPublic = path.resolve(__dirname, '../../frontend/public/hsk3_reading_texts.json');
  const outDist = path.resolve(__dirname, '../../frontend/dist/hsk3_reading_texts.json');

  fs.writeFileSync(outPublic, JSON.stringify(finalOutput, null, 2), 'utf8');
  fs.writeFileSync(outDist, JSON.stringify(finalOutput, null, 2), 'utf8');

  console.log(`\n🎉 Successfully generated ${finalOutput.length} lessons to:`);
  console.log(' -', outPublic);
  console.log(' -', outDist);
}

main().catch(console.error);
