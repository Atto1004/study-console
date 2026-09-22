/* ============================================================
   V47 LAYER — 커리큘럼 · 지식 이원화 (아토 2026-09-21 §16 ②③: "아토가 이해한 지식 vs 김주영T의 지식(시험 범위·수업 내용 전부), 목표 = ①이 ②를 덮기 · 과목별 진도·목차 커리큘럼")
   ② 시험 범위 지식 = knowledge/map.json(과목 → 주차 → 노드) + graph.json(노드 정의). ① 이해한 지식 = mastery(atom /api/mastery, 밖에서는 localStorage atto.mastery — learn.html 과 같은 점수식).
   화면: 학습 탭 「커리큘럼 · 시험 범위 vs 이해」 카드(과목마다 접힘 행: 범위 노드 N · 이해 확인 M · 흔들림 · 비어 있음 + 막대) → 펼치면 주차별 목차(범위 주차 강조, 노드 칩 색 = 상태). 과목 화면에도 그 과목 카드 1개.
   범위 주차 = 다가오는 시험의 scope "n~m주차"(V25.examWeeks), 없으면 1~현재 주차. 칩 클릭 → learn.html?subject=…(지식맵·퀴즈). 데이터 못 읽으면 그렇다고 표시(지어내지 않음).
   ============================================================ */
(function(){
  if(window.V47) return;
  var V47=window.V47={};
  V47.G=null; V47.M=null; V47.NODES={}; V47.MAST={}; V47.err=null; V47.open={};
  try{ V47.open=JSON.parse(localStorage.getItem("mc-cur-open")||"{}"); }catch(e){}
  var hosted=function(){ return !!window.ATOM_HOSTED; };
  /* ---- 점수식 (learn.html · server.py mastery_score 와 동일) ---- */
  V47.decay=function(ts){ if(!ts) return 1; var d=Math.max(0,(Date.now()/1000-ts)/86400); return Math.max(.4,1-d/60); };
  V47.state=function(e){
    if(!e||typeof e!=="object") return "unrated";
    var q=e.quiz||{}, tot=+q.total||0, cor=+q.correct||0, sv=e.self==null?null:Math.max(1,Math.min(5,+e.self));
    if(tot<=0&&sv==null) return "unrated";
    var raw=tot>0?(0.5*(cor/tot)+0.2*((sv||0)/5))/0.7:(sv/5)*0.6;
    var s=Math.min(1,raw)*V47.decay(Math.max(+e.ts||0,+q.ts||0));
    if(tot<=0) return (sv>=4&&s>=.4)?"shaky":"unknown";
    return s>=.7?"known":s>=.4?"shaky":"unknown";
  };
  V47.ST={known:"이해 확인",shaky:"흔들림",unknown:"모름",unrated:"미평가"};
  /* ---- 데이터 ---- */
  V47.load=function(){
    if(V47.loading) return V47.loading;
    var j=function(u){ return fetch(u,{cache:"no-store"}).then(function(r){ if(!r.ok) throw new Error(u+" "+r.status); return r.json(); }); };
    var mast= hosted() ? fetch("/api/mastery",{credentials:"same-origin"}).then(function(r){ return r.ok?r.json():{}; }).then(function(d){ return (d&&d.mastery)||{}; }).catch(function(){ return null; })
                       : Promise.resolve((function(){ try{ return JSON.parse(localStorage.getItem("atto.mastery")||"{}"); }catch(e){ return {}; } })());
    V47.loading=Promise.all([j("knowledge/graph.json"),j("knowledge/map.json"),mast]).then(function(a){
      V47.G=a[0]; V47.M=a[1]; V47.MAST=a[2]||{}; V47.mastErr=(a[2]===null); V47.NODES={}; (V47.G.nodes||[]).forEach(function(n){ V47.NODES[n.id]=n; }); V47.err=null; return true;
    }).catch(function(e){ V47.err=String(e&&e.message||e); return false; });
    return V47.loading;
  };
  V47.scopeWeeks=function(c){
    var cw=currentWeek()||1, ex=exams(c.id).filter(function(e){ return diffDays(today(),e.date)>=0; })[0];
    if(ex&&window.V25&&V25.examWeeks) return {weeks:V25.examWeeks(ex,Math.max(cw,1)),ex:ex};
    var out=[]; for(var w=1;w<=Math.max(cw,1);w++) out.push(w); return {weeks:out,ex:null};
  };
  V47.summary=function(c){
    var d=V47.M&&V47.M[c.name]; if(!d) return null;
    var sc=V47.scopeWeeks(c), ids=[], seen={};
    sc.weeks.forEach(function(w){ var wk=d.weeks[String(w)]; if(!wk) return; (wk.nodes||[]).forEach(function(id){ if(V47.NODES[id]&&!seen[id]){ seen[id]=1; ids.push(id); } }); });
    var cnt={known:0,shaky:0,unknown:0,unrated:0}; ids.forEach(function(id){ cnt[V47.state(V47.MAST[id])]++; });
    return {ids:ids,cnt:cnt,scope:sc,weeks:Object.keys(d.weeks).map(Number).sort(function(a,b){return a-b;}),d:d};
  };
  /* ---- 렌더 ---- */
  var chip=function(id){ var n=V47.NODES[id]; if(!n) return ""; var st=V47.state(V47.MAST[id]);
    return '<a class="v47-n st-'+st+'" href="learn.html?subject='+encodeURIComponent(n.subject)+'" title="'+esc(n.desc||"")+' · '+V47.ST[st]+'">'+esc(n.name)+'</a>'; };
  V47.courseHTML=function(c,single){
    var s=V47.summary(c); if(!s) return '';
    var total=s.ids.length, k=s.cnt.known, bar=total?'<span class="v47-bar"><i class="k" style="width:'+(k/total*100)+'%"></i><i class="s" style="width:'+(s.cnt.shaky/total*100)+'%"></i><i class="u" style="width:'+(s.cnt.unknown/total*100)+'%"></i></span>':'';
    var scopeTxt=s.scope.ex?(s.scope.ex.kind==="중간"?"중간":s.scope.ex.kind==="기말"?"기말":s.scope.ex.kind)+" 범위 "+s.scope.weeks[0]+"~"+s.scope.weeks[s.scope.weeks.length-1]+"주차":"지금까지 1~"+s.scope.weeks[s.scope.weeks.length-1]+"주차";
    var open=single||!!V47.open[c.id];
    var head='<div class="v47-row" data-c="'+c.id+'"><span class="crow-chip" style="background:'+(window.V44?V44.color(c):"#5B6B8C")+'">'+esc(window.V44?V44.abbr(c.name):c.name.slice(0,2))+'</span>'+
      '<span class="v47-main"><span class="v47-t">'+esc(c.name)+' <small>'+esc(scopeTxt)+'</small></span>'+
      '<span class="v47-m">범위 '+total+' · <b class="k">이해 확인 '+k+'</b> · 흔들림 '+s.cnt.shaky+' · 비어 있음 '+(s.cnt.unknown+s.cnt.unrated)+(V47.mastErr?' · <span class="v47-warn">이해도 못 읽음</span>':'')+'</span>'+bar+'</span>'+
      (single?'':'<button class="crow-more" data-v47t="'+c.id+'" aria-label="펼치기">'+(open?"−":"+")+'</button>')+'</div>';
    if(!open) return head;
    var cw=currentWeek()||1;
    var rows=s.weeks.map(function(w){ var wk=s.d.weeks[String(w)], inScope=s.scope.weeks.indexOf(w)>=0, nodes=(wk.nodes||[]).filter(function(id){return V47.NODES[id];});
      return '<div class="v47-wk'+(inScope?" scope":"")+(wk.planned?" planned":"")+(w===cw?" cur":"")+'"><div class="v47-wh"><b>'+w+'주차</b>'+(wk.planned?'<span class="chip mut">예정</span>':'')+(inScope?'<span class="chip acc">범위</span>':'')+'<span class="v47-wt">'+esc(wk.title||"")+'</span></div>'+
        '<div class="v47-nodes">'+(nodes.length?nodes.map(chip).join(""):'<span class="v44-mut">노드 없음</span>')+'</div></div>'; }).join("");
    var missing=s.ids.filter(function(id){ return V47.state(V47.MAST[id])!=="known"; });
    var next=missing.length?'<div class="v47-next"><b>다음 확인할 것</b> '+missing.slice(0,4).map(chip).join("")+(missing.length>4?'<span class="v44-mut"> 외 '+(missing.length-4)+'</span>':'')+' <a class="btn xs" href="learn.html?subject='+encodeURIComponent(c.name)+'">지식맵에서 확인</a></div>':'<div class="v47-next"><b>범위 전부 이해 확인됨</b></div>';
    return head+'<div class="v47-body">'+next+rows+'</div>';
  };
  V47.legend='<div class="v47-legend"><span class="v47-n st-known">이해 확인</span><span class="v47-n st-shaky">흔들림</span><span class="v47-n st-unknown">모름</span><span class="v47-n st-unrated">미평가</span><span class="v44-mut">① 이해 = 퀴즈·자가평가로 확인된 것 · ② 범위 = 시험 범위 주차의 수업 내용. 목표는 ①이 ②를 덮는 것</span></div>';
  V47.bind=function(root){
    $$("[data-v47t]",root).forEach(function(b){ b.onclick=function(){ V47.open[b.dataset.v47t]=!V47.open[b.dataset.v47t]; try{ localStorage.setItem("mc-cur-open",JSON.stringify(V47.open)); }catch(e){} V47.renderStudy(); }; });
    $$(".v47-row",root).forEach(function(r){ r.onclick=function(ev){ if(ev.target.closest("a,button")) return; var b=r.querySelector("[data-v47t]"); if(b) b.click(); }; });
  };
  V47.ensureCard=function(){
    var v=$("#v-study"); if(!v) return null; var c=$("#v47Card");
    if(!c){ c=document.createElement("div"); c.className="card v47"; c.id="v47Card";
      c.innerHTML='<div class="card-h"><h3>커리큘럼 · 시험 범위 vs 이해</h3><span class="hs"></span><div class="ha"><a class="btn xs" href="learn.html">지식맵</a></div></div><div class="card-b tight" id="v47Body"></div>';
      var first=null; Array.prototype.some.call(v.children,function(el){ if(el.classList&&el.classList.contains("card")){ first=el; return true; } }); if(first) v.insertBefore(c,first); else v.appendChild(c); }   /* 학습 탭 첫 카드 = 커리큘럼 (kmapEntry 는 .vh 안에 있음) */
    return c;
  };
  V47.renderStudy=function(){
    var c=V47.ensureCard(); if(!c) return; var body=$("#v47Body");
    if(!V47.G){ body.innerHTML='<div class="v44-mut" style="padding:12px">'+(V47.err?"커리큘럼을 못 읽었습니다: "+esc(V47.err):"불러오는 중…")+'</div>'; if(!V47.err) V47.load().then(function(){ V47.renderStudy(); }); return; }
    var cs=courses().filter(function(x){ return !isPersonal(x)&&V47.M&&V47.M[x.name]; });
    body.innerHTML=(cs.length?cs.map(function(x){ return V47.courseHTML(x,false); }).join(""):'<div class="v44-mut" style="padding:12px">커리큘럼이 등록된 과목이 없습니다.</div>')+V47.legend;
    V47.bind(body);
  };
  V47.renderCourse=function(){
    var c=course(ui.course); var old=$("#v47Course"); if(old) old.remove(); if(!c||isPersonal(c)) return;
    var box=$("#cNotes"); if(!box) return; var host=box.closest(".card")||box;
    var card=document.createElement("div"); card.className="card v47"; card.id="v47Course";
    var inner=function(){ card.innerHTML='<div class="card-h"><h3>시험 범위 vs 이해</h3><span class="hs"></span><div class="ha"><a class="btn xs" href="learn.html?subject='+encodeURIComponent(c.name)+'">지식맵</a></div></div><div class="card-b tight">'+(V47.G?(V47.courseHTML(c,true)||'<div class="v44-mut" style="padding:12px">이 과목은 커리큘럼(map.json)에 아직 없습니다.</div>')+V47.legend:'<div class="v44-mut" style="padding:12px">불러오는 중…</div>')+'</div>'; V47.bind(card); };
    inner(); host.parentNode.insertBefore(card,host);
    if(!V47.G) V47.load().then(function(){ if($("#v47Course")===card) inner(); });
  };
  var _renderStudy=renderStudy; renderStudy=function(){ _renderStudy(); try{ V47.renderStudy(); }catch(e){ if(window.console) console.warn("V47", e); } };
  var _renderCourse=renderCourse; renderCourse=function(){ _renderCourse(); try{ V47.renderCourse(); }catch(e){ if(window.console) console.warn("V47", e); } };
  window.addEventListener("storage",function(e){ if(e&&e.key==="atto.mastery"){ V47.loading=null; V47.load().then(function(){ if(ui.view==="study") V47.renderStudy(); if(ui.view==="course") V47.renderCourse(); }); } });

  var css=document.createElement("style"); css.id="v47css";
  css.textContent=[
    ".v47-row{display:flex;align-items:center;gap:12px;padding:10px 12px;border-top:1px solid var(--line);cursor:pointer}.v47-row:first-child{border-top:0}.v47-row:hover{background:var(--surface-2)}",
    ".v47-main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:3px}.v47-t{font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v47-t small{font-weight:400;font-size:12px;color:var(--ink-3);margin-left:6px}",
    ".v47-m{font-size:12px;color:var(--ink-3)}.v47-m b.k{color:var(--accent);font-weight:600}.v47-warn{color:var(--crit)}",
    ".v47-bar{display:flex;height:6px;border-radius:3px;background:var(--line);overflow:hidden;margin-top:2px}.v47-bar i{display:block;height:100%}.v47-bar i.k{background:var(--accent)}.v47-bar i.s{background:#E5C400}.v47-bar i.u{background:var(--crit)}",
    ".v47-body{padding:4px 12px 12px;border-top:1px solid var(--line);background:var(--bg)}",
    ".v47-wk{padding:8px 0;border-top:1px dashed var(--line)}.v47-wk:first-of-type{border-top:0}.v47-wk.scope .v47-wh b{color:var(--accent)}.v47-wk.planned .v47-wt{color:var(--ink-3)}.v47-wk.cur .v47-wh b::after{content:' · 이번 주';font-weight:400;color:var(--ink-3)}",
    ".v47-wh{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px;line-height:18px}.v47-wh b{flex:0 0 auto}.v47-wt{flex:1 1 200px;min-width:0;color:var(--ink-2)}",
    ".v47-nodes{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}",
    ".v47-n{display:inline-flex;align-items:center;gap:4px;font-size:12px;line-height:16px;padding:3px 9px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink);text-decoration:none}.v47-n::before{content:'';width:7px;height:7px;border-radius:50%;background:#B9C4BE}",
    ".v47-n.st-known{border-color:var(--accent);background:var(--accent-soft)}.v47-n.st-known::before{background:var(--accent)}.v47-n.st-shaky::before{background:#E5C400}.v47-n.st-unknown::before{background:var(--crit)}",
    ".v47-next{font-size:13px;padding:8px 0 6px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}.v47-next b{margin-right:4px}",
    ".v47-legend{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:10px 12px;border-top:1px solid var(--line);font-size:12px}",
    "@media(max-width:860px){.v47-t{white-space:normal}.v47-row{padding:10px}}"
  ].join("\n");
  document.head.appendChild(css);
})();
