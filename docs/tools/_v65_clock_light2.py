# V65 시계 가볍게 2단계 (아톰 2026-10-03, BUILD .131) — _v65_clock_light.py 다음에 돌린다.
# 1단계(크기 고정 상자)로는 5.9% 그대로였다: 시계를 빼면 0.1% — 비용은 레이아웃이 아니라 '1초에 60번 JS 가 글자를 바꿔 다시 그리기'.
# 2단계: 밀리초 세 자리를 0~9 숫자 띠로 만들고 CSS 애니메이션(transform·steps)으로 굴린다 → GPU(컴포지터)가 돌리고 JS 는 1초에 한 번만.
#   백의 자리 1초 · 십의 자리 0.1초 · 일의 자리 0.01초 주기. 시작 지연을 -(지금 ms)로 줘서 벽시계 ms 와 맞춘다(돌아올 때 다시 맞춤).
import sys
ROOT = r"C:\Users\user\Desktop\아톰OS\기술실\study-console"
OLD_HTML = '''    el.innerHTML='<span class="v65-t"><b id="v65H">--:--:--</b><small id="v65Ms">.000</small></span><span class="v65-d" id="v65D"></span>';'''
NEW_HTML = '''    var roll=function(sec){ var s='<span class="v65-w"><span class="v65-r" style="animation-duration:'+sec+'s">'; for(var i=0;i<10;i++) s+='<i>'+i+'</i>'; return s+'</span></span>'; };
    el.innerHTML='<span class="v65-t"><b id="v65H">--:--:--</b><small id="v65Ms">.'+roll(1)+roll(0.1)+roll(0.01)+'</small></span><span class="v65-d" id="v65D"></span>';'''
OLD_TICK = '''    /* 10/3 가볍게(BUILD .131): 시:분:초·날짜는 바뀔 때만 쓰고, 밀리초는 크기 고정 상자 안 글자만 바꾼다 — 상단바 전체 재계산 없음.
       루프는 이 시계에 묶여 있다가 시계가 화면에서 빠지면 멈춘다(예전엔 id 로 찾아서 다시 그릴 때마다 루프가 겹칠 수 있었다) */
    var H=el.querySelector("#v65H"), M=el.querySelector("#v65Ms").firstChild, D=el.querySelector("#v65D"), lastS=-1, lastD="";
    var tick=function(){ if(!el.isConnected) return; var d=new Date(), sec=d.getSeconds();
      if(sec!==lastS){ lastS=sec; H.textContent=p2(d.getHours())+":"+p2(d.getMinutes())+":"+p2(sec);
        var s=(d.getMonth()+1)+"월 "+d.getDate()+"일 ("+DW[d.getDay()]+")"; if(s!==lastD){ lastD=s; D.textContent=s; } }
      M.data="."+p3(d.getMilliseconds());
      requestAnimationFrame(tick); };
    requestAnimationFrame(tick);'''
NEW_TICK = '''    /* 10/3 가볍게(BUILD .131, 대표님 「최적화 한번 해줘」): 예전엔 JS 가 1초에 60번 밀리초 글자를 바꿔 가만히 둬도 메인스레드 6%(시계 빼면 0.1%).
       이제 밀리초 = 숫자 띠를 CSS 애니메이션으로 굴린다(GPU) — 보이는 건 같고 JS 는 1초에 한 번 시:분:초·날짜만.
       시작 지연 -(지금 ms)로 벽시계와 맞추고, 탭에 돌아오면 다시 맞춘다. 시계가 화면에서 빠지면 타이머도 멈춘다(예전엔 id 로 찾아 루프가 겹칠 수 있었다) */
    var H=el.querySelector("#v65H"), D=el.querySelector("#v65D"), R=el.querySelectorAll(".v65-r"), lastD="";
    var sync=function(){ var ms=Date.now()%1000; for(var i=0;i<R.length;i++) R[i].style.animationDelay=(-ms)+"ms"; };
    var tick=function(){ if(!el.isConnected){ document.removeEventListener("visibilitychange",onVis); return; } var d=new Date();
      H.textContent=p2(d.getHours())+":"+p2(d.getMinutes())+":"+p2(d.getSeconds());
      var s=(d.getMonth()+1)+"월 "+d.getDate()+"일 ("+DW[d.getDay()]+")"; if(s!==lastD){ lastD=s; D.textContent=s; }
      setTimeout(tick, 1000-Date.now()%1000+5); };
    var onVis=function(){ if(!document.hidden) sync(); };
    document.addEventListener("visibilitychange",onVis);
    sync(); tick();'''
OLD_CSS = '.v65-t small{font-size:15px;font-weight:700;color:var(--ink-3);margin-left:1px;display:inline-block;width:38px;height:17px;line-height:17px;overflow:hidden;vertical-align:-3px}'
NEW_CSS = OLD_CSS + '.v65-w{display:inline-block;height:17px;overflow:hidden;vertical-align:top}.v65-r{display:block;will-change:transform;animation:v65roll 1s steps(10) infinite}.v65-r i{display:block;font-style:normal;height:17px;line-height:17px}@keyframes v65roll{to{transform:translateY(-100%)}}'
OLD_CSS_M = '.v65-t small{font-size:12px;width:30px;height:14px;line-height:14px;vertical-align:-2px}'
NEW_CSS_M = OLD_CSS_M + '.v65-w,.v65-r i{height:14px;line-height:14px}'
for rel in ("index.html", r"docs\layers\v65-layer-src.js"):
    p = ROOT + "\\" + rel
    s = open(p, encoding="utf-8").read()
    if "v65roll" in s:
        print(rel, "이미 바뀜"); continue
    for o, n in ((OLD_HTML, NEW_HTML), (OLD_TICK, NEW_TICK), (OLD_CSS, NEW_CSS), (OLD_CSS_M, NEW_CSS_M)):
        if s.count(o) != 1:
            sys.exit(f"{rel}: 찾을 문자열 {s.count(o)}개 — 중단")
        s = s.replace(o, n)
    open(p, "w", encoding="utf-8", newline="").write(s)
    print(rel, "바꿈")
