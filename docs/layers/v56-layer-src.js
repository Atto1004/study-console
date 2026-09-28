/* ============================================================
   V56 LAYER — 학습 탭 = 로비(오버워치식 미래 온라인 공간) (BUILD 2026-09-28.88)
   대표님 2026-09-28: 「학습하기 UI 공간은 오버워치 같은 미래지향적인 온라인 공간 느낌으로」.
   ① #v-study 를 어두운 발광 패널 공간으로(격자·입자 배경, 반투명 패널, 시안·주황 발광선) — 기존 카드(V47 커리큘럼·V49 시험 대비·V50 따라가기·V52 노트)는 그대로 두고 어둡게 재스킨
   ② 맨 위 「플레이어 카드」: 레벨 링(XP) · 연속일 · 하트 · 호감도 + 다음 미션(수업 따라가기의 첫 「교실 열기」) + 팔짱 낀 김주영 스앵님(힉스필드 pose-cross)
   ③ 끄기: ?lobby=off 또는 localStorage mc-lobby=off. 동작 줄이기면 배경 애니메이션 정지
   ============================================================ */
(function(){
  var V56=window.V56={}; var $=function(s,el){ return (el||document).querySelector(s); }, $$=function(s,el){ return Array.prototype.slice.call((el||document).querySelectorAll(s)); };
  var esc=function(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };
  V56.off=function(){ try{ return /[?&]lobby=off\b/.test(location.search)||localStorage.getItem("mc-lobby")==="off"; }catch(e){ return false; } };
  V56.T=function(){ try{ return JSON.parse(localStorage.getItem("mc-tutor")||"null")||{}; }catch(e){ return {}; } };
  V56.POSE="notes/classroom/assets/tutor/pose-cross.png";
  /* 다음 미션 = 화면의 「교실 열기」 버튼 중 첫 번째(수업 따라가기가 밀린 회차부터 세운다) — 그 카드의 과목 이름과 회차 줄을 읽는다 */
  V56.mission=function(){
    var btn=$$("#v-study button").filter(function(b){ return /교실 열기/.test(b.textContent||""); })[0]; if(!btn) return null;
    /* 과목 이름 = 「교실 열기」 버튼 하나만 품는 가장 가까운 조상 블록의 첫 제목(수업 따라가기 카드는 과목 여러 개를 품으므로 카드 제목을 쓰면 안 된다) */
    var card=btn.closest(".card")||btn.closest("section")||btn.parentNode, name="", line="", blk=btn.parentNode;
    while(blk&&blk!==card&&blk!==document.body){ var n=$$("button",blk).filter(function(b){ return /교실 열기/.test(b.textContent||""); }).length; var h0=blk.querySelector("h3,h4,b,strong,.v50-name"); if(n===1&&h0&&(h0.textContent||"").trim()&&!/교실 열기|교재/.test(h0.textContent)){ name=(h0.textContent||"").trim(); if(blk.parentNode&&blk.parentNode!==card&&$$("button",blk.parentNode).filter(function(b){ return /교실 열기/.test(b.textContent||""); }).length===1){ blk=blk.parentNode; continue; } break; } blk=blk.parentNode; }
    if(!name&&card){ var h=card.querySelector("h3,h2,.v50-name,b"); name=h?(h.textContent||"").trim():""; }
    var row=btn.parentNode; while(row&&row!==card&&(row.textContent||"").length<8) row=row.parentNode;
    var t=(row&&row.textContent||"").replace(/\s+/g," ").trim(); var m=/(\d{1,2}\/\d{1,2}\([^)]+\))\s*·?\s*([^]*?)\s*교실 열기/.exec(t); if(m){ line=m[1]+" · "+m[2].replace(/다음 따라갈 회차/,"").trim(); } else line=t.slice(0,60);
    var min=/약 (\d+)분/.exec(t); return {btn:btn,name:name.slice(0,20),line:line.slice(0,70),min:min?min[1]:""};
  };
  V56.heroHTML=function(){
    var T=V56.T(), xp=+T.xp||0, lv=1+Math.floor(xp/150), pct=Math.round((xp%150)/150*100), streak=+T.streak||0, hearts=(T.hearts==null?3:+T.hearts), aff=(T.aff==null?20:+T.aff);
    var ms=V56.mission(); var r=44, c=2*Math.PI*r, off=c*(1-pct/100);
    return '<div class="ow-hero"><div class="ow-grid"></div><i class="ow-p p1"></i><i class="ow-p p2"></i><i class="ow-p p3"></i><i class="ow-p p4"></i>'+
      '<div class="ow-l"><div class="ow-tag">LOBBY · 학습 공간</div><div class="ow-mhead"><img src="notes/classroom/assets/tutor/neutral.png" alt="" decoding="async" onerror="this.style.display=\'none\'"><b>김주영 스앵님</b><span>Lv '+lv+' · '+xp+' XP</span></div>'+
        '<div class="ow-pl"><svg class="ow-ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="'+r+'" class="bg"/><circle cx="50" cy="50" r="'+r+'" class="fg" style="stroke-dasharray:'+c.toFixed(1)+';stroke-dashoffset:'+off.toFixed(1)+'"/><text x="50" y="46" text-anchor="middle" class="lv">Lv '+lv+'</text><text x="50" y="62" text-anchor="middle" class="xp">'+xp+' XP</text></svg>'+
          '<div class="ow-stats"><span class="ow-st"><b>'+streak+'</b>연속일</span><span class="ow-st"><b>'+hearts+'/3</b>하트</span><span class="ow-st"><b>'+aff+'</b>호감도</span><span class="ow-st"><b>'+(150-xp%150)+'</b>다음 레벨까지</span></div></div>'+
        '<div class="ow-mis"><div class="ow-mt">다음 미션</div>'+(ms?'<div class="ow-mn">'+esc(ms.name||"수업 따라가기")+'</div><div class="ow-ml">'+esc(ms.line)+(ms.min?' <small>약 '+esc(ms.min)+'분</small>':'')+'</div><button type="button" class="ow-cta" id="v56Go">교실 열기 <span>▶</span></button>':'<div class="ow-mn">오늘은 미션이 없어요</div><div class="ow-ml">자료가 들어오면 스앵님이 정리해서 올려 둘게요.</div>')+'</div>'+
      '</div><div class="ow-r"><div class="ow-glow"></div><img src="'+V56.POSE+'" alt="" decoding="async" draggable="false" onerror="this.style.display=\'none\'"><div class="ow-nm">김주영 스앵님</div></div></div>';
  };
  V56.apply=function(){
    var v=$("#v-study"); if(!v) return;
    if(V56.off()){ v.classList.remove("ow"); var old=$("#v56Hero"); if(old) old.remove(); return; }
    v.classList.add("ow"); var hero=$("#v56Hero"); if(!hero){ hero=document.createElement("div"); hero.id="v56Hero"; v.insertBefore(hero,v.firstChild); }
    hero.innerHTML=V56.heroHTML(); var go=$("#v56Go"); if(go) go.onclick=function(){ var ms=V56.mission(); if(ms&&ms.btn) ms.btn.click(); };
  };
  if(typeof renderStudy==="function"){ var _rs=renderStudy; renderStudy=function(){ _rs.apply(this,arguments); try{ V56.apply(); }catch(e){ if(window.console) console.warn("V56",e); } }; }
  window.addEventListener("storage",function(e){ if(e&&e.key==="mc-tutor"&&$("#v56Hero")){ try{ V56.apply(); }catch(e2){} } });
  /* ---------- CSS ---------- */
  var css=[
    "#v-study.ow{background:radial-gradient(900px 420px at 15% -10%,rgba(53,199,255,.18),transparent 60%),radial-gradient(700px 380px at 105% 10%,rgba(255,138,61,.16),transparent 60%),linear-gradient(180deg,#0A1120 0%,#0E1730 55%,#0B1424 100%);color:#E6ECFA;border-radius:22px;padding:18px 18px 26px;position:relative;overflow:hidden;box-shadow:0 20px 60px rgba(5,10,25,.45)}",
    "#v-study.ow::before{content:\"\";position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(53,199,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(53,199,255,.07) 1px,transparent 1px);background-size:44px 44px;mask-image:linear-gradient(180deg,rgba(0,0,0,.9),rgba(0,0,0,.15) 60%,transparent);-webkit-mask-image:linear-gradient(180deg,rgba(0,0,0,.9),rgba(0,0,0,.15) 60%,transparent);animation:owgrid 24s linear infinite}",
    "@keyframes owgrid{to{background-position:44px 44px,44px 44px}}",
    "#v-study.ow>*{position:relative}",
    /* 로비 안에서는 앱 색 토큰 자체를 어둡게 — var(--ink-2) 같은 인라인·하위 규칙까지 따라온다 */
    "#v-study.ow{--ink:#E6ECFA;--ink-2:#C9D3EA;--ink-3:#9FB0D0;--surface:rgba(16,24,44,.72);--surface-2:rgba(255,255,255,.06);--line:rgba(255,255,255,.12);--bg:transparent}",
    "#v-study.ow .hint{background:none;border:0;padding:0;color:#AEBBD6}#v-study.ow .hint b{color:#fff}",   /* 안내 문구는 글자만 — 테두리 상자가 디버그 화면처럼 보였다(오타 디자인 1차 R7) */
    /* 플레이어 카드 */
    ".ow-hero{position:relative;overflow:hidden;border-radius:18px;padding:22px 24px 18px;margin:0 0 16px;background:linear-gradient(135deg,rgba(20,32,60,.92),rgba(12,20,40,.88));border:1px solid rgba(53,199,255,.22);box-shadow:0 0 0 1px rgba(53,199,255,.06) inset,0 0 40px rgba(53,199,255,.10),0 16px 40px rgba(0,0,0,.35);display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:18px;align-items:end;clip-path:polygon(0 0,calc(100% - 26px) 0,100% 26px,100% 100%,26px 100%,0 calc(100% - 26px))}",
    ".ow-hero::after{content:\"\";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,#35C7FF 30%,#FF8A3D 70%,transparent);opacity:.9}",
    ".ow-grid{position:absolute;inset:0;pointer-events:none;background:radial-gradient(500px 220px at 80% 100%,rgba(255,138,61,.16),transparent 70%)}",
    ".ow-p{position:absolute;z-index:0;width:6px;height:6px;border-radius:50%;background:#35C7FF;box-shadow:0 0 12px #35C7FF;opacity:.7;animation:owfloat 9s ease-in-out infinite;pointer-events:none}.ow-p.p1{left:34%;top:5%}.ow-p.p2{left:52%;top:3%;animation-delay:-3s;background:#FF8A3D;box-shadow:0 0 12px #FF8A3D}.ow-p.p3{right:3%;top:58%;animation-delay:-6s;width:4px;height:4px}.ow-p.p4{right:29%;top:34%;animation-delay:-1.5s;width:4px;height:4px;background:#FF8A3D;box-shadow:0 0 10px #FF8A3D}",
    "@keyframes owfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}",
    ".ow-l{min-width:0;position:relative;z-index:1}.ow-tag{font-family:var(--font-num,Inter,sans-serif);font-weight:700;font-size:11px;letter-spacing:.18em;color:#35C7FF;text-transform:uppercase;margin-bottom:12px}",
    ".ow-pl{display:flex;align-items:center;gap:16px;margin-bottom:16px}.ow-ring{width:104px;height:104px;flex:0 0 104px;filter:drop-shadow(0 0 10px rgba(53,199,255,.35))}.ow-ring .bg{fill:none;stroke:rgba(255,255,255,.10);stroke-width:8}.ow-ring .fg{fill:none;stroke:#35C7FF;stroke-width:8;stroke-linecap:round;transform:rotate(-90deg);transform-origin:50% 50%;transition:stroke-dashoffset .6s}.ow-ring .lv{font-family:var(--font-head,\"Gothic A1\",sans-serif);font-weight:800;font-size:16px;fill:#fff}.ow-ring .xp{font-family:var(--font-num,Inter,sans-serif);font-weight:600;font-size:9px;fill:#9FB0D0;letter-spacing:.06em}",
    ".ow-stats{display:flex;gap:8px;flex-wrap:wrap}.ow-st{display:inline-flex;flex-direction:column;align-items:flex-start;padding:8px 12px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.10);font-size:11px;color:#9FB0D0;min-width:78px}.ow-st b{font-family:var(--font-num,Inter,sans-serif);font-weight:700;font-size:18px;color:#fff;line-height:1.1}",
    ".ow-mis{padding:14px 16px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,138,61,.28);box-shadow:0 0 24px rgba(255,138,61,.10) inset}.ow-mt{font-family:var(--font-num,Inter,sans-serif);font-weight:700;font-size:11px;letter-spacing:.16em;color:#FF8A3D;text-transform:uppercase}.ow-mn{font-family:var(--font-head,\"Gothic A1\",sans-serif);font-weight:800;font-size:20px;color:#fff;margin:4px 0 2px}.ow-ml{font-size:13.5px;color:#C9D3EA;margin-bottom:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ow-ml small{color:#9FB0D0}",
    ".ow-cta{font:inherit;font-weight:800;font-size:15px;color:#04121F;background:linear-gradient(90deg,#35C7FF,#6FE0FF);border:0;border-radius:12px;padding:12px 22px;cursor:pointer;box-shadow:0 4px 0 #1B8DB8,0 0 18px rgba(53,199,255,.3);display:inline-flex;align-items:center;gap:10px;min-height:46px}.ow-cta span{font-size:12px}.ow-cta:hover{filter:brightness(1.06)}.ow-cta:active{transform:translateY(3px);box-shadow:0 1px 0 #1B8DB8}",
    ".ow-r{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;min-height:280px}.ow-r img{height:300px;width:auto;position:relative;filter:drop-shadow(0 10px 20px rgba(0,0,0,.5));-webkit-user-select:none;user-select:none}.ow-glow{position:absolute;left:50%;bottom:24px;width:220px;height:220px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(circle,rgba(53,199,255,.35),rgba(53,199,255,0) 65%);filter:blur(4px)}.ow-nm{position:absolute;bottom:2px;left:50%;transform:translateX(-50%);font-family:var(--font-num,Inter,sans-serif);font-weight:700;font-size:11px;letter-spacing:.12em;color:#9FB0D0;background:rgba(10,17,32,.8);padding:3px 10px;border-radius:999px;border:1px solid rgba(53,199,255,.25);white-space:nowrap}",
    /* 기존 카드 재스킨 */
    "#v-study.ow .card{background:rgba(16,24,44,.72);border:1px solid rgba(88,140,255,.18);color:#E6ECFA;box-shadow:0 0 0 1px rgba(53,199,255,.05) inset,0 10px 30px rgba(0,0,0,.35);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}",
    "#v-study.ow .card-h{border-color:rgba(255,255,255,.08)}#v-study.ow .card-h h3,#v-study.ow h1,#v-study.ow h2,#v-study.ow h3{color:#fff}#v-study.ow .hs,#v-study.ow .hint,#v-study.ow .smut,#v-study.ow .sub,#v-study.ow small{color:#9FB0D0}",
    "#v-study.ow .btn{background:rgba(255,255,255,.06);color:#E6ECFA;border-color:rgba(255,255,255,.14)}#v-study.ow .btn.a,#v-study.ow .btn.p{background:#35C7FF;color:#04121F;border-color:#35C7FF;box-shadow:0 0 16px rgba(53,199,255,.35)}#v-study.ow .btn.q{background:transparent}",
    "#v-study.ow .chip{background:rgba(255,255,255,.08);color:#E6ECFA;border-color:rgba(255,255,255,.12)}#v-study.ow .chip.crit{background:rgba(217,52,43,.25);color:#FFB4AE}#v-study.ow .chip.warn{background:rgba(255,138,61,.22);color:#FFC9A3}#v-study.ow .chip.ok,#v-study.ow .chip.acc{background:rgba(53,199,255,.18);color:#9FE4FF}",
    "#v-study.ow table{color:#E6ECFA}#v-study.ow th{color:#9FB0D0;border-color:rgba(255,255,255,.08)}#v-study.ow td{border-color:rgba(255,255,255,.06)}#v-study.ow .bar{background:rgba(255,255,255,.12)}#v-study.ow a{color:#6FE0FF}",
    "#v-study.ow input,#v-study.ow select,#v-study.ow textarea{background:rgba(255,255,255,.06);color:#E6ECFA;border-color:rgba(255,255,255,.14)}",
    ".ow-mhead{display:none;align-items:center;gap:10px;margin:0 0 10px}.ow-mhead img{width:40px;height:40px;border-radius:50%;object-fit:cover;object-position:50% 12%;background:#1A2640;border:2px solid rgba(53,199,255,.5)}.ow-mhead b{font-family:var(--font-head,\"Gothic A1\",sans-serif);font-weight:800;font-size:15px;color:#fff}.ow-mhead span{font-size:12px;color:#9FB0D0}",
    "@media(prefers-reduced-motion:reduce){#v-study.ow::before{animation:none}.ow-p{animation:none}}",
    "@media(max-width:760px){#v-study.ow{padding:12px 10px 20px;border-radius:16px}.ow-hero{grid-template-columns:1fr;padding:14px 14px 16px;clip-path:none;gap:12px}.ow-r{display:none}.ow-tag{margin-bottom:8px}.ow-pl{gap:10px;margin-bottom:12px}.ow-ring{display:none}.ow-p.p3,.ow-p.p4{display:none}.ow-p.p1{left:auto;right:22%;top:2%}.ow-p.p2{left:auto;right:9%;top:4%}.ow-stats{flex-wrap:nowrap;gap:6px;flex:1;min-width:0}.ow-st{min-width:0;flex:1;padding:7px 8px;font-size:11px;word-break:keep-all}.ow-st b{font-size:15px}.ow-mhead{display:flex}.ow-ml{white-space:normal}.ow-cta{width:100%;justify-content:center}}"
  ].join("\n");
  var st=document.createElement("style"); st.id="v56css"; st.textContent=css; document.head.appendChild(st);
  try{ if($("#v-study")&&$("#v-study").classList.contains("on")) V56.apply(); }catch(e){}   /* 화면 표시 클래스는 .view.on */
})();
