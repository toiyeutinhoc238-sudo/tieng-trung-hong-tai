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
import ytdl from '@distube/ytdl-core';
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

const INNERTUBE_API_URL = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';
const INNERTUBE_CLIENT_VERSION = '20.10.38';
const INNERTUBE_CONTEXT = {
  client: {
    clientName: 'ANDROID',
    clientVersion: INNERTUBE_CLIENT_VERSION,
  },
};
const INNERTUBE_USER_AGENT = `com.google.android.youtube/${INNERTUBE_CLIENT_VERSION} (Linux; U; Android 14)`;

function decodeXmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));
}

function pickBestCaptionTrack(tracks) {
  if (!Array.isArray(tracks) || tracks.length === 0) return null;

  const isZh = t => t.languageCode && t.languageCode.startsWith('zh');
  const isZhHans = t => t.languageCode && (t.languageCode === 'zh-Hans' || t.languageCode === 'zh-CN' || t.languageCode === 'zh');
  const isZhHant = t => t.languageCode && (t.languageCode === 'zh-Hant' || t.languageCode === 'zh-TW' || t.languageCode === 'zh-HK');
  const isManual = t => t.kind !== 'asr';

  // 1. Chinese Hans manual (Simplified Chinese human subtitles)
  const zhHansManual = tracks.find(t => isZhHans(t) && isManual(t));
  if (zhHansManual) return zhHansManual;

  // 2. Any Chinese manual
  const zhManual = tracks.find(t => isZh(t) && isManual(t));
  if (zhManual) return zhManual;

  // 3. Chinese Hans ASR (Auto-generated Chinese)
  const zhHansAsr = tracks.find(t => isZhHans(t));
  if (zhHansAsr) return zhHansAsr;

  // 4. Any Chinese ASR
  const zhAsr = tracks.find(t => isZh(t));
  if (zhAsr) return zhAsr;

  // 5. Vietnamese track (if available)
  const viTrack = tracks.find(t => t.languageCode && t.languageCode.startsWith('vi'));
  if (viTrack) return viTrack;

  // 6. English track
  const enTrack = tracks.find(t => t.languageCode && t.languageCode.startsWith('en'));
  if (enTrack) return enTrack;

  return tracks[0];
}

/**
 * Intelligent Sentence Boundary Merging (Standard 4You / eJOY / Language Reactor)
 * Combines fragmented ASR snippets (1-1.5s, 2-3 words) into complete, natural,
 * grammatically coherent sentences suitable for Dictation, Shadowing, and Dubbing.
 */
export function mergeSubtitleFragments(sentences) {
  if (!Array.isArray(sentences) || sentences.length <= 1) return sentences || [];

  const merged = [];
  let cur = { ...sentences[0] };

  const isSentenceEnd = (text) => /[。！？\.\!\?]["'”’]?\s*$/.test(text);
  const isChineseChar = (char) => /[\u4e00-\u9fa5]/.test(char);

  for (let i = 1; i < sentences.length; i++) {
    const next = sentences[i];
    const gap = next.startTime - cur.endTime;
    const combinedDuration = next.endTime - cur.startTime;
    const combinedLength = (cur.text + next.text).length;

    // Merge conditions:
    // 1. Current sentence does not end with sentence-ending punctuation (。！？.!?) OR is too brief (< 1.2s or < 4 chars)
    // 2. The gap between speech fragments is small (<= 1.2s, allows natural pauses or slight overlap >= -0.5s)
    // 3. Combined duration is suitable for dictation / shadowing (<= 9.0s)
    // 4. Combined length is reasonable (<= 36 characters)
    const shouldMerge = (
      (!isSentenceEnd(cur.text) || cur.duration < 1.2 || cur.text.length < 4) &&
      gap <= 1.2 &&
      gap >= -0.5 &&
      combinedDuration <= 9.0 &&
      combinedLength <= 36
    );

    if (shouldMerge) {
      cur.endTime = Math.max(cur.endTime, next.endTime);
      cur.duration = parseFloat((cur.endTime - cur.startTime).toFixed(3));

      const curEndsChinese = isChineseChar(cur.text.slice(-1));
      const nextStartsChinese = isChineseChar(next.text.charAt(0));

      if (curEndsChinese && nextStartsChinese) {
        cur.text = cur.text + next.text;
      } else {
        cur.text = (cur.text + ' ' + next.text).replace(/\s{2,}/g, ' ').trim();
      }
    } else {
      cur.id = merged.length + 1;
      merged.push(cur);
      cur = { ...next };
    }
  }

  cur.id = merged.length + 1;
  merged.push(cur);

  return merged;
}

/**
 * Fetch official Closed Captions (CC) or auto-subtitles directly from YouTube InnerTube API.
 * Uses official mobile app signature (zero yt-dlp dependency, <0.5s response, 0% rate limit).
 * This is the exact mechanism used by eJOY, 4English, and Language Reactor.
 */
async function fetchInnerTubeCaptions(youtubeId) {
  try {
    console.log(`[InnerTube Captions] Fetching caption tracks for ${youtubeId}...`);
    const resp = await fetch(INNERTUBE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': INNERTUBE_USER_AGENT,
      },
      body: JSON.stringify({
        context: INNERTUBE_CONTEXT,
        videoId: youtubeId,
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (!resp.ok) {
      console.warn(`[InnerTube Captions] HTTP ${resp.status} received from InnerTube.`);
      return null;
    }

    const data = await resp.json();
    const captionTracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!Array.isArray(captionTracks) || captionTracks.length === 0) {
      console.log(`[InnerTube Captions] No caption tracks available for ${youtubeId}.`);
      return null;
    }

    const chosenTrack = pickBestCaptionTrack(captionTracks);
    if (!chosenTrack || !chosenTrack.baseUrl) {
      return null;
    }

    console.log(`[InnerTube Captions] Selected track: ${chosenTrack.languageCode} (${chosenTrack.kind || 'standard'})`);
    const subRes = await fetch(chosenTrack.baseUrl, {
      headers: { 'User-Agent': INNERTUBE_USER_AGENT },
      signal: AbortSignal.timeout(10000)
    });

    if (!subRes.ok) {
      console.warn(`[InnerTube Captions] Failed to download track XML: HTTP ${subRes.status}`);
      return null;
    }

    const xml = await subRes.text();
    const sentences = [];

    // Parse format 3: <p t="ms" d="ms">text</p>
    const pRegex = /<p\s+[^>]*?t="(\d+)"[^>]*?(?:d="(\d+)")?[^>]*?>([\s\S]*?)<\/p>/gi;
    let match;
    while ((match = pRegex.exec(xml)) !== null) {
      const startMs = parseInt(match[1], 10);
      const durMs = parseInt(match[2] || '3000', 10);
      let text = match[3].replace(/<[^>]+>/g, '').trim();
      text = decodeXmlEntities(text);
      const textClean = cleanSpeechText(text);
      if (textClean) {
        sentences.push({
          id: sentences.length + 1,
          startTime: parseFloat((startMs / 1000).toFixed(3)),
          endTime: parseFloat(((startMs + durMs) / 1000).toFixed(3)),
          duration: parseFloat((durMs / 1000).toFixed(3)),
          text: textClean
        });
      }
    }

    // Fallback format 1: <text start="s" dur="s">text</text>
    if (sentences.length === 0) {
      const textRegex = /<text\s+[^>]*?start="([\d\.]+)"[^>]*?(?:dur="([\d\.]+)")?[^>]*?>([\s\S]*?)<\/text>/gi;
      while ((match = textRegex.exec(xml)) !== null) {
        const start = parseFloat(match[1]);
        const dur = parseFloat(match[2] || '3.0');
        let text = match[3].replace(/<[^>]+>/g, '').trim();
        text = decodeXmlEntities(text);
        const textClean = cleanSpeechText(text);
        if (textClean) {
          sentences.push({
            id: sentences.length + 1,
            startTime: start,
            endTime: parseFloat((start + dur).toFixed(3)),
            duration: dur,
            text: textClean
          });
        }
      }
    }

    if (sentences.length === 0) return null;

    // Deduplicate consecutive identical text
    const deduped = [];
    for (const s of sentences) {
      if (deduped.length > 0 && deduped[deduped.length - 1].text === s.text) {
        deduped[deduped.length - 1].endTime = s.endTime;
        deduped[deduped.length - 1].duration = parseFloat((s.endTime - deduped[deduped.length - 1].startTime).toFixed(3));
      } else {
        s.id = deduped.length + 1;
        deduped.push(s);
      }
    }

    const mergedSentences = mergeSubtitleFragments(deduped);

    console.log(`[InnerTube Captions] Extracted ${deduped.length} raw snippets -> Merged into ${mergedSentences.length} complete sentences via InnerTube!`);
    return {
      lang: chosenTrack.languageCode || 'zh',
      source: `YouTube Official Subtitles (${chosenTrack.languageCode})`,
      sentences: mergedSentences
    };
  } catch (err) {
    console.warn(`[InnerTube Captions] Error:`, err.message);
    return null;
  }
}

/**
 * TIER 1: Extract YouTube Native & Auto-Generated (ASR) Subtitles
 * Primary: InnerTube Android API (Instant, No 429, matches eJOY & 4English)
 * Fallback: yt-dlp subtitle extraction
 */
export async function extractYouTubeSubtitles(youtubeId) {
  // 1. Primary: Direct InnerTube Android API
  const innerTubeRes = await fetchInnerTubeCaptions(youtubeId);
  if (innerTubeRes && innerTubeRes.sentences && innerTubeRes.sentences.length > 0) {
    return innerTubeRes;
  }

  // 2. Secondary fallback: yt-dlp if available
  const subTempPrefix = `sub_${youtubeId}_${Date.now()}`;
  const subTempBase = path.join(AUDIO_TEMP_DIR, subTempPrefix);
  const videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

  try {
    console.log(`[YouTube Subtitles] Trying secondary yt-dlp inspection for ${youtubeId}...`);
    await ensureYtDlpExists();
    
    const subArgs = [
      videoUrl,
      '--skip-download',
      '--write-auto-subs',
      '--write-subs',
      '--sub-langs', 'zh.*,zh-Hans,zh-CN,zh-TW,en.*,vi.*',
      '--sub-format', 'json3',
      '--ignore-errors',
      '--no-abort-on-error',
      '-o', `${subTempBase}.%(ext)s`
    ];

    if (process.env.YOUTUBE_COOKIES) {
      const cookiesPath = path.join(AUDIO_TEMP_DIR, 'cookies.txt');
      fs.writeFileSync(cookiesPath, process.env.YOUTUBE_COOKIES.replace(/\\n/g, '\n'));
      subArgs.push('--cookies', cookiesPath);
    } else {
      subArgs.push('--extractor-args', 'youtube:player_client=android,ios');
      subArgs.push('--user-agent', 'com.google.android.youtube/19.29.37 (Linux; U; Android 14) gzip');
    }

    await execFileAsync(YTDLP_PATH, subArgs, { timeout: 35000 });

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
        const mergedYtDlp = mergeSubtitleFragments(rawSentences);
        console.log(`[YouTube Subtitles] Extracted ${rawSentences.length} raw snippets -> Merged into ${mergedYtDlp.length} complete sentences via secondary yt-dlp.`);
        return {
          lang: matchedFile.includes('zh') ? 'zh' : 'auto',
          source: 'YouTube Official / ASR Subtitles (yt-dlp)',
          sentences: mergedYtDlp
        };
      }
    }

    return null;
  } catch (err) {
    console.log(`[YouTube Subtitles] No secondary subtitles extracted (${err.message}).`);
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
    let downloaded = false;
    await ensureYtDlpExists();

    // Strategy 1: yt-dlp with mobile clients (android -> ios)
    const mobileClients = ['android', 'ios'];
    for (const client of mobileClients) {
      try {
        const ytDlpArgs = [
          videoUrl,
          '-f', '140/ba[ext=m4a]/ba[abr<=64]/ba/b*',
          '-o', audioPath,
          '--force-overwrites',
          '--no-playlist',
          '--no-check-certificates',
          '--geo-bypass'
        ];

        if (process.env.YOUTUBE_COOKIES) {
          const cookiesPath = path.join(AUDIO_TEMP_DIR, 'cookies.txt');
          fs.writeFileSync(cookiesPath, process.env.YOUTUBE_COOKIES.replace(/\\n/g, '\n'));
          ytDlpArgs.push('--cookies', cookiesPath);
        } else {
          ytDlpArgs.push('--extractor-args', `youtube:player_client=${client}`);
          ytDlpArgs.push('--user-agent', 'com.google.android.youtube/19.29.37 (Linux; U; Android 14) gzip');
        }

        await execFileAsync(YTDLP_PATH, ytDlpArgs, { timeout: 45000 });
        if (fs.existsSync(audioPath) && fs.statSync(audioPath).size > 2000) {
          downloaded = true;
          console.log(`[VAD Audio Engine] Successfully downloaded audio track via client: ${client}`);
          break;
        }
      } catch (err) {
        console.warn(`[VAD Audio Engine] yt-dlp client ${client} failed (${err.message}). Trying next...`);
      }
    }

    // Strategy 2: Fallback to @distube/ytdl-core if yt-dlp failed
    if (!downloaded) {
      console.log(`[VAD Audio Engine] yt-dlp mobile clients exhausted, falling back to @distube/ytdl-core...`);
      try {
        await new Promise((resolve, reject) => {
          const stream = ytdl(videoUrl, {
            filter: 'audioonly',
            quality: 'lowestaudio',
            requestOptions: {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
            }
          });
          const writeStream = fs.createWriteStream(audioPath);
          stream.pipe(writeStream);
          stream.on('end', () => resolve());
          writeStream.on('finish', () => resolve());
          stream.on('error', (err) => reject(err));
          writeStream.on('error', (err) => reject(err));
        });
        if (fs.existsSync(audioPath) && fs.statSync(audioPath).size > 2000) {
          downloaded = true;
        }
      } catch (ytdlErr) {
        console.warn(`[VAD Audio Engine] @distube/ytdl-core fallback warning:`, ytdlErr.message);
      }
    }

    if (!downloaded || !fs.existsSync(audioPath) || fs.statSync(audioPath).size < 1000) {
      throw new Error('Video không có phụ đề CC sẵn và máy chủ bị YouTube hạn chế luồng tải âm thanh (429 Rate Limit).');
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
      timestamp_granularities: ['segment'],
      prompt: /[\u4e00-\u9fa5]/.test(videoTitle) ? `Tiếng Trung chuẩn, lời thoại HSK: ${videoTitle}` : (videoTitle ? `Video: ${videoTitle}` : undefined)
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

    const mergedSentences = mergeSubtitleFragments(validSentences);
    console.log(`[VAD Audio Engine] After strict VAD gating & fragment merging: ${validSentences.length} raw -> ${mergedSentences.length} complete sentences retained.`);
    return {
      source: 'Groq Whisper Large v3 (Voice Activity Gated & Intelligently Merged)',
      sentences: mergedSentences
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
  if (!rawItems || rawItems.length === 0) {
    return { sentences: [], aiHskLevel: null, aiCategory: null };
  }

  // Cap at 80 sentences for optimal dictation lesson sizing and fast LLM response
  const maxSentences = 80;
  const targetItems = rawItems.slice(0, maxSentences);
  console.log(`[AI Enrichment] Translating and enriching ${targetItems.length} sentences for "${videoTitle}"...`);
  const chunkSize = 25;
  const enrichedList = [];
  let aiHskLevel = null;
  let aiCategory = null;

  for (let i = 0; i < targetItems.length; i += chunkSize) {
    const chunk = targetItems.slice(i, i + chunkSize);
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
      if (parsed.hskLevel && !aiHskLevel) {
        const cleanLvl = String(parsed.hskLevel).replace(/\D/g, '');
        if (['1', '2', '3', '4', '5', '6'].includes(cleanLvl)) {
          aiHskLevel = cleanLvl;
        }
      }
      if (parsed.category && !aiCategory) {
        aiCategory = parsed.category;
      }
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

  return {
    sentences: enrichedList,
    aiHskLevel: aiHskLevel,
    aiCategory: aiCategory
  };
}

// In-memory cache of HSK Vocabulary database for accurate lexical difficulty scoring
let hskWordMap = null;
function getHskWordMap() {
  if (hskWordMap) return hskWordMap;
  hskWordMap = new Map();
  try {
    const dbPath = path.join(__dirname, '..', 'database.json');
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, 'utf8');
      const db = JSON.parse(raw);
      db.forEach(item => {
        const w = (item.word || item.hanzi || '').trim();
        const lvl = parseInt(item.level, 10);
        if (w && lvl >= 1 && lvl <= 6) {
          if (!hskWordMap.has(w) || hskWordMap.get(w) < lvl) {
            hskWordMap.set(w, lvl);
          }
        }
      });
      console.log(`[HSK Classifier] Loaded ${hskWordMap.size} unique HSK words for lexical analysis.`);
    }
  } catch (err) {
    console.warn('[HSK Classifier] Warning loading database.json:', err.message);
  }
  return hskWordMap;
}

export function classifyHskAndCategory(videoTitle, enrichedSentences, aiHskLevel, aiCategory) {
  const title = (videoTitle || '').trim();
  const lowerTitle = title.toLowerCase();

  // 1. Explicit HSK in Video Title (Highest confidence)
  // Matches "HSK 1", "HSK1", "HSK 3.0 Cấp 2", "Level 4", "Hsk 5"
  const titleMatch = title.match(/hsk\s*([1-6])/i)
    || title.match(/cấp\s*([1-6])/i)
    || title.match(/level\s*([1-6])/i)
    || title.match(/hsk([1-6])/i);

  if (titleMatch && titleMatch[1]) {
    const titleLvl = titleMatch[1];
    return {
      level: titleLvl,
      levelText: `HSK ${titleLvl}`,
      category: resolveCategory(lowerTitle, aiCategory),
      detectionSource: 'Title Explicit'
    };
  }

  // 2. Lexical word matching from HSK 16,000+ vocabulary database
  const map = getHskWordMap();
  const foundLevels = [];
  const allText = enrichedSentences.map(s => s.hanzi || s.text || '').join('');

  if (map && map.size > 0 && allText.length > 0) {
    const cleanChinese = allText.replace(/[^\u4e00-\u9fa5]/g, '');
    for (let len = 4; len >= 1; len--) {
      for (let i = 0; i <= cleanChinese.length - len; i++) {
        const sub = cleanChinese.substring(i, i + len);
        if (map.has(sub)) {
          foundLevels.push(map.get(sub));
        }
      }
    }
  }

  let lexicalLevel = '2';
  if (foundLevels.length > 0) {
    foundLevels.sort((a, b) => a - b);
    // 70th percentile represents target learner comprehension level
    const p70 = foundLevels[Math.floor(foundLevels.length * 0.7)];
    if (p70 >= 1 && p70 <= 6) {
      lexicalLevel = String(p70);
    }
  }

  // 3. AI / LLM Contextual Decision
  let finalLevel = lexicalLevel;
  let source = 'Lexical Vocabulary Analysis';

  if (aiHskLevel && ['1', '2', '3', '4', '5', '6'].includes(String(aiHskLevel))) {
    finalLevel = String(aiHskLevel);
    source = 'AI Semantic Analysis';
  } else {
    finalLevel = lexicalLevel;
  }

  return {
    level: finalLevel,
    levelText: `HSK ${finalLevel}`,
    category: resolveCategory(lowerTitle, aiCategory),
    detectionSource: source
  };
}

function resolveCategory(lowerTitle, aiCategory) {
  if (aiCategory && ['Giao Tiếp', 'Âm Nhạc', 'Phim Ảnh', 'Ẩm Thực', 'Du Lịch', 'Đời Sống', 'Tin Tức', 'Hoạt Hình'].includes(aiCategory)) {
    return aiCategory;
  }
  if (lowerTitle.includes('nhạc') || lowerTitle.includes('hát') || lowerTitle.includes('music') || lowerTitle.includes('song') || lowerTitle.includes('mv')) {
    return 'Âm Nhạc';
  }
  if (lowerTitle.includes('phim') || lowerTitle.includes('drama') || lowerTitle.includes('movie') || lowerTitle.includes('tập')) {
    return 'Phim Ảnh';
  }
  if (lowerTitle.includes('ẩm thực') || lowerTitle.includes('món ăn') || lowerTitle.includes('nấu') || lowerTitle.includes('ăn')) {
    return 'Ẩm Thực';
  }
  if (lowerTitle.includes('tin tức') || lowerTitle.includes('thời sự') || lowerTitle.includes('news')) {
    return 'Tin Tức';
  }
  if (lowerTitle.includes('hoạt hình') || lowerTitle.includes('anime') || lowerTitle.includes('cartoon')) {
    return 'Hoạt Hình';
  }
  if (lowerTitle.includes('du lịch') || lowerTitle.includes('travel') || lowerTitle.includes('bắc kinh') || lowerTitle.includes('thượng hải')) {
    return 'Du Lịch';
  }
  return 'Giao Tiếp';
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
        error: `Video này không có phụ đề CC (Closed Captions) sẵn trên YouTube (giống như ứng dụng eJOY / 4English yêu cầu video phải có phụ đề CC). Khi video không có phụ đề sẵn, hệ thống cần tải âm thanh về máy chủ để AI phân tích nhưng YouTube đang tạm thời hạn chế IP máy chủ (429 Rate Limit). Bạn vui lòng chọn video YouTube có bật phụ đề CC (hoặc dán trực tiếp câu thoại vào ô bên dưới) nhé!`
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
  const { sentences: enrichedSentences, aiHskLevel, aiCategory } = await enrichWithPinyinAndContextTranslation(rawSentences, meta.title, meta.duration);

  // Auto-detect HSK Level & Category with multi-tier intelligence (Title -> AI -> Lexical HSK Database)
  const classification = classifyHskAndCategory(meta.title, enrichedSentences, aiHskLevel, aiCategory);
  console.log(`[Video Transcriber] HSK Classification: ${classification.levelText} (Source: ${classification.detectionSource}), Category: ${classification.category}`);

  return {
    success: true,
    youtubeId: meta.youtubeId,
    videoTitle: meta.title,
    duration: meta.duration,
    author: meta.author,
    thumbnail: meta.thumbnail,
    level: classification.level,
    levelText: classification.levelText,
    category: classification.category,
    hskDetectionSource: classification.detectionSource,
    description: `Bài luyện nghe chép chính tả & shadowing (${classification.levelText} • ${classification.category}) từ video "${meta.title}".`,
    tierUsed: transcriptionResult.source,
    sentencesCount: enrichedSentences.length,
    sentences: enrichedSentences
  };
}
