# -*- coding: utf-8 -*-
"""statics_ahead.py(정역학 Ch.4 수업분 + Ch.5 교재 선행) 문제 답 검산 — numpy 로 외적·삼중적·평형 방정식을 다시 풀어 본문 값과 대조. 어긋나면 exit 1."""
import sys, math
import numpy as np
bad = []
def ok(name, got, want, tol=1e-6):
    g, w = np.array(got, float), np.array(want, float)
    if g.shape != w.shape or not np.allclose(g, w, atol=tol, rtol=1e-3):
        bad.append(f"{name}: 계산 {np.round(g, 4).tolist()} ≠ 본문 {w.tolist()}")
X = lambda a, b: np.cross(np.array(a, float), np.array(b, float))

# 파트 1 (9/21) — 점 모멘트
ok("1 세 블록", 3, 3)
ok("1 DF", 20 * 0.5, 10)
ok("1 r×F", X([3, 1, 0], [0, 10, 0]), [0, 0, 30])
# 응용: F = 50 N, 수평에서 30° 위(오른쪽 위), 작용점 (2, 1) m → M_O = xF_y − yF_x
Fx, Fy = 50 * math.cos(math.radians(30)), 50 * math.sin(math.radians(30))
ok("1 성분 모멘트", 2 * Fy - 1 * Fx, 50 - 25 * math.sqrt(3))
ok("1 성분 모멘트 값", 2 * Fy - 1 * Fx, 6.70, 0.01)
ok("1 r×F 성분", X([2, 1, 0], [Fx, Fy, 0])[2], 2 * Fy - Fx)
# 응용: 두 블록 변형 — 위 블록 3W? (위 5 kg, 아래 3 kg, g=9.81): T_아래 = 29.43, T_위 = 78.48
ok("1 두 블록 아래", 3 * 9.81, 29.43, 0.01); ok("1 두 블록 위", 8 * 9.81, 78.48, 0.01)

# 파트 2 (9/23) — 바리뇽 · 직선 모멘트
r, F = [4, 1, 0], [2, 3, 5]
M = X(r, F); ok("2 M_O", M, [5, -20, 10]); ok("2 M_z", M[2], 10)
ok("2 aFy-bFx", 4 * 3 - 1 * 2, 10)
A, B, C, F2 = np.array([0, 0, 0.]), np.array([2, 1, 2.]), np.array([3, 0, 0.]), np.array([0, 30, 0.])
e = (B - A) / np.linalg.norm(B - A); ok("2 |AB|", np.linalg.norm(B - A), 3)
s = np.linalg.det(np.array([e, C - A, F2])); ok("2 삼중적", s, 60); ok("2 M_L", s * e, [40, 20, 40])
# 점 선택 무관: B 에서 재도 같다
s2 = np.linalg.det(np.array([e, C - B, F2])); ok("2 점 무관", s2, 60)
# 바리뇽: 한 점에 모인 두 힘
F_1, F_2, rq = np.array([3, 0, 0.]), np.array([0, 4, 0.]), np.array([2, 5, 0.])
ok("2 바리뇽", X(rq, F_1) + X(rq, F_2), X(rq, F_1 + F_2))

# 파트 3 (9/28) — 우력 · 힘 옮기기 · 렌치
ok("3 우력 r×F", X([6, 1, 0], [0, 3, 0]) + X([2, 5, 0], [0, -3, 0]), [0, 0, 12]); ok("3 우력 DF", 4 * 3, 12)
P = np.array([7, 7, 0.]); ok("3 우력 다른 점", X(np.array([6, 1, 0]) - P, [0, 3, 0]) + X(np.array([2, 5, 0]) - P, [0, -3, 0]), [0, 0, 12])
ok("3 옮기기", X([3, 0, 0], [0, 20, 0]), [0, 0, 60])
Fw, Mw = np.array([0, 10, 0.]), np.array([3, 4, 0.])
eF = Fw / np.linalg.norm(Fw); Mp = (eF @ Mw) * eF; Mn = Mw - Mp
ok("3 M_p", Mp, [0, 4, 0]); ok("3 M_n", Mn, [3, 0, 0])
rPQ = X(Fw, Mn) / (Fw @ Fw); ok("3 r_PQ", rPQ, [0, 0, -0.3]); ok("3 r×F=M_n", X(rPQ, Fw), Mn)
# 등가계 응용: 두 힘 (O에 10j, (4,0)에 -6j) → O 기준 힘 4j, 모멘트 4i×(-6j) = -24k
ok("3 등가 힘", [0, 10 - 6, 0], [0, 4, 0]); ok("3 등가 모멘트", X([4, 0, 0], [0, -6, 0]), [0, 0, -24])
# 한 힘으로: 4j 가 x = d 에서 같은 모멘트 → d·4 = -24 → d = -6
ok("3 한 힘 위치", -24 / 4, -6)

# 파트 4 (Ch.5 2D) — 단순보·외팔보·경사 롤러
# 단순보: 길이 6 m, A(핀) B(롤러), A 에서 2 m 에 12 kN ↓ → By·6 = 12·2 → By = 4, Ay = 8, Ax = 0
ok("4 단순보 By", 12 * 2 / 6, 4); ok("4 단순보 Ay", 12 - 4, 8)
# 외팔보: 길이 3 m 끝에 5 kN ↓ → Ay = 5, M_A = 15 (반시계 +)
ok("4 외팔보 M_A", 5 * 3, 15)
# 우력 받는 단순보: 길이 4 m, 가운데 시계 방향 우력 20 kN·m → ΣM_A: By·4 − 20 = 0 → By = 5, Ay = −5
ok("4 우력 By", 20 / 4, 5); ok("4 우력 Ay", -5, -5)
# 응용: 단순보 5 m, A 에서 1 m 에 10 kN ↓, 4 m 에 6 kN ↓, 끝 B 롤러 → By·5 = 10·1 + 6·4 → By = 6.8, Ay = 9.2
ok("4 응용 By", (10 * 1 + 6 * 4) / 5, 6.8); ok("4 응용 Ay", 16 - 6.8, 9.2)
# 응용: 외팔보 2 m, 끝에 수평에서 아래 30° 로 오른쪽 아래 8 kN → Ax = −8cos30 (왼쪽) … 힘 성분 (8cos30, −8sin30)
fx, fy = 8 * math.cos(math.radians(30)), -8 * math.sin(math.radians(30))
Ax, Ay = -fx, -fy; MA = -(2 * fy)   # ΣM_A = M_A + (2 i × (fx, fy)) = M_A + 2 fy = 0
ok("4 외팔보 경사 Ax", Ax, -4 * math.sqrt(3)); ok("4 외팔보 경사 Ay", Ay, 4); ok("4 외팔보 경사 M_A", MA, 8)

# 파트 5 (Ch.5 부정정 · 2력) — 버팀대
# 수평보 AB 길이 4 m, A 핀, B 에서 45° 버팀대 BC(2력 부재, C 는 A 아래 벽), 보 가운데(2 m) 에 10 kN ↓
# ΣM_A: F_BC 의 수직 성분 × 4 = 10 × 2 → F_y = 5 → F_BC = 5√2(압축, 보를 위·왼쪽으로 민다), 수평 성분 5
FBC = 5 * math.sqrt(2); ok("5 버팀대 힘", FBC, 7.071, 1e-3)
# C 는 A 바로 아래 4 m 벽의 핀 → 버팀대 방향 C→B = (4, 4)/4√2. 압축이라 B 에서 보를 C→B 방향(오른쪽 위)으로 민다: (5, 5) kN
Fb = FBC * np.array([1, 1]) / math.sqrt(2); ok("5 버팀대가 보에 주는 힘", Fb, [5, 5])
# 보 평형: A + Fb + (0, −10) = 0 → A = (−5, 5): 왼쪽 5 kN, 위 5 kN
Arx, Ary = -Fb[0], 10 - Fb[1]; ok("5 A 반력", [Arx, Ary], [-5, 5])
ok("5 ΣM_A", 4 * Fb[1] - 2 * 10, 0)
# 부정정 차수: 핀 2개(4 미지수) − 3 = 1
ok("5 부정정 차수", 4 - 3, 1)

# 파트 6 (Ch.5 3D) — 세 점에서 받친 판
# 판 꼭짓점 A(0,0) B(3,0) C(0,2) m, 수직 반력, 600 N 이 (1,1) → ΣMx: 2C − 600·1 = 0, ΣMy: 3B − 600·1 = 0
Cc = 600 * 1 / 2; Bb = 600 * 1 / 3; Aa = 600 - Bb - Cc
ok("6 판 반력", [Aa, Bb, Cc], [100, 200, 300])
# 3D 검산: Σ r × F = 0
Mtot = X([0, 0, 0], [0, 0, Aa]) + X([3, 0, 0], [0, 0, Bb]) + X([0, 2, 0], [0, 0, Cc]) + X([1, 1, 0], [0, 0, -600])
ok("6 판 모멘트 0", Mtot, [0, 0, 0])
ok("6 미지수", 6, 6)

if bad:
    print("검산 불일치", len(bad)); [print(" ", b) for b in bad]; sys.exit(1)
print("검산 통과 — 모든 값 일치")
