import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import fs from 'fs/promises';

async function testSSML() {
  const tts = new MsEdgeTTS();
  await tts.setMetadata('zh-CN-YunyangNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">
    <voice name="zh-CN-YunyangNeural">
      <mstts:express-as style="narration-professional">
        <prosody pitch="-4Hz" rate="0%">
          你好，我是专业男声发音
        </prosody>
      </mstts:express-as>
    </voice>
  </speak>`;

  const { audioStream } = tts.toStream(ssml);
  const chunks = [];
  audioStream.on('data', d => chunks.push(d));
  audioStream.on('close', async () => {
    const buf = Buffer.concat(chunks);
    console.log('Generated SSML Yunyang MP3 size:', buf.length);
    await fs.writeFile('test_ssml_yunyang.mp3', buf);
  });
}

testSSML();
