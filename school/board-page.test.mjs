// node school/board-page.test.mjs — 판서 칸 위치·대사 나누기(대표님 10/11 「같은 말 반복」)
import assert from 'node:assert/strict';
import { boardPage, speechShare } from './board-page.js';

const S = ['가.', '나.', '다.', '라.', '마.'];
// 문장 5개 · 줄 4개 → 줄마다 순서대로, 빠짐·겹침 없이, 마지막 문장은 마지막 줄
const parts = [0, 1, 2, 3].map((k) => speechShare(S, k, 4));
assert.deepEqual(parts.flat(), S);
assert.deepEqual(parts[3], ['마.']);
// 문장이 줄보다 적으면 앞 줄부터 하나씩, 마지막 문장은 마지막 줄(물음 뒤에 줄이 더 써지지 않게)
assert.deepEqual([0, 1, 2].map((k) => speechShare(['A.', 'B?'], k, 3)), [['A.'], [], ['B?']]);
assert.deepEqual([0, 1, 2, 3].map((k) => speechShare(['A.', 'B.', 'C?'], k, 4)), [['A.'], ['B.'], [], ['C?']]);
// 줄 하나면 전부
assert.deepEqual(speechShare(S, 0, 1), S);

const step = (id, title, body, speech = '') => ({ id, title, body, speech });
const lesson = { steps: [
  step('s3-1:0', 'Ch.3', '과제 3.11', 'sin일까요?'), step('s3-1:1', 'Ch.3', '축', 'sin일까요?'),
  step('s3-2:0', 'Ch.3', 'W = 981', '답이에요.'),
  step('s3-3:0', 'Ch.3', '유사 문제 T3-1', '풀어 보세요.'), step('s3-3:1', 'Ch.3', '노트에 직접 풀기', '풀어 보세요.'),
  step('s4-1:0', 'Ch.4', '과제 4.5', '렌치예요.'),
  { id: 'q0', title: '수업 확인 문제', body: '?', options: ['a', 'b'] },
] };
const at = (index) => boardPage({ lesson, index });
assert.equal(at(0).itemEnd, false); assert.equal(at(1).itemEnd, true); assert.equal(at(1).asks, true);
assert.equal(at(1).k, 1); assert.equal(at(1).n, 2);
assert.equal(at(2).sectionEnd, false);
assert.equal(at(4).practice, true); assert.equal(at(4).sectionEnd, true);   // 다음 칸 제목이 다르면 단원 끝
assert.equal(at(5).sectionEnd, true);   // 다음이 문제(보기) 단계여도 단원 끝
assert.equal(at(6), null);             // 「칸:줄」 id 가 아니면 판서 쪽 아님
console.log('board-page 전부 통과');
