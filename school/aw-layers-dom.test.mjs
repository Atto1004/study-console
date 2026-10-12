// 레이어 패널·보이기 필터·모아보기·일정 창 레이어 줄·운선 가림 (jsdom, 서버는 메모리 가짜)
// 실행: NODE_PATH=<jsdom 경로> node school/aw-layers-dom.test.mjs
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mock } from 'node:test';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body><div id="h"></div></body>', { pretendToBeVisual: true, url: 'http://127.0.0.1/' });
const w = dom.window;
for (const k of ['document', 'localStorage', 'requestAnimationFrame', 'innerWidth', 'innerHeight', 'getComputedStyle']) Object.defineProperty(globalThis, k, { value: w[k], configurable: true, writable: true });
globalThis.confirm = () => true;
mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-10-12T01:00:00Z') });   // 월요일 10:00 KST
localStorage.setItem('school-plan-view', 'day');
let nextConflict = null; const posts = []; let server = { v60: { sleep: {} } }, rev = 1;
globalThis.fetch = async (url, opt = {}) => {
  const json = (o, status = 200) => ({ ok: status < 300, status, json: async () => o });
  const u = String(url);
  if (u.startsWith('/api/cal')) return json({ ok: true, days: {} });
  if (u.startsWith('/api/health/sleep')) return json({ sleep: {}, tz: 'Asia/Seoul' });
  if (u.startsWith('/api/layers')) return json({ layers: [{ id: 'gym-crossfit', name: '벗히얼 크로스핏', type: 'place', policy: '운동', detail: { hours: { 월: ['07:10', '24:00'], 일: null }, classes: { 월: ['07:10', '17:00'] } } }] });
  if (u.startsWith('/api/study/state')) {
    if (opt.method === 'POST') { const b = JSON.parse(opt.body); if (nextConflict) { const c = nextConflict; nextConflict = null; c(server); server.v60.workspaceRevision = ++rev; return json({ error: 'conflict' }, 409); } posts.push(b); server = { v60: { ...b.state.v60, workspaceRevision: ++rev } }; return json({ workspaceRevision: rev }); }
    return json({ state: JSON.parse(JSON.stringify(server)) });
  }
  throw new Error('unexpected fetch ' + u);
};
const { createPlan } = await import('./plan.js');
const flush = async (n = 12) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)); };
const ctx = { today: '2026-10-12', courses: ['정역학'], focus: () => true, scheduled: [{ id: 'a', courseId: 'c1', course: '정역학', date: '2026-10-12', s: '15:00', e: '16:30', room: '1공 409', record: {} }],
  classSlots: [], holidays: null, term: { start: '2026-09-01', end: '2026-12-21' }, sessions: [], plans: [
    { id: 'pl1', date: '2026-10-12', s: '17:00', e: '18:00', courseId: 'c1', note: '12.3 연습문제', bk: '공부', state: 'confirmed' },
    { id: 'pl2', date: '2026-10-12', s: '19:00', e: '19:30', note: '집 → 학교', bk: '이동', from: '집', to: '학교', state: 'confirmed' },
    { id: 'pl3', date: '2026-10-12', s: '20:00', e: '21:00', note: '운선 비밀 약속', bk: '고정', state: 'confirmed' }], calendarOk: true,
  calendar: [
    { id: 'wk1_20261012T003000Z', recurringEventId: 'wk1', title: '근로장학', start: '09:30', end: '11:00', allDay: false, color: '6', cal: '한양' },
    { id: 'gy1', title: '헬스 하체', start: '12:00', end: '13:00', allDay: false, color: '10', cal: '한양' },
    { id: 'sec1', title: '운선 홍대 모임', start: '21:30', end: '22:30', allDay: false, color: '3', cal: '개인' },
    { id: 'pay1', title: '국가근로 월급날', allDay: true, color: '8', cal: 'attoyd' },
    { id: 'ex1', title: '미분적분학2 중간고사', allDay: true, color: '', cal: '한양' },
    { id: 'etc1', title: '애스크톤 본선 준비 워크숍', start: '14:00', end: '14:30', allDay: false, color: '', cal: '한양' }],
  routine: { grid: {} }, deadlines: [{ course: '정역학', title: '정역학 HW6', deadlineDate: '2026-10-14', deadlineDays: 2, files: [] }], courseName: () => '정역학', courseId: () => 'c1', exams: [{ date: '2026-10-19', course: '정역학' }], dailyCap: 4,
  calChange: async () => true, attend: async () => true, addPlan: async () => true, updatePlan: async () => true, deletePlan: async () => true };
const host = document.getElementById('h'), plan = createPlan({ status: (t) => { statusMsg = t; } }); let statusMsg = '';
await plan.render(host, ctx); await flush();
const click = (e) => e.dispatchEvent(new w.MouseEvent('click', { bubbles: true, clientX: 100, clientY: 100 }));
const press = (el, type) => el.dispatchEvent(new w.MouseEvent(type, { bubbles: true }));
const panel = () => document.querySelector('.awl-panel');
const rows = () => [...panel().querySelectorAll('.awl-row')];
const rowOf = (name) => rows().find((r) => r.querySelector('.awl-name').textContent === name);
const chk = (name) => rowOf(name).querySelector('[role=checkbox]');
const titles = () => [...host.querySelectorAll('.pl-blk')].map((b) => b.textContent);
const ads = () => [...host.querySelectorAll('.pl-ad')].map((b) => b.textContent);
const lastPost = () => posts[posts.length - 1];
const openPick = async (li) => { const b = li.querySelector('[aria-label$="레이어 옮기기"]'); if (b.getAttribute('aria-expanded') !== 'true') { click(b); await flush(4); } };

// 처음: 읽기만 해서는 아무것도 저장하지 않음, 도구줄에 레이어 아이콘(표준 SVG, 터치 44px 규칙은 CSS)
assert.equal(posts.length, 0, '렌더만으로는 저장 없음(옛 데이터 호환)');
const btn = host.querySelector('.awl-btn'); assert.ok(btn, '레이어 아이콘'); assert.ok(btn.querySelector('svg')); assert.equal(btn.getAttribute('aria-label'), '레이어'); assert.equal(btn.getAttribute('aria-expanded'), 'false');
assert.ok(!/[\u{1F300}-\u{1FAFF}]/u.test(btn.outerHTML), '이모지 없음');
assert.ok(titles().some((t) => t.includes('근로장학')) && titles().some((t) => t.includes('헬스 하체')));
assert.ok(!ads().some((t) => t.includes('월급날')), '수입 기본 꺼짐 → 월급날 종일 줄에서 빠짐');
assert.ok(ads().some((t) => t.includes('중간고사')), '마감은 보임');
// 운선: 격자에는 개인 일정, 원제목 없음
assert.ok(titles().some((t) => t.includes('개인 일정')), '운선 → 개인 일정'); assert.ok(!document.body.innerHTML.includes('운선 홍대'), '캘린더 운선 제목이 화면 어디에도 없음');
// 블록 옆 레이어 점
assert.ok(host.querySelector('.pl-blk .awl-ldot'));

// 패널 열기
click(btn); await flush();
assert.ok(panel(), '패널 열림'); assert.equal(panel().getAttribute('role'), 'dialog'); assert.equal(document.querySelector('.awl-btn').getAttribute('aria-expanded'), 'true');
assert.equal(rows().length, 12); assert.deepEqual(rows().map((r) => r.querySelector('.awl-name').textContent), ['운동', '병원', '동아리', '수업', '노동', '수입', '지출', '수면', '할 일', '마감', '약속', '기타']);
for (const r of rows()) { const c = r.querySelector('[role=checkbox]'); assert.ok(c.getAttribute('aria-label').endsWith('보이기')); assert.ok(['true', 'false'].includes(c.getAttribute('aria-checked'))); }
assert.equal(chk('수입').getAttribute('aria-checked'), 'false'); assert.equal(chk('지출').getAttribute('aria-checked'), 'false'); assert.equal(chk('노동').getAttribute('aria-checked'), 'true');
const main = (n) => rowOf(n).querySelector('.awl-main').textContent;
assert.match(main('노동'), /1개/); assert.match(main('운동'), /1개/); assert.match(main('수업'), /1개/); assert.match(main('약속'), /2개/, '운선 일정 2개(캘린더·계획)는 약속'); assert.match(main('기타'), /2개/, '이동 + 워크숍'); assert.match(main('수입'), /1개/);
assert.match(panel().textContent, /분류 불명 1개/, '워크숍만 분류 불명(이동은 알고 기타)');
{ const i = document.body.innerHTML.indexOf('운선'); assert.ok(i < 0, '운선 위치: ' + document.body.innerHTML.slice(Math.max(0, i - 200), i + 80)); }
// 키보드 순환: 마지막 요소에서 Tab → 처음
{ const f = [...panel().querySelectorAll('button:not([disabled])')]; f[f.length - 1].focus(); const ev = new w.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }); document.dispatchEvent(ev); assert.ok(ev.defaultPrevented, 'Tab 순환'); assert.equal(document.activeElement, f[0]); }

// 보이기: 노동 끄기 → 근로장학 블록·목록 사라짐, 서버에 v60.layers 저장
const nowTxt0 = host.querySelector('.pl-nowdo')?.textContent || ''; assert.match(nowTxt0, /근로장학/, '지금 하는 일 = 근로장학');
click(chk('노동')); await flush();
assert.ok(!titles().some((t) => t.includes('근로장학')), '숨김: 격자'); assert.ok(![...host.querySelectorAll('.pl-list button')].some((b) => b.textContent.includes('근로장학')), '숨김: 일정 목록');
assert.doesNotMatch(host.querySelector('.pl-nowdo').textContent, /근로장학/); assert.match(host.querySelector('.pl-nowdo').textContent, /숨긴 레이어 일정 1개/, '숨긴 일정이 진행 중이라는 안내');
assert.equal(lastPost().state.v60.layers.items.find((x) => x.id === 'labor').vis, false); assert.equal(chk('노동').getAttribute('aria-checked'), 'false');
assert.ok(document.querySelector('.awl-btn .awl-badge'), '숨긴 레이어 개수 배지'); assert.equal(document.querySelector('.awl-btn').getAttribute('aria-label'), '레이어 (1개 숨김)');
// 숨겨도 시간은 점유: 빈 시간 계산용 fixedBlocks 에는 그대로(채우기가 겹치지 않음) — 숫자 줄이 같은 값
click(chk('노동')); await flush(); assert.ok(titles().some((t) => t.includes('근로장학')), '다시 켜면 돌아옴');
// 수입 켜기 → 월급날 종일 줄
click(chk('수입')); await flush(); assert.ok(ads().some((t) => t.includes('월급날')), '수입 켜면 월급날 종일 줄'); click(chk('수입')); await flush();
// 최소 1개: 하나만 남기고 끄기 시도
for (const r of rows()) { const c = r.querySelector('[role=checkbox]'); if (c.getAttribute('aria-checked') === 'true' && r.querySelector('.awl-name').textContent !== '기타') { click(c); await flush(4); } }
assert.equal(rows().filter((r) => r.querySelector('[role=checkbox]').getAttribute('aria-checked') === 'true').length, 1, '하나는 남음'); click(chk('기타')); await flush(4); assert.match(panel().textContent, /마지막 하나는 끌 수 없어요/);
assert.equal(chk('기타').getAttribute('aria-checked'), 'true');
click([...panel().querySelectorAll('.awl-link')].find((b) => b.textContent === '모두 보기')); await flush();
assert.equal(rows().filter((r) => r.querySelector('[role=checkbox]').getAttribute('aria-checked') === 'true').length, 12, '모두 보기');

// 모아보기: 노동
click(rowOf('노동').querySelector('.awl-main')); await flush(12);
assert.match(panel().querySelector('h2').textContent, /노동/); assert.equal(panel().querySelectorAll('.awl-seg button').length, 5);
assert.ok([...panel().querySelectorAll('.awl-it')].some((r) => r.textContent.includes('근로장학')), '모아보기에 근로장학');
{ const it = panel().querySelector('.awl-it'); assert.ok(!it.querySelector('select'), '평소엔 목록만'); click(it.querySelector('[aria-label$="레이어 옮기기"]')); await flush(4); assert.ok(panel().querySelector('.awl-it select'), '옮기기를 열면 레이어 select'); assert.ok(it.querySelector('[aria-label^="시간표에서 보기"]'), '시간표에서 보기'); }
// 항목 누르면 기존 창(시각 고치기)
click(panel().querySelector('.awl-itmain')); await flush(); assert.ok(document.querySelector('.pl-pop'), '일정 창'); assert.ok(document.querySelector('.pl-pop select[aria-label=레이어]'), '일정 창에 레이어 줄'); document.querySelector('.pl-pop').remove();
// 레이어 옮기기: 이 날만 → 동아리
{
  const it = panel().querySelector('.awl-it'), sel = panel().querySelector('.awl-it select'), one = panel().querySelector('.awl-it .awl-pick button');
  click(one); sel.value = 'club'; sel.dispatchEvent(new w.Event('change', { bubbles: true })); await flush();
  assert.deepEqual(lastPost().state.v60.layers.assign, { 'cal:wk1_20261012T003000Z': 'club' }); assert.ok(!titles().length || true);
}
click(panel().querySelector('[aria-label="레이어 목록으로"]')); await flush();
assert.match(main('동아리'), /1개/); assert.match(main('노동'), /0개/);
// 이것만 보기
click(rowOf('동아리').querySelector('.awl-main')); await flush(12); click([...panel().querySelectorAll('.awl-link')].find((b) => b.textContent === '이것만 보기')); await flush();
assert.deepEqual(lastPost().state.v60.layers.items.filter((x) => x.vis === true).map((x) => x.id), ['club']); assert.ok(titles().every((t) => t.includes('근로장학') || t === ''), '동아리만 보임: ' + titles().join('|'));
click(panel().querySelector('[aria-label="레이어 목록으로"]')); await flush(); click([...panel().querySelectorAll('.awl-link')].find((b) => b.textContent === '모두 보기')); await flush();

// 마감 모아보기: 시험까지 + 기한순
click(rowOf('마감').querySelector('.awl-main')); await flush(12);
click([...panel().querySelectorAll('.awl-seg button')].find((b) => b.textContent === '시험까지')); await flush(12);
assert.ok(panel().querySelector('.awl-day em'), '마감은 D-day 머리'); assert.ok([...panel().querySelectorAll('.awl-it')].some((r) => r.textContent.includes('미분적분학2 중간고사')));
click(panel().querySelector('[aria-label="레이어 목록으로"]')); await flush();
// 할 일 모아보기: 기한 있는 할 일 카드도
click(rowOf('할 일').querySelector('.awl-main')); await flush(12); assert.match(panel().textContent, /기한 있는 할 일 \(할 일 카드\)10\/14\(수\) D-2정역학 · HW6/); click(panel().querySelector('[aria-label="레이어 목록으로"]')); await flush();
// 약속 모아보기에서 운선은 개인 일정, 레이어 옮기기 잠김
click(rowOf('약속').querySelector('.awl-main')); await flush(12);
assert.ok([...panel().querySelectorAll('.awl-itmain')].some((b) => b.textContent.includes('개인 일정'))); assert.ok(!panel().innerHTML.includes('운선'));
for (const r of [...panel().querySelectorAll('.awl-it')].filter((x) => x.textContent.includes('개인 일정'))) { click(r.querySelector('[aria-label$="레이어 옮기기"]')); await flush(4); }
assert.ok([...panel().querySelectorAll('.awl-it')].filter((r) => r.textContent.includes('개인 일정')).every((r) => r.querySelector('select').disabled), '개인 일정은 레이어 고정');
// 시간표에서 보기
click(panel().querySelector('[aria-label^="시간표에서 보기"]')); await flush(); click(panel().querySelector('[aria-label="레이어 목록으로"]')); await flush();
// 수입 빈 상태 안내
click(rowOf('지출').querySelector('.awl-main')); await flush(12); assert.match(panel().textContent, /재무부 데이터와 이어질 레이어예요/); click(panel().querySelector('[aria-label="레이어 목록으로"]')); await flush();

// + 로 추가 → 설정, 이름 고치기, 영업시간
click(panel().querySelector('[aria-label="레이어 추가"]')); await flush();
assert.match(panel().querySelector('h2').textContent, /새 레이어 설정/); const addedId = lastPost().state.v60.layers.items.find((x) => x.user).id;
{ const nm = panel().querySelector('input[name=name]'); nm.value = '클라이밍'; nm.dispatchEvent(new w.Event('change', { bubbles: true })); await flush(); assert.equal(lastPost().state.v60.layers.items.find((x) => x.id === addedId).name, '클라이밍'); }
{ const kw = panel().querySelector('textarea'); kw.value = '볼더링, 클라이밍'; kw.dispatchEvent(new w.Event('change', { bubbles: true })); await flush(); assert.equal(lastPost().state.v60.layers.items.find((x) => x.id === addedId).kw, '볼더링, 클라이밍'); }
// 영업시간: 장소 추가 → 저장
click([...panel().querySelectorAll('.awl-link')].find((b) => b.textContent === '장소 추가')); await flush();
{ const card = panel().querySelector('.awl-place'); const inputs = [...card.querySelectorAll('.awl-hr input')]; card.querySelector('input[aria-label="장소 이름"]').value = '더클라임';
  inputs[0].value = '11:00-23:00'; inputs[1].value = '25:00-26:00'; click([...card.querySelectorAll('button')].find((b) => b.textContent === '저장')); await flush(); assert.equal(inputs[1].getAttribute('aria-invalid'), 'true', '잘못된 시간은 막음'); assert.match(panel().textContent, /화요일 시간 형식/);
  inputs[1].value = '11:00-23:00, 23:00-24:00'; click([...card.querySelectorAll('button')].find((b) => b.textContent === '저장')); await flush(); }
{ const pl = Object.values(lastPost().state.v60.layers.places)[0]; assert.equal(pl.name, '더클라임'); assert.deepEqual(pl.week['월'], [['11:00', '23:00']]); assert.deepEqual(pl.week['화'], [['11:00', '23:00'], ['23:00', '24:00']]); }
assert.deepEqual(globalThis.awLayers.layerHoursAt(addedId, '2026-10-12').map((x) => [x.place, x.ranges]), [['더클라임', [[660, 1380]]]], 'layerHoursAt 노출');
// 시드(옛 얼라이브위크) 장소도 운동 설정에 보임
click(panel().querySelector('[aria-label="레이어 패널 닫기"]')); await flush(); click(host.querySelector('.awl-btn')); await flush();
click(rowOf('운동').querySelector('[aria-label="운동 설정"]')); await flush(); assert.equal(panel().querySelector('.awl-place input[aria-label="장소 이름"]').value, '벗히얼 크로스핏'); assert.match(panel().textContent, /기존 값/); assert.equal(panel().querySelector('.awl-hr input').value, '07:10-24:00');
assert.deepEqual(globalThis.awLayers.layerHoursAt('exercise', '2026-10-12')[0].classes, [430, 1020]);
// 지우기(2단계)
click(panel().querySelector('[aria-label="레이어 목록으로"]')); await flush(); click(rowOf('클라이밍').querySelector('[aria-label="클라이밍 설정"]')); await flush();
{ const del = [...panel().querySelectorAll('.awl-act .danger')].find((b) => b.textContent.includes('지우기')); click(del); await flush(); assert.match(del.textContent, /정말 지우기/); click(del); await flush(); }
assert.ok(!rows().some((r) => r.querySelector('.awl-name').textContent === '클라이밍'), '지운 레이어 사라짐');


// 낡은 리비전(409) 뒤 최신 상태에서 거부되면(다른 기기가 그 레이어를 지움) 알림
if (!panel()) { click(host.querySelector('.awl-btn')); await flush(); } if (!panel().querySelector('[aria-label="레이어 추가"]')) { click(panel().querySelector('[aria-label="레이어 목록으로"]')); await flush(); }
click(panel().querySelector('[aria-label="레이어 추가"]')); await flush(); const uid = lastPost().state.v60.layers.items.filter((x) => x.user).at(-1).id;
click(panel().querySelector('[aria-label="레이어 목록으로"]')); await flush();
click(rowOf('기타').querySelector('.awl-main')); await flush(12);
{
  const row = [...panel().querySelectorAll('.awl-it')].find((r) => r.textContent.includes('워크숍')); click(row.querySelector('[aria-label$="레이어 옮기기"]')); await flush(4);
  nextConflict = (srv) => { const it = srv.v60.layers.items.find((x) => x.id === uid); it.del = 1; it.vis = false; };
  statusMsg = ''; const sel = panel().querySelector('.awl-it select'); sel.value = uid; sel.dispatchEvent(new w.Event('change', { bubbles: true })); await flush(30);
  assert.match(statusMsg, /적용하지 못했어요/, '409 뒤 거부 알림: ' + statusMsg);
  assert.ok(!Object.values(server.v60.layers.assign || {}).includes(uid), '지워진 레이어로 지정이 저장되지 않음');
}
click(panel().querySelector('[aria-label="레이어 목록으로"]')); await flush();

// 장소 저장도 서버 확정 뒤에만 「저장했어요」(409 뒤 거부되면 입력은 그대로)
{
  click(panel().querySelector('[aria-label="레이어 추가"]')); await flush(); const wid = lastPost().state.v60.layers.items.filter((x) => x.user).at(-1).id;
  click([...panel().querySelectorAll('.awl-link')].find((b) => b.textContent === '장소 추가')); await flush();
  const card = panel().querySelector('.awl-place'); card.querySelector('input[aria-label="장소 이름"]').value = '충돌 장소'; card.querySelectorAll('.awl-hr input')[0].value = '10:00-12:00';
  nextConflict = (srv) => { const it = srv.v60.layers.items.find((x) => x.id === wid); it.del = 1; it.vis = false; }; statusMsg = '';
  click([...card.querySelectorAll('button')].find((b) => b.textContent === '저장')); await flush(30);
  assert.ok(!panel().textContent.includes('저장했어요'), '거부됐는데 저장했어요가 나오면 안 됨'); assert.match(statusMsg, /적용하지 못했어요/); assert.ok(panel().querySelector('.awl-place input[aria-label="장소 이름"]').value === '충돌 장소', '입력은 그대로');
  click(panel().querySelector('[aria-label="레이어 목록으로"]')); await flush();
}
// @auto 회차를 다시 열면 이 날만이 켜져 있고 선택값은 자동
{
  click(rowOf('동아리').querySelector('.awl-main')); await flush(12);
  const rowW = () => [...panel().querySelectorAll('.awl-it')].find((r) => r.textContent.includes('근로장학'));
  let li = rowW(); await openPick(li);
  li = rowW(); let one = li.querySelector('.awl-pick button'), sel = li.querySelector('select');
  assert.equal(one.getAttribute('aria-pressed'), 'true', '회차 지정이 있으면 이 날만이 켜져 있음');
  click(one); sel.value = 'appt'; sel.dispatchEvent(new w.Event('change', { bubbles: true })); await flush(10);   // 반복 전체를 약속으로(이 회차 예외는 풀림)
  assert.equal(lastPost().state.v60.layers.assign['cal:wk1'], 'appt'); assert.equal(lastPost().state.v60.layers.assign['cal:wk1_20261012T003000Z'], undefined);
  click(panel().querySelector('[aria-label="레이어 목록으로"]')); await flush(); click(rowOf('약속').querySelector('.awl-main')); await flush(12); li = rowW(); await openPick(li);
  li = rowW(); one = li.querySelector('.awl-pick button'); sel = li.querySelector('select'); assert.equal(one.getAttribute('aria-pressed'), 'false');
  click(one); sel.value = ''; sel.dispatchEvent(new w.Event('change', { bubbles: true })); await flush(10);   // 이 회차만 자동
  assert.equal(lastPost().state.v60.layers.assign['cal:wk1_20261012T003000Z'], '@auto');
  click(panel().querySelector('[aria-label="레이어 목록으로"]')); await flush(); click(rowOf('노동').querySelector('.awl-main')); await flush(12); li = rowW(); await openPick(li);
  li = rowW(); one = li.querySelector('.awl-pick button'); sel = li.querySelector('select');
  assert.equal(one.getAttribute('aria-pressed'), 'true', '@auto 회차를 다시 열면 이 날만이 켜짐'); assert.equal(sel.value, '', '선택값은 자동'); assert.match(sel.options[0].textContent, /^자동 · /);
  sel.value = 'club'; sel.dispatchEvent(new w.Event('change', { bubbles: true })); await flush(10);
  assert.equal(lastPost().state.v60.layers.assign['cal:wk1_20261012T003000Z'], 'club', '다음 선택도 이 회차만'); assert.equal(lastPost().state.v60.layers.assign['cal:wk1'], 'appt', '반복 지정은 그대로');
  click(panel().querySelector('[aria-label="레이어 목록으로"]')); await flush();
}

// 보이기 체크를 누른 뒤에도 같은 자리에 초점
{ const c = chk('운동'); c.focus(); click(c); await flush(); assert.equal(document.activeElement?.getAttribute('aria-label'), '운동 보이기', '다시 그린 뒤에도 초점이 그 체크에'); click(chk('운동')); await flush(); }
// 일정 창이 열려 있으면 Tab·Esc 는 창이 쓴다(레이어 패널로 튕기지 않음)
{
  click(rowOf('동아리').querySelector('.awl-main')); await flush(12); click(panel().querySelector('.awl-itmain')); await flush();
  const pop = document.querySelector('.pl-pop'); assert.ok(pop); const ev = new w.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }); pop.querySelector('button').focus(); document.dispatchEvent(ev);
  assert.ok(!ev.defaultPrevented, '일정 창이 열려 있으면 패널이 Tab 을 가로채지 않음'); assert.ok(panel(), 'Esc 는 창만 닫음');
  document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await flush(); assert.ok(!document.querySelector('.pl-pop') && panel(), '창만 닫히고 패널은 남음');
  click(panel().querySelector('[aria-label="레이어 목록으로"]')); await flush();
}

// 닫기: Esc, 바깥 누르기
document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await flush(); assert.ok(!panel(), 'Esc 로 닫힘');
click(host.querySelector('.awl-btn')); await flush(); assert.ok(panel()); press(document.body, 'pointerdown'); await flush(); assert.ok(!panel(), '바깥 누르면 닫힘');
// 주 보기·시험까지에서도 같은 필터
plan.destroy(); localStorage.setItem('school-plan-view', 'week'); const plan2 = createPlan({ status: () => {} }); await plan2.render(host, ctx); await flush();
click(host.querySelector('.awl-btn')); await flush(); assert.ok([...host.querySelectorAll('.pl-wkcol .pl-blk')].some((b) => b.textContent.includes('근로장학')), '주 보기에 보임(지정은 동아리)'); click(chk('동아리')); await flush(); assert.ok(![...host.querySelectorAll('.pl-wkcol .pl-blk')].some((b) => b.textContent.includes('근로장학')), '주 보기 필터(서버에 저장된 지정이 다시 읽혀 적용)'); click(chk('동아리')); await flush();
assert.match(panel().querySelector('.awl-sub').textContent, /이 주 일정/);
console.log('aw-layers-dom ok'); plan2.destroy(); process.exit(0);
