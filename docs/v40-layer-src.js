/* ============================================================
   V40 LAYER — 회차별 학습하기가 덱의 그 회차 파트에서 열린다 (아토 2026-09-17 "학습하기 소행렬식부터 진행, 이전까지는 완료 처리")
   미적2 행렬 덱 링크에 해시를 붙인다: 9/1 → #at=p1-cover(이동만) · 9/3 → #at=p2-cover · 9/8 → #done=p4-cover(앞 파트는 완료 표시).
   덱 쪽 규칙(slides_tpl): #at= 이동만 · #from= 앞은 건너뜀 · #done= 앞은 완료.
   ============================================================ */
(function(){
  if(window.V40) return;
  var V40=window.V40={};
  V40.ANCHOR={"2026-09-01":"#at=p1-cover","2026-09-03":"#at=p2-cover","2026-09-08":"#done=p4-cover"};
  V40.patch=function(){
    var t=term(); if(t.patchV40a) return; var c=t.courses.filter(function(x){return x.name==="미분적분학2";})[0]; if(!c||!window.V36) return;
    Object.keys(V40.ANCHOR).forEach(function(d){ var n=V36.dayNote(c,d); if(!n) return;
      n.links.forEach(function(l){ if(/calc2-matrix-slides\.html/.test(l.url||"")) l.url="notes/calc2-matrix-slides.html"+V40.ANCHOR[d]; }); });
    t.patchV40a=true; persist();
  };
  var _boot=boot;
  boot=function(){ _boot(); try{ V40.patch(); }catch(e){ if(window.console) console.warn("V40 패치 오류", e); } };
})();
