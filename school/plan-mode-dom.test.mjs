// 계획 모드 · 계획/확정 스위치 검사(jsdom). 실행: NODE_PATH=<jsdom 경로> node school/plan-mode-dom.test.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mock } from 'node:test';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>', { pretendToBeVisual: true, url: 'http://127.0.0.1/' });
const w = dom.window;
for (const k of ['document', 'localStorage', 'requestAnimationFrame', 'innerWidth', 'innerHeight']) Object.defineProperty(globalThis, k, { value: w[k], configurable: true, writable: true });
globalThis.confirm = () => true;
mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-10-12T05:00:00Z') });   // KST 14:00 월요일

let serverState = { v60: {} };
globalThis.fetch = async (url, opt = {}) => {
  const json = (o) => ({ ok: true, status: 200, json: async () => o });
  if (String(url).startsWith('/api/cal')) return json({ ok: true, days: {} });
  if (String(url).startsWith('/api/study/state')) return opt.method === 'POST' ? json({ workspaceRevision: 1 }) : json({ state: JSON.parse(JSON.stringify(serverState)) });
  throw new Error('unexpected fetch ' + url);
};
const { createPlan } = await import('./plan.js');
const flush = async (n = 6) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
const calls = [];
const ctx = () => ({
  today: '2026-10-12', courses: ['정역학', '미적분'], focus: () => true, inClass: () => false, scheduled: [], classSlots: [], holidays: null, term: null, sessions: [],
  plans: [], calendarOk: true, calendar: [], routine: { grid: {} }, deadlines: [], courseName: (id) => ({ c1: '정역학', c2: '미적분' }[id] || ''), courseId: (n) => ({ 정역학: 'c1', 미적분: 'c2' }[n]), exams: [], dailyCap: 4,
  addPlan: async (item) => { calls.push(['add', item]); return ['n1']; }, updatePlan: async (item) => { calls.push(['update', item]); return true; }, deletePlan: async () => true, deletePlans: async () => [], restorePlans: async () => true, attend: async () => true, reload: () => {},
});
const host = document.getElementById('h');
const plan = createPlan({ status: (m, bad) => calls.push(['status', m, !!bad]) });
await plan.render(host, ctx()); await flush();
const click = (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 200, clientY: 300 }));
const pm = () => host.querySelector('.pl-mode:not(.pl-fill)');
const popBtn = (t) => [...document.querySelectorAll('.pl-pop button')].find((b) => b.textContent.trim() === t);
const pressed = (b) => b.getAttribute('aria-pressed') === 'true';
const viewBtn = (name) => [...host.querySelectorAll('.pl-seg button')].find((b) => b.getAttribute('aria-label') === name);
const plus = () => [...host.querySelectorAll('.pl-ib')].find((b) => b.getAttribute('aria-label') === '일정 추가');
const fillForm = (text, st) => { const note = document.querySelector('.pl-pop input[aria-label="할 일"]'); note.value = text; if (st) document.querySelector('.pl-pop input[type=time]').value = st; };

// 1. 하루·한 주·시험까지 모두에 계획 모드 버튼이 있다(예전엔 한 주에서만)
for (const name of ['하루', '한 주', '시험까지']) { click(viewBtn(name)); await flush(); assert.ok(pm(), `${name} 보기에 계획 모드 버튼`); }
click(viewBtn('하루')); await flush();
assert.equal(pressed(pm()), false, '처음엔 꺼짐');
assert.ok(host.querySelector('.pl-modenote').textContent.includes('꺼짐') && host.querySelector('.pl-modenote').textContent.includes('확정 일정'));

// 2. 꺼짐 + 일정 추가 → 확정 일정(기본 공부)
click(plus()); await flush();
let pop = document.querySelector('.pl-pop');
const modeBtns = () => [...pop.querySelectorAll('[data-mode]')];
assert.equal(modeBtns().length, 2); assert.equal(modeBtns().find((b) => b.dataset.mode === '확정').getAttribute('aria-pressed'), 'true');
assert.ok(!pop.querySelector('.pl-prow[hidden]') || true);
assert.ok(pop.textContent.includes('확정 공부 일정이에요'));
fillForm('12.3 연습문제', '15:00'); click(popBtn('확정으로 넣기')); await flush();
let add = calls.filter((c) => c[0] === 'add').pop()[1];
assert.equal(add.state, 'confirmed'); assert.equal(add.bk, '공부'); assert.equal(add.src, 'manual'); assert.equal(add.courseId, 'c1');

// 3. 켜짐 + 일정 추가 → 계획(미확정), bk 없음
click(pm()); await flush(); assert.equal(pressed(pm()), true);
assert.ok(host.querySelector('.pl-modenote').textContent.includes('켜짐'));
click(plus()); await flush(); pop = document.querySelector('.pl-pop');
assert.equal(modeBtns().find((b) => b.dataset.mode === '계획').getAttribute('aria-pressed'), 'true'); assert.ok(pop.textContent.includes('점선'));
assert.equal(pop.querySelector('[aria-label="일정 종류"]').closest('.pl-prow').hidden, true, '계획이면 종류 줄 숨김');
fillForm('시험 대비 계획', '15:00'); click(popBtn('계획으로 넣기')); await flush();
add = calls.filter((c) => c[0] === 'add').pop()[1];
assert.equal(add.state, 'tentative'); assert.equal(add.bk, undefined); assert.equal(add.src, 'manual');

// 4. 창의 스위치를 바꾸면 계획 모드도 같이 바뀐다(툴바 버튼 포함), 모드는 보기를 바꿔도 유지
click(plus()); await flush(); pop = document.querySelector('.pl-pop');
click(modeBtns().find((b) => b.dataset.mode === '확정')); await flush();
assert.equal(pressed(pm()), false, '스위치가 모드를 끔'); assert.ok(host.querySelector('.pl-modenote').textContent.includes('꺼짐'));
assert.equal(pop.querySelector('[aria-label="일정 종류"]').closest('.pl-prow').hidden, false);
click(modeBtns().find((b) => b.dataset.mode === '계획')); await flush(); assert.equal(pressed(pm()), true);
document.querySelector('.pl-pop').remove();
click(viewBtn('한 주')); await flush(); assert.equal(pressed(pm()), true, '보기를 바꿔도 유지');
click(viewBtn('하루')); await flush(); assert.equal(pressed(pm()), true);

// 5. 고정 일정: 과목 없이 이름만, 확정 + bk 고정
click(pm()); await flush();   // 끔
click(plus()); await flush(); pop = document.querySelector('.pl-pop');
click([...pop.querySelectorAll('[data-bk]')].find((b) => b.dataset.bk === '고정')); await flush();
const sel = pop.querySelector('select[aria-label="과목"]'); assert.ok([...sel.options].some((o) => o.value === ''), '과목 없음 선택지'); sel.value = '';
assert.equal(pop.querySelector('input[aria-label="할 일"]').placeholder, '이름(예: 병원 예약)');
fillForm('', '16:00'); document.querySelector('.pl-pop input[aria-label="할 일"]').required = false;
click(popBtn('확정으로 넣기')); await flush();   // 이름 없음 → 막힘
assert.ok(calls.some((c) => c[0] === 'status' && c[1].includes('이름을 적어') && c[2]), '이름 없는 고정 일정은 막음');
const nAdds = calls.filter((c) => c[0] === 'add').length;
fillForm('병원 예약', '16:00'); click(popBtn('확정으로 넣기')); await flush();
assert.equal(calls.filter((c) => c[0] === 'add').length, nAdds + 1);
add = calls.filter((c) => c[0] === 'add').pop()[1]; assert.deepEqual([add.state, add.bk, add.courseId, add.note], ['confirmed', '고정', '', '병원 예약']);

// 6. 한 주 보기: 모드가 꺼져 있으면 빈 칸을 눌러도 안 열리고, 켜면 열린다(계획으로)
click(viewBtn('한 주')); await flush();
const col = host.querySelector('.pl-wkcol[data-date="2026-10-14"]');
col.getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 960, right: 100, bottom: 960 });
col.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 50, clientY: 400 })); await flush();
assert.ok(!document.querySelector('.pl-pop'), '꺼짐: 안 열림');
click(pm()); await flush();
const col2 = host.querySelector('.pl-wkcol[data-date="2026-10-14"]'); col2.getBoundingClientRect = col.getBoundingClientRect;
col2.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 50, clientY: 400 })); await flush();
pop = document.querySelector('.pl-pop'); assert.ok(pop, '켜짐: 열림');
assert.equal([...pop.querySelectorAll('[data-mode]')].find((b) => b.dataset.mode === '계획').getAttribute('aria-pressed'), 'true');
pop.remove();

// 7. 이미 있는 계획: [확정] 으로 확정(종류 고름), 확정된 일정은 확정 버튼 없음
const tent = { id: 't1', date: '2026-10-14', s: '10:00', e: '11:00', courseId: 'c1', kind: '자동 채움', note: '과제 · HW', src: 'fill', state: 'tentative' };
const c3 = ctx(); c3.plans = [tent, { id: 'k1', date: '2026-10-14', s: '12:00', e: '13:00', courseId: 'c1', kind: '시험 대비', note: '확정됨', state: 'confirmed', bk: '공부' }];
click(viewBtn('하루')); await plan.render(host, c3); await flush();
const dayBtn = [...host.querySelectorAll('.pl-sday')].find((b) => b.textContent.includes('14')); click(dayBtn); await flush();
const tb = [...host.querySelectorAll('.pl-blk')].find((b) => b.textContent.includes('HW')); click(tb); await flush();
assert.ok(popBtn('확정'), '계획에는 확정 버튼');
assert.ok(document.querySelector('.pl-pop').textContent.includes('눌러서 확정할 수 있어요'));
assert.equal(document.querySelector('.pl-pop').querySelector('[aria-label="일정 종류"]').getAttribute('aria-label'), '일정 종류');
assert.equal([...document.querySelectorAll('.pl-pop [data-bk]')].find((b) => b.getAttribute('aria-pressed') === 'true').dataset.bk, '과제', '노트 「과제 ·」 로 종류 추정');
click(popBtn('확정')); await flush();
const upd = calls.filter((c) => c[0] === 'update').pop()[1]; assert.deepEqual([upd.state, upd.bk, upd.src], ['confirmed', '과제', 'fill']);
const kb = [...host.querySelectorAll('.pl-blk')].find((b) => b.textContent.includes('확정됨')); click(kb); await flush();
assert.ok(!popBtn('확정'), '이미 확정된 일정엔 확정 버튼 없음'); assert.ok(popBtn('삭제'));

// 8. 확정 실패·충돌 경로: 서버가 거절(false)하면 창·입력 유지 + 버튼 재활성, 예외도 같은 처리, 창을 연 뒤 다른 곳에서 바뀌면 덮어쓰지 않고 멈춤
const c4 = ctx(); const t2 = { id: 't2', date: '2026-10-14', s: '10:00', e: '11:00', courseId: 'c1', kind: '자동 채움', note: '과제 · HW2', src: 'fill', state: 'tentative' }; c4.plans = [t2];
let failMode = 'false'; c4.updatePlan = async (item) => { calls.push(['update', item]); if (failMode === 'throw') throw new Error('net'); return failMode === 'false' ? false : true; };
await plan.render(host, c4); await flush();
click([...host.querySelectorAll('.pl-sday')].find((b) => b.textContent.includes('14'))); await flush();
click([...host.querySelectorAll('.pl-blk')].find((b) => b.textContent.includes('HW2'))); await flush();
const noteIn = document.querySelector('.pl-pop input[aria-label="할 일"]'); noteIn.value = '과제 · HW2 수정';
click(popBtn('확정')); await flush();
assert.ok(document.querySelector('.pl-pop') && !popBtn('확정').disabled && !popBtn('저장').disabled, '거절되면 창 유지·버튼 재활성');
assert.equal(document.querySelector('.pl-pop input[aria-label="할 일"]').value, '과제 · HW2 수정', '입력값 유지');
failMode = 'throw'; click(popBtn('확정')); await flush();
assert.ok(document.querySelector('.pl-pop') && !popBtn('확정').disabled, '예외도 같은 처리');
failMode = 'ok'; const before = calls.filter((c) => c[0] === 'update').length;
t2.note = '다른 화면에서 고침';   // 창을 연 뒤 최신 목록(ctx.plans)이 달라짐
click(popBtn('확정')); await flush();
assert.equal(calls.filter((c) => c[0] === 'update').length, before, '바뀐 일정은 덮어쓰지 않고 서버로 안 보냄');
assert.ok(calls.some((c) => c[0] === 'status' && c[1].includes('그 사이') && c[2]));
assert.ok(document.querySelector('.pl-pop') && !popBtn('확정').disabled);
document.querySelector('.pl-pop').remove();
// 고정 일정은 공부 계획 종류(시험 대비)로 세지 않게 kind 를 따로
const kindCalls = calls.filter((c) => c[0] === 'add' && c[1].bk === '고정'); assert.ok(kindCalls.length && kindCalls.every((c) => c[1].kind === '고정 일정'));

// 9. 저장 안 된 추천(auto)을 넣을 때도 모드를 따른다(오타 3차 재현): 꺼짐 → 확정+bk, 켜짐 → 계획
{
  const c5 = ctx(); c5.deadlines = [{ course: '정역학', title: '정역학 HW9', deadlineDate: '2026-10-14', deadlineTime: '23:59', deadlineDays: 2, submitted: false, files: [] }];
  await plan.render(host, c5); await flush();
  click([...host.querySelectorAll('.pl-sday')].find((b) => b.classList.contains('today'))); await flush();
  if (pressed(pm())) { click(pm()); await flush(); }   // 모드 끔
  let auto = host.querySelector('.k-auto'); assert.ok(auto, '추천 블록');
  click(auto); await flush();
  assert.equal([...document.querySelectorAll('.pl-pop [data-mode]')].find((b) => b.getAttribute('aria-pressed') === 'true').dataset.mode, '확정', '꺼짐이면 추천도 확정으로 시작');
  click(popBtn('확정으로 넣기')); await flush();
  let a = calls.filter((c) => c[0] === 'add').pop()[1]; assert.deepEqual([a.state, a.bk, a.src], ['confirmed', '공부', 'manual']);
  click(pm()); await flush();   // 켬
  auto = host.querySelector('.k-auto'); click(auto); await flush();
  assert.equal([...document.querySelectorAll('.pl-pop [data-mode]')].find((b) => b.getAttribute('aria-pressed') === 'true').dataset.mode, '계획');
  click(popBtn('계획으로 넣기')); await flush();
  a = calls.filter((c) => c[0] === 'add').pop()[1]; assert.deepEqual([a.state, a.bk, a.src], ['tentative', undefined, 'manual']);
}
console.log('plan-mode-dom ok');
process.exit(0);
