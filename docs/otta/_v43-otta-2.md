# V43 · 덱 v5a 오타 검수 (2026-09-21) — 최종 2차 GREEN

## 1차 RED(2건) 요지
제공된 검사 결과만으로는 최종 판정할 수 없습니다. 실제 파일에서 채점·복원 경로와 HTML 삽입 지점을 확인합니다.

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command "Get-Content 'C:\\Users\\user\\Desktop\\아톰OS\\기술실\\study-console\\docs\\tools\\slides_tpl.html' | Select-Object -Skip 180 -First 290" in C:\Users\user\본사\otta
 succeeded in 537ms:
const SLIDES=__SLIDES__;
const PARTS=__PARTS__;
/* 진행 ?�?? 지�?§0?� 브라?��? ?�?�소 금�?. ?�??방식(???�태 vs ?�???????� ?�토 결정 ?�기라 그때까�? localStorage ?��? (2026-09-17). */
const KEY="mc-slides-"+DECK_ID;
let ST={idx:0,done:{},correct:{},revealed:{},answer:{},ink:{},finger:false,padBig:false,skip:{}};
try{ const s=JSON.parse(localStorage.getItem(KEY)||"null"); if(s&&typeof s==="object") ST=Object.assign(ST,s); }catch(e){}
/* V5A-RESUME: 마�?�??�습 ?�치 ???�의 ?�이?�서 ?�습?�기??카드가 ?�는??(?�토 2026-09-21). #check(빌드 검?? 중에???��? ?�는??*/
const LAST_KEY="mc-slides-last";
function lastInfo(){
  const s=SLIDES[Math.max(0,Math.min(ST.idx,SLIDES.length-1))]; if(!s) return null;
  const p=s.part?PARTS.find(x=>x.n===s.part):null; const qs=SLIDES.filter(x=>x.type==="q");
  const clean=t=>String(t||"").replace(/[\s??+$/,"");
  const where= s.type==="q"?((s.kind||"")+" 문제 · "+(s.qn||"")).trim() : s.type==="concept"?("개념 · "+clean(s.title)) : s.type==="mu"?"?�기 vs ?�해" : s.type==="cover"?"?�트 ?�작" : s.type==="result"?"?�트 결과" : s.type==="final"?"?�체 결과" : s.type==="jump"?"?�작 ?�치 고르�? : "?��?";
  return {deck:DECK_ID,title:document.title,href:location.href.split("#")[0],idx:ST.idx,n:SLIDES.length,sid:s.id,part:s.part||null,partTitle:p?clean(p.title):"",where:where,qDone:qs.filter(q=>ST.done[q.id]).length,qN:qs.length,ts:Date.now()};
}
const save=()=>{ try{ localStorage.setItem(KEY,JSON.stringify(ST)); if(location.hash!=="#check"){ const li=lastInfo(); if(li){ const j=JSON.stringify(li); localStorage.setItem(LAST_KEY,j); localStorage.setItem(LAST_KEY+"-"+DECK_ID,j); } } }catch(e){} };
window.addEventListener("pagehide",()=>{ try{ save(); }catch(e){} });
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const partOf=n=>PARTS.find(p=>p.n===n)||null;
const num=v=>'<span class="num">'+esc(v)+'</span>';   /* UI ?�자???�자(지�?§1) */
function partScore(p){ ST.skip=ST.skip||{}; const qs=SLIDES.filter(s=>s.type==="q"&&s.part===p&&!ST.skip[s.id]); const b=qs.filter(q=>q.kind==="기초"), a=qs.filter(q=>q.kind==="?�용");
  const cnt=arr=>({n:arr.length,ok:arr.filter(q=>ST.correct[q.id]===true).length,done:arr.filter(q=>ST.done[q.id]).length});
  return {b:cnt(b),a:cnt(a)}; }
function partDone(p){ return SLIDES.filter(s=>s.part===p&&s.type!=="result").every(s=>ST.done[s.id]); }

/* ---------- ?�식: KaTeX (지�?§1). ?�더 ?�나�??�엔 ?�업 ?�역??감춘??§0 raw LaTeX ?�출 금�?) ---------- */
function typeset(el){
  if(window.renderMathInElement){
    try{ renderMathInElement(el,{delimiters:[{left:"\\(",right:"\\)",display:false},{left:"\\[",right:"\\]",display:true},{left:"$$",right:"$$",display:true}],throwOnError:false,strict:"ignore"}); }catch(e){}
  }
  const cl=el.cloneNode(true); cl.querySelectorAll(".katex,.katex-display").forEach(k=>k.remove());
  const raw=/\\\(|\\\[|\\frac|\\vec|\\begin\{|\$\$/.test(cl.textContent||"");
  el.dataset.raw=raw?"1":"0";
  if(raw&&el.id==="body"){ el.dataset.ready="false"; el.innerHTML='<div class="kicker">?�식 ?�류</div><h2>???�의 ?�식??그�?�??�러???�시�?멈췄?�니??/h2><p>?�리?�트???�식 ?�기�?고쳐 ?�시 만들?�야 ?�니??</p>'; }
  el.dataset.ready="true";
  return !raw;
}

/* ---------- ?�??메모??(?��???캔버??· ?�플?�슬) ---------- */
const PAD={tool:"pen",cv:null,ctx:null,id:null,cur:null,ro:null,dpr:1,W:0,H:0};
function padStrokes(id){ ST.ink=ST.ink||{}; if(!ST.ink[id]) ST.ink[id]={strokes:[]}; return ST.ink[id].strokes; }
function padResize(){ const cv=PAD.cv; if(!cv||!cv.isConnected) return; const r=cv.getBoundingClientRect(); if(r.width<10||r.height<10) return;
  PAD.dpr=Math.min(3,window.devicePixelRatio||1); PAD.W=r.width; PAD.H=r.height; cv.width=Math.round(r.width*PAD.dpr); cv.height=Math.round(r.height*PAD.dpr);
  PAD.ctx=cv.getContext("2d"); PAD.ctx.setTransform(PAD.dpr,0,0,PAD.dpr,0,0); PAD.ctx.lineCap="round"; PAD.ctx.lineJoin="round"; padRedraw(); }
function padLine(ctx,t,x0,y0,x1,y1,p){ if(!ctx) return; const W=PAD.W; ctx.globalCompositeOperation=t==="e"?"destination-out":"source-over"; ctx.strokeStyle="#111111";
  ctx.lineWidth=t==="e"?W*0.03:Math.max(1.2,W*0.0035*(0.6+(p||0.5)*1.2)); ctx.beginPath(); ctx.moveTo(x0*W,y0*W); ctx.lineTo(x1*W,y1*W); ctx.stroke(); }
function padRedraw(){ const ctx=PAD.ctx; if(!ctx) return; ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,PAD.cv.width,PAD.cv.height); ctx.restore();
  for(const st of padStrokes(PAD.id)){ const c=st.c; if(c.length<3) continue; if(c.length===3){ padLine(ctx,st.t,c[0],c[1],c[0]+0.0005,c[1],c[2]); continue; }
    for(let i=3;i<c.length;i+=3) padLine(ctx,st.t,c[i-3],c[i-2],c[i],c[i+1],c[i+2]); } }
function padPt(e){ const r=PAD.cv.getBoundingClientRect(); return [Math.round((e.clientX-r.left)/PAD.W*1000)/1000, Math.round((e.clientY-r.top)/PAD.W*1000)/1000, Math.round((e.pressure||0.5)*100)/100]; }
function padAllowed(e){ return e.pointerType==="pen"||e.pointerType==="mouse"||(e.pointerType==="touch"&&ST.finger); }
function mountPad(id){
  const cv=$("#pad"); if(!cv) return; PAD.cv=cv; PAD.id=id; PAD.cur=null;
  cv.onpointerdown=e=>{ if(!padAllowed(e)) return; e.preventDefault(); try{ cv.setPointerCapture(e.pointerId); }catch(x){} const pt=padPt(e); PAD.cur={t:PAD.tool==="eraser"?"e":"p",c:pt.slice()}; padLine(PAD.ctx,PAD.cur.t,pt[0],pt[1],pt[0]+0.0005,pt[1],pt[2]); };
  cv.onpointermove=e=>{ if(!PAD.cur||!padAllowed(e)) return; e.preventDefault(); const evs=(e.getCoalescedEvents&&e.getCoalescedEvents().length)?e.getCoalescedEvents():[e];
    for(const ev of evs){ const pt=padPt(ev), c=PAD.cur.c, n=c.length; padLine(PAD.ctx,PAD.cur.t,c[n-3],c[n-2],pt[0],pt[1],pt[2]); c.push(pt[0],pt[1],pt[2]); } };
  const end=()=>{ if(!PAD.cur) return; padStrokes(id).push(PAD.cur); PAD.cur=null; save(); };
  cv.onpointerup=end; cv.onpointercancel=end; cv.onpointerleave=e=>{ if(PAD.cur&&e.pointerType!=="pen") end(); };
  cv.oncontextmenu=e=>e.preventDefault();
  const bar=cv.previousElementSibling;
  bar.querySelectorAll("[data-tool]").forEach(b=>{ b.onclick=()=>{ PAD.tool=b.dataset.tool; bar.querySelectorAll("[data-tool]").forEach(x=>x.classList.toggle("on",x===b)); }; });
  bar.querySelector('[data-act="undo"]').onclick=()=>{ padStrokes(id).pop(); save(); padRedraw(); };
  bar.querySelector('[data-act="clear"]').onclick=()=>{ if(!padStrokes(id).length||confirm("??문제???�??메모�?지?�까??")){ ST.ink[id]={strokes:[]}; save(); padRedraw(); } };
  bar.querySelector('[data-act="finger"]').onclick=function(){ ST.finger=!ST.finger; save(); this.classList.toggle("on",ST.finger); };
  if(window.ResizeObserver){ PAD.ro=new ResizeObserver(()=>padResize()); PAD.ro.observe(cv); }
  setTimeout(padResize,30);
}

/* ---------- ?�기 ???�닫�?(V4-PADPANEL) ---------- */
function openPad(id){ const pp=$("#padPanel"); pp.classList.add("on"); $("#padBtn").classList.add("on"); const fb=pp.querySelector('[data-act="finger"]'); if(fb) fb.classList.toggle("on",!!ST.finger); mountPad(id); const cb=pp.querySelector('[data-act="close"]'); if(cb) cb.onclick=closePad; }
function closePad(){ const pp=$("#padPanel"); if(pp) pp.classList.remove("on"); const b=$("#padBtn"); if(b) b.classList.remove("on"); if(PAD.ro){ PAD.ro.disconnect(); PAD.ro=null; } }
/* ---------- ?�험 ?�급 ?�자 (지�?§3) ---------- */
function examHTML(s){
  const list=Array.isArray(s.exam)?s.exam:[]; if(!list.length) return "";
  return list.map(x=>'<aside class="exam-callout" aria-label="?�험 ?�급"><div class="exam-label"><b>?�� ?�험 ?�급</b> · '+esc(x.level||"강조")+(x.when?' · '+esc(x.when):'')+'</div><blockquote class="exam-quote">"'+esc(x.quote||"")+'"</blockquote></aside>').join("");
}

/* ---------- ?�작 ?�치 ?�프 ---------- */
function startFrom(id,mode){
  const n=SLIDES.findIndex(x=>x.id===id); if(n<0) return;
  ST.skip=ST.skip||{}; mode=mode||"skip";
  if(mode!=="at") SLIDES.forEach((x,i)=>{ if(i<n&&x.type!=="start"&&x.type!=="jump"&&!ST.done[x.id]){ ST.done[x.id]=true; if(mode==="skip") ST.skip[x.id]=true; } });
  ST.idx=n; save(); render();
}
function unskipAll(){ ST.skip=ST.skip||{}; Object.keys(ST.skip).forEach(k=>{ delete ST.done[k]; }); ST.skip={}; save(); render(); }
function jumpListHTML(){
  ST.skip=ST.skip||{};
  const rows=[]; let cur=null;
  SLIDES.forEach((x,i)=>{
    if(x.type==="cover"){ cur={part:x.part,title:x.title,items:[]}; rows.push(cur); return; }
    if(!cur) return;
    if(x.type==="concept"||x.type==="mu"||x.type==="q"){
      const lab= x.type==="concept"?(x.title||"개념"): x.type==="mu"?"?�기 vs ?�해": x.qn;
      const st= ST.skip[x.id]?"skip": ST.done[x.id]?"done": (i===ST.idx?"cur":"");
      cur.items.push('<button class="jp '+st+'" data-jump="'+x.id+'">'+esc(lab)+'</button>');
    }
  });
  const nSkip=Object.keys(ST.skip).length;
  return '<div class="jump"><div class="jump-h">?�는 부분�? 건너?�고 막히??곳�??? ?�른 ???��? ?��? ?�건?��??�이 ?�고 채점?�서 빠진??'+
    (nSkip?'<button class="btn xs" id="unskip">건너?� '+num(nSkip)+'???�돌리기</button>':'')+'</div>'+
    rows.map(r=>'<div class="jump-part"><div class="jump-pt">?�트 '+num(r.part)+' · '+esc(String(r.title).replace(/[\s??+$/,""))+'</div><div class="jump-items">'+r.items.join("")+'</div></div>').join("")+'</div>';
}

/* ---------- 출처 발췌 ---------- */
function renderSrc(s){
  const box=$("#srcs"); const list=Array.isArray(s.src)?s.src:[];
  box.innerHTML=list.map((x,i)=>'<button class="src-th" data-si="'+i+'" title="'+esc(x.label||"출처")+'"><img src="'+esc(x.img)+'" alt="" loading="lazy"><span class="src-n">'+(i+1)+'</span></button>').join("");
  box.querySelectorAll(".src-th").forEach(b=>{ b.onclick=()=>openSrc(list,+b.dataset.si); });
}
function openSrc(list,i){
  let lb=$("#srclb"); if(!lb){ lb=document.createElement("div"); lb.id="srclb"; $("#stage").appendChild(lb); }
  const x=list[i];
  lb.innerHTML='<div class="src-top"><b>출처</b><span>'+esc(x.label||"")+'</span><span class="src-pos">'+(i+1)+' / '+list.length+'</span><button class="src-x" aria-label="?�기">??/button></div>'+
    '<div class="src-body"><img src="'+esc(x.img)+'" alt="'+esc(x.label||"")+'"></div>'+
    '<div class="src-foot"><button class="btn xs" id="srcPrev"'+(i<=0?" disabled":"")+'>???�전 출처</button><span class="hint">?�진???�르�??��? · ?�래그로 ?�동</span><button class="btn xs" id="srcNext"'+(i>=list.length-1?" disabled":"")+'>?�음 출처 ??/button></div>';
  lb.classList.add("on");
  const img=lb.querySelector(".src-body img"), bd=lb.querySelector(".src-body");
  img.onclick=()=>{ const z=img.classList.toggle("zoom"); if(!z) bd.scrollTo(0,0); };
  lb.querySelector(".src-x").onclick=()=>lb.classList.remove("on");
  const p=$("#srcPrev"), n=$("#srcNext"); if(p) p.onclick=()=>openSrc(list,i-1); if(n) n.onclick=()=>openSrc(list,i+1);
}

/* ---------- ?�·�?????---------- */
function openAns(s){
  let lb=$("#anslb"); if(!lb){ lb=document.createElement("div"); lb.id="anslb"; $("#stage").appendChild(lb); }
  const my=(ST.answer||{})[s.id]; const mc=Array.isArray(s.choices)&&s.choices.length>0;
  const mine= mc ? (s.choices[+my]?'<span class="num">'+(+my+1)+'</span>�???'+s.choices[+my].html:'') : esc(my||"");
  lb.innerHTML='<div class="ans-top"><span class="kicker">'+esc(s.qn)+'</span><span class="verdict '+(ST.correct[s.id]===true?"ok":ST.correct[s.id]===false?"bad":"")+'">'+(ST.correct[s.id]===true?"?�답":ST.correct[s.id]===false?"?�답":"????)+'</span><button class="src-x" id="ansX" aria-label="?�기">??/button></div>'+
    '<div class="myans-show"><div class="kicker">????/div><div class="myans-txt">'+mine+'</div></div>'+
    '<div class="ans"><div class="kicker">??· ?�??/div>'+s.ans+'</div>';
  lb.classList.add("on"); $("#ansX").onclick=()=>lb.classList.remove("on"); typeset(lb);
}
/* ---------- ?�단 진행??(?�트 ?�의 ?�계 · ?�험 ?�급?� ?�크) ---------- */
function renderTop(s){
  const inPart=s.part?SLIDES.filter(x=>x.part===s.part&&x.type!=="cover"&&x.type!=="result"):[];
  $("#progress").innerHTML=inPart.map(x=>'<span class="dot'+(ST.done[x.id]?" done":"")+(Array.isArray(x.exam)&&x.exam.length?" exam":"")+(x.id===s.id?" cur":"")+'"></span>').join("");
  const p=partOf(s.part); $("#chapter").textContent=p?("?�트 "+p.n+" · "+String(p.title).replace(/[\s??+$/,"")):"__TITLE__";
  $("#pos").textContent=(ST.idx+1)+" / "+SLIDES.length;
}

/* ---------- ?�트: 문제 ?�에?�는 �??�트????�??�약, 개념 ?�에?�는 ?�음 ---------- */
function hintFor(s){ const p=partOf(s.part); if(s.type==="q"&&p&&p.hint) return p.hint; return null; }

function render(){
  const i=Math.max(0,Math.min(ST.idx,SLIDES.length-1)); ST.idx=i; const s=SLIDES[i]; const body=$("#body"), act=$("#act");
  body.dataset.ready="false"; $("#hintBox").hidden=true; { const al=$("#anslb"); if(al) al.classList.remove("on"); } /* V4-ANSLB */
  act.innerHTML=""; ST.skip=ST.skip||{}; $("#doneTag").textContent=ST.skip[s.id]?"건너?�":ST.done[s.id]?"?�료":"";
  body.classList.remove("q-mode","rev","scrollable"); closePad(); $("#padBtn").hidden=true;
  renderTop(s); if(s.scroll) body.classList.add("scrollable");   /* --soft ?�시 ?? ?�친 ?�만 ?�크�?*/
  if(s.type==="start"){
    body.innerHTML='<div class="cover"><div class="kicker">?�습 ?�라?�드 · 가�??�면</div><div class="big">__TITLE__</div>'+
      '<div class="sub">?�른�??�래 ?�다?�」으�??�제???�어�????�고, ?�이지�??�내�??�다?�」이 ?�선???�니?? 기초 문제??보기�??�르�? ?�이 ?�러 개인 문제???�을 ?�니?? ?�쪽 ?�래 ?�힌?�」는 �??�트????�??�약, ?��? ?�진?� 출처(?�습지·???�?�본)?�니??</div>'+
      '<div class="sub">?�트 '+num(PARTS.length)+'�?· 문제 '+num(SLIDES.filter(x=>x.type==="q").length)+'�?/div></div>';
    act.innerHTML='<button class="btn xs" id="reset">진행 기록 지?�기</button>';
    $("#reset").onclick=()=>{ if(confirm("진행 기록??지?�까??")){ ST={idx:0,done:{},correct:{},revealed:{},answer:{},ink:{},finger:false,padBig:false,skip:{}}; save(); render(); } };
    ST.done[s.id]=true;
  } else if(s.type==="jump"){
    body.classList.add("scrollable"); body.innerHTML='<div class="kicker">?�작 ?�치</div><h2>?�디?��????�까?</h2>'+jumpListHTML();
    body.querySelectorAll("[data-jump]").forEach(b=>{ b.onclick=()=>startFrom(b.dataset.jump); }); const u=$("#unskip"); if(u) u.onclick=unskipAll;
    act.innerHTML='<button class="btn" id="ok">처음부??차�?�?/button>'; $("#ok").onclick=()=>{ ST.done[s.id]=true; save(); go(1); };
    ST.done[s.id]=true;
  } else if(s.type==="cover"){
    body.innerHTML=examHTML(s)+'<div class="cover"><div class="kicker">'+esc(s.no)+'</div><div class="big">'+esc(String(s.title).replace(/[\s??+$/,""))+'</div><div class="sub">개념 ???�기 vs ?�해 ??기초 문제 ???�용 문제 ?�서�?갑니??</div></div>';
    act.innerHTML='<button class="btn" id="ok">?�작</button>'; $("#ok").onclick=()=>{ ST.done[s.id]=true; save(); go(1); };
  } else if(s.type==="concept"){
    body.innerHTML=examHTML(s)+'<div class="kicker">'+(s.part?'?�트 '+num(s.part)+' · 개념':'')+'</div><h2>'+esc(s.title)+'</h2>'+s.html;
    act.innerHTML='<button class="btn" id="ok">'+(ST.done[s.id]?"?�시 ?�음 ?�시":"?�었?�요 ???�해?�습?�다")+'</button>';
    $("#ok").onclick=()=>{ ST.done[s.id]=true; save(); render(); };
  } else if(s.type==="mu"){
    const li=xs=>xs.map(x=>'<li>'+x+'</li>').join("");
    body.innerHTML=examHTML(s)+'<div class="kicker">?�트 '+num(s.part)+' · ?�기 vs ?�해</div><h2>'+esc(String(s.title).replace(/[\s??+$/,""))+' ??무엇???�우�?무엇???�해?�나</h2>'+
      '<div class="mu"><div class="mu-mem"><div class="mu-h">?�기??�?<span class="hint">?�워??바로 ?��???/span></div><ul>'+li(s.mem)+'</ul></div>'+
      '<div class="mu-und"><div class="mu-h">?�해??�?<span class="hint">??그런지 ?�명?????�어??/span></div><ul>'+li(s.und)+'</ul></div></div>';
    act.innerHTML='<button class="btn" id="ok">'+(ST.done[s.id]?"?�시 ?�인 ?�시":"구분?�어??)+'</button>';
    $("#ok").onclick=()=>{ ST.done[s.id]=true; save(); render(); };
  } else if(s.type==="q"){
    const rev=!!ST.revealed[s.id];
    ST.answer=ST.answer||{}; ST.ink=ST.ink||{}; const my=ST.answer[s.id]||"";
    const mc=Array.isArray(s.choices)&&s.choices.length>0;
    body.classList.add("q-mode"); body.classList.toggle("rev",rev);
    const choiceHTML=()=>'<div class="choices'+(rev?" rev":"")+'">'+s.choices.map((c,i)=>{ const sel=String(my)===String(i); const cls=(sel?" sel":"")+(rev?(c.ok?" ok":(sel?" bad":"")):"");
      return '<button class="choice'+cls+'" data-ci="'+i+'"'+(rev?" disabled":"")+'><span class="cn">'+(i+1)+'</span><span class="ct">'+c.html+'</span></button>'; }).join("")+'</div>';
    body.innerHTML=examHTML(s)+'<div class="kicker">?�트 '+num(s.part)+'</div><h2><span class="q-kind">'+s.kind+'</span>'+esc(s.qn)+'</h2><div class="qbody">'+s.html+'</div>'+
      (mc ? choiceHTML() : rev
        ? '<div class="myans-show"><div class="kicker">????/div><div class="myans-txt">'+esc(my)+'</div></div>'
        : '<div class="myans"><label for="myans">???????�만. ?�렬?� [1 2; 3 4]처럼, ?�러 개면 ?�표�?/label><textarea id="myans" rows="2" placeholder="?�기???�을 ?�고 ?�답 ?�인??>'+esc(my)+'</textarea></div>')+
      (rev?'<div class="myans-note"><button class="btn xs" id="showAns">??· ?�???�시 보기</button></div>':'');
    if(rev){ if(ST.correct[s.id]!==true) openAns(s); /* V5A: ?�답?�면 ?�???�을 ?�우지 ?�는??(?�토 2026-09-21) */ const sa=$("#showAns"); if(sa) sa.onclick=()=>openAns(s); }
    closePad(); $("#padBtn").hidden=false;
    if(mc&&!rev){
      /* V5A: 보기�??�르???�간 ?�출·채점 (?�토 2026-09-21 "객�??��? 고르�?바로 ?�답?�로 ?�출") */
      act.innerHTML='<span class="hint">보기�??�르�?바로 채점?�니??/span>';
      body.querySelectorAll(".choice").forEach(b=>{ b.onclick=()=>{ const ci=b.dataset.ci; if(ST.revealed[s.id]) return; const ok=!!(s.choices[+ci]&&s.choices[+ci].ok); ST.answer[s.id]=ci; ST.revealed[s.id]=true; ST.correct[s.id]=ok; ST.done[s.id]=true; save(); render(); }; });
    } else if(mc&&rev){
      const c=ST.correct[s.id];
      act.innerHTML='<span class="verdict '+(c?"ok":"bad")+'">'+(c?"?�답":"?�답 ???�?��? ?�고 ?�시")+'</span><button class="btn xs" id="retry1">?�시 ?��?/button>';
      $("#retry1").onclick=()=>{ delete ST.revealed[s.id]; delete ST.done[s.id]; delete ST.correct[s.id]; delete ST.answer[s.id]; save(); render(); };
    } else if(!rev){
      act.innerHTML='<button class="btn primary" id="reveal" disabled>???�인</button>';
      const ta=$("#myans"), rb=$("#reveal");
      const sync=()=>{ ST.answer[s.id]=ta.value; rb.disabled=!ta.value.trim(); };
      ta.oninput=sync; ta.onchange=()=>{ sync(); save(); }; sync();
      rb.onclick=()=>{ if(!ta.value.trim()){ ta.focus(); return; } ST.answer[s.id]=ta.value.trim(); ST.revealed[s.id]=true; save(); render(); };
      ta.onkeydown=e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); rb.click(); } };
      setTimeout(()=>{ try{ ta.focus({preventScroll:true}); }catch(e){} },50);
    } else {
      const c=ST.correct[s.id];
      act.innerHTML='<button class="btn" id="yes">맞았?�요'+(c===true?" ??:"")+'</button><button class="btn" id="no">?�?�어??· ?�시'+(c===false?" ??:"")+'</button>';
      $("#yes").onclick=()=>{ ST.correct[s.id]=true; ST.done[s.id]=true; save(); render(); };
      $("#no").onclick=()=>{ ST.correct[s.id]=false; ST.done[s.id]=true; save(); render(); };
    }
  } else if(s.type==="result"){
    const sc=partScore(s.part), pct=(o)=>o.n?Math.round(o.ok/o.n*100):0;
    const passB=sc.b.n===0||sc.b.ok===sc.b.n, passA=sc.a.n===0||sc.a.ok*3>=sc.a.n*2;
    body.innerHTML='<div class="kicker">?�트 '+num(s.part)+' 결과</div><h1>'+esc(String(s.title).replace(/[\s??+$/,""))+'</h1><div class="score">'+
      '<div class="c"><b>'+sc.b.ok+'/'+sc.b.n+'</b>기초 · '+num(pct(sc.b)+'%')+' · '+(passB?"?�과":"미달")+'</div>'+
      '<div class="c"><b>'+sc.a.ok+'/'+sc.a.n+'</b>?�용 · '+num(pct(sc.a)+'%')+' · '+(passA?"?�과":"미달")+'</div></div>'+
      '<p>'+(passB&&passA?'?�트 ?�료. 기�?(기초 ?��? + ?�용 2/3 ?�상)???�었?�니??':'기�??� 기초 ?��? + ?�용 2/3 ?�상. ?��?문제??개념 ?�이지�??�아가 ?�시 ?�고 ?�??보세??')+'</p>';
    act.innerHTML='<button class="btn xs" id="back">???�트 처음?�로</button><button class="btn" id="ok">?�인</button>';
    $("#back").onclick=()=>{ ST.idx=SLIDES.findIndex(x=>x.id==="p"+s.part+"-cover"); save(); render(); };
    $("#ok").onclick=()=>{ ST.done[s.id]=true; save(); go(1); };
  } else if(s.type==="final"){
    const qs=SLIDES.filter(x=>x.type==="q"&&!(ST.skip||{})[x.id]); const ok=qs.filter(q=>ST.correct[q.id]===true).length, done=qs.filter(q=>ST.done[q.id]).length;
    const wrong=SLIDES.filter(x=>x.type==="q"&&ST.correct[x.id]===false);
    body.innerHTML='<div class="kicker">?�체 결과</div><h1>__TITLE__</h1><div class="score"><div class="c"><b>'+ok+'/'+qs.length+'</b>?�답 · ??문제 '+num(done)+'</div><div class="c"><b>'+wrong.length+'</b>?��?문제</div></div>'+
      '<p>'+(wrong.length?'?��?문제: '+wrong.slice(0,6).map(w=>esc(w.qn)).join(", ")+(wrong.length>6?' ??'+num(wrong.length-6)+'�?:''):'?��?문제가 ?�습?�다.')+'</p>';
    act.innerHTML='<button class="btn xs" id="retry"'+(wrong.length?"":" disabled")+'>?��?문제�??�시</button><button class="btn xs" id="first">처음?�로</button>';
    $("#retry").onclick=()=>{ if(!wrong.length) return; wrong.forEach(q=>{ delete ST.revealed[q.id]; delete ST.done[q.id]; delete ST.correct[q.id]; }); ST.idx=SLIDES.indexOf(wrong[0]); save(); render(); };
    $("#first").onclick=()=>{ ST.idx=0; save(); render(); };
    ST.done[s.id]=true; save();
  }
  renderSrc(s);
  const h=hintFor(s); const hb=$("#hintBtn"); hb.disabled=!h; hb.title=h?"":"???�에???�트가 ?�습?�다";
  const nxt=$("#next"), prv=$("#prev");
  const unlocked=i<SLIDES.length-1;
  nxt.disabled=!unlocked; nxt.classList.toggle("undone",!ST.done[s.id]&&unlocked); prv.disabled=(i===0);
  typeset(body);
  body.scrollTop=0;
}
function go(d){ const n=ST.idx+d; if(n<0||n>=SLIDES.length) return; ST.idx=n; save(); render(); }
$("#next").onclick=()=>go(1); $("#prev").onclick=()=>go(-1);
$("#padBtn").onclick=()=>{ const s=SLIDES[ST.idx]; if(s.type!=="q") return; if($("#padPanel").classList.contains("on")) closePad(); else openPad(s.id); };
$("#hintBtn").onclick=()=>{ const s=SLIDES[ST.idx], h=hintFor(s); if(!h) return; const hb=$("#hintBox"); if(!hb.hidden){ hb.hidden=true; return; } hb.innerHTML='<div class="kicker">?�트 · ?�트 '+num(s.part)+' ??�?/div><div>'+esc(h)+'</div>'; hb.hidden=false; typeset(hb); };
document.addEventListener("keydown",e=>{ const t=e.target; if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||(t&&t.isContentEditable)) return; if(e.key==="ArrowRight") go(1); else if(e.key==="ArrowLeft") go(-1); });

/* ---------- 검??모드 (#check): ???�을 ?�며 ?�버?�로·raw LaTeX�??�다. 빌드 ???�드리스�?캡처???�인?�다 ---------- */
async function runCheck(){
  try{ await document.fonts.ready; }catch(e){}
  const body=$("#body"); const fails=[]; const saved=JSON.stringify(ST);
  const foot=$("#foot"), stage=$("#stage");
  const measure=(tag)=>{ const over=SLIDES[ST.idx].type!=="jump"&&!SLIDES[ST.idx].scroll&&(body.scrollHeight>body.clientHeight||body.scrollWidth>body.clientWidth); const fo=SLIDES[ST.idx].type!=="jump"&&!SLIDES[ST.idx].scroll&&(foot.scrollWidth>foot.clientWidth||stage.scrollHeight>stage.clientHeight); const raw=body.dataset.raw==="1"; if(over||fo||raw) fails.push(SLIDES[ST.idx].id+tag+(over?" ?�침 "+body.scrollHeight+">"+body.clientHeight:"")+(fo?" ?�단/무�? ?�침":"")+(raw?" rawLaTeX":"")); };
  for(let i=0;i<SLIDES.length;i++){
    const s=SLIDES[i];
    ST.idx=i; delete ST.revealed[s.id]; render(); await new Promise(r=>setTimeout(r,20)); measure("");
    if(s.type==="q"){ /* ??공개 ?�태 */ ST.revealed[s.id]=true; ST.answer[s.id]=Array.isArray(s.choices)&&s.choices.length?"0":"x"; ST.correct[s.id]=false; render(); await new Promise(r=>setTimeout(r,20)); measure(" [?�공�?"); { const al=$("#anslb"); if(al&&al.classList.contains("on")){ const a=al.querySelector(".ans"); if(a&&(a.scrollHeight>a.clientHeight||al.scrollHeight>al.clientHeight)) fails.push(s.id+" [?�?�판] ?�침 "+a.scrollHeight+">"+a.clientHeight); al.classList.remove("on"); } }
      /* ?�트 ?�림 */ $("#hintBtn").click(); await new Promise(r=>setTimeout(r,20)); const hb=$("#hintBox"); if(!hb.hidden&&hb.getBoundingClientRect().top<body.getBoundingClientRect().top) fails.push(s.id+" [?�트] ?�단 침범"); hb.hidden=true; }
  }
  try{ ST=JSON.parse(saved); }catch(e){}
  const c=$("#chk"); c.style.display="block";
  c.innerHTML='<h2 id="chkTitle">검?? '+SLIDES.length+'??· ?�패 '+fails.length+'</h2><pre id="chkList">'+esc(fails.join("\n"))+'</pre>';
  window.CHECK_RESULT={n:SLIDES.length,fails};
}
function boot(){
  { const m=/^#(from|done|at)=([\w-]+)(?:,pad)?$/.exec(location.hash||""); if(m){ startFrom(m[2], m[1]==="from"?"skip":m[1]); if(/,pad$/.test(location.hash)) setTimeout(()=>$("#padBtn").click(),300); return; } }
  if(location.hash==="#check"){ runCheck(); return; }
  if(location.hash==="#resume"){ render(); save(); return; }   /* V5A: ?�?�된 ?�치 그�?�?*/
  render();
  if(location.hash==="#src"){ setTimeout(()=>{ const b=$("#srcs .src-th"); if(b) b.click(); },400); }
}
function fontCheck(){ try{ const ok=document.fonts.check("22px 'Nanum Pen Script'"); if(!ok){ let w=$("#fontWarn"); if(!w){ w=document.createElement("div"); w.id="fontWarn"; $("#stage").appendChild(w); } w.hidden=false; w.textContent="?��???글꼴을 불러?��? 못해 ?��?글꼴로 보입?�다. ?�터???�결???�인?�고 ?�로 고침?�세??"; } }catch(e){} }
function whenReady(){ if(window.renderMathInElement){ fontCheck(); boot(); } else setTimeout(whenReady,40); }
document.addEventListener("DOMContentLoaded",()=>{ (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(whenReady,whenReady); });
</script>
</body>
</html>

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command 'rg -n "function openNote|function closeNote|openNote=|closeNote=|V43|noteFrame|iframe|function esc" index.html' in C:\Users\user\Desktop\아톰OS\기술실\study-console
 succeeded in 77ms:
1006:.ntv iframe{flex:1 1 auto;width:100%;border:0;background:#fff}
1944:        <iframe id="ntvFrame" title="정리 노트"></iframe>
4400:/* ---------- 강의 정리 노트 (앱 내 열람) — notes/ 폴더의 HTML을 iframe으로 연다 ---------- */
4428:function openNote(file,title){
4435:function closeNote(){
9252:      슬라이드를 앱 안(iframe 뷰어)에서 바로 연다. 슬라이드가 없는 회차만 기존 화면으로.
9407:   V43 LAYER — 「이어서 학습하기」 (아토 2026-09-21 "나갔을 때 마지막 학습 진도 저장, 다시 들어갈 때 이어서 학습하기 버튼 + 어디인지 간단히")
9415:  if(window.V43) return;
9416:  var V43=window.V43={};
9417:  V43.KEY="mc-slides-last";
9418:  V43.last=function(){ try{ var r=JSON.parse(localStorage.getItem(V43.KEY)||"null"); return r&&r.href&&typeof r.idx==="number"?r:null; }catch(e){ return null; } };
9419:  V43.file=function(rec){ var m=/notes\/[^/?#]+$/.exec(rec.href||""); return m?m[0]:null; };
9420:  V43.courseName=function(rec){
9421:    var f=V43.file(rec); if(!f) return null;
9426:  V43.ago=function(ts){
9432:  V43.html=function(rec,withCourse){
9433:    var cn=withCourse?V43.courseName(rec):null;
9437:    return '<div class="card-h"><h3>이어서 학습하기</h3><span class="hs">RESUME</span><div class="ha"><span class="kbdhint">'+esc(V43.ago(rec.ts))+'</span></div></div>'+
9442:  V43.bind=function(card){
9446:  V43.renderToday=function(){
9447:    var v=$("#v-today"); if(!v) return; var rec=V43.last(); var c=$("#v43Today");
9451:    c.innerHTML=V43.html(rec,true); V43.bind(c);
9454:  V43.renderCourse=function(){
9456:    if(!c||!box) return; var rec=V43.last(); if(!rec||V43.courseName(rec)!==c.name) return;
9458:    card.innerHTML=V43.html(rec,false); V43.bind(card); host.parentNode.insertBefore(card,host);
9460:  V43.refresh=function(){ try{ V43.renderToday(); }catch(e){} try{ if(ui.view==="course") V43.renderCourse(); }catch(e){} };
9461:  var _renderToday=renderToday; renderToday=function(){ _renderToday(); try{ V43.renderToday(); }catch(e){ if(window.console) console.warn("V43", e); } };
9462:  var _renderCourse=renderCourse; renderCourse=function(){ _renderCourse(); try{ V43.renderCourse(); }catch(e){ if(window.console) console.warn("V43", e); } };
9463:  var _closeNote=closeNote; closeNote=function(){ _closeNote(); V43.refresh(); };
9464:  window.addEventListener("storage",function(e){ if(e&&e.key===V43.KEY) V43.refresh(); });

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command "Get-Content -Encoding UTF8 'C:\\Users\\user\\.Codex\\지침\\법무부.md'" in C:\Users\user\본사\otta
 exited 1 in 336ms:
Get-Content : 'C:\Users\user\.Codex\��ħ\������.md' ��δ� �������� �����Ƿ� ã�� �� �����ϴ�.
��ġ ��:2 ����:1
+ Get-Content -Encoding UTF8 'C:\Users\user\.Codex\��ħ\������.md'
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : ObjectNotFound: (C:\Users\user\.Codex\��ħ\������.md:String) [Get-Content], ItemNotFoundE
xcep    tion
    + FullyQualifiedErrorId : PathNotFound,Microsoft.PowerShell.Commands.GetContentCommand
 

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command "Get-Content -Encoding UTF8 index.html | Select-Object -Skip 4427 -First 21; rg -n 'esc\\s*=|ntvClose|closeNote\\)|renderToday\\(\\)|DOMContentLoaded' index.html | Select-Object -Last 20; rg --files -g '*v43*' -g '*jsdom*' -g 'package.json'" in C:\Users\user\Desktop\아톰OS\기술실\study-console
 exited 1 in 408ms:
function openNote(file,title){
  var v=$("#ntv"); if(!v) return;
  $("#ntvTitle").textContent=title||file;
  $("#ntvOpen").href=file;
  $("#ntvFrame").src=file;
  v.classList.add("on"); document.body.style.overflow="hidden";
}
function closeNote(){
  var v=$("#ntv"); if(!v) return;
  v.classList.remove("on"); $("#ntvFrame").src="about:blank"; document.body.style.overflow="";
}
/* ---------- �н� (���� ������ �� �ȿ��� �а� �� ���ø��� �� ä��) ----------
   �ܿ� = ���� �� ����. ���� ����(7����)��ȸ�� ���(����/Ÿ�Ӷ���/���� ����)������ ��Ʈ ��ũ�� �� ȭ�鿡 ������,
   ������ ä��(�ٽ�/�����/����/����)�� �� �� ȸ������ FSRS ī�忡 �ݿ�(gradeReview �� ���� ť�� ���� �ֱ�).
   ���� �ð��� S.studyLog=[{d,cid,w,min,grade,at}]�� ���δ�(����Ⱓ �ε���� �н� Ÿ�̸� ���). */
var STUDY_GR=[["again","�ٽ�"],["hard","�����"],["good","����"],["easy","����"]];   /* ���� �� ���� ť�� ���� 4��� */
function studySessionsOf(c,w){
  return sessions(c.id).filter(function(s){ return weekOf(s.date)===w && !s.cancelled && s.status!=="absent" && sessionEnded(c,s); });
}
function studyUnits(){
  var cw=currentWeek()||1, q=buildReviewQueue(), dueMap={};
5334:  $$("#dayLine [data-cs]").forEach(function(b){ b.onclick=function(){ startClass(b.dataset.cs,date); awSync(b.dataset.cs,date); renderToday(); renderGauges(); toast("?�업 ?�작 "+nowHM()); }; });
5335:  $$("#dayLine [data-ce]").forEach(function(b){ b.onclick=function(){ endClass(b.dataset.ce,date); awSync(b.dataset.ce,date); renderToday(); toast("?�업 종료 "+nowHM()); }; });
5337:    setSession(b.dataset.cancel,date,{cancelled:true,status:null,startedAt:"",endedAt:""}); renderToday(); renderGauges(); toast("?�강 처리 ??계산?�서 빠집?�다"); }; });
5339:    setSession(b.dataset.uncancel,date,{cancelled:false}); renderToday(); renderGauges(); toast("?�강 ?�제"); }; });
5346:    persist(); renderToday(); renderGauges(); }; });
5350:    persist(); renderToday(); }; });
5406:      renderToday(); renderGauges();
6421:        persist(); closeSheet(); renderToday(); }}])
6429:        ui.day=p.date; persist(); closeSheet(); renderToday(); toast("?�습???�었?�니??); }}]),
6508:  persist(); renderToday();
7062:  else if(ui.view==="today") renderToday();
7279:    renderToday(); }; });
7452:    if(autoStartClasses() && ui.view==="today"){ renderToday(); renderGauges(); }
7489:    V25.atomCal(date,date,function(fresh){ if(fresh&&ui.view==="today"&&(ui.day||today())===date) renderToday(); });
7662:    _renderToday();
8575:  renderToday=function(){ _renderToday(); var rl=$("#reviewList"); var card=rl&&rl.closest?rl.closest(".card"):null; if(card) card.style.display="none"; };
9411:   버튼?� ?�을 #resume ?�로 ?�다(#at= ?� ?�트 ?�작?�로 ?�돌리�?�??��? ?�는??. ??뷰어�??�으�?closeNote) 카드�??�시 그린??
9460:  V43.refresh=function(){ try{ V43.renderToday(); }catch(e){} try{ if(ui.view==="course") V43.renderCourse(); }catch(e){} };
9461:  var _renderToday=renderToday; renderToday=function(){ _renderToday(); try{ V43.renderToday(); }catch(e){ if(window.console) console.warn("V43", e); } };
9476:if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start);

채점 분기와 기존 해시 진입 경로는 유지됩니다. 저장값의 HTML 삽입과 검사 도중 페이지를 닫는 경로를 추가 확인합니다.

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command "@'
const fs=require('fs'),vm=require('vm');
const root='C:/Users/user/Desktop/아톰OS/기술실/study-console/';
const app=fs.readFileSync(root+'index.html','utf8');
const tpl=fs.readFileSync(root+'docs/tools/slides_tpl.html','utf8');
const ctx={window:{},document:{createElement:()=>({}),head:{appendChild(){}}},renderToday(){},renderCourse(){},closeNote(){},esc:s=>String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c])),localStorage:{getItem:()=>JSON.stringify({href:'notes/a.html',idx:0,n:'<img src=x onerror=alert(1)>',part:'<img src=x onerror=alert(2)>',qN:1,qDone:'<img src=x onerror=alert(3)>'})}};
ctx.window.addEventListener=()=>{};vm.createContext(ctx);
vm.runInContext(app.slice(app.indexOf('(function(){',app.indexOf('V43 LAYER')),app.indexOf('})();',app.indexOf('V43 LAYER'))+5),ctx);
const r=ctx.window.V43.last();const html=ctx.window.V43.html(r,false);
console.log('record accepted:',"'!!r,'"'raw img tags:',(html.match(/<img /g)||[]).length);
const events={},writes=[];
const c={DECK_ID:'test',SLIDES:[{id:'q1',type:'q'}],PARTS:[],document:{title:'test'},location:{hash:'#check',href:'https://example.test/notes/test.html#check'},localStorage:{getItem:()=>null,setItem:(k,v)=>writes.push([k,JSON.parse(v)])},window:{addEventListener:(k,v)=>events[k]=v}};
vm.createContext(c);vm.runInContext(tpl.slice(tpl.indexOf('const KEY='),tpl.indexOf('const "'$='"')),c);
vm.runInContext('ST.answer.q1=\"x\"; ST.revealed.q1=true; ST.correct.q1=false;',c);events.pagehide();
console.log('#check pagehide writes:',JSON.stringify(writes));
'@ | node" in C:\Users\user\본사\otta
 exited 1 in 326ms:
node:fs:621
    return binding.readFileUtf8(path, stringToFlags(options.flag));
                   ^

Error: ENOENT: no such file or directory, open 'C:\Users\user\Desktop\??OS\???\study-console\index.html'
    at Object.readFileSync (node:fs:621:20)
    at [stdin]:3:14
    at runScriptInThisContext (node:internal/vm:219:10)
    at node:internal/process/execution:485:12
    at [stdin]-wrapper:6:24
    at runScriptInContext (node:internal/process/execution:483:60)
    at evalFunction (node:internal/process/execution:317:30)
    at evalTypeScript (node:internal/process/execution:329:3)
    at node:internal/main/eval_stdin:51:5
    at Socket.<anonymous> (node:internal/process/execution:239:5) {
  errno: -4058,
  code: 'ENOENT',
  syscall: 'open',
  path: 'C:\\Users\\user\\Desktop\\??OS\\???\\study-console\\index.html'
}

Node.js v26.8.1

exec
"C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" -Command "@'
const fs=require('fs'),vm=require('vm');
const app=fs.readFileSync('index.html','utf8'),tpl=fs.readFileSync('docs/tools/slides_tpl.html','utf8');
const ctx={window:{addEventListener(){}},document:{createElement:()=>({}),head:{appendChild(){}}},renderToday(){},renderCourse(){},closeNote(){},esc:s=>String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c])),localStorage:{getItem:()=>JSON.stringify({href:'notes/a.html',idx:0,n:'<img src=x onerror=alert(1)>',part:'<img src=x onerror=alert(2)>',qN:1,qDone:'<img src=x onerror=alert(3)>'})}};
vm.createContext(ctx);vm.runInContext(app.slice(app.indexOf('(function(){',app.indexOf('V43 LAYER')),app.indexOf('})();',app.indexOf('V43 LAYER'))+5),ctx);
const r=ctx.window.V43.last(),html=ctx.window.V43.html(r,false);console.log('record accepted:',"'!!r,'"'raw img tags:',(html.match(/<img /g)||[]).length);
const events={},writes=[];
const c={DECK_ID:'test',SLIDES:[{id:'q1',type:'q'}],PARTS:[],document:{title:'test'},location:{hash:'#check',href:'https://example.test/notes/test.html#check'},localStorage:{getItem:()=>null,setItem:(k,v)=>writes.push([k,JSON.parse(v)])},window:{addEventListener:(k,v)=>events[k]=v}};
vm.createContext(c);vm.runInContext(tpl.slice(tpl.indexOf('const KEY='),tpl.indexOf('const "'$='"')),c);vm.runInContext('ST.answer.q1=\"x\"; ST.revealed.q1=true; ST.correct.q1=false;',c);events.pagehide();console.log('#check pagehide writes:',JSON.stringify(writes));
'@ | node" in C:\Users\user\Desktop\아톰OS\기술실\study-console
 succeeded in 317ms:
record accepted: true raw img tags: 3
#check pagehide writes: [["mc-slides-test",{"idx":0,"done":{},"correct":{"q1":false},"revealed":{"q1":true},"answer":{"q1":"x"},"ink":{},"finger":false,"padBig":false,"skip":{}}]]

- **GREEN** — 채점 상태 전이. 정답은 풀이 판을 닫고, 오답·주관식 자기채점 전에는 엽니다. 객관식 즉시 채점과 다시 풀기의 상태 초기화도 연결됩니다.
- **GREEN** — 저장 원본·복원. 덱이 저장하고 앱은 읽습니다. `#resume`은 저장된 `ST.idx`를 사용합니다. 기존 `#at=/#from=/#done=` 분기는 유지됩니다.
- **GREEN** — 같은 출처 iframe 연동. 덱의 localStorage 변경은 부모 창의 `storage` 수신 대상입니다. 저장한 iframe 자신에게 이벤트가 오지 않는 점은 문제가 아닙니다.
- **RED** — HTML 이스케이프 누락. `index.html:9434–9439`의 `n`, `part`, `qDone`, `qN`이 검증 없이 HTML에 들어갑니다. 조작된 저장값을 `V43.last()`가 받아들이고 `<img onerror=…>` 3개를 그대로 출력함을 메모리 검사로 재현했습니다. 저장값 조작 경로가 전제이며, 외부 공격 유입은 확인 못 했습니다. 숫자 필드 검증과 출력 이스케이프가 필요합니다.
- **RED** — `#check` 중 종료하면 검사 상태가 저장됩니다. 새 `pagehide`가 호출하는 `save()`는 해시 검사 **전에** `KEY`를 씁니다. 검사 중 생성된 답 `"x"`·오답·공개 상태가 저장됨을 재현했습니다. 기존 학습 저장소에서 검사하다 닫으면 진도가 오염됩니다. `#check`에서는 `save()` 전체를 차단해야 합니다.

실제 파일 확인·메모리 재현을 수행했습니다. 파일 변경 없음. 제공된 검사 수치는 재실행하지 않았습니다.

전체 판정: RED(2건)

## 2차
**GREEN.** 제시한 수정 코드에서 두 RED가 닫혔습니다.

- (a) `n·part·qDone·qN`이 유한한 비음수 정수로 변환됩니다. HTML 문자열을 넣어도 `0`으로 처리되어 숫자 칸의 삽입 경로가 닫혔습니다.
- (b) `#check`에서는 `save()`가 저장 전에 반환합니다. `pagehide`에서 호출되어도 저장소에 쓰지 않습니다.
- 제시된 범위에서 새 결함은 발견하지 못했습니다. 실제 덱 5개의 동일 반영 여부는 확인 못 함.

전체 판정: GREEN
