import"./global_sidebar-B_BNhh9i.js";/* empty css              */import"./particles-DBEuVAM5.js";window.pdfjsLib&&(window.pdfjsLib.GlobalWorkerOptions.workerSrc="/vendor/pdfjs/pdf.worker.min.js");(function(){const B="";let M=[],ge="all",$="",w=null,v=null,c=1,I=0,ne=!1,oe=null,T=1.25,x="fitWidth",ue=null,L=localStorage.getItem("hongtai_reader_theme")||"dark",O=[],U="page",C=[],Ee="#fef08a",Be=0,$e=0,A,R,z,ie,H,G,D,V,g,y,Ie,E,he,me,fe,F,W,X,Y,se,b,ae,ce,pe,S,le,re,ve;document.addEventListener("DOMContentLoaded",()=>{Se(),Pe(),Ne(),Me(),xe()});function Se(){A=document.getElementById("documents-grid"),R=document.getElementById("documents-search-input"),z=document.getElementById("documents-search-clear"),ie=document.querySelectorAll(".documents-filter-btn"),H=document.getElementById("documents-bookshelf-view"),G=document.getElementById("documents-catalog-view"),D=document.getElementById("btn-view-bookshelf"),V=document.getElementById("btn-view-catalog"),g=document.getElementById("ebook-reader-modal"),y=document.getElementById("pdf-render-canvas"),y&&(Ie=y.getContext("2d")),E=document.getElementById("reader-page-input"),he=document.getElementById("reader-total-pages"),me=document.getElementById("reader-book-title"),fe=document.getElementById("reader-book-meta"),F=document.getElementById("reader-btn-prev"),W=document.getElementById("reader-btn-next"),X=document.getElementById("reader-float-prev"),Y=document.getElementById("reader-float-next"),se=document.getElementById("reader-loading-overlay"),b=document.getElementById("reader-comments-drawer"),ae=document.getElementById("reader-comments-list"),ce=document.getElementById("reader-comment-input"),pe=document.getElementById("btn-submit-comment"),S=document.getElementById("reader-notes-drawer"),le=document.getElementById("reader-notes-list"),re=document.getElementById("reader-note-input"),ve=document.getElementById("btn-submit-note")}function Pe(){R&&R.addEventListener("input",i=>{$=i.target.value.trim().toLowerCase(),z&&(z.style.display=$?"block":"none"),Q()}),z&&z.addEventListener("click",()=>{R&&(R.value=""),$="",z.style.display="none",Q()}),ie.forEach(i=>{i.addEventListener("click",()=>{ie.forEach(r=>r.classList.remove("active")),i.classList.add("active"),ge=i.getAttribute("data-category")||"all",Q()})}),F&&F.addEventListener("click",J),W&&W.addEventListener("click",Z),X&&X.addEventListener("click",J),Y&&Y.addEventListener("click",Z),E&&E.addEventListener("change",i=>{const r=parseInt(i.target.value,10);!isNaN(r)&&r>=1&&r<=I?P(r):E.value=c});const t=document.getElementById("reader-zoom-in"),e=document.getElementById("reader-zoom-out"),n=document.getElementById("reader-zoom-fit");t&&t.addEventListener("click",()=>{x="custom",T=Math.min(3,T+.2),h(`🔍 Phóng to: ${Math.round(T*100)}%`);const i=document.getElementById("reader-viewport");i&&i.scrollTop<60&&(i.scrollTop=0),P(c)}),e&&e.addEventListener("click",()=>{x="custom",T=Math.max(.4,T-.2),h(`🔍 Thu nhỏ: ${Math.round(T*100)}%`);const i=document.getElementById("reader-viewport");i&&i.scrollTop<60&&(i.scrollTop=0),P(c)}),n&&n.addEventListener("click",()=>{x=x==="fitWidth"?"fitPage":"fitWidth",h(x==="fitWidth"?"📐 Đã chỉnh: Vừa chiều rộng":"📄 Đã chỉnh: Vừa trang");const i=document.getElementById("reader-viewport");i&&(i.scrollTop=0),P(c)});const s=document.getElementById("reader-theme-toggle");s&&s.addEventListener("click",Re);const a=document.getElementById("reader-btn-back");a&&a.addEventListener("click",be);const o=document.getElementById("reader-viewport");if(o){let i=0,r=0;o.addEventListener("touchstart",f=>{f.touches&&f.touches.length===1&&(i=f.touches[0].clientX,r=f.touches[0].clientY)},{passive:!0}),o.addEventListener("touchend",f=>{if(f.changedTouches&&f.changedTouches.length===1){const te=f.changedTouches[0].clientX-i,Te=f.changedTouches[0].clientY-r;Math.abs(te)>45&&Math.abs(te)>Math.abs(Te)*1.3&&(te<0?Z():J())}},{passive:!0})}let l=null;window.addEventListener("resize",()=>{clearTimeout(l),l=setTimeout(()=>{g&&g.style.display==="flex"&&v&&P(c)},250)});const d=document.getElementById("reader-toggle-comments");d&&d.addEventListener("click",Ve);const k=document.getElementById("drawer-close-comments");k&&k.addEventListener("click",()=>N(b));const m=document.getElementById("reader-toggle-notes");m&&m.addEventListener("click",Oe);const p=document.getElementById("drawer-close-notes");p&&p.addEventListener("click",()=>N(S)),document.querySelectorAll(".drawer-filter-tab").forEach(i=>{i.addEventListener("click",()=>{document.querySelectorAll(".drawer-filter-tab").forEach(r=>r.classList.remove("active")),i.classList.add("active"),U=i.getAttribute("data-mode")||"page",ee()})}),document.querySelectorAll(".color-dot").forEach(i=>{i.addEventListener("click",()=>{document.querySelectorAll(".color-dot").forEach(r=>r.classList.remove("active")),i.classList.add("active"),Ee=i.getAttribute("data-color")||"#fef08a"})}),pe&&pe.addEventListener("click",_e),ve&&ve.addEventListener("click",Ue),window.addEventListener("keydown",i=>{!g||g.style.display!=="flex"||["INPUT","TEXTAREA"].includes(document.activeElement.tagName)||(i.key==="ArrowRight"||i.key==="PageDown"||i.key===" "?(i.preventDefault(),Z()):i.key==="ArrowLeft"||i.key==="PageUp"?(i.preventDefault(),J()):i.key==="Escape"&&be())});const K=document.getElementById("reader-viewport");K&&(K.addEventListener("touchstart",i=>{i.touches.length===1&&(Be=i.touches[0].clientX,$e=i.touches[0].clientY)},{passive:!0}),K.addEventListener("touchend",i=>{if(i.changedTouches.length===1){const r=i.changedTouches[0].clientX-Be,f=i.changedTouches[0].clientY-$e;Math.abs(r)>60&&Math.abs(r)>Math.abs(f)*1.5&&(r<0?Z():J())}},{passive:!0}))}function Ne(){g&&g.addEventListener("contextmenu",t=>(t.preventDefault(),h("🔒 Tài liệu được bảo vệ bản quyền - Chỉ hỗ trợ đọc trực tuyến trên Tiếng Trung HongTai",!0),!1)),window.addEventListener("keydown",t=>{if(g&&g.style.display==="flex"&&(t.ctrlKey||t.metaKey)&&["s","p","u"].includes(t.key.toLowerCase()))return t.preventDefault(),h("🔒 Tính năng in và lưu tệp bị vô hiệu hóa để bảo vệ bản quyền tác giả.",!0),!1}),y&&y.addEventListener("dragstart",t=>t.preventDefault())}async function Me(){try{const e=await(await fetch(`${B}/api/books`,{headers:j()})).json();e.success&&Array.isArray(e.books)&&(M=e.books,Ge(),Q(),xe())}catch(t){console.error("Failed to load books catalog:",t),A&&(A.innerHTML=`
          <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #ef4444;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 12px;"></i>
            <p style="font-weight: 700;">Không thể tải kho sách. Vui lòng kiểm tra kết nối máy chủ.</p>
          </div>
        `)}}window.switchDocsView=function(t){(!H||!G)&&(H=document.getElementById("documents-bookshelf-view"),G=document.getElementById("documents-catalog-view"),D=document.getElementById("btn-view-bookshelf"),V=document.getElementById("btn-view-catalog")),t==="bookshelf"?(H&&(H.style.display="block"),G&&(G.style.display="none"),D&&D.classList.add("active"),V&&V.classList.remove("active")):(H&&(H.style.display="none"),G&&(G.style.display="block"),D&&D.classList.remove("active"),V&&V.classList.add("active"))};function xe(){const t=H||document.getElementById("documents-bookshelf-view");if(!t)return;function e(s){if(!s)return null;const a=M.find(d=>d.id===s),o=ke(s),l=a&&a.userProgress||o;return l&&l.lastPage>1?l:null}const n=[{id:"shelf-hsk2",accentColor:"#0284c7",mascotImg:"/assets/logo.png",title:"Giáo Trình Chuẩn HSK 2.0",subtitle:"Bộ giáo trình 6 cấp độ (HSK 1 - HSK 6)",books:[{level:1,title:"Giáo Trình Chuẩn HSK 1",coverUrl:"/covers/hsk2/hsk1.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 1 bao gồm 15 bài học nhập môn kèm file dịch tiếng Việt chuẩn của TS. Nguyễn Thị Minh Hồng."},{level:2,title:"Giáo Trình Chuẩn HSK 2",coverUrl:"/covers/hsk2/hsk2.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 2 bao gồm 15 bài học sơ cấp nâng cao mở rộng vốn câu giao tiếp thực tế."},{level:3,title:"Giáo Trình Chuẩn HSK 3",coverUrl:"/covers/hsk2/hsk3.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 3 bao gồm 20 bài học củng cố ngữ pháp trung cấp và diễn đạt mở rộng."},{level:4,title:"Giáo Trình Chuẩn HSK 4",coverUrl:"/covers/hsk2/hsk4.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 4 gồm 2 tập Thượng và Hạ với 20 chủ đề chuyên sâu."},{level:5,title:"Giáo Trình Chuẩn HSK 5 (Tập Dưới)",coverUrl:"/covers/hsk2/hsk5.jpg",bookId:"book_8e6cd7",desc:"Giáo trình chuẩn HSK 5 Tập Dưới (HSK 5 chuẩn下.pdf) bản số hóa sắc nét, đọc trực tuyến mượt mà."},{level:6,title:"Giáo Trình Chuẩn HSK 6",coverUrl:"/covers/hsk2/hsk6.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 6 cao cấp dành cho người học thành thạo ngôn ngữ."}]},{id:"shelf-hsk3",accentColor:"#10b981",mascotImg:"/assets/logo.png",title:"Giáo Trình HSK 3.0 Mới",subtitle:"Bộ giáo trình tiêu chuẩn quốc tế mới nhất (Cấp 1 - Cấp 4)",books:[{level:1,title:"新 HSK 教程 1 (HSK 3.0)",coverUrl:"/covers/hsk3/hsk1.jpg",bookId:null,desc:"Giáo trình HSK cấp độ 1 tiêu chuẩn 3.0 mới nhất do NXB Giáo dục & Nghiên cứu Giảng dạy Ngôn ngữ Bắc Kinh xuất bản."},{level:2,title:"新 HSK 教程 2 (HSK 3.0)",coverUrl:"/covers/hsk3/hsk2.jpg",bookId:"book_74e5v6",desc:"Toàn bộ giáo trình HSK 2 mới chuẩn quốc tế 3.0 với đầy đủ bài khóa và hội thoại."},{level:3,title:"新 HSK 教程 3 (HSK 3.0)",coverUrl:"/covers/hsk3/hsk3.jpg",bookId:"book_3b4cws",desc:"Giáo trình HSK 3 mới chuẩn 3.0 củng cố hệ thống ngữ pháp và 1000 từ vựng cốt lõi."},{level:4,title:"新 HSK 教程 4 (Tập Trên - HSK 3.0)",coverUrl:"/covers/hsk3/hsk4.jpg",bookId:"book_32gwjz",desc:"Giáo trình HSK 4 mới Tập Trên chuẩn v3.0 kèm 10 bài học trung cấp cơ bản."}]},{id:"shelf-hanngu",accentColor:"#f59e0b",mascotImg:"/assets/logo.png",title:"Giáo Trình Hán Ngữ 6 Cuốn",subtitle:"Bản dịch song ngữ Trung - Việt chuẩn Đại học (Tập 1 - 6)",books:[{volNum:1,title:"Giáo Trình Hán Ngữ 1",subtitle:"Bản dịch song ngữ",bookId:"book_m03mz1",pastelBg:"linear-gradient(145deg, #fef3c7 0%, #fed7aa 100%)",pastelAccent:"#c2410c",hanzi:"汉语",tag:"Quyển 1 Thượng",desc:"Giáo trình Hán ngữ cơ sở quyển 1 chuẩn quốc tế, rèn luyện phát âm Pinyin, nét bút và giao tiếp nhập môn."},{volNum:2,title:"Giáo Trình Hán Ngữ 2",subtitle:"Bản dịch song ngữ",bookId:"book_82zwgt",pastelBg:"linear-gradient(145deg, #dcfce7 0%, #bbf7d0 100%)",pastelAccent:"#15803d",hanzi:"汉语",tag:"Quyển 1 Hạ",desc:"Giáo trình Hán ngữ bộ 6 tập quyển 2, bản dịch chú giải tiếng Việt chuẩn xác cho học viên mới bắt đầu."},{volNum:3,title:"Giáo Trình Hán Ngữ 3",subtitle:"Bản dịch song ngữ",bookId:"book_8emthg",pastelBg:"linear-gradient(145deg, #fee2e2 0%, #fecaca 100%)",pastelAccent:"#b91c1c",hanzi:"汉语",tag:"Quyển 2 Thượng",desc:"Giáo trình Hán ngữ quyển 3 (Tập 2 Thượng), bước ngoặt củng cố ngữ pháp trung cấp và diễn đạt mở rộng."},{volNum:4,title:"Giáo Trình Hán Ngữ 4",subtitle:"Bản dịch song ngữ",bookId:"book_ow9jfp",pastelBg:"linear-gradient(145deg, #e0f2fe 0%, #bae6fd 100%)",pastelAccent:"#0369a1",hanzi:"汉语",tag:"Quyển 2 Hạ",desc:"Giáo trình Hán ngữ quyển 4 (Tập 2 Hạ), nâng cao vốn từ vựng chuyên đề, câu phức và đối thoại chuyên sâu."},{volNum:5,title:"Giáo Trình Hán Ngữ 5",subtitle:"Bản dịch song ngữ",bookId:null,pastelBg:"linear-gradient(145deg, #f3e8ff 0%, #e9d5ff 100%)",pastelAccent:"#7e22ce",hanzi:"汉语",tag:"Quyển 3 Thượng",desc:"Giáo trình Hán ngữ quyển 5 (Tập 3 Thượng) nâng cao khả năng phân tích ngữ văn và nghị luận."},{volNum:6,title:"Giáo Trình Hán Ngữ 6",subtitle:"Bản dịch song ngữ",bookId:"book_d5l2mx",matchFile:"Bản sao của Giáo trình hán ngữ 6 (Trung-Việt).pdf",matchTitle:"Hán Ngữ 6",pastelBg:"linear-gradient(145deg, #ccfbf1 0%, #99f6e4 100%)",pastelAccent:"#0f766e",hanzi:"汉语",tag:"Quyển 3 Hạ",desc:"Giáo trình Hán ngữ quyển 6 (Tập 3 Hạ) hoàn thiện kỹ năng đọc hiểu và văn phong bản xứ cao cấp."}]}];t.innerHTML=n.map(s=>{const a=s.books.map(o=>{const l=M.find(q=>o.bookId&&q.id===o.bookId||o.matchFile&&q.name===o.matchFile||o.matchTitle&&q.titleVi&&q.titleVi.toLowerCase().includes(o.matchTitle.toLowerCase())),d=l?l.id:o.bookId,k=e(d),m=!!d;let p="";k?p=`<span class="comic-book-status-badge reading"><i class="fa-solid fa-bookmark"></i> P.${k.lastPage}</span>`:m?p='<span class="comic-book-status-badge available"><i class="fa-solid fa-book-open"></i> Đọc ngay</span>':p='<span class="comic-book-status-badge coming-soon"><i class="fa-solid fa-clock"></i> Sắp ra</span>';let K="";if(o.coverUrl)K=`<img src="${o.coverUrl}" alt="${u(o.title)}" class="comic-book-cover-img" loading="lazy">`;else{const q=String(o.volNum||o.level||"").replace(/\D/g,"")||o.volNum||o.level||"",We=o.pastelBg||(o.color?`linear-gradient(145deg, ${o.color}22, ${o.color}44)`:"linear-gradient(145deg, #fef3c7, #fed7aa)"),He=o.pastelAccent||o.color||"#0f172a",Xe=o.hanzi||"汉语";K=`
            <div class="styled-vol-card" style="background: ${We};">
              <div class="vol-sub">${u(o.tag||"Giáo Trình")}</div>
              <div class="vol-name">${u(o.title)}</div>
              <div class="vol-center-emblem">
                <div class="vol-emblem-badge">
                  <span class="vol-emblem-char" style="color: ${He};">${Xe}</span>
                </div>
              </div>
              <div class="vol-footer">
                <div class="vol-foot-label">HongTai<br>Book</div>
                <div class="vol-number-badge" style="color: ${He};">${q}</div>
              </div>
            </div>
          `}const i=u(o.title),r=o.coverUrl?u(o.coverUrl):"",f=u(o.desc||""),te=d?`'${d}'`:"null",Te=o.level||o.volNum?`${o.level||o.volNum}`:"null";return`
          <div class="comic-book-card" onclick="window.openShelfBook(${te}, '${i}', '${r}', '${f}', ${Te})" title="${i}">
            <div class="comic-book-spine-overlay"></div>
            <div class="comic-book-gloss-overlay"></div>
            ${p}
            ${K}
          </div>
        `}).join("");return`
        <section class="bookshelf-shelf" style="--shelf-accent: ${s.accentColor};">
          <div class="bookshelf-shelf-header">
            <div class="bookshelf-mascot-badge">
              <img src="${s.mascotImg}" alt="Mascot" class="bookshelf-mascot-img">
            </div>
            <div class="bookshelf-shelf-titles">
              <h2 class="bookshelf-shelf-title">${u(s.title)}</h2>
              <p class="bookshelf-shelf-subtitle">${u(s.subtitle)}</p>
            </div>
          </div>
          <div class="bookshelf-grid">
            ${a}
          </div>
        </section>
      `}).join("")}window.openShelfBook=function(t,e,n,s,a){if(t){window.openBookReader(t);return}const o=document.getElementById("pending-book-modal"),l=document.getElementById("pending-modal-cover"),d=document.getElementById("pending-modal-title"),k=document.getElementById("pending-modal-desc"),m=document.getElementById("pending-modal-actions");if(o&&d&&k){l&&(l.src=n||"/assets/logo.png",l.alt=e),d.textContent=e,k.textContent=s||"Bản số hóa chất lượng cao đang được cập nhật để mang lại trải nghiệm đọc tốt nhất cho bạn.";let p=`
        <button onclick="window.closePendingBookModal()" class="topbar-comic-menu-btn" style="width: auto; padding: 8px 18px; font-size: 0.9rem; font-weight: 800;">
          Đóng
        </button>
      `;a&&(p+=`
          <a href="/detail-list.html?level=${a}" class="topbar-comic-login-btn">
            <i class="fa-solid fa-graduation-cap"></i>
            <span>Học Từ Vựng Cấp ${a}</span>
          </a>
        `),m&&(m.innerHTML=p),o.style.display="flex"}},window.closePendingBookModal=function(t){if(t&&t.target!==t.currentTarget)return;const e=document.getElementById("pending-book-modal");e&&(e.style.display="none")},window.showMascotTipModal=function(){const t=document.getElementById("pending-book-modal"),e=document.getElementById("pending-modal-cover"),n=document.getElementById("pending-modal-title"),s=document.getElementById("pending-modal-desc"),a=document.getElementById("pending-modal-actions");t&&n&&s&&(e&&(e.src="/assets/hongtai_dragon_mascot.png",e.alt="HongTai Dragon Mascot"),n.textContent="Mẹo Đọc Sách Thông Minh Cùng HongTai",s.innerHTML=`
        <div style="text-align: left; font-size: 0.88rem; line-height: 1.6; color: #334155; display: flex; flex-direction: column; gap: 8px;">
          <div><strong style="color: #0284c7;">📖 Đọc trực tuyến:</strong> Không cần tải PDF, đọc siêu tốc trên mọi thiết bị máy tính và điện thoại.</div>
          <div><strong style="color: #10b981;">🔖 Tự động lưu trang:</strong> Đóng sách hệ thống tự động ghi nhớ trang đang đọc cho lần sau.</div>
          <div><strong style="color: #f59e0b;">💬 Thảo luận trang:</strong> Nhấn nút "Bình luận" để hỏi đáp và thảo luận trực tiếp theo từng trang.</div>
          <div><strong style="color: #ec4899;">✍️ Ghi chú cá nhân:</strong> Viết note riêng tư kèm nhãn màu đánh dấu kiến thức quan trọng.</div>
        </div>
      `,a&&(a.innerHTML=`
          <button onclick="window.closePendingBookModal()" class="topbar-comic-login-btn" style="width: 100%; justify-content: center;">
            <i class="fa-solid fa-check"></i>
            <span>Đã hiểu, bắt đầu đọc sách ngay!</span>
          </button>
        `),t.style.display="flex")};function Ge(){const t={all:M.length};M.forEach(e=>{t[e.category]=(t[e.category]||0)+1}),ie.forEach(e=>{const n=e.getAttribute("data-category"),s=e.querySelector(".documents-filter-count");s&&(s.textContent=t[n]||0)})}function Q(){if(!A)return;let t=M.filter(e=>{const n=ge==="all"||e.category===ge,s=!$||e.titleVi&&e.titleVi.toLowerCase().includes($)||e.titleOriginal&&e.titleOriginal.toLowerCase().includes($)||e.category&&e.category.toLowerCase().includes($)||e.description&&e.description.toLowerCase().includes($);return n&&s});if(t.length===0){A.innerHTML=`
        <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; color: #94a3b8;">
          <i class="fa-solid fa-book-open" style="font-size: 3rem; color: #475569; margin-bottom: 16px;"></i>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #cbd5e1; margin: 0 0 8px 0;">Không tìm thấy sách phù hợp</h3>
          <p style="margin: 0; font-size: 0.95rem;">Thử tìm với từ khóa khác hoặc chuyển sang danh mục Tất cả.</p>
        </div>
      `;return}A.innerHTML=t.map(e=>{const n=ke(e.id),s=e.userProgress||n,a=s&&s.lastPage>1;let o="tag-van-hoa";return e.category.includes("HSK")?o="tag-hsk":e.category.includes("Hán Ngữ")?o="tag-han-ngu":e.category.includes("Biên Phiên Dịch")?o="tag-bien-dich":e.category.includes("Giáo Viên")?o="tag-giao-vien":e.category.includes("Văn Học")||e.category.includes("Truyện")?o="tag-van-hoc":e.category.includes("Ngữ Pháp")&&(o="tag-ngu-phap"),`
        <div class="book-card" id="card-${e.id}">
          <div class="book-card-spine"></div>
          
          <div class="book-card-header">
            <span class="book-category-tag ${o}">${u(e.category)}</span>
            <span class="book-size-chip"><i class="fa-regular fa-file-pdf"></i> ${e.sizeMB} MB</span>
          </div>

          <div class="book-card-body">
            <h3 class="book-title-vi" title="${u(e.titleVi)}">${u(e.titleVi)}</h3>
            <p class="book-title-original" title="${u(e.titleOriginal)}">${u(e.titleOriginal)}</p>
            <p class="book-desc">${u(e.description)}</p>
          </div>

          ${a?`
            <div class="book-card-progress">
              <div class="book-progress-text">
                <span><i class="fa-solid fa-bookmark" style="color: #38bdf8;"></i> Đang đọc: Trang ${s.lastPage}${s.totalPages?"/"+s.totalPages:""}</span>
                <span>${s.percentage||0}%</span>
              </div>
              <div class="book-progress-bar-bg">
                <div class="book-progress-bar-fill" style="width: ${s.percentage||0}%;"></div>
              </div>
            </div>
          `:""}

          <div class="book-card-actions">
            <button class="btn-read-book ${a?"has-progress":""}" onclick="window.openBookReader('${e.id}')">
              <i class="fa-solid ${a?"fa-book-open-reader":"fa-book-open"}"></i>
              <span>${a?`Tiếp tục đọc (Trang ${s.lastPage})`:"Đọc Sách Ngay"}</span>
            </button>
            <div class="book-interaction-badges">
              <span class="interaction-badge" title="Bình luận"><i class="fa-regular fa-comment"></i> ${e.totalComments||0}</span>
              ${e.totalUserNotes>0?`<span class="interaction-badge" title="Ghi chú cá nhân"><i class="fa-solid fa-pencil" style="color: #fbbf24;"></i> ${e.totalUserNotes}</span>`:""}
            </div>
          </div>
        </div>
      `}).join("")}window.openBookReader=async function(t){const e=M.find(o=>o.id===t);if(!e)return;w=e,g&&(g.style.display="flex",document.body.style.overflow="hidden",Ce(L));const n=document.getElementById("reader-viewport");n&&(n.scrollTop=0,n.scrollLeft=0),window.innerWidth<=768&&(x="fitWidth"),me&&(me.textContent=e.titleVi),fe&&(fe.innerHTML=`<span>${e.category}</span> • <span>${e.titleOriginal}</span>`),_(!0,"Đang mở sách và tải trang đầu...");const s=ke(t),a=e.userProgress&&e.userProgress.lastPage||s&&s.lastPage||1;c=a,De(t),qe(t);try{const o=`${B}/api/books/${t}/stream`;v=await window.pdfjsLib.getDocument({url:o,withCredentials:!0,cMapUrl:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",cMapPacked:!0}).promise,I=v.numPages,he&&(he.textContent=`/ ${I}`),E&&(E.max=I,E.value=c),_(!1),ye(c),a>1&&h(`Đã khôi phục trang bạn đang đọc dở: Trang ${a}`)}catch(o){console.error("Error loading PDF:",o),_(!1),h("Không thể mở tệp sách. Vui lòng thử lại sau.",!0),be()}};async function ye(t){if(v){ne=!0,_(!0,`Đang nạp trang ${t}...`);try{const e=await v.getPage(t),n=document.getElementById("reader-viewport"),s=e.getViewport({scale:1}),a=window.innerWidth<=768;if(x==="fitWidth"&&n){const m=n.clientWidth-(a?12:48);T=Math.max(.35,Math.min(2.8,m/s.width))}else if(x==="fitPage"&&n){const m=n.clientHeight-(a?24:60);T=Math.max(.35,Math.min(2.5,m/s.height))}const o=window.devicePixelRatio||1,l=e.getViewport({scale:T*o});y.height=l.height,y.width=l.width,y.style.width=`${l.width/o}px`,y.style.height=`${l.height/o}px`;const d=y.parentElement;if(d&&n){const m=l.height/o,p=n.clientHeight-(a?24:48);m>p?(d.style.marginTop="0px",d.style.marginBottom=a?"24px":"40px"):(d.style.marginTop="auto",d.style.marginBottom="auto")}const k={canvasContext:Ie,viewport:l};await e.render(k).promise,ne=!1,_(!1),oe!==null&&(ye(oe),oe=null),n&&c!==t&&(n.scrollTop=0,n.scrollLeft=0),c=t,E&&(E.value=t),je(),Ke(t,I),b&&b.classList.contains("open")&&U==="page"&&ee()}catch(e){console.error("Error rendering page:",e),ne=!1,_(!1)}}}function P(t){ne?oe=t:ye(t)}function J(){c<=1||P(c-1)}function Z(){!v||c>=I||P(c+1)}function je(){const t=c<=1,e=!v||c>=I;F&&(F.disabled=t),W&&(W.disabled=e),X&&(X.disabled=t),Y&&(Y.disabled=e)}function _(t,e="Đang tải..."){if(!se)return;se.style.display=t?"flex":"none";const n=se.querySelector(".reader-loading-text");n&&(n.textContent=e)}function be(){g&&(g.style.display="none",document.body.style.overflow=""),N(b),N(S),v&&(v.destroy(),v=null),Q()}function Ke(t,e){ue&&clearTimeout(ue),ue=setTimeout(()=>{Ae(t,e)},1e3)}async function Ae(t,e){if(!w)return;const n=w.id,s={bookId:n,lastPage:t,totalPages:e,percentage:e?Math.min(100,Math.round(t/e*100)):0,updatedAt:Date.now()};ze(n,s);try{await fetch(`${B}/api/books/${n}/progress`,{method:"POST",headers:{"Content-Type":"application/json",...j()},body:JSON.stringify({page:t,totalPages:e})})}catch(a){console.warn("Could not sync reading progress to server:",a)}}function ke(t){try{const e=localStorage.getItem(`hongtai_book_progress_${t}`);return e?JSON.parse(e):null}catch{return null}}function ze(t,e){try{localStorage.setItem(`hongtai_book_progress_${t}`,JSON.stringify(e))}catch{}}async function De(t){try{const n=await(await fetch(`${B}/api/books/${t}/comments`,{headers:j()})).json();n.success&&Array.isArray(n.comments)&&(O=n.comments,Le(),ee())}catch(e){console.error("Failed to fetch comments:",e)}}function Le(){const t=document.getElementById("reader-comments-count-badge");t&&(t.textContent=O.length,t.style.display=O.length>0?"inline-block":"none")}function Ve(){if(!b)return;N(S),b.classList.contains("open")?N(b):(b.classList.add("open"),ee())}function ee(){if(!ae)return;let t=O;U==="page"&&(t=t.filter(n=>Number(n.page)===Number(c)));const e=document.getElementById("comments-current-page-label");if(e&&(e.textContent=U==="page"?`Trang ${c}`:"Tất cả các trang"),t.length===0){ae.innerHTML=`
        <div style="text-align: center; padding: 40px 10px; color: #94a3b8;">
          <i class="fa-regular fa-comment-dots" style="font-size: 2.2rem; color: #475569; margin-bottom: 12px;"></i>
          <p style="font-size: 0.9rem; margin: 0;">Chưa có bình luận nào cho ${U==="page"?`trang ${c}`:"sách này"}.</p>
          <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0 0;">Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ ý kiến!</p>
        </div>
      `;return}ae.innerHTML=t.map(n=>{const s=(n.authorName||"H").charAt(0).toUpperCase(),a=Fe(n.createdAt);return`
        <div class="comment-card" id="comment-${n.id}">
          <div class="comment-card-header">
            <div class="comment-user-info">
              ${n.authorPicture?`<img src="${n.authorPicture}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;">`:`<div class="comment-avatar">${s}</div>`}
              <span class="comment-author-name">${u(n.authorName)}</span>
            </div>
            <span class="comment-page-badge" onclick="window.jumpToPage(${n.page})" style="cursor: pointer;" title="Nhảy tới trang ${n.page}">Trang ${n.page}</span>
          </div>
          <div class="comment-content">${u(n.content)}</div>
          <div class="comment-time">${a}</div>
        </div>
      `}).join("")}async function _e(){if(!ce||!w)return;const t=ce.value.trim();if(!t){h("Vui lòng nhập nội dung bình luận.",!0);return}try{const n=await(await fetch(`${B}/api/books/${w.id}/comments`,{method:"POST",headers:{"Content-Type":"application/json",...j()},body:JSON.stringify({page:c,content:t})})).json();n.success&&n.comment?(O.unshift(n.comment),ce.value="",Le(),ee(),h("Đã gửi bình luận thành công!")):h(n.error||"Lỗi gửi bình luận",!0)}catch(e){console.error("Error posting comment:",e),h("Không thể gửi bình luận.",!0)}}async function qe(t){try{const n=await(await fetch(`${B}/api/books/${t}/notes`,{headers:j()})).json();n.success&&Array.isArray(n.notes)&&(C=n.notes,we(),de())}catch(e){console.error("Failed to fetch notes:",e)}}function we(){const t=document.getElementById("reader-notes-count-badge");t&&(t.textContent=C.length,t.style.display=C.length>0?"inline-block":"none")}function Oe(){if(!S)return;N(b),S.classList.contains("open")?N(S):(S.classList.add("open"),de())}function de(){if(le){if(C.length===0){le.innerHTML=`
        <div style="text-align: center; padding: 40px 10px; color: #94a3b8;">
          <i class="fa-solid fa-feather-pointed" style="font-size: 2.2rem; color: #475569; margin-bottom: 12px;"></i>
          <p style="font-size: 0.9rem; margin: 0;">Bạn chưa có ghi chú nào cho cuốn sách này.</p>
          <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0 0;">Ghi lại từ mới, ngữ pháp hoặc lưu ý cá nhân tại từng trang.</p>
        </div>
      `;return}le.innerHTML=C.map(t=>`
        <div class="note-card" style="border-left-color: ${t.color||"#fef08a"};" onclick="window.jumpToPage(${t.page})">
          <div class="note-card-top">
            <span class="note-jump-badge"><i class="fa-solid fa-arrow-turn-down"></i> Trang ${t.page}</span>
            <button class="note-delete-btn" onclick="event.stopPropagation(); window.deleteNote('${t.id}')" title="Xóa ghi chú"><i class="fa-solid fa-trash-can"></i></button>
          </div>
          <div class="note-text">${u(t.content)}</div>
        </div>
      `).join("")}}async function Ue(){if(!re||!w)return;const t=re.value.trim();if(!t){h("Vui lòng nhập nội dung ghi chú.",!0);return}try{const n=await(await fetch(`${B}/api/books/${w.id}/notes`,{method:"POST",headers:{"Content-Type":"application/json",...j()},body:JSON.stringify({page:c,content:t,color:Ee})})).json();n.success&&n.note&&(C.unshift(n.note),re.value="",we(),de(),h(`Đã lưu ghi chú cho Trang ${c}!`))}catch(e){console.error("Error saving note:",e),h("Không thể lưu ghi chú.",!0)}}window.deleteNote=async function(t){if(confirm("Bạn có chắc chắn muốn xóa ghi chú này?")&&w)try{(await(await fetch(`${B}/api/books/${w.id}/notes/${t}`,{method:"DELETE",headers:j()})).json()).success&&(C=C.filter(s=>s.id!==t),we(),de(),h("Đã xóa ghi chú."))}catch(e){console.error("Error deleting note:",e),h("Lỗi xóa ghi chú.",!0)}},window.jumpToPage=function(t){!v||t<1||t>I||P(t)};function N(t){t&&t.classList.remove("open")}function Re(){g&&(L==="dark"?L="sepia":L==="sepia"?L="light":L="dark",localStorage.setItem("hongtai_reader_theme",L),Ce(L))}function Ce(t){if(!g)return;g.classList.remove("theme-dark","theme-sepia","theme-light"),g.classList.add(`theme-${t}`);const e=document.querySelector("#reader-theme-toggle i");e&&(t==="dark"?e.className="fa-solid fa-moon":t==="sepia"?e.className="fa-solid fa-sun":e.className="fa-regular fa-sun")}function j(){const t={};try{const n=JSON.parse(localStorage.getItem("user")||sessionStorage.getItem("user")||"{}");n&&n.token&&(t.Authorization=`Bearer ${n.token}`)}catch{}let e=localStorage.getItem("hongtai_guest_device_id");return e||(e="dev_"+Math.random().toString(36).substring(2,10),localStorage.setItem("hongtai_guest_device_id",e)),t["x-guest-id"]=e,t}function h(t,e=!1){if(typeof window.showToast=="function"){window.showToast(t,e);return}const n=document.createElement("div");n.style.cssText=`
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
    `,n.textContent=t,document.body.appendChild(n),setTimeout(()=>{n.style.opacity="0",setTimeout(()=>n.remove(),300)},2800)}function u(t){return t?String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function Fe(t){if(!t)return"";const e=Math.floor((Date.now()-new Date(t).getTime())/1e3);return e<60?"Vừa xong":e<3600?`${Math.floor(e/60)} phút trước`:e<86400?`${Math.floor(e/3600)} giờ trước`:e<2592e3?`${Math.floor(e/86400)} ngày trước`:new Date(t).toLocaleDateString("vi-VN")}})();
