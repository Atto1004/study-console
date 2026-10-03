# 공부계획 수면 반영 (아톰 2026-10-04, BUILD .160, 대표님 「취침한 시간 알려 줬는데 왜 얼위에 반영을 안 하는 거야」)
# 원인 ① V60.day 의 그날 밤 취침이 늘 설정값(01:00) — 말로 준 실제 취침(다음 날 기록의 bed)을 안 씀
#      ② 아침 빗금이 늘 00:00 부터 — 새벽 2시에 잤으면 0~2시는 깨어 있던 시간
#      ③ _private/sleep.json(말로 준 수면)을 페이지당 한 번만, 앱 기록 없는 날만 읽음 — 나중에 말한 건 새로고침 전까지 안 보임
# 고침: 다음 날 수면 기록의 bed 를 그날 취침으로 · 아침 빗금은 그날 bed 부터(T.sleepFrom) · sleep.json 60초마다 다시 읽고 말로 준 값(src said)은 갱신,
#       앱에서 직접 넣은 값은 그대로(직접 넣으면 src 를 지움).
import io, os, sys
ROOT = r"C:\Users\user\Desktop\아톰OS\기술실\study-console"
R = [
 ('''    var fx=V60.fixed(d), R=V60.R||{}, bed=toMin(V60.cfg("bed","01:00")), sleepH=''',
  '''    var nxs=V60.sleepOf(addDays(d,1));   /* 그날 밤 실제 취침 = 다음 날 수면 기록의 bed (대표님 10/4 「취침한 시간 알려 줬는데 반영 안 함」) */
    var fx=V60.fixed(d), R=V60.R||{}, bed=toMin((nxs&&nxs.bed)||V60.cfg("bed","01:00")), sleepH='''),
 ('''    return {d:d,blk:blk,stays:stays,wake:wake,bed:bedAbs,short:short,slept:slept,slots:slots,avail:avail};''',
  '''    var sleepFrom=(sl&&sl.bed&&toMin(sl.bed)<12*60)?toMin(sl.bed):0;   /* 새벽에 잤으면 그 전(0시~취침)은 깨어 있던 시간 — 아침 빗금 시작 */
    return {d:d,blk:blk,stays:stays,wake:wake,bed:bedAbs,sleepFrom:sleepFrom,short:short,slept:slept,slots:slots,avail:avail};'''),
 ('''(V60.sleepKnown(x.d,x.wake)?'<i class="v60-sleep" style="top:0;height:'+Math.max(0,(x.wake-H0)*PX)+'px"></i>':'')''',
  '''(V60.sleepKnown(x.d,x.wake)?'<i class="v60-sleep" style="top:'+Math.max(0,((x.sleepFrom||0)-H0)*PX)+'px;height:'+Math.max(0,(x.wake-Math.max(H0,x.sleepFrom||0))*PX)+'px"></i>':'')'''),
 ('''(V60.sleepKnown(T.d,T.wake)?'<i class="v60-dsl" style="top:0;height:'+y(T.wake)+'px"></i>':'')''',
  '''(V60.sleepKnown(T.d,T.wake)?'<i class="v60-dsl" style="top:'+y(T.sleepFrom||0)+'px;height:'+Math.max(0,y(T.wake)-y(T.sleepFrom||0))+'px"></i>':'')'''),
 ('''    if(V60._sl||!ATOM_HOSTED) return Promise.resolve(); V60._sl=1;''',
  '''    if(!ATOM_HOSTED||(V60._slAt&&Date.now()-V60._slAt<60000)) return Promise.resolve(); V60._slAt=Date.now(); V60._sl=1;   /* 60초마다 다시(10/4 — 나중에 말한 수면이 새로고침 전까지 안 보이던 것) */'''),
 ('''      if(!j) return; var st=V60.st(), n=0; st.sleep=st.sleep||{}; Object.keys(j).forEach(function(d){ if(!st.sleep[d]&&j[d]&&j[d].wake){ st.sleep[d]={bed:j[d].bed||"",wake:j[d].wake}; n++; } }); if(n) persist(); });''',
  '''      if(!j) return; var st=V60.st(), n=0; st.sleep=st.sleep||{};
      Object.keys(j).forEach(function(d){ var v=j[d]; if(!v||!v.wake) return; var cur=st.sleep[d], b=v.bed||"";
        if(!cur||(cur.src==="said"&&(cur.bed!==b||cur.wake!==v.wake))){ st.sleep[d]={bed:b,wake:v.wake,src:"said"}; n++; }   /* 말로 준 값은 새 말로 갱신 */
        else if(!cur.src&&cur.bed===b&&cur.wake===v.wake) cur.src="said"; });   /* 예전에 같은 값으로 채워 둔 것 = 말로 준 값 */
      if(n){ persist(); if(ui.view==="plan") V60.render(); } });'''),
 ('''    if(ATOM_HOSTED&&!V60._sl) pend.push(V60.loadSleep());''',
  '''    if(ATOM_HOSTED&&!V60._sl) pend.push(V60.loadSleep()); else if(ATOM_HOSTED) V60.loadSleep();   /* 그 뒤로는 기다리지 않고 60초마다 확인 */'''),
 ('''var o=st.sleep[td]||{}; o[inp.dataset.v60sleep]=inp.value; st.sleep[td]=o;''',
  '''var o=st.sleep[td]||{}; o[inp.dataset.v60sleep]=inp.value; delete o.src; st.sleep[td]=o;   /* 앱에서 직접 넣은 값 — 말로 준 값으로 덮지 않음 */'''),
]
for rel in ("index.html", r"docs\layers\v60-layer-src.js"):
    p = os.path.join(ROOT, rel)
    s = io.open(p, encoding="utf-8", newline="").read()
    if "sleepFrom:sleepFrom" in s:
        print(rel, "이미 바뀜"); continue
    nl = chr(13) + chr(10) if chr(13) + chr(10) in s else chr(10)
    for o, n in R:
        o, n = o.replace(chr(10), nl), n.replace(chr(10), nl)
        if s.count(o) != 1: sys.exit(f"{rel}: {o[:70]!r} {s.count(o)}개 — 중단")
        s = s.replace(o, n)
    io.open(p, "w", encoding="utf-8", newline="").write(s)
    print(rel, "바꿈")
