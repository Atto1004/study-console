// 자막용 읽기 쉬운 글자 검사 — 실제 수업 자료에서 나온 수식·내부 표시 견본(10/9 「자막에 코드 텍스트」)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readable, cleanTitle } from '../../school/readable.js';

const CODEY = /\\[a-zA-Z(\[\])]|\$|`|[{}]|\*\*/;
const cases = [
  ['\\[\\frac{dT}{dt}=-k(T-T_a)\\]', 'dT/dt=-k(T-Tₐ)'],
  ["\\((y')^3+y=x\\)의 계는?", "(y')³+y=x의 계는?"],
  ['3.1 n계 1차독립 · 론스키안 (`판서_Wronskian공식`, `판서_특성방정식Wronskian`)', '3.1 n계 1차독립 · 론스키안'],
  ['$k_1y_1+k_2y_2+\\cdots+k_ny_n=0$ 이 $k_1=\\cdots=k_n=0$ 일 때만', 'k₁y₁+k₂y₂+…+kₙyₙ=0 이 k₁=…=kₙ=0 일 때만'],
  ['\\(u(x,t)\\)처럼 두 변수로 미분(∂)하면 PDE', 'u(x,t)처럼 두 변수로 미분(∂)하면 PDE'],
  ['\\(\\sqrt{x^2+1}\\) 와 \\(e^{-2x}\\), \\(y_{1}\\)', '√(x²+1) 와 e^(-2x), y₁'],
  ['\\(\\vec a\\times\\vec b\\)', 'a⃗×b⃗'],
  ['\\(\\sin x\\cdot\\cos x\\)', 'sin x·cos x'],
];
test('수식·내부 표시 → 읽기 쉬운 글자', () => {
  for (const [src, want] of cases) assert.equal(readable(src), want, src);
});
test('결과에 코드처럼 보이는 글자가 남지 않음(견본 전부)', () => {
  const more = ['\\(\\vec a\\times\\vec b=|\\vec i\\ \\vec j\\ \\vec k;\\ \\vec a;\\ \\vec b|\\) (판서 2) ★', '\\[\\left(\\frac{1}{2}\\right)^{n}\\]', '**굵게** `코드`', '\\(\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}\\)', '\\(\\mathbf{F}=m\\mathbf{a}\\)'];
  for (const s of [...cases.map((c) => c[0]), ...more]) assert.ok(!CODEY.test(readable(s)), `${s} → ${readable(s)}`);
});
test('정상 내용은 지우지 않음(오타 검수 10/9)', () => {
  assert.equal(readable('조건은 $x<y$이고 $y>z$입니다.'), '조건은 x<y이고 y>z입니다.');
  assert.equal(readable('변수(`x`)에 1을 더하세요.'), '변수(x)에 1을 더하세요.');
  assert.equal(readable('함수(`sin`, `cos`)를 비교하세요.'), '함수(sin, cos)를 비교하세요.');
  assert.equal(readable('a < b 이고 c > d'), 'a < b 이고 c > d');
  assert.equal(readable('<b>굵게</b> 그리고 <br>줄'), '굵게 그리고 줄');
  assert.equal(readable('그림 (`HW-Ch4.pdf`) 참고'), '그림 참고');
});
test('보통 문장은 그대로', () => {
  assert.equal(readable('자, 9/18은 결석 회차라 슬라이드와 교재로 재구성했어요.'), '자, 9/18은 결석 회차라 슬라이드와 교재로 재구성했어요.');
});
test('칠판 제목은 내부 표시만 빼고 수식은 그대로', () => {
  assert.equal(cleanTitle('론스키안 (`판서_W`) \\(W\\ne0\\)'), '론스키안 \\(W\\ne0\\)');
});
