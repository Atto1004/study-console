/* ============================================================
   V52 LAYER — 수업 노트(회차 학습 페이지) 연결 (대표님 2026-09-26 결정: 개념은 스크롤 교재 · 문제는 카드 · 아톰 그림 · 판서 사진은 atom 안에서만 · 원리 먼저 15~20분)
   knowledge/lessons.json(docs/tools/build_lesson.py)에 회차마다 notes/lessons/<약칭>/<날짜>.html 이 등록된다.
   ① 수업 따라가기(V50): 그 회차에 수업 노트가 있으면 덱 파트 대신 노트로 판정·연결 — 완료 = 섹션 전부 읽음 + 문제 90% 풀고 60% 정답 (mc-lesson-<id>)
   ② 회차 표 [학습하기](V38.deckFor): 수업 노트가 있으면 그것을 연다(#resume = 안 읽은 섹션부터)
   ③ 과목 화면 노트 목록(NOTES)에 「수업 노트 · 날짜 · 제목」으로 등록
   ============================================================ */
(function(){
  if(window.V52) return;
  var V52=window.V52={L:null,err:null,loading:null};
  V52.load=function(){
    if(V52.loading) return V52.loading;
    V52.loading=fetch("knowledge/lessons.json",{cache:"no-store"}).then(function(r){ if(!r.ok) throw new Error("lessons.json "+r.status); return r.json(); })
      .then(function(d){ V52.L=d; V52.err=null; V52.registerNotes(); return d; }).catch(function(e){ V52.err=String(e&&e.message||e); V52.L=null; return null; });
    return V52.loading;
  };
  V52.lesson=function(c,date){ var L=V52.L&&V52.L.courses; return (c&&L&&L[c.name]&&L[c.name][date])||null; };
  V52.st=function(id){ try{ return JSON.parse(localStorage.getItem("mc-lesson-"+id)||"null")||{}; }catch(e){ return {}; } };
  /* 수업 노트를 V50 파트 모양으로 */
  V52.part=function(c,date){
    var l=V52.lesson(c,date); if(!l) return null;
    var st=V52.st(l.id), rd=st.read||{}, dn=st.done||{}, co=st.correct||{};
    var sids=l.sids||[], qids=l.qids||[];
    var cDone=sids.filter(function(s){ return rd[s]; }).length, qDone=qids.filter(function(q){ return dn[q]; }).length, qOk=qids.filter(function(q){ return co[q]===true; }).length;
    var complete=(sids.length?cDone===sids.length:true)&&(qids.length?(qDone>=Math.ceil(qids.length*.9)&&qOk>=Math.ceil(qids.length*.6)):true);
    var tot=sids.length+qids.length;
    return {lesson:l,deck:{id:l.id,file:l.file,title:l.title,kind:"lesson"},p:{n:1,title:l.title,dates:[date],sids:sids,qids:qids},
      done:cDone+qDone,n:tot,cDone:cDone,cN:sids.length,qOk:qOk,qDone:qDone,qN:qids.length,ratio:tot?(cDone+qDone)/tot:0,complete:complete,shared:false,judgeAt:date,judged:true,minutes:l.minutes||0};
  };
  /* ① V50.partsFor: 수업 노트가 있으면 그것만 */
  if(window.V50&&V50.partsFor&&!V50.partsFor._v52){
    var _pf=V50.partsFor;
    V50.partsFor=function(c,date){ var lp=V52.part(c,date); return lp?[lp]:_pf(c,date); };
    V50.partsFor._v52=true;
  }
  /* 「따라가기」 버튼: 수업 노트면 #resume + 읽는 시간 */
  if(window.V50&&V50.btnFor&&!V50.btnFor._v52){
    var _bf=V50.btnFor;
    V50.btnFor=function(it,x){
      var lp=(x.parts||[]).filter(function(p){ return p.lesson; })[0];
      if(lp) return '<button class="btn xs a" data-v50open="'+esc(lp.deck.file)+'#resume" data-v50title="'+esc(lp.lesson.title)+'">'+(x.st==="done"?"다시 보기":"따라가기")+'</button>'+(lp.minutes?'<span class="hint v52-min">약 '+lp.minutes+'분</span>':'');
      return _bf(it,x);
    };
    V50.btnFor._v52=true;
  }
  /* 회차 줄의 파트 표시: 수업 노트는 「섹션 n/m 읽음」 */
  if(window.V50&&V50.sessHTML&&!V50.sessHTML._v52){
    var _sh=V50.sessHTML;
    V50.sessHTML=function(it,x){ var h=_sh(it,x); var lp=(x.parts||[]).filter(function(p){ return p.lesson; })[0];
      if(lp){ h=h.replace(/<div class="v50-parts">[\s\S]*?<\/div>/, '<div class="v50-parts"><span class="v50-p'+(lp.complete?' ok':lp.done>0?' half':'')+'">수업 노트 <small>섹션 '+lp.cDone+'/'+lp.cN+' 읽음'+(lp.qN?' · 문제 '+lp.qDone+'/'+lp.qN+' 풀고 '+lp.qOk+' 정답':'')+'</small></span></div>'); }
      return h; };
    V50.sessHTML._v52=true;
  }
  /* ② 회차 표 [학습하기] → 수업 노트 우선 */
  if(window.V38&&V38.deckFor&&!V38.deckFor._v52){
    var _df=V38.deckFor;
    V38.deckFor=function(c,w,date){ if(date){ var l=V52.lesson(c,date); if(l) return {url:l.file+"#resume",title:l.title}; } return _df(c,w,date); };
    V38.deckFor._v52=true;
  }
  /* ③ NOTES 등록 */
  V52.registerNotes=function(){
    if(!Array.isArray(window.NOTES)||!V52.L||!V52.L.courses) return;
    Object.keys(V52.L.courses).forEach(function(cn){ var m=V52.L.courses[cn]; Object.keys(m).sort().forEach(function(d){ var l=m[d];
      if(!NOTES.some(function(x){ return x.file===l.file; })) NOTES.push({course:cn,type:"학습",title:"수업 노트 · "+(+d.slice(5,7))+"/"+(+d.slice(8,10))+" · "+l.title,file:l.file,week:l.week||weekOf(d)||1,date:d,sub:"회차 학습 페이지 · 약 "+(l.minutes||0)+"분 · 확인 문제 "+(l.qids||[]).length}); }); });
  };
  /* 로드 훅: 데이터가 오면 관련 화면을 다시 그린다 */
  var _rs=renderStudy; renderStudy=function(){ _rs(); if(!V52.L&&!V52.err) V52.load().then(function(){ if(ui.view==="study"&&window.V50){ try{ V50.render(); }catch(e){} } }); };
  var _rc=renderCourse; renderCourse=function(){ _rc(); if(!V52.L&&!V52.err) V52.load().then(function(){ if(ui.view==="course") renderCourse(); }); };
  var _rt=renderToday; renderToday=function(){ _rt(); if(!V52.L&&!V52.err) V52.load().then(function(){ if(ui.view==="today"&&window.V50){ try{ V50.renderToday(); V50.renderTodayCard(); }catch(e){} } }); };
  V52.load();
  var css=document.createElement("style"); css.id="v52css"; css.textContent=".v52-min{margin-left:6px;font-size:12px;color:var(--ink-3)}"; document.head.appendChild(css);
})();
