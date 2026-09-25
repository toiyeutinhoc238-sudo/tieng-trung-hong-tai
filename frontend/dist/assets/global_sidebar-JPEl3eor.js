(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))f(l);new MutationObserver(l=>{for(const g of l)if(g.type==="childList")for(const h of g.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&f(h)}).observe(document,{childList:!0,subtree:!0});function m(l){const g={};return l.integrity&&(g.integrity=l.integrity),l.referrerPolicy&&(g.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?g.credentials="include":l.crossOrigin==="anonymous"?g.credentials="omit":g.credentials="same-origin",g}function f(l){if(l.ep)return;l.ep=!0;const g=m(l);fetch(l.href,g)}})();const T="__hongtai_seasonal_particles__";function L(){return window[T]||(window[T]={canvas:null,ctx:null,width:0,height:0,dpr:1,particles:[],animFrameId:null,lastTime:0,season:"autumn",isInitialized:!1,resizeTimer:null,lastWidth:0,lastHeight:0}),window[T]}function I(){const i=L();if(i.isInitialized&&i.animFrameId)return;let n=document.getElementById("seasonal-particle-canvas");n?(n.style.position="fixed",n.style.inset="0",n.style.width="100%",n.style.height="100%",n.style.pointerEvents="none",n.style.zIndex="1",n.style.webkitBackfaceVisibility="hidden",n.style.backfaceVisibility="hidden"):(n=document.createElement("canvas"),n.id="seasonal-particle-canvas",n.style.cssText="position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; -webkit-backface-visibility: hidden; backface-visibility: hidden;",document.body?document.body.insertBefore(n,document.body.firstChild):document.addEventListener("DOMContentLoaded",()=>{document.getElementById("seasonal-particle-canvas")||document.body.insertBefore(n,document.body.firstChild)})),i.canvas=n;const m=n.getContext("2d",{alpha:!0});if(!m)return;i.ctx=m;const f=new Date().getMonth()+1;let l="autumn";f>=1&&f<=3?l="spring":f>=4&&f<=6?l="summer":f>=7&&f<=9?l="autumn":l="winter",window.location.pathname.includes("documents")&&(l="winter"),i.season=l;const g=(s=!1)=>{if(!i.canvas)return;const u=window.innerWidth||document.documentElement.clientWidth||360,b=window.innerHeight||document.documentElement.clientHeight||640,p=u<768;if(!s&&p&&i.lastWidth>0){const v=Math.abs(u-i.lastWidth),o=Math.abs(b-i.lastHeight);if(v<10&&o<140)return}i.lastWidth=u,i.lastHeight=b,i.width=u,i.height=b;const w=Math.min(window.devicePixelRatio||1,2);i.dpr=w,i.canvas.width=Math.floor(u*w),i.canvas.height=Math.floor(b*w),i.canvas.style.width=u+"px",i.canvas.style.height=b+"px",i.ctx.setTransform(w,0,0,w,0,0)};g(!0),window.addEventListener("resize",()=>{i.resizeTimer&&clearTimeout(i.resizeTimer),i.resizeTimer=setTimeout(()=>{g(!1)},150)},{passive:!0});const h=i.width<768,e=h?12:20;i.particles=[];for(let s=0;s<e;s++){const u=s%3===0;i.particles.push({baseX:Math.random()*i.width,x:0,y:Math.random()*(i.height+60)-30,size:l==="winter"?Math.random()*3.2+2:h?Math.random()*4.5+4:Math.random()*5.5+5,speedY:l==="winter"?Math.random()*.5+.3:Math.random()*.55+.35,swayAmp:Math.random()*25+15,swayFreq:Math.random()*.012+.008,phase:Math.random()*Math.PI*2,baseRotation:Math.random()*360,rotSpeed:(Math.random()-.5)*.4,opacity:h?Math.random()*.3+.35:Math.random()*.35+.4,colorType:s%4,shape:u?"leaf_maple":"leaf_petal"})}function t(s){if(localStorage.getItem("particles_enabled")==="false"||document.hidden){i.ctx&&i.ctx.clearRect(0,0,i.width,i.height),i.animFrameId=null;return}i.lastTime||(i.lastTime=s);const u=s-i.lastTime;i.lastTime=s;const b=Math.min(Math.max(u/16.667,.3),1.8),p=i.width,w=i.height,v=i.season,o=i.ctx;o.clearRect(0,0,p,w);const x=i.particles.length;for(let k=0;k<x;k++){const a=i.particles[k];a.y+=a.speedY*b;const M=Math.sin(a.y*a.swayFreq+a.phase)*a.swayAmp;if(a.x=a.baseX+M,a.baseRotation+=a.rotSpeed*b,a.y>w+35&&(a.y=-35,a.baseX=Math.random()*p,a.phase=Math.random()*Math.PI*2),a.baseX>p+40&&(a.baseX=-30),a.baseX<-40&&(a.baseX=p+30),o.save(),o.translate(a.x,a.y),v==="autumn"){const y=a.baseRotation*Math.PI/180+Math.sin(a.y*.015+a.phase)*.35,C=Math.cos(a.y*.018+a.phase);o.rotate(y),o.scale(C,1),o.globalAlpha=a.opacity;let S="#f59e0b";if(a.colorType===1?S="#ea580c":a.colorType===2?S="#e11d48":a.colorType===3&&(S="#d97706"),o.fillStyle=S,o.beginPath(),a.shape==="leaf_maple"){const d=a.size;o.moveTo(0,-d),o.quadraticCurveTo(d*.45,-d*.3,d*.7,-d*.1),o.quadraticCurveTo(d*.35,d*.2,d*.4,d*.7),o.quadraticCurveTo(0,d*.4,-d*.4,d*.7),o.quadraticCurveTo(-d*.35,d*.2,-d*.7,-d*.1),o.quadraticCurveTo(-d*.45,-d*.3,0,-d)}else{const d=a.size;o.moveTo(0,-d),o.bezierCurveTo(d*.55,-d*.4,d*.55,d*.4,0,d),o.bezierCurveTo(-d*.55,d*.4,-d*.55,-d*.4,0,-d)}o.fill()}else if(v==="winter")if(o.rotate(a.baseRotation*Math.PI/180),o.globalAlpha=a.opacity,a.shape==="leaf_maple"){o.strokeStyle="rgba(255, 255, 255, 0.9)",o.lineWidth=Math.max(1,a.size*.2),o.lineCap="round",o.beginPath();for(let y=0;y<6;y++)o.moveTo(0,0),o.lineTo(0,a.size),o.moveTo(0,a.size*.55),o.lineTo(a.size*.25,a.size*.75),o.moveTo(0,a.size*.55),o.lineTo(-a.size*.25,a.size*.75),o.rotate(Math.PI/3);o.stroke()}else{const y=o.createRadialGradient(0,0,0,0,0,a.size);y.addColorStop(0,"rgba(255, 255, 255, 0.95)"),y.addColorStop(.4,"rgba(224, 242, 254, 0.75)"),y.addColorStop(1,"rgba(255, 255, 255, 0)"),o.fillStyle=y,o.beginPath(),o.arc(0,0,a.size,0,Math.PI*2),o.fill()}else if(v==="spring"){const y=a.baseRotation*Math.PI/180;o.rotate(y),o.scale(Math.cos(a.y*.02+a.phase),1),o.globalAlpha=a.opacity,o.fillStyle="rgba(255, 183, 197, 0.85)",o.beginPath(),o.ellipse(0,0,a.size,a.size*.55,0,0,Math.PI*2),o.fill()}else if(v==="summer"){const y=a.baseRotation*Math.PI/180;o.rotate(y),o.scale(Math.cos(a.y*.02+a.phase),1),o.globalAlpha=a.opacity,o.fillStyle="rgba(74, 222, 128, 0.8)",o.beginPath(),o.ellipse(0,0,a.size,a.size*.45,.3,0,Math.PI*2),o.fill()}o.restore()}i.animFrameId=requestAnimationFrame(t)}function r(){i.animFrameId&&(cancelAnimationFrame(i.animFrameId),i.animFrameId=null),localStorage.getItem("particles_enabled")!=="false"&&!document.hidden&&(i.lastTime=performance.now(),i.animFrameId=requestAnimationFrame(t))}i.startLoop=r,i.isInitialized=!0;const c=localStorage.getItem("particles_enabled")!=="false";n&&(n.style.display=c?"block":"none"),c&&r(),document.addEventListener("visibilitychange",()=>{document.hidden?i.animFrameId&&(cancelAnimationFrame(i.animFrameId),i.animFrameId=null):r()}),window.startParticleLoop=r}window.initSeasonalParticles=I;window.updateParticleToggleBtns=function(i){document.querySelectorAll("#particle-toggle-btn, .particle-toggle-btn").forEach(m=>{i?(m.classList.remove("particles-off"),m.innerHTML='<i class="fa-solid fa-snowflake" style="color: #38bdf8;"></i>',m.title="Tắt hiệu ứng mùa rơi (Đang BẬT)"):(m.classList.add("particles-off"),m.innerHTML='<i class="fa-solid fa-snowflake" style="opacity: 0.35; color: #94a3b8;"></i>',m.title="Bật hiệu ứng mùa rơi (Đang TẮT)")})};window.toggleSeasonalParticles=function(){const n=!(localStorage.getItem("particles_enabled")!=="false");localStorage.setItem("particles_enabled",n?"true":"false"),typeof window.updateParticleToggleBtns=="function"&&window.updateParticleToggleBtns(n);const m=document.getElementById("seasonal-particle-canvas");m&&(m.style.display=n?"block":"none");const f=L();n?typeof f.startLoop=="function"?f.startLoop():typeof window.startParticleLoop=="function"&&window.startParticleLoop():(f.animFrameId&&(cancelAnimationFrame(f.animFrameId),f.animFrameId=null),f.ctx&&f.width&&f.height&&f.ctx.clearRect(0,0,f.width,f.height)),typeof window.showToast=="function"&&window.showToast(n?"Đã bật hiệu ứng mùa rơi 🍁":"Đã tắt hiệu ứng mùa rơi để tăng tốc độ ⚡")};document.addEventListener("click",i=>{i.target.closest("#particle-toggle-btn, .particle-toggle-btn")&&(i.preventDefault(),i.stopPropagation(),window.toggleSeasonalParticles())});(function(){if(window.__hasMainStudyTimer)return;let n=0;const m=window.location.origin.includes("5173")?"http://localhost:5000":window.location.origin;function f(l){if(!l||l<=0)return;const g=new Date().toLocaleDateString("sv");let h="guest";try{const t=localStorage.getItem("user");if(t){const r=JSON.parse(t);r&&r.email&&(h=r.email)}}catch{}const e=h!=="guest"?`daily_study_history_${h}`:"daily_study_history_guest";try{const t=localStorage.getItem(e),r=t?JSON.parse(t):{};r[g]=(r[g]||0)+l,localStorage.setItem(e,JSON.stringify(r));const c=h!=="guest"?`user_stats_${h}`:"user_stats_guest",s=localStorage.getItem(c),u=s?JSON.parse(s):{streak:0,studyTime:0};u.studyTime=(u.studyTime||0)+l,localStorage.setItem(c,JSON.stringify(u))}catch{}}setInterval(()=>{if(!window.__hasMainStudyTimer&&document.hasFocus()&&(n++,n>=15)){const l=n;n=0;const g=new Date().toLocaleDateString("sv");f(l);const h=localStorage.getItem("session_token"),e={"Content-Type":"application/json"};h&&(e.Authorization=`Bearer ${h}`,e["x-session-token"]=h),fetch(m+"/api/user/stats/sync",{method:"POST",headers:e,body:JSON.stringify({incrementStudyTime:l,localDateStr:g}),credentials:"include"}).then(t=>t.ok?t.json():null).then(t=>{if(t&&t.dailyHistory){let r=null;try{const c=localStorage.getItem("user");if(c){const s=JSON.parse(c);s&&s.email&&(r=s.email)}}catch{}if(r)try{localStorage.setItem(`daily_study_history_${r}`,JSON.stringify(t.dailyHistory)),localStorage.setItem(`user_stats_${r}`,JSON.stringify({streak:t.streak,studyTime:t.studyTime}))}catch{}}}).catch(()=>{})}},1e3)})();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{I();const i=localStorage.getItem("particles_enabled")!=="false";window.updateParticleToggleBtns&&window.updateParticleToggleBtns(i)});else{I();const i=localStorage.getItem("particles_enabled")!=="false";window.updateParticleToggleBtns&&window.updateParticleToggleBtns(i)}(function(){function i(){const e=window.location.pathname.toLowerCase(),t=window.location.search.toLowerCase();return e==="/"||e.endsWith("/index.html")?t.includes("tab=flashcards")?"flashcards":t.includes("view=roadmap")||window.location.hash.includes("roadmap")?"roadmap":"home":e.includes("video-dictation")?t.includes("mode=shadowing")?"shadowing":"dictation":e.includes("translation-practice")||e.includes("paragraph-practice")?"translation":e.includes("writing-practice")?"writing":e.includes("speaking-practice")?"speaking":e.includes("sentence-reorder")?"sentence-reorder":e.includes("ai-dialogue")?"ai-dialogue":e.includes("reading-practice")?"reading":e.includes("chinese-phonetics")?"phonetics":e.includes("chinese-radicals")?"radicals":e.includes("hanzi-writer")?"hanzi":e.includes("hsk-grammar")?"grammar":e.includes("lesson-texts")?"texts":e.includes("vocab-practice")?"vocab-practice":e.includes("detail-list")?"vocabulary":e.includes("quiz-game")?"games":e.includes("han-viet-rules")?"rules":e.includes("rank")?"rank":e.includes("documents")?"documents":""}function n(){try{const e=localStorage.getItem("user")||localStorage.getItem("hongtai_current_user")||localStorage.getItem("currentUser")||sessionStorage.getItem("user");if(e)return JSON.parse(e)}catch{}return null}function m(){const e=n();document.querySelectorAll(".app-sidebar, .global-app-sidebar").forEach(r=>{const c=r.querySelector(".user-name, #user-display-name"),s=r.querySelector(".user-sub, #user-display-email"),u=r.querySelector(".user-role-badge, #user-display-role"),b=r.querySelector(".sidebar-avatar-wrap"),p=r.querySelector(".sidebar-auth-action-item");if(e&&(e.name||e.email)){const w=e.name||e.displayName||(e.email?e.email.split("@")[0]:"Học viên"),v=e.email||"",o=e.role==="super_admin"?"Super Admin":e.role==="admin"?"Admin":e.role==="teacher"?"Giáo viên":"Học viên",x=e.picture||e.avatar||"";c&&(c.textContent=w),s&&(s.textContent=v),u&&(u.textContent=o),b&&(x?b.innerHTML=`<img class="user-avatar-img" src="${x}" alt="Avatar" style="display: block; width: 44px; height: 44px; border-radius: 50%; object-fit: cover;">`:b.innerHTML='<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>'),p&&(p.innerHTML=`
            <a href="javascript:void(0)" class="logout-link" onclick="window.handleGlobalLogout && window.handleGlobalLogout(event)" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #f87171; font-size: 0.88rem; font-weight: 600; text-decoration: none; transition: all 0.2s;">
              <i class="fa-solid fa-right-from-bracket" style="color: #f87171;"></i> <span>Đăng xuất</span>
            </a>
          `)}else c&&(c.textContent="Khách (Chưa đăng nhập)"),s&&(s.textContent="Đăng nhập để lưu tiến độ học"),u&&(u.textContent="Khách"),b&&(b.innerHTML='<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>'),p&&(p.innerHTML=`
            <a href="javascript:void(0)" onclick="window.openLoginPrompt && window.openLoginPrompt()" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #4ade80; font-size: 0.88rem; font-weight: 700; text-decoration: none; transition: all 0.2s;">
              <i class="fa-brands fa-google" style="color: #4ade80;"></i> <span>Đăng nhập Google</span>
            </a>
          `)})}function f(){const e=i(),t=n(),r=t?t.name||t.displayName||(t.email?t.email.split("@")[0]:"Học viên"):"Khách (Chưa đăng nhập)",c=t?t.email||"":"Đăng nhập để lưu tiến độ học",s=t?t.role==="super_admin"?"Super Admin":t.role==="admin"?"Admin":t.role==="teacher"?"Giáo viên":"Học viên":"Khách",u=t&&(t.picture||t.avatar)?t.picture||t.avatar:"";return`
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
      <div class="auth-container ${t?"logged-in":"logged-out"}" style="width: 100%; border-bottom: 1px solid var(--border-glass, rgba(255,255,255,0.12)); padding-bottom: 12px; margin-bottom: 12px; position: relative;">
        <div class="user-dropdown" style="width: 100%; position: relative;">
          <div class="user-profile sidebar-profile-card" onclick="window.toggleGlobalUserDropdown && window.toggleGlobalUserDropdown(event)"
            style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: rgba(255, 255, 255, 0.04); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.2s ease;">
            <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
              <div class="sidebar-avatar-wrap" style="flex-shrink: 0;">
                ${u?`<img class="user-avatar-img" src="${u}" alt="Avatar" style="display: block; width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-blue, #38bdf8);">`:'<div class="user-avatar sidebar-avatar-placeholder" style="width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white;"><i class="fa-solid fa-user"></i></div>'}
              </div>
              <div class="user-info" style="min-width: 0; flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                <span class="user-name" style="font-weight: 700; font-size: 0.92rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r}</span>
                <span class="user-sub" style="font-size: 0.72rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c}</span>
                <span class="user-role-badge" style="font-size: 0.68rem; margin-top: 2px; align-self: flex-start;">${s}</span>
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
                <i class="fa-solid fa-gamepad" style="color: #fbbf24;"></i> <span>Lịch sử chơi & Xếp hạng</span>
              </a>
            </li>
            <li class="sidebar-auth-action-item">
              ${t?`
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
          <li class="sidebar-item ${e==="home"?"active":""}" onclick="window.location.href = '/'">
            <i class="fa-solid fa-house"></i> <span>Trang chủ</span>
          </li>
        </ul>

        <!-- DANH MỤC: HỌC TẬP -->
        <div class="sidebar-section-label">Học Tập</div>
        <ul class="sidebar-menu" style="margin-bottom: 8px;">
          <li class="sidebar-item ${e==="roadmap"?"active":""}" onclick="window.location.href = '/index.html#roadmap'">
            <i class="fa-solid fa-route" style="color: #60a5fa;"></i> <span>Lộ trình</span>
          </li>
          <li class="sidebar-item ${e==="vocabulary"?"active":""}" onclick="window.location.href = '/detail-list.html'">
            <i class="fa-solid fa-font" style="color: #38bdf8;"></i> <span>Từ vựng HSK</span>
          </li>
          <li class="sidebar-item ${e==="radicals"?"active":""}" onclick="window.location.href = '/chinese-radicals.html'">
            <i class="fa-solid fa-shapes" style="color: #a855f7;"></i> <span>Bảng Bộ Thủ</span>
          </li>
          <li class="sidebar-item ${e==="phonetics"?"active":""}" onclick="window.location.href = '/chinese-phonetics.html'">
            <i class="fa-solid fa-table-cells" style="color: #38bdf8;"></i> <span>Bảng Phiên Âm (Pinyin)</span>
          </li>
          <li class="sidebar-item ${e==="hanzi"?"active":""}" onclick="window.location.href = '/hanzi-writer.html'">
            <i class="fa-solid fa-pen-nib" style="color: #f59e0b;"></i> <span>Tập viết chữ Hán</span>
          </li>
          <li class="sidebar-item ${e==="grammar"?"active":""}" onclick="window.location.href = '/hsk-grammar.html'">
            <i class="fa-solid fa-spell-check" style="color: #34d399;"></i> <span>Sổ tay Ngữ Pháp</span>
          </li>
        </ul>

        <!-- DANH MỤC: TRÒ CHƠI -->
        <div class="sidebar-section-label">Trò Chơi</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${e==="games"?"active":""}" onclick="window.location.href = '/quiz-game.html'">
            <i class="fa-solid fa-gamepad" style="color: #f59e0b;"></i> <span>Trò Chơi Ôn Tập</span>
          </li>
        </ul>

        <!-- DANH MỤC: KỸ NĂNG -->
        <div class="sidebar-section-label">Kỹ Năng & Video</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${e==="shadowing"?"active":""}" onclick="window.location.href = '/video-dictation.html?mode=shadowing'">
            <i class="fa-solid fa-microphone-lines" style="color: #10b981;"></i> <span>Shadowing Video</span>
          </li>
          <li class="sidebar-item ${e==="dictation"?"active":""}" onclick="window.location.href = '/video-dictation.html?mode=dictation'">
            <i class="fa-solid fa-pen-to-square" style="color: #38bdf8;"></i> <span>Chép Chính Tả</span>
          </li>
          <li class="sidebar-item ${e==="reading"?"active":""}" onclick="window.location.href = '/reading-practice.html'">
            <i class="fa-solid fa-book-open-reader" style="color: #ec4899;"></i> <span>Luyện Đọc HSK</span>
          </li>
          <li class="sidebar-item ${e==="writing"?"active":""}" onclick="window.location.href = '/writing-practice.html'">
            <i class="fa-solid fa-feather-pointed" style="color: #a855f7;"></i> <span>Luyện Viết & AI Chấm</span>
          </li>
          <li class="sidebar-item ${e==="speaking"?"active":""}" onclick="window.location.href = '/speaking-practice.html'">
            <i class="fa-solid fa-microphone-lines" style="color: #f59e0b;"></i> <span>Luyện Nói</span>
          </li>
          <li class="sidebar-item ${e==="translation"?"active":""}" onclick="window.location.href = '/translation-practice.html'">
            <i class="fa-solid fa-language" style="color: #06b6d4;"></i> <span>Luyện Dịch &amp; Nghe Đoạn</span>
          </li>
          <li class="sidebar-item ${e==="sentence-reorder"?"active":""}" onclick="window.location.href = '/sentence-reorder.html'">
            <i class="fa-solid fa-arrow-down-short-wide" style="color: #38bdf8;"></i> <span>Sắp Xếp Câu</span>
          </li>
          <li class="sidebar-item ${e==="ai-dialogue"?"active":""}" onclick="window.location.href = '/ai-dialogue.html'">
            <i class="fa-solid fa-comments" style="color: #a855f7;"></i> <span>Hội Thoại AI</span>
          </li>
          <li class="sidebar-item ${e==="rules"?"active":""}" onclick="window.location.href = '/han-viet-rules.html'">
            <i class="fa-solid fa-book-bookmark" style="color: #8b5cf6;"></i> <span>Quy Tắc Hán Việt</span>
          </li>
          <li class="sidebar-item ${e==="rank"?"active":""}" onclick="window.location.href = '/rank.html'">
            <i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span>Bảng Xếp Hạng</span>
          </li>
          <li class="sidebar-item ${e==="documents"?"active":""}" onclick="window.location.href = '/documents.html'">
            <i class="fa-solid fa-book-bookmark" style="color: #06b6d4;"></i> <span>Kho Sách &amp; Tài Liệu</span>
          </li>
        </ul>

        <!-- DANH MỤC: CỘNG ĐỒNG & KHẢO SÁT -->
        <div class="sidebar-section-label">Cộng Đồng &amp; Góp Ý</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item" onclick="if(window.openSurveyModal){ window.openSurveyModal(); } else { window.open('https://forms.gle/WaqZsrYrCZfAN5xn6', '_blank'); }" style="cursor: pointer;">
            <i class="fa-solid fa-clipboard-question" style="color: #ec4899;"></i> <span>Khảo sát ý kiến</span>
          </li>
        </ul>

        ${t&&(t.role==="super_admin"||t.role==="admin"||t.role==="teacher"||t.email&&(t.email.includes("phanphiphu")||t.email.includes("thaihong162004")||t.email.includes("hongtai")))?`
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
    `}window.openGlobalSidebar=function(){m();const e=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html");if(e&&window.innerWidth>900){document.body.classList.remove("sidebar-collapsed"),localStorage.setItem("sidebar_collapsed","false");return}const t=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),r=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");t&&(t.classList.add("open","active"),t.style.pointerEvents="auto"),r&&(!e||window.innerWidth<=900)&&r.classList.add("active"),document.body.classList.add("sidebar-open")},window.closeGlobalSidebar=function(){const e=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),t=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");e&&e.classList.remove("open","active"),t&&t.classList.remove("active"),document.body.classList.remove("sidebar-open")},window.toggleGlobalSidebar=function(){if((window.location.pathname==="/"||window.location.pathname.endsWith("/index.html"))&&window.innerWidth>900){window.toggleSidebarCollapse?window.toggleSidebarCollapse():document.body.classList.toggle("sidebar-collapsed");return}const t=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar");t&&(t.classList.contains("open")||t.classList.contains("active")||document.body.classList.contains("sidebar-open"))?window.closeGlobalSidebar():window.openGlobalSidebar()},window.toggleGlobalUserDropdown=function(e){e&&(e.stopPropagation(),typeof e.preventDefault=="function"&&e.preventDefault());const t=e&&e.target?e.target.closest(".user-dropdown"):null;t?t.classList.toggle("show-menu"):document.querySelectorAll(".user-dropdown").forEach(c=>c.classList.toggle("show-menu"))},window.toggleUserDropdown=window.toggleGlobalUserDropdown,window.handleGlobalLogout=async function(e){e&&(e.stopPropagation(),typeof e.preventDefault=="function"&&e.preventDefault());try{await fetch("/api/auth/logout",{method:"POST",credentials:"include"})}catch{}if(localStorage.removeItem("user"),localStorage.removeItem("currentUser"),localStorage.removeItem("hongtai_user"),localStorage.removeItem("hongtai_current_user"),localStorage.removeItem("session_token"),sessionStorage.removeItem("user"),typeof google<"u"&&google.accounts&&google.accounts.id)try{google.accounts.id.disableAutoSelect()}catch{}typeof window.handleLogout=="function"?window.handleLogout(e):window.location.reload()},window.openLoginPrompt=function(){const e=document.getElementById("app-login-modal")||document.getElementById("auth-required-modal");e?(e.style.display="flex",document.body.style.overflow="hidden"):window.location.href="/?login=true"},document.addEventListener("keydown",function(e){e.key==="Escape"&&(window.closeGlobalSidebar(),document.querySelectorAll(".user-dropdown.show-menu").forEach(t=>t.classList.remove("show-menu")))}),document.addEventListener("click",function(e){e.target.closest(".user-dropdown")||document.querySelectorAll(".user-dropdown.show-menu").forEach(t=>t.classList.remove("show-menu"))}),window.closeAnnouncementTicker=function(){const e=document.getElementById("home-announcement-ticker")||document.querySelector(".announcement-ticker-bar");if(e){e.classList.add("dismissed"),setTimeout(()=>{e.style.display="none"},350);try{sessionStorage.setItem("hongtai_ticker_dismissed","true")}catch{}}};function l(){try{if(sessionStorage.getItem("hongtai_ticker_dismissed")==="true"){const e=document.getElementById("home-announcement-ticker")||document.querySelector(".announcement-ticker-bar");e&&(e.style.display="none")}}catch{}}function g(){l();const e=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html");e&&window.innerWidth>=768&&(document.body.classList.remove("sidebar-collapsed"),localStorage.setItem("sidebar_collapsed","false"));let t=document.querySelector(".sidebar-backdrop");if(t?e&&t.classList.add("on-index"):(t=document.createElement("div"),t.className="sidebar-backdrop"+(e?" on-index":""),t.id="global-sidebar-backdrop",document.body.appendChild(t)),t.addEventListener("click",function(p){window.closeGlobalSidebar()}),!document.querySelector(".app-sidebar")&&!e){const p=document.createElement("div");p.id="global-sidebar-mount",p.innerHTML=f(),document.body.insertBefore(p.firstElementChild,document.body.firstChild)}m(),window.addEventListener("storage",m),window.addEventListener("user-auth-changed",m),setTimeout(m,500),setTimeout(m,1500),document.querySelectorAll(".app-sidebar, .global-app-sidebar").forEach(p=>{p.addEventListener("click",w=>{w.target.closest(".user-dropdown")||document.querySelectorAll(".user-dropdown.show-menu").forEach(v=>v.classList.remove("show-menu")),w.stopPropagation()})});const c=()=>{document.querySelectorAll(".app-sidebar .sidebar-item, .global-app-sidebar .sidebar-item, .app-sidebar .sidebar-subitem, .global-app-sidebar .sidebar-subitem").forEach(p=>{p.classList.contains("sidebar-dropdown-toggle")||(p.style.pointerEvents="auto",p.addEventListener("click",()=>{window.innerWidth<=900&&setTimeout(()=>{window.closeGlobalSidebar()},120)}))})};c(),setTimeout(c,600);const s=document.getElementById("menu-bubble-widget");if(s&&s.remove(),!(window.location.pathname==="/"||window.location.pathname.endsWith("/index.html")||window.location.pathname==="")){const p=document.getElementById("floating-theme-widget");p&&p.remove()}h(),setTimeout(h,300);const b=()=>{document.querySelectorAll(".menu-toggle-btn, .global-hamburger-btn, .sidebar-open-btn, .top-menu-btn, #top-sidebar-toggle-btn, #sidebar-expand-float-btn, .sidebar-expand-float-btn, #mobile-nav-toggle-btn, .header-icon-btn, .sidebar-toggle-btn, .topbar-comic-menu-btn, #mobile-sidebar-toggle-btn").forEach(p=>{p.onclick=window.toggleGlobalSidebar})};b(),setTimeout(b,500),setTimeout(b,1200)}function h(){const e=document.querySelector(".global-hamburger-btn, #mobile-nav-toggle-btn, #top-sidebar-toggle-btn, #mobile-sidebar-toggle-btn");if(e){e.onclick=window.toggleGlobalSidebar;return}const t=[{container:".navbar .nav-container",insertBefore:".nav-brand"},{container:".app-top-nav-inner > div:first-child",insertBefore:":first-child"},{container:".reorder-header-inner > div:first-child",insertBefore:":first-child"},{container:".diag-header-inner > div:first-child",insertBefore:":first-child"},{container:".top-bar",insertBefore:":first-child"},{container:".rd-header-left",insertBefore:".rd-back-btn"},{container:".dict-top-nav",insertBefore:".dict-brand"},{container:".rank-header-nav",insertBefore:".rank-brand-logo"},{container:".header-title-wrap",insertBefore:".back-btn"},{container:".phonetics-header .brand-box",insertBefore:":first-child"},{container:".hanzi-header .brand-box",insertBefore:":first-child"},{container:".grammar-header .brand-box",insertBefore:":first-child"},{container:".header-card > div:first-child",insertBefore:":first-child"},{container:".header-panel .logo",insertBefore:":first-child"},{container:".rules-header .rules-title-group",insertBefore:":first-child"},{container:".topbar-left-cluster",insertBefore:":first-child"}];for(const r of t){const c=document.querySelector(r.container);if(c){if(c.querySelector(".global-hamburger-btn, .menu-toggle-btn, #sidebar-expand-float-btn, #mobile-sidebar-toggle-btn"))break;const s=document.createElement("button");if(s.className="header-icon-btn global-hamburger-btn",s.id="global-hamburger-btn",s.title="Mở Menu Danh Mục",s.setAttribute("aria-label","Mở Menu Danh Mục"),s.innerHTML='<i class="fa-solid fa-bars"></i>',s.onclick=window.toggleGlobalSidebar,r.insertBefore===":first-child")c.insertBefore(s,c.firstChild);else{const u=c.querySelector(r.insertBefore);u?c.insertBefore(s,u):c.insertBefore(s,c.firstChild)}break}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",g):g()})();
