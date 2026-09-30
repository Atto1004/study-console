# -*- coding: utf-8 -*-
"""calc2_ahead.py(미적2 12.4 외적 계산·12.5 직선(9/29 수업) + 12.5 평면·12.6·13.1·13.2 교재 선행) 문제 답 검산 — sympy. 어긋나면 exit 1."""
import sys
import sympy as sp
bad = []
def eq(name, got, want):
    if sp.simplify(sp.Matrix(got) - sp.Matrix(want)) != sp.zeros(*sp.Matrix(want).shape) if isinstance(want, (list, tuple, sp.Matrix)) else sp.simplify(got - want) != 0:
        bad.append(f"{name}: 계산 {got} ≠ 본문 {want}")
V = lambda *a: sp.Matrix(a)
cross = lambda a, b: a.cross(b)

# 파트 1 — 외적
eq("1 a×b", cross(V(2, 1, 0), V(1, 3, 2)), [2, -4, 5])
eq("1 j 부호", cross(V(1, 2, 3), V(4, 5, 6)), [-3, 6, -3])
eq("1 넓이", cross(V(3, 0, 0), V(1, 2, 0)).norm(), 6)
PQ, PR = V(-1, 2, 0), V(-1, 0, 3)
n = cross(PQ, PR); eq("1 PQ×PR", n, [6, 3, 2]); eq("1 |n|", n.norm(), 7)
a, b = V(1, -1, 2), V(3, 0, 1); c = cross(a, b)
eq("1 수직벡터", c, [-1, 5, 3]); eq("1 a·c", a.dot(c), 0); eq("1 b·c", b.dot(c), 0); eq("1 |c|", c.norm(), sp.sqrt(35))
eq("1 교수 Ex01 확인", cross(V(1, 3, 4), V(2, 7, -5)), [-43, 13, 1])

# 파트 2 — 직선
P0 = V(2, -1, 2); eq("2 |OP0|", P0.norm(), 3)
A, B = V(1, 0, 2), V(3, 4, 1); eq("2 방향", B - A, [2, 4, -1])
A, B = V(1, 3, -2), V(2, 1, 2); v = B - A; eq("2 v", v, [1, -2, 4])
t = sp.Rational(1, 2); eq("2 xy평면 교점", A + t * v, [sp.Rational(3, 2), 2, 0])
# 꼬인 위치: L1 = (1,0,3)+t(2,1,-1), L2 = (0,2,1)+s(1,1,2)
tt, ss = sp.symbols("t s")
sol = sp.solve([1 + 2 * tt - ss, tt - (2 + ss)], [tt, ss]); eq("2 꼬인 t", sol[tt], -3); eq("2 꼬인 s", sol[ss], -5)
if sp.simplify((3 - sol[tt]) - (1 + 2 * sol[ss])) == 0: bad.append("2 꼬인 — 셋째 식도 맞음(교차)")
if cross(V(2, 1, -1), V(1, 1, 2)) == sp.zeros(3, 1): bad.append("2 꼬인 — 평행")

# 파트 3 — 평면
x, y, z = sp.symbols("x y z")
pl = 2 * (x - 1) + (y + 2) - (z - 3); eq("3 평면 전개", sp.expand(pl), 2 * x + y - z + 3)
eq("3 점-평면 거리", sp.Abs(2 * 1 - 2 + 2 * 3 - 10) / 3, sp.Rational(4, 3))
pl3 = 6 * (x - 1) + 3 * y + 2 * z
for p in ((1, 0, 0), (0, 2, 0), (0, 0, 3)):
    eq("3 세 점 평면 " + str(p), pl3.subs({x: p[0], y: p[1], z: p[2]}), 0)
n1, n2 = V(1, 1, 1), V(1, -1, 2)
eq("3 cos", n1.dot(n2) / (n1.norm() * n2.norm()), sp.sqrt(2) / 3)
d = cross(n1, n2); eq("3 교선 방향", d, [3, -1, -2])
pt = V(sp.Rational(3, 2), sp.Rational(1, 2), 0); eq("3 교선 점1", n1.dot(pt), 2); eq("3 교선 점2", n2.dot(pt), 1)
T = sp.Rational(3, 4); pt = V(1 + T, 2 - T, 3 * T); eq("3 직선-평면 교점", 2 * pt[0] + pt[1] + pt[2], 7); eq("3 교점 좌표", pt, [sp.Rational(7, 4), sp.Rational(5, 4), sp.Rational(9, 4)])

# 파트 4 — 이차곡면 자취: z = 4x²+y², z=4 → x² + y²/4 = 1
eq("4 자취", sp.expand((4 * x**2 + y**2 - 4) / 4), x**2 + y**2 / 4 - 1)

# 파트 5 — 벡터함수
tq = sp.symbols("t", real=True)
eq("5 극한", sp.Matrix([sp.limit(sp.cos(tq), tq, 0), sp.limit((sp.exp(tq) - 1) / tq, tq, 0), sp.limit(tq**2 + 2, tq, 0)]), [1, 1, 2])
r0, r1 = V(1, 3, -2), V(2, -1, 3); eq("5 선분", (1 - tq) * r0 + tq * r1, [1 + tq, 3 - 4 * tq, -2 + 5 * tq])
cur = V(2 * sp.cos(tq), 2 * sp.sin(tq), 1 + 2 * sp.cos(tq))
eq("5 교선 원기둥", cur[0]**2 + cur[1]**2, 4); eq("5 교선 평면", cur[2] - (1 + cur[0]), 0)

# 파트 6 — 미분·적분
r = V(tq**3, sp.exp(2 * tq), sp.sin(3 * tq)); eq("6 r'", r.diff(tq), [3 * tq**2, 2 * sp.exp(2 * tq), 3 * sp.cos(3 * tq)])
r = V(1 + tq, 2 * tq, tq**2); rp = r.diff(tq).subs(tq, 0); eq("6 T(0)", rp / rp.norm(), [1 / sp.sqrt(5), 2 / sp.sqrt(5), 0])
eq("6 적분", sp.Matrix([sp.integrate(f, (tq, 0, 1)) for f in (2 * tq, 3 * tq**2, 1)]), [1, 1, 1])
r = V(2 * sp.cos(tq), sp.sin(tq), tq); eq("6 접선 점", r.subs(tq, sp.pi / 2), [0, 1, sp.pi / 2]); eq("6 접선 방향", r.diff(tq).subs(tq, sp.pi / 2), [-2, 0, 1])
R = V(tq**2 + 1, tq**3, tq**4 - 1); eq("6 역도함수", R.diff(tq), [2 * tq, 3 * tq**2, 4 * tq**3]); eq("6 초기", R.subs(tq, 0), [1, 0, -1])

if bad:
    print("검산 불일치", len(bad)); [print(" ", b) for b in bad]; sys.exit(1)
print("검산 통과 — 모든 값 일치")
