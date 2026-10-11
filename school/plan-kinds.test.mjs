// node school/plan-kinds.test.mjs — 할 일 종류 공부·과제·공모전(대표님 10/12)과 숨김 규칙
import assert from 'node:assert/strict';
import { KINDS, kindOf, hiddenTask } from './plan.js';

assert.deepEqual(KINDS, ['공부', '과제', '공모전']);
// 새 값
assert.equal(kindOf({ kind: '공모전' }), '공모전');
assert.equal(kindOf({ kind: '과제' }), '과제');
assert.equal(kindOf({ kind: '공부' }), '공부');
// 예전 값은 그대로 읽는다: cat hw → 과제, cat review·kind study → 공부, cat contest·kind contest → 공모전, 값 없음 → 과제
assert.equal(kindOf({ cat: 'hw' }), '과제');
assert.equal(kindOf({ cat: 'review' }), '공부');
assert.equal(kindOf({ cat: 'study' }), '공부');   // 서버 school_assignments.kind_of 와 같은 표(KindRuleTest)
assert.equal(kindOf({ kind: 'study' }), '공부');
assert.equal(kindOf({ kind: 'prep' }), '공부');
assert.equal(kindOf({ cat: 'weird' }), '과제');
assert.equal(kindOf({ cat: 'contest' }), '공모전');
assert.equal(kindOf({ kind: 'contest' }), '공모전');
assert.equal(kindOf({}), '과제');   // 어느 쪽에도 안 맞으면 과제(대표님 10/12)
assert.equal(kindOf({ kind: '공부', cat: 'hw' }), '공부');   // kind 를 적어 두었으면 kind 가 우선
// 숨김: off · mergedInto · showFrom 이 오늘보다 뒤
assert.equal(hiddenTask({ off: true }, '2026-10-12'), true);
assert.equal(hiddenTask({ mergedInto: 'sv-r3-cards' }, '2026-10-12'), true);
assert.equal(hiddenTask({ showFrom: '2026-11-01' }, '2026-10-31'), true);
assert.equal(hiddenTask({ showFrom: '2026-11-01' }, '2026-11-01'), false);
assert.equal(hiddenTask({ t: '보통 할 일' }, '2026-10-12'), false);
console.log('plan-kinds ok');

// 이름 바꾸기: 기록은 통째로 옮기고, 새 키에 기록이 있거나 과제 목록에 같은 키가 있으면 막는다(오타 검수 10/12 재현: 갈라짐 금지)
import { renameBlocked, moveRecords } from './plan.js';
{
  const s = { est: { 'A|x': 60 }, done: {}, act: { 'A|x': { min: 10 } }, run: { 'A|x': { acc: 1 } }, doneDate: {} };
  assert.equal(renameBlocked(s, 'A|x', 'A|y'), false);
  moveRecords(s, 'A|x', 'A|y');
  assert.deepEqual([s.est['A|y'], s.act['A|y'].min, s.run['A|y'].acc], [60, 10, 1]);
  assert.equal(['est', 'act', 'run'].some((k) => s[k]['A|x'] !== undefined), false);
}
{
  const s = { est: { 'A|x': 60, 'A|y': 30 }, done: {}, act: {}, run: { 'A|x': { acc: 1 } } };
  assert.equal(renameBlocked(s, 'A|x', 'A|y'), true);   // 새 키에 예상 30분이 남아 있으면 막음 → 호출 쪽은 아무것도 안 바꿈
  assert.equal(renameBlocked({ est: {} }, 'A|x', 'B|z', ['B|z']), true);   // 과제 목록에 같은 키
  assert.equal(renameBlocked(s, 'A|x', 'A|x'), false);   // 이름 그대로면 막을 일 없음
}
console.log('rename ok');

// 고치기 다시 적용(저장 충돌 409 뒤): 다른 화면이 같은 할 일 이름을 먼저 바꿨으면 아무것도 안 바꿈(오타 검수 10/12 재현)
import { applyEdit } from './plan.js';
{
  const base = () => ({ extra: [{ id: 'e1', kind: '공모전', c: 'A', t: 'x', due: '2026-10-20' }], est: { 'A|x': 60 }, done: {}, act: {}, run: { 'A|x': { acc: 5 } }, doneDate: {} });
  const ok = base(); assert.equal(applyEdit(ok, 'e1', 'A|x', { kind: '공모전', c: 'A', t: 'y', due: '2026-10-21', time: '' }), 'ok');
  assert.deepEqual([ok.extra[0].t, ok.est['A|y'], ok.run['A|y'].acc, ok.est['A|x']], ['y', 60, 5, undefined]);
  // 다른 화면: A|x → A|z 로 바꾸고 기록도 옮긴 뒤, 이쪽 고치기(A|x → A|y)가 다시 적용됨
  const other = base(); applyEdit(other, 'e1', 'A|x', { kind: '공모전', c: 'A', t: 'z', due: '2026-10-20', time: '' });
  const snap = JSON.stringify(other);
  assert.equal(applyEdit(other, 'e1', 'A|x', { kind: '공모전', c: 'A', t: 'y', due: '2026-10-21', time: '' }), 'changed');
  assert.equal(JSON.stringify(other), snap);   // 하나도 안 바뀜 — 기록은 A|z 에 그대로
  // 새 키에 기록이 있으면 막고 하나도 안 바뀜
  const busy = base(); busy.est['A|y'] = 30; const snap2 = JSON.stringify(busy);
  assert.equal(applyEdit(busy, 'e1', 'A|x', { kind: '공모전', c: 'A', t: 'y', due: '', time: '' }), 'blocked'); assert.equal(JSON.stringify(busy), snap2);
  // 없어진 할 일
  assert.equal(applyEdit({ extra: [] }, 'e1', 'A|x', { c: 'A', t: 'y' }), 'gone');
  // 이름은 그대로, 날짜만
  const same = base(); assert.equal(applyEdit(same, 'e1', 'A|x', { kind: '공모전', c: 'A', t: 'x', due: '2026-10-25', time: '09:00' }), 'ok'); assert.equal(same.est['A|x'], 60);
}
console.log('applyEdit ok');

// 3차 재현: 창을 연 뒤 다른 화면에서 같은 이름(A|y) 할 일 e2 가 추가됨 → e1 을 A|y 로 바꾸는 재적용은 막고 하나도 안 바뀜
{
  const s = { extra: [{ id: 'e1', c: 'A', t: 'x' }, { id: 'e2', c: 'A', t: 'y' }], est: { 'A|x': 60 }, done: {}, act: {}, run: {}, doneDate: {} };
  const snap = JSON.stringify(s);
  assert.equal(applyEdit(s, 'e1', 'A|x', { c: 'A', t: 'y', due: '', time: '' }), 'blocked'); assert.equal(JSON.stringify(s), snap);
  // 숨긴(off) 할 일과 같은 이름은 허용 — 숨긴 쪽 기록이 남아 있으면 renameBlocked 가 막음
  const s2 = { extra: [{ id: 'e1', c: 'A', t: 'x' }, { id: 'e2', c: 'A', t: 'y', off: true }], est: {}, done: {}, act: {}, run: {}, doneDate: {} };
  assert.equal(applyEdit(s2, 'e1', 'A|x', { c: 'A', t: 'y', due: '', time: '' }), 'ok');
}
console.log('same-name ok');
