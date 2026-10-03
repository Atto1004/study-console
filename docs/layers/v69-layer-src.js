/* ============================================================
   V69 LAYER — 과목 화면 「과제 파일」 카드 (대표님 2026-10-02 「과목별로 과제 제출용 파일 모아둔 건 따로 없는 거야?」) (BUILD 2026-10-03.133 · .134 혼자 풀기 · .138 제출본만 · Ch 오름차순)
   데이터: _private/hwfiles.json(docs/tools/build_hw_files.py — study-materials/<과목>/_과제 실측, atom 안에서만 열림, 공개 저장소 제외).
   주차·Ch. 묶음 최신순, 파일마다 용도 칩(제출본 · 옮겨 적기 · 필기 서식 · 이해용 · 문제지 · 활동지). 같은 파일이 아이패드 iCloud 학교/2026-2/<과목>/과제 에도 있다.
   .134: 정역학은 카드 맨 위 「혼자 풀기 · Ch.N」 버튼(os-a4 의 notes/lessons/_private/statics/hw — 단계 연습·실전, 진행 = localStorage mc-hw-statics, clean ≥ 2 면 혼자 ✓).
   ============================================================ */
(function(){
  if(window.V69) return;
  var V69=window.V69={D:null,P:null};
  V69.load=function(){
    if(V69.P) return V69.P;
    V69.P=(ATOM_HOSTED?fetch("_private/hwfiles.json",{cache:"no-cache"}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }):Promise.resolve(null))
      .then(function(d){ V69.D=d; return d; });
    return V69.P;
  };
  V69.PLAY={"정역학":{path:"notes/lessons/_private/statics/hw/",key:"mc-hw-statics",chs:[3,4]}};
  V69.T={};
  V69.total=function(pl,ch){ var k=pl.path+ch; if(V69.T[k]!==undefined) return V69.T[k]; V69.T[k]=null;
    fetch(pl.path+"ch"+ch+".json",{cache:"no-cache"}).then(function(r){ return r.ok?r.json():null; }).then(function(d){ V69.T[k]=d&&d.problems?d.problems.map(function(x){ return String(x.id); }):[]; var b=$("#v69Play"); if(b) V69.playFill(b,pl); }).catch(function(){ V69.T[k]=[]; });
    return null; };
  V69.playFill=function(box,pl){
    var rec={}; try{ rec=JSON.parse(localStorage.getItem(pl.key)||"{}")||{}; }catch(e){}
    $$(".v69-pb",box).forEach(function(b){ var ch=b.getAttribute("data-ch"), ids=V69.total(pl,ch), s=b.querySelector("small"); if(!s) return;
      if(!ids||!ids.length){ s.textContent=""; return; }
      var ok=ids.filter(function(id){ return rec[id]&&rec[id].clean>=2; }).length, tried=ids.filter(function(id){ return rec[id]&&rec[id].runs&&rec[id].runs.length; }).length;
      s.textContent=ok===ids.length?"혼자 ✓ 전부":"혼자 ✓ "+ok+"/"+ids.length+(tried>ok?" · 연습 중 "+(tried-ok):""); });
  };
  V69.num=function(g){ var m=/(\d+)/.exec(g||""); return m?+m[1]:0; };
  /* 10/3: 주차(Ch.)마다 답 적힌 제출본 하나만(build_hw_files.py answer_score) — 번호 오름차순 한 줄씩 */
  V69.html=function(items){
    return items.slice().sort(function(a,b){ return (V69.num(a.group)||999)-(V69.num(b.group)||999)||a.name.localeCompare(b.name); }).map(function(it){
      return '<a class="v69-f" href="'+esc(encodeURI(it.src))+'" target="_blank" rel="noopener"><span class="v69-k k0">'+esc(it.group||"기타")+'</span><span class="v69-n">'+esc(it.name)+'</span><span class="v69-m">'+esc(it.mtime||"")+'</span></a>'; }).join("");
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
      card.innerHTML='<div class="card-h"><h3>과제 제출본'+(window.V71?V71.info("주차(Ch.)마다 답이 적힌 제출본 하나만 둡니다. 보고 손으로 옮겨 적어 내는 용.\n양식 · 필기 서식 · 가이드는 아이패드 iCloud Drive › 학교 › 2026-2 › "+c.name+" › 과제 에 있습니다."):"")+'</h3><span class="hs">'+items.length+'개</span></div><div class="v69-b">'+(V69.PLAY[c.name]?'<div class="v69-play" id="v69Play">'+V69.PLAY[c.name].chs.map(function(ch){ return '<button type="button" class="v69-pb" data-ch="'+ch+'"><b>혼자 풀기 · Ch.'+ch+'</b><small></small></button>'; }).join("")+'</div>':'')+V69.html(items)+'</div>';
      var pl=V69.PLAY[c.name], box=$("#v69Play",card);
      if(pl&&box){ V69.playFill(box,pl); $$(".v69-pb",box).forEach(function(b){ b.onclick=function(){ var ch=b.getAttribute("data-ch"); openNote(pl.path+"index.html?ch="+ch,c.name+" 혼자 풀기 · Ch."+ch); }; }); }
    };
    if(V69.D) draw(); else V69.load().then(function(){ if(ui.view==="course"&&course(ui.course)===c) draw(); });
  };
  if(window.V55&&V55.render&&!V55._v69){ var _r=V55.render; V55.render=function(){ var x=_r.apply(this,arguments); try{ V69.render(); }catch(e){ if(window.console) console.warn("V69",e); } return x; }; V55._v69=1; }
  var css=document.createElement("style"); css.id="v69css";
  css.textContent=[
    ".v69-b{padding:8px 14px 14px}",
    ".v69-f{display:flex;align-items:center;gap:10px;min-height:40px;padding:4px 2px;text-decoration:none;color:inherit;border-radius:8px}",
    ".v69-f:hover{background:color-mix(in srgb,var(--line) 35%,transparent)}",
    ".v69-k{flex:none;min-width:64px;text-align:center;font-size:11.5px;font-weight:800;padding:2px 8px;border-radius:99px;border:1.5px solid var(--line);color:var(--ink-2,#444)}",
    ".v69-k.k0{background:#2E7D00;border-color:#2E7D00;color:#fff}.v69-k.k1{border-color:#1E5FA8;color:#1E5FA8}",
    ".v69-n{flex:1;min-width:0;font-size:13.5px;overflow-wrap:anywhere}",
    ".v69-m{flex:none;font-size:11.5px;color:var(--ink-3);font-family:var(--font-num,inherit)}",
    ".v69-play{display:flex;gap:8px;flex-wrap:wrap;margin:2px 0 8px}",
    ".v69-pb{flex:1 1 180px;display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:52px;padding:8px 14px;border:2px solid #2E7D00;border-radius:12px;background:color-mix(in srgb,#58CC02 10%,var(--surface));color:#1F5A00;cursor:pointer;text-align:left;font:inherit}",
    ".v69-pb b{font-size:14.5px;font-weight:800}.v69-pb small{font-size:12px;color:var(--ink-3);min-height:15px}",
    ".v69-h{margin-top:8px;font-size:12px;color:var(--ink-3)}",
    "@media (max-width:600px){.v69-m{display:none}}"
  ].join("\n");
  document.head.appendChild(css);
})();
