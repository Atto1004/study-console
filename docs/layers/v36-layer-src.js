/* ============================================================
   V36 LAYER — 주 2회 과목의 주차 정리를 요일별 회차로 분리 (아토 2026-09-17 "주2회인 과목들은 각 요일별 수업들별로 따로 정리")
   데이터 c.dayNotes[date] (weekNote와 같은 7섹션). 편집·학습은 기존 weekSheet/renderStudyUnit을 동기 함수 스왑으로 재사용.
   미적2 V35 주 단위 시드 → 날짜별로 이관(1회, term().patchV36a).
   ============================================================ */
(function(){
  if(window.V36) return;
  var V36=window.V36={};
  var blank=function(){ return {range:"",summary:"",textbook:"",board:"",recording:"",material:"",notes:"",exam:[],tasks:[],links:[],updatedAt:0}; };
  V36.split=function(c){ return !!(c&&Array.isArray(c.slots)&&c.slots.length>=2); };
  V36.dayNote=function(c,date,create){
    if(!c) return null;
    if(!c.dayNotes||typeof c.dayNotes!=="object") c.dayNotes={};
    var n=c.dayNotes[date];
    if(!n&&create){ n=c.dayNotes[date]=blank(); }
    if(n){ ["exam","tasks","links"].forEach(function(k){ if(!Array.isArray(n[k])) n[k]=[]; }); }
    return n||null;
  };
  V36.dayHas=function(c,date){ var n=V36.dayNote(c,date); if(!n) return false;
    var f=0; WN_SEC.forEach(function(x){ if((n[x[0]]||"").trim()) f++; });
    return f>0||n.exam.length>0||n.tasks.length>0||n.links.length>0||!!(n.summary||"").trim(); };
  V36.dayFilled=function(c,date){ var n=V36.dayNote(c,date); if(!n) return 0; var f=0; WN_SEC.forEach(function(x){ if((n[x[0]]||"").trim()) f++; }); return f; };
  V36.dayLabel=function(date){ var d=D(date); return DAY[d.getDay()]+" "+(d.getMonth()+1)+"/"+d.getDate(); };

  /* ---------- 주 단위 판정에 day 포함 ---------- */
  var _weekNoteHas=weekNoteHas;
  weekNoteHas=function(c,w){
    if(_weekNoteHas(c,w)) return true;
    if(!V36.split(c)) return false;
    return planned(c).some(function(p){ return p.week===w&&V36.dayHas(c,p.date); });
  };
  var _allTasks=allTasks;
  allTasks=function(){
    var out=_allTasks();
    courses().forEach(function(c){
      Object.keys(c.dayNotes||{}).forEach(function(d){
        var n=V36.dayNote(c,d); if(!n) return;
        n.tasks.forEach(function(t){ out.push({c:c,w:weekOf(d)||0,t:t,date:d}); });
      });
    });
    return out;
  };
  if(window.V33&&V33.hwState){
    var _hw=V33.hwState;
    V33.hwState=function(c,date){
      var r=_hw(c,date); if(r.n) return r;
      var w=weekOf(date), n=0;
      Object.keys(c.dayNotes||{}).forEach(function(d){ if(weekOf(d)!==w) return; var dn=V36.dayNote(c,d); if(!dn) return;
        dn.links.forEach(function(l){ if(/^notes\//.test(l.url||"")&&/제출용|해답지/.test(l.label||"")) n++; }); });
      return {st:n?"linked":"none",n:n};
    };
  }

  /* ---------- 편집: weekSheet 스왑 ---------- */
  V36.daySheet=function(cid,date){ ui.dayCtx={cid:cid,date:date}; weekSheet(cid,weekOf(date)||1); };
  var _weekSheet=weekSheet;
  weekSheet=function(cid,w){
    var ctx=ui.dayCtx;
    if(!ctx||ctx.cid!==cid||(weekOf(ctx.date)||1)!==w){ ui.dayCtx=null; return _weekSheet(cid,w); }
    ui.dayCtxClosing=false;                         /* reopen(closeSheet→weekSheet 동기 호출) 중이면 ctx 유지 */
    var _wn=weekNote, _pl=planned;
    weekNote=function(c,ww,create){ return V36.dayNote(c,ctx.date,create); };
    planned=function(c,wh){ return _pl(c,wh).filter(function(p){ return p.date===ctx.date; }); };
    try{ _weekSheet(cid,w); } finally { weekNote=_wn; planned=_pl; }
  };
  var _openSheet=openSheet;
  openSheet=function(o){
    var ctx=ui.dayCtx;
    if(ctx&&o&&typeof o.title==="string"&&/주차 수업 정리/.test(o.title)){
      var c=course(ctx.cid); o.title=(c?c.name:"")+" · "+V36.dayLabel(ctx.date)+" 회차 정리 ("+(weekOf(ctx.date)||"-")+"주차)";
    } else ui.dayCtx=null;
    return _openSheet(o);
  };
  var _go=go;
  go=function(v,cid){ ui.dayCtx=null; return _go(v,cid); };
  var _closeSheet=closeSheet;
  closeSheet=function(){ _closeSheet(); if(ui.dayCtx){ ui.dayCtxClosing=true; setTimeout(function(){ if(ui.dayCtxClosing){ ui.dayCtx=null; ui.dayCtxClosing=false; } },0); } };

  /* ---------- 학습: renderStudyUnit 스왑 ---------- */
  var _openStudy=openStudy;
  openStudy=function(cid,w,date){ _openStudy(cid,w); if(ui.studyUnit) ui.studyUnit.date=date||null; if(date){ try{ renderStudyUnit(); }catch(e){} } };
  var _rsu=renderStudyUnit;
  renderStudyUnit=function(){
    var u=ui.studyUnit, date=u&&u.date;
    if(!date) return _rsu();
    var _wn=weekNote, _ss=studySessionsOf;
    weekNote=function(c,ww,create){ return V36.dayNote(c,date,create); };
    studySessionsOf=function(c,ww){ return _ss(c,ww).filter(function(s){ return s.date===date; }); };
    try{ _rsu(); } finally { weekNote=_wn; studySessionsOf=_ss; }
    var h1=$("#stHead h1"); if(h1&&h1.textContent.indexOf("회차")<0) h1.textContent=h1.textContent+" · "+V36.dayLabel(date)+" 회차";
    var ed=$("#stEdit"); if(ed){ ed.textContent="회차 정리 편집"; ed.onclick=function(){ V36.daySheet(u.cid,date); }; }
  };

  /* ---------- 과목 화면 16주 목록: 요일 하위 행 ---------- */
  V36.dayState=function(c,date){
    if(holidayOn(date)) return {k:"hol",label:"휴강"};
    var s=sessionOn(c.id,date);
    if(s&&s.cancelled) return {k:"hol",label:"휴강"};
    if(!sessionEnded(c,{date:date})) return {k:"fut",label:"미수강"};
    if(s&&/^(absent|excused|ghost)$/.test(s.status||"")) return {k:"abs",label:"결석 · 보강 필요"};
    if(!s||!s.status) return {k:"norec",label:"기록 없음"};
    if(!V36.dayHas(c,date)) return {k:"miss",label:"정리 없음"};
    return {k:"ok",label:""};
  };
  var _renderWeeks=V34.renderWeeks;
  V34.renderWeeks=function(c){
    _renderWeeks(c);
    if(!V36.split(c)) return;
    var box=$("#cNotes"); if(!box) return;
    var rows=$$("#cNotes > .wn-row"), t=term();
    rows.forEach(function(row,i){
      var w=i+1; if(w>t.weeks) return;
      var ps=planned(c).filter(function(p){ return p.week===w; });
      if(!ps.length) return;
      /* 주 합본 행: 주 단위 정리가 있을 때만 요약 유지, 없으면 제목을 「요일별 회차」로 */
      var hasWeek=_weekNoteHas(c,w);
      var tEl=$(".t",row);
      if(tEl&&!hasWeek){ var st=tEl.querySelector(".v34-st"); if(st&&/정리 없음|기록 없음|진행 중/.test(st.textContent)) st.textContent="요일별 회차 ↓"; }
      if(tEl&&hasWeek) tEl.insertAdjacentHTML("afterbegin",'<span class="v36-tag">주 합본</span> ');
      var btns=$(".v34-btns",row); if(btns&&!hasWeek) btns.innerHTML="";
      var wrap=document.createElement("div"); wrap.className="v36-days";
      wrap.innerHTML=ps.map(function(p){
        var st=V36.dayState(c,p.date), n=V36.dayNote(c,p.date), has=V36.dayHas(c,p.date), f=V36.dayFilled(c,p.date);
        var ot=n?n.tasks.filter(function(x){return !x.done;}).length:0;
        var canOpen=(st.k!=="fut"&&st.k!=="hol");
        var title=has&&n?(n.summary||n.range||"정리"):st.label;
        var sub=[has?"섹션 "+f+"/5":""].concat(n&&n.exam.length?['<span style="color:var(--warn)">★ '+n.exam.length+'</span>']:[]).concat(ot?['<span style="color:var(--crit)">할 일 '+ot+'</span>']:[]).concat(n&&n.links.length?["링크 "+n.links.length]:[]).filter(Boolean);
        var s=sessionOn(c.id,p.date), prog=(s&&s.progress||"").trim();
        return '<div class="v36-day v36-'+st.k+'"><span class="v36-d">'+esc(V36.dayLabel(p.date))+'</span><div style="min-width:0">'+
          '<div class="t">'+(has?esc(title):'<span class="v34-st">'+esc(title)+'</span>')+'</div>'+
          ((prog||sub.length)?'<div class="s">'+(prog?'<span>'+esc(prog.length>60?prog.slice(0,60)+"…":prog)+'</span>':"")+sub.map(function(x){return x.indexOf("<")===0?x:'<span>'+esc(x)+'</span>';}).join("")+'</div>':"")+
          '</div><span class="v34-btns">'+(canOpen?'<button class="btn xs a" data-dst="'+p.date+'">학습</button><button class="btn xs" data-dn="'+p.date+'">열기</button>':'')+'</span></div>';
      }).join("");
      row.insertAdjacentElement("afterend",wrap);
    });
    $$("#cNotes > .wn-row [data-wn], #cNotes > .wn-row [data-wst]").forEach(function(b){ var f=b.onclick; b.onclick=function(){ ui.dayCtx=null; if(f) f(); }; });   /* 주 합본 버튼은 주 단위 */
    $$("#cNotes [data-dn]").forEach(function(b){ b.onclick=function(){ V36.daySheet(c.id,b.dataset.dn); }; });
    $$("#cNotes [data-dst]").forEach(function(b){ b.onclick=function(){ openStudy(c.id,weekOf(b.dataset.dst)||1,b.dataset.dst); }; });
    var hs=$("#cNotesHs"); if(hs){ var dn=0; Object.keys(c.dayNotes||{}).forEach(function(d){ if(V36.dayHas(c,d)) dn++; }); if(dn) hs.textContent=hs.textContent+" · 회차 정리 "+dn; }
  };

  /* ---------- 데이터 이관: 미적2 V35 주 단위 → 날짜별 ---------- */
  var SEED35={
    1:{textbook:"교재(Stewart)에 행렬 단원이 없어 교수 배포 학습지 Lecture 2-1(14p)이 유일한 교재. (1) 행렬의 정의·5종(정사각·단위·영·전치·대칭) (2) 기본 연산(상등·합차·실수배·곱·거듭제곱) (3) 행렬식(2차 ad−bc, 3차 사루스).",
       board:"9/1 판서 없음(학습지 위주). 9/3 예제 2 (1)~(5) 연산, 예제 3 det(A)=0 → (x−1)(x−4)+2=0 → x=2,3, 예제 4 det B=16+6−36−(−6+16+36)=−60.",
       notes:"학습지 아토 필기: 행/열 표시, '행렬의 항등', '두 행렬의 곱', 'A·A·A… 실수의 계산과 동일', '행렬은 괄호 · 행렬식은 절댓값(세로줄)'. Ex01~Ex04 풀이 완료(검산 ✓)."},
    2:{range:"9/8 학습지 (4)~(7) 소행렬식·여인수 → 역행렬 → 크래머 · 9/10 12.1 3차원 좌표계 도입",
       summary:"소행렬식·여인수 전개 → 역행렬 → 크래머 · 12.1 좌표계 도입 — 9/8 결석분은 아토 학습지 풀이본(Ex05~Ex10 검산 전부 정답), 9/10 지각분은 필기 1장으로 복원",
       textbook:"학습지 (4) Minor Mᵢⱼ·Cofactor Aᵢⱼ=(−1)^(i+j)Mᵢⱼ·여인수 전개(기준 행·열 자유) (5) 역행렬: 2×2 = (1/det)[a₂₂ −a₁₂; −a₂₁ a₁₁], 3×3 A⁻¹=adj(A)/det, adj=여인수 행렬의 전치 (6) AX=B → X=A⁻¹B (7) 크래머 xⱼ=det(Aⱼ)/det A(Aⱼ = j열을 B로). 12.1: 직교(x,y,z)·원주(r,θ,z)·구면(뺌) 좌표계, R² 곡선 vs R³ 곡면.",
       board:"9/8 판서 없음(결석). 9/10 판서 없음(지각). 아토 연습노트 25/30쪽: 12.1 1) 3D Space 좌표계 3종 2) Surface & Solids R² 곡선 x,y / R³ 곡면 x,y,z.",
       recording:"녹음 없음. 9/15 녹음 역참조: '12.1 지난번에 했다 — 문제는 주로 원주좌표계로, 구면좌표계는 뺀다', '3차원 점 찍기 = z=0으로 xy에 투영 후 z만큼 올리기'.",
       material:"필기_학습지_Lecture2-1_행렬과행렬식_아토풀이_14p.pdf — Ex05 소행렬식 9개·여인수, Ex06 여인수 전개 D=0(2열+3열=(a+b+c)·1열), Ex07 A⁻¹=[1 −½; −3 2], Ex8 det=−10·adj·A⁻¹=[3/5 0 −2/5; 1/5 0 1/5; −7/10 1/2 3/10], Ex9 (x,y)=(1/5,2/5), Ex10 크래머 (20/9, −1/3, 22/9). p.13 여백 질문 'j에 1을 못 넣나?' → 일반형 표기일 뿐, j=1이면 b가 첫 열.",
       notes:"학습지 필기: '여인수에 의해 부호 결정', '열이나 행 중에 기준을 쓰기', '행렬의 곱은 교환법칙 성립 X', '선언 필수(A·X·B)', '음의 부호 부착', '행렬은 괄호 · 행렬식은 절댓값'."},
    3:{range:"9/15 12.1 곡면 그리기·거리·구면 → 12.2 벡터 정의·위치벡터 · 9/17 12.2 두 점 벡터·크기·연산·표준기저·단위벡터 → 12.3 내적 정의",
       summary:"곡면·거리·구면 → 벡터 성분·크기·연산·표준기저·단위벡터 → 내적 정의 — 벡터부터 중간 범위, 시험은 표준기저벡터부터, |2a−3b| = 퀴즈, i j k 문제는 i j k로 답",
       textbook:"Stewart 12.1(Three-Dimensional Coordinate Systems: 곡면·거리 √(Δx²+Δy²+Δz²)·구면 (x−h)²+(y−k)²+(z−l)²=r²) · 12.2 Vectors(성분·크기 |a|=√(a₁²+a₂²+a₃²)·연산·표준기저 i,j,k·단위벡터 u=a/|a|) · 12.3 Dot Product 정의 a·b=a₁b₁+a₂b₂+a₃b₃, Thm 1 a·b=|a||b|cosθ(증명 9/22).",
       board:"9/15 판서 5장: Ex01 z=3 평면 · Ex02 (a) x²+y²=1,z=3 원 (b) x²+y²=1 원기둥면 (c) x²+y²≤1, 2≤z≤4 속 찬 원기둥 · 거리 공식·Ex03 · 구면 Ex04(중심 (−2,3,−1), r=2√2) · 12.2 벡터 기하·성분·위치벡터. 9/17 판서 4장: Ex01 AB=OB−OA=(−4,4,−3) · ★④ 표준기저 a=a₁i+a₂j+a₃k · ★⑤ 단위벡터 u=(1/|a|)a · Ex02 |2a−3b|=√98=7√2 · Ex03 2a+3b=14i+4j+15k(두 표기) · Ex04 ⅔i−⅓j−⅔k.",
       recording:"9/15 67분 — 모든 3D 그림은 z=0 기준 xy 평면 그림을 먼저 → z만큼 올림. 12.1은 시험 X, 벡터부터 중간 범위. 근호 정리 안 하면 감점. 채점은 교수 기준(그림+의미). 9/17 68분 — 위치벡터=점의 좌표, 두 점 벡터는 앞이 시작점(BA로 읽으면 뒤집힘), 크기=거리, 연산은 덧셈·뺄셈·실수배에만 닫힘(상등 2점짜리), 시험은 ④ 표준기저벡터부터, 단위벡터는 (1/|a|)a 꼴로 밝혀 쓰기, i j k 문제는 i j k로 답, 12.3 내적 = 중간 문제(점 진하게, × 금지). 결석 −1점·11회 F, 레포트 미제출 불이익.",
       material:"교재 예제 진행(강의자료 없음). 아토 필기 2장(9/17): 12.2 개념 ①~⑤ + Ex01~04 한 장, 12.3 Def 01·Thm 01(cosθ=a·b/(|a||b|)). ⚠ 필기 Ex02 i) (−5,−8,3) → 정답 (−5,8,3).",
       notes:"12.2 필기 = 녹음 앞 30분(판서 사진 없는 개념 부분) 그대로 기록, 대조 완료. 벡터 정리노트 PDF(0절 클리닉 30분 계획·공식 4개·연습 10문제·교육과정 결손표) 링크."}
  };
  /* V35 초기 문구(배포 전 수정 전 판) — 혹시 남아 있으면 같이 비운다 */
  var SEED35_ALT={2:{summary:"9/8 결석분은 아토가 학습지 p.7~14를 직접 풀어둔 PDF로 정리(Ex05~Ex10 검산 전부 정답). 9/10은 지각(수업 후 도착), 필기 1장으로 12.1 도입만 복원."},
                  3:{summary:"벡터부터 중간고사 범위. 교수: 시험은 표준기저벡터부터, |2a−3b| 유형 = 퀴즈, i j k로 준 문제는 i j k로 답, 내적 = 중간 문제."}};
  var DAYS={
    "2026-09-01":{range:"학습지 Lecture 2-1 (1) 행렬의 정의·종류",summary:"행렬 정의(m×n, 성분 aᵢⱼ)와 5종 — 정사각·단위·영·전치·대칭",
      textbook:"학습지 (1) 정의01 m×n 행렬, 행(row)·열(column)·성분. 정의02 정사각·단위(I, 대각 1)·영(O)·전치(Aᵗ, i·j 교환)·대칭(Aᵗ=A). Ex01 (1)~(4) 전치·대칭 판별.",
      board:"판서 없음(학습지 위주).",recording:"9/1 35분 — 행렬은 대문자·성분은 소문자. 단위행렬은 숫자 1, 영행렬은 0에 대응. 전치는 행과 열을 바꾼 것, 대칭은 정사각에서만 의미.",
      material:"학습지 Lecture 2-1 행렬과 행렬식 14p(9/1 배포). 교재(Stewart)에 행렬 단원이 없어 이 학습지가 유일한 교재.",
      notes:"아토 필기: 행/열 표시, 대각 대칭이면 대칭행렬, Ex01 풀이(A·B·C·D 전치).",exam:[],tasks:[],links:[]},
    "2026-09-03":{range:"학습지 (2) 기본 연산 · (3) 행렬식(2차·3차 사루스)",summary:"덧셈·실수배·곱셈·거듭제곱 → 행렬식 — 시험은 행렬식부터 나온다",
      textbook:"학습지 (2) 상등·합차·실수배·곱(cᵢⱼ=Σaᵢₖbₖⱼ, (m×n)(n×r)=m×r)·거듭제곱. (3) 2차 det=a₁₁a₂₂−a₁₂a₂₁, 3차 사루스 규칙. Ex02 (1)~(5), Ex03 det=0 → x=2,3, Ex04 det B=−60.",
      board:"예제 2 (1)~(5) 연산 시연, 예제 3·4 행렬식 계산.",
      recording:"9/3 62분 — 덧셈·뺄셈·실수배는 같은 꼴끼리, 나눗셈 없음. 곱셈은 앞 열=뒤 행, AB≠BA. 행렬식 표기: det와 세로줄 필수, × 기호 금지. 손계산은 3차까지, 계산기 불가.",
      material:"학습지 p.3~6.",notes:"아토 필기: '실수배', '두 행렬의 곱', 'A·A·A… 실수의 계산과 동일', 'det(A)=|A| 행렬 A', '얘 써야 됨'. Ex02 (4) AB^t=[14 6 4;24 9 6;26 12 8], (5) A²=O 검산 ✓.",
      exam:[],tasks:[{text:"학습지 Ex01~Ex04 재풀이(답 가리고) — 전치·대칭 판별, AB^t, A²=O, det=0의 x, 3차 사루스",due:"2026-09-22",src:"정리 9/1·9/3"}],
      links:[{label:"행렬과 행렬식 1~2주차 개념 학습 (합본·교수 강조 표시)",url:"notes/calc2-matrix-w1-2.html"}]},
    "2026-09-08":{range:"학습지 (4) 소행렬식·여인수 → (5) 역행렬 → (6) 연립방정식 → (7) 크래머",summary:"결석분 — 아토가 학습지 p.7~14를 직접 풀어둔 PDF로 정리(Ex05~Ex10 검산 전부 정답)",
      textbook:SEED35[2].textbook.split(" 12.1:")[0],board:"판서 없음(결석).",recording:"녹음 없음(결석).",
      material:SEED35[2].material,notes:SEED35[2].notes,
      exam:[{t:"녹음 9/3 32:00 (적용)",quote:"중간고사 행렬 파트 2~3문제는 행렬식부터 — 손계산 3차까지, det 세로줄·행렬 괄호 표기, × 기호 금지.",memo:"이 회차 내용(여인수 전개·3×3 역행렬·크래머)이 그 유형"}],
      tasks:[{text:"시험 대비 재풀이: Ex06 여인수 전개(다른 행 기준으로도) · Ex8 3×3 역행렬 · Ex10 크래머 — 답 가리고 1회씩",due:"2026-09-22",src:"정리 9/8"},
             {text:"9/3 예고 강의자료실 연습문제(행렬·행렬식, 답안 포함) — LMS 토큰 연결 후 내려받기",due:"",src:"녹음 9/3 1:01:20"}],
      links:[{label:"행렬과 행렬식 1~2주차 개념 학습 (합본·교수 강조 표시)",url:"notes/calc2-matrix-w1-2.html"}]},
    "2026-09-10":{range:"12.1 3차원 좌표계 도입",summary:"지각분 — 좌표계 3종(직교·원주·구면)·곡선 vs 곡면·점 찍기, 필기 1장 + 9/15 녹음 역참조로 복원",
      textbook:"Stewart 12.1 앞부분: 직교좌표 P(x,y,z), 원주좌표 P(r,θ,z)(r 동경·θ 편각, 문제는 주로 이것), 구면좌표(교수: 뺀다). 변수 2개 = R² 곡선, 3개 = R³ 곡면. 좌표평면 3개 → 팔분공간 8개.",
      board:"판서 없음(지각). 아토 연습노트 25/30쪽: 12.1 1) 3D Space 좌표계 3종 2) Surface & Solids R² 곡선 x,y / R³ 곡면 x,y,z.",
      recording:"녹음 없음. 9/15 녹음 역참조: '12.1 지난번에 했다', '3차원 점 찍기 = z=0으로 xy에 투영 후 z만큼 올리기'.",
      material:"강의자료 없음(교재 진행).",notes:"필기_12.1_3차원좌표계.jpg 전사 — ① 직교 ② 원주 ③ 구면 / R² 곡선 · R³ 곡면.",
      exam:[{t:"녹음 9/15 02:46",quote:"12.1은 시험 문제가 안 나오지만 뒤로 가서 그림이 나왔을 때 3차원 관계를 이해해야 한다.",memo:"12.1 = 그림 바탕"}],tasks:[],links:[]},
    "2026-09-15":{range:"12.1 곡면 그리기·거리·구면 → 12.2 벡터 정의·위치벡터",summary:"R³ 곡면 그리기(z=0 기준 → 올리기) · 거리 · 구면 → 벡터 시작 — 12.1은 시험 X, 벡터부터 중간 범위",
      textbook:"Stewart 12.1 예제 1·2·4: z=3 평면, x²+y²=1(원기둥면), x²+y²≤1·2≤z≤4(속 찬 원기둥), 거리 √(Δx²+Δy²+Δz²), 구면 (x−h)²+(y−k)²+(z−l)²=r². 12.2 벡터의 기하적 표현·성분·위치벡터.",
      board:"판서 5장: Ex01 z=3 · Ex02 (a)(b)(c) · 거리 공식·Ex03 · 구면 Ex04(중심 (−2,3,−1), r=2√2) · 12.2 벡터 기하·성분·위치벡터.",
      recording:"9/15 67분 — 모든 3D 그림은 z=0 기준 xy 평면 그림을 먼저 → z만큼 올림. 교재 예제 4 풀이 비판(답만 쓰지 말고 그림·의미). 근호 정리 안 하면 감점. 그림을 잘 그리면 벡터가 쉬워진다.",
      material:"강의자료 없음(교재 예제 그대로).",notes:"필기 없음. 아토 주차표 메모 '12.1-12.2 (위치벡터)'.",
      exam:[{t:"녹음 9/15 02:46",quote:"12.1은 시험 문제가 안 나오지만… 벡터부터 중간고사 관련 내용이 하나씩 들어간다.",memo:"중간 범위 시작 = 12.2"},
            {t:"녹음 9/15",quote:"근호 정리 안 하면 감점. 채점은 교수 기준 — 그림과 기하학적 의미까지.",memo:"√98 → 7√2"}],
      tasks:[{text:"복습: 예제 2·4·추가 예제 직접 그리기(z=0 기준 → 올리기)",due:"2026-09-22",src:"정리 9/15"}],links:[]},
    "2026-09-17":{range:"12.2 두 점 벡터·크기·연산·표준기저·단위벡터 → 12.3 내적 정의",summary:"벡터 계산 — 시험은 표준기저벡터부터, |2a−3b| = 퀴즈, i j k 문제는 i j k로 답, 내적 = 중간 문제",
      textbook:"12.2 Vectors: AB=OB−OA, |a|=√(a₁²+a₂²+a₃²), 연산은 덧셈·뺄셈·실수배에만 닫힘, i=(1,0,0) j=(0,1,0) k=(0,0,1), a=a₁i+a₂j+a₃k, 단위벡터 u=(1/|a|)a. 12.3 Def 01 a·b=a₁b₁+a₂b₂+a₃b₃, Thm 01 a·b=|a||b|cosθ(증명 9/22).",
      board:"판서 4장: Ex01 AB=(−4,4,−3) · ★④ 표준기저 · ★⑤ 단위벡터 · Ex02 |2a−3b|=√98=7√2 · Ex03 2a+3b=14i+4j+15k(두 표기) · Ex04 ⅔i−⅓j−⅔k.",
      recording:"9/17 68분 — 위치벡터=점의 좌표, 두 점 벡터는 앞이 시작점(BA로 읽으면 뒤집힘), 크기=거리, 연산 3종(상등 2점짜리), 시험은 ④ 표준기저벡터부터, 단위벡터는 (1/|a|)a 꼴로 밝혀 쓰기, i j k 문제는 i j k로 답, 12.3 내적 = 중간 문제(점 진하게, × 금지). 결석 −1점·11회 F, 레포트 미제출 불이익. 클리닉에서 벡터 연산·크기를 물어봄.",
      material:"교재 예제 진행. 아토 필기 2장: 12.2 개념 ①~⑤ + Ex01~04, 12.3 Def 01·Thm 01(cosθ=a·b/(|a||b|)). ⚠ 필기 Ex02 i) (−5,−8,3) → 정답 (−5,8,3).",
      notes:"12.2 필기 = 녹음 앞 30분(판서 사진 없는 개념 부분) 그대로 기록, 대조 완료. 벡터 정리노트 PDF 링크.",
      exam:[{t:"녹음 9/17 20:46",quote:"시험 문제와 연관될 수 있는 문제는 네 번째(표준기저벡터)부터 들어간다.",memo:"①~③ 성분·크기·연산은 기본"},
            {t:"녹음 9/17 17:30",quote:"두 벡터가 같냐 — 벡터의 상등은 대학에서 물어보면 2점짜리 문제야.",memo:""},
            {t:"녹음 9/17 41:50",quote:"2배 a 벡터 마이너스 3배 b 벡터의 크기가 얼마냐 — 아마도 퀴즈 문제에 이런 문제가 나올 거예요.",memo:"|2a−3b| 유형"},
            {t:"녹음 9/17 47:43",quote:"문제에서 i j k 표준기저벡터로 표현됐으면 결과도 표준기저벡터로 답을 써야지 만점을 주는 거야.",memo:"표기 형태 따라가기"},
            {t:"녹음 9/17 58:40",quote:"12장 3절 dot product — 중간고사 문제에 관련된 내용.",memo:"내적 정의·Thm 1"},
            {t:"녹음 9/17 16:00",quote:"미적분학 클리닉 센터에서는 벡터의 연산 계산하는 걸 물어봐요. 크기 구하는 것까지.",memo:"클리닉 준비 = 연산·크기"}],
      tasks:[{text:"12.2 교재 연습문제 각자 풀기(교수 9/17 58:39 '진도가 느려서 나머지는 교재로')",due:"2026-09-22",src:"녹음 9/17"},
             {text:"벡터 정리노트 연습 Q1~Q10 답 가리고 풀기 (Q1~6 연산·크기·단위벡터, Q7~10 기저 표기·상등·내적)",due:"2026-09-22",src:"정리노트 9/17"},
             {text:"필기 Ex02 부호 고치기: (−5,−8,3) → (−5,8,3)",due:"2026-09-18",src:"정리 9/17"},
             {text:"레포트 공지 대기 — 중간·기말 때 제출, 미제출 시 불이익(9/17 00:00)",due:"",src:"녹음 9/17"}],
      links:[{label:"벡터 정리노트 12.1~12.3 도입 — 클리닉·중간 대비 (공식 4·연습 10·결손표)",url:"notes/calc2-vectors-0917.html"}]}
  };
  var isStr=function(x){ return typeof x==="string"; };
  V36.patch=function(){
    var t=term(); if(t.patchV36a) return;
    var c=t.courses.filter(function(x){return x.name==="미분적분학2";})[0]; if(!c) return;
    var skipped=[], changed=false;
    /* 1) 날짜별 노트 채우기(빈 칸만·같은 항목 없을 때만) */
    Object.keys(DAYS).forEach(function(d){
      var src=DAYS[d], n=V36.dayNote(c,d,true);
      Object.keys(src).forEach(function(k){
        var v=src[k];
        if(Array.isArray(v)){ var arr=n[k]; if(!Array.isArray(arr)||arr.some(function(y){return !y||typeof y!=="object";})){ skipped.push(d+":"+k); return; }
          var key=k==="links"?"url":k==="tasks"?"text":"quote";
          v.forEach(function(x){ if(arr.some(function(y){return y[key]===x[key];})) return; arr.push(k==="tasks"?Object.assign({id:uid(),done:false},x):x); changed=true; }); return; }
        var cur=n[k]; if(cur!=null&&!isStr(cur)){ skipped.push(d+":"+k); return; }
        if(!(cur||"").trim()){ n[k]=v; changed=true; }
      });
      n.updatedAt=Date.now();
    });
    /* 2) 주 단위 시드 정리: V35 문자열과 같을 때만 비우고, 배열 항목은 날짜별로 옮긴 것만 제거 */
    var moved={}; Object.keys(DAYS).forEach(function(d){ ["exam","tasks","links"].forEach(function(k){ (DAYS[d][k]||[]).forEach(function(x){ moved[k+":"+(x.quote||x.text||x.url)]=1; }); }); });
    /* 1주차 원본 시드의 시험 언급(전부 9/3 녹음)·과제·링크도 9/3 회차로 */
    var w1=c.weekNotes&&c.weekNotes[1]; if(w1&&Array.isArray(w1.exam)){ var d3=V36.dayNote(c,"2026-09-03",true);
      w1.exam.forEach(function(e){ if(e&&/녹음 9\/3/.test(e.t||"")&&!d3.exam.some(function(y){return y.quote===e.quote;})){ d3.exam.push(e); moved["exam:"+e.quote]=1; changed=true; } });
      (w1.tasks||[]).forEach(function(k){ if(k&&/연습문제/.test(k.text||"")&&!d3.tasks.some(function(y){return y.text===k.text;})){ d3.tasks.push(k); moved["tasks:"+k.text]=1; changed=true; } });
      (w1.links||[]).forEach(function(l){ if(l&&/calc2-0903/.test(l.url||"")&&!d3.links.some(function(y){return y.url===l.url;})){ d3.links.push(l); moved["links:"+l.url]=1; changed=true; } }); }
    [1,2,3].forEach(function(w){
      var n=c.weekNotes&&c.weekNotes[w]; if(!n) return;
      Object.keys(SEED35[w]).forEach(function(k){ if(isStr(n[k])&&(n[k]===SEED35[w][k]||(SEED35_ALT[w]&&n[k]===SEED35_ALT[w][k]))){ n[k]=""; changed=true; } });
      ["exam","tasks","links"].forEach(function(k){ if(!Array.isArray(n[k])) return; var before=n[k].length;
        n[k]=n[k].filter(function(x){ return !(x&&moved[k+":"+(x.quote||x.text||x.url)]); }); if(n[k].length!==before) changed=true; });
      if(changed) n.updatedAt=Date.now();
    });
    if(skipped.length){ if(window.console) console.warn("V36 보류: "+skipped.join(", ")); if(changed) persist(); return; }
    t.patchV36a=true;
    try{ persist(); }catch(e){ t.patchV36a=false; if(window.console) console.warn("V36 저장 실패", e); }
  };
  V36.patchLinks=function(){ var t=term(); if(t.patchV36b) return; var c=t.courses.filter(function(x){return x.name==="미분적분학2";})[0]; if(!c) return;
    ["2026-09-03","2026-09-08"].forEach(function(d){ var n=V36.dayNote(c,d,true); if(!n.links.some(function(l){return /calc2-matrix-w1-2/.test(l.url||"");})) n.links.push({label:"행렬과 행렬식 1~2주차 개념 학습 (합본·교수 강조 표시)",url:"notes/calc2-matrix-w1-2.html"}); });
    t.patchV36b=true; persist(); };
  var _boot=boot;
  boot=function(){ _boot(); var ch=false; try{ ch=!term().patchV36a; V36.patch(); V36.patchLinks(); }catch(e){ if(window.console) console.warn("V36 패치 오류", e); } if(ch){ try{ render(); }catch(e){} } };

  var css=document.createElement("style"); css.id="v36css";
  css.textContent=[
    ".v36-days{margin:0 0 4px 56px;border-left:2px solid var(--line-2);padding-left:10px}",
    ".v36-day{display:grid;grid-template-columns:62px minmax(0,1fr) auto;gap:6px 10px;align-items:center;padding:6px 0;border-top:1px dashed var(--line)}",
    ".v36-day:first-child{border-top:0}",
    ".v36-day .v36-d{font-family:var(--font-num);font-size:12px;font-weight:600;color:var(--ink-2)}",
    ".v36-day .t{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".v36-day .s{font-size:11.5px;color:var(--ink-3);display:flex;gap:8px;flex-wrap:wrap}",
    ".v36-day.v36-fut,.v36-day.v36-hol{opacity:.5}",
    ".v36-day.v36-miss .v34-st,.v36-day.v36-abs .v34-st{color:var(--crit)}",
    ".v36-day.v36-norec .v34-st{color:var(--ink-3)}",
    ".v36-tag{font-family:var(--font-num);font-size:10px;background:var(--ans,#F0F3F5);border-radius:4px;padding:0 5px;color:var(--ink-3);vertical-align:middle}"
  ].join("\n");
  document.head.appendChild(css);
})();
