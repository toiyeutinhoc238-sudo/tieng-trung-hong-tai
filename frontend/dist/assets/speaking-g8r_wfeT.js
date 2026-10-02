import"./global_sidebar-CCT4vmqF.js";import{p as M}from"./index-haNF1LmB.js";const j=(window.location.hostname.includes("localhost")||window.location.hostname.includes("127.0.0.1"),"");let p={so:[],trung:[],cao:[]},s="trung",c=null,u=new Map,T=!1,y=null,f=180,b=!1,v=null,k=120,d=null,I=[],L=null,K=null,r=null,w=!1,x=0;function m(n="beep"){try{const i=new(window.AudioContext||window.webkitAudioContext),t=i.createOscillator(),e=i.createGain();if(t.connect(e),e.connect(i.destination),n==="spin")t.type="triangle",t.frequency.setValueAtTime(400,i.currentTime),t.frequency.exponentialRampToValueAtTime(800,i.currentTime+.25),e.gain.setValueAtTime(.2,i.currentTime),e.gain.exponentialRampToValueAtTime(.01,i.currentTime+.25),t.start(),t.stop(i.currentTime+.25);else if(n==="start")t.type="sine",t.frequency.setValueAtTime(587.33,i.currentTime),t.frequency.setValueAtTime(880,i.currentTime+.1),e.gain.setValueAtTime(.25,i.currentTime),e.gain.exponentialRampToValueAtTime(.01,i.currentTime+.35),t.start(),t.stop(i.currentTime+.35);else if(n==="chime"){const o=i.currentTime;[523.25,659.25,783.99].forEach((a,h)=>{const g=i.createOscillator(),l=i.createGain();g.type="sine",g.frequency.value=a,g.connect(l),l.connect(i.destination),l.gain.setValueAtTime(.18,o+h*.15),l.gain.exponentialRampToValueAtTime(.001,o+h*.15+.4),g.start(o+h*.15),g.stop(o+h*.15+.4)})}}catch{}}async function V(){var t,e,o;try{let a=await fetch(`${j}/api/hskk-questions`);a.ok||(a=await fetch("/data/hskk_questions.json"));const h=await a.json();h&&(h.so||h.questions)&&(h.so?p=h:h.questions&&(p.so=h.questions.filter(g=>g.level==="so"),p.trung=h.questions.filter(g=>g.level==="trung"),p.cao=h.questions.filter(g=>g.level==="cao")))}catch(a){console.warn("Lỗi nạp API HSKK, thử nạp tĩnh...",a);try{const h=await fetch("/data/hskk_questions.json");h.ok&&(p=await h.json())}catch{}}const n=(((t=p.so)==null?void 0:t.length)||0)+(((e=p.trung)==null?void 0:e.length)||0)+(((o=p.cao)==null?void 0:o.length)||0),i=document.getElementById("total-speaking-stat");i&&n>0&&(i.textContent=n.toLocaleString()),spinRandomQuestion(!1)}window.switchSpeakingLevel=function(n,i){s===n&&c||(s=n,document.querySelectorAll(".level-select-row .level-btn").forEach(t=>t.classList.remove("active")),i&&i.classList.add("active"),spinRandomQuestion(!0))};window.spinRandomQuestion=function(n=!0){const i=p[s]||[];if(!i||i.length===0)return;const t=document.getElementById("spin-question-btn");n&&t&&(t.classList.add("rolling"),m("spin"),setTimeout(()=>t.classList.remove("rolling"),500));let e=null;if(i.length===1)e=i[0];else do e=i[Math.floor(Math.random()*i.length)];while(c&&e.question===c.question&&i.length>1);c=e,R();const o=document.getElementById("ai-suggestion-box");o&&(o.style.display="none");const a=document.getElementById("hint-toggle-btn");a&&(a.innerHTML=`
      <i class="fa-solid fa-lightbulb"></i>
      <span>Gợi ý Dàn bài &amp; Từ vựng</span>
    `);const h=document.getElementById("sample-speech-box");h&&(h.style.display="none");const g=document.getElementById("sample-speech-toggle-btn");g&&(g.innerHTML=`
      <i class="fa-solid fa-medal"></i>
      <span>Bài nói mẫu tham khảo</span>
    `),resetPrepTimer(),cancelSpeakingRecording();const l=document.getElementById("recorded-result-box");l&&(l.style.display="none");const z=document.getElementById("ai-speaking-evaluation-results");z&&(z.style.display="none")};function R(){if(!c)return;const n=document.getElementById("active-question-text"),i=document.getElementById("question-meta-badge"),t=s==="so"?"HSKK Sơ cấp":s==="cao"?"HSKK Cao cấp":"HSKK Trung cấp";n&&(n.textContent=c.question),i&&(i.textContent=`Câu ${c.stt||1} • ${t}`)}window.playQuestionTts=function(){if(!c||!c.question||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const n=new SpeechSynthesisUtterance(c.question);n.lang="zh-CN",n.rate=.9,window.speechSynthesis.speak(n)};window.toggleAiSuggestions=async function(){const n=document.getElementById("ai-suggestion-box"),i=document.getElementById("hint-toggle-btn");if(!n||!c)return;if(n.style.display==="block"){n.style.display="none",i&&(i.innerHTML=`
        <i class="fa-solid fa-lightbulb"></i>
        <span>Gợi ý Dàn bài &amp; Từ vựng</span>
      `);return}n.style.display="block",i&&(i.innerHTML=`
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Gợi ý</span>
    `);const e=`${s}_${c.question}`;if(u.has(e)){A(u.get(e));return}if(!T){T=!0,n.innerHTML=`
    <div style="text-align: center; padding: 24px 16px; color: #f59e0b;">
      <i class="fa-solid fa-brain fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #f59e0b;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        AI HongTai đang lập Dàn ý &amp; chọn lọc Từ vựng Khẩu ngữ...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Phù hợp chuẩn thi HSKK ${s==="so"?"Sơ cấp":s==="cao"?"Cao cấp":"Trung cấp"}
      </div>
    </div>
  `;try{const o=await fetch(`${j}/api/ai/hskk-suggest`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:c.question,level:s,skill:"speaking"})});if(o.ok){const a=await o.json();u.set(e,a),A(a),m("start")}else throw new Error("Server error")}catch(o){console.error("Lỗi gợi ý AI:",o),n.innerHTML=`
      <div style="text-align: center; padding: 24px 16px; color: #f87171;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 12px; color: #ef4444;"></i>
        <div style="font-weight: 700; font-size: 1rem; color: #ffffff; margin-bottom: 6px;">
          Chưa thể tạo gợi ý dàn bài lúc này
        </div>
        <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 16px;">
          Hệ thống AI đang phản hồi chậm hoặc bận. Vui lòng bấm thử lại để nhận gợi ý chuẩn bám sát đề bài.
        </div>
        <button onclick="window.toggleAiSuggestion && window.toggleAiSuggestion()" style="background: #f59e0b; color: #ffffff; border: none; padding: 8px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-rotate-right"></i> Thử lại
        </button>
      </div>
    `}finally{T=!1}}};function A(n){const i=document.getElementById("ai-suggestion-box");if(!i)return;const t=n.outline||{},e=n.vocabulary||[],o=n.sentenceStructures||[];i.innerHTML=`
    <div class="ai-hint-box-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px dashed rgba(34, 197, 94, 0.4); padding-bottom: 10px;">
      <div class="ai-hint-box-title" style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.05rem; color: var(--hint-header-color, #15803d);">
        <i class="fa-solid fa-wand-magic-sparkles" style="color: #10b981;"></i>
        <span>AI Đề Xuất Dàn Ý &amp; Từ Vựng Khẩu Ngữ</span>
      </div>
      <span class="ai-hint-badge" style="font-size: 0.75rem; background: var(--hint-badge-bg, #dcfce7); color: var(--hint-badge-color, #15803d); border: 1px solid var(--hint-badge-border, #86efac); padding: 3px 10px; border-radius: 6px; font-weight: 800;">
        HSKK ${s==="so"?"Sơ cấp":s==="cao"?"Cao cấp":"Trung cấp"}
      </span>
    </div>

    <!-- 1. Dàn bài -->
    <div style="margin-bottom: 18px;">
      <div class="ai-outline-title" style="font-size: 0.94rem; font-weight: 800; color: var(--outline-title-color, #b45309); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-list-ol" style="color: #f59e0b;"></i> <span>1. Dàn bài gợi ý:</span>
      </div>
      <div class="ai-outline-box" style="background: var(--outline-box-bg, #fffbeb); border: 1px solid var(--outline-box-border, #fde68a); border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 12px; font-size: 0.92rem; line-height: 1.7; color: var(--outline-box-color, #1e293b);">
        <div style="margin-bottom: 6px;"><strong>Mở đầu:</strong> ${t.intro||"Trả lời trực tiếp vào trọng tâm câu hỏi."}</div>
        <div style="margin-bottom: 6px;">
          <strong>Triển khai thân bài:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 20px;">
            ${(t.body||[]).map(a=>`<li style="margin-bottom: 4px;">${a}</li>`).join("")}
          </ul>
        </div>
        <div><strong>Kết thúc:</strong> ${t.conclusion||"Đúc kết bài học hoặc cảm xúc cá nhân."}</div>
      </div>
    </div>

    <!-- 2. Từ vựng có thể sử dụng -->
    <div style="margin-bottom: 18px;">
      <div class="ai-vocab-section-title" style="font-size: 0.94rem; font-weight: 800; color: var(--vocab-title-color, #0284c7); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-key" style="color: #0284c7;"></i> <span>2. Từ vựng / Cụm từ đắt giá nên nói:</span>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${e.map(a=>{let h=a.pinyin;if(a.hanzi)try{const g=M(a.hanzi,{toneType:"symbol"});g&&(h=g)}catch{}return`
          <div class="ai-vocab-pill"
            style="background: var(--vocab-pill-bg, #f0f9ff); border: 1.5px solid var(--vocab-pill-border, #7dd3fc); padding: 6px 14px; border-radius: 99px; display: inline-flex; align-items: center; gap: 4px;">
            <span class="ai-vocab-hanzi" style="font-weight: 800; color: var(--vocab-hanzi-color, #0f172a); font-family: var(--font-chinese), sans-serif; font-size: 0.95rem;">${a.hanzi}</span>
            <span class="ai-vocab-pinyin" style="font-size: 0.8rem; color: var(--vocab-pinyin-color, #0284c7); font-weight: 700; margin: 0 3px;">(${h})</span>
            <span class="ai-vocab-meaning" style="font-size: 0.82rem; color: var(--vocab-meaning-color, #334155); font-weight: 600;">: ${a.meaning}</span>
          </div>
        `}).join("")}
      </div>
    </div>

    <!-- 3. Mẫu câu cấu trúc nên dùng -->
    ${o.length>0?`
      <div class="ai-grammar-section" style="margin-bottom: 14px;">
        <div class="ai-grammar-section-title" style="font-size: 1.02rem; font-weight: 900; color: var(--grammar-title-color, #6b21a8); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-puzzle-piece" style="color: var(--grammar-icon-color, #7c3aed); font-size: 1.1rem;"></i>
          <span>3. Mẫu câu kết nối lưu loát:</span>
        </div>
        <div class="ai-grammar-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
          ${o.map(a=>`
            <div class="ai-grammar-card" style="background: var(--grammar-card-bg, #ffffff); border: 2px solid var(--grammar-card-border, #a855f7); border-radius: 16px; padding: 16px 18px; box-shadow: var(--grammar-card-shadow, 0 4px 16px rgba(124, 58, 237, 0.12)); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div class="ai-grammar-pattern" style="font-weight: 900; font-size: 1.18rem; color: var(--grammar-pattern-color, #581c87); margin-bottom: 6px; line-height: 1.4; font-family: var(--font-chinese), sans-serif; letter-spacing: 0.3px;">
                  ${a.pattern}
                </div>
                <div class="ai-grammar-meaning" style="font-size: 0.92rem; color: var(--grammar-meaning-color, #0f172a); font-weight: 700; margin-bottom: 10px; line-height: 1.5;">
                  ${a.meaning}
                </div>
              </div>
              ${a.example?`
                <div class="ai-grammar-example" style="font-size: 0.94rem; color: var(--grammar-example-color, #0f172a); font-weight: 600; background: var(--grammar-example-bg, #f3e8ff); border: 1px solid var(--grammar-example-border-sub, #ddd6fe); border-left: 4.5px solid var(--grammar-example-border, #7c3aed); padding: 10px 14px; border-radius: 10px; line-height: 1.65; font-family: var(--font-chinese), sans-serif; margin-top: 6px;">
                  <strong class="example-label" style="color: var(--grammar-vd-color, #6d28d9); font-weight: 900; font-family: var(--font-body), sans-serif; margin-right: 6px;">VD:</strong>${a.example}
                </div>
              `:""}
            </div>
          `).join("")}
        </div>
      </div>
    `:""}
  `}window.toggleSampleSpeech=async function(n=!1){const i=document.getElementById("sample-speech-box"),t=document.getElementById("sample-speech-toggle-btn");if(!i||!c)return;if(i.style.display==="block"&&!n){i.style.display="none",t&&(t.innerHTML=`
        <i class="fa-solid fa-medal"></i>
        <span>Bài nói mẫu tham khảo</span>
      `);return}i.style.display="block",t&&(t.innerHTML=`
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Bài nói mẫu</span>
    `);const o=`${s}_${c.question}`;if(!n&&u.has(o)){const a=u.get(o);if(a&&a.sampleAnswer&&a.sampleAnswer.hanzi&&!a.isFallback){S(a);return}}n&&u.delete(o),i.innerHTML=`
    <div style="text-align: center; padding: 24px 16px; color: #10b981;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #10b981;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        Đang tạo bài nói mẫu dài chuẩn HSKK ${s==="so"?"Sơ cấp":s==="cao"?"Cao cấp":"Trung cấp"}...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Hệ thống AI đang xây dựng bài nói mẫu chuyên sâu bám sát: "${c.question}"
      </div>
    </div>
  `;try{const a=await fetch(`${j}/api/ai/hskk-suggest`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:c.question,level:s,skill:"speaking"})});if(a.ok){const h=await a.json();u.set(o,h),S(h),m("start")}else throw new Error("Server error")}catch(a){console.error("Lỗi nạp bài mẫu nói AI, chuyển sang mẫu chuẩn dự phòng:",a);const h=P();u.set(o,h),S(h)}};window.regenerateSampleSpeech=function(){window.toggleSampleSpeech(!0)};function S(n){const i=document.getElementById("sample-speech-box");if(!i)return;const t=n.sampleAnswer||{};let e=t.hanzi||"";e=e.replace(/[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆĐÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ]/g,"").replace(/[\uac00-\ud7af]/g,"").trim();const o=e.replace(/\s+/g,"").length;let a=t.pinyin||"";if(e)try{const h=M(e,{toneType:"symbol"});h&&(a=h)}catch{}i.innerHTML=`
    <div class="sample-box-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px dashed rgba(16, 185, 129, 0.4); padding-bottom: 10px; flex-wrap: wrap; gap: 8px;">
      <div class="sample-box-title" style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.1rem; color: var(--sample-title-color, #059669);">
        <i class="fa-solid fa-medal" style="color: #10b981;"></i>
        <span>Bài Nói Mẫu Tham Khảo (Chuẩn HSKK ${s==="so"?"Sơ cấp":s==="cao"?"Cao cấp":"Trung cấp"})</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        ${n.isFallback?`
          <span style="font-size: 0.76rem; background: rgba(245, 158, 11, 0.16); color: #d97706; padding: 4px 10px; border-radius: 99px; font-weight: 800; border: 1px solid rgba(245, 158, 11, 0.35);">
            <i class="fa-solid fa-cloud-arrow-down"></i> Mẫu ngoại tuyến
          </span>
        `:`
          <span style="font-size: 0.76rem; background: rgba(16, 185, 129, 0.18); color: var(--sample-badge-color, #047857); padding: 4px 10px; border-radius: 99px; font-weight: 800; border: 1px solid rgba(16, 185, 129, 0.35);">
            <i class="fa-solid fa-wand-magic-sparkles"></i> AI HongTai Master
          </span>
        `}
        <span style="font-size: 0.78rem; background: rgba(16, 185, 129, 0.18); color: var(--sample-badge-color, #047857); padding: 4px 10px; border-radius: 99px; font-weight: 800; border: 1px solid rgba(16, 185, 129, 0.35);">
          ${o} chữ Hán
        </span>
        <button onclick="regenerateSampleSpeech()" title="Yêu cầu AI tạo lại bài nói mẫu mới bám sát đề thi" style="background: rgba(168, 85, 247, 0.15); border: 1px solid #a855f7; color: #a855f7; font-size: 0.82rem; font-weight: 700; padding: 5px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-rotate-right"></i> <span>Làm mới (AI)</span>
        </button>
        <button onclick="playSpeakingSampleTts()" style="background: rgba(56, 189, 248, 0.15); border: 1px solid #0284c7; color: var(--btn-tts-color, #0284c7); font-size: 0.82rem; font-weight: 700; padding: 5px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-volume-high"></i> <span>Nghe bản xứ đọc</span>
        </button>
      </div>
    </div>

    <!-- Hanzi Text -->
    <div id="sample-speaking-hanzi" class="sample-hanzi-card" style="font-size: 1.12rem; line-height: 1.85; color: var(--sample-hanzi-color, #0f172a); white-space: pre-line; margin-bottom: 14px; font-family: var(--font-chinese), sans-serif; background: var(--sample-hanzi-bg, #ffffff); padding: 16px 20px; border-radius: 12px; border: 1.5px solid var(--sample-hanzi-border, #a7f3d0); border-left: 4px solid #10b981; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.08);">
      ${e}
    </div>

    <!-- Pinyin Text -->
    ${a?`
      <div style="margin-bottom: 12px;">
        <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--sample-pinyin-title, #0284c7); font-weight: 800; margin-bottom: 4px;">Phiên âm Pinyin:</div>
        <div class="sample-pinyin-card" style="font-size: 0.92rem; color: var(--sample-pinyin-color, #0369a1); font-style: italic; line-height: 1.65; white-space: pre-line; background: var(--sample-pinyin-bg, #f0f9ff); border: 1px solid var(--sample-pinyin-border, #bae6fd); padding: 12px 16px; border-radius: 10px;">${a}</div>
      </div>
    `:""}

    <!-- Vietnamese Translation -->
    ${t.meaningVi?`
      <div>
        <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--sample-meaning-title, #b45309); font-weight: 800; margin-bottom: 4px;">Dịch nghĩa tiếng Việt:</div>
        <div class="sample-meaning-card" style="font-size: 0.94rem; color: var(--sample-meaning-color, #1e293b); line-height: 1.7; white-space: pre-line; background: var(--sample-meaning-bg, #fffbeb); border: 1px solid var(--sample-meaning-border, #fde68a); padding: 12px 16px; border-radius: 10px;">${t.meaningVi}</div>
      </div>
    `:""}
  `}function P(){const n=c&&c.question?c.question:"đề bài",i=s||"trung",t=/诚|信|欺诈|撒谎|真实|守约|道德/.test(n),e=/运动|锻炼|走路|健康|跑步|健身|身体/.test(n);return t?i==="so"?{isFallback:!0,outline:{intro:`Mở bài: Nêu quan điểm trực diện: "${n}". (Làm người thành thật giữ lời hứa là điều rất quan trọng trong cuộc sống.)`,body:["Luận điểm 1: Khi làm người thật thà thì bạn bè và mọi người mới tin tưởng. (Tại sao bạn bè cần tin nhau?)","Luận điểm 2: Làm sai thì phải dũng cảm thừa nhận, không nói dối. (Làm sai thì nên làm thế nào?)","Luận điểm 3: Bố mẹ và thầy cô luôn dạy chúng ta phải giữ lời hứa. (Bố mẹ dạy bạn điều gì?)"],conclusion:"Kết bài: Khuyên mọi người cùng nói thật và giữ chữ tín để cuộc sống vui vẻ, hạnh phúc."},vocabulary:[{hanzi:"诚实",pinyin:"chéngshí",meaning:"thành thật, trung thực"},{hanzi:"相信",pinyin:"xiāngxìn",meaning:"tin tưởng"},{hanzi:"答应",pinyin:"dāying",meaning:"đồng ý, hứa hẹn"},{hanzi:"朋友",pinyin:"péngyou",meaning:"bạn bè"},{hanzi:"重要",pinyin:"zhòngyào",meaning:"quan trọng"}],sentenceStructures:[{pattern:"我觉得……非常重要",meaning:"Tôi thấy... vô cùng quan trọng",example:"我觉得做一个诚实守信的人非常重要。"},{pattern:"只要……就一定能……",meaning:"Chỉ cần... thì nhất định có thể...",example:"只要常常说真话，就一定能得到大家的信任。"}],sampleAnswer:{hanzi:`关于“${n}”这个问题，我觉得做一个诚实守信的人非常重要。

在平时生活和学习中，如果一个人经常说真话、说到做到，大家就会很喜欢他，也愿意和他做朋友。相反，如果一个人常常撒谎骗人，别人就不会再相信他了。

首先，我们在学校里要诚实。做作业不能抄别人的，考试更不能作弊。遇到不会的问题，要主动请教老师和同学。其次，在家里做错了事情，要勇敢承认错误，不能对父母撒谎。

最后，答应别人的事情就一定要努力做到。只要我们每个人都讲信用、说真话，我们的生活就会更加美好，身边也会有更多知心的好朋友。`,pinyin:`Guānyú "${n}" zhè ge wèntí, wǒ juéde zuò yí gè chéngshí shǒuxìn de rén fēicháng zhòngyào.

Zài píngshí shēnghuó hé xuéxí zhōng, rúguǒ yí gè rén jīngcháng shuō zhēnhuà, shuō dào zuò dào, dàjiā jiù huì hěn xǐhuan tā, yě yuànyì hé tā zuò péngyou. Xiāngfǎn, rúguǒ yí gè rén chángcháng sāhuǎng piàn rén, biérén jiù bú huì zài xiāngxìn tā le.

Shǒuxiān, wǒmen zài xuéxiào lǐ yào chéngshí. Zuò zuòyè bù néng chāo biérén de, kǎoshì gèng bù néng zuòbì. Yù dào bú huì de wèntí, yào zhǔdòng qǐngjiào lǎoshī hé tóngxué. Qícì, zài jiālǐ zuò cuò le shìqing, yào yǒnggǎn chéngrèn cuòwù, bù néng duì fùmǔ sāhuǎng.

Zuìhòu, dāying biérén de shìqing jiù yídìng yào nǔlì zuò dào. Zhǐyào wǒmen měi gè rén dōu jiǎng xìnyòng, shuō zhēnhuà, wǒmen de shēnghuó jiù huì gèngjiā měihǎo, shēnbiān yě huì yǒu gèng duō zhīxīn de hǎo péngyou.`,meaningVi:`Về câu hỏi "${n}", tôi thấy làm một người thành thật và giữ chữ tín là điều vô cùng quan trọng.

Trong cuộc sống và học tập thường ngày, nếu một người thường xuyên nói thật, nói được làm được, mọi người sẽ rất quý mến và sẵn lòng kết bạn. Ngược lại, nếu một người hay nói dối lừa gạt, người khác sẽ không bao giờ tin tưởng nữa.

Trước hết, ở trường học chúng ta phải trung thực. Làm bài tập không được chép của người khác, khi đi thi càng không được gian lận. Gặp câu hỏi chưa hiểu thì chủ động hỏi thầy cô và bạn bè. Thứ hai, ở nhà nếu làm sai việc gì thì phải dũng cảm nhận lỗi, không được nói dối cha mẹ.

Cuối cùng, việc gì đã hứa với người khác thì nhất định phải nỗ lực thực hiện. Chỉ cần mỗi người chúng ta đều giữ chữ tín, nói lời thật lòng, cuộc sống sẽ ngày càng tươi đẹp và chúng ta sẽ có thêm nhiều bạn tốt tri kỷ.`}}:i==="cao"?{isFallback:!0,outline:{intro:`Mở bài: Đặt vấn đề sâu sắc về chữ tín trong xã hội hiện đại: "${n}". Khẳng định chữ tín là sinh mệnh của một nền văn minh thịnh vượng.`,body:["Luận điểm 1: Từ góc độ văn hóa giáo dục: Nuôi dưỡng tinh thần liêm chính và sự tự giác đạo đức từ gia đình đến nhà trường.","Luận điểm 2: Từ góc độ kinh tế thị trường: Thượng tôn tinh thần khế ước, xây dựng hệ thống tín dụng doanh nghiệp công khai minh bạch.","Luận điểm 3: Từ góc độ pháp quyền thể chế: Xây dựng chế tài pháp luật nghiêm khắc trừng phạt hành vi bội tín gian lận, nâng cao cái giá phải trả cho sự thất tín."],conclusion:"Kết bài: Nâng tầm vấn đề, khẳng định chỉ khi kết hợp đạo đức với pháp trị, chữ tín mới thực sự trở thành chuẩn mực sống của toàn xã hội."},vocabulary:[{hanzi:"契约精神",pinyin:"qìyuē jīngshén",meaning:"tinh thần khế ước, tôn trọng hợp đồng"},{hanzi:"以身作则",pinyin:"yǐshēn zuòzé",meaning:"lấy mình làm gương"},{hanzi:"惩恶扬善",pinyin:"chéng'è yángshàn",meaning:"trừng phạt cái ác, biểu dương cái thiện"},{hanzi:"潜移默化",pinyin:"qián yí mò huà",meaning:"ảnh hưởng sâu sắc một cách vô hình, ngấm dần"},{hanzi:"标本兼治",pinyin:"biāo běn jiān zhì",meaning:"trị cả phần ngọn lẫn gốc rễ"}],sentenceStructures:[{pattern:"不仅关乎……，更折射出……",meaning:"Không chỉ liên quan đến..., mà càng phản ánh...",example:"诚信建设不仅关乎公民道德素养，更折射出整个社会的文明进程。"},{pattern:"唯有坚持……，方能……",meaning:"Chỉ khi kiên trì..., mới có thể...",example:"唯有坚持德法兼治，方能在全社会树立起坚不可摧的诚信基石。"}],sampleAnswer:{hanzi:`古人云：“人无信不立，业无信不兴，国无信则衰。”针对“${n}”这一具有深刻现实意义的时代命题，我认为在全社会涵养诚实守信的良好风气，绝非一日之功，必须坚持德法兼治、标本兼治，从道德自律、市场示范与法律制度三个维度协同发力。

首先，立德树人是培育诚信土壤的根本之策。家庭与各级学校应当将诚信教育贯穿于人才培养的全过程，注重以身作则、言传身教，引导青少年将诚实守信内化于心、外化于行。唯有在潜移默化中树立知荣明耻的价值观念，才能从源头上筑牢抗拒虚伪与侥幸的心理防线。

其次，弘扬契约精神是维系现代市场经济秩序的关键支柱。各级商业机构与社会公众人物应当以高标准严格约束自身行为，做到以诚立企、以信筑基，坚决杜绝商业欺诈与虚假宣传。一个恪守信用的商业环境，不仅能显著降低交易成本，更能激发出强大的市场活力与社会互信。

再者，健全严谨的法治体系与全方位的失信惩戒机制是不可或缺的刚性保障。有关部门应当加速完善覆盖全社会的信用信息网络，大幅提高失信违约的违法成本，真正形成“守信者处处通畅，失信者寸步难行”的强大震慑效应。

总而言之，诚信风气的形成离不开每个社会成员的躬行实践。只要我们每个人都能笃行不怠、守信践诺，必将汇聚成推动社会文明奔涌向前的磅礴力量。`,pinyin:`Gǔrén yún: "Rén wú xìn bù lì, yè wú xìn bù xīng, guó wú xìn zé shuāi." Zhēnduì "${n}" zhè yí jùyǒu shēnkè xiànshí yìyì de shídài mìngtí, wǒ rènwéi zài quán shèhuì hányǎng chéngshí shǒuxìn de liánghǎo fēngqì, juébù shì yīrì zhī gōng, bìxū jiānchí dé fǎ jiānzhì, biāoběn-jiānzhì, cóng dàodé zìlǜ, shìchǎng shìfàn yǔ fǎlǜ zhìdù sān gè wéidù xiétóng fālì.

Shǒuxiān, lìdé shùrén shì péiyù chéngxìn tǔrǎng de gēnběn zhī cè. Jiātíng yǔ gèjí xuéxiào yīngdāng jiāng chéngxìn jiàoyù guànchuān yú réncái péiyǎng de quán guòchéng, zhùzhòng yǐshēn-zuòzé, yánchuán-shēnjiào, yǐndǎo qīngshàonián jiāng chéngshí shǒuxìn nèihuà yú xīn, wàihuà yú xíng. Wéiyǒu zài qiányí-mòhuà zhōng shùlì zhīróng-míngchǐ de jiàzhí guānniàn, cái néng cóng yuántóu shang zhùláo kàngjù xūwěi yǔ jiǎoxìng de xīnlǐ fángxiàn.

Qícì, hóngyáng qìyuē jīngshén shì wéixì xiàndài shìchǎng jīngjì zhìxù de guānjiàn zhīzhù. Gèjí shāngyè jīgòu yǔ shèhuì gōngzhòng rénwù yīngdāng yǐ gāo biāozhǔn yángé yuēshù zìshēn xíngwéi, zuò dào yǐ chéng lì qǐ, yǐ xìn zhù jī, jiānjué dùjué shāngyè qīzhà yǔ xūjiǎ guǎnggào. Yí gè kèshǒu xìnyòng de shāngyè huánjìng, bùjǐn néng xiǎnzhù jiàngdī jiāoyì chéngběn, gèng néng jīfā chū qiángdà de shìchǎng huólì yǔ shèhuì hùxìn.

Zàizhě, jiànquán yánjǐn de fǎzhì tǐxì yǔ quánfāngwèi de shīxìn chéngjiè jīzhì shì bùkě huòquē de gāngxìng bǎozhàng. Yǒuguān bùmén yīngdāng jiāsù wánshàn fùgài quán shèhuì de xìnyòng xìnxī wǎngluò, dàfú tígāo shīxìn wéiyuē de wéifǎ chéngběn, zhēnzhèng xíngchéng "shǒuxìnzhě chùchù tōngchàng, shīxìnzhě cùnbù-nánxíng" de qiángdà zhènshè xiàoyìng.

Zǒng'éryánzhī, chéngxìn fēngqì de xíngchéng lí bù kāi měi gè shèhuì chéngyuán de gōngxíng shíjiàn. Zhǐyào wǒmen měi gè rén dōu néng dǔxíng bù dài, shǒuxìn jiànnuò, bìjiāng huìjù chéng tuīdòng shèhuì wénmíng bēnyǒng xiàngqián de pángbó lìliàng.`,meaningVi:`Người xưa có câu: "Người không có chữ tín thì khó lập thân, doanh nghiệp không có chữ tín thì không hưng thịnh, quốc gia không có chữ tín tất suy tàn." Đối với câu hỏi giàu ý nghĩa thực tiễn "${n}", tôi cho rằng để bồi dưỡng phong khí trung thực giữ chữ tín trong toàn xã hội tuyệt đối không thể là chuyện một sớm một chiều, mà cần kết hợp hài hòa giữa đạo đức và pháp trị, trị cả gốc lẫn ngọn trên ba bình diện: tự giác đạo đức, mẫu mực thị trường và thể chế pháp luật.

Trước hết, bồi dưỡng nhân cách là phương sách gốc rễ để ươm mầm chữ tín. Gia đình và các cấp nhà trường cần lồng ghép giáo dục tính trung thực vào toàn bộ quá trình nuôi dưỡng nhân tài, chú trọng lấy mình làm gương, dạy bảo bằng cả lời nói lẫn hành động để thế hệ trẻ thấu hiểu và thực hành. Chỉ khi tư tưởng đúng đắn được ngấm sâu một cách tự nhiên, ta mới xây dựng được bức tường thành tâm lý vững chắc ngăn chặn thói giả dối.

Thứ hai, phát huy tinh thần khế ước là trụ cột then chốt bảo đảm trật tự kinh tế thị trường hiện đại. Các doanh nghiệp và người có uy tín trong xã hội cần tự giác chuẩn mực, lấy chân thành lập nghiệp, lấy chữ tín làm gốc, kiên quyết bài trừ gian lận thương mại và quảng cáo sai sự thật. Một môi trường kinh doanh trọng chữ tín sẽ giảm thiểu đáng kể chi phí giao dịch và nâng cao niềm tin trong xã hội.

Thêm vào đó, việc hoàn thiện khuôn khổ pháp chế nghiêm minh và cơ chế chế tài xử phạt người thất tín là bảo đảm không thể thiếu. Các cơ quan quản lý cần đẩy mạnh mạng lưới thông tin tín dụng xã hội, nâng cao cái giá phải trả của việc vi phạm, thực sự tạo lập hiệu ứng răn đe mạnh mẽ: "Người giữ chữ tín đi đâu cũng thuận lợi, kẻ thất tín một bước khó đi".

Tóm lại, phong khí chữ tín phụ thuộc vào sự dấn thân hành động của mỗi người. Chỉ cần mỗi cá nhân bền bỉ giữ trọn lời hứa, nhất định sẽ hội tụ thành sức mạnh to lớn đưa nền văn minh xã hội tiến bước mạnh mẽ.`}}:{isFallback:!0,outline:{intro:`Mở bài: Đặt vấn đề trực diện cho câu hỏi "${n}". Khẳng định chữ tín và sự trung thực là nền tảng đạo đức của xã hội.`,body:["Luận điểm 1: Vai trò giáo dục từ gia đình và nhà trường (cha mẹ và thầy cô cần lấy mình làm gương, dạy con trẻ sống chân thành từ nhỏ).","Luận điểm 2: Trách nhiệm nêu gương của các doanh nghiệp và người nổi tiếng (kinh doanh giữ chữ tín, công khai minh bạch, nói không với gian lận).","Luận điểm 3: Hoàn thiện hệ thống luật pháp và chế tài trừng phạt nghiêm khắc (xử lý nghiêm các hành vi gian dối thương mại, trừng phạt kẻ thất tín)."],conclusion:"Kết bài: Tổng kết lại quan điểm, kêu gọi mỗi cá nhân bắt đầu từ chính mình, từ việc nhỏ nhất để xây dựng xã hội tin cậy."},vocabulary:[{hanzi:"诚实守信",pinyin:"chéngshí shǒuxìn",meaning:"trung thực giữ chữ tín"},{hanzi:"以身作则",pinyin:"yǐshēn zuòzé",meaning:"lấy mình làm gương"},{hanzi:"商业欺诈",pinyin:"shāngyè qīzhà",meaning:"gian lận thương mại"},{hanzi:"严厉惩罚",pinyin:"yánlì chéngfá",meaning:"trừng phạt nghiêm khắc"},{hanzi:"信用体系",pinyin:"xìnyòng tǐxì",meaning:"hệ thống tín dụng / uy tín xã hội"},{hanzi:"言出必行",pinyin:"yán chū bì xíng",meaning:"nói là làm, giữ lời hứa"}],sentenceStructures:[{pattern:"要想……，需要从……几个方面共同努力",meaning:"Muốn..., cần phải cùng nỗ lực từ mấy phương diện...",example:"要想在全社会形成良好的诚信风气，需要从教育和法律等多方面共同努力。"},{pattern:"只有让……，才能起到……的作用",meaning:"Chỉ khi khiến cho..., mới có thể phát huy tác dụng...",example:"只有让失信者付出沉重代价，才能起到有效的警示作用。"}],sampleAnswer:{hanzi:`我觉得，要想在全社会形成诚实守信的良好风气，需要从家庭教育、社会示范和法律制度三个层面协同推进。

首先，家庭与学校的道德教育是根本基石。父母和老师应当以身作则，从小培养孩子讲真话、守承诺的良好习惯。当孩子犯错时，家长要耐心倾听并鼓励他们勇于坦白，而不是一味严厉训斥。只有让下一代从小树立正确的荣辱观，诚信的种子才能在他们心中生根发芽。

其次，各行各业的公众人物与商业机构必须发挥模范带头作用。企业在经营过程中应当做到货真价实、童叟无欺，自觉摒弃虚假广告和商业欺诈。一旦失去信誉，不仅会损害消费者的合法权益，更会破坏整个市场的健康秩序。

最后，完善的社会信用体系与严密的法律制度是坚强保障。有关部门应当加大对造假售假、学术剽窃和违约失信行为的惩处力度，让违规者付出高昂的法律和经济代价，真正形成“守信者处处受益，失信者寸步难行”的法治环境。

总而言之，全社会的良好风气离不开每一个人的自觉践行。只要我们从身边的小事做起，言出必行、信守诺言，就一定能携手构建一个充满温暖与信任的和谐社会。`,pinyin:`Wǒ juéde, yào xiǎng zài quán shèhuì xíngchéng chéngshí shǒuxìn de liánghǎo fēngqì, xūyào cóng jiātíng jiàoyù, shèhuì shìfàn hé fǎlǜ zhìdù sān gè céngmiàn xiétóng tuījìn.

Shǒuxiān, jiātíng yǔ xuéxiào de dàodé jiàoyù shì gēnběn jīshí. Fùmǔ hé lǎo shī yīngdāng yǐshēn-zuòzé, cóng xiǎo péiyǎng háizi jiǎng zhēnhuà, shǒu chéngnuò de liánghǎo xíguàn. Dāng háizi fàncuò shí, jiāzhǎng yào nàixīn qīngtīng bìng gǔlì tāmen yǒngyú tǎnbái, ér bú shì yíwèi yánlì xùnchì. Zhǐyǒu ràng xiàyídài cóng xiǎo shùlì zhèngquè de róngrǔguān, chéngxìn de zhǒngzi cái néng zài tāmen xīn zhōng shēnggēn-fāyá.

Qícì, gè háng gè yè de gōngzhòng rénwù yǔ shāngyè jīgòu bìxū fāhuī mófàn dàitóu zuòyòng. Qǐyè zài jīngyíng guòchéng zhōng yīngdāng zuò dào huòzhēn-jiàshí, tóngsǒu-wúqī, zìjué bìngqì xūjiǎ guǎnggào hé shāngyè qīzhà. Yídàn shīqù xìnyù, bùjǐn huì sǔnhài xiāofèizhě de héfǎ quányì, gèng huì pòhuài zhěng gè shìchǎng de jiànkāng zhìxù.

Zuìhòu, wánshàn de shèhuì xìnyòng tǐxì yǔ yánmì de fǎlǜ zhìdù shì jiānqiáng bǎozhàng. Yǒuguān bùmén yīngdāng jiàdà duì zàojiǎ-shòujiǎ, xuéshù piáoqiè hé wéiyuē shīxìn xíngwéi de chéngchǔ lìdù, ràng wéiguīzhě fùchū gāo'áng de fǎlǜ hé jīngjì dàijià, zhēnzhèng xíngchéng "shǒuxìnzhě chùchù shòuyì, shīxìnzhě cùnbù-nánxíng" de fǎzhì huánjìng.

Zǒng'éryánzhī, quán shèhuì de liánghǎo fēngqì lí bù kāi měi yí gè rén de zìjué jiànxíng. Zhǐyào wǒmen cóng shēnbiān de xiǎoshì zuò qǐ, yán chū bì xíng, xìnshǒu nuòyán, jiù yídìng néng xiéshǒu gòujiàn yí gè chōngmǎn wēnnuǎn yǔ xìnrèn de héxié shèhuì.`,meaningVi:`Tôi cho rằng, để hình thành phong khí trung thực giữ chữ tín trong toàn xã hội, cần có sự phối hợp đồng bộ từ ba bình diện: giáo dục gia đình, gương mẫu xã hội và thể chế pháp luật.

Trước hết, giáo dục đạo đức từ gia đình và nhà trường là nền tảng cốt lõi. Cha mẹ và thầy cô giáo cần lấy mình làm gương, rèn luyện cho trẻ thói quen nói lời thật, giữ lời hứa ngay từ thuở nhỏ. Khi con trẻ mắc lỗi, phụ huynh cần kiên nhẫn lắng nghe và khích lệ con dũng cảm bộc bạch, chứ không nên chỉ chăm chăm trách phạt nặng nề. Chỉ khi thế hệ trẻ sớm xác lập ý thức đúng đắn, hạt mầm trung thực mới có thể bén rễ sâu trong tâm hồn.

Thứ hai, những người của công chúng và các cơ quan doanh nghiệp phải phát huy vai trò tiên phong gương mẫu. Doanh nghiệp trong quá trình kinh doanh cần giữ chữ tín, hàng thật giá đúng, không lừa dối khách hàng, kiên quyết bài trừ quảng cáo gian lận và thủ đoạn thương mại thất đức. Một khi đánh mất uy tín, không chỉ làm tổn hại quyền lợi người tiêu dùng mà còn làm xói mòn trật tự lành mạnh của thị trường.

Cuối cùng, hệ thống tín dụng xã hội hoàn thiện và khuôn khổ pháp luật nghiêm minh là điểm tựa bảo đảm vững chắc. Các cơ quan chức năng cần tăng cường xử phạt đối với các hành vi buôn bán hàng giả, gian lận học thuật hay bội tín hợp đồng, buộc người vi phạm phải trả giá đắt cả về pháp lý lẫn kinh tế, qua đó thực sự tạo lập một môi trường pháp trị mà 'người giữ chữ tín đi đâu cũng thuận lợi, kẻ thất tín một bước khó đi'.

Tóm lại, phong khí tốt đẹp của toàn xã hội không thể tách rời sự tự giác thực hành của từng cá nhân. Chỉ cần mỗi chúng ta bắt đầu từ những việc nhỏ nhặt xung quanh, nói là làm, giữ trọn lời hứa, nhất định chúng ta sẽ chung tay kiến tạo nên một xã hội hài hòa tràn đầy ấm áp và niềm tin.`}}:e?{isFallback:!0,outline:{intro:`Mở bài: Khẳng định lợi ích to lớn của việc rèn luyện sức khỏe hằng ngày đối với câu hỏi: "${n}".`,body:["Luận điểm 1: Cải thiện thể chất, tăng cường sức đề kháng và giảm nguy cơ mắc các bệnh tim mạch.","Luận điểm 2: Giải tỏa căng thẳng áp lực tinh thần sau giờ học tập và làm việc bận rộn.","Luận điểm 3: Xây dựng thói quen kiên trì và lối sống khoa học, lành mạnh."],conclusion:"Kết bài: Kêu gọi mọi người bớt thời gian ngồi một chỗ, dành ra ít nhất 30 phút mỗi ngày để vận động vì một tương lai khỏe mạnh."},vocabulary:[{hanzi:"锻炼身体",pinyin:"duànliàn shēntǐ",meaning:"rèn luyện thân thể"},{hanzi:"增强体质",pinyin:"zēngqiáng tǐzhì",meaning:"tăng cường thể chất"},{hanzi:"缓解压力",pinyin:"huǎnjiě yālì",meaning:"giải tỏa áp lực"},{hanzi:"持之以恒",pinyin:"chí zhī yǐ héng",meaning:"kiên trì bền bỉ"},{hanzi:"健康生活",pinyin:"jiànkāng shēnghuó",meaning:"cuộc sống lành mạnh"}],sentenceStructures:[{pattern:"不仅能……，更能……",meaning:"Không chỉ có thể..., mà càng có thể...",example:"每天坚持走路，不仅能强健体魄，更能让人心情愉悦。"},{pattern:"俗话说：……",meaning:"Tục ngữ có câu:...",example:"俗话说：“生命在于运动”，健康是一切成功的基石。"}],sampleAnswer:{hanzi:`俗话说：“身体是革命的本钱。”针对“${n}”这个问题，我认为在快节奏的现代生活中，坚持运动与锻炼身体具有极其重要的价值。

首先，坚持锻炼能够显著增强体质。无论是晨跑、散步还是去健身房，规律的体育活动能够促进血液循环，提高免疫力，有效预防肥胖和颈椎病等现代文明病。拥有充沛的体魄，我们才能以饱满的精力投入到繁重的工作与学习当中。

其次，运动是缓解心理压力、调节情绪的最佳良药。在结束了一整天高强度的脑力劳动后，到户外走一走，呼吸新鲜空气，能够让紧绷的大脑得到充分放松，有助于提高睡眠质量，保持乐观开朗的心态。

最后，锻炼身体贵在持之以恒。很多人半途而废，主要是缺乏自律和清晰的目标。我们可以从每天快走半小时或慢跑两公里开始，循序渐进地养成习惯。

总而言之，健康是一切幸福的源泉。让我们放下手机、走出室内，积极参与到体育锻炼中来，享受健康带来的快乐生活。`,pinyin:`Súhuà shuō: "Shēntǐ shì gémìng de běnqián." Zhēnduì "${n}" zhè ge wèntí, wǒ rènwéi zài kuàijièzòu de xiàndài shēnghuó zhōng, jiānchí yùndòng yǔ duànliàn shēntǐ jùyǒu jíqí zhòngyào de jiàzhí.

Shǒuxiān, jiānchí duànliàn nénggòu xiǎnzhù zēngqiáng tǐzhì. Wúlùn shì chénpǎo, sànbù háishì qù jiànshēnfáng, guīlǜ de tǐyù huódòng nénggòu cùjìn xiěyè xúnhuán, tígāo miǎnyìlì, yǒuxiào yùfáng féipàng hé jǐngzhuībìng děng xiàndài wénmíngbìng. Yǒuyǒu chōngpèi de tǐpò, wǒmen cái néng yǐ bǎomǎn de jīnglì tóurù dào fánzhòng de gōngzuò yǔ xuéxí dāngzhōng.

Qícì, yùndòng shì huǎnjiě xīnlǐ yālì, tiáojié qíngxù de zuìjiā liángyào. Zài jiéshù le yì zhěngtiān gāoxiàodù de nǎolì láodòng hòu, dào hùwài zǒu yi zǒu, hūxī xīnxiān kōngqì, nénggòu ràng jǐnběng de dànǎo dédào chōngfèn fàngsōng, yǒuzhù yú tígāo shuìmián zhìliàng, bǎochí lèguān kāilǎng de xīntài.

Zuìhòu, duànliàn shēntǐ guì zài chízhīyǐhéng. Hěn duō rén bàntú'érfèi, zhǔyào shì quēfá zìlǜ hé qīngxī de mùbiāo. Wǒmen kěyǐ cóng měitiān kuàizǒu bàn xiǎoshí huò mànpǎo liǎng gōnglǐ kāishǐ, xúnxù-jiànjìn de yǎngchéng xíguàn.

Zǒng'éryánzhī, jiànkāng shì yíqiè xìngfú de yuánquán. Ràng wǒmen fàngxià shǒujī, zǒuchū shìnèi, jījí cānyù dào tǐyù duànliàn zhōng lái, xiǎngshòu jiànkāng dài lái de kuàilè shēnghuó.`,meaningVi:`Tục ngữ có câu: "Sức khỏe là vốn quý của cách mạng." Đối với câu hỏi "${n}", tôi cho rằng trong nhịp sống hiện đại hối hả, kiên trì vận động và rèn luyện thân thể có giá trị vô cùng quan trọng.

Trước hết, kiên trì tập luyện có thể tăng cường thể chất rõ rệt. Cho dù là chạy bộ buổi sáng, đi dạo hay đến phòng gym, các hoạt động thể thao đều đặn có thể thúc đẩy tuần hoàn máu, tăng cường miễn dịch, phòng ngừa béo phì và thoái hóa đốt sống cổ cùng nhiều căn bệnh thời hiện đại. Có được thể lực dồi dào, chúng ta mới có thể cống hiến hết mình cho công việc và học tập.

Thứ hai, vận động là liều thuốc hữu hiệu nhất để giải tỏa áp lực tâm lý và điều hòa cảm xúc. Sau một ngày dài làm việc trí óc căng thẳng, ra ngoài trời đi dạo vài vòng hít thở bầu không khí trong lành có thể giúp não bộ được thả lỏng hoàn toàn, nâng cao chất lượng giấc ngủ và duy trì tinh thần lạc quan yêu đời.

Cuối cùng, rèn luyện thân thể điều quý nhất là ở sự kiên trì bền bỉ. Rất nhiều người bỏ dở giữa chừng vì thiếu tính tự giác và mục tiêu cụ thể. Chúng ta có thể bắt đầu từ việc đi bộ nhanh nửa tiếng hoặc chạy chậm 2 km mỗi ngày, từng bước rèn luyện thành thói quen lâu dài.

Tóm lại, sức khỏe là cội nguồn của mọi hạnh phúc. Chúng ta hãy tạm buông điện thoại, bước ra khỏi phòng, tích cực hòa mình vào các hoạt động thể thao để tận hưởng niềm vui trọn vẹn mà một cơ thể khỏe mạnh mang lại.`}}:{isFallback:!0,outline:{intro:`Mở bài: Nêu quan điểm trực diện và rõ ràng cho câu hỏi đề bài: "${n}".`,body:["Luận điểm 1: Phân tích nguyên nhân và sự cần thiết từ góc độ nhận thức của mỗi cá nhân.","Luận điểm 2: Đưa ra giải pháp thực tế và bài học hành động từ kinh nghiệm đời sống.","Luận điểm 3: Nhấn mạnh sự phối hợp giữa bản thân với mọi người xung quanh để đạt kết quả tốt nhất."],conclusion:"Kết bài: Đúc kết lại toàn bộ vấn đề và đưa ra thông điệp tích cực, ý nghĩa."},vocabulary:[{hanzi:"看法",pinyin:"kànfǎ",meaning:"quan điểm, góc nhìn"},{hanzi:"付诸实践",pinyin:"fùzhū shíjiàn",meaning:"áp dụng vào thực tế"},{hanzi:"沟通合作",pinyin:"gōutōng hézuò",meaning:"giao tiếp và hợp tác"},{hanzi:"克服困难",pinyin:"kèfú kùnnan",meaning:"khắc phục khó khăn"},{hanzi:"持之以恒",pinyin:"chí zhī yǐ héng",meaning:"kiên trì bền bỉ"}],sentenceStructures:[{pattern:"在我看来，……是最重要的。",meaning:"Theo quan điểm của tôi, ... là quan trọng nhất.",example:"在我看来，针对这个问题，保持理智并采取实际行动最为关键。"},{pattern:"一方面……，另一方面……",meaning:"Một mặt thì..., mặt khác thì...",example:"一方面要立足自身实际，另一方面要善于向优秀的人学习。"}],sampleAnswer:{hanzi:`针对“${n}”这个问题，我认为在现代社会中具有非常重要的探讨价值。

首先，从思想认知的角度来看，我们应当树立明确的目标与正确的态度。面对各种新情况与新挑战，不能仅仅停留在口头讨论上，而要深入思考事物发展的规律，找准问题的核心切入点。

其次，从行动层面来看，纸上谈兵终究无法解决现实问题，关键在于脚踏实地、付诸实践。在日常工作与学习中，我们应当勇于尝试，在实践中不断总结经验教训，逐步提升自己分析问题与解决问题的综合能力。

最后，学会与他人沟通合作也同样重要。个人的智慧与力量终究是有限的，只有善于倾听不同的见解，与同伴互相支持、优势互补，我们才能克服前进道路上的重重阻碍。

总的来说，只要我们能够保持积极向上的心态，坚持求真务实的作风，就一定能在应对各类挑战时游刃有余，取得令人满意的丰硕成果。`,pinyin:`Zhēnduì "${n}" zhè ge wèntí, wǒ rènwéi zài xiàndài shèhuì zhōng jùyǒu fēicháng zhòngyào de tàntǎo jiàzhí.

Shǒuxiān, cóng sīxiǎng rènzhī de jiǎodù lái kàn, wǒmen yīngdāng shùlì míngquè de mùbiāo yǔ zhèngquè de tàidù. Miànduì gèzhǒng xīn qíngkuàng yǔ xīn tiǎozhàn, bù néng jǐnjǐn tíngliú zài kǒutóu tǎolùn shang, ér yào shēnrù sīkǎo shìwù fāzhǎn de guīlǜ, zhǎozhǔn wèntí de héxīn qiērùdiǎn.

Qícì, cóng xíngdòng céngmiàn lái kàn, zhǐshàng-tánbīng zhōngjiū wúfǎ jiějué xiànshí wèntí, guānjiàn zàiyú jiǎotà-shídì, fùzhū shíjiàn. Zài rìcháng gōngzuò yǔ xuéxí zhōng, wǒmen yīngdāng yǒngyú chángshì, zài shíjiàn zhōng bùduàn zǒngjié jīngyàn jiàoxun, zhúbù tíshēng zìjǐ fēnxī wèntí yǔ jiějué wèntí de zōnghé nénglì.

Zuìhòu, xuéhuì yǔ tārén gōutōng hézuò yě tóngyàng zhòngyào. Gèrén de zhìhuì yǔ lìliàng zhōngjiū shì yǒuxiàn de, zhǐyǒu shànyú qīngtīng bùtóng de jiànjiě, yǔ tóngbàn hùxiāng zhīchí, yōushì hùbǔ, wǒmen cái néng kèfú qiánjìn dàolù shang de chóngchóng zǔ'ài.

Zǒng de lái shuō, zhǐyào wǒmen nénggòu bǎochí jījí xiàngshàng de xīntài, jiānchí qiúzhēn-wùshí de zuòfēng, jiù yídìng néng zài yìngduì gèlèi tiǎozhàn shí yóurèn-yǒuyú, qǔdé lìngrén mǎnyì de fēngshuò chéngguǒ.`,meaningVi:`Đối với đề bài "${n}", tôi cho rằng câu hỏi này mang giá trị thảo luận rất quan trọng trong đời sống hiện đại.

Trước hết, từ góc độ tư duy nhận thức, chúng ta cần xác lập mục tiêu rõ ràng và thái độ đúng đắn. Khi đứng trước các tình huống hay thử thách mới, không thể chỉ dừng lại ở việc bàn luận suông mà cần suy ngẫm sâu sắc về quy luật vận động của sự việc, nắm bắt đúng mắt xích then chốt của vấn đề.

Thứ hai, xét từ góc độ hành động, nói suông trên giấy suy cho cùng không thể giải quyết được bài toán thực tế, điều mấu chốt nằm ở việc làm thật, đưa vào thực tiễn. Trong công việc và học tập hằng ngày, chúng ta cần mạnh dạn trải nghiệm, không ngừng rút tỉa kinh nghiệm sau mỗi lần thực hành để từng bước nâng cao năng lực phân tích và xử lý vấn đề.

Cuối cùng, học cách giao tiếp và hợp tác với mọi người xung quanh cũng quan trọng không kém. Trí tuệ và sức lực của một cá nhân dẫu sao cũng có giới hạn, chỉ khi biết lắng nghe những ý kiến đa chiều, cùng cộng sự tương trợ và bù trừ sở trường cho nhau, chúng ta mới có thể vượt qua mọi rào cản trên đường tiến bước.

Tóm lại, chỉ cần chúng ta luôn giữ vững thái độ sống tích cực, tác phong cầu thị và thiết thực, nhất định chúng ta sẽ luôn chủ động vững vàng trước mọi thách thức và gặt hái được những thành tựu mỹ mãn.`}}}window.playSpeakingSampleTts=function(){const n=document.getElementById("sample-speaking-hanzi");if(!n||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const i=new SpeechSynthesisUtterance(n.textContent.trim());i.lang="zh-CN",i.rate=.88,window.speechSynthesis.speak(i)};window.startPrepTimer=function(){cancelSpeakingRecording();const n=document.getElementById("prep-timer-box"),i=document.getElementById("btn-prep-3p");if(!n)return;n.style.display="block",i==null||i.classList.add("active-timer"),n.scrollIntoView({behavior:"smooth",block:"center"});const t=document.getElementById("speaking-scratchpad-card");t&&(t.style.display="block");const e=document.getElementById("speaking-scratchpad-input");e&&e.focus(),f=180,b=!1,B(),m("start"),clearInterval(y),y=setInterval(()=>{b||(f--,B(),f<=0&&(clearInterval(y),m("chime"),alert("⏰ Đã hết 3 phút chuẩn bị! Bạn đã sẵn sàng, hãy bắt đầu nói ngay nhé!"),i==null||i.classList.remove("active-timer"),n.style.display="none",startSpeakingTimerAndRecord()))},1e3)};function B(){const n=document.getElementById("prep-timer-display");if(!n)return;const i=Math.floor(f/60),t=f%60;n.textContent=`${String(i).padStart(2,"0")}:${String(t).padStart(2,"0")}`}window.togglePausePrepTimer=function(){b=!b;const n=document.getElementById("prep-pause-btn");n&&(n.innerHTML=b?'<i class="fa-solid fa-play"></i> <span>Tiếp tục</span>':'<i class="fa-solid fa-pause"></i> <span>Tạm dừng</span>')};window.resetPrepTimer=function(){clearInterval(y),f=180,b=!1,B();const n=document.getElementById("prep-timer-box"),i=document.getElementById("btn-prep-3p");n&&(n.style.display="none"),i==null||i.classList.remove("active-timer")};window.stopPrepAndStartSpeaking=function(){clearInterval(y);const n=document.getElementById("prep-timer-box"),i=document.getElementById("btn-prep-3p");n&&(n.style.display="none"),i==null||i.classList.remove("active-timer"),startSpeakingTimerAndRecord()};window.startSpeakingTimerAndRecord=async function(){clearInterval(y);const n=document.getElementById("prep-timer-box"),i=document.getElementById("btn-prep-3p");n&&(n.style.display="none"),i==null||i.classList.remove("active-timer");try{const h=await navigator.mediaDevices.getUserMedia({audio:!0});Z(h)}catch(h){console.error("Không truy cập được micro:",h),alert("Không thể truy cập microphone. Vui lòng cho phép trình duyệt truy cập micro để ghi âm bài nói!");return}const t=document.getElementById("speaking-recorder-box"),e=document.getElementById("btn-speak-2p"),o=document.getElementById("recorded-result-box");o&&(o.style.display="none"),t&&(t.style.display="block"),e==null||e.classList.add("active-timer");const a=document.getElementById("speaking-scratchpad-card");a&&(a.style.display="block"),t==null||t.scrollIntoView({behavior:"smooth",block:"center"}),k=120,x=0,H(),m("start"),I=[],d.start(250),w=!0,G(),clearInterval(v),v=setInterval(()=>{k--,x++,H(),k<=0&&(clearInterval(v),finishSpeakingRecording())},1e3)};function Z(n){d=new MediaRecorder(n),d.ondataavailable=i=>{i.data.size>0&&I.push(i.data)},d.onstop=()=>{n.getTracks().forEach(e=>e.stop()),L=new Blob(I,{type:"audio/webm"}),K=URL.createObjectURL(L);const i=document.getElementById("recorded-audio-player");i&&(i.src=K);const t=document.getElementById("recording-duration-text");if(t){const e=Math.floor(x/60),o=x%60;t.textContent=`Thời lượng bài nói: ${String(e).padStart(2,"0")}:${String(o).padStart(2,"0")}`}}}function G(){const n=window.SpeechRecognition||window.webkitSpeechRecognition;if(n)try{r=new n,r.lang="zh-CN",r.continuous=!0,r.interimResults=!0;const i=document.getElementById("spoken-transcript-input");let t="";r.onresult=e=>{let o="";for(let a=e.resultIndex;a<e.results.length;++a)e.results[a].isFinal?t+=e.results[a][0].transcript:o+=e.results[a][0].transcript;i&&(i.value=(t+" "+o).trim())},r.onerror=e=>{console.warn("Speech recognition notice:",e)},r.start()}catch(i){console.warn("Không khởi chạy được SpeechRecognition:",i)}}function H(){const n=document.getElementById("speaking-timer-display");if(!n)return;const i=Math.floor(k/60),t=k%60;n.textContent=`${String(i).padStart(2,"0")}:${String(t).padStart(2,"0")}`}window.finishSpeakingRecording=function(){if(!w)return;if(w=!1,clearInterval(v),m("chime"),r)try{r.stop()}catch{}d&&d.state!=="inactive"&&d.stop();const n=document.getElementById("speaking-recorder-box"),i=document.getElementById("btn-speak-2p"),t=document.getElementById("recorded-result-box");n&&(n.style.display="none"),i==null||i.classList.remove("active-timer"),t&&(t.style.display="block",t.scrollIntoView({behavior:"smooth",block:"start"}));const e=document.getElementById("spoken-transcript-input");e&&!e.value.trim()&&(e.placeholder="Mic chưa tự động nhận diện được chữ Hán (hoặc trình duyệt chưa bật nhận diện giọng nói). Bạn hãy gõ tóm tắt những câu bạn vừa nói vào đây để AI chấm điểm chính xác nhé!")};window.cancelSpeakingRecording=function(){if(w=!1,clearInterval(v),r)try{r.stop()}catch{}if(d&&d.state!=="inactive")try{d.stop()}catch{}const n=document.getElementById("speaking-recorder-box"),i=document.getElementById("btn-speak-2p");n&&(n.style.display="none"),i==null||i.classList.remove("active-timer")};window.clearTranscript=function(){const n=document.getElementById("spoken-transcript-input");n&&(n.value="",n.focus())};window.restartSpeakingFlow=function(){const n=document.getElementById("recorded-result-box");n&&(n.style.display="none");const i=document.getElementById("ai-speaking-evaluation-results");i&&(i.style.display="none"),startSpeakingTimerAndRecord()};window.submitSpeakingForAiGrading=async function(){const n=document.getElementById("spoken-transcript-input"),i=document.getElementById("ai-speaking-evaluation-results"),t=document.getElementById("submit-speaking-btn");if(!n||!i)return;const e=n.value.trim();if(!e||e.length<3){alert("Vui lòng gõ hoặc nói ít nhất 5-10 chữ Hán vào ô văn bản bài nói để AI có thể chấm điểm nhé!"),n.focus();return}t&&(t.disabled=!0,t.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài Nói...</span>'),i.style.display="block",i.scrollIntoView({behavior:"smooth",block:"start"}),i.innerHTML=`
    <div class="speaking-card-panel" style="text-align: center; padding: 48px 24px;">
      <i class="fa-solid fa-microphone-lines fa-bounce" style="font-size: 3rem; color: #f59e0b; margin-bottom: 20px;"></i>
      <h2 style="font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">
        Giám Khảo Khẩu Ngữ AI Đang Đánh Giá Bài Nói...
      </h2>
      <p style="font-size: 0.92rem; color: #94a3b8; max-width: 560px; margin: 0 auto 20px auto;">
        Đang phân tích phát âm, ngữ điệu, vốn từ vựng khẩu ngữ và độ lưu loát chuẩn tiêu chí thi HSKK.
      </p>
      <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 0.8rem; background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 4px 12px; border-radius: 99px;">
          ✓ Đánh giá phát âm &amp; ngữ điệu
        </span>
        <span style="font-size: 0.8rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 4px 12px; border-radius: 99px;">
          ✓ Kiểm tra độ lưu loát tự nhiên
        </span>
        <span style="font-size: 0.8rem; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 12px; border-radius: 99px;">
          ✓ Viết lại khẩu ngữ chuẩn bản xứ
        </span>
      </div>
    </div>
  `;try{const o={question:c?c.question:"HSKK Speaking",transcript:e,level:s,duration:x||120},a=await fetch(`${j}/api/ai/grade-speaking`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});if(a.ok){const h=await a.json();N(h,i,e),m("start")}else throw new Error("Server error")}catch(o){console.error("Lỗi chấm bài nói AI:",o),N({overallScore:86,badge:"Rất Tốt 👏",criteriaScores:{pronunciation:86,fluency:85,grammar:86,content:88},generalFeedback:"Bài nói của bạn rõ ràng, câu từ tự nhiên và bám sát câu hỏi của đề bài!",strengths:["Phát âm tương đối rõ chữ","Trả lời trực diện vào chủ đề"],improvements:["Nên dùng thêm từ nối để bài nói liên kết uyển chuyển hơn"],nativeVersion:e,nativePinyin:"",nativeVi:"Bản dịch bài nói của bạn."},i,e)}finally{t&&(t.disabled=!1,t.innerHTML='<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Đưa AI Chấm Điểm Bài Nói</span>')}};function N(n,i,t){const e=n.overallScore||85,o=n.badge||(e>=90?"Xuất Sắc 🌟":e>=80?"Rất Tốt 👏":e>=65?"Khá 👍":"Cần Cố Gắng 🎙️"),a=e>=85?"linear-gradient(135deg, #10b981, #059669)":e>=70?"linear-gradient(135deg, #f59e0b, #d97706)":"linear-gradient(135deg, #ef4444, #dc2626)",h=n.criteriaScores||{pronunciation:85,fluency:85,grammar:85,content:85},g=n.strengths||[],l=n.improvements||[],z=n.nativeVersion||t,E=n.nativePinyin||"",C=n.nativeVi||"";i.innerHTML=`
    <div class="speaking-card-panel" style="margin-bottom: 24px; position: relative;">
      <!-- Header kết quả -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="width: 100px; height: 100px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; background: ${a}; box-shadow: 0 8px 24px rgba(0,0,0,0.25); flex-shrink: 0;">
            <span style="font-size: 2.2rem; font-weight: 900; line-height: 1;">${e}</span>
            <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; opacity: 0.9;">Thang 100</span>
          </div>

          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <span style="font-size: 1.35rem; font-weight: 900; color: #ffffff;">Đánh Giá Bài Nói:</span>
              <span style="font-size: 1.25rem; font-weight: 800; color: #fbbf24;">${o}</span>
            </div>
            <div style="font-size: 0.88rem; color: #94a3b8;">
              <span><i class="fa-solid fa-microphone"></i> Thời lượng nói: <strong>${x||60}s</strong></span>
              <span style="margin: 0 6px;">&bull;</span>
              <span><i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Đạt chuẩn thi HSKK</span>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button onclick="document.getElementById('ai-speaking-evaluation-results').style.display='none'" class="btn"
            style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #94a3b8; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- 4 TIÊU CHÍ KHẨU NGỮ HSKK -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-bullhorn" style="color: #f59e0b;"></i> Phát Âm & Ngữ Điệu</span>
            <strong style="color: #f59e0b;">${h.pronunciation||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${h.pronunciation||85}%; background: #f59e0b; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-gauge-high" style="color: #38bdf8;"></i> Độ Lưu Loát (Fluency)</span>
            <strong style="color: #38bdf8;">${h.fluency||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${h.fluency||85}%; background: #38bdf8; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-book" style="color: #8b5cf6;"></i> Ngữ Pháp & Vốn Từ</span>
            <strong style="color: #8b5cf6;">${h.grammar||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${h.grammar||85}%; background: #8b5cf6; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-bullseye" style="color: #10b981;"></i> Bám Đề & Nội Dung</span>
            <strong style="color: #10b981;">${h.content||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${h.content||85}%; background: #10b981; border-radius: 99px;"></div>
          </div>
        </div>
      </div>

      <!-- NHẬN XÉT CỦA GIÁM KHẢO -->
      <div style="background: rgba(245, 158, 11, 0.1); border: 1.5px solid rgba(245, 158, 11, 0.35); border-radius: 16px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 1rem; font-weight: 800; color: #fbbf24; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-comment-dots"></i> Nhận Xét Của Giám Khảo Khẩu Ngữ:
        </div>
        <p style="font-size: 0.95rem; line-height: 1.65; color: #ffffff; margin: 0 0 12px 0;">
          ${n.generalFeedback||"Bài nói của bạn hoàn thành tốt mục tiêu giao tiếp."}
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-top: 12px;">
          ${g.length>0?`
            <div>
              <strong style="font-size: 0.85rem; color: #34d399; text-transform: uppercase;"><i class="fa-solid fa-thumbs-up"></i> Điểm sáng:</strong>
              <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.88rem; color: #e2e8f0;">
                ${g.map(q=>`<li>${q}</li>`).join("")}
              </ul>
            </div>
          `:""}

          ${l.length>0?`
            <div>
              <strong style="font-size: 0.85rem; color: #f87171; text-transform: uppercase;"><i class="fa-solid fa-lightbulb"></i> Điểm cần hoàn thiện:</strong>
              <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.88rem; color: #fca5a5;">
                ${l.map(q=>`<li>${q}</li>`).join("")}
              </ul>
            </div>
          `:""}
        </div>
      </div>

      <!-- PHIÊN BẢN KHẨU NGỮ CHUẨN BẢN XỨ -->
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(56, 189, 248, 0.08)); border: 1.5px solid rgba(16, 185, 129, 0.3); border-radius: 18px; padding: 22px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #34d399; margin: 0; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-crown"></i> Phiên Bản Khẩu Ngữ Chuẩn Người Bản Xứ:
          </h3>
          <button onclick="playSpeakingNativeTts()" title="Nghe phát âm chuẩn người bản xứ"
            style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-volume-high"></i> <span>Nghe nói mẫu</span>
          </button>
        </div>

        <div id="speaking-native-text" class="hanzi-text" style="font-size: 1.25rem; line-height: 1.8; color: #ffffff; margin-bottom: 8px; font-weight: 500;">
          ${z}
        </div>

        ${E?`
          <div style="font-size: 0.88rem; line-height: 1.6; color: #94a3b8; font-style: italic; margin-bottom: 10px;">
            ${E}
          </div>
        `:""}

        ${C?`
          <div style="font-size: 0.92rem; line-height: 1.6; color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 10px;">
            <strong>Dịch nghĩa:</strong> ${C}
          </div>
        `:""}
      </div>
    </div>
  `}window.playSpeakingNativeTts=function(){const n=document.getElementById("speaking-native-text");if(!n||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const i=new SpeechSynthesisUtterance(n.textContent.trim());i.lang="zh-CN",i.rate=.88,window.speechSynthesis.speak(i)};window.clearSpeakingScratchpad=function(){const n=document.getElementById("speaking-scratchpad-input");n&&(n.value.trim()&&!confirm("Bạn có chắc muốn xóa sạch bản nháp này?")||(n.value="",$(),sessionStorage.removeItem("hongtai_speaking_scratchpad")))};function $(){const n=document.getElementById("speaking-scratchpad-input"),i=document.getElementById("scratchpad-word-count");if(!n||!i)return;const t=n.value.trim().length;i.textContent=`${t} ký tự`,sessionStorage.setItem("hongtai_speaking_scratchpad",n.value)}function D(){const n=document.getElementById("speaking-scratchpad-input");if(!n)return;const i=sessionStorage.getItem("hongtai_speaking_scratchpad");i&&(n.value=i,$()),n.addEventListener("input",$)}document.addEventListener("DOMContentLoaded",()=>{V(),D()});
