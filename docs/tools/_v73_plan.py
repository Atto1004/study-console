# 공부계획 하루 보기 개편 (아톰 2026-10-04, BUILD .157, 대표님)
#  「오늘만에서 어제랑 내일로 이동」 → 하루 보기 ‹ 오늘 › 로 날짜 넘기기 (V60.ui.off)
#  「위치 표시는 항상 우측」 → 시간표 오른쪽에 장소 줄(lane) — 폰에서도. 칸 안의 장소 칸(.v60-dp)은 뺀다
#  「이동할 때 어떤 시점에 어디서 어디로 이동했는지 한눈에」 → 장소 줄 경계에 「14:30 집 → 카페」, 위쪽에 하루 경로 한 줄
#  「혼자 풀기는 공부계획에 넣지 말고 그 과목에만」 → V60.filesHTML 에서 .html(혼자 풀기) 빼고, 과목 화면에 혼자 풀기 칸(V73)
#  「오늘만 · 이번 주 · 다음 주 버튼 말고 구글 캘린더처럼 1day · 1week 아이콘」 → 보기 아이콘 2개 + ‹ 오늘 › 이동
# index.html 과 docs/layers/v60-layer-src.js 에 같은 치환 + index.html 에 V73 LAYER(docs/layers/v73-layer-src.js) 삽입. 두 번 돌려도 안전.
import io, os, sys
ROOT = r"C:\Users\user\Desktop\아톰OS\기술실\study-console"
R = [
 # ① 하루 보기 날짜 오프셋
 ('''  V60.ui={week:0,day:null,today:''', '''  V60.ui={week:0,off:0,day:null,today:'''),
 # ② 보기 전환 = 아이콘 2개 + ‹ 오늘 › (구글 캘린더식)
 ('''    var seg='<div class="seg" id="v60Wk">''',
  '''    var seg=(V60.viewBar?V60.viewBar():'')+'<div hidden>';   /* 10/4 아이콘 보기 전환(V60.viewBar) — 아래 예전 버튼 줄은 숨김 자리만 */
    seg+='<div class="seg" id="v60WkOld">'''),
 # ③ 하루 보기 = 고른 날(어제·내일…) — 오늘이 아닌 주면 그 주 계획을 따로 계산
 ('''    var grid=V60.ui.today?V60.todayHTML(T,nowM,seg)''',
  '''    var selD=addDays(td,V60.ui.off||0), TS=T;
    if(V60.ui.today&&selD!==td){ TS=P.days.filter(function(x){ return x.d===selD; })[0];
      if(!TS){ var mon2=mondayOf(selD); TS=V60.plan(mon2).days.filter(function(x){ return x.d===selD; })[0];
        if(ATOM_HOSTED&&window.V25&&V25.atomCal&&V60._calW!==mon2){ V60._calW=mon2; V25.atomCal(mon2,addDays(mon2,6),function(fresh){ if(fresh&&ui.view==="plan") V60.render(); }); } } }
    seg+='</div>';
    var grid=V60.ui.today?V60.todayHTML(TS,selD<td?1441:selD>td?-1:nowM,seg)'''),
 # ④ 버튼 동작
 ('''    $$("#v60Wk button",body).forEach''',
  '''    if(V60.viewBind) V60.viewBind(body);
    $$("#v60WkOld button",body).forEach'''),
 # ⑤ 칸 안 장소 칸 빼기 — 장소는 오른쪽 장소 줄에서
 ('''      var pc=b.stay?''', '''      var pc=V60.LANE?'':b.stay?'''),
 # ⑥ 하루 보기 머리 = 고른 날 이름 + 하루 경로 + 오른쪽 장소 줄
 ('''    return '<div class="card v60-today"><div class="card-h"><h3>오늘 '+esc(V60.md(today()))''',
  '''    var lane=V60.LANE&&T&&V60.laneOf?V60.laneOf(T,rows,places,y,H):null;
    return '<div class="card v60-today"><div class="card-h"><h3>'+esc(V60.dayName?V60.dayName(T?T.d:today()):'오늘')+' '+esc(V60.md(T?T.d:today()))'''),
 ('''+V60.whereHTML(T)+
      '<div class="v60-day"><div class="v60-dhs" style="height:'+H+'px">'+hrs+'</div><div class="v60-dcol" style="height:'+H+'px;background-size:100% '+PXH+'px">'+shade+blks+bed+now+'</div></div></div></div>';''',
  '''+V60.whereHTML(T)+(lane?lane.route:'')+
      '<div class="v60-day'+(lane?' lane':'')+'"><div class="v60-dhs" style="height:'+H+'px">'+hrs+'</div><div class="v60-dcol" style="height:'+H+'px;background-size:100% '+PXH+'px">'+shade+blks+bed+now+'</div>'+(lane?lane.html:'')+'</div></div></div>';'''),
 # ⑥-2 주 보기 제목 = 지난 주 · 이번 주 · 다음 주 · N주 뒤
 ("""<h3>'+(V60.ui.week?'다음 주':'이번 주')+""", """<h3>'+(V60.weekName?V60.weekName(V60.ui.week):(V60.ui.week?'다음 주':'이번 주'))+"""),
 # ⑦ 혼자 풀기(.html)는 공부계획·달력 목록에서 빼고 과목 화면에만(V73)
 ('''  V60.filesHTML=function(a){
    var fs=V60.filesFor(a); if(!fs.length) return "";''',
  '''  V60.filesHTML=function(a){
    var fs=V60.filesFor(a).filter(function(f){ return !/\\.html(\\?|#|$)/.test(f.file)&&!/혼자\\s*풀기/.test(f.label||""); }); if(!fs.length) return "";   /* 혼자 풀기는 그 과목 화면에만(대표님 10/4) — V73 */'''),
]
V73 = io.open(os.path.join(ROOT, "docs", "layers", "v73-layer-src.js"), encoding="utf-8").read()
ANCHOR = "  setTimeout(V72.ping,3000);\n})();\n"
for rel in ("index.html", r"docs\layers\v60-layer-src.js"):
    p = os.path.join(ROOT, rel)
    s = io.open(p, encoding="utf-8", newline="").read()
    if "V60.viewBar()" in s:
        print(rel, "이미 바뀜"); continue
    nl = chr(13) + chr(10) if chr(13) + chr(10) in s else chr(10)   # 소스 파일은 CRLF 일 수 있다(10/4 실측)
    for o, n in R:
        o, n = o.replace(chr(10), nl), n.replace(chr(10), nl)
        if s.count(o) != 1: sys.exit(f"{rel}: {o[:60]!r} {s.count(o)}개 — 중단")
        s = s.replace(o, n)
    if rel == "index.html":
        if s.count(ANCHOR) != 1: sys.exit(f"V73 자리 {s.count(ANCHOR)}")
        s = s.replace(ANCHOR, ANCHOR + V73)
    io.open(p, "w", encoding="utf-8", newline="").write(s)
    print(rel, "바꿈")
