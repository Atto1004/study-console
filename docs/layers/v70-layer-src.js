/* ============================================================
   V70 LAYER — 오늘 탭 맨 위: 한양 포털 끊김 대신 클로바노트 반영 상태 (대표님 2026-10-03 「상단에는 연결끊김 한양포털 대신에 클로바노트 녹음본 변환 몇 개 대기 중이고,
   지금 최근에 어떤 과목의 녹음본까지 학습앱에 적용시켰는지 확인할 수 있게」) (BUILD 2026-10-03.144)
   데이터: knowledge/clova-status.json(docs/tools/clova_status.py, 매시간 check_integrations.ps1 — .gitignore, atom 안에서만).
   V48 배너에서 한양 포털 · 비교과(HY-LU-E) 끊김은 빼고(학습앱과 상관없음), 맨 위에 「클로바노트 · 변환 대기 N개 · 최근 반영 과목 날짜」 한 줄.
   ============================================================ */
(function(){
  if(window.V70||!window.V48) return;
  var V70=window.V70={d:null,at:0,SKIP:{portal:1,hylue:1}};
  V70.load=function(){
    if(Date.now()-V70.at<60000) return Promise.resolve(V70.d);
    return fetch("knowledge/clova-status.json",{cache:"no-store"}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; })
      .then(function(d){ V70.d=d; V70.at=Date.now(); return d; });
  };
  V70.md=function(d){ return window.V60&&V60.md?V60.md(d):String(d||"").slice(5).replace("-","/"); };
  V70.html=function(c){
    if(!c) return "";
    var p=c.pending||[], last=c.last;
    return '<div class="v70"><div class="v70-h"><b>클로바노트</b>'+
      '<span class="v70-n'+(p.length?' wait':'')+'">변환 대기 <b>'+p.length+'</b>개</span>'+
      (last?'<span>최근 반영 <b>'+esc(last.subj)+' '+esc(V70.md(last.date))+'</b></span>':'<span>반영한 녹음본 없음</span>')+
      (c.unclassified?'<span class="v70-u">과목 모름 '+c.unclassified+'개</span>':'')+'</div>'+
      (p.length?'<div class="v70-p">'+p.map(function(x){ return '<span>'+esc(x.subj)+' '+esc(V70.md(x.date))+'</span>'; }).join("")+'</div>':'')+'</div>';
  };
  var _load=V48.load; V48.load=function(){ var a=arguments, self=this; return Promise.all([_load.apply(self,a),V70.load()]).then(function(r){ return r[0]; }); };
  var _html=V48.html; V48.html=function(d){
    var dd=d;
    if(d&&d.items){ dd={}; for(var k in d) dd[k]=d[k]; dd.items={}; Object.keys(d.items).forEach(function(k){ if(!V70.SKIP[k]) dd.items[k]=d.items[k]; }); }
    return V70.html(V70.d)+_html.call(this,dd);
  };
  var css=document.createElement("style"); css.id="v70css";
  css.textContent=[
    ".v48:has(.v70):not(:has(.v48-h)){border-color:var(--line);background:var(--surface)}",
    ".v70+.v48-h{margin-top:8px;padding-top:8px;border-top:1px solid color-mix(in srgb,var(--crit) 25%,var(--line))}",
    ".v70-h{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 14px;font-size:13.5px}.v70-h>b{font-size:14px}",
    ".v70-n b{font-size:15px;font-variant-numeric:tabular-nums}.v70-n.wait b{color:#B45309}",
    ".v70-u{color:var(--ink-3);font-size:12.5px}",
    ".v70-p{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.v70-p span{font-size:12px;padding:2px 9px;border-radius:99px;background:color-mix(in srgb,#B45309 10%,var(--surface));color:#8A4106}"
  ].join("\n");
  document.head.appendChild(css);
})();
