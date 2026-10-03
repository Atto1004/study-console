# V73 2단계 (아톰 2026-10-04, BUILD .159, 대표님)
#  「새로고침하면 과목 화면으로 돌아가는데, 마지막 위치 기억해서 보이던 화면에 있게」 → 화면·과목·스크롤·공부계획 날짜를 sessionStorage 에, 부팅 끝에 복원
#  「A++O(ao) 위치 기능 추가하면 뭐 해 — 공부계획 얼라이브위크에 반영 안 하면」 → 서버 위치점(/api/location/points, A++O·학습앱 공통)을 V72 체류 계산에 합침,
#     학습앱이 받은 위치도 서버로(같은 PC 안, 외부 주소 변환 없음)
#  「얼위 상단에 머무르는 곳 · 오늘 간 곳 · 이동 다 빼고, 위치 정보로 지금 어디 있는지 추정한 장소」 → V60.whereHTML 덮어쓰기(타임라인 내보내기 안내는 남김), 하루 경로 한 줄 뺌
# index.html 의 V73 블록과 docs/layers/v73-layer-src.js 에 같은 치환. 두 번 돌려도 안전.
import io, os, sys
ROOT = r"C:\Users\user\Desktop\아톰OS\기술실\study-console"
ADD = r'''  /* ⑤ 새로고침해도 보던 화면 그대로 (대표님 10/4 「새로고침하면 과목 화면으로 돌아가는데 마지막에 있던 위치 기억」) — 이 탭(sessionStorage)만, 12시간 안 */
  V73.SK="mc-last-view";
  V73.save=function(){ try{ sessionStorage.setItem(V73.SK,JSON.stringify({v:ui.view,c:ui.course,y:Math.round(window.scrollY||0),t:Date.now(),po:V60.ui.off||0,pw:V60.ui.week||0,pt:!!V60.ui.today})); }catch(e){} };
  if(typeof go==="function"){ var _go=go; go=function(){ var r=_go.apply(this,arguments); V73.save(); return r; }; }
  var svT=0; addEventListener("scroll",function(){ clearTimeout(svT); svT=setTimeout(V73.save,300); },{passive:true});
  addEventListener("pagehide",V73.save); document.addEventListener("visibilitychange",function(){ if(document.hidden) V73.save(); });
  V73.restore=function(){
    var s=null; try{ s=JSON.parse(sessionStorage.getItem(V73.SK)||"null"); }catch(e){} if(!s||!s.v||Date.now()-s.t>12*3600000) return;
    if(s.v==="plan"){ V60.ui.off=s.po||0; V60.ui.week=s.pw||0; V60.ui.today=!!s.pt; }
    if(s.v!==ui.view||s.c!==ui.course) go(s.v,s.c||undefined);
    var y=s.y||0, n=0; if(!y) return;
    var put=function(){ if(document.documentElement.scrollHeight>=y+innerHeight*0.6||n>24){ window.scrollTo(0,y); V73.save(); return; } n++; setTimeout(put,250); };   /* 내용이 다 그려질 때까지 기다렸다가 */
    setTimeout(put,300);
  };
  if(typeof boot==="function"){ var _bt=boot; boot=function(){ var r=_bt.apply(this,arguments); try{ V73.restore(); }catch(e){} return r; }; }

  /* ⑥ A++O 위치 = 공부계획 위치 (대표님 10/4) — 서버 위치점(A++O 화면·학습앱 공통, 이 PC 안)을 V72 체류 계산에 합친다. 이름 배우기·우선순위(V60.stayRank)는 그대로 */
  V73.srv=[]; V73.srvAt=0;
  V73.pull=function(force){
    if(!ATOM_HOSTED||(!force&&Date.now()-V73.srvAt<120000)) return; V73.srvAt=Date.now();
    fetch("/api/location/points?days=7",{cache:"no-store"}).then(function(r){ return r.ok?r.json():null; }).then(function(j){
      if(!j||!j.points) return; var ch=j.points.length!==V73.srv.length; V73.srv=j.points; if(ch&&ui.view==="plan") V60.render(); }).catch(function(){});
  };
  V73.pts=function(){ var own=window.V72?V72.st().pts:[]; var extra=V73.srv.filter(function(p){ return !own.some(function(q){ return Math.abs(q.t-p.t)<90000; }); });
    return own.concat(extra).sort(function(a,b){ return a.t-b.t; }); };
  if(window.V72){
    var _cl=V72.clusters; V72.clusters=function(){ var g=V72.st(), keep=g.pts; g.pts=V73.pts(); try{ return _cl.apply(this,arguments); } finally{ g.pts=keep; } };
    var _add=V72.add; V72.add=function(p){ var r=_add.apply(this,arguments);
      try{ var c=p&&p.coords; if(c&&c.accuracy<=1000) fetch("/api/location",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lat:c.latitude,lon:c.longitude,acc:c.accuracy,src:"study"})}).then(function(){ V73.pull(true); }).catch(function(){}); }catch(e){}
      return r; };
  }
  V73.pull(true); setInterval(function(){ if(!document.hidden) V73.pull(); },120000);
  document.addEventListener("visibilitychange",function(){ if(!document.hidden) V73.pull(true); });
  var agoS=function(ms){ var m=Math.max(0,Math.round((Date.now()-ms)/60000)); return m<1?"방금":m<60?m+"분 전":m<1440?Math.round(m/60)+"시간 전":Math.round(m/1440)+"일 전"; };
  /* 지금 추정 위치 — 30분 안 위치점이 있으면 그 자리(배운 이름, 모르면 「새 장소」), 아니면 체류 우선순위(V60.stayAt) */
  V73.now=function(){
    var pts=V73.pts(), last=pts.length?pts[pts.length-1]:null, lt=last?(last.t2||last.t):0;
    if(last&&Date.now()-lt<30*60000&&window.V72){ var cl=V72.clusters(), c=cl[cl.length-1], nm=c?V72.nameOf(c):null;
      return {place:nm||"새 장소",sub:nm?"":"처음 온 곳 — 이름을 말해 주시면 기억해요",when:agoS(lt)+" 위치 기준"}; }
    var st=V60.stayAt(today(),nowMin());
    return {place:st?st.place:"모름",sub:st?(st.sub||""):"",when:last?"마지막 위치 "+agoS(lt)+" · 그 뒤는 짐작":"위치 기록 없음"};
  };
  var _where=V60.whereHTML;
  V60.whereHTML=function(T){
    if(!T) return "";
    var nag=""; try{ var tmp=document.createElement("div"); tmp.innerHTML=_where(T)||""; var g=tmp.querySelector(".v60-tln"); if(g) nag=g.outerHTML; }catch(e){}   /* 22:30 이후 타임라인 내보내기 안내는 그대로(학습앱 세션 10/3) */
    if(T.d!==today()) return nag?'<div class="v60-where">'+nag+'</div>':"";
    var e=V73.now();
    return '<div class="v60-where v73-where"><span><small>지금 추정 위치</small><b>'+esc(e.place)+'</b>'+(e.sub?' '+esc(e.sub):'')+'<em>'+esc(e.when)+'</em></span>'+nag+'</div>';
  };

'''
R = [
 # 하루 경로 한 줄 뺌(대표님 「이동 이런 건 다 빼고」) — 오른쪽 장소 줄은 그대로
 ("    return {html:html,route:route};", "    return {html:html,route:\"\"};   /* 하루 경로 한 줄은 뺐다(대표님 10/4 「상단에 머무는 곳 · 오늘 간 곳 · 이동 다 빼고」) — 오른쪽 장소 줄은 그대로 */"),
 ("  var css=document.createElement(\"style\"); css.id=\"v73css\";", ADD + "  var css=document.createElement(\"style\"); css.id=\"v73css\";"),
 ("    \".v73-sb{display:flex;flex-wrap:wrap;gap:8px}\",",
  "    \".v73-sb{display:flex;flex-wrap:wrap;gap:8px}\",\n    \".v73-where em{font-style:normal;font-size:12px;color:var(--ink-3);margin-left:8px}\","),
 ("BUILD 2026-10-04.157)", "BUILD 2026-10-04.157 · .159 화면 기억 · A++O 위치 · 지금 추정 위치)"),
]
for rel in ("index.html", r"docs\layers\v73-layer-src.js"):
    p = os.path.join(ROOT, rel)
    s = io.open(p, encoding="utf-8", newline="").read()
    if "V73.restore=function" in s:
        print(rel, "이미 바뀜"); continue
    nl = chr(13) + chr(10) if chr(13) + chr(10) in s else chr(10)
    for o, n in R:
        o, n = o.replace(chr(10), nl), n.replace(chr(10), nl)
        if s.count(o) != 1: sys.exit(f"{rel}: {o[:60]!r} {s.count(o)}개 — 중단")
        s = s.replace(o, n)
    io.open(p, "w", encoding="utf-8", newline="").write(s)
    print(rel, "바꿈")
