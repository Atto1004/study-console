/* ============================================================
   V49 LAYER — 중간고사 대비 허브 (대표님 2026-09-24 "학습앱 내에서 시험공부할 수 있게 세팅")
   학습 탭 맨 위(시험 모드 보드 아래 · 커리큘럼 카드 위). D-14 시험 모드(V25)와 별개로 지금(D-25)부터 보인다 — 시간 배분·큐 재정렬은 하지 않는다.
   과목 행 = D-day(가정 표시) · 범위(exam.scope) · 범위 안 진도(map.json 주차 제목) · 덱(문제 덱 우선 · 「학습」#resume / 「문제만」#quiz) · 이해도(V47 노드 known/shaky).
   「오늘」 = 시험 가장 가까운 과목(지침 §4 D-day 순), 같은 날이면 이해도 낮은 과목. 문제 덱이 있으면 「문제만」부터.
   데이터: knowledge/decks.json (docs/tools/deck_index.py 가 덱 HTML 의 SLIDES 를 읽어 생성). 못 읽으면 원인 한 줄 + 덱 없이 행 표시(빈 화면 금지).
   보조: 일반물리학2 중간 범위를 교수 발언대로 갱신(9/18 녹음 40:48 "27장 RC 회로까지, 28장 제외") — boot 패치 1회. 다른 과목 범위는 손대지 않는다(미공지).
   ============================================================ */
(function(){
  if(window.V49) return;
  var V49=window.V49={D:null,err:null,loading:null,HORIZON:45};
  V49.load=function(){
    if(V49.loading) return V49.loading;
    V49.loading=fetch("knowledge/decks.json",{cache:"no-store"}).then(function(r){ if(!r.ok) throw new Error("decks.json "+r.status); return r.json(); })
      .then(function(d){ V49.D=d; V49.err=null; return d; }).catch(function(e){ V49.err=String(e&&e.message||e); V49.D=null; return null; });
    return V49.loading;
  };
  /* 덱 진행 — 학습(mc-slides-<id>) · 마지막 위치(mc-slides-last-<id>) · 문제만(mc-slides-<id>-quiz, V6E) */
  V49.deckState=function(id){
    var out={}; try{
      var st=JSON.parse(localStorage.getItem("mc-slides-"+id)||"null"), last=JSON.parse(localStorage.getItem("mc-slides-last-"+id)||"null"), qz=JSON.parse(localStorage.getItem("mc-slides-"+id+"-quiz")||"null");
      if(last&&Number(last.qN)>0){ out.qDone=+last.qDone||0; out.qN=+last.qN; }
      if(st&&st.correct){ var ks=Object.keys(st.correct); out.learnDone=ks.length; out.learnOk=ks.filter(function(k){ return st.correct[k]===true; }).length; }
      if(qz&&qz.correct){ var qk=Object.keys(qz.correct); out.quizDone=qk.length; out.quizOk=qk.filter(function(k){ return qz.correct[k]===true; }).length; }
    }catch(e){}
    return out;
  };
  V49.items=function(){
    var td=today(), cw=currentWeek()||1, out=[];
    courses().filter(function(c){ return !isPersonal(c); }).forEach(function(c){
      var ex=exams(c.id).filter(function(e){ return diffDays(td,e.date)>=0; })[0]; if(!ex) return;
      var dd=diffDays(td,ex.date); if(dd>V49.HORIZON) return;
      var weeks=(window.V25&&V25.examWeeks)?V25.examWeeks(ex,cw):[];
      var m=(window.V47&&V47.M&&V47.M[c.name])||null;
      var wk=weeks.filter(function(w){ return m&&m.weeks&&m.weeks[String(w)]; }).map(function(w){ var d=m.weeks[String(w)]; return {w:w,title:d.title||"",planned:!!d.planned}; });
      var decks=((V49.D&&V49.D.decks)||[]).filter(function(d){ return d.course===c.name; }).map(function(d){ return Object.assign({},d,{st:V49.deckState(d.id)}); });
      decks.sort(function(a,b){ return ((b.kind==="exam")-(a.kind==="exam"))||(b.qN-a.qN); });
      var sum=(window.V47&&V47.G&&V47.summary)?V47.summary(c):null;
      out.push({c:c,ex:ex,dd:dd,weeks:weeks,wk:wk,decks:decks,sum:sum});
    });
    out.sort(function(a,b){ return a.dd-b.dd||a.c.name.localeCompare(b.c.name); });
    return out;
  };
  V49.ratio=function(it){ var t=it.sum?it.sum.ids.length:0; return t?it.sum.cnt.known/t:0; };
  V49.today=function(items){   /* 시험 가까운 순(지침 §4, 과목 가중 없음) → 같은 날이면 이해도 낮은 과목 */
    var best=null; items.forEach(function(it){ var s=it.dd*10+V49.ratio(it)*9; if(!best||s<best.s) best={it:it,s:s}; });
    return best?best.it:null;
  };
  V49.deckHTML=function(d){
    var st=d.st||{}, bits=[];
    if(st.quizDone) bits.push("문제만 "+st.quizOk+"/"+st.quizDone+" 정답");
    if(st.qN) bits.push("학습 문제 "+st.qDone+"/"+st.qN); else if(st.learnDone) bits.push("푼 문제 "+st.learnDone);
    if(!bits.length) bits.push(d.kind==="exam"?"아직 안 열음 · 문제 "+d.qN+"개":"문제 없음 · 읽기용");
    var t=d.kind==="exam"?d.title:(String(d.title||d.id).replace(/\s*\(회차 정리 자동 변환\)\s*$/,"")+" · 임시");
    return '<div class="v49-deck '+(d.kind==="exam"?"exam":"temp")+'"><span class="t">'+esc(t)+'</span><span class="st">'+esc(bits.join(" · "))+'</span>'+
      '<span class="v49-act"><button class="btn xs a" data-v49open="'+esc(d.file)+'#resume" data-v49t="'+esc(d.title||d.id)+'">학습</button>'+
      (d.qN>0?'<button class="btn xs" data-v49open="'+esc(d.file)+'#quiz" data-v49t="'+esc(d.title||d.id)+' · 문제만">문제만</button>':'')+'</span></div>';
  };
  V49.rowHTML=function(it){
    var c=it.c, ex=it.ex, s=it.sum, tot=s?s.ids.length:0, k=s?s.cnt.known:0;
    var bar=tot?'<span class="v49-bar" title="이해 확인 '+k+' · 흔들림 '+s.cnt.shaky+' · 모름/미평가 '+(s.cnt.unknown+s.cnt.unrated)+'"><i class="k" style="width:'+(k/tot*100)+'%"></i><i class="s" style="width:'+(s.cnt.shaky/tot*100)+'%"></i></span>':'';
    var und=tot?'이해 확인 <b>'+k+'/'+tot+'</b>':'<span class="v44-mut">커리큘럼 없음</span>';
    var when=fmtDate(ex.date)+(ex.time?" "+esc(ex.time):"")+(ex.assumed?" · <b>가정</b>":"");
    var wk=it.wk.length?'<div class="v49-weeks">'+it.wk.map(function(w){ return '<span'+(w.planned?' class="pl"':'')+'><b>'+w.w+'주차</b> '+esc(w.title)+(w.planned?" (예정)":"")+'</span>'; }).join("")+'</div>':'';
    return '<div class="v49-row" data-c="'+c.id+'"><div class="v49-h"><span class="crow-chip" style="background:'+(window.V44?V44.color(c):"#5B6B8C")+'">'+esc(window.V44?V44.abbr(c.name):c.name.slice(0,2))+'</span><b>'+esc(c.name)+'</b>'+
      '<span class="chip '+(it.dd<=7?"crit":it.dd<=14?"warn":"mut")+'">D-'+it.dd+'</span><span class="hint">'+esc(ex.kind)+' '+when+'</span><span class="v49-und">'+und+'</span>'+bar+'</div>'+
      (ex.scope?'<div class="v49-scope">범위 · '+esc(ex.scope)+'</div>':'<div class="v49-scope v44-mut">범위 미공지 — 지금까지 진도 기준</div>')+wk+
      '<div class="v49-decks">'+(it.decks.length?it.decks.map(V49.deckHTML).join(""):'<span class="v44-mut">이 과목은 아직 학습 덱이 없습니다 — 과목 화면의 회차 정리로</span>')+'</div></div>';
  };
  V49.todayHTML=function(items){
    var it=V49.today(items); if(!it) return '';
    var d=it.decks.filter(function(x){ return x.kind==="exam"; })[0], tot=it.sum?it.sum.ids.length:0, k=it.sum?it.sum.cnt.known:0;
    var what= d ? '「'+esc(d.title)+'」 <b>문제만</b>으로 정답률부터 확인 → 틀린 파트의 개념·암기 장을 「학습」으로 다시' : (it.decks.length?'임시 덱을 읽고 지식맵에서 자가평가':'회차 정리를 읽고 지식맵에서 자가평가');
    return '<div class="v49-today"><b>오늘</b> '+esc(it.c.name)+' <span class="chip '+(it.dd<=7?"crit":"mut")+'">D-'+it.dd+'</span> — 시험이 가장 가까운 과목'+(tot?' · 범위 '+tot+'개 중 이해 확인 '+k:'')+'<br>'+what+'</div>';
  };
  V49.errHTML=function(){ return (V49.err&&!V49.D)?'<div class="v49-err">덱 목록(knowledge/decks.json)을 못 읽었습니다: '+esc(V49.err)+' — 과목 행은 덱 없이 표시합니다.</div>':''; };
  V49.ensureCard=function(){
    var v=$("#v-study"); if(!v) return null; var c=$("#v49Card");
    if(!c){ c=document.createElement("div"); c.className="card v49"; c.id="v49Card";
      c.innerHTML='<div class="card-h"><h3>중간고사 대비</h3><span class="hs" id="v49Hs"></span><div class="ha"><span class="hint">시험 가까운 순 · 학습 = 개념부터 · 문제만 = 문제 장만</span></div></div><div class="card-b tight" id="v49Body"></div>';
      var ref=$("#v47Card"); if(!ref){ Array.prototype.some.call(v.children,function(el){ if(el.classList&&el.classList.contains("card")){ ref=el; return true; } }); }
      if(ref) v.insertBefore(c,ref); else v.appendChild(c); }
    return c;
  };
  V49.render=function(){
    var card=V49.ensureCard(); if(!card) return; var body=$("#v49Body"), hs=$("#v49Hs");
    var items=V49.items();
    if(!items.length){ body.innerHTML='<div class="v44-mut" style="padding:12px">45일 안에 잡힌 시험이 없습니다. 과목 화면에서 시험을 등록하면 여기에 대비 보드가 생깁니다.</div>'; if(hs) hs.textContent=""; return; }
    if(hs) hs.textContent="D-"+items[0].dd;
    body.innerHTML=V49.errHTML()+V49.todayHTML(items)+items.map(V49.rowHTML).join("");
    $$("[data-v49open]",body).forEach(function(b){ b.onclick=function(){ openNote(b.dataset.v49open,b.dataset.v49t||"학습 덱"); }; });
  };
  V49.renderStudy=function(){
    if(!V49.ensureCard()) return;
    var pending=[V49.load()]; if(window.V47&&V47.load) pending.push(V47.load());
    V49.render();
    Promise.all(pending).then(function(){ if(ui.view==="study") V49.render(); });
  };
  var _renderStudy=renderStudy; renderStudy=function(){ _renderStudy(); try{ V49.renderStudy(); }catch(e){ if(window.console) console.warn("V49", e); } };
  var _closeNote=closeNote; closeNote=function(){ _closeNote(); if(ui.view==="study"){ try{ V49.render(); }catch(e){} } };   /* 덱을 닫고 오면 진행 갱신 */
  window.addEventListener("storage",function(e){ if(e&&/^mc-slides-/.test(e.key||"")&&ui.view==="study"){ try{ V49.render(); }catch(x){} } });
  /* ---- 시험 범위 덱을 과목 화면 노트 목록에도 (V41 방식) ---- */
  V49.NOTES=[
    {course:"미분적분학2",file:"notes/calc2-vectors-slides.html",title:"미분적분학2 · 중간고사 대비 벡터 (12.1 좌표 · 12.2 벡터 · 12.3 내적 · 12.4 외적) — 5파트 · 문제 25",week:4,date:"2026-09-24",sub:"개념 → 암기 vs 이해 → 기초(객관식) → 응용 · 「문제만」 모드 #quiz"},
    {course:"공업수학1",file:"notes/em1-mid-slides.html",title:"공업수학1 · 중간고사 대비 (1장 1계 ODE · 2.1~2.3 · 2.5 오일러-코시) — 6파트 · 문제 36",week:4,date:"2026-09-24",sub:"개념 → 암기 vs 이해 → 기초(객관식) → 응용 · 「문제만」 모드 #quiz"},
    {course:"일반물리학2",file:"notes/phys2-mid-slides.html",title:"일반물리학2 · 중간고사 대비 (21 전하 · 22 전기장 · 23 가우스 · 24 전위 · 25 전기용량) — 5파트 · 문제 34",week:4,date:"2026-09-24",sub:"개념 → 암기 vs 이해 → 기초(객관식) → 응용 · 「문제만」 모드 #quiz"},
    {course:"정역학",file:"notes/statics-mid-slides.html",title:"정역학 · 중간고사 대비 (Ch.2 벡터 · Ch.3 힘과 평형) — 5파트 · 문제 31",week:4,date:"2026-09-24",sub:"개념 → 암기 vs 이해 → 기초(객관식) → 응용 · 「문제만」 모드 #quiz"}
  ];
  if(Array.isArray(window.NOTES)) V49.NOTES.forEach(function(n){ if(!NOTES.some(function(x){ return x.file===n.file; })) NOTES.push({course:n.course,type:"학습",title:n.title,file:n.file,week:n.week,date:n.date,sub:n.sub}); });
  /* ---- boot 패치: 일반물리학2 중간 범위(교수 발언) ---- */
  V49.patch=function(){
    var t=term(); if(!t||t.patchV49) return;
    var c=(t.courses||[]).filter(function(x){ return x.name==="일반물리학2"; })[0];
    if(c) (t.exams||[]).forEach(function(e){ if(e.courseId===c.id&&e.kind==="중간"&&!/27장/.test(e.scope||"")) e.scope="21장 전하 · 22장 전기장 · 23장 가우스 법칙 · 24장 전위 · 25장 전기용량 · 26장 전류와 저항 · 27장 회로(RC 회로까지, 28장 제외) — 교수 9/18 녹음 40:48 · 증명 3제(쌍극자·직선 도선·원판 전위) 중 1문제 20점 · 도체구/부도체구 범위별 전기장 「100% 출제」(9/16)"; });
    t.patchV49=true; persist();
  };
  var _boot=boot; boot=function(){ _boot(); try{ V49.patch(); }catch(e){ if(window.console) console.warn("V49 패치", e); } };
  var css=document.createElement("style"); css.id="v49css";
  css.textContent=[
    ".v49-today{padding:10px 12px;border-radius:10px;background:var(--crit-soft);border:1px solid color-mix(in srgb,var(--crit) 25%,var(--line));margin-bottom:6px;font-size:13.5px;line-height:1.55}",
    ".v49-err{font-size:12.5px;color:var(--crit);padding:6px 0}",
    ".v49-row{padding:10px 0 12px;border-top:1px solid var(--line)}.v49-row:first-of-type{border-top:0}",
    ".v49-h{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px}.v49-h>b{font-size:14.5px}.v49-h .hint{font-size:12px}",
    ".v49-und{font-size:12.5px;color:var(--ink-2);margin-left:auto}.v49-und b{color:var(--ok)}",
    ".v49-bar{display:inline-flex;width:88px;height:6px;border-radius:3px;background:var(--line);overflow:hidden}.v49-bar i{display:block;height:100%}.v49-bar .k{background:var(--ok)}.v49-bar .s{background:var(--warn)}",
    ".v49-scope{font-size:12.5px;color:var(--ink-2);margin-top:5px;line-height:1.5}",
    ".v49-weeks{display:flex;flex-direction:column;gap:2px;margin-top:4px;font-size:12.5px;color:var(--ink-2);line-height:1.45}.v49-weeks span b{color:var(--ink);font-weight:600;margin-right:4px}.v49-weeks .pl{color:var(--ink-3)}",
    ".v49-decks{display:flex;flex-direction:column;gap:6px;margin-top:8px}",
    ".v49-deck{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;padding:8px 10px;border:1px solid var(--line);border-radius:10px}.v49-deck.exam{border-color:color-mix(in srgb,var(--ok) 40%,var(--line))}",
    ".v49-deck .t{flex:1 1 220px;font-size:13px;line-height:1.4}.v49-deck.temp .t{color:var(--ink-2)}.v49-deck .st{font-size:12px;color:var(--ink-3)}.v49-act{display:flex;gap:6px;margin-left:auto}",
    "@media(max-width:480px){.v49-und{margin-left:0}.v49-act{margin-left:0;width:100%}.v49-act .btn{flex:1}}"
  ].join("\n");
  document.head.appendChild(css);
})();
