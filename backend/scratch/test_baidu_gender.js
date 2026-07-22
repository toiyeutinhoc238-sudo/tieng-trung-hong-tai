import https from 'https';
const text = '你好，欢迎学习汉语';

function test(per, label) {
  const url = 'https://tts.baidu.com/text2audio?tex=' + encodeURIComponent(text) + '&lan=ZH&cuid=bdtts_free&ctp=1&pdt=301&vol=9&per=' + per + '&spd=4';
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://fanyi.baidu.com/' } }, res => {
    const chunks = [];
    res.on('data', d => chunks.push(d));
    res.on('end', () => console.log(label + ' (per=' + per + '): status=' + res.statusCode + ' bytes=' + Buffer.concat(chunks).length));
  }).on('error', err => console.error(label, err.message));
}

test(0, 'Nu (Female)');
setTimeout(() => test(1, 'Nam (Male)'), 500);
