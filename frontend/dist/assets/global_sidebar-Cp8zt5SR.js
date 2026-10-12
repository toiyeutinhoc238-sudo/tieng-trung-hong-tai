import{h as at}from"./vendor-BfYXEYrK.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const h of s.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&r(h)}).observe(document,{childList:!0,subtree:!0});function l(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(o){if(o.ep)return;o.ep=!0;const s=l(o);fetch(o.href,s)}})();const Q="__hongtai_seasonal_particles__";function nt(){return window[Q]||(window[Q]={canvas:null,ctx:null,width:0,height:0,dpr:1,particles:[],animFrameId:null,lastTime:0,season:"autumn",isInitialized:!1,resizeTimer:null,lastWidth:0,lastHeight:0}),window[Q]}function Z(){if(window.self!==window.top)return;const c=nt();if(c.isInitialized&&c.animFrameId)return;let e=document.getElementById("seasonal-particle-canvas");e?(e.style.position="fixed",e.style.inset="0",e.style.width="100%",e.style.height="100%",e.style.pointerEvents="none",e.style.zIndex="1",e.style.webkitBackfaceVisibility="hidden",e.style.backfaceVisibility="hidden"):(e=document.createElement("canvas"),e.id="seasonal-particle-canvas",e.style.cssText="position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; -webkit-backface-visibility: hidden; backface-visibility: hidden;",document.body?document.body.insertBefore(e,document.body.firstChild):document.addEventListener("DOMContentLoaded",()=>{document.getElementById("seasonal-particle-canvas")||document.body.insertBefore(e,document.body.firstChild)})),c.canvas=e;const l=e.getContext("2d",{alpha:!0});if(!l)return;c.ctx=l;const r=new Date().getMonth()+1;let o="autumn";r>=1&&r<=3?o="spring":r>=4&&r<=6?o="summer":r>=7&&r<=9?o="autumn":o="winter",window.location.pathname.includes("documents")&&(o="winter"),c.season=o;const s=(k=!1)=>{if(!c.canvas)return;const I=window.innerWidth||document.documentElement.clientWidth||360,E=window.innerHeight||document.documentElement.clientHeight||640,L=I<768;if(!k&&L&&c.lastWidth>0){const N=Math.abs(I-c.lastWidth),d=Math.abs(E-c.lastHeight);if(N<10&&d<140)return}c.lastWidth=I,c.lastHeight=E,c.width=I,c.height=E;const T=Math.min(window.devicePixelRatio||1,2);c.dpr=T,c.canvas.width=Math.floor(I*T),c.canvas.height=Math.floor(E*T),c.canvas.style.width=I+"px",c.canvas.style.height=E+"px",c.ctx.setTransform(T,0,0,T,0,0)};s(!0),window.addEventListener("resize",()=>{c.resizeTimer&&clearTimeout(c.resizeTimer),c.resizeTimer=setTimeout(()=>{s(!1)},150)},{passive:!0});const h=c.width<768,g=h?12:20;c.particles=[];for(let k=0;k<g;k++){const I=k%3===0;c.particles.push({baseX:Math.random()*c.width,x:0,y:Math.random()*(c.height+60)-30,size:o==="winter"?Math.random()*3.2+2:h?Math.random()*4.5+4:Math.random()*5.5+5,speedY:o==="winter"?Math.random()*.5+.3:Math.random()*.55+.35,swayAmp:Math.random()*25+15,swayFreq:Math.random()*.012+.008,phase:Math.random()*Math.PI*2,baseRotation:Math.random()*360,rotSpeed:(Math.random()-.5)*.4,opacity:h?Math.random()*.3+.35:Math.random()*.35+.4,colorType:k%4,shape:I?"leaf_maple":"leaf_petal"})}function y(k){if(localStorage.getItem("particles_enabled")==="false"||document.hidden){c.ctx&&c.ctx.clearRect(0,0,c.width,c.height),c.animFrameId=null;return}c.lastTime||(c.lastTime=k);const I=k-c.lastTime;c.lastTime=k;const E=Math.min(Math.max(I/16.667,.3),1.8),L=c.width,T=c.height,N=c.season,d=c.ctx;d.clearRect(0,0,L,T);const z=c.particles.length;for(let u=0;u<z;u++){const a=c.particles[u];a.y+=a.speedY*E;const b=Math.sin(a.y*a.swayFreq+a.phase)*a.swayAmp;if(a.x=a.baseX+b,a.baseRotation+=a.rotSpeed*E,a.y>T+35&&(a.y=-35,a.baseX=Math.random()*L,a.phase=Math.random()*Math.PI*2),a.baseX>L+40&&(a.baseX=-30),a.baseX<-40&&(a.baseX=L+30),d.save(),d.translate(a.x,a.y),N==="autumn"){const H=a.baseRotation*Math.PI/180+Math.sin(a.y*.015+a.phase)*.35,M=Math.cos(a.y*.018+a.phase);d.rotate(H),d.scale(M,1),d.globalAlpha=a.opacity;let w="#f59e0b";if(a.colorType===1?w="#ea580c":a.colorType===2?w="#e11d48":a.colorType===3&&(w="#d97706"),d.fillStyle=w,d.beginPath(),a.shape==="leaf_maple"){const f=a.size;d.moveTo(0,-f),d.quadraticCurveTo(f*.45,-f*.3,f*.7,-f*.1),d.quadraticCurveTo(f*.35,f*.2,f*.4,f*.7),d.quadraticCurveTo(0,f*.4,-f*.4,f*.7),d.quadraticCurveTo(-f*.35,f*.2,-f*.7,-f*.1),d.quadraticCurveTo(-f*.45,-f*.3,0,-f)}else{const f=a.size;d.moveTo(0,-f),d.bezierCurveTo(f*.55,-f*.4,f*.55,f*.4,0,f),d.bezierCurveTo(-f*.55,f*.4,-f*.55,-f*.4,0,-f)}d.fill()}else if(N==="winter")if(d.rotate(a.baseRotation*Math.PI/180),d.globalAlpha=a.opacity,a.shape==="leaf_maple"){d.strokeStyle="rgba(255, 255, 255, 0.9)",d.lineWidth=Math.max(1,a.size*.2),d.lineCap="round",d.beginPath();for(let H=0;H<6;H++)d.moveTo(0,0),d.lineTo(0,a.size),d.moveTo(0,a.size*.55),d.lineTo(a.size*.25,a.size*.75),d.moveTo(0,a.size*.55),d.lineTo(-a.size*.25,a.size*.75),d.rotate(Math.PI/3);d.stroke()}else{const H=d.createRadialGradient(0,0,0,0,0,a.size);H.addColorStop(0,"rgba(255, 255, 255, 0.95)"),H.addColorStop(.4,"rgba(224, 242, 254, 0.75)"),H.addColorStop(1,"rgba(255, 255, 255, 0)"),d.fillStyle=H,d.beginPath(),d.arc(0,0,a.size,0,Math.PI*2),d.fill()}else if(N==="spring"){const H=a.baseRotation*Math.PI/180;d.rotate(H),d.scale(Math.cos(a.y*.02+a.phase),1),d.globalAlpha=a.opacity,d.fillStyle="rgba(255, 183, 197, 0.85)",d.beginPath(),d.ellipse(0,0,a.size,a.size*.55,0,0,Math.PI*2),d.fill()}else if(N==="summer"){const H=a.baseRotation*Math.PI/180;d.rotate(H),d.scale(Math.cos(a.y*.02+a.phase),1),d.globalAlpha=a.opacity,d.fillStyle="rgba(74, 222, 128, 0.8)",d.beginPath(),d.ellipse(0,0,a.size,a.size*.45,.3,0,Math.PI*2),d.fill()}d.restore()}c.animFrameId=requestAnimationFrame(y)}function S(){c.animFrameId&&(cancelAnimationFrame(c.animFrameId),c.animFrameId=null),localStorage.getItem("particles_enabled")!=="false"&&!document.hidden&&(c.lastTime=performance.now(),c.animFrameId=requestAnimationFrame(y))}c.startLoop=S,c.isInitialized=!0;const m=localStorage.getItem("particles_enabled")!=="false";e&&(e.style.display=m?"block":"none"),m&&S(),document.addEventListener("visibilitychange",()=>{document.hidden?c.animFrameId&&(cancelAnimationFrame(c.animFrameId),c.animFrameId=null):S()}),window.startParticleLoop=S}window.initSeasonalParticles=Z;window.updateParticleToggleBtns=function(c){const e=document.querySelectorAll("#particle-toggle-btn, .particle-toggle-btn"),l=`<svg class="header-svg-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="${c?"#38bdf8":"#94a3b8"}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="${c?"":"opacity: 0.4;"}"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line><line x1="4.93" y1="19.07" x2="19.07" y2="4.93"></line><polyline points="9 3.5 12 6.5 15 3.5"></polyline><polyline points="9 20.5 12 17.5 15 20.5"></polyline><polyline points="3.5 9 6.5 12 3.5 15"></polyline><polyline points="20.5 9 17.5 12 20.5 15"></polyline></svg>`;e.forEach(r=>{c?(r.classList.remove("particles-off"),r.innerHTML=l,r.title="Tắt hiệu ứng mùa rơi (Đang BẬT)"):(r.classList.add("particles-off"),r.innerHTML=l,r.title="Bật hiệu ứng mùa rơi (Đang TẮT)")})};function ot(){const c=Date.now();if(window.__lastParticleToggleTime&&c-window.__lastParticleToggleTime<320)return;window.__lastParticleToggleTime=c;const l=!(localStorage.getItem("particles_enabled")!=="false");localStorage.setItem("particles_enabled",l?"true":"false"),typeof window.updateParticleToggleBtns=="function"&&window.updateParticleToggleBtns(l);const r=document.getElementById("seasonal-particle-canvas");r&&(r.style.display=l?"block":"none");const o=nt();l?typeof o.startLoop=="function"?o.startLoop():typeof window.startParticleLoop=="function"&&window.startParticleLoop():(o.animFrameId&&(cancelAnimationFrame(o.animFrameId),o.animFrameId=null),o.ctx&&o.width&&o.height&&o.ctx.clearRect(0,0,o.width,o.height)),typeof window.showToast=="function"&&window.showToast(l?"Đã bật hiệu ứng mùa rơi ❄️":"Đã tắt hiệu ứng mùa rơi để tăng tốc độ ⚡")}window.toggleSeasonalParticles=ot;document.addEventListener("click",c=>{c.target.closest("#particle-toggle-btn, .particle-toggle-btn")&&ot()});(function(){if(window.__hasMainStudyTimer)return;let e=0;const l=window.location.origin.includes("5173")?"http://localhost:5000":window.location.origin;function r(o){if(!o||o<=0)return;const s=new Date().toLocaleDateString("sv");let h="guest";try{const y=localStorage.getItem("user");if(y){const S=JSON.parse(y);S&&S.email&&(h=S.email)}}catch{}const g=h!=="guest"?`daily_study_history_${h}`:"daily_study_history_guest";try{const y=localStorage.getItem(g),S=y?JSON.parse(y):{};S[s]=(S[s]||0)+o,localStorage.setItem(g,JSON.stringify(S));const m=h!=="guest"?`user_stats_${h}`:"user_stats_guest",k=localStorage.getItem(m),I=k?JSON.parse(k):{streak:0,studyTime:0};I.studyTime=(I.studyTime||0)+o,localStorage.setItem(m,JSON.stringify(I))}catch{}}setInterval(()=>{if(!window.__hasMainStudyTimer&&document.hasFocus()&&(e++,e>=15)){const o=e;e=0;const s=new Date().toLocaleDateString("sv");r(o);const h=localStorage.getItem("session_token"),g={"Content-Type":"application/json"};h&&(g.Authorization=`Bearer ${h}`,g["x-session-token"]=h),fetch(l+"/api/user/stats/sync",{method:"POST",headers:g,body:JSON.stringify({incrementStudyTime:o,localDateStr:s}),credentials:"include"}).then(y=>y.ok?y.json():null).then(y=>{if(y&&y.dailyHistory){let S=null;try{const m=localStorage.getItem("user");if(m){const k=JSON.parse(m);k&&k.email&&(S=k.email)}}catch{}if(S)try{localStorage.setItem(`daily_study_history_${S}`,JSON.stringify(y.dailyHistory)),localStorage.setItem(`user_stats_${S}`,JSON.stringify({streak:y.streak,studyTime:y.studyTime}))}catch{}}}).catch(()=>{})}},1e3)})();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{Z();const c=localStorage.getItem("particles_enabled")!=="false";window.updateParticleToggleBtns&&window.updateParticleToggleBtns(c)});else{Z();const c=localStorage.getItem("particles_enabled")!=="false";window.updateParticleToggleBtns&&window.updateParticleToggleBtns(c)}class it{constructor(){this.isActive=!1,this.isDrawing=!1,this.mode="pen",this.color="#ef4444",this.lineWidth=4,this.highlighterWidth=28,this.laserWidth=16,this.eraserWidth=28,this.history=[],this.redoStack=[],this.maxHistory=20,this.laserTrails=[],this.laserAnimFrame=null,this.isVisible=!0,this.canvas=null,this.ctx=null,this.bubble=null,this.toolbar=null,this.eraserCursor=null,this.lastX=0,this.lastY=0,this.isDraggingBubble=!1,this.isDraggingToolbar=!1,this.init()}init(){window.self===window.top&&(document.getElementById("screen-drawing-canvas-overlay")||(this.createCanvas(),this.createFloatingBubble(),this.createToolbar(),this.bindEvents(),this.initHotkeys(),window.screenDrawingTool=this,window.toggleScreenDrawing=e=>this.toggle(e),window.clearScreenDrawing=()=>this.clear(),window.setScreenDrawingMode=e=>this.setMode(e),window.setScreenDrawingColor=e=>this.setColor(e),window.setScreenDrawingWidth=e=>this.setWidth(e)))}createCanvas(){this.canvas=document.createElement("canvas"),this.canvas.id="screen-drawing-canvas-overlay",this.canvas.className="screen-drawing-canvas",document.body.appendChild(this.canvas),this.ctx=this.canvas.getContext("2d",{willReadFrequently:!0}),this.resizeCanvas(),window.addEventListener("resize",()=>this.resizeCanvas()),window.addEventListener("orientationchange",()=>setTimeout(()=>this.resizeCanvas(),120)),window.visualViewport&&(window.visualViewport.addEventListener("resize",()=>this.resizeCanvas()),window.visualViewport.addEventListener("scroll",()=>this.resizeCanvas()))}resizeCanvas(){if(!this.canvas)return;const e=this.canvas.getBoundingClientRect(),l=Math.max(window.innerWidth,Math.round(e.width||0),document.documentElement.clientWidth||0),r=Math.max(window.innerHeight,Math.round(e.height||0),document.documentElement.clientHeight||0);if(this.canvas.width===l&&this.canvas.height===r)return;let o=null;this.canvas.width>0&&this.canvas.height>0&&(o=document.createElement("canvas"),o.width=this.canvas.width,o.height=this.canvas.height,o.getContext("2d").drawImage(this.canvas,0,0)),this.canvas.width=l,this.canvas.height=r,this.canvas.style.width="100vw",this.canvas.style.height="100vh",this.ctx.lineCap="round",this.ctx.lineJoin="round",o&&this.ctx.drawImage(o,0,0,o.width,o.height,0,0,l,r)}createFloatingBubble(){this.bubble=document.createElement("div"),this.bubble.id="screen-pen-floating-bubble",this.bubble.className="screen-pen-floating-bubble",this.bubble.title="Bật/Tắt Bút viết tay lên màn hình (Phím D)",this.bubble.innerHTML=`
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
        <button class="dt-btn dt-action-btn" id="dt-save-btn" title="Chụp & Cắt màn hình (Win + Shift + S / Shift + S)">
          <i class="fa-solid fa-camera"></i>
        </button>
      </div>

      <div class="dt-divider"></div>

      <!-- Close / Collapse Button -->
      <button class="dt-btn dt-close-btn" id="dt-close-btn" title="Thu gọn / Đóng chế độ vẽ (Phím D hoặc ESC)">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `,document.body.appendChild(this.toolbar)}bindEvents(){this.bubble.addEventListener("click",m=>{m.stopPropagation(),this.toggle()}),this.bubble.addEventListener("touchend",m=>{m.preventDefault(),m.stopPropagation(),this.toggle()},{passive:!1});const e=this.toolbar.querySelector(".dt-drag-handle");this.makeDraggable(this.toolbar,e),this.toolbar.querySelectorAll(".dt-modes .dt-btn").forEach(m=>{m.addEventListener("click",k=>{k.stopPropagation(),this.setMode(m.dataset.mode)})}),this.toolbar.querySelectorAll(".dt-color-btn").forEach(m=>{m.addEventListener("click",k=>{k.stopPropagation(),this.setColor(m.dataset.color)})}),this.toolbar.querySelectorAll(".dt-size-btn").forEach((m,k)=>{m.addEventListener("click",I=>{if(I.stopPropagation(),this.mode==="pen"){const E=[3,6,12,24];this.setWidth(E[k])}else if(this.mode==="highlighter"){const E=[15,28,48,80];this.setHighlighterWidth(E[k])}else if(this.mode==="laser"){const E=[8,16,30,50];this.setLaserWidth(E[k])}else if(this.mode==="eraser"){const E=[12,28,56,110];this.setEraserWidth(E[k])}})});const l=document.getElementById("dt-undo-btn");l&&l.addEventListener("click",m=>{m.stopPropagation(),this.undo()});const r=document.getElementById("dt-redo-btn");r&&r.addEventListener("click",m=>{m.stopPropagation(),this.redo()});const o=document.getElementById("dt-clear-btn");o&&o.addEventListener("click",m=>{m.stopPropagation(),this.clear()});const s=document.getElementById("dt-vis-btn");s&&s.addEventListener("click",m=>{m.stopPropagation(),this.toggleVisibility()});const h=document.getElementById("dt-save-btn");h&&h.addEventListener("click",m=>{m.stopPropagation(),this.saveImage()});const g=document.getElementById("dt-close-btn");g&&g.addEventListener("click",m=>{m.stopPropagation(),this.toggle(!1)});const y=document.getElementById("dt-custom-color-input"),S=document.getElementById("dt-custom-color-preview");y&&(y.addEventListener("input",m=>{const k=m.target.value;this.setColor(k),this.toolbar.querySelectorAll(".dt-color-btn").forEach(I=>I.classList.remove("active")),S&&(S.style.background=k,S.innerHTML="")}),y.addEventListener("change",m=>{const k=m.target.value;this.setColor(k),this.toolbar.querySelectorAll(".dt-color-btn").forEach(I=>I.classList.remove("active")),S&&(S.style.background=k,S.innerHTML="")})),S&&S.addEventListener("click",m=>{m.stopPropagation(),y&&y.click()}),this.canvas.addEventListener("pointerdown",m=>this.handlePointerStart(m)),this.canvas.addEventListener("pointermove",m=>{this.updateEraserCursorPos(m),this.handlePointerMove(m)}),this.canvas.addEventListener("pointerup",m=>this.handlePointerEnd(m)),this.canvas.addEventListener("pointercancel",m=>this.handlePointerEnd(m)),this.canvas.addEventListener("pointerleave",m=>{this.eraserCursor&&(this.eraserCursor.style.display="none"),this.handlePointerEnd(m)})}makeDraggable(e,l,r,o){let h=0,g=0,y=0,S=0,m=!1,k=!1;const I=T=>{if(T.target.closest("button")&&l!==e)return;m=!0,k=!1;const N=T.clientX||T.touches&&T.touches[0].clientX,d=T.clientY||T.touches&&T.touches[0].clientY;h=N,g=d;const z=e.getBoundingClientRect();y=z.left,S=z.top,document.addEventListener("pointermove",E),document.addEventListener("pointerup",L)},E=T=>{if(!m)return;const N=T.clientX||T.touches&&T.touches[0].clientX,d=T.clientY||T.touches&&T.touches[0].clientY,z=N-h,u=d-g,a=Math.sqrt(z*z+u*u);if(!k&&a<8)return;k||(k=!0,e.style.right="auto",e.style.bottom="auto",e.style.left=y+"px",e.style.top=S+"px",r&&r());const b=Math.max(10,Math.min(window.innerWidth-e.offsetWidth-10,y+z)),H=Math.max(10,Math.min(window.innerHeight-e.offsetHeight-10,S+u));e.style.left=b+"px",e.style.top=H+"px"},L=()=>{m&&(m=!1,document.removeEventListener("pointermove",E),document.removeEventListener("pointerup",L),k&&o&&o(),k=!1)};l.addEventListener("pointerdown",I)}toggle(e){const l=typeof e=="boolean"?e:!this.isActive;if(l&&typeof window.isUserLoggedIn=="function"&&!window.isUserLoggedIn()){typeof window.openLoginPrompt=="function"&&window.openLoginPrompt("sử dụng Bút vẽ màn hình");return}this.isActive=l,this.canvas.classList.toggle("active",this.isActive),this.bubble.classList.toggle("active",this.isActive),this.toolbar.classList.toggle("active",this.isActive),this.toolbar.style.display=this.isActive?"flex":"none",document.body.classList.toggle("screen-drawing-active",this.isActive),this.isActive&&(this.resizeCanvas(),this.showToast("✏️ Đã BẬT Bút vẽ màn hình! Bạn có thể viết, vẽ hoặc ghi chú tự do."))}setMode(e){this.mode=e,this.toolbar.querySelectorAll(".dt-modes .dt-btn").forEach(l=>{l.classList.toggle("active",l.dataset.mode===e)}),this.canvas.setAttribute("data-mode",e),this.updateSizeButtonsUI(),e!=="eraser"&&this.eraserCursor&&(this.eraserCursor.style.display="none")}setColor(e){this.color=e,this.toolbar.querySelectorAll(".dt-color-btn").forEach(o=>{o.classList.toggle("active",o.dataset.color===e)});const l=document.getElementById("dt-custom-color-preview"),r=document.getElementById("dt-custom-color-input");l&&this.toolbar.querySelector(`.dt-color-btn[data-color="${e}"]`)&&(l.style.background="conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",l.innerHTML='<i class="fa-solid fa-palette" style="font-size:0.72rem; color:#fff; text-shadow:0 1px 3px rgba(0,0,0,0.8);"></i>'),r&&(r.value=e),this.mode==="eraser"&&this.setMode("pen")}setWidth(e){this.lineWidth=e,this.updateSizeButtonsUI()}setHighlighterWidth(e){this.highlighterWidth=e,this.updateSizeButtonsUI()}setLaserWidth(e){this.laserWidth=e,this.updateSizeButtonsUI()}setEraserWidth(e){this.eraserWidth=e,this.updateSizeButtonsUI(),this.eraserCursor&&(this.eraserCursor.style.width=`${e}px`,this.eraserCursor.style.height=`${e}px`)}updateSizeButtonsUI(){const e=this.toolbar.querySelectorAll(".dt-size-btn");let l=[],r=0;this.mode==="pen"?(r=this.lineWidth,l=[{size:3,title:"Nét bút mảnh (3px)",dot:"6px"},{size:6,title:"Nét bút vừa (6px)",dot:"10px"},{size:12,title:"Nét bút dày (12px)",dot:"16px"},{size:24,title:"Nét bút cực to (24px)",dot:"22px"}]):this.mode==="highlighter"?(r=this.highlighterWidth||28,l=[{size:15,title:"Bút dạ quang mảnh (15px) - Tô gạch chân / từ",dot:"6px"},{size:28,title:"Bút dạ quang vừa (28px) - Tô cụm từ",dot:"10px"},{size:48,title:"Bút dạ quang dày (48px) - Tô nổi bật cả câu",dot:"16px"},{size:80,title:"Bút dạ quang cực to (80px) - Tô vùng lớn",dot:"22px"}]):this.mode==="laser"?(r=this.laserWidth||16,l=[{size:8,title:"Tia Laser mảnh (8px) - Chỉ điểm chi tiết",dot:"6px"},{size:16,title:"Tia Laser vừa (16px) - Chỉ điểm chuẩn",dot:"10px"},{size:30,title:"Tia Laser lớn (30px) - Nổi bật bài giảng",dot:"16px"},{size:50,title:"Tia Laser cực lớn (50px) - Gây chú ý mạnh",dot:"22px"}]):this.mode==="eraser"&&(r=this.eraserWidth||28,l=[{size:12,title:"Cục tẩy nhỏ (12px) - Xóa chi tiết nhỏ",dot:"6px"},{size:28,title:"Cục tẩy vừa (28px) - Xóa chữ / nét vựng",dot:"10px"},{size:56,title:"Cục tẩy to (56px) - Xóa vùng lớn",dot:"16px"},{size:110,title:"Cục tẩy cực to (110px) - Xóa siêu tốc",dot:"22px"}]),e.forEach((o,s)=>{const h=l[s]||l[0];o.classList.toggle("active",r===h.size),o.setAttribute("title",h.title);const g=o.querySelector("span");g&&(g.style.width=h.dot,g.style.height=h.dot)})}updateEraserCursorPos(e){this.isActive&&this.mode==="eraser"&&this.eraserCursor?(this.eraserCursor.style.display="block",this.eraserCursor.style.width=`${this.eraserWidth||28}px`,this.eraserCursor.style.height=`${this.eraserWidth||28}px`,this.eraserCursor.style.left=`${e.clientX}px`,this.eraserCursor.style.top=`${e.clientY}px`):this.eraserCursor&&(this.eraserCursor.style.display="none")}saveState(){try{const e=this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);this.history.push(e),this.history.length>this.maxHistory&&this.history.shift(),this.redoStack=[]}catch{}}undo(){if(this.history.length===0){this.clear();return}try{const e=this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);this.redoStack.push(e);const l=this.history.pop();this.ctx.putImageData(l,0,0)}catch{}}redo(){if(this.redoStack.length!==0)try{const e=this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);this.history.push(e);const l=this.redoStack.pop();this.ctx.putImageData(l,0,0)}catch{}}clear(){this.ctx&&this.canvas&&(this.saveState(),this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.laserTrails=[],this.showToast("🗑️ Đã xóa sạch nét vẽ!"))}toggleVisibility(){this.isVisible=!this.isVisible,this.canvas.style.opacity=this.isVisible?"1":"0";const e=document.getElementById("dt-vis-btn");e&&(e.innerHTML=this.isVisible?'<i class="fa-solid fa-eye"></i>':'<i class="fa-solid fa-eye-slash" style="color: #ef4444;"></i>')}playShutterSound(){try{const e=window.AudioContext||window.webkitAudioContext;if(!e)return;const l=new e,r=l.currentTime,o=l.createOscillator(),s=l.createGain();o.type="triangle",o.frequency.setValueAtTime(140,r),o.frequency.exponentialRampToValueAtTime(35,r+.05),s.gain.setValueAtTime(.35,r),s.gain.exponentialRampToValueAtTime(.01,r+.05),o.connect(s),s.connect(l.destination),o.start(r),o.stop(r+.05);const h=l.createOscillator(),g=l.createGain();h.type="square",h.frequency.setValueAtTime(750,r+.04),h.frequency.exponentialRampToValueAtTime(120,r+.12),g.gain.setValueAtTime(.25,r+.04),g.gain.exponentialRampToValueAtTime(.001,r+.12),h.connect(g),g.connect(l.destination),h.start(r+.04),h.stop(r+.12)}catch{}}triggerShutterEffect(){this.playShutterSound();let e=document.getElementById("screen-camera-flash");e||(e=document.createElement("div"),e.id="screen-camera-flash",document.body.appendChild(e)),e.style.opacity="0.9",e.style.display="block",setTimeout(()=>{e.style.opacity="0",setTimeout(()=>{e&&e.parentNode&&e.parentNode.removeChild(e)},260)},50)}saveImage(){this.startSnipping()}startSnipping(){this.cancelSnipping(),this.isSnipping=!0;const e=document.createElement("div");e.id="screen-snipping-overlay",e.innerHTML=`
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
    `,document.body.appendChild(e);let l=!1,r=0,o=0,s=null,h=null;const g=e.querySelector("#snip-mode-rect"),y=e.querySelector("#snip-mode-fullscreen"),S=e.querySelector("#snip-mode-window"),m=e.querySelector("#snip-mode-cancel");g==null||g.addEventListener("click",L=>{L.stopPropagation(),e.querySelectorAll(".snipping-mode-btn").forEach(T=>T.classList.remove("active")),g.classList.add("active")}),y==null||y.addEventListener("click",L=>{L.stopPropagation(),this.cancelSnipping(),this.captureRegion(null)}),S==null||S.addEventListener("click",L=>{L.stopPropagation(),this.cancelSnipping();const N=(document.querySelector(".hero-stage-card")||document.querySelector(".dict-main-workspace-grid")||document.querySelector(".dict-page-container")||document.querySelector(".container")||document.body).getBoundingClientRect();this.captureRegion({x:Math.max(0,N.left),y:Math.max(0,N.top),width:Math.min(window.innerWidth,N.width),height:Math.min(window.innerHeight,N.height)})}),m==null||m.addEventListener("click",L=>{L.stopPropagation(),this.cancelSnipping()});const k=L=>{L.target.closest("#snipping-top-bar")||(L.preventDefault(),L.stopPropagation(),l=!0,r=L.clientX||(L.touches&&L.touches[0]?L.touches[0].clientX:0),o=L.clientY||(L.touches&&L.touches[0]?L.touches[0].clientY:0),s||(s=document.createElement("div"),s.id="snip-selection-box",h=document.createElement("div"),h.id="snip-dim-tag",s.appendChild(h),e.appendChild(s)),s.style.left=`${r}px`,s.style.top=`${o}px`,s.style.width="0px",s.style.height="0px",s.style.display="block")},I=L=>{if(!l||!s)return;L.preventDefault(),L.stopPropagation();const T=L.clientX||(L.touches&&L.touches[0]?L.touches[0].clientX:r),N=L.clientY||(L.touches&&L.touches[0]?L.touches[0].clientY:o),d=Math.min(r,T),z=Math.min(o,N),u=Math.abs(T-r),a=Math.abs(N-o);s.style.left=`${d}px`,s.style.top=`${z}px`,s.style.width=`${u}px`,s.style.height=`${a}px`,h&&(h.textContent=`${Math.round(u)} × ${Math.round(a)} px`)},E=L=>{if(!l)return;if(l=!1,!s){this.cancelSnipping();return}const T=s.getBoundingClientRect(),N=T.width,d=T.height,z=T.left,u=T.top;this.cancelSnipping(),N>12&&d>12?this.captureRegion({x:z,y:u,width:N,height:d}):this.captureRegion(null)};e.addEventListener("mousedown",k),e.addEventListener("mousemove",I),e.addEventListener("mouseup",E),e.addEventListener("touchstart",k,{passive:!1}),e.addEventListener("touchmove",I,{passive:!1}),e.addEventListener("touchend",E,{passive:!1})}cancelSnipping(){this.isSnipping=!1;const e=document.getElementById("screen-snipping-overlay");e&&e.parentNode&&e.parentNode.removeChild(e)}async captureRegion(e=null){try{this.triggerShutterEffect();const l=window.pageXOffset||document.documentElement.scrollLeft||document.body.scrollLeft||0,r=window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0,o=window.innerWidth,s=window.innerHeight;let h=0,g=0,y=o,S=s;e&&typeof e.width=="number"&&typeof e.height=="number"&&e.width>5&&e.height>5&&(h=Math.max(0,Math.min(o-5,Math.round(e.x))),g=Math.max(0,Math.min(s-5,Math.round(e.y))),y=Math.max(5,Math.min(o-h,Math.round(e.width))),S=Math.max(5,Math.min(s-g,Math.round(e.height))));const m=this.toolbar?this.toolbar.style.display:"none",k=this.bubble?this.bubble.style.display:"none",I=this.canvas?this.canvas.style.display:"none",E=document.getElementById("screen-drawing-eraser-cursor"),L=E?E.style.display:"none";this.toolbar&&(this.toolbar.style.display="none"),this.bubble&&(this.bubble.style.display="none"),E&&(E.style.display="none"),this.canvas&&(this.canvas.style.display="none"),await new Promise(a=>setTimeout(a,60));const T=Math.min(window.devicePixelRatio||1.5,2),N=document.fullscreenElement||document.body;let d=null;try{d=await at(N,{useCORS:!0,allowTaint:!0,backgroundColor:null,scale:T,logging:!1,x:h+l,y:g+r,width:y,height:S,scrollX:l,scrollY:r,windowWidth:document.documentElement.clientWidth||o,windowHeight:document.documentElement.clientHeight||s,ignoreElements:a=>a.id==="screen-drawing-canvas-overlay"||a.id==="screen-drawing-toolbar"||a.id==="screen-pen-floating-bubble"||a.id==="screen-drawing-eraser-cursor"||a.id==="screen-snipping-overlay"||a.id==="screen-camera-flash"||a.id==="screen-snipping-preview-widget"||a.id==="screen-drawing-toast"||a.id==="lesson-toast"||a.id==="toast"})}catch(a){console.warn("html2canvas capture error:",a)}this.toolbar&&(this.toolbar.style.display=m),this.bubble&&(this.bubble.style.display=k),E&&(E.style.display=L),this.canvas&&(this.canvas.style.display=I);const z=document.createElement("canvas");z.width=Math.round(y*T),z.height=Math.round(S*T);const u=z.getContext("2d");d&&d.width>0&&d.height>0?u.drawImage(d,0,0,d.width,d.height,0,0,z.width,z.height):(u.fillStyle="#0f172a",u.fillRect(0,0,z.width,z.height)),this.canvas&&this.canvas.width>0&&this.canvas.height>0&&u.drawImage(this.canvas,h,g,y,S,0,0,z.width,z.height),z.toBlob(async a=>{if(!a){this.showToast("Lỗi khi xuất ảnh chụp màn hình!",!0);return}const b=z.toDataURL("image/png");let H=!1;try{if(navigator.clipboard&&window.ClipboardItem){const F=new ClipboardItem({"image/png":a});await navigator.clipboard.write([F]),H=!0}}catch(F){console.warn("Clipboard write permission:",F)}const M=new Date,f=`tieng-trung-hong-tai-snip-${`${M.getFullYear()}${String(M.getMonth()+1).padStart(2,"0")}${String(M.getDate()).padStart(2,"0")}_${String(M.getHours()).padStart(2,"0")}${String(M.getMinutes()).padStart(2,"0")}${String(M.getSeconds()).padStart(2,"0")}`}.png`,C=URL.createObjectURL(a),v=document.createElement("a");v.href=C,v.download=f,document.body.appendChild(v),v.click(),document.body.removeChild(v),setTimeout(()=>URL.revokeObjectURL(C),1e4),this.showSnippingPreviewWidget(a,b,f,H),this.showToast("📸 Đã cắt và chụp vùng chọn thành công!")},"image/png")}catch(l){console.error("Capture region error:",l),this.showToast("Có lỗi xảy ra khi chụp màn hình!",!0)}}showSnippingPreviewWidget(e,l,r,o){let s=document.getElementById("screen-snipping-preview-widget");s&&s.parentNode&&s.parentNode.removeChild(s),s=document.createElement("div"),s.id="screen-snipping-preview-widget",s.innerHTML=`
      <img src="${l}" class="snip-widget-thumb" alt="Ảnh chụp màn hình">
      <div style="flex: 1; min-width: 0;">
        <div class="snip-widget-title">
          <i class="fa-solid fa-camera-retro" style="color: #38bdf8;"></i> Đã Chụp Màn Hình!
        </div>
        <div class="snip-widget-sub">
          ${o?"Đã copy vào Clipboard (<strong>Ctrl + V</strong> để dán)":"Đã lưu file ảnh về máy của bạn"}
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
    `,document.body.appendChild(s);const h=s.querySelector("#snip-copy-again-btn"),g=s.querySelector("#snip-draw-btn"),y=s.querySelector("#snip-close-widget-btn");h==null||h.addEventListener("click",async()=>{try{if(navigator.clipboard&&window.ClipboardItem){const S=new ClipboardItem({"image/png":e});await navigator.clipboard.write([S]),this.showToast("📋 Đã sao chép lại vào Clipboard! Nhấn Ctrl + V để dán")}}catch{this.showToast("Không thể sao chép vào Clipboard trên trình duyệt này",!0)}}),g==null||g.addEventListener("click",()=>{this.isActive||this.toggle(!0),s&&s.parentNode&&s.parentNode.removeChild(s)}),y==null||y.addEventListener("click",()=>{s&&s.parentNode&&s.parentNode.removeChild(s)}),clearTimeout(this._widgetTimer),this._widgetTimer=setTimeout(()=>{s&&s.parentNode&&(s.style.opacity="0",s.style.transform="translateY(20px)",s.style.transition="all 0.3s ease",setTimeout(()=>{s&&s.parentNode&&s.parentNode.removeChild(s)},300))},5500)}getCanvasPoint(e){if(!this.canvas)return{x:0,y:0};const l=this.canvas.getBoundingClientRect();let r=e.clientX,o=e.clientY;r===void 0&&e.touches&&e.touches.length>0?(r=e.touches[0].clientX,o=e.touches[0].clientY):r===void 0&&e.changedTouches&&e.changedTouches.length>0&&(r=e.changedTouches[0].clientX,o=e.changedTouches[0].clientY),r=typeof r=="number"&&!isNaN(r)?r:0,o=typeof o=="number"&&!isNaN(o)?o:0;const s=l.width&&l.width>0?this.canvas.width/l.width:1,h=l.height&&l.height>0?this.canvas.height/l.height:1;return{x:(r-l.left)*s,y:(o-l.top)*h}}handlePointerStart(e){if(!this.isActive)return;e.preventDefault(),e.stopPropagation(),this.isDrawing=!0,this.saveState();const{x:l,y:r}=this.getCanvasPoint(e);if(this.lastX=l,this.lastY=r,this.mode==="laser"){this.addLaserPoint(l,r);return}this.setupContextStyles(e),this.ctx.beginPath();let o=Math.max(2,(this.lineWidth||4)/2);this.mode==="eraser"?o=(this.eraserWidth||28)/2:this.mode==="highlighter"&&(o=(this.highlighterWidth||28)/2),this.ctx.arc(l,r,o,0,Math.PI*2),this.ctx.fill()}handlePointerMove(e){if(!this.isActive||!this.isDrawing)return;e.preventDefault(),e.stopPropagation();const{x:l,y:r}=this.getCanvasPoint(e);if(this.mode==="laser"){this.addLaserPoint(l,r),this.lastX=l,this.lastY=r;return}this.setupContextStyles(e),this.ctx.beginPath(),this.ctx.moveTo(this.lastX,this.lastY),this.ctx.lineTo(l,r),this.ctx.stroke(),this.lastX=l,this.lastY=r}handlePointerEnd(e){this.isDrawing&&(e&&(e.preventDefault(),e.stopPropagation()),this.isDrawing=!1)}setupContextStyles(e){let l=this.lineWidth;e&&e.pressure&&e.pressure>0&&(l=Math.max(2,this.lineWidth*e.pressure*1.6)),this.ctx.lineCap="round",this.ctx.lineJoin="round",this.mode==="pen"?(this.ctx.globalCompositeOperation="source-over",this.ctx.strokeStyle=this.color,this.ctx.fillStyle=this.color,this.ctx.lineWidth=l,this.ctx.globalAlpha=1,this.ctx.shadowBlur=0):this.mode==="highlighter"?(this.ctx.globalCompositeOperation="source-over",this.ctx.strokeStyle=this.color,this.ctx.fillStyle=this.color,this.ctx.lineWidth=this.highlighterWidth||28,this.ctx.globalAlpha=.4,this.ctx.shadowBlur=0):this.mode==="eraser"&&(this.ctx.globalCompositeOperation="destination-out",this.ctx.lineWidth=this.eraserWidth||28,this.ctx.globalAlpha=1,this.ctx.shadowBlur=0)}addLaserPoint(e,l){this.laserTrails.push({x:e,y:l,color:this.color,width:this.laserWidth||16,createdAt:Date.now()}),this.laserAnimFrame||this.startLaserAnimation()}startLaserAnimation(){const e=()=>{const l=Date.now(),r=1200;if(this.laserTrails=this.laserTrails.filter(o=>l-o.createdAt<r),this.laserTrails.length>0){this.ctx.save(),this.ctx.globalCompositeOperation="source-over";for(let o=0;o<this.laserTrails.length;o++){const s=this.laserTrails[o],h=l-s.createdAt,g=Math.max(0,1-h/r);this.ctx.beginPath(),this.ctx.arc(s.x,s.y,s.width*(g*.7+.3),0,Math.PI*2),this.ctx.fillStyle=s.color,this.ctx.globalAlpha=g*.85,this.ctx.shadowColor=s.color,this.ctx.shadowBlur=15,this.ctx.fill()}this.ctx.restore(),this.laserAnimFrame=requestAnimationFrame(e)}else this.laserAnimFrame=null};this.laserAnimFrame=requestAnimationFrame(e)}initHotkeys(){document.addEventListener("keydown",e=>{const l=e.target&&e.target.tagName?e.target.tagName.toLowerCase():"";if(l==="input"||l==="textarea"||e.target.isContentEditable||document.querySelector(".phidao-wrapper")||document.querySelector(".snake-game-wrapper")||document.querySelector(".tone-rhythm-wrapper")||document.querySelector(".notebook-games-hub-wrapper")||document.querySelector("#game-active-viewport")||document.querySelector('#notebook-games-hub-modal[style*="display: block"]')||document.querySelector('#notebook-games-hub-modal[style*="display: flex"]')||window._activeNotebookGame)return;const r=e.key.toLowerCase();if(r==="s"&&e.shiftKey||e.key==="PrintScreen"){e.preventDefault(),this.startSnipping();return}if(e.key==="Escape"&&this.isSnipping){e.preventDefault(),this.cancelSnipping();return}r==="d"&&!e.ctrlKey&&!e.metaKey?(e.preventDefault(),this.toggle()):r==="c"&&!e.ctrlKey&&!e.metaKey&&this.isActive?(e.preventDefault(),this.clear()):r==="e"&&!e.ctrlKey&&!e.metaKey&&this.isActive?(e.preventDefault(),this.setMode("eraser")):r==="p"&&!e.ctrlKey&&!e.metaKey&&this.isActive?(e.preventDefault(),this.setMode("pen")):r==="h"&&!e.ctrlKey&&!e.metaKey&&this.isActive?(e.preventDefault(),this.setMode("highlighter")):r==="l"&&!e.ctrlKey&&!e.metaKey&&this.isActive?(e.preventDefault(),this.setMode("laser")):e.key==="Escape"&&this.isActive?(e.preventDefault(),this.toggle(!1)):r==="z"&&(e.ctrlKey||e.metaKey)&&this.isActive?(e.preventDefault(),e.shiftKey?this.redo():this.undo()):r==="y"&&(e.ctrlKey||e.metaKey)&&this.isActive&&(e.preventDefault(),this.redo())})}showToast(e,l=!1){if(typeof window.showToast=="function"){window.showToast(e,l);return}let r=document.getElementById("screen-drawing-toast");r||(r=document.createElement("div"),r.id="screen-drawing-toast",r.style.cssText="position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%) translateY(100px); background: rgba(15, 23, 42, 0.95); color: #ffffff; padding: 14px 28px; border-radius: 99px; font-weight: 700; font-size: 0.95rem; box-shadow: 0 12px 35px rgba(0,0,0,0.6); border: 1.5px solid rgba(56, 189, 248, 0.6); z-index: 99999999; opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; align-items: center; gap: 10px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); text-align: center; max-width: 90vw;",document.body.appendChild(r)),r.innerHTML=e,r.style.borderColor=l?"rgba(239, 68, 68, 0.7)":"rgba(56, 189, 248, 0.7)",r.style.opacity="1",r.style.transform="translateX(-50%) translateY(0)",clearTimeout(r._timer),r._timer=setTimeout(()=>{r.style.opacity="0",r.style.transform="translateX(-50%) translateY(100px)"},3200)}}window.self===window.top&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>new it):new it);let j=!1;window.toggleAppFullscreen||(window.toggleAppFullscreen=function(c){const e=!!(document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement);(typeof c=="boolean"?c:!j&&!e)?window.enterAppFullscreen&&window.enterAppFullscreen():window.exitAppFullscreen&&window.exitAppFullscreen(!0)});window.enterAppFullscreen||(window.enterAppFullscreen=function(){j=!0,document.body.classList.add("flashcard-fullscreen-mode","app-fullscreen-mode"),["flashcard-study-view","radical-study-workspace","radicals-flashcard-view","radical-detail-workspace"].forEach(e=>{const l=document.getElementById(e);l&&l.classList.add("fullscreen-flashcard-active")});const c=document.documentElement;try{!document.fullscreenElement&&!document.webkitFullscreenElement&&(c.requestFullscreen?c.requestFullscreen().catch(()=>{}):c.webkitRequestFullscreen?c.webkitRequestFullscreen():c.msRequestFullscreen&&c.msRequestFullscreen())}catch{}tt(),typeof window.showToast=="function"&&window.showToast("Đã mở toàn màn hình ⛶ (Phím Esc hoặc F để thu nhỏ)")});window.exitAppFullscreen||(window.exitAppFullscreen=function(c=!0){if(j=!1,document.body.classList.remove("flashcard-fullscreen-mode","app-fullscreen-mode"),["flashcard-study-view","radical-study-workspace","radicals-flashcard-view","radical-detail-workspace"].forEach(e=>{const l=document.getElementById(e);l&&l.classList.remove("fullscreen-flashcard-active")}),c&&!!(document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement))try{document.exitFullscreen?document.exitFullscreen().catch(()=>{}):document.webkitExitFullscreen?document.webkitExitFullscreen():document.msExitFullscreen&&document.msExitFullscreen()}catch{}tt()});function tt(){if(typeof updateFlashcardFullscreenButtons=="function"){updateFlashcardFullscreenButtons();return}const c=!!(document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement),e=j||c;document.querySelectorAll(".card-fullscreen-quick-btn, #radical-top-fullscreen-btn, #radical-fullscreen-toggle-btn").forEach(l=>{l.classList.toggle("active-fullscreen",e);const r=l.querySelector("i");r&&(r.className=`fa-solid ${e?"fa-compress":"fa-expand"}`),l.title=e?"Thu nhỏ toàn màn hình (Phím Esc)":"Phóng to toàn màn hình (Phím F)"})}["fullscreenchange","webkitfullscreenchange","mozfullscreenchange","MSFullscreenChange"].forEach(c=>{document.addEventListener(c,()=>{if(!!(document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement))tt();else{const l=window.exitFlashcardFullscreen||window.exitAppFullscreen;l&&l(!1)}})});(function(){if(window._fsDelegationRegistered)return;window._fsDelegationRegistered=!0;let e=0;const l=".card-fullscreen-quick-btn, #radical-top-fullscreen-btn, #radical-fullscreen-toggle-btn";function r(o){if(!o.target.closest(l))return;o.preventDefault(),o.stopPropagation();const h=Date.now();if(h-e<350)return;e=h;const g=window.toggleFlashcardFullscreen||window.toggleAppFullscreen;g&&g()}document.addEventListener("click",r,!0),document.addEventListener("touchend",r,{passive:!1,capture:!0}),document.addEventListener("keydown",o=>{if(document.querySelector(".phidao-wrapper")||document.querySelector(".snake-game-wrapper")||document.querySelector(".tone-rhythm-wrapper")||document.querySelector(".notebook-games-hub-wrapper")||document.querySelector("#game-active-viewport")||document.querySelector('#notebook-games-hub-modal[style*="display: block"]')||document.querySelector('#notebook-games-hub-modal[style*="display: flex"]')||window._activeNotebookGame)return;const h=!!(document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement)||j;if(o.key==="Escape"&&h){o.preventDefault();const g=window.exitFlashcardFullscreen||window.exitAppFullscreen;g&&g(!0)}if((o.key==="f"||o.key==="F")&&!o.ctrlKey&&!o.metaKey){const g=document.activeElement,y=g?g.tagName.toLowerCase():"";if(y!=="input"&&y!=="textarea"&&!g.isContentEditable){o.preventDefault();const S=window.toggleFlashcardFullscreen||window.toggleAppFullscreen;S&&S()}}if((o.key==="t"||o.key==="T")&&!o.ctrlKey&&!o.metaKey){const g=document.activeElement,y=g?g.tagName.toLowerCase():"";y!=="input"&&y!=="textarea"&&!g.isContentEditable&&typeof window.toggleLessonToolbar=="function"&&(o.preventDefault(),window.toggleLessonToolbar())}})})();(function(){const c=window.location.origin.includes("5173")?"http://localhost:5000":window.location.origin;function e(){try{const s=localStorage.getItem("user")||localStorage.getItem("hongtai_current_user")||localStorage.getItem("currentUser")||sessionStorage.getItem("user");if(s)return JSON.parse(s)}catch{}return null}function l(s={}){const h=e(),g={...s};return h&&h.token&&(g.Authorization=`Bearer ${h.token}`),g}function r(){if(window.self!==window.top||document.getElementById("chatbot-widget"))return;const s=document.createElement("div");s.className="chatbot-widget",s.id="chatbot-widget",s.innerHTML=`
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
    `,document.body.appendChild(s),o(s)}function o(s){const h=s.querySelector("#chatbot-toggle-btn"),g=s.querySelector("#chatbot-panel"),y=s.querySelector("#chatbot-close-btn"),S=s.querySelector("#chatbot-send-btn"),m=s.querySelector("#chatbot-input"),k=s.querySelector("#chatbot-messages"),I=s.querySelector("#chatbot-typing"),E=s.querySelector("#chatbot-badge"),L=s.querySelector("#chatbot-new-btn"),T=s.querySelector("#chatbot-history-btn"),N=s.querySelector("#chatbot-side-dock-btn");let d=[],z=sessionStorage.getItem("hongtai_active_thread_id")||null;localStorage.getItem("hongtai_chatbot_dock_side")==="left"&&s.classList.add("dock-left");function a(){const v=g.style.display==="none";if(v&&typeof window.isUserLoggedIn=="function"&&!window.isUserLoggedIn()){typeof window.openLoginPrompt=="function"&&window.openLoginPrompt("sử dụng Trợ lý AI");return}g.style.display=v?"flex":"none",document.body.classList.toggle("chatbot-panel-open",v),v&&(E&&(E.style.display="none"),m&&m.focus(),f())}function b(){g.style.display="none",document.body.classList.remove("chatbot-panel-open")}function H(){const v=s.classList.toggle("dock-left");localStorage.setItem("hongtai_chatbot_dock_side",v?"left":"right")}h.addEventListener("click",v=>{v.stopPropagation(),a()}),y.addEventListener("click",v=>{v.stopPropagation(),b()}),N.addEventListener("click",v=>{v.stopPropagation(),H()}),document.addEventListener("click",v=>{g&&g.style.display!=="none"&&!g.contains(v.target)&&!h.contains(v.target)&&b()}),L&&L.addEventListener("click",v=>{v.stopPropagation(),z=null,sessionStorage.removeItem("hongtai_active_thread_id"),d=[],k.innerHTML=`
          <div class="chat-message bot">
            Chào bạn! Tôi là <strong>Trợ lý AI Hongtai</strong> 🐼. Bạn cần tôi hỗ trợ giải nghĩa từ vựng HSK, sửa phát âm Pinyin hay luyện ngữ pháp tiếng Trung hôm nay không?
          </div>
        `,f()}),T&&T.addEventListener("click",v=>{v.stopPropagation(),window.location.href="/chat-history.html"}),S.addEventListener("click",C),m.addEventListener("keydown",v=>{v.key==="Enter"&&(v.preventDefault(),C())});function M(v){if(!v)return"";let D=v.replace(/^\s*\|?\s*[-:]+[-|\s:]*$/gm,"").replace(/^\s*\|\s*(.*?)\s*\|\s*$/gm,(_,$)=>{const K=$.split(/\s*\|\s*/).map(A=>A.trim()).filter(Boolean);return K.length?"• "+K.join(" — "):""}).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");return D=D.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>"),D=D.replace(/^[-•]\s+(.*)$/gm,'<div class="chat-bullet-line"><span class="chat-bullet-dot">•</span> <span>$1</span></div>'),D=D.replace(/\n{3,}/g,`

`).replace(/\n/g,"<br>"),D}function w(v,F){const D=document.createElement("div");D.className=`chat-message ${v==="assistant"?"bot":"user"}`,v==="assistant"?D.innerHTML=M(F):D.textContent=F,k.appendChild(D)}function f(){k.scrollTop=k.scrollHeight}async function C(){const v=m.value.trim();if(!v)return;if(typeof window.isUserLoggedIn=="function"&&!window.isUserLoggedIn()){typeof window.openLoginPrompt=="function"&&window.openLoginPrompt("trò chuyện với Trợ lý AI");return}m.value="",w("user",v),d.push({role:"user",content:v}),f(),I.style.display="flex",f();const F=e();try{const D={messages:d};z&&(D.threadId=z),F&&F.email&&(D.userEmail=F.email);const _=await fetch(`${c}/api/chat`,{method:"POST",headers:l({"Content-Type":"application/json"}),body:JSON.stringify(D),credentials:"include"});if(I.style.display="none",_.ok){const $=await _.json();w("assistant",$.reply||"Xin lỗi, tôi chưa thể trả lời lúc này."),d.push({role:"assistant",content:$.reply}),$.threadId&&(z=$.threadId,sessionStorage.setItem("hongtai_active_thread_id",z))}else w("assistant","⚠️ Hệ thống đang bảo trì hoặc chưa thể kết nối AI. Vui lòng thử lại sau.")}catch{I.style.display="none",w("assistant","⚠️ Lỗi kết nối mạng đến máy chủ AI.")}f()}}window.self===window.top&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",r):r()),window.mountGlobalChatbot=r})();(function(){if(window.self!==window.top||document.getElementById("quick-dict-widget"))return;let c=null,e=!1,l="",r=null,o=localStorage.getItem("hongtai_quick_dict_dock")||"right",s=null;function h(){try{const u=localStorage.getItem("hongtai_dict_history");return u?JSON.parse(u):[]}catch{return[]}}function g(u){if(u)try{let a=h().filter(b=>b!==u);a.unshift(u),a.length>8&&(a=a.slice(0,8)),localStorage.setItem("hongtai_dict_history",JSON.stringify(a)),L()}catch{}}async function y(){if(c)return c;if(e)return null;e=!0;try{const u=await fetch("/reading_vocab_dict.json");u.ok&&(c=await u.json())}catch(u){console.warn("Quick Dict: failed to load local dictionary, using API lookup",u)}finally{e=!1}return c}function S(u){return u?u.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ü/g,"v").replace(/[^a-z0-9]/g,""):""}function m(u){if(!u||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const a=new SpeechSynthesisUtterance(u);a.lang="zh-CN",a.rate=.85,window.speechSynthesis.speak(a)}const k=document.createElement("style");k.id="quick-dict-widget-styles",k.textContent=`
    /* ==========================================================================
       QUICK DICT FLOATING WIDGET STYLES
       ========================================================================== */
    .quick-dict-widget {
      position: fixed;
      bottom: 92px;
      right: 24px;
      z-index: 100000;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      pointer-events: auto;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .quick-dict-widget.dock-left {
      right: auto !important;
      left: 24px !important;
    }

    @media (max-width: 900px) {
      .quick-dict-widget {
        bottom: 84px !important;
        right: 16px !important;
      }
      .quick-dict-widget.dock-left {
        left: 16px !important;
        right: auto !important;
      }
      .quick-dict-toggle-btn {
        width: 50px !important;
        height: 50px !important;
        font-size: 1.25rem !important;
      }
    }

    /* Floating Bubble Button */
    .quick-dict-toggle-btn {
      width: 54px;
      height: 54px;
      border-radius: 50% !important;
      background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%) !important;
      border: 2px solid rgba(255, 255, 255, 0.85) !important;
      color: #ffffff !important;
      font-size: 1.35rem !important;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(13, 148, 136, 0.45), 0 0 16px rgba(5, 150, 105, 0.35) !important;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.25s ease !important;
      position: relative;
    }

    .quick-dict-toggle-btn:hover {
      transform: scale(1.1) rotate(4deg);
      box-shadow: 0 10px 30px rgba(13, 148, 136, 0.65), 0 0 24px rgba(2, 132, 199, 0.5) !important;
    }

    .quick-dict-toggle-btn:active {
      transform: scale(0.95);
    }

    .quick-dict-tag-pill {
      position: absolute;
      top: -6px;
      right: -6px;
      background: #ef4444;
      color: #ffffff;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 999px;
      border: 1.5px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      letter-spacing: 0.5px;
      pointer-events: none;
    }

    /* Dictionary Panel Modal */
    .quick-dict-panel {
      position: fixed;
      bottom: 84px;
      right: 24px;
      width: 410px;
      max-width: calc(100vw - 32px);
      max-height: min(600px, calc(100vh - 96px));
      max-height: min(600px, calc(100dvh - 96px));
      background: rgba(15, 23, 42, 0.96);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 20px;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.55), 0 0 35px rgba(13, 148, 136, 0.22);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: dictFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 100001;
      color: #f8fafc;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .quick-dict-widget.dock-left .quick-dict-panel {
      right: auto !important;
      left: 24px !important;
    }

    @media (max-width: 600px) {
      .quick-dict-panel {
        right: 12px !important;
        left: 12px !important;
        width: calc(100vw - 24px) !important;
        max-width: calc(100vw - 24px) !important;
        bottom: 74px !important;
        max-height: calc(100dvh - 84px) !important;
        border-radius: 16px !important;
      }
      .quick-dict-widget.dock-left .quick-dict-panel {
        left: 12px !important;
        right: 12px !important;
      }
    }

    @media (max-height: 700px) {
      .quick-dict-panel {
        bottom: 70px !important;
        max-height: calc(100vh - 80px) !important;
      }
    }

    @keyframes dictFadeIn {
      from {
        opacity: 0;
        transform: translateY(16px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Panel Header */
    .quick-dict-header {
      padding: 12px 16px;
      background: linear-gradient(135deg, rgba(13, 148, 136, 0.35) 0%, rgba(2, 132, 199, 0.25) 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      user-select: none;
      cursor: grab;
    }

    .quick-dict-header:active {
      cursor: grabbing;
    }

    .quick-dict-title-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .quick-dict-avatar {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: linear-gradient(135deg, #059669, #0284c7);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 1rem;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
    }

    .quick-dict-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      line-height: 1.2;
    }

    .quick-dict-sub {
      font-size: 0.72rem;
      color: #6ee7b7;
      font-weight: 500;
    }

    .quick-dict-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .quick-dict-action-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s ease;
    }

    .quick-dict-action-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      transform: translateY(-1px);
    }

    /* Search Box */
    .quick-dict-search-wrap {
      padding: 12px 16px;
      background: rgba(0, 0, 0, 0.25);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      flex-shrink: 0;
    }

    .quick-dict-input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .quick-dict-search-icon {
      position: absolute;
      left: 12px;
      color: #94a3b8;
      font-size: 0.9rem;
      pointer-events: none;
    }

    .quick-dict-input {
      width: 100%;
      background: rgba(30, 41, 59, 0.85);
      border: 1.5px solid rgba(13, 148, 136, 0.4);
      border-radius: 12px;
      padding: 9px 36px 9px 34px;
      color: #ffffff;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .quick-dict-input:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
      background: rgba(15, 23, 42, 0.95);
    }

    .quick-dict-clear-btn {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.85rem;
      padding: 4px;
      display: none;
    }

    .quick-dict-clear-btn:hover {
      color: #ffffff;
    }

    /* History & Suggestion Pills */
    .quick-dict-pills-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      overflow-x: auto;
      scrollbar-width: none;
      padding-bottom: 2px;
    }

    .quick-dict-pills-bar::-webkit-scrollbar {
      display: none;
    }

    .quick-dict-pill {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      font-size: 0.76rem;
      padding: 3px 9px;
      border-radius: 999px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
      font-family: 'LXGW WenKai Lite', 'Kaiti', 'KaiTi', serif;
    }

    .quick-dict-pill:hover {
      background: rgba(16, 185, 129, 0.25);
      border-color: #10b981;
      color: #ffffff;
    }

    /* Body / Content Area */
    .quick-dict-body {
      padding: 14px 16px;
      overflow-y: auto;
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overscroll-behavior: contain;
    }

    /* Default Empty State */
    .quick-dict-empty {
      text-align: center;
      padding: 28px 12px;
      color: #94a3b8;
    }

    .quick-dict-empty-icon {
      font-size: 2.2rem;
      color: #0d9488;
      margin-bottom: 10px;
      opacity: 0.8;
    }

    .quick-dict-empty-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: #e2e8f0;
      margin-bottom: 6px;
    }

    .quick-dict-empty-hint {
      font-size: 0.8rem;
      line-height: 1.5;
    }

    /* Word Card Result */
    .quick-dict-card {
      background: rgba(30, 41, 59, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .quick-dict-word-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 12px;
    }

    .quick-dict-hanzi {
      font-family: 'LXGW WenKai Lite', 'Kaiti', 'KaiTi', 'STKaiti', serif;
      font-size: 2.3rem;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.1;
      letter-spacing: 1px;
    }

    .quick-dict-badges-wrap {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 5px;
    }

    .quick-dict-hsk-badge {
      background: linear-gradient(135deg, #059669, #10b981);
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }

    .quick-dict-pos-badge {
      background: rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .quick-dict-pinyin-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .quick-dict-pinyin {
      font-size: 1.15rem;
      color: #38bdf8;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .quick-dict-speak-btn {
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38bdf8;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .quick-dict-speak-btn:hover {
      background: #38bdf8;
      color: #0f172a;
      transform: scale(1.1);
    }

    .quick-dict-meaning-box {
      background: rgba(15, 23, 42, 0.7);
      border-left: 3.5px solid #10b981;
      padding: 10px 12px;
      border-radius: 0 10px 10px 0;
    }

    .quick-dict-meaning-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      color: #10b981;
      font-weight: 700;
      margin-bottom: 3px;
      letter-spacing: 0.5px;
    }

    .quick-dict-meaning-text {
      font-size: 1.02rem;
      color: #f1f5f9;
      font-weight: 500;
      line-height: 1.5;
    }

    /* Example Box */
    .quick-dict-example-box {
      background: rgba(2, 132, 199, 0.1);
      border: 1px dashed rgba(56, 189, 248, 0.3);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .quick-dict-ex-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .quick-dict-ex-label {
      font-size: 0.72rem;
      color: #38bdf8;
      font-weight: 700;
      text-transform: uppercase;
    }

    .quick-dict-ex-zh {
      font-family: 'LXGW WenKai Lite', 'Kaiti', 'KaiTi', serif;
      font-size: 1.05rem;
      color: #ffffff;
      line-height: 1.4;
    }

    .quick-dict-ex-py {
      font-size: 0.85rem;
      color: #94a3b8;
    }

    .quick-dict-ex-vi {
      font-size: 0.88rem;
      color: #cbd5e1;
      font-style: italic;
    }

    .quick-dict-card-actions {
      display: flex;
      gap: 8px;
      margin-top: 4px;
      flex-wrap: wrap;
    }

    .quick-dict-link-btn {
      flex: 1 1 calc(50% - 6px);
      min-width: 120px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 10px;
      padding: 8px 10px;
      color: #cbd5e1;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      text-decoration: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .quick-dict-link-btn:hover {
      background: rgba(16, 185, 129, 0.2);
      border-color: #10b981;
      color: #ffffff;
      transform: translateY(-1px);
    }

    .quick-dict-btn-highlight {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(2, 132, 199, 0.25) 100%) !important;
      border: 1.5px solid #10b981 !important;
      color: #34d399 !important;
      font-weight: 700 !important;
    }

    .quick-dict-btn-highlight:hover {
      background: linear-gradient(135deg, #059669 0%, #0284c7 100%) !important;
      color: #ffffff !important;
    }

    /* Floating highlight mini tooltip */
    .quick-dict-selection-tooltip {
      position: absolute;
      background: #0f172a;
      border: 1px solid #10b981;
      color: #ffffff;
      padding: 5px 12px;
      border-radius: 99px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(0,0,0,0.4), 0 0 12px rgba(16, 185, 129, 0.35);
      z-index: 100002;
      display: flex;
      align-items: center;
      gap: 6px;
      animation: dictFadeIn 0.18s ease;
      transition: transform 0.15s ease, background 0.15s ease;
      white-space: nowrap;
      user-select: none;
    }

    .quick-dict-selection-tooltip:hover {
      transform: scale(1.05);
      background: #047857;
      color: #ffffff;
    }

    /* Light Mode Overrides for Tooltip */
    html.light-mode .quick-dict-selection-tooltip,
    body.light-mode .quick-dict-selection-tooltip {
      background: #ffffff !important;
      border: 1.5px solid #10b981 !important;
      color: #065f46 !important;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12), 0 0 10px rgba(16, 185, 129, 0.25) !important;
    }

    html.light-mode .quick-dict-selection-tooltip:hover,
    body.light-mode .quick-dict-selection-tooltip:hover {
      background: #ecfdf5 !important;
      color: #047857 !important;
      border-color: #059669 !important;
    }

    /* Light Mode Overrides */
    html.light-mode .quick-dict-panel,
    body.light-mode .quick-dict-panel {
      background: #ffffff !important;
      border-color: rgba(0, 0, 0, 0.12) !important;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15), 0 0 35px rgba(13, 148, 136, 0.15) !important;
      color: #0f172a !important;
    }

    html.light-mode .quick-dict-header,
    body.light-mode .quick-dict-header {
      background: linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(2, 132, 199, 0.1) 100%) !important;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
    }

    html.light-mode .quick-dict-name,
    body.light-mode .quick-dict-name {
      color: #0f172a !important;
    }

    html.light-mode .quick-dict-sub,
    body.light-mode .quick-dict-sub {
      color: #059669 !important;
      font-weight: 600 !important;
    }

    html.light-mode .quick-dict-action-btn,
    body.light-mode .quick-dict-action-btn {
      background: #f1f5f9 !important;
      border: 1px solid #cbd5e1 !important;
      color: #334155 !important;
    }

    html.light-mode .quick-dict-action-btn:hover,
    body.light-mode .quick-dict-action-btn:hover {
      background: #e2e8f0 !important;
      color: #0f172a !important;
    }

    html.light-mode .quick-dict-search-wrap,
    body.light-mode .quick-dict-search-wrap {
      background: #f8fafc !important;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
    }

    html.light-mode .quick-dict-input,
    body.light-mode .quick-dict-input {
      background: #ffffff !important;
      color: #0f172a !important;
      border: 1.5px solid #cbd5e1 !important;
    }

    html.light-mode .quick-dict-input:focus,
    body.light-mode .quick-dict-input:focus {
      border-color: #10b981 !important;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
      background: #ffffff !important;
    }

    html.light-mode .quick-dict-pill,
    body.light-mode .quick-dict-pill {
      background: #f1f5f9 !important;
      border: 1px solid #cbd5e1 !important;
      color: #1e293b !important;
    }

    html.light-mode .quick-dict-pill:hover,
    body.light-mode .quick-dict-pill:hover {
      background: #d1fae5 !important;
      border-color: #10b981 !important;
      color: #065f46 !important;
    }

    html.light-mode .quick-dict-card,
    body.light-mode .quick-dict-card {
      background: #f8fafc !important;
      border: 1px solid rgba(0, 0, 0, 0.08) !important;
    }

    html.light-mode .quick-dict-hanzi,
    body.light-mode .quick-dict-hanzi {
      color: #0f172a !important;
    }

    html.light-mode .quick-dict-pinyin,
    body.light-mode .quick-dict-pinyin {
      color: #0284c7 !important;
      font-weight: 700 !important;
    }

    html.light-mode .quick-dict-pos-badge,
    body.light-mode .quick-dict-pos-badge {
      background: #e2e8f0 !important;
      color: #334155 !important;
      border: 1px solid #cbd5e1 !important;
      font-weight: 700 !important;
    }

    html.light-mode .quick-dict-meaning-box,
    body.light-mode .quick-dict-meaning-box {
      background: #ffffff !important;
      border: 1px solid rgba(0, 0, 0, 0.06) !important;
      border-left: 3.5px solid #10b981 !important;
    }

    html.light-mode .quick-dict-meaning-label,
    body.light-mode .quick-dict-meaning-label {
      color: #059669 !important;
      font-weight: 800 !important;
    }

    html.light-mode .quick-dict-meaning-text,
    body.light-mode .quick-dict-meaning-text {
      color: #1e293b !important;
    }

    html.light-mode .quick-dict-example-box,
    body.light-mode .quick-dict-example-box {
      background: #f0fdf4 !important;
      border: 1px dashed #86efac !important;
    }

    html.light-mode .quick-dict-ex-label,
    body.light-mode .quick-dict-ex-label {
      color: #0284c7 !important;
      font-weight: 800 !important;
    }

    html.light-mode .quick-dict-ex-zh,
    body.light-mode .quick-dict-ex-zh {
      color: #0f172a !important;
      font-weight: 600 !important;
    }

    html.light-mode .quick-dict-ex-py,
    body.light-mode .quick-dict-ex-py {
      color: #64748b !important;
    }

    html.light-mode .quick-dict-ex-vi,
    body.light-mode .quick-dict-ex-vi {
      color: #334155 !important;
      font-weight: 500 !important;
      font-style: italic !important;
    }

    html.light-mode .quick-dict-link-btn,
    body.light-mode .quick-dict-link-btn {
      background: #ffffff !important;
      border: 1.5px solid #cbd5e1 !important;
      color: #1e293b !important;
      font-weight: 600 !important;
    }

    html.light-mode .quick-dict-link-btn:hover,
    body.light-mode .quick-dict-link-btn:hover {
      background: #ecfdf5 !important;
      border-color: #10b981 !important;
      color: #047857 !important;
    }

    html.light-mode .quick-dict-btn-highlight,
    body.light-mode .quick-dict-btn-highlight {
      background: #ecfdf5 !important;
      border: 1.5px solid #059669 !important;
      color: #047857 !important;
      font-weight: 700 !important;
    }

    html.light-mode .quick-dict-btn-highlight:hover,
    body.light-mode .quick-dict-btn-highlight:hover {
      background: #059669 !important;
      border-color: #059669 !important;
      color: #ffffff !important;
    }

    html.light-mode .quick-dict-empty-title,
    body.light-mode .quick-dict-empty-title {
      color: #1e293b !important;
    }

    html.light-mode .quick-dict-empty-hint,
    body.light-mode .quick-dict-empty-hint {
      color: #64748b !important;
    }
  `,document.head.appendChild(k);function I(){const u=document.createElement("div");u.className=`quick-dict-widget ${o==="left"?"dock-left":""}`,u.id="quick-dict-widget",u.innerHTML=`
      <!-- Floating Bubble Button -->
      <button class="quick-dict-toggle-btn" id="quick-dict-toggle-btn" title="Tra nhanh từ điển (Alt + D)">
        <i class="fa-solid fa-book-bookmark"></i>
        <span class="quick-dict-tag-pill" id="quick-dict-tag-pill" style="display: none;">TRA</span>
      </button>

      <!-- Panel Modal -->
      <div class="quick-dict-panel" id="quick-dict-panel" style="display: none;">
        <!-- Header -->
        <div class="quick-dict-header">
          <div class="quick-dict-title-wrap">
            <div class="quick-dict-avatar">
              <i class="fa-solid fa-language"></i>
            </div>
            <div>
              <h4 class="quick-dict-name">Từ Điển Tra Nhanh</h4>
              <span class="quick-dict-sub">Hongtai Smart Dictionary</span>
            </div>
          </div>
          <div class="quick-dict-actions">
            <button class="quick-dict-action-btn" id="quick-dict-dock-btn" title="Chuyển sang bên Trái/Phải">
              <i class="fa-solid fa-arrow-right-arrow-left"></i>
            </button>
            <button class="quick-dict-action-btn" id="quick-dict-close-btn" title="Đóng từ điển (Esc)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <!-- Search Input -->
        <div class="quick-dict-search-wrap">
          <div class="quick-dict-input-container">
            <i class="fa-solid fa-magnifying-glass quick-dict-search-icon"></i>
            <input type="text" class="quick-dict-input" id="quick-dict-input" placeholder="Nhập chữ Hán, Pinyin hoặc tiếng Việt..." autocomplete="off">
            <button class="quick-dict-clear-btn" id="quick-dict-clear-btn" title="Xóa tìm kiếm">
              <i class="fa-solid fa-circle-xmark"></i>
            </button>
          </div>
          <div class="quick-dict-pills-bar" id="quick-dict-pills-bar">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- Result / Body Area -->
        <div class="quick-dict-body" id="quick-dict-body">
          <div class="quick-dict-empty" id="quick-dict-empty-view">
            <div class="quick-dict-empty-icon">
              <i class="fa-solid fa-book-open-reader"></i>
            </div>
            <div class="quick-dict-empty-title">Tra cứu tức thì bất kỳ từ nào</div>
            <div class="quick-dict-empty-hint">
              Nhập từ cần tra ở trên hoặc bôi đen chữ Hán bất kỳ trên trang web để tra nghĩa nhanh, phát âm chuẩn và xem câu ví dụ.
            </div>
          </div>
          <div id="quick-dict-result-view" style="display: none;"></div>
        </div>
      </div>
    `,document.body.appendChild(u);const a=document.getElementById("quick-dict-toggle-btn"),b=document.getElementById("quick-dict-panel"),H=document.getElementById("quick-dict-close-btn"),M=document.getElementById("quick-dict-dock-btn"),w=document.getElementById("quick-dict-input"),f=document.getElementById("quick-dict-clear-btn");function C(A){const W=b.style.display!=="none",O=typeof A=="boolean"?A:!W;if(O&&typeof window.isUserLoggedIn=="function"&&!window.isUserLoggedIn()){typeof window.openLoginPrompt=="function"&&window.openLoginPrompt("tra từ điển nhanh");return}document.body.classList.toggle("quick-dict-panel-open",O),O?(b.style.display="flex",b.style.top="",b.style.bottom="",b.style.left="",b.style.right="",y(),L(),requestAnimationFrame(()=>{b.getBoundingClientRect().top<12&&(b.style.top="12px",b.style.bottom="auto")}),setTimeout(()=>{w.focus(),w.value&&w.select()},80)):b.style.display="none"}s=C,window.closeQuickDict=()=>C(!1),a.addEventListener("click",()=>C()),H.addEventListener("click",()=>C(!1));let v=!1,F=0,D=0,_=0,$=0;const K=b.querySelector(".quick-dict-header");K&&(K.addEventListener("mousedown",A=>{if(A.target.closest("button"))return;v=!0;const W=b.getBoundingClientRect();F=A.clientX,D=A.clientY,_=W.left,$=W.top,b.style.position="fixed",b.style.bottom="auto",b.style.right="auto",b.style.left=`${_}px`,b.style.top=`${$}px`,A.preventDefault()}),window.addEventListener("mousemove",A=>{if(!v)return;const W=A.clientX-F,O=A.clientY-D,X=Math.max(10,Math.min(window.innerWidth-b.offsetWidth-10,_+W)),Y=Math.max(10,Math.min(window.innerHeight-b.offsetHeight-10,$+O));b.style.left=`${X}px`,b.style.top=`${Y}px`}),window.addEventListener("mouseup",()=>{v=!1})),document.addEventListener("mousedown",A=>{b.style.display!=="none"&&!v&&!u.contains(A.target)&&!A.target.closest(".quick-dict-selection-tooltip")&&C(!1)}),f.addEventListener("click",A=>{A.stopPropagation(),w.value="",f.style.display="none",E(),w.focus()}),w.addEventListener("focus",()=>{w.select()}),w.addEventListener("click",()=>{w.value&&w.select()}),M.addEventListener("click",()=>{o=o==="right"?"left":"right",localStorage.setItem("hongtai_quick_dict_dock",o),u.classList.toggle("dock-left",o==="left"),b.style.top="",b.style.bottom="",b.style.left="",b.style.right=""}),w.addEventListener("input",()=>{const A=w.value.trim();if(f.style.display=A?"block":"none",clearTimeout(r),!A){E();return}r=setTimeout(()=>{T(A)},200)}),w.addEventListener("keydown",A=>{if(A.key==="Enter"){const W=w.value.trim();W&&T(W)}else A.key==="Escape"&&C(!1)}),window.addEventListener("keydown",A=>{A.altKey&&(A.key==="d"||A.key==="D")?(A.preventDefault(),C()):A.key==="Escape"&&b.style.display!=="none"&&C(!1)}),window.openQuickDict=function(A){C(!0),A&&typeof A=="string"&&(w.value=A,f.style.display="block",T(A))}}function E(){const u=document.getElementById("quick-dict-empty-view"),a=document.getElementById("quick-dict-result-view");u&&(u.style.display="block"),a&&(a.style.display="none",a.innerHTML="")}function L(){const u=document.getElementById("quick-dict-pills-bar");if(!u)return;const a=h(),b=["家","学习","朋友","天气","工作","喜欢"],H=a.length>0?a:b;u.innerHTML=H.map(M=>`<button class="quick-dict-pill" data-word="${M}">${M}</button>`).join(""),u.querySelectorAll(".quick-dict-pill").forEach(M=>{M.addEventListener("click",()=>{const w=M.dataset.word,f=document.getElementById("quick-dict-input"),C=document.getElementById("quick-dict-clear-btn");f&&(f.value=w,C&&(C.style.display="block"),T(w))})})}async function T(u){if(!u)return;const a=u.trim();l=a;const b=document.getElementById("quick-dict-result-view"),H=document.getElementById("quick-dict-empty-view");H&&(H.style.display="none"),b&&(b.style.display="block",b.innerHTML=`
        <div style="text-align: center; padding: 24px; color: #94a3b8;">
          <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 1.5rem; color: #10b981; margin-bottom: 8px;"></i>
          <div>Đang tra cứu từ "${a}"...</div>
        </div>
      `);let M=c;M||(M=await y());let w=null;if(M)if(M[a])w=M[a];else{const f=a.replace(/[.,!?:;="\'"()[\]{}，。！？；：\s\-_~`]/g,"");if(M[f])w=M[f];else{const C=S(a);C&&(w=Object.values(M).find(v=>S(v.pinyin)===C)),!w&&f.length>=2&&(w=Object.values(M).find(v=>v.word&&v.word.startsWith(f)))}}if(w){N({word:w.word,pinyin:w.pinyin,meaning:w.meaning,level:w.level||"HSK",pos:w.pos||"Từ vựng",example_zh:w.example_zh||"",example_py:w.example_py||"",example_vi:w.example_vi||"",note:w.note||""}),g(w.word);return}try{const f=await fetch("/api/dict/lookup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({word:a})});if(f.ok){const C=await f.json();if(C&&C.success&&l===a){N({word:C.word||a,pinyin:C.pinyin||"",meaning:C.meaning||"Nghĩa từ vựng",level:C.hskLevel||"Tra cứu",pos:/[\u4e00-\u9fa5]/.test(a)?a.length===1?"Chữ Hán":"Từ vựng":"Từ khóa",example_zh:"",example_py:"",example_vi:""}),g(C.word||a);return}}}catch{}l===a&&b&&(b.innerHTML=`
        <div style="text-align: center; padding: 24px 12px; color: #94a3b8;">
          <div style="font-size: 2rem; color: #f59e0b; margin-bottom: 8px;">🤔</div>
          <div style="font-size: 1rem; font-weight: 700; color: #f1f5f9; margin-bottom: 4px;">Chưa tìm thấy từ "${a}"</div>
          <div style="font-size: 0.82rem; line-height: 1.5;">Vui lòng kiểm tra lại chính tả hoặc thử tra bằng Pinyin hoặc tiếng Việt.</div>
        </div>
      `)}function N(u){const a=document.getElementById("quick-dict-result-view");if(!a)return;u.word&&u.word.length===1&&/[\u4e00-\u9fa5]/.test(u.word),a.innerHTML=`
      <div class="quick-dict-card">
        <!-- Head -->
        <div class="quick-dict-word-head">
          <div>
            <div class="quick-dict-hanzi" id="quick-dict-card-hanzi">${u.word}</div>
            <div class="quick-dict-pinyin-row" style="margin-top: 6px;">
              <span class="quick-dict-pinyin">${u.pinyin?`[${u.pinyin}]`:""}</span>
              <button class="quick-dict-speak-btn" id="quick-dict-card-speak-btn" title="Nghe phát âm">
                <i class="fa-solid fa-volume-high"></i>
              </button>
            </div>
          </div>
          <div class="quick-dict-badges-wrap">
            <span class="quick-dict-hsk-badge">${u.level}</span>
            <span class="quick-dict-pos-badge">${u.pos}</span>
          </div>
        </div>

        <!-- Meaning -->
        <div class="quick-dict-meaning-box">
          <div class="quick-dict-meaning-label">Nghĩa tiếng Việt:</div>
          <div class="quick-dict-meaning-text">${u.meaning}</div>
        </div>

        <!-- Example Sentence if available -->
        ${u.example_zh?`
          <div class="quick-dict-example-box">
            <div class="quick-dict-ex-head">
              <span class="quick-dict-ex-label">Ví dụ minh họa</span>
              <button class="quick-dict-action-btn" id="quick-dict-ex-speak-btn" title="Nghe câu ví dụ" style="width: 24px; height: 24px;">
                <i class="fa-solid fa-volume-high" style="font-size: 0.72rem;"></i>
              </button>
            </div>
            <div class="quick-dict-ex-zh">${u.example_zh}</div>
            ${u.example_py?`<div class="quick-dict-ex-py">${u.example_py}</div>`:""}
            <div class="quick-dict-ex-vi">${u.example_vi}</div>
          </div>
        `:""}

        <!-- Bottom Actions -->
        <div class="quick-dict-card-actions">
          <button class="quick-dict-link-btn quick-dict-btn-highlight" id="quick-dict-new-search-btn" title="Tra từ vựng khác">
            <i class="fa-solid fa-magnifying-glass"></i> Tra từ khác
          </button>
          <button class="quick-dict-link-btn" id="quick-dict-copy-btn" title="Sao chép chữ này">
            <i class="fa-regular fa-copy"></i> Sao chép từ
          </button>
          <a class="quick-dict-link-btn" href="/hanzi-writer.html?word=${encodeURIComponent(u.word)}" target="_blank" title="Tập viết chữ này">
            <i class="fa-solid fa-pen-nib"></i> Tập viết chữ Hán
          </a>
          <button class="quick-dict-link-btn" id="quick-dict-card-close-btn" title="Đóng từ điển">
            <i class="fa-solid fa-xmark"></i> Đóng
          </button>
        </div>
      </div>
    `,requestAnimationFrame(()=>{const C=document.getElementById("quick-dict-panel");C&&C.getBoundingClientRect().top<12&&(C.style.top="12px",C.style.bottom="auto")});const b=document.getElementById("quick-dict-new-search-btn");b&&b.addEventListener("click",()=>{const C=document.getElementById("quick-dict-input"),v=document.getElementById("quick-dict-clear-btn");C&&(C.value="",v&&(v.style.display="none"),E(),C.focus())});const H=document.getElementById("quick-dict-card-close-btn");H&&H.addEventListener("click",()=>{typeof s=="function"&&s(!1)});const M=document.getElementById("quick-dict-card-speak-btn");M&&M.addEventListener("click",()=>m(u.word));const w=document.getElementById("quick-dict-ex-speak-btn");w&&u.example_zh&&w.addEventListener("click",()=>m(u.example_zh));const f=document.getElementById("quick-dict-copy-btn");f&&f.addEventListener("click",()=>{navigator.clipboard.writeText(u.word).then(()=>{f.innerHTML='<i class="fa-solid fa-check"></i> Đã sao chép!',setTimeout(()=>{f.innerHTML='<i class="fa-regular fa-copy"></i> Sao chép từ'},1500)})})}let d=null;function z(){d&&(d.remove(),d=null)}document.addEventListener("mouseup",u=>{u.target.closest("#quick-dict-widget")||setTimeout(()=>{const a=window.getSelection(),b=a?a.toString().trim():"";if(z(),b&&/[\u4e00-\u9fa5]/.test(b)&&b.length<=15){const M=a.getRangeAt(0).getBoundingClientRect(),w=document.createElement("div");w.className="quick-dict-selection-tooltip",w.innerHTML=`<i class="fa-solid fa-book-bookmark"></i> Tra "${b.length>5?b.slice(0,5)+"...":b}"`,w.style.left=`${Math.max(10,M.left+window.scrollX+M.width/2-45)}px`,w.style.top=`${Math.max(10,M.top+window.scrollY-38)}px`,w.addEventListener("mousedown",f=>{if(f.preventDefault(),f.stopPropagation(),z(),typeof window.isUserLoggedIn=="function"&&!window.isUserLoggedIn()){typeof window.openLoginPrompt=="function"&&window.openLoginPrompt("tra từ điển nhanh");return}window.openQuickDict(b)}),document.body.appendChild(w),d=w}},100)}),document.addEventListener("mousedown",u=>{d&&!d.contains(u.target)&&z()}),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",I):I()})();(function(){const c=window.self!==window.top;function e(){const t=window.location.pathname.toLowerCase(),i=window.location.search.toLowerCase();return t==="/"||t.endsWith("/index.html")?i.includes("tab=flashcards")?"flashcards":i.includes("view=roadmap")||window.location.hash.includes("roadmap")?"roadmap":"home":t.includes("video-dictation")?i.includes("mode=shadowing")?"shadowing":"dictation":t.includes("translation-practice")||t.includes("paragraph-practice")?"translation":t.includes("writing-practice")?"writing":t.includes("speaking-practice")?"speaking":t.includes("sentence-reorder")?"sentence-reorder":t.includes("ai-dialogue")?"ai-dialogue":t.includes("reading-practice")?"reading":t.includes("chinese-phonetics")?"phonetics":t.includes("chinese-radicals")?"radicals":t.includes("hanzi-writer")?"hanzi":t.includes("hsk-grammar")?"grammar":t.includes("lesson-texts")?"texts":t.includes("vocab-practice")?"vocab-practice":t.includes("detail-list")?"vocabulary":t.includes("quiz-game")?"games":t.includes("han-viet-rules")?"rules":t.includes("rank")?"rank":t.includes("documents")?"documents":""}window.toggleSidebarDropdown=function(t){if(!t)return;const i=t.closest(".sidebar-group");i&&i.classList.toggle("open")};const l="316017385374-7nnvn1q2mcej8n9r2ii7ofrmbu6mdhra.apps.googleusercontent.com";function r(){return window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"||window.location.hostname===""?"http://localhost:5000":window.location.hostname.includes("tieng-trung-hong-tai-1.onrender.com")?"https://tiengtrunghongtai.online":window.location.origin||"https://tiengtrunghongtai.online"}const o=r();function s(t){if(!t)return!1;const i=t.toLowerCase().trim();return i.includes("phanphiphu")||i.includes("thaihong162004")||i.includes("toiyeutinhoc")||i==="super_admin"}function h(t){if(!t)return!1;const i=t.toLowerCase().trim();return s(i)||i.includes("hongtai")||i.includes("admin")||i.includes("teacher")}function g(){try{const t=localStorage.getItem("user")||localStorage.getItem("hongtai_current_user")||localStorage.getItem("currentUser")||sessionStorage.getItem("user");if(t)return JSON.parse(t)}catch{}return null}window.getCurrentUser=g,window.isUserVip=d;function y(){try{const t=localStorage.getItem("user")||localStorage.getItem("hongtai_current_user")||localStorage.getItem("currentUser")||sessionStorage.getItem("user");if(!t)return!1;const i=JSON.parse(t);if(!i)return!1;const n=(i.email||"").toLowerCase().trim();return!!(n&&n!=="guest"&&!n.startsWith("guest")&&n.includes("@"))}catch{return!1}}window.isUserLoggedIn=y;function S(){if(typeof google<"u"&&google.accounts&&google.accounts.id||document.querySelector('script[src*="accounts.google.com/gsi/client"]'))return;const t=document.createElement("script");t.src="https://accounts.google.com/gsi/client",t.async=!0,t.defer=!0,document.head.appendChild(t)}S();function m(){if(document.getElementById("global-auth-guard-styles"))return;const t=document.createElement("style");t.id="global-auth-guard-styles",t.textContent=`
      @keyframes globalAuthFadeIn {
        from { opacity: 0; backdrop-filter: blur(0px); }
        to { opacity: 1; backdrop-filter: blur(20px); }
      }
      @keyframes globalAuthCardPop {
        from { opacity: 0; transform: scale(0.92) translateY(18px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .global-auth-modal-overlay {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 9999999 !important;
        background: rgba(8, 13, 25, 0.88) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 16px !important;
        box-sizing: border-box !important;
        animation: globalAuthFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .global-auth-card {
        position: relative !important;
        width: 100% !important;
        max-width: 480px !important;
        background: linear-gradient(150deg, #0f172a 0%, #1e293b 100%) !important;
        border: 1.5px solid rgba(56, 189, 248, 0.38) !important;
        border-radius: 28px !important;
        padding: 32px 28px !important;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 45px rgba(56, 189, 248, 0.15) !important;
        color: #ffffff !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
        gap: 18px !important;
        box-sizing: border-box !important;
        animation: globalAuthCardPop 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .global-auth-close-btn {
        position: absolute !important;
        top: 18px !important;
        right: 18px !important;
        background: rgba(255, 255, 255, 0.08) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        color: #cbd5e1 !important;
        font-size: 1.25rem !important;
        line-height: 1 !important;
        cursor: pointer !important;
        width: 36px !important;
        height: 36px !important;
        border-radius: 50% !important;
        display: flex;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.2s ease !important;
      }
      .global-auth-close-btn:hover {
        background: rgba(239, 68, 68, 0.2) !important;
        color: #f87171 !important;
        border-color: rgba(239, 68, 68, 0.4) !important;
        transform: rotate(90deg);
      }
      .global-auth-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 14px;
        border-radius: 999px;
        background: rgba(56, 189, 248, 0.12);
        border: 1px solid rgba(56, 189, 248, 0.32);
        color: #38bdf8;
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .global-auth-icon-circle {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(139, 92, 246, 0.3));
        border: 2px solid rgba(56, 189, 248, 0.45);
        color: #38bdf8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.1rem;
        box-shadow: 0 10px 30px rgba(56, 189, 248, 0.3);
      }
      .global-auth-title {
        font-size: 1.45rem !important;
        font-weight: 800 !important;
        color: #ffffff !important;
        margin: 0 !important;
        letter-spacing: -0.01em;
      }
      .global-auth-desc {
        font-size: 0.92rem !important;
        color: #94a3b8 !important;
        margin: 0 !important;
        line-height: 1.55 !important;
      }
      .global-auth-features-box {
        width: 100%;
        background: rgba(255, 255, 255, 0.035);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        padding: 14px 18px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        text-align: left;
        box-sizing: border-box;
      }
      .global-auth-feature-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.88rem;
        color: #e2e8f0;
        font-weight: 500;
      }
      .global-auth-feature-item i {
        color: #34d399;
        font-size: 1.05rem;
        flex-shrink: 0;
      }
      .global-auth-action-box {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        margin-top: 4px;
      }
      .global-google-btn-slot {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        min-height: 48px;
      }
      .global-auth-home-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #94a3b8;
        text-decoration: none;
        font-size: 0.88rem;
        font-weight: 600;
        padding: 8px 18px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.2s ease;
      }
      .global-auth-home-btn:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }
      .global-auth-toast-pill {
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000000;
        padding: 12px 22px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(56, 189, 248, 0.4);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.2);
        color: #ffffff;
        font-size: 0.92rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
        pointer-events: none;
        animation: globalAuthFadeIn 0.25s ease forwards;
      }

      /* Universal User Profile Dropdown Styling */
      .user-dropdown {
        position: relative !important;
      }
      .profile-dropdown-menu {
        position: absolute !important;
        top: calc(100% + 6px) !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        background: #1e293b !important;
        background-color: rgba(30, 41, 59, 0.98) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        border: 1px solid rgba(255, 255, 255, 0.18) !important;
        border-radius: 12px !important;
        box-shadow: 0 14px 35px rgba(0, 0, 0, 0.6) !important;
        padding: 8px 6px !important;
        list-style: none !important;
        margin: 0 !important;
        box-sizing: border-box !important;
        opacity: 0;
        visibility: hidden;
        transform: translateY(8px);
        pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
        z-index: 99999 !important;
      }
      .user-dropdown.show-menu .profile-dropdown-menu {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateY(0) !important;
        pointer-events: auto !important;
      }
      .user-dropdown.show-menu .profile-chevron {
        transform: rotate(180deg) !important;
      }
      .sidebar-profile-card {
        cursor: pointer !important;
        user-select: none !important;
      }
      .sidebar-profile-card * {
        pointer-events: auto !important;
      }
    `,document.head.appendChild(t)}function k(){m();let t=document.getElementById("global-auth-required-modal");return t||(t=document.createElement("div"),t.className="modal-overlay global-auth-modal-overlay",t.id="global-auth-required-modal",t.style.display="none",t.innerHTML=`
      <div class="modal-card global-auth-card">
        <button class="global-auth-close-btn" id="global-auth-close-btn" title="Đóng" onclick="window.hideGlobalAuthModal && window.hideGlobalAuthModal()">&times;</button>
        <div class="global-auth-badge-wrap">
          <span class="global-auth-badge"><i class="fa-solid fa-shield-halved"></i> Yêu Cầu Đăng Nhập</span>
        </div>
        <div class="global-auth-icon-circle">
          <i class="fa-solid fa-user-lock"></i>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h3 class="global-auth-title" id="global-auth-title">Đăng Nhập Để Trải Nghiệm</h3>
          <p class="global-auth-desc" id="global-auth-desc">
            Vui lòng đăng nhập với tài khoản Google để sử dụng tính năng, theo dõi tiến độ và lưu kết quả học tập của bạn.
          </p>
        </div>
        <div class="global-auth-features-box">
          <div class="global-auth-feature-item">
            <i class="fa-solid fa-circle-check"></i>
            <span>Mở khóa toàn bộ bài học &amp; tính năng luyện tập</span>
          </div>
          <div class="global-auth-feature-item">
            <i class="fa-solid fa-circle-check"></i>
            <span>Chấm điểm phát âm AI, luyện viết &amp; thi thử HSK</span>
          </div>
          <div class="global-auth-feature-item">
            <i class="fa-solid fa-circle-check"></i>
            <span>Tự động lưu từ vựng sổ tay, streak điểm danh hàng ngày</span>
          </div>
        </div>
        <div class="global-auth-action-box">
          <div id="global-google-signin-btn-container" class="global-google-btn-slot">
            <div style="color: #94a3b8; font-size: 0.88rem; display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-circle-notch fa-spin"></i> Đang tải đăng nhập Google...
            </div>
          </div>
        </div>
        <div id="global-auth-home-btn-wrap" style="display: none; margin-top: 2px;">
          <a href="/" class="global-auth-home-btn">
            <i class="fa-solid fa-house"></i> Quay về Trang Chủ
          </a>
        </div>
      </div>
    `,document.body.appendChild(t),t.addEventListener("click",i=>{i.target===t&&!window._isMandatoryPageLockActive&&window.hideGlobalAuthModal()}),t)}let I=null;function E(){const t=document.getElementById("global-google-signin-btn-container");if(t){if(typeof google>"u"||!google.accounts||!google.accounts.id){S(),clearInterval(I);let i=0;I=setInterval(()=>{i++,typeof google<"u"&&google.accounts&&google.accounts.id?(clearInterval(I),E()):i>30&&(clearInterval(I),t.innerHTML=`
            <button onclick="window.renderGlobalGoogleSignInButton && window.renderGlobalGoogleSignInButton()" style="display: flex; align-items: center; gap: 10px; padding: 10px 18px; border-radius: 999px; background: #2563eb; color: #fff; border: none; font-weight: 600; cursor: pointer;">
              <i class="fa-brands fa-google"></i> Thử lại đăng nhập Google
            </button>
          `)},300);return}try{google.accounts.id.initialize({client_id:l,callback:L,auto_select:!1,cancel_on_tap_outside:!window._isMandatoryPageLockActive}),t.innerHTML="",google.accounts.id.renderButton(t,{theme:"filled_blue",size:"large",type:"standard",shape:"pill",text:"signin_with",logo_alignment:"left",width:290})}catch(i){console.error("Google Sign-In initialization failed:",i)}}}window.renderGlobalGoogleSignInButton=E;async function L(t){if(!(!t||!t.credential))try{let i=null;try{const B=t.credential.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"),R=decodeURIComponent(atob(B).split("").map(function(G){return"%"+("00"+G.charCodeAt(0).toString(16)).slice(-2)}).join("")),U=JSON.parse(R);if(U&&U.email){const G=U.email.toLowerCase().trim(),J=s(G),et=G.includes("hongtai")||G.includes("teacher");i={name:U.name||G.split("@")[0],email:G,picture:U.picture||"",role:J?"super_admin":et?"teacher":"user",isSuperAdmin:J,isAdmin:J||et}}}catch(P){console.warn("Global Auth JWT decode fallback error:",P)}let n=null;try{const P=await fetch(o+"/api/auth/google",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({credential:t.credential}),credentials:"include"});P.ok&&(n=await P.json())}catch(P){console.warn("Backend /api/auth/google error:",P)}let p=null;if(n&&n.success&&n.user)p=n.user,n.token&&localStorage.setItem("session_token",n.token);else if(i)p=i;else throw new Error("Không nhận được dữ liệu xác thực Google");const x=(p.email||"").toLowerCase().trim();if(s(x)?(p.role="super_admin",p.isSuperAdmin=!0,p.isAdmin=!0):h(x)&&(p.isAdmin=!0),localStorage.setItem("user",JSON.stringify(p)),localStorage.setItem("currentUser",JSON.stringify(p)),b(),window.dispatchEvent(new CustomEvent("user-auth-changed",{detail:p})),window.dispatchEvent(new CustomEvent("hongtai-auth-success",{detail:p})),c)try{window.parent.postMessage({type:"HONGTAI_AUTH_SUCCESS",user:p},"*")}catch{}else document.querySelectorAll("iframe").forEach(P=>{try{P.contentWindow.postMessage({type:"HONGTAI_AUTH_SUCCESS",user:p},"*")}catch{}});N();const q=p.name||(p.email?p.email.split("@")[0]:"Học viên");if(u(`Chào mừng ${q} đã đăng nhập thành công! 👋`),!(window.location.pathname==="/"||window.location.pathname.endsWith("/index.html")||window.location.pathname==="")&&!c){setTimeout(()=>{window.location.reload()},350);return}if(typeof window._pendingGuardedAuthCallback=="function"){const P=window._pendingGuardedAuthCallback;window._pendingGuardedAuthCallback=null;try{P()}catch(B){console.error("Error executing pending auth callback:",B)}}}catch(i){console.error("Google Auth Error:",i),u("Đăng nhập Google thất bại! Vui lòng thử lại.",!0)}}window.handleGlobalCredentialResponse=L;function T(t={}){if(c)try{window.parent.postMessage({type:"OPEN_AUTH_REQUIRED_MODAL",actionName:t.actionName||"",title:t.title||"",desc:t.desc||"",isMandatoryPageLock:!!t.isMandatoryPageLock},"*")}catch{}const i=k();window._isMandatoryPageLockActive=!!t.isMandatoryPageLock,window._pendingGuardedAuthCallback=t.callback||null;const n=document.getElementById("global-auth-title"),p=document.getElementById("global-auth-desc"),x=document.getElementById("global-auth-close-btn"),q=document.getElementById("global-auth-home-btn-wrap");n&&(n.innerHTML=t.title||(t.actionName?`Đăng Nhập Để ${t.actionName}`:"Đăng Nhập Để Trải Nghiệm")),p&&(p.innerHTML=t.desc||`Vui lòng đăng nhập với tài khoản Google để sử dụng tính năng ${t.actionName?`<strong>${t.actionName}</strong>`:""}, mở khóa học tập và tự động lưu tiến độ của bạn.`),x&&(t.isMandatoryPageLock?(x.style.setProperty("display","none","important"),x.setAttribute("aria-hidden","true"),x.style.pointerEvents="none"):(x.style.setProperty("display","flex","important"),x.setAttribute("aria-hidden","false"),x.style.pointerEvents="auto")),q&&q.style.setProperty("display",t.isMandatoryPageLock?"block":"none","important"),i.style.display="flex",document.body.style.overflow="hidden",E()}window.showGlobalAuthModal=T,window.addEventListener("message",t=>{t.data&&(t.data.type==="OPEN_AUTH_REQUIRED_MODAL"?T({isMandatoryPageLock:t.data.isMandatoryPageLock!==!1,actionName:t.data.actionName||"tính năng này",title:t.data.title,desc:t.data.desc}):t.data.type==="HONGTAI_AUTH_SUCCESS"&&t.data.user&&(localStorage.setItem("user",JSON.stringify(t.data.user)),localStorage.setItem("currentUser",JSON.stringify(t.data.user)),b(),window.dispatchEvent(new CustomEvent("user-auth-changed",{detail:t.data.user})),window.dispatchEvent(new CustomEvent("hongtai-auth-success",{detail:t.data.user})),N(),typeof window.initUserSessionTracking=="function"&&window.initUserSessionTracking()))});function N(){if(window._isMandatoryPageLockActive&&!y())return;const t=document.getElementById("global-auth-required-modal");t&&(t.style.display="none");const i=document.getElementById("auth-required-modal");i&&(i.style.display="none"),document.body.style.overflow="",window._isMandatoryPageLockActive=!1}window.hideGlobalAuthModal=N;function d(){try{const t=typeof g=="function"?g():null;if(!t)return!1;const i=(t.email||"").toLowerCase().trim();if(!i||i==="guest"||i.startsWith("guest"))return!1;if(typeof h=="function"&&h(i)||t.role==="super_admin"||t.role==="superadmin"||t.isSuperAdmin||t.role==="teacher"||i.includes("hongtai")||i.includes("teacher")||t.role==="admin"||t.isAdmin)return!0;if(t.isVip===!0||t.vipStatus==="vip"){if(t.vipExpiresAt){const n=new Date(t.vipExpiresAt).getTime();if(!isNaN(n)&&n<Date.now())return!1}return!0}return localStorage.getItem(`vip_trial_${i}`)==="true"||localStorage.getItem("vip_trial_claimed")==="true"}catch{return!1}}window.isUserVip=d;function z(){let t=document.getElementById("vip-upgrade-modal");if(t)return t;const i=document.createElement("div");return i.className="modal-overlay",i.id="vip-upgrade-modal",i.style.cssText="display: none; position: fixed; inset: 0; z-index: 999999; background: rgba(10, 15, 29, 0.88); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); align-items: center; justify-content: center; padding: 14px;",i.onclick=function(n){n.target===i&&window.closeVipUpgradeModal()},i.innerHTML=`
      <div class="modal-card glass-panel vip-modal-card global-vip-modal-card">
        <button type="button" class="global-vip-close-btn" onclick="window.closeVipUpgradeModal()" style="position: absolute; top: 16px; right: 16px; font-size: 1.25rem; cursor: pointer; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s; z-index: 2;">&times;</button>
        
        <!-- Header -->
        <div class="global-vip-header" style="text-align: center; padding-right: 28px;">
          <div class="global-vip-badge" style="display: inline-flex; align-items: center; gap: 8px; padding: 5px 16px; border-radius: 99px; font-size: 0.82rem; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">
            <i class="fa-solid fa-crown"></i> Nâng Cấp Tài Khoản VIP
          </div>
          <h3 class="global-vip-title" style="font-size: 1.45rem; font-weight: 900; margin: 0;">Mở Khóa Toàn Bộ Cấp Độ HSK 1 - 6</h3>
          <p class="global-vip-sub" style="font-size: 0.88rem; margin: 4px 0 0 0;">Nhận ngay 30 ngày VIP miễn phí hoặc đăng ký các gói học tập dài hạn</p>
        </div>

        <!-- Tab Buttons -->
        <div class="global-vip-tab-bar" style="display: flex; gap: 8px; padding-bottom: 10px; overflow-x: auto;">
          <button type="button" id="vip-tab-btn-trial" class="vip-modal-tab-btn global-vip-tab-btn active" onclick="window.switchVipModalTab('trial')" style="padding: 8px 16px; border-radius: 10px; font-weight: 800; font-size: 0.85rem; cursor: pointer;">
            🎁 Tặng 30 Ngày VIP (Miễn phí)
          </button>
          <button type="button" id="vip-tab-btn-pricing" class="vip-modal-tab-btn global-vip-tab-btn" onclick="window.switchVipModalTab('pricing')" style="padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer;">
            💎 Bảng Giá Các Gói
          </button>
          <button type="button" id="vip-tab-btn-payment" class="vip-modal-tab-btn global-vip-tab-btn" onclick="window.switchVipModalTab('payment')" style="padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer;">
            💳 Quét Mã QR Thanh Toán
          </button>
        </div>

        <!-- TAB 1: TRIAL -->
        <div id="vip-tab-pane-trial" class="vip-tab-pane" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="global-vip-promo-box">
            <strong>✨ ĐỢT ƯU ĐÃI ĐẶC BIỆT (ĐẾN HẾT 31/12/2026):</strong><br>
            Tiếng Trung HongTai dành tặng <strong>30 NGÀY VIP HOÀN TOÀN MIỄN PHÍ</strong>. Mở khóa toàn bộ từ vựng HSK 1 - 6/9, kho giáo trình E-book và toàn bộ bài tập luyện thi thông minh!
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div class="global-vip-step-card" style="border-radius: 14px; padding: 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
              <div>
                <strong class="global-vip-step-title-blue">Bước 1: Theo dõi kênh mạng xã hội</strong>
                <p class="global-vip-step-desc" style="margin: 2px 0 0 0; font-size: 0.82rem;">Nhấn theo dõi kênh TikTok và Fanpage của trung tâm để cập nhật bài học mới.</p>
              </div>
              <div style="display: flex; gap: 8px;">
                <a href="https://www.tiktok.com/@hongtaitiengtrung" target="_blank" rel="noopener noreferrer" style="background: #000; color: #fff; padding: 8px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                  <i class="fa-brands fa-tiktok"></i> TikTok
                </a>
                <a href="https://www.facebook.com/tiengtrunghongtai" target="_blank" rel="noopener noreferrer" style="background: #1877f2; color: #fff; padding: 8px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                  <i class="fa-brands fa-facebook"></i> Fanpage
                </a>
              </div>
            </div>

            <div class="global-vip-step-card" style="border-radius: 14px; padding: 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
              <div>
                <strong class="global-vip-step-title-green">Bước 2: Gửi thông tin nhận kích hoạt</strong>
                <p class="global-vip-step-desc" style="margin: 2px 0 0 0; font-size: 0.82rem;">Điền email tài khoản của bạn để hệ thống cấp quyền VIP trong 2-4h.</p>
              </div>
              <a href="https://forms.gle/3Cvu1Sm2doLcB6qP8" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 10px 18px; border-radius: 10px; font-size: 0.85rem; font-weight: 800; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">
                <i class="fa-solid fa-gift"></i> Nhận 30N VIP Ngay 🚀
              </a>
            </div>
          </div>
        </div>

        <!-- TAB 2: PRICING -->
        <div id="vip-tab-pane-pricing" class="vip-tab-pane" style="display: none; flex-direction: column; gap: 14px;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
            <div class="global-vip-price-card" style="border-radius: 16px; padding: 16px; text-align: center;">
              <div style="font-weight: 800; color: #38bdf8; font-size: 1.05rem;">GÓI 3 THÁNG</div>
              <div class="global-vip-price-num" style="font-size: 1.45rem; font-weight: 900; margin: 8px 0;">199.000đ</div>
              <div style="font-size: 0.8rem; color: #94a3b8; text-decoration: line-through;">299.000đ</div>
              <button onclick="window.selectVipPackage && window.selectVipPackage('3T')" style="margin-top: 12px; width: 100%; padding: 8px; border-radius: 8px; background: rgba(56, 189, 248, 0.2); border: 1px solid rgba(56, 189, 248, 0.4); color: #0284c7; font-weight: 700; cursor: pointer;">Chọn gói</button>
            </div>
            <div class="global-vip-price-card" style="border: 1.5px solid #818cf8 !important; border-radius: 16px; padding: 16px; text-align: center; position: relative;">
              <span style="position: absolute; top: -10px; right: 12px; background: #6366f1; color: #fff; font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 99px;">PHỔ BIẾN</span>
              <div style="font-weight: 800; color: #818cf8; font-size: 1.05rem;">GÓI 6 THÁNG</div>
              <div class="global-vip-price-num" style="font-size: 1.45rem; font-weight: 900; margin: 8px 0;">349.000đ</div>
              <div style="font-size: 0.8rem; color: #94a3b8; text-decoration: line-through;">599.000đ</div>
              <button onclick="window.selectVipPackage && window.selectVipPackage('6T')" style="margin-top: 12px; width: 100%; padding: 8px; border-radius: 8px; background: linear-gradient(135deg, #6366f1, #4f46e5); border: none; color: #fff; font-weight: 800; cursor: pointer;">Chọn gói</button>
            </div>
            <div class="global-vip-price-card" style="border: 1.5px solid #f59e0b !important; border-radius: 16px; padding: 16px; text-align: center; position: relative;">
              <span style="position: absolute; top: -10px; right: 12px; background: #f59e0b; color: #000; font-size: 0.68rem; font-weight: 800; padding: 2px 8px; border-radius: 99px;">TIẾT KIỆM NHẤT</span>
              <div style="font-weight: 800; color: #d97706; font-size: 1.05rem;">GÓI 1 NĂM</div>
              <div class="global-vip-price-num" style="font-size: 1.45rem; font-weight: 900; margin: 8px 0;">599.000đ</div>
              <div style="font-size: 0.8rem; color: #94a3b8; text-decoration: line-through;">999.000đ</div>
              <button onclick="window.selectVipPackage && window.selectVipPackage('1N')" style="margin-top: 12px; width: 100%; padding: 8px; border-radius: 8px; background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: #fff; font-weight: 800; cursor: pointer;">Chọn gói</button>
            </div>
          </div>
        </div>

        <!-- TAB 3: PAYMENT -->
        <div id="vip-tab-pane-payment" class="vip-tab-pane" style="display: none; flex-direction: column; gap: 14px;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; align-items: center;">
            <div class="global-vip-qr-card" style="border-radius: 18px; padding: 16px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px;">
              <span class="global-vip-qr-title" style="font-size: 0.88rem; font-weight: 800;"><i class="fa-solid fa-qrcode"></i> Quét Mã QR Để Chuyển Khoản</span>
              <div style="background: #fff; padding: 10px; border-radius: 14px; max-width: 220px; width: 100%; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
                <img src="/assets/ma_qr.jpg" alt="Mã QR ACB" style="width: 100%; height: auto; border-radius: 8px; display: block;" onerror="this.alt='QR Chuyển khoản ACB'">
              </div>
              <span style="font-size: 0.78rem; color: #94a3b8;">Hỗ trợ tất cả ứng dụng Ngân hàng</span>
            </div>

            <div class="global-vip-bank-card" style="border-radius: 18px; padding: 18px; display: flex; flex-direction: column; gap: 12px; font-size: 0.88rem;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(148, 163, 184, 0.2); padding-bottom: 8px;">
                <span class="global-vip-bank-label">Ngân hàng:</span>
                <strong style="color: #f59e0b;"><i class="fa-solid fa-building-columns"></i> ACB</strong>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(148, 163, 184, 0.2); padding-bottom: 8px;">
                <span class="global-vip-bank-label">Chủ tài khoản:</span>
                <strong class="global-vip-bank-owner">LE THI HONG THAI</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(148, 163, 184, 0.2); padding-bottom: 8px;">
                <span class="global-vip-bank-label">Số tài khoản:</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <strong class="global-vip-bank-acc" style="font-family: monospace; font-size: 1.05rem;">PHATLOC316046</strong>
                  <button type="button" onclick="navigator.clipboard.writeText('PHATLOC316046'); alert('Đã chép số tài khoản ACB!');" class="global-vip-copy-btn" style="padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; font-weight: 700;">Chép</button>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="global-vip-bank-label">Nội dung CK:</span>
                <strong id="vip-suggested-memo" class="global-vip-bank-memo" style="font-family: monospace; font-size: 0.95rem;">[SĐT] 3T</strong>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 6px;">
            <a href="https://forms.gle/xvM5Nz1xmPuY6JVm7" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; font-weight: 800; font-size: 0.88rem; padding: 10px 22px; border-radius: 10px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
              <i class="fa-solid fa-receipt"></i> Đã Chuyển Khoản? Gửi Biên Lai Ngay 🚀
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div class="global-vip-footer" style="display: flex; align-items: center; justify-content: space-between; padding-top: 12px; margin-top: 4px; font-size: 0.82rem; flex-wrap: wrap; gap: 10px;">
          <span>
            <i class="fa-solid fa-phone" style="color: #38bdf8;"></i> Hỗ trợ / Zalo: <a href="https://zalo.me/0708245997" target="_blank" rel="noopener noreferrer" style="color: #0284c7; font-weight: 800; text-decoration: none;">0708245997</a>
          </span>
          <button type="button" class="global-vip-footer-close-btn" onclick="window.closeVipUpgradeModal()" style="padding: 6px 16px; border-radius: 8px; font-weight: 700; cursor: pointer;">Đóng cửa sổ</button>
        </div>
      </div>
    `,document.body.appendChild(i),i}window.ensureGlobalVipModal=z,window.openVipUpgradeModal=function(t="trial"){const i=z();i&&(i.style.display="flex",document.body.style.overflow="hidden",window.switchVipModalTab(t))},window.closeVipUpgradeModal=function(){const t=document.getElementById("vip-upgrade-modal");t&&(t.style.display="none",document.body.style.overflow="")},window.switchVipModalTab=function(t){["trial","pricing","payment","comparison"].forEach(n=>{const p=document.getElementById("vip-tab-btn-"+n),x=document.getElementById("vip-tab-pane-"+n);p&&(p.classList.toggle("active",n===t),p.style.background="",p.style.color="",p.style.borderColor=""),x&&(x.style.display=n===t?"flex":"none")})},window.selectVipPackage=function(t){window.switchVipModalTab("payment");const i=document.getElementById("vip-suggested-memo");i&&(i.textContent=`[SĐT] ${t}`)},window.requireVip=function(t="nội dung nâng cao",i=null){return d()?(typeof i=="function"&&i(),!0):y()?(u(`👑 ${t} dành cho Hội Viên VIP! Bạn hãy nhận 30 Ngày VIP Miễn Phí để mở khóa nhé.`,!0),window.openVipUpgradeModal("trial"),!1):(T({isMandatoryPageLock:!1,actionName:t,title:"Đăng Nhập Để Nhận 30 Ngày VIP Miễn Phí",desc:`Nội dung <strong>${t}</strong> thuộc quyền lợi Hội Viên VIP. Hãy đăng nhập tài khoản Google để kích hoạt nhận <strong>30 Ngày VIP Miễn Phí</strong> ngay hôm nay!`,callback:()=>{d()?typeof i=="function"&&i():window.openVipUpgradeModal("trial")}}),!1)},window.openLoginPrompt=function(t,i){if(y()){typeof i=="function"&&i();return}T({isMandatoryPageLock:!1,actionName:typeof t=="string"?t:"",callback:typeof i=="function"?i:typeof t=="function"?t:null})},window.openAuthRequiredModal=window.openLoginPrompt,window.requireAuth=function(t,i="sử dụng tính năng này"){return y()?(typeof t=="function"&&t(),!0):(T({isMandatoryPageLock:!1,actionName:i,callback:t}),!1)};function u(t,i=!1){if(typeof window.showToast=="function"){window.showToast(t,i);return}const n=document.getElementById("global-auth-toast");n&&n.remove();const p=document.createElement("div");p.id="global-auth-toast",p.className="global-auth-toast-pill",i&&(p.style.borderColor="rgba(239, 68, 68, 0.4)",p.style.boxShadow="0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(239, 68, 68, 0.2)"),p.innerHTML=`
      <i class="fa-solid ${i?"fa-circle-exclamation text-danger":"fa-circle-check text-success"}" style="color: ${i?"#f87171":"#34d399"}; font-size: 1.1rem;"></i>
      <span>${t}</span>
    `,document.body.appendChild(p),setTimeout(()=>{p.style.transition="opacity 0.3s ease, transform 0.3s ease",p.style.opacity="0",p.style.transform="translateX(-50%) translateY(-10px)",setTimeout(()=>p.remove(),320)},3200)}window.showShadowingUpgradeNotice=function(){u("🔒 Tính năng Shadowing đang được nâng cấp và hoàn thiện! Vui lòng luyện Nghe Chép Chính Tả nhé! 🚀",!1),setTimeout(()=>{window.location.href="/video-dictation.html?mode=dictation"},900)};function a(){const t=window.location.pathname.toLowerCase();if(!(t==="/"||t.endsWith("/index.html")||t==="")&&!y()){let n="tính năng này";t.includes("speaking-practice")?n="Luyện Nói HSKK & AI":t.includes("writing-practice")?n="Luyện Viết Tiếng Trung":t.includes("reading-practice")?n="Luyện Đọc Hiểu":t.includes("video-dictation")?n="Chép Chính Tả & Shadowing Video":t.includes("quiz-game")?n="Trò Chơi Đố Vui HSK":t.includes("vocab-practice")?n="Luyện Từ Vựng 5 Dạng":t.includes("translation-practice")?n="Luyện Dịch Câu & Đoạn Văn":t.includes("sentence-reorder")?n="Bài Tập Sắp Xếp Câu":t.includes("ai-dialogue")?n="Hội Thoại Trợ Lý AI":t.includes("chinese-phonetics")?n="Ngữ Âm Pinyin":t.includes("chinese-radicals")?n="214 Bộ Thủ Chữ Hán":t.includes("hanzi-writer")?n="Tập Viết Chữ Hán (Hanzi)":t.includes("hsk-grammar")?n="Cẩm Nang Ngữ Pháp HSK":t.includes("lesson-texts")?n="Bài Khóa Giáo Trình":t.includes("lesson-online")?n="Khóa Học Trực Tuyến":t.includes("documents")?n="Kho Tài Liệu Học Tập":t.includes("detail-list")?n="Tra Cứu Từ Vựng Chi Tiết":t.includes("chat-history")?n="Lịch Sử Hội Thoại":t.includes("rank")&&(n="Bảng Xếp Hạng Học Viên"),T({isMandatoryPageLock:!0,actionName:n,title:`Đăng Nhập Để Dùng: ${n}`,desc:`Hệ thống yêu cầu bạn đăng nhập bằng Google trước khi sử dụng <strong>${n}</strong> để đồng bộ tiến độ và lưu kết quả học tập.`})}}function b(){try{const t=g();document.querySelectorAll(".app-sidebar, .global-app-sidebar").forEach(n=>{const p=n.querySelector(".user-name, #user-display-name"),x=n.querySelector(".user-sub, #user-display-email"),q=n.querySelector(".user-role-badge, #user-display-role"),V=n.querySelector(".sidebar-avatar-wrap"),P=n.querySelector(".sidebar-auth-action-item");if(t&&(t.name||t.email)){const B=t.name||t.displayName||(t.email?t.email.split("@")[0]:"Học viên"),R=t.email||"",U=t.avatar||t.picture||t.photoURL||"";let G="Học viên";t.role==="super_admin"?G="👑 Super Admin":t.role==="admin"?G=t.isVip?"👑 Admin VIP":"👑 Quản trị viên":t.role==="teacher"?G=t.isVip?"🛡️ Giáo viên VIP":"🛡️ Giáo viên":t.isVip?G="👑 Hội Viên VIP":G="🎓 Học viên",p&&(p.textContent=B),x&&(x.textContent=R),q&&(q.textContent=G,q.style.display="inline-flex",q.style.alignItems="center",q.style.gap="4px",q.style.padding="2px 8px",q.style.borderRadius="99px",q.style.whiteSpace="nowrap",q.style.width="fit-content",q.style.fontSize="0.7rem",q.style.fontWeight="700",q.style.lineHeight="1.25",t.role==="super_admin"?(q.style.background="linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(225, 29, 72, 0.12))",q.style.color="#fb7185",q.style.border="1px solid rgba(244, 63, 94, 0.4)",q.style.boxShadow="0 2px 8px rgba(244, 63, 94, 0.2)"):t.isVip?(q.style.background="linear-gradient(135deg, rgba(234, 179, 8, 0.22), rgba(202, 138, 4, 0.12))",q.style.color="#facc15",q.style.border="1px solid rgba(234, 179, 8, 0.45)",q.style.boxShadow="0 2px 8px rgba(234, 179, 8, 0.2)"):t.role==="admin"||t.role==="teacher"?(q.style.background="rgba(56, 189, 248, 0.15)",q.style.color="#38bdf8",q.style.border="1px solid rgba(56, 189, 248, 0.35)",q.style.boxShadow="none"):(q.style.background="rgba(255, 255, 255, 0.08)",q.style.color="#94a3b8",q.style.border="1px solid rgba(255, 255, 255, 0.15)",q.style.boxShadow="none")),V&&(U?V.innerHTML=`<img class="user-avatar-img" src="${U}" alt="Avatar" style="display: block; width: 44px; height: 44px; border-radius: 50%; object-fit: cover;">`:V.innerHTML='<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>'),P&&(P.innerHTML=`
              <a href="javascript:void(0)" class="logout-link" onclick="window.handleGlobalLogout && window.handleGlobalLogout(event)" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #f87171; font-size: 0.88rem; font-weight: 600; text-decoration: none; transition: all 0.2s;">
                <i class="fa-solid fa-right-from-bracket" style="color: #f87171;"></i> <span>Đăng xuất</span>
              </a>
            `)}else p&&(p.textContent="Khách (Chưa đăng nhập)"),x&&(x.textContent="Đăng nhập để lưu tiến độ học"),q&&(q.textContent="Khách"),V&&(V.innerHTML='<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>'),P&&(P.innerHTML=`
              <a href="javascript:void(0)" onclick="window.openLoginPrompt && window.openLoginPrompt()" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #4ade80; font-size: 0.88rem; font-weight: 700; text-decoration: none; transition: all 0.2s;">
                <i class="fa-brands fa-google" style="color: #4ade80;"></i> <span>Đăng nhập Google</span>
              </a>
            `)})}catch(t){console.warn("Error in updateSidebarUserProfile:",t)}}function H(){const t=e(),i=g(),n=i?i.name||i.displayName||(i.email?i.email.split("@")[0]:"Học viên"):"Khách (Chưa đăng nhập)",p=i?i.email||"":"Đăng nhập để lưu tiến độ học";let x="Khách",q="font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; width: fit-content; background: rgba(255, 255, 255, 0.06); color: #64748b; border: 1px solid rgba(255, 255, 255, 0.1); margin-top: 2px; line-height: 1.25;";i&&(i.name||i.email)&&(i.role==="super_admin"?(x="👑 Super Admin",q="font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; width: fit-content; background: linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(225, 29, 72, 0.12)); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.4); box-shadow: 0 2px 8px rgba(244, 63, 94, 0.2); margin-top: 2px; line-height: 1.25;"):i.isVip?(x="👑 Hội Viên VIP",q="font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; width: fit-content; background: linear-gradient(135deg, rgba(234, 179, 8, 0.22), rgba(202, 138, 4, 0.12)); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.45); box-shadow: 0 2px 8px rgba(234, 179, 8, 0.2); margin-top: 2px; line-height: 1.25;"):i.role==="admin"?(x="👑 Quản trị viên",q="font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; width: fit-content; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35); margin-top: 2px; line-height: 1.25;"):i.role==="teacher"?(x="🛡️ Giáo viên",q="font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; width: fit-content; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.35); margin-top: 2px; line-height: 1.25;"):(x="🎓 Học viên",q="font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; width: fit-content; background: rgba(255, 255, 255, 0.08); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.15); margin-top: 2px; line-height: 1.25;"));const V=i&&(i.picture||i.avatar)?i.picture||i.avatar:"";return`
    <aside class="app-sidebar global-sidebar-drawer" id="global-app-sidebar">
      <div class="sidebar-header">
        <a href="/" style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1; text-decoration: none;">
          <img class="sidebar-logo" src="/assets/logo.png" alt="Hongtai Logo">
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary, #ffffff); letter-spacing: -0.01em;">Hongtai Chinese</span>
          </div>
        </a>
        <button class="sidebar-toggle-btn" onclick="window.closeGlobalSidebar()" title="Đóng Menu (✕)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- User Account Card with Interactive Dropdown -->
      <div class="auth-container ${i?"logged-in":"logged-out"}" style="width: 100%; border-bottom: 1px solid var(--border-glass, rgba(255,255,255,0.12)); padding-bottom: 12px; margin-bottom: 12px; position: relative;">
        <div class="user-dropdown" style="width: 100%; position: relative;">
          <div class="user-profile sidebar-profile-card" onclick="window.toggleGlobalUserDropdown && window.toggleGlobalUserDropdown(event)"
            style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: rgba(255, 255, 255, 0.04); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.2s ease;">
            <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
              <div class="sidebar-avatar-wrap" style="flex-shrink: 0;">
                ${V?`<img class="user-avatar-img" src="${V}" alt="Avatar" style="display: block; width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-blue, #38bdf8);">`:'<div class="user-avatar sidebar-avatar-placeholder" style="width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white;"><i class="fa-solid fa-user"></i></div>'}
              </div>
              <div class="user-info" style="min-width: 0; flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                <span class="user-name" style="font-weight: 700; font-size: 0.92rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${n}</span>
                <span class="user-sub" style="font-size: 0.72rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p}</span>
                <span class="user-role-badge" id="user-display-role" style="${q}">${x}</span>
              </div>
            </div>
            <i class="fa-solid fa-chevron-down profile-chevron" style="color: #94a3b8; font-size: 0.8rem; margin-left: 8px; transition: transform 0.2s ease;"></i>
          </div>

          <!-- Dropdown menu with 3 options -->
          <ul class="profile-dropdown-menu" style="position: absolute; top: calc(100% + 6px); left: 0; right: 0; width: 100%; background: #1e293b; background-color: rgba(30, 41, 59, 0.98); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 12px; box-shadow: 0 14px 35px rgba(0,0,0,0.6); padding: 8px 6px; list-style: none; z-index: 9999; margin: 0; box-sizing: border-box;">
            <li>
              <a href="/chat-history.html" class="history-link" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #cbd5e1; font-size: 0.88rem; font-weight: 500; text-decoration: none; transition: all 0.2s;">
                <i class="fa-solid fa-clock-rotate-left" style="color: #38bdf8;"></i> <span>Lịch sử cuộc trò chuyện</span>
              </a>
            </li>
            <li>
              <a href="/rank.html" id="game-history-btn" class="history-link" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #cbd5e1; font-size: 0.88rem; font-weight: 500; text-decoration: none; transition: all 0.2s;">
                <i class="fa-solid fa-gamepad" style="color: #fbbf24;"></i> <span>Lịch sử chơi &amp; Xếp hạng</span>
              </a>
            </li>
            <li class="sidebar-auth-action-item">
              ${i?`
              <a href="javascript:void(0)" class="logout-link" onclick="window.handleGlobalLogout && window.handleGlobalLogout(event)" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #f87171; font-size: 0.88rem; font-weight: 600; text-decoration: none; transition: all 0.2s;">
                <i class="fa-solid fa-right-from-bracket" style="color: #f87171;"></i> <span>Đăng xuất</span>
              </a>
              `:`
              <a href="javascript:void(0)" onclick="window.openLoginPrompt && window.openLoginPrompt()" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #4ade80; font-size: 0.88rem; font-weight: 700; text-decoration: none; transition: all 0.2s;">
                <i class="fa-brands fa-google" style="color: #4ade80;"></i> <span>Đăng nhập Google</span>
              </a>
              `}
            </li>
          </ul>
        </div>
      </div>

      <div class="sidebar-menu-wrapper" style="width: 100%; box-sizing: border-box;">
        <!-- TRANG CHỦ -->
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${t==="home"?"active":""}" onclick="window.location.href = '/'">
            <i class="fa-solid fa-house"></i> <span>Trang chủ</span>
          </li>
        </ul>

        <!-- DANH MỤC 1: HỌC TẬP -->
        <div class="sidebar-section-label">Học Tập</div>
        <ul class="sidebar-menu" style="margin-bottom: 8px;">
          <li class="sidebar-item ${t==="roadmap"?"active":""}" onclick="window.location.href = '/index.html#roadmap'">
            <i class="fa-solid fa-route" style="color: #60a5fa;"></i> <span>Lộ trình</span>
          </li>
        </ul>

        <!-- Từ vựng (Dropdown giống index.html) -->
        <div class="sidebar-group ${["vocabulary","radicals","phonetics","flashcards","hanzi"].includes(t)?"open":""}">
          <div class="sidebar-item sidebar-dropdown-toggle" onclick="window.toggleSidebarDropdown(this)">
            <i class="fa-solid fa-font"></i> <span>Từ vựng</span>
            <i class="fa-solid fa-chevron-down dropdown-arrow"></i>
          </div>
          <ul class="sidebar-submenu">
            <li class="sidebar-subitem ${t==="radicals"?"active":""}" onclick="window.location.href = '/chinese-radicals.html'">
              <i class="fa-solid fa-shapes" style="color: #2563eb;"></i> <span>Bộ thủ</span>
            </li>
            <li class="sidebar-subitem ${t==="phonetics"?"active":""}" onclick="window.location.href = '/chinese-phonetics.html'">
              <i class="fa-solid fa-table-cells"></i> <span>Bảng phiên âm (Pinyin)</span>
            </li>
            <li class="sidebar-subitem ${t==="flashcards"?"active":""}" onclick="window.location.href = '/index.html?tab=flashcards'">
              <i class="fa-solid fa-book-bookmark" style="color: #38bdf8;"></i> <span>Sổ tay</span>
            </li>
            <li class="sidebar-subitem ${t==="hanzi"?"active":""}" onclick="window.location.href = '/hanzi-writer.html'">
              <i class="fa-solid fa-pen-nib"></i> <span>Luyện viết &amp; In phiếu tập viết</span>
            </li>
          </ul>
        </div>

        <!-- Sổ tay Ngữ Pháp (Single Item) -->
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${t==="grammar"?"active":""}" onclick="window.location.href = '/hsk-grammar.html'">
            <i class="fa-solid fa-spell-check" style="color: #38bdf8;"></i> <span>Sổ tay Ngữ Pháp</span>
          </li>
        </ul>

        <!-- DANH MỤC: TRÒ CHƠI -->
        <div class="sidebar-section-label">Trò Chơi</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${t==="games"?"active":""}" onclick="window.location.href = '/quiz-game.html'">
            <i class="fa-solid fa-gamepad" style="color: #f59e0b;"></i> <span>Trò Chơi</span>
          </li>
        </ul>

        <!-- DANH MỤC 2: KỸ NĂNG -->
        <div class="sidebar-section-label">Kỹ Năng</div>
        <ul class="sidebar-menu" style="margin-bottom: 8px;">
          <li class="sidebar-item" onclick="window.showShadowingUpgradeNotice()" title="Tính năng Shadowing đang được nâng cấp" style="cursor: pointer;">
            <i class="fa-solid fa-microphone-lines" style="color: #10b981; font-size: 1.1rem;"></i> <span>Shadowing</span>
            <span style="font-size: 0.65rem; background: rgba(245, 158, 11, 0.18); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.35); padding: 1px 7px; border-radius: 99px; font-weight: 700; margin-left: auto; display: inline-flex; align-items: center; gap: 3px;">
              <i class="fa-solid fa-lock" style="font-size: 0.6rem;"></i> Nâng cấp
            </span>
          </li>
          <li class="sidebar-item ${t==="dictation"?"active":""}" onclick="window.location.href = '/video-dictation.html?mode=dictation'">
            <i class="fa-solid fa-pen-to-square" style="color: #38bdf8; font-size: 1.1rem;"></i> <span>Nghe Chép</span>
          </li>
          <li class="sidebar-item ${t==="reading"?"active":""}" onclick="window.location.href = '/reading-practice.html'">
            <i class="fa-solid fa-book-open-reader" style="color: #38bdf8; font-size: 1.1rem;"></i> <span>Luyện Đọc</span>
          </li>
          <li class="sidebar-item ${t==="writing"?"active":""}" onclick="window.location.href = '/writing-practice.html'" style="cursor: pointer;">
            <i class="fa-solid fa-feather-pointed" style="color: #a855f7; font-size: 1.1rem;"></i> <span>Luyện Viết</span>
          </li>
          <li class="sidebar-item ${t==="speaking"?"active":""}" onclick="window.location.href = '/speaking-practice.html'" style="cursor: pointer;">
            <i class="fa-solid fa-microphone-lines" style="color: #f59e0b; font-size: 1.1rem;"></i> <span>Luyện Nói</span>
          </li>
          <li class="sidebar-item ${t==="translation"?"active":""}" onclick="window.location.href = '/translation-practice.html'" style="cursor: pointer;">
            <i class="fa-solid fa-language" style="color: #06b6d4; font-size: 1.1rem;"></i> <span>Luyện Dịch</span>
          </li>
          <li class="sidebar-item ${t==="sentence-reorder"?"active":""}" onclick="window.location.href = '/sentence-reorder.html'" style="cursor: pointer;">
            <i class="fa-solid fa-arrow-down-short-wide" style="color: #38bdf8; font-size: 1.1rem;"></i> <span>Sắp xếp câu</span>
          </li>
          <li class="sidebar-item ${t==="ai-dialogue"?"active":""}" onclick="window.location.href = '/ai-dialogue.html'" style="cursor: pointer;">
            <i class="fa-solid fa-comments" style="color: #a855f7; font-size: 1.1rem;"></i> <span>Hội thoại AI</span>
          </li>
        </ul>

        <!-- DANH MỤC 3: LUYỆN ĐỀ -->
        <div class="sidebar-section-label">Luyện Đề</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item" onclick="if(window.showComingSoonNotice){ window.showComingSoonNotice('Luyện Đề Thi HSK'); } else { alert('Tính năng Đề thi HSK đang được hoàn thiện và sẽ sớm ra mắt!'); }">
            <i class="fa-solid fa-file-signature" style="color: #64748b;"></i> <span>Đề thi HSK</span>
            <span style="font-size:0.68rem; background:rgba(245,158,11,0.2); color:#f59e0b; border:1px solid rgba(245,158,11,0.3); padding:2px 6px; border-radius:6px; font-weight:700; margin-left:auto; white-space:nowrap;">🔒 Sắp ra mắt</span>
          </li>
        </ul>

        <!-- DANH MỤC 4: CỘNG ĐỒNG -->
        <div class="sidebar-section-label">Cộng Đồng</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item" onclick="if(window.openSurveyModal){ window.openSurveyModal(); } else { window.open('https://forms.gle/WaqZsrYrCZfAN5xn6', '_blank'); }" style="cursor: pointer;">
            <i class="fa-solid fa-clipboard-question" style="color: #ec4899;"></i> <span>Khảo sát ý kiến</span>
          </li>
          <li class="sidebar-item ${t==="documents"?"active":""}" onclick="window.location.href = '/documents.html'" style="cursor: pointer;">
            <i class="fa-solid fa-book-bookmark" style="color: #f59e0b;"></i> <span>Kho Sách &amp; Tài Liệu</span>
            <span style="font-size:0.68rem; background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(236, 72, 153, 0.25)); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); padding: 2px 7px; border-radius: 6px; font-weight: 800; margin-left: auto; white-space: nowrap;"><i class="fa-solid fa-crown" style="font-size:0.62rem; margin-right:2px;"></i> VIP</span>
          </li>
          <li class="sidebar-item" onclick="window.location.href = '/?openDiscussion=true'" style="cursor: pointer;">
            <i class="fa-solid fa-comments" style="color: #38bdf8;"></i> <span>Thảo luận &amp; Góp ý</span>
          </li>
          <li class="sidebar-item ${t==="rank"?"active":""}" onclick="window.location.href = '/rank.html'">
            <i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span>Xếp hạng</span>
          </li>
        </ul>

        ${i&&(i.role==="super_admin"||i.role==="admin"||i.role==="teacher"||i.email&&(i.email.includes("phanphiphu")||i.email.includes("thaihong162004")||i.email.includes("hongtai")))?`
        <!-- DANH MỤC: QUẢN TRỊ VIÊN -->
        <div class="sidebar-section-label" style="color: #f43f5e; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-crown" style="font-size: 0.75rem;"></i> Quản Trị Hệ Thống
        </div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item" onclick="if(window.openAdminManagementModal){ window.openAdminManagementModal(); } else { window.location.href = '/?openAdmin=true'; }"
            style="cursor: pointer; background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: 10px;">
            <i class="fa-solid fa-users-gear" style="color: #f43f5e;"></i> <span>Quản lý Học viên</span>
            <span style="font-size:0.68rem; background:linear-gradient(135deg, #f43f5e, #e11d48); color:white; padding:2px 6px; border-radius:6px; font-weight:800; margin-left:auto; white-space:nowrap;">Admin</span>
          </li>
        </ul>
        `:""}

        <!-- DANH MỤC: GIAO DIỆN -->
        <div class="sidebar-section-label">Giao Diện</div>
        <ul class="sidebar-menu" style="margin-bottom: 24px;">
          <li class="sidebar-item" onclick="window.toggleTheme && window.toggleTheme()">
            <i class="fa-solid fa-moon" style="color: #60a5fa;"></i> <span>Chế độ Sáng / Tối</span>
          </li>
          <li class="sidebar-item" onclick="window.toggleSeasonalParticles && window.toggleSeasonalParticles()">
            <i class="fa-solid fa-snowflake" style="color: #38bdf8;"></i> <span>Hiệu ứng Mùa rơi</span>
          </li>
        </ul>
      </div>
    </aside>
    `}window.openGlobalSidebar=function(){try{b()}catch(p){console.warn("Sidebar profile sync error:",p)}const t=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html")||window.location.pathname==="";if(document.body.classList.remove("sidebar-collapsed"),t&&window.innerWidth>900){localStorage.setItem("sidebar_collapsed","false");return}const i=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),n=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");i&&(i.classList.add("open","active"),i.style.pointerEvents="auto"),n&&n.classList.add("active"),document.body.classList.add("sidebar-open")},window.closeGlobalSidebar=function(){const t=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),i=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");t&&t.classList.remove("open","active"),i&&i.classList.remove("active"),document.body.classList.remove("sidebar-open")},window.toggleGlobalSidebar=function(){if((window.location.pathname==="/"||window.location.pathname.endsWith("/index.html")||window.location.pathname==="")&&window.innerWidth>900){window.toggleSidebarCollapse?window.toggleSidebarCollapse():document.body.classList.toggle("sidebar-collapsed");return}const i=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar");i&&(i.classList.contains("open")||i.classList.contains("active")||document.body.classList.contains("sidebar-open"))?window.closeGlobalSidebar():window.openGlobalSidebar()},window.toggleGlobalUserDropdown=function(t){t&&(typeof t.stopPropagation=="function"&&t.stopPropagation(),typeof t.preventDefault=="function"&&t.preventDefault());const i=t&&(t.currentTarget||t.target)?t.currentTarget||t.target:null,n=i?i.closest(".user-dropdown"):document.querySelector(".app-sidebar .user-dropdown")||document.querySelector(".user-dropdown");n?n.classList.toggle("show-menu"):document.querySelectorAll(".user-dropdown").forEach(x=>x.classList.toggle("show-menu"))},window.toggleUserDropdown=window.toggleGlobalUserDropdown,window.handleGlobalLogout=async function(t){t&&(t.stopPropagation(),typeof t.preventDefault=="function"&&t.preventDefault());try{await fetch("/api/auth/logout",{method:"POST",credentials:"include"})}catch{}if(localStorage.removeItem("user"),localStorage.removeItem("currentUser"),localStorage.removeItem("hongtai_user"),localStorage.removeItem("hongtai_current_user"),localStorage.removeItem("session_token"),sessionStorage.removeItem("user"),typeof google<"u"&&google.accounts&&google.accounts.id)try{google.accounts.id.disableAutoSelect()}catch{}if(!(window.location.pathname==="/"||window.location.pathname.endsWith("/index.html")||window.location.pathname==="")){window.location.href="/?logged_out=true";return}typeof window.handleLogout=="function"?window.handleLogout(t):window.location.reload()},document.addEventListener("keydown",function(t){t.key==="Escape"&&(window.closeGlobalSidebar(),document.querySelectorAll(".user-dropdown.show-menu").forEach(i=>i.classList.remove("show-menu")))}),document.addEventListener("click",function(t){const i=t.target.closest(".sidebar-profile-card, .user-profile, .profile-chevron");if(i){t.preventDefault(),t.stopPropagation();const n=i.closest(".user-dropdown")||document.querySelector(".user-dropdown");n&&n.classList.toggle("show-menu");return}if(t.target.closest(".profile-dropdown-menu")){t.target.closest("a")&&setTimeout(()=>{document.querySelectorAll(".user-dropdown.show-menu").forEach(p=>p.classList.remove("show-menu"))},120);return}t.target.closest(".user-dropdown")||document.querySelectorAll(".user-dropdown.show-menu").forEach(n=>n.classList.remove("show-menu"))},!0);const M=[{id:"ai-dialogue",tag:"✨ AI MỚI",tagClass:"ai",title:"Hội Thoại AI Nhập Vai:",desc:"Trò chuyện thực tế nhập vai với AI theo 12 chủ đề đời sống & du lịch.",link:"/ai-dialogue.html",linkText:"Trải nghiệm ngay →"},{id:"sentence-reorder",tag:"🧩 790+ CÂU",tagClass:"feat",title:"Sắp Xếp Câu Ngữ Pháp:",desc:"Luyện phản xạ cấu trúc câu chuẩn từ HSK 1 - 6 với chấm điểm tức thì.",link:"/sentence-reorder.html",linkText:"Luyện tập ngay →"},{id:"writing-practice",tag:"✍️ LUYỆN VIẾT",tagClass:"hot",title:"Luyện Viết Luận & HSKK:",desc:"1,045+ đề thi thực tế, công nghệ AI chấm điểm & sửa lỗi ngữ pháp chi tiết.",link:"/writing-practice.html",linkText:"Viết ngay →"},{id:"speaking-practice",tag:"🎙️ LUYỆN NÓI",tagClass:"audio",title:"Luyện Phát Âm Trực Tiếp:",desc:"Nhận diện giọng nói qua Micro AI, kiểm tra độ chuẩn xác thanh điệu từng từ.",link:"/speaking-practice.html",linkText:"Nói ngay →"},{id:"reading-practice",tag:"📖 ĐỌC HIỂU",tagClass:"book",title:"Luyện Đọc Chuyên Sâu:",desc:"Hàng trăm bài đọc chuẩn HSK 1 - 6 kèm audio bản xứ, giải nghĩa từ vựng & câu hỏi.",link:"/reading-practice.html",linkText:"Đọc ngay →"},{id:"translation-practice",tag:"🌐 DỊCH THUẬT",tagClass:"feat",title:"Luyện Dịch Trung - Việt:",desc:"Rèn luyện phản xạ chuyển ngữ song song Trung - Việt / Việt - Trung chuẩn ngữ cảnh.",link:"/translation-practice.html",linkText:"Dịch ngay →"},{id:"video-shadowing",tag:"🎬 ĐANG NÂNG CẤP",tagClass:"hot",title:"Shadowing Video:",desc:"Tính năng đang được nâng cấp hoàn thiện. Hãy luyện Nghe Chép Chính Tả trong lúc chờ đợi nhé!",link:"/video-dictation.html?mode=dictation",linkText:"Luyện Nghe Chép →"},{id:"video-dictation",tag:"🎧 NGHE CHÉP",tagClass:"audio",title:"Nghe Chép Chính Tả Video:",desc:"Luyện tai nghe thực tế qua video ngắn chân thực kèm phụ đề pinyin & dịch nghĩa.",link:"/video-dictation.html?mode=dictation",linkText:"Luyện nghe ngay →"},{id:"hanzi-writer",tag:"🖌️ CHỮ HÁN",tagClass:"feat",title:"Hanzi Writer & In Phiếu:",desc:"Mô phỏng thứ tự nét thuận, tra cứu bộ thủ và xuất file PDF tập viết ô chữ điền miễn phí.",link:"/hanzi-writer.html",linkText:"Tập viết ngay →"},{id:"chinese-phonetics",tag:"🔤 PINYIN",tagClass:"feat",title:"Bảng Phiên Âm Chuẩn:",desc:"Đầy đủ thanh mẫu, vận mẫu, thanh điệu kèm audio mẫu phát âm chuẩn Bắc Kinh.",link:"/chinese-phonetics.html",linkText:"Tra cứu ngay →"},{id:"chinese-radicals",tag:"🏮 214 BỘ THỦ",tagClass:"feat",title:"214 Bộ Thủ Thần Tốc:",desc:"Học chữ Hán qua nguồn gốc hình tượng hóa, ý nghĩa và mẹo ghi nhớ nhanh.",link:"/chinese-radicals.html",linkText:"Học bộ thủ →"},{id:"han-viet-rules",tag:"⚡ BÍ QUYẾT",tagClass:"hot",title:"Chuyển Âm Hán Việt:",desc:"Mẹo vàng ghi nhớ hàng ngàn từ vựng HSK không cần học vẹt nhờ quy tắc biến đổi âm.",link:"/han-viet-rules.html",linkText:"Xem quy tắc →"},{id:"hsk-grammar",tag:"📚 NGỮ PHÁP",tagClass:"book",title:"Cẩm Nang Ngữ Pháp Toàn Diện:",desc:"Hệ thống hóa toàn bộ cấu trúc ngữ pháp HSK 1 - 6 chuẩn Sư Phạm có bài tập & ví dụ.",link:"/hsk-grammar.html",linkText:"Xem ngữ pháp →"},{id:"lesson-texts",tag:"🔊 BÀI KHÓA",tagClass:"book",title:"Bài Khóa & Audio Chuẩn:",desc:"Trọn bộ bài khóa HSK theo giáo trình chuẩn, kèm file nghe audio gốc & dịch song ngữ.",link:"/lesson-texts.html",linkText:"Khám phá ngay →"},{id:"game-hub",tag:"🎮 5 MINI GAME",tagClass:"game",title:"Đấu Trường Mini Game:",desc:"Vừa chơi vừa ôn luyện: Pháo hoa sinh tồn, Nối chữ Hán, Lật thẻ từ vựng & Bắn bóng!",action:"gamehub",linkText:"Vào chơi ngay →"},{id:"flashcards-spaced",tag:"🃏 FLASHCARD",tagClass:"feat",title:"Flashcard Ghi Nhớ Sâu:",desc:"Thuật toán lặp lại ngắt quãng Spaced Repetition giúp nhớ lâu từ vựng không lo quên.",action:"flashcards",linkText:"Luyện từ ngay →"},{id:"documents-vault",tag:"👑 TÀI LIỆU",tagClass:"vip",title:"Kho Sách & Ebook HSK VIP:",desc:"Tải miễn phí trọn bộ giáo trình HSK 1 - 6, sách ngữ pháp, đề thi thật PDF & audio.",link:"/documents.html",linkText:"Tải tài liệu →"},{id:"leaderboard-rank",tag:"🏆 THI ĐUA",tagClass:"trophy",title:"Bảng Xếp Hạng Học Viên:",desc:"Tích lũy điểm khi ôn tập từ vựng & trò chơi để ghi danh Top 1 Tiếng Trung HongTai.",link:"/rank.html",linkText:"Bảng xếp hạng →"},{id:"roadmap-guide",tag:"🎯 LỘ TRÌNH",tagClass:"feat",title:"Lộ Trình Cá Nhân Hóa:",desc:"Kế hoạch học tập khoa học theo ngày từ HSK 1 đến HSK 6 với mục tiêu rõ ràng.",action:"roadmap",linkText:"Xem lộ trình →"},{id:"dictionary-lookup",tag:"🔍 TRA CỨU",tagClass:"feat",title:"Từ Điển HSK 5,000+ Từ:",desc:"Tra nghĩa tiếng Việt, pinyin, từ loại, câu ví dụ thực tế và audio phát âm bản xứ.",link:"/detail-list.html",linkText:"Tra cứu ngay →"},{id:"vip-upgrade-trial",tag:"🎁 ĐỢT TRẢI NGHIỆM",tagClass:"vip",title:"Đợt Nhận 30 Ngày VIP (Đến Hết 31/12/2026):",desc:"Mở cổng tặng 30 ngày VIP miễn phí 100%! Kích hoạt lúc nào tính đủ 30 ngày từ lúc đó.",action:"vip",linkText:"Nhận 30N VIP →"},{id:"vip-schedule-fee",tag:"⏳ LỘ TRÌNH PHÍ",tagClass:"hot",title:"Thời Gian Bắt Đầu Tính Phí VIP:",desc:"Tài khoản bắt đầu tính phí sau khi kết thúc 30 ngày trải nghiệm. Bảng giá ưu đãi các gói 3T, 6T, 1N!",action:"vip",linkText:"Xem lộ trình & phí →"},{id:"discussion-forum",tag:"💬 CỘNG ĐỒNG",tagClass:"feat",title:"Thảo Luận Cùng Giảng Viên:",desc:"Giao lưu trao đổi kinh nghiệm học tập, đặt câu hỏi ngữ pháp cùng cộng đồng học viên.",action:"discussion",linkText:"Tham gia thảo luận →"},{id:"online-courses",tag:"🎓 KHÓA HỌC",tagClass:"book",title:"Lớp Học Trực Tuyến Sư Phạm:",desc:"Chương trình đào tạo HSK bài bản cùng đội ngũ giảng viên chuyên ngành tiếng Trung.",link:"/lesson-online.html",linkText:"Xem lớp học →"},{id:"hongtai-platform",tag:"🔥 NỔI BẬT",tagClass:"hot",title:"Tiếng Trung HongTai:",desc:"Nền tảng học HSK 1 - 6 trực quan, toàn diện & chuẩn Sư Phạm với 5,000+ từ vựng phong phú.",link:"/",linkText:"Khám phá ngay →"}];function w(t){const i=[...t];for(let n=i.length-1;n>0;n--){const p=Math.floor(Math.random()*(n+1));[i[n],i[p]]=[i[p],i[n]]}return i}function f(t){t==="gamehub"?typeof window.showGameHubGuideModal=="function"?window.showGameHubGuideModal():window.location.href="/quiz-game.html":t==="flashcards"?typeof window.switchTab=="function"?window.switchTab("flashcards"):window.location.href="/index.html?tab=flashcards":t==="roadmap"?typeof window.showRoadmapView=="function"?window.showRoadmapView():typeof window.switchTab=="function"?window.switchTab("roadmap"):window.location.href="/index.html?tab=roadmap":t==="vip"?typeof window.openVipUpgradeModal=="function"&&window.openVipUpgradeModal("trial"):t==="discussion"&&typeof window.openDiscussionModal=="function"&&window.openDiscussionModal()}function C(t){const i=t.action?`data-ticker-action="${t.action}"`:"",n=t.link||"javascript:void(0)";return`<span class="ticker-item" data-ticker-id="${t.id}" ${i} tabindex="0" role="button"><span class="ticker-tag ${t.tagClass}">${t.tag}</span> <strong>${t.title}</strong> ${t.desc} <a href="${n}" class="ticker-action-link" ${i}>${t.linkText}</a></span>`}window.closeAnnouncementTicker=function(){const t=document.getElementById("home-announcement-ticker")||document.querySelector(".announcement-ticker-bar");if(t){t.classList.add("dismissed"),setTimeout(()=>{t.style.display="none"},350);try{sessionStorage.setItem("hongtai_ticker_dismissed","true")}catch{}}},window.shuffleAnnouncementTicker=function(){const t=document.getElementById("home-announcement-ticker")||document.querySelector(".announcement-ticker-bar");if(!t)return;const i=t.querySelector("#ticker-shuffle-btn");i&&(i.classList.add("spinning"),setTimeout(()=>i.classList.remove("spinning"),600));const n=t.querySelector(".ticker-track-inner");n?(n.style.opacity="0.35",n.style.transition="opacity 0.2s ease",setTimeout(()=>{v(t,!0),n.style.opacity="1"},160)):v(t,!0),typeof window.showToast=="function"&&window.showToast("🎲 Đã trộn ngẫu nhiên các tính năng nổi bật!")};function v(t,i=!1){const n=t.querySelector(".ticker-track-inner");if(!n)return;let p=t.querySelector(".ticker-controls");if(!p){const B=t.querySelector(".ticker-close-btn");p=document.createElement("div"),p.className="ticker-controls",p.innerHTML=`
        <button type="button" class="ticker-control-btn ticker-shuffle-btn" id="ticker-shuffle-btn" title="Trộn ngẫu nhiên tính năng &amp; tài nguyên" aria-label="Trộn ngẫu nhiên">
          <i class="fa-solid fa-shuffle"></i>
        </button>
        <button type="button" class="ticker-control-btn ticker-close-btn" onclick="window.closeAnnouncementTicker && window.closeAnnouncementTicker()" title="Đóng thông báo" aria-label="Đóng thông báo">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `,B?B.replaceWith(p):t.appendChild(p)}const x=p.querySelector("#ticker-shuffle-btn");x&&!x.dataset.bound&&(x.dataset.bound="true",x.onclick=function(B){B.stopPropagation(),window.shuffleAnnouncementTicker()});const V=w(M).map(C).join("");n.innerHTML=`
      <div class="ticker-content-loop" id="ticker-loop-primary">${V}</div>
      <div class="ticker-content-loop" id="ticker-loop-clone" aria-hidden="true">${V}</div>
    `,n.onclick=function(B){const R=B.target.closest(".ticker-item");if(!R)return;const U=R.getAttribute("data-ticker-action")||B.target.closest("[data-ticker-action]")&&B.target.closest("[data-ticker-action]").getAttribute("data-ticker-action");if(U){B.preventDefault(),B.stopPropagation(),f(U);return}const G=R.querySelector(".ticker-action-link");G&&G.href&&!G.href.includes("javascript:")&&B.target!==G&&(window.location.href=G.href)};const P=n.querySelector("#ticker-loop-primary");P&&requestAnimationFrame(()=>{const B=P.scrollWidth||6e3,R=Math.max(45,Math.round(B/80));if(n.style.animationDuration=`${R}s`,i)n.style.animationDelay="0s";else{const U=(Math.random()*R).toFixed(1);n.style.animationDelay=`-${U}s`}}),n.onanimationiteration=function(){try{const R=w(M).map(C).join(""),U=n.querySelector("#ticker-loop-primary"),G=n.querySelector("#ticker-loop-clone");U&&G&&(U.innerHTML=R,G.innerHTML=R)}catch{}}}function F(){try{if(sessionStorage.getItem("hongtai_ticker_dismissed")==="true"){const i=document.getElementById("home-announcement-ticker")||document.querySelector(".announcement-ticker-bar");i&&(i.style.display="none");return}}catch{}const t=document.getElementById("home-announcement-ticker")||document.querySelector(".announcement-ticker-bar");t&&v(t,!1)}function D(){if(c){a(),setTimeout(a,350);return}F();const t=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html");t&&window.innerWidth>=768&&(document.body.classList.remove("sidebar-collapsed"),localStorage.setItem("sidebar_collapsed","false"));let i=document.querySelector(".sidebar-backdrop");if(i?t&&i.classList.add("on-index"):(i=document.createElement("div"),i.className="sidebar-backdrop"+(t?" on-index":""),i.id="global-sidebar-backdrop",document.body.appendChild(i)),i.addEventListener("click",function(P){window.closeGlobalSidebar()}),!document.querySelector(".app-sidebar")&&!t){const P=document.createElement("div");P.id="global-sidebar-mount",P.innerHTML=H(),document.body.insertBefore(P.firstElementChild,document.body.firstChild)}b(),window.addEventListener("storage",b),window.addEventListener("user-auth-changed",b),setTimeout(b,500),setTimeout(b,1500),document.querySelectorAll(".app-sidebar, .global-app-sidebar").forEach(P=>{P.addEventListener("click",B=>{B.target.closest(".user-dropdown")||document.querySelectorAll(".user-dropdown.show-menu").forEach(R=>R.classList.remove("show-menu")),B.stopPropagation()})});const p=()=>{document.querySelectorAll(".app-sidebar .sidebar-item, .global-app-sidebar .sidebar-item, .app-sidebar .sidebar-subitem, .global-app-sidebar .sidebar-subitem").forEach(P=>{P.classList.contains("sidebar-dropdown-toggle")||(P.style.pointerEvents="auto",P.addEventListener("click",()=>{window.innerWidth<=900&&setTimeout(()=>{window.closeGlobalSidebar()},120)}))})};p(),setTimeout(p,600);const x=document.getElementById("menu-bubble-widget");if(x&&x.remove(),!(window.location.pathname==="/"||window.location.pathname.endsWith("/index.html")||window.location.pathname==="")){const P=document.getElementById("floating-theme-widget");P&&P.remove()}Y(),setTimeout(Y,300);const V=()=>{document.querySelectorAll(".menu-toggle-btn, .global-hamburger-btn, .sidebar-open-btn, .top-menu-btn, #top-sidebar-toggle-btn, #sidebar-expand-float-btn, .sidebar-expand-float-btn, #mobile-nav-toggle-btn, .topbar-comic-menu-btn, #mobile-sidebar-toggle-btn, .setup-menu-toggle-btn").forEach(P=>{P.onclick=function(B){B&&(B.stopPropagation(),typeof B.preventDefault=="function"&&B.preventDefault()),window.toggleGlobalSidebar()}}),document.querySelectorAll(".sidebar-toggle-btn").forEach(P=>{P.onclick=function(B){B&&(B.stopPropagation(),typeof B.preventDefault=="function"&&B.preventDefault()),window.innerWidth<=900?window.closeGlobalSidebar():window.toggleSidebarCollapse?window.toggleSidebarCollapse():window.closeGlobalSidebar()}})};V(),setTimeout(V,500),setTimeout(V,1200),$(),setTimeout($,150),setTimeout($,600),setTimeout($,1500),setTimeout(O,800),a(),setTimeout(a,350),X(),setTimeout(X,600)}const _={bars:'<svg class="header-svg-icon" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3.5" y1="6" x2="20.5" y2="6"></line><line x1="3.5" y1="12" x2="20.5" y2="12"></line><line x1="3.5" y1="18" x2="20.5" y2="18"></line></svg>',snowflake:(t=!0)=>`<svg class="header-svg-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="${t?"#38bdf8":"#94a3b8"}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="${t?"":"opacity: 0.4;"}"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line><line x1="4.93" y1="19.07" x2="19.07" y2="4.93"></line><polyline points="9 3.5 12 6.5 15 3.5"></polyline><polyline points="9 20.5 12 17.5 15 20.5"></polyline><polyline points="3.5 9 6.5 12 3.5 15"></polyline><polyline points="20.5 9 17.5 12 20.5 15"></polyline></svg>`,sun:'<svg class="header-svg-icon icon-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"></circle><line x1="12" y1="1.5" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22.5"></line><line x1="4.22" y1="4.22" x2="6" y2="6"></line><line x1="18" y1="18" x2="19.78" y2="19.78"></line><line x1="1.5" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22.5" y2="12"></line><line x1="4.22" y1="19.78" x2="6" y2="18"></line><line x1="18" y1="6" x2="19.78" y2="4.22"></line></svg>',moon:'<svg class="header-svg-icon icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',home:'<svg class="header-svg-icon icon-home" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20v-9.5z"></path><polyline points="9 21 9 12 15 12 15 21"></polyline></svg>'};function $(){const t=document.documentElement.classList.contains("light-mode")||document.documentElement.classList.contains("light"),i=localStorage.getItem("particles_enabled")!=="false";document.querySelectorAll(".global-hamburger-btn, #mobile-nav-toggle-btn, #top-sidebar-toggle-btn").forEach(n=>{n.querySelector("svg.header-svg-icon")||(n.innerHTML=_.bars)}),document.querySelectorAll('.rank-nav-btn, .btn-home, a.header-icon-btn[href="/"], a.header-icon-btn[href="/index.html"], a.header-icon-btn[title="Trang chủ"]').forEach(n=>{n.querySelector("svg.header-svg-icon")||(n.innerHTML=_.home)}),document.querySelectorAll("#particle-toggle-btn, .particle-toggle-btn").forEach(n=>{n.querySelector("svg.header-svg-icon")||(n.innerHTML=_.snowflake(i))}),document.querySelectorAll(".theme-toggle-btn, #theme-toggle-btn, .rank-theme-btn, #floating-theme-toggle-btn").forEach(n=>{n.querySelector("svg.header-svg-icon")||(n.innerHTML=t?_.moon:_.sun,n.setAttribute("title",t?"Chuyển sang Chế độ Tối":"Chuyển sang Chế độ Sáng"))})}window.ensureHeaderButtonSVGs=$;function K(t){const i=t?"url('/assets/app_bg_night_v3.png')":"url('/assets/app_bg_day_v3.png')";document.documentElement.style.setProperty("background-image",i,"important"),document.documentElement.style.setProperty("background-size","cover","important"),document.documentElement.style.setProperty("background-position","center center","important"),document.documentElement.style.setProperty("background-attachment","fixed","important"),document.documentElement.style.setProperty("background-repeat","no-repeat","important"),t?(document.documentElement.classList.add("dark"),document.documentElement.classList.remove("light","light-mode"),document.body&&(document.body.classList.remove("light","light-mode"),document.body.classList.add("dark"),document.body.style.setProperty("background-image",i,"important"),document.body.style.setProperty("background-size","cover","important"),document.body.style.setProperty("background-position","center center","important"),document.body.style.setProperty("background-attachment","fixed","important"),document.body.style.setProperty("background-repeat","no-repeat","important"))):(document.documentElement.classList.remove("dark"),document.documentElement.classList.add("light","light-mode"),document.body&&(document.body.classList.remove("dark"),document.body.classList.add("light-mode"),document.body.style.setProperty("background-image",i,"important"),document.body.style.setProperty("background-size","cover","important"),document.body.style.setProperty("background-position","center center","important"),document.body.style.setProperty("background-attachment","fixed","important"),document.body.style.setProperty("background-repeat","no-repeat","important")));const n=!t,p=t?'<i class="fa-solid fa-moon"></i>':'<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>';document.querySelectorAll(".theme-toggle-btn, #theme-toggle-btn, #floating-theme-toggle-btn, .rank-theme-btn, #theme-toggle, .theme-toggle-btn-top, .rd-theme-btn, .btn-theme-toggle").forEach(x=>{typeof _<"u"&&_&&_.moon&&(x.querySelector("svg")||x.classList.contains("header-icon-btn")||x.classList.contains("theme-toggle-btn-top")||x.classList.contains("rd-theme-btn"))?x.innerHTML=n?_.moon:_.sun:x.innerHTML=p,x.setAttribute("title",t?"Chuyển sang Chế độ Sáng":"Chuyển sang Chế độ Tối")})}window.applyGlobalTheme=K;function A(){const t=Date.now();if(window.__lastThemeToggleTime&&t-window.__lastThemeToggleTime<320)return;window.__lastThemeToggleTime=t;const n=!(document.documentElement.classList.contains("dark")||!document.documentElement.classList.contains("light-mode"));localStorage.setItem("theme",n?"dark":"light"),K(n),typeof window.showToast=="function"&&window.showToast(n?"Đã chuyển sang Chế độ Tối 🌙":"Đã chuyển sang Chế độ Sáng ☀️")}window.toggleTheme=A,window.initTheme=function(){const t=localStorage.getItem("theme")||"dark";K(t!=="light")},window.initTheme(),document.readyState==="loading"&&document.addEventListener("DOMContentLoaded",window.initTheme);const W=window.updateToggleBtns;window.updateToggleBtns=function(t){if(typeof W=="function")try{W(t)}catch{}const i=!t,n=i?'<i class="fa-solid fa-moon"></i>':'<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>';document.querySelectorAll(".theme-toggle-btn, #theme-toggle-btn, #floating-theme-toggle-btn, .rank-theme-btn, #theme-toggle, .theme-toggle-btn-top, .rd-theme-btn, .btn-theme-toggle").forEach(p=>{typeof _<"u"&&_&&_.moon&&(p.querySelector("svg")||p.classList.contains("header-icon-btn")||p.classList.contains("theme-toggle-btn-top")||p.classList.contains("rd-theme-btn"))?p.innerHTML=t?_.moon:_.sun:p.innerHTML=n,p.setAttribute("title",i?"Chuyển sang Chế độ Sáng":"Chuyển sang Chế độ Tối")})},document.addEventListener("click",t=>{t.target.closest("#theme-toggle-btn, #floating-theme-toggle-btn, .theme-toggle-btn, .rank-theme-btn, #theme-toggle, .theme-toggle-btn-top, .rd-theme-btn")&&A()});function O(){if(!(document.fonts&&document.fonts.check?document.fonts.check('16px "Font Awesome 6 Free"'):!0)&&!document.querySelector('link[data-fa-fallback="true"]')){const i=document.createElement("link");i.rel="stylesheet",i.setAttribute("data-fa-fallback","true"),i.href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css",document.head.appendChild(i)}}function X(){document.querySelectorAll(".app-sidebar a, .global-app-sidebar a, .app-sidebar .sidebar-item, .global-app-sidebar .sidebar-item, .app-sidebar .sidebar-subitem, .global-app-sidebar .sidebar-subitem").forEach(t=>{if(t.classList.contains("sidebar-dropdown-toggle"))return;const i=t.getAttribute("href")||t.getAttribute("onclick")||"";i.includes(".html")&&!i.includes("index.html")&&t.addEventListener("click",p=>{if(!y()){p.preventDefault(),p.stopPropagation();const x=t.textContent.trim().split(`
`)[0]||"tính năng này";T({isMandatoryPageLock:!1,actionName:x,title:`Đăng Nhập Để Dùng: ${x}`,desc:`Vui lòng đăng nhập với tài khoản Google để sử dụng tính năng <strong>${x}</strong>.`})}},!0)})}document.addEventListener("click",function(t){if(!(window.location.pathname==="/"||window.location.pathname.endsWith("/index.html")||window.location.pathname==="")&&!y()){if(t.target.closest("#global-auth-required-modal, .global-hamburger-btn, .menu-toggle-btn, #mobile-nav-toggle-btn, .app-sidebar, .global-sidebar-drawer, #global-sidebar-mount, .sidebar-backdrop, #sidebar-expand-float-btn"))return;t.preventDefault(),t.stopPropagation(),T({isMandatoryPageLock:!0})}},!0);function Y(){const t=document.querySelector(".global-hamburger-btn, #mobile-nav-toggle-btn, #top-sidebar-toggle-btn, #mobile-sidebar-toggle-btn");if(t){t.onclick=function(n){n&&(n.stopPropagation(),typeof n.preventDefault=="function"&&n.preventDefault()),window.toggleGlobalSidebar()};return}const i=[{container:".navbar .nav-container",insertBefore:".nav-brand"},{container:".app-top-nav-inner > div:first-child",insertBefore:":first-child"},{container:".reorder-header-inner > div:first-child",insertBefore:":first-child"},{container:".diag-header-inner > div:first-child",insertBefore:":first-child"},{container:".top-bar",insertBefore:":first-child"},{container:".rd-header-left",insertBefore:".rd-back-btn"},{container:".dict-top-nav",insertBefore:".dict-brand"},{container:".rank-header-nav",insertBefore:".rank-brand-logo"},{container:".header-title-wrap",insertBefore:".back-btn"},{container:".phonetics-header .brand-box",insertBefore:":first-child"},{container:".hanzi-header .brand-box",insertBefore:":first-child"},{container:".grammar-header .brand-box",insertBefore:":first-child"},{container:".header-card > div:first-child",insertBefore:":first-child"},{container:".header-panel .logo",insertBefore:":first-child"},{container:".rules-header .rules-title-group",insertBefore:":first-child"},{container:".topbar-left-cluster",insertBefore:":first-child"}];for(const n of i){const p=document.querySelector(n.container);if(p){if(p.querySelector(".global-hamburger-btn, .menu-toggle-btn, #sidebar-expand-float-btn, #mobile-sidebar-toggle-btn"))break;const x=document.createElement("button");if(x.className="header-icon-btn global-hamburger-btn",x.id="global-hamburger-btn",x.title="Mở Menu Danh Mục",x.setAttribute("aria-label","Mở Menu Danh Mục"),x.innerHTML=_.bars,x.onclick=function(q){q&&(q.stopPropagation(),typeof q.preventDefault=="function"&&q.preventDefault()),window.toggleGlobalSidebar()},n.insertBefore===":first-child")p.insertBefore(x,p.firstChild);else{const q=p.querySelector(n.insertBefore);q?p.insertBefore(x,q):p.insertBefore(x,p.firstChild)}break}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",D):D()})();
