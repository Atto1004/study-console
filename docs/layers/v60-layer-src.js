/* ============================================================
   V60 LAYER — 대표님 2026-10-02 두 번째 요청 (BUILD 2026-10-02.102)
   ① 학습 탭 「중간고사 대비」 → 「시험 모드 · 중간고사」: 미적2 · 공수1 · 정역학 · 일물2 · CADD 다섯 과목만. CADD 는 암기 페이지(notes/memo/cadd.html)
   ② 공부계획 탭 = 얼라이브위크형 주간 격자. 고정 일정(수업 · 근무 루틴 · 캘린더 일정 · 활동 블록) + 수면 · 준비 · 식사 · 이동을 빼고 남은 빈 시간에
      과제(마감 이른 순, 마감 전) → 오늘 수업 복습(이해) → 밀린 회차(미적2 · 공수1 · 정역학 · 일물2, 시험 가까운 순 번갈아) → CADD 암기 순으로 배정.
      맨 위 「오늘 죽어도」(마감 내일까지) · 「오늘 무조건」(오늘 배정) · 가용/계획/실제 공부 시간 · 과제 목록(예상 시간 고치기 · 끝냄) · 진도
   ③ 할 일 탭: 지난 것·끝난 것 숨김 — 앞으로 할 것만
   ④ 달력(월): 제출 안 한 과제 마감만, 2주 안 · 옆에 제출 파일(atom 안에서만 열림 — _private/submit.json, 공개 저장소 제외)
   .136 (대표님 10/3): 「오늘 무조건」 → 「오늘 할 과제」(시각 없이 남은 과제 전부 · 과제/할 일 나눠 과목별 묶음 · 과목별 예상 합계) ·
        과제 시작 → 과제 종료(실제 소요 S.v60.act, 같은 과목 · 같은 종류 평균이 다음 예상) · 과제가 남으면 공부 배정 안 함(과제 뒤로) ·
        미확정은 비워 둠(자동 배정 · 식사 · 휴식 짐작 칸 X, 끝 모르는 체류는 지금까지만) · 격자 24시간 1시간 칸 + 30분 옅은 선 · 오늘 장소 줄(_private/plan.json stays · visits)
   ============================================================ */
(function(){
  if(window.V60) return;
  var V60=window.V60={};
  V60.MID=["미분적분학2","공업수학1","정역학","일반물리학2","CADD"];
  V60.CORE=["미분적분학2","공업수학1","정역학","일반물리학2"];     /* 계산·이해 과목 — 공부 배정 대상 */
  V60.CADD_MEMO="notes/memo/cadd.html";
  function pad2(n){ return (n<10?"0":"")+n; }
  function hm(m){ m=Math.round(m); var h=Math.floor(m/60), r=m%60; return pad2(h%24)+":"+pad2(r); }
  function dur(m){ return fmtMin(m); }
  /* 아침 수면 빗금 = 수면 기록이 있거나, 아직 오지 않은 시간(앞으로의 계획)일 때만 — 지난 시간에 짐작한 기상 시각은 그리지 않는다 (10/3) */
  V60.sleepKnown=function(d,wake){ var sl=V60.sleepOf(d); if(sl&&sl.wake) return true; var t=today(); return d>t||(d===t&&wake>nowMin()); };
  V60.I=function(t){ return window.V71?V71.info(t):""; };   /* 설명 문구는 (i) 안으로 — 지침 학습시스템 §30 */
  function cByName(n){ return courses().filter(function(c){ return c.name===n; })[0]; }
  V60.st=function(){ if(!S.v60) S.v60={est:{},done:{},cfg:{}}; S.v60.est=S.v60.est||{}; S.v60.done=S.v60.done||{}; S.v60.cfg=S.v60.cfg||{}; return S.v60; };
  V60.cfg=function(k,def){ var v=V60.st().cfg[k]; return (v==null||v==="")?def:v; };
  V60.endOf=function(name,dow){ var e=(V60.st().cfg.ends||{})[name+"|"+dow]; return e||""; };
  V60.slotRows=function(){
    var DW=["일","월","화","수","목","금","토"], out=[];
    courses().filter(isActive).forEach(function(c){ (c.slots||[]).forEach(function(sl){
      var k=c.name+"|"+sl.d, cur=V60.endOf(c.name,sl.d)||(c.name==="CADD"?"16:00":"");
      out.push('<label>'+esc(c.name)+' · '+DW[sl.d]+' '+esc(sl.s)+'–'+esc(sl.e)+'<input class="input" type="time" data-v60end="'+esc(k)+'" value="'+esc(cur||sl.e)+'"></label>'); }); });
    return out.join("");
  };
  V60.sleepOf=function(d){ var st=V60.st(); st.sleep=st.sleep||{}; return st.sleep[d]||null; };
  V60.loadSleep=function(){   /* 대표님이 말로 알려 준 수면 — atom 안에서만 보이는 _private/sleep.json, 앱 기록에 없는 날만 채운다 */
    if(!ATOM_HOSTED||(V60._slAt&&Date.now()-V60._slAt<60000)) return Promise.resolve(); V60._slAt=Date.now(); V60._sl=1;   /* 60초마다 다시(10/4 — 나중에 말한 수면이 새로고침 전까지 안 보이던 것) */
    return fetch("_private/sleep.json",{cache:"no-cache"}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }).then(function(j){
      if(!j) return; var st=V60.st(), n=0; st.sleep=st.sleep||{};
      Object.keys(j).forEach(function(d){ var v=j[d]; if(!v||!v.wake) return; var cur=st.sleep[d], b=v.bed||"";
        if(!cur||(cur.src==="said"&&(cur.bed!==b||cur.wake!==v.wake))){ st.sleep[d]={bed:b,wake:v.wake,src:"said"}; n++; }   /* 말로 준 값은 새 말로 갱신 */
        else if(!cur.src&&cur.bed===b&&cur.wake===v.wake) cur.src="said"; });   /* 예전에 같은 값으로 채워 둔 것 = 말로 준 값 */
      if(n){ persist(); if(ui.view==="plan") V60.render(); } });
  };

  /* ---------- ① 시험 모드 · 중간고사 ---------- */
  V60.hookExam=function(){
    if(!window.V49||V49._v60) return; V49._v60=true;
    var _it=V49.items;
    V49.items=function(){
      return _it.apply(this,arguments).filter(function(it){ return V60.MID.indexOf(it.c.name)>=0&&/중간/.test(it.ex.kind||"중간"); }).map(function(it){
        if(it.c.name==="CADD") it.decks=[{id:"cadd-memo",kind:"memo",title:"CADD · 중간고사 암기 (원페이퍼 · 카드 · 4지선다)",file:V60.CADD_MEMO,qN:0,st:{}}].concat(it.decks||[]);
        return it; });
    };
    var _dh=V49.deckHTML;
    V49.deckHTML=function(d){
      if(d.kind!=="memo") return _dh.apply(this,arguments);
      return '<div class="v49-deck exam"><span class="t">'+esc(d.title)+'</span><span class="st">암기 과목</span><span class="v49-act">'+
        '<button class="btn xs a" data-v49open="'+esc(d.file)+'#flip" data-v49t="CADD 암기카드">카드</button>'+
        '<button class="btn xs" data-v49open="'+esc(d.file)+'#sheet" data-v49t="CADD 원페이퍼">원페이퍼</button></span></div>';
    };
    var _ec=V49.ensureCard;
    V49.ensureCard=function(){ var c=_ec.apply(this,arguments); if(c){ var h=c.querySelector(".card-h h3"); if(h&&h.textContent!=="시험 모드 · 중간고사") h.textContent="시험 모드 · 중간고사";
      var hint=c.querySelector(".card-h .hint"); if(hint) hint.textContent="미적2 · 공수1 · 정역학 · 일물2 = 이해 · CADD = 암기"; } return c; };
  };

  /* ---------- 데이터: 과제 ---------- */
  V60.files=null;
  V60.loadFiles=function(){
    if(V60._fl) return V60._fl;
    V60._fl=(ATOM_HOSTED?fetch("_private/submit.json",{cache:"no-cache"}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }):Promise.resolve(null))
      .then(function(j){ V60.files=(j&&j.files)||[]; return V60.files; });
    return V60._fl;
  };
  V60.filesFor=function(a){ return (V60.files||[]).filter(function(f){ return f.course===a.c&&new RegExp(f.match).test(a.t); }); };
  V60.filesHTML=function(a){
    var fs=V60.filesFor(a).filter(function(f){ return !/\.html(\?|#|$)/.test(f.file)&&!/혼자\s*풀기/.test(f.label||""); }); if(!fs.length) return "";   /* 혼자 풀기는 그 과목 화면에만(대표님 10/4) — V73 */
    return '<span class="v60-files">'+fs.map(function(f){ var pg=/\.html(\?|#|$)/.test(f.file);   /* html(혼자 풀기 등)은 앱 안 보기 창으로 — 스앵님 코칭이 이어지게(10/3) */
      return '<a class="v60-file'+(pg?' pg':'')+'" href="'+esc(f.file)+'"'+(pg?' data-v60note="'+esc(a.c+" · "+f.label)+'"':' target="_blank" rel="noopener"')+'>'+esc(f.label)+'</a>'; }).join("")+'</span>';
  };
  document.addEventListener("click",function(e){ var t=e.target&&e.target.closest&&e.target.closest("a[data-v60note]"); if(!t||typeof openNote!=="function") return; e.preventDefault(); openNote(t.getAttribute("href"),t.getAttribute("data-v60note")); });
  V60.EST={"공업수학1":60,"정역학":90,"아카데믹글쓰기":60,"CADD":120,"일반물리학2":90,"미분적분학2":90};
  V60.key=function(a){ return a.c+"|"+a.t; };
  /* 과제 종류 — 같은 과목 · 같은 종류의 실제 소요 기록으로 예상 시간을 잡는다 (대표님 10/3) */
  V60.kindOf=function(t){ t=String(t||"");
    return /카드뉴스|인스타|업로드/.test(t)?"카드뉴스":/손글씨|옮겨/.test(t)?"옮겨 쓰기":/영상|시청|동영상/.test(t)?"영상":/활동지|글쓰기|에세이|주제문|보고서|서평|초안/.test(t)?"글":/퀴즈|quiz/i.test(t)?"퀴즈":"문제 풀이"; };
  V60.learned=function(c,kind){ var L=V60.st().act||{}, xs=Object.keys(L).map(function(k){ return L[k]; }).filter(function(x){ return x&&x.c===c&&x.kind===kind&&x.min>0; });
    if(!xs.length) return null; var avg=xs.reduce(function(a,x){ return a+x.min; },0)/xs.length; return {min:Math.max(5,Math.round(avg/5)*5),n:xs.length}; };
  V60.fill=function(o,def){ var st=V60.st(); o.k=V60.key(o); o.kind=V60.kindOf(o.t); var lr=V60.learned(o.c,o.kind);
    o.est=+(st.est[o.k]||(lr&&lr.min)||def); o.estSrc=st.est[o.k]?"직접":(lr?"기록 "+lr.n+"건 평균":"기본값");
    o.done=!!st.done[o.k]; o.run=V60.runOf(o.k); o.act=(st.act||{})[o.k]||null; return o; };
  V60.asgs=function(){
    var out=[], M=window.V58&&V58.M&&V58.M.courses, st=V60.st(); if(!M) return out;
    Object.keys(M).forEach(function(n){ (M[n].assignments||[]).forEach(function(a){
      if(!a.due) return; var s=a.lms_state||a.status||"";
      if(/제출|완료/.test(s)&&!/미제출/.test(s)) return;
      out.push(V60.fill({c:n,t:a.title||"과제",due:a.due.slice(0,10),time:a.due.length>10?a.due.slice(11,16):"23:59",st:s},V60.EST[n]||60));
    }); });
    /* 직접 넣은 할 일(공부계획 「+ 추가」) · 대표님이 말로 준 할 일(_private/tasks.json, atom 안에서만) */
    (st.extra||[]).concat(V60.priv||[]).forEach(function(x){ if(!x||!x.t||!x.due) return;
      if(x.kind==="study"||x.kind==="prep") return;   /* 공부 · 수업 준비는 과제가 아니다(대표님 10/3) — 「공부」 칸으로(V60.studyTodo) */
      var o=V60.fill({c:x.c||"기타",t:x.t,due:x.due,time:x.time||"23:59",st:"",own:1,id:x.id||""},x.est||60);
      if(x.noplan) o.est=0; o.noplan=x.noplan||""; out.push(o); });
    return out.sort(function(a,b){ return (a.due+a.time)<(b.due+b.time)?-1:1; });
  };

  /* ---------- 데이터: 하루의 고정 일정 ---------- */
  V60.R=null;
  V60.loadRoutine=function(){
    if(V60._rl) return V60._rl;
    var url=ATOM_HOSTED?"/api/routine":"knowledge/routine-week.json";
    V60._rl=fetch(url,{cache:"no-cache"}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }).then(function(j){
      if(j&&j.routine){ var R=j.routine; j={holidays:R.term.holidays,moves:{toSchool:(R.moves||{})["집→학교"]||10,toHome:(R.moves||{})["학교→집"]||20},prep:(R.wake||{}).prep_min||60,grid:{}};
        Object.keys(R.grid||{}).forEach(function(d){ j.grid[d]=(R.grid[d]||[]).filter(function(t){ return t.kind!=="수업"; }).map(function(t){ return {start:t.start,end:t.end,title:t.title,kind:t.kind,place:t.place,validFrom:t.validFrom,validUntil:t.validUntil,exdate:t.exdate||((t.src||{}).exdate)||[]}; }); }); }
      if(!j&&ATOM_HOSTED) return fetch("knowledge/routine-week.json").then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; });
      return j;
    }).then(function(j){ V60.R=j||{grid:{},holidays:[],moves:{toSchool:10,toHome:20},prep:60}; return V60.R; });
    return V60._rl;
  };
  V60.DOWK=["일","월","화","수","목","금","토"];
  V60.fixed=function(d){
    var out=[], R=V60.R||{grid:{}}, hol=holidayOn(d), rh=(R.holidays||[]).filter(function(h){ return h.date===d; })[0];
    if(!hol) classesOn(d).forEach(function(x){
      if(!isActive(x.c)) return; var ss=sessionOn(x.c.id,d); if(ss&&ss.cancelled) return;
      if(window.V32&&V32.meetings&&V32.meetings(x.c).indexOf(d)<0&&!ss) return;
      var ov=V60.endOf(x.c.name,D(d).getDay()), e=ov?toMin(ov):toMin(x.e);
      if(!ov&&x.c.name==="CADD") e=Math.min(e,16*60);     /* 시간표 13~19시, 보통 15~16시 끝(대표님 9/10) — 설정에서 바꿀 수 있음 */
      out.push({s:toMin(x.s),e:e,t:x.c.name,k:"cls",school:1,room:(x.sl&&x.sl.room)||""});
    });
    ((R.grid||{})[V60.DOWK[D(d).getDay()]]||[]).forEach(function(t){
      if(t.validFrom&&d<t.validFrom) return; if(t.validUntil&&d>t.validUntil) return; if((t.exdate||[]).indexOf(d)>=0) return;
      if(rh&&(rh.affects||[]).indexOf(t.kind)>=0) return;
      out.push({s:toMin(t.start),e:toMin(t.end),t:t.title,k:"work",school:t.place==="학교"?1:0,place:t.place||""});
    });
    (gcalOn(d)||[]).forEach(function(ev){ var t=String(ev.title||"");
      if(/공부|학습|과제|자습/.test(t)) return;                         /* 공부 블록은 여기서 다시 계획한다 */
      if(/기상|준비|이동|귀가/.test(t)) return;                          /* 준비·이동은 아래 규칙으로 */
      out.push({s:toMin(ev.start),e:toMin(ev.end)||1440,t:t,k:/알바|근무|근로/.test(t)?"work":"ev",place:ev.location||ev.place||""}); });
    plansOn(d).filter(function(p){ return p.activity; }).forEach(function(p){ out.push({s:toMin(p.s),e:toMin(p.e),t:p.kind||"활동",k:"ev"}); });
    (S.clinic||[]).filter(function(x){ return x.date===d; }).forEach(function(x){ out.push({s:toMin(x.start),e:toMin(x.end),t:"미적분 클리닉룸",k:"ev",school:1,place:x.place||""}); });   /* V65 예약 기록 */
    ((V60.pp&&V60.pp.events)||[]).filter(function(x){ return x.date===d; }).forEach(function(x){ out.push({s:toMin(x.start),e:toMin(x.end),t:x.title,k:x.k||"ev",place:x.place||"",trip:x.k==="trip"?1:0,said:1}); });   /* said = 대표님이 말로 준 일정 — 이름이 비슷해도 합치지 않는다(10/4 「과제」+「과제 · 저녁 · 휴식」이 한 칸이 된 버그) */
    var m=V60.merge(out.filter(function(b){ return b.e>b.s; }));
    ((V60.pp&&V60.pp.cuts)||[]).filter(function(x){ return x.date===d; }).forEach(function(x){ m.forEach(function(b){ if(V60.same(b.t,x.title)){ if(x.end) b.e=toMin(x.end); if(x.start) b.s=toMin(x.start); if(x.note) b.note=x.note; } }); });
    return m;
  };
  /* 같은 일정은 하나로 (대표님 10/2 「근로장학같이 하나의 일정은 하나로 합쳐」) — 루틴 · 캘린더 · 쪼개진 블록(점심 전후 등)이 겹치거나 90분 안에 이어지면 한 블록 */
  V60.norm=function(t){ return String(t||"").replace(/[^0-9A-Za-z가-힣]/g,"").replace(/(오전|오후|점심|근무|\d+)$/,""); };
  V60.same=function(a,b){ var x=V60.norm(a), y=V60.norm(b); return !!x&&!!y&&(x===y||x.indexOf(y)===0||y.indexOf(x)===0); };
  V60.merge=function(arr){
    arr.sort(function(a,b){ return a.s-b.s; }); var out=[];
    arr.forEach(function(b){
      var m=null; for(var i=out.length-1;i>=0;i--){ var o=out[i]; if(!o.said&&!b.said&&V60.same(o.t,b.t)&&b.s<=o.e+90){ m=o; break; } }
      if(m){ if(!m.room&&b.room) m.room=b.room; if(!m.place&&b.place) m.place=b.place; m.e=Math.max(m.e,b.e); m.s=Math.min(m.s,b.s); if(b.k==="work"||m.k==="work") m.k=m.k==="cls"?"cls":"work"; m.school=m.school||b.school; if(V60.norm(b.t).length<V60.norm(m.t).length) m.t=b.t; }
      else out.push({s:b.s,e:b.e,t:b.t,k:b.k,school:b.school,room:b.room||"",place:b.place||"",trip:b.trip||0,said:b.said||0});
    });
    return out.sort(function(a,b){ return a.s-b.s; });
  };
  function free(iv,busy){   /* iv=[s,e] 에서 busy 빼기 */
    var res=[[iv[0],iv[1]]];
    busy.forEach(function(b){ var nx=[]; res.forEach(function(r){ if(b.e<=r[0]||b.s>=r[1]){ nx.push(r); return; } if(b.s>r[0]) nx.push([r[0],b.s]); if(b.e<r[1]) nx.push([b.e,r[1]]); }); res=nx; });
    return res.filter(function(r){ return r[1]-r[0]>0; });
  }
  V60.day=function(d,nowM){
    var nxs=V60.sleepOf(addDays(d,1));   /* 그날 밤 실제 취침 = 다음 날 수면 기록의 bed (대표님 10/4 「취침한 시간 알려 줬는데 반영 안 함」) */
    var fx=V60.fixed(d), R=V60.R||{}, bed=toMin((nxs&&nxs.bed)||V60.cfg("bed","01:00")), sleepH=+V60.cfg("sleepH",(S.profile&&S.profile.sleepH)||7);
    var bedAbs=bed<6*60?bed+1440:bed;                                      /* 취침 01:00 = 그날 25:00 */
    var prep=+(R.prep||60), mv=R.moves||{toSchool:10,toHome:20};
    var sch=fx.filter(function(b){ return b.school; });
    var wakeNat=(bedAbs-1440)+sleepH*60;                                   /* 전날 취침 + 수면 */
    var first=fx.length?fx[0].s:null, need=first!=null?first-(sch.length&&sch[0].s===first?mv.toSchool:0)-prep:null;
    var wake=Math.max(5*60,need!=null?Math.min(wakeNat,need):wakeNat), short=need!=null&&need<wakeNat, slept=null;
    var sl=V60.sleepOf(d);                                                 /* 실제 수면 기록이 있으면 그 기상 시각 */
    if(sl&&sl.wake){ wake=toMin(sl.wake); if(sl.bed){ var bm=toMin(sl.bed); slept=wake>=bm?wake-bm:wake+1440-bm; short=slept<7*60; } }
    var blk=fx.slice(), guess=!!+V60.cfg("autoMeal",1);   /* 짐작 칸(식사 · 휴식 · 준비)은 「제안」(sug, 점선)으로 — 확정 일정과 구분 (대표님 10/3 「오늘 스케줄 날아간 거 복구」, 설정에서 끌 수 있음) */
    /* 대표님이 말한 일정이 기상 시각 근처에 있으면(「기상 · 씻고 준비」 등) 앱이 만든 기상·준비 칸은 넣지 않는다 — 같은 일 두 번 · 칸 겹침 금지 (10/4) */
    var wakeTaken=fx.some(function(b){ return b.s<wake+prep&&b.e>wake-30; });
    if(!wakeTaken&&(guess||(sl&&sl.wake))) blk.push({s:wake,e:wake+prep,t:"기상·준비",k:"life",sug:(sl&&sl.wake)?0:1});
    var home=null;
    if(sch.length){ var ss=sch.slice().sort(function(a,b){ return a.s-b.s; });
      blk.push({s:ss[0].s-mv.toSchool,e:ss[0].s,t:"이동",k:"move"});
      for(var q=0;q+1<ss.length;q++){ var gap=ss[q+1].s-ss[q].e; if(gap>0&&gap<=+V60.cfg("moveGap",30)) blk.push({s:ss[q].e,e:ss[q+1].s,t:"이동",k:"move"}); }   /* 붙어 있는 수업 사이 = 이동 */
      var lastE=Math.max.apply(null,ss.map(function(b){ return b.e; })), trip=fx.filter(function(b){ return b.k==="trip"&&b.s>=lastE&&b.s-lastE<=120; })[0];
      if(trip){ var nx=fx.filter(function(b){ return b.s>=lastE&&!b.school; })[0]||trip; blk.push({s:lastE,e:nx.s,t:nx.place==="집"?"귀가":"이동",k:"move"}); home=null; }
      else { blk.push({s:lastE,e:lastE+mv.toHome,t:"귀가",k:"move"}); home=lastE+mv.toHome; } }
    var dinLen=+V60.cfg("dinnerMin",60), rest=+V60.cfg("restMin",30), dinDone=false;
    if(!guess) dinDone=true;
    if(guess&&home!=null&&home>=16*60&&home<=20*60){                              /* 집에 오면 바로 저녁 → 쉬고 나서 공부 (대표님 10/2) */
      var ds=Math.ceil(home/5)*5; if(!blk.some(function(b){ return b.s<ds+dinLen&&b.e>ds&&b.k!=="move"; })){ blk.push({s:ds,e:ds+dinLen,t:"저녁",k:"meal",sug:1}); if(rest>0) blk.push({s:ds+dinLen,e:ds+dinLen+rest,t:"휴식",k:"life",sug:1}); dinDone=true; } }
    [["lunch","12:00",60,"점심",11*60+30,14*60],["dinner","18:30",60,"저녁",17*60+30,20*60+30]].forEach(function(m){
      if(!guess||(m[0]==="dinner"&&dinDone)) return;
      var len=+V60.cfg(m[0]+"Min",m[2]), at=toMin(V60.cfg(m[0],m[1])), lo=m[4], hi=m[5], done=false;
      for(var s=at;s<=hi-len&&!done;s+=15){ if(!blk.some(function(b){ return b.s<s+len&&b.e>s; })){ blk.push({s:s,e:s+len,t:m[3],k:"meal",sug:1}); if(m[0]==="dinner"&&rest>0) blk.push({s:s+len,e:s+len+rest,t:"휴식",k:"life",sug:1}); done=true; } }
      for(var s2=at-15;s2>=lo&&!done;s2-=15){ if(!blk.some(function(b){ return b.s<s2+len&&b.e>s2; })){ blk.push({s:s2,e:s2+len,t:m[3],k:"meal",sug:1}); done=true; } }
    });
    /* 제안(짐작)은 앞으로의 계획에만 — 지난 날 · 지금 이전에 끝난 짐작 칸은 지운다 (대표님 10/3 「미확정된 건 미래의 계획에만 해당」) */
    var tdy=today(), nm=nowMin();
    blk=blk.filter(function(b){ return !b.sug||(d>tdy)||(d===tdy&&b.e>nm); });
    /* 지난 시간에는 실제로 있었던 곳 — 대표님이 말한 짧은 체류 · 앱 위치(12시간 이하)를 시간표 칸으로 (10/3 「그전에 채웠던 내용들은?」). 빈 시간 계산에는 안 넣음(카페에서도 공부함) */
    var stays=[]; try{ var dz=addDays(d,1)+" 00:00", d0=d+" 00:00", nowS=V60.stamp(tdy,nm);
      V60.allStays().forEach(function(x){ if(V60.stayRank(x)===0||x.place==="새 장소"&&!x.sub) return; var e=x.to||(d===tdy?nowS:null); if(!e||x.from>=dz||e<=d0) return;
        var sm=x.from<d0?0:toMin(x.from.slice(11)), em=e>=dz?1440:toMin(e.slice(11)); if(em-sm<5) return;
        stays.push({s:sm,e:em,t:x.place,k:"stay",note:x.sub||"",stay:1}); }); }catch(err){}
    /* 지난 시간에는 실제로 한 것 — 과제 재생 → 종료 기록(S.v60.act)을 그 시각에 */
    var A=V60.st().act||{}; Object.keys(A).forEach(function(k){ var x=A[k]; if(!x||!x.at||!x.min) return; var e=new Date(x.at);
      var ds=e.getFullYear()+"-"+pad2(e.getMonth()+1)+"-"+pad2(e.getDate()); if(ds!==d) return; var em=e.getHours()*60+e.getMinutes();
      blk.push({s:Math.max(0,em-x.min),e:em,t:x.c+" · "+(x.t||"과제"),k:"hw",done:1}); });
    blk.sort(function(a,b){ return a.s-b.s; });
    var start=wake, end=bedAbs;
    if(nowM!=null) start=Math.max(start,Math.ceil(nowM/5)*5);
    var slots=start<end?free([start,end],blk.filter(function(b){ return b.k!=="life"||true; })):[];
    slots=slots.filter(function(r){ return r[1]-r[0]>=25; });
    var avail=slots.reduce(function(a,r){ return a+(r[1]-r[0]); },0);
    var sleepFrom=(sl&&sl.bed&&toMin(sl.bed)<12*60)?toMin(sl.bed):0;   /* 새벽에 잤으면 그 전(0시~취침)은 깨어 있던 시간 — 아침 빗금 시작 */
    if(!(sl&&sl.wake)&&d===today()&&typeof nowM==="number"&&nowM<wake) sleepFrom=Math.max(sleepFrom,nowM);   /* 기록 없는 오늘 = 아직 안 잠 — 지금 이후만 예상 수면(지난 시간은 짐작해서 칠하지 않음) */
    return {d:d,blk:blk,stays:stays,wake:wake,bed:bedAbs,sleepFrom:sleepFrom,short:short,slept:slept,slots:slots,avail:avail};
  };

  /* ---------- 배정 ---------- */
  V60.studyQueue=function(){
    var items=[]; try{ items=window.V50?V50.items():[]; }catch(e){ items=[]; }
    var td=today(), per=+V60.cfg("perSession",45), ex={};
    exams().forEach(function(e){ var c=course(e.courseId); if(c&&e.date>=td&&(!ex[c.name]||e.date<ex[c.name])) ex[c.name]=e.date; });
    var lanes=V60.CORE.map(function(n){
      var it=items.filter(function(i){ return i.c.name===n; })[0], q=[];
      if(it){ (it.todayL||[]).concat(it.todo||[]).forEach(function(x){
        if(V60.st().sdone&&V60.st().sdone[it.c.id+"|"+x.date]) return;
        var sec=(window.V59&&V59.secsFor)?V59.secsFor(it.c,x):null;
        q.push({kind:"study",c:it.c,x:x,min:per,today:x.date===td,label:V60.md(x.date)+" 회차"+(sec&&sec.s.length?" · "+sec.s.join(" · "):(x.title?" · "+x.title:""))}); }); }
      return {n:n,ex:ex[n]||"9999",q:q};
    }).sort(function(a,b){ return a.ex<b.ex?-1:a.ex>b.ex?1:0; });
    var out=[], more=true;
    lanes.forEach(function(l){ l.q.filter(function(x){ return x.today; }).forEach(function(x){ x.pri=1; out.push(x); }); l.q=l.q.filter(function(x){ return !x.today; }); });
    while(more){ more=false; lanes.forEach(function(l){ if(l.q.length){ out.push(l.q.shift()); more=true; } }); }
    return out;
  };
  V60.BREAK=10;
  V60.md=function(d){ var x=D(d); return (x.getMonth()+1)+"/"+x.getDate()+"("+V60.DOWK[x.getDay()]+")"; };
  V60.plan=function(mon){
    var td=today(), nowM=nowMin(), days=[], asg=V60.asgs(), sq=V60.studyQueue();
    var hw=asg.filter(function(a){ return !a.done&&a.due>=td&&!a.noplan; }).map(function(a){ return {kind:"hw",a:a,left:a.est,dueAbs:a.due+" "+a.time}; });
    var caddLeft=+V60.cfg("caddMin",20), cadd=cByName("CADD");
    for(var i=0;i<7;i++){
      var d=addDays(mon,i), past=d<td, info=V60.day(d,d===td?nowM:null);
      info.past=past; info.items=[]; info.actual=studyMinutes(d,d);
      if(!past){
        var slots=info.slots.map(function(r){ return [r[0],r[1]]; });
        var put=function(task,label,cls,min,meta){
          var left=min, got=0;
          for(var j=0;j<slots.length&&left>0;j++){ var r=slots[j], len=r[1]-r[0]; if(len<25) continue;
            var take=Math.min(len,left); if(len-take<25&&len-take>0) take=len-take<10?len:take;
            if(take<25&&left>=25) continue;
            info.items.push({s:r[0],e:r[0]+take,t:label,k:cls,meta:meta}); r[0]+=take+V60.BREAK; left-=take; got+=take; }
          return got;
        };
        /* 1) 과제 — 마감 이른 순, 마감 날짜까지 */
        hw.forEach(function(h){ if(h.left<=0||d>h.a.due) return;
          var got=put(h,h.a.c+" · "+h.a.t,"hw",h.left,{hw:h.a}); h.left-=got; if(got) h.days=(h.days||[]).concat([d]); });
        /* 2) 공부 — 오늘 수업 복습 먼저, 그다음 밀린 회차(시험 가까운 과목부터 번갈아) */
        /*    과제를 해야 공부를 할 수 있다(대표님 10/3) — 이날까지 배정하고도 남은 과제가 있으면 공부는 배정하지 않는다 */
        info.hwLeft=hw.filter(function(h){ return h.left>0&&d<=h.a.due; }).length;
        var cap=info.hwLeft?0:+V60.cfg("maxStudy",300)-(d===td?info.actual:0), used=0;
        while(sq.length&&used<cap){ var x=sq[0]; if(x.today&&d!==td){ x.today=false; }
          var want=Math.min(x.min,cap-used); if(want<25) break;
          var got2=put(x,x.c.name+" · "+x.label,"st",want,{c:x.c,x:x.x,today:x.today}); used+=got2; if(!got2) break; if(x.min-got2>=25){ x.min-=got2; if(got2<want) break; continue; } sq.shift(); }
        /* 3) CADD 암기 — 하루 20분 */
        if(!info.hwLeft&&cadd&&caddLeft>0&&!(V60.st().mdone&&V60.st().mdone[d])) put({},"CADD · 암기카드 20장","memo",caddLeft,{memo:1,d:d});
        info.items.sort(function(a,b){ return a.s-b.s; });
      }
      days.push(info);
    }
    hw.forEach(function(h){ h.short=h.left>0; });
    return {mon:mon,days:days,hw:hw,asg:asg,leftStudy:sq.length};
  };

  /* ---------- 공부계획 화면 ---------- */
  V60.ui={week:0,off:0,day:null,today:(function(){ try{ return localStorage.getItem("mc-plan-today")==="1"; }catch(e){ return false; } })()};
  V60.render=function(){
    if(window.V59) V59.ensureView(); var body=$("#v59Body"); if(!body) return;
    var pend=[];
    if(window.V58&&!V58.M&&V58.load) pend.push(V58.load());
    if(!V60.R) pend.push(V60.loadRoutine());
    if(V60.files==null) pend.push(V60.loadFiles());
    if(ATOM_HOSTED&&!V60._sl) pend.push(V60.loadSleep()); else if(ATOM_HOSTED) V60.loadSleep();   /* 그 뒤로는 기다리지 않고 60초마다 확인 */
    if(ATOM_HOSTED&&V60.pp==null) pend.push(fetch("_private/plan.json",{cache:"no-cache"}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }).then(function(j){ V60.pp=j||{}; }));
    if(ATOM_HOSTED&&V60.priv==null) pend.push(fetch("_private/tasks.json",{cache:"no-cache"}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }).then(function(j){ V60.priv=(j&&j.tasks)||[]; }));
    if(pend.length&&!V60._wait){ V60._wait=1; Promise.all(pend).then(function(){ V60._wait=0; if(ui.view==="plan") V60.render(); }); if(!V60.R){ body.innerHTML='<div class="v44-mut" style="padding:16px">…</div>'; return; } }
    if(V60.ui.today) V60.ui.week=0;
    var td=today(), mon=addDays(mondayOf(td),7*V60.ui.week);
    if(ATOM_HOSTED&&window.V25&&V25.atomCal&&!V60._cal){ V60._cal=1; V25.atomCal(mon,addDays(mon,6),function(fresh){ V60._cal=0; if(fresh&&ui.view==="plan") V60.render(); }); }
    var P=V60.plan(V60.ui.week<0?mon:(V60.ui.week===0?mon:mon));
    var T=P.days.filter(function(x){ return x.d===td; })[0];
    $("#v59Sub").textContent=V60.md(mon)+" ~ "+V60.md(addDays(mon,6))+(ATOM_HOSTED?"":" · 캘린더 일정 미반영(atom 밖)");
    /* 오늘 죽어도 / 무조건 */
    var tom=addDays(td,1);
    var must=P.asg.filter(function(a){ return !a.done&&a.due>=td&&a.due<=tom; });
    var exT=exams().filter(function(e){ return e.date===tom||e.date===td; });
    /* 과목 이름은 묶음 머리에 한 번만, 그 아래 세부 항목 — 「사회봉사 · 사회봉사 · 사회봉사」 반복 금지(대표님 10/3) */
    var dieG={}, dieO=[];
    must.forEach(function(a){ if(!dieG[a.c]){ dieG[a.c]=[]; dieO.push(a.c); } dieG[a.c].push(a); });
    exT.forEach(function(e){ var n=(course(e.courseId)||{}).name||"시험"; if(!dieG[n]){ dieG[n]=[]; dieO.push(n); } dieG[n].push({ex:e}); });
    var die='<div class="v60-die"><div class="v60-h">오늘 죽어도</div>'+(dieO.length?dieO.map(function(n){ var xs=dieG[n], m=xs.reduce(function(s,a){ return s+(a.ex||a.noplan?0:a.est); },0);
      return '<div class="v60-grp die"><div class="v60-grph"><b>'+esc(n)+'</b><span>'+xs.length+'개'+(m?' · 약 '+dur(m):'')+'</span></div>'+xs.map(function(a){
        if(a.ex) return '<div class="v60-tk2"><div class="v60-tkm"><div class="v60-tkt">'+esc(a.ex.kind||"시험")+'</div><div class="v60-tks"><span class="v60-due hot">'+(a.ex.date===td?"오늘":"내일")+'</span></div></div></div>';
        return '<div class="v60-tk2"><div class="v60-tkm"><div class="v60-tkt">'+esc(V60.tt(a))+'</div><div class="v60-tks"><span class="v60-due hot">'+(a.due===td?"오늘":"내일")+' '+esc(a.time)+'</span> · '+(a.noplan?esc(a.noplan):'약 '+dur(a.est))+V60.filesHTML(a)+'</div></div>'+
          '<div class="v60-tka"><button type="button" class="v60-chk" data-v60done="'+esc(a.k)+'" aria-label="완료"></button></div></div>'; }).join("")+'</div>'; }).join(""):'<div class="v60-none">마감 임박 없음</div>')+'</div>';
    var tItems=T?T.items:[];
    var mustDo=V60.taskCard(P,T,td);
    /* 오늘 끝낸 것 — 체크된 상자로 남긴다(대표님 10/2 「빈 박스 → 누르면 체크」) */
    var stx=V60.st(), dd0=function(t){ var x=new Date(t); return x.getFullYear()+"-"+(x.getMonth()<9?"0":"")+(x.getMonth()+1)+"-"+(x.getDate()<10?"0":"")+x.getDate(); };
    var doneT=[]; P.asg.forEach(function(a){ if(a.done&&stx.done[a.k]&&dd0(stx.done[a.k])===td) doneT.push({t:a.c+" · "+a.t+(a.act?" — 실제 "+dur(a.act.min)+" (예상 "+dur(a.est)+")":""),k:"done:"+a.k}); });
    Object.keys(stx.sdone||{}).forEach(function(k){ if(dd0(stx.sdone[k])===td){ var c=course(k.split("|")[0]); doneT.push({t:(c?c.name:"")+" · "+V60.md(k.split("|")[1])+" 회차",k:"sdone:"+k}); } });
    if((stx.mdone||{})[td]) doneT.push({t:"CADD · 암기카드",k:"mdone:"+td});
    if(doneT.length) mustDo=mustDo.replace(/<\/div>$/,'<div class="v60-donel">'+doneT.map(function(x){ return '<div class="v60-dn"><button type="button" class="v60-chk on" data-v60undo="'+esc(x.k)+'" aria-label="완료 취소"></button><s>'+esc(x.t)+'</s></div>'; }).join("")+'</div></div>');
    var hwMin=P.asg.filter(function(a){ return !a.done&&a.due>=td; }).reduce(function(s,a){ return s+(a.noplan?0:a.est); },0), stMin=tItems.filter(function(b){ return b.k!=="hw"; }).reduce(function(a,b){ return a+b.e-b.s; },0);
    var hwAct=Object.keys(stx.act||{}).reduce(function(s,k){ var x=stx.act[k]; return s+(x&&dd0(x.at)===td?x.min:0); },0);
    var nums='<div class="v60-nums"><span><small>지금부터 빈 시간</small><b>'+dur(T?T.avail:0)+'</b></span><span><small>남은 과제 예상</small><b>'+dur(hwMin)+'</b></span><span><small>오늘 과제 실제</small><b>'+dur(hwAct)+'</b></span><span><small>공부(과제 뒤)</small><b>'+dur(stMin)+'</b></span><span><small>오늘 실제 공부</small><b>'+dur(T?T.actual:0)+'</b></span>'+
      (T&&T.slept!=null?'<span class="'+(T.short?'warn':'')+'"><small>어젯밤 수면</small><b>'+dur(T.slept)+'</b></span>':(T&&T.short?'<span class="warn"><small>수면</small><b>부족</b></span>':''))+'</div>';
    /* 주간 격자 */
    /* 24시간 · 1시간 칸 · 30분은 칸 가운데 옅은 선(대표님 10/3). 빈 시간은 비워 둔다 — 과제 · 공부 자동 배정은 칸에 그리지 않고 위 목록에만 */
    var H0=0, H1=1440, PX=0.6, nowM=nowMin(); V60._g={H0:H0,H1:H1,PX:PX};
    var cols=P.days.map(function(x){
      var bl=x.blk.map(function(b){ return {s:b.s,e:b.e,t:b.t,k:b.k,sug:b.sug}; }).concat(x.items.map(function(b){ return {s:b.s,e:b.e,t:b.t,k:b.k,sug:1}; }));   /* 과제 · 공부 배정 = 제안 칸 */
      var isT=x.d===td;
      return '<div class="v60-col'+(isT?' today':'')+(x.past?' past':'')+'" data-d="'+x.d+'"><div class="v60-ch"><b>'+V60.md(x.d)+'</b><small>빈 '+dur(x.avail)+(x.actual?' · 공부 '+dur(x.actual):'')+'</small></div><div class="v60-cb" style="height:'+((H1-H0)*PX)+'px">'+
        (V60.sleepKnown(x.d,x.wake)?'<i class="v60-sleep" style="top:'+Math.max(0,((x.sleepFrom||0)-H0)*PX)+'px;height:'+Math.max(0,(x.wake-Math.max(H0,x.sleepFrom||0))*PX)+'px"></i>':'')+(x.d>=td?'<i class="v60-sleep" style="top:'+((x.bed-H0)*PX)+'px;height:'+Math.max(0,(H1-x.bed)*PX)+'px"></i>':'')+
        bl.filter(function(b){ return b.e>H0&&b.s<H1; }).map(function(b){ var s=Math.max(b.s,H0), e=Math.min(b.e,H1), h=(e-s)*PX;
          return '<div class="v60-b k-'+b.k+(b.sug?' sug':'')+'" style="top:'+((s-H0)*PX)+'px;height:'+h+'px" title="'+esc(hm(b.s)+'–'+hm(b.e)+' '+b.t)+'">'+(h>=15?'<span>'+esc(b.t)+'</span>':'')+(h>=30?'<small>'+hm(b.s)+'</small>':'')+'</div>'; }).join("")+
        (isT&&nowM>H0&&nowM<H1?'<i class="v60-now" style="top:'+((nowM-H0)*PX)+'px"><b>'+hm(nowM)+'</b></i>':'')+'</div></div>';
    }).join("");
    var hours=''; for(var h=0;h<=24;h+=1) hours+='<span style="top:'+((h*60-H0)*PX)+'px">'+pad2(h%24)+'</span>';
    var seg=(V60.viewBar?V60.viewBar():'')+'<div hidden>';   /* 10/4 아이콘 보기 전환(V60.viewBar) — 아래 예전 버튼 줄은 숨김 자리만 */
    seg+='<div class="seg" id="v60WkOld"><button data-w="t"'+(V60.ui.today?' aria-pressed="true"':'')+'>오늘만</button><button data-w="0"'+(!V60.ui.today&&V60.ui.week===0?' aria-pressed="true"':'')+'>이번 주</button><button data-w="1"'+(!V60.ui.today&&V60.ui.week===1?' aria-pressed="true"':'')+'>다음 주</button></div>';
    var selD=addDays(td,V60.ui.off||0), TS=T;
    if(V60.ui.today&&selD!==td){ TS=P.days.filter(function(x){ return x.d===selD; })[0];
      if(!TS){ var mon2=mondayOf(selD); TS=V60.plan(mon2).days.filter(function(x){ return x.d===selD; })[0];
        if(ATOM_HOSTED&&window.V25&&V25.atomCal&&V60._calW!==mon2){ V60._calW=mon2; V25.atomCal(mon2,addDays(mon2,6),function(fresh){ if(fresh&&ui.view==="plan") V60.render(); }); } } }
    seg+='</div>';
    var grid=V60.ui.today?V60.todayHTML(TS,selD<td?1441:selD>td?-1:nowM,seg):'<div class="card v60-gridcard"><div class="card-h"><h3>'+(V60.weekName?V60.weekName(V60.ui.week):(V60.ui.week?'다음 주':'이번 주'))+V60.I("꽉 찬 칸 = 정해진 일정 · 점선 칸 = 제안(앱이 짐작으로 배치한 과제 · 공부 · 식사 · 휴식).\n빗금 = 수면.")+'</h3><span class="hs"></span><div class="ha">'+seg+'</div></div>'+
      '<div class="card-b"><div class="v60-leg"><i class="k-cls"></i>수업<i class="k-work"></i>근무·알바<i class="k-ev"></i>일정<i class="k-meal"></i>식사·준비<i class="k-move"></i>이동</div>'+
      '<div class="v60-grid"><div class="v60-hrs" style="height:'+((H1-H0)*PX)+'px">'+hours+'</div>'+cols+'</div></div></div>';
    /* 과제 */
    /* 끝낸 과제 기록 — 실제 소요(과제 시작 → 과제 종료). 같은 과목 · 같은 종류의 다음 과제 예상 시간이 이 평균으로 잡힌다 */
    var actL=Object.keys(stx.act||{}).map(function(k){ return Object.assign({k:k},stx.act[k]); }).filter(function(x){ return x.min>0; }).sort(function(a,b){ return b.at-a.at; });
    var hwRows=actL.slice(0,12).map(function(x){
      return '<div class="lrow v60-hw done"><div class="gr"><div class="t">'+esc(x.c)+' · '+esc(x.t||x.k.split("|").slice(1).join("|"))+'</div><div class="s">'+esc(x.kind)+' · '+esc(V60.md(dd0(x.at)))+' · 실제 '+dur(x.min)+'</div></div>'+
        '<button type="button" class="btn xs" data-v60undo="done:'+esc(x.k)+'">되돌리기</button></div>'; }).join("");
    /* 진도 */
    var items=[]; try{ items=window.V50?V50.items():[]; }catch(e){}
    var prog=V60.CORE.concat(["CADD"]).map(function(n){ var c=cByName(n); if(!c) return ""; var it=items.filter(function(i){ return i.c.id===c.id; })[0];
      var ex=exams(c.id).filter(function(e){ return e.date>=td&&/중간/.test(e.kind||""); })[0], wk=studyMinutes(mondayOf(td),addDays(mondayOf(td),6))&&0;
      var mins=(S.studyLog||[]).filter(function(l){ return l.cid===c.id&&l.d>=mondayOf(td); }).reduce(function(a,l){ return a+(+l.min||0); },0);
      var past=it?it.past.length:0, done=it?it.done:0, todo=it?it.todo.length:0;
      return '<div class="lrow"><span class="crow-chip" style="background:'+(window.V44?V44.color(c):"#5B6B8C")+'">'+esc(window.V44?V44.abbr(c.name):n.slice(0,2))+'</span><div class="gr"><div class="t"><b>'+esc(n)+'</b>'+(ex?' <span class="hint">중간 '+esc(V60.md(ex.date))+' · D-'+diffDays(td,ex.date)+'</span>':'')+'</div>'+
        '<div class="s">'+(n==="CADD"?'암기 과목':'따라감 '+done+'/'+past+' 회차 · 밀림 '+todo)+' · 이번 주 공부 '+dur(mins)+'</div></div></div>'; }).join("");
    /* 설정 */
    var set='<details class="v60-set"><summary>수면 · 식사 · 공부 단위</summary><div class="v60-sf">'+
      [["bed","취침","01:00","time"],["sleepH","수면(시간)",(S.profile&&S.profile.sleepH)||7,"number"],["lunch","점심","12:00","time"],["dinner","저녁","18:30","time"],["perSession","회차당 공부(분)",45,"number"],["caddMin","CADD 암기(분/일)",20,"number"],["maxStudy","하루 공부 최대(분)",300,"number"],["restMin","저녁 뒤 휴식(분)",30,"number"],["moveGap","수업 사이 이동으로 볼 틈(분)",30,"number"]].map(function(f){
        return '<label>'+esc(f[1])+'<input class="input" type="'+f[3]+'" data-v60cfg="'+f[0]+'" value="'+esc(V60.cfg(f[0],f[2]))+'"></label>'; }).join("")+
      '<label class="v60-ck"><input type="checkbox" data-v60cfgck="autoMeal"'+(+V60.cfg("autoMeal",0)?' checked':'')+'> 식사 · 휴식 · 준비를 짐작해서 칸에 채우기</label></div>'+
      '<div class="v60-sh">오늘 수면</div><div class="v60-sf">'+(function(){ var sl=V60.sleepOf(td)||{}; return '<label>취침<input class="input" type="time" data-v60sleep="bed" value="'+esc(sl.bed||"")+'"></label><label>기상<input class="input" type="time" data-v60sleep="wake" value="'+esc(sl.wake||"")+'"></label>'; })()+'</div>'+
      '<div class="v60-sh">장소</div><div class="v60-sf"><label>근로장학 장소<input class="input" data-v60cfg="place:근로장학" placeholder="예: 제1공학관 2층 학과 사무실" value="'+esc(V60.cfg("place:근로장학",""))+'"></label></div>'+
      '<div class="v60-sh">수업 끝나는 시각</div><div class="v60-sf">'+V60.slotRows()+'</div></details>';
    /* 대표님 10/3 「오늘 죽어도 없애고 오늘 할 일에 오늘 꼭 해야 하는 마감 임박만 따로 빨갛게」 → 카드 하나(오늘 할 과제), 마감 오늘·내일 줄만 빨강 */
    body.innerHTML='<div class="v60-top one">'+mustDo+'</div>'+nums+grid+
      '<div class="card"><div class="card-h"><h3>끝낸 과제 · 실제 소요'+V60.I("▶ 재생 → ■ 종료로 끝낸 과제가 실제 걸린 시간과 함께 여기 쌓이고, 같은 과목 · 같은 종류 과제의 예상 시간이 됩니다.")+'</h3><span class="hs">'+actL.length+'</span></div><div class="card-b tight">'+hwRows+
        '<div class="v60-add"><select class="input" id="v60aC">'+V60.MID.concat(["아카데믹글쓰기","창업아이디어탐색","사회봉사","기타"]).map(function(n){ return '<option>'+esc(n)+'</option>'; }).join("")+'</select><input class="input" id="v60aT" placeholder="할 일"><input class="input" type="date" id="v60aD" value="'+td+'"><input class="input" type="time" id="v60aH" value="23:59"><input class="input" type="number" id="v60aM" value="60" min="10" step="10"><button type="button" class="btn a" id="v60aB">추가</button></div></div></div>'+
      '<div class="card"><div class="card-h"><h3>진도</h3></div><div class="card-b tight">'+prog+'</div></div>'+set;
    /* 이벤트 */
    var finish=function(k,timed){ var st=V60.st(), now=Date.now(), r=V60.runOf(k), a=P.asg.filter(function(x){ return x.k===k; })[0];
      if(r){ var min=Math.max(1,Math.round(V60.runMs(r)/60000)); st.act=st.act||{}; st.act[k]={c:a?a.c:k.split("|")[0],t:a?a.t:"",kind:a?a.kind:V60.kindOf(k),min:min,at:now}; delete st.run[k]; toast("과제 종료 — 실제 "+fmtMin(min)+" 기록"); }
      else if(timed) toast("시작 기록이 없어 완료만 표시합니다"); else toast("과제 완료");
      st.done[k]=now; persist(); V60.render(); };
    $$("[data-v60done]",body).forEach(function(b){ b.onclick=function(){ var st=V60.st(), k=b.dataset.v60done; if(st.done[k]){ delete st.done[k]; if(st.act) delete st.act[k]; persist(); V60.render(); } else finish(k,false); }; });
    /* 재생 · 일시정지 · 종료 (대표님 10/3 「텍스트 말고 이미지 버튼」) — S.v60.run[k]={t0:재생 중이면 시작 시각, acc:쌓인 ms} */
    $$("[data-v60play]",body).forEach(function(b){ b.onclick=function(){ var st=V60.st(), k=b.dataset.v60play, r=V60.runOf(k)||{t0:0,acc:0}; st.run=st.run||{}; st.run[k]={t0:Date.now(),acc:r.acc||0}; persist(); V60.render(); }; });
    $$("[data-v60pause]",body).forEach(function(b){ b.onclick=function(){ var st=V60.st(), k=b.dataset.v60pause, r=V60.runOf(k); if(!r) return; st.run[k]={t0:0,acc:V60.runMs(r)}; persist(); V60.render(); }; });
    $$("[data-v60stop]",body).forEach(function(b){ b.onclick=function(){ finish(b.dataset.v60stop,true); }; });
    $$("[data-v60cfgck]",body).forEach(function(inp){ inp.onchange=function(){ V60.st().cfg[inp.dataset.v60cfgck]=inp.checked?1:0; persist(); V60.render(); }; });
    $$("[data-v60est]",body).forEach(function(inp){ inp.onchange=function(){ var v=+inp.value; if(v>0){ V60.st().est[inp.dataset.v60est]=v; persist(); V60.render(); } }; });
    $$("[data-v60cfg]",body).forEach(function(inp){ inp.onchange=function(){ V60.st().cfg[inp.dataset.v60cfg]=inp.type==="number"?+inp.value:inp.value; persist(); V60.render(); }; });
    $$("[data-v60go]",body).forEach(function(b){ b.onclick=function(){ var q=b.dataset.v60go.split("|"); openStudy(q[0],+q[1],q[2]); }; });
    $$("[data-v60memo]",body).forEach(function(b){ b.onclick=function(){ openNote(V60.CADD_MEMO+"#flip","CADD 암기카드"); }; });
    var ab=$("#v60aB",body); if(ab) ab.onclick=function(){ var t=($("#v60aT",body).value||"").trim(); if(!t){ toast("할 일을 적어 주세요"); return; } var st=V60.st(); st.extra=st.extra||[];
      st.extra.push({id:uid(),c:$("#v60aC",body).value,t:t,due:$("#v60aD",body).value||td,time:$("#v60aH",body).value||"23:59",est:+$("#v60aM",body).value||60}); persist(); V60.render(); };
    $$("[data-v60undo]",body).forEach(function(b){ b.onclick=function(){ var st=V60.st(), k=b.dataset.v60undo, i=k.indexOf(":"), t=k.slice(0,i), r=k.slice(i+1); if(t==="done"){ delete st.done[r]; if(st.act) delete st.act[r]; } else if(t==="sdone"&&st.sdone) delete st.sdone[r]; else if(t==="mdone"&&st.mdone) delete st.mdone[r]; persist(); V60.render(); }; });
    $$("[data-v60sdone]",body).forEach(function(b){ b.onclick=function(){ var st=V60.st(); st.sdone=st.sdone||{}; st.sdone[b.dataset.v60sdone]=Date.now(); persist(); toast("완료 — 남은 시간을 다시 배정합니다"); V60.render(); }; });
    $$("[data-v60mdone]",body).forEach(function(b){ b.onclick=function(){ var st=V60.st(); st.mdone=st.mdone||{}; st.mdone[b.dataset.v60mdone]=Date.now(); persist(); V60.render(); }; });
    $$("[data-v60sleep]",body).forEach(function(inp){ inp.onchange=function(){ var st=V60.st(); st.sleep=st.sleep||{}; var o=st.sleep[td]||{}; o[inp.dataset.v60sleep]=inp.value; delete o.src; st.sleep[td]=o;   /* 앱에서 직접 넣은 값 — 말로 준 값으로 덮지 않음 */ persist(); V60.render(); }; });
    $$("[data-v60end]",body).forEach(function(inp){ inp.onchange=function(){ var st=V60.st(); st.cfg.ends=st.cfg.ends||{}; if(inp.value) st.cfg.ends[inp.dataset.v60end]=inp.value; else delete st.cfg.ends[inp.dataset.v60end]; persist(); V60.render(); }; });
    if(V60.viewBind) V60.viewBind(body);
    $$("#v60WkOld button",body).forEach(function(b){ b.onclick=function(){ var w=b.dataset.w; V60.ui.today=w==="t"; if(w!=="t") V60.ui.week=+w; try{ localStorage.setItem("mc-plan-today",V60.ui.today?"1":"0"); }catch(e){} V60.render(); }; });
  };

  /* ---------- 오늘 할 과제 (대표님 10/3) ----------
     시각 표시 없이 남은 과제 전부. 과제(LMS)와 할 일(직접 · 말로 준 것)을 나누고, 각각 과목별로 묶어 마감 순 · 과목별 예상 합계.
     과제마다 「과제 시작 → 과제 종료」 — 실제 소요를 따로 남긴다. 공부는 그 아래 「과제 끝낸 뒤」로만. */
  V60.tt=function(a){ var t=String(a.t||""), c=String(a.c||""); return (c&&t.indexOf(c)===0)?(t.slice(c.length).replace(/^[\s·:\-–—]+/,"")||t):t; };   /* 묶음 머리에 과목이 있으니 제목 앞 과목명은 뗀다 */
  V60.runOf=function(k){ var r=(V60.st().run||{})[k]; if(!r) return null; if(typeof r==="number") r={t0:r,acc:0}; return r; };   /* 예전 형식(시작 시각 숫자)도 읽는다 */
  V60.runMs=function(r){ return (r.acc||0)+(r.t0?Date.now()-r.t0:0); };
  V60.clock=function(ms){ var s=Math.floor(ms/1000), h=Math.floor(s/3600), m=Math.floor(s%3600/60); s%=60; return (h?h+":"+(m<10?"0":""):"")+m+":"+(s<10?"0":"")+s; };
  V60.ICON={play:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>',
    pause:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6.5" y="5.5" width="4" height="13" rx="1" fill="currentColor"/><rect x="13.5" y="5.5" width="4" height="13" rx="1" fill="currentColor"/></svg>',
    stop:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor"/></svg>'};
  /* ---------- 혼자 풀기 문제 큐 (atom 안에서만 — 문제 은행은 _private) ---------- */
  V60.HWS=[["statics",20],["calc2",10],["em1",15]];
  V60.loadHW=function(){
    if(V60.HW||V60._hwL||!window.ATOM_HOSTED) return; V60._hwL=1;
    var base="notes/lessons/_private/", get=function(u){ return fetch(u,{cache:"no-cache"}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }); };
    Promise.all(V60.HWS.map(function(x){ var sl=x[0];
      return get(base+sl+"/hw/meta.json").then(function(m){ if(!m) return null;
        return Promise.all((m.tabs||[]).map(function(t){ return get(base+sl+"/hw/ch"+t[0]+".json"); })).then(function(chs){ var ps=[];
          chs.forEach(function(c){ ((c&&c.problems)||[]).forEach(function(p){ ps.push({id:p.id,title:p.title||"",n:(p.steps||[]).length}); }); });
          return {slug:sl,min:x[1],meta:m,ps:ps}; }); }); }))
    .then(function(bs){ V60.HW=bs.filter(function(b){ return b&&b.ps.length; }); V60._hwL=0; if(ui.view==="plan") V60.render(); });
  };
  V60.hwQueueHTML=function(td,waitN){
    if(!window.ATOM_HOSTED) return '<div class="v60-tk2"><div class="v60-tkm"><div class="v60-tks">과제 혼자 풀기 문제는 atom 안에서 열립니다</div></div></div>';
    if(!V60.HW){ V60.loadHW(); return ''; }
    var ex=function(name){ var e=(exams()||[]).filter(function(x){ var c=course(x.courseId); return c&&c.name===name&&x.kind==="중간"&&x.date>=td; })[0]; return e?e.date:"9999"; };
    var bs=V60.HW.map(function(b){ var rec={}; try{ rec=JSON.parse(localStorage.getItem(b.meta.key)||"{}")||{}; }catch(e){}
      var st=function(id){ var r=rec[id]; return !r||!r.runs||!r.runs.length?"new":(r.clean>=2?"ok":"ing"); };
      var ps=b.ps.map(function(p){ return {p:p,s:st(p.id),r:rec[p.id]}; });
      return {b:b,date:ex(b.meta.course),ps:ps,ok:ps.filter(function(x){ return x.s==="ok"; }).length}; })
      .filter(function(x){ return x.date!=="9999"; }).sort(function(a,b){ return a.date<b.date?-1:1; });
    var out="";
    bs.forEach(function(x,i){ var lim=i===0?4:i===1?2:1;
      var todo=x.ps.filter(function(q){ return q.s==="ing"; }).concat(x.ps.filter(function(q){ return q.s==="new"; })).slice(0,lim);
      if(!todo.length) return;
      var dd=diffDays(td,x.date), base="notes/lessons/_private/"+x.b.slug+"/hw/index.html";
      out+='<div class="v60-grp hwq"><div class="v60-grph"><b>'+esc(x.b.meta.course)+'</b><span>혼자 ✓ '+x.ok+' / '+x.ps.length+' · 시험 D-'+dd+'</span></div>'+todo.map(function(q){ var p=q.p;
        var tag=q.s==="ing"?'연습 중 '+((q.r&&q.r.clean)||0)+'/2':'처음';
        return '<div class="v60-tk2'+(waitN?' wait':'')+'"><div class="v60-tkm"><div class="v60-tkt">'+esc(/^\d/.test(p.title||"")?p.title:p.id+" · "+(p.title||""))+'</div><div class="v60-tks">혼자 풀기 · '+tag+' · '+p.n+'단계 · 약 '+fmtMin(x.b.min)+'</div></div>'+
          '<div class="v60-tka"><a class="btn xs a" href="'+esc(base+"#p="+p.id)+'" data-v60note="'+esc(x.b.meta.course+" · 혼자 풀기 "+p.id)+'">풀기</a></div></div>'; }).join("")+'</div>'; });
    return out;
  };
  V60.taskCard=function(P,T,td){
    var left=P.asg.filter(function(a){ return !a.done&&a.due>=td; });
    var sum=function(xs){ return xs.reduce(function(s,a){ return s+(a.noplan?0:a.est); },0); };
    var isHot=function(a){ return diffDays(td,a.due)<=1; };
    var groups=function(xs){ var by={}, ord=[]; xs.forEach(function(a){ if(!by[a.c]){ by[a.c]=[]; ord.push(a.c); } by[a.c].push(a); });
      return ord.map(function(c){ var g=by[c].slice().sort(function(a,b){ return (isHot(b)?1:0)-(isHot(a)?1:0); }); return {c:c,xs:g,hot:g.some(isHot)}; })
        .sort(function(a,b){ return (b.hot?1:0)-(a.hot?1:0); }); };
    var due=function(a){ var dd=diffDays(td,a.due); return '<span class="v60-due'+(dd<=1?' hot':'')+'">'+(dd===0?'오늘 '+esc(a.time):dd===1?'내일 '+esc(a.time):V60.md(a.due)+' · D-'+dd)+'</span>'; };
    var row=function(a){
      var r=a.run, on=r&&r.t0, k=esc(a.k);
      var act=(r?'<span class="v60-run'+(on?'':' paused')+'" data-v60clock="'+k+'">'+V60.clock(V60.runMs(r))+'</span>':'')+
        (on?'<button type="button" class="v60-ib" data-v60pause="'+k+'" aria-label="일시정지" title="일시정지">'+V60.ICON.pause+'</button>'
           :'<button type="button" class="v60-ib play" data-v60play="'+k+'" aria-label="'+(r?'이어서':'시작')+'" title="'+(r?'이어서':'시작')+'">'+V60.ICON.play+'</button>')+
        (r?'<button type="button" class="v60-ib stop" data-v60stop="'+k+'" aria-label="종료 · 완료" title="종료 · 완료">'+V60.ICON.stop+'</button>':'');
      var hot=diffDays(td,a.due)<=1;
      return '<div class="v60-tk2'+(on?' run':r?' paused':'')+(hot?' urgent':'')+'"><div class="v60-tkm"><div class="v60-tkt">'+esc(V60.tt(a))+'</div><div class="v60-tks">'+due(a)+' · '+
        (a.noplan?esc(a.noplan):'<label class="v60-est">약 <input type="number" min="5" step="5" value="'+a.est+'" data-v60est="'+esc(a.k)+'">분</label> <small>'+esc(a.kind)+' · '+esc(a.estSrc)+'</small>')+V60.filesHTML(a)+'</div></div>'+
        '<div class="v60-tka">'+act+'<button type="button" class="v60-chk" data-v60done="'+esc(a.k)+'" aria-label="완료"></button></div></div>'; };
    var sec=function(title,xs){ if(!xs.length) return "";
      return '<div class="v60-sec"><div class="v60-sech">'+title+'</div>'+groups(xs).map(function(g){ var m=sum(g.xs);
        return '<div class="v60-grp'+(g.hot?' hot':'')+'"><div class="v60-grph"><b>'+esc(g.c)+'</b><span>'+g.xs.length+'개'+(m?' · 약 '+fmtMin(m):'')+'</span></div>'+g.xs.map(row).join("")+'</div>'; }).join("")+'</div>'; };
    /* 공부 — 과제 끝낸 뒤 */
    /* 혼자 풀기는 각 과목 화면에만(대표님 10/4 「혼자 풀기는 각 과목에 넣는 거」, V73) — 공부 칸은 회차 · 암기 · 공부 할 일 */
    var st=[], seen={}; (T?T.items:[]).filter(function(b){ return b.k==="st"||b.k==="memo"; }).forEach(function(b){ if(seen[b.t]){ seen[b.t].min+=b.e-b.s; return; } seen[b.t]={b:b,min:b.e-b.s}; st.push(seen[b.t]); });
    var sd=V60.st().done, own=(V60.priv||[]).concat(V60.st().extra||[]).filter(function(x){ return x&&(x.kind==="study"||x.kind==="prep")&&x.due>=td; }).map(function(x){ var o={c:x.c||"기타",t:x.t,due:x.due,time:x.time||"23:59",kind:x.kind}; o.k=V60.key(o); o.done=!!sd[o.k]; return o; }).filter(function(o){ return !o.done; }).sort(function(a,b){ return (a.due+a.time)<(b.due+b.time)?-1:1; });
    var ownHTML=own.map(function(o){ var dd=diffDays(td,o.due);
      return '<div class="v60-tk2'+(left.length&&o.kind==="study"?' wait':'')+'"><div class="v60-tkm"><div class="v60-tkt"><b>'+esc(o.c)+'</b> · '+esc(V60.tt(o))+'</div><div class="v60-tks">'+(o.kind==="prep"?'수업 준비 · ':'')+(dd===0?'오늘':dd===1?'내일':V60.md(o.due)+' · D-'+dd)+'</div></div><div class="v60-tka"><button type="button" class="v60-chk" data-v60done="'+esc(o.k)+'" aria-label="완료"></button></div></div>'; }).join("");
    var stBody=ownHTML+(T&&T.hwLeft?'':st.map(function(x){ var b=x.b, m=b.meta||{};
      return '<div class="v60-tk2'+(left.length?' wait':'')+'"><div class="v60-tkm"><div class="v60-tkt">'+esc(b.t)+'</div><div class="v60-tks">약 '+fmtMin(x.min)+'</div></div><div class="v60-tka">'+
        (m.x?'<button type="button" class="btn xs a" data-v60go="'+m.c.id+'|'+m.x.w+'|'+m.x.date+'">열기</button><button type="button" class="v60-chk" data-v60sdone="'+m.c.id+'|'+m.x.date+'" aria-label="완료"></button>':'')+
        (m.memo?'<button type="button" class="btn xs a" data-v60memo="1">카드</button><button type="button" class="v60-chk" data-v60mdone="'+esc(m.d)+'" aria-label="완료"></button>':'')+'</div></div>'; }).join(""));
    var stHTML=stBody?'<div class="v60-sec st"><div class="v60-sech">공부'+V60.I("과제 혼자 풀기(스앵님 코칭)는 각 과목 화면에 있습니다.\n과제를 끝낸 뒤에 합니다 — 과제를 해야 공부를 할 수 있다.\n남은 과제가 오늘 안에 다 안 들어가면 복습 · 밀린 회차 · 암기는 배정하지 않습니다.\n흐린 줄 = 과제가 남아 아직 차례가 아닌 공부.")+'</div>'+stBody+'</div>':'';
    var exH=exams().filter(function(e){ return e.date===td||e.date===addDays(td,1); }).map(function(e){ var n=(course(e.courseId)||{}).name||"";
      return '<div class="v60-tk2 urgent"><div class="v60-tkm"><div class="v60-tkt"><b>'+esc(n)+'</b> · '+esc(e.kind||"시험")+'</div><div class="v60-tks"><span class="v60-due hot">'+(e.date===td?"오늘":"내일")+(e.time?" "+esc(e.time):"")+'</span></div></div></div>'; }).join("");
    var nHot=left.filter(isHot).length;
    return '<div class="v60-must"><div class="v60-h">오늘 할 과제 '+(nHot?'<span class="v60-hotn">마감 임박 '+nHot+'</span> ':'')+'<span class="v60-hs">'+left.length+'개'+(sum(left)?' · 예상 합계 '+fmtMin(sum(left)):'')+'</span>'+V60.I("시각 없이 남은 과제 전부 — 과목별 · 마감 순.\n「과제」 = LMS 과제 · 「할 일」 = 직접 넣거나 말로 준 것.\n▶ 재생 · ⏸ 일시정지 · ■ 종료(= 완료 + 실제 걸린 시간 기록). 그 기록이 같은 과목 · 같은 종류 과제의 예상 시간이 됩니다.")+'</div>'+
      exH+sec("과제",left.filter(function(a){ return !a.own; }))+sec("할 일",left.filter(function(a){ return a.own; }))+stHTML+'</div>';
  };

  /* ---------- 오늘만 보기: 하루 시간표를 한 줄씩 ---------- */
  V60.KN={stay:"있던 곳",cls:"수업",work:"근무",ev:"일정",trip:"이동(차편)",meal:"식사",life:"생활",move:"이동",hw:"과제",st:"공부",memo:"암기"};
  V60.todayHTML=function(T,nowM,seg){
    var rows=T?T.blk.concat(T.items.map(function(b){ return Object.assign({sug:1},b); })).filter(function(b){ return b.e>T.wake-1; }).sort(function(a,b){ return a.s-b.s||a.e-b.e; }):[];   /* 정해진 일정만 — 빈 시간은 비워 둔다(대표님 10/3) */
    var hm2=function(m){ m=Math.round(m); return (m>=1440?"익일 ":"")+(Math.floor(m/60)%24<10?"0":"")+(Math.floor(m/60)%24)+":"+(m%60<10?"0":"")+(m%60); };
    var sc=rows.filter(function(b){ return b.school; }), back=rows.filter(function(b){ return b.t==="귀가"; });
    var sch=sc.length?{s:Math.min.apply(null,sc.map(function(b){ return b.s; })),e:back.length?back[back.length-1].s:Math.max.apply(null,sc.map(function(b){ return b.e; }))}:null;
    var places=rows.map(function(b){ return b.k==="move"?null:V60.placeOf(b,sch,T.d); });
    places.forEach(function(pl,i){ if(pl&&pl.soft){ for(var x=i-1;x>=0;x--){ if(places[x]){ if(places[x].campus) places[i]=places[x]; break; } } } });
    var label=function(pl){ return pl?(pl.name+(pl.sub&&!pl.soft?" "+pl.sub:"")):""; };
    var prevKey=null;
    var placeCell=function(i){
      var b=rows[i], pl=places[i];
      if(b.k==="move"){ var from=null,to=null; for(var x=i-1;x>=0;x--){ if(places[x]){ from=places[x]; break; } } for(var y=i+1;y<rows.length;y++){ if(places[y]){ to=places[y]; break; } }
        if(!from) from={name:"집",home:1}; if(!to) to={name:"집",home:1};
        return '<div class="v60-tp mv"><span>'+esc(from.name)+'</span><b>→</b><span>'+esc(to.name+(to.sub&&!to.soft&&to.campus&&to.name!=="학교"?" "+to.sub:""))+'</span></div>'; }
      if(!pl) return '<div class="v60-tp"></div>';
      var same=prevKey!=null&&prevKey===label(pl); prevKey=label(pl);
      return '<div class="v60-tp '+(pl.home?'home':(pl.campus?'campus':'out'))+(same?' same':'')+'">'+(same?'<i></i>':'<span class="v60-tpn">'+esc(pl.name)+(pl.sub?' <small>'+esc(pl.sub)+'</small>':'')+(pl.ask?' <small class="v60-rask">자리 ❓</small>':'')+'</span>')+'</div>';
    };
    /* 24시간 · 1시간 칸 시간표 (대표님 10/3 「오늘 24시간으로 되어 있는 거 왜 한 칸밖에 없는 거지」) — 칸은 늘 24개, 정해진 일정만 그 시각에 놓고 나머지는 빈 칸 */
    var PXH=V60.DPX, H=24*PXH, y=function(m){ return Math.max(0,Math.min(1440,m))/60*PXH; };
    var hrs=''; for(var h=0;h<24;h++) hrs+='<span style="top:'+(h*PXH)+'px">'+pad2(h)+':00</span>';
    var shade=T?(V60.sleepKnown(T.d,T.wake)?'<i class="v60-dsl" style="top:'+y(T.sleepFrom||0)+'px;height:'+Math.max(0,y(T.wake)-y(T.sleepFrom||0))+'px"></i>':'')+(T.bed<1440?'<i class="v60-dsl" style="top:'+y(T.bed)+'px;height:'+(H-y(T.bed))+'px"></i>':''):'';
    /* 글자 겹침 · 잘림 · 튀어나옴 금지 (대표님 10/4 「금기로 정했던 텍스트 합쳐짐 · 글자 잘림 · 밖으로 튀어나옴」):
       칸 높이는 다음 칸 시작을 넘지 않게 자르고, 높이에 맞는 만큼만 글자를 넣는다 — 14px 미만 = 글자 없는 선 · 44 미만 = 한 줄 · 100 미만 = 제목 한 줄 + 시각 · 100 이상 = 종류 + 제목 두 줄 + 시각.
       이동은 「이동」만 — 어디로 갔는지는 오른쪽 장소 줄이 보여 준다 (「용식이형네로 이동 말고 그냥 이동만」) */
    var tops=rows.map(function(b){ return y(b.s); });
    var blks=rows.map(function(b,ri){ if(b.e<=0||b.s>=1440) return ""; var top=y(b.s), real=y(b.e)-top, past=b.e<=nowM, cur=b.s<=nowM&&nowM<b.e;
      var nextTop=H; for(var q=ri+1;q<rows.length;q++){ if(tops[q]>top+1){ nextTop=tops[q]; break; } }
      var ht=Math.min(Math.max(real,16),nextTop-top-2); if(ht<3) ht=Math.max(2,real);
      var isMove=b.k==="move"||(b.k==="trip"&&/이동/.test(b.t)), title=isMove?"이동":b.t;
      var size=ht<14?" line":ht<44?" thin":ht<100?" mid":"";
      if(ht<14) return '<div class="v60-db k-'+b.k+(b.sug?' sug':'')+(past?' past':'')+' line" style="top:'+top+'px;height:'+ht+'px" title="'+esc(hm2(b.s)+'–'+hm2(b.e)+' '+title)+'"></div>';
      var pc=V60.LANE?'':b.stay?'':placeCell(ri).replace(/^<div class="v60-tp/,'<div class="v60-tp v60-dp');
      /* 예전 목록 디자인 느낌(대표님 10/3 「1시간 칸 나누기 전 디자인이 이뻤다」) — 흰 칸 · 얇은 색 띠 · 작은 종류 이름 · 굵은 제목 · 파일/완료 상자 · 오른쪽 장소 줄 */
      var act=(ht>=60&&b.meta&&b.meta.hw?V60.filesHTML(b.meta.hw)+'<button type="button" class="v60-chk" data-v60done="'+esc(b.meta.hw.k)+'" aria-label="완료"></button>':'')+
        (ht>=60&&b.meta&&b.meta.x?'<button type="button" class="btn xs a" data-v60go="'+b.meta.c.id+'|'+b.meta.x.w+'|'+b.meta.x.date+'">열기</button><button type="button" class="v60-chk" data-v60sdone="'+b.meta.c.id+'|'+b.meta.x.date+'" aria-label="완료"></button>':'');
      return '<div class="v60-db k-'+b.k+(b.sug?' sug':'')+(past?' past':'')+(cur?' cur':'')+size+'" style="top:'+top+'px;height:'+ht+'px"><div class="v60-dbt">'+(ht>=100?'<span class="v60-dk">'+esc(V60.KN[b.k]||"")+(cur?' · 지금':'')+'</span>':'')+'<b>'+esc(title)+'</b><small>'+hm2(b.s)+'–'+hm2(b.e)+(ht>=100&&b.note?' · '+esc(b.note):'')+'</small></div>'+(act?'<div class="v60-da">'+act+'</div>':'')+pc+'</div>'; }).join("");
    var bed=T&&T.bed<1440?'<div class="v60-db k-sleep thin" style="top:'+y(T.bed)+'px;height:16px"><div class="v60-dbt"><b>취침</b><small>'+hm2(T.bed)+'</small></div></div>':'';
    var now=(T&&T.d===today())?'<i class="v60-dnow" style="top:'+y(nowM)+'px"><b>'+hm(nowM)+'</b></i>':'';
    var lane=V60.LANE&&T&&V60.laneOf?V60.laneOf(T,rows,places,y,H):null;
    return '<div class="card v60-today"><div class="card-h"><h3>'+esc(V60.dayName?V60.dayName(T?T.d:today()):'오늘')+' '+esc(V60.md(T?T.d:today()))+V60.I("24시간 · 1시간 칸 시간표입니다.\n꽉 찬 칸 = 정해진 일정(수업 · 근무 · 캘린더 · 차편).\n점선 칸 = 제안 — 빈 시간에 앱이 짐작으로 배치한 과제 · 공부 · 식사 · 휴식(확정 아님).\n빈 칸 = 아무것도 없는 시간 · 빗금 = 수면 · 빨간 줄 = 지금.")+'</h3><span class="hs">빈 '+fmtMin(T?T.avail:0)+'</span><div class="ha">'+seg+'</div></div><div class="card-b">'+V60.whereHTML(T)+(lane?lane.route:'')+
      '<div class="v60-day'+(lane?' lane':'')+'"><div class="v60-dhs" style="height:'+H+'px">'+hrs+'</div><div class="v60-dcol" style="height:'+H+'px;background-size:100% '+PXH+'px">'+shade+blks+bed+now+'</div>'+(lane?lane.html:'')+'</div></div></div>';
  };
  V60.DPX=56;

  /* 지금 줄 옮기기 (대표님 10/3 「현재시간 표시」) — 30초마다 위치·시각만. 전체 다시 그리기·캘린더 재조회는 하지 않는다 */
  V60.nowTick=function(){
    if(document.hidden) return; var m=nowMin(), g=V60._g;
    var ln=document.querySelector(".v60-col.today .v60-now"); if(ln&&g){ ln.style.top=((m-g.H0)*g.PX)+"px"; var lb=ln.querySelector("b"); if(lb) lb.textContent=hm(m); }
    $$("[data-v60clock]").forEach(function(s){ var r=V60.runOf(s.getAttribute("data-v60clock")); if(r) s.textContent=V60.clock(V60.runMs(r)); });
    var dn=document.querySelector(".v60-dnow"); if(dn){ dn.style.top=(m/60*V60.DPX)+"px"; var db=dn.querySelector("b"); if(db) db.textContent=hm(m); }
    var nr=document.getElementById("v60NowRow"); if(!nr||!nr.parentNode) return;
    var t=nr.querySelector(".v60-nowt"); if(t) t.textContent=hm(m);
    var trs=nr.parentNode.querySelectorAll(".v60-tr[data-s]"), nx=null;
    for(var i=0;i<trs.length;i++){ var s=+trs[i].getAttribute("data-s"), e=+trs[i].getAttribute("data-e");
      trs[i].classList.toggle("past",e<=m); if(!nx&&s>m) nx=trs[i]; }
    if(!nx) nx=nr.parentNode.querySelector(".v60-tr.bed");
    if(nx&&nr.nextElementSibling!==nx) nr.parentNode.insertBefore(nr,nx);
  };
  if(!V60._nowT) V60._nowT=setInterval(V60.nowTick,30000);
  /* 과제 시계 — 재생 중인 것이 화면에 있을 때만 1초마다 숫자만 바꾼다 */
  if(!V60._clkT) V60._clkT=setInterval(function(){ if(document.hidden) return; var ss=document.querySelectorAll(".v60-tk2.run [data-v60clock]"); for(var i=0;i<ss.length;i++){ var r=V60.runOf(ss[i].getAttribute("data-v60clock")); if(r) ss[i].textContent=V60.clock(V60.runMs(r)); } },1000);

  /* ---------- 오늘의 이동 경로 (대표님 10/2 「오늘만 우측 여백에 일정에 따른 나의 위치 이동, 이동 경로」) ----------
     장소: 수업 = 시간표 강의실(slots.room) · 루틴 = place(설정 place:<제목> 이 있으면 그걸로) · 캘린더 = location.
     식사 · 과제 · 공부 · 휴식은 학교에 있는 동안(첫 학교 일정 ~ 귀가)이면 학교, 아니면 집. */
  V60.BLD={"1공":"제1공학관","2공":"제2공학관","3공":"제3공학관","4공":"제4공학관","5공":"제5공학관"};
  V60.stamp=function(d,m){ var t=d+" "+(Math.floor(m/60)%24<10?"0":"")+(Math.floor(m/60)%24)+":"+(m%60<10?"0":"")+(m%60); if(m>=1440) t=addDays(d,1)+t.slice(10); return t; };
  /* 끝 시각을 모르는 체류(to 없음)는 지금까지만 — 앞으로는 짐작하지 않는다(대표님 10/3) */
  /* 체류 = 대표님 말(plan.json) + 앱 위치(V72) — 우선순위: 말한 짧은 체류(12시간 이하) > 앱 위치 > 긴 숙소 체류 (대표님 10/3) */
  V60.allStays=function(){ var s=((V60.pp&&V60.pp.stays)||[]).slice(); try{ if(window.V72) s=s.concat(V72.stays()); }catch(e){} return s; };
  V60.stayRank=function(x){ if(x.src==="geo") return 1; var h=(new Date((x.to||V60.stamp(today(),nowMin())).replace(" ","T"))-new Date(x.from.replace(" ","T")))/3600000; return h<=12?2:0; };
  V60.stayAt=function(d,m){ var t=V60.stamp(d,m), now=V60.stamp(today(),nowMin());
    return V60.allStays().filter(function(x){ return t>=x.from&&(x.to?t<x.to:t<=now); }).sort(function(a,b){ return V60.stayRank(b)-V60.stayRank(a)||(a.from<b.from?1:-1); })[0]||null; };
  V60.whereHTML=function(T){ if(!T) return ""; var d=T.d, a=d+" 00:00", z=addDays(d,1)+" 00:00", now=V60.stamp(today(),nowMin());
    var ss=V60.allStays().filter(function(x){ return x.from<z&&(x.to||now)>a; });
    var cur=d===today()?V60.stayAt(d,nowMin()):null;
    var long=ss.filter(function(x){ return V60.stayRank(x)===0&&x!==cur; });
    var went=[], seen={}; ((V60.pp&&V60.pp.visits)||[]).filter(function(x){ return x.date===d; }).forEach(function(x){ if(!seen[x.place]){ seen[x.place]=1; went.push(esc(x.t)+' <b>'+esc(x.place)+'</b>'); } });
    ss.filter(function(x){ return V60.stayRank(x)>0&&x.place!=="새 장소"; }).sort(function(p,q){ return p.from<q.from?-1:1; }).forEach(function(x){ if(!seen[x.place]){ seen[x.place]=1; went.push('<b>'+esc(x.place)+'</b>'); } });
    /* 자기 전 타임라인 내보내기 안내 (대표님 10/3) — 22:30 이후 오늘 것을 아직 안 가져왔으면 */
    var tl=(V60.pp&&V60.pp.timeline)||{}, late=d===today()&&nowMin()>=22*60+30&&String(tl.at||"").slice(0,10)!==d;
    var nag=late?'<span class="v60-tln"><b>오늘 타임라인 내보내기</b>'+V60.I("휴대폰 구글 지도 › 프로필 › 내 타임라인 › ⋮ › 설정 › 타임라인 데이터 내보내기 → iCloud Drive › 위치 폴더에 저장.\nPC 가 매시간 확인해서 앱 위치 기록의 시각 오차를 고칩니다(장소 이름은 대표님 말이 우선).")+'</span>':'';
    if(!cur&&!long.length&&!went.length&&!nag) return "";
    return '<div class="v60-where">'+(cur?'<span><small>지금</small><b>'+esc(cur.place)+'</b>'+(cur.sub?' '+esc(cur.sub):'')+'</span>':'')+
      long.map(function(x){ return '<span><small>머무는 곳</small><b>'+esc(x.place)+'</b>'+(x.sub?' '+esc(x.sub):'')+'</span>'; }).join("")+
      (went.length?'<span><small>오늘 간 곳</small>'+went.join(" · ")+'</span>':'')+nag+'</div>'; };
  V60.placeOf=function(b,sch,d){ d=d||today();
    var room=(b.room||"").trim();
    if(b.k==="cls"&&room){ var m=room.match(/^(\d공)\s*(.*)$/); if(m) return {key:m[1],name:V60.BLD[m[1]]||m[1],sub:m[2],campus:1}; return {key:room,name:room,sub:"",campus:1}; }
    if(b.k==="trip") return {key:"trip:"+b.t,name:b.place||b.t,sub:"",campus:0,trip:1};
    if(b.k==="work"||b.k==="ev"){ var pl=(V60.cfg("place:"+V60.norm(b.t),"")||((V60.pp&&V60.pp.places)||{})[V60.norm(b.t)]||b.place||"").trim();
      if(/파쓰쿠찌|파스쿠찌|알바/.test(b.t+pl)) return {key:"알바",name:(pl&&pl!=="학교")?pl:"파쓰쿠찌",sub:"",campus:0};
      if(pl&&pl!=="학교") return {key:pl,name:pl,sub:"",campus:/공학관|학교|캠퍼스/.test(pl)?1:0};
      if(b.school||pl==="학교") return {key:"학교:"+V60.norm(b.t),name:"학교",sub:b.t,campus:1,ask:1};
      return {key:"일정:"+b.t,name:b.t,sub:"",campus:0}; }
    if(b.k==="move") return null;
    var inSchool=sch&&b.s>=sch.s&&b.e<=sch.e;
    if(inSchool) return {key:"학교",name:"학교",sub:b.k==="meal"?"식사":"빈 강의실 · 도서관",campus:1,soft:1};
    var st=V60.stayAt(d,b.s); return st?{key:"stay:"+st.place,name:st.place,sub:st.sub||"",campus:0,home:1}:{key:"집",name:"집",sub:"",campus:0,home:1};
  };
  V60.routeHTML=function(T,nowM){
    if(!T) return "";
    var all=T.blk.filter(function(b){ return b.e>T.wake-1; }).sort(function(a,b){ return a.s-b.s; });
    var sc=all.filter(function(b){ return b.school; }), back=all.filter(function(b){ return b.t==="귀가"; });
    var sch=sc.length?{s:Math.min.apply(null,sc.map(function(b){ return b.s; })),e:back.length?back[back.length-1].s:Math.max.apply(null,sc.map(function(b){ return b.e; }))}:null;
    var stops=[{p:{key:"집",name:"집",sub:"",home:1},s:T.wake,e:T.wake,what:["기상"]}];
    var short=function(t){ return String(t).split(" · ")[0]; };
    all.forEach(function(b){ var p=V60.placeOf(b,sch); if(!p) return; var last=stops[stops.length-1], w=short(b.t);
      if(last.p.key===p.key||(p.soft&&last.p.campus)){ last.e=Math.max(last.e,b.e); if(last.what.indexOf(w)<0) last.what.push(w);
        if(p.sub&&!p.soft&&last.p.sub.split(" → ").indexOf(p.sub)<0){ last.p=Object.assign({},last.p,{sub:last.p.sub?last.p.sub+" → "+p.sub:p.sub}); } }
      else stops.push({p:Object.assign({},p),s:b.s,e:b.e,what:[w]}); });
    var lst=stops[stops.length-1]; if(!lst.p.home) stops.push({p:{key:"집",name:"집",sub:"",home:1},s:lst.e,e:T.bed,what:["취침"]}); else lst.e=Math.max(lst.e,T.bed);
    var hm2=function(m){ var h=Math.floor(m/60)%24, n=m%60; return (h<10?"0":"")+h+":"+(n<10?"0":"")+n; };
    var now=null; stops.forEach(function(x,i){ var nx=stops[i+1]; if(nowM>=x.s&&(!nx||nowM<nx.s)) now=i; });
    var html=stops.map(function(x,i){ var nx=stops[i+1], mv="";
      if(nx){ var gap=nx.s-x.e, lab=(x.p.campus&&nx.p.campus)?(x.p.name===nx.p.name?"강의실 이동":"건물 이동"):(nx.p.home?"귀가":(x.p.home?"등교 · 외출":"이동"));
        mv='<div class="v60-rmv"><i></i><span>'+esc(lab)+(gap>0?' · '+gap+'분':'')+'</span></div>'; }
      return '<div class="v60-rst'+(i===now?' now':'')+(x.p.home?' home':(x.p.campus?' campus':' out'))+'"><span class="v60-rdot">'+(i+1)+'</span><div><div class="v60-rpl"><b>'+esc(x.p.name)+'</b>'+(x.p.sub?' <span>'+esc(x.p.sub)+'</span>':'')+(i===now?' <em>지금</em>':'')+(x.p.ask?' <span class="v60-rask">자리 ❓</span>':'')+'</div>'+
        '<div class="v60-rt">'+hm2(x.s)+(x.e>x.s?'–'+hm2(x.e):'')+'</div><div class="v60-rw">'+x.what.slice(0,6).map(esc).join(' · ')+(x.what.length>6?' 외 '+(x.what.length-6):'')+'</div></div></div>'+mv; }).join("");
    var keys=[]; stops.forEach(function(x){ if(keys.indexOf(x.p.name)<0) keys.push(x.p.name); });
    var W=260, H=Math.max(120,keys.length*46+24), pos={};
    keys.forEach(function(k,i){ var st=stops.filter(function(x){ return x.p.name===k; })[0].p; pos[k]={x:st.home?40:(st.campus?190:110),y:22+i*46}; });
    var d=stops.map(function(x,i){ var p=pos[x.p.name]; return (i?"L":"M")+p.x+","+p.y; }).join(" ");
    var svg='<svg class="v60-rmap" viewBox="0 0 '+W+' '+H+'" width="100%"><rect x="140" y="4" width="116" height="'+(H-8)+'" rx="12" class="camp"/><text x="198" y="'+(H-10)+'" class="cl">학교</text><path d="'+d+'" class="ln"/>'+
      keys.map(function(k){ var p=pos[k], cur=now!=null&&stops[now].p.name===k, r=p.x>150; return '<circle cx="'+p.x+'" cy="'+p.y+'" r="'+(cur?9:6)+'" class="nd'+(cur?' cur':'')+'"/><text x="'+(p.x+(r?-16:14))+'" y="'+(p.y+4)+'" class="nl'+(r?' r':'')+'">'+esc(k.length>8?k.slice(0,8)+"…":k)+'</text>'; }).join("")+'</svg>';
    return '<aside class="v60-route"><div class="v60-rh">이동 경로</div>'+svg+'<div class="v60-rlist">'+html+'</div></aside>';
  };

  /* ---------- ③ 할 일: 앞으로 할 것만 ---------- */
  V60.hookTodo=function(){
    if(V60._todo) return; V60._todo=true;
    var _wk=wkItemHTML;
    wkItemHTML=function(it,mon,td){ if(it.done) return ""; if(it.due&&it.due<(td||today())) return ""; return _wk.apply(this,arguments); };
    var _ta=renderTaskAll;
    renderTaskAll=function(){ _ta.apply(this,arguments);
      var td=today(); $$("#taskAllBox .row-t").forEach(function(r){ var m=(r.textContent||"").match(/D-(\d+)/); if(r.querySelector(".sub2.over")||r.querySelector(".tx.done")||(m&&+m[1]>14)) r.remove(); });   /* 2주 넘게 남은 것은 숨김(대표님 10/2) */
      var hs=$("#taskAllHs"); if(hs) hs.textContent=$$("#taskAllBox .row-t").length+"건";
      var box=$("#taskAllBox .tka"); if(box&&!box.children.length) box.innerHTML='<div class="hint" style="padding:12px 14px">남은 할 일이 없습니다.</div>'; };
  };

  /* ---------- ④ 달력(월): 과제 마감만 ---------- */
  V60.hookCal=function(){
    if(V60._cal2) return; V60._cal2=true;
    renderCalMonth=function(anchor,td){
      var a=D(anchor), y=a.getFullYear(), m=a.getMonth(), lim=addDays(td,14);
      $("#calTitle").textContent=y+"년 "+(m+1)+"월 · 과제 마감";
      var asg=V60.asgs().filter(function(x){ return !x.done&&x.due>=td&&x.due<=lim; });
      var start=sundayOf(iso(new Date(y,m,1)));
      var h='<div class="cal-grid">'+["일","월","화","수","목","금","토"].map(function(d,i){ return '<div class="cal-dow'+(i===0?" sun":i===6?" sat":"")+'">'+d+'</div>'; }).join("");
      for(var i=0;i<42;i++){ var date=addDays(start,i), dd=D(date), out=dd.getMonth()!==m, xs=asg.filter(function(x){ return x.due===date; });
        h+='<div class="cal-cell'+(out?" out":"")+(date===td?" today":"")+'"><span class="cal-dn'+(dd.getDay()===0?" sun":dd.getDay()===6?" sat":"")+'">'+dd.getDate()+'</span>'+
          xs.map(function(x){ var d2=diffDays(td,x.due); return '<span class="cal-ev v60-cev'+(d2<=2?' hot':'')+'">'+esc(x.time)+' '+esc(x.c)+'</span>'; }).join("")+'</div>'; }
      var list=asg.map(function(x){ var d2=diffDays(td,x.due);
        return '<div class="lrow"><span class="v59-dd'+(d2<=2?' hot':'')+'">'+(d2?'D-'+d2:'오늘')+'</span><div class="gr"><div class="t">'+esc(x.c)+' · '+esc(x.t)+'</div><div class="s">'+esc(V60.md(x.due))+' '+esc(x.time)+' · 약 '+dur(x.est)+'</div>'+
          (V60.filesHTML(x)||(ATOM_HOSTED?'':'<div class="s v44-mut">제출 파일은 atom 안에서 열림</div>'))+'</div></div>'; }).join("");
      $("#calBody").innerHTML=h+'</div><div class="v60-callist">'+(list||'<div class="empty">2주 안에 제출할 과제가 없습니다.</div>')+'</div>';
      $("#calHs").textContent="2주 안 마감 "+asg.length;
      var lg=$("#calLegend"); if(lg&&lg.closest(".card")) lg.closest(".card").style.display="none";
      if(window.V58&&!V58.M&&V58.load) V58.load().then(function(){ if(ui.view==="cal") renderCal(); });
      if(V60.files==null) V60.loadFiles().then(function(){ if(ui.view==="cal") renderCal(); });
    };
  };

  /* ---------- 휴강 공지 반영 (교수 공지 → 앱 회차 취소, 한 번만) ---------- */
  V60.CANCEL=[["일반물리학2","2026-10-21","휴강 — 10/2 수업 공지(대표님 전달): 21일 수업 없음"]];
  V60.patchCancel=function(){
    if(typeof S==="undefined"||!S||!S.terms) return; S.v60p=S.v60p||{}; var n=0;
    V60.CANCEL.forEach(function(x){ var k="cancel:"+x[0]+":"+x[1]; if(S.v60p[k]) return;
      var c=courses().filter(function(q){ return q.name===x[0]; })[0]; if(!c) return;
      var ss=sessionOn(c.id,x[1]); if(!ss&&window.V32&&V32.ensureSession) ss=V32.ensureSession(c.id,x[1]); if(!ss) return;
      ss.cancelled=true; if(!ss.memo) ss.memo=x[2]; S.v60p[k]=Date.now(); n++; });
    if(n){ try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){} }
  };
  /* ---------- 커리큘럼(V47) 카드 손보기 (대표님 10/2 「기말고사꺼는 숨기고 중간고사 끝나면 자동으로 펼쳐지게」 「주차별 맵 · 시험 범위 vs 이해 아래 부분 가독성」) ---------- */
  V60.midEnd=function(){ var ds=exams().filter(function(e){ return /중간/.test(e.kind||""); }).map(function(e){ return e.date; }).sort(); return ds.length?ds[ds.length-1]:null; };
  V60.midOver=function(){ var e=V60.midEnd(); return !e||today()>e; };
  V60.fmtWeeks=function(root){
    $$(".v47-wt",root).forEach(function(sp){
      var t=(sp.textContent||"").trim(), wh=sp.closest(".v47-wh"); if(!wh) return;
      var parts=t.split(/\s*→\s*/).filter(function(x){ return x; });
      var ol=document.createElement("ol"); ol.className="v47-steps";
      ol.innerHTML=parts.map(function(p){
        var h=esc(p).replace(/^((?:\d+\.\d+|Ch\.\s?\d+|\d+장)(?:\s*·?\s*(?:\d+\.\d+))*)/,'<b>$1</b>').replace(/\(([^()]*)\)/g,'<small>($1)</small>').replace(/ · /g,'<i>·</i>');
        return '<li>'+h+'</li>'; }).join("");
      sp.remove(); wh.parentNode.insertBefore(ol,wh.nextSibling);
    });
  };
  V60.hookV47=function(){
    if(!window.V47||V47._v60) return; V47._v60=true;
    var hidden=[];
    var _ch=V47.courseHTML;
    V47.courseHTML=function(c,single){
      if(!single&&!V60.midOver()){ var sm=V47.summary(c); if(sm&&sm.scope&&sm.scope.ex&&sm.scope.ex.kind==="기말"){ hidden.push(c.name); return ""; } }
      return _ch.apply(this,arguments);
    };
    var _rs=V47.renderStudy;
    V47.renderStudy=function(){ hidden=[]; _rs.apply(this,arguments); var body=$("#v47Body"); if(!body) return;
      if(hidden.length){ var me=V60.midEnd(), d=document.createElement("div"); d.className="v47-fold";
        d.innerHTML='<span class="chip mut">기말</span> '+esc(hidden.join(" · "))+' <span class="v44-mut">· 중간고사 끝나면('+esc(V60.md(addDays(me,1)))+') 펼침</span>';
        var lg=$(".v47-legend",body); body.insertBefore(d,lg||null); }
      V60.fmtWeeks(body); };
    var _rc=V47.renderCourse;
    V47.renderCourse=function(){ _rc.apply(this,arguments); var k=$("#v47Course"); if(k) V60.fmtWeeks(k); var t=setTimeout(function(){ var k2=$("#v47Course"); if(k2) V60.fmtWeeks(k2); },600); };
  };

  /* ---------- 연결 ---------- */
  var _render=render;
  render=function(){ V60.patchCancel(); V60.hookV47(); V60.hookExam(); V60.hookTodo(); V60.hookCal(); if(window.V59&&!V59._v60){ V59._v60=true; V59.renderPlan=V60.render; } _render.apply(this,arguments); };

  var css=document.createElement("style"); css.id="v60css";
  css.textContent=[
    ".v60-top{display:grid;grid-template-columns:1fr 1.4fr;gap:12px;margin-bottom:12px}",
    ".v60-die,.v60-must{border-radius:16px;padding:12px 14px;background:var(--surface);border:1.5px solid var(--line)}",
    ".v60-die{border-color:#C7261B;background:color-mix(in srgb,#C7261B 6%,var(--surface))}",
    ".v60-h{font-weight:800;font-size:15px;margin-bottom:6px}.v60-die .v60-h{color:#C7261B}",
    ".v60-die ul,.v60-must ol{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px;font-size:14px}",
    ".v60-must li{line-height:1.45}.v60-t{font-weight:800;font-variant-numeric:tabular-nums;margin-right:4px}",
    ".v60-must li.m-hw::marker{color:#C7261B;font-weight:800}.v60-must li.m-st::marker{color:#1E5FA8;font-weight:800}.v60-must li.m-memo::marker{color:#7C3AED;font-weight:800}",
    ".v60-due{font-weight:800;color:#C7261B}.v60-none{color:var(--ink-3);font-size:13.5px}",
    ".v60-files{display:inline-flex;flex-wrap:wrap;gap:4px;margin-left:4px;vertical-align:middle}",
    ".v60-file{display:inline-flex;align-items:center;min-height:30px;padding:2px 10px;border-radius:8px;font-size:12px;font-weight:700;background:color-mix(in srgb,#1E5FA8 10%,var(--surface));color:#1E5FA8;text-decoration:none;border:1px solid color-mix(in srgb,#1E5FA8 30%,transparent)}",
    ".v60-nums{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}.v60-nums span{flex:1 1 120px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:8px 12px}",
    ".v60-nums small{display:block;font-size:11.5px;color:var(--ink-3)}.v60-nums b{font-size:17px;font-variant-numeric:tabular-nums}.v60-nums .warn b{color:#C7261B}",
    ".v60-leg{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;font-size:12px;color:var(--ink-2);margin-bottom:8px}.v60-leg i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:-6px}",
    ".v60-grid{display:grid;grid-template-columns:34px repeat(7,minmax(0,1fr));gap:4px;overflow-x:auto}",
    ".v60-hrs{position:relative;margin-top:42px}.v60-hrs span{position:absolute;right:4px;font-size:10.5px;color:var(--ink-3);transform:translateY(-50%)}",
    ".v60-col{min-width:0}.v60-ch{height:38px;margin-bottom:4px;text-align:center;line-height:1.2}.v60-ch b{font-size:12.5px;display:block}.v60-ch small{font-size:10.5px;color:var(--ink-3)}",
    ".v60-col.today .v60-ch b{color:var(--ac,#2E7D00)}.v60-col.past{opacity:.5}",
    ".v60-cb{position:relative;border-radius:10px;background:repeating-linear-gradient(to bottom,transparent 0,transparent 17.6px,color-mix(in srgb,var(--line) 45%,transparent) 17.6px,color-mix(in srgb,var(--line) 45%,transparent) 18px,transparent 18px,transparent 35.2px,var(--line) 35.2px,var(--line) 36px);border:1px solid var(--line);overflow:hidden}",
    ".v60-leg .k-move{background:#C9D1DC}.v60-legn{margin-left:8px;color:var(--ink-3)}",
    /* 오늘 할 과제 (10/3) */
    ".v60-hs{font-size:12.5px;font-weight:700;color:var(--ink-3);margin-left:6px}",
    ".v60-sec{margin-top:8px}.v60-sech{font-size:12px;font-weight:800;color:var(--ink-3);letter-spacing:.02em;margin:6px 0 2px}.v60-sech small{font-weight:600;margin-left:4px}",
    ".v60-grp{border:1px solid var(--line);border-radius:12px;padding:6px 12px 8px;margin-top:10px;background:var(--surface)}",
    ".v60-grp.die{border-color:color-mix(in srgb,#C7261B 35%,var(--line))}.v60-grp.die .v60-grph b{color:#A31F16}",
    ".v60-grph{display:flex;align-items:baseline;gap:8px;padding:4px 0;border-bottom:1px solid var(--line)}.v60-grph b{font-size:14.5px}.v60-grph span{font-size:12px;color:var(--ink-3)}",
    ".v60-tk2{display:flex;align-items:center;gap:10px;padding:7px 0;border-top:1px dashed var(--line)}.v60-grph+.v60-tk2{border-top:0}",
    ".v60-tk2.run{background:color-mix(in srgb,#58CC02 9%,transparent);border-radius:8px;padding-left:6px;padding-right:4px}.v60-tk2.wait{opacity:.6}",
    ".v60-tkm{flex:1;min-width:0}.v60-tkt{font-size:14px;font-weight:600;line-height:1.4;overflow-wrap:anywhere}.v60-tks{font-size:12px;color:var(--ink-3);margin-top:2px;display:flex;flex-wrap:wrap;align-items:center;gap:2px 4px}",
    ".v60-tks .v60-due{color:var(--ink-2,#444)}.v60-tks .v60-due.hot{color:#C7261B}.v60-tks .v60-est input{width:56px;min-height:28px;padding:2px 4px}",
    ".v60-tka{flex:none;display:flex;align-items:center;gap:6px}.v60-tka .v60-chk{margin-left:2px}",
    ".v60-run{font-size:12px;font-weight:700;color:#1F5A00;font-variant-numeric:tabular-nums;white-space:nowrap}",
    ".v60-ib{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;border:2px solid var(--line);background:var(--surface);color:var(--ink-2,#444);cursor:pointer;padding:0}",
    ".v60-ib:hover{border-color:var(--ink-3)}.v60-ib.play{background:#58CC02;border-color:#46A302;color:#fff}.v60-ib.play:hover{background:#4DB802}.v60-ib.stop{color:#C7261B;border-color:color-mix(in srgb,#C7261B 45%,var(--line))}",
    ".v60-tk2.paused .v60-run{color:var(--ink-3)}.v60-tk2.paused{background:color-mix(in srgb,var(--line) 25%,transparent);border-radius:8px;padding-left:6px;padding-right:4px}",
    ".v60-run{min-width:44px;text-align:right}",
    ".v60-ck{display:flex!important;align-items:center;gap:8px;flex-direction:row!important}",
    ".v60-db.k-hw{background:#C7261B}.v60-db.k-st{background:#1E5FA8}.v60-db.k-memo{background:#7C3AED}",
    /* 제안 칸(짐작 · 자동 배정) = 옅은 색 채움 + 왼쪽 색 띠 — 확정 일정(진한 색)과 진하기로만 구분 (10/3, 점선은 지저분하다는 대표님 지적으로 교체) */
    ".v60-db.sug,.v60-b.sug{--c:#7A869A;background:color-mix(in srgb,var(--c) 13%,var(--surface,#fff))!important;color:color-mix(in srgb,var(--c) 85%,#000)!important;box-shadow:inset 3px 0 0 var(--c)!important;border:0!important}",
    ".v60-db.sug.k-hw,.v60-b.sug.k-hw{--c:#C7261B}.v60-db.sug.k-st,.v60-b.sug.k-st{--c:#1E5FA8}.v60-db.sug.k-memo,.v60-b.sug.k-memo{--c:#7C3AED}.v60-db.sug.k-meal,.v60-db.sug.k-life,.v60-b.sug.k-meal,.v60-b.sug.k-life{--c:#6E9A57}",
    ".v60-db.sug .v60-dbt small,.v60-b.sug small{opacity:.75}.v60-db.sug .v60-dp{background:color-mix(in srgb,var(--c) 12%,transparent)!important}",
    ".v60-b.sug{left:2px;right:2px}",
    /* 오늘 시간표 = 예전 목록 디자인 느낌 (10/3) — 흰 칸 · 얇은 색 띠 · 작은 종류 이름 · 오른쪽 초록 장소 줄 · 검은 지금 줄 */
    ".v60-day .v60-db{--c:#7A869A;background:var(--surface,#fff)!important;color:var(--ink,#1d1d1f)!important;box-shadow:inset 4px 0 0 var(--c)!important;border:1px solid color-mix(in srgb,var(--line) 75%,transparent)!important;border-radius:8px;padding:5px 12px 5px 16px;left:4px;right:4px}",
    ".v60-day .v60-db.k-cls{--c:#5B6B8C}.v60-day .v60-db.k-work{--c:#C26A12}.v60-day .v60-db.k-ev{--c:#7A869A}.v60-day .v60-db.k-trip{--c:#8A5A2B}.v60-day .v60-db.k-meal,.v60-day .v60-db.k-life{--c:#9CB78B}.v60-day .v60-db.k-move{--c:#B8C2CF}.v60-day .v60-db.k-hw{--c:#C7261B}.v60-day .v60-db.k-st{--c:#1E5FA8}.v60-day .v60-db.k-memo{--c:#7C3AED}.v60-day .v60-db.k-sleep{--c:#7C86A0}.v60-day .v60-db.k-stay{--c:#0E7C7B}",
    ".v60-day .v60-db.sug{background:color-mix(in srgb,var(--c) 5%,var(--surface,#fff))!important;box-shadow:inset 4px 0 0 color-mix(in srgb,var(--c) 55%,transparent)!important}.v60-day .v60-db.sug .v60-dbt b{color:var(--ink-2,#444)}",
    ".v60-day .v60-db.past{opacity:.5}.v60-day .v60-db.cur{outline:2px solid #1d1d1f;outline-offset:0}",
    ".v60-dk{display:block;font-size:11px;color:var(--ink-3);line-height:1.25;margin-bottom:1px}",
    ".v60-day .v60-dbt b{font-size:14px;font-weight:700;line-height:1.35;white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}",
    ".v60-day .v60-db.thin .v60-dbt b{-webkit-line-clamp:1;font-size:12.5px}.v60-day .v60-dbt small{color:var(--ink-3);opacity:1;font-size:11.5px}",
    /* 높이별 글자 양 (10/4) — 한 줄짜리는 줄바꿈 없이 말줄임, 선은 글자 없음 */
    ".v60-day .v60-db.mid{padding-top:3px;padding-bottom:3px}",
    ".v60-day .v60-db.thin{padding-top:0;padding-bottom:0;align-items:center}.v60-day .v60-db.thin .v60-dbt b{font-size:12px;line-height:1.2}.v60-day .v60-db.thin .v60-dbt small{line-height:1.2;font-size:11px}.v60-day .v60-db.thin .v60-dbt{line-height:1.2}",
    ".v60-day .v60-db.thin .v60-dbt{display:flex;align-items:baseline;gap:8px;min-width:0;white-space:nowrap;overflow:hidden}",
    ".v60-day .v60-db.thin .v60-dbt b,.v60-day .v60-db.mid .v60-dbt b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;-webkit-line-clamp:unset;min-width:0}",
    ".v60-day .v60-db.thin .v60-dbt small{flex:none}",
    ".v60-day .v60-db.line{padding:0;border-radius:3px;border:0!important;box-shadow:none!important;background:color-mix(in srgb,var(--c) 55%,transparent)!important}",
    ".v60-day .v60-dbt{overflow:hidden;min-width:0;flex:1}",
    ".v60-da{flex:none;display:flex;gap:6px;align-items:flex-start;flex-wrap:nowrap}.v60-da .v60-chk{margin-left:0}.v60-da .v60-files{flex-wrap:nowrap;margin:0}",
    ".v60-day .v60-db .v60-dp:empty,.v60-day .v60-db .v60-dp.same{display:none}",
    "@media (max-width:600px){.v60-da .v60-files{display:none}}",
    ".v60-day .v60-db .v60-dp{background:none!important;border:0!important;border-left:2px solid #9CB78B!important;border-radius:0;color:var(--ink-2,#444)!important;padding:0 0 0 10px;align-self:stretch;max-width:36%;font-size:12.5px;display:flex;align-items:flex-start}",
    "@media (max-width:600px){.v60-day .v60-db .v60-dp{display:none}}",
    ".v60-day .v60-dp *{color:var(--ink-2,#444)!important}.v60-day .v60-dp small{color:var(--ink-3)!important}",
    ".v60-day .v60-dnow{background:#1d1d1f;height:2px}.v60-day .v60-dnow b{background:#1d1d1f;color:#fff;border-radius:99px;padding:1px 8px;top:-9px;left:4px;font-size:11px}",
    ".v60-tln{display:inline-flex;align-items:center;color:#B45309}.v60-tln b{font-weight:800}",
    ".v60-where{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:13px;margin:0 0 10px;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,var(--line) 30%,transparent)}.v60-where small{color:var(--ink-3);margin-right:6px;font-size:11.5px}",
    ".v60-tks .v60-est{white-space:nowrap;display:inline-flex;align-items:center;gap:3px}",
    /* 오늘 24시간 시간표 (10/3) — 1시간 = 56px(V60.DPX), 30분은 칸 가운데 옅은 선 */
    ".v60-day{display:grid;grid-template-columns:52px 1fr;gap:6px;margin-top:4px}",
    ".v60-dhs{position:relative}.v60-dhs span{position:absolute;right:4px;transform:translateY(-50%);font-size:11.5px;color:var(--ink-3);font-variant-numeric:tabular-nums}.v60-dhs span:first-child{transform:none}",
    ".v60-dcol{position:relative;border:1px solid var(--line);border-radius:10px;overflow:hidden;background-image:linear-gradient(to bottom,transparent 0,transparent 27.6px,color-mix(in srgb,var(--line) 45%,transparent) 27.6px,color-mix(in srgb,var(--line) 45%,transparent) 28px,transparent 28px,transparent 55.2px,var(--line) 55.2px,var(--line) 56px);background-repeat:repeat-y}",
    ".v60-dsl{position:absolute;left:0;right:0;background:repeating-linear-gradient(135deg,color-mix(in srgb,var(--line) 35%,transparent) 0 6px,transparent 6px 12px)}",
    ".v60-db{position:absolute;left:6px;right:6px;border-radius:8px;padding:4px 10px;display:flex;justify-content:space-between;gap:10px;overflow:hidden;color:#fff;box-shadow:0 1px 0 rgba(0,0,0,.08)}",
    ".v60-db.past{opacity:.55}.v60-db.cur{outline:2.5px solid #1d1d1f;outline-offset:1px}",
    ".v60-dbt{min-width:0}.v60-dbt b{display:block;font-size:13.5px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v60-dbt small{display:block;font-size:11.5px;opacity:.9}",
    ".v60-db.thin{padding:0 10px;align-items:center}.v60-db.thin .v60-dbt{display:flex;gap:8px;align-items:baseline}.v60-db.thin .v60-dbt b{font-size:12px}.v60-db.thin .v60-dbt small{font-size:11px}",
    ".v60-db.k-cls{background:#5B6B8C}.v60-db.k-work{background:#C26A12}.v60-db.k-ev{background:#7A869A}.v60-db.k-trip{background:#8A5A2B}.v60-db.k-meal,.v60-db.k-life{background:#9CB78B}.v60-db.k-move{background:#C9D1DC;color:#223}.v60-db.k-sleep{background:#3B4256}",
    ".v60-dp{flex:none;background:rgba(255,255,255,.18)!important;border:0!important;color:inherit!important;border-radius:6px;padding:1px 8px;font-size:11.5px;align-self:flex-start;max-width:45%}.v60-dp *{color:inherit!important}.v60-dp i{display:none}",
    ".v60-dnow{position:absolute;left:-2px;right:-2px;height:2.5px;background:#E5484D;z-index:5;pointer-events:none}.v60-dnow b{position:absolute;left:4px;top:-17px;font-size:11px;color:#E5484D;background:var(--surface);padding:0 4px;border-radius:4px}",
    "@media (max-width:600px){.v60-tk2{flex-wrap:wrap}.v60-tkm{flex-basis:100%}.v60-tka{margin-left:auto}.v60-grp.die .v60-tk2{flex-wrap:nowrap}.v60-grp.die .v60-tkm{flex-basis:auto}}",
    ".v60-col.today .v60-cb{border-color:var(--ac,#4F9A35);box-shadow:0 0 0 1px var(--ac,#4F9A35)}",
    ".v60-sleep{position:absolute;left:0;right:0;background:repeating-linear-gradient(135deg,rgba(60,70,100,.10) 0 6px,rgba(60,70,100,.04) 6px 12px)}",
    ".v60-b{position:absolute;left:2px;right:2px;border-radius:6px;padding:1px 4px;overflow:hidden;font-size:10.5px;line-height:1.2;color:#fff;border:1px solid rgba(0,0,0,.06)}",
    ".v60-b span{display:block;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v60-b small{font-size:9.5px;opacity:.85}",
    ".v60-b.k-trip,.v60-tb.k-trip{background:#8A5A2B}.v60-b.k-cls,.v60-leg .k-cls{background:#5B6B8C}.v60-b.k-work,.v60-leg .k-work{background:#C26A12}.v60-b.k-ev,.v60-leg .k-ev{background:#7A869A}.v60-b.k-meal,.v60-b.k-life,.v60-leg .k-meal{background:#9CB78B}.v60-b.k-move{background:#C9D1DC}.v60-b.k-hw,.v60-leg .k-hw{background:#C7261B}.v60-b.k-st,.v60-leg .k-st{background:#1E5FA8}.v60-b.k-memo,.v60-leg .k-memo{background:#7C3AED}",
    ".v60-b.k-move{color:#334}.v60-now{position:absolute;left:-3px;right:-3px;height:3px;margin-top:-1px;background:#1d1d1f;box-shadow:0 0 0 1.5px #fff;border-radius:2px;z-index:6;pointer-events:none}.v60-now b{position:absolute;right:2px;top:-9px;font-style:normal;font-weight:800;font-size:10.5px;line-height:1;font-variant-numeric:tabular-nums;color:#fff;background:#1d1d1f;border:1.5px solid #fff;border-radius:8px;padding:2px 5px}.v60-nowrow{display:flex;align-items:center;gap:10px;margin:4px 0;color:#1d1d1f}.v60-nowt{flex:none;font-weight:800;font-size:13px;font-variant-numeric:tabular-nums;background:#1d1d1f;color:#fff;border-radius:10px;padding:3px 9px}.v60-nowl{flex:1;height:3px;border-radius:2px;background:#1d1d1f;position:relative}.v60-nowl::before{content:'';position:absolute;left:-4px;top:-3.5px;width:10px;height:10px;border-radius:50%;background:#1d1d1f}",
    ".v60-hw .v60-est{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;color:var(--ink-2);margin:0 8px;white-space:nowrap}.v60-hw .v60-est input{width:62px;min-height:36px;border:1px solid var(--line);border-radius:8px;padding:0 6px;font:inherit}",
    ".v60-hw.done .t{text-decoration:line-through;color:var(--ink-3)}.v60-warn{color:#C7261B}",
    ".v60-set{margin:4px 0 20px}.v60-set summary{cursor:pointer;font-weight:700;min-height:44px;display:flex;align-items:center}.v60-sf{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.v60-sf label{display:flex;flex-direction:column;font-size:12.5px;gap:3px}",
    ".v60-add{display:grid;grid-template-columns:130px 1fr 140px 110px 80px auto;gap:6px;padding:10px 12px}.v60-add .input{min-height:42px}",
    "@media (max-width:760px){.v60-add{grid-template-columns:1fr 1fr}.v60-add #v60aT{grid-column:1/-1}}",
    ".v60-tr{display:grid;grid-template-columns:64px 6px minmax(0,1fr) 210px;gap:10px;align-items:stretch;padding:4px 0;min-height:44px}",
    ".v60-thead{display:grid;grid-template-columns:64px 6px minmax(0,1fr) 210px;gap:10px;font-size:11.5px;font-weight:800;color:var(--ink-3);padding:0 0 6px;border-bottom:1px solid var(--line);margin-bottom:4px}",
    ".v60-tp{display:flex;align-items:center;gap:6px;padding:6px 10px;border-left:3px solid transparent;font-size:13px;min-width:0}",
    ".v60-tp.home{border-left-color:#9CB78B}.v60-tp.campus{border-left-color:#1E5FA8}.v60-tp.out{border-left-color:#C26A12}",
    ".v60-tpn{font-weight:800;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.v60-tpn small{font-weight:600;color:var(--ink-2);font-size:12px}",
    ".v60-tp.same{padding-top:0;padding-bottom:0}.v60-tp.same i{display:block;width:2px;align-self:stretch;margin-left:6px;background:currentColor;opacity:.25}",
    ".v60-tp.same.home i{color:#9CB78B;opacity:.6}.v60-tp.same.campus i{color:#1E5FA8;opacity:.5}.v60-tp.same.out i{color:#C26A12;opacity:.5}",
    ".v60-tp.mv{color:#C7261B;font-weight:700;font-size:12.5px;border-left:3px dashed #C7261B;flex-wrap:wrap}.v60-tp.mv b{font-size:14px}",
    "@media (max-width:700px){.v60-tr{grid-template-columns:52px 5px minmax(0,1fr)}.v60-thead{display:none}.v60-tp{grid-column:3;padding:0 0 4px 0;border-left:0;font-size:12px}.v60-tp.same{display:none}.v60-tt{font-size:13px}}",
    ".v60-tt{font-weight:800;font-variant-numeric:tabular-nums;font-size:14px;line-height:1.2;padding-top:6px}.v60-tt small{display:block;font-weight:600;font-size:11.5px;color:var(--ink-3)}",
    ".v60-tb{border-radius:4px}.v60-tb.k-cls{background:#5B6B8C}.v60-tb.k-work{background:#C26A12}.v60-tb.k-ev{background:#7A869A}.v60-tb.k-meal,.v60-tb.k-life{background:#9CB78B}.v60-tb.k-move{background:#C9D1DC}.v60-tb.k-hw{background:#C7261B}.v60-tb.k-st{background:#1E5FA8}.v60-tb.k-memo{background:#7C3AED}.v60-tb.k-sleep{background:repeating-linear-gradient(135deg,#8A93A8 0 4px,#C9CFDB 4px 8px)}",
    ".v60-tx{padding:6px 0;border-bottom:1px solid var(--line);display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;font-size:14.5px}.v60-tx b{font-weight:700}",
    ".v60-tk{font-size:11px;font-weight:800;color:var(--ink-3);width:100%}",
    ".v60-tr.past{opacity:.45}.v60-tr.cur .v60-tx{background:color-mix(in srgb,var(--ac,#4F9A35) 10%,transparent);border-radius:8px;padding-left:8px}.v60-tr.cur .v60-tk{color:var(--ac,#2E7D00)}",
    ".v60-tday{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:18px;align-items:start}.v60-tlist{min-width:0}",
    ".v60-route{position:sticky;top:70px;border:1px solid var(--line);border-radius:14px;padding:10px 12px;background:var(--surface)}",
    ".v60-rh{font-weight:800;font-size:14px;margin-bottom:6px}",
    ".v60-rmap{display:block;margin-bottom:8px}.v60-rmap .camp{fill:color-mix(in srgb,#1E5FA8 6%,transparent);stroke:color-mix(in srgb,#1E5FA8 30%,transparent);stroke-dasharray:4 3}.v60-rmap .cl{font-size:10px;fill:#1E5FA8;text-anchor:middle;font-weight:700}",
    ".v60-rmap .ln{fill:none;stroke:#C7261B;stroke-width:2.2;stroke-linejoin:round;stroke-dasharray:6 4}.v60-rmap .nd{fill:#fff;stroke:#1F2A44;stroke-width:2}.v60-rmap .nd.cur{fill:#4F9A35;stroke:#2E7D00}",
    ".v60-rmap .nl{font-size:11px;fill:var(--ink,#1F2A44);font-weight:700}.v60-rmap .nl.r{text-anchor:end}",
    ".v60-rst{display:grid;grid-template-columns:24px 1fr;gap:8px;padding:6px 0}.v60-rdot{width:22px;height:22px;border-radius:50%;background:var(--surface-2);font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center}",
    ".v60-rst.campus .v60-rdot{background:#1E5FA8;color:#fff}.v60-rst.home .v60-rdot{background:#9CB78B;color:#fff}.v60-rst.out .v60-rdot{background:#C26A12;color:#fff}",
    ".v60-rst.now{background:color-mix(in srgb,var(--ac,#4F9A35) 10%,transparent);border-radius:10px;padding:6px}",
    ".v60-rpl{font-size:13.5px}.v60-rpl span{font-size:12px;color:var(--ink-2)}.v60-rpl em{font-style:normal;font-size:11px;font-weight:800;color:#fff;background:var(--ac,#4F9A35);border-radius:6px;padding:0 6px;margin-left:2px}",
    ".v60-rask{color:#B45309!important;font-weight:700}",
    ".v60-rt{font-size:12px;font-weight:700;font-variant-numeric:tabular-nums}.v60-rw{font-size:11.5px;color:var(--ink-3);line-height:1.4}",
    ".v60-rmv{display:flex;align-items:center;gap:8px;padding-left:10px;font-size:11px;color:#C7261B;font-weight:700}.v60-rmv i{width:2px;height:16px;background:repeating-linear-gradient(#C7261B 0 4px,transparent 4px 7px)}",
    "@media (max-width:900px){.v60-tday{grid-template-columns:1fr}.v60-route{position:static}}",
    ".v60-note{font-size:12px;font-weight:700;color:#C7261B;background:color-mix(in srgb,#C7261B 8%,transparent);border-radius:6px;padding:1px 7px}",
    ".v47-steps{margin:6px 0 4px;padding-left:20px;font-size:13.5px;line-height:1.6;color:var(--ink)}.v47-steps li{margin:2px 0;padding-left:2px}.v47-steps li::marker{content:'→ ';color:var(--ink-3)}.v47-steps li:first-child::marker{content:'• '}",
    ".v47-steps b{font-weight:800}.v47-steps small{color:var(--ink-3);font-size:12px}.v47-steps i{font-style:normal;color:var(--ink-3);margin:0 3px}",
    ".v47-wk{padding:10px 12px!important;margin:6px 0;border:1px solid var(--line)!important;border-radius:12px}.v47-wk.scope{border-left:4px solid var(--accent)!important}",
    ".v47-wh{font-size:14px!important}.v47-wh b{font-size:15px}.v47-wh .v47-wmap{margin-left:auto}",
    ".v47-nodes{margin-top:8px!important;padding-top:8px;border-top:1px dashed var(--line)}.v47-n{font-size:12.5px!important;padding:4px 10px!important}",
    ".v47-fold{padding:10px 12px;font-size:13px;border-top:1px solid var(--line)}",
    "#v-study .v47-n{color:#E6ECF5;background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.2)}#v-study .v47-n.st-known{background:rgba(88,204,2,.2);border-color:#58CC02;color:#EAF8DD}",
    "#v-study .v47-steps{color:#E6ECF5}#v-study .v47-wk{border-color:rgba(255,255,255,.14)!important}#v-study .v47-legend .v44-mut,#v-study .v47-fold .v44-mut{color:#AEB8CC}",
    ".v60-chk{display:inline-block;width:26px;height:26px;border:2px solid var(--ink-3,#8a93a8);border-radius:7px;background:var(--surface);vertical-align:middle;margin-left:6px;cursor:pointer;padding:0;position:relative}",
    ".v60-chk:hover{border-color:var(--ac,#4F9A35)}.v60-chk.on{background:var(--ac,#4F9A35);border-color:var(--ac,#4F9A35)}.v60-chk.on::after{content:'';position:absolute;left:7px;top:2px;width:7px;height:13px;border:solid #fff;border-width:0 3px 3px 0;transform:rotate(45deg)}",
    ".v60-donel{margin-top:10px;padding-top:8px;border-top:1px dashed var(--line);display:flex;flex-direction:column;gap:4px}.v60-dn{display:flex;align-items:center;gap:8px;font-size:13.5px;color:var(--ink-3)}.v60-dn .v60-chk{margin-left:0}",
    ".v60-li{display:flex;align-items:center;gap:10px}.v60-lm{flex:1;min-width:0}.v60-la{flex:none;display:flex;align-items:center;gap:6px;flex-wrap:nowrap;justify-content:flex-end}",
    ".v60-la .v60-files{margin-left:0}.v60-la .v60-chk{margin-left:2px}",
    "@media (max-width:600px){.v60-li{flex-wrap:wrap}.v60-la{margin-left:auto}}",
    ".v60-sh{font-weight:800;font-size:13px;margin:12px 0 6px}.v60-ok{border-color:var(--ok,#15803D)!important;color:var(--ok,#15803D)!important}",
    ".v60-callist{margin-top:12px;display:flex;flex-direction:column;gap:6px}",
    ".v60-cev{background:#1E5FA8!important;color:#fff!important}.v60-cev.hot{background:#C7261B!important}",
    "@media (max-width:900px){.v60-top{grid-template-columns:1fr}}",
    ".v60-top.one{grid-template-columns:1fr}",
    ".v60-tk2.urgent{background:color-mix(in srgb,#C7261B 9%,transparent);border-left:4px solid #C7261B;border-radius:8px;padding-left:8px;padding-right:4px}.v60-tk2.urgent .v60-tkt{color:#B3170E;font-weight:800}",
    ".v60-grp.hot>.v60-grph b{color:#C7261B}.v60-hotn{font-size:12px;font-weight:800;color:#fff;background:#C7261B;border-radius:99px;padding:2px 9px;margin-left:4px;vertical-align:middle}",
    "@media (max-width:600px){.v60-grid{grid-template-columns:28px repeat(7,minmax(46px,1fr))}.v60-b span{font-size:9.5px}.v60-b small{display:none}.v60-sf{grid-template-columns:1fr 1fr}.v60-hw{flex-wrap:wrap}}"
  ].join("\n");
  document.head.appendChild(css);
})();
