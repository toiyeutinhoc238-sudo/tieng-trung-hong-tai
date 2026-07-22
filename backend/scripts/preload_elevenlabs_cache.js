import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_DIR = path.resolve(__dirname, '..');
const DB_PATH = path.join(BACKEND_DIR, 'database.json');
const AUDIO_CACHE_DIR = path.join(BACKEND_DIR, 'audio_cache');

const apiKey = process.env.ELEVENLABS_API_KEY || 'sk_51feae550df86c7bb9ab69706394130a8061ab0aef5dbf2e';

const voices = [
  { safeVoice: 'elevenlabs-adam', voiceId: 'pNInz6obpgDQGcFmaJgB' },
  { safeVoice: 'elevenlabs-antoni', voiceId: 'ErXwobaYiN019PkySvjV' },
  { safeVoice: 'elevenlabs-bella', voiceId: 'EXAVITQu4vr4xnSDxMaL' },
  { safeVoice: 'elevenlabs-jessica', voiceId: 'cgSgspJ2msm6clMCkdW9' }
];

const elevenAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });

function cleanTTSInput(str) {
  if (!str) return '';
  return String(str)
    .replace(/<[^>]*>/g, '')
    .replace(/^[A-Z]:\s*/gm, '')
    .replace(/\n[A-Z]:\s*/g, '，')
    .replace(/_{2,}/g, ' ')
    .replace(/[\r\n]+/g, '，')
    .replace(/([\u4e00-\u9fa5]+)\s*[\(\uff08][^\)\uff09]*[\)\uff09]/g, '$1')
    .trim();
}

async function fetchElevenLabsTTS(text, voiceId) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=3`;
  const body = JSON.stringify({
    text: text,
    model_id: 'eleven_multilingual_v2',
    language_code: 'zh',
    voice_settings: { stability: 0.5, similarity_boost: 0.75 }
  });

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      agent: elevenAgent,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      }
    }, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', err => reject(err));
    });
    req.on('error', err => reject(err));
    req.write(body);
    req.end();
  });
}

async function preloadCache() {
  await fs.mkdir(AUDIO_CACHE_DIR, { recursive: true });
  const rawDb = await fs.readFile(DB_PATH, 'utf-8');
  const vocab = JSON.parse(rawDb);

  console.log(`Starting ElevenLabs cache preloader for ${vocab.length} words...`);
  let cachedCount = 0;
  let generatedCount = 0;

  for (const item of vocab.slice(0, 30)) { // Preload top HSK words for instant 0.01s play
    const wordText = cleanTTSInput(item.word);
    if (!wordText) continue;

    for (const v of voices) {
      const hash = crypto.createHash('md5').update(`v9_pure_${v.safeVoice}_${wordText}`).digest('hex');
      const filePath = path.join(AUDIO_CACHE_DIR, `${hash}.mp3`);

      try {
        await fs.access(filePath);
        cachedCount++;
      } catch {
        try {
          console.log(`Synthesizing [${v.safeVoice}]: ${wordText}`);
          const buf = await fetchElevenLabsTTS(wordText, v.voiceId);
          await fs.writeFile(filePath, buf);
          generatedCount++;
          await new Promise(r => setTimeout(r, 100)); // Fast pacing
        } catch (err) {
          console.error(`Failed ${wordText}:`, err.message);
        }
      }
    }
  }

  console.log(`Preload complete! Cached: ${cachedCount}, Newly generated: ${generatedCount}`);
}

preloadCache();
