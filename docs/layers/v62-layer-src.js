/* ============================================================
   V62 LAYER — 대표님 2026-10-02 「공업수학 3.3까지가 시험범위, 다음주 수요일에 시험범위 다 나간다」 (BUILD 2026-10-02.104 · .105 공수1 시험일 · .109 일물2 금요일)
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
  var _boot=boot; boot=function(){ _boot(); try{ V62.patch(); V62.patchDate(); V62.patchPhys(); V62.patchCal(); }catch(e){ if(window.console) console.warn("V62 패치", e); } };
})();
