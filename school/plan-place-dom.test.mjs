// 위치 열 화면(jsdom): 이동 일정 → 「서울 → 안산」·「안산」 막대(핀 SVG, 이모지 없음), 계획은 점선, 기록 우선, 한 주 보기 좁은 줄. 실행: NODE_PATH=<jsdom 경로> node school/plan-place-dom.test.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mock } from 'node:test';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>', { pretendToBeVisual: true, url: 'http://127.0.0.1/' });
const w = dom.window;
for (const k of ['document', 'localStorage', 'requestAnimationFrame', 'innerWidth', 'innerHeight']) Object.defineProperty(globalThis, k, { value: w[k], configurable: true, writable: true });
globalThis.confirm = () => true;
mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-10-12T05:00:00Z') });   // KST 월 14:00
localStorage.setItem('school-plan-view', 'day');
let serverState = { v60: { place: { '2026-10-12': [{ t: '12:00', p: '도서관' }] } } };
globalThis.fetch = async (url, opt = {}) => {
  const json = (o) => ({ ok: true, status: 200, json: async () => o });
  if (String(url).startsWith('/api/cal')) return json({ ok: true, days: {} });
  if (String(url).startsWith('/api/health/sleep')) return json({ sleep: {}, tz: 'Asia/Seoul' });
  if (String(url).startsWith('/api/study/state')) { if (opt.method === 'POST') { serverState = JSON.parse(opt.body).state; return json({ workspaceRevision: 1 }); } return json({ state: JSON.parse(JSON.stringify(serverState)) }); }
  throw new Error('unexpected fetch ' + url);
};
const { createPlan } = await import('./plan.js');
const flush = async (n = 8) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
const P = (o) => ({ id: 'p', date: '2026-10-12', courseId: '', kind: '이동', note: '', done: false, source: '직접 계획', bk: '이동', activity: true, ...o });
const plans = [P({ id: 'm1', s: '08:00', e: '09:30', from: '서울', to: '안산', state: 'confirmed', note: '서울 → 안산' }), P({ id: 'm2', s: '18:00', e: '19:00', from: '안산', to: '서울', state: 'tentative', note: '안산 → 서울' }),
  P({ id: 'm0', date: '2026-10-11', s: '20:00', e: '21:00', from: '부산', to: '서울', state: 'confirmed' })];
const ctx = () => ({ today: '2026-10-12', courses: [], focus: () => true, scheduled: [], classSlots: [], holidays: null, term: null, sessions: [], plans, calendarOk: true, calendar: [], routine: { grid: {} }, deadlines: [], courseName: () => '', courseId: () => null, exams: [], dailyCap: 4, addPlan: async () => [], updatePlan: async () => true, deletePlan: async () => true, deletePlans: async () => [], restorePlans: async () => true, attend: async () => true });
const host = document.getElementById('h');
const plan = createPlan({ status: () => {} });
await plan.render(host, ctx()); await flush(12);
const lane = () => host.querySelector('.pl-grid .pl-lane');
const derived = () => [...lane().querySelectorAll('.pl-place.derived')].map((e) => [e.classList.contains('mv') ? 'move' : 'group', e.textContent.replace(/\s+/g, ' ').trim(), e.classList.contains('plan') ? 'plan' : 'ok', e.querySelector('svg') != null]);
// 하루 보기: 어제 부산 → 안산 이동의 도착지(안산)는 오늘 첫 이동의 출발지(서울)와 달라 앞 구간을 비운다, 08:00 서울 → 안산, 안산 묶음은 12시부터 기록(도서관)이 덮음
const d = derived(); console.log(JSON.stringify(d));
assert.deepEqual(d.map((x) => x[0] + ':' + x[1]), ['group:서울', 'move:서울→안산', 'group:안산', 'group:안산', 'move:안산→서울', 'group:서울'], '12:00~지금은 기록(도서관)이 덮고, 지금 이후는 이동 일정으로 다시 이어짐');
assert.equal(d.every((x) => x[3]), true, '핀은 SVG'); assert.ok(!/[\u{1F4CD}\u{1F4CC}]/u.test(lane().textContent), '이모지 없음');
assert.deepEqual(d.map((x) => x[2]), ['ok', 'ok', 'ok', 'ok', 'plan', 'plan'], '계획 이동과 그 도착지 묶음은 점선');
// 기록(도서관 12시~지금)이 우선: 12:00 이후 지금까지는 기록 막대만, 안산 묶음은 12:00 에서 끊김
const rec = [...lane().querySelectorAll('.pl-place:not(.derived)')]; assert.equal(rec.length, 1); assert.match(rec[0].textContent, /도서관/);
const grp = [...lane().querySelectorAll('.pl-place.derived.grp')].find((e) => /안산/.test(e.textContent)); assert.equal(Math.round(parseFloat(grp.style.top) + parseFloat(grp.style.height)) <= 12 * 54 + 1, true, '안산 묶음은 12:00 에서 끝남');
// 기존 기능: 위치 기록 지우기는 그대로
rec[0].dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await flush(12);
assert.equal(serverState.v60.place['2026-10-12'].length, 0, '기록 지우기');
assert.ok([...host.querySelectorAll('.pl-placebar button')].some((b) => b.textContent === '집'), '지금 위치 버튼은 그대로');
// 한 주 보기: 날짜 열마다 좁은 줄(아이콘), 이동 블록 폭은 줄 만큼 좁아짐
[...host.querySelectorAll('.pl-seg button')].find((b) => b.getAttribute('aria-label') === '한 주').dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await flush(12);
const col = host.querySelector('.pl-wkcol[data-date="2026-10-12"]'); assert.ok(col.classList.contains('has-lane')); const nl = col.querySelector('.pl-lane.narrow'); assert.ok(nl && nl.querySelectorAll('.pl-place.derived svg').length >= 4);
assert.equal(host.querySelector('.pl-wkcol[data-date="2026-10-13"]').classList.contains('has-lane'), false, '이동이 없는 날은 줄 없음');
console.log('plan-place-dom ok');
process.exit(0);
