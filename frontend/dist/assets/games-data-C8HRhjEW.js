function S(v){return v?v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ü/g,"v").replace(/[^a-z0-9]/g,"").trim():""}class A{constructor(){this.ctx=null,this.isPlaying=!1,this.masterGain=null,this.noteTimeout=null,this.droneNodes=[],this.noteIdx=0,this.patternIdx=0}init(){if(this.ctx)return;const t=window.AudioContext||window.webkitAudioContext;t&&(this.ctx=new t,this.masterGain=this.ctx.createGain(),this.masterGain.gain.setValueAtTime(0,this.ctx.currentTime),this.masterGain.connect(this.ctx.destination))}playNote(t,i=1.2,n=.08,e="sine"){if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();try{const s=this.ctx.createOscillator(),a=this.ctx.createGain();s.type=e,s.frequency.setValueAtTime(t,this.ctx.currentTime),a.gain.setValueAtTime(0,this.ctx.currentTime),a.gain.linearRampToValueAtTime(n,this.ctx.currentTime+.1),a.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+i),s.connect(a),a.connect(this.masterGain),s.start(),s.stop(this.ctx.currentTime+i+.05)}catch{}}}startDrone(){}stopDrone(){this.droneNodes.forEach(({osc:t,gain:i})=>{try{i.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+.5),t.stop(this.ctx.currentTime+.55)}catch{}}),this.droneNodes=[]}start(){if(this.init(),!this.ctx||this.isPlaying)return;this.isPlaying=!0,this.ctx.state==="suspended"&&this.ctx.resume(),this.masterGain.gain.linearRampToValueAtTime(1,this.ctx.currentTime+2);const t=[[392,440,523,392,329,261,293,261],[261,329,392,440,392,329,261,220],[523,440,392,329,261,293,329,392],[440,392,329,261,293,329,392,440]],i=()=>{if(!this.isPlaying||!this.ctx)return;const n=t[this.patternIdx%t.length],e=n[this.noteIdx%n.length],s=1.6+Math.random()*.8,a=.045+Math.random()*.025;this.playNote(e,s,a,"sine"),Math.random()<.3&&setTimeout(()=>{this.isPlaying&&this.playNote(e*2,s*.7,a*.4,"sine")},300),this.noteIdx++,this.noteIdx%n.length===0&&this.patternIdx++,this.noteTimeout=setTimeout(i,900+Math.random()*600)};setTimeout(i,800)}stop(){if(this.isPlaying=!1,this.noteTimeout&&(clearTimeout(this.noteTimeout),this.noteTimeout=null),this.ctx&&this.masterGain)try{this.masterGain.gain.linearRampToValueAtTime(.001,this.ctx.currentTime+1)}catch{}this.stopDrone()}playSFX(t,i,n="sine",e=60){this.ctx&&(this.ctx.state==="suspended"&&this.ctx.resume(),t.forEach((s,a)=>setTimeout(()=>{this.ctx&&this.playNote(s,.25,i[a]||.1,n)},a*e)))}playHit(){this.playSFX([880,1108],[.15,.1],"triangle",60)}playMiss(){this.playNote(180,.3,.12,"sawtooth")}playStreak(){this.playSFX([523,659,784,1047],[.12,.12,.12,.12],"sine",60)}playHeartRestore(){this.playSFX([523,659,784,1047,1319],[.1,.1,.1,.1,.1],"sine",80)}playGameOver(){this.playSFX([440,370,330,261],[.15,.15,.15,.15],"sawtooth",150)}playVictory(){this.playSFX([523,659,784,1047,1319,1568],[.12,.12,.12,.12,.12,.12],"sine",100)}}class N{constructor(t,i,n){this.container=t;const e=i&&i.length>0?i:[{word:"老师",pinyin:"laoshi",meaning:"giáo viên"},{word:"学生",pinyin:"xuesheng",meaning:"học sinh"},{word:"学校",pinyin:"xuexiao",meaning:"trường học"},{word:"电脑",pinyin:"diannao",meaning:"máy tính"},{word:"苹果",pinyin:"pingguo",meaning:"quả táo"},{word:"香蕉",pinyin:"xiangjiao",meaning:"quả chuối"}];this.rawWords=e.map(s=>({...s,id:s.id||s._id||s.word||s.char||s.hanzi,word:s.word||s.char||s.hanzi||"",pinyin:s.pinyin||"",meaning:s.meaning||s.vn||s.trans||""})).filter(s=>s.word&&s.pinyin),this.rawWords.length===0&&(this.rawWords=[{word:"老师",pinyin:"laoshi",meaning:"giáo viên"},{word:"学生",pinyin:"xuesheng",meaning:"học sinh"}]),this.displayMode="both",this.playMode=localStorage.getItem("cannon_play_mode")||"practice",this.onExit=n,this.music=new A,this.score=0,this.combo=0,this.maxCombo=0,this.lives=3,this.maxLives=3,this.isRunning=!1,this.isPaused=!1,this.lastFrameTime=0,this.spawnTimer=0,this.wordQueue=[],this.activeWords=[],this.correctWordsSet=new Set,this.wordsDestroyedCount=0,this.typedBuffer="",this.lockedTarget=null,this.wrongStreak=0,this.slowMoTimer=0,this.score2xTimer=0,this.shieldActive=!1,this.shieldTimer=0,this.timerInterval=null,this.animFrameId=null,this.keyHandler=null,this.renderLayout(),this.bindEvents()}renderLayout(){this.container.innerHTML=`
<div class="phidao-wrapper">
<style>
.phidao-wrapper{position:relative;width:100%;height:100%;min-height:560px;background:linear-gradient(180deg,#0b1528 0%,#111e38 50%,#0d172a 100%);display:flex;flex-direction:column;overflow:hidden;font-family:'Inter','Segoe UI',system-ui,sans-serif;color:#f8fafc;}
.phidao-bg{position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(circle at 82% 18%,rgba(56,189,248,.18) 0%,transparent 40%),radial-gradient(circle at 20% 40%,rgba(168,85,247,.15) 0%,transparent 45%),linear-gradient(180deg,#071120 0%,#0e1e38 45%,#132746 80%,#0f1c32 100%);}
.phidao-moon{position:absolute;top:20px;right:90px;width:76px;height:76px;background:radial-gradient(circle at 35% 35%,#fffdf0 0%,#fef08a 40%,#eab308 85%,#ca8a04 100%);border-radius:50%;box-shadow:0 0 40px 15px rgba(254,240,138,.4),0 0 90px 45px rgba(234,179,8,.15);opacity:.95;}
.phidao-star{position:absolute;border-radius:50%;background:#ffffff;box-shadow:0 0 6px rgba(255,255,255,.9);animation:starTwinkle var(--dur,3s) ease-in-out infinite;animation-delay:var(--delay,0s);}
@keyframes starTwinkle{0%,100%{opacity:.9;transform:scale(1)}50%{opacity:.3;transform:scale(.6)}}
.phidao-sakura-p{position:absolute;font-size:14px;opacity:.75;filter:drop-shadow(0 0 6px rgba(244,114,182,.6));animation:sakuraFall linear infinite;animation-duration:var(--dur,8s);animation-delay:var(--delay,0s);}
@keyframes sakuraFall{0%{transform:translateY(-20px) rotate(0deg);opacity:.8}100%{transform:translateY(120vh) rotate(720deg);opacity:0}}

/* TOP HUD */
.phidao-hud{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:10px 18px;background:rgba(15,23,42,.88);backdrop-filter:blur(12px);border-bottom:1.5px solid rgba(255,255,255,.15);box-shadow:0 4px 20px rgba(0,0,0,.35);flex-shrink:0;}
.phidao-hud-center{display:flex;align-items:center;gap:14px;}
.phidao-hud-left,.phidao-hud-right{display:flex;gap:8px;align-items:center;}
.phidao-btn-icon{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#f1f5f9;border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.95rem;transition:all .2s;}
.phidao-btn-icon:hover{background:rgba(255,255,255,.25);transform:scale(1.08);}
.phidao-stat{display:flex !important;align-items:center !important;gap:6px !important;color:#ffffff !important;font-weight:900 !important;font-size:1.15rem !important;text-shadow:0 1px 2px rgba(0,0,0,.5) !important;}
.phidao-stat span{font-family:'Outfit','Inter',system-ui,sans-serif !important;font-weight:900 !important;display:inline-block !important;font-size:1.15rem !important;}
#cannon-score-val{color:#fde047 !important;text-shadow:none !important;}
#cannon-combo-val{color:#fb923c !important;text-shadow:none !important;}

html.light-mode .phidao-stat,
html.light-mode .phidao-stat span,
html:not(.dark) .phidao-stat,
html:not(.dark) .phidao-stat span {
  color: #ffffff !important;
}
html.light-mode #cannon-score-val,
html:not(.dark) #cannon-score-val {
  color: #fde047 !important;
  text-shadow: none !important;
}
html.light-mode #cannon-combo-val,
html:not(.dark) #cannon-combo-val {
  color: #fb923c !important;
  text-shadow: none !important;
}
.phidao-lives-row{display:flex;gap:5px;font-size:1.1rem;filter:none;}

/* BUFF BANNER */
.phidao-buff-banner{position:relative;z-index:10;text-align:center;background:linear-gradient(90deg,rgba(245,158,11,.2),rgba(239,68,68,.25),rgba(245,158,11,.2));border-bottom:1.5px solid rgba(245,158,11,.4);color:#fef08a;font-size:.85rem;font-weight:800;padding:5px 12px;flex-shrink:0;text-shadow:none;}

/* PLAYFIELD - MAX EXPANDED SKY */
.phidao-playfield{position:relative;z-index:5;flex:1;overflow:hidden;min-height:480px;}
.phidao-words-layer,.phidao-fx-layer{position:absolute;inset:0;pointer-events:none;}

/* FLOATING SKILL DOCK (Góc Phải) */
.phidao-floating-skills{position:absolute;right:14px;top:20px;z-index:20;display:flex;flex-direction:column;gap:7px;background:rgba(15,23,42,.78);backdrop-filter:blur(10px);border:1.5px solid rgba(255,255,255,.14);border-radius:16px;padding:8px 6px;box-shadow:0 8px 30px rgba(0,0,0,.45);}
.phidao-skills-label{font-size:.62rem;font-weight:800;color:#94a3b8;text-align:center;letter-spacing:.05em;padding-bottom:3px;border-bottom:1px solid rgba(255,255,255,.08);}
.phidao-skill-btn{display:flex;flex-direction:column;align-items:center;gap:1px;background:rgba(30,41,59,.8);border:1.5px solid rgba(255,255,255,.12);border-radius:10px;padding:5px 10px;color:#cbd5e1;cursor:pointer;transition:all .2s;min-width:68px;}
.phidao-skill-btn .s-emoji{font-size:1.1rem;}
.phidao-skill-btn .s-label{font-size:.64rem;font-weight:800;color:#ffffff;}
.phidao-skill-btn .s-cost{font-size:.58rem;color:#94a3b8;font-weight:700;}
.phidao-skill-btn.affordable{border-color:#fbbf24;background:linear-gradient(135deg,rgba(251,191,36,.25),rgba(245,158,11,.15));box-shadow:0 0 14px rgba(251,191,36,.4);}
.phidao-skill-btn.affordable .s-cost{color:#fde047;}
.phidao-skill-btn:hover.affordable{transform:scale(1.08);}

/* CHARACTER & LUMINOUS GROUND */
.phidao-char-zone{position:absolute;bottom:0;left:0;right:0;height:70px;display:flex;align-items:flex-end;justify-content:center;}
.phidao-ground-snow{position:absolute;bottom:0;left:0;right:0;height:42px;background:linear-gradient(180deg,#f1f5f9 0%,#e2e8f0 40%,#cbd5e1 100%);border-top:3px solid #38bdf8;box-shadow:0 -4px 20px rgba(56,189,248,.4),inset 0 2px 6px #ffffff;}
.phidao-ground-line{position:absolute;bottom:40px;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(56,189,248,.6) 20%,#38bdf8 50%,rgba(56,189,248,.6) 80%,transparent);box-shadow:0 0 10px #38bdf8;}
.phidao-character{position:relative;z-index:6;font-size:2.8rem;bottom:26px;animation:charBreathe 3s ease-in-out infinite;filter:drop-shadow(0 6px 16px rgba(0,0,0,.5)) drop-shadow(0 0 12px rgba(56,189,248,.6));user-select:none;}
@keyframes charBreathe{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-4px) scale(1.04)}}
.phidao-character.throw-anim{animation:charThrow .25s ease-out;}
@keyframes charThrow{0%{transform:translateX(0) rotate(0deg)}30%{transform:translateX(-10px) rotate(-12deg)}70%{transform:translateX(12px) rotate(8deg)}100%{transform:translateX(0) rotate(0deg)}}

/* FLOATING INPUT INDICATOR (Dưới cùng chính giữa) */
.phidao-floating-input-bar{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);z-index:20;display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:none;}
.phidao-typed-buf{min-width:220px;min-height:42px;background:rgba(15,23,42,.95);border:2px solid rgba(56,189,248,.6);border-radius:12px;padding:3px 14px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(56,189,248,.3);transition:all .2s;pointer-events:auto;cursor:text;}
.phidao-typed-buf.has-match{border-color:#fbbf24;background:rgba(251,191,36,.2);box-shadow:0 0 28px rgba(251,191,36,.6);}
.phidao-real-input{background:transparent !important;border:none !important;outline:none !important;color:#fde047 !important;font-family:'Be Vietnam Pro',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,monospace,sans-serif !important;font-size:1.35rem !important;font-weight:900 !important;text-align:center !important;width:280px !important;letter-spacing:.05em !important;caret-color:#fbbf24 !important;}
.phidao-real-input::placeholder{color:rgba(253,224,71,.5) !important;font-size:.92rem !important;font-weight:600 !important;font-family:'Inter',system-ui,sans-serif !important;}
.phidao-input-tip-sub{font-size:.74rem;font-weight:700;color:#cbd5e1;background:rgba(15,23,42,.85);padding:3px 12px;border-radius:20px;backdrop-filter:blur(6px);text-shadow:0 1px 2px #000;border:1px solid rgba(255,255,255,.12);pointer-events:auto;}
.phidao-target-hint{font-size:.82rem;color:#fef08a;font-weight:700;min-width:100px;text-align:center;pointer-events:auto;}

/* WORD CARDS - Clean, crisp, subtle shadows without heavy blur/glow */
.phidao-word-card{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:#ffffff;border:2px solid #0284c7;border-radius:16px;padding:8px 16px 8px;min-width:95px;box-shadow:0 4px 12px rgba(0,0,0,.15);will-change:transform;transition:border-color .15s,box-shadow .15s,transform .1s;}
.phidao-word-card.is-targeted{border-color:#f59e0b !important;background:#fffbeb !important;box-shadow:0 4px 16px rgba(245,158,11,.45) !important;transform:scale(1.06);}
.phidao-word-card.type-star{border-color:#a855f7;background:#ffffff;box-shadow:0 4px 12px rgba(168,85,247,.25);}
.phidao-word-card .word-zh{font-family:'LXGW WenKai Lite','Kaiti','STKaiti','Kai','PingFang SC','Noto Serif SC',sans-serif;font-size:2.05rem;font-weight:900;color:#0f172a !important;line-height:1.1;letter-spacing:.05em;-webkit-text-fill-color:initial !important;text-shadow:none !important;filter:none !important;-webkit-font-smoothing:antialiased;}
.phidao-word-card .word-meaning-sub{font-size:.8rem;font-weight:700;color:#047857;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;padding:1px 8px;margin-top:3px;max-width:150px;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.phidao-word-card .word-meaning-main{font-size:1.15rem;font-weight:900;color:#047857 !important;text-align:center;padding:2px 6px;max-width:160px;line-height:1.25;}
.phidao-word-card .pinyin-prog{font-size:.9rem;font-family:'Courier New',Courier,monospace;font-weight:800;letter-spacing:.06em;background:#f1f5f9;border:1px solid #cbd5e1;padding:2px 10px;border-radius:8px;margin-top:2px;display:flex;align-items:center;gap:4px;}
.phidao-word-card .py-typed{color:#ea580c;font-weight:900;}
.phidao-word-card .py-rem{color:#475569;}
.phidao-word-card .word-py-tone-tag{color:#0284c7;font-weight:800;font-size:.82rem;margin-left:2px;}
.phidao-word-card.type-star .word-zh{color:#6b21a8 !important;text-shadow:none !important;filter:none !important;}

/* MODE SWITCHER BAR */
.phidao-mode-bar{position:relative;z-index:15;display:flex;justify-content:center;gap:6px;padding:6px 12px;background:rgba(15,23,42,.85);backdrop-filter:blur(8px);border-bottom:1px solid rgba(255,255,255,.1);flex-wrap:wrap;}
.phidao-mode-pill{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:20px;padding:3px 12px;color:#94a3b8;font-size:.78rem;font-weight:800;cursor:pointer;transition:all .2s;}
.phidao-mode-pill:hover{background:rgba(255,255,255,.18);color:#f1f5f9;}
.phidao-mode-pill.active{background:linear-gradient(135deg,#0284c7,#0369a1);border-color:#38bdf8;color:#ffffff;box-shadow:0 0 12px rgba(56,189,248,.4);}
.buf-wrong-shake{animation:bufShake .3s ease-in-out;}
@keyframes bufShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px);border-color:#ef4444}75%{transform:translateX(6px);border-color:#ef4444}}

/* VIETNAMESE MEANING POPUP ON HIT */
.phidao-hit-meaning-card{position:absolute;background:linear-gradient(135deg,rgba(16,185,129,.95),rgba(5,150,105,.95));border:1.5px solid #6ee7b7;border-radius:12px;padding:6px 14px;color:#ffffff;pointer-events:none;z-index:25;box-shadow:0 8px 24px rgba(0,0,0,.4),0 0 20px rgba(16,185,129,.6);animation:hitPopupFloat 2.2s ease-out forwards;min-width:140px;text-align:center;}
@keyframes hitPopupFloat{0%{transform:translateY(0) scale(.7);opacity:0}15%{transform:translateY(-10px) scale(1.08);opacity:1}30%{transform:translateY(-18px) scale(1);opacity:1}80%{transform:translateY(-35px) scale(.98);opacity:1}100%{transform:translateY(-55px) scale(.85);opacity:0}}
.phidao-hit-top{display:flex;align-items:center;justify-content:center;gap:6px;font-size:.85rem;font-weight:800;}
.phidao-hit-pts{color:#fef08a;font-weight:900;font-size:.95rem;}
.phidao-hit-zh{font-family:'LXGW WenKai Lite','Kaiti','STKaiti','Kai','PingFang SC','Noto Serif SC',sans-serif;font-size:1.15rem;font-weight:800;}
.phidao-hit-py{color:#a7f3d0;font-size:.8rem;}
.phidao-hit-mean{font-size:.88rem;font-weight:700;color:#ffffff;margin-top:2px;text-shadow:0 1px 3px rgba(0,0,0,.6);}

.phidao-dagger{position:absolute;font-size:1.4rem;pointer-events:none;z-index:20;filter:drop-shadow(0 0 10px rgba(251,191,36,.8));}
.phidao-explosion{position:absolute;width:55px;height:55px;border-radius:50%;pointer-events:none;z-index:20;animation:explode .4s ease-out forwards;}
@keyframes explode{0%{transform:scale(.3);opacity:1}100%{transform:scale(2.2);opacity:0}}
.phidao-explosion.type-normal{background:radial-gradient(circle,rgba(251,191,36,.9),rgba(249,115,22,.4) 60%,transparent);}
.phidao-explosion.type-star{background:radial-gradient(circle,rgba(192,132,252,.95),rgba(129,140,248,.5) 60%,transparent);}
.phidao-float-text{position:absolute;font-size:1.05rem;font-weight:900;pointer-events:none;z-index:25;animation:floatUp .9s ease-out forwards;white-space:nowrap;text-shadow:0 2px 8px rgba(0,0,0,.8);}
@keyframes floatUp{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-48px) scale(.85);opacity:0}}
.phidao-miss-flash{position:absolute;inset:0;background:rgba(239,68,68,.3);pointer-events:none;z-index:30;animation:missFlash .35s ease-out forwards;}
@keyframes missFlash{0%{opacity:1}100%{opacity:0}}

.phidao-modal-overlay{position:absolute;inset:0;z-index:100;background:rgba(7,16,30,.88);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:16px;}
.phidao-result-card{position:relative;background:linear-gradient(160deg,rgba(10,20,40,.98),rgba(15,30,55,.96));border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:32px 28px 28px;max-width:540px;width:95%;max-height:90vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,.7);text-align:center;}
.phidao-modal-close-x{position:absolute;top:14px;right:18px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#94a3b8;font-size:1.4rem;line-height:1;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;z-index:10;}
.phidao-modal-close-x:hover{background:rgba(239,68,68,.2);color:#ef4444;border-color:rgba(239,68,68,.4);}
.phidao-result-icon{font-size:2.8rem;margin-bottom:6px;}
.phidao-result-title{font-size:1.45rem;font-weight:900;color:#f1f5f9;margin:0 0 6px;}
.phidao-result-desc{font-size:.88rem;color:#94a3b8;margin:0 0 16px;}
.phidao-result-stats{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:14px;}
.phidao-stat-pill{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:8px 16px;display:flex;flex-direction:column;gap:2px;}
.phidao-stat-pill span{font-size:.68rem;color:#64748b;text-transform:uppercase;letter-spacing:.06em;}
.phidao-stat-pill strong{font-size:1.3rem;font-weight:900;color:#fbbf24;}
.phidao-summary-section-title{display:flex;align-items:center;justify-content:center;gap:8px;font-size:.88rem;font-weight:800;color:#fbbf24;text-transform:uppercase;letter-spacing:.05em;margin:14px 0 8px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,.08);}
.phidao-result-tip{background:rgba(251,191,36,.08);border:1px dashed rgba(251,191,36,.25);border-radius:12px;padding:8px 12px;font-size:.76rem;color:#cbd5e1;text-align:left;margin:8px 0 14px;line-height:1.4;}
.phidao-result-actions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px;}
.phidao-action-btn{padding:9px 18px;border-radius:12px;font-weight:700;font-size:.86rem;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .2s;border:none;}
.phidao-action-btn.primary{background:linear-gradient(135deg,#f59e0b,#d97706);color:#1a0a00;}
.phidao-action-btn.warn{background:linear-gradient(135deg,#ef4444,#b91c1c);color:#ffffff;}
.phidao-action-btn.warn:hover{transform:scale(1.04);box-shadow:0 4px 16px rgba(239,68,68,.35);}
.phidao-action-btn.secondary{background:rgba(255,255,255,.08);color:#e2e8f0;border:1px solid rgba(255,255,255,.15);}
.phidao-action-btn.outline{background:transparent;color:#94a3b8;border:1px solid rgba(255,255,255,.1);}
.phidao-action-btn:hover{transform:scale(1.04);}
.phidao-pause-card{max-width:440px;border:1px solid rgba(56,189,248,.3);box-shadow:0 24px 64px rgba(0,0,0,.85),0 0 32px rgba(56,189,248,.15);}
.game-center-countdown-tick{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(2);font-size:3rem;font-weight:900;color:#ef4444;pointer-events:none;z-index:50;opacity:0;}
.game-center-countdown-tick.tick-anim{animation:tickPop .7s ease-out forwards;}
@keyframes tickPop{0%{transform:translate(-50%,-50%) scale(2.5);opacity:1}100%{transform:translate(-50%,-50%) scale(.8);opacity:0}}
</style>
<div class="phidao-bg"><div class="phidao-moon"></div><div id="phidao-stars"></div><div id="phidao-sakura"></div></div>
<div class="phidao-hud">
  <div class="phidao-hud-left">
    <button id="cannon-top-back-btn" class="phidao-btn-icon" title="Quay lại"><i class="fa-solid fa-arrow-left"></i></button>
    <button id="cannon-pause-btn" class="phidao-btn-icon" title="Tạm dừng (Esc)"><i class="fa-solid fa-pause"></i></button>
    <!-- Play Mode Toggle Button -->
    <button type="button" id="cannon-playmode-toggle-btn" class="phidao-btn-icon" title="Chuyển chế độ Kiểm tra (Không tính tim) / Thi đấu (3 Tim)" style="width: auto; padding: 4px 12px; font-weight: 800; border-radius: 50px;">
      <span id="cannon-mode-icon-text">${this.playMode==="practice"?'<i class="fa-solid fa-infinity" style="color: #10b981;"></i> <span style="font-size: 0.8rem; color:#10b981; margin-left: 4px;">Kiểm tra</span>':'<i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span style="font-size: 0.8rem; color:#fbbf24; margin-left: 4px;">Thi đấu</span>'}</span>
    </button>
  </div>
  <div class="phidao-hud-center">
    <div class="phidao-stat"><i class="fa-solid fa-star" style="color:#fbbf24;"></i><span id="cannon-score-val">0</span></div>
    <div class="phidao-lives-row" id="cannon-lives-container">
      ${this.playMode==="practice"?'<span style="color: #10b981; font-weight: 900; font-size: 0.95rem;"><i class="fa-solid fa-infinity"></i> Vô Hạn</span>':'<i class="fa-solid fa-heart" style="color:#ef4444;"></i><i class="fa-solid fa-heart" style="color:#ef4444;"></i><i class="fa-solid fa-heart" style="color:#ef4444;"></i>'}
    </div>
    <div class="phidao-stat"><i class="fa-solid fa-fire" style="color:#f97316;"></i><span id="cannon-combo-val">x0</span></div>
  </div>
  <div class="phidao-hud-right">
    <button id="cannon-exit-btn" class="phidao-btn-icon" title="Thoát"><i class="fa-solid fa-xmark"></i></button>
  </div>
</div>
<!-- MODE BAR -->
<div class="phidao-mode-bar">
  <button type="button" class="phidao-mode-pill active" data-mode="both" title="Hiện cả Chữ Hán, Pinyin & Tiếng Việt">👁️ Hán + Pinyin + Việt</button>
  <button type="button" class="phidao-mode-pill" data-mode="meaning" title="Hiện Tiếng Việt nổi bật (luyện phản xạ gõ Chữ Hán hoặc Pinyin)">🇻🇳 Chỉ Tiếng Việt</button>
  <button type="button" class="phidao-mode-pill" data-mode="hanzi" title="Chỉ hiện Chữ Hán (tự nhớ Pinyin/Nghĩa để gõ)">🔤 Chỉ Hán</button>
  <button type="button" class="phidao-mode-pill" data-mode="pinyin" title="Chỉ hiện Phiên âm Pinyin">🔠 Chỉ Pinyin</button>
  <button type="button" class="phidao-mode-pill" data-mode="listen" title="VIP: Luyện nghe phát âm & gõ Pinyin">🎧 Luyện Nghe</button>
</div>
<div id="cannon-buff-banner" class="phidao-buff-banner" style="display:none;"></div>
<div class="phidao-playfield" id="cannon-playfield">
  <div id="cannon-words-layer" class="phidao-words-layer"></div>
  <div id="cannon-fx-layer" class="phidao-fx-layer"></div>
  
  <!-- FLOATING SKILL DOCK (Góc Phải) -->
  <div class="phidao-floating-skills">
    <div class="phidao-skills-label"><i class="fa-solid fa-wand-magic-sparkles"></i> KỸ NĂNG</div>
    <button class="phidao-skill-btn" id="skill-ice" data-cost="10" title="Alt+1: Làm chậm">
      <span class="s-emoji">❄️</span><span class="s-label">Mưa Băng</span><span class="s-cost">10 combo</span>
    </button>
    <button class="phidao-skill-btn" id="skill-heal" data-cost="20" title="Alt+2: Hồi máu">
      <span class="s-emoji">💚</span><span class="s-label">Hồi Máu</span><span class="s-cost">20 combo</span>
    </button>
    <button class="phidao-skill-btn" id="skill-x2" data-cost="30" title="Alt+3: Nhân đôi">
      <span class="s-emoji">⭐</span><span class="s-label">Nhân Điểm</span><span class="s-cost">30 combo</span>
    </button>
    <button class="phidao-skill-btn" id="skill-shield" data-cost="20" title="Alt+4: Khiên">
      <span class="s-emoji">🛡️</span><span class="s-label">Lá Chắn</span><span class="s-cost">20 combo</span>
    </button>
  </div>

  <!-- CHARACTER & LUMINOUS GROUND (Ở Đáy) -->
  <div class="phidao-char-zone">
    <div class="phidao-ground-line"></div>
    <div class="phidao-character" id="phidao-character">🥷</div>
    <div class="phidao-ground-snow"></div>
  </div>

  <!-- FLOATING INPUT INDICATOR (Dưới cùng chính giữa) -->
  <div class="phidao-floating-input-bar">
    <div class="phidao-typed-buf" id="phidao-typed-buf">
      <input type="text" id="phidao-real-input"
        placeholder="Gõ Pinyin hoặc Chữ Hán..."
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
        class="phidao-real-input" />
    </div>
    <div class="phidao-input-tip-sub"><i class="fa-solid fa-keyboard" style="color:#38bdf8;"></i> Gõ <strong>Pinyin</strong> hoặc <strong>Chữ Hán</strong> trực tiếp để phóng phi đao (Bấm <strong>Esc</strong> để tạm dừng)</div>
    <div class="phidao-target-hint" id="phidao-target-hint"></div>
  </div>
</div>
<!-- PAUSE MODAL OVERLAY -->
<div id="cannon-pause-overlay" class="phidao-modal-overlay" style="display:none; z-index:105;">
  <div class="phidao-result-card phidao-pause-card">
    <button type="button" id="cannon-pause-close-x" class="phidao-modal-close-x" title="Tiếp tục">&times;</button>
    <div class="phidao-result-icon" style="font-size:2.8rem; filter:drop-shadow(0 0 16px rgba(251,191,36,.5));">⏸️</div>
    <h2 class="phidao-result-title" style="color:#38bdf8;">Đang Tạm Dừng</h2>
    <p class="phidao-result-desc">Trận chiến đang đóng băng. Bạn có thể nghỉ tay một chút rồi tiếp tục!</p>
    <div class="phidao-result-stats">
      <div class="phidao-stat-pill"><span>Điểm Hiện Tại</span><strong id="pause-score">0</strong></div>
      <div class="phidao-stat-pill"><span>Combo</span><strong id="pause-combo">0</strong></div>
      <div class="phidao-stat-pill"><span>Từ Đã Hạ</span><strong id="pause-words">0</strong></div>
    </div>
    <div class="phidao-result-actions" style="margin-top:20px;">
      <button type="button" id="cannon-pause-resume-btn" class="phidao-action-btn primary" style="padding:10px 22px; font-size:.95rem;">
        <i class="fa-solid fa-play"></i> Tiếp Tục (Esc)
      </button>
      <button type="button" id="cannon-pause-restart-btn" class="phidao-action-btn secondary">
        <i class="fa-solid fa-rotate-right"></i> Chơi Lại
      </button>
      <button type="button" id="cannon-pause-exit-btn" class="phidao-action-btn outline">
        <i class="fa-solid fa-arrow-right-from-bracket"></i> Thoát
      </button>
    </div>
  </div>
</div>
<div id="cannon-modal-overlay" class="phidao-modal-overlay" style="display:none;">
  <div class="phidao-result-card">
    <button type="button" id="cannon-modal-close-x" class="phidao-modal-close-x" title="Đóng">&times;</button>
    <div id="cannon-result-icon" class="phidao-result-icon">🏆</div>
    <h2 id="cannon-result-title" class="phidao-result-title">Hoàn Thành!</h2>
    <p id="cannon-result-desc" class="phidao-result-desc"></p>
    <div class="phidao-result-stats">
      <div class="phidao-stat-pill"><span>Điểm</span><strong id="res-score">0</strong></div>
      <div class="phidao-stat-pill"><span>Combo cao nhất</span><strong id="res-combo">0</strong></div>
      <div class="phidao-stat-pill"><span>Từ bắn trúng</span><strong id="res-words">0</strong></div>
    </div>
    <div class="phidao-summary-section-title"><i class="fa-solid fa-graduation-cap" style="color:#fbbf24;"></i> CỦNG CỐ KIẾN THỨC TỪ VỰNG</div>
    <div id="cannon-words-summary-wrap"></div>
    <div class="phidao-result-tip"><i class="fa-solid fa-lightbulb" style="color:#fbbf24;"></i> <strong>Củng cố kiến thức:</strong> Nhấn vào từng từ để nghe lại phát âm và ghi nhớ mặt chữ của những từ chưa gõ kịp nhé!</div>
    <div class="phidao-result-actions">
      <button type="button" id="cannon-retry-wrong-btn" class="phidao-action-btn warn" style="display:none;"><i class="fa-solid fa-bolt"></i> Luyện Lại Từ Chưa Thuộc (<span id="wrong-count-span">0</span>)</button>
      <button type="button" id="cannon-retry-btn" class="phidao-action-btn primary"><i class="fa-solid fa-rotate-right"></i> Chơi Lại Toàn Bộ</button>
      <button type="button" id="cannon-back-hub-btn" class="phidao-action-btn secondary"><i class="fa-solid fa-gamepad"></i> Đổi Trò</button>
      <button type="button" id="cannon-finish-btn" class="phidao-action-btn outline"><i class="fa-solid fa-book-bookmark"></i> Sổ Tay</button>
    </div>
  </div>
</div>
</div>`,this._genStars(),this._genSakura()}_genStars(){const t=this.container.querySelector("#phidao-stars");if(t)for(let i=0;i<75;i++){const n=document.createElement("div");n.className="phidao-star";const e=1+Math.random()*2.2;n.style.cssText=`width:${e}px;height:${e}px;left:${Math.random()*100}%;top:${5+Math.random()*65}%;--dur:${2+Math.random()*4}s;--delay:${Math.random()*4}s;`,t.appendChild(n)}}_genSakura(){const t=this.container.querySelector("#phidao-sakura");if(!t)return;const i=["🌸","🌺","✿"];for(let n=0;n<10;n++){const e=document.createElement("div");e.className="phidao-sakura-p",e.textContent=i[n%3],e.style.cssText=`left:${Math.random()*100}%;top:-20px;--dur:${7+Math.random()*8}s;--delay:${Math.random()*10}s;`,t.appendChild(e)}}bindEvents(){const t=e=>this.container.querySelector(e);t("#cannon-top-back-btn")&&t("#cannon-top-back-btn").addEventListener("click",e=>{e.preventDefault(),this.stopAndExit()}),t("#cannon-pause-btn")&&t("#cannon-pause-btn").addEventListener("click",e=>{e.preventDefault(),this.togglePause()}),t("#cannon-pause-close-x")&&t("#cannon-pause-close-x").addEventListener("click",e=>{e.preventDefault(),this.togglePause(!1)}),t("#cannon-pause-resume-btn")&&t("#cannon-pause-resume-btn").addEventListener("click",e=>{e.preventDefault(),this.togglePause(!1)}),t("#cannon-pause-restart-btn")&&t("#cannon-pause-restart-btn").addEventListener("click",e=>{e.preventDefault(),this.togglePause(!1),this.restart()}),t("#cannon-pause-exit-btn")&&t("#cannon-pause-exit-btn").addEventListener("click",e=>{e.preventDefault(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),t("#cannon-exit-btn")&&t("#cannon-exit-btn").addEventListener("click",e=>{e.preventDefault(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),t("#cannon-retry-btn")&&t("#cannon-retry-btn").addEventListener("click",e=>{e.preventDefault(),this.restart()}),t("#cannon-back-hub-btn")&&t("#cannon-back-hub-btn").addEventListener("click",e=>{e.preventDefault(),this.stopAndExit()}),t("#cannon-finish-btn")&&t("#cannon-finish-btn").addEventListener("click",e=>{e.preventDefault(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),t("#cannon-playmode-toggle-btn")&&t("#cannon-playmode-toggle-btn").addEventListener("click",e=>{e.preventDefault(),this.playMode=this.playMode==="practice"?"challenge":"practice",localStorage.setItem("cannon_play_mode",this.playMode);const s=this.container.querySelector("#cannon-mode-icon-text");s&&(s.innerHTML=this.playMode==="practice"?'<i class="fa-solid fa-infinity" style="color: #10b981;"></i> <span style="font-size: 0.8rem; color:#10b981; margin-left: 4px;">Kiểm tra</span>':'<i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span style="font-size: 0.8rem; color:#fbbf24; margin-left: 4px;">Thi đấu</span>'),this.updateHUD(),this.showToast(this.playMode==="practice"?"🎯 Chế độ Kiểm tra (♾️ Không tính tim)":"🏆 Chế độ Thi đấu (❤️❤️❤️ 3 Tim)")}),this.container.querySelectorAll(".phidao-mode-pill").forEach(e=>{e.addEventListener("click",s=>{s.preventDefault();const a=e.getAttribute("data-mode")||"both";this.displayMode=a,this.container.querySelectorAll(".phidao-mode-pill").forEach(l=>l.classList.toggle("active",l===e)),this.highlightTargets(),this.focusInput(),this.showToast(`Chế độ: ${e.textContent.trim()}`)})}),this.container.querySelectorAll(".phidao-skill-btn").forEach(e=>{e.addEventListener("click",s=>{s.preventDefault();const a={"skill-ice":"ice","skill-heal":"heal","skill-x2":"x2","skill-shield":"shield"};a[e.id]&&this.activateSkill(a[e.id])})});const i=this.container.querySelector("#phidao-real-input");i&&(i.addEventListener("input",e=>{this.processInputBuffer(e.target.value)}),i.addEventListener("compositionend",e=>{this.processInputBuffer(e.target.value)}),i.addEventListener("keydown",e=>{e.key==="Escape"?(e.preventDefault(),this.togglePause()):e.key==="Enter"&&(e.preventDefault(),i.value.trim()&&this.processInputBuffer(i.value.trim()))}));const n=this.container.querySelector("#cannon-playfield");n&&n.addEventListener("click",()=>{this.focusInput()}),this.keyHandler=e=>{if(!this.isRunning)return;const s=this.container.querySelector("#cannon-modal-overlay");if(s&&s.style.display!=="none")return;if(e.key==="Escape"){e.preventDefault(),e.stopPropagation(),this.togglePause();return}if(this.isPaused){(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),e.stopPropagation(),this.togglePause(!1));return}if(e.altKey){const l={1:"ice",2:"heal",3:"x2",4:"shield"};if(l[e.key]){e.preventDefault(),e.stopPropagation(),this.activateSkill(l[e.key]);return}}const a=this.container.querySelector("#phidao-real-input");a&&document.activeElement!==a&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&a.focus()},window.addEventListener("keydown",this.keyHandler,!0)}focusInput(){setTimeout(()=>{const t=this.container.querySelector("#phidao-real-input");t&&this.isRunning&&!this.isPaused&&t.focus()},40)}processInputBuffer(t){if(!this.isRunning||this.isPaused)return;const i=(t||"").trim();if(this.typedBuffer=i,!i){this.lockedTarget=null,this.wrongStreak=0,this.updateTypedDisplay(),this.highlightTargets();return}const n=S(i),e=i.replace(/\s+/g,""),s=[...this.activeWords].filter(c=>!c.isDestroyed).sort((c,r)=>r.y-c.y);let a=s.find(c=>{const r=(c.wordObj.word||c.wordObj.char||c.wordObj.hanzi||"").trim();return e===r||e.endsWith(r)});if(!a&&n&&(a=s.find(c=>{const r=S(c.wordObj.pinyin);return n===r||n.endsWith(r)})),a){const c=a;this.typedBuffer="";const r=this.container.querySelector("#phidao-real-input");r&&(r.value=""),this.lockedTarget=null,this.wrongStreak=0,this.updateTypedDisplay(),this.highlightTargets(),this.fireDagger(c);return}let l=null;if(this.lockedTarget&&!this.lockedTarget.isDestroyed){const c=(this.lockedTarget.wordObj.word||this.lockedTarget.wordObj.char||"").trim(),r=S(this.lockedTarget.wordObj.pinyin);(c.startsWith(e)||n&&r.startsWith(n))&&(l=this.lockedTarget)}if(l||(l=s.find(c=>{const r=(c.wordObj.word||c.wordObj.char||"").trim(),p=S(c.wordObj.pinyin);return r.startsWith(e)||n&&p.startsWith(n)})),l)this.lockedTarget=l,this.wrongStreak=0;else if(this.lockedTarget=null,this.wrongStreak++,this.music.playMiss(),this.shakeTypedBuf(),this.wrongStreak>=5){const c=this.container.querySelector("#phidao-real-input");c&&(c.value=""),this.handleFiveMissPenalty();return}this.updateTypedDisplay(),this.highlightTargets()}processTypedChar(t){const i=this.container.querySelector("#phidao-real-input"),e=(i?i.value:this.typedBuffer)+t;i&&(i.value=e),this.processInputBuffer(e)}handleFiveMissPenalty(){this.wrongStreak=0,this.typedBuffer="";const t=this.container.querySelector("#phidao-real-input");if(t&&(t.value=""),this.lockedTarget=null,this.combo=0,this.activeWords.length===0){this.updateHUD(),this.updateTypedDisplay(),this.highlightTargets();return}const i=[...this.activeWords].filter(a=>!a.isDestroyed).sort((a,l)=>l.y-a.y);if(i.length===0)return;const n=i[0],e=this.activeWords.findIndex(a=>a.id===n.id);e!==-1&&this.activeWords.splice(e,1),n.el&&n.el.parentNode&&n.el.parentNode.removeChild(n.el),this.showMissFlash(),this.music.playMiss();const s=n.wordObj.word||n.wordObj.char||"";if(this.showFloatingText(n.x,Math.max(70,n.y),`💥 Sai 5 lần! Rớt từ: ${s}`,"#ef4444"),this.playMode!=="practice"){if(this.shieldActive)this.shieldActive=!1,this.shieldTimer=0,this.showFloatingText(n.x,Math.max(70,n.y-20),"🛡️ Lá Chắn Chặn!","#38bdf8");else if(this.lives--,this.lives<=0){this.updateHUD(),this.gameOver(!1);return}}this.updateHUD(),this.updateTypedDisplay(),this.highlightTargets(),this.wordQueue.length===0&&this.activeWords.length===0&&setTimeout(()=>this.gameOver(!0),500)}shakeTypedBuf(){const t=this.container.querySelector("#phidao-typed-buf");t&&(t.classList.add("buf-wrong-shake"),setTimeout(()=>t.classList.remove("buf-wrong-shake"),300))}updateTypedDisplay(){const t=this.container.querySelector("#phidao-typed-buf"),i=this.container.querySelector("#phidao-target-hint"),n=this.container.querySelector("#phidao-real-input"),e=this.typedBuffer;if(t&&(t.className=`phidao-typed-buf${this.lockedTarget?" has-match":""}`),n&&n.value!==e&&(n.value=e),i)if(this.wrongStreak>0)i.innerHTML=`<span style="color:#ef4444;font-weight:800;font-size:0.8rem;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.5);border-radius:12px;padding:2px 10px;display:inline-block;animation:bufShake .2s ease;">⚠️ Bấm sai: ${this.wrongStreak}/5</span>`;else if(this.lockedTarget&&!this.lockedTarget.isDestroyed){const s=this.lockedTarget.wordObj.word||"",a=this.lockedTarget.wordObj.pinyin||"",l=this.lockedTarget.wordObj.meaning||"";i.innerHTML=`<span style="color:#fde047;font-weight:800;font-size:0.85rem;background:rgba(15,23,42,0.9);border:1px solid rgba(251,191,36,0.5);border-radius:12px;padding:3px 14px;display:inline-flex;align-items:center;gap:6px;box-shadow:0 2px 10px rgba(0,0,0,0.4);">🎯 Mục tiêu: <strong style="font-size:1.05rem;color:#ffffff;">${s}</strong> <span style="color:#38bdf8;font-weight:700;">[${a}]</span> ${l?`<span style="color:#34d399;font-weight:700;">• ${l}</span>`:""}</span>`}else i.textContent=""}highlightTargets(){this.activeWords.forEach(t=>{if(!t.el||t.isDestroyed)return;const i=this.lockedTarget&&t.id===this.lockedTarget.id;t.el.classList.toggle("is-targeted",i);const n=t.el.querySelector(".pinyin-prog");if(n){const e=t.wordObj.pinyin||"";this.displayMode==="listen"||this.displayMode==="hanzi"||this.displayMode==="pinyin"||this.displayMode==="meaning"?n.style.display="none":(n.style.display="flex",n.innerHTML=`<span class="word-py-tone-tag" style="color:#0284c7;font-weight:800;font-size:0.95rem;">${e}</span>`)}})}fireDagger(t){if(!t||t.isDestroyed)return;t.isDestroyed=!0,t.isTargeted=!1;const i=this.container.querySelector("#phidao-character");i&&(i.classList.remove("throw-anim"),i.offsetWidth,i.classList.add("throw-anim"),setTimeout(()=>i&&i.classList.remove("throw-anim"),300)),this.music.playHit();const n=this.container.querySelector("#cannon-fx-layer"),e=this.container.querySelector("#cannon-playfield");if(!n||!e){this.handleHitWord(t);return}const s=e.clientWidth,a=e.clientHeight,l=s/2,c=a-48,r=t.x+40,p=t.y+30,h=document.createElement("div");h.className="phidao-dagger",h.textContent="🗡️",h.style.left=`${l}px`,h.style.top=`${c}px`;const o=r-l,d=p-c,u=Math.atan2(d,o)*180/Math.PI-45;h.style.transform=`rotate(${u}deg)`,n.appendChild(h);const f=Math.sqrt(o*o+d*d),m=Math.max(100,Math.min(300,f*.55)),y=performance.now(),b=L=>{const x=Math.min(1,(L-y)/m),w=x<.5?2*x*x:-1+(4-2*x)*x;h.style.left=`${l+o*w}px`,h.style.top=`${c+d*w}px`,x<1?requestAnimationFrame(b):(h.remove(),this.handleHitWord(t))};requestAnimationFrame(b)}handleHitWord(t){const i=this.activeWords.findIndex(r=>r.id===t.id);if(i===-1)return;const n=t.type==="star",e=this.score2xTimer>0?2:1,s=S(t.wordObj.pinyin).length,a=Math.round((n?75+s*30:s*15)*e);this.score+=a,this.combo++,this.wordsDestroyedCount++,this.combo>this.maxCombo&&(this.maxCombo=this.combo);const l=t.wordObj.word||t.wordObj.char||"";l&&this.correctWordsSet.add(l),typeof window.recordWordMemorized=="function"&&window.recordWordMemorized(t.wordObj),this.showHitMeaningPopup(t.x,t.y,t.wordObj,a,n),l&&this.speakWordInstant(l),this.combo>0&&this.combo%10===0&&(this.lives<this.maxLives?(this.lives++,this.music.playHeartRestore(),this.showFloatingText(t.x,t.y-36,`💖 Chuỗi ${this.combo}! +1 Tim!`,"#ef4444")):(this.music.playStreak(),this.showFloatingText(t.x,t.y-36,`🔥 Chuỗi ${this.combo}! Thần Kỳ!`,"#f97316")));const c=this.container.querySelector("#cannon-fx-layer");if(c){const r=document.createElement("div");r.className=`phidao-explosion type-${t.type}`,r.style.left=`${t.x+15}px`,r.style.top=`${t.y+10}px`,c.appendChild(r),setTimeout(()=>r.remove(),450)}t.el&&t.el.parentNode&&t.el.parentNode.removeChild(t.el),this.activeWords.splice(i,1),this.lockedTarget&&this.lockedTarget.id===t.id&&(this.lockedTarget=null,this.typedBuffer="",this.updateTypedDisplay(),this.highlightTargets()),this.updateHUD(),this.wordQueue.length===0&&this.activeWords.length===0&&setTimeout(()=>this.gameOver(!0),500)}speakWordInstant(t){if(t){if("speechSynthesis"in window)try{window.speechSynthesis.cancel();const i=new SpeechSynthesisUtterance(t);i.lang="zh-CN",i.rate=1.05,i.pitch=1;const e=window.speechSynthesis.getVoices().find(s=>s.lang==="zh-CN"||s.lang==="zh"||s.lang.startsWith("zh"));e&&(i.voice=e),window.speechSynthesis.speak(i);return}catch{}if(typeof window.speakText=="function")try{window.speakText(t)}catch{}}}showHitMeaningPopup(t,i,n,e,s){const a=this.container.querySelector("#cannon-fx-layer");if(!a)return;const l=document.createElement("div");l.className="phidao-hit-meaning-card";const c=n.word||n.char||"",r=n.pinyin||"",p=n.meaning||"";l.innerHTML=`
      <div style="font-size: 0.95rem; font-weight: 900; color: #fbbf24; display: flex; align-items: center; justify-content: center; gap: 4px;">
        <span>+${e}</span>
        <span style="font-family: var(--font-hanzi); font-size: 1.15rem; color: #ffffff;">${c}</span>
        <span style="font-size: 0.85rem; color: #38bdf8; font-weight: 700;">[${r}]</span>
      </div>
      <div style="font-size: 0.88rem; font-weight: 800; color: #f1f5f9; text-shadow: 0 1px 3px #000; margin-top: 1px;">
        ${p?`💡 ${p}`:""}
      </div>
    `,l.style.left=`${Math.max(10,Math.min(window.innerWidth-220,t-20))}px`,l.style.top=`${Math.max(10,i-10)}px`,a.appendChild(l),setTimeout(()=>l.remove(),2200)}spawnWord(){const t=this.wordsDestroyedCount>=4?3:2;if(this.activeWords.length>=t)return;if(!this.wordQueue||this.wordQueue.length===0){this.activeWords.length===0&&this.gameOver(!0);return}if(this.activeWords.some(M=>M.y<80))return;const i=this.container.querySelector("#cannon-playfield");if(!i)return;const n=i.clientWidth||600,e=this.wordQueue.pop();if(!e)return;const s=Math.random()<.15,a=this.container.querySelector(".phidao-floating-skills"),l=a?a.offsetWidth+25:110,c=160,r=25,p=Math.max(r+50,n-l-c),o=(p-r)/3,d=[{minX:r,maxX:r+o-10},{minX:r+o+5,maxX:r+o*2-5},{minX:r+o*2+10,maxX:p}],u=[0,0,0];this.activeWords.forEach(M=>{d.forEach((T,I)=>{M.x>=T.minX-35&&M.x<=T.maxX+35&&u[I]++})});let f=0,m=999;d.forEach((M,T)=>{u[T]<m&&(m=u[T],f=T)});const y=d[f];let b=y.minX+Math.random()*Math.max(10,y.maxX-y.minX);b=Math.max(r,Math.min(p,Math.round(b)));const L=-25,x=11+Math.min(4,Math.floor(this.wordsDestroyedCount/10)),w=document.createElement("div");w.className=`phidao-word-card type-${s?"star":"normal"}`;const C=e.word||e.char||e.hanzi||"",E=e.pinyin||"";S(E);const g=e.meaning||e.vn||e.trans||"";let k="";this.displayMode==="meaning"?k=`
        <div class="word-meaning-main">${s?"✨ ":""}${g||C}</div>
        <div class="word-sub-hint" style="font-size:0.75rem; color:#64748b; font-weight:700; margin-top:2px;">(Gõ Hán hoặc Pinyin)</div>
        <div class="pinyin-prog" style="display:none;"></div>
      `:this.displayMode==="hanzi"?k=`
        <div class="word-zh">${s?"✨ ":""}${C}</div>
        ${g?`<div class="word-meaning-sub" title="${g}">${g}</div>`:""}
        <div class="pinyin-prog" style="display:none;"></div>
      `:this.displayMode==="pinyin"?k=`
        <div class="word-zh" style="font-size:1.5rem;color:#0284c7 !important;">${s?"✨ ":""}${E}</div>
        ${g?`<div class="word-meaning-sub" title="${g}">${g}</div>`:""}
        <div class="pinyin-prog" style="display:none;"></div>
      `:this.displayMode==="listen"?(k=`
        <div class="word-zh" style="font-size:1.8rem;color:#0284c7 !important;">🎧 ❓</div>
        ${g?`<div class="word-meaning-sub" title="${g}">${g}</div>`:""}
        <div class="pinyin-prog" style="display:none;"></div>
      `,this.autoSpeech&&C&&this.speakWordInstant(C)):k=`
        <div class="word-zh">${s?"✨ ":""}${C}</div>
        <div class="pinyin-prog"><span class="word-py-tone-tag" style="color:#0284c7;font-weight:800;font-size:0.95rem;">${E}</span></div>
        ${g?`<div class="word-meaning-sub" title="${g}">${g}</div>`:""}
      `,w.innerHTML=k;const q={id:`${Date.now()}_${Math.random()}`,wordObj:e,type:s?"star":"normal",x:b,y:L,speed:x,el:w,isDestroyed:!1,isTargeted:!1},P=this.container.querySelector("#cannon-words-layer");P&&(P.appendChild(w),this.activeWords.push(q),w.style.transform=`translate3d(${b}px,${L}px,0)`)}loop(t){if(this.isRunning){if(this.isPaused)this.lastFrameTime=t;else{const i=Math.min(.05,(t-this.lastFrameTime)/1e3);this.lastFrameTime=t,this.spawnTimer+=i*1e3;const n=this.wordsDestroyedCount>=4?2100:2800,e=this.slowMoTimer>0?n*1.8:n;this.spawnTimer>=e&&(this.spawnTimer=0,this.spawnWord());const s=this.container.querySelector("#cannon-playfield"),a=s?s.clientHeight-60:450,l=this.slowMoTimer>0?.35:1;for(let c=this.activeWords.length-1;c>=0;c--){const r=this.activeWords[c];if(!r.isDestroyed&&(r.y+=r.speed*l*i,r.el&&(r.el.style.transform=`translate3d(${r.x}px,${r.y}px,0)`),r.y>=a)){if(r.el&&r.el.parentNode&&r.el.parentNode.removeChild(r.el),this.activeWords.splice(c,1),this.lockedTarget&&this.lockedTarget.id===r.id&&(this.lockedTarget=null,this.typedBuffer=""),this.combo=0,this.wrongStreak=0,this.music.playMiss(),this.showMissFlash(),typeof window.recordWordWrong=="function"&&r.wordObj&&window.recordWordWrong(r.wordObj),this.playMode==="practice")this.showFloatingText(r.x,a-22,`💔 Rớt từ: ${r.wordObj.word} (${r.wordObj.meaning||""})`,"#ef4444");else if(this.shieldActive?(this.shieldActive=!1,this.shieldTimer=0,this.showFloatingText(r.x,a-20,"🛡️ Lá Chắn Chặn!","#38bdf8")):(this.lives--,this.showFloatingText(r.x,a-22,`💔 ${r.wordObj.word} (${r.wordObj.meaning||""})`,"#ef4444")),this.lives<=0){this.gameOver(!1);return}this.updateHUD(),this.updateTypedDisplay(),this.highlightTargets(),this.wordQueue.length===0&&this.activeWords.length===0&&setTimeout(()=>this.gameOver(!0),500)}}}this.animFrameId=requestAnimationFrame(i=>this.loop(i))}}showMissFlash(){const t=this.container.querySelector("#cannon-playfield");if(!t)return;const i=document.createElement("div");i.className="phidao-miss-flash",t.appendChild(i),setTimeout(()=>i.remove(),380)}startTimers(){this.timerInterval&&clearInterval(this.timerInterval),this.timerInterval=setInterval(()=>{!this.isRunning||this.isPaused||(this.slowMoTimer>0&&this.slowMoTimer--,this.score2xTimer>0&&this.score2xTimer--,this.shieldTimer>0&&(this.shieldTimer--,this.shieldTimer===0&&(this.shieldActive=!1)),this.updateBuffBanner(),this.updateHUD())},1e3)}showCenterTick(t){}updateBuffBanner(){const t=this.container.querySelector("#cannon-buff-banner");if(!t)return;const i=[];this.slowMoTimer>0&&i.push(`❄️ Mưa Băng (${this.slowMoTimer}s)`),this.score2xTimer>0&&i.push(`⭐ Nhân Điểm (${this.score2xTimer}s)`),this.shieldTimer>0&&i.push(`🛡️ Lá Chắn (${this.shieldTimer}s)`),t.style.display=i.length>0?"block":"none",t.textContent=i.join("  |  ")}activateSkill(t){const n={ice:10,heal:20,x2:30,shield:20}[t]||999;if(this.combo<n){this.showToast(`Cần ${n} Combo (Hiện: ${this.combo})`);return}this.combo-=n,this.music.playStreak(),t==="ice"?(this.slowMoTimer=6,this.showToast("❄️ Mưa Băng: Làm chậm 6s!")):t==="heal"?this.lives<this.maxLives?(this.lives++,this.music.playHeartRestore(),this.showToast("💚 +1 Tim!")):this.showToast("💚 Tim đã đầy!"):t==="x2"?(this.score2xTimer=8,this.showToast("⭐ Nhân Đôi Điểm 8s!")):t==="shield"&&(this.shieldActive=!0,this.shieldTimer=6,this.showToast("🛡️ Lá Chắn Bảo Vệ 6s!")),this.updateBuffBanner(),this.updateHUD()}updateHUD(){const t=this.container.querySelector("#cannon-score-val"),i=this.container.querySelector("#cannon-combo-val"),n=this.container.querySelector("#cannon-lives-container");if(t&&(t.textContent=this.score),i&&(i.textContent=`x${this.combo}`),n)if(this.playMode==="practice")n.innerHTML='<span style="color: #10b981; font-weight: 900; font-size: 0.95rem;"><i class="fa-solid fa-infinity"></i> Vô Hạn</span>';else{n.innerHTML="";for(let e=0;e<this.maxLives;e++){const s=document.createElement("i"),a=e<this.lives;s.className=a?"fa-solid fa-heart":"fa-regular fa-heart",s.style.color=a?"#ef4444":"rgba(255,255,255,.2)",n.appendChild(s)}}this.container.querySelectorAll(".phidao-skill-btn").forEach(e=>e.classList.toggle("affordable",this.combo>=parseInt(e.dataset.cost,10)))}showFloatingText(t,i,n,e){const s=this.container.querySelector("#cannon-fx-layer");if(!s)return;const a=document.createElement("div");a.className="phidao-float-text",a.textContent=n,a.style.cssText=`left:${t}px;top:${i}px;color:${e};`,s.appendChild(a),setTimeout(()=>a.remove(),950)}showToast(t){typeof window.showToast=="function"&&window.showToast(t)}togglePause(t){if(!this.isRunning)return;const i=this.container.querySelector("#cannon-pause-overlay");this.isPaused=typeof t=="boolean"?t:!this.isPaused;const n=this.container.querySelector("#cannon-pause-btn");if(n&&(n.innerHTML=`<i class="fa-solid fa-${this.isPaused?"play":"pause"}"></i>`),this.isPaused){if(this.music.stop(),i){const e=i.querySelector("#pause-score"),s=i.querySelector("#pause-combo"),a=i.querySelector("#pause-words");e&&(e.textContent=this.score),s&&(s.textContent=`x${this.combo}`),a&&(a.textContent=`${this.wordsDestroyedCount}/${this.rawWords.length}`),i.style.setProperty("display","flex","important")}this.showToast("⏸ Đã tạm dừng (Bấm Esc hoặc Tiếp tục)")}else i&&i.style.setProperty("display","none","important"),this.lastFrameTime=performance.now(),this.music.start(),this.focusInput(),this.showToast("▶️ Tiếp tục")}start(){this.animFrameId&&(cancelAnimationFrame(this.animFrameId),this.animFrameId=null),this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.isStopping=!1,this.isRunning=!0,this.isPaused=!1,this.score=0,this.combo=0,this.maxCombo=0,this.lives=3,this.activeWords=[],this.wordsDestroyedCount=0,this.correctWordsSet=new Set,this.typedBuffer="",this.lockedTarget=null,this.wrongStreak=0,this.wordQueue=[...this.rawWords].sort(()=>Math.random()-.5),this.slowMoTimer=0,this.score2xTimer=0,this.shieldActive=!1,this.shieldTimer=0,this.lastFrameTime=performance.now(),this.spawnTimer=0;const t=this.container.querySelector("#cannon-pause-overlay");t&&t.style.setProperty("display","none","important");const i=this.container.querySelector("#cannon-modal-overlay");i&&i.style.setProperty("display","none","important");const n=this.container.querySelector("#cannon-pause-btn");n&&(n.innerHTML='<i class="fa-solid fa-pause"></i>');const e=this.container.querySelector("#cannon-words-layer");e&&(e.innerHTML="");const s=this.container.querySelector("#cannon-fx-layer");s&&(s.innerHTML=""),this.updateHUD(),this.updateTypedDisplay(),this.startTimers(),this.music.start(),this.focusInput(),this.animFrameId=requestAnimationFrame(a=>this.loop(a))}gameOver(t){if(this.isStopping)return;this.isRunning=!1,this.isPaused=!1,this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.animFrameId&&(cancelAnimationFrame(this.animFrameId),this.animFrameId=null),this.music.stop();const i=this.container.querySelector("#cannon-pause-overlay");i&&i.style.setProperty("display","none","important");const n=this.container.querySelector("#cannon-modal-overlay");if(!n)return;n.style.setProperty("display","flex","important"),t?(this.music.playVictory(),this.container.querySelector("#cannon-result-icon").textContent="🏆",this.container.querySelector("#cannon-result-title").textContent="Phi Đao Thần Sầu!",this.container.querySelector("#cannon-result-desc").textContent=`Bạn đã xuất sắc bắn hạ ${this.wordsDestroyedCount}/${this.rawWords.length} từ vựng!`):(this.music.playGameOver(),this.container.querySelector("#cannon-result-icon").textContent="💔",this.container.querySelector("#cannon-result-title").textContent="Hết Tim - Kết Thúc Lượt Chơi!",this.container.querySelector("#cannon-result-desc").textContent="Đừng nản lòng! Hãy gõ pinyin thật nhanh và xem lại các từ vựng bên dưới nhé."),this.container.querySelector("#res-score").textContent=this.score,this.container.querySelector("#res-combo").textContent=this.maxCombo,this.container.querySelector("#res-words").textContent=`${this.wordsDestroyedCount}/${this.rawWords.length}`;const e=this.rawWords.filter(c=>!this.correctWordsSet.has(c.word)),s=n.querySelector("#cannon-retry-wrong-btn"),a=n.querySelector("#wrong-count-span");s&&(e.length>0?(s.style.display="inline-flex",a&&(a.textContent=e.length),s.onclick=c=>{c.preventDefault(),c.stopPropagation(),this.retryWithWords(e)}):s.style.display="none");const l=n.querySelector("#cannon-words-summary-wrap");l&&this.renderWordSummaryList(l,this.rawWords,this.correctWordsSet),[["#cannon-modal-close-x",()=>this.stopAndExit()],["#cannon-retry-btn",()=>this.restart()],["#cannon-back-hub-btn",()=>this.stopAndExit()],["#cannon-finish-btn",()=>{this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}]].forEach(([c,r])=>{const p=n.querySelector(c);p&&(p.onclick=h=>{h.preventDefault(),h.stopPropagation(),r()})})}renderWordSummaryList(t,i,n){if(!t)return;const e=i.length,s=i.filter(r=>n.has(r.word)).length,a=e-s;t.innerHTML=`
      <div class="game-results-word-summary">
        <div class="summary-tabs-header">
          <button class="summary-tab-btn active" data-tab="all"><i class="fa-solid fa-list-check"></i> Tất cả (${e})</button>
          <button class="summary-tab-btn correct-tab" data-tab="correct"><i class="fa-solid fa-circle-check"></i> Đúng (${s})</button>
          <button class="summary-tab-btn wrong-tab" data-tab="wrong"><i class="fa-solid fa-circle-xmark"></i> Cần ôn (${a})</button>
        </div>
        <div class="summary-words-list"></div>
      </div>`;const l=t.querySelector(".summary-words-list"),c=r=>{l.innerHTML="";const p=i.filter(h=>{const o=n.has(h.word);return r==="correct"?o:r==="wrong"?!o:!0});if(!p.length){l.innerHTML='<div style="text-align:center;color:#64748b;padding:16px;font-size:.85rem;">Không có từ vựng nào trong mục này.</div>';return}p.forEach(h=>{const o=n.has(h.word),d=document.createElement("div");d.className=`summary-word-card ${o?"is-correct":"is-wrong"}`,d.title="Nhấn để nghe phát âm",d.innerHTML=`
          <div class="sw-badge ${o?"badge-correct":"badge-wrong"}">
            <i class="fa-solid fa-${o?"check":"xmark"}"></i> ${o?"Đúng":"Cần ôn"}
          </div>
          <div class="sw-main">
            <div class="sw-hanzi">${h.word}</div>
            <div class="sw-pinyin">${h.pinyin?`[ ${h.pinyin} ]`:""}</div>
            <div class="sw-meaning">${h.meaning||""}</div>
          </div>
          <button type="button" class="sw-speak-btn" title="Nghe phát âm">
            <i class="fa-solid fa-volume-high"></i>
          </button>`,d.onclick=()=>{typeof window.speakText=="function"&&window.speakText(h.word)};const u=d.querySelector(".sw-speak-btn");u&&(u.onclick=f=>{f.stopPropagation(),typeof window.speakText=="function"&&window.speakText(h.word)}),l.appendChild(d)})};c("all"),t.querySelectorAll(".summary-tab-btn").forEach(r=>{r.addEventListener("click",p=>{p.preventDefault(),t.querySelectorAll(".summary-tab-btn").forEach(h=>h.classList.remove("active")),r.classList.add("active"),c(r.dataset.tab)})})}retryWithWords(t){const i=this.container.querySelector("#cannon-modal-overlay");i&&i.style.setProperty("display","none","important");const n=this.container.querySelector("#cannon-words-layer");n&&(n.innerHTML="");const e=this.container.querySelector("#cannon-fx-layer");e&&(e.innerHTML="");const s=this.rawWords;this.rawWords=t,this.start(),this.rawWords=s}restart(){const t=this.container.querySelector("#cannon-modal-overlay");t&&t.style.setProperty("display","none","important");const i=this.container.querySelector("#cannon-words-layer");i&&(i.innerHTML="");const n=this.container.querySelector("#cannon-fx-layer");n&&(n.innerHTML=""),this.start()}stopAndExit(){this.activeWords&&this.activeWords.length>0&&typeof window.recordWordWrong=="function"&&this.activeWords.forEach(s=>{!s.isDestroyed&&s.wordObj&&window.recordWordWrong(s.wordObj)}),this.isRunning=!1,this.isStopping=!0,this.isPaused=!1,this.music.stop();const t=this.container.querySelector("#cannon-pause-overlay");t&&t.style.setProperty("display","none","important"),this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.animFrameId&&(cancelAnimationFrame(this.animFrameId),this.animFrameId=null),this.keyHandler&&(window.removeEventListener("keydown",this.keyHandler,!0),this.keyHandler=null);const i=this.container.querySelector("#cannon-words-layer");i&&(i.innerHTML="");const n=this.container.querySelector("#cannon-fx-layer");n&&(n.innerHTML="");const e=this.onExit;this.onExit=null,typeof e=="function"&&e()}}class D{constructor(){this.ctx=null}init(){if(!this.ctx){const t=window.AudioContext||window.webkitAudioContext;t&&(this.ctx=new t)}}playTone(t,i,n,e=null){try{if(this.init(),!this.ctx)return;this.ctx.state==="suspended"&&this.ctx.resume();const s=this.ctx.createOscillator(),a=this.ctx.createGain();s.type=i,s.frequency.setValueAtTime(t,this.ctx.currentTime),e&&s.frequency.exponentialRampToValueAtTime(e,this.ctx.currentTime+n),a.gain.setValueAtTime(.18,this.ctx.currentTime),a.gain.exponentialRampToValueAtTime(.01,this.ctx.currentTime+n),s.connect(a),a.connect(this.ctx.destination),s.start(),s.stop(this.ctx.currentTime+n)}catch{}}playEatCorrect(){this.playTone(523.25,"triangle",.12,659.25)}playEatWrong(){this.playTone(180,"sawtooth",.25,90)}playPowerup(){this.playTone(400,"sine",.2,800)}playLevelUp(){this.playTone(440,"sine",.15,880),setTimeout(()=>this.playTone(880,"sine",.3,1174.66),160)}}class W{constructor(t,i,n){this.container=t,this.rawWords=i&&i.length>=4?i:[{word:"勤奋",pinyin:"qínfèn",meaning:"chăm chỉ"},{word:"懒惰",pinyin:"lǎnduò",meaning:"lười biếng"},{word:"聪明",pinyin:"cōngmíng",meaning:"thông minh"},{word:"骄傲",pinyin:"jiāo'ào",meaning:"kiêu ngạo"},{word:"快乐",pinyin:"kuàilè",meaning:"vui vẻ"},{word:"热情",pinyin:"rèqíng",meaning:"nhiệt tình"},{word:"诚实",pinyin:"chéngshí",meaning:"thành thật"},{word:"勇敢",pinyin:"yǒnggǎn",meaning:"dũng cảm"}],this.onExit=n,this.sfx=new D,this.level=1,this.maxLevel=5,this.streak=0,this.maxStreakNeeded=10,this.score=0,this.lives=3,this.maxLives=3,this.isPaused=!1,this.isRunning=!1,this.wordsEatenCorrect=0,this.correctWordsSet=new Set,this.gameMode="zh-vi",this.activeQuestionMode="zh-vi",this.invincibleTimer=0,this.powerups=[],this.cols=20,this.rows=13,this.cellSize=38,this.snake=[{x:6,y:6},{x:5,y:6},{x:4,y:6}],this.dir={x:1,y:0},this.nextDir={x:1,y:0},this.playMode=localStorage.getItem("snake_play_mode")||"practice",this.autoSpeech=localStorage.getItem("snake_auto_speech")!=="false",this.currentQuestion=null,this.apples=[],this.obstacles=[],this.tickInterval=220,this.lastTickTime=0,this.animFrameId=null,this.timerInterval=null,this.renderLayout(),this.initCanvas(),this.bindEvents()}renderLayout(){this.container.innerHTML=`
      <div class="snake-game-wrapper">
        <!-- TOP HUD -->
        <div class="snake-hud-bar">
          <button type="button" id="snake-top-back-btn" class="btn btn-outline btn-sm" style="display: flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 50px;">
            <i class="fa-solid fa-arrow-left"></i> Đổi Game
          </button>

          <div class="hud-item-title">
            <span class="snake-badge-icon">🐍</span>
            <strong>NUÔI RẮN</strong>
          </div>

          <!-- Play Mode Toggle Button -->
          <button type="button" id="snake-playmode-toggle-btn" class="btn btn-outline btn-sm" title="Chuyển chế độ Kiểm tra (Không tính tim) / Thi đấu (3 Tim)" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 800; border-radius: 50px; cursor: pointer; padding: 5px 12px;">
            <span id="snake-mode-icon-text">${this.playMode==="practice"?'<i class="fa-solid fa-infinity" style="color: #10b981;"></i> <span style="color:#10b981;">Kiểm tra</span>':'<i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span style="color:#fbbf24;">Thi đấu</span>'}</span>
          </button>

          <!-- Auto Speech Toggle Button -->
          <button type="button" id="snake-speech-toggle-btn" class="btn btn-outline btn-sm" title="Bật/Tắt tự động đọc từ khi hiện câu hỏi" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 800; border-radius: 50px; cursor: pointer; padding: 5px 12px;">
            <i class="fa-solid ${this.autoSpeech?"fa-volume-high":"fa-volume-xmark"}" id="snake-speech-icon" style="color: ${this.autoSpeech?"#22c55e":"#94a3b8"};"></i>
            <span id="snake-speech-text" style="font-size: 0.78rem;">${this.autoSpeech?"Đọc tự động":"Tắt đọc"}</span>
          </button>

          <div class="hud-item hud-level-badge" id="snake-level-badge">CẤP 1</div>

          <div class="hud-item hud-streak-wrap">
            <span class="hud-label">CHUỖI: <strong id="snake-streak-text">0/10</strong></span>
            <div class="hud-beads-container" id="snake-beads-container">
              ${Array(10).fill(0).map(()=>'<span class="bead"></span>').join("")}
            </div>
          </div>

          <div class="hud-item hud-score">
            <i class="fa-solid fa-star" style="color: #fbbf24;"></i>
            <span class="hud-label">ĐIỂM:</span>
            <span class="hud-value" id="snake-score-val">0</span>
          </div>

          <div class="hud-item hud-lives">
            <span class="hud-label">TIM:</span>
            <div class="hud-hearts" id="snake-lives-container">
              ${this.playMode==="practice"?'<span style="color: #10b981; font-weight: 900; font-size: 0.95rem;"><i class="fa-solid fa-infinity"></i> Vô Hạn</span>':'<i class="fa-solid fa-heart" style="color: #ef4444;"></i><i class="fa-solid fa-heart" style="color: #ef4444;"></i><i class="fa-solid fa-heart" style="color: #ef4444;"></i>'}
            </div>
          </div>

          <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
            <button type="button" id="snake-pause-btn" class="btn btn-outline btn-sm" title="Tạm dừng"><i class="fa-solid fa-pause"></i> Tạm dừng</button>
            <button type="button" id="snake-exit-btn" class="btn btn-outline btn-sm" title="Thoát về sổ tay"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>

        <!-- MAIN ARENA & SIDEBAR -->
        <div class="snake-arena-layout">
          <!-- LEFT COLUMN: BATTLEFIELD / CANVAS & CONTROLS -->
          <div class="snake-battle-column">
            <!-- GAME MODE SELECTOR -->
            <div class="snake-mode-selector-bar" id="snake-mode-selector">
              <button type="button" class="snake-mode-btn active" data-mode="zh-vi" title="Chữ Hán ➔ Nghĩa Việt">
                <i class="fa-solid fa-language"></i> <span>Hán ➔ Việt</span>
              </button>
              <button type="button" class="snake-mode-btn" data-mode="vi-zh" title="Nghĩa Việt ➔ Chữ Hán">
                <i class="fa-solid fa-arrow-right-arrow-left"></i> <span>Việt ➔ Hán</span>
              </button>
              <button type="button" class="snake-mode-btn" data-mode="pinyin-zh" title="Pinyin ➔ Chữ Hán">
                <i class="fa-solid fa-spell-check"></i> <span>Pinyin ➔ Hán</span>
              </button>
              <button type="button" class="snake-mode-btn" data-mode="pinyin-vi" title="Pinyin ➔ Nghĩa Việt">
                <i class="fa-solid fa-volume-high"></i> <span>Pinyin ➔ Việt</span>
              </button>
              <button type="button" class="snake-mode-btn" data-mode="mix" title="Hỗn hợp ngẫu nhiên">
                <i class="fa-solid fa-shuffle"></i> <span>Hỗn hợp</span>
              </button>
            </div>

            <!-- CANVAS CONTAINER -->
            <div class="snake-canvas-container" id="snake-canvas-container">
              <canvas id="snake-canvas" class="snake-canvas"></canvas>
            </div>

            <!-- CONTROLS & D-PAD (TOUCH / MOUSE / KEYBOARD) -->
            <div class="snake-controls-panel">
              <div class="snake-dpad-wrapper">
                <div class="dpad-row dpad-row-top">
                  <button type="button" class="dpad-btn dpad-up" data-dir="up" title="Đi Lên (Phím Mũi Tên Lên hoặc W)">
                    <i class="fa-solid fa-chevron-up"></i>
                    <span>Lên</span>
                  </button>
                </div>
                <div class="dpad-row dpad-row-mid">
                  <button type="button" class="dpad-btn dpad-left" data-dir="left" title="Sang Trái (Phím Mũi Tên Trái hoặc A)">
                    <i class="fa-solid fa-chevron-left"></i>
                    <span>Trái</span>
                  </button>
                  <button type="button" class="dpad-btn dpad-down" data-dir="down" title="Đi Xuống (Phím Mũi Tên Xuống hoặc S)">
                    <i class="fa-solid fa-chevron-down"></i>
                    <span>Xuống</span>
                  </button>
                  <button type="button" class="dpad-btn dpad-right" data-dir="right" title="Sang Phải (Phím Mũi Tên Phải hoặc D)">
                    <i class="fa-solid fa-chevron-right"></i>
                    <span>Phải</span>
                  </button>
                </div>
              </div>

              <div class="snake-keys-guide">
                <div class="guide-title"><i class="fa-solid fa-gamepad"></i> Điều khiển:</div>
                <div class="guide-tags">
                  <span class="guide-tag"><kbd>⬆️</kbd><kbd>⬅️</kbd><kbd>⬇️</kbd><kbd>➡️</kbd> Mũi Tên</span>
                  <span class="guide-tag"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Bàn Phím</span>
                  <span class="guide-tag"><i class="fa-solid fa-hand-pointer"></i> Vuốt cảm ứng</span>
                  <span class="guide-tag"><kbd>Space</kbd> Tạm dừng</span>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT SIDEBAR: PROMINENT TARGET CARD & LUCKY ITEMS -->
          <div class="snake-sidebar">
            <!-- TARGET WORD PROMPT CARD (TOP-RIGHT CORNER) -->
            <div class="snake-target-banner" id="snake-target-card">
              <span class="target-badge-label" id="target-badge-type"><i class="fa-solid fa-bullseye"></i> ĐỀ BÀI CẦN TÌM:</span>
              <div class="target-word-row">
                <span class="target-zh" id="target-zh-text">勤奋</span>
                <button type="button" id="snake-speak-target-btn" class="target-speak-btn" title="Bấm để nghe phát âm">
                  <i class="fa-solid fa-volume-high"></i>
                </button>
              </div>
              <div class="target-action-hint" id="target-action-hint">
                <i class="fa-solid fa-apple-whole" style="color: #fde047;"></i> Lái rắn ăn quả có <strong>NGHĨA TIẾNG VIỆT ĐÚNG</strong>!
              </div>
            </div>

            <!-- LUCKY ITEMS CARD -->
            <div class="snake-sidebar-card">
              <div class="sidebar-sec-title"><i class="fa-solid fa-wand-magic-sparkles"></i> VẬT PHẨM MAY MẮN</div>
              
              <div class="powerup-item-row">
                <div class="p-icon" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;"><i class="fa-solid fa-heart"></i></div>
                <div>
                  <div class="p-title">HỒI 1 TIM</div>
                  <div class="p-desc">Hồi lại 1 tim đã mất.</div>
                </div>
              </div>

              <div class="powerup-item-row">
                <div class="p-icon" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;"><i class="fa-solid fa-coins"></i></div>
                <div>
                  <div class="p-title">X2 CHUỖI</div>
                  <div class="p-desc">Nhân đôi chuỗi hiện tại.</div>
                </div>
              </div>

              <div class="powerup-item-row">
                <div class="p-icon" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;"><i class="fa-solid fa-shield-halved"></i></div>
                <div>
                  <div class="p-title">BẤT TỬ 5 GIÂY</div>
                  <div class="p-desc">Rắn không bị mất tim khi ăn sai trong 5 giây.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- BOTTOM PANEL: DETAILED RULES & LEVEL PROGRESSION -->
        <div class="snake-footer-rules">
          <div class="snake-rules-main-card">
            <div class="rules-title">QUY TẮC TÍNH ĐIỂM & TIẾN TRÌNH</div>
            
            <div class="snake-rules-flow-grid">
              <div class="flow-block flow-correct">
                <div class="flow-tag tag-correct">ĂN ĐÚNG</div>
                <div class="flow-desc">Ăn đúng nghĩa của từ vựng</div>
                <div class="flow-steps">
                  <div class="step-card">
                    <span class="apple-emoji">🍏</span>
                    <strong>Chuỗi +1</strong>
                  </div>
                  <i class="fa-solid fa-arrow-right step-arrow"></i>
                  <div class="step-card">
                    <strong>Đủ 10 lên cấp</strong>
                    <small>Chuỗi về 0</small>
                  </div>
                </div>
              </div>

              <div class="flow-block flow-wrong">
                <div class="flow-tag tag-wrong">ĂN SAI</div>
                <div class="flow-desc">Ăn sai nghĩa của từ vựng</div>
                <div class="flow-steps">
                  <div class="step-card">
                    <span class="apple-emoji">🍎</span>
                    <strong style="color: #ef4444;">-1 TIM</strong>
                  </div>
                  <i class="fa-solid fa-arrow-right step-arrow"></i>
                  <div class="step-card">
                    <strong style="color: #ef4444;">Hết tim</strong>
                    <small>Hết lượt chơi</small>
                  </div>
                </div>
              </div>

              <div class="flow-block flow-summary">
                <div class="rules-title" style="margin-bottom: 8px;">TỔNG KẾT</div>
                <ul class="summary-list">
                  <li>👑 <strong>Lên cấp khi đạt chuỗi 10</strong></li>
                  <li>💔 <strong>Ăn sai mất tim</strong></li>
                  <li>✨ <strong>Vật phẩm may mắn giúp rắn mạnh hơn</strong></li>
                </ul>
              </div>
            </div>

            <!-- LEVEL STEPPER -->
            <div class="snake-stepper-row">
              <span class="stepper-label">TIẾN TRÌNH CẤP:</span>
              <div class="stepper-pills">
                <span class="step-pill active" id="step-lvl-1">CẤP 1</span>
                <i class="fa-solid fa-arrow-right"></i>
                <span class="step-pill" id="step-lvl-2">CẤP 2</span>
                <i class="fa-solid fa-arrow-right"></i>
                <span class="step-pill" id="step-lvl-3">CẤP 3</span>
                <i class="fa-solid fa-arrow-right"></i>
                <span class="step-pill" id="step-lvl-4">CẤP 4</span>
                <i class="fa-solid fa-arrow-right"></i>
                <span class="step-pill" id="step-lvl-5"><i class="fa-solid fa-lock"></i> CẤP 5</span>
              </div>
              <div class="stepper-notes">
                Cấp càng cao: Rắn dài hơn • Rắn nhanh hơn • Nhiều chướng ngại vật hơn • Từ vựng khó hơn
              </div>
            </div>
          </div>
        </div>

        <!-- GAME OVER / LEVEL UP MODAL -->
        <div id="snake-modal-overlay" class="cannon-modal-overlay" style="display: none;">
          <div class="cannon-result-card">
            <button type="button" id="snake-modal-close-x" class="result-modal-close-btn" title="Đóng">&times;</button>
            <div id="snake-result-icon" class="result-icon">🏆</div>
            <h2 id="snake-result-title" class="result-title">Hoàn Thành Thử Thách!</h2>
            <p id="snake-result-desc" class="result-desc">Chúc mừng bạn đã chinh phục các cấp độ Nuôi Rắn!</p>
            
            <div class="result-stats-grid">
              <div class="stat-pill">
                <span class="label">Cấp Độ Đạt Được</span>
                <span class="val" id="snake-res-level">CẤP 1</span>
              </div>
              <div class="stat-pill">
                <span class="label">Tổng Điểm</span>
                <span class="val" id="snake-res-score">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Số Từ Ăn Đúng</span>
                <span class="val" id="snake-res-words">0</span>
              </div>
            </div>

            <!-- BẢNG TỔNG KẾT TỪ VỰNG ĐÚNG / SAI -->
            <div id="snake-words-summary-wrap"></div>

            <div class="result-beta-note">
              <i class="fa-solid fa-flask"></i> <strong>Chế độ luyện tập:</strong> Hãy tiếp tục trau dồi vốn từ vựng HSK của bạn!
            </div>

            <div class="cannon-result-card-actions">
              <button type="button" id="snake-retry-btn" class="btn btn-primary"><i class="fa-solid fa-rotate-right"></i> Chơi Lại</button>
              <button type="button" id="snake-back-hub-btn" class="btn btn-secondary"><i class="fa-solid fa-gamepad"></i> Đổi Trò Chơi</button>
              <button type="button" id="snake-finish-btn" class="btn btn-outline"><i class="fa-solid fa-book-bookmark"></i> Quay Lại Sổ Tay</button>
            </div>
          </div>
        </div>
      </div>
    `}initCanvas(){if(this.canvas=this.container.querySelector("#snake-canvas"),!this.canvas)return;this.ctx=this.canvas.getContext("2d");const t=this.container.querySelector("#snake-canvas-container"),i=t?t.clientWidth:650,n=Math.min(720,Math.max(300,i||620)),e=Math.round(n*(this.rows/this.cols));this.canvas.width=n,this.canvas.height=e,this.cellSize=n/this.cols}bindEvents(){const t=this.container.querySelector("#snake-top-back-btn"),i=this.container.querySelector("#snake-pause-btn"),n=this.container.querySelector("#snake-exit-btn"),e=this.container.querySelector("#snake-retry-btn"),s=this.container.querySelector("#snake-back-hub-btn"),a=this.container.querySelector("#snake-finish-btn"),l=this.container.querySelector("#snake-playmode-toggle-btn");l&&l.addEventListener("click",o=>{o.preventDefault(),this.playMode=this.playMode==="practice"?"challenge":"practice",localStorage.setItem("snake_play_mode",this.playMode);const d=this.container.querySelector("#snake-mode-icon-text");d&&(d.innerHTML=this.playMode==="practice"?'<i class="fa-solid fa-infinity" style="color: #10b981;"></i> <span style="color:#10b981;">Kiểm tra</span>':'<i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span style="color:#fbbf24;">Thi đấu</span>'),this.updateHUD(),this.showFloatingMessage(this.playMode==="practice"?"🎯 Chế độ Kiểm tra (♾️ Không tính tim)":"🏆 Chế độ Thi đấu (❤️❤️❤️ 3 Tim)")});const c=this.container.querySelector("#snake-speech-toggle-btn");c&&c.addEventListener("click",o=>{o.preventDefault(),this.autoSpeech=!this.autoSpeech,localStorage.setItem("snake_auto_speech",this.autoSpeech?"true":"false");const d=this.container.querySelector("#snake-speech-icon"),u=this.container.querySelector("#snake-speech-text");d&&(d.className=`fa-solid ${this.autoSpeech?"fa-volume-high":"fa-volume-xmark"}`,d.style.color=this.autoSpeech?"#22c55e":"#94a3b8"),u&&(u.textContent=this.autoSpeech?"Đọc tự động":"Tắt đọc"),this.showFloatingMessage(this.autoSpeech?"🔊 Đã bật tự động đọc từ":"🔇 Đã tắt tự động đọc")}),t&&t.addEventListener("click",o=>{o.preventDefault(),this.stopAndExit()}),i&&i.addEventListener("click",o=>{o.preventDefault(),this.togglePause()}),n&&n.addEventListener("click",o=>{o.preventDefault(),typeof window.exitNotebookGamesHub=="function"?(this.stopAndExit(),window.exitNotebookGamesHub()):this.stopAndExit()});const r=this.container.querySelector("#snake-modal-close-x");r&&r.addEventListener("click",o=>{o.preventDefault(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),e&&e.addEventListener("click",o=>{o.preventDefault(),this.restart()}),s&&s.addEventListener("click",o=>{o.preventDefault(),this.stopAndExit()}),a&&a.addEventListener("click",o=>{o.preventDefault(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()});const p=this.container.querySelector("#snake-speak-target-btn");if(p&&p.addEventListener("click",o=>{o.preventDefault(),o.stopPropagation(),this.currentQuestion&&typeof window.speakText=="function"&&window.speakText(this.currentQuestion.word)}),this.keyHandler=o=>{if(!this.isRunning||this.isPaused)return;const d=o.key.toLowerCase();d==="arrowup"||d==="w"?(this.dir.y===0&&(this.nextDir={x:0,y:-1}),o.preventDefault(),o.stopPropagation(),o.stopImmediatePropagation&&o.stopImmediatePropagation()):d==="arrowdown"||d==="s"?(this.dir.y===0&&(this.nextDir={x:0,y:1}),o.preventDefault(),o.stopPropagation(),o.stopImmediatePropagation&&o.stopImmediatePropagation()):d==="arrowleft"||d==="a"?(this.dir.x===0&&(this.nextDir={x:-1,y:0}),o.preventDefault(),o.stopPropagation(),o.stopImmediatePropagation&&o.stopImmediatePropagation()):d==="arrowright"||d==="d"?(this.dir.x===0&&(this.nextDir={x:1,y:0}),o.preventDefault(),o.stopPropagation(),o.stopImmediatePropagation&&o.stopImmediatePropagation()):d===" "&&(this.togglePause(),o.preventDefault(),o.stopPropagation(),o.stopImmediatePropagation&&o.stopImmediatePropagation())},window.addEventListener("keydown",this.keyHandler,!0),this.canvas){let o=0,d=0,u=!1;this.touchStartHandler=f=>{f.preventDefault(),f.touches&&f.touches[0]&&(o=f.touches[0].clientX,d=f.touches[0].clientY,u=!0)},this.touchMoveHandler=f=>{if(f.preventDefault(),!(!u||!this.isRunning||this.isPaused)&&f.touches&&f.touches[0]){const m=f.touches[0].clientX-o,y=f.touches[0].clientY-d,b=14;(Math.abs(m)>=b||Math.abs(y)>=b)&&(Math.abs(m)>Math.abs(y)?m>0&&this.dir.x===0?(this.nextDir={x:1,y:0},o=f.touches[0].clientX,d=f.touches[0].clientY):m<0&&this.dir.x===0&&(this.nextDir={x:-1,y:0},o=f.touches[0].clientX,d=f.touches[0].clientY):y>0&&this.dir.y===0?(this.nextDir={x:0,y:1},o=f.touches[0].clientX,d=f.touches[0].clientY):y<0&&this.dir.y===0&&(this.nextDir={x:0,y:-1},o=f.touches[0].clientX,d=f.touches[0].clientY))}},this.touchEndHandler=f=>{f.preventDefault(),u=!1},this.canvas.addEventListener("touchstart",this.touchStartHandler,{passive:!1}),this.canvas.addEventListener("touchmove",this.touchMoveHandler,{passive:!1}),this.canvas.addEventListener("touchend",this.touchEndHandler,{passive:!1}),this.canvas.addEventListener("touchcancel",this.touchEndHandler,{passive:!1})}const h=o=>{!this.isRunning||this.isPaused||(o==="up"&&this.dir.y===0?this.nextDir={x:0,y:-1}:o==="down"&&this.dir.y===0?this.nextDir={x:0,y:1}:o==="left"&&this.dir.x===0?this.nextDir={x:-1,y:0}:o==="right"&&this.dir.x===0&&(this.nextDir={x:1,y:0}))};this.container.querySelectorAll(".dpad-btn").forEach(o=>{const d=o.dataset.dir;o.addEventListener("touchstart",u=>{u.preventDefault(),o.classList.add("active"),h(d)},{passive:!1}),o.addEventListener("touchend",u=>{u.preventDefault(),o.classList.remove("active")},{passive:!1}),o.addEventListener("mousedown",u=>{u.preventDefault(),o.classList.add("active"),h(d)}),o.addEventListener("mouseup",()=>o.classList.remove("active")),o.addEventListener("mouseleave",()=>o.classList.remove("active"))}),this.container.querySelectorAll(".snake-mode-btn").forEach(o=>{o.addEventListener("click",d=>{d.preventDefault();const u=o.dataset.mode;u!==this.gameMode&&(this.container.querySelectorAll(".snake-mode-btn").forEach(f=>f.classList.remove("active")),o.classList.add("active"),this.gameMode=u,this.showFloatingMessage(`Đã chọn: ${o.textContent.trim()}`),this.currentQuestion&&this.refreshCurrentQuestion())})}),this.resizeHandler=()=>this.initCanvas(),window.addEventListener("resize",this.resizeHandler)}cleanFormat(t){return t?String(t).replace(/\([^)]*\)/g,"").replace(/（[^）]*）/g,"").trim():""}refreshCurrentQuestion(){if(!this.currentQuestion)return;let t=this.gameMode||"zh-vi";if(t==="mix"){const e=["zh-vi","vi-zh","pinyin-zh","pinyin-vi"];t=e[Math.floor(Math.random()*e.length)]}this.activeQuestionMode=t,this.updateTargetPrompt();const i=this.currentQuestion,n=t==="vi-zh"||t==="pinyin-zh";this.apples.forEach(e=>{e.isCorrect?e.displayText=n?i.word:this.cleanFormat(i.meaning):e.displayText=n?e.word:this.cleanFormat(e.meaning)})}resetSnake(){const t=3+Math.max(0,this.level-1);this.snake=[];for(let i=0;i<t;i++)this.snake.push({x:6-i,y:7});this.dir={x:1,y:0},this.nextDir={x:1,y:0},this.calculateSpeed()}calculateSpeed(){this.tickInterval=Math.max(110,220-(this.level-1)*25)}spawnObstacles(){this.obstacles=[];const t=(this.level-1)*2;for(let i=0;i<t;i++){let n=this.getRandomEmptyCell(2);n&&this.obstacles.push({type:i%2===0?"rock":"bush",x:n.x,y:n.y})}}nextWordQuestion(){if(!this.wordQueue||this.wordQueue.length===0){this.gameOver(!0);return}const t=this.wordQueue.pop();this.currentQuestion=t;let i=this.gameMode||"zh-vi";if(i==="mix"){const o=["zh-vi","vi-zh","pinyin-zh","pinyin-vi"];i=o[Math.floor(Math.random()*o.length)]}this.activeQuestionMode=i,this.updateTargetPrompt();let e=[...(this.rawWords||[]).filter(o=>o&&o.word!==t.word&&o.meaning!==t.meaning)];if(e.length<3&&typeof window<"u"&&Array.isArray(window.vocabList)){const o=window.vocabList.filter(d=>d&&d.word!==t.word&&d.meaning!==t.meaning&&(d.isStudied||d.isMemorized||String(d.level)===String(t.level)));e.push(...o)}const s=[...e].sort(()=>Math.random()-.5),a=new Set([t.word]),l=new Set([t.meaning]),c=[];for(const o of s)if(o&&o.word&&o.meaning&&!a.has(o.word)&&!l.has(o.meaning)&&(a.add(o.word),l.add(o.meaning),c.push(o),c.length===3))break;this.apples=[];const r=i==="vi-zh"||i==="pinyin-zh",p=r?t.word:this.cleanFormat(t.meaning);let h=this.getRandomEmptyCell(2.5);if(h&&this.apples.push({word:t.word,meaning:t.meaning,pinyin:t.pinyin,displayText:p,isCorrect:!0,x:h.x,y:h.y}),c.forEach(o=>{let d=this.getRandomEmptyCell(2.5);if(d){const u=r?o.word:this.cleanFormat(o.meaning);this.apples.push({word:o.word,meaning:o.meaning,pinyin:o.pinyin,displayText:u,isCorrect:!1,x:d.x,y:d.y})}}),this.powerups.length===0&&Math.random()<.28){let o=this.getRandomEmptyCell(2);if(o){const d=["heal","x2","shield"],u=d[Math.floor(Math.random()*d.length)];this.powerups.push({type:u,x:o.x,y:o.y})}}}getRandomEmptyCell(t=2){for(let i=0;i<200;i++){const n=Math.floor(Math.random()*(this.cols-4))+2,e=Math.floor(Math.random()*(this.rows-4))+2,s=this.snake.some(r=>Math.abs(r.x-n)<=1&&Math.abs(r.y-e)<=1),a=this.apples.some(r=>Math.hypot(r.x-n,r.y-e)<(t||2.2)),l=this.obstacles.some(r=>Math.abs(r.x-n)<=1&&Math.abs(r.y-e)<=1),c=this.powerups.some(r=>Math.abs(r.x-n)<=1&&Math.abs(r.y-e)<=1);if(!s&&!a&&!l&&!c)return{x:n,y:e}}for(let i=0;i<50;i++){const n=Math.floor(Math.random()*(this.cols-2))+1,e=Math.floor(Math.random()*(this.rows-2))+1,s=this.snake.some(c=>c.x===n&&c.y===e),a=this.apples.some(c=>c.x===n&&c.y===e),l=this.obstacles.some(c=>c.x===n&&c.y===e);if(!s&&!a&&!l)return{x:n,y:e}}return null}updateTargetPrompt(){if(!this.currentQuestion)return;const t=this.container.querySelector("#snake-target-card .target-badge-label"),i=this.container.querySelector("#target-zh-text"),n=this.container.querySelector("#snake-target-card .target-action-hint"),e=this.activeQuestionMode||"zh-vi",s=this.currentQuestion;e==="zh-vi"?(t&&(t.innerHTML='<i class="fa-solid fa-bullseye"></i> ĐỀ BÀI:'),i&&(i.textContent=s.word),n&&(n.innerHTML='<i class="fa-solid fa-apple-whole" style="color: #fde047;"></i> Lái rắn ăn quả có <strong>NGHĨA VIỆT ĐÚNG</strong>!')):e==="vi-zh"?(t&&(t.innerHTML='<i class="fa-solid fa-bullseye"></i> ĐỀ BÀI:'),i&&(i.textContent=this.cleanFormat(s.meaning)),n&&(n.innerHTML='<i class="fa-solid fa-apple-whole" style="color: #fde047;"></i> Lái rắn ăn quả có <strong>CHỮ HÁN ĐÚNG</strong>!')):e==="pinyin-zh"?(t&&(t.innerHTML='<i class="fa-solid fa-bullseye"></i> ĐỀ BÀI:'),i&&(i.textContent=this.cleanFormat(s.meaning)),n&&(n.innerHTML='<i class="fa-solid fa-apple-whole" style="color: #fde047;"></i> Lái rắn ăn quả có <strong>CHỮ HÁN ĐÚNG</strong>!')):e==="pinyin-vi"&&(t&&(t.innerHTML='<i class="fa-solid fa-bullseye"></i> ĐỀ BÀI:'),i&&(i.textContent=s.word),n&&(n.innerHTML='<i class="fa-solid fa-apple-whole" style="color: #fde047;"></i> Lái rắn ăn quả có <strong>NGHĨA VIỆT ĐÚNG</strong>!')),this.autoSpeech&&s&&s.word&&(typeof window.speakWordInstant=="function"?window.speakWordInstant(s.word):typeof window.speakText=="function"&&window.speakText(s.word))}loop(t){this.isRunning&&(this.isPaused||t-this.lastTickTime>=this.tickInterval&&(this.lastTickTime=t,this.updateGame()),this.draw(),this.animFrameId=requestAnimationFrame(i=>this.loop(i)))}updateGame(){this.dir=this.nextDir;const t={x:this.snake[0].x+this.dir.x,y:this.snake[0].y+this.dir.y};if(t.x<0&&(t.x=this.cols-1),t.x>=this.cols&&(t.x=0),t.y<0&&(t.y=this.rows-1),t.y>=this.rows&&(t.y=0),this.snake.slice(1).some(s=>s.x===t.x&&s.y===t.y)){this.handleMistake("Đâm trúng thân rắn!");return}if(this.obstacles.find(s=>s.x===t.x&&s.y===t.y)){this.handleMistake("Đâm trúng chướng ngại vật!");return}this.snake.unshift(t);const e=this.apples.findIndex(s=>s.x===t.x&&s.y===t.y);if(e!==-1){const s=this.apples[e];s.isCorrect?(this.streak+1>=this.maxStreakNeeded||this.snake.pop(),this.handleEatCorrect(s)):(this.handleEatWrong(s),this.snake.pop())}else{const s=this.powerups.findIndex(a=>a.x===t.x&&a.y===t.y);s!==-1&&(this.handleEatPowerup(this.powerups[s]),this.powerups.splice(s,1)),this.snake.pop()}}handleEatCorrect(t){this.sfx.playEatCorrect(),this.score+=20*this.level,this.streak++,this.wordsEatenCorrect=(this.wordsEatenCorrect||0)+1,this.currentQuestion&&this.currentQuestion.word&&this.correctWordsSet.add(this.currentQuestion.word),typeof window.recordWordMemorized=="function"&&this.currentQuestion&&window.recordWordMemorized(this.currentQuestion),this.wordsEatenCorrect>0&&this.wordsEatenCorrect%10===0&&(this.playMode==="challenge"&&this.lives<this.maxLives?(this.lives++,this.showFloatingMessage(`💖 Xuất sắc ăn đúng ${this.wordsEatenCorrect} từ! Hồi phục +1 Tim! ❤️`)):this.showFloatingMessage(`💖 Xuất sắc ăn đúng ${this.wordsEatenCorrect} từ!`)),this.streak>=this.maxStreakNeeded?this.levelUp():this.nextWordQuestion(),this.updateHUD()}handleEatWrong(t){this.sfx.playEatWrong(),typeof window.recordWordWrong=="function"&&this.currentQuestion&&window.recordWordWrong(this.currentQuestion),this.playMode==="practice"?(this.showFloatingMessage("Ăn chưa đúng quả! Tiếp tục cố gắng nhé! 🎯"),this.nextWordQuestion()):(this.invincibleTimer<=0?(this.lives--,this.showFloatingMessage("Ăn sai nghĩa! -1 Tim 💔")):this.showFloatingMessage("🛡️ Bất tử bảo vệ!"),this.lives<=0?this.gameOver(!1):this.nextWordQuestion()),this.updateHUD()}handleEatPowerup(t){this.sfx.playPowerup(),t.type==="heal"?this.playMode==="challenge"&&this.lives<this.maxLives?(this.lives++,this.showFloatingMessage("💚 Hồi 1 Tim!")):this.showFloatingMessage("💚 Đã nhặt hồi máu!"):t.type==="x2"?(this.score+=50,this.showFloatingMessage("🪙 Nhặt được đồng xu! +50 Điểm thưởng!")):t.type==="shield"&&(this.invincibleTimer=5,this.showFloatingMessage("🛡️ Bất Tử Trong 5 Giây!")),this.updateHUD()}handleMistake(t){this.sfx.playEatWrong(),this.playMode==="practice"?(this.showFloatingMessage(`${t} (Luyện tập không trừ tim) ♾️`),this.resetSnake()):(this.invincibleTimer<=0?(this.lives--,this.showFloatingMessage(`${t} -1 Tim 💔`)):this.showFloatingMessage("🛡️ Bất tử bảo vệ!"),this.lives<=0?this.gameOver(!1):this.resetSnake()),this.updateHUD()}levelUp(){this.sfx.playLevelUp(),this.level<this.maxLevel?(this.level++,this.streak=0,this.showFloatingMessage(`🎉 LÊN CẤP ${this.level}! Rắn dài thêm 1 khúc & tăng tốc!`),this.calculateSpeed(),this.spawnObstacles(),this.nextWordQuestion()):this.gameOver(!0),this.updateHUD()}showFloatingMessage(t){typeof window.showToast=="function"&&window.showToast(t)}updateHUD(){const t=this.container.querySelector("#snake-level-badge"),i=this.container.querySelector("#snake-streak-text"),n=this.container.querySelector("#snake-beads-container"),e=this.container.querySelector("#snake-score-val"),s=this.container.querySelector("#snake-lives-container");if(t&&(t.textContent=`CẤP ${this.level}`),i&&(i.textContent=`${this.streak}/10`),e&&(e.textContent=this.score),n){n.innerHTML="";for(let a=0;a<10;a++){const l=document.createElement("span");l.className=`bead ${a<this.streak?"filled":""}`,n.appendChild(l)}}if(s)if(this.playMode==="practice")s.innerHTML='<span style="color: #10b981; font-weight: 800; font-size: 0.92rem; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-infinity"></i> Vô hạn</span>';else{s.innerHTML="";for(let a=0;a<this.maxLives;a++){const l=document.createElement("i");l.className=a<this.lives?"fa-solid fa-heart":"fa-regular fa-heart",l.style.color=a<this.lives?"#ef4444":"rgba(255,255,255,0.3)",s.appendChild(l)}}for(let a=1;a<=5;a++){const l=this.container.querySelector(`#step-lvl-${a}`);l&&(l.classList.toggle("active",a===this.level),l.classList.toggle("done",a<this.level))}}draw(){if(!this.ctx||!this.canvas)return;const t=this.ctx,i=this.canvas.width,n=this.canvas.height,e=this.cellSize;t.fillStyle="#f8fafc",t.fillRect(0,0,i,n),t.strokeStyle="rgba(226, 232, 240, 0.8)",t.lineWidth=1;for(let a=0;a<=this.cols;a++)t.beginPath(),t.moveTo(a*e,0),t.lineTo(a*e,n),t.stroke();for(let a=0;a<=this.rows;a++)t.beginPath(),t.moveTo(0,a*e),t.lineTo(i,a*e),t.stroke();this.obstacles.forEach(a=>{const l=a.x*e+e/2,c=a.y*e+e/2;t.font=`${e*.85}px sans-serif`,t.textAlign="center",t.textBaseline="middle",t.fillText(a.type==="rock"?"🪨":"🌿",l,c)}),this.powerups.forEach(a=>{const l=a.x*e+e/2,c=a.y*e+e/2;t.save(),t.beginPath(),t.arc(l,c,e*.45,0,Math.PI*2),t.fillStyle=a.type==="heal"?"rgba(239, 68, 68, 0.25)":a.type==="x2"?"rgba(245, 158, 11, 0.25)":"rgba(56, 189, 248, 0.25)",t.fill(),t.font=`${e*.7}px sans-serif`,t.textAlign="center",t.textBaseline="middle",t.fillText(a.type==="heal"?"💚":a.type==="x2"?"🪙":"🛡️",l,c),t.restore()});const s=this.activeQuestionMode==="vi-zh"||this.activeQuestionMode==="pinyin-zh";this.apples.forEach(a=>{const l=a.x*e+e/2,c=a.y*e+e/2;t.font=`${e*.75}px sans-serif`,t.textAlign="center",t.textBaseline="middle",t.fillText("🍎",l,c-6),t.save();const r=a.displayText||(s?a.word:a.meaning||"");t.font=s?'bold 15px "LXGW WenKai Lite", "Kaiti", "STKaiti", "PingFang SC", sans-serif':"bold 12px Inter, sans-serif";const p=t.measureText(r),h=Math.max(p.width+14,46),o=s?22:20;t.fillStyle="#ffffff",t.strokeStyle="rgba(0, 0, 0, 0.25)",t.lineWidth=1.5,t.beginPath(),t.roundRect(l-h/2,c+8,h,o,6),t.fill(),t.stroke(),t.fillStyle="#0f172a",t.textAlign="center",t.textBaseline="middle",t.fillText(r,l,c+(s?19:18)),t.restore()}),this.snake.forEach((a,l)=>{const c=a.x*e,r=a.y*e,p=2;if(t.save(),l===0){t.fillStyle=this.invincibleTimer>0?"#38bdf8":"#22c55e",t.beginPath(),t.roundRect(c+p,r+p,e-p*2,e-p*2,8),t.fill(),t.fillStyle="#ffffff";const h=6;let o={x:c+e/2-h,y:r+e/2-h},d={x:c+e/2+h,y:r+e/2-h};this.dir.x===1?(o={x:c+e-8,y:r+8},d={x:c+e-8,y:r+e-8}):this.dir.x===-1?(o={x:c+8,y:r+8},d={x:c+8,y:r+e-8}):this.dir.y===1&&(o={x:c+8,y:r+e-8},d={x:c+e-8,y:r+e-8}),t.beginPath(),t.arc(o.x,o.y,3,0,Math.PI*2),t.arc(d.x,d.y,3,0,Math.PI*2),t.fill(),t.fillStyle="#0f172a",t.beginPath(),t.arc(o.x,o.y,1.5,0,Math.PI*2),t.arc(d.x,d.y,1.5,0,Math.PI*2),t.fill()}else{const h=l%2===0?"#4ade80":"#86efac";t.fillStyle=this.invincibleTimer>0?"rgba(56, 189, 248, 0.75)":h,t.beginPath(),t.roundRect(c+p,r+p,e-p*2,e-p*2,6),t.fill()}t.restore()})}togglePause(){this.isPaused=!this.isPaused;const t=this.container.querySelector("#snake-pause-btn");t&&(t.innerHTML=`<i class="fa-solid fa-${this.isPaused?"play":"pause"}"></i> ${this.isPaused?"Tiếp tục":"Tạm dừng"}`),this.showFloatingMessage(this.isPaused?"Đã tạm dừng game ⏸":"Tiếp tục chơi ▶️")}start(){this.animFrameId&&(cancelAnimationFrame(this.animFrameId),this.animFrameId=null),this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.isStopping=!1,this.isRunning=!0,this.isPaused=!1,this.level=1,this.streak=0,this.score=0,this.lives=3,this.wordsEatenCorrect=0,this.totalWordsCount=this.rawWords.length,this.wordQueue=[...this.rawWords].sort(()=>Math.random()-.5),this.timeLeft=60,this.invincibleTimer=0,this.powerups=[],this.obstacles=[],this.apples=[],this.resetSnake(),this.lastTickTime=performance.now(),this.calculateSpeed();const t=this.container.querySelector("#snake-modal-overlay");t&&t.style.setProperty("display","none","important"),this.initCanvas(),this.spawnObstacles(),this.nextWordQuestion(),this.updateHUD(),this.timerInterval=setInterval(()=>{!this.isRunning||this.isPaused||this.invincibleTimer>0&&this.invincibleTimer--},1e3),this.animFrameId=requestAnimationFrame(i=>this.loop(i))}gameOver(t){this.isRunning=!1,this.timerInterval&&clearInterval(this.timerInterval),this.animFrameId&&cancelAnimationFrame(this.animFrameId);const i=this.container.querySelector("#snake-modal-overlay"),n=this.container.querySelector("#snake-result-icon"),e=this.container.querySelector("#snake-result-title"),s=this.container.querySelector("#snake-result-desc"),a=this.container.querySelector("#snake-res-level"),l=this.container.querySelector("#snake-res-score"),c=this.container.querySelector("#snake-res-words");if(i){i.style.setProperty("display","flex","important"),n&&(n.textContent=t?"👑":"🐍"),e&&(e.textContent=t?"Vua Nuôi Rắn Từ Vựng!":"Hết Tim - Kết Thúc Lượt Chơi!"),s&&(s.textContent=t?`Bạn đã xuất sắc hoàn thành toàn bộ ${this.wordsEatenCorrect}/${this.totalWordsCount} từ vựng!`:"Hãy chú ý quan sát từ vựng và chọn đúng quả táo nhé!"),a&&(a.textContent=`CẤP ${this.level}`),l&&(l.textContent=this.score),c&&(c.textContent=`${this.wordsEatenCorrect||0}/${this.totalWordsCount||0}`);const r=i.querySelector("#snake-words-summary-wrap");r&&this.renderWordSummaryList(r,this.rawWords,this.correctWordsSet);const p=i.querySelector("#snake-modal-close-x"),h=i.querySelector("#snake-retry-btn"),o=i.querySelector("#snake-back-hub-btn"),d=i.querySelector("#snake-finish-btn");p&&(p.onclick=u=>{u.preventDefault(),u.stopPropagation(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),h&&(h.onclick=u=>{u.preventDefault(),u.stopPropagation(),this.restart()}),o&&(o.onclick=u=>{u.preventDefault(),u.stopPropagation(),this.stopAndExit()}),d&&(d.onclick=u=>{u.preventDefault(),u.stopPropagation(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()})}}renderWordSummaryList(t,i,n){if(!t)return;const e=i.length,s=i.filter(r=>n.has(r.word)).length,a=e-s;t.innerHTML=`
      <div class="game-results-word-summary">
        <div class="summary-tabs-header">
          <button type="button" class="summary-tab-btn active" data-tab="all">
            <i class="fa-solid fa-list-check"></i> Tất cả (${e})
          </button>
          <button type="button" class="summary-tab-btn correct-tab" data-tab="correct">
            <i class="fa-solid fa-circle-check"></i> Đúng (${s})
          </button>
          <button type="button" class="summary-tab-btn wrong-tab" data-tab="wrong">
            <i class="fa-solid fa-circle-xmark"></i> Sai / Cần ôn (${a})
          </button>
        </div>
        <div class="summary-words-list"></div>
      </div>
    `;const l=t.querySelector(".summary-words-list"),c=r=>{l.innerHTML="";const p=i.filter(h=>{const o=n.has(h.word);return r==="correct"?o:r==="wrong"?!o:!0});if(p.length===0){l.innerHTML='<div style="text-align: center; color: #94a3b8; padding: 20px; font-size: 0.85rem;">Không có từ vựng nào trong mục này.</div>';return}p.forEach(h=>{const o=n.has(h.word),d=document.createElement("div");d.className=`summary-word-card ${o?"is-correct":"is-wrong"}`,d.innerHTML=`
          <div class="sw-badge ${o?"badge-correct":"badge-wrong"}">
            <i class="fa-solid fa-${o?"check":"xmark"}"></i> ${o?"Đúng":"Sai"}
          </div>
          <div class="sw-main">
            <div class="sw-hanzi">${h.word}</div>
            <div class="sw-pinyin">${h.pinyin?`[ ${h.pinyin} ]`:""}</div>
            <div class="sw-meaning">${h.meaning||""}</div>
          </div>
          <button type="button" class="sw-speak-btn" title="Nghe phát âm">
            <i class="fa-solid fa-volume-high"></i>
          </button>
        `;const u=d.querySelector(".sw-speak-btn");u&&(u.onclick=f=>{f.stopPropagation(),typeof window.speakText=="function"&&window.speakText(h.word)}),l.appendChild(d)})};c("all"),t.querySelectorAll(".summary-tab-btn").forEach(r=>{r.addEventListener("click",p=>{p.preventDefault(),t.querySelectorAll(".summary-tab-btn").forEach(h=>h.classList.remove("active")),r.classList.add("active"),c(r.dataset.tab)})})}restart(){const t=this.container.querySelector("#snake-modal-overlay");t&&t.style.setProperty("display","none","important"),this.start()}stopAndExit(){this.currentQuestion&&this.currentQuestion.word&&(!this.correctWordsSet||!this.correctWordsSet.has(this.currentQuestion.word))&&typeof window.recordWordWrong=="function"&&window.recordWordWrong(this.currentQuestion),this.isRunning=!1,this.isStopping=!0,this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.animFrameId&&(cancelAnimationFrame(this.animFrameId),this.animFrameId=null),this.keyHandler&&(window.removeEventListener("keydown",this.keyHandler,!0),this.keyHandler=null),this.resizeHandler&&(window.removeEventListener("resize",this.resizeHandler),this.resizeHandler=null),this.canvas&&this.touchStartHandler&&(this.canvas.removeEventListener("touchstart",this.touchStartHandler),this.canvas.removeEventListener("touchmove",this.touchMoveHandler),this.canvas.removeEventListener("touchend",this.touchEndHandler),this.canvas.removeEventListener("touchcancel",this.touchEndHandler),this.touchStartHandler=null,this.touchMoveHandler=null,this.touchEndHandler=null);const t=this.onExit;this.onExit=null,typeof t=="function"&&t()}}class z{constructor(){this.ctx=null}init(){if(!this.ctx){const t=window.AudioContext||window.webkitAudioContext;t&&(this.ctx=new t)}}playTone(t,i,n,e=null,s=.18){try{if(this.init(),!this.ctx)return;this.ctx.state==="suspended"&&this.ctx.resume();const a=this.ctx.createOscillator(),l=this.ctx.createGain();a.type=i,a.frequency.setValueAtTime(t,this.ctx.currentTime),e&&a.frequency.exponentialRampToValueAtTime(e,this.ctx.currentTime+n),l.gain.setValueAtTime(s,this.ctx.currentTime),l.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+n),a.connect(l),l.connect(this.ctx.destination),a.start(),a.stop(this.ctx.currentTime+n)}catch{}}playSelect(){this.playTone(480,"sine",.09,680,.15)}playMatch(){this.playTone(523.25,"triangle",.18,659.25,.22),setTimeout(()=>{this.playTone(783.99,"sine",.25,1046.5,.25)},60)}playMismatch(){this.playTone(220,"sawtooth",.18,140,.16)}playPowerup(){this.playTone(400,"sine",.28,880,.22)}playBomb(){this.playTone(180,"sawtooth",.35,60,.3)}playWarning(){this.playTone(587.33,"sine",.12,880,.2)}playUrgentTick(){this.playTone(950,"triangle",.06,1200,.06)}playGameOver(){this.playTone(320,"sawtooth",.35,90,.35)}}const H=[{word:"苹果",pinyin:"píngguǒ",meaning:"quả táo"},{word:"香蕉",pinyin:"xiāngjiāo",meaning:"quả chuối"},{word:"西瓜",pinyin:"xīguā",meaning:"dưa hấu"},{word:"葡萄",pinyin:"pútao",meaning:"quả nho"},{word:"学校",pinyin:"xuéxiào",meaning:"trường học"},{word:"老师",pinyin:"lǎoshī",meaning:"giáo viên"},{word:"学生",pinyin:"xuéshēng",meaning:"học sinh"},{word:"朋友",pinyin:"péngyou",meaning:"bạn bè"},{word:"汉语",pinyin:"hànyǔ",meaning:"tiếng Hán"},{word:"谢谢",pinyin:"xièxie",meaning:"cảm ơn"},{word:"再见",pinyin:"zàijiàn",meaning:"tạm biệt"},{word:"喜欢",pinyin:"xǐhuan",meaning:"thích"},{word:"喝茶",pinyin:"hē chá",meaning:"uống trà"},{word:"吃饭",pinyin:"chī fàn",meaning:"ăn cơm"},{word:"中国",pinyin:"zhōngguó",meaning:"Trung Quốc"},{word:"高兴",pinyin:"gāoxìng",meaning:"vui vẻ"}];class ${constructor(t,i,n){if(this.container=t,this.rawWords=Array.isArray(i)&&i.length>=4?i:H,this.onExit=n,this.sfx=new z,this.rows=6,this.cols=8,this.grid=[],this.score=0,this.combo=0,this.maxCombo=0,this.timeLeft=100,this.pairsLeft=0,this.totalPairs=0,this.isPaused=!1,this.isRunning=!1,this.isStopping=!1,this.playMode=localStorage.getItem("mahjong_play_mode")||"practice",this.autoSpeech=localStorage.getItem("mahjong_auto_speech")!=="false",this.selectedTile=null,this.isResolvingMatch=!1,this.clearedWordsSet=new Set,this.hintCount=3,this.shuffleCount=3,this.bombCount=2,this.timerInterval=null,"speechSynthesis"in window)try{window.speechSynthesis.getVoices(),typeof window.speechSynthesis.onvoiceschanged<"u"&&(window.speechSynthesis.onvoiceschanged=()=>{try{window.speechSynthesis.getVoices()}catch{}})}catch{}this.renderLayout(),this.bindEvents()}renderLayout(){this.container.innerHTML=`
      <div class="mahjong-game-wrapper">
        <!-- TOP HUD -->
        <div class="mahjong-hud-bar">
          <button type="button" id="mahjong-top-back-btn" class="btn btn-outline btn-sm" style="display: flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 50px;">
            <i class="fa-solid fa-arrow-left"></i> Đổi Game
          </button>

          <div class="hud-item-title">
            <span style="font-size: 1.4rem;">🀄</span>
            <strong style="color: #10b981;">MẠT CHƯỢC</strong>
          </div>

          <!-- Play Mode Toggle Button -->
          <button type="button" id="mahjong-mode-toggle-btn" class="btn btn-outline btn-sm" title="Chuyển chế độ Kiểm tra (Không giới hạn giờ) / Thi đấu (Đếm ngược)" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 800; border-radius: 50px; cursor: pointer; padding: 5px 12px;">
            <span id="mahjong-mode-icon-text">${this.playMode==="practice"?'<i class="fa-solid fa-infinity" style="color: #10b981;"></i> <span style="color:#10b981;">Kiểm tra</span>':'<i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span style="color:#fbbf24;">Thi đấu</span>'}</span>
          </button>

          <!-- Auto Speech Toggle Button -->
          <button type="button" id="mahjong-speech-toggle-btn" class="btn btn-outline btn-sm" title="Bật/Tắt tự động phát âm ngay khi nối cặp từ vựng" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 800; border-radius: 50px; cursor: pointer; padding: 5px 12px;">
            <i class="fa-solid ${this.autoSpeech?"fa-volume-high":"fa-volume-xmark"}" id="mahjong-speech-icon" style="color: ${this.autoSpeech?"#22c55e":"#94a3b8"};"></i>
            <span id="mahjong-speech-text" style="font-size: 0.78rem;">${this.autoSpeech?"Đọc":"Tắt đọc"}</span>
          </button>

          <div class="hud-item" id="mahjong-level-badge" style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #10b981; font-weight: 800; padding: 4px 12px; border-radius: 20px; font-size: 0.82rem;">
            MÀN 1/1
          </div>

          <div class="hud-item hud-progress" style="display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-book-open" style="color: #7c3aed;"></i>
            <span class="hud-label">TIẾN TRÌNH:</span>
            <span class="hud-value" id="mahjong-progress-val">0/0 từ</span>
          </div>

          <div class="hud-item hud-score">
            <i class="fa-solid fa-star" style="color: #fbbf24;"></i>
            <span class="hud-label">ĐIỂM:</span>
            <span class="hud-value" id="mahjong-score-val">0</span>
          </div>

          <div class="hud-item hud-combo">
            <i class="fa-solid fa-fire" style="color: #f97316;"></i>
            <span class="hud-label">ĐÃ NỐI:</span>
            <span class="hud-value" id="mahjong-pairs-val">0/0 cặp</span>
          </div>

          <div class="hud-item hud-timer" title="Thời gian của màn chơi này">
            <i class="fa-solid fa-clock" style="color: #0284c7;"></i>
            <span class="hud-label">THỜI GIAN:</span>
            <span class="hud-value" id="mahjong-timer-val">${this.playMode==="practice"?"♾️ Vô hạn":"01:40"}</span>
          </div>

          <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
            <button type="button" id="mahjong-pause-btn" class="btn btn-outline btn-sm" title="Tạm dừng"><i class="fa-solid fa-pause"></i></button>
            <button type="button" id="mahjong-back-hub-top-btn" class="btn btn-secondary btn-sm" title="Đổi trò chơi khác" style="display: flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 50px; padding: 6px 14px;">
              <i class="fa-solid fa-arrow-left"></i> Đổi Game
            </button>
            <button type="button" id="mahjong-exit-btn" class="btn btn-outline btn-sm" title="Thoát về sổ tay"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>

        <!-- MAIN MAHJONG ARENA & TOOLBAR -->
        <div class="mahjong-arena-layout">
          <!-- BOARD CONTAINER WITH CANVAS FOR LASER CONNECTORS -->
          <div class="mahjong-board-container" id="mahjong-board-container">
            <canvas id="mahjong-line-canvas" class="mahjong-line-canvas"></canvas>
            <div id="mahjong-tiles-grid" class="mahjong-tiles-grid"></div>
          </div>

          <!-- RIGHT TOOLBAR: SKILL ITEMS -->
          <div class="mahjong-tools-panel">
            <div class="tool-sec-title">VẬT PHẨM TRỢ GIÚP</div>

            <!-- Tool 1: Kính lúp (Hint) -->
            <button type="button" class="mahjong-tool-card" id="tool-hint" title="Gợi ý cặp nối">
              <div class="tool-icon" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8;">
                <i class="fa-solid fa-magnifying-glass"></i>
              </div>
              <div class="tool-info">
                <div class="tool-name">KÍNH LÚP</div>
                <div class="tool-desc">Tìm 1 cặp nối được</div>
              </div>
              <div class="tool-badge" id="badge-hint">x3</div>
            </button>

            <!-- Tool 2: Gió lốc (Shuffle) -->
            <button type="button" class="mahjong-tool-card" id="tool-shuffle" title="Đảo lại bàn cờ">
              <div class="tool-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
                <i class="fa-solid fa-shuffle"></i>
              </div>
              <div class="tool-info">
                <div class="tool-name">GIÓ LỐC</div>
                <div class="tool-desc">Xáo lại vị trí bàn cờ</div>
              </div>
              <div class="tool-badge" id="badge-shuffle">x3</div>
            </button>

            <!-- Tool 3: Bom hóa giải (Bomb) -->
            <button type="button" class="mahjong-tool-card" id="tool-bomb" title="Phá 1 cặp bất kỳ">
              <div class="tool-icon" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;">
                <i class="fa-solid fa-bomb"></i>
              </div>
              <div class="tool-info">
                <div class="tool-name">BOM THẦN KỲ</div>
                <div class="tool-desc">Triệt tiêu 1 cặp ngay</div>
              </div>
              <div class="tool-badge" id="badge-bomb">x2</div>
            </button>

            <div class="mahjong-rules-tip">
              <strong>💡 QUY TẮC NỐI:</strong><br>
              Nối 2 quân cùng từ vựng (Chữ Hán ↔ Nghĩa hoặc Chữ Hán ↔ Pinyin) theo đường đi không quá 2 góc gập (3 đoạn thẳng).
            </div>
          </div>
        </div>

        <!-- MODAL OVERLAY -->
        <div id="mahjong-modal-overlay" class="cannon-modal-overlay" style="display: none;">
          <div class="cannon-result-card">
            <button type="button" id="mahjong-modal-close-x" class="result-modal-close-btn" title="Đóng">&times;</button>
            <div id="mahjong-result-icon" class="result-icon">🀄</div>
            <h2 id="mahjong-result-title" class="result-title">Hoàn Thành Bàn Cờ!</h2>
            <p id="mahjong-result-desc" class="result-desc">Bạn đã xuất sắc dọn sạch toàn bộ quân cờ mạt chược!</p>
            
            <div class="result-stats-grid">
              <div class="stat-pill">
                <span class="label">Tổng Điểm</span>
                <span class="val" id="mahjong-res-score">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Combo Cao Nhất</span>
                <span class="val" id="mahjong-res-combo">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Cặp Đã Nối</span>
                <span class="val" id="mahjong-res-pairs">0</span>
              </div>
            </div>

            <!-- BẢNG TỔNG KẾT TỪ VỰNG ĐÚNG / SAI -->
            <div id="mahjong-words-summary-wrap"></div>

            <div class="result-beta-note">
              <i class="fa-solid fa-flask"></i> <strong>Chế độ luyện tập:</strong> Hãy tiếp tục trau dồi vốn từ vựng HSK của bạn!
            </div>

            <div class="cannon-result-card-actions">
              <button type="button" id="mahjong-retry-btn" class="btn btn-primary"><i class="fa-solid fa-rotate-right"></i> Chơi Lại</button>
              <button type="button" id="mahjong-back-hub-btn" class="btn btn-secondary"><i class="fa-solid fa-gamepad"></i> Đổi Trò Chơi</button>
              <button type="button" id="mahjong-finish-btn" class="btn btn-outline"><i class="fa-solid fa-book-bookmark"></i> Quay Lại Sổ Tay</button>
            </div>
          </div>
        </div>
      </div>
    `}bindEvents(){const t=this.container.querySelector("#mahjong-top-back-btn"),i=this.container.querySelector("#mahjong-back-hub-top-btn"),n=this.container.querySelector("#mahjong-pause-btn"),e=this.container.querySelector("#mahjong-exit-btn"),s=this.container.querySelector("#mahjong-modal-close-x"),a=this.container.querySelector("#mahjong-retry-btn"),l=this.container.querySelector("#mahjong-back-hub-btn"),c=this.container.querySelector("#mahjong-finish-btn"),r=this.container.querySelector("#tool-hint"),p=this.container.querySelector("#tool-shuffle"),h=this.container.querySelector("#tool-bomb"),o=this.container.querySelector("#mahjong-mode-toggle-btn");o&&o.addEventListener("click",u=>{u.preventDefault(),this.playMode=this.playMode==="practice"?"challenge":"practice",localStorage.setItem("mahjong_play_mode",this.playMode);const f=this.container.querySelector("#mahjong-mode-icon-text");f&&(f.innerHTML=this.playMode==="practice"?'<i class="fa-solid fa-infinity" style="color: #10b981;"></i> <span style="color:#10b981;">Kiểm tra</span>':'<i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span style="color:#fbbf24;">Thi đấu</span>'),this.updateHUD(),this.startTimers(),this.showToast(this.playMode==="practice"?"🎯 Chế độ Kiểm tra (♾️ Không giới hạn thời gian)":"🏆 Chế độ Thi đấu (⏱️ Đếm ngược thời gian)")});const d=this.container.querySelector("#mahjong-speech-toggle-btn");d&&d.addEventListener("click",u=>{u.preventDefault(),this.autoSpeech=!this.autoSpeech,localStorage.setItem("mahjong_auto_speech",this.autoSpeech?"true":"false");const f=this.container.querySelector("#mahjong-speech-icon"),m=this.container.querySelector("#mahjong-speech-text");f&&(f.className=`fa-solid ${this.autoSpeech?"fa-volume-high":"fa-volume-xmark"}`,f.style.color=this.autoSpeech?"#22c55e":"#94a3b8"),m&&(m.textContent=this.autoSpeech?"Đọc":"Tắt đọc"),this.showToast(this.autoSpeech?"🔊 Đã bật phát âm từ vựng":"🔇 Đã tắt phát âm")}),t&&t.addEventListener("click",()=>this.stopAndExit()),i&&i.addEventListener("click",()=>this.stopAndExit()),n&&n.addEventListener("click",()=>this.togglePause()),e&&e.addEventListener("click",()=>{this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),s&&s.addEventListener("click",()=>{this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),a&&a.addEventListener("click",()=>this.restart()),l&&l.addEventListener("click",()=>this.stopAndExit()),c&&c.addEventListener("click",()=>{this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),r&&r.addEventListener("click",()=>this.useHint()),p&&p.addEventListener("click",()=>this.useShuffle()),h&&h.addEventListener("click",()=>this.useBomb())}start(){this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.isStopping=!1,this.isRunning=!0,this.isPaused=!1,this.score=0,this.combo=0,this.maxCombo=0,this.timeLeft=100,this.hintCount=3,this.shuffleCount=3,this.bombCount=2,this.selectedTile=null,this.isResolvingMatch=!1,this.totalWordsCount=(this.rawWords||[]).length,this.totalLevels=Math.max(1,Math.ceil(this.totalWordsCount/12)),this.currentLevel=1,this.unplayedWordsPool=[...this.rawWords||[]].sort(()=>Math.random()-.5),this.totalUniqueWordsCleared=0,this.currentLevelNewWordsCount=0;const t=this.container.querySelector("#mahjong-modal-overlay");if(t&&t.style.setProperty("display","none","important"),"speechSynthesis"in window)try{window.speechSynthesis.getVoices();const n=new SpeechSynthesisUtterance("");window.speechSynthesis.speak(n)}catch{}const i=this.container.querySelector(".hud-timer");i&&i.classList.remove("timer-warning-60","timer-warning-30","timer-urgent-10"),this.initBoard(),this.updateHUD(),this.startTimers()}startTimers(){this.timerInterval&&clearInterval(this.timerInterval),this.playMode!=="practice"&&(this.timerInterval=setInterval(()=>{!this.isRunning||this.isPaused||(this.timeLeft--,this.handleTimeCountdownAlert(this.timeLeft),this.timeLeft<=0&&this.gameOver(!1),this.updateHUD())},1e3))}handleTimeCountdownAlert(t){const i=this.container.querySelector(".hud-timer");t===60?(this.sfx&&this.sfx.playWarning&&this.sfx.playWarning(),this.showToast("⏳ Còn 60 giây!"),i&&(i.classList.add("timer-warning-60"),setTimeout(()=>i&&i.classList.remove("timer-warning-60"),2e3))):t===30?(this.sfx&&this.sfx.playWarning&&this.sfx.playWarning(),this.showToast("⚠️ Còn 30 giây! Hãy tăng tốc!"),i&&i.classList.add("timer-warning-30")):t<=10&&t>=1&&(this.sfx&&this.sfx.playUrgentTick&&this.sfx.playUrgentTick(),i&&i.classList.add("timer-urgent-10"),this.showCenterCountdownTick(t))}showCenterCountdownTick(t){let i=this.container.querySelector(".game-center-countdown-tick");i||(i=document.createElement("div"),i.className="game-center-countdown-tick",(this.container.querySelector("#mahjong-board-container")||this.container).appendChild(i)),i.textContent=t,i.classList.remove("tick-anim"),i.offsetWidth,i.classList.add("tick-anim")}initBoard(){const t=this.rows-2,i=this.cols-2,e=t*i/2;if(!this.unplayedWordsPool||this.unplayedWordsPool.length===0){this.gameOver(!0);return}const s=this.unplayedWordsPool.splice(0,Math.min(e,this.unplayedWordsPool.length));this.currentLevelNewWordsCount=s.length;const a=[...s];let l=0;for(;a.length<e;){const r=this.rawWords[l%this.rawWords.length]||H[l%H.length];a.push(r),l++}this.totalPairs=e,this.pairsLeft=e;const c=[];for(let r=0;r<e;r++){const p=a[r],h="pair_"+r+"_"+Date.now(),o=p.word||p.hanzi||p.char||p.text||"汉字",d=p.pinyin||"hànzì",u=p.meaning||p.vietnamese||p.vi||"từ vựng";c.push({pairId:h,word:o,text:o,type:"hanzi",pinyin:d,meaning:u}),r%3===0?c.push({pairId:h,word:o,text:d,type:"pinyin",pinyin:d,meaning:u}):c.push({pairId:h,word:o,text:u,type:"meaning",pinyin:d,meaning:u})}c.sort(()=>.5-Math.random()),this.grid=[];for(let r=0;r<this.rows;r++){this.grid[r]=[];for(let p=0;p<this.cols;p++)if(r===0||r===this.rows-1||p===0||p===this.cols-1)this.grid[r][p]=null;else{const h=c.pop();this.grid[r][p]=h?{...h,r,c:p}:null}}this.ensureSolvableBoard(),this.renderBoard()}ensureSolvableBoard(){let t=this.findAnyValidPair(),i=0;for(;!t&&i<10;){const n=[];for(let e=1;e<this.rows-1;e++)for(let s=1;s<this.cols-1;s++)this.grid[e][s]&&n.push(this.grid[e][s]);n.sort(()=>.5-Math.random());for(let e=1;e<this.rows-1;e++)for(let s=1;s<this.cols-1;s++)if(this.grid[e][s]){const a=n.pop();a.r=e,a.c=s,this.grid[e][s]=a}t=this.findAnyValidPair(),i++}}renderBoard(){const t=this.container.querySelector("#mahjong-tiles-grid");if(t){t.style.gridTemplateColumns=`repeat(${this.cols-2}, 1fr)`,t.style.gridTemplateRows=`repeat(${this.rows-2}, 1fr)`,t.innerHTML="";for(let i=1;i<this.rows-1;i++)for(let n=1;n<this.cols-1;n++){const e=this.grid[i][n],s=document.createElement("button");if(s.type="button",s.id=`tile_${i}_${n}`,s.className=`mahjong-tile ${e?"type-"+e.type:"cleared"}`,e){const a=e.type==="hanzi"?"HÁN":e.type==="pinyin"?"PINYIN":"NGHĨA";s.innerHTML=`
            <span class="tile-inner-text">${e.text}</span>
            <span class="tile-type-tag">${a}</span>
          `,s.addEventListener("click",l=>{l.preventDefault(),this.handleTileClick(i,n)})}else s.disabled=!0;t.appendChild(s)}this.updateSelectionHighlights()}}handleTileClick(t,i){if(this.isResolvingMatch||!this.isRunning||this.isPaused)return;const n=this.grid[t][i];if(n)if(!this.selectedTile)this.sfx.playSelect(),this.selectedTile={r:t,c:i},this.updateSelectionHighlights();else{if(this.selectedTile.r===t&&this.selectedTile.c===i){this.sfx.playSelect(),this.selectedTile=null,this.updateSelectionHighlights();return}const e=this.selectedTile,s=this.grid[e.r][e.c];if(s&&s.pairId===n.pairId){const a=this.findOnetPath(e.r,e.c,t,i);a?this.handleMatch(e,{r:t,c:i},a):(this.sfx.playMismatch(),this.triggerTileShake(t,i),this.showToast("⚠️ Bị cản đường! Nối không quá 2 góc gập."),this.selectedTile={r:t,c:i},this.updateSelectionHighlights())}else this.sfx.playMismatch(),this.triggerTileShake(t,i),this.selectedTile={r:t,c:i},this.updateSelectionHighlights()}}triggerTileShake(t,i){const n=this.container.querySelector(`#tile_${t}_${i}`);n&&(n.classList.remove("shake-tile"),n.offsetWidth,n.classList.add("shake-tile"),setTimeout(()=>n.classList.remove("shake-tile"),380))}updateSelectionHighlights(){if(this.container.querySelectorAll(".mahjong-tile").forEach(t=>t.classList.remove("selected","hint-pulse")),this.selectedTile){const t=this.container.querySelector(`#tile_${this.selectedTile.r}_${this.selectedTile.c}`);t&&t.classList.add("selected")}}findOnetPath(t,i,n,e){if(this.canConnectDirect(t,i,n,e))return[{r:t,c:i},{r:n,c:e}];if(this.isEmptyCell(t,e)&&this.canConnectDirect(t,i,t,e)&&this.canConnectDirect(t,e,n,e))return[{r:t,c:i},{r:t,c:e},{r:n,c:e}];if(this.isEmptyCell(n,i)&&this.canConnectDirect(t,i,n,i)&&this.canConnectDirect(n,i,n,e))return[{r:t,c:i},{r:n,c:i},{r:n,c:e}];for(let s=0;s<this.cols;s++)if(!(s===i||s===e)&&this.isEmptyCell(t,s)&&this.isEmptyCell(n,s)&&this.canConnectDirect(t,i,t,s)&&this.canConnectDirect(t,s,n,s)&&this.canConnectDirect(n,s,n,e))return[{r:t,c:i},{r:t,c:s},{r:n,c:s},{r:n,c:e}];for(let s=0;s<this.rows;s++)if(!(s===t||s===n)&&this.isEmptyCell(s,i)&&this.isEmptyCell(s,e)&&this.canConnectDirect(t,i,s,i)&&this.canConnectDirect(s,i,s,e)&&this.canConnectDirect(s,e,n,e))return[{r:t,c:i},{r:s,c:i},{r:s,c:e},{r:n,c:e}];return null}isEmptyCell(t,i){return t<0||t>=this.rows||i<0||i>=this.cols?!0:this.grid[t][i]===null}canConnectDirect(t,i,n,e){if(t===n){const s=Math.min(i,e),a=Math.max(i,e);for(let l=s+1;l<a;l++)if(!this.isEmptyCell(t,l))return!1;return!0}if(i===e){const s=Math.min(t,n),a=Math.max(t,n);for(let l=s+1;l<a;l++)if(!this.isEmptyCell(l,i))return!1;return!0}return!1}handleMatch(t,i,n){this.isResolvingMatch=!0;const e=this.grid[t.r][t.c],s=this.grid[i.r][i.c];this.sfx.playMatch(),this.score+=25+this.combo*10,this.combo++,this.pairsLeft--,this.combo>this.maxCombo&&(this.maxCombo=this.combo);const a=e&&e.word||s&&s.word||(e&&e.type==="hanzi"?e.text:"")||(s&&s.type==="hanzi"?s.text:"")||e&&(e.hanzi||e.text)||s&&(s.hanzi||s.text)||"";a&&(this.clearedWordsSet.add(a),typeof window.recordWordMemorized=="function"&&window.recordWordMemorized({word:a,pinyin:(e==null?void 0:e.pinyin)||(s==null?void 0:s.pinyin),meaning:(e==null?void 0:e.meaning)||(s==null?void 0:s.meaning)}));const l=this.container.querySelector(`#tile_${t.r}_${t.c}`),c=this.container.querySelector(`#tile_${i.r}_${i.c}`);l&&l.classList.add("matched-glow"),c&&c.classList.add("matched-glow"),this.drawLaserPath(n),this.autoSpeech&&a&&this.speakWordInstant(a),setTimeout(()=>{l&&l.classList.add("matched-vanish"),c&&c.classList.add("matched-vanish")},180),setTimeout(()=>{this.clearLaserPath(),this.grid[t.r][t.c]=null,this.grid[i.r][i.c]=null,this.selectedTile=null,this.isResolvingMatch=!1,this.renderBoard(),this.updateHUD(),this.pairsLeft<=0?(this.totalUniqueWordsCleared+=this.currentLevelNewWordsCount,this.unplayedWordsPool&&this.unplayedWordsPool.length>0?(this.currentLevel++,this.sfx.playPowerup(),this.timeLeft=Math.min(150,this.timeLeft+50),this.hintCount=3,this.shuffleCount=3,this.bombCount=2,this.showToast(`🎉 XUẤT SẮC QUA MÀN ${this.currentLevel-1}! Sang Màn ${this.currentLevel}/${this.totalLevels} (${this.unplayedWordsPool.length} từ tiếp theo)... Đã hồi đầy đủ Trợ giúp!`),this.initBoard(),this.updateHUD()):this.gameOver(!0)):!this.findAnyValidPair()&&this.pairsLeft>0&&(this.showToast("🔄 Tự động xáo trộn cờ vì không còn đường đi!"),this.autoShuffleBoard())},380)}speakWordInstant(t){if(!t)return;const i=String(t).replace(/<[^>]*>/g,"").replace(/[\(\uff08][^\)\uff09]*[\)\uff09]/g,"").trim();if(i){if("speechSynthesis"in window)try{window.speechSynthesis.cancel();const n=new SpeechSynthesisUtterance(i);n.lang="zh-CN",n.rate=.95,n.pitch=1;const e=window.speechSynthesis.getVoices();if(e&&e.length>0){const s=e.find(a=>a.lang==="zh-CN"||a.lang==="zh"||a.lang&&a.lang.startsWith("zh"));s&&(n.voice=s)}window.speechSynthesis.speak(n);return}catch(n){console.warn("Mahjong speakWordInstant error:",n)}if(typeof window.speakWordInstant=="function")try{window.speakWordInstant(i);return}catch{}if(typeof window.speakText=="function")try{window.speakText(i)}catch{}}}getPointCoordinates(t,i){const n=this.container.querySelector("#mahjong-board-container"),e=this.container.querySelector("#mahjong-tiles-grid");if(!n||!e)return{x:0,y:0};const s=n.getBoundingClientRect(),a=e.getBoundingClientRect(),l=this.container.querySelector(`#tile_${t}_${i}`);if(l){const u=l.getBoundingClientRect();return{x:u.left+u.width/2-s.left,y:u.top+u.height/2-s.top}}const c=this.cols-2,r=this.rows-2,p=a.width/c,h=a.height/r;let o=0,d=0;return i===0?o=a.left-s.left-18:i===this.cols-1?o=a.right-s.left+18:o=a.left-s.left+(i-1+.5)*p,t===0?d=a.top-s.top-18:t===this.rows-1?d=a.bottom-s.top+18:d=a.top-s.top+(t-1+.5)*h,{x:o,y:d}}drawLaserPath(t){const i=this.container.querySelector("#mahjong-line-canvas"),n=this.container.querySelector("#mahjong-board-container");if(!i||!n||!t||t.length<2)return;const e=n.getBoundingClientRect();i.width=e.width,i.height=e.height;const s=i.getContext("2d"),a=t.map(l=>this.getPointCoordinates(l.r,l.c));s.clearRect(0,0,i.width,i.height),s.save(),s.beginPath(),a.forEach((l,c)=>{c===0?s.moveTo(l.x,l.y):s.lineTo(l.x,l.y)}),s.lineCap="round",s.lineJoin="round",s.lineWidth=14,s.strokeStyle="rgba(56, 189, 248, 0.4)",s.shadowColor="#38bdf8",s.shadowBlur=18,s.stroke(),s.restore(),s.save(),s.beginPath(),a.forEach((l,c)=>{c===0?s.moveTo(l.x,l.y):s.lineTo(l.x,l.y)}),s.lineCap="round",s.lineJoin="round",s.lineWidth=5,s.strokeStyle="#22d3ee",s.shadowColor="#06b6d4",s.shadowBlur=8,s.stroke(),s.restore(),s.save(),s.beginPath(),a.forEach((l,c)=>{c===0?s.moveTo(l.x,l.y):s.lineTo(l.x,l.y)}),s.lineCap="round",s.lineJoin="round",s.lineWidth=2.2,s.strokeStyle="#ffffff",s.stroke(),s.restore(),a.forEach(l=>{s.save(),s.beginPath(),s.arc(l.x,l.y,6,0,Math.PI*2),s.fillStyle="#ffffff",s.shadowColor="#38bdf8",s.shadowBlur=12,s.fill(),s.restore()})}clearLaserPath(){const t=this.container.querySelector("#mahjong-line-canvas");t&&t.getContext("2d").clearRect(0,0,t.width,t.height)}findAnyValidPair(){for(let t=1;t<this.rows-1;t++)for(let i=1;i<this.cols-1;i++){const n=this.grid[t][i];if(n)for(let e=1;e<this.rows-1;e++)for(let s=1;s<this.cols-1;s++){if(t===e&&i===s)continue;const a=this.grid[e][s];if(!a||n.pairId!==a.pairId)continue;const l=this.findOnetPath(t,i,e,s);if(l)return{tile1:{r:t,c:i},tile2:{r:e,c:s},path:l}}}return null}useHint(){if(!this.isRunning||this.isPaused)return;if(this.hintCount<=0){this.showToast("Đã dùng hết Kính Lúp gợi ý!");return}const t=this.findAnyValidPair();if(t){this.hintCount--,this.sfx.playPowerup();const i=this.container.querySelector(`#tile_${t.tile1.r}_${t.tile1.c}`),n=this.container.querySelector(`#tile_${t.tile2.r}_${t.tile2.c}`);i&&i.classList.add("hint-pulse"),n&&n.classList.add("hint-pulse"),this.updateHUD(),this.showToast("🔍 Đã tìm thấy 1 cặp có thể nối!")}else this.showToast("Không còn cặp nối trực tiếp, hãy dùng Gió Lốc đảo bài!")}useShuffle(){if(!(!this.isRunning||this.isPaused)){if(this.shuffleCount<=0){this.showToast("Đã dùng hết Gió Lốc đảo bài!");return}this.shuffleCount--,this.sfx.playPowerup(),this.autoShuffleBoard(),this.updateHUD(),this.showToast("🌪️ Đã xáo trộn lại toàn bộ bàn cờ!")}}autoShuffleBoard(){const t=[];for(let i=1;i<this.rows-1;i++)for(let n=1;n<this.cols-1;n++)this.grid[i][n]&&t.push(this.grid[i][n]);t.sort(()=>.5-Math.random());for(let i=1;i<this.rows-1;i++)for(let n=1;n<this.cols-1;n++)if(this.grid[i][n]){const e=t.pop();e.r=i,e.c=n,this.grid[i][n]=e}this.ensureSolvableBoard(),this.selectedTile=null,this.renderBoard()}useBomb(){if(!(!this.isRunning||this.isPaused)){if(this.bombCount<=0){this.showToast("Đã dùng hết Bom Thần Kỳ!");return}for(let t=1;t<this.rows-1;t++)for(let i=1;i<this.cols-1;i++){const n=this.grid[t][i];if(n)for(let e=1;e<this.rows-1;e++)for(let s=1;s<this.cols-1;s++){if(t===e&&i===s)continue;const a=this.grid[e][s];if(a&&n.pairId===a.pairId){this.bombCount--,this.sfx.playBomb(),this.handleMatch({r:t,c:i},{r:e,c:s},[{r:t,c:i},{r:e,c:s}]),this.showToast("💣 Bom Thần Kỳ đã hóa giải 1 cặp!");return}}}}}updateHUD(){const t=this.container.querySelector("#mahjong-score-val"),i=this.container.querySelector("#mahjong-pairs-val"),n=this.container.querySelector("#mahjong-timer-val"),e=this.container.querySelector("#mahjong-level-badge"),s=this.container.querySelector("#mahjong-progress-val"),a=this.container.querySelector("#badge-hint"),l=this.container.querySelector("#badge-shuffle"),c=this.container.querySelector("#badge-bomb");if(t&&(t.textContent=this.score),i&&(i.textContent=`${this.totalPairs-this.pairsLeft}/${this.totalPairs} cặp (Còn ${this.pairsLeft} cặp)`),e&&(e.textContent=`MÀN ${this.currentLevel}/${this.totalLevels}`),s){const r=Math.floor((this.totalPairs-this.pairsLeft)*(this.currentLevelNewWordsCount/this.totalPairs)),p=Math.min(this.totalWordsCount,this.totalUniqueWordsCleared+r);s.textContent=`${p}/${this.totalWordsCount} từ`}if(n)if(this.playMode==="practice")n.textContent="♾️ Vô hạn";else{const r=Math.floor(this.timeLeft/60),p=this.timeLeft%60;n.textContent=`${String(r).padStart(2,"0")}:${String(p).padStart(2,"0")}`}a&&(a.textContent=`x${this.hintCount}`),l&&(l.textContent=`x${this.shuffleCount}`),c&&(c.textContent=`x${this.bombCount}`)}showToast(t){typeof window.showToast=="function"&&window.showToast(t)}togglePause(){this.isPaused=!this.isPaused;const t=this.container.querySelector("#mahjong-pause-btn");t&&(t.innerHTML=`<i class="fa-solid fa-${this.isPaused?"play":"pause"}"></i>`),this.showToast(this.isPaused?"Đã tạm dừng game ⏸":"Tiếp tục chơi ▶️")}gameOver(t){this.isRunning=!1,this.timerInterval&&clearInterval(this.timerInterval);const i=this.container.querySelector("#mahjong-modal-overlay"),n=this.container.querySelector("#mahjong-result-icon"),e=this.container.querySelector("#mahjong-result-title"),s=this.container.querySelector("#mahjong-result-desc"),a=this.container.querySelector("#mahjong-res-score"),l=this.container.querySelector("#mahjong-res-combo"),c=this.container.querySelector("#mahjong-res-pairs");if(i){i.style.setProperty("display","flex","important"),t?this.sfx&&this.sfx.playMatch&&this.sfx.playMatch():this.sfx&&this.sfx.playGameOver&&this.sfx.playGameOver(),n&&(n.textContent=t?"👑":"⏰"),e&&(e.textContent=t?"Đại Sư Mạt Chược - Hoàn Thành Xuất Sắc!":"Hết Giờ - Kết Thúc Lượt Chơi!"),s&&(s.textContent=t?`Bạn đã xuất sắc vượt qua toàn bộ ${this.totalLevels} Màn chơi và hoàn thành ${this.totalWordsCount}/${this.totalWordsCount} từ vựng!`:"Hãy tận dụng Kính Lúp và Gió Lốc để nối nhanh hơn nhé!"),a&&(a.textContent=this.score),l&&(l.textContent=this.maxCombo),c&&(c.textContent=`${this.totalWordsCount}/${this.totalWordsCount} từ (${this.currentLevel} Màn)`);const r=i.querySelector("#mahjong-words-summary-wrap");r&&this.renderWordSummaryList(r,this.rawWords,this.clearedWordsSet);const p=i.querySelector("#mahjong-modal-close-x"),h=i.querySelector("#mahjong-retry-btn"),o=i.querySelector("#mahjong-back-hub-btn"),d=i.querySelector("#mahjong-finish-btn");p&&(p.onclick=u=>{u.preventDefault(),u.stopPropagation(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),h&&(h.onclick=u=>{u.preventDefault(),u.stopPropagation(),this.restart()}),o&&(o.onclick=u=>{u.preventDefault(),u.stopPropagation(),this.stopAndExit()}),d&&(d.onclick=u=>{u.preventDefault(),u.stopPropagation(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()})}}renderWordSummaryList(t,i,n){if(!t)return;const e=i.length,s=i.filter(r=>n.has(r.word)).length,a=e-s;t.innerHTML=`
      <div class="game-results-word-summary">
        <div class="summary-tabs-header">
          <button type="button" class="summary-tab-btn active" data-tab="all">
            <i class="fa-solid fa-list-check"></i> Tất cả (${e})
          </button>
          <button type="button" class="summary-tab-btn correct-tab" data-tab="correct">
            <i class="fa-solid fa-circle-check"></i> Đúng (${s})
          </button>
          <button type="button" class="summary-tab-btn wrong-tab" data-tab="wrong">
            <i class="fa-solid fa-circle-xmark"></i> Sai / Cần ôn (${a})
          </button>
        </div>
        <div class="summary-words-list"></div>
      </div>
    `;const l=t.querySelector(".summary-words-list"),c=r=>{l.innerHTML="";const p=i.filter(h=>{const o=n.has(h.word);return r==="correct"?o:r==="wrong"?!o:!0});if(p.length===0){l.innerHTML='<div style="text-align: center; color: #94a3b8; padding: 20px; font-size: 0.85rem;">Không có từ vựng nào trong mục này.</div>';return}p.forEach(h=>{const o=n.has(h.word),d=document.createElement("div");d.className=`summary-word-card ${o?"is-correct":"is-wrong"}`,d.innerHTML=`
          <div class="sw-badge ${o?"badge-correct":"badge-wrong"}">
            <i class="fa-solid fa-${o?"check":"xmark"}"></i> ${o?"Đúng":"Sai"}
          </div>
          <div class="sw-main">
            <div class="sw-hanzi">${h.word}</div>
            <div class="sw-pinyin">${h.pinyin?`[ ${h.pinyin} ]`:""}</div>
            <div class="sw-meaning">${h.meaning||""}</div>
          </div>
          <button type="button" class="sw-speak-btn" title="Nghe phát âm">
            <i class="fa-solid fa-volume-high"></i>
          </button>
        `;const u=d.querySelector(".sw-speak-btn");u&&(u.onclick=f=>{f.stopPropagation(),this.speakWordInstant(h.word)}),l.appendChild(d)})};c("all"),t.querySelectorAll(".summary-tab-btn").forEach(r=>{r.addEventListener("click",p=>{p.preventDefault(),t.querySelectorAll(".summary-tab-btn").forEach(h=>h.classList.remove("active")),r.classList.add("active"),c(r.dataset.tab)})})}restart(){const t=this.container.querySelector("#mahjong-modal-overlay");t&&t.style.setProperty("display","none","important"),this.start()}stopAndExit(){if(this.grid&&typeof window.recordWordWrong=="function"){const i=new Map;for(let n=0;n<this.rows;n++)for(let e=0;e<this.cols;e++){const s=this.grid[n]?this.grid[n][e]:null;s&&s.word&&(!this.clearedWordsSet||!this.clearedWordsSet.has(s.word))&&i.set(s.word,s)}i.forEach(n=>{window.recordWordWrong({word:n.word,pinyin:n.pinyin,meaning:n.meaning})})}this.isRunning=!1,this.isStopping=!0,this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null);const t=this.container.querySelector("#mahjong-modal-overlay");t&&t.style.setProperty("display","none","important"),typeof this.onExit=="function"&&this.onExit()}}class B{constructor(t,i={}){this.container=t;const n=i.words||[];this.words=n.map(e=>{if(!e)return null;const s=(e.word||e.hanzi||e.text||"").trim(),a=(e.pinyin||"").trim(),l=(e.meaning||e.vietnamese||(Array.isArray(e.translations)?e.translations.join(", "):"")||"").trim();return{...e,id:e.id||e._id||s,_id:e._id,word:s,pinyin:a,meaning:l}}).filter(e=>e&&e.word&&(e.meaning||e.pinyin)),this.notebookTitle=i.title||"Sổ tay Từ Vựng",this.notebookDesc=i.desc||"Ôn tập tương tác trực tiếp",this.notebookKey=i.notebookKey||"",this.hskVersion=i.hskVersion||"3.0",this.currentUser=i.currentUser||null,this.onExit=i.onExit||(()=>{}),this.currentGameEngine=null,this.activeGameType=null,this.messageListener=null,this.render()}render(){this.container.innerHTML=`
      <div class="notebook-games-hub-wrapper">
        <!-- HUB TOP BAR -->
        <div class="games-hub-header">
          <div class="hub-header-left">
            <button type="button" id="games-hub-back-btn" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 8px; border-radius: 50px; font-weight: 700; padding: 8px 18px; cursor: pointer; z-index: 10;">
              <i class="fa-solid fa-arrow-left"></i> Quay Lại
            </button>
            <div>
              <h2 class="games-hub-title"><i class="fa-solid fa-gamepad" style="color: #f59e0b;"></i> Trò Chơi Ôn Tập Từ Vựng</h2>
              <p class="games-hub-sub">${this.notebookTitle} • ${this.words.length} từ vựng khả dụng • Ôn luyện tự do (Không tính xếp hạng)</p>
            </div>
          </div>

          <div class="hub-header-badge">
            <span class="beta-pill" style="background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.4); color: #fbbf24;"><i class="fa-solid fa-wand-magic-sparkles"></i> Đầy đủ 4 Trò Chơi Ôn Luyện (Miễn Phí)</span>
          </div>
        </div>

        <!-- MAIN HUB BODY -->
        <div id="games-hub-content" class="games-hub-content">
          ${this.renderSelectorCards()}
        </div>
      </div>
    `,this.bindHubEvents()}renderSelectorCards(){return`
      <div class="games-selector-container">
        <div class="games-selector-intro">
          <h3>Chọn trò chơi để bắt đầu ôn luyện từ vựng</h3>
          <p>Học tập và rèn luyện phản xạ nhẹ nhàng từ <strong>${this.notebookTitle}</strong>, không tính điểm xếp hạng hay khóa cấp!</p>
        </div>

        <div class="games-selector-grid-6">
          <!-- CARD GAME BOBA: TIỆM TRÀ SỮA CỦA TÔI -->
          <div class="game-choice-card card-boba" id="btn-choose-boba" style="cursor: pointer; border: 2px solid #fda4af;">
            <div class="card-tag" style="background: linear-gradient(135deg, #f43f5e, #e11d48); color: #ffffff;">🧋 MỚI RA MẮT • 📱 MÔ PHỎNG PHA CHẾ ANIME 1:1</div>
            <div class="card-icon-hero">🧋 🌸</div>
            <h3 class="card-title" style="color: #f43f5e;">Tiệm Trà Sữa Của Tôi</h3>
            <p class="card-desc">
              Trở thành Barista tiệm trà sữa Anime! Đọc/nghe khách gọi món bằng tiếng Trung, rót trà, múc 6 loại topping, chọn đường đá và hoàn thành đơn hàng nhận tiền vàng & kinh nghiệm!
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-mug-hot"></i> 5 Trạm pha chế</span>
              <span><i class="fa-solid fa-headphones"></i> Phát âm tiếng Trung</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #f43f5e, #e11d48); color: #ffffff;">
              Vào Tiệm Trà Sữa <i class="fa-solid fa-play"></i>
            </button>
          </div>

          <!-- CARD GAME GROCERY: TIỆM TẠP HÓA CỦA TÔI -->
          <div class="game-choice-card card-grocery" id="btn-choose-grocery" style="cursor: pointer; border: 2px solid #fdba74;">
            <div class="card-tag" style="background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff;">🏪 MỚI RA MẮT • 💴 MÔ PHỎNG TẠP HÓA 3 CỘT & TÍNH TIỀN THỐI</div>
            <div class="card-icon-hero">🏪 🥢</div>
            <h3 class="card-title" style="color: #ea580c;">Tiệm Tạp Hóa Của Tôi</h3>
            <p class="card-desc">
              Kinh doanh tiệm tạp hóa Trung Hoa tuổi thơ! Dùng vốn nhập hàng, bày 5 gian hàng, đón khách mua sắm, nhặt đồ vào giỏ và tính tiền thối bằng tiền RMB cực thú vị!
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-store"></i> 3 Cột: Kệ • Giỏ • Thu ngân</span>
              <span><i class="fa-solid fa-coins"></i> Tính tiền thối RMB</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff;">
              Vào Tiệm Tạp Hóa <i class="fa-solid fa-play"></i>
            </button>
          </div>

          <!-- CARD GAME 0: QUIZ GAME (UNLOCKED ALL) -->
          <div class="game-choice-card card-quiz-highlight" id="btn-choose-quiz" style="cursor: pointer;">
            <div class="card-tag">⭐ GAME ĐỀ XUẤT • 📱 CHƠI MƯỢT MỌI THIẾT BỊ (ĐT / IPAD / PC)</div>
            <div class="card-icon-hero">🎮 ⚡</div>
            <h3 class="card-title">Đấu Trường Quiz Game</h3>
            <p class="card-desc">
              Trò chơi trắc nghiệm 4 đáp án kiểu Quizizz kinh điển! Ôn tập nhận diện chữ Hán, Pinyin, nghĩa tiếng Việt và phản xạ nghe âm thanh với chuỗi Combo nhân điểm!
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-brain"></i> 4 Lựa chọn nhanh</span>
              <span><i class="fa-solid fa-mobile-screen"></i> Cảm ứng chạm 1 chạm</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff;">
              Chơi Quiz Game <i class="fa-solid fa-play"></i>
            </button>
          </div>

          <!-- CARD GAME 1: MAHJONG -->
          <div class="game-choice-card card-mahjong" id="btn-choose-mahjong" style="cursor: pointer;">
            <div class="card-tag">🀄 PHẢN XẠ NỐI CẶP • 📱 CHẠM CẢM ỨNG SIÊU MƯỢT</div>
            <div class="card-icon-hero">🀄 🔍</div>
            <h3 class="card-title">Mạt Chược Nối Từ</h3>
            <p class="card-desc">
              Tìm và chạm nối các cặp quân bài mạt chược tương ứng (<strong>Chữ Hán ↔ Pinyin ↔ Nghĩa</strong>) theo quy tắc đường gấp khúc tối đa 3 đoạn thẳng!
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-link"></i> Nối đường gấp khúc</span>
              <span><i class="fa-solid fa-shuffle"></i> Gió lốc & Bom hỗ trợ</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #d97706, #b45309); color: #ffffff;">
              Chơi Mạt Chược <i class="fa-solid fa-play"></i>
            </button>
          </div>

          <!-- CARD GAME 2: SNAKE -->
          <div class="game-choice-card card-snake" id="btn-choose-snake" style="cursor: pointer;">
            <div class="card-tag">🐍 NHẬN DIỆN MẶT CHỮ • 📱 VUỐT CẢM ỨNG & ⌨️ PHÍM MŨI TÊN</div>
            <div class="card-icon-hero">🐍 🍏</div>
            <h3 class="card-title">Nuôi Rắn Từ Vựng</h3>
            <p class="card-desc">
              Quan sát chữ Hán đề bài ở trên, điều khiển chú rắn ăn quả táo mang <strong>nghĩa Tiếng Việt chính xác</strong>. Tích đủ <strong>10 chuỗi ngọc</strong> để lên cấp!
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-book-open"></i> Nhớ nghĩa tiếng Việt</span>
              <span><i class="fa-solid fa-layer-group"></i> 5 Cấp độ thử thách</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #059669, #047857); color: #ffffff;">
              Chơi Nuôi Rắn <i class="fa-solid fa-play"></i>
            </button>
          </div>

          <!-- CARD GAME 3: PHI DAO (CANNON) -->
          <div class="game-choice-card card-cannon" id="btn-choose-cannon" style="cursor: pointer;">
            <div class="card-tag">🗡️ PHI ĐAO LUYỆN CHỮ • ⌨️ DÀNH CHO MÁY TÍNH (CẦN BÀN PHÍM)</div>
            <div class="card-icon-hero">🗡️ 🥷</div>
            <h3 class="card-title">Phi Đao Luyện Chữ</h3>
            <p class="card-desc">
              Từ vựng rơi từ trời đêm! Nhanh tay gõ <strong>Pinyin (không dấu)</strong> trên bàn phím máy tính để ninja phóng phi đao bắn nổ chữ Hán.
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-keyboard"></i> Cần bàn phím máy tính gõ Pinyin</span>
              <span><i class="fa-solid fa-music"></i> Nhạc nền Lo-fi thư giãn</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: #ffffff;">
              Chơi Phi Đao <i class="fa-solid fa-play"></i>
            </button>
          </div>
        </div>
      </div>
    `}bindHubEvents(){const t=this.container.querySelector("#games-hub-back-btn");t&&t.addEventListener("click",a=>{a.preventDefault(),this.exitHub()});const i=this.container.querySelector("#btn-choose-boba");i&&i.addEventListener("click",a=>{a.preventDefault(),window.location.href="/boba-game.html"});const n=this.container.querySelector("#btn-choose-grocery");n&&n.addEventListener("click",a=>{a.preventDefault(),window.location.href="/grocery-game.html"});const e=this.container.querySelector("#btn-choose-quiz");e&&e.addEventListener("click",a=>{a.preventDefault(),this.launchGame("quiz")}),[{id:"#btn-choose-cannon",type:"cannon"},{id:"#btn-choose-snake",type:"snake"},{id:"#btn-choose-mahjong",type:"mahjong"}].forEach(a=>{const l=this.container.querySelector(a.id);l&&l.addEventListener("click",c=>{c.preventDefault(),this.launchGame(a.type)})})}launchGame(t){if(!(typeof window.isUserLoggedIn=="function"?window.isUserLoggedIn():this.currentUser&&this.currentUser.email)){typeof window.openLoginPrompt=="function"?window.openLoginPrompt("chơi Đấu Trường Game",()=>this.launchGame(t)):typeof window.openAuthRequiredModal=="function"&&window.openAuthRequiredModal();return}if(this.words.length<2){typeof window.showToast=="function"&&window.showToast("Cần ít nhất 2 từ vựng trong sổ tay này để chơi game!",!0);return}const n=this.container.querySelector("#games-hub-content");if(!n)return;if(this.activeGameType=t,t==="quiz"){try{Array.isArray(this.words)&&this.words.length>0&&(sessionStorage.setItem("notebook_quiz_custom_words",JSON.stringify(this.words)),sessionStorage.setItem("notebook_quiz_custom_title",this.title||"Ôn Tập Sổ Tay"))}catch{}const a=new URLSearchParams;a.set("source","notebook"),a.set("no_score","true"),this.notebookKey&&(a.set("notebook",this.notebookKey),this.notebookKey.startsWith("hsk:")?a.set("level",this.notebookKey.replace("hsk:","")):this.notebookKey.startsWith("yct:")?a.set("level","yct"+this.notebookKey.replace("yct:","")):isNaN(this.notebookKey)||a.set("level",this.notebookKey)),this.hskVersion&&a.set("version",this.hskVersion),n.innerHTML=`
        <div class="embedded-quiz-wrapper" style="width: 100%; display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 14px; padding: 8px 16px;">
            <button type="button" id="btn-quiz-return-hub" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: 6px; border-radius: 50px; font-weight: 700; cursor: pointer;">
              <i class="fa-solid fa-arrow-left"></i> Đổi Trò Chơi
            </button>
            <div style="font-size: 0.9rem; font-weight: 800; color: #fbbf24; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-gamepad" style="color: #6366f1;"></i> ${this.title?`Quiz Game: ${this.title}`:"Đấu Trường Quiz Game (Ôn Tập Sổ Tay)"}
            </div>
            <button type="button" id="btn-quiz-exit-all" class="btn btn-outline btn-sm" style="border-radius: 50px; font-weight: 700; cursor: pointer;">
              <i class="fa-solid fa-book-bookmark"></i> Sổ Tay
            </button>
          </div>
          <iframe id="notebook-quiz-iframe" src="/quiz-game.html?${a.toString()}" style="width: 100%; height: clamp(700px, 86vh, 860px); min-height: 700px; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 18px; background: #0f172a;" frameborder="0" allow="autoplay"></iframe>
        </div>
      `;const l=n.querySelector("#btn-quiz-return-hub");l&&(l.onclick=r=>{r.preventDefault(),this.returnToSelector()});const c=n.querySelector("#btn-quiz-exit-all");c&&(c.onclick=r=>{r.preventDefault(),this.exitHub()}),this.messageListener||(this.messageListener=r=>{r.data&&(r.data.type==="CLOSE_GAME_IFRAME"||r.data.type==="EXIT_GAME")&&this.returnToSelector()},window.addEventListener("message",this.messageListener));return}n.innerHTML='<div id="game-active-viewport" class="game-active-viewport"></div>';const e=n.querySelector("#game-active-viewport"),s=()=>this.returnToSelector();t==="cannon"?this.currentGameEngine=new N(e,this.words,s):t==="snake"?this.currentGameEngine=new W(e,this.words,s):t==="mahjong"&&(this.currentGameEngine=new $(e,this.words,s)),this.currentGameEngine&&this.currentGameEngine.start&&this.currentGameEngine.start()}returnToSelector(){const t=this.currentGameEngine;if(this.currentGameEngine=null,this.activeGameType=null,t&&t.stopAndExit)try{t.stopAndExit()}catch(i){console.warn("Error stopping engine on returnToSelector:",i)}this.messageListener&&(window.removeEventListener("message",this.messageListener),this.messageListener=null),this.render()}exitHub(){const t=this.currentGameEngine;if(this.currentGameEngine=null,this.activeGameType=null,t&&t.stopAndExit)try{t.stopAndExit()}catch(i){console.warn("Error stopping engine on exitHub:",i)}if(this.messageListener&&(window.removeEventListener("message",this.messageListener),this.messageListener=null),this.onExit)try{this.onExit()}catch(i){console.warn("Error calling onExit:",i)}typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}}export{B as N};
