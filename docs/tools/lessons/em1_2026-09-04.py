# -*- coding: utf-8 -*-
"""공업수학1 · 2026-09-04 수업 노트 (근거: 2026-09-04/정리.md — 녹음 8분 49초(이후 끊김) + 슬라이드 p.18~28 + 판서 사진으로 재구성)"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\공업수학1\_수업노트\2026-09-04.html"

X1 = lambda x: 60 + x * 130; Y1 = lambda y: 165 - y * 9
fig_ivp = canvas(560, 190,
    axis(60, 165, 330, 165, "x", "y") + arrow(60, 165, 60, 20, INK, "", 1.5),
    *[fplot(lambda x, c=c: c * math.exp(3 * x), 0, 1.3, X1, Y1, color=GRAY, w=1.5, ylim=(0, 16)) for c in (1, 2, 3.5, 9)],
    fplot(lambda x: 5.7 * math.exp(3 * x), 0, 1.3, X1, Y1, color=RED, w=2.8, ylim=(0, 16)),
    dot(60, Y1(5.7), "", 5, RED), text(56, Y1(5.7) + 4, "(0, 5.7)", 12.5, RED, "end"), text(56, Y1(5.7) + 20, "초기조건", 11.5, RED, "end"),
    text(440, 60, "y′ = 3y", 15, INK, "middle", True), text(440, 84, "일반해 y = c·e³ˣ", 13, GRAY, "middle"), text(440, 108, "y(0) = 5.7 → c = 5.7", 13, INK, "middle"),
    text(440, 132, "특수해 y = 5.7e³ˣ", 14, RED, "middle", True),
    cap="초기값 문제(IVP): 일반해(회색 가족)에서 초기조건이 지나는 곡선 하나(빨강)를 고른다.")

X2 = lambda t: 60 + t * 44; Y2 = lambda y: 160 - y * 240
fig_decay = canvas(560, 190,
    axis(60, 160, 540, 160, "t", "y") + arrow(60, 160, 60, 20, INK, "", 1.5),
    fplot(lambda t: 0.5 * math.exp(-0.35 * t), 0, 10.5, X2, Y2, color=RED, w=2.6),
    dot(60, Y2(0.5), "", 5, RED), text(74, Y2(0.5) - 6, "y(0) = 0.5 g", 12.5, RED),
    line(60, Y2(0.25), X2(1.98), Y2(0.25), GRAY, 1, "4 3"), line(X2(1.98), Y2(0.25), X2(1.98), 160, GRAY, 1, "4 3"), text(X2(1.98), 176, "반감기", 11.5, GRAY, "middle"),
    text(400, 50, "dy/dt = −k·y  (줄어드니까 −)", 13.5, INK, "middle", True), text(400, 74, "y = 0.5·e^(−kt)", 13.5, RED, "middle"),
    cap="Ex.5 방사능 붕괴: 남은 양에 비례해 줄어든다. 해는 지수 감소 곡선 — 처음이 가장 가파르다.")

fig_sep = canvas(560, 150,
    fbox(20, 30, 200, 56, "g(y)·y′ = f(x)", INK, sub="y 는 왼쪽, x 는 오른쪽으로"), arrow(222, 58, 262, 58, GREEN, "", 2), text(242, 46, "dy 로", 11, GREEN, "middle"),
    fbox(266, 30, 120, 56, "g(y)dy = f(x)dx", BLUE, sub="변수 분리"), arrow(388, 58, 428, 58, GREEN, "", 2), text(408, 46, "∫ 양변", 11, GREEN, "middle"),
    fbox(432, 30, 118, 56, "∫g dy = ∫f dx + c", RED, sub="상수는 한쪽에"),
    text(280, 120, "적분 도구 셋이 반복된다: ∫du/(u²+a²) = (1/a)tan⁻¹(u/a) · 부분분수 · 부분적분", 12.5, GRAY, "middle"),
    cap="변수분리형 풀이 틀: 분리 → 양변 적분 → 적분상수 정리 → (조건 있으면) 대입.")

X3 = lambda x: 40 + x * 26; Y3 = lambda y: 110 - y * 26
def _circ(c, color, w):
    r = c / 2; pts = [(X3(r + r * math.cos(a)), Y3(r * math.sin(a))) for a in [2 * math.pi * i / 60 for i in range(61)]]
    return polyline(pts, color, w)
fig_circles = canvas(560, 220,
    axis(40, 110, 330, 110, "x", "y") + arrow(40, 110, 40, 10, INK, "", 1.5) + line(40, 110, 40, 210, INK, 1.5),
    *[_circ(c, GRAY, 1.5) for c in (2, 4, 6, 8)], _circ(6, RED, 2.6), dot(40, 110, "", 5, INK),
    text(430, 70, "2xy·y′ = y² − x²", 15, INK, "middle", True), text(430, 96, "y = ux 치환 →", 12.5, GRAY, "middle"),
    text(430, 120, "x² + y² = c·x", 14, RED, "middle", True), text(430, 144, "(x − c/2)² + y² = (c/2)²", 13, INK, "middle"),
    text(430, 172, "원점을 지나고 중심이 x 축 위인 원들", 12, GRAY, "middle"),
    cap="Ex.8 의 해 가족: c 가 달라지면 반지름이 다른 원. 해를 「그림」으로 읽는 연습 — 정리하면 강점이 된다.")

X4 = lambda t: 60 + t * 0.0095; Y4 = lambda h: 150 - h * 0.55
fig_tank = canvas(560, 192,
    rect(40, 40, 110, 110, INK, fill="none", sw=2), rect(41, 70, 108, 79, BLUE, fill="rgba(25,113,194,.18)", sw=0), text(95, 62, "h(t)", 13, BLUE, "middle", True),
    rect(148, 140, 10, 6, INK, fill="#fff", sw=1), arrow(160, 143, 200, 143, BLUE, "", 2), text(180, 166, "유출 v = 0.6√(2gh)", 11, BLUE, "middle"),
    text(95, 184, "지름 2 m 탱크 · 지름 1 cm 구멍", 11.5, GRAY, "middle"),
    axis(260, 150, 540, 150, "t", "h [cm]") + arrow(260, 150, 260, 30, INK, "", 1.5),
    fplot(lambda t: (15 - 0.000332 * t) ** 2, 0, 45181, lambda t: 260 + t * 0.006, lambda h: 150 - h * 0.5, color=RED, w=2.6),
    text(275, 42, "225 cm", 11.5, GRAY), text(400, 168, "45 181 s ≈ 12.6 h 에 바닥", 11.5, RED, "middle"),
    cap="Ex.7 토리첼리: 물 높이 h 가 √h 에 비례해 줄어든다 → 포물선 모양으로 비어 12.6시간 뒤 바닥(교재 수치).")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>공업수학1 · 9/4 해와 초기값 문제 · 변수분리형 · 동차형</title></head><body>
<header>
<h1>해의 가족에서 하나를 고르기 — 초기값 문제, 변수분리, y = ux 치환</h1>
<p class="lead">오늘 배운 기술은 딱 둘이다. ① <b>변수분리</b>: \\(y\\)는 왼쪽, \\(x\\)는 오른쪽으로 갈라 양변을 적분한다. ② 분리가 안 되면 <b>\\(y=ux\\) 치환</b>(동차형)으로 분리형을 만든다. 그 앞에 "해가 여러 개인데 조건으로 하나를 고른다"(초기값 문제)와 모델화 예제 둘(방사능 붕괴·토리첼리). 녹음이 8분 49초에서 끊겨 그 뒤는 슬라이드 p.18~28과 판서 사진으로 재구성했다.</p>
<p class="meta"><span>녹음 8분 49초(이후 없음)</span><span>슬라이드 p.18~28</span><span>판서 사진 7장</span><span>1주차 · 금</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 해의 종류와 초기값 문제(IVP) ★</h2>
<p>미분방정식의 해는 적분상수 \\(c\\)를 품은 <b>일반해</b>(가족)다. 조건을 넣어 \\(c\\)를 정하면 <b>특수해</b>. 가족에 속하지 않는 별난 해(<b>특이해</b>)도 있지만 교수님은 "공학적 의미가 없어 거의 안 다룬다"고 했다.</p>
{fig_ivp}
<div class="formula">\\[y'=3y,\\ y(0)=5.7:\\quad \\frac{{dy}}{{y}}=3\\,dx\\ \\to\\ \\ln y=3x+c\\ \\to\\ y=e^{{c}}e^{{3x}}=c\\,e^{{3x}}\\ \\to\\ c=5.7\\ \\Rightarrow\\ y=5.7e^{{3x}}\\]</div>
<div class="say">"초기조건 = 독립변수가 0일 때의 값. 공학에서는 <b>경계조건</b>이라는 말을 많이 쓴다." · "n계면 적분상수 n개 → 조건도 n개." · 풀기 전에 늘 "이거 <b>선형이야 비선형이야?</b>" (뒷자리 학생 지목)</div>
<div class="why">\\(e^{{3x+c}}=e^c e^{{3x}}\\)에서 \\(e^c\\)는 양의 상수일 뿐이니 새 상수 \\(c\\)로 다시 쓴다. 초기값 문제는 언제나 <b>일반해 → 조건 대입 → 특수해</b> 두 단계. 슬라이드 메모 "#일반해와 특수해를 구해라".</div>
<div class="analogy">일반해는 한 가족의 단체사진, 초기조건은 "안경 쓴 사람"이라는 힌트 — 그 힌트로 한 명(특수해)이 지목된다. 힌트가 두 개 필요한 가족(2계)도 있다.</div>
<div class="memo"><b>외울 것</b> 일반해(상수 c) → 초기조건 → 특수해 · n계 = 상수 n개 = 조건 n개 · 특이해는 거의 안 다룸</div>
</section>

<section class="s" data-id="s2">
<h2>2. 모델화 실전 — 방사능 붕괴 (Ex.5)</h2>
{fig_decay}
<div class="formula">\\[\\text{{① 설정: }}\\frac{{dy}}{{dt}}=-ky\\qquad \\text{{② 해법: }}y=ce^{{-kt}},\\ y(0)=0.5\\Rightarrow y=0.5e^{{-kt}}\\qquad \\text{{③ 해석: }}\\text{{초기 양에서 출발해 }}k\\text{{ 에 따라 감소}}\\]</div>
<div class="why">"분해 속도가 현재 양에 비례" → \\(y'\\propto y\\). 줄어드는 양이니 부호는 −. 검토: \\(y'=-0.5ke^{{-kt}}=-ky\\) ✓, \\(y(0)=0.5\\) ✓ — 해를 구했으면 <b>원식에 다시 넣어 확인</b>하는 것까지가 해법이다. 9/2 결석분(모델화 3단계)의 첫 적용.</div>
<div class="analogy">냉장고 속 아이스크림이 반씩 줄어드는 속도: 많을수록 빨리 줄고, 조금 남으면 천천히. 지수 감소는 "남은 것에 비례해 줄어드는" 모든 것의 모양.</div>
<div class="memo"><b>외울 것</b> \\(y'=-ky\\Rightarrow y=y_0e^{{-kt}}\\) · 반감기 \\(T=\\ln2/k\\) · 해를 구하면 대입 검토</div>
</section>

<section class="s" data-id="s3">
<h2>3. 1.3 변수분리형 — 분리 → 양변 적분 ★★</h2>
<p><b>변수분리형</b> = 왼쪽은 \\(y\\)만, 오른쪽은 \\(x\\)만 남게 정리할 수 있는 식 \\(g(y)\\,y'=f(x)\\). 양변을 \\(x\\)로 적분하면 \\(\\int g(y)\\,dy=\\int f(x)\\,dx+c\\).</p>
{fig_sep}
<div class="formula">\\[\\text{{Ex.1 }}y'=1+y^2:\\ \\frac{{dy}}{{1+y^2}}=dx\\ \\to\\ \\tan^{{-1}}y=x+c\\ \\to\\ y=\\tan(x+c)\\qquad\\Big(\\int\\frac{{du}}{{u^2+a^2}}=\\frac1a\\tan^{{-1}}\\frac ua\\Big)\\]</div>
<details class="ex"><summary>예제 세 문제(p.23, 메모 "#부분분수로 적분") — 일반해</summary><div class="body">
<p>(1) \\(xe^{{-y}}\\sin x\\,dx-y\\,dy=0\\) → \\(ye^{{y}}dy=x\\sin x\\,dx\\) → 양변 <b>부분적분</b>: \\((y-1)e^y=-x\\cos x+\\sin x+c\\).</p>
<p>(2) \\(x^2y'=y^2+1\\) → \\(\\dfrac{{dy}}{{y^2+1}}=\\dfrac{{dx}}{{x^2}}\\) → \\(\\tan^{{-1}}y=-\\dfrac1x+c\\).</p>
<p>(3) \\(y'=y^2-1\\) → \\(\\dfrac{{dy}}{{y^2-1}}=dx\\), <b>부분분수</b> \\(\\dfrac{{1}}{{y^2-1}}=\\dfrac12\\Big(\\dfrac{{1}}{{y-1}}-\\dfrac{{1}}{{y+1}}\\Big)\\) → \\(\\dfrac12\\ln\\Big|\\dfrac{{y-1}}{{y+1}}\\Big|=x+c\\).</p></div></details>
<div class="why">분리형의 어려움은 미분방정식이 아니라 <b>적분</b>이다. 같은 도구 셋(역탄젠트 공식·부분분수·부분적분)이 반복되니 이 셋은 손에 익혀 둔다. \\(\\ln\\)이 나오면 절댓값, 적분상수는 한쪽에 하나만.</div>
<div class="analogy">섞인 동전을 종류별로 갈라 놓고(분리) 각 더미를 따로 세는 것(적분). 갈라지지 않는 동전(\\(x\\)와 \\(y\\)가 곱·합으로 얽힌 식)은 다음 절의 치환으로 갈라야 한다.</div>
<div class="memo"><b>외울 것</b> \\(g(y)dy=f(x)dx\\) → 양변 적분 → \\(c\\) 한쪽 · \\(\\int\\frac{{du}}{{u^2+a^2}}=\\frac1a\\tan^{{-1}}\\frac ua\\) · 부분분수 · 부분적분 · 과제 1.3 #6·7·8·16·17</div>
</section>

<section class="s" data-id="s4">
<h2>4. 모델화 Ex.7 — 토리첼리의 법칙(탱크 비우기)</h2>
{fig_tank}
<div class="formula">\\[\\text{{유출 속도 }}v=0.600\\sqrt{{2gh}}\\ \\Rightarrow\\ B\\,\\frac{{dh}}{{dt}}=-0.600\\,A\\sqrt{{2gh}}\\ \\Rightarrow\\ \\frac{{dh}}{{\\sqrt h}}=-0.000664\\,dt\\ \\Rightarrow\\ 2\\sqrt h=-0.000664\\,t+c\\]</div>
<div class="why">탱크 단면 \\(B\\)에서 높이 \\(h\\)가 \\(dh\\) 내려간 부피 = 구멍 \\(A\\)로 빠져나간 부피. \\(h\\)는 왼쪽, \\(t\\)는 오른쪽 — 변수분리형. \\(h(0)=225\\) cm → \\(c=30\\) → \\(h(t)=(15-0.000332t)^2\\), \\(h=0\\)은 \\(t=45{{,}}181\\) s ≈ <b>12.6시간</b>. 판서 사진이 흐려 세부는 교재(Kreyszig 1.3 Ex.7) 수치로 채웠다.</div>
<div class="analogy">욕조 마개를 뽑으면 처음엔 콸콸, 끝날수록 졸졸 — 수압(\\(\\sqrt h\\))이 줄기 때문. 그래서 비는 시간이 "처음 속도로 나누기"보다 훨씬 길다.</div>
<div class="memo"><b>외울 것</b> 모델 설정의 핵심은 <b>부피 보존</b>(줄어든 부피 = 빠져나간 부피) · \\(v=0.6\\sqrt{{2gh}}\\) · 결과 \\(h=(\\sqrt{{h_0}}-\\alpha t)^2\\)</div>
</section>

<section class="s" data-id="s5">
<h2>5. 확장 — 동차형: y = ux 치환으로 분리형 만들기 ★</h2>
<p>그대로는 분리가 안 되는 식이라도 \\(y'=f(y/x)\\) 꼴(우변이 \\(y/x\\)의 함수 = <b>동차</b>)이면 \\(u=y/x\\), \\(y=ux\\), \\(y'=u'x+u\\)로 치환한다.</p>
<div class="formula">\\[u'x+u=f(u)\\ \\Rightarrow\\ \\frac{{du}}{{f(u)-u}}=\\frac{{dx}}{{x}}\\qquad(\\text{{변수분리형이 된다}})\\]</div>
<details class="ex"><summary>p.26 동차함수 판정 — \\(f(tx,ty)=t^nf(x,y)\\)이면 \\(n\\)차 동차</summary><div class="body"><p>(1) \\(x-\\sqrt{{xy}}+3y\\): 1차 동차 ✓ (2) \\(x^4-x^2y^2+8y^4\\): 4차 동차 ✓ (3) \\(x^2+y^2+4\\): 상수 4 때문에 ✗ (4) \\(y/x+1\\): 0차 동차 ✓. (슬라이드에 답 없음 — 아톰 판정)</p></div></details>
{fig_circles}
<details class="ex"><summary>Ex.8 \\(2xyy'=y^2-x^2\\) — 회차의 마지막 문제</summary><div class="body"><p>\\(y'=\\dfrac12\\Big(\\dfrac yx-\\dfrac xy\\Big)\\) → \\(y=ux\\): \\(u'x+u=\\dfrac12\\Big(u-\\dfrac1u\\Big)\\) → \\(u'x=-\\dfrac{{u^2+1}}{{2u}}\\) → \\(\\dfrac{{2u\\,du}}{{u^2+1}}=-\\dfrac{{dx}}{{x}}\\) → \\(\\ln(u^2+1)=-\\ln|x|+c^*\\) → \\(u^2+1=\\dfrac cx\\) → \\(\\Big(\\dfrac yx\\Big)^2+1=\\dfrac cx\\) → <b>\\(x^2+y^2=cx\\)</b>, 즉 \\((x-c/2)^2+y^2=(c/2)^2\\).</p></div></details>
<div class="why">치환 뒤 \\(u\\)와 \\(x\\)가 갈라지는 이유: 동차 식은 크기(\\(x\\))와 비율(\\(y/x\\))로 분해되기 때문. 마지막에 반드시 \\(u=y/x\\)로 <b>되돌린다</b> — 되돌리지 않으면 답이 아니다(9/16 베르누이에서도 같은 말).</div>
<div class="analogy">지도를 확대·축소해도 같은 모양이면(동차) "비율"만 보면 된다 — \\(y/x\\) 하나로 문제가 1차원이 되는 셈.</div>
<div class="memo"><b>외울 것</b> \\(y'=f(y/x)\\) → \\(y=ux\\), \\(y'=u'x+u\\) → \\(\\frac{{du}}{{f(u)-u}}=\\frac{{dx}}x\\) → 되돌리기 · 동차 판정 \\(f(tx,ty)=t^nf\\)</div>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 초기값 문제</div><div class="qb">\\(y'=3y\\), \\(y(0)=5.7\\)의 특수해는?</div><ol class="choices"><li data-ok="1">\\(y=5.7e^{{3x}}\\)</li><li>\\(y=3e^{{5.7x}}\\)</li><li>\\(y=5.7+3x\\)</li><li>\\(y=e^{{3x}}+5.7\\)</li></ol><div class="ans">일반해 \\(ce^{{3x}}\\), \\(y(0)=c=5.7\\).</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 모델 설정</div><div class="qb">"분해 속도가 현재 양에 비례해 줄어든다"를 식으로 쓰면?</div><ol class="choices"><li data-ok="1">\\(dy/dt=-ky\\)</li><li>\\(dy/dt=ky\\)</li><li>\\(dy/dt=-k\\)</li><li>\\(y=-kt\\)</li></ol><div class="ans">비례(\\(\\propto y\\)) + 감소(−). 2번은 성장 모델.</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 변수분리</div><div class="qb">\\(y'=1+y^2\\)의 일반해는?</div><ol class="choices"><li data-ok="1">\\(y=\\tan(x+c)\\)</li><li>\\(y=\\tan^{{-1}}(x+c)\\)</li><li>\\(y=ce^{{x}}\\)</li><li>\\(y=x+x^3/3+c\\)</li></ol><div class="ans">\\(\\frac{{dy}}{{1+y^2}}=dx\\) → \\(\\tan^{{-1}}y=x+c\\). 4번은 \\(y'=1+x^2\\)로 잘못 읽은 것.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 동차함수</div><div class="qb">다음 중 동차함수는?</div><ol class="choices"><li data-ok="1">\\(x^4-x^2y^2+8y^4\\)</li><li>\\(x^2+y^2+4\\)</li><li>\\(x+y+1\\)</li><li>\\(xy+1\\)</li></ol><div class="ans">\\(f(tx,ty)=t^4f(x,y)\\) — 4차 동차. 나머지는 상수항 때문에 아니다.</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 치환</div><div class="qb">\\(y=ux\\)로 치환하면 \\(y'\\)은?</div><ol class="choices"><li data-ok="1">\\(y'=u'x+u\\)</li><li>\\(y'=u'x\\)</li><li>\\(y'=u'\\)</li><li>\\(y'=u+x\\)</li></ol><div class="ans">곱의 미분. \\(u\\)도 \\(x\\)의 함수라는 것을 잊으면 2번 오답.</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · Ex.8</div><div class="qb">\\(2xyy'=y^2-x^2\\)의 일반해를 구하고 그래프가 무엇인지 쓰라.</div><div class="ans">\\(y=ux\\) → \\(\\frac{{2u\\,du}}{{u^2+1}}=-\\frac{{dx}}{{x}}\\) → \\(u^2+1=c/x\\) → \\(x^2+y^2=cx\\) — 원점을 지나고 중심이 \\(x\\)축 위에 있는 원들.</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
