/* 교실 디자인 검사(헤드리스 크롬 · DevTools 프로토콜 직접, 설치 없음) — 오타 디자인 검수 1차 RED 의 「검증」 항목을 숫자로
   contrast : 판서·머리글·자막·목차·문제·결과·그림 글자의 WCAG 대비를 실제 합성 배경에서 계산
              (칠판 가장 밝은 곳 #41664F + 노이즈 흰색 3.5% 위에 조상 상자 배경을 차례로 합성, 글자 투명도·조상 opacity 포함). 작은 글자 4.5 · 큰 글자(24px, 굵게 18.66px) 3 미만 = 실패
   phone    : 390×844 터치 폰에서 모든 단계 — 조작 버튼 전부 화면 안 · Enter 안내 숨김 · 이번 단계 첫 줄이 판서 창 안 · 위 판서 버튼(머리글 안) = 스크롤 여부 ·
              자막 네 줄 이하 + 넘치면 「전체 ▾」 · 그림이 판서 창 밖으로 안 나감 · 페이지 가로 넘침 0 · 그림 칸 수·글자 최소 px(정보)
   small    : 360×640 · 300×649(390 폰 글자 130% 확대와 같은 CSS 폭) — 모든 단계 조작 버튼 화면 안(자막 펼친 상태 포함) · 가로 넘침 0
   fonts    : 실제로 그려진 글꼴(CSS.getPlatformFontsForNode) — 머리글·판서·그림 캡션·자막·조작부·목차·문제·결과
   keys     : 그림 확대창이 열린 채 Enter·Space(실제 키 입력)를 눌러도 교실 위치·저장이 그대로인지, Esc 로 닫히고 포커스가 돌아오는지
   --app    : 앱(_shot.html) 오늘·학습·과목 × 1040·390 — 행동 버튼(수업 따라가기 행·과목 행동 줄·로비 미션) 높이 44px 이상
   사용: node docs/tools/classroom_design_audit.cjs notes/classroom/<slug>/<date>.html ... [--only=contrast,phone,small,fonts]
   결과: 콘솔 요약 + ~/.claude/scratch/sc_test/_figchk/design_<slug>_<date>.json. 실패가 하나라도 있으면 종료 코드 1 */
const fs = require("fs"), path = require("path"), cp = require("child_process"), os = require("os"), url = require("url");
const ROOT = path.resolve(__dirname, "..", "..");
const CH = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUTDIR = path.join(process.env.USERPROFILE || process.env.HOME, ".claude", "scratch", "sc_test", "_figchk");
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- 최소 CDP 클라이언트 ---------- */
async function launch() {
  const port = 9300 + Math.floor(Math.random() * 600);
  const ud = fs.mkdtempSync(path.join(os.tmpdir(), "cdp-"));
  const proc = cp.spawn(CH, ["--headless=new", "--disable-gpu", "--no-sandbox", "--allow-file-access-from-files", "--hide-scrollbars", "--remote-debugging-port=" + port, "--user-data-dir=" + ud, "--no-first-run", "--no-default-browser-check", "about:blank"], { stdio: "ignore" });
  let ver = null;
  for (let i = 0; i < 150 && !ver; i++) { try { ver = await (await fetch("http://127.0.0.1:" + port + "/json/version")).json(); } catch (e) { await sleep(100); } }
  if (!ver) { proc.kill(); throw new Error("크롬 원격 디버깅 연결 실패"); }
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("웹소켓 연결 실패")); });
  let id = 0; const cbs = new Map(), subs = new Set();
  ws.onmessage = m => { const d = JSON.parse(typeof m.data === "string" ? m.data : m.data.toString()); if (d.id && cbs.has(d.id)) { const c = cbs.get(d.id); cbs.delete(d.id); d.error ? c.rej(new Error(d.error.message)) : c.res(d.result); } else if (d.method) subs.forEach(f => f(d)); };
  const send = (method, params, sessionId) => new Promise((res, rej) => { const i = ++id; cbs.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params: params || {}, sessionId })); });
  return { send, subs, async close() { try { await send("Browser.close"); } catch (e) {} await sleep(400); try { proc.kill(); } catch (e) {} try { fs.rmSync(ud, { recursive: true, force: true }); } catch (e) {} } };
}
async function newPage(B, o) {
  o = Object.assign({ w: 1040, h: 918, dpr: 1, mobile: false, touch: false }, o || {});
  const { targetId } = await B.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await B.send("Target.attachToTarget", { targetId, flatten: true });
  const s = (m, p) => B.send(m, p, sessionId);
  await s("Page.enable"); await s("Runtime.enable"); await s("DOM.enable"); await s("CSS.enable");
  await s("Emulation.setDeviceMetricsOverride", { width: o.w, height: o.h, deviceScaleFactor: o.dpr, mobile: o.mobile });
  if (o.touch) await s("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  return {
    s, o,
    async goto(u) { const done = new Promise(r => { const f = d => { if (d.sessionId === sessionId && d.method === "Page.loadEventFired") { B.subs.delete(f); r(); } }; B.subs.add(f); }); await s("Page.navigate", { url: u }); await done; },
    async eval(expr) { const r = await s("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text); return r.result.value; },
    async call(fn, arg) { return this.eval("(" + fn.toString() + ")(" + JSON.stringify(arg === undefined ? null : arg) + ")"); },
    async shot(file) { const r = await s("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(file, Buffer.from(r.data, "base64")); },
    async fonts(sel) { const { root } = await s("DOM.getDocument", { depth: -1 }); const { nodeId } = await s("DOM.querySelector", { nodeId: root.nodeId, selector: sel }); if (!nodeId) return null; return (await s("CSS.getPlatformFontsForNode", { nodeId })).fonts; },
    close() { return B.send("Target.closeTarget", { targetId }); }
  };
}
/* 교실 준비: __cr · KaTeX · 웹폰트 4종 */
const READY = `new Promise(r=>{ const want=['14px "Gowun Dodum"','600 14px "Gothic A1"','800 14px "Gothic A1"','600 14px Inter'];
  (function w(){ if(window.__cr&&window.renderMathInElement&&document.fonts){ Promise.all(want.map(f=>document.fonts.load(f).catch(()=>null))).then(()=>document.fonts.ready).then(()=>setTimeout(()=>r(true),300)); } else setTimeout(w,50); })(); })`;

/* ---------- 페이지 안에서 도는 검사 ---------- */
function pageContrast() {   /* 문서 전체(머리 표시줄·칠판·조작 줄·챕터 알약·목차 창·그림 확대창) × 화면 상태(목차·모든 단계·확대창·목차 창·문제 상태 6종·결과 4종·하트 0) — 오타 디자인 2차: 「틀렸어요」가 검사에서 빠졌다 */
  const X = window.__cr, D = X.D; X.reduce = true; X.cancelAll();
  const parse = c => { const m = /rgba?\(([^)]+)\)/.exec(c || ""); if (!m) return null; const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const over = (t, b) => ({ r: t.r * t.a + b.r * (1 - t.a), g: t.g * t.a + b.g * (1 - t.a), b: t.b * t.a + b.b * (1 - t.a), a: 1 });
  const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const BOARD = over({ r: 255, g: 255, b: 255, a: .035 }, { r: 0x41, g: 0x66, b: 0x4F, a: 1 });   /* 칠판 가장 밝은 곳 + 노이즈 최대 */
  const PAGE = { r: 0x1C, g: 0x33, b: 0x27, a: 1 };   /* 페이지 바탕 중 가장 밝은 곳(머리 쪽 방사형 빛 #1C3327) — 밝은 글자에 가장 불리 */
  const slide = document.querySelector(".slide");
  const bgOf = el => { const ch = []; for (let n = el; n && n !== document.documentElement; n = n.parentElement) ch.unshift(n); let bg = PAGE;
    ch.forEach(n => { if (n === document.body) return; if (n === slide) { bg = BOARD; return; } const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0) bg = over(c, bg); }); return bg; };
  const opOf = el => { let o = 1; for (let n = el; n && n !== document.documentElement; n = n.parentElement) { const v = parseFloat(getComputedStyle(n).opacity); o *= isNaN(v) ? 1 : v; } return o; };
  let STATE = "";
  const cat = el => { if (el.closest("#hud")) return "머리 표시줄"; if (el.closest("#figov")) return "그림 확대창"; if (el.closest("#ov")) return "목차 창";
    if (el.closest("#ctl")) return "조작 줄" + (STATE ? " · " + STATE : ""); if (el.closest("#chpills")) return "챕터 알약"; if (el.closest("#side")) return "옆 칸";
    if (el.closest("#chk")) return "머리글"; if (el.closest("#sub")) return "자막"; if (el.closest(".qz")) return "문제 · " + (STATE || "?"); if (el.closest(".res")) return "결과 · " + (STATE || "?"); if (el.closest(".toc")) return "목차(칠판)";
    if (el.closest(".bd-fig")) return el.closest("figcaption") ? "그림 캡션" : "그림 머리줄"; const bl = el.closest(".bl"); if (bl) { const k = [...bl.classList].find(c => c.startsWith("k-")) || "k-?"; return "판서 " + k + (bl.classList.contains("dim") ? " · 지난 단계" : " · 이번 단계"); }
    return el.closest(".slide") ? "칠판 기타" : "화면 기타"; };
  const res = {};
  const add = (k, cr, need, sample) => { const r = res[k] || (res[k] = { n: 0, min: 99, fail: 0, worst: "", need: need }); r.n++; if (cr < r.min) { r.min = Math.round(cr * 100) / 100; r.worst = sample; r.need = need; } if (cr < need) r.fail++; };
  const visible = el => { if (!el.getClientRects().length) return false; const cs = getComputedStyle(el); return cs.visibility !== "hidden"; };
  const scan = state => { STATE = state || "";
    const seen = new Set(), tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: t => /\S/.test(t.nodeValue) ? 1 : 2 });
    for (let t = tw.nextNode(); t; t = tw.nextNode()) { const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
      if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TITLE)$/.test(el.tagName)) continue; if (el.closest("svg") && !el.closest(".katex")) continue; if (el.closest("#tutorCard")) continue; if (el.closest("[hidden]")) continue;
      if (!visible(el)) continue; const cs = getComputedStyle(el); const op = opOf(el); if (op < .05) continue;
      const bg = bgOf(el); let fg = parse(cs.color); if (!fg) continue; fg = over(Object.assign({}, fg, { a: fg.a * op }), bg);
      const fs = parseFloat(cs.fontSize), fw = parseFloat(cs.fontWeight) || 400, large = fs >= 24 || (fs >= 18.66 && fw >= 700);
      add(cat(el), ratio(fg, bg), large ? 3 : 4.5, (el.textContent || "").trim().slice(0, 22) + " · " + cs.color + " · " + fs + "px"); }
    /* 가상 요소 글자: 번호 원(attr(data-n)) · 식 번호(counter) · ★ → ! ✓ 기호 */
    document.querySelectorAll(".slide *, #ctl *, #ov *, #figov *, #hud *").forEach(el => { if (el.closest("#tutorCard") || el.closest("[hidden]") || !el.getClientRects().length) return; if (el.closest("svg") && !el.closest(".katex")) return;
      ["::before", "::after"].forEach(ps => { const cs = getComputedStyle(el, ps), ct = cs.content; if (!ct || ct === "none" || ct === "normal" || ct === '""' || cs.display === "none" || cs.visibility === "hidden") return;
        const isText = /attr\(|counter\(|[0-9A-Za-z가-힣]/.test(ct), op = opOf(el) * (isNaN(parseFloat(cs.opacity)) ? 1 : parseFloat(cs.opacity)); if (op < .05) return;
        let bg = bgOf(el); const pb = parse(cs.backgroundColor); if (pb && pb.a > 0) bg = over(pb, bg);
        let fg = parse(cs.color); if (!fg) return; fg = over(Object.assign({}, fg, { a: fg.a * op }), bg);
        const fs = parseFloat(cs.fontSize), fw = parseFloat(cs.fontWeight) || 400, large = fs >= 24 || (fs >= 18.66 && fw >= 700);
        add((isText ? "가상 글자 " : "가상 기호 ") + cat(el) + ps, ratio(fg, bg), isText ? (large ? 3 : 4.5) : 3, ct.slice(0, 30) + " · " + cs.color + " · op " + Math.round(op * 100) / 100); }); });
    document.querySelectorAll(".bd-fig figure>svg text, #figov .fz figure>svg text").forEach(t => { if (!t.getClientRects().length || t.closest("[hidden]")) return; const cs = getComputedStyle(t); let fg = parse(cs.fill); if (!fg) return;
      const bg = bgOf(t.closest("figure")); fg = over(Object.assign({}, fg, { a: fg.a * opOf(t) }), bg); const m = t.getScreenCTM(), px = (parseFloat(cs.fontSize) || 14) * (m ? Math.hypot(m.a, m.b) : 1);
      add(t.closest("#figov") ? "그림 글자 · 확대창" : "그림 글자", ratio(fg, bg), px >= 24 ? 3 : 4.5, (t.textContent || "").trim().slice(0, 18) + " · " + cs.fill); });
  };
  const states = [];
  X.S.mode = "intro"; X.render(); scan("목차"); states.push("목차");
  D.chapters.forEach((c, ci) => c.steps.forEach((s, si) => { X.S.mode = "step"; X.S.ci = ci; X.S.si = si; X.S.resume = false; X.S.again = 0; X.render(); scan(""); }));
  states.push("단계 " + D.chapters.reduce((a, c) => a + c.steps.length, 0));
  /* 그림 확대창: 「크게 보기」가 보이는 첫 그림 단계 */
  outer: for (let ci = 0; ci < D.chapters.length; ci++) { const c = D.chapters[ci]; for (let si = 0; si < c.steps.length; si++) { if (!c.steps[si].fig) continue;
    X.S.mode = "step"; X.S.ci = ci; X.S.si = si; X.render(); const z = document.querySelector("#bc [data-zoom]"); if (z && getComputedStyle(z).display !== "none") { z.click(); scan("확대창"); const x = document.getElementById("figovX"); if (x) x.click(); states.push("확대창"); break outer; } } }
  { const b = document.getElementById("hToc"); if (b) { b.click(); scan("목차 창"); const c = document.getElementById("ovClose"); if (c) c.click(); states.push("목차 창"); } }
  /* 확인 문제 상태: 미응답 · 보기(정답 공개·오답 공개) · 답칸(채점 전·맞음·틀림) */
  const Q = D.quiz || []; const ST = X.ST; ST.done = ST.done || {}; ST.answer = ST.answer || {}; ST.correct = ST.correct || {};
  Q.forEach((q, qi) => { const mc = Array.isArray(q.choices) && q.choices.length;
    const st = (d, a, c) => { if (d) ST.done[q.id] = true; else delete ST.done[q.id]; if (a === undefined) delete ST.answer[q.id]; else ST.answer[q.id] = a; if (c === undefined) delete ST.correct[q.id]; else ST.correct[q.id] = c; X.T.hearts = 3; X.S.mode = "quiz"; X.S.qi = qi; X.render(); };
    st(false); scan("미응답");
    if (mc) { const ok = q.choices.findIndex(x => x.ok), bad = q.choices.findIndex(x => !x.ok); st(true, String(ok), true); scan("보기 정답 공개"); if (bad >= 0) { st(true, String(bad), false); scan("보기 오답 공개"); } }
    else { st(true, "x", undefined); scan("답칸 채점 전"); st(true, "x", true); scan("답칸 맞음"); st(true, "x", false); scan("답칸 틀림"); } });
  states.push("문제 " + Q.length + "개 × 상태");
  /* 결과 4상태 + 하트 0 */
  ["ung", "partial", "wrong", "right"].forEach(s => { Q.forEach((q, i) => { ST.done[q.id] = true; if (s === "ung") delete ST.correct[q.id]; else if (s === "partial") { if (i < Math.ceil(Q.length / 2)) ST.correct[q.id] = (i % 2 === 0); else delete ST.correct[q.id]; } else ST.correct[q.id] = (s === "right"); });
    X.S.mode = "result"; X.render(); scan({ ung: "미채점", partial: "일부 채점", wrong: "전부 오답", right: "전부 정답" }[s]); });
  states.push("결과 4");
  X.T.hearts = 0; X.S.mode = "nohearts"; X.render(); scan("하트 0"); X.T.hearts = 3; states.push("하트 0");
  res.__states = { n: 0, min: 99, fail: 0, worst: states.join(" · "), need: 0 };
  return res;
}
async function pagePhone() {   /* 단계마다 글꼴 로드·두 프레임 뒤에 잰다 — KaTeX 글꼴이 늦게 붙으면 스크롤 고정(anchoring)이 위치를 옮기고 스크롤 이벤트가 한 프레임 뒤에 위 판서 버튼을 맞춘다 */
  const X = window.__cr, D = X.D, out = []; X.reduce = true; X.cancelAll();
  const vh = innerHeight, vw = innerWidth, settle = () => document.fonts.ready.then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const flat = []; D.chapters.forEach((c, ci) => c.steps.forEach((s, si) => flat.push([c, ci, s, si])));
  for (const [c, ci, s, si] of flat) {
    X.S.mode = "step"; X.S.ci = ci; X.S.si = si; X.S.resume = false; X.S.again = 0; X.render(); window.scrollTo(0, 0); await settle();
    const w = document.getElementById("bwrap"), wr = w.getBoundingClientRect(), btns = [...document.querySelectorAll("#dCh .cbt")];
    const inView = b => { const r = b.getBoundingClientRect(); return r.top >= -.5 && r.bottom <= vh + .5 && r.left >= -.5 && r.right <= vw + .5; };
    const first = document.querySelector("#bc .bl.cur"), fr = first && first.getBoundingClientRect();
    const curF = [...document.querySelectorAll("#bc .bl.cur.k-f")];
    const endEl = document.querySelector("#bc .bd-fig") || [...document.querySelectorAll("#bc .bl.cur")].pop(), er = endEl && endEl.getBoundingClientRect();
    const endOk = !first || !er || (er.bottom - fr.top) > wr.height - 4 || er.bottom <= wr.bottom + 1;   /* 이번 단계 전체가 창에 들어갈 수 있으면 끝까지 보여야 */
    const up = document.getElementById("upHint"), upVis = !!up && !up.hidden && getComputedStyle(up).display !== "none";
    const fig = document.querySelector("#bc .bd-fig"), texts = fig ? [...fig.querySelectorAll("figure>svg text")] : [];
    const minfp = texts.length ? Math.min(...texts.map(t => { const m = t.getScreenCTM(), z = parseFloat(getComputedStyle(t).fontSize) || 14; return m && z >= 6 ? z * Math.hypot(m.a, m.b) : 99; })) : 0;
    const dt = document.getElementById("dText"), lh = parseFloat(getComputedStyle(dt).lineHeight), over = dt.scrollHeight > dt.clientHeight + 3, tm = document.getElementById("tMore"), tmVis = !!tm && !tm.hidden && getComputedStyle(tm).display !== "none";
    out.push({ id: s.id, fig: s.fig || null,
      ctlOk: btns.length > 0 && btns.every(inView), kbd: [...document.querySelectorAll("#dCh kbd")].filter(k => getComputedStyle(k).display !== "none").length,
      firstOk: !first || (fr.top >= wr.top - 1 && fr.top < wr.bottom), endOk: endOk, curF: curF.length, fOk: curF.filter(f => { const r = f.getBoundingClientRect(); return r.top >= wr.top - 1 && r.bottom <= wr.bottom + 1; }).length,
      upOk: upVis === (w.scrollTop > 12), upInHead: !!up && !!up.closest("#chk"), upVis: upVis,
      pn: fig ? +(fig.dataset.pn || 1) : 0, minfp: Math.round(minfp * 10) / 10, zoomVis: !!fig && [...fig.querySelectorAll(".fh .zoom")].some(z => getComputedStyle(z).display !== "none"),
      figOverX: !!fig && [...fig.querySelectorAll("figure>svg")].some(v => { const r = v.getBoundingClientRect(); return r.right > wr.right + 1 || r.left < wr.left - 1; }),
      hits: (() => { const hit = b => { const r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let lo = 0, hi = 0; for (let d = 0; d < 40; d++) { const e = document.elementFromPoint(cx, cy - d); if (e && (e === b || b.contains(e))) lo = d; else break; } for (let d = 0; d < 40; d++) { const e = document.elementFromPoint(cx, cy + d); if (e && (e === b || b.contains(e))) hi = d; else break; } return lo + hi + 1; };
        const o = {}; [...document.querySelectorAll("button")].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !b.closest("[hidden]") && r.top >= 0 && r.bottom <= vh && getComputedStyle(b).visibility !== "hidden"; }).forEach(b => { const k = b.id || (b.className || "").toString().split(" ")[0] || "button"; const h = hit(b); if (!(k in o) || h < o[k]) o[k] = h; }); return o; })(),
      kover: [...document.querySelectorAll("#bc .katex-display")].filter(k => k.scrollWidth > k.clientWidth + 1).length, kmin: Math.min(1, ...[...document.querySelectorAll("#bc .katex-display")].map(k => parseFloat(k.style.fontSize) || 1)),
      subLines: Math.round(dt.clientHeight / lh * 10) / 10, subOver: over, tmOk: over === tmVis, hOver: document.scrollingElement.scrollWidth > vw + 1, bwrapH: Math.round(wr.height) });
  }
  return out;
}
async function pageSmall() {
  const X = window.__cr, D = X.D, bad = []; let n = 0, nOpen = 0; X.reduce = true; X.cancelAll();
  const vh = innerHeight, vw = innerWidth, settle = () => document.fonts.ready.then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const endOk = () => { const w = document.getElementById("bwrap"), wr = w.getBoundingClientRect(), first = document.querySelector("#bc .bl.cur"); if (!first) return true;
    const endEl = document.querySelector("#bc .bd-fig") || [...document.querySelectorAll("#bc .bl.cur")].pop(), er = endEl.getBoundingClientRect(), fr = first.getBoundingClientRect();
    return (er.bottom - fr.top) > wr.height - 4 || (er.bottom <= wr.bottom + 1 && fr.top >= wr.top - 1); };
  const ok = () => [...document.querySelectorAll("#dCh .cbt")].every(b => { const r = b.getBoundingClientRect(); return r.top >= -.5 && r.bottom <= vh + .5 && r.left >= -.5 && r.right <= vw + .5; });
  const flat = []; D.chapters.forEach((c, ci) => c.steps.forEach((s, si) => flat.push([ci, s, si])));
  for (const [ci, s, si] of flat) {
    X.S.mode = "step"; X.S.ci = ci; X.S.si = si; X.S.resume = false; X.S.again = 0; X.render(); window.scrollTo(0, 0); await settle(); n++;
    if (!ok()) bad.push(s.id + " 조작 버튼 화면 밖"); if (document.scrollingElement.scrollWidth > vw + 1) bad.push(s.id + " 가로 넘침"); if (!endOk()) bad.push(s.id + " 이번 단계 끝이 창 밖");
    const tm = document.getElementById("tMore"); if (tm && !tm.hidden) { tm.click(); nOpen++; if (!ok()) bad.push(s.id + " 자막 펼치면 조작 버튼 화면 밖"); tm.click(); }
  }
  return { steps: n, opened: nOpen, bad: bad };
}

/* 확대창 입력 검사(오타 디자인 2차 새 문제): 대사 끝난 그림 단계 → 「크게 보기」 → 실제 키 Enter·Space(DevTools 입력) → 교실 위치·저장 그대로 · 확대창 그대로 → Esc → 닫힘 · 저장 그대로 · 포커스가 「크게 보기」로 */
async function keyTest(P) {
  const at = await P.call(function () { const X = window.__cr, D = X.D; X.reduce = true; X.cancelAll();
    for (let ci = 0; ci < D.chapters.length; ci++) { const c = D.chapters[ci]; for (let si = 0; si < c.steps.length; si++) { if (!c.steps[si].fig) continue;
      X.S.mode = "step"; X.S.ci = ci; X.S.si = si; X.S.resume = false; X.S.again = 0; X.render(); const z = document.querySelector("#bc [data-zoom]"); if (z && getComputedStyle(z).display !== "none") return [ci, si]; } } return null; });
  if (!at) return { skipped: true };
  const snap = `JSON.stringify({ci:__cr.S.ci,si:__cr.S.si,mode:__cr.S.mode,typing:__cr.typing,ls:Object.keys(localStorage).sort().map(k=>k+"="+localStorage.getItem(k)).join("|")})`;
  const key = async (k, code, vk, text) => { await P.s("Input.dispatchKeyEvent", { type: "keyDown", key: k, code: code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, text: text || undefined, unmodifiedText: text || undefined });
    await P.s("Input.dispatchKeyEvent", { type: "keyUp", key: k, code: code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }); await P.eval("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))"); };
  const before = await P.eval(snap);
  await P.eval(`document.querySelector("#bc [data-zoom]").focus(); document.querySelector("#bc [data-zoom]").click()`);
  const open1 = await P.eval(`!document.getElementById("figov").hidden`), focusClose = await P.eval(`document.activeElement&&document.activeElement.id`);
  await key("Enter", "Enter", 13, "\r"); await key(" ", "Space", 32, " ");
  const open2 = await P.eval(`!document.getElementById("figov").hidden`), mid = await P.eval(snap);
  await key("Escape", "Escape", 27);
  const open3 = await P.eval(`!document.getElementById("figov").hidden`), after = await P.eval(snap);
  const focusBack = await P.eval(`!!(document.activeElement&&document.activeElement.matches("[data-zoom]"))`);
  return { at, open1, focusClose, stillOpenAfterEnterSpace: open2, sameWhileOpen: mid === before, closedByEsc: !open3, sameAfterClose: after === before, focusBack };
}
/* 앱 행동 버튼(오타 디자인 2차 R7): 오늘·학습 로비·과목 — 수업 따라가기 「교실 열기」·「교재」, 과목 행동 줄, 로비 미션 버튼의 실제 상자 높이(= 누르는 자리) */
async function appButtons(B) {
  const SC = path.join(ROOT, "_shot.html"); if (!fs.existsSync(SC)) return { skipped: "_shot.html 없음" };
  const out = [];
  for (const dev of [{ w: 1040, h: 918, name: "1040" }, { w: 390, h: 844, dpr: 2, mobile: true, touch: true, name: "390" }]) {
    for (const [v, q, sel] of [["오늘", "?v=today", "#v-today.on, .view.on"], ["학습", "?v=study", "#v56Hero .ow-hero"], ["과목", "?v=course&cn=" + encodeURIComponent("일반물리학2"), ".v55-title"]]) {
      const P = await newPage(B, dev);
      try {
        await P.goto(url.pathToFileURL(SC).href + q);
        await P.eval(`new Promise(r=>{ let n=0; (function w(){ if(document.querySelector(${JSON.stringify(sel)})||n++>120) setTimeout(()=>r(true),1200); else setTimeout(w,100); })(); })`);
        const r = await P.eval(`(()=>{ const vis=b=>{ const rc=b.getBoundingClientRect(); return rc.width>0&&rc.height>0&&getComputedStyle(b).visibility!=="hidden"&&!b.closest("[hidden]")&&b.closest(".view.on"); };
          /* 실제 누르는 높이: 버튼 가운데 세로줄을 1px 씩 elementFromPoint — 버튼(또는 그 안)이 잡히는 연속 구간 */
          const hit=b=>{ b.scrollIntoView({block:"center"}); const r=b.getBoundingClientRect(), cx=r.left+Math.min(r.width/2,Math.max(2,r.width-2)), cy=r.top+r.height/2; let lo=0, hi=0;
            for(let d=0; d<40; d++){ const e=document.elementFromPoint(cx,cy-d); if(e&&(e===b||b.contains(e))) lo=d; else break; } for(let d=0; d<40; d++){ const e=document.elementFromPoint(cx,cy+d); if(e&&(e===b||b.contains(e))) hi=d; else break; } return lo+hi+1; };
          const groups={ "수업 따라가기 행":"button.btn[data-v50open]", "과목 행동 줄":".v55-act .btn", "로비 미션":".ow-cta" }; const g={};
          Object.entries(groups).forEach(([k,s])=>{ const bs=[...document.querySelectorAll(s)].filter(vis); if(!bs.length) return; const hs=bs.map(b=>Math.round(b.getBoundingClientRect().height)), ht=bs.map(hit); g[k]={n:bs.length,min:Math.min(...hs),max:Math.max(...hs),hitMin:Math.min(...ht)}; });
          const all=[...document.querySelectorAll(".view.on button")].filter(vis); const lowHit=all.map(b=>[b,hit(b)]).filter(([b,h])=>h<44).map(([b,h])=>(b.textContent||"").trim().replace(/\\s+/g," ").slice(0,12)+" "+h);
          const small=all.filter(b=>b.getBoundingClientRect().height<44).length;
          window.scrollTo(0,0); return { groups:g, buttons:all.length, smallBox:small, lowHit:lowHit.slice(0,12), lowHitN:lowHit.length, hOver: document.scrollingElement.scrollWidth>innerWidth+1 }; })()`);
        out.push(Object.assign({ view: v, w: dev.name }, r));
      } catch (e) { out.push({ view: v, w: dev.name, error: String(e.message).slice(0, 120) }); }
      finally { await P.close(); }
    }
  }
  return out;
}

/* ---------- 실행 ---------- */
async function auditFile(B, rel, only) {
  const abs = path.isAbsolute(rel) ? rel : path.join(ROOT, rel), u = url.pathToFileURL(abs).href;
  const R = { file: rel };
  if (only.has("contrast") || only.has("fonts")) {
    const P = await newPage(B, { w: 1040, h: 918 }); await P.goto(u); await P.eval(READY);
    if (only.has("contrast")) R.contrast = await P.call(pageContrast);
    if (only.has("fonts")) {
      const pick = async (label, sel) => { const f = await P.fonts(sel).catch(() => null); return { label, sel, fonts: f && f.length ? f.map(x => x.familyName + (x.isCustomFont ? "" : "(시스템)") + " " + x.glyphCount).join(", ") : "(없음)" }; };
      const F = [];
      await P.eval(`(()=>{ const X=__cr; X.reduce=true; X.cancelAll(); const c=X.D.chapters[0]; X.S.mode="step"; X.S.ci=0; X.S.si=c.steps.length-1; X.render(); })()`);
      F.push(await pick("머리글 제목", "#chk > span")); F.push(await pick("판서 번호 줄", "#bc .bl.k-li .bt")); F.push(await pick("판서 소제목", "#bc .bl.k-h .bt"));
      await P.eval(`(()=>{ const X=__cr; const k=X.D.chapters.findIndex(c=>c.steps.some(s=>s.fig)); if(k<0) return; const si=X.D.chapters[k].steps.findIndex(s=>s.fig); X.S.mode="step"; X.S.ci=k; X.S.si=si; X.render(); })()`);
      F.push(await pick("그림 캡션", "#bc .bd-fig figcaption")); F.push(await pick("자막", "#dText")); F.push(await pick("자막 이름", "#dNameTag")); F.push(await pick("조작 버튼", "#dCh .cbt"));
      await P.eval(`(()=>{ document.getElementById("hToc").click(); return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))); })()`); F.push(await pick("목차 항목", "#ov li button span:nth-child(2)")); await P.eval(`(()=>{ const c=document.getElementById("ovClose"); if(c) c.click(); })()`);
      await P.eval(`(()=>{ const X=__cr; X.T.hearts=3; const k=Math.max(0,X.D.quiz.findIndex(q=>q.choices&&q.choices.length)); X.S.mode="quiz"; X.S.qi=k; X.render(); })()`);
      F.push(await pick("문제 번호", "#bc .qz .qn")); F.push(await pick("문제 본문", "#bc .qz .qb")); F.push(await pick("문제 보기·답칸", "#bc .qz .cb span:last-child, #bc .qz textarea"));
      await P.eval(`(()=>{ const X=__cr; X.S.mode="result"; X.render(); })()`); F.push(await pick("결과 제목", "#bc .res .big")); F.push(await pick("결과 수치 이름", "#bc .res .stats span"));
      R.fonts = F;
    }
    await P.close();
  }
  if (only.has("keys")) { const P = await newPage(B, { w: 1040, h: 918 }); await P.goto(u); await P.eval(READY); R.keys = await keyTest(P); await P.close(); }
  if (only.has("phone")) { const P = await newPage(B, { w: 390, h: 844, dpr: 2, mobile: true, touch: true }); await P.goto(u); await P.eval(READY); R.phone = await P.call(pagePhone); await P.close(); }
  if (only.has("small")) { R.small = {};
    for (const [w, h] of [[360, 640], [300, 649]]) { const P = await newPage(B, { w, h, dpr: 2, mobile: true, touch: true }); await P.goto(u); await P.eval(READY); R.small[w + "x" + h] = await P.call(pageSmall); await P.close(); } }
  return R;
}
function report(R) {
  const issues = [], info = [];
  if (R.contrast) Object.entries(R.contrast).forEach(([k, v]) => { if (k === "__states") return; if (v.fail) issues.push(`대비 ${k} ${v.fail}/${v.n} 기준 미달(최저 ${v.min} < ${v.need}: ${v.worst})`); });
  if (R.contrast && R.contrast.__states) info.push("대비 상태: " + R.contrast.__states.worst);
  if (R.keys && !R.keys.skipped) { const k = R.keys; if (!(k.open1 && k.focusClose === "figovX" && k.stillOpenAfterEnterSpace && k.sameWhileOpen && k.closedByEsc && k.sameAfterClose && k.focusBack)) issues.push("확대창 입력 " + JSON.stringify(k)); else info.push("확대창 입력: 열림 → 포커스 닫기 버튼 → Enter·Space 뒤에도 열림·교실 위치·저장 그대로 → Esc 닫힘 → 저장 그대로 · 포커스 「크게 보기」로(" + k.at.join(".") + ")"); }
  if (R.phone) { const ph = R.phone, f = (key, msg) => { const b = ph.filter(x => !x[key]); if (b.length) issues.push(`폰 ${msg} ${b.length}단계: ${b.slice(0, 6).map(x => x.id).join(" · ")}`); };
    f("ctlOk", "조작 버튼 화면 밖"); f("firstOk", "이번 단계 첫 줄 안 보임"); f("endOk", "이번 단계 끝이 창 밖(한 화면에 들어가는데)"); f("upOk", "위 판서 버튼 ≠ 스크롤"); f("upInHead", "위 판서 버튼 머리글 밖"); f("tmOk", "자막 넘침 ≠ 전체 보기");
    const kb = ph.filter(x => x.kbd); if (kb.length) issues.push(`폰 Enter 안내 보임 ${kb.length}단계`);
    const ho = ph.filter(x => x.hOver); if (ho.length) issues.push(`폰 가로 넘침 ${ho.length}단계`);
    const fo = ph.filter(x => x.figOverX); if (fo.length) issues.push(`폰 그림이 판서 창 밖 ${fo.length}단계: ${fo.slice(0, 6).map(x => x.id).join(" · ")}`);
    const hmin = {}; ph.forEach(x => Object.entries(x.hits || {}).forEach(([k, h]) => { if (!(k in hmin) || h < hmin[k]) hmin[k] = h; })); const hlow = Object.entries(hmin).filter(([k, h]) => h < 44);
    if (hlow.length) issues.push("폰 교실 버튼 누르는 높이 44px 미만: " + hlow.map(([k, h]) => k + " " + h).join(" · ")); else info.push("폰 교실 버튼 누르는 높이(최소): " + Object.entries(hmin).map(([k, h]) => k + " " + h).join(" · "));
    const ko = ph.filter(x => x.kover); if (ko.length) issues.push(`폰 식 가로 넘침(75% 로 줄여도) ${ko.length}단계: ${ko.slice(0, 8).map(x => x.id).join(" · ")}`);
    const ks = ph.filter(x => x.kmin < 1); if (ks.length) info.push(`폰 식 줄여 맞춤 ${ks.length}단계(최소 ${Math.min(...ks.map(x => x.kmin))}배)`);
    const sl = ph.filter(x => x.subLines > 4.2); if (sl.length) issues.push(`폰 자막 네 줄 넘음 ${sl.length}단계`);
    const figs = {}; ph.filter(x => x.fig).forEach(x => { figs[x.fig] = x; });
    const fl = Object.values(figs); const sm = fl.filter(x => x.minfp < 12), sz = fl.filter(x => x.minfp < 14 && !x.zoomVis);
    if (sz.length) issues.push(`폰 그림 글자 14px 미만인데 크게 보기 없음: ${sz.map(x => x.fig + "(" + x.minfp + ")").join(" · ")}`);
    const curFtot = ph.reduce((a, x) => a + x.curF, 0), curFok = ph.reduce((a, x) => a + x.fOk, 0);
    info.push(`폰 390: 단계 ${ph.length} · 이번 단계 식 ${curFok}/${curFtot} 한 화면 · 그림 ${fl.length}개(칸 쌓음 ${fl.filter(x => x.pn > 1).length}, 글자 ≥14px ${fl.filter(x => x.minfp >= 14).length}, 12~14px ${fl.filter(x => x.minfp >= 12 && x.minfp < 14).length}, <12px ${sm.length} → 크게 보기) · 판서 창 높이 ${Math.min(...ph.map(x => x.bwrapH))}~${Math.max(...ph.map(x => x.bwrapH))}px`); }
  if (R.small) Object.entries(R.small).forEach(([k, v]) => { if (v.bad.length) issues.push(`작은 화면 ${k}: ${v.bad.length}건 ${v.bad.slice(0, 5).join(" · ")}`); else info.push(`작은 화면 ${k}: 단계 ${v.steps} · 자막 펼침 ${v.opened} · 조작 버튼 늘 화면 안 · 가로 넘침 0`); });
  if (R.contrast) info.push("대비 최저: " + Object.entries(R.contrast).filter(([k]) => k !== "__states").sort((a, b) => a[1].min - b[1].min).slice(0, 6).map(([k, v]) => k + " " + v.min).join(" · "));
  if (R.fonts) info.push("글꼴: " + R.fonts.map(x => x.label + "=" + x.fonts.replace(/ \d+/g, "")).join(" | "));
  return { issues, info };
}
async function main() {
  const args = process.argv.slice(2), files = args.filter(a => !a.startsWith("--")).map(f => f.replace(/\\/g, "/"));
  const only = new Set(((args.find(a => a.startsWith("--only=")) || "--only=contrast,keys,phone,small,fonts").slice(7)).split(","));
  if (args.includes("--app")) { const B0 = await launch(); let bad = 0; try { const A = await appButtons(B0); (Array.isArray(A) ? A : [A]).forEach(x => { const gs = x.groups ? Object.entries(x.groups).map(([k, g]) => k + " " + g.n + "개 상자 " + g.min + "~" + g.max + "px · 누르는 높이 " + g.hitMin + "px 이상").join(" · ") : ""; const low = x.groups ? Object.entries(x.groups).filter(([k, g]) => g.min < 44) : [];
      bad += low.length + (x.lowHitN || 0) + (x.hOver ? 1 : 0) + (x.error ? 1 : 0); console.log((low.length || x.lowHitN || x.hOver || x.error ? "ISSUES " : "ok     ") + x.view + " @" + x.w + " · " + (gs || x.error || x.skipped || "") + " · 버튼 " + (x.buttons || 0) + "개 중 누르는 높이 44px 미만 " + (x.lowHitN || 0) + "개(상자만 작은 것 " + (x.smallBox || 0) + "개)" + (x.hOver ? " · 가로 넘침" : "") + (x.lowHit && x.lowHit.length ? "\n    - 44px 미만: " + x.lowHit.join(" | ") : "")); }); } finally { await B0.close(); } if (!files.length) process.exit(bad ? 1 : 0); }
  if (!files.length) { console.log("파일을 주세요: notes/classroom/<slug>/<date>.html"); process.exit(2); }
  fs.mkdirSync(OUTDIR, { recursive: true });
  const B = await launch(); let total = 0;
  try {
    for (const rel of files) {
      let R; try { R = await auditFile(B, rel, only); } catch (e) { console.log("FAIL   " + rel + " " + String(e.message).slice(0, 160)); total++; continue; }
      fs.writeFileSync(path.join(OUTDIR, "design_" + rel.replace(/^notes\/classroom\//, "").replace(/[\/.]/g, "_") + ".json"), JSON.stringify(R, null, 1), "utf8");
      const { issues, info } = report(R);
      console.log((issues.length ? "ISSUES " : "ok     ") + rel.replace("notes/classroom/", "") + (issues.length ? "  issues " + issues.length : ""));
      info.forEach(i => console.log("    · " + i)); issues.forEach(i => console.log("    - " + i)); total += issues.length;
    }
  } finally { await B.close(); }
  console.log("\n총 문제 " + total); process.exit(total ? 1 : 0);
}
if (require.main === module) main();
module.exports = { launch, newPage, READY };
