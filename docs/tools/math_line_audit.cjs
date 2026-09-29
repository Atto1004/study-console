/* 수식 한 줄 검사 — 대표님 2026-09-29 「수학 수식 한 줄로 이어지게, 중간에 들여쓰기 안 되게」(지침 학습시스템 §24)
   교실(단계마다 즉시 그리기)·수업 노트·암기노트에서: ① 인라인 식이 두 줄 이상으로 갈림(getClientRects 줄 수) ② 식 상자가 줄인 뒤에도 넘침(scrollWidth > clientWidth)
   ③ 식 글자가 14px 아래로 줄어듦. 사용: node math_line_audit.cjs [--w=1040,800,390] [--only=calc2] → 줄마다 「페이지 | 폭 | 위치 | 종류 | 식」, 끝에 합계 */
const { launch, newPage, READY } = require("./classroom_design_audit.cjs");
const url = require("url"), fs = require("fs"), path = require("path");
const SC = path.resolve(__dirname, "..", "..") + "/";
const arg = (k, d) => { const a = process.argv.find(x => x.startsWith("--" + k + "=")); return a ? a.split("=")[1] : d; };
const WS = arg("w", "1040,800,390").split(",").map(Number), ONLY = arg("only", "");
const WAITP = `new Promise(r=>{ let n=0; (function w(){ if((window.renderMathInElement&&document.readyState==="complete")||n++>120) setTimeout(()=>r(true),1200); else setTimeout(w,100); })(); })`;
function scan(where) {
  const out = [];
  const tx = el => (el.querySelector("annotation") || {}).textContent || el.textContent.slice(0, 80);
  document.querySelectorAll(".katex").forEach(k => { if (k.closest(".katex-display")) return; const r = k.getClientRects(); if (!k.getClientRects().length) return;
    const lines = new Set([...r].map(x => Math.round(x.top))).size; if (lines > 1) out.push({ where, kind: "인라인 두 줄", tex: tx(k) }); });
  document.querySelectorAll(".katex-display").forEach(k => { if (!k.getClientRects().length) return;
    if (k.scrollWidth > k.clientWidth + 2) out.push({ where, kind: "식 넘침 " + (k.scrollWidth - k.clientWidth) + "px", tex: tx(k) });
    const fz = parseFloat(getComputedStyle(k.querySelector(".katex") || k).fontSize); if (fz < 13.5) out.push({ where, kind: "식 글자 " + fz.toFixed(1) + "px", tex: tx(k) }); });
  return out;
}
(async () => {
  const B = await launch(), all = [];
  const reg = JSON.parse(fs.readFileSync(SC + "knowledge/lessons.json", "utf8"));
  const cls = [], nts = [];
  for (const [cn, m] of Object.entries(reg.courses)) for (const [d, r] of Object.entries(m)) { if (ONLY && !(r.classroom || "").includes("/" + ONLY + "/")) continue; if (r.classroom) cls.push(r.classroom); if (r.file) nts.push(r.file); }
  try {
    for (const w of WS) {
      const dev = w < 700 ? { w, h: 844, dpr: 1, mobile: true, touch: true } : { w, h: 918 };
      for (const f of cls) {
        const P = await newPage(B, dev);
        try { await P.goto(url.pathToFileURL(SC + f).href); await P.eval(READY);
          const r = await P.eval(`(${scan.toString()} , (()=>{ const X=window.__cr; X.reduce=true; const out=[]; X.D.chapters.forEach((c,ci)=>{ for(let si=0;si<c.steps.length;si++){ X.cancelAll(); X.S.mode="step"; X.S.ci=ci; X.S.si=si; X.S.resume=true; X.render(); fitMath(document.getElementById("bc")); fitInline(document.getElementById("bc")); out.push(...(${scan.toString()})("CH"+(ci+1)+"-"+(si+1))); } }); return out; })())`);
          r.forEach(x => all.push(Object.assign({ page: f, w }, x)));
        } catch (e) { all.push({ page: f, w, where: "ERROR", kind: String(e.message).slice(0, 120), tex: "" }); } finally { await P.close(); }
      }
      for (const f of nts.concat(fs.existsSync(SC + "notes/memo") ? fs.readdirSync(SC + "notes/memo").filter(x => x.endsWith(".html")).map(x => "notes/memo/" + x) : [])) {
        if (ONLY && !f.includes(ONLY)) continue;
        const P = await newPage(B, dev);
        try { await P.goto(url.pathToFileURL(SC + f).href); await P.eval(WAITP); const r = await P.call(scan, "page"); r.forEach(x => all.push(Object.assign({ page: f, w }, x))); }
        catch (e) { all.push({ page: f, w, where: "ERROR", kind: String(e.message).slice(0, 120), tex: "" }); } finally { await P.close(); }
      }
    }
  } finally { await B.close(); }
  all.forEach(x => console.log([x.page.replace(/^notes\//, ""), x.w, x.where, x.kind, String(x.tex).replace(/\s+/g, " ").slice(0, 90)].join(" | ")));
  const by = {}; all.forEach(x => { const k = x.kind.split(" ").slice(0, 2).join(" "); by[k] = (by[k] || 0) + 1; });
  console.log("합계 " + all.length + "건 " + JSON.stringify(by));
})();
