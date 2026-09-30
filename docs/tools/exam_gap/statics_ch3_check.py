# -*- coding: utf-8 -*-
"""정역학 · 중간고사 대비 3 (Ch.3 입자 평형 문제 풀이) — 덱 statics-mid3 의 모든 답 검산(numpy). 생성기 statics_ch3.py 의 숫자와 맞춰 본다.
실행: python statics_ch3_check.py  → 문제마다 값 출력, 어긋나면 AssertionError"""
import math
import numpy as np

g = 9.81
D = math.radians
ok = lambda a, b, tol=0.06: abs(a - b) <= tol

def solve(cols, rhs):
    """cols = 미지수마다 단위벡터(열), rhs = 알짜 외력의 반대 → 장력"""
    return np.linalg.solve(np.array(cols, float).T, np.array(rhs, float))

def unit(p, q):
    v = np.array(q, float) - np.array(p, float)
    return v / np.linalg.norm(v), np.linalg.norm(v)

print("== 파트 1 · 2D 두 줄")
# 기초 1-1: T = 200 N, 수평에서 위로 30°
tx, ty = 200 * math.cos(D(30)), 200 * math.sin(D(30))
print("1-1 성분", round(tx, 1), round(ty, 1)); assert ok(tx, 173.2) and ok(ty, 100.0)
print("   오답 보기(나누기 실수)", round(200 / math.cos(D(30)), 1), round(200 / math.sin(D(30)), 1))
# 기초 1-2: 대칭 두 줄 T = W/(2 sin θ) — θ 가 작아지면 커진다
for th in (60, 30, 10): print("1-2 θ=%d° → T/W = %.3f" % (th, 1 / (2 * math.sin(D(th)))))
# 기초 1-4: 50 N, 방향 (4,3)/5
print("1-4", 50 * 4 / 5, 50 * 3 / 5); assert (50 * 4 / 5, 50 * 3 / 5) == (40, 30)
# 기초 1-5: 3-4-5 직각이면 쉽게 — 여기서는 없음
# 응용 1-1: 50 kg, BA 수평에서 50°(왼쪽 위), BC 30°(오른쪽 위)
W = 50 * g
T = solve([[-math.cos(D(50)), math.sin(D(50))], [math.cos(D(30)), math.sin(D(30))]], [0, W])
print("응용 1-1 W=%.1f T_BA=%.2f T_BC=%.2f" % (W, T[0], T[1])); assert ok(T[0], 431.3) and ok(T[1], 320.2)
assert ok(T[0], W * math.cos(D(30)) / math.sin(D(80))) and ok(T[1], W * math.cos(D(50)) / math.sin(D(80)))
# 응용 1-2: AC 1.3, AB 0.5, BC 1.2 (5-12-13 → B 직각), 20 kg
A, C = (0, 0), (1.3, 0)
ca = (0.5**2 + 1.3**2 - 1.2**2) / (2 * 0.5 * 1.3)          # A 각의 cos
B = (0.5 * ca, -0.5 * math.sqrt(1 - ca**2))
eBA, lBA = unit(B, A); eBC, lBC = unit(B, C)
assert ok(lBA, 0.5, 1e-9) and ok(lBC, 1.2, 1e-9)
W = 20 * g
T = solve([eBA, eBC], [0, W])
print("응용 1-2 B=(%.4f,%.4f) e_BA=%s e_BC=%s T_AB=%.2f T_BC=%.2f" % (B[0], B[1], np.round(eBA, 4), np.round(eBC, 4), T[0], T[1]))
assert ok(T[0], 181.1) and ok(T[1], 75.5) and ok(T[0], W * 12 / 13) and ok(T[1], W * 5 / 13)
print("   각: AB 는 수평에서 %.2f°, BC 는 %.2f°" % (math.degrees(math.acos(ca)), math.degrees(math.acos(1.2 / 1.3))))

print("== 파트 2 · 경사면·도르래")
# 응용 2-1: 80 kg, 40°, 줄은 경사면과 평행
W = 80 * g
print("응용 2-1 W=%.1f T=%.2f N=%.2f" % (W, W * math.sin(D(40)), W * math.cos(D(40))))
assert ok(W * math.sin(D(40)), 504.5) and ok(W * math.cos(D(40)), 601.2)
# 응용 2-2: 20 kg, 30°, 수평으로 미는 힘 F
W = 20 * g
F = W * math.tan(D(30)); Nn = W * math.cos(D(30)) + F * math.sin(D(30))
print("응용 2-2 W=%.1f F=%.2f N=%.2f (수평·연직 축 검산 N=W/cos30=%.2f)" % (W, F, Nn, W / math.cos(D(30))))
assert ok(F, 113.3) and ok(Nn, 226.6) and ok(Nn, W / math.cos(D(30)), 1e-9)
# 경사면 축 성분 확인: 경사면 방향(위 +) F cos30 - W sin30 = 0
assert abs(F * math.cos(D(30)) - W * math.sin(D(30))) < 1e-9
# 응용 2-3: 60 kg, 움직도르래 두 가닥 → T = W/2, 고정 도르래 지지 = 2T (두 가닥 모두 연직 아래)
W = 60 * g; T = W / 2
print("응용 2-3 W=%.1f T=%.2f 고정 도르래 지지=%.2f 천장 고정점=%.2f" % (W, T, 2 * T, T))
assert ok(T, 294.3) and ok(2 * T, 588.6)
# 기초 2-5: 두 가닥 100 N 연직 아래 → 200 N 위

print("== 파트 3 · 스프링·링크")
# 기초 3-1: k 800, L0 0.30, L 0.24 → 48 N 민다
print("3-1", 800 * abs(0.24 - 0.30)); assert ok(800 * abs(0.24 - 0.30), 48, 1e-9)
# 기초 3-2: 5,7,8 → 7 의 맞은편 각
c7 = (25 + 64 - 49) / (2 * 5 * 8); print("3-2 cos=%.3f 각=%.1f°" % (c7, math.degrees(math.acos(c7)))); assert ok(math.degrees(math.acos(c7)), 60, 1e-9)
# 기초 3-3: P(1,2) → Q(4,6)
e, L = unit((1, 2), (4, 6)); print("3-3", e, L); assert np.allclose(e, (0.6, 0.8))
# 기초 3-5: 150 N, k 3000, L 0.35 → L0 = 0.30
print("3-5 L0 =", 0.35 - 150 / 3000); assert ok(0.35 - 150 / 3000, 0.30, 1e-9)
# 응용 3-1: 줄 AB 0.6, 스프링 CB 0.5(자연 0.4), AC 0.8, 30 kg → k
ca = (0.6**2 + 0.8**2 - 0.5**2) / (2 * 0.6 * 0.8); cc = (0.5**2 + 0.8**2 - 0.6**2) / (2 * 0.5 * 0.8)
al, ga = math.degrees(math.acos(ca)), math.degrees(math.acos(cc))
A, C = (0, 0), (0.8, 0); B = (0.6 * ca, -0.6 * math.sqrt(1 - ca**2))
eBA, lBA = unit(B, A); eBC, lBC = unit(B, C); assert ok(lBC, 0.5, 1e-9)
W = 30 * g
T = solve([eBA, eBC], [0, W])
k = T[1] / (0.5 - 0.4)
print("응용 3-1 cosα=%.5f α=%.2f° cosγ=%.4f γ=%.2f° sinα=%.4f sinγ=%.4f T=%.2f F=%.2f k=%.1f" % (ca, al, cc, ga, math.sqrt(1 - ca**2), math.sqrt(1 - cc**2), T[0], T[1], k))
assert ok(al, 38.62) and ok(ga, 48.51) and ok(T[0], 195.2) and ok(T[1], 230.2) and ok(k, 2302, 1.5)
# 응용 3-2: C(0,0.6) 에 6 kN(B(0.8,0)→C 방향) + 링크 AC(A(0,0)) + 링크 CD(D(1.2,1.1))
eB, _ = unit((0.8, 0), (0, 0.6)); FB = 6 * eB
eAC, _ = unit((0, 0), (0, 0.6)); eCD, lCD = unit((0, 0.6), (1.2, 1.1))
S = solve([eAC, eCD], -FB)
print("응용 3-2 F_B=%s e_CD=%s |CD|=%.2f F_AC=%.3f F_CD=%.3f" % (np.round(FB, 3), np.round(eCD, 4), lCD, S[0], S[1]))
assert np.allclose(FB, (-4.8, 3.6)) and ok(S[0], -5.6, 1e-9) and ok(S[1], 5.2, 1e-9)

print("== 파트 4 · 3D")
# 기초 4-1: A(0,-2,0) → B(2,0,1)
e, L = unit((0, -2, 0), (2, 0, 1)); print("4-1", np.round(e, 4), L); assert ok(L, 3, 1e-9)
# 기초 4-2: 150 × (2/3,2/3,1/3)
print("4-2", 150 * e)
# 응용 4-1: A(0,-6,0) · B(8,0,0) · C(-3,0,2) · D(-2,0,-3), 100 kg, y 위
A = (0, -6, 0); P = {"B": (8, 0, 0), "C": (-3, 0, 2), "D": (-2, 0, -3)}
E = {};
for n, q in P.items():
    E[n], L = unit(A, q); print("  r_A%s = %s |r| = %.3f e = %s" % (n, np.array(q) - np.array(A), L, np.round(E[n], 4)))
W = 100 * g
T = solve([E["B"], E["C"], E["D"]], [0, W, 0])
print("응용 4-1 T_AB=%.2f T_AC=%.2f T_AD=%.2f" % tuple(T))
assert ok(T[0], 401.0) and ok(T[1], 518.3) and ok(T[2], 345.5)
# 손풀이 순서: z 식 → T_AC = 1.5 T_AD, x 식 → T_AB = (6.5/5.6) T_AD
assert ok(T[1], 1.5 * T[2], 1e-6) and ok(T[0], 6.5 / 5.6 * T[2], 1e-6)
print("   T_AD = W / %.6f" % (0.6 * 6.5 / 5.6 + 6 / 7 * 2.5))
# 응용 4-2: A(0,1,0) · B(-1,3,2) · C(2,3,-1) · D(-2,3,-1), 40 kg
A = (0, 1, 0); P = {"B": (-1, 3, 2), "C": (2, 3, -1), "D": (-2, 3, -1)}
for n, q in P.items():
    E[n], L = unit(A, q); print("  r_A%s = %s |r| = %.3f" % (n, np.array(q) - np.array(A), L))
W = 40 * g
T = solve([E["B"], E["C"], E["D"]], [0, W, 0])
print("응용 4-2 W=%.1f T_AB=%.2f T_AC=%.2f T_AD=%.2f" % (W, *T))
assert ok(T[0], 196.2) and ok(T[1], 245.25, 0.01) and ok(T[2], 147.15, 0.01)
assert ok(T[0], W / 2, 1e-6) and ok(T[1] + T[2], 2 * T[0], 1e-6) and ok(T[1] - T[2], T[0] / 2, 1e-6)
print("검산 전부 통과")
