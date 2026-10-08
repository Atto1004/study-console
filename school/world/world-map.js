// 공용 지도(3D 세계 설계 v2 계약 A·F, 2단계). 지금은 학교 복도 남쪽(+z)에 대표실로 가는 연결 복도와 대표실 문을 붙인다.
// 대표실 방 자체는 4단계(대표실 페이지 3D)에서 같은 모듈로 짓는다. 이 모듈은 구조물·출발점·경계·상호작용 대상만 만들고
// 수업·대표실 API 는 부르지 않는다.
//
// 좌표: 카메라 yaw 0 = -z(학교 쪽)를 본다. 학교 복도는 z 1.7 ~ -33.6, 연결 복도는 z 1.7 ~ 9, 대표실 문은 z 9.
export const HALL = { from: 1.7, to: 9, half: 2.4 };
// 출발점: 위치·바라보는 방향. 모르는 값이면 corridor.
export const SPAWNS = {
  corridor: { x: 0, z: 1, yaw: 0 },
  // 대표실에서 들어오면 문(전환 영역)에서 2.5m 떨어진 곳에서 학교를 본다 — 들어오자마자 되돌아가지 않게
  gate: { x: 0, z: 6.2, yaw: 0 },
};
export const spawnOf = (name) => SPAWNS[name] || SPAWNS.corridor;
// 걸을 수 있는 큰 경계(벽 충돌은 colliders 가 따로 막는다)
export const BOUNDS = { minX: -2.05, maxX: 10.9, minZ: -33.6, maxZ: HALL.to - 0.35 };
// 대표실 문 앞 전환 영역. 출발 뒤 1m 이상 걸어야 켜진다(계약 A).
// 연결 복도 끝은 대표실 문뿐이라 복도 폭 전체가 전환 영역(문 옆 벽으로 걸어가도 들어간다).
export const GATE = { minX: -(HALL.half - 0.3), maxX: HALL.half - 0.3, minZ: HALL.to - 0.9, armAfter: 1 };
export const inGate = (x, z) => x > GATE.minX && x < GATE.maxX && z > GATE.minZ;

export function buildHallway({ T, box, sign, targets, colliders }) {
  const len = HALL.to - HALL.from, mid = (HALL.to + HALL.from) / 2;
  box(4.8, 0.12, len, 0, -0.06, mid, 0xbfb196);                 // 바닥(학교 복도보다 조금 진하게 — 다른 구역)
  box(4.8, 0.12, len, 0, 3.45, mid, 0xf4efe3);                  // 천장
  box(0.18, 3.4, len, -HALL.half, 1.7, mid, 0xe2ddd0, true);     // 양쪽 벽
  box(0.18, 3.4, len, HALL.half, 1.7, mid, 0xe2ddd0, true);
  // 학교 복도 첫 교실 벽(z 1.0)과 연결 복도 사이 틈(z 1.0~1.7)을 막는 이음 벽 — 전에는 밖이 보이고 빠져나갈 수 있었다
  box(0.18, 3.4, 1.4, HALL.half, 1.7, HALL.from - 0.1, 0xe2ddd0, true);
  // 대표실 문 — 짙은 초록 문(브랜드 #21745a 계열) + 표지판
  box(4.8, 3.4, 0.2, 0, 1.7, HALL.to + 0.1, 0xd9d2c1, true);
  const door = box(1.6, 2.5, 0.12, 0, 1.25, HALL.to - 0.02, 0x21745a);
  door.userData = { kind: 'gate', to: 'office', label: '대표실' };
  targets.push(door);
  sign('GREEN LIGHT 대표실', 2.6, 0.5, 0, 2.85, HALL.to - 0.04, Math.PI, '#183d31');
  for (let z = HALL.from + 1.6; z < HALL.to; z += 3) box(1.8, 0.03, 0.7, 0, 3.35, z, 0xfff6d8);   // 천장 등
  return { door };
}
