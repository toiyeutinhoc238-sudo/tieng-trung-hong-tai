import{h as nt}from"./vendor-BfYXEYrK.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const g of o.addedNodes)g.tagName==="LINK"&&g.rel==="modulepreload"&&a(g)}).observe(document,{childList:!0,subtree:!0});function s(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(n){if(n.ep)return;n.ep=!0;const o=s(n);fetch(n.href,o)}})();const X="__hongtai_seasonal_particles__";function et(){return window[X]||(window[X]={canvas:null,ctx:null,width:0,height:0,dpr:1,particles:[],animFrameId:null,lastTime:0,season:"autumn",isInitialized:!1,resizeTimer:null,lastWidth:0,lastHeight:0}),window[X]}function j(){if(window.self!==window.top)return;const c=et();if(c.isInitialized&&c.animFrameId)return;let e=document.getElementById("seasonal-particle-canvas");e?(e.style.position="fixed",e.style.inset="0",e.style.width="100%",e.style.height="100%",e.style.pointerEvents="none",e.style.zIndex="1",e.style.webkitBackfaceVisibility="hidden",e.style.backfaceVisibility="hidden"):(e=document.createElement("canvas"),e.id="seasonal-particle-canvas",e.style.cssText="position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; -webkit-backface-visibility: hidden; backface-visibility: hidden;",document.body?document.body.insertBefore(e,document.body.firstChild):document.addEventListener("DOMContentLoaded",()=>{document.getElementById("seasonal-particle-canvas")||document.body.insertBefore(e,document.body.firstChild)})),c.canvas=e;const s=e.getContext("2d",{alpha:!0});if(!s)return;c.ctx=s;const a=new Date().getMonth()+1;let n="autumn";a>=1&&a<=3?n="spring":a>=4&&a<=6?n="summer":a>=7&&a<=9?n="autumn":n="winter",window.location.pathname.includes("documents")&&(n="winter"),c.season=n;const o=(w=!1)=>{if(!c.canvas)return;const E=window.innerWidth||document.documentElement.clientWidth||360,q=window.innerHeight||document.documentElement.clientHeight||640,v=E<768;if(!w&&v&&c.lastWidth>0){const I=Math.abs(E-c.lastWidth),u=Math.abs(q-c.lastHeight);if(I<10&&u<140)return}c.lastWidth=E,c.lastHeight=q,c.width=E,c.height=q;const k=Math.min(window.devicePixelRatio||1,2);c.dpr=k,c.canvas.width=Math.floor(E*k),c.canvas.height=Math.floor(q*k),c.canvas.style.width=E+"px",c.canvas.style.height=q+"px",c.ctx.setTransform(k,0,0,k,0,0)};o(!0),window.addEventListener("resize",()=>{c.resizeTimer&&clearTimeout(c.resizeTimer),c.resizeTimer=setTimeout(()=>{o(!1)},150)},{passive:!0});const g=c.width<768,m=g?12:20;c.particles=[];for(let w=0;w<m;w++){const E=w%3===0;c.particles.push({baseX:Math.random()*c.width,x:0,y:Math.random()*(c.height+60)-30,size:n==="winter"?Math.random()*3.2+2:g?Math.random()*4.5+4:Math.random()*5.5+5,speedY:n==="winter"?Math.random()*.5+.3:Math.random()*.55+.35,swayAmp:Math.random()*25+15,swayFreq:Math.random()*.012+.008,phase:Math.random()*Math.PI*2,baseRotation:Math.random()*360,rotSpeed:(Math.random()-.5)*.4,opacity:g?Math.random()*.3+.35:Math.random()*.35+.4,colorType:w%4,shape:E?"leaf_maple":"leaf_petal"})}function y(w){if(localStorage.getItem("particles_enabled")==="false"||document.hidden){c.ctx&&c.ctx.clearRect(0,0,c.width,c.height),c.animFrameId=null;return}c.lastTime||(c.lastTime=w);const E=w-c.lastTime;c.lastTime=w;const q=Math.min(Math.max(E/16.667,.3),1.8),v=c.width,k=c.height,I=c.season,u=c.ctx;u.clearRect(0,0,v,k);const d=c.particles.length;for(let f=0;f<d;f++){const l=c.particles[f];l.y+=l.speedY*q;const _=Math.sin(l.y*l.swayFreq+l.phase)*l.swayAmp;if(l.x=l.baseX+_,l.baseRotation+=l.rotSpeed*q,l.y>k+35&&(l.y=-35,l.baseX=Math.random()*v,l.phase=Math.random()*Math.PI*2),l.baseX>v+40&&(l.baseX=-30),l.baseX<-40&&(l.baseX=v+30),u.save(),u.translate(l.x,l.y),I==="autumn"){const S=l.baseRotation*Math.PI/180+Math.sin(l.y*.015+l.phase)*.35,T=Math.cos(l.y*.018+l.phase);u.rotate(S),u.scale(T,1),u.globalAlpha=l.opacity;let M="#f59e0b";if(l.colorType===1?M="#ea580c":l.colorType===2?M="#e11d48":l.colorType===3&&(M="#d97706"),u.fillStyle=M,u.beginPath(),l.shape==="leaf_maple"){const b=l.size;u.moveTo(0,-b),u.quadraticCurveTo(b*.45,-b*.3,b*.7,-b*.1),u.quadraticCurveTo(b*.35,b*.2,b*.4,b*.7),u.quadraticCurveTo(0,b*.4,-b*.4,b*.7),u.quadraticCurveTo(-b*.35,b*.2,-b*.7,-b*.1),u.quadraticCurveTo(-b*.45,-b*.3,0,-b)}else{const b=l.size;u.moveTo(0,-b),u.bezierCurveTo(b*.55,-b*.4,b*.55,b*.4,0,b),u.bezierCurveTo(-b*.55,b*.4,-b*.55,-b*.4,0,-b)}u.fill()}else if(I==="winter")if(u.rotate(l.baseRotation*Math.PI/180),u.globalAlpha=l.opacity,l.shape==="leaf_maple"){u.strokeStyle="rgba(255, 255, 255, 0.9)",u.lineWidth=Math.max(1,l.size*.2),u.lineCap="round",u.beginPath();for(let S=0;S<6;S++)u.moveTo(0,0),u.lineTo(0,l.size),u.moveTo(0,l.size*.55),u.lineTo(l.size*.25,l.size*.75),u.moveTo(0,l.size*.55),u.lineTo(-l.size*.25,l.size*.75),u.rotate(Math.PI/3);u.stroke()}else{const S=u.createRadialGradient(0,0,0,0,0,l.size);S.addColorStop(0,"rgba(255, 255, 255, 0.95)"),S.addColorStop(.4,"rgba(224, 242, 254, 0.75)"),S.addColorStop(1,"rgba(255, 255, 255, 0)"),u.fillStyle=S,u.beginPath(),u.arc(0,0,l.size,0,Math.PI*2),u.fill()}else if(I==="spring"){const S=l.baseRotation*Math.PI/180;u.rotate(S),u.scale(Math.cos(l.y*.02+l.phase),1),u.globalAlpha=l.opacity,u.fillStyle="rgba(255, 183, 197, 0.85)",u.beginPath(),u.ellipse(0,0,l.size,l.size*.55,0,0,Math.PI*2),u.fill()}else if(I==="summer"){const S=l.baseRotation*Math.PI/180;u.rotate(S),u.scale(Math.cos(l.y*.02+l.phase),1),u.globalAlpha=l.opacity,u.fillStyle="rgba(74, 222, 128, 0.8)",u.beginPath(),u.ellipse(0,0,l.size,l.size*.45,.3,0,Math.PI*2),u.fill()}u.restore()}c.animFrameId=requestAnimationFrame(y)}function x(){c.animFrameId&&(cancelAnimationFrame(c.animFrameId),c.animFrameId=null),localStorage.getItem("particles_enabled")!=="false"&&!document.hidden&&(c.lastTime=performance.now(),c.animFrameId=requestAnimationFrame(y))}c.startLoop=x,c.isInitialized=!0;const p=localStorage.getItem("particles_enabled")!=="false";e&&(e.style.display=p?"block":"none"),p&&x(),document.addEventListener("visibilitychange",()=>{document.hidden?c.animFrameId&&(cancelAnimationFrame(c.animFrameId),c.animFrameId=null):x()}),window.startParticleLoop=x}window.initSeasonalParticles=j;window.updateParticleToggleBtns=function(c){const e=document.querySelectorAll("#particle-toggle-btn, .particle-toggle-btn"),s=`<svg class="header-svg-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="${c?"#38bdf8":"#94a3b8"}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="${c?"":"opacity: 0.4;"}"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line><line x1="4.93" y1="19.07" x2="19.07" y2="4.93"></line><polyline points="9 3.5 12 6.5 15 3.5"></polyline><polyline points="9 20.5 12 17.5 15 20.5"></polyline><polyline points="3.5 9 6.5 12 3.5 15"></polyline><polyline points="20.5 9 17.5 12 20.5 15"></polyline></svg>`;e.forEach(a=>{c?(a.classList.remove("particles-off"),a.innerHTML=s,a.title="Tắt hiệu ứng mùa rơi (Đang BẬT)"):(a.classList.add("particles-off"),a.innerHTML=s,a.title="Bật hiệu ứng mùa rơi (Đang TẮT)")})};function it(){const c=Date.now();if(window.__lastParticleToggleTime&&c-window.__lastParticleToggleTime<320)return;window.__lastParticleToggleTime=c;const s=!(localStorage.getItem("particles_enabled")!=="false");localStorage.setItem("particles_enabled",s?"true":"false"),typeof window.updateParticleToggleBtns=="function"&&window.updateParticleToggleBtns(s);const a=document.getElementById("seasonal-particle-canvas");a&&(a.style.display=s?"block":"none");const n=et();s?typeof n.startLoop=="function"?n.startLoop():typeof window.startParticleLoop=="function"&&window.startParticleLoop():(n.animFrameId&&(cancelAnimationFrame(n.animFrameId),n.animFrameId=null),n.ctx&&n.width&&n.height&&n.ctx.clearRect(0,0,n.width,n.height)),typeof window.showToast=="function"&&window.showToast(s?"Đã bật hiệu ứng mùa rơi ❄️":"Đã tắt hiệu ứng mùa rơi để tăng tốc độ ⚡")}window.toggleSeasonalParticles=it;document.addEventListener("click",c=>{c.target.closest("#particle-toggle-btn, .particle-toggle-btn")&&it()});(function(){if(window.__hasMainStudyTimer)return;let e=0;const s=window.location.origin.includes("5173")?"http://localhost:5000":window.location.origin;function a(n){if(!n||n<=0)return;const o=new Date().toLocaleDateString("sv");let g="guest";try{const y=localStorage.getItem("user");if(y){const x=JSON.parse(y);x&&x.email&&(g=x.email)}}catch{}const m=g!=="guest"?`daily_study_history_${g}`:"daily_study_history_guest";try{const y=localStorage.getItem(m),x=y?JSON.parse(y):{};x[o]=(x[o]||0)+n,localStorage.setItem(m,JSON.stringify(x));const p=g!=="guest"?`user_stats_${g}`:"user_stats_guest",w=localStorage.getItem(p),E=w?JSON.parse(w):{streak:0,studyTime:0};E.studyTime=(E.studyTime||0)+n,localStorage.setItem(p,JSON.stringify(E))}catch{}}setInterval(()=>{if(!window.__hasMainStudyTimer&&document.hasFocus()&&(e++,e>=15)){const n=e;e=0;const o=new Date().toLocaleDateString("sv");a(n);const g=localStorage.getItem("session_token"),m={"Content-Type":"application/json"};g&&(m.Authorization=`Bearer ${g}`,m["x-session-token"]=g),fetch(s+"/api/user/stats/sync",{method:"POST",headers:m,body:JSON.stringify({incrementStudyTime:n,localDateStr:o}),credentials:"include"}).then(y=>y.ok?y.json():null).then(y=>{if(y&&y.dailyHistory){let x=null;try{const p=localStorage.getItem("user");if(p){const w=JSON.parse(p);w&&w.email&&(x=w.email)}}catch{}if(x)try{localStorage.setItem(`daily_study_history_${x}`,JSON.stringify(y.dailyHistory)),localStorage.setItem(`user_stats_${x}`,JSON.stringify({streak:y.streak,studyTime:y.studyTime}))}catch{}}}).catch(()=>{})}},1e3)})();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{j();const c=localStorage.getItem("particles_enabled")!=="false";window.updateParticleToggleBtns&&window.updateParticleToggleBtns(c)});else{j();const c=localStorage.getItem("particles_enabled")!=="false";window.updateParticleToggleBtns&&window.updateParticleToggleBtns(c)}class tt{constructor(){this.isActive=!1,this.isDrawing=!1,this.mode="pen",this.color="#ef4444",this.lineWidth=4,this.highlighterWidth=28,this.laserWidth=16,this.eraserWidth=28,this.history=[],this.redoStack=[],this.maxHistory=20,this.laserTrails=[],this.laserAnimFrame=null,this.isVisible=!0,this.canvas=null,this.ctx=null,this.bubble=null,this.toolbar=null,this.eraserCursor=null,this.lastX=0,this.lastY=0,this.isDraggingBubble=!1,this.isDraggingToolbar=!1,this.init()}init(){window.self===window.top&&(document.getElementById("screen-drawing-canvas-overlay")||(this.createCanvas(),this.createFloatingBubble(),this.createToolbar(),this.bindEvents(),this.initHotkeys(),window.screenDrawingTool=this,window.toggleScreenDrawing=e=>this.toggle(e),window.clearScreenDrawing=()=>this.clear(),window.setScreenDrawingMode=e=>this.setMode(e),window.setScreenDrawingColor=e=>this.setColor(e),window.setScreenDrawingWidth=e=>this.setWidth(e)))}createCanvas(){this.canvas=document.createElement("canvas"),this.canvas.id="screen-drawing-canvas-overlay",this.canvas.className="screen-drawing-canvas",document.body.appendChild(this.canvas),this.ctx=this.canvas.getContext("2d",{willReadFrequently:!0}),this.resizeCanvas(),window.addEventListener("resize",()=>this.resizeCanvas()),window.addEventListener("orientationchange",()=>setTimeout(()=>this.resizeCanvas(),120)),window.visualViewport&&(window.visualViewport.addEventListener("resize",()=>this.resizeCanvas()),window.visualViewport.addEventListener("scroll",()=>this.resizeCanvas()))}resizeCanvas(){if(!this.canvas)return;const e=this.canvas.getBoundingClientRect(),s=Math.max(window.innerWidth,Math.round(e.width||0),document.documentElement.clientWidth||0),a=Math.max(window.innerHeight,Math.round(e.height||0),document.documentElement.clientHeight||0);if(this.canvas.width===s&&this.canvas.height===a)return;let n=null;this.canvas.width>0&&this.canvas.height>0&&(n=document.createElement("canvas"),n.width=this.canvas.width,n.height=this.canvas.height,n.getContext("2d").drawImage(this.canvas,0,0)),this.canvas.width=s,this.canvas.height=a,this.canvas.style.width="100vw",this.canvas.style.height="100vh",this.ctx.lineCap="round",this.ctx.lineJoin="round",n&&this.ctx.drawImage(n,0,0,n.width,n.height,0,0,s,a)}createFloatingBubble(){this.bubble=document.createElement("div"),this.bubble.id="screen-pen-floating-bubble",this.bubble.className="screen-pen-floating-bubble",this.bubble.title="Bật/Tắt Bút viết tay lên màn hình (Phím D)",this.bubble.innerHTML=`
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
    `,document.body.appendChild(this.toolbar)}bindEvents(){this.bubble.addEventListener("click",p=>{p.stopPropagation(),this.toggle()}),this.bubble.addEventListener("touchend",p=>{p.preventDefault(),p.stopPropagation(),this.toggle()},{passive:!1});const e=this.toolbar.querySelector(".dt-drag-handle");this.makeDraggable(this.toolbar,e),this.toolbar.querySelectorAll(".dt-modes .dt-btn").forEach(p=>{p.addEventListener("click",w=>{w.stopPropagation(),this.setMode(p.dataset.mode)})}),this.toolbar.querySelectorAll(".dt-color-btn").forEach(p=>{p.addEventListener("click",w=>{w.stopPropagation(),this.setColor(p.dataset.color)})}),this.toolbar.querySelectorAll(".dt-size-btn").forEach((p,w)=>{p.addEventListener("click",E=>{if(E.stopPropagation(),this.mode==="pen"){const q=[3,6,12,24];this.setWidth(q[w])}else if(this.mode==="highlighter"){const q=[15,28,48,80];this.setHighlighterWidth(q[w])}else if(this.mode==="laser"){const q=[8,16,30,50];this.setLaserWidth(q[w])}else if(this.mode==="eraser"){const q=[12,28,56,110];this.setEraserWidth(q[w])}})});const s=document.getElementById("dt-undo-btn");s&&s.addEventListener("click",p=>{p.stopPropagation(),this.undo()});const a=document.getElementById("dt-redo-btn");a&&a.addEventListener("click",p=>{p.stopPropagation(),this.redo()});const n=document.getElementById("dt-clear-btn");n&&n.addEventListener("click",p=>{p.stopPropagation(),this.clear()});const o=document.getElementById("dt-vis-btn");o&&o.addEventListener("click",p=>{p.stopPropagation(),this.toggleVisibility()});const g=document.getElementById("dt-save-btn");g&&g.addEventListener("click",p=>{p.stopPropagation(),this.saveImage()});const m=document.getElementById("dt-close-btn");m&&m.addEventListener("click",p=>{p.stopPropagation(),this.toggle(!1)});const y=document.getElementById("dt-custom-color-input"),x=document.getElementById("dt-custom-color-preview");y&&(y.addEventListener("input",p=>{const w=p.target.value;this.setColor(w),this.toolbar.querySelectorAll(".dt-color-btn").forEach(E=>E.classList.remove("active")),x&&(x.style.background=w,x.innerHTML="")}),y.addEventListener("change",p=>{const w=p.target.value;this.setColor(w),this.toolbar.querySelectorAll(".dt-color-btn").forEach(E=>E.classList.remove("active")),x&&(x.style.background=w,x.innerHTML="")})),x&&x.addEventListener("click",p=>{p.stopPropagation(),y&&y.click()}),this.canvas.addEventListener("pointerdown",p=>this.handlePointerStart(p)),this.canvas.addEventListener("pointermove",p=>{this.updateEraserCursorPos(p),this.handlePointerMove(p)}),this.canvas.addEventListener("pointerup",p=>this.handlePointerEnd(p)),this.canvas.addEventListener("pointercancel",p=>this.handlePointerEnd(p)),this.canvas.addEventListener("pointerleave",p=>{this.eraserCursor&&(this.eraserCursor.style.display="none"),this.handlePointerEnd(p)})}makeDraggable(e,s,a,n){let g=0,m=0,y=0,x=0,p=!1,w=!1;const E=k=>{if(k.target.closest("button")&&s!==e)return;p=!0,w=!1;const I=k.clientX||k.touches&&k.touches[0].clientX,u=k.clientY||k.touches&&k.touches[0].clientY;g=I,m=u;const d=e.getBoundingClientRect();y=d.left,x=d.top,document.addEventListener("pointermove",q),document.addEventListener("pointerup",v)},q=k=>{if(!p)return;const I=k.clientX||k.touches&&k.touches[0].clientX,u=k.clientY||k.touches&&k.touches[0].clientY,d=I-g,f=u-m,l=Math.sqrt(d*d+f*f);if(!w&&l<8)return;w||(w=!0,e.style.right="auto",e.style.bottom="auto",e.style.left=y+"px",e.style.top=x+"px",a&&a());const _=Math.max(10,Math.min(window.innerWidth-e.offsetWidth-10,y+d)),S=Math.max(10,Math.min(window.innerHeight-e.offsetHeight-10,x+f));e.style.left=_+"px",e.style.top=S+"px"},v=()=>{p&&(p=!1,document.removeEventListener("pointermove",q),document.removeEventListener("pointerup",v),w&&n&&n(),w=!1)};s.addEventListener("pointerdown",E)}toggle(e){const s=typeof e=="boolean"?e:!this.isActive;if(s&&typeof window.isUserLoggedIn=="function"&&!window.isUserLoggedIn()){typeof window.openLoginPrompt=="function"&&window.openLoginPrompt("sử dụng Bút vẽ màn hình");return}this.isActive=s,this.canvas.classList.toggle("active",this.isActive),this.bubble.classList.toggle("active",this.isActive),this.toolbar.classList.toggle("active",this.isActive),this.toolbar.style.display=this.isActive?"flex":"none",document.body.classList.toggle("screen-drawing-active",this.isActive),this.isActive&&(this.resizeCanvas(),this.showToast("✏️ Đã BẬT Bút vẽ màn hình! Bạn có thể viết, vẽ hoặc ghi chú tự do."))}setMode(e){this.mode=e,this.toolbar.querySelectorAll(".dt-modes .dt-btn").forEach(s=>{s.classList.toggle("active",s.dataset.mode===e)}),this.canvas.setAttribute("data-mode",e),this.updateSizeButtonsUI(),e!=="eraser"&&this.eraserCursor&&(this.eraserCursor.style.display="none")}setColor(e){this.color=e,this.toolbar.querySelectorAll(".dt-color-btn").forEach(n=>{n.classList.toggle("active",n.dataset.color===e)});const s=document.getElementById("dt-custom-color-preview"),a=document.getElementById("dt-custom-color-input");s&&this.toolbar.querySelector(`.dt-color-btn[data-color="${e}"]`)&&(s.style.background="conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",s.innerHTML='<i class="fa-solid fa-palette" style="font-size:0.72rem; color:#fff; text-shadow:0 1px 3px rgba(0,0,0,0.8);"></i>'),a&&(a.value=e),this.mode==="eraser"&&this.setMode("pen")}setWidth(e){this.lineWidth=e,this.updateSizeButtonsUI()}setHighlighterWidth(e){this.highlighterWidth=e,this.updateSizeButtonsUI()}setLaserWidth(e){this.laserWidth=e,this.updateSizeButtonsUI()}setEraserWidth(e){this.eraserWidth=e,this.updateSizeButtonsUI(),this.eraserCursor&&(this.eraserCursor.style.width=`${e}px`,this.eraserCursor.style.height=`${e}px`)}updateSizeButtonsUI(){const e=this.toolbar.querySelectorAll(".dt-size-btn");let s=[],a=0;this.mode==="pen"?(a=this.lineWidth,s=[{size:3,title:"Nét bút mảnh (3px)",dot:"6px"},{size:6,title:"Nét bút vừa (6px)",dot:"10px"},{size:12,title:"Nét bút dày (12px)",dot:"16px"},{size:24,title:"Nét bút cực to (24px)",dot:"22px"}]):this.mode==="highlighter"?(a=this.highlighterWidth||28,s=[{size:15,title:"Bút dạ quang mảnh (15px) - Tô gạch chân / từ",dot:"6px"},{size:28,title:"Bút dạ quang vừa (28px) - Tô cụm từ",dot:"10px"},{size:48,title:"Bút dạ quang dày (48px) - Tô nổi bật cả câu",dot:"16px"},{size:80,title:"Bút dạ quang cực to (80px) - Tô vùng lớn",dot:"22px"}]):this.mode==="laser"?(a=this.laserWidth||16,s=[{size:8,title:"Tia Laser mảnh (8px) - Chỉ điểm chi tiết",dot:"6px"},{size:16,title:"Tia Laser vừa (16px) - Chỉ điểm chuẩn",dot:"10px"},{size:30,title:"Tia Laser lớn (30px) - Nổi bật bài giảng",dot:"16px"},{size:50,title:"Tia Laser cực lớn (50px) - Gây chú ý mạnh",dot:"22px"}]):this.mode==="eraser"&&(a=this.eraserWidth||28,s=[{size:12,title:"Cục tẩy nhỏ (12px) - Xóa chi tiết nhỏ",dot:"6px"},{size:28,title:"Cục tẩy vừa (28px) - Xóa chữ / nét vựng",dot:"10px"},{size:56,title:"Cục tẩy to (56px) - Xóa vùng lớn",dot:"16px"},{size:110,title:"Cục tẩy cực to (110px) - Xóa siêu tốc",dot:"22px"}]),e.forEach((n,o)=>{const g=s[o]||s[0];n.classList.toggle("active",a===g.size),n.setAttribute("title",g.title);const m=n.querySelector("span");m&&(m.style.width=g.dot,m.style.height=g.dot)})}updateEraserCursorPos(e){this.isActive&&this.mode==="eraser"&&this.eraserCursor?(this.eraserCursor.style.display="block",this.eraserCursor.style.width=`${this.eraserWidth||28}px`,this.eraserCursor.style.height=`${this.eraserWidth||28}px`,this.eraserCursor.style.left=`${e.clientX}px`,this.eraserCursor.style.top=`${e.clientY}px`):this.eraserCursor&&(this.eraserCursor.style.display="none")}saveState(){try{const e=this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);this.history.push(e),this.history.length>this.maxHistory&&this.history.shift(),this.redoStack=[]}catch{}}undo(){if(this.history.length===0){this.clear();return}try{const e=this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);this.redoStack.push(e);const s=this.history.pop();this.ctx.putImageData(s,0,0)}catch{}}redo(){if(this.redoStack.length!==0)try{const e=this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);this.history.push(e);const s=this.redoStack.pop();this.ctx.putImageData(s,0,0)}catch{}}clear(){this.ctx&&this.canvas&&(this.saveState(),this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.laserTrails=[],this.showToast("🗑️ Đã xóa sạch nét vẽ!"))}toggleVisibility(){this.isVisible=!this.isVisible,this.canvas.style.opacity=this.isVisible?"1":"0";const e=document.getElementById("dt-vis-btn");e&&(e.innerHTML=this.isVisible?'<i class="fa-solid fa-eye"></i>':'<i class="fa-solid fa-eye-slash" style="color: #ef4444;"></i>')}playShutterSound(){try{const e=window.AudioContext||window.webkitAudioContext;if(!e)return;const s=new e,a=s.currentTime,n=s.createOscillator(),o=s.createGain();n.type="triangle",n.frequency.setValueAtTime(140,a),n.frequency.exponentialRampToValueAtTime(35,a+.05),o.gain.setValueAtTime(.35,a),o.gain.exponentialRampToValueAtTime(.01,a+.05),n.connect(o),o.connect(s.destination),n.start(a),n.stop(a+.05);const g=s.createOscillator(),m=s.createGain();g.type="square",g.frequency.setValueAtTime(750,a+.04),g.frequency.exponentialRampToValueAtTime(120,a+.12),m.gain.setValueAtTime(.25,a+.04),m.gain.exponentialRampToValueAtTime(.001,a+.12),g.connect(m),m.connect(s.destination),g.start(a+.04),g.stop(a+.12)}catch{}}triggerShutterEffect(){this.playShutterSound();let e=document.getElementById("screen-camera-flash");e||(e=document.createElement("div"),e.id="screen-camera-flash",document.body.appendChild(e)),e.style.opacity="0.9",e.style.display="block",setTimeout(()=>{e.style.opacity="0",setTimeout(()=>{e&&e.parentNode&&e.parentNode.removeChild(e)},260)},50)}saveImage(){this.startSnipping()}startSnipping(){this.cancelSnipping(),this.isSnipping=!0;const e=document.createElement("div");e.id="screen-snipping-overlay",e.innerHTML=`
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
    `,document.body.appendChild(e);let s=!1,a=0,n=0,o=null,g=null;const m=e.querySelector("#snip-mode-rect"),y=e.querySelector("#snip-mode-fullscreen"),x=e.querySelector("#snip-mode-window"),p=e.querySelector("#snip-mode-cancel");m==null||m.addEventListener("click",v=>{v.stopPropagation(),e.querySelectorAll(".snipping-mode-btn").forEach(k=>k.classList.remove("active")),m.classList.add("active")}),y==null||y.addEventListener("click",v=>{v.stopPropagation(),this.cancelSnipping(),this.captureRegion(null)}),x==null||x.addEventListener("click",v=>{v.stopPropagation(),this.cancelSnipping();const I=(document.querySelector(".hero-stage-card")||document.querySelector(".dict-main-workspace-grid")||document.querySelector(".dict-page-container")||document.querySelector(".container")||document.body).getBoundingClientRect();this.captureRegion({x:Math.max(0,I.left),y:Math.max(0,I.top),width:Math.min(window.innerWidth,I.width),height:Math.min(window.innerHeight,I.height)})}),p==null||p.addEventListener("click",v=>{v.stopPropagation(),this.cancelSnipping()});const w=v=>{v.target.closest("#snipping-top-bar")||(v.preventDefault(),v.stopPropagation(),s=!0,a=v.clientX||(v.touches&&v.touches[0]?v.touches[0].clientX:0),n=v.clientY||(v.touches&&v.touches[0]?v.touches[0].clientY:0),o||(o=document.createElement("div"),o.id="snip-selection-box",g=document.createElement("div"),g.id="snip-dim-tag",o.appendChild(g),e.appendChild(o)),o.style.left=`${a}px`,o.style.top=`${n}px`,o.style.width="0px",o.style.height="0px",o.style.display="block")},E=v=>{if(!s||!o)return;v.preventDefault(),v.stopPropagation();const k=v.clientX||(v.touches&&v.touches[0]?v.touches[0].clientX:a),I=v.clientY||(v.touches&&v.touches[0]?v.touches[0].clientY:n),u=Math.min(a,k),d=Math.min(n,I),f=Math.abs(k-a),l=Math.abs(I-n);o.style.left=`${u}px`,o.style.top=`${d}px`,o.style.width=`${f}px`,o.style.height=`${l}px`,g&&(g.textContent=`${Math.round(f)} × ${Math.round(l)} px`)},q=v=>{if(!s)return;if(s=!1,!o){this.cancelSnipping();return}const k=o.getBoundingClientRect(),I=k.width,u=k.height,d=k.left,f=k.top;this.cancelSnipping(),I>12&&u>12?this.captureRegion({x:d,y:f,width:I,height:u}):this.captureRegion(null)};e.addEventListener("mousedown",w),e.addEventListener("mousemove",E),e.addEventListener("mouseup",q),e.addEventListener("touchstart",w,{passive:!1}),e.addEventListener("touchmove",E,{passive:!1}),e.addEventListener("touchend",q,{passive:!1})}cancelSnipping(){this.isSnipping=!1;const e=document.getElementById("screen-snipping-overlay");e&&e.parentNode&&e.parentNode.removeChild(e)}async captureRegion(e=null){try{this.triggerShutterEffect();const s=window.pageXOffset||document.documentElement.scrollLeft||document.body.scrollLeft||0,a=window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0,n=window.innerWidth,o=window.innerHeight;let g=0,m=0,y=n,x=o;e&&typeof e.width=="number"&&typeof e.height=="number"&&e.width>5&&e.height>5&&(g=Math.max(0,Math.min(n-5,Math.round(e.x))),m=Math.max(0,Math.min(o-5,Math.round(e.y))),y=Math.max(5,Math.min(n-g,Math.round(e.width))),x=Math.max(5,Math.min(o-m,Math.round(e.height))));const p=this.toolbar?this.toolbar.style.display:"none",w=this.bubble?this.bubble.style.display:"none",E=this.canvas?this.canvas.style.display:"none",q=document.getElementById("screen-drawing-eraser-cursor"),v=q?q.style.display:"none";this.toolbar&&(this.toolbar.style.display="none"),this.bubble&&(this.bubble.style.display="none"),q&&(q.style.display="none"),this.canvas&&(this.canvas.style.display="none"),await new Promise(l=>setTimeout(l,60));const k=Math.min(window.devicePixelRatio||1.5,2),I=document.fullscreenElement||document.body;let u=null;try{u=await nt(I,{useCORS:!0,allowTaint:!0,backgroundColor:null,scale:k,logging:!1,x:g+s,y:m+a,width:y,height:x,scrollX:s,scrollY:a,windowWidth:document.documentElement.clientWidth||n,windowHeight:document.documentElement.clientHeight||o,ignoreElements:l=>l.id==="screen-drawing-canvas-overlay"||l.id==="screen-drawing-toolbar"||l.id==="screen-pen-floating-bubble"||l.id==="screen-drawing-eraser-cursor"||l.id==="screen-snipping-overlay"||l.id==="screen-camera-flash"||l.id==="screen-snipping-preview-widget"||l.id==="screen-drawing-toast"||l.id==="lesson-toast"||l.id==="toast"})}catch(l){console.warn("html2canvas capture error:",l)}this.toolbar&&(this.toolbar.style.display=p),this.bubble&&(this.bubble.style.display=w),q&&(q.style.display=v),this.canvas&&(this.canvas.style.display=E);const d=document.createElement("canvas");d.width=Math.round(y*k),d.height=Math.round(x*k);const f=d.getContext("2d");u&&u.width>0&&u.height>0?f.drawImage(u,0,0,u.width,u.height,0,0,d.width,d.height):(f.fillStyle="#0f172a",f.fillRect(0,0,d.width,d.height)),this.canvas&&this.canvas.width>0&&this.canvas.height>0&&f.drawImage(this.canvas,g,m,y,x,0,0,d.width,d.height),d.toBlob(async l=>{if(!l){this.showToast("Lỗi khi xuất ảnh chụp màn hình!",!0);return}const _=d.toDataURL("image/png");let S=!1;try{if(navigator.clipboard&&window.ClipboardItem){const P=new ClipboardItem({"image/png":l});await navigator.clipboard.write([P]),S=!0}}catch(P){console.warn("Clipboard write permission:",P)}const T=new Date,b=`tieng-trung-hong-tai-snip-${`${T.getFullYear()}${String(T.getMonth()+1).padStart(2,"0")}${String(T.getDate()).padStart(2,"0")}_${String(T.getHours()).padStart(2,"0")}${String(T.getMinutes()).padStart(2,"0")}${String(T.getSeconds()).padStart(2,"0")}`}.png`,B=URL.createObjectURL(l),C=document.createElement("a");C.href=B,C.download=b,document.body.appendChild(C),C.click(),document.body.removeChild(C),setTimeout(()=>URL.revokeObjectURL(B),1e4),this.showSnippingPreviewWidget(l,_,b,S),this.showToast("📸 Đã cắt và chụp vùng chọn thành công!")},"image/png")}catch(s){console.error("Capture region error:",s),this.showToast("Có lỗi xảy ra khi chụp màn hình!",!0)}}showSnippingPreviewWidget(e,s,a,n){let o=document.getElementById("screen-snipping-preview-widget");o&&o.parentNode&&o.parentNode.removeChild(o),o=document.createElement("div"),o.id="screen-snipping-preview-widget",o.innerHTML=`
      <img src="${s}" class="snip-widget-thumb" alt="Ảnh chụp màn hình">
      <div style="flex: 1; min-width: 0;">
        <div class="snip-widget-title">
          <i class="fa-solid fa-camera-retro" style="color: #38bdf8;"></i> Đã Chụp Màn Hình!
        </div>
        <div class="snip-widget-sub">
          ${n?"Đã copy vào Clipboard (<strong>Ctrl + V</strong> để dán)":"Đã lưu file ảnh về máy của bạn"}
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
    `,document.body.appendChild(o);const g=o.querySelector("#snip-copy-again-btn"),m=o.querySelector("#snip-draw-btn"),y=o.querySelector("#snip-close-widget-btn");g==null||g.addEventListener("click",async()=>{try{if(navigator.clipboard&&window.ClipboardItem){const x=new ClipboardItem({"image/png":e});await navigator.clipboard.write([x]),this.showToast("📋 Đã sao chép lại vào Clipboard! Nhấn Ctrl + V để dán")}}catch{this.showToast("Không thể sao chép vào Clipboard trên trình duyệt này",!0)}}),m==null||m.addEventListener("click",()=>{this.isActive||this.toggle(!0),o&&o.parentNode&&o.parentNode.removeChild(o)}),y==null||y.addEventListener("click",()=>{o&&o.parentNode&&o.parentNode.removeChild(o)}),clearTimeout(this._widgetTimer),this._widgetTimer=setTimeout(()=>{o&&o.parentNode&&(o.style.opacity="0",o.style.transform="translateY(20px)",o.style.transition="all 0.3s ease",setTimeout(()=>{o&&o.parentNode&&o.parentNode.removeChild(o)},300))},5500)}getCanvasPoint(e){if(!this.canvas)return{x:0,y:0};const s=this.canvas.getBoundingClientRect();let a=e.clientX,n=e.clientY;a===void 0&&e.touches&&e.touches.length>0?(a=e.touches[0].clientX,n=e.touches[0].clientY):a===void 0&&e.changedTouches&&e.changedTouches.length>0&&(a=e.changedTouches[0].clientX,n=e.changedTouches[0].clientY),a=typeof a=="number"&&!isNaN(a)?a:0,n=typeof n=="number"&&!isNaN(n)?n:0;const o=s.width&&s.width>0?this.canvas.width/s.width:1,g=s.height&&s.height>0?this.canvas.height/s.height:1;return{x:(a-s.left)*o,y:(n-s.top)*g}}handlePointerStart(e){if(!this.isActive)return;e.preventDefault(),e.stopPropagation(),this.isDrawing=!0,this.saveState();const{x:s,y:a}=this.getCanvasPoint(e);if(this.lastX=s,this.lastY=a,this.mode==="laser"){this.addLaserPoint(s,a);return}this.setupContextStyles(e),this.ctx.beginPath();let n=Math.max(2,(this.lineWidth||4)/2);this.mode==="eraser"?n=(this.eraserWidth||28)/2:this.mode==="highlighter"&&(n=(this.highlighterWidth||28)/2),this.ctx.arc(s,a,n,0,Math.PI*2),this.ctx.fill()}handlePointerMove(e){if(!this.isActive||!this.isDrawing)return;e.preventDefault(),e.stopPropagation();const{x:s,y:a}=this.getCanvasPoint(e);if(this.mode==="laser"){this.addLaserPoint(s,a),this.lastX=s,this.lastY=a;return}this.setupContextStyles(e),this.ctx.beginPath(),this.ctx.moveTo(this.lastX,this.lastY),this.ctx.lineTo(s,a),this.ctx.stroke(),this.lastX=s,this.lastY=a}handlePointerEnd(e){this.isDrawing&&(e&&(e.preventDefault(),e.stopPropagation()),this.isDrawing=!1)}setupContextStyles(e){let s=this.lineWidth;e&&e.pressure&&e.pressure>0&&(s=Math.max(2,this.lineWidth*e.pressure*1.6)),this.ctx.lineCap="round",this.ctx.lineJoin="round",this.mode==="pen"?(this.ctx.globalCompositeOperation="source-over",this.ctx.strokeStyle=this.color,this.ctx.fillStyle=this.color,this.ctx.lineWidth=s,this.ctx.globalAlpha=1,this.ctx.shadowBlur=0):this.mode==="highlighter"?(this.ctx.globalCompositeOperation="source-over",this.ctx.strokeStyle=this.color,this.ctx.fillStyle=this.color,this.ctx.lineWidth=this.highlighterWidth||28,this.ctx.globalAlpha=.4,this.ctx.shadowBlur=0):this.mode==="eraser"&&(this.ctx.globalCompositeOperation="destination-out",this.ctx.lineWidth=this.eraserWidth||28,this.ctx.globalAlpha=1,this.ctx.shadowBlur=0)}addLaserPoint(e,s){this.laserTrails.push({x:e,y:s,color:this.color,width:this.laserWidth||16,createdAt:Date.now()}),this.laserAnimFrame||this.startLaserAnimation()}startLaserAnimation(){const e=()=>{const s=Date.now(),a=1200;if(this.laserTrails=this.laserTrails.filter(n=>s-n.createdAt<a),this.laserTrails.length>0){this.ctx.save(),this.ctx.globalCompositeOperation="source-over";for(let n=0;n<this.laserTrails.length;n++){const o=this.laserTrails[n],g=s-o.createdAt,m=Math.max(0,1-g/a);this.ctx.beginPath(),this.ctx.arc(o.x,o.y,o.width*(m*.7+.3),0,Math.PI*2),this.ctx.fillStyle=o.color,this.ctx.globalAlpha=m*.85,this.ctx.shadowColor=o.color,this.ctx.shadowBlur=15,this.ctx.fill()}this.ctx.restore(),this.laserAnimFrame=requestAnimationFrame(e)}else this.laserAnimFrame=null};this.laserAnimFrame=requestAnimationFrame(e)}initHotkeys(){document.addEventListener("keydown",e=>{const s=e.target&&e.target.tagName?e.target.tagName.toLowerCase():"";if(s==="input"||s==="textarea"||e.target.isContentEditable||document.querySelector(".phidao-wrapper")||document.querySelector(".snake-game-wrapper")||document.querySelector(".tone-rhythm-wrapper")||document.querySelector(".notebook-games-hub-wrapper")||document.querySelector("#game-active-viewport")||document.querySelector('#notebook-games-hub-modal[style*="display: block"]')||document.querySelector('#notebook-games-hub-modal[style*="display: flex"]')||window._activeNotebookGame)return;const a=e.key.toLowerCase();if(a==="s"&&e.shiftKey||e.key==="PrintScreen"){e.preventDefault(),this.startSnipping();return}if(e.key==="Escape"&&this.isSnipping){e.preventDefault(),this.cancelSnipping();return}a==="d"&&!e.ctrlKey&&!e.metaKey?(e.preventDefault(),this.toggle()):a==="c"&&!e.ctrlKey&&!e.metaKey&&this.isActive?(e.preventDefault(),this.clear()):a==="e"&&!e.ctrlKey&&!e.metaKey&&this.isActive?(e.preventDefault(),this.setMode("eraser")):a==="p"&&!e.ctrlKey&&!e.metaKey&&this.isActive?(e.preventDefault(),this.setMode("pen")):a==="h"&&!e.ctrlKey&&!e.metaKey&&this.isActive?(e.preventDefault(),this.setMode("highlighter")):a==="l"&&!e.ctrlKey&&!e.metaKey&&this.isActive?(e.preventDefault(),this.setMode("laser")):e.key==="Escape"&&this.isActive?(e.preventDefault(),this.toggle(!1)):a==="z"&&(e.ctrlKey||e.metaKey)&&this.isActive?(e.preventDefault(),e.shiftKey?this.redo():this.undo()):a==="y"&&(e.ctrlKey||e.metaKey)&&this.isActive&&(e.preventDefault(),this.redo())})}showToast(e,s=!1){if(typeof window.showToast=="function"){window.showToast(e,s);return}let a=document.getElementById("screen-drawing-toast");a||(a=document.createElement("div"),a.id="screen-drawing-toast",a.style.cssText="position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%) translateY(100px); background: rgba(15, 23, 42, 0.95); color: #ffffff; padding: 14px 28px; border-radius: 99px; font-weight: 700; font-size: 0.95rem; box-shadow: 0 12px 35px rgba(0,0,0,0.6); border: 1.5px solid rgba(56, 189, 248, 0.6); z-index: 99999999; opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; align-items: center; gap: 10px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); text-align: center; max-width: 90vw;",document.body.appendChild(a)),a.innerHTML=e,a.style.borderColor=s?"rgba(239, 68, 68, 0.7)":"rgba(56, 189, 248, 0.7)",a.style.opacity="1",a.style.transform="translateX(-50%) translateY(0)",clearTimeout(a._timer),a._timer=setTimeout(()=>{a.style.opacity="0",a.style.transform="translateX(-50%) translateY(100px)"},3200)}}window.self===window.top&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>new tt):new tt);let U=!1;window.toggleAppFullscreen||(window.toggleAppFullscreen=function(c){const e=!!(document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement);(typeof c=="boolean"?c:!U&&!e)?window.enterAppFullscreen&&window.enterAppFullscreen():window.exitAppFullscreen&&window.exitAppFullscreen(!0)});window.enterAppFullscreen||(window.enterAppFullscreen=function(){U=!0,document.body.classList.add("flashcard-fullscreen-mode","app-fullscreen-mode"),["flashcard-study-view","radical-study-workspace","radicals-flashcard-view","radical-detail-workspace"].forEach(e=>{const s=document.getElementById(e);s&&s.classList.add("fullscreen-flashcard-active")});const c=document.documentElement;try{!document.fullscreenElement&&!document.webkitFullscreenElement&&(c.requestFullscreen?c.requestFullscreen().catch(()=>{}):c.webkitRequestFullscreen?c.webkitRequestFullscreen():c.msRequestFullscreen&&c.msRequestFullscreen())}catch{}Y(),typeof window.showToast=="function"&&window.showToast("Đã mở toàn màn hình ⛶ (Phím Esc hoặc F để thu nhỏ)")});window.exitAppFullscreen||(window.exitAppFullscreen=function(c=!0){if(U=!1,document.body.classList.remove("flashcard-fullscreen-mode","app-fullscreen-mode"),["flashcard-study-view","radical-study-workspace","radicals-flashcard-view","radical-detail-workspace"].forEach(e=>{const s=document.getElementById(e);s&&s.classList.remove("fullscreen-flashcard-active")}),c&&!!(document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement))try{document.exitFullscreen?document.exitFullscreen().catch(()=>{}):document.webkitExitFullscreen?document.webkitExitFullscreen():document.msExitFullscreen&&document.msExitFullscreen()}catch{}Y()});function Y(){if(typeof updateFlashcardFullscreenButtons=="function"){updateFlashcardFullscreenButtons();return}const c=!!(document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement),e=U||c;document.querySelectorAll(".card-fullscreen-quick-btn, #radical-top-fullscreen-btn, #radical-fullscreen-toggle-btn").forEach(s=>{s.classList.toggle("active-fullscreen",e);const a=s.querySelector("i");a&&(a.className=`fa-solid ${e?"fa-compress":"fa-expand"}`),s.title=e?"Thu nhỏ toàn màn hình (Phím Esc)":"Phóng to toàn màn hình (Phím F)"})}["fullscreenchange","webkitfullscreenchange","mozfullscreenchange","MSFullscreenChange"].forEach(c=>{document.addEventListener(c,()=>{if(!!(document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement))Y();else{const s=window.exitFlashcardFullscreen||window.exitAppFullscreen;s&&s(!1)}})});(function(){if(window._fsDelegationRegistered)return;window._fsDelegationRegistered=!0;let e=0;const s=".card-fullscreen-quick-btn, #radical-top-fullscreen-btn, #radical-fullscreen-toggle-btn";function a(n){if(!n.target.closest(s))return;n.preventDefault(),n.stopPropagation();const g=Date.now();if(g-e<350)return;e=g;const m=window.toggleFlashcardFullscreen||window.toggleAppFullscreen;m&&m()}document.addEventListener("click",a,!0),document.addEventListener("touchend",a,{passive:!1,capture:!0}),document.addEventListener("keydown",n=>{if(document.querySelector(".phidao-wrapper")||document.querySelector(".snake-game-wrapper")||document.querySelector(".tone-rhythm-wrapper")||document.querySelector(".notebook-games-hub-wrapper")||document.querySelector("#game-active-viewport")||document.querySelector('#notebook-games-hub-modal[style*="display: block"]')||document.querySelector('#notebook-games-hub-modal[style*="display: flex"]')||window._activeNotebookGame)return;const g=!!(document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement)||U;if(n.key==="Escape"&&g){n.preventDefault();const m=window.exitFlashcardFullscreen||window.exitAppFullscreen;m&&m(!0)}if((n.key==="f"||n.key==="F")&&!n.ctrlKey&&!n.metaKey){const m=document.activeElement,y=m?m.tagName.toLowerCase():"";if(y!=="input"&&y!=="textarea"&&!m.isContentEditable){n.preventDefault();const x=window.toggleFlashcardFullscreen||window.toggleAppFullscreen;x&&x()}}if((n.key==="t"||n.key==="T")&&!n.ctrlKey&&!n.metaKey){const m=document.activeElement,y=m?m.tagName.toLowerCase():"";y!=="input"&&y!=="textarea"&&!m.isContentEditable&&typeof window.toggleLessonToolbar=="function"&&(n.preventDefault(),window.toggleLessonToolbar())}})})();(function(){const c=window.location.origin.includes("5173")?"http://localhost:5000":window.location.origin;function e(){try{const o=localStorage.getItem("user")||localStorage.getItem("hongtai_current_user")||localStorage.getItem("currentUser")||sessionStorage.getItem("user");if(o)return JSON.parse(o)}catch{}return null}function s(o={}){const g=e(),m={...o};return g&&g.token&&(m.Authorization=`Bearer ${g.token}`),m}function a(){if(window.self!==window.top||document.getElementById("chatbot-widget"))return;const o=document.createElement("div");o.className="chatbot-widget",o.id="chatbot-widget",o.innerHTML=`
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
    `,document.body.appendChild(o),n(o)}function n(o){const g=o.querySelector("#chatbot-toggle-btn"),m=o.querySelector("#chatbot-panel"),y=o.querySelector("#chatbot-close-btn"),x=o.querySelector("#chatbot-send-btn"),p=o.querySelector("#chatbot-input"),w=o.querySelector("#chatbot-messages"),E=o.querySelector("#chatbot-typing"),q=o.querySelector("#chatbot-badge"),v=o.querySelector("#chatbot-new-btn"),k=o.querySelector("#chatbot-history-btn"),I=o.querySelector("#chatbot-side-dock-btn");let u=[],d=sessionStorage.getItem("hongtai_active_thread_id")||null;localStorage.getItem("hongtai_chatbot_dock_side")==="left"&&o.classList.add("dock-left");function l(){const C=m.style.display==="none";if(C&&typeof window.isUserLoggedIn=="function"&&!window.isUserLoggedIn()){typeof window.openLoginPrompt=="function"&&window.openLoginPrompt("sử dụng Trợ lý AI");return}m.style.display=C?"flex":"none",document.body.classList.toggle("chatbot-panel-open",C),C&&(q&&(q.style.display="none"),p&&p.focus(),b())}function _(){m.style.display="none",document.body.classList.remove("chatbot-panel-open")}function S(){const C=o.classList.toggle("dock-left");localStorage.setItem("hongtai_chatbot_dock_side",C?"left":"right")}g.addEventListener("click",C=>{C.stopPropagation(),l()}),y.addEventListener("click",C=>{C.stopPropagation(),_()}),I.addEventListener("click",C=>{C.stopPropagation(),S()}),document.addEventListener("click",C=>{m&&m.style.display!=="none"&&!m.contains(C.target)&&!g.contains(C.target)&&_()}),v&&v.addEventListener("click",C=>{C.stopPropagation(),d=null,sessionStorage.removeItem("hongtai_active_thread_id"),u=[],w.innerHTML=`
          <div class="chat-message bot">
            Chào bạn! Tôi là <strong>Trợ lý AI Hongtai</strong> 🐼. Bạn cần tôi hỗ trợ giải nghĩa từ vựng HSK, sửa phát âm Pinyin hay luyện ngữ pháp tiếng Trung hôm nay không?
          </div>
        `,b()}),k&&k.addEventListener("click",C=>{C.stopPropagation(),window.location.href="/chat-history.html"}),x.addEventListener("click",B),p.addEventListener("keydown",C=>{C.key==="Enter"&&(C.preventDefault(),B())});function T(C){if(!C)return"";let H=C.replace(/^\s*\|?\s*[-:]+[-|\s:]*$/gm,"").replace(/^\s*\|\s*(.*?)\s*\|\s*$/gm,(R,W)=>{const K=W.split(/\s*\|\s*/).map(V=>V.trim()).filter(Boolean);return K.length?"• "+K.join(" — "):""}).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");return H=H.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>"),H=H.replace(/^[-•]\s+(.*)$/gm,'<div class="chat-bullet-line"><span class="chat-bullet-dot">•</span> <span>$1</span></div>'),H=H.replace(/\n{3,}/g,`

`).replace(/\n/g,"<br>"),H}function M(C,P){const H=document.createElement("div");H.className=`chat-message ${C==="assistant"?"bot":"user"}`,C==="assistant"?H.innerHTML=T(P):H.textContent=P,w.appendChild(H)}function b(){w.scrollTop=w.scrollHeight}async function B(){const C=p.value.trim();if(!C)return;if(typeof window.isUserLoggedIn=="function"&&!window.isUserLoggedIn()){typeof window.openLoginPrompt=="function"&&window.openLoginPrompt("trò chuyện với Trợ lý AI");return}p.value="",M("user",C),u.push({role:"user",content:C}),b(),E.style.display="flex",b();const P=e();try{const H={messages:u};d&&(H.threadId=d),P&&P.email&&(H.userEmail=P.email);const R=await fetch(`${c}/api/chat`,{method:"POST",headers:s({"Content-Type":"application/json"}),body:JSON.stringify(H),credentials:"include"});if(E.style.display="none",R.ok){const W=await R.json();M("assistant",W.reply||"Xin lỗi, tôi chưa thể trả lời lúc này."),u.push({role:"assistant",content:W.reply}),W.threadId&&(d=W.threadId,sessionStorage.setItem("hongtai_active_thread_id",d))}else M("assistant","⚠️ Hệ thống đang bảo trì hoặc chưa thể kết nối AI. Vui lòng thử lại sau.")}catch{E.style.display="none",M("assistant","⚠️ Lỗi kết nối mạng đến máy chủ AI.")}b()}}window.self===window.top&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",a):a()),window.mountGlobalChatbot=a})();(function(){if(window.self!==window.top||document.getElementById("quick-dict-widget"))return;let c=null,e=!1,s="",a=null,n=localStorage.getItem("hongtai_quick_dict_dock")||"right";function o(){try{const d=localStorage.getItem("hongtai_dict_history");return d?JSON.parse(d):[]}catch{return[]}}function g(d){if(d)try{let f=o().filter(l=>l!==d);f.unshift(d),f.length>8&&(f=f.slice(0,8)),localStorage.setItem("hongtai_dict_history",JSON.stringify(f)),q()}catch{}}async function m(){if(c)return c;if(e)return null;e=!0;try{const d=await fetch("/reading_vocab_dict.json");d.ok&&(c=await d.json())}catch(d){console.warn("Quick Dict: failed to load local dictionary, using API lookup",d)}finally{e=!1}return c}function y(d){return d?d.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ü/g,"v").replace(/[^a-z0-9]/g,""):""}function x(d){if(!d||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const f=new SpeechSynthesisUtterance(d);f.lang="zh-CN",f.rate=.85,window.speechSynthesis.speak(f)}const p=document.createElement("style");p.id="quick-dict-widget-styles",p.textContent=`
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
      position: absolute;
      bottom: 66px;
      right: 0;
      width: 390px;
      max-width: calc(100vw - 32px);
      max-height: 580px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 20px;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.55), 0 0 35px rgba(13, 148, 136, 0.22);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: dictFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 100000;
      color: #f8fafc;
    }

    .quick-dict-widget.dock-left .quick-dict-panel {
      right: auto;
      left: 0;
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
      padding: 14px 16px;
      background: linear-gradient(135deg, rgba(13, 148, 136, 0.3) 0%, rgba(2, 132, 199, 0.2) 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
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
      background: rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
      padding: 16px;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
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
    }

    .quick-dict-link-btn {
      flex: 1;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 7px 10px;
      color: #cbd5e1;
      font-size: 0.78rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .quick-dict-link-btn:hover {
      background: rgba(16, 185, 129, 0.2);
      border-color: #10b981;
      color: #ffffff;
    }

    /* Floating highlight mini tooltip */
    .quick-dict-selection-tooltip {
      position: fixed;
      background: #0f172a;
      border: 1px solid #10b981;
      color: #ffffff;
      padding: 5px 11px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(0,0,0,0.4), 0 0 12px rgba(16, 185, 129, 0.35);
      z-index: 100002;
      display: flex;
      align-items: center;
      gap: 6px;
      animation: dictFadeIn 0.18s ease;
      transition: transform 0.15s ease;
    }

    .quick-dict-selection-tooltip:hover {
      transform: scale(1.06);
      background: #047857;
    }

    /* Light Mode Overrides */
    html.light-mode .quick-dict-panel,
    body.light-mode .quick-dict-panel {
      background: rgba(255, 255, 255, 0.96) !important;
      border-color: rgba(0, 0, 0, 0.12) !important;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15), 0 0 35px rgba(13, 148, 136, 0.15) !important;
      color: #0f172a !important;
    }

    html.light-mode .quick-dict-header,
    body.light-mode .quick-dict-header {
      background: linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(2, 132, 199, 0.1) 100%) !important;
    }

    html.light-mode .quick-dict-name,
    body.light-mode .quick-dict-name {
      color: #0f172a !important;
    }

    html.light-mode .quick-dict-input,
    body.light-mode .quick-dict-input {
      background: #f8fafc !important;
      color: #0f172a !important;
      border-color: rgba(13, 148, 136, 0.3) !important;
    }

    html.light-mode .quick-dict-card,
    body.light-mode .quick-dict-card {
      background: #f1f5f9 !important;
      border-color: rgba(0, 0, 0, 0.08) !important;
    }

    html.light-mode .quick-dict-hanzi,
    body.light-mode .quick-dict-hanzi {
      color: #0f172a !important;
    }

    html.light-mode .quick-dict-meaning-text,
    body.light-mode .quick-dict-meaning-text {
      color: #1e293b !important;
    }

    html.light-mode .quick-dict-meaning-box,
    body.light-mode .quick-dict-meaning-box {
      background: #ffffff !important;
    }

    html.light-mode .quick-dict-ex-zh,
    body.light-mode .quick-dict-ex-zh {
      color: #0f172a !important;
    }
  `,document.head.appendChild(p);function w(){const d=document.createElement("div");d.className=`quick-dict-widget ${n==="left"?"dock-left":""}`,d.id="quick-dict-widget",d.innerHTML=`
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
    `,document.body.appendChild(d);const f=document.getElementById("quick-dict-toggle-btn"),l=document.getElementById("quick-dict-panel"),_=document.getElementById("quick-dict-close-btn"),S=document.getElementById("quick-dict-dock-btn"),T=document.getElementById("quick-dict-input"),M=document.getElementById("quick-dict-clear-btn");function b(B){const C=l.style.display!=="none",P=typeof B=="boolean"?B:!C;if(P&&typeof window.isUserLoggedIn=="function"&&!window.isUserLoggedIn()){typeof window.openLoginPrompt=="function"&&window.openLoginPrompt("tra từ điển nhanh");return}document.body.classList.toggle("quick-dict-panel-open",P),P?(l.style.display="flex",m(),q(),setTimeout(()=>T.focus(),80)):l.style.display="none"}f.addEventListener("click",()=>b()),_.addEventListener("click",()=>b(!1)),M.addEventListener("click",()=>{T.value="",M.style.display="none",E(),T.focus()}),S.addEventListener("click",()=>{n=n==="right"?"left":"right",localStorage.setItem("hongtai_quick_dict_dock",n),d.classList.toggle("dock-left",n==="left")}),T.addEventListener("input",()=>{const B=T.value.trim();if(M.style.display=B?"block":"none",clearTimeout(a),!B){E();return}a=setTimeout(()=>{v(B)},200)}),T.addEventListener("keydown",B=>{if(B.key==="Enter"){const C=T.value.trim();C&&v(C)}else B.key==="Escape"&&b(!1)}),window.addEventListener("keydown",B=>{B.altKey&&(B.key==="d"||B.key==="D")&&(B.preventDefault(),b())}),window.openQuickDict=function(B){b(!0),B&&typeof B=="string"&&(T.value=B,M.style.display="block",v(B))}}function E(){const d=document.getElementById("quick-dict-empty-view"),f=document.getElementById("quick-dict-result-view");d&&(d.style.display="block"),f&&(f.style.display="none",f.innerHTML="")}function q(){const d=document.getElementById("quick-dict-pills-bar");if(!d)return;const f=o(),l=["家","学习","朋友","天气","工作","喜欢"],_=f.length>0?f:l;d.innerHTML=_.map(S=>`<button class="quick-dict-pill" data-word="${S}">${S}</button>`).join(""),d.querySelectorAll(".quick-dict-pill").forEach(S=>{S.addEventListener("click",()=>{const T=S.dataset.word,M=document.getElementById("quick-dict-input"),b=document.getElementById("quick-dict-clear-btn");M&&(M.value=T,b&&(b.style.display="block"),v(T))})})}async function v(d){if(!d)return;const f=d.trim();s=f;const l=document.getElementById("quick-dict-result-view"),_=document.getElementById("quick-dict-empty-view");_&&(_.style.display="none"),l&&(l.style.display="block",l.innerHTML=`
        <div style="text-align: center; padding: 24px; color: #94a3b8;">
          <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 1.5rem; color: #10b981; margin-bottom: 8px;"></i>
          <div>Đang tra cứu từ "${f}"...</div>
        </div>
      `);let S=c;S||(S=await m());let T=null;if(S)if(S[f])T=S[f];else{const M=f.replace(/[.,!?:;="\'"()[\]{}，。！？；：\s\-_~`]/g,"");if(S[M])T=S[M];else{const b=y(f);b&&(T=Object.values(S).find(B=>y(B.pinyin)===b)),!T&&M.length>=2&&(T=Object.values(S).find(B=>B.word&&B.word.startsWith(M)))}}if(T){k({word:T.word,pinyin:T.pinyin,meaning:T.meaning,level:T.level||"HSK",pos:T.pos||"Từ vựng",example_zh:T.example_zh||"",example_py:T.example_py||"",example_vi:T.example_vi||"",note:T.note||""}),g(T.word);return}try{const M=await fetch("/api/dict/lookup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({word:f})});if(M.ok){const b=await M.json();if(b&&b.success&&s===f){k({word:b.word||f,pinyin:b.pinyin||"",meaning:b.meaning||"Nghĩa từ vựng",level:b.hskLevel||"Tra cứu",pos:/[\u4e00-\u9fa5]/.test(f)?f.length===1?"Chữ Hán":"Từ vựng":"Từ khóa",example_zh:"",example_py:"",example_vi:""}),g(b.word||f);return}}}catch{}s===f&&l&&(l.innerHTML=`
        <div style="text-align: center; padding: 24px 12px; color: #94a3b8;">
          <div style="font-size: 2rem; color: #f59e0b; margin-bottom: 8px;">🤔</div>
          <div style="font-size: 1rem; font-weight: 700; color: #f1f5f9; margin-bottom: 4px;">Chưa tìm thấy từ "${f}"</div>
          <div style="font-size: 0.82rem; line-height: 1.5;">Vui lòng kiểm tra lại chính tả hoặc thử tra bằng Pinyin hoặc tiếng Việt.</div>
        </div>
      `)}function k(d){const f=document.getElementById("quick-dict-result-view");if(!f)return;d.word&&d.word.length===1&&/[\u4e00-\u9fa5]/.test(d.word),f.innerHTML=`
      <div class="quick-dict-card">
        <!-- Head -->
        <div class="quick-dict-word-head">
          <div>
            <div class="quick-dict-hanzi" id="quick-dict-card-hanzi">${d.word}</div>
            <div class="quick-dict-pinyin-row" style="margin-top: 6px;">
              <span class="quick-dict-pinyin">${d.pinyin?`[${d.pinyin}]`:""}</span>
              <button class="quick-dict-speak-btn" id="quick-dict-card-speak-btn" title="Nghe phát âm">
                <i class="fa-solid fa-volume-high"></i>
              </button>
            </div>
          </div>
          <div class="quick-dict-badges-wrap">
            <span class="quick-dict-hsk-badge">${d.level}</span>
            <span class="quick-dict-pos-badge">${d.pos}</span>
          </div>
        </div>

        <!-- Meaning -->
        <div class="quick-dict-meaning-box">
          <div class="quick-dict-meaning-label">Nghĩa tiếng Việt:</div>
          <div class="quick-dict-meaning-text">${d.meaning}</div>
        </div>

        <!-- Example Sentence if available -->
        ${d.example_zh?`
          <div class="quick-dict-example-box">
            <div class="quick-dict-ex-head">
              <span class="quick-dict-ex-label">Ví dụ minh họa</span>
              <button class="quick-dict-action-btn" id="quick-dict-ex-speak-btn" title="Nghe câu ví dụ" style="width: 24px; height: 24px;">
                <i class="fa-solid fa-volume-high" style="font-size: 0.72rem;"></i>
              </button>
            </div>
            <div class="quick-dict-ex-zh">${d.example_zh}</div>
            ${d.example_py?`<div class="quick-dict-ex-py">${d.example_py}</div>`:""}
            <div class="quick-dict-ex-vi">${d.example_vi}</div>
          </div>
        `:""}

        <!-- Bottom Actions -->
        <div class="quick-dict-card-actions">
          <button class="quick-dict-link-btn" id="quick-dict-copy-btn">
            <i class="fa-regular fa-copy"></i> Sao chép từ
          </button>
          <a class="quick-dict-link-btn" href="/hanzi-writer.html?word=${encodeURIComponent(d.word)}" target="_blank" title="Tập viết chữ này">
            <i class="fa-solid fa-pen-nib"></i> Tập viết chữ Hán
          </a>
        </div>
      </div>
    `;const l=document.getElementById("quick-dict-card-speak-btn");l&&l.addEventListener("click",()=>x(d.word));const _=document.getElementById("quick-dict-ex-speak-btn");_&&d.example_zh&&_.addEventListener("click",()=>x(d.example_zh));const S=document.getElementById("quick-dict-copy-btn");S&&S.addEventListener("click",()=>{navigator.clipboard.writeText(d.word).then(()=>{S.innerHTML='<i class="fa-solid fa-check"></i> Đã sao chép!',setTimeout(()=>{S.innerHTML='<i class="fa-regular fa-copy"></i> Sao chép từ'},1500)})})}let I=null;function u(){I&&(I.remove(),I=null)}document.addEventListener("mouseup",d=>{d.target.closest("#quick-dict-widget")||setTimeout(()=>{const f=window.getSelection(),l=f?f.toString().trim():"";if(u(),l&&/[\u4e00-\u9fa5]/.test(l)&&l.length<=15){const S=f.getRangeAt(0).getBoundingClientRect(),T=document.createElement("div");T.className="quick-dict-selection-tooltip",T.innerHTML=`<i class="fa-solid fa-book-bookmark"></i> Tra "${l.length>5?l.slice(0,5)+"...":l}"`,T.style.left=`${Math.max(10,S.left+window.scrollX+S.width/2-45)}px`,T.style.top=`${Math.max(10,S.top+window.scrollY-38)}px`,T.addEventListener("mousedown",M=>{if(M.preventDefault(),M.stopPropagation(),u(),typeof window.isUserLoggedIn=="function"&&!window.isUserLoggedIn()){typeof window.openLoginPrompt=="function"&&window.openLoginPrompt("tra từ điển nhanh");return}window.openQuickDict(l)}),document.body.appendChild(T),I=T}},100)}),document.addEventListener("mousedown",d=>{I&&!I.contains(d.target)&&u()}),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",w):w()})();(function(){const c=window.self!==window.top;function e(){const t=window.location.pathname.toLowerCase(),i=window.location.search.toLowerCase();return t==="/"||t.endsWith("/index.html")?i.includes("tab=flashcards")?"flashcards":i.includes("view=roadmap")||window.location.hash.includes("roadmap")?"roadmap":"home":t.includes("video-dictation")?i.includes("mode=shadowing")?"shadowing":"dictation":t.includes("translation-practice")||t.includes("paragraph-practice")?"translation":t.includes("writing-practice")?"writing":t.includes("speaking-practice")?"speaking":t.includes("sentence-reorder")?"sentence-reorder":t.includes("ai-dialogue")?"ai-dialogue":t.includes("reading-practice")?"reading":t.includes("chinese-phonetics")?"phonetics":t.includes("chinese-radicals")?"radicals":t.includes("hanzi-writer")?"hanzi":t.includes("hsk-grammar")?"grammar":t.includes("lesson-texts")?"texts":t.includes("vocab-practice")?"vocab-practice":t.includes("detail-list")?"vocabulary":t.includes("quiz-game")?"games":t.includes("han-viet-rules")?"rules":t.includes("rank")?"rank":t.includes("documents")?"documents":""}window.toggleSidebarDropdown=function(t){if(!t)return;const i=t.closest(".sidebar-group");i&&i.classList.toggle("open")};const s="316017385374-7nnvn1q2mcej8n9r2ii7ofrmbu6mdhra.apps.googleusercontent.com";function a(){return window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"||window.location.hostname===""?"http://localhost:5000":window.location.hostname.includes("tieng-trung-hong-tai-1.onrender.com")?"https://tiengtrunghongtai.online":window.location.origin||"https://tiengtrunghongtai.online"}const n=a();function o(t){if(!t)return!1;const i=t.toLowerCase().trim();return i.includes("phanphiphu")||i.includes("thaihong162004")||i.includes("toiyeutinhoc")||i==="super_admin"}function g(t){if(!t)return!1;const i=t.toLowerCase().trim();return o(i)||i.includes("hongtai")||i.includes("admin")||i.includes("teacher")}function m(){try{const t=localStorage.getItem("user")||localStorage.getItem("hongtai_current_user")||localStorage.getItem("currentUser")||sessionStorage.getItem("user");if(t)return JSON.parse(t)}catch{}return null}window.getCurrentUser=m;function y(){try{const t=localStorage.getItem("user")||localStorage.getItem("hongtai_current_user")||localStorage.getItem("currentUser")||sessionStorage.getItem("user");if(!t)return!1;const i=JSON.parse(t);if(!i)return!1;const r=(i.email||"").toLowerCase().trim();return!!(r&&r!=="guest"&&!r.startsWith("guest")&&r.includes("@"))}catch{return!1}}window.isUserLoggedIn=y;function x(){if(typeof google<"u"&&google.accounts&&google.accounts.id||document.querySelector('script[src*="accounts.google.com/gsi/client"]'))return;const t=document.createElement("script");t.src="https://accounts.google.com/gsi/client",t.async=!0,t.defer=!0,document.head.appendChild(t)}x();function p(){if(document.getElementById("global-auth-guard-styles"))return;const t=document.createElement("style");t.id="global-auth-guard-styles",t.textContent=`
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
    `,document.head.appendChild(t)}function w(){p();let t=document.getElementById("global-auth-required-modal");return t||(t=document.createElement("div"),t.className="modal-overlay global-auth-modal-overlay",t.id="global-auth-required-modal",t.style.display="none",t.innerHTML=`
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
    `,document.body.appendChild(t),t.addEventListener("click",i=>{i.target===t&&!window._isMandatoryPageLockActive&&window.hideGlobalAuthModal()}),t)}let E=null;function q(){const t=document.getElementById("global-google-signin-btn-container");if(t){if(typeof google>"u"||!google.accounts||!google.accounts.id){x(),clearInterval(E);let i=0;E=setInterval(()=>{i++,typeof google<"u"&&google.accounts&&google.accounts.id?(clearInterval(E),q()):i>30&&(clearInterval(E),t.innerHTML=`
            <button onclick="window.renderGlobalGoogleSignInButton && window.renderGlobalGoogleSignInButton()" style="display: flex; align-items: center; gap: 10px; padding: 10px 18px; border-radius: 999px; background: #2563eb; color: #fff; border: none; font-weight: 600; cursor: pointer;">
              <i class="fa-brands fa-google"></i> Thử lại đăng nhập Google
            </button>
          `)},300);return}try{google.accounts.id.initialize({client_id:s,callback:v,auto_select:!1,cancel_on_tap_outside:!window._isMandatoryPageLockActive}),t.innerHTML="",google.accounts.id.renderButton(t,{theme:"filled_blue",size:"large",type:"standard",shape:"pill",text:"signin_with",logo_alignment:"left",width:290})}catch(i){console.error("Google Sign-In initialization failed:",i)}}}window.renderGlobalGoogleSignInButton=q;async function v(t){if(!(!t||!t.credential))try{let i=null;try{const z=t.credential.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"),F=decodeURIComponent(atob(z).split("").map(function(N){return"%"+("00"+N.charCodeAt(0).toString(16)).slice(-2)}).join("")),G=JSON.parse(F);if(G&&G.email){const N=G.email.toLowerCase().trim(),O=o(N),Z=N.includes("hongtai")||N.includes("teacher");i={name:G.name||N.split("@")[0],email:N,picture:G.picture||"",role:O?"super_admin":Z?"teacher":"user",isSuperAdmin:O,isAdmin:O||Z}}}catch(A){console.warn("Global Auth JWT decode fallback error:",A)}let r=null;try{const A=await fetch(n+"/api/auth/google",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({credential:t.credential}),credentials:"include"});A.ok&&(r=await A.json())}catch(A){console.warn("Backend /api/auth/google error:",A)}let h=null;if(r&&r.success&&r.user)h=r.user,r.token&&localStorage.setItem("session_token",r.token);else if(i)h=i;else throw new Error("Không nhận được dữ liệu xác thực Google");const L=(h.email||"").toLowerCase().trim();if(o(L)?(h.role="super_admin",h.isSuperAdmin=!0,h.isAdmin=!0):g(L)&&(h.isAdmin=!0),localStorage.setItem("user",JSON.stringify(h)),localStorage.setItem("currentUser",JSON.stringify(h)),f(),window.dispatchEvent(new CustomEvent("user-auth-changed",{detail:h})),window.dispatchEvent(new CustomEvent("hongtai-auth-success",{detail:h})),c)try{window.parent.postMessage({type:"HONGTAI_AUTH_SUCCESS",user:h},"*")}catch{}else document.querySelectorAll("iframe").forEach(A=>{try{A.contentWindow.postMessage({type:"HONGTAI_AUTH_SUCCESS",user:h},"*")}catch{}});I();const D=h.name||(h.email?h.email.split("@")[0]:"Học viên");if(u(`Chào mừng ${D} đã đăng nhập thành công! 👋`),!(window.location.pathname==="/"||window.location.pathname.endsWith("/index.html")||window.location.pathname==="")&&!c){setTimeout(()=>{window.location.reload()},350);return}if(typeof window._pendingGuardedAuthCallback=="function"){const A=window._pendingGuardedAuthCallback;window._pendingGuardedAuthCallback=null;try{A()}catch(z){console.error("Error executing pending auth callback:",z)}}}catch(i){console.error("Google Auth Error:",i),u("Đăng nhập Google thất bại! Vui lòng thử lại.",!0)}}window.handleGlobalCredentialResponse=v;function k(t={}){if(c)try{window.parent.postMessage({type:"OPEN_AUTH_REQUIRED_MODAL",actionName:t.actionName||"",title:t.title||"",desc:t.desc||"",isMandatoryPageLock:!!t.isMandatoryPageLock},"*")}catch{}const i=w();window._isMandatoryPageLockActive=!!t.isMandatoryPageLock,window._pendingGuardedAuthCallback=t.callback||null;const r=document.getElementById("global-auth-title"),h=document.getElementById("global-auth-desc"),L=document.getElementById("global-auth-close-btn"),D=document.getElementById("global-auth-home-btn-wrap");r&&(r.innerHTML=t.title||(t.actionName?`Đăng Nhập Để ${t.actionName}`:"Đăng Nhập Để Trải Nghiệm")),h&&(h.innerHTML=t.desc||`Vui lòng đăng nhập với tài khoản Google để sử dụng tính năng ${t.actionName?`<strong>${t.actionName}</strong>`:""}, mở khóa học tập và tự động lưu tiến độ của bạn.`),L&&(t.isMandatoryPageLock?(L.style.setProperty("display","none","important"),L.setAttribute("aria-hidden","true"),L.style.pointerEvents="none"):(L.style.setProperty("display","flex","important"),L.setAttribute("aria-hidden","false"),L.style.pointerEvents="auto")),D&&D.style.setProperty("display",t.isMandatoryPageLock?"block":"none","important"),i.style.display="flex",document.body.style.overflow="hidden",q()}window.showGlobalAuthModal=k,window.addEventListener("message",t=>{t.data&&(t.data.type==="OPEN_AUTH_REQUIRED_MODAL"?k({isMandatoryPageLock:t.data.isMandatoryPageLock!==!1,actionName:t.data.actionName||"tính năng này",title:t.data.title,desc:t.data.desc}):t.data.type==="HONGTAI_AUTH_SUCCESS"&&t.data.user&&(localStorage.setItem("user",JSON.stringify(t.data.user)),localStorage.setItem("currentUser",JSON.stringify(t.data.user)),f(),window.dispatchEvent(new CustomEvent("user-auth-changed",{detail:t.data.user})),window.dispatchEvent(new CustomEvent("hongtai-auth-success",{detail:t.data.user})),I(),typeof window.initUserSessionTracking=="function"&&window.initUserSessionTracking()))});function I(){if(window._isMandatoryPageLockActive&&!y())return;const t=document.getElementById("global-auth-required-modal");t&&(t.style.display="none");const i=document.getElementById("auth-required-modal");i&&(i.style.display="none"),document.body.style.overflow="",window._isMandatoryPageLockActive=!1}window.hideGlobalAuthModal=I,window.openLoginPrompt=function(t,i){if(y()){typeof i=="function"&&i();return}k({isMandatoryPageLock:!1,actionName:typeof t=="string"?t:"",callback:typeof i=="function"?i:typeof t=="function"?t:null})},window.openAuthRequiredModal=window.openLoginPrompt,window.requireAuth=function(t,i="sử dụng tính năng này"){return y()?(typeof t=="function"&&t(),!0):(k({isMandatoryPageLock:!1,actionName:i,callback:t}),!1)};function u(t,i=!1){if(typeof window.showToast=="function"){window.showToast(t,i);return}const r=document.getElementById("global-auth-toast");r&&r.remove();const h=document.createElement("div");h.id="global-auth-toast",h.className="global-auth-toast-pill",i&&(h.style.borderColor="rgba(239, 68, 68, 0.4)",h.style.boxShadow="0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(239, 68, 68, 0.2)"),h.innerHTML=`
      <i class="fa-solid ${i?"fa-circle-exclamation text-danger":"fa-circle-check text-success"}" style="color: ${i?"#f87171":"#34d399"}; font-size: 1.1rem;"></i>
      <span>${t}</span>
    `,document.body.appendChild(h),setTimeout(()=>{h.style.transition="opacity 0.3s ease, transform 0.3s ease",h.style.opacity="0",h.style.transform="translateX(-50%) translateY(-10px)",setTimeout(()=>h.remove(),320)},3200)}function d(){const t=window.location.pathname.toLowerCase();if(!(t==="/"||t.endsWith("/index.html")||t==="")&&!y()){let r="tính năng này";t.includes("speaking-practice")?r="Luyện Nói HSKK & AI":t.includes("writing-practice")?r="Luyện Viết Tiếng Trung":t.includes("reading-practice")?r="Luyện Đọc Hiểu":t.includes("video-dictation")?r="Chép Chính Tả & Shadowing Video":t.includes("quiz-game")?r="Trò Chơi Đố Vui HSK":t.includes("vocab-practice")?r="Luyện Từ Vựng 5 Dạng":t.includes("translation-practice")?r="Luyện Dịch Câu & Đoạn Văn":t.includes("sentence-reorder")?r="Bài Tập Sắp Xếp Câu":t.includes("ai-dialogue")?r="Hội Thoại Trợ Lý AI":t.includes("chinese-phonetics")?r="Ngữ Âm Pinyin":t.includes("chinese-radicals")?r="214 Bộ Thủ Chữ Hán":t.includes("hanzi-writer")?r="Tập Viết Chữ Hán (Hanzi)":t.includes("hsk-grammar")?r="Cẩm Nang Ngữ Pháp HSK":t.includes("lesson-texts")?r="Bài Khóa Giáo Trình":t.includes("lesson-online")?r="Khóa Học Trực Tuyến":t.includes("documents")?r="Kho Tài Liệu Học Tập":t.includes("detail-list")?r="Tra Cứu Từ Vựng Chi Tiết":t.includes("chat-history")?r="Lịch Sử Hội Thoại":t.includes("rank")&&(r="Bảng Xếp Hạng Học Viên"),k({isMandatoryPageLock:!0,actionName:r,title:`Đăng Nhập Để Dùng: ${r}`,desc:`Hệ thống yêu cầu bạn đăng nhập bằng Google trước khi sử dụng <strong>${r}</strong> để đồng bộ tiến độ và lưu kết quả học tập.`})}}function f(){const t=m();document.querySelectorAll(".app-sidebar, .global-app-sidebar").forEach(r=>{const h=r.querySelector(".user-name, #user-display-name"),L=r.querySelector(".user-sub, #user-display-email"),D=r.querySelector(".user-role-badge, #user-display-role"),$=r.querySelector(".sidebar-avatar-wrap"),A=r.querySelector(".sidebar-auth-action-item");if(t&&(t.name||t.email)){const z=t.name||t.displayName||(t.email?t.email.split("@")[0]:"Học viên"),F=t.email||"",G=t.role==="super_admin"?"Super Admin":t.role==="admin"?"Admin":t.role==="teacher"?"Giáo viên":"Học viên",N=t.picture||t.avatar||"";h&&(h.textContent=z),L&&(L.textContent=F),D&&(D.textContent=G),$&&(N?$.innerHTML=`<img class="user-avatar-img" src="${N}" alt="Avatar" style="display: block; width: 44px; height: 44px; border-radius: 50%; object-fit: cover;">`:$.innerHTML='<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>'),A&&(A.innerHTML=`
            <a href="javascript:void(0)" class="logout-link" onclick="window.handleGlobalLogout && window.handleGlobalLogout(event)" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #f87171; font-size: 0.88rem; font-weight: 600; text-decoration: none; transition: all 0.2s;">
              <i class="fa-solid fa-right-from-bracket" style="color: #f87171;"></i> <span>Đăng xuất</span>
            </a>
          `)}else h&&(h.textContent="Khách (Chưa đăng nhập)"),L&&(L.textContent="Đăng nhập để lưu tiến độ học"),D&&(D.textContent="Khách"),$&&($.innerHTML='<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>'),A&&(A.innerHTML=`
            <a href="javascript:void(0)" onclick="window.openLoginPrompt && window.openLoginPrompt()" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #4ade80; font-size: 0.88rem; font-weight: 700; text-decoration: none; transition: all 0.2s;">
              <i class="fa-brands fa-google" style="color: #4ade80;"></i> <span>Đăng nhập Google</span>
            </a>
          `)})}function l(){const t=e(),i=m(),r=i?i.name||i.displayName||(i.email?i.email.split("@")[0]:"Học viên"):"Khách (Chưa đăng nhập)",h=i?i.email||"":"Đăng nhập để lưu tiến độ học",L=i?i.role==="super_admin"?"Super Admin":i.role==="admin"?"Admin":i.role==="teacher"?"Giáo viên":"Học viên":"Khách",D=i&&(i.picture||i.avatar)?i.picture||i.avatar:"";return`
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
                ${D?`<img class="user-avatar-img" src="${D}" alt="Avatar" style="display: block; width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-blue, #38bdf8);">`:'<div class="user-avatar sidebar-avatar-placeholder" style="width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white;"><i class="fa-solid fa-user"></i></div>'}
              </div>
              <div class="user-info" style="min-width: 0; flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                <span class="user-name" style="font-weight: 700; font-size: 0.92rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r}</span>
                <span class="user-sub" style="font-size: 0.72rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${h}</span>
                <span class="user-role-badge" style="font-size: 0.68rem; margin-top: 2px; align-self: flex-start;">${L}</span>
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
          <li class="sidebar-item ${t==="shadowing"?"active":""}" onclick="window.location.href = '/video-dictation.html?mode=shadowing'">
            <i class="fa-solid fa-microphone-lines" style="color: #10b981; font-size: 1.1rem;"></i> <span>Shadowing</span>
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
    `}window.openGlobalSidebar=function(){f();const t=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html");if(t&&window.innerWidth>900){document.body.classList.remove("sidebar-collapsed"),localStorage.setItem("sidebar_collapsed","false");return}const i=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),r=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");i&&(i.classList.add("open","active"),i.style.pointerEvents="auto"),r&&(!t||window.innerWidth<=900)&&r.classList.add("active"),document.body.classList.add("sidebar-open")},window.closeGlobalSidebar=function(){const t=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),i=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");t&&t.classList.remove("open","active"),i&&i.classList.remove("active"),document.body.classList.remove("sidebar-open")},window.toggleGlobalSidebar=function(){if((window.location.pathname==="/"||window.location.pathname.endsWith("/index.html"))&&window.innerWidth>900){window.toggleSidebarCollapse?window.toggleSidebarCollapse():document.body.classList.toggle("sidebar-collapsed");return}const i=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar");i&&(i.classList.contains("open")||i.classList.contains("active")||document.body.classList.contains("sidebar-open"))?window.closeGlobalSidebar():window.openGlobalSidebar()},window.toggleGlobalUserDropdown=function(t){t&&(t.stopPropagation(),typeof t.preventDefault=="function"&&t.preventDefault());const i=t&&t.target?t.target.closest(".user-dropdown"):null;i?i.classList.toggle("show-menu"):document.querySelectorAll(".user-dropdown").forEach(h=>h.classList.toggle("show-menu"))},window.toggleUserDropdown=window.toggleGlobalUserDropdown,window.handleGlobalLogout=async function(t){t&&(t.stopPropagation(),typeof t.preventDefault=="function"&&t.preventDefault());try{await fetch("/api/auth/logout",{method:"POST",credentials:"include"})}catch{}if(localStorage.removeItem("user"),localStorage.removeItem("currentUser"),localStorage.removeItem("hongtai_user"),localStorage.removeItem("hongtai_current_user"),localStorage.removeItem("session_token"),sessionStorage.removeItem("user"),typeof google<"u"&&google.accounts&&google.accounts.id)try{google.accounts.id.disableAutoSelect()}catch{}if(!(window.location.pathname==="/"||window.location.pathname.endsWith("/index.html")||window.location.pathname==="")){window.location.href="/?logged_out=true";return}typeof window.handleLogout=="function"?window.handleLogout(t):window.location.reload()},document.addEventListener("keydown",function(t){t.key==="Escape"&&(window.closeGlobalSidebar(),document.querySelectorAll(".user-dropdown.show-menu").forEach(i=>i.classList.remove("show-menu")))}),document.addEventListener("click",function(t){t.target.closest(".user-dropdown")||document.querySelectorAll(".user-dropdown.show-menu").forEach(i=>i.classList.remove("show-menu"))});const _=[{id:"ai-dialogue",tag:"✨ AI MỚI",tagClass:"ai",title:"Hội Thoại AI Nhập Vai:",desc:"Trò chuyện thực tế nhập vai với AI theo 12 chủ đề đời sống & du lịch.",link:"/ai-dialogue.html",linkText:"Trải nghiệm ngay →"},{id:"sentence-reorder",tag:"🧩 790+ CÂU",tagClass:"feat",title:"Sắp Xếp Câu Ngữ Pháp:",desc:"Luyện phản xạ cấu trúc câu chuẩn từ HSK 1 - 6 với chấm điểm tức thì.",link:"/sentence-reorder.html",linkText:"Luyện tập ngay →"},{id:"writing-practice",tag:"✍️ LUYỆN VIẾT",tagClass:"hot",title:"Luyện Viết Luận & HSKK:",desc:"1,045+ đề thi thực tế, công nghệ AI chấm điểm & sửa lỗi ngữ pháp chi tiết.",link:"/writing-practice.html",linkText:"Viết ngay →"},{id:"speaking-practice",tag:"🎙️ LUYỆN NÓI",tagClass:"audio",title:"Luyện Phát Âm Trực Tiếp:",desc:"Nhận diện giọng nói qua Micro AI, kiểm tra độ chuẩn xác thanh điệu từng từ.",link:"/speaking-practice.html",linkText:"Nói ngay →"},{id:"reading-practice",tag:"📖 ĐỌC HIỂU",tagClass:"book",title:"Luyện Đọc Chuyên Sâu:",desc:"Hàng trăm bài đọc chuẩn HSK 1 - 6 kèm audio bản xứ, giải nghĩa từ vựng & câu hỏi.",link:"/reading-practice.html",linkText:"Đọc ngay →"},{id:"translation-practice",tag:"🌐 DỊCH THUẬT",tagClass:"feat",title:"Luyện Dịch Trung - Việt:",desc:"Rèn luyện phản xạ chuyển ngữ song song Trung - Việt / Việt - Trung chuẩn ngữ cảnh.",link:"/translation-practice.html",linkText:"Dịch ngay →"},{id:"video-shadowing",tag:"🎬 SHADOWING",tagClass:"hot",title:"Shadowing Video Thực Tế:",desc:"Phương pháp nhại giọng theo trích đoạn phim đời sống, cải thiện phát âm & độ trôi chảy.",link:"/video-dictation.html?mode=shadowing",linkText:"Thử ngay →"},{id:"video-dictation",tag:"🎧 NGHE CHÉP",tagClass:"audio",title:"Nghe Chép Chính Tả Video:",desc:"Luyện tai nghe thực tế qua video ngắn chân thực kèm phụ đề pinyin & dịch nghĩa.",link:"/video-dictation.html?mode=dictation",linkText:"Luyện nghe ngay →"},{id:"hanzi-writer",tag:"🖌️ CHỮ HÁN",tagClass:"feat",title:"Hanzi Writer & In Phiếu:",desc:"Mô phỏng thứ tự nét thuận, tra cứu bộ thủ và xuất file PDF tập viết ô chữ điền miễn phí.",link:"/hanzi-writer.html",linkText:"Tập viết ngay →"},{id:"chinese-phonetics",tag:"🔤 PINYIN",tagClass:"feat",title:"Bảng Phiên Âm Chuẩn:",desc:"Đầy đủ thanh mẫu, vận mẫu, thanh điệu kèm audio mẫu phát âm chuẩn Bắc Kinh.",link:"/chinese-phonetics.html",linkText:"Tra cứu ngay →"},{id:"chinese-radicals",tag:"🏮 214 BỘ THỦ",tagClass:"feat",title:"214 Bộ Thủ Thần Tốc:",desc:"Học chữ Hán qua nguồn gốc hình tượng hóa, ý nghĩa và mẹo ghi nhớ nhanh.",link:"/chinese-radicals.html",linkText:"Học bộ thủ →"},{id:"han-viet-rules",tag:"⚡ BÍ QUYẾT",tagClass:"hot",title:"Chuyển Âm Hán Việt:",desc:"Mẹo vàng ghi nhớ hàng ngàn từ vựng HSK không cần học vẹt nhờ quy tắc biến đổi âm.",link:"/han-viet-rules.html",linkText:"Xem quy tắc →"},{id:"hsk-grammar",tag:"📚 NGỮ PHÁP",tagClass:"book",title:"Cẩm Nang Ngữ Pháp Toàn Diện:",desc:"Hệ thống hóa toàn bộ cấu trúc ngữ pháp HSK 1 - 6 chuẩn Sư Phạm có bài tập & ví dụ.",link:"/hsk-grammar.html",linkText:"Xem ngữ pháp →"},{id:"lesson-texts",tag:"🔊 BÀI KHÓA",tagClass:"book",title:"Bài Khóa & Audio Chuẩn:",desc:"Trọn bộ bài khóa HSK theo giáo trình chuẩn, kèm file nghe audio gốc & dịch song ngữ.",link:"/lesson-texts.html",linkText:"Khám phá ngay →"},{id:"game-hub",tag:"🎮 5 MINI GAME",tagClass:"game",title:"Đấu Trường Mini Game:",desc:"Vừa chơi vừa ôn luyện: Pháo hoa sinh tồn, Nối chữ Hán, Lật thẻ từ vựng & Bắn bóng!",action:"gamehub",linkText:"Vào chơi ngay →"},{id:"flashcards-spaced",tag:"🃏 FLASHCARD",tagClass:"feat",title:"Flashcard Ghi Nhớ Sâu:",desc:"Thuật toán lặp lại ngắt quãng Spaced Repetition giúp nhớ lâu từ vựng không lo quên.",action:"flashcards",linkText:"Luyện từ ngay →"},{id:"documents-vault",tag:"👑 TÀI LIỆU",tagClass:"vip",title:"Kho Sách & Ebook HSK VIP:",desc:"Tải miễn phí trọn bộ giáo trình HSK 1 - 6, sách ngữ pháp, đề thi thật PDF & audio.",link:"/documents.html",linkText:"Tải tài liệu →"},{id:"leaderboard-rank",tag:"🏆 THI ĐUA",tagClass:"trophy",title:"Bảng Xếp Hạng Học Viên:",desc:"Tích lũy điểm khi ôn tập từ vựng & trò chơi để ghi danh Top 1 Tiếng Trung HongTai.",link:"/rank.html",linkText:"Bảng xếp hạng →"},{id:"roadmap-guide",tag:"🎯 LỘ TRÌNH",tagClass:"feat",title:"Lộ Trình Cá Nhân Hóa:",desc:"Kế hoạch học tập khoa học theo ngày từ HSK 1 đến HSK 6 với mục tiêu rõ ràng.",action:"roadmap",linkText:"Xem lộ trình →"},{id:"dictionary-lookup",tag:"🔍 TRA CỨU",tagClass:"feat",title:"Từ Điển HSK 5,000+ Từ:",desc:"Tra nghĩa tiếng Việt, pinyin, từ loại, câu ví dụ thực tế và audio phát âm bản xứ.",link:"/detail-list.html",linkText:"Tra cứu ngay →"},{id:"vip-upgrade-trial",tag:"🎁 ĐỢT TRẢI NGHIỆM",tagClass:"vip",title:"Đợt Nhận 30 Ngày VIP (Đến Hết 31/12/2026):",desc:"Mở cổng tặng 30 ngày VIP miễn phí 100%! Kích hoạt lúc nào tính đủ 30 ngày từ lúc đó.",action:"vip",linkText:"Nhận 30N VIP →"},{id:"vip-schedule-fee",tag:"⏳ LỘ TRÌNH PHÍ",tagClass:"hot",title:"Thời Gian Bắt Đầu Tính Phí VIP:",desc:"Tài khoản bắt đầu tính phí sau khi kết thúc 30 ngày trải nghiệm. Bảng giá ưu đãi các gói 3T, 6T, 1N!",action:"vip",linkText:"Xem lộ trình & phí →"},{id:"discussion-forum",tag:"💬 CỘNG ĐỒNG",tagClass:"feat",title:"Thảo Luận Cùng Giảng Viên:",desc:"Giao lưu trao đổi kinh nghiệm học tập, đặt câu hỏi ngữ pháp cùng cộng đồng học viên.",action:"discussion",linkText:"Tham gia thảo luận →"},{id:"online-courses",tag:"🎓 KHÓA HỌC",tagClass:"book",title:"Lớp Học Trực Tuyến Sư Phạm:",desc:"Chương trình đào tạo HSK bài bản cùng đội ngũ giảng viên chuyên ngành tiếng Trung.",link:"/lesson-online.html",linkText:"Xem lớp học →"},{id:"hongtai-platform",tag:"🔥 NỔI BẬT",tagClass:"hot",title:"Tiếng Trung HongTai:",desc:"Nền tảng học HSK 1 - 6 trực quan, toàn diện & chuẩn Sư Phạm với 5,000+ từ vựng phong phú.",link:"/",linkText:"Khám phá ngay →"}];function S(t){const i=[...t];for(let r=i.length-1;r>0;r--){const h=Math.floor(Math.random()*(r+1));[i[r],i[h]]=[i[h],i[r]]}return i}function T(t){t==="gamehub"?typeof window.showGameHubGuideModal=="function"?window.showGameHubGuideModal():window.location.href="/quiz-game.html":t==="flashcards"?typeof window.switchTab=="function"?window.switchTab("flashcards"):window.location.href="/index.html?tab=flashcards":t==="roadmap"?typeof window.showRoadmapView=="function"?window.showRoadmapView():typeof window.switchTab=="function"?window.switchTab("roadmap"):window.location.href="/index.html?tab=roadmap":t==="vip"?typeof window.openVipUpgradeModal=="function"&&window.openVipUpgradeModal("trial"):t==="discussion"&&typeof window.openDiscussionModal=="function"&&window.openDiscussionModal()}function M(t){const i=t.action?`data-ticker-action="${t.action}"`:"",r=t.link||"javascript:void(0)";return`<span class="ticker-item" data-ticker-id="${t.id}" ${i} tabindex="0" role="button"><span class="ticker-tag ${t.tagClass}">${t.tag}</span> <strong>${t.title}</strong> ${t.desc} <a href="${r}" class="ticker-action-link" ${i}>${t.linkText}</a></span>`}window.closeAnnouncementTicker=function(){const t=document.getElementById("home-announcement-ticker")||document.querySelector(".announcement-ticker-bar");if(t){t.classList.add("dismissed"),setTimeout(()=>{t.style.display="none"},350);try{sessionStorage.setItem("hongtai_ticker_dismissed","true")}catch{}}},window.shuffleAnnouncementTicker=function(){const t=document.getElementById("home-announcement-ticker")||document.querySelector(".announcement-ticker-bar");if(!t)return;const i=t.querySelector("#ticker-shuffle-btn");i&&(i.classList.add("spinning"),setTimeout(()=>i.classList.remove("spinning"),600));const r=t.querySelector(".ticker-track-inner");r?(r.style.opacity="0.35",r.style.transition="opacity 0.2s ease",setTimeout(()=>{b(t,!0),r.style.opacity="1"},160)):b(t,!0),typeof window.showToast=="function"&&window.showToast("🎲 Đã trộn ngẫu nhiên các tính năng nổi bật!")};function b(t,i=!1){const r=t.querySelector(".ticker-track-inner");if(!r)return;let h=t.querySelector(".ticker-controls");if(!h){const z=t.querySelector(".ticker-close-btn");h=document.createElement("div"),h.className="ticker-controls",h.innerHTML=`
        <button type="button" class="ticker-control-btn ticker-shuffle-btn" id="ticker-shuffle-btn" title="Trộn ngẫu nhiên tính năng &amp; tài nguyên" aria-label="Trộn ngẫu nhiên">
          <i class="fa-solid fa-shuffle"></i>
        </button>
        <button type="button" class="ticker-control-btn ticker-close-btn" onclick="window.closeAnnouncementTicker && window.closeAnnouncementTicker()" title="Đóng thông báo" aria-label="Đóng thông báo">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `,z?z.replaceWith(h):t.appendChild(h)}const L=h.querySelector("#ticker-shuffle-btn");L&&!L.dataset.bound&&(L.dataset.bound="true",L.onclick=function(z){z.stopPropagation(),window.shuffleAnnouncementTicker()});const $=S(_).map(M).join("");r.innerHTML=`
      <div class="ticker-content-loop" id="ticker-loop-primary">${$}</div>
      <div class="ticker-content-loop" id="ticker-loop-clone" aria-hidden="true">${$}</div>
    `,r.onclick=function(z){const F=z.target.closest(".ticker-item");if(!F)return;const G=F.getAttribute("data-ticker-action")||z.target.closest("[data-ticker-action]")&&z.target.closest("[data-ticker-action]").getAttribute("data-ticker-action");if(G){z.preventDefault(),z.stopPropagation(),T(G);return}const N=F.querySelector(".ticker-action-link");N&&N.href&&!N.href.includes("javascript:")&&z.target!==N&&(window.location.href=N.href)};const A=r.querySelector("#ticker-loop-primary");A&&requestAnimationFrame(()=>{const z=A.scrollWidth||6e3,F=Math.max(45,Math.round(z/80));if(r.style.animationDuration=`${F}s`,i)r.style.animationDelay="0s";else{const G=(Math.random()*F).toFixed(1);r.style.animationDelay=`-${G}s`}}),r.onanimationiteration=function(){try{const F=S(_).map(M).join(""),G=r.querySelector("#ticker-loop-primary"),N=r.querySelector("#ticker-loop-clone");G&&N&&(G.innerHTML=F,N.innerHTML=F)}catch{}}}function B(){try{if(sessionStorage.getItem("hongtai_ticker_dismissed")==="true"){const i=document.getElementById("home-announcement-ticker")||document.querySelector(".announcement-ticker-bar");i&&(i.style.display="none");return}}catch{}const t=document.getElementById("home-announcement-ticker")||document.querySelector(".announcement-ticker-bar");t&&b(t,!1)}function C(){if(c){d(),setTimeout(d,350);return}B();const t=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html");t&&window.innerWidth>=768&&(document.body.classList.remove("sidebar-collapsed"),localStorage.setItem("sidebar_collapsed","false"));let i=document.querySelector(".sidebar-backdrop");if(i?t&&i.classList.add("on-index"):(i=document.createElement("div"),i.className="sidebar-backdrop"+(t?" on-index":""),i.id="global-sidebar-backdrop",document.body.appendChild(i)),i.addEventListener("click",function(A){window.closeGlobalSidebar()}),!document.querySelector(".app-sidebar")&&!t){const A=document.createElement("div");A.id="global-sidebar-mount",A.innerHTML=l(),document.body.insertBefore(A.firstElementChild,document.body.firstChild)}f(),window.addEventListener("storage",f),window.addEventListener("user-auth-changed",f),setTimeout(f,500),setTimeout(f,1500),document.querySelectorAll(".app-sidebar, .global-app-sidebar").forEach(A=>{A.addEventListener("click",z=>{z.target.closest(".user-dropdown")||document.querySelectorAll(".user-dropdown.show-menu").forEach(F=>F.classList.remove("show-menu")),z.stopPropagation()})});const h=()=>{document.querySelectorAll(".app-sidebar .sidebar-item, .global-app-sidebar .sidebar-item, .app-sidebar .sidebar-subitem, .global-app-sidebar .sidebar-subitem").forEach(A=>{A.classList.contains("sidebar-dropdown-toggle")||(A.style.pointerEvents="auto",A.addEventListener("click",()=>{window.innerWidth<=900&&setTimeout(()=>{window.closeGlobalSidebar()},120)}))})};h(),setTimeout(h,600);const L=document.getElementById("menu-bubble-widget");if(L&&L.remove(),!(window.location.pathname==="/"||window.location.pathname.endsWith("/index.html")||window.location.pathname==="")){const A=document.getElementById("floating-theme-widget");A&&A.remove()}Q(),setTimeout(Q,300);const $=()=>{document.querySelectorAll(".menu-toggle-btn, .global-hamburger-btn, .sidebar-open-btn, .top-menu-btn, #top-sidebar-toggle-btn, #sidebar-expand-float-btn, .sidebar-expand-float-btn, #mobile-nav-toggle-btn, .header-icon-btn, .sidebar-toggle-btn, .topbar-comic-menu-btn, #mobile-sidebar-toggle-btn").forEach(A=>{A.onclick=window.toggleGlobalSidebar})};$(),setTimeout($,500),setTimeout($,1200),H(),setTimeout(H,150),setTimeout(H,600),setTimeout(H,1500),setTimeout(V,800),d(),setTimeout(d,350),J(),setTimeout(J,600)}const P={bars:'<svg class="header-svg-icon" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3.5" y1="6" x2="20.5" y2="6"></line><line x1="3.5" y1="12" x2="20.5" y2="12"></line><line x1="3.5" y1="18" x2="20.5" y2="18"></line></svg>',snowflake:(t=!0)=>`<svg class="header-svg-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="${t?"#38bdf8":"#94a3b8"}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="${t?"":"opacity: 0.4;"}"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line><line x1="4.93" y1="19.07" x2="19.07" y2="4.93"></line><polyline points="9 3.5 12 6.5 15 3.5"></polyline><polyline points="9 20.5 12 17.5 15 20.5"></polyline><polyline points="3.5 9 6.5 12 3.5 15"></polyline><polyline points="20.5 9 17.5 12 20.5 15"></polyline></svg>`,sun:'<svg class="header-svg-icon icon-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"></circle><line x1="12" y1="1.5" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22.5"></line><line x1="4.22" y1="4.22" x2="6" y2="6"></line><line x1="18" y1="18" x2="19.78" y2="19.78"></line><line x1="1.5" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22.5" y2="12"></line><line x1="4.22" y1="19.78" x2="6" y2="18"></line><line x1="18" y1="6" x2="19.78" y2="4.22"></line></svg>',moon:'<svg class="header-svg-icon icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',home:'<svg class="header-svg-icon icon-home" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20v-9.5z"></path><polyline points="9 21 9 12 15 12 15 21"></polyline></svg>'};function H(){const t=document.documentElement.classList.contains("light-mode")||document.documentElement.classList.contains("light"),i=localStorage.getItem("particles_enabled")!=="false";document.querySelectorAll(".global-hamburger-btn, #mobile-nav-toggle-btn, #top-sidebar-toggle-btn").forEach(r=>{r.querySelector("svg.header-svg-icon")||(r.innerHTML=P.bars)}),document.querySelectorAll('.rank-nav-btn, .btn-home, a.header-icon-btn[href="/"], a.header-icon-btn[href="/index.html"], a.header-icon-btn[title="Trang chủ"]').forEach(r=>{r.querySelector("svg.header-svg-icon")||(r.innerHTML=P.home)}),document.querySelectorAll("#particle-toggle-btn, .particle-toggle-btn").forEach(r=>{r.querySelector("svg.header-svg-icon")||(r.innerHTML=P.snowflake(i))}),document.querySelectorAll(".theme-toggle-btn, #theme-toggle-btn, .rank-theme-btn, #floating-theme-toggle-btn").forEach(r=>{r.querySelector("svg.header-svg-icon")||(r.innerHTML=t?P.moon:P.sun,r.setAttribute("title",t?"Chuyển sang Chế độ Tối":"Chuyển sang Chế độ Sáng"))})}window.ensureHeaderButtonSVGs=H;function R(t){const i=t?"url('/assets/app_bg_night_v3.png')":"url('/assets/app_bg_day_v3.png')";document.documentElement.style.setProperty("background-image",i,"important"),document.documentElement.style.setProperty("background-size","cover","important"),document.documentElement.style.setProperty("background-position","center center","important"),document.documentElement.style.setProperty("background-attachment","fixed","important"),document.documentElement.style.setProperty("background-repeat","no-repeat","important"),t?(document.documentElement.classList.add("dark"),document.documentElement.classList.remove("light","light-mode"),document.body&&(document.body.classList.remove("light","light-mode"),document.body.classList.add("dark"),document.body.style.setProperty("background-image",i,"important"),document.body.style.setProperty("background-size","cover","important"),document.body.style.setProperty("background-position","center center","important"),document.body.style.setProperty("background-attachment","fixed","important"),document.body.style.setProperty("background-repeat","no-repeat","important"))):(document.documentElement.classList.remove("dark"),document.documentElement.classList.add("light","light-mode"),document.body&&(document.body.classList.remove("dark"),document.body.classList.add("light-mode"),document.body.style.setProperty("background-image",i,"important"),document.body.style.setProperty("background-size","cover","important"),document.body.style.setProperty("background-position","center center","important"),document.body.style.setProperty("background-attachment","fixed","important"),document.body.style.setProperty("background-repeat","no-repeat","important")));const r=!t,h=t?'<i class="fa-solid fa-moon"></i>':'<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>';document.querySelectorAll(".theme-toggle-btn, #theme-toggle-btn, #floating-theme-toggle-btn, .rank-theme-btn, #theme-toggle, .theme-toggle-btn-top, .rd-theme-btn, .btn-theme-toggle").forEach(L=>{typeof P<"u"&&P&&P.moon&&(L.querySelector("svg")||L.classList.contains("header-icon-btn")||L.classList.contains("theme-toggle-btn-top")||L.classList.contains("rd-theme-btn"))?L.innerHTML=r?P.moon:P.sun:L.innerHTML=h,L.setAttribute("title",t?"Chuyển sang Chế độ Sáng":"Chuyển sang Chế độ Tối")})}window.applyGlobalTheme=R;function W(){const t=Date.now();if(window.__lastThemeToggleTime&&t-window.__lastThemeToggleTime<320)return;window.__lastThemeToggleTime=t;const r=!(document.documentElement.classList.contains("dark")||!document.documentElement.classList.contains("light-mode"));localStorage.setItem("theme",r?"dark":"light"),R(r),typeof window.showToast=="function"&&window.showToast(r?"Đã chuyển sang Chế độ Tối 🌙":"Đã chuyển sang Chế độ Sáng ☀️")}window.toggleTheme=W,window.initTheme=function(){const t=localStorage.getItem("theme")||"dark";R(t!=="light")},window.initTheme(),document.readyState==="loading"&&document.addEventListener("DOMContentLoaded",window.initTheme);const K=window.updateToggleBtns;window.updateToggleBtns=function(t){if(typeof K=="function")try{K(t)}catch{}const i=!t,r=i?'<i class="fa-solid fa-moon"></i>':'<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>';document.querySelectorAll(".theme-toggle-btn, #theme-toggle-btn, #floating-theme-toggle-btn, .rank-theme-btn, #theme-toggle, .theme-toggle-btn-top, .rd-theme-btn, .btn-theme-toggle").forEach(h=>{typeof P<"u"&&P&&P.moon&&(h.querySelector("svg")||h.classList.contains("header-icon-btn")||h.classList.contains("theme-toggle-btn-top")||h.classList.contains("rd-theme-btn"))?h.innerHTML=t?P.moon:P.sun:h.innerHTML=r,h.setAttribute("title",i?"Chuyển sang Chế độ Sáng":"Chuyển sang Chế độ Tối")})},document.addEventListener("click",t=>{t.target.closest("#theme-toggle-btn, #floating-theme-toggle-btn, .theme-toggle-btn, .rank-theme-btn, #theme-toggle, .theme-toggle-btn-top, .rd-theme-btn")&&W()});function V(){if(!(document.fonts&&document.fonts.check?document.fonts.check('16px "Font Awesome 6 Free"'):!0)&&!document.querySelector('link[data-fa-fallback="true"]')){const i=document.createElement("link");i.rel="stylesheet",i.setAttribute("data-fa-fallback","true"),i.href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css",document.head.appendChild(i)}}function J(){document.querySelectorAll(".app-sidebar a, .global-app-sidebar a, .app-sidebar .sidebar-item, .global-app-sidebar .sidebar-item, .app-sidebar .sidebar-subitem, .global-app-sidebar .sidebar-subitem").forEach(t=>{if(t.classList.contains("sidebar-dropdown-toggle"))return;const i=t.getAttribute("href")||t.getAttribute("onclick")||"";i.includes(".html")&&!i.includes("index.html")&&t.addEventListener("click",h=>{if(!y()){h.preventDefault(),h.stopPropagation();const L=t.textContent.trim().split(`
`)[0]||"tính năng này";k({isMandatoryPageLock:!1,actionName:L,title:`Đăng Nhập Để Dùng: ${L}`,desc:`Vui lòng đăng nhập với tài khoản Google để sử dụng tính năng <strong>${L}</strong>.`})}},!0)})}document.addEventListener("click",function(t){if(!(window.location.pathname==="/"||window.location.pathname.endsWith("/index.html")||window.location.pathname==="")&&!y()){if(t.target.closest("#global-auth-required-modal"))return;t.preventDefault(),t.stopPropagation(),k({isMandatoryPageLock:!0})}},!0);function Q(){const t=document.querySelector(".global-hamburger-btn, #mobile-nav-toggle-btn, #top-sidebar-toggle-btn, #mobile-sidebar-toggle-btn");if(t){t.onclick=window.toggleGlobalSidebar;return}const i=[{container:".navbar .nav-container",insertBefore:".nav-brand"},{container:".app-top-nav-inner > div:first-child",insertBefore:":first-child"},{container:".reorder-header-inner > div:first-child",insertBefore:":first-child"},{container:".diag-header-inner > div:first-child",insertBefore:":first-child"},{container:".top-bar",insertBefore:":first-child"},{container:".rd-header-left",insertBefore:".rd-back-btn"},{container:".dict-top-nav",insertBefore:".dict-brand"},{container:".rank-header-nav",insertBefore:".rank-brand-logo"},{container:".header-title-wrap",insertBefore:".back-btn"},{container:".phonetics-header .brand-box",insertBefore:":first-child"},{container:".hanzi-header .brand-box",insertBefore:":first-child"},{container:".grammar-header .brand-box",insertBefore:":first-child"},{container:".header-card > div:first-child",insertBefore:":first-child"},{container:".header-panel .logo",insertBefore:":first-child"},{container:".rules-header .rules-title-group",insertBefore:":first-child"},{container:".topbar-left-cluster",insertBefore:":first-child"}];for(const r of i){const h=document.querySelector(r.container);if(h){if(h.querySelector(".global-hamburger-btn, .menu-toggle-btn, #sidebar-expand-float-btn, #mobile-sidebar-toggle-btn"))break;const L=document.createElement("button");if(L.className="header-icon-btn global-hamburger-btn",L.id="global-hamburger-btn",L.title="Mở Menu Danh Mục",L.setAttribute("aria-label","Mở Menu Danh Mục"),L.innerHTML=P.bars,L.onclick=window.toggleGlobalSidebar,r.insertBefore===":first-child")h.insertBefore(L,h.firstChild);else{const D=h.querySelector(r.insertBefore);D?h.insertBefore(L,D):h.insertBefore(L,h.firstChild)}break}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",C):C()})();
