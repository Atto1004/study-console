# V65 시계 가볍게 (아톰 2026-10-03, BUILD .131, 대표님 「일단 최적화 한번 해줘」)
# 측정: 가만히 둔 학습앱이 10초에 레이아웃 601회 · 메인스레드 6.1% — 밀리초 시계가 매 프레임 상단바 전체를 다시 계산.
# 고침: ① 시:분:초·날짜는 바뀔 때만 쓴다 ② 밀리초 칸은 크기를 고정하고 넘침을 자른 상자(브라우저가 그 안만 다시 계산)
#       ③ 루프가 자기 요소에 묶이고, 상단바가 다시 그려져 시계가 빠지면 멈춘다(예전엔 id 로 찾아 루프가 겹칠 수 있었다)
# index.html 과 docs/layers/v65-layer-src.js 에 같은 치환. 두 번 돌려도 안전(이미 바뀌었으면 건너뜀).
import sys
ROOT = r"C:\Users\user\Desktop\아톰OS\기술실\study-console"
OLD_TICK = '''    var tick=function(){ var d=new Date();
      var h=$("#v65H"), m=$("#v65Ms"), dd=$("#v65D"); if(!h) return;
      h.textContent=p2(d.getHours())+":"+p2(d.getMinutes())+":"+p2(d.getSeconds()); m.textContent="."+p3(d.getMilliseconds());
      var s=(d.getMonth()+1)+"월 "+d.getDate()+"일 ("+DW[d.getDay()]+")"; if(dd.textContent!==s) dd.textContent=s;
      requestAnimationFrame(tick); };
    requestAnimationFrame(tick);'''
NEW_TICK = '''    /* 10/3 가볍게(BUILD .131): 시:분:초·날짜는 바뀔 때만 쓰고, 밀리초는 크기 고정 상자 안 글자만 바꾼다 — 상단바 전체 재계산 없음.
       루프는 이 시계에 묶여 있다가 시계가 화면에서 빠지면 멈춘다(예전엔 id 로 찾아서 다시 그릴 때마다 루프가 겹칠 수 있었다) */
    var H=el.querySelector("#v65H"), M=el.querySelector("#v65Ms").firstChild, D=el.querySelector("#v65D"), lastS=-1, lastD="";
    var tick=function(){ if(!el.isConnected) return; var d=new Date(), sec=d.getSeconds();
      if(sec!==lastS){ lastS=sec; H.textContent=p2(d.getHours())+":"+p2(d.getMinutes())+":"+p2(sec);
        var s=(d.getMonth()+1)+"월 "+d.getDate()+"일 ("+DW[d.getDay()]+")"; if(s!==lastD){ lastD=s; D.textContent=s; } }
      M.data="."+p3(d.getMilliseconds());
      requestAnimationFrame(tick); };
    requestAnimationFrame(tick);'''
OLD_CSS = '.v65-t small{font-size:15px;font-weight:700;color:var(--ink-3);margin-left:1px;display:inline-block;width:38px}'
NEW_CSS = '.v65-t small{font-size:15px;font-weight:700;color:var(--ink-3);margin-left:1px;display:inline-block;width:38px;height:17px;line-height:17px;overflow:hidden;vertical-align:-3px}'
OLD_CSS_M = '.v65-t small{font-size:12px;width:30px}'
NEW_CSS_M = '.v65-t small{font-size:12px;width:30px;height:14px;line-height:14px;vertical-align:-2px}'
for rel in ("index.html", r"docs\layers\v65-layer-src.js"):
    p = ROOT + "\\" + rel
    s = open(p, encoding="utf-8").read()
    if NEW_TICK in s:
        print(rel, "이미 바뀜"); continue
    for o, n in ((OLD_TICK, NEW_TICK), (OLD_CSS, NEW_CSS), (OLD_CSS_M, NEW_CSS_M)):
        if s.count(o) != 1:
            sys.exit(f"{rel}: 찾을 문자열 {s.count(o)}개 — 중단")
        s = s.replace(o, n)
    open(p, "w", encoding="utf-8", newline="").write(s)
    print(rel, "바꿈")
