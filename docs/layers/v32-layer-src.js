/* ============================================================
   V32 LAYER — 주차표 · 자료 4종 업로드 여부 · 라이브러리 (BUILD 2026-09-16.32)
   아토 2026-09-16 지시(스프레드시트 사진): 주차×요일 표에 과목·N일차·출결 색, 녹음본·강의자료·내 필기본·칠판 판서
   업로드 여부, 자료별 라이브러리. 오타 회의 2차 GREEN (docs/v32-design-brief-r2.md, _v32-otta-2.md).
   위 코드는 건드리지 않고 전역 함수를 덮어쓰거나 래핑한다.
   ============================================================ */
var V32={LIB:null,LIBERR:false,LIBMAP:{},cur:null,attCache:{},gridTok:0};
(function(){
  /* ---------- 0. 공통 ---------- */
  V32.ABBR={"공업수학1":"공수1","미분적분학2":"미적2","일반물리학2":"일물2","정역학":"정역학","CADD":"CADD",
            "아카데믹글쓰기":"글쓰기","창업아이디어탐색":"창업","사회봉사":"봉사"};
  V32.abbr=function(n){ return V32.ABBR[n]||String(n||"").slice(0,4); };
  V32.md=function(d){ return fmtDate(d).replace(/\(.*$/,""); };          /* "9/4(금)" → "9/4" */
  V32.KIND_LEGACY="판서";                       /* .31 이전 「필기본 올리기」·타임라인 사진이 저장하던 kind → 미분류 */
  V32.ATTCOL={present:"var(--ok)",late:"#D9A400",vlate:"#EA7A1A",ghost:"#7C3AED",excused:"#E0569B",absent:"#C7261B"};
  var fmtSize=function(n){ n=+n||0; return n>=1048576?(n/1048576).toFixed(1)+"MB":n>=1024?Math.round(n/1024)+"KB":n+"B"; };

  /* ---------- 1. 출결 6종 ---------- */
  (function(){
    var old=Object.assign({},ATT);
    Object.keys(ATT).forEach(function(k){ delete ATT[k]; });
    ATT.present=old.present||{n:"출석",sh:"P"};
    ATT.late=old.late||{n:"지각",sh:"L"};
    ATT.vlate={n:"개큰지각",sh:"VL"};
    ATT.ghost=old.ghost||{n:"출튀",sh:"G"};
    ATT.excused={n:"인정결석",sh:"E"};
    ATT.absent=old.absent||{n:"결석",sh:"A"};
  })();
  /* attStats 덮어쓰기 — 6종 집계. 출석 인정(rate 분자) = present+late+vlate+ghost+excused. 결석 환산 = absent + floor((late+vlate)/lta). 휴강은 status 가 없어 held 에서 빠진다 */
  attStats=function(c){
    var ss=sessions(c.id), n={present:0,late:0,vlate:0,ghost:0,excused:0,absent:0};
    ss.forEach(function(s){ if(s.cancelled) return; if(n[s.status]!=null) n[s.status]++; });
    var lta=+c.lateToAbsent||+S.profile.lateToAbsent||3;
    var eff=n.absent+Math.floor((n.late+n.vlate)/lta);
    var cancelledN=ss.filter(function(s){return s.cancelled;}).length;
    var total=Math.max(1,(planned(c).length||term().weeks)-cancelledN);
    var limit=+c.absentLimit>0 ? +c.absentLimit : Math.max(1,Math.floor(total*(S.profile.absentLimitRatio||0.25)));
    var held=ss.filter(function(s){return !!s.status && !s.cancelled;}).length;
    var att=n.present+n.late+n.vlate+n.ghost+n.excused;
    return {n:n,eff:eff,limit:limit,held:held,total:total,
      rate:held?Math.round(att/held*100):null, risk:limit?eff/limit:0,
      lateN:n.late+n.vlate};
  };

  /* ---------- 2. 자료 4종 ---------- */
  MUST.length=0;
  MUST.push(
    {k:"rec",  slot:"rec",  kinds:["녹음"],     lib:"rec",   icon:"🎙", n:"녹음본",    how:"클로바노트 텍스트를 붙여넣거나 녹음 파일을 첨부"},
    {k:"pre",  slot:"pre",  kinds:["자료"],     lib:"pre",   icon:"📘", n:"강의자료",  how:"교수님 강의자료·교재 PDF 를 첨부"},
    {k:"note", slot:"note", kinds:["필기본"],   lib:"note",  icon:"✍️", n:"내 필기본", how:"내가 쓴 필기를 사진으로 첨부", legacy:true},
    {k:"board",slot:"",     kinds:["칠판판서"], lib:"board", icon:"🧱", n:"칠판 판서", how:"칠판·화이트보드 사진을 첨부", legacy:true}
  );
  V32.KINDS_ATT=["자료","필기본","칠판판서","녹음","족보","기타"];   /* 첨부 kind 선택지. 기존 "판서" 는 새로 고르지 못하고 미분류로만 남는다 */
  V32.ensureKindOptions=function(sel){
    if(!sel) return;
    var have={}; $$("option",sel).forEach(function(o){ have[o.value||o.textContent]=1; });
    V32.KINDS_ATT.forEach(function(k){ if(!have[k]){ var o=document.createElement("option"); o.textContent=k; sel.appendChild(o); } });
  };
  /* 같은 이름의 과목이 둘이면 이름으로 연결하지 않는다(오타 2차·3차) */
  V32.dupNames=function(){ var m={},d={}; coursesAll().forEach(function(c){ if(m[c.name]) d[c.name]=1; m[c.name]=1; }); return d; };
  V32.courseByName=function(){ var d=V32.dupNames(), out={}; courses().forEach(function(c){ if(!d[c.name]) out[c.name]=c; }); return out; };
  /* PC 인벤토리 조회: {rec:n,pre:n,...} · null = 인벤토리 없음/못 읽음/이름 중복 */
  V32.pcOf=function(cname,date){ if(!V32.LIB||V32.dupNames()[cname]) return null; return V32.LIBMAP[cname+"|"+date]||{}; };
  /* 새 첨부 정규화 — 타임라인 사진(6295행)이 예전 kind "판서"로 저장되는 것을 칠판판서로 (오타 3차) */
  V32.normalizeAtt=function(a){ if(a&&a.tl&&a.kind===V32.KIND_LEGACY&&!a.v32legacy) a.kind="칠판판서"; return a; };
  (function(){ var _put=idb.put; idb.put=function(a){ V32.normalizeAtt(a); return _put.apply(idb,arguments); }; })();
  /* 첨부 목록 → kind 별 개수. 타임라인 사진(tl)도 센다 — 원본 6170행은 뺐지만 판서 사진은 대개 타임라인에 붙는다 */
  V32.countAtt=function(r){
    var counts={ok:!!(r&&r.ok),map:{},tlLegacy:0};
    if(r&&r.ok) r.list.forEach(function(a){ var k=(typeof a.kind==="string"&&a.kind)?a.kind:"_none"; counts.map[k]=(counts.map[k]||0)+1; if(a.tl&&a.kind===V32.KIND_LEGACY) counts.tlLegacy++; });
    return counts;
  };
  /* 종류별 상태. 기기(첨부·슬롯) 판정은 PC 조회 실패와 무관하게 유지한다(오타 2차 조건) */
  V32.kindState=function(m,sl,counts,pc){
    var txt=(m.slot&&typeof sl[m.slot]==="string")?sl[m.slot].trim():"";
    var dev=null, legacy=0, devUnknown=false;
    if(counts&&counts.ok){ dev=0; m.kinds.forEach(function(kd){ dev+=(counts.map[kd]||0); }); if(m.legacy) legacy=counts.map[V32.KIND_LEGACY]||0; }
    else if(counts&&!counts.ok) devUnknown=true;
    var pcN=pc? (pc[m.lib]||0) : 0, pcUnknown=(pc===null);
    var st;
    if(txt||dev>0) st="have";
    else if(legacy>0) st="maybe";
    else if(pcN>0) st="pc";
    else if(dev===null&&!txt&&!devUnknown) st="pending";
    else if(devUnknown||pcUnknown) st="unknown";
    else st="none";
    return {st:st,txt:txt,dev:dev,legacy:legacy,devUnknown:devUnknown,pcN:pcN,pcUnknown:pcUnknown};
  };
  /* mustHTML 덮어쓰기 — 분모 MUST.length, 출처별 개수 분리, 미분류 안내, PC 보관 표시 */
  mustHTML=function(sl,counts){
    var cur=V32.cur||{}, c=cur.cid?course(cur.cid):null;
    var pc=(c&&cur.date)? V32.pcOf(c.name,cur.date) : null;
    var rows="", miss=[], done=0, unknown=false, N=MUST.length;
    MUST.forEach(function(m){
      var r=V32.kindState(m,sl,counts,pc);
      if(r.st==="have"||r.st==="pc") done++;
      else if(r.st==="unknown") unknown=true;
      else if(r.st==="none") miss.push(m.n);
      var bits=[];
      if(r.txt) bits.push("텍스트 "+r.txt.length+"자");
      if(r.dev>0) bits.push("기기 "+r.dev+"개");
      if(r.legacy>0) bits.push('<span class="v32-legacy">미분류 '+r.legacy+'개'+(counts&&counts.tlLegacy?' (타임라인 사진 '+counts.tlLegacy+')':'')+'</span>');
      if(r.pcN>0) bits.push("PC "+r.pcN+"개"+(r.st==="pc"?" · 열기 미지원":""));
      if(r.pcUnknown&&V32.LIBERR) bits.push('<span class="smut">PC 확인 못 함</span>');
      var dot = r.st==="have"?"on" : r.st==="pc"?"on pc" : r.st==="maybe"?"unk" : r.st==="pending"?"unk" : r.st==="unknown"?"unk" : "no";
      var body = r.st==="none"? '<b class="sno">안 올림</b>'
               : r.st==="pending"? '<span class="smut">확인 중…</span>'
               : r.st==="unknown"? '<span class="smut">확인 못 함</span>'+(bits.length?" · "+bits.join(" · "):"")
               : bits.join(" · ");
      var sub = (r.st==="none"||r.st==="unknown")? '<div class="ss">'+esc(m.how)+'</div>'
              : r.st==="maybe"? '<div class="ss">예전 「판서」로 저장된 첨부입니다 — 아래 첨부 칸에서 필기본/칠판판서로 분류하세요</div>'
              : (r.dev>0&&counts&&counts.ok&&(counts.map["_none"]||0)>0? '<div class="ss">종류가 안 적힌 첨부가 '+counts.map["_none"]+'개 있습니다</div>':"");
      var btn;
      if(r.txt) btn='<button class="btn xs" data-must="'+m.k+'" data-act="seeText">보기</button>';
      else if(r.dev>0) btn='<button class="btn xs" data-must="'+m.k+'" data-act="seeAtt">보기</button>';
      else if(r.st==="maybe") btn='<button class="btn xs a" data-v32class="1">분류하기</button>';
      else if(m.k==="rec") btn='<button class="btn xs a" data-must="'+m.k+'" data-act="putText">올리기</button>';
      else btn='<button class="btn xs a" data-v32put="'+m.kinds[0]+'">올리기</button>';
      rows+='<div class="sumrow must'+(r.st==="have"||r.st==="pc"?"":(r.st==="none"?" miss":" pend"))+'">'+
        '<span class="sdot '+dot+'"></span><div class="sk">'+m.icon+' '+m.n+'</div>'+
        '<div class="sv">'+body+sub+'</div>'+btn+'</div>';
    });
    var head = unknown? '<span class="mh warn">'+done+' / '+N+' — 일부 확인 못 함</span>'
      : miss.length? '<span class="mh bad">'+done+' / '+N+' — '+esc(miss.join(" · "))+' 빠짐</span>'
      : (done===N? '<span class="mh good">'+N+' / '+N+' — 다 올렸습니다</span>'
                 : '<span class="mh">'+done+' / '+N+' 확인 중…</span>');
    return '<div class="mustbox"><div class="musth">수업 후 올릴 것 '+head+'</div>'+rows+'</div>';
  };
  /* 「올리기」(파일) · 「분류하기」 — 원본 bindMust 는 data-must 만 잡으므로 여기서 위임 처리 */
  document.addEventListener("click",function(e){
    var t=e.target; if(!t||!t.closest) return;
    var b=t.closest("[data-v32put],[data-v32class]"); if(!b) return;
    var root=b.closest("#sheet")||document;
    var att=$("#lqAtt",root); if(att&&att.scrollIntoView) att.scrollIntoView({block:"center"});
    if(b.dataset.v32class) return;
    var sel=$("#lqAttKind",root), fb=$("#lqFileBtn",root);
    if(sel){ V32.ensureKindOptions(sel); sel.value=b.dataset.v32put; }
    if(fb) fb.click();
  },true);
  /* 원본 bindMust 와 같은 동작 — 우리가 다시 그린 요약 상자의 data-must 버튼용 */
  V32.bindMust=function(box,cid,date){
    var reopen=function(){ closeSheet(); logSheet(cid,date); };
    $$("[data-must]",box).forEach(function(b){ b.onclick=function(){
      var k=b.dataset.must, act=b.dataset.act;
      if(act==="seeText"||act==="putText"){ captureLog(cid,date); slotSheet(cid,date,k,reopen); return; }
      var att=$("#lqAtt",$("#sheet")||document); if(att&&att.scrollIntoView) att.scrollIntoView({block:"center"});
    }; });
  };
  /* 재분류 — 입력 중이던 진도·메모를 먼저 거두고(captureLog) 다시 연다 (오타 3차 조건) */
  V32.reclassify=function(cid,date,ids,kind){
    return Promise.all(ids.map(function(id){ return idb.get(id).then(function(a){ if(!a) return; a.kind=kind; return idb.put(a); }); }))
      .then(function(){ toast(kind+"로 분류했습니다"); captureLog(cid,date); closeSheet(); logSheet(cid,date); });
  };
  /* logSheet 래핑 — 현재 회차를 기억(mustHTML 이 PC 인벤토리를 찾을 때), kind 선택지 보강, 4종 요약을 타임라인 사진까지 세어 다시 그림, 미분류 첨부에 분류 셀렉트·일괄 버튼 */
  var _logSheet=logSheet;
  logSheet=function(cid,date){
    V32.cur={cid:cid,date:date};
    _logSheet(cid,date);
    var root=$("#sheet"); if(!root||!window.MutationObserver) return;
    V32.ensureKindOptions($("#lqAttKind",root));
    var key=sessKey(cid,date), tlLegacyIds=[];
    /* (1) 4종 요약: 원본이 채운 내용(타임라인 제외 집계)을 우리 집계로 바꾼다. 우리 것엔 data-v32mine 표식 */
    var must=$("#lqSumMust",root);
    var refill=function(){
      if(!must||!must.isConnected) return;
      var first=must.firstElementChild; if(first&&first.hasAttribute("data-v32mine")) return;
      idb.allForSafe(key).then(function(r){
        if(!must.isConnected||must!==$("#lqSumMust",$("#sheet")||document)) return;
        var f2=must.firstElementChild; if(f2&&f2.hasAttribute("data-v32mine")) return;
        var counts=V32.countAtt(r);
        tlLegacyIds=(r&&r.ok)? r.list.filter(function(a){return a.tl&&a.kind===V32.KIND_LEGACY;}).map(function(a){return a.id;}) : [];
        var s0=sessionOn(cid,date), sl=(s0&&s0.slots&&typeof s0.slots==="object")?s0.slots:{};
        V32.cur={cid:cid,date:date};
        must.innerHTML=mustHTML(sl,counts);
        if(must.firstElementChild) must.firstElementChild.setAttribute("data-v32mine","1");
        V32.bindMust(must,cid,date);
        bulk();
      });
    };
    if(must){ new MutationObserver(refill).observe(must,{childList:true}); refill(); }
    /* (2) 첨부 칸: 예전 「판서」 첨부에 분류 셀렉트, 타임라인 사진은 일괄 버튼 */
    var box=$("#lqAtt",root); if(!box) return;
    var bulk=function(){
      var old=$("#v32TlReclass",root); if(old) old.remove();
      if(!tlLegacyIds.length) return;
      var div=document.createElement("div"); div.id="v32TlReclass"; div.className="hint v32-bulk";
      div.innerHTML='타임라인 사진 중 예전 「판서」로 저장된 미분류 '+tlLegacyIds.length+'개 → '+
        '<button class="btn xs" data-tlk="필기본">전부 내 필기본</button> <button class="btn xs" data-tlk="칠판판서">전부 칠판 판서</button>';
      box.insertAdjacentElement("afterend",div);
      $$("[data-tlk]",div).forEach(function(b){ b.onclick=function(){ V32.reclassify(cid,date,tlLegacyIds.slice(),b.dataset.tlk); }; });
    };
    var decorate=function(){
      $$(".att-cell",box).forEach(function(cell){
        if(cell.querySelector(".v32-reclass")) return;
        var kb=cell.querySelector(".kb"), del=cell.querySelector("[data-adel]");
        if(!kb||!del||kb.textContent!==V32.KIND_LEGACY) return;
        var id=del.dataset.adel;
        var sel=document.createElement("select"); sel.className="select v32-reclass"; sel.title="필기본인지 칠판 판서인지 분류";
        ["미분류","필기본","칠판판서"].forEach(function(k){ var o=document.createElement("option"); o.textContent=k; sel.appendChild(o); });
        sel.onchange=function(){ var k=sel.value; if(k==="미분류") return; V32.reclassify(cid,date,[id],k); };
        cell.appendChild(sel);
      });
    };
    new MutationObserver(decorate).observe(box,{childList:true});
    decorate();
  };

  /* ---------- 3. PC 인벤토리 ---------- */
  V32.loadLib=function(){
    return fetch("knowledge/library.json",{cache:"no-store"}).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); })
      .then(function(d){
        V32.LIB=d; V32.LIBERR=false; V32.LIBMAP={};
        (d.items||[]).forEach(function(it){ var k=it.course+"|"+it.date; var m=V32.LIBMAP[k]||(V32.LIBMAP[k]={}); m[it.type]=(m[it.type]||0)+1; });
      }).catch(function(){ V32.LIB=null; V32.LIBERR=true; V32.LIBMAP={}; });
  };

  /* ---------- 4. N일차 (수강 시작일·휴강 제외, 보강 포함) ---------- */
  V32.meetings=function(c){
    var from=c.enrolledFrom||"";
    var list=planned(c).map(function(p){return p.date;}).filter(function(d){
      if(from&&d<from) return false; var s=sessionOn(c.id,d); return !(s&&s.cancelled); });
    var t=term();
    sessions(c.id).forEach(function(s){
      if(s.cancelled) return; if(from&&s.date<from) return;
      if(s.date<t.startDate||s.date>t.endDate) return;          /* 학기 밖(개강 전 자동 출석 등)은 회차가 아니다 */
      if(list.indexOf(s.date)<0 && (s.status||s.startedAt||s.progress)) list.push(s.date);
    });
    return list.sort();
  };
  V32.nth=function(c,date){ var i=V32.meetings(c).indexOf(date); return i<0?0:i+1; };
  /* 아토 2026-09-16 스프레드시트 기록 — 색이 칠해진 칸은 아토의 최신 진술이라 기존 상태를 덮어쓴다. 검정(출석)은 비어 있을 때만 채운다. 오늘(9/16)은 앱 자동 출석에 맡긴다 */
  V32.SHEET=[
    ["공업수학1","2026-09-02","excused"],["일반물리학2","2026-09-02","excused"],
    ["미분적분학2","2026-09-08","excused"],["아카데믹글쓰기","2026-09-08","excused"],["CADD","2026-09-08","excused"],
    ["공업수학1","2026-09-09","excused"],["일반물리학2","2026-09-09","excused"],["정역학","2026-09-09","absent"],
    ["미분적분학2","2026-09-10","vlate"],["공업수학1","2026-09-11","late"],["창업아이디어탐색","2026-09-14","absent"]
  ];
  V32.SHEET_PRESENT=[
    ["미분적분학2","2026-09-01"],["아카데믹글쓰기","2026-09-01"],["CADD","2026-09-01"],["미분적분학2","2026-09-03"],
    ["공업수학1","2026-09-04"],["일반물리학2","2026-09-04"],["정역학","2026-09-07"],["창업아이디어탐색","2026-09-07"],
    ["일반물리학2","2026-09-11"],["정역학","2026-09-14"],["미분적분학2","2026-09-15"],["CADD","2026-09-15"],["아카데믹글쓰기","2026-09-15"]
  ];
  V32.SHEET_PROGRESS=[["미분적분학2","2026-09-15","12.1-12.2 (위치벡터)"]];
  V32.ensureSession=function(cid,date){          /* setSession 과 같은 모양, XP 는 주지 않는다(오타 1차) */
    var t=term(), s=sessionOn(cid,date);
    if(!s){ s={id:uid(),courseId:cid,date:date,week:weekOf(date),status:null,progress:"",und:null,reviewed:false,memo:"",
              slots:{pre:"",note:"",rec:"",notice:""},startedAt:"",endedAt:"",knew:"",stuck:"",learned:"",missedFrom:"",timeline:[]}; t.sessions.push(s); }
    return s;
  };
  V32.patch=function(){
    var t=term(), byName={}; t.courses.forEach(function(c){ byName[c.name]=c; });
    if(!t.patchV32a){
      var st=byName["정역학"];
      if(st&&!st.enrolledFrom) st.enrolledFrom="2026-09-03";   /* 9/3 수강정정(V3 패치 근거) → 9/7 = 1일차 */
      if(st){ var s2=sessionOn(st.id,"2026-09-02"); if(s2){ s2.status=null; s2.cancelled=true; } }   /* 수강 전 OT — 출결 집계 제외 */
      t.patchV32a=true;
    }
    if(!t.patchV32b){
      V32.SHEET.forEach(function(r){ var c=byName[r[0]]; if(!c) return; var s=V32.ensureSession(c.id,r[1]); s.status=r[2]; s.cancelled=false;
        if(!s.memo) s.memo="출결: 아토 주차표 기록 2026-09-16"; });
      V32.SHEET_PRESENT.forEach(function(r){ var c=byName[r[0]]; if(!c) return; var s=V32.ensureSession(c.id,r[1]); if(!s.status&&!s.cancelled) s.status="present"; });
      V32.SHEET_PROGRESS.forEach(function(r){ var c=byName[r[0]]; if(!c) return; var s=V32.ensureSession(c.id,r[1]); if(!(s.progress||"").trim()) s.progress=r[2]; });
      t.patchV32b=true;
    }
    persist();
  };

  /* ---------- 5. 회차 자료 점 4개 (동기: 슬롯+PC, 비동기: 첨부) ---------- */
  V32.dotsHTML=function(c,date,counts){
    var s=sessionOn(c.id,date), sl=(s&&s.slots)||{}, pc=V32.pcOf(c.name,date);
    return '<span class="v32-dots" data-c="'+c.id+'" data-d="'+date+'">'+MUST.map(function(m){
      var r=V32.kindState(m,sl,counts||null,pc);
      var cls= r.st==="have"?"on" : r.st==="pc"?"pc" : r.st==="maybe"?"maybe" : (r.st==="pending"||r.st==="unknown")?"unk" : "no";
      return '<i class="'+cls+'" title="'+m.n+' — '+(r.st==="have"?"올림":r.st==="pc"?"PC 보관":r.st==="maybe"?"미분류 첨부":r.st==="none"?"안 올림":"확인 중")+'">'+m.icon+'</i>';
    }).join("")+'</span>';
  };
  V32.fillDots=function(scope){
    var tok=++V32.gridTok;
    $$(".v32-dots",scope).forEach(function(el){
      var cid=el.dataset.c, date=el.dataset.d, key=sessKey(cid,date);
      var c=course(cid); if(!c) return;
      idb.allForSafe(key).then(function(r){
        if(tok!==V32.gridTok||!el.isConnected) return;
        var counts=V32.countAtt(r);
        var tmp=document.createElement("span"); tmp.innerHTML=V32.dotsHTML(c,date,counts);
        el.replaceWith(tmp.firstChild);
      });
    });
  };
  /* 그날 마감 과제 (모든 주차 노트) */
  V32.tasksDue=function(c,date){
    var out=[]; var wn=c.weekNotes||{};
    Object.keys(wn).forEach(function(w){ (wn[w].tasks||[]).forEach(function(k){ if(k&&k.due===date) out.push(k); }); });
    (c.tasks||[]).forEach(function(k){ if(k&&k.due===date) out.push(k); });
    return out;
  };

  /* ---------- 6. 주차표 (달력 탭 세그먼트) ---------- */
  V32.cellLine=function(c,date,td){
    if(c.enrolledFrom&&date<c.enrolledFrom) return "";      /* 수강 전 회차는 표에 없다 */
    var s=sessionOn(c.id,date), st=s?s.status:null, cancelled=!!(s&&s.cancelled);
    var n=cancelled?0:V32.nth(c,date), col=cancelled?"var(--mut)":(st&&V32.ATTCOL[st])||"inherit";
    var tasks=V32.tasksDue(c,date), future=date>td;
    var makeup=(st==="excused"||st==="ghost"||st==="absent");
    var prog=(s&&s.progress||"").trim();
    return '<div class="v32-line'+(future?" fut":"")+'" data-c="'+c.id+'" data-d="'+date+'" style="color:'+col+'">'+
      '<div class="v32-l1"><b>'+esc(V32.abbr(c.name))+'</b>'+(cancelled?' <span class="v32-tag">휴강</span>':(n?' '+n+'일차':''))+
        (st&&st!=="present"?' <span class="v32-sh" style="background:'+col+'">'+esc(ATT[st]?ATT[st].sh:st)+'</span>':'')+
        (makeup?' <span class="v32-tag">보충</span>':'')+
        (future||cancelled?'':V32.dotsHTML(c,date))+'</div>'+
      ((prog||tasks.length)?'<div class="v32-l2">'+(prog?'<span class="v32-prog">'+esc(prog.length>40?prog.slice(0,40)+"…":prog)+'</span>':'')+
        tasks.map(function(k){ return '<span class="v32-task'+(k.done?" done":"")+'">['+esc((k.text||"").slice(0,18))+']</span>'; }).join("")+'</div>':'')+
      '</div>';
  };
  V32.weekLabel=function(w){ var ws=weekStart(w); return w+"주차 · "+V32.md(ws); };
  V32.renderGrid=function(){
    var t=term(), td=today(), cs=courses().filter(function(c){return c.slots&&c.slots.length;});
    var cw=weekOf(td), isPhone=window.innerWidth<=600, table=isPhone? !!ui.gridTable : true;
    if(ui.gridWeek==null) ui.gridWeek=cw||1;
    $("#calTitle").textContent=t.label+" · 주차표";
    $("#calHs").textContent=cw?("이번 주 "+cw+"주차"):"개강 전";
    /* 과목 칩 (결석/지각) */
    var chips=cs.map(function(c){ var a=attStats(c);
      return '<span class="v32-chip t-'+esc(c.typeA)+'"><i style="background:var(--tcv)"></i>'+esc(c.name)+' <b>('+a.n.absent+'/'+a.lateN+')</b></span>'; }).join("");
    var legend='<div class="v32-legend">'+["absent","late","excused","ghost","vlate"].map(function(k){
      return '<span><i style="background:'+V32.ATTCOL[k]+'"></i>'+ATT[k].n+' '+ATT[k].sh+'</span>'; }).join("")+
      '<span class="v32-dots demo"><i class="on">🎙</i><i class="on">📘</i><i class="on">✍️</i><i class="on">🧱</i> 녹음·자료·필기·판서 (초록 올림 · 파랑 PC · 노랑 미분류 · 회색 없음)</span></div>';
    var tools='<div class="v32-tools">'+
      (isPhone?'<button class="btn sm" id="v32Toggle">'+(table?"목록으로":"표로 보기")+'</button>':'')+
      '<button class="btn sm" id="v32Lib">📚 라이브러리</button>'+
      (V32.LIBERR?'<span class="chip warn">PC 인벤토리 확인 못 함</span>':V32.LIB?'<span class="chip mut">PC 인벤토리 '+esc(V32.LIB.asOf||"")+'</span>':'')+'</div>';
    var byDow=function(w){ var out={1:[],2:[],3:[],4:[],5:[]}; var ws=weekStart(w);
      for(var d=1;d<=5;d++){ var date=addDays(ws,(d-D(ws).getDay()+7)%7); var hol=holidayOn(date);
        out[d]={date:date,hol:hol,items:cs.filter(function(c){ return c.slots.some(function(sl){return sl.d===d;}); })}; }
      return out; };
    var html;
    if(table){
      var head='<tr><th class="v32-wk"></th>'+[1,2,3,4,5].map(function(d){return '<th>'+DAY[d]+'</th>';}).join("")+'</tr>';
      var rows="";
      for(var w=1;w<=t.weeks;w++){
        var dows=byDow(w);
        rows+='<tr class="'+(w===cw?"cur":"")+'"><th class="v32-wk">'+w+'주차<small>'+esc(V32.md(weekStart(w)))+'</small></th>'+[1,2,3,4,5].map(function(d){
          var o=dows[d], inTerm=(o.date>=t.startDate&&o.date<=t.endDate);
          if(!inTerm) return '<td class="off"></td>';
          if(o.hol) return '<td class="hol"><span class="v32-tag">휴강 '+esc(o.hol.name||o.hol.label||"")+'</span></td>';
          return '<td class="'+(o.date===td?"today":"")+'">'+o.items.map(function(c){return V32.cellLine(c,o.date,td);}).join("")+'</td>';
        }).join("")+'</tr>';
      }
      html='<div class="v32-scroll"><table class="v32-grid"><thead>'+head+'</thead><tbody>'+rows+'</tbody></table></div>';
    } else {
      var w2=clamp(ui.gridWeek,1,t.weeks), dows2=byDow(w2);
      html='<div class="v32-wknav"><button class="btn sm" data-gw="-1">‹</button><b>'+esc(V32.weekLabel(w2))+(w2===cw?' <span class="chip">이번 주</span>':'')+'</b><button class="btn sm" data-gw="1">›</button></div>'+
        [1,2,3,4,5].map(function(d){ var o=dows2[d], inTerm=(o.date>=t.startDate&&o.date<=t.endDate);
          return '<div class="v32-day'+(o.date===td?" today":"")+'"><div class="v32-dh">'+DAY[d]+' <small>'+esc(V32.md(o.date))+'</small>'+(o.hol?' <span class="v32-tag">휴강</span>':'')+(inTerm?'':' <span class="v32-tag">학기 밖</span>')+'</div>'+
            ((o.hol||!inTerm)?'':(o.items.length?o.items.map(function(c){return V32.cellLine(c,o.date,td);}).join(""):'<div class="hint">수업 없음</div>'))+'</div>'; }).join("");
    }
    $("#calBody").innerHTML='<div class="v32-wrap"><div class="v32-chips">'+chips+'</div>'+legend+tools+html+'</div>';
    var body=$("#calBody");
    var tg=$("#v32Toggle",body); if(tg) tg.onclick=function(){ ui.gridTable=!ui.gridTable; renderCal(); };
    var lb=$("#v32Lib",body); if(lb) lb.onclick=function(){ go("lib"); };
    $$("[data-gw]",body).forEach(function(b){ b.onclick=function(){ ui.gridWeek=clamp((ui.gridWeek||cw||1)+(+b.dataset.gw),1,t.weeks); renderCal(); }; });
    $$(".v32-line",body).forEach(function(el){ el.onclick=function(){ logSheet(el.dataset.c,el.dataset.d); }; });
    if(table){ var cur=$("tr.cur",body); if(cur&&cur.scrollIntoView) try{ cur.scrollIntoView({block:"center"}); }catch(e){} }
    V32.fillDots(body);
  };
  var _renderCal=renderCal;
  renderCal=function(){
    var lg=$("#calLegend"), lgCard=lg&&lg.closest?lg.closest(".card"):null;
    if((ui.calMode||"month")!=="grid"){ if(lgCard) lgCard.style.display=""; _renderCal(); return; }
    $$("#calMode button").forEach(function(b){ b.setAttribute("aria-pressed", b.dataset.m==="grid"?"true":"false"); });
    $("#calSub").textContent="주차 × 요일 · 회차 · 출결 · 자료 4종";
    $("#calNav").style.display="none"; $("#calAdd").style.display="none";
    if(lg) lg.innerHTML=""; if(lgCard) lgCard.style.display="none";    /* 달력 범례 카드는 주차표에서 숨긴다(범례는 표 위에 따로) */
    V32.renderGrid();
  };

  /* ---------- 7. 라이브러리 뷰 ---------- */
  V32.TYPES=[["rec","🎙 녹음본"],["pre","📘 강의자료"],["note","✍️ 내 필기본"],["board","🧱 칠판 판서"],["summary","📝 정리"],["hw","📎 과제"],["derived","🧾 파생 텍스트"],["other","📁 기타"],["dev","📱 이 기기 첨부"]];
  V32.renderLib=function(){
    var v=$("#v-lib"); if(!v) return;
    var type=ui.libType||"rec", cs=courses(), byName=V32.courseByName();   /* 이름이 겹치는 과목은 미연결 */
    var tabs='<div class="v32-tabs">'+V32.TYPES.map(function(x){ return '<button class="btn sm'+(x[0]===type?" a":"")+'" data-lt="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>';
    var body="";
    if(type==="dev"){
      body='<div class="hint" id="v32DevList">이 기기의 첨부를 읽는 중…</div>';
    } else if(!V32.LIB){
      body='<div class="card"><div class="hint">'+(V32.LIBERR?'PC 인벤토리(knowledge/library.json)를 못 읽었습니다. 이 목록은 atom 비서앱 안(/study/)에서만 보입니다 — 공개 페이지에는 올리지 않습니다.':'불러오는 중…')+'</div></div>';
    } else {
      var items=(V32.LIB.items||[]).filter(function(i){return i.type===type;});
      var common=(V32.LIB.common||[]).filter(function(i){return i.type===type;});
      var groups={}; items.forEach(function(i){ (groups[i.course]=groups[i.course]||[]).push(i); });
      var names=Object.keys(groups).sort();
      body=names.length? names.map(function(nm){
        var c=byName[nm], list=groups[nm].sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:a.file<b.file?-1:1;});
        return '<div class="card v32-lib"><div class="v32-lh"><b>'+esc(nm)+'</b>'+(c?'':' <span class="chip warn">앱 과목과 미연결</span>')+' <span class="smut">'+list.length+'개</span></div>'+
          list.map(function(i){ var n=c?V32.nth(c,i.date):0;
            return '<div class="v32-li"><span class="v32-ld">'+esc(fmtDate(i.date))+(n?' <small>'+n+'일차</small>':'')+'</span>'+
              '<span class="v32-lf">'+esc(i.file)+(i.tags&&i.tags.length?' <span class="v32-tag">'+esc(i.tags.join(","))+'</span>':'')+'</span>'+
              '<span class="v32-ls">'+fmtSize(i.size)+' · PC</span>'+
              (c?'<button class="btn xs" data-open-c="'+c.id+'" data-open-d="'+i.date+'">회차</button>':'')+'</div>'; }).join("")+'</div>'; }).join("")
        : '<div class="card"><div class="hint">이 종류의 PC 자료가 없습니다.</div></div>';
      if(common.length){
        var cg={}; common.forEach(function(i){ (cg[i.course+" / "+i.folder]=cg[i.course+" / "+i.folder]||[]).push(i); });
        body+='<h2 class="v32-h2">과목 공통 폴더</h2>'+Object.keys(cg).sort().map(function(k){
          return '<div class="card v32-lib"><div class="v32-lh"><b>'+esc(k)+'</b> <span class="smut">'+cg[k].length+'개</span></div>'+
            cg[k].map(function(i){ return '<div class="v32-li"><span class="v32-lf">'+esc(i.file)+'</span><span class="v32-ls">'+fmtSize(i.size)+' · PC</span></div>'; }).join("")+'</div>'; }).join("");
      }
    }
    v.innerHTML='<div class="vh"><h1>라이브러리</h1><div class="sub">자료 종류별 · 과목별 · 날짜순'+(V32.LIB?' · PC 인벤토리 '+esc(V32.LIB.asOf||""):'')+'</div></div>'+tabs+body+
      '<div class="hint" style="margin-top:10px">PC 파일은 이름만 보입니다(열기 미지원). 기기 첨부는 회차 기록에서 엽니다. 미결: PC 파일 열기.</div>';
    $$("[data-lt]",v).forEach(function(b){ b.onclick=function(){ ui.libType=b.dataset.lt; V32.renderLib(); }; });
    $$("[data-open-c]",v).forEach(function(b){ b.onclick=function(){ logSheet(b.dataset.openC,b.dataset.openD); }; });
    if(type==="dev"){
      var tok=++V32.gridTok, out=[], jobs=[];
      cs.forEach(function(c){ sessions(c.id).forEach(function(s){ jobs.push(idb.allForSafe(sessKey(c.id,s.date)).then(function(r){ if(r.ok) r.list.forEach(function(a){ out.push({c:c,date:s.date,a:a}); }); })); }); });
      Promise.all(jobs).then(function(){
        if(tok!==V32.gridTok) return; var box=$("#v32DevList",v); if(!box) return;
        out.sort(function(x,y){ return x.c.name<y.c.name?-1:x.c.name>y.c.name?1:x.date<y.date?-1:1; });
        box.className=""; box.innerHTML= out.length? '<div class="card v32-lib">'+out.map(function(o){
          var legacy=(o.a.kind===V32.KIND_LEGACY);
          return '<div class="v32-li"><span class="v32-ld">'+esc(V32.abbr(o.c.name))+' '+esc(V32.md(o.date))+'</span><span class="v32-lf">'+esc(o.a.name||"파일")+' <span class="v32-tag'+(legacy?" warn":"")+'">'+esc(o.a.kind||"자료")+(legacy?" · 미분류":"")+'</span>'+(o.a.tl?' <span class="v32-tag">타임라인</span>':'')+'</span>'+
            (legacy?'<select class="select v32-reclass v32-inline" data-rid="'+esc(o.a.id)+'" data-rc="'+o.c.id+'" data-rd="'+o.date+'"><option>미분류</option><option>필기본</option><option>칠판판서</option></select>':'')+
            '<button class="btn xs" data-open-c="'+o.c.id+'" data-open-d="'+o.date+'">회차</button></div>'; }).join("")+'</div>' : '<div class="card"><div class="hint">이 기기에 첨부된 파일이 없습니다.</div></div>';
        $$("[data-open-c]",box).forEach(function(b){ b.onclick=function(){ logSheet(b.dataset.openC,b.dataset.openD); }; });
        $$("[data-rid]",box).forEach(function(sel){ sel.onchange=function(){ var k=sel.value; if(k==="미분류") return;
          idb.get(sel.dataset.rid).then(function(a){ if(!a) return; a.kind=k; return idb.put(a); }).then(function(){ toast(k+"로 분류했습니다"); V32.renderLib(); }); }; });
      });
    }
  };
  var _render=render;
  render=function(){ _render(); if(ui.view==="lib") V32.renderLib(); };
  /* 학습 탭 상단에 진입 카드 */
  var _renderStudy=renderStudy;
  renderStudy=function(){
    _renderStudy();
    var v=$("#v-study"); if(!v||$("#v32StudyEntry",v)) return;
    var vh=$(".vh",v); if(!vh) return;
    var card=document.createElement("div"); card.id="v32StudyEntry"; card.className="v32-entry";
    card.innerHTML='<button class="btn sm" data-go="lib">📚 라이브러리</button><button class="btn sm" data-go="grid">🗓 주차표</button><span class="smut">자료 4종 업로드 여부 · 녹음·강의자료·필기·판서</span>';
    vh.insertAdjacentElement("afterend",card);
    $$("[data-go]",card).forEach(function(b){ b.onclick=function(){ if(b.dataset.go==="lib") go("lib"); else { ui.calMode="grid"; go("cal"); } }; });
  };

  /* ---------- 8. CSS ---------- */
  var css=document.createElement("style"); css.id="v32css";
  css.textContent=
    '.attq button[data-s="vlate"][aria-pressed="true"]{background:#EA7A1A;color:#fff}'+
    '.attq button[data-s="excused"][aria-pressed="true"]{background:#E0569B;color:#fff}'+
    '.db-badge.vlate{background:#EA7A1A}.db-badge.excused{background:#E0569B}'+
    '.sdot.pc{background:#2563EB}.v32-legacy{color:#B7791F;font-weight:600}.v32-reclass{margin-top:4px;font-size:11px;width:100%}.v32-reclass.v32-inline{width:auto;margin:0 4px 0 0;flex:0 0 auto}.v32-bulk{margin-top:6px;display:flex;gap:6px;align-items:center;flex-wrap:wrap}'+
    '.v32-wrap{padding:10px 12px 18px}.v32-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}'+
    '.v32-chip{display:inline-flex;align-items:center;gap:5px;font-size:12px;padding:3px 8px;border:1px solid var(--line-2);border-radius:999px}.v32-chip i{width:8px;height:8px;border-radius:50%;display:inline-block}'+
    '.v32-legend{display:flex;flex-wrap:wrap;gap:10px;font-size:11.5px;color:var(--mut);margin-bottom:8px;align-items:center}.v32-legend i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:3px}'+
    '.v32-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px}'+
    '.v32-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--line-2);border-radius:12px}'+
    '.v32-grid{border-collapse:collapse;min-width:640px;width:100%;font-size:12px}.v32-grid th,.v32-grid td{border:1px solid var(--line-2);vertical-align:top;padding:6px 7px;min-width:112px}'+
    '.v32-grid thead th{background:var(--card-2,rgba(0,0,0,.04));font-weight:700;text-align:center;position:sticky;top:0}'+
    '.v32-grid th.v32-wk{min-width:64px;width:64px;text-align:left;white-space:nowrap;position:sticky;left:0;background:var(--card,#fff);z-index:1}.v32-grid th.v32-wk small{display:block;font-weight:400;color:var(--mut)}'+
    '.v32-grid tr.cur th.v32-wk{color:var(--accent)}.v32-grid td.today{outline:2px solid var(--accent);outline-offset:-2px}.v32-grid td.off{background:rgba(0,0,0,.03)}.v32-grid td.hol{color:var(--mut)}'+
    '.v32-line{cursor:pointer;padding:3px 0;line-height:1.35}.v32-line+.v32-line{border-top:1px dashed var(--line-2)}.v32-line.fut{opacity:.6}'+
    '.v32-l1{display:flex;flex-wrap:wrap;align-items:center;gap:4px}.v32-l2{font-size:11px;color:var(--mut);display:flex;flex-wrap:wrap;gap:4px;margin-top:1px}'+
    '.v32-sh{display:inline-block;color:#fff;font-size:10px;font-weight:700;padding:0 5px;border-radius:6px;line-height:16px}'+
    '.v32-tag{display:inline-block;font-size:10.5px;padding:0 5px;border:1px solid currentColor;border-radius:6px;line-height:16px;opacity:.85}.v32-tag.warn{color:#B7791F}'+
    '.v32-task{display:inline-block;font-size:10.5px;color:#B45309}.v32-task.done{text-decoration:line-through;opacity:.6}.v32-prog{color:var(--mut)}'+
    '.v32-dots{display:inline-flex;gap:1px;margin-left:6px}.v32-dots i{font-style:normal;font-size:11px;line-height:16px;width:17px;text-align:center;border-radius:5px;opacity:.28;filter:grayscale(1)}'+
    '.v32-dots i.on{opacity:1;filter:none;background:rgba(22,163,74,.15)}.v32-dots i.pc{opacity:1;filter:none;background:rgba(37,99,235,.15)}.v32-dots i.maybe{opacity:1;filter:none;background:rgba(217,164,0,.22)}.v32-dots i.unk{opacity:.5}'+
    '.v32-dots.demo{margin-left:0}'+
    '.v32-wknav{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}'+
    '.v32-day{border:1px solid var(--line-2);border-radius:12px;padding:8px 10px;margin-bottom:8px}.v32-day.today{border-color:var(--accent)}.v32-dh{font-weight:700;margin-bottom:4px}.v32-dh small{color:var(--mut);font-weight:400}'+
    '.v32-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 12px}.v32-lib{padding:10px 12px;margin-bottom:10px}.v32-lh{display:flex;gap:8px;align-items:baseline;margin-bottom:6px}'+
    '.v32-li{display:flex;gap:8px;align-items:center;font-size:12.5px;padding:4px 0;border-top:1px dashed var(--line-2)}.v32-ld{flex:0 0 74px;color:var(--mut);white-space:nowrap}.v32-lf{flex:1;min-width:0;word-break:break-all}.v32-ls{color:var(--mut);white-space:nowrap;font-size:11px}'+
    '.v32-h2{font-size:14px;margin:14px 0 8px}.v32-entry{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:-4px 0 12px}'+
    '@media(max-width:600px){.v32-grid{min-width:780px}.v32-grid th,.v32-grid td{min-width:140px}}';
  document.head.appendChild(css);

  /* ---------- 9. 부팅 ---------- */
  var _boot=boot;
  boot=function(){
    _boot();
    try{ V32.patch(); }catch(e){}
    try{
      var seg=$("#calMode");
      if(seg&&!$('button[data-m="grid"]',seg)){ var b=document.createElement("button"); b.dataset.m="grid"; b.textContent="주차표";
        b.onclick=function(){ ui.calMode="grid"; renderCal(); }; seg.appendChild(b); }
      var main=$("main.main");
      if(main&&!$("#v-lib")){ var sec=document.createElement("section"); sec.className="view"; sec.id="v-lib"; main.appendChild(sec); }
    }catch(e){}
    V32.loadLib().then(function(){ try{ if(ui.view==="lib"||(ui.view==="cal"&&ui.calMode==="grid")) render(); }catch(e){} });
  };
})();
