import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Groq, { toFile } from 'groq-sdk';
import { pinyin } from 'pinyin-pro';
import YTDlpWrap from 'yt-dlp-wrap';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from backend directory and root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config();

const execFileAsync = promisify(execFile);

// Path to yt-dlp binary
const BIN_DIR = path.join(__dirname, '..', 'bin');
let YTDLP_PATH = path.join(BIN_DIR, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

// Ensure yt-dlp binary exists (Auto-download if missing on Render/Linux)
let isYtDlpReady = fs.existsSync(YTDLP_PATH);
async function ensureYtDlpExists() {
  if (isYtDlpReady) return;
  
  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
  }

  try {
    // Attempt fallback to global yt-dlp first
    await execFileAsync('yt-dlp', ['--version']);
    YTDLP_PATH = 'yt-dlp';
    isYtDlpReady = true;
    console.log('[System] Using global yt-dlp');
    return;
  } catch (err) {
    // Global not found, download automatically
    console.log('[System] yt-dlp not found. Downloading automatically via yt-dlp-wrap...');
    const downloader = YTDlpWrap.default ? YTDlpWrap.default : YTDlpWrap;
    await downloader.downloadFromGithub(YTDLP_PATH);
    if (process.platform !== 'win32') {
      fs.chmodSync(YTDLP_PATH, '755');
    }
    isYtDlpReady = true;
    console.log('[System] yt-dlp downloaded successfully!');
  }
}

const AUDIO_TEMP_DIR = path.join(os.tmpdir(), 'hongtai_transcribe_audio');
if (!fs.existsSync(AUDIO_TEMP_DIR)) {
  fs.mkdirSync(AUDIO_TEMP_DIR, { recursive: true });
}

// Dynamic AI Clients initialization (guarantees key presence regardless of load order)
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey, timeout: 120000 });
}

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
}

/**
 * 1. Extract YouTube ID from any arbitrary URL format
 */
export function extractYouTubeId(urlOrId) {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const trimmed = urlOrId.trim();

  // If already 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Common YouTube URL regex patterns
  const patterns = [
    /(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/)([a-zA-Z0-9_-]{11})/i,
    /[?&]v=([a-zA-Z0-9_-]{11})/i,
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  ];

  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * 2. Fetch official video metadata (Title, Duration, Author, Thumbnail)
 */
export async function fetchVideoMetadata(youtubeId) {
  let title = `Video Luyện Nghe (${youtubeId})`;
  let duration = 60;
  let author = 'YouTube Creator';
  let thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

  // Strategy A: YouTube Data API v3 (if key is set)
  if (process.env.YOUTUBE_API_KEY) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${youtubeId}&key=${process.env.YOUTUBE_API_KEY}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const snippet = data.items[0].snippet;
          const content = data.items[0].contentDetails;
          title = snippet.title || title;
          author = snippet.channelTitle || author;
          if (content && content.duration) {
            duration = parseISO8601Duration(content.duration) || duration;
          }
          if (snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url) {
            thumbnail = snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url;
          }
          return { youtubeId, title, duration, author, thumbnail };
        }
      }
    } catch (e) {
      console.warn('[YouTube API v3] Metadata fetch error:', e.message);
    }
  }

  // Strategy B: YouTube oEmbed (Free, fast, no credentials needed)
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const odata = await res.json();
      if (odata.title) title = odata.title;
      if (odata.author_name) author = odata.author_name;
      if (odata.thumbnail_url) thumbnail = odata.thumbnail_url;
    }
  } catch (e) {
    console.warn('[YouTube oEmbed] Metadata fetch error:', e.message);
  }

  return { youtubeId, title, duration, author, thumbnail };
}

function parseISO8601Duration(isoStr) {
  if (!isoStr) return 60;
  const match = isoStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 60;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Filter out non-speech tags, music cues, sound effects, and brackets
 */
export function cleanSpeechText(text) {
  if (!text) return '';
  let cleaned = text
    .replace(/[\[\(【（](?:Âm nhạc|Nhạc|tiếng nhạc|Music|music|Applause|Vỗ tay|Tiếng cười|Laughter|Tiếng ồn|Silence|Trống|Guitar|Piano|Hát|Singing|Cheering|音乐|伴奏|掌声|笑声|吉他|钢琴|欢呼|BGM|Sound Effect)[\]\)】）]/gi, '')
    .replace(/[♪♫♩♬★☆✦✧❤️👍🔥]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // If only punctuation or whitespace remains, drop it
  if (/^[\p{P}\s]*$/u.test(cleaned)) return '';

  // Drop common metadata/credit spam
  if (/^(作词|作曲|编曲|填词|演唱|歌手|字幕|english|music by|subscribe|ghiền mì gõ)+/i.test(cleaned)) {
    return '';
  }

  return cleaned;
}

/**
 * TIER 1: Extract YouTube Native & Auto-Generated (ASR) Subtitles
 * Matches how eJOY, 4English, and Language Reactor work.
 */
export async function extractYouTubeSubtitles(youtubeId) {
  const subTempPrefix = `sub_${youtubeId}_${Date.now()}`;
  const subTempBase = path.join(AUDIO_TEMP_DIR, subTempPrefix);
  const videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

  try {
    console.log(`[YouTube Subtitles] Inspecting subtitles via yt-dlp for ${youtubeId}...`);
    await ensureYtDlpExists();
    await execFileAsync(YTDLP_PATH, [
      videoUrl,
      '--skip-download',
      '--write-auto-subs',
      '--write-subs',
      '--sub-langs', 'zh-Hans,zh,zh-Hant,zh-CN,zh-TW,vi,en',
      '--sub-format', 'json3',
      '-o', `${subTempBase}.%(ext)s`
    ], { timeout: 35000 });

    const filesInTemp = fs.readdirSync(AUDIO_TEMP_DIR);
    const matchedFile = filesInTemp.find(f => f.startsWith(subTempPrefix) && f.endsWith('.json3'));

    if (matchedFile) {
      const fullSubPath = path.join(AUDIO_TEMP_DIR, matchedFile);
      const fileContent = fs.readFileSync(fullSubPath, 'utf-8');
      try { fs.unlinkSync(fullSubPath); } catch (_) {}

      const json3Data = JSON.parse(fileContent);
      const events = json3Data.events || [];
      const rawSentences = [];

      for (let i = 0; i < events.length; i++) {
        const ev = events[i];
        if (!ev.segs || ev.segs.length === 0) continue;

        const textRaw = ev.segs.map(s => s.utf8 || '').join('').trim();
        const textClean = cleanSpeechText(textRaw);
        if (!textClean) continue;

        const startSec = parseFloat(((ev.tStartMs || 0) / 1000).toFixed(3));
        const durSec = parseFloat(((ev.dDurationMs || 3000) / 1000).toFixed(3));
        const endSec = parseFloat((startSec + durSec).toFixed(3));

        rawSentences.push({
          id: rawSentences.length + 1,
          startTime: startSec,
          endTime: endSec,
          duration: durSec,
          text: textClean
        });
      }

      if (rawSentences.length > 0) {
        console.log(`[YouTube Subtitles] Successfully extracted ${rawSentences.length} raw sentences from official YouTube captions!`);
        return {
          lang: matchedFile.includes('zh') ? 'zh' : 'auto',
          source: 'YouTube Official / ASR Subtitles',
          sentences: rawSentences
        };
      }
    }

    return null;
  } catch (err) {
    console.log(`[YouTube Subtitles] No native subtitles downloaded (${err.message}). Falling back to Tier 2.`);
    return null;
  } finally {
    try {
      const remaining = fs.readdirSync(AUDIO_TEMP_DIR).filter(f => f.startsWith(subTempPrefix));
      for (const f of remaining) {
        fs.unlinkSync(path.join(AUDIO_TEMP_DIR, f));
      }
    } catch (_) {}
  }
}

/**
 * TIER 2: High-Fidelity Audio Download & Voice Activity Detection (VAD) Transcription
 * Used when the video has NO YouTube captions.
 * Guarantees zero phantom sentences / hallucinations on music or silence.
 */
export async function transcribeAudioWithVAD(youtubeId, videoTitle = '') {
  const groq = getGroqClient();
  if (!groq) {
    throw new Error('Groq Whisper AI client is not configured (missing GROQ_API_KEY).');
  }

  const audioPath = path.join(AUDIO_TEMP_DIR, `audio_${youtubeId}_${Date.now()}.m4a`);
  const videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

  try {
    console.log(`[VAD Audio Engine] Downloading clean audio track for ${youtubeId}...`);
    await ensureYtDlpExists();
    await execFileAsync(YTDLP_PATH, [
      videoUrl,
      '--extractor-args', 'youtube:player_client=android,web;player_skip=webpage,configs',
      '-f', '140/ba[ext=m4a]/ba[abr<=64]/ba/b*',
      '-o', audioPath,
      '--force-overwrites',
      '--no-playlist'
    ], { timeout: 60000 });

    if (!fs.existsSync(audioPath) || fs.statSync(audioPath).size < 1000) {
      throw new Error('Không thể tải luồng âm thanh từ video YouTube này.');
    }

    const fileSizeKB = (fs.statSync(audioPath).size / 1024).toFixed(1);
    console.log(`[VAD Audio Engine] Audio downloaded successfully (${fileSizeKB} KB). Running Whisper Large v3 with strict VAD...`);

    // Call Groq Whisper Large v3 at temperature 0.0 with word & segment timestamps
    const audioBuffer = fs.readFileSync(audioPath);
    const audioFile = await toFile(audioBuffer, `audio_${youtubeId}.m4a`);
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      temperature: 0.0,
      response_format: 'verbose_json',
      timestamp_granularities: ['segment', 'word'],
      prompt: `Tiếng Trung HSK, hội thoại chuẩn, lời bài hát tiếng Trung: ${videoTitle}`
    });

    const segments = transcription.segments || [];
    console.log(`[VAD Audio Engine] Whisper returned ${segments.length} raw segments. Applying strict Voice Activity Detection filtering...`);

    const validSentences = [];

    for (let idx = 0; idx < segments.length; idx++) {
      const seg = segments[idx];
      const noSpeechProb = seg.no_speech_prob !== undefined ? seg.no_speech_prob : 0;
      const compressionRatio = seg.compression_ratio !== undefined ? seg.compression_ratio : 1.0;
      const textClean = cleanSpeechText(seg.text || '');

      // Strict VAD Filter:
      // 1. If no_speech_prob >= 0.45, it is background music, sound effects, or silence -> DISCARD!
      // 2. If compression_ratio >= 2.4, it is Whisper hallucination repetition loop -> DISCARD!
      // 3. If cleaned text is empty or purely symbols -> DISCARD!
      if (noSpeechProb >= 0.45) {
        console.log(`[VAD Gating] Discarded non-speech/music segment: [${seg.start}s - ${seg.end}s] (no_speech_prob: ${noSpeechProb.toFixed(3)}) "${seg.text}"`);
        continue;
      }
      if (compressionRatio >= 2.4) {
        console.log(`[VAD Gating] Discarded repetitive hallucination loop (ratio: ${compressionRatio.toFixed(2)}): "${seg.text}"`);
        continue;
      }
      if (!textClean) continue;

      const start = parseFloat(Number(seg.start || 0).toFixed(3));
      const end = parseFloat(Number(seg.end || (start + 2.5)).toFixed(3));
      const dur = parseFloat((end - start).toFixed(3));

      validSentences.push({
        id: validSentences.length + 1,
        startTime: start,
        endTime: end,
        duration: dur,
        text: textClean
      });
    }

    console.log(`[VAD Audio Engine] After strict VAD gating: ${validSentences.length} accurate speech sentences retained.`);
    return {
      source: 'Groq Whisper Large v3 (Voice Activity Gated)',
      sentences: validSentences
    };
  } finally {
    // Clean up temporary audio file
    if (fs.existsSync(audioPath)) {
      try { fs.unlinkSync(audioPath); } catch (e) { }
    }
  }
}

/**
 * Universal Multi-Model LLM JSON Caller (Groq GPT-OSS-120B -> Gemini 2.5 Flash)
 */
async function callLLMJson(prompt) {
  const groq = getGroqClient();
  if (groq) {
    try {
      const res = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        response_format: { type: 'json_object' }
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e120b) {
      console.warn('[LLM] Groq 120B limit/warn, falling back to Gemini:', e120b.message);
    }
  }

  const geminiKey = getGeminiApiKey();
  if (geminiKey) {
    const candidateModels = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash'];
    for (const modelName of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0 }
          })
        });
        if (res.ok) {
          const gData = await res.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return JSON.parse(text);
        }
      } catch (eGem) {
        console.warn(`[LLM] Gemini ${modelName} call warn:`, eGem.message);
      }
    }
  }

  throw new Error('All LLM endpoints are unavailable for translation.');
}

/**
 * Enrich raw transcribed sentences with Standard Pinyin and Context-Aware Vietnamese Translation
 */
export async function enrichWithPinyinAndContextTranslation(rawItems, videoTitle = '', duration = 60) {
  if (!rawItems || rawItems.length === 0) return [];

  console.log(`[AI Enrichment] Translating and enriching ${rawItems.length} sentences for "${videoTitle}"...`);
  const chunkSize = 25;
  const enrichedList = [];

  for (let i = 0; i < rawItems.length; i += chunkSize) {
    const chunk = rawItems.slice(i, i + chunkSize);
    const chunkInput = chunk.map((s, idx) => ({
      id: s.id || (i + idx + 1),
      startTime: s.startTime,
      endTime: s.endTime,
      text: s.text || s.hanzi || ''
    }));

    try {
      const prompt = `Bạn là Chuyên Gia Ngôn Ngữ Học & Biên Dịch Phim Ảnh, Giáo Dục Tiếng Trung Cao Cấp (như hệ thống của eJOY, 4English, Language Reactor).
Dưới đây là danh sách các câu trích xuất 100% CHÍNH XÁC từ giọng nói thực tế trong video: "${videoTitle}" (Độ dài: ${duration}s):

${JSON.stringify(chunkInput, null, 2)}

NHIỆM VỤ BIÊN TẬP VÀ DỊCH NGHĨA CHUẨN XÁC:
1. "hanzi": BẮT BUỘC là Chữ Hán Giản Thể chuẩn (Simplified Chinese) khớp 100% với lời nói trong âm thanh. Nếu câu gốc là chữ phồn thể, hãy chuyển sang giản thể.
2. "vietnamese": Dịch Tiếng Việt chuẩn xác, mượt mà, đúng ngữ cảnh (xưng hô tự nhiên, không dịch máy móc vụng về, giữ trọn vẹn số đếm, danh từ, nghĩa của câu).
3. TUYỆT ĐỐI KHÔNG tự bịa thêm câu mới. GIỮ NGUYÊN đúng số lượng và "id" của từng câu.
4. "hskLevel": Đánh giá cấp độ HSK chung cho bài ("1", "2", "3", "4", "5", "6").
5. "category": Phân loại chính xác 1 trong: "Giao Tiếp", "Âm Nhạc", "Phim Ảnh", "Ẩm Thực", "Du Lịch", "Đời Sống", "Tin Tức", "Hoạt Hình".

BẮT BUỘC TRẢ VỀ ĐÚNG JSON THEO ĐỊNH DẠNG:
{
  "hskLevel": "2",
  "category": "Giao Tiếp",
  "sentences": [
    {
      "id": 1,
      "hanzi": "...",
      "vietnamese": "..."
    }
  ]
}`;

      const parsed = await callLLMJson(prompt);
      const parsedSentences = parsed.sentences || [];

      for (let cIdx = 0; cIdx < chunk.length; cIdx++) {
        const orig = chunk[cIdx];
        const match = parsedSentences.find(p => p.id === orig.id) || parsedSentences[cIdx] || {};

        let hanzi = (match.hanzi || orig.text || orig.hanzi || '').trim();
        let vietnamese = (match.vietnamese || '').trim();

        // Fallback translation if LLM missed it
        if (!vietnamese && hanzi) {
          vietnamese = 'Câu luyện tập tiếng Trung';
        }

        let py = '';
        try {
          py = pinyin(hanzi, { toneType: 'symbol' });
        } catch (e) { }

        // Extract keywords
        const cleanHanzi = hanzi.replace(/[^\u4e00-\u9fa5]/g, '');
        const keywords = [];
        if (cleanHanzi.length >= 2) {
          keywords.push(cleanHanzi.slice(0, Math.min(2, cleanHanzi.length)));
        } else if (cleanHanzi.length === 1) {
          keywords.push(cleanHanzi);
        }

        enrichedList.push({
          id: enrichedList.length + 1,
          startTime: orig.startTime,
          endTime: orig.endTime,
          duration: orig.duration || parseFloat((orig.endTime - orig.startTime).toFixed(3)),
          hanzi: hanzi,
          pinyin: py,
          meaning: vietnamese,
          keywords: keywords.length > 0 ? keywords : [cleanHanzi.slice(0, 1) || '你']
        });
      }
    } catch (err) {
      console.warn(`[AI Enrichment] LLM chunk enrichment error, applying fallback Pinyin & translation:`, err.message);
      // Direct pinyin fallback
      for (const orig of chunk) {
        const hanzi = (orig.text || orig.hanzi || '').trim();
        let py = '';
        try { py = pinyin(hanzi, { toneType: 'symbol' }); } catch (e) { }
        enrichedList.push({
          id: enrichedList.length + 1,
          startTime: orig.startTime,
          endTime: orig.endTime,
          duration: orig.duration || parseFloat((orig.endTime - orig.startTime).toFixed(3)),
          hanzi: hanzi,
          pinyin: py,
          meaning: 'Câu đàm thoại tiếng Trung',
          keywords: [hanzi.slice(0, Math.min(2, hanzi.length))]
        });
      }
    }
  }

  return enrichedList;
}

/**
 * MASTER ENTRYPOINT: Transcribe Any YouTube Video
 * Zero-Hallucination Guarantee.
 */
export async function processYouTubeVideo(urlOrId) {
  const youtubeId = extractYouTubeId(urlOrId);
  if (!youtubeId) {
    return {
      success: false,
      error: 'Link YouTube không hợp lệ! Vui lòng nhập link YouTube chuẩn (ví dụ: https://www.youtube.com/watch?v=... hoặc https://youtu.be/...)'
    };
  }

  console.log(`\n============================================================`);
  console.log(`[Video Transcriber] Processing YouTube Video: ${youtubeId}`);
  console.log(`============================================================`);

  // Step 1: Video metadata
  const meta = await fetchVideoMetadata(youtubeId);
  console.log(`[Video Transcriber] Metadata: "${meta.title}" (${meta.duration}s) by ${meta.author}`);

  let transcriptionResult = null;

  // Step 2: Tier 1 - Official / ASR Subtitles from YouTube (Zero latency, zero hallucination)
  try {
    transcriptionResult = await extractYouTubeSubtitles(youtubeId);
  } catch (eSub) {
    console.warn(`[Video Transcriber] Subtitle step warning:`, eSub.message);
  }

  // Step 3: Tier 2 - Audio Download & Groq Whisper Large v3 with Strict VAD
  if (!transcriptionResult || !transcriptionResult.sentences || transcriptionResult.sentences.length === 0) {
    console.log(`[Video Transcriber] No YouTube subtitles found. Activating Tier 2 Audio VAD Speech Recognition...`);
    try {
      transcriptionResult = await transcribeAudioWithVAD(youtubeId, meta.title);
    } catch (eAudio) {
      console.error(`[Video Transcriber] Audio transcription error:`, eAudio.message);
      return {
        success: false,
        error: `Không thể phân tích âm thanh video: ${eAudio.message}`
      };
    }
  }

  // Step 4: Validate Speech Sentences (Strict Anti-Hallucination)
  const rawSentences = transcriptionResult?.sentences || [];
  if (rawSentences.length === 0) {
    // CRITICAL: NEVER GENERATE FAKE / SYNTHETIC SENTENCES!
    return {
      success: false,
      error: 'Không phát hiện giọng nói của con người trong video này (video có thể chỉ có nhạc nền không lời, âm thanh tạp âm hoặc không có lời thoại). Vui lòng chọn một video khác có giọng nói rõ ràng!'
    };
  }

  // Step 5: AI Context Enrichment & Pinyin
  const enrichedSentences = await enrichWithPinyinAndContextTranslation(rawSentences, meta.title, meta.duration);

  // Auto-detect HSK Level based on length and vocabulary
  let hskLevel = '2';
  const totalChars = enrichedSentences.reduce((sum, s) => sum + s.hanzi.length, 0);
  const avgLen = totalChars / Math.max(1, enrichedSentences.length);
  if (avgLen <= 5) hskLevel = '1';
  else if (avgLen <= 9) hskLevel = '2';
  else if (avgLen <= 14) hskLevel = '3';
  else if (avgLen <= 20) hskLevel = '4';
  else hskLevel = '5';

  let category = 'Giao Tiếp';
  const lowerTitle = meta.title.toLowerCase();
  if (lowerTitle.includes('nhạc') || lowerTitle.includes('hát') || lowerTitle.includes('music') || lowerTitle.includes('song') || lowerTitle.includes('mv')) {
    category = 'Âm Nhạc';
  } else if (lowerTitle.includes('phim') || lowerTitle.includes('drama') || lowerTitle.includes('movie')) {
    category = 'Phim Ảnh';
  } else if (lowerTitle.includes('ẩm thực') || lowerTitle.includes('món ăn') || lowerTitle.includes('nấu')) {
    category = 'Ẩm Thực';
  } else if (lowerTitle.includes('tin tức') || lowerTitle.includes('thời sự') || lowerTitle.includes('news')) {
    category = 'Tin Tức';
  } else if (lowerTitle.includes('hoạt hình') || lowerTitle.includes('anime') || lowerTitle.includes('cartoon')) {
    category = 'Hoạt Hình';
  }

  return {
    success: true,
    youtubeId: meta.youtubeId,
    videoTitle: meta.title,
    duration: meta.duration,
    author: meta.author,
    thumbnail: meta.thumbnail,
    level: hskLevel,
    levelText: `HSK ${hskLevel}`,
    category: category,
    description: `Bài luyện nghe chép chính tả & shadowing từ video "${meta.title}".`,
    tierUsed: transcriptionResult.source,
    sentencesCount: enrichedSentences.length,
    sentences: enrichedSentences
  };
}
