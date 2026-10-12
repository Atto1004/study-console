// 블록 창 정리(대표님 10/12 「근로장학 누르면 근로장학 텍스트만」): 기본 화면엔 이름·시각·쓸 수 있는 동작만, 원본 안내·합침 안내는 접힌 「자세히」 안에만
// 실행: NODE_PATH=<jsdom 경로> node school/plan-pop-dom.test.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mock } from 'node:test';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>', { pretendToBeVisual: true, url: 'http://127.0.0.1/' });
const w = dom.window;
for (const k of ['document', 'localStorage', 'requestAnimationFrame', 'innerWidth', 'innerHeight', 'getComputedStyle']) Object.defineProperty(globalThis, k, { value: w[k], configurable: true, writable: true });
globalThis.confirm = () => true;
mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-10-12T01:00:00Z') });
localStorage.setItem('school-plan-view', 'day');
globalThis.fetch = async (url, opt = {}) => {
  const json = (o) => ({ ok: true, status: 200, json: async () => o });
  if (String(url).startsWith('/api/cal')) return json({ ok: true, days: {} });
  if (String(url).startsWith('/api/health/sleep')) return json({ sleep: {}, tz: 'Asia/Seoul' });
  if (String(url).startsWith('/api/study/state')) return opt.method === 'POST' ? json({ workspaceRevision: 1 }) : json({ state: { v60: { sleep: sleepRec } } });
  throw new Error('unexpected fetch ' + url);
};
let sleepRec = { '2026-10-12': { bed: '23:40', wake: '07:30', src: 'app', bedAt: '2026-10-11T23:40:00+09:00', wakeAt: '2026-10-12T07:30:00+09:00' } };
const { createPlan } = await import('./plan.js');
const flush = async (n = 10) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
const ctx = { today: '2026-10-12', courses: ['정역학'], focus: () => true, scheduled: [{ id: 'a', courseId: 'c1', course: '정역학', date: '2026-10-12', s: '15:00', e: '16:30', room: '1공 409', record: {} }],
  classSlots: [], holidays: null, term: null, sessions: [], plans: [], calendarOk: true,
  calendar: [{ id: 'ad1', title: '종일 캘린더 일정', allDay: true, cal: '개인' }, { id: 'e1', title: '근로장학', start: '13:00', end: '15:00', allDay: false, cal: '일정' }],
  routine: { grid: { 월: [{ title: '근로장학', start: '13:00', end: '15:00', kind: 'work' }] } }, deadlines: [], courseName: () => '정역학', courseId: () => 'c1', exams: [], dailyCap: 4,
  calChange: async () => true, attend: async () => true };
const host = document.getElementById('h');
const plan = createPlan({ status: () => {} });
await plan.render(host, ctx); await flush();
const click = (e) => e.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 100, clientY: 100 }));
const BAD = /시간표에서 지우지|합쳤어요|움직이지 않는 일정|고정일정 —|기본 시간표에서만/;
const visible = () => { const c = document.querySelector('.pl-pop').cloneNode(true); c.querySelectorAll('details').forEach((d) => d.remove()); return c.textContent; };
const check = (label) => {
  const pop = document.querySelector('.pl-pop'); assert.ok(pop, label + ' 창');
  assert.ok(!BAD.test(visible()), `${label}: 기본 화면에 원본·합침·태그 설명 없음 → ` + visible());
  assert.ok(!pop.querySelector('.pl-tagline'), label + ': 종류 설명 줄 없음');
  const d = pop.querySelector('details.pl-more'); assert.ok(d && !d.open, label + ': 자세히 접힘');
  assert.match(d.textContent, /원본|기본 시간표|캘린더/, label + ': 자세히에는 원본 안내');
  document.querySelector('.pl-pop').remove();
};
const blocks = [...host.querySelectorAll('.pl-blk')];
const work = blocks.find((b) => b.classList.contains('k-cal') || b.classList.contains('k-work') ) ;
assert.ok(work, '근로장학 블록');
click(work); await flush(); 
{ const pop = document.querySelector('.pl-pop'); assert.match(visible(), /근로장학/); assert.match(visible(), /13:00–15:00/); 
  const also = pop.querySelector('.pl-also'); assert.ok(also && also.closest('details'), '합쳐진 원본 열기 버튼은 자세히 안에'); check('근로장학'); }
click(blocks.find((b) => b.classList.contains('k-class'))); await flush();
check('수업');
// 수면 3종(기록·취침만·계획)·종일 캘린더 창도 같은 기준
const seen = new Set();
const sleepCheck = async () => { for (const sl of [...host.querySelectorAll('.pl-blk.k-sleep')]) { click(sl); await flush(); const pop = document.querySelector('.pl-pop'); assert.ok(pop, '수면 창'); const title = pop.querySelector('b').textContent; seen.add(title);
  const d = pop.querySelector('details.pl-more'); assert.ok(d && !d.open, title + ': 자세히 접힘'); assert.ok(!/실제 잔 시간과 다를|출처|저장하지 않는 계산|목표를 바꾸면/.test(visible()), title + ': 보조 설명은 기본 화면에 없음 → ' + visible()); assert.ok(d.textContent.length > 10, title + ': 자세히에 내용'); pop.remove(); } };
await sleepCheck();
sleepRec = { '2026-10-12': { bed: '03:00', src: 'app', bedAt: '2026-10-12T03:00:00+09:00' } }; await plan.render(host, ctx); await flush(); await sleepCheck();
click(host.querySelector('.pl-bar button[aria-label="다음 날"]')); await flush(); await sleepCheck();
console.log('수면 창 종류:', [...seen].join(' | ')); assert.ok(seen.has('수면 기록') && seen.has('취침 기록') && seen.has('계획 수면'), '3종 모두 검사: ' + [...seen]);
click(host.querySelector('.pl-bar .pl-today')); await flush();
{ const ad = host.querySelector('.pl-ad'); assert.ok(ad, '종일 캘린더 막대'); click(ad); await flush(); const pop = document.querySelector('.pl-pop'); assert.ok(pop);
  const d = pop.querySelector('details.pl-more'); assert.ok(d && !d.open, '종일: 자세히 접힘'); assert.ok(!/개인|구글 캘린더/.test(visible()), '종일: 캘린더 이름·원본 안내는 기본 화면에 없음 → ' + visible()); assert.match(d.textContent, /개인/); pop.remove(); }
console.log('plan-pop-dom ok'); plan.destroy(); process.exit(0);
