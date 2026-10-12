// 종일 일정 화면(jsdom): 종일 줄(하루·한 주)·접기/펼치기·추가 창의 종일 스위치·검증·저장 값·고치기·삭제·캘린더 종일(읽기 전용).
// 실행: NODE_PATH=<jsdom 경로> node school/plan-allday-dom.test.mjs
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
const calEv = (id, title, a, b) => ({ id, title, start: '', end: '', allDay: true, cal: '한양', startISO: a + 'T00:00:00Z', endISO: b + 'T00:00:00Z' });
const CAL = { '2026-10-12': [calEv('w', '7주차 이어짐', '2026-10-11', '2026-10-13'), calEv('s', '운선 모임', '2026-10-12', '2026-10-13')], '2026-10-13': [calEv('w', '7주차 이어짐', '2026-10-11', '2026-10-13')] };
globalThis.fetch = async (url) => {
  const json = (o) => ({ ok: true, status: 200, json: async () => o });
  if (String(url).startsWith('/api/cal')) { const days = {}; for (const d of ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18']) days[d] = CAL[d] || []; return json({ ok: true, days }); }
  if (String(url).startsWith('/api/health/sleep')) return json({ sleep: {}, tz: 'Asia/Seoul' });
  if (String(url).startsWith('/api/study/state')) return json({ state: { v60: {} } });
  throw new Error('unexpected fetch ' + url);
};
const { createPlan } = await import('./plan.js');
const flush = async (n = 8) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
const calls = [];
const P = (o) => ({ id: 'p', date: '2026-10-12', allDay: true, courseId: '', kind: '종일', note: '', done: false, source: '직접 계획', activity: true, s: '00:00', e: '23:59', state: 'confirmed', bk: '고정', ...o });
let plans = [P({ id: 'a', note: '공모전 마감', endDate: '2026-10-14', memo: '서류' }), P({ id: 'b', note: '보고서 제출일', bk: '과제', state: 'tentative', date: '2026-10-13' })];
const ctx = () => ({ today: '2026-10-12', courses: ['정역학'], focus: () => true, scheduled: [], classSlots: [], holidays: null, term: null, sessions: [], plans, calendarOk: true, calendar: CAL['2026-10-12'], routine: { grid: {} }, deadlines: [], courseName: (id) => ({ c1: '정역학' }[id] || ''), courseId: (n) => ({ 정역학: 'c1' }[n]), exams: [], dailyCap: 4,
  addPlan: async (i) => { calls.push(['add', i]); return ['n1']; }, updatePlan: async (i) => { calls.push(['update', i]); return true; }, deletePlan: async (id) => { calls.push(['delete', id]); return true; }, deletePlans: async () => [], restorePlans: async (ids) => { calls.push(['restore', ids]); return true; }, attend: async () => true });
w.addEventListener('error', (e) => console.log('PAGE ERROR', String(e.error && e.error.stack).slice(0, 400)));
const host = document.getElementById('h');
const plan = createPlan({ status: (m, bad) => calls.push(['status', m, !!bad]) });
await plan.render(host, ctx()); await flush(14);
const click = (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 200, clientY: 300 }));
const q = (sel) => document.querySelector(('.pl-pop ' + sel).trim());
const popBtn = (t) => [...document.querySelectorAll('.pl-pop button')].find((b) => b.textContent.trim() === t);
const plus = () => [...host.querySelectorAll('.pl-ib')].find((b) => b.getAttribute('aria-label') === '일정 추가');
const pm = () => host.querySelector('.pl-mode:not(.pl-fill)');
const pressed = (b) => b.getAttribute('aria-pressed') === 'true';
const lastAdd = () => calls.filter((c) => c[0] === 'add').pop()[1];
const lastUpd = () => calls.filter((c) => c[0] === 'update').pop()[1];
const setVal = (sel, v, ev = 'input') => { const i = q(sel); i.value = v; i.dispatchEvent(new w.Event(ev, { bubbles: true })); };
const adItems = () => [...host.querySelectorAll('.pl-adrow .pl-ad, .pl-adgrid .pl-ad')];

// 1. 하루 보기: 격자 위 「종일」 줄 — 앱 종일 1(오늘부터 3일짜리) + 캘린더 2(7주차 이어짐·개인 일정(운선 가림)) = 3개, 둘만 보이고 +1개
assert.ok(host.querySelector('.pl-adrow')); assert.equal(host.querySelector('.pl-adrow .pl-adlabel').textContent, '종일');
let its = adItems(); assert.equal(its.length, 2, '접힌 상태 2개'); const more = host.querySelector('.pl-adrow .pl-admore'); assert.equal(more.textContent, '+1개');
assert.ok(its.every((b) => b.querySelector('.pl-tag').textContent === '종일'), '글자 표식 종일');
click(more); await flush(); its = adItems(); assert.equal(its.length, 3); assert.equal(host.querySelector('.pl-adrow .pl-admore').textContent, '접기');
const titles = its.map((b) => b.querySelector('.pl-adt').textContent); assert.deepEqual(titles.sort(), ['7주차 이어짐', '개인 일정', '공모전 마감'].sort(), '운선 제목은 가림');
assert.equal(its.find((b) => /공모전/.test(b.textContent)).querySelectorAll('.pl-tag')[1].textContent, '고정'); assert.match(its.find((b) => /공모전/.test(b.textContent)).className, /c-fixed/);
assert.match(its.find((b) => /7주차/.test(b.textContent)).querySelector('small').textContent, /10\/11–10\/12/, '캘린더 종일 10/11~10/12(끝 배타 해석)');
// 시간 격자에는 안 올라감
assert.ok(![...host.querySelectorAll('.pl-grid .pl-blk')].some((b) => /공모전|7주차|개인 일정/.test(b.textContent)), '격자에 종일 블록 없음');
// 2. 캘린더 종일 = 읽기 전용 창
click(its.find((b) => /7주차/.test(b.textContent))); await flush(); assert.match(document.querySelector('.pl-pop').textContent, /구글 캘린더에서 고쳐요/); assert.ok(!popBtn('저장') && !document.querySelector('.pl-pop .danger')); document.querySelector('.pl-pop').remove();
// 3. 앱 종일 = 고치기·삭제: 종일 켜져 있고 날짜·종료일·메모가 채워짐
click(adItems().find((b) => /공모전/.test(b.textContent))); await flush();
assert.equal(pressed(q('[data-allday]')), true); assert.equal(q('input[type=time]').hidden, true); assert.equal(q('[aria-label="종료일(선택)"]').value, '2026-10-14'); assert.equal(q('[aria-label="메모(선택)"]').value, '서류');
assert.equal(q('[aria-label="일정 종류"]').closest('.pl-prow').hidden, true); assert.equal(pressed(q('[data-adbk="고정"]')), true);
setVal('[aria-label="메모(선택)"]', '서류 제출'); click(popBtn('저장')); await flush();
let u = lastUpd(); assert.deepEqual([u.id, u.allDay, u.endDate, u.memo, u.bk, u.s, u.e, u.courseId], ['a', true, '2026-10-14', '서류 제출', '고정', '00:00', '23:59', '']);
// 종료일을 비우면 endDate 가 빠진다, 메모를 비우면 memo 가 빠진다
click(adItems().find((b) => /공모전/.test(b.textContent))); await flush(); setVal('[aria-label="종료일(선택)"]', '', 'change'); setVal('[aria-label="메모(선택)"]', '');
click(popBtn('저장')); await flush(); u = lastUpd(); assert.ok(!('endDate' in u) && !('memo' in u), '비우면 빠짐');
// 삭제 → 되돌리기 토스트(지운 뒤 restorePlans)
click(adItems().find((b) => /공모전/.test(b.textContent))); await flush(); click(document.querySelector('.pl-pop .danger')); await flush(); assert.deepEqual(calls.filter((c) => c[0] === 'delete').pop(), ['delete', 'a']);
const undo = [...document.querySelectorAll('button')].find((b) => /되돌리기/.test(b.textContent)); assert.ok(undo, '되돌리기 버튼'); click(undo); await flush(); assert.deepEqual(calls.filter((c) => c[0] === 'restore').pop(), ['restore', ['a']]);

// 4. 추가 창: 종일 스위치
if (pressed(pm())) click(pm()); await flush();
click(plus()); await flush();
assert.equal(q('[aria-label="일정 종류"] [data-bk="공부"]') != null, true);
assert.equal(q('[data-allday]').disabled, true, '공부 종류에서는 종일 불가'); assert.match(q('[data-allday]').title, /시각이 의미 있어/);
for (const k of ['이동', '준비', '밥']) { click(q(`[data-bk="${k}"]`)); await flush(); assert.equal(q('[data-allday]').disabled, true, k); }
click(q('[data-bk="고정"]')); await flush(); assert.equal(q('[data-allday]').disabled, false);
click(q('[data-allday]')); await flush(); assert.equal(pressed(q('[data-allday]')), true);
assert.equal(q('input[type=time]').hidden, true, '시작 시각 칸 사라짐'); assert.equal(q('[aria-label="길이"]').hidden, true); assert.equal(q('[aria-label="일정 종류"]').closest('.pl-prow').hidden, true); assert.ok(q('[aria-label="종료일(선택)"]'));
assert.deepEqual([...document.querySelectorAll('.pl-pop [aria-label="종일 종류"] button')].map((b) => b.textContent), ['고정', '과제']);
// 검증: 이름 필수 · 종료일은 시작일 이후 · 최대 31일
const dIn = q('input[type=date]'); dIn.value = '2026-10-20'; dIn.dispatchEvent(new w.Event('change', { bubbles: true }));
setVal('[aria-label="종료일(선택)"]', '2026-10-19', 'change'); assert.match(document.querySelector('.pl-pop').textContent, /종료일은 시작일과 같거나 늦어야 해요/); assert.equal(popBtn('확정으로 넣기').disabled, true);
setVal('[aria-label="종료일(선택)"]', '2026-11-20', 'change'); assert.match(document.querySelector('.pl-pop').textContent, /최대 31일/); assert.equal(popBtn('확정으로 넣기').disabled, true);
setVal('[aria-label="종료일(선택)"]', '2026-11-19', 'change'); assert.ok(!/최대 31일/.test(document.querySelector('.pl-pop').textContent), '31일은 허용(20일~11/19 = 31일)'); assert.equal(popBtn('확정으로 넣기').disabled, false);
setVal('[aria-label="종료일(선택)"]', '2026-10-22', 'change'); setVal('[aria-label="할 일"]', '공모전 접수'); setVal('[aria-label="메모(선택)"]', '온라인');
click(popBtn('확정으로 넣기')); await flush();
let a = lastAdd(); assert.deepEqual([a.date, a.endDate, a.allDay, a.bk, a.state, a.courseId, a.note, a.memo, a.s, a.e, a.kind, a.src], ['2026-10-20', '2026-10-22', true, '고정', 'confirmed', '', '공모전 접수', '온라인', '00:00', '23:59', '종일', 'manual']);
// 이름 없으면 안 넣음(브라우저 필수 칸)
click(plus()); await flush(); click(q('[data-bk="과제"]')); await flush(); click(q('[data-allday]')); await flush(); const n0 = calls.filter((c) => c[0] === 'add').length; click(popBtn('확정으로 넣기')); await flush(); assert.equal(calls.filter((c) => c[0] === 'add').length, n0, '이름 없이는 못 넣음');
setVal('[aria-label="할 일"]', '보고서 마감'); click(popBtn('확정으로 넣기')); await flush(); a = lastAdd(); assert.deepEqual([a.bk, a.allDay, a.date, 'endDate' in a, 'memo' in a], ['과제', true, '2026-10-12', false, false]);
// 계획 모드: 새 계획은 공부·과제 계획 종류에서 종일 가능, 점선 계획 + 종일 종류 고르기(과제)
click(pm()); await flush(); click(plus()); await flush();
assert.equal(q('[data-allday]').disabled, false, '공부·과제 계획은 종일 가능'); click(q('[data-tk="이동"]')); await flush(); assert.equal(q('[data-allday]').disabled, true); click(q('[data-tk=""]')); await flush();
click(q('[data-allday]')); await flush(); click(q('[data-adbk="과제"]')); await flush(); setVal('[aria-label="할 일"]', '결과 발표'); click(popBtn('계획으로 넣기')); await flush(); a = lastAdd();
assert.deepEqual([a.allDay, a.bk, a.state, a.note], [true, '과제', 'tentative', '결과 발표']);
// 지난 날짜: 확정은 가능(날짜 칸 min 없음), 계획은 min = 오늘
click(plus()); await flush(); assert.equal(q('input[type=date]').min, '2026-10-12'); click([...document.querySelectorAll('.pl-pop [data-mode]')].find((b) => b.dataset.mode === '확정')); await flush(); assert.equal(q('input[type=date]').min, '', '확정은 지난 날짜도 기록할 수 있다');
document.querySelector('.pl-pop').remove(); click(pm()); await flush();   // 계획 모드 끄기

// 회귀(오타 종일 1차): 시작일이 지났어도 마지막 날이 안 지난 종일은 계획으로 넣을 수 있다(날짜 칸 min 이 막지 않음). 계획 종일은 종일·종류·계획 표식 3개
if (!pressed(pm())) click(pm()); await flush(); click(plus()); await flush(); click(q('[data-allday]')); await flush(); click(q('[data-adbk="과제"]')); await flush();
{ const di = q('input[type=date]'); di.value = '2026-10-11'; di.dispatchEvent(new w.Event('change', { bubbles: true })); setVal('[aria-label="종료일(선택)"]', '2026-10-14', 'change'); setVal('[aria-label="할 일"]', '어제 시작한 계획'); await flush();
  assert.equal(q('input[type=date]').min, '', '종일 계획은 날짜 칸 min 없음'); assert.ok(popBtn('계획으로 넣기'), '끝날이 안 지났으니 계획 유지'); click(popBtn('계획으로 넣기')); await flush();
  const ta = lastAdd(); assert.deepEqual([ta.date, ta.endDate, ta.state, ta.bk, ta.allDay], ['2026-10-11', '2026-10-14', 'tentative', '과제', true]); }
if (pressed(pm())) click(pm()); await flush();
{ const pp = [P({ id: 'tt', note: '계획 종일', bk: '과제', state: 'tentative', date: '2026-10-12' })]; const keep = plans; plans = pp; await plan.render(host, ctx()); await flush(14);
  const tags = [...adItems().find((b) => /계획 종일/.test(b.textContent)).querySelectorAll('.pl-tag')].map((t) => t.textContent); assert.deepEqual(tags, ['종일', '과제', '계획'], '종일 · 종류 · 계획'); plans = keep; }

// 5. 한 주 보기: 날짜 칸에 걸친 가로 막대, 줄이 세 개 넘으면 +N개
plans = [P({ id: 'a', note: '공모전 마감', endDate: '2026-10-14' }), P({ id: 'b', note: '겹침 하나', date: '2026-10-13' }), P({ id: 'c', note: '겹침 둘', date: '2026-10-13', endDate: '2026-10-15' }), P({ id: 'd', note: '겹침 셋', date: '2026-10-13' })];
await plan.render(host, ctx()); await flush(14);
click([...host.querySelectorAll('.pl-seg button')].find((b) => b.getAttribute('aria-label') === '한 주')); await flush(14);
{ const fold = [...host.querySelectorAll('.pl-adgrid .pl-admore')].find((b) => b.textContent === '접기'); if (fold) { click(fold); await flush(); } }   // 하루 보기에서 펼친 상태는 보기 사이에 유지되므로 접고 시작
const grid = host.querySelector('.pl-adgrid'); assert.ok(grid, '한 주 종일 줄'); assert.ok(grid.closest('.pl-wkstick'), '헤더와 같이 고정');
const gi = [...grid.querySelectorAll('.pl-ad')]; const span = (t) => gi.find((b) => b.textContent.includes(t))?.style.gridColumn;
assert.equal(span('공모전 마감'), '2 / 5', '10/12~10/14 = 월~수 3칸(첫 칸은 시간 눈금)');
assert.ok(grid.querySelector('.pl-admore'), '세 줄째부터 +N개'); const hidden = [...grid.querySelectorAll('.pl-admore')].map((b) => b.textContent); assert.ok(hidden.every((t) => /^\+\d+개$/.test(t)), hidden.join());
click(grid.querySelector('.pl-admore')); await flush(); assert.ok(host.querySelectorAll('.pl-adgrid .pl-ad').length > gi.length, '펼치면 더 보임'); assert.ok([...host.querySelectorAll('.pl-adgrid .pl-admore')].some((b) => b.textContent === '접기'));
// 종일 막대에서 고치기로 이어짐
click([...host.querySelectorAll('.pl-adgrid .pl-ad')].find((b) => b.textContent.includes('겹침 하나'))); await flush(); assert.equal(pressed(q('[data-allday]')), true); document.querySelector('.pl-pop').remove();
console.log('plan-allday-dom ok');
process.exit(0);
