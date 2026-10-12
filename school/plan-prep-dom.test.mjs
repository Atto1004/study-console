// 준비·밥 유형 일정 추가·고치기·확정·블록 모양 검사(jsdom). 실행: NODE_PATH=<jsdom 경로> node school/plan-prep-dom.test.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mock } from 'node:test';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>', { pretendToBeVisual: true, url: 'http://127.0.0.1/' });
const w = dom.window;
for (const k of ['document', 'localStorage', 'requestAnimationFrame', 'innerWidth', 'innerHeight']) Object.defineProperty(globalThis, k, { value: w[k], configurable: true, writable: true });
globalThis.confirm = () => true;
mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-10-12T00:00:00Z') });   // KST 월 09:00
localStorage.setItem('school-plan-view', 'day');
globalThis.fetch = async (url) => {
  const json = (o) => ({ ok: true, status: 200, json: async () => o });
  if (String(url).startsWith('/api/cal')) return json({ ok: true, days: {} });
  if (String(url).startsWith('/api/health/sleep')) return json({ sleep: {}, tz: 'Asia/Seoul' });
  if (String(url).startsWith('/api/study/state')) return json({ state: { v60: {} } });
  throw new Error('unexpected fetch ' + url);
};
const { createPlan, mealName, defaultName, lensOf, defaultLen, rankOf, blockCat, CATS, NONSTUDY_BK } = await import('./plan.js');
const flush = async (n = 8) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
// 순수 규칙
assert.deepEqual([mealName(299), mealName(300), mealName(599), mealName(600), mealName(899), mealName(900), mealName(1319), mealName(1320), mealName(0)], ['밥', '아침', '아침', '점심', '점심', '저녁', '저녁', '밥', '밥']);
assert.deepEqual([defaultName('준비', 800), defaultName('밥', 450), defaultName('이동', 0)], ['준비', '아침', '']);
assert.deepEqual([lensOf('준비'), lensOf('밥'), defaultLen('준비'), defaultLen('밥')], [[15, 30, 45, 60, 90], [15, 20, 30, 40, 60], 30, 40]);
assert.deepEqual(NONSTUDY_BK, ['이동', '준비', '밥']); assert.equal(CATS.length, 8);
assert.equal(rankOf({ k: 'plan', plan: { bk: '준비', state: 'confirmed' } }), 0, '확정 준비 = 고정과 같은 순위'); assert.equal(rankOf({ k: 'plan', plan: { bk: '밥', state: 'tentative' } }), 2, '계획 밥 = 계획 순위');

const calls = [];
let plans = [];
const ctx = () => ({ today: '2026-10-12', courses: ['정역학'], focus: () => true, scheduled: [], classSlots: [], holidays: null, term: null, sessions: [], plans, calendarOk: true, calendar: [], routine: { grid: {} }, deadlines: [], courseName: (id) => ({ c1: '정역학' }[id] || ''), courseId: (n) => ({ 정역학: 'c1' }[n]), exams: [], dailyCap: 4,
  addPlan: async (item) => { calls.push(['add', item]); return ['n1']; }, updatePlan: async (item) => { calls.push(['update', item]); return true; }, deletePlan: async () => true, deletePlans: async () => [], restorePlans: async () => true, attend: async () => true });
const host = document.getElementById('h');
const plan = createPlan({ status: (m, bad) => calls.push(['status', m, !!bad]) });
await plan.render(host, ctx()); await flush(12);
const click = (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 200, clientY: 300 }));
const q = (sel) => document.querySelector(('.pl-pop ' + sel).trim());
const popBtn = (t) => [...document.querySelectorAll('.pl-pop button')].find((b) => b.textContent.trim() === t);
const plus = () => document.getElementById('pl-fab');
const pm = () => host.querySelector('.pl-mode:not(.pl-fill)');
const pressed = (b) => b.getAttribute('aria-pressed') === 'true';
const setTime = (v) => { const t = q('input[type=time]'); t.value = v; t.dispatchEvent(new w.Event('input', { bubbles: true })); };
const typeIn = (sel, v) => { const i = q(sel); i.value = v; i.dispatchEvent(new w.Event('input', { bubbles: true })); };
const lastAdd = () => calls.filter((c) => c[0] === 'add').pop()[1];
const lastUpd = () => calls.filter((c) => c[0] === 'update').pop()[1];
const opts = (sel) => [...q(sel).options].map((o) => o.textContent);
const closePop = () => document.querySelector('.pl-pop')?.remove();

// 1. 확정 모드: 유형 6개, 준비 고르면 길이 선택·이름 「준비」·과목 숨김
if (pressed(pm())) click(pm());
click(plus()); await flush();
assert.deepEqual([...document.querySelectorAll('.pl-pop [aria-label="일정 종류"] button')].map((b) => b.textContent), ['고정', '공부', '과제', '이동', '준비', '밥', '수면']);
click(q('[data-bk="준비"]')); await flush();
assert.equal(q('[aria-label="과목"]').hidden, true); assert.equal(q('[aria-label="길이"]').hidden, true); assert.equal(q('[aria-label="길이(분)"]').hidden, false);
assert.deepEqual(opts('[aria-label="길이(분)"]'), ['15분', '30분', '45분', '60분', '90분', '직접 입력']); assert.equal(q('[aria-label="길이(분)"]').value, '30');
assert.equal(q('[aria-label="할 일"]').value, '준비'); assert.equal(q('[aria-label="출발지"]').disabled, true, '이동 전용 칸은 꺼짐');
setTime('08:00');
// 회귀: 시각 칸을 벗어나며(change) 다시 그려도 누를 버튼의 글자 노드는 그대로여야 한다(WebKit 에서 바뀌면 클릭이 사라졌다)
const okBtn = popBtn('확정으로 넣기'), okNode = okBtn.firstChild; q('input[type=time]').dispatchEvent(new w.Event('change', { bubbles: true })); assert.equal(okBtn.firstChild, okNode, '같은 글자면 노드를 바꾸지 않는다');
click(popBtn('확정으로 넣기')); await flush();
let a = lastAdd(); assert.deepEqual([a.bk, a.state, a.courseId, a.note, a.s, a.e, a.kind], ['준비', 'confirmed', '', '준비', '08:00', '08:30', '준비']); assert.ok(!('from' in a) && !('est' in a));
// 2. 밥: 기본 40분 · 시각에 따라 이름 · 직접 쓴 이름은 덮지 않음
click(plus()); await flush(); click(q('[data-bk="밥"]')); await flush();
assert.deepEqual(opts('[aria-label="길이(분)"]'), ['15분', '20분', '30분', '40분', '60분', '직접 입력']); assert.equal(q('[aria-label="길이(분)"]').value, '40');
for (const [t, n] of [['07:30', '아침'], ['12:00', '점심'], ['19:00', '저녁'], ['23:00', '밥'], ['04:30', '밥']]) { setTime(t); assert.equal(q('[aria-label="할 일"]').value, n, t); }
setTime('12:00'); typeIn('[aria-label="할 일"]', '친구랑 점심'); setTime('19:00'); assert.equal(q('[aria-label="할 일"]').value, '친구랑 점심', '직접 쓴 이름은 덮어쓰지 않는다');
click(popBtn('확정으로 넣기')); await flush(); a = lastAdd(); assert.deepEqual([a.bk, a.note, a.s, a.e, a.kind, a.courseId], ['밥', '친구랑 점심', '19:00', '19:40', '밥', '']);
// 3. 직접 입력(1~240분)
click(plus()); await flush(); click(q('[data-bk="준비"]')); await flush(); setTime('10:00');
const pl = q('[aria-label="길이(분)"]'); pl.value = 'x'; pl.dispatchEvent(new w.Event('change', { bubbles: true })); await flush();
assert.equal(q('[aria-label="길이 직접 입력(분)"]').hidden, false);
typeIn('[aria-label="길이 직접 입력(분)"]', '241'); const n0 = calls.filter((c) => c[0] === 'add').length; click(popBtn('확정으로 넣기')); await flush();
assert.equal(calls.filter((c) => c[0] === 'add').length, n0, '241분은 안 넣음(칸의 max=240 검증 또는 저장 함수 검사)');
typeIn('[aria-label="길이 직접 입력(분)"]', '120'); click(popBtn('확정으로 넣기')); await flush(); a = lastAdd(); assert.deepEqual([a.s, a.e], ['10:00', '12:00']);
// 4. 계획 모드: 계획 종류 4칸(공부·과제 · 이동 · 준비 · 밥), 밥 계획 = 점선 계획으로 저장
click(pm()); await flush(); click(plus()); await flush();
assert.deepEqual([...document.querySelectorAll('.pl-pop [aria-label="계획 종류"] button')].map((b) => b.textContent), ['공부·과제', '이동', '준비', '밥']);
click(q('[data-tk="밥"]')); await flush(); assert.equal(pressed(q('[data-tk="밥"]')), true); setTime('17:00');
assert.equal(q('[aria-label="할 일"]').value, '저녁'); click(popBtn('계획으로 넣기')); await flush(); a = lastAdd();
assert.deepEqual([a.bk, a.state, a.courseId, a.note, a.s, a.e], ['밥', 'tentative', '', '저녁', '17:00', '17:40']);
// 계획 준비도: 이동 → 준비로 종류를 바꿔도 이동 전용 값이 안 붙는다
click(plus()); await flush(); click(q('[data-tk="이동"]')); await flush(); typeIn('[aria-label="출발지"]', '집'); click(q('[data-tk="준비"]')); await flush(); setTime('21:00');
click(popBtn('계획으로 넣기')); await flush(); a = lastAdd(); assert.deepEqual([a.bk, a.state, a.note, a.courseId], ['준비', 'tentative', '준비', '']); assert.ok(!('from' in a) && !('to' in a) && !('est' in a), '이동 값이 새 유형에 붙지 않음');
// 회귀(오타 1차): ① 08:30 시작 계획에서 밥을 처음 고르면(08:30+40분은 아직 안 지남) 계획으로 남는다 ② 자동값과 같은 글자를 직접 써도 시각을 바꿔도 보존 ③ 숨은 직접 길이 칸은 꺼져 제출을 막지 않음
const modeBtn = (k) => [...document.querySelectorAll('.pl-pop [aria-label="넣는 방식"] button')].find((b) => b.dataset.mode === k);
click(plus()); await flush(); setTime('08:30'); click(q('[data-tk="밥"]')); await flush();
assert.equal(pressed(modeBtn('계획')), true, '계획으로 남는다'); assert.ok(popBtn('계획으로 넣기'));
setTime('12:00'); assert.equal(q('[aria-label="할 일"]').value, '점심'); typeIn('[aria-label="할 일"]', '점심'); setTime('18:00'); assert.equal(q('[aria-label="할 일"]').value, '점심', '직접 쓴 이름 보존');
const pl2 = q('[aria-label="길이(분)"]'); pl2.value = 'x'; pl2.dispatchEvent(new w.Event('change', { bubbles: true })); await flush(); typeIn('[aria-label="길이 직접 입력(분)"]', '241');
pl2.value = '40'; pl2.dispatchEvent(new w.Event('change', { bubbles: true })); await flush(); assert.equal(q('[aria-label="길이 직접 입력(분)"]').disabled, true, '숨은 직접 칸은 꺼짐');
const nAdd = calls.filter((c) => c[0] === 'add').length; click(popBtn('계획으로 넣기')); await flush(); assert.equal(calls.filter((c) => c[0] === 'add').length, nAdd + 1, '숨은 칸의 241 때문에 제출이 막히지 않는다'); assert.deepEqual([lastAdd().s, lastAdd().e, lastAdd().note], ['18:00', '18:40', '점심']);
click(pm()); await flush();   // 계획 모드 끄기

// 5. 블록: 확정 준비·밥은 각자 모양과 글자 표식, 계획은 점선. 범례 8칸
const P = (o) => ({ id: 'p', date: '2026-10-12', courseId: '', note: '', done: false, source: '직접 계획', activity: true, ...o });
plans = [P({ id: 'a', s: '09:30', e: '10:00', bk: '준비', kind: '준비', note: '준비', state: 'confirmed' }), P({ id: 'b', s: '12:00', e: '12:40', bk: '밥', kind: '밥', note: '점심', state: 'confirmed' }), P({ id: 'c', s: '18:00', e: '18:40', bk: '밥', kind: '밥', note: '저녁', state: 'tentative' }), P({ id: 'd', date: '2026-10-12', s: '20:00', e: '20:30', bk: '준비', kind: '준비', note: '자기 전 준비', state: 'tentative' })];
await plan.render(host, ctx()); await flush(12);
const blk = (t) => [...host.querySelectorAll('.pl-blk')].find((b) => b.textContent.includes(t));
assert.match(blk('준비').className, /c-prep/); assert.equal(blk('준비').querySelector('.pl-tag').textContent, '준비');
assert.match(blk('점심').className, /c-meal/); assert.equal(blk('점심').querySelector('.pl-tag').textContent, '밥');
assert.match(blk('저녁').className, /c-plan/); assert.match(blk('자기 전 준비').className, /c-plan/);
assert.deepEqual([...host.querySelectorAll('.pl-legend .pl-leg')].map((x) => x.textContent.trim()), ['고정일정', '공부블록', '과제블록', '이동', '준비', '밥', '수면', '계획일정 (미확정)']);
assert.equal(blockCat({ k: 'plan', plan: plans[0] }), '준비'); assert.equal(blockCat({ k: 'plan', plan: plans[2] }), '계획');
// 6. 고치기: 확정 밥 → 시각·이름 고치기, 계획 준비 → 확정, 이동 → 밥 전환 때 이동 값 정리
click(blk('점심')); await flush(); assert.ok(popBtn('저장')); assert.equal(q('[aria-label="길이(분)"]').value, '40'); assert.equal(q('[aria-label="할 일"]').value, '점심');
setTime('12:30'); click(popBtn('저장')); await flush(); let u = lastUpd(); assert.deepEqual([u.id, u.bk, u.state, u.s, u.e, u.note, u.courseId], ['b', '밥', 'confirmed', '12:30', '13:10', '점심', '']);
click(blk('자기 전 준비')); await flush(); assert.ok(popBtn('확정')); click(popBtn('확정')); await flush(); u = lastUpd(); assert.deepEqual([u.id, u.state, u.bk], ['d', 'confirmed', '준비']);
plans = [P({ id: 'm', s: '15:00', e: '15:20', bk: '이동', kind: '이동', note: '집 → 학교', from: '집', to: '학교', est: true, state: 'confirmed' })];
await plan.render(host, ctx()); await flush(12);
click(blk('집 → 학교')); await flush(); click(q('[data-bk="밥"]')); await flush(); assert.equal(q('[aria-label="출발지"]').disabled, true); typeIn('[aria-label="할 일"]', '간식'); click(popBtn('저장')); await flush();
u = lastUpd(); assert.deepEqual([u.bk, u.kind, u.courseId, u.note], ['밥', '밥', '', '간식']); assert.ok(!('from' in u) && !('to' in u) && !('est' in u), '이동 전용 값이 정리됨');
console.log('plan-prep-dom ok');
process.exit(0);
