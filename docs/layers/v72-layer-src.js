/* ============================================================
   V72 LAYER — 앱을 열 때 내 위치 기록 (대표님 2026-10-03 「웹 열 때 내 위치 파악해서 달라질 때마다 기록하고, 자기 전에 타임라인 내보내기로 오차 수정」) (BUILD 2026-10-03.148)
   · atom(HTTPS) 안에서 열려 있을 때만: 열 때 · 다시 볼 때 · 열려 있는 동안 5분마다 navigator.geolocation (정확도 1 km 넘으면 버림)
   · S.geo.pts = 최근 7일 점({t,la,lo,a}) → 150 m(또는 정확도) 안에서 이어지는 점 = 한 체류. 위치는 앱 상태(atom kv)에만 — 외부로 보내지 않음(주소 변환 X)
   · 장소 이름: 대표님이 말한 체류(_private/plan.json stays, said)와 시간이 겹치면 그 이름을 그 좌표에 배움(S.geo.places) → 다음부터 그 근처 = 그 이름. 모르면 「새 장소」
   · 우선순위(V60.stayAt): 대표님 말(12시간 이하 체류) > 앱 위치 > 긴 숙소 체류. 밤(22:30~)에 오늘 타임라인 내보내기 안내 — 파일은 PC 가 매시간 timeline_import.py 로 반영
   ============================================================ */
(function(){
  if(window.V72) return;
  var V72=window.V72={busy:false,last:0};
  V72.st=function(){ if(!S.geo) S.geo={pts:[],places:{}}; S.geo.pts=S.geo.pts||[]; S.geo.places=S.geo.places||{}; return S.geo; };
  V72.dist=function(a,b,c,d){ var R=6371000, r=Math.PI/180, x=(d-b)*r*Math.cos((a+c)/2*r), y=(c-a)*r; return Math.sqrt(x*x+y*y)*R; };
  V72.add=function(p){
    var g=V72.st(), c=p.coords; if(!c||c.accuracy>1000) return;
    var pt={t:Date.now(),la:+c.latitude.toFixed(5),lo:+c.longitude.toFixed(5),a:Math.round(c.accuracy)}, L=g.pts[g.pts.length-1];
    if(L&&V72.dist(L.la,L.lo,pt.la,pt.lo)<Math.max(60,pt.a)&&pt.t-L.t<15*60000){ L.t2=pt.t; }     /* 같은 자리 · 15분 안 = 마지막 점의 끝 시각만 늘림 */
    else g.pts.push(pt);
    var cut=Date.now()-7*86400000; g.pts=g.pts.filter(function(x){ return (x.t2||x.t)>=cut; }).slice(-2000);
    persist(); if(ui.view==="plan"&&window.V60) V60.render();
  };
  V72.ping=function(){
    if(!window.ATOM_HOSTED||!navigator.geolocation||document.hidden||V72.busy) return;
    if(Date.now()-V72.last<4*60000) return; V72.busy=true; V72.last=Date.now();
    navigator.geolocation.getCurrentPosition(function(p){ V72.busy=false; try{ V72.add(p); }catch(e){} },function(){ V72.busy=false; },{enableHighAccuracy:false,maximumAge:120000,timeout:20000});
  };
  /* 점 → 체류 */
  V72.clusters=function(){
    var pts=V72.st().pts.slice().sort(function(a,b){ return a.t-b.t; }), out=[], cur=null;
    pts.forEach(function(p){
      if(cur&&V72.dist(cur.la,cur.lo,p.la,p.lo)<Math.max(150,p.a)){ cur.n++; cur.la+=(p.la-cur.la)/cur.n; cur.lo+=(p.lo-cur.lo)/cur.n; cur.t2=Math.max(cur.t2,p.t2||p.t); }
      else { cur={la:p.la,lo:p.lo,n:1,t:p.t,t2:p.t2||p.t}; out.push(cur); }
    });
    return out;
  };
  V72.stamp=function(ms){ var d=new Date(ms), z=function(n){ return (n<10?"0":"")+n; }; return d.getFullYear()+"-"+z(d.getMonth()+1)+"-"+z(d.getDate())+" "+z(d.getHours())+":"+z(d.getMinutes()); };
  V72.nameOf=function(c){ var P=V72.st().places, best=null, bd=1e9; Object.keys(P).forEach(function(k){ var d=V72.dist(c.la,c.lo,P[k].la,P[k].lo); if(d<Math.max(200,P[k].r||0)&&d<bd){ bd=d; best=k; } }); return best; };
  /* 대표님이 말한 짧은 체류와 겹치는 위치 → 그 이름을 배운다.
     10/4 버그: 끝 시각 없는(지금까지) 체류 「스타벅스」를 배우는 동안 집에서 잡힌 위치까지 「스타벅스」로 배움 →
     ① 끝 시각이 정해진 체류에서만 ② 위치 묶음 시간의 절반 이상이 그 체류 안일 때만 배운다. 예전 규칙으로 배운 이름은 한 번 비운다(geo.v=2) */
  V72.learn=function(said){
    var g=V72.st(), P=g.places, ch=false;
    if(g.v!==2){ g.places=P={}; g.v=2; ch=true; }
    var ms=function(t){ return new Date(String(t).replace(" ","T")).getTime(); };
    V72.clusters().forEach(function(c){ var dur=Math.max(60000,c.t2-c.t);
      said.forEach(function(s){ if(!s.to||!s.place||P[s.place]) return; var ov=Math.min(c.t2,ms(s.to))-Math.max(c.t,ms(s.from));
        if(ov>=dur*0.5){ P[s.place]={la:+c.la.toFixed(5),lo:+c.lo.toFixed(5),r:150}; ch=true; } }); });
    if(ch) persist();
  };
  V72.stays=function(){
    var said=((window.V60&&V60.pp&&V60.pp.stays)||[]).filter(function(s){ return !s.src||/^said/.test(s.src); }).filter(function(s){ var h=(new Date((s.to||V72.stamp(Date.now())).replace(" ","T"))-new Date(s.from.replace(" ","T")))/3600000; return h<=12; });
    try{ V72.learn(said); }catch(e){}
    return V72.clusters().map(function(c){ var nm=V72.nameOf(c);
      var open=Date.now()-c.t2<15*60000;   /* 마지막 확인이 15분 안이면 아직 거기 있는 것으로(끝 = 지금) */
      return {from:V72.stamp(c.t),to:open?null:V72.stamp(c.t2+60000),place:nm||"새 장소",sub:nm?"앱 위치":(c.la.toFixed(4)+", "+c.lo.toFixed(4)),src:"geo"}; });
  };
  document.addEventListener("visibilitychange",function(){ if(!document.hidden) V72.ping(); });
  setInterval(V72.ping,5*60000);
  setTimeout(V72.ping,3000);
})();
