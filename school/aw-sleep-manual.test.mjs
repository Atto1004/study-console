// 수면 직접 입력 순수 함수 검사(DOM 없음). 실행: node school/aw-sleep-manual.test.mjs
import assert from 'node:assert/strict';
import { parseLocal, defaultBed, checkManual, recordFrom, applyManual, recordText, suggestsSleep, toLocal } from './aw-sleep-manual.js';
import { appSleepHours, sleepNight, sleepGoal, sleepView, sleepCanon } from './plan.js';
const NOW = Date.parse('2026-10-12T14:00:00+09:00');

// 1. datetime-local 해석: 없는 날짜·모양은 null
assert.deepEqual(parseLocal('2026-10-12T07:05'), { date: '2026-10-12', min: 425 });
for (const bad of ['', null, '2026-02-30T07:00', '2026-10-12 07:00', '2026-10-12T24:00', '2026-10-12T07:00:30']) assert.equal(parseLocal(bad), null, String(bad));
assert.equal(toLocal('2026-10-12', 425), '2026-10-12T07:05');
assert.equal(suggestsSleep(0), true); assert.equal(suggestsSleep(719), true); assert.equal(suggestsSleep(720), false);

// 2. 취침 기본값(오타 1차): 목표 취침의 직전 발생 → 간격 3~14시간 밖이면 기상 − 목표 수면시간
const db = (wd, wm, cfg) => { const r = defaultBed({ wakeDate: wd, wakeMin: wm, cfg }); return toLocal(r.date, r.min); };
assert.equal(db('2026-10-12', 420, { bed: '01:00', sleepH: 8 }), '2026-10-12T01:00', '07:00 기상 + 목표 01:00 → 같은 날 01:00');
assert.equal(db('2026-10-12', 690, { bed: '01:00', sleepH: 8 }), '2026-10-12T01:00', '11:30 기상 + 목표 01:00 → 10.5시간');
assert.equal(db('2026-10-12', 420, { bed: '23:00', sleepH: 8 }), '2026-10-11T23:00', '목표가 12시 이후면 전날 밤');
assert.equal(db('2026-10-12', 30, { bed: '01:00', sleepH: 8 }), '2026-10-11T16:30', '00:30 기상은 목표 01:00 이 기상 뒤라 하루 빼면 23.5시간 → 기상 − 8시간');
assert.equal(db('2026-10-12', 330, { bed: '01:00', sleepH: 8 }), '2026-10-12T01:00', '05:30 기상: 간격 4.5시간은 범위 안이라 목표 그대로');
assert.equal(db('2026-10-12', 120, { bed: '01:00', sleepH: 8 }), '2026-10-11T18:00', '02:00 기상: 간격 1시간은 3시간 미만 → 기상 − 8시간');
assert.equal(db('2026-10-12', 420, { bed: '12:00', sleepH: 99 }), '2026-10-12T01:00', '이상한 목표(취침 12:00)는 기본 01:00');
assert.equal(db('2026-10-12', 30, { bed: '12:00', sleepH: 99 }), '2026-10-11T16:30', '이상한 수면시간(99)은 기본 8시간');
assert.equal(db('2026-10-12', 420, undefined), '2026-10-12T01:00', 'cfg 없음');

// 3. 검증: 키 = 기상일, 서버·화면과 같은 HH:MM/전체 시각, 경계
const ok = checkManual({ bedL: '2026-10-11T23:40', wakeL: '2026-10-12T07:30', nowMs: NOW });
assert.deepEqual([ok.key, ok.bed, ok.wake, ok.bedAt, ok.wakeAt, ok.confirm], ['2026-10-12', '23:40', '07:30', '2026-10-11T23:40:00+09:00', '2026-10-12T07:30:00+09:00', false]);
assert.ok(Math.abs(ok.hours - 7.8333) < 0.001);
const rec = recordFrom(ok); assert.deepEqual(Object.keys(rec).sort(), ['bed', 'bedAt', 'src', 'via', 'wake', 'wakeAt']); assert.equal(rec.via, 'manual'); assert.equal(rec.src, 'app');
assert.equal(appSleepHours(rec, '2026-10-12'), ok.hours, '화면의 앱 기록 검증(= 서버 app_sleep_hours)과 같은 간격');
assert.equal(appSleepHours(rec, '2026-10-13'), null, '키가 기상일이 아니면 무효');
assert.match(checkManual({ bedL: '', wakeL: '2026-10-12T07:30', nowMs: NOW }).error, /날짜까지/);
assert.match(checkManual({ bedL: '2026-10-12T08:00', wakeL: '2026-10-12T07:30', nowMs: NOW }).error, /빨라요/);
assert.match(checkManual({ bedL: '2026-10-12T07:30', wakeL: '2026-10-12T07:30', nowMs: NOW }).error, /빨라요/, '같은 시각');
assert.equal(checkManual({ bedL: '2026-10-11T07:00', wakeL: '2026-10-12T07:00', nowMs: NOW }).error, undefined, '정확히 24시간은 허용');
assert.match(checkManual({ bedL: '2026-10-11T06:59', wakeL: '2026-10-12T07:00', nowMs: NOW }).error, /24시간/);
assert.equal(checkManual({ bedL: '2026-10-12T08:00', wakeL: '2026-10-12T14:00', nowMs: NOW }).error, undefined, '기상 = 지금은 허용');
assert.match(checkManual({ bedL: '2026-10-12T08:00', wakeL: '2026-10-12T14:01', nowMs: NOW }).error, /오지 않은/, '1분 미래도 거절(화면이 표시하지 않는다)');
assert.equal(checkManual({ bedL: '2026-10-12T04:00', wakeL: '2026-10-12T06:30', nowMs: NOW }).confirm, true, '2.5시간 → 확인');
assert.equal(checkManual({ bedL: '2026-10-12T04:00', wakeL: '2026-10-12T07:00', nowMs: NOW }).confirm, false, '3시간 경계');
assert.equal(checkManual({ bedL: '2026-10-11T20:00', wakeL: '2026-10-12T10:00', nowMs: NOW }).confirm, false, '14시간 경계');
assert.equal(checkManual({ bedL: '2026-10-11T19:59', wakeL: '2026-10-12T10:00', nowMs: NOW }).confirm, true, '14시간 초과 → 확인');
// 취침이 전날 밤, 기상이 다음 날 — 자정 걸침 키는 기상일
assert.equal(checkManual({ bedL: '2026-10-11T23:50', wakeL: '2026-10-12T06:50', nowMs: NOW }).key, '2026-10-12');

// 4. 저장 변경: 새 기록 · 자기 재적용(kept) · 열 때와 달라지면 conflict · 모르는 필드 보존
let s = { sleep: {} };
assert.equal(applyManual(s, { key: '2026-10-12', rec, seen: '' }), 'applied'); assert.deepEqual(s.sleep['2026-10-12'], rec);
assert.equal(applyManual(s, { key: '2026-10-12', rec, seen: '' }), 'kept', '이미 이 값이면 자기 저장의 재적용');
const older = { bed: '23:00', wake: '06:00', note: '메모', src: 'said' };
s = { sleep: { '2026-10-12': { ...older } } };
assert.equal(applyManual(s, { key: '2026-10-12', rec, seen: '' }), 'conflict', '기록이 생겼는데 없다고 본 요청은 덮지 않는다'); assert.deepEqual(s.sleep['2026-10-12'], older);
assert.equal(applyManual(s, { key: '2026-10-12', rec, seen: sleepCanon({ ...older, bed: '22:00' }) }), 'conflict', '열 때 본 모습과 다르면 안 덮음');
assert.equal(applyManual(s, { key: '2026-10-12', rec, seen: sleepCanon(older) }), 'applied');
assert.equal(s.sleep['2026-10-12'].note, '메모', '모르는 필드 보존'); assert.equal(s.sleep['2026-10-12'].src, 'app'); assert.equal(s.sleep['2026-10-12'].via, 'manual');
assert.equal(applyManual({}, { key: 'k', rec, seen: '' }), 'applied', 'sleep 객체가 없어도');

// 5. 기록 한 줄
assert.equal(recordText({ bed: '23:40', wake: '07:30' }), '23:40–07:30'); assert.match(recordText({ bed: '23:40' }), /기상 없음/); assert.equal(recordText(null), '');

// 6. 화면 계산에 반영: 블록은 「직접 입력」 출처의 확정, 접속 종료 버튼은 같은 밤에 중복 기록을 만들지 않는다
const night = sleepNight('2026-10-12', { sleep: { '2026-10-12': rec }, goal: sleepGoal({ bed: '01:00', sleepH: 8 }), nowMs: NOW });
assert.equal(night.src, '직접 입력'); assert.deepEqual(night.parts.map((x) => x.kind), ['done']); assert.equal(night.wakeMs - night.bedMs, 28200000, '23:40–07:30 = 7시간 50분');
const nightApp = sleepNight('2026-10-12', { sleep: { '2026-10-12': { ...rec, via: undefined } }, goal: sleepGoal({}), nowMs: NOW }); assert.equal(nightApp.src, '앱 기록', 'via 가 없으면 기존 이름 그대로');
const v = sleepView({ sleep: { '2026-10-13': { ...rec, bed: '23:50', bedAt: '2026-10-12T23:50:00+09:00', wake: '07:00', wakeAt: '2026-10-13T07:00:00+09:00' } }, date: '2026-10-12', min: 23 * 60 + 50, nowMs: NOW, bedCfg: '01:00' });
assert.equal(v.button, false, '같은 밤(기상일 10/13)에 직접 입력 기록이 있으면 접속 종료 버튼이 없다'); assert.match(v.lock, /23:50 취침 기록 있음/);
console.log('aw-sleep-manual ok');
