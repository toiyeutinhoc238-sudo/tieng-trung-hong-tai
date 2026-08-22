import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const groqApiKey = process.env.GROQ_API_KEY;
console.log('Groq API Key present:', !!groqApiKey);

const groqClient = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

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

async function downloadAudioCobaltOrInvidious(youtubeId, outPath) {
  // Strategy 1: Cobalt.tools API
  try {
    console.log(`[Audio Download] Trying Cobalt for ${youtubeId}...`);
    const cobRes = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${youtubeId}`,
        downloadMode: 'audio',
        audioFormat: 'm4a'
      }),
      signal: AbortSignal.timeout(12000)
    });

    if (cobRes.ok) {
      const cobData = await cobRes.json();
      const streamUrl = cobData.url || cobData.audio;
      if (streamUrl) {
        const audioRes = await fetch(streamUrl, { signal: AbortSignal.timeout(45000) });
        if (audioRes.ok) {
          const ab = await audioRes.arrayBuffer();
          fs.writeFileSync(outPath, Buffer.from(ab));
          console.log(`[Audio Download] Successfully downloaded via Cobalt (${(ab.byteLength / 1024).toFixed(1)} KB)`);
          return true;
        }
      }
    }
  } catch (e) {
    console.warn(`[Cobalt Warning]:`, e.message);
  }

  // Strategy 2: Invidious / Piped instances
  const pipedInstances = [
    `https://invidious.nerdvpn.de/api/v1/videos/${youtubeId}`,
    `https://yewtu.be/api/v1/videos/${youtubeId}`,
    `https://inv.nadeko.net/api/v1/videos/${youtubeId}`,
    `https://pipedapi.kavin.rocks/streams/${youtubeId}`,
    `https://api.piped.video/streams/${youtubeId}`
  ];

  for (const inst of pipedInstances) {
    try {
      console.log(`[Audio Download] Trying Invidious instance ${inst}...`);
      const pRes = await fetch(inst, { signal: AbortSignal.timeout(8000) });
      if (pRes.ok) {
        const pData = await pRes.json();
        const audioStreams = pData.audioStreams || pData.adaptiveFormats?.filter(f => f.type?.includes('audio')) || [];
        if (audioStreams.length > 0) {
          const bestStream = audioStreams.find(s => s.mimeType?.includes('audio/mp4') || s.format === 'M4A') || audioStreams[0];
          const streamUrl = bestStream.url;
          if (streamUrl) {
            const audioRes = await fetch(streamUrl, { signal: AbortSignal.timeout(45000) });
            if (audioRes.ok) {
              const ab = await audioRes.arrayBuffer();
              fs.writeFileSync(outPath, Buffer.from(ab));
              console.log(`[Audio Download] Successfully downloaded via ${inst} (${(ab.byteLength / 1024).toFixed(1)} KB)`);
              return true;
            }
          }
        }
      }
    } catch (e) {}
  }

  return false;
}

async function transcribeWithGroqWhisper(audioPath) {
  if (!groqClient) return null;
  console.log(`[Whisper AI] Transcribing audio with Groq Whisper Large v3 (Word timestamps)...`);
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

    let downloaded = fs.existsSync(audioPath);
    if (!downloaded) {
      downloaded = await downloadAudioCobaltOrInvidious(ytid, audioPath);
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
  console.log('\nSaved backend/whisper_results.json!');
}

main();
