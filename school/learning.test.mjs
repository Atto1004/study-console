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
test("여러 줄 display 수식과 aligned 내부 줄·빈 줄을 그대로 보존한다", () => {
  for (const formula of [
    "\\[a=b\n+c\\]",
    "$$a=b\n+c$$",
    "\\[\\begin{aligned}\na&=b\\\\\n\n&=c\n\\end{aligned}\\]",
  ]) {
    assert.deepEqual(splitText(formula, 5), [formula]);
  }
});
test("앞뒤 설명을 분할해도 여러 수식의 원문과 순서를 보존한다", () => {
  const first = "\\[a=b\n+c\\]",
    second = "$$x=y\n+z$$";
  const pages = splitText(
    `앞 설명입니다.\n${first}\n\n중간 설명입니다.\n${second}\n뒤 설명입니다.`,
    12,
  );
  const result = pages.join("\n");
  assert.ok(result.includes(first));
  assert.ok(result.includes(second));
  assert.ok(result.indexOf("앞 설명") < result.indexOf(first));
  assert.ok(result.indexOf(first) < result.indexOf("중간 설명"));
  assert.ok(result.indexOf("중간 설명") < result.indexOf(second));
  assert.ok(result.indexOf(second) < result.indexOf("뒤 설명"));
  assert.ok(!result.includes("\uE000"));
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
