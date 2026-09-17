/* ============================================================
   V35 LAYER (데이터 시드) — 미분적분학2 1~3주차 주차 정리 시드 (아토 2026-09-17 "미적분 1·2·3주차 정리해줘")
   원본: study-materials/미분적분학2/2026-09-01·03·08·10·15·17/정리.md (아톰 7섹션 정리). 빈 필드만 채우고, 배열은 같은 항목이 없을 때만 추가. 1회 패치(term().patchV35a).
   ============================================================ */
(function(){
  if(window.V35) return;
  var V35=window.V35={};
  var blank=function(){ return {range:"",summary:"",textbook:"",board:"",recording:"",material:"",notes:"",exam:[],tasks:[],links:[],updatedAt:0}; };
  var isStr=function(x){ return typeof x==="string"; };
  var fill=function(c,w,data,report){
    if(!c.weekNotes||typeof c.weekNotes!=="object") c.weekNotes={};
    if(!c.weekNotes[w]||typeof c.weekNotes[w]!=="object") c.weekNotes[w]=blank();
    var n=c.weekNotes[w]; ["exam","tasks","links"].forEach(function(k){ if(n[k]==null) n[k]=[]; });
    var changed=false;
    Object.keys(data).forEach(function(k){
      var v=data[k];
      if(k==="exam"||k==="tasks"||k==="links"){
        var arr=n[k];
        if(!Array.isArray(arr)||arr.some(function(y){ return !y||typeof y!=="object"; })){ report.skipped.push(w+":"+k); return; }   /* 비정상 배열 — 건드리지 않고 완료 보류 */
        v.forEach(function(x){
          var key=k==="links"?"url":k==="tasks"?"text":"quote";
          if(arr.some(function(y){return y[key]===x[key];})) return;
          arr.push(k==="tasks"?Object.assign({id:uid(),done:false},x):x); changed=true;
        });
        return;
      }
      var cur=n[k];
      if(cur!=null&&!isStr(cur)){ report.skipped.push(w+":"+k); return; }   /* 문자열이 아닌 값 — 보류 */
      if(!(cur||"").trim()){ n[k]=v; changed=true; }
    });
    if(changed) n.updatedAt=Date.now();
    return changed;
  };
  var prog=function(c,date,text,report){ var s=(window.V32&&V32.ensureSession)?V32.ensureSession(c.id,date):sessionOn(c.id,date); if(!s){ report.skipped.push("session:"+date); return false; } if(s.progress!=null&&!isStr(s.progress)){ report.skipped.push("progress:"+date); return false; } if((s.progress||"").trim()) return false; s.progress=text; return true; };

  V35.patch=function(){
    var t=term(); if(t.patchV35a) return;
    var c=t.courses.filter(function(x){return x.name==="미분적분학2";})[0]; if(!c) return;   /* 과목이 아직 없으면 플래그를 세우지 않는다 — 나중에 생기면 그때 적용 */
    var changed=false, report={skipped:[]};
    /* ---- 1주차 (9/1·9/3) 보강 — 기존 시드에 빈 칸만 ---- */
    changed=fill(c,1,{
      textbook:"교재(Stewart)에 행렬 단원이 없어 교수 배포 학습지 Lecture 2-1(14p)이 유일한 교재. (1) 행렬의 정의·5종(정사각·단위·영·전치·대칭) (2) 기본 연산(상등·합차·실수배·곱·거듭제곱) (3) 행렬식(2차 ad−bc, 3차 사루스).",
      board:"9/1 판서 없음(학습지 위주). 9/3 예제 2 (1)~(5) 연산, 예제 3 det(A)=0 → (x−1)(x−4)+2=0 → x=2,3, 예제 4 det B=16+6−36−(−6+16+36)=−60.",
      notes:"학습지 아토 필기: 행/열 표시, '행렬의 항등', '두 행렬의 곱', 'A·A·A… 실수의 계산과 동일', '행렬은 괄호 · 행렬식은 절댓값(세로줄)'. Ex01~Ex04 풀이 완료(검산 ✓).",
      tasks:[{text:"학습지 Ex01~Ex04 재풀이(답 가리고) — 전치·대칭 판별, AB^t, A²=O, det=0의 x, 3차 사루스",due:"2026-09-22",src:"정리 9/1·9/3"}]
    },report)||changed;
    /* ---- 2주차 (9/8 결석 · 9/10 개큰지각) ---- */
    changed=fill(c,2,{
      range:"9/8 학습지 (4)~(7) 소행렬식·여인수 → 역행렬 → 크래머 · 9/10 12.1 3차원 좌표계 도입",
      summary:"소행렬식·여인수 전개 → 역행렬 → 크래머 · 12.1 좌표계 도입 — 9/8 결석분은 아토 학습지 풀이본(Ex05~Ex10 검산 전부 정답), 9/10 지각분은 필기 1장으로 복원",
      textbook:"학습지 (4) Minor Mᵢⱼ·Cofactor Aᵢⱼ=(−1)^(i+j)Mᵢⱼ·여인수 전개(기준 행·열 자유) (5) 역행렬: 2×2 = (1/det)[a₂₂ −a₁₂; −a₂₁ a₁₁], 3×3 A⁻¹=adj(A)/det, adj=여인수 행렬의 전치 (6) AX=B → X=A⁻¹B (7) 크래머 xⱼ=det(Aⱼ)/det A(Aⱼ = j열을 B로). 12.1: 직교(x,y,z)·원주(r,θ,z)·구면(뺌) 좌표계, R² 곡선 vs R³ 곡면.",
      board:"9/8 판서 없음(결석). 9/10 판서 없음(지각). 아토 연습노트 25/30쪽: 12.1 1) 3D Space 좌표계 3종 2) Surface & Solids R² 곡선 x,y / R³ 곡면 x,y,z.",
      recording:"녹음 없음. 9/15 녹음 역참조: '12.1 지난번에 했다 — 문제는 주로 원주좌표계로, 구면좌표계는 뺀다', '3차원 점 찍기 = z=0으로 xy에 투영 후 z만큼 올리기'.",
      material:"필기_학습지_Lecture2-1_행렬과행렬식_아토풀이_14p.pdf — Ex05 소행렬식 9개·여인수, Ex06 여인수 전개 D=0(2열+3열=(a+b+c)·1열), Ex07 A⁻¹=[1 −½; −3 2], Ex8 det=−10·adj·A⁻¹=[3/5 0 −2/5; 1/5 0 1/5; −7/10 1/2 3/10], Ex9 (x,y)=(1/5,2/5), Ex10 크래머 (20/9, −1/3, 22/9). p.13 여백 질문 'j에 1을 못 넣나?' → 일반형 표기일 뿐, j=1이면 b가 첫 열.",
      notes:"학습지 필기: '여인수에 의해 부호 결정', '열이나 행 중에 기준을 쓰기', '행렬의 곱은 교환법칙 성립 X', '선언 필수(A·X·B)', '음의 부호 부착', '행렬은 괄호 · 행렬식은 절댓값'.",
      exam:[{t:"녹음 9/3 32:00 (적용)",quote:"중간고사 행렬 파트 2~3문제는 행렬식부터 — 손계산 3차까지, det 세로줄·행렬 괄호 표기, × 기호 금지.",memo:"이 주 내용(여인수 전개·3×3 역행렬·크래머)이 그 유형"},
            {t:"녹음 9/15 02:46",quote:"12.1은 시험 문제가 안 나오지만 뒤로 가서 그림이 나왔을 때 3차원 관계를 이해해야 한다.",memo:"12.1 = 그림 바탕"}],
      tasks:[{text:"시험 대비 재풀이: Ex06 여인수 전개(다른 행 기준으로도) · Ex8 3×3 역행렬 · Ex10 크래머 — 답 가리고 1회씩",due:"2026-09-22",src:"정리 9/8"},
             {text:"9/3 예고 강의자료실 연습문제(행렬·행렬식, 답안 포함) — LMS 토큰 연결 후 내려받기",due:"",src:"녹음 9/3 1:01:20"}],
      links:[]
    },report)||changed;
    /* ---- 3주차 (9/15 · 9/17) ---- */
    changed=fill(c,3,{
      range:"9/15 12.1 곡면 그리기·거리·구면 → 12.2 벡터 정의·위치벡터 · 9/17 12.2 두 점 벡터·크기·연산·표준기저·단위벡터 → 12.3 내적 정의",
      summary:"곡면·거리·구면 → 벡터 성분·크기·연산·표준기저·단위벡터 → 내적 정의 — 벡터부터 중간 범위, 시험은 표준기저벡터부터, |2a−3b| = 퀴즈, i j k 문제는 i j k로 답",
      textbook:"Stewart 12.1(Three-Dimensional Coordinate Systems: 곡면·거리 √(Δx²+Δy²+Δz²)·구면 (x−h)²+(y−k)²+(z−l)²=r²) · 12.2 Vectors(성분·크기 |a|=√(a₁²+a₂²+a₃²)·연산·표준기저 i,j,k·단위벡터 u=a/|a|) · 12.3 Dot Product 정의 a·b=a₁b₁+a₂b₂+a₃b₃, Thm 1 a·b=|a||b|cosθ(증명 9/22).",
      board:"9/15 판서 5장: Ex01 z=3 평면 · Ex02 (a) x²+y²=1,z=3 원 (b) x²+y²=1 원기둥면 (c) x²+y²≤1, 2≤z≤4 속 찬 원기둥 · 거리 공식·Ex03 · 구면 Ex04(중심 (−2,3,−1), r=2√2) · 12.2 벡터 기하·성분·위치벡터. 9/17 판서 4장: Ex01 AB=OB−OA=(−4,4,−3) · ★④ 표준기저 a=a₁i+a₂j+a₃k · ★⑤ 단위벡터 u=(1/|a|)a · Ex02 |2a−3b|=√98=7√2 · Ex03 2a+3b=14i+4j+15k(두 표기) · Ex04 ⅔i−⅓j−⅔k.",
      recording:"9/15 67분 — 모든 3D 그림은 z=0 기준 xy 평면 그림을 먼저 → z만큼 올림. 12.1은 시험 X, 벡터부터 중간 범위. 근호 정리 안 하면 감점. 채점은 교수 기준(그림+의미). 9/17 68분 — 위치벡터=점의 좌표, 두 점 벡터는 앞이 시작점(BA로 읽으면 뒤집힘), 크기=거리, 연산은 덧셈·뺄셈·실수배에만 닫힘(상등 2점짜리), 시험은 ④ 표준기저벡터부터, 단위벡터는 (1/|a|)a 꼴로 밝혀 쓰기, i j k 문제는 i j k로 답, 12.3 내적 = 중간 문제(점 진하게, × 금지). 결석 −1점·11회 F, 레포트 미제출 불이익.",
      material:"교재 예제 진행(강의자료 없음). 아토 필기 2장(9/17): 12.2 개념 ①~⑤ + Ex01~04 한 장, 12.3 Def 01·Thm 01(cosθ=a·b/(|a||b|)). ⚠ 필기 Ex02 i) (−5,−8,3) → 정답 (−5,8,3).",
      notes:"12.2 필기 = 녹음 앞 30분(판서 사진 없는 개념 부분) 그대로 기록, 대조 완료. 벡터 정리노트 PDF(0절 클리닉 30분 계획·공식 4개·연습 10문제·교육과정 결손표) 링크.",
      exam:[{t:"녹음 9/15 02:46",quote:"12.1은 시험 문제가 안 나오지만… 벡터부터 중간고사 관련 내용이 하나씩 들어간다.",memo:"중간 범위 시작 = 12.2"},
            {t:"녹음 9/15",quote:"근호 정리 안 하면 감점. 채점은 교수 기준 — 그림과 기하학적 의미까지.",memo:"√98 → 7√2"},
            {t:"녹음 9/17 20:46",quote:"시험 문제와 연관될 수 있는 문제는 네 번째(표준기저벡터)부터 들어간다.",memo:"①~③ 성분·크기·연산은 기본"},
            {t:"녹음 9/17 17:30",quote:"두 벡터가 같냐 — 벡터의 상등은 대학에서 물어보면 2점짜리 문제야.",memo:""},
            {t:"녹음 9/17 41:50",quote:"2배 a 벡터 마이너스 3배 b 벡터의 크기가 얼마냐 — 아마도 퀴즈 문제에 이런 문제가 나올 거예요.",memo:"|2a−3b| 유형"},
            {t:"녹음 9/17 47:43",quote:"문제에서 i j k 표준기저벡터로 표현됐으면 결과도 표준기저벡터로 답을 써야지 만점을 주는 거야.",memo:"표기 형태 따라가기"},
            {t:"녹음 9/17 58:40",quote:"12장 3절 dot product — 중간고사 문제에 관련된 내용.",memo:"내적 정의·Thm 1"},
            {t:"녹음 9/17 16:00",quote:"미적분학 클리닉 센터에서는 벡터의 연산 계산하는 걸 물어봐요. 크기 구하는 것까지.",memo:"클리닉 준비 = 연산·크기"}],
      tasks:[{text:"12.2 교재 연습문제 각자 풀기(교수 9/17 58:39 '진도가 느려서 나머지는 교재로')",due:"2026-09-22",src:"녹음 9/17"},
             {text:"벡터 정리노트 연습 Q1~Q10 답 가리고 풀기 (Q1~6 연산·크기·단위벡터, Q7~10 기저 표기·상등·내적)",due:"2026-09-22",src:"정리노트 9/17"},
             {text:"필기 Ex02 부호 고치기: (−5,−8,3) → (−5,8,3)",due:"2026-09-18",src:"정리 9/17"},
             {text:"레포트 공지 대기 — 중간·기말 때 제출, 미제출 시 불이익(9/17 00:00)",due:"",src:"녹음 9/17"}],
      links:[{label:"벡터 정리노트 12.1~12.3 도입 — 클리닉·중간 대비 (공식 4·연습 10·결손표)",url:"notes/calc2-vectors-0917.html"}]
    },report)||changed;
    /* ---- 회차 진도(빈 칸만) ---- */
    [["2026-09-08","학습지 (4)~(7) 소행렬식·여인수·역행렬·크래머 (결석 — 아토 풀이본으로 정리)"],
     ["2026-09-10","12.1 3차원 좌표계 도입 — 좌표계 3종·곡선/곡면·점 찍기 (지각)"],
     ["2026-09-15","12.1 곡면 그리기·거리·구면 → 12.2 벡터 정의·위치벡터"],
     ["2026-09-17","12.2 두 점 벡터·크기·연산·표준기저·단위벡터 → 12.3 내적 정의"]].forEach(function(r){ if(prog(c,r[0],r[1],report)) changed=true; });
    if(report.skipped.length){ if(window.console) console.warn("V35 보류(비정상 기존 값) — 다음 부팅에 재시도: "+report.skipped.join(", ")); if(changed) persist(); return; }   /* 미병합 항목이 있으면 완료 처리 보류 */
    t.patchV35a=true;
    try{ persist(); }                                  /* 변경이 없어도 플래그를 저장해 재실행을 막는다 */
    catch(e){ t.patchV35a=false; if(window.console) console.warn("V35 저장 실패 — 다음 부팅에 재시도", e); }
  };
  var _boot=boot;
  boot=function(){ _boot(); var ch=false; try{ var t0=term(); ch=!t0.patchV35a; V35.patch(); }catch(e){ if(window.console) console.warn("V35 패치 오류", e); } if(ch){ try{ render(); }catch(e){} } };   /* 이 레이어는 start() 호출문보다 앞에 삽입되므로 래퍼가 먼저 등록된다 */
  /* NOTES 목록에 벡터 정리노트 추가(정리 노트 카드·과목 자료) */
  if(Array.isArray(window.NOTES)&&!NOTES.some(function(n){return n.file==="notes/calc2-vectors-0917.html";})){
    NOTES.push({course:"미분적분학2",type:"정리",title:"벡터 정리노트 12.1~12.3 도입 — 클리닉·중간 대비",file:"notes/calc2-vectors-0917.html",week:3,date:"2026-09-17",sub:"공식 4 · 연습 10문제 · 시험은 표준기저벡터부터"});
  }
})();
