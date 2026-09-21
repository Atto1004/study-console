/* ============================================================
   V44 LAYER — 디자인 재설계 1차 (아토 2026-09-21 "디자인이 개망 · 메가스터디·이투스 참고", 브리프 docs/briefs/v49-design-brief-r3.md, 오타 GREEN)
   변경 허용 목록(브리프 §5) 안에서만:
   ① 셸 CSS 토큰: 연회색 바탕 + 평면 흰 카드, 헤더 한 줄(게이지 숨김 → D-day 칩 1개), 하단/레일 5탭
   ② renderShelf 교체: 책 표지(.book) → 과목 행(.crow) 목록. 짧게 = 과목 열기, 길게/우클릭/⋯ = bookMenu(기존 함수 그대로). 개인 공부 세그먼트·숨김 보기 유지
   ③ renderToday 중 #dayBooks 내부만: 입체 책 → 시간·과목·장소 행 + [학습](덱 있는 회차만). 오늘 탭 상단 숫자 칸(D-day · 이번 주 회차 · 시험기간엔 오늘 학습)
   ④ markSave 3상태(dirty / saved / failed) — cloudSave 실패 경로는 markSave("failed") 호출로 소스 수정(insert_v44.py)
   ⑤ 탭 5개 = 오늘 · 할 일 · 학습 · 과목 · 설정. 달력 = 오늘 탭 「달력」 버튼(go("cal")), 학점 = 과목 탭 세그먼트(go("grade")). cal/grade 화면에서는 각각 오늘/과목 탭이 켜짐
   ⑥ 영문 UI 라벨 제거(STATUS · CONDITION · MENU · RESUME)
   과목 팔레트 V44.COURSE_COLORS(bucket 기준, 기존 typeA 면색은 표시 안 함). 색 제한은 아토 결정으로 지침에서 제외(학습시스템 §15).
   보존: #dayBooks 는 .card > .card-b 안에 그대로(V43·V25 삽입 기준), renderToday/renderCourse/closeNote 래핑 체인, V32~V43 전부.
   ============================================================ */
(function(){
  if(window.V44) return;
  var V44=window.V44={};
  /* ---- 과목 팔레트 (브리프 §2) ---- */
  V44.COURSE_COLORS={"전공필수":"#0E8C8C","전공기초":"#D97706","전공선택":"#2F6FB3","교양필수":"#A855A0","교양선택":"#8B5E3C","MSC":"#5B8C2E","기타":"#5B6B8C","개인":"#7A8A2E"};
  V44.color=function(c){ if(!c) return "#5B6B8C"; if(isPersonal(c)) return V44.COURSE_COLORS["개인"]; return V44.COURSE_COLORS[c.bucket]||V44.COURSE_COLORS["기타"]; };
  V44.abbr=function(name){ var s=String(name||"").replace(/\s/g,""); if(/^[A-Za-z0-9]+$/.test(s)) return s.slice(0,4).toUpperCase(); return s.slice(0,2); };

  /* ---- 덱 진도 (브리프 §2 지표): mc-slides-last-<deck> 의 n 과 mc-slides-<deck> 의 done 수 ---- */
  V44.decksOf=function(c){
    var out=[]; if(!c||!Array.isArray(window.NOTES)) return out;
    NOTES.forEach(function(n){ if(n.course===c.name&&n.type==="학습"&&/slides\.html$/.test(n.file||"")){ var m=/notes\/(.+)-slides\.html$/.exec(n.file); if(m) out.push(m[1]); } });
    return out;
  };
  V44.deckProgress=function(c){
    /* 덱 전체 장 수는 덱을 한 번 열어야(mc-slides-last-<deck>.n) 알 수 있다. 한 번도 안 연 덱이 있으면 분모를 모르므로 % 대신 「덱 k/n 진행」으로 표시(오타 RED 4) */
    var ids=V44.decksOf(c); if(!ids.length) return {state:"none"};
    var done=0,total=0,known=0;
    ids.forEach(function(id){
      try{ var last=JSON.parse(localStorage.getItem("mc-slides-last-"+id)||"null"); var st=JSON.parse(localStorage.getItem("mc-slides-"+id)||"null");
        if(last&&Number(last.n)>0){ total+=Number(last.n); known++; if(st&&st.done) done+=Math.min(Number(last.n),Object.keys(st.done).length); } }catch(e){}
    });
    if(!known) return {state:"ready"};
    if(known<ids.length) return {state:"partial",known:known,n:ids.length};
    return {state:"on",pct:total?Math.min(100,Math.round(done/total*100)):0};
  };

  /* ---- ① 헤더: D-day 칩 + 저장 3상태 ---- */
  V44.renderHead=function(){
    var act=$(".topact"); if(!act) return;
    var chip=$("#v44Dday");
    if(!chip){ chip=document.createElement("button"); chip.id="v44Dday"; chip.className="v44-dday"; chip.title="시험 일정"; chip.onclick=function(){ go("study"); }; act.insertBefore(chip,act.firstChild); }
    var ex=heroExam();
    if(ex){ var dd=diffDays(today(),ex.date); chip.innerHTML='<b>D-'+dd+'</b><span>'+esc(ex.kind==="중간"?"중간고사":ex.kind==="기말"?"기말고사":ex.kind)+'</span>'; chip.className="v44-dday "+(dd<=7?"hot":dd<=14?"near":""); chip.hidden=false; }
    else chip.hidden=true;
    var t=term(), w=currentWeek(); var bs=$("#termTag"); if(bs) bs.textContent=(w?w+"주차 · ":"")+PHASE[phase()].n;
  };
  var _renderGauges=renderGauges;
  renderGauges=function(){ _renderGauges(); try{ V44.renderHead(); }catch(e){ if(window.console) console.warn("V44 head", e); } };

  var _markSave=markSave;
  markSave=function(state){
    var b=$("#btnSave"); if(!b) return;
    if(state==="failed"){ ui.saveFailed=true; }
    else if(state==="dirty"||state===true){ ui.saveFailed=false; ui.dirty=true; }
    else if(state==="saved"||state===false){ ui.saveFailed=false; ui.dirty=false; }
    else ui.saveFailed=false;   /* 일반 호출(persist·성공): dirty 여부로만 표시. 실패 표시는 다음 변경·성공에서 풀린다 */
    if(ui.saveFailed){ b.innerHTML=ICON_SAVE+"저장 실패 · 다시"; b.classList.remove("a"); b.classList.add("v44-fail"); b.title="저장에 실패했습니다. 눌러서 다시 시도"; return; }
    b.classList.remove("v44-fail"); b.title=ui.dirty?"변경 사항을 저장":"저장됨";
    _markSave();
  };

  /* ---- ⑤ 탭 5개 + 달력/학점 진입 ---- */
  var KEEP={today:1,todo:1,study:1,shelf:1,set:1};
  var nav=NAV.filter(function(x){ return KEEP[x.k]; }).sort(function(a,b){ var o={today:0,todo:1,study:2,shelf:3,set:4}; return o[a.k]-o[b.k]; });
  nav.forEach(function(x){ if(x.k==="shelf") x.n="과목"; });
  NAV.length=0; nav.forEach(function(x){ NAV.push(x); });
  var _renderNav=renderNav;
  renderNav=function(){ _renderNav(); var sec=$("#rail .rail-sec"); if(sec) sec.remove(); };
  var _go=go;
  go=function(v,cid){
    _go(v,cid);
    var map={cal:"today",grade:"shelf",course:"shelf",pc:"shelf",studyunit:"study",notes:"study"};
    var k=map[ui.view]||ui.view;
    $$("#rail .navb,#tabbar .tabb").forEach(function(b){ b.setAttribute("aria-current", b.dataset.k===k?"true":"false"); });
    V44.segs();
  };
  V44.segs=function(){
    var vh=$("#v-today .vh .sp"); if(vh&&!$("#v44Cal")){ var b=document.createElement("button"); b.className="btn sm"; b.id="v44Cal"; b.textContent="달력"; b.onclick=function(){ go("cal"); }; vh.insertBefore(b,vh.firstChild); }
    ["#v-shelf","#v-grade"].forEach(function(sel){
      var h=$(sel+" .vh"); if(!h) return; var seg=$(sel+" .v44-seg");
      if(!seg){ seg=document.createElement("div"); seg.className="seg v44-seg"; seg.setAttribute("aria-label","과목 / 학점");
        seg.innerHTML='<button data-go="shelf">과목</button><button data-go="grade">학점 · 졸업</button>';
        $$("button",seg).forEach(function(b){ b.onclick=function(){ go(b.dataset.go); }; });
        var sub=$(sel+" .vh .sub"); if(sub&&sub.nextSibling) h.insertBefore(seg,sub.nextSibling); else h.appendChild(seg); }
      $$("button",seg).forEach(function(b){ b.setAttribute("aria-pressed", b.dataset.go===(ui.view==="grade"?"grade":"shelf")?"true":"false"); });
    });
    var cv=$("#v-cal .vh .sp"); if(cv&&!$("#v44CalBack")){ var bb=document.createElement("button"); bb.className="btn sm"; bb.id="v44CalBack"; bb.textContent="← 오늘"; bb.onclick=function(){ go("today"); }; cv.insertBefore(bb,cv.firstChild); }
  };

  /* ---- ② 과목 행 목록 ---- */
  V44.rowHTML=function(c){
    var ex=exams(c.id)[0], dd=ex?diffDays(today(),ex.date):null, pending=(c.status==="pending"), at=attStats(c), pg=V44.deckProgress(c);
    var right= pending?'<span class="chip warn">증원 대기</span>'
      : pg.state==="on"?'<span class="chip acc">학습 '+pg.pct+'%</span>'
      : pg.state==="partial"?'<span class="chip acc">덱 '+pg.known+'/'+pg.n+' 진행</span>'
      : pg.state==="ready"?'<span class="chip mut">학습 시작 전</span>'
      : '<span class="v44-mut">덱 준비 중</span>';
    return '<div class="crow'+(c.hidden?" hid":"")+'" role="button" tabindex="0" data-c="'+c.id+'" aria-label="'+esc(c.name)+'">'+
      '<span class="crow-chip" style="background:'+V44.color(c)+'">'+esc(V44.abbr(c.name))+'</span>'+
      '<span class="crow-main"><span class="crow-t">'+(c.fav?'<span class="crow-fav" aria-label="즐겨찾기">★</span>':'')+esc(c.name)+(c.isRetake?' <small class="crow-re">재수강</small>':'')+'</span>'+
        '<span class="crow-m">'+esc(c.bucket)+' · '+c.credits+'학점'+(c.creditsUnsure?"?":"")+(dayLabel(c)?' · '+esc(dayLabel(c)):'')+(at.held?' · 출석 '+at.n.present+'/'+at.held:'')+'</span></span>'+
      '<span class="crow-r">'+(dd!==null&&dd>=0&&dd<=21?'<span class="chip '+(dd<=7?"crit":"warn")+'">D-'+dd+'</span>':'')+right+'</span>'+
      '<button class="crow-more" data-more="'+c.id+'" aria-label="'+esc(c.name)+' 메뉴">⋯</button>'+
      '</div>';
  };
  V44.bindRows=function(root){
    $$(".crow",root).forEach(function(b){
      var timer=null, longed=false;
      var open=function(){ if(!longed) go("course",b.dataset.c); longed=false; };
      var start=function(ev){ if(ev.target.closest(".crow-more")) return; longed=false; clearTimeout(timer); timer=setTimeout(function(){ longed=true; bookMenu(b.dataset.c); },520); };
      var cancel=function(){ clearTimeout(timer); };
      b.onclick=function(ev){ if(ev.target.closest(".crow-more")) return; open(); };
      b.onkeydown=function(ev){ if(ev.target!==b) return; /* 안의 ⋯ 버튼 키 입력은 그 버튼 몫 */ if(ev.key==="Enter"||ev.key===" "){ ev.preventDefault(); go("course",b.dataset.c); } };
      b.addEventListener("pointerdown",start);
      ["pointerup","pointerleave","pointercancel"].forEach(function(ev){ b.addEventListener(ev,cancel); });
      b.addEventListener("contextmenu",function(e){ e.preventDefault(); longed=true; bookMenu(b.dataset.c); });
    });
    $$(".crow-more",root).forEach(function(m){ m.onclick=function(ev){ ev.stopPropagation(); bookMenu(m.dataset.more); }; });
  };
  var _renderShelf=renderShelf;
  renderShelf=function(){
    _renderShelf();
    try{
      var hs=$("#stTblHs"); if(hs) hs.textContent="";
      var sv=$("#shelfView"); if(sv) sv.style.display="none";
      var note=$("#shelfBody .shelf-note, .vh .shelf-note, .shelf-note"); if(note) note.textContent="";
      if(shelfKind()!=="school") return;
      var sh=$("#shelf"); if(!sh) return;
      var cs=courses();
      sh.classList.add("v44-rows"); sh.classList.remove("spine"); $("#shelfBody").classList.remove("hidden");
      sh.innerHTML= cs.length ? cs.map(V44.rowHTML).join("") : '<div class="shelf-empty">아직 과목이 없습니다.<br>시간표를 등록하면 과목이 목록에 들어옵니다.</div>';
      V44.bindRows(sh);
    }catch(e){ if(window.console) console.warn("V44 shelf", e); }
  };

  /* ---- ③ 오늘 탭: 숫자 칸 + 수업 행 ---- */
  V44.weekSessions=function(date){
    var mon=addDays(date,-((D(date).getDay()+6)%7)), total=0, ended=0, nowM=nowMin(), td=today();
    for(var i=0;i<7;i++){ var d=addDays(mon,i); if(holidayOn(d)) continue;
      classesOn(d).forEach(function(x){ var s=sessionOn(x.c.id,d)||{}; if(s.cancelled) return; total++;
        var over= d<td || (d===td&&toMin(x.e)<=nowM); if(over&&s.status!=="absent") ended++; }); }
    return {ended:ended,total:total};
  };
  V44.renderTodayStats=function(date){
    var v=$("#v-today"); if(!v) return; var box=$("#v44TodayStats");
    if(!box){ box=document.createElement("div"); box.id="v44TodayStats"; box.className="grid g3 v44-stats"; var first=$("#dayBooks").closest(".card"); v.insertBefore(box,first); }
    var ex=heroExam(), ws=V44.weekSessions(date), exam=!!(window.V39&&V39.examOn&&V39.examOn());
    var tiles=[ ex?tile(ex.kind==="중간"?"중간고사":ex.kind==="기말"?"기말고사":ex.kind,"D-"+diffDays(today(),ex.date),fmtDate(ex.date),"acc"):tile("다가오는 시험","미등록","학습 탭에서 추가",""),
      tile("이번 주 회차",ws.ended+"/"+ws.total,"끝난 회차 / 예정","") ];
    if(exam){ var min=0; try{ (S.studyLog||[]).forEach(function(l){ if(l.d===today()) min+=Number(l.min)||0; }); }catch(e){} tiles.push(tile("오늘 학습",min+"분","시험기간 집계","")); }
    box.className="grid "+(tiles.length===3?"g3":"g2")+" v44-stats"; box.innerHTML=tiles.join("");
  };
  V44.dayRows=function(date){
    var box=$("#dayBooks"); if(!box) return;
    var isToday=(date===today()), nowM=isToday?nowMin():-1;
    var cls=holidayOn(date)?[]:classesOn(date).sort(function(a,b){return toMin(a.s)-toMin(b.s);});
    if(!cls.length) return;   /* 빈 날·휴강 문구는 원래 것 그대로 */
    box.innerHTML=cls.map(function(x){
      var s=sessionOn(x.c.id,date)||{}; var past=isToday&&toMin(x.e)<=nowM, live=isToday&&nowM>=toMin(x.s)&&nowM<toMin(x.e);
      var w=weekOf(date), deck=window.V38&&V38.deckFor?V38.deckFor(x.c,w,date):null;
      var st= s.cancelled?'<span class="chip mut">휴강</span>' : s.status?'<span class="chip '+(s.status==="present"?"ok":s.status==="absent"?"crit":"warn")+'">'+esc(ATT[s.status].sh)+'</span>' : live?'<span class="chip acc">진행 중</span>':'';
      return '<div class="drow'+(past?" past":"")+(live?" live":"")+'" role="button" tabindex="0" data-c="'+x.c.id+'">'+
        '<span class="drow-bar" style="background:'+V44.color(x.c)+'"></span>'+
        '<span class="drow-time"><b>'+esc(x.s)+'</b><span>'+esc(x.e)+'</span></span>'+
        '<span class="drow-main"><span class="drow-t">'+esc(x.c.name)+'</span><span class="drow-m">'+esc(x.sl.room||"장소 미정")+'</span></span>'+
        '<span class="drow-r">'+st+(deck?'<button class="btn sm a" data-study="'+x.c.id+'|'+w+'|'+date+'">학습</button>':'')+'</span></div>';
    }).join("");
    $$(".drow",box).forEach(function(b){ b.onclick=function(ev){ if(ev.target.closest("[data-study]")) return; go("course",b.dataset.c); }; b.onkeydown=function(ev){ if(ev.target!==b) return; if(ev.key==="Enter"||ev.key===" "){ ev.preventDefault(); go("course",b.dataset.c); } }; });
    $$("[data-study]",box).forEach(function(b){ b.onclick=function(ev){ ev.stopPropagation(); var p=b.dataset.study.split("|"); openStudy(p[0],+p[1],p[2]); }; });
  };
  var _renderToday=renderToday;
  renderToday=function(){
    _renderToday();
    try{ var date=ui.day||today(); V44.renderTodayStats(date); V44.dayRows(date); var hs=$("#condT"); var cx=hs&&hs.parentNode?hs.parentNode.querySelector(".hs"):null; if(cx) cx.textContent=""; }
    catch(e){ if(window.console) console.warn("V44 today", e); }
  };

  /* ---- ⑥ 영문 UI 라벨 제거: .hs/.kicker/.kbdhint 중 대문자 영문만 있는 것(STATUS·BRIEFING·FSRS·PROFILE…)은 비운다. 콘텐츠(과목명 등)는 대상 아님 ---- */
  V44.scrubLabels=function(){
    $$(".hs,.kicker,.kbdhint,.rail-sec").forEach(function(el){ var t=(el.textContent||"").trim(); if(/^[A-Z][A-Z ·]{3,}$/.test(t)) el.textContent=""; });
  };
  var _render=render;
  render=function(){ _render(); try{ V44.scrubLabels(); }catch(e){} };
  if(window.V43&&V43.html){ var _v43html=V43.html; V43.html=function(rec,withCourse){ return _v43html(rec,withCourse).replace('<span class="hs">RESUME</span>',''); }; }

  /* V41 버그 수정(2026-09-21 발견): 임시 덱의 NOTES 등록이 patchV41b 플래그 뒤에 있어 두 번째 로드부터 NOTES 에 빠짐 → 학습 탭 목록·덱 진도 배지에서 사라졌다. 플래그와 무관하게 매 부팅 등록 */
  V44.ensureDeckNotes=function(){
    if(!window.V41||!V41.DECKS||!Array.isArray(window.NOTES)) return;
    Object.keys(V41.DECKS).forEach(function(name){ var d=V41.DECKS[name];
      if(!NOTES.some(function(x){ return x.file===d.file; })) NOTES.push({course:name,type:"학습",title:d.title,file:d.file,week:3,date:"2026-09-17",sub:"임시 · 문제 없음 · 판서·녹음·강의자료·필기·교재 순"}); });
  };
  var _boot=boot;
  boot=function(){ try{ V44.ensureDeckNotes(); }catch(e){} _boot(); try{ V44.ensureDeckNotes(); V44.segs(); markSave(); render(); V44.scrubLabels(); }catch(e){ if(window.console) console.warn("V44 boot", e); } };

  /* ---- CSS ---- */
  var css=document.createElement("style"); css.id="v44css";
  css.textContent=[
    /* 셸 토큰 */
    ":root{--bg:#F4F6F5;--surface:#FFFFFF;--line:#E3E8E5;--r:12px}",
    ":root[data-theme=dark]{--bg:#0F1512;--surface:#161D18;--line:#26302A}",
    "@media(prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#0F1512;--surface:#161D18;--line:#26302A}}",
    ".card{box-shadow:none;border:1px solid var(--line);border-radius:12px}.card .card{border:0}",
    ".tile{box-shadow:none}",
    /* 헤더 한 줄 */
    "#gauges{display:none}.topbar-in{min-height:56px;align-items:center}.brand{border-right:0;padding:8px 12px}.brand-t,.brand-s{display:block}",
    ".brand-t{font-size:14px;line-height:18px}.brand-s{font-size:12px;line-height:16px;letter-spacing:0;text-transform:none;color:var(--ink-3)}",
    ".topact{padding:8px 12px;gap:6px}",
    ".v44-dday{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--surface);border-radius:999px;padding:4px 10px 4px 8px;font-size:12px;line-height:16px;color:var(--ink-2);cursor:pointer;min-height:32px}",
    ".v44-dday b{font-weight:600;color:var(--ink);font-size:14px}.v44-dday.near b{color:var(--warn)}.v44-dday.hot b{color:var(--crit)}",
    "#btnSave.v44-fail{background:var(--crit-soft);color:var(--crit)}",
    "#btnSave.a{background:var(--surface);color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}#btnSave.a:hover{background:var(--accent-soft)}",
    "#wkTodoMini .btn.a{background:transparent;color:var(--accent);box-shadow:inset 0 0 0 1px var(--line)}",
    "@media(max-width:860px){.topbar-in{flex-wrap:nowrap;padding:0 4px}.v44-dday span{display:none}.topact{margin-left:auto;padding:8px 8px;gap:4px}.brand{padding:8px 8px;min-width:0}.brand-s{display:none}.brand-t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#btnReload,#btnTheme{display:none}#btnSave{padding:4px 10px;white-space:nowrap}}",
    "@media(max-width:860px){#v44Cal{flex:0 0 auto;width:auto;min-width:0}.v44-stats.g2,.v44-stats.g3{grid-template-columns:repeat(2,minmax(0,1fr))}.v44-stats.g3{grid-template-columns:repeat(3,minmax(0,1fr))}.v44-stats .tile{padding:10px 12px}.v44-stats .tile-v{font-size:18px}}",
    /* 탭 5개 · 하단 가림 */
    ".main{padding-bottom:calc(64px + env(safe-area-inset-bottom) + 16px)}",
    "@media(max-width:860px){.tabbar{padding:4px 4px calc(4px + env(safe-area-inset-bottom));min-height:calc(56px + env(safe-area-inset-bottom))}.tabb{min-height:48px;font-size:11px;padding:4px 2px}.tabb .ic{font-size:18px}}",
    /* 넘침 방지 */
    ".view,.card,.card-b,.vh{min-width:0;max-width:100%}.wstrip{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;overflow:hidden}.wday{min-width:0;padding:6px 0}.grid{min-width:0}",
    ".v43 .v43-t{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.v43 .v43-w{overflow-wrap:anywhere}",
    /* 과목 행 */
    ".shelf.v44-rows{display:flex;flex-direction:column;gap:0;padding:0;height:auto;background:none;border:0;box-shadow:none}",
    ".shelf.v44-rows::before,.shelf.v44-rows::after{display:none}",
    ".crow{display:flex;align-items:center;gap:12px;padding:10px 12px;min-height:60px;border-top:1px solid var(--line);cursor:pointer;background:var(--surface);user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}",
    ".crow:first-child{border-top:0}.crow:hover{background:var(--surface-2)}.crow:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}.crow.hid{opacity:.55}",
    ".crow-chip{flex:0 0 44px;width:44px;height:44px;border-radius:10px;display:grid;place-items:center;color:#fff;font-weight:600;font-size:14px;letter-spacing:0}",
    ".crow-main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px}",
    ".crow-t{font-size:16px;line-height:20px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.crow-t .crow-re{font-weight:400;font-size:12px;color:var(--ink-3)}",
    ".crow-fav{color:var(--accent);margin-right:4px;font-size:13px}",
    ".crow-m{font-size:12px;line-height:16px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".crow-r{flex:0 0 auto;display:flex;align-items:center;gap:6px}.v44-mut{font-size:12px;color:var(--ink-3)}",
    ".crow-more{flex:0 0 auto;width:44px;height:44px;border:0;background:none;color:var(--ink-3);font-size:18px;border-radius:8px;cursor:pointer}.crow-more:hover{background:var(--surface-3);color:var(--ink)}",
    "@media(max-width:860px){.crow-r .chip{font-size:11px;padding:2px 8px}.crow-m{white-space:normal}}",
    /* 오늘 탭 */
    ".v44-stats .tile{padding:12px 14px}.v44-stats .tile-v{font-size:20px;line-height:24px}",
    "#dayBooks{display:flex;flex-direction:column;gap:0}",
    ".drow{display:flex;align-items:center;gap:12px;padding:10px 12px 10px 0;min-height:56px;border-top:1px solid var(--line);cursor:pointer}",
    ".drow:first-child{border-top:0}.drow.past{opacity:.6}.drow:hover{background:var(--surface-2)}.drow:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}",
    ".drow-bar{flex:0 0 3px;width:3px;height:36px;border-radius:2px;margin-left:12px}",
    ".drow-time{flex:0 0 52px;display:flex;flex-direction:column;font-size:12px;line-height:16px;color:var(--ink-3);font-variant-numeric:tabular-nums}.drow-time b{font-size:14px;color:var(--ink);font-weight:600}",
    ".drow-main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px}.drow-t{font-size:16px;line-height:20px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.drow-m{font-size:12px;line-height:16px;color:var(--ink-3)}",
    ".drow-r{flex:0 0 auto;display:flex;align-items:center;gap:8px}.drow-r .btn.sm{min-height:36px;padding:4px 14px}",
    ".drow.live .drow-t{color:var(--accent)}",
    /* 세그먼트·라벨 */
    ".v44-seg{margin-left:auto}@media(max-width:860px){.v44-seg{margin-left:0}}",
    ".hs:empty{display:none}"
  ].join("\n");
  document.head.appendChild(css);
})();
