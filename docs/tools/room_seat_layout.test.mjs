// 착석 교실 배치 계산 검사(오타 검수 10/9 RED: 낮은 무대에서 칠판 축소·배경 빈 곳) — 화면 크기 × 무대 높이 × 대사창 보임/숨김 전부:
//  무대 높이 = max(주어진 높이, minStageH) 로 두고 ① 배경이 무대를 다 덮음 ② 칠판 폭 ≥ 55%(폰·세로는 ≥ 90%) ③ 칠판이 대사창 위
//  ④ 스앵님이 칠판 글씨 칸(오른쪽 여백 안쪽)을 안 가림
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layoutSeat, minStageH } from '../../school/room-seat.js';

test('착석 교실 배치: 크기·높이·대사창 조합 전부', () => {
  const bad = [];
  for (const W of [360, 390, 600, 700, 800, 1010, 1194, 1400, 1800]) for (const H0 of [120, 240, 300, 400, 520, 660, 820, 1018, 1300]) for (const vh of [0, 104, 150]) {
    const hid = vh === 0, H = Math.max(H0, minStageH(W, vh, hid)), L = layoutSeat(W, H, vh, hid), f = L.f, b = L.board, t = L.teacher;
    const tag = `${W}x${H}(${H0}) vn=${vh}`;
    if (f.ox > 0.5 || f.oy > 0.5 || f.ox + f.bw < W - 0.5 || f.oy + f.bh < H - 0.5) bad.push(`${tag} 배경 빈 곳 ${JSON.stringify({ ox: f.ox, oy: f.oy, bw: f.bw, bh: f.bh })}`);
    const need = L.narrow ? 0.9 : 0.55;
    if (b.w / W < need) bad.push(`${tag} 칠판 폭 ${(b.w / W).toFixed(2)}`);
    if (b.x < -0.5 || b.x + b.w > W + 0.5 || b.y < -0.5) bad.push(`${tag} 칠판이 무대 밖`);
    if (!hid && b.y + b.h > H - (vh + L.vn.b) + 0.5) bad.push(`${tag} 칠판이 대사창에 걸림`);
    if (t.w && t.y < b.y + b.h && t.x < b.x + b.w - L.padRight - 0.5) bad.push(`${tag} 스앵님이 글씨 칸 가림`);
    if (t.w && Math.abs(t.y + t.h - H) > 0.5) bad.push(`${tag} 스앵님이 바닥에 안 붙음(공중) ${Math.round(H - t.y - t.h)}px`);   // 10/9 「공중에 안 뜨고」
  }
  assert.deepEqual(bad.slice(0, 12), []);
});
