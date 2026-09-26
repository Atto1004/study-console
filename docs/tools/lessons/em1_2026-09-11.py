# -*- coding: utf-8 -*-
"""공업수학1 · 2026-09-11 수업 노트 (근거: 2026-09-11/정리.md — 녹음 54분·판서 8장·슬라이드 p.1~6)"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\공업수학1\_수업노트\2026-09-11.html"

fig_std = canvas(560, 180,
    fbox(20, 30, 150, 54, "입력 r(x)", GREEN, sub="구동함수 · 힘 · 기전력", size=13.5), arrow(172, 57, 212, 57, INK, "", 2),
    fbox(216, 22, 190, 70, "y′ + p(x)y = r(x)", INK, sub="계(system) — 표준형", size=15), arrow(408, 57, 448, 57, INK, "", 2),
    fbox(452, 30, 98, 54, "출력 y", RED, sub="응답 · 변위 · 전류", size=13.5),
    text(310, 120, "r(x) = 0 → 제차(homogeneous) · r(x) ≠ 0 → 비제차(nonhomogeneous)", 12.5, INK, "middle"),
    text(310, 145, "y′ 에 계수가 붙어 있으면 먼저 나눠서 표준형으로", 12.5, RED, "middle", True),
    cap="선형 1계 ODE 의 공학적 그림: 입력(r)을 넣으면 계(p)가 출력(y)을 내놓는다.")

fig_formula = canvas(560, 150,
    fbox(30, 40, 130, 60, "h = ∫p(x)dx", BLUE, size=15), arrow(162, 70, 202, 70, GREEN, "", 2.2),
    fbox(206, 30, 324, 80, "y = e^(−h) [ ∫ e^h · r(x) dx + c ]", RED, sub="적분인자 F = e^h 를 곱해 완전미분형으로 만든 결과", size=16),
    text(280, 136, "☆ 교수님이 네모로 묶고 별표 — 「이거 하고 이거는 기억을 하라」", 12.5, INK, "middle", True),
    cap="1.5 절의 전부. p 와 r 만 읽어 내면 대입으로 끝난다.")

fig_flow = canvas(560, 250,
    diamond(90, 50, 150, 52, "M dx + N dy = 0 ?", INK, 11.5), arrow(165, 50, 210, 50, GREEN, "예", 1.6, 0, -6),
    diamond(300, 50, 160, 52, "∂M/∂y = ∂N/∂x ?", INK, 11.5), arrow(380, 50, 430, 50, GREEN, "예", 1.6, 0, -6), fbox(434, 32, 116, 36, "완전미방", GREEN, size=12.5),
    arrow(300, 76, 300, 100, RED, "아니오", 1.6, 30, 0),
    diamond(300, 126, 150, 48, "동차인가?", INK, 12), arrow(375, 126, 430, 126, GREEN, "예", 1.6, 0, -6), fbox(434, 108, 116, 36, "y/x = u 치환", GREEN, size=12.5),
    arrow(300, 150, 300, 172, RED, "아니오", 1.6, 30, 0),
    fbox(210, 174, 180, 40, "적분인자 F (시간 많이 걸림)", GRAY, size=12),
    arrow(90, 76, 90, 170, RED, "아니오", 1.6, -32, 0), fbox(20, 174, 140, 40, "y′ + p y = r ?", RED, size=13), arrow(90, 216, 90, 236, GREEN, "", 1.6), text(90, 246, "★ 공식 한 방 (h 구하고 대입)", 12, RED, "middle", True),
    cap="교수님의 판별 순서 — 「머릿속에 그림을 쫙 그려가면서. 플로차트를 그리는 건 어려운 게 아니에요.」")

fig_recip = canvas(560, 150,
    fbox(20, 40, 200, 60, "y′ = 1/(x + y²)", INK, sub="y 에 대해 비선형 (y² 이 분모에)", size=15),
    arrow(222, 70, 282, 70, GREEN, "", 2.2), text(252, 56, "역수를 취한다", 12, GREEN, "middle", True),
    fbox(286, 40, 260, 60, "dx/dy = x + y²  →  x′ − x = y²", RED, sub="x 를 y 의 함수로 보면 선형!  p(y) = −1, r(y) = y²", size=15),
    text(280, 130, "「이것만 봐서는 비선형인데 이렇게 바꿔버리면 선형이 된다」", 12.5, GRAY, "middle"),
    cap="연습 2 의 핵심 기술: 독립변수와 종속변수를 바꿔 본다.")

fig_rl = canvas(560, 220,
    rect(40, 40, 200, 130, INK, fill="none", sw=2.2),
    line(40, 95, 40, 115, "#fff", 6), line(30, 95, 50, 95, INK, 2.5), line(35, 115, 45, 115, INK, 3.5), text(18, 110, "E", 13, INK, "end", True), text(4, 126, "48 V", 11, GRAY, "start"),
    rect(120, 30, 50, 20, INK, fill="#F1F3F5", sw=2), text(145, 22, "R = 11 Ω", 12, INK, "middle"), text(145, 66, "전압강하 iR", 11, GRAY, "middle"),
    path("M240 80 c 12 0 12 14 0 14 c 12 0 12 14 0 14 c 12 0 12 14 0 14", INK, 2.5), text(268, 104, "L = 0.1 H", 12, INK), text(268, 120, "L·di/dt", 11, GRAY),
    arrow(80, 170, 120, 170, GREEN, "i(t)", 2.2, 0, 14),
    axis(330, 180, 540, 180, "t", "i") + arrow(330, 180, 330, 60, INK, "", 1.5),
    fplot(lambda t: 4.36 * (1 - math.exp(-110 * t)), 0, 0.05, lambda t: 330 + t * 4000, lambda i: 180 - i * 24, color=RED, w=2.6),
    line(330, 180 - 4.36 * 24, 540, 180 - 4.36 * 24, GRAY, 1, "4 3"), text(536, 180 - 4.36 * 24 - 6, "E/R = 4.36 A", 11.5, GRAY, "end"),
    text(435, 210, "L·i′ + R·i = E  →  i′ + (R/L)i = E/L", 12.5, INK, "middle", True),
    cap="RL 회로(KVL): 전압강하 합 = 기전력. 독립변수만 t 로 바뀐 같은 선형 공식. 전류는 E/R 로 수렴.")

fig_bern = canvas(560, 140,
    fbox(20, 34, 180, 60, "y′ + p y = g·y^a", INK, sub="a ≠ 0, 1 이면 비선형", size=15), arrow(202, 64, 250, 64, GREEN, "", 2.2), text(226, 24, "u = y^(1−a)", 12, GREEN, "middle", True),
    fbox(254, 34, 200, 60, "u′ + (1−a)p·u = (1−a)g", RED, sub="u 에 대한 비제차 선형 → 공식", size=14), arrow(456, 64, 500, 64, GREEN, "", 2.2), text(478, 50, "되돌리기", 11.5, GREEN, "middle"),
    fbox(504, 40, 46, 48, "y", INK, size=15),
    cap="베르누이 방정식(다음 주 연습). 「u 를 다시 y 로 바꿔야 돼. 이게 끝이 아니죠.」")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>공업수학1 · 9/11 선형 상미분방정식 · 베르누이 예고</title></head><body>
<header>
<h1>1.5 선형 ODE — "이거 하고 이거는 기억을 하라"</h1>
<p class="lead">이 수업의 전부는 상자 하나다: 표준형 \\(y'+p(x)y=r(x)\\)과 해 공식 \\(y=e^{{-h}}[\\int e^hr\\,dx+c]\\), \\(h=\\int p\\,dx\\). 교수님은 이것을 네모로 묶고 별표까지 쳤다. 나머지는 <b>어느 해법을 쓸지 고르는 순서</b>(플로차트), 예제 넷, RL 회로 응용, 그리고 다음 주 베르누이 예고.</p>
<p class="meta"><span>녹음 54분</span><span>판서 8장</span><span>슬라이드 p.1~6</span><span>2주차 · 금 · 과제 1.5 #9·12</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 지난 시간 정정 · 선형이란 · 표준형</h2>
<div class="say">"지난 시간에 강의하고 나가는데… 교수님 틀린 게 하나 있어요. <b>이게 p가 아니라 q로 고치세요.</b>" — 1.4 적분인자 정리 1(\\(F(x)\\))의 분모는 \\(Q\\)(9/9 노트 §5).</div>
<p><b>선형</b> = \\(y\\)와 그 도함수가 1차식으로만("첫 시간에 얘기했죠"). \\(y'+p(x)y=r(x)y^2\\)은 \\(y^2\\) 때문에 비선형. 선형이면 먼저 <b>표준형</b>으로 — \\(y'\\)에 어떤 계수도 붙지 않게 나눈다.</p>
{fig_std}
<div class="why">\\(r(x)\\)는 <b>입력</b>(구동함수: 외부에서 가한 힘·기전력), 해 \\(y\\)는 <b>출력</b>(응답: 변위·전류). 그래서 \\(r=0\\)인 제차는 "외부 입력 없이 계가 스스로 하는 운동", 비제차는 "밀어 줬을 때의 반응"이다.</div>
<div class="analogy">스피커(계 \\(p\\))에 음원(입력 \\(r\\))을 넣으면 소리(출력 \\(y\\))가 난다. 음원이 0이면(제차) 잔향만 남는다.</div>
<div class="memo"><b>외울 것</b> 표준형 \\(y'+p(x)y=r(x)\\) · \\(r=0\\) 제차, \\(r\\ne0\\) 비제차 · \\(r\\)=입력, \\(y\\)=출력</div>
</section>

<section class="s" data-id="s2">
<h2>2. 해 공식 — 제차는 변수분리, 비제차는 이것 하나 ★★</h2>
<div class="formula">\\[\\text{{제차 }}y'=-p(x)y:\\ \\frac{{dy}}{{y}}=-p\\,dx\\ \\Rightarrow\\ y=c\\,e^{{-\\int p\\,dx}}\\]</div>
{fig_formula}
<div class="formula">\\[h=\\int p(x)\\,dx,\\qquad y(x)=e^{{-h}}\\Big[\\int e^{{h}}\\,r(x)\\,dx+c\\Big]\\]</div>
<div class="why">유도(슬라이드 p.3): \\((py-r)dx+dy=0\\)은 완전이 아니지만 정리 1의 \\(R=\\frac1Q(P_y-Q_x)=p\\) → 적분인자 \\(F=e^{{\\int p\\,dx}}=e^h\\). 곱하면 \\((e^hy)'=e^hr\\) → 적분해 \\(e^h\\)로 나눈 것이 공식. 1.4가 1.5의 바탕이라는 뜻.</div>
<div class="say">"<b>이거 하고 이거는 기억을 하라.</b> 이게 기억을 못하는데 이제 못 푸는 거야." · "수학의 <b>일정 부분은 외워야 돼요.</b> 형태를 — 완전미방이냐 동차냐 선형이냐 비제차 선형이냐 — 잘 보고서 나가야 된다." · "유도 과정은 알면 좋지만 필수는 아니다."</div>
<div class="analogy">자판기 공식: 동전 \\(p\\)와 \\(r\\)만 넣으면 \\(y\\)가 나온다. 자판기 내부(유도)는 한 번 들여다보면 되지만, 버튼 위치(공식)는 외워야 한다.</div>
<div class="memo"><b>외울 것</b> \\(h=\\int p\\,dx\\) · \\(y=e^{{-h}}[\\int e^hr\\,dx+c]\\) · 특수 함수 적분(\\(\\int\\tan x=\\ln|\\sec x|\\))은 시험에서 준다</div>
</section>

<section class="s" data-id="s3">
<h2>3. 풀이 흐름도 — 어느 해법을 쓸지 고르는 순서</h2>
{fig_flow}
<div class="say">"이거(적분인자)는 <b>너무 시간이 많이 걸려.</b> 딱 보니까 \\(y'+p(x)y=r(x)\\) 이런 선형 비제차면 <b>공식을 이용하면 된다.</b>" · "머릿속에 그림을 쫙 그려가면서 공부를 해라."</div>
<div class="why">1장은 해법이 여러 개라 "어떤 문제인지 알아보는 눈"이 실력의 반이다. 완전 판별(\\(M_y=N_x\\))은 한 줄이라 먼저 보고, 동차(\\(y/x\\)), 선형 표준형 순으로 체크한다. 9/16에 "1장 해법 총정리"로 다시 정리된다.</div>
<div class="analogy">병원 분류(triage): 증상을 보고 진료과를 정한다. 어느 과인지 맞히면 치료(공식)는 정해져 있다.</div>
<div class="memo"><b>외울 것</b> 완전? → 동차? → 적분인자 → 선형 표준형이면 공식 · 형태를 먼저 본다</div>
</section>

<section class="s" data-id="s4">
<h2>4. 예제 — 별표 예제 1과 연습 3제 ★</h2>
<details class="ex" open><summary>★ 교재 예제 1 \\(y'+y\\tan x=\\sin2x\\), \\(y(0)=1\\) — 판서에 별표</summary><div class="body"><p>\\(p=\\tan x\\), \\(r=\\sin2x=2\\sin x\\cos x\\). \\(h=\\int\\tan x\\,dx=-\\ln\\cos x=\\ln|\\sec x|\\), \\(e^h=\\sec x\\), \\(e^{{-h}}=\\cos x\\).</p><p>\\(y=\\cos x\\Big[\\int\\sec x\\cdot2\\sin x\\cos x\\,dx+c\\Big]=\\cos x\\Big[2\\int\\sin x\\,dx+c\\Big]=\\cos x(-2\\cos x+c)=c\\cos x-2\\cos^2x\\).</p><p>\\(y(0)=c-2=1\\) → \\(c=3\\) → <b>\\(y=3\\cos x-2\\cos^2x\\)</b>.</p></div></details>
<div class="say">"탄젠트 적분이 \\(\\ln\\sec x\\)라는 거, <b>외울 필요는 없어요.</b> 중간·기말에 나오면 <b>내가 공식을 알려줄 거예요.</b>"</div>
{fig_recip}
<details class="ex"><summary>연습 3제 (p.5)</summary><div class="body">
<p><b>1</b> \\(x\\,dy/dx+2y=3\\) → 표준형 \\(y'+\\frac2xy=\\frac3x\\), \\(h=2\\ln x\\), \\(e^h=x^2\\): \\(y=x^{{-2}}[\\int x^2\\cdot\\frac3x\\,dx+c]=x^{{-2}}[\\frac32x^2+c]\\) → <b>\\(y=\\frac32+\\frac c{{x^2}}\\)</b>.</p>
<p><b>2</b> \\(y'=\\frac1{{x+y^2}}\\) → 역수: \\(\\frac{{dx}}{{dy}}=x+y^2\\) → \\(x'-x=y^2\\) (\\(y\\)에 대한 선형). \\(p(y)=-1\\), \\(r(y)=y^2\\), \\(h=-y\\): \\(x=e^{{y}}[\\int e^{{-y}}y^2\\,dy+c]=e^y[-e^{{-y}}(y^2+2y+2)+c]\\) → <b>\\(x=-y^2-2y-2+ce^{{y}}\\)</b>.</p>
<p><b>3</b> \\((1+e^x)y'+e^xy=0\\) → \\(y'+\\frac{{e^x}}{{1+e^x}}y=0\\), \\(h=\\ln(1+e^x)\\), \\(r=0\\) → <b>\\(y=\\frac{{c}}{{1+e^x}}\\)</b>.</p></div></details>
<div class="why">2번이 핵심 기술: \\(y\\)에 대해 풀면 비선형이지만 <b>\\(x\\)를 \\(y\\)의 함수로 보면</b> 선형. 독립변수를 바꿔 보는 눈 — "이것만 봐서는 비선형인데 이렇게 바꿔버리면 선형이 된다".</div>
<div class="analogy">사진을 90° 돌려 보면 다른 그림이 보이듯, \\(x\\)-\\(y\\) 역할을 바꾸면 풀리는 문제가 있다.</div>
<div class="memo"><b>외울 것</b> 예제 1 답 \\(3\\cos x-2\\cos^2x\\) · 연습 2의 역수 기술 · 표준형으로 나누기(연습 1·3) · 과제 1.5 #9·#12 = 같은 유형("굉장히 쉬워")</div>
</section>

<section class="s" data-id="s5">
<h2>5. 공학 응용 — RL 회로</h2>
<p>키르히호프 두 법칙: <b>전류 법칙(KCL)</b> 한 노드에서 들어오는 전류 합 = 나가는 전류 합, <b>전압 법칙(KVL)</b> 폐회로에서 전압강하의 합 = 가해진 기전력.</p>
{fig_rl}
<div class="formula">\\[Li'+Ri=E\\ \\Rightarrow\\ i'+\\frac RLi=\\frac EL,\\quad h=\\frac RLt,\\quad i(t)=e^{{-h}}\\Big[\\int e^{{h}}\\frac EL\\,dt+c\\Big]=\\frac ER+ce^{{-Rt/L}}\\ \\xrightarrow{{i(0)=0}}\\ i(t)=\\frac ER\\big(1-e^{{-Rt/L}}\\big)\\]</div>
<div class="why">저항의 전압강하 \\(iR\\), 코일의 전압강하 \\(L\\,di/dt\\)를 KVL로 더하면 바로 선형 1계. 독립변수가 \\(t\\)일 뿐 \\(p=R/L\\), \\(r=E/L\\)로 "똑같은 공식". \\(R=11\\,\\Omega\\), \\(E=48\\) V, \\(L=0.1\\) H면 \\(E/R=4.36\\) A로 수렴하고 시간상수 \\(L/R\\approx9\\) ms — 최종식은 판서에 없어 슬라이드 Ex.2 흐름으로 아톰이 마무리했다.</div>
<div class="say">"기계공학과인데 회로를 공부해요. … 2학년 혹은 3학년 때 전기전자 과목도 하나 있을 거야."</div>
<div class="analogy">수도꼭지를 확 틀어도 호스 끝의 물줄기는 천천히 세진다 — 코일(L)이 전류의 급변을 막는 "관성"이고, 그래서 지수 곡선으로 올라간다.</div>
<div class="memo"><b>외울 것</b> KVL: \\(Li'+Ri=E\\) · 정상 전류 \\(E/R\\) · 시간상수 \\(L/R\\) · 같은 공식(변수만 \\(t\\))</div>
</section>

<section class="s" data-id="s6">
<h2>6. 베르누이 방정식 예고 — 비선형이지만 치환으로 선형</h2>
{fig_bern}
<div class="formula">\\[y'+p(x)y=g(x)y^a\\ \\xrightarrow{{u=y^{{1-a}}}}\\ u'+(1-a)p(x)\\,u=(1-a)g(x)\\qquad \\text{{예 로지스틱 }}y'=Ay-By^2:\\ u=y^{{-1}},\\ u'+Au=B\\]</div>
<div class="why">\\(a=0,1\\)이면 그냥 선형. 그 외는 비선형이라 일반 해법이 없지만, \\(u=y^{{1-a}}\\)로 놓고 미분(\\(u'=(1-a)y^{{-a}}y'\\))해 대입하면 \\(u\\)에 대한 비제차 선형 — 위 공식으로 풀고 마지막에 \\(u\\)를 \\(y\\)로 되돌린다. 9/16 연습 3제.</div>
<div class="analogy">직접 못 여는 문(비선형)을 옆방(\\(u\\)-세계)으로 돌아가서 열고 다시 돌아온다. 돌아오는 것(되돌리기)까지가 한 세트.</div>
<div class="memo"><b>외울 것</b> 베르누이 \\(u=y^{{1-a}}\\) → 선형 → 되돌리기 · 로지스틱 \\(u=1/y\\) · "1계가 어렵지, 2계로 가면 오히려 쉬워진다"</div>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 해 공식</div><div class="qb">\\(y'+p(x)y=r(x)\\)의 일반해로 옳은 것은? (\\(h=\\int p\\,dx\\))</div><ol class="choices"><li data-ok="1">\\(y=e^{{-h}}\\big[\\int e^{{h}}r\\,dx+c\\big]\\)</li><li>\\(y=e^{{h}}\\big[\\int e^{{-h}}r\\,dx+c\\big]\\)</li><li>\\(y=e^{{-h}}\\int r\\,dx+c\\)</li><li>\\(y=\\int e^{{h}}r\\,dx+c\\)</li></ol><div class="ans">적분인자 \\(e^h\\)를 곱해 \\((e^hy)'=e^hr\\). 부호를 바꾸면 틀린다.</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 연습 1</div><div class="qb">\\(x\\,y'+2y=3\\)의 일반해는?</div><ol class="choices"><li data-ok="1">\\(y=\\dfrac32+\\dfrac{{c}}{{x^2}}\\)</li><li>\\(y=\\dfrac32+cx^2\\)</li><li>\\(y=3+\\dfrac cx\\)</li><li>\\(y=ce^{{-2x}}+\\dfrac32\\)</li></ol><div class="ans">표준형 \\(y'+\\frac2xy=\\frac3x\\), \\(h=2\\ln x\\), \\(e^h=x^2\\).</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 예제 1</div><div class="qb">\\(y'+y\\tan x=\\sin2x\\), \\(y(0)=1\\)의 해는?</div><ol class="choices"><li data-ok="1">\\(y=3\\cos x-2\\cos^2x\\)</li><li>\\(y=\\cos x-2\\cos^2x\\)</li><li>\\(y=3\\cos x+2\\cos^2x\\)</li><li>\\(y=3\\sin x-2\\sin^2x\\)</li></ol><div class="ans">\\(y=c\\cos x-2\\cos^2x\\), \\(y(0)=c-2=1\\).</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 역수 기술</div><div class="qb">\\(y'=\\dfrac{{1}}{{x+y^2}}\\)를 푸는 첫 단계로 옳은 것은?</div><ol class="choices"><li data-ok="1">역수를 취해 \\(dx/dy=x+y^2\\), 즉 \\(x'-x=y^2\\) — \\(y\\)에 대한 선형</li><li>\\(y=ux\\) 치환(동차형)</li><li>변수분리 \\(dy=dx/(x+y^2)\\)</li><li>완전미분방정식 판별 후 적분인자</li></ol><div class="ans">\\(x\\)를 \\(y\\)의 함수로 보면 선형. 결과 \\(x=-y^2-2y-2+ce^y\\).</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · RL 회로</div><div class="qb">\\(Li'+Ri=E\\), \\(i(0)=0\\)의 해는?</div><ol class="choices"><li data-ok="1">\\(i=\\dfrac ER\\big(1-e^{{-Rt/L}}\\big)\\)</li><li>\\(i=\\dfrac ER e^{{-Rt/L}}\\)</li><li>\\(i=\\dfrac EL t\\)</li><li>\\(i=\\dfrac ER\\big(1-e^{{-Lt/R}}\\big)\\)</li></ol><div class="ans">\\(p=R/L\\), \\(r=E/L\\), \\(h=Rt/L\\). 정상값 \\(E/R\\), 지수는 \\(R/L\\)(4번은 뒤집힘).</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 베르누이</div><div class="qb">\\(y'+p(x)y=g(x)y^a\\)를 선형으로 만드는 치환과, 로지스틱 \\(y'=Ay-By^2\\)에 적용한 결과를 쓰라.</div><div class="ans">\\(u=y^{{1-a}}\\) → \\(u'+(1-a)pu=(1-a)g\\). 로지스틱은 \\(a=2\\), \\(u=1/y\\) → \\(u'+Au=B\\)(\\(p=A\\), \\(r=B\\), \\(h=Ax\\)). 마지막에 \\(y=1/u\\)로 되돌린다.</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
