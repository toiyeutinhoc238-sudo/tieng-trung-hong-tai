class p{constructor(){this.isActive=!1,this.isDrawing=!1,this.mode="pen",this.color="#ef4444",this.lineWidth=4,this.history=[],this.redoStack=[],this.maxHistory=20,this.laserTrails=[],this.laserAnimFrame=null,this.isVisible=!0,this.canvas=null,this.ctx=null,this.bubble=null,this.toolbar=null,this.lastX=0,this.lastY=0,this.isDraggingBubble=!1,this.isDraggingToolbar=!1,this.init()}init(){document.getElementById("screen-drawing-canvas-overlay")||(this.createCanvas(),this.createFloatingBubble(),this.createToolbar(),this.bindEvents(),this.initHotkeys(),window.screenDrawingTool=this,window.toggleScreenDrawing=t=>this.toggle(t),window.clearScreenDrawing=()=>this.clear(),window.setScreenDrawingMode=t=>this.setMode(t),window.setScreenDrawingColor=t=>this.setColor(t),window.setScreenDrawingWidth=t=>this.setWidth(t))}createCanvas(){this.canvas=document.createElement("canvas"),this.canvas.id="screen-drawing-canvas-overlay",this.canvas.className="screen-drawing-canvas",document.body.appendChild(this.canvas),this.ctx=this.canvas.getContext("2d",{willReadFrequently:!0}),this.resizeCanvas(),window.addEventListener("resize",()=>this.resizeCanvas())}resizeCanvas(){if(!this.canvas)return;const t=window.innerWidth,e=window.innerHeight;if(this.canvas.width===t&&this.canvas.height===e)return;let i=null;this.canvas.width>0&&this.canvas.height>0&&(i=document.createElement("canvas"),i.width=this.canvas.width,i.height=this.canvas.height,i.getContext("2d").drawImage(this.canvas,0,0)),this.canvas.width=t,this.canvas.height=e,this.canvas.style.width=t+"px",this.canvas.style.height=e+"px",this.ctx.lineCap="round",this.ctx.lineJoin="round",i&&this.ctx.drawImage(i,0,0)}createFloatingBubble(){this.bubble=document.createElement("div"),this.bubble.id="screen-pen-floating-bubble",this.bubble.className="screen-pen-floating-bubble",this.bubble.title="Bật/Tắt Bút viết tay lên màn hình (Phím D)",this.bubble.innerHTML=`
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
    `,document.body.appendChild(this.toolbar)}bindEvents(){this.bubble.addEventListener("click",s=>{s.stopPropagation(),!this.isDraggingBubble&&this.toggle()}),this.makeDraggable(this.bubble,this.bubble,()=>{this.isDraggingBubble=!0},()=>{setTimeout(()=>{this.isDraggingBubble=!1},80)});const t=this.toolbar.querySelector(".dt-drag-handle");this.makeDraggable(this.toolbar,t),this.toolbar.querySelectorAll(".dt-modes .dt-btn").forEach(s=>{s.addEventListener("click",o=>{o.stopPropagation(),this.setMode(s.dataset.mode)})}),this.toolbar.querySelectorAll(".dt-color-btn").forEach(s=>{s.addEventListener("click",o=>{o.stopPropagation(),this.setColor(s.dataset.color)})}),this.toolbar.querySelectorAll(".dt-size-btn").forEach(s=>{s.addEventListener("click",o=>{o.stopPropagation(),this.setWidth(parseInt(s.dataset.size,10))})});const e=document.getElementById("dt-undo-btn");e&&e.addEventListener("click",s=>{s.stopPropagation(),this.undo()});const i=document.getElementById("dt-redo-btn");i&&i.addEventListener("click",s=>{s.stopPropagation(),this.redo()});const a=document.getElementById("dt-clear-btn");a&&a.addEventListener("click",s=>{s.stopPropagation(),this.clear()});const n=document.getElementById("dt-vis-btn");n&&n.addEventListener("click",s=>{s.stopPropagation(),this.toggleVisibility()});const d=document.getElementById("dt-save-btn");d&&d.addEventListener("click",s=>{s.stopPropagation(),this.saveImage()});const r=document.getElementById("dt-close-btn");r&&r.addEventListener("click",s=>{s.stopPropagation(),this.toggle(!1)});const h=document.getElementById("dt-custom-color-input"),c=document.getElementById("dt-custom-color-preview");h&&(h.addEventListener("input",s=>{const o=s.target.value;this.setColor(o),this.toolbar.querySelectorAll(".dt-color-btn").forEach(u=>u.classList.remove("active")),c&&(c.style.background=o,c.innerHTML="")}),h.addEventListener("change",s=>{const o=s.target.value;this.setColor(o),this.toolbar.querySelectorAll(".dt-color-btn").forEach(u=>u.classList.remove("active")),c&&(c.style.background=o,c.innerHTML="")})),c&&c.addEventListener("click",s=>{s.stopPropagation(),h&&h.click()}),this.canvas.addEventListener("pointerdown",s=>this.handlePointerStart(s)),this.canvas.addEventListener("pointermove",s=>this.handlePointerMove(s)),this.canvas.addEventListener("pointerup",s=>this.handlePointerEnd(s)),this.canvas.addEventListener("pointercancel",s=>this.handlePointerEnd(s)),this.canvas.addEventListener("pointerleave",s=>this.handlePointerEnd(s))}makeDraggable(t,e,i,a){let n=0,d=0,r=0,h=0,c=!1;const s=l=>{if(l.target.closest("button")&&e!==t)return;c=!0;const g=l.clientX||l.touches&&l.touches[0].clientX,v=l.clientY||l.touches&&l.touches[0].clientY;n=g,d=v;const b=t.getBoundingClientRect();r=b.left,h=b.top,t.style.right="auto",t.style.bottom="auto",t.style.left=r+"px",t.style.top=h+"px",i&&i(),document.addEventListener("pointermove",o),document.addEventListener("pointerup",u)},o=l=>{if(!c)return;const g=l.clientX||l.touches&&l.touches[0].clientX,v=l.clientY||l.touches&&l.touches[0].clientY,b=g-n,f=v-d,m=Math.max(10,Math.min(window.innerWidth-t.offsetWidth-10,r+b)),y=Math.max(10,Math.min(window.innerHeight-t.offsetHeight-10,h+f));t.style.left=m+"px",t.style.top=y+"px"},u=()=>{c&&(c=!1,document.removeEventListener("pointermove",o),document.removeEventListener("pointerup",u),a&&a())};e.addEventListener("pointerdown",s)}toggle(t){this.isActive=typeof t=="boolean"?t:!this.isActive,this.canvas.classList.toggle("active",this.isActive),this.bubble.classList.toggle("active",this.isActive),this.toolbar.classList.toggle("active",this.isActive),this.toolbar.style.display=this.isActive?"flex":"none",document.body.classList.toggle("screen-drawing-active",this.isActive),this.isActive&&(this.resizeCanvas(),this.showToast("✏️ Đã BẬT Bút vẽ màn hình! Bạn có thể viết, vẽ hoặc ghi chú tự do."))}setMode(t){this.mode=t,this.toolbar.querySelectorAll(".dt-modes .dt-btn").forEach(e=>{e.classList.toggle("active",e.dataset.mode===t)}),this.canvas.setAttribute("data-mode",t)}setColor(t){this.color=t,this.toolbar.querySelectorAll(".dt-color-btn").forEach(a=>{a.classList.toggle("active",a.dataset.color===t)});const e=document.getElementById("dt-custom-color-preview"),i=document.getElementById("dt-custom-color-input");e&&this.toolbar.querySelector(`.dt-color-btn[data-color="${t}"]`)&&(e.style.background="conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",e.innerHTML='<i class="fa-solid fa-palette" style="font-size:0.72rem; color:#fff; text-shadow:0 1px 3px rgba(0,0,0,0.8);"></i>'),i&&(i.value=t),this.mode==="eraser"&&this.setMode("pen")}setWidth(t){this.lineWidth=t,this.toolbar.querySelectorAll(".dt-size-btn").forEach(e=>{e.classList.toggle("active",parseInt(e.dataset.size,10)===t)})}saveState(){try{const t=this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);this.history.push(t),this.history.length>this.maxHistory&&this.history.shift(),this.redoStack=[]}catch{}}undo(){if(this.history.length===0){this.clear();return}try{const t=this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);this.redoStack.push(t);const e=this.history.pop();this.ctx.putImageData(e,0,0)}catch{}}redo(){if(this.redoStack.length!==0)try{const t=this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);this.history.push(t);const e=this.redoStack.pop();this.ctx.putImageData(e,0,0)}catch{}}clear(){this.ctx&&this.canvas&&(this.saveState(),this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.laserTrails=[],this.showToast("🗑️ Đã xóa sạch nét vẽ!"))}toggleVisibility(){this.isVisible=!this.isVisible,this.canvas.style.opacity=this.isVisible?"1":"0";const t=document.getElementById("dt-vis-btn");t&&(t.innerHTML=this.isVisible?'<i class="fa-solid fa-eye"></i>':'<i class="fa-solid fa-eye-slash" style="color: #ef4444;"></i>')}saveImage(){if(this.canvas)try{const t=document.createElement("canvas");t.width=this.canvas.width,t.height=this.canvas.height;const e=t.getContext("2d");e.fillStyle="rgba(15, 23, 42, 0.95)",e.fillRect(0,0,t.width,t.height),e.drawImage(this.canvas,0,0);const i=t.toDataURL("image/png"),a=document.createElement("a");a.href=i,a.download=`tieng-trung-hong-tai-note-${Date.now()}.png`,a.click(),this.showToast("📸 Đã lưu ảnh bài giảng!")}catch(t){console.warn("Save image error:",t)}}handlePointerStart(t){if(!this.isActive)return;t.preventDefault(),t.stopPropagation(),this.isDrawing=!0,this.saveState();const e=this.canvas.getBoundingClientRect(),i=t.clientX-e.left,a=t.clientY-e.top;if(this.lastX=i,this.lastY=a,this.mode==="laser"){this.addLaserPoint(i,a);return}this.setupContextStyles(t),this.ctx.beginPath();const n=Math.max(2,(this.lineWidth||4)/2);this.ctx.arc(i,a,n,0,Math.PI*2),this.ctx.fill()}handlePointerMove(t){if(!this.isActive||!this.isDrawing)return;t.preventDefault(),t.stopPropagation();const e=this.canvas.getBoundingClientRect(),i=t.clientX-e.left,a=t.clientY-e.top;if(this.mode==="laser"){this.addLaserPoint(i,a),this.lastX=i,this.lastY=a;return}this.setupContextStyles(t),this.ctx.beginPath(),this.ctx.moveTo(this.lastX,this.lastY),this.ctx.lineTo(i,a),this.ctx.stroke(),this.lastX=i,this.lastY=a}handlePointerEnd(t){this.isDrawing&&(t&&(t.preventDefault(),t.stopPropagation()),this.isDrawing=!1)}setupContextStyles(t){let e=this.lineWidth;t&&t.pressure&&t.pressure>0&&(e=Math.max(2,this.lineWidth*t.pressure*1.6)),this.ctx.lineCap="round",this.ctx.lineJoin="round",this.mode==="pen"?(this.ctx.globalCompositeOperation="source-over",this.ctx.strokeStyle=this.color,this.ctx.fillStyle=this.color,this.ctx.lineWidth=e,this.ctx.globalAlpha=1,this.ctx.shadowBlur=0):this.mode==="highlighter"?(this.ctx.globalCompositeOperation="source-over",this.ctx.strokeStyle=this.color,this.ctx.fillStyle=this.color,this.ctx.lineWidth=Math.max(20,e*4),this.ctx.globalAlpha=.4,this.ctx.shadowBlur=0):this.mode==="eraser"&&(this.ctx.globalCompositeOperation="destination-out",this.ctx.lineWidth=Math.max(24,e*4),this.ctx.globalAlpha=1,this.ctx.shadowBlur=0)}addLaserPoint(t,e){this.laserTrails.push({x:t,y:e,color:this.color,width:Math.max(8,this.lineWidth*2),createdAt:Date.now()}),this.laserAnimFrame||this.startLaserAnimation()}startLaserAnimation(){const t=()=>{const e=Date.now(),i=1200;if(this.laserTrails=this.laserTrails.filter(a=>e-a.createdAt<i),this.laserTrails.length>0){this.ctx.save(),this.ctx.globalCompositeOperation="source-over";for(let a=0;a<this.laserTrails.length;a++){const n=this.laserTrails[a],d=e-n.createdAt,r=Math.max(0,1-d/i);this.ctx.beginPath(),this.ctx.arc(n.x,n.y,n.width*(r*.7+.3),0,Math.PI*2),this.ctx.fillStyle=n.color,this.ctx.globalAlpha=r*.85,this.ctx.shadowColor=n.color,this.ctx.shadowBlur=15,this.ctx.fill()}this.ctx.restore(),this.laserAnimFrame=requestAnimationFrame(t)}else this.laserAnimFrame=null};this.laserAnimFrame=requestAnimationFrame(t)}initHotkeys(){document.addEventListener("keydown",t=>{const e=t.target&&t.target.tagName?t.target.tagName.toLowerCase():"";if(e==="input"||e==="textarea"||t.target.isContentEditable)return;const i=t.key.toLowerCase();i==="d"&&!t.ctrlKey&&!t.metaKey?(t.preventDefault(),this.toggle()):i==="c"&&!t.ctrlKey&&!t.metaKey&&this.isActive?(t.preventDefault(),this.clear()):i==="e"&&!t.ctrlKey&&!t.metaKey&&this.isActive?(t.preventDefault(),this.setMode("eraser")):i==="p"&&!t.ctrlKey&&!t.metaKey&&this.isActive?(t.preventDefault(),this.setMode("pen")):i==="h"&&!t.ctrlKey&&!t.metaKey&&this.isActive?(t.preventDefault(),this.setMode("highlighter")):i==="l"&&!t.ctrlKey&&!t.metaKey&&this.isActive?(t.preventDefault(),this.setMode("laser")):t.key==="Escape"&&this.isActive?(t.preventDefault(),this.toggle(!1)):i==="z"&&(t.ctrlKey||t.metaKey)&&this.isActive?(t.preventDefault(),t.shiftKey?this.redo():this.undo()):i==="y"&&(t.ctrlKey||t.metaKey)&&this.isActive&&(t.preventDefault(),this.redo())})}showToast(t){typeof window.showToast=="function"&&window.showToast(t)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>new p):new p;
