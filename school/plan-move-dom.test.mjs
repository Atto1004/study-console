// 이동 유형 일정 추가·고치기·확정 검사(jsdom). 실행: NODE_PATH=<jsdom 경로> node school/plan-move-dom.test.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mock } from 'node:test';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>', { pretendToBeVisual: true, url: 'http://127.0.0.1/' });
const w = dom.window;
for (const k of ['document', 'localStorage', 'requestAnimationFrame', 'innerWidth', 'innerHeight']) Object.defineProperty(globalThis, k, { value: w[k], configurable: true, writable: true });
globalThis.confirm = () => true;
mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-10-12T05:00:00Z') });   // KST 14:00 월요일

let serverState = { v60: {} };
globalThis.fetch = async (url, opt = {}) => {
  const json = (o) => ({ ok: true, status: 200, json: async () => o });
  if (String(url).startsWith('/api/cal')) return json({ ok: true, days: {} });
  if (String(url).startsWith('/api/study/state')) return opt.method === 'POST' ? json({ workspaceRevision: 1 }) : json({ state: JSON.parse(JSON.stringify(serverState)) });
  throw new Error('unexpected fetch ' + url);
};
const { createPlan } = await import('./plan.js');
const flush = async (n = 6) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
const calls = [];
const ctx = () => ({
  today: '2026-10-12', courses: ['정역학', '미적분'], focus: () => true, inClass: () => false, scheduled: [], classSlots: [], holidays: null, term: null, sessions: [],
  plans: [], calendarOk: true, calendar: [], routine: { grid: {} }, deadlines: [], courseName: (id) => ({ c1: '정역학', c2: '미적분' }[id] || ''), courseId: (n) => ({ 정역학: 'c1', 미적분: 'c2' }[n]), exams: [], dailyCap: 4,
  addPlan: async (item) => { calls.push(['add', item]); return ['n1']; }, updatePlan: async (item) => { calls.push(['update', item]); return true; }, deletePlan: async () => true, deletePlans: async () => [], restorePlans: async () => true, attend: async () => true, reload: () => {},
});
const host = document.getElementById('h');
const plan = createPlan({ status: (m, bad) => calls.push(['status', m, !!bad]) });
await plan.render(host, ctx()); await flush();
const click = (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 200, clientY: 300 }));
const pm = () => host.querySelector('.pl-mode:not(.pl-fill)');
const popBtn = (t) => [...document.querySelectorAll('.pl-pop button')].find((b) => b.textContent.trim() === t);
const pressed = (b) => b.getAttribute('aria-pressed') === 'true';
const plus = () => document.getElementById('pl-fab');
const q = (sel) => document.querySelector(('.pl-pop ' + sel).trim());
const typeIn = (sel, v) => { const i = q(sel); i.value = v; i.dispatchEvent(new w.Event('input', { bubbles: true })); };
const lastAdd = () => calls.filter((c) => c[0] === 'add').pop()[1];
const lastUpd = () => calls.filter((c) => c[0] === 'update').pop()[1];
const chip = (t) => [...document.querySelectorAll('.pl-pop .pl-mvplaces button')].find((b) => b.textContent === t);
const setLen = (v) => { const s = q('[aria-label="이동 시간(분)"]'); s.value = v; s.dispatchEvent(new w.Event('change', { bubbles: true })); };
const setTime = (v) => { document.querySelector('.pl-pop input[type=time]').value = v; };

// 1. 확정 모드: 유형에 이동이 있고, 고르면 출발·도착·길이·추정이 나오고 과목은 사라진다
if (pressed(pm())) { click(pm()); await flush(); }
click(plus()); await flush();
const kinds = [...document.querySelectorAll('.pl-pop [aria-label="일정 종류"] button')].map((b) => b.textContent);
assert.deepEqual(kinds, ['고정', '공부', '과제', '이동', '준비', '밥', '수면']);
assert.equal(q('[aria-label="출발지"]').disabled, true, '이동이 아니면 입력 꺼짐');
click(q('[data-bk="이동"]')); await flush();
assert.equal(q('[aria-label="출발지"]').disabled, false); assert.equal(q('[aria-label="과목"]').hidden, true); assert.equal(q('[aria-label="길이"]').hidden, true);
assert.deepEqual([...q('[aria-label="이동 시간(분)"]').options].map((o) => o.textContent), ['5분', '10분', '15분', '20분', '30분', '45분', '60분', '직접 입력']);
assert.deepEqual([...document.querySelectorAll('.pl-pop .pl-mvplaces button')].map((b) => b.textContent), ['집', '학교', '도서관', '카페']);
assert.ok(q('.pl-mvest input[type=checkbox]') && q('.pl-mvest input').checked === false, '추정은 기본 꺼짐');
click(chip('집')); click(chip('학교'));
assert.equal(q('[aria-label="출발지"]').value, '집'); assert.equal(q('[aria-label="도착지(선택)"]').value, '학교'); assert.equal(q('[aria-label="할 일"]').value, '집 → 학교');
typeIn('[aria-label="도착지(선택)"]', '도서관'); assert.equal(q('[aria-label="할 일"]').value, '집 → 도서관', '이름을 안 고쳤으면 따라간다');
typeIn('[aria-label="할 일"]', '등교'); typeIn('[aria-label="도착지(선택)"]', '카페'); assert.equal(q('[aria-label="할 일"]').value, '등교', '직접 고친 이름은 덮지 않는다');
setLen('30'); q('.pl-mvest input').checked = true; setTime('08:00');
click(popBtn('확정으로 넣기')); await flush();
let a = lastAdd();
assert.deepEqual([a.state, a.bk, a.courseId, a.note, a.from, a.to, a.est, a.s, a.e, a.kind, a.src], ['confirmed', '이동', '', '등교', '집', '카페', true, '08:00', '08:30', '이동', 'manual']);

// 2. 직접 입력 길이(분) 검사
click(plus()); await flush(); click(q('[data-bk="이동"]')); await flush();
setLen('x'); await flush();
assert.equal(q('[aria-label="이동 시간 직접 입력(분)"]').hidden, false);
typeIn('[aria-label="이동 시간 직접 입력(분)"]', '7'); setTime('09:00');
click(popBtn('확정으로 넣기')); await flush(); a = lastAdd(); assert.deepEqual([a.s, a.e, a.note, a.from, a.to, a.est], ['09:00', '09:07', '이동', '', '', false], '이름·출발 모두 비면 이름은 「이동」');
click(plus()); await flush(); click(q('[data-bk="이동"]')); await flush();
setLen('x'); await flush();
typeIn('[aria-label="이동 시간 직접 입력(분)"]', '999'); const n0 = calls.filter((c) => c[0] === 'add').length;
q('').dispatchEvent(new w.Event('submit', { cancelable: true, bubbles: true })); await flush();   // 브라우저 검증을 건너뛰고 코드 경로만 확인
assert.equal(calls.filter((c) => c[0] === 'add').length, n0, '240분 넘으면 안 보냄'); assert.ok(calls.some((c) => c[0] === 'status' && c[1].includes('1~240') && c[2]));
document.querySelector('.pl-pop').remove();

// 3. 계획 모드: 새 계획 종류줄 [공부·과제 | 이동] — 이동을 고르면 tentative + bk 이동
click(pm()); await flush(); click(plus()); await flush();
assert.deepEqual([...document.querySelectorAll('.pl-pop [aria-label="계획 종류"] button')].map((b) => b.textContent), ['공부·과제', '이동', '준비', '밥']);
assert.equal(q('[aria-label="출발지"]').disabled, true);
click(q('[data-mv="true"]')); await flush(); assert.equal(q('[aria-label="출발지"]').disabled, false);
assert.ok(q('').textContent.includes('이동 계획이에요'));
typeIn('[aria-label="출발지"]', '집'); typeIn('[aria-label="도착지(선택)"]', '학교'); setTime('17:00'); setLen('10');
click(popBtn('계획으로 넣기')); await flush(); a = lastAdd();
assert.deepEqual([a.state, a.bk, a.courseId, a.from, a.to, a.note, a.e], ['tentative', '이동', '', '집', '학교', '집 → 학교', '17:10']);
// 계획 → 확정 스위치로 바꾸면 확정 이동으로 이어진다
click(plus()); await flush(); click(q('[data-mv="true"]')); await flush();
click([...document.querySelectorAll('.pl-pop [data-mode]')].find((b) => b.dataset.mode === '확정')); await flush();
assert.equal(pressed(q('[data-bk="이동"]')), true, '이동 고른 채 확정 모드로'); assert.equal(q('[aria-label="출발지"]').disabled, false);
click([...document.querySelectorAll('.pl-pop [data-mode]')].find((b) => b.dataset.mode === '계획')); await flush(); assert.equal(pressed(q('[data-mv="true"]')), true);
document.querySelector('.pl-pop').remove();
// 공부·과제를 고른 새 계획은 예전처럼 bk 없이
click(plus()); await flush(); setTime('19:00'); typeIn('[aria-label="할 일"]', '12.3 연습문제'); click(popBtn('계획으로 넣기')); await flush();
a = lastAdd(); assert.deepEqual([a.state, a.bk, a.from, a.est], ['tentative', undefined, undefined, undefined]);

// 4. 시간표 블록: 이동 확정 = 이동 모양·표식, 미확정 = 계획 모양, 범례에 이동
{
  const c = ctx(); c.plans = [
    { id: 'm1', date: '2026-10-12', s: '08:00', e: '08:30', courseId: '', kind: '이동', note: '집 → 학교', from: '집', to: '학교', est: true, state: 'confirmed', bk: '이동', activity: true },
    { id: 'm2', date: '2026-10-12', s: '17:00', e: '17:10', courseId: '', kind: '이동', note: '학교 → 집', from: '학교', to: '집', state: 'tentative', bk: '이동', activity: true },
    { id: 'o1', date: '2026-10-12', s: '10:00', e: '10:40', courseId: 'c1', kind: '시험 대비', note: '다른 활동', activity: true },   // bk 없는 옛 activity 기록은 여전히 안 그린다
  ];
  click(pm()); await flush(); await plan.render(host, c); await flush();
  const blks = [...host.querySelectorAll('.pl-blk')];
  const m1 = blks.find((b) => b.textContent.includes('집 → 학교')), m2 = blks.find((b) => b.textContent.includes('학교 → 집'));
  assert.ok(m1.classList.contains('c-move') && m1.querySelector('.pl-tag').textContent === '이동', '확정 이동 = 이동 표식');
  assert.ok(m1.textContent.includes('(추정)'), '추정 표시');
  assert.ok(m2.classList.contains('c-plan') && !m2.classList.contains('c-move'), '미확정 이동 = 계획(점선)');
  assert.ok(!blks.some((b) => b.textContent.includes('다른 활동')), 'bk 없는 activity 기록은 시간표에 안 그림');
  const legend = [...host.querySelectorAll('.pl-legend .pl-leg')].map((x) => x.textContent.trim());
  assert.deepEqual(legend, ['고정일정', '공부블록', '과제블록', '이동', '준비', '밥', '수면', '계획일정 (미확정)']);
  // 5. 고치기: 확정 이동을 열면 값이 채워져 있고, 이동 → 공부로 바꾸면 이동 필드를 떼서 보낸다
  click(m1); await flush();
  assert.equal(q('[aria-label="출발지"]').value, '집'); assert.equal(q('[aria-label="도착지(선택)"]').value, '학교'); assert.equal(q('.pl-mvest input').checked, true);
  assert.equal(q('[aria-label="이동 시간(분)"]').value, '30');
  typeIn('[aria-label="출발지"]', '기숙사'); click(popBtn('저장')); await flush();
  let u = lastUpd(); assert.deepEqual([u.bk, u.from, u.to, u.est, u.state, u.kind, u.courseId], ['이동', '기숙사', '학교', true, 'confirmed', '이동', '']);
  click([...host.querySelectorAll('.pl-blk')].find((b) => b.textContent.includes('집 → 학교'))); await flush();
  click(q('[data-bk="공부"]')); await flush(); typeIn('[aria-label="할 일"]', '12.3 연습문제'); q('[aria-label="과목"]').value = '정역학';
  setTime('08:00'); click(popBtn('저장')); await flush();
  u = lastUpd(); assert.deepEqual([u.bk, u.from, u.to, u.est, u.kind, u.courseId], ['공부', undefined, undefined, undefined, '시험 대비', 'c1']);
  // 6. 미확정 이동 고치기·확정: 저장만 해도 bk 이동 유지, 확정하면 state confirmed + bk 이동
  click([...host.querySelectorAll('.pl-blk')].find((b) => b.textContent.includes('학교 → 집'))); await flush();
  assert.equal(pressed(q('[data-bk="이동"]')), true, '확정할 종류에 이동이 골라져 있음'); assert.ok(popBtn('확정'));
  typeIn('[aria-label="도착지(선택)"]', '카페'); click(popBtn('저장')); await flush();
  u = lastUpd(); assert.deepEqual([u.state, u.bk, u.to], ['tentative', '이동', '카페']);
  click([...host.querySelectorAll('.pl-blk')].find((b) => b.textContent.includes('학교 → 집'))); await flush();
  click(popBtn('확정')); await flush(); u = lastUpd(); assert.deepEqual([u.state, u.bk, u.from, u.to, u.courseId], ['confirmed', '이동', '학교', '집', '']);
}

// 7. 채우기 상한: 이동 블록은 공부 시간(하루 상한)으로 세지 않는다
{
  const src = (await import('node:fs')).readFileSync(new URL('./plan.js', import.meta.url), 'utf8');
  assert.ok(/bk !== '고정' && !NONSTUDY_BK\.includes\(b\.plan\?\.bk\)\)\.reduce/.test(src), '하루 공부 상한 계산에서 고정·이동·준비·밥 제외');
}
console.log('plan-move-dom ok');
process.exit(0);
