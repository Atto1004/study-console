/* ============================================================
   V34 LAYER — 아토 패치 노트 9/17 (오타 설계 회의 5차 GREEN, docs/v34-design-brief*.md)
   ① 복습 안 한 과목은 예습 항목 생성 안 함 ② 책등 = 글자만 + 중앙 정렬 ③ 시간표 등록·과목 추가 버튼 제거
   ④ 오늘 탭 복습 큐 제거 ⑤ 할 일 초기화(앱 안 결재, 되돌리기 가능) ⑥ UI 이모지 → 한 글자 라벨
   ⑦ 표지 사진 위 한글 과목명 ⑧ 과목 화면 주차 목록 1~16주(중간·기말·미수강 회색) ⑨ 주차표 셀 날짜
   원본 함수는 래핑만 한다. CSS는 뒤에 덧씌운다.
   ============================================================ */
(function(){
  if(window.V34) return;
  var V34=window.V34={};
  var ATTENDED={present:1,late:1,vlate:1}, ABSENT={absent:1,excused:1,ghost:1};

  /* ---------- 1. 예습 차단 규칙 ---------- */
  V34.reviewBlocked=function(c){
    if(!c||noStudyType(c)) return false;
    var td=today();
    return planned(c).some(function(p){
      if(p.date>td) return false;
      if(holidayOn(p.date)) return false;
      var s=sessionOn(c.id,p.date);
      if(s&&s.cancelled) return false;
      if(!sessionEnded(c,{date:p.date})) return false;
      if(s&&ABSENT[s.status]) return false;          /* 결석·인정결석·출튀는 보강 흐름(기존 makeup:)에서 다룬다 */
      return !(s&&s.reviewed);                        /* 기록 없음 = 미복습 */
    });
  };
  V34.pruneStudy=function(mon){
    var e=weeklyEntry(mon,false); if(!e) return 0;
    var n=0;
    e.items=e.items.filter(function(it){
      if(!it.key||it.key.indexOf("study:")!==0||it.done) return true;
      var cid=it.key.split(":")[1], c=course(cid);
      if(c&&V34.reviewBlocked(c)){ n++; return false; }
      return true;
    });
    return n;
  };
  var _generateWeekly=generateWeekly;
  generateWeekly=function(mon){ var e=_generateWeekly(mon); V34.pruneStudy(mon); return e; };
  V34.regen=function(){ var mon=weeklyKey(today()); if(weeklyEntry(mon,false)){ generateWeekly(mon); persist(); } };
  var _gradeReview=gradeReview;
  gradeReview=function(cid,date,grade){ var s=_gradeReview(cid,date,grade); try{ V34.regen(); }catch(e){} return s; };
  var _captureLog=captureLog;
  captureLog=function(cid,date){ var r=_captureLog(cid,date); try{ V34.regen(); }catch(e){} return r; };
  var _renderTodo=renderTodo;
  renderTodo=function(){ try{ var mon=weeklyKey(today()); if(weeklyEntry(mon,false)&&V34.pruneStudy(mon)) persist(); }catch(e){} _renderTodo(); V34.resetBanner(); };

  /* ---------- 5. 할 일 초기화 — 앱 안 결재 ---------- */
  V34.resetPlan=function(){
    var mon=weeklyKey(today()), e=weeklyEntry(mon,true);
    var auto=e.items.filter(function(it){return !!it.key;}), manual=e.items.filter(function(it){return !it.key;});
    /* dry-run: 임시 entry로 재생성 예상 건수 */
    var saved=S.weekly[mon]; S.weekly[mon]={items:manual.map(function(x){return Object.assign({},x);}),createdAt:Date.now()};
    var k=0; try{ generateWeekly(mon); k=S.weekly[mon].items.length; }catch(err){} S.weekly[mon]=saved;
    return {mon:mon,auto:auto.length,manual:manual.length,regen:k};
  };
  V34.resetRun=function(){
    var t=term(); if(t.patchV34a) return false;
    var mon=weeklyKey(today()), e=weeklyEntry(mon,true);
    var backup=JSON.parse(JSON.stringify(e));
    var manual=e.items.filter(function(it){return !it.key;});
    var removed=e.items.length-manual.length;
    e.items=manual;
    generateWeekly(mon);
    t.patchV34a={mon:mon,at:Date.now(),removed:removed,kept:manual.length,regenerated:e.items.length-manual.length,backup:backup};
    persist(); return true;
  };
  V34.restoreTodo=function(){
    var t=term(), p=t.patchV34a; if(!p||!p.backup) return false;
    S.weekly[p.mon]=JSON.parse(JSON.stringify(p.backup)); p.restoredAt=Date.now(); persist(); return true;
  };
  V34.resetBanner=function(){
    var v=$("#v-todo"); if(!v) return;
    var old=$("#v34Reset",v); if(old) old.remove();
    if(term().patchV34a||ui.v34ResetLater) return;
    var p=V34.resetPlan();
    var box=document.createElement("div"); box.id="v34Reset"; box.className="v34-reset";
    box.innerHTML='<b>할 일 초기화</b> — 이번 주 자동 항목 '+p.auto+'건 제거, 수동 '+p.manual+'건 보존, 재생성 예상 '+p.regen+'건(예습은 복습을 마친 과목만). 되돌리기는 설정 → 패치 노트.'+
      '<span class="v34-rb"><button class="btn sm a" id="v34ResetGo">실행</button><button class="btn sm" id="v34ResetLater">나중에</button></span>';
    var vh=$(".vh",v); if(vh) vh.insertAdjacentElement("afterend",box); else v.prepend(box);
    $("#v34ResetGo",box).onclick=function(){ if(V34.resetRun()){ toast("할 일을 초기화했습니다"); renderTodo(); } };
    $("#v34ResetLater",box).onclick=function(){ ui.v34ResetLater=true; box.remove(); };
  };
  var _renderPatch=renderPatch;
  renderPatch=function(){
    _renderPatch();
    var box=$("#patchBox"); if(!box) return;
    var p=term().patchV34a; if(!p) return;
    var d=document.createElement("div"); d.className="hint"; d.style.marginTop="8px";
    d.innerHTML='할 일 초기화 '+fmtDate(iso(new Date(p.at)))+' — 제거 '+p.removed+' · 보존 '+p.kept+' · 재생성 '+p.regenerated+(p.restoredAt?' · 되돌림':'')+
      (p.restoredAt?'':' <button class="btn xs" id="v34Restore">초기화 되돌리기</button>');
    box.prepend(d);
    var b=$("#v34Restore",box); if(b) b.onclick=function(){ if(V34.restoreTodo()){ toast("초기화 전 할 일로 되돌렸습니다"); renderPatch(); } };
  };

  /* ---------- 4. 오늘 탭 복습 큐 카드 숨김 ---------- */
  var _renderToday=renderToday;
  renderToday=function(){ _renderToday(); var rl=$("#reviewList"); var card=rl&&rl.closest?rl.closest(".card"):null; if(card) card.style.display="none"; };

  /* ---------- 6. 이모지 → 한 글자 라벨 ---------- */
  V34.ICON={"🎙":"녹","📘":"자","✍️":"필","✍":"필","🧱":"판","📝":"정","📎":"과","🎬":"영","🧾":"파","📁":"기","📱":"기기","📚":"","🗓":"","🧭":""};
  V34.deEmoji=function(str){ return String(str==null?"":str).replace(/[\u{1F300}-\u{1FAFF}\u{2700}-\u{27BF}]️?/gu,function(m){ var k=m.replace("️",""); return V34.ICON.hasOwnProperty(m)?V34.ICON[m]:V34.ICON.hasOwnProperty(k)?V34.ICON[k]:""; }).replace(/^\s+/,""); };
  var fixItem=function(m){ if(m&&typeof m.icon==="string") m.icon=V34.deEmoji(m.icon); };
  MUST.forEach(fixItem);
  if(window.V33&&V33.SPEC) Object.keys(V33.SPEC).forEach(function(k){ (V33.SPEC[k].pre||[]).forEach(fixItem); (V33.SPEC[k].post||[]).forEach(fixItem); });
  if(window.V32&&V32.TYPES) V32.TYPES.forEach(function(t){ t[1]=V34.deEmoji(t[1]); });
  V34.scrub=function(root){
    if(!root) return;
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null), n, list=[];
    while((n=w.nextNode())) if(/[\u{1F300}-\u{1FAFF}]/u.test(n.nodeValue)) list.push(n);
    list.forEach(function(t){ t.nodeValue=V34.deEmoji(t.nodeValue); });
  };
  var _render=render;
  render=function(){ _render(); try{ V34.scrub($("#app")||document.body); }catch(e){} };
  if(window.V32&&V32.renderGrid){
    var _grid=V32.renderGrid;
    V32.renderGrid=function(){ _grid(); var body=$("#calBody"); V34.scrub(body); V34.gridDates(body); };
  }

  /* ---------- 9. 주차표 셀 날짜 ---------- */
  V34.gridDates=function(body){
    var tb=body&&$(".v32-grid tbody",body); if(!tb) return;
    $$("tr",tb).forEach(function(tr,i){
      var w=i+1, ws=weekStart(w), off=D(ws).getDay();
      $$("td",tr).forEach(function(td,j){
        if($(".v32-cd",td)) return;
        var date=addDays(ws,(j+1-off+7)%7), dd=D(date);
        var el=document.createElement("div"); el.className="v32-cd"; el.textContent=(dd.getMonth()+1)+"/"+dd.getDate();
        td.prepend(el);
      });
    });
  };

  /* ---------- 8. 과목 화면 주차 목록 1~16 ---------- */
  V34.weekState=function(c,w){
    var ps=planned(c).filter(function(p){return p.week===w;});
    if(!ps.length) return {k:"none",label:"수업 없음"};
    var live=ps.filter(function(p){ var s=sessionOn(c.id,p.date); return !holidayOn(p.date)&&!(s&&s.cancelled); });
    var holN=ps.length-live.length;
    if(!live.length) return {k:"hol",label:"휴강",hol:holN};
    var ended=live.filter(function(p){return sessionEnded(c,{date:p.date});});
    if(!ended.length) return {k:"fut",label:"미수강",hol:holN};
    var att=0,abs=0,norec=0;
    ended.forEach(function(p){ var s=sessionOn(c.id,p.date); if(!s||!s.status) norec++; else if(ATTENDED[s.status]) att++; else if(ABSENT[s.status]) abs++; else att++; });
    var badges={hol:holN,abs:abs,norec:norec};
    if(!att&&abs&&!norec) return Object.assign({k:"abs",label:"결석 · 보강 필요"},badges);
    if(!att) return Object.assign({k:"norec",label:"기록 없음"},badges);
    if(ended.length<live.length) return Object.assign({k:"cur",label:"진행 중"},badges);
    if(!weekNoteHas(c,w)) return Object.assign({k:"miss",label:"정리 없음"},badges);
    return Object.assign({k:"ok",label:""},badges);
  };
  V34.examLabel=function(c,w){
    var out=[];
    if(w===8) out.push("중간고사 주간"); if(w===term().weeks) out.push("기말고사 주간");
    exams(c.id).forEach(function(e){ if(weekOf(e.date)===w) out.push(e.kind+" "+fmtDate(e.date)); });
    return out;
  };
  V34.renderWeeks=function(c){
    var box=$("#cNotes"); if(!box) return;
    var t=term(), cw=currentWeek()||0, td=today(), rows=[];
    for(var w=1;w<=t.weeks;w++){
      var st=V34.weekState(c,w), ex=V34.examLabel(c,w), n=weekNote(c,w), ws=weekStart(w);
      var range=(D(ws).getMonth()+1)+"/"+D(ws).getDate()+"~"+(D(addDays(ws,6)).getMonth()+1)+"/"+D(addDays(ws,6)).getDate();
      var has=weekNoteHas(c,w), f=has?weekNoteFilled(c,w):0, ot=n?n.tasks.filter(function(x){return !x.done;}).length:0;
      var canOpen=(st.k==="ok"||st.k==="miss"||st.k==="cur"||st.k==="abs"||st.k==="norec");
      var title= has&&n? (n.summary||n.range||"정리") : st.label;
      var badges=[];
      if(st.hol) badges.push("휴강 "+st.hol); if(st.abs) badges.push("결석 "+st.abs); if(st.norec) badges.push("미기록 "+st.norec);
      var sub=[range].concat(ex.map(function(x){return '<span class="v34-ex">'+esc(x)+'</span>';}))
        .concat(has?['섹션 '+f+'/5']:[]).concat(n&&n.exam.length?['<span style="color:var(--warn)">★ 시험 언급 '+n.exam.length+'</span>']:[])
        .concat(ot?['<span style="color:var(--crit)">할 일 '+ot+'</span>']:[]).concat(badges.map(function(b){return '<span class="v34-bd">'+esc(b)+'</span>';}));
      rows.push('<div class="wn-row v34-'+st.k+(w===cw?" v34-now":"")+'"><span class="w">'+w+'주차</span><div style="min-width:0">'+
        '<div class="t">'+(has?esc(title):'<span class="v34-st">'+esc(title)+'</span>')+'</div>'+
        '<div class="s">'+sub.map(function(x){return x.indexOf("<")===0?x:'<span>'+esc(x)+'</span>';}).join("")+'</div>'+
        (n&&n.exam.length?'<div class="wn-ex"><b>'+esc(n.exam[0].t||"")+'</b>'+esc(n.exam[0].quote)+(n.exam.length>1?' <span style="color:var(--ink-3)">외 '+(n.exam.length-1)+'건</span>':"")+'</div>':"")+
        '</div><span class="v34-btns">'+(canOpen?'<button class="btn xs a" data-wst="'+w+'">학습</button><button class="btn xs" data-wn="'+w+'">열기</button>':'')+'</span></div>');
    }
    box.innerHTML=rows.join("");
    var wks=0,exN=0,openT=0; for(var w2=1;w2<=t.weeks;w2++){ if(weekNoteHas(c,w2)){ wks++; var nn=weekNote(c,w2); exN+=nn.exam.length; openT+=nn.tasks.filter(function(x){return !x.done;}).length; } }
    var hs=$("#cNotesHs"); if(hs) hs.textContent=wks+"/"+t.weeks+"주 정리 · ★"+exN+(openT?" · 할 일 "+openT:"");
    $$("#cNotes [data-wn]").forEach(function(b){ b.onclick=function(){ weekSheet(c.id,+b.dataset.wn); }; });
    $$("#cNotes [data-wst]").forEach(function(b){ b.onclick=function(){ openStudy(c.id,+b.dataset.wst); }; });
  };
  var _renderCourse=renderCourse;
  renderCourse=function(){ _renderCourse(); try{ var c=course(ui.course); if(c&&!noStudyType(c)) V34.renderWeeks(c); }catch(e){} };

  /* ---------- 2·3·7. CSS ---------- */
  var css=document.createElement("style"); css.id="v34css";
  css.textContent=[
    /* 버튼 제거 */
    "#btnImportTT,#btnAddCourse{display:none!important}",
    /* 책등: 글자만, 중앙 정렬(넘치면 왼쪽부터 스크롤) */
    ".shelf.spine{justify-content:flex-start}",
    ".shelf.spine .book:first-child{margin-inline-start:auto}",
    ".shelf.spine .book:last-child{margin-inline-end:auto}",
    ".shelf.spine .bk-em,.shelf.spine .bk-foot,.shelf.spine .bk-dday,.shelf.spine .bk-alert,.shelf.spine .bk-fav,.shelf.spine .bk-fold,.shelf.spine .bk-pending,.shelf.spine .bk-cv,.shelf.spine .bk-scrim{display:none!important}",
    ".shelf.spine .book{padding:14px 4px;justify-content:center}",
    ".shelf.spine .book.hascv{padding-left:4px}",
    ".shelf.spine .book.hascv .bk-t{display:block!important;position:static;color:var(--tcOn,#fff);text-shadow:none}",
    /* 표지 사진 위 한글 과목명 */
    ".shelf:not(.spine) .book.hascv .bk-t{display:block!important;position:absolute;left:46px;right:8px;top:11px;z-index:3;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.9),0 0 6px rgba(0,0,0,.6);font-size:max(12px,min(var(--ts,18px),calc(9px + 1.4vw)));letter-spacing:-.02em}",
    ".shelf:not(.spine) .book.hascv .bk-cv::after{content:'';position:absolute;left:0;right:0;top:0;height:46%;background:linear-gradient(180deg,rgba(0,0,0,.72) 0%,rgba(0,0,0,.35) 55%,rgba(0,0,0,0) 100%)}",
    /* 주차표 셀 날짜 */
    ".v32-grid td .v32-cd{font-family:var(--font-num);font-size:9.5px;color:var(--ink-3);line-height:1;margin:0 0 3px}",
    ".v32-grid td.today .v32-cd{color:var(--accent);font-weight:700}",
    /* 과목 화면 16주 목록 */
    ".wn-row.v34-fut,.wn-row.v34-hol,.wn-row.v34-none{opacity:.5}",
    ".wn-row.v34-fut .w,.wn-row.v34-hol .w,.wn-row.v34-none .w{color:var(--ink-3)}",
    ".wn-row.v34-miss .v34-st,.wn-row.v34-abs .v34-st{color:var(--crit)}",
    ".wn-row.v34-norec .v34-st{color:var(--ink-3)}",
    ".wn-row.v34-cur .v34-st{color:var(--accent)}",
    ".wn-row.v34-now{background:var(--accent-soft,rgba(78,95,181,.08));border-radius:8px;padding-left:6px;padding-right:6px}",
    ".v34-ex{color:var(--crit);font-weight:700}",
    ".v34-bd{background:var(--ans,#F0F3F5);border-radius:4px;padding:0 5px;color:var(--ink-2)}",
    ".v34-btns{display:flex;gap:4px}",
    /* 할 일 초기화 배너 */
    ".v34-reset{margin:10px 16px 0;padding:10px 14px;border:1px solid var(--warn);background:var(--warn-soft);border-radius:10px;font-size:13.5px;line-height:1.5}",
    ".v34-reset .v34-rb{display:inline-flex;gap:6px;margin-left:8px;vertical-align:middle}"
  ].join("\n");
  document.head.appendChild(css);

  /* 책장 빈 문구 */
  var _renderShelf=renderShelf;
  renderShelf=function(){ _renderShelf(); var e=$("#shelf .shelf-empty"); if(e) e.innerHTML="아직 책이 없습니다.<br>설정에서 시간표를 불러오면 과목이 책으로 꽂힙니다."; };
})();
