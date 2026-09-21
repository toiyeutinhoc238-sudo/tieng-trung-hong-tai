import"./global_sidebar-B_BNhh9i.js";/* empty css              */import"./particles-DBEuVAM5.js";window.pdfjsLib&&(window.pdfjsLib.GlobalWorkerOptions.workerSrc="/vendor/pdfjs/pdf.worker.min.js");(function(){const B="";let M=[],ge="all",E="",T=null,v=null,l=1,S=0,ne=!1,oe=null,w=1.25,$="fitWidth",he=null,x=localStorage.getItem("hongtai_reader_theme")||"dark",Q=[],q="page",C=[],Ee="#fef08a",Se=0,$e=0,V,O,A,ie,L,G,z,D,h,y,xe,H,ue,me,pe,_,R,W,X,ae,b,se,ce,fe,I,le,re,ve;document.addEventListener("DOMContentLoaded",()=>{Ke(),Pe(),Ne(),Me(),Ce()});function Ke(){V=document.getElementById("documents-grid"),O=document.getElementById("documents-search-input"),A=document.getElementById("documents-search-clear"),ie=document.querySelectorAll(".documents-filter-btn"),L=document.getElementById("documents-bookshelf-view"),G=document.getElementById("documents-catalog-view"),z=document.getElementById("btn-view-bookshelf"),D=document.getElementById("btn-view-catalog"),h=document.getElementById("ebook-reader-modal"),y=document.getElementById("pdf-render-canvas"),y&&(xe=y.getContext("2d")),H=document.getElementById("reader-page-input"),ue=document.getElementById("reader-total-pages"),me=document.getElementById("reader-book-title"),pe=document.getElementById("reader-book-meta"),_=document.getElementById("reader-btn-prev"),R=document.getElementById("reader-btn-next"),W=document.getElementById("reader-float-prev"),X=document.getElementById("reader-float-next"),ae=document.getElementById("reader-loading-overlay"),b=document.getElementById("reader-comments-drawer"),se=document.getElementById("reader-comments-list"),ce=document.getElementById("reader-comment-input"),fe=document.getElementById("btn-submit-comment"),I=document.getElementById("reader-notes-drawer"),le=document.getElementById("reader-notes-list"),re=document.getElementById("reader-note-input"),ve=document.getElementById("btn-submit-note")}function Pe(){O&&O.addEventListener("input",i=>{E=i.target.value.trim().toLowerCase(),A&&(A.style.display=E?"block":"none"),Y()}),A&&A.addEventListener("click",()=>{O&&(O.value=""),E="",A.style.display="none",Y()}),ie.forEach(i=>{i.addEventListener("click",()=>{ie.forEach(d=>d.classList.remove("active")),i.classList.add("active"),ge=i.getAttribute("data-category")||"all",Y()})}),_&&_.addEventListener("click",J),R&&R.addEventListener("click",Z),W&&W.addEventListener("click",J),X&&X.addEventListener("click",Z),H&&H.addEventListener("change",i=>{const d=parseInt(i.target.value,10);!isNaN(d)&&d>=1&&d<=S?K(d):H.value=l});const t=document.getElementById("reader-zoom-in"),e=document.getElementById("reader-zoom-out"),n=document.getElementById("reader-zoom-fit");t&&t.addEventListener("click",()=>{$="custom",w=Math.min(3,w+.2),u(`🔍 Phóng to: ${Math.round(w*100)}%`);const i=document.getElementById("reader-viewport");i&&i.scrollTop<60&&(i.scrollTop=0),K(l)}),e&&e.addEventListener("click",()=>{$="custom",w=Math.max(.4,w-.2),u(`🔍 Thu nhỏ: ${Math.round(w*100)}%`);const i=document.getElementById("reader-viewport");i&&i.scrollTop<60&&(i.scrollTop=0),K(l)}),n&&n.addEventListener("click",()=>{$=$==="fitWidth"?"fitPage":"fitWidth",u($==="fitWidth"?"📐 Đã chỉnh: Vừa chiều rộng":"📄 Đã chỉnh: Vừa trang");const i=document.getElementById("reader-viewport");i&&(i.scrollTop=0),K(l)});const a=document.getElementById("reader-theme-toggle");a&&a.addEventListener("click",_e);const s=document.getElementById("reader-btn-back");s&&s.addEventListener("click",be);const o=document.getElementById("reader-viewport");if(o){let i=0,d=0;o.addEventListener("touchstart",p=>{p.touches&&p.touches.length===1&&(i=p.touches[0].clientX,d=p.touches[0].clientY)},{passive:!0}),o.addEventListener("touchend",p=>{if(p.changedTouches&&p.changedTouches.length===1){const te=p.changedTouches[0].clientX-i,we=p.changedTouches[0].clientY-d;Math.abs(te)>45&&Math.abs(te)>Math.abs(we)*1.3&&(te<0?Z():J())}},{passive:!0})}let c=null;window.addEventListener("resize",()=>{clearTimeout(c),c=setTimeout(()=>{h&&h.style.display==="flex"&&v&&K(l)},250)});const g=document.getElementById("reader-toggle-comments");g&&g.addEventListener("click",Ue);const k=document.getElementById("drawer-close-comments");k&&k.addEventListener("click",()=>P(b));const m=document.getElementById("reader-toggle-notes");m&&m.addEventListener("click",qe);const f=document.getElementById("drawer-close-notes");f&&f.addEventListener("click",()=>P(I)),document.querySelectorAll(".drawer-filter-tab").forEach(i=>{i.addEventListener("click",()=>{document.querySelectorAll(".drawer-filter-tab").forEach(d=>d.classList.remove("active")),i.classList.add("active"),q=i.getAttribute("data-mode")||"page",ee()})}),document.querySelectorAll(".color-dot").forEach(i=>{i.addEventListener("click",()=>{document.querySelectorAll(".color-dot").forEach(d=>d.classList.remove("active")),i.classList.add("active"),Ee=i.getAttribute("data-color")||"#fef08a"})}),fe&&fe.addEventListener("click",Fe),ve&&ve.addEventListener("click",Oe),window.addEventListener("keydown",i=>{!h||h.style.display!=="flex"||["INPUT","TEXTAREA"].includes(document.activeElement.tagName)||(i.key==="ArrowRight"||i.key==="PageDown"||i.key===" "?(i.preventDefault(),Z()):i.key==="ArrowLeft"||i.key==="PageUp"?(i.preventDefault(),J()):i.key==="Escape"&&be())});const F=document.getElementById("reader-viewport");F&&(F.addEventListener("touchstart",i=>{i.touches.length===1&&(Se=i.touches[0].clientX,$e=i.touches[0].clientY)},{passive:!0}),F.addEventListener("touchend",i=>{if(i.changedTouches.length===1){const d=i.changedTouches[0].clientX-Se,p=i.changedTouches[0].clientY-$e;Math.abs(d)>60&&Math.abs(d)>Math.abs(p)*1.5&&(d<0?Z():J())}},{passive:!0}))}function Ne(){h&&h.addEventListener("contextmenu",t=>(t.preventDefault(),u("🔒 Tài liệu được bảo vệ bản quyền - Chỉ hỗ trợ đọc trực tuyến trên Tiếng Trung HongTai",!0),!1)),window.addEventListener("keydown",t=>{if(h&&h.style.display==="flex"&&(t.ctrlKey||t.metaKey)&&["s","p","u"].includes(t.key.toLowerCase()))return t.preventDefault(),u("🔒 Tính năng in và lưu tệp bị vô hiệu hóa để bảo vệ bản quyền tác giả.",!0),!1}),y&&y.addEventListener("dragstart",t=>t.preventDefault())}async function Me(){try{const e=await(await fetch(`${B}/api/books`,{headers:j()})).json();e.success&&Array.isArray(e.books)&&(M=e.books,Ge(),Y(),Ce())}catch(t){console.error("Failed to load books catalog:",t),V&&(V.innerHTML=`
          <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #ef4444;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; margin-bottom: 12px;"></i>
            <p style="font-weight: 700;">Không thể tải kho sách. Vui lòng kiểm tra kết nối máy chủ.</p>
          </div>
        `)}}window.switchDocsView=function(t){(!L||!G)&&(L=document.getElementById("documents-bookshelf-view"),G=document.getElementById("documents-catalog-view"),z=document.getElementById("btn-view-bookshelf"),D=document.getElementById("btn-view-catalog")),t==="bookshelf"?(L&&(L.style.display="block"),G&&(G.style.display="none"),z&&z.classList.add("active"),D&&D.classList.remove("active")):(L&&(L.style.display="none"),G&&(G.style.display="block"),z&&z.classList.remove("active"),D&&D.classList.add("active"))};function Ce(){const t=L||document.getElementById("documents-bookshelf-view");if(!t)return;function e(a){if(!a)return null;const s=M.find(g=>g.id===a),o=ke(a),c=s&&s.userProgress||o;return c&&c.lastPage>1?c:null}const n=[{id:"shelf-hsk2",accentColor:"#0284c7",mascotImg:"/assets/logo.png",title:"Giáo Trình Chuẩn HSK 2.0",subtitle:"Bộ giáo trình chuẩn Beijing Language & Culture University (HSK 1 - HSK 6, gồm đủ quyển Thượng & Hạ)",books:[{level:1,title:"Giáo Trình Chuẩn HSK 1",volTag:"Tập 1",coverUrl:"/covers/hsk2/hsk1.jpg",matchFile:"HSK 1 chuẩn.pdf",desc:"Giáo trình chuẩn HSK 1 bao gồm 15 bài học nhập môn kèm file dịch tiếng Việt chuẩn của TS. Nguyễn Thị Minh Hồng."},{level:2,title:"Giáo Trình Chuẩn HSK 2",volTag:"Tập 2",coverUrl:"/covers/hsk2/hsk2.jpg",matchFile:"HSK 2 chuẩn.pdf",desc:"Giáo trình chuẩn HSK 2 bao gồm 15 bài học sơ cấp nâng cao mở rộng vốn câu giao tiếp thực tế."},{level:3,title:"Giáo Trình Chuẩn HSK 3",volTag:"Tập 3",coverUrl:"/covers/hsk2/hsk3.jpg",matchFile:"HSK 3 chuẩn.pdf",desc:"Giáo trình chuẩn HSK 3 bao gồm 20 bài học củng cố ngữ pháp trung cấp và diễn đạt mở rộng."},{level:4,title:"Giáo Trình Chuẩn HSK 4 (Quyển Thượng)",volTag:"Thượng (上)",coverUrl:"/covers/hsk2/hsk4.jpg",matchFile:"HSK 4 chuẩn上.pdf",desc:"Giáo trình chuẩn HSK 4 Quyển Thượng (上) gồm 10 bài học trung cấp đầu tiên kèm ngữ pháp và bài tập chi tiết."},{level:4,title:"Giáo Trình Chuẩn HSK 4 (Quyển Hạ)",volTag:"Hạ (下)",coverUrl:"/covers/hsk2/hsk4.jpg",matchFile:"HSK 4 chuẩn下.pdf",desc:"Giáo trình chuẩn HSK 4 Quyển Hạ (下) gồm 10 bài học tiếp theo (bài 11 - 20) giúp hoàn thiện toàn bộ chuẩn HSK cấp 4."},{level:5,title:"Giáo Trình Chuẩn HSK 5 (Quyển Thượng)",volTag:"Thượng (上)",coverUrl:"/covers/hsk2/hsk5.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 5 Quyển Thượng (上) chuyên sâu đọc hiểu văn bản nâng cao và từ vựng học thuật (Đang cập nhật số hóa)."},{level:5,title:"Giáo Trình Chuẩn HSK 5 (Quyển Hạ)",volTag:"Hạ (下)",coverUrl:"/covers/hsk2/hsk5.jpg",matchFile:"HSK 5 chuẩn下.pdf",desc:"Giáo trình chuẩn HSK 5 Quyển Hạ (下) bản số hóa sắc nét, rèn luyện đọc hiểu văn bản nâng cao và viết luận."},{level:6,title:"Giáo Trình Chuẩn HSK 6 (Quyển Thượng)",volTag:"Thượng (上)",coverUrl:"/covers/hsk2/hsk6.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 6 Quyển Thượng (上) cao cấp dành cho người học thành thạo ngôn ngữ (Đang cập nhật số hóa)."},{level:6,title:"Giáo Trình Chuẩn HSK 6 (Quyển Hạ)",volTag:"Hạ (下)",coverUrl:"/covers/hsk2/hsk6.jpg",bookId:null,desc:"Giáo trình chuẩn HSK 6 Quyển Hạ (下) hoàn thiện năng lực ngôn ngữ cao cấp nhất trong hệ thống HSK (Đang cập nhật số hóa)."}]},{id:"shelf-hsk3",accentColor:"#10b981",mascotImg:"/assets/logo.png",title:"Giáo Trình HSK 3.0 Mới",subtitle:"Bộ giáo trình tiêu chuẩn quốc tế mới nhất (Cấp 1 - Cấp 6, gồm quyển Thượng & Hạ)",books:[{level:1,title:"新 HSK 教程 1 (HSK 3.0)",volTag:"Cấp 1",coverUrl:"/covers/hsk3/hsk1.jpg",matchFile:"新HSK教程1.pdf",desc:"Giáo trình HSK cấp độ 1 tiêu chuẩn 3.0 mới nhất do NXB Đại học Ngôn ngữ Bắc Kinh xuất bản."},{level:2,title:"新 HSK 教程 2 (HSK 3.0)",volTag:"Cấp 2",coverUrl:"/covers/hsk3/hsk2.jpg",matchFile:"新HSK2 教材.pdf",desc:"Toàn bộ giáo trình HSK 2 mới chuẩn quốc tế 3.0 với đầy đủ bài khóa và hội thoại."},{level:3,title:"新 HSK 教程 3 (HSK 3.0)",volTag:"Cấp 3",coverUrl:"/covers/hsk3/hsk3.jpg",matchFile:"新HSK3教程.pdf",desc:"Giáo trình HSK 3 mới chuẩn 3.0 củng cố hệ thống ngữ pháp và 1000 từ vựng cốt lõi."},{level:4,title:"新 HSK 教程 4 (Quyển Thượng - HSK 3.0)",volTag:"Thượng (上)",coverUrl:"/covers/hsk3/hsk4.jpg",matchFile:"新HSK教程4上.pdf",desc:"Giáo trình HSK 4 mới Tập Thượng (上) chuẩn v3.0 kèm 10 bài học trung cấp cơ bản."},{level:4,title:"新 HSK 教程 4 (Quyển Hạ - HSK 3.0)",volTag:"Hạ (下)",coverUrl:"/covers/hsk3/hsk4.jpg",bookId:null,desc:"Giáo trình HSK 4 mới Tập Hạ (下) chuẩn v3.0 (Đang cập nhật số hóa)."},{level:5,title:"新 HSK 教程 5 (Quyển Thượng - HSK 3.0)",volTag:"Thượng (上)",coverUrl:"/covers/hsk3/hsk4.jpg",bookId:null,desc:"Giáo trình HSK 5 mới Tập Thượng (上) chuẩn v3.0 (Đang cập nhật số hóa)."},{level:5,title:"新 HSK 教程 5 (Quyển Hạ - HSK 3.0)",volTag:"Hạ (下)",coverUrl:"/covers/hsk3/hsk4.jpg",bookId:null,desc:"Giáo trình HSK 5 mới Tập Hạ (下) chuẩn v3.0 (Đang cập nhật số hóa)."},{level:6,title:"新 HSK 教程 6 (Quyển Thượng - HSK 3.0)",volTag:"Thượng (上)",coverUrl:"/covers/hsk3/hsk4.jpg",bookId:null,desc:"Giáo trình HSK 6 mới Tập Thượng (上) chuẩn v3.0 (Đang cập nhật số hóa)."},{level:6,title:"新 HSK 教程 6 (Quyển Hạ - HSK 3.0)",volTag:"Hạ (下)",coverUrl:"/covers/hsk3/hsk4.jpg",bookId:null,desc:"Giáo trình HSK 6 mới Tập Hạ (下) chuẩn v3.0 (Đang cập nhật số hóa)."}]},{id:"shelf-hanngu",accentColor:"#f59e0b",mascotImg:"/assets/logo.png",title:"Giáo Trình Hán Ngữ 6 Cuốn",subtitle:"Bản dịch song ngữ Trung - Việt chuẩn Đại học (Tập 1 - 6, đầy đủ 6 cuốn)",books:[{volNum:1,title:"Giáo Trình Hán Ngữ 1",subtitle:"Bản dịch song ngữ",matchFile:"hán ngữ 1 (Trung-Việt).pdf",pastelBg:"linear-gradient(145deg, #fef3c7 0%, #fed7aa 100%)",pastelAccent:"#c2410c",hanzi:"汉语",tag:"Quyển 1 Thượng",desc:"Giáo trình Hán ngữ cơ sở quyển 1 chuẩn quốc tế, rèn luyện phát âm Pinyin, nét bút và giao tiếp nhập môn."},{volNum:2,title:"Giáo Trình Hán Ngữ 2",subtitle:"Bản dịch song ngữ",matchFile:"Bản sao của Giáo trình hán ngữ 2 (Trung-Việt).pdf",pastelBg:"linear-gradient(145deg, #dcfce7 0%, #bbf7d0 100%)",pastelAccent:"#15803d",hanzi:"汉语",tag:"Quyển 1 Hạ",desc:"Giáo trình Hán ngữ bộ 6 tập quyển 2, bản dịch chú giải tiếng Việt chuẩn xác cho học viên mới bắt đầu."},{volNum:3,title:"Giáo Trình Hán Ngữ 3",subtitle:"Bản dịch song ngữ",matchFile:"Bản sao của Giáo trình hán ngữ 3 (Trung-Việt).pdf",pastelBg:"linear-gradient(145deg, #fee2e2 0%, #fecaca 100%)",pastelAccent:"#b91c1c",hanzi:"汉语",tag:"Quyển 2 Thượng",desc:"Giáo trình Hán ngữ quyển 3 (Tập 2 Thượng), bước ngoặt củng cố ngữ pháp trung cấp và diễn đạt mở rộng."},{volNum:4,title:"Giáo Trình Hán Ngữ 4",subtitle:"Bản dịch song ngữ",matchFile:"Bản sao của Giáo trình hán ngữ 4 (Trung-Việt).pdf",pastelBg:"linear-gradient(145deg, #e0f2fe 0%, #bae6fd 100%)",pastelAccent:"#0369a1",hanzi:"汉语",tag:"Quyển 2 Hạ",desc:"Giáo trình Hán ngữ quyển 4 (Tập 2 Hạ), nâng cao vốn từ vựng chuyên đề, câu phức và đối thoại chuyên sâu."},{volNum:5,title:"Giáo Trình Hán Ngữ 5",subtitle:"Bản dịch song ngữ",matchFile:"Bản sao của Giáo trình hán ngữ 5 (Trung-Việt).pdf",pastelBg:"linear-gradient(145deg, #f3e8ff 0%, #e9d5ff 100%)",pastelAccent:"#7e22ce",hanzi:"汉语",tag:"Quyển 3 Thượng",desc:"Giáo trình Hán ngữ quyển 5 (Tập 3 Thượng) nâng cao khả năng phân tích ngữ văn, tác phẩm văn chương và bình luận xã hội."},{volNum:6,title:"Giáo Trình Hán Ngữ 6",subtitle:"Bản dịch song ngữ",matchFile:"Bản sao của Giáo trình hán ngữ 6 (Trung-Việt).pdf",matchTitle:"Hán Ngữ 6",pastelBg:"linear-gradient(145deg, #ccfbf1 0%, #99f6e4 100%)",pastelAccent:"#0f766e",hanzi:"汉语",tag:"Quyển 3 Hạ",desc:"Giáo trình Hán ngữ quyển 6 (Tập 3 Hạ) hoàn thiện kỹ năng đọc hiểu và văn phong bản xứ cao cấp."}]}];t.innerHTML=n.map(a=>{const s=a.books.map(o=>{const c=M.find(N=>o.bookId&&N.id===o.bookId||o.matchFile&&N.name===o.matchFile||o.matchTitle&&N.titleVi&&N.titleVi.toLowerCase().includes(o.matchTitle.toLowerCase())),g=c?c.id:o.bookId,k=e(g),m=!!g;let f="";k?f=`<span class="comic-book-status-badge reading"><i class="fa-solid fa-bookmark"></i> P.${k.lastPage}</span>`:m?f='<span class="comic-book-status-badge available"><i class="fa-solid fa-book-open"></i> Đọc ngay</span>':f='<span class="comic-book-status-badge coming-soon"><i class="fa-solid fa-clock"></i> Sắp ra</span>';let F="";if(o.volTag){const N=o.volTag.includes("Hạ")||o.volTag.includes("下"),He=o.volTag.includes("Thượng")||o.volTag.includes("上");F=`<div class="comic-book-vol-ribbon ${N?"vol-ha":He?"vol-thuong":"vol-general"}">${r(o.volTag)}</div>`}let i="";if(o.coverUrl)i=`<img src="${o.coverUrl}" alt="${r(o.title)}" class="comic-book-cover-img" loading="lazy">`;else{const N=String(o.volNum||o.level||"").replace(/\D/g,"")||o.volNum||o.level||"",He=o.pastelBg||(o.color?`linear-gradient(145deg, ${o.color}22, ${o.color}44)`:"linear-gradient(145deg, #fef3c7, #fed7aa)"),Be=o.pastelAccent||o.color||"#0f172a",Xe=o.hanzi||"汉语";i=`
            <div class="styled-vol-card" style="background: ${He};">
              <div class="vol-sub">${r(o.tag||"Giáo Trình")}</div>
              <div class="vol-name">${r(o.title)}</div>
              <div class="vol-center-emblem">
                <div class="vol-emblem-badge">
                  <span class="vol-emblem-char" style="color: ${Be};">${Xe}</span>
                </div>
              </div>
              <div class="vol-footer">
                <div class="vol-foot-label">HongTai<br>Book</div>
                <div class="vol-number-badge" style="color: ${Be};">${N}</div>
              </div>
            </div>
          `}const d=r(o.title).replace(/'/g,"\\'"),p=o.coverUrl?r(o.coverUrl).replace(/'/g,"\\'"):"",te=r(o.desc||"").replace(/'/g,"\\'"),we=g?`'${g}'`:"null",We=o.level||o.volNum?`${o.level||o.volNum}`:"null";return`
          <div class="comic-book-card" onclick="window.openShelfBook(${we}, '${d}', '${p}', '${te}', ${We})" title="${d}">
            <div class="comic-book-spine-overlay"></div>
            <div class="comic-book-gloss-overlay"></div>
            ${f}
            ${i}
            ${F}
          </div>
        `}).join("");return`
        <section class="bookshelf-shelf" style="--shelf-accent: ${a.accentColor};">
          <div class="bookshelf-shelf-header">
            <div class="bookshelf-mascot-badge">
              <img src="${a.mascotImg}" alt="Mascot" class="bookshelf-mascot-img">
            </div>
            <div class="bookshelf-shelf-titles">
              <h2 class="bookshelf-shelf-title">${r(a.title)}</h2>
              <p class="bookshelf-shelf-subtitle">${r(a.subtitle)}</p>
            </div>
          </div>
          <div class="bookshelf-grid">
            ${s}
          </div>
        </section>
      `}).join("")}window.openShelfBook=function(t,e,n,a,s){if(t){window.openBookReader(t);return}const o=document.getElementById("pending-book-modal"),c=document.getElementById("pending-modal-cover"),g=document.getElementById("pending-modal-title"),k=document.getElementById("pending-modal-desc"),m=document.getElementById("pending-modal-actions");if(o&&g&&k){c&&(c.src=n||"/assets/logo.png",c.alt=e),g.textContent=e,k.textContent=a||"Bản số hóa chất lượng cao đang được cập nhật để mang lại trải nghiệm đọc tốt nhất cho bạn.";let f=`
        <button onclick="window.closePendingBookModal()" class="topbar-comic-menu-btn" style="width: auto; padding: 8px 18px; font-size: 0.9rem; font-weight: 800;">
          Đóng
        </button>
      `;s&&(f+=`
          <a href="/detail-list.html?level=${s}" class="topbar-comic-login-btn">
            <i class="fa-solid fa-graduation-cap"></i>
            <span>Học Từ Vựng Cấp ${s}</span>
          </a>
        `),m&&(m.innerHTML=f),o.style.display="flex"}},window.closePendingBookModal=function(t){if(t&&t.target!==t.currentTarget)return;const e=document.getElementById("pending-book-modal");e&&(e.style.display="none")},window.showMascotTipModal=function(){const t=document.getElementById("pending-book-modal"),e=document.getElementById("pending-modal-cover"),n=document.getElementById("pending-modal-title"),a=document.getElementById("pending-modal-desc"),s=document.getElementById("pending-modal-actions");t&&n&&a&&(e&&(e.src="/assets/hongtai_dragon_mascot.png",e.alt="HongTai Dragon Mascot"),n.textContent="Mẹo Đọc Sách Thông Minh Cùng HongTai",a.innerHTML=`
        <div style="text-align: left; font-size: 0.88rem; line-height: 1.6; color: #334155; display: flex; flex-direction: column; gap: 8px;">
          <div><strong style="color: #0284c7;">📖 Đọc trực tuyến:</strong> Không cần tải PDF, đọc siêu tốc trên mọi thiết bị máy tính và điện thoại.</div>
          <div><strong style="color: #10b981;">🔖 Tự động lưu trang:</strong> Đóng sách hệ thống tự động ghi nhớ trang đang đọc cho lần sau.</div>
          <div><strong style="color: #f59e0b;">💬 Thảo luận trang:</strong> Nhấn nút "Bình luận" để hỏi đáp và thảo luận trực tiếp theo từng trang.</div>
          <div><strong style="color: #ec4899;">✍️ Ghi chú cá nhân:</strong> Viết note riêng tư kèm nhãn màu đánh dấu kiến thức quan trọng.</div>
        </div>
      `,s&&(s.innerHTML=`
          <button onclick="window.closePendingBookModal()" class="topbar-comic-login-btn" style="width: 100%; justify-content: center;">
            <i class="fa-solid fa-check"></i>
            <span>Đã hiểu, bắt đầu đọc sách ngay!</span>
          </button>
        `),t.style.display="flex")};function Ge(){const t={all:M.length};M.forEach(e=>{t[e.category]=(t[e.category]||0)+1}),ie.forEach(e=>{const n=e.getAttribute("data-category"),a=e.querySelector(".documents-filter-count");a&&(a.textContent=t[n]||0)})}function Y(){if(!V)return;let t=M.filter(e=>{const n=ge==="all"||e.category===ge,a=!E||e.titleVi&&e.titleVi.toLowerCase().includes(E)||e.titleOriginal&&e.titleOriginal.toLowerCase().includes(E)||e.category&&e.category.toLowerCase().includes(E)||e.description&&e.description.toLowerCase().includes(E);return n&&a});if(t.length===0){V.innerHTML=`
        <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; color: #94a3b8;">
          <i class="fa-solid fa-book-open" style="font-size: 3rem; color: #475569; margin-bottom: 16px;"></i>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: #cbd5e1; margin: 0 0 8px 0;">Không tìm thấy sách phù hợp</h3>
          <p style="margin: 0; font-size: 0.95rem;">Thử tìm với từ khóa khác hoặc chuyển sang danh mục Tất cả.</p>
        </div>
      `;return}V.innerHTML=t.map(e=>{const n=ke(e.id),a=e.userProgress||n,s=a&&a.lastPage>1;let o="tag-van-hoa";e.category.includes("HSK")?o="tag-hsk":e.category.includes("Hán Ngữ")?o="tag-han-ngu":e.category.includes("Biên Phiên Dịch")?o="tag-bien-dich":e.category.includes("Giáo Viên")?o="tag-giao-vien":e.category.includes("Văn Học")||e.category.includes("Truyện")?o="tag-van-hoc":e.category.includes("Ngữ Pháp")&&(o="tag-ngu-phap");const c=e.coverUrl||`/covers/thumbnails/${e.id}.jpg`;return`
        <div class="book-card" id="card-${e.id}">
          <div class="book-card-spine"></div>
          
          <div class="book-card-main-content">
            <div class="book-card-cover-wrapper" onclick="window.openBookReader('${e.id}')" title="Nhấn để đọc: ${r(e.titleVi)}">
              <img src="${c}" alt="${r(e.titleVi)}" class="book-card-cover-thumb" loading="lazy" onerror="this.style.display='none'">
              <div class="book-card-cover-spine-edge"></div>
              <div class="book-card-cover-shine"></div>
              <div class="book-card-hover-overlay">
                <i class="fa-solid fa-book-open-reader"></i>
                <span>Đọc ngay</span>
              </div>
            </div>

            <div class="book-card-info-col">
              <div class="book-card-header">
                <span class="book-category-tag ${o}">${r(e.category)}</span>
                <span class="book-size-chip"><i class="fa-regular fa-file-pdf"></i> ${e.sizeMB} MB</span>
              </div>

              <div class="book-card-body">
                <h3 class="book-title-vi" onclick="window.openBookReader('${e.id}')" title="${r(e.titleVi)}">${r(e.titleVi)}</h3>
                <p class="book-title-original" title="${r(e.titleOriginal)}">${r(e.titleOriginal)}</p>
                <p class="book-desc">${r(e.description)}</p>
              </div>
            </div>
          </div>

          ${s?`
            <div class="book-card-progress">
              <div class="book-progress-text">
                <span><i class="fa-solid fa-bookmark" style="color: #38bdf8;"></i> Đang đọc: Trang ${a.lastPage}${a.totalPages?"/"+a.totalPages:""}</span>
                <span>${a.percentage||0}%</span>
              </div>
              <div class="book-progress-bar-bg">
                <div class="book-progress-bar-fill" style="width: ${a.percentage||0}%;"></div>
              </div>
            </div>
          `:""}

          <div class="book-card-actions">
            <button class="btn-read-book ${s?"has-progress":""}" onclick="window.openBookReader('${e.id}')">
              <i class="fa-solid ${s?"fa-book-open-reader":"fa-book-open"}"></i>
              <span>${s?`Tiếp tục đọc (Trang ${a.lastPage})`:"Đọc Sách Ngay"}</span>
            </button>
            <div class="book-interaction-badges">
              <span class="interaction-badge" title="Bình luận"><i class="fa-regular fa-comment"></i> ${e.totalComments||0}</span>
              ${e.totalUserNotes>0?`<span class="interaction-badge" title="Ghi chú cá nhân"><i class="fa-solid fa-pencil" style="color: #fbbf24;"></i> ${e.totalUserNotes}</span>`:""}
            </div>
          </div>
        </div>
      `}).join("")}window.openBookReader=async function(t){const e=M.find(o=>o.id===t);if(!e)return;T=e,h&&(h.style.display="flex",document.body.style.overflow="hidden",Ie(x));const n=document.getElementById("reader-viewport");n&&(n.scrollTop=0,n.scrollLeft=0),window.innerWidth<=768&&($="fitWidth"),me&&(me.textContent=e.titleVi),pe&&(pe.innerHTML=`<span>${e.category}</span> • <span>${e.titleOriginal}</span>`),U(!0,"Đang mở sách và tải trang đầu...");const a=ke(t),s=e.userProgress&&e.userProgress.lastPage||a&&a.lastPage||1;l=s,De(t),Qe(t);try{const o=`${B}/api/books/${t}/stream`;v=await window.pdfjsLib.getDocument({url:o,withCredentials:!0,cMapUrl:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",cMapPacked:!0}).promise,S=v.numPages,ue&&(ue.textContent=`/ ${S}`),H&&(H.max=S,H.value=l),U(!1),ye(l),s>1&&u(`Đã khôi phục trang bạn đang đọc dở: Trang ${s}`)}catch(o){console.error("Error loading PDF:",o),U(!1),u("Không thể mở tệp sách. Vui lòng thử lại sau.",!0),be()}};async function ye(t){if(v){ne=!0,U(!0,`Đang nạp trang ${t}...`);try{const e=await v.getPage(t),n=document.getElementById("reader-viewport"),a=e.getViewport({scale:1}),s=window.innerWidth<=768;if($==="fitWidth"&&n){const m=n.clientWidth-(s?12:48);w=Math.max(.35,Math.min(2.8,m/a.width))}else if($==="fitPage"&&n){const m=n.clientHeight-(s?24:60);w=Math.max(.35,Math.min(2.5,m/a.height))}const o=window.devicePixelRatio||1,c=e.getViewport({scale:w*o});y.height=c.height,y.width=c.width,y.style.width=`${c.width/o}px`,y.style.height=`${c.height/o}px`;const g=y.parentElement;if(g&&n){const m=c.height/o,f=n.clientHeight-(s?24:48);m>f?(g.style.marginTop="0px",g.style.marginBottom=s?"24px":"40px"):(g.style.marginTop="auto",g.style.marginBottom="auto")}const k={canvasContext:xe,viewport:c};await e.render(k).promise,ne=!1,U(!1),oe!==null&&(ye(oe),oe=null),n&&l!==t&&(n.scrollTop=0,n.scrollLeft=0),l=t,H&&(H.value=t),je(),Ve(t,S),b&&b.classList.contains("open")&&q==="page"&&ee()}catch(e){console.error("Error rendering page:",e),ne=!1,U(!1)}}}function K(t){ne?oe=t:ye(t)}function J(){l<=1||K(l-1)}function Z(){!v||l>=S||K(l+1)}function je(){const t=l<=1,e=!v||l>=S;_&&(_.disabled=t),R&&(R.disabled=e),W&&(W.disabled=t),X&&(X.disabled=e)}function U(t,e="Đang tải..."){if(!ae)return;ae.style.display=t?"flex":"none";const n=ae.querySelector(".reader-loading-text");n&&(n.textContent=e)}function be(){h&&(h.style.display="none",document.body.style.overflow=""),P(b),P(I),v&&(v.destroy(),v=null),Y()}function Ve(t,e){he&&clearTimeout(he),he=setTimeout(()=>{Ae(t,e)},1e3)}async function Ae(t,e){if(!T)return;const n=T.id,a={bookId:n,lastPage:t,totalPages:e,percentage:e?Math.min(100,Math.round(t/e*100)):0,updatedAt:Date.now()};ze(n,a);try{await fetch(`${B}/api/books/${n}/progress`,{method:"POST",headers:{"Content-Type":"application/json",...j()},body:JSON.stringify({page:t,totalPages:e})})}catch(s){console.warn("Could not sync reading progress to server:",s)}}function ke(t){try{const e=localStorage.getItem(`hongtai_book_progress_${t}`);return e?JSON.parse(e):null}catch{return null}}function ze(t,e){try{localStorage.setItem(`hongtai_book_progress_${t}`,JSON.stringify(e))}catch{}}async function De(t){try{const n=await(await fetch(`${B}/api/books/${t}/comments`,{headers:j()})).json();n.success&&Array.isArray(n.comments)&&(Q=n.comments,Le(),ee())}catch(e){console.error("Failed to fetch comments:",e)}}function Le(){const t=document.getElementById("reader-comments-count-badge");t&&(t.textContent=Q.length,t.style.display=Q.length>0?"inline-block":"none")}function Ue(){if(!b)return;P(I),b.classList.contains("open")?P(b):(b.classList.add("open"),ee())}function ee(){if(!se)return;let t=Q;q==="page"&&(t=t.filter(n=>Number(n.page)===Number(l)));const e=document.getElementById("comments-current-page-label");if(e&&(e.textContent=q==="page"?`Trang ${l}`:"Tất cả các trang"),t.length===0){se.innerHTML=`
        <div style="text-align: center; padding: 40px 10px; color: #94a3b8;">
          <i class="fa-regular fa-comment-dots" style="font-size: 2.2rem; color: #475569; margin-bottom: 12px;"></i>
          <p style="font-size: 0.9rem; margin: 0;">Chưa có bình luận nào cho ${q==="page"?`trang ${l}`:"sách này"}.</p>
          <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0 0;">Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ ý kiến!</p>
        </div>
      `;return}se.innerHTML=t.map(n=>{const a=(n.authorName||"H").charAt(0).toUpperCase(),s=Re(n.createdAt);return`
        <div class="comment-card" id="comment-${n.id}">
          <div class="comment-card-header">
            <div class="comment-user-info">
              ${n.authorPicture?`<img src="${n.authorPicture}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;">`:`<div class="comment-avatar">${a}</div>`}
              <span class="comment-author-name">${r(n.authorName)}</span>
            </div>
            <span class="comment-page-badge" onclick="window.jumpToPage(${n.page})" style="cursor: pointer;" title="Nhảy tới trang ${n.page}">Trang ${n.page}</span>
          </div>
          <div class="comment-content">${r(n.content)}</div>
          <div class="comment-time">${s}</div>
        </div>
      `}).join("")}async function Fe(){if(!ce||!T)return;const t=ce.value.trim();if(!t){u("Vui lòng nhập nội dung bình luận.",!0);return}try{const n=await(await fetch(`${B}/api/books/${T.id}/comments`,{method:"POST",headers:{"Content-Type":"application/json",...j()},body:JSON.stringify({page:l,content:t})})).json();n.success&&n.comment?(Q.unshift(n.comment),ce.value="",Le(),ee(),u("Đã gửi bình luận thành công!")):u(n.error||"Lỗi gửi bình luận",!0)}catch(e){console.error("Error posting comment:",e),u("Không thể gửi bình luận.",!0)}}async function Qe(t){try{const n=await(await fetch(`${B}/api/books/${t}/notes`,{headers:j()})).json();n.success&&Array.isArray(n.notes)&&(C=n.notes,Te(),de())}catch(e){console.error("Failed to fetch notes:",e)}}function Te(){const t=document.getElementById("reader-notes-count-badge");t&&(t.textContent=C.length,t.style.display=C.length>0?"inline-block":"none")}function qe(){if(!I)return;P(b),I.classList.contains("open")?P(I):(I.classList.add("open"),de())}function de(){if(le){if(C.length===0){le.innerHTML=`
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
          <div class="note-text">${r(t.content)}</div>
        </div>
      `).join("")}}async function Oe(){if(!re||!T)return;const t=re.value.trim();if(!t){u("Vui lòng nhập nội dung ghi chú.",!0);return}try{const n=await(await fetch(`${B}/api/books/${T.id}/notes`,{method:"POST",headers:{"Content-Type":"application/json",...j()},body:JSON.stringify({page:l,content:t,color:Ee})})).json();n.success&&n.note&&(C.unshift(n.note),re.value="",Te(),de(),u(`Đã lưu ghi chú cho Trang ${l}!`))}catch(e){console.error("Error saving note:",e),u("Không thể lưu ghi chú.",!0)}}window.deleteNote=async function(t){if(confirm("Bạn có chắc chắn muốn xóa ghi chú này?")&&T)try{(await(await fetch(`${B}/api/books/${T.id}/notes/${t}`,{method:"DELETE",headers:j()})).json()).success&&(C=C.filter(a=>a.id!==t),Te(),de(),u("Đã xóa ghi chú."))}catch(e){console.error("Error deleting note:",e),u("Lỗi xóa ghi chú.",!0)}},window.jumpToPage=function(t){!v||t<1||t>S||K(t)};function P(t){t&&t.classList.remove("open")}function _e(){h&&(x==="dark"?x="sepia":x==="sepia"?x="light":x="dark",localStorage.setItem("hongtai_reader_theme",x),Ie(x))}function Ie(t){if(!h)return;h.classList.remove("theme-dark","theme-sepia","theme-light"),h.classList.add(`theme-${t}`);const e=document.querySelector("#reader-theme-toggle i");e&&(t==="dark"?e.className="fa-solid fa-moon":t==="sepia"?e.className="fa-solid fa-sun":e.className="fa-regular fa-sun")}function j(){const t={};try{const n=JSON.parse(localStorage.getItem("user")||sessionStorage.getItem("user")||"{}");n&&n.token&&(t.Authorization=`Bearer ${n.token}`)}catch{}let e=localStorage.getItem("hongtai_guest_device_id");return e||(e="dev_"+Math.random().toString(36).substring(2,10),localStorage.setItem("hongtai_guest_device_id",e)),t["x-guest-id"]=e,t}function u(t,e=!1){if(typeof window.showToast=="function"){window.showToast(t,e);return}const n=document.createElement("div");n.style.cssText=`
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
    `,n.textContent=t,document.body.appendChild(n),setTimeout(()=>{n.style.opacity="0",setTimeout(()=>n.remove(),300)},2800)}function r(t){return t?String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function Re(t){if(!t)return"";const e=Math.floor((Date.now()-new Date(t).getTime())/1e3);return e<60?"Vừa xong":e<3600?`${Math.floor(e/60)} phút trước`:e<86400?`${Math.floor(e/3600)} giờ trước`:e<2592e3?`${Math.floor(e/86400)} ngày trước`:new Date(t).toLocaleDateString("vi-VN")}})();
