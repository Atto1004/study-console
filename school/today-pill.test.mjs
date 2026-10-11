// 시간표 주 막대에서 오늘이면서 선택된 날의 날짜 숫자가 배경과 같은 초록이라 안 보이던 문제(10/12)
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('./plan.js', import.meta.url), 'utf8');

// 선택됨(.on)의 날짜 숫자 색을 .today 규칙보다 뒤에서 흰색으로 덮는다
test('선택된 오늘 날짜 숫자는 배경(#2e6b52)과 다른 흰색', () => {
  const todayB = css.indexOf('.pl-sday.today b{color:#2e6b52}');
  const onB = css.indexOf('.pl-sday.on.today b{color:#fff}');
  assert.ok(todayB >= 0, '오늘 숫자 규칙');
  assert.ok(onB > todayB, '선택 규칙이 오늘 규칙보다 뒤에 있어야 이긴다');
  assert.ok(css.includes('.pl-sday.on b,'), '선택된 날 숫자 규칙');
  assert.ok(css.includes('.pl-sday.on{background:#2e6b52'), '선택 배경');
});
