/**
 * Tiếng Trung HongTai - AI Interactive Dialogue & Roleplay Practice
 */

const SCENARIOS = [
  {
    id: 'restaurant',
    icon: '🍜',
    title: 'Gọi món nhà hàng',
    userRole: 'Khách hàng',
    aiRole: 'Nhân viên phục vụ',
    desc: 'Tập gọi món, hỏi đồ ăn đặc sắc, yêu cầu phục vụ và thanh toán.'
  },
  {
    id: 'shopping',
    icon: '🛍️',
    title: 'Mua sắm & Mặc cả',
    userRole: 'Khách mua hàng',
    aiRole: 'Chủ tiệm / Nhân viên bán hàng',
    desc: 'Hỏi giá, kích cỡ, màu sắc và tập mặc cả giá hợp lý.'
  },
  {
    id: 'directions',
    icon: '🚕',
    title: 'Đi taxi & Hỏi đường',
    userRole: 'Khách đi đường',
    aiRole: 'Tài xế / Người dân địa phương',
    desc: 'Nói địa điểm muốn đến, hỏi khoảng cách và cách rẽ đường.'
  },
  {
    id: 'hotel',
    icon: '🏨',
    title: 'Đặt phòng khách sạn',
    userRole: 'Khách du lịch',
    aiRole: 'Lễ tân khách sạn',
    desc: 'Thủ tục nhận phòng, hỏi mật khẩu wifi, ăn sáng và trả phòng.'
  },
  {
    id: 'airport',
    icon: '✈️',
    title: 'Sân bay & Du lịch',
    userRole: 'Hành khách',
    aiRole: 'Nhân viên hàng không',
    desc: 'Làm thủ tục ký gửi hành lý, kiểm tra thẻ lên máy bay.'
  },
  {
    id: 'interview',
    icon: '💼',
    title: 'Phỏng vấn xin việc',
    userRole: 'Ứng viên',
    aiRole: 'Người phỏng vấn (HR)',
    desc: 'Giới thiệu bản thân, nói về ưu điểm và kinh nghiệm làm việc.'
  },
  {
    id: 'hospital',
    icon: '🏥',
    title: 'Đi khám bác sĩ',
    userRole: 'Bệnh nhân',
    aiRole: 'Bác sĩ',
    desc: 'Mô tả triệu chứng đau đầu, sốt, ho và nghe lời dặn dò uống thuốc.'
  },
  {
    id: 'cafe',
    icon: '☕',
    title: 'Trò chuyện bạn bè',
    userRole: 'Bạn thân',
    aiRole: 'Bạn người Trung Quốc',
    desc: 'Tán gẫu về sở thích, ẩm thực, thời tiết và kế hoạch cuối tuần.'
  }
];

let activeScenario = SCENARIOS[0];
let activeLevel = 'hsk2';
let messages = [];
let showPinyin = true;
let showVi = true;
let isRecording = false;
let speechRecognizer = null;

// 1. Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderScenarioGrid();
  startNewDialogue();
  initSpeechRecognition();
});

// Render scenarios grid
function renderScenarioGrid() {
  const grid = document.getElementById('scenario-grid');
  if (!grid) return;

  grid.innerHTML = SCENARIOS.map(sc => `
    <div class="scenario-card ${sc.id === activeScenario.id ? 'active' : ''}" onclick="selectScenario('${sc.id}')">
      <div style="font-size: 1.8rem;">${sc.icon}</div>
      <div style="font-weight: 800; font-size: 0.98rem; color: #fff;">${sc.title}</div>
      <div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4;">${sc.desc}</div>
    </div>
  `).join('');
}

// Select scenario
window.selectScenario = function (scId) {
  const found = SCENARIOS.find(s => s.id === scId);
  if (!found) return;
  activeScenario = found;
  renderScenarioGrid();

  // Update active header
  const iconEl = document.getElementById('active-scenario-icon');
  if (iconEl) iconEl.textContent = activeScenario.icon;

  const titleEl = document.getElementById('active-scenario-title');
  if (titleEl) titleEl.textContent = activeScenario.title;

  const descEl = document.getElementById('active-scenario-desc');
  if (descEl) descEl.textContent = `Bối cảnh: Bạn là ${activeScenario.userRole} • AI là ${activeScenario.aiRole}`;

  startNewDialogue();
};

// Switch Level
window.switchDiagLevel = function (lvl, btnEl) {
  activeLevel = lvl;
  document.querySelectorAll('.level-pill').forEach(b => {
    b.classList.remove('active');
    b.style.background = 'rgba(255, 255, 255, 0.08)';
    b.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    b.style.color = '#94a3b8';
  });
  if (btnEl) {
    btnEl.classList.add('active');
    btnEl.style.background = 'linear-gradient(135deg, #a855f7, #7c3aed)';
    btnEl.style.borderColor = '#c084fc';
    btnEl.style.color = '#fff';
  }
  startNewDialogue();
};

// Start a fresh dialogue session
async function startNewDialogue() {
  messages = [];
  renderMessages();
  renderSuggestions([]);

  const area = document.getElementById('chat-messages-area');
  if (area) {
    area.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
        <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.6rem; color: #a855f7; margin-bottom: 12px; display: block;"></i>
        <span>AI đang chuẩn bị bối cảnh và câu mở đầu cho bạn...</span>
      </div>
    `;
  }

  try {
    const res = await fetch('/api/ai/dialogue/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: activeScenario.title,
        level: activeLevel,
        userRole: activeScenario.userRole,
        aiRole: activeScenario.aiRole
      })
    });

    if (res.ok) {
      const data = await res.json();
      messages.push({
        role: 'ai',
        zh: data.aiMessage.zh,
        pinyin: data.aiMessage.pinyin,
        vi: data.aiMessage.vi
      });
      renderMessages();
      renderSuggestions(data.suggestions || []);
      speakText(data.aiMessage.zh);
      return;
    }
  } catch (e) {
    console.warn('Lỗi gọi API dialogue start, dùng fallback:', e);
  }

  // Realistic fallback
  const fallback = getFallbackOpening(activeScenario.id);
  messages.push({
    role: 'ai',
    zh: fallback.zh,
    pinyin: fallback.pinyin,
    vi: fallback.vi
  });
  renderMessages();
  renderSuggestions(fallback.suggestions);
  speakText(fallback.zh);
}

// Send user message
window.sendUserMessage = async function () {
  const input = document.getElementById('dialogue-input');
  if (!input) return;
  const userText = input.value.trim();
  if (!userText) return;

  input.value = '';

  // Append user message
  messages.push({
    role: 'user',
    zh: userText,
    pinyin: '',
    vi: ''
  });
  renderMessages();
  renderSuggestions([]);

  // Show typing indicator
  showTypingBubble();

  try {
    const res = await fetch('/api/ai/dialogue/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: activeScenario.title,
        level: activeLevel,
        userRole: activeScenario.userRole,
        aiRole: activeScenario.aiRole,
        history: messages.slice(-6),
        userMessage: userText
      })
    });

    removeTypingBubble();

    if (res.ok) {
      const data = await res.json();

      // Attach feedback to user's last message if present
      if (data.feedback && messages.length >= 1) {
        messages[messages.length - 1].feedback = data.feedback;
      }

      // Add AI reply
      messages.push({
        role: 'ai',
        zh: data.aiMessage.zh,
        pinyin: data.aiMessage.pinyin,
        vi: data.aiMessage.vi
      });

      renderMessages();
      renderSuggestions(data.suggestions || []);
      speakText(data.aiMessage.zh);
      return;
    }
  } catch (e) {
    removeTypingBubble();
    console.warn('Lỗi gọi API dialogue reply:', e);
  }

  // Fallback reply
  messages.push({
    role: 'ai',
    zh: '好的，我明白了！请问您还有什么需要吗？',
    pinyin: 'Hǎo de, wǒ míngbai le! Qǐngwèn nín hái yǒu shénme xūyào ma?',
    vi: 'Dạ vâng, tôi hiểu rồi! Xin hỏi bạn còn cần gì nữa không ạ?'
  });
  renderMessages();
  renderSuggestions([
    { zh: '暂时没有了，谢谢。', pinyin: 'Zànshí méiyǒu le, xièxie.', vi: 'Tạm thời không có, cảm ơn.' },
    { zh: '请问一下这个多少钱？', pinyin: 'Qǐngwèn yíxià zhège duōshao qián?', vi: 'Cho hỏi cái này bao nhiêu tiền?' }
  ]);
};

// Render messages
function renderMessages() {
  const area = document.getElementById('chat-messages-area');
  if (!area) return;

  area.innerHTML = messages.map(msg => {
    const isAi = msg.role === 'ai';
    return `
      <div class="chat-bubble ${msg.role}">
        <div class="bubble-avatar ${msg.role}">
          <i class="fa-solid ${isAi ? 'fa-robot' : 'fa-user'}"></i>
        </div>
        <div class="bubble-content">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
            <div class="bubble-zh">${escapeHtml(msg.zh)}</div>
            <button onclick="speakText('${escapeHtml(msg.zh)}')" style="background: none; border: none; color: #38bdf8; font-size: 0.95rem; cursor: pointer; opacity: 0.8; transition: opacity 0.2s;" title="Phát âm câu này">
              <i class="fa-solid fa-volume-high"></i>
            </button>
          </div>
          ${msg.pinyin && showPinyin ? `<div class="bubble-pinyin">${escapeHtml(msg.pinyin)}</div>` : ''}
          ${msg.vi && showVi ? `<div class="bubble-vi">${escapeHtml(msg.vi)}</div>` : ''}
          ${msg.feedback ? `
            <div class="bubble-feedback">
              <div style="font-weight: 800; display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                <i class="fa-solid fa-award" style="color: #fbbf24;"></i> Điểm tự nhiên: ${msg.feedback.score || 90}/100
              </div>
              <div>${escapeHtml(msg.feedback.praise || '')}</div>
              ${msg.feedback.correction ? `<div style="color: #f87171; margin-top: 3px;">✍️ Góp ý: ${escapeHtml(msg.feedback.correction)}</div>` : ''}
              ${msg.feedback.tip ? `<div style="color: #38bdf8; margin-top: 3px;">💡 Mẹo: ${escapeHtml(msg.feedback.tip)}</div>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  area.scrollTop = area.scrollHeight;
}

// Render Suggestions
function renderSuggestions(suggestions) {
  const container = document.getElementById('suggestions-list');
  const strip = document.getElementById('suggestions-strip');
  if (!container || !strip) return;

  if (!suggestions || suggestions.length === 0) {
    strip.style.display = 'none';
    return;
  }

  strip.style.display = 'flex';
  container.innerHTML = suggestions.map((s, idx) => `
    <button class="suggestion-pill" onclick="applySuggestion('${escapeHtml(s.zh)}')">
      <span>${escapeHtml(s.zh)}</span>
      <span style="font-size: 0.75rem; opacity: 0.7;">(${escapeHtml(s.vi || '')})</span>
    </button>
  `).join('');
}

// Apply suggestion to input & send
window.applySuggestion = function (zh) {
  const input = document.getElementById('dialogue-input');
  if (input) {
    input.value = zh;
    window.sendUserMessage();
  }
};

// Typing indicator bubble
function showTypingBubble() {
  const area = document.getElementById('chat-messages-area');
  if (!area) return;
  const bubble = document.createElement('div');
  bubble.id = 'typing-bubble';
  bubble.className = 'chat-bubble ai';
  bubble.innerHTML = `
    <div class="bubble-avatar ai"><i class="fa-solid fa-robot"></i></div>
    <div class="bubble-content" style="color: #94a3b8; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;">
      <i class="fa-solid fa-circle-notch fa-spin" style="color: #a855f7;"></i> AI đang suy nghĩ phản hồi...
    </div>
  `;
  area.appendChild(bubble);
  area.scrollTop = area.scrollHeight;
}

function removeTypingBubble() {
  const bubble = document.getElementById('typing-bubble');
  if (bubble) bubble.remove();
}

// Speech Synthesis
window.speakText = function (text) {
  if (!text || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'zh-CN';
  utter.rate = 0.88;
  window.speechSynthesis.speak(utter);
};

// Web Speech API: Voice Recognition for Chinese
function initSpeechRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    const micBtn = document.getElementById('btn-mic');
    if (micBtn) {
      micBtn.title = 'Trình duyệt chưa hỗ trợ nhận diện giọng nói tiếng Trung';
      micBtn.style.opacity = '0.5';
    }
    return;
  }

  speechRecognizer = new SpeechRec();
  speechRecognizer.lang = 'zh-CN';
  speechRecognizer.continuous = false;
  speechRecognizer.interimResults = false;

  speechRecognizer.onstart = () => {
    isRecording = true;
    const micBtn = document.getElementById('btn-mic');
    if (micBtn) micBtn.classList.add('recording');
  };

  speechRecognizer.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById('dialogue-input');
    if (input) {
      input.value = transcript;
    }
  };

  speechRecognizer.onerror = (e) => {
    console.warn('Speech recognition error:', e.error);
    isRecording = false;
    const micBtn = document.getElementById('btn-mic');
    if (micBtn) micBtn.classList.remove('recording');
  };

  speechRecognizer.onend = () => {
    isRecording = false;
    const micBtn = document.getElementById('btn-mic');
    if (micBtn) micBtn.classList.remove('recording');
  };
}

window.toggleVoiceRecording = function () {
  if (!speechRecognizer) {
    alert('Trình duyệt của bạn hiện chưa hỗ trợ Web Speech API. Bạn vui lòng sử dụng Google Chrome hoặc Edge để dùng tính năng nói!');
    return;
  }

  if (isRecording) {
    speechRecognizer.stop();
  } else {
    try {
      speechRecognizer.start();
    } catch (e) {
      console.warn('Speech start error:', e);
    }
  }
};

// Toggles
window.togglePinyinDisplay = function () {
  showPinyin = !showPinyin;
  renderMessages();
};

window.toggleViDisplay = function () {
  showVi = !showVi;
  renderMessages();
};

window.restartDialogue = function () {
  startNewDialogue();
};

window.toggleScenarioSelector = function () {
  const box = document.getElementById('scenario-selector-box');
  const btnText = document.getElementById('btn-toggle-scenario-text');
  if (!box) return;

  const isHidden = box.style.display === 'none';
  box.style.display = isHidden ? 'block' : 'none';
  if (btnText) btnText.textContent = isHidden ? 'Đóng bối cảnh' : 'Đổi tình huống';
};

window.handleInputKeyDown = function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    window.sendUserMessage();
  }
};

// Fallbacks
function getFallbackOpening(id) {
  const map = {
    restaurant: {
      zh: '你好！欢迎光临，请问您一共几位？',
      pinyin: 'Nǐ hǎo! Huānyíng guānglín, qǐngwèn nín yígòng jǐ wèi?',
      vi: 'Xin chào! Hoan nghênh quý khách, xin hỏi quý khách đi tất cả mấy người?',
      suggestions: [
        { zh: '我们有两位。', pinyin: 'Wǒmen yǒu liǎng wèi.', vi: 'Chúng tôi có hai người.' },
        { zh: '就我一个人。', pinyin: 'Jiù wǒ yí gè rén.', vi: 'Chỉ có một mình tôi thôi.' },
        { zh: '请给我一张靠窗的桌子。', pinyin: 'Qǐng gěi wǒ yì zhāng kào chuāng de zhuōzi.', vi: 'Cho tôi bàn cạnh cửa sổ nhé.' }
      ]
    },
    shopping: {
      zh: '您好！想看点什么？这件衣服是今年最流行的款式。',
      pinyin: 'Nín hǎo! Xiǎng kàn diǎn shénme? Zhè jiàn yīfu shì jīnnián zuì liúxíng de kuǎnshì.',
      vi: 'Chào bạn! Bạn muốn xem gì? Chiếc áo này là mẫu thịnh hành nhất năm nay đó.',
      suggestions: [
        { zh: '这件衣服多少钱？', pinyin: 'Zhè jiàn yīfu duōshao qián?', vi: 'Chiếc áo này bao nhiêu tiền?' },
        { zh: '有大一点的尺码吗？', pinyin: 'Yǒu dà yìdiǎn de chǐmǎ ma?', vi: 'Có kích cỡ lớn hơn chút không?' },
        { zh: '可以试一下吗？', pinyin: 'Kěyǐ shì yíxià ma?', vi: 'Tôi có thể thử một chút không?' }
      ]
    },
    directions: {
      zh: '你好，请问您要去哪里？请上车吧！',
      pinyin: 'Nǐ hǎo, qǐngwèn nín yào qù nǎlǐ? Qǐng shàng chē ba!',
      vi: 'Xin chào, xin hỏi bạn muốn đi đâu? Mời lên xe!',
      suggestions: [
        { zh: '我要去火车站，谢谢。', pinyin: 'Wǒ yào qù huǒchēzhàn, xièxie.', vi: 'Tôi muốn đến ga tàu hỏa, cảm ơn.' },
        { zh: '去机场大概需要多长时间？', pinyin: 'Qù jīchǎng dàgài xūyào duō cháng shíjiān?', vi: 'Đi sân bay mất khoảng bao lâu?' },
        { zh: '到了请叫我一下。', pinyin: 'Dào le qǐng jiào wǒ yíxià.', vi: 'Đến nơi xin gọi tôi một tiếng nhé.' }
      ]
    }
  };

  return map[id] || map.restaurant;
}

// Utility: Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
