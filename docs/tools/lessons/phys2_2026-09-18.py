# -*- coding: utf-8 -*-
"""일반물리학2 · 2026-09-18 수업 노트 (근거: 2026-09-18/정리.md — 녹음 43분·판서 12장·아토 손메모 「시험문제 출제」「3중 1개 나옴」)"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\일반물리학2\_수업노트\2026-09-18.html"

def ellipse(cx, cy, rx, ry, color=INK, w=2, fill="none", dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{color}" stroke-width="{w}"{d}/>'

fig_gv = canvas(560, 230,
    text(150, 30, "중력 (13장)", 14, INK, "middle", True),
    circle(150, 190, 40, INK, w=2, fill="rgba(31,42,68,.08)"), text(150, 195, "M", 14, INK, "middle", True),
    dot(150, 100, "", 6, INK), text(168, 96, "m", 13, INK),
    arrow(150, 92, 150, 60, GRAY, "dr (밖으로)", 1.8, 46, 4, dash="4 3"),
    arrow(150, 108, 150, 140, BLUE, "F (안으로 당김)", 2.4, 58, 4),
    text(150, 222, "U(r) = −GMm/r", 13, INK, "middle"),
    text(410, 30, "전기 (같은 부호)", 14, INK, "middle", True),
    charge(410, 190, "+", "", 26, RED), text(410, 196, "q", 14, RED, "middle", True),
    dot(410, 100, "", 6, INK), text(428, 96, "q₀ (시험전하)", 13, INK),
    arrow(410, 92, 410, 60, GRAY, "dr (밖으로)", 1.8, 46, 4, dash="4 3"),
    arrow(410, 92, 410, 40, RED, "", 0),
    arrow(410, 88, 410, 52, GREEN, "F (밖으로 밈)", 2.4, 56, 4),
    text(410, 222, "U(r) = +(1/4πε₀)·q₀q/r", 13, INK, "middle"),
    cap="같은 틀, 힘의 방향만 반대. 둘 다 \\(r\\)에서 무한대까지 옮기는 일을 재서 \\(U(\\infty)=0\\)으로 둔다.")

fig_sum = canvas(560, 220,
    rect(180, 40, 200, 140, GRAY, dash="5 4"), text(280, 30, "한 변 a", 13, GRAY, "middle"),
    charge(180, 40, "+", "q₁", 16, RED), charge(380, 40, "+", "q₂", 16, RED), charge(180, 180, "−", "q₃", 16, BLUE), charge(380, 180, "+", "q₄", 16, RED),
    dot(280, 110, "", 6, INK), text(296, 106, "P (중심)", 13, INK),
    line(180, 40, 280, 110, GRAY, 1, "3 3"), line(380, 40, 280, 110, GRAY, 1, "3 3"), line(180, 180, 280, 110, GRAY, 1, "3 3"), line(380, 180, 280, 110, GRAY, 1, "3 3"),
    text(232, 66, "r", 12, GRAY), text(330, 66, "r", 12, GRAY), text(232, 156, "r", 12, GRAY), text(330, 156, "r", 12, GRAY),
    text(470, 110, "V = (1/4πε₀)(q₁+q₂+q₃+q₄)/r", 12.5, INK, "middle"), text(470, 130, "부호만 넣고 더한다", 12.5, GREEN, "middle", True),
    cap="여러 점전하의 전위: 방향이 없으니 각 전하의 \\(q_i/r_i\\)를 <b>부호를 포함해</b> 그냥 더한다. 단위벡터 금지.")

fig_dip = canvas(560, 250,
    charge(220, 150, "+", "+q", 16, RED), charge(220, 210, "−", "−q", 16, BLUE),
    text(196, 186, "d", 13, GRAY, "middle"), dot(220, 180, "", 3, GRAY), text(238, 184, "O", 12, GRAY),
    dot(440, 40, "P", 5, INK),
    line(220, 150, 440, 40, RED, 1.5), text(320, 88, "r₊", 13, RED, "middle"),
    line(220, 210, 440, 40, BLUE, 1.5), text(345, 140, "r₋", 13, BLUE, "middle"),
    line(220, 180, 440, 40, GRAY, 1.2, "5 4"), text(330, 118, "r", 12, GRAY, "middle"),
    path("M220 180 A 22 22 0 0 0 238 167", GRAY, 1.2), text(246, 172, "θ", 12, GRAY),
    line(220, 150, 243, 201, GREEN, 1.5, "3 3"), text(262, 210, "수선 → 차이 ≈ d cosθ", 12, GREEN),
    cap="쌍극자 전위 증명의 핵심: \\(r_--r_+\\)를 \\(d\\cos\\theta\\)로 놓으려면 수선이 필요한데 삼각형이 이등변이라 정확히 수직이 아니다 → \\(r\\gg d\\) 근사.")

fig_line = canvas(560, 190,
    axis(40, 150, 530, 150, "x", ""),
    rect(120, 138, 300, 24, RED, fill="rgba(224,49,49,.12)", sw=2), text(270, 128, "+ + + + + + + + + + + +", 13, RED, "middle"),
    brace_label(120, 420, 178, "0 ~ L (선밀도 λ)"),
    dot(120, 50, "", 6, INK), text(136, 46, "P (수직 거리 a)", 13, INK), line(120, 50, 120, 138, GRAY, 1.2, "5 4"), text(104, 100, "a", 13, GRAY, "middle"),
    rect(300, 138, 12, 24, INK, fill="rgba(31,42,68,.35)", sw=1), text(306, 176, "dq = λ dx", 12, INK, "middle"),
    line(306, 138, 120, 50, GREEN, 1.5, "3 3"), text(230, 84, "√(x²+a²)", 12, GREEN, "middle"),
    cap="직선 도선의 전위: 전기장 때(22장)와 배치를 바꿔 점 P를 도선 <b>옆</b>에 둔다. 각 조각까지 거리는 \\(\\sqrt{x^2+a^2}\\).")

fig_ring = canvas(560, 200,
    ellipse(280, 150, 120, 32, RED, 2.5, "rgba(224,49,49,.06)"), text(280, 194, "고리 위 모든 dq → P까지 거리가 전부 같다", 13, INK, "middle"),
    line(280, 150, 280, 40, GRAY, 1.2, "5 4"), text(292, 100, "z", 13, GRAY), dot(280, 40, "", 5, INK), text(296, 36, "P", 13, INK),
    line(160, 150, 280, 40, GREEN, 1.2, "3 3"), line(400, 150, 280, 40, GREEN, 1.2, "3 3"), line(280, 182, 280, 40, GREEN, 1.2, "3 3"),
    text(190, 92, "√(z²+R²)", 12, GREEN, "middle"), text(372, 92, "√(z²+R²)", 12, GREEN, "middle"),
    cap="원형 도선의 전위가 교재에 따로 없는 이유: 스칼라라 상쇄가 없고 거리가 전부 같아 점전하 꼴 \\(q/\\sqrt{z^2+R^2}\\)이 바로 나온다.")

fig_cap = canvas(560, 170,
    plate(160, 50, 240, 16, "+", 8), plate(160, 110, 240, 16, "−", 8),
    arrow(280, 70, 280, 106, GREEN, "E", 2.4, 14, 0), brace_label(410, 410, 0, ""), line(420, 66, 420, 110, GRAY, 1.2), text(432, 92, "d", 13, GRAY),
    text(120, 62, "+q", 13, RED, "end"), text(120, 122, "−q", 13, BLUE, "end"),
    text(280, 150, "C = q / V_C  [C/V = F(패럿)]", 14, INK, "middle", True),
    cap="25장 도입: 전기 용량 = 전위차 1 V당 얼마나 많은 전하를 담는가. 1 μF = 10⁻⁶ F.")

fig_alt = canvas(560, 220,
    charge(150, 110, "+", "", 16, RED),
    circle(150, 110, 40, GRAY, dash="4 3", w=1.2), circle(150, 110, 65, GRAY, dash="4 3", w=1.2), circle(150, 110, 90, GRAY, dash="4 3", w=1.2),
    text(150, 66, "V 높음", 11, INK, "middle"), text(150, 40, "V 낮음", 11, INK, "middle"), text(150, 16, "V → 0 (무한대)", 11, GRAY, "middle"),
    arrow(196, 110, 250, 110, GREEN, "E (내리막 방향)", 2.2, 34, -8),
    axis(320, 190, 540, 190, "r", ""), text(312, 40, "V, E", 12, INK, "end"),
    path("M330 40 C 360 120, 420 150, 540 170", RED, 2.5), text(482, 152, "V ∝ 1/r", 12, RED),
    path("M330 40 C 345 150, 400 178, 540 186", GREEN, 2.5), text(400, 176, "E ∝ 1/r²", 12, GREEN),
    cap="전위는 고도 지도(등고선), 전기장은 그 내리막의 기울기 \\(E=-dV/dr\\). 점전하에서 \\(V\\propto1/r\\), \\(E\\propto1/r^2\\) — 항상 전위가 한 차수 낮다.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>일반물리학2 · 9/18 전위 — 점전하 · 여러 점전하 · 증명 3제</title></head><body>
<header>
<h1>24장 전기 퍼텐셜(전위) — "무한대로 보내서 가져온 일"</h1>
<p class="lead">오늘 이론은 하나뿐이다: 전하를 <b>무한대에서 가져오는 일</b>이 위치 에너지고, 그것을 시험전하로 나눈 것이 전위. 나머지는 "여섯 가지 전하 분포"에 대해 그 계산을 반복하는 것 — 그중 <b>증명 3제 중 하나가 20점 주관식</b>으로 나온다.</p>
<p class="meta"><span>녹음 43분</span><span>판서 12장</span><span>중간 범위 확정: 27장 RC 회로까지</span><span>25장 도입</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 1학기 중력과 똑같은 틀 — 전기 위치 에너지 U(r)</h2>
<p>질량 \\(M\\) 옆 거리 \\(r\\)에 \\(m\\)을 두면 중력이 <b>안쪽</b>으로 당긴다. \\(r\\)에서 무한대까지 끌어올리는 일 \\(W=\\int_r^\\infty F\\,dr\\)을 재고, 무한대의 위치 에너지를 0으로 두면 \\(U(r)=-GMm/r\\). 전기도 똑같이 한다 — 단, 같은 부호 전하는 <b>밖으로</b> 민다.</p>
{fig_gv}
<div class="formula">\\[dW=\\vec F_E\\cdot d\\vec r=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{q_0q}}{{r^2}}dr,\\quad W=\\frac{{q_0q}}{{4\\pi\\varepsilon_0}}\\int_r^\\infty\\frac{{dr}}{{r^2}}=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{q_0q}}{{r}}=-\\Delta U\\] \\[U(\\infty)=0\\ \\Rightarrow\\ U(r)=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{q_0q}}{{r}}\\ [\\mathrm J]\\]</div>
<div class="why">\\(W=-\\Delta U=-(U_f-U_i)\\). 무한대(\\(U_f=0\\))까지 보냈으니 \\(W=U(r)\\) — "무한대로 보내서 가져온다"는 말이 이 한 줄이다. 이름은 <b>정전기 에너지</b>: 靜 = 시간에 무관(전류가 나오기 전까지 전하는 시간에 무관).</div>
<div class="analogy">물건을 지붕 위로 올리는 데 든 일이 그대로 "높이 에너지"로 저장되듯, 전하를 무한대에서 끌어온(또는 밀어낸) 일이 \\(U\\)로 저장된다.</div>
<div class="memo"><b>외울 것</b> \\(U(r)=\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{q_0q}}{{r}}\\) [J] · \\(U(\\infty)=0\\) · \\(W=-\\Delta U\\) · 중력 \\(-GMm/r\\)과 같은 틀, 부호만 다르다</div>
<figure class="board"><img data-photo="일반물리학2/2026-09-18/판서_1_전기위치에너지_U_V유도.jpg" alt="판서 1"><figcaption>판서 ① 전기 위치 에너지 → 전위 유도 (10:39)</figcaption></figure>
</section>

<section class="s" data-id="s2">
<h2>2. 전위 V = U / q₀ — 단위는 볼트</h2>
<div class="formula">\\[V(r)=\\frac{{U}}{{q_0}}=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{q}}{{r}}\\ [\\mathrm{{J/C=V}}],\\qquad \\Delta V=-\\int_i^f\\vec E\\cdot d\\vec r\\]</div>
<div class="why">전기장이 "힘 ÷ 시험전하"였듯 전위는 "에너지 ÷ 시험전하". 시험전하와 무관한, 전하 \\(q\\)가 만든 공간의 성질만 남는다. 실질적으로는 두 점 사이의 <b>전위차</b>를 쓰기 때문에 교수님은 "뒤에 '차'를 붙여 전위차라고 하는 게 낫다"고 했다.</div>
<div class="say">"수학적으로 −ΔU를 그냥 나누면 안 되지만, 하여튼 이렇게 정의한다." · "여섯 가지 중 한 가지 했다." (점전하 → 여러 점전하 → 쌍극자 → 직선 → 원형 → 원판)</div>
{fig_alt}
<div class="analogy">전기장이 "바람의 세기 지도"라면 전위는 "고도 지도". 바람(힘)은 고도가 급하게 변하는 곳에서 세다 — \\(E=-dV/dr\\).</div>
<div class="memo"><b>외울 것</b> \\(V=U/q_0\\) [J/C = V] · 점전하 \\(V=\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{q}}{{r}}\\)(제곱 아님) · \\(\\Delta V=-\\int\\vec E\\cdot d\\vec r\\) · \\(V(\\infty)=0\\)</div>
<figure class="board"><img data-photo="일반물리학2/2026-09-18/판서_2_전위정의_볼트_여러점전하.jpg" alt="판서 2"><figcaption>판서 ② 전위 정의·단위·여러 점전하 (10:45)</figcaption></figure>
</section>

<section class="s" data-id="s3">
<h2>3. 여러 점전하 — 스칼라라서 그냥 더한다 ★★</h2>
{fig_sum}
<div class="formula">\\[V=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\sum_i\\frac{{q_i}}{{r_i}}\\qquad(\\text{{단위벡터를 붙이면 안 된다 — 방향 없는 스칼라}})\\]</div>
<div class="say">"책에 전하 4개 놓고 전기 퍼텐셜 구하라는 그림 많이 나오지? 이거 시험 문제 많이 나오는 놈. 내겠다는 얘기랑 똑같다." — 판서 사진에 대표님 손메모 「시험문제 출제」.</div>
<div class="pitfall">전기장(22장)은 벡터라 성분으로 나눠 더했지만, 전위는 <b>부호만 넣고</b> 숫자로 더한다. 음전하는 음의 전위. 여기서 벡터 습관이 튀어나오면 틀린다.</div>
<div class="analogy">전위는 통장 잔고 같은 숫자다. 입금(+q)과 출금(−q)을 방향 없이 더하면 끝 — 화살표를 그릴 필요가 없다. 전기장은 "어느 방향으로 얼마나 밀리나"라 화살표가 필요했던 것과 대비.</div>
<details class="ex"><summary>한 변 \\(a=0.10\\) m인 정사각형 꼭짓점에 \\(+2.0\\,\\mu\\)C 네 개 — 중심의 전위</summary><div class="body"><p>중심까지 거리는 네 개 모두 \\(r=a/\\sqrt2=0.0707\\) m. \\(V=4\\times9\\times10^9\\times\\dfrac{{2.0\\times10^{{-6}}}}{{0.0707}}\\approx1.0\\times10^{{6}}\\) V.</p><p>같은 배치의 전기장은 대칭으로 0이지만 전위는 0이 아니다 — 스칼라와 벡터의 차이.</p></div></details>
<div class="memo"><b>외울 것</b> \\(V=\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\sum\\dfrac{{q_i}}{{r_i}}\\) · 부호 포함 스칼라 합 · 단위벡터 금지 · "전하 4개 그림"은 시험 단골</div>
</section>

<section class="s" data-id="s4">
<h2>4. 증명 ① 전기 쌍극자의 전위 — 왜 근사가 필요한가</h2>
<p>\\(+q\\), \\(-q\\)가 거리 \\(d\\)로 놓여 있고 점 P까지 \\(r_+\\), \\(r_-\\). "\\(d\\)는 무지무지하게 작다" — 그런데도 <b>거리 차</b> 때문에 전위가 남는다.</p>
{fig_dip}
<div class="formula">\\[V=V_++V_-=\\frac{{q}}{{4\\pi\\varepsilon_0}}\\Big(\\frac{{1}}{{r_+}}-\\frac{{1}}{{r_-}}\\Big)=\\frac{{q}}{{4\\pi\\varepsilon_0}}\\frac{{r_--r_+}}{{r_+r_-}}\\ \\xrightarrow{{r\\gg d}}\\ \\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{qd\\cos\\theta}}{{r^2}}=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{p\\cos\\theta}}{{r^2}}\\]</div>
<div class="why">+q에서 \\(r_-\\)선에 수선을 내리면 거리 차가 \\(d\\cos\\theta\\)가 되어야 하는데, 삼각형이 이등변이라 그 자리가 정확히 수직이 아니다. 그래서 \\(r\\gg d\\)일 때만 \\(r_--r_+\\approx d\\cos\\theta\\), \\(r_+r_-\\approx r^2\\)로 놓는다 — 교수님: "그걸 어떻게 처리하느냐가 이 문제의 핵심".</div>
<div class="say">"깔끔하게 떨어지지. 시험 문제 한 문제 해결했다. 증명 3개 중 하나 나온다. 주관식이라 쭉쭉 써 놔야 점수 받는다. 이건 틀리면 절대 안 된다. 물리적 의미는 없다."</div>
<div class="analogy">스피커 두 개가 서로 반대 위상으로 울리면 멀리서는 거의 안 들린다. 조금 남는 소리는 "어느 스피커가 더 가까운가"의 차이(\\(d\\cos\\theta\\))에서 온다 — 그래서 \\(\\cos\\theta\\)가 붙고, 옆(\\(\\theta=90^\\circ\\))에서는 두 거리가 같아 0.</div>
<div class="memo"><b>외울 것</b> 쌍극자 전위 \\(V=\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{p\\cos\\theta}}{{r^2}}\\), \\(p=qd\\) · 근사 두 줄: \\(r_--r_+\\approx d\\cos\\theta\\), \\(r_+r_-\\approx r^2\\) · 전기장 때 쌍극자는 \\(1/z^3\\), 전위는 \\(1/r^2\\) — 항상 전위가 한 차수 낮다(\\(E=-dV/dr\\))</div>
<figure class="board"><img data-photo="일반물리학2/2026-09-18/판서_4_전기쌍극자전위_증명.jpg" alt="판서 4"><figcaption>판서 ④ 쌍극자 전위 증명 (10:49) — 손메모 「증명문제 출제」</figcaption></figure>
</section>

<section class="s" data-id="s5">
<h2>5. 증명 ② 직선 도선 · 원형 도선(교재에 없는 이유) · 증명 ③ 원판</h2>
<h3>직선 도선 — 점전하 전위를 적분할 뿐</h3>
{fig_line}
<div class="formula">\\[dV=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{\\lambda\\,dx}}{{\\sqrt{{x^2+a^2}}}},\\quad V=\\frac{{\\lambda}}{{4\\pi\\varepsilon_0}}\\int_0^L\\frac{{dx}}{{\\sqrt{{x^2+a^2}}}}=\\frac{{\\lambda}}{{4\\pi\\varepsilon_0}}\\ln\\frac{{L+\\sqrt{{L^2+a^2}}}}{{a}}\\]</div>
<div class="say">적분 공식 \\(\\int\\frac{{dx}}{{\\sqrt{{x^2+a^2}}}}=\\ln(x+\\sqrt{{x^2+a^2}})\\)는 "시험에 공식을 준다"(책에도 있다). · "점전하의 전위와 똑같다. 굳이 쉽다."</div>
<h3>원형 도선 — 교재에 없다, 왜?</h3>
{fig_ring}
<div class="formula">\\[V=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{q}}{{\\sqrt{{z^2+R^2}}}}\\qquad(\\text{{r 제곱이 아니다 — 전기장과 헷갈리지 말 것}})\\]</div>
<div class="why">전기장은 벡터라 좌우가 상쇄되어 \\(\\cos\\theta\\)가 붙었지만, 전위는 스칼라라 상쇄가 없고 모든 \\(dq\\)까지 거리가 \\(\\sqrt{{z^2+R^2}}\\)로 같다. 그래서 점전하 꼴이 바로 나오고 교재에 따로 실을 게 없다.</div>
<div class="analogy">원형 극장은 모든 좌석이 무대에서 같은 거리다. 전위는 거리만 보는 스칼라라 좌석(전하 조각)마다 기여가 똑같고, 개수(\\(q\\))만 곱하면 된다. 전기장은 좌석마다 "무대를 보는 방향"이 달라 상쇄가 생겼던 것.</div>
<h3>원판 — 고리 쌓기 + 치환</h3>
<div class="formula">\\[dV=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{\\sigma\\,2\\pi r\\,dr}}{{\\sqrt{{z^2+r^2}}}}\\ \\Rightarrow\\ V=\\frac{{\\sigma}}{{2\\varepsilon_0}}\\int_0^R\\frac{{r\\,dr}}{{\\sqrt{{z^2+r^2}}}}\\ \\xrightarrow{{a^2=z^2+r^2}}\\ \\frac{{\\sigma}}{{2\\varepsilon_0}}\\Big(\\sqrt{{z^2+R^2}}-z\\Big)\\]</div>
<div class="why">치환 \\(a^2=z^2+r^2\\), \\(a\\,da=r\\,dr\\); \\(r=0\\to a=z\\), \\(r=R\\to a=\\sqrt{{z^2+R^2}}\\) → \\(\\int da=a\\). 22장 원판 전기장과 같은 치환이지만 적분이 \\(1/a^2\\)가 아니라 \\(1/a\\)라 결과가 더 단순하다.</div>
<div class="say"><b>물리적 의미(시험에 같이 쓰라)</b>: \\(R\\to\\infty\\) 무한 평면이면 전기장 \\(E=\\sigma/2\\varepsilon_0\\)(가우스 법칙과 연결). "이 말을 알아들어야 한다. 전체 에너지·전기장 개념까지 쓰는 게 시험 문제."</div>
<div class="memo"><b>검산</b>: \\(E=-\\dfrac{{dV}}{{dz}}=\\dfrac{{\\sigma}}{{2\\varepsilon_0}}\\Big(1-\\dfrac{{z}}{{\\sqrt{{z^2+R^2}}}}\\Big)\\) — 9/11의 원판 전기장과 정확히 일치. 전위를 미분하면 전기장이 나온다는 것을 시험 답안 끝에 한 줄 넣으면 "물리적 의미"가 된다.</div>
<div class="say">"세 개(쌍극자·직선 도선·원판) 중 하나가 20점짜리 문제. 어떤 게 나올지는 모른다. 전부 증명하고 물리적 의미까지." — 손메모 「3중 1개 나옴」.</div>
<figure class="board"><img data-photo="일반물리학2/2026-09-18/판서_8_증명3제_시험출제표시.jpg" alt="판서 8"><figcaption>판서 ⑧ 증명 3제 묶음 (10:59)</figcaption></figure>
</section>

<section class="s" data-id="s6">
<h2>6. 25장 도입 — 축전기와 전기 용량 (다음 시간의 부품)</h2>
{fig_cap}
<p><b>축전기 C</b>(전기 에너지 저장) ↔ <b>유도기 L</b>(자기 에너지 저장, 기말). 축전기 전위차 \\(V_C=q/C\\).</p>
<div class="formula">\\[C=\\frac{{q}}{{V_C}}\\ [\\mathrm{{C/V=F}}],\\qquad 1\\,\\mu\\mathrm F=10^{{-6}}\\ \\mathrm F\\]</div>
<div class="say">"1 μF = 10⁻⁶ F — 정확히 기억해라"(제일 중요하다고 강조). · "당장 시험이면 25장만 공부하면 된다 — 가우스 법칙도 전위 계산도 다 25장에 들어 있다."</div>
<div class="why">전기 용량을 구하는 순서는 늘 같다: ① 가우스 법칙으로 \\(q\\)와 \\(E\\)(가우스면 3종 = 축전기 3종: 평행판·원통형·구형) ② \\(\\Delta V=-\\int_i^f\\vec E\\cdot d\\vec r\\) ③ \\(C=q/\\Delta V\\). 23장과 24장이 여기서 합쳐진다.</div>
<div class="analogy">축전기는 댐이다. 같은 수위(전압)에서 얼마나 많은 물(전하)을 가두느냐가 용량. 댐이 넓고(\\(A\\)) 벽이 가까우면(\\(d\\)) 더 많이 담는다 — 9/23의 \\(C=\\varepsilon_0A/d\\)가 이 말이다.</div>
<div class="memo"><b>중간고사 범위 확정</b>: 27장 RC 회로까지, 28장 제외. "시험 문제는 준 강의노트에서 조금씩 응용해서 낸다."</div>
<figure class="board"><img data-photo="일반물리학2/2026-09-18/판서_11_전기용량_패럿_전위차유도.jpg" alt="판서 11"><figcaption>판서 ⑪ 전기 용량 정의·단위·전위차 (11:13)</figcaption></figure>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 전위의 단위</div><div class="qb">전위 \\(V\\)의 단위로 옳은 것은?</div><ol class="choices"><li data-ok="1">J/C = V(볼트)</li><li>N/C</li><li>J·C</li><li>C/V</li></ol><div class="ans">\\(V=U/q_0\\) → J/C. N/C은 전기장, C/V = F는 전기 용량.</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 여러 점전하</div><div class="qb">여러 점전하가 만드는 전위를 구할 때 옳은 것은?</div><ol class="choices"><li data-ok="1">\\(V=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\sum q_i/r_i\\) — 부호를 넣어 <b>스칼라</b>로 더한다</li><li>각 전하의 전위를 벡터로 더한다</li><li>\\(V=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\sum q_i/r_i^2\\)</li><li>크기만 더하고 부호는 무시한다</li></ol><div class="ans">"단위벡터 붙이면 안 된다". \\(1/r^2\\)은 전기장. 음전하는 음의 전위.</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 쌍극자 전위</div><div class="qb">쌍극자 모멘트 \\(p\\)인 전기 쌍극자에서 \\(r\\gg d\\)인 점(축과 각 θ)의 전위는?</div><ol class="choices"><li data-ok="1">\\(\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{p\\cos\\theta}}{{r^2}}\\)</li><li>\\(\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{p\\cos\\theta}}{{r^3}}\\)</li><li>\\(\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{p}}{{r}}\\)</li><li>\\(\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{2p}}{{r^3}}\\)</li></ol><div class="ans">전위는 \\(1/r^2\\), 축의 전기장은 \\(1/r^3\\)(22장). \\(\\theta=90^\\circ\\)면 0.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 원형 도선의 전위</div><div class="qb">반지름 \\(R\\), 전하 \\(q\\)인 고리의 축에서 거리 \\(z\\)인 점의 전위는?</div><ol class="choices"><li data-ok="1">\\(\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{q}}{{\\sqrt{{z^2+R^2}}}}\\)</li><li>\\(\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{qz}}{{(z^2+R^2)^{{3/2}}}}\\)</li><li>\\(\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{q}}{{z^2+R^2}}\\)</li><li>\\(\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{q}}{{z}}\\)</li></ol><div class="ans">모든 \\(dq\\)까지 거리가 같고 스칼라라 상쇄 없이 더한다 → 점전하 꼴. 2번은 전기장.</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 증명 3제</div><div class="qb">"셋 중 하나가 20점 주관식"이라고 한 증명 3제는?</div><ol class="choices"><li data-ok="1">전기 쌍극자의 전위 · 직선 도선의 전위 · 원판의 전위</li><li>점전하의 전위 · 원형 도선의 전위 · 무한 평면의 전기장</li><li>가우스 법칙 · 쿨롱 법칙 · 전위 정의</li><li>평행판 · 원통형 · 구형 축전기</li></ol><div class="ans">판서 ⑧ 「★전기쌍극자 / ★직선도선 / ★원판」. 과정을 쭉 쓰고 물리적 의미(원판 R→∞ = 무한 평면 E=σ/2ε₀)까지.</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 증명 — 쌍극자</div><div class="qb">\\(+q\\), \\(-q\\)가 거리 \\(d\\)인 쌍극자에서 중심으로부터 \\(r\\)(축과 각 θ)인 점의 전위가 \\(\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{p\\cos\\theta}}{{r^2}}\\)임을 보이는 핵심 단계 두 줄을 쓰라.</div><div class="ans">① 겹침 \\(V=\\frac{{q}}{{4\\pi\\varepsilon_0}}\\big(\\frac{{1}}{{r_+}}-\\frac{{1}}{{r_-}}\\big)=\\frac{{q}}{{4\\pi\\varepsilon_0}}\\frac{{r_--r_+}}{{r_+r_-}}\\) ② \\(r\\gg d\\): 수선이 정확히 수직이 아니어서 근사 \\(r_--r_+\\approx d\\cos\\theta\\), \\(r_+r_-\\approx r^2\\) → \\(V=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{qd\\cos\\theta}}{{r^2}}\\), \\(p=qd\\).</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
