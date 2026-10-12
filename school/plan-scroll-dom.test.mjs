// 시간표를 다시 그려도 격자 안 스크롤·열어 둔 일정 목록이 유지되는지, 처음 그릴 땐 afterDraw 가 불리는지(대표님 10/12 「저장하면 맨 위로 감」)
// 실행: NODE_PATH=<jsdom 경로> node school/plan-scroll-dom.test.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mock } from 'node:test';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>', { pretendToBeVisual: true, url: 'http://127.0.0.1/' });
const w = dom.window;
for (const k of ['document', 'localStorage', 'requestAnimationFrame', 'innerWidth', 'innerHeight', 'getComputedStyle']) Object.defineProperty(globalThis, k, { value: w[k], configurable: true, writable: true });
globalThis.confirm = () => true;
mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-10-12T05:00:00Z') });
localStorage.setItem('school-plan-view', 'day');
globalThis.fetch = async (url, opt = {}) => {
  const json = (o) => ({ ok: true, status: 200, json: async () => o });
  if (String(url).startsWith('/api/cal')) return json({ ok: true, days: {} });
  if (String(url).startsWith('/api/health/sleep')) return json({ sleep: {}, tz: 'Asia/Seoul' });
  if (String(url).startsWith('/api/study/state')) return opt.method === 'POST' ? json({ workspaceRevision: 1 }) : json({ state: { v60: {} } });
  throw new Error('unexpected fetch ' + url);
};
const { createPlan } = await import('./plan.js');
const flush = async (n = 10) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
let drawn = 0;
const ctx = { today: '2026-10-12', courses: [], focus: () => true, scheduled: [], classSlots: [], holidays: null, term: null, sessions: [], plans: [], calendarOk: true, calendar: [], routine: { grid: {} }, deadlines: [], courseName: () => '', courseId: () => null, exams: [], dailyCap: 4, afterDraw: () => { drawn++; } };
const host = document.getElementById('h');
const plan = createPlan({ status: () => {} });
await plan.render(host, ctx); await flush();
assert.ok(drawn >= 1, '처음 그린 뒤 afterDraw 가 불림');
const grid = () => host.querySelector('.pl-schedule .pl-day');
grid().scrollTop = 333; grid().dispatchEvent(new w.Event('scroll'));
host.querySelector('.pl-list')?.setAttribute('open', '');
const had = !!host.querySelector('.pl-list');
host.querySelector('.pl-bar button[aria-label^="다시 짜기"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
await flush();
assert.equal(grid().scrollTop, 333, '다시 그려도 격자 안 스크롤 유지');
if (had) assert.ok(host.querySelector('.pl-list').open, '열어 둔 일정 목록 유지');
// 「오늘」을 누르면 처음 규칙(지금 시각)으로 돌아간다 — 유지 기록이 지워짐
host.querySelector('.pl-bar .pl-today').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
await flush();
await new Promise((r) => setTimeout(r, 120));
assert.notEqual(grid().scrollTop, 333, '「오늘」은 격자를 지금 시각 규칙으로 되돌림(유지 기록 취소)');
console.log('plan-scroll-dom ok'); plan.destroy(); process.exit(0);
