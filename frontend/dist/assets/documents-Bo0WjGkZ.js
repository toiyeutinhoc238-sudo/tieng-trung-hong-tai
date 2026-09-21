import"./global_sidebar-B_BNhh9i.js";/* empty css              */import"./particles-DBEuVAM5.js";window.pdfjsLib&&(window.pdfjsLib.GlobalWorkerOptions.workerSrc="/vendor/pdfjs/pdf.worker.min.js");(function(){const E="";let j=[],de="all",B="",y=null,f=null,c=1,$=0,te=!1,ne=null,b=1.25,I="fitWidth",ge=null,x=localStorage.getItem("hongtai_reader_theme")||"dark",V=[],q="page",L=[],Te="#fef08a",Ee=0,Be=0,K,O,A,oe,C,M,z,D,d,k,$e,w,ue,he,me,U,R,F,X,ie,v,se,ae,fe,S,ce,le,pe;document.addEventListener("DOMContentLoaded",()=>{Se(),He(),Pe(),Ne(),Ie()});function Se(){K=document.getElementById("documents-grid"),O=document.getElementById("documents-search-input"),A=document.getElementById("documents-search-clear"),oe=document.querySelectorAll(".documents-filter-btn"),C=document.getElementById("documents-bookshelf-view"),M=document.getElementById("documents-catalog-view"),z=document.getElementById("btn-view-bookshelf"),D=document.getElementById("btn-view-catalog"),d=document.getElementById("ebook-reader-modal"),k=document.getElementById("pdf-render-canvas"),k&&($e=k.getContext("2d")),w=document.getElementById("reader-page-input"),ue=document.getElementById("reader-total-pages"),he=document.getElementById("reader-book-title"),me=document.getElementById("reader-book-meta"),U=document.getElementById("reader-btn-prev"),R=document.getElementById("reader-btn-next"),F=document.getElementById("reader-float-prev"),X=document.getElementById("reader-float-next"),ie=document.getElementById("reader-loading-overlay"),v=document.getElementById("reader-comments-drawer"),se=document.getElementById("reader-comments-list"),ae=document.getElementById("reader-comment-input"),fe=document.getElementById("btn-submit-comment"),S=document.getElementById("reader-notes-drawer"),ce=document.getElementById("reader-notes-list"),le=document.getElementById("reader-note-input"),pe=document.getElementById("btn-submit-note")}function He(){O&&O.addEventListener("input",s=>{B=s.target.value.trim().toLowerCase(),A&&(A.style.display=B?"block":"none"),W()}),A&&A.addEventListener("click",()=>{O&&(O.value=""),B="",A.style.display="none",W()}),oe.forEach(s=>{s.addEventListener("click",()=>{oe.forEach(r=>r.classList.remove("active")),s.classList.add("active"),de=s.getAttribute("data-category")||"all",W()})}),U&&U.addEventListener("click",Y),R&&R.addEventListener("click",Q),F&&F.addEventListener("click",Y),X&&X.addEventListener("click",Q),w&&w.addEventListener("change",s=>{const r=parseInt(s.target.value,10);!isNaN(r)&&r>=1&&r<=$?H(r):w.value=c});const t=document.getElementById("reader-zoom-in"),e=document.getElementById("reader-zoom-out"),n=document.getElementById("reader-zoom-fit");t&&t.addEventListener("click",()=>{I="custom",b=Math.min(3,b+.2),u(`🔍 Phóng to: ${Math.round(b*100)}%`),H(c)}),e&&e.addEventListener("click",()=>{I="custom",b=Math.max(.4,b-.2),u(`🔍 Thu nhỏ: ${Math.round(b*100)}%`),H(c)}),n&&n.addEventListener("click",()=>{I=I==="fitWidth"?"fitPage":"fitWidth",u(I==="fitWidth"?"📐 Đã chỉnh: Vừa chiều rộng":"📄 Đã chỉnh: Vừa trang"),H(c)});const i=document.getElementById("reader-theme-toggle");i&&i.addEventListener("click",Ue);const a=document.getElementById("reader-btn-back");a&&a.addEventListener("click",ye);const o=document.getElementById("reader-viewport");if(o){let s=0,r=0;o.addEventListener("touchstart",m=>{m.touches&&m.touches.length===1&&(s=m.touches[0].clientX,r=m.touches[0].clientY)},{passive:!0}),o.addEventListener("touchend",m=>{if(m.changedTouches&&m.changedTouches.length===1){const ee=m.changedTouches[0].clientX-s,we=m.changedTouches[0].clientY-r;Math.abs(ee)>45&&Math.abs(ee)>Math.abs(we)*1.3&&(ee<0?Q():Y())}},{passive:!0})}let l=null;window.addEventListener("resize",()=>{clearTimeout(l),l=setTimeout(()=>{d&&d.style.display==="flex"&&f&&H(c)},250)});const p=document.getElementById("reader-toggle-comments");p&&p.addEventListener("click",De);const h=document.getElementById("drawer-close-comments");h&&h.addEventListener("click",()=>P(v));const T=document.getElementById("reader-toggle-notes");T&&T.addEventListener("click",qe);const N=document.getElementById("drawer-close-notes");N&&N.addEventListener("click",()=>P(S)),document.querySelectorAll(".drawer-filter-tab").forEach(s=>{s.addEventListener("click",()=>{document.querySelectorAll(".drawer-filter-tab").forEach(r=>r.classList.remove("active")),s.classList.add("active"),q=s.getAttribute("data-mode")||"page",J()})}),document.querySelectorAll(".color-dot").forEach(s=>{s.addEventListener("click",()=>{document.querySelectorAll(".color-dot").forEach(r=>r.classList.remove("active")),s.classList.add("active"),Te=s.getAttribute("data-color")||"#fef08a"})}),fe&&fe.addEventListener("click",_e),pe&&pe.addEventListener("click",Oe),window.addEventListener("keydown",s=>{!d||d.style.display!=="flex"||["INPUT","TEXTAREA"].includes(document.activeElement.tagName)||(s.key==="ArrowRight"||s.key==="PageDown"||s.key===" "?(s.preventDefault(),Q()):s.key==="ArrowLeft"||s.key==="PageUp"?(s.preventDefault(),Y()):s.key==="Escape"&&ye())});const Z=document.getElementById("reader-viewport");Z&&(Z.addEventListener("touchstart",s=>{s.touches.length===1&&(Ee=s.touches[0].clientX,Be=s.touches[0].clientY)},{passive:!0}),Z.addEventListener("touchend",s=>{if(s.changedTouches.length===1){const r=s.changedTouches[0].clientX-Ee,m=s.changedTouches[0].clientY-Be;Math.abs(r)>60&&Math.abs(r)>Math.abs(m)*1.5&&(r<0?Q():Y())}},{passive:!0}))}function Pe(){d&&d.addEventListener("contextmenu",t=>(t.preventDefault(),u("🔒 Tài liệu được bảo vệ bản quyền - Chỉ hỗ trợ đọc trực tuyến trên Tiếng Trung HongTai",!0),!1)),window.addEventListener("keydown",t=>{if(d&&d.style.display==="flex"&&(t.ctrlKey||t.metaKey)&&["s","p","u"].includes(t.key.toLowerCase()))return t.preventDefault(),u("🔒 Tính năng in và lưu tệp bị vô hiệu hóa để bảo vệ bản quyền tác giả.",!0),!1}),k&&k.addEventListener("dragstart",t=>t.preventDefault())}async function Ne(){try{const e=await(await fetch(`${E}/api/books`,{headers:G()})).json();e.success&&Array.isArray(e.books)&&(j=e.books,Me(),W(),Ie())}catch(t){console.error("Failed to load books catalog:",t),K&&(K.innerHTML=`
          <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #ef4444;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 12px;"></i>
            <p style="font-weight: 700;">Không thể tải kho sách. Vui lòng kiểm tra kết nối máy chủ.</p>
          </div>
        `)}}window.switchDocsView=function(t){(!C||!M)&&(C=document.getElementById("documents-bookshelf-view"),M=document.getElementById("documents-catalog-view"),z=document.getElementById("btn-view-bookshelf"),D=document.getElementById("btn-view-catalog")),t==="bookshelf"?(C&&(C.style.display="block"),M&&(M.style.display="none"),z&&z.classList.add("active"),D&&D.classList.remove("active")):(C&&(C.style.display="none"),M&&(M.style.display="block"),z&&z.classList.remove("active"),D&&D.classList.add("active"))};function Ie(){const t=C||document.getElementById("documents-bookshelf-view");if(!t)return;function e(i){if(!i)return null;const a=j.find(p=>p.id===i),o=be(i),l=a&&a.userProgress||o;return l&&l.lastPage>1?l:null}const n=[{id:"shelf-hsk2",accentColor:"#0284c7",mascotImg:"/assets/logo.png",title:"Giáo Trình Chuẩn HSK 2.0",subtitle:"Bộ giáo trình 6 cấp độ (HSK 1 - HSK 6)",books:[{level:1,title:"Giáo Trình Chuẩn HSK 1",coverUrl:"/covers/hsk2/hsk1.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 1 bao gồm 15 bài học nhập môn kèm file dịch tiếng Việt chuẩn của TS. Nguyễn Thị Minh Hồng."},{level:2,title:"Giáo Trình Chuẩn HSK 2",coverUrl:"/covers/hsk2/hsk2.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 2 bao gồm 15 bài học sơ cấp nâng cao mở rộng vốn câu giao tiếp thực tế."},{level:3,title:"Giáo Trình Chuẩn HSK 3",coverUrl:"/covers/hsk2/hsk3.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 3 bao gồm 20 bài học củng cố ngữ pháp trung cấp và diễn đạt mở rộng."},{level:4,title:"Giáo Trình Chuẩn HSK 4",coverUrl:"/covers/hsk2/hsk4.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 4 gồm 2 tập Thượng và Hạ với 20 chủ đề chuyên sâu."},{level:5,title:"Giáo Trình Chuẩn HSK 5 (Tập Dưới)",coverUrl:"/covers/hsk2/hsk5.jpg",bookId:"book_8e6cd7",desc:"Giáo trình chuẩn HSK 5 Tập Dưới (HSK 5 chuẩn下.pdf) bản số hóa sắc nét, đọc trực tuyến mượt mà."},{level:6,title:"Giáo Trình Chuẩn HSK 6",coverUrl:"/covers/hsk2/hsk6.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 6 cao cấp dành cho người học thành thạo ngôn ngữ."}]},{id:"shelf-hsk3",accentColor:"#10b981",mascotImg:"/assets/logo.png",title:"Giáo Trình HSK 3.0 Mới",subtitle:"Bộ giáo trình tiêu chuẩn quốc tế mới nhất (Cấp 1 - Cấp 4)",books:[{level:1,title:"新 HSK 教程 1 (HSK 3.0)",coverUrl:"/covers/hsk3/hsk1.jpg",bookId:null,desc:"Giáo trình HSK cấp độ 1 tiêu chuẩn 3.0 mới nhất do NXB Giáo dục & Nghiên cứu Giảng dạy Ngôn ngữ Bắc Kinh xuất bản."},{level:2,title:"新 HSK 教程 2 (HSK 3.0)",coverUrl:"/covers/hsk3/hsk2.jpg",bookId:"book_74e5v6",desc:"Toàn bộ giáo trình HSK 2 mới chuẩn quốc tế 3.0 với đầy đủ bài khóa và hội thoại."},{level:3,title:"新 HSK 教程 3 (HSK 3.0)",coverUrl:"/covers/hsk3/hsk3.jpg",bookId:"book_3b4cws",desc:"Giáo trình HSK 3 mới chuẩn 3.0 củng cố hệ thống ngữ pháp và 1000 từ vựng cốt lõi."},{level:4,title:"新 HSK 教程 4 (Tập Trên - HSK 3.0)",coverUrl:"/covers/hsk3/hsk4.jpg",bookId:"book_32gwjz",desc:"Giáo trình HSK 4 mới Tập Trên chuẩn v3.0 kèm 10 bài học trung cấp cơ bản."}]},{id:"shelf-hanngu",accentColor:"#f59e0b",mascotImg:"/assets/logo.png",title:"Giáo Trình Hán Ngữ 6 Cuốn",subtitle:"Bản dịch song ngữ Trung - Việt chuẩn Đại học (Tập 1 - 6)",books:[{volNum:1,title:"Giáo Trình Hán Ngữ 1",subtitle:"Bản dịch song ngữ",bookId:"book_m03mz1",pastelBg:"linear-gradient(145deg, #fef3c7 0%, #fed7aa 100%)",pastelAccent:"#c2410c",hanzi:"汉语",tag:"Quyển 1 Thượng",desc:"Giáo trình Hán ngữ cơ sở quyển 1 chuẩn quốc tế, rèn luyện phát âm Pinyin, nét bút và giao tiếp nhập môn."},{volNum:2,title:"Giáo Trình Hán Ngữ 2",subtitle:"Bản dịch song ngữ",bookId:"book_82zwgt",pastelBg:"linear-gradient(145deg, #dcfce7 0%, #bbf7d0 100%)",pastelAccent:"#15803d",hanzi:"汉语",tag:"Quyển 1 Hạ",desc:"Giáo trình Hán ngữ bộ 6 tập quyển 2, bản dịch chú giải tiếng Việt chuẩn xác cho học viên mới bắt đầu."},{volNum:3,title:"Giáo Trình Hán Ngữ 3",subtitle:"Bản dịch song ngữ",bookId:"book_8emthg",pastelBg:"linear-gradient(145deg, #fee2e2 0%, #fecaca 100%)",pastelAccent:"#b91c1c",hanzi:"汉语",tag:"Quyển 2 Thượng",desc:"Giáo trình Hán ngữ quyển 3 (Tập 2 Thượng), bước ngoặt củng cố ngữ pháp trung cấp và diễn đạt mở rộng."},{volNum:4,title:"Giáo Trình Hán Ngữ 4",subtitle:"Bản dịch song ngữ",bookId:"book_ow9jfp",pastelBg:"linear-gradient(145deg, #e0f2fe 0%, #bae6fd 100%)",pastelAccent:"#0369a1",hanzi:"汉语",tag:"Quyển 2 Hạ",desc:"Giáo trình Hán ngữ quyển 4 (Tập 2 Hạ), nâng cao vốn từ vựng chuyên đề, câu phức và đối thoại chuyên sâu."},{volNum:5,title:"Giáo Trình Hán Ngữ 5",subtitle:"Bản dịch song ngữ",bookId:"book_tn7sl6",pastelBg:"linear-gradient(145deg, #f3e8ff 0%, #e9d5ff 100%)",pastelAccent:"#7e22ce",hanzi:"汉语",tag:"Quyển 3 Thượng",desc:"Giáo trình Hán ngữ quyển 5 (Tập 3 Thượng) nâng cao khả năng phân tích ngữ văn và nghị luận."},{volNum:6,title:"Giáo Trình Hán Ngữ 6",subtitle:"Bản dịch song ngữ",bookId:null,pastelBg:"linear-gradient(145deg, #ccfbf1 0%, #99f6e4 100%)",pastelAccent:"#0f766e",hanzi:"汉语",tag:"Quyển 3 Hạ",desc:"Giáo trình Hán ngữ quyển 6 (Tập 3 Hạ) hoàn thiện kỹ năng đọc hiểu và văn phong bản xứ cao cấp."}]}];t.innerHTML=n.map(i=>{const a=i.books.map(o=>{const l=e(o.bookId),p=!!o.bookId;let h="";l?h=`<span class="comic-book-status-badge reading"><i class="fa-solid fa-bookmark"></i> P.${l.lastPage}</span>`:p?h='<span class="comic-book-status-badge available"><i class="fa-solid fa-book-open"></i> Đọc ngay</span>':h='<span class="comic-book-status-badge coming-soon"><i class="fa-solid fa-clock"></i> Sắp ra</span>';let T="";if(o.coverUrl)T=`<img src="${o.coverUrl}" alt="${g(o.title)}" class="comic-book-cover-img" loading="lazy">`;else{const ee=String(o.volNum||o.level||"").replace(/\D/g,"")||o.volNum||o.level||"",we=o.pastelBg||(o.color?`linear-gradient(145deg, ${o.color}22, ${o.color}44)`:"linear-gradient(145deg, #fef3c7, #fed7aa)"),Ce=o.pastelAccent||o.color||"#0f172a",Fe=o.hanzi||"汉语";T=`
            <div class="styled-vol-card" style="background: ${we};">
              <div class="vol-sub">${g(o.tag||"Giáo Trình")}</div>
              <div class="vol-name">${g(o.title)}</div>
              <div class="vol-center-emblem">
                <div class="vol-emblem-badge">
                  <span class="vol-emblem-char" style="color: ${Ce};">${Fe}</span>
                </div>
              </div>
              <div class="vol-footer">
                <div class="vol-foot-label">HongTai<br>Book</div>
                <div class="vol-number-badge" style="color: ${Ce};">${ee}</div>
              </div>
            </div>
          `}const N=g(o.title),Z=o.coverUrl?g(o.coverUrl):"",s=g(o.desc||""),r=o.bookId?`'${o.bookId}'`:"null",m=o.level||o.volNum?`${o.level||o.volNum}`:"null";return`
          <div class="comic-book-card" onclick="window.openShelfBook(${r}, '${N}', '${Z}', '${s}', ${m})" title="${N}">
            <div class="comic-book-spine-overlay"></div>
            <div class="comic-book-gloss-overlay"></div>
            ${h}
            ${T}
          </div>
        `}).join("");return`
        <section class="bookshelf-shelf" style="--shelf-accent: ${i.accentColor};">
          <div class="bookshelf-shelf-header">
            <div class="bookshelf-mascot-badge">
              <img src="${i.mascotImg}" alt="Mascot" class="bookshelf-mascot-img">
            </div>
            <div class="bookshelf-shelf-titles">
              <h2 class="bookshelf-shelf-title">${g(i.title)}</h2>
              <p class="bookshelf-shelf-subtitle">${g(i.subtitle)}</p>
            </div>
          </div>
          <div class="bookshelf-grid">
            ${a}
          </div>
        </section>
      `}).join("")}window.openShelfBook=function(t,e,n,i,a){if(t){window.openBookReader(t);return}const o=document.getElementById("pending-book-modal"),l=document.getElementById("pending-modal-cover"),p=document.getElementById("pending-modal-title"),h=document.getElementById("pending-modal-desc"),T=document.getElementById("pending-modal-actions");if(o&&p&&h){l&&(l.src=n||"/assets/logo.png",l.alt=e),p.textContent=e,h.textContent=i||"Bản số hóa chất lượng cao đang được cập nhật để mang lại trải nghiệm đọc tốt nhất cho bạn.";let N=`
        <button onclick="window.closePendingBookModal()" class="topbar-comic-menu-btn" style="width: auto; padding: 8px 18px; font-size: 0.9rem; font-weight: 800;">
          Đóng
        </button>
      `;a&&(N+=`
          <a href="/detail-list.html?level=${a}" class="topbar-comic-login-btn">
            <i class="fa-solid fa-graduation-cap"></i>
            <span>Học Từ Vựng Cấp ${a}</span>
          </a>
        `),T&&(T.innerHTML=N),o.style.display="flex"}},window.closePendingBookModal=function(t){if(t&&t.target!==t.currentTarget)return;const e=document.getElementById("pending-book-modal");e&&(e.style.display="none")},window.showMascotTipModal=function(){const t=document.getElementById("pending-book-modal"),e=document.getElementById("pending-modal-cover"),n=document.getElementById("pending-modal-title"),i=document.getElementById("pending-modal-desc"),a=document.getElementById("pending-modal-actions");t&&n&&i&&(e&&(e.src="/assets/hongtai_dragon_mascot.png",e.alt="HongTai Dragon Mascot"),n.textContent="Mẹo Đọc Sách Thông Minh Cùng HongTai",i.innerHTML=`
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
        `),t.style.display="flex")};function Me(){const t={all:j.length};j.forEach(e=>{t[e.category]=(t[e.category]||0)+1}),oe.forEach(e=>{const n=e.getAttribute("data-category"),i=e.querySelector(".documents-filter-count");i&&(i.textContent=t[n]||0)})}function W(){if(!K)return;let t=j.filter(e=>{const n=de==="all"||e.category===de,i=!B||e.titleVi&&e.titleVi.toLowerCase().includes(B)||e.titleOriginal&&e.titleOriginal.toLowerCase().includes(B)||e.category&&e.category.toLowerCase().includes(B)||e.description&&e.description.toLowerCase().includes(B);return n&&i});if(t.length===0){K.innerHTML=`
        <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; color: #94a3b8;">
          <i class="fa-solid fa-book-open" style="font-size: 3rem; color: #475569; margin-bottom: 16px;"></i>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #cbd5e1; margin: 0 0 8px 0;">Không tìm thấy sách phù hợp</h3>
          <p style="margin: 0; font-size: 0.95rem;">Thử tìm với từ khóa khác hoặc chuyển sang danh mục Tất cả.</p>
        </div>
      `;return}K.innerHTML=t.map(e=>{const n=be(e.id),i=e.userProgress||n,a=i&&i.lastPage>1;let o="tag-van-hoa";return e.category.includes("HSK")?o="tag-hsk":e.category.includes("Hán Ngữ")?o="tag-han-ngu":e.category.includes("Biên Phiên Dịch")?o="tag-bien-dich":e.category.includes("Giáo Viên")?o="tag-giao-vien":e.category.includes("Văn Học")||e.category.includes("Truyện")?o="tag-van-hoc":e.category.includes("Ngữ Pháp")&&(o="tag-ngu-phap"),`
        <div class="book-card" id="card-${e.id}">
          <div class="book-card-spine"></div>
          
          <div class="book-card-header">
            <span class="book-category-tag ${o}">${g(e.category)}</span>
            <span class="book-size-chip"><i class="fa-regular fa-file-pdf"></i> ${e.sizeMB} MB</span>
          </div>

          <div class="book-card-body">
            <h3 class="book-title-vi" title="${g(e.titleVi)}">${g(e.titleVi)}</h3>
            <p class="book-title-original" title="${g(e.titleOriginal)}">${g(e.titleOriginal)}</p>
            <p class="book-desc">${g(e.description)}</p>
          </div>

          ${a?`
            <div class="book-card-progress">
              <div class="book-progress-text">
                <span><i class="fa-solid fa-bookmark" style="color: #38bdf8;"></i> Đang đọc: Trang ${i.lastPage}${i.totalPages?"/"+i.totalPages:""}</span>
                <span>${i.percentage||0}%</span>
              </div>
              <div class="book-progress-bar-bg">
                <div class="book-progress-bar-fill" style="width: ${i.percentage||0}%;"></div>
              </div>
            </div>
          `:""}

          <div class="book-card-actions">
            <button class="btn-read-book ${a?"has-progress":""}" onclick="window.openBookReader('${e.id}')">
              <i class="fa-solid ${a?"fa-book-open-reader":"fa-book-open"}"></i>
              <span>${a?`Tiếp tục đọc (Trang ${i.lastPage})`:"Đọc Sách Ngay"}</span>
            </button>
            <div class="book-interaction-badges">
              <span class="interaction-badge" title="Bình luận"><i class="fa-regular fa-comment"></i> ${e.totalComments||0}</span>
              ${e.totalUserNotes>0?`<span class="interaction-badge" title="Ghi chú cá nhân"><i class="fa-solid fa-pencil" style="color: #fbbf24;"></i> ${e.totalUserNotes}</span>`:""}
            </div>
          </div>
        </div>
      `}).join("")}window.openBookReader=async function(t){const e=j.find(a=>a.id===t);if(!e)return;y=e,d&&(d.style.display="flex",document.body.style.overflow="hidden",Le(x)),window.innerWidth<=768&&(I="fitWidth"),he&&(he.textContent=e.titleVi),me&&(me.innerHTML=`<span>${e.category}</span> • <span>${e.titleOriginal}</span>`),_(!0,"Đang mở sách và tải trang đầu...");const n=be(t),i=e.userProgress&&e.userProgress.lastPage||n&&n.lastPage||1;c=i,ze(t),Ve(t);try{const a=`${E}/api/books/${t}/stream`;f=await window.pdfjsLib.getDocument({url:a,withCredentials:!0,cMapUrl:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",cMapPacked:!0}).promise,$=f.numPages,ue&&(ue.textContent=`/ ${$}`),w&&(w.max=$,w.value=c),_(!1),ve(c),i>1&&u(`Đã khôi phục trang bạn đang đọc dở: Trang ${i}`)}catch(a){console.error("Error loading PDF:",a),_(!1),u("Không thể mở tệp sách. Vui lòng thử lại sau.",!0),ye()}};async function ve(t){if(f){te=!0,_(!0,`Đang nạp trang ${t}...`);try{const e=await f.getPage(t),n=document.getElementById("reader-viewport"),i=e.getViewport({scale:1}),a=window.innerWidth<=768;if(I==="fitWidth"&&n){const h=n.clientWidth-(a?12:48);b=Math.max(.35,Math.min(2.8,h/i.width))}else if(I==="fitPage"&&n){const h=n.clientHeight-(a?24:60);b=Math.max(.35,Math.min(2.5,h/i.height))}const o=window.devicePixelRatio||1,l=e.getViewport({scale:b*o});k.height=l.height,k.width=l.width,k.style.width=`${l.width/o}px`,k.style.height=`${l.height/o}px`;const p={canvasContext:$e,viewport:l};await e.render(p).promise,te=!1,_(!1),ne!==null&&(ve(ne),ne=null),n&&c!==t&&(n.scrollTop=0,n.scrollLeft=0),c=t,w&&(w.value=t),Ge(),je(t,$),v&&v.classList.contains("open")&&q==="page"&&J()}catch(e){console.error("Error rendering page:",e),te=!1,_(!1)}}}function H(t){te?ne=t:ve(t)}function Y(){c<=1||H(c-1)}function Q(){!f||c>=$||H(c+1)}function Ge(){const t=c<=1,e=!f||c>=$;U&&(U.disabled=t),R&&(R.disabled=e),F&&(F.disabled=t),X&&(X.disabled=e)}function _(t,e="Đang tải..."){if(!ie)return;ie.style.display=t?"flex":"none";const n=ie.querySelector(".reader-loading-text");n&&(n.textContent=e)}function ye(){d&&(d.style.display="none",document.body.style.overflow=""),P(v),P(S),f&&(f.destroy(),f=null),W()}function je(t,e){ge&&clearTimeout(ge),ge=setTimeout(()=>{Ke(t,e)},1e3)}async function Ke(t,e){if(!y)return;const n=y.id,i={bookId:n,lastPage:t,totalPages:e,percentage:e?Math.min(100,Math.round(t/e*100)):0,updatedAt:Date.now()};Ae(n,i);try{await fetch(`${E}/api/books/${n}/progress`,{method:"POST",headers:{"Content-Type":"application/json",...G()},body:JSON.stringify({page:t,totalPages:e})})}catch(a){console.warn("Could not sync reading progress to server:",a)}}function be(t){try{const e=localStorage.getItem(`hongtai_book_progress_${t}`);return e?JSON.parse(e):null}catch{return null}}function Ae(t,e){try{localStorage.setItem(`hongtai_book_progress_${t}`,JSON.stringify(e))}catch{}}async function ze(t){try{const n=await(await fetch(`${E}/api/books/${t}/comments`,{headers:G()})).json();n.success&&Array.isArray(n.comments)&&(V=n.comments,xe(),J())}catch(e){console.error("Failed to fetch comments:",e)}}function xe(){const t=document.getElementById("reader-comments-count-badge");t&&(t.textContent=V.length,t.style.display=V.length>0?"inline-block":"none")}function De(){if(!v)return;P(S),v.classList.contains("open")?P(v):(v.classList.add("open"),J())}function J(){if(!se)return;let t=V;q==="page"&&(t=t.filter(n=>Number(n.page)===Number(c)));const e=document.getElementById("comments-current-page-label");if(e&&(e.textContent=q==="page"?`Trang ${c}`:"Tất cả các trang"),t.length===0){se.innerHTML=`
        <div style="text-align: center; padding: 40px 10px; color: #94a3b8;">
          <i class="fa-regular fa-comment-dots" style="font-size: 2.2rem; color: #475569; margin-bottom: 12px;"></i>
          <p style="font-size: 0.9rem; margin: 0;">Chưa có bình luận nào cho ${q==="page"?`trang ${c}`:"sách này"}.</p>
          <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0 0;">Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ ý kiến!</p>
        </div>
      `;return}se.innerHTML=t.map(n=>{const i=(n.authorName||"H").charAt(0).toUpperCase(),a=Re(n.createdAt);return`
        <div class="comment-card" id="comment-${n.id}">
          <div class="comment-card-header">
            <div class="comment-user-info">
              ${n.authorPicture?`<img src="${n.authorPicture}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;">`:`<div class="comment-avatar">${i}</div>`}
              <span class="comment-author-name">${g(n.authorName)}</span>
            </div>
            <span class="comment-page-badge" onclick="window.jumpToPage(${n.page})" style="cursor: pointer;" title="Nhảy tới trang ${n.page}">Trang ${n.page}</span>
          </div>
          <div class="comment-content">${g(n.content)}</div>
          <div class="comment-time">${a}</div>
        </div>
      `}).join("")}async function _e(){if(!ae||!y)return;const t=ae.value.trim();if(!t){u("Vui lòng nhập nội dung bình luận.",!0);return}try{const n=await(await fetch(`${E}/api/books/${y.id}/comments`,{method:"POST",headers:{"Content-Type":"application/json",...G()},body:JSON.stringify({page:c,content:t})})).json();n.success&&n.comment?(V.unshift(n.comment),ae.value="",xe(),J(),u("Đã gửi bình luận thành công!")):u(n.error||"Lỗi gửi bình luận",!0)}catch(e){console.error("Error posting comment:",e),u("Không thể gửi bình luận.",!0)}}async function Ve(t){try{const n=await(await fetch(`${E}/api/books/${t}/notes`,{headers:G()})).json();n.success&&Array.isArray(n.notes)&&(L=n.notes,ke(),re())}catch(e){console.error("Failed to fetch notes:",e)}}function ke(){const t=document.getElementById("reader-notes-count-badge");t&&(t.textContent=L.length,t.style.display=L.length>0?"inline-block":"none")}function qe(){if(!S)return;P(v),S.classList.contains("open")?P(S):(S.classList.add("open"),re())}function re(){if(ce){if(L.length===0){ce.innerHTML=`
        <div style="text-align: center; padding: 40px 10px; color: #94a3b8;">
          <i class="fa-solid fa-feather-pointed" style="font-size: 2.2rem; color: #475569; margin-bottom: 12px;"></i>
          <p style="font-size: 0.9rem; margin: 0;">Bạn chưa có ghi chú nào cho cuốn sách này.</p>
          <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0 0;">Ghi lại từ mới, ngữ pháp hoặc lưu ý cá nhân tại từng trang.</p>
        </div>
      `;return}ce.innerHTML=L.map(t=>`
        <div class="note-card" style="border-left-color: ${t.color||"#fef08a"};" onclick="window.jumpToPage(${t.page})">
          <div class="note-card-top">
            <span class="note-jump-badge"><i class="fa-solid fa-arrow-turn-down"></i> Trang ${t.page}</span>
            <button class="note-delete-btn" onclick="event.stopPropagation(); window.deleteNote('${t.id}')" title="Xóa ghi chú"><i class="fa-solid fa-trash-can"></i></button>
          </div>
          <div class="note-text">${g(t.content)}</div>
        </div>
      `).join("")}}async function Oe(){if(!le||!y)return;const t=le.value.trim();if(!t){u("Vui lòng nhập nội dung ghi chú.",!0);return}try{const n=await(await fetch(`${E}/api/books/${y.id}/notes`,{method:"POST",headers:{"Content-Type":"application/json",...G()},body:JSON.stringify({page:c,content:t,color:Te})})).json();n.success&&n.note&&(L.unshift(n.note),le.value="",ke(),re(),u(`Đã lưu ghi chú cho Trang ${c}!`))}catch(e){console.error("Error saving note:",e),u("Không thể lưu ghi chú.",!0)}}window.deleteNote=async function(t){if(confirm("Bạn có chắc chắn muốn xóa ghi chú này?")&&y)try{(await(await fetch(`${E}/api/books/${y.id}/notes/${t}`,{method:"DELETE",headers:G()})).json()).success&&(L=L.filter(i=>i.id!==t),ke(),re(),u("Đã xóa ghi chú."))}catch(e){console.error("Error deleting note:",e),u("Lỗi xóa ghi chú.",!0)}},window.jumpToPage=function(t){!f||t<1||t>$||H(t)};function P(t){t&&t.classList.remove("open")}function Ue(){d&&(x==="dark"?x="sepia":x==="sepia"?x="light":x="dark",localStorage.setItem("hongtai_reader_theme",x),Le(x))}function Le(t){if(!d)return;d.classList.remove("theme-dark","theme-sepia","theme-light"),d.classList.add(`theme-${t}`);const e=document.querySelector("#reader-theme-toggle i");e&&(t==="dark"?e.className="fa-solid fa-moon":t==="sepia"?e.className="fa-solid fa-sun":e.className="fa-regular fa-sun")}function G(){const t={};try{const n=JSON.parse(localStorage.getItem("user")||sessionStorage.getItem("user")||"{}");n&&n.token&&(t.Authorization=`Bearer ${n.token}`)}catch{}let e=localStorage.getItem("hongtai_guest_device_id");return e||(e="dev_"+Math.random().toString(36).substring(2,10),localStorage.setItem("hongtai_guest_device_id",e)),t["x-guest-id"]=e,t}function u(t,e=!1){if(typeof window.showToast=="function"){window.showToast(t,e);return}const n=document.createElement("div");n.style.cssText=`
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
    `,n.textContent=t,document.body.appendChild(n),setTimeout(()=>{n.style.opacity="0",setTimeout(()=>n.remove(),300)},2800)}function g(t){return t?String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function Re(t){if(!t)return"";const e=Math.floor((Date.now()-new Date(t).getTime())/1e3);return e<60?"Vừa xong":e<3600?`${Math.floor(e/60)} phút trước`:e<86400?`${Math.floor(e/3600)} giờ trước`:e<2592e3?`${Math.floor(e/86400)} ngày trước`:new Date(t).toLocaleDateString("vi-VN")}})();
