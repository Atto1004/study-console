/* ============================================================
   V62 LAYER — 대표님 2026-10-02 「공업수학 3.3까지가 시험범위, 다음주 수요일에 시험범위 다 나간다」 (BUILD 2026-10-02.104)
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
  var _boot=boot; boot=function(){ _boot(); try{ V62.patch(); }catch(e){ if(window.console) console.warn("V62 패치", e); } };
})();
