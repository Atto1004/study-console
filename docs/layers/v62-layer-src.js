/* ============================================================
   V62 LAYER — 대표님 2026-10-02 「공업수학 3.3까지가 시험범위, 다음주 수요일에 시험범위 다 나간다」 (BUILD 2026-10-02.104 · .105 공수1 시험일 · .109 일물2 금요일 · .110 캘린더 날짜 · 2026-10-03.129 창업 10/19 · CADD 11/3 · 미적2·일물2 확정 · .130 공수1 10/21)
   boot 패치 1회: 공업수학1 중간 범위 = 1장 ~ 3.3 (10/7 수업에서 범위 끝까지). 시험 카드·시험 모드 범위 주차가 이 문자열을 읽는다.
   ============================================================ */
(function(){
  if(window.V62) return;
  var V62=window.V62={};
  V62.SCOPE="1장 1계 상미분방정식(1.1 · 1.3 ~ 1.5) · 2장 2계 선형 상미분방정식(2.1 ~ 2.10) · 3장 고계 선형 상미분방정식(3.1 ~ 3.3) — 교수 10/2, 10/7(수) 수업에서 범위 끝까지";
  V62.patch=function(){
    var t=term(); if(!t||t.patchV62a) return;
    var c=(t.courses||[]).filter(function(x){ return x.name==="공업수학1"; })[0];
    if(c) (t.exams||[]).forEach(function(e){ if(e.courseId===c.id&&e.kind==="중간"&&!/3\.3/.test(e.scope||"")) e.scope=V62.SCOPE; });
    t.patchV62a=true; persist();
  };
  /* 대표님 10/2 「16일이나 21일에 볼 것 같아 — 다음주 수욜 진도 다 나가고 14일 정리 한 번」 → 이른 후보 10/16(금) 09:00 가정 */
  V62.patchDate=function(){
    var t=term(); if(!t||t.patchV62b) return;
    var c=(t.courses||[]).filter(function(x){ return x.name==="공업수학1"; })[0];
    if(c) (t.exams||[]).forEach(function(e){ if(e.courseId===c.id&&e.kind==="중간"){ e.date="2026-10-16"; e.time="09:00"; e.assumed=true; e.note="10/16(금) 또는 10/21(수) — 대표님 10/2, 10/14 정리 수업"; } });
    t.patchV62b=true; persist();
  };
  /* 대표님 10/2 「물리는 금요일 시험 보는 거 확정」 → 같은 주 금요일 10/16 10:30 (8주차면 10/23 으로 다시) */
  V62.patchPhys=function(){
    var t=term(); if(!t||t.patchV62c) return;
    var c=(t.courses||[]).filter(function(x){ return x.name==="일반물리학2"; })[0];
    if(c) (t.exams||[]).forEach(function(e){ if(e.courseId===c.id&&e.kind==="중간"){ e.date="2026-10-16"; e.time="10:30"; e.assumed=true; e.note="금요일 확정(대표님 10/2) — 날짜는 10/16 가정, 8주차면 10/23"; } });
    t.patchV62c=true; persist();
  };
  /* 대표님 10/2 「응 옮겨」 — 한양 캘린더에 이미 있는 날짜에 맞춤: 일물2 「일반물리학2 중간고사」 10/23(금) · 미적2 「미분적분학2 중간고사」 10/20(화, 교수 9/29 발언 · 공식 공지 전) */
  V62.patchCal=function(){
    var t=term(); if(!t||t.patchV62d) return;
    var set=function(name,date,time,note){ var c=(t.courses||[]).filter(function(x){ return x.name===name; })[0];
      if(c) (t.exams||[]).forEach(function(e){ if(e.courseId===c.id&&e.kind==="중간"){ e.date=date; e.time=time; e.assumed=true; e.note=note; } }); };
    set("일반물리학2","2026-10-23","10:30","금요일 확정(대표님 10/2) · 한양 캘린더 10/23(금)");
    set("미분적분학2","2026-10-20","09:00","교수 9/29 「10월 20일 화요일」 — 공식 공지 전");
    t.patchV62d=true; persist();
  };
  /* 10/3 주간 리뷰 결재(BUILD .129): 창업 = 대표님 선택 「10/19(월)로 옮김」 — OT 슬라이드 「8주 = 중간고사·중간발표」, 형식 미확인이라 가정 유지
     CADD = 대표님 선택 「11/3(화)로 옮김」 — 강의계획(OT 자료) Week 10 = Mid-term exam, 공지 전이라 가정 유지
     미적2 = LMS 공지 10/1 「중간고사 시험 시행 안내문」으로 확정 · 일물2 = 교수 10/2 녹음 「우리 23일」로 확정 → 가정 해제 */
  V62.patchMid3=function(){
    var t=term(); if(!t||t.patchV62e) return;
    var set=function(name,date,time,assumed,note){ var c=(t.courses||[]).filter(function(x){ return x.name===name; })[0];
      if(c) (t.exams||[]).forEach(function(e){ if(e.courseId===c.id&&e.kind==="중간"){ e.date=date; e.time=time; e.assumed=assumed; e.note=note; } }); };
    set("창업아이디어탐색","2026-10-19","11:00",true,"OT 슬라이드 「8주 = 중간고사·중간발표」 → 학교 8주차 월요일(대표님 10/3) · 형식 미확인");
    set("CADD","2026-11-03","13:00",true,"강의계획(OT) Week 10 = Mid-term exam → 11/3(화) (대표님 10/3) · 공지 전");
    set("미분적분학2","2026-10-20","09:00",false,"LMS 공지 10/1 — 09:00~10:00 · 제2과학기술관 511호 예정 · 계산기 금지");
    set("일반물리학2","2026-10-23","10:30",false,"교수 10/2 녹음 「우리 23일」 · 한양 캘린더 10/23(금)");
    t.patchV62e=true; persist();
  };
  /* 10/3 결재(BUILD .130): 공수1 = 대표님 선택 「10/21(수)로 옮김」 — 10/2 녹음 「8주차에 시험」·「10/14 진도 끝」, 공지 전이라 가정 유지.
     patchV62e 는 이미 저장 상태에 서 있어 새 플래그(patchV62f)로 한 번 더 */
  V62.patchEm1b=function(){
    var t=term(); if(!t||t.patchV62f) return;
    var c=(t.courses||[]).filter(function(x){ return x.name==="공업수학1"; })[0];
    if(c) (t.exams||[]).forEach(function(e){ if(e.courseId===c.id&&e.kind==="중간"){ e.date="2026-10-21"; e.time="09:00"; e.assumed=true; e.note="10/2 녹음 「8주차에 시험」 → 10/21(수) (대표님 10/3) · 공지 전"; } });
    t.patchV62f=true; persist();
  };
  /* 10/3 대표님 「과목 들어가서 맨 상단에 이번 시험범위 확정된 거 있으면 표시」(BUILD .137) — 범위가 교수 근거로 확정된 과목만 scopeOk.
     정역학 = OT p.8 · 공수1 = 교수 10/2 · 일물2 = 교수 9/18 녹음. 미적2 = 10/1 안내문에 날짜·장소만(범위 없음) → 표시 안 함 */
  V62.SCOPE_OK={
    "정역학":["Ch.3 Forces · Ch.4 Systems of Forces and Moments · Ch.5 Objects in Equilibrium","과제 1~2문제 그대로 출제 · 틀리면 부분점수 없음","OT 슬라이드 p.8"],
    "공업수학1":["1장(1.1 · 1.3 ~ 1.5) · 2장(2.1 ~ 2.10) · 3장(3.1 ~ 3.3)","10/7(수) 수업에서 범위 끝까지 · 10/14 정리","교수님 10/2"],
    "일반물리학2":["21장 ~ 27장 (27장 RC 회로까지 · 28장 제외)","","교수님 9/18 녹음"]
  };
  V62.patchScope=function(){
    var t=term(); if(!t||t.patchV62g) return;
    (t.courses||[]).forEach(function(c){ var o=V62.SCOPE_OK[c.name]; if(!o) return;
      (t.exams||[]).forEach(function(e){ if(e.courseId===c.id&&e.kind==="중간"){ e.scopeOk=true; e.scopeSrc=o[2]; } }); });
    t.patchV62g=true; persist();
  };
  /* 10/4 대표님 「중간고사 19일 시작」 — 상단 D-day 기준일이 9/26 「7주차 가정」 10/13 으로 고정돼 있었음 → 10/19(정역학 · 첫 중간) */
  V62.patchDday=function(){
    var t=term(); if(!t||S.patchV62h) return;
    if(S.profile&&(!S.profile.dday||!S.profile.dday.date||S.profile.dday.date<"2026-10-19")) S.profile.dday={date:"2026-10-19",label:"중간"};
    S.patchV62h=true; persist();
    try{ if(window.V44&&V44.renderHead) V44.renderHead(); }catch(e){}
  };
  V62.scopeHTML=function(c){
    var o=V62.SCOPE_OK[c.name]; if(!o) return "";
    var e=(term().exams||[]).filter(function(x){ return x.courseId===c.id&&x.kind==="중간"; })[0]; if(!e) return "";
    var dd=Math.round((new Date(e.date+"T00:00:00")-new Date(today()+"T00:00:00"))/864e5); if(dd<0) return "";
    return '<div class="v62s-h"><b>중간고사 범위</b><span class="v62s-ok">확정</span><span class="v62s-d">'+fmtDate(e.date)+(e.time?" "+esc(e.time):"")+(e.assumed?' <i>날짜 가정</i>':'')+' · D-'+dd+'</span></div>'+
      '<div class="v62s-r">'+esc(o[0])+'</div>'+(o[1]?'<div class="v62s-n">'+esc(o[1])+'</div>':'')+'<div class="v62s-src">'+esc(o[2])+'</div>';
  };
  V62.renderScope=function(){
    var v=$("#v-course"), c=ui.course&&course(ui.course); if(!v||!c) return;
    var old=$("#v62Scope",v), h=V62.scopeHTML(c);
    if(!h){ if(old) old.remove(); return; }
    var hero=$("#v55Hero",v); if(!hero) return;
    if(!old){ old=document.createElement("div"); old.id="v62Scope"; old.className="v62s"; }
    old.innerHTML=h; if(old.nextElementSibling!==hero) hero.insertAdjacentElement("beforebegin",old);
  };
  if(window.V55&&V55.render&&!V55._v62){ var _r=V55.render; V55.render=function(){ var x=_r.apply(this,arguments); try{ V62.renderScope(); }catch(e){ if(window.console) console.warn("V62 범위",e); } return x; }; V55._v62=1; }
  var css=document.createElement("style"); css.id="v62css";
  css.textContent=".v62s{margin:0 0 12px;padding:12px 16px;border-radius:14px;background:var(--surface,#fff);border:1px solid var(--line,#dde3de);border-left:5px solid #C7261B}"+
    ".v62s-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.v62s-h b{font-size:15px}.v62s-ok{font-size:11.5px;font-weight:800;color:#fff;background:#C7261B;border-radius:99px;padding:2px 9px}"+
    ".v62s-d{margin-left:auto;font-size:13px;font-weight:700;color:var(--ink-2,#444);font-variant-numeric:tabular-nums}.v62s-d i{font-style:normal;font-size:11.5px;color:#9A5B00;border:1.5px solid currentColor;border-radius:99px;padding:0 7px;margin-left:4px}"+
    ".v62s-r{font-size:16px;font-weight:800;margin-top:6px;line-height:1.45}.v62s-n{font-size:13.5px;color:#C7261B;font-weight:700;margin-top:3px}.v62s-src{font-size:12px;color:var(--ink-3,#777);margin-top:3px}"+
    "@media (max-width:600px){.v62s-d{margin-left:0;width:100%}.v62s-r{font-size:15px}}";
  document.head.appendChild(css);
  var _boot=boot; boot=function(){ _boot(); try{ V62.patch(); V62.patchDate(); V62.patchPhys(); V62.patchCal(); V62.patchMid3(); V62.patchEm1b(); V62.patchScope(); V62.patchDday(); }catch(e){ if(window.console) console.warn("V62 패치", e); } };
})();
