// 수업 창 「출석」 버튼(대표님 10/12 「출석이 안 눌러짐」): 조건별로 눌러지는지 · 눌러도 반응 없는 상태가 없는지(저장 중 표시·성공/실패 한 줄·버튼 다시 열림)
// 실행: NODE_PATH=<jsdom 경로> node school/plan-attend-dom.test.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mock } from 'node:test';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>', { pretendToBeVisual: true, url: 'http://127.0.0.1/' });
const w = dom.window;
for (const k of ['document', 'localStorage', 'requestAnimationFrame', 'innerWidth', 'innerHeight']) Object.defineProperty(globalThis, k, { value: w[k], configurable: true, writable: true });
globalThis.confirm = () => true;
mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-10-12T01:00:00Z') });   // KST 10:00 (월) — 정역학 15:00 은 아직 시작 전
globalThis.fetch = async (url, opt = {}) => {
  const json = (o) => ({ ok: true, status: 200, json: async () => o });
  if (String(url).startsWith('/api/cal')) return json({ ok: true, days: {} });
  if (String(url).startsWith('/api/study/state')) return opt.method === 'POST' ? json({ workspaceRevision: 1 }) : json({ state: { v60: {} } });
  throw new Error('unexpected fetch ' + url);
};
const { createPlan } = await import('./plan.js');
const flush = async (n = 8) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
const calls = [];
let attendImpl = async () => true;
const sessions = [];
const ctx = () => ({
  today: '2026-10-12', courses: ['정역학'], focus: () => true, inClass: () => false,
  scheduled: [{ id: 'a', courseId: 'c1', course: '정역학', date: '2026-10-12', s: '15:00', e: '16:30', room: '1공 409', record: {} }],
  classSlots: [{ id: 'c1', name: '정역학', slots: [{ d: 1, s: '15:00', e: '16:30', room: '1공 409' }] }], holidays: [], term: { start: '2026-09-01', end: '2026-12-21' },
  sessions, plans: [], calendarOk: true, calendar: [], routine: { grid: {} }, deadlines: [], courseName: () => '정역학', courseId: () => 'c1', exams: [], dailyCap: 4,
  addPlan: async () => [], updatePlan: async () => true, deletePlan: async () => true, deletePlans: async () => [], restorePlans: async () => true,
  attend: (...a) => { calls.push(['attend', ...a]); return attendImpl(...a); }, reload: () => {},
});
const host = document.getElementById('h');
const plan = createPlan({ status: (m, bad) => calls.push(['status', m, !!bad]) });
await plan.render(host, ctx()); await flush();
const click = (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 100, clientY: 100 }));
const blk = (t) => [...host.querySelectorAll('.pl-blk.k-class')].find((b) => b.textContent.includes(t));
const attBtns = () => [...document.querySelectorAll('.pl-pop .pl-prow')].find((r) => r.firstChild.textContent === '출석').querySelectorAll('.pl-pick button');
const msg = () => document.querySelector('.pl-pop .pl-attmsg');
const open = async () => { click(blk('정역학')); await flush(); };
const closePop = () => { document.querySelector('.pl-pop')?.remove(); };
const lastAttend = () => calls.filter((c) => c[0] === 'attend').pop();
const nAttend = () => calls.filter((c) => c[0] === 'attend').length;

// 1. 오늘, 수업 시작 전(10:00 < 15:00) — 눌러지고, 저장되고, 눌림 표시 + 「출석 저장했어요」
await open();
assert.ok([...attBtns()].every((b) => !b.disabled), '오늘 시작 전에도 출석 버튼이 열려 있음');
click(attBtns()[0]); await flush();
assert.deepEqual(lastAttend(), ['attend', 'c1', '2026-10-12', 'present']);
assert.equal(attBtns()[0].getAttribute('aria-pressed'), 'true');
assert.equal(msg().textContent, '출석 저장했어요'); assert.ok(!msg().classList.contains('bad'));
assert.ok([...attBtns()].every((b) => !b.disabled), '성공 뒤 버튼 다시 열림');
closePop();

// 2. 저장 중에는 모두 잠기고 「저장 중…」, 두 번 눌러도 요청은 한 번. 끝나면 풀림
let release; attendImpl = () => new Promise((r) => { release = r; });
const before = nAttend();
await open(); click(attBtns()[1]); await flush();
assert.equal(msg().textContent, '저장 중…'); assert.ok([...attBtns()].every((b) => b.disabled), '저장 중 잠김'); assert.equal(attBtns()[1].getAttribute('aria-busy'), 'true');
click(attBtns()[2]); await flush();
assert.equal(nAttend(), before + 1, '저장 중 다시 눌러도 요청 한 번');
release(true); await flush();
assert.equal(attBtns()[1].getAttribute('aria-pressed'), 'true'); assert.equal(msg().textContent, '지각 저장했어요'); assert.ok([...attBtns()].every((b) => !b.disabled));
closePop();

// 3. 서버가 거절(false) — 이유가 창 안에, 눌림 표시는 그대로, 버튼 다시 열림
attendImpl = async () => false;
await open(); click(attBtns()[2]); await flush();
assert.equal(msg().textContent, '저장하지 못했어요 · 다시 눌러요'); assert.ok(msg().classList.contains('bad'));
assert.equal(attBtns()[2].getAttribute('aria-pressed'), 'false'); assert.ok([...attBtns()].every((b) => !b.disabled));
closePop();

// 4. 서버 이유(error) — 미래 거절 문구는 풀어서, 알 수 없는 오류는 괄호로 덧붙임
attendImpl = async () => ({ error: '미래 수업의 출석을 확정할 수 없습니다.' });
await open(); click(attBtns()[0]); await flush();
assert.match(msg().textContent, /아직 오지 않은 날의 수업이라 출석을 정할 수 없어요/); assert.ok([...attBtns()].every((b) => !b.disabled)); closePop();
attendImpl = async () => ({ error: '다른 화면에서 기록이 바뀌었습니다. 다시 불러온 뒤 적용해주세요.' });
await open(); click(attBtns()[0]); await flush();
assert.match(msg().textContent, /^저장하지 못했어요 · 다시 눌러요 \(다른 화면에서/); closePop();

// 5. 예외(연결 끊김 등)가 나도 버튼이 영구히 잠기지 않음
attendImpl = async () => { throw new Error('Load failed'); };
await open(); click(attBtns()[3]); await flush();
assert.equal(msg().textContent, '저장 여부를 확인하지 못했어요 · 새로고침해서 확인해요'); assert.ok([...attBtns()].every((b) => !b.disabled), 'finally 로 풀림');
// 실패 뒤 다시 누르면 성공
attendImpl = async () => true; click(attBtns()[3]); await flush();
assert.equal(attBtns()[3].getAttribute('aria-pressed'), 'true'); assert.equal(msg().textContent, '공결 저장했어요'); closePop();


// 5-1. 응답이 없던 실패(unknown) / 같은 수업 출결이 그 사이 바뀜 — 문구가 다르고, 버튼은 풀림
attendImpl = async () => ({ error: 'Load failed', unknown: true });
await open(); click(attBtns()[0]); await flush();
assert.equal(msg().textContent, '저장 여부를 확인하지 못했어요 · 새로고침해서 확인해요'); assert.ok([...attBtns()].every((b) => !b.disabled)); closePop();
attendImpl = async () => ({ error: '그 사이 다른 곳에서 이 수업의 출결이 바뀌었어요. 새로 불러왔으니 확인하고 다시 눌러요.' });
await open(); click(attBtns()[0]); await flush();
assert.match(msg().textContent, /^그 사이 다른 곳에서 이 수업의 출결이 바뀌었어요/); assert.equal(attBtns()[0].getAttribute('aria-pressed'), 'false'); closePop();

attendImpl = async () => ({ error: '현재 출결이 요청한 값과 달라요. 확인하고 다시 눌러요.' }); await open(); click(attBtns()[0]); await flush();
assert.equal(msg().textContent, '현재 출결이 요청한 값과 달라요. 확인하고 다시 눌러요.'); closePop();
attendImpl = async () => ({ error: '학기가 바뀌었어요. 새로 불러왔으니 확인하고 다시 눌러요.' }); await open(); click(attBtns()[0]); await flush();
assert.match(msg().textContent, /^학기가 바뀌었어요/); closePop();

// 5-2. 출석 저장 중에는 휴강 버튼도 잠기고, 휴강 저장 중에는 출석 버튼이 잠김(교차 클릭 방지)
{
  let rel; attendImpl = () => new Promise((r) => { rel = r; });
  const n1 = nAttend(); await open(); click(attBtns()[0]); await flush();
  const cb = () => [...document.querySelectorAll('.pl-pop button')].find((b) => b.textContent === '휴강으로 표시' || b.textContent === '정말 휴강');
  assert.ok(cb().disabled, '출석 저장 중 휴강 잠김'); click(cb()); await flush(); assert.equal(nAttend(), n1 + 1);
  rel(true); await flush(); assert.ok(!cb().disabled && [...attBtns()].every((b) => !b.disabled)); closePop();
  await open(); click(cb()); await flush(); assert.equal(cb().textContent, '정말 휴강'); click(cb()); await flush();   // 두 번째 누름 = 저장 중
  assert.ok([...attBtns()].every((b) => b.disabled), '휴강 저장 중 출석 잠김'); click(attBtns()[0]); await flush(); assert.equal(nAttend(), n1 + 2, '휴강 저장 중 출석 요청 안 감');
  rel({ error: '서버 오류' }); await flush(); assert.ok([...attBtns()].every((b) => !b.disabled) && !cb().disabled); assert.equal(cb().textContent, '휴강으로 표시'); closePop();
}

// 6. attend 함수 자체가 없는 화면 — 조용히 넘기지 않고 이유를 보여 줌
{
  await plan.render(host, { ...ctx(), attend: undefined }); await flush(); await open(); click(attBtns()[0]); await flush();
  assert.match(msg().textContent, /저장할 수 없어요/); assert.ok([...attBtns()].every((b) => !b.disabled)); closePop();
}

// 7. 지난날(10/9 금)은 눌러짐 — 전날로 넘겨 열기
attendImpl = async () => true;
{
  const c3 = { ...ctx(), classSlots: [{ id: 'c1', name: '정역학', slots: [{ d: 1, s: '15:00', e: '16:30' }, { d: 5, s: '09:00', e: '10:30' }] }] };
  await plan.render(host, c3); await flush();
  const prev = () => host.querySelector('.pl-bar button[aria-label="전날"]');
  for (let i = 0; i < 3; i++) { click(prev()); await flush(); }   // 10/9(금)
  assert.match(host.querySelector('.pl-schedule .pl-head small').textContent, /10\/09/);
  await open(); assert.ok([...attBtns()].every((b) => !b.disabled), '지난날 출석 버튼 열림'); assert.ok(!document.querySelector('.pl-pop').textContent.includes('미래 수업'));
  attendImpl = async () => { await plan.render(host, c3); return true; };   // 저장하면 workspace 가 홈을 다시 그린다
  click(attBtns()[0]); await flush(); assert.deepEqual(lastAttend(), ['attend', 'c1', '2026-10-09', 'present']); assert.equal(msg().textContent, '출석 저장했어요');
  assert.match(host.querySelector('.pl-schedule .pl-head small').textContent, /10\/09/, '저장 뒤에도 보던 날(지난날) 유지'); closePop(); attendImpl = async () => true;
}

// 8. 내일(10/13 화) — 날짜가 미래라 닫혀 있고, 이유 안내가 날짜와 함께 보이며, 눌러도 요청이 가지 않음. 휴강 표시는 가능(실패하면 이유가 보임)
{
  const c4 = { ...ctx(), classSlots: [{ id: 'c1', name: '정역학', slots: [{ d: 2, s: '09:00', e: '10:30' }] }] };
  await plan.render(host, c4); await flush(); click(host.querySelector('.pl-bar .pl-today')); await flush();
  click(host.querySelector('.pl-bar button[aria-label="다음 날"]')); await flush();
  const n0 = nAttend();
  await open(); assert.ok([...attBtns()].every((b) => b.disabled), '미래 날짜는 닫힘');
  assert.match(document.querySelector('.pl-pop').textContent, /미래 수업은 출석을 정할 수 없어요 · 10\/13\(화\) 그날부터 눌러요/);
  click(attBtns()[0]); await flush(); assert.equal(nAttend(), n0, '미래는 요청 안 감');
  attendImpl = async () => ({ error: '서버 오류' });
  const cancel = [...document.querySelectorAll('.pl-pop button')].find((b) => b.textContent === '휴강으로 표시'); click(cancel); await flush();
  assert.equal(cancel.textContent, '정말 휴강'); click(cancel); await flush();
  assert.equal(cancel.textContent, '휴강으로 표시'); assert.ok(!cancel.disabled); assert.match(msg().textContent, /저장하지 못했어요/); closePop();
}

// 9. 휴강 성공이면 창이 닫힘
attendImpl = async () => true;
await plan.render(host, ctx()); await flush(); click(host.querySelector('.pl-bar .pl-today')); await flush(); await open();   // 저장 직후엔 보던 날을 유지(keepDay)하므로 오늘로 되돌아온다
{
  const cancel = [...document.querySelectorAll('.pl-pop button')].find((b) => b.textContent === '휴강으로 표시'); click(cancel); await flush(); click(cancel); await flush();
  assert.ok(!document.querySelector('.pl-pop'), '휴강 성공 뒤 창 닫힘');
}
console.log('plan-attend-dom: ok'); process.exit(0);
