// 시간표 화면 동작 검사(jsdom): 범례 · 블록 종류 표식 · 삭제 + 되돌리기 · 실패 경로 · 추천 숨기기 · 채운 것 지우기
// 실행: NODE_PATH=<jsdom 경로> node school/plan-blocks-dom.test.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mock } from 'node:test';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>', { pretendToBeVisual: true, url: 'http://127.0.0.1/' });
const w = dom.window;
for (const k of ['document', 'localStorage', 'requestAnimationFrame', 'innerWidth', 'innerHeight']) Object.defineProperty(globalThis, k, { value: w[k], configurable: true, writable: true });
globalThis.confirm = () => true;
mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-10-12T05:00:00Z') });   // KST 14:00

const posts = [];
globalThis.fetch = async (url, opt = {}) => {
  const json = (o) => ({ ok: true, status: 200, json: async () => o });
  if (String(url).startsWith('/api/cal')) return json({ ok: true, days: {} });
  if (String(url).startsWith('/api/study/state')) { if (opt.method === 'POST') { posts.push(JSON.parse(opt.body)); return json({ workspaceRevision: posts.length }); } return json({ state: JSON.parse(JSON.stringify(serverState)) }); }
  throw new Error('unexpected fetch ' + url);
};
let serverState = { v60: {} };
const { createPlan, toast: showToast } = await import('./plan.js');

const flush = async (n = 6) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
const calls = [];
const plans = [
  { id: 'fill1', date: '2026-10-12', s: '16:00', e: '17:00', courseId: 'c1', kind: '자동 채움', note: '과제 · HW5', src: 'fill', state: 'tentative', fb: 'b1' },
  { id: 'conf1', date: '2026-10-12', s: '18:00', e: '19:00', courseId: 'c1', kind: '시험 대비', note: '12.3', state: 'confirmed', bk: '공부' },
  { id: 'old1', date: '2026-10-12', s: '20:00', e: '21:00', courseId: 'c1', kind: '시험 대비', note: '옛 계획' },
  { id: 'hw1', date: '2026-10-12', s: '21:30', e: '22:30', courseId: 'c1', kind: '시험 대비', note: '과제 · 제출물', state: 'confirmed', bk: '과제' },
  { id: 'fix1', date: '2026-10-12', s: '12:00', e: '13:00', courseId: '', kind: '시험 대비', note: '병원', state: 'confirmed', bk: '고정', activity: true },
  { id: 'fillnext', date: '2026-10-14', s: '16:00', e: '17:00', courseId: 'c1', kind: '자동 채움', note: '시험 공부', src: 'fill', state: 'tentative' },
  { id: 'fillold', date: '2026-10-05', s: '16:00', e: '17:00', courseId: 'c1', kind: '자동 채움', note: '지난주', src: 'fill', state: 'tentative' },
];
let failDelete = false;
const ctx = () => ({
  today: '2026-10-12', courses: ['정역학'], focus: () => true, inClass: () => false, scheduled: [{ id: 'cl1', courseId: 'c1', course: '정역학', s: '09:00', e: '10:30', room: 'A101', record: {} }],
  classSlots: [], holidays: null, term: null, sessions: [], plans, calendarOk: true, calendar: [], routine: { grid: {} },
  deadlines: [{ course: '정역학', title: '정역학 HW6', deadlineDate: '2026-10-14', deadlineTime: '23:59', deadlineDays: 2, submitted: false, files: [] }],
  courseName: (id) => (id === 'c1' ? '정역학' : ''), courseId: (n) => (n === '정역학' ? 'c1' : undefined), exams: [], dailyCap: 4,
  addPlan: async (item, many) => { calls.push(['add', item, many]); return (many ? item : [item]).map((_, i) => 'new' + i); },
  updatePlan: async (item) => { calls.push(['update', item]); return true; },
  deletePlan: async (id) => { calls.push(['delete', id]); return failDelete ? false : true; },
  deletePlans: async (ids, guard) => { calls.push(['deleteMany', ids, guard]); return ids.filter((i) => i.startsWith('fill')); },
  restorePlans: async (ids) => { calls.push(['restore', ids]); return true; },
  attend: async () => true, reload: () => {},
});

const host = document.getElementById('h');
const plan = createPlan({ status: (m, bad) => calls.push(['status', m, !!bad]) });
await plan.render(host, ctx()); await flush();

const blk = (title) => [...host.querySelectorAll('.pl-blk')].find((b) => b.textContent.includes(title));
const click = (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 100, clientY: 100 }));
const popBtn = (text) => [...document.querySelectorAll('.pl-pop button')].find((b) => b.textContent.trim() === text || b.textContent.includes(text));

// 1. 범례: 4종 한 줄 + 접기
const leg = host.querySelector('.pl-legend');
assert.ok(leg, '범례가 보여야 함');
for (const n of ['고정일정', '공부블록', '과제블록', '계획일정']) assert.ok(leg.textContent.includes(n), n);
const tog = leg.querySelector('button'); assert.equal(tog.getAttribute('aria-expanded'), 'true'); assert.equal(tog.getAttribute('aria-controls'), 'pl-legend');
click(tog); await flush();
assert.ok(host.querySelector('.pl-legend-off'), '접히면 펴기 버튼만'); assert.equal(localStorage.getItem('school-plan-legend'), '0');
click(host.querySelector('.pl-legend-off button')); await flush();
assert.ok(host.querySelector('.pl-legend'));

// 2. 블록 종류 표식(글자) + 모양 클래스
const expect = [['수업', 'c-fixed', '고정'], ['병원', 'c-fixed', '고정'], ['HW5', 'c-plan', '계획'], ['12.3', 'c-study', '공부'], ['옛 계획', 'c-study', '공부'], ['제출물', 'c-hw', '과제']];
for (const [t, cls, tag] of expect) { const b = blk(t); assert.ok(b, t); assert.ok(b.classList.contains(cls), `${t} ${cls}`); assert.equal(b.querySelector('.pl-tag').textContent, tag, t); }
assert.ok(!host.querySelector('.c-unknown'), '분류 불명 0');
const auto = [...host.querySelectorAll('.k-auto')];
assert.ok(auto.length > 0 && auto.every((b) => b.classList.contains('c-plan')), '추천은 계획일정 모양');
// 눌러서 쓰는 일정 목록(짧거나 겹친 블록 대비)
assert.ok(host.querySelector('.pl-list'), '일정 목록'); assert.ok([...host.querySelectorAll('.pl-list button')].every((b) => b.getBoundingClientRect !== undefined));

// 3. 저장된 계획: 창에 삭제가 보이고, 한 번 누르면 지워지고 되돌리기 토스트
click(blk('옛 계획')); await flush();
let del = popBtn('삭제'); assert.ok(del, '삭제 버튼'); assert.ok(del.classList.contains('danger'));
click(del); await flush();
assert.deepEqual(calls.filter((c) => c[0] === 'delete'), [['delete', 'old1']]);
let toast = document.querySelector('.pl-toast'); assert.ok(toast, '되돌리기 토스트'); assert.equal(toast.getAttribute('role'), 'status');
click(toast.querySelector('button')); click(toast.querySelector('button')); await flush();   // 두 번 눌러도 한 번만
assert.deepEqual(calls.filter((c) => c[0] === 'restore'), [['restore', ['old1']]]);
assert.ok(!document.querySelector('.pl-toast'), '되돌린 뒤 토스트 닫힘');
assert.ok(!document.querySelector('.pl-pop'), '창 닫힘');

// 4. 삭제 실패: 토스트 없음, 버튼은 다시 눌러볼 수 있음, 창은 그대로
failDelete = true; calls.length = 0;
click(blk('12.3')); await flush();
del = popBtn('삭제'); click(del); await flush();
assert.ok(!document.querySelector('.pl-toast'), '실패하면 지웠다는 토스트 없음');
assert.ok(document.querySelector('.pl-pop') && !popBtn('삭제').disabled, '창 유지·재시도 가능');
failDelete = false; document.querySelector('.pl-pop').remove();

// 5. 계획(미확정) 창: 확정 버튼 + 종류 + 안내. 확정하면 state/bk 를 보냄
calls.length = 0;
click(blk('HW5')); await flush();
assert.ok(popBtn('확정'), '확정 버튼'); assert.ok(document.querySelector('.pl-pop').textContent.includes('눌러서 확정할 수 있어요'));
click([...document.querySelectorAll('.pl-pop [data-bk]')].find((b) => b.dataset.bk === '과제'));
click(popBtn('확정')); await flush();
const upd = calls.find((c) => c[0] === 'update'); assert.ok(upd);
assert.equal(upd[1].id, 'fill1'); assert.equal(upd[1].state, 'confirmed'); assert.equal(upd[1].bk, '과제'); assert.equal(upd[1].src, 'fill'); assert.equal(upd[1].fb, 'b1');   // 출처·묶음은 그대로

// 6. 캘린더·수업·시험 같은 원본 블록: 삭제 버튼 없이 원본 안내
click(blk('수업')); await flush();
assert.ok(!popBtn('삭제'), '수업엔 삭제 버튼 없음'); assert.ok(document.querySelector('.pl-pop').textContent.includes('시간표에서 지우지 않아요'));
document.querySelector('.pl-pop').remove();

// 7. 추천 숨기기: 저장 → 그 블록이 사라지고(다시 짜기 눌러도 안 살아남), 토스트로 되돌리기
const a0 = auto[0]; click(a0); await flush();
const hide = popBtn('이 추천 숨기기'); assert.ok(hide, '추천 숨기기'); assert.ok(popBtn('넣기'), '계획으로 넣기도 그대로');
posts.length = 0; click(hide); await flush(10);
const last = posts[posts.length - 1]; assert.ok(last, '저장됨');
const hid = last.state.v60.hideAuto['2026-10-12']; assert.deepEqual(hid, ['정역학|정역학 HW6']);
assert.equal(host.querySelectorAll('.k-auto').length, 0, '숨긴 추천은 다시 그려도 없음');
const replan = [...host.querySelectorAll('.pl-ib')].find((b) => b.getAttribute('aria-label')?.startsWith('다시 짜기')); click(replan); await flush();
assert.equal(host.querySelectorAll('.k-auto').length, 0, '다시 짜기를 눌러도 안 되살아남');
toast = document.querySelector('.pl-toast'); assert.ok(toast.textContent.includes('추천을 숨겼어요'));
click(toast.querySelector('button')); await flush(10);
assert.ok(host.querySelectorAll('.k-auto').length > 0, '되돌리면 추천이 돌아옴');
assert.deepEqual(posts[posts.length - 1].state.v60.hideAuto ?? {}, {});

// 8. 시간표 메뉴: 이번 주 + 오늘 이후 + 채우기 표식 + 계획(미확정)만 센다
calls.length = 0; click(host.querySelector('[aria-haspopup=dialog]')); await flush();
const erase = popBtn('자동으로 채운 것 지우기');
assert.ok(erase.textContent.includes('(2개)'), erase.textContent);   // fill1(오늘)·fillnext(수) 만. 지난주 fillold·확정·표식 없는 옛 계획은 안 센다
click(erase); await flush();
assert.deepEqual(calls.filter((c) => c[0] === 'deleteMany'), [['deleteMany', ['fill1', 'fillnext'], 'fill']]);
toast = document.querySelector('.pl-toast'); assert.ok(toast.textContent.includes('채운 계획 2개를 지웠어요'));
click(toast.querySelector('button')); await flush();
assert.deepEqual(calls.filter((c) => c[0] === 'restore').pop(), ['restore', ['fill1', 'fillnext']]);

// 9. 채우기: 계획(미확정)으로, 출처·묶음 표식과 함께 저장하고 「채운 N개 되돌리기」 토스트
calls.length = 0;
plans.length = 0; plans.push({ id: 'conf1', date: '2026-10-12', s: '18:00', e: '19:00', courseId: 'c1', kind: '시험 대비', note: '12.3', state: 'confirmed', bk: '공부' });
await plan.render(host, ctx()); await flush();
click([...host.querySelectorAll('.pl-fill')][0]); await flush(10);
const added = calls.filter((c) => c[0] === 'add'); assert.ok(added.length > 0, '채우기가 계획을 넣음');
for (const [, items, many] of added) { assert.equal(many, true); for (const it of items) { assert.equal(it.src, 'fill'); assert.equal(it.state, 'tentative'); assert.match(it.fb, /^[0-9a-z]{1,24}$/); } }
toast = document.querySelector('.pl-toast'); const n = added.reduce((a, c) => a + c[1].length, 0);
assert.ok(toast.textContent.includes(`채운 ${n}개 되돌리기`), toast.textContent);
click(toast.querySelector('button')); await flush();
assert.equal(calls.filter((c) => c[0] === 'deleteMany').pop()[2], 'fill');

// 10. 토스트 타이머: 포인터·초점·요청 중이면 안 닫히고, 모두 풀렸을 때만 닫힌다 / 실패하면 남아서 다시 누를 수 있다
{
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let tries = 0; const t = showToast('시험', '되돌리기X', async () => (++tries === 1 ? false : true), 60);
  t.dispatchEvent(new w.Event('pointerenter')); await wait(150); assert.ok(document.querySelector('.pl-toast'), '손가락이 올라가 있으면 안 닫힘');
  t.dispatchEvent(new w.Event('focusin')); t.dispatchEvent(new w.Event('pointerleave')); await wait(150); assert.ok(document.querySelector('.pl-toast'), '초점이 남아 있으면 안 닫힘');
  const btn = t.querySelector('button'); click(btn); await flush(); assert.ok(document.querySelector('.pl-toast') && !btn.disabled, '실패하면 남고 다시 누를 수 있음');
  await wait(150); assert.ok(document.querySelector('.pl-toast'), '실패 뒤에도 초점이 있으면 안 닫힘');
  click(btn); await flush(); assert.equal(tries, 2); assert.ok(!document.querySelector('.pl-toast'), '성공하면 닫힘');
  const t2 = showToast('시험2', '되돌리기Y', async () => true, 60); await wait(150); assert.ok(!document.querySelector('.pl-toast'), '아무것도 없으면 시간 뒤 닫힘'); void t2;
}

// 10b. 작업이 끝나기 전에 새 토스트로 바뀐 뒤 이전 작업이 실패해도 새 토스트의 타이머·상태를 건드리지 않는다(오타 2차 재현)
{
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const tA = showToast('A', '되돌리기A', async () => { await wait(100); return false; }, 60);
  click(tA.querySelector('button')); await wait(10);
  const tB = showToast('B', '되돌리기B', async () => true, 400); await wait(150);   // A 의 작업이 실패로 끝난 뒤
  assert.ok(document.querySelector('.pl-toast') === tB, 'A 가 실패해도 B 는 그대로');
  await wait(150); assert.ok(document.querySelector('.pl-toast') === tB, 'A 의 타이머(60ms)가 B 를 닫지 않음');
  await wait(300); assert.ok(!document.querySelector('.pl-toast'), 'B 는 자기 시간(400ms)에 닫힘');
}

// 11. 채운 계획이 200개를 넘어도 200개씩 나눠 지운다(서버 상한) — 메뉴도 전체 개수를 보여 주고 전부 처리
calls.length = 0; plans.length = 0;
for (let i = 0; i < 450; i++) plans.push({ id: 'fl' + i, date: '2026-10-14', s: '10:00', e: '10:30', courseId: 'c1', note: 'x', src: 'fill', state: 'tentative' });
ctx().plans = plans; await plan.render(host, ctx()); await flush();
click(host.querySelector('.pl-bar [aria-label^="시간표 메뉴"]')); await flush();
const big = popBtn('자동으로 채운 것 지우기'); assert.ok(big.textContent.includes('(450개)'), big.textContent);
click(big); await flush(10);
assert.deepEqual(calls.filter((c) => c[0] === 'deleteMany').map((c) => c[1].length), [200, 200, 50]);

console.log('plan-blocks-dom ok');
process.exit(0);
