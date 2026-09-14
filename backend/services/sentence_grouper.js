import fs from 'fs';

// Group words into natural sentence chunks
export function groupWordsIntoSentences(words, maxWordsPerSentence = 8, pauseThresholdMs = 700) {
  if (!words || words.length === 0) return [];
  const sentences = [];
  let curChunk = [];

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    curChunk.push(w);

    const nextW = words[i + 1];
    const isPause = nextW && (nextW.start - w.end >= pauseThresholdMs);
    const hasPunctuation = /[.?!;]$/.test(w.text);
    const isTooLong = curChunk.length >= maxWordsPerSentence;
    const isPunctuationPause = hasPunctuation && curChunk.length >= 3;

    if (!nextW || isPause || isPunctuationPause || isTooLong) {
      const startTime = curChunk[0].start / 1000;
      let endTime = curChunk[curChunk.length - 1].end / 1000;
      if (endTime - startTime < 1.5) {
        endTime = parseFloat((startTime + 2.0).toFixed(3));
      }
      const text = curChunk.map(item => item.text).join(' ').trim();
      if (text.length > 0) {
        sentences.push({
          id: sentences.length + 1,
          startTime: parseFloat(startTime.toFixed(3)),
          endTime: parseFloat(endTime.toFixed(3)),
          duration: parseFloat((endTime - startTime).toFixed(3)),
          text: text
        });
      }
      curChunk = [];
    }
  }

  return sentences;
}
