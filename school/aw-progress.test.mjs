// aw-progress 순수 계산 검사. 실행: node school/aw-progress.test.mjs
import assert from 'node:assert/strict';
import { fmtSec, classRuns, endComparison, isOutlier, transitState, arrivalChips, eventPlaceItems } from './aw-progress.js';
assert.equal(fmtSec(252), '4분 12초'); assert.equal(fmtSec(180), '3분'); assert.equal(fmtSec(45), '45초'); assert.equal(fmtSec(0), '0초');
const L = (date, endedAt, extra = {}) => ({ course: '정역학', date, endedAt, plannedStart: '15:00', plannedEnd: '16:30', ...extra });
const log = { a: L('2026-09-14', '16:26', { actualSec: 86 * 60 }), b: L('2026-09-21', '16:28'), c: L('2026-09-28', '16:20'), x: { course: '미적분', date: '2026-09-28', endedAt: '10:00', plannedStart: '09:00', plannedEnd: '10:30' }, bad: { course: '정역학', date: '2026-09-30', endedAt: '??' } };
const runs = classRuns(log, '정역학'); assert.deepEqual(runs.map((r) => [r.date, r.sec]), [['2026-09-14', 5160], ['2026-09-21', 5280], ['2026-09-28', 4800]]);
assert.equal(runs[0].precise, true); assert.equal(runs[1].precise, false);
// 옛 기록(plannedStart 없음)은 훅으로 예정을 찾고, 못 찾으면 제외
const old = { o: { course: '정역학', date: '2026-10-05', endedAt: '16:20' } }; assert.equal(classRuns(old, '정역학').length, 0); assert.equal(classRuns(old, '정역학', () => ({ s: '15:00', e: '16:30' }))[0].sec, 4800);
// 기록 1~2회: 쌓이는 중
let r = endComparison({ date: '2026-10-12', sec: 5000, plannedSec: 5400 }, runs.slice(0, 1)); assert.equal(r.built, true); assert.match(r.lines[0], /기록이 쌓이는 중이에요 · 평균은 3회부터/);
r = endComparison({ date: '2026-10-12', sec: 5000, plannedSec: 5400 }, []); assert.equal(r.built, true);
// 3회(이전 2회 + 오늘): 평균·직전 비교(초 단위). 이전 = 5280·4800 → 평균 5040, 직전 4800
r = endComparison({ date: '2026-10-12', sec: 4548, plannedSec: 5400 }, runs.slice(1)); assert.equal(r.built, false);
assert.equal(r.lines[0], '오늘은 평소보다 8분 12초 빨리 끝났네요!'); assert.equal(r.lines[1], '저번 시간보다 4분 12초 빨리 끝났어요');
r = endComparison({ date: '2026-10-12', sec: 5040 + 180, plannedSec: 5400 }, runs.slice(1)); assert.equal(r.lines[0], '오늘은 평소보다 3분 늦게 끝났어요 ㅠㅠ'); assert.equal(r.lines[1], '저번 시간보다 7분 늦게 끝났어요');
r = endComparison({ date: '2026-10-12', sec: 5040 + 5, plannedSec: 5400 }, runs.slice(1)); assert.match(r.lines[0], /거의 같게/);
// 이상치(예정의 50% 미만·150% 초과)는 평균에서 제외하고 알림
const outl = [{ date: '2026-09-01', sec: 600, plannedSec: 5400 }, { date: '2026-09-08', sec: 9000, plannedSec: 5400 }, ...runs]; assert.equal(isOutlier(outl[0]), true); assert.equal(isOutlier(outl[1]), true); assert.equal(isOutlier(runs[0]), false);
r = endComparison({ date: '2026-10-12', sec: 5100, plannedSec: 5400 }, outl); assert.equal(r.excluded, 2); assert.match(r.lines.at(-1), /기록 2회는 평균에서 뺐어요/);
// 오늘 기록이 이상치(예정 60분인데 10분에 종료)면 평균에 넣지 않고 알린다, 이전 이상치 알림은 3회 미만에서도 나온다
const ok2 = [{ date: '2026-09-01', sec: 3500, plannedSec: 3600 }, { date: '2026-09-08', sec: 3400, plannedSec: 3600 }];
r = endComparison({ date: '2026-10-12', sec: 600, plannedSec: 3600 }, ok2); assert.equal(r.todayOutlier, true); assert.equal(r.total, 2); assert.match(r.lines[0], /평균에 넣지 않았어요/); assert.ok(!r.lines.some((x) => /빨리 끝났네요/.test(x)));
r = endComparison({ date: '2026-10-12', sec: 3500, plannedSec: 3600 }, [{ date: '2026-09-01', sec: 600, plannedSec: 3600 }]); assert.equal(r.built, true); assert.match(r.lines.join('|'), /기록이 쌓이는 중이에요.*기록 1회는 평균에서 뺐어요/);
// 같은 날·미래 날짜 기록은 비교 대상이 아니다
r = endComparison({ date: '2026-09-21', sec: 5000, plannedSec: 5400 }, runs); assert.equal(r.total, 2); assert.equal(r.built, true);
// 이동 중 자동 전환
const ended = [{ e: 15 * 60 + 45, name: '정역학' }, { e: 13 * 60, name: '점심' }, { e: 17 * 60, name: '이동', isMove: true }];
assert.deepEqual(transitState({ ended, nowM: 15 * 60 + 50 }), { since: 945, name: '정역학' });
assert.equal(transitState({ ended, nowM: 15 * 60 + 50, placeRecs: [{ t: '15:46', p: '학교' }] }), null, '끝난 뒤 위치 기록이 있으면 이동 아님');
assert.notEqual(transitState({ ended, nowM: 15 * 60 + 50, placeRecs: [{ t: '15:44', p: '집' }] }), null, '끝나기 전 기록은 무관');
assert.equal(transitState({ ended, nowM: 15 * 60 + 50, dismissed: ['15:45'] }), null, '이동 아니에요');
assert.equal(transitState({ ended, nowM: 15 * 60 + 45 + 121 }), null, '2시간 넘으면 단정하지 않음'); assert.equal(transitState({ ended: [], nowM: 600 }), null);
assert.equal(transitState({ ended: [{ e: 600, name: '이동', isMove: true }], nowM: 610 }), null, '이동 일정이 끝난 건 도착으로 본다');
// 도착 칩
const ch = arrivalChips({ next: [{ name: '근로장학', place: '학교 · 1공 409' }, { name: '저녁' }], recents: ['학교', '카페', '이동 중'] }); assert.deepEqual(ch.where.map((x) => x.p), ['학교 · 1공 409', '학교', '카페', '집', '도서관']); assert.deepEqual(ch.what, ['근로장학', '저녁']);
// 위치 열 조각: 수업 강의실, 캘린더 location, 운선은 가림
const items = eventPlaceItems([{ k: 'class', s: 900, e: 990, cls: { room: '1공 409' } }, { k: 'class', s: 600, e: 660, cls: { room: '' } }, { k: 'cal', s: 1000, e: 1060, ev: { title: '미팅', location: '서울시 성동구, 제1공학관 409호\n2층' } }, { k: 'cal', s: 1100, e: 1160, ev: { title: '운선 모임', location: '이태원' } }, { k: 'work', s: 1, e: 2 }]);
assert.deepEqual(items.map((x) => x.label), ['학교 · 1공 409', '서울시 성동구, 제1공학관 409호']);
console.log('aw-progress ok');
