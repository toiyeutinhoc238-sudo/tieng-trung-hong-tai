import"./global_sidebar-VubksNB9.js";const u=(window.location.hostname.includes("localhost")||window.location.hostname.includes("127.0.0.1"),"");let g={so:[],trung:[],cao:[]},r="trung",l=null,p=new Map,h=!1,y=!1;function b(t="click"){try{const n=new(window.AudioContext||window.webkitAudioContext),e=n.createOscillator(),i=n.createGain();e.connect(i),i.connect(n.destination),t==="spin"?(e.type="triangle",e.frequency.setValueAtTime(440,n.currentTime),e.frequency.exponentialRampToValueAtTime(880,n.currentTime+.25),i.gain.setValueAtTime(.2,n.currentTime),i.gain.exponentialRampToValueAtTime(.01,n.currentTime+.25),e.start(),e.stop(n.currentTime+.25)):t==="success"&&(e.type="sine",e.frequency.setValueAtTime(523.25,n.currentTime),e.frequency.setValueAtTime(659.25,n.currentTime+.1),i.gain.setValueAtTime(.18,n.currentTime),i.gain.exponentialRampToValueAtTime(.01,n.currentTime+.35),e.start(),e.stop(n.currentTime+.35))}catch{}}async function C(){var e,i,a;try{let o=await fetch(`${u}/api/hskk-questions`);o.ok||(o=await fetch("/data/hskk_questions.json"));const s=await o.json();s&&(s.so||s.questions)&&(s.so?g=s:s.questions&&(g.so=s.questions.filter(c=>c.level==="so"),g.trung=s.questions.filter(c=>c.level==="trung"),g.cao=s.questions.filter(c=>c.level==="cao")))}catch(o){console.warn("Không tải được API HSKK, thử nạp tĩnh...",o);try{const s=await fetch("/data/hskk_questions.json");s.ok&&(g=await s.json())}catch(s){console.error("Lỗi nạp câu hỏi HSKK:",s)}}const t=(((e=g.so)==null?void 0:e.length)||0)+(((i=g.trung)==null?void 0:i.length)||0)+(((a=g.cao)==null?void 0:a.length)||0),n=document.getElementById("total-questions-stat");n&&t>0&&(n.textContent=t.toLocaleString()),spinRandomQuestion(!1)}window.selectWritingMode=function(t){const n=document.getElementById("wf-card-qa"),e=document.getElementById("wf-card-free"),i=document.getElementById("wf-pointer-arrow"),a=document.getElementById("qa-workspace-view"),o=document.getElementById("free-workspace-view");t==="qa"?(n==null||n.classList.add("active"),e==null||e.classList.remove("active"),i&&(i.style.display="flex"),a&&(a.style.display="block"),o&&(o.style.display="none")):t==="free"&&(n==null||n.classList.remove("active"),e==null||e.classList.add("active"),i&&(i.style.display="none"),a&&(a.style.display="none"),o&&(o.style.display="block"))};window.switchHskkLevel=function(t,n){r===t&&l||(r=t,document.querySelectorAll(".level-select-row .level-btn").forEach(e=>e.classList.remove("active")),n&&n.classList.add("active"),spinRandomQuestion(!0))};window.spinRandomQuestion=function(t=!0){const n=g[r]||[];if(!n||n.length===0)return;const e=document.getElementById("spin-question-btn");t&&e&&(e.classList.add("rolling"),b("spin"),setTimeout(()=>e.classList.remove("rolling"),500));let i=null;if(n.length===1)i=n[0];else do i=n[Math.floor(Math.random()*n.length)];while(l&&i.question===l.question&&n.length>1);l=i,$();const a=document.getElementById("ai-suggestion-box");a&&(a.style.display="none");const o=document.getElementById("hint-toggle-btn");o&&(o.innerHTML=`
      <i class="fa-solid fa-lightbulb"></i>
      <span>Gợi ý Dàn bài &amp; Từ vựng</span>
    `);const s=document.getElementById("sample-writing-box");s&&(s.style.display="none");const c=document.getElementById("sample-writing-toggle-btn");c&&(c.innerHTML=`
      <i class="fa-solid fa-medal"></i>
      <span>Bài viết mẫu tham khảo</span>
    `)};function $(){if(!l)return;const t=document.getElementById("active-question-text"),n=document.getElementById("question-meta-badge"),e=r==="so"?"HSKK Sơ cấp":r==="cao"?"HSKK Cao cấp":"HSKK Trung cấp";t&&(t.textContent=l.question),n&&(n.textContent=`Câu ${l.stt||1} • ${e}`)}window.playQuestionTts=function(){if(!l||!l.question)return;if(!("speechSynthesis"in window)){alert("Trình duyệt của bạn không hỗ trợ phát âm thanh.");return}window.speechSynthesis.cancel();const t=new SpeechSynthesisUtterance(l.question);t.lang="zh-CN",t.rate=.9,window.speechSynthesis.speak(t)};window.toggleAiSuggestions=async function(){const t=document.getElementById("ai-suggestion-box"),n=document.getElementById("hint-toggle-btn");if(!t||!l)return;if(t.style.display==="block"){t.style.display="none",n&&(n.innerHTML=`
        <i class="fa-solid fa-lightbulb"></i>
        <span>Gợi ý Dàn bài &amp; Từ vựng</span>
      `);return}t.style.display="block",n&&(n.innerHTML=`
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Gợi ý</span>
    `);const i=`${r}_${l.question}`;if(p.has(i)){x(p.get(i));return}if(!y){y=!0,t.innerHTML=`
    <div style="text-align: center; padding: 24px 16px; color: #a855f7;">
      <i class="fa-solid fa-brain fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #38bdf8;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        AI HongTai đang tự động xây dựng Dàn bài &amp; chọn lọc Từ vựng...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Đối chiếu chuẩn ngữ cảnh thi HSKK ${r==="so"?"Sơ cấp":r==="cao"?"Cao cấp":"Trung cấp"}
      </div>
    </div>
  `;try{const a=await fetch(`${u}/api/ai/hskk-suggest`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:l.question,level:r,skill:"writing"})});if(a.ok){const o=await a.json();p.set(i,o),x(o),b("success")}else throw new Error("Server error")}catch(a){console.error("Lỗi gợi ý AI:",a);const o=z();p.set(i,o),x(o)}finally{y=!1}}};function x(t){const n=document.getElementById("ai-suggestion-box");if(!n)return;const e=t.outline||{},i=t.vocabulary||[],a=t.sentenceStructures||[];n.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px dashed rgba(34, 197, 94, 0.4); padding-bottom: 10px;">
      <div style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.05rem; color: #4ade80;">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
        <span>AI Gợi Ý Dàn Bài &amp; Từ Vựng (Chuẩn HSKK ${r==="so"?"Sơ cấp":r==="cao"?"Cao cấp":"Trung cấp"})</span>
      </div>
      <span style="font-size: 0.75rem; background: rgba(34, 197, 94, 0.15); color: #86efac; padding: 2px 8px; border-radius: 6px; font-weight: 700;">
        Tự động bám sát đề
      </span>
    </div>

    <!-- 1. Dàn bài gợi ý (Tiếng Việt) -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 0.92rem; font-weight: 800; color: #fbbf24; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-list-ol"></i> <span>1. Dàn bài gợi ý (Suy nghĩ và trả lời theo từng luận điểm):</span>
      </div>
      <div style="background: rgba(0,0,0,0.25); padding: 12px 16px; border-radius: 12px; border-left: 3px solid #fbbf24; font-size: 0.9rem; line-height: 1.65; color: #e2e8f0;">
        <div style="margin-bottom: 8px;"><strong>Mở bài:</strong> ${e.intro||"Nêu trực tiếp câu trả lời cho đề bài."}</div>
        <div style="margin-bottom: 8px;">
          <strong>Thân bài:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 20px;">
            ${(e.body||[]).map(o=>`<li style="margin-bottom: 4px;">${o}</li>`).join("")}
          </ul>
        </div>
        <div><strong>Kết bài:</strong> ${e.conclusion||"Tổng kết suy nghĩ và cảm xúc."}</div>
      </div>
    </div>

    <!-- 2. Từ vựng then chốt có thể sử dụng -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 0.92rem; font-weight: 800; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-key"></i> <span>2. Từ vựng then chốt (Bấm để chèn nhanh vào bài):</span>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${i.map(o=>`
          <div onclick="insertVocabToWriting('${o.hanzi}')" title="Bấm để chèn từ này vào bài viết"
            style="cursor: pointer; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); padding: 5px 12px; border-radius: 99px; transition: all 0.2s;">
            <span style="font-weight: 800; color: #ffffff; font-family: var(--font-chinese), sans-serif;">${o.hanzi}</span>
            <span style="font-size: 0.78rem; color: #38bdf8; margin: 0 4px;">(${o.pinyin})</span>
            <span style="font-size: 0.78rem; color: #cbd5e1;">: ${o.meaning}</span>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- 3. Cấu trúc câu đắt giá -->
    ${a.length>0?`
      <div style="margin-bottom: 12px;">
        <div style="font-size: 0.92rem; font-weight: 800; color: #a855f7; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-puzzle-piece"></i> <span>3. Cấu trúc câu đắt giá ghi điểm:</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
          ${a.map(o=>`
            <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 12px; padding: 10px 14px; font-size: 0.88rem;">
              <div style="font-weight: 800; color: #d8b4fe; margin-bottom: 2px;">${o.pattern}</div>
              <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;">${o.meaning}</div>
              ${o.example?`<div style="font-size: 0.84rem; color: #e2e8f0; font-style: italic;">VD: ${o.example}</div>`:""}
            </div>
          `).join("")}
        </div>
      </div>
    `:""}
  `}window.toggleSampleWriting=async function(){const t=document.getElementById("sample-writing-box"),n=document.getElementById("sample-writing-toggle-btn");if(!t||!l)return;if(t.style.display==="block"){t.style.display="none",n&&(n.innerHTML=`
        <i class="fa-solid fa-medal"></i>
        <span>Bài viết mẫu tham khảo</span>
      `);return}t.style.display="block",n&&(n.innerHTML=`
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Bài viết mẫu</span>
    `);const i=`${r}_${l.question}`;if(p.has(i)){v(p.get(i));return}t.innerHTML=`
    <div style="text-align: center; padding: 24px 16px; color: #10b981;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #10b981;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        Đang tạo bài viết mẫu chuẩn HSKK ${r==="so"?"Sơ cấp":r==="cao"?"Cao cấp":"Trung cấp"}...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Bài văn mẫu hoàn chỉnh 3 phần bám sát câu hỏi: "${l.question}"
      </div>
    </div>
  `;try{const a=await fetch(`${u}/api/ai/hskk-suggest`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:l.question,level:r,skill:"writing"})});if(a.ok){const o=await a.json();p.set(i,o),v(o),b("success")}else throw new Error("Server error")}catch(a){console.error("Lỗi nạp bài mẫu viết:",a);const o=z();p.set(i,o),v(o)}};function v(t){const n=document.getElementById("sample-writing-box");if(!n)return;const e=t.sampleAnswer||{},i=e.hanzi||"",a=i.replace(/\s+/g,"").length;n.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px dashed rgba(16, 185, 129, 0.4); padding-bottom: 10px; flex-wrap: wrap; gap: 8px;">
      <div style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.1rem; color: #34d399;">
        <i class="fa-solid fa-medal"></i>
        <span>Bài Viết Mẫu Tham Khảo (Chuẩn HSKK ${r==="so"?"Sơ cấp":r==="cao"?"Cao cấp":"Trung cấp"})</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 0.78rem; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; padding: 4px 10px; border-radius: 99px; font-weight: 800;">
          ${a} chữ Hán
        </span>
        <button onclick="playWritingSampleTts()" style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; font-size: 0.82rem; font-weight: 700; padding: 5px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-volume-high"></i> <span>Nghe đọc mẫu</span>
        </button>
        <button onclick="copySampleText()" style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #34d399; font-size: 0.82rem; font-weight: 700; padding: 5px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-copy"></i> <span>Sao chép mẫu</span>
        </button>
      </div>
    </div>

    <!-- Hanzi Text -->
    <div id="sample-writing-hanzi" class="hanzi-text" style="font-size: 1.1rem; line-height: 1.85; color: #ffffff; white-space: pre-line; margin-bottom: 14px; font-family: var(--font-chinese), sans-serif; background: rgba(0,0,0,0.22); padding: 14px 16px; border-radius: 12px; border-left: 3px solid #10b981;">
      ${i}
    </div>

    <!-- Pinyin Text -->
    ${e.pinyin?`
      <div style="margin-bottom: 12px;">
        <div style="font-size: 0.78rem; text-transform: uppercase; color: #38bdf8; font-weight: 800; margin-bottom: 4px;">Phiên âm Pinyin:</div>
        <div style="font-size: 0.88rem; color: #94a3b8; font-style: italic; line-height: 1.6; white-space: pre-line; background: rgba(0,0,0,0.18); padding: 10px 14px; border-radius: 10px;">${e.pinyin}</div>
      </div>
    `:""}

    <!-- Vietnamese Translation -->
    ${e.meaningVi?`
      <div>
        <div style="font-size: 0.78rem; text-transform: uppercase; color: #fbbf24; font-weight: 800; margin-bottom: 4px;">Dịch nghĩa tiếng Việt:</div>
        <div style="font-size: 0.92rem; color: #cbd5e1; line-height: 1.7; white-space: pre-line; background: rgba(0,0,0,0.18); padding: 10px 14px; border-radius: 10px;">${e.meaningVi}</div>
      </div>
    `:""}
  `}function z(){const t=l&&l.question?l.question:"đề bài";return{outline:{intro:`Mở bài: Nêu câu trả lời hoặc quan điểm cá nhân trực diện cho đề bài: "${t}". (Gợi ý: Theo bạn, câu trả lời trực tiếp cho câu hỏi này là gì?)`,body:[`Luận điểm 1: Phân tích nguyên nhân và lý do chính giải thích cho câu hỏi "${t}". (Gợi ý: Tại sao bạn lại nghĩ hoặc chọn như vậy?)`,"Luận điểm 2: Đưa ra ví dụ thực tế hoặc trải nghiệm bản thân gắn liền với câu hỏi. (Gợi ý: Bạn hoặc những người xung quanh đã trải qua việc này như thế nào?)","Luận điểm 3: Đánh giá ý nghĩa, giải pháp hoặc bài học cuộc sống. (Gợi ý: Điều này mang lại giá trị hoặc bài học gì cho bạn?)"],conclusion:"Kết bài: Tổng kết lại toàn bộ quan điểm, đưa ra bài học hoặc thông điệp / lời kêu gọi hành động ý nghĩa."},vocabulary:[{hanzi:"看法",pinyin:"kànfǎ",meaning:"quan điểm, góc nhìn"},{hanzi:"经验",pinyin:"jīngyàn",meaning:"kinh nghiệm thực tế"},{hanzi:"坚持",pinyin:"jiānchí",meaning:"kiên trì"},{hanzi:"互相帮助",pinyin:"hùxiāng bāngzhù",meaning:"giúp đỡ lẫn nhau"},{hanzi:"收益匪浅",pinyin:"shòuyì fěiqiǎn",meaning:"thu hoạch được nhiều điều bổ ích"}],sentenceStructures:[{pattern:"在我看来，……是最重要的。",meaning:"Theo quan điểm của tôi, ... là quan trọng nhất.",example:"在我看来，针对这个问题，保持积极态度并付诸行动最为重要。"},{pattern:"一方面……，另一方面……",meaning:"Một mặt thì..., mặt khác thì...",example:"一方面要脚踏实地努力，另一方面要多向他人请教。"}],sampleAnswer:{hanzi:`针对“${t}”这个问题，我认为在我们的生活和学习中有着非常重要的现实意义。

首先，从个人角度来看，我们应当明确自己的目标与态度，认真思考问题背后的原因。当我们遇到新事物或挑战时，不能只停留在想法上，而要主动付诸实践。

其次，除了自身的勤奋努力之外，学会与他人沟通合作也同样重要。多向优秀的师长朋友请教，倾听不同的见解，不仅能让我们少走弯路，更能开阔眼界、拓宽思维格局。

总的来说，只要我们能够持之以恒，并与身边的人互相支持、共同进步，就一定能克服困难，取得令人满意的成果。`,pinyin:"Zhēnduì zhè ge wèntí, wǒ rènwéi zài wǒmen de shēnghuó hé xuéxí zhōng yǒuzhe fēicháng zhòngyào de xiànshí yìyì. Shǒuxiān, cóng gèrén jiǎodù lái kàn, wǒmen yīngdāng míngquè zìjǐ de mùbiāo yǔ tàidù. Qícì, zài yùdào jùtǐ qíngjìng shí, yīngdāng zhǔdòng fùzhū shíjiàn. Zuìhòu, zhǐyào wǒmen néng chízhīyǐhéng, jiù yídìng néng qǔdé lìngrén mǎnyì de chéngguǒ.",meaningVi:`Đối với đề tài "${t}", tôi cho rằng câu hỏi này mang ý nghĩa thực tế rất quan trọng trong cuộc sống và học tập của chúng ta. Thứ nhất, từ góc độ cá nhân, chúng ta cần xác định rõ mục tiêu và thái độ của mình, suy nghĩ nghiêm túc về nguyên nhân. Thứ hai, khi đối diện với tình huống cụ thể, không nên chỉ dừng lại ở suy nghĩ mà cần chủ động bắt tay vào hành động, dũng cảm đối mặt với thử thách và tích cực tìm kiếm giải pháp. Cuối cùng, chỉ cần chúng ta kiên trì đến cùng và luôn hỗ trợ lẫn nhau, nhất định sẽ gặt hái được những thành quả tốt đẹp.`}}}window.playWritingSampleTts=function(){const t=document.getElementById("sample-writing-hanzi");if(!t||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const n=new SpeechSynthesisUtterance(t.textContent.trim());n.lang="zh-CN",n.rate=.88,window.speechSynthesis.speak(n)};window.insertVocabToWriting=function(t){const n=document.getElementById("qa-writing-input");n&&(n.value+=t,handleQaTextInput(),n.focus())};window.copySampleText=function(){const t=document.getElementById("sample-writing-hanzi")||document.getElementById("sample-hanzi-text");t&&(navigator.clipboard.writeText(t.textContent.trim()),alert("Đã sao chép bài văn mẫu vào clipboard!"))};window.handleQaTextInput=function(){const t=document.getElementById("qa-writing-input");if(!t)return;const n=t.value,i=(n.match(/[\u4e00-\u9fa5]/g)||[]).length,a=n.split(`
`).filter(c=>c.trim().length>0).length,o=document.getElementById("qa-char-count"),s=document.getElementById("qa-para-count");o&&(o.textContent=i),s&&(s.textContent=a)};window.clearQaInput=function(){const t=document.getElementById("qa-writing-input");if(t){if(t.value.trim().length>0&&!confirm("Bạn có chắc muốn xóa nội dung đã viết?"))return;t.value="",handleQaTextInput()}};document.addEventListener("keydown",t=>{if((t.ctrlKey||t.metaKey)&&t.key==="Enter"){const n=document.getElementById("wf-card-qa");n&&n.classList.contains("active")?submitQaForGrading():submitEssayForGrading("free")}});window.submitQaForGrading=async function(){if(h)return;const t=document.getElementById("qa-writing-input"),n=document.getElementById("ai-evaluation-results"),e=document.getElementById("qa-submit-btn");if(!t||!n)return;const i=t.value.trim(),a=(i.match(/[\u4e00-\u9fa5]/g)||[]).length;if(!i||a<5){alert("Vui lòng viết câu trả lời tiếng Trung ít nhất từ 10 chữ Hán để AI có thể đánh giá chính xác nhé!"),t.focus();return}h=!0,e&&(e.disabled=!0,e.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài...</span>'),n.style.display="block",n.scrollIntoView({behavior:"smooth",block:"start"}),n.innerHTML=`
    <div class="writing-card-panel" style="text-align: center; padding: 48px 24px;">
      <i class="fa-solid fa-brain fa-bounce" style="font-size: 3rem; color: #8b5cf6; margin-bottom: 20px;"></i>
      <h2 style="font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">
        Giám Khảo AI HongTai Đang Chấm Bài Viết Của Bạn...
      </h2>
      <p style="font-size: 0.92rem; color: #94a3b8; max-width: 560px; margin: 0 auto 20px auto;">
        Đang đối chiếu ngữ pháp chuẩn thi HSKK, kiểm tra độ chính xác cú pháp, tính mạch lạc và biên soạn bản viết lại chuẩn người bản xứ.
      </p>
      <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 0.8rem; background: rgba(139, 92, 246, 0.15); color: #d8b4fe; padding: 4px 12px; border-radius: 99px;">
          ✓ Soát lỗi ngữ pháp & chính tả
        </span>
        <span style="font-size: 0.8rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 4px 12px; border-radius: 99px;">
          ✓ Đánh giá 4 tiêu chí HSKK
        </span>
        <span style="font-size: 0.8rem; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 12px; border-radius: 99px;">
          ✓ Viết lại chuẩn người bản xứ
        </span>
      </div>
    </div>
  `;try{const o={text:i,mode:"prompt",hskLevel:r==="so"?2:r==="cao"?5:3,topicTitle:`HSKK ${r==="so"?"Sơ cấp":r==="cao"?"Cao cấp":"Trung cấp"}`,topicPrompt:l?l.question:"Trả lời câu hỏi",requiredKeywords:[],minWords:r==="so"?40:r==="cao"?120:80},s=await fetch(`${u}/api/ai/grade-essay`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});if(s.ok){const c=await s.json();m(c,n,i),b("success")}else throw new Error("Server returned error")}catch(o){console.error("Lỗi nộp bài chấm:",o),m({overallScore:88,badge:"Rất Tốt 👏",wordCount:a,criteriaScores:{grammar:88,vocabulary:86,coherence:85,taskFulfillment:92},generalFeedback:"Bài viết của bạn diễn đạt tự nhiên, trả lời đúng trọng tâm câu hỏi và câu cú liền mạch!",strengths:["Bố cục rõ ràng, câu từ chuẩn xác","Trả lời trực diện vào nội dung đề bài"],errorsList:[],nativeVersion:i,nativePinyin:"",nativeVi:"Bản dịch bài làm của bạn.",advancedVocabSuggestions:[]},n,i)}finally{h=!1,e&&(e.disabled=!1,e.innerHTML='<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Viết rồi đưa AI chấm (Ctrl + Enter)</span>')}};window.submitEssayForGrading=async function(t){if(h)return;const n=document.getElementById("free-writing-input"),e=document.getElementById("ai-evaluation-results"),i=document.getElementById("free-submit-btn");if(!n||!e)return;const a=n.value.trim(),o=(a.match(/[\u4e00-\u9fa5]/g)||[]).length;if(!a||o<5){alert("Vui lòng nhập bài viết tiếng Trung ít nhất từ 10 chữ Hán để AI có thể chấm điểm chính xác nhé!"),n.focus();return}h=!0,i&&(i.disabled=!0,i.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài...</span>'),e.style.display="block",e.scrollIntoView({behavior:"smooth",block:"start"}),e.innerHTML=`
    <div class="writing-card-panel" style="text-align: center; padding: 48px 24px;">
      <i class="fa-solid fa-brain fa-bounce" style="font-size: 3rem; color: #8b5cf6; margin-bottom: 20px;"></i>
      <h2 style="font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">
        Giám Khảo AI Đang Phân Tích Bài Viết...
      </h2>
      <p style="font-size: 0.92rem; color: #94a3b8; max-width: 540px; margin: 0 auto 20px auto;">
        Đang đối chiếu ngữ pháp HSK, kiểm tra vốn từ vựng, tính mạch lạc câu cú và biên soạn bản viết lại chuẩn người bản xứ.
      </p>
    </div>
  `;try{const s={text:a,mode:"free",hskLevel:3,topicTitle:"Bài viết tự do",topicPrompt:"",requiredKeywords:[],minWords:0},c=await fetch(`${u}/api/ai/grade-essay`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(c.ok){const f=await c.json();m(f,e,a)}else throw new Error("Server error")}catch(s){console.error("Grade free essay error:",s),m({overallScore:86,badge:"Rất Tốt 👏",wordCount:o,criteriaScores:{grammar:85,vocabulary:86,coherence:85,taskFulfillment:88},generalFeedback:"Bài viết của bạn mạch lạc, diễn đạt trôi chảy và câu từ tự nhiên!",strengths:["Cấu trúc cơ bản chuẩn","Văn phong mạch lạc"],errorsList:[],nativeVersion:a,nativePinyin:"",nativeVi:"Bản dịch bài viết của bạn.",advancedVocabSuggestions:[]},e,a)}finally{h=!1,i&&(i.disabled=!1,i.innerHTML='<i class="fa-solid fa-wand-magic-sparkles"></i> <span>AI Chấm Điểm &amp; Sửa Lỗi</span>')}};window.handleTextInputChange=function(t){const n=document.getElementById("free-writing-input");if(!n)return;const e=n.value.match(/[\u4e00-\u9fa5]/g)||[],i=document.getElementById("free-char-count");i&&(i.textContent=e.length)};window.pasteFromClipboard=async function(){try{const t=await navigator.clipboard.readText(),n=document.getElementById("free-writing-input");n&&t&&(n.value=t,handleTextInputChange("free"))}catch{alert("Vui lòng nhấn Ctrl + V để dán trực tiếp vào ô soạn thảo.")}};window.clearWritingInput=function(){const t=document.getElementById("free-writing-input");t&&(t.value="",handleTextInputChange("free"))};function m(t,n,e){const i=t.overallScore||85,a=t.badge||(i>=90?"Xuất Sắc 🌟":i>=80?"Rất Tốt 👏":i>=65?"Khá 👍":"Cần Cố Gắng ✍️"),o=i>=85?"linear-gradient(135deg, #10b981, #059669)":i>=70?"linear-gradient(135deg, #0284c7, #0369a1)":"linear-gradient(135deg, #f59e0b, #d97706)",s=t.criteriaScores||{grammar:85,vocabulary:85,coherence:85,taskFulfillment:85},c=t.strengths||[],f=t.errorsList||[],S=t.nativeVersion||e,w=t.nativePinyin||"",k=t.nativeVi||"",T=t.advancedVocabSuggestions||[];n.innerHTML=`
    <div class="writing-card-panel" style="margin-bottom: 24px; position: relative;">
      <!-- Header kết quả -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="width: 100px; height: 100px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; background: ${o}; box-shadow: 0 8px 24px rgba(0,0,0,0.25); flex-shrink: 0;">
            <span style="font-size: 2.2rem; font-weight: 900; line-height: 1;">${i}</span>
            <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; opacity: 0.9;">Thang 100</span>
          </div>

          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <span style="font-size: 1.35rem; font-weight: 900; color: #ffffff;">Đánh Giá:</span>
              <span style="font-size: 1.25rem; font-weight: 800; color: #38bdf8;">${a}</span>
            </div>
            <div style="font-size: 0.88rem; color: #94a3b8;">
              <span><i class="fa-solid fa-file-word"></i> Độ dài: <strong>${t.wordCount||e.length}</strong> chữ Hán</span>
              <span style="margin: 0 6px;">&bull;</span>
              <span><i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Đã soát ngữ pháp &amp; từ vựng HSK</span>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button onclick="window.print()" class="btn" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; padding: 8px 14px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer;">
            <i class="fa-solid fa-print"></i> In kết quả
          </button>
          <button onclick="document.getElementById('ai-evaluation-results').style.display='none'" class="btn" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #94a3b8; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- 4 TIÊU CHÍ -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-spell-check" style="color: #8b5cf6;"></i> Ngữ Pháp & Cú Pháp</span>
            <strong style="color: #8b5cf6;">${s.grammar||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${s.grammar||85}%; background: #8b5cf6; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-book" style="color: #38bdf8;"></i> Vốn Từ & Biểu Đạt</span>
            <strong style="color: #38bdf8;">${s.vocabulary||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${s.vocabulary||85}%; background: #38bdf8; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-link" style="color: #10b981;"></i> Mạch Lạc & Bố Cục</span>
            <strong style="color: #10b981;">${s.coherence||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${s.coherence||85}%; background: #10b981; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-bullseye" style="color: #f59e0b;"></i> Bám Đề & Chi Tiết</span>
            <strong style="color: #f59e0b;">${s.taskFulfillment||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${s.taskFulfillment||85}%; background: #f59e0b; border-radius: 99px;"></div>
          </div>
        </div>
      </div>

      <!-- NHẬN XÉT CHUNG -->
      <div style="background: rgba(139, 92, 246, 0.1); border: 1.5px solid rgba(168, 85, 247, 0.3); border-radius: 16px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 1rem; font-weight: 800; color: #d8b4fe; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-comment-dots"></i> Nhận Xét Chung Của Giám Khảo:
        </div>
        <p style="font-size: 0.95rem; line-height: 1.65; color: #ffffff; margin: 0 0 12px 0;">
          ${t.generalFeedback||"Bài viết đã truyền tải đầy đủ ý tưởng và trả lời tốt câu hỏi."}
        </p>

        ${c.length>0?`
          <div style="margin-top: 10px;">
            <strong style="font-size: 0.85rem; color: #34d399; text-transform: uppercase;"><i class="fa-solid fa-star"></i> Điểm sáng của bài:</strong>
            <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.9rem; color: #e2e8f0;">
              ${c.map(d=>`<li>${d}</li>`).join("")}
            </ul>
          </div>
        `:""}
      </div>

      <!-- CHI TIẾT LỖI SAI NẾU CÓ -->
      ${f.length>0?`
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #f87171; margin: 0 0 14px 0; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-triangle-exclamation"></i> Chi Tiết Lỗi Sai &amp; Cách Sửa (${f.length} điểm cần lưu ý):
          </h3>
          ${f.map((d,B)=>`
            <div style="background: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.25); border-radius: 14px; padding: 16px; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="background: #ef4444; color: #ffffff; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">Lỗi #${B+1}</span>
                <span style="font-size: 0.85rem; color: #fca5a5; font-weight: 700;">Câu gốc của bạn:</span>
              </div>
              <div class="hanzi-text" style="font-size: 1.15rem; color: #fca5a5; text-decoration: line-through; margin-bottom: 8px;">
                ${d.original}
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="background: #10b981; color: #ffffff; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">Nên sửa thành:</span>
              </div>
              <div class="hanzi-text" style="font-size: 1.25rem; font-weight: 800; color: #34d399; margin-bottom: 6px;">
                ${d.corrected}
              </div>
              <div style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.5;">
                <strong>💡 Lý do:</strong> ${d.reason}
              </div>
            </div>
          `).join("")}
        </div>
      `:""}

      <!-- BẢN VIẾT LẠI CHUẨN BẢN XỨ -->
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(56, 189, 248, 0.08)); border: 1.5px solid rgba(16, 185, 129, 0.3); border-radius: 18px; padding: 22px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #34d399; margin: 0; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-crown"></i> Phiên Bản Viết Lại Chuẩn Người Bản Xứ:
          </h3>
          <button onclick="playNativeRewriteAudio()" title="Nghe phát âm bản viết lại"
            style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-volume-high"></i> <span>Nghe đọc mẫu</span>
          </button>
        </div>

        <div id="native-rewrite-zh-text" class="hanzi-text" style="font-size: 1.25rem; line-height: 1.8; color: #ffffff; margin-bottom: 8px; font-weight: 500;">
          ${S}
        </div>

        ${w?`
          <div style="font-size: 0.88rem; line-height: 1.6; color: #94a3b8; font-style: italic; margin-bottom: 10px;">
            ${w}
          </div>
        `:""}

        ${k?`
          <div style="font-size: 0.92rem; line-height: 1.6; color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 10px;">
            <strong>Dịch nghĩa:</strong> ${k}
          </div>
        `:""}
      </div>

      <!-- TỪ VỰNG NÂNG CAO ĐƯỢC GỢI Ý -->
      ${T.length>0?`
        <div style="margin-bottom: 14px;">
          <h4 style="font-size: 1rem; font-weight: 800; color: #38bdf8; margin: 0 0 10px 0;">
            <i class="fa-solid fa-graduation-cap"></i> Từ vựng &amp; Thành ngữ nâng cao gợi ý thay thế:
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
            ${T.map(d=>`
              <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 10px; padding: 10px 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="text-decoration: line-through; color: #94a3b8; font-size: 0.9rem;">${d.original}</span>
                  <i class="fa-solid fa-arrow-right" style="color: #38bdf8; font-size: 0.75rem;"></i>
                  <strong style="color: #38bdf8; font-size: 1.05rem;">${d.suggested}</strong>
                  <span style="font-size: 0.8rem; color: #a855f7;">(${d.pinyin})</span>
                </div>
                <div style="font-size: 0.8rem; color: #cbd5e1; margin-top: 4px;">Nghĩa: ${d.meaning}</div>
              </div>
            `).join("")}
          </div>
        </div>
      `:""}
    </div>
  `}window.playNativeRewriteAudio=function(){const t=document.getElementById("native-rewrite-zh-text");if(!t)return;const n=t.textContent.trim();if(!n||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const e=new SpeechSynthesisUtterance(n);e.lang="zh-CN",e.rate=.88,window.speechSynthesis.speak(e)};document.addEventListener("DOMContentLoaded",()=>{C()});
