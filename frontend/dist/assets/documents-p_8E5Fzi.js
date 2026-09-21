import"./global_sidebar-DU5b37H7.js";/* empty css              */window.pdfjsLib&&(window.pdfjsLib.GlobalWorkerOptions.workerSrc="/vendor/pdfjs/pdf.worker.min.js");(function(){const w="";let M=[],ae="all",E="",y=null,m=null,c=1,T=0,X=!1,Q=null,C=1.25,H="fitWidth",ce=null,B=localStorage.getItem("hongtai_reader_theme")||"dark",A=[],V="page",$=[],ye="#fef08a",be=0,ke=0,j,z,G,J,I,S,K,_,d,b,we,k,re,le,de,q,O,U,R,Y,f,Z,ee,ge,x,te,ne,ue;document.addEventListener("DOMContentLoaded",()=>{$e(),Ie(),xe(),Le(),Ee()});function $e(){j=document.getElementById("documents-grid"),z=document.getElementById("documents-search-input"),G=document.getElementById("documents-search-clear"),J=document.querySelectorAll(".documents-filter-btn"),I=document.getElementById("documents-bookshelf-view"),S=document.getElementById("documents-catalog-view"),K=document.getElementById("btn-view-bookshelf"),_=document.getElementById("btn-view-catalog"),d=document.getElementById("ebook-reader-modal"),b=document.getElementById("pdf-render-canvas"),b&&(we=b.getContext("2d")),k=document.getElementById("reader-page-input"),re=document.getElementById("reader-total-pages"),le=document.getElementById("reader-book-title"),de=document.getElementById("reader-book-meta"),q=document.getElementById("reader-btn-prev"),O=document.getElementById("reader-btn-next"),U=document.getElementById("reader-float-prev"),R=document.getElementById("reader-float-next"),Y=document.getElementById("reader-loading-overlay"),f=document.getElementById("reader-comments-drawer"),Z=document.getElementById("reader-comments-list"),ee=document.getElementById("reader-comment-input"),ge=document.getElementById("btn-submit-comment"),x=document.getElementById("reader-notes-drawer"),te=document.getElementById("reader-notes-list"),ne=document.getElementById("reader-note-input"),ue=document.getElementById("btn-submit-note")}function Ie(){z&&z.addEventListener("input",s=>{E=s.target.value.trim().toLowerCase(),G&&(G.style.display=E?"block":"none"),F()}),G&&G.addEventListener("click",()=>{z&&(z.value=""),E="",G.style.display="none",F()}),J.forEach(s=>{s.addEventListener("click",()=>{J.forEach(l=>l.classList.remove("active")),s.classList.add("active"),ae=s.getAttribute("data-category")||"all",F()})}),q&&q.addEventListener("click",oe),O&&O.addEventListener("click",ie),U&&U.addEventListener("click",oe),R&&R.addEventListener("click",ie),k&&k.addEventListener("change",s=>{const l=parseInt(s.target.value,10);!isNaN(l)&&l>=1&&l<=T?P(l):k.value=c});const t=document.getElementById("reader-zoom-in"),e=document.getElementById("reader-zoom-out"),n=document.getElementById("reader-zoom-fit");t&&t.addEventListener("click",()=>{H="custom",C=Math.min(3,C+.2),P(c)}),e&&e.addEventListener("click",()=>{H="custom",C=Math.max(.6,C-.2),P(c)}),n&&n.addEventListener("click",()=>{H=H==="fitWidth"?"fitPage":"fitWidth",u(H==="fitWidth"?"Đã chỉnh: Vừa chiều rộng":"Đã chỉnh: Vừa trang"),P(c)});const o=document.getElementById("reader-theme-toggle");o&&o.addEventListener("click",Ae);const a=document.getElementById("reader-btn-back");a&&a.addEventListener("click",me);const i=document.getElementById("reader-toggle-comments");i&&i.addEventListener("click",je);const g=document.getElementById("drawer-close-comments");g&&g.addEventListener("click",()=>L(f));const h=document.getElementById("reader-toggle-notes");h&&h.addEventListener("click",_e);const p=document.getElementById("drawer-close-notes");p&&p.addEventListener("click",()=>L(x)),document.querySelectorAll(".drawer-filter-tab").forEach(s=>{s.addEventListener("click",()=>{document.querySelectorAll(".drawer-filter-tab").forEach(l=>l.classList.remove("active")),s.classList.add("active"),V=s.getAttribute("data-mode")||"page",W()})}),document.querySelectorAll(".color-dot").forEach(s=>{s.addEventListener("click",()=>{document.querySelectorAll(".color-dot").forEach(l=>l.classList.remove("active")),s.classList.add("active"),ye=s.getAttribute("data-color")||"#fef08a"})}),ge&&ge.addEventListener("click",Ge),ue&&ue.addEventListener("click",De),window.addEventListener("keydown",s=>{!d||d.style.display!=="flex"||["INPUT","TEXTAREA"].includes(document.activeElement.tagName)||(s.key==="ArrowRight"||s.key==="PageDown"||s.key===" "?(s.preventDefault(),ie()):s.key==="ArrowLeft"||s.key==="PageUp"?(s.preventDefault(),oe()):s.key==="Escape"&&me())});const v=document.getElementById("reader-viewport");v&&(v.addEventListener("touchstart",s=>{s.touches.length===1&&(be=s.touches[0].clientX,ke=s.touches[0].clientY)},{passive:!0}),v.addEventListener("touchend",s=>{if(s.changedTouches.length===1){const l=s.changedTouches[0].clientX-be,ve=s.changedTouches[0].clientY-ke;Math.abs(l)>60&&Math.abs(l)>Math.abs(ve)*1.5&&(l<0?ie():oe())}},{passive:!0}))}function xe(){d&&d.addEventListener("contextmenu",t=>(t.preventDefault(),u("🔒 Tài liệu được bảo vệ bản quyền - Chỉ hỗ trợ đọc trực tuyến trên Tiếng Trung HongTai",!0),!1)),window.addEventListener("keydown",t=>{if(d&&d.style.display==="flex"&&(t.ctrlKey||t.metaKey)&&["s","p","u"].includes(t.key.toLowerCase()))return t.preventDefault(),u("🔒 Tính năng in và lưu tệp bị vô hiệu hóa để bảo vệ bản quyền tác giả.",!0),!1}),b&&b.addEventListener("dragstart",t=>t.preventDefault())}async function Le(){try{const e=await(await fetch(`${w}/api/books`,{headers:N()})).json();e.success&&Array.isArray(e.books)&&(M=e.books,Ce(),F(),Ee())}catch(t){console.error("Failed to load books catalog:",t),j&&(j.innerHTML=`
          <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #ef4444;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 12px;"></i>
            <p style="font-weight: 700;">Không thể tải kho sách. Vui lòng kiểm tra kết nối máy chủ.</p>
          </div>
        `)}}window.switchDocsView=function(t){(!I||!S)&&(I=document.getElementById("documents-bookshelf-view"),S=document.getElementById("documents-catalog-view"),K=document.getElementById("btn-view-bookshelf"),_=document.getElementById("btn-view-catalog")),t==="bookshelf"?(I&&(I.style.display="block"),S&&(S.style.display="none"),K&&K.classList.add("active"),_&&_.classList.remove("active")):(I&&(I.style.display="none"),S&&(S.style.display="block"),K&&K.classList.remove("active"),_&&_.classList.add("active"))};function Ee(){const t=I||document.getElementById("documents-bookshelf-view");if(!t)return;function e(o){if(!o)return null;const a=M.find(h=>h.id===o),i=fe(o),g=a&&a.userProgress||i;return g&&g.lastPage>1?g:null}const n=[{id:"shelf-hsk2",accentColor:"#0284c7",mascotImg:"/assets/hongtai_dragon_mascot.png",title:"Giáo Trình Chuẩn HSK 2.0",subtitle:"Bộ giáo trình 6 cấp độ (HSK 1 - HSK 6)",books:[{level:1,title:"Giáo Trình Chuẩn HSK 1",coverUrl:"/covers/hsk2/hsk1.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 1 bao gồm 15 bài học nhập môn kèm file dịch tiếng Việt chuẩn của TS. Nguyễn Thị Minh Hồng."},{level:2,title:"Giáo Trình Chuẩn HSK 2",coverUrl:"/covers/hsk2/hsk2.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 2 bao gồm 15 bài học sơ cấp nâng cao mở rộng vốn câu giao tiếp thực tế."},{level:3,title:"Giáo Trình Chuẩn HSK 3",coverUrl:"/covers/hsk2/hsk3.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 3 bao gồm 20 bài học củng cố ngữ pháp trung cấp và diễn đạt mở rộng."},{level:4,title:"Giáo Trình Chuẩn HSK 4",coverUrl:"/covers/hsk2/hsk4.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 4 gồm 2 tập Thượng và Hạ với 20 chủ đề chuyên sâu."},{level:5,title:"Giáo Trình Chuẩn HSK 5 (Tập Dưới)",coverUrl:"/covers/hsk2/hsk5.jpg",bookId:"book_8e6cd7",desc:"Giáo trình chuẩn HSK 5 Tập Dưới (HSK 5 chuẩn下.pdf) bản số hóa sắc nét, đọc trực tuyến mượt mà."},{level:6,title:"Giáo Trình Chuẩn HSK 6",coverUrl:"/covers/hsk2/hsk6.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 6 cao cấp dành cho người học thành thạo ngôn ngữ."}]},{id:"shelf-hsk3",accentColor:"#10b981",mascotImg:"/assets/dragon_award_mascot.png",title:"Giáo Trình HSK 3.0 Mới",subtitle:"Bộ giáo trình tiêu chuẩn quốc tế mới nhất (Cấp 1 - Cấp 4)",books:[{level:1,title:"新 HSK 教程 1 (HSK 3.0)",coverUrl:"/covers/hsk3/hsk1.jpg",bookId:null,desc:"Giáo trình HSK cấp độ 1 tiêu chuẩn 3.0 mới nhất do NXB Giáo dục & Nghiên cứu Giảng dạy Ngôn ngữ Bắc Kinh xuất bản."},{level:2,title:"新 HSK 教程 2 (HSK 3.0)",coverUrl:"/covers/hsk3/hsk2.jpg",bookId:"book_74e5v6",desc:"Toàn bộ giáo trình HSK 2 mới chuẩn quốc tế 3.0 với đầy đủ bài khóa và hội thoại."},{level:3,title:"新 HSK 教程 3 (HSK 3.0)",coverUrl:"/covers/hsk3/hsk3.jpg",bookId:"book_3b4cws",desc:"Giáo trình HSK 3 mới chuẩn 3.0 củng cố hệ thống ngữ pháp và 1000 từ vựng cốt lõi."},{level:4,title:"新 HSK 教程 4 (Tập Trên - HSK 3.0)",coverUrl:"/covers/hsk3/hsk4.jpg",bookId:"book_32gwjz",desc:"Giáo trình HSK 4 mới Tập Trên chuẩn v3.0 kèm 10 bài học trung cấp cơ bản."}]},{id:"shelf-hanngu",accentColor:"#f59e0b",mascotImg:"/assets/logo.png",title:"Giáo Trình Hán Ngữ 6 Cuốn",subtitle:"Bản dịch song ngữ Trung - Việt chuẩn Đại học (Tập 1 - 6)",books:[{volNum:1,title:"Giáo Trình Hán Ngữ 1",subtitle:"Bản dịch song ngữ",bookId:"book_m03mz1",color:"#eab308",tag:"Quyển 1 Thượng",desc:"Giáo trình Hán ngữ cơ sở quyển 1 chuẩn quốc tế, rèn luyện phát âm Pinyin, nét bút và giao tiếp nhập môn."},{volNum:2,title:"Giáo Trình Hán Ngữ 2",subtitle:"Bản dịch song ngữ",bookId:"book_82zwgt",color:"#16a34a",tag:"Quyển 1 Hạ",desc:"Giáo trình Hán ngữ bộ 6 tập quyển 2, bản dịch chú giải tiếng Việt chuẩn xác cho học viên mới bắt đầu."},{volNum:3,title:"Giáo Trình Hán Ngữ 3",subtitle:"Bản dịch song ngữ",bookId:"book_8emthg",color:"#ea580c",tag:"Quyển 2 Thượng",desc:"Giáo trình Hán ngữ quyển 3 (Tập 2 Thượng), bước ngoặt củng cố ngữ pháp trung cấp và diễn đạt mở rộng."},{volNum:4,title:"Giáo Trình Hán Ngữ 4",subtitle:"Bản dịch song ngữ",bookId:"book_ow9jfp",color:"#2563eb",tag:"Quyển 2 Hạ",desc:"Giáo trình Hán ngữ quyển 4 (Tập 2 Hạ), nâng cao vốn từ vựng chuyên đề, câu phức và đối thoại chuyên sâu."},{volNum:5,title:"Giáo Trình Hán Ngữ 5",subtitle:"Bản dịch song ngữ",bookId:"book_tn7sl6",color:"#9333ea",tag:"Quyển 3 Thượng",desc:"Giáo trình Hán ngữ quyển 5 (Tập 3 Thượng) nâng cao khả năng phân tích ngữ văn và nghị luận."},{volNum:6,title:"Giáo Trình Hán Ngữ 6",subtitle:"Bản dịch song ngữ",bookId:null,color:"#0f766e",tag:"Quyển 3 Hạ",desc:"Giáo trình Hán ngữ quyển 6 (Tập 3 Hạ) hoàn thiện kỹ năng đọc hiểu và văn phong bản xứ cao cấp."}]}];t.innerHTML=n.map(o=>{const a=o.books.map(i=>{const g=e(i.bookId),h=!!i.bookId;let p="";g?p=`<span class="comic-book-status-badge reading"><i class="fa-solid fa-bookmark"></i> P.${g.lastPage}</span>`:h?p='<span class="comic-book-status-badge available"><i class="fa-solid fa-book-open"></i> Đọc ngay</span>':p='<span class="comic-book-status-badge"><i class="fa-solid fa-clock"></i> Sắp ra</span>';let v="";i.coverUrl?v=`<img src="${i.coverUrl}" alt="${r(i.title)}" class="comic-book-cover-img" loading="lazy">`:v=`
            <div class="styled-vol-card" style="background: linear-gradient(145deg, ${i.color||"#3b82f6"}, #0f172a 130%);">
              <div class="vol-sub">${r(i.tag||"Giáo Trình")}</div>
              <div class="vol-name">${r(i.title)}</div>
              <div class="vol-center-pattern">
                <div class="pattern-grid">
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.7);"></div>
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.3);"></div>
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.8);"></div>
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.4);"></div>
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.9);"></div>
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.5);"></div>
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.6);"></div>
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.85);"></div>
                  <div class="pattern-cell" style="background: rgba(255,255,255,0.35);"></div>
                </div>
              </div>
              <div class="vol-footer">
                <div class="vol-foot-label">HongTai<br>Book</div>
                <div class="vol-number-badge">${i.volNum||i.level||""}</div>
              </div>
            </div>
          `;const s=r(i.title),l=i.coverUrl?r(i.coverUrl):"",ve=r(i.desc||""),ze=i.bookId?`'${i.bookId}'`:"null",qe=i.level||i.volNum?`${i.level||i.volNum}`:"null";return`
          <div class="comic-book-card" onclick="window.openShelfBook(${ze}, '${s}', '${l}', '${ve}', ${qe})" title="${s}">
            <div class="comic-book-spine-overlay"></div>
            <div class="comic-book-gloss-overlay"></div>
            ${p}
            ${v}
          </div>
        `}).join("");return`
        <section class="bookshelf-shelf" style="--shelf-accent: ${o.accentColor};">
          <div class="bookshelf-shelf-header">
            <div class="bookshelf-mascot-badge">
              <img src="${o.mascotImg}" alt="Mascot" class="bookshelf-mascot-img">
            </div>
            <div class="bookshelf-shelf-titles">
              <h2 class="bookshelf-shelf-title">${r(o.title)}</h2>
              <p class="bookshelf-shelf-subtitle">${r(o.subtitle)}</p>
            </div>
          </div>
          <div class="bookshelf-grid">
            ${a}
          </div>
        </section>
      `}).join("")}window.openShelfBook=function(t,e,n,o,a){if(t){window.openBookReader(t);return}const i=document.getElementById("pending-book-modal"),g=document.getElementById("pending-modal-cover"),h=document.getElementById("pending-modal-title"),p=document.getElementById("pending-modal-desc"),v=document.getElementById("pending-modal-actions");if(i&&h&&p){g&&(g.src=n||"/assets/logo.png",g.alt=e),h.textContent=e,p.textContent=o||"Bản số hóa chất lượng cao đang được cập nhật để mang lại trải nghiệm đọc tốt nhất cho bạn.";let s=`
        <button onclick="window.closePendingBookModal()" class="topbar-comic-menu-btn" style="width: auto; padding: 8px 18px; font-size: 0.9rem; font-weight: 800;">
          Đóng
        </button>
      `;a&&(s+=`
          <a href="/detail-list.html?level=${a}" class="topbar-comic-login-btn">
            <i class="fa-solid fa-graduation-cap"></i>
            <span>Học Từ Vựng Cấp ${a}</span>
          </a>
        `),v&&(v.innerHTML=s),i.style.display="flex"}},window.closePendingBookModal=function(t){if(t&&t.target!==t.currentTarget)return;const e=document.getElementById("pending-book-modal");e&&(e.style.display="none")},window.showMascotTipModal=function(){const t=document.getElementById("pending-book-modal"),e=document.getElementById("pending-modal-cover"),n=document.getElementById("pending-modal-title"),o=document.getElementById("pending-modal-desc"),a=document.getElementById("pending-modal-actions");t&&n&&o&&(e&&(e.src="/assets/hongtai_dragon_mascot.png",e.alt="HongTai Dragon Mascot"),n.textContent="Mẹo Đọc Sách Thông Minh Cùng HongTai",o.innerHTML=`
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
        `),t.style.display="flex")};function Ce(){const t={all:M.length};M.forEach(e=>{t[e.category]=(t[e.category]||0)+1}),J.forEach(e=>{const n=e.getAttribute("data-category"),o=e.querySelector(".documents-filter-count");o&&(o.textContent=t[n]||0)})}function F(){if(!j)return;let t=M.filter(e=>{const n=ae==="all"||e.category===ae,o=!E||e.titleVi&&e.titleVi.toLowerCase().includes(E)||e.titleOriginal&&e.titleOriginal.toLowerCase().includes(E)||e.category&&e.category.toLowerCase().includes(E)||e.description&&e.description.toLowerCase().includes(E);return n&&o});if(t.length===0){j.innerHTML=`
        <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; color: #94a3b8;">
          <i class="fa-solid fa-book-open" style="font-size: 3rem; color: #475569; margin-bottom: 16px;"></i>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #cbd5e1; margin: 0 0 8px 0;">Không tìm thấy sách phù hợp</h3>
          <p style="margin: 0; font-size: 0.95rem;">Thử tìm với từ khóa khác hoặc chuyển sang danh mục Tất cả.</p>
        </div>
      `;return}j.innerHTML=t.map(e=>{const n=fe(e.id),o=e.userProgress||n,a=o&&o.lastPage>1;let i="tag-van-hoa";return e.category.includes("HSK")?i="tag-hsk":e.category.includes("Hán Ngữ")?i="tag-han-ngu":e.category.includes("Biên Phiên Dịch")?i="tag-bien-dich":e.category.includes("Giáo Viên")?i="tag-giao-vien":e.category.includes("Văn Học")||e.category.includes("Truyện")?i="tag-van-hoc":e.category.includes("Ngữ Pháp")&&(i="tag-ngu-phap"),`
        <div class="book-card" id="card-${e.id}">
          <div class="book-card-spine"></div>
          
          <div class="book-card-header">
            <span class="book-category-tag ${i}">${r(e.category)}</span>
            <span class="book-size-chip"><i class="fa-regular fa-file-pdf"></i> ${e.sizeMB} MB</span>
          </div>

          <div class="book-card-body">
            <h3 class="book-title-vi" title="${r(e.titleVi)}">${r(e.titleVi)}</h3>
            <p class="book-title-original" title="${r(e.titleOriginal)}">${r(e.titleOriginal)}</p>
            <p class="book-desc">${r(e.description)}</p>
          </div>

          ${a?`
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
            <button class="btn-read-book ${a?"has-progress":""}" onclick="window.openBookReader('${e.id}')">
              <i class="fa-solid ${a?"fa-book-open-reader":"fa-book-open"}"></i>
              <span>${a?`Tiếp tục đọc (Trang ${o.lastPage})`:"Đọc Sách Ngay"}</span>
            </button>
            <div class="book-interaction-badges">
              <span class="interaction-badge" title="Bình luận"><i class="fa-regular fa-comment"></i> ${e.totalComments||0}</span>
              ${e.totalUserNotes>0?`<span class="interaction-badge" title="Ghi chú cá nhân"><i class="fa-solid fa-pencil" style="color: #fbbf24;"></i> ${e.totalUserNotes}</span>`:""}
            </div>
          </div>
        </div>
      `}).join("")}window.openBookReader=async function(t){const e=M.find(a=>a.id===t);if(!e)return;y=e,d&&(d.style.display="flex",document.body.style.overflow="hidden",Be(B)),le&&(le.textContent=e.titleVi),de&&(de.innerHTML=`<span>${e.category}</span> • <span>${e.titleOriginal}</span>`),D(!0,"Đang mở sách và tải trang đầu...");const n=fe(t),o=e.userProgress&&e.userProgress.lastPage||n&&n.lastPage||1;c=o,Me(t),Ke(t);try{const a=`${w}/api/books/${t}/stream`;m=await window.pdfjsLib.getDocument({url:a,withCredentials:!0,cMapUrl:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",cMapPacked:!0}).promise,T=m.numPages,re&&(re.textContent=`/ ${T}`),k&&(k.max=T,k.value=c),D(!1),he(c),o>1&&u(`Đã khôi phục trang bạn đang đọc dở: Trang ${o}`)}catch(a){console.error("Error loading PDF:",a),D(!1),u("Không thể mở tệp sách. Vui lòng thử lại sau.",!0),me()}};async function he(t){if(m){X=!0,D(!0,`Đang nạp trang ${t}...`);try{const e=await m.getPage(t),n=document.getElementById("reader-viewport"),o=e.getViewport({scale:1});if(H==="fitWidth"&&n){const h=n.clientWidth-48;C=Math.max(.6,Math.min(2.5,h/o.width))}else if(H==="fitPage"&&n){const h=n.clientHeight-60;C=Math.max(.6,Math.min(2,h/o.height))}const a=window.devicePixelRatio||1,i=e.getViewport({scale:C*a});b.height=i.height,b.width=i.width,b.style.width=`${i.width/a}px`,b.style.height=`${i.height/a}px`;const g={canvasContext:we,viewport:i};await e.render(g).promise,X=!1,D(!1),Q!==null&&(he(Q),Q=null),c=t,k&&(k.value=t),He(),Se(t,T),f&&f.classList.contains("open")&&V==="page"&&W()}catch(e){console.error("Error rendering page:",e),X=!1,D(!1)}}}function P(t){X?Q=t:he(t)}function oe(){c<=1||P(c-1)}function ie(){!m||c>=T||P(c+1)}function He(){const t=c<=1,e=!m||c>=T;q&&(q.disabled=t),O&&(O.disabled=e),U&&(U.disabled=t),R&&(R.disabled=e)}function D(t,e="Đang tải..."){if(!Y)return;Y.style.display=t?"flex":"none";const n=Y.querySelector(".reader-loading-text");n&&(n.textContent=e)}function me(){d&&(d.style.display="none",document.body.style.overflow=""),L(f),L(x),m&&(m.destroy(),m=null),F()}function Se(t,e){ce&&clearTimeout(ce),ce=setTimeout(()=>{Pe(t,e)},1e3)}async function Pe(t,e){if(!y)return;const n=y.id,o={bookId:n,lastPage:t,totalPages:e,percentage:e?Math.min(100,Math.round(t/e*100)):0,updatedAt:Date.now()};Ne(n,o);try{await fetch(`${w}/api/books/${n}/progress`,{method:"POST",headers:{"Content-Type":"application/json",...N()},body:JSON.stringify({page:t,totalPages:e})})}catch(a){console.warn("Could not sync reading progress to server:",a)}}function fe(t){try{const e=localStorage.getItem(`hongtai_book_progress_${t}`);return e?JSON.parse(e):null}catch{return null}}function Ne(t,e){try{localStorage.setItem(`hongtai_book_progress_${t}`,JSON.stringify(e))}catch{}}async function Me(t){try{const n=await(await fetch(`${w}/api/books/${t}/comments`,{headers:N()})).json();n.success&&Array.isArray(n.comments)&&(A=n.comments,Te(),W())}catch(e){console.error("Failed to fetch comments:",e)}}function Te(){const t=document.getElementById("reader-comments-count-badge");t&&(t.textContent=A.length,t.style.display=A.length>0?"inline-block":"none")}function je(){if(!f)return;L(x),f.classList.contains("open")?L(f):(f.classList.add("open"),W())}function W(){if(!Z)return;let t=A;V==="page"&&(t=t.filter(n=>Number(n.page)===Number(c)));const e=document.getElementById("comments-current-page-label");if(e&&(e.textContent=V==="page"?`Trang ${c}`:"Tất cả các trang"),t.length===0){Z.innerHTML=`
        <div style="text-align: center; padding: 40px 10px; color: #94a3b8;">
          <i class="fa-regular fa-comment-dots" style="font-size: 2.2rem; color: #475569; margin-bottom: 12px;"></i>
          <p style="font-size: 0.9rem; margin: 0;">Chưa có bình luận nào cho ${V==="page"?`trang ${c}`:"sách này"}.</p>
          <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0 0;">Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ ý kiến!</p>
        </div>
      `;return}Z.innerHTML=t.map(n=>{const o=(n.authorName||"H").charAt(0).toUpperCase(),a=Ve(n.createdAt);return`
        <div class="comment-card" id="comment-${n.id}">
          <div class="comment-card-header">
            <div class="comment-user-info">
              ${n.authorPicture?`<img src="${n.authorPicture}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;">`:`<div class="comment-avatar">${o}</div>`}
              <span class="comment-author-name">${r(n.authorName)}</span>
            </div>
            <span class="comment-page-badge" onclick="window.jumpToPage(${n.page})" style="cursor: pointer;" title="Nhảy tới trang ${n.page}">Trang ${n.page}</span>
          </div>
          <div class="comment-content">${r(n.content)}</div>
          <div class="comment-time">${a}</div>
        </div>
      `}).join("")}async function Ge(){if(!ee||!y)return;const t=ee.value.trim();if(!t){u("Vui lòng nhập nội dung bình luận.",!0);return}try{const n=await(await fetch(`${w}/api/books/${y.id}/comments`,{method:"POST",headers:{"Content-Type":"application/json",...N()},body:JSON.stringify({page:c,content:t})})).json();n.success&&n.comment?(A.unshift(n.comment),ee.value="",Te(),W(),u("Đã gửi bình luận thành công!")):u(n.error||"Lỗi gửi bình luận",!0)}catch(e){console.error("Error posting comment:",e),u("Không thể gửi bình luận.",!0)}}async function Ke(t){try{const n=await(await fetch(`${w}/api/books/${t}/notes`,{headers:N()})).json();n.success&&Array.isArray(n.notes)&&($=n.notes,pe(),se())}catch(e){console.error("Failed to fetch notes:",e)}}function pe(){const t=document.getElementById("reader-notes-count-badge");t&&(t.textContent=$.length,t.style.display=$.length>0?"inline-block":"none")}function _e(){if(!x)return;L(f),x.classList.contains("open")?L(x):(x.classList.add("open"),se())}function se(){if(te){if($.length===0){te.innerHTML=`
        <div style="text-align: center; padding: 40px 10px; color: #94a3b8;">
          <i class="fa-solid fa-feather-pointed" style="font-size: 2.2rem; color: #475569; margin-bottom: 12px;"></i>
          <p style="font-size: 0.9rem; margin: 0;">Bạn chưa có ghi chú nào cho cuốn sách này.</p>
          <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0 0;">Ghi lại từ mới, ngữ pháp hoặc lưu ý cá nhân tại từng trang.</p>
        </div>
      `;return}te.innerHTML=$.map(t=>`
        <div class="note-card" style="border-left-color: ${t.color||"#fef08a"};" onclick="window.jumpToPage(${t.page})">
          <div class="note-card-top">
            <span class="note-jump-badge"><i class="fa-solid fa-arrow-turn-down"></i> Trang ${t.page}</span>
            <button class="note-delete-btn" onclick="event.stopPropagation(); window.deleteNote('${t.id}')" title="Xóa ghi chú"><i class="fa-solid fa-trash-can"></i></button>
          </div>
          <div class="note-text">${r(t.content)}</div>
        </div>
      `).join("")}}async function De(){if(!ne||!y)return;const t=ne.value.trim();if(!t){u("Vui lòng nhập nội dung ghi chú.",!0);return}try{const n=await(await fetch(`${w}/api/books/${y.id}/notes`,{method:"POST",headers:{"Content-Type":"application/json",...N()},body:JSON.stringify({page:c,content:t,color:ye})})).json();n.success&&n.note&&($.unshift(n.note),ne.value="",pe(),se(),u(`Đã lưu ghi chú cho Trang ${c}!`))}catch(e){console.error("Error saving note:",e),u("Không thể lưu ghi chú.",!0)}}window.deleteNote=async function(t){if(confirm("Bạn có chắc chắn muốn xóa ghi chú này?")&&y)try{(await(await fetch(`${w}/api/books/${y.id}/notes/${t}`,{method:"DELETE",headers:N()})).json()).success&&($=$.filter(o=>o.id!==t),pe(),se(),u("Đã xóa ghi chú."))}catch(e){console.error("Error deleting note:",e),u("Lỗi xóa ghi chú.",!0)}},window.jumpToPage=function(t){!m||t<1||t>T||P(t)};function L(t){t&&t.classList.remove("open")}function Ae(){d&&(B==="dark"?B="sepia":B==="sepia"?B="light":B="dark",localStorage.setItem("hongtai_reader_theme",B),Be(B))}function Be(t){if(!d)return;d.classList.remove("theme-dark","theme-sepia","theme-light"),d.classList.add(`theme-${t}`);const e=document.querySelector("#reader-theme-toggle i");e&&(t==="dark"?e.className="fa-solid fa-moon":t==="sepia"?e.className="fa-solid fa-sun":e.className="fa-regular fa-sun")}function N(){const t={};try{const n=JSON.parse(localStorage.getItem("user")||sessionStorage.getItem("user")||"{}");n&&n.token&&(t.Authorization=`Bearer ${n.token}`)}catch{}let e=localStorage.getItem("hongtai_guest_device_id");return e||(e="dev_"+Math.random().toString(36).substring(2,10),localStorage.setItem("hongtai_guest_device_id",e)),t["x-guest-id"]=e,t}function u(t,e=!1){if(typeof window.showToast=="function"){window.showToast(t,e);return}const n=document.createElement("div");n.style.cssText=`
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
    `,n.textContent=t,document.body.appendChild(n),setTimeout(()=>{n.style.opacity="0",setTimeout(()=>n.remove(),300)},2800)}function r(t){return t?String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function Ve(t){if(!t)return"";const e=Math.floor((Date.now()-new Date(t).getTime())/1e3);return e<60?"Vừa xong":e<3600?`${Math.floor(e/60)} phút trước`:e<86400?`${Math.floor(e/3600)} giờ trước`:e<2592e3?`${Math.floor(e/86400)} ngày trước`:new Date(t).toLocaleDateString("vi-VN")}})();
