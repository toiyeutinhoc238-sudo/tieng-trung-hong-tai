/**
 * Tiếng Trung HongTai - AI Interactive Dialogue & Roleplay Practice
 */

let activeScenario = {
  title: 'Gọi món ở quán ăn',
  aiRole: 'Nhân viên phục vụ',
  userRole: 'Khách hàng',
  icon: '🍜'
};
let activeLevel = 'hsk2';
let activeIcon = '🍜';
let messages = [];
let showPinyin = true;
let showVi = true;
let isRecording = false;
let speechRecognizer = null;

// 1. Initialize
document.addEventListener('DOMContentLoaded', () => {
  startNewDialogue();
  initSpeechRecognition();
});

// Quick suggestions (Bấm để điền, vẫn sửa được - Chuẩn Hình 2)
window.applyQuickScenario = function (topic, aiRole, icon, btnEl) {
  const topicInput = document.getElementById('custom-topic-input');
  const roleInput = document.getElementById('custom-ai-role-input');

  if (topicInput) topicInput.value = topic;
  if (roleInput) roleInput.value = aiRole;
  activeIcon = icon || '💬';

  document.querySelectorAll('.quick-suggestion-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
};

// Select level in builder
window.selectBuilderLevel = function (lvl, btnEl) {
  activeLevel = lvl;
  document.querySelectorAll('.level-select-pill').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
};

// Bắt đầu trò chuyện từ Custom Builder
window.startCustomRoleplayChat = function () {
  const topicInput = document.getElementById('custom-topic-input');
  const roleInput = document.getElementById('custom-ai-role-input');

  const topic = (topicInput && topicInput.value.trim()) || 'Gọi món ở quán ăn';
  const aiRole = (roleInput && roleInput.value.trim()) || 'Nhân viên phục vụ';

  activeScenario = {
    title: topic,
    aiRole: aiRole,
    userRole: 'Bạn / Học viên',
    icon: activeIcon || '💬'
  };

  // Update active header
  const iconEl = document.getElementById('active-scenario-icon');
  if (iconEl) iconEl.textContent = activeScenario.icon;

  const titleEl = document.getElementById('active-scenario-title');
  if (titleEl) titleEl.textContent = activeScenario.title;

  const descEl = document.getElementById('active-scenario-desc');
  if (descEl) descEl.textContent = `Bối cảnh: Bạn • AI là ${activeScenario.aiRole}`;

  // Start dialogue
  startNewDialogue();

  // Scroll to chat workspace smoothly
  const workspace = document.getElementById('chat-workspace-panel');
  if (workspace) {
    workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// Toggle Custom Builder Visibility
window.toggleScenarioBuilder = function () {
  const builder = document.getElementById('custom-scenario-builder');
  const btnText = document.getElementById('btn-toggle-builder-text');
  if (!builder) return;

  const isHidden = builder.style.display === 'none';
  if (isHidden) {
    builder.style.display = 'block';
    if (btnText) btnText.textContent = 'Ẩn bối cảnh';
    builder.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    builder.style.display = 'none';
    if (btnText) btnText.textContent = 'Đổi tình huống';
  }
};

// Restart current dialogue
window.restartDialogue = function () {
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
  const fallback = getFallbackOpening(activeScenario.title, activeScenario.aiRole);
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
      <span class="suggestion-zh">${escapeHtml(s.zh)}</span>
      <span class="suggestion-vi">(${escapeHtml(s.vi || '')})</span>
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
function getFallbackOpening(topic, aiRole) {
  const t = topic || 'Gọi món ở quán ăn';
  const r = aiRole || 'Nhân viên phục vụ';

  if (t.includes('quán ăn') || t.includes('nhà hàng') || t.includes('món')) {
    return {
      zh: '您好！欢迎光临，请问您一共几位？您想先看看菜单吗？',
      pinyin: 'Nǐ hǎo! Huānyíng guānglín, qǐngwèn nín yígòng jǐ wèi? Nǐ xiǎng xiān kànkan càidān ma?',
      vi: 'Xin chào! Hoan nghênh quý khách, xin hỏi quý khách đi mấy người? Bạn muốn xem thực đơn trước không ạ?',
      suggestions: [
        { zh: '我们有两位。', pinyin: 'Wǒmen yǒu liǎng wèi.', vi: 'Chúng tôi có hai người.' },
        { zh: '请给我一份菜单。', pinyin: 'Qǐng gěi wǒ yí fèn càidān.', vi: 'Làm ơn cho tôi một cuốn thực đơn.' },
        { zh: '有什么特色菜推荐吗？', pinyin: 'Yǒu shénme tèsè cài tuījiàn ma?', vi: 'Có món ăn đặc sắc nào gợi ý không?' }
      ]
    };
  }

  if (t.includes('phỏng vấn') || t.includes('việc') || r.includes('tuyển dụng')) {
    return {
      zh: '你好，请坐！请先做一个简单的自我介绍吧。',
      pinyin: 'Nǐ hǎo, qǐng zuò! Qǐng xiān zuò yí gè jiǎndān de zìwǒ jièshào ba.',
      vi: 'Chào bạn, mời ngồi! Bạn hãy giới thiệu sơ lược về bản thân trước nhé.',
      suggestions: [
        { zh: '您好，我叫小明，毕业于中文系。', pinyin: 'Nǐ hǎo, wǒ jiào Xiǎomíng, bìyè yú zhōngwén xì.', vi: 'Chào bạn, tôi tên Tiểu Minh, tốt nghiệp khoa tiếng Trung.' },
        { zh: '非常高兴今天能来这里面试。', pinyin: 'Fēicháng gāoxìng jīntiān néng lái zhèlǐ miànshì.', vi: 'Rất vui vì hôm nay được đến đây phỏng vấn.' }
      ]
    };
  }

  return {
    zh: `你好！今天关于“${t}”，很高兴能和你交流。你想先聊点什么呢？`,
    pinyin: `Nǐ hǎo! Jīntiān guānyú "${t}", hěn gāoxìng néng hé nǐ jiāoliú. Nǐ xiǎng xiān liáo diǎn shénme ne?`,
    vi: `Xin chào! Hôm nay về chủ đề "${t}", rất vui được trò chuyện cùng bạn. Bạn muốn bắt đầu từ đâu nào?`,
    suggestions: [
      { zh: '你好，很高兴和你聊天！', pinyin: 'Nǐ hǎo, hěn gāoxìng hé nǐ liáotiān!', vi: 'Xin chào, rất vui được trò chuyện cùng bạn!' },
      { zh: '请多指教，我们开始吧。', pinyin: 'Qǐng duō zhǐjiào, wǒmen kāishǐ ba.', vi: 'Xin chỉ giáo thêm, chúng ta bắt đầu nhé.' }
    ]
  };
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
