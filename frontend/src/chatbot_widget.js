/**
 * Global AI Chatbot Widget Coordinator for Tiếng Trung Hongtai
 * Tự động tạo và điều khiển Trợ lý AI Hongtai trên tất cả các trang
 */

(function () {
  'use strict';

  const API_BASE_URL = window.location.origin.includes('5173')
    ? 'http://localhost:5000'
    : window.location.origin;

  function getCurrentUser() {
    try {
      const stored = localStorage.getItem('user') || localStorage.getItem('hongtai_current_user') || localStorage.getItem('currentUser') || sessionStorage.getItem('user');
      if (stored) return JSON.parse(stored);
    } catch (e) { }
    return null;
  }

  function getAuthHeaders(extra = {}) {
    const user = getCurrentUser();
    const headers = { ...extra };
    if (user && user.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    return headers;
  }

  function mountGlobalChatbot() {
    if (document.getElementById('chatbot-widget')) return;

    const widget = document.createElement('div');
    widget.className = 'chatbot-widget';
    widget.id = 'chatbot-widget';

    widget.innerHTML = `
      <!-- Chat Toggle Button -->
      <button class="chatbot-toggle-btn" id="chatbot-toggle-btn"
        title="Trò chuyện với Trợ lý AI Hongtai">
        <i class="fa-solid fa-comments"></i>
        <span class="chatbot-badge" id="chatbot-badge">1</span>
      </button>

      <!-- Chat Window Panel -->
      <div class="chatbot-panel glass-panel" id="chatbot-panel" style="display: none;">
        <!-- Chat Header -->
        <div class="chatbot-header">
          <div class="chatbot-title-wrap">
            <div class="chatbot-avatar">
              <i class="fa-solid fa-robot"></i>
            </div>
            <div>
              <h4 class="chatbot-name">Trợ lý AI Hongtai</h4>
              <span class="chatbot-status"><span class="status-dot"></span> Đang hoạt động</span>
            </div>
          </div>
          <div class="chatbot-header-actions" style="display: flex; gap: 10px; align-items: center;">
            <button class="chatbot-header-action-btn" id="chatbot-side-dock-btn" title="Chuyển sang bên khác (Trái/Phải né bút)">
              <i class="fa-solid fa-arrow-right-arrow-left"></i>
            </button>
            <button class="chatbot-header-action-btn" id="chatbot-new-btn" title="Cuộc trò chuyện mới" style="display: flex;">
              <i class="fa-solid fa-plus"></i>
            </button>
            <button class="chatbot-header-action-btn" id="chatbot-history-btn" title="Lịch sử trò chuyện" style="display: flex;">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </button>
            <button class="chatbot-close-btn" id="chatbot-close-btn" title="Đóng">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <!-- Chat Messages Area -->
        <div class="chatbot-messages" id="chatbot-messages">
          <div class="chat-message bot">
            Chào bạn! Tôi là <strong>Trợ lý AI Hongtai</strong> 🐼. Bạn cần tôi hỗ trợ giải nghĩa từ vựng HSK, sửa phát âm Pinyin hay luyện ngữ pháp tiếng Trung hôm nay không?
          </div>
        </div>

        <!-- Typing Indicator -->
        <div class="chatbot-typing" id="chatbot-typing" style="display: none;">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>

        <!-- Chat Input Area -->
        <div class="chatbot-input-area">
          <input type="text" id="chatbot-input" aria-label="Hỏi trợ lý AI"
            placeholder="Hỏi nghĩa từ, dịch thuật, ngữ pháp..." autocomplete="off">
          <button id="chatbot-send-btn" title="Gửi tin nhắn">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    initChatbotEvents(widget);
  }

  function initChatbotEvents(widget) {
    const toggleBtn = widget.querySelector('#chatbot-toggle-btn');
    const panel = widget.querySelector('#chatbot-panel');
    const closeBtn = widget.querySelector('#chatbot-close-btn');
    const sendBtn = widget.querySelector('#chatbot-send-btn');
    const input = widget.querySelector('#chatbot-input');
    const messagesContainer = widget.querySelector('#chatbot-messages');
    const typingIndicator = widget.querySelector('#chatbot-typing');
    const badge = widget.querySelector('#chatbot-badge');
    const newBtn = widget.querySelector('#chatbot-new-btn');
    const historyBtn = widget.querySelector('#chatbot-history-btn');
    const dockSideBtn = widget.querySelector('#chatbot-side-dock-btn');

    let chatHistory = [];
    let activeThreadId = sessionStorage.getItem('hongtai_active_thread_id') || null;

    // Load dock side preference
    const savedDockSide = localStorage.getItem('hongtai_chatbot_dock_side');
    if (savedDockSide === 'left') {
      widget.classList.add('dock-left');
    }

    function toggleChatbotPanel() {
      const isHidden = panel.style.display === 'none';
      panel.style.display = isHidden ? 'flex' : 'none';
      document.body.classList.toggle('chatbot-panel-open', isHidden);
      if (isHidden) {
        if (badge) badge.style.display = 'none';
        if (input) input.focus();
        scrollChatToBottom();
      }
    }

    function closeChatbotPanel() {
      panel.style.display = 'none';
      document.body.classList.remove('chatbot-panel-open');
    }

    function toggleChatbotSide() {
      const isLeft = widget.classList.toggle('dock-left');
      localStorage.setItem('hongtai_chatbot_dock_side', isLeft ? 'left' : 'right');
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleChatbotPanel();
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeChatbotPanel();
    });

    dockSideBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleChatbotSide();
    });

    document.addEventListener('click', (e) => {
      if (panel && panel.style.display !== 'none') {
        if (!panel.contains(e.target) && !toggleBtn.contains(e.target)) {
          closeChatbotPanel();
        }
      }
    });

    if (newBtn) {
      newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        activeThreadId = null;
        sessionStorage.removeItem('hongtai_active_thread_id');
        chatHistory = [];
        messagesContainer.innerHTML = `
          <div class="chat-message bot">
            Chào bạn! Tôi là <strong>Trợ lý AI Hongtai</strong> 🐼. Bạn cần tôi hỗ trợ giải nghĩa từ vựng HSK, sửa phát âm Pinyin hay luyện ngữ pháp tiếng Trung hôm nay không?
          </div>
        `;
        scrollChatToBottom();
      });
    }

    if (historyBtn) {
      historyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.href = '/chat-history.html';
      });
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });

    function formatMarkdown(text) {
      if (!text) return '';
      let cleaned = text
        .replace(/^\s*\|?\s*[-:]+[-|\s:]*$/gm, '')
        .replace(/^\s*\|\s*(.*?)\s*\|\s*$/gm, (match, inner) => {
          const parts = inner.split(/\s*\|\s*/).map(p => p.trim()).filter(Boolean);
          return parts.length ? '• ' + parts.join(' — ') : '';
        });

      let escaped = cleaned
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      escaped = escaped.replace(/^[-•]\s+(.*)$/gm, '<div class="chat-bullet-line"><span class="chat-bullet-dot">•</span> <span>$1</span></div>');
      escaped = escaped.replace(/\n{3,}/g, '\n\n').replace(/\n/g, '<br>');

      return escaped;
    }

    function appendChatMessage(role, content) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-message ${role === 'assistant' ? 'bot' : 'user'}`;
      if (role === 'assistant') {
        msgDiv.innerHTML = formatMarkdown(content);
      } else {
        msgDiv.textContent = content;
      }
      messagesContainer.appendChild(msgDiv);
    }

    function scrollChatToBottom() {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function sendMessage() {
      const content = input.value.trim();
      if (!content) return;

      input.value = '';
      appendChatMessage('user', content);
      chatHistory.push({ role: 'user', content });
      scrollChatToBottom();

      typingIndicator.style.display = 'flex';
      scrollChatToBottom();

      const user = getCurrentUser();

      try {
        const payload = { messages: chatHistory };
        if (activeThreadId) payload.threadId = activeThreadId;
        if (user && user.email) payload.userEmail = user.email;

        const response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(payload),
          credentials: 'include'
        });

        typingIndicator.style.display = 'none';

        if (response.ok) {
          const data = await response.json();
          appendChatMessage('assistant', data.reply || 'Xin lỗi, tôi chưa thể trả lời lúc này.');
          chatHistory.push({ role: 'assistant', content: data.reply });
          if (data.threadId) {
            activeThreadId = data.threadId;
            sessionStorage.setItem('hongtai_active_thread_id', activeThreadId);
          }
        } else {
          appendChatMessage('assistant', '⚠️ Hệ thống đang bảo trì hoặc chưa thể kết nối AI. Vui lòng thử lại sau.');
        }
      } catch (err) {
        typingIndicator.style.display = 'none';
        appendChatMessage('assistant', '⚠️ Lỗi kết nối mạng đến máy chủ AI.');
      }

      scrollChatToBottom();
    }
  }

  // Auto mount when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountGlobalChatbot);
  } else {
    mountGlobalChatbot();
  }

  window.mountGlobalChatbot = mountGlobalChatbot;
})();
