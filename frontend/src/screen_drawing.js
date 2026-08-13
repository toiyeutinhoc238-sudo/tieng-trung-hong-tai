import html2canvas from 'html2canvas';

/**
 * ==============================================================================
 * SCREEN DRAWING & HANDWRITING NOTE TOOL (Bút Vẽ & Viết Tay Lên Màn Hình)
 * Tiếng Trung Hồng Thái - Công cụ hỗ trợ giảng dạy trực quan trên mọi giao diện
 * ==============================================================================
 */

class ScreenDrawingTool {
  constructor() {
    this.isActive = false;
    this.isDrawing = false;
    this.mode = 'pen'; // 'pen' | 'highlighter' | 'laser' | 'eraser'
    this.color = '#ef4444'; // default red
    this.lineWidth = 4;
    this.highlighterWidth = 28; // Default medium highlighter size
    this.laserWidth = 16;       // Default medium laser size
    this.eraserWidth = 28;      // Default medium eraser size
    this.history = [];
    this.redoStack = [];
    this.maxHistory = 20;
    this.laserTrails = [];
    this.laserAnimFrame = null;
    this.isVisible = true;

    // DOM Elements
    this.canvas = null;
    this.ctx = null;
    this.bubble = null;
    this.toolbar = null;
    this.eraserCursor = null;

    // Points buffer for smooth strokes
    this.lastX = 0;
    this.lastY = 0;

    // Dragging state for toolbar & bubble
    this.isDraggingBubble = false;
    this.isDraggingToolbar = false;

    this.init();
  }

  init() {
    if (document.getElementById('screen-drawing-canvas-overlay')) return;

    this.createCanvas();
    this.createFloatingBubble();
    this.createToolbar();
    this.bindEvents();
    this.initHotkeys();

    // Export global functions
    window.screenDrawingTool = this;
    window.toggleScreenDrawing = (force) => this.toggle(force);
    window.clearScreenDrawing = () => this.clear();
    window.setScreenDrawingMode = (mode) => this.setMode(mode);
    window.setScreenDrawingColor = (color) => this.setColor(color);
    window.setScreenDrawingWidth = (width) => this.setWidth(width);
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'screen-drawing-canvas-overlay';
    this.canvas.className = 'screen-drawing-canvas';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (this.canvas.width === width && this.canvas.height === height) {
      return;
    }

    let tempCanvas = null;
    if (this.canvas.width > 0 && this.canvas.height > 0) {
      tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;
      const tCtx = tempCanvas.getContext('2d');
      tCtx.drawImage(this.canvas, 0, 0);
    }

    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (tempCanvas) {
      this.ctx.drawImage(tempCanvas, 0, 0);
    }
  }

  createFloatingBubble() {
    this.bubble = document.createElement('div');
    this.bubble.id = 'screen-pen-floating-bubble';
    this.bubble.className = 'screen-pen-floating-bubble';
    this.bubble.title = 'Bật/Tắt Bút viết tay lên màn hình (Phím D)';
    this.bubble.innerHTML = `
      <div class="bubble-inner">
        <i class="fa-solid fa-pen-nib bubble-icon"></i>
      </div>
      <span class="bubble-badge" title="Chế độ giảng dạy">✏️</span>
    `;

    document.body.appendChild(this.bubble);
  }

  createToolbar() {
    this.toolbar = document.createElement('div');
    this.toolbar.id = 'screen-drawing-toolbar';
    this.toolbar.className = 'screen-drawing-toolbar';
    this.toolbar.style.display = 'none';

    this.toolbar.innerHTML = `
      <!-- Drag Handle -->
      <div class="dt-drag-handle" title="Kéo để di chuyển thanh công cụ">
        <i class="fa-solid fa-grip-vertical"></i>
      </div>

      <!-- Mode Buttons -->
      <div class="dt-group dt-modes">
        <button class="dt-btn active" data-mode="pen" title="Bút viết thường (Phím P)">
          <i class="fa-solid fa-pen"></i>
          <span class="dt-label">Bút</span>
        </button>
        <button class="dt-btn" data-mode="highlighter" title="Bút dạ quang / Tô sáng (Phím H)">
          <i class="fa-solid fa-highlighter"></i>
          <span class="dt-label">Dạ quang</span>
        </button>
        <button class="dt-btn" data-mode="laser" title="Bút laser chỉ điểm (Phím L)">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          <span class="dt-label">Laser</span>
        </button>
        <button class="dt-btn" data-mode="eraser" title="Tẩy nét vẽ (Phím E)">
          <i class="fa-solid fa-eraser"></i>
          <span class="dt-label">Tẩy</span>
        </button>
      </div>

      <div class="dt-divider"></div>

      <!-- Color Palette -->
      <div class="dt-group dt-colors">
        <button class="dt-color-btn active" data-color="#ef4444" style="background: #ef4444;" title="Đỏ"></button>
        <button class="dt-color-btn" data-color="#fbbf24" style="background: #fbbf24;" title="Vàng"></button>
        <button class="dt-color-btn" data-color="#10b981" style="background: #10b981;" title="Xanh lá"></button>
        <button class="dt-color-btn" data-color="#38bdf8" style="background: #38bdf8;" title="Xanh dương"></button>
        <button class="dt-color-btn" data-color="#c084fc" style="background: #c084fc;" title="Tím"></button>
        <button class="dt-color-btn" data-color="#ff7f50" style="background: #ff7f50;" title="Cam"></button>
        <button class="dt-color-btn" data-color="#facc15" style="background: #facc15;" title="Vàng chanh"></button>
        <button class="dt-color-btn" data-color="#ffffff" style="background: #ffffff; border: 1.5px solid rgba(255,255,255,0.5);" title="Trắng"></button>
        <button class="dt-color-btn" data-color="#000000" style="background: #000000;" title="Đen"></button>
        <!-- Custom color picker -->
        <label class="dt-color-picker-wrap" title="Chọn màu tùy ý">
          <input type="color" id="dt-custom-color-input" value="#ef4444" style="opacity:0;position:absolute;width:0;height:0;">
          <span class="dt-color-picker-btn" id="dt-custom-color-preview" style="background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red);">
            <i class="fa-solid fa-palette" style="font-size:0.72rem; color:#fff; text-shadow:0 1px 3px rgba(0,0,0,0.8);"></i>
          </span>
        </label>
      </div>

      <div class="dt-divider"></div>

      <!-- Size Selector -->
      <div class="dt-group dt-sizes">
        <button class="dt-size-btn active" data-size="3" title="Nét mảnh (3px)">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: currentColor;"></span>
        </button>
        <button class="dt-size-btn" data-size="6" title="Nét vừa (6px)">
          <span style="width: 10px; height: 10px; border-radius: 50%; background: currentColor;"></span>
        </button>
        <button class="dt-size-btn" data-size="12" title="Nét dày (12px)">
          <span style="width: 16px; height: 16px; border-radius: 50%; background: currentColor;"></span>
        </button>
        <button class="dt-size-btn" data-size="24" title="Nét cực to (24px)">
          <span style="width: 22px; height: 22px; border-radius: 50%; background: currentColor;"></span>
        </button>
      </div>

      <div class="dt-divider"></div>

      <!-- Actions -->
      <div class="dt-group dt-actions">
        <button class="dt-btn dt-action-btn" id="dt-undo-btn" title="Hoàn tác nét vẽ (Ctrl + Z)">
          <i class="fa-solid fa-rotate-left"></i>
        </button>
        <button class="dt-btn dt-action-btn" id="dt-redo-btn" title="Làm lại nét vẽ (Ctrl + Y)">
          <i class="fa-solid fa-rotate-right"></i>
        </button>
        <button class="dt-btn dt-action-btn dt-btn-clear" id="dt-clear-btn" title="Xóa sạch toàn bộ nét vẽ (Phím C)">
          <i class="fa-solid fa-trash-can"></i>
        </button>
        <button class="dt-btn dt-action-btn" id="dt-vis-btn" title="Ẩn/Hiện nét vẽ">
          <i class="fa-solid fa-eye"></i>
        </button>
        <button class="dt-btn dt-action-btn" id="dt-save-btn" title="Chụp & Cắt màn hình (Win + Shift + S / Shift + S)">
          <i class="fa-solid fa-camera"></i>
        </button>
      </div>

      <div class="dt-divider"></div>

      <!-- Close / Collapse Button -->
      <button class="dt-btn dt-close-btn" id="dt-close-btn" title="Thu gọn / Đóng chế độ vẽ (Phím D hoặc ESC)">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    document.body.appendChild(this.toolbar);
  }

  bindEvents() {
    let _wasDragged = false;

    // Bubble Click — fires on mouse click (desktop), skips if was dragged
    this.bubble.addEventListener('click', (e) => {
      if (_wasDragged) { _wasDragged = false; return; }
      e.stopPropagation();
      this.toggle();
    });

    // Bubble touchend — immediate response on mobile/tablet (no 300ms delay)
    this.bubble.addEventListener('touchend', (e) => {
      if (_wasDragged) { _wasDragged = false; return; }
      e.preventDefault(); // prevent ghost click after touchend
      e.stopPropagation();
      this.toggle();
    }, { passive: false });

    // Make Bubble Draggable (with 8px threshold — sets _wasDragged when drag occurs)
    this.makeDraggable(this.bubble, this.bubble,
      () => { _wasDragged = false; },
      () => { _wasDragged = true; }
    );

    // Make Toolbar Draggable
    const handle = this.toolbar.querySelector('.dt-drag-handle');
    this.makeDraggable(this.toolbar, handle);

    // Toolbar Tool Selection
    this.toolbar.querySelectorAll('.dt-modes .dt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setMode(btn.dataset.mode);
      });
    });

    // Color Selection
    this.toolbar.querySelectorAll('.dt-color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setColor(btn.dataset.color);
      });
    });

    // Size Selection (Tùy chỉnh kích thước riêng cho Bút vẽ, Dạ quang, Laser và Cục tẩy)
    this.toolbar.querySelectorAll('.dt-size-btn').forEach((btn, idx) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.mode === 'pen') {
          const penSizes = [3, 6, 12, 24];
          this.setWidth(penSizes[idx]);
        } else if (this.mode === 'highlighter') {
          const hlSizes = [15, 28, 48, 80];
          this.setHighlighterWidth(hlSizes[idx]);
        } else if (this.mode === 'laser') {
          const laserSizes = [8, 16, 30, 50];
          this.setLaserWidth(laserSizes[idx]);
        } else if (this.mode === 'eraser') {
          const eraserSizes = [12, 28, 56, 110];
          this.setEraserWidth(eraserSizes[idx]);
        }
      });
    });

    // Action Buttons
    const undoBtn = document.getElementById('dt-undo-btn');
    if (undoBtn) undoBtn.addEventListener('click', (e) => { e.stopPropagation(); this.undo(); });

    const redoBtn = document.getElementById('dt-redo-btn');
    if (redoBtn) redoBtn.addEventListener('click', (e) => { e.stopPropagation(); this.redo(); });

    const clearBtn = document.getElementById('dt-clear-btn');
    if (clearBtn) clearBtn.addEventListener('click', (e) => { e.stopPropagation(); this.clear(); });

    const visBtn = document.getElementById('dt-vis-btn');
    if (visBtn) visBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggleVisibility(); });

    const saveBtn = document.getElementById('dt-save-btn');
    if (saveBtn) saveBtn.addEventListener('click', (e) => { e.stopPropagation(); this.saveImage(); });

    const closeBtn = document.getElementById('dt-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggle(false); });

    // Custom Color Picker
    const customColorInput = document.getElementById('dt-custom-color-input');
    const customColorPreview = document.getElementById('dt-custom-color-preview');
    if (customColorInput) {
      customColorInput.addEventListener('input', (e) => {
        const newColor = e.target.value;
        this.setColor(newColor);
        // Deselect preset swatches
        this.toolbar.querySelectorAll('.dt-color-btn').forEach(b => b.classList.remove('active'));
        if (customColorPreview) {
          customColorPreview.style.background = newColor;
          customColorPreview.innerHTML = '';
        }
      });
      customColorInput.addEventListener('change', (e) => {
        const newColor = e.target.value;
        this.setColor(newColor);
        this.toolbar.querySelectorAll('.dt-color-btn').forEach(b => b.classList.remove('active'));
        if (customColorPreview) {
          customColorPreview.style.background = newColor;
          customColorPreview.innerHTML = '';
        }
      });
    }
    if (customColorPreview) {
      customColorPreview.addEventListener('click', (e) => {
        e.stopPropagation();
        if (customColorInput) customColorInput.click();
      });
    }

    // Pointer Events on Canvas
    this.canvas.addEventListener('pointerdown', (e) => this.handlePointerStart(e));
    this.canvas.addEventListener('pointermove', (e) => {
      this.updateEraserCursorPos(e);
      this.handlePointerMove(e);
    });
    this.canvas.addEventListener('pointerup', (e) => this.handlePointerEnd(e));
    this.canvas.addEventListener('pointercancel', (e) => this.handlePointerEnd(e));
    this.canvas.addEventListener('pointerleave', (e) => {
      if (this.eraserCursor) this.eraserCursor.style.display = 'none';
      this.handlePointerEnd(e);
    });
  }

  makeDraggable(targetEl, handleEl, onDragStart, onDragEnd) {
    const DRAG_THRESHOLD = 8; // px — move less than this = click, more = drag
    let startX = 0, startY = 0, initLeft = 0, initTop = 0;
    let pointerDown = false;
    let didDrag = false;

    const dragStart = (e) => {
      if (e.target.closest('button') && handleEl !== targetEl) return;
      pointerDown = true;
      didDrag = false;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      startX = clientX;
      startY = clientY;

      const rect = targetEl.getBoundingClientRect();
      initLeft = rect.left;
      initTop = rect.top;

      document.addEventListener('pointermove', dragMove);
      document.addEventListener('pointerup', dragStop);
    };

    const dragMove = (e) => {
      if (!pointerDown) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const dx = clientX - startX;
      const dy = clientY - startY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Only start actually dragging once threshold is crossed
      if (!didDrag && dist < DRAG_THRESHOLD) return;

      if (!didDrag) {
        // First time crossing threshold — lock position and fire onDragStart
        didDrag = true;
        targetEl.style.right = 'auto';
        targetEl.style.bottom = 'auto';
        targetEl.style.left = initLeft + 'px';
        targetEl.style.top = initTop + 'px';
        if (onDragStart) onDragStart();
      }

      const newLeft = Math.max(10, Math.min(window.innerWidth - targetEl.offsetWidth - 10, initLeft + dx));
      const newTop = Math.max(10, Math.min(window.innerHeight - targetEl.offsetHeight - 10, initTop + dy));

      targetEl.style.left = newLeft + 'px';
      targetEl.style.top = newTop + 'px';
    };

    const dragStop = () => {
      if (!pointerDown) return;
      pointerDown = false;
      document.removeEventListener('pointermove', dragMove);
      document.removeEventListener('pointerup', dragStop);
      if (didDrag && onDragEnd) onDragEnd();
      // If no drag happened, reset didDrag — the click event fires normally
      if (!didDrag) {
        // Nothing: let the natural click event on handleEl bubble through
      }
      didDrag = false;
    };

    handleEl.addEventListener('pointerdown', dragStart);
  }

  toggle(force) {
    this.isActive = typeof force === 'boolean' ? force : !this.isActive;
    this.canvas.classList.toggle('active', this.isActive);
    this.bubble.classList.toggle('active', this.isActive);
    this.toolbar.classList.toggle('active', this.isActive);
    this.toolbar.style.display = this.isActive ? 'flex' : 'none';

    document.body.classList.toggle('screen-drawing-active', this.isActive);

    if (this.isActive) {
      this.resizeCanvas();
      this.showToast('✏️ Đã BẬT Bút vẽ màn hình! Bạn có thể viết, vẽ hoặc ghi chú tự do.');
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.toolbar.querySelectorAll('.dt-modes .dt-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    this.canvas.setAttribute('data-mode', mode);
    this.updateSizeButtonsUI();
    if (mode !== 'eraser' && this.eraserCursor) {
      this.eraserCursor.style.display = 'none';
    }
  }

  setColor(color) {
    this.color = color;
    this.toolbar.querySelectorAll('.dt-color-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color === color);
    });
    // Reset custom color picker preview back to rainbow gradient when user picks a preset
    const previewEl = document.getElementById('dt-custom-color-preview');
    const inputEl = document.getElementById('dt-custom-color-input');
    if (previewEl && this.toolbar.querySelector(`.dt-color-btn[data-color="${color}"]`)) {
      previewEl.style.background = 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)';
      previewEl.innerHTML = `<i class="fa-solid fa-palette" style="font-size:0.72rem; color:#fff; text-shadow:0 1px 3px rgba(0,0,0,0.8);"></i>`;
    }
    if (inputEl) inputEl.value = color;
    if (this.mode === 'eraser') {
      this.setMode('pen');
    }
  }

  setWidth(width) {
    this.lineWidth = width;
    this.updateSizeButtonsUI();
  }

  setHighlighterWidth(width) {
    this.highlighterWidth = width;
    this.updateSizeButtonsUI();
  }

  setLaserWidth(width) {
    this.laserWidth = width;
    this.updateSizeButtonsUI();
  }

  setEraserWidth(width) {
    this.eraserWidth = width;
    this.updateSizeButtonsUI();
    if (this.eraserCursor) {
      this.eraserCursor.style.width = `${width}px`;
      this.eraserCursor.style.height = `${width}px`;
    }
  }

  updateSizeButtonsUI() {
    const sizeBtns = this.toolbar.querySelectorAll('.dt-size-btn');
    let configs = [];
    let currentVal = 0;

    if (this.mode === 'pen') {
      currentVal = this.lineWidth;
      configs = [
        { size: 3, title: 'Nét bút mảnh (3px)', dot: '6px' },
        { size: 6, title: 'Nét bút vừa (6px)', dot: '10px' },
        { size: 12, title: 'Nét bút dày (12px)', dot: '16px' },
        { size: 24, title: 'Nét bút cực to (24px)', dot: '22px' }
      ];
    } else if (this.mode === 'highlighter') {
      currentVal = this.highlighterWidth || 28;
      configs = [
        { size: 15, title: 'Bút dạ quang mảnh (15px) - Tô gạch chân / từ', dot: '6px' },
        { size: 28, title: 'Bút dạ quang vừa (28px) - Tô cụm từ', dot: '10px' },
        { size: 48, title: 'Bút dạ quang dày (48px) - Tô nổi bật cả câu', dot: '16px' },
        { size: 80, title: 'Bút dạ quang cực to (80px) - Tô vùng lớn', dot: '22px' }
      ];
    } else if (this.mode === 'laser') {
      currentVal = this.laserWidth || 16;
      configs = [
        { size: 8, title: 'Tia Laser mảnh (8px) - Chỉ điểm chi tiết', dot: '6px' },
        { size: 16, title: 'Tia Laser vừa (16px) - Chỉ điểm chuẩn', dot: '10px' },
        { size: 30, title: 'Tia Laser lớn (30px) - Nổi bật bài giảng', dot: '16px' },
        { size: 50, title: 'Tia Laser cực lớn (50px) - Gây chú ý mạnh', dot: '22px' }
      ];
    } else if (this.mode === 'eraser') {
      currentVal = this.eraserWidth || 28;
      configs = [
        { size: 12, title: 'Cục tẩy nhỏ (12px) - Xóa chi tiết nhỏ', dot: '6px' },
        { size: 28, title: 'Cục tẩy vừa (28px) - Xóa chữ / nét vựng', dot: '10px' },
        { size: 56, title: 'Cục tẩy to (56px) - Xóa vùng lớn', dot: '16px' },
        { size: 110, title: 'Cục tẩy cực to (110px) - Xóa siêu tốc', dot: '22px' }
      ];
    }

    sizeBtns.forEach((btn, index) => {
      const conf = configs[index] || configs[0];
      btn.classList.toggle('active', currentVal === conf.size);
      btn.setAttribute('title', conf.title);
      const dotSpan = btn.querySelector('span');
      if (dotSpan) {
        dotSpan.style.width = conf.dot;
        dotSpan.style.height = conf.dot;
      }
    });
  }

  updateEraserCursorPos(e) {
    if (this.isActive && this.mode === 'eraser' && this.eraserCursor) {
      this.eraserCursor.style.display = 'block';
      this.eraserCursor.style.width = `${this.eraserWidth || 28}px`;
      this.eraserCursor.style.height = `${this.eraserWidth || 28}px`;
      this.eraserCursor.style.left = `${e.clientX}px`;
      this.eraserCursor.style.top = `${e.clientY}px`;
    } else if (this.eraserCursor) {
      this.eraserCursor.style.display = 'none';
    }
  }

  saveState() {
    try {
      const imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.history.push(imgData);
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
      this.redoStack = [];
    } catch (e) { }
  }

  undo() {
    if (this.history.length === 0) {
      this.clear();
      return;
    }
    try {
      const currentState = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.redoStack.push(currentState);
      const previousState = this.history.pop();
      this.ctx.putImageData(previousState, 0, 0);
    } catch (e) { }
  }

  redo() {
    if (this.redoStack.length === 0) return;
    try {
      const currentState = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.history.push(currentState);
      const nextState = this.redoStack.pop();
      this.ctx.putImageData(nextState, 0, 0);
    } catch (e) { }
  }

  clear() {
    if (this.ctx && this.canvas) {
      this.saveState();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.laserTrails = [];
      this.showToast('🗑️ Đã xóa sạch nét vẽ!');
    }
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
    this.canvas.style.opacity = this.isVisible ? '1' : '0';
    const visBtn = document.getElementById('dt-vis-btn');
    if (visBtn) {
      visBtn.innerHTML = this.isVisible ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash" style="color: #ef4444;"></i>';
    }
  }

  // ==============================================================================
  // ADVANCED SCREEN SNIPPING TOOL (100% Y hệt Windows + Shift + S & iOS Screenshot)
  // ==============================================================================

  playShutterSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;

      // Tone 1 (Mechanical mirror flip)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(140, now);
      osc1.frequency.exponentialRampToValueAtTime(35, now + 0.05);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.05);

      // Tone 2 (High precision shutter click)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(750, now + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(120, now + 0.12);
      gain2.gain.setValueAtTime(0.25, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.12);
    } catch (e) {}
  }

  triggerShutterEffect() {
    this.playShutterSound();

    let flash = document.getElementById('screen-camera-flash');
    if (!flash) {
      flash = document.createElement('div');
      flash.id = 'screen-camera-flash';
      document.body.appendChild(flash);
    }
    flash.style.opacity = '0.9';
    flash.style.display = 'block';

    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => {
        if (flash && flash.parentNode) flash.parentNode.removeChild(flash);
      }, 260);
    }, 50);
  }

  saveImage() {
    this.startSnipping();
  }

  startSnipping() {
    // Remove any existing snipping overlay
    this.cancelSnipping();

    this.isSnipping = true;
    const overlay = document.createElement('div');
    overlay.id = 'screen-snipping-overlay';

    overlay.innerHTML = `
      <!-- Top Control Bar (Windows 11 Snipping Tool Style) -->
      <div class="snipping-top-bar" id="snipping-top-bar">
        <button class="snipping-mode-btn active" id="snip-mode-rect" title="Kéo thả chuột để cắt vùng tùy chọn">
          <i class="fa-solid fa-crop-simple"></i> <span>Cắt Vùng Chữ Nhật</span>
        </button>
        <button class="snipping-mode-btn" id="snip-mode-fullscreen" title="Chụp toàn bộ màn hình ngay lập tức">
          <i class="fa-solid fa-desktop"></i> <span>Toàn Màn Hình</span>
        </button>
        <button class="snipping-mode-btn" id="snip-mode-window" title="Chụp khung bài học / nội dung chính">
          <i class="fa-solid fa-window-maximize"></i> <span>Khung Bài Học</span>
        </button>
        <div style="width: 1px; height: 20px; background: rgba(255,255,255,0.2); margin: 0 4px;"></div>
        <button class="snipping-mode-btn" id="snip-mode-cancel" title="Hủy bỏ (Phím ESC)" style="color: #f87171;">
          <i class="fa-solid fa-xmark"></i> <span>Hủy (ESC)</span>
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    let snipMode = 'rect'; // 'rect' | 'fullscreen' | 'window'
    let isSelecting = false;
    let startX = 0;
    let startY = 0;
    let selectionBox = null;
    let dimTag = null;

    const btnRect = overlay.querySelector('#snip-mode-rect');
    const btnFull = overlay.querySelector('#snip-mode-fullscreen');
    const btnWin = overlay.querySelector('#snip-mode-window');
    const btnCancel = overlay.querySelector('#snip-mode-cancel');

    btnRect?.addEventListener('click', (e) => {
      e.stopPropagation();
      snipMode = 'rect';
      overlay.querySelectorAll('.snipping-mode-btn').forEach(b => b.classList.remove('active'));
      btnRect.classList.add('active');
    });

    btnFull?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.cancelSnipping();
      this.captureRegion(null);
    });

    btnWin?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.cancelSnipping();
      const mainContent = document.querySelector('.hero-stage-card') || 
                          document.querySelector('.dict-main-workspace-grid') || 
                          document.querySelector('.dict-page-container') ||
                          document.querySelector('.container') ||
                          document.body;
      const rect = mainContent.getBoundingClientRect();
      this.captureRegion({
        x: Math.max(0, rect.left),
        y: Math.max(0, rect.top),
        width: Math.min(window.innerWidth, rect.width),
        height: Math.min(window.innerHeight, rect.height)
      });
    });

    btnCancel?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.cancelSnipping();
    });

    // Pointer event dragging for rectangular selection
    const handleStart = (e) => {
      if (e.target.closest('#snipping-top-bar')) return;
      e.preventDefault();
      e.stopPropagation();

      isSelecting = true;
      startX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      startY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

      if (!selectionBox) {
        selectionBox = document.createElement('div');
        selectionBox.id = 'snip-selection-box';
        dimTag = document.createElement('div');
        dimTag.id = 'snip-dim-tag';
        selectionBox.appendChild(dimTag);
        overlay.appendChild(selectionBox);
      }

      selectionBox.style.left = `${startX}px`;
      selectionBox.style.top = `${startY}px`;
      selectionBox.style.width = '0px';
      selectionBox.style.height = '0px';
      selectionBox.style.display = 'block';
    };

    const handleMove = (e) => {
      if (!isSelecting || !selectionBox) return;
      e.preventDefault();
      e.stopPropagation();

      const curX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : startX);
      const curY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : startY);

      const left = Math.min(startX, curX);
      const top = Math.min(startY, curY);
      const width = Math.abs(curX - startX);
      const height = Math.abs(curY - startY);

      selectionBox.style.left = `${left}px`;
      selectionBox.style.top = `${top}px`;
      selectionBox.style.width = `${width}px`;
      selectionBox.style.height = `${height}px`;

      if (dimTag) {
        dimTag.textContent = `${Math.round(width)} × ${Math.round(height)} px`;
      }
    };

    const handleEnd = (e) => {
      if (!isSelecting) return;
      isSelecting = false;

      if (!selectionBox) {
        this.cancelSnipping();
        return;
      }

      const rect = selectionBox.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const left = rect.left;
      const top = rect.top;

      this.cancelSnipping();

      if (width > 12 && height > 12) {
        this.captureRegion({ x: left, y: top, width, height });
      } else {
        // Just clicked without dragging -> capture full screen
        this.captureRegion(null);
      }
    };

    overlay.addEventListener('mousedown', handleStart);
    overlay.addEventListener('mousemove', handleMove);
    overlay.addEventListener('mouseup', handleEnd);

    overlay.addEventListener('touchstart', handleStart, { passive: false });
    overlay.addEventListener('touchmove', handleMove, { passive: false });
    overlay.addEventListener('touchend', handleEnd, { passive: false });
  }

  cancelSnipping() {
    this.isSnipping = false;
    const overlay = document.getElementById('screen-snipping-overlay');
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  async captureRegion(region = null) {
    try {
      // 1. Shutter camera flash + audio
      this.triggerShutterEffect();

      // Current viewport scroll offsets
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const winW = window.innerWidth;
      const winH = window.innerHeight;

      // Determine exact bounding box in Viewport coordinates (0 <= x < winW, 0 <= y < winH)
      let cropX = 0;
      let cropY = 0;
      let cropW = winW;
      let cropH = winH;

      if (region && typeof region.width === 'number' && typeof region.height === 'number' && region.width > 5 && region.height > 5) {
        cropX = Math.max(0, Math.min(winW - 5, Math.round(region.x)));
        cropY = Math.max(0, Math.min(winH - 5, Math.round(region.y)));
        cropW = Math.max(5, Math.min(winW - cropX, Math.round(region.width)));
        cropH = Math.max(5, Math.min(winH - cropY, Math.round(region.height)));
      }

      // 2. Hide all toolbars/temporary UI for a clean capture
      const prevToolbarDisplay = this.toolbar ? this.toolbar.style.display : 'none';
      const prevBubbleDisplay = this.bubble ? this.bubble.style.display : 'none';
      const prevCanvasDisplay = this.canvas ? this.canvas.style.display : 'none';
      const eraserCursor = document.getElementById('screen-drawing-eraser-cursor');
      const prevCursorDisplay = eraserCursor ? eraserCursor.style.display : 'none';

      if (this.toolbar) this.toolbar.style.display = 'none';
      if (this.bubble) this.bubble.style.display = 'none';
      if (eraserCursor) eraserCursor.style.display = 'none';
      if (this.canvas) this.canvas.style.display = 'none';

      // Wait a tick for paint
      await new Promise(r => setTimeout(r, 60));

      const dpr = Math.min(window.devicePixelRatio || 1.5, 2);
      const targetEl = document.fullscreenElement || document.body;

      let pageCanvas = null;
      try {
        // Capture ONLY the selected rectangle in the current viewport!
        pageCanvas = await html2canvas(targetEl, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          scale: dpr,
          logging: false,
          x: cropX + scrollX,
          y: cropY + scrollY,
          width: cropW,
          height: cropH,
          scrollX: scrollX,
          scrollY: scrollY,
          windowWidth: document.documentElement.clientWidth || winW,
          windowHeight: document.documentElement.clientHeight || winH,
          ignoreElements: (element) => {
            return (
              element.id === 'screen-drawing-canvas-overlay' ||
              element.id === 'screen-drawing-toolbar' ||
              element.id === 'screen-pen-floating-bubble' ||
              element.id === 'screen-drawing-eraser-cursor' ||
              element.id === 'screen-snipping-overlay' ||
              element.id === 'screen-camera-flash' ||
              element.id === 'screen-snipping-preview-widget' ||
              element.id === 'screen-drawing-toast' ||
              element.id === 'lesson-toast' ||
              element.id === 'toast'
            );
          }
        });
      } catch (domErr) {
        console.warn('html2canvas capture error:', domErr);
      }

      // Restore UI elements immediately
      if (this.toolbar) this.toolbar.style.display = prevToolbarDisplay;
      if (this.bubble) this.bubble.style.display = prevBubbleDisplay;
      if (eraserCursor) eraserCursor.style.display = prevCursorDisplay;
      if (this.canvas) this.canvas.style.display = prevCanvasDisplay;

      // 3. Composite Final Cropped Canvas
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = Math.round(cropW * dpr);
      finalCanvas.height = Math.round(cropH * dpr);
      const fCtx = finalCanvas.getContext('2d');

      // 3a. Draw underlying webpage content
      if (pageCanvas && pageCanvas.width > 0 && pageCanvas.height > 0) {
        fCtx.drawImage(
          pageCanvas,
          0, 0, pageCanvas.width, pageCanvas.height,
          0, 0, finalCanvas.width, finalCanvas.height
        );
      } else {
        // Fallback dark background if html2canvas is blocked
        fCtx.fillStyle = '#0f172a';
        fCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      }

      // 3b. Overlay handwriting/drawing strokes in that exact crop region
      if (this.canvas && this.canvas.width > 0 && this.canvas.height > 0) {
        fCtx.drawImage(
          this.canvas,
          cropX, cropY, cropW, cropH,
          0, 0, finalCanvas.width, finalCanvas.height
        );
      }

      // 4. Output to Blob -> Clipboard + Download + iOS/Windows Preview Widget
      finalCanvas.toBlob(async (blob) => {
        if (!blob) {
          this.showToast('Lỗi khi xuất ảnh chụp màn hình!', true);
          return;
        }

        const dataUrl = finalCanvas.toDataURL('image/png');

        // Copy to system clipboard
        let clipboardCopied = false;
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            clipboardCopied = true;
          }
        } catch (clipErr) {
          console.warn('Clipboard write permission:', clipErr);
        }

        // Auto download PNG file
        const now = new Date();
        const timeStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const filename = `tieng-trung-hong-tai-snip-${timeStr}.png`;

        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);

        // Show floating iOS / Windows Snipping Preview Widget
        this.showSnippingPreviewWidget(blob, dataUrl, filename, clipboardCopied);
        this.showToast('📸 Đã cắt và chụp vùng chọn thành công!');

      }, 'image/png');

    } catch (err) {
      console.error('Capture region error:', err);
      this.showToast('Có lỗi xảy ra khi chụp màn hình!', true);
    }
  }

  showSnippingPreviewWidget(blob, dataUrl, filename, clipboardCopied) {
    let widget = document.getElementById('screen-snipping-preview-widget');
    if (widget && widget.parentNode) {
      widget.parentNode.removeChild(widget);
    }

    widget = document.createElement('div');
    widget.id = 'screen-snipping-preview-widget';
    widget.innerHTML = `
      <img src="${dataUrl}" class="snip-widget-thumb" alt="Ảnh chụp màn hình">
      <div style="flex: 1; min-width: 0;">
        <div class="snip-widget-title">
          <i class="fa-solid fa-camera-retro" style="color: #38bdf8;"></i> Đã Chụp Màn Hình!
        </div>
        <div class="snip-widget-sub">
          ${clipboardCopied ? 'Đã copy vào Clipboard (<strong>Ctrl + V</strong> để dán)' : 'Đã lưu file ảnh về máy của bạn'}
        </div>
        <div class="snip-widget-actions">
          <button class="snip-widget-btn primary" id="snip-copy-again-btn" title="Sao chép ảnh vào Clipboard">
            <i class="fa-solid fa-clipboard-check"></i> Copy lại
          </button>
          <button class="snip-widget-btn" id="snip-draw-btn" title="Mở bút vẽ ghi chú">
            <i class="fa-solid fa-pen-nib"></i> Bút vẽ
          </button>
          <button class="snip-widget-btn" id="snip-close-widget-btn" title="Đóng" style="color: #94a3b8;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    const btnCopy = widget.querySelector('#snip-copy-again-btn');
    const btnDraw = widget.querySelector('#snip-draw-btn');
    const btnClose = widget.querySelector('#snip-close-widget-btn');

    btnCopy?.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          this.showToast('📋 Đã sao chép lại vào Clipboard! Nhấn Ctrl + V để dán');
        }
      } catch (e) {
        this.showToast('Không thể sao chép vào Clipboard trên trình duyệt này', true);
      }
    });

    btnDraw?.addEventListener('click', () => {
      if (!this.isActive) this.toggle(true);
      if (widget && widget.parentNode) widget.parentNode.removeChild(widget);
    });

    btnClose?.addEventListener('click', () => {
      if (widget && widget.parentNode) widget.parentNode.removeChild(widget);
    });

    clearTimeout(this._widgetTimer);
    this._widgetTimer = setTimeout(() => {
      if (widget && widget.parentNode) {
        widget.style.opacity = '0';
        widget.style.transform = 'translateY(20px)';
        widget.style.transition = 'all 0.3s ease';
        setTimeout(() => {
          if (widget && widget.parentNode) widget.parentNode.removeChild(widget);
        }, 300);
      }
    }, 5500);
  }

  // Pointer drawing logic
  handlePointerStart(e) {
    if (!this.isActive) return;
    e.preventDefault();
    e.stopPropagation();

    this.isDrawing = true;
    this.saveState();

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.lastX = x;
    this.lastY = y;

    if (this.mode === 'laser') {
      this.addLaserPoint(x, y);
      return;
    }

    this.setupContextStyles(e);

    // Draw single dot on click/tap
    this.ctx.beginPath();
    let radius = Math.max(2, (this.lineWidth || 4) / 2);
    if (this.mode === 'eraser') {
      radius = (this.eraserWidth || 28) / 2;
    } else if (this.mode === 'highlighter') {
      radius = (this.highlighterWidth || 28) / 2;
    }
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  handlePointerMove(e) {
    if (!this.isActive || !this.isDrawing) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.mode === 'laser') {
      this.addLaserPoint(x, y);
      this.lastX = x;
      this.lastY = y;
      return;
    }

    this.setupContextStyles(e);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }

  handlePointerEnd(e) {
    if (!this.isDrawing) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.isDrawing = false;
  }

  setupContextStyles(e) {
    let width = this.lineWidth;

    if (e && e.pressure && e.pressure > 0) {
      width = Math.max(2, this.lineWidth * e.pressure * 1.6);
    }

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (this.mode === 'pen') {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = this.color;
      this.ctx.fillStyle = this.color;
      this.ctx.lineWidth = width;
      this.ctx.globalAlpha = 1.0;
      this.ctx.shadowBlur = 0;
    } else if (this.mode === 'highlighter') {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = this.color;
      this.ctx.fillStyle = this.color;
      this.ctx.lineWidth = this.highlighterWidth || 28;
      this.ctx.globalAlpha = 0.4;
      this.ctx.shadowBlur = 0;
    } else if (this.mode === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineWidth = this.eraserWidth || 28;
      this.ctx.globalAlpha = 1.0;
      this.ctx.shadowBlur = 0;
    }
  }

  // Laser Pointer Trail with fading effect
  addLaserPoint(x, y) {
    this.laserTrails.push({
      x,
      y,
      color: this.color,
      width: this.laserWidth || 16,
      createdAt: Date.now()
    });

    if (!this.laserAnimFrame) {
      this.startLaserAnimation();
    }
  }

  startLaserAnimation() {
    const loop = () => {
      const now = Date.now();
      const maxAge = 1200;

      this.laserTrails = this.laserTrails.filter(pt => now - pt.createdAt < maxAge);

      if (this.laserTrails.length > 0) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'source-over';

        for (let i = 0; i < this.laserTrails.length; i++) {
          const pt = this.laserTrails[i];
          const age = now - pt.createdAt;
          const alpha = Math.max(0, 1 - (age / maxAge));

          this.ctx.beginPath();
          this.ctx.arc(pt.x, pt.y, pt.width * (alpha * 0.7 + 0.3), 0, Math.PI * 2);
          this.ctx.fillStyle = pt.color;
          this.ctx.globalAlpha = alpha * 0.85;
          this.ctx.shadowColor = pt.color;
          this.ctx.shadowBlur = 15;
          this.ctx.fill();
        }

        this.ctx.restore();
        this.laserAnimFrame = requestAnimationFrame(loop);
      } else {
        this.laserAnimFrame = null;
      }
    };

    this.laserAnimFrame = requestAnimationFrame(loop);
  }

  initHotkeys() {
    document.addEventListener('keydown', (e) => {
      const targetTag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (targetTag === 'input' || targetTag === 'textarea' || e.target.isContentEditable) {
        return;
      }

      const key = e.key.toLowerCase();

      // Snipping Tool Shortcut (Win + Shift + S / Shift + S / PrintScreen / Ctrl + Shift + S)
      if ((key === 's' && e.shiftKey) || e.key === 'PrintScreen') {
        e.preventDefault();
        this.startSnipping();
        return;
      }

      // Cancel snipping tool if active on Esc
      if (e.key === 'Escape' && this.isSnipping) {
        e.preventDefault();
        this.cancelSnipping();
        return;
      }

      if (key === 'd' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.toggle();
      } else if (key === 'c' && !e.ctrlKey && !e.metaKey && this.isActive) {
        e.preventDefault();
        this.clear();
      } else if (key === 'e' && !e.ctrlKey && !e.metaKey && this.isActive) {
        e.preventDefault();
        this.setMode('eraser');
      } else if (key === 'p' && !e.ctrlKey && !e.metaKey && this.isActive) {
        e.preventDefault();
        this.setMode('pen');
      } else if (key === 'h' && !e.ctrlKey && !e.metaKey && this.isActive) {
        e.preventDefault();
        this.setMode('highlighter');
      } else if (key === 'l' && !e.ctrlKey && !e.metaKey && this.isActive) {
        e.preventDefault();
        this.setMode('laser');
      } else if (e.key === 'Escape' && this.isActive) {
        e.preventDefault();
        this.toggle(false);
      } else if (key === 'z' && (e.ctrlKey || e.metaKey) && this.isActive) {
        e.preventDefault();
        if (e.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
      } else if (key === 'y' && (e.ctrlKey || e.metaKey) && this.isActive) {
        e.preventDefault();
        this.redo();
      }
    });
  }

  showToast(msg, isError = false) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, isError);
      return;
    }
    let t = document.getElementById('screen-drawing-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'screen-drawing-toast';
      t.style.cssText = 'position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%) translateY(100px); background: rgba(15, 23, 42, 0.95); color: #ffffff; padding: 14px 28px; border-radius: 99px; font-weight: 700; font-size: 0.95rem; box-shadow: 0 12px 35px rgba(0,0,0,0.6); border: 1.5px solid rgba(56, 189, 248, 0.6); z-index: 99999999; opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; align-items: center; gap: 10px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); text-align: center; max-width: 90vw;';
      document.body.appendChild(t);
    }
    t.innerHTML = msg;
    t.style.borderColor = isError ? 'rgba(239, 68, 68, 0.7)' : 'rgba(56, 189, 248, 0.7)';
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(100px)';
    }, 3200);
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ScreenDrawingTool());
} else {
  new ScreenDrawingTool();
}

/* ==============================================================================
 * UNIVERSAL FULLSCREEN EVENT DELEGATION — ALL PAGES & DEVICES
 * (Chuột PC + Cảm ứng Mobile/Tablet + Phím F / ESC)
 *
 * Định nghĩa hàm PLACEHOLDER tại đây.
 * Trên index.html: main.js chạy sau và overwrite window.toggleAppFullscreen,
 *   window.enterAppFullscreen, window.exitAppFullscreen bằng hàm canonical.
 * Trên các trang khác (radicals, grammar...): hàm dưới đây được dùng trực tiếp.
 * ============================================================================== */

let _sdIsFullscreen = false;

// Placeholder — sẽ bị ghi đè bởi main.js trên index.html
if (!window.toggleAppFullscreen) {
  window.toggleAppFullscreen = function (forceState) {
    const isDocFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    const targetState = typeof forceState === 'boolean' ? forceState : (!_sdIsFullscreen && !isDocFs);
    if (targetState) {
      window.enterAppFullscreen && window.enterAppFullscreen();
    } else {
      window.exitAppFullscreen && window.exitAppFullscreen(true);
    }
  };
}

if (!window.enterAppFullscreen) {
  window.enterAppFullscreen = function () {
    _sdIsFullscreen = true;
    document.body.classList.add('flashcard-fullscreen-mode', 'app-fullscreen-mode');

    ['flashcard-study-view', 'radical-study-workspace', 'radicals-flashcard-view', 'radical-detail-workspace'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('fullscreen-flashcard-active');
    });

    const docEl = document.documentElement;
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => { });
        else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
        else if (docEl.msRequestFullscreen) docEl.msRequestFullscreen();
      }
    } catch (e) { }

    _sdUpdateButtons();
    if (typeof window.showToast === 'function') {
      window.showToast('Đã mở toàn màn hình ⛶ (Phím Esc hoặc F để thu nhỏ)');
    }
  };
}

if (!window.exitAppFullscreen) {
  window.exitAppFullscreen = function (callDocExit = true) {
    _sdIsFullscreen = false;
    document.body.classList.remove('flashcard-fullscreen-mode', 'app-fullscreen-mode');

    ['flashcard-study-view', 'radical-study-workspace', 'radicals-flashcard-view', 'radical-detail-workspace'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('fullscreen-flashcard-active');
    });

    if (callDocExit) {
      const isDocFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
      if (isDocFs) {
        try {
          if (document.exitFullscreen) document.exitFullscreen().catch(() => { });
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
          else if (document.msExitFullscreen) document.msExitFullscreen();
        } catch (e) { }
      }
    }

    _sdUpdateButtons();
  };
}

function _sdUpdateButtons() {
  // Gọi updateFlashcardFullscreenButtons của main.js nếu có
  if (typeof updateFlashcardFullscreenButtons === 'function') {
    updateFlashcardFullscreenButtons();
    return;
  }
  // Fallback cho các trang không có main.js
  const isDocFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
  const activeState = _sdIsFullscreen || isDocFs;
  document.querySelectorAll('.card-fullscreen-quick-btn, #radical-top-fullscreen-btn, #radical-fullscreen-toggle-btn').forEach(btn => {
    btn.classList.toggle('active-fullscreen', activeState);
    const icon = btn.querySelector('i');
    if (icon) icon.className = `fa-solid ${activeState ? 'fa-compress' : 'fa-expand'}`;
    btn.title = activeState ? 'Thu nhỏ toàn màn hình (Phím Esc)' : 'Phóng to toàn màn hình (Phím F)';
  });
}

// fullscreenchange — sync state khi user nhấn ESC của browser
['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evtName => {
  document.addEventListener(evtName, () => {
    const isDocFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (!isDocFs) {
      // Exit fullscreen — gọi hàm canonical
      const exitFn = window.exitFlashcardFullscreen || window.exitAppFullscreen;
      if (exitFn) exitFn(false);
    } else {
      _sdUpdateButtons();
    }
  });
});

// Universal Event Delegation — 1 nơi duy nhất cho click + touch + keyboard
(function setupUniversalFsDelegation() {
  // Guard: nếu đã có main.js đăng ký delegation rồi thì không đăng ký nữa
  if (window._fsDelegationRegistered) return;
  window._fsDelegationRegistered = true;

  let lastActionTime = 0;
  const SELECTOR = '.card-fullscreen-quick-btn, #radical-top-fullscreen-btn, #radical-fullscreen-toggle-btn';

  function onFsTrigger(e) {
    const btn = e.target.closest(SELECTOR);
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    if (now - lastActionTime < 350) return; // debounce 350ms
    lastActionTime = now;
    const fn = window.toggleFlashcardFullscreen || window.toggleAppFullscreen;
    if (fn) fn();
  }

  document.addEventListener('click', onFsTrigger, true);
  document.addEventListener('touchend', onFsTrigger, { passive: false, capture: true });

  document.addEventListener('keydown', (e) => {
    const isDocFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    const isFs = isDocFs || _sdIsFullscreen;

    if (e.key === 'Escape' && isFs) {
      e.preventDefault();
      const exitFn = window.exitFlashcardFullscreen || window.exitAppFullscreen;
      if (exitFn) exitFn(true);
    }
    if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey) {
      const active = document.activeElement;
      const tag = active ? active.tagName.toLowerCase() : '';
      if (tag !== 'input' && tag !== 'textarea' && !active.isContentEditable) {
        e.preventDefault();
        const toggleFn = window.toggleFlashcardFullscreen || window.toggleAppFullscreen;
        if (toggleFn) toggleFn();
      }
    }
    if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.metaKey) {
      const active = document.activeElement;
      const tag = active ? active.tagName.toLowerCase() : '';
      if (tag !== 'input' && tag !== 'textarea' && !active.isContentEditable) {
        if (typeof window.toggleLessonToolbar === 'function') {
          e.preventDefault();
          window.toggleLessonToolbar();
        }
      }
    }
  });
})();

export default ScreenDrawingTool;

