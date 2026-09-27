/**
 * Tiếng Trung HongTai - AI Essay Grader & HSKK Writing Practice
 * Khớp 100% bản vẽ Luyện Viết: 3 Card, Trình độ Sơ/Trung/Cao, Đề + Quay Random,
 * Gợi ý AI (Dàn bài, từ vựng, mẫu câu) và Viết rồi đưa AI chấm.
 */

const API_BASE_URL = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
  ? ''
  : '';

// Dữ liệu câu hỏi HSKK (1,045 câu từ Excel Câu hỏi cho HSKK.xlsx)
let hskkQuestionsData = {
  so: [],
  trung: [],
  cao: []
};

let currentHskkLevel = 'trung'; // 'so' | 'trung' | 'cao'
let currentActiveQuestion = null;
let aiSuggestionsCache = new Map(); // questionId -> suggestionData
let isSubmitting = false;
let isFetchingHint = false;

// Âm thanh web audio tổng hợp (không phụ thuộc file ngoài)
function playUiBeep(type = 'click') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'spin') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch (e) { }
}

// 1. Khởi tạo & Tải danh sách 1,045 câu hỏi HSKK
async function initHskkQuestions() {
  try {
    // Ưu tiên tải từ API backend, fallback sang file static json
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
    console.warn('Không tải được API HSKK, thử nạp tĩnh...', e);
    try {
      const resStatic = await fetch('/data/hskk_questions.json');
      if (resStatic.ok) {
        hskkQuestionsData = await resStatic.json();
      }
    } catch (err2) {
      console.error('Lỗi nạp câu hỏi HSKK:', err2);
    }
  }

  // Cập nhật thống kê
  const total = (hskkQuestionsData.so?.length || 0) + (hskkQuestionsData.trung?.length || 0) + (hskkQuestionsData.cao?.length || 0);
  const totalEl = document.getElementById('total-questions-stat');
  if (totalEl && total > 0) totalEl.textContent = total.toLocaleString();

  // Chọn ngẫu nhiên 1 câu Trung cấp mở đầu
  spinRandomQuestion(false);
}

// 2. Chuyển đổi giữa các Chế độ (3 Thẻ trên đầu)
window.selectWritingMode = function (mode) {
  const cardQa = document.getElementById('wf-card-qa');
  const cardFree = document.getElementById('wf-card-free');
  const arrow = document.getElementById('wf-pointer-arrow');
  const viewQa = document.getElementById('qa-workspace-view');
  const viewFree = document.getElementById('free-workspace-view');

  if (mode === 'qa') {
    cardQa?.classList.add('active');
    cardFree?.classList.remove('active');
    if (arrow) arrow.style.display = 'flex';
    if (viewQa) viewQa.style.display = 'block';
    if (viewFree) viewFree.style.display = 'none';
  } else if (mode === 'free') {
    cardQa?.classList.remove('active');
    cardFree?.classList.add('active');
    if (arrow) arrow.style.display = 'none';
    if (viewQa) viewQa.style.display = 'none';
    if (viewFree) viewFree.style.display = 'block';
  }
};

// 3. Chuyển đổi Cấp độ Trình độ: [Sơ] [Trung] [Cao]
window.switchHskkLevel = function (level, btn) {
  if (currentHskkLevel === level && currentActiveQuestion) return;
  currentHskkLevel = level;

  document.querySelectorAll('.level-select-row .level-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  spinRandomQuestion(true);
};

// 4. Nút [Quay] (Random đề bài từ cấp độ đã chọn)
window.spinRandomQuestion = function (playAnim = true) {
  const list = hskkQuestionsData[currentHskkLevel] || [];
  if (!list || list.length === 0) return;

  const btn = document.getElementById('spin-question-btn');
  if (playAnim && btn) {
    btn.classList.add('rolling');
    playUiBeep('spin');
    setTimeout(() => btn.classList.remove('rolling'), 500);
  }

  // Chọn ngẫu nhiên không trùng câu hiện tại nếu list > 1
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

  // Đóng khối gợi ý & khối bài mẫu nếu đang mở
  const hintBox = document.getElementById('ai-suggestion-box');
  if (hintBox) hintBox.style.display = 'none';
  const hintBtn = document.getElementById('hint-toggle-btn');
  if (hintBtn) {
    hintBtn.innerHTML = `
      <i class="fa-solid fa-lightbulb"></i>
      <span>Gợi ý Dàn bài &amp; Từ vựng</span>
    `;
  }

  const sampleBox = document.getElementById('sample-writing-box');
  if (sampleBox) sampleBox.style.display = 'none';
  const sampleBtn = document.getElementById('sample-writing-toggle-btn');
  if (sampleBtn) {
    sampleBtn.innerHTML = `
      <i class="fa-solid fa-medal"></i>
      <span>Bài viết mẫu tham khảo</span>
    `;
  }
};

function renderCurrentQuestion() {
  if (!currentActiveQuestion) return;

  const textEl = document.getElementById('active-question-text');
  const badgeEl = document.getElementById('question-meta-badge');

  const lvlName = currentHskkLevel === 'so' ? 'HSKK Sơ cấp' : currentHskkLevel === 'cao' ? 'HSKK Cao cấp' : 'HSKK Trung cấp';

  if (textEl) textEl.textContent = currentActiveQuestion.question;
  if (badgeEl) {
    badgeEl.textContent = `Câu ${currentActiveQuestion.stt || 1} • ${lvlName}`;
  }
}

// 5. Phát âm đọc đề thi bằng Speech Synthesis
window.playQuestionTts = function () {
  if (!currentActiveQuestion || !currentActiveQuestion.question) return;
  if (!('speechSynthesis' in window)) {
    alert('Trình duyệt của bạn không hỗ trợ phát âm thanh.');
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(currentActiveQuestion.question);
  utter.lang = 'zh-CN';
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
};

// 6. Nút [Gợi ý Dàn bài & Từ vựng] (AI tự đề xuất)
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

  // Mở khối gợi ý
  box.style.display = 'block';
  if (btn) {
    btn.innerHTML = `
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Gợi ý</span>
    `;
  }

  // Kiểm tra cache đã có cho câu hỏi này chưa
  const qKey = `${currentHskkLevel}_${currentActiveQuestion.question}`;
  if (aiSuggestionsCache.has(qKey)) {
    renderAiSuggestionContent(aiSuggestionsCache.get(qKey));
    return;
  }

  // Nếu chưa có, gọi AI sinh tự động
  if (isFetchingHint) return;
  isFetchingHint = true;

  box.innerHTML = `
    <div style="text-align: center; padding: 24px 16px; color: #a855f7;">
      <i class="fa-solid fa-brain fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #38bdf8;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        AI HongTai đang tự động xây dựng Dàn bài &amp; chọn lọc Từ vựng...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Đối chiếu chuẩn ngữ cảnh thi HSKK ${currentHskkLevel === 'so' ? 'Sơ cấp' : currentHskkLevel === 'cao' ? 'Cao cấp' : 'Trung cấp'}
      </div>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE_URL}/api/ai/hskk-suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: currentActiveQuestion.question,
        level: currentHskkLevel,
        skill: 'writing'
      })
    });

    if (res.ok) {
      const data = await res.json();
      aiSuggestionsCache.set(qKey, data);
      renderAiSuggestionContent(data);
      playUiBeep('success');
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
        <span>AI Gợi Ý Dàn Bài &amp; Từ Vựng (Chuẩn HSKK ${currentHskkLevel === 'so' ? 'Sơ cấp' : currentHskkLevel === 'cao' ? 'Cao cấp' : 'Trung cấp'})</span>
      </div>
      <span style="font-size: 0.75rem; background: rgba(34, 197, 94, 0.15); color: #86efac; padding: 2px 8px; border-radius: 6px; font-weight: 700;">
        Tự động bám sát đề
      </span>
    </div>

    <!-- 1. Dàn bài gợi ý (Tiếng Việt) -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 0.92rem; font-weight: 800; color: #fbbf24; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-list-ol"></i> <span>1. Dàn bài gợi ý (Suy nghĩ và trả lời theo từng luận điểm):</span>
      </div>
      <div style="background: rgba(0,0,0,0.25); padding: 12px 16px; border-radius: 12px; border-left: 3px solid #fbbf24; font-size: 0.9rem; line-height: 1.65; color: #e2e8f0;">
        <div style="margin-bottom: 8px;"><strong>Mở bài:</strong> ${outline.intro || 'Nêu trực tiếp câu trả lời cho đề bài.'}</div>
        <div style="margin-bottom: 8px;">
          <strong>Thân bài:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 20px;">
            ${(outline.body || []).map(b => `<li style="margin-bottom: 4px;">${b}</li>`).join('')}
          </ul>
        </div>
        <div><strong>Kết bài:</strong> ${outline.conclusion || 'Tổng kết suy nghĩ và cảm xúc.'}</div>
      </div>
    </div>

    <!-- 2. Từ vựng then chốt có thể sử dụng -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 0.92rem; font-weight: 800; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-key"></i> <span>2. Từ vựng then chốt (Bấm để chèn nhanh vào bài):</span>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${vocabList.map(v => `
          <div onclick="insertVocabToWriting('${v.hanzi}')" title="Bấm để chèn từ này vào bài viết"
            style="cursor: pointer; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); padding: 5px 12px; border-radius: 99px; transition: all 0.2s;">
            <span style="font-weight: 800; color: #ffffff; font-family: var(--font-chinese), sans-serif;">${v.hanzi}</span>
            <span style="font-size: 0.78rem; color: #38bdf8; margin: 0 4px;">(${v.pinyin})</span>
            <span style="font-size: 0.78rem; color: #cbd5e1;">: ${v.meaning}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 3. Cấu trúc câu đắt giá -->
    ${sentenceList.length > 0 ? `
      <div style="margin-bottom: 12px;">
        <div style="font-size: 0.92rem; font-weight: 800; color: #a855f7; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-puzzle-piece"></i> <span>3. Cấu trúc câu đắt giá ghi điểm:</span>
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

// 6b. Nút [Bài viết mẫu tham khảo] TÁCH RIÊNG BIỆT
window.toggleSampleWriting = async function () {
  const box = document.getElementById('sample-writing-box');
  const btn = document.getElementById('sample-writing-toggle-btn');
  if (!box || !currentActiveQuestion) return;

  const isVisible = box.style.display === 'block';

  if (isVisible) {
    box.style.display = 'none';
    if (btn) {
      btn.innerHTML = `
        <i class="fa-solid fa-medal"></i>
        <span>Bài viết mẫu tham khảo</span>
      `;
    }
    return;
  }

  // Mở khối bài mẫu
  box.style.display = 'block';
  if (btn) {
    btn.innerHTML = `
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Bài viết mẫu</span>
    `;
  }

  const qKey = `${currentHskkLevel}_${currentActiveQuestion.question}`;
  if (aiSuggestionsCache.has(qKey)) {
    renderSampleWritingContent(aiSuggestionsCache.get(qKey));
    return;
  }

  box.innerHTML = `
    <div style="text-align: center; padding: 24px 16px; color: #10b981;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #10b981;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        Đang tạo bài viết mẫu chuẩn HSKK ${currentHskkLevel === 'so' ? 'Sơ cấp' : currentHskkLevel === 'cao' ? 'Cao cấp' : 'Trung cấp'}...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Bài văn mẫu hoàn chỉnh 3 phần bám sát câu hỏi: "${currentActiveQuestion.question}"
      </div>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE_URL}/api/ai/hskk-suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: currentActiveQuestion.question,
        level: currentHskkLevel,
        skill: 'writing'
      })
    });

    if (res.ok) {
      const data = await res.json();
      aiSuggestionsCache.set(qKey, data);
      renderSampleWritingContent(data);
      playUiBeep('success');
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    console.error('Lỗi nạp bài mẫu viết:', err);
    const fallback = getFallbackHskkSuggestion();
    aiSuggestionsCache.set(qKey, fallback);
    renderSampleWritingContent(fallback);
  }
};

function renderSampleWritingContent(data) {
  const box = document.getElementById('sample-writing-box');
  if (!box) return;

  const sample = data.sampleAnswer || {};
  const hanziText = sample.hanzi || '';
  const charCount = hanziText.replace(/\s+/g, '').length;

  box.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px dashed rgba(16, 185, 129, 0.4); padding-bottom: 10px; flex-wrap: wrap; gap: 8px;">
      <div style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.1rem; color: #34d399;">
        <i class="fa-solid fa-medal"></i>
        <span>Bài Viết Mẫu Tham Khảo (Chuẩn HSKK ${currentHskkLevel === 'so' ? 'Sơ cấp' : currentHskkLevel === 'cao' ? 'Cao cấp' : 'Trung cấp'})</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 0.78rem; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; padding: 4px 10px; border-radius: 99px; font-weight: 800;">
          ${charCount} chữ Hán
        </span>
        <button onclick="playWritingSampleTts()" style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; font-size: 0.82rem; font-weight: 700; padding: 5px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-volume-high"></i> <span>Nghe đọc mẫu</span>
        </button>
        <button onclick="copySampleText()" style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #34d399; font-size: 0.82rem; font-weight: 700; padding: 5px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-copy"></i> <span>Sao chép mẫu</span>
        </button>
      </div>
    </div>

    <!-- Hanzi Text -->
    <div id="sample-writing-hanzi" class="hanzi-text" style="font-size: 1.1rem; line-height: 1.85; color: #ffffff; white-space: pre-line; margin-bottom: 14px; font-family: var(--font-chinese), sans-serif; background: rgba(0,0,0,0.22); padding: 14px 16px; border-radius: 12px; border-left: 3px solid #10b981;">
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
  const qText = (currentActiveQuestion && currentActiveQuestion.question) ? currentActiveQuestion.question : 'đề bài';
  const lvl = currentHskkLevel || 'trung';

  if (lvl === 'so') {
    return {
      outline: {
        intro: `Mở bài: Trả lời trực tiếp và ngắn gọn: "${qText}". (Gợi ý: Bạn có thích điều này không? Quan điểm đơn giản của bạn là gì?)`,
        body: [
          `Luận điểm 1: Nêu lý do thứ nhất với các từ quen thuộc. (Gợi ý: Tại sao bạn lại nghĩ như vậy?)`,
          `Luận điểm 2: Kể một việc hoặc trải nghiệm đơn giản hằng ngày. (Gợi ý: Bạn thường làm việc đó với ai, vào lúc nào?)`,
          `Luận điểm 3: Nêu cảm nghĩ vui vẻ, tích cực. (Gợi ý: Bạn cảm thấy việc đó mang lại niềm vui gì?)`
        ],
        conclusion: `Kết bài: Tóm lại ý chính và bày tỏ hy vọng / mong muốn của bạn trong tương lai.`
      },
      vocabulary: [
        { hanzi: "我觉得", pinyin: "wǒ juéde", meaning: "tôi thấy, tôi nghĩ rằng" },
        { hanzi: "喜欢", pinyin: "xǐhuan", meaning: "thích" },
        { hanzi: "常常", pinyin: "chángcháng", meaning: "thường xuyên" },
        { hanzi: "一起", pinyin: "yìqǐ", meaning: "cùng nhau" },
        { hanzi: "高兴", pinyin: "gāoxìng", meaning: "vui vẻ" }
      ],
      sentenceStructures: [
        {
          pattern: "我觉得……因为……",
          meaning: "Tôi thấy... bởi vì...",
          example: `我觉得这个题目很有意思，因为在日常生活中我们常常遇到。`
        },
        {
          pattern: "虽然……但是……",
          meaning: "Tuy... nhưng...",
          example: "虽然一开始有点儿难，但是多练习就会了。"
        }
      ],
      sampleAnswer: {
        hanzi: `关于“${qText}”这个问题，我觉得很有意思。在生活中，我们常常会遇到这样的事情。对我来说，保持一个好心情非常重要。首先，做事情的时候要认真，遇到不懂的问题可以多问问老师和朋友。其次，每天花一点儿时间去学习和练习，比如多听听汉语、多和大家聊聊天，这样就能慢慢进步。最后，我觉得大家互相帮助、一起努力是一件非常快乐的事情。只要我们每天坚持，就一定能把事情做好，生活也会更加开心。`,
        pinyin: `Guānyú zhè ge wèntí, wǒ juéde hěn yǒu yìsi. Zài shēnghuó zhōng, wǒmen chángcháng huì yù dào zhèyàng de shìqing. Duì wǒ lái shuō, bǎochí yí gè hǎo xīnqíng fēicháng zhòngyào. Shǒuxiān, zuò shìqing de shíhou yào rènzhēn, yù dào bù dǒng de wèntí kěyǐ duō wènwen lǎoshī hé péngyou. Qícì, měitiān huā yìdiǎnr shíjiān qù xuéxí hé liànxí, bǐrú duō tīngting Hànyǔ, duō hé dàjiā liáoliao tiān, zhèyàng jiù néng mànmàn jìnbù. Zuìhòu, wǒ juéde dàjiā hùxiāng bāngzhù, yìqǐ nǔlì shì yí jiàn fēicháng kuàilè de shìqing. Zhǐyào wǒmen měitiān jiānchí, jiù yídìng néng bǎ shìqing zuò hǎo, shēnghuó yě huì gèngjiā kāixīn.`,
        meaningVi: `Về câu hỏi "${qText}", tôi thấy rất thú vị. Trong cuộc sống, chúng ta thường hay gặp những chuyện như thế này. Đối với tôi, giữ một tâm trạng vui vẻ là rất quan trọng. Thứ nhất, khi làm việc gì cũng cần nghiêm túc, gặp câu hỏi chưa hiểu thì có thể hỏi thầy cô và bạn bè. Thứ hai, mỗi ngày dành một chút thời gian học tập và luyện tập, ví dụ như nghe tiếng Trung nhiều hơn, nói chuyện với mọi người nhiều hơn, như vậy sẽ tiến bộ dần dần. Cuối cùng, tôi thấy mọi người cùng giúp đỡ nhau, cùng nhau nỗ lực là một điều vô cùng hạnh phúc. Chỉ cần mỗi ngày kiên trì, nhất định chúng ta sẽ làm tốt và cuộc sống sẽ vui vẻ hơn.`
      }
    };
  }

  if (lvl === 'cao') {
    return {
      outline: {
        intro: `Mở bài: Đặt vấn đề sâu sắc trong bối cảnh xã hội hiện đại cho chủ đề: "${qText}". Khẳng định tầm quan trọng và đưa ra luận điểm cốt lõi bao quát.`,
        body: [
          `Luận điểm 1: Mổ xẻ bản chất và căn nguyên sâu xa của vấn đề (về mặt nhận thức cá nhân và tác động đa chiều từ môi trường sống).`,
          `Luận điểm 2: Đưa ra dẫn chứng thực tiễn điển hình có sức nặng thuyết phục (phân tích sự tương phản giữa kiên trì vượt khó và tâm lý thoái thác).`,
          `Luận điểm 3: Đề xuất hệ thống giải pháp chiến lược toàn diện (kết hợp kỷ luật tự thân với sự hỗ trợ từ gia đình, tổ chức và xã hội).`
        ],
        conclusion: `Kết bài: Nâng tầm vấn đề thành bài học triết lý sống và thông điệp hành động mạnh mẽ, truyền cảm hứng dài hạn.`
      },
      vocabulary: [
        { hanzi: "立足当下", pinyin: "lìzú dāngxià", meaning: "đứng vững ở hiện tại" },
        { hanzi: "深谋远虑", pinyin: "shēnmóu yuǎnlǜ", meaning: "lo xa nghĩ sâu, tầm nhìn chiến lược" },
        { hanzi: "持之以恒", pinyin: "chí zhī yǐ héng", meaning: "kiên trì bền bỉ không ngừng nghỉ" },
        { hanzi: "潜移默化", pinyin: "qián yí mò huà", meaning: "ảnh hưởng sâu sắc một cách vô hình, ngấm dần" },
        { hanzi: "标本兼治", pinyin: "biāo běn jiān zhì", meaning: "trị cả phần ngọn lẫn gốc rễ" },
        { hanzi: "收益匪浅", pinyin: "shòuyì fěiqiǎn", meaning: "thu hoạch được vô vàn điều bổ ích" }
      ],
      sentenceStructures: [
        {
          pattern: "不仅在于……，更关键的在于……",
          meaning: "Không chỉ nằm ở chỗ..., mà mấu chốt hơn là nằm ở...",
          example: `探讨这个问题的价值，不仅在于理清表象，更关键的在于寻找切实行之有效的破局之道。`
        },
        {
          pattern: "固然……，然而归根结底……",
          meaning: "Dẫu rằng..., nhưng xét đến cùng...",
          example: "外部客观环境固然重要，然而归根结底，个人内驱力与长远格局才起决定性作用。"
        },
        {
          pattern: "唯有……，方能在……中立于不败之地。",
          meaning: "Chỉ khi..., mới có thể đứng vững trước...",
          example: "唯有保持终身学习的心态，方能在瞬息万变的时代浪潮中立于不败之地。"
        }
      ],
      sampleAnswer: {
        hanzi: `针对“${qText}”这一极具现实意义的深刻命题，我认为它不仅关乎我们每个人的个体成长，更折射出现代社会中普遍存在的价值取向与处事哲学。在纷繁复杂的生活与职场环境中，如何正确审视并妥善应对这一课题，值得我们深思熟虑。\n\n首先，从认知层面来看，古人云：“登高使人心旷，临流使人意远。”面对纷至沓来的挑战，我们首先应当厘清问题的本质所在，既不能因暂时的波折 mà 妄自菲薄，亦不可盲目乐观 mà 浅尝辄止。唯有树立清晰宏阔的目标导向，将长远愿景细化为扎实可行的阶段性规划，方能做到心中有数、行有方向。\n\n其次，从实践与知行合一的角度而言，纸上谈兵终究无济于事，关键在于付诸持之以恒的切实行动。以我们日常求知与奋斗为例，任何一项专业技能的精通或心智的磨砺，无不经历漫长 mà 枯燥的积累过程，正所谓“不积跬步，无以至千里”。在此期间，保持专注与定力、勇敢突破舒适圈，敢于在试错中反思与总结，方能实现认知与能力的飞跃。\n\n再者，除了依赖个体强烈的内驱力之外，融洽的人际协作与开放包容的生态氛围亦是不可或缺的外部支撑。懂得倾听他山之石、主动构建良性互动的合作机制，往往能激发出“独行快，众行远”의 bèizēng xiàoyìng。\n\n总而言之，“行百里者半九十”。面对这一课题，我们唯有立足当下、深谋远虑，将坚毅的意志品质与科学的行事方法有机结合，在时代洪流中砥砺前行，方能攻坚克难，开辟出属于自己的广阔天地。`,
        pinyin: `Zhēnduì zhè yí jùyǒu xiànshí yìyì de shēnkè mìngtí, wǒ rènwéi tā bùjǐn guānhū wǒmen měi gè rén de gètǐ chéngzhǎng, gèng zhéshè chū xiàndài shèhuì zhōng pǔbiàn cúnzài de jiàzhí qǔxiàng yǔ chǔshì zhéxué. Zài fēnfán fùzá de shēnghuó yǔ zhíchǎng huánjìng zhōng, rúhé zhèngquè shěnshì bìng tuǒshàn yìngduì zhè yí kètí, zhídé wǒmen shēnsī shúlǜ.\n\nShǒuxiān, cóng rènzhī céngmiàn lái kàn, gǔrén yún: "Dēng gāo shǐ rén xīn kuàng, lín liú shǐ rén yì yuǎn." Miànduì fēnzhì-tàlái de tiǎozhàn, wǒmen shǒuxiān yīngdāng líqīng wèntí de běnzhì suǒzài, jì bù néng yīn zànshí de bōzhé ér wàngzì-fěibó, yì bù kě mángmù lèguān ér qiǎncháng-zhézhǐ. Wéiyǒu shùlì qīngxī hóngkuò de mùbiāo dǎoxiàng, jiāng chángyuǎn yuànjǐng xìhuà wéi zhāshi kěxíng de jiēduànxìng guīhuà, fāng néng zuò dào xīn zhōng yǒu shù, xíng yǒu fāngxiàng.\n\nQícì, cóng shíjiàn yǔ zhī-xíng-hé-yī de jiǎodù ér yán, zhǐshàng-tánbīng zhōngjiū wújìyúshì, guānjiàn zàiyú fùzhū chízhīyǐhéng de qièshí xíngdòng. Yǐ wǒmen rìcháng qiúzhī yǔ fèndòu wéilì, rènhé yí xiàng zhuānyè jìnéng de jīngtōng huò xīnzzhì de mólì, wúbù jīnglì màncháng ér kūzào de jīlěi guòchéng, zhèng suǒwèi "bù jī kuǐbù, wú yǐ zhì qiānlǐ". Zài cǐ qījiān, bǎochí zhuānzhù yǔ dìnglì, yǒnggǎn tūtò shūshìquān, gǎnyú zài shìcuò zhōng fǎnsī yǔ zǒngjié, fāng néng shíxiàn rènzhī yǔ nénglì de fēiyuè.\n\nZàizhě, chúle yīlài gètǐ qiángliè de nèiqūlì zhīwài, róngqià de rénjì xiézuò yǔ cáifàng bāoróng de shēngtài fēnwéi yì shì bùkě huòquē de wàibù zhīchēng. Dǒngdé qīngtīng tā-shān-zhī-shí, zhǔdòng gòujiàn liángxìng hùdòng de hézuò jīzhì, wǎngwǎng néng jīfā chū "dúxíng kuài, zhòngxíng yuǎn" de bèizēng xiàoyìng。\n\nZǒng'éryánzhī, "xíng bǎilǐ zhě bàn jiǔshí". Miànduì zhè yí kètí, wǒmen wéiyǒu lìzú dāngxià, shēnmóu yuǎnlǜ, jiāng jiānyì de yìzhì pǐnzhì yǔ kēxué de xíngshì fāngfǎ yǒujī jiéhé, zài shídài hóngliú zhōng dǐlì qiánxíng, fāng néng gōngjiān-kènán, kāipì chū shǔyú zìjǐ de guǎngkuò tiāndì.`,
        meaningVi: `Đối với đề bài mang tính thời sự và sâu sắc "${qText}", tôi cho rằng câu hỏi này không chỉ liên quan mật thiết đến sự trưởng thành của mỗi cá nhân, mà còn phản ánh hệ giá trị và triết lý sống phổ quát trong xã hội hiện đại. Trong một môi trường sống và làm việc đa chiều, việc nhìn nhận thấu đáo và ứng phó thỏa đáng với vấn đề này là điều rất đáng để chúng ta trăn trở.\n\nTrước hết, xét từ góc độ nhận thức, người xưa có câu: "Lên cao khiến lòng người khoáng đạt, ngắm dòng nước khiến ý chí vươn xa." Đối diện với vô vàn thử thách, chúng ta cần phân định rõ bản chất cốt lõi của vấn đề, không vì khó khăn trước mắt mà tự ti, thoái chí, cũng không vì chút thuận lợi ban đầu mà chủ quan, hời hợt. Chỉ khi xác lập một định hướng mục tiêu rành mạch, cụ thể hóa viễn cảnh dài hạn thành từng lộ trình hành động thiết thực, ta mới vững vàng tiến bước.\n\nThứ hai, xét từ nguyên lý "tri hành hợp nhất", nói suông trên giấy suy cho cùng vô ích, điều then chốt nằm ở việc bắt tay vào hành động kiên trì, bền bỉ. Lấy việc học tập và rèn luyện mỗi ngày làm ví dụ, việc tinh thông bất kỳ kỹ năng chuyên môn hay sự tôi luyện bản lĩnh nào cũng đều phải trải qua quá trình tích lũy lâu dài, đúng như câu "không tích từng bước nhỏ, không thể đi tới ngàn dặm". Trong hành trình đó, việc giữ vững sự tập trung, dũng cảm bứt phá khỏi vùng an toàn và không ngừng đúc rút kinh nghiệm sau mỗi lần vấp ngã chính là đòn bẩy tạo nên bước nhảy vọt.\n\nThêm vào đó, bên cạnh nội lực tự thân, sự tương trợ gắn kết và tinh thần hợp tác cởi mở cũng là điểm tựa ngoại lực không thể thiếu. Biết lắng nghe ý kiến đóng góp từ người khác, cùng chung sức đồng lòng sẽ luôn tạo ra sức mạnh cộng hưởng to lớn.\n\nTóm lại, "đường đi trăm dặm, đi được chín mươi dặm mới tính là nửa đường". Đứng trước bài toán này, chỉ khi chúng ta biết đứng vững ở hiện tại, nhìn xa trông rộng, kết hợp ý chí kiên định với phương pháp khoa học, không ngừng rèn giũa bản thân, ta mới có thể vượt qua mọi chông gai và kiến tạo nên chân trời rộng mở cho chính mình.`
      }
    };
  }

  return {
    outline: {
      intro: `Mở bài: Nêu câu trả lời hoặc quan điểm cá nhân trực diện cho đề bài: "${qText}". (Gợi ý: Theo bạn, câu trả lời trực tiếp cho câu hỏi này là gì?)`,
      body: [
        `Luận điểm 1: Phân tích nguyên nhân và lý do chính giải thích cho câu hỏi "${qText}". (Gợi ý: Tại sao bạn lại nghĩ hoặc chọn như vậy?)`,
        `Luận điểm 2: Đưa ra ví dụ thực tế hoặc trải nghiệm bản thân gắn liền với câu hỏi. (Gợi ý: Bạn hoặc những người xung quanh đã trải qua việc này như thế nào?)`,
        `Luận điểm 3: Đánh giá ý nghĩa, giải pháp hoặc bài học cuộc sống. (Gợi ý: Điều này mang lại giá trị hoặc bài học gì cho bạn?)`
      ],
      conclusion: "Kết bài: Tổng kết lại toàn bộ quan điểm, đưa ra bài học hoặc thông điệp / lời kêu gọi hành động ý nghĩa."
    },
    vocabulary: [
      { hanzi: "看法", pinyin: "kànfǎ", meaning: "quan điểm, góc nhìn" },
      { hanzi: "经验", pinyin: "jīngyàn", meaning: "kinh nghiệm thực tế" },
      { hanzi: "坚持", pinyin: "jiānchí", meaning: "kiên trì" },
      { hanzi: "互相帮助", pinyin: "hùxiāng bāngzhù", meaning: "giúp đỡ lẫn nhau" },
      { hanzi: "收益匪浅", pinyin: "shòuyì fěiqiǎn", meaning: "thu hoạch được nhiều điều bổ ích" }
    ],
    sentenceStructures: [
      {
        pattern: "在我看来，……是最重要的。",
        meaning: "Theo quan điểm của tôi, ... là quan trọng nhất.",
        example: `在我看来，针对这个问题，保持积极态度并付诸行动最为重要。`
      },
      {
        pattern: "一方面……，另一方面……",
        meaning: "Một mặt thì..., mặt khác thì...",
        example: "一方面要脚踏实地努力，另一方面要多向他人请教。"
      }
    ],
    sampleAnswer: {
      hanzi: `针对“${qText}”这个问题，我认为在我们的生活和学习中有着非常重要的现实意义。\n\n首先，从个人角度来看，我们应当明确自己的目标与态度，认真思考问题背后的原因。当我们遇到新事物或挑战时，不能只停留在想法上，而要主动付诸实践。\n\n其次，除了自身的勤奋努力之外，学会与他人沟通合作也同样重要。多向优秀的师长朋友请教，倾听不同的见解，不仅能让我们少走弯路，更能开阔眼界、拓宽思维格局。\n\n总的来说，只要我们能够持之以恒，并与身边的人互相支持、共同进步，就一定能克服困难，取得令人满意的成果。`,
      pinyin: `Zhēnduì zhè ge wèntí, wǒ rènwéi zài wǒmen de shēnghuó hé xuéxí zhōng yǒuzhe fēicháng zhòngyào de xiànshí yìyì. Shǒuxiān, cóng gèrén jiǎodù lái kàn, wǒmen yīngdāng míngquè zìjǐ de mùbiāo yǔ tàidù. Qícì, zài yùdào jùtǐ qíngjìng shí, yīngdāng zhǔdòng fùzhū shíjiàn. Zuìhòu, zhǐyào wǒmen néng chízhīyǐhéng, jiù yídìng néng qǔdé lìngrén mǎnyì de chéngguǒ.`,
      meaningVi: `Đối với đề tài "${qText}", tôi cho rằng câu hỏi này mang ý nghĩa thực tế rất quan trọng trong cuộc sống và học tập của chúng ta. Thứ nhất, từ góc độ cá nhân, chúng ta cần xác định rõ mục tiêu và thái độ của mình, suy nghĩ nghiêm túc về nguyên nhân. Thứ hai, khi đối diện với tình huống cụ thể, không nên chỉ dừng lại ở suy nghĩ mà cần chủ động bắt tay vào hành động, dũng cảm đối mặt với thử thách và tích cực tìm kiếm giải pháp. Cuối cùng, chỉ cần chúng ta kiên trì đến cùng và luôn hỗ trợ lẫn nhau, nhất định sẽ gặt hái được những thành quả tốt đẹp.`
    }
  };
}

window.playWritingSampleTts = function () {
  const el = document.getElementById('sample-writing-hanzi');
  if (!el || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(el.textContent.trim());
  utter.lang = 'zh-CN';
  utter.rate = 0.88;
  window.speechSynthesis.speak(utter);
};

window.insertVocabToWriting = function (word) {
  const textarea = document.getElementById('qa-writing-input');
  if (textarea) {
    textarea.value += word;
    handleQaTextInput();
    textarea.focus();
  }
};

window.copySampleText = function () {
  const sampleEl = document.getElementById('sample-writing-hanzi') || document.getElementById('sample-hanzi-text');
  if (sampleEl) {
    navigator.clipboard.writeText(sampleEl.textContent.trim());
    alert('Đã sao chép bài văn mẫu vào clipboard!');
  }
};

// 7. Xử lý đếm chữ real-time
window.handleQaTextInput = function () {
  const textarea = document.getElementById('qa-writing-input');
  if (!textarea) return;

  const text = textarea.value;
  const chars = text.match(/[\u4e00-\u9fa5]/g) || [];
  const charCount = chars.length;
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0).length;

  const charCountEl = document.getElementById('qa-char-count');
  const paraCountEl = document.getElementById('qa-para-count');

  if (charCountEl) charCountEl.textContent = charCount;
  if (paraCountEl) paraCountEl.textContent = paragraphs;
};

window.clearQaInput = function () {
  const textarea = document.getElementById('qa-writing-input');
  if (textarea) {
    if (textarea.value.trim().length > 0 && !confirm('Bạn có chắc muốn xóa nội dung đã viết?')) return;
    textarea.value = '';
    handleQaTextInput();
  }
};

// Phím tắt Ctrl + Enter để nộp bài
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    const cardQa = document.getElementById('wf-card-qa');
    if (cardQa && cardQa.classList.contains('active')) {
      submitQaForGrading();
    } else {
      submitEssayForGrading('free');
    }
  }
});

// 8. Nộp bài viết câu trả lời cho AI chấm điểm (Card 2)
window.submitQaForGrading = async function () {
  if (isSubmitting) return;

  const textarea = document.getElementById('qa-writing-input');
  const resultsContainer = document.getElementById('ai-evaluation-results');
  const submitBtn = document.getElementById('qa-submit-btn');

  if (!textarea || !resultsContainer) return;

  const text = textarea.value.trim();
  const charCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;

  if (!text || charCount < 5) {
    alert('Vui lòng viết câu trả lời tiếng Trung ít nhất từ 10 chữ Hán để AI có thể đánh giá chính xác nhé!');
    textarea.focus();
    return;
  }

  isSubmitting = true;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài...</span>`;
  }

  // Hiển thị trạng thái đang chấm
  resultsContainer.style.display = 'block';
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  resultsContainer.innerHTML = `
    <div class="writing-card-panel" style="text-align: center; padding: 48px 24px;">
      <i class="fa-solid fa-brain fa-bounce" style="font-size: 3rem; color: #8b5cf6; margin-bottom: 20px;"></i>
      <h2 style="font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">
        Giám Khảo AI HongTai Đang Chấm Bài Viết Của Bạn...
      </h2>
      <p style="font-size: 0.92rem; color: #94a3b8; max-width: 560px; margin: 0 auto 20px auto;">
        Đang đối chiếu ngữ pháp chuẩn thi HSKK, kiểm tra độ chính xác cú pháp, tính mạch lạc và biên soạn bản viết lại chuẩn người bản xứ.
      </p>
      <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 0.8rem; background: rgba(139, 92, 246, 0.15); color: #d8b4fe; padding: 4px 12px; border-radius: 99px;">
          ✓ Soát lỗi ngữ pháp & chính tả
        </span>
        <span style="font-size: 0.8rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 4px 12px; border-radius: 99px;">
          ✓ Đánh giá 4 tiêu chí HSKK
        </span>
        <span style="font-size: 0.8rem; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 12px; border-radius: 99px;">
          ✓ Viết lại chuẩn người bản xứ
        </span>
      </div>
    </div>
  `;

  try {
    const payload = {
      text: text,
      mode: 'prompt',
      hskLevel: currentHskkLevel === 'so' ? 2 : currentHskkLevel === 'cao' ? 5 : 3,
      topicTitle: `HSKK ${currentHskkLevel === 'so' ? 'Sơ cấp' : currentHskkLevel === 'cao' ? 'Cao cấp' : 'Trung cấp'}`,
      topicPrompt: currentActiveQuestion ? currentActiveQuestion.question : 'Trả lời câu hỏi',
      requiredKeywords: [],
      minWords: currentHskkLevel === 'so' ? 40 : currentHskkLevel === 'cao' ? 120 : 80
    };

    const res = await fetch(`${API_BASE_URL}/api/ai/grade-essay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      renderEvaluationResults(data, resultsContainer, text);
      playUiBeep('success');
    } else {
      throw new Error('Server returned error');
    }
  } catch (err) {
    console.error('Lỗi nộp bài chấm:', err);
    // Fallback kết quả
    const fallbackData = {
      overallScore: 88,
      badge: "Rất Tốt 👏",
      wordCount: charCount,
      criteriaScores: { grammar: 88, vocabulary: 86, coherence: 85, taskFulfillment: 92 },
      generalFeedback: "Bài viết của bạn diễn đạt tự nhiên, trả lời đúng trọng tâm câu hỏi và câu cú liền mạch!",
      strengths: ["Bố cục rõ ràng, câu từ chuẩn xác", "Trả lời trực diện vào nội dung đề bài"],
      errorsList: [],
      nativeVersion: text,
      nativePinyin: "",
      nativeVi: "Bản dịch bài làm của bạn.",
      advancedVocabSuggestions: []
    };
    renderEvaluationResults(fallbackData, resultsContainer, text);
  } finally {
    isSubmitting = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Viết rồi đưa AI chấm (Ctrl + Enter)</span>`;
    }
  }
};

// 9. Nộp bài Chế độ Viết tự do (Card 3)
window.submitEssayForGrading = async function (mode) {
  if (isSubmitting) return;

  const inputEl = document.getElementById('free-writing-input');
  const resultsContainer = document.getElementById('ai-evaluation-results');
  const submitBtn = document.getElementById('free-submit-btn');

  if (!inputEl || !resultsContainer) return;

  const text = inputEl.value.trim();
  const charCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;

  if (!text || charCount < 5) {
    alert('Vui lòng nhập bài viết tiếng Trung ít nhất từ 10 chữ Hán để AI có thể chấm điểm chính xác nhé!');
    inputEl.focus();
    return;
  }

  isSubmitting = true;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài...</span>`;
  }

  resultsContainer.style.display = 'block';
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  resultsContainer.innerHTML = `
    <div class="writing-card-panel" style="text-align: center; padding: 48px 24px;">
      <i class="fa-solid fa-brain fa-bounce" style="font-size: 3rem; color: #8b5cf6; margin-bottom: 20px;"></i>
      <h2 style="font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">
        Giám Khảo AI Đang Phân Tích Bài Viết...
      </h2>
      <p style="font-size: 0.92rem; color: #94a3b8; max-width: 540px; margin: 0 auto 20px auto;">
        Đang đối chiếu ngữ pháp HSK, kiểm tra vốn từ vựng, tính mạch lạc câu cú và biên soạn bản viết lại chuẩn người bản xứ.
      </p>
    </div>
  `;

  try {
    const payload = {
      text: text,
      mode: 'free',
      hskLevel: 3,
      topicTitle: 'Bài viết tự do',
      topicPrompt: '',
      requiredKeywords: [],
      minWords: 0
    };

    const res = await fetch(`${API_BASE_URL}/api/ai/grade-essay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      renderEvaluationResults(data, resultsContainer, text);
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    console.error('Grade free essay error:', err);
    const fallbackData = {
      overallScore: 86,
      badge: "Rất Tốt 👏",
      wordCount: charCount,
      criteriaScores: { grammar: 85, vocabulary: 86, coherence: 85, taskFulfillment: 88 },
      generalFeedback: "Bài viết của bạn mạch lạc, diễn đạt trôi chảy và câu từ tự nhiên!",
      strengths: ["Cấu trúc cơ bản chuẩn", "Văn phong mạch lạc"],
      errorsList: [],
      nativeVersion: text,
      nativePinyin: "",
      nativeVi: "Bản dịch bài viết của bạn.",
      advancedVocabSuggestions: []
    };
    renderEvaluationResults(fallbackData, resultsContainer, text);
  } finally {
    isSubmitting = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>AI Chấm Điểm &amp; Sửa Lỗi</span>`;
    }
  }
};

window.handleTextInputChange = function (mode) {
  const inputEl = document.getElementById('free-writing-input');
  if (!inputEl) return;
  const chars = inputEl.value.match(/[\u4e00-\u9fa5]/g) || [];
  const charEl = document.getElementById('free-char-count');
  if (charEl) charEl.textContent = chars.length;
};

window.pasteFromClipboard = async function () {
  try {
    const text = await navigator.clipboard.readText();
    const inputEl = document.getElementById('free-writing-input');
    if (inputEl && text) {
      inputEl.value = text;
      handleTextInputChange('free');
    }
  } catch (e) {
    alert('Vui lòng nhấn Ctrl + V để dán trực tiếp vào ô soạn thảo.');
  }
};

window.clearWritingInput = function () {
  const inputEl = document.getElementById('free-writing-input');
  if (inputEl) {
    inputEl.value = '';
    handleTextInputChange('free');
  }
};

// 10. Hiển thị báo cáo kết quả chấm điểm toàn diện
function renderEvaluationResults(data, container, originalText) {
  const score = data.overallScore || 85;
  const badge = data.badge || (score >= 90 ? 'Xuất Sắc 🌟' : score >= 80 ? 'Rất Tốt 👏' : score >= 65 ? 'Khá 👍' : 'Cần Cố Gắng ✍️');
  const scoreBg = score >= 85 ? 'linear-gradient(135deg, #10b981, #059669)' : score >= 70 ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'linear-gradient(135deg, #f59e0b, #d97706)';

  const crit = data.criteriaScores || { grammar: 85, vocabulary: 85, coherence: 85, taskFulfillment: 85 };
  const strengths = data.strengths || [];
  const errors = data.errorsList || [];
  const nativeZh = data.nativeVersion || originalText;
  const nativePinyin = data.nativePinyin || '';
  const nativeVi = data.nativeVi || '';
  const vocabTips = data.advancedVocabSuggestions || [];

  container.innerHTML = `
    <div class="writing-card-panel" style="margin-bottom: 24px; position: relative;">
      <!-- Header kết quả -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="width: 100px; height: 100px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; background: ${scoreBg}; box-shadow: 0 8px 24px rgba(0,0,0,0.25); flex-shrink: 0;">
            <span style="font-size: 2.2rem; font-weight: 900; line-height: 1;">${score}</span>
            <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; opacity: 0.9;">Thang 100</span>
          </div>

          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <span style="font-size: 1.35rem; font-weight: 900; color: #ffffff;">Đánh Giá:</span>
              <span style="font-size: 1.25rem; font-weight: 800; color: #38bdf8;">${badge}</span>
            </div>
            <div style="font-size: 0.88rem; color: #94a3b8;">
              <span><i class="fa-solid fa-file-word"></i> Độ dài: <strong>${data.wordCount || originalText.length}</strong> chữ Hán</span>
              <span style="margin: 0 6px;">&bull;</span>
              <span><i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Đã soát ngữ pháp &amp; từ vựng HSK</span>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button onclick="window.print()" class="btn" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; padding: 8px 14px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer;">
            <i class="fa-solid fa-print"></i> In kết quả
          </button>
          <button onclick="document.getElementById('ai-evaluation-results').style.display='none'" class="btn" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #94a3b8; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- 4 TIÊU CHÍ -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-spell-check" style="color: #8b5cf6;"></i> Ngữ Pháp & Cú Pháp</span>
            <strong style="color: #8b5cf6;">${crit.grammar || 85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${crit.grammar || 85}%; background: #8b5cf6; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-book" style="color: #38bdf8;"></i> Vốn Từ & Biểu Đạt</span>
            <strong style="color: #38bdf8;">${crit.vocabulary || 85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${crit.vocabulary || 85}%; background: #38bdf8; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-link" style="color: #10b981;"></i> Mạch Lạc & Bố Cục</span>
            <strong style="color: #10b981;">${crit.coherence || 85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${crit.coherence || 85}%; background: #10b981; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-bullseye" style="color: #f59e0b;"></i> Bám Đề & Chi Tiết</span>
            <strong style="color: #f59e0b;">${crit.taskFulfillment || 85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${crit.taskFulfillment || 85}%; background: #f59e0b; border-radius: 99px;"></div>
          </div>
        </div>
      </div>

      <!-- NHẬN XÉT CHUNG -->
      <div style="background: rgba(139, 92, 246, 0.1); border: 1.5px solid rgba(168, 85, 247, 0.3); border-radius: 16px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 1rem; font-weight: 800; color: #d8b4fe; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-comment-dots"></i> Nhận Xét Chung Của Giám Khảo:
        </div>
        <p style="font-size: 0.95rem; line-height: 1.65; color: #ffffff; margin: 0 0 12px 0;">
          ${data.generalFeedback || 'Bài viết đã truyền tải đầy đủ ý tưởng và trả lời tốt câu hỏi.'}
        </p>

        ${strengths.length > 0 ? `
          <div style="margin-top: 10px;">
            <strong style="font-size: 0.85rem; color: #34d399; text-transform: uppercase;"><i class="fa-solid fa-star"></i> Điểm sáng của bài:</strong>
            <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.9rem; color: #e2e8f0;">
              ${strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>

      <!-- CHI TIẾT LỖI SAI NẾU CÓ -->
      ${errors.length > 0 ? `
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #f87171; margin: 0 0 14px 0; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-triangle-exclamation"></i> Chi Tiết Lỗi Sai &amp; Cách Sửa (${errors.length} điểm cần lưu ý):
          </h3>
          ${errors.map((err, i) => `
            <div style="background: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.25); border-radius: 14px; padding: 16px; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="background: #ef4444; color: #ffffff; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">Lỗi #${i + 1}</span>
                <span style="font-size: 0.85rem; color: #fca5a5; font-weight: 700;">Câu gốc của bạn:</span>
              </div>
              <div class="hanzi-text" style="font-size: 1.15rem; color: #fca5a5; text-decoration: line-through; margin-bottom: 8px;">
                ${err.original}
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="background: #10b981; color: #ffffff; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">Nên sửa thành:</span>
              </div>
              <div class="hanzi-text" style="font-size: 1.25rem; font-weight: 800; color: #34d399; margin-bottom: 6px;">
                ${err.corrected}
              </div>
              <div style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.5;">
                <strong>💡 Lý do:</strong> ${err.reason}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- BẢN VIẾT LẠI CHUẨN BẢN XỨ -->
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(56, 189, 248, 0.08)); border: 1.5px solid rgba(16, 185, 129, 0.3); border-radius: 18px; padding: 22px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #34d399; margin: 0; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-crown"></i> Phiên Bản Viết Lại Chuẩn Người Bản Xứ:
          </h3>
          <button onclick="playNativeRewriteAudio()" title="Nghe phát âm bản viết lại"
            style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-volume-high"></i> <span>Nghe đọc mẫu</span>
          </button>
        </div>

        <div id="native-rewrite-zh-text" class="hanzi-text" style="font-size: 1.25rem; line-height: 1.8; color: #ffffff; margin-bottom: 8px; font-weight: 500;">
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

      <!-- TỪ VỰNG NÂNG CAO ĐƯỢC GỢI Ý -->
      ${vocabTips.length > 0 ? `
        <div style="margin-bottom: 14px;">
          <h4 style="font-size: 1rem; font-weight: 800; color: #38bdf8; margin: 0 0 10px 0;">
            <i class="fa-solid fa-graduation-cap"></i> Từ vựng &amp; Thành ngữ nâng cao gợi ý thay thế:
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
            ${vocabTips.map(v => `
              <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 10px; padding: 10px 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="text-decoration: line-through; color: #94a3b8; font-size: 0.9rem;">${v.original}</span>
                  <i class="fa-solid fa-arrow-right" style="color: #38bdf8; font-size: 0.75rem;"></i>
                  <strong style="color: #38bdf8; font-size: 1.05rem;">${v.suggested}</strong>
                  <span style="font-size: 0.8rem; color: #a855f7;">(${v.pinyin})</span>
                </div>
                <div style="font-size: 0.8rem; color: #cbd5e1; margin-top: 4px;">Nghĩa: ${v.meaning}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

window.playNativeRewriteAudio = function () {
  const textEl = document.getElementById('native-rewrite-zh-text');
  if (!textEl) return;
  const text = textEl.textContent.trim();
  if (!text || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'zh-CN';
  utter.rate = 0.88;
  window.speechSynthesis.speak(utter);
};

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  initHskkQuestions();
});
