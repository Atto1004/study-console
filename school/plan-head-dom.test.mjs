// 시간표 머리(대표님 10/12): 제목 ALiVEWEEK · 날짜 버튼 · 오늘 칩 // (틀: 지금 하는 일 시험)
// : 상태 선택·출석 뒤 수업 중·정지/재생·종료(블록 단축·표식·되돌리기)·자동 전환·키 저장
// 실행: NODE_PATH=<jsdom 경로> node school/plan-now-dom.test.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mock } from 'node:test';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>', { pretendToBeVisual: true, url: 'http://127.0.0.1/' });
const w = dom.window;
for (const k of ['document', 'localStorage', 'requestAnimationFrame', 'innerWidth', 'innerHeight', 'getComputedStyle']) Object.defineProperty(globalThis, k, { value: w[k], configurable: true, writable: true });
let confirms = []; globalThis.confirm = (m) => { confirms.push(m); return true; };
mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-10-12T05:00:00Z') });   // KST 14:00
const at = (hh, mm) => mock.timers.setTime(Date.parse(`2026-10-12T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00+09:00`));
localStorage.setItem('school-plan-view', 'day');
let serverState = { v60: {} }, conflictOnce = false;
globalThis.fetch = async (url, opt = {}) => {
  const json = (o) => ({ ok: true, status: 200, json: async () => o });
  if (String(url).startsWith('/api/cal')) return json({ ok: true, days: {} });
  if (String(url).startsWith('/api/health/sleep')) return json({ sleep: {}, tz: 'Asia/Seoul' });
  if (String(url).startsWith('/api/study/state')) { if (opt.method === 'POST') { if (conflictOnce) { conflictOnce = false; return { ok: false, status: 409, json: async () => ({ error: 'conflict' }) }; } serverState = JSON.parse(opt.body).state; return json({ workspaceRevision: 1 }); } return json({ state: JSON.parse(JSON.stringify(serverState)) }); }
  throw new Error('unexpected fetch ' + url);
};
const { createPlan } = await import('./plan.js');
const flush = async (n = 12) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
const calls = [];
const mkctx = (over = {}) => ({ today: '2026-10-12', courses: ['정역학'], focus: () => true, inClass: () => false,
  scheduled: [], classSlots: [], holidays: null, term: null, sessions: [], plans: [], calendarOk: true, calendar: [],
  routine: { grid: { 월: [{ id: 'w1', title: '근로장학', start: '13:00', end: '15:00', kind: 'work' }] } }, deadlines: [], courseName: () => '정역학', courseId: () => 'c1', exams: [], dailyCap: 4,
  attend: async (...a) => { calls.push(a); return true; }, ...over });
const host = document.getElementById('h');
const plan = createPlan({ status: (m, bad) => calls.push(['status', m, !!bad]) });
const show = async (over) => { await plan.render(host, mkctx(over)); await flush(); };
const bar = () => host.querySelector('.pl-nowdo');
const st = () => bar().querySelector('.pl-nowst').textContent;
const btn = (label) => [...bar().querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || b.textContent).startsWith(label));
const click = (e) => e.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 50, clientY: 50 }));
const bar2 = () => host.querySelector('.pl-bar'), tdy = () => bar2().querySelector('.pl-today'), chip = () => bar2().querySelector('.pl-todaychip');
await show();
assert.equal(host.querySelector('.pl-schedule .pl-head h2').textContent, 'ALiVEWEEK'); assert.equal(host.querySelector('.pl-schedule .pl-head small'), null, '왼쪽 위 날짜 줄 없음');
assert.equal(tdy().textContent, '10/12(월)'); assert.equal(chip(), null, '오늘이면 칩 없음');
click(bar2().querySelector('button[aria-label="다음 날"]')); await flush();
assert.equal(tdy().textContent, '10/13(화)'); assert.ok(chip(), '다른 날엔 오늘 칩'); assert.equal(chip().textContent, '오늘');
click(chip()); await flush(); assert.equal(tdy().textContent, '10/12(월)'); assert.equal(chip(), null);
click(bar2().querySelector('button[aria-label="다음 날"]')); await flush(); click(tdy()); await flush(); assert.equal(tdy().textContent, '10/12(월)', '날짜 버튼도 오늘로');
// 주 보기: 주 범위, 다른 주에선 「이번 주」 칩
click(host.querySelector('button[aria-label="한 주"]')); await flush();
assert.equal(tdy().textContent, '10/12–10/18'); assert.equal(chip(), null);
click(bar2().querySelector('button[aria-label="다음 주"]')); await flush(); assert.equal(tdy().textContent, '10/19–10/25'); assert.equal(chip().textContent, '이번 주');
click(chip()); await flush(); assert.equal(tdy().textContent, '10/12–10/18');
console.log('plan-head-dom ok'); plan.destroy(); process.exit(0);
