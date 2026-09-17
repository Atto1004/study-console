/* ============================================================
   V38 LAYER — 학습하기 = 바로 학습 화면 (아토 2026-09-17 "학습하기 버튼 → 수업내용 제거, 바로 학습화면 뜨게")
   ① openStudy(cid, w, date): 그 회차(또는 그 주)에 학습 슬라이드가 연결돼 있으면 수업 내용 화면(studyunit)을 거치지 않고
      슬라이드를 앱 안(iframe 뷰어)에서 바로 연다. 슬라이드가 없는 회차만 기존 화면으로.
   ② 회차 표(V37)의 [학습하기]: 슬라이드가 있으면 그대로, 없으면 비활성 「학습 준비 중」 — 수업 내용 화면으로 가는 길을 없앤다.
   ③ 미적2 과목 규칙에서 「미적분 클리닉 매주 가야 한다」 제거 (아토 2026-09-17) — V33.SPEC 원본에서 지움.
   슬라이드 판정: 회차 단위면 그 회차 정리 links만, 주 단위면 주 정리 links → NOTES(type 학습, 같은 과목·주차). *slides.html 을 찾는다.
   ============================================================ */
(function(){
  if(window.V38) return;
  var V38=window.V38={};
  var isDeck=function(u){ return /slides\.html(\?|#|$)/.test(u||""); };
  V38.deckFor=function(c,w,date){
    if(!c) return null;
    var pick=function(links){ var l=(links||[]).filter(function(x){ return isDeck(x.url); })[0]; return l?{url:l.url,title:l.label||l.url}:null; };
    var d=null;
    /* 회차(date)가 주어지면 그 회차 정리에 연결된 슬라이드만 — 같은 주라도 다른 단원(예: 9/10 벡터)에 행렬 슬라이드를 붙이지 않는다 */
    if(date){ if(window.V36){ var dn=V36.dayNote(c,date); if(dn) d=pick(dn.links); } return d; }
    if(w){ var wn=weekNote(c,w); if(wn) d=pick(wn.links); }
    if(!d&&w&&Array.isArray(window.NOTES)){ var n=NOTES.filter(function(x){ return x.course===c.name&&x.type==="학습"&&x.week===w&&isDeck(x.file); })[0]; if(n) d={url:n.file,title:n.title}; }
    return d;
  };
  /* ① openStudy 스왑 */
  var _openStudy=openStudy;
  openStudy=function(cid,w,date){
    var c=course(cid), d=V38.deckFor(c,w,date);
    if(d){ openNote(d.url,d.title); return; }
    _openStudy(cid,w,date);
  };
  /* ② 회차 표 버튼 */
  if(window.V37&&V37.cellHTML){
    var _cellHTML=V37.cellHTML;
    V37.cellHTML=function(c,x){
      var h=_cellHTML(c,x);
      if(x.state==="hol") return h;
      if(V38.deckFor(c,x.week,x.split?x.date:null)) return h;
      return h.replace('<button class="btn xs a" data-v37study="'+x.date+'|'+x.week+'">학습하기</button>',
                       '<button class="btn xs v38-off" disabled title="이 회차 학습 슬라이드 준비 중">학습 준비 중</button>');
    };
  }
  /* ③ 과목 규칙 정리 */
  if(window.V33&&V33.SPEC&&V33.SPEC["미분적분학2"]){
    var sp=V33.SPEC["미분적분학2"]; sp.rules=sp.rules.filter(function(r){ return !/클리닉/.test(r); });
  }
  var css=document.createElement("style"); css.id="v38css";
  css.textContent=".v38-off{opacity:.5;cursor:default}";
  document.head.appendChild(css);
})();
