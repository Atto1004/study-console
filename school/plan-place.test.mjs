// node school/plan-place.test.mjs — 위치 열: 이동 일정에서 「서울 → 안산」 이동 막대 + 「안산」 묶음 막대, 기록 우선, 비어 있으면 비움
import assert from 'node:assert/strict';
import { placeSegments } from './plan.js';

const M = (h, m = 0) => h * 60 + m;
const short = (r) => r.derived.map((d) => [d.kind, d.label, d.s, d.e, d.tentative ? 'plan' : 'ok']);

// 이동 하나: 이동 막대 + 도착지 묶음(자정까지). 이동 전 구간은 직전 도착지가 없으면 비움
let r = placeSegments({ moves: [{ s: M(9), e: M(10, 30), from: '서울', to: '안산' }] });
assert.deepEqual(short(r), [['move', '서울 → 안산', M(9), M(10, 30), 'ok'], ['group', '안산', M(10, 30), 1440, 'ok']]);
// 직전 이동의 도착지(어제 마지막 이동)가 있으면 첫 이동 전까지 그 묶음
r = placeSegments({ moves: [{ s: M(9), e: M(10), from: '안산', to: '서울' }], prevTo: '안산' });
assert.deepEqual(short(r).slice(0, 2), [['group', '안산', 0, M(9), 'ok'], ['move', '안산 → 서울', M(9), M(10), 'ok']]); assert.equal(r.derived[0].inferred, true);
// 이동 둘: 다음 이동 전까지가 묶음
r = placeSegments({ moves: [{ s: M(8), e: M(9), from: '서울', to: '안산' }, { s: M(18), e: M(19), from: '안산', to: '서울' }] });
assert.deepEqual(short(r), [['move', '서울 → 안산', M(8), M(9), 'ok'], ['group', '안산', M(9), M(18), 'ok'], ['move', '안산 → 서울', M(18), M(19), 'ok'], ['group', '서울', M(19), 1440, 'ok']]);
// 같은 글자로 이어지면 하나로(안산→안산 이동은 묶음이 끊기지 않음), 글자가 조금이라도 다르면 별개(별칭 없음)
r = placeSegments({ moves: [{ s: M(8), e: M(9), from: '서울', to: '안산' }, { s: M(12), e: M(12, 20), from: '안산', to: '안산' }] });
assert.deepEqual(r.derived.filter((d) => d.kind === 'group').map((d) => [d.label, d.s, d.e]), [['안산', M(9), M(12)], ['안산', M(12, 20), 1440]], '이동 막대가 사이에 있으니 갈라짐');
r = placeSegments({ moves: [{ s: M(8), e: M(9), from: '집', to: '학교' }, { s: M(12), e: M(13), from: '안산', to: '카페' }] });
assert.deepEqual(r.derived.filter((d) => d.kind === 'group').map((d) => d.label), ['카페'], '「학교」와 「안산」은 합치지 않고, 이어지지 않는 사이(학교 도착 → 안산 출발)는 단정하지 않고 비운다');
// 계획(미확정) 이동은 점선 플래그, 묶음도 같이
r = placeSegments({ moves: [{ s: M(17), e: M(17, 40), from: '학교', to: '집', tentative: true }] });
assert.deepEqual(short(r), [['move', '학교 → 집', M(17), M(17, 40), 'plan'], ['group', '집', M(17, 40), 1440, 'plan']]);
// 출발만/도착만, 둘 다 없으면 막대 없음
r = placeSegments({ moves: [{ s: M(9), e: M(10), from: '집', to: '' }] }); assert.deepEqual(short(r), [['move', '집 →', M(9), M(10), 'ok']]);
r = placeSegments({ moves: [{ s: M(9), e: M(10), from: '', to: '카페' }] }); assert.deepEqual(short(r).map((x) => x[1]), ['→ 카페', '카페']);
r = placeSegments({ moves: [{ s: M(9), e: M(10), from: ' ', to: '' }], prevTo: '집' }); assert.deepEqual(r.derived.map((d) => d.label), ['집'], '이름 없는 이동은 막대를 만들지 않음(앞 구간은 직전 도착지)');
// 직전 도착지와 첫 이동의 출발지 글자가 다르면 앞 구간을 비운다(단정하지 않음), 미확정이면 점선 플래그가 전달된다
r = placeSegments({ moves: [{ s: M(9), e: M(10), from: '서울', to: '안산' }], prevTo: '부산' }); assert.deepEqual(r.derived.map((d) => d.kind), ['move', 'group']);
r = placeSegments({ moves: [{ s: M(9), e: M(10), from: '안산', to: '서울' }], prevTo: '안산', prevTentative: true }); assert.deepEqual([r.derived[0].kind, r.derived[0].tentative, r.derived[0].inferred], ['group', true, true]);
// 이동이 없으면 계산 막대 없음(어제 도착지만으로 하루를 채우지 않는다)
assert.equal(placeSegments({ moves: [], prevTo: '안산' }).derived.length, 0);
// 기록 우선: 위치 기록과 겹치는 시간은 계산 막대에서 뺀다
r = placeSegments({ moves: [{ s: M(9), e: M(10), from: '서울', to: '안산' }], recs: [{ t: '12:00', p: '학교' }, { t: '14:00', p: '도서관' }], nowM: M(15), isToday: false });
assert.deepEqual(r.rec.map((x) => [x.p, x.s, x.e]), [['학교', M(12), M(14)], ['도서관', M(14), 1440]]);
assert.deepEqual(r.derived.map((d) => [d.kind, d.s, d.e]), [['move', M(9), M(10)], ['group', M(10), M(12)]], '12시 이후는 기록이 덮음');
r = placeSegments({ moves: [{ s: M(9), e: M(10), from: '서울', to: '안산' }], recs: [{ t: '09:30', p: '이동 중' }], isToday: false });   // 기록이 이동 막대 중간을 덮는 경우
assert.ok(r.derived.every((d) => d.e <= M(9, 30) || d.s >= 1440), JSON.stringify(r.derived));
// 오늘: 마지막 기록은 지금까지(최소 15분)
r = placeSegments({ moves: [], recs: [{ t: '13:50', p: '카페' }], nowM: M(14), isToday: true }); assert.deepEqual([r.rec[0].s, r.rec[0].e], [M(13, 50), M(14)], '데이터 구간은 지금까지');
r = placeSegments({ moves: [], recs: [{ t: '12:00', p: '카페' }], nowM: M(12, 1), isToday: true }); assert.equal(r.rec[0].e, M(12, 1), '지금 이후로 늘리지 않는다(표시 최소 높이는 화면 몫)');
r = placeSegments({ moves: [], recs: [{ t: '12:00', p: '카페' }], nowM: M(12), isToday: true }); assert.deepEqual([r.rec.length, r.rec[0].s, r.rec[0].e], [1, M(12), M(12)], '막 남긴 기록은 길이 0 으로 남는다');
// 끝이 시작 이하인 이동은 무시, 겹치는 이동은 앞의 묶음을 줄임
assert.equal(placeSegments({ moves: [{ s: M(9), e: M(9), from: 'a', to: 'b' }] }).derived.length, 0);
// 오타 3차: 오늘 12:01 에 기록 12:00·13:00 이 있어도 지금 이후는 없다
r = placeSegments({ moves: [], recs: [{ t: '12:00', p: 'a' }, { t: '13:00', p: 'b' }], nowM: M(12, 1), isToday: true }); assert.deepEqual(r.rec.map((x) => [x.p, x.s, x.e]), [['a', M(12), M(12, 1)]], '미래 기록은 제외, 앞 기록도 지금까지');
r = placeSegments({ moves: [], recs: [{ t: '09:00', p: 'a' }, { t: '10:00', p: 'b' }], nowM: M(12), isToday: true }); assert.deepEqual(r.rec.map((x) => [x.s, x.e]), [[M(9), M(10)], [M(10), M(12)]]);
console.log('plan-place ok');
