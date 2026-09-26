/* 교실 모드 검사 — notes/classroom/<slug>/<date>.html 전부를 jsdom 으로 열어
   ① 모든 챕터·단계·문제 화면을 실제로 render() 해서 예외 0 · 칠판 내용 비어 있지 않음
   ② 단계에 담긴 글이 원본 섹션 글과 같다(잃어버린 내용 없음 — 원본 텍스트의 모든 30자 조각이 단계 텍스트에 있음)
   ③ 문제 답·해설·하트·XP·챕터 완료가 mc-tutor / mc-lesson-<id> 에 저장된다(앱 V52 판정 키와 같음)
   사용: NODE_PATH=<jsdom 있는 node_modules> node docs/tools/classroom_check.cjs [files]  — 문제가 하나라도 있으면 종료 코드 1 */
const fs = require("fs"), path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");
const ROOT = path.resolve(__dirname, "..", "..");
const SM = path.join(path.dirname(ROOT), "study-materials");
const COURSE = { phys2: "일반물리학2", statics: "정역학", em1: "공업수학1", calc2: "미분적분학2" };
function all() { const out = []; const base = path.join(ROOT, "notes", "classroom"); for (const c of fs.readdirSync(base)) { const d = path.join(base, c); if (!fs.statSync(d).isDirectory()) continue; for (const f of fs.readdirSync(d)) if (f.endsWith(".html")) out.push(path.join("notes", "classroom", c, f).replace(/\\/g, "/")); } return out.sort(); }
const files = process.argv.slice(2).length ? process.argv.slice(2).map(f => f.replace(/\\/g, "/")) : all();
const norm = s => String(s || "").replace(/\s+/g, " ").trim();
let fail = 0, total = { steps: 0, quiz: 0 };
function check(file) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  const errs = []; const vc = new VirtualConsole(); vc.on("jsdomError", e => errs.push(String(e && e.message || e).split("\n")[0]));
  const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc, url: "http://localhost/study/" + file, beforeParse(w) { w.renderMathInElement = () => {}; w.confirm = () => true; w.HTMLElement.prototype.scrollIntoView = function () {}; } });
  const w = dom.window, doc = w.document; const problems = [];
  const X = w.__cr; const D = X && X.D; if (!D || !Array.isArray(D.chapters)) { console.log("FAIL " + file + " · 자료(D) 없음 " + errs.join(" | ")); fail++; return; }
  // ① 모든 화면
  const m = /classroom\/(\w+)\/(\d{4}-\d{2}-\d{2})\.html$/.exec(file); const slug = m[1], date = m[2];
  const bc = () => norm(doc.querySelector("#bc").textContent);
  try {
    X.S.mode = "intro"; X.render(); if (!bc().includes(D.title.replace(/\s+/g, " ").slice(0, 10))) problems.push("목차 화면에 제목 없음");
    D.chapters.forEach((c, ci) => c.steps.forEach((st, si) => { X.S.mode = "step"; X.S.ci = ci; X.S.si = si; X.S.rev = st.t === "ex"; X.S.again = 0; X.render(); total.steps++;
      const t = bc(); if (t.length < 2 && st.t !== "board" && st.t !== "fig") problems.push(`CH${ci + 1} 단계 ${si + 1}(${st.t}) 칠판이 비었음`);
      if (!doc.querySelector("#dText") || !X.fullText) problems.push(`CH${ci + 1} 단계 ${si + 1} 대사 없음`);
      if (!doc.querySelector("#dCh [data-primary]")) problems.push(`CH${ci + 1} 단계 ${si + 1} 기본 선택지 없음`); }));
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
      X.S.mode = "result"; X.render(); if (!/정답/.test(bc())) problems.push("결과 화면 없음"); }
    // 챕터 완료(마지막 단계에서 「이해했어요」) → mc-lesson read + XP 10, 같은 챕터를 다시 끝내도 XP 는 한 번
    const xp0 = X.T.xp; X.S.mode = "step"; X.S.ci = 0; X.S.si = D.chapters[0].steps.length - 1; X.S.rev = true; X.render(); X.next();
    const ST2 = JSON.parse(w.localStorage.getItem("mc-lesson-" + D.id) || "{}"); if (!ST2.read || !ST2.read[D.chapters[0].id]) problems.push("챕터 완료가 mc-lesson read 에 안 남음");
    if (X.T.xp !== xp0 + 10) problems.push("챕터 완료 XP +10 이 아님: " + (X.T.xp - xp0));
    X.S.mode = "step"; X.S.ci = 0; X.S.si = D.chapters[0].steps.length - 1; X.S.rev = true; X.render(); X.next(); if (X.T.xp !== xp0 + 10) problems.push("챕터 재완료에 XP 를 또 줌");
    // 오타 v54 A③: 저장 위치가 범위 밖(재빌드)이어도 #resume 가 챕터를 완료로 치지 않는다
    { const xp1 = X.T.xp; const L = X.L; L.pos = { mode: "step", ci: 1, si: 999 }; L.done = false; delete L.ch[D.chapters[1].id]; w.location.hash = "#resume"; X.boot();
      if (X.S.mode !== "step" || X.S.ci !== 1 || X.S.si !== D.chapters[1].steps.length - 1) problems.push("#resume 범위 밖 단계 보정 실패: " + X.S.mode + " " + X.S.ci + "/" + X.S.si);
      if (L.ch[D.chapters[1].id] || X.T.xp !== xp1) problems.push("#resume 범위 밖 위치가 챕터를 완료로 침"); w.location.hash = ""; }
    // 오타 v54 A①: 정답 → 다시 풀기 → 정답 = XP 한 번
    if (D.quiz.length && D.quiz[0].choices) { const q = D.quiz[0], ST3 = X.ST; delete ST3.done[q.id]; delete ST3.correct[q.id]; delete ST3.answer[q.id]; X.T.hearts = 3; const xp2 = X.T.xp; X.S.mode = "quiz"; X.S.qi = 0; X.render();
      const okI = q.choices.findIndex(c => c.ok); doc.querySelectorAll("#bc .cb")[okI].click(); if (X.T.xp !== xp2) problems.push("다시 풀기 정답에 XP 를 또 줌: +" + (X.T.xp - xp2)); }
    // 오타 v54 A④: 하트 0이면 객관식·입력형 모두 문제를 못 연다(자기 채점 포함)
    if (D.quiz.length) { const q = D.quiz[0], ST4 = X.ST; delete ST4.done[q.id]; delete ST4.correct[q.id]; delete ST4.answer[q.id]; X.T.hearts = 0; X.S.mode = "quiz"; X.S.qi = 0; X.render();
      if (X.S.mode !== "nohearts") problems.push("하트 0인데 문제 화면이 열림: " + X.S.mode); X.T.hearts = 3; }
    // 목차 오버레이
    doc.querySelector("#hToc").click(); if (doc.querySelectorAll("#ovList li").length !== D.chapters.length + (D.quiz.length ? 1 : 0)) problems.push("목차 항목 수 불일치");
  } catch (e) { problems.push("예외: " + (e && e.stack || e).split("\n").slice(0, 2).join(" ")); }
  // ② 내용 유실
  const src = path.join(SM, COURSE[slug], "_수업노트", date + ".html");
  if (fs.existsSync(src)) { const sd = new JSDOM(fs.readFileSync(src, "utf8")).window.document;
    const secs = [...sd.querySelectorAll("section.s")];
    secs.forEach((sec, i) => { const c = D.chapters[i]; if (!c) { problems.push(`원본 섹션 ${i + 1} 에 대응하는 챕터 없음`); return; }
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
  if (problems.length) { fail++; console.log("FAIL " + file + "\n   - " + problems.join("\n   - ")); } else console.log("OK   " + file + " · 챕터 " + D.chapters.length + " · 단계 " + D.chapters.reduce((a, c) => a + c.steps.length, 0) + " · 문제 " + D.quiz.length);
}
files.forEach(check);
console.log(`\n교실 ${files.length}개 · 단계 ${total.steps} · 문제 ${total.quiz} · 실패 ${fail}`);
process.exit(fail ? 1 : 0);
