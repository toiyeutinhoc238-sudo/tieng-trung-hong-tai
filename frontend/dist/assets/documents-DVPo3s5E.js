import"./global_sidebar-DU5b37H7.js";/* empty css              */window.pdfjsLib&&(window.pdfjsLib.GlobalWorkerOptions.workerSrc="/vendor/pdfjs/pdf.worker.min.js");(function(){const y="";let N=[],ee="all",v="",m=null,g=null,r=1,b=0,R=!1,q=null,L=1.25,$="fitWidth",te=null,w=localStorage.getItem("hongtai_reader_theme")||"dark",M=[],A="page",E=[],ge="#fef08a",ue=0,me=0,C,j,P,F,c,f,fe,h,ne,ae,oe,D,O,z,H,K,u,W,U,ie,k,X,G,re;document.addEventListener("DOMContentLoaded",()=>{be(),we(),Ee(),ke()});function be(){C=document.getElementById("documents-grid"),j=document.getElementById("documents-search-input"),P=document.getElementById("documents-search-clear"),F=document.querySelectorAll(".documents-filter-btn"),c=document.getElementById("ebook-reader-modal"),f=document.getElementById("pdf-render-canvas"),f&&(fe=f.getContext("2d")),h=document.getElementById("reader-page-input"),ne=document.getElementById("reader-total-pages"),ae=document.getElementById("reader-book-title"),oe=document.getElementById("reader-book-meta"),D=document.getElementById("reader-btn-prev"),O=document.getElementById("reader-btn-next"),z=document.getElementById("reader-float-prev"),H=document.getElementById("reader-float-next"),K=document.getElementById("reader-loading-overlay"),u=document.getElementById("reader-comments-drawer"),W=document.getElementById("reader-comments-list"),U=document.getElementById("reader-comment-input"),ie=document.getElementById("btn-submit-comment"),k=document.getElementById("reader-notes-drawer"),X=document.getElementById("reader-notes-list"),G=document.getElementById("reader-note-input"),re=document.getElementById("btn-submit-note")}function we(){j&&j.addEventListener("input",a=>{v=a.target.value.trim().toLowerCase(),P&&(P.style.display=v?"block":"none"),V()}),P&&P.addEventListener("click",()=>{j&&(j.value=""),v="",P.style.display="none",V()}),F.forEach(a=>{a.addEventListener("click",()=>{F.forEach(d=>d.classList.remove("active")),a.classList.add("active"),ee=a.getAttribute("data-category")||"all",V()})}),D&&D.addEventListener("click",J),O&&O.addEventListener("click",Y),z&&z.addEventListener("click",J),H&&H.addEventListener("click",Y),h&&h.addEventListener("change",a=>{const d=parseInt(a.target.value,10);!isNaN(d)&&d>=1&&d<=b?T(d):h.value=r});const t=document.getElementById("reader-zoom-in"),e=document.getElementById("reader-zoom-out"),n=document.getElementById("reader-zoom-fit");t&&t.addEventListener("click",()=>{$="custom",L=Math.min(3,L+.2),T(r)}),e&&e.addEventListener("click",()=>{$="custom",L=Math.max(.6,L-.2),T(r)}),n&&n.addEventListener("click",()=>{$=$==="fitWidth"?"fitPage":"fitWidth",l($==="fitWidth"?"Đã chỉnh: Vừa chiều rộng":"Đã chỉnh: Vừa trang"),T(r)});const o=document.getElementById("reader-theme-toggle");o&&o.addEventListener("click",Ae);const i=document.getElementById("reader-btn-back");i&&i.addEventListener("click",ce);const s=document.getElementById("reader-toggle-comments");s&&s.addEventListener("click",Pe);const Q=document.getElementById("drawer-close-comments");Q&&Q.addEventListener("click",()=>x(u));const S=document.getElementById("reader-toggle-notes");S&&S.addEventListener("click",Ne);const ve=document.getElementById("drawer-close-notes");ve&&ve.addEventListener("click",()=>x(k)),document.querySelectorAll(".drawer-filter-tab").forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll(".drawer-filter-tab").forEach(d=>d.classList.remove("active")),a.classList.add("active"),A=a.getAttribute("data-mode")||"page",_()})}),document.querySelectorAll(".color-dot").forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll(".color-dot").forEach(d=>d.classList.remove("active")),a.classList.add("active"),ge=a.getAttribute("data-color")||"#fef08a"})}),ie&&ie.addEventListener("click",Ie),re&&re.addEventListener("click",Me),window.addEventListener("keydown",a=>{!c||c.style.display!=="flex"||["INPUT","TEXTAREA"].includes(document.activeElement.tagName)||(a.key==="ArrowRight"||a.key==="PageDown"||a.key===" "?(a.preventDefault(),Y()):a.key==="ArrowLeft"||a.key==="PageUp"?(a.preventDefault(),J()):a.key==="Escape"&&ce())});const de=document.getElementById("reader-viewport");de&&(de.addEventListener("touchstart",a=>{a.touches.length===1&&(ue=a.touches[0].clientX,me=a.touches[0].clientY)},{passive:!0}),de.addEventListener("touchend",a=>{if(a.changedTouches.length===1){const d=a.changedTouches[0].clientX-ue,De=a.changedTouches[0].clientY-me;Math.abs(d)>60&&Math.abs(d)>Math.abs(De)*1.5&&(d<0?Y():J())}},{passive:!0}))}function Ee(){c&&c.addEventListener("contextmenu",t=>(t.preventDefault(),l("🔒 Tài liệu được bảo vệ bản quyền - Chỉ hỗ trợ đọc trực tuyến trên Tiếng Trung HongTai",!0),!1)),window.addEventListener("keydown",t=>{if(c&&c.style.display==="flex"&&(t.ctrlKey||t.metaKey)&&["s","p","u"].includes(t.key.toLowerCase()))return t.preventDefault(),l("🔒 Tính năng in và lưu tệp bị vô hiệu hóa để bảo vệ bản quyền tác giả.",!0),!1}),f&&f.addEventListener("dragstart",t=>t.preventDefault())}async function ke(){try{const e=await(await fetch(`${y}/api/books`,{headers:B()})).json();e.success&&Array.isArray(e.books)&&(N=e.books,xe(),V())}catch(t){console.error("Failed to load books catalog:",t),C&&(C.innerHTML=`
          <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #ef4444;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 12px;"></i>
            <p style="font-weight: 700;">Không thể tải kho sách. Vui lòng kiểm tra kết nối máy chủ.</p>
          </div>
        `)}}function xe(){const t={all:N.length};N.forEach(e=>{t[e.category]=(t[e.category]||0)+1}),F.forEach(e=>{const n=e.getAttribute("data-category"),o=e.querySelector(".documents-filter-count");o&&(o.textContent=t[n]||0)})}function V(){if(!C)return;let t=N.filter(e=>{const n=ee==="all"||e.category===ee,o=!v||e.titleVi&&e.titleVi.toLowerCase().includes(v)||e.titleOriginal&&e.titleOriginal.toLowerCase().includes(v)||e.category&&e.category.toLowerCase().includes(v)||e.description&&e.description.toLowerCase().includes(v);return n&&o});if(t.length===0){C.innerHTML=`
        <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; color: #94a3b8;">
          <i class="fa-solid fa-book-open" style="font-size: 3rem; color: #475569; margin-bottom: 16px;"></i>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #cbd5e1; margin: 0 0 8px 0;">Không tìm thấy sách phù hợp</h3>
          <p style="margin: 0; font-size: 0.95rem;">Thử tìm với từ khóa khác hoặc chuyển sang danh mục Tất cả.</p>
        </div>
      `;return}C.innerHTML=t.map(e=>{const n=he(e.id),o=e.userProgress||n,i=o&&o.lastPage>1;let s="tag-van-hoa";return e.category.includes("HSK")?s="tag-hsk":e.category.includes("Hán Ngữ")?s="tag-han-ngu":e.category.includes("Biên Phiên Dịch")?s="tag-bien-dich":e.category.includes("Giáo Viên")?s="tag-giao-vien":e.category.includes("Văn Học")||e.category.includes("Truyện")?s="tag-van-hoc":e.category.includes("Ngữ Pháp")&&(s="tag-ngu-phap"),`
        <div class="book-card" id="card-${e.id}">
          <div class="book-card-spine"></div>
          
          <div class="book-card-header">
            <span class="book-category-tag ${s}">${p(e.category)}</span>
            <span class="book-size-chip"><i class="fa-regular fa-file-pdf"></i> ${e.sizeMB} MB</span>
          </div>

          <div class="book-card-body">
            <h3 class="book-title-vi" title="${p(e.titleVi)}">${p(e.titleVi)}</h3>
            <p class="book-title-original" title="${p(e.titleOriginal)}">${p(e.titleOriginal)}</p>
            <p class="book-desc">${p(e.description)}</p>
          </div>

          ${i?`
            <div class="book-card-progress">
              <div class="book-progress-text">
                <span><i class="fa-solid fa-bookmark" style="color: #38bdf8;"></i> Đang đọc: Trang ${o.lastPage}${o.totalPages?"/"+o.totalPages:""}</span>
                <span>${o.percentage||0}%</span>
              </div>
              <div class="book-progress-bar-bg">
                <div class="book-progress-bar-fill" style="width: ${o.percentage||0}%;"></div>
              </div>
            </div>
          `:""}

          <div class="book-card-actions">
            <button class="btn-read-book ${i?"has-progress":""}" onclick="window.openBookReader('${e.id}')">
              <i class="fa-solid ${i?"fa-book-open-reader":"fa-book-open"}"></i>
              <span>${i?`Tiếp tục đọc (Trang ${o.lastPage})`:"Đọc Sách Ngay"}</span>
            </button>
            <div class="book-interaction-badges">
              <span class="interaction-badge" title="Bình luận"><i class="fa-regular fa-comment"></i> ${e.totalComments||0}</span>
              ${e.totalUserNotes>0?`<span class="interaction-badge" title="Ghi chú cá nhân"><i class="fa-solid fa-pencil" style="color: #fbbf24;"></i> ${e.totalUserNotes}</span>`:""}
            </div>
          </div>
        </div>
      `}).join("")}window.openBookReader=async function(t){const e=N.find(i=>i.id===t);if(!e)return;m=e,c&&(c.style.display="flex",document.body.style.overflow="hidden",ye(w)),ae&&(ae.textContent=e.titleVi),oe&&(oe.innerHTML=`<span>${e.category}</span> • <span>${e.titleOriginal}</span>`),I(!0,"Đang mở sách và tải trang đầu...");const n=he(t),o=e.userProgress&&e.userProgress.lastPage||n&&n.lastPage||1;r=o,Ce(t),Se(t);try{const i=`${y}/api/books/${t}/stream`;g=await window.pdfjsLib.getDocument({url:i,withCredentials:!0,cMapUrl:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",cMapPacked:!0}).promise,b=g.numPages,ne&&(ne.textContent=`/ ${b}`),h&&(h.max=b,h.value=r),I(!1),se(r),o>1&&l(`Đã khôi phục trang bạn đang đọc dở: Trang ${o}`)}catch(i){console.error("Error loading PDF:",i),I(!1),l("Không thể mở tệp sách. Vui lòng thử lại sau.",!0),ce()}};async function se(t){if(g){R=!0,I(!0,`Đang nạp trang ${t}...`);try{const e=await g.getPage(t),n=document.getElementById("reader-viewport"),o=e.getViewport({scale:1});if($==="fitWidth"&&n){const S=n.clientWidth-48;L=Math.max(.6,Math.min(2.5,S/o.width))}else if($==="fitPage"&&n){const S=n.clientHeight-60;L=Math.max(.6,Math.min(2,S/o.height))}const i=window.devicePixelRatio||1,s=e.getViewport({scale:L*i});f.height=s.height,f.width=s.width,f.style.width=`${s.width/i}px`,f.style.height=`${s.height/i}px`;const Q={canvasContext:fe,viewport:s};await e.render(Q).promise,R=!1,I(!1),q!==null&&(se(q),q=null),r=t,h&&(h.value=t),Le(),$e(t,b),u&&u.classList.contains("open")&&A==="page"&&_()}catch(e){console.error("Error rendering page:",e),R=!1,I(!1)}}}function T(t){R?q=t:se(t)}function J(){r<=1||T(r-1)}function Y(){!g||r>=b||T(r+1)}function Le(){const t=r<=1,e=!g||r>=b;D&&(D.disabled=t),O&&(O.disabled=e),z&&(z.disabled=t),H&&(H.disabled=e)}function I(t,e="Đang tải..."){if(!K)return;K.style.display=t?"flex":"none";const n=K.querySelector(".reader-loading-text");n&&(n.textContent=e)}function ce(){c&&(c.style.display="none",document.body.style.overflow=""),x(u),x(k),g&&(g.destroy(),g=null),V()}function $e(t,e){te&&clearTimeout(te),te=setTimeout(()=>{Te(t,e)},1e3)}async function Te(t,e){if(!m)return;const n=m.id,o={bookId:n,lastPage:t,totalPages:e,percentage:e?Math.min(100,Math.round(t/e*100)):0,updatedAt:Date.now()};Be(n,o);try{await fetch(`${y}/api/books/${n}/progress`,{method:"POST",headers:{"Content-Type":"application/json",...B()},body:JSON.stringify({page:t,totalPages:e})})}catch(i){console.warn("Could not sync reading progress to server:",i)}}function he(t){try{const e=localStorage.getItem(`hongtai_book_progress_${t}`);return e?JSON.parse(e):null}catch{return null}}function Be(t,e){try{localStorage.setItem(`hongtai_book_progress_${t}`,JSON.stringify(e))}catch{}}async function Ce(t){try{const n=await(await fetch(`${y}/api/books/${t}/comments`,{headers:B()})).json();n.success&&Array.isArray(n.comments)&&(M=n.comments,pe(),_())}catch(e){console.error("Failed to fetch comments:",e)}}function pe(){const t=document.getElementById("reader-comments-count-badge");t&&(t.textContent=M.length,t.style.display=M.length>0?"inline-block":"none")}function Pe(){if(!u)return;x(k),u.classList.contains("open")?x(u):(u.classList.add("open"),_())}function _(){if(!W)return;let t=M;A==="page"&&(t=t.filter(n=>Number(n.page)===Number(r)));const e=document.getElementById("comments-current-page-label");if(e&&(e.textContent=A==="page"?`Trang ${r}`:"Tất cả các trang"),t.length===0){W.innerHTML=`
        <div style="text-align: center; padding: 40px 10px; color: #94a3b8;">
          <i class="fa-regular fa-comment-dots" style="font-size: 2.2rem; color: #475569; margin-bottom: 12px;"></i>
          <p style="font-size: 0.9rem; margin: 0;">Chưa có bình luận nào cho ${A==="page"?`trang ${r}`:"sách này"}.</p>
          <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0 0;">Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ ý kiến!</p>
        </div>
      `;return}W.innerHTML=t.map(n=>{const o=(n.authorName||"H").charAt(0).toUpperCase(),i=je(n.createdAt);return`
        <div class="comment-card" id="comment-${n.id}">
          <div class="comment-card-header">
            <div class="comment-user-info">
              ${n.authorPicture?`<img src="${n.authorPicture}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;">`:`<div class="comment-avatar">${o}</div>`}
              <span class="comment-author-name">${p(n.authorName)}</span>
            </div>
            <span class="comment-page-badge" onclick="window.jumpToPage(${n.page})" style="cursor: pointer;" title="Nhảy tới trang ${n.page}">Trang ${n.page}</span>
          </div>
          <div class="comment-content">${p(n.content)}</div>
          <div class="comment-time">${i}</div>
        </div>
      `}).join("")}async function Ie(){if(!U||!m)return;const t=U.value.trim();if(!t){l("Vui lòng nhập nội dung bình luận.",!0);return}try{const n=await(await fetch(`${y}/api/books/${m.id}/comments`,{method:"POST",headers:{"Content-Type":"application/json",...B()},body:JSON.stringify({page:r,content:t})})).json();n.success&&n.comment?(M.unshift(n.comment),U.value="",pe(),_(),l("Đã gửi bình luận thành công!")):l(n.error||"Lỗi gửi bình luận",!0)}catch(e){console.error("Error posting comment:",e),l("Không thể gửi bình luận.",!0)}}async function Se(t){try{const n=await(await fetch(`${y}/api/books/${t}/notes`,{headers:B()})).json();n.success&&Array.isArray(n.notes)&&(E=n.notes,le(),Z())}catch(e){console.error("Failed to fetch notes:",e)}}function le(){const t=document.getElementById("reader-notes-count-badge");t&&(t.textContent=E.length,t.style.display=E.length>0?"inline-block":"none")}function Ne(){if(!k)return;x(u),k.classList.contains("open")?x(k):(k.classList.add("open"),Z())}function Z(){if(X){if(E.length===0){X.innerHTML=`
        <div style="text-align: center; padding: 40px 10px; color: #94a3b8;">
          <i class="fa-solid fa-feather-pointed" style="font-size: 2.2rem; color: #475569; margin-bottom: 12px;"></i>
          <p style="font-size: 0.9rem; margin: 0;">Bạn chưa có ghi chú nào cho cuốn sách này.</p>
          <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0 0;">Ghi lại từ mới, ngữ pháp hoặc lưu ý cá nhân tại từng trang.</p>
        </div>
      `;return}X.innerHTML=E.map(t=>`
        <div class="note-card" style="border-left-color: ${t.color||"#fef08a"};" onclick="window.jumpToPage(${t.page})">
          <div class="note-card-top">
            <span class="note-jump-badge"><i class="fa-solid fa-arrow-turn-down"></i> Trang ${t.page}</span>
            <button class="note-delete-btn" onclick="event.stopPropagation(); window.deleteNote('${t.id}')" title="Xóa ghi chú"><i class="fa-solid fa-trash-can"></i></button>
          </div>
          <div class="note-text">${p(t.content)}</div>
        </div>
      `).join("")}}async function Me(){if(!G||!m)return;const t=G.value.trim();if(!t){l("Vui lòng nhập nội dung ghi chú.",!0);return}try{const n=await(await fetch(`${y}/api/books/${m.id}/notes`,{method:"POST",headers:{"Content-Type":"application/json",...B()},body:JSON.stringify({page:r,content:t,color:ge})})).json();n.success&&n.note&&(E.unshift(n.note),G.value="",le(),Z(),l(`Đã lưu ghi chú cho Trang ${r}!`))}catch(e){console.error("Error saving note:",e),l("Không thể lưu ghi chú.",!0)}}window.deleteNote=async function(t){if(confirm("Bạn có chắc chắn muốn xóa ghi chú này?")&&m)try{(await(await fetch(`${y}/api/books/${m.id}/notes/${t}`,{method:"DELETE",headers:B()})).json()).success&&(E=E.filter(o=>o.id!==t),le(),Z(),l("Đã xóa ghi chú."))}catch(e){console.error("Error deleting note:",e),l("Lỗi xóa ghi chú.",!0)}},window.jumpToPage=function(t){!g||t<1||t>b||T(t)};function x(t){t&&t.classList.remove("open")}function Ae(){c&&(w==="dark"?w="sepia":w==="sepia"?w="light":w="dark",localStorage.setItem("hongtai_reader_theme",w),ye(w))}function ye(t){if(!c)return;c.classList.remove("theme-dark","theme-sepia","theme-light"),c.classList.add(`theme-${t}`);const e=document.querySelector("#reader-theme-toggle i");e&&(t==="dark"?e.className="fa-solid fa-moon":t==="sepia"?e.className="fa-solid fa-sun":e.className="fa-regular fa-sun")}function B(){const t={};try{const n=JSON.parse(localStorage.getItem("user")||sessionStorage.getItem("user")||"{}");n&&n.token&&(t.Authorization=`Bearer ${n.token}`)}catch{}let e=localStorage.getItem("hongtai_guest_device_id");return e||(e="dev_"+Math.random().toString(36).substring(2,10),localStorage.setItem("hongtai_guest_device_id",e)),t["x-guest-id"]=e,t}function l(t,e=!1){if(typeof window.showToast=="function"){window.showToast(t,e);return}const n=document.createElement("div");n.style.cssText=`
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: ${e?"rgba(239, 68, 68, 0.95)":"rgba(15, 23, 42, 0.95)"};
      color: #ffffff;
      border: 1px solid ${e?"#f87171":"rgba(56, 189, 248, 0.4)"};
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 700;
      z-index: 10000000;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      backdrop-filter: blur(8px);
      transition: opacity 0.3s ease;
      text-align: center;
      max-width: 90vw;
    `,n.textContent=t,document.body.appendChild(n),setTimeout(()=>{n.style.opacity="0",setTimeout(()=>n.remove(),300)},2800)}function p(t){return t?String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function je(t){if(!t)return"";const e=Math.floor((Date.now()-new Date(t).getTime())/1e3);return e<60?"Vừa xong":e<3600?`${Math.floor(e/60)} phút trước`:e<86400?`${Math.floor(e/3600)} giờ trước`:e<2592e3?`${Math.floor(e/86400)} ngày trước`:new Date(t).toLocaleDateString("vi-VN")}})();
