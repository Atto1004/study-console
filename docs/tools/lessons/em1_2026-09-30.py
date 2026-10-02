# -*- coding: utf-8 -*-
"""공업수학1 · 2026-09-30 수업 노트 (근거: 2026-09-30/정리.md — 녹음 63분 + 판서 11장 + 슬라이드 p.39~48.
순서 = 슬라이드·판서 순서(2.7 해의 구조 → 표 2.1 → 선택 규칙 → Ex.1~3 → 예제 (1)(2)(3) → 2.8 강제진동·공진·맥놀이·과도/정상).
예제 답은 sympy 로 원식에 대입해 검산(scratch/sc_test/_chk_em1_0930.py) — 판서 예제 (1)(2) 계수 뒤바뀜은 검산값으로 바로잡음.
HTML 본문은 raw 문자열(TeX 역슬래시 하나) + @이름@ 자리에 그림을 끼운다."""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\공업수학1\_수업노트\2026-09-30.html"

def steps3(name, cap, pre, t1, t2, t3, final):
    """Step 1·2·3 상자 + 아래 식 + 최종해. pre 는 맨 위 판단 한 줄(없으면 "")"""
    top = 30 if pre else 8
    return canvas(560, top + 128,
        step(1, (text(280, 20, pre, 13, GRAY, "middle") if pre else ""),
            fbox(10, top, 170, 40, "Step 1 제차해 y_h", INK, size=13), text(95, top + 62, t1, 12.5, INK, "middle")),
        step(2, arrow(182, top + 20, 192, top + 20, GREEN, "", 1.8),
            fbox(195, top, 170, 40, "Step 2 특수해 y_p", BLUE, size=13), text(280, top + 62, t2, 12.5, BLUE, "middle")),
        step(3, arrow(367, top + 20, 377, top + 20, GREEN, "", 1.8),
            fbox(380, top, 170, 40, "Step 3 초기조건", RED, size=13), text(465, top + 62, t3, 12.5, RED, "middle")),
        step(4, text(280, top + 108, final, 13.5, INK, "middle", True)),
        cap=cap, name=name)

fig_struct = canvas(560, 200,
    step(1, text(280, 22, "y″ + p(x)y′ + q(x)y = r(x),   r(x) ≠ 0", 14, INK, "middle", True)),
    step(2, fbox(20, 40, 230, 54, "y_h = c₁y₁ + c₂y₂", INK, size=14), text(135, 112, "제차(r = 0)의 일반해 — 2.2 방법", 12, GRAY, "middle")),
    step(3, text(280, 72, "+", 20, GREEN, "middle", True),
        fbox(310, 40, 230, 54, "y_p", BLUE, size=15), text(425, 112, "비제차의 어떤 해 하나 (상수 없음)", 12, GRAY, "middle")),
    step(4, text(280, 150, "y = y_h + y_p   (일반해)", 16, RED, "middle", True),
        text(280, 182, "순서 : 제차 y_h 먼저 → 그다음 y_p", 13, INK, "middle")),
    cap="2.7 해의 구조. 비제차의 일반해 = 제차의 일반해(상수 \\(c_1,c_2\\) 포함) + 비제차의 특수해 하나.", name="struct")

def _row(y, l, r):
    return text(24, y, l, 13, INK) + text(284, y, r, 13, BLUE)
fig_table = canvas(560, 250,
    step(1, text(130, 24, "r(x) 의 항", 13.5, INK, "middle", True), text(410, 24, "y_p 의 선택", 13.5, BLUE, "middle", True),
        line(14, 36, 546, 36, INK, 1.6), line(266, 36, 266, 202, GRAY, 1.2), _row(62, "k e^(γx)", "C e^(γx)")),
    step(2, _row(102, "k xⁿ  (n = 0, 1, …)", "K_n xⁿ + … + K_1 x + K_0")),
    step(3, _row(142, "k cos ωx ,  k sin ωx", "K cos ωx + M sin ωx")),
    step(4, _row(182, "k e^(αx)cos ωx ,  k e^(αx)sin ωx", "e^(αx)(K cos ωx + M sin ωx)"), line(14, 202, 546, 202, INK, 1.6)),
    step(5, text(280, 234, "표에 없는 r(x) : ln x · sec x · csc x → 매개변수 변환법(2.10)", 13, RED, "middle", True)),
    cap="표 2.1 미정계수법(슬라이드 p.40). cos 과 sin 은 둘 중 하나만 있어도 \\(y_p\\)에는 둘 다 넣는다.", name="table")

fig_rules = canvas(560, 190,
    step(1, fbox(10, 20, 160, 50, "표 2.1 에서 y_p 고르기", INK, size=13), text(90, 88, "기본 규칙", 12.5, GRAY, "middle")),
    step(2, arrow(172, 45, 200, 45, GREEN, "", 1.8), diamond(270, 45, 136, 58, "y_h 와 겹치나?", INK, 12.5),
        arrow(338, 45, 378, 26, GREEN, "", 1.6), arrow(338, 45, 378, 66, GREEN, "", 1.6),
        fbox(382, 8, 166, 36, "단근과 겹침 → x 곱함", BLUE, size=12.5), fbox(382, 50, 166, 36, "중근과 겹침 → x² 곱함", RED, size=12.5),
        arrow(270, 74, 270, 98, GRAY, "", 1.4), text(282, 96, "아니오 → 기본 규칙 그대로", 12, GRAY)),
    step(3, fbox(10, 120, 538, 48, "합 규칙 : r = r₁ + r₂ 이면 y_p = y_p1 + y_p2 (항마다 겹침을 따로 판단)", GREEN, size=13)),
    cap="선택 규칙 3개(슬라이드 p.41). 변형 규칙(Modification Rule)이 「겹침 → x, 중근이면 x²」.", name="rules")

fig_ex1 = steps3("ex1", "Ex.1 (슬라이드 p.42) — 비제차 초기값 문제는 언제나 이 3단계.",
    "r = 0.001x² → 표의 kxⁿ (n = 2) · y_h 와 안 겹침 → 기본 규칙",
    "A cos x + B sin x", "0.001x² − 0.002", "A = 0.002, B = 1.5",
    "y = 0.002 cos x + 1.5 sin x + 0.001x² − 0.002")
fig_ex2 = steps3("ex2", "Ex.2 (슬라이드 p.43) — r 의 \\(e^{-1.5x}\\)가 \\(y_h\\)와 겹치고 중근이라 \\(x^2\\)을 곱한다.",
    "r = −10e^(−1.5x) ↔ y_h 의 e^(−1.5x) : 겹침 + 중근 → x² 곱함",
    "(c₁ + c₂x)e^(−1.5x)", "−5x²e^(−1.5x)", "c₁ = 1, c₂ = 1.5",
    "y = (1 + 1.5x)e^(−1.5x) − 5x²e^(−1.5x)")
fig_ex3 = steps3("ex3", "Ex.3 (슬라이드 p.44) — r 이 두 줄의 합이라 \\(y_p\\)도 두 줄의 합.",
    "r = (2cos x − 0.25 sin x) + 0.09x · y_h 와 안 겹침 → 합 규칙",
    "c₁e^(−x/2) + c₂e^(−3x/2)", "sin x + 0.12x − 0.32", "c₁ = 3.1, c₂ = 0",
    "y = 3.1e^(−x/2) + sin x + 0.12x − 0.32")

fig_ex12 = canvas(560, 190,
    step(1, text(20, 26, "(1) y″ + 2y′ + y = 2e^(−x) + 3x + 2", 13.5, INK, "start", True),
        text(20, 52, "λ = −1 중근 → y_h = (c₁ + c₂x)e^(−x) · e^(−x) 겹침 + 중근 → x²", 12.5, INK),
        text(20, 78, "y_p = Ax²e^(−x) + Bx + C  →  A = 1, B = 3, C = −4", 13, RED, "start", True)),
    step(2, text(20, 118, "(2) y″ + 3y′ + 2y = e^(−2x) + 3e^(−x)", 13.5, INK, "start", True),
        text(20, 144, "λ = −1, −2 단근 → y_h = c₁e^(−x) + c₂e^(−2x) · 두 항 다 겹침 → x", 12.5, INK),
        text(20, 170, "y_p = Axe^(−x) + Bxe^(−2x)  →  A = 3, B = −1", 13, RED, "start", True)),
    cap="예제 (1)(2)(슬라이드 p.45). 계수는 원식에 대입해 검산한 값 — 판서에는 (1)의 B·C, (2)의 A·B 가 뒤바뀌어 적혔다.", name="ex12")

fig_ex3b = steps3("ex3b", "예제 (3) — \\(e^{-3x}\\)는 \\(y_h\\)와 안 겹쳐 기본 + 기본의 합 규칙. 초기조건은 수업에서 적용하지 않아 직접 풀었다.",
    "e^(−3x) 는 y_h 와 안 겹침 · 2x² 는 다항식 → 합 규칙",
    "c₁e^(−x) + c₂e^(−2x)", "½e^(−3x) + x² − 3x + 7/2", "c₁ = −4, c₂ = ½",
    "y = −4e^(−x) + ½e^(−2x) + ½e^(−3x) + x² − 3x + 7/2")

def spring(x, y0, y1, n=6, amp=9, color=INK):
    pts = [(x, y0), (x, y0 + 8)]; L = (y1 - y0 - 16)
    for i in range(n): pts.append((x + (amp if i % 2 == 0 else -amp), y0 + 8 + L * (i + .5) / n))
    pts += [(x, y1 - 8), (x, y1)]
    return polyline(pts, color, 2)
road = [(40 + i * 4, 182 - 6 * math.sin((40 + i * 4) / 14)) for i in range(56)]
fig_car = canvas(560, 200,
    step(1, line(70, 18, 190, 18, INK, 3), spring(130, 18, 88), text(148, 58, "k", 13, INK),
        block(100, 88, 60, 40, "m"), line(130, 128, 130, 150, INK, 2), circle(130, 162, 12, INK, w=2.4)),
    step(2, polyline(road, GRAY, 2), text(276, 186, "r(t) 입력·구동력 (노면 요철)", 12.5, RED),
        arrow(188, 128, 188, 92, BLUE, "", 2), text(198, 114, "y(t) 출력·응답", 12.5, BLUE)),
    step(3, text(330, 36, "자유운동  my″ + cy′ + ky = 0", 13, INK), text(330, 62, "강제운동  my″ + cy′ + ky = r(t)", 13, RED, "start", True)),
    step(4, text(330, 112, "r(t) = F₀ cos ωt (주기 외력)", 13, INK), text(330, 138, "→ y_p = a cos ωt + b sin ωt", 13, BLUE, "start", True)),
    cap="2.8 판서: 천장 — 용수철 k — 질량 m — 바퀴가 요철 위를 지난다. 노면이 입력 \\(r(t)\\), 질량의 위아래 운동이 출력 \\(y(t)\\).", name="car")

XL = lambda t: 40 + t * 11; XR = lambda t: 310 + t * 11
YC = lambda y: 100 - y * 30; YR = lambda y: 100 - y * 3
fig_res = canvas(560, 200,
    step(1, arrow(40, 100, 268, 100, INK, "", 1.4), arrow(40, 160, 40, 40, INK, "", 1.4), text(272, 104, "t", 13, INK),
        arrow(310, 100, 538, 100, INK, "", 1.4), arrow(310, 160, 310, 40, INK, "", 1.4), text(542, 104, "t", 13, INK)),
    step(2, fplot(lambda t: math.cos(1.6 * t) - math.cos(t), 0, 20, XL, YC, n=300, color=BLUE, w=2),
        text(155, 26, "ω ≠ ω₀ : 두 진동의 중첩 (유한)", 12.5, BLUE, "middle", True)),
    step(3, fplot(lambda t: t, 0, 20, XR, YR, color=GRAY, w=1.2, dash="5 4"), fplot(lambda t: -t, 0, 20, XR, YR, color=GRAY, w=1.2, dash="5 4"),
        fplot(lambda t: t * math.sin(t), 0, 20, XR, YR, n=300, color=RED, w=2),
        text(425, 26, "ω = ω₀ : 공진 (진폭이 t 에 비례)", 12.5, RED, "middle", True)),
    step(4, text(280, 188, "y_p = F₀/(2mω₀) · t sin ω₀t   ← 변형 규칙으로 t 를 곱한 결과", 13, INK, "middle", True)),
    cap="비감쇠 강제진동(슬라이드 p.47). 구동 주파수 \\(\\omega\\)가 고유 주파수 \\(\\omega_0\\)와 같아지면 \\(r(t)\\)가 제차해와 겹친다 → \\(t\\)가 곱해져 진폭이 끝없이 커진다.", name="res")

YB = lambda y: 100 - y * 28
fig_beat = canvas(560, 200,
    step(1, arrow(40, 100, 268, 100, INK, "", 1.4), arrow(40, 160, 40, 40, INK, "", 1.4), text(272, 104, "t", 13, INK),
        fplot(lambda t: 2 * math.sin(0.18 * t), 0, 20, XL, YB, n=200, color=GRAY, w=1.2, dash="5 4"),
        fplot(lambda t: -2 * math.sin(0.18 * t), 0, 20, XL, YB, n=200, color=GRAY, w=1.2, dash="5 4"),
        fplot(lambda t: 2 * math.sin(0.18 * t) * math.sin(2.2 * t), 0, 20, XL, YB, n=400, color=BLUE, w=1.8),
        text(155, 26, "맥놀이 ω ≈ ω₀ : 커졌다 작아졌다", 12.5, BLUE, "middle", True)),
    step(2, arrow(310, 100, 538, 100, INK, "", 1.4), arrow(310, 160, 310, 40, INK, "", 1.4), text(542, 104, "t", 13, INK),
        fplot(lambda t: 1.4 * math.exp(-0.3 * t) * math.sin(3 * t) + 0.75 * math.cos(t), 0, 20, XR, YB, n=400, color=RED, w=2),
        text(316, 26, "과도해 y_h + y_p", 12.5, RED), text(536, 26, "정상상태해 y_p", 12.5, GREEN, "end")),
    step(3, text(280, 188, "감쇠(c > 0)가 있으면 y_h → 0 : 과도해가 정상상태해로 접근", 13, INK, "middle", True)),
    cap="맥놀이와 감쇠 강제진동(슬라이드 p.48 · 판서 10:03). 오른쪽은 처음 출렁이다(과도) 고른 진동(정상상태)으로 가라앉는 응답.", name="beat")

html = r'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>공업수학1 · 9/30 비제차 ODE 미정계수법 · 강제진동과 공진</title></head><body>
<header>
<h1>2.7 비제차 ODE — 미정계수법, 그리고 2.8 강제진동 · 공진</h1>
<p class="lead">지금까지는 우변이 0인 <b>제차</b> 방정식만 풀었다. 오늘은 우변에 바깥에서 주는 함수 \(r(x)\)가 있는 <b>비제차</b>: 답은 언제나 \(y=y_h+y_p\). \(y_h\)는 이미 아는 방법, 새로 배우는 것은 \(y_p\)를 <b>표 2.1에서 꼴을 골라 계수만 정하는</b> 미정계수법과 그 선택 규칙 3개다. 뒤 15분은 그 결과가 실제 진동에서 무엇인지 — <b>공진·맥놀이·과도해/정상상태해</b>. 지난 시간 끝에 예고했던 2.6 정리 3·4는 다루지 않고 바로 2.7로 넘어갔다.</p>
<p class="meta"><span>녹음 63분</span><span>판서 11장 (09:15~10:03)</span><span>슬라이드 p.39~48</span><span>5주차 · 수 · 과제 2.7 #5·7·17</span></p>
</header>

<section class="s" data-id="s1" data-nodes="ode.undetermined_coeff ode.const_coeff">
<h2>1. 해의 구조 — y = y_h + y_p (슬라이드 p.39 · 판서 09:15)</h2>
<p>수업은 제차 복습으로 시작했다. 상수계수면 특성방정식(서로 다른 실근·중근·공액복소근), 계수가 \(x^2,x,1\)이면 오일러-코시. 여기까지가 \(r(x)=0\)인 세계다.</p>
@struct@
<div class="formula">\[y''+p(x)y'+q(x)y=r(x),\ \ r(x)\ne0\qquad\Longrightarrow\qquad y(x)=y_h(x)+y_p(x)\]</div>
<div class="why">두 관계가 이 식의 근거다. ① 비제차의 두 해를 빼면 \(r-r=0\)이라 제차의 해가 된다. ② 비제차 해에 제차 해를 더하면 \(r+0=r\)이라 여전히 비제차 해다. 그러니 특수해 \(y_p\) 하나만 찾으면 나머지 모든 해는 \(y_p\)에 제차의 일반해 \(y_h=c_1y_1+c_2y_2\)를 더한 것뿐이다. \(y_p\)는 <b>임의 상수가 없는</b> 해 하나 — 상수는 \(y_h\)가 다 갖고 있다.</div>
<div class="say">판서(09:15): \(y_h=c_1e^{\lambda_1x}+c_2e^{\lambda_2x}\)의 \(e^{\lambda_1x}\)에, \(y_h=(c_1+c_2x)e^{\lambda x}\)의 \(x\)에 동그라미 — 뒤에서 \(r(x)\)와 같은 꼴인지 비교할 자리, 그리고 중근이면 \(x\)가 붙은 항이 이미 있다는 표시.</div>
<div class="analogy">\(y_p\)는 지도 위의 "현재 위치 한 점", \(y_h\)는 "그 점에서 갈 수 있는 모든 방향". 한 점만 알면 나머지 길은 방향을 더해서 다 찾는다.</div>
<div class="memo"><b>외울 것</b> 비제차 일반해 \(y=y_h+y_p\) · \(y_h=c_1y_1+c_2y_2\)(상수 포함) · \(y_p\)는 상수 없는 해 하나 · 순서는 \(y_h\) 먼저</div>
</section>

<section class="s" data-id="s2" data-nodes="ode.undetermined_coeff">
<h2>2. 미정계수법 — 표 2.1 (슬라이드 p.40)</h2>
<p>\(y_p\)를 구하는 방법은 둘: ① <b>미정계수법</b> ② 매개변수 변환법(2.10). \(r(x)\)는 바깥에서 주어진 <b>구동 함수(강제 함수)</b>. 미정계수법은 "바깥에서 이런 함수가 들어오면 특수해도 이런 꼴일 것"이라고 꼴을 정해 두고 계수만 대입으로 구한다.</p>
@table@
<div class="why">표의 함수들(지수·다항식·cos/sin·그 곱)은 <b>미분해도 같은 무리 안에 머문다</b>. \(e^{\gamma x}\)는 미분해도 \(e^{\gamma x}\), \(x^n\)은 차수가 낮은 다항식, \(\cos\)는 \(\sin\)으로. 그래서 그 꼴로 놓고 \(y'',y'\)를 넣으면 같은 함수끼리 계수 비교만 남는다. \(\ln x\)·\(\sec x\)는 미분할수록 새 함수가 계속 나와 꼴을 미리 정할 수 없다 → 미정계수법 불가.</div>
<div class="say">"미정계수법 … <b>표 2.1, 이거는 여러분들이 알아야 돼요. 꼭 알아야 돼요.</b>" "선택하는 규칙이 세 가지 있어요. <b>이것도 알아야 돼요.</b>" (녹음 09:30~10:44)</div>
<div class="analogy">자판기에 넣은 동전(\(r\))의 종류가 정해지면 나오는 음료의 종류(\(y_p\)의 꼴)도 정해진다. 남은 일은 "몇 개 나오나"(계수)를 세는 것뿐.</div>
<div class="pitfall">\(r=k\cos\omega x\) 하나만 있어도 \(y_p=K\cos\omega x+M\sin\omega x\) — \(\sin\)을 빼면 \(y'\)에서 생기는 \(\sin\) 항을 맞출 수 없다. 다항식도 \(x^2\)이면 \(K_2x^2+K_1x+K_0\)까지 전부.</div>
<div class="memo"><b>외울 것</b> \(ke^{\gamma x}\to Ce^{\gamma x}\) · \(kx^n\to K_nx^n+\dots+K_0\) · \(\cos/\sin\to K\cos\omega x+M\sin\omega x\) · \(e^{\alpha x}\cos/\sin\to e^{\alpha x}(K\cos\omega x+M\sin\omega x)\) · \(\ln x,\sec x,\csc x\)는 불가</div>
</section>

<section class="s" data-id="s3" data-nodes="ode.undetermined_coeff">
<h2>3. 선택 규칙 3개 — 기본 · 변형 · 합 (슬라이드 p.41)</h2>
@rules@
<p><b>기본 규칙</b>: \(r(x)\)가 표 왼쪽 열 함수면 오른쪽 열의 \(y_p\)를 골라 대입해 계수를 정한다. <b>변형 규칙</b>: \(y_h\)를 먼저 구해 두고, 고른 \(y_p\)의 항이 제차의 해와 겹치면 \(x\)를 곱한다 — 겹치는 해가 특성방정식의 <b>중근</b>에 해당하면 \(x^2\). <b>합 규칙</b>: \(r(x)\)가 왼쪽 열 함수들의 합이면 \(y_p\)도 대응하는 함수들의 합.</p>
<div class="why">겹치면 왜 \(x\)를 곱하나: 고른 꼴이 제차의 해라면 대입했을 때 좌변이 0이 되어 \(r\)을 만들 수 없다. \(x\)를 곱하면 제차의 해에서 벗어난다. 중근이면 \(e^{\lambda x}\)와 \(xe^{\lambda x}\)가 <b>둘 다</b> 이미 \(y_h\)에 있으니 \(x\)를 한 번 더 — \(x^2e^{\lambda x}\). 그래서 \(y_h\)를 먼저 구하는 것이 순서다.</div>
<div class="say">변형 규칙(중근이면 \(x^2\)) — "굉장히 중요한 특징이에요 … <b>굉장히 시험이 잘 나와요.</b>" (13:28) · "그중에서 제일 많이 나오는 게 뭐예요? <b>변형 규칙</b>이고 그다음에 <b>합 규칙도 많이</b> 나오고, 기본 규칙은 그냥 하면 돼." (14:46)</div>
<div class="analogy">이미 자리에 앉은 사람(\(y_h\))과 같은 이름표(\(y_p\))를 받으면 구분이 안 된다. 이름표에 \(x\)를 하나 덧붙이고, 이미 \(x\)가 붙은 쌍둥이까지 앉아 있으면(중근) 하나 더 — \(x^2\).</div>
<div class="memo"><b>외울 것</b> 기본: 표대로 · 변형: 겹치면 \(\times x\), 중근과 겹치면 \(\times x^2\) · 합: \(r\)이 합이면 \(y_p\)도 합(항마다 따로 판단) · \(y_h\) 먼저</div>
</section>

<section class="s" data-id="s4" data-nodes="ode.undetermined_coeff ode.ivp">
<h2>4. Ex.1 — 3단계 풀이의 원형 (슬라이드 p.42)</h2>
<p>\(y''+y=0.001x^2,\ y(0)=0,\ y'(0)=1.5\). 비제차 풀이는 제차보다 한 단계(\(y_p\))가 더 있고, 초기값까지 주어지면 상수까지 — <b>Step 1 \(y_h\) → Step 2 \(y_p\) → Step 3 초기조건</b>.</p>
@ex1@
<div class="formula">\[y_p=K_2x^2+K_1x+K_0:\ \ 2K_2+K_2x^2+K_1x+K_0=0.001x^2\ \Rightarrow\ K_2=0.001,\ K_1=0,\ K_0=-0.002\]</div>
<div class="why">Step 1: \(\lambda^2+1=0\) → \(\lambda=\pm i\) → \(y_h=A\cos x+B\sin x\)(상수 이름은 \(c_1,c_2\)로 써도 된다). Step 2: \(r=0.001x^2\)은 \(kx^n\)(\(n=2\))이고 \(\cos,\sin\)과 안 겹치니 기본 규칙 — \(x^2\)만 있어도 \(K_1x+K_0\)까지 둔다. 양변의 \(x^2\)·\(x\)·상수 계수를 비교. Step 3: \(y(0)=A-0.002=0\) → \(A=0.002\), \(y'(0)=B=1.5\). 상수는 <b>마지막에</b> 일반해 전체에 대해 정한다(\(y_h\)만으로 정하면 틀린다).</div>
<div class="analogy">요리 순서: 밑국물(\(y_h\)) → 양념(\(y_p\)) → 마지막 간 맞추기(초기조건). 간을 국물만 끓였을 때 보면 양념 넣은 뒤 맛이 달라진다.</div>
<div class="memo"><b>외울 것</b> 3단계 \(y_h\) → \(y_p\) → 초기조건 · Ex.1 \(y=0.002\cos x+1.5\sin x+0.001x^2-0.002\)</div>
</section>

<section class="s" data-id="s5" data-nodes="ode.undetermined_coeff ode.ivp">
<h2>5. Ex.2 — 중근 + 변형 규칙 = x² (슬라이드 p.43 · 판서 09:24)</h2>
<p>\(y''+3y'+2.25y=-10e^{-1.5x},\ y(0)=1,\ y'(0)=0\).</p>
@ex2@
<div class="formula">\[\lambda^2+3\lambda+2.25=(\lambda+1.5)^2=0\ \Rightarrow\ y_h=(c_1+c_2x)e^{-1.5x},\qquad y_p=Cx^2e^{-1.5x}\ \Rightarrow\ C=-5\]</div>
<div class="why">\(r\)의 \(e^{-1.5x}\)는 \(y_h\)의 \(e^{-1.5x}\)와 같은 꼴이고, \(-1.5\)가 <b>중근</b>이라 \(xe^{-1.5x}\)도 이미 \(y_h\) 안에 있다 → \(x^2\)을 곱한다. \(y_p=Cx^2e^{-1.5x}\)를 넣으면 \(e^{-1.5x}\)와 \(x,x^2\) 항이 모두 지워지고 \(2C=-10\)만 남는다(중근일 때만 생기는 깔끔한 소거). 초기조건: \(y(0)=c_1=1\), \(y'(0)=c_2-1.5c_1=0\) → \(c_2=1.5\).</div>
<div class="say">교수님이 "충분이 아니고"라며 다시 설명한 구간(23:39~24:08): 단근과 겹치면 \(x\), 중근과 겹치면 \(x^2\). "예제 2번이 중요한 예." · "중간고사가 되면은 … (이건) 기본 규칙은 아니에요." (25:41, 녹음 일부 불확실)</div>
<div class="pitfall">\(x\)만 곱해 \(Cxe^{-1.5x}\)로 두면 그것도 제차의 해라 대입하면 좌변이 0 → 계수를 정할 수 없다. 중근인지 먼저 확인.</div>
<div class="analogy">쌍둥이(\(e^{-1.5x}\), \(xe^{-1.5x}\))가 이미 두 자리를 차지했다. 세 번째 형제는 \(x^2\) 이름표를 달아야 들어간다.</div>
<div class="memo"><b>외울 것</b> 중근 \(\lambda\)와 겹치면 \(y_p=Cx^2e^{\lambda x}\) · Ex.2 \(C=-5\), \(y=(1+1.5x)e^{-1.5x}-5x^2e^{-1.5x}\)</div>
</section>

<section class="s" data-id="s6" data-nodes="ode.undetermined_coeff ode.ivp">
<h2>6. Ex.3 — 합 규칙 (슬라이드 p.44 · 판서 09:31)</h2>
<p>\(y''+2y'+0.75y=2\cos x-0.25\sin x+0.09x,\ y(0)=2.78,\ y'(0)=-0.43\).</p>
@ex3@
<div class="formula">\[y_p=\underbrace{K\cos x+M\sin x}_{y_{p1}}+\underbrace{K_1x+K_0}_{y_{p2}}\ \Rightarrow\ K=0,\ M=1,\ K_1=0.12,\ K_0=-0.32\]</div>
<div class="why">\(\lambda^2+2\lambda+0.75=(\lambda+\tfrac12)(\lambda+\tfrac32)\) → \(y_h=c_1e^{-x/2}+c_2e^{-3x/2}\). \(r\)의 어느 항도 \(y_h\)와 안 겹치니 \(x\)를 곱할 일 없이 합 규칙만. 책은 \(y_{p1},y_{p2}\)를 나눠 풀었고, 교수님은 "합쳐서 한 번에 해도 된다 — 미지수 4개, 조금 귀찮죠". 초기조건: \(c_1+c_2-0.32=2.78\), \(-\tfrac12c_1-\tfrac32c_2+1+0.12=-0.43\) → \(c_1=3.1,\ c_2=0\).</div>
<div class="pitfall">슬라이드 Step 3의 「\(y'(0)=\dots=-0.4\)」는 문제 조건 \(-0.43\)이 맞다(\(c_1=3.1\)을 넣으면 \(-1.55+1.12=-0.43\)). 한글판 교재 p.92도 같은 표기.</div>
<div class="analogy">택배 두 상자(\(\cos\cdot\sin\) 묶음, 다항식 묶음)를 각각 풀어서 합쳐도, 한 상자에 담아 한 번에 풀어도 내용물은 같다.</div>
<div class="memo"><b>외울 것</b> 합 규칙: 묶음마다 표에서 고르고 더한다 · Ex.3 \(y=3.1e^{-x/2}+\sin x+0.12x-0.32\)</div>
</section>

<section class="s" data-id="s7" data-nodes="ode.undetermined_coeff">
<h2>7. 예제 (1)(2) — 변형 규칙 + 합 규칙 (슬라이드 p.45 · 판서 09:37~09:41)</h2>
<p>"대부분의 문제는 변형 규칙이나 합 규칙을 많이 쓴다." 슬라이드에는 문제만 있고 풀이는 판서로 했다.</p>
@ex12@
<details class="ex" open><summary>(1) \(y''+2y'+y=2e^{-x}+3x+2\)</summary><div class="body">
<p>\((\lambda+1)^2=0\) → 중근 \(-1\) → \(y_h=(c_1+c_2x)e^{-x}\). \(2e^{-x}\)는 \(y_h\)와 겹치고 중근 → \(x^2\), \(3x+2\)는 다항식 → 합 규칙: \(y_p=Ax^2e^{-x}+Bx+C\).</p>
<p>대입: \(e^{-x}\) 부분은 \(2A=2\) → \(A=1\). 다항식 부분은 \(2B+(Bx+C)=3x+2\) → \(B=3\), \(2B+C=2\) → \(C=-4\).</p>
<p><b>\(y=(c_1+c_2x)e^{-x}+x^2e^{-x}+3x-4\)</b></p></div></details>
<details class="ex" open><summary>(2) \(y''+3y'+2y=e^{-2x}+3e^{-x}\)</summary><div class="body">
<p>\((\lambda+1)(\lambda+2)=0\) → 단근 \(-1,-2\) → \(y_h=c_1e^{-x}+c_2e^{-2x}\). 두 항 다 겹치지만 중근이 아니라 \(x\)만: \(y_p=Axe^{-x}+Bxe^{-2x}\).</p>
<p>\(xe^{\lambda x}\)를 넣으면 \(x\) 항은 지워지고 \((2\lambda+3)e^{\lambda x}\)만 남는다: \(\lambda=-1\)에서 \(A\cdot1=3\), \(\lambda=-2\)에서 \(B\cdot(-1)=1\) → \(A=3,\ B=-1\).</p>
<p><b>\(y=c_1e^{-x}+c_2e^{-2x}+3xe^{-x}-xe^{-2x}\)</b></p></div></details>
<div class="pitfall">판서에는 (1) \(B=-4,\ C=3\), (2) \(A=-1,\ B=3\)으로 계수가 뒤바뀌어 적혔다. 원식에 대입하면 (1)은 \(-7x-7\)이 남아 틀리고, 위 값(녹음의 교정값과 같다)이 맞다. 시험 대비는 검산값으로.</div>
<div class="say">"변형 규칙 플러스 합 규칙이 대부분 … <b>시험에도 변형 규칙 플러스 합 규칙이 나오</b>(고), 기본 규칙은 잘 알 거야." (34분대) · "다 규칙이 나온다. <b>중간고사도 그냥 기본 규칙은 안 쓸 거예요.</b>" (36:21)</div>
<div class="analogy">(1)은 쌍둥이 자리(중근)라 \(x^2\), (2)는 외동 둘(단근 둘)이라 각자 \(x\) 하나씩. 자리에 누가 몇 명 앉았는지부터 센다.</div>
<div class="memo"><b>외울 것</b> (1) \(y_p=x^2e^{-x}+3x-4\) · (2) \(y_p=3xe^{-x}-xe^{-2x}\) · \(xe^{\lambda x}\) 대입 결과 = \((2\lambda+a)e^{\lambda x}\)(\(y''+ay'+by\), 단근일 때)</div>
</section>

<section class="s" data-id="s8" data-nodes="ode.undetermined_coeff ode.ivp">
<h2>8. 예제 (3) — 합 규칙 + 초기값, 그리고 미정계수법이 안 되는 r(x) (판서 09:44~09:48)</h2>
<p>\(y''+3y'+2y=e^{-3x}+2x^2,\ y(0)=\tfrac12,\ y'(0)=-\tfrac32\).</p>
@ex3b@
<div class="formula">\[y_p=Ae^{-3x}+Bx^2+Cx+D:\ \ 2Ae^{-3x}+2Bx^2+(6B+2C)x+(2B+3C+2D)=e^{-3x}+2x^2\]</div>
<div class="why">\(e^{-3x}\)는 \(y_h\)(\(e^{-x},e^{-2x}\))와 안 겹치니 \(x\)를 곱하지 않는다. 계수 비교: \(A=\tfrac12\), \(B=1\), \(C=-3\), \(D=\tfrac72\) — 판서와 같다. 수업은 일반해까지 하고 넘어갔으므로 초기조건은 직접 적용했다: \(c_1+c_2+4=\tfrac12\), \(-c_1-2c_2-\tfrac92=-\tfrac32\) → \(c_1=-4,\ c_2=\tfrac12\)(원식·초기조건 대입 검산).</div>
<div class="say">"특수해까지 풀 수 있는 것이 기본." (47:39) · 마무리 재강조(62:34~): 미정계수법이 쓰이는 \(r(x)\)는 표의 꼴(지수·\(x^n\)·\(\cos\cdot\sin\))뿐 — <b>\(\ln x,\ \sec x,\ \csc x\) 같은 건 미정계수법 불가</b> → 매개변수 변환법(2.10, 다음 시간 예고).</div>
<div class="analogy">표는 "정해진 메뉴판". \(\ln x\)처럼 메뉴판에 없는 주문은 주방(매개변수 변환법)에서 직접 만들어야 한다.</div>
<div class="memo"><b>외울 것</b> (3) \(y=-4e^{-x}+\tfrac12e^{-2x}+\tfrac12e^{-3x}+x^2-3x+\tfrac72\) · \(\ln x,\sec x,\csc x\) → 매개변수 변환법 · <b>5주차 과제 2.7 #5·7·17</b>(판서 09:48, 사용한 규칙 명시 + 계산 각 단계), 2.8 연습문제는 숙제 없음</div>
</section>

<section class="s" data-id="s9" data-nodes="ode.forced_oscillation ode.free_oscillation">
<h2>9. 2.8 강제진동 — 입력과 출력 (슬라이드 p.46 · 판서 09:55)</h2>
<p>2.4의 용수철-질량에 바깥 힘을 더한다. <b>자유운동</b>은 외력 없이 내력만, <b>강제운동</b>은 외부에서 힘 \(r(t)\)가 들어온다. \(r(t)\) = 입력·구동력(driving force), \(y(t)\) = 출력·응답(response). 예: 차가 요철 위를 지나며 오르내림, 망치로 친 충격.</p>
@car@
<div class="formula">\[my''+cy'+ky=F_0\cos\omega t\ \Rightarrow\ y_p=a\cos\omega t+b\sin\omega t,\quad a=F_0\frac{m(\omega_0^2-\omega^2)}{m^2(\omega_0^2-\omega^2)^2+\omega^2c^2},\quad b=F_0\frac{\omega c}{m^2(\omega_0^2-\omega^2)^2+\omega^2c^2}\]</div>
<div class="why">2.7 표의 \(k\cos\omega x\) 줄 그대로다: \(r=F_0\cos\omega t\)면 \(y_p=a\cos\omega t+b\sin\omega t\)로 놓고 대입해 \(a,b\)를 정한다(\(\omega_0=\sqrt{k/m}\), 원식 대입 검산 완료). 제차해 \(y_h=C\cos(\omega_0t-\delta)\)는 2.4에서 구한 것(판서 화살표 「(2.4)」). 식이 복잡하니 경우를 나눠 본다 — 감쇠 없음(\(c=0\)) → 다음 절, 감쇠 있음 → 그다음.</div>
<div class="say">"진동 문제 방정식(세우는 것)을 제가 여러분들한테 요구하지는 않는 것 같아요" (48:31 — 녹음이 불확실해 교수님 확언으로 보기는 어렵다). "3학년 때 진동학에서 한다."</div>
<div class="analogy">자동차 서스펜션: 노면(입력)이 울퉁불퉁해도 차체(출력)가 어떻게 흔들리는지는 용수철 \(k\)·완충기 \(c\)·무게 \(m\)이 정한다.</div>
<div class="memo"><b>외울 것</b> 자유 \(my''+cy'+ky=0\) · 강제 \(my''+cy'+ky=r(t)\) · \(r\) = 입력, \(y\) = 출력(응답) · \(F_0\cos\omega t\) → \(y_p=a\cos\omega t+b\sin\omega t\)</div>
</section>

<section class="s" data-id="s10" data-nodes="ode.forced_oscillation">
<h2>10. 비감쇠 강제진동과 공진 (슬라이드 p.47)</h2>
@res@
<div class="formula">\[c=0:\ \ y=C\cos(\omega_0t-\delta)+\frac{F_0}{m(\omega_0^2-\omega^2)}\cos\omega t\qquad(\omega\ne\omega_0)\]</div>
<div class="formula">\[\omega=\omega_0:\ \ y_p=\frac{F_0}{2m\omega_0}\,t\sin\omega_0t\qquad\text{고유주파수 }\frac{\omega_0}{2\pi},\ \ \text{구동 주파수 }\frac{\omega}{2\pi}\ [\text{cycles/sec}]\]</div>
<div class="why">\(\omega\ne\omega_0\)이면 출력은 고유진동 + 구동진동, 두 조화진동의 중첩이라 유한하다. \(\omega=\omega_0\)이면 \(r(t)=F_0\cos\omega_0t\)가 <b>제차해와 같은 꼴</b> — 2.7 변형 규칙으로 \(t\)를 곱해야 하고, 그 \(t\)가 진폭을 시간에 비례해 키운다. 이것이 <b>공진(resonance)</b>. "변형 규칙이 여기서 쓰인다."</div>
<div class="say">공진 예(55:56~): 타코마 다리 붕괴(바람의 진동수 = 다리 고유진동수 → 출렁이다 끊어짐), 서해대교 같은 긴 구조물, 2학년 유체역학.</div>
<div class="analogy">그네를 밀 때 그네가 돌아오는 박자(\(\omega_0\))에 정확히 맞춰(\(\omega=\omega_0\)) 밀면 작은 힘으로도 점점 높이 올라간다. 박자가 어긋나면 밀어도 크게 안 오른다.</div>
<div class="memo"><b>외울 것</b> \(\omega\ne\omega_0\): 두 진동의 중첩 · 공진 \(\omega=\omega_0\): \(y_p=\dfrac{F_0}{2m\omega_0}t\sin\omega_0t\)(변형 규칙의 \(t\)) · 주파수 = \(\omega/2\pi\)</div>
</section>

<section class="s" data-id="s11" data-nodes="ode.forced_oscillation">
<h2>11. 맥놀이 · 감쇠 강제진동 — 과도해와 정상상태해 (슬라이드 p.48 · 판서 10:03)</h2>
@beat@
<div class="formula">\[y=\frac{F_0}{m(\omega_0^2-\omega^2)}(\cos\omega t-\cos\omega_0t)=\frac{2F_0}{m(\omega_0^2-\omega^2)}\sin\Big(\frac{\omega_0+\omega}{2}t\Big)\sin\Big(\frac{\omega_0-\omega}{2}t\Big)\]</div>
<div class="why"><b>맥놀이(beats)</b>: 입력 주파수와 고유 주파수의 차가 작을 때(\(\omega\approx\omega_0\))의 비감쇠 강제진동. 곱의 꼴로 바꾸면 빠른 진동 \(\sin\frac{\omega_0+\omega}2t\)의 진폭이 느린 \(\sin\frac{\omega_0-\omega}2t\)로 커졌다 작아졌다를 반복한다(삼각함수 합차 공식, 검산 완료). <b>감쇠 강제진동</b>(\(c&gt;0\))에서는 \(y_h\)가 지수적으로 사라진다 — <b>과도해(transient)</b> = 일반해 \(y_h+y_p\), <b>정상상태해(steady-state)</b> = 특수해 \(y_p\). 과도해는 정상상태해로 접근한다.</div>
<div class="say">예: 스위치를 켜면 전압이 출렁이다 안정 → 안정 전이 과도, 안정 뒤가 정상상태(전기·전자에서 쓰임). 맥놀이는 피아노 조율에 쓰인다. 59:52 "잘못된 것 같은데", 60:11 "이거는 여러분들이 하지 마세요" — 무엇을 가리켰는지는 녹음으로 확인 못 했다. "연습문제 2.8은 숙제 안 하기로 했어요." (62:14)</div>
<div class="analogy">조율이 살짝 어긋난 두 피아노 줄을 같이 치면 "웅-웅-" 소리가 커졌다 작아졌다 한다 — 맥놀이. 과도해는 스위치를 켠 직후 형광등의 깜빡임, 정상상태해는 그 뒤의 고른 불빛.</div>
<div class="memo"><b>외울 것</b> 맥놀이 = \(\omega\approx\omega_0\), \(\cos\omega t-\cos\omega_0t=2\sin\frac{\omega_0+\omega}2t\,\sin\frac{\omega_0-\omega}2t\) · 과도해 = \(y_h+y_p\) · 정상상태해 = \(y_p\) · 감쇠가 있으면 과도해 → 정상상태해</div>
</section>

<div class="q" data-qid="q1" data-nodes="ode.undetermined_coeff"><div class="qn">확인 1 · 해의 구조</div><div class="qb">비제차 방정식의 일반해는?</div><ol class="choices"><li data-ok="1">제차의 일반해 \(y_h\) + 비제차의 특수해 \(y_p\)</li><li>비제차의 특수해 \(y_p\) 하나</li><li>제차의 일반해 \(y_h\) 하나</li><li>비제차의 두 특수해의 차</li></ol><div class="ans">\(y=y_h+y_p\). 비제차 두 해의 차는 제차의 해다(4번은 일반해가 아니다).</div></div>
<div class="q" data-qid="q2" data-nodes="ode.undetermined_coeff"><div class="qn">확인 2 · 표 2.1</div><div class="qb">\(y''+y=3\cos2x\)에서 미정계수법으로 고를 \(y_p\)의 꼴은?</div><ol class="choices"><li data-ok="1">\(K\cos2x+M\sin2x\)</li><li>\(K\cos2x\)</li><li>\(Kx\cos2x+Mx\sin2x\)</li><li>\(Ce^{2x}\)</li></ol><div class="ans">\(y_h=c_1\cos x+c_2\sin x\)라 \(\cos2x\)는 안 겹친다 → 기본 규칙. \(\cos\) 하나만 있어도 \(\sin\)까지 둔다.</div></div>
<div class="q" data-qid="q3" data-nodes="ode.undetermined_coeff"><div class="qn">확인 3 · 변형 규칙(단근)</div><div class="qb">\(y''-y'-2y=e^{2x}\)의 특수해는?</div><ol class="choices"><li data-ok="1">\(y_p=\tfrac13xe^{2x}\)</li><li>\(y_p=\tfrac13e^{2x}\)</li><li>\(y_p=\tfrac13x^2e^{2x}\)</li><li>\(y_p=-\tfrac12e^{2x}\)</li></ol><div class="ans">\(\lambda^2-\lambda-2=(\lambda-2)(\lambda+1)\) → \(e^{2x}\)가 단근 2와 겹침 → \(Axe^{2x}\). 대입하면 \((2\cdot2-1)A=1\) → \(A=\tfrac13\).</div></div>
<div class="q" data-qid="q4" data-nodes="ode.undetermined_coeff"><div class="qn">확인 4 · 변형 규칙(중근) · Ex.2</div><div class="qb">\(y''+3y'+2.25y=-10e^{-1.5x}\)에서 고를 \(y_p\)와 그 계수는?</div><ol class="choices"><li data-ok="1">\(Cx^2e^{-1.5x}\), \(C=-5\)</li><li>\(Cxe^{-1.5x}\), \(C=-10\)</li><li>\(Ce^{-1.5x}\), \(C=-10\)</li><li>\(Cx^2e^{-1.5x}\), \(C=-10\)</li></ol><div class="ans">\(-1.5\)가 중근이라 \(x^2\). 대입하면 \(2C=-10\).</div></div>
<div class="q" data-qid="q5" data-nodes="ode.undetermined_coeff"><div class="qn">확인 5 · 예제 (1)</div><div class="qb">\(y''+2y'+y=2e^{-x}+3x+2\)의 특수해는?</div><ol class="choices"><li data-ok="1">\(x^2e^{-x}+3x-4\)</li><li>\(x^2e^{-x}-4x+3\)</li><li>\(xe^{-x}+3x-4\)</li><li>\(e^{-x}+3x+2\)</li></ol><div class="ans">중근 \(-1\)과 겹쳐 \(x^2\), 다항식은 \(2B+(Bx+C)=3x+2\) → \(B=3,\ C=-4\). 2번은 판서에 뒤바뀌어 적힌 값(대입하면 \(-7x-7\)이 남는다).</div></div>
<div class="q" data-qid="q6" data-nodes="ode.undetermined_coeff"><div class="qn">확인 6 · 예제 (2)</div><div class="qb">\(y''+3y'+2y=e^{-2x}+3e^{-x}\)의 특수해는?</div><ol class="choices"><li data-ok="1">\(3xe^{-x}-xe^{-2x}\)</li><li>\(-xe^{-x}+3xe^{-2x}\)</li><li>\(3x^2e^{-x}-x^2e^{-2x}\)</li><li>\(\tfrac32e^{-x}+\tfrac12e^{-2x}\)</li></ol><div class="ans">단근 둘과 각각 겹쳐 \(x\)만. \(xe^{\lambda x}\) 대입 → \((2\lambda+3)\): \(\lambda=-1\)에서 \(A=3\), \(\lambda=-2\)에서 \(-B=1\).</div></div>
<div class="q" data-qid="q7" data-nodes="ode.undetermined_coeff ode.ivp"><div class="qn">확인 7 · 예제 (3) 초기값</div><div class="qb">\(y''+3y'+2y=e^{-3x}+2x^2,\ y(0)=\tfrac12,\ y'(0)=-\tfrac32\)을 풀어라.</div><div class="ans">\(y_h=c_1e^{-x}+c_2e^{-2x}\), \(y_p=\tfrac12e^{-3x}+x^2-3x+\tfrac72\). \(c_1+c_2+4=\tfrac12\), \(-c_1-2c_2-\tfrac92=-\tfrac32\) → \(c_1=-4,\ c_2=\tfrac12\). \(y=-4e^{-x}+\tfrac12e^{-2x}+\tfrac12e^{-3x}+x^2-3x+\tfrac72\).</div></div>
<div class="q" data-qid="q8" data-nodes="ode.undetermined_coeff"><div class="qn">확인 8 · 미정계수법의 한계</div><div class="qb">다음 중 미정계수법으로 \(y_p\)를 구할 수 <b>없는</b> 우변은?</div><ol class="choices"><li data-ok="1">\(r(x)=\sec x\)</li><li>\(r(x)=e^{3x}\)</li><li>\(r(x)=x^2+1\)</li><li>\(r(x)=e^{-x}\sin2x\)</li></ol><div class="ans">\(\sec x\)는 표 2.1에 없다(\(\ln x,\csc x\)도) → 매개변수 변환법(2.10).</div></div>
<div class="q" data-qid="q9" data-nodes="ode.forced_oscillation"><div class="qn">확인 9 · 공진</div><div class="qb">\(y''+4y=8\cos2t\)의 특수해는?</div><ol class="choices"><li data-ok="1">\(2t\sin2t\)</li><li>\(2\cos2t\)</li><li>\(t\cos2t\)</li><li>\(4t\sin2t\)</li></ol><div class="ans">\(\omega_0=2=\omega\) → \(\cos2t\)가 제차해와 겹쳐 \(t\)를 곱한다. \(\dfrac{F_0}{2m\omega_0}=\dfrac{8}{2\cdot1\cdot2}=2\) → \(y_p=2t\sin2t\)(대입 검산).</div></div>
<div class="q" data-qid="q10" data-nodes="ode.forced_oscillation"><div class="qn">확인 10 · 과도해와 정상상태해</div><div class="qb">감쇠 강제진동에서 정상상태해는?</div><ol class="choices"><li data-ok="1">비제차의 특수해 \(y_p\)</li><li>비제차의 일반해 \(y_h+y_p\)</li><li>제차의 일반해 \(y_h\)</li><li>공진할 때의 해</li></ol><div class="ans">과도해 = \(y_h+y_p\), 정상상태해 = \(y_p\). 감쇠로 \(y_h\to0\)이라 과도해가 정상상태해로 접근한다.</div></div>
</body></html>'''
for k, v in {"struct": fig_struct, "table": fig_table, "rules": fig_rules, "ex1": fig_ex1, "ex2": fig_ex2, "ex3": fig_ex3,
             "ex12": fig_ex12, "ex3b": fig_ex3b, "car": fig_car, "res": fig_res, "beat": fig_beat}.items():
    assert f"@{k}@" in html, k
    html = html.replace(f"@{k}@", v)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
