/* ============================================================
   V33 LAYER — 과목별 상단(미리 올릴 자료)/하단(수업 후 올릴 자료) (BUILD 2026-09-16.33)
   아토 2026-09-16 지시(지침 학습시스템.md §10). 오타 설계 회의 1차 RED → 2차 RED → 3차 (docs/v33-design-brief*.md).
   V32 위에 얹는다: 전역 MUST 는 건드리지 않고, mustHTML·V32.dotsHTML 을 「목록 인자」 버전으로 다시 정의한다.
   ============================================================ */
var V33={};
(function(){
  var REC={k:"rec",  slot:"rec",  kinds:["녹음"],     lib:"rec",   icon:"🎙", n:"녹음본",     how:"클로바노트 텍스트를 붙여넣거나 녹음 파일을 첨부"};
  var BOARD={k:"board",slot:"",  kinds:["칠판판서"], lib:"board", icon:"🧱", n:"칠판 판서",  how:"칠판·화이트보드 사진을 첨부", legacy:true};
  var NOTE={k:"note", slot:"note",kinds:["필기본"],   lib:"note",  icon:"✍️", n:"필기",       how:"내가 쓴 필기를 사진으로 첨부", legacy:true};
  var PROF={k:"profnote",slot:"",kinds:["교수필기"], lib:"profnote",icon:"📝",n:"교수님 필기본",how:"LMS에 올라온 교수님 필기본을 첨부"};
  var VIDEO={k:"lmsvideo",n:"영상 정리(그 주)",icon:"🎬",weekly:true,how:"그 주 LMS 강의영상 정리 — PC 날짜 폴더 영상정리_*.md"};
  var HW={k:"hw",n:"과제 제출용 생성본",icon:"📎",hw:true,how:"과제 해답지가 이 주차 정리 링크·「과제」 노트에 연결되면 채워진다"};
  V33.SPEC={
    "일반물리학2":{pre:[{k:"book",n:"전공책",re:/교재|전공책|Halliday|일반물리학/i},{k:"summernote",n:"여름 강의노트",re:/여름/},{k:"lecnote",n:"일반물리 강의노트",re:/강의노트/}],
      post:[BOARD,REC], rules:[]},
    "공업수학1":{pre:[{k:"book",n:"공업수학 전공책",re:/Kreyszig|교재|전공책/i},{k:"solution",n:"전공책 솔루션",re:/솔루션|solution/i},{k:"material",n:"수업자료",re:/강의자료|슬라이드|제[0-9]+장/}],
      post:[BOARD,REC,HW], rules:["수·금 수업. 과제는 매주 수요일에 생기고, 전주차(수·금) 과제를 다음 수요일 09:00 교탁에 제출"]},
    "정역학":{pre:[{k:"book",n:"정역학 전공책",re:/교재|전공책|Bedford|Pytel|Fowler/i}],
      post:[PROF,REC], rules:["수업 끝난 뒤 LMS에 수업 영상 + 필기본이 올라온다","영어 수업 → 한글로 변환해 정리한다"]},
    "미분적분학2":{pre:[{k:"book",n:"미분적분학2 전공책",re:/Stewart|교재|전공책|학습지/i}],
      post:[BOARD,REC,NOTE], rules:["문제풀이 과제는 추후 한 번에 생성된다","미적분 클리닉 매주 가야 한다(가능하면 매일)"]},
    "CADD":{pre:[], post:[VIDEO,Object.assign({},HW,{n:"과제(당일 제출)",how:"과제 산출물이 이 주차 정리 링크·「과제」 노트에 연결되면 채워진다"})], rules:["매주 과제가 생긴다 → 당일 빨리 끝내는 대로 제출","매주 월요일 LMS 강의영상 → 일요일 전까지 수강(이후는 지각 처리)","강의 내용이 중간고사에 나온다 → 영상 내용 자동 정리 시스템 필요(미결)"]},
    "아카데믹글쓰기":{pre:[{k:"material",n:"수업자료",re:/강의자료|수업자료|계획서/}],
      post:[REC], rules:["매주 수업 중 과제 → 수업 중에 해결한다","추후 글쓰기 과제가 있다","교재는 볼 필요 없음"]}
  };
  V33.specFor=function(c){ return (c&&V33.SPEC[c.name])||null; };
  V33.itemsFor=function(c){ var s=V33.specFor(c); return s? s.post : MUST; };
  /* 첨부 kind 선택지 보강(정역학 교수 필기본·CADD 영상 정리 입력 경로) */
  ["교수필기","영상정리"].forEach(function(k){ if(V32.KINDS_ATT.indexOf(k)<0) V32.KINDS_ATT.push(k); });

  /* ---------- 전용 판정 ---------- */
  /* 과제 제출용 생성본: 그 주차 정리 링크(notes/…, 제출용|해답지) + NOTES(과제, 같은 과목·주차) 개수 → linked / none. 「제출본이 있다」고 쓰지 않는다 */
  V33.hwState=function(c,date){
    var w=weekOf(date), n=0;
    var wn=c.weekNotes&&c.weekNotes[w];
    if(wn&&Array.isArray(wn.links)) wn.links.forEach(function(l){ if(/^notes\//.test(l.url||"")&&/제출용|해답지/.test(l.label||"")) n++; });
    if(typeof NOTES!=="undefined") NOTES.forEach(function(x){ if(x.course===c.name&&x.type==="과제"&&x.week===w&&/제출용|해답지/.test(x.title||"")) n++; });
    return {st:n?"linked":"none",n:n};
  };
  /* 그 주 영상 정리: LIB.items(course 일치, lmsvideo 또는 파일명 영상정리) 중 weekOf(item.date)===weekOf(date) */
  V33.weeklyState=function(c,date,counts){
    var dev=(counts&&counts.ok)?(counts.map["영상정리"]||0):0;           /* 이 회차에 기기로 올린 영상 정리 첨부 (오타 4차) */
    if(dev>0) return {st:"have",n:0,dev:dev};
    if(!V32.LIB||V32.dupNames()[c.name]) return {st:"unknown",n:0,dev:0};
    var w=weekOf(date), n=0;
    (V32.LIB.items||[]).forEach(function(i){ if(i.course===c.name&&(i.type==="lmsvideo"||/영상정리/.test(i.file||""))&&i.date&&weekOf(i.date)===w) n++; });
    return {st:n?"pc":"none",n:n,dev:0};
  };
  /* 상단(과목 공통): LIB.common 파일명 정규식 */
  V33.preState=function(c,item){
    if(!V32.LIB||V32.dupNames()[c.name]) return {st:"unknown",n:0,files:[]};
    var fs=(V32.LIB.common||[]).filter(function(i){ return i.course===c.name&&item.re.test(i.file||""); });
    return {st:fs.length?"pc":"none",n:fs.length,files:fs.map(function(i){return i.file;})};
  };
  V33.itemState=function(m,c,date,sl,counts){
    if(m.hw) return V33.hwState(c,date);
    if(m.weekly) return V33.weeklyState(c,date,counts);
    return V32.kindState(m,sl,counts,V32.pcOf(c.name,date));
  };

  /* ---------- 회차 요약 상자(하단) — 목록 인자 버전 ---------- */
  var _must=mustHTML;
  mustHTML=function(sl,counts){
    var cur=V32.cur||{}, c=cur.cid?course(cur.cid):null;
    if(!c||!V33.specFor(c)) return _must(sl,counts);      /* 스펙 없는 과목은 V32 그대로(전역 MUST) */
    var list=V33.itemsFor(c), date=cur.date, rows="", miss=[], done=0, unknown=false, N=list.length;
    list.forEach(function(m){
      var r=V33.itemState(m,c,date,sl,counts);
      if(r.st==="have"||r.st==="pc"||r.st==="linked") done++;
      else if(r.st==="unknown") unknown=true;
      else if(r.st==="none") miss.push(m.n);
      var bits=[], btn="";
      if(m.hw){
        bits.push(r.n?("연결됨 "+r.n+"개"):"");
        btn=r.n?'<button class="btn xs" data-v33go="hw">주차 링크</button>':'<span class="smut" style="font-size:11px">해답지 생성 후 자동</span>';
      } else if(m.weekly){
        if(r.dev>0) bits.push("기기 "+r.dev+"개");
        if(r.n) bits.push("PC "+r.n+"개 · 이번 주");
        if(r.st==="unknown") bits.push('<span class="smut">PC 확인 못 함</span>');
        btn='<button class="btn xs a" data-v32put="영상정리">올리기</button>';
      } else {
        if(r.txt) bits.push("텍스트 "+r.txt.length+"자");
        if(r.dev>0) bits.push("기기 "+r.dev+"개");
        if(r.legacy>0) bits.push('<span class="v32-legacy">미분류 '+r.legacy+'개'+(counts&&counts.tlLegacy?' (타임라인 사진 '+counts.tlLegacy+')':'')+'</span>');
        if(r.pcN>0) bits.push("PC "+r.pcN+"개"+(r.st==="pc"?" · 열기 미지원":""));
        if(r.pcUnknown&&V32.LIBERR) bits.push('<span class="smut">PC 확인 못 함</span>');
        if(r.txt) btn='<button class="btn xs" data-must="'+m.k+'" data-act="seeText">보기</button>';
        else if(r.dev>0) btn='<button class="btn xs" data-must="'+m.k+'" data-act="seeAtt">보기</button>';
        else if(r.st==="maybe") btn='<button class="btn xs a" data-v32class="1">분류하기</button>';
        else if(m.slot==="rec") btn='<button class="btn xs a" data-must="'+m.k+'" data-act="putText">올리기</button>';
        else btn='<button class="btn xs a" data-v32put="'+m.kinds[0]+'">올리기</button>';
      }
      var dot = (r.st==="have")?"on" : (r.st==="pc"||r.st==="linked")?"on pc" : (r.st==="maybe"||r.st==="pending"||r.st==="unknown")?"unk" : "no";
      var body = r.st==="none"? '<b class="sno">안 올림</b>'
               : r.st==="pending"? '<span class="smut">확인 중…</span>'
               : r.st==="unknown"? '<span class="smut">확인 못 함</span>'+(bits.filter(Boolean).length?" · "+bits.filter(Boolean).join(" · "):"")
               : bits.filter(Boolean).join(" · ");
      var sub = (r.st==="none"||r.st==="unknown")? '<div class="ss">'+esc(m.how)+'</div>'
              : r.st==="maybe"? '<div class="ss">예전 「판서」로 저장된 첨부입니다 — 아래 첨부 칸에서 분류하세요</div>' : "";
      rows+='<div class="sumrow must'+((r.st==="have"||r.st==="pc"||r.st==="linked")?"":(r.st==="none"?" miss":" pend"))+'">'+
        '<span class="sdot '+dot+'"></span><div class="sk">'+m.icon+' '+m.n+'</div><div class="sv">'+body+sub+'</div>'+btn+'</div>';
    });
    var head = unknown? '<span class="mh warn">'+done+' / '+N+' — 일부 확인 못 함</span>'
      : miss.length? '<span class="mh bad">'+done+' / '+N+' — '+esc(miss.join(" · "))+' 빠짐</span>'
      : (done===N? '<span class="mh good">'+N+' / '+N+' — 다 올렸습니다</span>' : '<span class="mh">'+done+' / '+N+' 확인 중…</span>');
    return '<div class="mustbox" data-v33="1"><div class="musth">수업 후 올릴 자료 '+head+'</div>'+rows+'</div>';
  };
  /* 주차표 점 — 목록 인자 버전 */
  var _dots=V32.dotsHTML;
  V32.dotsHTML=function(c,date,counts){
    if(!V33.specFor(c)) return _dots(c,date,counts);
    var s=sessionOn(c.id,date), sl=(s&&s.slots)||{}, list=V33.itemsFor(c);
    return '<span class="v32-dots" data-c="'+c.id+'" data-d="'+date+'">'+list.map(function(m){
      var r=V33.itemState(m,c,date,sl,counts||null);
      var cls= r.st==="have"?"on" : (r.st==="pc"||r.st==="linked")?"pc" : r.st==="maybe"?"maybe" : (r.st==="pending"||r.st==="unknown")?"unk" : "no";
      var tip= r.st==="have"?"올림":r.st==="pc"?"PC 보관":r.st==="linked"?"연결됨":r.st==="maybe"?"미분류 첨부":r.st==="none"?"안 올림":"확인 중";
      return '<i class="'+cls+'" title="'+m.n+' — '+tip+'">'+m.icon+'</i>';
    }).join("")+'</span>';
  };

  /* ---------- 회차 시트 상단 칸 + 주차 링크 버튼 ---------- */
  V33.preHTML=function(c){
    var spec=V33.specFor(c); if(!spec||!spec.pre.length) return "";
    var rows=spec.pre.map(function(item){
      var r=V33.preState(c,item);
      var dot=r.st==="pc"?"on pc":r.st==="unknown"?"unk":"no";
      var body=r.st==="pc"?("PC "+r.n+"개 · "+esc(r.files.slice(0,2).join(", "))+(r.n>2?" …":"")):r.st==="unknown"?'<span class="smut">확인 못 함 (PC 인벤토리 없음)</span>':'<b class="sno">없음</b><div class="ss">PC <code>_교재</code> / <code>_강의자료</code> 폴더에 넣고 인벤토리 갱신</div>';
      return '<div class="sumrow must'+(r.st==="pc"?"":(r.st==="none"?" miss":" pend"))+'"><span class="sdot '+dot+'"></span><div class="sk">📚 '+esc(item.n)+'</div><div class="sv">'+body+'</div></div>';
    }).join("");
    return '<div class="mustbox v33-pre" id="v33Pre"><div class="musth">미리 올릴 자료 <span class="mh">과목 공통 · PC 인벤토리 기준</span></div>'+rows+'</div>';
  };
  var _logSheet=logSheet;
  logSheet=function(cid,date){
    _logSheet(cid,date);
    var root=$("#sheet"); if(!root) return;
    var c=course(cid); if(!c||!V33.specFor(c)) return;
    var must=$("#lqSumMust",root); if(!must||$("#v33Pre",root)) return;
    must.insertAdjacentHTML("beforebegin",V33.preHTML(c));
  };
  /* 「주차 링크」 — 문서에 한 번만 등록, 현재 열린 회차(V32.cur)만 처리 (오타 4차) */
  if(!V33._goBound){ V33._goBound=true;
    document.addEventListener("click",function(e){
      var b=e.target&&e.target.closest&&e.target.closest("[data-v33go]"); if(!b) return;
      var cur=V32.cur; if(!cur||!cur.cid) return;
      var w=weekOf(cur.date); captureLog(cur.cid,cur.date); closeSheet(); try{ weekSheet(cur.cid,w); }catch(err){}
    });
  }

  /* ---------- 과목 화면 규칙 카드 ---------- */
  var _renderCourse=renderCourse;
  renderCourse=function(){
    _renderCourse();
    var v=$("#v-course"); if(!v) return;
    var old=$("#v33Rules",v); if(old) old.remove();
    var c=ui.course?course(ui.course):null, spec=V33.specFor(c); if(!c||!spec) return;
    var head=$("#cHead",v); if(!head) return;
    var card=document.createElement("div"); card.className="card v33-rules"; card.id="v33Rules";
    card.innerHTML='<div class="v33-rh">과목 규칙 · 자료 구성 <span class="smut">(아토 2026-09-16)</span></div>'+
      '<div class="v33-row"><b>미리</b> '+(spec.pre.length?spec.pre.map(function(p){return esc(p.n);}).join(" · "):"—")+'</div>'+
      '<div class="v33-row"><b>수업 후</b> '+spec.post.map(function(p){return esc(p.n);}).join(" · ")+'</div>'+
      (spec.rules.length?'<ul class="v33-rules-list">'+spec.rules.map(function(r){return '<li>'+esc(r)+'</li>';}).join("")+'</ul>':'');
    head.insertAdjacentElement("afterend",card);
  };

  var css=document.createElement("style"); css.id="v33css";
  css.textContent='.v33-pre{margin-bottom:8px}.v33-rules{padding:10px 12px;margin:0 0 12px}.v33-rh{font-weight:700;font-size:13px;margin-bottom:6px}.v33-row{font-size:12.5px;margin:2px 0}.v33-row b{display:inline-block;min-width:52px;color:var(--mut)}.v33-rules-list{margin:6px 0 0;padding-left:18px;font-size:12.5px;color:var(--ink-2,inherit)}.v33-rules-list li{margin:2px 0}';
  document.head.appendChild(css);
})();
