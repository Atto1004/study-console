/* ============================================================
   V73 LAYER — 공부계획 하루 보기 개편 (대표님 2026-10-04) (BUILD 2026-10-04.157 · .159 화면 기억 · A++O 위치 · 지금 추정 위치)
   ① 보기 전환 = 구글 캘린더식 아이콘(하루 · 한 주) + ‹ 오늘 › 이동 — 「오늘만 · 이번 주 · 다음 주 버튼 말고 1day · 1week 아이콘」
   ② 하루 보기에서 어제 · 내일로 넘기기(V60.ui.off) — 「오늘만에서 어제랑 내일로 이동」
   ③ 시간표 오른쪽 장소 줄(폰에서도) + 경계마다 「14:30 집 → 카페」, 위에 하루 경로 한 줄 — 「위치는 항상 우측 · 어디서 어디로 한눈에」
   ④ 과목 화면 「혼자 풀기」 칸 — 공부계획 · 달력 목록에서는 뺐다(V60.filesHTML) — 「혼자 풀기는 그 과목에만」
   ============================================================ */
(function(){
  if(window.V73||!window.V60) return;
  var V73=window.V73={};
  var p2=function(n){ return (n<10?"0":"")+n; }, hm=function(m){ m=Math.max(0,Math.round(m)); return p2(Math.floor(m/60)%24)+":"+p2(m%60); };
  var IC=function(p){ return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'; };
  var CAL='<rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M8 2.8v3.4M16 2.8v3.4"/>';
  V60.LANE=true;
  /* ① ② 보기 바 */
  V60.viewBar=function(){
    var d=V60.ui.today, isNow=d?!(V60.ui.off||0):!(V60.ui.week||0);
    return '<div class="v73-bar" id="v60Wk"><div class="v73-nav">'+
      '<button type="button" data-v73n="-1" aria-label="'+(d?'전날':'지난 주')+'" title="'+(d?'전날':'지난 주')+'">'+IC('<path d="M14.5 6l-6 6 6 6"/>')+'</button>'+
      '<button type="button" class="v73-tdy" data-v73n="0"'+(isNow?' aria-current="true"':'')+'>오늘</button>'+
      '<button type="button" data-v73n="1" aria-label="'+(d?'다음 날':'다음 주')+'" title="'+(d?'다음 날':'다음 주')+'">'+IC('<path d="M9.5 6l6 6-6 6"/>')+'</button></div>'+
      '<div class="v73-vw" role="group" aria-label="보기">'+
      '<button type="button" data-v73w="d" aria-label="하루" title="하루"'+(d?' aria-pressed="true"':'')+'>'+IC(CAL+'<path d="M10.6 13.4l1.8-1.3v6"/>')+'</button>'+
      '<button type="button" data-v73w="w" aria-label="한 주" title="한 주"'+(!d?' aria-pressed="true"':'')+'>'+IC(CAL+'<path d="M7 12.5v5M10.3 12.5v5M13.7 12.5v5M17 12.5v5"/>')+'</button></div></div>';
  };
  V60.viewBind=function(body){
    $$("[data-v73w]",body).forEach(function(b){ b.onclick=function(){ var td=today(), toDay=b.getAttribute("data-v73w")==="d"; if(toDay===!!V60.ui.today) return;
      if(toDay) V60.ui.off=(V60.ui.week||0)?diffDays(td,addDays(mondayOf(td),7*V60.ui.week)):0;   /* 다른 주를 보다가 하루로 → 그 주 월요일 */
      else V60.ui.week=Math.round(diffDays(mondayOf(td),mondayOf(addDays(td,V60.ui.off||0)))/7);   /* 하루 보다가 주로 → 그날이 든 주 */
      V60.ui.today=toDay; try{ localStorage.setItem("mc-plan-today",toDay?"1":"0"); }catch(e){} V60.render(); }; });
    $$("[data-v73n]",body).forEach(function(b){ b.onclick=function(){ var n=+b.getAttribute("data-v73n");
      if(V60.ui.today) V60.ui.off=n?(V60.ui.off||0)+n:0; else V60.ui.week=n?(V60.ui.week||0)+n:0; V60.render(); }; });
  };
  V60.dayName=function(d){ var n=diffDays(today(),d); if(n===0) return "오늘"; if(n===-1) return "어제"; if(n===1) return "내일";
    return ["일","월","화","수","목","금","토"][new Date(d+"T00:00:00").getDay()]+"요일"; };
  V60.weekName=function(w){ w=w||0; return w===0?"이번 주":w===1?"다음 주":w===-1?"지난 주":w>0?w+"주 뒤":(-w)+"주 전"; };
  /* ③ 장소 줄 — 5분마다 그 시각의 장소(일정 칸의 장소 > 체류) → 같은 곳끼리 묶어 띠, 바뀌는 곳마다 「시각 A → B」 */
  V60.laneOf=function(T,rows,places,y,H){
    var td=today(), nowM=T.d<td?1441:T.d>td?-1:nowMin();
    var at=function(m){
      for(var i=0;i<rows.length;i++){ var b=rows[i]; if(b.stay||!(b.s<=m&&m<b.e)) continue;
        if(b.k==="move") return {mv:1};
        var p=places[i]; if(!p) continue; if(p.trip) return {mv:1,n:p.name};
        if(p.soft) return {n:"학교",s:"",c:1};
        return {n:p.name,s:p.sub||"",c:p.campus?1:0}; }
      var st=V60.stayAt(T.d,m); return st?{n:st.place,s:st.sub||"",c:0}:null; };
    var key=function(p){ return !p?"":p.mv?"~":p.n; };
    var segs=[], STEP=5;
    for(var m=0;m<1440;m+=STEP){ var p=at(m), k=key(p), L=segs[segs.length-1];
      if(L&&L.k===k){ L.e=m+STEP; if(p&&!p.mv&&p.s&&L.p.s!==p.s&&L.p.s.indexOf(p.s)<0) L.p.s=L.p.s?L.p.s+" · "+p.s:p.s; }
      else segs.push({k:k,s:m,e:m+STEP,p:p?Object.assign({},p):null}); }
    var trans=[], last=null, mvStart=null;
    segs.forEach(function(g){ if(!g.p) return; if(g.p.mv){ if(mvStart==null) mvStart=g.s; return; }
      var tm=mvStart!=null?mvStart:g.s;
      if(last&&last.p.n!==g.p.n) trans.push({m:tm,f:last.p,t:g.p,guess:tm>nowM&&tm<=nowM+STEP?1:0});   /* guess = 「지금까지」로 끝난 위치 다음 칸(실제 이동 시각 아님) — 줄에 시각 표시 없이 경로에만 「이후 예상」 */   /* 「지금까지」로 끝난 위치 다음 칸은 실제 이동이 아니다 — 지금 바로 뒤 경계는 빼기 */
      last=g; mvStart=null; });
    var html='<div class="v73-lane" style="height:'+H+'px">'+segs.map(function(g){ if(!g.p) return "";
        var top=y(g.s), ht=Math.max(2,y(g.e)-top), fu=g.s>=nowM?' fu':'';
        return '<div class="v73-ls'+(g.p.mv?' mv':g.p.c?' cp':'')+fu+'" style="top:'+top+'px;height:'+ht+'px">'+(!g.p.mv&&ht>=26?'<b>'+esc(g.p.n)+'</b>'+(g.p.s&&ht>=42?'<small>'+esc(g.p.s)+'</small>':''):'')+'</div>'; }).join("")+
      trans.filter(function(t){ return !t.guess; }).map(function(t){ return '<div class="v73-tr'+(t.m>=nowM?' fu':'')+'" style="top:'+y(t.m)+'px"><time>'+hm(t.m)+'</time><span>'+esc(t.f.n)+' → '+esc(t.t.n)+'</span></div>'; }).join("")+'</div>';
    var first=null; segs.some(function(g){ if(g.p&&!g.p.mv){ first=g; return true; } return false; });
    var route=!first?'':'<div class="v73-route"><small>이동</small><b>'+esc(first.p.n)+'</b>'+
      (trans.length?trans.map(function(t){ return t.guess?'<i>→ 이후 예상</i><b class="fu">'+esc(t.t.n)+'</b>':'<i>→</i><time>'+hm(t.m)+'</time><b'+(t.m>=nowM?' class="fu"':'')+'>'+esc(t.t.n)+'</b>'; }).join(""):'<i>· 하루 종일</i>')+'</div>';
    return {html:html,route:""};   /* 하루 경로 한 줄은 뺐다(대표님 10/4 「상단에 머무는 곳 · 오늘 간 곳 · 이동 다 빼고」) — 오른쪽 장소 줄은 그대로 */
  };
  /* ④ 과목 화면 혼자 풀기 — 제출 파일 목록(_private/submit.json) 중 .html(혼자 풀기)만. 정역학 Ch 버튼(V69)은 그대로 */
  V73.solo=function(){
    var v=$("#v-course"), c=v&&typeof course==="function"?course(ui.course):null; if(!v||!c) return;
    var draw=function(){
      var fs=(V60.files||[]).filter(function(f){ return f.course===c.name&&/\.html(\?|#|$)/.test(f.file); }), box=$("#v73Solo",v);
      if(!fs.length||!ATOM_HOSTED){ if(box) box.remove(); return; }
      var anchor=$("#v69Card",v)||$("#v58Card",v)||$("#v55Hero",v); if(!anchor) return;
      if(!box){ box=document.createElement("div"); box.id="v73Solo"; box.className="card v73-solo"; }
      if(box.previousElementSibling!==anchor) anchor.insertAdjacentElement("afterend",box);
      box.innerHTML='<div class="card-h"><h3>혼자 풀기</h3></div><div class="card-b v73-sb">'+fs.map(function(f,i){ return '<button type="button" class="btn a" data-v73i="'+i+'">'+esc(f.label||"혼자 풀기")+'</button>'; }).join("")+'</div>';
      $$("[data-v73i]",box).forEach(function(b){ b.onclick=function(){ var f=fs[+b.getAttribute("data-v73i")]; if(typeof openNote==="function") openNote(f.file,c.name+" · "+(f.label||"혼자 풀기")); else location.href=f.file; }; });
    };
    if(V60.files==null&&V60.loadFiles) V60.loadFiles().then(draw); else draw();
  };
  if(window.V69&&V69.render){ var _r=V69.render; V69.render=function(){ var x=_r.apply(this,arguments); try{ V73.solo(); }catch(e){} return x; }; }
  /* ⑤ 새로고침해도 보던 화면 그대로 (대표님 10/4 「새로고침하면 과목 화면으로 돌아가는데 마지막에 있던 위치 기억」) — 이 탭(sessionStorage)만, 12시간 안 */
  V73.SK="mc-last-view";
  try{ V73.saved=JSON.parse(sessionStorage.getItem("mc-last-view")||"null"); }catch(e){ V73.saved=null; }   /* 부팅 전에 미리 읽는다 — 부팅 중 첫 화면 이동이 저장을 덮어써서 */
  V73.ready=false;
  V73.save=function(){ if(!V73.ready) return; try{ sessionStorage.setItem(V73.SK,JSON.stringify({v:ui.view,c:ui.course,y:Math.round(window.scrollY||0),t:Date.now(),po:V60.ui.off||0,pw:V60.ui.week||0,pt:!!V60.ui.today})); }catch(e){} };
  if(typeof go==="function"){ var _go=go; go=function(){ var r=_go.apply(this,arguments); V73.save(); return r; }; }
  var svT=0; addEventListener("scroll",function(){ clearTimeout(svT); svT=setTimeout(V73.save,300); },{passive:true});
  addEventListener("pagehide",V73.save); document.addEventListener("visibilitychange",function(){ if(document.hidden) V73.save(); });
  V73.restore=function(){
    var s=V73.saved; V73.saved=null; if(!s||!s.v||Date.now()-s.t>12*3600000){ V73.ready=true; return; }
    if(s.v==="plan"){ V60.ui.off=s.po||0; V60.ui.week=s.pw||0; V60.ui.today=!!s.pt; }
    if(s.v!==ui.view||s.c!==ui.course) go(s.v,s.c||undefined);
    var y=s.y||0, n=0; if(!y){ V73.ready=true; V73.save(); return; }
    var put=function(){ if(document.documentElement.scrollHeight>=y+innerHeight*0.6||n>24){ window.scrollTo(0,y); V73.ready=true; V73.save(); return; } n++; setTimeout(put,250); };   /* 내용이 다 그려질 때까지 기다렸다가 */
    setTimeout(put,300);
  };
  if(typeof boot==="function"){ var _bt=boot; boot=function(){ var r=_bt.apply(this,arguments); try{ V73.restore(); }catch(e){} return r; }; }

  /* ⑥ A++O 위치 = 공부계획 위치 (대표님 10/4) — 서버 위치점(A++O 화면·학습앱 공통, 이 PC 안)을 V72 체류 계산에 합친다. 이름 배우기·우선순위(V60.stayRank)는 그대로 */
  V73.srv=[]; V73.srvAt=0;
  V73.pull=function(force){
    if(!ATOM_HOSTED||(!force&&Date.now()-V73.srvAt<120000)) return; V73.srvAt=Date.now();
    fetch("/api/location/points?days=7",{cache:"no-store"}).then(function(r){ return r.ok?r.json():null; }).then(function(j){
      if(!j||!j.points) return; var ch=j.points.length!==V73.srv.length; V73.srv=j.points; if(ch&&ui.view==="plan") V60.render(); }).catch(function(){});
  };
  V73.pts=function(){ var own=window.V72?V72.st().pts:[]; var extra=V73.srv.filter(function(p){ return !own.some(function(q){ return Math.abs(q.t-p.t)<90000; }); });
    return own.concat(extra).sort(function(a,b){ return a.t-b.t; }); };
  if(window.V72){
    var _cl=V72.clusters; V72.clusters=function(){ var g=V72.st(), keep=g.pts; g.pts=V73.pts(); try{ return _cl.apply(this,arguments); } finally{ g.pts=keep; } };
    var _add=V72.add; V72.add=function(p){ var r=_add.apply(this,arguments);
      try{ var c=p&&p.coords; if(c&&c.accuracy<=1000) fetch("/api/location",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lat:c.latitude,lon:c.longitude,acc:c.accuracy,src:"study"})}).then(function(){ V73.pull(true); }).catch(function(){}); }catch(e){}
      return r; };
  }
  V73.pull(true); setInterval(function(){ if(!document.hidden) V73.pull(); },120000);
  document.addEventListener("visibilitychange",function(){ if(!document.hidden) V73.pull(true); });
  var agoS=function(ms){ var m=Math.max(0,Math.round((Date.now()-ms)/60000)); return m<1?"방금":m<60?m+"분 전":m<1440?Math.round(m/60)+"시간 전":Math.round(m/1440)+"일 전"; };
  /* 지금 추정 위치 — 30분 안 위치점이 있으면 그 자리(배운 이름, 모르면 「새 장소」), 아니면 체류 우선순위(V60.stayAt) */
  V73.now=function(){
    var pts=V73.pts(), last=pts.length?pts[pts.length-1]:null, lt=last?(last.t2||last.t):0;
    if(last&&Date.now()-lt<30*60000&&window.V72){ var cl=V72.clusters(), c=cl[cl.length-1], nm=c?V72.nameOf(c):null;
      return {place:nm||"새 장소",sub:nm?"":"처음 온 곳 — 이름을 말해 주시면 기억해요",when:agoS(lt)+" 위치 기준"}; }
    var st=V60.stayAt(today(),nowMin());
    return {place:st?st.place:"모름",sub:st?(st.sub||""):"",when:last?"마지막 위치 "+agoS(lt)+" · 그 뒤는 짐작":"위치 기록 없음"};
  };
  var _where=V60.whereHTML;
  V60.whereHTML=function(T){
    if(!T) return "";
    var nag=""; try{ var tmp=document.createElement("div"); tmp.innerHTML=_where(T)||""; var g=tmp.querySelector(".v60-tln"); if(g) nag=g.outerHTML; }catch(e){}   /* 22:30 이후 타임라인 내보내기 안내는 그대로(학습앱 세션 10/3) */
    if(T.d!==today()) return nag?'<div class="v60-where">'+nag+'</div>':"";
    var e=V73.now();
    return '<div class="v60-where v73-where"><span><small>지금 추정 위치</small><b>'+esc(e.place)+'</b>'+(e.sub?' '+esc(e.sub):'')+'<em>'+esc(e.when)+'</em></span>'+nag+'</div>';
  };

  var css=document.createElement("style"); css.id="v73css";
  css.textContent=[
    ".v73-bar{display:flex;align-items:center;gap:8px}",
    ".v73-nav,.v73-vw{display:flex;align-items:center;gap:2px;padding:3px;border-radius:12px;background:color-mix(in srgb,var(--line) 45%,transparent)}",
    ".v73-bar button{min-width:36px;height:34px;padding:0 8px;border:0;border-radius:9px;background:transparent;color:var(--ink,#1d1d1f);display:grid;place-items:center;cursor:pointer;font:inherit;font-weight:700;font-size:13px}",
    ".v73-bar button[aria-pressed=true]{background:var(--surface,#fff);box-shadow:0 1px 3px rgba(0,0,0,.12);color:#0a6fd8}",
    ".v73-bar .v73-tdy[aria-current]{color:var(--ink-3)}",
    ".v60-day.lane{grid-template-columns:52px minmax(0,1fr) 150px}",
    ".v60-day.lane .v60-db .v60-dp{display:none!important}",
    ".v73-lane{position:relative;border-left:1px dashed color-mix(in srgb,var(--line) 90%,transparent)}",
    ".v73-ls{position:absolute;left:8px;right:2px;box-sizing:border-box;border-radius:8px;background:color-mix(in srgb,#9CB78B 18%,var(--surface,#fff));border:1px solid color-mix(in srgb,#9CB78B 50%,transparent);padding:4px 7px;overflow:hidden;font-size:12px;line-height:1.3}",
    ".v73-ls.cp{background:color-mix(in srgb,#5B6B8C 13%,var(--surface,#fff));border-color:color-mix(in srgb,#5B6B8C 40%,transparent)}",
    ".v73-ls.mv{background:repeating-linear-gradient(135deg,color-mix(in srgb,#8A94A6 35%,transparent) 0 4px,transparent 4px 8px);border:1px dashed color-mix(in srgb,#8A94A6 55%,transparent)}",
    ".v73-ls.fu{opacity:.5}",
    ".v73-ls b{display:block;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v73-ls small{display:block;color:var(--ink-3);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".v73-tr{position:absolute;left:-4px;right:0;transform:translateY(-50%);z-index:3;display:flex;flex-direction:column;align-items:flex-start;padding:3px 8px;border-radius:10px;background:#1d1d1f;color:#fff;font-size:11px;line-height:1.25;box-shadow:0 2px 8px rgba(0,0,0,.2)}",
    ".v73-tr.fu{background:#5c6270}",
    ".v73-tr time{font-weight:800;font-variant-numeric:tabular-nums}.v73-tr span{font-weight:600;word-break:keep-all}",
    ".v73-route{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 6px;margin:2px 0 10px;font-size:13.5px}.v73-route small{color:var(--ink-3);font-weight:700;margin-right:4px}",
    ".v73-route time{font-size:12px;color:var(--ink-3);font-variant-numeric:tabular-nums}.v73-route i{font-style:normal;color:var(--ink-3)}.v73-route b.fu{opacity:.6}",
    ".v73-sb{display:flex;flex-wrap:wrap;gap:8px}",
    ".v73-where em{font-style:normal;font-size:12px;color:var(--ink-3);margin-left:8px}",
    "@media (max-width:600px){.v60-day.lane{grid-template-columns:40px minmax(0,1fr) 92px;gap:4px}.v73-ls{left:5px;padding:3px 5px;font-size:11px}.v73-tr{font-size:10.5px;padding:2px 6px}.v73-bar{gap:6px}.v73-bar button{min-width:32px;height:32px;padding:0 6px}}"
  ].join("\n");
  document.head.appendChild(css);
})();
