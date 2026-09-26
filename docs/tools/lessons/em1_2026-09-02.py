# -*- coding: utf-8 -*-
"""공업수학1 · 2026-09-02 수업 노트 (결석 회차 — 강의자료 Ch.1 p.10~17 + 교재 Kreyszig 1.1 로 재구성. 근거: 2026-09-02/정리.md)"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\공업수학1\_수업노트\2026-09-02.html"

fig_model = canvas(560, 150,
    fbox(20, 40, 120, 60, "물리 상황", INK, sub="탱크·회로·낙하"), arrow(142, 70, 176, 70, GREEN, "", 2), text(159, 30, "① 모델 설정", 11, GREEN, "middle"),
    fbox(180, 40, 130, 60, "미분방정식", BLUE, sub="y′ = f(x, y)"), arrow(312, 70, 346, 70, GREEN, "", 2), text(329, 30, "② 해법", 11, GREEN, "middle"),
    fbox(350, 40, 90, 60, "해 y(x)", BLUE, sub="식 하나"), arrow(442, 70, 476, 70, GREEN, "", 2), text(459, 30, "③ 해석", 11, GREEN, "middle"),
    fbox(480, 40, 70, 60, "답", RED, sub="몇 시간?"),
    text(280, 130, "이 과목 전체가 ②(해법)이고, 과제·시험은 ①③까지 묻는다", 12.5, GRAY, "middle"),
    cap="모델화 3단계: 물리 법칙으로 식을 세우고(설정), 수학으로 풀고(해법), 그 해가 무슨 뜻인지 되돌린다(해석).")

def _cool(X, Y):
    return fplot(lambda t: 20 + 60 * math.exp(-0.4 * t), 0, 10, X, Y, color=RED, w=2.4)
X1 = lambda t: 30 + t * 14; Y1 = lambda T: 150 - (T - 20) * 1.4
fig_models = canvas(560, 170,
    axis(30, 150, 180, 150, "t", "T") + arrow(30, 150, 30, 40, INK, "", 1.5), line(30, 150, 180, 150, GRAY, 1, "3 3"),
    _cool(X1, Y1), text(105, 44, "뉴턴 냉각", 12.5, INK, "middle", True), text(105, 60, "T′ = −k(T − T_a)", 12, RED, "middle"), text(46, 141, "T_a", 11, GRAY, "middle"),
    line(230, 40, 230, 160, GRAY, 1, "3 3"),
    circle(300, 90, 16, INK, w=2, fill="#F1F3F5"), arrow(300, 108, 300, 150, RED, "mg", 2.2, 16, 0), arrow(300, 72, 300, 34, BLUE, "kv (저항)", 2.2, 30, 0), text(300, 168, "낙하 + 공기저항", 12.5, INK, "middle", True), text(300, 22, "m v′ = mg − kv", 12, RED, "middle"),
    line(390, 40, 390, 160, GRAY, 1, "3 3"),
    fplot(lambda x: -0.012 * (x - 60) ** 2 + 60, 0, 120, lambda x: 410 + x * 1.1, lambda y: 150 - y * 1.6, color=RED, w=2.4), text(476, 168, "투사체", 12.5, INK, "middle", True), text(476, 40, "x″ = 0, y″ = −g", 12, RED, "middle"),
    cap="슬라이드의 세 모델. 셋 다 「변화율(도함수) = 지금 상태의 함수」 꼴이라 미분방정식이 된다.")

fig_tree = canvas(560, 190,
    fbox(200, 20, 160, 44, "미분방정식", INK, sub="도함수가 들어 있는 식"),
    line(280, 64, 280, 82, INK, 1.5), line(150, 82, 410, 82, INK, 1.5), arrow(150, 82, 150, 98, INK, "", 1.5), arrow(410, 82, 410, 98, INK, "", 1.5),
    fbox(60, 100, 180, 50, "상미분방정식 ODE", GREEN, sub="독립변수 하나: y(x), i(t)"),
    fbox(320, 100, 180, 50, "편미분방정식 PDE", GRAY, sub="독립변수 둘 이상: u(x, t)"),
    text(150, 172, "이 과목은 전부 ODE", 12.5, GREEN, "middle", True), text(410, 172, "∂ 기호가 보이면 PDE (공수2)", 12, GRAY, "middle"),
    cap="ODE 와 PDE 의 구분은 독립변수의 개수. 계(order)는 그 식에 나오는 가장 높은 도함수의 차수.")

fig_lin = canvas(560, 200,
    text(30, 34, "선형인가? — y, y′, y″ 가 각각 1제곱으로만, 계수는 x 만의 함수", 13, INK, "start", True),
    text(40, 70, "y′ + 2x·y = eˣ", 14, INK), text(330, 70, "✓ 선형 (1계)", 13, GREEN, "start", True),
    text(40, 98, "y″ + y = 0", 14, INK), text(330, 98, "✓ 선형 (2계)", 13, GREEN, "start", True),
    text(40, 126, "(y′)³ + y = x", 14, INK), text(330, 126, "✗ 비선형 — y′ 의 세제곱 (계는 1계)", 13, RED, "start", True),
    text(40, 154, "y·y′ = x", 14, INK), text(330, 154, "✗ 비선형 — y 와 y′ 의 곱", 13, RED, "start", True),
    text(40, 182, "y″ + sin y = 0", 14, INK), text(330, 182, "✗ 비선형 — sin y", 13, RED, "start", True),
    cap="선형 판별. 「y 쪽」이 1차식이면 선형. 계수에 x 가 들어가는 것은 상관없다(변수계수 선형).")

X2 = lambda x: 60 + x * 60; Y2 = lambda y: 160 - y * 26
fig_family = canvas(560, 180,
    axis(60, 160, 540, 160, "x", "y") + arrow(60, 160, 60, 20, INK, "", 1.5),
    *[fplot(lambda x, c=c: c * math.exp(-0.5 * x), 0, 7.5, X2, Y2, color=GRAY if c != 3 else RED, w=1.6 if c != 3 else 2.6) for c in (1, 2, 3, 4, 5)],
    dot(60, Y2(3), "", 5, RED), text(230, 44, "y(0) = 3 → 이 곡선 하나 (빨강)", 12.5, RED),
    text(430, 60, "y = c·e^(−x/2)  (c 마다 곡선 하나)", 13, INK, "middle"), text(430, 80, "= 일반해 (가족)", 12.5, GRAY, "middle"),
    cap="미분방정식의 해는 하나가 아니라 「가족」이다. 조건 하나(초기값)가 그중 한 곡선을 고른다 — 9/4 의 주제.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>공업수학1 · 9/2 모델화와 미분방정식의 기본 개념</title></head><body>
<header>
<h1>미분방정식이란 — 모델화 3단계와 분류 (ODE · 계 · 선형)</h1>
<p class="lead">첫 수업(결석)은 계산이 아니라 <b>말</b>을 정하는 날이다: 공학 문제를 어떻게 미분방정식으로 바꾸는지(모델화), 그 식을 무엇이라 부르는지(ODE/PDE·계·선형/비선형). 강의자료 p.10~17과 교재 1.1로 재구성했다. 여기서 정한 말이 한 학기 내내 쓰인다 — 특히 "선형이야 비선형이야?"는 교수님이 문제마다 묻는 질문.</p>
<p class="meta"><span>결석 회차 · 슬라이드 p.10~17 재구성</span><span>교재 Kreyszig 1.1</span><span>1주차 · 수</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 모델화(modeling) 3단계 — 이 과목의 뼈대</h2>
<p>공학 문제는 "탱크의 물이 몇 시간 뒤에 빠지나", "회로에 전류가 어떻게 흐르나"처럼 <b>변화</b>를 묻는다. 변화율은 도함수이므로, 물리 법칙을 식으로 옮기면 <b>미분방정식</b>이 나온다.</p>
{fig_model}
<div class="formula">\\[\\text{{① 모델 설정(물리 → 식)}}\\ \\to\\ \\text{{② 해법(식 → 해)}}\\ \\to\\ \\text{{③ 해석(해 → 물리적 답)}}\\]</div>
<div class="why">수업의 대부분은 ②(푸는 기술)이지만, 과제·시험의 문장제는 ①과 ③까지 요구한다. 9/4의 방사능 붕괴, 토리첼리 탱크가 이 세 단계를 그대로 밟는 첫 예.</div>
<div class="analogy">요리 레시피: 재료를 고르고(모델 설정), 조리하고(해법), 맛을 보고 "짜다"고 판단한다(해석). 조리만 잘해도 재료가 틀리면 요리는 실패 — 식을 세우는 단계가 먼저다.</div>
<div class="memo"><b>외울 것</b> 모델화 = 설정 → 해법 → 해석 · 변화율 = 도함수 → 물리 법칙은 미분방정식이 된다</div>
</section>

<section class="s" data-id="s2">
<h2>2. 공학 문제의 수학적 모델 세 가지</h2>
{fig_models}
<div class="formula">\\[\\text{{뉴턴 냉각: }}\\frac{{dT}}{{dt}}=-k(T-T_a)\\qquad \\text{{낙하+공기저항: }}m\\frac{{dv}}{{dt}}=mg-kv\\qquad \\text{{투사체: }}\\frac{{d^2x}}{{dt^2}}=0,\\ \\frac{{d^2y}}{{dt^2}}=-g\\]</div>
<div class="why">셋의 공통 구조: <b>지금 상태(T, v, 위치)가 변화율을 결정</b>한다. 커피가 뜨거울수록 빨리 식고(온도 차에 비례), 낙하 속도가 클수록 저항이 커진다. "무엇이 무엇에 비례하는가"를 쓰면 식이 끝난다 — 비례상수 \\(k\\)는 실험으로 정한다.</div>
<p>각 식이 나오는 자리: <b>냉각</b>은 "온도 차가 클수록 빨리 식는다"(\\(T_a\\)는 주위 온도, 식으니까 −). <b>낙하</b>는 뉴턴 2법칙 \\(ma=\\)(아래로 \\(mg\\)) − (위로 저항 \\(kv\\)) — 속도가 커질수록 저항이 커져 결국 \\(mg=kv\\)에서 가속이 멈춘다(종단속도 \\(v=mg/k\\)). <b>투사체</b>는 수평으로는 힘이 없고(\\(x''=0\\)) 수직으로는 중력뿐(\\(y''=-g\\))이라 두 식이 따로 논다.</p>
<details class="ex"><summary>냉각 모델을 끝까지 — 커피 90 °C, 실온 20 °C, 10분 뒤 60 °C. 40 °C가 되는 때는?</summary><div class="body"><p>① 설정 \\(T'=-k(T-20)\\) ② 해법(9/4 변수분리): \\(T-20=Ce^{{-kt}}\\), \\(T(0)=90\\) → \\(C=70\\). \\(T(10)=60\\) → \\(70e^{{-10k}}=40\\) → \\(k=\\dfrac{{\\ln(70/40)}}{{10}}=0.056\\)/min ③ 해석: \\(70e^{{-kt}}=20\\) → \\(t=\\dfrac{{\\ln3.5}}{{0.056}}\\approx22\\)분. "몇 분 뒤"라는 물리적 답이 나와야 모델화가 끝난다.</p></div></details>
<div class="analogy">통장 이자: 잔고가 많을수록 이자가 많이 붙는다 → "잔고의 변화율 ∝ 잔고" → \\(y'=ry\\). 냉각·붕괴·성장이 전부 이 한 문장의 변주다.</div>
<div class="memo"><b>외울 것</b> 냉각 \\(T'=-k(T-T_a)\\) · 낙하 \\(mv'=mg-kv\\) · 부호: 줄어드는 양은 −k, 늘어나는 양은 +k</div>
</section>

<section class="s" data-id="s3">
<h2>3. 미분방정식 · ODE와 PDE · 계(order)</h2>
{fig_tree}
<div class="formula">\\[\\text{{ODE: }}y'=\\cos x,\\quad y''+9y=e^{{-2x}},\\quad y'y^{{\\prime\\prime\\prime}}-\\tfrac32y'^2=0\\qquad \\text{{PDE: }}\\frac{{\\partial^2u}}{{\\partial x^2}}+\\frac{{\\partial^2u}}{{\\partial y^2}}=0\\]</div>
<div class="why"><b>계(order)</b> = 식에 나오는 <b>가장 높은 도함수의 차수</b>. \\(y''\\)이 있으면 2계. 거듭제곱과 헷갈리지 말 것 — \\((dy/dx)^3\\)은 1계 도함수의 세제곱이라 <b>1계</b>다(슬라이드 강조). 계가 \\(n\\)이면 \\(n\\)번 적분해야 하므로 적분상수가 \\(n\\)개 → 조건도 \\(n\\)개 필요(9/4에서 다시).</div>
<div class="pitfall">\\((y')^3+y=x\\)는 1계 <b>비선형</b>. "3"은 계가 아니라 거듭제곱. 계는 "몇 번 미분했나", 선형/비선형은 "y 쪽이 1차식인가" — 서로 다른 질문이다.</div>
<p>위 예의 계: \\(y'=\\cos x\\)는 1계, \\(y''+9y=e^{{-2x}}\\)는 2계, \\(y'y^{{\\prime\\prime\\prime}}-\\tfrac32y'^2=0\\)은 3계(가장 높은 것이 \\(y^{{\\prime\\prime\\prime}}\\)). <b>해(solution)</b>란 대입했을 때 식이 항등식이 되는 함수 \\(y(x)\\): \\(y=\\sin x\\)를 \\(y'=\\cos x\\)에 넣으면 \\(\\cos x=\\cos x\\) — 해다. 해를 구하는 것 = 그런 함수를 찾는 것.</p>
<div class="analogy">ODE는 시간(또는 위치) 한 줄 위에서 변하는 양, PDE는 판 위(공간+시간)에서 변하는 양. 막대의 온도 분포처럼 "어디서·언제"가 둘 다 필요하면 PDE.</div>
<div class="memo"><b>외울 것</b> ODE = 독립변수 1개 · PDE = ∂ · 계 = 최고 도함수의 차수(거듭제곱 아님)</div>
</section>

<section class="s" data-id="s4">
<h2>4. 양함수·음함수 형태 / 선형 vs 비선형 ★</h2>
<p>1계 ODE는 \\(F(x,y,y')=0\\)(<b>음함수 형태</b>)로 쓰거나, \\(y'\\)에 대해 풀어 \\(y'=f(x,y)\\)(<b>양함수 형태</b>)로 쓴다. 예: \\(x^2y'-y-1=0\\)(음함수) ↔ \\(y'=\\dfrac{{y+1}}{{x^2}}\\)(양함수). 풀이는 대개 양함수 형태에서 시작한다.</p>
<table><tr><th>식</th><th>계</th><th>선형?</th><th>이유</th></tr>
<tr><td>\\(y'+2xy=e^x\\)</td><td>1</td><td>선형</td><td>\\(y,y'\\) 1제곱, 계수 \\(2x\\)는 \\(x\\)만의 함수</td></tr>
<tr><td>\\(y''+y=0\\)</td><td>2</td><td>선형</td><td>상수계수</td></tr>
<tr><td>\\((y')^3+y=x\\)</td><td>1</td><td>비선형</td><td>\\(y'\\)의 세제곱</td></tr>
<tr><td>\\(yy'=x\\)</td><td>1</td><td>비선형</td><td>\\(y\\)와 \\(y'\\)의 곱(계수에 \\(y\\))</td></tr>
<tr><td>\\(y''+\\sin y=0\\)</td><td>2</td><td>비선형</td><td>\\(\\sin y\\) — \\(y\\)의 비선형 함수</td></tr>
<tr><td>\\((y')^2=x\\)</td><td>1</td><td>비선형</td><td>\\(y'\\)의 제곱</td></tr></table>
{fig_lin}
<div class="formula">\\[\\text{{선형 1계의 표준형: }}y'+p(x)\\,y=r(x)\\qquad(\\text{{y 쪽은 1차, 계수는 x 만}})\\]</div>
<div class="why">선형이면 <b>공식으로 한 방에</b> 풀린다(1.5절). 비선형은 일반 해법이 없어 형태별 기술(변수분리·치환)로만 푼다. 그래서 교수님은 문제를 풀기 전에 늘 "선형이야 비선형이야?"부터 묻는다(9/4 녹음).</div>
<div class="analogy">선형은 "재료를 그냥 섞기만 한 요리" — 두 해를 더해도 해가 된다(2장 중첩 원리). 비선형은 재료끼리 반응해서(곱·제곱·sin) 섞은 결과가 예측 안 되는 요리.</div>
<div class="memo"><b>외울 것</b> 선형 = \\(y,y',y''\\) 각각 1제곱 + 계수는 \\(x\\)만 · 비선형 신호: \\(y^2\\), \\(yy'\\), \\((y')^3\\), \\(\\sin y\\), \\(e^y\\)</div>
</section>

<section class="s" data-id="s5">
<h2>5. 해(solution)란 — 가족 하나</h2>
{fig_family}
<div class="why">미분방정식의 해는 대입하면 등식이 성립하는 함수 \\(y(x)\\). 적분상수 때문에 해는 하나가 아니라 <b>매개변수 \\(c\\)를 가진 가족</b>(일반해)이고, 조건(초기값)이 그중 하나(특수해)를 고른다. 이것이 9/4 첫 주제.</div>
<details class="ex"><summary>해 확인하기 — \\(y=ce^{{-x/2}}\\)는 \\(y'=-\\tfrac12y\\)의 해인가?</summary><div class="body"><p>\\(y'=-\\tfrac12ce^{{-x/2}}=-\\tfrac12y\\) ✓ — 어떤 \\(c\\)든 성립하므로 일반해. \\(y(0)=3\\)을 붙이면 \\(c=3\\), 특수해 \\(y=3e^{{-x/2}}\\)(그림의 빨간 곡선). "해인지 확인"은 대입 한 줄 — 시험에서 답을 검산하는 습관의 출발점.</p></div></details>
<div class="memo"><b>외울 것</b> 해 = 대입하면 항등식 · 일반해(상수 \\(c\\)) → 초기조건 → 특수해 · <b>다음 시간(9/4)</b> 해의 종류 → 초기값 문제 → 1.3 변수분리형 → 동차형 치환 · 1주차 과제 1.3 #6·7·8·16·17</div>
<div class="analogy">"\\(y'=y\\)의 해는?" 하고 물으면 답은 \\(e^x\\) 하나가 아니라 \\(ce^x\\) 전부 — 사진 한 장이 아니라 앨범이다.</div>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · ODE와 PDE</div><div class="qb">상미분방정식(ODE)과 편미분방정식(PDE)을 가르는 기준은?</div><ol class="choices"><li data-ok="1">독립변수의 개수 — 하나면 ODE, 둘 이상이면 PDE</li><li>계(order) — 1계면 ODE, 2계 이상이면 PDE</li><li>선형이면 ODE, 비선형이면 PDE</li><li>해가 있으면 ODE, 없으면 PDE</li></ol><div class="ans">\\(u(x,t)\\)처럼 두 변수로 미분(∂)하면 PDE. 이 과목은 전부 ODE.</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 계</div><div class="qb">\\((y')^3+y=x\\)의 계는?</div><ol class="choices"><li data-ok="1">1계</li><li>3계</li><li>2계</li><li>0계</li></ol><div class="ans">최고 도함수는 \\(y'\\)(1계). 세제곱은 계와 무관 — 대신 비선형.</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 선형 판별</div><div class="qb">다음 중 <b>선형</b>인 것은?</div><ol class="choices"><li data-ok="1">\\(y'+2xy=e^x\\)</li><li>\\(yy'=x\\)</li><li>\\(y''+\\sin y=0\\)</li><li>\\((y')^2=x\\)</li></ol><div class="ans">계수에 \\(x\\)가 있어도 \\(y\\) 쪽이 1차면 선형. 2·3·4는 \\(yy'\\), \\(\\sin y\\), \\((y')^2\\) 때문에 비선형.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 모델화 3단계</div><div class="qb">모델화의 올바른 순서는?</div><ol class="choices"><li data-ok="1">모델 설정 → 해법 → 해석</li><li>해법 → 모델 설정 → 해석</li><li>해석 → 해법 → 모델 설정</li><li>모델 설정 → 해석 → 해법</li></ol><div class="ans">물리 → 식 → 해 → 뜻. 9/4 방사능 붕괴 예제가 이 순서.</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 뉴턴 냉각</div><div class="qb">뉴턴의 냉각 법칙을 식으로 쓰면? (\\(T_a\\)는 주위 온도)</div><ol class="choices"><li data-ok="1">\\(\\dfrac{{dT}}{{dt}}=-k(T-T_a)\\)</li><li>\\(\\dfrac{{dT}}{{dt}}=k(T-T_a)\\)</li><li>\\(\\dfrac{{dT}}{{dt}}=-kT_a\\)</li><li>\\(T=-kt\\)</li></ol><div class="ans">온도 차에 비례해 <b>줄어든다</b>(−). 2번은 갈수록 더 뜨거워지는 식.</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 분류</div><div class="qb">다음 셋을 계·선형/비선형으로 분류하라: (a) \\(y''+9y=e^{{-2x}}\\) (b) \\(y'y^{{\\prime\\prime\\prime}}-\\tfrac32y'^2=0\\) (c) \\(x^2y'+y^2=0\\)</div><div class="ans">(a) 2계 선형 (b) 3계 비선형(\\(y'y^{{\\prime\\prime\\prime}}\\), \\(y'^2\\)) (c) 1계 비선형(\\(y^2\\)). 계는 최고 도함수, 선형은 y 쪽 1차식.</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
