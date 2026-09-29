/* 김주영 스앵님 판정 (대표님 2026-09-29 「개념 마인드맵은 스앵님이 학습을 통해 내가 뭘 알고 뭘 모르는지 알아서 파악」) — 원본은 이 파일 하나.
   빌더가 교실·수업 노트·학습 덱·암기노트 페이지에 그대로 넣고(__JUDGE__), learn.html·앱(V57)은 같은 글을 붙여 쓴다(docs/tools/sync_judge.py).
   기록 = localStorage atto.evidence [{t, k, n:[노드], ok, v, lid, sid, qid, clean}] (최대 4000건)
     k: quiz(ok) 확인 문제 · read(clean) 챕터·섹션 끝(다시 설명·질문 없이 끝났으면 clean) · again 다시 설명 · ask 질문 · memo(ok) 암기노트 외움 · self(v) 카드 자가평가
   판정 = 노드마다 atto.mastery[id] = {quiz:{correct,total,ts}, self, ts, score, state, auto} — learn.html · 앱 V47 · server.py 의 점수식이 그대로 읽는다.
     quiz = 최근 6번 · self(설명할 수 있나 1~5) = 읽음 4 · 다시 설명·질문 2번 이상이면 3 · 외움 +1 · 카드 자가평가가 더 최근이면 그 값
     → 문제 없이 읽기만 하면 최대 「흔들림」, 「안다」는 문제로만. 점수식 = (0.5·정답률 + 0.2·self/5)/0.7, 문제 없으면 self/5·0.6, 60일 감쇠(최저 0.4) */
(function(g){
  var EK="atto.evidence", MK="atto.mastery", CAP=4000;
  function rd(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)||"null"); return v==null?d:v; }catch(e){ return d; } }
  function decay(ts){ if(!ts) return 1; var d=Math.max(0,(Date.now()/1000-ts)/86400); return Math.max(.4,1-d/60); }
  function score(e){ var q=e.quiz||{}, tot=+q.total||0, cor=+q.correct||0, sv=e.self==null?null:Math.max(1,Math.min(5,+e.self));
    if(tot<=0&&sv==null) return {score:0,state:"unrated"};
    var raw=tot>0?(0.5*(cor/tot)+0.2*((sv||0)/5))/0.7:(sv/5)*0.6, s=Math.min(1,raw)*decay(Math.max(+e.ts||0,+q.ts||0)), st;
    if(tot<=0) st=(sv>=4&&s>=.4)?"shaky":"unknown"; else st=s>=.7?"known":s>=.4?"shaky":"unknown";
    return {score:Math.round(s*1000)/1000,state:st}; }
  function why(evs){ var qz=evs.filter(function(e){return e.k==="quiz";}).slice(-6), r={q:qz.length,c:qz.filter(function(e){return e.ok;}).length,
      read:evs.filter(function(e){return e.k==="read";}).length, clean:evs.filter(function(e){return e.k==="read"&&e.clean;}).length,
      conf:evs.filter(function(e){return (e.k==="again"||e.k==="ask")&&Date.now()-e.t<21*864e5;}).length,
      memo:null, self:null, last:0};
    evs.forEach(function(e){ if(e.k==="memo") r.memo=!!e.ok; if(e.k==="self") r.self={v:+e.v,t:e.t}; if(e.t>r.last) r.last=e.t; });
    return r; }
  function judgeOne(id,L,M){ var evs=L.filter(function(e){ return e&&e.n&&e.n.indexOf(id)>=0; }); if(!evs.length) return;
    var r=why(evs), e=Object.assign({},M[id]||{}), qz=evs.filter(function(x){return x.k==="quiz";}).slice(-6);
    var self=null; if(r.read||r.conf||r.memo!=null){ self=r.read?4:3; if(r.conf>=2) self=3; if(r.memo) self=Math.min(5,self+1); }
    var autoLast=0; evs.forEach(function(x){ if(x.k!=="self"&&x.t>autoLast) autoLast=x.t; });
    if(r.self&&r.self.t>=autoLast) self=r.self.v;
    e.quiz=qz.length?{correct:r.c,total:qz.length,ts:Math.round(qz[qz.length-1].t/1000)}:undefined; if(!e.quiz) delete e.quiz;
    e.self=self; if(self==null) delete e.self;
    e.ts=Math.round(r.last/1000); e.auto={by:"tutor",q:r.q,c:r.c,read:r.read,clean:r.clean,conf:r.conf,memo:r.memo};
    var s=score(e); e.score=s.score; e.state=s.state; M[id]=e; }
  function judge(ids){ var L=rd(EK,[]), M=rd(MK,{}); if(!Array.isArray(L)) L=[]; (ids||[]).forEach(function(id){ judgeOne(id,L,M); });
    try{ localStorage.setItem(MK,JSON.stringify(M)); }catch(e){} return M; }
  function all(){ var L=rd(EK,[]), o={}; if(Array.isArray(L)) L.forEach(function(e){ (e&&e.n||[]).forEach(function(i){ o[i]=1; }); }); return judge(Object.keys(o)); }
  function rec(ev){ if(!ev||!Array.isArray(ev.n)||!ev.n.length) return; var L=rd(EK,[]); if(!Array.isArray(L)) L=[];
    ev.t=Date.now(); L.push(ev); if(L.length>CAP) L=L.slice(L.length-CAP);
    try{ localStorage.setItem(EK,JSON.stringify(L)); }catch(e){ try{ L=L.slice(-Math.floor(CAP/2)); localStorage.setItem(EK,JSON.stringify(L)); }catch(x){} }
    judge(ev.n); }
  function reasons(id){ var L=rd(EK,[]); if(!Array.isArray(L)) return null; var evs=L.filter(function(e){ return e&&e.n&&e.n.indexOf(id)>=0; }); return evs.length?why(evs):null; }
  g.TJ={rec:rec,judge:judge,all:all,score:score,reasons:reasons};
})(typeof window!=="undefined"?window:this);
