/* ============================================================
   V69 LAYER — 과목 화면 「과제 파일」 카드 (대표님 2026-10-02 「과목별로 과제 제출용 파일 모아둔 건 따로 없는 거야?」) (BUILD 2026-10-03.132)
   데이터: _private/hwfiles.json(docs/tools/build_hw_files.py — study-materials/<과목>/_과제 실측, atom 안에서만 열림, 공개 저장소 제외).
   주차·Ch. 묶음 최신순, 파일마다 용도 칩(제출본 · 옮겨 적기 · 필기 서식 · 이해용 · 문제지 · 활동지). 같은 파일이 아이패드 iCloud 학교/2026-2/<과목>/과제 에도 있다.
   ============================================================ */
(function(){
  if(window.V69) return;
  var V69=window.V69={D:null,P:null};
  var ORD={"제출본":0,"옮겨 적기":1,"필기 서식":2,"문제지":3,"활동지":4,"이해용":5,"자료":6};
  V69.load=function(){
    if(V69.P) return V69.P;
    V69.P=(ATOM_HOSTED?fetch("_private/hwfiles.json",{cache:"no-cache"}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }):Promise.resolve(null))
      .then(function(d){ V69.D=d; return d; });
    return V69.P;
  };
  V69.num=function(g){ var m=/(\d+)/.exec(g||""); return m?+m[1]:0; };
  V69.html=function(items){
    var by={}, keys=[];
    items.forEach(function(it){ var g=it.group||"기타"; if(!by[g]){ by[g]=[]; keys.push(g); } by[g].push(it); });
    keys.sort(function(a,b){ return V69.num(b)-V69.num(a); });
    return keys.map(function(g,i){
      var rows=by[g].slice().sort(function(a,b){ return (ORD[a.kind]||9)-(ORD[b.kind]||9)||a.name.localeCompare(b.name); });
      return '<details class="v69-g"'+(i===0?' open':'')+'><summary><b>'+esc(g)+'</b><span>'+rows.length+'개</span></summary>'+
        rows.map(function(it){ return '<a class="v69-f" href="'+esc(encodeURI(it.src))+'" target="_blank" rel="noopener"><span class="v69-k k'+(ORD[it.kind]==null?9:ORD[it.kind])+'">'+esc(it.kind)+'</span><span class="v69-n">'+esc(it.name)+'</span><span class="v69-m">'+esc(it.mtime||"")+'</span></a>'; }).join("")+'</details>';
    }).join("");
  };
  V69.render=function(){
    var v=$("#v-course"), c=course(ui.course); if(!v||!c) return;
    var old=$("#v69Card",v);
    if(!ATOM_HOSTED){ if(old) old.remove(); return; }
    var draw=function(){
      var items=((V69.D&&V69.D.items)||[]).filter(function(it){ return it.subj===c.name; });
      var card=$("#v69Card",v);
      if(!items.length){ if(card) card.remove(); return; }
      var anchor=$("#v58Card",v)||$("#v55Hero",v); if(!anchor) return;
      if(!card){ card=document.createElement("div"); card.id="v69Card"; card.className="card v69"; }
      if(card.previousElementSibling!==anchor) anchor.insertAdjacentElement("afterend",card);
      card.innerHTML='<div class="card-h"><h3>과제 파일</h3><span class="hs">'+items.length+'개</span></div><div class="v69-b">'+V69.html(items)+
        '<div class="v69-h">아이패드: iCloud Drive › 학교 › 2026-2 › '+esc(c.name)+' › 과제</div></div>';
    };
    if(V69.D) draw(); else V69.load().then(function(){ if(ui.view==="course"&&course(ui.course)===c) draw(); });
  };
  if(window.V55&&V55.render&&!V55._v69){ var _r=V55.render; V55.render=function(){ var x=_r.apply(this,arguments); try{ V69.render(); }catch(e){ if(window.console) console.warn("V69",e); } return x; }; V55._v69=1; }
  var css=document.createElement("style"); css.id="v69css";
  css.textContent=[
    ".v69-b{padding:8px 14px 14px}",
    ".v69-g{border-top:1px solid var(--line)}.v69-g:first-child{border-top:0}",
    ".v69-g summary{cursor:pointer;min-height:42px;display:flex;align-items:center;gap:8px;font-size:14px}.v69-g summary span{font-size:12px;color:var(--ink-3)}",
    ".v69-f{display:flex;align-items:center;gap:10px;min-height:40px;padding:4px 2px;text-decoration:none;color:inherit;border-radius:8px}",
    ".v69-f:hover{background:color-mix(in srgb,var(--line) 35%,transparent)}",
    ".v69-k{flex:none;min-width:64px;text-align:center;font-size:11.5px;font-weight:800;padding:2px 8px;border-radius:99px;border:1.5px solid var(--line);color:var(--ink-2,#444)}",
    ".v69-k.k0{background:#2E7D00;border-color:#2E7D00;color:#fff}.v69-k.k1{border-color:#1E5FA8;color:#1E5FA8}",
    ".v69-n{flex:1;min-width:0;font-size:13.5px;overflow-wrap:anywhere}",
    ".v69-m{flex:none;font-size:11.5px;color:var(--ink-3);font-family:var(--font-num,inherit)}",
    ".v69-h{margin-top:8px;font-size:12px;color:var(--ink-3)}",
    "@media (max-width:600px){.v69-m{display:none}}"
  ].join("\n");
  document.head.appendChild(css);
})();
