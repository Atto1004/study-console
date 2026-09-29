/* 화면 부가 설명 검사 — 대표님 2026-09-29 「부가적인 설명을 붙인 텍스트들은 전부 화면상에 안 보이게, 화면에는 필요한 것만 심플하게」(지침 학습시스템 §24).
   앱(_shot.html 하네스)의 화면마다, 교실·수업 노트·암기노트 페이지에서 「설명하는 문장」으로 보이는 글을 모은다.
   설명 문장 = 보이는 글 조각(자기 글자 12자 이상)이 안내 어미(니다·세요·해요·돼요·예요·줍니다…)나 조작 안내(누르면·고르면·→ 흐름)를 담은 것.
   버튼 글자·입력칸·스앵님 대사(#dText·.v55-say 등 말풍선)·본문 학습 내용(판서·교재 본문·문제)은 뺀다.
   사용: node helper_text_audit.cjs [--json out.json]   (앱은 _shot.html 을 먼저 만든다: meta charset + index.html + /tmp/_harness.txt)
   결과: 줄마다 「화면 | 선택자 | 글꼴px | 글」. 0건이 목표. */
const { launch, newPage } = require("./classroom_design_audit.cjs");
const url = require("url"), fs = require("fs"), path = require("path");
const SC = path.resolve(__dirname, "..", "..") + "/";
const APP = q => url.pathToFileURL(SC + "_shot.html").href + q;
const PAGE = f => url.pathToFileURL(SC + f).href;
const DESK = { w: 1040, h: 918 };
const WAIT_APP = `new Promise(r=>{ let n=0; (function w(){ if(/^(READY|OV)/.test(document.title)||n++>150) setTimeout(()=>r(document.title),900); else setTimeout(w,100); })(); })`;
const WAIT_PAGE = `new Promise(r=>{ let n=0; (function w(){ if((window.renderMathInElement&&document.readyState==="complete")||n++>100) setTimeout(()=>r(true),900); else setTimeout(w,100); })(); })`;
function collect() {
  const SKIP = ".it,.ch>h3,script,style,noscript,button,input,textarea,select,option,label.sw,#dText,.text,.v55-say,.v56-say,.say-b,.bubble,#bc,.bl,section.s,.q .qb,.q .ans,.choices,.katex,svg,title,code,pre,.toc,.memo-note .it";
  const HELP = /(니다|세요|해요|돼요|예요|에요|줍니다|봅니다|됩니다|합니다|습니다|이에요|어요|아요)[.!…)」]*$|누르면|고르면|누르세요|눌러|하시면|하면 [^ ]+ (?:됩|보여|나와)|보여줍|→ [^ ]+ →|숫자 키|단축키|두 손가락|밀어서 보|가로로 돌리|Enter ·|업로드 여부|부터 「|자료가 오면|넣으면 /;
  const out = [], seen = new Set();
  const vis = el => { if (el.closest("details:not([open])") && !el.closest("summary")) return false; const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; const cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) return false; for (let p = el; p; p = p.parentElement) { const c = getComputedStyle(p); if (c.display === "none" || c.visibility === "hidden") return false; } return true; };
  const sel = el => { const a = []; for (let p = el; p && p.nodeType === 1 && a.length < 4; p = p.parentElement) { let s = p.tagName.toLowerCase(); if (p.id) { s += "#" + p.id; a.unshift(s); break; } const c = String(p.className && p.className.baseVal !== undefined ? p.className.baseVal : p.className || "").trim().split(/\s+/).filter(Boolean).slice(0, 2); if (c.length) s += "." + c.join("."); a.unshift(s); } return a.join(" > "); };
  document.querySelectorAll("body *").forEach(el => {
    if (el.closest(SKIP)) return;
    let own = ""; el.childNodes.forEach(n => { if (n.nodeType === 3) own += n.textContent; });
    own = own.replace(/\s+/g, " ").trim();
    const full = (el.textContent || "").replace(/\s+/g, " ").trim();
    const txt = own.length >= 12 ? own : (el.children.length <= 3 && full.length >= 12 && full.length <= 160 && [...el.children].every(c => /^(B|I|SMALL|SPAN|EM|STRONG|KBD|A|BR)$/.test(c.tagName)) ? full : "");
    if (!txt || !HELP.test(txt) || !vis(el)) return;
    const key = txt.slice(0, 60); if (seen.has(key)) return; seen.add(key);
    out.push({ sel: sel(el), fs: parseFloat(getComputedStyle(el).fontSize) || 0, text: txt.slice(0, 140) });
  });
  return out;
}
(async () => {
  const B = await launch(), all = [];
  const run = async (name, target, wait, prep) => { const P = await newPage(B, DESK); try { await P.goto(target); await P.eval(wait); if (prep) await P.eval(prep); const r = await P.call(collect); r.forEach(x => all.push(Object.assign({ view: name }, x))); } catch (e) { all.push({ view: name, sel: "ERROR", fs: 0, text: String(e.message).slice(0, 160) }); } finally { await P.close(); } };
  try {
    if (fs.existsSync(SC + "_shot.html")) {
      for (const v of ["today", "study", "shelf", "todo", "cal", "grade", "lib", "set", "pc"]) await run("app:" + v, APP("?v=" + v), WAIT_APP);
      for (const cn of ["공업수학1", "미분적분학2", "정역학", "일반물리학2", "CADD"]) await run("app:course:" + cn, APP("?v=course&cn=" + encodeURIComponent(cn)), WAIT_APP);
    }
    const reg = JSON.parse(fs.readFileSync(SC + "knowledge/lessons.json", "utf8"));
    const pages = []; for (const [cn, m] of Object.entries(reg.courses)) for (const [d, r] of Object.entries(m)) { if (r.classroom) pages.push(["classroom:" + cn + " " + d, r.classroom]); if (r.file) pages.push(["notes:" + cn + " " + d, r.file]); }
    const cls = pages.filter(p => p[0].startsWith("classroom:")), nts = pages.filter(p => p[0].startsWith("notes:"));
    const pick = cls.filter((p, i) => i % 5 === 0).concat(nts.filter((p, i) => i % 5 === 0));
    for (const [n, f] of pick) await run(n, PAGE(f), WAIT_PAGE);
    for (const f of fs.readdirSync(SC + "notes").filter(x => /-slides\.html$/.test(x))) await run("deck:" + f, PAGE("notes/" + f), WAIT_PAGE);
    if (fs.existsSync(SC + "learn.html")) await run("learn", PAGE("learn.html") + "?subject=" + encodeURIComponent("미분적분학2"), WAIT_PAGE);
    for (const f of fs.existsSync(SC + "notes/memo") ? fs.readdirSync(SC + "notes/memo").filter(x => x.endsWith(".html")) : []) await run("memo:" + f, PAGE("notes/memo/" + f), WAIT_PAGE);
  } finally { await B.close(); }
  all.forEach(x => console.log([x.view, x.sel, x.fs, x.text].join(" | ")));
  console.log("합계 " + all.filter(x => x.sel !== "ERROR").length + "건");
  const j = process.argv.indexOf("--json"); if (j > 0) fs.writeFileSync(process.argv[j + 1], JSON.stringify(all, null, 1));
})();
