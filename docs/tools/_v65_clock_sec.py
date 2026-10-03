# V65 시계 — 밀리초 빼고 초까지만 (아톰 2026-10-04, 대표님 「시계에 밀리초까지는 필요 없을 듯, 그냥 초로만」)
# .131 의 밀리초 숫자 띠(CSS 애니메이션)·위치 맞춤(sync)을 걷어낸다. JS 는 그대로 1초에 한 번 시:분:초·날짜만.
# index.html 과 docs/layers/v65-layer-src.js 에 같은 치환. 두 번 돌려도 안전.
import sys
ROOT = r"C:\Users\user\Desktop\아톰OS\기술실\study-console"
R = [
 ('''    var roll=function(sec){ var s='<span class="v65-w"><span class="v65-r" style="animation-duration:'+sec+'s">'; for(var i=0;i<10;i++) s+='<i>'+i+'</i>'; return s+'</span></span>'; };
    el.innerHTML='<span class="v65-t"><b id="v65H">--:--:--</b><small id="v65Ms">.'+roll(1)+roll(0.1)+roll(0.01)+'</small></span><span class="v65-d" id="v65D"></span>';''',
  '''    el.innerHTML='<span class="v65-t"><b id="v65H">--:--:--</b></span><span class="v65-d" id="v65D"></span>';   /* 10/4 밀리초 뺌 — 초까지만 */'''),
 ('''    /* 10/3 가볍게(BUILD .131, 대표님 「최적화 한번 해줘」): 예전엔 JS 가 1초에 60번 밀리초 글자를 바꿔 가만히 둬도 메인스레드 6%(시계 빼면 0.1%).
       이제 밀리초 = 숫자 띠를 CSS 애니메이션으로 굴린다(GPU) — 보이는 건 같고 JS 는 1초에 한 번 시:분:초·날짜만.
       시작 지연 -(지금 ms)로 벽시계와 맞추고, 탭에 돌아오면 다시 맞춘다. 시계가 화면에서 빠지면 타이머도 멈춘다(예전엔 id 로 찾아 루프가 겹칠 수 있었다) */
    var H=el.querySelector("#v65H"), D=el.querySelector("#v65D"), R=el.querySelectorAll(".v65-r"), lastD="";
    var sync=function(){   /* 애니메이션 위치를 직접 맞춘다(지연만 주면 그려지기 시작한 때부터라 0.3초쯤 늦었다). 애니메이션 시계는 이번 프레임 시작 시각이라 그 차이만큼 앞당긴다 */
      var lag=(document.timeline&&document.timeline.currentTime!=null&&window.performance)?Math.max(0,performance.now()-document.timeline.currentTime):0, ms=(Date.now()+lag)%1000;
      for(var i=0;i<R.length;i++){ var a=R[i].getAnimations?R[i].getAnimations()[0]:null; if(a) a.currentTime=ms; else R[i].style.animationDelay=(-ms)+"ms"; } };
    var tick=function(){ if(!el.isConnected){ document.removeEventListener("visibilitychange",onVis); return; } var d=new Date();
      H.textContent=p2(d.getHours())+":"+p2(d.getMinutes())+":"+p2(d.getSeconds());
      var s=(d.getMonth()+1)+"월 "+d.getDate()+"일 ("+DW[d.getDay()]+")"; if(s!==lastD){ lastD=s; D.textContent=s; }
      if(d.getSeconds()===0) sync();   /* 1분에 한 번 다시 맞춤 */
      setTimeout(tick, 1000-Date.now()%1000+5); };
    var onVis=function(){ if(!document.hidden) sync(); };
    document.addEventListener("visibilitychange",onVis);
    sync(); tick();''',
  '''    /* JS 는 1초에 한 번 시:분:초·날짜만(.131 가볍게). 시계가 화면에서 빠지면 타이머도 멈춘다(예전엔 id 로 찾아 루프가 겹칠 수 있었다) */
    var H=el.querySelector("#v65H"), D=el.querySelector("#v65D"), lastD="";
    var tick=function(){ if(!el.isConnected) return; var d=new Date();
      H.textContent=p2(d.getHours())+":"+p2(d.getMinutes())+":"+p2(d.getSeconds());
      var s=(d.getMonth()+1)+"월 "+d.getDate()+"일 ("+DW[d.getDay()]+")"; if(s!==lastD){ lastD=s; D.textContent=s; }
      setTimeout(tick, 1000-Date.now()%1000+5); };
    tick();'''),
]
for rel in ("index.html", r"docs\layers\v65-layer-src.js"):
    p = ROOT + "\\" + rel
    s = open(p, encoding="utf-8", newline="").read()
    if "v65-r" not in s.split("V65.clock=function")[1].split("V65.key")[0]:
        print(rel, "이미 바뀜"); continue
    for o, n in R:
        if s.count(o) != 1: sys.exit(f"{rel}: {o[:60]!r} {s.count(o)}개 — 중단")
        s = s.replace(o, n)
    open(p, "w", encoding="utf-8", newline="").write(s)
    print(rel, "바꿈")
