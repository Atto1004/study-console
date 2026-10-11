// 수면 줄 화면 동작(jsdom): 버튼 · 저장 후에만 잘 자요 화면 · 저장 실패/재시도 · 409(다른 기기가 먼저 기록) · 아침 확인 · 요약
// 실행: NODE_PATH=<jsdom 경로> node school/plan-sleep-dom.test.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mock } from 'node:test';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>', { pretendToBeVisual: true, url: 'http://127.0.0.1/' });
const w = dom.window;
for (const k of ['document', 'localStorage', 'requestAnimationFrame', 'innerWidth', 'innerHeight']) Object.defineProperty(globalThis, k, { value: w[k], configurable: true, writable: true });
globalThis.confirm = () => true;
const KST = (iso) => Date.parse(iso + '+09:00');
mock.timers.enable({ apis: ['Date'], now: KST('2026-10-12T23:40:20') });

let serverState = { v60: {} }, posts = [], failPosts = 0, conflictOnce = null;
globalThis.fetch = async (url, opt = {}) => {
  const json = (o, status = 200) => ({ ok: status < 300, status, json: async () => o });
  if (String(url).startsWith('/api/cal')) return json({ ok: true, days: {} });
  if (String(url).startsWith('/api/study/state')) {
    if (opt.method === 'POST') {
      if (failPosts > 0) { failPosts--; return json({ error: 'x' }, 500); }
      if (conflictOnce) { const c = conflictOnce; conflictOnce = null; serverState = c; return json({ error: 'conflict' }, 409); }
      const body = JSON.parse(opt.body); posts.push(body); serverState = JSON.parse(JSON.stringify(body.state)); return json({ workspaceRevision: posts.length });
    }
    return json({ state: JSON.parse(JSON.stringify(serverState)) });
  }
  throw new Error('unexpected fetch ' + url);
};
const { createPlan } = await import('./plan.js');
const flush = async (n = 8) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
const calls = [];
const ctx = () => ({ today: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date()), courses: ['정역학'], focus: () => true, inClass: () => false, scheduled: [], classSlots: [], holidays: null, term: null, sessions: [], plans: [], calendarOk: true, calendar: [], routine: { grid: {} }, deadlines: [], courseName: () => '', courseId: () => undefined, exams: [], dailyCap: 4, addPlan: async () => true, updatePlan: async () => true, deletePlan: async () => true, deletePlans: async () => [], restorePlans: async () => true, attend: async () => true, reload: () => {} });
const host = document.getElementById('h');
const plan = createPlan({ status: (m, bad) => calls.push(['status', m, !!bad]) });
const click = (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
const sleepEl = () => host.querySelector('.pl-sleep');
const btn = (t, root = document) => [...root.querySelectorAll('button')].find((b) => b.textContent.trim() === t);
const lastStatus = () => calls.filter((c) => c[0] === 'status').pop();
const rerender = async () => { await plan.render(host, ctx()); await flush(); };
const setNow = (iso) => mock.timers.setTime(KST(iso));
const emoji = /\p{Extended_Pictographic}/u;
const unlock = () => { document.querySelector('.pl-night')?.remove(); [...document.body.children].forEach((n) => { n.inert = false; }); };

// 1. 수면 시간대(23:40)엔 버튼. 아이콘 버튼(달 모양 SVG)이고 이모지 없음
await rerender();
let bar = sleepEl(); assert.ok(bar, '수면 줄'); const go = btn('자기 전 접속 종료', bar); assert.ok(go, '버튼');
assert.ok(go.querySelector('svg'), '달 아이콘'); assert.ok(go.getAttribute('aria-label').includes('자기 전 접속 종료')); assert.ok(!emoji.test(bar.textContent), '이모지 없음');

// 2. 누르면 저장 → 저장된 뒤에야 잘 자요 화면. 중복 클릭은 한 번만. 기록은 클릭 순간 값(bed 23:40, 키=기상일)
posts.length = 0; click(go); click(go); await flush(12);
assert.equal(posts.length, 1, '두 번 눌러도 저장 1회');
const rec = posts[0].state.v60.sleep['2026-10-13']; assert.equal(rec.bed, '23:40'); assert.equal(rec.src, 'app'); assert.equal(rec.bedAt, '2026-10-12T23:40:20+09:00'); assert.equal(rec.wake, undefined); assert.equal(rec.wakeAt, undefined);
let night = document.querySelector('.pl-night'); assert.ok(night, '잘 자요 화면');
assert.equal(night.getAttribute('role'), 'dialog'); assert.equal(night.getAttribute('aria-modal'), 'true'); assert.equal(document.getElementById('pl-night-t').textContent, '잘 자요');
assert.ok(night.textContent.includes('23:40 취침 기록') && night.textContent.includes('잠든 시각이 아니라서') && night.textContent.includes('이제 화면을 닫아 주세요'));
assert.ok(btn('기록 취소', night) && btn('앱으로 돌아가기', night)); assert.ok(!emoji.test(night.textContent));
assert.ok([...document.body.children].filter((n) => n !== night).every((n) => n.inert === true), '배경 inert');
document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await flush();
assert.ok(!document.querySelector('.pl-night'), 'Esc 로 닫힘'); assert.ok([...document.body.children].every((n) => !n.inert), 'inert 복원');

// 3. 닫은 뒤: 버튼 대신 「취침 기록됨」 + 다시 기록 + 기록 지우기(영구 컨트롤)
bar = sleepEl(); assert.ok(!btn('자기 전 접속 종료', bar)); assert.ok(bar.textContent.includes('23:40 취침 기록됨')); assert.ok(btn('다시 기록', bar) && btn('기록 지우기', bar));

// 4. 같은 밤 다시 기록: 확인 없이 바꾸고, 이전 값은 잘 자요 화면의 취소로 복원
setNow('2026-10-13T00:10:05'); await rerender();
click(btn('다시 기록', sleepEl())); await flush(12);
assert.equal(serverState.v60.sleep['2026-10-13'].bed, '00:10'); night = document.querySelector('.pl-night'); assert.ok(night);
click(btn('이전 취침 기록으로 되돌리기', night)); await flush(12);
assert.equal(serverState.v60.sleep['2026-10-13'].bed, '23:40', '이전 기록 복원(타임스탬프 포함)'); assert.equal(serverState.v60.sleep['2026-10-13'].bedAt, '2026-10-12T23:40:20+09:00');
assert.ok(!document.querySelector('.pl-night')); unlock();

// 5. 저장 실패: 잘 자요 화면·「기록됨」을 만들지 않고 실패 줄 + 다시 저장(누른 시각 보존). 성공하면 그때 화면
serverState = { v60: {} }; posts.length = 0; setNow('2026-10-12T23:41:00'); await rerender();
failPosts = 3; click(btn('자기 전 접속 종료', sleepEl())); await flush(14);
bar = sleepEl(); assert.ok(bar.textContent.includes('저장하지 못했어요')); assert.ok(!document.querySelector('.pl-night'), '저장 전엔 잘 자요 화면 없음'); assert.ok(!bar.textContent.includes('취침 기록됨'));
assert.ok(!btn('자기 전 접속 종료', bar), '실패 중엔 같은 버튼을 또 누르게 두지 않음');
setNow('2026-10-12T23:55:00'); failPosts = 0; click(btn('다시 저장', bar)); await flush(14);   // 재시도할 때 시각이 흘렀어도 클릭 당시 시각 그대로
assert.equal(serverState.v60.sleep['2026-10-13'].bed, '23:41'); assert.equal(serverState.v60.sleep['2026-10-13'].bedAt, '2026-10-12T23:41:00+09:00');
assert.ok(document.querySelector('.pl-night')); unlock();

// 6. 두 기기 동시: 내가 누르는 순간 다른 기기가 먼저 저장(409) → 덮어쓰지 않고 「이미 기록」 안내, 잘 자요 화면은 기존 기록 시각으로
serverState = { v60: {} }; posts.length = 0; calls.length = 0; setNow('2026-10-12T23:50:00'); await rerender();
conflictOnce = { v60: { sleep: { '2026-10-13': { bed: '23:30', src: 'app', bedAt: '2026-10-12T23:30:00+09:00' } } } };
click(btn('자기 전 접속 종료', sleepEl())); await flush(16);
assert.equal(serverState.v60.sleep['2026-10-13'].bed, '23:30', '먼저 저장된 값 유지'); assert.ok(lastStatus()[1].includes('이미 취침을 기록했어요'));
night = document.querySelector('.pl-night'); assert.ok(night && night.textContent.includes('23:30 취침 기록') && !btn('기록 취소', night), '기존 기록 시각, 내가 쓴 게 아니라 취소 없음');
unlock();

// 7. 아침 확인(07:30): 「자러 간 기록이 있어요 · 기상 시각 없음」 + 일어났어요 / 시각 고치기. 일어났어요 → 기상 기록 + 요약
setNow('2026-10-13T07:30:30'); await rerender();
bar = sleepEl(); assert.ok(bar.textContent.includes('23:30에 자러 간 기록이 있어요') && bar.textContent.includes('기상 시각 없음')); assert.ok(!bar.textContent.includes('잤어요'));
assert.ok(btn('일어났어요', bar) && btn('시각 고치기', bar)); assert.ok(!btn('자기 전 접속 종료', bar));
click(btn('일어났어요', bar)); await flush(12);
const done = serverState.v60.sleep['2026-10-13']; assert.equal(done.wake, '07:30'); assert.equal(done.wakeAt, '2026-10-13T07:30:30+09:00'); assert.equal(done.src, 'app');
bar = sleepEl(); assert.ok(bar.textContent.includes('어젯밤 취침 기록 23:30 · 기상 07:30') && bar.textContent.includes('취침–기상 간격 8시간') && bar.textContent.includes('수면 추정, 실제와 다를 수 있어요'), bar.textContent);
assert.ok(bar.textContent.includes('Apple 건강 수면이 있는 날'));

// 8. 시각 고치기: 입력으로 기상 시각을 정함(하루 지난 뒤에도 기록의 기상일에 붙음)
serverState = { v60: { sleep: { '2026-10-13': { bed: '23:40', src: 'app', bedAt: '2026-10-12T23:40:00+09:00' } } } }; setNow('2026-10-14T09:00:00'); await rerender();
bar = sleepEl(); assert.ok(bar.textContent.includes('(10/13(화) 기록)'), bar.textContent); assert.ok(!btn('일어났어요', bar), '하루 지난 기록엔 지름길 없음');
click(btn('시각 고치기', bar)); await flush(); const inp = sleepEl().querySelector('.pl-sleep-edit input'); assert.ok(inp && inp.getAttribute('aria-label').includes('기상 시각'));
inp.value = '07:15'; sleepEl().querySelector('.pl-sleep-edit').dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true })); await flush(12);
assert.equal(serverState.v60.sleep['2026-10-13'].wake, '07:15'); assert.equal(serverState.v60.sleep['2026-10-13'].wakeAt, '2026-10-13T07:15:00+09:00');

// 9. 아무것도 안 하면 지어내지 않는다: 대기 줄만, wake 없음
serverState = { v60: { sleep: { '2026-10-14': { bed: '23:40', src: 'app', bedAt: '2026-10-13T23:40:00+09:00' } } } }; setNow('2026-10-14T15:00:00'); posts.length = 0; await rerender();
bar = sleepEl(); assert.ok(bar.textContent.includes('기상 시각 없음') && !btn('일어났어요', bar), '12시 이후엔 지름길 없음'); assert.equal(posts.length, 0); assert.equal(serverState.v60.sleep['2026-10-14'].wake, undefined);

// 10. 수면 시간대에 들어오면 1분 틱 없이도 repaint 로 버튼이 생김 / 같은 문구면 줄을 안 바꿈
serverState = { v60: {} }; setNow('2026-10-14T22:59:00'); await rerender(); assert.ok(!sleepEl());
setNow('2026-10-14T23:00:00'); plan._repaintSleep(); assert.ok(btn('자기 전 접속 종료', sleepEl()));
const node = sleepEl(); plan._repaintSleep(); assert.equal(sleepEl(), node, '같은 상태면 그대로(재낭독 방지)');
console.log('plan-sleep-dom ok');
process.exit(0);
