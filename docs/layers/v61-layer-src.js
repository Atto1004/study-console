/* ============================================================
   V61 LAYER — 대표님 2026-10-02 「남은 시간과 과목별 공부한 시간 카운트 따로」 (BUILD 2026-10-02.103)
   공부계획 탭 맨 위 「시간」 카드: 남은 시간(오늘 · 이번 주 · 과목별 중간고사까지 빈 시간 + D-day) / 과목별 공부 시간(오늘 · 이번 주 · 누적) + 과목별 ▶ 타이머.
   타이머는 오늘 탭 「공부 타이머」와 같은 저장(mc-timer · S.studyLog)을 쓰고, 오늘 탭 카드도 이 구현으로 바꿔 둘이 어긋나지 않게 한다.
   ============================================================ */
(function(){
  if(window.V61) return;
  var V61=window.V61={};
  V61.SUBJ=["미분적분학2","공업수학1","정역학","일반물리학2","CADD"];
  function pad2(n){ return (n<10?"0":"")+n; }
  function clock(sec){ return pad2(Math.floor(sec/3600))+":"+pad2(Math.floor(sec/60)%60)+":"+pad2(sec%60); }
  function hmm(min){ min=Math.max(0,Math.round(min)); var h=Math.floor(min/60), m=min%60; return h?h+"시간 "+pad2(m)+"분":m+"분"; }
  V61.T=function(){ try{ return JSON.parse(localStorage.getItem("mc-timer")||"null"); }catch(e){ return null; } };
  V61.setT=function(t){ try{ if(t) localStorage.setItem("mc-timer",JSON.stringify(t)); else localStorage.removeItem("mc-timer"); }catch(e){} };
  V61.start=function(cid){ var t=V61.T(); if(t) V61.stop(true); V61.setT({cid:cid,start:Date.now(),d:today(),hm:(typeof nowHM==="function"?nowHM():"")}); toast(((course(cid)||{}).name||"")+" 공부 시작"); V61.refresh(); };
  V61.stop=function(quiet){ var t=V61.T(); if(!t) return; var min=Math.max(1,Math.round((Date.now()-t.start)/60000));
    S.studyLog=S.studyLog||[]; S.studyLog.push({id:uid(),d:t.d||today(),cid:t.cid,w:currentWeek()||1,min:min,grade:"timer",at:Date.now()});
    V61.setT(null); persist(); if(!quiet) toast(((course(t.cid)||{}).name||"")+" "+fmtMin(min)+" 기록"); V61.refresh(); };
  V61.refresh=function(){ try{ renderGauges(); }catch(e){} if(ui.view==="plan"&&window.V60) V60.render(); else if(ui.view==="today"&&window.V25&&V25.renderTimer) V25.renderTimer(); };
  V61.mins=function(cid,from,to){ return (S.studyLog||[]).filter(function(l){ return l.cid===cid&&(!from||l.d>=from)&&(!to||l.d<=to); }).reduce(function(a,l){ return a+(+l.min||0); },0); };
  V61.live=function(cid){ var t=V61.T(); return (t&&t.cid===cid)?Math.floor((Date.now()-t.start)/60000):0; };

  /* 시험 전까지 빈 시간(분): 오늘 지금부터 ~ 시험 전날 + 시험 날 시험 시각 전 */
  V61.untilExam=function(e){
    if(!window.V60||!V60.day) return 0; var td=today(), n=diffDays(td,e.date), tot=0, nowM=nowMin();
    for(var i=0;i<=n&&i<60;i++){ var d=addDays(td,i), x=V60.day(d,i===0?nowM:null);
      if(i===n){ var cut=toMin(e.time||"09:00"); tot+=x.slots.reduce(function(a,r){ return a+Math.max(0,Math.min(r[1],cut)-r[0]); },0); }
      else tot+=x.avail; }
    return tot;
  };

  V61.exD=function(n){ var c=courses().filter(function(x){ return x.name===n; })[0]; if(!c) return 999; var e=exams(c.id).filter(function(x){ return x.date>=today()&&/중간/.test(x.kind||"중간"); })[0]; return e?diffDays(today(),e.date):999; };
  V61.cardHTML=function(){
    var td=today(), mon=mondayOf(td), sun=addDays(mon,6), t=V61.T();
    var dT=window.V60?V60.day(td,nowMin()):{avail:0}, wk=dT.avail;
    for(var i=1;i<7;i++){ var d=addDays(td,i); if(d>sun) break; wk+=V60.day(d,null).avail; }
    var left='<div class="v61-left"><div class="v61-big"><small>오늘 남은 빈 시간</small><b id="v61Today">'+hmm(dT.avail)+'</b></div><div class="v61-big"><small>이번 주 남은 빈 시간</small><b>'+hmm(wk)+'</b></div>'+
      '<div class="v61-ex">'+V61.SUBJ.slice().sort(function(x,y){ var dx=V61.exD(x), dy=V61.exD(y); return dx-dy; }).map(function(n){ var c=courses().filter(function(x){ return x.name===n; })[0]; if(!c) return "";
        var e=exams(c.id).filter(function(x){ return x.date>=td&&/중간/.test(x.kind||"중간"); })[0]; if(!e) return "";
        return '<div class="v61-er"><span class="crow-chip" style="background:'+(window.V44?V44.color(c):"#5B6B8C")+'">'+esc(window.V44?V44.abbr(n):n.slice(0,2))+'</span><span class="v61-en">'+esc(n)+'</span><b>D-'+diffDays(td,e.date)+'</b><span class="v61-eh">시험까지 빈 시간 <b>'+hmm(V61.untilExam(e))+'</b></span></div>'; }).join("")+'</div></div>';
    var others=courses().filter(function(c){ return V61.SUBJ.indexOf(c.name)<0&&isActive(c); });
    var oT=others.reduce(function(a,c){ return a+V61.mins(c.id,td,td); },0), oW=others.reduce(function(a,c){ return a+V61.mins(c.id,mon,sun); },0), oA=others.reduce(function(a,c){ return a+V61.mins(c.id); },0);
    var totT=0, totW=0;
    var rows=V61.SUBJ.map(function(n){ var c=courses().filter(function(x){ return x.name===n; })[0]; if(!c) return "";
      var lv=V61.live(c.id), a=V61.mins(c.id,td,td)+lv, w=V61.mins(c.id,mon,sun)+lv, all=V61.mins(c.id)+lv, on=t&&t.cid===c.id; totT+=a; totW+=w;
      return '<tr class="'+(on?'on':'')+'"><td><span class="v61-sn"><span class="crow-chip" style="background:'+(window.V44?V44.color(c):"#5B6B8C")+'">'+esc(window.V44?V44.abbr(n):n.slice(0,2))+'</span><span class="v61-nm">'+esc(n)+'</span></span></td><td>'+hmm(a)+'</td><td>'+hmm(w)+'</td><td>'+hmm(all)+'</td>'+
        '<td>'+(on?'<button type="button" class="btn xs v61-stop" data-v61stop="1">■ <span class="v61-clk" data-v61clk="1">'+clock(Math.floor((Date.now()-t.start)/1000))+'</span></button>':'<button type="button" class="btn xs a" data-v61go="'+c.id+'">▶</button>')+'</td></tr>'; }).join("");
    totT+=oT; totW+=oW;
    var right='<div class="v61-right"><table class="v61-t"><thead><tr><th>과목</th><th>오늘</th><th>이번 주</th><th>누적</th><th></th></tr></thead><tbody>'+rows+
      (oA?'<tr class="mut"><td>그 밖의 과목</td><td>'+hmm(oT)+'</td><td>'+hmm(oW)+'</td><td>'+hmm(oA)+'</td><td></td></tr>':'')+
      '</tbody><tfoot><tr><td>합계</td><td>'+hmm(totT)+'</td><td>'+hmm(totW)+'</td><td></td><td></td></tr></tfoot></table></div>';
    return '<div class="card v61"><div class="card-h"><h3>시간</h3>'+(t?'<span class="hs">'+esc((course(t.cid)||{}).name||"")+' 공부 중</span>':'')+'</div><div class="card-b"><div class="v61-g">'+left+right+'</div></div></div>';
  };
  V61.bind=function(root){
    $$("[data-v61go]",root).forEach(function(b){ b.onclick=function(){ V61.start(b.dataset.v61go); }; });
    $$("[data-v61stop]",root).forEach(function(b){ b.onclick=function(){ V61.stop(); }; });
  };
  V61.inject=function(){
    var body=$("#v59Body"); if(!body||!window.V60) return; var old=$("#v61Card",body); if(old) old.remove();
    var w=document.createElement("div"); w.id="v61Card"; w.innerHTML=V61.cardHTML();
    var top=$(".v60-top",body); if(top&&top.nextSibling) body.insertBefore(w,top.nextSibling); else body.insertBefore(w,body.firstChild);
    V61.bind(w);
  };
  V61.hook=function(){
    if(!window.V60||V60._v61) return; V60._v61=true;
    var _r=V60.render; V60.render=function(){ _r.apply(this,arguments); try{ V61.inject(); }catch(e){ if(window.console) console.warn("V61",e); } };
    /* 오늘 탭 공부 타이머도 같은 저장을 쓰게 — 과목 칩 + 시작/종료 */
    if(window.V25){
      V25.renderTimer=function(){
        var v=$("#v-today"); if(!v) return; var c=$("#timerCard");
        if(window.V39&&V39.examOn&&!V39.examOn()){ if(c) c.remove(); return; }   /* V39: 시험 모드(D-14) 밖에서는 오늘 탭에 타이머를 두지 않는다 — 공부계획 탭에서 */
        if(!c){ c=document.createElement("div"); c.className="card"; c.id="timerCard"; var after=$("#dayBooks"), card=after?after.closest(".card"):null; if(card&&card.nextSibling) v.insertBefore(c,card.nextSibling); else v.appendChild(c); }
        c.innerHTML=V61.cardHTML().replace(/^<div class="card v61">/,'<div class="v61">').replace(/<\/div>$/,'');
        V61.bind(c);
      };
      V25.tickTimer=function(){ V61.tick(); };
    }
  };
  V61.tick=function(){ var t=V61.T(); if(!t) return; var s=Math.floor((Date.now()-t.start)/1000); $$("[data-v61clk]").forEach(function(el){ el.textContent=clock(s); }); };
  setInterval(function(){ if(ui.view==="plan"||ui.view==="today") V61.tick(); },1000);

  var _render=render;
  render=function(){ V61.hook(); _render.apply(this,arguments); };

  var css=document.createElement("style"); css.id="v61css";
  css.textContent=[
    ".v61-g{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:16px}",
    ".v61-left{display:flex;flex-direction:column;gap:8px}",
    ".v61-big{background:var(--surface-2);border-radius:12px;padding:8px 12px}.v61-big small{display:block;font-size:12px;color:var(--ink-3)}.v61-big b{font-size:20px;font-variant-numeric:tabular-nums}",
    ".v61-ex{display:flex;flex-direction:column;gap:4px}.v61-er{display:flex;align-items:center;gap:8px;font-size:13px;min-height:34px}.v61-er .crow-chip{width:30px;height:30px;font-size:10px}",
    ".v61-en{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v61-er>b{font-variant-numeric:tabular-nums;min-width:44px}.v61-eh{font-size:12px;color:var(--ink-3);white-space:nowrap}.v61-eh b{color:var(--ink);font-size:13px}",
    ".v61-t{width:100%;border-collapse:collapse;font-size:13.5px}.v61-t th{font-size:11.5px;color:var(--ink-3);font-weight:700;text-align:right;padding:4px 6px;border-bottom:1px solid var(--line)}",
    ".v61-t th:first-child,.v61-t td:first-child{text-align:left}.v61-t td{padding:6px;border-bottom:1px solid var(--line);text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}",
    ".v61-sn{display:inline-flex;align-items:center;gap:6px;max-width:100%}.v61-nm{overflow:hidden;text-overflow:ellipsis}.v61-t .crow-chip{width:32px;height:26px;font-size:8.5px;flex:none}.v61-right{min-width:0;overflow-x:auto}",
    ".v61-t tr.on td{background:color-mix(in srgb,#1E5FA8 8%,transparent)}.v61-t tr.mut td{color:var(--ink-3)}",
    ".v61-t tfoot td{font-weight:800;border-bottom:0}.v61-t .btn{min-height:36px;min-width:44px}",
    ".v61-stop{background:#C7261B!important;border-color:#C7261B!important;color:#fff!important;font-variant-numeric:tabular-nums}",
    "@media (max-width:760px){.v61-g{grid-template-columns:1fr}.v61-t{font-size:12.5px}.v61-t td,.v61-t th{padding:5px 3px}.v61-t .crow-chip{display:none}.v61-er{flex-wrap:wrap;row-gap:0}.v61-eh{width:100%;padding-left:38px}.v61-t .btn{min-width:40px}}"
  ].join("\n");
  document.head.appendChild(css);
})();
