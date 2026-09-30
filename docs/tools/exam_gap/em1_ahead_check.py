# -*- coding: utf-8 -*-
"""em1_ahead.py(공업수학1 2.4·2.7~2.10·3장 교재 선행) 문제 답 검산 — sympy 로 해를 원식에 직접 대입하고 초기조건을 확인한다. 하나라도 어긋나면 exit 1."""
import sys
import sympy as sp
x, t = sp.symbols("x t", real=True)
C1, C2, C3, C4 = sp.symbols("c1 c2 c3 c4")
bad = []
def chk(name, ode_lhs_minus_rhs, y, var, ics=None):
    """ode(y) 가 0 이 되는지 + 초기조건"""
    r = sp.simplify(ode_lhs_minus_rhs(y))
    if r != 0: bad.append(f"{name}: 대입 결과 {r} ≠ 0")
    for (k, x0, val) in (ics or []):
        got = sp.simplify(sp.diff(y, var, k).subs(var, x0) - val)
        if got != 0: bad.append(f"{name}: y^({k})({x0}) 불일치 {got}")
def D(y, n=1, v=x): return sp.diff(y, v, n)

# ---- 2.4 자유진동 ----
# 응용: m=2, k=8, c=0, y(0)=0.1, y'(0)=0.4 → ω0=2, y = 0.1cos2t + 0.2 sin2t, 진폭 √0.05
y = sp.Rational(1, 10) * sp.cos(2 * t) + sp.Rational(1, 5) * sp.sin(2 * t)
chk("2.4 비감쇠", lambda y: 2 * D(y, 2, t) + 8 * y, y, t, [(0, 0, sp.Rational(1, 10)), (1, 0, sp.Rational(2, 5))])
if sp.simplify(sp.sqrt(sp.Rational(1, 100) + sp.Rational(1, 25)) - sp.sqrt(5) / 10) != 0: bad.append("2.4 진폭")
# 감쇠 판별: m=1, k=4 → c=4 임계, c=5 과감쇠, c=2 저감쇠
for c, kind in ((4, "임계"), (5, "과"), (2, "저")):
    disc = c * c - 4 * 1 * 4
    want = {"임계": 0, "과": 1, "저": -1}[kind]
    if (disc > 0) - (disc < 0) != want: bad.append(f"2.4 판별 {c}")
# 임계감쇠 응용: y'' + 4y' + 4y = 0, y(0)=1, y'(0)=0 → (1+2t)e^{-2t}
y = (1 + 2 * t) * sp.exp(-2 * t)
chk("2.4 임계 IVP", lambda y: D(y, 2, t) + 4 * D(y, 1, t) + 4 * y, y, t, [(0, 0, 1), (1, 0, 0)])
# 저감쇠: y'' + 2y' + 5y = 0 → e^{-t}(A cos2t + B sin2t), ω* = 2
y = sp.exp(-t) * (C1 * sp.cos(2 * t) + C2 * sp.sin(2 * t))
chk("2.4 저감쇠", lambda y: D(y, 2, t) + 2 * D(y, 1, t) + 5 * y, y, t)

# ---- 2.7 미정계수법 ----
# 응용 1: y'' + 4y = 8x², y(0)=-1? 풀이: yp = 2x² - 1, y = A cos2x + B sin2x + 2x² - 1, y(0)=0 → A=1, y'(0)=2 → B=1
y = sp.cos(2 * x) + sp.sin(2 * x) + 2 * x**2 - 1
chk("2.7 기본", lambda y: D(y, 2) + 4 * y - 8 * x**2, y, x, [(0, 0, 0), (1, 0, 2)])
# 응용 2 변형 규칙(이중근): y'' - 4y' + 4y = 6e^{2x} → yp = 3x²e^{2x}
yp = 3 * x**2 * sp.exp(2 * x)
chk("2.7 변형 이중근", lambda y: D(y, 2) - 4 * D(y) + 4 * y - 6 * sp.exp(2 * x), yp, x)
# 변형 규칙(단순근): y'' - y' - 2y = 3e^{2x} → yp = x e^{2x}
yp = x * sp.exp(2 * x)
chk("2.7 변형 단순근", lambda y: D(y, 2) - D(y) - 2 * y - 3 * sp.exp(2 * x), yp, x)
# 합 규칙: y'' + 3y' + 2y = 4e^{x} + 2x → yp = (2/3)e^{x} + x - 3/2
yp = sp.Rational(2, 3) * sp.exp(x) + x - sp.Rational(3, 2)
chk("2.7 합 규칙", lambda y: D(y, 2) + 3 * D(y) + 2 * y - 4 * sp.exp(x) - 2 * x, yp, x)
# 삼각: y'' + y' = 10 cos x ... yp = 5 sin x - 5 cos x? 확인
yp = 5 * sp.sin(x) - 5 * sp.cos(x)
chk("2.7 삼각", lambda y: D(y, 2) + D(y) - 10 * sp.cos(x), yp, x)

# ---- 2.8 강제진동 ----
# 비감쇠: y'' + 9y = 16 cos t → yp = 2 cos t (F0/(m(ω0²-ω²)) = 16/(9-1)=2)
chk("2.8 비감쇠 yp", lambda y: D(y, 2, t) + 9 * y - 16 * sp.cos(t), 2 * sp.cos(t), t)
# 공진: y'' + 4y = 8 cos 2t → yp = 2 t sin 2t (F0/(2mω0) = 8/4 = 2)
chk("2.8 공진 yp", lambda y: D(y, 2, t) + 4 * y - 8 * sp.cos(2 * t), 2 * t * sp.sin(2 * t), t)
# 감쇠 정상상태: y'' + 2y' + 5y = 10 cos t → a,b 공식(m=1,c=2,k=5,ω0²=5,ω=1): 분모 (5-1)²+1·4=20 → a=10·4/20=2, b=10·2/20=1
chk("2.8 감쇠 yp", lambda y: D(y, 2, t) + 2 * D(y, 1, t) + 5 * y - 10 * sp.cos(t), 2 * sp.cos(t) + sp.sin(t), t)
# 맥놀이 항등식: cos a - cos b = -2 sin((a+b)/2) sin((a-b)/2)
w0, w = sp.symbols("w0 w", positive=True)
lhs = sp.cos(w * t) - sp.cos(w0 * t); rhs = 2 * sp.sin((w0 + w) * t / 2) * sp.sin((w0 - w) * t / 2)
if sp.simplify(sp.expand_trig(lhs - rhs)) != 0 and sp.simplify((lhs - rhs).rewrite(sp.exp)) != 0: bad.append("2.8 맥놀이 항등식")
# RLC 정상상태: R=4, L=1, C=1/3... L I'' + R I' + I/C = E0 ω cos ωt, E0=10, ω=1: S = ωL - 1/(ωC) = 1 - 3 = -2
R_, L_, Cc, E0, om = 4, 1, sp.Rational(1, 3), 10, 1
S = om * L_ - 1 / (om * Cc)
a = -E0 * S / (R_**2 + S**2); b = E0 * R_ / (R_**2 + S**2)
Ip = a * sp.cos(om * t) + b * sp.sin(om * t)
chk("2.9 RLC Ip", lambda I: L_ * D(I, 2, t) + R_ * D(I, 1, t) + I / Cc - E0 * om * sp.cos(om * t), Ip, t)
if sp.simplify(a - 1) != 0 or sp.simplify(b - 2) != 0: bad.append(f"2.9 a,b = {a},{b}")
if sp.simplify(sp.sqrt(a**2 + b**2) - E0 / sp.sqrt(R_**2 + S**2)) != 0: bad.append("2.9 I0")

# ---- 2.10 매개변수변환법 ----
# y'' + y = csc x: y1=cos, y2=sin, W=1 → yp = -cos x ∫ sin·csc + sin x ∫ cos·csc = -x cos x + sin x ln|sin x|
yp = -x * sp.cos(x) + sp.sin(x) * sp.log(sp.sin(x))
chk("2.10 csc", lambda y: D(y, 2) + y - 1 / sp.sin(x), yp, x)
# y'' - 2y' + y = e^x / x: y1=e^x, y2=x e^x, W=e^{2x} → yp = -x e^x + x e^x ln x (= x e^x (ln x - 1))
yp = -x * sp.exp(x) + x * sp.exp(x) * sp.log(x)
chk("2.10 e^x/x", lambda y: D(y, 2) - 2 * D(y) + y - sp.exp(x) / x, yp, x)
# y'' + 4y = sec 2x (보기 문제용): y1=cos2x,y2=sin2x,W=2 → yp = (1/4)cos2x ln|cos2x| + (x/2) sin2x
yp = sp.Rational(1, 4) * sp.cos(2 * x) * sp.log(sp.cos(2 * x)) + x / 2 * sp.sin(2 * x)
chk("2.10 sec2x", lambda y: D(y, 2) + 4 * y - 1 / sp.cos(2 * x), yp, x)

# ---- 3.1~3.2 고계 제차 ----
# y''' - 6y'' + 11y' - 6y = 0 → 1,2,3
for r in (1, 2, 3):
    chk(f"3.2 서로 다른 근 {r}", lambda y: D(y, 3) - 6 * D(y, 2) + 11 * D(y) - 6 * y, sp.exp(r * x), x)
# y''' - 3y' + 2y = 0 → λ=1(이중), -2
for yy in (sp.exp(x), x * sp.exp(x), sp.exp(-2 * x)):
    chk("3.2 중근", lambda y: D(y, 3) - 3 * D(y) + 2 * y, yy, x)
# IVP: y''' + y' = 0, y(0)=2, y'(0)=1, y''(0)=-1 → y = 1 + cos x + sin x
y = 1 + sp.cos(x) + sp.sin(x)
chk("3.2 IVP", lambda y: D(y, 3) + D(y), y, x, [(0, 0, 2), (1, 0, 1), (2, 0, -1)])
# y^(4) - 2y'' + y = 0 → (λ²-1)² → e^x, xe^x, e^-x, xe^-x
for yy in (sp.exp(x), x * sp.exp(x), sp.exp(-x), x * sp.exp(-x)):
    chk("3.2 이중근 둘", lambda y: D(y, 4) - 2 * D(y, 2) + y, yy, x)
# 3차 W: W(1, x, x²) = 2
W = sp.Matrix([[1, x, x**2], [0, 1, 2 * x], [0, 0, 2]]).det()
if sp.simplify(W - 2) != 0: bad.append("3.1 W(1,x,x²)")
# W(e^x, e^{2x}, e^{3x}) = 2 e^{6x}
f = [sp.exp(x), sp.exp(2 * x), sp.exp(3 * x)]
W = sp.Matrix([[g for g in f], [D(g) for g in f], [D(g, 2) for g in f]]).det()
if sp.simplify(W - 2 * sp.exp(6 * x)) != 0: bad.append(f"3.1 W(e^x,e^2x,e^3x) = {sp.simplify(W)}")
# 고계 오일러-코시: x³y''' - 3x²y'' + 6xy' - 6y = 0 → m = 1,2,3 ; x³y''' + 2x²y'' - 4xy' + 4y = 0 → ?
for m in (1, 2, 3):
    chk(f"3.2 EC {m}", lambda y: x**3 * D(y, 3) - 3 * x**2 * D(y, 2) + 6 * x * D(y) - 6 * y, x**m, x)
# x³y''' + 3x²y'' - 2xy' + 2y = 0: 보조방정식 m(m-1)(m-2)+3m(m-1)-2m+2 = m³ - 3m + 2 = (m-1)²(m+2) → x, x ln x, x^-2
for yy in (x, x * sp.log(x), x**-2):
    chk("3.2 EC 중근", lambda y: x**3 * D(y, 3) + 3 * x**2 * D(y, 2) - 2 * x * D(y) + 2 * y, yy, x)
m = sp.symbols("m")
if sp.expand(m * (m - 1) * (m - 2) + 3 * m * (m - 1) - 2 * m + 2 - (m - 1)**2 * (m + 2)) != 0: bad.append("3.2 EC 보조방정식")

# ---- 3.3 고계 비제차 ----
# y''' - y' = 2x (미정계수, λ=0 단순근 → x 곱): yp = -x²
chk("3.3 미정계수 곱", lambda y: D(y, 3) - D(y) - 2 * x, -x**2, x)
# y''' - 2y'' - y' + 2y = e^{3x} → yp = e^{3x}/8 (27-18-3+2 = 8)
chk("3.3 미정계수", lambda y: D(y, 3) - 2 * D(y, 2) - D(y) + 2 * y - sp.exp(3 * x), sp.exp(3 * x) / 8, x)
# 매개변수변환(교수 공식): x³y''' - 3x²y'' + 6xy' - 6y = x⁴ ln x → yp = (1/6)x⁴(ln x - 11/6)
yp = sp.Rational(1, 6) * x**4 * (sp.log(x) - sp.Rational(11, 6))
chk("3.3 EC 교수 예제", lambda y: x**3 * D(y, 3) - 3 * x**2 * D(y, 2) + 6 * x * D(y) - 6 * y - x**4 * sp.log(x), yp, x)
# 응용(숫자 바꿈): x³y''' - 3x²y'' + 6xy' - 6y = 6x⁴ → 표준형 r = 6x, W = 2x³, W1 = x⁴, W2 = -2x³, W3 = x²
r = 6 * x
yp = x * sp.integrate(x**4 / (2 * x**3) * r, x) + x**2 * sp.integrate(-2 * x**3 / (2 * x**3) * r, x) + x**3 * sp.integrate(x**2 / (2 * x**3) * r, x)
chk("3.3 EC 변형", lambda y: x**3 * D(y, 3) - 3 * x**2 * D(y, 2) + 6 * x * D(y) - 6 * y - 6 * x**4, sp.simplify(yp), x)
if sp.simplify(yp - x**4) != 0: bad.append(f"3.3 EC 변형 yp = {sp.simplify(yp)} (본문 x⁴)")

# ---- 개념 예제·추가 문제 ----
chk("2.7 개념 기본", lambda y: D(y, 2) - 3 * D(y) + 2 * y - 4 * x, 2 * x + 3, x)
chk("2.7 개념 변형", lambda y: D(y, 2) - 3 * D(y) + 2 * y - sp.exp(x), -x * sp.exp(x), x)
chk("2.7 기초 2-1", lambda y: D(y, 2) + y - 5 * sp.exp(3 * x), sp.exp(3 * x) / 2, x)
chk("3.3 응용 6-2 IVP", lambda y: D(y, 3) - D(y) - 2 * x, -2 + sp.exp(x) + sp.exp(-x) - x**2, x, [(0, 0, 0), (1, 0, 0), (2, 0, 0)])
y1, y2 = sp.Function("y1")(x), sp.Function("y2")(x)
W1 = sp.Matrix([[0, y2], [1, sp.diff(y2, x)]]).det(); W2 = sp.Matrix([[y1, 0], [sp.diff(y1, x), 1]]).det()
if sp.simplify(W1 + y2) != 0 or sp.simplify(W2 - y1) != 0: bad.append("3.3 n=2 W1=-y2, W2=y1")
chk("2.4 저감쇠 기초", lambda y: D(y, 2, t) + 2 * D(y, 1, t) + 5 * y, sp.exp(-t) * sp.cos(2 * t), t)
chk("2.4 과감쇠 기초", lambda y: D(y, 2, t) + 5 * D(y, 1, t) + 4 * y, sp.exp(-4 * t), t)
chk("3.2 EC 기초 5-4", lambda y: x**3 * D(y, 3) + 3 * x**2 * D(y, 2) - 2 * x * D(y) + 2 * y, x * sp.log(x), x)

if bad:
    print("검산 불일치", len(bad)); [print(" ", b) for b in bad]; sys.exit(1)
print("검산 통과 — 모든 해가 원식·초기조건을 만족")
