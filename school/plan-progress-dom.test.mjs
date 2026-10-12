// 진행 상태 확장(대표님 10/12): 수업 종료 비교(초 단위) · 종료 뒤 자동 이동 중 · 도착 칩과 위치·이동 기록 · 이동 일정 도착 · 위치 열(강의실)
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
const at = (hh, mm, ss = 0) => mock.timers.setTime(Date.parse(`2026-10-12T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}+09:00`));
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
const workBlk = () => [...host.querySelectorAll('.pl-blk')].find((b) => b.textContent.includes('근로장학'));
const cls = (status) => ({ scheduled: [{ id: 'a', courseId: 'c1', course: '정역학', date: '2026-10-12', s: '15:00', e: '16:30', room: '1공 409', record: status ? { status } : {} }], routine: { grid: {} } });
const prior = (d, sec, endedAt) => ({ course: '정역학', date: d, endedAt, endedAtISO: d + 'T07:00:00Z', actualSec: sec, plannedStart: '15:00', plannedEnd: '16:30' });
const toastText = () => document.querySelector('.pl-toast')?.textContent || '';
// 1. 수업 종료 비교: 이전 2회(5280초·4800초, 평균 5040) + 오늘 16:25:48(5148초) → 평균보다 1분 48초 늦게, 저번(4800)보다 5분 48초 늦게
serverState = { v60: { classLog: { p1: prior('2026-09-28', 5280, '16:28'), p2: prior('2026-10-05', 4800, '16:20') } } };
at(16, 25, 48); await show(cls('present')); click(btn('종료')); await flush();
const rec = serverState.v60.classLog.a; assert.equal(rec.endedAt, '16:25'); assert.equal(rec.actualSec, 5148); assert.match(rec.endedAtISO, /^2026-10-12T07:25:48/); assert.equal(rec.plannedStart, '15:00'); assert.equal(rec.plannedEnd, '16:30');
assert.match(toastText(), /오늘은 평소보다 1분 48초 늦게 끝났어요 ㅠㅠ/); assert.match(toastText(), /저번 시간보다 5분 48초 늦게 끝났어요/);
// 1b. 빨리 끝난 날(5148 → 4788초 = 16:19:48): 「평소보다 4분 12초 빨리」
serverState = { v60: { classLog: { p1: prior('2026-09-28', 5280, '16:28'), p2: prior('2026-10-05', 4800, '16:20') } } };
at(16, 19, 48); await show(cls('present')); click(btn('종료')); await flush(); assert.match(toastText(), /오늘은 평소보다 4분 12초 빨리 끝났네요!/);
// 1c. 기록 1회뿐이면 쌓이는 중
serverState = { v60: { classLog: { p1: prior('2026-09-28', 5280, '16:28') } } }; at(16, 25, 48); await show(cls('present')); click(btn('종료')); await flush(); assert.match(toastText(), /기록이 쌓이는 중이에요 · 평균은 3회부터/); assert.ok(!/평소보다/.test(toastText()));
// 1d. 되돌리기는 초 단위 필드도 지운다
click(document.querySelector('.pl-toast button')); await flush(); { const l = serverState.v60.classLog.a || {}; assert.equal(l.endedAt, undefined); assert.equal(l.actualSec, undefined); assert.equal(l.endedAtISO, undefined); }
// 2. 종료 → 자동 이동 중 → 도착(한 버튼) → 칩 → 위치·이동 기록
serverState = { v60: {} }; at(16, 25, 48); await show(cls('present')); click(btn('종료')); await flush();
assert.equal(st(), '이동 중 · 정역학 끝난 뒤'); assert.match(bar().textContent, /16:25부터/); assert.equal(bar().dataset.state, 'transit'); assert.equal(serverState.v60.place, undefined, '도착을 안 누르면 위치를 채우지 않는다');
assert.ok(btn('정지'), '한 버튼(정지 = 도착)'); assert.ok(btn('이동 아니에요'));
at(16, 40, 0); click(btn('정지')); await flush();
const pop = document.querySelector('.pl-arrive'); assert.ok(pop, '도착 창'); assert.match(pop.textContent, /어디로 갔어요\?/); assert.match(pop.textContent, /집/); assert.match(pop.textContent, /도서관/);
const chip = (t) => [...pop.querySelectorAll('button')].find((b) => b.textContent === t);
pop.querySelector('input[aria-label="뭐 하러 왔어요"]').value = '공부'; click(chip('도서관')); await flush(20);
assert.deepEqual(serverState.v60.place['2026-10-12'], [{ t: '16:25', p: '이동 중' }, { t: '16:40', p: '도서관' }]);
const tl = serverState.v60.transitLog; assert.equal(tl.length, 1); assert.deepEqual([tl[0].date, tl[0].s, tl[0].e, tl[0].after, tl[0].to], ['2026-10-12', '16:25', '16:40', '정역학', '도서관']); assert.equal(tl[0].what, '공부');
assert.equal(st(), '지금은 일정이 없어요', '도착을 기록하면 이동 중 해제'); assert.ok(!document.querySelector('.pl-arrive'), '창 닫힘');
// 3. 이동 아니에요
serverState = { v60: {} }; at(16, 26, 0); await show(cls('present')); click(btn('종료')); await flush(); at(16, 27); plan._paintNow(); assert.equal(st(), '이동 중 · 정역학 끝난 뒤'); click(btn('이동 아니에요')); await flush(); assert.equal(st(), '지금은 일정이 없어요'); assert.deepEqual(serverState.v60.moveOff['2026-10-12'], ['16:26']);
// 4. 결석 처리된 수업은 끝난 일정이 아니다(이동 아님)
serverState = { v60: {} }; at(17, 0); await show(cls('absent')); assert.equal(st(), '지금은 일정이 없어요');
// 5. 이동 일정 진행 중: 「이동 중 · 집 → 학교」 + 도착(정지) 버튼, 일시정지 없음
at(14, 0); serverState = { v60: {} }; await show({ routine: { grid: {} }, plans: [{ id: 'mv', date: '2026-10-12', s: '13:30', e: '14:30', state: 'confirmed', bk: '이동', from: '집', to: '학교', courseId: '' }] });
assert.equal(st(), '이동 중 · 집 → 학교'); assert.ok(btn('정지'), '도착 버튼'); assert.equal(btn('재생'), undefined);
click(btn('정지')); await flush(); { const p2 = document.querySelector('.pl-arrive'); assert.ok(p2); click([...p2.querySelectorAll('button')].find((b) => b.textContent === '학교')); await flush(20); }
assert.deepEqual(serverState.v60.place['2026-10-12'].map((r) => r.p), ['학교']); assert.equal(serverState.v60.transitLog[0].s, '13:30');
// 6. 위치 열: 수업은 「학교 · 1공 409」, 기록이 있으면 기록 우선
serverState = { v60: {} }; at(14, 0); await show(cls('')); assert.match(host.querySelector('.pl-lane').textContent, /학교/); assert.match(host.querySelector('.pl-lane').textContent, /1공 409/);
serverState = { v60: { place: { '2026-10-12': [{ t: '15:10', p: '카페' }] } } }; at(16, 0); await show(cls('')); { const lane = host.querySelector('.pl-lane').textContent; assert.match(lane, /카페/); }
console.log('plan-progress-dom ok'); plan.destroy(); process.exit(0);
