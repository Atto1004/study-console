/* ============================================================
   V42 LAYER — 공업수학1 3주차 과제 해답지 등록 (아토 2026-09-18 "학습앱에 등록하는 건 자동으로")
   notes/em-hw3-solution.html(+pdf) · NOTES 과제 항목 · 3주차 정리 links · 3주차 과제 task(9/23 수 09:00). 이후 과제도 이 방식(원본 한 곳 = NOTES + weekNotes.links/tasks).
   ============================================================ */
(function(){
  if(window.V42) return;
  var V42=window.V42={};
  V42.FILE="notes/em-hw3-solution.html";
  V42.patch=function(){
    var t=term(); if(t.patchV42a) return;
    var c=t.courses.filter(function(x){return x.name==="공업수학1";})[0]; if(!c) return;
    if(Array.isArray(window.NOTES)&&!NOTES.some(function(x){return x.file===V42.FILE;}))
      NOTES.push({course:"공업수학1",type:"과제",title:"3주차 과제 해답지 — 제출용 (수식 전개만) · 1.5 #23·28 · 2.1 #6·9 · 2.2 #4·8·14 · 2.3 #8",file:V42.FILE,week:3,date:"2026-09-18",sub:"제출 9/23(수) 09:00 교탁 ❓ · 오타 GREEN(2차) · PDF 4장 · 손으로 옮겨 적을 것"});
    var n=weekNote(c,3,true);
    if(n){
      if(!n.links.some(function(l){return (l.url||"")===V42.FILE;})) n.links.unshift({label:"3주차 과제 해답지 — 제출용 (PDF 4장, 오타 GREEN)",url:V42.FILE});
      if(!n.links.some(function(l){return /em-hw3-solution\.pdf/.test(l.url||"");})) n.links.splice(1,0,{label:"3주차 과제 해답지 PDF (인쇄용)",url:"notes/em-hw3-solution.pdf"});
      if(!n.tasks.some(function(x){return /3주차 과제/.test(x.text||"");})) n.tasks.push({id:uid(),text:"공업수학1 3주차 과제 — 1.5 #23·28 · 2.1 #6·9 · 2.2 #4·8·14 · 2.3 #8 손으로 옮겨 적어 제출",due:"2026-09-23",done:false,src:"판서 9/16 · 교재 사진 9/18"});
    }
    if(window.V36){ var d=V36.dayNote(c,"2026-09-18",true); if(d&&!d.links.some(function(l){return (l.url||"")===V42.FILE;})) d.links.unshift({label:"3주차 과제 해답지 — 제출용 (2.2 #4·8·14 · 2.3 #8 포함)",url:V42.FILE}); }
    t.patchV42a=true; persist();
  };
  var _boot=boot;
  boot=function(){ _boot(); try{ V42.patch(); }catch(e){ if(window.console) console.warn("V42 패치 오류", e); } };
})();
