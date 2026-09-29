/* 김주영 스앵님 판정 (대표님 2026-09-29 「개념 마인드맵은 스앵님이 학습을 통해 내가 뭘 알고 뭘 모르는지 알아서 파악」) — 원본은 이 파일 하나.
   빌더가 교실·수업 노트·학습 덱·암기노트 페이지에 그대로 넣고(__JUDGE__), learn.html 은 patch_learn_judge.py 가 TJ-START~TJ-END 사이를 이 파일로 갈아 끼운다.
   기록 = localStorage atto.evidence [{t, k, n:[노드], ok, v, lid, sid, qid, a, clean}] (최대 4000건 — 넘치면 읽기·질문 기록부터 버리고 노드마다 최근 문제 6건은 남긴다)
     k: quiz(ok) 확인 문제 · read(clean) 챕터·섹션 끝(다시 설명·질문 없이 끝났으면 clean) · again 다시 설명 · ask 질문 · memo(ok) 암기노트 외움 · self(v) 카드 자가평가
     a: 같은 시도 표시(카드 「다시 저장」) — 같은 a·qid 는 새 기록으로 바꿔 넣는다(정답 수가 늘지 않는다)
   판정 = 노드마다 atto.mastery[id] = {quiz:{correct,total,ts}, self, sts, ts, score, state, auto} — learn.html 은 TJ.score 로 같은 식을 쓴다.
     quiz = 최근 6번 · self(설명할 수 있나 1~5) = 읽음 4 · 다시 설명·질문 2번 이상이면 3 · 외움 +1 · 카드 자가평가가 더 최근이면 그 값
     → 문제 없이 읽기만 하면 최대 「흔들림」, 「안다」는 문제로만. 점수식 = (0.5·정답률·감쇠(quiz.ts) + 0.2·self/5·감쇠(sts))/0.7, 문제 없으면 self/5·0.6·감쇠(sts)
     감쇠 = 60일에 걸쳐 1 → 0.4 (최저 0.4). 정답 근거와 읽기·암기 근거를 따로 감쇠한다 — 오늘 암기 체크 하나로 90일 전 정답이 새것처럼 되지 않게(오타 .91 설계 검수 ⑦)
   저장이 막히면(용량·사생활 모드) 이 페이지 안에서는 메모리 사본으로 이어 가고 rec 은 false 를 돌려준다. */
(function(g){
  var EK="atto.evidence", MK="atto.mastery", CAP=4000, KEEPQ=6, MEM={}, DIRTY={};
  function rd(k,d){ if(DIRTY[k]) return MEM[k]; try{ var v=JSON.parse(localStorage.getItem(k)||"null"); return v==null?d:v; }catch(e){ return DIRTY[k]?MEM[k]:d; } }
  function wr(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); DIRTY[k]=false; return true; }catch(e){ MEM[k]=v; DIRTY[k]=true; return false; } }
  function decay(ts){ if(!ts) return 1; var d=Math.max(0,(Date.now()/1000-ts)/86400); return Math.max(.4,1-d/60); }
  function score(e){ if(!e||typeof e!=="object") return {score:0,state:"unrated"};
    var q=e.quiz||{}, tot=+q.total||0, cor=+q.correct||0, sv=e.self==null?null:Math.max(1,Math.min(5,+e.self));
    if(tot<=0&&sv==null) return {score:0,state:"unrated"};
    var dq=decay(+q.ts||+e.ts||0), ds=decay(+e.sts||+e.ts||0);
    var raw=tot>0?(0.5*(cor/tot)*dq+0.2*((sv||0)/5)*ds)/0.7:(sv/5)*0.6*ds, s=Math.min(1,raw), st;
    if(tot<=0) st=(sv>=4&&s>=.4)?"shaky":"unknown"; else st=s>=.7?"known":s>=.4?"shaky":"unknown";
    return {score:Math.round(s*1000)/1000,state:st}; }
  function why(evs){ var qz=evs.filter(function(e){return e.k==="quiz";}).slice(-KEEPQ), r={q:qz.length,c:qz.filter(function(e){return e.ok;}).length,
      read:evs.filter(function(e){return e.k==="read";}).length, clean:evs.filter(function(e){return e.k==="read"&&e.clean;}).length,
      conf:evs.filter(function(e){return (e.k==="again"||e.k==="ask")&&Date.now()-e.t<21*864e5;}).length,
      memo:null, self:null, last:0, selfLast:0};
    evs.forEach(function(e){ if(e.k==="memo") r.memo=!!e.ok; if(e.k==="self") r.self={v:+e.v,t:e.t}; if(e.t>r.last) r.last=e.t; if(e.k!=="quiz"&&e.t>r.selfLast) r.selfLast=e.t; });
    return r; }
  function judgeOne(id,L,M){ var evs=L.filter(function(e){ return e&&e.n&&e.n.indexOf(id)>=0; }); if(!evs.length) return;
    var r=why(evs), e=Object.assign({},M[id]||{}), qz=evs.filter(function(x){return x.k==="quiz";}).slice(-KEEPQ);
    var self=null; if(r.read||r.conf||r.memo!=null){ self=r.read?4:3; if(r.conf>=2) self=3; if(r.memo) self=Math.min(5,self+1); }
    var autoLast=0; evs.forEach(function(x){ if(x.k!=="self"&&x.t>autoLast) autoLast=x.t; });
    if(r.self&&r.self.t>=autoLast) self=r.self.v;
    e.quiz=qz.length?{correct:r.c,total:qz.length,ts:Math.round(qz[qz.length-1].t/1000)}:undefined; if(!e.quiz) delete e.quiz;
    e.self=self; if(self==null){ delete e.self; delete e.sts; } else e.sts=Math.round(r.selfLast/1000);
    e.ts=Math.round(r.last/1000); e.auto={by:"tutor",q:r.q,c:r.c,read:r.read,clean:r.clean,conf:r.conf,memo:r.memo};
    var s=score(e); e.score=s.score; e.state=s.state; M[id]=e; }
  function judge(ids){ var L=rd(EK,[]), M=rd(MK,{}); if(!Array.isArray(L)) L=[]; if(!M||typeof M!=="object") M={}; (ids||[]).forEach(function(id){ judgeOne(id,L,M); });
    wr(MK,M); return M; }
  function all(){ var L=rd(EK,[]), o={}; if(Array.isArray(L)) L.forEach(function(e){ (e&&e.n||[]).forEach(function(i){ o[i]=1; }); }); return judge(Object.keys(o)); }
  /* 상한 넘침: 노드마다 최근 문제 KEEPQ 건은 지키고, 나머지(읽기·질문·오래된 문제)에서 오래된 것부터 버린다 — 다른 노드 활동으로 정답 기록이 사라지지 않게 */
  function trim(L,cap){ cap=cap||CAP; if(L.length<=cap) return L; var seen={}, keep=[], rest=[], i;
    for(i=L.length-1;i>=0;i--){ var e=L[i], k=false; if(e&&e.k==="quiz") (e.n||[]).forEach(function(id){ seen[id]=(seen[id]||0)+1; if(seen[id]<=KEEPQ) k=true; }); (k?keep:rest).push(e); }
    keep.reverse(); rest.reverse(); rest=rest.slice(Math.max(0,rest.length-Math.max(0,cap-keep.length)));
    return keep.concat(rest).sort(function(a,b){ return (a.t||0)-(b.t||0); }); }
  function rec(ev){ if(!ev||!Array.isArray(ev.n)||!ev.n.length) return false; var L=rd(EK,[]); if(!Array.isArray(L)) L=[];
    ev.t=Date.now();
    if(ev.a!=null&&ev.qid!=null){ for(var i=L.length-1;i>=0;i--){ var x=L[i]; if(x&&x.k===ev.k&&x.qid===ev.qid&&x.a===ev.a){ L.splice(i,1); break; } } }
    L.push(ev); L=trim(L);
    /* 저장 실패 → 절반 상한으로 다시(이때도 노드마다 최근 정답은 지킨다, 오타 설계 2차) · 그래도 실패면 메모리 사본은 자르지 않은 전체로 */
    var ok=wr(EK,L); if(!ok){ var half=trim(L,Math.floor(CAP/2)); if(wr(EK,half)){ L=half; ok=true; } else { MEM[EK]=L; DIRTY[EK]=true; } }
    judge(ev.n); return ok; }
  function reasons(id){ var L=rd(EK,[]); if(!Array.isArray(L)) return null; var evs=L.filter(function(e){ return e&&e.n&&e.n.indexOf(id)>=0; }); return evs.length?why(evs):null; }
  g.TJ={rec:rec,judge:judge,all:all,score:score,reasons:reasons,trim:trim};
})(typeof window!=="undefined"?window:this);
