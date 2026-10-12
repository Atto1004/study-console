// 과거/미래 규칙 화면 검사(jsdom): 지난 시각은 계획 불가, 지난 계획은 「계획대로 확정됨」, 지난 확정 삭제는 두 번 확인, 미래 확정 안내·범례 한 줄.
// 실행: NODE_PATH=<jsdom 경로> node school/plan-past-dom.test.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mock } from 'node:test';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>', { pretendToBeVisual: true, url: 'http://127.0.0.1/' });
const w = dom.window;
for (const k of ['document', 'localStorage', 'requestAnimationFrame', 'innerWidth', 'innerHeight']) Object.defineProperty(globalThis, k, { value: w[k], configurable: true, writable: true });
let askAnswer = true; const asked = [];
globalThis.confirm = (m) => { asked.push(m); return askAnswer; };
mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-10-12T05:00:00Z') });   // KST 월 14:00
localStorage.setItem('school-plan-view', 'day');
globalThis.fetch = async (url) => {
  const json = (o) => ({ ok: true, status: 200, json: async () => o });
  if (String(url).startsWith('/api/cal')) return json({ ok: true, days: {} });
  if (String(url).startsWith('/api/health/sleep')) return json({ sleep: {}, tz: 'Asia/Seoul' });
  if (String(url).startsWith('/api/study/state')) return json({ state: { v60: {} } });
  throw new Error('unexpected fetch ' + url);
};
const { createPlan, planLapsed, planEndMs, blockCat } = await import('./plan.js');
const flush = async (n = 8) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
const calls = [];
const P = (o) => ({ id: 'p', date: '2026-10-12', s: '10:00', e: '11:00', courseId: 'c1', kind: '자동 채움', note: '과제 · 숙제', done: false, source: '직접 계획', ...o });
const plans = [P({ id: 'lap', state: 'tentative', bk: '과제', src: 'fill' }), P({ id: 'fut', s: '17:00', e: '18:00', state: 'tentative', bk: '과제', note: '과제 · 미래' }),
  P({ id: 'cpast', s: '08:00', e: '09:00', state: 'confirmed', bk: '공부', note: '아침 공부' }), P({ id: 'cfut', s: '19:00', e: '20:00', state: 'confirmed', bk: '공부', note: '저녁 공부' })];
const ctx = () => ({ today: '2026-10-12', courses: ['정역학'], focus: () => true, scheduled: [], classSlots: [], holidays: null, term: null, sessions: [], plans, calendarOk: true, calendar: [], routine: { grid: {} }, deadlines: [], courseName: (id) => ({ c1: '정역학' }[id] || ''), courseId: (n) => ({ 정역학: 'c1' }[n]), exams: [], dailyCap: 4,
  addPlan: async (i) => { calls.push(['add', i]); return ['n']; }, updatePlan: async (i) => { calls.push(['update', i]); return true; }, deletePlan: async (id) => { calls.push(['delete', id]); return true; }, deletePlans: async () => [], restorePlans: async () => true, attend: async () => true });
const host = document.getElementById('h');
const plan = createPlan({ status: (m, bad) => calls.push(['status', m, !!bad]) });
await plan.render(host, ctx()); await flush(12);
const click = (e) => e.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 200, clientY: 300 }));
const popBtn = (t) => [...document.querySelectorAll('.pl-pop button')].find((b) => b.textContent.trim() === t);
const blk = (txt) => [...host.querySelectorAll('.pl-blk')].find((b) => b.textContent.includes(txt));
const closePop = () => document.querySelector('.pl-pop')?.remove();

// 순수 함수
const NOW = Date.parse('2026-10-12T14:00:00+09:00');
assert.equal(planEndMs(P({ e: '11:00' })), Date.parse('2026-10-12T11:00:00+09:00'));
assert.equal(planLapsed(P({ state: 'tentative' }), NOW), true); assert.equal(planLapsed(P({ state: 'tentative', e: '14:00' }), NOW), true, '끝이 지금과 같으면 지난 것');
assert.equal(planLapsed(P({ state: 'tentative', e: '14:01' }), NOW), false); assert.equal(planLapsed(P({ state: 'confirmed' }), NOW), false); assert.equal(planLapsed(P({ state: 'tentative', done: true }), NOW), false);
assert.equal(planLapsed({ date: 'x', e: '1', state: 'tentative' }, NOW), false, '이상한 값은 지난 것으로 보지 않음');
assert.equal(blockCat({ k: 'plan', plan: P({ state: 'tentative', bk: '과제' }), lapsed: true }), '계획', '지난 계획도 수행을 확인하기 전엔 계획 모양');

// 1. 시간표: 지난 계획은 확정 모양 + 표식, 미래 계획은 그대로 점선
assert.match(blk('과제 · 숙제').className, /c-plan/); assert.match(blk('과제 · 숙제').className, /lapsed/); assert.match(blk('과제 · 숙제').textContent, /지난 계획/); assert.match(blk('과제 · 숙제').textContent, /수행 확인 필요 · 했어요?/);
assert.match(blk('과제 · 미래').className, /c-plan/); assert.doesNotMatch(blk('과제 · 미래').textContent, /지난 계획/);
assert.match(host.querySelector('.pl-flow').textContent, /계획 → 확정 → 지나면 기록/);
// 2. 지난 계획 창: 했어요 / 안 했어요
click(blk('과제 · 숙제')); await flush();
assert.ok(popBtn('했어요') && popBtn('안 했어요')); assert.match(document.querySelector('.pl-pop').textContent, /실제로 했는지는 기록돼 있지 않아요/);
assert.equal(popBtn('저장').disabled, false, '시각·상태가 그대로면 지난 계획의 다른 칸은 고칠 수 있다(서버와 같은 비교)');
const tin = document.querySelector('.pl-pop input[type=time]'); tin.value = '09:00'; tin.dispatchEvent(new w.Event('input', { bubbles: true })); assert.equal(popBtn('저장').disabled, true, '시각을 옮기면(여전히 지난 시각의 계획) 못 저장'); tin.value = '10:00'; tin.dispatchEvent(new w.Event('input', { bubbles: true })); assert.equal(popBtn('저장').disabled, false);
asked.length = 0; click(popBtn('안 했어요')); await flush();
assert.deepEqual(calls.filter((c) => c[0] === 'delete'), [['delete', 'lap']]); assert.equal(asked.length, 0, '안 했어요는 한 번 누르면 끝(되돌리기는 토스트)');
closePop(); calls.length = 0;
click(blk('과제 · 숙제')); await flush(); click(popBtn('했어요')); await flush();
const upd = calls.find((c) => c[0] === 'update')?.[1]; assert.equal(upd.state, 'confirmed'); assert.equal(upd.id, 'lap'); assert.equal(upd.s, '10:00');
closePop(); calls.length = 0;
// 3. 미래 계획 창은 그대로: 확정 버튼
click(blk('과제 · 미래')); await flush(); assert.ok(popBtn('확정')); assert.ok(!popBtn('안 했어요')); closePop();
// 4. 지난 확정 삭제는 두 번 확인, 미래 확정은 한 번
click(blk('아침 공부')); await flush(); assert.match(document.querySelector('.pl-pop').textContent, /지난 확정 일정은 기록이에요/);
asked.length = 0; askAnswer = false; click(document.querySelector('.pl-pop .danger')); await flush();
assert.equal(asked.length, 1); assert.match(asked[0], /기록이에요/); assert.equal(calls.filter((c) => c[0] === 'delete').length, 0, '아니오면 안 지움');
askAnswer = true; click(document.querySelector('.pl-pop .danger')); await flush(); assert.deepEqual(calls.filter((c) => c[0] === 'delete'), [['delete', 'cpast']]);
closePop(); calls.length = 0; asked.length = 0;
click(blk('저녁 공부')); await flush(); assert.match(document.querySelector('.pl-pop').textContent, /미래 확정은 바뀔 수 있어요/);
click(document.querySelector('.pl-pop .danger')); await flush(); assert.equal(asked.length, 0, '미래 확정 삭제는 확인 없이'); assert.deepEqual(calls.filter((c) => c[0] === 'delete'), [['delete', 'cfut']]);
closePop(); calls.length = 0;
// 5. 새 일정 창: 계획 모드에서 지난 시각이면 계획 비활성 + 확정으로, 미래로 고치면 다시 선택 가능
const plus = document.getElementById('pl-fab');
const pm = host.querySelector('.pl-mode:not(.pl-fill)'); if (pm.getAttribute('aria-pressed') !== 'true') click(pm); await flush();
click(plus); await flush();
const mode = (k) => [...document.querySelectorAll('.pl-pop [aria-label="넣는 방식"] button')].find((b) => b.dataset.mode === k);
const t = document.querySelector('.pl-pop input[type=time]');
t.value = '16:00'; t.dispatchEvent(new w.Event('input', { bubbles: true })); assert.equal(mode('계획').disabled, false); assert.equal(mode('계획').getAttribute('aria-pressed'), 'true');
t.value = '09:00'; t.dispatchEvent(new w.Event('input', { bubbles: true }));
assert.equal(mode('계획').disabled, true); assert.equal(mode('확정').getAttribute('aria-pressed'), 'true', '확정으로 바뀜'); assert.match(document.querySelector('.pl-pop').textContent, /이미 지난 시각이라 계획으로 넣을 수 없어요/);
assert.equal(popBtn('확정으로 넣기') != null, true);
// 끝이 아직 안 지난 진행 중 시각(13:30 + 60분)은 계획 가능
t.value = '13:30'; t.dispatchEvent(new w.Event('input', { bubbles: true })); assert.equal(mode('계획').disabled, false);
// 지난 시각 확정 저장 = state confirmed
t.value = '09:00'; t.dispatchEvent(new w.Event('input', { bubbles: true }));
document.querySelector('.pl-pop [aria-label="할 일"]').value = '아침에 한 것';
document.querySelector('.pl-pop').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })); await flush();
const added = calls.find((c) => c[0] === 'add')?.[1]; assert.equal(added.state, 'confirmed'); assert.equal(added.s, '09:00');
console.log('plan-past-dom ok');
process.exit(0);
