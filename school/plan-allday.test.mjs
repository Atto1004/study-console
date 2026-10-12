// node school/plan-allday.test.mjs — 종일 일정: 구글 캘린더 종일(UTC 날짜·종료일 배타) 해석, 보이는 날짜에 맞춘 칸·줄 배치, 종료 시각 규칙. TZ 가 달라도 같은 결과여야 한다(TZ=America/Los_Angeles 로도 실행)
import assert from 'node:assert/strict';
import { calAllDaySpan, planAllDaySpan, allDayDays, allDayItems, planEndMs, planLapsed, ALLDAY_BK, ALLDAY_MAX_DAYS } from './plan.js';

const ev = (o) => ({ id: 'e', title: '종일', start: '', end: '', allDay: true, cal: '한양', ...o });
// ── 구글 캘린더 종일: startISO·endISO 는 UTC 날짜, endISO 는 마지막 날의 다음 날(배타) ──
assert.deepEqual(calAllDaySpan(ev({ startISO: '2026-10-10T00:00:00Z', endISO: '2026-10-11T00:00:00Z' }), '2026-10-10'), { from: '2026-10-10', to: '2026-10-10' }, '하루짜리: 끝 배타라 10/11 이 아니라 10/10 까지');
assert.deepEqual(calAllDaySpan(ev({ startISO: '2026-10-27T00:00:00Z', endISO: '2026-10-29T00:00:00Z' }), '2026-10-28'), { from: '2026-10-27', to: '2026-10-28' }, '이틀짜리(10/27~10/28)');
assert.deepEqual(calAllDaySpan(ev({ startISO: '2026-11-09T00:00:00Z', endISO: '2026-11-13T00:00:00Z' }), '2026-11-10'), { from: '2026-11-09', to: '2026-11-12' }, '4일짜리');
assert.deepEqual(calAllDaySpan(ev({ startISO: '2026-10-31T00:00:00Z', endISO: '2026-11-02T00:00:00Z' }), '2026-10-31'), { from: '2026-10-31', to: '2026-11-01' }, '달 경계');
assert.deepEqual(calAllDaySpan(ev({ startISO: '2026-12-31T00:00:00Z', endISO: '2027-01-02T00:00:00Z' }), '2027-01-01'), { from: '2026-12-31', to: '2027-01-01' }, '해 경계');
// +09:00 로 온 값도 날짜 부분 그대로(Date 로 바꿔 UTC 로 내리면 하루 앞당겨진다)
assert.deepEqual(calAllDaySpan(ev({ startISO: '2026-10-10T00:00:00+09:00', endISO: '2026-10-11T00:00:00+09:00' }), '2026-10-10'), { from: '2026-10-10', to: '2026-10-10' });
// 00:00 이 아니면(종일 값이 아님) 그 날 하루만 · 값 없음·끝이 시작 이하·날짜 칸과 안 맞음도 그 날 하루
for (const bad of [{ startISO: '2026-10-09T15:00:00Z', endISO: '2026-10-10T15:00:00Z' }, {}, { startISO: '2026-10-10T00:00:00Z' }, { startISO: '2026-10-10T00:00:00Z', endISO: '2026-10-10T00:00:00Z' }, { startISO: 'garbage', endISO: 'x' }]) {
  const sp = calAllDaySpan(ev(bad), '2026-10-10'); assert.equal(sp.from, '2026-10-10'); assert.ok(sp.to >= sp.from && sp.to <= '2026-10-10', JSON.stringify(bad));
}
assert.deepEqual(calAllDaySpan(ev({ startISO: '2026-10-20T00:00:00Z', endISO: '2026-10-22T00:00:00Z' }), '2026-10-25'), { from: '2026-10-25', to: '2026-10-25' }, '이상한 날짜 칸');
// ── 앱 계획 ──
assert.deepEqual(planAllDaySpan({ date: '2026-10-13' }), { from: '2026-10-13', to: '2026-10-13' });
assert.deepEqual(planAllDaySpan({ date: '2026-10-13', endDate: '2026-10-15' }), { from: '2026-10-13', to: '2026-10-15' });
assert.deepEqual(planAllDaySpan({ date: '2026-10-13', endDate: '2026-10-12' }), { from: '2026-10-13', to: '2026-10-13' }, '이상한 종료일은 무시');
assert.deepEqual([allDayDays('2026-10-13', '2026-10-13'), allDayDays('2026-10-13', '2026-11-12'), allDayDays('2026-12-30', '2027-01-02')], [1, 31, 4]);
assert.deepEqual([ALLDAY_BK, ALLDAY_MAX_DAYS], [['고정', '과제'], 31]);
// 끝 시각 = 마지막 날 24:00(KST). 계획이 이 시각을 지나야 「지난 계획」
const K = (s) => Date.parse(s + '+09:00');
assert.equal(planEndMs({ date: '2026-10-13', allDay: true, state: 'tentative' }), K('2026-10-14T00:00:00'));
assert.equal(planEndMs({ date: '2026-10-13', endDate: '2026-10-15', allDay: true }), K('2026-10-16T00:00:00'));
assert.equal(planEndMs({ date: '2026-10-13', e: '10:00' }), K('2026-10-13T10:00:00'), '시간 일정은 그대로');
const tp = { date: '2026-10-13', endDate: '2026-10-15', allDay: true, state: 'tentative' };
assert.equal(planLapsed(tp, K('2026-10-15T23:59:00')), false); assert.equal(planLapsed(tp, K('2026-10-16T00:00:00')), true, '마지막 날 끝(자정)이 되면 지난 계획');

// ── 배치 ──
const dates = []; for (let i = 0; i < 7; i++) dates.push(new Date(Date.UTC(2026, 9, 12 + i)).toISOString().slice(0, 10));   // 10/12(월)~10/18(일)
const P = (o) => ({ id: 'p' + Math.random(), date: '2026-10-13', allDay: true, note: '일정', state: 'confirmed', bk: '고정', s: '00:00', e: '23:59', ...o });
const calDays = { '2026-10-20': [ev({ id: 'x', title: '일찍 시작', startISO: '2026-10-17T00:00:00Z', endISO: '2026-10-21T00:00:00Z' })], '2026-10-17': [ev({ id: 'x', title: '일찍 시작', startISO: '2026-10-17T00:00:00Z', endISO: '2026-10-21T00:00:00Z' }), ev({ id: 'y', title: '운선 모임', startISO: '2026-10-17T00:00:00Z', endISO: '2026-10-18T00:00:00Z' })], '2026-10-18': [ev({ id: 'x', title: '일찍 시작', startISO: '2026-10-17T00:00:00Z', endISO: '2026-10-21T00:00:00Z' }), { id: 't', title: '시간 일정', start: '10:00', end: '11:00', allDay: false }], '2026-10-12': [ev({ id: 'w', title: '지난주 끝', startISO: '2026-10-11T00:00:00Z', endISO: '2026-10-13T00:00:00Z' })] };
const items = allDayItems({ dates, plans: [P({ id: 'a', note: '공모전 마감', endDate: '2026-10-15' }), P({ id: 'b', note: '겹침', date: '2026-10-14' }), P({ id: 'c', note: '다른 주', date: '2026-10-25' }), { id: 'z', date: '2026-10-13', s: '10:00', e: '11:00', note: '시간 일정' }, P({ id: 'd', note: '계획', date: '2026-10-16', state: 'tentative', bk: '과제' })], calDay: (d) => calDays[d], nowMs: K('2026-10-12T14:00:00') });
const by = (t) => items.find((i) => i.title === t);
assert.deepEqual(items.map((i) => i.title).sort(), ['개인 일정', '계획', '겹침', '공모전 마감', '일찍 시작', '지난주 끝'].sort(), '다른 주·시간 일정·캘린더 시간 일정은 안 들어오고, 「운선」 제목은 가림');
assert.deepEqual([by('공모전 마감').c0, by('공모전 마감').c1], [1, 3]); assert.equal(by('겹침').lane > by('공모전 마감').lane, true, '겹치면 다른 줄');
assert.equal(by('계획').tentative, true); assert.equal(by('계획').cat, '과제', '계획이어도 종류(고정·과제)를 들고 있다'); assert.equal(by('공모전 마감').cat, '고정');
assert.deepEqual([by('일찍 시작').c0, by('일찍 시작').c1, by('일찍 시작').contR, by('일찍 시작').contL], [5, 6, true, false], '10/17~10/20 중 이번 주(토·일)만, 오른쪽으로 이어짐');
assert.deepEqual([by('지난주 끝').c0, by('지난주 끝').c1, by('지난주 끝').contL], [0, 0, true], '10/11~10/12 중 월요일만, 왼쪽에서 이어짐');
assert.equal(items.filter((i) => i.title === '일찍 시작').length, 1, '같은 캘린더 이벤트는 날짜마다 들어 있어도 한 번만');
// 같은 줄 재사용: 안 겹치는 항목은 같은 줄
const it2 = allDayItems({ dates, plans: [P({ id: '1', date: '2026-10-12', note: 'a' }), P({ id: '2', date: '2026-10-14', note: 'b' }), P({ id: '3', date: '2026-10-12', endDate: '2026-10-13', note: 'c' })] });
assert.deepEqual(it2.map((i) => [i.title, i.lane]).sort(), [['a', 1], ['b', 0], ['c', 0]].sort());
// 하루 보기(날짜 1개): 캘린더만 있고 모르면(undefined) 비어 있음
assert.deepEqual(allDayItems({ dates: ['2026-10-12'], plans: [], calDay: () => undefined }), []);
assert.deepEqual(allDayItems({ dates: [], plans: [P()] }), []);
// 자정 경계: 10/13 하루짜리 종일은 10/12 칸에 걸치지 않고 10/13 하나에만
const one = allDayItems({ dates: ['2026-10-12', '2026-10-13', '2026-10-14'], plans: [P({ date: '2026-10-13' })] }); assert.deepEqual([one[0].c0, one[0].c1], [1, 1]);
console.log('plan-allday ok');
