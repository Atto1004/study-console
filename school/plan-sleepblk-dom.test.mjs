// 시간표 수면 블록 화면(jsdom): 한 주 보기의 확정·취침만·계획 수면, 범례 6칸, 블록 창, 취침 목표 창·저장. 실행: NODE_PATH=<jsdom 경로> node school/plan-sleepblk-dom.test.mjs
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
localStorage.setItem('school-plan-view', 'week');
let serverState = { v60: { sleep: {
  '2026-10-12': { bed: '23:40', wake: '07:30', src: 'app', bedAt: '2026-10-11T23:40:00+09:00', wakeAt: '2026-10-12T07:30:00+09:00' },
  '2026-10-10': { bed: '00:30', src: 'app', bedAt: '2026-10-10T00:30:00+09:00' },
  '2026-10-09': { bed: '14:00', wake: '07:00' } }, cfg: { bed: '01:00', sleepH: 8 } } };
const posts = [], fetched = [];
const appleBody = { sleep: { '2026-10-11': { main: { bed: '2026-10-10T23:50', wake: '2026-10-11T08:10', asleep_min: 400, source: 'watch' }, naps: [] } }, tz: 'Asia/Seoul' };
globalThis.fetch = async (url, opt = {}) => {
  const json = (o) => ({ ok: true, status: 200, json: async () => o });
  fetched.push(String(url));
  if (String(url).startsWith('/api/cal')) return json({ ok: true, days: {} });
  if (String(url).startsWith('/api/health/sleep')) return globalThis.__appleFail ? { ok: false, status: 500, json: async () => ({}) } : json(appleBody);
  if (String(url).startsWith('/api/study/state')) { if (opt.method === 'POST') { serverState = JSON.parse(opt.body).state; posts.push(serverState); return json({ workspaceRevision: 1 }); } return json({ state: JSON.parse(JSON.stringify(serverState)) }); }
  throw new Error('unexpected fetch ' + url);
};
const { createPlan } = await import('./plan.js');
const flush = async (n = 8) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
const ctx = () => ({ today: '2026-10-12', courses: [], focus: () => true, scheduled: [], classSlots: [], holidays: null, term: null, sessions: [], plans: [], calendarOk: true, calendar: [], routine: { grid: {} }, deadlines: [], courseName: () => '', courseId: () => null, exams: [], dailyCap: 4, addPlan: async () => [], updatePlan: async () => true, deletePlan: async () => true, deletePlans: async () => [], restorePlans: async () => true, attend: async () => true });
const host = document.getElementById('h');
const plan = createPlan({ status: () => {} });
await plan.render(host, ctx()); await flush();
const click = (e) => e.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 200, clientY: 300 }));
const colOf = (d) => host.querySelector(`.pl-wkcol[data-date="${d}"]`);
const sleepsIn = (d) => [...colOf(d).querySelectorAll('.pl-blk.c-sleep')].map((b) => b.className.match(/sleep-(\w+)/)[1]);
const ib = (label) => [...host.querySelectorAll('.pl-ib')].find((b) => b.getAttribute('aria-label')?.startsWith(label));

assert.deepEqual(sleepsIn('2026-10-12'), ['done']);
assert.deepEqual(sleepsIn('2026-10-13'), ['plan']); assert.deepEqual(sleepsIn('2026-10-18'), ['plan']);
assert.ok(fetched.some((u) => u.startsWith('/api/health/sleep?from=')), 'Apple 건강 읽기 요청');
assert.ok([...host.querySelectorAll('.pl-wkcol .c-sleep .pl-tag')].every((t) => t.textContent === '수면'));
assert.deepEqual([...host.querySelectorAll('.pl-legend .pl-leg')].map((x) => x.textContent.trim()), ['고정일정', '공부블록', '과제블록', '이동', '준비', '밥', '수면', '계획일정 (미확정)']);
// 지난 주: Apple 확정(10/11) · 취침만(10/10) · 모호한 옛 기록(10/9)은 안 그림
click(ib('지난주')); await flush(20);
assert.ok(sleepsIn('2026-10-11').includes('done'));
assert.ok(sleepsIn('2026-10-10').includes('mark'), '취침만 표식');
assert.deepEqual(sleepsIn('2026-10-09'), [], '모호한 옛 기록은 안 그림');
click(colOf('2026-10-11').querySelector('.pl-blk.c-sleep')); await flush();
let pop = document.querySelector('.pl-pop'); assert.match(pop.textContent, /수면 기록/); assert.match(pop.textContent, /출처: Apple 건강/); pop.remove();
click(colOf('2026-10-10').querySelector('.c-sleep.sleep-mark')); await flush(); pop = document.querySelector('.pl-pop'); assert.match(pop.textContent, /기상 기록 없음/); assert.match(pop.textContent, /출처: 앱 기록/); pop.remove();
// 이번 주 계획 수면 창 → 목표 바꾸기 → 저장
click(ib('다음 주')); await flush(20);
click(colOf('2026-10-13').querySelector('.c-sleep.sleep-plan')); await flush();
pop = document.querySelector('.pl-pop'); assert.match(pop.textContent, /계획 수면/); assert.match(pop.textContent, /취침 01:00 · 기상 09:00\(목표 수면 8시간 기준\)/); assert.ok(![...pop.querySelectorAll('button')].some((b) => /삭제/.test(b.textContent)), '삭제 없음');
click([...pop.querySelectorAll('button')].find((b) => b.textContent === '목표 바꾸기')); await flush();
const form = document.querySelector('.pl-goal'); assert.ok(form); assert.equal(form.querySelector('input[type=time]').value, '01:00'); assert.equal(form.querySelector('select').value, '8');
assert.equal(form.querySelectorAll('select option').length, 17, '4~12시간 0.5 간격');
form.querySelector('input[type=time]').value = '23:30'; form.querySelector('select').value = '7.5';
form.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })); await flush(20);
assert.deepEqual([serverState.v60.cfg.bed, serverState.v60.cfg.sleepH], ['23:30', 7.5]); assert.equal(serverState.v60.sleep['2026-10-12'].bed, '23:40', '수면 기록은 그대로');
assert.match([...colOf('2026-10-13').querySelectorAll('.c-sleep.sleep-plan')].map((b) => b.textContent).join(), /목표 23:30 – 07:00/);
click(ib('시간표 메뉴')); await flush();
assert.ok([...document.querySelectorAll('.pl-pop button')].some((b) => /^취침 목표 · 23:30 취침, 수면 7.5시간$/.test(b.textContent)));
document.querySelector('.pl-pop')?.remove();
// Apple 조회 실패: 블록과 별개로 시간표에 한 줄, 저장된 기록(앱)은 계속 보임
globalThis.__appleFail = true; const host2 = document.createElement('div'); document.body.append(host2); const plan2 = createPlan({ status: () => {} });
await plan2.render(host2, ctx()); await flush(20);
assert.match(host2.querySelector('.pl-applefail')?.textContent || '', /수면 조회에 실패/); assert.ok(host2.querySelector('.pl-wkcol[data-date="2026-10-12"] .c-sleep.sleep-done'), '앱 기록은 계속 보인다');
console.log('plan-sleepblk-dom ok');
process.exit(0);
