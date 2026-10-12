// 강의실 칠판·자막 정렬 측정 함수 (page.evaluate 로 보낸다). classroom_align_check.mjs 가 쓴다.
// 칠판 상자의 가로 중심선(axis) 대비 각 줄 글자 잉크의 중심 편차(dev)·들여쓰기·정렬, 자막 영역의 가로·세로 중심 편차, 터치 요소 크기를 잰다.
export function measureBoard(){
  const $=s=>document.querySelector(s), R=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,r:r.right,b:r.bottom}};
  const board=$("#board"); if(!board) return null; const br=R(board); const cs0=getComputedStyle(board);
  const axis=br.x+br.w/2;
  const bpl=parseFloat(cs0.paddingLeft), bpr=parseFloat(cs0.paddingRight);
  // 잉크 범위: 요소 안 글자(Range rects) 의 왼쪽·오른쪽 끝
  // 잉크 범위: 글자(공백 제외) 하나하나의 Range 사각형 + KaTeX 그림(.katex-html) 상자. 줄 끝 공백·숨은 MathML 이 중심을 흐리지 않게 한다.
  const ink=(e)=>{ const rs=[]; const w=document.createTreeWalker(e,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest(".katex")?NodeFilter.FILTER_REJECT:(n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT)});
    for(let n;n=w.nextNode();){ const t=n.nodeValue; for(let i=0;i<t.length;i++){ if(/\s/.test(t[i])) continue; const r=document.createRange(); r.setStart(n,i); r.setEnd(n,i+1); for(const c of r.getClientRects()) if(c.width>0.3&&c.height>0.3) rs.push(c); } }
    e.querySelectorAll(".katex-html").forEach(k=>{ if(k.parentElement&&k.parentElement.closest(".katex-html")) return; const c=k.getBoundingClientRect(); if(c.width>0&&c.height>0) rs.push(c); });
    if(!rs.length) return null; return {l:Math.min(...rs.map(r=>r.left)), r:Math.max(...rs.map(r=>r.right)), t:Math.min(...rs.map(r=>r.top)), b:Math.max(...rs.map(r=>r.bottom)), lines:new Set(rs.map(r=>Math.round(r.top/6))).size}; };
  const rows=[]; 
  const take=(e,kind)=>{ const cs=getComputedStyle(e); const i=ink(e); if(!i) return; const r=R(e);
    rows.push({kind, text:(e.textContent||"").trim().replace(/\s+/g," ").slice(0,28), ta:cs.textAlign, ti:cs.textIndent, pl:cs.paddingLeft, pr:cs.paddingRight, ml:cs.marginLeft, mr:cs.marginRight, br:cs.borderRightWidth, bl:cs.borderLeftWidth, cls:(typeof e.className==="string"?e.className:"").split(/\s+/).slice(0,2).join("."),
      inkL:+(i.l-br.x).toFixed(1), inkR:+(br.r-i.r).toFixed(1), dev:+(((i.l+i.r)/2)-axis).toFixed(1), boxDev:+(((r.x+r.r)/2)-axis).toFixed(1), lines:i.lines, w:Math.round(r.w), fs:cs.fontSize}); };
  board.querySelectorAll(".board-parent").forEach(e=>take(e,"parent"));
  board.querySelectorAll("h1").forEach(e=>take(e,"h1"));
  board.querySelectorAll(".caption").forEach(e=>take(e,"caption"));
  board.querySelectorAll(".content > *").forEach(e=>{ if(e.matches(".chalk-row")) take(e,"row"); else if(e.querySelector(".katex-display")||e.matches(".katex-display")) take(e,"math"); else take(e,e.tagName.toLowerCase()); });
  board.querySelectorAll(".katex-display").forEach(e=>{ const k=e.querySelector(".katex"); if(k){ const r=R(k); rows.push({kind:"katexbox",text:"(display)",boxDev:+(((r.x+r.r)/2)-axis).toFixed(1),w:Math.round(r.w)}); }});
  board.querySelectorAll("svg,figure,table,ul,ol,li,img").forEach(e=>{ if(e.closest(".katex")) return; const r=R(e); if(r.w>4) rows.push({kind:e.tagName.toLowerCase(),text:"",boxDev:+(((r.x+r.r)/2)-axis).toFixed(1),w:Math.round(r.w),h:Math.round(r.h)}); });
  const out={board:br, axis, bpl, bpr, rows};
  // 자막
  const vn=$(".v3-vn"); if(vn){ const vr=R(vn), vax=vr.x+vr.w/2, vcs=getComputedStyle(vn); const name=vn.querySelector(".v3-vn-name"), p=vn.querySelector(".v3-msg:last-of-type p")||vn.querySelector(".v3-msg p"), pg=vn.querySelector(".v3-log-pages"), log=vn.querySelector(".v3-log");
    const pi=p?ink(p):null, ci=log?R(log):null;
    out.vn={box:vr, name:name?R(name):null, nameText:name?name.textContent:"", text:p?p.textContent.trim().slice(0,30):"", ta:p?getComputedStyle(p).textAlign:null, fs:p?getComputedStyle(p).fontSize:null,
      inkDevX: pi?+(((pi.l+pi.r)/2)-vax).toFixed(1):null, zoneT:name?R(name).b:vr.y, zoneB:pg&&R(pg).h>0?R(pg).y:vr.b, inkT:pi?pi.t:null, inkB:pi?pi.b:null, inkL:pi?pi.l-vr.x:null, inkR:pi?vr.r-pi.r:null, lines:pi?pi.lines:0, pages:pg?R(pg):null, log:ci, padL:vcs.paddingLeft, padR:vcs.paddingRight};
  }
  return out;
}
export function measureLayout(){
  const sels={header:"header",rail:".subject-context",stage:"#lectureStage",board:"#board",guide:".v3-guide",vn:".v3-vn",textbook:".lesson-textbook",quests:".lecture-quests",bar:".v3-bar",chat:".sb",room:"#room"};
  const o={vw:innerWidth,vh:innerHeight}; for(const [k,s] of Object.entries(sels)){ const e=document.querySelector(s); if(!e){o[k]=null;continue;} const r=e.getBoundingClientRect(); o[k]=[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]; }
  const small=[...document.querySelectorAll(".school button, .school summary, .school input, .school a")].filter(e=>{const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=="hidden"&&(r.width<44||r.height<44);}).map(e=>{const r=e.getBoundingClientRect(); return (e.getAttribute("aria-label")||e.title||e.innerText||e.tagName).trim().slice(0,18)+" "+Math.round(r.width)+"x"+Math.round(r.height);});
  o.touch=[...document.querySelectorAll(".v3-bar button, .v3-bar summary, .v3-route button, .v3-vn .v3-log-pages button, .subject-textbook-toc button, .lecture-quests .quest-item label")].filter(e=>{const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=="hidden"&&(r.width<43.5||r.height<43.5);}).map(e=>{const r=e.getBoundingClientRect(); return (e.getAttribute("aria-label")||e.title||e.innerText||e.tagName).trim().slice(0,18)+" "+Math.round(r.width)+"x"+Math.round(r.height);});
  o.small=small; const bc=document.querySelector("#board .content"); o.boardFont=bc?getComputedStyle(bc).fontSize:null; o.h1Font=document.querySelector("#board h1")?getComputedStyle(document.querySelector("#board h1")).fontSize:null;
  o.scrollW=document.documentElement.scrollWidth; o.scrollH=document.documentElement.scrollHeight; return o;
}
