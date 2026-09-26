# -*- coding: utf-8 -*-
"""공업수학1 · 2026-09-09 수업 노트 (결석 회차 — 슬라이드 p.29~36 + 교재 Kreyszig 1.4 로 재구성. 근거: 2026-09-09/정리.md · 9/11 정리 ①(정정))"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\공업수학1\_수업노트\2026-09-09.html"

X1 = lambda x: 40 + x * 30; Y1 = lambda y: 170 - y * 30
def _lvl(c, color, w):
    pts = [(X1(2.5 + c * 0.5 * math.cos(a) * 1.6), Y1(2.5 + c * 0.5 * math.sin(a))) for a in [2 * math.pi * i / 60 for i in range(61)]]
    return polyline(pts, color, w)
fig_exact = canvas(560, 200,
    axis(40, 170, 300, 170, "x", "y") + arrow(40, 170, 40, 20, INK, "", 1.5),
    *[_lvl(c, GRAY if c != 2 else RED, 1.4 if c != 2 else 2.6) for c in (1, 2, 3, 4)],
    text(115, 96, "u = 1", 10.5, GRAY, "middle"), text(190, 62, "u = c", 11.5, RED, "middle", True),
    text(430, 50, "M dx + N dy = du", 15, INK, "middle", True), text(430, 76, "M = ∂u/∂x,  N = ∂u/∂y", 13, INK, "middle"),
    text(430, 106, "du = 0  ⇒  u(x, y) = c", 14, RED, "middle", True), text(430, 130, "해 = 어떤 함수 u 의 등고선", 12.5, GRAY, "middle"),
    text(430, 160, "그 u 를 찾는 것이 1.4 의 전부", 12.5, GREEN, "middle", True),
    cap="완전미분방정식의 뜻: 좌변이 어떤 u(x, y) 의 전미분이면, 해는 u = c — 언덕 u 의 등고선이다.")

fig_cases = canvas(560, 210,
    diamond(90, 60, 130, 56, "∂M/∂y = ∂N/∂x ?", INK, 11.5),
    arrow(155, 60, 200, 60, GREEN, "예", 1.8, 0, -6), arrow(90, 88, 90, 150, RED, "아니오", 1.8, 26, 0), fbox(30, 152, 120, 44, "적분인자 F", RED, sub="§4~5 로", size=12.5),
    fbox(204, 36, 150, 48, "Case 1: x 로 적분", BLUE, sub="u = ∫M dx + k(y)", size=12.5), arrow(356, 60, 396, 60, GREEN, "", 1.8),
    fbox(400, 36, 150, 48, "∂u/∂y = N", BLUE, sub="→ k′(y) → k(y)", size=12.5),
    fbox(204, 96, 150, 48, "Case 2: y 로 적분", GRAY, sub="u = ∫N dy + l(x)", size=12.5), arrow(356, 120, 396, 120, GREEN, "", 1.8),
    fbox(400, 96, 150, 48, "∂u/∂x = M", GRAY, sub="→ l′(x) → l(x)", size=12.5),
    arrow(475, 146, 475, 166, GREEN, "", 1.8), fbox(380, 168, 170, 34, "u(x, y) = c  → 검증", RED, size=12.5),
    text(280, 200, "둘 중 적분이 쉬운 쪽을 고른다", 12, GRAY, "middle"),
    cap="판별 → 해 → 검증. 교수님의 Step 형식이 곧 채점 형식(과제 제출용 규칙과 같다).")

fig_if = canvas(560, 170,
    fbox(20, 40, 170, 60, "−y dx + x dy = 0", INK, sub="M_y = −1 ≠ N_x = 1  ✗", size=13),
    arrow(192, 70, 246, 70, GREEN, "", 2.2), text(219, 56, "× F = 1/x²", 12, GREEN, "middle", True),
    fbox(250, 40, 190, 60, "−(y/x²)dx + (1/x)dy = 0", BLUE, sub="M_y = −1/x² = N_x  ✓ 완전", size=13),
    arrow(442, 70, 490, 70, GREEN, "", 2.2), fbox(494, 46, 56, 48, "y/x = c", RED, size=13),
    text(280, 140, "완전이 아닌 식에 어떤 함수 F 를 곱해 완전으로 만든다 — 그 F 가 적분인자", 12.5, GRAY, "middle"),
    cap="Ex.3 적분인자의 뜻. 어려운 것은 「어떤 F 를 곱하나」 — 그래서 한 변수만의 F 를 찾는 정리 1·2 가 있다.")

fig_thm = canvas(560, 190,
    fbox(20, 30, 250, 70, "정리 1 · F = F(x)", GREEN, sub="R(x) = (1/Q)(∂P/∂y − ∂Q/∂x)", size=14), text(145, 118, "F(x) = exp(∫R dx)   ← R 이 x 만의 함수일 때", 12, INK, "middle"),
    fbox(290, 30, 250, 70, "정리 2 · F = F(y)", BLUE, sub="R*(y) = (1/P)(∂Q/∂x − ∂P/∂y)", size=14), text(415, 118, "F*(y) = exp(∫R* dy)   ← R* 이 y 만의 함수일 때", 12, INK, "middle"),
    text(280, 152, "외우는 법: 분모는 「곱해지지 않는 쪽」 — F(x) 면 Q, F(y) 면 P. 괄호 안 부호는 서로 반대", 12, RED, "middle", True),
    text(280, 172, "R 이 x 만의 함수가 아니면 정리 1 포기 → R* 시도", 12, GRAY, "middle"),
    cap="적분인자 공식 두 개(시험 공식). 9/11 교수님 정정: 정리 1 의 분모는 p 가 아니라 q.")

fig_check = canvas(560, 120,
    fbox(20, 30, 130, 56, "u 후보", INK, sub="∫M dx + k(y)", size=14), arrow(152, 58, 196, 58, GREEN, "", 2),
    fbox(200, 30, 150, 56, "∂u/∂x = M ?", BLUE, sub="x 로 미분해 대조", size=13.5), arrow(352, 58, 396, 58, GREEN, "", 2),
    fbox(400, 30, 150, 56, "∂u/∂y = N ?", BLUE, sub="k′ 에 x 가 남으면 오류", size=13.5),
    text(280, 110, "둘 다 ✓ 이면 u(x, y) = c 가 답 — 검산까지가 풀이", 12.5, RED, "middle", True),
    cap="예제 (1)(2)의 검산 틀. 답을 미분해 M, N 으로 돌아오는지 본다.")

fig_ex5 = canvas(560, 150,
    fbox(14, 20, 100, 50, "판별", INK, sub="P_y ≠ Q_x ✗", size=13), arrow(116, 45, 146, 45, GREEN, "", 1.8),
    fbox(150, 20, 110, 50, "R(x) 시도", GRAY, sub="y 남음 ✗", size=13), arrow(262, 45, 292, 45, GREEN, "", 1.8),
    fbox(296, 20, 110, 50, "R*(y) 시도", GREEN, sub="= −1 ✓", size=13), arrow(408, 45, 438, 45, GREEN, "", 1.8),
    fbox(442, 20, 104, 50, "× e^(−y)", GREEN, sub="재검증 ✓", size=13),
    arrow(494, 72, 494, 92, GREEN, "", 1.8), fbox(300, 94, 246, 46, "u = eˣ + xy + e^(−y) = c", RED, sub="y(0) = −1 → c = 1 + e", size=13.5),
    text(150, 122, "판별 → R → R* → 곱하기 → 일반해 → 특수해", 12.5, GRAY, "middle"),
    cap="Ex.5 의 여섯 단계. 정리 1 이 실패한 것을 확인하는 줄도 답안에 쓴다.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>공업수학1 · 9/9 완전상미분방정식 · 적분인자</title></head><body>
<header>
<h1>완전미분방정식 — "어떤 함수 u의 등고선인가", 그리고 적분인자</h1>
<p class="lead">1.3이 "갈라서 적분"이었다면 1.4는 "<b>합쳐서 한 함수로</b>"다. \\(M\\,dx+N\\,dy=0\\)의 좌변이 어떤 \\(u(x,y)\\)의 전미분이면 해는 그냥 \\(u=c\\). 판별은 \\(M_y=N_x\\) 한 줄, 안 되면 <b>적분인자</b>를 곱해 완전으로 만든다(정리 1·2). 이 회차는 결석이라 슬라이드 8장으로 재구성했고, 9/11 첫머리의 교수님 정정을 반영했다.</p>
<p class="meta"><span>결석 회차 · 슬라이드 p.29~36 재구성</span><span>교재 Kreyszig 1.4</span><span>2주차 · 수 · 과제 1.4 #4·11·12</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 완전미분방정식이란 — 전미분 du</h2>
<p>2변수 함수 \\(u(x,y)\\)의 <b>전미분</b>은 \\(du=u_x\\,dx+u_y\\,dy\\). 거꾸로, 어떤 식 \\(M\\,dx+N\\,dy\\)가 딱 이 꼴이면 — 즉 \\(M=\\partial u/\\partial x\\), \\(N=\\partial u/\\partial y\\)인 \\(u\\)가 있으면 — 그 방정식을 <b>완전(exact)</b>하다고 한다.</p>
{fig_exact}
<div class="formula">\\[M(x,y)\\,dx+N(x,y)\\,dy=0\\ \\text{{이 완전}}\\ \\Leftrightarrow\\ M=\\frac{{\\partial u}}{{\\partial x}},\\ N=\\frac{{\\partial u}}{{\\partial y}}\\ \\Rightarrow\\ du=0\\ \\Rightarrow\\ u(x,y)=c\\]</div>
<div class="why">\\(du=0\\)은 "\\(u\\)가 변하지 않는다"이므로 해는 \\(u=\\)상수 — 음함수 꼴의 해가 <b>바로</b> 나온다. 적분이 아니라 "이 식이 어느 함수의 미분인가"를 알아보는 문제로 바뀐 것.</div>
<div class="analogy">등산 지도의 등고선. 언덕 \\(u(x,y)\\)를 알면 "높이가 같은 길"(등고선 \\(u=c\\))이 곧 해 곡선이다. 완전미분방정식은 "이 길들이 어느 언덕의 등고선인가"를 묻는다.</div>
<div class="memo"><b>외울 것</b> 전미분 \\(du=u_xdx+u_ydy\\) · 완전 ⇔ \\(M=u_x,\\ N=u_y\\) · 해 \\(u(x,y)=c\\)</div>
</section>

<section class="s" data-id="s2">
<h2>2. 판별 M_y = N_x 와 해법 Case 1·2 ★</h2>
{fig_cases}
<div class="formula">\\[\\text{{판별: }}\\frac{{\\partial M}}{{\\partial y}}=\\frac{{\\partial N}}{{\\partial x}}\\quad(\\because u_{{xy}}=u_{{yx}})\\qquad \\text{{Case 1: }}u=\\int M\\,dx+k(y),\\ \\frac{{\\partial u}}{{\\partial y}}=N\\Rightarrow k\\qquad \\text{{Case 2: }}u=\\int N\\,dy+l(x),\\ \\frac{{\\partial u}}{{\\partial x}}=M\\Rightarrow l\\]</div>
<div class="why">\\(M=u_x\\)를 \\(x\\)로 적분하면 \\(u\\)가 나오지만 "\\(y\\)만의 함수" \\(k(y)\\)가 적분상수 자리에 남는다(\\(x\\)로 미분하면 사라지므로). 그 \\(k\\)를 두 번째 조건 \\(u_y=N\\)으로 정한다. \\(y\\)로 먼저 적분해도(Case 2) 같은 \\(u\\).</div>
<details class="ex"><summary>Ex.1 \\(\\cos(x+y)\\,dx+(3y^2+2y+\\cos(x+y))\\,dy=0\\)</summary><div class="body"><p><b>Step 1 판별</b>: \\(M_y=-\\sin(x+y)=N_x\\) ✓ 완전. <b>Step 2</b>: \\(u=\\int\\cos(x+y)\\,dx+k(y)=\\sin(x+y)+k(y)\\) → \\(u_y=\\cos(x+y)+k'=N\\) → \\(k'=3y^2+2y\\) → \\(k=y^3+y^2\\). ∴ <b>\\(u=\\sin(x+y)+y^3+y^2=c\\)</b>. <b>Step 3 검증</b>: \\(u\\)를 \\(x\\)로 미분(\\(y=y(x)\\))하면 원식.</p></div></details>
<div class="analogy">퍼즐의 가로 줄(\\(x\\) 적분)을 먼저 맞추면 세로 정보(\\(y\\)만의 조각 \\(k\\))가 비어 있다 — 세로 조건 \\(u_y=N\\)으로 그 조각을 채운다.</div>
<div class="memo"><b>외울 것</b> \\(M_y=N_x\\) → Case 1 \\(u=\\int Mdx+k(y)\\) → \\(u_y=N\\) → \\(k\\) → \\(u=c\\) → 검증 · Step 형식 = 채점 형식</div>
</section>

<section class="s" data-id="s3">
<h2>3. 예제 (1)(2) — 손에 익히기</h2>
<details class="ex"><summary>(1) \\((x^3+y^3)\\,dx+3xy^2\\,dy=0\\)</summary><div class="body"><p>\\(M_y=3y^2=N_x\\) ✓. \\(u=\\int(x^3+y^3)dx+k=\\dfrac{{x^4}}4+xy^3+k(y)\\), \\(u_y=3xy^2+k'=3xy^2\\) → \\(k'=0\\). <b>\\(u=\\dfrac{{x^4}}{{4}}+xy^3=c\\)</b>. 검산 \\(u_x=x^3+y^3\\), \\(u_y=3xy^2\\) ✓.</p></div></details>
<details class="ex"><summary>(2) \\((\\sin y-y\\sin x)\\,dx+(\\cos x+x\\cos y+2y)\\,dy=0\\)</summary><div class="body"><p>\\(M_y=\\cos y-\\sin x=N_x\\) ✓. \\(u=\\int(\\sin y-y\\sin x)dx+k=x\\sin y+y\\cos x+k(y)\\), \\(u_y=x\\cos y+\\cos x+k'=N\\) → \\(k'=2y\\) → \\(k=y^2\\). <b>\\(u=x\\sin y+y\\cos x+y^2=c\\)</b>.</p></div></details>
{fig_check}
<div class="why">두 문제 모두 \\(k'\\)를 구할 때 \\(x\\)가 포함된 항이 <b>정확히 소거</b>된다 — 소거되지 않으면 판별을 잘못했거나 적분 실수다. 이것이 자체 검산.</div>
<div class="analogy">영수증 맞추기: \\(u_y\\)를 계산해 \\(N\\)과 비교했을 때 남는 차이(\\(k'\\))에 \\(x\\)가 있으면 어디선가 잘못 더한 것.</div>
<div class="memo"><b>외울 것</b> \\(k'(y)\\)에 \\(x\\)가 남으면 오류 신호 · 최종 답은 \\(u(x,y)=c\\) 꼴(양함수로 안 풀어도 됨)</div>
</section>

<section class="s" data-id="s4">
<h2>4. 적분인자(integrating factor) — 완전이 아니면 곱해서 완전으로</h2>
{fig_if}
<div class="why">완전이 아닌 식도 적당한 \\(F(x,y)\\)를 곱하면 완전이 될 수 있다(Reduction to Exact Form). Ex.3: \\(-y\\,dx+x\\,dy=0\\)은 \\(M_y=-1\\ne N_x=1\\)이지만 \\(1/x^2\\)을 곱하면 \\(-(y/x^2)dx+(1/x)dy=0\\), \\(M_y=-1/x^2=N_x\\) ✓ → \\(u=y/x=c\\). 문제는 "그 \\(F\\)를 어떻게 찾나".</div>
<div class="analogy">양변에 공통분모를 곱해 분수 방정식을 정리하듯, 알맞은 "곱셈 하나"가 식을 풀 수 있는 모양으로 바꾼다. 무엇을 곱할지 아는 것이 기술.</div>
<div class="memo"><b>외울 것</b> 적분인자 = 곱해서 완전으로 만드는 함수 · \\(-y\\,dx+x\\,dy\\)에는 \\(1/x^2\\) (또는 \\(1/y^2\\), \\(1/(x^2+y^2)\\))</div>
</section>

<section class="s" data-id="s5">
<h2>5. 정리 1·2 — 한 변수만의 적분인자 ★★ (시험 공식)</h2>
<p>일반적인 \\(F(x,y)\\)는 찾기 어렵지만 <b>\\(x\\)만의 함수</b> 또는 <b>\\(y\\)만의 함수</b>인 적분인자는 공식이 있다. 식을 \\(P\\,dx+Q\\,dy=0\\)으로 쓴다.</p>
{fig_thm}
<div class="formula">\\[\\text{{정리 1: }}R(x)=\\frac1Q\\Big(\\frac{{\\partial P}}{{\\partial y}}-\\frac{{\\partial Q}}{{\\partial x}}\\Big),\\ F(x)=e^{{\\int R\\,dx}}\\qquad \\text{{정리 2: }}R^*(y)=\\frac1P\\Big(\\frac{{\\partial Q}}{{\\partial x}}-\\frac{{\\partial P}}{{\\partial y}}\\Big),\\ F^*(y)=e^{{\\int R^*dy}}\\]</div>
<div class="why">유도(정리 1): \\(FP\\,dx+FQ\\,dy=0\\)이 완전 → \\((FP)_y=(FQ)_x\\) → \\(FP_y=F'Q+FQ_x\\) → \\(F'/F=(P_y-Q_x)/Q\\). 좌변이 \\(x\\)만의 함수이므로 우변 \\(R\\)도 \\(x\\)만의 함수여야 한다 — 그래서 "R이 \\(x\\)만의 함수일 때만" 쓸 수 있다. \\(F(y)\\)면 같은 계산에서 분모가 \\(P\\), 괄호 부호가 반대.</div>
<div class="say">9/11 첫머리: "지난 시간에 강의하고 나가는데… 틀린 게 하나 있어요. <b>이게 p가 아니라 q로 고치세요.</b>" — 정리 1(\\(F(x)\\))의 분모를 판서에서 \\(p\\)로 잘못 쓴 것을 \\(q\\)로 정정. 슬라이드 인쇄본은 처음부터 \\(1/Q\\).</div>
<div class="pitfall">필기에 \\(R(x)\\)의 분모가 \\(P\\)로 적혀 있으면 \\(Q\\)로 고칠 것. 외우는 법: 분모는 <b>"곱해지지 않는 쪽"</b> — \\(F(x)\\)는 \\(x\\)로 미분되어 \\(Q\\) 쪽에 붙으니 \\(Q\\)로 나눈다.</div>
<div class="analogy">열쇠 두 개를 순서대로 꽂아 본다: 먼저 \\(x\\)-열쇠(정리 1) — \\(R\\)에 \\(y\\)가 남아 있으면 안 맞는 열쇠. 그러면 \\(y\\)-열쇠(정리 2). 둘 다 안 맞으면 이 수업 범위 밖.</div>
<div class="memo"><b>외울 것</b> \\(R=\\frac1Q(P_y-Q_x)\\), \\(F=e^{{\\int R dx}}\\) · \\(R^*=\\frac1P(Q_x-P_y)\\), \\(F^*=e^{{\\int R^*dy}}\\) · 한 변수만 남아야 적용</div>
</section>

<section class="s" data-id="s6">
<h2>6. Ex.5 — 적분인자 → 일반해 → 초기값 (과제·시험 유형) ★</h2>
<div class="formula">\\[(e^{{x+y}}+ye^y)\\,dx+(xe^y-1)\\,dy=0,\\qquad y(0)=-1\\]</div>
<details class="ex"><summary>풀이 수순: 판별 → R 시도 → 안 되면 R* → 곱해서 재검증 → 일반해 → 특수해</summary><div class="body">
<p><b>Step 1</b> \\(P_y=e^{{x+y}}+e^y+ye^y\\), \\(Q_x=e^y\\) → 다름 → 완전 아님.</p>
<p><b>Step 2</b> \\(R=\\dfrac{{P_y-Q_x}}{{Q}}=\\dfrac{{e^{{x+y}}+ye^y}}{{xe^y-1}}\\) — \\(x\\)만의 함수 아님 → 정리 1 불가. \\(R^*=\\dfrac{{Q_x-P_y}}{{P}}=\\dfrac{{e^y-e^{{x+y}}-e^y-ye^y}}{{e^{{x+y}}+ye^y}}=-1\\) → \\(F^*=e^{{-y}}\\).</p>
<p>곱하면 \\((e^x+y)\\,dx+(x-e^{{-y}})\\,dy=0\\). 검증: \\(\\partial_y(e^x+y)=1=\\partial_x(x-e^{{-y}})\\) ✓.</p>
<p><b>Step 3</b> \\(u=\\int(e^x+y)dx=e^x+xy+k(y)\\), \\(u_y=x+k'=x-e^{{-y}}\\) → \\(k=e^{{-y}}\\). 일반해 <b>\\(e^x+xy+e^{{-y}}=c\\)</b>.</p>
<p><b>Step 4</b> \\(y(0)=-1\\): \\(1+0+e=c\\) → <b>\\(e^x+xy+e^{{-y}}=1+e\\approx3.72\\)</b>.</p></div></details>
{fig_ex5}
<div class="why">정리 1이 실패하면 좌절하지 말고 정리 2로 — 이 문제는 그것을 시험하려고 만든 문제다. \\(R^*=-1\\)처럼 <b>상수</b>가 나오면 그 자체가 "y만의 함수"라 적용 가능.</div>
<div class="analogy">자물쇠 하나에 열쇠 두 개를 순서대로 — 첫 열쇠가 안 맞는 것을 확인하는 것(정리 1 불가 판정)도 답안의 일부다.</div>
<div class="memo"><b>외울 것</b> Ex.5 수순 6단계 · 과제 1.4 #4·11·12도 이 틀 · \\(R^*\\)이 상수면 바로 \\(F^*=e^{{R^*y}}\\)</div>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 판별</div><div class="qb">\\(M\\,dx+N\\,dy=0\\)이 완전미분방정식일 필요충분조건은?</div><ol class="choices"><li data-ok="1">\\(\\partial M/\\partial y=\\partial N/\\partial x\\)</li><li>\\(\\partial M/\\partial x=\\partial N/\\partial y\\)</li><li>\\(M=N\\)</li><li>\\(M_x+N_y=0\\)</li></ol><div class="ans">\\(M=u_x\\), \\(N=u_y\\)이고 \\(u_{{xy}}=u_{{yx}}\\)이므로.</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · Ex.1</div><div class="qb">\\(\\cos(x+y)dx+(3y^2+2y+\\cos(x+y))dy=0\\)의 해는?</div><ol class="choices"><li data-ok="1">\\(\\sin(x+y)+y^3+y^2=c\\)</li><li>\\(\\cos(x+y)+y^3+y^2=c\\)</li><li>\\(\\sin(x+y)+3y^2+2y=c\\)</li><li>\\(\\sin(x+y)=c\\)</li></ol><div class="ans">\\(u=\\int M dx+k(y)\\), \\(k'=3y^2+2y\\). 3번은 \\(k'\\)를 적분하지 않은 것.</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 예제 (1)</div><div class="qb">\\((x^3+y^3)dx+3xy^2dy=0\\)의 해는?</div><ol class="choices"><li data-ok="1">\\(\\dfrac{{x^4}}4+xy^3=c\\)</li><li>\\(x^4+y^4=c\\)</li><li>\\(\\dfrac{{x^4}}4+\\dfrac{{y^4}}4=c\\)</li><li>\\(x^3y^3=c\\)</li></ol><div class="ans">\\(u_x=x^3+y^3\\), \\(u_y=3xy^2\\)로 검산.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 정리 1</div><div class="qb">\\(P\\,dx+Q\\,dy=0\\)에서 \\(x\\)만의 적분인자를 주는 식은?</div><ol class="choices"><li data-ok="1">\\(R=\\dfrac1Q\\Big(\\dfrac{{\\partial P}}{{\\partial y}}-\\dfrac{{\\partial Q}}{{\\partial x}}\\Big)\\), \\(F=e^{{\\int R\\,dx}}\\)</li><li>\\(R=\\dfrac1P\\Big(\\dfrac{{\\partial P}}{{\\partial y}}-\\dfrac{{\\partial Q}}{{\\partial x}}\\Big)\\)</li><li>\\(R=\\dfrac1Q\\Big(\\dfrac{{\\partial Q}}{{\\partial x}}-\\dfrac{{\\partial P}}{{\\partial y}}\\Big)\\)</li><li>\\(R=P_y-Q_x\\)</li></ol><div class="ans">분모는 곱해지지 않는 쪽 \\(Q\\). 9/11 정정 "p가 아니라 q". 3번은 부호가 반대(정리 2의 괄호).</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · Ex.5 적분인자</div><div class="qb">\\((e^{{x+y}}+ye^y)dx+(xe^y-1)dy=0\\)의 적분인자는?</div><ol class="choices"><li data-ok="1">\\(e^{{-y}}\\) (정리 2, \\(R^*=-1\\))</li><li>\\(e^{{x}}\\) (정리 1)</li><li>\\(e^{{y}}\\)</li><li>\\(1/x\\)</li></ol><div class="ans">\\(R\\)은 \\(x\\)만의 함수가 아니어서 정리 1 불가. \\(R^*=-1\\) → \\(F^*=e^{{-y}}\\).</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · Ex.5 특수해</div><div class="qb">위 방정식의 일반해와 \\(y(0)=-1\\)인 특수해를 쓰라.</div><div class="ans">곱한 뒤 \\((e^x+y)dx+(x-e^{{-y}})dy=0\\) → \\(u=e^x+xy+e^{{-y}}=c\\). \\(y(0)=-1\\) → \\(c=1+e\\) → \\(e^x+xy+e^{{-y}}=1+e\\approx3.72\\).</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
