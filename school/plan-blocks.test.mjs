// node school/plan-blocks.test.mjs — 시간표 블록 4종 구분(대표님 10/12): 종류 매핑 · 옛 계획 호환 · 겹침 열 배치 · 글자 대비 4.5:1
import assert from 'node:assert/strict';
import { dedupeBlocks, isMoveEvent, moveName, MOVE_LENS, CATS, blockCat, planState, planBk, layoutColumns, BLOCK_COLORS, PAST_OPACITY, CAT_CLASS, CAT_NAME } from './plan.js';

// ── 매핑표: 기존 종류 → 새 4종 ──
const plan = (extra = {}) => ({ k: 'plan', plan: { id: 'p', note: '12.3 연습문제', ...extra } });
assert.equal(blockCat({ k: 'class' }), '고정');
assert.equal(blockCat({ k: 'cal' }), '고정');
assert.equal(blockCat({ k: 'work' }), '고정');
assert.equal(blockCat({ k: 'exam' }), '고정');
assert.equal(blockCat({ k: 'auto' }), '계획');                      // 저장 안 된 추천
assert.equal(blockCat(plan({ state: 'tentative' })), '계획');        // 계획 모드·채우기가 만든 것
assert.equal(blockCat(plan({ state: 'tentative', bk: '과제' })), '계획'); // 상태가 우선
assert.equal(blockCat(plan({ state: 'confirmed', bk: '공부' })), '공부');
assert.equal(blockCat(plan({ state: 'confirmed', bk: '과제' })), '과제');
assert.equal(blockCat(plan({ state: 'confirmed', bk: '고정' })), '고정');
// 옛 계획(state·bk 없음) = 확정, 종류는 note 로 추정
assert.equal(planState({}), 'confirmed');
assert.equal(planState({ state: 'tentative' }), 'tentative');
assert.equal(planState({ state: 'weird' }), 'confirmed');
assert.equal(blockCat(plan()), '공부');
assert.equal(blockCat(plan({ note: '과제 · HW5' })), '과제');
assert.equal(blockCat(plan({ note: '공모전 · 포스터' })), '과제');
assert.equal(blockCat(plan({ note: '시험 공부 · 정역학 (시험 10/21)' })), '공부');
assert.equal(planBk({ bk: '고정', note: '과제 · x' }), '고정');      // bk 가 있으면 note 보다 우선
assert.equal(planBk({ bk: '기타', note: '과제 · x' }), '과제');      // 모르는 bk 는 무시
// 분류 불명은 조용히 고정으로 넘기지 않는다
assert.equal(blockCat({ k: 'mystery' }), null);
assert.equal(blockCat(null), null);
// 모든 알려진 종류가 4종 안에, 전부 화면용 클래스·이름이 있다
for (const k of ['class', 'cal', 'work', 'exam', 'auto', 'plan']) { const c = blockCat(k === 'plan' ? plan() : { k }); assert.ok(CATS.includes(c), k); assert.ok(CAT_CLASS[c] && CAT_NAME[c]); }
assert.deepEqual(CATS, ['고정', '공부', '과제', '이동', '수면', '계획']);

// ── 겹침: 무리 전체를 열로 나눈다. 순위 고정 > 공부·과제 > 계획 ──
const B = (k, s, e, title, extra = {}) => ({ k, s, e, title, ...(k === 'plan' ? { plan: { note: title, ...extra } } : {}) });
{
  const a = B('class', 540, 660, '수업'), b = B('plan', 570, 630, '공부', { state: 'confirmed', bk: '공부' }), c = B('plan', 600, 660, '계획', { state: 'tentative' });
  layoutColumns([c, b, a]);   // 입력 순서와 상관없음
  assert.equal(a.col, 0); assert.equal(b.col, 1); assert.equal(c.col, 2);   // 오타 지적: 낮은 둘이 오른쪽에서 겹치지 않아야 함
  assert.ok([a, b, c].every((x) => x.cols === 3));
}
{
  const a = B('class', 540, 600, '수업'), b = B('plan', 600, 660, '공부', { state: 'confirmed', bk: '공부' }), c = B('auto', 700, 760, '추천');
  layoutColumns([a, b, c]);
  assert.deepEqual([a.cols, b.cols, c.cols, a.col, b.col, c.col], [1, 1, 1, 0, 0, 0]);   // 맞닿기만 하면 겹침 아님
}
{
  // 같은 순위끼리는 시작 시각 → 제목 순, 빈 열은 다시 쓴다
  const a = B('cal', 540, 600, 'A'), b = B('cal', 570, 700, 'B'), c = B('cal', 610, 650, 'C');
  layoutColumns([a, b, c]);
  assert.equal(a.col, 0); assert.equal(b.col, 1); assert.equal(c.col, 0);   // C 는 A 가 끝난 뒤라 0열 재사용
  assert.ok([a, b, c].every((x) => x.cols === 2));
}
{ const z = B('cal', 600, 600, 'zero'); assert.doesNotThrow(() => layoutColumns([z])); }   // 길이 0 은 건너뜀

// ── 중복 정리: 출처가 다른 같은 일정(시작·끝·이름이 정확히 같음)만 한 칸으로. 합쳐진 원본은 also 로 남긴다 ──
{
  const mk = () => ({ cl: { k: 'class', s: 540, e: 630, title: '정역학 수업' }, ca: { k: 'cal', s: 540, e: 630, title: '정역학' }, wk: { k: 'work', s: 540, e: 630, title: '정역학' } });
  let { cl, ca, wk } = mk();
  assert.deepEqual(dedupeBlocks([wk, ca, cl]), [cl]);
  assert.deepEqual(cl.also.map((x) => x.k).sort(), ['cal', 'work']);                           // 원본 정보 유지
  ({ cl, ca, wk } = mk()); assert.deepEqual(dedupeBlocks([wk, ca]), [ca]); assert.deepEqual(ca.also, [wk]);   // 수업이 없는 날: 캘린더 우선
  ({ cl, ca, wk } = mk());
  const other = { k: 'cal', s: 540, e: 630, title: '치과' };
  assert.equal(dedupeBlocks([cl, other]).length, 2);                                           // 시각이 같아도 이름이 다르면 다른 일정
  assert.equal(dedupeBlocks([cl, { ...ca, e: 660 }]).length, 2);                               // 이름이 같아도 시각이 다르면 다른 일정
  assert.equal(dedupeBlocks([cl, { k: 'cal', s: 540, e: 630, title: '정역학 상담' }]).length, 2);   // 오타 지적: 「물리」 수업과 「물리 상담」 캘린더는 다른 일정(부분 일치로 합치지 않음)
  assert.equal(dedupeBlocks([{ k: 'cal', s: 540, e: 630, title: 'A', ev: { id: 1 } }, { k: 'cal', s: 540, e: 630, title: 'A', ev: { id: 2 } }]).length, 2);   // 같은 출처 두 개는 합치지 않음
  const pl = { k: 'plan', s: 540, e: 630, title: '정역학', plan: {} };
  assert.equal(dedupeBlocks([cl, pl]).length, 2);                                              // 계획은 건드리지 않음
  {   // 오타 2차 재현: 수업 + 같은 시각·이름의 캘린더 두 개 → 캘린더 한 개만 수업에 합치고 다른 하나는 별개로 남음
    const c1 = { k: 'class', s: 540, e: 630, title: '정역학 수업' }, a = { k: 'cal', s: 540, e: 630, title: '정역학', ev: { id: 'A' } }, b2 = { k: 'cal', s: 540, e: 630, title: '정역학', ev: { id: 'B' } };
    const out = dedupeBlocks([c1, a, b2]); assert.equal(out.length, 2); assert.equal(c1.also.length, 1); assert.ok(out.includes(b2) || out.includes(a));
    const again = dedupeBlocks([c1, a, b2]); assert.equal(again.length, 2); assert.equal(c1.also.length, 1, '같은 입력으로 두 번 불러도 also 가 안 늘어남');
  }
  assert.equal(dedupeBlocks([{ k: 'cal', s: 1, e: 2, title: '' }, { k: 'work', s: 1, e: 2, title: '' }]).length, 2);   // 이름 없으면 같다고 보지 않음
}
// ── 글자 대비 4.5:1 이상(지난 블록은 opacity .8 로 합성한 값까지) ──
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const blend = (c, alpha) => c.map((v) => v * alpha + 255 * (1 - alpha));   // 흰 바탕 위 opacity
for (const [name, [bg, fg]] of Object.entries(BLOCK_COLORS)) {
  const r = ratio(rgb(bg), rgb(fg)); assert.ok(r >= 4.5, `${name} ${r.toFixed(2)}`);
  const rp = ratio(blend(rgb(bg), PAST_OPACITY), blend(rgb(fg), PAST_OPACITY)); assert.ok(rp >= 4.5, `${name} 지난 블록 ${rp.toFixed(2)}`);
}
// ── 이동(대표님 10/12 「일정추가할 때 유형을 이동유형으로」) ──
{
  const pm = (extra) => plan({ note: '집 → 학교', ...extra });
  assert.equal(blockCat(pm({ state: 'confirmed', bk: '이동', activity: true })), '이동');        // 확정 이동
  assert.equal(blockCat(pm({ state: 'tentative', bk: '이동', activity: true })), '계획');         // 미확정 이동 = 점선 계획
  assert.equal(planBk({ bk: '이동', note: '과제 · x' }), '이동');
  assert.equal(CAT_CLASS['이동'], 'c-move'); assert.equal(CAT_NAME['이동'], '이동');
  // 캘린더에서 온 이동: 색 1 만. 제목 글자로는 추정하지 않는다
  assert.equal(isMoveEvent({ color: '1' }), true); assert.equal(isMoveEvent({ color: 1 }), true);
  assert.equal(isMoveEvent({ color: '10' }), false); assert.equal(isMoveEvent({ color: '' }), false); assert.equal(isMoveEvent(null), false);
  assert.equal(blockCat({ k: 'cal', ev: { color: '1', title: '🚇 이동: 집 → 학교' } }), '이동');
  assert.equal(blockCat({ k: 'cal', ev: { color: '9', title: '이동 수업 정리' } }), '고정');       // 제목만 「이동」이어도 색이 다르면 고정
  assert.equal(blockCat({ k: 'cal', ev: { title: '치과' } }), '고정');
  assert.equal(blockCat({ k: 'class', ev: { color: '1' } }), '고정');                              // 수업은 색을 안 본다
  assert.equal(moveName('집', '학교'), '집 → 학교'); assert.equal(moveName('집', ''), '집에서 출발'); assert.equal(moveName('', '학교'), '→ 학교'); assert.equal(moveName('', ''), ''); assert.equal(moveName(' 집 ', ' 학교 '), '집 → 학교');
  assert.deepEqual(MOVE_LENS, [5, 10, 15, 20, 30, 45, 60]);
  // 겹침 순위: 확정 이동 = 고정과 같은 순위(둘 다 공부·과제·계획보다 앞), 미확정 이동 = 계획
  const mv = B('plan', 540, 600, '집 → 학교', { state: 'confirmed', bk: '이동' }), fx = B('cal', 570, 630, '약속'), st = B('plan', 560, 620, '공부', { state: 'confirmed', bk: '공부' }), tm = B('plan', 580, 640, '이동계획', { state: 'tentative', bk: '이동' });
  layoutColumns([tm, st, fx, mv]);
  assert.ok(mv.col < st.col && fx.col < st.col && st.col < tm.col, `이동·고정이 공부보다 앞, 미확정 이동은 맨 뒤 (${mv.col},${fx.col},${st.col},${tm.col})`);
  assert.equal(mv.col, 0);   // 같은 순위는 시작 시각 순: 이동(540) 먼저
  // 중복 정리: 분류가 다르면 이름·시각이 같아도 합치지 않는다(이동이 수업 블록에 묻히지 않게)
  const cl = { k: 'class', s: 540, e: 600, title: '집 → 학교 수업' }, mc = { k: 'cal', s: 540, e: 600, title: '집 → 학교', ev: { color: '1' } };
  assert.equal(dedupeBlocks([cl, mc]).length, 2);
  const c1 = { k: 'cal', s: 540, e: 600, title: '집', ev: { color: '1' } }, c2 = { k: 'work', s: 540, e: 600, title: '집' };
  assert.equal(dedupeBlocks([c1, c2]).length, 2);
  assert.equal(dedupeBlocks([{ k: 'cal', s: 540, e: 600, title: '집', ev: {} }, c2]).length, 1);   // 분류가 같으면 합침(기존 동작)
  // 색이 겹치지 않는 모양 구분: 이동 CSS 는 이중선(위아래) — 다른 종류와 같은 모양이 아님
  assert.ok(BLOCK_COLORS['c-move'] && BLOCK_COLORS['tag-move'] && BLOCK_COLORS['small-move']);
}
console.log('plan-blocks ok');
