/* ============================================================
   V58 LAYER — 과목 화면 「수업 자료」: 일차별 출결 · 강의자료 · 녹음 · 판서 · 내 필기 · 정리 · 과제(마감) (BUILD 2026-10-01.98 · 과제 .100)
   대표님 2026-10-01 「각과목별로 수업자료 업로드 현황 일차별로 업로드되었는지 확인할 수 있는 영역 … 내 필기본, 녹음본, 교수님 칠판판서,
   강의자료 등 … 내 출결과 관련해서 과목별로 확인할수 있게 … 강의자료 미리 나와있는건 일차별로 미리 생성」
   데이터: knowledge/materials.json(PC 폴더 실측 개수 + _회차계획.json 의 미리 나온 강의자료 — _진도커버리지.py, 파일명·실명 없음)
         + 이 기기의 회차 기록(출결 · 텍스트 슬롯 · 첨부 kind — V32 와 같은 판정).
   결석·인정결석 회차는 내 자료(녹음·판서·필기)가 없어도 빨강으로 세지 않는다. 앞으로의 회차는 미리 나온 강의자료가 있으면 「미리」.
   ============================================================ */
(function(){
  var V58=window.V58={M:null,P:null,all:{},tok:0};
  V58.load=function(){ if(V58.P) return V58.P;
    V58.P=fetch("knowledge/materials.json",{cache:"no-cache"}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }).then(function(d){ V58.M=d; return d; });
    return V58.P; };
  /* 열 = PC 종류(k) 묶음 + 기기 첨부 kind + 텍스트 슬롯 */
  V58.COLS=[
    {k:"pre",  n:"강의자료", pc:["pre"],              dev:["자료"],               slot:"pre"},
    {k:"rec",  n:"녹음",     pc:["rec","lmsvideo"],   dev:["녹음","영상정리"],     slot:"rec"},
    {k:"board",n:"판서",     pc:["board","profnote"], dev:["칠판판서","교수필기"], slot:"",  photo:true},
    {k:"note", n:"내 필기",  pc:["note"],             dev:["필기본"],             slot:"note"},
    {k:"sum",  n:"정리",     pc:["summary"],          dev:[],                     slot:""}
  ];
  V58.LABEL={"정역학":{rec:"LMS 영상",board:"교수 필기"},"CADD":{rec:"영상 정리"}};
  V58.SHORT={pre:"자료",rec:"녹음",board:"판서",note:"필기",sum:"정리"};
  V58.SHORT_BY={"정역학":{rec:"영상",board:"교수"},"CADD":{rec:"영상"}};
  V58.ATT_SHORT={present:"출석",late:"지각",vlate:"큰지각",ghost:"출튀",excused:"인정",absent:"결석"};
  var two=function(lg,sm){ return lg===sm?esc(lg):'<span class="lg">'+esc(lg)+'</span><span class="sm">'+esc(sm)+'</span>'; };
  /* 있어야 하는 열 — 출석한 지난 회차에서 없으면 빨강. 나머지 열은 없으면 회색 */
  V58.NEED={"공업수학1":["pre","rec","board","sum"],"미분적분학2":["rec","board","sum"],"일반물리학2":["rec","board","sum"],
            "정역학":["rec","board","sum"],"CADD":["pre","rec"],"아카데믹글쓰기":["pre","rec","sum"],"창업아이디어탐색":["rec"]};
  V58.ABS={absent:1,excused:1};
  var md=function(d){ return fmtDate(d); };
  V58.rows=function(c){
    var td=today(), out=[], seen={};
    planned(c,true).forEach(function(p){
      if(c.enrolledFrom&&p.date<c.enrolledFrom) return;
      var s=sessionOn(c.id,p.date);
      out.push({date:p.date,hol:p.holiday||(s&&s.cancelled?{name:"휴강"}:null)}); seen[p.date]=1; });
    (typeof V32!=="undefined"&&V32.meetings?V32.meetings(c):[]).forEach(function(d){ if(!seen[d]){ out.push({date:d,hol:null,extra:true}); seen[d]=1; } });
    (term().exams||[]).forEach(function(e){ if(e.courseId===c.id&&e.date) out.push({date:e.date,exam:e}); });
    var mc=V58.M&&V58.M.courses&&V58.M.courses[c.name];
    ((mc&&mc.assignments)||[]).forEach(function(a){
      if(a.given) out.push({date:a.given,asg:a,kind:"given"});
      if(a.due) out.push({date:a.due.slice(0,10),asg:a,kind:"due"}); });
    var ord=function(r){ return r.exam?3:r.asg?(r.kind==="due"?2:1):0; };
    out.sort(function(a,b){ return a.date<b.date?-1:a.date>b.date?1:ord(a)-ord(b); });
    out.forEach(function(r){ r.past=r.date<td; r.today=r.date===td; r.future=r.date>td; });
    return out;
  };
  V58.cell=function(col,c,r,item,counts,sl,st){
    var k=item.k||{}, plan=item.plan||null;
    var n=0; col.pc.forEach(function(t){ n+=(k&&k[t])||0; });
    var d=0; if(counts&&counts.ok) col.dev.forEach(function(t){ d+=counts.map[t]||0; });
    var txt=col.slot&&sl&&typeof sl[col.slot]==="string"&&sl[col.slot].trim();
    var need=(V58.NEED[c.name]||[]).indexOf(col.k)>=0;
    if(r.future){
      if(col.k==="pre"&&((plan&&plan.pre)||n+d>0||txt)) return {cls:"pre",t:"미리",title:(plan&&plan.pre)||""};
      return (n+d>0||txt)?{cls:"on",t:"✓"}:{cls:"fut",t:""};
    }
    if(n+d>0||txt) return {cls:"on",t:"✓"+((n+d)>1?" "+(n+d):"")};
    if(col.k==="pre"&&plan&&plan.pre) return {cls:"on",t:"✓",title:plan.pre};
    if(col.photo&&k.photo) return {cls:"maybe",t:"사진 "+k.photo,sm:"사진"};
    if(col.k!=="pre"&&col.k!=="sum"&&V58.ABS[st]) return {cls:"abs",t:"결석"};
    if(item.none&&need) return {cls:"abs",t:"안 옴"};
    if(item.novideo&&col.k==="rec") return {cls:"abs",t:"영상 미게시",sm:"미게시",title:"LMS 에 그날 교수 필기만 있고 영상이 없음"};
    if(r.today) return {cls:"fut",t:need?"수업 뒤":""};
    return need?{cls:"no",t:"없음"}:{cls:"opt",t:"—"};
  };
  V58.attHTML=function(r,s){
    if(r.hol) return '<span class="v58-a hol">휴강</span>';
    var st=s&&s.status;
    if(st&&ATT[st]){ var col=(V32.ATTCOL&&V32.ATTCOL[st])||"var(--ok)"; return '<span class="v58-a" style="--ac:'+col+'">'+two(ATT[st].n,V58.ATT_SHORT[st]||ATT[st].n)+'</span>'; }
    if(r.future) return '<span class="v58-a fut">예정</span>';
    if(r.today) return '<span class="v58-a fut">오늘</span>';
    return '<span class="v58-a none">미기록</span>';
  };
  V58.rowHTML=function(c,r,counts){
    if(r.asg) return V58.asgHTML(r);
    if(r.exam) return '<tr class="v58-exam"><td></td><td colspan="7"><b>'+esc(r.exam.kind)+'고사</b> '+esc(md(r.date))+(r.exam.time?' '+esc(r.exam.time):'')+'</td></tr>';
    var s=sessionOn(c.id,r.date), sl=(s&&s.slots)||{}, st=s&&s.status;
    var mc=V58.M&&V58.M.courses&&V58.M.courses[c.name], item=(mc&&mc.sessions&&mc.sessions[r.date])||{}, plan=item.plan||null;
    var n=r.hol?0:((typeof V32!=="undefined"&&V32.nth)?V32.nth(c,r.date):0);
    var prog=(s&&(s.progress||"").trim())||(plan&&plan.topic)||"";
    var sub=prog?'<small>'+esc(prog.length>46?prog.slice(0,46)+"…":prog)+'</small>':'';
    if(r.future&&plan&&plan.pre) sub+='<small class="v58-pre">'+esc(plan.pre)+'</small>';
    var cells=r.hol?'<td colspan="5" class="v58-holcell">'+esc((r.hol.name||r.hol.label||"휴강"))+'</td>':V58.COLS.map(function(col){
      var x=V58.cell(col,c,r,item,counts,sl,st);
      return '<td class="v58-c '+x.cls+'"'+(x.title?' title="'+esc(x.title)+'"':'')+'>'+(x.sm?two(x.t,x.sm):esc(x.t))+'</td>'; }).join("");
    var miss=!r.hol&&!r.future&&/v58-c no/.test(cells);
    return '<tr class="v58-r'+(r.future?" fut":"")+(r.today?" today":"")+(r.hol?" hol":"")+(miss?" miss":"")+'" data-d="'+r.date+'"'+(r.future||r.hol?'':' tabindex="0"')+'>'+
      '<td class="v58-n">'+(n?n+'<small>일차</small>':'')+'</td>'+
      '<td class="v58-d"><b>'+esc(md(r.date))+'</b>'+sub+'</td>'+
      '<td>'+V58.attHTML(r,s)+'</td>'+cells+'</tr>';
  };
  V58.dueTxt=function(a){ if(!a.due) return "마감 없음"; var t=a.due.slice(11,16); return md(a.due.slice(0,10))+(t?" "+t:""); };
  V58.asgState=function(a){
    if(a.status==="제출") return {cls:"ok",t:"제출"};
    if(a.status) return {cls:"warn",t:a.status};
    if(!a.due) return null;
    var now=new Date(), d=new Date(a.due.replace("T"," ").replace(/-/g,"/")+":00");
    if(isNaN(d)) return null;
    if(d<now) return {cls:"past",t:"마감 지남"};
    var n=Math.ceil((D(a.due.slice(0,10))-D(today()))/86400000);
    return {cls:n<=2?"soon":"fut",t:n<=0?"오늘 마감":"D-"+n};
  };
  V58.asgHTML=function(r){
    var a=r.asg, st=V58.asgState(a);
    var chip=st?' <span class="v58-st '+st.cls+'">'+esc(st.t)+'</span>':'';
    var est=a.dueNote?' <small title="'+esc(a.dueNote)+'">(추정)</small>':'';
    if(r.kind==="given") return '<tr class="v58-asg"><td></td><td colspan="7"><span class="v58-tag g">과제</span> <b>'+esc(a.title)+'</b> <span class="v58-arrow">'+(a.due?'→ 마감 '+esc(V58.dueTxt(a)):'· 마감 없음')+'</span>'+est+'</td></tr>';
    var sh=a.title.replace(/Homework Assignment\s*-\s*/i,"HW ").replace(/\s*(을|를)?\s*제출해\s*주세요\.?$/,"").replace(/\s+/g," ").trim(); if(sh.length>26) sh=sh.slice(0,26)+"…";
    return '<tr class="v58-asg due"><td></td><td colspan="7"><span class="v58-tag d">마감</span> '+esc(V58.dueTxt(a))+est+' · <span title="'+esc(a.title)+'">'+two(a.title,sh)+'</span>'+chip+'</td></tr>';
  };
  V58.html=function(c){
    var rows=V58.rows(c), td=today(), lim=addDays(td,14), all=!!V58.all[c.id];
    var shown=rows.filter(function(r){ return all||r.date<=lim; }), hidden=rows.length-shown.length;
    var lb=V58.LABEL[c.name]||{}, sb=V58.SHORT_BY[c.name]||{};
    var head='<tr><th class="v58-n">일차</th><th class="v58-d">날짜</th><th>출결</th>'+V58.COLS.map(function(col){ return '<th>'+two(lb[col.k]||col.n,sb[col.k]||V58.SHORT[col.k])+'</th>'; }).join("")+'</tr>';
    var cs=courses().filter(function(x){ return !isPersonal(x)&&x.slots&&x.slots.length; });
    var tabs='<div class="v58-tabs" role="tablist">'+cs.map(function(x){ return '<button type="button" role="tab" class="v58-tab'+(x.id===c.id?" on":"")+'" data-c="'+x.id+'" aria-selected="'+(x.id===c.id)+'">'+esc(V32.abbr?V32.abbr(x.name):x.name)+'</button>'; }).join("")+'</div>';
    return tabs+'<div class="v58-scroll"><table class="v58-t"><thead>'+head+'</thead><tbody>'+shown.map(function(r){ return V58.rowHTML(c,r,null); }).join("")+'</tbody></table></div>'+
      (hidden>0||all?'<div class="v58-more"><button type="button" class="btn sm" id="v58More">'+(all?"접기":"학기 끝까지 "+hidden+"회")+'</button></div>':'');
  };
  V58.summary=function(c){
    var at=(typeof attStats==="function")?attStats(c):{held:0,n:{}}, n=at.n||{}, held=at.held||0;
    var miss=$$("#v58Card tr.v58-r.miss").length;
    var asOf=V58.M&&V58.M.generatedAt?V58.M.generatedAt.replace(/^\d{4}-(\d\d)-(\d\d)T(\d\d:\d\d).*$/,function(_,m,d,t){ return (+m)+"/"+(+d)+" "+t; }):"";
    var mc=V58.M&&V58.M.courses&&V58.M.courses[c.name], nx=null, now=new Date();
    ((mc&&mc.assignments)||[]).forEach(function(a){ if(!a.due||a.status==="제출") return; var d=new Date(a.due.replace("T"," ").replace(/-/g,"/")+":00"); if(!isNaN(d)&&d>=now&&(!nx||a.due<nx.due)) nx=a; });
    return (held?"출석 "+((n.present||0)+(n.late||0)+(n.vlate||0))+"/"+held:"")+(miss?" · 빠진 자료 "+miss+"회차":"")+(nx?" · 다음 마감 "+V58.dueTxt(nx):"")+(asOf?" · PC 자료 "+asOf:"");
  };
  V58.fill=function(c,card){
    var tok=++V58.tok;
    $$("tr.v58-r:not(.fut):not(.hol)",card).forEach(function(tr){
      var date=tr.getAttribute("data-d");
      idb.allForSafe(sessKey(c.id,date)).then(function(res){
        if(tok!==V58.tok||!tr.isConnected) return;
        var counts=V32.countAtt(res); if(!counts.ok) return;
        var tmp=document.createElement("tbody"); tmp.innerHTML=V58.rowHTML(c,{date:date,past:date<today(),today:date===today(),future:false},counts);
        var nr=tmp.firstChild; tr.replaceWith(nr); V58.bindRow(c,nr);
        var hs=$("#v58Hs"); if(hs) hs.textContent=V58.summary(c);
      });
    });
  };
  V58.bindRow=function(c,tr){ if(tr.classList.contains("fut")||tr.classList.contains("hol")) return;
    var open=function(){ logSheet(c.id,tr.getAttribute("data-d")); };
    tr.onclick=open; tr.onkeydown=function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); open(); } }; };
  V58.render=function(){
    var v=$("#v-course"), c=course(ui.course); if(!v||!c||isPersonal(c)||!c.slots||!c.slots.length) return;
    var hero=$("#v55Hero",v); if(!hero) return;
    var card=$("#v58Card",v);
    if(!card){ card=document.createElement("div"); card.id="v58Card"; card.className="card v58";
      card.innerHTML='<div class="card-h"><h3>수업 자료</h3><span class="hs" id="v58Hs"></span></div><div class="v58-b" id="v58B"></div>'; }
    if(card.previousElementSibling!==hero) hero.insertAdjacentElement("afterend",card);
    var draw=function(){
      var b=$("#v58B",card); b.innerHTML=V58.html(c);
      $$("tr.v58-r",b).forEach(function(tr){ V58.bindRow(c,tr); });
      $$(".v58-tab",b).forEach(function(t){ t.onclick=function(){ var id=t.getAttribute("data-c"); if(id===c.id) return; V58.jump=true; go("course",id); }; });
      var mo=$("#v58More",b); if(mo) mo.onclick=function(){ V58.all[c.id]=!V58.all[c.id]; draw(); };
      $("#v58Hs",card).textContent=V58.summary(c);
      V58.fill(c,card);
      if(V58.jump){ V58.jump=false; try{ card.scrollIntoView({block:"start"}); }catch(e){} }
    };
    if(V58.M||V58.P&&V58.P.done) draw(); else { $("#v58B",card).innerHTML='<div class="v58-load">…</div>'; V58.load().then(function(){ V58.P.done=true; if(ui.view==="course"&&course(ui.course)===c) draw(); }); }
  };
  if(window.V55&&V55.render&&!V55._v58){ var _r=V55.render; V55.render=function(){ var x=_r.apply(this,arguments); try{ V58.render(); }catch(e){ if(window.console) console.warn("V58",e); } return x; }; V55._v58=1; }
  var css=document.createElement("style"); css.id="v58css";
  css.textContent=[
    ".v58 .card-h .hs{font-family:var(--font-num,inherit)}",
    ".v58-b{padding:10px 14px 14px}",
    ".v58-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}",
    ".v58-tab{border:2px solid var(--line);background:var(--surface);color:var(--ink-2,#444);border-radius:99px;padding:5px 12px;font-size:12.5px;font-weight:700;cursor:pointer;min-height:32px}",
    ".v58-tab.on{border-color:var(--duo-green-text,#2E7D00);color:var(--duo-green-text,#2E7D00);background:color-mix(in srgb,#58CC02 12%,var(--surface))}",
    ".v58-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}",
    ".v58-t{width:100%;border-collapse:separate;border-spacing:0;font-size:13px;min-width:640px}",
    ".v58-t th{position:sticky;top:0;background:var(--surface);font-size:11.5px;font-weight:800;color:var(--ink-3);text-align:center;padding:6px 4px;border-bottom:2px solid var(--line);white-space:nowrap}",
    ".v58-t th.v58-d,.v58-t td.v58-d{text-align:left}",
    ".v58-t td{padding:7px 4px;border-bottom:1px solid var(--line);text-align:center;vertical-align:middle}",
    ".v58-t tr.v58-r:not(.fut):not(.hol){cursor:pointer}.v58-t tr.v58-r:not(.fut):not(.hol):hover td{background:color-mix(in srgb,var(--line) 35%,transparent)}",
    ".v58-n{width:46px;font-family:var(--font-num,inherit);font-weight:700;color:var(--ink-2,#444);white-space:nowrap}.v58-n small{font-size:10px;color:var(--ink-3);margin-left:1px;font-weight:600}",
    ".v58-d{min-width:150px}.v58-d b{font-weight:800;white-space:nowrap}.v58-d small{display:block;font-size:11px;color:var(--ink-3);line-height:1.35;margin-top:1px}.v58-d small.v58-pre{color:#1E5FA8}",
    ".v58-a{display:inline-block;font-size:11.5px;font-weight:800;padding:2px 8px;border-radius:99px;color:#fff;background:var(--ac,#2E7D00);white-space:nowrap}",
    ".v58-a.fut,.v58-a.none{background:transparent;color:var(--ink-3);border:1.5px solid var(--line)}.v58-a.hol{background:transparent;color:var(--ink-3)}",
    ".v58-c{font-weight:800;font-size:12px;white-space:nowrap}",
    ".v58-c.on{color:#1B7A2E}.v58-c.no{color:#C7261B;background:color-mix(in srgb,#C7261B 7%,transparent)}.v58-c.maybe{color:#9A5B00}.v58-c.pre{color:#1E5FA8}.v58-c.abs{color:var(--ink-3);font-weight:600}.v58-c.opt{color:var(--ink-3);font-weight:500}.v58-c.fut{color:var(--ink-3);font-weight:500}",
    ".v58-t tr.fut td{opacity:.92}.v58-t tr.fut .v58-n{color:var(--ink-3)}",
    ".v58-t tr.today td{background:color-mix(in srgb,#58CC02 8%,transparent)}",
    ".v58-t tr.hol td{color:var(--ink-3)}.v58-holcell{text-align:left!important;font-size:12px}",
    ".v58-t tr.v58-exam td{background:color-mix(in srgb,#FFC800 14%,transparent);font-size:12.5px;text-align:left;color:#7A5200}",
    ".v58-more{display:flex;justify-content:center;margin-top:10px}.v58-load{color:var(--ink-3);padding:8px}",
    ".v58-t tr.v58-asg td{text-align:left;font-size:12.5px;padding:6px 6px;background:color-mix(in srgb,#1CB0F6 7%,transparent)}.v58-t tr.v58-asg.due td{background:color-mix(in srgb,#FF9600 9%,transparent)}",
    ".v58-tag{display:inline-block;font-size:11px;font-weight:800;padding:1px 7px;border-radius:6px;margin-right:4px;color:#fff}.v58-tag.g{background:#1E5FA8}.v58-tag.d{background:#B85C00}",
    ".v58-arrow{color:var(--ink-3);font-weight:700;white-space:nowrap}.v58-t tr.v58-asg small{color:var(--ink-3)}",
    ".v58-st{display:inline-block;font-size:11px;font-weight:800;padding:1px 7px;border-radius:99px;margin-left:6px;border:1.5px solid currentColor}.v58-st.ok{color:#1B7A2E}.v58-st.warn{color:#9A5B00}.v58-st.past{color:var(--ink-3)}.v58-st.soon{color:#C7261B}.v58-st.fut{color:#1E5FA8}",
    ".v58 .sm{display:none}",
    "@media (max-width:600px){.v58-b{padding:8px 6px 12px}.v58-t{min-width:0;font-size:12px}.v58 .lg{display:none}.v58 .sm{display:inline}.v58-t th,.v58-t td{padding:6px 2px}.v58-d{min-width:0}.v58-d small{display:none}.v58-n{width:22px}.v58-n small{display:none}.v58-a{font-size:10.5px;padding:1px 6px}.v58-c{font-size:11.5px}.v58-tab{padding:4px 10px;font-size:12px}}"
  ].join("\n");
  document.head.appendChild(css);
})();
