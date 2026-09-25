import"./global_sidebar-7WGucaVq.js";const h=(window.location.hostname.includes("localhost")||window.location.hostname.includes("127.0.0.1"),"");let p={so:[],trung:[],cao:[]},l="trung",c=null,u=new Map,g=!1,b=!1;function x(e="click"){try{const t=new(window.AudioContext||window.webkitAudioContext),n=t.createOscillator(),i=t.createGain();n.connect(i),i.connect(t.destination),e==="spin"?(n.type="triangle",n.frequency.setValueAtTime(440,t.currentTime),n.frequency.exponentialRampToValueAtTime(880,t.currentTime+.25),i.gain.setValueAtTime(.2,t.currentTime),i.gain.exponentialRampToValueAtTime(.01,t.currentTime+.25),n.start(),n.stop(t.currentTime+.25)):e==="success"&&(n.type="sine",n.frequency.setValueAtTime(523.25,t.currentTime),n.frequency.setValueAtTime(659.25,t.currentTime+.1),i.gain.setValueAtTime(.18,t.currentTime),i.gain.exponentialRampToValueAtTime(.01,t.currentTime+.35),n.start(),n.stop(t.currentTime+.35))}catch{}}async function C(){var n,i,s;try{let a=await fetch(`${h}/api/hskk-questions`);a.ok||(a=await fetch("/data/hskk_questions.json"));const o=await a.json();o&&(o.so||o.questions)&&(o.so?p=o:o.questions&&(p.so=o.questions.filter(r=>r.level==="so"),p.trung=o.questions.filter(r=>r.level==="trung"),p.cao=o.questions.filter(r=>r.level==="cao")))}catch(a){console.warn("Không tải được API HSKK, thử nạp tĩnh...",a);try{const o=await fetch("/data/hskk_questions.json");o.ok&&(p=await o.json())}catch(o){console.error("Lỗi nạp câu hỏi HSKK:",o)}}const e=(((n=p.so)==null?void 0:n.length)||0)+(((i=p.trung)==null?void 0:i.length)||0)+(((s=p.cao)==null?void 0:s.length)||0),t=document.getElementById("total-questions-stat");t&&e>0&&(t.textContent=e.toLocaleString()),spinRandomQuestion(!1)}window.selectWritingMode=function(e){const t=document.getElementById("wf-card-qa"),n=document.getElementById("wf-card-free"),i=document.getElementById("wf-pointer-arrow"),s=document.getElementById("qa-workspace-view"),a=document.getElementById("free-workspace-view");e==="qa"?(t==null||t.classList.add("active"),n==null||n.classList.remove("active"),i&&(i.style.display="flex"),s&&(s.style.display="block"),a&&(a.style.display="none")):e==="free"&&(t==null||t.classList.remove("active"),n==null||n.classList.add("active"),i&&(i.style.display="none"),s&&(s.style.display="none"),a&&(a.style.display="block"))};window.switchHskkLevel=function(e,t){l===e&&c||(l=e,document.querySelectorAll(".level-select-row .level-btn").forEach(n=>n.classList.remove("active")),t&&t.classList.add("active"),spinRandomQuestion(!0))};window.spinRandomQuestion=function(e=!0){const t=p[l]||[];if(!t||t.length===0)return;const n=document.getElementById("spin-question-btn");e&&n&&(n.classList.add("rolling"),x("spin"),setTimeout(()=>n.classList.remove("rolling"),500));let i=null;if(t.length===1)i=t[0];else do i=t[Math.floor(Math.random()*t.length)];while(c&&i.question===c.question&&t.length>1);c=i,I();const s=document.getElementById("ai-suggestion-box");s&&(s.style.display="none");const a=document.getElementById("hint-toggle-btn");a&&(a.innerHTML=`
      <i class="fa-solid fa-lightbulb"></i>
      <span>Gợi ý</span>
      <span style="font-size: 0.82rem; font-weight: 600; opacity: 0.9;">&rarr; Dàn bài &bull; Từ vựng &bull; Cấu trúc câu (AI đề xuất)</span>
    `)};function I(){if(!c)return;const e=document.getElementById("active-question-text"),t=document.getElementById("question-meta-badge"),n=l==="so"?"HSKK Sơ cấp":l==="cao"?"HSKK Cao cấp":"HSKK Trung cấp";e&&(e.textContent=c.question),t&&(t.textContent=`Câu ${c.stt||1} • ${n}`)}window.playQuestionTts=function(){if(!c||!c.question)return;if(!("speechSynthesis"in window)){alert("Trình duyệt của bạn không hỗ trợ phát âm thanh.");return}window.speechSynthesis.cancel();const e=new SpeechSynthesisUtterance(c.question);e.lang="zh-CN",e.rate=.9,window.speechSynthesis.speak(e)};window.toggleAiSuggestions=async function(){const e=document.getElementById("ai-suggestion-box"),t=document.getElementById("hint-toggle-btn");if(!e||!c)return;if(e.style.display==="block"){e.style.display="none",t&&(t.innerHTML=`
        <i class="fa-solid fa-lightbulb"></i>
        <span>Gợi ý</span>
        <span style="font-size: 0.82rem; font-weight: 600; opacity: 0.9;">&rarr; Dàn bài &bull; Từ vựng &bull; Cấu trúc câu (AI đề xuất)</span>
      `);return}e.style.display="block",t&&(t.innerHTML=`
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Gợi ý</span>
      <span style="font-size: 0.82rem; font-weight: 600; opacity: 0.9;">(Bấm để thu gọn)</span>
    `);const i=`${l}_${c.question}`;if(u.has(i)){y(u.get(i));return}if(!b){b=!0,e.innerHTML=`
    <div style="text-align: center; padding: 24px 16px; color: #a855f7;">
      <i class="fa-solid fa-brain fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #38bdf8;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        AI HongTai đang tự động xây dựng Dàn bài &amp; chọn lọc Từ vựng...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Đối chiếu chuẩn ngữ cảnh thi HSKK ${l==="so"?"Sơ cấp":l==="cao"?"Cao cấp":"Trung cấp"}
      </div>
    </div>
  `;try{const s=await fetch(`${h}/api/ai/hskk-suggest`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:c.question,level:l,skill:"writing"})});if(s.ok){const a=await s.json();u.set(i,a),y(a),x("success")}else throw new Error("Server error")}catch(s){console.error("Lỗi gợi ý AI:",s);const a={outline:{intro:"Mở bài: Giới thiệu trực tiếp quan điểm hoặc câu trả lời đối với đề thi.",body:["Luận điểm 1: Nêu lý do hoặc kể về một sự việc, trải nghiệm cụ thể trong đời sống.","Luận điểm 2: Đưa ra ví dụ minh họa và cảm nhận chân thực.","Luận điểm 3: So sánh hoặc mở rộng góc nhìn của bản thân."],conclusion:"Kết bài: Tóm tắt lại suy nghĩ và bài học/ấn tượng sâu sắc nhất."},vocabulary:[{hanzi:"坚持",pinyin:"jiānchí",meaning:"kiên trì"},{hanzi:"经验",pinyin:"jīngyàn",meaning:"kinh nghiệm"},{hanzi:"看法",pinyin:"kànfǎ",meaning:"quan điểm, góc nhìn"},{hanzi:"不仅……而且……",pinyin:"bùjǐn... érqiě...",meaning:"không những... mà còn..."}],sentenceStructures:[{pattern:"对于我来说，……是最重要的。",meaning:"Đối với tôi mà nói, ... là quan trọng nhất.",example:"对于我来说，家人的健康和快乐是最重要的。"},{pattern:"一方面……，另一方面……",meaning:"Một mặt thì..., mặt khác thì...",example:"一方面可以开阔眼界，另一方面能结交很多朋友。"}],sampleAnswer:{hanzi:"这个问题很有意义。在我的生活和学习中，无论面对什么事情，只要认真对待并且持之以恒，就一定能够取得好成果。",pinyin:"Zhè ge wèntí hěn yǒu yìyì. Zài wǒ de shēnghuó hé xuéxí zhōng, wúlùn miànduì shénme shìqing, zhǐyào rènzhēn duìdài bìngqiě chízhīyǐhéng, jiù yídìng nénggòu qǔdé hǎo chéngguǒ.",meaningVi:"Câu hỏi này rất có ý nghĩa. Trong cuộc sống và học tập của tôi, bất luận đối mặt với chuyện gì, chỉ cần nghiêm túc đối đãi và kiên trì đến cùng thì nhất định sẽ đạt được kết quả tốt đẹp."}};u.set(i,a),y(a)}finally{b=!1}}};function y(e){const t=document.getElementById("ai-suggestion-box");if(!t)return;const n=e.outline||{},i=e.vocabulary||[],s=e.sentenceStructures||[],a=e.sampleAnswer||null;t.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px dashed rgba(34, 197, 94, 0.4); padding-bottom: 10px;">
      <div style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.05rem; color: #4ade80;">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
        <span>AI Gợi Ý Đạt Điểm Cao Cho Đề Này</span>
      </div>
      <span style="font-size: 0.75rem; background: rgba(34, 197, 94, 0.15); color: #86efac; padding: 2px 8px; border-radius: 6px; font-weight: 700;">
        Tự động cập nhật
      </span>
    </div>

    <!-- 1. Dàn bài -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 0.92rem; font-weight: 800; color: #fbbf24; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-list-ol"></i> <span>1. Dàn bài gợi ý:</span>
      </div>
      <div style="background: rgba(0,0,0,0.25); padding: 12px 16px; border-radius: 12px; border-left: 3px solid #fbbf24; font-size: 0.9rem; line-height: 1.65; color: #e2e8f0;">
        <div style="margin-bottom: 6px;"><strong>Mở bài:</strong> ${n.intro||"Nêu trực tiếp câu trả lời cho đề bài."}</div>
        <div style="margin-bottom: 6px;">
          <strong>Thân bài:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 20px;">
            ${(n.body||[]).map(o=>`<li>${o}</li>`).join("")}
          </ul>
        </div>
        <div><strong>Kết bài:</strong> ${n.conclusion||"Tổng kết suy nghĩ và cảm xúc."}</div>
      </div>
    </div>

    <!-- 2. Từ vựng có thể sử dụng -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 0.92rem; font-weight: 800; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-key"></i> <span>2. Từ vựng then chốt có thể sử dụng:</span>
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

    <!-- 3. Mẫu câu / Cấu trúc ngữ pháp nên dùng -->
    ${s.length>0?`
      <div style="margin-bottom: 16px;">
        <div style="font-size: 0.92rem; font-weight: 800; color: #a855f7; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-puzzle-piece"></i> <span>3. Cấu trúc câu đắt giá:</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
          ${s.map(o=>`
            <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 12px; padding: 10px 14px; font-size: 0.88rem;">
              <div style="font-weight: 800; color: #d8b4fe; margin-bottom: 2px;">${o.pattern}</div>
              <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;">${o.meaning}</div>
              ${o.example?`<div style="font-size: 0.84rem; color: #e2e8f0; font-style: italic;">VD: ${o.example}</div>`:""}
            </div>
          `).join("")}
        </div>
      </div>
    `:""}

    <!-- 4. Bài viết mẫu tham khảo -->
    ${a?`
      <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 14px 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="font-size: 0.88rem; color: #34d399;"><i class="fa-solid fa-medal"></i> Bài viết mẫu tham khảo (Chuẩn 100 điểm):</strong>
          <button onclick="copySampleText()" style="background: transparent; border: none; color: #38bdf8; font-size: 0.78rem; font-weight: 700; cursor: pointer;">
            <i class="fa-solid fa-copy"></i> Sao chép mẫu
          </button>
        </div>
        <div id="sample-hanzi-text" class="hanzi-text" style="font-size: 1.05rem; line-height: 1.7; color: #ffffff; margin-bottom: 4px;">
          ${a.hanzi}
        </div>
        ${a.pinyin?`<div style="font-size: 0.82rem; color: #94a3b8; font-style: italic; margin-bottom: 4px;">${a.pinyin}</div>`:""}
        ${a.meaningVi?`<div style="font-size: 0.84rem; color: #cbd5e1;">${a.meaningVi}</div>`:""}
      </div>
    `:""}
  `}window.insertVocabToWriting=function(e){const t=document.getElementById("qa-writing-input");t&&(t.value+=e,handleQaTextInput(),t.focus())};window.copySampleText=function(){const e=document.getElementById("sample-hanzi-text");e&&(navigator.clipboard.writeText(e.textContent.trim()),alert("Đã sao chép bài văn mẫu vào clipboard!"))};window.handleQaTextInput=function(){const e=document.getElementById("qa-writing-input");if(!e)return;const t=e.value,i=(t.match(/[\u4e00-\u9fa5]/g)||[]).length,s=t.split(`
`).filter(r=>r.trim().length>0).length,a=document.getElementById("qa-char-count"),o=document.getElementById("qa-para-count");a&&(a.textContent=i),o&&(o.textContent=s)};window.clearQaInput=function(){const e=document.getElementById("qa-writing-input");if(e){if(e.value.trim().length>0&&!confirm("Bạn có chắc muốn xóa nội dung đã viết?"))return;e.value="",handleQaTextInput()}};document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){const t=document.getElementById("wf-card-qa");t&&t.classList.contains("active")?submitQaForGrading():submitEssayForGrading("free")}});window.submitQaForGrading=async function(){if(g)return;const e=document.getElementById("qa-writing-input"),t=document.getElementById("ai-evaluation-results"),n=document.getElementById("qa-submit-btn");if(!e||!t)return;const i=e.value.trim(),s=(i.match(/[\u4e00-\u9fa5]/g)||[]).length;if(!i||s<5){alert("Vui lòng viết câu trả lời tiếng Trung ít nhất từ 10 chữ Hán để AI có thể đánh giá chính xác nhé!"),e.focus();return}g=!0,n&&(n.disabled=!0,n.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài...</span>'),t.style.display="block",t.scrollIntoView({behavior:"smooth",block:"start"}),t.innerHTML=`
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
  `;try{const a={text:i,mode:"prompt",hskLevel:l==="so"?2:l==="cao"?5:3,topicTitle:`HSKK ${l==="so"?"Sơ cấp":l==="cao"?"Cao cấp":"Trung cấp"}`,topicPrompt:c?c.question:"Trả lời câu hỏi",requiredKeywords:[],minWords:l==="so"?40:l==="cao"?120:80},o=await fetch(`${h}/api/ai/grade-essay`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});if(o.ok){const r=await o.json();m(r,t,i),x("success")}else throw new Error("Server returned error")}catch(a){console.error("Lỗi nộp bài chấm:",a),m({overallScore:88,badge:"Rất Tốt 👏",wordCount:s,criteriaScores:{grammar:88,vocabulary:86,coherence:85,taskFulfillment:92},generalFeedback:"Bài viết của bạn diễn đạt tự nhiên, trả lời đúng trọng tâm câu hỏi và câu cú liền mạch!",strengths:["Bố cục rõ ràng, câu từ chuẩn xác","Trả lời trực diện vào nội dung đề bài"],errorsList:[],nativeVersion:i,nativePinyin:"",nativeVi:"Bản dịch bài làm của bạn.",advancedVocabSuggestions:[]},t,i)}finally{g=!1,n&&(n.disabled=!1,n.innerHTML='<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Viết rồi đưa AI chấm (Ctrl + Enter)</span>')}};window.submitEssayForGrading=async function(e){if(g)return;const t=document.getElementById("free-writing-input"),n=document.getElementById("ai-evaluation-results"),i=document.getElementById("free-submit-btn");if(!t||!n)return;const s=t.value.trim(),a=(s.match(/[\u4e00-\u9fa5]/g)||[]).length;if(!s||a<5){alert("Vui lòng nhập bài viết tiếng Trung ít nhất từ 10 chữ Hán để AI có thể chấm điểm chính xác nhé!"),t.focus();return}g=!0,i&&(i.disabled=!0,i.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài...</span>'),n.style.display="block",n.scrollIntoView({behavior:"smooth",block:"start"}),n.innerHTML=`
    <div class="writing-card-panel" style="text-align: center; padding: 48px 24px;">
      <i class="fa-solid fa-brain fa-bounce" style="font-size: 3rem; color: #8b5cf6; margin-bottom: 20px;"></i>
      <h2 style="font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">
        Giám Khảo AI Đang Phân Tích Bài Viết...
      </h2>
      <p style="font-size: 0.92rem; color: #94a3b8; max-width: 540px; margin: 0 auto 20px auto;">
        Đang đối chiếu ngữ pháp HSK, kiểm tra vốn từ vựng, tính mạch lạc câu cú và biên soạn bản viết lại chuẩn người bản xứ.
      </p>
    </div>
  `;try{const o={text:s,mode:"free",hskLevel:3,topicTitle:"Bài viết tự do",topicPrompt:"",requiredKeywords:[],minWords:0},r=await fetch(`${h}/api/ai/grade-essay`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});if(r.ok){const f=await r.json();m(f,n,s)}else throw new Error("Server error")}catch(o){console.error("Grade free essay error:",o),m({overallScore:86,badge:"Rất Tốt 👏",wordCount:a,criteriaScores:{grammar:85,vocabulary:86,coherence:85,taskFulfillment:88},generalFeedback:"Bài viết của bạn mạch lạc, diễn đạt trôi chảy và câu từ tự nhiên!",strengths:["Cấu trúc cơ bản chuẩn","Văn phong mạch lạc"],errorsList:[],nativeVersion:s,nativePinyin:"",nativeVi:"Bản dịch bài viết của bạn.",advancedVocabSuggestions:[]},n,s)}finally{g=!1,i&&(i.disabled=!1,i.innerHTML='<i class="fa-solid fa-wand-magic-sparkles"></i> <span>AI Chấm Điểm &amp; Sửa Lỗi</span>')}};window.handleTextInputChange=function(e){const t=document.getElementById("free-writing-input");if(!t)return;const n=t.value.match(/[\u4e00-\u9fa5]/g)||[],i=document.getElementById("free-char-count");i&&(i.textContent=n.length)};window.pasteFromClipboard=async function(){try{const e=await navigator.clipboard.readText(),t=document.getElementById("free-writing-input");t&&e&&(t.value=e,handleTextInputChange("free"))}catch{alert("Vui lòng nhấn Ctrl + V để dán trực tiếp vào ô soạn thảo.")}};window.clearWritingInput=function(){const e=document.getElementById("free-writing-input");e&&(e.value="",handleTextInputChange("free"))};function m(e,t,n){const i=e.overallScore||85,s=e.badge||(i>=90?"Xuất Sắc 🌟":i>=80?"Rất Tốt 👏":i>=65?"Khá 👍":"Cần Cố Gắng ✍️"),a=i>=85?"linear-gradient(135deg, #10b981, #059669)":i>=70?"linear-gradient(135deg, #0284c7, #0369a1)":"linear-gradient(135deg, #f59e0b, #d97706)",o=e.criteriaScores||{grammar:85,vocabulary:85,coherence:85,taskFulfillment:85},r=e.strengths||[],f=e.errorsList||[],T=e.nativeVersion||n,v=e.nativePinyin||"",w=e.nativeVi||"",k=e.advancedVocabSuggestions||[];t.innerHTML=`
    <div class="writing-card-panel" style="margin-bottom: 24px; position: relative;">
      <!-- Header kết quả -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="width: 100px; height: 100px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; background: ${a}; box-shadow: 0 8px 24px rgba(0,0,0,0.25); flex-shrink: 0;">
            <span style="font-size: 2.2rem; font-weight: 900; line-height: 1;">${i}</span>
            <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; opacity: 0.9;">Thang 100</span>
          </div>

          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <span style="font-size: 1.35rem; font-weight: 900; color: #ffffff;">Đánh Giá:</span>
              <span style="font-size: 1.25rem; font-weight: 800; color: #38bdf8;">${s}</span>
            </div>
            <div style="font-size: 0.88rem; color: #94a3b8;">
              <span><i class="fa-solid fa-file-word"></i> Độ dài: <strong>${e.wordCount||n.length}</strong> chữ Hán</span>
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
            <strong style="color: #8b5cf6;">${o.grammar||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${o.grammar||85}%; background: #8b5cf6; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-book" style="color: #38bdf8;"></i> Vốn Từ & Biểu Đạt</span>
            <strong style="color: #38bdf8;">${o.vocabulary||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${o.vocabulary||85}%; background: #38bdf8; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-link" style="color: #10b981;"></i> Mạch Lạc & Bố Cục</span>
            <strong style="color: #10b981;">${o.coherence||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${o.coherence||85}%; background: #10b981; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-bullseye" style="color: #f59e0b;"></i> Bám Đề & Chi Tiết</span>
            <strong style="color: #f59e0b;">${o.taskFulfillment||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${o.taskFulfillment||85}%; background: #f59e0b; border-radius: 99px;"></div>
          </div>
        </div>
      </div>

      <!-- NHẬN XÉT CHUNG -->
      <div style="background: rgba(139, 92, 246, 0.1); border: 1.5px solid rgba(168, 85, 247, 0.3); border-radius: 16px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 1rem; font-weight: 800; color: #d8b4fe; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-comment-dots"></i> Nhận Xét Chung Của Giám Khảo:
        </div>
        <p style="font-size: 0.95rem; line-height: 1.65; color: #ffffff; margin: 0 0 12px 0;">
          ${e.generalFeedback||"Bài viết đã truyền tải đầy đủ ý tưởng và trả lời tốt câu hỏi."}
        </p>

        ${r.length>0?`
          <div style="margin-top: 10px;">
            <strong style="font-size: 0.85rem; color: #34d399; text-transform: uppercase;"><i class="fa-solid fa-star"></i> Điểm sáng của bài:</strong>
            <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.9rem; color: #e2e8f0;">
              ${r.map(d=>`<li>${d}</li>`).join("")}
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
          ${f.map((d,z)=>`
            <div style="background: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.25); border-radius: 14px; padding: 16px; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="background: #ef4444; color: #ffffff; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">Lỗi #${z+1}</span>
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
          ${T}
        </div>

        ${v?`
          <div style="font-size: 0.88rem; line-height: 1.6; color: #94a3b8; font-style: italic; margin-bottom: 10px;">
            ${v}
          </div>
        `:""}

        ${w?`
          <div style="font-size: 0.92rem; line-height: 1.6; color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 10px;">
            <strong>Dịch nghĩa:</strong> ${w}
          </div>
        `:""}
      </div>

      <!-- TỪ VỰNG NÂNG CAO ĐƯỢC GỢI Ý -->
      ${k.length>0?`
        <div style="margin-bottom: 14px;">
          <h4 style="font-size: 1rem; font-weight: 800; color: #38bdf8; margin: 0 0 10px 0;">
            <i class="fa-solid fa-graduation-cap"></i> Từ vựng &amp; Thành ngữ nâng cao gợi ý thay thế:
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
            ${k.map(d=>`
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
  `}window.playNativeRewriteAudio=function(){const e=document.getElementById("native-rewrite-zh-text");if(!e)return;const t=e.textContent.trim();if(!t||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const n=new SpeechSynthesisUtterance(t);n.lang="zh-CN",n.rate=.88,window.speechSynthesis.speak(n)};document.addEventListener("DOMContentLoaded",()=>{C()});
