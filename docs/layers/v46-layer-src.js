/* ============================================================
   V46 LAYER — 아카데믹글쓰기 4주차 글쓰기 활동 ③ 등록 (아토 2026-09-22 12:19 슬라이드 사진 → 아톰)
   원본 한 곳 = 4주차 weekNote(tasks · exam · material). 글쓰기는 주 1회라 weekNotes[4]. 마감 9/27(일), 참여도 1점, 기말 출제 예정.
   ============================================================ */
(function(){
  if(window.V46) return;
  var V46=window.V46={};
  V46.patch=function(){
    var t=term(); if(t.patchV46a) return;
    var c=t.courses.filter(function(x){return x.name==="아카데믹글쓰기";})[0]; if(!c) return;
    var n=weekNote(c,4,true); if(!n) return;
    if(!n.tasks.some(function(x){return /활동 ?③|맞춤법/.test(x.text||"");}))
      n.tasks.push({id:uid(),text:"아카데믹글쓰기 글쓰기 활동 ③ 한글 맞춤법·띄어쓰기 — LMS 토론방에서 최대 2~3개만 고치고 이유 적기 (참여도 1점, 기말 출제 예정)",due:"2026-09-27",done:false,src:"슬라이드 사진 9/22 12:19"});
    if(!n.exam.some(function(e){return /맞춤법/.test(e.quote||"");}))
      n.exam.push({t:"슬라이드 9/22 12:19 (활동 ③)",quote:"한글 맞춤법·띄어쓰기 연습문제는 기말고사에 출제할 예정. 정답은 토론방 종료 후 공개.",memo:"정답 공개본 회수 → 기말(12/8) 범위. 3주차 손메모 「기말: 들여쓰기」와 같은 축"});
    if(!/활동 ③/.test(n.material||"")) n.material=(n.material?n.material+"\n":"")+"슬라이드 「글쓰기 활동 ③ : 한글 맞춤법 · 띄어쓰기 정복하기」 사진 1장(12:19) — study-materials/아카데믹글쓰기/2026-09-22/";
    if(!n.range) n.range="글의 시각화: 문장과 단락 쓰기 (3주차 48~53장 예고분: 단어<문장<단락 · 들여쓰기 150쪽 · 단락 나누는 이유 158쪽)";
    t.patchV46a=true; persist();
  };
  var _boot=boot;
  boot=function(){ _boot(); try{ V46.patch(); }catch(e){ if(window.console) console.warn("V46 패치 오류", e); } };
})();
