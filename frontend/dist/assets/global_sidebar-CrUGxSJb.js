(function(){const u=document.createElement("link").relList;if(u&&u.supports&&u.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))b(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const e of s.addedNodes)e.tagName==="LINK"&&e.rel==="modulepreload"&&b(e)}).observe(document,{childList:!0,subtree:!0});function f(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function b(n){if(n.ep)return;n.ep=!0;const s=f(n);fetch(n.href,s)}})();(function(){function g(){const e=window.location.pathname.toLowerCase(),i=window.location.search.toLowerCase();return e==="/"||e.endsWith("/index.html")?i.includes("tab=flashcards")?"flashcards":i.includes("view=roadmap")||window.location.hash.includes("roadmap")?"roadmap":"home":e.includes("video-dictation")?i.includes("mode=shadowing")?"shadowing":"dictation":e.includes("reading-practice")?"reading":e.includes("chinese-phonetics")?"phonetics":e.includes("chinese-radicals")?"radicals":e.includes("hanzi-writer")?"hanzi":e.includes("hsk-grammar")?"grammar":e.includes("lesson-texts")?"texts":e.includes("detail-list")?"vocabulary":e.includes("quiz-game")?"games":e.includes("han-viet-rules")?"rules":e.includes("rank")?"rank":""}function u(){try{const e=localStorage.getItem("hongtai_current_user")||localStorage.getItem("currentUser");if(e)return JSON.parse(e)}catch{}return null}function f(){const e=g(),i=u(),a=i?i.name||i.displayName||"Học viên":"Khách (Chưa đăng nhập)",r=i?i.email||"":"Đăng nhập để lưu tiến độ học",d=i?i.role==="super_admin"?"Super Admin":i.role==="admin"?"Admin":i.role==="teacher"?"Giáo viên":"Học viên":"Khách",t=i&&i.picture?i.picture:"";return`
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
            ${t?`<img class="user-avatar-img" src="${t}" alt="Avatar" style="display: block;">`:'<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>'}
          </div>
          <div class="user-info">
            <span class="user-name">${a}</span>
            <span class="user-sub">${r}</span>
            <span class="user-role-badge">${d}</span>
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
    `}window.openGlobalSidebar=function(){if((window.location.pathname==="/"||window.location.pathname.endsWith("/index.html"))&&window.innerWidth>900){document.body.classList.remove("sidebar-collapsed"),localStorage.setItem("sidebar_collapsed","false");return}const i=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),a=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");i&&(i.classList.add("open","active"),i.style.pointerEvents="auto"),a&&window.innerWidth<=900&&a.classList.add("active"),document.body.classList.add("sidebar-open")},window.closeGlobalSidebar=function(){if((window.location.pathname==="/"||window.location.pathname.endsWith("/index.html"))&&window.innerWidth>900){document.body.classList.add("sidebar-collapsed"),localStorage.setItem("sidebar_collapsed","true");return}const i=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),a=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");i&&i.classList.remove("open","active"),a&&a.classList.remove("active"),document.body.classList.remove("sidebar-open")},window.toggleGlobalSidebar=function(){if((window.location.pathname==="/"||window.location.pathname.endsWith("/index.html"))&&window.innerWidth>900){window.toggleSidebarCollapse?window.toggleSidebarCollapse():document.body.classList.toggle("sidebar-collapsed");return}const i=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar");i&&(i.classList.contains("open")||i.classList.contains("active")||document.body.classList.contains("sidebar-open"))?window.closeGlobalSidebar():window.openGlobalSidebar()},document.addEventListener("keydown",function(e){e.key==="Escape"&&window.closeGlobalSidebar()});function b(){let e=document.querySelector(".sidebar-backdrop");e||(e=document.createElement("div"),e.className="sidebar-backdrop",e.id="global-sidebar-backdrop",document.body.appendChild(e)),e.addEventListener("click",function(t){window.closeGlobalSidebar()});const i=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html");if(!document.querySelector(".app-sidebar")&&!i){const t=document.createElement("div");t.id="global-sidebar-mount",t.innerHTML=f(),document.body.insertBefore(t.firstElementChild,document.body.firstChild)}document.querySelectorAll(".app-sidebar, .global-app-sidebar").forEach(t=>{t.addEventListener("click",m=>{m.stopPropagation()})});const r=()=>{document.querySelectorAll(".app-sidebar .sidebar-item, .global-app-sidebar .sidebar-item, .app-sidebar .sidebar-subitem, .global-app-sidebar .sidebar-subitem").forEach(t=>{t.classList.contains("sidebar-dropdown-toggle")||(t.style.pointerEvents="auto",t.addEventListener("click",()=>{window.innerWidth<=900&&setTimeout(()=>{window.closeGlobalSidebar()},120)}))})};r(),setTimeout(r,600),n();const d=()=>{document.querySelectorAll(".menu-toggle-btn, .global-hamburger-btn, .sidebar-open-btn, .top-menu-btn, #top-sidebar-toggle-btn, #sidebar-expand-float-btn, .sidebar-expand-float-btn, #mobile-nav-toggle-btn").forEach(t=>{t.onclick=window.toggleGlobalSidebar})};d(),setTimeout(d,500)}function n(){if(document.getElementById("menu-bubble-widget"))return;const e=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html"),i=document.createElement("div");i.className="menu-bubble-widget"+(e?" on-index-page":""),i.id="menu-bubble-widget";const a=document.createElement("button");a.className="menu-bubble-btn",a.id="menu-bubble-btn",a.title="Mở Menu Danh Mục (☰)",a.setAttribute("aria-label","Mở Menu Danh Mục"),a.innerHTML='<i class="fa-solid fa-bars"></i>',i.appendChild(a),document.body.appendChild(i),s(i,a)}function s(e,i){let a=!1,r=0,d=0,t=0,m=0,p=!1;function w(o){return o.touches&&o.touches.length>0?{x:o.touches[0].clientX,y:o.touches[0].clientY}:{x:o.clientX,y:o.clientY}}function y(o){if(o.button&&o.button!==0)return;const l=w(o);r=l.x,d=l.y;const c=e.getBoundingClientRect();t=c.left,m=c.top,p=!1,a=!0,e.style.transition="none"}function v(o){if(!a)return;const l=w(o),c=l.x-r,h=l.y-d;if(!p&&(Math.abs(c)>6||Math.abs(h)>6)&&(p=!0),p){o.cancelable&&o.preventDefault();const k=window.innerWidth-e.offsetWidth-10,S=window.innerHeight-e.offsetHeight-10,L=Math.max(10,Math.min(k,t+c)),C=Math.max(10,Math.min(S,m+h));e.style.left=`${L}px`,e.style.top=`${C}px`,e.style.bottom="auto",e.style.right="auto"}}function x(o){if(a)if(a=!1,e.style.transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",!p)window.toggleGlobalSidebar();else{const l=e.getBoundingClientRect(),c=window.innerWidth/2;l.left+l.width/2<c?(e.style.left="16px",e.style.right="auto"):(e.style.left=`${window.innerWidth-l.width-16}px`,e.style.right="auto")}}i.addEventListener("touchstart",y,{passive:!1}),window.addEventListener("touchmove",v,{passive:!1}),window.addEventListener("touchend",x),i.addEventListener("mousedown",y),window.addEventListener("mousemove",v),window.addEventListener("mouseup",x)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",b):b()})();
