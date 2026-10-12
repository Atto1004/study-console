// node school/plan-sleepblk.test.mjs — 시간표 수면 블록: 밤 해석(출처 우선순위·옛 기록·진행 중인 밤)·자정 분할·목표 검증·저장 충돌·순위·대비
import assert from 'node:assert/strict';
import { sleepGoal, goalSpan, sleepNight, splitByDate, sleepBlocksOn, applyGoal, goalSeen, okSleepH, layoutColumns, blockCat, rankOf, BLOCK_COLORS, CATS, kstStamp } from './plan.js';

const KST = (s) => Date.parse(s + ':00+09:00');
const NOW = KST('2026-10-12T14:00');   // 월요일 낮
const goal = sleepGoal({});             // 기본 01:00 · 8시간
const hmOf = (ms) => new Date(ms + 9 * 36e5).toISOString().slice(11, 16);
const night = (K, o = {}) => sleepNight(K, { goal, nowMs: NOW, ...o });
const app = (bedAt, wakeAt) => ({ bed: bedAt.slice(11, 16), ...(wakeAt ? { wake: wakeAt.slice(11, 16), wakeAt } : {}), src: 'app', bedAt });

// ── 목표: 기본·검증 ──
assert.deepEqual([goal.bed, goal.hours, goal.wake], [60, 8, 540]);
assert.deepEqual(sleepGoal({ bed: '23:30', sleepH: 7.5 }).wake, (23 * 60 + 30 + 450) % 1440);
assert.equal(sleepGoal({ bed: '12:00' }).bed, 60); assert.ok(sleepGoal({ bed: '12:00' }).notes.length, '범위 밖이면 기본 + 알림');
assert.equal(sleepGoal({ bed: '06:00' }).bed, 60); assert.equal(sleepGoal({ bed: '05:59' }).bed, 359); assert.equal(sleepGoal({ bed: '18:00' }).bed, 1080);
assert.equal(sleepGoal({ sleepH: 3 }).hours, 8); assert.equal(sleepGoal({ sleepH: 13 }).hours, 8); assert.equal(sleepGoal({ sleepH: '7' }).hours, 7);
assert.deepEqual([okSleepH(4), okSleepH(12), okSleepH(7.5), okSleepH(7.2), okSleepH(3.5), okSleepH(12.5), okSleepH(NaN), okSleepH('8')], [true, true, true, false, false, false, false, false]);
// 취침 목표 18시 이후 = 전날 밤
assert.deepEqual(goalSpan('2026-10-13', sleepGoal({ bed: '23:00', sleepH: 8 })).map(hmOf), ['23:00', '07:00']);
assert.equal(new Date(goalSpan('2026-10-13', sleepGoal({ bed: '23:00' }))[0] + 9 * 36e5).toISOString().slice(0, 10), '2026-10-12');
assert.equal(new Date(goalSpan('2026-10-13', goal)[0] + 9 * 36e5).toISOString().slice(0, 10), '2026-10-13');

// ── 자정 분할 ──
const sp = splitByDate(KST('2026-10-11T23:40'), KST('2026-10-12T07:30'));
assert.deepEqual(sp.map((x) => [x.date, x.s, x.e, x.contPrev, x.contNext]), [['2026-10-11', 1420, 1440, false, true], ['2026-10-12', 0, 450, true, false]]);
assert.equal(splitByDate(KST('2026-10-11T23:00'), KST('2026-10-12T00:00')).length, 1, '정확히 자정에 끝나면 다음 날 길이 0 조각 없음');
assert.equal(splitByDate(KST('2026-10-11T23:00'), KST('2026-10-12T00:00'))[0].e, 1440);
assert.equal(splitByDate(KST('2026-12-31T23:00'), KST('2027-01-01T08:00')).map((x) => x.date).join(), '2026-12-31,2027-01-01');   // 해 경계

// ── 출처 우선순위 ──
const ap = (bed, wake) => ({ main: { bed, wake, asleep_min: 400, source: 'watch' } });
const K = '2026-10-12';
let n = night(K, { apple: ap('2026-10-11T23:50', '2026-10-12T07:20'), sleep: { [K]: app('2026-10-12T00:10:00+09:00', '2026-10-12T08:00:00+09:00') } });
assert.equal(n.src, 'Apple 건강'); assert.equal(hmOf(n.bedMs), '23:50'); assert.equal(hmOf(n.wakeMs), '07:20'); assert.equal(n.parts[0].kind, 'done');
n = night(K, { apple: null, sleep: { [K]: app('2026-10-12T00:10:00+09:00', '2026-10-12T08:00:00+09:00') } });
assert.equal(n.src, '앱 기록'); assert.equal(hmOf(n.bedMs), '00:10'); assert.equal(hmOf(n.wakeMs), '08:00');
n = night(K, { apple: undefined, appleFailed: true, sleep: { [K]: app('2026-10-12T00:10:00+09:00', '2026-10-12T08:00:00+09:00') } });
assert.equal(n.src, '앱 기록'); assert.ok(n.notes.some((t) => /Apple 건강 조회 실패/.test(t)));
// Apple 값이 이상하면(기상일≠키·역전·24시간 초과·아직 안 온 시각) 쓰지 않고 앱 기록으로
for (const bad of [ap('2026-10-11T23:50', '2026-10-13T07:20'), ap('2026-10-12T08:00', '2026-10-12T07:00'), ap('2026-10-10T23:00', '2026-10-12T07:00'), ap('2026-10-12T10:00', '2026-10-12T16:00').main && { main: { bed: '2026-10-12T10:00', wake: '2026-10-12T15:00' } }]) {
  n = night(K, { apple: bad, sleep: {} }); assert.equal(n.src, null, JSON.stringify(bad)); assert.ok(n.notes.length);
}

// ── 과거 확정 / 취침만 / 기록 없음 ──
n = night(K, { sleep: { [K]: app('2026-10-11T23:40:00+09:00', '2026-10-12T07:30:00+09:00') } });
assert.deepEqual(n.parts.map((p) => p.kind), ['done']);
n = night('2026-10-10', { sleep: { '2026-10-10': app('2026-10-10T00:30:00+09:00') } });   // 취침만, 지난 밤
assert.deepEqual(n.parts.map((p) => p.kind), ['mark']); assert.equal(n.wakeMs, null, '기상을 목표로 채우지 않는다'); assert.equal(n.parts[0].to - n.parts[0].from, 60000);
n = night('2026-10-09', { sleep: {} }); assert.equal(n.parts.length, 0, '기록 없는 지난 밤은 아무것도 안 그린다');
// ── 진행 중인 밤 / 미래 ──
const N2 = KST('2026-10-13T02:00');   // 화요일 새벽 2시
n = sleepNight('2026-10-13', { goal, nowMs: N2, sleep: { '2026-10-13': app('2026-10-13T00:40:00+09:00') } });
assert.deepEqual(n.parts.map((p) => p.kind), ['mark', 'plan']); assert.equal(hmOf(n.parts[1].from), '02:00', '계획은 지금부터'); assert.equal(hmOf(n.parts[1].to), '09:00');
n = sleepNight('2026-10-13', { goal, nowMs: N2, sleep: {} });   // 기록 없이 목표 취침 지난 밤 → 지금부터 목표 기상까지만
assert.deepEqual(n.parts.map((p) => [p.kind, hmOf(p.from), hmOf(p.to)]), [['plan', '02:00', '09:00']]);
n = sleepNight('2026-10-13', { goal, nowMs: KST('2026-10-13T10:00'), sleep: {} }); assert.equal(n.parts.length, 0, '목표 기상이 지났고 기록 없음 → 계획 없음(과거는 만들지 않음)');
n = night('2026-10-13'); assert.deepEqual(n.parts.map((p) => [p.kind, hmOf(p.from), hmOf(p.to)]), [['plan', '01:00', '09:00']]);   // 낮 2시에 보는 내일 밤
n = night('2026-10-12'); assert.equal(n.parts.length, 0, '오늘 14:00 의 오늘 새벽 밤은 이미 지남(기록 없음)');
n = sleepNight('2026-10-13', { goal, nowMs: KST('2026-10-12T23:30'), sleep: { '2026-10-13': app('2026-10-12T23:20:00+09:00') } });
assert.deepEqual(n.parts.map((p) => p.kind), ['mark', 'plan']);   // 23:30 에 이미 취침 기록한 밤
const evening = sleepBlocksOn('2026-10-12', { sleep: { '2026-10-13': app('2026-10-12T23:20:00+09:00') }, cfg: {}, nowMs: KST('2026-10-12T23:30') });
assert.deepEqual(evening.map((b) => [b.sleep.state, b.s, b.e]), [['mark', 1400, 1401], ['plan', 1410, 1440]], '오늘 날짜 쪽 조각: 표식 + 자정까지 계획');
// 아침 확인을 누르면(wakeAt 기록) 확정으로 완성
const doneBlocks = sleepBlocksOn('2026-10-13', { sleep: { '2026-10-13': app('2026-10-12T23:20:00+09:00', '2026-10-13T07:10:00+09:00') }, cfg: {}, nowMs: KST('2026-10-13T07:11') });
assert.deepEqual(doneBlocks.map((b) => [b.sleep.state, b.s, b.e, b.sleep.contPrev]), [['done', 0, 430, true]]);
assert.match(doneBlocks[0].title, /취침 23:20 – 기상 07:10/);

// ── 옛 HH:MM 기록 ──
n = night(K, { sleep: { [K]: { bed: '23:40', wake: '07:30' } } }); assert.equal(n.src, '직접 입력'); assert.equal(hmOf(n.bedMs), '23:40'); assert.equal(new Date(n.bedMs + 9 * 36e5).toISOString().slice(0, 10), '2026-10-11');
n = night(K, { sleep: { [K]: { bed: '01:00', wake: '08:00' } } }); assert.equal(new Date(n.bedMs + 9 * 36e5).toISOString().slice(0, 10), '2026-10-12');
assert.ok(n.notes.some((t) => /날짜는 시각으로 추정/.test(t)));
for (const r of [{ bed: '08:00', wake: '08:00' }, { bed: '14:00', wake: '07:00' }, { bed: '10:00', wake: '15:00' }, { bed: 'abc', wake: '07:00' }, { bed: '12:30' }, { wake: '07:00' }]) {
  n = night(K, { sleep: { [K]: r } }); assert.equal(n.bedMs, null, JSON.stringify(r)); assert.ok(n.notes.length, '이유를 알린다 ' + JSON.stringify(r));
}
n = night('2026-10-10', { sleep: { '2026-10-10': { bed: '00:30' } } }); assert.deepEqual(n.parts.map((p) => p.kind), ['mark']);
assert.ok(night(K, { sleep: { [K]: { bed: '14:00', wake: '07:00' } } }).notes.join().includes('모호'));
// 앱 기록이 이상하면 옛 HH:MM 으로 다시 해석하지 않는다
n = night(K, { sleep: { [K]: { bed: '23:40', wake: '07:30', src: 'app', bedAt: 'garbage' } } }); assert.equal(n.bedMs, null);
n = night(K, { sleep: { [K]: { ...app('2026-10-11T23:40:00+09:00'), wake: '07:30', wakeAt: '2026-10-12T07:31:00+09:00' } } });   // HH:MM 불일치 → 기상만 무시
assert.deepEqual(n.parts.map((p) => p.kind).slice(0, 1), ['mark']);

// ── 날짜 블록: 한 주 느낌(KST 월 14:00): 확정 1 + 취침만 1 + 기록 없음 + 계획 ──
const sleep = { '2026-10-12': app('2026-10-11T23:40:00+09:00', '2026-10-12T07:30:00+09:00'), '2026-10-10': app('2026-10-10T00:30:00+09:00') };
const week = []; for (let i = 0; i < 7; i++) { const d = new Date(Date.UTC(2026, 9, 12 + i - 2)).toISOString().slice(0, 10); week.push([d, sleepBlocksOn(d, { sleep, cfg: {}, nowMs: NOW }).map((b) => b.sleep.state + b.sleep.key.slice(8))]); }
assert.deepEqual(week.map((w) => w[1].join('/')), ['mark10', 'done12', 'done12', 'plan13', 'plan14', 'plan15', 'plan16']);   // 10/10(토)~10/16(금): 자정 걸친 확정은 11·12 양쪽, 기록 없는 지난 밤(10/11 새벽)은 없음
// 같은 날짜에 오는 중복 없음: 밤 하나의 조각은 날짜당 하나

// ── 겹침 순위 ──
const bk = (o) => ({ title: o.t || 'x', ...o });
const sleepDone = bk({ k: 'sleep', s: 0, e: 450, sleep: { state: 'done' } }), sleepPlan = bk({ k: 'sleep', s: 60, e: 540, sleep: { state: 'plan' } });
assert.deepEqual([rankOf(sleepDone), rankOf(sleepPlan), rankOf({ k: 'class' }), rankOf({ k: 'auto' })], [0, 3, 0, 2]);
assert.equal(blockCat(sleepDone), '수면'); assert.ok(CATS.includes('수면'));
const cls = bk({ k: 'class', s: 480, e: 540, t: '수업' });
layoutColumns([sleepPlan, cls]); assert.ok(sleepPlan.col > cls.col, '계획 수면은 수업 오른쪽 열');
const d2 = bk({ k: 'sleep', s: 0, e: 450, sleep: { state: 'done' } }), c2 = bk({ k: 'cal', s: 100, e: 200, ev: {}, t: '약속' });
layoutColumns([c2, d2]); assert.equal(rankOf(d2), rankOf(c2), '확정 수면 = 고정 순위');

// ── 목표 저장: 검증·충돌 ──
const s0 = { cfg: { bed: '01:00', sleepH: 8, other: 1 } }, seen = goalSeen(s0.cfg);
assert.equal(applyGoal(s0, { bed: '00:30', sleepH: 7.5, seen }), 'applied'); assert.deepEqual(s0.cfg, { bed: '00:30', sleepH: 7.5, other: 1 }, '다른 필드 유지');
assert.equal(applyGoal(s0, { bed: '02:00', sleepH: 8, seen }), 'conflict', '그 사이 바뀜 → 덮어쓰지 않음'); assert.equal(s0.cfg.bed, '00:30');
for (const bad of [{ bed: '12:00', sleepH: 8 }, { bed: '07:00', sleepH: 8 }, { bed: '25:00', sleepH: 8 }, { bed: '01:00', sleepH: 3.5 }, { bed: '01:00', sleepH: 12.5 }, { bed: '01:00', sleepH: 7.2 }, { bed: '01:00', sleepH: NaN }]) assert.equal(applyGoal({ cfg: {} }, { ...bad, seen: goalSeen({}) }), 'invalid', JSON.stringify(bad));
const s1 = {}; assert.equal(applyGoal(s1, { bed: '23:00', sleepH: 8, seen: goalSeen(undefined) }), 'applied'); assert.deepEqual(s1.cfg, { bed: '23:00', sleepH: 8 });   // cfg 가 없던 상태에서도
// 두 번 적용돼도(409 재적용) 같은 결과
const s2 = { cfg: { bed: '01:00', sleepH: 8 } }, seen2 = goalSeen(s2.cfg); applyGoal(s2, { bed: '02:00', sleepH: 8, seen: seen2 }); assert.equal(applyGoal(s2, { bed: '02:00', sleepH: 8, seen: seen2 }), 'conflict');   // 재적용은 충돌로 분류되지만 값은 그대로

// ── 색 대비(4.5:1) ──
const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
for (const k of ['c-sleep', 'c-sleep-stripe', 'c-sleep-plan', 'tag-sleep', 'small-sleep', 'small-sleep-plan']) { const [bg, fg] = BLOCK_COLORS[k]; assert.ok(ratio(bg, fg) >= 4.5, `${k} ${ratio(bg, fg).toFixed(2)}`); }
console.log('plan-sleepblk ok');
// ── 오타 2차 반영 ──
{
  const g = sleepGoal({ bed: '01:00', sleepH: 7.25 }); assert.equal(g.hours, 7.25, '기존 소수 값은 그대로 읽는다');
  const t = { cfg: { bed: '01:00', sleepH: 7.25 } }, sn = goalSeen(t.cfg);
  assert.equal(applyGoal(t, { bed: '00:30', sleepH: 7.25, seen: sn }), 'applied', '기존 값 그대로면 저장 허용');
  assert.equal(applyGoal({ cfg: { sleepH: 8 } }, { bed: '01:00', sleepH: 7.25, seen: goalSeen({ sleepH: 8 }) }), 'invalid', '새 소수 값은 거부');
  // 계획 수면은 겹치는 블록의 오른쪽 열: 고정 08:00–09:00, 공부 08:30–10:00, 계획 수면 09:00–09:30 → 수면이 가장 오른쪽
  const f1 = { k: 'class', s: 480, e: 540, title: '수업' }, f2 = { k: 'plan', plan: { state: 'confirmed', bk: '공부' }, s: 510, e: 600, title: '공부' }, f3 = { k: 'sleep', sleep: { state: 'plan' }, s: 540, e: 570, title: '수면' };
  layoutColumns([f1, f2, f3]); assert.ok(f3.col > f2.col && f3.col > f1.col, `열 ${f1.col}${f2.col}${f3.col}`);
  const g1 = { k: 'class', s: 0, e: 100, title: 'a' }, g3 = { k: 'sleep', sleep: { state: 'plan' }, s: 200, e: 300, title: 'z' }, g4 = { k: 'class', s: 250, e: 400, title: 'b' };
  layoutColumns([g1, g3, g4]); assert.ok(g3.col > g4.col, '겹치는 블록이 있는 구간에서는 오른쪽');
}
console.log('plan-sleepblk 2차 ok');
