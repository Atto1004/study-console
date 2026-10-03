# 공부계획 현재 시각 (아톰 2026-10-03, BUILD .132, 대표님 「공부계획에 현재시간 표시 안 되어 있고」)
# ① 오늘만: 표에 현재 시각 줄이 아예 없었다 → 지난 일정과 다음 일정 사이에 「지금 HH:MM」 줄
# ② 이번 주: 줄은 있었지만 2px 빨강이라 같은 빨강 과제 블록에 묻혀 안 보였다 → 진한 줄 + 흰 테두리 + 시각 표시, 블록 위
# ③ 두 줄 다 한 번 그리고 멈춰 있었다 → 30초마다 위치·시각만 옮긴다(전체 다시 그리기·캘린더 재조회 없음, 지난 줄 흐리게도 갱신)
# index.html 과 docs/layers/v60-layer-src.js 에 같은 치환. 두 번 돌려도 안전.
import sys
ROOT = r"C:\Users\user\Desktop\아톰OS\기술실\study-console"
R = [
 # 오늘만: 행에 시작·끝 시각을 달고, 지금 줄을 끼운다
 ('''    var list=rows.map(function(b,ri){ var past=b.e<=nowM, cur=b.s<=nowM&&nowM<b.e, act="";''',
  '''    var trs=rows.map(function(b,ri){ var past=b.e<=nowM, cur=b.s<=nowM&&nowM<b.e, act="";'''),
 ('''      return '<div class="v60-tr'+(past?' past':'')+(cur?' cur':'')+'"><span class="v60-tt">'+hm2(b.s)''',
  '''      return '<div class="v60-tr'+(past?' past':'')+(cur?' cur':'')+'" data-s="'+b.s+'" data-e="'+b.e+'"><span class="v60-tt">'+hm2(b.s)'''),
 ('''+placeCell(ri)+'</div>'; }).join("");
    if(T){ list+='<div class="v60-tr bed">''',
  '''+placeCell(ri)+'</div>'; });
    /* 지금 줄 (대표님 10/3 「현재시간 표시 안 되어 있고」) — 아직 시작 안 한 첫 일정 앞. 30초마다 V60.nowTick 이 옮긴다 */
    if(trs.length){ var ni=0; while(ni<rows.length&&rows[ni].s<=nowM) ni++; trs.splice(ni,0,'<div class="v60-nowrow" id="v60NowRow"><span class="v60-nowt">'+hm2(nowM)+'</span><i class="v60-nowl"></i></div>'); }
    var list=trs.join("");
    if(T){ list+='<div class="v60-tr bed">'''),
 # 이번 주: 줄에 시각 표시
 ('''        (isT&&nowM>H0?'<i class="v60-now" style="top:'+((nowM-H0)*PX)+'px"></i>':'')+'</div></div>';''',
  '''        (isT&&nowM>H0&&nowM<H1?'<i class="v60-now" style="top:'+((nowM-H0)*PX)+'px"><b>'+hm(nowM)+'</b></i>':'')+'</div></div>';'''),
 ('''    var H0=7*60, H1=26*60, PX=0.62, nowM=nowMin();''',
  '''    var H0=7*60, H1=26*60, PX=0.62, nowM=nowMin(); V60._g={H0:H0,H1:H1,PX:PX};'''),
 # CSS: 진한 줄 + 흰 테두리 + 시각 알약, 블록 위 / 오늘만 지금 줄
 ('''.v60-now{position:absolute;left:0;right:0;height:2px;background:#C7261B;z-index:3}''',
  '''.v60-now{position:absolute;left:-3px;right:-3px;height:3px;margin-top:-1px;background:#1d1d1f;box-shadow:0 0 0 1.5px #fff;border-radius:2px;z-index:6;pointer-events:none}.v60-now b{position:absolute;right:2px;top:-9px;font-style:normal;font-weight:800;font-size:10.5px;line-height:1;font-variant-numeric:tabular-nums;color:#fff;background:#1d1d1f;border:1.5px solid #fff;border-radius:8px;padding:2px 5px}.v60-nowrow{display:flex;align-items:center;gap:10px;margin:4px 0;color:#1d1d1f}.v60-nowt{flex:none;font-weight:800;font-size:13px;font-variant-numeric:tabular-nums;background:#1d1d1f;color:#fff;border-radius:10px;padding:3px 9px}.v60-nowl{flex:1;height:3px;border-radius:2px;background:#1d1d1f;position:relative}.v60-nowl::before{content:'';position:absolute;left:-4px;top:-3.5px;width:10px;height:10px;border-radius:50%;background:#1d1d1f}'''),
]
TICK_ANCHOR = '''  /* ---------- 오늘의 이동 경로'''
TICK = '''  /* 지금 줄 옮기기 (대표님 10/3 「현재시간 표시」) — 30초마다 위치·시각만. 전체 다시 그리기·캘린더 재조회는 하지 않는다 */
  V60.nowTick=function(){
    if(document.hidden) return; var m=nowMin(), g=V60._g;
    var ln=document.querySelector(".v60-col.today .v60-now"); if(ln&&g){ ln.style.top=((m-g.H0)*g.PX)+"px"; var lb=ln.querySelector("b"); if(lb) lb.textContent=hm(m); }
    var nr=document.getElementById("v60NowRow"); if(!nr||!nr.parentNode) return;
    var t=nr.querySelector(".v60-nowt"); if(t) t.textContent=hm(m);
    var trs=nr.parentNode.querySelectorAll(".v60-tr[data-s]"), nx=null;
    for(var i=0;i<trs.length;i++){ var s=+trs[i].getAttribute("data-s"), e=+trs[i].getAttribute("data-e");
      trs[i].classList.toggle("past",e<=m); if(!nx&&s>m) nx=trs[i]; }
    if(!nx) nx=nr.parentNode.querySelector(".v60-tr.bed");
    if(nx&&nr.nextElementSibling!==nx) nr.parentNode.insertBefore(nr,nx);
  };
  if(!V60._nowT) V60._nowT=setInterval(V60.nowTick,30000);

'''
for rel in ("index.html", r"docs\layers\v60-layer-src.js"):
    p = ROOT + "\\" + rel
    s = open(p, encoding="utf-8").read()
    if "V60.nowTick" in s:
        print(rel, "이미 바뀜"); continue
    for o, n in R:
        if s.count(o) != 1: sys.exit(f"{rel}: {o[:50]!r} {s.count(o)}개 — 중단")
        s = s.replace(o, n)
    if s.count(TICK_ANCHOR) != 1: sys.exit(f"{rel}: 앵커 {s.count(TICK_ANCHOR)}")
    s = s.replace(TICK_ANCHOR, TICK + TICK_ANCHOR)
    open(p, "w", encoding="utf-8", newline="").write(s)
    print(rel, "바꿈")
