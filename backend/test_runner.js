import dotenv from 'dotenv';
dotenv.config();

const { extractYouTubeDictation } = await import('./server.js');

console.log('--- STARTING DICTATION EXTRACTION TEST FOR EWQF91YETFM ---');
try {
  const result = await extractYouTubeDictation('EWQF91YETFM');
  console.log('\n=============================================');
  console.log('RESULT SUMMARY:');
  console.log('Video Title:', result.videoTitle);
  console.log('Duration:', result.duration, 'seconds');
  console.log('Tier Used:', result.tierUsed);
  console.log('Total Sentences Extracted:', result.sentences ? result.sentences.length : 0);
  console.log('=============================================\n');

  if (result.sentences && result.sentences.length > 0) {
    console.log('EXTRACTED SENTENCES (FULL LIST):');
    result.sentences.forEach((s, idx) => {
      console.log(`${idx + 1}. [${s.startTime.toFixed(3)}s -> ${s.endTime.toFixed(3)}s]`);
      console.log(`   Hanzi:      ${s.hanzi}`);
      console.log(`   Pinyin:     ${s.pinyin}`);
      console.log(`   Vietnamese: ${s.meaning}`);
      console.log('---------------------------------------------');
    });
  } else {
    console.log('No sentences returned or error payload:', result);
  }
} catch (err) {
  console.error('Extraction Error:', err);
}
