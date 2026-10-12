// 암기카드 게이트 검사 (정역학 · 최종본.md §20 설계 v3)
// 실행: study-console 루트에서  NODE_PATH="C:/Users/user/.claude/scratch/sc_test/node_modules" node docs/tools/classroom_gate_check.cjs
const { JSDOM, VirtualConsole } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function open(file, hash) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  const vc = new VirtualConsole(); const errs = [];
  vc.on("jsdomError", e => errs.push(String(e && e.message || e).split("\n")[0]));
  const dom = new JSDOM(html, {
    runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc,
    url: "http://localhost/study/" + file + (hash || ""),
    beforeParse(w) { w.renderMathInElement = () => {}; w.confirm = () => true; w.HTMLElement.prototype.scrollIntoView = function () {}; }
  });
  await sleep(250);
  return { w: dom.window, doc: dom.window.document, errs };
}
const gateOn = d => d.querySelector("#gate").classList.contains("on");
const btn = (d, t) => [...d.querySelectorAll("#gRow button")].find(b => b.textContent === t);
const key = (d, k) => d.dispatchEvent(new d.defaultView.KeyboardEvent("keydown", { key: k, bubbles: true }));
let fail = 0; const out = [];
const ok = (cond, msg) => { out.push((cond ? "ok   " : "FAIL ") + msg); if (!cond) fail++; };

(async () => {
  // 1) 9/16 (2강, 게이트 적용): 열림·Enter 차단·Esc 닫기 후 상태 불변
  let r = await open("notes/classroom/statics/2026-09-16.html", "#ch=1");
  let X = r.w.__cr, d = r.doc;
  ok(gateOn(d), "9/16 #ch=1 열 때 게이트가 열린다");
  ok(X.S.mode === "intro", "게이트 중에는 S.mode 가 intro 그대로");
  ok(X.L.pos === null || X.L.pos === undefined, "게이트 중에는 L.pos 를 바꾸지 않는다");
  ok(d.querySelector("#gBody").textContent.includes("sin30"), "첫 카드는 공통 카드(sin30°)");
  key(d, "Enter");
  ok(gateOn(d) && X.S.mode === "intro", "Enter 는 게이트를 통과시키지 않는다");
  key(d, "Escape");
  // (추가) 게이트를 연 뒤 포커스된 보기·몰라요 버튼에서 Enter·Space 를 눌러도 판정되지 않는다
  X.boot();
  ok(d.querySelectorAll("#gBody .gopt").length === 4 && !!d.querySelector("#gBody .gunk"), "보기 4개 + 몰라요 버튼");
  for (const k of ["Enter", " "]) for (const sel of ["#gBody .gopt", "#gBody .gunk"]) {
    const t = d.querySelector(sel); t.focus();
    t.dispatchEvent(new d.defaultView.KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
  }
  ok(gateOn(d) && X.S.mode === "intro" && !d.querySelector("#gBody .gres") && d.querySelector("#gProg").textContent.startsWith("1 / " + X.D.gate.cards.length), "포커스된 보기·몰라요에서 Enter·Space 로 판정 안 됨");
  {
    const bs = [...d.querySelectorAll("#gate button")]; bs[bs.length - 1].focus();
    const t = new d.defaultView.KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }); bs[bs.length - 1].dispatchEvent(t);
    ok(t.defaultPrevented && d.activeElement === bs[0], "Tab 은 팝업 안에서 돈다 (마지막 → 첫 버튼)");
    X.boot(); ok(d.querySelectorAll("#gate.on").length === 1 && d.querySelector("#gProg").textContent.startsWith("1 / "), "열려 있는 동안 다시 열어도 처음 상태 유지(재진입 무시)");
  }
  key(d, "Escape");
  ok(!gateOn(d) && X.S.mode === "intro", "Esc 는 게이트만 닫고 시작하지 않는다");
  ok(X.L.pos === null || X.L.pos === undefined, "닫기 뒤에도 L.pos 불변");

  // 2) 다시 열고 1번째 카드를 몰라요 → 그 카드만 외우기 → 다시 객관식 → 끝 화면(써서 확인 없음) → 수업 열기
  X.boot();
  ok(gateOn(d), "다시 열면 게이트가 다시 열린다(열 때마다)");
  const total = X.D.gate.cards.length;
  const cardOf = () => X.D.gate.cards.find(c => (c.mc.q || c.q) === d.querySelector("#gBody .gq").textContent);
  const pickRight = () => { const c = cardOf(); [...d.querySelectorAll("#gBody .gopt")].find(b => b.textContent.startsWith(c.mc.right)).click(); };
  const gbtn = t => btn(d, t);
  for (let i = 0; i < total; i++) {
    if (i === 0) d.querySelector("#gBody .gunk").click(); else pickRight();
    gbtn("다음").click();
  }
  ok(d.querySelector("#gTitle").textContent === "외우기" && d.querySelector("#gProg").textContent === "1 / 1", "몰라요 낸 1장만 외우기 화면");
  ok(d.querySelector("#gBody").textContent.includes("요령"), "외우기: 기억 요령이 보인다");
  gbtn("다시 풀기").click();
  ok(d.querySelector("#gProg").textContent.startsWith("1 / 1"), "그 1장만 다시 객관식");
  pickRight(); gbtn("다음").click();
  ok(d.querySelector("#gTitle").textContent !== "써서 확인", "다시 맞힌 뒤 「써서 확인」 단계가 없다 (대표님 10/12)");
  ok(gateOn(d) && d.querySelector("#gBody").textContent.includes("모르던 카드 1개 · 다시 맞힘"), "끝 화면: 모르던 카드 1개 · 다시 맞힘 (아직 안 열림)");
  ok(X.S.mode === "intro", "끝 화면에서도 S 불변");
  gbtn("수업 열기").click();
  ok(!gateOn(d), "수업 열기를 누르면 게이트가 닫힌다");
  ok(X.S.mode === "step" && X.S.ci === 0, "통과 뒤 목적지(1강)로 한 번 진입");
  ok(Array.isArray(X.L.gateLog) && X.L.gateLog.length === 1, "통과 이력이 L.gateLog 에 1건");
  ok(r.errs.length === 0, "페이지 오류 0 (" + r.errs.join(" | ") + ")");

  // 2b) 첫 판을 전부 맞히면 곧바로 끝 화면 → 수업 열기 (두 번째 과정 없음)
  r = await open("notes/classroom/statics/2026-09-21.html", "#ch=1");
  {
    const X2 = r.w.__cr, d2 = r.doc, tot = X2.D.gate.cards.length;
    for (let i = 0; i < tot; i++) { const c = X2.D.gate.cards.find(c => (c.mc.q || c.q) === d2.querySelector("#gBody .gq").textContent); [...d2.querySelectorAll("#gBody .gopt")].find(b => b.textContent.startsWith(c.mc.right)).click(); btn(d2, "다음").click(); }
    ok(d2.querySelector("#gBody").textContent.includes("처음부터 다 맞혔어요") && !/써서|몰라요|맞았어요 *$/.test(d2.querySelector("#gTitle").textContent), "첫 판 전부 맞히면 바로 끝 화면 (두 번째 과정 없음)");
    ok(!d2.querySelector("#gFoot .gskip"), "끝 화면에는 건너뛰기가 없다(수업 열기만)");
    btn(d2, "수업 열기").click(); ok(X2.S.mode === "step", "수업 열림");
  }

  // 2c) 건너뛰고 수업 열기: 모든 화면에 있고, 확인 없이 열리며, 통과 집계에 섞이지 않고, 다시 묻지 않는다
  r = await open("notes/classroom/statics/2026-09-23.html", "#ch=1");
  {
    const X3 = r.w.__cr, d3 = r.doc;
    const sk = () => d3.querySelector("#gFoot .gskip");
    ok(sk() && sk().textContent === "건너뛰고 수업 열기", "문제 화면에 건너뛰기 버튼");
    d3.querySelector("#gBody .gunk").click(); ok(!!sk(), "답한 뒤 화면에도 있다");
    btn(d3, "다음").click();
    const tot3 = X3.D.gate.cards.length; for (let i = 1; i < tot3; i++) { d3.querySelector("#gBody .gunk") ? d3.querySelector("#gBody .gunk").click() : 0; btn(d3, "다음").click(); }
    ok(d3.querySelector("#gTitle").textContent === "외우기" && !!sk(), "외우기 화면에도 있다");
    sk().click();
    ok(!gateOn(d3) && X3.S.mode === "step", "건너뛰기 한 번에 수업이 열린다(확인 없음)");
    ok(X3.L.gateLog.length === 1 && X3.L.gateLog[0].skip === 1 && X3.L.gateLog[0].r === undefined, "gateLog 에 「건너뜀」으로만 남고 통과 횟수(r)는 없다");
    X3.S.mode = "intro"; X3.boot(); ok(!gateOn(d3), "건너뛴 뒤 이 화면에서는 다시 묻지 않는다");
  }
  r = await open("notes/classroom/statics/2026-09-23.html", "#ch=1");
  key(r.doc, "Escape"); ok(!gateOn(r.doc) && r.w.__cr.S.mode === "intro", "닫기는 건너뛰기와 다르다: 수업 안 열림");

  // 2d) 강(날짜)마다 카드 세트가 다르다: 겹치는 카드 0
  {
    const seen = {};
    const J = JSON.parse(fs.readFileSync(path.join(ROOT, "docs/tools/lessons/cards/statics.json"), "utf8"));
    const want = d => (Object.values(J.lectures).find(l => l.dates.includes(d)).cards.map(c => c.id)).join(" ");
    for (const f of ["2026-09-16", "2026-09-21", "2026-09-23", "2026-09-28", "2026-09-30", "2026-10-07"]) {
      const q = await open("notes/classroom/statics/" + f + ".html", ""); const ids = q.w.__cr.D.gate.cards.map(c => c.id);
      ok(ids.join(" ") === want(f), f + " 교실 페이지 카드 = statics.json(학교 화면과 같은 날짜-카드)"); ok(ids.length > 0 && ids.every(i => !(i in seen)), f + " 카드 " + ids.length + "장 [" + ids.join(" ") + "] 다른 강과 겹침 0"); ids.forEach(i => seen[i] = f);
    }
    ok(Object.keys(seen).length === 37, "6개 강에 카드 37장 전부 배치");
  }

  // 3) 무게이트 날짜: 10/10 은 바로 열린다
  r = await open("notes/classroom/statics/2026-10-10.html", "#ch=1");
  ok(!gateOn(r.doc) && r.w.__cr.S.mode === "step", "10/10(무게이트)은 게이트 없이 바로 열린다");

  // 4) 9/14 는 2장 선수 내용으로 목록에서 숨김, 게이트 없이 열림
  r = await open("notes/classroom/statics/2026-09-14.html", "#ch=1");
  ok(!gateOn(r.doc) && r.w.__cr.S.mode === "step", "9/14(2장 선수, 무게이트)는 게이트 없이 열린다");

  // 5) 확인 문제 진입(#quiz)도 같은 게이트를 거친다
  r = await open("notes/classroom/statics/2026-09-30.html", "#quiz");
  ok(gateOn(r.doc) && r.w.__cr.S.mode === "intro", "9/30 #quiz 도 게이트를 먼저 거친다");

  // 6) 카드 데이터 손상: 카드가 없으면 수업을 열지 않고 오류를 보인다
  r = await open("notes/classroom/statics/2026-09-16.html", "#ch=1");
  key(r.doc, "Escape");
  r.w.__cr.D.gate.cards = [];
  r.w.__cr.boot();
  ok(gateOn(r.doc) && r.doc.querySelector("#gBody").textContent.includes("불러오지 못해"), "카드 0개면 오류 화면, 수업 미진입");
  ok(r.w.__cr.S.mode === "intro", "오류 상태에서도 S 불변");

  // 7) 정역학 교실 페이지 전부: 페이지 오류 0, 게이트 날짜는 카드마다 보기 4개(정답 1) + 엔진이 들어 있다
  const dir = path.join(ROOT, "notes/classroom/statics");
  for (const f of fs.readdirSync(dir).filter(n => /^\d{4}-\d{2}-\d{2}\.html$/.test(n)).sort()) {
    const q = await open("notes/classroom/statics/" + f, "");
    const g = q.w.__cr.D.gate;
    ok(q.errs.length === 0, f + " 페이지 오류 0");
    if (g.state === "gate") ok(g.cards.every(c => c.mc && c.mc.wrong.length === 3 && c.mc.right && c.tip) && typeof q.w.eval("createEngine") === "function", f + " 게이트 카드 " + g.cards.length + "장: 보기 4개·요령, 엔진 포함");
  }

  console.log(out.join("\n"));
  console.log(fail ? "\n실패 " + fail : "\n전부 통과");
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("검사 중단:", e); process.exit(2); });
