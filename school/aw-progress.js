// ALiVEWEEK 진행 상태 확장(대표님 10/12): 수업 종료 비교(초 단위) · 종료 뒤 자동 「이동 중」 · 도착 칩 · 일정에서 위치 열 조각.
// 화면(plan.js)은 얇게 연결만 하고, 계산은 모두 여기서 한다(DOM 없음 → 노드에서 바로 검사).
const mins = (hm) => { const [h, m] = String(hm || '0:0').split(':').map(Number); return h * 60 + (m || 0); };
const okHM = (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(v || ''));
export const OUTLIER = { lo: 0.5, hi: 1.5 };   // 예정 길이의 50% 미만·150% 초과는 평균에서 뺀다(잘못 누른 종료·늦게 누른 종료)
export const MIN_RUNS = 3;                     // 오늘 포함 3회부터 평균
export const SAME_SEC = 15;                    // 이 차이 안쪽은 「거의 같게」

export function fmtSec(sec) {
  sec = Math.max(0, Math.round(sec)); const m = Math.floor(sec / 60), s = sec % 60;
  return m && s ? `${m}분 ${s}초` : m ? `${m}분` : `${s}초`;
}
// 수업 회차 기록: classLog = {수업id:{course,date,endedAt:'HH:MM', endedAtISO?, actualSec?, plannedStart?, plannedEnd?}}
// 초 단위(actualSec)가 있으면 그것, 옛 기록(분 단위 endedAt 만)은 예정 시작 − 종료로 계산한다(분 정밀도). plannedOf(entry) → {s,e}|null 은 옛 기록의 예정 시각을 학교 시간표에서 찾는 훅.
export function classRuns(classLog, course, plannedOf) {
  const out = [], seen = new Set();
  for (const l of Object.values(classLog || {})) {
    if (!l || l.course !== course || !/^\d{4}-\d{2}-\d{2}$/.test(l.date || '') || !okHM(l.endedAt) || seen.has(l.date)) continue;
    const pl = okHM(l.plannedStart) && okHM(l.plannedEnd) ? { s: l.plannedStart, e: l.plannedEnd } : plannedOf?.(l) || null;
    if (!pl) continue; const plannedSec = (mins(pl.e) - mins(pl.s)) * 60; if (!(plannedSec > 0)) continue;
    const sec = Number.isFinite(l.actualSec) ? l.actualSec : (mins(l.endedAt) - mins(pl.s)) * 60;
    if (!(sec > 0)) continue; seen.add(l.date); out.push({ date: l.date, sec, plannedSec, precise: Number.isFinite(l.actualSec) });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}
export const isOutlier = (r) => r.sec < r.plannedSec * OUTLIER.lo || r.sec > r.plannedSec * OUTLIER.hi;
const sign = (d, fast, slow, same) => Math.abs(d) < SAME_SEC ? same : d < 0 ? fast(fmtSec(-d)) : slow(fmtSec(d));
// 오늘 수업 종료 비교 한 줄(들). runs 는 classRuns 결과(오늘 것은 빼도 넣어도 됨 — 날짜로 걸러낸다). 기록 없는 회차·휴강은 애초에 runs 에 없다.
export function endComparison({ date, sec, plannedSec }, runs) {
  const prior = runs.filter((r) => r.date < date), valid = prior.filter((r) => !isOutlier(r)), excluded = prior.length - valid.length;
  const todayBad = plannedSec > 0 && isOutlier({ sec, plannedSec }), total = valid.length + (todayBad ? 0 : 1), tail = excluded ? [`예정과 너무 다른 기록 ${excluded}회는 평균에서 뺐어요`] : [];
  if (todayBad) return { built: false, todayOutlier: true, lines: ['이번 기록은 예정 시간과 너무 달라 평균에 넣지 않았어요', ...tail], total, excluded };   // 잘못 누른 종료·한참 늦은 종료를 평균에 섞지 않는다
  if (total < MIN_RUNS) return { built: true, lines: ['기록이 쌓이는 중이에요 · 평균은 3회부터', ...tail], total, excluded };
  const avg = valid.reduce((n, r) => n + r.sec, 0) / valid.length, prev = valid[valid.length - 1], lines = [];
  lines.push(sign(sec - avg, (t) => `오늘은 평소보다 ${t} 빨리 끝났네요!`, (t) => `오늘은 평소보다 ${t} 늦게 끝났어요 ㅠㅠ`, '오늘은 평소와 거의 같게 끝났어요'));
  lines.push(sign(sec - prev.sec, (t) => `저번 시간보다 ${t} 빨리 끝났어요`, (t) => `저번 시간보다 ${t} 늦게 끝났어요`, '저번 시간과 거의 같게 끝났어요'));
  lines.push(...tail);
  return { built: false, lines, total, excluded, avgSec: avg, prevSec: prev.sec };
}

// 종료 뒤 자동 「이동 중」: 오늘 이미 끝난 일정 중 가장 늦게 끝난 것(이동 일정 자신은 빼고) 뒤로, 지금 하는 일이 없고, 그 끝 이후의 위치 기록이 없고, 사용자가 「이동 아니에요」 하지 않았으면.
// 끝난 지 TRANSIT_MAX_MIN 분이 지나면 더는 이동 중이라고 단정하지 않는다(몇 시간째 이동일 리 없음 — 추정으로 채우지 않음).
export const TRANSIT_MAX_MIN = 120;
export function transitState({ ended = [], nowM, placeRecs = [], dismissed = [] }) {
  const last = ended.filter((b) => !b.isMove && b.e <= nowM).sort((a, b) => b.e - a.e)[0]; if (!last) return null;
  if (nowM - last.e > TRANSIT_MAX_MIN) return null;
  const hhmm = (n) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
  if (dismissed.includes(hhmm(last.e))) return null;
  if (placeRecs.some((r) => okHM(r.t) && mins(r.t) >= last.e)) return null;
  return { since: last.e, name: last.name };
}
// 도착 칩: 다음 일정(이름·장소), 최근 위치, 기본 장소. 중복은 처음 것만. 좌표는 다루지 않는다.
export function arrivalChips({ next = [], recents = [], base = ['집', '학교', '도서관', '카페'] }) {
  const seen = new Set(), where = [], push = (p, why) => { const k = String(p || '').trim(); if (!k || k === '이동 중' || seen.has(k)) return; seen.add(k); where.push({ p: k, why }); };
  for (const n of next) if (n.place) push(n.place, '다음 일정');
  for (const r of recents) push(r, '최근');
  for (const b of base) push(b, '');
  const what = []; for (const n of next.slice(0, 3)) if (n.name) what.push(n.name);
  return { where, what };
}
// 위치 열: 장소가 있는 일정(수업 강의실·캘린더 location)의 시간대 조각. 모르면 만들지 않는다(지어내지 않음).
export function eventPlaceItems(blocks) {
  const out = [];
  for (const b of blocks) {
    let label = '';
    if (b.k === 'class') { const room = String(b.cls?.room || '').trim(); if (room) label = `학교 · ${room}`; }
    else if (b.k === 'cal') { const loc = String(b.ev?.location || '').split(/\r?\n/)[0].trim().slice(0, 80); if (loc && !/^\s*운선/.test(b.ev?.title || '')) label = loc; }   // 첫 줄만(쉼표는 주소의 일부라 자르지 않는다. 길이는 화면에서 줄여 보인다) if (loc && !/^\s*운선/.test(b.ev?.title || '')) label = loc; }
    if (label && b.e > b.s) out.push({ s: b.s, e: b.e, label, kind: 'group', tentative: false, event: true });
  }
  return out;
}
