/* ============================================================
   V53 LAYER — 교실 모드(초록 칠판 + 스앵님) 연결 (대표님 2026-09-26: 학습지는 목차·챕터로, 초록 칠판에 스앵님 캐릭터가 알려주는 느낌, 듀오링고식 XP·스트릭·하트·호감도 — 시스템은 최대한 심플)
   knowledge/lessons.json(docs/tools/build_classroom.py)에 회차마다 classroom: notes/classroom/<약칭>/<날짜>.html 이 등록된다. 읽기용 수업 노트(file)는 「교재」로 남는다.
   ① 회차 표 [학습하기](V38.deckFor) · 수업 따라가기 [따라가기](V50.btnFor): 교실이 있으면 교실을 연다(#resume = 저장 위치) + 작은 [교재] 버튼
   ② 과목 화면 노트 목록: 「교실 · 날짜 · 제목」 등록 (type 교실)
   ③ 교실 iframe 메시지: mc-open(교재 열기) · mc-ask(스앵님 질문 패널 열기) · mc-close(닫기)
   ④ V45 문맥: 수업 노트·교실 경로도 덱 id(<약칭>-<날짜>)로 인식 — 전에는 notes/<이름>-slides.html 만 인식해 노트의 문맥이 채택되지 않았다
   ⑤ 이어서 학습하기(V43): 교실 기록은 「CH n/m」
   진행 저장은 교실 페이지가 mc-lesson-<id>(읽음·문제 — 수업 노트·V52 판정과 같은 키)와 mc-tutor(XP·스트릭·하트·호감도)에 쓴다. 앱은 읽기만 한다.
   ============================================================ */
(function(){
  if(window.V53) return;
  var V53=window.V53={};
  V53.room=function(l){ return (l&&typeof l.classroom==="string"&&/^notes\/classroom\/[\w-]+\/\d{4}-\d{2}-\d{2}\.html$/.test(l.classroom))?l.classroom:null; };
  /* ① 회차 표 [학습하기] → 교실 우선 */
  if(window.V38&&V38.deckFor&&!V38.deckFor._v53){
    var _df=V38.deckFor;
    V38.deckFor=function(c,w,date){ if(date&&window.V52){ var l=V52.lesson(c,date), r=V53.room(l); if(r) return {url:r+"#resume",title:l.title}; } return _df(c,w,date); };
    V38.deckFor._v53=true;
  }
  /* ① 수업 따라가기 버튼 → 교실 + [교재] */
  if(window.V50&&V50.btnFor&&!V50.btnFor._v53){
    var _bf=V50.btnFor;
    V50.btnFor=function(it,x){
      var lp=(x.parts||[]).filter(function(p){ return p.lesson; })[0], r=lp&&V53.room(lp.lesson);
      if(r) return '<button class="btn xs a" data-v50open="'+esc(r)+'#resume" data-v50title="'+esc(lp.lesson.title)+'">'+(x.st==="done"?"다시 보기":"교실 열기")+'</button>'+
        '<button class="btn xs v53-book" data-v50open="'+esc(lp.deck.file)+'#resume" data-v50title="'+esc(lp.lesson.title)+'" title="읽기용 수업 노트">교재</button>'+(lp.minutes?'<span class="hint v52-min">약 '+lp.minutes+'분</span>':'');
      return _bf(it,x);
    };
    V50.btnFor._v53=true;
  }
  /* ② NOTES 등록 */
  V53.registerNotes=function(){
    if(!Array.isArray(window.NOTES)||!window.V52||!V52.L||!V52.L.courses) return;
    Object.keys(V52.L.courses).forEach(function(cn){ var m=V52.L.courses[cn]; Object.keys(m).sort().forEach(function(d){ var l=m[d], r=V53.room(l); if(!r) return;
      if(!NOTES.some(function(x){ return x.file===r; })) NOTES.push({course:cn,type:"교실",title:"교실 · "+(+d.slice(5,7))+"/"+(+d.slice(8,10))+" · "+l.title,file:r,week:l.week||weekOf(d)||1,date:d,sub:"김주영 스앵님 교실 · 챕터 "+(l.chapters||0)+" · 확인 문제 "+(l.qids||[]).length}); }); });
  };
  if(typeof NOTE_TYPE_CLS==="object") NOTE_TYPE_CLS["교실"]="e";
  if(window.V52&&V52.registerNotes&&!V52.registerNotes._v53){ var _reg=V52.registerNotes; V52.registerNotes=function(){ _reg(); V53.registerNotes(); }; V52.registerNotes._v53=true; if(V52.L) V53.registerNotes(); }
  /* ③ 교실 iframe 메시지 — origin·source(노트 iframe)·v 가 맞아야 처리. 파일 경로는 notes/ 아래 html 만 */
  window.addEventListener("message",function(e){
    try{
      if(e.origin!==location.origin) return; var fr=$("#ntvFrame"); if(!fr||e.source!==fr.contentWindow) return;
      var d=e.data; if(!d||typeof d!=="object"||d.v!==1) return;
      if(d.type==="mc-open"){ if(typeof d.file==="string"&&/^notes\/[\w\-\/.]+\.html(#[\w=\-.]*)?$/.test(d.file)&&!/\.\.|\/\//.test(d.file)) openNote(d.file,String(d.title||"").slice(0,80)); }
      else if(d.type==="mc-ask"){ if(window.V45&&V45.toggle&&!V45.open) V45.toggle(); }
      else if(d.type==="mc-close"){ closeNote(); }
    }catch(err){}
  });
  /* ④ V45 문맥 덱 id */
  if(window.V45&&V45.deckOf&&!V45.deckOf._v53){
    var _do=V45.deckOf;
    V45.deckOf=function(file){ var m=/notes\/(?:lessons|classroom)\/([\w-]+)\/(\d{4}-\d{2}-\d{2})\.html/.exec(String(file||"")); return m?(m[1]+"-"+m[2]):_do(file); };
    V45.deckOf._v53=true;
  }
  /* ⑤ 이어서 학습하기: 교실 기록 */
  if(window.V43&&V43.html&&!V43.html._v53){
    var _vh=V43.html;
    V43.html=function(rec,wc){ var h=_vh(rec,wc); if(/notes\/classroom\//.test(rec.href||"")) h=h.replace(/섹션 \d+\/\d+|\d+\/\d+장/, "CH "+Math.min(rec.n||0,(rec.idx|0)+1)+"/"+(rec.n||0)); return h; };
    V43.html._v53=true;
  }
  var css=document.createElement("style"); css.id="v53css"; css.textContent=".v53-book{margin-left:4px}"; document.head.appendChild(css);
})();
