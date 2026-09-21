/* ============================================================
   V43 LAYER — 「이어서 학습하기」 (아토 2026-09-21 "나갔을 때 마지막 학습 진도 저장, 다시 들어갈 때 이어서 학습하기 버튼 + 어디인지 간단히")
   덱(slides_tpl v5a)이 저장 때마다 localStorage "mc-slides-last"(가장 최근 덱)·"mc-slides-last-<deck>"에 위치를 쓴다:
     {deck,title,href,idx,n,sid,part,partTitle,where,qDone,qN,ts}
   앱은 이 값을 읽어 ① 오늘 탭 「오늘 수업」 카드 아래, ② 그 덱이 속한 과목 화면 회차 표 위에 카드를 그린다.
   버튼은 덱을 #resume 으로 연다(#at= 은 파트 시작으로 되돌리므로 쓰지 않는다). 덱 뷰어를 닫으면(closeNote) 카드를 다시 그린다.
   과목 연결: NOTES[].file 또는 V41.DECKS[].file 이 href 끝과 일치하는 것. 같은 덱 원본은 한 곳(덱의 localStorage), 앱은 뷰.
   ============================================================ */
(function(){
  if(window.V43) return;
  var V43=window.V43={};
  V43.KEY="mc-slides-last";
  V43.last=function(){
    /* 저장값은 덱이 쓴 것만 믿되, 숫자 칸은 숫자로 강제하고 문자열 칸은 그릴 때 esc — 조작된 저장값이 HTML로 들어가지 않게 (오타 RED 2026-09-21) */
    try{ var r=JSON.parse(localStorage.getItem(V43.KEY)||"null"); if(!r||typeof r!=="object"||typeof r.href!=="string"||!/^https?:\/\/|^file:/.test(r.href)) return null;
      var num=function(v){ v=Number(v); return isFinite(v)&&v>=0?Math.floor(v):0; };
      return {deck:String(r.deck||""),title:String(r.title||""),href:r.href,idx:num(r.idx),n:num(r.n),sid:String(r.sid||""),part:r.part==null?null:num(r.part),partTitle:String(r.partTitle||""),where:String(r.where||""),qDone:num(r.qDone),qN:num(r.qN),ts:num(r.ts)}; }
    catch(e){ return null; } };
  V43.file=function(rec){ var m=/notes\/[^/?#]+$/.exec(rec.href||""); return m?m[0]:null; };
  V43.courseName=function(rec){
    var f=V43.file(rec); if(!f) return null;
    if(Array.isArray(window.NOTES)){ var n=NOTES.filter(function(x){ return x.file===f; })[0]; if(n&&n.course) return n.course; }
    if(window.V41&&V41.DECKS){ var k=Object.keys(V41.DECKS).filter(function(name){ return V41.DECKS[name].file===f; })[0]; if(k) return k; }
    return null;
  };
  V43.ago=function(ts){
    var d=Date.now()-ts; if(!(d>=0)) return "";
    var m=Math.floor(d/60000), h=Math.floor(m/60), dd=Math.floor(h/24);
    if(m<1) return "방금"; if(m<60) return m+"분 전"; if(h<24) return h+"시간 전"; if(dd===1) return "어제"; if(dd<7) return dd+"일 전";
    var t=new Date(ts); return (t.getMonth()+1)+"/"+t.getDate();
  };
  V43.html=function(rec,withCourse){
    var cn=withCourse?V43.courseName(rec):null;
    var pos=(rec.idx+1)+"/"+rec.n+"장", q=rec.qN?(" · 문제 "+rec.qDone+"/"+rec.qN):"";
    var where=(rec.part?"파트 "+rec.part+(rec.partTitle?" "+esc(rec.partTitle):"")+" › ":"")+esc(rec.where||"");
    var finished=rec.n>0&&rec.idx>=rec.n-1;
    return '<div class="card-h"><h3>이어서 학습하기</h3><span class="hs">RESUME</span><div class="ha"><span class="kbdhint">'+esc(V43.ago(rec.ts))+'</span></div></div>'+
      '<div class="card-b v43-b"><div class="v43-t">'+(cn?'<span class="chip">'+esc(cn)+'</span> ':'')+esc(rec.title||"학습 슬라이드")+'</div>'+
      '<div class="v43-w">'+where+'</div><div class="v43-m">'+pos+q+(finished?' · 끝까지 봤음':'')+'</div>'+
      '<div class="v43-a"><button class="btn a" data-v43go="'+esc(rec.href)+'" data-v43title="'+esc(rec.title||"")+'">'+(finished?"다시 열기":"이어서 학습하기")+'</button></div></div>';
  };
  V43.bind=function(card){
    $$("[data-v43go]",card).forEach(function(b){ b.onclick=function(){ openNote(b.dataset.v43go+"#resume", b.dataset.v43title||"학습 슬라이드"); }; });
  };
  /* ① 오늘 탭 */
  V43.renderToday=function(){
    var v=$("#v-today"); if(!v) return; var rec=V43.last(); var c=$("#v43Today");
    if(!rec){ if(c) c.remove(); return; }
    if(!c){ c=document.createElement("div"); c.className="card v43"; c.id="v43Today";
      var after=$("#dayBooks"); var dc=after?after.closest(".card"):null; if(dc&&dc.nextSibling) v.insertBefore(c,dc.nextSibling); else v.appendChild(c); }
    c.innerHTML=V43.html(rec,true); V43.bind(c);
  };
  /* ② 과목 화면 — 그 과목 덱일 때만 */
  V43.renderCourse=function(){
    var c=course(ui.course); var box=$("#cNotes"); var old=$("#v43Course"); if(old) old.remove();
    if(!c||!box) return; var rec=V43.last(); if(!rec||V43.courseName(rec)!==c.name) return;
    var host=box.closest(".card")||box; var card=document.createElement("div"); card.className="card v43"; card.id="v43Course";
    card.innerHTML=V43.html(rec,false); V43.bind(card); host.parentNode.insertBefore(card,host);
  };
  V43.refresh=function(){ try{ V43.renderToday(); }catch(e){} try{ if(ui.view==="course") V43.renderCourse(); }catch(e){} };
  var _renderToday=renderToday; renderToday=function(){ _renderToday(); try{ V43.renderToday(); }catch(e){ if(window.console) console.warn("V43", e); } };
  var _renderCourse=renderCourse; renderCourse=function(){ _renderCourse(); try{ V43.renderCourse(); }catch(e){ if(window.console) console.warn("V43", e); } };
  var _closeNote=closeNote; closeNote=function(){ _closeNote(); V43.refresh(); };
  window.addEventListener("storage",function(e){ if(e&&e.key===V43.KEY) V43.refresh(); });
  var css=document.createElement("style"); css.id="v43css";
  css.textContent=[
    ".v43 .v43-b{display:grid;gap:4px}",
    ".v43 .v43-t{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".v43 .v43-w{font-size:.95em}",
    ".v43 .v43-m{font-size:.85em;color:var(--mut)}",
    ".v43 .v43-a{margin-top:6px}",
    ".v43 .v43-a .btn{width:100%;justify-content:center}"
  ].join("\n");
  document.head.appendChild(css);
})();
