/* 교실 모드 검사 — notes/classroom/<slug>/<date>.html 전부를 jsdom 으로 열어
   ① 모든 챕터·단계·문제 화면을 실제로 render() 해서 예외 0 · 칠판 내용 비어 있지 않음
   ② v1: 단계에 담긴 글이 원본 섹션 글과 같다(잃어버린 내용 없음 — 원본 텍스트의 모든 30자 조각이 단계 텍스트에 있음)
      v2: 단계가 판서 파일(BOARD)과 id·순서·판서 줄·대사·그림·그림 단계까지 1:1 (오타 설계 회의 2차 조건)
   ③ 문제 답·해설·하트·XP·챕터 완료가 mc-tutor / mc-lesson-<id> 에 저장된다(앱 V52 판정 키와 같음)
   ④ v2 애니메이션: 미래 그림 단계 숨김(동작 줄이기에서도) · Enter 연타 = 즉시 완료 → 다음 한 단계 · 이동 시 예약 작업 0 · 저장은 고정 id + 버전 · 이전 규칙(버전 불일치·id 없음·v1 저장값)
   사용: node docs/tools/classroom_check.cjs [files]  — 문제가 하나라도 있으면 종료 코드 1 (v2 는 python 으로 판서 파일을 읽는다) */
const fs = require("fs"), path = require("path"), cp = require("child_process");
const { JSDOM, VirtualConsole } = require("jsdom");
const ROOT = path.resolve(__dirname, "..", "..");
const SM = path.join(path.dirname(ROOT), "study-materials");
const COURSE = { phys2: "일반물리학2", statics: "정역학", em1: "공업수학1", calc2: "미분적분학2" };
function all() { const out = []; const base = path.join(ROOT, "notes", "classroom"); for (const c of fs.readdirSync(base)) { const d = path.join(base, c); if (!fs.statSync(d).isDirectory()) continue; for (const f of fs.readdirSync(d)) if (f.endsWith(".html")) out.push(path.join("notes", "classroom", c, f).replace(/\\/g, "/")); } return out.sort(); }
const files = process.argv.slice(2).length ? process.argv.slice(2).map(f => f.replace(/\\/g, "/")) : all();
const norm = s => String(s || "").replace(/\s+/g, " ").trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fail = 0, total = { steps: 0, quiz: 0, v2: 0 };
function loadBoard(slug, date) {
  const p = path.join(__dirname, "lessons", "board", `${slug}_${date}.py`); if (!fs.existsSync(p)) return null;
  const py = "import json,io,sys\nns={}\np=sys.argv[1]\nexec(compile(io.open(p,encoding='utf-8').read(),p,'exec'),ns)\nsys.stdout.buffer.write(json.dumps({'VERSION':str(ns.get('VERSION') or ''),'BOARD':ns['BOARD']},ensure_ascii=False).encode('utf-8'))";
  return JSON.parse(cp.execFileSync("python", ["-c", py, p], { env: Object.assign({}, process.env, { PYTHONIOENCODING: "utf-8" }) }).toString("utf8"));
}
async function check(file) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  const errs = []; const vc = new VirtualConsole(); vc.on("jsdomError", e => errs.push(String(e && e.message || e).split("\n")[0]));
  const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc, url: "http://localhost/study/" + file, beforeParse(w) { w.renderMathInElement = () => {}; w.confirm = () => true; w.HTMLElement.prototype.scrollIntoView = function () {}; } });
  const w = dom.window, doc = w.document; const problems = [];
  const X = w.__cr; const D = X && X.D; if (!D || !Array.isArray(D.chapters)) { console.log("FAIL " + file + " · 자료(D) 없음 " + errs.join(" | ")); fail++; return; }
  const V2 = D.v === 2; if (V2) total.v2++;
  const m = /classroom\/(\w+)\/(\d{4}-\d{2}-\d{2})\.html$/.exec(file); const slug = m[1], date = m[2];
  const bc = () => norm(doc.querySelector("#bc").textContent);
  if (V2) X.reduce = true;   /* 논리 검사는 즉시 표시로(애니메이션 검사는 ④ 에서 따로 끈다) */
  try {
    // ① 모든 화면
    X.S.mode = "intro"; X.render(); if (!bc().includes(D.title.replace(/\s+/g, " ").slice(0, 10))) problems.push("목차 화면에 제목 없음");
    D.chapters.forEach((c, ci) => c.steps.forEach((st, si) => { X.S.mode = "step"; X.S.ci = ci; X.S.si = si; X.S.rev = st.t === "ex"; X.S.again = 0; X.S.resume = false; X.render(); total.steps++;
      const t = bc(); if (t.length < 2 && st.t !== "board" && st.t !== "fig") problems.push(`CH${ci + 1} 단계 ${si + 1}(${st.t}) 칠판이 비었음`);
      if (!doc.querySelector("#dText") || !X.fullText) problems.push(`CH${ci + 1} 단계 ${si + 1} 대사 없음`);
      if (!doc.querySelector("#dCh [data-primary]")) problems.push(`CH${ci + 1} 단계 ${si + 1} 기본 선택지 없음`);
      if (V2) { /* 판서 누적: 이 단계까지의 줄이 순서대로 전부, 그림은 이 단계의 것만, 미래 그림 단계는 숨김 */
        const want = c.steps.slice(0, si + 1).flatMap(s => s.b.map((_, j) => s.id + "#" + j)); const got = [...doc.querySelectorAll("#bc .bl")].map(l => l.getAttribute("data-step") + "#" + l.getAttribute("data-ln"));
        if (want.join(",") !== got.join(",")) problems.push(`CH${ci + 1} 단계 ${si + 1} 판서 줄 누적이 다름: ${got.length}/${want.length}`);
        if (![...doc.querySelectorAll("#bc .bl")].every(l => l.classList.contains("now"))) problems.push(`CH${ci + 1} 단계 ${si + 1} 즉시 표시인데 줄이 가려짐`);
        const figs = doc.querySelectorAll("#bc .bd-fig"); if (figs.length !== (st.fig ? 1 : 0)) problems.push(`CH${ci + 1} 단계 ${si + 1} 그림 수 ${figs.length} (기대 ${st.fig ? 1 : 0})`);
        if (st.fig) { const gs = [...doc.querySelectorAll("#bc .bd-fig [data-step]")]; if (!gs.length) problems.push(`CH${ci + 1} 단계 ${si + 1} 그림에 data-step 없음`);
          gs.forEach(g => { const n = +g.getAttribute("data-step"); const hid = g.hasAttribute("hidden"); if ((n > st.fs) !== hid) problems.push(`CH${ci + 1} 단계 ${si + 1} 그림 단계 ${n} ${hid ? "숨김" : "보임"} (fs ${st.fs})`); });
          const svg = doc.querySelector("#bc .bd-fig svg"); if (!svg || !/^fig-/.test(svg.id)) problems.push(`CH${ci + 1} 단계 ${si + 1} 그림 svg id 없음`);
          if (!doc.querySelector("#bc .bd-fig filter[id^='chalk-']")) problems.push(`CH${ci + 1} 단계 ${si + 1} 분필 필터 없음`); }
        if (X.anim || X.pending) problems.push(`CH${ci + 1} 단계 ${si + 1} 즉시 표시인데 예약 작업 남음`); }
    }));
    // 문제: 첫 문제 정답 → XP·호감도, 둘째 오답 → 하트, 입력형은 답 보기 → 채점
    if (D.quiz.length) { X.S.mode = "quiz"; X.S.qi = 0; X.render(); total.quiz += D.quiz.length;
      const before = { xp: X.T.xp, hearts: X.T.hearts, aff: X.T.aff };
      D.quiz.forEach((q, qi) => { X.S.qi = qi; X.render(); if (!bc().includes(norm(q.qn).slice(0, 6))) problems.push(`문제 ${qi + 1} 화면에 문제 번호 없음`);
        if (q.choices) { const okI = q.choices.findIndex(c => c.ok); const pickI = qi === 1 ? (okI + 1) % q.choices.length : okI; const btn = doc.querySelectorAll("#bc .cb")[pickI]; if (!btn) { problems.push(`문제 ${qi + 1} 보기 버튼 없음`); return; } btn.click();
          if (!doc.querySelector("#bc .ans")) problems.push(`문제 ${qi + 1} 답 뒤 해설 없음`); if (!doc.querySelector("#bc .cb.ok")) problems.push(`문제 ${qi + 1} 정답 표시 없음`); }
        else { const ta = doc.querySelector("#myans"); if (!ta) { problems.push(`문제 ${qi + 1} 입력칸 없음`); return; } ta.value = "x"; doc.querySelector("#reveal").click(); const g = doc.querySelector("#bc [data-g='1']"); if (!g) { problems.push(`문제 ${qi + 1} 자기 채점 버튼 없음`); return; } g.click(); } });
      const ST = JSON.parse(w.localStorage.getItem("mc-lesson-" + D.id) || "{}"), T = JSON.parse(w.localStorage.getItem("mc-tutor") || "{}");
      const done = D.quiz.filter(q => ST.done && ST.done[q.id]).length; if (done !== D.quiz.length) problems.push(`mc-lesson 문제 저장 ${done}/${D.quiz.length}`);
      if (!(T.xp > before.xp)) problems.push("정답 뒤 XP 안 오름"); if (D.quiz[1] && D.quiz[1].choices && !(T.hearts < before.hearts)) problems.push("오답 뒤 하트 안 줄음");
      if (!T.lessons || !T.lessons[D.id]) problems.push("mc-tutor 에 회차 기록 없음");
      /* 문제 위치 저장: 마지막 문제 화면의 저장값이 quiz + qi */
      const Lq = T.lessons && T.lessons[D.id]; if (!Lq || !Lq.pos || Lq.pos.mode !== "quiz" || Lq.pos.qi !== D.quiz.length - 1) problems.push("문제 위치 저장이 quiz/qi 가 아님: " + JSON.stringify(Lq && Lq.pos));
      X.S.mode = "result"; X.render(); if (!/정답/.test(bc())) problems.push("결과 화면 없음"); }
    // 챕터 완료(마지막 단계에서 「이해했어요」) → mc-lesson read + XP 10, 같은 챕터를 다시 끝내도 XP 는 한 번
    const xp0 = X.T.xp; X.S.mode = "step"; X.S.ci = 0; X.S.si = D.chapters[0].steps.length - 1; X.S.rev = true; X.render(); X.next();
    const ST2 = JSON.parse(w.localStorage.getItem("mc-lesson-" + D.id) || "{}"); if (!ST2.read || !ST2.read[D.chapters[0].id]) problems.push("챕터 완료가 mc-lesson read 에 안 남음");
    if (X.T.xp !== xp0 + 10) problems.push("챕터 완료 XP +10 이 아님: " + (X.T.xp - xp0));
    X.S.mode = "step"; X.S.ci = 0; X.S.si = D.chapters[0].steps.length - 1; X.S.rev = true; X.render(); X.next(); if (X.T.xp !== xp0 + 10) problems.push("챕터 재완료에 XP 를 또 줌");
    // 오타 v54 A③: 저장 위치가 범위 밖(재빌드)이어도 #resume 가 챕터를 완료로 치지 않는다 (v2: v1 식 저장값은 그 챕터 처음으로)
    { const xp1 = X.T.xp; const L = X.L; L.pos = { mode: "step", ci: 1, si: 999 }; L.done = false; delete L.ch[D.chapters[1].id]; w.location.hash = "#resume"; X.boot();
      const wantSi = V2 ? 0 : D.chapters[1].steps.length - 1;
      if (X.S.mode !== "step" || X.S.ci !== 1 || X.S.si !== wantSi) problems.push("#resume 범위 밖 단계 보정 실패: " + X.S.mode + " " + X.S.ci + "/" + X.S.si);
      if (L.ch[D.chapters[1].id] || X.T.xp !== xp1) problems.push("#resume 범위 밖 위치가 챕터를 완료로 침"); w.location.hash = ""; }
    // 오타 v55 1: 저장 위치가 문자열("0","2")이어도 목차의 「이어서 하기」 뒤 「이해했어요」가 다음 단계로 가고 챕터를 완료로 치지 않는다 (v2: v1 식 저장값 → 챕터 처음 → 다음 = 2단계)
    { const L2 = X.L; L2.pos = { mode: "step", ci: "0", si: "2" }; L2.done = false; delete L2.ch[D.chapters[0].id]; const xpS = X.T.xp; X.S.mode = "intro"; X.render();
      const btn = [...doc.querySelectorAll("#dCh .cbt")].find(b => /이어서 하기/.test(b.textContent)); if (!btn) problems.push("목차에 「이어서 하기」 없음"); else { btn.click();
        const s0 = V2 ? 0 : 2; if (X.S.ci !== 0 || X.S.si !== s0 || typeof X.S.si !== "number") problems.push("이어서 하기 위치가 정수 아님: " + JSON.stringify([X.S.ci, X.S.si])); X.next();
        if (X.S.si !== s0 + 1 || X.S.mode !== "step") problems.push("이어서 하기 뒤 다음 단계가 " + (s0 + 1) + "이 아님: " + X.S.mode + " " + X.S.si); if (L2.ch[D.chapters[0].id] || X.T.xp !== xpS) problems.push("문자열 위치로 챕터가 완료됨"); } }
    // 오타 v54 A①: 정답 → 다시 풀기 → 정답 = XP 한 번
    if (D.quiz.length && D.quiz[0].choices) { const q = D.quiz[0], ST3 = X.ST; delete ST3.done[q.id]; delete ST3.correct[q.id]; delete ST3.answer[q.id]; X.T.hearts = 3; const xp2 = X.T.xp; X.S.mode = "quiz"; X.S.qi = 0; X.render();
      const okI = q.choices.findIndex(c => c.ok); doc.querySelectorAll("#bc .cb")[okI].click(); if (X.T.xp !== xp2) problems.push("다시 풀기 정답에 XP 를 또 줌: +" + (X.T.xp - xp2)); }
    // 오타 v54 A④: 하트 0이면 객관식·입력형 모두 문제를 못 연다(자기 채점 포함)
    if (D.quiz.length) { const q = D.quiz[0], ST4 = X.ST; delete ST4.done[q.id]; delete ST4.correct[q.id]; delete ST4.answer[q.id]; X.T.hearts = 0; X.S.mode = "quiz"; X.S.qi = 0; X.render();
      if (X.S.mode !== "nohearts") problems.push("하트 0인데 문제 화면이 열림: " + X.S.mode); X.T.hearts = 3; }
    // 목차 오버레이
    doc.querySelector("#hToc").click(); if (doc.querySelectorAll("#ovList li").length !== D.chapters.length + (D.quiz.length ? 1 : 0)) problems.push("목차 항목 수 불일치"); doc.querySelector("#ovClose").click();
    // ④ v2 저장·이전·애니메이션
    if (V2) {
      const C1 = D.chapters[1] || D.chapters[0], S1 = C1.steps[Math.min(3, C1.steps.length - 1)];
      /* 저장 형식: 고정 챕터 id·단계 id·문제 번호·버전, fs 는 저장하지 않는다 */
      X.S.mode = "step"; X.S.ci = D.chapters.indexOf(C1); X.S.si = C1.steps.indexOf(S1); X.S.resume = false; X.render();
      const P = JSON.parse(w.localStorage.getItem("mc-tutor")).lessons[D.id].pos;
      if (!P || P.mode !== "step" || P.cid !== C1.id || P.sid !== S1.id || P.ver !== D.ver || typeof P.qi !== "number" || "fs" in P) problems.push("v2 저장 형식이 아님: " + JSON.stringify(P));
      /* 이전 규칙 */
      const go = (pos) => { X.L.pos = pos; X.L.done = false; w.location.hash = "#resume"; X.boot(); w.location.hash = ""; return { mode: X.S.mode, ci: X.S.ci, si: X.S.si, qi: X.S.qi }; };
      let r = go({ mode: "step", cid: C1.id, sid: S1.id, qi: 0, ver: D.ver }); if (r.mode !== "step" || r.ci !== D.chapters.indexOf(C1) || r.si !== C1.steps.indexOf(S1)) problems.push("같은 버전 이전 실패: " + JSON.stringify(r));
      r = go({ mode: "step", cid: C1.id, sid: S1.id, qi: 0, ver: "old-" + D.ver }); if (r.mode !== "step" || r.ci !== D.chapters.indexOf(C1) || r.si !== 0) problems.push("버전 불일치 → 챕터 처음 이 아님: " + JSON.stringify(r));
      r = go({ mode: "step", cid: "no-such-chapter", sid: S1.id, qi: 0, ver: D.ver }); if (r.mode !== "intro") problems.push("챕터 id 없음 → 목차 가 아님: " + JSON.stringify(r));
      r = go({ mode: "step", cid: C1.id, sid: "no-such-step", qi: 0, ver: D.ver }); if (r.mode !== "step" || r.ci !== D.chapters.indexOf(C1) || r.si !== 0) problems.push("단계 id 없음 → 챕터 처음 이 아님: " + JSON.stringify(r));
      if (D.quiz.length) { X.ST.done = {}; X.ST.correct = {}; X.ST.answer = {}; X.T.hearts = 3; r = go({ mode: "quiz", cid: C1.id, sid: S1.id, qi: 2, ver: D.ver }); if (r.mode !== "quiz" || r.qi !== 0) problems.push("문제 위치 이전(미완 첫 문제) 실패: " + JSON.stringify(r));
        r = go({ mode: "quiz", qi: 999, ver: D.ver }); if (r.mode !== "quiz" || r.qi !== 0) problems.push("문제 번호 범위 밖 보정 실패: " + JSON.stringify(r)); }
      if (X.anim || X.pending) problems.push("이전 뒤 예약 작업 남음");
      /* 애니메이션: 동작 줄이기 꺼도 미래 단계는 숨김, Enter 한 번 = 즉시 완료(단계 그대로), 두 번째 Enter = 다음 한 단계, 이동하면 예약 작업 0 */
      X.reduce = false;
      const withFig = []; D.chapters.forEach((c, ci) => c.steps.forEach((s, si) => { if (s.fig && s.fs < c.figs[s.fig].max) withFig.push({ ci, si, s }); }));
      const tgt = withFig[0] || { ci: 0, si: 0, s: D.chapters[0].steps[0] };
      X.S.mode = "step"; X.S.ci = tgt.ci; X.S.si = tgt.si; X.S.resume = false; X.S.again = 0; X.render();
      if (!X.anim) problems.push("애니메이션 모드인데 진행 상태(anim) 없음");
      if (tgt.s.fig) { const bad = [...doc.querySelectorAll("#bc .bd-fig [data-step]")].filter(g => +g.getAttribute("data-step") > tgt.s.fs && !g.hasAttribute("hidden")); if (bad.length) problems.push("애니메이션 모드에서 미래 그림 단계가 보임: " + bad.length); }
      const mineHidden = [...doc.querySelectorAll(`#bc .bl[data-step="${tgt.s.id}"]`)].filter(l => l.classList.contains("now") || l.classList.contains("on")); if (mineHidden.length) problems.push("대사 중인데 이 단계 판서 줄이 벌써 보임");
      X.enter();   /* 1) 즉시 완료 */
      if (X.S.si !== tgt.si || X.S.ci !== tgt.ci) problems.push("Enter 즉시 완료가 단계를 옮김: " + X.S.ci + "/" + X.S.si);
      if (X.anim || X.pending) problems.push("즉시 완료 뒤 예약 작업 남음: " + X.pending);
      if (norm(doc.querySelector("#dText").textContent) !== norm(X.fullText)) problems.push("즉시 완료 뒤 대사가 끝까지 안 나옴");
      if (![...doc.querySelectorAll("#bc .bl")].every(l => l.classList.contains("now"))) problems.push("즉시 완료 뒤 판서 줄이 가려짐");
      if (doc.querySelector("#bc .bd-fig .draw, #bc .bd-fig .fade") ) problems.push("즉시 완료 뒤 그림 요소에 애니메이션 클래스 남음");
      if (tgt.s.fig) { const bad = [...doc.querySelectorAll("#bc .bd-fig [data-step]")].filter(g => +g.getAttribute("data-step") > tgt.s.fs && !g.hasAttribute("hidden")); if (bad.length) problems.push("즉시 완료 뒤 미래 그림 단계가 보임: " + bad.length); }
      X.enter();   /* 2) 다음 한 단계 */
      const nx = tgt.si + 1 < D.chapters[tgt.ci].steps.length; if (nx && (X.S.ci !== tgt.ci || X.S.si !== tgt.si + 1)) problems.push("두 번째 Enter 가 다음 한 단계가 아님: " + X.S.ci + "/" + X.S.si);
      /* 연타: Enter 세 번 빠르게 → 정확히 (즉시 완료 1 + 이동 2)  */
      X.S.mode = "step"; X.S.ci = tgt.ci; X.S.si = 0; X.S.resume = false; X.render(); X.enter(); X.enter(); X.enter();
      if (D.chapters[tgt.ci].steps.length >= 2 && (X.S.ci !== tgt.ci || X.S.si !== 1)) problems.push("Enter 연타 뒤 위치가 이상함: " + X.S.ci + "/" + X.S.si + " (기대 " + tgt.ci + "/1: 완료·다음·완료)");
      /* 이동 중 취소: 대사를 건너뛰어 판서 줄 타이머를 걸어 둔 채 다른 챕터로 → 예약 작업 0, 1.2초 뒤에도 새 화면 그대로 */
      X.S.mode = "step"; X.S.ci = tgt.ci; X.S.si = tgt.si; X.S.resume = false; X.render(); doc.querySelector("#dText").click();
      if (!X.pending) problems.push("대사 건너뛴 뒤 판서 타이머가 안 걸림(검사 전제 실패)");
      const other = (tgt.ci + 1) % D.chapters.length; doc.querySelector(`#chpills [data-pill="${other}"]`).click();
      if (X.pending) problems.push("챕터 이동 뒤 예약 작업 남음: " + X.pending);
      const title0 = norm(doc.querySelector("#bc .bd-title").textContent); doc.querySelector("#dText").click();
      await sleep(1200);
      if (norm(doc.querySelector("#bc .bd-title").textContent) !== title0 || X.S.ci !== other) problems.push("이동 1.2초 뒤 화면이 바뀜");
      const stale = [...doc.querySelectorAll("#bc .bl")].filter(l => l.getAttribute("data-step").indexOf(D.chapters[other].id + "-") !== 0); if (stale.length) problems.push("이동 뒤 다른 챕터 판서 줄이 섞임: " + stale.length);
      X.cancelAll(); X.reduce = true;
    }
  } catch (e) { problems.push("예외: " + (e && e.stack || e).split("\n").slice(0, 2).join(" ")); }
  // ② 내용 유실(v1) / 판서 파일과 1:1(v2)
  const src = path.join(SM, COURSE[slug], "_수업노트", date + ".html");
  if (fs.existsSync(src)) { const sd = new JSDOM(fs.readFileSync(src, "utf8")).window.document;
    const secs = [...sd.querySelectorAll("section.s")];
    if (V2) {
      let B = null; try { B = loadBoard(slug, date); } catch (e) { problems.push("판서 파일 읽기 실패: " + String(e.message).slice(0, 120)); }
      if (B) { if (B.VERSION !== D.ver) problems.push(`버전 불일치: 페이지 ${D.ver} ≠ 판서 파일 ${B.VERSION}`);
        if (secs.length !== D.chapters.length) problems.push(`챕터 수 ${D.chapters.length} ≠ 원본 섹션 ${secs.length}`);
        secs.forEach((sec, i) => { const c = D.chapters[i]; if (!c) return; const sid = sec.getAttribute("data-id"); if (c.id !== sid) { problems.push(`CH${i + 1} id ${c.id} ≠ 원본 섹션 ${sid}`); return; }
          const bs = B.BOARD[sid]; if (!Array.isArray(bs)) { problems.push(`판서 파일에 ${sid} 없음`); return; }
          if (bs.length !== c.steps.length) problems.push(`CH${i + 1} 단계 수 ${c.steps.length} ≠ 판서 파일 ${bs.length}`);
          const figMax = {}; [...sec.querySelectorAll("figure[data-fig]")].forEach(f => { const ns = [...f.querySelectorAll("[data-step]")].map(g => +g.getAttribute("data-step")); figMax[f.getAttribute("data-fig")] = ns.length ? Math.max(...ns) : 1; });
          bs.forEach((b, j) => { const s = c.steps[j]; if (!s) return; const id = b.id || `${sid}-${j + 1}`;
            if (s.id !== id) problems.push(`CH${i + 1} 단계 ${j + 1} id ${s.id} ≠ ${id}`);
            if (JSON.stringify(s.braw) !== JSON.stringify((b.b || []).map(String))) problems.push(`CH${i + 1} 단계 ${j + 1} 판서 줄이 판서 파일과 다름`);
            if (s.s !== String(b.s || "")) problems.push(`CH${i + 1} 단계 ${j + 1} 대사가 판서 파일과 다름`);
            if ((s.fig || null) !== (b.fig || null)) problems.push(`CH${i + 1} 단계 ${j + 1} 그림 ${s.fig} ≠ ${b.fig}`);
            if (b.fig) { if (!Number.isInteger(s.fs) || s.fs < 1 || s.fs > (figMax[b.fig] || 0) || s.fs !== b.fs) problems.push(`CH${i + 1} 단계 ${j + 1} 그림 단계 ${s.fs} (판서 파일 ${b.fs}, 최대 ${figMax[b.fig]})`); if (!(c.figs && c.figs[b.fig])) problems.push(`CH${i + 1} 그림 ${b.fig} 이 페이지에 없음`); }
            else if (s.fs !== 0) problems.push(`CH${i + 1} 단계 ${j + 1} 그림 없는데 fs ${s.fs}`);
            if (s.b.length !== (b.b || []).length || s.b.some(l => !l.h || !l.k)) problems.push(`CH${i + 1} 단계 ${j + 1} 판서 줄 변환 불량`); });
          Object.keys(c.figs || {}).forEach(n => { if (c.figs[n].max !== figMax[n]) problems.push(`CH${i + 1} 그림 ${n} 최대 단계 ${c.figs[n].max} ≠ 원본 ${figMax[n]}`); }); });
        /* id 유일성: 필터·화살촉·svg id 가 페이지 전체에서 한 번씩 */
        const ids = [...html.matchAll(/ id=\\?"((?:chalk|ah|fig)-[^"\\]+)\\?"/g)].map(x => x[1]); const dup = ids.filter((x, k) => ids.indexOf(x) !== k); if (dup.length) problems.push("그림 id 중복: " + [...new Set(dup)].slice(0, 3).join(", "));
        if (!/fonts\.googleapis\.com\/css2\?family=Gaegu/.test(html)) problems.push("판서 글꼴(Gaegu) 링크 없음"); } }
    else secs.forEach((sec, i) => { const c = D.chapters[i]; if (!c) { problems.push(`원본 섹션 ${i + 1} 에 대응하는 챕터 없음`); return; }
      const clone = sec.cloneNode(true); clone.querySelectorAll("h2,.no,svg").forEach(x => x.remove());
      /* 양쪽 다 요소 경계마다 공백을 넣어 비교한다(원본 textContent 는 <p>a</p><div>b</div> 를 "ab" 로 붙인다) */
      const joinKids = el => [...el.childNodes].map(n => n.nodeType === 1 ? [...n.childNodes].map(x => x.textContent).join(" ") : n.textContent).join(" ");
      const st = norm(joinKids(clone)); const tmp = sd.createElement("div"); tmp.innerHTML = c.steps.map(s => (s.sub ? s.sub + " " : "") + (s.t === "ex" ? s.q + " " + s.a : s.t === "board" ? (s.cap || "") : s.html || "")).join(" "); tmp.querySelectorAll("svg").forEach(x => x.remove()); const tt = norm(joinKids(tmp));
      /* 공백은 무시하고 비교(요소 경계의 공백 차이는 유실이 아니다) */
      const sq = st.replace(/\s+/g, ""), tq = tt.replace(/\s+/g, "");
      const missing = []; for (let k = 0; k + 30 <= sq.length; k += 30) { const frag = sq.slice(k, k + 30); if (!tq.includes(frag)) missing.push(frag); } if (missing.length) problems.push(`CH${i + 1} 원본 글 조각 ${missing.length}개가 단계에 없음: 「${missing.slice(0, 2).join("」「")}」`); });
    const qn = sd.querySelectorAll("div.q").length; if (qn !== D.quiz.length) problems.push(`문제 수 ${D.quiz.length} ≠ 원본 ${qn}`); }
  else problems.push("원본 없음: " + src);
  if (errs.length) problems.push("JS 오류: " + errs.slice(0, 3).join(" | "));
  if (problems.length) { fail++; console.log("FAIL " + file + "\n   - " + problems.join("\n   - ")); } else console.log("OK   " + file + (V2 ? " · v2 " + D.ver : " · v1") + " · 챕터 " + D.chapters.length + " · 단계 " + D.chapters.reduce((a, c) => a + c.steps.length, 0) + " · 문제 " + D.quiz.length);
  try { w.close(); } catch (e) {}
}
(async () => { for (const f of files) await check(f);
  console.log(`\n교실 ${files.length}개(v2 ${total.v2}) · 단계 ${total.steps} · 문제 ${total.quiz} · 실패 ${fail}`);
  process.exit(fail ? 1 : 0); })();
