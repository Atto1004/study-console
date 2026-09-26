# -*- coding: utf-8 -*-
"""공업수학1 · 2026-09-18 수업 노트 (결석 회차 — 슬라이드 p.19~26 + 교재 Kreyszig 2.1~2.3 으로 재구성. 근거: 2026-09-18/정리.md)"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\공업수학1\_수업노트\2026-09-18.html"

fig_red = canvas(560, 140,
    fbox(14, 26, 118, 56, "y₁ = x", INK, sub="p = −1/(x−1)", size=14), arrow(134, 54, 166, 54, GREEN, "", 2),
    fbox(170, 26, 150, 56, "U = (1/y₁²)e^(−∫p dx)", BLUE, sub="= (x−1)/x² = 1/x − 1/x²", size=13), arrow(322, 54, 354, 54, GREEN, "", 2),
    fbox(358, 26, 90, 56, "u = ∫U dx", BLUE, sub="ln|x| + 1/x", size=13), arrow(450, 54, 482, 54, GREEN, "", 2),
    fbox(486, 26, 64, 56, "y₂", RED, sub="x ln|x| + 1", size=15),
    text(280, 120, "기저 {x, x ln|x| + 1} → 일반해 y = c₁x + c₂(x ln|x| + 1)", 12.5, INK, "middle", True),
    cap="2.1 Ex.7 마무리 — 9/16 에 설정한 예제 1 의 계산.")

X1 = lambda x: 40 + x * 26; Y1 = lambda y: 150 - y * 18
def panel(ox, title, fn, x0, x1, ylim, color, sub):
    X = lambda x: ox + 10 + (x - x0) / (x1 - x0) * 150; Y = lambda y: 150 - (y - ylim[0]) / (ylim[1] - ylim[0]) * 100
    return (line(ox + 10, 150, ox + 160, 150, GRAY, 1) + line(X(0) if x0 <= 0 <= x1 else ox + 10, 50, X(0) if x0 <= 0 <= x1 else ox + 10, 150, GRAY, 1) +
            fplot(fn, x0, x1, X, Y, color=color, w=2.4, ylim=ylim) + text(ox + 85, 36, title, 12.5, INK, "middle", True) + text(ox + 85, 172, sub, 11.5, GRAY, "middle"))
fig_cases = canvas(560, 185,
    panel(10, "I  서로 다른 실근", lambda x: math.exp(x) + 3 * math.exp(-2 * x), 0, 2.2, (0, 8), RED, "y = eˣ + 3e⁻²ˣ (Ex.2)"),
    panel(195, "II  중근 (x 가 붙는다)", lambda x: (3 - 2 * x) * math.exp(-0.5 * x), 0, 8, (-1.2, 3.2), BLUE, "y = (3 − 2x)e^(−0.5x) (Ex.4)"),
    panel(380, "III  복소근 (진동)", lambda x: math.exp(-0.2 * x) * math.sin(3 * x), 0, 10, (-1, 1), GREEN, "y = e^(−0.2x) sin 3x (Ex.5)"),
    cap="특성방정식의 근이 세 가지 → 해의 모양이 세 가지. 감쇠 진동 시스템(2.4)의 과감쇠·임계·저감쇠가 바로 이 셋.")

fig_euler = canvas(560, 190,
    circle(120, 100, 70, INK, w=1.6), line(40, 100, 200, 100, GRAY, 1), line(120, 20, 120, 180, GRAY, 1),
    arrow(120, 100, 120 + 70 * math.cos(0.7), 100 - 70 * math.sin(0.7), RED, "", 2.4), dot(120 + 70 * math.cos(0.7), 100 - 70 * math.sin(0.7), "", 5, RED),
    line(120 + 70 * math.cos(0.7), 100, 120 + 70 * math.cos(0.7), 100 - 70 * math.sin(0.7), GREEN, 1.4, "4 3"), text(120 + 70 * math.cos(0.7) + 6, 100 - 35 * math.sin(0.7) + 4, "sin t", 11.5, GREEN),
    text(120 + 35 * math.cos(0.7), 114, "cos t", 11.5, BLUE, "middle"), arc(120, 100, 26, -40, 0, GRAY, 1.2, "t", 36),
    text(120 + 70 * math.cos(0.7) + 10, 100 - 70 * math.sin(0.7) - 8, "e^(it)", 13, RED, "start", True),
    text(390, 60, "e^(it) = cos t + i sin t", 16, INK, "middle", True),
    text(390, 90, "e^((p ± iq)x) = e^(px)(cos qx ± i sin qx)", 13, INK, "middle"),
    text(390, 118, "실수 해 둘: e^(px)cos qx,  e^(px)sin qx", 13, GREEN, "middle", True),
    text(390, 148, "(합과 차를 2, 2i 로 나눠 — 중첩 원리)", 12, GRAY, "middle"),
    cap="오일러 공식: 복소 지수는 단위원 위의 회전. 그래서 복소근이면 해가 진동(cos·sin)한다.")

fig_D = canvas(560, 130,
    fbox(14, 30, 70, 50, "y", INK, size=16), arrow(86, 55, 116, 55, GREEN, "", 2), fbox(120, 30, 70, 50, "D", BLUE, sub="d/dx", size=16), arrow(192, 55, 222, 55, GREEN, "", 2), fbox(226, 30, 70, 50, "y′", INK, size=16),
    text(400, 44, "y″ − 3y′ − 40y = 0", 13.5, INK, "middle"), text(400, 66, "(D² − 3D − 40)y = (D − 8)(D + 5)y = 0", 13.5, INK, "middle", True),
    text(400, 92, "→ y = c₁e^(8x) + c₂e^(−5x)", 14, RED, "middle", True),
    text(160, 110, "연산자 = 함수를 다른 함수로 바꾸는 변환. P(D) 의 인수분해 = 특성근", 12, GRAY, "middle"),
    cap="2.3 미분연산자 D. 새 내용이 아니라 2.2 를 기호로 다시 쓴 것(과제 2.3 #8 유형).")

fig_steps = canvas(560, 120,
    fbox(14, 24, 118, 54, "① 특성방정식", INK, sub="λ² + aλ + b = 0", size=13), arrow(134, 51, 160, 51, GREEN, "", 1.8),
    fbox(164, 24, 110, 54, "② 경우 판별", BLUE, sub="a² − 4b 의 부호", size=13), arrow(276, 51, 302, 51, GREEN, "", 1.8),
    fbox(306, 24, 110, 54, "③ 일반해", BLUE, sub="표에서 꼴 선택", size=13), arrow(418, 51, 444, 51, GREEN, "", 1.8),
    fbox(448, 24, 100, 54, "④ c₁, c₂", RED, sub="y(0), y′(0)", size=13),
    text(280, 106, "y′(0) 조건은 y′ 을 먼저 정리해 두고 대입 — Case II·III 에서 곱의 미분 주의", 12, GRAY, "middle"),
    cap="초기값 문제 수순. Ex.2·4·5 가 세 경우를 하나씩 보여 준다.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>공업수학1 · 9/18 차수축소 마무리 · 2.2 상수계수 제차 · 2.3 미분연산자</title></head><body>
<header>
<h1>2.2 상수계수 제차 선형 ODE — 특성방정식 하나로 세 가지 해</h1>
<p class="lead">이 회차는 결석이라 슬라이드 p.19~26으로 재구성했다(교수님 발언 없음). 내용은 2장의 심장: \\(y''+ay'+by=0\\)에 \\(y=e^{{\\lambda x}}\\)를 넣으면 <b>특성방정식</b> \\(\\lambda^2+a\\lambda+b=0\\)이 나오고, 근이 <b>실근 둘 / 중근 / 복소근</b>인지에 따라 일반해가 세 가지로 갈린다. 표 하나만 외우면 나머지는 대입. 앞에 9/16 예제 1의 마무리, 뒤에 2.3 미분연산자.</p>
<p class="meta"><span>결석 회차 · 슬라이드 p.19~26 재구성</span><span>교재 Kreyszig 2.1~2.3</span><span>3주차 · 금 · 과제 2.2 #4·8·14 · 2.3 #8</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 2.1 Ex.7 마무리 — 차수축소로 기저 완성</h2>
{fig_red}
<div class="formula">\\[p=-\\frac{{x}}{{x^2-x}}=-\\frac1{{x-1}},\\quad e^{{-\\int p\\,dx}}=e^{{\\ln|x-1|}}=x-1,\\quad U=\\frac{{x-1}}{{x^2}}=\\frac1x-\\frac1{{x^2}},\\quad y_2=x\\int U\\,dx=x\\Big(\\ln|x|+\\frac1x\\Big)=x\\ln|x|+1\\]</div>
<div class="why">검산: \\(y_2'=\\ln|x|+1\\), \\(y_2''=1/x\\) → \\((x^2-x)\\cdot\\frac1x-x(\\ln|x|+1)+(x\\ln|x|+1)=(x-1)-x\\ln|x|-x+x\\ln|x|+1=0\\) ✓. \\(y_2/y_1=\\ln|x|+1/x\\)는 상수가 아니므로 \\(\\{{x,\\ x\\ln|x|+1\\}}\\)는 기저. 과제 2.1 #6·#9가 이 유형.</div>
<div class="analogy">퍼즐 조각 하나(\\(y_1\\))의 모양을 알면 옆 조각(\\(y_2\\))의 모양이 정해진다 — 공식은 그 "맞물림 규칙", 검산은 끼워 보는 것.</div>
<div class="memo"><b>외울 것</b> 표준형에서 \\(p\\) → \\(e^{{-\\int p}}\\) → \\(U=e^{{-\\int p}}/y_1^2\\) → \\(y_2=y_1\\int U\\) · 결과는 반드시 대입 검산</div>
</section>

<section class="s" data-id="s2">
<h2>2. 2.2 특성방정식과 세 경우 ★★ (중간 핵심)</h2>
<div class="formula">\\[y''+ay'+by=0,\\quad y=e^{{\\lambda x}}\\ \\Rightarrow\\ (\\lambda^2+a\\lambda+b)e^{{\\lambda x}}=0\\ \\Rightarrow\\ \\boxed{{\\lambda^2+a\\lambda+b=0}}\\quad(\\text{{특성방정식}})\\]</div>
<table><tr><th>판별식 \\(a^2-4b\\)</th><th>근</th><th>일반해</th></tr>
<tr><td>\\(&gt;0\\)</td><td>서로 다른 실근 \\(\\lambda_1,\\lambda_2\\)</td><td><b>\\(y=c_1e^{{\\lambda_1x}}+c_2e^{{\\lambda_2x}}\\)</b></td></tr>
<tr><td>\\(=0\\)</td><td>실 이중근 \\(\\lambda=-a/2\\)</td><td><b>\\(y=(c_1+c_2x)e^{{-ax/2}}\\)</b></td></tr>
<tr><td>\\(&lt;0\\)</td><td>공액복소근 \\(-\\tfrac a2\\pm i\\omega\\), \\(\\omega=\\sqrt{{b-a^2/4}}\\)</td><td><b>\\(y=e^{{-ax/2}}(A\\cos\\omega x+B\\sin\\omega x)\\)</b></td></tr></table>
{fig_cases}
<div class="why">왜 \\(e^{{\\lambda x}}\\)를 넣나: 미분해도 모양이 안 변하는 유일한 함수라, 상수계수 식에 넣으면 \\(e^{{\\lambda x}}\\)가 공통으로 빠지고 <b>2차방정식</b>만 남는다. 미분방정식이 중학교 2차방정식으로 바뀌는 순간. 근이 둘이면 기저가 바로 나오고(중첩 원리로 일반해), 하나(중근)면 차수축소로 둘째 해를 만들고, 복소면 오일러 공식으로 실수 해를 뽑는다.</div>
<div class="analogy">스프링에 매단 추(2.4): 기름이 걸쭉하면 스르륵 멈추고(과감쇠, I), 딱 맞으면 가장 빨리 멈추고(임계, II), 묽으면 흔들리며 잦아든다(저감쇠, III). 세 경우가 그림 그대로다.</div>
<div class="memo"><b>외울 것</b> \\(\\lambda^2+a\\lambda+b=0\\) · I \\(c_1e^{{\\lambda_1x}}+c_2e^{{\\lambda_2x}}\\) · II \\((c_1+c_2x)e^{{-ax/2}}\\) · III \\(e^{{-ax/2}}(A\\cos\\omega x+B\\sin\\omega x)\\), \\(\\omega=\\sqrt{{b-a^2/4}}\\)</div>
</section>

<section class="s" data-id="s3">
<h2>3. 왜 그런가 — Case II 유도(차수축소) · Case III 유도(오일러 공식)</h2>
<div class="formula">\\[\\text{{II: }}\\lambda_1=\\lambda_2=-\\tfrac a2\\ \\Rightarrow\\ y_1=e^{{-ax/2}}\\text{{ 하나뿐}}\\ \\Rightarrow\\ y_2=u\\,y_1,\\ \\text{{차수축소하면 }}u''=0\\ \\Rightarrow\\ u=x\\ \\Rightarrow\\ y_2=xe^{{-ax/2}}\\]</div>
{fig_euler}
<div class="formula">\\[\\text{{III: }}e^{{(p\\pm iq)x}}=e^{{px}}(\\cos qx\\pm i\\sin qx)\\ \\Rightarrow\\ \\tfrac12(y_1+y_2)=e^{{px}}\\cos qx,\\ \\tfrac1{{2i}}(y_1-y_2)=e^{{px}}\\sin qx\\]</div>
<div class="why">중근이면 해가 하나라 기저가 안 된다 → 9/16 차수축소법이 여기서 바로 쓰인다(그래서 배웠다). \\(p=-a/2\\)에서 \\(2y_1'+py_1=-ay_1+ay_1=0\\)이 되어 \\(u''=0\\) — \\(u=x\\)가 가장 간단한 둘째 해. 복소근은 \\(e^{{i\\theta}}=\\cos\\theta+i\\sin\\theta\\)로 풀면 실수부·허수부가 각각 해(중첩 원리로 합·차를 취한 것)라, 결국 <b>진동 × 지수 감쇠</b>.</div>
<div class="analogy">쌍둥이 근(중근)은 한 명처럼 보이니 \\(x\\)라는 명찰을 붙여 구별하고, 복소근은 "회전"이라 cos·sin으로 번역한다.</div>
<div class="memo"><b>외울 것</b> 중근 → \\(x\\) 붙는 이유 = 차수축소 \\(u''=0\\) · 오일러 \\(e^{{it}}=\\cos t+i\\sin t\\) · 복소근 = 지수 감쇠 × 진동</div>
</section>

<section class="s" data-id="s4">
<h2>4. Ex.2 · Ex.4 · Ex.5 — 초기값 문제 세 경우 한 번씩</h2>
{fig_steps}
<details class="ex" open><summary>Ex.2 \\(y''+y'-2y=0\\), \\(y(0)=4\\), \\(y'(0)=-5\\) (Case I)</summary><div class="body"><p>\\(\\lambda^2+\\lambda-2=(\\lambda-1)(\\lambda+2)=0\\) → \\(y=c_1e^x+c_2e^{{-2x}}\\). \\(y(0)=c_1+c_2=4\\), \\(y'(0)=c_1-2c_2=-5\\) → \\(c_1=1\\), \\(c_2=3\\) → <b>\\(y=e^x+3e^{{-2x}}\\)</b>.</p></div></details>
<details class="ex"><summary>Ex.4 \\(y''+y'+0.25y=0\\), \\(y(0)=3.0\\), \\(y'(0)=-3.5\\) (Case II)</summary><div class="body"><p>\\(\\lambda^2+\\lambda+0.25=(\\lambda+0.5)^2\\) → \\(y=(c_1+c_2x)e^{{-0.5x}}\\). \\(y(0)=c_1=3\\), \\(y'=c_2e^{{-0.5x}}-0.5(c_1+c_2x)e^{{-0.5x}}\\) → \\(y'(0)=c_2-1.5=-3.5\\) → \\(c_2=-2\\) → <b>\\(y=(3-2x)e^{{-0.5x}}\\)</b>.</p></div></details>
<details class="ex"><summary>Ex.5 \\(y''+0.4y'+9.04y=0\\), \\(y(0)=0\\), \\(y'(0)=3\\) (Case III)</summary><div class="body"><p>\\(\\lambda=-0.2\\pm\\sqrt{{0.04-9.04}}=-0.2\\pm3i\\) → \\(y=e^{{-0.2x}}(A\\cos3x+B\\sin3x)\\). \\(y(0)=A=0\\), \\(y'(0)=-0.2A+3B=3\\) → \\(B=1\\) → <b>\\(y=e^{{-0.2x}}\\sin3x\\)</b>.</p></div></details>
<div class="why">세 문제의 수순은 같다: <b>특성방정식 → 경우 판별 → 일반해 → 조건 2개로 \\(c_1,c_2\\)</b>. \\(y'(0)\\) 조건에서 곱의 미분(Case II)·지수와 삼각의 곱(Case III)을 틀리기 쉬우니 \\(y'\\)을 먼저 정리해 두고 대입한다.</div>
<div class="analogy">같은 요리 세 번 — 재료(근의 종류)만 다르다. 손이 익으면 3분짜리.</div>
<div class="memo"><b>외울 것</b> 수순 4단계 · Ex.2 \\(e^x+3e^{{-2x}}\\) · Ex.4 \\((3-2x)e^{{-0.5x}}\\) · Ex.5 \\(e^{{-0.2x}}\\sin3x\\) · 과제 2.2 #4·8·14</div>
</section>

<section class="s" data-id="s5">
<h2>5. 2.3 미분연산자 — 같은 것을 기호로</h2>
{fig_D}
<div class="formula">\\[D=\\frac{{d}}{{dx}},\\quad Dy=y',\\ D^2y=y''\\qquad y''+ay'+by=0\\ \\Leftrightarrow\\ (D^2+aD+b)y=P(D)y=0\\qquad \\text{{Ex.1 }}P(D)=D^2-3D-40I=(D-8)(D+5)\\]</div>
<div class="why">연산자는 함수를 다른 함수로 바꾸는 변환. \\(P(D)\\)를 다항식처럼 인수분해하면 인수 \\((D-\\lambda)\\)의 \\(\\lambda\\)가 곧 특성근 — 2.2와 같은 답 \\(y=c_1e^{{8x}}+c_2e^{{-5x}}\\). 새 계산이 아니라 <b>표기법</b>이고, 3장 고계·6장 라플라스에서 이 기호가 편해진다. 과제 2.3 #8이 이 유형.</div>
<div class="analogy">"x로 미분"이라는 긴 말을 D라는 도장으로 찍는 것. 도장을 두 번 찍으면 \\(D^2\\), 도장끼리는 다항식처럼 곱하고 나눈다.</div>
<div class="memo"><b>외울 것</b> \\(D=d/dx\\) · \\(P(D)y=0\\) · 인수분해 \\((D-\\lambda_1)(D-\\lambda_2)\\) = 특성근 · 과제 2.3 #8</div>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 특성방정식</div><div class="qb">\\(y''+y'-2y=0\\)의 특성근은?</div><ol class="choices"><li data-ok="1">\\(\\lambda=1,\\ -2\\)</li><li>\\(\\lambda=-1,\\ 2\\)</li><li>\\(\\lambda=1,\\ 2\\)</li><li>\\(\\lambda=-1\\)(중근)</li></ol><div class="ans">\\(\\lambda^2+\\lambda-2=(\\lambda-1)(\\lambda+2)\\).</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · Ex.2</div><div class="qb">위 방정식에서 \\(y(0)=4\\), \\(y'(0)=-5\\)인 해는?</div><ol class="choices"><li data-ok="1">\\(y=e^x+3e^{{-2x}}\\)</li><li>\\(y=3e^x+e^{{-2x}}\\)</li><li>\\(y=4e^x-5e^{{-2x}}\\)</li><li>\\(y=e^{{-x}}+3e^{{2x}}\\)</li></ol><div class="ans">\\(c_1+c_2=4\\), \\(c_1-2c_2=-5\\) → \\(c_1=1,c_2=3\\).</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 중근</div><div class="qb">특성방정식이 실 이중근 \\(\\lambda\\)를 가질 때 일반해는?</div><ol class="choices"><li data-ok="1">\\(y=(c_1+c_2x)e^{{\\lambda x}}\\)</li><li>\\(y=c_1e^{{\\lambda x}}+c_2e^{{\\lambda x}}\\)</li><li>\\(y=c_1e^{{\\lambda x}}+c_2e^{{-\\lambda x}}\\)</li><li>\\(y=c_1\\cos\\lambda x+c_2\\sin\\lambda x\\)</li></ol><div class="ans">둘째 해 \\(xe^{{\\lambda x}}\\)는 차수축소(\\(u''=0\\Rightarrow u=x\\)). 2번은 사실상 해 하나.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · Ex.5</div><div class="qb">\\(y''+0.4y'+9.04y=0\\), \\(y(0)=0\\), \\(y'(0)=3\\)의 해는?</div><ol class="choices"><li data-ok="1">\\(y=e^{{-0.2x}}\\sin3x\\)</li><li>\\(y=e^{{-0.2x}}\\cos3x\\)</li><li>\\(y=e^{{0.2x}}\\sin3x\\)</li><li>\\(y=3e^{{-0.2x}}\\sin x\\)</li></ol><div class="ans">\\(\\lambda=-0.2\\pm3i\\), \\(A=0\\), \\(3B=3\\).</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 미분연산자</div><div class="qb">\\((D^2-3D-40)y=0\\)의 일반해는?</div><ol class="choices"><li data-ok="1">\\(y=c_1e^{{8x}}+c_2e^{{-5x}}\\)</li><li>\\(y=c_1e^{{-8x}}+c_2e^{{5x}}\\)</li><li>\\(y=(c_1+c_2x)e^{{8x}}\\)</li><li>\\(y=c_1e^{{3x}}+c_2e^{{40x}}\\)</li></ol><div class="ans">\\((D-8)(D+5)\\) → \\(\\lambda=8,-5\\).</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · Ex.4</div><div class="qb">\\(y''+y'+0.25y=0\\), \\(y(0)=3.0\\), \\(y'(0)=-3.5\\)를 풀라.</div><div class="ans">\\((\\lambda+0.5)^2=0\\) → \\(y=(c_1+c_2x)e^{{-0.5x}}\\). \\(c_1=3\\), \\(y'(0)=c_2-0.5c_1=-3.5\\) → \\(c_2=-2\\) → \\(y=(3-2x)e^{{-0.5x}}\\).</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
