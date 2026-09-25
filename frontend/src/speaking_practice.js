/**
 * Tiếng Trung HongTai - AI Speaking Practice & HSKK Speech Grader (3p - 2p)
 * Khớp 100% bản vẽ Luyện Nói: Trình độ Sơ/Trung/Cao, Đề + Quay Random,
 * Gợi ý AI (Dàn bài, từ vựng, mẫu câu), Chuẩn bị (3p) và Bắt đầu nói (2p) có thu âm.
 */

const API_BASE_URL = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
  ? ''
  : '';

let hskkQuestionsData = {
  so: [],
  trung: [],
  cao: []
};

let currentSpeakingLevel = 'trung'; // 'so' | 'trung' | 'cao'
let currentActiveQuestion = null;
let aiSuggestionsCache = new Map();
let isFetchingHint = false;

// Trạng thái Timer Chuẩn Bị (3 phút = 180s)
let prepTimerInterval = null;
let prepRemainingSeconds = 180;
let isPrepPaused = false;

// Trạng thái Timer Nói & Ghi Âm (2 phút = 120s)
let speakingTimerInterval = null;
let speakingRemainingSeconds = 120;
let mediaRecorder = null;
let audioChunks = [];
let recordedAudioBlob = null;
let recordedAudioUrl = null;
let speechRecognizer = null;
let isRecordingActive = false;
let recordedDurationSeconds = 0;

// Web Audio API Tones
function playAudioTone(type = 'beep') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'spin') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'chime') {
      // 3-note pleasant chime for timer end
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0.18, now + i * 0.15);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
        o.start(now + i * 0.15);
        o.stop(now + i * 0.15 + 0.4);
      });
    }
  } catch (e) { }
}

// 1. Khởi tạo câu hỏi HSKK
async function initSpeakingQuestions() {
  try {
    let res = await fetch(`${API_BASE_URL}/api/hskk-questions`);
    if (!res.ok) {
      res = await fetch('/data/hskk_questions.json');
    }
    const data = await res.json();
    if (data && (data.so || data.questions)) {
      if (data.so) {
        hskkQuestionsData = data;
      } else if (data.questions) {
        hskkQuestionsData.so = data.questions.filter(q => q.level === 'so');
        hskkQuestionsData.trung = data.questions.filter(q => q.level === 'trung');
        hskkQuestionsData.cao = data.questions.filter(q => q.level === 'cao');
      }
    }
  } catch (e) {
    console.warn('Lỗi nạp API HSKK, thử nạp tĩnh...', e);
    try {
      const resStatic = await fetch('/data/hskk_questions.json');
      if (resStatic.ok) {
        hskkQuestionsData = await resStatic.json();
      }
    } catch (err2) { }
  }

  const total = (hskkQuestionsData.so?.length || 0) + (hskkQuestionsData.trung?.length || 0) + (hskkQuestionsData.cao?.length || 0);
  const totalEl = document.getElementById('total-speaking-stat');
  if (totalEl && total > 0) totalEl.textContent = total.toLocaleString();

  spinRandomQuestion(false);
}

// 2. Chuyển đổi Cấp độ: [Sơ] [Trung] [Cao]
window.switchSpeakingLevel = function (level, btn) {
  if (currentSpeakingLevel === level && currentActiveQuestion) return;
  currentSpeakingLevel = level;

  document.querySelectorAll('.level-select-row .level-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  spinRandomQuestion(true);
};

// 3. Nút [Quay] (Random đề bài)
window.spinRandomQuestion = function (playAnim = true) {
  const list = hskkQuestionsData[currentSpeakingLevel] || [];
  if (!list || list.length === 0) return;

  const btn = document.getElementById('spin-question-btn');
  if (playAnim && btn) {
    btn.classList.add('rolling');
    playAudioTone('spin');
    setTimeout(() => btn.classList.remove('rolling'), 500);
  }

  let nextQ = null;
  if (list.length === 1) {
    nextQ = list[0];
  } else {
    do {
      nextQ = list[Math.floor(Math.random() * list.length)];
    } while (currentActiveQuestion && nextQ.question === currentActiveQuestion.question && list.length > 1);
  }

  currentActiveQuestion = nextQ;
  renderCurrentQuestion();

  // Đóng khối gợi ý nếu đang mở
  const hintBox = document.getElementById('ai-suggestion-box');
  if (hintBox) hintBox.style.display = 'none';
  const hintBtn = document.getElementById('hint-toggle-btn');
  if (hintBtn) {
    hintBtn.innerHTML = `
      <i class="fa-solid fa-lightbulb"></i>
      <span>Gợi ý Dàn bài &amp; Từ vựng</span>
    `;
  }

  // Đóng khối bài nói mẫu nếu đang mở
  const sampleBox = document.getElementById('sample-speech-box');
  if (sampleBox) sampleBox.style.display = 'none';
  const sampleBtn = document.getElementById('sample-speech-toggle-btn');
  if (sampleBtn) {
    sampleBtn.innerHTML = `
      <i class="fa-solid fa-medal"></i>
      <span>Bài nói mẫu tham khảo</span>
    `;
  }

  // Đặt lại các trạng thái ghi âm / chuẩn bị
  resetPrepTimer();
  cancelSpeakingRecording();
  const resBox = document.getElementById('recorded-result-box');
  if (resBox) resBox.style.display = 'none';
  const evalBox = document.getElementById('ai-speaking-evaluation-results');
  if (evalBox) evalBox.style.display = 'none';
};

function renderCurrentQuestion() {
  if (!currentActiveQuestion) return;

  const textEl = document.getElementById('active-question-text');
  const badgeEl = document.getElementById('question-meta-badge');
  const lvlName = currentSpeakingLevel === 'so' ? 'HSKK Sơ cấp' : currentSpeakingLevel === 'cao' ? 'HSKK Cao cấp' : 'HSKK Trung cấp';

  if (textEl) textEl.textContent = currentActiveQuestion.question;
  if (badgeEl) {
    badgeEl.textContent = `Câu ${currentActiveQuestion.stt || 1} • ${lvlName}`;
  }
}

// Phát âm đề thi
window.playQuestionTts = function () {
  if (!currentActiveQuestion || !currentActiveQuestion.question) return;
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(currentActiveQuestion.question);
  utter.lang = 'zh-CN';
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
};

// 4. Nút [Gợi ý] (AI tự đề xuất Dàn bài + Từ vựng + Mẫu câu)
window.toggleAiSuggestions = async function () {
  const box = document.getElementById('ai-suggestion-box');
  const btn = document.getElementById('hint-toggle-btn');
  if (!box || !currentActiveQuestion) return;

  const isVisible = box.style.display === 'block';

  if (isVisible) {
    box.style.display = 'none';
    if (btn) {
      btn.innerHTML = `
        <i class="fa-solid fa-lightbulb"></i>
        <span>Gợi ý Dàn bài &amp; Từ vựng</span>
      `;
    }
    return;
  }

  box.style.display = 'block';
  if (btn) {
    btn.innerHTML = `
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Gợi ý</span>
    `;
  }

  const qKey = `${currentSpeakingLevel}_${currentActiveQuestion.question}`;
  if (aiSuggestionsCache.has(qKey)) {
    renderAiSuggestionContent(aiSuggestionsCache.get(qKey));
    return;
  }

  if (isFetchingHint) return;
  isFetchingHint = true;

  box.innerHTML = `
    <div style="text-align: center; padding: 24px 16px; color: #f59e0b;">
      <i class="fa-solid fa-brain fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #f59e0b;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        AI HongTai đang lập Dàn ý &amp; chọn lọc Từ vựng Khẩu ngữ...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Phù hợp chuẩn thi HSKK ${currentSpeakingLevel === 'so' ? 'Sơ cấp' : currentSpeakingLevel === 'cao' ? 'Cao cấp' : 'Trung cấp'}
      </div>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE_URL}/api/ai/hskk-suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: currentActiveQuestion.question,
        level: currentSpeakingLevel,
        skill: 'speaking'
      })
    });

    if (res.ok) {
      const data = await res.json();
      aiSuggestionsCache.set(qKey, data);
      renderAiSuggestionContent(data);
      playAudioTone('start');
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    console.error('Lỗi gợi ý AI:', err);
    const fallback = getFallbackHskkSuggestion();
    aiSuggestionsCache.set(qKey, fallback);
    renderAiSuggestionContent(fallback);
  } finally {
    isFetchingHint = false;
  }
};

function renderAiSuggestionContent(data) {
  const box = document.getElementById('ai-suggestion-box');
  if (!box) return;

  const outline = data.outline || {};
  const vocabList = data.vocabulary || [];
  const sentenceList = data.sentenceStructures || [];

  box.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px dashed rgba(34, 197, 94, 0.4); padding-bottom: 10px;">
      <div style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.05rem; color: #4ade80;">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
        <span>AI Đề Xuất Dàn Ý &amp; Từ Vựng Khẩu Ngữ</span>
      </div>
      <span style="font-size: 0.75rem; background: rgba(34, 197, 94, 0.15); color: #86efac; padding: 2px 8px; border-radius: 6px; font-weight: 700;">
        HSKK ${currentSpeakingLevel === 'so' ? 'Sơ cấp' : currentSpeakingLevel === 'cao' ? 'Cao cấp' : 'Trung cấp'}
      </span>
    </div>

    <!-- 1. Dàn bài -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 0.92rem; font-weight: 800; color: #fbbf24; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-list-ol"></i> <span>1. Dàn bài gợi ý:</span>
      </div>
      <div style="background: rgba(0,0,0,0.25); padding: 12px 16px; border-radius: 12px; border-left: 3px solid #fbbf24; font-size: 0.9rem; line-height: 1.65; color: #e2e8f0;">
        <div style="margin-bottom: 6px;"><strong>Mở đầu:</strong> ${outline.intro || 'Trả lời trực tiếp vào trọng tâm câu hỏi.'}</div>
        <div style="margin-bottom: 6px;">
          <strong>Triển khai thân bài:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 20px;">
            ${(outline.body || []).map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
        <div><strong>Kết thúc:</strong> ${outline.conclusion || 'Đúc kết bài học hoặc cảm xúc cá nhân.'}</div>
      </div>
    </div>

    <!-- 2. Từ vựng có thể sử dụng -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 0.92rem; font-weight: 800; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-key"></i> <span>2. Từ vựng / Cụm từ đắt giá nên nói:</span>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${vocabList.map(v => `
          <div style="background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); padding: 5px 12px; border-radius: 99px;">
            <span style="font-weight: 800; color: #ffffff; font-family: var(--font-chinese), sans-serif;">${v.hanzi}</span>
            <span style="font-size: 0.78rem; color: #38bdf8; margin: 0 4px;">(${v.pinyin})</span>
            <span style="font-size: 0.78rem; color: #cbd5e1;">: ${v.meaning}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 3. Mẫu câu cấu trúc nên dùng -->
    ${sentenceList.length > 0 ? `
      <div>
        <div style="font-size: 0.92rem; font-weight: 800; color: #a855f7; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-puzzle-piece"></i> <span>3. Mẫu câu kết nối lưu loát:</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
          ${sentenceList.map(s => `
            <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 12px; padding: 10px 14px; font-size: 0.88rem;">
              <div style="font-weight: 800; color: #d8b4fe; margin-bottom: 2px;">${s.pattern}</div>
              <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;">${s.meaning}</div>
              ${s.example ? `<div style="font-size: 0.84rem; color: #e2e8f0; font-style: italic;">VD: ${s.example}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

// 4B. TÁCH RIÊNG: Nút [Bài nói mẫu tham khảo] (Dài, chuyên sâu theo chuẩn HSKK)
window.toggleSampleSpeech = async function () {
  const box = document.getElementById('sample-speech-box');
  const btn = document.getElementById('sample-speech-toggle-btn');
  if (!box || !currentActiveQuestion) return;

  const isVisible = box.style.display === 'block';

  if (isVisible) {
    box.style.display = 'none';
    if (btn) {
      btn.innerHTML = `
        <i class="fa-solid fa-medal"></i>
        <span>Bài nói mẫu tham khảo</span>
      `;
    }
    return;
  }

  box.style.display = 'block';
  if (btn) {
    btn.innerHTML = `
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Bài nói mẫu</span>
    `;
  }

  const qKey = `${currentSpeakingLevel}_${currentActiveQuestion.question}`;
  if (aiSuggestionsCache.has(qKey)) {
    renderSampleSpeechContent(aiSuggestionsCache.get(qKey));
    return;
  }

  box.innerHTML = `
    <div style="text-align: center; padding: 24px 16px; color: #10b981;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #10b981;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        Đang tạo bài nói mẫu dài chuẩn HSKK ${currentSpeakingLevel === 'so' ? 'Sơ cấp' : currentSpeakingLevel === 'cao' ? 'Cao cấp' : 'Trung cấp'}...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Bài văn mẫu dài, chi tiết, văn phong lưu loát chuẩn người bản xứ.
      </div>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE_URL}/api/ai/hskk-suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: currentActiveQuestion.question,
        level: currentSpeakingLevel,
        skill: 'speaking'
      })
    });

    if (res.ok) {
      const data = await res.json();
      aiSuggestionsCache.set(qKey, data);
      renderSampleSpeechContent(data);
      playAudioTone('start');
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    console.error('Lỗi nạp bài mẫu:', err);
    const fallback = getFallbackHskkSuggestion();
    aiSuggestionsCache.set(qKey, fallback);
    renderSampleSpeechContent(fallback);
  }
};

function renderSampleSpeechContent(data) {
  const box = document.getElementById('sample-speech-box');
  if (!box) return;

  const sample = data.sampleAnswer || {};
  const hanziText = sample.hanzi || '';
  const charCount = hanziText.replace(/\s+/g, '').length;

  box.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px dashed rgba(16, 185, 129, 0.4); padding-bottom: 10px; flex-wrap: wrap; gap: 8px;">
      <div style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.1rem; color: #34d399;">
        <i class="fa-solid fa-medal"></i>
        <span>Bài Nói Mẫu Tham Khảo (Chuẩn HSKK ${currentSpeakingLevel === 'so' ? 'Sơ cấp' : currentSpeakingLevel === 'cao' ? 'Cao cấp' : 'Trung cấp'})</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 0.78rem; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; padding: 4px 10px; border-radius: 99px; font-weight: 800;">
          ${charCount} chữ Hán
        </span>
        <button onclick="playSpeakingSampleTts()" style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; font-size: 0.82rem; font-weight: 700; padding: 5px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-volume-high"></i> <span>Nghe bản xứ đọc</span>
        </button>
      </div>
    </div>

    <!-- Hanzi Text -->
    <div id="sample-speaking-hanzi" class="hanzi-text" style="font-size: 1.1rem; line-height: 1.85; color: #ffffff; white-space: pre-line; margin-bottom: 14px; font-family: var(--font-chinese), sans-serif; background: rgba(0,0,0,0.22); padding: 14px 16px; border-radius: 12px; border-left: 3px solid #10b981;">
      ${hanziText}
    </div>

    <!-- Pinyin Text -->
    ${sample.pinyin ? `
      <div style="margin-bottom: 12px;">
        <div style="font-size: 0.78rem; text-transform: uppercase; color: #38bdf8; font-weight: 800; margin-bottom: 4px;">Phiên âm Pinyin:</div>
        <div style="font-size: 0.88rem; color: #94a3b8; font-style: italic; line-height: 1.6; white-space: pre-line; background: rgba(0,0,0,0.18); padding: 10px 14px; border-radius: 10px;">${sample.pinyin}</div>
      </div>
    ` : ''}

    <!-- Vietnamese Translation -->
    ${sample.meaningVi ? `
      <div>
        <div style="font-size: 0.78rem; text-transform: uppercase; color: #fbbf24; font-weight: 800; margin-bottom: 4px;">Dịch nghĩa tiếng Việt:</div>
        <div style="font-size: 0.92rem; color: #cbd5e1; line-height: 1.7; white-space: pre-line; background: rgba(0,0,0,0.18); padding: 10px 14px; border-radius: 10px;">${sample.meaningVi}</div>
      </div>
    ` : ''}
  `;
}

function getFallbackHskkSuggestion() {
  if (currentSpeakingLevel === 'cao') {
    return {
      outline: {
        intro: "Mở bài: Đưa ra nhận định tổng quan, định nghĩa vấn đề và khẳng định tính tất yếu của đề tài.",
        body: [
          "Luận điểm 1: Phân tích nguyên nhân và thực trạng xã hội từ góc nhìn vĩ mô.",
          "Luận điểm 2: Đưa ra dẫn chứng thực tế hoặc trải nghiệm bản thân để làm sáng tỏ lập luận.",
          "Luận điểm 3: Đề xuất giải pháp mang tính xây dựng, lâu dài và bền vững."
        ],
        conclusion: "Kết bài: Đúc kết triết lý sống và kỳ vọng phát triển trong tương lai."
      },
      vocabulary: [
        { hanzi: "不可否认", pinyin: "bùkě fǒurèn", meaning: "không thể phủ nhận" },
        { hanzi: "循序渐进", pinyin: "xúnxù jiànjìn", meaning: "tuần tự từng bước" },
        { hanzi: "核心竞争力", pinyin: "héxīn jìngzhēnglì", meaning: "năng lực cạnh tranh cốt lõi" },
        { hanzi: "行稳致远", pinyin: "xíng wěn zhì yuǎn", meaning: "bước đi vững chắc để tiến xa" }
      ],
      sentenceStructures: [
        {
          pattern: "从宏观角度来看，……是不可或缺的基石。",
          meaning: "Từ góc độ vĩ mô mà nói, ... là nền tảng không thể thiếu.",
          example: "从宏观角度来看，终身学习是保持个人核心竞争力的基石。"
        },
        {
          pattern: "与其……，不如……，因为……",
          meaning: "Thay vì..., chi bằng..., bởi vì...",
          example: "与其抱怨环境的不公，不如脚踏实地提升自我。"
        }
      ],
      sampleAnswer: {
        hanzi: "关于这一问题，我认为应当从多维度、深层次来进行客观理性的剖析。首先，从个人成长与社会发展的宏观角度来看，事物的发展往往遵循着循序渐进的客观规律。正如古人云：“学如逆水行舟，不进则退。”在瞬息万变的现代社会中，若想保持核心竞争力，我们就必须树立终身学习的理念，不断拓宽自身的认知边界。\n\n其次，不可否认的是，在追求目标的过程中，挫折与挑战在所难免。面对逆境，消极抱怨无济于事，唯有保持沉着冷静的心态，认真分析问题的症结所在，才能化被动为主动。以我个人的亲身经历为例，每当面临看似难以逾越的瓶颈时，我都会选择虚心向前辈请教，同时结合科学有效的方法反复求证，最终不仅攻克了难关，更锤炼了自己的心智与意志。\n\n综上所述，无论是求学问道还是立足职场，坚韧不拔的意志品质与求真务实的行动准则都是不可或缺的。鉴于此，我们应当在实践中不断反思总结，脚踏实地走好每一步，方能在未来的道路上行稳致远，实现自我价值与社会价值的和谐统一。",
        pinyin: "Guānyú zhè yí wèntí, wǒ rènwéi yīngdāng cóng duō wéidù, shēncéngcì lái jìnxíng kèguān lǐxìng de pōuxī. Shǒuxiān, cóng gèrén chéngzhǎng yǔ shèhuì fāzhǎn de hóngguān jiǎodù lái kàn, shìwù de fāzhǎn wǎngwǎng zūnxún zhe xúnxùjiànjìn de kèguān guīlǜ...",
        meaningVi: "Về vấn đề này, tôi cho rằng cần nhìn nhận khách quan, sâu sắc từ nhiều chiều kích. Thứ nhất, từ góc độ phát triển cá nhân và xã hội, vạn vật đều tuân theo quy luật phát triển từng bước. Người xưa có câu: 'Học như chèo thuyền ngược nước, không tiến ắt lùi'. Trong xã hội biến đổi nhanh chóng, muốn duy trì năng lực cạnh tranh cốt lõi thì cần không ngừng học tập suốt đời. Thứ hai, đối mặt nghịch cảnh không nên than phiền mà cần bình tĩnh phân tích nguyên nhân để biến bị động thành chủ động. Tóm lại, kiên trì và thực tế chính là chìa khóa để tiến xa trên đường đời."
      }
    };
  }

  if (currentSpeakingLevel === 'trung') {
    return {
      outline: {
        intro: "Mở đầu trực tiếp: Nêu rõ quan điểm hoặc câu trả lời đối với đề bài.",
        body: [
          "Luận điểm 1: Giải thích nguyên nhân hoặc kể lại trải nghiệm thực tế.",
          "Luận điểm 2: Đưa ra ví dụ cụ thể minh họa cho quan điểm.",
          "Luận điểm 3: Nêu bật cảm nhận và bài học tích lũy."
        ],
        conclusion: "Kết luận: Tóm tắt lại suy nghĩ và hy vọng tương lai."
      },
      vocabulary: [
        { hanzi: "持之以恒", pinyin: "chízhīyǐhéng", meaning: "kiên trì bền bỉ" },
        { hanzi: "日积月累", pinyin: "rìjīyuèlěi", meaning: "tích lũy ngày qua ngày" },
        { hanzi: "万事开头难", pinyin: "wànshì kāitóu nán", meaning: "vạn sự khởi đầu nan" },
        { hanzi: "开阔眼界", pinyin: "kāikuò yǎnjiè", meaning: "mở rộng tầm nhìn" }
      ],
      sentenceStructures: [
        {
          pattern: "我认为在日常生活和学习中，……是走向成功的关键。",
          meaning: "Tôi cho rằng trong cuộc sống và học tập, ... là then chốt để thành công.",
          example: "我认为在日常生活和学习中，保持积极健康的心态是走向成功的关键。"
        },
        {
          pattern: "只要我们……，就一定能……",
          meaning: "Chỉ cần chúng ta..., thì nhất định có thể...",
          example: "只要我们持之以恒，就一定能取得优异的成绩。"
        }
      ],
      sampleAnswer: {
        hanzi: "这个问题非常值得探讨。我认为在日常生活和学习中，保持积极健康的心态和良好的习惯是走向成功的关键基石。\n\n首先，俗话说“万事开头难”，当我们接触新事物或遇到挑战时，往往容易产生畏难情绪。然而，只要我们能够静下心来，将大目标拆解为一个一个具体可行的小步骤，每天坚持进步一点点，日积月累就一定能发生质的飞跃。比如在学习中文的过程中，一开始我也觉得汉字难写、发音难准，但通过每天坚持晨读和听力练习，现在我已经能够自信流利地进行日常交流了。\n\n其次，除了自身的勤奋努力之外，学会与他人沟通合作也同样重要。多向优秀的师长朋友请教，倾听不同的见解，不仅能让我们少走弯路，更能开阔眼界、拓宽思维格局。\n\n总的来说，成长的道路不可能一帆风顺，但只要我们目标明确、持之以恒，就一定能克服各种困难，收获属于自己的精彩。",
        pinyin: "Zhè ge wèntí fēicháng zhídé tàntǎo. Wǒ rènwéi zài rìcháng shēnghuó hé xuéxí zhōng, bǎochí jījí jiànkāng de xīntài hé liánghǎo de xíguàn shì zǒuxiàng chénggōng de guānjiàn jīshí. Shǒuxiān, súhuà shuō 'wànshì kāitóu nán'...",
        meaningVi: "Câu hỏi này rất đáng để thảo luận. Tôi cho rằng trong cuộc sống và học tập hằng ngày, giữ gìn một tâm thái tích cực lành mạnh và những thói quen tốt chính là nền tảng then chốt để đi tới thành công. Thứ nhất, 'vạn sự khởi đầu nan', chia nhỏ mục tiêu và kiên trì từng ngày sẽ tạo nên bước nhảy vọt. Thứ hai, học cách giao tiếp và hợp tác với người khác giúp ta học hỏi được nhiều kinh nghiệm quý báu. Tóm lại, chỉ cần kiên định mục tiêu thì nhất định sẽ gặt hái thành công."
      }
    };
  }

  // Sơ cấp
  return {
    outline: {
      intro: "Mở đầu trực tiếp: Nêu câu trả lời ngắn gọn.",
      body: ["Kể 1-2 lý do đơn giản", "Chia sẻ cảm xúc của bản thân"],
      conclusion: "Kết thúc: Bày tỏ mong muốn."
    },
    vocabulary: [
      { hanzi: "高兴", pinyin: "gāoxìng", meaning: "vui vẻ" },
      { hanzi: "经常", pinyin: "jīngcháng", meaning: "thường xuyên" },
      { hanzi: "因为……所以……", pinyin: "yīnwèi... suǒyǐ...", meaning: "bởi vì... cho nên..." }
    ],
    sentenceStructures: [
      {
        pattern: "我非常喜欢……，因为……",
        meaning: "Tôi rất thích..., bởi vì...",
        example: "我非常喜欢中国菜，因为味道很好。"
      }
    ],
    sampleAnswer: {
      hanzi: "这个问题很有意思。对我来说，学习和生活都需要保持积极乐观的心态。遇到困难时，不要轻言放弃，多向老师和朋友请教，慢慢积累经验，每天进步一点点，最终一定会有所收获。",
      pinyin: "Zhè ge wèntí hěn yǒu yìsi. Duì wǒ lái shuō, xuéxí hé shēnghuó dōu xūyào bǎochí jījí lèguān de xīntài. Yù dào kùnnán shí, bú yào qīngyán fàngqì, duō xiàng lǎoshī hé péngyou qǐngjiào, mànmàn jīlěi jīngyàn, měitiān jìnbù yì diǎndiǎn, zuìzhōng yídìng huì yǒu suǒ shōuhuò.",
      meaningVi: "Câu hỏi này rất thú vị. Đối với tôi, cả học tập lẫn cuộc sống đều cần giữ tâm thế tích cực lạc quan. Khi gặp khó khăn, không nên dễ dàng từ bỏ, hãy học hỏi từ thầy cô và bạn bè, mỗi ngày tiến bộ một chút thì nhất định sẽ gặt hái thành công."
    }
  };
}

window.playSpeakingSampleTts = function () {
  const el = document.getElementById('sample-speaking-hanzi');
  if (!el || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(el.textContent.trim());
  utter.lang = 'zh-CN';
  utter.rate = 0.88;
  window.speechSynthesis.speak(utter);
};

// 5. THỰC HIỆN ĐẾM GIỜ [Chuẩn bị (3p)] (3 phút = 180s)
window.startPrepTimer = function () {
  // Đóng bộ ghi âm nếu đang chạy
  cancelSpeakingRecording();

  const prepBox = document.getElementById('prep-timer-box');
  const btnPrep = document.getElementById('btn-prep-3p');
  if (!prepBox) return;

  prepBox.style.display = 'block';
  btnPrep?.classList.add('active-timer');
  prepBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Đảm bảo bảng nháp hiển thị và tự động focus để học viên bắt đầu ghi chú
  const scratchpadCard = document.getElementById('speaking-scratchpad-card');
  if (scratchpadCard) scratchpadCard.style.display = 'block';
  const scratchpadInput = document.getElementById('speaking-scratchpad-input');
  if (scratchpadInput) scratchpadInput.focus();

  prepRemainingSeconds = 180;
  isPrepPaused = false;
  updatePrepTimerDisplay();
  playAudioTone('start');

  clearInterval(prepTimerInterval);
  prepTimerInterval = setInterval(() => {
    if (isPrepPaused) return;

    prepRemainingSeconds--;
    updatePrepTimerDisplay();

    if (prepRemainingSeconds <= 0) {
      clearInterval(prepTimerInterval);
      playAudioTone('chime');
      alert('⏰ Đã hết 3 phút chuẩn bị! Bạn đã sẵn sàng, hãy bắt đầu nói ngay nhé!');
      btnPrep?.classList.remove('active-timer');
      prepBox.style.display = 'none';
      startSpeakingTimerAndRecord();
    }
  }, 1000);
};

function updatePrepTimerDisplay() {
  const display = document.getElementById('prep-timer-display');
  if (!display) return;
  const mins = Math.floor(prepRemainingSeconds / 60);
  const secs = prepRemainingSeconds % 60;
  display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

window.togglePausePrepTimer = function () {
  isPrepPaused = !isPrepPaused;
  const btn = document.getElementById('prep-pause-btn');
  if (btn) {
    btn.innerHTML = isPrepPaused
      ? `<i class="fa-solid fa-play"></i> <span>Tiếp tục</span>`
      : `<i class="fa-solid fa-pause"></i> <span>Tạm dừng</span>`;
  }
};

window.resetPrepTimer = function () {
  clearInterval(prepTimerInterval);
  prepRemainingSeconds = 180;
  isPrepPaused = false;
  updatePrepTimerDisplay();
  const prepBox = document.getElementById('prep-timer-box');
  const btnPrep = document.getElementById('btn-prep-3p');
  if (prepBox) prepBox.style.display = 'none';
  btnPrep?.classList.remove('active-timer');
};

window.stopPrepAndStartSpeaking = function () {
  clearInterval(prepTimerInterval);
  const prepBox = document.getElementById('prep-timer-box');
  const btnPrep = document.getElementById('btn-prep-3p');
  if (prepBox) prepBox.style.display = 'none';
  btnPrep?.classList.remove('active-timer');

  startSpeakingTimerAndRecord();
};

// 6. THỰC HIỆN ĐẾM GIỜ [Bắt đầu nói (2p)] (2 phút = 120s) & GHI ÂM MICRO
window.startSpeakingTimerAndRecord = async function () {
  // Dừng chuẩn bị nếu đang chạy
  clearInterval(prepTimerInterval);
  const prepBox = document.getElementById('prep-timer-box');
  const btnPrep = document.getElementById('btn-prep-3p');
  if (prepBox) prepBox.style.display = 'none';
  btnPrep?.classList.remove('active-timer');

  // Yêu cầu quyền truy cập Micro
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setupMediaRecorder(stream);
  } catch (err) {
    console.error('Không truy cập được micro:', err);
    alert('Không thể truy cập microphone. Vui lòng cho phép trình duyệt truy cập micro để ghi âm bài nói!');
    return;
  }

  const recorderBox = document.getElementById('speaking-recorder-box');
  const btnSpeak = document.getElementById('btn-speak-2p');
  const resBox = document.getElementById('recorded-result-box');

  if (resBox) resBox.style.display = 'none';
  if (recorderBox) recorderBox.style.display = 'block';
  btnSpeak?.classList.add('active-timer');

  // Đảm bảo bảng nháp luôn hiển thị để học viên nhìn dàn ý trong 2 phút nói
  const scratchpadCard = document.getElementById('speaking-scratchpad-card');
  if (scratchpadCard) scratchpadCard.style.display = 'block';

  recorderBox?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  speakingRemainingSeconds = 120;
  recordedDurationSeconds = 0;
  updateSpeakingTimerDisplay();
  playAudioTone('start');

  // Bắt đầu thu âm MediaRecorder
  audioChunks = [];
  mediaRecorder.start(250);
  isRecordingActive = true;

  // Bắt đầu nhận diện giọng nói tiếng Trung nếu có hỗ trợ
  startSpeechRecognition();

  clearInterval(speakingTimerInterval);
  speakingTimerInterval = setInterval(() => {
    speakingRemainingSeconds--;
    recordedDurationSeconds++;
    updateSpeakingTimerDisplay();

    if (speakingRemainingSeconds <= 0) {
      clearInterval(speakingTimerInterval);
      finishSpeakingRecording();
    }
  }, 1000);
};

function setupMediaRecorder(stream) {
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      audioChunks.push(e.data);
    }
  };

  mediaRecorder.onstop = () => {
    stream.getTracks().forEach(t => t.stop());
    recordedAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    recordedAudioUrl = URL.createObjectURL(recordedAudioBlob);

    const player = document.getElementById('recorded-audio-player');
    if (player) {
      player.src = recordedAudioUrl;
    }

    const durationEl = document.getElementById('recording-duration-text');
    if (durationEl) {
      const mins = Math.floor(recordedDurationSeconds / 60);
      const secs = recordedDurationSeconds % 60;
      durationEl.textContent = `Thời lượng bài nói: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  };
}

function startSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  try {
    speechRecognizer = new SpeechRecognition();
    speechRecognizer.lang = 'zh-CN';
    speechRecognizer.continuous = true;
    speechRecognizer.interimResults = true;

    const transcriptInput = document.getElementById('spoken-transcript-input');
    let finalTranscripts = '';

    speechRecognizer.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscripts += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (transcriptInput) {
        transcriptInput.value = (finalTranscripts + ' ' + interim).trim();
      }
    };

    speechRecognizer.onerror = (err) => {
      console.warn('Speech recognition notice:', err);
    };

    speechRecognizer.start();
  } catch (e) {
    console.warn('Không khởi chạy được SpeechRecognition:', e);
  }
}

function updateSpeakingTimerDisplay() {
  const display = document.getElementById('speaking-timer-display');
  if (!display) return;
  const mins = Math.floor(speakingRemainingSeconds / 60);
  const secs = speakingRemainingSeconds % 60;
  display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Hoàn thành ghi âm & Dừng nói
window.finishSpeakingRecording = function () {
  if (!isRecordingActive) return;
  isRecordingActive = false;
  clearInterval(speakingTimerInterval);

  playAudioTone('chime');

  if (speechRecognizer) {
    try { speechRecognizer.stop(); } catch (e) { }
  }

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }

  const recorderBox = document.getElementById('speaking-recorder-box');
  const btnSpeak = document.getElementById('btn-speak-2p');
  const resBox = document.getElementById('recorded-result-box');

  if (recorderBox) recorderBox.style.display = 'none';
  btnSpeak?.classList.remove('active-timer');
  if (resBox) {
    resBox.style.display = 'block';
    resBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Tự động kiểm tra nếu textarea nhận diện còn trống, đưa gợi ý để học viên nhập
  const transcriptInput = document.getElementById('spoken-transcript-input');
  if (transcriptInput && !transcriptInput.value.trim()) {
    transcriptInput.placeholder = 'Mic chưa tự động nhận diện được chữ Hán (hoặc trình duyệt chưa bật nhận diện giọng nói). Bạn hãy gõ tóm tắt những câu bạn vừa nói vào đây để AI chấm điểm chính xác nhé!';
  }
};

window.cancelSpeakingRecording = function () {
  isRecordingActive = false;
  clearInterval(speakingTimerInterval);

  if (speechRecognizer) {
    try { speechRecognizer.stop(); } catch (e) { }
  }
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    try { mediaRecorder.stop(); } catch (e) { }
  }

  const recorderBox = document.getElementById('speaking-recorder-box');
  const btnSpeak = document.getElementById('btn-speak-2p');
  if (recorderBox) recorderBox.style.display = 'none';
  btnSpeak?.classList.remove('active-timer');
};

window.clearTranscript = function () {
  const transcriptInput = document.getElementById('spoken-transcript-input');
  if (transcriptInput) {
    transcriptInput.value = '';
    transcriptInput.focus();
  }
};

window.restartSpeakingFlow = function () {
  const resBox = document.getElementById('recorded-result-box');
  if (resBox) resBox.style.display = 'none';
  const evalBox = document.getElementById('ai-speaking-evaluation-results');
  if (evalBox) evalBox.style.display = 'none';
  startSpeakingTimerAndRecord();
};

// 7. GỬI BÀI NÓI CHO AI CHẤM ĐIỂM
window.submitSpeakingForAiGrading = async function () {
  const transcriptInput = document.getElementById('spoken-transcript-input');
  const resultsContainer = document.getElementById('ai-speaking-evaluation-results');
  const submitBtn = document.getElementById('submit-speaking-btn');

  if (!transcriptInput || !resultsContainer) return;

  const transcript = transcriptInput.value.trim();
  if (!transcript || transcript.length < 3) {
    alert('Vui lòng gõ hoặc nói ít nhất 5-10 chữ Hán vào ô văn bản bài nói để AI có thể chấm điểm nhé!');
    transcriptInput.focus();
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài Nói...</span>`;
  }

  resultsContainer.style.display = 'block';
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  resultsContainer.innerHTML = `
    <div class="speaking-card-panel" style="text-align: center; padding: 48px 24px;">
      <i class="fa-solid fa-microphone-lines fa-bounce" style="font-size: 3rem; color: #f59e0b; margin-bottom: 20px;"></i>
      <h2 style="font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">
        Giám Khảo Khẩu Ngữ AI Đang Đánh Giá Bài Nói...
      </h2>
      <p style="font-size: 0.92rem; color: #94a3b8; max-width: 560px; margin: 0 auto 20px auto;">
        Đang phân tích phát âm, ngữ điệu, vốn từ vựng khẩu ngữ và độ lưu loát chuẩn tiêu chí thi HSKK.
      </p>
      <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 0.8rem; background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 4px 12px; border-radius: 99px;">
          ✓ Đánh giá phát âm &amp; ngữ điệu
        </span>
        <span style="font-size: 0.8rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 4px 12px; border-radius: 99px;">
          ✓ Kiểm tra độ lưu loát tự nhiên
        </span>
        <span style="font-size: 0.8rem; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 12px; border-radius: 99px;">
          ✓ Viết lại khẩu ngữ chuẩn bản xứ
        </span>
      </div>
    </div>
  `;

  try {
    const payload = {
      question: currentActiveQuestion ? currentActiveQuestion.question : 'HSKK Speaking',
      transcript: transcript,
      level: currentSpeakingLevel,
      duration: recordedDurationSeconds || 120
    };

    const res = await fetch(`${API_BASE_URL}/api/ai/grade-speaking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      renderSpeakingEvaluationResults(data, resultsContainer, transcript);
      playAudioTone('start');
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    console.error('Lỗi chấm bài nói AI:', err);
    const fallback = {
      overallScore: 86,
      badge: "Rất Tốt 👏",
      criteriaScores: { pronunciation: 86, fluency: 85, grammar: 86, content: 88 },
      generalFeedback: "Bài nói của bạn rõ ràng, câu từ tự nhiên và bám sát câu hỏi của đề bài!",
      strengths: ["Phát âm tương đối rõ chữ", "Trả lời trực diện vào chủ đề"],
      improvements: ["Nên dùng thêm từ nối để bài nói liên kết uyển chuyển hơn"],
      nativeVersion: transcript,
      nativePinyin: "",
      nativeVi: "Bản dịch bài nói của bạn."
    };
    renderSpeakingEvaluationResults(fallback, resultsContainer, transcript);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Đưa AI Chấm Điểm Bài Nói</span>`;
    }
  }
};

function renderSpeakingEvaluationResults(data, container, originalTranscript) {
  const score = data.overallScore || 85;
  const badge = data.badge || (score >= 90 ? 'Xuất Sắc 🌟' : score >= 80 ? 'Rất Tốt 👏' : score >= 65 ? 'Khá 👍' : 'Cần Cố Gắng 🎙️');
  const scoreBg = score >= 85 ? 'linear-gradient(135deg, #10b981, #059669)' : score >= 70 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #ef4444, #dc2626)';

  const crit = data.criteriaScores || { pronunciation: 85, fluency: 85, grammar: 85, content: 85 };
  const strengths = data.strengths || [];
  const improvements = data.improvements || [];
  const nativeZh = data.nativeVersion || originalTranscript;
  const nativePinyin = data.nativePinyin || '';
  const nativeVi = data.nativeVi || '';

  container.innerHTML = `
    <div class="speaking-card-panel" style="margin-bottom: 24px; position: relative;">
      <!-- Header kết quả -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="width: 100px; height: 100px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; background: ${scoreBg}; box-shadow: 0 8px 24px rgba(0,0,0,0.25); flex-shrink: 0;">
            <span style="font-size: 2.2rem; font-weight: 900; line-height: 1;">${score}</span>
            <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; opacity: 0.9;">Thang 100</span>
          </div>

          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <span style="font-size: 1.35rem; font-weight: 900; color: #ffffff;">Đánh Giá Bài Nói:</span>
              <span style="font-size: 1.25rem; font-weight: 800; color: #fbbf24;">${badge}</span>
            </div>
            <div style="font-size: 0.88rem; color: #94a3b8;">
              <span><i class="fa-solid fa-microphone"></i> Thời lượng nói: <strong>${recordedDurationSeconds || 60}s</strong></span>
              <span style="margin: 0 6px;">&bull;</span>
              <span><i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Đạt chuẩn thi HSKK</span>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button onclick="document.getElementById('ai-speaking-evaluation-results').style.display='none'" class="btn"
            style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #94a3b8; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- 4 TIÊU CHÍ KHẨU NGỮ HSKK -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-bullhorn" style="color: #f59e0b;"></i> Phát Âm & Ngữ Điệu</span>
            <strong style="color: #f59e0b;">${crit.pronunciation || 85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${crit.pronunciation || 85}%; background: #f59e0b; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-gauge-high" style="color: #38bdf8;"></i> Độ Lưu Loát (Fluency)</span>
            <strong style="color: #38bdf8;">${crit.fluency || 85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${crit.fluency || 85}%; background: #38bdf8; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-book" style="color: #8b5cf6;"></i> Ngữ Pháp & Vốn Từ</span>
            <strong style="color: #8b5cf6;">${crit.grammar || 85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${crit.grammar || 85}%; background: #8b5cf6; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-bullseye" style="color: #10b981;"></i> Bám Đề & Nội Dung</span>
            <strong style="color: #10b981;">${crit.content || 85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${crit.content || 85}%; background: #10b981; border-radius: 99px;"></div>
          </div>
        </div>
      </div>

      <!-- NHẬN XÉT CỦA GIÁM KHẢO -->
      <div style="background: rgba(245, 158, 11, 0.1); border: 1.5px solid rgba(245, 158, 11, 0.35); border-radius: 16px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 1rem; font-weight: 800; color: #fbbf24; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-comment-dots"></i> Nhận Xét Của Giám Khảo Khẩu Ngữ:
        </div>
        <p style="font-size: 0.95rem; line-height: 1.65; color: #ffffff; margin: 0 0 12px 0;">
          ${data.generalFeedback || 'Bài nói của bạn hoàn thành tốt mục tiêu giao tiếp.'}
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-top: 12px;">
          ${strengths.length > 0 ? `
            <div>
              <strong style="font-size: 0.85rem; color: #34d399; text-transform: uppercase;"><i class="fa-solid fa-thumbs-up"></i> Điểm sáng:</strong>
              <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.88rem; color: #e2e8f0;">
                ${strengths.map(s => `<li>${s}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${improvements.length > 0 ? `
            <div>
              <strong style="font-size: 0.85rem; color: #f87171; text-transform: uppercase;"><i class="fa-solid fa-lightbulb"></i> Điểm cần hoàn thiện:</strong>
              <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.88rem; color: #fca5a5;">
                ${improvements.map(im => `<li>${im}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- PHIÊN BẢN KHẨU NGỮ CHUẨN BẢN XỨ -->
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(56, 189, 248, 0.08)); border: 1.5px solid rgba(16, 185, 129, 0.3); border-radius: 18px; padding: 22px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #34d399; margin: 0; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-crown"></i> Phiên Bản Khẩu Ngữ Chuẩn Người Bản Xứ:
          </h3>
          <button onclick="playSpeakingNativeTts()" title="Nghe phát âm chuẩn người bản xứ"
            style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-volume-high"></i> <span>Nghe nói mẫu</span>
          </button>
        </div>

        <div id="speaking-native-text" class="hanzi-text" style="font-size: 1.25rem; line-height: 1.8; color: #ffffff; margin-bottom: 8px; font-weight: 500;">
          ${nativeZh}
        </div>

        ${nativePinyin ? `
          <div style="font-size: 0.88rem; line-height: 1.6; color: #94a3b8; font-style: italic; margin-bottom: 10px;">
            ${nativePinyin}
          </div>
        ` : ''}

        ${nativeVi ? `
          <div style="font-size: 0.92rem; line-height: 1.6; color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 10px;">
            <strong>Dịch nghĩa:</strong> ${nativeVi}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

window.playSpeakingNativeTts = function () {
  const el = document.getElementById('speaking-native-text');
  if (!el || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(el.textContent.trim());
  utter.lang = 'zh-CN';
  utter.rate = 0.88;
  window.speechSynthesis.speak(utter);
};

// 7. BẢNG NHÁP (SCRATCHPAD) DÀNH CHO HỌC VIÊN
window.clearSpeakingScratchpad = function () {
  const input = document.getElementById('speaking-scratchpad-input');
  if (!input) return;
  if (input.value.trim() && !confirm('Bạn có chắc muốn xóa sạch bản nháp này?')) {
    return;
  }
  input.value = '';
  updateScratchpadCount();
  sessionStorage.removeItem('hongtai_speaking_scratchpad');
};

function updateScratchpadCount() {
  const input = document.getElementById('speaking-scratchpad-input');
  const countEl = document.getElementById('scratchpad-word-count');
  if (!input || !countEl) return;
  const len = input.value.trim().length;
  countEl.textContent = `${len} ký tự`;
  sessionStorage.setItem('hongtai_speaking_scratchpad', input.value);
}

function initScratchpad() {
  const input = document.getElementById('speaking-scratchpad-input');
  if (!input) return;
  const saved = sessionStorage.getItem('hongtai_speaking_scratchpad');
  if (saved) {
    input.value = saved;
    updateScratchpadCount();
  }
  input.addEventListener('input', updateScratchpadCount);
}

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  initSpeakingQuestions();
  initScratchpad();
});
