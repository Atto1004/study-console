/* 교실 v2 화면 검사(헤드리스 크롬) — 실제 KaTeX·웹폰트로 모든 단계를 즉시 표시로 렌더해서
     katex-error 0 · 식(.katex-display) 가로 넘침 0 · 판서 줄 넘침 0 · 그림 있는 단계에 svg·분필 필터 있음 · 미래 그림 단계 숨김 수 · 말풍선 넘침 0 · 글꼴 4종 로드
   사용: node docs/tools/classroom_render_check.cjs notes/classroom/<slug>/<date>.html [--w=1040,500]
   결과: 콘솔 요약 + scratch/_figchk/render_<파일>.json. 문제가 하나라도 있으면 종료 코드 1 (오타 설계 회의 2차 「KaTeX·필터 잘림 검사」) */
const fs = require("fs"), path = require("path"), cp = require("child_process");
const ROOT = path.resolve(__dirname, "..", "..");
const CH = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUTDIR = path.join(process.env.USERPROFILE || process.env.HOME, ".claude", "scratch", "sc_test", "_figchk");
fs.mkdirSync(OUTDIR, { recursive: true });
const files = process.argv.slice(2).filter(a => !a.startsWith("--")).map(f => f.replace(/\\/g, "/"));
const widths = (process.argv.find(a => a.startsWith("--w=")) || "--w=1040,500").slice(4).split(",").map(Number);
if (!files.length) { console.log("파일을 주세요: notes/classroom/<slug>/<date>.html"); process.exit(2); }
const INJ = `<script>
(function(){
 function go(){ const X=window.__cr, D=X.D;
   const out={w:innerWidth,fonts:{gaegu:document.fonts.check('700 14px Gaegu'),gowun:document.fonts.check('14px "Gowun Dodum"'),gothic:document.fonts.check('800 14px "Gothic A1"'),inter:document.fonts.check('600 14px Inter')},steps:[]};
   X.reduce=true; X.cancelAll();
   D.chapters.forEach((c,ci)=>c.steps.forEach((s,si)=>{ X.S.mode="step"; X.S.ci=ci; X.S.si=si; X.S.resume=false; X.S.again=0; X.render();
     const bc=document.getElementById("bc"), wrap=document.getElementById("bwrap"), dt=document.getElementById("dText"), svg=bc.querySelector(".bd-fig svg");
     out.steps.push({id:s.id,fig:s.fig||null,fs:s.fs,kerr:bc.querySelectorAll(".katex-error").length,katex:bc.querySelectorAll(".katex").length,
       kover:[...bc.querySelectorAll(".katex-display")].filter(k=>k.scrollWidth>k.clientWidth+1).length,
       lover:[...bc.querySelectorAll(".bl")].filter(l=>l.scrollWidth>l.clientWidth+1).length, lines:bc.querySelectorAll(".bl").length,
       svg:!!svg, svgw:svg?svg.getBoundingClientRect().width:0, filt:bc.querySelectorAll(".bd-fig filter").length, hidden:bc.querySelectorAll(".bd-fig [data-step][hidden]").length, shown:bc.querySelectorAll(".bd-fig [data-step]:not([hidden])").length,
       /* 기대값: 그림 단계 번호 > fs 인 묶음 수 = 숨김 수, ≤ fs = 보임 수, 즉시 표시라 pre(가림)·계산 opacity 0 은 없어야 */
       expHidden:svg?[...svg.querySelectorAll("[data-step]")].filter(g=>+g.getAttribute("data-step")>s.fs).length:0, expShown:svg?[...svg.querySelectorAll("[data-step]")].filter(g=>+g.getAttribute("data-step")<=s.fs).length:0,
       pre:bc.querySelectorAll(".bd-fig .pre").length, invisible:svg?[...svg.querySelectorAll("[data-step]:not([hidden])")].filter(g=>getComputedStyle(g).opacity==="0").length:0,
       bh:wrap.scrollHeight, bw:wrap.clientHeight, anim:!!X.anim, pending:X.pending, bubble:dt.scrollWidth>dt.clientWidth+1, say:(dt.textContent||"").length}); }));
   out.quiz=[]; D.quiz.forEach((q,qi)=>{ X.T.hearts=3; X.S.mode="quiz"; X.S.qi=qi; X.render(); out.quiz.push({id:q.id,kerr:document.querySelectorAll("#bc .katex-error").length,kover:[...document.querySelectorAll("#bc .katex-display")].filter(k=>k.scrollWidth>k.clientWidth+1).length,choices:document.querySelectorAll("#bc .cb").length,over:[...document.querySelectorAll("#bc .cb")].filter(b=>b.scrollWidth>b.clientWidth+1).length}); });
   const pre=document.createElement("pre"); pre.id="__out"; pre.textContent=JSON.stringify(out); document.body.appendChild(pre); }
 const want=['700 14px Gaegu','14px "Gowun Dodum"','800 14px "Gothic A1"','600 14px Inter'];
 (function wait(){ if(window.__cr&&window.renderMathInElement){ Promise.all(want.map(f=>document.fonts.load(f).catch(()=>null))).then(()=>document.fonts.ready).then(()=>setTimeout(go,300)); } else setTimeout(wait,50); })();
})();
</script>`;
let total = 0;
for (const rel of files) {
  const html = fs.readFileSync(path.isAbsolute(rel) ? rel : path.join(ROOT, rel), "utf8");
  if (!/__cr=|__cr\s*=/.test(html)) { console.log("교실 페이지가 아님: " + rel); total++; continue; }
  const hp = path.join(OUTDIR, "render_" + rel.replace(/[:\/\\]/g, "_"));
  fs.writeFileSync(hp, html.replace(/<\/body>/, INJ + "</body>"), "utf8");
  for (const W of widths) {
    let dom = "";
    try { dom = cp.execFileSync(CH, ["--headless=new", "--disable-gpu", "--no-sandbox", "--allow-file-access-from-files", `--window-size=${W},900`, "--virtual-time-budget=20000", "--dump-dom", "file:///" + hp.replace(/\\/g, "/")], { maxBuffer: 64e6, stdio: ["ignore", "pipe", "ignore"] }).toString("utf8"); }
    catch (e) { console.log("CHROME FAIL", rel, W, String(e.message).slice(0, 120)); total++; continue; }
    const m = /<pre id="__out">([\s\S]*?)<\/pre>/.exec(dom); if (!m) { console.log("NO OUTPUT " + rel + " @" + W); total++; continue; }
    const res = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));
    const issues = [];
    Object.entries(res.fonts).forEach(([k, v]) => { if (!v) issues.push("폰트 미로드 " + k); });
    res.steps.forEach(s => { const tag = s.id + (s.fig ? "(" + s.fig + "/" + s.fs + ")" : "");
      if (s.kerr) issues.push(tag + " katex-error " + s.kerr); if (s.kover) issues.push(tag + " 식 가로 넘침 " + s.kover); if (s.lover) issues.push(tag + " 판서 줄 넘침 " + s.lover);
      if (!s.lines) issues.push(tag + " 판서 줄 0"); if (s.fig && !s.svg) issues.push(tag + " 그림 svg 없음"); if (s.fig && !s.filt) issues.push(tag + " 분필 필터 없음"); if (s.fig && s.svgw < 200) issues.push(tag + " 그림 폭 " + Math.round(s.svgw));
      if (s.anim || s.pending) issues.push(tag + " 즉시 표시인데 예약 작업"); if (s.bubble) issues.push(tag + " 말풍선 가로 넘침"); if (!s.say) issues.push(tag + " 대사 없음");
      if (s.fig) { if (s.hidden !== s.expHidden || s.shown !== s.expShown) issues.push(tag + ` 그림 단계 숨김/보임 ${s.hidden}/${s.shown} ≠ 기대 ${s.expHidden}/${s.expShown}`); if (!s.expShown) issues.push(tag + " 보이는 그림 단계 0"); if (s.pre) issues.push(tag + " 즉시 표시인데 가림(pre) " + s.pre); if (s.invisible) issues.push(tag + " 보여야 할 그림 단계의 opacity 0: " + s.invisible); } });
    (res.quiz || []).forEach(q => { if (q.kerr) issues.push("문제 " + q.id + " katex-error " + q.kerr); if (q.kover) issues.push("문제 " + q.id + " 식 가로 넘침 " + q.kover); if (q.over) issues.push("문제 " + q.id + " 보기 가로 넘침 " + q.over); });
    fs.writeFileSync(path.join(OUTDIR, "render_" + path.basename(rel, ".html") + "_" + W + ".json"), JSON.stringify(res, null, 1), "utf8");
    const withFig = res.steps.filter(s => s.fig).length, hiddenTot = res.steps.reduce((a, s) => a + s.hidden, 0), katexTot = res.steps.reduce((a, s) => a + s.katex, 0);
    console.log((issues.length ? "ISSUES " : "ok     ") + rel.replace("notes/classroom/", "") + " @" + res.w + "px · 단계 " + res.steps.length + " · 그림 단계 " + withFig + " · 숨긴 미래 단계 " + hiddenTot + " · KaTeX 식 " + katexTot + (issues.length ? "  issues " + issues.length : ""));
    issues.slice(0, 20).forEach(i => console.log("    - " + i)); total += issues.length;
  }
}
console.log("\n총 문제 " + total);
process.exit(total ? 1 : 0);
