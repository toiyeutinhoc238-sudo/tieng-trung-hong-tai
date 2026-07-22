import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_DIR = path.join(__dirname, '..');
const DB_PATH = path.join(BACKEND_DIR, 'database.json');
const AUDIO_CACHE_DIR = path.join(BACKEND_DIR, 'audio_cache');
const DEFAULT_VOICE = 'zh-CN-XiaoxiaoNeural';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateEdgeAudio(text, voice) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  return new Promise((resolve, reject) => {
    const { audioStream } = tts.toStream(text);
    const chunks = [];
    audioStream.on('data', chunk => chunks.push(chunk));
    audioStream.on('close', () => resolve(Buffer.concat(chunks)));
    audioStream.on('error', err => reject(err));
  });
}

async function preloadTTS() {
  console.log('🚀 Starting Pre-load TTS script with MsEdgeTTS...');
  await fs.mkdir(AUDIO_CACHE_DIR, { recursive: true });

  let rawData = [];
  try {
    const dataStr = await fs.readFile(DB_PATH, 'utf-8');
    rawData = JSON.parse(dataStr);
  } catch (err) {
    console.error('❌ Error reading database.json:', err);
    process.exit(1);
  }

  const textSet = new Set();
  rawData.forEach((item) => {
    if (item.word && typeof item.word === 'string') {
      const cleanWord = item.word.trim();
      if (cleanWord) textSet.add(cleanWord);
    }
    if (item.example_zh && typeof item.example_zh === 'string') {
      const cleanEx = item.example_zh.trim();
      if (cleanEx) textSet.add(cleanEx);
    }
  });

  const allTexts = Array.from(textSet);
  console.log(`📊 Found ${allTexts.length} unique words and example sentences to check/cache.`);

  let newlyCached = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < allTexts.length; i++) {
    const text = allTexts[i];
    const hash = crypto.createHash('md5').update(`${DEFAULT_VOICE}_${text}`).digest('hex');
    const fileName = `${hash}.mp3`;
    const filePath = path.join(AUDIO_CACHE_DIR, fileName);

    let exists = false;
    try {
      await fs.access(filePath);
      exists = true;
    } catch {
      exists = false;
    }

    if (exists) {
      skipped++;
    } else {
      try {
        console.log(`[${i + 1}/${allTexts.length}] Generating TTS audio for: "${text.substring(0, 25)}"`);
        const audioBuffer = await generateEdgeAudio(text, DEFAULT_VOICE);
        await fs.writeFile(filePath, audioBuffer);
        newlyCached++;
        await delay(30);
      } catch (err) {
        console.error(`❌ Failed generating TTS for "${text}":`, err.message);
        failed++;
      }
    }

    if ((i + 1) % 100 === 0 || i === allTexts.length - 1) {
      console.log(`📈 Progress: ${i + 1}/${allTexts.length} (Newly cached: ${newlyCached}, Existing: ${skipped}, Failed: ${failed})`);
    }
  }

  console.log('🎉 TTS Pre-load completed successfully!');
}

preloadTTS();
