// node school/calc.test.mjs — 계산기 엔진 검사(과제 숫자 기준)
import assert from "node:assert/strict";
import { evaluate, solve, fmt } from "./calc.js";
const near = (a, b, t = 1e-6) => assert.ok(Math.abs(a - b) < t, `${a} != ${b}`);
near(evaluate("981 sin 60"), 849.5709211, 1e-6);          // 3.11
near(evaluate("100×9.81×sin(60)"), 849.5709211, 1e-6);
near(evaluate("2(3+4)"), 14);                               // 곱하기 생략
near(evaluate("2π"), 2 * Math.PI);
near(evaluate("−3^2"), -9);                                 // 단항 마이너스는 거듭제곱보다 나중
near(evaluate("2^3^2"), 512);                               // 오른쪽 결합
near(evaluate("√(41)"), 6.403124237, 1e-8);                  // 3.63
near(evaluate("tan⁻¹(0.433013/2.25)"), 10.8934, 1e-3);      // 5.126
near(evaluate("acos(0.768)"), 39.825, 1e-3);                 // 3.51
near(evaluate("5²"), 25);
near(evaluate("Ans×2", 21), 42);
near(evaluate("50/(0.3cos30+0.38cos20)"), 81.0516, 1e-3);   // 4.5
assert.throws(() => evaluate("2+"));
assert.throws(() => evaluate("(1+2"));
assert.throws(() => evaluate("1/0"));
assert.throws(() => evaluate("foo"));
// 3.26 · 3.63
let x = solve([[-0.6, 0.8], [0.8, 0.6]], [0, 3433.5]); near(x[0], 2746.8, 1e-6); near(x[1], 2060.1, 1e-6);
const u = v => { const n = Math.hypot(...v); return v.map(t => t / n); };
const e1 = u([5, 4, 0]), e2 = u([-2, 4, -2]), e3 = u([-3, 4, 3]);
x = solve([[e1[0], e2[0], e3[0]], [e1[1], e2[1], e3[1]], [e1[2], e2[2], e3[2]]], [0, 981, 0]);
near(x[0], 509.308, 1e-3); near(x[1], 487.084, 1e-3); near(x[2], 386.498, 1e-3);
assert.equal(solve([[1, 2], [2, 4]], [3, 6]), null);         // 해 무수히 많음
assert.equal(fmt(0.1 + 0.2), "0.3");
assert.equal(fmt(-1e-14), "0");
x = solve([[1e-13, 0], [0, 1e-13]], [1e-13, 2e-13]); near(x[0], 1); near(x[1], 2);   // 작은 단위 식
x = solve([[1e13, 0], [0, 1]], [1e13, 2]); near(x[0], 1); near(x[1], 2);                // 큰 단위 식
assert.equal(solve([[1, 1], [1, 1]], [1, 2]), null);                                     // 모순
near(evaluate("sin(30)^2"), 0.25);
near(evaluate("2^-2"), 0.25);
near(evaluate("2sin30"), 1);
assert.throws(() => evaluate("asin(2)"));
console.log("calc tests ok");
