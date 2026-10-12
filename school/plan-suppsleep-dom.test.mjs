// 오늘의 수면 카드 · 보충 수면(대표님 10/12): 기록 있을 때만 카드, 부족(목표−1시간 미만)이면 권장 시간(부족분 절반·30분 올림·최대 +2시간·10시간 상한),
// 내일 첫 일정에 맞춘 비저장 보충 계획 블록, 모호한 기록은 계산 안 함, 「그대로 둘게요」로 오늘 숨김
// 실행: NODE_PATH=<jsdom 경로> node school/plan-suppsleep-dom.test.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mock } from 'node:test';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>', { pretendToBeVisual: true, url: 'http://127.0.0.1/' });
const w = dom.window;
for (const k of ['document', 'localStorage', 'requestAnimationFrame', 'innerWidth', 'innerHeight', 'getComputedStyle']) Object.defineProperty(globalThis, k, { value: w[k], configurable: true, writable: true });
globalThis.confirm = () => true;
mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-10-12T01:00:00Z') });   // KST 10:00
const at = (hh, mm) => mock.timers.setTime(Date.parse(`2026-10-12T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00+09:00`));
localStorage.setItem('school-plan-view', 'day');
let serverState = { v60: {} }, posts = 0;
globalThis.fetch = async (url, opt = {}) => {
  const json = (o) => ({ ok: true, status: 200, json: async () => o });
  if (String(url).startsWith('/api/cal')) return json({ ok: true, days: {} });
  if (String(url).startsWith('/api/health/sleep')) return json({ sleep: {}, tz: 'Asia/Seoul' });
  if (String(url).startsWith('/api/study/state')) { if (opt.method === 'POST') { posts++; serverState = JSON.parse(opt.body).state; return json({ workspaceRevision: 1 }); } return json({ state: JSON.parse(JSON.stringify(serverState)) }); }
  throw new Error('unexpected fetch ' + url);
};
const { createPlan, sleepCardInfo, suppPlan, sleepGoal } = await import('./plan.js');
const flush = async (n = 14) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
const rec = (bed, wake, bedDate = '2026-10-11') => ({ '2026-10-12': { bed, wake, src: 'app', bedAt: `${bedDate}T${bed}:00+09:00`, wakeAt: `2026-10-12T${wake}:00+09:00` } });
const host = document.getElementById('h');
const plan = createPlan({ status: () => {} });
const show = async (v60, routine) => { serverState = { v60 }; await plan.render(host, { today: '2026-10-12', courses: [], focus: () => true, scheduled: [], classSlots: [], holidays: null, term: null, sessions: [], plans: [], calendarOk: true, calendar: [], routine: routine || { grid: {} }, deadlines: [], courseName: () => '', courseId: () => null, exams: [], dailyCap: 4 }); await flush(); };
const card = () => host.querySelector('.pl-sleepcard');
const txt = () => card()?.textContent.replace(/\s+/g, ' ') || '';
const supp = () => [...host.querySelectorAll('.pl-blk.k-sleep')].filter((b) => /보충/.test(b.textContent));
const click = (e) => e.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 50, clientY: 50 }));
const TUE = { grid: { 화: [{ id: 't1', title: '미적분 수업', start: '09:00', end: '10:30', kind: '수업' }] } };

// 순수 함수: 권장 시간 계산
const g8 = { hours: 8 };
const info = (h) => sleepCardInfo({ src: '앱 기록', bedMs: 0, wakeMs: h * 36e5 }, 8);
assert.equal(info(8).lack, false); assert.equal(info(7.2).lack, false, '목표−1시간 이상이면 부족 아님'); assert.equal(info(6.99).lack, true);
assert.equal(info(6 + 10 / 60).rec, 9, '6시간 10분: 부족 1시간 50분 → 절반 55분 → 30분 단위 올림 1시간 → 9시간');
assert.equal(info(3).rec, 10, '3시간: 부족 5시간 → +2 상한 → 10');
assert.equal(info(5).rec, 9.5, '5시간: 부족 3시간 → 절반 1.5');
assert.equal(sleepCardInfo({ src: 'x', bedMs: 0, wakeMs: null }, 8).reason, 'nowake'); assert.equal(sleepCardInfo({ src: 'x', bedMs: 0, wakeMs: 2 * 36e5 }, 8).reason, 'odd'); assert.equal(sleepCardInfo({ src: 'x', bedMs: 0, wakeMs: 15 * 36e5 }, 8).reason, 'odd'); assert.equal(sleepCardInfo(null, 8), null);
assert.equal(sleepCardInfo({ src: '앱 기록', bedMs: 0, wakeMs: 3 * 36e5 }, 12).rec, 10, '목표 12 여도 10시간 상한');

// (d) 기록 없음 → 카드 없음
await show({}); assert.equal(card(), null, '기록 없으면 카드 없음');
// (a) 충분: 23:00–07:30
await show({ sleep: rec('23:00', '07:30') }); assert.match(txt(), /오늘의 수면/); assert.match(txt(), /약 8시간 30분 \(추정\)/); assert.match(txt(), /취침 23:00 · 기상 07:30 · 출처 앱 기록/); assert.ok(!/부족/.test(txt()) && !supp().length, '충분하면 부족·보충 없음');
// (b) 부족 1시간 50분 + 내일 09:00 수업: 기상 08:00(첫 일정−60), 취침 23:00(9시간)
await show({ sleep: rec('23:50', '06:00') }, TUE);
assert.match(txt(), /약 6시간 10분 \(추정\)/); assert.match(txt(), /목표 8시간보다 1시간 50분 부족해요\. 오늘 밤은 9시간 정도 자면 좋아요\(추정치\)/);
assert.match(txt(), /보충 수면 계획 23:00–08:00/); assert.match(txt(), /내일 첫 일정 09:00 미적분(\(| )/); assert.match(txt(), /규칙 기반 추정/); assert.ok(!/해야 한다/.test(txt()), '단정 문구 없음');
assert.equal(supp().length >= 1, true, '시간표에 보충 수면 점선 블록'); assert.ok(supp()[0].classList.contains('sleep-plan'), '계획(점선)');
assert.equal(posts, 0, '자동으로 서버 기록을 만들지 않음');
// 내일 첫 일정이 없으면 목표 기상(09:00) 유지, 취침 00:00
await show({ sleep: rec('23:50', '06:00') }); assert.match(txt(), /보충 수면 계획 00:00–09:00/); assert.match(txt(), /목표 기상/);
// 오타 1차: 이른 첫 일정도 반영, 늦은 첫 일정이면 목표 기상 그대로(문구도 실제 기준대로)
await show({ sleep: rec('23:50', '06:00') }, { grid: { 화: [{ id: 't2', title: '이른 수업', start: '06:00', end: '07:00', kind: '수업' }] } }); assert.match(txt(), /보충 수면 계획 20:00–05:00/); assert.match(txt(), /내일 첫 일정 06:00 이른/);
await show({ sleep: rec('23:50', '06:00') }, { grid: { 화: [{ id: 't3', title: '점심 약속', start: '12:00', end: '13:00', kind: '수업' }] } }); assert.match(txt(), /보충 수면 계획 00:00–09:00/); assert.match(txt(), /첫 일정이 12:00로 늦어 목표 기상을 그대로/); assert.ok(!/12:00 점심/.test(txt()), '쓰지 않은 일정을 기준으로 말하지 않음');
await show({ sleep: rec('23:50', '06:00') }, { grid: { 화: [{ id: 't4', title: '새벽 일정', start: '03:30', end: '04:30', kind: '수업' }] } }); assert.match(txt(), /보충 수면을 잡을 시간이 부족해/, '이른 일정 때문에 18시 이후 취침이 불가하면 계획 없음');
// (c) 기상 기록 없음
await show({ sleep: { '2026-10-12': { bed: '23:40', src: 'app', bedAt: '2026-10-11T23:40:00+09:00' } } }); assert.match(txt(), /기상 기록 없음/); assert.ok(!/부족/.test(txt()));
// (f) 모호(2시간) → 계산 안 함
await show({ sleep: rec('04:00', '06:00', '2026-10-12') }); assert.match(txt(), /기록이 불완전해서 보충 계산을 안 해요/); assert.ok(!supp().length);
// (g) 그대로 둘게요 → 오늘 숨김(저장), 다시 보기
await show({ sleep: rec('23:50', '06:00') }, TUE); click([...card().querySelectorAll('button')].find((b) => b.textContent === '그대로 둘게요')); await flush();
assert.equal(serverState.v60.suppOff['2026-10-12'], true); assert.ok(!supp().length, '숨기면 보충 블록 없음'); assert.match(txt(), /오늘 숨겨 뒀어요/);
click([...card().querySelectorAll('button')].find((b) => b.textContent === '보충 수면 다시 보기')); await flush(); assert.ok(supp().length >= 1);
// (e) 밤 시각: 23:30 에는 이미 늦어 지금부터 가능한 만큼만(잘렸음 표시)
at(23, 30); await show({ sleep: rec('23:50', '06:00') }, TUE); assert.match(txt(), /이미 늦어서 지금부터 가능한/); at(10, 0);
// 수면 창: 보충 수면 블록
await show({ sleep: rec('23:50', '06:00') }, TUE); click(supp()[0]); await flush(); { const pop = document.querySelector('.pl-pop'); assert.match(pop.querySelector('b').textContent, /보충 수면/); assert.ok([...pop.querySelectorAll('button')].some((b) => /그대로 둘게요/.test(b.textContent))); pop.remove(); }
console.log('plan-suppsleep-dom ok'); plan.destroy(); process.exit(0);
