/* V55 학습 경로 검사(jsdom) — 오타 v55 2차 RED 3·4·5 재현:
   ① unitOf: 장 번호(num)가 키워드(kw)보다 먼저 (「13.1 벡터함수」→벡터함수, 「Ch.8 Moments of Inertia」→Ch.8, 「29장 전류가 만드는 자기장」→29장)
   ② 지난 시험이 같은 단원의 회차 사이에 날짜 순서로 끼고, 첫 회차보다 앞이면 맨 앞에 보인다
   ③ 다음 시험이 기말이면 final 단원이 기말 앞에, 지나간 중간의 mid 단원은 맨 뒤 「앞으로 배울 단원」에
   ④ 예정 회차 「전부 보기」 상태가 과목별로 따로
   사용: NODE_PATH=<jsdom> node docs/tools/v55_path_check.cjs — 실패가 있으면 종료 코드 1 */
const fs = require("fs"), path = require("path"); const { JSDOM, VirtualConsole } = require("jsdom");
const ROOT = path.resolve(__dirname, "..", ".."); const errs = []; const vc = new VirtualConsole(); vc.on("jsdomError", e => errs.push(String(e.message).split("\n")[0]));
const d = new JSDOM(fs.readFileSync(path.join(ROOT, "index.html"), "utf8"), { runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: vc, url: "http://localhost/study/index.html", beforeParse(w) {
  w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }); w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = function () {};
  w.fetch = (u) => { const p = path.join(ROOT, String(u).split("?")[0]); if (fs.existsSync(p)) return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(fs.readFileSync(p, "utf8")), json: () => Promise.resolve(JSON.parse(fs.readFileSync(p, "utf8"))) }); return Promise.resolve({ ok: false, status: 404, json: () => Promise.reject(new Error("404")), text: () => Promise.resolve("") }); }; } });
let fail = 0; const ok = (c, m) => { console.log((c ? "OK   " : "FAIL ") + m); if (!c) fail++; };
setTimeout(() => { const w = d.window, doc = w.document; const by = n => w.courses().find(c => c.name === n);
  ["일반물리학2", "정역학", "공업수학1", "미분적분학2"].forEach(n => w.go("course", by(n).id));   /* units.json·lessons.json 로드 유도 */
  setTimeout(() => {
    ok(!!w.V55 && w.V55.U && Object.keys(w.V55.U).length >= 4, "units.json 로드");
    /* ① unitOf 우선순위 */
    const u = (n, title) => { const c = by(n); return w.V55.unitOf(c, { date: "2099-01-01", title }, w.V55.units(c)); };
    ok(u("미분적분학2", "13.1 벡터함수와 공간곡선") === 2, "「13.1 벡터함수」 → 벡터함수(3번째 단원): " + u("미분적분학2", "13.1 벡터함수와 공간곡선"));
    ok(u("정역학", "Ch.8 Moments of Inertia") === 7, "「Ch.8 Moments of Inertia」 → Ch.8: " + u("정역학", "Ch.8 Moments of Inertia"));
    ok(u("일반물리학2", "29장 전류가 만드는 자기장") === 8, "「29장 전류가 만드는 자기장」 → 29장: " + u("일반물리학2", "29장 전류가 만드는 자기장"));
    ok(u("일반물리학2", "가우스 법칙 복습") === 2, "키워드만 있으면 kw 로: 「가우스 법칙 복습」 → 23장: " + u("일반물리학2", "가우스 법칙 복습"));
    ok(u("공업수학1", "2.5 오일러-코시") === 1 && u("공업수학1", "1.4 완전미분방정식") === 0, "공수1 절 번호 → 장");
    /* 등록 회차 전부 단원에 들어가는지 */
    ["일반물리학2", "정역학", "공업수학1", "미분적분학2"].forEach(n => { w.go("course", by(n).id); ok(doc.querySelectorAll("#v55Path .v55-unit.none").length === 0, n + " 단원 미지정 0"); });
    /* ② 지난 시험 위치 */
    const c = by("일반물리학2"), t = w.term(); const nodesText = () => [...doc.querySelectorAll("#v55Path .v55-node")].map(el => (el.querySelector(".v55-lbl b") || {}).textContent || "");
    t.exams.push({ id: "t-mid-in", courseId: c.id, kind: "쪽지", date: "2026-09-03", scope: "검사용" }); w.go("course", c.id);
    let txt = nodesText(); let i2 = txt.findIndex(s => /9\/2/.test(s)), ie = txt.findIndex(s => /쪽지/.test(s)), i4 = txt.findIndex(s => /9\/4/.test(s));
    ok(i2 >= 0 && ie > i2 && ie < i4, "9/3 쪽지시험이 9/2 와 9/4 사이: " + [i2, ie, i4].join(","));
    t.exams.push({ id: "t-pre", courseId: c.id, kind: "진단", date: "2026-08-31", scope: "검사용" }); w.go("course", c.id);
    const pathEl = doc.querySelector("#v55Path .v55-path"); const firstKids = [...pathEl.children]; const firstUnit = firstKids.findIndex(el => el.classList.contains("v55-unit")), preNode = firstKids.findIndex(el => /진단/.test(el.textContent));
    ok(preNode >= 0 && preNode < firstUnit, "첫 회차보다 앞선 지난 시험(8/31)이 첫 단원 배너 앞에: " + preNode + " < " + firstUnit);
    t.exams = t.exams.filter(e => !/^t-/.test(e.id));
    /* ②-2 같은 날 회차 → 시험 순서 (오타 v56 ④⑤): 지난 시험 9/9 는 단원 2 의 9/9 회차 뒤·9/11 앞, 예정 시험 9/30 은 9/30 예정 회차 뒤 */
    t.exams.push({ id: "t-same-past", courseId: c.id, kind: "쪽지", date: "2026-09-09", scope: "검사용" }); w.go("course", c.id);
    txt = nodesText(); const s9 = txt.findIndex(s => /9\/9/.test(s)), e9 = txt.findIndex(s => /쪽지/.test(s)), s11 = txt.findIndex(s => /9\/11/.test(s));
    ok(s9 >= 0 && e9 === s9 + 1 && s11 === e9 + 1, "9/9 지난 시험이 같은 날 회차 바로 뒤·9/11 앞: " + [s9, e9, s11].join(","));
    const unit2 = [...doc.querySelectorAll("#v55Path .v55-path > *")]; const iU2 = unit2.findIndex(el => el.classList.contains("v55-unit") && /22장/.test(el.textContent)), iE9 = unit2.findIndex(el => /쪽지/.test(el.textContent));
    ok(iU2 >= 0 && iE9 > iU2, "그 시험이 단원 2 배너 뒤(단원 안)에 있음: " + iU2 + " < " + iE9);
    t.exams = t.exams.filter(e => !/^t-/.test(e.id));
    const fut30 = w.V32.meetings(c).find(dt => dt > w.today()); t.exams.push({ id: "t-same-fut", courseId: c.id, kind: "퀴즈", date: fut30, scope: "검사용" }); w.V55.showAll[c.id] = true; w.go("course", c.id);
    const kidsF = [...doc.querySelectorAll("#v55Path .v55-path > *")]; const iFutNode = kidsF.findIndex(el => el.classList.contains("v55-fut") && new RegExp((+fut30.slice(5, 7)) + "/" + (+fut30.slice(8, 10)) + "\\(").test(el.textContent)), iQuiz = kidsF.findIndex(el => el.classList.contains("v55-node") && /퀴즈/.test(el.textContent));
    ok(iFutNode >= 0 && iQuiz > iFutNode, "시험과 같은 날 예정 회차(" + fut30 + ")가 사라지지 않고 시험 앞에: " + iFutNode + " < " + iQuiz);
    ok(kidsF.filter(el => el.classList.contains("v55-plan")).length === 7, "phase 없는 퀴즈에는 단원을 붙이지 않고 전부 남김(7): " + kidsF.filter(el => el.classList.contains("v55-plan")).length);
    t.exams = t.exams.filter(e => !/^t-/.test(e.id)); w.V55.showAll = {};
    /* ③ 다음 시험 = 기말: final 단원이 기말 앞, 지나간 중간의 mid 단원은 맨 뒤 */
    const mid = t.exams.find(e => e.courseId === c.id && e.kind === "중간"); const midDate = mid.date; mid.date = "2026-09-10"; w.go("course", c.id);
    const kids = [...doc.querySelector("#v55Path .v55-path").children]; const iFinal = kids.findIndex(el => el.classList.contains("v55-node") && /기말/.test(el.textContent)); const plans = kids.map((el, i) => ({ i, el })).filter(x => x.el.classList.contains("v55-plan"));
    const fin = plans.filter(x => /28장|29장|30장|31장|32장/.test(x.el.textContent)), midp = plans.filter(x => /26장|27장/.test(x.el.textContent));
    ok(iFinal > 0 && fin.length === 5 && fin.every(x => x.i < iFinal), "final 단원 5개가 기말 마디 앞에: " + fin.map(x => x.i).join(",") + " < " + iFinal);
    ok(midp.length === 2 && midp.every(x => x.i > iFinal), "지나간 중간의 mid 단원(26·27장)은 기말 뒤 「앞으로 배울 단원」에: " + midp.map(x => x.i).join(","));
    const pastMid = kids.findIndex(el => el.classList.contains("v55-node") && /중간고사/.test(el.textContent)); ok(pastMid >= 0 && pastMid < iFinal, "지나간 중간고사 마디가 단원 안에 남아 있음: " + pastMid);
    mid.date = midDate;
    /* ④ 전부 보기 상태는 과목별 */
    w.V55.showAll[c.id] = true; w.go("course", c.id); const n1 = doc.querySelectorAll("#v55Path .v55-fut .v55-node").length;
    const c2 = by("정역학"); w.go("course", c2.id); const n2 = doc.querySelectorAll("#v55Path .v55-fut .v55-node").length;
    ok(n1 > 4 && n2 === 4, "전부 보기: 일물2 " + n1 + "개(전부) · 정역학 " + n2 + "개(접힘)");
    /* 동률 비교(오타 v57): 같은 날·같은 종류는 0 → 입력 순서 보존, 회차가 시험 앞 */
    { const S1 = { kind: "sess", date: "2026-10-01", id: "S1" }, S2 = { kind: "sess", date: "2026-10-01", id: "S2" }, E1 = { kind: "exam", date: "2026-10-01", id: "E1" }, E2 = { kind: "exam", date: "2026-10-01", id: "E2" };
      const o1 = [S1, S2, E1, E2].sort(w.V55.byDate).map(x => x.id).join(""), o2 = [E2, S2, E1, S1].sort(w.V55.byDate).map(x => x.id).join("");
      ok(w.V55.byDate(S1, S2) === 0 && w.V55.byDate(E1, E2) === 0 && w.V55.byDate(S1, E1) < 0 && w.V55.byDate(E1, S1) > 0, "byDate: 같은 종류 0 · 회차 < 시험");
      ok(o1 === "S1S2E1E2" && o2 === "S2S1E2E1", "동률 정렬이 입력 순서를 보존: " + o1 + " / " + o2); }
    /* 어두운 테마 글자 토큰 */
    const css = doc.querySelector("#v54css") && doc.querySelector("#v54css").textContent || ""; ok(/data-theme="dark"\]\{[^}]*--duo-blue-text:#5AC8FA/.test(css) && /--duo-green-text:#7ED957/.test(css), "어두운 테마 글자 토큰(파랑 #5AC8FA · 초록 #7ED957)");
    console.log("errs", errs.length, errs.slice(0, 3)); process.exit(fail ? 1 : 0);
  }, 2500); }, 2500);
