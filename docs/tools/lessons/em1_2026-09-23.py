# -*- coding: utf-8 -*-
"""공업수학1 · 2026-09-23 수업 노트 (근거: 2026-09-23/정리.md — 판서 17장(09:27~10:04). 녹음은 클로바 로그인 만료로 없음. (1) 서로 다른 실근은 사진 이전이라 교재로 보충)"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\공업수학1\_수업노트\2026-09-23.html"

X1 = lambda x: 50 + x * 90; Y1 = lambda y: 160 - y * 14
fig_ec = canvas(560, 190,
    axis(50, 160, 300, 160, "x (> 0)", "y") + arrow(50, 160, 50, 20, INK, "", 1.5),
    fplot(lambda x: x ** 2, 0, 2.6, X1, Y1, color=BLUE, w=2.4, ylim=(0, 9.5)), fplot(lambda x: x ** 3, 0, 2.2, X1, Y1, color=RED, w=2.4, ylim=(0, 9.5)),
    text(300, 68, "x²", 13, BLUE, "start", True), text(252, 40, "x³", 13, RED, "start", True),
    text(430, 50, "x²y″ + axy′ + by = 0", 14.5, INK, "middle", True), text(430, 76, "y = xᵐ 대입 → x 가 전부 빠진다", 12.5, GRAY, "middle"),
    text(430, 104, "m² + (a − 1)m + b = 0", 15, RED, "middle", True), text(430, 126, "보조방정식 (auxiliary equation)", 12, GRAY, "middle"),
    text(430, 158, "(1) 실근 m₁ ≠ m₂ → y = c₁x^m₁ + c₂x^m₂", 12.5, INK, "middle"),
    cap="오일러-코시: 계수가 x², x, 1 로 「차수를 맞춘」 변수계수 방정식. 거듭제곱 xᵐ 이 e^λx 의 자리를 맡는다.")

fig_dbl = canvas(560, 140,
    fbox(14, 26, 130, 56, "중근 m = (1−a)/2", INK, sub="y₁ = x^m 하나뿐", size=13), arrow(146, 54, 178, 54, GREEN, "", 2),
    fbox(182, 26, 130, 56, "y₂ = u·y₁", BLUE, sub="차수축소 (2.1)", size=13.5), arrow(314, 54, 346, 54, GREEN, "", 2),
    fbox(350, 26, 96, 56, "u″x² + u′x = 0", BLUE, sub="→ u′ = 1/x", size=12.5), arrow(448, 54, 480, 54, GREEN, "", 2),
    fbox(484, 26, 66, 56, "u = ln x", RED, size=14),
    text(280, 118, "y = (c₁ + c₂ ln x)·x^((1−a)/2)   —   2.2 의 「x 가 붙는다」가 여기서는 「ln x 가 붙는다」", 12.5, INK, "middle", True),
    cap="(2) 중근 유도의 뼈대. 판서에서 괄호 계산 2xy₁′ + ay₁ 이 정확히 y₁ 이 되어 식이 u″x² + u′x = 0 으로 줄었다.")

X2 = lambda x: 40 + x * 60; Y2 = lambda y: 100 - y * 60
fig_osc = canvas(560, 200,
    axis(40, 100, 540, 100, "x", "y") + arrow(40, 100, 40, 20, INK, "", 1.5),
    fplot(lambda x: math.cos(2 * math.log(x)), 0.25, 8.2, X2, Y2, n=400, color=GREEN, w=2.4),
    text(300, 34, "y = cos(2 ln x)   — 진동하지만 x 가 커질수록 느려진다 (ln x)", 12.5, INK, "middle", True),
    text(300, 186, "x^p 배가 곱해지면 진폭이 x^p 로 커지거나 줄어든다", 12, GRAY, "middle"),
    cap="(3) 복소근 m = p ± iq 의 해 xᵖ cos(q ln x), xᵖ sin(q ln x). 2.2 의 cos qx 에서 x 가 ln x 로 바뀐 꼴.")

fig_flow = canvas(560, 150,
    fbox(14, 20, 200, 50, "보조방정식 m² + (a−1)m + b = 0", INK, size=12.5),
    arrow(214, 45, 250, 45, GREEN, "", 1.8),
    fbox(254, 8, 296, 36, "(1) 실근 둘 → c₁x^m₁ + c₂x^m₂", GREEN, size=12.5),
    fbox(254, 50, 296, 36, "(2) 중근 → (c₁ + c₂ ln x)x^m", BLUE, size=12.5),
    fbox(254, 92, 296, 36, "(3) p ± iq → x^p[c₁cos(q ln x) + c₂sin(q ln x)]", RED, size=12),
    text(114, 100, "예제 (1) m²−4m+4 → 중근 2", 11.5, BLUE, "middle"), text(114, 118, "(2) m²−5m+6 → 2, 3", 11.5, GREEN, "middle"), text(114, 136, "(3) m²+6m+13 → −3 ± 2i", 11.5, RED, "middle"),
    cap="예제 세 개가 세 경우를 하나씩. 4주차 과제 2.5 #3·5·7·13 도 이 흐름.")

fig_W = canvas(560, 170,
    text(120, 40, "W(y₁, y₂) =", 15, INK, "middle", True),
    line(196, 22, 196, 62, INK, 2), line(300, 22, 300, 62, INK, 2), text(222, 36, "y₁", 14, INK, "middle"), text(274, 36, "y₂", 14, INK, "middle"), text(222, 58, "y₁′", 14, INK, "middle"), text(274, 58, "y₂′", 14, INK, "middle"),
    text(400, 42, "= y₁y₂′ − y₂y₁′", 14, INK, "middle"),
    fbox(40, 90, 230, 44, "W ≠ 0  →  1차독립 (기저)  ☆", GREEN, size=13.5), fbox(300, 90, 230, 44, "W = 0  →  1차종속", RED, size=13.5),
    text(280, 156, "eg1) cos ωx, sin ωx: W = ω ≠ 0      eg2) eˣ, xeˣ: W = e^(2x) ≠ 0", 12.5, GRAY, "middle"),
    cap="2.6 론스키안(Wronskian). 비례 판정을 행렬식 하나로 — 판서 별표 자리.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>공업수학1 · 9/23 오일러-코시 방정식 · 론스키안</title></head><body>
<header>
<h1>2.5 오일러-코시 — 지수 대신 거듭제곱, 그리고 2.6 론스키안</h1>
<p class="lead">2.2가 "\\(e^{{\\lambda x}}\\)를 넣어 2차방정식"이었다면, 2.5는 계수가 \\(x^2, x, 1\\)인 방정식에 <b>\\(x^m\\)</b>을 넣어 2차방정식(보조방정식)을 얻는다. 근의 세 경우도 2.2와 짝을 이룬다 — 중근이면 \\(\\ln x\\)가 붙고, 복소근이면 \\(\\cos(q\\ln x)\\). 뒤 15분은 <b>론스키안</b>: 1차독립 판정을 행렬식 하나로. 녹음이 없어 판서 17장으로 정리했고, 첫 사진(09:27) 이전의 (1) 실근 경우는 교재로 보충했다.</p>
<p class="meta"><span>판서 17장 (09:27~10:04)</span><span>녹음 없음</span><span>교재 Kreyszig 2.5·2.6</span><span>4주차 · 수 · 과제 2.5 #3·5·7·13</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 오일러-코시 방정식 — y = xᵐ을 넣는다</h2>
{fig_ec}
<div class="formula">\\[x^2y''+axy'+by=0,\\quad y=x^m:\\ x^2m(m-1)x^{{m-2}}+axmx^{{m-1}}+bx^m=0\\ \\Rightarrow\\ \\boxed{{m^2+(a-1)m+b=0}}\\]</div>
<div class="why">\\(x^m\\)을 미분할 때마다 \\(x\\)의 차수가 하나씩 내려가는데, 계수 \\(x^2, x, 1\\)이 그것을 정확히 되돌려 모든 항이 \\(x^m\\)으로 맞춰진다 → \\(x^m\\)이 빠지고 \\(m\\)의 2차방정식만 남는다. 2.2의 \\(e^{{\\lambda x}}\\)와 같은 원리(미분해도 꼴이 유지되는 함수). (1) 서로 다른 실근 \\(m_1,m_2\\)면 \\(y=c_1x^{{m_1}}+c_2x^{{m_2}}\\) — 이 부분은 사진 이전이라 교재 그대로.</div>
<div class="pitfall">\\(a-1\\)을 잊지 말 것: \\(m(m-1)+am+b\\)에서 \\(-m\\)이 나온다. 표준형으로 나누면 \\(p=a/x\\), \\(q=b/x^2\\)(판서에는 \\(b/x\\)로 적혔으나 \\(x^2\\)으로 나누었으니 \\(b/x^2\\)이 맞다).</div>
<div class="analogy">2.2가 "시간 \\(t\\)로 자라는" 지수 세계라면 2.5는 "배율 \\(x\\)로 자라는" 거듭제곱 세계. \\(x=e^t\\)로 치환하면 실제로 2.2로 돌아간다 — 그래서 결과가 짝을 이룬다.</div>
<div class="memo"><b>외울 것</b> \\(x^2y''+axy'+by=0\\) → \\(m^2+(a-1)m+b=0\\) · (1) \\(c_1x^{{m_1}}+c_2x^{{m_2}}\\) · \\(x&gt;0\\)에서 생각</div>
</section>

<section class="s" data-id="s2">
<h2>2. (2) 중근 — 차수축소로 ln x가 붙는다 (판서 ①·③)</h2>
{fig_dbl}
<div class="formula">\\[m_1=m_2=\\tfrac{{1-a}}{{2}},\\ y_1=x^{{(1-a)/2}}\\quad y_2=uy_1:\\ u''x^2y_1+u'x\\underbrace{{(2xy_1'+ay_1)}}_{{=y_1}}+u\\underbrace{{(x^2y_1''+axy_1'+by_1)}}_{{=0}}=0\\ \\Rightarrow\\ u''x^2+u'x=0\\]</div>
<div class="formula">\\[\\int\\frac{{u''}}{{u'}}=\\int-\\frac1x\\ \\Rightarrow\\ \\ln u'=-\\ln x\\ \\Rightarrow\\ u'=\\frac1x\\ \\Rightarrow\\ u=\\ln x\\qquad\\therefore\\ y=(c_1+c_2\\ln x)\\,x^{{(1-a)/2}}\\]</div>
<div class="why">괄호 계산이 판서의 핵심: \\(2xy_1'+ay_1=2x\\cdot\\tfrac{{1-a}}{{2}}x^{{(-a-1)/2}}+ax^{{(1-a)/2}}=(1-a)x^{{(1-a)/2}}+ax^{{(1-a)/2}}=x^{{(1-a)/2}}=y_1\\). 그래서 식이 \\((u''x^2+u'x)y_1=0\\)으로 줄고 \\(u'=1/x\\). 2.2에서 \\(u''=0\\Rightarrow u=x\\)였던 자리가 여기서는 \\(u=\\ln x\\).</div>
<div class="analogy">2.2의 쌍둥이에게 \\(x\\)라는 명찰을 붙였다면, 거듭제곱 세계의 쌍둥이 명찰은 \\(\\ln x\\). \\(x=e^t\\)로 보면 \\(\\ln x=t\\) — 같은 명찰이다.</div>
<div class="memo"><b>외울 것</b> 중근 \\(m=\\tfrac{{1-a}}2\\) · \\(y=(c_1+c_2\\ln x)x^m\\) · 유도 = 차수축소, \\(2xy_1'+ay_1=y_1\\)</div>
</section>

<section class="s" data-id="s3">
<h2>3. (3) 공액복소근 — x^{{iq}} = cos(q ln x) + i sin(q ln x) ☆ (판서 ④~⑥)</h2>
<div class="formula">\\[m=p\\pm iq:\\ y_{{1,2}}=x^{{p\\pm iq}}=x^p\\,x^{{\\pm iq}},\\qquad x^{{iq}}=e^{{\\ln x^{{iq}}}}=e^{{iq\\ln x}}=\\cos(q\\ln x)+i\\sin(q\\ln x)\\]</div>
<div class="formula">\\[y_3=\\tfrac12y_1+\\tfrac12y_2=x^p\\cos(q\\ln x),\\quad y_4=\\tfrac1{{2i}}y_1-\\tfrac1{{2i}}y_2=x^p\\sin(q\\ln x)\\qquad\\therefore\\ y=x^p\\big[c_1\\cos(q\\ln x)+c_2\\sin(q\\ln x)\\big]\\]</div>
{fig_osc}
<div class="why">\\(x^{{iq}}\\)를 \\(e^{{iq\\ln x}}\\)로 바꾸는 한 줄이 전부(교수님이 판서에 별표). 그다음은 오일러 공식과 선형성의 원리(합·차로 실수 해 만들기) — 9/18 Case III와 완전히 같은 논리, \\(x\\)만 \\(\\ln x\\)로. 그래프는 진동하되 \\(x\\)가 커질수록 느려진다.</div>
<div class="analogy">진동수가 일정한 시계(2.2)와, 갈수록 느려지는 시계(2.5). 눈금이 \\(\\ln x\\)라서 오른쪽으로 갈수록 한 주기가 길어진다.</div>
<div class="memo"><b>외울 것</b> \\(x^{{iq}}=e^{{iq\\ln x}}\\) ☆ · \\(y=x^p[c_1\\cos(q\\ln x)+c_2\\sin(q\\ln x)]\\) · 2.2 Case III에서 \\(x\\to\\ln x\\)</div>
</section>

<section class="s" data-id="s4">
<h2>4. 예제 세 개 — 세 경우 한 번씩 (판서 ⑦~⑨) + 4주차 과제</h2>
{fig_flow}
<details class="ex" open><summary>보조방정식으로 바로</summary><div class="body">
<p><b>(1)</b> \\(x^2y''-3xy'+4y=0\\) → \\(m^2-4m+4=(m-2)^2=0\\) → 중근 2 → <b>\\(y=(c_1+c_2\\ln x)x^2\\)</b>.</p>
<p><b>(2)</b> \\(x^2y''-4xy'+6y=0\\) → \\(m^2-5m+6=(m-2)(m-3)=0\\) → <b>\\(y=c_1x^2+c_2x^3\\)</b>.</p>
<p><b>(3)</b> \\(x^2y''+7xy'+13y=0\\) → \\(m^2+6m+13=0\\) → \\(m=-3\\pm2i\\) → <b>\\(y=x^{{-3}}[c_1\\cos(2\\ln x)+c_2\\sin(2\\ln x)]\\)</b>.</p></div></details>
<div class="why">계산은 2차방정식 하나. 실수는 \\(a-1\\)에서 나온다: (1)은 \\(a=-3\\)이라 \\(a-1=-4\\), (3)은 \\(a=7\\)이라 \\(a-1=6\\). 검산: 중근 공식 \\(m=(1-a)/2=(1+3)/2=2\\) ✓.</div>
<div class="analogy">2.2 예제와 "같은 문제, 다른 옷". 옷(계수의 꼴)만 보고 어느 세계인지 알아채면 나머지는 기계적.</div>
<div class="memo"><b>외울 것</b> (1) 중근 2 (2) 2, 3 (3) \\(-3\\pm2i\\) · <b>4주차 과제 2.5 #3·5·7·13</b>(판서 ⑩, 마감은 과목 규칙대로 다음 주 수요일 수업 전 ❓)</div>
</section>

<section class="s" data-id="s5">
<h2>5. 2.6 론스키안 — 1차독립을 행렬식으로 ☆ (판서 ⑪~⑮)</h2>
{fig_W}
<div class="formula">\\[W(y_1,y_2)=\\begin{{vmatrix}}y_1&y_2\\\\y_1'&y_2'\\end{{vmatrix}}=y_1y_2'-y_2y_1'\\qquad W\\ne0\\ \\Rightarrow\\ \\text{{1차독립(기저)}},\\quad W=0\\ \\Rightarrow\\ \\text{{1차종속}}\\]</div>
<div class="why">9/16의 판별 "비례하면 종속": \\(k_1y_1+k_2y_2=0\\)에서 \\(y_2/y_1=-k_1/k_2\\)(상수)면 \\(y_2=cy_1\\), \\(y_2'=cy_1'\\) → \\(W=y_1cy_1'-cy_1y_1'=0\\). 거꾸로 \\(W\\ne0\\)이면 비례할 수 없다 → 독립. 미분 한 번과 곱셈 둘로 끝나니 비를 직접 살피는 것보다 기계적이다. 일반해 \\(y=c_1y_1+c_2y_2\\)는 \\(y_1,y_2\\)가 기저일 때만 "모든 해"(판서 동그라미 강조).</div>
<details class="ex"><summary>eg1) \\(y''+\\omega^2y=0\\), \\(y_1=\\cos\\omega x\\), \\(y_2=\\sin\\omega x\\) / eg2) \\(y''-2y'+y=0\\)</summary><div class="body"><p>eg1) \\(W=\\begin{{vmatrix}}\\cos\\omega x&\\sin\\omega x\\\\-\\omega\\sin\\omega x&\\omega\\cos\\omega x\\end{{vmatrix}}=\\omega(\\cos^2+\\sin^2)=\\omega\\ne0\\) → 독립. eg2) \\((\\lambda-1)^2=0\\) → \\(y_1=e^x\\), \\(y_2=xe^x\\): \\(W=\\begin{{vmatrix}}e^x&xe^x\\\\e^x&(x+1)e^x\\end{{vmatrix}}=e^{{2x}}(x+1-x)=e^{{2x}}\\ne0\\) → 독립. (판서는 계수 \\(c_1,c_2\\)를 붙였다가 동그라미로 뺐다 — \\(W\\)는 기저 자체로 계산.)</p></div></details>
<div class="analogy">두 벡터가 평행이면 평행사변형 넓이가 0(정역학 외적) — 론스키안은 두 함수 버전의 "넓이". 0이면 같은 방향(종속).</div>
<div class="memo"><b>외울 것</b> \\(W=y_1y_2'-y_2y_1'\\) · \\(W\\ne0\\) ⇔ 독립 ☆ · eg1 \\(W=\\omega\\) · eg2 \\(W=e^{{2x}}\\) · 정리 1~4(존재·유일성)는 슬라이드 대조 때</div>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 보조방정식</div><div class="qb">\\(x^2y''+axy'+by=0\\)에 \\(y=x^m\\)을 넣으면 나오는 식은?</div><ol class="choices"><li data-ok="1">\\(m^2+(a-1)m+b=0\\)</li><li>\\(m^2+am+b=0\\)</li><li>\\(m^2+(a+1)m+b=0\\)</li><li>\\(am^2+bm+1=0\\)</li></ol><div class="ans">\\(m(m-1)+am+b\\). 2번은 2.2의 특성방정식과 혼동.</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 예제 (2)</div><div class="qb">\\(x^2y''-4xy'+6y=0\\)의 일반해는?</div><ol class="choices"><li data-ok="1">\\(y=c_1x^2+c_2x^3\\)</li><li>\\(y=c_1e^{{2x}}+c_2e^{{3x}}\\)</li><li>\\(y=(c_1+c_2\\ln x)x^2\\)</li><li>\\(y=c_1x^{{-2}}+c_2x^{{-3}}\\)</li></ol><div class="ans">\\(m^2-5m+6=(m-2)(m-3)\\).</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 중근</div><div class="qb">\\(x^2y''-3xy'+4y=0\\)의 일반해는?</div><ol class="choices"><li data-ok="1">\\(y=(c_1+c_2\\ln x)x^2\\)</li><li>\\(y=(c_1+c_2x)x^2\\)</li><li>\\(y=(c_1+c_2x)e^{{2x}}\\)</li><li>\\(y=c_1x^2+c_2x^{{-2}}\\)</li></ol><div class="ans">\\((m-2)^2=0\\) → 거듭제곱 세계의 중근은 \\(\\ln x\\)가 붙는다(2번은 2.2식 착각).</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 복소근</div><div class="qb">\\(x^2y''+7xy'+13y=0\\)의 일반해는?</div><ol class="choices"><li data-ok="1">\\(y=x^{{-3}}[c_1\\cos(2\\ln x)+c_2\\sin(2\\ln x)]\\)</li><li>\\(y=e^{{-3x}}[c_1\\cos2x+c_2\\sin2x]\\)</li><li>\\(y=x^{{3}}[c_1\\cos(2\\ln x)+c_2\\sin(2\\ln x)]\\)</li><li>\\(y=x^{{-3}}[c_1\\cos2x+c_2\\sin2x]\\)</li></ol><div class="ans">\\(m^2+6m+13=0\\) → \\(m=-3\\pm2i\\): \\(p=-3\\), \\(q=2\\), 인수는 \\(\\ln x\\).</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 론스키안</div><div class="qb">\\(y_1=\\cos\\omega x\\), \\(y_2=\\sin\\omega x\\)의 론스키안은?</div><ol class="choices"><li data-ok="1">\\(W=\\omega\\) (≠ 0 → 1차독립)</li><li>\\(W=0\\) (1차종속)</li><li>\\(W=\\cos^2\\omega x-\\sin^2\\omega x\\)</li><li>\\(W=1\\)</li></ol><div class="ans">\\(\\omega\\cos^2\\omega x+\\omega\\sin^2\\omega x=\\omega\\).</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · eg2</div><div class="qb">\\(y''-2y'+y=0\\)의 기저를 구하고 론스키안으로 1차독립임을 보여라.</div><div class="ans">\\((\\lambda-1)^2=0\\) → \\(y_1=e^x\\), \\(y_2=xe^x\\). \\(W=e^x(x+1)e^x-xe^x\\cdot e^x=e^{{2x}}\\ne0\\) → 독립 → 일반해 \\((c_1+c_2x)e^x\\).</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
