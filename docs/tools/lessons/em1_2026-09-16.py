# -*- coding: utf-8 -*-
"""공업수학1 · 2026-09-16 수업 노트 (근거: 2026-09-16/정리.md — 녹음 64분·판서 9장·슬라이드 p.7~19, 식은 판서로 대조 완료)"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\공업수학1\_수업노트\2026-09-16.html"

fig_b1 = canvas(560, 160,
    fbox(14, 30, 150, 56, "xy′ + y = 1/y²", INK, sub="÷x → y′ + (1/x)y = (1/x)y⁻²", size=14), arrow(166, 58, 200, 58, GREEN, "", 2), text(183, 46, "a = −2", 11.5, GREEN, "middle", True),
    fbox(204, 30, 120, 56, "u = y³", BLUE, sub="u′ = 3y²y′", size=15), arrow(326, 58, 360, 58, GREEN, "", 2),
    fbox(364, 30, 186, 56, "u′ + (3/x)u = 3/x", RED, sub="「착한」 선형 — 또는 변수분리", size=14),
    arrow(457, 88, 457, 108, GREEN, "", 2), fbox(330, 110, 220, 40, "u = 1 + c/x³  →  y³ = 1 + c/x³", RED, size=13.5),
    text(165, 134, "두 길: 변수분리 du/(u−1) = −3dx/x · 선형 공식 h = 3 ln x", 11, GRAY, "middle"),
    cap="연습 1 — 전형적인 베르누이. 마지막에 u 를 y 로 되돌린다.")

fig_sub = canvas(560, 150,
    fbox(14, 26, 250, 50, "(2) y′ = (x + y + 2)²", INK, sub="u = x + y + 2 → u′ = 1 + y′ = 1 + u²", size=14),
    arrow(139, 78, 139, 98, GREEN, "", 1.8), fbox(14, 100, 250, 40, "∫du/(1+u²) = ∫dx → tan⁻¹u = x + c", BLUE, size=12.5),
    fbox(296, 26, 250, 50, "(3) y′ = 1 + e^(y − x + 3)", INK, sub="u = y − x + 3 → u′ = y′ − 1 = e^u", size=14),
    arrow(421, 78, 421, 98, GREEN, "", 1.8), fbox(296, 100, 250, 40, "∫e^(−u)du = ∫dx → −e^(−u) = x + c", BLUE, size=12.5),
    cap="연습 2·3 — 식 안의 덩어리를 통째로 u 로 놓으면 변수분리형이 된다. 베르누이 꼴은 아니다.")

fig_sum = canvas(560, 250,
    fbox(16, 20, 250, 40, "① 변수분리  g(y)dy = f(x)dx", GREEN, size=13), fbox(16, 66, 250, 40, "② 동차  y = ux (또는 x = vy)", GREEN, size=13),
    fbox(16, 112, 250, 40, "③ 완전미방  M_y = N_x → u = c", GREEN, size=13), fbox(16, 158, 250, 40, "   완전 아니면 적분인자 F(x)·F(y)", GRAY, size=12.5),
    fbox(294, 20, 250, 40, "④ 선형  y′ + py = r → 공식", RED, size=13), fbox(294, 66, 250, 40, "⑤ 베르누이  u = y^(1−a) → ④", RED, size=13),
    fbox(294, 112, 250, 40, "⑥ 치환  dy/dx = f(ax + by + c)", RED, size=13),
    text(419, 178, "u = ax + by + c", 12, GRAY, "middle"),
    text(280, 228, "「1장이 다 끝났다」 — 형태를 보고 어느 칸인지 고르는 것이 실력의 반", 12.5, INK, "middle", True),
    cap="1장 해법 총정리(슬라이드 p.10 표). 시험 문제는 이 여섯 중 하나로 풀린다.")

fig_super = canvas(560, 200,
    arrow(60, 170, 300, 170, BLUE, "", 2.4), text(300, 190, "y₁ 방향", 12, BLUE, "middle"), arrow(60, 170, 150, 40, RED, "", 2.4), text(120, 34, "y₂ 방향", 12, RED, "middle"),
    line(150, 40, 390, 40, GRAY, 1.2, "4 3"), line(300, 170, 390, 40, GRAY, 1.2, "4 3"),
    arrow(60, 170, 390, 40, GREEN, "", 3), text(262, 128, "c₁y₁ + c₂y₂", 14, GREEN, "middle", True),
    text(180, 182, "c₁y₁", 12, BLUE, "middle"), text(80, 100, "c₂y₂", 12, RED, "end"),
    text(470, 90, "해의 중첩 원리", 13.5, INK, "middle", True), text(470, 112, "해끼리 더해도 해,", 12.5, INK, "middle"), text(470, 130, "상수배도 해", 12.5, INK, "middle"),
    text(470, 160, "제차 선형에만!", 13, RED, "middle", True),
    cap="판서 ④의 그림: 두 해 y₁, y₂ 가 만드는 평행사변형 안이 전부 해(해 공간). 비제차·비선형에서는 무너진다.")

X1 = lambda x: 60 + (x + 2) * 55; Y1 = lambda y: 160 - y * 18
fig_indep = canvas(560, 190,
    axis(60, 160, 300, 160, "x", "y") + arrow(60, 160, 60, 20, INK, "", 1.5),
    fplot(lambda x: math.exp(x), -2, 2.1, X1, Y1, color=BLUE, w=2.4, ylim=(0, 7.5)), fplot(lambda x: math.exp(-x), -2.1, 2, X1, Y1, color=RED, w=2.4, ylim=(0, 7.5)),
    text(200, 36, "y₁ = eˣ", 13, BLUE, "start", True), text(70, 40, "y₂ = e⁻ˣ", 13, RED, "start", True),
    text(430, 50, "y₁/y₂ = e^(2x)  — 상수 아님", 13.5, INK, "middle", True), text(430, 74, "→ 비례 관계 X → 1차독립 → 기저", 13, GREEN, "middle", True),
    text(430, 110, "y₁ = eˣ, y₂ = 3eˣ 라면 y₁/y₂ = 1/3", 12.5, GRAY, "middle"), text(430, 130, "→ 비례 → 1차종속 (기저 못 됨)", 12.5, RED, "middle"),
    text(430, 166, "「비례하면 종속, 안 하면 독립」 (교수 정정)", 12, INK, "middle"),
    cap="1차독립 판별: 두 해의 비가 상수인지 본다. 기저가 있어야 일반해 c₁y₁ + c₂y₂ 가 「모든」 해를 덮는다.")

fig_red = canvas(560, 150,
    fbox(14, 30, 120, 56, "y₁ 을 안다", INK, sub="예: y₁ = x", size=14), arrow(136, 58, 170, 58, GREEN, "", 2),
    fbox(174, 30, 120, 56, "y₂ = u·y₁", BLUE, sub="u 를 찾는다", size=14), arrow(296, 58, 330, 58, GREEN, "", 2),
    fbox(334, 20, 216, 76, "y₂ = y₁ ∫ (1/y₁²)·e^(−∫p dx) dx", RED, sub="☆ 판서 ⑧·⑨ (지수에 − 있음)", size=13.5),
    text(280, 130, "2계 식이 u′ 에 대한 1계 식으로 「낮아진다」 — 그래서 차수축소", 12.5, GRAY, "middle"),
    cap="차수축소법. 표준형에서 p(x) 를 읽고 공식에 넣는다. 예제 1 은 설정까지, 계산은 9/18.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>공업수학1 · 9/16 베르누이 연습 · 1장 총정리 · 2.1 2계 선형 ODE</title></head><body>
<header>
<h1>1장을 닫고 2장을 열다 — 베르누이 연습, 해법 총정리, 중첩 원리와 기저</h1>
<p class="lead">앞 20분은 지난 시간 예고한 <b>베르누이·치환 연습 3제</b>, 그다음 "1장이 다 끝났다"며 <b>해법 여섯 가지</b>를 한 표로 정리했다. 후반은 <b>2.1 2계 선형 ODE</b>: 표준형, 제차만 성립하는 <b>중첩 원리</b>, 초기값 문제(조건 2개), <b>1차독립·기저</b>(교수님이 정정한 판별), 그리고 <b>차수축소법</b> 공식까지. 진도가 빠른 이유도 말했다 — 중간까지 실질 7주.</p>
<p class="meta"><span>녹음 64분(앞 3분 누락)</span><span>판서 9장 대조 완료</span><span>슬라이드 p.7~19</span><span>3주차 · 수 · 과제 1.5 #23·#28</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 베르누이 복습 + 연습 1 (전형)</h2>
<p>복습: 표준형 \\(y'+p(x)y=r(x)\\) → \\(h=\\int p\\,dx\\), \\(y=e^{{-h}}[\\int e^hr\\,dx+c]\\). 베르누이 \\(y'+p(x)y=g(x)y^a\\)는 \\(a=0,1\\)이면 선형, 아니면 <b>\\(u=y^{{1-a}}\\)</b> 치환으로 선형이 된다.</p>
<div class="say">"꼭 \\(y^{{1-a}}\\)로 치환해야 되느냐, 꼭 그렇지는 않아요. <b>형태를 따라서 여러분들이 취사선택</b>을 해야 돼요."</div>
{fig_b1}
<details class="ex" open><summary>연습 1 \\(xy'+y=1/y^2\\) — 교수님 순서 그대로</summary><div class="body"><p>① \\(1/y^2\\) → 비선형. \\(x\\)로 나눠 표준형 \\(y'+\\frac1xy=\\frac1xy^{{-2}}\\) → \\(a=-2\\). ② \\(u=y^{{1-(-2)}}=y^3\\), \\(u'=3y^2y'=3y^2\\big(-\\frac yx+\\frac{{y^{{-2}}}}x\\big)=-\\frac{{3y^3}}x+\\frac3x\\) → ③ <b>\\(u'+\\frac3xu=\\frac3x\\)</b> — "아침에 배웠던 착한 형태". ④ (a) 변수분리 \\(\\frac{{du}}{{u-1}}=-\\frac{{3\\,dx}}x\\) → \\(\\ln|u-1|=-3\\ln x+c\\) → \\(u-1=c/x^3\\). (b) 선형 공식 \\(h=3\\ln x\\), \\(u=x^{{-3}}[\\int x^3\\cdot\\frac3x\\,dx+c]=x^{{-3}}[x^3+c]\\). 같은 답. ⑤ 되돌리기 <b>\\(y^3=1+c/x^3\\)</b>.</p></div></details>
<div class="say">"착한 선형 1계 미방으로 풀어도 되고 변수분리로 풀어도 된다. 여러분들이 선택해서 하는 거예요." · "해를 구할 때는 <b>예쁘게 좀 정리</b>를 해보는 게 좋죠. 정리하면 강점이 되겠지."</div>
<div class="why">치환의 목적은 "\\(y^{{-2}}\\)이 붙은 비선형"을 "\\(u\\)의 1차식"으로 바꾸는 것. \\(u'\\) 계산에 원래 식의 \\(y'\\)을 대입하는 것이 핵심 한 줄이고, 판서에서 \\(-\\frac1x\\) 항의 \\(y\\)를 생략해 적었으니 필기는 \\(-\\frac1xy\\)로 고쳐 둘 것.</div>
<div class="analogy">외국 돈(\\(y\\))으로는 계산이 안 되는 가게 — 환전(\\(u=y^3\\))해서 계산하고, 나올 때 다시 환전(\\(y=u^{{1/3}}\\))한다. 환전을 안 하고 나오면 답이 아니다.</div>
<div class="memo"><b>외울 것</b> \\(u=y^{{1-a}}\\) · \\(u'\\)에 원식의 \\(y'\\) 대입 · 선형 또는 변수분리 · 되돌리기 · 연습 1 답 \\(y^3=1+c/x^3\\)</div>
</section>

<section class="s" data-id="s2">
<h2>2. 연습 2·3 — 덩어리를 통째로 치환</h2>
{fig_sub}
<div class="formula">\\[(2)\\ \\tan^{{-1}}(x+y+2)=x+c\\ \\Rightarrow\\ y=\\tan(x+c)-x-2\\qquad (3)\\ -e^{{-(y-x+3)}}=x+c\\ \\Rightarrow\\ e^{{-(y-x+3)}}+x+c=0\\]</div>
<div class="why">(2)는 \\(y^2\\)이 있어 비선형이지만 \\(x+y+2\\)가 한 덩어리로만 나온다 → \\(u\\)로 놓으면 \\(u'=1+y'\\)이 \\(1+u^2\\)로 닫힌다. (3)도 지수 안 덩어리 \\(y-x+3\\). 이것이 슬라이드 표의 ⑥ 치환형 \\(y'=f(ax+by+c)\\). "굉장히 간단해지죠."</div>
<div class="say">정리(19:04): "1번 = 전형 베르누이, 2번 = 치환 후 변수분리(베르누이 꼴 아님), 3번 = 치환." · "지난번 숙제에서는 베르누이는 안 내줬죠" → 이번 과제에 포함.</div>
<div class="analogy">긴 문장에서 반복되는 구절을 "그것"으로 줄여 부르면 문장이 짧아지듯, 반복되는 덩어리를 \\(u\\)로 부르면 식이 한 변수짜리가 된다.</div>
<div class="memo"><b>외울 것</b> \\(y'=f(ax+by+c)\\) → \\(u=ax+by+c\\), \\(u'=a+by'\\) · 적분상수는 한쪽에 · 과제 1.5 #23(베르누이) · #28(\\(y^2=z\\) 치환)</div>
</section>

<section class="s" data-id="s3">
<h2>3. 1장 해법 총정리 — "1장이 다 끝났다"</h2>
{fig_sum}
<table><tr><th>#</th><th>형태</th><th>방법</th></tr>
<tr><td>①</td><td>\\(x\\)는 \\(x\\)끼리, \\(y\\)는 \\(y\\)끼리 갈라짐</td><td>변수분리 → 양변 적분</td></tr>
<tr><td>②</td><td>갈라지진 않지만 각 항이 동차</td><td>\\(u=y/x\\)(또는 \\(x=vy\\)) → ①</td></tr>
<tr><td>③</td><td>\\(M\\,dx+N\\,dy=0\\), \\(M_y=N_x\\)</td><td>\\(u(x,y)=c\\); 아니면 적분인자 \\(R=\\frac1Q(P_y-Q_x)\\), \\(\\tilde R=\\frac1P(Q_x-P_y)\\)</td></tr>
<tr><td>④</td><td>\\(y'+py=r\\)</td><td>\\(y=e^{{-h}}[\\int e^hr\\,dx+c]\\), \\(h=\\int p\\,dx\\)</td></tr>
<tr><td>⑤</td><td>\\(y'+py=gy^a\\)</td><td>\\(u=y^{{1-a}}\\) → ④ 또는 ①</td></tr>
<tr><td>⑥</td><td>\\(y'=f(ax+by+c)\\)</td><td>\\(u=ax+by+c\\) → ①</td></tr></table>
<div class="say">"수학도 <b>일정 부분은 외워야</b> 돼요. 핀란드식으로 유도가 중요하다고 배웠겠지만, 일정 부분은 외워야." · "1장이 조금 어려워, 여러 종류가 있어서. 2장으로 가면 오히려 쉬워져요."</div>
<div class="why">외울 것은 셋: 적분인자 공식 2개, 선형 해 공식, 베르누이 치환. 나머지는 "어느 칸인지 알아보는 눈" — 9/11 플로차트가 이 표의 순서다.</div>
<div class="analogy">도구함 여섯 칸. 못(문제)을 보고 망치인지 드라이버인지 고르는 것이 먼저, 쓰는 법은 칸마다 정해져 있다.</div>
<div class="memo"><b>외울 것</b> 여섯 칸 순서 ①~⑥ · 외울 공식: \\(R\\)·\\(\\tilde R\\)·\\(y=e^{{-h}}[\\dots]\\)·\\(u=y^{{1-a}}\\)</div>
</section>

<section class="s" data-id="s4">
<h2>4. 2.1 2계 선형 ODE — 표준형 · 제차/비제차 · 중첩 원리 ★</h2>
<div class="formula">\\[y''+p(x)y'+q(x)y=r(x)\\quad(\\text{{표준형: }}y''\\text{{ 계수 1}}),\\qquad r=0\\ \\text{{제차}},\\ r\\ne0\\ \\text{{비제차}}\\]</div>
<p>예: \\(y''+25y=e^{{-x}}\\cos x\\) 비제차 · \\(xy''+y'+xy=0\\) → \\(x\\)로 나눠 \\(y''+\\frac1xy'+y=0\\) 제차 · \\(yy''+y'^2=0\\) 계수에 \\(y\\), \\(y'\\)의 제곱 → <b>비선형</b>("정말 쉽지가 않아").</p>
{fig_super}
<div class="formula">\\[\\textbf{{정리 1(중첩·선형성의 원리)}}:\\ y_1,y_2\\text{{ 가 제차 선형 ODE의 해이면 }}c_1y_1+c_2y_2\\text{{ 도 해}}\\]</div>
<div class="why">2계는 두 번 적분 → 상수 2개 → 해가 2개(\\(y_1,y_2\\))이고, 그 1차결합 전체가 해 공간. <b>빨간 글씨</b>: 제차 선형에만. 비제차 반례 \\(y''+y=1\\): \\(1+\\cos x\\), \\(1+\\sin x\\)는 각각 해지만 합(\\(2+\\cos x+\\sin x\\))이나 \\(2(1+\\cos x)\\)는 해가 아니다. 비선형 반례 \\(y''y-xy'=0\\): \\(x^2\\), \\(1\\)은 해지만 \\(x^2+1\\), \\(-x^2\\)은 아니다.</div>
<div class="say">"진도가 빠른 이유: 2학기는 추석·10월 휴일이 많아 중간까지 8주 강의가 <b>실질 7주</b>." · 2계 선형의 쓰임: 3학년 <b>진동공학·제어공학 → 로봇</b>, 라플라스 변환, 회로 해석.</div>
<div class="analogy">제차 선형은 "레고": 해 두 개를 붙이거나 늘려도 여전히 조립품(해). 비제차·비선형은 "찰흙": 두 덩이를 합치면 다른 것이 된다.</div>
<div class="memo"><b>외울 것</b> 표준형 \\(y''+py'+qy=r\\) · 중첩 원리는 <b>제차 선형에만</b> · 반례 \\(y''+y=1\\), \\(y''y-xy'=0\\)</div>
</section>

<section class="s" data-id="s5">
<h2>5. 초기값 문제 · 1차독립 · 기저 ★ (교수님 정정)</h2>
<div class="formula">\\[\\text{{IVP: }}y(x_0)=K_0,\\ y'(x_0)=K_1\\qquad \\text{{Ex.4 }}y''+y=0,\\ y(0)=3.0,\\ y'(0)=-0.5:\\ y=c_1\\cos x+c_2\\sin x\\ \\Rightarrow\\ y=3.0\\cos x-0.5\\sin x\\]</div>
<div class="why">상수 2개 → 초기조건 2개(값과 기울기). 공학에서 초기치 = 시간 \\(t=0\\) 문제, 공간이면(\\(x=0\\)과 \\(x=L\\)) <b>경계치 문제</b>(2·3학년). 일반해 \\(c_1y_1+c_2y_2\\)가 "모든 해"이려면 \\(y_1,y_2\\)가 <b>1차독립</b>이어야 하고, 그런 쌍을 <b>기저(basis)</b>·기본계라 한다.</div>
{fig_indep}
<div class="formula">\\[\\text{{1차독립: }}k_1y_1+k_2y_2=0\\ \\Rightarrow\\ k_1=k_2=0\\ \\text{{일 때만}}\\qquad\\Leftrightarrow\\qquad y_1/y_2\\ne\\text{{const}}\\]</div>
<div class="say">(50:14 정정) "비례 관계가 되면 1차 <b>종속</b>이 되고, 비례 관계가 없으면 1차 <b>독립</b>이에요. <b>반대로 얘기했어요.</b>" — 판서 ⑤에 취소선과 별표로 남은 자리.</div>
<details class="ex"><summary>예제 — \\(y''-y=0\\)의 기저임을 보이시오: (a) \\(e^x, e^{{-x}}\\) (b) \\(\\cosh x, \\sinh x\\)</summary><div class="body"><p>(a) 대입하면 각각 해. \\(y_1/y_2=e^{{2x}}\\) 상수 아님 → 독립 → 기저. (b) \\((\\cosh x)''=\\cosh x\\) ✓, \\((\\sinh x)''=\\sinh x\\) ✓. \\(y_1^*/y_2^*=\\coth x\\)(판서는 \\(-k_2/k_1=\\tanh x\\) 꼴) 상수 아님 → 기저. 같은 방정식에 기저가 여럿 있을 수 있다.</p></div></details>
<div class="analogy">지도의 두 축이 같은 방향이면(비례) 평면을 못 덮는다. 서로 다른 방향 두 개(독립)라야 모든 점(모든 해)에 닿는다.</div>
<div class="memo"><b>외울 것</b> IVP 조건 2개 · 비례 → 종속, 비례 아님 → 독립 · 독립인 두 해 = 기저 · Ex.4 \\(3\\cos x-0.5\\sin x\\) · "공수2에서도 1차독립 나온다"</div>
</section>

<section class="s" data-id="s6">
<h2>6. 차수축소법(Reduction of order) — 해 하나를 알면 둘째 해</h2>
{fig_red}
<div class="formula">\\[y_2=u\\,y_1\\ \\Rightarrow\\ u''y_1+u'(2y_1'+py_1)+u\\underbrace{{(y_1''+py_1'+qy_1)}}_{{=0}}=0\\ \\Rightarrow\\ U=u':\\ U'+\\Big(\\frac{{2y_1'}}{{y_1}}+p\\Big)U=0\\ \\Rightarrow\\ \\boxed{{\\,y_2=y_1\\int\\frac{{1}}{{y_1^2}}e^{{-\\int p\\,dx}}dx\\,}}\\]</div>
<div class="why">\\(y_1\\)이 해라서 \\(u\\)의 계수가 0으로 사라지고, \\(u'\\)에 대한 1계 변수분리형만 남는다 — 2계가 1계로 "낮아진다". 적분해 \\(U\\), 다시 적분해 \\(u\\), 곱해서 \\(y_2\\). 이 공식은 9/18 2.2 중근(Case II)과 9/23 오일러-코시 중근에서 그대로 다시 쓰인다.</div>
<details class="ex"><summary>예제 1 \\((x^2-x)y''-xy'+y=0\\), \\(y_1=x\\) — 설정까지(계산은 9/18)</summary><div class="body"><p>표준형: \\(y''-\\dfrac{{x}}{{x^2-x}}y'+\\dfrac{{1}}{{x^2-x}}y=0\\) → \\(p=-\\dfrac{{x}}{{x^2-x}}=-\\dfrac{{1}}{{x-1}}\\), \\(q=\\dfrac{{1}}{{x^2-x}}\\), \\(y_1=x\\), \\(y_1^2=x^2\\). (슬라이드 p.19 답: \\(y_2=x\\ln|x|+1\\).)</p></div></details>
<div class="say">"이 해(\\(y_1\\))를 알면 여기에 집어넣고 \\(y_2\\)를 만들어낼 수 있다." · "이걸 기억하고 있는 게 낫겠죠." · 금요일(9/18)에 유도 다시 + 상수계수로.</div>
<div class="analogy">한쪽 신발(\\(y_1\\))을 찾았으면 짝(\\(y_2\\))은 그 모양에 맞춰 만들 수 있다 — 공식이 그 "맞추는 법".</div>
<div class="memo"><b>외울 것</b> \\(y_2=y_1\\int\\frac1{{y_1^2}}e^{{-\\int p\\,dx}}dx\\)(지수에 −) · 표준형에서 \\(p\\) 읽기 · 과제: 1.5 #23·#28 (2.1 #6·#9는 "한번 해보세")</div>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 연습 1</div><div class="qb">\\(xy'+y=1/y^2\\)의 일반해는?</div><ol class="choices"><li data-ok="1">\\(y^3=1+c/x^3\\)</li><li>\\(y=1+c/x^3\\)</li><li>\\(y^3=1+cx^3\\)</li><li>\\(y^{{-2}}=1+c/x^3\\)</li></ol><div class="ans">\\(u=y^3\\), \\(u'+\\frac3xu=\\frac3x\\) → \\(u=1+c/x^3\\) → 되돌리기. 2번은 되돌리지 않은 것.</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 치환</div><div class="qb">\\(y'=(x+y+2)^2\\)의 일반해는?</div><ol class="choices"><li data-ok="1">\\(\\tan^{{-1}}(x+y+2)=x+c\\)</li><li>\\(\\tan^{{-1}}(x+y+2)=c\\)</li><li>\\(\\ln(x+y+2)=x+c\\)</li><li>\\(x+y+2=ce^x\\)</li></ol><div class="ans">\\(u=x+y+2\\), \\(u'=1+u^2\\) → \\(\\int\\frac{{du}}{{1+u^2}}=\\int dx\\).</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 중첩 원리</div><div class="qb">"두 해의 1차결합도 해"가 성립하는 경우는?</div><ol class="choices"><li data-ok="1">제차 선형 ODE에서만</li><li>모든 선형 ODE(비제차 포함)</li><li>모든 ODE</li><li>비선형 ODE에서만</li></ol><div class="ans">빨간 글씨. \\(y''+y=1\\)(비제차), \\(y''y-xy'=0\\)(비선형)이 반례.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 1차독립</div><div class="qb">두 해 \\(y_1,y_2\\)가 1차독립인지 판별하는 기준은?</div><ol class="choices"><li data-ok="1">\\(y_1/y_2\\)가 상수가 아니면(비례하지 않으면) 독립</li><li>\\(y_1/y_2\\)가 상수이면 독립</li><li>\\(y_1+y_2\\)가 해이면 독립</li><li>\\(y_1y_2=0\\)이면 독립</li></ol><div class="ans">교수님이 정정한 지점: 비례 → 종속, 비례 아님 → 독립.</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · Ex.4</div><div class="qb">\\(y''+y=0\\), \\(y(0)=3.0\\), \\(y'(0)=-0.5\\)의 해는?</div><ol class="choices"><li data-ok="1">\\(y=3.0\\cos x-0.5\\sin x\\)</li><li>\\(y=3.0\\sin x-0.5\\cos x\\)</li><li>\\(y=3.0e^{{x}}-0.5e^{{-x}}\\)</li><li>\\(y=-0.5\\cos x+3.0\\sin x\\)</li></ol><div class="ans">\\(y=c_1\\cos x+c_2\\sin x\\), \\(y(0)=c_1\\), \\(y'(0)=c_2\\).</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 차수축소</div><div class="qb">차수축소법 공식을 쓰고, \\((x^2-x)y''-xy'+y=0\\), \\(y_1=x\\)에서 \\(p(x)\\)와 \\(y_2\\)를 구하라.</div><div class="ans">\\(y_2=y_1\\int\\frac1{{y_1^2}}e^{{-\\int p\\,dx}}dx\\). \\(p=-\\frac{{x}}{{x^2-x}}=-\\frac1{{x-1}}\\) → \\(e^{{-\\int p}}=e^{{\\ln|x-1|}}=x-1\\) → \\(U=\\frac{{x-1}}{{x^2}}=\\frac1x-\\frac1{{x^2}}\\) → \\(y_2=x(\\ln|x|+\\frac1x)=x\\ln|x|+1\\).</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
