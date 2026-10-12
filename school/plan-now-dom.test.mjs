// 지금 하는 일(대표님 10/12): 상태 선택·출석 뒤 수업 중·정지/재생·종료(블록 단축·표식·되돌리기)·자동 전환·키 저장
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
const workBlk = () => [...host.querySelectorAll('.pl-blk')].find((b) => b.textContent.includes('근로장학'));

// 1. 근로 시간 안(14:00): 「근로 중」, 경과·남음, 버튼 3개(재생은 꺼짐)
await show();
assert.equal(st(), '근로장학 근로 중'); assert.match(bar().querySelector('.pl-nowmeta').textContent, /1시간 경과.*1시간 남음/); assert.match(bar().textContent, /근로장학/);
assert.equal(btn('재생'), undefined, '근무엔 재생 없음'); assert.equal(btn('정지'), undefined, '근무엔 정지 없음(쉬어도 근무 시간은 그대로)'); assert.equal(btn('종료').disabled, false);
assert.equal(bar().querySelector('.pl-nowact').getAttribute('role'), 'group');
for (const b of bar().querySelectorAll('.pl-nowib')) assert.ok(b.getAttribute('aria-label') && b.querySelector('svg'), '아이콘 버튼 + aria-label');
// 2. 공부 일정만 정지·재생(한 버튼이 토글): 정지 → 「정지 중」+ 재생 아이콘, 쉰 시간 기록(앱 상태 v60.actual 에만), 재생 → 이어짐
const study = { routine: { grid: {} }, plans: [{ id: 'p1', date: '2026-10-12', s: '13:00', e: '15:00', courseId: 'c1', kind: '공부', state: 'confirmed', bk: '공부' }] };
serverState = { v60: {} }; await show(study); const sst = () => st();
assert.match(sst(), /공부 중$/); assert.equal(btn('재생'), undefined); assert.equal(bar().querySelectorAll('.pl-nowib').length, 2, '토글 1 + 종료 1');
click(btn('정지')); await flush();
assert.match(sst(), /정지 중$/); const skey = Object.keys(serverState.v60.actual)[0]; assert.match(skey, /^plan:p1\|2026-10-12$/, '키 = 종류:id|날짜');
assert.deepEqual(serverState.v60.actual[skey].pauses.map(({ from, to }) => ({ from, to })), [{ from: '14:00', to: null }]); assert.ok(serverState.v60.actual[skey].pauses[0].id, '구간 id');
assert.ok(btn('재생') && !btn('정지'), '같은 자리에서 정지↔재생 토글');
at(14, 7); click(btn('재생')); await flush();
assert.match(sst(), /공부 중$/); assert.deepEqual(serverState.v60.actual[skey].pauses.map(({ from, to }) => ({ from, to })), [{ from: '14:00', to: '14:07' }]); assert.match(bar().textContent, /쉰 시간 7분/);
at(14, 0); serverState = { v60: {} }; await show(); const key = 'work:w1|2026-10-12';
// 3. 종료(14:20): 확인창 → 블록이 14:20 까지로 줄고 「예정 15:00 → 실제 14:20」 표식, 토스트 되돌리기
at(14, 20); confirms = []; click(btn('종료')); await flush();
assert.equal(confirms.length, 1); assert.match(confirms[0], /14:20/); assert.match(confirms[0], /15:00/);
assert.deepEqual([serverState.v60.actual[key].endAt, serverState.v60.actual[key].plannedEnd], ['14:20', '15:00']);
assert.ok(workBlk().classList.contains('cut')); assert.match(workBlk().textContent + workBlk().title, /예정 15:00 → 실제 14:20/);
assert.equal(Math.round(parseFloat(workBlk().style.height)), Math.round((14 * 60 + 20 - 13 * 60) * 54 / 60 - 2), '블록 높이가 실제 끝까지');
assert.equal(st(), '이동 중 · 근로장학 끝난 뒤', '종료한 일정은 되살아나지 않고 자동으로 이동 중');
assert.equal(document.querySelector('.pl-toast').textContent.includes('예정 시각으로 되돌리기'), true);
// 4. 되돌리기(토스트): 예정 시각으로 복원
click(document.querySelector('.pl-toast button')); await flush();
assert.equal(serverState.v60.actual[key].endAt, undefined); assert.ok(!workBlk().classList.contains('cut')); assert.equal(st(), '근로장학 근로 중');
// 5. 시작 5분 이내 종료는 한 번 더 확인
serverState = { v60: {} }; at(13, 3); await show(); confirms = []; click(btn('종료')); await flush(); assert.equal(confirms.length, 2, '5분 이내: 확인 2번');
// 6. 자동 전환: 예정 끝(15:00)을 지나면 손 없이 「일정 없음」+ 다음 일정
serverState = { v60: {} }; await show({ routine: { grid: { 월: [{ id: 'w1', title: '근로장학', start: '13:00', end: '15:00', kind: 'work' }, { id: 'w2', title: '저녁 알바', start: '18:00', end: '20:00', kind: 'work' }] } } });
at(14, 59); plan._paintNow(); assert.equal(st(), '근로장학 근로 중'); at(15, 1); plan._paintNow(); assert.equal(st(), '이동 중 · 근로장학 끝난 뒤'); assert.match(bar().textContent, /다음 18:00 저녁 알바/);
at(17, 10); plan._paintNow(); assert.equal(st(), '지금은 일정이 없어요', '끝난 지 2시간이 넘으면 이동 중이라 단정하지 않음'); assert.match(bar().textContent, /다음 18:00 저녁 알바까지 50분/); at(15, 1);
at(18, 30); plan._paintNow(); assert.equal(st(), '저녁 알바 중');
// 7. 수업: 출석 전엔 「출석 확인」 + 버튼, 정상출석·지각 뒤 「수업 중」, 결석이면 진행 아님
const cls = (status) => ({ scheduled: [{ id: 'a', courseId: 'c1', course: '정역학', date: '2026-10-12', s: '15:00', e: '16:30', room: '1공 409', record: status ? { status } : {} }], routine: { grid: {} } });
at(15, 30); await show(cls('')); assert.equal(st(), '정역학 출석 확인'); assert.ok(btn('정역학 출석 처리') && btn('정역학 지각 처리'));
assert.equal(btn('종료'), undefined, '출석 전엔 종료 버튼 없음');
click(btn('정역학 출석')); await flush(); assert.deepEqual(calls.filter((c) => c[0] === 'c1').pop(), ['c1', '2026-10-12', 'present']);
await show(cls('present')); assert.equal(st(), '정역학 수업 중'); await show(cls('late')); assert.equal(st(), '정역학 수업 중'); await show(cls('absent')); assert.equal(st(), '정역학 결석 처리됨');
// 8. 수업 종료 = classLog.endedAt (수업 창의 시작/종료 대신 한 곳)
serverState = { v60: {} }; at(16, 0); await show(cls('present')); click(btn('종료')); await flush();
assert.equal(serverState.v60.classLog.a.endedAt, '16:00'); assert.equal(serverState.v60.classLog.a.date, '2026-10-12');
assert.ok(!serverState.v60.actual || !Object.keys(serverState.v60.actual).some((k) => k.startsWith('class') && serverState.v60.actual[k].endAt), '수업 끝은 classLog 에만');
assert.ok([...host.querySelectorAll('.pl-blk.k-class')][0].classList.contains('cut'));
// 9. 겹침: 수업(15:00 시작)과 근로(13:00–17:00) → 시작이 늦은 수업이 대표, 나머지 +1
serverState = { v60: {} }; at(15, 30); await show({ ...cls('present'), routine: { grid: { 월: [{ id: 'w1', title: '근로장학', start: '13:00', end: '17:00', kind: 'work' }] } } });
assert.equal(st(), '정역학 수업 중'); assert.equal(bar().querySelector('.pl-nowmore').textContent, '+1');
// 10. 낡은 리비전(409) 뒤 다시 적용: 정지는 한 구간만(겹침·중복 없음)
serverState = { v60: {} }; at(14, 0); await show(study); conflictOnce = true; click(btn('정지')); await flush(20);
{ const k = Object.keys(serverState.v60.actual)[0]; assert.equal(serverState.v60.actual[k].pauses.length, 1, '409 재적용 뒤에도 정지 구간 1개'); assert.equal(serverState.v60.actual[k].pauses[0].to, null); }
// 11. 다른 화면이 먼저 다른 시각(14:10)으로 끝냈으면 덮어쓰지 않고 알리며, 되돌리기 토스트도 만들지 않는다
serverState = { v60: {} }; at(14, 5); await show(); calls.length = 0; document.querySelector('.pl-toast')?.remove();
serverState = { v60: { actual: { 'work:w1|2026-10-12': { endAt: '14:10', plannedEnd: '15:00' } } } }; conflictOnce = true; click(btn('종료')); await flush(20);
assert.equal(serverState.v60.actual['work:w1|2026-10-12'].endAt, '14:10', '남의 기록 유지'); assert.ok(calls.some((c) => c[0] === 'status' && /이미 다른 시각으로/.test(c[1]) && c[2]), '알림'); assert.ok(!document.querySelector('.pl-toast'), '토스트 없음');
// 12. 되돌리기는 내 기록일 때만: 내가 14:20 에 끝낸 뒤 다른 화면이 14:30 으로 바꿨으면 지우지 않는다
serverState = { v60: {} }; at(14, 20); await show(); click(btn('종료')); await flush();
serverState.v60.actual['work:w1|2026-10-12'].endAt = '14:30'; conflictOnce = true; calls.length = 0; click(document.querySelector('.pl-toast button')); await flush(20);
assert.equal(serverState.v60.actual['work:w1|2026-10-12'].endAt, '14:30', '남의 기록은 되돌리기가 지우지 않음');
// 13. 결석·공결: 상태 문구만, 정지·종료 버튼 없음
at(15, 30); await show(cls('absent')); assert.equal(st(), '정역학 결석 처리됨'); assert.equal(bar().querySelectorAll('button').length, 0, '결석엔 버튼 없음'); await show(cls('excused')); assert.equal(st(), '정역학 공결 처리됨'); assert.equal(bar().querySelectorAll('button').length, 0);
// 14. 출석 → 정지 → 결석·공결로 바뀌어도(열린 정지 구간이 남아도) 문구는 결석·공결
serverState = { v60: { actual: { 'class:a|2026-10-12': { pauses: [{ id: 'p', from: '15:10', to: null }] } } } };
for (const [s, label] of [['absent', '결석 처리됨'], ['excused', '공결 처리됨']]) { await show(cls(s)); assert.equal(st(), '정역학 ' + label, label + ' 가 정지 중보다 우선'); assert.equal(bar().querySelectorAll('button').length, 0); }
await show(cls('present')); assert.equal(st(), '정역학 수업 중', '수업은 정지할 수 없어 옛 정지 기록이 남아도 수업 중'); assert.ok(!/쉰 시간/.test(bar().textContent)); assert.equal(btn('재생'), undefined);
console.log('plan-now-dom ok'); plan.destroy(); process.exit(0);
