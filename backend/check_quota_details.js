import fs from 'fs/promises';

async function main() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }]
      })
    });
    console.log(`Status: ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.log(text);
  } catch (e) {
    console.error(e);
  }
}

main();
