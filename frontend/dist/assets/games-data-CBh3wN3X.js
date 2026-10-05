function S(y){return y?y.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ü/g,"v").replace(/[^a-z0-9]/g,"").trim():""}class W{constructor(){this.ctx=null,this.isPlaying=!1,this.masterGain=null,this.noteTimeout=null,this.droneNodes=[],this.noteIdx=0,this.patternIdx=0}init(){if(this.ctx)return;const t=window.AudioContext||window.webkitAudioContext;t&&(this.ctx=new t,this.masterGain=this.ctx.createGain(),this.masterGain.gain.setValueAtTime(0,this.ctx.currentTime),this.masterGain.connect(this.ctx.destination))}playNote(t,e=1.2,n=.08,i="sine"){if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();try{const s=this.ctx.createOscillator(),a=this.ctx.createGain();s.type=i,s.frequency.setValueAtTime(t,this.ctx.currentTime),a.gain.setValueAtTime(0,this.ctx.currentTime),a.gain.linearRampToValueAtTime(n,this.ctx.currentTime+.1),a.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+e),s.connect(a),a.connect(this.masterGain),s.start(),s.stop(this.ctx.currentTime+e+.05)}catch{}}}startDrone(){}stopDrone(){this.droneNodes.forEach(({osc:t,gain:e})=>{try{e.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+.5),t.stop(this.ctx.currentTime+.55)}catch{}}),this.droneNodes=[]}start(){if(this.init(),!this.ctx||this.isPlaying)return;this.isPlaying=!0,this.ctx.state==="suspended"&&this.ctx.resume(),this.masterGain.gain.linearRampToValueAtTime(1,this.ctx.currentTime+2);const t=[[392,440,523,392,329,261,293,261],[261,329,392,440,392,329,261,220],[523,440,392,329,261,293,329,392],[440,392,329,261,293,329,392,440]],e=()=>{if(!this.isPlaying||!this.ctx)return;const n=t[this.patternIdx%t.length],i=n[this.noteIdx%n.length],s=1.6+Math.random()*.8,a=.045+Math.random()*.025;this.playNote(i,s,a,"sine"),Math.random()<.3&&setTimeout(()=>{this.isPlaying&&this.playNote(i*2,s*.7,a*.4,"sine")},300),this.noteIdx++,this.noteIdx%n.length===0&&this.patternIdx++,this.noteTimeout=setTimeout(e,900+Math.random()*600)};setTimeout(e,800)}stop(){if(this.isPlaying=!1,this.noteTimeout&&(clearTimeout(this.noteTimeout),this.noteTimeout=null),this.ctx&&this.masterGain)try{this.masterGain.gain.linearRampToValueAtTime(.001,this.ctx.currentTime+1)}catch{}this.stopDrone()}playSFX(t,e,n="sine",i=60){this.ctx&&(this.ctx.state==="suspended"&&this.ctx.resume(),t.forEach((s,a)=>setTimeout(()=>{this.ctx&&this.playNote(s,.25,e[a]||.1,n)},a*i)))}playHit(){this.playSFX([880,1108],[.15,.1],"triangle",60)}playMiss(){this.playNote(180,.3,.12,"sawtooth")}playStreak(){this.playSFX([523,659,784,1047],[.12,.12,.12,.12],"sine",60)}playHeartRestore(){this.playSFX([523,659,784,1047,1319],[.1,.1,.1,.1,.1],"sine",80)}playGameOver(){this.playSFX([440,370,330,261],[.15,.15,.15,.15],"sawtooth",150)}playVictory(){this.playSFX([523,659,784,1047,1319,1568],[.12,.12,.12,.12,.12,.12],"sine",100)}}class D{constructor(t,e,n){this.container=t;const i=e&&e.length>0?e:[{word:"老师",pinyin:"laoshi",meaning:"giáo viên"},{word:"学生",pinyin:"xuesheng",meaning:"học sinh"},{word:"学校",pinyin:"xuexiao",meaning:"trường học"},{word:"电脑",pinyin:"diannao",meaning:"máy tính"},{word:"苹果",pinyin:"pingguo",meaning:"quả táo"},{word:"香蕉",pinyin:"xiangjiao",meaning:"quả chuối"}];this.rawWords=i.map(s=>({...s,id:s.id||s._id||s.word||s.char||s.hanzi,word:s.word||s.char||s.hanzi||"",pinyin:s.pinyin||"",meaning:s.meaning||s.vn||s.trans||""})).filter(s=>s.word&&s.pinyin),this.rawWords.length===0&&(this.rawWords=[{word:"老师",pinyin:"laoshi",meaning:"giáo viên"},{word:"学生",pinyin:"xuesheng",meaning:"học sinh"}]),this.displayMode="both",this.playMode=localStorage.getItem("cannon_play_mode")||"practice",this.onExit=n,this.music=new W,this.score=0,this.combo=0,this.maxCombo=0,this.lives=3,this.maxLives=3,this.isRunning=!1,this.isPaused=!1,this.lastFrameTime=0,this.spawnTimer=0,this.wordQueue=[],this.activeWords=[],this.correctWordsSet=new Set,this.wordsDestroyedCount=0,this.typedBuffer="",this.lockedTarget=null,this.wrongStreak=0,this.slowMoTimer=0,this.score2xTimer=0,this.shieldActive=!1,this.shieldTimer=0,this.timerInterval=null,this.animFrameId=null,this.keyHandler=null,this.renderLayout(),this.bindEvents()}renderLayout(){this.container.innerHTML=`
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
</div>`,this._genStars(),this._genSakura()}_genStars(){const t=this.container.querySelector("#phidao-stars");if(t)for(let e=0;e<75;e++){const n=document.createElement("div");n.className="phidao-star";const i=1+Math.random()*2.2;n.style.cssText=`width:${i}px;height:${i}px;left:${Math.random()*100}%;top:${5+Math.random()*65}%;--dur:${2+Math.random()*4}s;--delay:${Math.random()*4}s;`,t.appendChild(n)}}_genSakura(){const t=this.container.querySelector("#phidao-sakura");if(!t)return;const e=["🌸","🌺","✿"];for(let n=0;n<10;n++){const i=document.createElement("div");i.className="phidao-sakura-p",i.textContent=e[n%3],i.style.cssText=`left:${Math.random()*100}%;top:-20px;--dur:${7+Math.random()*8}s;--delay:${Math.random()*10}s;`,t.appendChild(i)}}bindEvents(){const t=i=>this.container.querySelector(i);t("#cannon-top-back-btn")&&t("#cannon-top-back-btn").addEventListener("click",i=>{i.preventDefault(),this.stopAndExit()}),t("#cannon-pause-btn")&&t("#cannon-pause-btn").addEventListener("click",i=>{i.preventDefault(),this.togglePause()}),t("#cannon-pause-close-x")&&t("#cannon-pause-close-x").addEventListener("click",i=>{i.preventDefault(),this.togglePause(!1)}),t("#cannon-pause-resume-btn")&&t("#cannon-pause-resume-btn").addEventListener("click",i=>{i.preventDefault(),this.togglePause(!1)}),t("#cannon-pause-restart-btn")&&t("#cannon-pause-restart-btn").addEventListener("click",i=>{i.preventDefault(),this.togglePause(!1),this.restart()}),t("#cannon-pause-exit-btn")&&t("#cannon-pause-exit-btn").addEventListener("click",i=>{i.preventDefault(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),t("#cannon-exit-btn")&&t("#cannon-exit-btn").addEventListener("click",i=>{i.preventDefault(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),t("#cannon-retry-btn")&&t("#cannon-retry-btn").addEventListener("click",i=>{i.preventDefault(),this.restart()}),t("#cannon-back-hub-btn")&&t("#cannon-back-hub-btn").addEventListener("click",i=>{i.preventDefault(),this.stopAndExit()}),t("#cannon-finish-btn")&&t("#cannon-finish-btn").addEventListener("click",i=>{i.preventDefault(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),t("#cannon-playmode-toggle-btn")&&t("#cannon-playmode-toggle-btn").addEventListener("click",i=>{i.preventDefault(),this.playMode=this.playMode==="practice"?"challenge":"practice",localStorage.setItem("cannon_play_mode",this.playMode);const s=this.container.querySelector("#cannon-mode-icon-text");s&&(s.innerHTML=this.playMode==="practice"?'<i class="fa-solid fa-infinity" style="color: #10b981;"></i> <span style="font-size: 0.8rem; color:#10b981; margin-left: 4px;">Kiểm tra</span>':'<i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span style="font-size: 0.8rem; color:#fbbf24; margin-left: 4px;">Thi đấu</span>'),this.updateHUD(),this.showToast(this.playMode==="practice"?"🎯 Chế độ Kiểm tra (♾️ Không tính tim)":"🏆 Chế độ Thi đấu (❤️❤️❤️ 3 Tim)")}),this.container.querySelectorAll(".phidao-mode-pill").forEach(i=>{i.addEventListener("click",s=>{s.preventDefault();const a=i.getAttribute("data-mode")||"both";this.displayMode=a,this.container.querySelectorAll(".phidao-mode-pill").forEach(o=>o.classList.toggle("active",o===i)),this.highlightTargets(),this.focusInput(),this.showToast(`Chế độ: ${i.textContent.trim()}`)})}),this.container.querySelectorAll(".phidao-skill-btn").forEach(i=>{i.addEventListener("click",s=>{s.preventDefault();const a={"skill-ice":"ice","skill-heal":"heal","skill-x2":"x2","skill-shield":"shield"};a[i.id]&&this.activateSkill(a[i.id])})});const e=this.container.querySelector("#phidao-real-input");e&&(e.addEventListener("input",i=>{this.processInputBuffer(i.target.value)}),e.addEventListener("compositionend",i=>{this.processInputBuffer(i.target.value)}),e.addEventListener("keydown",i=>{i.key==="Escape"?(i.preventDefault(),this.togglePause()):i.key==="Enter"&&(i.preventDefault(),e.value.trim()&&this.processInputBuffer(e.value.trim()))}));const n=this.container.querySelector("#cannon-playfield");n&&n.addEventListener("click",()=>{this.focusInput()}),this.keyHandler=i=>{if(!this.isRunning)return;const s=this.container.querySelector("#cannon-modal-overlay");if(s&&s.style.display!=="none")return;if(i.key==="Escape"){i.preventDefault(),i.stopPropagation(),this.togglePause();return}if(this.isPaused){(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),i.stopPropagation(),this.togglePause(!1));return}if(i.altKey){const o={1:"ice",2:"heal",3:"x2",4:"shield"};if(o[i.key]){i.preventDefault(),i.stopPropagation(),this.activateSkill(o[i.key]);return}}const a=this.container.querySelector("#phidao-real-input");a&&document.activeElement!==a&&!i.ctrlKey&&!i.altKey&&!i.metaKey&&a.focus()},window.addEventListener("keydown",this.keyHandler,!0)}focusInput(){setTimeout(()=>{const t=this.container.querySelector("#phidao-real-input");t&&this.isRunning&&!this.isPaused&&t.focus()},40)}processInputBuffer(t){if(!this.isRunning||this.isPaused)return;const e=(t||"").trim();if(this.typedBuffer=e,!e){this.lockedTarget=null,this.wrongStreak=0,this.updateTypedDisplay(),this.highlightTargets();return}const n=S(e),i=e.replace(/\s+/g,""),s=[...this.activeWords].filter(c=>!c.isDestroyed).sort((c,r)=>r.y-c.y);let a=s.find(c=>{const r=(c.wordObj.word||c.wordObj.char||c.wordObj.hanzi||"").trim();return i===r||i.endsWith(r)});if(!a&&n&&(a=s.find(c=>{const r=S(c.wordObj.pinyin);return n===r||n.endsWith(r)})),a){const c=a;this.typedBuffer="";const r=this.container.querySelector("#phidao-real-input");r&&(r.value=""),this.lockedTarget=null,this.wrongStreak=0,this.updateTypedDisplay(),this.highlightTargets(),this.fireDagger(c);return}let o=null;if(this.lockedTarget&&!this.lockedTarget.isDestroyed){const c=(this.lockedTarget.wordObj.word||this.lockedTarget.wordObj.char||"").trim(),r=S(this.lockedTarget.wordObj.pinyin);(c.startsWith(i)||n&&r.startsWith(n))&&(o=this.lockedTarget)}if(o||(o=s.find(c=>{const r=(c.wordObj.word||c.wordObj.char||"").trim(),u=S(c.wordObj.pinyin);return r.startsWith(i)||n&&u.startsWith(n)})),o)this.lockedTarget=o,this.wrongStreak=0;else if(this.lockedTarget=null,this.wrongStreak++,this.music.playMiss(),this.shakeTypedBuf(),this.wrongStreak>=5){const c=this.container.querySelector("#phidao-real-input");c&&(c.value=""),this.handleFiveMissPenalty();return}this.updateTypedDisplay(),this.highlightTargets()}processTypedChar(t){const e=this.container.querySelector("#phidao-real-input"),i=(e?e.value:this.typedBuffer)+t;e&&(e.value=i),this.processInputBuffer(i)}handleFiveMissPenalty(){this.wrongStreak=0,this.typedBuffer="";const t=this.container.querySelector("#phidao-real-input");if(t&&(t.value=""),this.lockedTarget=null,this.combo=0,this.activeWords.length===0){this.updateHUD(),this.updateTypedDisplay(),this.highlightTargets();return}const e=[...this.activeWords].filter(a=>!a.isDestroyed).sort((a,o)=>o.y-a.y);if(e.length===0)return;const n=e[0],i=this.activeWords.findIndex(a=>a.id===n.id);i!==-1&&this.activeWords.splice(i,1),n.el&&n.el.parentNode&&n.el.parentNode.removeChild(n.el),this.showMissFlash(),this.music.playMiss();const s=n.wordObj.word||n.wordObj.char||"";if(this.showFloatingText(n.x,Math.max(70,n.y),`💥 Sai 5 lần! Rớt từ: ${s}`,"#ef4444"),this.playMode!=="practice"){if(this.shieldActive)this.shieldActive=!1,this.shieldTimer=0,this.showFloatingText(n.x,Math.max(70,n.y-20),"🛡️ Lá Chắn Chặn!","#38bdf8");else if(this.lives--,this.lives<=0){this.updateHUD(),this.gameOver(!1);return}}this.updateHUD(),this.updateTypedDisplay(),this.highlightTargets(),this.wordQueue.length===0&&this.activeWords.length===0&&setTimeout(()=>this.gameOver(!0),500)}shakeTypedBuf(){const t=this.container.querySelector("#phidao-typed-buf");t&&(t.classList.add("buf-wrong-shake"),setTimeout(()=>t.classList.remove("buf-wrong-shake"),300))}updateTypedDisplay(){const t=this.container.querySelector("#phidao-typed-buf"),e=this.container.querySelector("#phidao-target-hint"),n=this.container.querySelector("#phidao-real-input"),i=this.typedBuffer;if(t&&(t.className=`phidao-typed-buf${this.lockedTarget?" has-match":""}`),n&&n.value!==i&&(n.value=i),e)if(this.wrongStreak>0)e.innerHTML=`<span style="color:#ef4444;font-weight:800;font-size:0.8rem;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.5);border-radius:12px;padding:2px 10px;display:inline-block;animation:bufShake .2s ease;">⚠️ Bấm sai: ${this.wrongStreak}/5</span>`;else if(this.lockedTarget&&!this.lockedTarget.isDestroyed){const s=this.lockedTarget.wordObj.word||"",a=this.lockedTarget.wordObj.pinyin||"",o=this.lockedTarget.wordObj.meaning||"";e.innerHTML=`<span style="color:#fde047;font-weight:800;font-size:0.85rem;background:rgba(15,23,42,0.9);border:1px solid rgba(251,191,36,0.5);border-radius:12px;padding:3px 14px;display:inline-flex;align-items:center;gap:6px;box-shadow:0 2px 10px rgba(0,0,0,0.4);">🎯 Mục tiêu: <strong style="font-size:1.05rem;color:#ffffff;">${s}</strong> <span style="color:#38bdf8;font-weight:700;">[${a}]</span> ${o?`<span style="color:#34d399;font-weight:700;">• ${o}</span>`:""}</span>`}else e.textContent=""}highlightTargets(){this.activeWords.forEach(t=>{if(!t.el||t.isDestroyed)return;const e=this.lockedTarget&&t.id===this.lockedTarget.id;t.el.classList.toggle("is-targeted",e);const n=t.el.querySelector(".pinyin-prog");if(n){const i=t.wordObj.pinyin||"";this.displayMode==="listen"||this.displayMode==="hanzi"||this.displayMode==="pinyin"||this.displayMode==="meaning"?n.style.display="none":(n.style.display="flex",n.innerHTML=`<span class="word-py-tone-tag" style="color:#0284c7;font-weight:800;font-size:0.95rem;">${i}</span>`)}})}fireDagger(t){if(!t||t.isDestroyed)return;t.isDestroyed=!0,t.isTargeted=!1;const e=this.container.querySelector("#phidao-character");e&&(e.classList.remove("throw-anim"),e.offsetWidth,e.classList.add("throw-anim"),setTimeout(()=>e&&e.classList.remove("throw-anim"),300)),this.music.playHit();const n=this.container.querySelector("#cannon-fx-layer"),i=this.container.querySelector("#cannon-playfield");if(!n||!i){this.handleHitWord(t);return}const s=i.clientWidth,a=i.clientHeight,o=s/2,c=a-48,r=t.x+40,u=t.y+30,d=document.createElement("div");d.className="phidao-dagger",d.textContent="🗡️",d.style.left=`${o}px`,d.style.top=`${c}px`;const l=r-o,h=u-c,p=Math.atan2(h,l)*180/Math.PI-45;d.style.transform=`rotate(${p}deg)`,n.appendChild(d);const f=Math.sqrt(l*l+h*h),m=Math.max(100,Math.min(300,f*.55)),b=performance.now(),v=M=>{const x=Math.min(1,(M-b)/m),w=x<.5?2*x*x:-1+(4-2*x)*x;d.style.left=`${o+l*w}px`,d.style.top=`${c+h*w}px`,x<1?requestAnimationFrame(v):(d.remove(),this.handleHitWord(t))};requestAnimationFrame(v)}handleHitWord(t){const e=this.activeWords.findIndex(r=>r.id===t.id);if(e===-1)return;const n=t.type==="star",i=this.score2xTimer>0?2:1,s=S(t.wordObj.pinyin).length,a=Math.round((n?75+s*30:s*15)*i);this.score+=a,this.combo++,this.wordsDestroyedCount++,this.combo>this.maxCombo&&(this.maxCombo=this.combo);const o=t.wordObj.word||t.wordObj.char||"";o&&this.correctWordsSet.add(o),typeof window.recordWordMemorized=="function"&&window.recordWordMemorized(t.wordObj),this.showHitMeaningPopup(t.x,t.y,t.wordObj,a,n),o&&this.speakWordInstant(o),this.combo>0&&this.combo%10===0&&(this.lives<this.maxLives?(this.lives++,this.music.playHeartRestore(),this.showFloatingText(t.x,t.y-36,`💖 Chuỗi ${this.combo}! +1 Tim!`,"#ef4444")):(this.music.playStreak(),this.showFloatingText(t.x,t.y-36,`🔥 Chuỗi ${this.combo}! Thần Kỳ!`,"#f97316")));const c=this.container.querySelector("#cannon-fx-layer");if(c){const r=document.createElement("div");r.className=`phidao-explosion type-${t.type}`,r.style.left=`${t.x+15}px`,r.style.top=`${t.y+10}px`,c.appendChild(r),setTimeout(()=>r.remove(),450)}t.el&&t.el.parentNode&&t.el.parentNode.removeChild(t.el),this.activeWords.splice(e,1),this.lockedTarget&&this.lockedTarget.id===t.id&&(this.lockedTarget=null,this.typedBuffer="",this.updateTypedDisplay(),this.highlightTargets()),this.updateHUD(),this.wordQueue.length===0&&this.activeWords.length===0&&setTimeout(()=>this.gameOver(!0),500)}speakWordInstant(t){if(t){if("speechSynthesis"in window)try{window.speechSynthesis.cancel();const e=new SpeechSynthesisUtterance(t);e.lang="zh-CN",e.rate=1.05,e.pitch=1;const i=window.speechSynthesis.getVoices().find(s=>s.lang==="zh-CN"||s.lang==="zh"||s.lang.startsWith("zh"));i&&(e.voice=i),window.speechSynthesis.speak(e);return}catch{}if(typeof window.speakText=="function")try{window.speakText(t)}catch{}}}showHitMeaningPopup(t,e,n,i,s){const a=this.container.querySelector("#cannon-fx-layer");if(!a)return;const o=document.createElement("div");o.className="phidao-hit-meaning-card";const c=n.word||n.char||"",r=n.pinyin||"",u=n.meaning||"";o.innerHTML=`
      <div style="font-size: 0.95rem; font-weight: 900; color: #fbbf24; display: flex; align-items: center; justify-content: center; gap: 4px;">
        <span>+${i}</span>
        <span style="font-family: var(--font-hanzi); font-size: 1.15rem; color: #ffffff;">${c}</span>
        <span style="font-size: 0.85rem; color: #38bdf8; font-weight: 700;">[${r}]</span>
      </div>
      <div style="font-size: 0.88rem; font-weight: 800; color: #f1f5f9; text-shadow: 0 1px 3px #000; margin-top: 1px;">
        ${u?`💡 ${u}`:""}
      </div>
    `,o.style.left=`${Math.max(10,Math.min(window.innerWidth-220,t-20))}px`,o.style.top=`${Math.max(10,e-10)}px`,a.appendChild(o),setTimeout(()=>o.remove(),2200)}spawnWord(){const t=this.wordsDestroyedCount>=4?3:2;if(this.activeWords.length>=t)return;if(!this.wordQueue||this.wordQueue.length===0){this.activeWords.length===0&&this.gameOver(!0);return}if(this.activeWords.some(L=>L.y<80))return;const e=this.container.querySelector("#cannon-playfield");if(!e)return;const n=e.clientWidth||600,i=this.wordQueue.pop();if(!i)return;const s=Math.random()<.15,a=this.container.querySelector(".phidao-floating-skills"),o=a?a.offsetWidth+25:110,c=160,r=25,u=Math.max(r+50,n-o-c),l=(u-r)/3,h=[{minX:r,maxX:r+l-10},{minX:r+l+5,maxX:r+l*2-5},{minX:r+l*2+10,maxX:u}],p=[0,0,0];this.activeWords.forEach(L=>{h.forEach((k,A)=>{L.x>=k.minX-35&&L.x<=k.maxX+35&&p[A]++})});let f=0,m=999;h.forEach((L,k)=>{p[k]<m&&(m=p[k],f=k)});const b=h[f];let v=b.minX+Math.random()*Math.max(10,b.maxX-b.minX);v=Math.max(r,Math.min(u,Math.round(v)));const M=-25,x=11+Math.min(4,Math.floor(this.wordsDestroyedCount/10)),w=document.createElement("div");w.className=`phidao-word-card type-${s?"star":"normal"}`;const C=i.word||i.char||i.hanzi||"",H=i.pinyin||"";S(H);const g=i.meaning||i.vn||i.trans||"";let T="";this.displayMode==="meaning"?T=`
        <div class="word-meaning-main">${s?"✨ ":""}${g||C}</div>
        <div class="word-sub-hint" style="font-size:0.75rem; color:#64748b; font-weight:700; margin-top:2px;">(Gõ Hán hoặc Pinyin)</div>
        <div class="pinyin-prog" style="display:none;"></div>
      `:this.displayMode==="hanzi"?T=`
        <div class="word-zh">${s?"✨ ":""}${C}</div>
        ${g?`<div class="word-meaning-sub" title="${g}">${g}</div>`:""}
        <div class="pinyin-prog" style="display:none;"></div>
      `:this.displayMode==="pinyin"?T=`
        <div class="word-zh" style="font-size:1.5rem;color:#0284c7 !important;">${s?"✨ ":""}${H}</div>
        ${g?`<div class="word-meaning-sub" title="${g}">${g}</div>`:""}
        <div class="pinyin-prog" style="display:none;"></div>
      `:this.displayMode==="listen"?(T=`
        <div class="word-zh" style="font-size:1.8rem;color:#0284c7 !important;">🎧 ❓</div>
        ${g?`<div class="word-meaning-sub" title="${g}">${g}</div>`:""}
        <div class="pinyin-prog" style="display:none;"></div>
      `,this.autoSpeech&&C&&this.speakWordInstant(C)):T=`
        <div class="word-zh">${s?"✨ ":""}${C}</div>
        <div class="pinyin-prog"><span class="word-py-tone-tag" style="color:#0284c7;font-weight:800;font-size:0.95rem;">${H}</span></div>
        ${g?`<div class="word-meaning-sub" title="${g}">${g}</div>`:""}
      `,w.innerHTML=T;const N={id:`${Date.now()}_${Math.random()}`,wordObj:i,type:s?"star":"normal",x:v,y:M,speed:x,el:w,isDestroyed:!1,isTargeted:!1},P=this.container.querySelector("#cannon-words-layer");P&&(P.appendChild(w),this.activeWords.push(N),w.style.transform=`translate3d(${v}px,${M}px,0)`)}loop(t){if(this.isRunning){if(this.isPaused)this.lastFrameTime=t;else{const e=Math.min(.05,(t-this.lastFrameTime)/1e3);this.lastFrameTime=t,this.spawnTimer+=e*1e3;const n=this.wordsDestroyedCount>=4?2100:2800,i=this.slowMoTimer>0?n*1.8:n;this.spawnTimer>=i&&(this.spawnTimer=0,this.spawnWord());const s=this.container.querySelector("#cannon-playfield"),a=s?s.clientHeight-60:450,o=this.slowMoTimer>0?.35:1;for(let c=this.activeWords.length-1;c>=0;c--){const r=this.activeWords[c];if(!r.isDestroyed&&(r.y+=r.speed*o*e,r.el&&(r.el.style.transform=`translate3d(${r.x}px,${r.y}px,0)`),r.y>=a)){if(r.el&&r.el.parentNode&&r.el.parentNode.removeChild(r.el),this.activeWords.splice(c,1),this.lockedTarget&&this.lockedTarget.id===r.id&&(this.lockedTarget=null,this.typedBuffer=""),this.combo=0,this.wrongStreak=0,this.music.playMiss(),this.showMissFlash(),typeof window.recordWordWrong=="function"&&r.wordObj&&window.recordWordWrong(r.wordObj),this.playMode==="practice")this.showFloatingText(r.x,a-22,`💔 Rớt từ: ${r.wordObj.word} (${r.wordObj.meaning||""})`,"#ef4444");else if(this.shieldActive?(this.shieldActive=!1,this.shieldTimer=0,this.showFloatingText(r.x,a-20,"🛡️ Lá Chắn Chặn!","#38bdf8")):(this.lives--,this.showFloatingText(r.x,a-22,`💔 ${r.wordObj.word} (${r.wordObj.meaning||""})`,"#ef4444")),this.lives<=0){this.gameOver(!1);return}this.updateHUD(),this.updateTypedDisplay(),this.highlightTargets(),this.wordQueue.length===0&&this.activeWords.length===0&&setTimeout(()=>this.gameOver(!0),500)}}}this.animFrameId=requestAnimationFrame(e=>this.loop(e))}}showMissFlash(){const t=this.container.querySelector("#cannon-playfield");if(!t)return;const e=document.createElement("div");e.className="phidao-miss-flash",t.appendChild(e),setTimeout(()=>e.remove(),380)}startTimers(){this.timerInterval&&clearInterval(this.timerInterval),this.timerInterval=setInterval(()=>{!this.isRunning||this.isPaused||(this.slowMoTimer>0&&this.slowMoTimer--,this.score2xTimer>0&&this.score2xTimer--,this.shieldTimer>0&&(this.shieldTimer--,this.shieldTimer===0&&(this.shieldActive=!1)),this.updateBuffBanner(),this.updateHUD())},1e3)}showCenterTick(t){}updateBuffBanner(){const t=this.container.querySelector("#cannon-buff-banner");if(!t)return;const e=[];this.slowMoTimer>0&&e.push(`❄️ Mưa Băng (${this.slowMoTimer}s)`),this.score2xTimer>0&&e.push(`⭐ Nhân Điểm (${this.score2xTimer}s)`),this.shieldTimer>0&&e.push(`🛡️ Lá Chắn (${this.shieldTimer}s)`),t.style.display=e.length>0?"block":"none",t.textContent=e.join("  |  ")}activateSkill(t){const n={ice:10,heal:20,x2:30,shield:20}[t]||999;if(this.combo<n){this.showToast(`Cần ${n} Combo (Hiện: ${this.combo})`);return}this.combo-=n,this.music.playStreak(),t==="ice"?(this.slowMoTimer=6,this.showToast("❄️ Mưa Băng: Làm chậm 6s!")):t==="heal"?this.lives<this.maxLives?(this.lives++,this.music.playHeartRestore(),this.showToast("💚 +1 Tim!")):this.showToast("💚 Tim đã đầy!"):t==="x2"?(this.score2xTimer=8,this.showToast("⭐ Nhân Đôi Điểm 8s!")):t==="shield"&&(this.shieldActive=!0,this.shieldTimer=6,this.showToast("🛡️ Lá Chắn Bảo Vệ 6s!")),this.updateBuffBanner(),this.updateHUD()}updateHUD(){const t=this.container.querySelector("#cannon-score-val"),e=this.container.querySelector("#cannon-combo-val"),n=this.container.querySelector("#cannon-lives-container");if(t&&(t.textContent=this.score),e&&(e.textContent=`x${this.combo}`),n)if(this.playMode==="practice")n.innerHTML='<span style="color: #10b981; font-weight: 900; font-size: 0.95rem;"><i class="fa-solid fa-infinity"></i> Vô Hạn</span>';else{n.innerHTML="";for(let i=0;i<this.maxLives;i++){const s=document.createElement("i"),a=i<this.lives;s.className=a?"fa-solid fa-heart":"fa-regular fa-heart",s.style.color=a?"#ef4444":"rgba(255,255,255,.2)",n.appendChild(s)}}this.container.querySelectorAll(".phidao-skill-btn").forEach(i=>i.classList.toggle("affordable",this.combo>=parseInt(i.dataset.cost,10)))}showFloatingText(t,e,n,i){const s=this.container.querySelector("#cannon-fx-layer");if(!s)return;const a=document.createElement("div");a.className="phidao-float-text",a.textContent=n,a.style.cssText=`left:${t}px;top:${e}px;color:${i};`,s.appendChild(a),setTimeout(()=>a.remove(),950)}showToast(t){typeof window.showToast=="function"&&window.showToast(t)}togglePause(t){if(!this.isRunning)return;const e=this.container.querySelector("#cannon-pause-overlay");this.isPaused=typeof t=="boolean"?t:!this.isPaused;const n=this.container.querySelector("#cannon-pause-btn");if(n&&(n.innerHTML=`<i class="fa-solid fa-${this.isPaused?"play":"pause"}"></i>`),this.isPaused){if(this.music.stop(),e){const i=e.querySelector("#pause-score"),s=e.querySelector("#pause-combo"),a=e.querySelector("#pause-words");i&&(i.textContent=this.score),s&&(s.textContent=`x${this.combo}`),a&&(a.textContent=`${this.wordsDestroyedCount}/${this.rawWords.length}`),e.style.setProperty("display","flex","important")}this.showToast("⏸ Đã tạm dừng (Bấm Esc hoặc Tiếp tục)")}else e&&e.style.setProperty("display","none","important"),this.lastFrameTime=performance.now(),this.music.start(),this.focusInput(),this.showToast("▶️ Tiếp tục")}start(){this.animFrameId&&(cancelAnimationFrame(this.animFrameId),this.animFrameId=null),this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.isStopping=!1,this.isRunning=!0,this.isPaused=!1,this.score=0,this.combo=0,this.maxCombo=0,this.lives=3,this.activeWords=[],this.wordsDestroyedCount=0,this.correctWordsSet=new Set,this.typedBuffer="",this.lockedTarget=null,this.wrongStreak=0,this.wordQueue=[...this.rawWords].sort(()=>Math.random()-.5),this.slowMoTimer=0,this.score2xTimer=0,this.shieldActive=!1,this.shieldTimer=0,this.lastFrameTime=performance.now(),this.spawnTimer=0;const t=this.container.querySelector("#cannon-pause-overlay");t&&t.style.setProperty("display","none","important");const e=this.container.querySelector("#cannon-modal-overlay");e&&e.style.setProperty("display","none","important");const n=this.container.querySelector("#cannon-pause-btn");n&&(n.innerHTML='<i class="fa-solid fa-pause"></i>');const i=this.container.querySelector("#cannon-words-layer");i&&(i.innerHTML="");const s=this.container.querySelector("#cannon-fx-layer");s&&(s.innerHTML=""),this.updateHUD(),this.updateTypedDisplay(),this.startTimers(),this.music.start(),this.focusInput(),this.animFrameId=requestAnimationFrame(a=>this.loop(a))}gameOver(t){if(this.isStopping)return;this.isRunning=!1,this.isPaused=!1,this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.animFrameId&&(cancelAnimationFrame(this.animFrameId),this.animFrameId=null),this.music.stop();const e=this.container.querySelector("#cannon-pause-overlay");e&&e.style.setProperty("display","none","important");const n=this.container.querySelector("#cannon-modal-overlay");if(!n)return;n.style.setProperty("display","flex","important"),t?(this.music.playVictory(),this.container.querySelector("#cannon-result-icon").textContent="🏆",this.container.querySelector("#cannon-result-title").textContent="Phi Đao Thần Sầu!",this.container.querySelector("#cannon-result-desc").textContent=`Bạn đã xuất sắc bắn hạ ${this.wordsDestroyedCount}/${this.rawWords.length} từ vựng!`):(this.music.playGameOver(),this.container.querySelector("#cannon-result-icon").textContent="💔",this.container.querySelector("#cannon-result-title").textContent="Hết Tim - Kết Thúc Lượt Chơi!",this.container.querySelector("#cannon-result-desc").textContent="Đừng nản lòng! Hãy gõ pinyin thật nhanh và xem lại các từ vựng bên dưới nhé."),this.container.querySelector("#res-score").textContent=this.score,this.container.querySelector("#res-combo").textContent=this.maxCombo,this.container.querySelector("#res-words").textContent=`${this.wordsDestroyedCount}/${this.rawWords.length}`;const i=this.rawWords.filter(c=>!this.correctWordsSet.has(c.word)),s=n.querySelector("#cannon-retry-wrong-btn"),a=n.querySelector("#wrong-count-span");s&&(i.length>0?(s.style.display="inline-flex",a&&(a.textContent=i.length),s.onclick=c=>{c.preventDefault(),c.stopPropagation(),this.retryWithWords(i)}):s.style.display="none");const o=n.querySelector("#cannon-words-summary-wrap");o&&this.renderWordSummaryList(o,this.rawWords,this.correctWordsSet),[["#cannon-modal-close-x",()=>this.stopAndExit()],["#cannon-retry-btn",()=>this.restart()],["#cannon-back-hub-btn",()=>this.stopAndExit()],["#cannon-finish-btn",()=>{this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}]].forEach(([c,r])=>{const u=n.querySelector(c);u&&(u.onclick=d=>{d.preventDefault(),d.stopPropagation(),r()})})}renderWordSummaryList(t,e,n){if(!t)return;const i=e.length,s=e.filter(r=>n.has(r.word)).length,a=i-s;t.innerHTML=`
      <div class="game-results-word-summary">
        <div class="summary-tabs-header">
          <button class="summary-tab-btn active" data-tab="all"><i class="fa-solid fa-list-check"></i> Tất cả (${i})</button>
          <button class="summary-tab-btn correct-tab" data-tab="correct"><i class="fa-solid fa-circle-check"></i> Đúng (${s})</button>
          <button class="summary-tab-btn wrong-tab" data-tab="wrong"><i class="fa-solid fa-circle-xmark"></i> Cần ôn (${a})</button>
        </div>
        <div class="summary-words-list"></div>
      </div>`;const o=t.querySelector(".summary-words-list"),c=r=>{o.innerHTML="";const u=e.filter(d=>{const l=n.has(d.word);return r==="correct"?l:r==="wrong"?!l:!0});if(!u.length){o.innerHTML='<div style="text-align:center;color:#64748b;padding:16px;font-size:.85rem;">Không có từ vựng nào trong mục này.</div>';return}u.forEach(d=>{const l=n.has(d.word),h=document.createElement("div");h.className=`summary-word-card ${l?"is-correct":"is-wrong"}`,h.title="Nhấn để nghe phát âm",h.innerHTML=`
          <div class="sw-badge ${l?"badge-correct":"badge-wrong"}">
            <i class="fa-solid fa-${l?"check":"xmark"}"></i> ${l?"Đúng":"Cần ôn"}
          </div>
          <div class="sw-main">
            <div class="sw-hanzi">${d.word}</div>
            <div class="sw-pinyin">${d.pinyin?`[ ${d.pinyin} ]`:""}</div>
            <div class="sw-meaning">${d.meaning||""}</div>
          </div>
          <button type="button" class="sw-speak-btn" title="Nghe phát âm">
            <i class="fa-solid fa-volume-high"></i>
          </button>`,h.onclick=()=>{typeof window.speakText=="function"&&window.speakText(d.word)};const p=h.querySelector(".sw-speak-btn");p&&(p.onclick=f=>{f.stopPropagation(),typeof window.speakText=="function"&&window.speakText(d.word)}),o.appendChild(h)})};c("all"),t.querySelectorAll(".summary-tab-btn").forEach(r=>{r.addEventListener("click",u=>{u.preventDefault(),t.querySelectorAll(".summary-tab-btn").forEach(d=>d.classList.remove("active")),r.classList.add("active"),c(r.dataset.tab)})})}retryWithWords(t){const e=this.container.querySelector("#cannon-modal-overlay");e&&e.style.setProperty("display","none","important");const n=this.container.querySelector("#cannon-words-layer");n&&(n.innerHTML="");const i=this.container.querySelector("#cannon-fx-layer");i&&(i.innerHTML="");const s=this.rawWords;this.rawWords=t,this.start(),this.rawWords=s}restart(){const t=this.container.querySelector("#cannon-modal-overlay");t&&t.style.setProperty("display","none","important");const e=this.container.querySelector("#cannon-words-layer");e&&(e.innerHTML="");const n=this.container.querySelector("#cannon-fx-layer");n&&(n.innerHTML=""),this.start()}stopAndExit(){this.activeWords&&this.activeWords.length>0&&typeof window.recordWordWrong=="function"&&this.activeWords.forEach(s=>{!s.isDestroyed&&s.wordObj&&window.recordWordWrong(s.wordObj)}),this.isRunning=!1,this.isStopping=!0,this.isPaused=!1,this.music.stop();const t=this.container.querySelector("#cannon-pause-overlay");t&&t.style.setProperty("display","none","important"),this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.animFrameId&&(cancelAnimationFrame(this.animFrameId),this.animFrameId=null),this.keyHandler&&(window.removeEventListener("keydown",this.keyHandler,!0),this.keyHandler=null);const e=this.container.querySelector("#cannon-words-layer");e&&(e.innerHTML="");const n=this.container.querySelector("#cannon-fx-layer");n&&(n.innerHTML="");const i=this.onExit;this.onExit=null,typeof i=="function"&&i()}}class ${constructor(){this.ctx=null}init(){if(!this.ctx){const t=window.AudioContext||window.webkitAudioContext;t&&(this.ctx=new t)}}playTone(t,e,n,i=null){try{if(this.init(),!this.ctx)return;this.ctx.state==="suspended"&&this.ctx.resume();const s=this.ctx.createOscillator(),a=this.ctx.createGain();s.type=e,s.frequency.setValueAtTime(t,this.ctx.currentTime),i&&s.frequency.exponentialRampToValueAtTime(i,this.ctx.currentTime+n),a.gain.setValueAtTime(.18,this.ctx.currentTime),a.gain.exponentialRampToValueAtTime(.01,this.ctx.currentTime+n),s.connect(a),a.connect(this.ctx.destination),s.start(),s.stop(this.ctx.currentTime+n)}catch{}}playEatCorrect(){this.playTone(523.25,"triangle",.12,659.25)}playEatWrong(){this.playTone(180,"sawtooth",.25,90)}playPowerup(){this.playTone(400,"sine",.2,800)}playLevelUp(){this.playTone(440,"sine",.15,880),setTimeout(()=>this.playTone(880,"sine",.3,1174.66),160)}}class z{constructor(t,e,n){this.container=t,this.rawWords=e&&e.length>=4?e:[{word:"勤奋",pinyin:"qínfèn",meaning:"chăm chỉ"},{word:"懒惰",pinyin:"lǎnduò",meaning:"lười biếng"},{word:"聪明",pinyin:"cōngmíng",meaning:"thông minh"},{word:"骄傲",pinyin:"jiāo'ào",meaning:"kiêu ngạo"},{word:"快乐",pinyin:"kuàilè",meaning:"vui vẻ"},{word:"热情",pinyin:"rèqíng",meaning:"nhiệt tình"},{word:"诚实",pinyin:"chéngshí",meaning:"thành thật"},{word:"勇敢",pinyin:"yǒnggǎn",meaning:"dũng cảm"}],this.onExit=n,this.sfx=new $,this.level=1,this.maxLevel=5,this.streak=0,this.maxStreakNeeded=10,this.score=0,this.lives=3,this.maxLives=3,this.isPaused=!1,this.isRunning=!1,this.wordsEatenCorrect=0,this.correctWordsSet=new Set,this.gameMode="zh-vi",this.activeQuestionMode="zh-vi",this.invincibleTimer=0,this.powerups=[],this.cols=20,this.rows=13,this.cellSize=38,this.snake=[{x:6,y:6},{x:5,y:6},{x:4,y:6}],this.dir={x:1,y:0},this.nextDir={x:1,y:0},this.playMode=localStorage.getItem("snake_play_mode")||"practice",this.autoSpeech=localStorage.getItem("snake_auto_speech")!=="false",this.currentQuestion=null,this.apples=[],this.obstacles=[],this.tickInterval=220,this.lastTickTime=0,this.animFrameId=null,this.timerInterval=null,this.renderLayout(),this.initCanvas(),this.bindEvents()}renderLayout(){this.container.innerHTML=`
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
    `}initCanvas(){if(this.canvas=this.container.querySelector("#snake-canvas"),!this.canvas)return;this.ctx=this.canvas.getContext("2d");const t=this.container.querySelector("#snake-canvas-container"),e=t?t.clientWidth:650,n=Math.min(720,Math.max(300,e||620)),i=Math.round(n*(this.rows/this.cols));this.canvas.width=n,this.canvas.height=i,this.cellSize=n/this.cols}bindEvents(){const t=this.container.querySelector("#snake-top-back-btn"),e=this.container.querySelector("#snake-pause-btn"),n=this.container.querySelector("#snake-exit-btn"),i=this.container.querySelector("#snake-retry-btn"),s=this.container.querySelector("#snake-back-hub-btn"),a=this.container.querySelector("#snake-finish-btn"),o=this.container.querySelector("#snake-playmode-toggle-btn");o&&o.addEventListener("click",l=>{l.preventDefault(),this.playMode=this.playMode==="practice"?"challenge":"practice",localStorage.setItem("snake_play_mode",this.playMode);const h=this.container.querySelector("#snake-mode-icon-text");h&&(h.innerHTML=this.playMode==="practice"?'<i class="fa-solid fa-infinity" style="color: #10b981;"></i> <span style="color:#10b981;">Kiểm tra</span>':'<i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span style="color:#fbbf24;">Thi đấu</span>'),this.updateHUD(),this.showFloatingMessage(this.playMode==="practice"?"🎯 Chế độ Kiểm tra (♾️ Không tính tim)":"🏆 Chế độ Thi đấu (❤️❤️❤️ 3 Tim)")});const c=this.container.querySelector("#snake-speech-toggle-btn");c&&c.addEventListener("click",l=>{l.preventDefault(),this.autoSpeech=!this.autoSpeech,localStorage.setItem("snake_auto_speech",this.autoSpeech?"true":"false");const h=this.container.querySelector("#snake-speech-icon"),p=this.container.querySelector("#snake-speech-text");h&&(h.className=`fa-solid ${this.autoSpeech?"fa-volume-high":"fa-volume-xmark"}`,h.style.color=this.autoSpeech?"#22c55e":"#94a3b8"),p&&(p.textContent=this.autoSpeech?"Đọc tự động":"Tắt đọc"),this.showFloatingMessage(this.autoSpeech?"🔊 Đã bật tự động đọc từ":"🔇 Đã tắt tự động đọc")}),t&&t.addEventListener("click",l=>{l.preventDefault(),this.stopAndExit()}),e&&e.addEventListener("click",l=>{l.preventDefault(),this.togglePause()}),n&&n.addEventListener("click",l=>{l.preventDefault(),typeof window.exitNotebookGamesHub=="function"?(this.stopAndExit(),window.exitNotebookGamesHub()):this.stopAndExit()});const r=this.container.querySelector("#snake-modal-close-x");r&&r.addEventListener("click",l=>{l.preventDefault(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),i&&i.addEventListener("click",l=>{l.preventDefault(),this.restart()}),s&&s.addEventListener("click",l=>{l.preventDefault(),this.stopAndExit()}),a&&a.addEventListener("click",l=>{l.preventDefault(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()});const u=this.container.querySelector("#snake-speak-target-btn");if(u&&u.addEventListener("click",l=>{l.preventDefault(),l.stopPropagation(),this.currentQuestion&&typeof window.speakText=="function"&&window.speakText(this.currentQuestion.word)}),this.keyHandler=l=>{if(!this.isRunning||this.isPaused)return;const h=l.key.toLowerCase();h==="arrowup"||h==="w"?(this.dir.y===0&&(this.nextDir={x:0,y:-1}),l.preventDefault(),l.stopPropagation(),l.stopImmediatePropagation&&l.stopImmediatePropagation()):h==="arrowdown"||h==="s"?(this.dir.y===0&&(this.nextDir={x:0,y:1}),l.preventDefault(),l.stopPropagation(),l.stopImmediatePropagation&&l.stopImmediatePropagation()):h==="arrowleft"||h==="a"?(this.dir.x===0&&(this.nextDir={x:-1,y:0}),l.preventDefault(),l.stopPropagation(),l.stopImmediatePropagation&&l.stopImmediatePropagation()):h==="arrowright"||h==="d"?(this.dir.x===0&&(this.nextDir={x:1,y:0}),l.preventDefault(),l.stopPropagation(),l.stopImmediatePropagation&&l.stopImmediatePropagation()):h===" "&&(this.togglePause(),l.preventDefault(),l.stopPropagation(),l.stopImmediatePropagation&&l.stopImmediatePropagation())},window.addEventListener("keydown",this.keyHandler,!0),this.canvas){let l=0,h=0,p=!1;this.touchStartHandler=f=>{f.preventDefault(),f.touches&&f.touches[0]&&(l=f.touches[0].clientX,h=f.touches[0].clientY,p=!0)},this.touchMoveHandler=f=>{if(f.preventDefault(),!(!p||!this.isRunning||this.isPaused)&&f.touches&&f.touches[0]){const m=f.touches[0].clientX-l,b=f.touches[0].clientY-h,v=14;(Math.abs(m)>=v||Math.abs(b)>=v)&&(Math.abs(m)>Math.abs(b)?m>0&&this.dir.x===0?(this.nextDir={x:1,y:0},l=f.touches[0].clientX,h=f.touches[0].clientY):m<0&&this.dir.x===0&&(this.nextDir={x:-1,y:0},l=f.touches[0].clientX,h=f.touches[0].clientY):b>0&&this.dir.y===0?(this.nextDir={x:0,y:1},l=f.touches[0].clientX,h=f.touches[0].clientY):b<0&&this.dir.y===0&&(this.nextDir={x:0,y:-1},l=f.touches[0].clientX,h=f.touches[0].clientY))}},this.touchEndHandler=f=>{f.preventDefault(),p=!1},this.canvas.addEventListener("touchstart",this.touchStartHandler,{passive:!1}),this.canvas.addEventListener("touchmove",this.touchMoveHandler,{passive:!1}),this.canvas.addEventListener("touchend",this.touchEndHandler,{passive:!1}),this.canvas.addEventListener("touchcancel",this.touchEndHandler,{passive:!1})}const d=l=>{!this.isRunning||this.isPaused||(l==="up"&&this.dir.y===0?this.nextDir={x:0,y:-1}:l==="down"&&this.dir.y===0?this.nextDir={x:0,y:1}:l==="left"&&this.dir.x===0?this.nextDir={x:-1,y:0}:l==="right"&&this.dir.x===0&&(this.nextDir={x:1,y:0}))};this.container.querySelectorAll(".dpad-btn").forEach(l=>{const h=l.dataset.dir;l.addEventListener("touchstart",p=>{p.preventDefault(),l.classList.add("active"),d(h)},{passive:!1}),l.addEventListener("touchend",p=>{p.preventDefault(),l.classList.remove("active")},{passive:!1}),l.addEventListener("mousedown",p=>{p.preventDefault(),l.classList.add("active"),d(h)}),l.addEventListener("mouseup",()=>l.classList.remove("active")),l.addEventListener("mouseleave",()=>l.classList.remove("active"))}),this.container.querySelectorAll(".snake-mode-btn").forEach(l=>{l.addEventListener("click",h=>{h.preventDefault();const p=l.dataset.mode;p!==this.gameMode&&(this.container.querySelectorAll(".snake-mode-btn").forEach(f=>f.classList.remove("active")),l.classList.add("active"),this.gameMode=p,this.showFloatingMessage(`Đã chọn: ${l.textContent.trim()}`),this.currentQuestion&&this.refreshCurrentQuestion())})}),this.resizeHandler=()=>this.initCanvas(),window.addEventListener("resize",this.resizeHandler)}cleanFormat(t){return t?String(t).replace(/\([^)]*\)/g,"").replace(/（[^）]*）/g,"").trim():""}refreshCurrentQuestion(){if(!this.currentQuestion)return;let t=this.gameMode||"zh-vi";if(t==="mix"){const i=["zh-vi","vi-zh","pinyin-zh","pinyin-vi"];t=i[Math.floor(Math.random()*i.length)]}this.activeQuestionMode=t,this.updateTargetPrompt();const e=this.currentQuestion,n=t==="vi-zh"||t==="pinyin-zh";this.apples.forEach(i=>{i.isCorrect?i.displayText=n?e.word:this.cleanFormat(e.meaning):i.displayText=n?i.word:this.cleanFormat(i.meaning)})}resetSnake(){const t=3+Math.max(0,this.level-1);this.snake=[];for(let e=0;e<t;e++)this.snake.push({x:6-e,y:7});this.dir={x:1,y:0},this.nextDir={x:1,y:0},this.calculateSpeed()}calculateSpeed(){this.tickInterval=Math.max(110,220-(this.level-1)*25)}spawnObstacles(){this.obstacles=[];const t=(this.level-1)*2;for(let e=0;e<t;e++){let n=this.getRandomEmptyCell(2);n&&this.obstacles.push({type:e%2===0?"rock":"bush",x:n.x,y:n.y})}}nextWordQuestion(){if(!this.wordQueue||this.wordQueue.length===0){this.gameOver(!0);return}const t=this.wordQueue.pop();this.currentQuestion=t;let e=this.gameMode||"zh-vi";if(e==="mix"){const l=["zh-vi","vi-zh","pinyin-zh","pinyin-vi"];e=l[Math.floor(Math.random()*l.length)]}this.activeQuestionMode=e,this.updateTargetPrompt();let i=[...(this.rawWords||[]).filter(l=>l&&l.word!==t.word&&l.meaning!==t.meaning)];if(i.length<3&&typeof window<"u"&&Array.isArray(window.vocabList)){const l=window.vocabList.filter(h=>h&&h.word!==t.word&&h.meaning!==t.meaning&&(h.isStudied||h.isMemorized||String(h.level)===String(t.level)));i.push(...l)}const s=[...i].sort(()=>Math.random()-.5),a=new Set([t.word]),o=new Set([t.meaning]),c=[];for(const l of s)if(l&&l.word&&l.meaning&&!a.has(l.word)&&!o.has(l.meaning)&&(a.add(l.word),o.add(l.meaning),c.push(l),c.length===3))break;this.apples=[];const r=e==="vi-zh"||e==="pinyin-zh",u=r?t.word:this.cleanFormat(t.meaning);let d=this.getRandomEmptyCell(2.5);if(d&&this.apples.push({word:t.word,meaning:t.meaning,pinyin:t.pinyin,displayText:u,isCorrect:!0,x:d.x,y:d.y}),c.forEach(l=>{let h=this.getRandomEmptyCell(2.5);if(h){const p=r?l.word:this.cleanFormat(l.meaning);this.apples.push({word:l.word,meaning:l.meaning,pinyin:l.pinyin,displayText:p,isCorrect:!1,x:h.x,y:h.y})}}),this.powerups.length===0&&Math.random()<.28){let l=this.getRandomEmptyCell(2);if(l){const h=["heal","x2","shield"],p=h[Math.floor(Math.random()*h.length)];this.powerups.push({type:p,x:l.x,y:l.y})}}}getRandomEmptyCell(t=2){for(let e=0;e<200;e++){const n=Math.floor(Math.random()*(this.cols-4))+2,i=Math.floor(Math.random()*(this.rows-4))+2,s=this.snake.some(r=>Math.abs(r.x-n)<=1&&Math.abs(r.y-i)<=1),a=this.apples.some(r=>Math.hypot(r.x-n,r.y-i)<(t||2.2)),o=this.obstacles.some(r=>Math.abs(r.x-n)<=1&&Math.abs(r.y-i)<=1),c=this.powerups.some(r=>Math.abs(r.x-n)<=1&&Math.abs(r.y-i)<=1);if(!s&&!a&&!o&&!c)return{x:n,y:i}}for(let e=0;e<50;e++){const n=Math.floor(Math.random()*(this.cols-2))+1,i=Math.floor(Math.random()*(this.rows-2))+1,s=this.snake.some(c=>c.x===n&&c.y===i),a=this.apples.some(c=>c.x===n&&c.y===i),o=this.obstacles.some(c=>c.x===n&&c.y===i);if(!s&&!a&&!o)return{x:n,y:i}}return null}updateTargetPrompt(){if(!this.currentQuestion)return;const t=this.container.querySelector("#snake-target-card .target-badge-label"),e=this.container.querySelector("#target-zh-text"),n=this.container.querySelector("#snake-target-card .target-action-hint"),i=this.activeQuestionMode||"zh-vi",s=this.currentQuestion;i==="zh-vi"?(t&&(t.innerHTML='<i class="fa-solid fa-bullseye"></i> ĐỀ BÀI:'),e&&(e.textContent=s.word),n&&(n.innerHTML='<i class="fa-solid fa-apple-whole" style="color: #fde047;"></i> Lái rắn ăn quả có <strong>NGHĨA VIỆT ĐÚNG</strong>!')):i==="vi-zh"?(t&&(t.innerHTML='<i class="fa-solid fa-bullseye"></i> ĐỀ BÀI:'),e&&(e.textContent=this.cleanFormat(s.meaning)),n&&(n.innerHTML='<i class="fa-solid fa-apple-whole" style="color: #fde047;"></i> Lái rắn ăn quả có <strong>CHỮ HÁN ĐÚNG</strong>!')):i==="pinyin-zh"?(t&&(t.innerHTML='<i class="fa-solid fa-bullseye"></i> ĐỀ BÀI:'),e&&(e.textContent=this.cleanFormat(s.meaning)),n&&(n.innerHTML='<i class="fa-solid fa-apple-whole" style="color: #fde047;"></i> Lái rắn ăn quả có <strong>CHỮ HÁN ĐÚNG</strong>!')):i==="pinyin-vi"&&(t&&(t.innerHTML='<i class="fa-solid fa-bullseye"></i> ĐỀ BÀI:'),e&&(e.textContent=s.word),n&&(n.innerHTML='<i class="fa-solid fa-apple-whole" style="color: #fde047;"></i> Lái rắn ăn quả có <strong>NGHĨA VIỆT ĐÚNG</strong>!')),this.autoSpeech&&s&&s.word&&(typeof window.speakWordInstant=="function"?window.speakWordInstant(s.word):typeof window.speakText=="function"&&window.speakText(s.word))}loop(t){this.isRunning&&(this.isPaused||t-this.lastTickTime>=this.tickInterval&&(this.lastTickTime=t,this.updateGame()),this.draw(),this.animFrameId=requestAnimationFrame(e=>this.loop(e)))}updateGame(){this.dir=this.nextDir;const t={x:this.snake[0].x+this.dir.x,y:this.snake[0].y+this.dir.y};if(t.x<0&&(t.x=this.cols-1),t.x>=this.cols&&(t.x=0),t.y<0&&(t.y=this.rows-1),t.y>=this.rows&&(t.y=0),this.snake.slice(1).some(s=>s.x===t.x&&s.y===t.y)){this.handleMistake("Đâm trúng thân rắn!");return}if(this.obstacles.find(s=>s.x===t.x&&s.y===t.y)){this.handleMistake("Đâm trúng chướng ngại vật!");return}this.snake.unshift(t);const i=this.apples.findIndex(s=>s.x===t.x&&s.y===t.y);if(i!==-1){const s=this.apples[i];s.isCorrect?(this.streak+1>=this.maxStreakNeeded||this.snake.pop(),this.handleEatCorrect(s)):(this.handleEatWrong(s),this.snake.pop())}else{const s=this.powerups.findIndex(a=>a.x===t.x&&a.y===t.y);s!==-1&&(this.handleEatPowerup(this.powerups[s]),this.powerups.splice(s,1)),this.snake.pop()}}handleEatCorrect(t){this.sfx.playEatCorrect(),this.score+=20*this.level,this.streak++,this.wordsEatenCorrect=(this.wordsEatenCorrect||0)+1,this.currentQuestion&&this.currentQuestion.word&&this.correctWordsSet.add(this.currentQuestion.word),typeof window.recordWordMemorized=="function"&&this.currentQuestion&&window.recordWordMemorized(this.currentQuestion),this.wordsEatenCorrect>0&&this.wordsEatenCorrect%10===0&&(this.playMode==="challenge"&&this.lives<this.maxLives?(this.lives++,this.showFloatingMessage(`💖 Xuất sắc ăn đúng ${this.wordsEatenCorrect} từ! Hồi phục +1 Tim! ❤️`)):this.showFloatingMessage(`💖 Xuất sắc ăn đúng ${this.wordsEatenCorrect} từ!`)),this.streak>=this.maxStreakNeeded?this.levelUp():this.nextWordQuestion(),this.updateHUD()}handleEatWrong(t){this.sfx.playEatWrong(),typeof window.recordWordWrong=="function"&&this.currentQuestion&&window.recordWordWrong(this.currentQuestion),this.playMode==="practice"?(this.showFloatingMessage("Ăn chưa đúng quả! Tiếp tục cố gắng nhé! 🎯"),this.nextWordQuestion()):(this.invincibleTimer<=0?(this.lives--,this.showFloatingMessage("Ăn sai nghĩa! -1 Tim 💔")):this.showFloatingMessage("🛡️ Bất tử bảo vệ!"),this.lives<=0?this.gameOver(!1):this.nextWordQuestion()),this.updateHUD()}handleEatPowerup(t){this.sfx.playPowerup(),t.type==="heal"?this.playMode==="challenge"&&this.lives<this.maxLives?(this.lives++,this.showFloatingMessage("💚 Hồi 1 Tim!")):this.showFloatingMessage("💚 Đã nhặt hồi máu!"):t.type==="x2"?(this.score+=50,this.showFloatingMessage("🪙 Nhặt được đồng xu! +50 Điểm thưởng!")):t.type==="shield"&&(this.invincibleTimer=5,this.showFloatingMessage("🛡️ Bất Tử Trong 5 Giây!")),this.updateHUD()}handleMistake(t){this.sfx.playEatWrong(),this.playMode==="practice"?(this.showFloatingMessage(`${t} (Luyện tập không trừ tim) ♾️`),this.resetSnake()):(this.invincibleTimer<=0?(this.lives--,this.showFloatingMessage(`${t} -1 Tim 💔`)):this.showFloatingMessage("🛡️ Bất tử bảo vệ!"),this.lives<=0?this.gameOver(!1):this.resetSnake()),this.updateHUD()}levelUp(){this.sfx.playLevelUp(),this.level<this.maxLevel?(this.level++,this.streak=0,this.showFloatingMessage(`🎉 LÊN CẤP ${this.level}! Rắn dài thêm 1 khúc & tăng tốc!`),this.calculateSpeed(),this.spawnObstacles(),this.nextWordQuestion()):this.gameOver(!0),this.updateHUD()}showFloatingMessage(t){typeof window.showToast=="function"&&window.showToast(t)}updateHUD(){const t=this.container.querySelector("#snake-level-badge"),e=this.container.querySelector("#snake-streak-text"),n=this.container.querySelector("#snake-beads-container"),i=this.container.querySelector("#snake-score-val"),s=this.container.querySelector("#snake-lives-container");if(t&&(t.textContent=`CẤP ${this.level}`),e&&(e.textContent=`${this.streak}/10`),i&&(i.textContent=this.score),n){n.innerHTML="";for(let a=0;a<10;a++){const o=document.createElement("span");o.className=`bead ${a<this.streak?"filled":""}`,n.appendChild(o)}}if(s)if(this.playMode==="practice")s.innerHTML='<span style="color: #10b981; font-weight: 800; font-size: 0.92rem; display: inline-flex; align-items: center; gap: 4px;"><i class="fa-solid fa-infinity"></i> Vô hạn</span>';else{s.innerHTML="";for(let a=0;a<this.maxLives;a++){const o=document.createElement("i");o.className=a<this.lives?"fa-solid fa-heart":"fa-regular fa-heart",o.style.color=a<this.lives?"#ef4444":"rgba(255,255,255,0.3)",s.appendChild(o)}}for(let a=1;a<=5;a++){const o=this.container.querySelector(`#step-lvl-${a}`);o&&(o.classList.toggle("active",a===this.level),o.classList.toggle("done",a<this.level))}}draw(){if(!this.ctx||!this.canvas)return;const t=this.ctx,e=this.canvas.width,n=this.canvas.height,i=this.cellSize;t.fillStyle="#f8fafc",t.fillRect(0,0,e,n),t.strokeStyle="rgba(226, 232, 240, 0.8)",t.lineWidth=1;for(let a=0;a<=this.cols;a++)t.beginPath(),t.moveTo(a*i,0),t.lineTo(a*i,n),t.stroke();for(let a=0;a<=this.rows;a++)t.beginPath(),t.moveTo(0,a*i),t.lineTo(e,a*i),t.stroke();this.obstacles.forEach(a=>{const o=a.x*i+i/2,c=a.y*i+i/2;t.font=`${i*.85}px sans-serif`,t.textAlign="center",t.textBaseline="middle",t.fillText(a.type==="rock"?"🪨":"🌿",o,c)}),this.powerups.forEach(a=>{const o=a.x*i+i/2,c=a.y*i+i/2;t.save(),t.beginPath(),t.arc(o,c,i*.45,0,Math.PI*2),t.fillStyle=a.type==="heal"?"rgba(239, 68, 68, 0.25)":a.type==="x2"?"rgba(245, 158, 11, 0.25)":"rgba(56, 189, 248, 0.25)",t.fill(),t.font=`${i*.7}px sans-serif`,t.textAlign="center",t.textBaseline="middle",t.fillText(a.type==="heal"?"💚":a.type==="x2"?"🪙":"🛡️",o,c),t.restore()});const s=this.activeQuestionMode==="vi-zh"||this.activeQuestionMode==="pinyin-zh";this.apples.forEach(a=>{const o=a.x*i+i/2,c=a.y*i+i/2;t.font=`${i*.75}px sans-serif`,t.textAlign="center",t.textBaseline="middle",t.fillText("🍎",o,c-6),t.save();const r=a.displayText||(s?a.word:a.meaning||"");t.font=s?'bold 15px "LXGW WenKai Lite", "Kaiti", "STKaiti", "PingFang SC", sans-serif':"bold 12px Inter, sans-serif";const u=t.measureText(r),d=Math.max(u.width+14,46),l=s?22:20;t.fillStyle="#ffffff",t.strokeStyle="rgba(0, 0, 0, 0.25)",t.lineWidth=1.5,t.beginPath(),t.roundRect(o-d/2,c+8,d,l,6),t.fill(),t.stroke(),t.fillStyle="#0f172a",t.textAlign="center",t.textBaseline="middle",t.fillText(r,o,c+(s?19:18)),t.restore()}),this.snake.forEach((a,o)=>{const c=a.x*i,r=a.y*i,u=2;if(t.save(),o===0){t.fillStyle=this.invincibleTimer>0?"#38bdf8":"#22c55e",t.beginPath(),t.roundRect(c+u,r+u,i-u*2,i-u*2,8),t.fill(),t.fillStyle="#ffffff";const d=6;let l={x:c+i/2-d,y:r+i/2-d},h={x:c+i/2+d,y:r+i/2-d};this.dir.x===1?(l={x:c+i-8,y:r+8},h={x:c+i-8,y:r+i-8}):this.dir.x===-1?(l={x:c+8,y:r+8},h={x:c+8,y:r+i-8}):this.dir.y===1&&(l={x:c+8,y:r+i-8},h={x:c+i-8,y:r+i-8}),t.beginPath(),t.arc(l.x,l.y,3,0,Math.PI*2),t.arc(h.x,h.y,3,0,Math.PI*2),t.fill(),t.fillStyle="#0f172a",t.beginPath(),t.arc(l.x,l.y,1.5,0,Math.PI*2),t.arc(h.x,h.y,1.5,0,Math.PI*2),t.fill()}else{const d=o%2===0?"#4ade80":"#86efac";t.fillStyle=this.invincibleTimer>0?"rgba(56, 189, 248, 0.75)":d,t.beginPath(),t.roundRect(c+u,r+u,i-u*2,i-u*2,6),t.fill()}t.restore()})}togglePause(){this.isPaused=!this.isPaused;const t=this.container.querySelector("#snake-pause-btn");t&&(t.innerHTML=`<i class="fa-solid fa-${this.isPaused?"play":"pause"}"></i> ${this.isPaused?"Tiếp tục":"Tạm dừng"}`),this.showFloatingMessage(this.isPaused?"Đã tạm dừng game ⏸":"Tiếp tục chơi ▶️")}start(){this.animFrameId&&(cancelAnimationFrame(this.animFrameId),this.animFrameId=null),this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.isStopping=!1,this.isRunning=!0,this.isPaused=!1,this.level=1,this.streak=0,this.score=0,this.lives=3,this.wordsEatenCorrect=0,this.totalWordsCount=this.rawWords.length,this.wordQueue=[...this.rawWords].sort(()=>Math.random()-.5),this.timeLeft=60,this.invincibleTimer=0,this.powerups=[],this.obstacles=[],this.apples=[],this.resetSnake(),this.lastTickTime=performance.now(),this.calculateSpeed();const t=this.container.querySelector("#snake-modal-overlay");t&&t.style.setProperty("display","none","important"),this.initCanvas(),this.spawnObstacles(),this.nextWordQuestion(),this.updateHUD(),this.timerInterval=setInterval(()=>{!this.isRunning||this.isPaused||this.invincibleTimer>0&&this.invincibleTimer--},1e3),this.animFrameId=requestAnimationFrame(e=>this.loop(e))}gameOver(t){this.isRunning=!1,this.timerInterval&&clearInterval(this.timerInterval),this.animFrameId&&cancelAnimationFrame(this.animFrameId);const e=this.container.querySelector("#snake-modal-overlay"),n=this.container.querySelector("#snake-result-icon"),i=this.container.querySelector("#snake-result-title"),s=this.container.querySelector("#snake-result-desc"),a=this.container.querySelector("#snake-res-level"),o=this.container.querySelector("#snake-res-score"),c=this.container.querySelector("#snake-res-words");if(e){e.style.setProperty("display","flex","important"),n&&(n.textContent=t?"👑":"🐍"),i&&(i.textContent=t?"Vua Nuôi Rắn Từ Vựng!":"Hết Tim - Kết Thúc Lượt Chơi!"),s&&(s.textContent=t?`Bạn đã xuất sắc hoàn thành toàn bộ ${this.wordsEatenCorrect}/${this.totalWordsCount} từ vựng!`:"Hãy chú ý quan sát từ vựng và chọn đúng quả táo nhé!"),a&&(a.textContent=`CẤP ${this.level}`),o&&(o.textContent=this.score),c&&(c.textContent=`${this.wordsEatenCorrect||0}/${this.totalWordsCount||0}`);const r=e.querySelector("#snake-words-summary-wrap");r&&this.renderWordSummaryList(r,this.rawWords,this.correctWordsSet);const u=e.querySelector("#snake-modal-close-x"),d=e.querySelector("#snake-retry-btn"),l=e.querySelector("#snake-back-hub-btn"),h=e.querySelector("#snake-finish-btn");u&&(u.onclick=p=>{p.preventDefault(),p.stopPropagation(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),d&&(d.onclick=p=>{p.preventDefault(),p.stopPropagation(),this.restart()}),l&&(l.onclick=p=>{p.preventDefault(),p.stopPropagation(),this.stopAndExit()}),h&&(h.onclick=p=>{p.preventDefault(),p.stopPropagation(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()})}}renderWordSummaryList(t,e,n){if(!t)return;const i=e.length,s=e.filter(r=>n.has(r.word)).length,a=i-s;t.innerHTML=`
      <div class="game-results-word-summary">
        <div class="summary-tabs-header">
          <button type="button" class="summary-tab-btn active" data-tab="all">
            <i class="fa-solid fa-list-check"></i> Tất cả (${i})
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
    `;const o=t.querySelector(".summary-words-list"),c=r=>{o.innerHTML="";const u=e.filter(d=>{const l=n.has(d.word);return r==="correct"?l:r==="wrong"?!l:!0});if(u.length===0){o.innerHTML='<div style="text-align: center; color: #94a3b8; padding: 20px; font-size: 0.85rem;">Không có từ vựng nào trong mục này.</div>';return}u.forEach(d=>{const l=n.has(d.word),h=document.createElement("div");h.className=`summary-word-card ${l?"is-correct":"is-wrong"}`,h.innerHTML=`
          <div class="sw-badge ${l?"badge-correct":"badge-wrong"}">
            <i class="fa-solid fa-${l?"check":"xmark"}"></i> ${l?"Đúng":"Sai"}
          </div>
          <div class="sw-main">
            <div class="sw-hanzi">${d.word}</div>
            <div class="sw-pinyin">${d.pinyin?`[ ${d.pinyin} ]`:""}</div>
            <div class="sw-meaning">${d.meaning||""}</div>
          </div>
          <button type="button" class="sw-speak-btn" title="Nghe phát âm">
            <i class="fa-solid fa-volume-high"></i>
          </button>
        `;const p=h.querySelector(".sw-speak-btn");p&&(p.onclick=f=>{f.stopPropagation(),typeof window.speakText=="function"&&window.speakText(d.word)}),o.appendChild(h)})};c("all"),t.querySelectorAll(".summary-tab-btn").forEach(r=>{r.addEventListener("click",u=>{u.preventDefault(),t.querySelectorAll(".summary-tab-btn").forEach(d=>d.classList.remove("active")),r.classList.add("active"),c(r.dataset.tab)})})}restart(){const t=this.container.querySelector("#snake-modal-overlay");t&&t.style.setProperty("display","none","important"),this.start()}stopAndExit(){this.currentQuestion&&this.currentQuestion.word&&(!this.correctWordsSet||!this.correctWordsSet.has(this.currentQuestion.word))&&typeof window.recordWordWrong=="function"&&window.recordWordWrong(this.currentQuestion),this.isRunning=!1,this.isStopping=!0,this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.animFrameId&&(cancelAnimationFrame(this.animFrameId),this.animFrameId=null),this.keyHandler&&(window.removeEventListener("keydown",this.keyHandler,!0),this.keyHandler=null),this.resizeHandler&&(window.removeEventListener("resize",this.resizeHandler),this.resizeHandler=null),this.canvas&&this.touchStartHandler&&(this.canvas.removeEventListener("touchstart",this.touchStartHandler),this.canvas.removeEventListener("touchmove",this.touchMoveHandler),this.canvas.removeEventListener("touchend",this.touchEndHandler),this.canvas.removeEventListener("touchcancel",this.touchEndHandler),this.touchStartHandler=null,this.touchMoveHandler=null,this.touchEndHandler=null);const t=this.onExit;this.onExit=null,typeof t=="function"&&t()}}const I={课:["讠","果"],语:["讠","吾"],话:["讠","舌"],读:["讠","卖"],说:["讠","兑"],请:["讠","青"],谢:["讠","身","寸"],识:["讠","只"],认:["讠","人"],谁:["讠","隹"],记:["讠","己"],许:["讠","午"],让:["讠","上"],该:["讠","亥"],试:["讠","式"],词:["讠","司"],讲:["讠","井"],你:["亻","尔"],他:["亻","也"],们:["亻","门"],休:["亻","木"],体:["亻","本"],住:["亻","主"],位:["亻","立"],件:["亻","牛"],保:["亻","呆"],便:["亻","更"],信:["亻","言"],俩:["亻","两"],倒:["亻","到"],借:["亻","昔"],做:["亻","故"],作:["亻","乍"],化:["亻","匕"],代:["亻","弋"],明:["日","月"],晴:["日","青"],时:["日","寸"],早:["日","十"],星:["日","生"],晚:["日","免"],昨:["日","乍"],暖:["日","爰"],相:["木","目"],林:["木","木"],森:["木","木","木"],校:["木","交"],桥:["木","乔"],机:["木","几"],杯:["木","不"],树:["木","又","寸"],李:["木","子"],板:["木","反"],极:["木","及"],椅:["木","奇"],桌:["卜","日","木"],朋:["月","月"],脸:["月","佥"],腿:["月","退"],脚:["月","去","卩"],肚:["月","土"],胖:["月","半"],服:["月","卩","又"],好:["女","子"],她:["女","也"],妈:["女","马"],姐:["女","且"],妹:["女","未"],奶:["女","乃"],姓:["女","生"],姑:["女","古"],姨:["女","夷"],爸:["父","巴"],爷:["父","卩"],河:["氵","可"],江:["氵","工"],海:["氵","每"],湖:["氵","古","月"],池:["氵","也"],汉:["氵","又"],洗:["氵","先"],清:["氵","青"],泪:["氵","目"],游:["氵","方","子"],漂:["氵","票"],冷:["冫","令"],冰:["冫","水"],凉:["冫","京"],冬:["夂","冫"],草:["艹","早"],花:["艹","化"],茶:["艹","人","木"],药:["艹","约"],苹:["艹","平"],菜:["艹","爫","木"],蓝:["艹","监"],英:["艹","央"],节:["艹","卩"],和:["禾","口"],种:["禾","中"],秋:["禾","火"],秒:["禾","少"],租:["禾","且"],科:["禾","斗"],程:["禾","呈"],笔:["⺮","毛"],笑:["⺮","夭"],等:["⺮","寺"],第:["⺮","弟"],答:["⺮","合"],管:["⺮","官"],箱:["⺮","相"],篇:["⺮","扁"],符:["⺮","付"],学:["⺌","冖","子"],字:["宀","子"],家:["宀","豕"],安:["宀","女"],客:["宀","各"],室:["宀","至"],定:["宀","正"],写:["冖","与"],军:["冖","车"],国:["囗","玉"],园:["囗","元"],因:["囗","大"],团:["囗","才"],问:["门","口"],间:["门","日"],闭:["门","才"],闪:["门","人"],阔:["门","活"],吃:["口","乞"],喝:["口","曷"],唱:["口","昌"],听:["口","斤"],叫:["口","丩"],吧:["口","巴"],吗:["口","马"],呢:["口","尼"],响:["口","向"],打:["扌","丁"],找:["扌","戈"],把:["扌","巴"],抱:["扌","包"],提:["扌","是"],掉:["扌","卓"],推:["扌","隹"],拉:["扌","立"],看:["手","目"],想:["相","心"],您:["你","心"],思:["田","心"],情:["忄","青"],忙:["忄","亡"],快:["忄","夬"],慢:["忄","曼"],炎:["火","火"],灯:["火","丁"],灭:["一","火"],烧:["火","尧"],热:["执","灬"],照:["昭","灬"],点:["占","灬"],黑:["里","灬"],饭:["饣","反"],饮:["饣","欠"],饱:["饣","包"],馆:["饣","官"],饺:["饣","交"],跑:["⻊","包"],跳:["⻊","兆"],踢:["⻊","易"],路:["⻊","各"],跟:["⻊","艮"],狗:["犭","句"],猫:["犭","苗"],猪:["犭","者"],鸡:["又","鸟"],鸭:["甲","鸟"],鹅:["我","鸟"],过:["辶","寸"],进:["辶","井"],远:["辶","元"],近:["辶","斤"],送:["辶","关"],还:["辶","不"],边:["辶","力"],迟:["辶","尺"],道:["辶","首"],通:["辶","甬"],红:["纟","工"],给:["纟","合"],绿:["纟","录"],结:["纟","吉"],细:["纟","田"],级:["纟","及"],线:["纟","戋"],练:["纟","东"],地:["土","也"],场:["土","昜"],城:["土","成"],块:["土","夬"],男:["田","力"],累:["田","糸"],界:["田","介"],美:["⺶","大"],友:["𠂇","又"]},E=[{word:"课",pinyin:"kè",meaning:"bài học, tiết học",parts:["讠","果"]},{word:"明",pinyin:"míng",meaning:"sáng sủa, rõ ràng",parts:["日","月"]},{word:"好",pinyin:"hǎo",meaning:"tốt, đẹp, hay",parts:["女","子"]},{word:"休",pinyin:"xiū",meaning:"nghỉ ngơi",parts:["亻","木"]},{word:"谢",pinyin:"xiè",meaning:"cảm ơn",parts:["讠","身","寸"]},{word:"茶",pinyin:"chá",meaning:"trà, nước chè",parts:["艹","人","木"]},{word:"学",pinyin:"xué",meaning:"học tập",parts:["⺌","冖","子"]},{word:"草",pinyin:"cǎo",meaning:"cỏ",parts:["艹","早"]},{word:"河",pinyin:"hé",meaning:"con sông",parts:["氵","可"]},{word:"晴",pinyin:"qíng",meaning:"trời nắng ráo",parts:["日","青"]},{word:"打",pinyin:"dǎ",meaning:"đánh, gõ",parts:["扌","丁"]},{word:"看",pinyin:"kàn",meaning:"nhìn, xem",parts:["手","目"]},{word:"听",pinyin:"tīng",meaning:"nghe",parts:["口","斤"]},{word:"吃",pinyin:"chī",meaning:"ăn",parts:["口","乞"]},{word:"跑",pinyin:"pǎo",meaning:"chạy bộ",parts:["⻊","包"]},{word:"饭",pinyin:"fàn",meaning:"cơm, bữa ăn",parts:["饣","反"]}];class B{constructor(){this.ctx=null}init(){if(!this.ctx){const t=window.AudioContext||window.webkitAudioContext;t&&(this.ctx=new t)}}playTone(t,e,n,i=null){try{if(this.init(),!this.ctx)return;this.ctx.state==="suspended"&&this.ctx.resume();const s=this.ctx.createOscillator(),a=this.ctx.createGain();s.type=e,s.frequency.setValueAtTime(t,this.ctx.currentTime),i&&s.frequency.exponentialRampToValueAtTime(i,this.ctx.currentTime+n),a.gain.setValueAtTime(.18,this.ctx.currentTime),a.gain.exponentialRampToValueAtTime(.01,this.ctx.currentTime+n),s.connect(a),a.connect(this.ctx.destination),s.start(),s.stop(this.ctx.currentTime+n)}catch{}}playBubble(){this.playTone(320,"sine",.1,580)}playSuccess(){this.playTone(440,"triangle",.15,660),setTimeout(()=>this.playTone(660,"triangle",.25,880),120)}playFail(){this.playTone(220,"sawtooth",.3,110)}playChime(){this.playTone(880,"sine",.35,1320)}playWarning(){this.playTone(587,"sine",.18,880)}playUrgentTick(){this.playTone(950,"triangle",.06,1200)}}class G{constructor(t,e,n){this.container=t,this.rawWords=e&&e.length>=1?e:[{word:"课",pinyin:"kè",meaning:"bài học, tiết học"},{word:"美国",pinyin:"Měiguó",meaning:"Nước Mỹ"},{word:"明",pinyin:"míng",meaning:"sáng sủa, rõ ràng"},{word:"好",pinyin:"hǎo",meaning:"tốt, đẹp"},{word:"老师",pinyin:"lǎoshī",meaning:"thầy cô giáo"},{word:"休",pinyin:"xiū",meaning:"nghỉ ngơi"},{word:"学生",pinyin:"xuéshēng",meaning:"học sinh"},{word:"苹果",pinyin:"píngguǒ",meaning:"quả táo"}],this.onExit=n,this.sfx=new B,this.roundTime=25,this.score=0,this.streak=0,this.maxStreak=0,this.lives=3,this.maxLives=3,this.timeLeft=this.roundTime,this.isPaused=!1,this.isRunning=!1,this.craftedCount=0,this.currentQuestionIndex=0,this.totalWordsCount=(this.rawWords||[]).length,this.correctWordsSet=new Set,this.playMode=localStorage.getItem("alchemist_play_mode")||"practice",this.autoSpeech=localStorage.getItem("alchemist_auto_speech")!=="false",this.currentTarget=null,this.cauldronSlots=[],this.availableRadicals=[],this.isRevealed=!1,this.isProcessing=!1,this.timerInterval=null,this.renderLayout(),this.bindEvents()}renderLayout(){this.container.innerHTML=`
      <div class="alchemist-game-wrapper">
        <!-- TOP HUD -->
        <div class="alchemist-hud-bar">
          <button type="button" id="alchemist-top-back-btn" class="btn btn-outline btn-sm" style="display: flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 50px;">
            <i class="fa-solid fa-arrow-left"></i> Đổi Game
          </button>

          <div class="hud-item-title">
            <span style="font-size: 1.4rem;">⚗️</span>
            <strong style="color: #c084fc;">LÒ LUYỆN CHIẾT TỰ</strong>
          </div>

          <!-- Play Mode Toggle Button -->
          <button type="button" id="alchemist-playmode-toggle-btn" class="btn btn-outline btn-sm" title="Chuyển chế độ Kiểm tra (Không tính tim) / Thi đấu (3 Tim)" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 800; border-radius: 50px; cursor: pointer; padding: 5px 12px;">
            <span id="alchemist-mode-icon-text">${this.playMode==="practice"?'<i class="fa-solid fa-infinity" style="color: #10b981;"></i> <span style="color:#10b981;">Kiểm tra</span>':'<i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span style="color:#fbbf24;">Thi đấu</span>'}</span>
          </button>

          <!-- Auto Speech Toggle Button -->
          <button type="button" id="alchemist-speech-toggle-btn" class="btn btn-outline btn-sm" title="Bật/Tắt tự động đọc từ khi hiện câu hỏi" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 800; border-radius: 50px; cursor: pointer; padding: 5px 12px;">
            <i class="fa-solid ${this.autoSpeech?"fa-volume-high":"fa-volume-xmark"}" id="alchemist-speech-icon" style="color: ${this.autoSpeech?"#22c55e":"#94a3b8"};"></i>
            <span id="alchemist-speech-text" style="font-size: 0.78rem;">${this.autoSpeech?"Đọc":"Tắt đọc"}</span>
          </button>

          <div class="hud-item hud-progress" title="Tiến độ màn / câu hiện tại">
            <i class="fa-solid fa-layer-group" style="color: #c084fc;"></i>
            <span class="hud-label">MÀN:</span>
            <span class="hud-value" id="alchemist-progress-val">1/${this.totalWordsCount||1}</span>
          </div>

          <div class="hud-item hud-score">
            <i class="fa-solid fa-star" style="color: #fbbf24;"></i>
            <span class="hud-label">ĐIỂM:</span>
            <span class="hud-value" id="alchemist-score-val">0</span>
          </div>

          <div class="hud-item hud-combo">
            <i class="fa-solid fa-fire" style="color: #f97316;"></i>
            <span class="hud-label">CHUỖI:</span>
            <span class="hud-value" id="alchemist-streak-val">0</span>
          </div>

          <div class="hud-item hud-lives">
            <span class="hud-label">TIM:</span>
            <div class="hud-hearts" id="alchemist-lives-container">
              ${this.playMode==="practice"?'<span style="color: #10b981; font-weight: 900; font-size: 0.95rem;"><i class="fa-solid fa-infinity"></i> Vô Hạn</span>':'<i class="fa-solid fa-heart" style="color: #ef4444;"></i><i class="fa-solid fa-heart" style="color: #ef4444;"></i><i class="fa-solid fa-heart" style="color: #ef4444;"></i>'}
            </div>
          </div>

          <div class="hud-item hud-timer" title="Thời gian của màn chơi này">
            <i class="fa-solid fa-clock" style="color: #38bdf8;"></i>
            <span class="hud-label">THỜI GIAN:</span>
            <span class="hud-value" id="alchemist-timer-val">${this.playMode==="practice"?"♾️ Vô hạn":"00:25"}</span>
          </div>

          <div style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
            <button type="button" id="alchemist-pause-btn" class="btn btn-outline btn-sm" title="Tạm dừng"><i class="fa-solid fa-pause"></i></button>
            <button type="button" id="alchemist-back-hub-top-btn" class="btn btn-secondary btn-sm" title="Đổi trò chơi khác" style="display: flex; align-items: center; gap: 6px; font-weight: 700; border-radius: 50px; padding: 6px 14px;">
              <i class="fa-solid fa-arrow-left"></i> Đổi Game
            </button>
            <button type="button" id="alchemist-exit-btn" class="btn btn-outline btn-sm" title="Thoát về sổ tay"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>

        <!-- MAIN ARENA LAYOUT -->
        <div class="alchemist-arena-grid">
          <!-- LEFT: TARGET QUESTION CARD (ACTIVE RECALL - NO SPOILER ANSWER) -->
          <div class="alchemist-target-card">
            <div class="alchemist-quest-tag" id="alchemist-quest-type-tag">
              <i class="fa-solid fa-flask"></i> LUYỆN BỘ THỦ CHỮ HÁN
            </div>
            
            <div class="alchemist-target-main">
              <!-- MYSTERY TARGET ORB -->
              <div class="target-mystery-box">
                <div class="target-mystery-orb" id="alchemist-mystery-orb">
                  <span class="mystery-question-mark">?</span>
                  <span class="revealed-hanzi" id="alchemist-revealed-hanzi">明</span>
                </div>
              </div>

              <!-- PINYIN & AUDIO -->
              <div class="target-pinyin-wrap">
                <div class="target-pinyin-glow" id="alchemist-target-pinyin">(míng)</div>
                <button type="button" id="alchemist-audio-hint-btn" class="pinyin-speaker-btn" title="Nghe phát âm">
                  <i class="fa-solid fa-volume-high"></i>
                </button>
              </div>

              <!-- VIETNAMESE MEANING (CHALLENGE PROMPT) -->
              <div class="target-meaning-box">
                <span class="meaning-label">Nghĩa tiếng Việt:</span>
                <div class="meaning-val" id="alchemist-target-meaning">sáng sủa, rõ ràng</div>
              </div>
            </div>

            <div class="alchemist-hint-box">
              <i class="fa-solid fa-wand-magic-sparkles" style="color: #c084fc; font-size: 1.1rem; flex-shrink: 0;"></i>
              <span>Nhớ cách viết của từ mang nghĩa này, rồi chọn các mảnh ghép nạp vào vạc luyện kim!</span>
            </div>
          </div>

          <!-- CENTER: MAGICAL CAULDRON (DYNAMIC WIDE POT) -->
          <div class="alchemist-cauldron-container">
            <div class="cauldron-aura"></div>
            
            <!-- CAULDRON VISUAL -->
            <div class="cauldron-pot slots-2" id="alchemist-cauldron-pot">
              <div class="cauldron-rim"></div>
              <div class="cauldron-liquid" id="cauldron-liquid">
                <div class="cauldron-bubble b1"></div>
                <div class="cauldron-bubble b2"></div>
                <div class="cauldron-bubble b3"></div>
              </div>
              
              <!-- DYNAMIC SLOTS FOR CHOSEN RADICALS / CHARACTERS -->
              <div class="cauldron-slots-wrap" id="cauldron-slots-wrap">
                <!-- Dynamically populated slots -->
              </div>
            </div>

            <!-- ACTION BUTTONS -->
            <div class="cauldron-actions">
              <button type="button" id="alchemist-clear-btn" class="btn btn-outline" style="border-radius: 50px; font-weight: 700;">
                <i class="fa-solid fa-arrow-rotate-left"></i> Đổ Lại
              </button>
              <button type="button" id="alchemist-fuse-btn" class="btn btn-primary btn-fuse-glow">
                <i class="fa-solid fa-wand-magic-sparkles"></i> LUYỆN HÓA ✨
              </button>
            </div>
          </div>

          <!-- RIGHT: INGREDIENTS SHELF (BỘ THỦ / CHỮ NGUYÊN LIỆU) -->
          <div class="alchemist-shelf-card">
            <div class="shelf-title">
              <i class="fa-solid fa-gem" style="color: #38bdf8;"></i> KỆ NGUYÊN LIỆU CHIẾT TỰ
            </div>
            <div class="shelf-hint">Nhấp vào nguyên liệu để nạp vào vạc luyện kim</div>

            <div class="radicals-grid" id="radicals-shelf-grid">
              <!-- Dynamically populated radical crystal buttons -->
            </div>
          </div>
        </div>

        <!-- MODAL OVERLAY (VICTORY / GAME OVER) -->
        <div id="alchemist-modal-overlay" class="cannon-modal-overlay" style="display: none;">
          <div class="cannon-result-card">
            <button type="button" id="alchemist-modal-close-x" class="result-modal-close-btn" title="Đóng">&times;</button>
            <div id="alchemist-result-icon" class="result-icon">⚗️</div>
            <h2 id="alchemist-result-title" class="result-title">Hoàn Thành Màn Chơi!</h2>
            <p id="alchemist-result-desc" class="result-desc">Bạn đã xuất sắc luyện thành công các chữ Hán!</p>
            
            <div class="result-stats-grid">
              <div class="stat-pill">
                <span class="label">Tổng Điểm</span>
                <span class="val" id="alchemist-res-score">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Chuỗi Tối Đa</span>
                <span class="val" id="alchemist-res-streak">0</span>
              </div>
              <div class="stat-pill">
                <span class="label">Chữ Đã Luyện</span>
                <span class="val" id="alchemist-res-words">0</span>
              </div>
            </div>

            <!-- BẢNG TỔNG KẾT TỪ VỰNG ĐÚNG / SAI -->
            <div id="alchemist-words-summary-wrap"></div>

            <div class="result-beta-note">
              <i class="fa-solid fa-flask"></i> <strong>Chế độ luyện tập:</strong> Hãy tiếp tục trau dồi vốn từ vựng HSK của bạn!
            </div>

            <div class="cannon-result-card-actions">
              <button type="button" id="alchemist-retry-btn" class="btn btn-primary"><i class="fa-solid fa-rotate-right"></i> Chơi Lại</button>
              <button type="button" id="alchemist-back-hub-btn" class="btn btn-secondary"><i class="fa-solid fa-gamepad"></i> Đổi Trò Chơi</button>
              <button type="button" id="alchemist-finish-btn" class="btn btn-outline"><i class="fa-solid fa-book-bookmark"></i> Quay Lại Sổ Tay</button>
            </div>
          </div>
        </div>
      </div>
    `}bindEvents(){const t=this.container.querySelector("#alchemist-pause-btn"),e=this.container.querySelector("#alchemist-back-hub-top-btn"),n=this.container.querySelector("#alchemist-top-back-btn"),i=this.container.querySelector("#alchemist-exit-btn"),s=this.container.querySelector("#alchemist-modal-close-x"),a=this.container.querySelector("#alchemist-retry-btn"),o=this.container.querySelector("#alchemist-back-hub-btn"),c=this.container.querySelector("#alchemist-finish-btn"),r=this.container.querySelector("#btn-clear-cauldron"),u=this.container.querySelector("#btn-fuse-cauldron"),d=this.container.querySelector("#alchemist-audio-hint-btn"),l=this.container.querySelector("#alchemist-playmode-toggle-btn");l&&l.addEventListener("click",p=>{p.preventDefault(),this.playMode=this.playMode==="practice"?"challenge":"practice",localStorage.setItem("alchemist_play_mode",this.playMode);const f=this.container.querySelector("#alchemist-mode-icon-text");f&&(f.innerHTML=this.playMode==="practice"?'<i class="fa-solid fa-infinity" style="color: #10b981;"></i> <span style="color:#10b981;">Kiểm tra</span>':'<i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span style="color:#fbbf24;">Thi đấu</span>'),this.updateHUD(),this.startTimers(),this.showToast(this.playMode==="practice"?"🎯 Chế độ Kiểm tra (♾️ Không tính tim)":"🏆 Chế độ Thi đấu (❤️❤️❤️ 3 Tim)")});const h=this.container.querySelector("#alchemist-speech-toggle-btn");h&&h.addEventListener("click",p=>{p.preventDefault(),this.autoSpeech=!this.autoSpeech,localStorage.setItem("alchemist_auto_speech",this.autoSpeech?"true":"false");const f=this.container.querySelector("#alchemist-speech-icon"),m=this.container.querySelector("#alchemist-speech-text");f&&(f.className=`fa-solid ${this.autoSpeech?"fa-volume-high":"fa-volume-xmark"}`,f.style.color=this.autoSpeech?"#22c55e":"#94a3b8"),m&&(m.textContent=this.autoSpeech?"Đọc":"Tắt đọc"),this.showToast(this.autoSpeech?"🔊 Đã bật tự động đọc từ":"🔇 Đã tắt tự động đọc")}),s&&s.addEventListener("click",()=>{this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),t&&t.addEventListener("click",()=>this.togglePause()),n&&n.addEventListener("click",()=>this.stopAndExit()),e&&e.addEventListener("click",p=>{p.preventDefault(),this.stopAndExit()}),i&&i.addEventListener("click",()=>{this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),a&&a.addEventListener("click",()=>this.restart()),o&&o.addEventListener("click",()=>this.stopAndExit()),c&&c.addEventListener("click",()=>{this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),r&&r.addEventListener("click",()=>this.clearCauldron()),u&&u.addEventListener("click",()=>this.attemptFusion()),d&&d.addEventListener("click",()=>{this.currentTarget&&this.currentTarget.fullWord&&window.speakText&&window.speakText(this.currentTarget.fullWord)})}start(){this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.isStopping=!1,this.isRunning=!0,this.isPaused=!1,this.isProcessing=!1,this.score=0,this.streak=0,this.maxStreak=0,this.lives=3,this.craftedCount=0,this.currentQuestionIndex=0;const t=this.container.querySelector("#alchemist-modal-overlay");t&&t.style.setProperty("display","none","important"),this.cauldronSlots=[],this.totalWordsCount=(this.rawWords||[]).length,this.wordQueue=[...this.rawWords||[]].sort(()=>Math.random()-.5),this.nextQuestion(),this.updateHUD(),this.startTimers()}startTimers(){this.timerInterval&&clearInterval(this.timerInterval),this.playMode!=="practice"&&(this.timerInterval=setInterval(()=>{!this.isRunning||this.isPaused||this.isProcessing||(this.timeLeft--,this.handleTimeCountdownAlert(this.timeLeft),this.timeLeft<=0&&this.handleRoundTimeout(),this.updateHUD())},1e3))}handleRoundTimeout(){if(this.isProcessing)return;this.isProcessing=!0,this.sfx.playFail();const t=this.container.querySelector("#cauldron-liquid");t&&t.classList.add("fusion-fail"),this.lives--,this.streak=0,this.showToast("⏰ Hết thời gian màn này! -1 Tim 💔",!0),setTimeout(()=>{t&&t.classList.remove("fusion-fail"),this.clearCauldron(),this.isProcessing=!1,this.lives<=0?this.gameOver(!1):(this.nextQuestion(),this.updateHUD())},900)}handleTimeCountdownAlert(t){const e=this.container.querySelector(".hud-timer");t===10?(this.sfx&&this.sfx.playWarning&&this.sfx.playWarning(),this.showToast("⚠️ Còn 10 giây cho màn này!"),e&&e.classList.add("timer-warning-30")):t<=5&&t>=1&&(this.sfx&&this.sfx.playUrgentTick&&this.sfx.playUrgentTick(),e&&e.classList.add("timer-urgent-10"),this.showCenterCountdownTick(t))}showCenterCountdownTick(t){let e=this.container.querySelector(".game-center-countdown-tick");e||(e=document.createElement("div"),e.className="game-center-countdown-tick",(this.container.querySelector(".alchemist-arena-grid")||this.container).appendChild(e)),e.textContent=t,e.classList.remove("tick-anim"),e.offsetWidth,e.classList.add("tick-anim")}decomposeWordTarget(t){if(!t||!t.word){const i=E[Math.floor(Math.random()*E.length)];return{type:"radical",fullWord:i.word,pinyin:i.pinyin,meaning:i.meaning,requiredParts:i.parts}}const e=t.word.trim();if(e.length>=2)return{type:"compound",fullWord:e,pinyin:t.pinyin||"",meaning:t.meaning||"Từ ghép",requiredParts:e.split("")};if(I[e])return{type:"radical",fullWord:e,pinyin:t.pinyin||"",meaning:t.meaning||"Từ đơn",requiredParts:I[e]};const n=E[Math.floor(Math.random()*E.length)];return{type:"radical",fullWord:n.word,pinyin:n.pinyin,meaning:n.meaning,requiredParts:n.parts}}nextQuestion(){if(this.cauldronSlots=[],this.isRevealed=!1,this.isProcessing=!1,!this.wordQueue||this.wordQueue.length===0){this.gameOver(!0);return}this.currentQuestionIndex++,this.timeLeft=this.roundTime;const t=this.container.querySelector(".hud-timer");t&&t.classList.remove("timer-warning-60","timer-warning-30","timer-urgent-10");const e=this.wordQueue.pop();this.currentTarget=this.decomposeWordTarget(e);const n=this.container.querySelector("#alchemist-quest-type-tag"),i=this.container.querySelector("#alchemist-mystery-orb"),s=this.container.querySelector("#alchemist-revealed-hanzi"),a=this.container.querySelector("#alchemist-target-pinyin"),o=this.container.querySelector("#alchemist-target-meaning");if(n&&(this.currentTarget.type==="compound"?n.innerHTML='<i class="fa-solid fa-wand-magic-sparkles"></i> LUYỆN TỪ VỰNG GHÉP':n.innerHTML='<i class="fa-solid fa-flask"></i> LUYỆN BỘ THỦ CHIẾT TỰ'),i&&i.classList.remove("revealed"),s&&(s.textContent=this.currentTarget.fullWord),a&&(a.textContent=this.currentTarget.pinyin?`(${this.currentTarget.pinyin})`:""),o&&(o.textContent=this.currentTarget.meaning),this.autoSpeech&&this.currentTarget&&this.currentTarget.fullWord){const c=window.speakWordInstant||window.speakText;if(typeof c=="function")try{c(this.currentTarget.fullWord)}catch{}}this.setupCauldronSlots(),this.buildIngredientsShelf(),this.renderShelf(),this.updateCauldronDisplay()}setupCauldronSlots(){const t=this.currentTarget.requiredParts.length,e=this.container.querySelector("#alchemist-cauldron-pot"),n=this.container.querySelector("#cauldron-slots-wrap");if(!n)return;e&&(e.className=`cauldron-pot slots-${Math.min(4,Math.max(2,t))}`);let i="";for(let s=0;s<t;s++)s>0&&(i+='<div class="slot-plus">+</div>'),i+=`
        <div class="cauldron-slot" data-index="${s}" id="slot-${s}" title="Nhấp để gỡ nguyên liệu">
          <span class="slot-placeholder">?</span>
        </div>
      `;n.innerHTML=i}buildIngredientsShelf(){const t=[...this.currentTarget.requiredParts],e=Math.max(6,9-t.length);let n=[];this.currentTarget.type==="compound"?n=["中","美","国","人","大","小","老","师","学","生","朋","友","苹","果","电","脑","天","气","汉","语","喜","欢","北","京","吃","饭","喝","水","看","书","高","兴"]:n=["氵","木","日","月","亻","口","女","子","讠","心","忄","扌","火","门","辶","艹","土","纟","饣","禾","目","宀","夂","⻊","父","巴","果","青","吾","舌"];const s=[...n.filter(a=>!t.includes(a))].sort(()=>.5-Math.random()).slice(0,e);this.availableRadicals=[...t,...s].sort(()=>.5-Math.random())}renderShelf(){const t=this.container.querySelector("#radicals-shelf-grid");t&&(t.innerHTML="",this.availableRadicals.forEach(e=>{const n=document.createElement("button");n.type="button",n.className="radical-crystal-btn",n.innerHTML=`
        <span class="rad-char">${e}</span>
        <span class="rad-sparkle">✨</span>
      `,n.addEventListener("click",()=>{this.isProcessing||this.addRadicalToCauldron(e)}),t.appendChild(n)}))}addRadicalToCauldron(t){const e=this.currentTarget.requiredParts.length;if(this.cauldronSlots.length>=e){this.showToast("Vạc đã đủ nguyên liệu! Nhấn LUYỆN HÓA hoặc Đổ Lại.");return}this.sfx.playBubble(),this.cauldronSlots.push(t),this.updateCauldronDisplay(),this.cauldronSlots.length===e&&setTimeout(()=>this.attemptFusion(),250)}removeSlotItem(t){this.isProcessing||this.cauldronSlots[t]&&(this.cauldronSlots.splice(t,1),this.updateCauldronDisplay())}clearCauldron(){this.isProcessing||(this.cauldronSlots=[],this.updateCauldronDisplay())}updateCauldronDisplay(){const t=this.currentTarget?this.currentTarget.requiredParts.length:2;for(let e=0;e<t;e++){const n=this.container.querySelector(`#slot-${e}`);if(n){const i=this.cauldronSlots[e];i?(n.innerHTML=`<span class="slot-filled-char">${i}</span>`,n.classList.add("filled"),n.onclick=()=>this.removeSlotItem(e)):(n.innerHTML='<span class="slot-placeholder">?</span>',n.classList.remove("filled"),n.onclick=null)}}}attemptFusion(){if(!this.currentTarget||this.isProcessing)return;if(this.cauldronSlots.length===0){this.showToast("Hãy chọn các bộ thủ / mảnh ghép trên kệ nạp vào vạc trước!");return}this.isProcessing=!0;const t=[...this.currentTarget.requiredParts],e=[...this.cauldronSlots];let n=!1;if(this.currentTarget.type==="compound")n=t.length===e.length&&t.every((a,o)=>a===e[o]);else{const a=[...t].sort(),o=[...e].sort();n=a.length===o.length&&a.every((c,r)=>c===o[r])}const i=this.container.querySelector("#cauldron-liquid"),s=this.container.querySelector("#alchemist-mystery-orb");if(n){this.sfx.playSuccess(),i&&i.classList.add("fusion-success"),s&&s.classList.add("revealed");const a=35+this.streak*5;if(this.score+=a,this.streak++,this.craftedCount++,this.streak>this.maxStreak&&(this.maxStreak=this.streak),this.streak>0&&this.streak%10===0&&(this.lives<this.maxLives?(this.lives++,this.showToast(`💖 Chuỗi ${this.streak} xuất sắc! Hồi phục +1 Tim! ❤️`)):this.showToast(`💖 Chuỗi ${this.streak} xuất sắc! Thần sầu!`)),this.currentTarget&&this.currentTarget.fullWord&&this.correctWordsSet.add(this.currentTarget.fullWord),typeof window.recordWordMemorized=="function"&&this.currentTarget&&window.recordWordMemorized({word:this.currentTarget.fullWord,pinyin:this.currentTarget.pinyin,meaning:this.currentTarget.meaning}),this.autoSpeech&&this.currentTarget&&this.currentTarget.fullWord){const o=window.speakWordInstant||window.speakText;if(typeof o=="function")try{o(this.currentTarget.fullWord)}catch{}}this.showToast(`✨ Luyện Thành Công:「${this.currentTarget.fullWord}」! +${a} Điểm`),setTimeout(()=>{i&&i.classList.remove("fusion-success"),this.nextQuestion(),this.updateHUD()},1200)}else this.sfx.playFail(),typeof window.recordWordWrong=="function"&&this.currentTarget&&window.recordWordWrong({word:this.currentTarget.fullWord,pinyin:this.currentTarget.pinyin,meaning:this.currentTarget.meaning}),i&&i.classList.add("fusion-fail"),this.playMode==="practice"?this.showToast("💨 Chưa đúng thành phần, hãy thử lại nhé! 🎯",!1):(this.lives--,this.streak=0,this.showToast("💨 Hợp thể thất bại! Sai thành phần (-1 Tim 💔)",!0)),setTimeout(()=>{i&&i.classList.remove("fusion-fail"),this.clearCauldron(),this.isProcessing=!1,this.playMode==="challenge"&&this.lives<=0&&this.gameOver(!1),this.updateHUD()},750)}updateHUD(){const t=this.container.querySelector("#alchemist-score-val"),e=this.container.querySelector("#alchemist-streak-val"),n=this.container.querySelector("#alchemist-lives-container"),i=this.container.querySelector("#alchemist-timer-val"),s=this.container.querySelector("#alchemist-progress-val");if(t&&(t.textContent=this.score),e&&(e.textContent=this.streak),s&&(s.textContent=`${Math.min(this.currentQuestionIndex||1,this.totalWordsCount||1)}/${this.totalWordsCount||1}`),n)if(this.playMode==="practice")n.innerHTML='<span style="color: #10b981; font-weight: 900; font-size: 0.95rem;"><i class="fa-solid fa-infinity"></i> Vô Hạn</span>';else{n.innerHTML="";for(let a=0;a<this.maxLives;a++){const o=document.createElement("i");o.className=a<this.lives?"fa-solid fa-heart":"fa-regular fa-heart",o.style.color=a<this.lives?"#ef4444":"rgba(255,255,255,0.3)",n.appendChild(o)}}if(i){const a=Math.floor(Math.max(0,this.timeLeft)/60),o=Math.max(0,this.timeLeft)%60;i.textContent=this.playMode==="practice"?"♾️ Vô hạn":`${String(a).padStart(2,"0")}:${String(o).padStart(2,"0")}`}}showToast(t,e=!1){typeof window.showToast=="function"&&window.showToast(t,e)}togglePause(){this.isPaused=!this.isPaused;const t=this.container.querySelector("#alchemist-pause-btn");t&&(t.innerHTML=`<i class="fa-solid fa-${this.isPaused?"play":"pause"}"></i>`),this.showToast(this.isPaused?"Đã tạm dừng game ⏸":"Tiếp tục chơi ▶️")}gameOver(t){this.isRunning=!1,this.timerInterval&&clearInterval(this.timerInterval);const e=this.container.querySelector("#alchemist-modal-overlay"),n=this.container.querySelector("#alchemist-result-icon"),i=this.container.querySelector("#alchemist-result-title"),s=this.container.querySelector("#alchemist-result-desc"),a=this.container.querySelector("#alchemist-res-score"),o=this.container.querySelector("#alchemist-res-streak"),c=this.container.querySelector("#alchemist-res-words");if(e){e.style.setProperty("display","flex","important"),n&&(n.textContent=t?"🏆":"💨"),i&&(i.textContent=t?"Nhà Giả Kim Xuất Sắc!":"Hết Tim - Luyện Thất Bại!"),s&&(s.textContent=t?`Bạn đã xuất sắc chiết tự và ghép thành công toàn bộ ${this.craftedCount||this.totalWordsCount}/${this.totalWordsCount} từ vựng!`:"Hãy chú ý quan sát các nét bộ thủ cấu thành chữ Hán nhé!"),a&&(a.textContent=this.score),o&&(o.textContent=this.maxStreak),c&&(c.textContent=`${this.craftedCount||0}/${this.totalWordsCount||0}`);const r=e.querySelector("#alchemist-words-summary-wrap");r&&this.renderWordSummaryList(r,this.rawWords,this.correctWordsSet);const u=e.querySelector("#alchemist-modal-close-x"),d=e.querySelector("#alchemist-retry-btn"),l=e.querySelector("#alchemist-back-hub-btn"),h=e.querySelector("#alchemist-finish-btn");u&&(u.onclick=p=>{p.preventDefault(),p.stopPropagation(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),d&&(d.onclick=p=>{p.preventDefault(),p.stopPropagation(),this.restart()}),l&&(l.onclick=p=>{p.preventDefault(),p.stopPropagation(),this.stopAndExit()}),h&&(h.onclick=p=>{p.preventDefault(),p.stopPropagation(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()})}}renderWordSummaryList(t,e,n){if(!t)return;const i=e.length,s=e.filter(r=>n.has(r.word)).length,a=i-s;t.innerHTML=`
      <div class="game-results-word-summary">
        <div class="summary-tabs-header">
          <button type="button" class="summary-tab-btn active" data-tab="all">
            <i class="fa-solid fa-list-check"></i> Tất cả (${i})
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
    `;const o=t.querySelector(".summary-words-list"),c=r=>{o.innerHTML="";const u=e.filter(d=>{const l=n.has(d.word);return r==="correct"?l:r==="wrong"?!l:!0});if(u.length===0){o.innerHTML='<div style="text-align: center; color: #94a3b8; padding: 20px; font-size: 0.85rem;">Không có từ vựng nào trong mục này.</div>';return}u.forEach(d=>{const l=n.has(d.word),h=document.createElement("div");h.className=`summary-word-card ${l?"is-correct":"is-wrong"}`,h.innerHTML=`
          <div class="sw-badge ${l?"badge-correct":"badge-wrong"}">
            <i class="fa-solid fa-${l?"check":"xmark"}"></i> ${l?"Đúng":"Sai"}
          </div>
          <div class="sw-main">
            <div class="sw-hanzi">${d.word}</div>
            <div class="sw-pinyin">${d.pinyin?`[ ${d.pinyin} ]`:""}</div>
            <div class="sw-meaning">${d.meaning||""}</div>
          </div>
          <button type="button" class="sw-speak-btn" title="Nghe phát âm">
            <i class="fa-solid fa-volume-high"></i>
          </button>
        `;const p=h.querySelector(".sw-speak-btn");p&&(p.onclick=f=>{f.stopPropagation(),typeof window.speakText=="function"&&window.speakText(d.word)}),o.appendChild(h)})};c("all"),t.querySelectorAll(".summary-tab-btn").forEach(r=>{r.addEventListener("click",u=>{u.preventDefault(),t.querySelectorAll(".summary-tab-btn").forEach(d=>d.classList.remove("active")),r.classList.add("active"),c(r.dataset.tab)})})}restart(){const t=this.container.querySelector("#alchemist-modal-overlay");t&&t.style.setProperty("display","none","important"),this.start()}stopAndExit(){this.currentTarget&&this.currentTarget.fullWord&&(!this.correctWordsSet||!this.correctWordsSet.has(this.currentTarget.fullWord))&&typeof window.recordWordWrong=="function"&&window.recordWordWrong({word:this.currentTarget.fullWord,pinyin:this.currentTarget.pinyin,meaning:this.currentTarget.meaning}),this.isRunning=!1,this.isStopping=!0,this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null);const t=this.container.querySelector("#alchemist-modal-overlay");t&&t.style.setProperty("display","none","important"),typeof this.onExit=="function"&&this.onExit()}}class R{constructor(){this.ctx=null}init(){if(!this.ctx){const t=window.AudioContext||window.webkitAudioContext;t&&(this.ctx=new t)}}playTone(t,e,n,i=null,s=.18){try{if(this.init(),!this.ctx)return;this.ctx.state==="suspended"&&this.ctx.resume();const a=this.ctx.createOscillator(),o=this.ctx.createGain();a.type=e,a.frequency.setValueAtTime(t,this.ctx.currentTime),i&&a.frequency.exponentialRampToValueAtTime(i,this.ctx.currentTime+n),o.gain.setValueAtTime(s,this.ctx.currentTime),o.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+n),a.connect(o),o.connect(this.ctx.destination),a.start(),a.stop(this.ctx.currentTime+n)}catch{}}playSelect(){this.playTone(480,"sine",.09,680,.15)}playMatch(){this.playTone(523.25,"triangle",.18,659.25,.22),setTimeout(()=>{this.playTone(783.99,"sine",.25,1046.5,.25)},60)}playMismatch(){this.playTone(220,"sawtooth",.18,140,.16)}playPowerup(){this.playTone(400,"sine",.28,880,.22)}playBomb(){this.playTone(180,"sawtooth",.35,60,.3)}playWarning(){this.playTone(587.33,"sine",.12,880,.2)}playUrgentTick(){this.playTone(950,"triangle",.06,1200,.06)}playGameOver(){this.playTone(320,"sawtooth",.35,90,.35)}}const q=[{word:"苹果",pinyin:"píngguǒ",meaning:"quả táo"},{word:"香蕉",pinyin:"xiāngjiāo",meaning:"quả chuối"},{word:"西瓜",pinyin:"xīguā",meaning:"dưa hấu"},{word:"葡萄",pinyin:"pútao",meaning:"quả nho"},{word:"学校",pinyin:"xuéxiào",meaning:"trường học"},{word:"老师",pinyin:"lǎoshī",meaning:"giáo viên"},{word:"学生",pinyin:"xuéshēng",meaning:"học sinh"},{word:"朋友",pinyin:"péngyou",meaning:"bạn bè"},{word:"汉语",pinyin:"hànyǔ",meaning:"tiếng Hán"},{word:"谢谢",pinyin:"xièxie",meaning:"cảm ơn"},{word:"再见",pinyin:"zàijiàn",meaning:"tạm biệt"},{word:"喜欢",pinyin:"xǐhuan",meaning:"thích"},{word:"喝茶",pinyin:"hē chá",meaning:"uống trà"},{word:"吃饭",pinyin:"chī fàn",meaning:"ăn cơm"},{word:"中国",pinyin:"zhōngguó",meaning:"Trung Quốc"},{word:"高兴",pinyin:"gāoxìng",meaning:"vui vẻ"}];class O{constructor(t,e,n){if(this.container=t,this.rawWords=Array.isArray(e)&&e.length>=4?e:q,this.onExit=n,this.sfx=new R,this.rows=6,this.cols=8,this.grid=[],this.score=0,this.combo=0,this.maxCombo=0,this.timeLeft=100,this.pairsLeft=0,this.totalPairs=0,this.isPaused=!1,this.isRunning=!1,this.isStopping=!1,this.playMode=localStorage.getItem("mahjong_play_mode")||"practice",this.autoSpeech=localStorage.getItem("mahjong_auto_speech")!=="false",this.selectedTile=null,this.isResolvingMatch=!1,this.clearedWordsSet=new Set,this.hintCount=3,this.shuffleCount=3,this.bombCount=2,this.timerInterval=null,"speechSynthesis"in window)try{window.speechSynthesis.getVoices(),typeof window.speechSynthesis.onvoiceschanged<"u"&&(window.speechSynthesis.onvoiceschanged=()=>{try{window.speechSynthesis.getVoices()}catch{}})}catch{}this.renderLayout(),this.bindEvents()}renderLayout(){this.container.innerHTML=`
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
    `}bindEvents(){const t=this.container.querySelector("#mahjong-top-back-btn"),e=this.container.querySelector("#mahjong-back-hub-top-btn"),n=this.container.querySelector("#mahjong-pause-btn"),i=this.container.querySelector("#mahjong-exit-btn"),s=this.container.querySelector("#mahjong-modal-close-x"),a=this.container.querySelector("#mahjong-retry-btn"),o=this.container.querySelector("#mahjong-back-hub-btn"),c=this.container.querySelector("#mahjong-finish-btn"),r=this.container.querySelector("#tool-hint"),u=this.container.querySelector("#tool-shuffle"),d=this.container.querySelector("#tool-bomb"),l=this.container.querySelector("#mahjong-mode-toggle-btn");l&&l.addEventListener("click",p=>{p.preventDefault(),this.playMode=this.playMode==="practice"?"challenge":"practice",localStorage.setItem("mahjong_play_mode",this.playMode);const f=this.container.querySelector("#mahjong-mode-icon-text");f&&(f.innerHTML=this.playMode==="practice"?'<i class="fa-solid fa-infinity" style="color: #10b981;"></i> <span style="color:#10b981;">Kiểm tra</span>':'<i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span style="color:#fbbf24;">Thi đấu</span>'),this.updateHUD(),this.startTimers(),this.showToast(this.playMode==="practice"?"🎯 Chế độ Kiểm tra (♾️ Không giới hạn thời gian)":"🏆 Chế độ Thi đấu (⏱️ Đếm ngược thời gian)")});const h=this.container.querySelector("#mahjong-speech-toggle-btn");h&&h.addEventListener("click",p=>{p.preventDefault(),this.autoSpeech=!this.autoSpeech,localStorage.setItem("mahjong_auto_speech",this.autoSpeech?"true":"false");const f=this.container.querySelector("#mahjong-speech-icon"),m=this.container.querySelector("#mahjong-speech-text");f&&(f.className=`fa-solid ${this.autoSpeech?"fa-volume-high":"fa-volume-xmark"}`,f.style.color=this.autoSpeech?"#22c55e":"#94a3b8"),m&&(m.textContent=this.autoSpeech?"Đọc":"Tắt đọc"),this.showToast(this.autoSpeech?"🔊 Đã bật phát âm từ vựng":"🔇 Đã tắt phát âm")}),t&&t.addEventListener("click",()=>this.stopAndExit()),e&&e.addEventListener("click",()=>this.stopAndExit()),n&&n.addEventListener("click",()=>this.togglePause()),i&&i.addEventListener("click",()=>{this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),s&&s.addEventListener("click",()=>{this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),a&&a.addEventListener("click",()=>this.restart()),o&&o.addEventListener("click",()=>this.stopAndExit()),c&&c.addEventListener("click",()=>{this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),r&&r.addEventListener("click",()=>this.useHint()),u&&u.addEventListener("click",()=>this.useShuffle()),d&&d.addEventListener("click",()=>this.useBomb())}start(){this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.isStopping=!1,this.isRunning=!0,this.isPaused=!1,this.score=0,this.combo=0,this.maxCombo=0,this.timeLeft=100,this.hintCount=3,this.shuffleCount=3,this.bombCount=2,this.selectedTile=null,this.isResolvingMatch=!1,this.totalWordsCount=(this.rawWords||[]).length,this.totalLevels=Math.max(1,Math.ceil(this.totalWordsCount/12)),this.currentLevel=1,this.unplayedWordsPool=[...this.rawWords||[]].sort(()=>Math.random()-.5),this.totalUniqueWordsCleared=0,this.currentLevelNewWordsCount=0;const t=this.container.querySelector("#mahjong-modal-overlay");if(t&&t.style.setProperty("display","none","important"),"speechSynthesis"in window)try{window.speechSynthesis.getVoices();const n=new SpeechSynthesisUtterance("");window.speechSynthesis.speak(n)}catch{}const e=this.container.querySelector(".hud-timer");e&&e.classList.remove("timer-warning-60","timer-warning-30","timer-urgent-10"),this.initBoard(),this.updateHUD(),this.startTimers()}startTimers(){this.timerInterval&&clearInterval(this.timerInterval),this.playMode!=="practice"&&(this.timerInterval=setInterval(()=>{!this.isRunning||this.isPaused||(this.timeLeft--,this.handleTimeCountdownAlert(this.timeLeft),this.timeLeft<=0&&this.gameOver(!1),this.updateHUD())},1e3))}handleTimeCountdownAlert(t){const e=this.container.querySelector(".hud-timer");t===60?(this.sfx&&this.sfx.playWarning&&this.sfx.playWarning(),this.showToast("⏳ Còn 60 giây!"),e&&(e.classList.add("timer-warning-60"),setTimeout(()=>e&&e.classList.remove("timer-warning-60"),2e3))):t===30?(this.sfx&&this.sfx.playWarning&&this.sfx.playWarning(),this.showToast("⚠️ Còn 30 giây! Hãy tăng tốc!"),e&&e.classList.add("timer-warning-30")):t<=10&&t>=1&&(this.sfx&&this.sfx.playUrgentTick&&this.sfx.playUrgentTick(),e&&e.classList.add("timer-urgent-10"),this.showCenterCountdownTick(t))}showCenterCountdownTick(t){let e=this.container.querySelector(".game-center-countdown-tick");e||(e=document.createElement("div"),e.className="game-center-countdown-tick",(this.container.querySelector("#mahjong-board-container")||this.container).appendChild(e)),e.textContent=t,e.classList.remove("tick-anim"),e.offsetWidth,e.classList.add("tick-anim")}initBoard(){const t=this.rows-2,e=this.cols-2,i=t*e/2;if(!this.unplayedWordsPool||this.unplayedWordsPool.length===0){this.gameOver(!0);return}const s=this.unplayedWordsPool.splice(0,Math.min(i,this.unplayedWordsPool.length));this.currentLevelNewWordsCount=s.length;const a=[...s];let o=0;for(;a.length<i;){const r=this.rawWords[o%this.rawWords.length]||q[o%q.length];a.push(r),o++}this.totalPairs=i,this.pairsLeft=i;const c=[];for(let r=0;r<i;r++){const u=a[r],d="pair_"+r+"_"+Date.now(),l=u.word||u.hanzi||u.char||u.text||"汉字",h=u.pinyin||"hànzì",p=u.meaning||u.vietnamese||u.vi||"từ vựng";c.push({pairId:d,word:l,text:l,type:"hanzi",pinyin:h,meaning:p}),r%3===0?c.push({pairId:d,word:l,text:h,type:"pinyin",pinyin:h,meaning:p}):c.push({pairId:d,word:l,text:p,type:"meaning",pinyin:h,meaning:p})}c.sort(()=>.5-Math.random()),this.grid=[];for(let r=0;r<this.rows;r++){this.grid[r]=[];for(let u=0;u<this.cols;u++)if(r===0||r===this.rows-1||u===0||u===this.cols-1)this.grid[r][u]=null;else{const d=c.pop();this.grid[r][u]=d?{...d,r,c:u}:null}}this.ensureSolvableBoard(),this.renderBoard()}ensureSolvableBoard(){let t=this.findAnyValidPair(),e=0;for(;!t&&e<10;){const n=[];for(let i=1;i<this.rows-1;i++)for(let s=1;s<this.cols-1;s++)this.grid[i][s]&&n.push(this.grid[i][s]);n.sort(()=>.5-Math.random());for(let i=1;i<this.rows-1;i++)for(let s=1;s<this.cols-1;s++)if(this.grid[i][s]){const a=n.pop();a.r=i,a.c=s,this.grid[i][s]=a}t=this.findAnyValidPair(),e++}}renderBoard(){const t=this.container.querySelector("#mahjong-tiles-grid");if(t){t.style.gridTemplateColumns=`repeat(${this.cols-2}, 1fr)`,t.style.gridTemplateRows=`repeat(${this.rows-2}, 1fr)`,t.innerHTML="";for(let e=1;e<this.rows-1;e++)for(let n=1;n<this.cols-1;n++){const i=this.grid[e][n],s=document.createElement("button");if(s.type="button",s.id=`tile_${e}_${n}`,s.className=`mahjong-tile ${i?"type-"+i.type:"cleared"}`,i){const a=i.type==="hanzi"?"HÁN":i.type==="pinyin"?"PINYIN":"NGHĨA";s.innerHTML=`
            <span class="tile-inner-text">${i.text}</span>
            <span class="tile-type-tag">${a}</span>
          `,s.addEventListener("click",o=>{o.preventDefault(),this.handleTileClick(e,n)})}else s.disabled=!0;t.appendChild(s)}this.updateSelectionHighlights()}}handleTileClick(t,e){if(this.isResolvingMatch||!this.isRunning||this.isPaused)return;const n=this.grid[t][e];if(n)if(!this.selectedTile)this.sfx.playSelect(),this.selectedTile={r:t,c:e},this.updateSelectionHighlights();else{if(this.selectedTile.r===t&&this.selectedTile.c===e){this.sfx.playSelect(),this.selectedTile=null,this.updateSelectionHighlights();return}const i=this.selectedTile,s=this.grid[i.r][i.c];if(s&&s.pairId===n.pairId){const a=this.findOnetPath(i.r,i.c,t,e);a?this.handleMatch(i,{r:t,c:e},a):(this.sfx.playMismatch(),this.triggerTileShake(t,e),this.showToast("⚠️ Bị cản đường! Nối không quá 2 góc gập."),this.selectedTile={r:t,c:e},this.updateSelectionHighlights())}else this.sfx.playMismatch(),this.triggerTileShake(t,e),this.selectedTile={r:t,c:e},this.updateSelectionHighlights()}}triggerTileShake(t,e){const n=this.container.querySelector(`#tile_${t}_${e}`);n&&(n.classList.remove("shake-tile"),n.offsetWidth,n.classList.add("shake-tile"),setTimeout(()=>n.classList.remove("shake-tile"),380))}updateSelectionHighlights(){if(this.container.querySelectorAll(".mahjong-tile").forEach(t=>t.classList.remove("selected","hint-pulse")),this.selectedTile){const t=this.container.querySelector(`#tile_${this.selectedTile.r}_${this.selectedTile.c}`);t&&t.classList.add("selected")}}findOnetPath(t,e,n,i){if(this.canConnectDirect(t,e,n,i))return[{r:t,c:e},{r:n,c:i}];if(this.isEmptyCell(t,i)&&this.canConnectDirect(t,e,t,i)&&this.canConnectDirect(t,i,n,i))return[{r:t,c:e},{r:t,c:i},{r:n,c:i}];if(this.isEmptyCell(n,e)&&this.canConnectDirect(t,e,n,e)&&this.canConnectDirect(n,e,n,i))return[{r:t,c:e},{r:n,c:e},{r:n,c:i}];for(let s=0;s<this.cols;s++)if(!(s===e||s===i)&&this.isEmptyCell(t,s)&&this.isEmptyCell(n,s)&&this.canConnectDirect(t,e,t,s)&&this.canConnectDirect(t,s,n,s)&&this.canConnectDirect(n,s,n,i))return[{r:t,c:e},{r:t,c:s},{r:n,c:s},{r:n,c:i}];for(let s=0;s<this.rows;s++)if(!(s===t||s===n)&&this.isEmptyCell(s,e)&&this.isEmptyCell(s,i)&&this.canConnectDirect(t,e,s,e)&&this.canConnectDirect(s,e,s,i)&&this.canConnectDirect(s,i,n,i))return[{r:t,c:e},{r:s,c:e},{r:s,c:i},{r:n,c:i}];return null}isEmptyCell(t,e){return t<0||t>=this.rows||e<0||e>=this.cols?!0:this.grid[t][e]===null}canConnectDirect(t,e,n,i){if(t===n){const s=Math.min(e,i),a=Math.max(e,i);for(let o=s+1;o<a;o++)if(!this.isEmptyCell(t,o))return!1;return!0}if(e===i){const s=Math.min(t,n),a=Math.max(t,n);for(let o=s+1;o<a;o++)if(!this.isEmptyCell(o,e))return!1;return!0}return!1}handleMatch(t,e,n){this.isResolvingMatch=!0;const i=this.grid[t.r][t.c],s=this.grid[e.r][e.c];this.sfx.playMatch(),this.score+=25+this.combo*10,this.combo++,this.pairsLeft--,this.combo>this.maxCombo&&(this.maxCombo=this.combo);const a=i&&i.word||s&&s.word||(i&&i.type==="hanzi"?i.text:"")||(s&&s.type==="hanzi"?s.text:"")||i&&(i.hanzi||i.text)||s&&(s.hanzi||s.text)||"";a&&(this.clearedWordsSet.add(a),typeof window.recordWordMemorized=="function"&&window.recordWordMemorized({word:a,pinyin:(i==null?void 0:i.pinyin)||(s==null?void 0:s.pinyin),meaning:(i==null?void 0:i.meaning)||(s==null?void 0:s.meaning)}));const o=this.container.querySelector(`#tile_${t.r}_${t.c}`),c=this.container.querySelector(`#tile_${e.r}_${e.c}`);o&&o.classList.add("matched-glow"),c&&c.classList.add("matched-glow"),this.drawLaserPath(n),this.autoSpeech&&a&&this.speakWordInstant(a),setTimeout(()=>{o&&o.classList.add("matched-vanish"),c&&c.classList.add("matched-vanish")},180),setTimeout(()=>{this.clearLaserPath(),this.grid[t.r][t.c]=null,this.grid[e.r][e.c]=null,this.selectedTile=null,this.isResolvingMatch=!1,this.renderBoard(),this.updateHUD(),this.pairsLeft<=0?(this.totalUniqueWordsCleared+=this.currentLevelNewWordsCount,this.unplayedWordsPool&&this.unplayedWordsPool.length>0?(this.currentLevel++,this.sfx.playPowerup(),this.timeLeft=Math.min(150,this.timeLeft+50),this.hintCount=3,this.shuffleCount=3,this.bombCount=2,this.showToast(`🎉 XUẤT SẮC QUA MÀN ${this.currentLevel-1}! Sang Màn ${this.currentLevel}/${this.totalLevels} (${this.unplayedWordsPool.length} từ tiếp theo)... Đã hồi đầy đủ Trợ giúp!`),this.initBoard(),this.updateHUD()):this.gameOver(!0)):!this.findAnyValidPair()&&this.pairsLeft>0&&(this.showToast("🔄 Tự động xáo trộn cờ vì không còn đường đi!"),this.autoShuffleBoard())},380)}speakWordInstant(t){if(!t)return;const e=String(t).replace(/<[^>]*>/g,"").replace(/[\(\uff08][^\)\uff09]*[\)\uff09]/g,"").trim();if(e){if("speechSynthesis"in window)try{window.speechSynthesis.cancel();const n=new SpeechSynthesisUtterance(e);n.lang="zh-CN",n.rate=.95,n.pitch=1;const i=window.speechSynthesis.getVoices();if(i&&i.length>0){const s=i.find(a=>a.lang==="zh-CN"||a.lang==="zh"||a.lang&&a.lang.startsWith("zh"));s&&(n.voice=s)}window.speechSynthesis.speak(n);return}catch(n){console.warn("Mahjong speakWordInstant error:",n)}if(typeof window.speakWordInstant=="function")try{window.speakWordInstant(e);return}catch{}if(typeof window.speakText=="function")try{window.speakText(e)}catch{}}}getPointCoordinates(t,e){const n=this.container.querySelector("#mahjong-board-container"),i=this.container.querySelector("#mahjong-tiles-grid");if(!n||!i)return{x:0,y:0};const s=n.getBoundingClientRect(),a=i.getBoundingClientRect(),o=this.container.querySelector(`#tile_${t}_${e}`);if(o){const p=o.getBoundingClientRect();return{x:p.left+p.width/2-s.left,y:p.top+p.height/2-s.top}}const c=this.cols-2,r=this.rows-2,u=a.width/c,d=a.height/r;let l=0,h=0;return e===0?l=a.left-s.left-18:e===this.cols-1?l=a.right-s.left+18:l=a.left-s.left+(e-1+.5)*u,t===0?h=a.top-s.top-18:t===this.rows-1?h=a.bottom-s.top+18:h=a.top-s.top+(t-1+.5)*d,{x:l,y:h}}drawLaserPath(t){const e=this.container.querySelector("#mahjong-line-canvas"),n=this.container.querySelector("#mahjong-board-container");if(!e||!n||!t||t.length<2)return;const i=n.getBoundingClientRect();e.width=i.width,e.height=i.height;const s=e.getContext("2d"),a=t.map(o=>this.getPointCoordinates(o.r,o.c));s.clearRect(0,0,e.width,e.height),s.save(),s.beginPath(),a.forEach((o,c)=>{c===0?s.moveTo(o.x,o.y):s.lineTo(o.x,o.y)}),s.lineCap="round",s.lineJoin="round",s.lineWidth=14,s.strokeStyle="rgba(56, 189, 248, 0.4)",s.shadowColor="#38bdf8",s.shadowBlur=18,s.stroke(),s.restore(),s.save(),s.beginPath(),a.forEach((o,c)=>{c===0?s.moveTo(o.x,o.y):s.lineTo(o.x,o.y)}),s.lineCap="round",s.lineJoin="round",s.lineWidth=5,s.strokeStyle="#22d3ee",s.shadowColor="#06b6d4",s.shadowBlur=8,s.stroke(),s.restore(),s.save(),s.beginPath(),a.forEach((o,c)=>{c===0?s.moveTo(o.x,o.y):s.lineTo(o.x,o.y)}),s.lineCap="round",s.lineJoin="round",s.lineWidth=2.2,s.strokeStyle="#ffffff",s.stroke(),s.restore(),a.forEach(o=>{s.save(),s.beginPath(),s.arc(o.x,o.y,6,0,Math.PI*2),s.fillStyle="#ffffff",s.shadowColor="#38bdf8",s.shadowBlur=12,s.fill(),s.restore()})}clearLaserPath(){const t=this.container.querySelector("#mahjong-line-canvas");t&&t.getContext("2d").clearRect(0,0,t.width,t.height)}findAnyValidPair(){for(let t=1;t<this.rows-1;t++)for(let e=1;e<this.cols-1;e++){const n=this.grid[t][e];if(n)for(let i=1;i<this.rows-1;i++)for(let s=1;s<this.cols-1;s++){if(t===i&&e===s)continue;const a=this.grid[i][s];if(!a||n.pairId!==a.pairId)continue;const o=this.findOnetPath(t,e,i,s);if(o)return{tile1:{r:t,c:e},tile2:{r:i,c:s},path:o}}}return null}useHint(){if(!this.isRunning||this.isPaused)return;if(this.hintCount<=0){this.showToast("Đã dùng hết Kính Lúp gợi ý!");return}const t=this.findAnyValidPair();if(t){this.hintCount--,this.sfx.playPowerup();const e=this.container.querySelector(`#tile_${t.tile1.r}_${t.tile1.c}`),n=this.container.querySelector(`#tile_${t.tile2.r}_${t.tile2.c}`);e&&e.classList.add("hint-pulse"),n&&n.classList.add("hint-pulse"),this.updateHUD(),this.showToast("🔍 Đã tìm thấy 1 cặp có thể nối!")}else this.showToast("Không còn cặp nối trực tiếp, hãy dùng Gió Lốc đảo bài!")}useShuffle(){if(!(!this.isRunning||this.isPaused)){if(this.shuffleCount<=0){this.showToast("Đã dùng hết Gió Lốc đảo bài!");return}this.shuffleCount--,this.sfx.playPowerup(),this.autoShuffleBoard(),this.updateHUD(),this.showToast("🌪️ Đã xáo trộn lại toàn bộ bàn cờ!")}}autoShuffleBoard(){const t=[];for(let e=1;e<this.rows-1;e++)for(let n=1;n<this.cols-1;n++)this.grid[e][n]&&t.push(this.grid[e][n]);t.sort(()=>.5-Math.random());for(let e=1;e<this.rows-1;e++)for(let n=1;n<this.cols-1;n++)if(this.grid[e][n]){const i=t.pop();i.r=e,i.c=n,this.grid[e][n]=i}this.ensureSolvableBoard(),this.selectedTile=null,this.renderBoard()}useBomb(){if(!(!this.isRunning||this.isPaused)){if(this.bombCount<=0){this.showToast("Đã dùng hết Bom Thần Kỳ!");return}for(let t=1;t<this.rows-1;t++)for(let e=1;e<this.cols-1;e++){const n=this.grid[t][e];if(n)for(let i=1;i<this.rows-1;i++)for(let s=1;s<this.cols-1;s++){if(t===i&&e===s)continue;const a=this.grid[i][s];if(a&&n.pairId===a.pairId){this.bombCount--,this.sfx.playBomb(),this.handleMatch({r:t,c:e},{r:i,c:s},[{r:t,c:e},{r:i,c:s}]),this.showToast("💣 Bom Thần Kỳ đã hóa giải 1 cặp!");return}}}}}updateHUD(){const t=this.container.querySelector("#mahjong-score-val"),e=this.container.querySelector("#mahjong-pairs-val"),n=this.container.querySelector("#mahjong-timer-val"),i=this.container.querySelector("#mahjong-level-badge"),s=this.container.querySelector("#mahjong-progress-val"),a=this.container.querySelector("#badge-hint"),o=this.container.querySelector("#badge-shuffle"),c=this.container.querySelector("#badge-bomb");if(t&&(t.textContent=this.score),e&&(e.textContent=`${this.totalPairs-this.pairsLeft}/${this.totalPairs} cặp (Còn ${this.pairsLeft} cặp)`),i&&(i.textContent=`MÀN ${this.currentLevel}/${this.totalLevels}`),s){const r=Math.floor((this.totalPairs-this.pairsLeft)*(this.currentLevelNewWordsCount/this.totalPairs)),u=Math.min(this.totalWordsCount,this.totalUniqueWordsCleared+r);s.textContent=`${u}/${this.totalWordsCount} từ`}if(n)if(this.playMode==="practice")n.textContent="♾️ Vô hạn";else{const r=Math.floor(this.timeLeft/60),u=this.timeLeft%60;n.textContent=`${String(r).padStart(2,"0")}:${String(u).padStart(2,"0")}`}a&&(a.textContent=`x${this.hintCount}`),o&&(o.textContent=`x${this.shuffleCount}`),c&&(c.textContent=`x${this.bombCount}`)}showToast(t){typeof window.showToast=="function"&&window.showToast(t)}togglePause(){this.isPaused=!this.isPaused;const t=this.container.querySelector("#mahjong-pause-btn");t&&(t.innerHTML=`<i class="fa-solid fa-${this.isPaused?"play":"pause"}"></i>`),this.showToast(this.isPaused?"Đã tạm dừng game ⏸":"Tiếp tục chơi ▶️")}gameOver(t){this.isRunning=!1,this.timerInterval&&clearInterval(this.timerInterval);const e=this.container.querySelector("#mahjong-modal-overlay"),n=this.container.querySelector("#mahjong-result-icon"),i=this.container.querySelector("#mahjong-result-title"),s=this.container.querySelector("#mahjong-result-desc"),a=this.container.querySelector("#mahjong-res-score"),o=this.container.querySelector("#mahjong-res-combo"),c=this.container.querySelector("#mahjong-res-pairs");if(e){e.style.setProperty("display","flex","important"),t?this.sfx&&this.sfx.playMatch&&this.sfx.playMatch():this.sfx&&this.sfx.playGameOver&&this.sfx.playGameOver(),n&&(n.textContent=t?"👑":"⏰"),i&&(i.textContent=t?"Đại Sư Mạt Chược - Hoàn Thành Xuất Sắc!":"Hết Giờ - Kết Thúc Lượt Chơi!"),s&&(s.textContent=t?`Bạn đã xuất sắc vượt qua toàn bộ ${this.totalLevels} Màn chơi và hoàn thành ${this.totalWordsCount}/${this.totalWordsCount} từ vựng!`:"Hãy tận dụng Kính Lúp và Gió Lốc để nối nhanh hơn nhé!"),a&&(a.textContent=this.score),o&&(o.textContent=this.maxCombo),c&&(c.textContent=`${this.totalWordsCount}/${this.totalWordsCount} từ (${this.currentLevel} Màn)`);const r=e.querySelector("#mahjong-words-summary-wrap");r&&this.renderWordSummaryList(r,this.rawWords,this.clearedWordsSet);const u=e.querySelector("#mahjong-modal-close-x"),d=e.querySelector("#mahjong-retry-btn"),l=e.querySelector("#mahjong-back-hub-btn"),h=e.querySelector("#mahjong-finish-btn");u&&(u.onclick=p=>{p.preventDefault(),p.stopPropagation(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}),d&&(d.onclick=p=>{p.preventDefault(),p.stopPropagation(),this.restart()}),l&&(l.onclick=p=>{p.preventDefault(),p.stopPropagation(),this.stopAndExit()}),h&&(h.onclick=p=>{p.preventDefault(),p.stopPropagation(),this.stopAndExit(),typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()})}}renderWordSummaryList(t,e,n){if(!t)return;const i=e.length,s=e.filter(r=>n.has(r.word)).length,a=i-s;t.innerHTML=`
      <div class="game-results-word-summary">
        <div class="summary-tabs-header">
          <button type="button" class="summary-tab-btn active" data-tab="all">
            <i class="fa-solid fa-list-check"></i> Tất cả (${i})
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
    `;const o=t.querySelector(".summary-words-list"),c=r=>{o.innerHTML="";const u=e.filter(d=>{const l=n.has(d.word);return r==="correct"?l:r==="wrong"?!l:!0});if(u.length===0){o.innerHTML='<div style="text-align: center; color: #94a3b8; padding: 20px; font-size: 0.85rem;">Không có từ vựng nào trong mục này.</div>';return}u.forEach(d=>{const l=n.has(d.word),h=document.createElement("div");h.className=`summary-word-card ${l?"is-correct":"is-wrong"}`,h.innerHTML=`
          <div class="sw-badge ${l?"badge-correct":"badge-wrong"}">
            <i class="fa-solid fa-${l?"check":"xmark"}"></i> ${l?"Đúng":"Sai"}
          </div>
          <div class="sw-main">
            <div class="sw-hanzi">${d.word}</div>
            <div class="sw-pinyin">${d.pinyin?`[ ${d.pinyin} ]`:""}</div>
            <div class="sw-meaning">${d.meaning||""}</div>
          </div>
          <button type="button" class="sw-speak-btn" title="Nghe phát âm">
            <i class="fa-solid fa-volume-high"></i>
          </button>
        `;const p=h.querySelector(".sw-speak-btn");p&&(p.onclick=f=>{f.stopPropagation(),this.speakWordInstant(d.word)}),o.appendChild(h)})};c("all"),t.querySelectorAll(".summary-tab-btn").forEach(r=>{r.addEventListener("click",u=>{u.preventDefault(),t.querySelectorAll(".summary-tab-btn").forEach(d=>d.classList.remove("active")),r.classList.add("active"),c(r.dataset.tab)})})}restart(){const t=this.container.querySelector("#mahjong-modal-overlay");t&&t.style.setProperty("display","none","important"),this.start()}stopAndExit(){if(this.grid&&typeof window.recordWordWrong=="function"){const e=new Map;for(let n=0;n<this.rows;n++)for(let i=0;i<this.cols;i++){const s=this.grid[n]?this.grid[n][i]:null;s&&s.word&&(!this.clearedWordsSet||!this.clearedWordsSet.has(s.word))&&e.set(s.word,s)}e.forEach(n=>{window.recordWordWrong({word:n.word,pinyin:n.pinyin,meaning:n.meaning})})}this.isRunning=!1,this.isStopping=!0,this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null);const t=this.container.querySelector("#mahjong-modal-overlay");t&&t.style.setProperty("display","none","important"),typeof this.onExit=="function"&&this.onExit()}}class j{constructor(t,e={}){this.container=t;const n=e.words||[];this.words=n.map(i=>{if(!i)return null;const s=(i.word||i.hanzi||i.text||"").trim(),a=(i.pinyin||"").trim(),o=(i.meaning||i.vietnamese||(Array.isArray(i.translations)?i.translations.join(", "):"")||"").trim();return{...i,id:i.id||i._id||s,_id:i._id,word:s,pinyin:a,meaning:o}}).filter(i=>i&&i.word&&(i.meaning||i.pinyin)),this.notebookTitle=e.title||"Sổ tay Từ Vựng",this.notebookDesc=e.desc||"Ôn tập tương tác trực tiếp",this.notebookKey=e.notebookKey||"",this.hskVersion=e.hskVersion||"3.0",this.currentUser=e.currentUser||null,this.onExit=e.onExit||(()=>{}),this.currentGameEngine=null,this.activeGameType=null,this.messageListener=null,this.render()}render(){this.container.innerHTML=`
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
            <span class="beta-pill" style="background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.4); color: #fbbf24;"><i class="fa-solid fa-wand-magic-sparkles"></i> Đầy đủ 5 Trò Chơi Ôn Luyện (Miễn Phí)</span>
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
          <h3>Chọn 1 trong 5 trò chơi để bắt đầu ôn luyện từ vựng</h3>
          <p>Học tập và rèn luyện phản xạ nhẹ nhàng từ <strong>${this.notebookTitle}</strong>, không tính điểm xếp hạng hay khóa cấp!</p>
        </div>

        <div class="games-selector-grid-6">
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

          <!-- CARD GAME 2: ALCHEMIST -->
          <div class="game-choice-card card-alchemist" id="btn-choose-alchemist" style="cursor: pointer;">
            <div class="card-tag">⚗️ CHIẾT TỰ & BỘ THỦ • 📱 CHẠM CẢM ỨNG SIÊU MƯỢT</div>
            <div class="card-icon-hero">⚗️ ✨</div>
            <h3 class="card-title">Lò Luyện Chiết Tự</h3>
            <p class="card-desc">
              Trở thành nhà giả kim! Chọn các <strong>Bộ thủ nguyên liệu</strong> nạp vào vạc luyện kim thần kỳ để hợp nhất chế tạo ra chữ Hán mục tiêu.
            </p>
            <div class="card-features">
              <span><i class="fa-solid fa-gem"></i> Nhớ sâu gốc rễ bộ thủ</span>
              <span><i class="fa-solid fa-wand-magic-sparkles"></i> Luyện hợp thể chữ</span>
            </div>
            <button type="button" class="btn btn-primary game-launch-btn" style="background: linear-gradient(135deg, #9333ea, #7e22ce); color: #ffffff;">
              Chơi Luyện Chữ <i class="fa-solid fa-play"></i>
            </button>
          </div>

          <!-- CARD GAME 3: SNAKE -->
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

          <!-- CARD GAME 4: PHI DAO (CANNON) -->
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
    `}bindHubEvents(){const t=this.container.querySelector("#games-hub-back-btn");t&&t.addEventListener("click",i=>{i.preventDefault(),this.exitHub()});const e=this.container.querySelector("#btn-choose-quiz");e&&e.addEventListener("click",i=>{i.preventDefault(),this.launchGame("quiz")}),[{id:"#btn-choose-cannon",type:"cannon"},{id:"#btn-choose-snake",type:"snake"},{id:"#btn-choose-alchemist",type:"alchemist"},{id:"#btn-choose-mahjong",type:"mahjong"}].forEach(i=>{const s=this.container.querySelector(i.id);s&&s.addEventListener("click",a=>{a.preventDefault(),this.launchGame(i.type)})})}launchGame(t){if(!(typeof window.isUserLoggedIn=="function"?window.isUserLoggedIn():this.currentUser&&this.currentUser.email)){typeof window.openLoginPrompt=="function"?window.openLoginPrompt("chơi Đấu Trường Game",()=>this.launchGame(t)):typeof window.openAuthRequiredModal=="function"&&window.openAuthRequiredModal();return}if(this.words.length<2){typeof window.showToast=="function"&&window.showToast("Cần ít nhất 2 từ vựng trong sổ tay này để chơi game!",!0);return}const n=this.container.querySelector("#games-hub-content");if(!n)return;if(this.activeGameType=t,t==="quiz"){try{Array.isArray(this.words)&&this.words.length>0&&(sessionStorage.setItem("notebook_quiz_custom_words",JSON.stringify(this.words)),sessionStorage.setItem("notebook_quiz_custom_title",this.title||"Ôn Tập Sổ Tay"))}catch{}const a=new URLSearchParams;a.set("source","notebook"),a.set("no_score","true"),this.notebookKey&&(a.set("notebook",this.notebookKey),this.notebookKey.startsWith("hsk:")?a.set("level",this.notebookKey.replace("hsk:","")):this.notebookKey.startsWith("yct:")?a.set("level","yct"+this.notebookKey.replace("yct:","")):isNaN(this.notebookKey)||a.set("level",this.notebookKey)),this.hskVersion&&a.set("version",this.hskVersion),n.innerHTML=`
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
      `;const o=n.querySelector("#btn-quiz-return-hub");o&&(o.onclick=r=>{r.preventDefault(),this.returnToSelector()});const c=n.querySelector("#btn-quiz-exit-all");c&&(c.onclick=r=>{r.preventDefault(),this.exitHub()}),this.messageListener||(this.messageListener=r=>{r.data&&(r.data.type==="CLOSE_GAME_IFRAME"||r.data.type==="EXIT_GAME")&&this.returnToSelector()},window.addEventListener("message",this.messageListener));return}n.innerHTML='<div id="game-active-viewport" class="game-active-viewport"></div>';const i=n.querySelector("#game-active-viewport"),s=()=>this.returnToSelector();t==="cannon"?this.currentGameEngine=new D(i,this.words,s):t==="snake"?this.currentGameEngine=new z(i,this.words,s):t==="alchemist"?this.currentGameEngine=new G(i,this.words,s):t==="mahjong"&&(this.currentGameEngine=new O(i,this.words,s)),this.currentGameEngine&&this.currentGameEngine.start&&this.currentGameEngine.start()}returnToSelector(){const t=this.currentGameEngine;if(this.currentGameEngine=null,this.activeGameType=null,t&&t.stopAndExit)try{t.stopAndExit()}catch(e){console.warn("Error stopping engine on returnToSelector:",e)}this.messageListener&&(window.removeEventListener("message",this.messageListener),this.messageListener=null),this.render()}exitHub(){const t=this.currentGameEngine;if(this.currentGameEngine=null,this.activeGameType=null,t&&t.stopAndExit)try{t.stopAndExit()}catch(e){console.warn("Error stopping engine on exitHub:",e)}if(this.messageListener&&(window.removeEventListener("message",this.messageListener),this.messageListener=null),this.onExit)try{this.onExit()}catch(e){console.warn("Error calling onExit:",e)}typeof window.exitNotebookGamesHub=="function"&&window.exitNotebookGamesHub()}}export{j as N};
