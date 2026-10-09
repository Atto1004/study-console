// 사회봉사는 다음 회차 것만(대표님 10/10) — 실제 tasks.json 모양 견본
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextRoundOnly, pendingDeadlines, roundOf } from '../../school/workspace.js';

const rows = [
  { id: 'sv-r2-card1', course: '사회봉사', title: '카드뉴스 2회차 ① 해피피플', due: '2026-10-04T23:59' },
  { id: 'sv-r2-report', course: '사회봉사', title: '2회차 결과보고서', due: '2026-10-04T23:59' },
  { id: 'sv-r3-cards', course: '사회봉사', title: '카드뉴스 3회차 게시 2건', due: '2026-10-18T23:59' },
  { id: 'sv-r4-cards', course: '사회봉사', title: '카드뉴스 4회차 게시', due: '2026-11-01T23:59' },
  { id: 'sv-ot', course: '사회봉사', title: '봉사 수칙 확인', due: '2026-10-20' },
  { id: 'hw5', course: '정역학', title: 'HW Ch.5', due: '2026-10-12T23:59' },
];
test('회차 번호 읽기', () => {
  assert.equal(roundOf(rows[0]), 2); assert.equal(roundOf({ title: '5회차 결과보고서' }), 5); assert.equal(roundOf(rows[4]), null);
});
test('지난 회차·다음다음 회차는 빼고 다음 회차만, 다른 과목·회차 없는 항목은 그대로', () => {
  const ids = nextRoundOnly(rows, '2026-10-10').map((r) => r.id);
  assert.deepEqual(ids, ['sv-r3-cards', 'sv-ot', 'hw5']);
});
test('3회차를 다 내면 4회차가 다음 회차', () => {
  const done = rows.map((r) => (r.id === 'sv-r3-cards' ? { ...r, submitted: true } : r));
  assert.deepEqual(pendingDeadlines(done, '2026-10-10').map((r) => r.id).sort(), ['hw5', 'sv-ot', 'sv-r4-cards'].sort());
});
test('홈·과제실 공통 함수에서도 다음 회차만', () => {
  assert.deepEqual(pendingDeadlines(rows, '2026-10-10').map((r) => r.id).sort(), ['hw5', 'sv-ot', 'sv-r3-cards'].sort());
});
