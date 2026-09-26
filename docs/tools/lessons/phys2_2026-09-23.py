# -*- coding: utf-8 -*-
"""일반물리학2 · 2026-09-23 수업 노트 (근거: 2026-09-23/정리.md — 판서 6장. 녹음 미수신이라 교수 발언 없이 판서 강조만)"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\일반물리학2\_수업노트\2026-09-23.html"

def ellipse(cx, cy, rx, ry, color=INK, w=2, fill="none", dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{color}" stroke-width="{w}"{d}/>'

fig_pp = canvas(560, 210,
    plate(150, 50, 260, 18, "+", 9), plate(150, 140, 260, 18, "−", 9),
    text(120, 63, "+q, 넓이 A", 13, RED, "end"), text(120, 153, "−q", 13, BLUE, "end"),
    rect(230, 36, 100, 50, PINK, dash="6 4"), text(345, 44, "가우스면(위판 감쌈)", 12, PINK),
    arrow(200, 72, 200, 136, GREEN, "", 2), arrow(280, 72, 280, 136, GREEN, "E", 2.4, 14, 0), arrow(360, 72, 360, 136, GREEN, "", 2),
    line(430, 68, 430, 140, GRAY, 1.2), text(442, 108, "d", 13, GRAY),
    text(280, 190, "EA = q/ε₀ → E = σ/ε₀ · ΔV = Ed → C = ε₀A/d", 13, INK, "middle", True),
    cap="평행판: 위판을 감싸는 가우스면(전기력선은 아래로만) → \\(E=\\sigma/\\varepsilon_0\\). 전위차는 \\(E\\)를 간격만큼 적분.")

fig_cyl = canvas(560, 220,
    line(90, 60, 470, 60, INK, 3), line(90, 160, 470, 160, INK, 3), text(470, 50, "바깥 도체 (반지름 b)", 12, INK, "end"),
    rect(90, 102, 380, 16, RED, fill="rgba(224,49,49,.25)", sw=1.5), text(476, 132, "안쪽 도체 a, +q", 12, RED, "end"),
    rect(150, 82, 200, 56, PINK, dash="6 4", rx=6), text(250, 76, "가우스면: 반지름 r, 길이 L", 12, PINK, "middle"),
    arrow(200, 100, 200, 86, GREEN, "", 1.8), arrow(300, 120, 300, 134, GREEN, "", 1.8), arrow(250, 100, 250, 86, GREEN, "E", 1.8, 12, 4),
    brace_label(90, 470, 190, "L"),
    cap="원통형(동축): 옆면 \\(2\\pi rL\\)로 \\(E=\\frac{q}{2\\pi\\varepsilon_0L}\\frac1r\\) → \\(\\Delta V=\\frac{q}{2\\pi\\varepsilon_0L}\\ln\\frac ba\\).")

fig_sph = canvas(560, 220,
    circle(160, 110, 90, INK, w=2.5), text(160, 214, "바깥 도체 껍질 b", 13, INK, "middle"),
    circle(160, 110, 40, RED, w=2.5, fill="rgba(224,49,49,.1)"), text(160, 114, "a, +q", 13, RED, "middle", True),
    circle(160, 110, 65, PINK, dash="6 4"), text(232, 74, "r", 12, PINK),
    radial(160, 110, 8, 44, 62, GREEN),
    text(400, 80, "E·4πr² = q/ε₀", 14, INK, "middle"), text(400, 105, "ΔV = (q/4πε₀)(1/a − 1/b)", 14, INK, "middle"),
    text(400, 135, "C = 4πε₀·ab/(b−a)", 15, INK, "middle", True), text(400, 165, "b → ∞ : C = 4πε₀a (고립 도체구)", 13, GREEN, "middle", True),
    cap="구형: 안쪽 구와 바깥 껍질 사이의 전위차. 바깥 껍질을 무한대로 보내면 <b>고립 도체구</b>의 용량이 된다.")

fig_diel = canvas(560, 236,
    plate(140, 40, 280, 16, "+", 9), plate(140, 164, 280, 16, "−", 9),
    rect(140, 70, 280, 80, YEL, fill="rgba(245,159,0,.10)", sw=1.5), text(440, 92, "유전체(종이)", 12, "#B26A00", "start"),
    text(280, 86, "− − − − − − − −  (−q′ 유도)", 12, BLUE, "middle"), text(280, 144, "+ + + + + + + +  (+q′ 유도)", 12, RED, "middle"),
    arrow(160, 60, 160, 160, GREEN, "", 2.2), text(168, 116, "E₀", 13, GREEN, "start", True), arrow(400, 140, 400, 90, BLUE, "", 2.2), text(392, 118, "E′", 13, BLUE, "end", True),
    text(280, 205, "E = E₀ − E′ = E₀/κ  → V 줄고 C = κC₀ 늘어난다", 13, INK, "middle", True),
    text(280, 226, "E₀ = 판의 전하가 만드는 장 · E′ = 유도 전하가 만드는 반대 방향의 장", 11.5, GRAY, "middle"),
    cap="유전체를 넣으면 분극으로 표면에 유도 전하가 생겨 판의 장을 일부 상쇄한다. 판의 \\(q\\)는 그대로인데 전위차가 줄어 용량이 는다.")

fig_three = canvas(560, 195,
    rect(40, 44, 90, 60, PINK, dash="6 4", fill="rgba(255,77,141,.06)"), text(85, 120, "면 A", 13, PINK, "middle"),
    arrow(85, 126, 85, 146, GRAY, "", 1.4),
    plate(45, 152, 80, 8, "+", 5), plate(45, 172, 80, 8, "−", 5), text(85, 30, "평행판", 13, INK, "middle", True),
    ellipse(280, 50, 30, 10, PINK, 2, "rgba(255,77,141,.06)", "6 4"), ellipse(280, 98, 30, 10, PINK, 2, "none", "6 4"), line(250, 50, 250, 98, PINK, 2, "6 4"), line(310, 50, 310, 98, PINK, 2, "6 4"),
    text(280, 122, "원통 2πrL", 13, PINK, "middle"), arrow(280, 128, 280, 146, GRAY, "", 1.4),
    line(230, 154, 330, 154, INK, 2.5), line(230, 180, 330, 180, INK, 2.5), rect(230, 164, 100, 6, RED, fill="rgba(224,49,49,.3)", sw=1), text(280, 30, "원통형(동축)", 13, INK, "middle", True),
    circle(470, 74, 32, PINK, dash="6 4", w=2), text(470, 122, "구 4πr²", 13, PINK, "middle"), arrow(470, 128, 470, 146, GRAY, "", 1.4),
    circle(470, 168, 17, INK, w=2), circle(470, 168, 6, RED, w=2, fill="rgba(224,49,49,.3)"), text(470, 30, "구형(동심)", 13, INK, "middle", True),
    cap="가우스면 3종이 곧 축전기 3종. 순서는 늘 같다: 가우스로 \\(E\\) → 선적분으로 \\(\\Delta V\\) → \\(C=q/\\Delta V\\).")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>일반물리학2 · 9/23 축전기 — 평행판 · 원통형 · 구형 · 유전체</title></head><body>
<header>
<h1>25장 축전기 — 전기 용량 세 가지와 유전체</h1>
<p class="lead">전기 용량을 구하는 순서는 하나다: <b>가우스 법칙으로 E → 선적분으로 ΔV → C = q/ΔV</b>. 가우스면 3종이 곧 축전기 3종(평행판·원통형·구형). 마지막에 유전체를 끼우면 왜 용량이 느는지까지. 이 회차는 녹음이 없어 판서 6장으로 정리했다.</p>
<p class="meta"><span>판서 6장</span><span>녹음 없음(판서 기준)</span><span>중간 범위 안 · "당장 시험이면 25장만"</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 전기 용량의 일반식 — 분자는 가우스, 분모는 선적분</h2>
<div class="formula">\\[C=\\frac{{q}}{{\\Delta V}}=\\frac{{\\varepsilon_0\\oint\\vec E\\cdot\\hat n\\,dA}}{{-\\int_i^f\\vec E\\cdot d\\vec r}}\\]</div>
<div class="why">분자: 가우스 법칙 \\(\\oint\\vec E\\cdot\\hat n\\,dA=q/\\varepsilon_0\\)을 \\(q\\)에 대해 푼 것. 분모: 일 \\(W=\\int_i^f q\\vec E\\cdot d\\vec r=-\\Delta U\\) → \\(\\Delta V=\\Delta U/q=-\\int_i^f\\vec E\\cdot d\\vec r\\)(24장 끝에 유도). 즉 23장(가우스)과 24장(전위)을 한 식에 합친 것이 25장이다.</div>
<div class="say">판서 강조: 분자와 분모를 각각 원으로 묶고 「가우스 법칙」 화살표. 가우스면 3종 → ① 면 → 평행판 ② 원통 → 원통형 ③ 구 → 구형.</div>
{fig_three}
<div class="memo"><b>외울 것</b> \\(C=q/\\Delta V\\) [F = C/V] · 순서: 가우스 → 선적분 → 나누기 · 결과는 \\(q\\)가 약분되어 <b>모양(기하)만</b> 남는다 · \\(1\\,\\mu\\)F = \\(10^{{-6}}\\) F</div>
<div class="analogy">물통의 용량이 "같은 수압으로 얼마나 담기느냐"이듯, 축전기 용량은 <b>같은 전압으로 얼마나 많은 전하를 담느냐</b>. 판이 넓고(A↑) 가까우면(d↓) 많이 담긴다.</div>
<figure class="board"><img data-photo="일반물리학2/2026-09-23/판서_1_전기용량정의_평행판.jpg" alt="판서 1"><figcaption>판서 ① 일반식 + 평행판 (10:46)</figcaption></figure>
</section>

<section class="s" data-id="s2">
<h2>2. 평행판 축전기 — C = ε₀A/d</h2>
{fig_pp}
<div class="formula">\\[EA=\\frac{{q}}{{\\varepsilon_0}}\\Rightarrow E=\\frac{{\\sigma}}{{\\varepsilon_0}},\\qquad \\Delta V=-\\int_d^0E\\,ds=Ed,\\qquad C=\\frac{{q}}{{\\Delta V}}=\\frac{{\\varepsilon_0EA}}{{Ed}}=\\varepsilon_0\\frac{{A}}{{d}}\\ [\\mathrm F]\\]</div>
<div class="why">가우스면이 위판만 감싸고 전기력선은 판 사이로만 내려가므로 넓이는 \\(A\\)(무한 평면의 \\(2A\\)와 다르다 — 도체판 한쪽). \\(q\\)가 약분되어 <b>기하(A, d)만 남는다</b>. 용량은 전하를 얼마나 넣었느냐와 무관한 "그릇의 크기".</div>
<div class="analogy">얇은 종이 한 장을 사이에 두고 손바닥 둘을 마주 대면, 멀리 떨어져 있을 때보다 상대 손의 전하를 훨씬 세게 붙잡아 둔다. 가까울수록(\\(d\\)↓)·넓을수록(\\(A\\)↑) 같은 전압으로 더 많은 전하를 담는다.</div>
<div class="memo"><b>외울 것</b> \\(C=\\varepsilon_0A/d\\) · \\(E=\\sigma/\\varepsilon_0\\)(도체판 한쪽) · \\(V=Ed\\) · \\(\\varepsilon_0=8.85\\times10^{{-12}}\\) F/m</div>
<details class="ex"><summary>넓이 \\(0.010\\ \\mathrm{{m^2}}\\), 간격 1.0 mm인 평행판의 용량</summary><div class="body"><p>\\(C=8.85\\times10^{{-12}}\\times\\dfrac{{0.010}}{{0.0010}}=8.85\\times10^{{-11}}\\) F \\(\\approx89\\) pF. mm를 m로 바꾸는 것을 잊지 말 것. 1 μF을 만들려면 판이 100 m²쯤 필요하다 — 그래서 유전체와 말아 감는 구조를 쓴다.</p></div></details>
</section>

<section class="s" data-id="s3">
<h2>3. 원통형 축전기 — C = 2πε₀L / ln(b/a)</h2>
{fig_cyl}
<div class="formula">\\[E\\cdot2\\pi rL=\\frac{{q}}{{\\varepsilon_0}}\\Rightarrow E=\\frac{{q}}{{2\\pi\\varepsilon_0L}}\\frac1r,\\quad \\Delta V=-\\int_b^a\\frac{{q}}{{2\\pi\\varepsilon_0L}}\\frac{{dr}}{{r}}=\\frac{{q}}{{2\\pi\\varepsilon_0L}}\\ln\\frac ba,\\quad C=\\frac{{2\\pi\\varepsilon_0L}}{{\\ln(b/a)}}\\]</div>
<div class="why">전기장이 \\(1/r\\)이라 적분하면 \\(\\ln\\)이 나온다. 적분 구간이 \\(b\\)에서 \\(a\\)(바깥에서 안쪽으로)라 부호가 정리되어 양수 \\(\\ln(b/a)\\). 판서에서 \\(q\\)를 취소선으로 약분한 자리.</div>
<div class="say">판서 강조: \\(E=\\dfrac{{q}}{{2\\pi\\varepsilon_0L}}\\cdot\\dfrac1r\\)에 물결 밑줄, 최종 \\(C\\) 위에 「2πε₀L」 메모.</div>
<div class="analogy">TV 안테나선(동축 케이블)이 바로 이 축전기다 — 가운데 심선(\\(a\\))과 바깥 그물망(\\(b\\)). 길이 \\(L\\)이 길수록 용량이 커지고, 반지름은 <b>비율 \\(b/a\\)</b>로만 들어간다(둘을 같이 2배 해도 용량은 그대로).</div>
<div class="memo"><b>외울 것</b> 원통형 \\(C=\\dfrac{{2\\pi\\varepsilon_0L}}{{\\ln(b/a)}}\\) — \\(1/r\\)을 적분하면 \\(\\ln\\) · 적분 방향은 바깥(\\(b\\))에서 안(\\(a\\))으로 → 양수</div>
<figure class="board"><img data-photo="일반물리학2/2026-09-23/판서_2_원통형축전기_구형도입.jpg" alt="판서 2"><figcaption>판서 ② 원통형 축전기 (10:54)</figcaption></figure>
</section>

<section class="s" data-id="s4">
<h2>4. 구형 축전기 — 그리고 고립 도체구 4πε₀a</h2>
{fig_sph}
<div class="formula">\\[E=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{q}}{{r^2}},\\quad \\Delta V=\\frac{{q}}{{4\\pi\\varepsilon_0}}\\Big(\\frac1a-\\frac1b\\Big)=\\frac{{q}}{{4\\pi\\varepsilon_0}}\\frac{{b-a}}{{ab}},\\quad C=4\\pi\\varepsilon_0\\frac{{ab}}{{b-a}}=\\frac{{4\\pi\\varepsilon_0a}}{{1-a/b}}\\ \\xrightarrow{{b\\to\\infty}}\\ 4\\pi\\varepsilon_0a\\]</div>
<div class="why">\\(\\dfrac{{ab}}{{b-a}}\\)를 \\(b\\)로 나누면 \\(\\dfrac{{a}}{{1-a/b}}\\). 바깥 껍질을 무한대로 보내면 \\(a/b\\to0\\) → <b>도체구 하나</b>의 용량 \\(4\\pi\\varepsilon_0a\\). 단위 확인: \\(\\varepsilon_0\\)[F/m] × m = F.</div>
<div class="analogy">지구도 고립 도체구다: \\(a=6.4\\times10^6\\) m → \\(C\\approx7\\times10^{{-4}}\\) F. 행성만 한 공이 고작 0.7 mF — 패럿이 얼마나 큰 단위인지 감이 온다.</div>
<div class="memo"><b>외울 것</b> 구형 \\(C=4\\pi\\varepsilon_0\\dfrac{{ab}}{{b-a}}\\) · 고립 도체구 \\(C=4\\pi\\varepsilon_0a\\)(\\(b\\to\\infty\\)) · 세 축전기 모두 \\(\\varepsilon_0\\times\\)길이 차원</div>
<figure class="board"><img data-photo="일반물리학2/2026-09-23/판서_3_구형축전기_고립도체구.jpg" alt="판서 3"><figcaption>판서 ③ 구형 결과 → b→∞ 고립 도체구 (10:58)</figcaption></figure>
</section>

<section class="s" data-id="s5">
<h2>5. 유전체 — 분극 · 유전 상수 κ · 유도 전하</h2>
<p>誘電體(dielectric)의 D → "두 극(two)". 판 사이에 절연체(종이)를 끼우면 분자들이 <b>분극</b>되어 유전체 표면에 판과 반대 부호의 <b>유도 전하 ∓q′</b>가 생긴다.</p>
{fig_diel}
<div class="formula">\\[E=\\frac{{q-q'}}{{\\varepsilon_0A}}=\\frac{{E_0}}{{\\kappa}},\\qquad \\kappa=\\frac{{\\varepsilon}}{{\\varepsilon_0}}>1\\ (\\text{{유전 상수}}),\\qquad V=\\frac{{V_0}}{{\\kappa}},\\quad C=\\kappa C_0,\\qquad q'=\\Big(1-\\frac1\\kappa\\Big)q\\]</div>
<div class="why">판의 전하 \\(q\\)를 고정한 채(전지를 뗀 상태) 유전체를 넣으면 가우스면 안 알짜는 \\(q-q'\\)로 줄어 \\(E\\)가 준다 → 같은 간격이니 \\(V=Ed\\)도 준다 → \\(C=q/V\\)는 \\(\\kappa\\)배 <b>는다</b>. 9/4에 나온 "유전율이 크면 전기장이 작아진다"가 여기서 식이 된다.</div>
<div class="say">판서 강조: 「내부 전기장」 물결 밑줄 · 「분극」 동그라미 · \\(\\kappa=\\varepsilon/\\varepsilon_0\\) → 상대 유전율 ⇒ 「유전상수」 동그라미 · \\(q'=\\dfrac{{\\kappa-1}}{{\\kappa}}q\\) 물결 밑줄.</div>
<div class="analogy">유전체는 판 사이에 끼운 스펀지 완충재다. 판의 전하가 만드는 장을 일부 흡수(상쇄)해, 같은 전하로도 전압이 덜 걸린다 → 같은 전압까지 채우려면 전하를 더 넣을 수 있다 = 용량이 는다. 9/4의 "커튼(유전율)이 두꺼우면 전기장이 준다"가 여기서 식이 된다.</div>
<div class="pitfall">"전하 고정"(전지를 뗀 뒤 삽입)과 "전압 고정"(전지를 연결한 채 삽입)을 구별한다. 전하 고정: \\(q\\) 그대로, \\(E\\)·\\(V\\)가 \\(1/\\kappa\\). 전압 고정: \\(V\\) 그대로, 전지가 전하를 더 보내 \\(q=\\kappa q_0\\). 어느 쪽이든 \\(C=\\kappa C_0\\) — 용량은 그릇의 성질이라 조건과 무관.</div>
<div class="memo"><b>외울 것</b> \\(\\kappa=\\varepsilon/\\varepsilon_0&gt;1\\) · \\(E=E_0/\\kappa\\), \\(V=V_0/\\kappa\\), \\(C=\\kappa C_0\\)(전하 고정) · 유도 전하 \\(q'=(1-1/\\kappa)q\\) · 진공 \\(\\kappa=1\\), 종이 ≈ 3.5, 물 ≈ 80</div>
<details class="ex"><summary>\\(q=6.0\\,\\mu\\)C으로 충전된 평행판에 \\(\\kappa=3\\)인 유전체를 채우면 유도 전하 \\(q'\\)와 전기장 배율은?</summary><div class="body"><p>\\(q'=(1-\\tfrac13)\\times6.0=4.0\\,\\mu\\)C. \\(E=E_0/3\\) — 원래의 1/3. 내부 장을 \\((q-q')/\\varepsilon_0A=2.0\\,\\mu\\mathrm C/\\varepsilon_0A\\)로 확인해도 같다.</p></div></details>
<figure class="board"><img data-photo="일반물리학2/2026-09-23/판서_5_유전체_분극_유전상수.jpg" alt="판서 5"><figcaption>판서 ⑤ 유전체 — 분극·유도 전하·유전 상수 (11:14)</figcaption></figure>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 단위</div><div class="qb">\\(1\\,\\mu\\)F는 몇 F인가?</div><ol class="choices"><li data-ok="1">\\(10^{{-6}}\\) F</li><li>\\(10^{{-3}}\\) F</li><li>\\(10^{{-9}}\\) F</li><li>\\(10^{{6}}\\) F</li></ol><div class="ans">μ = \\(10^{{-6}}\\). "정확히 기억해라"(9/18).</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 평행판</div><div class="qb">판 넓이 \\(A=0.010\\ \\mathrm{{m^2}}\\), 간격 \\(d=1.0\\) mm인 평행판 축전기의 용량은? (\\(\\varepsilon_0=8.85\\times10^{{-12}}\\))</div><ol class="choices"><li data-ok="1">약 \\(8.9\\times10^{{-11}}\\) F (89 pF)</li><li>약 \\(8.9\\times10^{{-14}}\\) F</li><li>약 \\(8.9\\times10^{{-8}}\\) F</li><li>약 \\(1.1\\times10^{{10}}\\) F</li></ol><div class="ans">\\(C=\\varepsilon_0A/d\\), \\(d=0.0010\\) m.</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 용량 구하는 순서</div><div class="qb">축전기의 전기 용량을 구하는 세 단계의 올바른 순서는?</div><ol class="choices"><li data-ok="1">가우스 법칙으로 \\(E\\) → \\(\\Delta V=-\\int\\vec E\\cdot d\\vec r\\) → \\(C=q/\\Delta V\\)</li><li>\\(C=q/\\Delta V\\) → 가우스 법칙 → 선적분</li><li>선적분으로 \\(q\\) → 가우스 법칙으로 \\(V\\) → 나눈다</li><li>쿨롱 법칙으로 힘 → 일 → \\(C\\)</li></ol><div class="ans">분자(전하)는 가우스, 분모(전위차)는 선적분. 세 축전기 모두 이 순서.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 고립 도체구</div><div class="qb">반지름 \\(a\\)인 고립 도체구의 전기 용량은?</div><ol class="choices"><li data-ok="1">\\(4\\pi\\varepsilon_0a\\)</li><li>\\(4\\pi\\varepsilon_0a^2\\)</li><li>\\(\\varepsilon_0/a\\)</li><li>\\(2\\pi\\varepsilon_0a\\)</li></ol><div class="ans">구형 \\(4\\pi\\varepsilon_0\\frac{{ab}}{{b-a}}\\)에서 \\(b\\to\\infty\\).</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 유전체</div><div class="qb">전하 \\(q\\)를 고정한 평행판에 유전 상수 \\(\\kappa\\)인 유전체를 채우면?</div><ol class="choices"><li data-ok="1">전기장은 \\(E_0/\\kappa\\)로 줄고 전기 용량은 \\(\\kappa C_0\\)로 는다</li><li>전기장이 \\(\\kappa E_0\\)로 늘고 용량은 \\(C_0/\\kappa\\)로 준다</li><li>둘 다 변하지 않는다</li><li>전하가 \\(\\kappa q\\)로 는다</li></ol><div class="ans">유도 전하가 판의 장을 상쇄 → \\(E\\)↓ → \\(V\\)↓ → \\(C=q/V\\)↑.</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 원통형 유도</div><div class="qb">길이 \\(L\\), 안쪽 반지름 \\(a\\), 바깥 반지름 \\(b\\)인 동축 원통 축전기의 용량을 유도하라(세 단계).</div><div class="ans">① \\(E\\cdot2\\pi rL=q/\\varepsilon_0\\) → \\(E=\\frac{{q}}{{2\\pi\\varepsilon_0L}}\\frac1r\\) ② \\(\\Delta V=\\frac{{q}}{{2\\pi\\varepsilon_0L}}\\ln\\frac ba\\) ③ \\(C=\\frac{{2\\pi\\varepsilon_0L}}{{\\ln(b/a)}}\\). \\(q\\)가 약분되어 기하만 남는다.</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
