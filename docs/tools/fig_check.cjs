/* 수업 노트 그림(SVG) 품질 검사 — 대표님 2026-09-26 "글자·선 겹침, 깨진 글자 절대 안 됨"
   헤드리스 크롬으로 각 회차의 figure.fig SVG 를 실제 폰트로 렌더해 검사한다:
     out   글자 상자가 캔버스(viewBox) 밖으로 나감(잘림)
     tt    글자 상자끼리 겹침
     tl    <line> 이 글자 상자 안을 4px 넘게 지나감
     tp    path/circle/ellipse/rect 의 획이 글자 상자 안을 지나감(샘플 3점 이상)
     glyph 결합 문자(⃗ 등)·대체 문자 — 폰트에서 깨져 보이는 것
   사용: node docs/tools/fig_check.cjs [notes/lessons/<slug>/<date>.html ...]   (없으면 24회차 전부)
   결과: 콘솔 요약 + scratch/_figchk/report.json. 문제가 하나라도 있으면 종료 코드 1 */
const fs = require("fs"), path = require("path"), cp = require("child_process");
const ROOT = path.resolve(__dirname, "..", "..");
const CH = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUTDIR = path.join(process.env.USERPROFILE || process.env.HOME, ".claude", "scratch", "sc_test", "_figchk");
fs.mkdirSync(OUTDIR, { recursive: true });

function allLessons() {
  const out = []; const base = path.join(ROOT, "notes", "lessons");
  for (const c of fs.readdirSync(base)) { const d = path.join(base, c); if (c.startsWith("_") || !fs.statSync(d).isDirectory()) continue;
    for (const f of fs.readdirSync(d)) if (f.endsWith(".html")) out.push(path.join("notes", "lessons", c, f).replace(/\\/g, "/")); }
  return out.sort();
}
const files = process.argv.slice(2).length ? process.argv.slice(2).map(f => f.replace(/\\/g, "/")) : allLessons();

const HARNESS = (figs) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<style>body{font-family:"Pretendard Variable",Pretendard,-apple-system,sans-serif;margin:0;padding:10px}figure{margin:0 0 16px}svg{display:block}</style></head><body>
<div id="figs">${figs}</div><pre id="out"></pre>
<script>
function run(){
  const res=[];
  document.querySelectorAll("#figs > figure").forEach((fig,fi)=>{
    const svg=fig.querySelector("svg"); if(!svg) return;
    const vb=svg.viewBox.baseVal, W=vb.width, H=vb.height;
    const texts=[...svg.querySelectorAll("text")].map(t=>{ const b=t.getBBox(); return {txt:t.textContent.trim(),x:b.x,y:b.y,w:b.width,h:b.height}; }).filter(t=>t.txt&&t.w>0);
    const issues=[]; const sh=(t,m)=>({x:t.x+m,y:t.y+m,r:t.x+t.w-m,b:t.y+t.h-m});
    texts.forEach(t=>{ if(t.x<-1||t.y<-1||t.x+t.w>W+1||t.y+t.h>H+1) issues.push({k:"out",t:t.txt,box:[t.x,t.y,t.w,t.h].map(Math.round),W,H}); });
    for(let i=0;i<texts.length;i++) for(let j=i+1;j<texts.length;j++){ const a=sh(texts[i],1),b=sh(texts[j],1);
      const ix=Math.min(a.r,b.r)-Math.max(a.x,b.x), iy=Math.min(a.b,b.b)-Math.max(a.y,b.y);
      if(ix>1&&iy>1) issues.push({k:"tt",t:texts[i].txt,u:texts[j].txt,ov:[Math.round(ix),Math.round(iy)]}); }
    const segs=[...svg.querySelectorAll("line")].map(l=>({x1:+l.getAttribute("x1"),y1:+l.getAttribute("y1"),x2:+l.getAttribute("x2"),y2:+l.getAttribute("y2")}));
    const pts=[];
    svg.querySelectorAll("path,circle,ellipse,rect").forEach(e=>{ if(e.closest("defs")) return; const st=e.getAttribute("stroke"); const sw=parseFloat(e.getAttribute("stroke-width")||"1"); if(!st||st==="none"||sw===0) return;
      let len=0; try{ len=e.getTotalLength(); }catch(err){ return; } if(!(len>0)) return; const n=Math.min(600,Math.max(8,Math.floor(len/2)));
      for(let i=0;i<=n;i++){ const p=e.getPointAtLength(len*i/n); pts.push({x:p.x,y:p.y,tag:e.tagName}); } });
    const inside=(s,r)=>{ const n=Math.max(4,Math.floor(Math.hypot(s.x2-s.x1,s.y2-s.y1)/2)); let c=0; for(let i=0;i<=n;i++){ const x=s.x1+(s.x2-s.x1)*i/n,y=s.y1+(s.y2-s.y1)*i/n; if(x>r.x&&x<r.r&&y>r.y&&y<r.b) c++; } return c*2; };
    texts.forEach(t=>{ const r=sh(t,1.5); let worst=0; segs.forEach(s=>{ const L=inside(s,r); if(L>worst) worst=L; }); if(worst>4) issues.push({k:"tl",t:t.txt,len:Math.round(worst)});
      const byTag={}; pts.forEach(p=>{ if(p.x>r.x&&p.x<r.r&&p.y>r.y&&p.y<r.b) byTag[p.tag]=(byTag[p.tag]||0)+1; }); Object.keys(byTag).forEach(tag=>{ if(byTag[tag]>=3) issues.push({k:"tp",t:t.txt,tag,n:byTag[tag]}); }); });
    texts.forEach(t=>{ if(/[\\u0300-\\u036f\\u20d0-\\u20ff\\ufffd\\ufffc]/.test(t.txt)) issues.push({k:"glyph",t:t.txt}); });
    res.push({fig:fi,cap:((fig.querySelector("figcaption")||{}).textContent||"").slice(0,60),W,H,texts:texts.length,issues});
  });
  document.getElementById("out").textContent=JSON.stringify(res);
}
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(()=>setTimeout(run,400));
</script></body></html>`;

let total = 0; const report = {};
for (const rel of files) {
  const html = fs.readFileSync(path.join(ROOT, rel), "utf8");
  const figs = [...html.matchAll(/<figure class="fig">[\s\S]*?<\/figure>/g)].map(m => m[0]);
  if (!figs.length) { report[rel] = []; continue; }
  /* raw  그림 문자열 안의 이스케이프 안 된 < — 브라우저가 태그로 읽어 라벨이 사라지고 뒤 요소까지 깨진다(getBBox 로는 못 본다). 알려진 태그 이름이 아닌 < 는 전부 문제 */
  const KNOWN = /^<\/?(?:figure|figcaption|svg|g|path|circle|rect|line|text|tspan|polygon|polyline|ellipse|defs|marker|clipPath|use|title|desc|linearGradient|radialGradient|stop|pattern|mask|filter|image|b|i|em|strong|sup|sub|span|br|small|code)\b/;
  const raw = []; figs.forEach((f, fi) => { for (const m of f.matchAll(/<[^]/g)) { const s = f.slice(m.index, m.index + 24); if (!KNOWN.test(s) && !s.startsWith("<!--")) raw.push({ fig: fi, at: s }); } });
  if (raw.length) { total += raw.length; console.log("ISSUES " + rel.replace("notes/lessons/", "") + "  raw < " + raw.length + ": " + raw.slice(0, 4).map(r => "fig" + (r.fig + 1) + " " + JSON.stringify(r.at)).join(" · ")); }
  const hp = path.join(OUTDIR, rel.replace(/[\/\\]/g, "_"));
  fs.writeFileSync(hp, HARNESS(figs.join("\n")), "utf8");
  let dom = "";
  try { dom = cp.execFileSync(CH, ["--headless=new", "--disable-gpu", "--no-sandbox", "--allow-file-access-from-files", "--virtual-time-budget=8000", "--dump-dom", "file:///" + hp.replace(/\\/g, "/")], { maxBuffer: 64e6, stdio: ["ignore", "pipe", "ignore"] }).toString("utf8"); }
  catch (e) { console.log("CHROME FAIL", rel, String(e.message).slice(0, 120)); report[rel] = [{ error: true }]; total++; continue; }
  const m = /<pre id="out">([\s\S]*?)<\/pre>/.exec(dom);
  if (!m) { console.log("NO OUTPUT", rel); report[rel] = [{ error: true }]; total++; continue; }
  const res = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));
  const bad = res.filter(r => r.issues.length);
  const n = bad.reduce((s, r) => s + r.issues.length, 0); total += n;
  console.log((n ? "ISSUES " : "ok     ") + rel.replace("notes/lessons/", "") + "  figs " + res.length + (n ? "  issues " + n : ""));
  bad.forEach(r => { r.issues.slice(0, 12).forEach(i => { const tag = i.k === "tt" ? `"${i.t}" × "${i.u}" ${i.ov.join("x")}` : i.k === "tl" ? `"${i.t}" 선 ${i.len}px` : i.k === "tp" ? `"${i.t}" ${i.tag} ${i.n}점` : i.k === "out" ? `"${i.t}" ${i.box.join(",")} / ${i.W}x${i.H}` : `"${i.t}"`; console.log(`    #${r.fig + 1} [${i.k}] ${tag}`); }); if (r.issues.length > 12) console.log(`    #${r.fig + 1} … 외 ${r.issues.length - 12}`); });
  report[rel] = res;
}
fs.writeFileSync(path.join(OUTDIR, "report.json"), JSON.stringify(report, null, 1), "utf8");
console.log("\n총 문제 " + total + " · 보고서 " + path.join(OUTDIR, "report.json"));
process.exit(total ? 1 : 0);
