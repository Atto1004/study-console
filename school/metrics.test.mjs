import test from "node:test";
import assert from "node:assert/strict";
import { courseMetrics, classifySource, sourceKind, pickQuest } from "./metrics.js";

const lessons = [
  { id: "a", date: "2026-09-01" },
  { id: "b", date: "2026-09-08" },
  { id: "c", date: "2026-09-15" },
  { id: "d", date: "2026-10-01" },
  { id: "late", date: "2026-10-12" },
];
const answer = (lesson, step, correct, assisted = false, at = 1) => ({ kind: "answer", lesson, step, correct, assisted, at });

test("손계산과 같은 다섯 지표 — 범위는 시험 전 회차 전부, 위치 이동은 완료가 아님", () => {
  const events = [
    answer("a", 1, true),
    answer("a", 2, true, true),
    answer("b", 1, false),
    answer("b", 1, true, false, 2),
    { kind: "position", lesson: "c" },
  ];
  const m = courseMetrics({ lessons, events, exam: { date: "2026-10-19" }, today: "2026-10-07" });
  // 범위 = a,b,c,d,late(10/12 < 10/19) · 푼 회차 = a,b → 2/5
  assert.equal(m.scope, 5);
  assert.equal(m.covered, 2);
  assert.equal(m.progress, 0.4);
  // 문항 = a1(혼자), a2(도움), b1(마지막 시도 혼자) → 정답 3/3, 이해 2/3
  assert.equal(m.tested, 3);
  assert.equal(m.accuracy, 1);
  assert.ok(Math.abs(m.understanding - 2 / 3) < 1e-9);
  // 0.4 × (50×2/3 + 30×1 + 20) = 0.4 × 83.33 = 33.3 → 33
  assert.equal(m.readiness, 33);
  // 남은 3회차 ÷ 12일
  assert.equal(m.daysLeft, 12);
  assert.equal(m.pace, "ok");
});

test("오타 재현: 위치 이동 2개 + 범위 밖 개념 문항 정답 1개로는 준비도가 오르지 않는다", () => {
  const events = [{ kind: "position", lesson: "a" }, { kind: "position", lesson: "b" }, answer("node:vec.dot", 1, true)];
  const m = courseMetrics({ lessons, events, exam: { date: "2026-10-19" }, today: "2026-10-07" });
  assert.equal(m.readiness, 0);
  assert.equal(m.tested, 0);
});

test("범위 일부만 완벽하게 풀어도 100이 되지 않는다", () => {
  const m = courseMetrics({ lessons, events: [answer("a", 1, true), answer("b", 1, true)], exam: { date: "2026-10-19" }, today: "2026-10-07" });
  assert.equal(m.readiness, 40);
});

test("남은 회차가 많으면 노랑·빨강", () => {
  const m = courseMetrics({ lessons, events: [], exam: { date: "2026-10-09" }, today: "2026-10-07" });
  assert.equal(m.readiness, 0);
  assert.equal(m.perDay, 2);
  assert.equal(m.pace, "tight");
  const m2 = courseMetrics({ lessons, events: [], exam: { date: "2026-10-08" }, today: "2026-10-07" });
  assert.equal(m2.pace, "behind");
});

test("시험 뒤 회차 문항은 빼고, 시험이 없으면 속도 판정 없음", () => {
  const m = courseMetrics({ lessons, events: [answer("late", 1, false)], exam: { date: "2026-10-10" }, today: "2026-10-07" });
  assert.equal(m.tested, 0);
  assert.equal(courseMetrics({ lessons, events: [], today: "2026-10-07" }).pace, "none");
});

test("지금 할 것: 하루 안 마감 과제 > 급한 과목, 미확정 시험은 뒤, 시험이 없어도 과제는 나온다", () => {
  const row = (course, readiness, dday, assumed = false) => ({ exam: { course, dday, assumed }, m: { readiness } });
  const rows = [row("정역학", 71, 12), row("미적2", 27, 13), row("CADD", 0, 15, true), row("물리2", 0, 16)];
  const due = [{ title: "HW5", deadlineDays: 1, submitted: false }];
  assert.equal(pickQuest(rows).exam.course, "물리2");
  assert.equal(pickQuest(rows, due).type, "assignment");
  assert.equal(pickQuest(rows, [{ title: "HW5", deadlineDays: 3, submitted: false }]).type, "course");
  assert.equal(pickQuest([], due).type, "assignment");
  assert.equal(pickQuest([]), null);
});

test("자료 4분류 — 명시된 종류가 먼저, 이름으로만 짐작하면 추정", () => {
  assert.deepEqual(sourceKind({ kind: "original", file: "lecture.pdf" }), { kind: "original", sure: true });
  assert.deepEqual(sourceKind({ kind: "material", file: "강의자료_1주차.pdf" }), { kind: "original", sure: true });
  assert.equal(classifySource({ kind: "recording", file: "클로바_0914.txt" }), "original");
  assert.equal(classifySource({ kind: "photo", file: "판서_3.jpg" }), "original");
  assert.deepEqual(sourceKind({ lms: true, title: "W2-1 영상" }), { kind: "original", sure: true });
  assert.deepEqual(sourceKind({ kind: "summary", file: "정리.md" }), { kind: "tutor", sure: true });
  assert.deepEqual(sourceKind({ href: "notes/lessons/statics/2026-09-07.html" }), { kind: "tutor", sure: false });
  assert.deepEqual(sourceKind({ file: "교수님_정리.pdf" }), { kind: "generated", sure: false });
  assert.deepEqual(sourceKind({ file: "HW-Ch5_제출본_v11.pdf" }), { kind: "assignment", sure: false });
  assert.deepEqual(sourceKind({ kind: "material", file: "HW-Ch3.pdf" }), { kind: "assignment", sure: true });
  assert.deepEqual(sourceKind({ assignment: true, file: "x.pdf" }), { kind: "assignment", sure: true });
  assert.equal(classifySource({ href: "notes/statics-mid2-slides.html" }), "generated");
});
