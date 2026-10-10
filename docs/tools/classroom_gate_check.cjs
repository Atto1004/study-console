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
  // (추가) 게이트를 연 뒤 포커스된 「맞았어요」에서 Enter 를 눌러도 통과하지 않는다
  X.boot();
  btn(d, "정답 보기").click();
  const judgeBtn = btn(d, "맞았어요"); judgeBtn.focus();
  judgeBtn.dispatchEvent(new d.defaultView.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
  ok(gateOn(d) && X.S.mode === "intro" && d.querySelector("#gProg").textContent.startsWith("1 / " + X.D.gate.cards.length), "포커스된 「맞았어요」에서 Enter 로 통과 안 됨");
  key(d, "Escape");
  ok(!gateOn(d) && X.S.mode === "intro", "Esc 는 게이트만 닫고 시작하지 않는다");
  ok(X.L.pos === null || X.L.pos === undefined, "닫기 뒤에도 L.pos 불변");

  // 2) 다시 열고 1번째 카드를 틀림 → 틀린 카드만 다시 출제 → 맞음 → 통과
  X.boot();
  ok(gateOn(d), "다시 열면 게이트가 다시 열린다(열 때마다)");
  const total = X.D.gate.cards.length;
  for (let i = 0; i < total; i++) {
    btn(d, "정답 보기").click();
    btn(d, i === 0 ? "틀렸어요" : "맞았어요").click();
  }
  ok(d.querySelector("#gBody").textContent.includes("틀린 카드 1개만"), "틀린 1개만 다시 출제");
  btn(d, "다시 보기").click();
  ok(d.querySelector("#gProg").textContent.startsWith("1 / 1"), "다시 출제는 1장");
  btn(d, "정답 보기").click();
  btn(d, "맞았어요").click();
  ok(!gateOn(d), "전부 맞히면 게이트가 닫힌다");
  ok(X.S.mode === "step" && X.S.ci === 0, "통과 뒤 목적지(1강)로 한 번 진입");
  ok(Array.isArray(X.L.gateLog) && X.L.gateLog.length === 1, "통과 이력이 L.gateLog 에 1건");
  ok(r.errs.length === 0, "페이지 오류 0 (" + r.errs.join(" | ") + ")");

  // 3) 무게이트 날짜: 10/10 은 바로 열린다
  r = await open("notes/classroom/statics/2026-10-10.html", "#ch=1");
  ok(!gateOn(r.doc) && r.w.__cr.S.mode === "step", "10/10(무게이트)은 게이트 없이 바로 열린다");

  // 4) 9/14 는 1강(내적·외적 카드 포함)에 연결됨: 게이트 적용, 카드 9장(공통 3 + 1강 6)
  r = await open("notes/classroom/statics/2026-09-14.html", "#ch=1");
  ok(gateOn(r.doc) && r.w.__cr.D.gate.cards.length === 10, "9/14 게이트 적용, 카드 10장 (공통 3 + 1강 7)");
  ok(r.doc.querySelector("#gBody").textContent.includes("sin30"), "9/14 첫 카드는 공통 카드");

  // 5) 확인 문제 진입(#quiz)도 같은 게이트를 거친다
  r = await open("notes/classroom/statics/2026-09-30.html", "#quiz");
  ok(gateOn(r.doc) && r.w.__cr.S.mode === "intro", "9/30 #quiz 도 게이트를 먼저 거친다");

  // 6) 카드 데이터 손상: 카드가 없으면 수업을 열지 않고 오류를 보인다
  r = await open("notes/classroom/statics/2026-09-16.html", "#ch=1");
  r.w.__cr.D.gate.cards = [];
  r.w.__cr.boot();
  ok(gateOn(r.doc) && r.doc.querySelector("#gBody").textContent.includes("불러오지 못해"), "카드 0개면 오류 화면, 수업 미진입");
  ok(r.w.__cr.S.mode === "intro", "오류 상태에서도 S 불변");

  console.log(out.join("\n"));
  console.log(fail ? "\n실패 " + fail : "\n전부 통과");
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("검사 중단:", e); process.exit(2); });
