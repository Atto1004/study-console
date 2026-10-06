import test from "node:test";
import assert from "node:assert/strict";
import {
  evidenceSummary,
  reviewQueue,
  recommendStart,
  splitText,
  learningPath,
} from "./learning.js";
test("반복 정답을 새 문항으로 세지 않고 도움 사용을 분리한다", () => {
  const events = [
    { kind: "read", course: "수학" },
    { kind: "answer", course: "수학", lesson: "l", step: "q", correct: false },
    {
      kind: "answer",
      course: "수학",
      lesson: "l",
      step: "q",
      correct: true,
      assisted: true,
    },
  ];
  assert.deepEqual(evidenceSummary(events, "수학"), {
    tested: 1,
    independent: 0,
    assisted: 1,
    retry: 0,
  });
});
test("도움받은 문제를 독립 정답보다 먼저 복습한다", () => {
  const events = [
    {
      kind: "answer",
      lesson: "l",
      step: "a",
      at: 100,
      correct: true,
      assisted: true,
    },
    {
      kind: "answer",
      lesson: "l",
      step: "b",
      at: 100,
      correct: true,
      assisted: false,
    },
  ];
  assert.deepEqual(
    reviewQueue(events, 100 + 86401).map((e) => e.step),
    ["a"],
  );
});
test("진단 오답의 선수 개념부터 제안한다", () => {
  assert.equal(
    recommendStart(
      { nodes: [{ id: "ode.ivp" }], lessons: [] },
      [],
      [{ node: "alg.ratio", correct: false }],
    ).id,
    "node:alg.ratio",
  );
});
test("긴 문장을 의미 단위로 나누고 수식을 임의로 자르지 않는다", () => {
  const formula = "\\[y=\\frac{dy}{dx}\\]";
  assert.deepEqual(splitText(formula, 5), [formula]);
  assert.equal(splitText("첫 문장입니다. 두 번째 문장입니다.", 10).length, 2);
});
test("노베이스 경로는 선수 기초부터 올라가며 없는 자료는 따로 알린다", () => {
  const c = {
    nodes: [{ id: "course", prereq: ["middle", "missing"] }],
    lessons: [{ id: "lecture" }],
  };
  const p = learningPath(
    c,
    [
      { id: "middle", prereq: ["base"] },
      { id: "base", prereq: [] },
    ],
    "node:course",
    true,
  );
  assert.deepEqual(p.path, [
    "node:base",
    "node:middle",
    "node:course",
    "lecture",
  ]);
  assert.deepEqual(p.missing, ["missing"]);
});
