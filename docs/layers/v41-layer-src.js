/* ============================================================
   V41 LAYER — 나머지 과목 임시 학습 덱 연결 (아토 2026-09-17 "나머지 과목들도 일단 임시로 정리해줘")
   회차 정리.md → 임시 정리노트(개념 장만) → 덱. 파트 = 회차. 회차 학습하기가 그 파트에서 열리게 링크(#at=pN-cover).
   공수1·일물2·정역학은 요일별 회차(dayNotes), 글쓰기는 주 1회라 주차 정리(weekNotes)에 붙인다.
   ============================================================ */
(function(){
  if(window.V41) return;
  var V41=window.V41={};
  V41.DECKS={
    "공업수학1":{file:"notes/em1-w1-3-slides.html",title:"공업수학1 1~3주차 임시 학습 (회차 정리 자동 변환)",split:true,parts:{"2026-09-09":1,"2026-09-11":2,"2026-09-16":3}},
    "일반물리학2":{file:"notes/phys2-w1-3-slides.html",title:"일반물리학2 1~3주차 임시 학습 (회차 정리 자동 변환)",split:true,parts:{"2026-09-04":1,"2026-09-09":2,"2026-09-11":3,"2026-09-16":4,"2026-09-18":5}},
    "정역학":{file:"notes/statics-w1-3-slides.html",title:"정역학 1~3주차 임시 학습 (회차 정리 자동 변환)",split:true,parts:{"2026-09-07":1,"2026-09-09":2,"2026-09-14":3}},
    "아카데믹글쓰기":{file:"notes/writing-w1-3-slides.html",title:"아카데믹글쓰기 2~3주차 임시 학습 (회차 정리 자동 변환)",split:false,parts:{"2026-09-08":1,"2026-09-15":2}}
  };
  V41.patch=function(){
    var t=term(); if(t.patchV41b) return;
    Object.keys(V41.DECKS).forEach(function(name){
      var d=V41.DECKS[name], c=t.courses.filter(function(x){return x.name===name;})[0]; if(!c) return;
      Object.keys(d.parts).forEach(function(date){
        var url=d.file+"#at=p"+d.parts[date]+"-cover", label="임시 학습 덱 — 이 회차 파트 ("+d.title+")";
        var n= d.split&&window.V36 ? V36.dayNote(c,date,true) : weekNote(c,weekOf(date)||1,true);
        if(!n) return;
        n.links=n.links.filter(function(l){ return !(l.url||"").startsWith(d.file); });
        n.links.unshift({label:label,url:url});
      });
      if(Array.isArray(window.NOTES)&&!NOTES.some(function(x){return x.file===d.file;})) NOTES.push({course:name,type:"학습",title:d.title,file:d.file,week:3,date:"2026-09-17",sub:"임시 · 문제 없음 · 판서·녹음·강의자료·필기·교재 순"});
    });
    t.patchV41b=true; persist();
  };
  var _boot=boot;
  boot=function(){ _boot(); try{ V41.patch(); }catch(e){ if(window.console) console.warn("V41 패치 오류", e); } };
})();
