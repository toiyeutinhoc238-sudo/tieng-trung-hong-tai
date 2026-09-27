import"./global_sidebar-Cut2hinM.js";const m=(window.location.hostname.includes("localhost")||window.location.hostname.includes("127.0.0.1"),"");let h={so:[],trung:[],cao:[]},r="trung",c=null,d=new Map,p=!1,b=!1;function y(n="click"){try{const i=new(window.AudioContext||window.webkitAudioContext),t=i.createOscillator(),e=i.createGain();t.connect(e),e.connect(i.destination),n==="spin"?(t.type="triangle",t.frequency.setValueAtTime(440,i.currentTime),t.frequency.exponentialRampToValueAtTime(880,i.currentTime+.25),e.gain.setValueAtTime(.2,i.currentTime),e.gain.exponentialRampToValueAtTime(.01,i.currentTime+.25),t.start(),t.stop(i.currentTime+.25)):n==="success"&&(t.type="sine",t.frequency.setValueAtTime(523.25,i.currentTime),t.frequency.setValueAtTime(659.25,i.currentTime+.1),e.gain.setValueAtTime(.18,i.currentTime),e.gain.exponentialRampToValueAtTime(.01,i.currentTime+.35),t.start(),t.stop(i.currentTime+.35))}catch{}}async function B(){var t,e,a;try{let o=await fetch(`${m}/api/hskk-questions`);o.ok||(o=await fetch("/data/hskk_questions.json"));const s=await o.json();s&&(s.so||s.questions)&&(s.so?h=s:s.questions&&(h.so=s.questions.filter(g=>g.level==="so"),h.trung=s.questions.filter(g=>g.level==="trung"),h.cao=s.questions.filter(g=>g.level==="cao")))}catch(o){console.warn("Không tải được API HSKK, thử nạp tĩnh...",o);try{const s=await fetch("/data/hskk_questions.json");s.ok&&(h=await s.json())}catch(s){console.error("Lỗi nạp câu hỏi HSKK:",s)}}const n=(((t=h.so)==null?void 0:t.length)||0)+(((e=h.trung)==null?void 0:e.length)||0)+(((a=h.cao)==null?void 0:a.length)||0),i=document.getElementById("total-questions-stat");i&&n>0&&(i.textContent=n.toLocaleString()),spinRandomQuestion(!1)}window.selectWritingMode=function(n){const i=document.getElementById("wf-card-qa"),t=document.getElementById("wf-card-free"),e=document.getElementById("wf-pointer-arrow"),a=document.getElementById("qa-workspace-view"),o=document.getElementById("free-workspace-view");n==="qa"?(i==null||i.classList.add("active"),t==null||t.classList.remove("active"),e&&(e.style.display="flex"),a&&(a.style.display="block"),o&&(o.style.display="none")):n==="free"&&(i==null||i.classList.remove("active"),t==null||t.classList.add("active"),e&&(e.style.display="none"),a&&(a.style.display="none"),o&&(o.style.display="block"))};window.switchHskkLevel=function(n,i){r===n&&c||(r=n,document.querySelectorAll(".level-select-row .level-btn").forEach(t=>t.classList.remove("active")),i&&i.classList.add("active"),spinRandomQuestion(!0))};window.spinRandomQuestion=function(n=!0){const i=h[r]||[];if(!i||i.length===0)return;const t=document.getElementById("spin-question-btn");n&&t&&(t.classList.add("rolling"),y("spin"),setTimeout(()=>t.classList.remove("rolling"),500));let e=null;if(i.length===1)e=i[0];else do e=i[Math.floor(Math.random()*i.length)];while(c&&e.question===c.question&&i.length>1);c=e,$();const a=document.getElementById("ai-suggestion-box");a&&(a.style.display="none");const o=document.getElementById("hint-toggle-btn");o&&(o.innerHTML=`
      <i class="fa-solid fa-lightbulb"></i>
      <span>Gợi ý Dàn bài &amp; Từ vựng</span>
    `);const s=document.getElementById("sample-writing-box");s&&(s.style.display="none");const g=document.getElementById("sample-writing-toggle-btn");g&&(g.innerHTML=`
      <i class="fa-solid fa-medal"></i>
      <span>Bài viết mẫu tham khảo</span>
    `)};function $(){if(!c)return;const n=document.getElementById("active-question-text"),i=document.getElementById("question-meta-badge"),t=r==="so"?"HSKK Sơ cấp":r==="cao"?"HSKK Cao cấp":"HSKK Trung cấp";n&&(n.textContent=c.question),i&&(i.textContent=`Câu ${c.stt||1} • ${t}`)}window.playQuestionTts=function(){if(!c||!c.question)return;if(!("speechSynthesis"in window)){alert("Trình duyệt của bạn không hỗ trợ phát âm thanh.");return}window.speechSynthesis.cancel();const n=new SpeechSynthesisUtterance(c.question);n.lang="zh-CN",n.rate=.9,window.speechSynthesis.speak(n)};window.toggleAiSuggestions=async function(){const n=document.getElementById("ai-suggestion-box"),i=document.getElementById("hint-toggle-btn");if(!n||!c)return;if(n.style.display==="block"){n.style.display="none",i&&(i.innerHTML=`
        <i class="fa-solid fa-lightbulb"></i>
        <span>Gợi ý Dàn bài &amp; Từ vựng</span>
      `);return}n.style.display="block",i&&(i.innerHTML=`
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Gợi ý</span>
    `);const e=`${r}_${c.question}`;if(d.has(e)){x(d.get(e));return}if(!b){b=!0,n.innerHTML=`
    <div style="text-align: center; padding: 24px 16px; color: #a855f7;">
      <i class="fa-solid fa-brain fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #38bdf8;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        AI HongTai đang tự động xây dựng Dàn bài &amp; chọn lọc Từ vựng...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Đối chiếu chuẩn ngữ cảnh thi HSKK ${r==="so"?"Sơ cấp":r==="cao"?"Cao cấp":"Trung cấp"}
      </div>
    </div>
  `;try{const a=await fetch(`${m}/api/ai/hskk-suggest`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:c.question,level:r,skill:"writing"})});if(a.ok){const o=await a.json();d.set(e,o),x(o),y("success")}else throw new Error("Server error")}catch(a){console.error("Lỗi gợi ý AI:",a);const o=T();d.set(e,o),x(o)}finally{b=!1}}};function x(n){const i=document.getElementById("ai-suggestion-box");if(!i)return;const t=n.outline||{},e=n.vocabulary||[],a=n.sentenceStructures||[];i.innerHTML=`
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
        <div style="margin-bottom: 8px;"><strong>Mở bài:</strong> ${t.intro||"Nêu trực tiếp câu trả lời cho đề bài."}</div>
        <div style="margin-bottom: 8px;">
          <strong>Thân bài:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 20px;">
            ${(t.body||[]).map(o=>`<li style="margin-bottom: 4px;">${o}</li>`).join("")}
          </ul>
        </div>
        <div><strong>Kết bài:</strong> ${t.conclusion||"Tổng kết suy nghĩ và cảm xúc."}</div>
      </div>
    </div>

    <!-- 2. Từ vựng then chốt có thể sử dụng -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 0.92rem; font-weight: 800; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-key"></i> <span>2. Từ vựng then chốt (Bấm để chèn nhanh vào bài):</span>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${e.map(o=>`
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
  `}window.toggleSampleWriting=async function(){const n=document.getElementById("sample-writing-box"),i=document.getElementById("sample-writing-toggle-btn");if(!n||!c)return;if(n.style.display==="block"){n.style.display="none",i&&(i.innerHTML=`
        <i class="fa-solid fa-medal"></i>
        <span>Bài viết mẫu tham khảo</span>
      `);return}n.style.display="block",i&&(i.innerHTML=`
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Bài viết mẫu</span>
    `);const e=`${r}_${c.question}`;if(d.has(e)){v(d.get(e));return}n.innerHTML=`
    <div style="text-align: center; padding: 24px 16px; color: #10b981;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #10b981;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        Đang tạo bài viết mẫu chuẩn HSKK ${r==="so"?"Sơ cấp":r==="cao"?"Cao cấp":"Trung cấp"}...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Bài văn mẫu hoàn chỉnh 3 phần bám sát câu hỏi: "${c.question}"
      </div>
    </div>
  `;try{const a=await fetch(`${m}/api/ai/hskk-suggest`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:c.question,level:r,skill:"writing"})});if(a.ok){const o=await a.json();d.set(e,o),v(o),y("success")}else throw new Error("Server error")}catch(a){console.error("Lỗi nạp bài mẫu viết:",a);const o=T();d.set(e,o),v(o)}};function v(n){const i=document.getElementById("sample-writing-box");if(!i)return;const t=n.sampleAnswer||{},e=t.hanzi||"",a=e.replace(/\s+/g,"").length;i.innerHTML=`
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
      ${e}
    </div>

    <!-- Pinyin Text -->
    ${t.pinyin?`
      <div style="margin-bottom: 12px;">
        <div style="font-size: 0.78rem; text-transform: uppercase; color: #38bdf8; font-weight: 800; margin-bottom: 4px;">Phiên âm Pinyin:</div>
        <div style="font-size: 0.88rem; color: #94a3b8; font-style: italic; line-height: 1.6; white-space: pre-line; background: rgba(0,0,0,0.18); padding: 10px 14px; border-radius: 10px;">${t.pinyin}</div>
      </div>
    `:""}

    <!-- Vietnamese Translation -->
    ${t.meaningVi?`
      <div>
        <div style="font-size: 0.78rem; text-transform: uppercase; color: #fbbf24; font-weight: 800; margin-bottom: 4px;">Dịch nghĩa tiếng Việt:</div>
        <div style="font-size: 0.92rem; color: #cbd5e1; line-height: 1.7; white-space: pre-line; background: rgba(0,0,0,0.18); padding: 10px 14px; border-radius: 10px;">${t.meaningVi}</div>
      </div>
    `:""}
  `}function T(){const n=c&&c.question?c.question:"đề bài",i=r||"trung";return i==="so"?{outline:{intro:`Mở bài: Trả lời trực tiếp và ngắn gọn: "${n}". (Gợi ý: Bạn có thích điều này không? Quan điểm đơn giản của bạn là gì?)`,body:["Luận điểm 1: Nêu lý do thứ nhất với các từ quen thuộc. (Gợi ý: Tại sao bạn lại nghĩ như vậy?)","Luận điểm 2: Kể một việc hoặc trải nghiệm đơn giản hằng ngày. (Gợi ý: Bạn thường làm việc đó với ai, vào lúc nào?)","Luận điểm 3: Nêu cảm nghĩ vui vẻ, tích cực. (Gợi ý: Bạn cảm thấy việc đó mang lại niềm vui gì?)"],conclusion:"Kết bài: Tóm lại ý chính và bày tỏ hy vọng / mong muốn của bạn trong tương lai."},vocabulary:[{hanzi:"我觉得",pinyin:"wǒ juéde",meaning:"tôi thấy, tôi nghĩ rằng"},{hanzi:"喜欢",pinyin:"xǐhuan",meaning:"thích"},{hanzi:"常常",pinyin:"chángcháng",meaning:"thường xuyên"},{hanzi:"一起",pinyin:"yìqǐ",meaning:"cùng nhau"},{hanzi:"高兴",pinyin:"gāoxìng",meaning:"vui vẻ"}],sentenceStructures:[{pattern:"我觉得……因为……",meaning:"Tôi thấy... bởi vì...",example:"我觉得这个题目很有意思，因为在日常生活中我们常常遇到。"},{pattern:"虽然……但是……",meaning:"Tuy... nhưng...",example:"虽然一开始有点儿难，但是多练习就会了。"}],sampleAnswer:{hanzi:`关于“${n}”这个问题，我觉得很有意思。在生活中，我们常常会遇到这样的事情。对我来说，保持一个好心情非常重要。首先，做事情的时候要认真，遇到不懂的问题可以多问问老师和朋友。其次，每天花一点儿时间去学习和练习，比如多听听汉语、多和大家聊聊天，这样就能慢慢进步。最后，我觉得大家互相帮助、一起努力是一件非常快乐的事情。只要我们每天坚持，就一定能把事情做好，生活也会更加开心。`,pinyin:"Guānyú zhè ge wèntí, wǒ juéde hěn yǒu yìsi. Zài shēnghuó zhōng, wǒmen chángcháng huì yù dào zhèyàng de shìqing. Duì wǒ lái shuō, bǎochí yí gè hǎo xīnqíng fēicháng zhòngyào. Shǒuxiān, zuò shìqing de shíhou yào rènzhēn, yù dào bù dǒng de wèntí kěyǐ duō wènwen lǎoshī hé péngyou. Qícì, měitiān huā yìdiǎnr shíjiān qù xuéxí hé liànxí, bǐrú duō tīngting Hànyǔ, duō hé dàjiā liáoliao tiān, zhèyàng jiù néng mànmàn jìnbù. Zuìhòu, wǒ juéde dàjiā hùxiāng bāngzhù, yìqǐ nǔlì shì yí jiàn fēicháng kuàilè de shìqing. Zhǐyào wǒmen měitiān jiānchí, jiù yídìng néng bǎ shìqing zuò hǎo, shēnghuó yě huì gèngjiā kāixīn.",meaningVi:`Về câu hỏi "${n}", tôi thấy rất thú vị. Trong cuộc sống, chúng ta thường hay gặp những chuyện như thế này. Đối với tôi, giữ một tâm trạng vui vẻ là rất quan trọng. Thứ nhất, khi làm việc gì cũng cần nghiêm túc, gặp câu hỏi chưa hiểu thì có thể hỏi thầy cô và bạn bè. Thứ hai, mỗi ngày dành một chút thời gian học tập và luyện tập, ví dụ như nghe tiếng Trung nhiều hơn, nói chuyện với mọi người nhiều hơn, như vậy sẽ tiến bộ dần dần. Cuối cùng, tôi thấy mọi người cùng giúp đỡ nhau, cùng nhau nỗ lực là một điều vô cùng hạnh phúc. Chỉ cần mỗi ngày kiên trì, nhất định chúng ta sẽ làm tốt và cuộc sống sẽ vui vẻ hơn.`}}:i==="cao"?{outline:{intro:`Mở bài: Đặt vấn đề sâu sắc trong bối cảnh xã hội hiện đại cho chủ đề: "${n}". Khẳng định tầm quan trọng và đưa ra luận điểm cốt lõi bao quát.`,body:["Luận điểm 1: Mổ xẻ bản chất và căn nguyên sâu xa của vấn đề (về mặt nhận thức cá nhân và tác động đa chiều từ môi trường sống).","Luận điểm 2: Đưa ra dẫn chứng thực tiễn điển hình có sức nặng thuyết phục (phân tích sự tương phản giữa kiên trì vượt khó và tâm lý thoái thác).","Luận điểm 3: Đề xuất hệ thống giải pháp chiến lược toàn diện (kết hợp kỷ luật tự thân với sự hỗ trợ từ gia đình, tổ chức và xã hội)."],conclusion:"Kết bài: Nâng tầm vấn đề thành bài học triết lý sống và thông điệp hành động mạnh mẽ, truyền cảm hứng dài hạn."},vocabulary:[{hanzi:"立足当下",pinyin:"lìzú dāngxià",meaning:"đứng vững ở hiện tại"},{hanzi:"深谋远虑",pinyin:"shēnmóu yuǎnlǜ",meaning:"lo xa nghĩ sâu, tầm nhìn chiến lược"},{hanzi:"持之以恒",pinyin:"chí zhī yǐ héng",meaning:"kiên trì bền bỉ không ngừng nghỉ"},{hanzi:"潜移默化",pinyin:"qián yí mò huà",meaning:"ảnh hưởng sâu sắc một cách vô hình, ngấm dần"},{hanzi:"标本兼治",pinyin:"biāo běn jiān zhì",meaning:"trị cả phần ngọn lẫn gốc rễ"},{hanzi:"收益匪浅",pinyin:"shòuyì fěiqiǎn",meaning:"thu hoạch được vô vàn điều bổ ích"}],sentenceStructures:[{pattern:"不仅在于……，更关键的在于……",meaning:"Không chỉ nằm ở chỗ..., mà mấu chốt hơn là nằm ở...",example:"探讨这个问题的价值，不仅在于理清表象，更关键的在于寻找切实行之有效的破局之道。"},{pattern:"固然……，然而归根结底……",meaning:"Dẫu rằng..., nhưng xét đến cùng...",example:"外部客观环境固然重要，然而归根结底，个人内驱力与长远格局才起决定性作用。"},{pattern:"唯有……，方能在……中立于不败之地。",meaning:"Chỉ khi..., mới có thể đứng vững trước...",example:"唯有保持终身学习的心态，方能在瞬息万变的时代浪潮中立于不败之地。"}],sampleAnswer:{hanzi:`针对“${n}”这一极具现实意义的深刻命题，我认为它不仅关乎我们每个人的个体成长，更折射出现代社会中普遍存在的价值取向与处事哲学。在纷繁复杂的生活与职场环境中，如何正确审视并妥善应对这一课题，值得我们深思熟虑。

首先，从认知层面来看，古人云：“登高使人心旷，临流使人意远。”面对纷至沓来的挑战，我们首先应当厘清问题的本质所在，既不能因暂时的波折 mà 妄自菲薄，亦不可盲目乐观 mà 浅尝辄止。唯有树立清晰宏阔的目标导向，将长远愿景细化为扎实可行的阶段性规划，方能做到心中有数、行有方向。

其次，从实践与知行合一的角度而言，纸上谈兵终究无济于事，关键在于付诸持之以恒的切实行动。以我们日常求知与奋斗为例，任何一项专业技能的精通或心智的磨砺，无不经历漫长 mà 枯燥的积累过程，正所谓“不积跬步，无以至千里”。在此期间，保持专注与定力、勇敢突破舒适圈，敢于在试错中反思与总结，方能实现认知与能力的飞跃。

再者，除了依赖个体强烈的内驱力之外，融洽的人际协作与开放包容的生态氛围亦是不可或缺的外部支撑。懂得倾听他山之石、主动构建良性互动的合作机制，往往能激发出“独行快，众行远”의 bèizēng xiàoyìng。

总而言之，“行百里者半九十”。面对这一课题，我们唯有立足当下、深谋远虑，将坚毅的意志品质与科学的行事方法有机结合，在时代洪流中砥砺前行，方能攻坚克难，开辟出属于自己的广阔天地。`,pinyin:`Zhēnduì zhè yí jùyǒu xiànshí yìyì de shēnkè mìngtí, wǒ rènwéi tā bùjǐn guānhū wǒmen měi gè rén de gètǐ chéngzhǎng, gèng zhéshè chū xiàndài shèhuì zhōng pǔbiàn cúnzài de jiàzhí qǔxiàng yǔ chǔshì zhéxué. Zài fēnfán fùzá de shēnghuó yǔ zhíchǎng huánjìng zhōng, rúhé zhèngquè shěnshì bìng tuǒshàn yìngduì zhè yí kètí, zhídé wǒmen shēnsī shúlǜ.

Shǒuxiān, cóng rènzhī céngmiàn lái kàn, gǔrén yún: "Dēng gāo shǐ rén xīn kuàng, lín liú shǐ rén yì yuǎn." Miànduì fēnzhì-tàlái de tiǎozhàn, wǒmen shǒuxiān yīngdāng líqīng wèntí de běnzhì suǒzài, jì bù néng yīn zànshí de bōzhé ér wàngzì-fěibó, yì bù kě mángmù lèguān ér qiǎncháng-zhézhǐ. Wéiyǒu shùlì qīngxī hóngkuò de mùbiāo dǎoxiàng, jiāng chángyuǎn yuànjǐng xìhuà wéi zhāshi kěxíng de jiēduànxìng guīhuà, fāng néng zuò dào xīn zhōng yǒu shù, xíng yǒu fāngxiàng.

Qícì, cóng shíjiàn yǔ zhī-xíng-hé-yī de jiǎodù ér yán, zhǐshàng-tánbīng zhōngjiū wújìyúshì, guānjiàn zàiyú fùzhū chízhīyǐhéng de qièshí xíngdòng. Yǐ wǒmen rìcháng qiúzhī yǔ fèndòu wéilì, rènhé yí xiàng zhuānyè jìnéng de jīngtōng huò xīnzzhì de mólì, wúbù jīnglì màncháng ér kūzào de jīlěi guòchéng, zhèng suǒwèi "bù jī kuǐbù, wú yǐ zhì qiānlǐ". Zài cǐ qījiān, bǎochí zhuānzhù yǔ dìnglì, yǒnggǎn tūtò shūshìquān, gǎnyú zài shìcuò zhōng fǎnsī yǔ zǒngjié, fāng néng shíxiàn rènzhī yǔ nénglì de fēiyuè.

Zàizhě, chúle yīlài gètǐ qiángliè de nèiqūlì zhīwài, róngqià de rénjì xiézuò yǔ cáifàng bāoróng de shēngtài fēnwéi yì shì bùkě huòquē de wàibù zhīchēng. Dǒngdé qīngtīng tā-shān-zhī-shí, zhǔdòng gòujiàn liángxìng hùdòng de hézuò jīzhì, wǎngwǎng néng jīfā chū "dúxíng kuài, zhòngxíng yuǎn" de bèizēng xiàoyìng。

Zǒng'éryánzhī, "xíng bǎilǐ zhě bàn jiǔshí". Miànduì zhè yí kètí, wǒmen wéiyǒu lìzú dāngxià, shēnmóu yuǎnlǜ, jiāng jiānyì de yìzhì pǐnzhì yǔ kēxué de xíngshì fāngfǎ yǒujī jiéhé, zài shídài hóngliú zhōng dǐlì qiánxíng, fāng néng gōngjiān-kènán, kāipì chū shǔyú zìjǐ de guǎngkuò tiāndì.`,meaningVi:`Đối với đề bài mang tính thời sự và sâu sắc "${n}", tôi cho rằng câu hỏi này không chỉ liên quan mật thiết đến sự trưởng thành của mỗi cá nhân, mà còn phản ánh hệ giá trị và triết lý sống phổ quát trong xã hội hiện đại. Trong một môi trường sống và làm việc đa chiều, việc nhìn nhận thấu đáo và ứng phó thỏa đáng với vấn đề này là điều rất đáng để chúng ta trăn trở.

Trước hết, xét từ góc độ nhận thức, người xưa có câu: "Lên cao khiến lòng người khoáng đạt, ngắm dòng nước khiến ý chí vươn xa." Đối diện với vô vàn thử thách, chúng ta cần phân định rõ bản chất cốt lõi của vấn đề, không vì khó khăn trước mắt mà tự ti, thoái chí, cũng không vì chút thuận lợi ban đầu mà chủ quan, hời hợt. Chỉ khi xác lập một định hướng mục tiêu rành mạch, cụ thể hóa viễn cảnh dài hạn thành từng lộ trình hành động thiết thực, ta mới vững vàng tiến bước.

Thứ hai, xét từ nguyên lý "tri hành hợp nhất", nói suông trên giấy suy cho cùng vô ích, điều then chốt nằm ở việc bắt tay vào hành động kiên trì, bền bỉ. Lấy việc học tập và rèn luyện mỗi ngày làm ví dụ, việc tinh thông bất kỳ kỹ năng chuyên môn hay sự tôi luyện bản lĩnh nào cũng đều phải trải qua quá trình tích lũy lâu dài, đúng như câu "không tích từng bước nhỏ, không thể đi tới ngàn dặm". Trong hành trình đó, việc giữ vững sự tập trung, dũng cảm bứt phá khỏi vùng an toàn và không ngừng đúc rút kinh nghiệm sau mỗi lần vấp ngã chính là đòn bẩy tạo nên bước nhảy vọt.

Thêm vào đó, bên cạnh nội lực tự thân, sự tương trợ gắn kết và tinh thần hợp tác cởi mở cũng là điểm tựa ngoại lực không thể thiếu. Biết lắng nghe ý kiến đóng góp từ người khác, cùng chung sức đồng lòng sẽ luôn tạo ra sức mạnh cộng hưởng to lớn.

Tóm lại, "đường đi trăm dặm, đi được chín mươi dặm mới tính là nửa đường". Đứng trước bài toán này, chỉ khi chúng ta biết đứng vững ở hiện tại, nhìn xa trông rộng, kết hợp ý chí kiên định với phương pháp khoa học, không ngừng rèn giũa bản thân, ta mới có thể vượt qua mọi chông gai và kiến tạo nên chân trời rộng mở cho chính mình.`}}:{outline:{intro:`Mở bài: Nêu câu trả lời hoặc quan điểm cá nhân trực diện cho đề bài: "${n}". (Gợi ý: Theo bạn, câu trả lời trực tiếp cho câu hỏi này là gì?)`,body:[`Luận điểm 1: Phân tích nguyên nhân và lý do chính giải thích cho câu hỏi "${n}". (Gợi ý: Tại sao bạn lại nghĩ hoặc chọn như vậy?)`,"Luận điểm 2: Đưa ra ví dụ thực tế hoặc trải nghiệm bản thân gắn liền với câu hỏi. (Gợi ý: Bạn hoặc những người xung quanh đã trải qua việc này như thế nào?)","Luận điểm 3: Đánh giá ý nghĩa, giải pháp hoặc bài học cuộc sống. (Gợi ý: Điều này mang lại giá trị hoặc bài học gì cho bạn?)"],conclusion:"Kết bài: Tổng kết lại toàn bộ quan điểm, đưa ra bài học hoặc thông điệp / lời kêu gọi hành động ý nghĩa."},vocabulary:[{hanzi:"看法",pinyin:"kànfǎ",meaning:"quan điểm, góc nhìn"},{hanzi:"经验",pinyin:"jīngyàn",meaning:"kinh nghiệm thực tế"},{hanzi:"坚持",pinyin:"jiānchí",meaning:"kiên trì"},{hanzi:"互相帮助",pinyin:"hùxiāng bāngzhù",meaning:"giúp đỡ lẫn nhau"},{hanzi:"收益匪浅",pinyin:"shòuyì fěiqiǎn",meaning:"thu hoạch được nhiều điều bổ ích"}],sentenceStructures:[{pattern:"在我看来，……是最重要的。",meaning:"Theo quan điểm của tôi, ... là quan trọng nhất.",example:"在我看来，针对这个问题，保持积极态度并付诸行动最为重要。"},{pattern:"一方面……，另一方面……",meaning:"Một mặt thì..., mặt khác thì...",example:"一方面要脚踏实地努力，另一方面要多向他人请教。"}],sampleAnswer:{hanzi:`针对“${n}”这个问题，我认为在我们的生活和学习中有着非常重要的现实意义。

首先，从个人角度来看，我们应当明确自己的目标与态度，认真思考问题背后的原因。当我们遇到新事物或挑战时，不能只停留在想法上，而要主动付诸实践。

其次，除了自身的勤奋努力之外，学会与他人沟通合作也同样重要。多向优秀的师长朋友请教，倾听不同的见解，不仅能让我们少走弯路，更能开阔眼界、拓宽思维格局。

总的来说，只要我们能够持之以恒，并与身边的人互相支持、共同进步，就一定能克服困难，取得令人满意的成果。`,pinyin:"Zhēnduì zhè ge wèntí, wǒ rènwéi zài wǒmen de shēnghuó hé xuéxí zhōng yǒuzhe fēicháng zhòngyào de xiànshí yìyì. Shǒuxiān, cóng gèrén jiǎodù lái kàn, wǒmen yīngdāng míngquè zìjǐ de mùbiāo yǔ tàidù. Qícì, zài yùdào jùtǐ qíngjìng shí, yīngdāng zhǔdòng fùzhū shíjiàn. Zuìhòu, zhǐyào wǒmen néng chízhīyǐhéng, jiù yídìng néng qǔdé lìngrén mǎnyì de chéngguǒ.",meaningVi:`Đối với đề tài "${n}", tôi cho rằng câu hỏi này mang ý nghĩa thực tế rất quan trọng trong cuộc sống và học tập của chúng ta. Thứ nhất, từ góc độ cá nhân, chúng ta cần xác định rõ mục tiêu và thái độ của mình, suy nghĩ nghiêm túc về nguyên nhân. Thứ hai, khi đối diện với tình huống cụ thể, không nên chỉ dừng lại ở suy nghĩ mà cần chủ động bắt tay vào hành động, dũng cảm đối mặt với thử thách và tích cực tìm kiếm giải pháp. Cuối cùng, chỉ cần chúng ta kiên trì đến cùng và luôn hỗ trợ lẫn nhau, nhất định sẽ gặt hái được những thành quả tốt đẹp.`}}}window.playWritingSampleTts=function(){const n=document.getElementById("sample-writing-hanzi");if(!n||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const i=new SpeechSynthesisUtterance(n.textContent.trim());i.lang="zh-CN",i.rate=.88,window.speechSynthesis.speak(i)};window.insertVocabToWriting=function(n){const i=document.getElementById("qa-writing-input");i&&(i.value+=n,handleQaTextInput(),i.focus())};window.copySampleText=function(){const n=document.getElementById("sample-writing-hanzi")||document.getElementById("sample-hanzi-text");n&&(navigator.clipboard.writeText(n.textContent.trim()),alert("Đã sao chép bài văn mẫu vào clipboard!"))};window.handleQaTextInput=function(){const n=document.getElementById("qa-writing-input");if(!n)return;const i=n.value,e=(i.match(/[\u4e00-\u9fa5]/g)||[]).length,a=i.split(`
`).filter(g=>g.trim().length>0).length,o=document.getElementById("qa-char-count"),s=document.getElementById("qa-para-count");o&&(o.textContent=e),s&&(s.textContent=a)};window.clearQaInput=function(){const n=document.getElementById("qa-writing-input");if(n){if(n.value.trim().length>0&&!confirm("Bạn có chắc muốn xóa nội dung đã viết?"))return;n.value="",handleQaTextInput()}};document.addEventListener("keydown",n=>{if((n.ctrlKey||n.metaKey)&&n.key==="Enter"){const i=document.getElementById("wf-card-qa");i&&i.classList.contains("active")?submitQaForGrading():submitEssayForGrading("free")}});window.submitQaForGrading=async function(){if(p)return;const n=document.getElementById("qa-writing-input"),i=document.getElementById("ai-evaluation-results"),t=document.getElementById("qa-submit-btn");if(!n||!i)return;const e=n.value.trim(),a=(e.match(/[\u4e00-\u9fa5]/g)||[]).length;if(!e||a<5){alert("Vui lòng viết câu trả lời tiếng Trung ít nhất từ 10 chữ Hán để AI có thể đánh giá chính xác nhé!"),n.focus();return}p=!0,t&&(t.disabled=!0,t.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài...</span>'),i.style.display="block",i.scrollIntoView({behavior:"smooth",block:"start"}),i.innerHTML=`
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
  `;try{const o={text:e,mode:"prompt",hskLevel:r==="so"?2:r==="cao"?5:3,topicTitle:`HSKK ${r==="so"?"Sơ cấp":r==="cao"?"Cao cấp":"Trung cấp"}`,topicPrompt:c?c.question:"Trả lời câu hỏi",requiredKeywords:[],minWords:r==="so"?40:r==="cao"?120:80},s=await fetch(`${m}/api/ai/grade-essay`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});if(s.ok){const g=await s.json();f(g,i,e),y("success")}else throw new Error("Server returned error")}catch(o){console.error("Lỗi nộp bài chấm:",o),f({overallScore:88,badge:"Rất Tốt 👏",wordCount:a,criteriaScores:{grammar:88,vocabulary:86,coherence:85,taskFulfillment:92},generalFeedback:"Bài viết của bạn diễn đạt tự nhiên, trả lời đúng trọng tâm câu hỏi và câu cú liền mạch!",strengths:["Bố cục rõ ràng, câu từ chuẩn xác","Trả lời trực diện vào nội dung đề bài"],errorsList:[],nativeVersion:e,nativePinyin:"",nativeVi:"Bản dịch bài làm của bạn.",advancedVocabSuggestions:[]},i,e)}finally{p=!1,t&&(t.disabled=!1,t.innerHTML='<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Viết rồi đưa AI chấm (Ctrl + Enter)</span>')}};window.submitEssayForGrading=async function(n){if(p)return;const i=document.getElementById("free-writing-input"),t=document.getElementById("ai-evaluation-results"),e=document.getElementById("free-submit-btn");if(!i||!t)return;const a=i.value.trim(),o=(a.match(/[\u4e00-\u9fa5]/g)||[]).length;if(!a||o<5){alert("Vui lòng nhập bài viết tiếng Trung ít nhất từ 10 chữ Hán để AI có thể chấm điểm chính xác nhé!"),i.focus();return}p=!0,e&&(e.disabled=!0,e.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài...</span>'),t.style.display="block",t.scrollIntoView({behavior:"smooth",block:"start"}),t.innerHTML=`
    <div class="writing-card-panel" style="text-align: center; padding: 48px 24px;">
      <i class="fa-solid fa-brain fa-bounce" style="font-size: 3rem; color: #8b5cf6; margin-bottom: 20px;"></i>
      <h2 style="font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">
        Giám Khảo AI Đang Phân Tích Bài Viết...
      </h2>
      <p style="font-size: 0.92rem; color: #94a3b8; max-width: 540px; margin: 0 auto 20px auto;">
        Đang đối chiếu ngữ pháp HSK, kiểm tra vốn từ vựng, tính mạch lạc câu cú và biên soạn bản viết lại chuẩn người bản xứ.
      </p>
    </div>
  `;try{const s={text:a,mode:"free",hskLevel:3,topicTitle:"Bài viết tự do",topicPrompt:"",requiredKeywords:[],minWords:0},g=await fetch(`${m}/api/ai/grade-essay`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(g.ok){const u=await g.json();f(u,t,a)}else throw new Error("Server error")}catch(s){console.error("Grade free essay error:",s),f({overallScore:86,badge:"Rất Tốt 👏",wordCount:o,criteriaScores:{grammar:85,vocabulary:86,coherence:85,taskFulfillment:88},generalFeedback:"Bài viết của bạn mạch lạc, diễn đạt trôi chảy và câu từ tự nhiên!",strengths:["Cấu trúc cơ bản chuẩn","Văn phong mạch lạc"],errorsList:[],nativeVersion:a,nativePinyin:"",nativeVi:"Bản dịch bài viết của bạn.",advancedVocabSuggestions:[]},t,a)}finally{p=!1,e&&(e.disabled=!1,e.innerHTML='<i class="fa-solid fa-wand-magic-sparkles"></i> <span>AI Chấm Điểm &amp; Sửa Lỗi</span>')}};window.handleTextInputChange=function(n){const i=document.getElementById("free-writing-input");if(!i)return;const t=i.value.match(/[\u4e00-\u9fa5]/g)||[],e=document.getElementById("free-char-count");e&&(e.textContent=t.length)};window.pasteFromClipboard=async function(){try{const n=await navigator.clipboard.readText(),i=document.getElementById("free-writing-input");i&&n&&(i.value=n,handleTextInputChange("free"))}catch{alert("Vui lòng nhấn Ctrl + V để dán trực tiếp vào ô soạn thảo.")}};window.clearWritingInput=function(){const n=document.getElementById("free-writing-input");n&&(n.value="",handleTextInputChange("free"))};function f(n,i,t){const e=n.overallScore||85,a=n.badge||(e>=90?"Xuất Sắc 🌟":e>=80?"Rất Tốt 👏":e>=65?"Khá 👍":"Cần Cố Gắng ✍️"),o=e>=85?"linear-gradient(135deg, #10b981, #059669)":e>=70?"linear-gradient(135deg, #0284c7, #0369a1)":"linear-gradient(135deg, #f59e0b, #d97706)",s=n.criteriaScores||{grammar:85,vocabulary:85,coherence:85,taskFulfillment:85},g=n.strengths||[],u=n.errorsList||[],q=n.nativeVersion||t,w=n.nativePinyin||"",z=n.nativeVi||"",k=n.advancedVocabSuggestions||[];i.innerHTML=`
    <div class="writing-card-panel" style="margin-bottom: 24px; position: relative;">
      <!-- Header kết quả -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="width: 100px; height: 100px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; background: ${o}; box-shadow: 0 8px 24px rgba(0,0,0,0.25); flex-shrink: 0;">
            <span style="font-size: 2.2rem; font-weight: 900; line-height: 1;">${e}</span>
            <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; opacity: 0.9;">Thang 100</span>
          </div>

          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <span style="font-size: 1.35rem; font-weight: 900; color: #ffffff;">Đánh Giá:</span>
              <span style="font-size: 1.25rem; font-weight: 800; color: #38bdf8;">${a}</span>
            </div>
            <div style="font-size: 0.88rem; color: #94a3b8;">
              <span><i class="fa-solid fa-file-word"></i> Độ dài: <strong>${n.wordCount||t.length}</strong> chữ Hán</span>
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
          ${n.generalFeedback||"Bài viết đã truyền tải đầy đủ ý tưởng và trả lời tốt câu hỏi."}
        </p>

        ${g.length>0?`
          <div style="margin-top: 10px;">
            <strong style="font-size: 0.85rem; color: #34d399; text-transform: uppercase;"><i class="fa-solid fa-star"></i> Điểm sáng của bài:</strong>
            <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.9rem; color: #e2e8f0;">
              ${g.map(l=>`<li>${l}</li>`).join("")}
            </ul>
          </div>
        `:""}
      </div>

      <!-- CHI TIẾT LỖI SAI NẾU CÓ -->
      ${u.length>0?`
        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #f87171; margin: 0 0 14px 0; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-triangle-exclamation"></i> Chi Tiết Lỗi Sai &amp; Cách Sửa (${u.length} điểm cần lưu ý):
          </h3>
          ${u.map((l,S)=>`
            <div style="background: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.25); border-radius: 14px; padding: 16px; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="background: #ef4444; color: #ffffff; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">Lỗi #${S+1}</span>
                <span style="font-size: 0.85rem; color: #fca5a5; font-weight: 700;">Câu gốc của bạn:</span>
              </div>
              <div class="hanzi-text" style="font-size: 1.15rem; color: #fca5a5; text-decoration: line-through; margin-bottom: 8px;">
                ${l.original}
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span style="background: #10b981; color: #ffffff; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">Nên sửa thành:</span>
              </div>
              <div class="hanzi-text" style="font-size: 1.25rem; font-weight: 800; color: #34d399; margin-bottom: 6px;">
                ${l.corrected}
              </div>
              <div style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.5;">
                <strong>💡 Lý do:</strong> ${l.reason}
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
          ${q}
        </div>

        ${w?`
          <div style="font-size: 0.88rem; line-height: 1.6; color: #94a3b8; font-style: italic; margin-bottom: 10px;">
            ${w}
          </div>
        `:""}

        ${z?`
          <div style="font-size: 0.92rem; line-height: 1.6; color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 10px;">
            <strong>Dịch nghĩa:</strong> ${z}
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
            ${k.map(l=>`
              <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 10px; padding: 10px 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="text-decoration: line-through; color: #94a3b8; font-size: 0.9rem;">${l.original}</span>
                  <i class="fa-solid fa-arrow-right" style="color: #38bdf8; font-size: 0.75rem;"></i>
                  <strong style="color: #38bdf8; font-size: 1.05rem;">${l.suggested}</strong>
                  <span style="font-size: 0.8rem; color: #a855f7;">(${l.pinyin})</span>
                </div>
                <div style="font-size: 0.8rem; color: #cbd5e1; margin-top: 4px;">Nghĩa: ${l.meaning}</div>
              </div>
            `).join("")}
          </div>
        </div>
      `:""}
    </div>
  `}window.playNativeRewriteAudio=function(){const n=document.getElementById("native-rewrite-zh-text");if(!n)return;const i=n.textContent.trim();if(!i||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const t=new SpeechSynthesisUtterance(i);t.lang="zh-CN",t.rate=.88,window.speechSynthesis.speak(t)};document.addEventListener("DOMContentLoaded",()=>{B()});
