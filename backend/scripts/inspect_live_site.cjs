const https = require('https');

https.get('https://tiengtrunghongtai.online/', res => {
  console.log('Status:', res.statusCode);
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    const lines = body.split('\n');
    lines.slice(0, 40).forEach((l, i) => {
      if (l.includes('canonical') || l.includes('robots') || l.includes('og:') || l.includes('title')) {
        console.log(`Line ${i + 1}: ${l.trim()}`);
      }
    });
  });
});
