// 지난 빈 칸 탭 + 수면 직접 입력 화면 검사(jsdom). 실행: NODE_PATH=<jsdom 경로> node school/plan-pastslot-dom.test.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mock } from 'node:test';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>', { pretendToBeVisual: true, url: 'http://127.0.0.1/' });
const w = dom.window;
for (const k of ['document', 'localStorage', 'requestAnimationFrame', 'innerWidth', 'innerHeight']) Object.defineProperty(globalThis, k, { value: w[k], configurable: true, writable: true });
const asked = []; let askAnswer = true; globalThis.confirm = (m) => { asked.push(m); return askAnswer; };
mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-10-12T05:00:00Z') });   // KST 월 14:00
localStorage.setItem('school-plan-view', 'day');
let serverState = { v60: { cfg: { bed: '01:00', sleepH: 8 } } };
let appleBody = { sleep: {}, tz: 'Asia/Seoul' }, conflictOnce = null, postFail = false;
const posts = [];
globalThis.fetch = async (url, opt = {}) => {
  const json = (o, status = 200) => ({ ok: status < 300, status, json: async () => o });
  if (String(url).startsWith('/api/cal')) return json({ ok: true, days: {} });
  if (String(url).startsWith('/api/health/sleep')) return json(appleBody);
  if (String(url).startsWith('/api/study/state')) {
    if (opt.method === 'POST') {
      if (postFail) return json({}, 500);
      if (conflictOnce) { const c = conflictOnce; conflictOnce = null; serverState = c; return json({ error: 'conflict' }, 409); }
      serverState = JSON.parse(opt.body).state; posts.push(serverState); return json({ workspaceRevision: 1 });
    }
    return json({ state: JSON.parse(JSON.stringify(serverState)) });
  }
  throw new Error('unexpected fetch ' + url);
};
const { createPlan } = await import('./plan.js');
const flush = async (n = 10) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
const calls = [];
const ctx = () => ({ today: '2026-10-12', courses: ['정역학'], focus: () => true, scheduled: [], classSlots: [], holidays: null, term: null, sessions: [], plans: [], calendarOk: true, calendar: [], routine: { grid: {} }, deadlines: [], courseName: (id) => ({ c1: '정역학' }[id] || ''), courseId: (n) => ({ 정역학: 'c1' }[n]), exams: [], dailyCap: 4,
  addPlan: async (i) => { calls.push(['add', i]); return ['n']; }, updatePlan: async (i) => { calls.push(['update', i]); return true; }, deletePlan: async () => true, deletePlans: async () => [], restorePlans: async () => true, attend: async () => true });
const host = document.getElementById('h');
const plan = createPlan({ status: (m, bad) => calls.push(['status', m, !!bad]) });
const fresh = async () => { document.querySelectorAll('.pl-pop,.pl-toast').forEach((x) => x.remove()); posts.length = 0; calls.length = 0; await plan.render(host, ctx()); await flush(14); };
await fresh();
const click = (e) => e.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 200, clientY: 300 }));
const fire = (e, t = 'input') => e.dispatchEvent(new w.Event(t, { bubbles: true }));
const popBtn = (t) => [...document.querySelectorAll('.pl-pop button')].find((b) => b.textContent.trim() === t);
const pop = () => document.querySelector('.pl-pop');
const lastStatus = () => calls.filter((c) => c[0] === 'status').pop();
const tapDay = (min) => { const g = host.querySelector('.pl-grid'); g.getBoundingClientRect = () => ({ top: 0, left: 0, width: 300, height: 1296, right: 300, bottom: 1296 }); g.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 100, clientY: min * (54 / 60) + 2 })); };
const tapCol = (d, min) => { const g = host.querySelector(`.pl-wkcol[data-date="${d}"]`); g.getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 960, right: 100, bottom: 960 }); g.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 50, clientY: min * (40 / 60) + 2 })); };
const modeBtn = (k) => [...document.querySelectorAll('.pl-pop [aria-label="넣는 방식"] button')].find((b) => b.dataset.mode === k);
const chip = (k) => [...document.querySelectorAll('.pl-pop [aria-label="일정 종류"] button')].find((b) => b.dataset.bk === k);
const sleepIn = () => ({ bed: document.querySelector('.pl-pop input[aria-label="취침 시각(날짜 포함)"]'), wake: document.querySelector('.pl-pop input[aria-label="기상 시각(날짜 포함)"]') });
const setIn = (i, v) => { i.value = v; fire(i); fire(i, 'change'); };
const closePop = async () => { pop()?.remove(); await new Promise((r) => setTimeout(r, 600)); };

// 1. 오늘 지난 칸(10:00): 선택 박스 + 창이 열리고 계획은 비활성(확정만), 이유 한 줄. 예전의 「못 넣어요」 안내는 없다
tapDay(600); await flush();
assert.ok(pop(), '지난 칸도 창이 열린다'); assert.ok(host.querySelector('.pl-grid .pl-selbox'), '선택 박스'); assert.equal(host.querySelector('.pl-selbox small').textContent, '10:00');
assert.equal(modeBtn('계획').disabled, true); assert.equal(modeBtn('확정').getAttribute('aria-pressed'), 'true'); assert.match(pop().textContent, /이미 지난 시각이라 계획으로 넣을 수 없어요/);
assert.equal(document.querySelector('.pl-pop input[type=time]').value, '10:00', '시작 기본값 = 탭한 칸');
assert.ok(!calls.some((c) => c[0] === 'status' && /못 넣어요/.test(c[1])));
// 일반 유형 과거 확정: 고정(이름) → 확정으로 저장, 계획 아님
click(chip('고정')); await flush(); document.querySelector('.pl-pop input[aria-label="할 일"]').value = '병원'; click(popBtn('확정으로 넣기')); await flush();
let add = calls.find((c) => c[0] === 'add')?.[1]; assert.ok(add); assert.deepEqual([add.state, add.bk, add.date, add.s, add.note], ['confirmed', '고정', '2026-10-12', '10:00', '병원']);
await closePop(); assert.equal(host.querySelectorAll('.pl-selbox').length, 0, '창이 닫히면 선택도 풀림');

// 2. 방금 끝난 칸(13:30, 지금 14:00): 기본 길이는 지금까지 남은 30분, 더 길게 고르면 저장 거절
calls.length = 0; tapDay(810); await flush();
assert.equal(document.querySelector('.pl-pop select[aria-label="길이"]').value, '30', '지난 칸 기본 길이는 남은 분 안에서');
click(chip('공부')); document.querySelector('.pl-pop input[aria-label="할 일"]').value = '복습'; const lenSel = document.querySelector('.pl-pop select[aria-label="길이"]'); lenSel.value = '60'; fire(lenSel, 'change');
click(popBtn('확정으로 넣기')); await flush(); assert.ok(!calls.some((c) => c[0] === 'add'), '아직 오지 않은 시각까지 걸치면 저장 안 함'); assert.match(lastStatus()[1], /아직 오지 않은 시각까지/);
lenSel.value = '30'; fire(lenSel, 'change'); click(popBtn('확정으로 넣기')); await flush(); add = calls.find((c) => c[0] === 'add')?.[1]; assert.deepEqual([add.s, add.e, add.state], ['13:30', '14:00', 'confirmed']);
await closePop();

// 3. 지금 진행 중인 칸(14:00)과 미래 칸(16:00)은 기존 동작: 지금 다음 10분부터 / 그 칸
calls.length = 0; tapDay(840); await flush(); assert.equal(document.querySelector('.pl-pop input[type=time]').value, '14:00'); assert.equal(modeBtn('계획').disabled, false, '진행 중 칸은 계획 가능(기존)'); await closePop();
tapDay(960); await flush(); assert.equal(document.querySelector('.pl-pop input[type=time]').value, '16:00'); assert.equal(modeBtn('계획').disabled, false); await closePop();

// 4. 수면 칩: 새벽 지난 칸이면 강조 + 「지난밤 수면이에요?」(자동 선택 아님). 낮 지난 칸은 강조 없음, 계획 모드엔 칩이 안 보인다
tapDay(420); await flush();
assert.ok(chip('수면') && !chip('수면').hidden, '수면 칩'); assert.match(chip('수면').className, /\brec\b/); assert.equal(chip('수면').getAttribute('aria-pressed'), 'false', '자동 선택 아님'); assert.match(pop().textContent, /지난밤 수면이에요\?/);
assert.equal(pop().querySelectorAll('.pl-sl').length, 0, '고르기 전엔 취침·기상 칸이 없다');
await closePop(); tapDay(780); await flush(); assert.ok(!/\brec\b/.test(chip('수면').className), '낮 칸은 강조 없음'); assert.ok(pop().querySelector('.pl-sl-rec').hidden); await closePop();
tapDay(960); await flush(); click(modeBtn('계획')); await flush(); assert.equal(chip('수면').hidden, true, '계획 모드엔 수면 칩이 없다'); await closePop();

// 5. 수면 입력(오늘 07:00 칸): 과목·길이·이름 칸이 사라지고 취침·기상, 기본값 = 기상 07:00 · 취침 01:00(목표)
await fresh(); tapDay(420); await flush(); click(chip('수면')); await flush();
let { bed, wake } = sleepIn(); assert.ok(bed && wake); assert.equal(wake.value, '2026-10-12T07:00'); assert.equal(bed.value, '2026-10-12T01:00', '목표 취침 01:00 → 같은 날 새벽');
for (const sel of ['select[aria-label="과목"]', 'select[aria-label="길이"]', 'input[aria-label="할 일"]', 'input[type=time]']) assert.ok([...document.querySelectorAll('.pl-pop ' + sel)].every((x) => x.hidden), sel + ' 숨김');
assert.equal(modeBtn('계획').disabled, true, '수면은 계획 아님'); assert.ok(popBtn('수면 기록 저장') && !popBtn('수면 기록 저장').disabled);
assert.match(document.querySelector('.pl-sl-status').textContent, /기상일 10\/12 기록으로 저장돼요 · 간격 6시간/);
for (const i of [bed, wake]) assert.equal(i.getAttribute('aria-label').includes('날짜 포함'), true);
// 검증: 기상이 취침보다 빠름 · 미래 기상 · 24시간 초과 → 저장 불가 + 이유
setIn(wake, '2026-10-12T00:30'); assert.equal(popBtn('수면 기록 저장').disabled, true); assert.match(document.querySelector('.pl-sl-status').textContent, /빨라요/);
setIn(wake, '2026-10-12T14:05'); assert.equal(popBtn('수면 기록 저장').disabled, true); assert.match(document.querySelector('.pl-sl-status').textContent, /아직 오지 않은/);
setIn(bed, '2026-10-10T20:00'); setIn(wake, '2026-10-12T07:00'); assert.equal(popBtn('수면 기록 저장').disabled, true); assert.match(document.querySelector('.pl-sl-status').textContent, /24시간/);
// 간격 2시간 → 확인 창: 아니오면 저장 안 함
setIn(bed, '2026-10-12T05:00'); setIn(wake, '2026-10-12T07:00'); assert.match(document.querySelector('.pl-sl-status').textContent, /한 번 물어봐요/);
asked.length = 0; askAnswer = false; click(popBtn('수면 기록 저장')); await flush(); assert.equal(asked.length, 1); assert.match(asked[0], /2시간이에요\. 맞나요\?/); assert.equal(posts.length, 0, '아니오면 저장 안 함'); assert.ok(pop(), '창은 그대로');
askAnswer = true;
// 정상 저장: 23:40 → 07:30 (취침이 전날)
setIn(bed, '2026-10-11T23:40'); setIn(wake, '2026-10-12T07:30'); asked.length = 0;
click(popBtn('수면 기록 저장')); await flush(20);
assert.equal(asked.length, 0, '7시간 50분은 확인 없이'); assert.equal(posts.length, 1, '서버에 한 번 저장');
const saved = serverState.v60.sleep['2026-10-12']; assert.deepEqual(saved, { bed: '23:40', wake: '07:30', src: 'app', bedAt: '2026-10-11T23:40:00+09:00', wakeAt: '2026-10-12T07:30:00+09:00', via: 'manual' });
assert.deepEqual(serverState.v60.cfg, { bed: '01:00', sleepH: 8 }, '다른 값은 그대로'); assert.ok(!pop(), '성공 뒤에 창이 닫힌다');
assert.equal(calls.filter((c) => c[0] === 'add').length, 0, '계획 레코드는 만들지 않는다');
// 반영: 시간표 수면 블록(자정 분할) + 출처 직접 입력, 오늘의 수면 카드, 어젯밤 요약
const blocks = [...host.querySelectorAll('.pl-blk.c-sleep.sleep-done')]; assert.ok(blocks.length >= 1, '오늘 쪽 조각'); assert.match(blocks[0].textContent, /취침 23:40 – 기상 07:30/); assert.match(blocks[0].textContent, /직접 입력/);
const cardEl = host.querySelector('.pl-sleepcard'); assert.ok(cardEl, '오늘의 수면 카드'); assert.match(cardEl.textContent, /약 7시간 50분/); assert.match(cardEl.textContent, /출처 직접 입력/);
assert.match(host.querySelector('.pl-sleep')?.textContent || '', /어젯밤 취침 기록 23:40 · 기상 07:30/);
// 되돌리기 토스트: 이 입력으로 만든 것만 제거
const toastEl = document.querySelector('.pl-toast'); assert.ok(toastEl && /수면 23:40–07:30 기록/.test(toastEl.textContent)); assert.ok(toastEl.textContent.includes('수면 기록 취소'));
click([...toastEl.querySelectorAll('button')].find((b) => b.textContent === '수면 기록 취소')); await flush(20);
assert.equal(serverState.v60.sleep['2026-10-12'], undefined, '없던 기록은 제거'); assert.ok(!host.querySelector('.pl-blk.c-sleep.sleep-done'));

// 6. 같은 기상일에 기록이 있으면 덮지 않는다: 안내 + [이 기록 수정][취소], 수정을 눌러야 저장 가능
const rec0 = { bed: '23:10', wake: '06:50', src: 'app', bedAt: '2026-10-11T23:10:00+09:00', wakeAt: '2026-10-12T06:50:00+09:00' };
serverState = { v60: { cfg: { bed: '01:00', sleepH: 8 }, sleep: { '2026-10-12': { ...rec0, extra: '보존' } } } }; await fresh();
tapDay(420); await flush(); click(chip('수면')); await flush(); ({ bed, wake } = sleepIn());
assert.match(pop().querySelector('.pl-sl-exist').textContent, /이미 기록이 있어요 · 23:10–06:50/); assert.ok(!pop().querySelector('.pl-sl-exist').hidden);
assert.equal(popBtn('수면 기록 저장').disabled, true, '선택 전엔 저장 불가'); assert.ok(popBtn('이 기록 수정') && popBtn('취소'));
click(popBtn('수면 기록 저장')); await flush(); assert.equal(posts.length, 0);
click(popBtn('이 기록 수정')); await flush(); assert.equal(bed.value, '2026-10-11T23:10', '수정을 누르면 기존 값으로 채움'); assert.equal(wake.value, '2026-10-12T06:50'); assert.equal(popBtn('수면 기록 저장').disabled, false);
setIn(wake, '2026-10-12T07:20'); click(popBtn('수면 기록 저장')); await flush(20);
assert.deepEqual(serverState.v60.sleep['2026-10-12'], { ...rec0, wake: '07:20', wakeAt: '2026-10-12T07:20:00+09:00', via: 'manual', extra: '보존' }, '모르는 필드 보존');
click([...document.querySelectorAll('.pl-toast button')].find((b) => b.textContent === '수면 기록 취소')); await flush(20);
assert.deepEqual(serverState.v60.sleep['2026-10-12'], { ...rec0, extra: '보존' }, '되돌리기는 이전 값 복원');
// 취소 = 창 닫기
await fresh(); tapDay(420); await flush(); click(chip('수면')); await flush(); click(popBtn('취소')); await flush(); assert.ok(!pop(), '취소하면 닫힘'); assert.equal(posts.length, 0);

// 7. 기상일을 바꾸면 보호도 다시: 비어 있는 날에서 기록이 있는 날로 옮기면 안내가 다시 뜬다
await fresh(); tapDay(660); await flush(); click(chip('수면')); await flush(); ({ bed, wake } = sleepIn());
setIn(bed, '2026-10-10T23:50'); setIn(wake, '2026-10-11T07:00'); assert.ok(pop().querySelector('.pl-sl-exist').hidden, '10/11 은 기록 없음'); assert.equal(popBtn('수면 기록 저장').disabled, false);
setIn(bed, '2026-10-11T23:50'); setIn(wake, '2026-10-12T07:00'); assert.ok(!pop().querySelector('.pl-sl-exist').hidden, '10/12 는 기록 있음'); assert.equal(popBtn('수면 기록 저장').disabled, true);
click(popBtn('이 기록 수정')); await flush(); setIn(bed, '2026-10-10T23:50'); setIn(wake, '2026-10-11T07:00'); assert.equal(popBtn('수면 기록 저장').disabled, false);
setIn(bed, '2026-10-11T23:50'); setIn(wake, '2026-10-12T07:00'); assert.equal(popBtn('수면 기록 저장').disabled, true, '키가 바뀌면 동의가 풀린다'); await closePop();

// 8. 직접 입력(said) 기록: 동의 뒤에만, 열 때 본 모습이 그 사이 바뀌었으면 덮지 않는다(저장 충돌 409 뒤 재적용)
const said = { bed: '23:00', wake: '06:30', note: '말로 준 기록' };
serverState = { v60: { cfg: { bed: '01:00', sleepH: 8 }, sleep: { '2026-10-12': { ...said } } } }; await fresh();
tapDay(420); await flush(); click(chip('수면')); await flush(); ({ bed, wake } = sleepIn());
assert.match(pop().querySelector('.pl-sl-exist').textContent, /이미 기록이 있어요 · 23:00–06:30 \(말로 준 기록\)/); click(popBtn('이 기록 수정')); await flush();
setIn(bed, '2026-10-11T23:30'); setIn(wake, '2026-10-12T07:00');
conflictOnce = { v60: { cfg: { bed: '01:00', sleepH: 8 }, sleep: { '2026-10-12': { ...said, bed: '22:00' } }, workspaceRevision: 2 } };   // 저장하려는 순간 다른 화면이 기록을 바꿈
click(popBtn('수면 기록 저장')); await flush(24);
assert.deepEqual(serverState.v60.sleep['2026-10-12'], { ...said, bed: '22:00' }, '바뀐 기록을 덮지 않는다'); assert.match(lastStatus()[1], /그 사이 다른 화면에서/);
// 충돌 뒤: 동의가 풀리고 최신 기록(22:00–06:30)으로 안내가 다시 뜬다 — 같은 낡은 값으로 충돌이 되풀이되지 않는다(오타 2차)
assert.ok(pop(), '창은 그대로'); assert.match(pop().querySelector('.pl-sl-exist').textContent, /이미 기록이 있어요 · 22:00–06:30/); assert.equal(popBtn('수면 기록 저장').disabled, true); assert.ok(popBtn('이 기록 수정'));
click(popBtn('이 기록 수정')); await flush(); setIn(sleepIn().bed, '2026-10-11T23:30'); setIn(sleepIn().wake, '2026-10-12T07:00'); click(popBtn('수면 기록 저장')); await flush(24);
assert.deepEqual(serverState.v60.sleep['2026-10-12'], { bed: '23:30', wake: '07:00', src: 'app', bedAt: '2026-10-11T23:30:00+09:00', wakeAt: '2026-10-12T07:00:00+09:00', via: 'manual', note: '말로 준 기록' }, '다시 동의한 뒤에는 최신 기록 위에 저장'); await closePop();
// 같은 상황이지만 다른 화면이 다른 날만 바꾼 경우: 재적용으로 저장된다
serverState = { v60: { cfg: { bed: '01:00', sleepH: 8 }, sleep: { '2026-10-12': { ...said } } } }; await fresh();
tapDay(420); await flush(); click(chip('수면')); await flush(); ({ bed, wake } = sleepIn()); click(popBtn('이 기록 수정')); await flush(); setIn(bed, '2026-10-11T23:30'); setIn(wake, '2026-10-12T07:00');
conflictOnce = { v60: { cfg: { bed: '01:00', sleepH: 8 }, sleep: { '2026-10-12': { ...said }, '2026-10-05': { bed: '01:00', wake: '08:00' } }, workspaceRevision: 2 } };
click(popBtn('수면 기록 저장')); await flush(24);
assert.deepEqual(serverState.v60.sleep['2026-10-12'], { bed: '23:30', wake: '07:00', src: 'app', bedAt: '2026-10-11T23:30:00+09:00', wakeAt: '2026-10-12T07:00:00+09:00', via: 'manual', note: '말로 준 기록' }); assert.ok(serverState.v60.sleep['2026-10-05'], '다른 화면의 변경 보존');

// 9. Apple 건강이 있는 날: 안내 한 줄(저장은 허용). 저장이 실패하면 창이 닫히지 않고 입력이 남는다
appleBody = { sleep: { '2026-10-12': { main: { bed: '2026-10-11T23:50', wake: '2026-10-12T07:40', asleep_min: 420, source: 'watch' }, naps: [] } }, tz: 'Asia/Seoul' };
serverState = { v60: { cfg: { bed: '01:00', sleepH: 8 } } }; document.querySelectorAll('.pl-pop,.pl-toast').forEach((x) => x.remove()); posts.length = 0; calls.length = 0;
await createPlan({ status: (m, bad) => calls.push(['status', m, !!bad]) }).render(host, ctx()); await flush(14);   // (Apple 조회는 날짜별로 기억하므로 새 화면으로)
tapDay(420); await flush(); click(chip('수면')); await flush(30);
assert.match(document.querySelector('.pl-sl-apple').textContent, /건강 앱 기록이 우선이에요/); assert.ok(!document.querySelector('.pl-sl-apple').hidden);
postFail = true; click(popBtn('수면 기록 저장')); await flush(30); postFail = false;
assert.ok(pop(), '실패하면 창 유지'); assert.equal(popBtn('수면 기록 저장').disabled, false, '다시 누를 수 있다'); assert.match(host.querySelector('.pl-sleep')?.textContent || '', /수면 기록을 저장하지 못했어요/);
// 수면 줄의 「다시 저장」으로 성공해도 창 닫기·되돌리기 토스트가 똑같이 나온다(오타 2차)
click([...host.querySelectorAll('.pl-sleep button')].find((b) => b.textContent === '다시 저장')); await flush(30);
assert.ok(serverState.v60.sleep?.['2026-10-12']?.via === 'manual', '다시 저장 성공'); assert.ok(!pop(), '재시도 성공 뒤 창이 닫힌다'); assert.ok(/수면 기록 취소/.test(document.querySelector('.pl-toast')?.textContent || ''), '되돌리기 토스트');
await closePop(); appleBody = { sleep: {}, tz: 'Asia/Seoul' };

// 10. 지난 날짜 칸: 하루 보기 전날, 한 주 보기의 어제 칸 — 자정 직전(23:30) 칸도 열리고, 일반 유형은 「자정을 넘겨요」 검증 유지, 수면은 가능
serverState = { v60: { cfg: { bed: '01:00', sleepH: 8 } } }; await fresh();
click([...host.querySelectorAll('.pl-ib')].find((b) => b.getAttribute('aria-label') === '전날')); await flush(); tapDay(1410); await flush();
assert.ok(pop(), '지난 날짜 23:30 칸도 열림'); assert.equal(document.querySelector('.pl-pop input[type=time]').value, '23:30'); assert.equal(modeBtn('계획').disabled, true);
click(chip('고정')); document.querySelector('.pl-pop input[aria-label="할 일"]').value = '늦은 약속'; click(popBtn('확정으로 넣기')); await flush(); assert.ok(!calls.some((c) => c[0] === 'add')); assert.match(lastStatus()[1], /자정을 넘겨요/);
click(chip('수면')); await flush(); ({ bed, wake } = sleepIn()); assert.equal(wake.value, '2026-10-11T23:30', '지난 날짜의 칸 시각이 기상 기본'); await closePop();
click([...host.querySelectorAll('.pl-seg button')].find((b) => b.getAttribute('aria-label') === '한 주')); await flush(); tapCol('2026-10-11', 540); await flush();
assert.ok(pop(), '한 주 보기 지난 날짜 칸'); assert.ok(host.querySelector('.pl-wkcol[data-date="2026-10-11"] .pl-selbox')); assert.equal(chip('수면').className.includes('rec'), true, '09:00 새벽대(12시 전) 칸 → 추천'); await closePop();
click([...host.querySelectorAll('.pl-seg button')].find((b) => b.getAttribute('aria-label') === '시험까지')); await flush(); tapCol('2026-10-12', 600); await flush(); assert.ok(pop(), '시험까지 보기 지난 칸'); await closePop();

console.log('plan-pastslot-dom ok');
process.exit(0);
