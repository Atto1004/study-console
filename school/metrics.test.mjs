import test from "node:test";
import assert from "node:assert/strict";
import { courseMetrics, classifySource, pickQuest } from "./metrics.js";

const lessons = [
  { id: "a", date: "2026-09-01" },
  { id: "b", date: "2026-09-08" },
  { id: "c", date: "2026-09-15" },
  { id: "d", date: "2026-10-01" },
  { id: "late", date: "2026-10-12" },
];
const answer = (lesson, step, correct, assisted = false, at = 1) => ({ kind: "answer", lesson, step, correct, assisted, at });

test("손계산과 같은 다섯 지표", () => {
  const events = [
    answer("a", 1, true),
    answer("a", 2, true, true),
    answer("b", 1, false),
    answer("b", 1, true, false, 2),
    { kind: "position", lesson: "c" },
  ];
  const m = courseMetrics({ lessons, events, exam: { date: "2026-10-19" }, today: "2026-10-07" });
  // 범위 = a,b,c,d (late 는 오늘 이후) · 공부 = a,b,c → 3/4
  assert.equal(m.scope, 4);
  assert.equal(m.covered, 3);
  assert.equal(m.progress, 0.75);
  // 문항 = a1(혼자), a2(도움), b1(마지막 시도 혼자) → 정답 3/3, 이해 2/3
  assert.equal(m.tested, 3);
  assert.equal(m.accuracy, 1);
  assert.ok(Math.abs(m.understanding - 2 / 3) < 1e-9);
  // 50×2/3 + 30×1 + 20×0.75 = 33.33+30+15 = 78.3 → 78
  assert.equal(m.readiness, 78);
  // 남은 1회차 ÷ 12일
  assert.equal(m.daysLeft, 12);
  assert.equal(m.pace, "ok");
});

test("기록이 없으면 0, 남은 회차가 많으면 빨강", () => {
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

test("지금 할 것: 하루 안 마감 과제 > 급한 과목, 미확정 시험은 뒤", () => {
  const row = (course, readiness, dday, assumed = false) => ({ exam: { course, dday, assumed }, m: { readiness } });
  const rows = [row("정역학", 71, 12), row("미적2", 27, 13), row("CADD", 0, 15, true), row("물리2", 0, 16)];
  assert.equal(pickQuest(rows).exam.course, "물리2");
  assert.equal(pickQuest(rows, [{ title: "HW5", deadlineDays: 1, submitted: false }]).type, "assignment");
  assert.equal(pickQuest(rows, [{ title: "HW5", deadlineDays: 3, submitted: false }]).type, "course");
  assert.equal(pickQuest([]), null);
});

test("자료 4분류 — 누가 만들었나", () => {
  assert.equal(classifySource({ kind: "material", file: "강의자료_1주차.pdf" }), "original");
  assert.equal(classifySource({ kind: "recording", file: "클로바_0914.txt" }), "original");
  assert.equal(classifySource({ kind: "photo", file: "판서_3.jpg" }), "original");
  assert.equal(classifySource({ lms: true, title: "W2-1 영상" }), "original");
  assert.equal(classifySource({ kind: "summary", file: "정리.md" }), "tutor");
  assert.equal(classifySource({ href: "notes/lessons/statics/2026-09-07.html" }), "tutor");
  assert.equal(classifySource({ file: "HW-Ch5_제출본_v11.pdf" }), "assignment");
  assert.equal(classifySource({ kind: "material", file: "HW-Ch3.pdf" }), "assignment");
  assert.equal(classifySource({ href: "notes/statics-mid2-slides.html" }), "generated");
});
