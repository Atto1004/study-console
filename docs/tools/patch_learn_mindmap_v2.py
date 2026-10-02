# -*- coding: utf-8 -*-
"""마인드맵 v2 — 대표님 2026-10-02 「학습 마인드맵 무슨 소린지 하나도 모르겠어, 정리 좀 해줘 이쁘게」.
v1(층별 78개 노드 + 선수지식 실선)을 버리고 가지형으로:
  과목(뿌리) → 장(units.json, 기본 = 중간 범위) → 그 장의 핵심 개념(map.json 의 과목 노드, 제목의 장 번호·키워드로 배정)
  장마다 「필요한 기초」 = 그 장 개념의 직접 선수지식 중 과목 밖 개념(중등·고교·대학기초)을 작은 칩으로.
  선 = 뿌리→장, 장→개념 곡선(장 색). 점 = 이해 상태(안다·흔들림·아직). 개념·기초 칩 누르면 기존 카드 시트.
  좁은 화면(< 680px)은 세로로 쌓고 선은 그리지 않는다(가지 색 띠로 대신).
제자리 패치: 「이미 적용 → 건너뜀 / 원문 1개 → 교체 / 둘 다 없음 → 오류」. 멱등."""
import io, re
P = r"C:\Users\user\Desktop\아톰OS\기술실\study-console\learn.html"
s = io.open(P, encoding="utf-8").read()
if "MINDMAP2" in s:
    print("already"); raise SystemExit

# ── CSS: v1 블록 교체 ──
i = s.find("/* 마인드맵 (MINDMAP, 2026-09-24) */")
j = s.find(".mapseg button.on{", i); j = s.find("\n", j)
assert i > 0 and j > i
CSS = r"""/* 마인드맵 v2 (MINDMAP2, 2026-10-02) — 과목 → 장 → 핵심 개념 */
#mapCard .mapbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px}
.judge[hidden]{display:none!important}
.mapseg{display:inline-flex;border:1px solid var(--line);border-radius:10px;overflow:hidden}
.mapseg button{border:0;background:var(--card);color:var(--sub);font:inherit;font-size:13px;padding:7px 12px;cursor:pointer;min-height:36px}
.mapseg button.on{background:var(--acc-soft);color:var(--acc);font-weight:700}
#mapWrap{position:relative;margin-top:6px}
#mmLines{position:absolute;left:0;top:0;pointer-events:none;overflow:visible}
#mmLines path{fill:none;stroke-width:2;stroke-linecap:round;opacity:.55}
.mm{display:grid;grid-template-columns:150px 1fr;gap:0 44px;align-items:center;position:relative}
.mm-root{align-self:center;background:var(--ink);color:var(--card);border-radius:16px;padding:16px 14px;text-align:center;box-shadow:0 6px 18px rgba(0,0,0,.12)}
.mm-root b{display:block;font-size:17px;letter-spacing:-.01em}
.mm-root span{display:block;font-size:12px;opacity:.75;margin-top:4px}
.mm-brs{display:flex;flex-direction:column;gap:16px}
.mm-br{display:grid;grid-template-columns:200px 1fr;gap:0 40px;align-items:center}
.mm-unit{background:color-mix(in srgb,var(--c) 12%,var(--card));border:1.5px solid var(--c);border-radius:14px;padding:10px 12px}
.mm-unit .mm-uh{display:flex;align-items:baseline;gap:6px}
.mm-unit b{font-size:14px;color:var(--ink)}
.mm-unit small{display:block;font-size:11.5px;color:var(--sub);margin-top:3px;line-height:1.35}
.mm-unit .mm-pg{margin-left:auto;font-size:11.5px;font-weight:800;color:var(--c);font-variant-numeric:tabular-nums;white-space:nowrap}
.mm-unit .mm-bar{height:4px;border-radius:2px;background:color-mix(in srgb,var(--c) 18%,transparent);margin-top:7px;overflow:hidden}
.mm-unit .mm-bar i{display:block;height:100%;background:var(--c)}
.mm-right{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.mm-leaf{display:inline-flex;align-items:center;gap:8px;max-width:100%;border:1px solid var(--line);border-left:4px solid var(--c);background:var(--card);border-radius:10px;padding:7px 11px;font:inherit;font-size:13px;font-weight:600;color:var(--ink);cursor:pointer;text-align:left;min-height:36px;box-shadow:var(--sh)}
.mm-leaf:hover{background:color-mix(in srgb,var(--c) 7%,var(--card))}
.mm-leaf .d{flex:none;width:9px;height:9px;border-radius:50%;background:var(--unrated)}
.mm-leaf.known .d{background:var(--known)}.mm-leaf.shaky .d{background:var(--shaky)}.mm-leaf.unknown .d{background:var(--unknown)}
.mm-leaf.dim{opacity:.38}
.mm-none{font-size:12.5px;color:var(--sub);padding:6px 2px}
.mm-base{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-top:2px}
.mm-base>span{font-size:11px;font-weight:700;color:var(--sub);margin-right:2px}
.mm-chip{border:1px dashed var(--line);background:transparent;color:var(--sub);border-radius:99px;padding:3px 9px;font:inherit;font-size:11.5px;cursor:pointer;display:inline-flex;align-items:center;gap:5px}
.mm-chip .d{width:7px;height:7px;border-radius:50%;background:var(--unrated)}
.mm-chip.known .d{background:var(--known)}.mm-chip.shaky .d{background:var(--shaky)}.mm-chip.unknown .d{background:var(--unknown)}
.mm-br.plan .mm-unit{border-style:dashed;opacity:.8}
@media (max-width:680px){
 .mm{grid-template-columns:1fr;gap:12px}
 .mm-root{justify-self:start;padding:10px 14px;text-align:left}
 .mm-br{grid-template-columns:1fr;gap:8px;border-left:3px solid var(--c);padding-left:10px}
 #mmLines{display:none}
}"""
s = s[:i] + CSS + s[j:]

# ── 마크업 ──
a = '<span class="mapseg" id="mapScope"><button data-v="all" class="on">과목 전체</button><button data-v="sel">선택한 주차</button></span>'
b = '<span class="mapseg" id="mapScope"><button data-v="mid" class="on">중간 범위</button><button data-v="all">전체</button><button data-v="sel">선택한 주차</button></span>'
assert s.count(a) == 1; s = s.replace(a, b)
a = '<span><i class="dot" style="background:var(--unknown)"></i>모름</span><span><i class="dot" style="background:var(--unrated)"></i>미평가</span></div>\n  <div id="mapWrap"><svg id="mapSvg"></svg></div>'
b = '<span><i class="dot" style="background:var(--unknown)"></i>모름</span><span><i class="dot" style="background:var(--unrated)"></i>아직 안 풀어 봄</span></div>\n  <div id="mapWrap"><svg id="mmLines" aria-hidden="true"></svg><div id="mm"></div></div>'
assert s.count(a) == 1, "legend/mapWrap"; s = s.replace(a, b)

# ── JS: renderMap 교체 ──
a = 'var MAPV="all";'
assert s.count(a) == 1; s = s.replace(a, 'var MAPV="mid", UNITS=null, UNITP=null;')
i = s.find("function renderMap(){")
j = s.find("function clip(t,n)", i)
assert i > 0 and j > i
JS = r"""/* MINDMAP2 (2026-10-02): 과목 → 장 → 핵심 개념 · 장마다 필요한 기초 */
var MMCOL=["#2F7DD1","#2E9E5B","#D9822B","#8E5BD6","#D6456B","#178C8C","#9C7A1E","#5B6BD6","#C2410C","#0E7490","#7C3AED","#B91C1C"];
function unitsLoad(){if(UNITP)return UNITP;UNITP=fetch("knowledge/units.json").then(function(r){return r.ok?r.json():{}}).catch(function(){return {}}).then(function(d){UNITS=d||{};return UNITS});return UNITP}
function mmUnitOf(id,us){var nm=NODES[id].name,i,re;
  for(i=0;i<us.length;i++){try{re=us[i].num&&new RegExp(us[i].num);if(re&&re.test(nm))return us[i]}catch(e){}}
  for(i=0;i<us.length;i++){try{re=us[i].kw&&new RegExp(us[i].kw);if(re&&re.test(nm))return us[i]}catch(e){}}
  var d=MAP[SUBJ]||{},ws=d.weeks||{};for(var k in ws){if((ws[k].nodes||[]).indexOf(id)>=0){var ds=ws[k].dates||[];
    for(i=0;i<us.length;i++){if((us[i].dates||[]).some(function(x){return ds.indexOf(x)>=0}))return us[i]}}}
  return null}
function mmName(id){return (NODES[id].name||id).replace(/\s+/g," ")}
function renderMap(){
  var card=$("#mapCard"); if(!SUBJ||!MAP[SUBJ]){card.style.display="none";return}
  if(!UNITS){unitsLoad().then(renderMap);return}
  var us=((UNITS[SUBJ]||{}).units||[]).slice();
  var base=[],seen={};subjectNodes(SUBJ).forEach(function(n){if(NODES[n]&&!seen[n]){seen[n]=1;base.push(n)}});
  if(!base.length){card.style.display="none";return}
  card.style.display="";
  [].forEach.call(document.querySelectorAll("#mapScope button"),function(b){b.classList.toggle("on",b.dataset.v===MAPV)});
  var sel={};if(MAPV==="sel"&&SEL){var d=MAP[SUBJ]||{},ids2=SEL.type==="w"?(((d.weeks||{})[SEL.key]||{}).nodes||[]):(((d.problems||[])[SEL.key]||{}).nodes||[]);ids2.forEach(function(n){sel[n]=1})}
  /* 개념 → 장 */
  var by={},other=[];base.forEach(function(n){var u=mmUnitOf(n,us);if(u)(by[u.n]=by[u.n]||[]).push(n);else other.push(n)});
  var show=us.filter(function(u){if(MAPV==="mid")return u.phase==="mid";if(MAPV==="sel")return (by[u.n]||[]).some(function(n){return sel[n]});return true});
  if(other.length&&MAPV!=="mid"&&MAPV!=="sel")show.push({n:"etc",title:"그 밖의 개념",phase:"",dates:[]});
  if(other.length)by.etc=other;
  var LV={"중등":0,"고교":1,"대학기초":2,"전공":3};
  var cnt={known:0,shaky:0,unknown:0,unrated:0},nC=0;
  var html='<div class="mm"><div class="mm-root" id="mmRoot"><b>'+esc(SUBJ)+'</b><span>'+(MAPV==="mid"?"중간 범위":MAPV==="sel"?"선택한 주차":"전체")+'</span></div><div class="mm-brs">';
  show.forEach(function(u,ui){
    var col=MMCOL[(typeof u.n==="number"?u.n-1:ui)%MMCOL.length], L=(by[u.n]||[]).slice();
    if(MAPV==="sel")L=L.filter(function(n){return sel[n]});
    L.sort(function(a,b){return mmName(a).localeCompare(mmName(b),"ko",{numeric:true})});
    var k=0;L.forEach(function(n){var s2=st(n);cnt[s2]++;nC++;if(s2==="known")k++});
    var basics={};L.forEach(function(n){(NODES[n].prereq||[]).forEach(function(p){if(NODES[p]&&!seen[p])basics[p]=1})});
    var bl=Object.keys(basics).sort(function(a,b){return (LV[NODES[a].level]||0)-(LV[NODES[b].level]||0)||mmName(a).localeCompare(mmName(b),"ko")});
    var t=String(u.title||""),cut=t.indexOf(" — "),head=cut>0?t.slice(0,cut):t,sub=cut>0?t.slice(cut+3):"";
    var plan=!L.length&&!(u.dates||[]).length;
    html+='<div class="mm-br'+(plan?' plan':'')+'" style="--c:'+col+'" data-u="'+esc(u.n)+'">'+
      '<div class="mm-unit"><div class="mm-uh"><b>'+esc(head)+'</b><span class="mm-pg">'+(L.length?k+' / '+L.length:'')+'</span></div>'+(sub?'<small>'+esc(sub)+'</small>':'')+
        (L.length?'<div class="mm-bar"><i style="width:'+Math.round(100*k/L.length)+'%"></i></div>':'')+'</div>'+
      '<div class="mm-right">'+(L.length?L.map(function(n){return '<button class="mm-leaf '+st(n)+'" data-id="'+n+'" title="'+esc(NODES[n].desc||"")+'"><i class="d"></i>'+esc(mmName(n))+'</button>'}).join(""):'<span class="mm-none">'+(plan?esc(u.planned||"수업 전"):"수업 전")+'</span>')+
        (bl.length?'<div class="mm-base"><span>필요한 기초</span>'+bl.slice(0,8).map(function(p){return '<button class="mm-chip '+st(p)+'" data-id="'+p+'"><i class="d"></i>'+esc(mmName(p))+'</button>'}).join("")+(bl.length>8?'<span>+'+(bl.length-8)+'</span>':'')+'</div>':'')+
      '</div></div>'});
  html+='</div></div>';
  $("#mm").innerHTML=html;
  $("#mapMeta").innerHTML='장 <b>'+show.length+'</b> · 개념 <b>'+nC+'</b> · <span style="color:var(--known)">안다 <b>'+cnt.known+'</b></span> · <span style="color:var(--shaky)">흔들림 <b>'+cnt.shaky+'</b></span> · <span style="color:var(--unknown)">모름 <b>'+cnt.unknown+'</b></span> · 아직 <b>'+cnt.unrated+'</b>';
  [].forEach.call(document.querySelectorAll("#mm [data-id]"),function(g){g.onclick=function(){openCard(g.getAttribute("data-id"))}});
  mmLines();
}
function mmLines(){var w=$("#mapWrap"),svg=$("#mmLines"),root=$("#mmRoot");if(!w||!svg||!root)return;
  if(window.innerWidth<=680||!w.getBoundingClientRect().width){svg.innerHTML="";return}
  var W=w.getBoundingClientRect(),R=root.getBoundingClientRect(),h="";
  var P=function(r,side){return {x:(side==="r"?r.right:r.left)-W.left,y:r.top+r.height/2-W.top}};
  var cv=function(a,b,c){var mx=(a.x+b.x)/2;return '<path stroke="'+c+'" d="M'+a.x+' '+a.y+' C'+mx+' '+a.y+' '+mx+' '+b.y+' '+b.x+' '+b.y+'"/>'};
  [].forEach.call(document.querySelectorAll("#mm .mm-br"),function(br){var c=getComputedStyle(br).getPropertyValue("--c").trim()||"#999",u=br.querySelector(".mm-unit");
    h+=cv(P(R,"r"),P(u.getBoundingClientRect(),"l"),c);
    var a=P(u.getBoundingClientRect(),"r");
    [].forEach.call(br.querySelectorAll(".mm-leaf,.mm-none"),function(l){h+=cv(a,P(l.getBoundingClientRect(),"l"),c)})});
  svg.setAttribute("width",W.width);svg.setAttribute("height",W.height);svg.innerHTML=h}
window.addEventListener("resize",function(){clearTimeout(window._mmT);window._mmT=setTimeout(mmLines,120)});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){mmLines()});
"""
s = s[:i] + JS + s[j:]
io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("ok")
