import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        detail: resolve(__dirname, 'detail-list.html'),
        history: resolve(__dirname, 'chat-history.html'),
        quiz: resolve(__dirname, 'quiz-game.html'),
        lesson: resolve(__dirname, 'lesson-online.html'),
        rules: resolve(__dirname, 'han-viet-rules.html'),
        grammar: resolve(__dirname, 'hsk-grammar.html'),
        phonetics: resolve(__dirname, 'chinese-phonetics.html'),
        radicals: resolve(__dirname, 'chinese-radicals.html'),
        hanzi: resolve(__dirname, 'hanzi-writer.html'),
        texts: resolve(__dirname, 'lesson-texts.html'),
        reading: resolve(__dirname, 'reading-practice.html'),
        rank: resolve(__dirname, 'rank.html'),
        dictation: resolve(__dirname, 'video-dictation.html')
      }
    }
  }
});
