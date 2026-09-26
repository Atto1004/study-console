/* ============================================================
   V55 LAYER — 과목 화면 개편: 「학습 경로」 (대표님 2026-09-27 "학습앱 메인 과목화면도 개편해줘", 지침 §23 듀오링고 톤 · 경로형 진도 · 캐릭터 반응)
   ① 히어로 카드: 과목 · 교수 · 요일 · 따라감/밀림/이 과목 XP/시험 D-day · 진행 막대 · [교실 열기 · 날짜] [교재] + 김주영 스앵님 말풍선. 기존 #cHead(V37 한 줄)는 숨기고 「세부정보」 버튼만 옮겨 온다.
   ② 학습 경로: 회차마다 동그란 마디(따라감 ✓ · 진행 중 고리 · 밀림 · 오늘 · 이어짐 · 정리만 · 정리 대기 · 예정 잠김) + 시험 ★ 마디를 주차 머리말(map.json 제목) 아래 지그재그로. 다음에 할 마디 옆에 스앵님. 마디 = 교실(V53→V38.deckFor) / 회차 정리(V36.daySheet) / 시험 범위 펼치기.
   ③ 기존 회차 표(V37 카드)는 「회차 표」 접기(기본 접힘, localStorage mc-v55-table)로 남긴다 — 출결·과제·정리·기록 기능은 그대로.
   판정은 V50.session(수업 따라가기와 같은 기준), 진행률은 mc-lesson-<id>(교실·수업 노트와 같은 키), XP 는 mc-tutor. 캐릭터는 notes/classroom/_assets/tutor.svg(원본 docs/tools/tutor.svg) 를 fetch 해 인라인.
   ============================================================ */
(function(){
  if(window.V55) return;
  var V55=window.V55={svg:null,loading:null,scope:{}};
  var DN=["일","월","화","수","목","금","토"];
  var md=function(date){ var d=D(date); return (d.getMonth()+1)+"/"+d.getDate()+"("+DN[d.getDay()]+")"; };
  var todayS=function(){ return today(); };
  V55.tutor=function(){
    if(V55.svg!==null) return Promise.resolve(V55.svg);
    if(V55.loading) return V55.loading;
    V55.loading=fetch("notes/classroom/_assets/tutor.svg",{cache:"force-cache"}).then(function(r){ return r.ok?r.text():""; }).then(function(t){ V55.svg=String(t).replace(/<!--[\s\S]*?-->/g,"").replace(/<\?xml[^>]*>/,""); return V55.svg; }).catch(function(){ V55.svg=""; return ""; });
    return V55.loading;
  };
  V55.T=function(){ try{ return JSON.parse(localStorage.getItem("mc-tutor")||"null")||{}; }catch(e){ return {}; } };
  V55.xpOf=function(c){ var L=(V55.T().lessons)||{}, sum=0; var m=window.V52&&V52.L&&V52.L.courses&&V52.L.courses[c.name]; if(m) Object.keys(m).forEach(function(d){ var id=m[d].id; if(L[id]&&L[id].xp>0) sum+=L[id].xp; }); return sum; };
  V55.prog=function(c,date){ var l=(window.V52&&V52.lesson)?V52.lesson(c,date):null; if(!l) return null; var st=V52.st(l.id), sids=l.sids||[], qids=l.qids||[];
    return {l:l,n:sids.length,rd:sids.filter(function(s){ return st.read&&st.read[s]; }).length,qn:qids.length,qd:qids.filter(function(q){ return st.done&&st.done[q]; }).length,ok:qids.filter(function(q){ return st.correct&&st.correct[q]===true; }).length}; };
  /* ---------- 마디 목록 ---------- */
  V55.nodes=function(c){
    var td=todayS(), S=(window.V50&&V50.S&&V50.S.courses)||{}, out=[];
    var dates=(window.V32&&V32.meetings)?V32.meetings(c):planned(c).map(function(p){ return p.date; });
    dates.forEach(function(d){ if(holidayOn(d)) return; var s=sessionOn(c.id,d); if(s&&s.cancelled) return;
      if(d<=td){ var x=window.V50?V50.session(c,d,td,S):null; if(x){ x.kind="sess"; out.push(x); } }
      else out.push({kind:"sess",date:d,w:weekOf(d)||1,st:"future",title:"",absent:false,parts:[]}); });
    (exams(c.id)||[]).forEach(function(ex){ if(!ex||!ex.date) return; out.push({kind:"exam",date:ex.date,w:weekOf(ex.date)||0,ex:ex,st:ex.date<td?"exam-past":"exam"}); });
    out.sort(function(a,b){ return a.date<b.date?-1:a.date>b.date?1:(a.kind==="exam"?1:-1); });
    return out;
  };
  V55.current=function(nodes){ return nodes.filter(function(x){ return x.kind==="sess"&&(x.st==="todo"||x.st==="part"||x.st==="today"); })[0]||nodes.filter(function(x){ return x.kind==="sess"&&x.st==="future"; })[0]||null; };
  V55.STN={done:"따라감",part:"진행 중",today:"오늘 수업",todo:"밀림",cont:"이어짐",note:"정리만 있음",wait:"정리 대기",future:"예정",exam:"시험",'exam-past':"시험 끝"};
  V55.icon=function(k){ var P={check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',play:'<path d="M8.5 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',lock:'<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',wait:'<path d="M7 3.5h10M7 20.5h10M8 3.5c0 5 8 5 8 8.5s-8 3.5-8 8.5M16 3.5c0 5-8 5-8 8.5s8 3.5 8 8.5"/>',star:'<path d="M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.2 6.6 20.1l1-6.1L3.2 9.7l6.1-.9z" fill="currentColor"/>',note:'<path d="M5 4.5h14v15H5z"/><path d="M8 9h8M8 12.5h8M8 16h5"/>',cont:'<path d="M5 12h14M13 6l6 6-6 6"/>',today:'<circle cx="12" cy="12" r="8.6"/><path d="M12 7.3V12l3.1 2"/>'};
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(P[k]||P.play)+'</svg>'; };
  V55.weekTitle=function(c,w){ var m=window.V47&&V47.M&&V47.M[c.name]; var wk=m&&m.weeks&&m.weeks[String(w)]; return wk&&wk.title?String(wk.title):""; };
  V55.nodeHTML=function(c,x,i,cur){
    var dx=[0,64,0,-64][i%4];
    if(x.kind==="exam"){ var ex=x.ex, dd=diffDays(todayS(),ex.date), kind=String(ex.kind||"시험"); if(/^(중간|기말)$/.test(kind)) kind+="고사";
      return '<div class="v55-node ex" style="--dx:'+dx+'px"><button type="button" class="v55-btn exam'+(x.st==="exam-past"?" past":"")+'" data-v55exam="'+esc(ex.id)+'" title="'+esc(kind+" · "+md(ex.date))+'">'+V55.icon("star")+'</button>'+
        '<div class="v55-lbl"><b>'+esc(kind)+'</b>'+esc(md(ex.date))+(dd>=0?' · <em>D-'+dd+'</em>':'')+'</div>'+(V55.scope[ex.id]?V55.scopeHTML(ex):'')+'</div>'; }
    var p=V55.prog(c,x.date), st=x.st, ico= st==="done"?"check": st==="future"?"lock": st==="wait"?"wait": st==="note"?"note": st==="cont"?"cont": st==="today"?"today":"play";
    var sty='--dx:'+dx+'px'; if(st==="part"&&p&&p.n) sty+=';--p:'+Math.max(6,Math.round(p.rd/p.n*100));
    var score=(p&&p.qd>0&&(st==="done"||st==="part"))?'<span class="v55-sc">'+p.ok+'/'+p.qn+'</span>':'';
    var t=st==="future"?"":String(x.title||""); if(t.length>46) t=t.slice(0,46)+"…";
    var side=dx>0?"l":"r";
    return '<div class="v55-node st-'+st+(cur?" cur":"")+'" style="'+sty+'">'+(cur&&st!=="future"?'<span class="v55-start">'+(st==="part"?"이어서":"시작")+'</span>':'')+
      '<button type="button" class="v55-btn '+st+'" data-v55go="'+esc(x.date)+'" data-v55w="'+x.w+'" title="'+esc(md(x.date)+" · "+(V55.STN[st]||st))+'"'+(st==="future"?' disabled':'')+'>'+V55.icon(ico)+(x.absent?'<span class="v55-ab">결석</span>':'')+score+'</button>'+
      '<div class="v55-lbl"><b>'+esc(md(x.date))+' <small class="s-'+st+'">'+esc(V55.STN[st]||"")+'</small></b>'+(t?'<span>'+esc(t)+'</span>':'')+'</div>'+
      (cur?'<div class="v55-tutor '+side+'" data-face="'+(st==="future"?"neutral":"sharp")+'"></div>':'')+'</div>';
  };
  V55.scopeHTML=function(ex){ return '<div class="v55-scope"><b>'+esc(ex.kind||"시험")+' 범위'+(ex.weight?' · '+ex.weight+'%':'')+(ex.time?' · '+esc(ex.time):'')+'</b><div>'+esc(ex.scope||"범위 미입력 — 편집에서 채우세요")+'</div>'+(ex.assumed?'<div class="hint">날짜는 학사 일정 기준 추정</div>':'')+'</div>'; };
  V55.line=function(c,cur,todo,done,judged){
    if(todo>0) return "밀린 회차 "+todo+"개. 오늘 하나는 끝냅니다. 핑계는 안 받습니다.";
    if(cur&&cur.st==="today") return "오늘 수업분입니다. 잊기 전에 지금 여세요.";
    if(judged>0&&done===judged) return "여기까지 따라왔군요. 이 속도로. 시험 범위는 제가 챙깁니다.";
    return "자료가 들어오면 제가 정리해 둡니다. 그 전엔 교재부터.";
  };
  /* ---------- 히어로 ---------- */
  V55.heroHTML=function(c,nodes){
    var past=nodes.filter(function(x){ return x.kind==="sess"&&x.st!=="future"; }), done=past.filter(function(x){ return x.st==="done"; }).length, todo=past.filter(function(x){ return x.st==="todo"||x.st==="part"; }).length, judged=past.filter(function(x){ return x.st!=="wait"&&x.st!=="note"; }).length;
    var cur=V55.current(nodes), td=todayS(), ex=(exams(c.id)||[]).filter(function(e){ return e&&e.date>=td; }).sort(function(a,b){ return a.date<b.date?-1:1; })[0], dd=ex?diffDays(td,ex.date):null;
    var a=attStats(c), xp=V55.xpOf(c);
    var days=c.slots.map(function(s){ return s.d; }).filter(function(d,i,arr){ return arr.indexOf(d)===i; }).sort(function(x,y){ return x-y; }).map(function(d){ return DN[d]; }).join("/");
    var deck=(cur&&cur.kind==="sess"&&cur.st!=="future"&&window.V38&&V38.deckFor)?V38.deckFor(c,cur.w,cur.date):null;
    var lesson=(cur&&window.V52&&V52.lesson)?V52.lesson(c,cur.date):null;
    var next=nodes.filter(function(x){ return x.kind==="sess"&&x.st==="future"; })[0];
    var cta= deck? '<button type="button" class="btn a v55-cta" data-v55open="'+esc(deck.url)+'" data-v55title="'+esc(deck.title||"")+'">'+(cur.st==="part"?"이어서 학습하기":"교실 열기")+' · '+esc(md(cur.date))+'</button>'+(lesson&&lesson.file?'<button type="button" class="btn v55-book" data-v55open="'+esc(lesson.file)+'#resume" data-v55title="'+esc(lesson.title||"")+'">교재</button>':'')
      : (cur&&cur.st==="note"? '<button type="button" class="btn a v55-cta" data-v55note="'+esc(cur.date)+'">회차 정리 보기 · '+esc(md(cur.date))+'</button>' : next? '<span class="chip mut">다음 수업 '+esc(md(next.date))+'</span>':'');
    var pct=judged?Math.round(done/judged*100):0;
    return '<div class="v55-hero t-'+esc(c.typeA||"NONE")+'"><div class="v55-hl">'+
      '<div class="v55-title"><h1>'+(c.isRetake?'<span class="v55-re">(재)</span>':'')+esc(c.name)+' <small>'+c.credits+'학점</small></h1><div class="v55-meta">'+(c.prof?'<span class="chip mut">'+esc(c.prof)+' 교수님</span>':'')+(days?'<span class="chip acc">'+esc(days)+'</span>':'')+
        '<span class="chip mut">출석 '+(a.n.present||0)+' · 지각 '+(a.lateN||0)+' · 결석 '+(a.n.absent||0)+'</span>'+(c.status==="pending"?'<span class="chip warn">증원 대기</span>':'')+'</div></div>'+
      '<div class="v55-stats"><div><b class="v55-ok">'+done+'<small>/'+judged+'</small></b><span>따라감</span></div><div><b class="'+(todo?"v55-crit":"")+'">'+todo+'</b><span>밀림</span></div><div><b class="v55-xp">'+xp+'</b><span>이 과목 XP</span></div>'+(ex?'<div><b class="'+(dd!=null&&dd<=14?"v55-crit":"")+'">D-'+dd+'</b><span>'+esc(ex.kind||"시험")+' '+esc(md(ex.date))+'</span></div>':'')+'</div>'+
      '<div class="v55-bar" title="따라감 '+done+'/'+judged+'"><i style="width:'+pct+'%"></i></div>'+
      '<div class="v55-act">'+cta+'<span class="v55-actsp"></span></div></div>'+
      '<div class="v55-hr"><div class="v55-bubble">'+esc(V55.line(c,cur,todo,done,judged))+'</div><div class="v55-tutor big" data-face="'+(todo?"sharp":(judged&&done===judged)?"proud":"neutral")+'"></div></div></div>';
  };
  /* ---------- 경로 ---------- */
  V55.pathHTML=function(c,nodes){
    var cur=V55.current(nodes), h='', lastW=null, i=0;
    nodes.forEach(function(x){ if(x.kind==="sess"&&x.w!==lastW){ lastW=x.w; var t=V55.weekTitle(c,x.w); h+='<div class="v55-wk"><span>'+x.w+'주차'+(t?' · '+esc(t.length>60?t.slice(0,60)+"…":t):'')+'</span></div>'; }
      h+=V55.nodeHTML(c,x,i++,x===cur); });
    return '<div class="v55-path">'+(h||'<div class="hint">회차가 없습니다</div>')+'</div>';
  };
  V55.render=function(){
    var v=$("#v-course"), c=course(ui.course); if(!v||!c||isPersonal(c)) return;
    var nodes=V55.nodes(c);
    var hero=$("#v55Hero",v); if(!hero){ hero=document.createElement("div"); hero.id="v55Hero"; hero.className="card v55-herocard"; var head=$("#cHead",v); (head||v).insertAdjacentElement(head?"beforebegin":"afterbegin",hero); }
    hero.innerHTML=V55.heroHTML(c,nodes);
    var head=$("#cHead",v); if(head) head.classList.add("v55-hide");
    /* 세부정보 토글은 히어로 안에 내 버튼으로(V37 의 버튼은 숨긴 #cHead 안에 남는다) */
    var act=$(".v55-act",hero); if(act&&!$("#v55Detail",act)){ var db=document.createElement("button"); db.type="button"; db.className="btn v55-detailbtn"; db.id="v55Detail"; db.textContent=ui.v37Detail?"세부정보 닫기":"세부정보"; db.onclick=function(){ ui.v37Detail=!ui.v37Detail; if(window.V37&&V37.detail) V37.detail(c); db.textContent=ui.v37Detail?"세부정보 닫기":"세부정보"; }; act.appendChild(db); }
    var path=$("#v55Path",v); if(!path){ path=document.createElement("div"); path.id="v55Path"; path.className="card"; path.innerHTML='<div class="card-h"><h3>학습 경로</h3><span class="hs" id="v55PathHs"></span><div class="ha"><span class="hint">마디를 누르면 그 회차 교실</span></div></div><div class="card-b" id="v55PathB"></div>'; hero.insertAdjacentElement("afterend",path); }
    $("#v55PathB",path).innerHTML=V55.pathHTML(c,nodes);
    var n=nodes.filter(function(x){ return x.kind==="sess"; }).length, dn=nodes.filter(function(x){ return x.st==="done"; }).length; $("#v55PathHs",path).textContent="회차 "+n+" · 따라감 "+dn;
    /* 회차 표 접기 */
    var notes=$("#cNotes",v), card=notes&&notes.closest(".card"); if(card&&!card._v55){ card._v55=true; card.classList.add("v55-table"); var ha=card.querySelector(".card-h .ha")||card.querySelector(".card-h"); var b=document.createElement("button"); b.type="button"; b.className="btn xs"; b.id="v55TableTg"; ha.insertBefore(b,ha.firstChild);
      var apply=function(){ var open=localStorage.getItem("mc-v55-table")==="1"; card.classList.toggle("v55-fold",!open); b.textContent=open?"접기":"회차 표 펼치기"; }; b.onclick=function(){ try{ localStorage.setItem("mc-v55-table",card.classList.contains("v55-fold")?"1":"0"); }catch(e){} apply(); }; apply(); }
    V55.bind(c,v);
    V55.tutor().then(function(svg){ if(!svg) return; $$(".v55-tutor",v).forEach(function(el){ if(el.querySelector("svg")) return; el.innerHTML=svg; var s=el.querySelector("svg"); if(s){ s.setAttribute("data-face",el.getAttribute("data-face")||"neutral"); s.removeAttribute("id"); } }); });
    if(window.V50&&!V50.S&&!V50.err&&V50.load){ V50.load().then(function(){ if(ui.view==="course") V55.render(); }); }
    if(window.V47&&!V47.M&&!V47.err&&V47.load){ try{ V47.load().then(function(){ if(ui.view==="course") V55.render(); }); }catch(e){} }
  };
  V55.bind=function(c,v){
    $$("[data-v55open]",v).forEach(function(b){ b.onclick=function(){ openNote(b.dataset.v55open,b.dataset.v55title||c.name); }; });
    $$("[data-v55note]",v).forEach(function(b){ b.onclick=function(){ if(window.V36&&V36.daySheet) V36.daySheet(c.id,b.dataset.v55note); else openStudy(c.id,weekOf(b.dataset.v55note)); }; });
    $$("[data-v55go]",v).forEach(function(b){ b.onclick=function(){ var date=b.dataset.v55go, w=+b.dataset.v55w||weekOf(date);
      var deck=(window.V38&&V38.deckFor)?V38.deckFor(c,w,date):null;
      if(deck){ openNote(deck.url,deck.title||c.name); return; }
      if(window.V36&&V36.daySheet&&V36.dayHas&&V36.dayHas(c,date)){ V36.daySheet(c.id,date); return; }
      if(b.classList.contains("wait")){ toast("자료가 들어오면 아톰이 정리합니다 — 그때 마디가 열립니다"); return; }
      openStudy(c.id,w,date); }; });
    $$("[data-v55exam]",v).forEach(function(b){ b.onclick=function(){ var id=b.dataset.v55exam; V55.scope[id]=!V55.scope[id]; V55.render(); }; });
  };
  /* 회차 표(V37)가 현재 주차를 scrollIntoView 하면서 페이지가 경로 아래로 확 내려가던 것 → 그리기 전 위치로 되돌린다(go() 는 먼저 맨 위로 보내므로 화면 진입은 맨 위, 다시 그릴 때는 제자리) */
  var _rc=renderCourse;
  renderCourse=function(){ var y=window.scrollY||0; _rc(); try{ V55.render(); }catch(e){ if(window.console) console.warn("V55",e); } try{ if(Math.abs((window.scrollY||0)-y)>2) window.scrollTo(0,y); }catch(e2){} };
  var css=document.createElement("style"); css.id="v55css";
  css.textContent=[
    "#v-course .v55-hide{display:none!important}",
    ".v55-herocard{overflow:visible}.v55-hero{display:flex;gap:18px;padding:18px 20px 16px;align-items:stretch}",
    ".v55-hl{flex:1 1 320px;min-width:0;display:flex;flex-direction:column;gap:10px}",
    ".v55-title h1{margin:0;font-size:clamp(22px,2.6vw,28px);line-height:1.2;letter-spacing:-.02em}.v55-title h1 small{font-size:.6em;font-weight:700;color:var(--ink-3);margin-left:4px}.v55-re{color:var(--crit);font-size:.85em;margin-right:2px}",
    ".v55-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}",
    ".v55-stats{display:flex;gap:6px;flex-wrap:wrap}.v55-stats>div{flex:1 1 90px;min-width:0;border:2px solid var(--line);border-radius:14px;padding:8px 10px;background:var(--surface-2,#F0F0F0)}",
    ".v55-stats b{display:block;font-size:24px;line-height:1.1;font-weight:900;letter-spacing:-.02em}.v55-stats b small{font-size:13px;color:var(--ink-3);font-weight:800}.v55-stats span{font-size:11.5px;font-weight:700;color:var(--ink-3)}",
    ".v55-ok{color:var(--ok)}.v55-crit{color:var(--crit)}.v55-xp{color:#B26A00}",
    ".v55-bar{height:14px;border-radius:99px;background:var(--surface-3,#E5E5E5);overflow:hidden}.v55-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#7ED957,#58CC02);transition:width .4s}",
    ".v55-act{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.v55-actsp{flex:1}.v55-cta{font-size:14px;padding:9px 16px}.v55-detailbtn{margin-left:auto}",
    ".v55-hr{flex:0 0 200px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:6px;min-width:0}",
    ".v55-bubble{position:relative;background:var(--surface);border:2px solid var(--line);border-radius:14px;padding:9px 12px;font-size:13px;font-weight:700;line-height:1.45;width:100%;text-align:center}",
    ".v55-bubble::after{content:\"\";position:absolute;left:50%;bottom:-9px;margin-left:-6px;border:6px solid transparent;border-top-color:var(--line);border-bottom:0}",
    ".v55-tutor{width:120px;height:140px;filter:drop-shadow(0 6px 8px rgba(0,0,0,.14))}.v55-tutor svg{width:100%;height:100%;display:block;overflow:visible}.v55-tutor.big{width:150px;height:176px}",
    /* 경로 */
    ".v55-path{position:relative;padding:6px 0 10px;overflow:hidden}",
    ".v55-wk{display:flex;align-items:center;gap:10px;margin:14px 0 14px;font-weight:800;font-size:12.5px;color:var(--ink-3);letter-spacing:.01em}.v55-wk::before,.v55-wk::after{content:\"\";flex:1;height:2px;background:var(--line);border-radius:2px}.v55-wk span{max-width:70%;text-align:center}",
    ".v55-node{position:relative;display:flex;flex-direction:column;align-items:center;width:230px;margin:0 auto 16px;transform:translateX(var(--dx,0))}",
    ".v55-btn{position:relative;width:74px;height:74px;border-radius:50%;border:3px solid var(--line);background:var(--surface);color:var(--ink-3);cursor:pointer;display:grid;place-items:center;box-shadow:0 6px 0 var(--line);transition:transform .08s;padding:0}",
    ".v55-btn svg{width:32px;height:32px}.v55-btn:active:not([disabled]){transform:translateY(3px);box-shadow:0 3px 0 var(--line)}.v55-btn[disabled]{cursor:default}",
    ".v55-btn.done{background:#58CC02;border-color:#58CC02;box-shadow:0 6px 0 #46A302;color:#fff}",
    ".v55-btn.todo{border-color:#FF4B4B;color:#FF4B4B;box-shadow:0 6px 0 #FFB3B3}",
    ".v55-btn.today{border-color:#1CB0F6;color:#1CB0F6;box-shadow:0 6px 0 #A6E1FA}",
    ".v55-btn.part{border-color:transparent;background:conic-gradient(#58CC02 calc(var(--p,10)*1%),var(--line) 0);color:#46A302;box-shadow:0 6px 0 #B9E58D}.v55-btn.part::before{content:\"\";position:absolute;inset:6px;border-radius:50%;background:var(--surface)}.v55-btn.part svg{position:relative}",
    ".v55-btn.cont{border-color:#B9E58D;color:#46A302}.v55-btn.note{border-color:var(--line-2);color:var(--ink-2)}.v55-btn.wait{border-style:dashed;color:var(--ink-3);background:var(--surface-2,#F0F0F0)}",
    ".v55-btn.future{background:var(--surface-2,#F0F0F0);border-color:var(--line);color:var(--ink-3);box-shadow:0 4px 0 var(--line)}",
    ".v55-btn.exam{background:#FFC800;border-color:#FFC800;color:#5A4200;box-shadow:0 6px 0 #E5A800;width:82px;height:82px}.v55-btn.exam svg{width:38px;height:38px}.v55-btn.exam.past{background:#F1E3A8;border-color:#F1E3A8;box-shadow:0 6px 0 #D9C67A}",
    ".v55-node.cur .v55-btn{width:84px;height:84px;background:#1CB0F6;border-color:#1CB0F6;color:#fff;box-shadow:0 6px 0 #1899D6;animation:v55pulse 1.8s ease-out infinite}.v55-node.cur .v55-btn.part{background:conic-gradient(#fff calc(var(--p,10)*1%),rgba(255,255,255,.35) 0)}.v55-node.cur .v55-btn.part::before{background:#1CB0F6}",
    ".v55-node.cur .v55-btn.future{background:var(--surface-2,#F0F0F0);border-color:var(--line);color:var(--ink-3);box-shadow:0 4px 0 var(--line);animation:none;width:74px;height:74px}",
    "@keyframes v55pulse{0%{outline:0 solid rgba(28,176,246,.45);outline-offset:0}70%{outline:12px solid rgba(28,176,246,0);outline-offset:8px}100%{outline:0 solid rgba(28,176,246,0)}}",
    ".v55-start{position:absolute;top:-30px;left:50%;transform:translateX(-50%);background:var(--surface);border:2px solid #1CB0F6;color:#1CB0F6;border-radius:10px;padding:3px 10px;font-size:12px;font-weight:900;white-space:nowrap;animation:v55bob 1.2s ease-in-out infinite;z-index:2}",
    ".v55-start::after{content:\"\";position:absolute;left:50%;bottom:-7px;margin-left:-5px;border:5px solid transparent;border-top-color:#1CB0F6;border-bottom:0}",
    "@keyframes v55bob{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,-4px)}}",
    ".v55-ab{position:absolute;right:-8px;top:-6px;background:#FF4B4B;color:#fff;font-size:10px;font-weight:900;border-radius:99px;padding:2px 6px;border:2px solid var(--surface)}",
    ".v55-sc{position:absolute;left:50%;bottom:-10px;transform:translateX(-50%);background:var(--surface);border:2px solid #58CC02;color:#46A302;font-size:10.5px;font-weight:900;border-radius:99px;padding:0 6px;line-height:16px;white-space:nowrap}",
    ".v55-lbl{margin-top:10px;text-align:center;font-size:12.5px;line-height:1.35;max-width:220px;color:var(--ink-2)}.v55-lbl b{display:block;font-size:13px;color:var(--ink)}.v55-lbl b small{font-weight:800;color:var(--ink-3);margin-left:4px}.v55-lbl em{font-style:normal;color:var(--crit);font-weight:800}",
    ".v55-lbl small.s-done{color:var(--ok)}.v55-lbl small.s-todo,.v55-lbl small.s-part{color:var(--crit)}.v55-lbl small.s-today{color:#1CB0F6}",
    ".v55-node.cur{margin-top:44px}.v55-node .v55-tutor{position:absolute;top:-30px;width:110px;height:128px;pointer-events:none}.v55-node .v55-tutor.r{left:calc(50% + 58px)}.v55-node .v55-tutor.l{right:calc(50% + 58px)}",
    ".v55-scope{margin-top:10px;background:var(--surface);border:2px solid #F1E3A8;border-radius:14px;padding:10px 12px;font-size:13px;line-height:1.5;max-width:520px;text-align:left}.v55-scope b{display:block;margin-bottom:4px}",
    /* 회차 표 접기 */
    ".v55-table.v55-fold .card-b{display:none}",
    "@media(max-width:640px){.v55-hero{flex-direction:column;padding:14px 14px 12px;gap:12px}.v55-hr{flex:0 0 auto;flex-direction:row;align-items:flex-end;gap:8px}.v55-bubble{flex:1}.v55-bubble::after{left:auto;right:-9px;bottom:14px;margin:0;border:6px solid transparent;border-left-color:var(--line);border-right:0}.v55-tutor.big{width:96px;height:112px;flex:0 0 96px}",
    ".v55-node{width:190px;transform:translateX(calc(var(--dx,0) * .55))}.v55-node .v55-tutor{width:84px;height:98px;top:-28px}.v55-node .v55-tutor.r{left:calc(50% + 48px)}.v55-node .v55-tutor.l{right:calc(50% + 48px)}.v55-lbl{max-width:180px;font-size:12px}.v55-stats b{font-size:20px}}"
  ].join("\n"); document.head.appendChild(css);
})();
