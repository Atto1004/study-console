/* ============================================================
   V50 LAYER — 수업 따라가기 (대표님 2026-09-24 "이해를 돕는 「학교 수업진도 따라가기」 구현이 시급")
   학습 탭 첫 카드. 과목마다 지금까지의 회차(주차×요일)를 점으로 늘어놓고 「여기까지 · 밀림 · 다음 수업」을 보여 준다.
   회차 ↔ 학습 덱 파트는 knowledge/decks.json partList.dates(표지의 날짜)로 잇는다 — 문제 덱 우선, 없으면 임시 덱.
   회차 상태: 따라감(파트 90%↑) · 진행 중 · 오늘 수업 · 밀림(덱은 있는데 손 안 댐) · 정리만 있음(덱 없음 → 회차 정리) · 정리 대기(자료 없음, 아톰이 정리하면 열림).
   「따라가기」 = 그 회차 파트의 표지(#at=pN-cover)에서 시작: 개념 → 암기 vs 이해 → 기초 → 응용 (지침 §11-6 학습 루틴).
   회차 제목·정리 유무는 knowledge/sessions.json(docs/tools/session_index.py, 강의 내용만). 못 읽으면 앱 기록(진도·회차 정리)만으로.
   오늘 탭 브리핑 첫 줄에 「밀린 회차 n개 · 가장 오래된 것」.
   ============================================================ */
(function(){
  if(window.V50) return;
  var V50=window.V50={S:null,err:null,loading:null,open:{}};
  try{ V50.open=JSON.parse(localStorage.getItem("mc-v50-open")||"{}"); }catch(e){}
  V50.load=function(){
    if(V50.loading) return V50.loading;
    var j=function(u){ return fetch(u,{cache:"no-store"}).then(function(r){ if(!r.ok) throw new Error(u+" "+r.status); return r.json(); }); };
    var pend=[j("knowledge/sessions.json").catch(function(e){ V50.err=String(e&&e.message||e); return null; })];
    if(window.V49&&V49.load) pend.push(V49.load());
    if(window.V47&&V47.load) pend.push(V47.load());
    V50.loading=Promise.all(pend).then(function(a){ V50.S=a[0]; return true; });
    return V50.loading;
  };
  V50.md=function(d){ return (+d.slice(5,7))+"/"+(+d.slice(8,10))+"("+DAY[D(d).getDay()]+")"; };
  V50.deckSt=function(id){ try{ return JSON.parse(localStorage.getItem("mc-slides-"+id)||"null")||{}; }catch(e){ return {}; } };
  V50.quizSt=function(id){ try{ return JSON.parse(localStorage.getItem("mc-slides-"+id+"-quiz")||"null")||{}; }catch(e){ return {}; } };
  /* 회차 ↔ 덱 파트. 파트 완료 = 개념·암기 장 전부 읽음(건너뜀 제외) + 문제 90% 이상 풀고 60% 이상 정답(「문제만」 정답도 인정) — 오타 v52 RED 3 반영 */
  V50.partsFor=function(c,date){
    var decks=((window.V49&&V49.D&&V49.D.decks)||[]).filter(function(d){ return d.course===c.name&&Array.isArray(d.partList); });
    var pick=function(kind){
      var out=[];
      decks.filter(function(d){ return d.kind===kind; }).forEach(function(d){
        var st=V50.deckSt(d.id), qz=V50.quizSt(d.id), skip=st.skip||{}, dn=st.done||{}, co=st.correct||{}, qco=qz.correct||{};
        (d.partList||[]).forEach(function(p){
          if((p.dates||[]).indexOf(date)<0) return;
          var sids=p.sids||[], qids=p.qids||[], cids=sids.filter(function(s){ return qids.indexOf(s)<0; });
          var cDone=cids.filter(function(s){ return dn[s]&&!skip[s]; }).length;
          var qDone=qids.filter(function(q){ return (dn[q]&&!skip[q])||qco[q]===true||qco[q]===false; }).length;
          var qOk=qids.filter(function(q){ return co[q]===true||qco[q]===true; }).length;
          var complete=(cids.length?cDone===cids.length:true)&&(qids.length?(qDone>=Math.ceil(qids.length*.9)&&qOk>=Math.ceil(qids.length*.6)):true);
          var tot=cids.length+qids.length, done=cDone+qDone;
          out.push({deck:d,p:p,done:done,n:tot,cDone:cDone,cN:cids.length,qOk:qOk,qDone:qDone,qN:qids.length,ratio:tot?done/tot:0,complete:complete,shared:(p.dates||[]).length>1});
        });
      });
      return out;
    };
    var ex=pick("exam"); return ex.length?ex:pick("temp");
  };
  V50.STN={done:"따라감",part:"진행 중",today:"오늘 수업",todo:"밀림",note:"정리만 있음",wait:"정리 대기",future:"예정"};
  V50.session=function(c,date,td,S){
    var s=sessionOn(c.id,date), hol=holidayOn(date), cancelled=!!(s&&s.cancelled);
    if(hol||cancelled) return null;
    var info=(S&&S[c.name]&&S[c.name][date])||null, parts=V50.partsFor(c,date);
    var w=weekOf(date)||1, dn=(window.V36&&V36.dayNote)?V36.dayNote(c,date):null;
    var title=(info&&info.title)||(s&&s.progress)||(dn&&(dn.range||dn.summary))||(parts.length?"덱 · "+(parts[0].p.title||""):"");
    if(/^(결석|지각)/.test(title)&&parts.length) title="덱 · "+(parts[0].p.title||"")+" ("+title+")";
    var absent=!!(s&&s.status&&window.ABSENT&&ABSENT[s.status]);
    var ratio=parts.length?parts.reduce(function(a,x){ return a+x.ratio; },0)/parts.length:0;
    var hasNote=!!((info&&info.has)||(dn&&window.V36&&V36.dayHas&&V36.dayHas(c,date)));
    var allDone=parts.length>0&&parts.every(function(x){ return x.complete; }), any=parts.some(function(x){ return x.done>0; });   /* 평균이 아니라 모든 파트가 기준 충족 */
    var st= parts.length? (allDone?"done":any?"part":(date===td?"today":"todo")) : (hasNote?"note":"wait");
    return {date:date,w:w,title:title,info:info,parts:parts,ratio:ratio,st:st,absent:absent,noNote:parts.length>0&&!hasNote};
  };
  V50.items=function(){
    var td=today(), S=(V50.S&&V50.S.courses)||{}, out=[];
    courses().filter(function(c){ return !isPersonal(c)&&!(window.noStudyType&&noStudyType(c)); }).forEach(function(c){
      var dates=(window.V32&&V32.meetings)?V32.meetings(c):planned(c).map(function(p){ return p.date; });
      var past=[], next=null;
      dates.forEach(function(d){
        if(d<=td){ var x=V50.session(c,d,td,S); if(x) past.push(x); }
        else if(!next&&!holidayOn(d)){ var s2=sessionOn(c.id,d); if(!(s2&&s2.cancelled)) next=d; }
      });
      var here=past.slice().reverse().filter(function(x){ return x.st!=="wait"; })[0]||null;
      var todo=past.filter(function(x){ return x.st==="todo"||x.st==="part"; });            /* 밀림 = 지난 회차만 */
      var todayL=past.filter(function(x){ return x.st==="today"; });                        /* 오늘 수업은 따로 센다 */
      var m=(window.V47&&V47.M&&V47.M[c.name])||null, nw=next?weekOf(next):null, nt=(m&&nw&&m.weeks&&m.weeks[String(nw)])?m.weeks[String(nw)]:null;
      out.push({c:c,past:past,next:next,nextTitle:nt?(nt.title||""):"",nextPlanned:!!(nt&&nt.planned),here:here,todo:todo,todayL:todayL,target:todo[0]||todayL[0]||null,
        done:past.filter(function(x){ return x.st==="done"; }).length,wait:past.filter(function(x){ return x.st==="wait"; }).length});
    });
    out.sort(function(a,b){ return (b.todo.length-a.todo.length)||a.c.name.localeCompare(b.c.name); });
    return out;
  };
  /* ---- 렌더 ---- */
  V50.btnFor=function(it,x){
    if(x.parts.length){ var tp=x.parts.filter(function(p){ return p.ratio<.9; })[0]||x.parts[0];
      return '<button class="btn xs a" data-v50open="'+esc(tp.deck.file)+'#at=p'+tp.p.n+'-cover" data-v50title="'+esc(tp.deck.title)+'">'+(x.st==="done"?"다시 보기":"따라가기")+'</button>'; }
    if(x.st==="note") return '<button class="btn xs" data-v50note="'+it.c.id+'|'+x.w+'|'+x.date+'">회차 정리</button>';
    return '';
  };
  V50.dot=function(x){ return '<i class="v50-dot st-'+x.st+(x.absent?' ab':'')+'" title="'+esc(V50.md(x.date)+" · "+(V50.STN[x.st]||"")+(x.absent?" · 결석":""))+'"></i>'; };
  V50.sessHTML=function(it,x){
    var prog=x.parts.length?x.parts.map(function(p){ return '<span class="v50-p'+(p.complete?' ok':p.done>0?' half':'')+'">'+esc("파트 "+p.p.n+(p.p.title?" · "+p.p.title:""))+(p.shared?' <small>('+esc(p.p.dates.map(function(d){ return (+d.slice(5,7))+"/"+(+d.slice(8,10)); }).join("·"))+' 공유)</small>':'')+' <small>개념 '+p.cDone+'/'+p.cN+(p.qN?' · 문제 '+p.qDone+'/'+p.qN+' 풀고 '+p.qOk+' 정답':'')+'</small></span>'; }).join(""):'';
    var chip= x.st==="done"?"ok" : x.st==="todo"?"crit" : (x.st==="part"||x.st==="today")?"warn" : "mut";
    return '<div class="v50-s st-'+x.st+'"><div class="v50-sh"><b>'+esc(V50.md(x.date))+'</b><span class="hint">'+x.w+'주차</span><span class="chip '+chip+'">'+esc(V50.STN[x.st])+'</span>'+(x.absent?'<span class="chip crit">결석</span>':'')+'<span class="v50-act">'+V50.btnFor(it,x)+'</span></div>'+
      (x.title?'<div class="v50-t">'+esc(x.title)+(x.noNote?' <span class="v44-mut">· 회차 정리 전 — 덱은 예상 진도</span>':'')+'</div>':(x.st==="wait"?'<div class="v50-t v44-mut">자료가 들어오면 아톰이 정리합니다</div>':''))+(prog?'<div class="v50-parts">'+prog+'</div>':'')+'</div>';
  };
  V50.rowHTML=function(it){
    var c=it.c, open=!!V50.open[c.id], n=it.past.length;
    var dots=it.past.map(V50.dot).join("")+(it.next?'<i class="v50-dot st-future" title="다음 '+esc(V50.md(it.next))+'"></i>':'');
    var anyDeck=it.past.some(function(x){ return x.parts.length; });
    var sum= it.todo.length? '<b class="v50-crit">밀림 '+it.todo.length+'</b>' : (!n?'<span class="v44-mut">회차 없음</span>': !anyDeck?'<span class="v44-mut">덱 없음 · 정리 '+it.past.filter(function(x){return x.st==="note";}).length+'회차</span>': it.done===n?'<b class="v50-ok">다 따라감</b>':'<span class="v50-ok">밀림 없음</span>');
    var here=it.here?'<div class="v50-line"><span class="v50-k">여기까지</span><span>'+esc(V50.md(it.here.date))+' · '+esc(it.here.title||"제목 없음")+'</span></div>':'';
    var tgt=it.target?'<div class="v50-line v50-tgt"><span class="v50-k">다음 따라갈 회차</span><span>'+esc(V50.md(it.target.date))+(it.target.title?' · '+esc(it.target.title):'')+'</span>'+V50.btnFor(it,it.target)+'</div>':'';
    var next=it.next?'<div class="v50-line"><span class="v50-k">다음 수업</span><span>'+esc(V50.md(it.next))+(it.nextTitle?' · '+esc(it.nextTitle)+(it.nextPlanned?' (예정)':''):'')+'</span></div>':'';
    return '<div class="v50-row" data-c="'+c.id+'"><div class="v50-h"><span class="crow-chip" style="background:'+(window.V44?V44.color(c):"#5B6B8C")+'">'+esc(window.V44?V44.abbr(c.name):c.name.slice(0,2))+'</span><b>'+esc(c.name)+'</b><button class="crow-more" data-v50tg="'+c.id+'" aria-label="'+(open?"접기":"펼치기")+'">'+(open?"−":"+")+'</button></div><div class="v50-strip"><span class="v50-dots">'+dots+'</span><span class="v50-sum">'+sum+(anyDeck?' · 따라감 '+it.done+'/'+n:'')+'</span></div>'+
      here+tgt+next+(open?'<div class="v50-list">'+it.past.slice().reverse().map(function(x){ return V50.sessHTML(it,x); }).join("")+'</div>':'')+'</div>';
  };
  V50.ensureCard=function(){
    var v=$("#v-study"); if(!v) return null; var c=$("#v50Card");
    if(!c){ c=document.createElement("div"); c.className="card v50"; c.id="v50Card";
      c.innerHTML='<div class="card-h"><h3>수업 따라가기</h3><span class="hs" id="v50Hs"></span><div class="ha"><span class="hint">회차마다 개념 → 암기·이해 → 문제 · 밀린 회차부터</span></div></div><div class="card-b tight" id="v50Body"></div>';
      var ref=$("#v49Card")||$("#v47Card"); if(!ref){ Array.prototype.some.call(v.children,function(el){ if(el.classList&&el.classList.contains("card")){ ref=el; return true; } }); }
      if(ref) v.insertBefore(c,ref); else v.appendChild(c); }
    return c;
  };
  V50.bind=function(body){
    $$("[data-v50open]",body).forEach(function(b){ b.onclick=function(){ openNote(b.dataset.v50open,b.dataset.v50title||"학습 덱"); }; });
    $$("[data-v50note]",body).forEach(function(b){ b.onclick=function(){ var q=b.dataset.v50note.split("|"); openStudy(q[0],+q[1],q[2]); }; });
    $$("[data-v50tg]",body).forEach(function(b){ b.onclick=function(){ V50.open[b.dataset.v50tg]=!V50.open[b.dataset.v50tg]; try{ localStorage.setItem("mc-v50-open",JSON.stringify(V50.open)); }catch(e){} V50.render(); }; });
  };
  V50.render=function(){
    var card=V50.ensureCard(); if(!card) return; var body=$("#v50Body"), hs=$("#v50Hs");
    var items=V50.items(), todo=items.reduce(function(a,it){ return a+it.todo.length; },0), tdN=items.reduce(function(a,it){ return a+it.todayL.length; },0), wait=items.reduce(function(a,it){ return a+it.wait; },0);
    if(hs) hs.textContent=(todo?"밀림 "+todo:"")+(tdN?(todo?" · ":"")+"오늘 "+tdN:"");
    var top=(V50.err?'<div class="v49-err">회차 목록(knowledge/sessions.json)을 못 읽었습니다: '+esc(V50.err)+' — 앱 기록만으로 표시합니다.</div>':'')+
      '<div class="v50-top">'+(todo?'<b>밀린 회차 '+todo+'개</b> — 가장 오래된 것부터 「따라가기」':'<b>밀린 회차 없음</b>')+(tdN?' · <b>오늘 수업 '+tdN+'회차</b>':'')+(wait?' · 정리 대기 '+wait+'회차(자료가 오면 아톰이 정리)':'')+'</div>';
    body.innerHTML=top+(items.length?items.map(V50.rowHTML).join(""):'<div class="v44-mut" style="padding:12px">과목이 없습니다.</div>');
    V50.bind(body);
  };
  V50.renderStudy=function(){ if(!V50.ensureCard()) return; V50.render(); V50.load().then(function(){ if(ui.view==="study") V50.render(); }); };
  var _renderStudy=renderStudy; renderStudy=function(){ _renderStudy(); try{ V50.renderStudy(); }catch(e){ if(window.console) console.warn("V50", e); } };
  var _closeNote=closeNote; closeNote=function(){ _closeNote(); if(ui.view==="study"){ try{ V50.render(); }catch(e){} } };
  /* ---- 오늘 탭 브리핑 첫 줄 ---- */
  V50.renderToday=function(){
    var steps=$("#brief .steps"); if(!steps) return; var old=$("#v50Step"); if(old) old.remove();
    var items=V50.items(), todo=[]; items.forEach(function(it){ it.todo.concat(it.todayL).forEach(function(x){ todo.push({it:it,x:x}); }); });
    todo.sort(function(a,b){ return a.x.date<b.x.date?-1:1; });
    var el=document.createElement("div"); el.className="step"; el.id="v50Step";
    el.innerHTML= todo.length? '<b>수업 따라가기</b> — 밀린 회차 '+todo.length+'개 · 가장 오래된 것 '+esc(todo[0].it.c.name)+' '+esc(V50.md(todo[0].x.date))+(todo[0].x.title?' · '+esc(todo[0].x.title.slice(0,36)):'')+' <button class="linkish" data-v50go="1">따라가기 →</button>' : '<b>수업 따라가기</b> — 밀린 회차 없음';
    steps.insertBefore(el,steps.firstChild);
    var b=el.querySelector("[data-v50go]"); if(b) b.onclick=function(){ go("study"); };
  };
  /* ---- 오늘 탭 카드: 과목별 다음 따라갈 회차(오래된 순, 최대 4) ---- */
  V50.renderTodayCard=function(){
    var v=$("#v-today"); if(!v) return; var items=V50.items(), rows=[];
    items.forEach(function(it){ if(it.target) rows.push({it:it,x:it.target}); });
    rows.sort(function(a,b){ return a.x.date<b.x.date?-1:1; });
    var todo=items.reduce(function(a,it){ return a+it.todo.length; },0), tdN=items.reduce(function(a,it){ return a+it.todayL.length; },0);
    var c=$("#v50Today");
    if(!c){ c=document.createElement("div"); c.className="card v50"; c.id="v50Today";
      var ref=$("#v43Today"); if(!ref){ var cards=$$("#v-today .card"); ref=cards.filter(function(el){ return /오늘 수업/.test((el.querySelector(".card-h h3")||{}).textContent||""); })[0]||null; }
      if(ref) v.insertBefore(c,ref); else v.appendChild(c); }
    c.innerHTML='<div class="card-h"><h3>수업 따라가기</h3><span class="hs">'+(todo?'밀림 '+todo:'')+(tdN?(todo?' · ':'')+'오늘 '+tdN:'')+'</span><div class="ha"><button class="btn xs" data-v50go="1">전체 →</button></div></div>'+
      '<div class="card-b tight">'+(rows.length?rows.slice(0,4).map(function(r){ return '<div class="v50-td"><span class="crow-chip" style="background:'+(window.V44?V44.color(r.it.c):"#5B6B8C")+'">'+esc(window.V44?V44.abbr(r.it.c.name):r.it.c.name.slice(0,2))+'</span><span class="v50-tdm"><b>'+esc(r.it.c.name)+'</b> <span class="hint">'+esc(V50.md(r.x.date))+(r.it.todo.length>1?' · 밀림 '+r.it.todo.length:'')+'</span><br><span class="v50-tdt">'+esc(r.x.title||"")+'</span></span><span class="v50-act">'+V50.btnFor(r.it,r.x)+'</span></div>'; }).join(""):'<div class="v44-mut" style="padding:10px 12px">밀린 회차가 없습니다 — 다음 수업 뒤에 다시 채워집니다.</div>')+'</div>';
    $$("[data-v50go]",c).forEach(function(b){ b.onclick=function(){ go("study"); }; });
    V50.bind(c);
  };
  var _renderToday=renderToday; renderToday=function(){ _renderToday(); try{ var f=function(){ V50.renderToday(); V50.renderTodayCard(); }; if(V50.S||V50.err) f(); else V50.load().then(function(){ if(ui.view==="today") f(); }); }catch(e){ if(window.console) console.warn("V50 today", e); } };
  var css=document.createElement("style"); css.id="v50css";
  css.textContent=[
    ".v50-top{font-size:13.5px;padding:9px 12px;border-radius:10px;background:var(--surface-2);margin-bottom:6px;line-height:1.5}",
    ".v50-row{padding:10px 0;border-top:1px solid var(--line)}.v50-row:first-of-type{border-top:0}",
    ".v50-h{display:flex;align-items:center;gap:8px}.v50-h>b{font-size:14.5px;flex:1 1 auto;min-width:0}.v50-h .crow-more{margin-left:auto}",
    ".v50-strip{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:6px}",
    ".v50-dots{display:inline-flex;gap:4px;align-items:center;flex-wrap:wrap}",
    ".v50-dot{display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--line-2);box-sizing:border-box}",
    ".v50-dot.st-done{background:var(--ok)}.v50-dot.st-part,.v50-dot.st-today{background:var(--warn)}.v50-dot.st-todo{background:var(--crit)}.v50-dot.st-note{background:var(--info)}",
    ".v50-dot.st-wait{background:transparent;border:1px dashed var(--line-2)}.v50-dot.st-future{background:transparent;border:1px solid var(--line-2)}.v50-dot.ab{box-shadow:0 0 0 2px var(--crit-soft)}",
    ".v50-sum{font-size:12.5px;color:var(--ink-2)}.v50-crit{color:var(--crit)}.v50-ok{color:var(--ok)}",
    ".v50-line{font-size:12.5px;color:var(--ink-2);margin-top:5px;line-height:1.5;display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center}.v50-line.v50-tgt{color:var(--ink)}",
    ".v50-k{font-size:11px;font-weight:600;color:var(--ink-3);border:1px solid var(--line);border-radius:6px;padding:0 5px;white-space:nowrap}",
    ".v50-list{display:flex;flex-direction:column;gap:6px;margin-top:8px}",
    ".v50-s{padding:8px 10px;border:1px solid var(--line);border-radius:10px}.v50-s.st-todo{border-color:color-mix(in srgb,var(--crit) 40%,var(--line))}.v50-s.st-done{opacity:.72}",
    ".v50-sh{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.v50-act{margin-left:auto}",
    ".v50-t{font-size:13px;margin-top:3px;line-height:1.45}",
    ".v50-parts{display:flex;flex-direction:column;gap:2px;margin-top:4px;font-size:12px;color:var(--ink-2)}.v50-p.ok{color:var(--ok)}.v50-p.half{color:var(--warn)}",
    ".v50-td{display:flex;align-items:center;gap:10px;padding:9px 12px;border-top:1px solid var(--line)}.v50-td:first-child{border-top:0}.v50-tdm{flex:1 1 auto;min-width:0;font-size:13px;line-height:1.4}.v50-tdt{color:var(--ink-2);font-size:12.5px}",
    "@media(max-width:480px){.v50-act{margin-left:0;width:100%}.v50-act .btn{width:100%}.v50-td{flex-wrap:wrap}.v50-td .v50-act{width:auto;margin-left:auto}.v50-td .v50-act .btn{width:auto}}"
  ].join("\n");
  document.head.appendChild(css);
})();
