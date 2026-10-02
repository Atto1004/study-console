/* ============================================================
   V59 LAYER — 대표님 2026-10-02 다섯 가지 (BUILD 2026-10-02.101)
   ① 학습 큐: 5단원만 보이고 나머지는 「나머지 n개 보기」로 접기
   ② 로비 플레이어 카드: 하트 · 호감도 · 다음 레벨까지 칸 제거(레벨 링 · 연속일만)
   ③ 「공부계획」 탭 신설: 시험까지 남은 회차·하루 몫 · 이번 주 날짜별 계획(수업 · 밀린 회차 배정 · 과제 마감 · 시험) · 2주 마감
   ④ 출결 보정(LMS 출결현황 10/1~10/2 조회 + 대표님 말): 공업수학1 9/18 결석은 덮어쓰고, 나머지는 비어 있을 때만 채운다
   ⑤ 수업 따라가기 공업수학1 회차 아래에 절(1.1 · 1.2 · 1.3 …) 칩 — 회차 제목의 절 번호 + 아래 SEC 보정
   ============================================================ */
(function(){
  if(window.V59) return;
  var V59=window.V59={};
  /* 수업 따라가기(V50)는 window.ABSENT 로 결석 칩을 붙이는데 전역에 없어서 한 번도 안 붙었다 → 결석·출튀만(인정결석은 칩 없음) */
  if(!window.ABSENT) window.ABSENT={absent:1,ghost:1};

  /* ---------- ⑤ 공업수학1 회차별 절 ---------- */
  V59.NAME={"1.1":"기본 개념·모델링","1.2":"방향장","1.3":"변수분리형","1.4":"완전 ODE·적분인자","1.5":"선형 ODE·베르누이","1.6":"직교 궤적","1.7":"해의 존재·유일성",
    "2.1":"2계 제차 선형·차수축소","2.2":"상수계수 제차","2.3":"미분연산자","2.4":"자유진동 모델링","2.5":"오일러-코시","2.6":"론스키안·1차독립",
    "2.7":"비제차·미정계수법","2.8":"강제진동·공진","2.9":"전기회로","2.10":"매개변수 변환법",
    "3.1":"고계 제차 선형","3.2":"고계 상수계수 제차","3.3":"고계 비제차 선형"};
  /* 회차 기록(정리.md·녹음·판서)으로 확인한 범위. est = 결석 회차라 과제 범위로 추정, plan = 수업 예고(정리 전) */
  V59.SEC={
    "2026-09-02":{s:["1.1"]},
    "2026-09-04":{s:["1.1","1.3"]},
    "2026-09-09":{s:["1.4"]},
    "2026-09-11":{s:["1.4","1.5"]},
    "2026-09-16":{s:["1.5","2.1"]},
    "2026-09-18":{s:["2.1","2.2","2.3"],est:1},
    "2026-09-23":{s:["2.5","2.6"]},
    "2026-09-30":{s:["2.7","2.8"]},
    "2026-10-02":{s:["2.9","2.10"],plan:1}
  };
  V59.secsFor=function(c,x){
    if(!c||c.name!=="공업수학1") return null;
    var o=V59.SEC[x.date]; if(o) return o;
    var m=(x.title||"").match(/\b[1-6]\.\d{1,2}\b/g); if(!m) return null;
    var u=[]; m.forEach(function(k){ if(u.indexOf(k)<0) u.push(k); }); return {s:u};
  };
  V59.secHTML=function(it,x){
    var o=V59.secsFor(it.c,x); if(!o||!o.s.length) return "";
    return '<div class="v59-secs">'+o.s.map(function(k){
      return '<button type="button" class="v59-sec" data-v59sec="'+it.c.id+'|'+x.w+'|'+x.date+'"><b>'+esc(k)+'</b>'+(V59.NAME[k]?'<span>'+esc(V59.NAME[k])+'</span>':'')+'</button>';
    }).join("")+(o.est?'<span class="v59-note">결석 회차 — 과제 범위로 추정</span>':'')+(o.plan?'<span class="v59-note">수업 예고 기준 · 정리 전</span>':'')+'</div>';
  };
  V59.hookFollow=function(){
    if(!window.V50||V50._v59) return; V50._v59=true;
    var _s=V50.sessHTML;
    V50.sessHTML=function(it,x){ var h=_s(it,x), add=V59.secHTML(it,x); if(!add) return h; var k=h.lastIndexOf("</div>"); return h.slice(0,k)+add+h.slice(k); };
    var _r=V50.render;
    V50.render=function(){ _r.apply(this,arguments);
      $$("[data-v59sec]").forEach(function(b){ b.onclick=function(){ var q=b.dataset.v59sec.split("|"); openStudy(q[0],+q[1],q[2]); }; }); };
  };

  /* ---------- ② 플레이어 카드 ---------- */
  V59.hookHero=function(){
    if(!window.V56||V56._v59) return; V56._v59=true;
    var _h=V56.heroHTML;
    V56.heroHTML=function(){ return _h.apply(this,arguments).replace(/<span class="ow-st"><b>[^<]*<\/b>(하트|호감도|다음 레벨까지)<\/span>/g,""); };
  };

  /* ---------- ① 학습 큐 5개 ---------- */
  V59.QN=5;
  V59.trimQueue=function(){
    var box=$("#stq"); if(!box) return; var rows=$$(".st-row",box); if(rows.length<=V59.QN) return;
    var all=!!ui.v59qAll;
    rows.forEach(function(r,i){ r.style.display=(all||i<V59.QN)?"":"none"; });
    var b=document.createElement("button"); b.type="button"; b.className="btn xs v59-more";
    b.textContent=all?"접기":"나머지 "+(rows.length-V59.QN)+"개 보기";
    b.onclick=function(){ ui.v59qAll=!all; renderStudy(); };
    var w=document.createElement("div"); w.className="v59-morew"; w.appendChild(b); box.appendChild(w);
    var hs=$("#stqHs"); if(hs&&!all) hs.textContent=V59.QN+" / "+rows.length+"단원";
  };

  /* ---------- ④ 출결 보정 ---------- */
  V59.ATT=[
    /* [과목, 날짜, 상태, 메모, 덮어쓰기] */
    ["공업수학1","2026-09-18","absent","결석 — 전날 과음(대표님 9/18 통보), LMS 결석 확인(10/1)",1],
    ["공업수학1","2026-09-02","absent","결석 — LMS 결석(10/1 조회)"],
    ["공업수학1","2026-09-11","late","지각 — 대표님 10/2 확인. LMS는 결석으로 찍혀 있음(1차 출결 08:59) → 교수님께 직접 문의"],
    ["정역학","2026-09-09","absent","결석 — 출강(클로드 강의), 교수 「인정 안 됨」"],
    ["아카데믹글쓰기","2026-09-08","absent","결석 — 출강. 행정팀 공결 불가 → 10/2 교수님께 출강확인서 인정 요청 메일, 답 대기"],
    ["창업아이디어탐색","2026-09-14","absent","결석 — LMS 2차시 결석(10/1 조회)"],
    ["CADD","2026-09-22","absent","결석 — Week 4 「형상의 표시」 영상 미시청(학습인정 9/27 종료)"],
    ["미분적분학2","2026-09-10","late","지각 — 수업 끝난 뒤 도착(대표님 9/10), LMS 지각"],
    ["미분적분학2","2026-09-22","late","지각 — LMS 지각(10/1 조회)"]
  ];
  V59.patchAtt=function(){
    if(typeof S==="undefined"||!S||!S.terms||S.patchAttLmsV1) return false;
    var n=0;
    V59.ATT.forEach(function(a){
      var c=courses().filter(function(x){ return x.name===a[0]; })[0]; if(!c) return;
      if(holidayOn(a[1])) return;
      var s=sessionOn(c.id,a[1]); if(!s&&window.V32&&V32.ensureSession) s=V32.ensureSession(c.id,a[1]); if(!s||s.cancelled) return;
      if(s.status===a[2]) return;
      if(s.status&&s.status!=="pending"&&!a[4]) return;
      s.status=a[2]; if(!s.memo) s.memo=a[3]; n++;
    });
    S.patchAttLmsV1=true; try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){}
    return n>0;
  };

  /* ---------- ③ 공부계획 탭 ---------- */
  V59.ensureView=function(){
    if($("#v-plan")) return; var st=$("#v-study"); if(!st) return;
    var v=document.createElement("section"); v.className="view"; v.id="v-plan";
    v.innerHTML='<div class="vh"><h1>공부계획</h1><div class="sub" id="v59Sub"></div></div><div id="v59Body"></div>';
    st.parentNode.insertBefore(v,st.nextSibling);
  };
  V59.ensureNav=function(){
    if(NAV.some(function(x){ return x.k==="plan"; })) return;
    var i=NAV.map(function(x){ return x.k; }).indexOf("study");
    NAV.splice(i<0?NAV.length:i+1,0,{k:"plan",n:"공부계획",ic:icon('<rect x="4" y="4.6" width="16" height="15.6" rx="3"/><path d="M4 9.4h16M8.4 2.8v3.6M15.6 2.8v3.6"/><path d="M8 13.2h3M8 16.4h6"/>')});
  };
  V59.DOW=["일","월","화","수","목","금","토"];
  V59.md=function(d){ var x=D(d); return (x.getMonth()+1)+"/"+x.getDate()+"("+V59.DOW[x.getDay()]+")"; };
  V59.asgs=function(){
    var out=[], M=window.V58&&V58.M&&V58.M.courses; if(!M) return out;
    Object.keys(M).forEach(function(n){ (M[n].assignments||[]).forEach(function(a){
      if(!a.due) return; var st=a.lms_state||a.status||"";
      if(/제출|완료/.test(st)&&!/미제출/.test(st)) return;
      out.push({c:n,t:a.title||"과제",due:a.due.slice(0,10),time:a.due.length>10?a.due.slice(11,16):"",st:st});
    }); });
    return out;
  };
  V59.data=function(){
    var td=today(), mon=mondayOf(td), items=[];
    try{ items=window.V50?V50.items():[]; }catch(e){ items=[]; }
    var exs=exams().filter(function(e){ return e.date>=td; }).sort(function(a,b){ return a.date<b.date?-1:1; });
    var exOf={}; exs.forEach(function(e){ if(!exOf[e.courseId]) exOf[e.courseId]=e; });
    var queue=[]; items.forEach(function(it){ (it.todo||[]).forEach(function(x){ queue.push({it:it,x:x,ex:exOf[it.c.id]}); }); });
    queue.sort(function(a,b){ var ea=a.ex?a.ex.date:"9999", eb=b.ex?b.ex.date:"9999"; return ea<eb?-1:ea>eb?1:(a.x.date<b.x.date?-1:1); });
    var days=[]; for(var i=0;i<7;i++){ var d=addDays(mon,i); days.push({d:d,cls:[],q:[],asg:[],ex:[],past:d<td,min:studyMinutes(d,d)}); }
    var per=2, qi=0;
    days.forEach(function(dy){
      dy.cls=holidayOn(dy.d)?[]:courses().filter(isActive).filter(function(c){ var s=sessionOn(c.id,dy.d); if(s&&s.cancelled) return false;
        var ds=(window.V32&&V32.meetings)?V32.meetings(c):[]; return ds.indexOf(dy.d)>=0||!!s; });
      dy.ex=exs.filter(function(e){ return e.date===dy.d; });
      if(!dy.past) for(var k=0;k<per&&qi<queue.length;k++) dy.q.push(queue[qi++]);
    });
    var asg=V59.asgs();
    days.forEach(function(dy){ dy.asg=asg.filter(function(a){ return a.due===dy.d; }); });
    return {td:td,mon:mon,exs:exs,exOf:exOf,items:items,queue:queue,left:queue.length-qi,days:days,asg:asg};
  };
  V59.renderPlan=function(){
    V59.ensureView(); var body=$("#v59Body"); if(!body) return;
    if(window.V58&&!V58.M&&V58.load&&!V59._ld){ V59._ld=1; V58.load().then(function(){ if(ui.view==="plan") V59.renderPlan(); }); }
    var P=V59.data(), td=P.td;
    $("#v59Sub").textContent="밀린 회차 "+P.queue.length+"개 · 다음 시험 "+(P.exs[0]?(course(P.exs[0].courseId)||{}).name+" "+V59.md(P.exs[0].date)+" (D-"+diffDays(td,P.exs[0].date)+")":"없음");
    /* 시험까지 */
    var seen={}, exRows=P.exs.filter(function(e){ if(seen[e.courseId]) return false; seen[e.courseId]=1; return true; }).map(function(e){
      var c=course(e.courseId)||{name:"?"}, it=P.items.filter(function(i){ return i.c.id===e.courseId; })[0], todo=it?it.todo.length:0, dd=diffDays(td,e.date);
      var per=todo?Math.ceil(todo/Math.max(1,dd)):0;
      return '<div class="lrow v59-ex"><span class="v59-dd'+(dd<=7?' hot':'')+'">D-'+dd+'</span><div class="gr"><div class="t"><b>'+esc(c.name)+'</b> <span class="hint">'+esc(V59.md(e.date))+(e.label||e.kind?' · '+esc(e.label||e.kind):'')+'</span></div>'+
        '<div class="s">'+(todo?'밀린 회차 '+todo+'개 → 하루 '+per+'개면 시험 전에 끝':'밀린 회차 없음')+(e.range?' · 범위 '+esc(e.range):'')+'</div></div></div>';
    }).join("");
    /* 이번 주 */
    var wk=P.days.map(function(dy){
      var isT=dy.d===td, li=[];
      dy.ex.forEach(function(e){ li.push('<li class="v59-i ex"><span class="v59-k">시험</span>'+esc((course(e.courseId)||{}).name||"")+'</li>'); });
      dy.asg.forEach(function(a){ li.push('<li class="v59-i due"><span class="v59-k">마감</span>'+esc(a.c)+' · '+esc(a.t)+(a.time?' <small>'+esc(a.time)+'</small>':'')+'</li>'); });
      if(dy.cls.length) li.push('<li class="v59-i cls"><span class="v59-k">수업</span>'+dy.cls.map(function(c){ return esc(c.name); }).join(" · ")+'</li>');
      dy.q.forEach(function(q){ li.push('<li class="v59-i q"><span class="v59-k">따라가기</span>'+esc(q.it.c.name)+' '+esc(V59.md(q.x.date))+(q.x.title?' <small>'+esc(q.x.title)+'</small>':'')+' <button type="button" class="btn xs a" data-v59go="'+q.it.c.id+'|'+q.x.w+'|'+q.x.date+'">열기</button></li>'); });
      if(!li.length) li.push('<li class="v59-i mut">'+(dy.past?'—':'비어 있음')+'</li>');
      return '<div class="v59-day'+(isT?' today':'')+(dy.past?' past':'')+'"><div class="v59-dh"><b>'+esc(V59.md(dy.d))+'</b>'+(isT?'<span class="chip ok">오늘</span>':'')+(dy.min?'<span class="hint">공부 '+esc(fmtMin(dy.min))+'</span>':'')+'</div><ul>'+li.join("")+'</ul></div>';
    }).join("");
    /* 2주 마감 */
    var lim=addDays(td,14), up=P.asg.filter(function(a){ return a.due>=td&&a.due<=lim; }).sort(function(a,b){ return a.due<b.due?-1:1; });
    var upRows=up.map(function(a){ var dd=diffDays(td,a.due); return '<div class="lrow"><span class="v59-dd'+(dd<=2?' hot':'')+'">'+(dd?'D-'+dd:'오늘')+'</span><div class="gr"><div class="t">'+esc(a.c)+' · '+esc(a.t)+'</div><div class="s">'+esc(V59.md(a.due))+(a.time?' '+esc(a.time):'')+(a.st?' · '+esc(a.st):'')+'</div></div></div>'; }).join("");
    body.innerHTML=
      '<div class="card"><div class="card-h"><h3>시험까지</h3><span class="hs">'+Object.keys(seen).length+'</span></div><div class="card-b tight">'+(exRows||'<div class="empty">예정된 시험이 없습니다.</div>')+'</div></div>'+
      '<div class="card"><div class="card-h"><h3>이번 주</h3><span class="hs">'+esc(V59.md(P.mon))+' ~ '+esc(V59.md(addDays(P.mon,6)))+'</span><div class="ha"><span class="hint">밀린 회차는 시험 가까운 과목부터 하루 2개</span></div></div><div class="card-b"><div class="v59-week">'+wk+'</div>'+
        (P.left>0?'<div class="hint" style="margin-top:8px">이번 주에 다 못 넣은 밀린 회차 '+P.left+'개는 다음 주로 넘어갑니다.</div>':'')+'</div></div>'+
      '<div class="card"><div class="card-h"><h3>2주 안 마감</h3><span class="hs">'+up.length+'</span></div><div class="card-b tight">'+(upRows||'<div class="empty">2주 안에 남은 마감이 없습니다.</div>')+'</div></div>';
    $$("[data-v59go]",body).forEach(function(b){ b.onclick=function(){ var q=b.dataset.v59go.split("|"); openStudy(q[0],+q[1],q[2]); }; });
  };

  /* ---------- 연결 ---------- */
  var _render=render;
  render=function(){
    if(V59.patchAtt()){ try{ markSave("dirty"); }catch(e){} }
    V59.hookFollow(); V59.hookHero();
    _render.apply(this,arguments);
    if(ui.view==="plan") V59.renderPlan();
  };
  var _rs=renderStudy;
  renderStudy=function(){ _rs.apply(this,arguments); V59.trimQueue(); };
  var _rn=renderNav;
  renderNav=function(){ V59.ensureNav(); V59.ensureView(); _rn.apply(this,arguments); };

  var css=document.createElement("style"); css.id="v59css";
  css.textContent=[
    ".v59-secs{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px;align-items:center}",
    ".v59-sec{display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:4px 11px;border-radius:9px;border:1.5px solid var(--line-2,#3a4660);background:var(--surface-2,rgba(255,255,255,.04));color:inherit;font-size:12.5px;cursor:pointer}",
    ".v59-sec b{font-weight:800;font-family:var(--font-num,inherit)}.v59-sec span{color:var(--ink-2,#9aa5bd)}",
    ".v59-sec:hover{border-color:var(--ac,#4F9A35)}",
    ".v59-note{font-size:11.5px;color:var(--ink-3)}",
    ".v59-morew{display:flex;justify-content:center;padding:10px 0 4px}.v59-more{min-height:40px;padding:0 16px}",
    ".v59-dd{display:inline-flex;align-items:center;justify-content:center;min-width:52px;height:30px;border-radius:8px;font-weight:800;font-size:13px;background:var(--surface-2);margin-right:10px;flex:none}",
    ".v59-dd.hot{background:#C7261B;color:#fff}",
    ".v59-ex .gr,.v59-week+* {min-width:0}",
    ".v59-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px}",
    ".v59-day{border:1.5px solid var(--line);border-radius:12px;padding:8px;min-width:0;background:var(--surface)}",
    ".v59-day.today{border-color:var(--ac,#4F9A35);box-shadow:0 0 0 2px color-mix(in srgb,var(--ac,#4F9A35) 25%,transparent)}",
    ".v59-day.past{opacity:.55}",
    ".v59-dh{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-bottom:6px}.v59-dh b{font-size:13.5px}.v59-dh .hint{font-size:11px}",
    ".v59-day ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:5px}",
    ".v59-i{font-size:12px;line-height:1.4;word-break:keep-all;overflow-wrap:anywhere}.v59-i small{display:block;color:var(--ink-3);font-size:11px}",
    ".v59-i .btn{margin-top:4px;min-height:32px}",
    ".v59-k{display:inline-block;font-size:10.5px;font-weight:800;padding:1px 6px;border-radius:5px;margin-right:4px;background:var(--surface-2);color:var(--ink-2)}",
    ".v59-i.ex .v59-k{background:#C7261B;color:#fff}.v59-i.due .v59-k{background:#B85C00;color:#fff}.v59-i.q .v59-k{background:#1E5FA8;color:#fff}",
    ".v59-i.mut{color:var(--ink-3)}",
    "#rail .navb[data-k=plan]{letter-spacing:-.04em;white-space:nowrap;font-size:13.5px}",
    "@media (max-width:1100px){.v59-week{grid-template-columns:repeat(4,minmax(0,1fr))}}",
    "@media (max-width:600px){.v59-week{grid-template-columns:1fr}.v59-day.past{display:none}}"
  ].join("\n");
  document.head.appendChild(css);
})();
