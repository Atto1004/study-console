/* ============================================================
   V60 LAYER — 대표님 2026-10-02 두 번째 요청 (BUILD 2026-10-02.102)
   ① 학습 탭 「중간고사 대비」 → 「시험 모드 · 중간고사」: 미적2 · 공수1 · 정역학 · 일물2 · CADD 다섯 과목만. CADD 는 암기 페이지(notes/memo/cadd.html)
   ② 공부계획 탭 = 얼라이브위크형 주간 격자. 고정 일정(수업 · 근무 루틴 · 캘린더 일정 · 활동 블록) + 수면 · 준비 · 식사 · 이동을 빼고 남은 빈 시간에
      과제(마감 이른 순, 마감 전) → 오늘 수업 복습(이해) → 밀린 회차(미적2 · 공수1 · 정역학 · 일물2, 시험 가까운 순 번갈아) → CADD 암기 순으로 배정.
      맨 위 「오늘 죽어도」(마감 내일까지) · 「오늘 무조건」(오늘 배정) · 가용/계획/실제 공부 시간 · 과제 목록(예상 시간 고치기 · 끝냄) · 진도
   ③ 할 일 탭: 지난 것·끝난 것 숨김 — 앞으로 할 것만
   ④ 달력(월): 제출 안 한 과제 마감만, 2주 안 · 옆에 제출 파일(atom 안에서만 열림 — _private/submit.json, 공개 저장소 제외)
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
    if(V60._sl||!ATOM_HOSTED) return Promise.resolve(); V60._sl=1;
    return fetch("_private/sleep.json",{cache:"no-cache"}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }).then(function(j){
      if(!j) return; var st=V60.st(), n=0; st.sleep=st.sleep||{}; Object.keys(j).forEach(function(d){ if(!st.sleep[d]&&j[d]&&j[d].wake){ st.sleep[d]={bed:j[d].bed||"",wake:j[d].wake}; n++; } }); if(n) persist(); });
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
    var fs=V60.filesFor(a); if(!fs.length) return "";
    return '<span class="v60-files">'+fs.map(function(f){ return '<a class="v60-file" href="'+esc(f.file)+'" target="_blank" rel="noopener">'+esc(f.label)+'</a>'; }).join("")+'</span>';
  };
  V60.EST={"공업수학1":60,"정역학":90,"아카데믹글쓰기":60,"CADD":120,"일반물리학2":90,"미분적분학2":90};
  V60.key=function(a){ return a.c+"|"+a.t; };
  V60.asgs=function(){
    var out=[], M=window.V58&&V58.M&&V58.M.courses, st=V60.st(); if(!M) return out;
    Object.keys(M).forEach(function(n){ (M[n].assignments||[]).forEach(function(a){
      if(!a.due) return; var s=a.lms_state||a.status||"";
      if(/제출|완료/.test(s)&&!/미제출/.test(s)) return;
      var o={c:n,t:a.title||"과제",due:a.due.slice(0,10),time:a.due.length>10?a.due.slice(11,16):"23:59",st:s};
      o.k=V60.key(o); o.est=+(st.est[o.k]||V60.EST[n]||60); o.done=!!st.done[o.k];
      out.push(o);
    }); });
    /* 직접 넣은 할 일(공부계획 「+ 추가」) · 대표님이 말로 준 할 일(_private/tasks.json, atom 안에서만) */
    (st.extra||[]).concat(V60.priv||[]).forEach(function(x){ if(!x||!x.t||!x.due) return;
      var o={c:x.c||"기타",t:x.t,due:x.due,time:x.time||"23:59",st:"",own:1,id:x.id||""};
      o.k=V60.key(o); o.est=+(st.est[o.k]||x.est||60); o.done=!!st.done[o.k]; out.push(o); });
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
      out.push({s:toMin(x.s),e:e,t:x.c.name,k:"cls",school:1});
    });
    ((R.grid||{})[V60.DOWK[D(d).getDay()]]||[]).forEach(function(t){
      if(t.validFrom&&d<t.validFrom) return; if(t.validUntil&&d>t.validUntil) return; if((t.exdate||[]).indexOf(d)>=0) return;
      if(rh&&(rh.affects||[]).indexOf(t.kind)>=0) return;
      out.push({s:toMin(t.start),e:toMin(t.end),t:t.title,k:"work",school:t.place==="학교"?1:0});
    });
    (gcalOn(d)||[]).forEach(function(ev){ var t=String(ev.title||"");
      if(/공부|학습|과제|자습/.test(t)) return;                         /* 공부 블록은 여기서 다시 계획한다 */
      if(/기상|준비|이동|귀가/.test(t)) return;                          /* 준비·이동은 아래 규칙으로 */
      out.push({s:toMin(ev.start),e:toMin(ev.end)||1440,t:t,k:/알바|근무|근로/.test(t)?"work":"ev"}); });
    plansOn(d).filter(function(p){ return p.activity; }).forEach(function(p){ out.push({s:toMin(p.s),e:toMin(p.e),t:p.kind||"활동",k:"ev"}); });
    return V60.merge(out.filter(function(b){ return b.e>b.s; }));
  };
  /* 같은 일정은 하나로 (대표님 10/2 「근로장학같이 하나의 일정은 하나로 합쳐」) — 루틴 · 캘린더 · 쪼개진 블록(점심 전후 등)이 겹치거나 90분 안에 이어지면 한 블록 */
  V60.norm=function(t){ return String(t||"").replace(/[^0-9A-Za-z가-힣]/g,"").replace(/(오전|오후|점심|근무|\d+)$/,""); };
  V60.same=function(a,b){ var x=V60.norm(a), y=V60.norm(b); return !!x&&!!y&&(x===y||x.indexOf(y)===0||y.indexOf(x)===0); };
  V60.merge=function(arr){
    arr.sort(function(a,b){ return a.s-b.s; }); var out=[];
    arr.forEach(function(b){
      var m=null; for(var i=out.length-1;i>=0;i--){ var o=out[i]; if(V60.same(o.t,b.t)&&b.s<=o.e+90){ m=o; break; } }
      if(m){ m.e=Math.max(m.e,b.e); m.s=Math.min(m.s,b.s); if(b.k==="work"||m.k==="work") m.k=m.k==="cls"?"cls":"work"; m.school=m.school||b.school; if(V60.norm(b.t).length<V60.norm(m.t).length) m.t=b.t; }
      else out.push({s:b.s,e:b.e,t:b.t,k:b.k,school:b.school});
    });
    return out.sort(function(a,b){ return a.s-b.s; });
  };
  function free(iv,busy){   /* iv=[s,e] 에서 busy 빼기 */
    var res=[[iv[0],iv[1]]];
    busy.forEach(function(b){ var nx=[]; res.forEach(function(r){ if(b.e<=r[0]||b.s>=r[1]){ nx.push(r); return; } if(b.s>r[0]) nx.push([r[0],b.s]); if(b.e<r[1]) nx.push([b.e,r[1]]); }); res=nx; });
    return res.filter(function(r){ return r[1]-r[0]>0; });
  }
  V60.day=function(d,nowM){
    var fx=V60.fixed(d), R=V60.R||{}, bed=toMin(V60.cfg("bed","01:00")), sleepH=+V60.cfg("sleepH",(S.profile&&S.profile.sleepH)||7);
    var bedAbs=bed<6*60?bed+1440:bed;                                      /* 취침 01:00 = 그날 25:00 */
    var prep=+(R.prep||60), mv=R.moves||{toSchool:10,toHome:20};
    var sch=fx.filter(function(b){ return b.school; });
    var wakeNat=(bedAbs-1440)+sleepH*60;                                   /* 전날 취침 + 수면 */
    var first=fx.length?fx[0].s:null, need=first!=null?first-(sch.length&&sch[0].s===first?mv.toSchool:0)-prep:null;
    var wake=Math.max(5*60,need!=null?Math.min(wakeNat,need):wakeNat), short=need!=null&&need<wakeNat, slept=null;
    var sl=V60.sleepOf(d);                                                 /* 실제 수면 기록이 있으면 그 기상 시각 */
    if(sl&&sl.wake){ wake=toMin(sl.wake); if(sl.bed){ var bm=toMin(sl.bed); slept=wake>=bm?wake-bm:wake+1440-bm; short=slept<7*60; } }
    var blk=fx.slice();
    blk.push({s:wake,e:wake+prep,t:"기상·준비",k:"life"});
    var home=null;
    if(sch.length){ var ss=sch.slice().sort(function(a,b){ return a.s-b.s; });
      blk.push({s:ss[0].s-mv.toSchool,e:ss[0].s,t:"이동",k:"move"});
      for(var q=0;q+1<ss.length;q++){ var gap=ss[q+1].s-ss[q].e; if(gap>0&&gap<=+V60.cfg("moveGap",30)) blk.push({s:ss[q].e,e:ss[q+1].s,t:"이동",k:"move"}); }   /* 붙어 있는 수업 사이 = 이동 */
      var lastE=Math.max.apply(null,ss.map(function(b){ return b.e; })); blk.push({s:lastE,e:lastE+mv.toHome,t:"귀가",k:"move"}); home=lastE+mv.toHome; }
    var dinLen=+V60.cfg("dinnerMin",60), rest=+V60.cfg("restMin",30), dinDone=false;
    if(home!=null&&home>=16*60&&home<=20*60){                               /* 집에 오면 바로 저녁 → 쉬고 나서 공부 (대표님 10/2) */
      var ds=Math.ceil(home/5)*5; if(!blk.some(function(b){ return b.s<ds+dinLen&&b.e>ds&&b.k!=="move"; })){ blk.push({s:ds,e:ds+dinLen,t:"저녁",k:"meal"}); if(rest>0) blk.push({s:ds+dinLen,e:ds+dinLen+rest,t:"휴식",k:"life"}); dinDone=true; } }
    [["lunch","12:00",60,"점심",11*60+30,14*60],["dinner","18:30",60,"저녁",17*60+30,20*60+30]].forEach(function(m){
      if(m[0]==="dinner"&&dinDone) return;
      var len=+V60.cfg(m[0]+"Min",m[2]), at=toMin(V60.cfg(m[0],m[1])), lo=m[4], hi=m[5], done=false;
      for(var s=at;s<=hi-len&&!done;s+=15){ if(!blk.some(function(b){ return b.s<s+len&&b.e>s; })){ blk.push({s:s,e:s+len,t:m[3],k:"meal"}); if(m[0]==="dinner"&&rest>0) blk.push({s:s+len,e:s+len+rest,t:"휴식",k:"life"}); done=true; } }
      for(var s2=at-15;s2>=lo&&!done;s2-=15){ if(!blk.some(function(b){ return b.s<s2+len&&b.e>s2; })){ blk.push({s:s2,e:s2+len,t:m[3],k:"meal"}); done=true; } }
    });
    blk.sort(function(a,b){ return a.s-b.s; });
    var start=wake, end=bedAbs;
    if(nowM!=null) start=Math.max(start,Math.ceil(nowM/5)*5);
    var slots=start<end?free([start,end],blk.filter(function(b){ return b.k!=="life"||true; })):[];
    slots=slots.filter(function(r){ return r[1]-r[0]>=25; });
    var avail=slots.reduce(function(a,r){ return a+(r[1]-r[0]); },0);
    return {d:d,blk:blk,wake:wake,bed:bedAbs,short:short,slept:slept,slots:slots,avail:avail};
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
    var hw=asg.filter(function(a){ return !a.done&&a.due>=td; }).map(function(a){ return {kind:"hw",a:a,left:a.est,dueAbs:a.due+" "+a.time}; });
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
        var cap=+V60.cfg("maxStudy",300)-(d===td?info.actual:0), used=0;
        while(sq.length&&used<cap){ var x=sq[0]; if(x.today&&d!==td){ x.today=false; }
          var want=Math.min(x.min,cap-used); if(want<25) break;
          var got2=put(x,x.c.name+" · "+x.label,"st",want,{c:x.c,x:x.x,today:x.today}); used+=got2; if(!got2) break; if(x.min-got2>=25){ x.min-=got2; if(got2<want) break; continue; } sq.shift(); }
        /* 3) CADD 암기 — 하루 20분 */
        if(cadd&&caddLeft>0&&!(V60.st().mdone&&V60.st().mdone[d])) put({},"CADD · 암기카드 20장","memo",caddLeft,{memo:1,d:d});
        info.items.sort(function(a,b){ return a.s-b.s; });
      }
      days.push(info);
    }
    hw.forEach(function(h){ h.short=h.left>0; });
    return {mon:mon,days:days,hw:hw,asg:asg,leftStudy:sq.length};
  };

  /* ---------- 공부계획 화면 ---------- */
  V60.ui={week:0,day:null,today:(function(){ try{ return localStorage.getItem("mc-plan-today")==="1"; }catch(e){ return false; } })()};
  V60.render=function(){
    if(window.V59) V59.ensureView(); var body=$("#v59Body"); if(!body) return;
    var pend=[];
    if(window.V58&&!V58.M&&V58.load) pend.push(V58.load());
    if(!V60.R) pend.push(V60.loadRoutine());
    if(V60.files==null) pend.push(V60.loadFiles());
    if(ATOM_HOSTED&&!V60._sl) pend.push(V60.loadSleep());
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
    var die='<div class="v60-die"><div class="v60-h">오늘 죽어도</div>'+((must.length||exT.length)?'<ul>'+
      must.map(function(a){ return '<li><b>'+esc(a.c)+'</b> '+esc(a.t)+' <span class="v60-due">'+(a.due===td?"오늘":"내일")+' '+esc(a.time)+'</span> <span class="hint">약 '+dur(a.est)+'</span>'+V60.filesHTML(a)+' <button type="button" class="btn xs" data-v60done="'+esc(a.k)+'">끝냄</button></li>'; }).join("")+
      exT.map(function(e){ var c=course(e.courseId)||{}; return '<li><b>'+esc(c.name||"")+'</b> '+esc(e.kind||"시험")+' <span class="v60-due">'+(e.date===td?"오늘":"내일")+'</span></li>'; }).join("")+'</ul>':'<div class="v60-none">마감 임박 없음</div>')+'</div>';
    var tItems=T?T.items:[];
    var mustDo='<div class="v60-must"><div class="v60-h">오늘 무조건</div>'+(tItems.length?'<ol>'+tItems.map(function(b){
      return '<li class="m-'+b.k+'"><span class="v60-t">'+hm(b.s)+'–'+hm(b.e)+'</span> '+esc(b.t)+(b.meta&&b.meta.hw?V60.filesHTML(b.meta.hw):'')+
        (b.meta&&b.meta.x?' <button type="button" class="btn xs a" data-v60go="'+b.meta.c.id+'|'+b.meta.x.w+'|'+b.meta.x.date+'">열기</button>':'')+
        (b.meta&&b.meta.memo?' <button type="button" class="btn xs a" data-v60memo="1">카드</button>':'')+
        (b.meta&&b.meta.hw?' <button type="button" class="btn xs v60-ok" data-v60done="'+esc(b.meta.hw.k)+'">완료</button>':'')+
        (b.meta&&b.meta.x?' <button type="button" class="btn xs v60-ok" data-v60sdone="'+b.meta.c.id+'|'+b.meta.x.date+'">완료</button>':'')+
        (b.meta&&b.meta.memo?' <button type="button" class="btn xs v60-ok" data-v60mdone="'+esc(b.meta.d)+'">완료</button>':'')+'</li>'; }).join("")+'</ol>':'<div class="v60-none">'+(T&&T.avail<25?'남은 빈 시간이 없습니다':'배정할 것이 없습니다')+'</div>')+'</div>';
    var hwMin=tItems.filter(function(b){ return b.k==="hw"; }).reduce(function(a,b){ return a+b.e-b.s; },0), stMin=tItems.filter(function(b){ return b.k!=="hw"; }).reduce(function(a,b){ return a+b.e-b.s; },0);
    var nums='<div class="v60-nums"><span><small>지금부터 빈 시간</small><b>'+dur(T?T.avail:0)+'</b></span><span><small>과제</small><b>'+dur(hwMin)+'</b></span><span><small>공부</small><b>'+dur(stMin)+'</b></span><span><small>오늘 실제 공부</small><b>'+dur(T?T.actual:0)+'</b></span>'+
      (T&&T.slept!=null?'<span class="'+(T.short?'warn':'')+'"><small>어젯밤 수면</small><b>'+dur(T.slept)+'</b></span>':(T&&T.short?'<span class="warn"><small>수면</small><b>부족</b></span>':''))+'</div>';
    /* 주간 격자 */
    var H0=7*60, H1=26*60, PX=0.62, nowM=nowMin();
    var cols=P.days.map(function(x){
      var bl=x.blk.map(function(b){ return {s:b.s,e:b.e,t:b.t,k:b.k}; }).concat(x.items);
      var isT=x.d===td;
      return '<div class="v60-col'+(isT?' today':'')+(x.past?' past':'')+'" data-d="'+x.d+'"><div class="v60-ch"><b>'+V60.md(x.d)+'</b><small>빈 '+dur(x.avail)+(x.actual?' · 공부 '+dur(x.actual):'')+'</small></div><div class="v60-cb" style="height:'+((H1-H0)*PX)+'px">'+
        '<i class="v60-sleep" style="top:0;height:'+Math.max(0,(x.wake-H0)*PX)+'px"></i><i class="v60-sleep" style="top:'+((x.bed-H0)*PX)+'px;height:'+Math.max(0,(H1-x.bed)*PX)+'px"></i>'+
        bl.filter(function(b){ return b.e>H0&&b.s<H1; }).map(function(b){ var s=Math.max(b.s,H0), e=Math.min(b.e,H1), h=(e-s)*PX;
          return '<div class="v60-b k-'+b.k+'" style="top:'+((s-H0)*PX)+'px;height:'+h+'px" title="'+esc(hm(b.s)+'–'+hm(b.e)+' '+b.t)+'">'+(h>=15?'<span>'+esc(b.t)+'</span>':'')+(h>=30?'<small>'+hm(b.s)+'</small>':'')+'</div>'; }).join("")+
        (isT&&nowM>H0?'<i class="v60-now" style="top:'+((nowM-H0)*PX)+'px"></i>':'')+'</div></div>';
    }).join("");
    var hours=''; for(var h=7;h<=26;h+=1) hours+='<span style="top:'+((h*60-H0)*PX)+'px">'+pad2(h%24)+'</span>';
    var seg='<div class="seg" id="v60Wk"><button data-w="t"'+(V60.ui.today?' aria-pressed="true"':'')+'>오늘만</button><button data-w="0"'+(!V60.ui.today&&V60.ui.week===0?' aria-pressed="true"':'')+'>이번 주</button><button data-w="1"'+(!V60.ui.today&&V60.ui.week===1?' aria-pressed="true"':'')+'>다음 주</button></div>';
    var grid=V60.ui.today?V60.todayHTML(T,nowM,seg):'<div class="card v60-gridcard"><div class="card-h"><h3>'+(V60.ui.week?'다음 주':'이번 주')+'</h3><span class="hs"></span><div class="ha">'+seg+'</div></div>'+
      '<div class="card-b"><div class="v60-leg"><i class="k-cls"></i>수업<i class="k-work"></i>근무·알바<i class="k-ev"></i>일정<i class="k-meal"></i>식사·준비<i class="k-hw"></i>과제<i class="k-st"></i>공부<i class="k-memo"></i>암기</div>'+
      '<div class="v60-grid"><div class="v60-hrs" style="height:'+((H1-H0)*PX)+'px">'+hours+'</div>'+cols+'</div></div></div>';
    /* 과제 */
    var hwRows=P.asg.filter(function(a){ return a.due>=td; }).map(function(a){ var dd=diffDays(td,a.due), h=P.hw.filter(function(x){ return x.a.k===a.k; })[0];
      return '<div class="lrow v60-hw'+(a.done?' done':'')+'"><span class="v59-dd'+(dd<=2&&!a.done?' hot':'')+'">'+(dd?'D-'+dd:'오늘')+'</span><div class="gr"><div class="t">'+esc(a.c)+' · '+esc(a.t)+'</div><div class="s">'+esc(V60.md(a.due))+' '+esc(a.time)+
        (a.done?' · 끝냄':(h&&h.days?' · '+h.days.map(V60.md).join(", ")+' 에 배정':'')+(h&&h.short?' · <b class="v60-warn">마감 전 시간 부족</b>':''))+V60.filesHTML(a)+'</div></div>'+
        '<label class="v60-est">약 <input type="number" min="10" step="10" value="'+a.est+'" data-v60est="'+esc(a.k)+'">분</label>'+
        '<button type="button" class="btn xs'+(a.done?'':' a')+'" data-v60done="'+esc(a.k)+'">'+(a.done?'되돌리기':'끝냄')+'</button></div>'; }).join("");
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
        return '<label>'+esc(f[1])+'<input class="input" type="'+f[3]+'" data-v60cfg="'+f[0]+'" value="'+esc(V60.cfg(f[0],f[2]))+'"></label>'; }).join("")+'</div>'+
      '<div class="v60-sh">오늘 수면</div><div class="v60-sf">'+(function(){ var sl=V60.sleepOf(td)||{}; return '<label>취침<input class="input" type="time" data-v60sleep="bed" value="'+esc(sl.bed||"")+'"></label><label>기상<input class="input" type="time" data-v60sleep="wake" value="'+esc(sl.wake||"")+'"></label>'; })()+'</div>'+
      '<div class="v60-sh">수업 끝나는 시각</div><div class="v60-sf">'+V60.slotRows()+'</div></details>';
    body.innerHTML='<div class="v60-top">'+die+mustDo+'</div>'+nums+grid+
      '<div class="card"><div class="card-h"><h3>과제 · 할 일</h3><span class="hs">'+P.asg.filter(function(a){ return a.due>=td&&!a.done; }).length+'</span></div><div class="card-b tight">'+(hwRows||'<div class="empty">남은 과제가 없습니다.</div>')+
        '<div class="v60-add"><select class="input" id="v60aC">'+V60.MID.concat(["아카데믹글쓰기","창업아이디어탐색","사회봉사","기타"]).map(function(n){ return '<option>'+esc(n)+'</option>'; }).join("")+'</select><input class="input" id="v60aT" placeholder="할 일"><input class="input" type="date" id="v60aD" value="'+td+'"><input class="input" type="time" id="v60aH" value="23:59"><input class="input" type="number" id="v60aM" value="60" min="10" step="10"><button type="button" class="btn a" id="v60aB">추가</button></div></div></div>'+
      '<div class="card"><div class="card-h"><h3>진도</h3></div><div class="card-b tight">'+prog+'</div></div>'+set;
    /* 이벤트 */
    $$("[data-v60done]",body).forEach(function(b){ b.onclick=function(){ var st=V60.st(), k=b.dataset.v60done; if(st.done[k]) delete st.done[k]; else { st.done[k]=Date.now(); toast("과제 완료 — 남은 시간을 다시 배정합니다"); } persist(); V60.render(); }; });
    $$("[data-v60est]",body).forEach(function(inp){ inp.onchange=function(){ var v=+inp.value; if(v>0){ V60.st().est[inp.dataset.v60est]=v; persist(); V60.render(); } }; });
    $$("[data-v60cfg]",body).forEach(function(inp){ inp.onchange=function(){ V60.st().cfg[inp.dataset.v60cfg]=inp.type==="number"?+inp.value:inp.value; persist(); V60.render(); }; });
    $$("[data-v60go]",body).forEach(function(b){ b.onclick=function(){ var q=b.dataset.v60go.split("|"); openStudy(q[0],+q[1],q[2]); }; });
    $$("[data-v60memo]",body).forEach(function(b){ b.onclick=function(){ openNote(V60.CADD_MEMO+"#flip","CADD 암기카드"); }; });
    var ab=$("#v60aB",body); if(ab) ab.onclick=function(){ var t=($("#v60aT",body).value||"").trim(); if(!t){ toast("할 일을 적어 주세요"); return; } var st=V60.st(); st.extra=st.extra||[];
      st.extra.push({id:uid(),c:$("#v60aC",body).value,t:t,due:$("#v60aD",body).value||td,time:$("#v60aH",body).value||"23:59",est:+$("#v60aM",body).value||60}); persist(); V60.render(); };
    $$("[data-v60sdone]",body).forEach(function(b){ b.onclick=function(){ var st=V60.st(); st.sdone=st.sdone||{}; st.sdone[b.dataset.v60sdone]=Date.now(); persist(); toast("완료 — 남은 시간을 다시 배정합니다"); V60.render(); }; });
    $$("[data-v60mdone]",body).forEach(function(b){ b.onclick=function(){ var st=V60.st(); st.mdone=st.mdone||{}; st.mdone[b.dataset.v60mdone]=Date.now(); persist(); V60.render(); }; });
    $$("[data-v60sleep]",body).forEach(function(inp){ inp.onchange=function(){ var st=V60.st(); st.sleep=st.sleep||{}; var o=st.sleep[td]||{}; o[inp.dataset.v60sleep]=inp.value; st.sleep[td]=o; persist(); V60.render(); }; });
    $$("[data-v60end]",body).forEach(function(inp){ inp.onchange=function(){ var st=V60.st(); st.cfg.ends=st.cfg.ends||{}; if(inp.value) st.cfg.ends[inp.dataset.v60end]=inp.value; else delete st.cfg.ends[inp.dataset.v60end]; persist(); V60.render(); }; });
    $$("#v60Wk button",body).forEach(function(b){ b.onclick=function(){ var w=b.dataset.w; V60.ui.today=w==="t"; if(w!=="t") V60.ui.week=+w; try{ localStorage.setItem("mc-plan-today",V60.ui.today?"1":"0"); }catch(e){} V60.render(); }; });
  };

  /* ---------- 오늘만 보기: 하루 시간표를 한 줄씩 ---------- */
  V60.KN={cls:"수업",work:"근무",ev:"일정",meal:"식사",life:"생활",move:"이동",hw:"과제",st:"공부",memo:"암기"};
  V60.todayHTML=function(T,nowM,seg){
    var rows=T?T.blk.concat(T.items).filter(function(b){ return b.e>T.wake-1; }).sort(function(a,b){ return a.s-b.s||a.e-b.e; }):[];
    var hm2=function(m){ m=Math.round(m); return (m>=1440?"익일 ":"")+(Math.floor(m/60)%24<10?"0":"")+(Math.floor(m/60)%24)+":"+(m%60<10?"0":"")+(m%60); };
    var list=rows.map(function(b){ var past=b.e<=nowM, cur=b.s<=nowM&&nowM<b.e, act="";
      if(b.meta&&b.meta.hw) act+=' <button type="button" class="btn xs v60-ok" data-v60done="'+esc(b.meta.hw.k)+'">완료</button>';
      if(b.meta&&b.meta.x) act+=' <button type="button" class="btn xs a" data-v60go="'+b.meta.c.id+'|'+b.meta.x.w+'|'+b.meta.x.date+'">열기</button> <button type="button" class="btn xs v60-ok" data-v60sdone="'+b.meta.c.id+'|'+b.meta.x.date+'">완료</button>';
      if(b.meta&&b.meta.memo) act+=' <button type="button" class="btn xs a" data-v60memo="1">카드</button> <button type="button" class="btn xs v60-ok" data-v60mdone="'+esc(b.meta.d)+'">완료</button>';
      return '<div class="v60-tr'+(past?' past':'')+(cur?' cur':'')+'"><span class="v60-tt">'+hm2(b.s)+'<small>'+hm2(b.e)+'</small></span><i class="v60-tb k-'+b.k+'"></i><div class="v60-tx"><span class="v60-tk">'+esc(V60.KN[b.k]||"")+(cur?' · 지금':'')+'</span><b>'+esc(b.t)+'</b>'+(b.meta&&b.meta.hw?V60.filesHTML(b.meta.hw):'')+act+'</div></div>'; }).join("");
    if(T){ list+='<div class="v60-tr bed"><span class="v60-tt">'+hm2(T.bed)+'</span><i class="v60-tb k-sleep"></i><div class="v60-tx"><span class="v60-tk">수면</span><b>취침</b></div></div>'; }
    return '<div class="card v60-today"><div class="card-h"><h3>오늘 '+esc(V60.md(today()))+'</h3><span class="hs">빈 '+fmtMin(T?T.avail:0)+'</span><div class="ha">'+seg+'</div></div><div class="card-b">'+(list||'<div class="empty">일정이 없습니다.</div>')+'</div></div>';
  };

  /* ---------- ③ 할 일: 앞으로 할 것만 ---------- */
  V60.hookTodo=function(){
    if(V60._todo) return; V60._todo=true;
    var _wk=wkItemHTML;
    wkItemHTML=function(it,mon,td){ if(it.done) return ""; if(it.due&&it.due<(td||today())) return ""; return _wk.apply(this,arguments); };
    var _ta=renderTaskAll;
    renderTaskAll=function(){ _ta.apply(this,arguments);
      var td=today(); $$("#taskAllBox .row-t").forEach(function(r){ if(r.querySelector(".sub2.over")||r.querySelector(".tx.done")) r.remove(); });
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

  /* ---------- 연결 ---------- */
  var _render=render;
  render=function(){ V60.hookExam(); V60.hookTodo(); V60.hookCal(); if(window.V59&&!V59._v60){ V59._v60=true; V59.renderPlan=V60.render; } _render.apply(this,arguments); };

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
    ".v60-cb{position:relative;border-radius:10px;background:repeating-linear-gradient(to bottom,transparent 0,transparent 36.6px,var(--line) 36.6px,var(--line) 37.2px);border:1px solid var(--line);overflow:hidden}",
    ".v60-col.today .v60-cb{border-color:var(--ac,#4F9A35);box-shadow:0 0 0 1px var(--ac,#4F9A35)}",
    ".v60-sleep{position:absolute;left:0;right:0;background:repeating-linear-gradient(135deg,rgba(60,70,100,.10) 0 6px,rgba(60,70,100,.04) 6px 12px)}",
    ".v60-b{position:absolute;left:2px;right:2px;border-radius:6px;padding:1px 4px;overflow:hidden;font-size:10.5px;line-height:1.2;color:#fff;border:1px solid rgba(0,0,0,.06)}",
    ".v60-b span{display:block;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v60-b small{font-size:9.5px;opacity:.85}",
    ".v60-b.k-cls,.v60-leg .k-cls{background:#5B6B8C}.v60-b.k-work,.v60-leg .k-work{background:#C26A12}.v60-b.k-ev,.v60-leg .k-ev{background:#7A869A}.v60-b.k-meal,.v60-b.k-life,.v60-leg .k-meal{background:#9CB78B}.v60-b.k-move{background:#C9D1DC}.v60-b.k-hw,.v60-leg .k-hw{background:#C7261B}.v60-b.k-st,.v60-leg .k-st{background:#1E5FA8}.v60-b.k-memo,.v60-leg .k-memo{background:#7C3AED}",
    ".v60-b.k-move{color:#334}.v60-now{position:absolute;left:0;right:0;height:2px;background:#C7261B;z-index:3}",
    ".v60-hw .v60-est{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;color:var(--ink-2);margin:0 8px;white-space:nowrap}.v60-hw .v60-est input{width:62px;min-height:36px;border:1px solid var(--line);border-radius:8px;padding:0 6px;font:inherit}",
    ".v60-hw.done .t{text-decoration:line-through;color:var(--ink-3)}.v60-warn{color:#C7261B}",
    ".v60-set{margin:4px 0 20px}.v60-set summary{cursor:pointer;font-weight:700;min-height:44px;display:flex;align-items:center}.v60-sf{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.v60-sf label{display:flex;flex-direction:column;font-size:12.5px;gap:3px}",
    ".v60-add{display:grid;grid-template-columns:130px 1fr 140px 110px 80px auto;gap:6px;padding:10px 12px}.v60-add .input{min-height:42px}",
    "@media (max-width:760px){.v60-add{grid-template-columns:1fr 1fr}.v60-add #v60aT{grid-column:1/-1}}",
    ".v60-tr{display:grid;grid-template-columns:64px 6px 1fr;gap:10px;align-items:stretch;padding:4px 0;min-height:44px}",
    ".v60-tt{font-weight:800;font-variant-numeric:tabular-nums;font-size:14px;line-height:1.2;padding-top:6px}.v60-tt small{display:block;font-weight:600;font-size:11.5px;color:var(--ink-3)}",
    ".v60-tb{border-radius:4px}.v60-tb.k-cls{background:#5B6B8C}.v60-tb.k-work{background:#C26A12}.v60-tb.k-ev{background:#7A869A}.v60-tb.k-meal,.v60-tb.k-life{background:#9CB78B}.v60-tb.k-move{background:#C9D1DC}.v60-tb.k-hw{background:#C7261B}.v60-tb.k-st{background:#1E5FA8}.v60-tb.k-memo{background:#7C3AED}.v60-tb.k-sleep{background:repeating-linear-gradient(135deg,#8A93A8 0 4px,#C9CFDB 4px 8px)}",
    ".v60-tx{padding:6px 0;border-bottom:1px solid var(--line);display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;font-size:14.5px}.v60-tx b{font-weight:700}",
    ".v60-tk{font-size:11px;font-weight:800;color:var(--ink-3);width:100%}",
    ".v60-tr.past{opacity:.45}.v60-tr.cur .v60-tx{background:color-mix(in srgb,var(--ac,#4F9A35) 10%,transparent);border-radius:8px;padding-left:8px}.v60-tr.cur .v60-tk{color:var(--ac,#2E7D00)}",
    ".v60-sh{font-weight:800;font-size:13px;margin:12px 0 6px}.v60-ok{border-color:var(--ok,#15803D)!important;color:var(--ok,#15803D)!important}",
    ".v60-callist{margin-top:12px;display:flex;flex-direction:column;gap:6px}",
    ".v60-cev{background:#1E5FA8!important;color:#fff!important}.v60-cev.hot{background:#C7261B!important}",
    "@media (max-width:900px){.v60-top{grid-template-columns:1fr}}",
    "@media (max-width:600px){.v60-grid{grid-template-columns:28px repeat(7,minmax(46px,1fr))}.v60-b span{font-size:9.5px}.v60-b small{display:none}.v60-sf{grid-template-columns:1fr 1fr}.v60-hw{flex-wrap:wrap}}"
  ].join("\n");
  document.head.appendChild(css);
})();
