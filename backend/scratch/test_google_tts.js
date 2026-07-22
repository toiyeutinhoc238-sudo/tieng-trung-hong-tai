// Test Google Translate TTS for Chinese (free, no auth needed)
import https from 'https';
import { createWriteStream } from 'fs';

const text = '你好，欢迎学习汉语';

// Google Translate TTS - zh-CN
const url = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(text) + '&tl=zh-CN&total=1&idx=0&textlen=' + text.length + '&client=tw-ob';

const req = https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://translate.google.com/'
  }
}, res => {
  const chunks = [];
  res.on('data', d => chunks.push(d));
  res.on('end', () => {
    const buf = Buffer.concat(chunks);
    console.log('Google TTS status:', res.statusCode, 'bytes:', buf.length);
    if (buf.length > 1000) {
      import('fs').then(fs => fs.writeFileSync('test_google_zh.mp3', buf));
      console.log('Saved to test_google_zh.mp3');
    }
  });
});
req.on('error', err => console.error('Error:', err.message));
