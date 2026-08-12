class y{constructor(){this.isActive=!1,this.isDrawing=!1,this.mode="pen",this.color="#ef4444",this.lineWidth=4,this.history=[],this.redoStack=[],this.maxHistory=20,this.laserTrails=[],this.laserAnimFrame=null,this.isVisible=!0,this.canvas=null,this.ctx=null,this.bubble=null,this.toolbar=null,this.lastX=0,this.lastY=0,this.isDraggingBubble=!1,this.isDraggingToolbar=!1,this.init()}init(){document.getElementById("screen-drawing-canvas-overlay")||(this.createCanvas(),this.createFloatingBubble(),this.createToolbar(),this.bindEvents(),this.initHotkeys(),window.screenDrawingTool=this,window.toggleScreenDrawing=t=>this.toggle(t),window.clearScreenDrawing=()=>this.clear(),window.setScreenDrawingMode=t=>this.setMode(t),window.setScreenDrawingColor=t=>this.setColor(t),window.setScreenDrawingWidth=t=>this.setWidth(t))}createCanvas(){this.canvas=document.createElement("canvas"),this.canvas.id="screen-drawing-canvas-overlay",this.canvas.className="screen-drawing-canvas",document.body.appendChild(this.canvas),this.ctx=this.canvas.getContext("2d",{willReadFrequently:!0}),this.resizeCanvas(),window.addEventListener("resize",()=>this.resizeCanvas())}resizeCanvas(){if(!this.canvas)return;const t=window.innerWidth,s=window.innerHeight;if(this.canvas.width===t&&this.canvas.height===s)return;let i=null;this.canvas.width>0&&this.canvas.height>0&&(i=document.createElement("canvas"),i.width=this.canvas.width,i.height=this.canvas.height,i.getContext("2d").drawImage(this.canvas,0,0)),this.canvas.width=t,this.canvas.height=s,this.canvas.style.width=t+"px",this.canvas.style.height=s+"px",this.ctx.lineCap="round",this.ctx.lineJoin="round",i&&this.ctx.drawImage(i,0,0)}createFloatingBubble(){this.bubble=document.createElement("div"),this.bubble.id="screen-pen-floating-bubble",this.bubble.className="screen-pen-floating-bubble",this.bubble.title="Bật/Tắt Bút viết tay lên màn hình (Phím D)",this.bubble.innerHTML=`
      <div class="bubble-inner">
        <i class="fa-solid fa-pen-nib bubble-icon"></i>
      </div>
      <span class="bubble-badge" title="Chế độ giảng dạy">✏️</span>
    `,document.body.appendChild(this.bubble)}createToolbar(){this.toolbar=document.createElement("div"),this.toolbar.id="screen-drawing-toolbar",this.toolbar.className="screen-drawing-toolbar",this.toolbar.style.display="none",this.toolbar.innerHTML=`
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
        <button class="dt-btn dt-action-btn" id="dt-save-btn" title="Tải ảnh ghi chú / bài giảng">
          <i class="fa-solid fa-camera"></i>
        </button>
      </div>

      <div class="dt-divider"></div>

      <!-- Close / Collapse Button -->
      <button class="dt-btn dt-close-btn" id="dt-close-btn" title="Thu gọn / Đóng chế độ vẽ (Phím D hoặc ESC)">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `,document.body.appendChild(this.toolbar)}bindEvents(){let t=!1;this.bubble.addEventListener("click",e=>{if(t){t=!1;return}e.stopPropagation(),this.toggle()}),this.bubble.addEventListener("touchend",e=>{if(t){t=!1;return}e.preventDefault(),e.stopPropagation(),this.toggle()},{passive:!1}),this.makeDraggable(this.bubble,this.bubble,()=>{t=!1},()=>{t=!0});const s=this.toolbar.querySelector(".dt-drag-handle");this.makeDraggable(this.toolbar,s),this.toolbar.querySelectorAll(".dt-modes .dt-btn").forEach(e=>{e.addEventListener("click",l=>{l.stopPropagation(),this.setMode(e.dataset.mode)})}),this.toolbar.querySelectorAll(".dt-color-btn").forEach(e=>{e.addEventListener("click",l=>{l.stopPropagation(),this.setColor(e.dataset.color)})}),this.toolbar.querySelectorAll(".dt-size-btn").forEach(e=>{e.addEventListener("click",l=>{l.stopPropagation(),this.setWidth(parseInt(e.dataset.size,10))})});const i=document.getElementById("dt-undo-btn");i&&i.addEventListener("click",e=>{e.stopPropagation(),this.undo()});const a=document.getElementById("dt-redo-btn");a&&a.addEventListener("click",e=>{e.stopPropagation(),this.redo()});const c=document.getElementById("dt-clear-btn");c&&c.addEventListener("click",e=>{e.stopPropagation(),this.clear()});const d=document.getElementById("dt-vis-btn");d&&d.addEventListener("click",e=>{e.stopPropagation(),this.toggleVisibility()});const h=document.getElementById("dt-save-btn");h&&h.addEventListener("click",e=>{e.stopPropagation(),this.saveImage()});const u=document.getElementById("dt-close-btn");u&&u.addEventListener("click",e=>{e.stopPropagation(),this.toggle(!1)});const r=document.getElementById("dt-custom-color-input"),o=document.getElementById("dt-custom-color-preview");r&&(r.addEventListener("input",e=>{const l=e.target.value;this.setColor(l),this.toolbar.querySelectorAll(".dt-color-btn").forEach(b=>b.classList.remove("active")),o&&(o.style.background=l,o.innerHTML="")}),r.addEventListener("change",e=>{const l=e.target.value;this.setColor(l),this.toolbar.querySelectorAll(".dt-color-btn").forEach(b=>b.classList.remove("active")),o&&(o.style.background=l,o.innerHTML="")})),o&&o.addEventListener("click",e=>{e.stopPropagation(),r&&r.click()}),this.canvas.addEventListener("pointerdown",e=>this.handlePointerStart(e)),this.canvas.addEventListener("pointermove",e=>this.handlePointerMove(e)),this.canvas.addEventListener("pointerup",e=>this.handlePointerEnd(e)),this.canvas.addEventListener("pointercancel",e=>this.handlePointerEnd(e)),this.canvas.addEventListener("pointerleave",e=>this.handlePointerEnd(e))}makeDraggable(t,s,i,a){let d=0,h=0,u=0,r=0,o=!1,e=!1;const l=n=>{if(n.target.closest("button")&&s!==t)return;o=!0,e=!1;const v=n.clientX||n.touches&&n.touches[0].clientX,f=n.clientY||n.touches&&n.touches[0].clientY;d=v,h=f;const g=t.getBoundingClientRect();u=g.left,r=g.top,document.addEventListener("pointermove",b),document.addEventListener("pointerup",m)},b=n=>{if(!o)return;const v=n.clientX||n.touches&&n.touches[0].clientX,f=n.clientY||n.touches&&n.touches[0].clientY,g=v-d,p=f-h,w=Math.sqrt(g*g+p*p);if(!e&&w<8)return;e||(e=!0,t.style.right="auto",t.style.bottom="auto",t.style.left=u+"px",t.style.top=r+"px",i&&i());const x=Math.max(10,Math.min(window.innerWidth-t.offsetWidth-10,u+g)),C=Math.max(10,Math.min(window.innerHeight-t.offsetHeight-10,r+p));t.style.left=x+"px",t.style.top=C+"px"},m=()=>{o&&(o=!1,document.removeEventListener("pointermove",b),document.removeEventListener("pointerup",m),e&&a&&a(),e=!1)};s.addEventListener("pointerdown",l)}toggle(t){this.isActive=typeof t=="boolean"?t:!this.isActive,this.canvas.classList.toggle("active",this.isActive),this.bubble.classList.toggle("active",this.isActive),this.toolbar.classList.toggle("active",this.isActive),this.toolbar.style.display=this.isActive?"flex":"none",document.body.classList.toggle("screen-drawing-active",this.isActive),this.isActive&&(this.resizeCanvas(),this.showToast("✏️ Đã BẬT Bút vẽ màn hình! Bạn có thể viết, vẽ hoặc ghi chú tự do."))}setMode(t){this.mode=t,this.toolbar.querySelectorAll(".dt-modes .dt-btn").forEach(s=>{s.classList.toggle("active",s.dataset.mode===t)}),this.canvas.setAttribute("data-mode",t)}setColor(t){this.color=t,this.toolbar.querySelectorAll(".dt-color-btn").forEach(a=>{a.classList.toggle("active",a.dataset.color===t)});const s=document.getElementById("dt-custom-color-preview"),i=document.getElementById("dt-custom-color-input");s&&this.toolbar.querySelector(`.dt-color-btn[data-color="${t}"]`)&&(s.style.background="conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",s.innerHTML='<i class="fa-solid fa-palette" style="font-size:0.72rem; color:#fff; text-shadow:0 1px 3px rgba(0,0,0,0.8);"></i>'),i&&(i.value=t),this.mode==="eraser"&&this.setMode("pen")}setWidth(t){this.lineWidth=t,this.toolbar.querySelectorAll(".dt-size-btn").forEach(s=>{s.classList.toggle("active",parseInt(s.dataset.size,10)===t)})}saveState(){try{const t=this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);this.history.push(t),this.history.length>this.maxHistory&&this.history.shift(),this.redoStack=[]}catch{}}undo(){if(this.history.length===0){this.clear();return}try{const t=this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);this.redoStack.push(t);const s=this.history.pop();this.ctx.putImageData(s,0,0)}catch{}}redo(){if(this.redoStack.length!==0)try{const t=this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);this.history.push(t);const s=this.redoStack.pop();this.ctx.putImageData(s,0,0)}catch{}}clear(){this.ctx&&this.canvas&&(this.saveState(),this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.laserTrails=[],this.showToast("🗑️ Đã xóa sạch nét vẽ!"))}toggleVisibility(){this.isVisible=!this.isVisible,this.canvas.style.opacity=this.isVisible?"1":"0";const t=document.getElementById("dt-vis-btn");t&&(t.innerHTML=this.isVisible?'<i class="fa-solid fa-eye"></i>':'<i class="fa-solid fa-eye-slash" style="color: #ef4444;"></i>')}saveImage(){if(this.canvas)try{const t=document.createElement("canvas");t.width=this.canvas.width,t.height=this.canvas.height;const s=t.getContext("2d");s.fillStyle="rgba(15, 23, 42, 0.95)",s.fillRect(0,0,t.width,t.height),s.drawImage(this.canvas,0,0);const i=t.toDataURL("image/png"),a=document.createElement("a");a.href=i,a.download=`tieng-trung-hong-tai-note-${Date.now()}.png`,a.click(),this.showToast("📸 Đã lưu ảnh bài giảng!")}catch(t){console.warn("Save image error:",t)}}handlePointerStart(t){if(!this.isActive)return;t.preventDefault(),t.stopPropagation(),this.isDrawing=!0,this.saveState();const s=this.canvas.getBoundingClientRect(),i=t.clientX-s.left,a=t.clientY-s.top;if(this.lastX=i,this.lastY=a,this.mode==="laser"){this.addLaserPoint(i,a);return}this.setupContextStyles(t),this.ctx.beginPath();const c=Math.max(2,(this.lineWidth||4)/2);this.ctx.arc(i,a,c,0,Math.PI*2),this.ctx.fill()}handlePointerMove(t){if(!this.isActive||!this.isDrawing)return;t.preventDefault(),t.stopPropagation();const s=this.canvas.getBoundingClientRect(),i=t.clientX-s.left,a=t.clientY-s.top;if(this.mode==="laser"){this.addLaserPoint(i,a),this.lastX=i,this.lastY=a;return}this.setupContextStyles(t),this.ctx.beginPath(),this.ctx.moveTo(this.lastX,this.lastY),this.ctx.lineTo(i,a),this.ctx.stroke(),this.lastX=i,this.lastY=a}handlePointerEnd(t){this.isDrawing&&(t&&(t.preventDefault(),t.stopPropagation()),this.isDrawing=!1)}setupContextStyles(t){let s=this.lineWidth;t&&t.pressure&&t.pressure>0&&(s=Math.max(2,this.lineWidth*t.pressure*1.6)),this.ctx.lineCap="round",this.ctx.lineJoin="round",this.mode==="pen"?(this.ctx.globalCompositeOperation="source-over",this.ctx.strokeStyle=this.color,this.ctx.fillStyle=this.color,this.ctx.lineWidth=s,this.ctx.globalAlpha=1,this.ctx.shadowBlur=0):this.mode==="highlighter"?(this.ctx.globalCompositeOperation="source-over",this.ctx.strokeStyle=this.color,this.ctx.fillStyle=this.color,this.ctx.lineWidth=Math.max(20,s*4),this.ctx.globalAlpha=.4,this.ctx.shadowBlur=0):this.mode==="eraser"&&(this.ctx.globalCompositeOperation="destination-out",this.ctx.lineWidth=Math.max(24,s*4),this.ctx.globalAlpha=1,this.ctx.shadowBlur=0)}addLaserPoint(t,s){this.laserTrails.push({x:t,y:s,color:this.color,width:Math.max(8,this.lineWidth*2),createdAt:Date.now()}),this.laserAnimFrame||this.startLaserAnimation()}startLaserAnimation(){const t=()=>{const s=Date.now(),i=1200;if(this.laserTrails=this.laserTrails.filter(a=>s-a.createdAt<i),this.laserTrails.length>0){this.ctx.save(),this.ctx.globalCompositeOperation="source-over";for(let a=0;a<this.laserTrails.length;a++){const c=this.laserTrails[a],d=s-c.createdAt,h=Math.max(0,1-d/i);this.ctx.beginPath(),this.ctx.arc(c.x,c.y,c.width*(h*.7+.3),0,Math.PI*2),this.ctx.fillStyle=c.color,this.ctx.globalAlpha=h*.85,this.ctx.shadowColor=c.color,this.ctx.shadowBlur=15,this.ctx.fill()}this.ctx.restore(),this.laserAnimFrame=requestAnimationFrame(t)}else this.laserAnimFrame=null};this.laserAnimFrame=requestAnimationFrame(t)}initHotkeys(){document.addEventListener("keydown",t=>{const s=t.target&&t.target.tagName?t.target.tagName.toLowerCase():"";if(s==="input"||s==="textarea"||t.target.isContentEditable)return;const i=t.key.toLowerCase();i==="d"&&!t.ctrlKey&&!t.metaKey?(t.preventDefault(),this.toggle()):i==="c"&&!t.ctrlKey&&!t.metaKey&&this.isActive?(t.preventDefault(),this.clear()):i==="e"&&!t.ctrlKey&&!t.metaKey&&this.isActive?(t.preventDefault(),this.setMode("eraser")):i==="p"&&!t.ctrlKey&&!t.metaKey&&this.isActive?(t.preventDefault(),this.setMode("pen")):i==="h"&&!t.ctrlKey&&!t.metaKey&&this.isActive?(t.preventDefault(),this.setMode("highlighter")):i==="l"&&!t.ctrlKey&&!t.metaKey&&this.isActive?(t.preventDefault(),this.setMode("laser")):t.key==="Escape"&&this.isActive?(t.preventDefault(),this.toggle(!1)):i==="z"&&(t.ctrlKey||t.metaKey)&&this.isActive?(t.preventDefault(),t.shiftKey?this.redo():this.undo()):i==="y"&&(t.ctrlKey||t.metaKey)&&this.isActive&&(t.preventDefault(),this.redo())})}showToast(t){typeof window.showToast=="function"&&window.showToast(t)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>new y):new y;
