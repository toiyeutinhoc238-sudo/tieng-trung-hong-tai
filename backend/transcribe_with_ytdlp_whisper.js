import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const groqApiKey = process.env.GROQ_API_KEY;
console.log('Groq API Key present:', !!groqApiKey);
const groqClient = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

const YTDLP_PATH = path.join(__dirname, 'bin', 'yt-dlp.exe');
console.log('YTDLP_PATH exists:', fs.existsSync(YTDLP_PATH));

const YOUTUBE_IDS = [
  'x8hxgoX41bQ', // 1. 理发
  'x85SQQ-wdVw', // 2. 请假
  'Jg3TDciM8nM', // 3. 相信的力量
  'COBKEcw5sb0', // 4. 玫瑰的故事- 关于学习套路
  '9Pu3j1zTldI', // 5. 玫瑰的故事- 生活常识与培养自理能力
  'SaOnBgmEixE', // 6. 玫瑰的故事- 蒲公英为什么会变成小毛毛
  'ladSXWGPKZw', // 7. 玫瑰的故事- 所有的离别都是因为我们相遇过
  'SvvkxnaJ7-E'  // 8. 玫瑰的故事- 接纳不完美
];

async function downloadAudioWithYtDlp(youtubeId, outPath) {
  try {
    console.log(`[yt-dlp] Downloading audio for ${youtubeId}...`);
    await execFileAsync(YTDLP_PATH, [
      `https://www.youtube.com/watch?v=${youtubeId}`,
      '--extractor-args', 'youtube:player_client=android,web;player_skip=webpage,configs',
      '-f', 'ba/b*',
      '-o', outPath,
      '--force-overwrites',
      '--no-playlist'
    ], { timeout: 60000 });
    const ok = fs.existsSync(outPath);
    console.log(`[yt-dlp] Success:`, ok, `File size:`, ok ? `${(fs.statSync(outPath).size / 1024).toFixed(1)} KB` : '0 KB');
    return ok;
  } catch (e) {
    console.warn(`[yt-dlp] Download error for ${youtubeId}:`, e.message);
    return false;
  }
}

async function transcribeWithGroqWhisper(audioPath) {
  if (!groqClient) return null;
  console.log(`[Whisper AI] Transcribing with Groq Whisper Large v3 (Word & Segment timestamps)...`);
  const transcription = await groqClient.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: 'whisper-large-v3',
    temperature: 0.0,
    response_format: 'verbose_json',
    timestamp_granularities: ['segment', 'word']
  });
  return transcription;
}

async function main() {
  const tempDir = path.join(__dirname, 'temp_audio');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const allWhisperResults = {};

  for (let i = 0; i < YOUTUBE_IDS.length; i++) {
    const ytid = YOUTUBE_IDS[i];
    console.log(`\n========================================`);
    console.log(`Processing Video ${i + 1}/${YOUTUBE_IDS.length}: ${ytid}`);
    const audioPath = path.join(tempDir, `audio_${ytid}.m4a`);

    let downloaded = fs.existsSync(audioPath) && fs.statSync(audioPath).size > 1000;
    if (!downloaded) {
      downloaded = await downloadAudioWithYtDlp(ytid, audioPath);
    }

    if (downloaded) {
      try {
        const whisperData = await transcribeWithGroqWhisper(audioPath);
        allWhisperResults[ytid] = whisperData;
        console.log(`[Success] Video ${i + 1} (${ytid}) transcribed!`);
        console.log(`Segments count:`, whisperData.segments?.length);
        whisperData.segments?.forEach(s => {
          console.log(`   [${s.start.toFixed(2)}s - ${s.end.toFixed(2)}s] ${s.text}`);
        });
      } catch (e) {
        console.error(`[Whisper Error] for ${ytid}:`, e.message);
      }
    } else {
      console.warn(`[Warning] Could not download audio for ${ytid}`);
    }
  }

  fs.writeFileSync(
    path.join(__dirname, 'whisper_results.json'),
    JSON.stringify(allWhisperResults, null, 2),
    'utf8'
  );
  console.log('\nSaved backend/whisper_results.json with exact millisecond timestamps!');
}

main();
