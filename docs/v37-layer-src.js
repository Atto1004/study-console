/* ============================================================
   V37 LAYER — 과목 화면 재구성 (아토 2026-09-17, 지침 학습시스템.md §12)
   ① 주차별 수업 정리 = 회차 표: 주차 × 수업 요일 칸마다 출결·진도·과제·학습하기 (주 2회 = 화 | 목, 주 1회 = 한 칸). 녹음 요약 제거
   ② 과목 상단 한 줄 「(재)미분적분학2 (3학점) · 홍순필 교수님 [화/목]」 + 출결·시험 요약 칩
   ③ 안 쓰는 카드(학습 처방전·주차 타임라인·회차 로그·커버리지·출결·과목 자료·과목 규칙·루틴 띠)와 버튼 묶음은 「세부정보」 안으로
   ④ 아이패드(≥768px) 우선 배치 — 회차 표 한 열 전체 폭, 칸은 요일 수만큼 가로 배치
   V36의 dayNotes·daySheet·openStudy(date)를 그대로 쓴다.
   ============================================================ */
(function(){
  if(window.V37) return;
  var V37=window.V37={};
  var ABSENT={absent:1,excused:1,ghost:1};
  var md=function(date){ var d=D(date); return (d.getMonth()+1)+"/"+d.getDate(); };

  /* ---------- 회차 칸 데이터 ---------- */
  V37.cell=function(c,p,split){
    var date=p.date, s=sessionOn(c.id,date), hol=holidayOn(date);
    var cancelled=!!(s&&s.cancelled), ended=!hol&&!cancelled&&sessionEnded(c,{date:date});
    var note= split? (window.V36?V36.dayNote(c,date):null) : weekNote(c,p.week);
    var has= split? (window.V36?V36.dayHas(c,date):false) : weekNoteHas(c,p.week);
    var filled= note? WN_SEC.filter(function(x){return (note[x[0]]||"").trim();}).length : 0;
    var tasks= note? note.tasks.filter(function(t){return !t.done;}) : [];
    var att= hol?{k:"hol",n:"휴강"} : cancelled?{k:"hol",n:"휴강"} : !ended?{k:"fut",n:"예정"} : (s&&s.status&&ATT[s.status])?{k:s.status,n:ATT[s.status].n} : {k:"norec",n:"출결 미기록"};
    var prog=(s&&s.progress||"").trim()||(note&&(note.range||"").trim())||"";
    var state= att.k==="hol"?"hol" : att.k==="fut"?"fut" : ABSENT[att.k]?"abs" : (!has?"miss":"ok");
    return {date:date,week:p.week,s:s,att:att,prog:prog,has:has,filled:filled,exam:note?note.exam.length:0,tasks:tasks,state:state,split:split,holName:hol?(hol.name||hol.label||""):""};
  };
  V37.cellHTML=function(c,x){
    var btns= x.state==="hol"?"" :
      '<button class="btn xs a" data-v37study="'+x.date+'|'+x.week+'">학습하기</button>'+
      '<button class="btn xs" data-v37note="'+x.date+'|'+x.week+'">정리</button>'+
      '<button class="btn xs" data-v37log="'+x.date+'">기록</button>';
    var attCls= x.att.k==="present"?"ok": (x.att.k==="late"||x.att.k==="vlate")?"warn": ABSENT[x.att.k]?"crit": x.att.k==="fut"||x.att.k==="hol"?"mut":"mut";
    return '<div class="v37-cell v37-'+x.state+'">'+
      '<div class="v37-ch"><b>'+esc(DAY[D(x.date).getDay()])+' '+esc(md(x.date))+'</b><span class="chip '+attCls+' v37-att">'+esc(x.att.n+(x.att.k==="hol"&&x.holName?" · "+x.holName:""))+'</span></div>'+
      (x.state==="hol"?'':
        '<div class="v37-row"><span class="v37-k">진도</span><span class="v37-v">'+(x.prog?esc(x.prog):'<span class="v37-none">미입력</span>')+'</span></div>'+
        '<div class="v37-row"><span class="v37-k">과제</span><span class="v37-v">'+(x.tasks.length?esc(x.tasks[0].text)+(x.tasks.length>1?' <span class="v37-none">외 '+(x.tasks.length-1)+'</span>':''):'<span class="v37-none">없음</span>')+'</span></div>'+
        '<div class="v37-row"><span class="v37-k">정리</span><span class="v37-v">'+(x.has?'섹션 '+x.filled+'/5'+(x.exam?' · <span class="v37-star">★ '+x.exam+'</span>':''):'<span class="v37-none'+(x.state==="fut"?'':' miss')+'">'+(x.state==="fut"?"—":"정리 없음")+'</span>')+'</span></div>')+
      '<div class="v37-btns">'+btns+'</div></div>';
  };
  V37.renderTable=function(c){
    var box=$("#cNotes"); if(!box) return;
    var t=term(), cw=currentWeek()||0, split=!!(window.V36&&V36.split(c));
    var dows=c.slots.map(function(s){return s.d;}).filter(function(d,i,a){return a.indexOf(d)===i;}).sort(function(a,b){return a-b;});
    var cols=Math.max(1,dows.length);
    var html="";
    for(var w=1;w<=t.weeks;w++){
      var ps=planned(c,true).filter(function(p){return p.week===w;});   /* 휴강 회차도 칸으로(휴강 표시) */
      var ws=weekStart(w), we=addDays(ws,6);
      var labels=[]; if(w===8) labels.push("중간고사 주간"); if(w===t.weeks) labels.push("기말고사 주간");
      exams(c.id).forEach(function(e){ if(weekOf(e.date)===w) labels.push(e.kind+" "+md(e.date)); });
      var wn=weekNote(c,w), wkHas=(function(){ var f=0; if(!wn) return false; WN_SEC.forEach(function(x){ if((wn[x[0]]||"").trim()) f++; }); return f>0||wn.exam.length>0||wn.tasks.length>0||wn.links.length>0||!!(wn.summary||"").trim(); })();
      var cells;
      if(!ps.length) cells='<div class="v37-cell v37-hol"><div class="v37-ch"><b>수업 없음</b></div></div>';
      else cells=ps.map(function(p){ return V37.cellHTML(c,V37.cell(c,p,split)); }).join("");
      html+='<div class="v37-wk'+(w===cw?" now":"")+'"><div class="v37-wh"><span class="v37-wn">'+w+'주차</span><small>'+esc(md(ws)+"~"+md(we))+'</small>'+
        labels.map(function(l){return '<span class="v37-lab">'+esc(l)+'</span>';}).join("")+
        (split&&wkHas?'<button class="btn xs v37-week" data-v37wk="'+w+'">주 합본 정리</button>':'')+'</div>'+
        '<div class="v37-cells" style="grid-template-columns:repeat('+Math.min(cols,ps.length||1)+',minmax(0,1fr))">'+cells+'</div></div>';
    }
    box.innerHTML=html;
    var hs=$("#cNotesHs"); if(hs){ var done=0,total=0; planned(c).forEach(function(p){ if(p.date<=today()){ total++; var x=V37.cell(c,p,split); if(x.has) done++; } }); hs.textContent="회차 정리 "+done+"/"+total+" · "+(split?"요일별":"주 단위"); }
    $$("#cNotes [data-v37study]").forEach(function(b){ b.onclick=function(){ var a=b.dataset.v37study.split("|"); if(split) openStudy(c.id,+a[1],a[0]); else openStudy(c.id,+a[1]); }; });
    $$("#cNotes [data-v37note]").forEach(function(b){ b.onclick=function(){ var a=b.dataset.v37note.split("|"); if(split&&window.V36) V36.daySheet(c.id,a[0]); else { ui.dayCtx=null; weekSheet(c.id,+a[1]); } }; });
    $$("#cNotes [data-v37log]").forEach(function(b){ b.onclick=function(){ logSheet(c.id,b.dataset.v37log); }; });
    $$("#cNotes [data-v37wk]").forEach(function(b){ b.onclick=function(){ ui.dayCtx=null; weekSheet(c.id,+b.dataset.v37wk); }; });
    var cur=$("#cNotes .v37-wk.now"); if(cur&&cur.scrollIntoView){ try{ cur.scrollIntoView({block:"nearest"}); }catch(e){} }
  };

  /* ---------- 상단 한 줄 + 세부정보 ---------- */
  V37.header=function(c){
    var head=$("#cHead"); if(!head) return;
    var kids=Array.prototype.slice.call(head.children);
    var title=kids[1], btns=kids[2]; var rest=kids.slice(3);
    if(title){ title.style.display="none"; title.setAttribute("data-v37","title"); } if(btns) btns.style.display="none"; rest.forEach(function(el){ el.style.display="none"; });
    var a=attStats(c), ex=exams(c.id)[0], dd=ex?diffDays(today(),ex.date):null;
    var days=c.slots.map(function(s){return s.d;}).filter(function(d,i,arr){return arr.indexOf(d)===i;}).sort(function(x,y){return x-y;}).map(function(d){return DAY[d];}).join("/");
    var line='<div class="v37-head"><h1>'+(c.isRetake?'<span class="v37-re">(재)</span>':'')+esc(c.name)+' <small>('+c.credits+'학점)</small>'+
      (c.prof?' · '+esc(c.prof)+' 교수님':'')+(days?' <span class="v37-days">['+esc(days)+']</span>':'')+'</h1>'+
      '<div class="cm"><span class="chip mut">출석 '+(a.n.present||0)+' · 지각 '+(a.lateN||0)+' · 결석 '+(a.n.absent||0)+'</span>'+
      (ex?'<span class="chip '+(dd!=null&&dd<=14?"warn":"mut")+'">'+esc(ex.kind)+' '+esc(md(ex.date))+(dd!=null&&dd>=0?' · D-'+dd:'')+'</span>':'')+
      (c.status==="pending"?'<span class="chip warn">증원 대기</span>':'')+'</div></div>'+
      '<div class="v37-hb"><button class="btn sm" id="v37Detail">'+(ui.v37Detail?"세부정보 닫기":"세부정보")+'</button></div>';
    var old=$("#v37Head",head); if(old) old.remove();
    var wrap=document.createElement("div"); wrap.id="v37Head"; wrap.className="v37-headwrap"; wrap.innerHTML=line;
    head.insertBefore(wrap, kids[1]||null);
    $("#v37Detail",wrap).onclick=function(){ ui.v37Detail=!ui.v37Detail; V37.detail(c); $("#v37Detail",wrap).textContent=ui.v37Detail?"세부정보 닫기":"세부정보"; };
    V37.detail(c);
  };
  V37.detail=function(c){
    var v=$("#v-course"); if(!v) return;
    var det=$("#v37DetailBox",v);
    if(!det){
      det=document.createElement("div"); det.id="v37DetailBox"; det.className="v37-detail";
      det.innerHTML='<div class="v37-dh">세부정보 — 과목 자료 · 평가 · 편집 · 루틴 · 출결 · 커버리지 · 타임라인 · 회차 로그</div><div class="v37-dbtns"></div><div class="v37-dcards"></div>';
      var notesCard=$("#cNotes").closest(".card");
      notesCard.insertAdjacentElement("afterend",det);
      /* 카드 이동: 학습 처방전·주차 타임라인·회차 로그·커버리지·출결·과목 자료 */
      ["#cMode","#cWeeks","#cLog","#cDocs","#cCov","#cAtt"].forEach(function(id){ var el=$(id,v); var card=el&&el.closest(".card"); if(card&&card!==notesCard) $(".v37-dcards",det).appendChild(card); });
      var rules=$("#v33Rules",v); if(rules){ var rc=rules.closest(".card")||rules; $(".v37-dcards",det).insertBefore(rc,$(".v37-dcards",det).firstChild); }
    }
    /* 버튼 묶음(즐겨찾기·숨기기·편집·시험 추가·매주 루틴)과 루틴 띠는 매번 새로 그려지므로 그때마다 옮긴다 */
    var head=$("#cHead"), kids=Array.prototype.slice.call(head.children);
    kids.forEach(function(el){ if(el.id==="v37Head"||el.classList.contains("cmark")||el.getAttribute("data-v37")==="title") return; $(".v37-dbtns",det).appendChild(el); el.style.display=""; });
    det.style.display=ui.v37Detail?"":"none";
  };

  var _renderCourse=renderCourse;
  renderCourse=function(){
    _renderCourse();
    try{ var c=course(ui.course); if(!c||isPersonal(c)) return; V37.header(c); if(!noStudyType(c)) V37.renderTable(c); }catch(e){ if(window.console) console.warn("V37", e); }
  };

  var css=document.createElement("style"); css.id="v37css";
  css.textContent=[
    /* 상단 */
    ".v37-headwrap{flex:1 1 240px;min-width:0;display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap}",
    ".v37-head{flex:1 1 240px;min-width:0}",
    ".v37-head h1{margin:0 0 4px;font-size:clamp(19px,2.4vw,24px);line-height:1.25;word-break:keep-all}",
    ".v37-head h1 small{font-size:.7em;font-weight:500;color:var(--ink-3)}",
    ".v37-head .v37-re{color:var(--crit);font-size:.85em;margin-right:2px}",
    ".v37-head .v37-days{font-family:var(--font-num);font-size:.75em;color:var(--accent);font-weight:600}",
    ".v37-hb{align-self:center}",
    /* 세부정보 */
    ".v37-detail{margin-top:16px;border:1px dashed var(--line-2);border-radius:12px;padding:12px 14px}",
    ".v37-dh{font-size:12px;color:var(--ink-3);margin-bottom:8px;font-family:var(--font-mono);letter-spacing:.04em}",
    ".v37-dbtns{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}",
    ".v37-dcards{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}",
    ".v37-dcards .card{margin:0}",
    /* 회차 표 */
    "#v-course .grid.g-a{display:block}",
    "#v-course .grid.g-a > div{display:contents}",
    "#cNotes{max-height:none!important;overflow:visible!important}",
    ".v37-wk{padding:10px 0;border-top:1px solid var(--line)}",
    ".v37-wk:first-child{border-top:0}",
    ".v37-wk.now{background:var(--accent-soft,rgba(78,95,181,.07));border-radius:10px;padding:10px 8px;margin:0 -8px}",
    ".v37-wh{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px}",
    ".v37-wn{font-family:var(--font-num);font-weight:700;font-size:14px;color:var(--accent)}",
    ".v37-wh small{font-family:var(--font-num);font-size:11.5px;color:var(--ink-3)}",
    ".v37-lab{font-size:11px;font-weight:700;color:var(--crit);background:var(--crit-soft,#F8E6E3);border-radius:5px;padding:1px 7px}",
    ".v37-week{margin-left:auto}",
    ".v37-cells{display:grid;gap:10px}",
    ".v37-cell{border:1px solid var(--line);border-radius:10px;padding:9px 11px;background:var(--paper,#fff);min-width:0}",
    ".v37-cell.v37-fut,.v37-cell.v37-hol{opacity:.55}",
    ".v37-cell.v37-abs{border-color:var(--crit)}",
    ".v37-cell.v37-miss{border-color:var(--warn)}",
    ".v37-ch{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}",
    ".v37-ch b{font-family:var(--font-num);font-size:13.5px}",
    ".v37-att{font-size:10.5px}",
    ".chip.crit{background:var(--crit-soft,#F8E6E3);color:var(--crit)}",
    ".v37-row{display:grid;grid-template-columns:34px minmax(0,1fr);gap:6px;font-size:12.5px;line-height:1.45;padding:2px 0}",
    ".v37-k{color:var(--ink-3);font-family:var(--font-mono);font-size:10.5px;letter-spacing:.06em;padding-top:2px}",
    ".v37-v{min-width:0;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;word-break:keep-all}",
    ".v37-none{color:var(--ink-3)}.v37-none.miss{color:var(--warn);font-weight:600}",
    ".v37-star{color:var(--warn);font-weight:700}",
    ".v37-btns{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}",
    "@media(max-width:599px){.v37-cells{grid-template-columns:1fr!important}}",
    /* V36 하위 행·V34 상태줄은 회차 표로 대체 */
    "#cNotes .v36-days,#cNotes > .wn-row{display:none}"
  ].join("\n");
  document.head.appendChild(css);
})();
