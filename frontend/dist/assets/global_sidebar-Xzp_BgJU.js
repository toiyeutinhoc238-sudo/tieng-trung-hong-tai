(function(){const m=document.createElement("link").relList;if(m&&m.supports&&m.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))g(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const f of o.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&g(f)}).observe(document,{childList:!0,subtree:!0});function u(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function g(n){if(n.ep)return;n.ep=!0;const o=u(n);fetch(n.href,o)}})();(function(){function x(){const e=window.location.pathname.toLowerCase(),i=window.location.search.toLowerCase();return e==="/"||e.endsWith("/index.html")?i.includes("tab=flashcards")?"flashcards":i.includes("view=roadmap")||window.location.hash.includes("roadmap")?"roadmap":"home":e.includes("video-dictation")?i.includes("mode=shadowing")?"shadowing":"dictation":e.includes("reading-practice")?"reading":e.includes("chinese-phonetics")?"phonetics":e.includes("chinese-radicals")?"radicals":e.includes("hanzi-writer")?"hanzi":e.includes("hsk-grammar")?"grammar":e.includes("lesson-texts")?"texts":e.includes("detail-list")?"vocabulary":e.includes("quiz-game")?"games":e.includes("han-viet-rules")?"rules":e.includes("rank")?"rank":""}function m(){try{const e=localStorage.getItem("user")||localStorage.getItem("hongtai_current_user")||localStorage.getItem("currentUser")||sessionStorage.getItem("user");if(e)return JSON.parse(e)}catch{}return null}function u(){const e=m();document.querySelectorAll(".app-sidebar, .global-app-sidebar").forEach(a=>{const l=a.querySelector(".user-name, #user-display-name"),r=a.querySelector(".user-sub, #user-display-email"),t=a.querySelector(".user-role-badge, #user-display-role"),d=a.querySelector(".sidebar-avatar-wrap");if(e&&(e.name||e.email)){const p=e.name||e.displayName||(e.email?e.email.split("@")[0]:"Học viên"),w=e.email||"",v=e.role==="super_admin"?"Super Admin":e.role==="admin"?"Admin":e.role==="teacher"?"Giáo viên":"Học viên",h=e.picture||e.avatar||"";l&&(l.textContent=p),r&&(r.textContent=w),t&&(t.textContent=v),d&&(h?d.innerHTML=`<img class="user-avatar-img" src="${h}" alt="Avatar" style="display: block; width: 44px; height: 44px; border-radius: 50%; object-fit: cover;">`:d.innerHTML='<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>')}else l&&(l.textContent="Khách (Chưa đăng nhập)"),r&&(r.textContent="Đăng nhập để lưu tiến độ học"),t&&(t.textContent="Khách"),d&&(d.innerHTML='<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>')})}function g(){const e=x(),i=m(),a=i?i.name||i.displayName||(i.email?i.email.split("@")[0]:"Học viên"):"Khách (Chưa đăng nhập)",l=i?i.email||"":"Đăng nhập để lưu tiến độ học",r=i?i.role==="super_admin"?"Super Admin":i.role==="admin"?"Admin":i.role==="teacher"?"Giáo viên":"Học viên":"Khách",t=i&&(i.picture||i.avatar)?i.picture||i.avatar:"";return`
    <aside class="app-sidebar global-app-sidebar" id="global-app-sidebar">
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

      <!-- User Account Card -->
      <div class="auth-container" style="width: 100%; border-bottom: 1px solid var(--border-glass, rgba(255,255,255,0.12)); padding-bottom: 12px; margin-bottom: 12px;">
        <div class="sidebar-profile-card" onclick="if(window.location.pathname !== '/' && !window.location.pathname.endsWith('/index.html')) { window.location.href='/'; }">
          <div class="sidebar-avatar-wrap">
            ${t?`<img class="user-avatar-img" src="${t}" alt="Avatar" style="display: block; width: 44px; height: 44px; border-radius: 50%; object-fit: cover;">`:'<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>'}
          </div>
          <div class="user-info">
            <span class="user-name">${a}</span>
            <span class="user-sub">${l}</span>
            <span class="user-role-badge">${r}</span>
          </div>
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
          <li class="sidebar-item ${e==="texts"?"active":""}" onclick="window.location.href = '/lesson-texts.html'">
            <i class="fa-solid fa-comments" style="color: #fb923c;"></i> <span>Bài Khóa & Hội Thoại</span>
          </li>
        </ul>

        <!-- DANH MỤC: TRÒ CHƠI -->
        <div class="sidebar-section-label">Trò Chơi</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${e==="games"?"active":""}" onclick="window.location.href = '/quiz-game.html'">
            <i class="fa-solid fa-gamepad" style="color: #f59e0b;"></i> <span>Trò Chơi Ôn Tập</span>
            <span style="font-size:0.68rem; background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; padding:2px 7px; border-radius:6px; font-weight:800; margin-left:auto; white-space:nowrap;">🔥 5 Game</span>
          </li>
        </ul>

        <!-- DANH MỤC: KỸ NĂNG -->
        <div class="sidebar-section-label">Kỹ Năng & Video</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${e==="shadowing"?"active":""}" onclick="window.location.href = '/video-dictation.html?mode=shadowing'">
            <i class="fa-solid fa-microphone-lines" style="color: #10b981;"></i> <span>Shadowing Video</span>
            <span style="font-size:0.68rem; background:linear-gradient(135deg, #10b981, #059669); color:#fff; padding:2px 7px; border-radius:6px; font-weight:800; margin-left:auto; white-space:nowrap;">🔥 24 Video</span>
          </li>
          <li class="sidebar-item ${e==="dictation"?"active":""}" onclick="window.location.href = '/video-dictation.html?mode=dictation'">
            <i class="fa-solid fa-pen-to-square" style="color: #38bdf8;"></i> <span>Chép Chính Tả</span>
            <span style="font-size:0.68rem; background:linear-gradient(135deg, #0284c7, #2563eb); color:#fff; padding:2px 7px; border-radius:6px; font-weight:800; margin-left:auto; white-space:nowrap;">🔥 24 Video</span>
          </li>
          <li class="sidebar-item ${e==="reading"?"active":""}" onclick="window.location.href = '/reading-practice.html'">
            <i class="fa-solid fa-book-open-reader" style="color: #ec4899;"></i> <span>Luyện Đọc HSK</span>
            <span style="font-size:0.68rem; background:linear-gradient(135deg, #ec4899, #db2777); color:#fff; padding:2px 7px; border-radius:6px; font-weight:800; margin-left:auto; white-space:nowrap;">🔥 33 Bài</span>
          </li>
          <li class="sidebar-item ${e==="rules"?"active":""}" onclick="window.location.href = '/han-viet-rules.html'">
            <i class="fa-solid fa-book-bookmark" style="color: #8b5cf6;"></i> <span>Quy Tắc Hán Việt</span>
          </li>
          <li class="sidebar-item ${e==="rank"?"active":""}" onclick="window.location.href = '/rank.html'">
            <i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span>Bảng Xếp Hạng</span>
          </li>
        </ul>

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
    `}window.openGlobalSidebar=function(){u();const e=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html");if(e&&window.innerWidth>900){document.body.classList.remove("sidebar-collapsed"),localStorage.setItem("sidebar_collapsed","false");return}const i=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),a=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");i&&(i.classList.add("open","active"),i.style.pointerEvents="auto"),a&&(!e||window.innerWidth<=900)&&a.classList.add("active"),document.body.classList.add("sidebar-open")},window.closeGlobalSidebar=function(){if((window.location.pathname==="/"||window.location.pathname.endsWith("/index.html"))&&window.innerWidth>900){document.body.classList.add("sidebar-collapsed"),localStorage.setItem("sidebar_collapsed","true");return}const i=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),a=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");i&&i.classList.remove("open","active"),a&&a.classList.remove("active"),document.body.classList.remove("sidebar-open")},window.toggleGlobalSidebar=function(){if((window.location.pathname==="/"||window.location.pathname.endsWith("/index.html"))&&window.innerWidth>900){window.toggleSidebarCollapse?window.toggleSidebarCollapse():document.body.classList.toggle("sidebar-collapsed");return}const i=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar");i&&(i.classList.contains("open")||i.classList.contains("active")||document.body.classList.contains("sidebar-open"))?window.closeGlobalSidebar():window.openGlobalSidebar()},document.addEventListener("keydown",function(e){e.key==="Escape"&&window.closeGlobalSidebar()});function n(){const e=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html");let i=document.querySelector(".sidebar-backdrop");if(i?e&&i.classList.add("on-index"):(i=document.createElement("div"),i.className="sidebar-backdrop"+(e?" on-index":""),i.id="global-sidebar-backdrop",document.body.appendChild(i)),i.addEventListener("click",function(t){window.closeGlobalSidebar()}),!document.querySelector(".app-sidebar")&&!e){const t=document.createElement("div");t.id="global-sidebar-mount",t.innerHTML=g(),document.body.insertBefore(t.firstElementChild,document.body.firstChild)}u(),window.addEventListener("storage",u),window.addEventListener("user-auth-changed",u),setTimeout(u,500),setTimeout(u,1500),document.querySelectorAll(".app-sidebar, .global-app-sidebar").forEach(t=>{t.addEventListener("click",d=>{d.stopPropagation()})});const l=()=>{document.querySelectorAll(".app-sidebar .sidebar-item, .global-app-sidebar .sidebar-item, .app-sidebar .sidebar-subitem, .global-app-sidebar .sidebar-subitem").forEach(t=>{t.classList.contains("sidebar-dropdown-toggle")||(t.style.pointerEvents="auto",t.addEventListener("click",()=>{window.innerWidth<=900&&setTimeout(()=>{window.closeGlobalSidebar()},120)}))})};l(),setTimeout(l,600),o();const r=()=>{document.querySelectorAll(".menu-toggle-btn, .global-hamburger-btn, .sidebar-open-btn, .top-menu-btn, #top-sidebar-toggle-btn, #sidebar-expand-float-btn, .sidebar-expand-float-btn, #mobile-nav-toggle-btn").forEach(t=>{t.onclick=window.toggleGlobalSidebar})};r(),setTimeout(r,500)}function o(){if(document.getElementById("menu-bubble-widget"))return;const e=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html"),i=document.createElement("div");i.className="menu-bubble-widget"+(e?" on-index-page":""),i.id="menu-bubble-widget";const a=document.createElement("button");a.className="menu-bubble-btn",a.id="menu-bubble-btn",a.title="Mở Menu Danh Mục (☰)",a.setAttribute("aria-label","Mở Menu Danh Mục"),a.innerHTML='<i class="fa-solid fa-bars"></i>',i.appendChild(a),document.body.appendChild(i),f(i,a)}function f(e,i){let a=!1,l=0,r=0,t=0,d=0,p=!1;function w(s){return s.touches&&s.touches.length>0?{x:s.touches[0].clientX,y:s.touches[0].clientY}:{x:s.clientX,y:s.clientY}}function v(s){if(s.button&&s.button!==0)return;const c=w(s);l=c.x,r=c.y;const b=e.getBoundingClientRect();t=b.left,d=b.top,p=!1,a=!0,e.style.transition="none"}function h(s){if(!a)return;const c=w(s),b=c.x-l,y=c.y-r;if(!p&&(Math.abs(b)>6||Math.abs(y)>6)&&(p=!0),p){s.cancelable&&s.preventDefault();const k=window.innerWidth-e.offsetWidth-10,L=window.innerHeight-e.offsetHeight-10,C=Math.max(10,Math.min(k,t+b)),M=Math.max(10,Math.min(L,d+y));e.style.left=`${C}px`,e.style.top=`${M}px`,e.style.bottom="auto",e.style.right="auto"}}function S(s){if(a)if(a=!1,e.style.transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",!p)window.toggleGlobalSidebar();else{const c=e.getBoundingClientRect(),b=window.innerWidth/2;c.left+c.width/2<b?(e.style.left="16px",e.style.right="auto"):(e.style.left=`${window.innerWidth-c.width-16}px`,e.style.right="auto")}}i.addEventListener("touchstart",v,{passive:!1}),window.addEventListener("touchmove",h,{passive:!1}),window.addEventListener("touchend",S),i.addEventListener("mousedown",v),window.addEventListener("mousemove",h),window.addEventListener("mouseup",S)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",n):n()})();
