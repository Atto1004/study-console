# -*- coding: utf-8 -*-
"""마인드맵 — 핵심 개념 연결도 (아토 2026-09-21 §16 ③ "핵심개념별 마인드맵도 잘 그리고 연결시켜줘야해" · 2026-09-24 "연결해")
learn.html 에 SVG 개념 지도 카드를 추가한다. 노드 = graph.json 개념, 선 = prereq(선수지식) 연결.
  · 층(중등→고교→대학기초→전공)으로 행을 나누고, 같은 층 안에서는 무게중심 정렬로 선이 덜 꼬이게 배치
  · 색 = 이해 상태(안다/흔들림/모름/미평가) — 기존 점수식 그대로 · 선택 주차·문제의 노드는 점선 테두리
  · 노드 클릭 = 기존 카드 시트(설명·자가평가·퀴즈) 열기. 가로 스크롤.
멱등."""
import io
P = r"C:\Users\user\Desktop\아톰OS\기술실\study-console\learn.html"
s = io.open(P, encoding="utf-8").read()
if "MINDMAP" in s:
    print("already"); raise SystemExit

CSS = """
/* 마인드맵 (MINDMAP, 2026-09-24) */
#mapCard .mapbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px}
#mapWrap{overflow:auto;max-height:70vh;border:1px solid var(--line);border-radius:10px;background:var(--bg)}
#mapSvg{display:block}
#mapSvg .edge{fill:none;stroke:var(--line);stroke-width:1.5}
#mapSvg .edge.hot{stroke:var(--acc);stroke-width:2.5}
#mapSvg .lvlband{fill:var(--card);opacity:.55}
#mapSvg .lvltx{fill:var(--sub);font-size:11px;font-weight:700}
#mapSvg .nd rect{stroke-width:1.5;rx:9;ry:9}
#mapSvg .nd text{font-size:12.5px;font-weight:600;fill:var(--ink);dominant-baseline:middle}
#mapSvg .nd{cursor:pointer}
#mapSvg .nd:hover rect{filter:brightness(.96)}
#mapSvg .nd.target rect{stroke-dasharray:4 3}
#mapSvg .nd.dim{opacity:.35}
.mapseg{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden}
.mapseg button{border:0;background:var(--card);color:var(--sub);font:inherit;font-size:12px;padding:5px 10px;cursor:pointer}
.mapseg button.on{background:var(--acc-soft);color:var(--acc);font-weight:700}
"""
s = s.replace("</style>", CSS + "</style>", 1)

HTML = """ <div class="card" id="mapCard" style="display:none">
  <h2>개념 마인드맵 <small>선 = 선수지식(먼저 알아야 하는 것) → 나중 개념</small></h2>
  <div class="mapbar">
   <span class="mapseg" id="mapScope"><button data-v="all" class="on">과목 전체</button><button data-v="sel">선택한 주차</button></span>
   <span class="meta" id="mapMeta"></span>
  </div>
  <div class="legend"><span><i class="dot" style="background:var(--known)"></i>안다</span><span><i class="dot" style="background:var(--shaky)"></i>흔들림</span><span><i class="dot" style="background:var(--unknown)"></i>모름</span><span><i class="dot" style="background:var(--unrated)"></i>미평가</span><span>점선 = 고른 주차의 개념</span></div>
  <div id="mapWrap"><svg id="mapSvg"></svg></div>
 </div>
"""
anchor = ' <div class="card" id="treeCard" style="display:none">'
assert s.count(anchor) == 1
s = s.replace(anchor, HTML + anchor, 1)

JS = r"""
/* ── MINDMAP: 개념 연결도 (아토 2026-09-24 "연결해") ── */
var MAPV="all";
function mapWidth(t){var w=0;for(var i=0;i<t.length;i++){var c=t.charCodeAt(i);w+= (c>0x1100&&c<0xD7FF)?12.5:(c>=48&&c<=57)?7.5:7;}return Math.max(84,Math.min(articleMax(),w+22))}
function articleMax(){return 230}
function renderMap(){
  var card=$("#mapCard"); if(!SUBJ||!MAP[SUBJ]){card.style.display="none";return}
  var base=subjectNodes(SUBJ), targ={};
  if(MAPV==="sel"&&SEL){var d=MAP[SUBJ]||{},ids2;
    if(SEL.type==="w"){ids2=((d.weeks||{})[SEL.key]||{}).nodes||[]}else{ids2=((d.problems||[])[SEL.key]||{}).nodes||[]}
    base=ids2.slice()}
  base.forEach(function(n){targ[n]=1});
  var ids=closure(base).filter(function(n){return NODES[n]});
  if(!ids.length){card.style.display="none";return}
  card.style.display="";
  [].forEach.call(document.querySelectorAll("#mapScope button"),function(b){b.classList.toggle("on",b.dataset.v===MAPV)});
  var cnt={known:0,shaky:0,unknown:0,unrated:0};ids.forEach(function(n){cnt[st(n)]++});
  var edges=[];ids.forEach(function(n){(NODES[n].prereq||[]).forEach(function(p){if(ids.indexOf(p)>=0)edges.push([p,n])})});
  $("#mapMeta").innerHTML='개념 <b>'+ids.length+'</b> · 연결 <b>'+edges.length+'</b> · 안다 <b style="color:var(--known)">'+cnt.known+'</b> · 흔들림 <b style="color:var(--shaky)">'+cnt.shaky+'</b> · 모름 <b style="color:var(--unknown)">'+(cnt.unknown+cnt.unrated)+'</b>';
  /* 층별 배치 + 무게중심 정렬 */
  var rows=LEVELS.map(function(L){return ids.filter(function(n){return NODES[n].level===L})}).filter(function(r){return r.length});
  var rowNames=LEVELS.filter(function(L){return ids.some(function(n){return NODES[n].level===L})});
  var pos={},PAD=16,GAPX=14,ROWH=92,TOP=26,NH=34;
  rows.forEach(function(r){r.sort(function(a,b){return NODES[a].name.localeCompare(NODES[b].name,"ko")})});
  for(var it=0;it<3;it++){rows.forEach(function(r,ri){
      if(ri>0){var prev=rows[ri-1],idx={};prev.forEach(function(n,i){idx[n]=i});
        r.sort(function(a,b){var fa=bary(a,idx),fb=bary(b,idx);return fa-fb||NODES[a].name.localeCompare(NODES[b].name,"ko")})}
      function bary(n,idx){var ps=(NODES[n].prereq||[]).filter(function(p){return idx[p]!=null});
        if(!ps.length)return 9999;var s=0;ps.forEach(function(p){s+=idx[p]});return s/ps.length}
    })}
  var maxW=0;
  rows.forEach(function(r,ri){var x=PAD;r.forEach(function(n){var w=mapWidth(NODES[n].name);pos[n]={x:x,y:TOP+ri*ROWH,w:w,h:NH};x+=w+GAPX});maxW=Math.max(maxW,x+PAD)});
  var H=TOP+rows.length*ROWH+10;
  var svg=$("#mapSvg");svg.setAttribute("width",maxW);svg.setAttribute("height",H);svg.setAttribute("viewBox","0 0 "+maxW+" "+H);
  var COL={known:"var(--known)",shaky:"var(--shaky)",unknown:"var(--unknown)",unrated:"var(--unrated)"};
  var h="";
  rows.forEach(function(r,ri){var y=TOP+ri*ROWH;h+='<rect class="lvlband" x="0" y="'+(y-16)+'" width="'+maxW+'" height="'+(NH+22)+'"/><text class="lvltx" x="6" y="'+(y-5)+'">'+esc(rowNames[ri])+' · '+r.length+'</text>'});
  edges.forEach(function(e){var a=pos[e[0]],b=pos[e[1]];if(!a||!b)return;
    var x1=a.x+a.w/2,y1=a.y+a.h,x2=b.x+b.w/2,y2=b.y,my=(y1+y2)/2,hot=(st(e[0])!=="known"&&targ[e[1]])?" hot":"";
    h+='<path class="edge'+hot+'" d="M'+x1+' '+y1+' C'+x1+' '+my+' '+x2+' '+my+' '+x2+' '+y2+'"/>'});
  ids.forEach(function(n){var p=pos[n],s2=st(n),c=COL[s2],nm=NODES[n].name;
    var cls="nd"+(targ[n]?" target":"")+((MAPV==="sel"&&!targ[n])?" dim":"");
    h+='<g class="'+cls+'" data-id="'+n+'"><title>'+esc(nm+" — "+(NODES[n].desc||""))+'</title>'+
       '<rect x="'+p.x+'" y="'+p.y+'" width="'+p.w+'" height="'+p.h+'" fill="color-mix(in srgb,'+c+' 14%,var(--card))" stroke="'+c+'"/>'+
       '<text x="'+(p.x+11)+'" y="'+(p.y+p.h/2+1)+'">'+esc(clip(nm,Math.floor((p.w-22)/12.5)))+'</text></g>'});
  svg.innerHTML=h;
  [].forEach.call(svg.querySelectorAll(".nd"),function(g){g.onclick=function(){openCard(g.getAttribute("data-id"))}});
}
function clip(t,n){return t.length>n?t.slice(0,Math.max(1,n-1))+"…":t}
"""
s = s.replace("function render(){renderChips();renderProg();renderSummary();renderList();renderTree()}",
              JS.strip() + "\nfunction render(){renderChips();renderProg();renderSummary();renderList();renderTree();renderMap()}", 1)

BIND = """  [].forEach.call(document.querySelectorAll("#mapScope button"),function(b){b.onclick=function(){MAPV=b.dataset.v;renderMap()}});
"""
anchor2 = '  [].forEach.call(document.querySelectorAll("#chips .chip"),function(b){'
assert s.count(anchor2) == 1
s = s.replace(anchor2, BIND + anchor2, 1)
io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("ok", len(s))
