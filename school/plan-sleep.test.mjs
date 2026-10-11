// node school/plan-sleep.test.mjs — 자기 전 접속 종료 → 수면 추정: 수면 시간대·날짜 키·시각 계산·화면 상태·동시 수정 충돌(순수 함수)
import assert from 'node:assert/strict';
import { SLEEP, appSleepHours, sleepWindow, inSleepWindow, sleepKeyFor, kstStamp, sleepHours, legacyHours, sleepView, applyBed, applyWake, applyClear, applyRestore, sleepCanon } from './plan.js';

const M = (h, m = 0) => h * 60 + m;
// ── 수면 시간대: 취침 목표 2시간 전(포함)부터 06:00(제외). 기본 취침 01:00 → 23:00–06:00 ──
assert.deepEqual(sleepWindow(undefined), { start: M(23), end: M(6) });
assert.deepEqual(sleepWindow('01:00'), { start: M(23), end: M(6) });
for (const [m, want] of [[M(22, 59), false], [M(23), true], [M(23, 59), true], [0, true], [M(5, 59), true], [M(6), false], [M(12), false]]) assert.equal(inSleepWindow(m, '01:00'), want, `01:00 목표 ${m}`);
assert.deepEqual(sleepWindow('05:00'), { start: M(3), end: M(6) });                   // 목표 05:00 → 03:00–06:00 (자정을 안 넘는 창)
assert.equal(inSleepWindow(M(2, 59), '05:00'), false); assert.equal(inSleepWindow(M(3), '05:00'), true); assert.equal(inSleepWindow(M(5, 59), '05:00'), true); assert.equal(inSleepWindow(M(6), '05:00'), false);
assert.deepEqual(sleepWindow('23:00'), { start: M(21), end: M(6) });                  // 목표 23:00 → 21:00–06:00
assert.equal(inSleepWindow(M(20, 59), '23:00'), false); assert.equal(inSleepWindow(M(21), '23:00'), true);
for (const bad of ['07:00', '12:30', '17:59', '25:00', 'abc', '', null]) assert.deepEqual(sleepWindow(bad), { start: M(23), end: M(6) }, `이상값 ${bad} → 기본`);
assert.deepEqual(sleepWindow('00:00'), { start: M(22), end: M(6) });

// ── 날짜 키 = 기상일: 12:00 이후는 다음 날, 12:00 전은 같은 날 ──
assert.equal(sleepKeyFor('2026-10-12', M(23, 59)), '2026-10-13');
assert.equal(sleepKeyFor('2026-10-12', 0), '2026-10-12');                           // 자정 직후 = 같은 날(그 아침이 기상일)
assert.equal(sleepKeyFor('2026-10-12', M(5, 59)), '2026-10-12');
assert.equal(sleepKeyFor('2026-10-12', M(11, 59)), '2026-10-12');
assert.equal(sleepKeyFor('2026-10-12', M(12)), '2026-10-13');
assert.equal(sleepKeyFor('2026-12-31', M(23)), '2027-01-01'); assert.equal(sleepKeyFor('2026-02-28', M(23)), '2026-03-01');   // 월·해 경계

// ── 간격: 전체 시각(KST)으로 날짜까지 계산 ──
assert.equal(kstStamp('2026-10-12', 23, 40, 5), '2026-10-12T23:40:05+09:00');
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
near(sleepHours('2026-10-12T23:40:00+09:00', '2026-10-13T07:20:00+09:00'), 7 + 40 / 60);   // 자정 넘김
near(sleepHours('2026-10-13T01:30:00+09:00', '2026-10-13T08:00:00+09:00'), 6.5);
near(sleepHours('2026-10-12T23:40:30+09:00', '2026-10-13T07:20:00+09:00'), (7 * 3600 + 40 * 60 - 30) / 3600);
assert.equal(sleepHours('2026-10-13T08:00:00+09:00', '2026-10-13T01:30:00+09:00'), null);   // 기상이 더 빠름
assert.equal(sleepHours('2026-10-13T08:00:00+09:00', '2026-10-13T08:00:00+09:00'), null);   // 0
assert.equal(sleepHours('2026-10-12T01:30:00+09:00', '2026-10-13T08:00:00+09:00'), null);   // 30시간 30분 > 24 — HH:MM 계산이면 6.5 로 숨겨졌을 값
assert.equal(sleepHours('2026-10-12T08:00:00+09:00', '2026-10-13T08:00:00+09:00'), 24);
assert.equal(sleepHours('2026-10-12T23:40:00+00:00', '2026-10-13T07:20:00+09:00'), null);   // KST 오프셋이 아님
assert.equal(sleepHours('garbage', '2026-10-13T07:20:00+09:00'), null); assert.equal(sleepHours(undefined, undefined), null);
assert.equal(sleepHours('2026-02-30T23:40:00+09:00', '2026-03-01T07:20:00+09:00'), null);   // 없는 날짜
// 오타 3차 재현 1: 없는 날짜(2월 30일)를 Date 가 3월 2일로 밀어 7시간 40분으로 통과시키던 것 — 서버(fromisoformat)와 같이 무효
assert.equal(sleepHours('2026-02-30T23:40:00+09:00', '2026-03-03T07:20:00+09:00'), null);
assert.equal(sleepHours('2026-02-29T23:40:00+09:00', '2026-03-01T07:20:00+09:00'), null);   // 2026 은 평년
assert.equal(sleepHours('2024-02-29T23:40:00+09:00', '2024-03-01T07:20:00+09:00') > 7, true);   // 윤년 29일은 유효
for (const bad of ['2026-13-01T10:00:00+09:00', '2026-10-32T10:00:00+09:00', '2026-10-12T24:00:00+09:00', '2026-10-12T23:60:00+09:00', '2026-10-12T23:00:60+09:00', '2026-04-31T10:00:00+09:00']) assert.equal(sleepHours(bad, '2027-01-01T10:00:00+09:00'), null, bad);
// 앱 기록 간격은 서버 app_sleep_hours 와 같은 조건(키·HH:MM 일치)
const good = { bed: '23:40', wake: '07:20', src: 'app', bedAt: '2026-10-12T23:40:00+09:00', wakeAt: '2026-10-13T07:20:00+09:00' };
near(appSleepHours(good, '2026-10-13'), 7 + 40 / 60);
assert.equal(appSleepHours({ ...good, bedAt: '2026-10-12T23:41:00+09:00' }, '2026-10-13'), null);   // 오타 3차 재현 2: bed 23:40 ≠ bedAt 23:41 (서버 무효 / 예전 클라이언트 7시간 39분)
assert.equal(appSleepHours({ ...good, wake: '07:21' }, '2026-10-13'), null); assert.equal(appSleepHours({ ...good, bed: '23:39' }, '2026-10-13'), null);
assert.equal(appSleepHours(good, '2026-10-14'), null);   // 기상일이 키와 다름
assert.equal(appSleepHours({ ...good, wakeAt: undefined }, '2026-10-13'), null); assert.equal(appSleepHours(null, 'x'), null);
// 옛 기록(HH:MM): 취침이 더 늦으면 전날로 본다. 같으면 무효
near(legacyHours('23:40', '07:20'), 7 + 40 / 60); near(legacyHours('01:30', '08:00'), 6.5); assert.equal(legacyHours('07:00', '07:00'), null); assert.equal(legacyHours('7:00', '08:00'), null);

// ── 변경 규칙(동시 수정): 최신 상태에서 다시 검사 ──
const mk = () => ({ sleep: {} });
const K = '2026-10-13', bedA = { key: K, bed: '23:40', bedAt: '2026-10-12T23:40:00+09:00' }, bedB = { key: K, bed: '23:55', bedAt: '2026-10-12T23:55:00+09:00' };
{   // 두 기기가 모두 빈 기록을 보고 취침을 누름 → 먼저 저장된 것이 유지되고 두 번째는 kept(409 재적용에서도 덮지 않음)
  const s = mk(); assert.equal(applyBed(s, bedA), 'applied'); assert.equal(applyBed(s, bedB), 'kept'); assert.equal(s.sleep[K].bed, '23:40'); assert.equal(s.sleep[K].src, 'app');
  assert.equal(applyBed(s, bedB), 'kept');   // 재적용도 같다
}
{   // 직접 입력·말로 준 기록이 있는 키에는 앱 기록을 만들지 않는다
  const s = { sleep: { [K]: { bed: '01:00', wake: '08:00', src: 'said' } } }; assert.equal(applyBed(s, bedA), 'kept'); assert.deepEqual(s.sleep[K], { bed: '01:00', wake: '08:00', src: 'said' });
  const t = { sleep: { [K]: { wake: '08:00' } } }; assert.equal(applyBed(t, bedA), 'kept');
}
{   // 다시 기록: 사용자가 본 앱 기록 그대로이고 기상이 없을 때만
  const s = mk(); applyBed(s, bedA); const seen = sleepCanon(s.sleep[K]);
  assert.equal(applyBed(s, { ...bedB, force: true, seen }), 'applied'); assert.equal(s.sleep[K].bed, '23:55');
  const s2 = mk(); applyBed(s2, bedA); const seen2 = sleepCanon(s2.sleep[K]);
  s2.sleep[K].wake = '07:20'; s2.sleep[K].wakeAt = '2026-10-13T07:20:00+09:00';   // 다른 기기가 기상을 붙임 — bedAt 은 같다
  assert.equal(applyBed(s2, { ...bedB, force: true, seen: seen2 }), 'conflict'); assert.equal(s2.sleep[K].bed, '23:40');
  const s3 = mk(); applyBed(s3, bedA); const seen3 = sleepCanon(s3.sleep[K]); s3.sleep[K] = { ...s3.sleep[K], src: undefined }; delete s3.sleep[K].src;
  assert.equal(applyBed(s3, { ...bedB, force: true, seen: seen3 }), 'conflict');   // 앱 기록이 아니게 됨
  assert.equal(applyBed(mk(), { ...bedB, force: true, seen: 'x' }), 'conflict');   // 기록이 없어짐
}
{   // 기상 추가: 본 취침 그대로일 때만. 그 사이 취침이 다시 기록됐다면 붙지 않는다
  const wake = { key: K, wake: '07:20', wakeAt: '2026-10-13T07:20:00+09:00' };
  const s = mk(); applyBed(s, bedA); const seen = sleepCanon(s.sleep[K]);
  assert.equal(applyWake(s, { ...wake, seen }), 'applied'); assert.deepEqual([s.sleep[K].wake, s.sleep[K].wakeAt], ['07:20', '2026-10-13T07:20:00+09:00']);
  assert.equal(applyWake(s, { ...wake, seen }), 'conflict');                          // 이미 있음(두 번째 기기)
  const t = mk(); applyBed(t, bedA); const seenT = sleepCanon(t.sleep[K]);
  applyBed(t, { ...bedB, force: true, seen: seenT });                                 // B 가 취침을 다시 기록
  assert.equal(applyWake(t, { ...wake, seen: seenT }), 'conflict'); assert.equal(t.sleep[K].wake, undefined);   // A 의 기상은 안 붙음
  const u = mk(); applyBed(u, bedA); const seenU = sleepCanon(u.sleep[K]);
  assert.equal(applyWake(u, { key: K, wake: '08:00', wakeAt: '2026-10-14T08:00:00+09:00', seen: seenU }), 'invalid');   // 기상일이 키와 다름(하루 지난 입력에 날짜 오기)
  assert.equal(applyWake(u, { key: K, wake: '23:00', wakeAt: '2026-10-13T23:00:00+09:00', seen: seenU }), 'applied');   // 23시간(24 이하) 은 형식상 유효 — 화면이 16시간 초과 확인창을 먼저 띄운다
  const v = mk(); applyBed(v, bedA); assert.equal(applyWake(v, { key: K, wake: '07:20', wakeAt: '2026-10-13T07:20:00+09:00', seen: 'stale' }), 'conflict');
  const x = mk(); applyBed(x, { ...bedA, bed: '23:39' }); assert.equal(applyWake(x, { ...wake, seen: sleepCanon(x.sleep[K]) }), 'invalid');   // bed HH:MM 과 bedAt 이 어긋난 기록엔 기상을 못 붙인다(서버가 무효로 볼 값)
  const y = mk(); applyBed(y, bedA); assert.equal(applyWake(y, { ...wake, wake: '07:21', seen: sleepCanon(y.sleep[K]) }), 'invalid');   // wake HH:MM ≠ wakeAt
  const w = mk(); applyBed(w, { ...bedA, bedAt: 'garbage' }); assert.equal(applyWake(w, { ...wake, seen: sleepCanon(w.sleep[K]) }), 'invalid');   // 취침 시각이 망가진 기록엔 간격을 못 만든다
}
{   // 하루 지나서 입력: 키 = 기상일, 기상 시각은 그 날짜에 붙는다(전날 01:30 취침 → 키 날짜 08:00 = 6.5시간)
  const s = mk(); applyBed(s, { key: K, bed: '01:30', bedAt: '2026-10-13T01:30:00+09:00' });
  assert.equal(applyWake(s, { key: K, wake: '08:00', wakeAt: kstStamp(K, 8, 0, 0), seen: sleepCanon(s.sleep[K]) }), 'applied');
  near(sleepHours(s.sleep[K].bedAt, s.sleep[K].wakeAt), 6.5);
}
{   // 지우기·되돌리기는 이전 객체 전체를 조건부 복원
  const s = mk(); applyBed(s, bedA); const rec = s.sleep[K], seen = sleepCanon(rec);
  assert.equal(applyClear(s, { key: K, seen: 'stale' }), 'conflict'); assert.ok(s.sleep[K]);
  assert.equal(applyClear(s, { key: K, seen }), 'applied'); assert.equal(s.sleep[K], undefined);
  assert.equal(applyRestore(s, { key: K, prev: rec, saved: '' }), 'conflict');          // 지금 기록 없음 vs 저장했던 값('' 아님)
  const saved = sleepCanon({ bed: '23:40', src: 'app', bedAt: bedA.bedAt });
  const t = mk(); applyBed(t, bedA);
  assert.equal(applyRestore(t, { key: K, prev: null, saved }), 'applied'); assert.equal(t.sleep[K], undefined);   // 이전에 없던 기록이면 지움
  const u = mk(); applyBed(u, bedA); u.sleep[K].wake = '07:20'; u.sleep[K].wakeAt = '2026-10-13T07:20:00+09:00';   // 다른 기기가 기상을 붙인 뒤 취소 → 중단
  assert.equal(applyRestore(u, { key: K, prev: null, saved }), 'conflict'); assert.equal(u.sleep[K].wake, '07:20');
  // 다시 기록을 되돌릴 때 이전 객체 전체가 돌아오고(타임스탬프 포함) 이전 값을 바꿔도 영향 없음
  const prev = { bed: '23:40', src: 'app', bedAt: bedA.bedAt }, v = { sleep: { [K]: { bed: '23:55', src: 'app', bedAt: bedB.bedAt } } };
  assert.equal(applyRestore(v, { key: K, prev, saved: sleepCanon(v.sleep[K]) }), 'applied'); assert.deepEqual(v.sleep[K], prev); prev.bed = 'x'; assert.equal(v.sleep[K].bed, '23:40');
  // 옛(말로 준) 객체였던 걸 복원: src·타임스탬프가 새로 생기거나 남지 않는다
  const old = { bed: '01:00', wake: '08:00', src: 'said' }, w = { sleep: { [K]: { bed: '23:55', src: 'app', bedAt: bedB.bedAt } } };
  assert.equal(applyRestore(w, { key: K, prev: old, saved: sleepCanon(w.sleep[K]) }), 'applied'); assert.deepEqual(w.sleep[K], old);
}

// ── 화면 상태(뷰 모델) ──
const at = (date, h, m = 0) => ({ date, min: M(h, m), nowMs: Date.parse(kstStamp(date, h, m, 0)) });
const V = (sleep, when, bedCfg) => sleepView({ sleep, ...when, bedCfg });
{   // 수면 시간대에 기록 없음 → 버튼. 밖이면 없음
  assert.equal(V({}, at('2026-10-12', 23, 10)).button, true); assert.equal(V({}, at('2026-10-12', 22, 59)).button, false);
  assert.equal(V({}, at('2026-10-13', 5, 59)).button, true); assert.equal(V({}, at('2026-10-13', 6, 0)).button, false);
  assert.equal(V({}, at('2026-10-12', 23, 59)).key, '2026-10-13'); assert.equal(V({}, at('2026-10-13', 0, 0)).key, '2026-10-13');
}
{   // 오늘 밤 기록 직후: 버튼 없음, 「취침 기록됨」 줄 + 다시 기록 가능, 기상 입력은 아직(키가 내일)
  const rec = { bed: '23:40', src: 'app', bedAt: '2026-10-12T23:40:00+09:00' };
  const v = V({ '2026-10-13': rec }, at('2026-10-12', 23, 50));
  assert.equal(v.button, false); assert.equal(v.rows.length, 1);
  assert.deepEqual([v.rows[0].night, v.rows[0].again, v.rows[0].wakeInput, v.rows[0].shortcut], [true, true, false, false]);
  const w = V({ '2026-10-13': rec }, at('2026-10-13', 1, 0)); assert.deepEqual([w.rows[0].night, w.rows[0].again, w.rows[0].wakeInput], [true, true, true]);   // 자정 지나도 아직 밤
}
{   // 아침 확인: 04:00 이후 · 12:00 전 · 취침 후 2시간 이상 · bedAt 유효 일 때만 「일어났어요」 지름길. 시각 고치기는 언제나
  const rec = { bed: '23:40', src: 'app', bedAt: '2026-10-12T23:40:00+09:00' }, s = { '2026-10-13': rec };
  const row = (h, m) => V(s, at('2026-10-13', h, m)).rows[0];
  assert.equal(row(3, 59).shortcut, false); assert.equal(row(3, 59).night, true);
  assert.equal(row(4, 0).shortcut, true); assert.equal(row(4, 0).night, false); assert.equal(row(11, 59).shortcut, true); assert.equal(row(12, 0).shortcut, false); assert.equal(row(13, 0).wakeInput, true);   // 13:00 기상은 시각 고치기로
  const late = { '2026-10-13': { bed: '03:30', src: 'app', bedAt: '2026-10-13T03:30:00+09:00' } };   // 03:30 취침 → 05:00 기상: 2시간 미만이라 지름길은 없고
  assert.equal(V(late, at('2026-10-13', 5, 0)).rows[0].shortcut, false); assert.equal(V(late, at('2026-10-13', 5, 0)).rows[0].wakeInput, true);   // 시각 고치기는 있다
  assert.equal(V(late, at('2026-10-13', 5, 30)).rows[0].shortcut, true);
  for (const bad of [undefined, 'garbage', '2026-10-13T23:59:00+09:00' /* 미래 */]) { const r = V({ '2026-10-13': { ...rec, bedAt: bad } }, at('2026-10-13', 8, 0)).rows[0]; assert.equal(r.shortcut, false, `bedAt ${bad}`); assert.equal(r.wakeInput, true); }
}
{   // 하루 지난 미완성 기록과 오래된 것: 다시 나오고, 4건째부터는 more 로
  const rec = (d) => ({ bed: '23:40', src: 'app', bedAt: `${d}T00:10:00+09:00` });
  const s = { '2026-10-10': rec('2026-10-10'), '2026-10-11': rec('2026-10-11'), '2026-10-12': rec('2026-10-12'), '2026-10-13': rec('2026-10-13'), '2026-10-09': rec('2026-10-09') };
  const v = V(s, at('2026-10-13', 9, 0)); assert.deepEqual(v.rows.map((r) => r.key), ['2026-10-13', '2026-10-12', '2026-10-11']); assert.equal(v.more, 2);
  assert.deepEqual(v.rows.map((r) => [r.shortcut, r.wakeInput]), [[true, true], [false, true], [false, true]]);   // 지름길은 오늘 기록만
}
{   // 직접 입력·말로 준 기록은 묻지도 건드리지도 않는다
  const said = { '2026-10-13': { bed: '23:40', src: 'said' } }, manual = { '2026-10-13': { bed: '23:40' } };
  for (const s of [said, manual]) { const v = V(s, at('2026-10-13', 8, 0)); assert.equal(v.rows.length, 0); }
  const inwin = V(manual, at('2026-10-13', 2, 0)); assert.equal(inwin.button, false); assert.ok(inwin.lock.includes('취침 기록 있음'));
}
{   // 어젯밤 요약: 앱 기록은 전체 시각, 옛 기록은 HH:MM 계산. 기상이 없으면 요약 없음(대기 줄이 대신)
  const app = { bed: '23:40', wake: '07:20', src: 'app', bedAt: '2026-10-12T23:40:00+09:00', wakeAt: '2026-10-13T07:20:00+09:00' };
  const v = V({ '2026-10-13': app }, at('2026-10-13', 9, 0)); assert.equal(v.rows.length, 0); near(v.summary.hours, 7 + 40 / 60); assert.equal(v.summary.app, true);
  const old = V({ '2026-10-13': { bed: '23:40', wake: '07:20' } }, at('2026-10-13', 9, 0)); near(old.summary.hours, 7 + 40 / 60); assert.equal(old.summary.app, false);
  const bad = V({ '2026-10-13': { ...app, wakeAt: 'x' } }, at('2026-10-13', 9, 0)); assert.equal(bad.summary.hours, null);
  assert.equal(V({ '2026-10-13': { ...app, bedAt: '2026-10-12T23:41:00+09:00' } }, at('2026-10-13', 9, 0)).summary.hours, null, '서버가 무효로 보는 기록은 화면도 간격을 안 보임');   // 앱 기록이 망가지면 HH:MM 으로 숨기지 않고 계산 불가
  assert.equal(V({ '2026-10-13': { bed: '23:40', src: 'app', bedAt: app.bedAt } }, at('2026-10-13', 9, 0)).summary, null);
}
console.log('plan-sleep ok');
