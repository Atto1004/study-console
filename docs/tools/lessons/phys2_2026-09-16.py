# -*- coding: utf-8 -*-
"""일반물리학2 · 2026-09-16 수업 노트 (근거: 2026-09-16/정리.md — 녹음 45분·판서 8장·필기 p.10~11·교재 23장 연습문제 사진)"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\일반물리학2\_수업노트\2026-09-16.html"

fig_re = canvas(560, 200,
    # 무한 평면: 앞뒤 두 장
    rect(70, 60, 8, 90, RED, fill="rgba(224,49,49,.25)", sw=1), text(74, 50, "+판(σ)", 12, RED, "middle"),
    rect(30, 70, 88, 70, PINK, dash="6 4"), arrow(74, 105, 24, 105, GREEN, "", 2), arrow(74, 105, 124, 105, GREEN, "", 2),
    text(74, 168, "면 2A", 13, INK, "middle"), text(74, 186, "E·2A = q/ε₀ → σ/2ε₀", 12, INK, "middle"),
    # 직선 도선: 원통
    line(280, 55, 280, 155, RED, 3), text(280, 45, "직선 도선(λ)", 12, RED, "middle"),
    rect(245, 70, 70, 70, PINK, dash="6 4", rx=10), arrow(285, 105, 335, 105, GREEN, "", 2), arrow(275, 105, 225, 105, GREEN, "", 2),
    text(280, 168, "원통 옆면 2πrL", 13, INK, "middle"), text(280, 186, "E·2πrL = λL/ε₀ → λ/2πε₀r", 12, INK, "middle"),
    # 점전하: 구
    charge(460, 105, "+", "", 14, RED), circle(460, 105, 42, PINK, dash="6 4", w=2), radial(460, 105, 6, 20, 50, GREEN),
    text(460, 168, "구 4πr²", 13, INK, "middle"), text(460, 186, "E·4πr² = q/ε₀ → q/4πε₀r²", 12, INK, "middle"),
    cap="가우스면 3종으로 지난 시간 적분 결과를 한 줄에 다시 얻는다. 무한 평면은 전기력선이 양쪽으로 나가므로 2A.")

def dots_in(cx, cy, R, n=14, color=RED):
    """구 안에 고르게 — 동심원 두 겹(0.42R·0.78R)에 결정적으로 배치해 기호끼리·점선 원(≈0.53R)과 겹치지 않는다"""
    import math; s = ""
    m1 = max(4, round(n * .38)); per = [(0.42, m1), (0.78, n - m1)]
    for ring, m in per:
        for i in range(m):
            a = 2 * math.pi * i / m + (0.3 if ring > 0.5 else 0.9)
            s += f'<text x="{cx+R*ring*math.cos(a):.1f}" y="{cy+R*ring*math.sin(a)+4:.1f}" font-size="11" fill="{color}" text-anchor="middle" paint-order="stroke" stroke="#fff" stroke-width="2">+</text>'
    return s
def dots_on(cx, cy, R, n=14, color=RED):
    import math; s = ""
    for i in range(n):
        a = 2 * math.pi * i / n
        s += f'<text x="{cx+R*math.cos(a):.1f}" y="{cy+R*math.sin(a)+4:.1f}" font-size="11" fill="{color}" text-anchor="middle">+</text>'
    return s

fig_cond = canvas(560, 240,
    circle(150, 120, 70, INK, w=2.5, fill="rgba(31,42,68,.05)"), dots_on(150, 120, 62), text(150, 210, "도체구: 전하는 표면에만", 13, INK, "middle"),
    circle(150, 120, 34, PINK, dash="6 4"), text(150, 128, "E = 0", 13, GREEN, "middle", True), text(150, 104, "r < R", 11, PINK, "middle"),
    circle(410, 120, 70, INK, w=2.5, fill="rgba(31,42,68,.05)"), dots_on(410, 120, 62),
    circle(410, 120, 100, PINK, dash="6 4"), radial(410, 120, 8, 74, 108, GREEN), text(410, 236, "r ≥ R: E·4πr² = q/ε₀ → 점전하와 같다", 12.5, INK, "middle"),
    cap="고립 도체구: 안쪽 가우스면에는 전하가 없어 \\(E=0\\), 바깥에서는 중심에 점전하 \\(q\\)가 있는 것과 같다.")

fig_ins = canvas(560, 250,
    circle(150, 120, 75, RED, w=2.5, fill="rgba(224,49,49,.05)"), dots_in(150, 120, 75, 22), text(150, 214, "부도체구: 전하가 안에도 균일", 13, INK, "middle"),
    circle(150, 120, 40, PINK, dash="6 4"), text(184, 84, "r", 12, PINK),
    text(150, 236, "안의 전하 q′ = (r³/R³) q → E ∝ r", 12.5, INK, "middle"),
    axis(300, 200, 540, 200, "r", "E"), line(300, 200, 400, 90, GREEN, 3), path("M400 90 C 440 150, 490 175, 540 185", GREEN, 3),
    line(400, 90, 400, 200, GRAY, 1, "4 4"), text(400, 216, "R", 13, INK, "middle"), text(326, 124, "∝ r", 12, GREEN, "middle"), text(470, 130, "∝ 1/r²", 12, GREEN, "middle"),
    cap="부도체구의 E–r 그래프: 안에서는 직선으로 오르다 표면에서 최대, 밖에서는 \\(1/r^2\\)로 준다.")

fig_shell = canvas(560, 244,
    circle(280, 120, 95, INK, w=2.5, fill="rgba(31,42,68,.06)"), circle(280, 120, 78, INK, w=2.5, fill="#FFFFFF"),
    circle(280, 120, 40, RED, w=2.5, fill="rgba(224,49,49,.08)"), dots_in(280, 120, 40, 12),
    text(280, 124, "+q", 13, RED, "middle", True),
    text(370, 60, "도체 껍질 (알짜 −q)", 12.5, INK), line(360, 66, 345, 78, GRAY, 1),
    text(280, 189, "b", 12, GRAY, "middle"), text(280, 232, "c", 12, GRAY, "middle"),
    text(280, 68, "a", 12, GRAY, "middle"),
    text(470, 120, "영역별로 q_enc를 다시 센다", 12.5, INK, "middle"), text(470, 140, "r<a: (r³/a³)q · a~b: q", 12, INK, "middle"), text(470, 158, "b~c(도체 안): 0 · r>c: q−q=0", 12, INK, "middle"),
    cap="교재 23장 31번 유형: 부도체 공 + 동심 도체 껍질. 껍질 안쪽 표면에 \\(-q\\)가 유도되어 도체 내부를 0으로 만든다.")

fig_da = canvas(560, 200,
    path("M120 40 C 220 10, 330 30, 390 70 C 450 105, 430 180, 340 185 C 240 190, 130 175, 100 120 C 80 85, 90 55, 120 40 Z", PINK, 2.5, "rgba(255,77,141,.05)", "7 5"),
    charge(230, 110, "+", "", 12, RED), charge(290, 95, "+", "", 12, RED), charge(260, 140, "−", "", 12, BLUE), text(260, 172, "q_enc = 안의 알짜 (+e)", 12, INK, "middle"),
    rect(386, 72, 16, 16, INK, fill="rgba(255,255,255,.7)", sw=1.5), text(394, 106, "dA", 12, INK, "middle"),
    arrow(402, 72, 450, 44, INK, "n̂", 2, 16, 12),
    arrow(330, 110, 378, 84, GREEN, "E", 2, -6, -10),
    text(496, 150, "모양은 아무거나", 13, PINK, "middle"), text(496, 170, "안의 알짜전하만 센다", 13, INK, "middle"),
    cap="폐곡면(가우스면)은 모양이 어떻든 상관없다. 미소면적 \\(dA\\)의 법선벡터 \\(\\hat n\\)과 그곳의 전기력선이 평행이면 \\(\\vec E\\cdot\\hat n=E\\).")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>일반물리학2 · 9/16 가우스 법칙 — 3종 · 도체구 · 부도체구</title></head><body>
<header>
<h1>23장 가우스 법칙 — 가우스면 3종 · 도체구 · 부도체구</h1>
<p class="lead">지난 시간 축구공 비유로 세운 식 \\(\\oint\\vec E\\cdot\\hat n\\,dA=q_{{enc}}/\\varepsilon_0\\)을 실제로 써 본다. 앞부분(3종 재유도)은 "교과서", 뒷부분(도체구·부도체구)은 "응용" — 교수님은 <b>시험은 응용에서 나온다</b>고 못 박았다.</p>
<p class="meta"><span>녹음 45분</span><span>판서 8장</span><span>강의노트 p.10~12</span><span>교재 23장 연습문제 29~33</span><span>23장 끝</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 한 줄 복습 — 폐곡면에 전기력선을 세면 전하가 나온다</h2>
<div class="formula">\\[\\oint\\vec E\\cdot\\hat n\\,dA=\\frac{{q_{{enc}}}}{{\\varepsilon_0}}\\qquad(\\varepsilon_0=8.854\\times10^{{-12}})\\]</div>
<p>기호를 읽자: \\(\\oint\\)는 <b>폐곡면</b>(닫힌 면이면 모양은 상관없다), \\(\\hat n\\)은 미소면적의 <b>법선벡터</b>, \\(q_{{enc}}\\)는 그 면 <b>안</b>의 알짜전하. 전기력선 하나 ↔ 법선벡터 하나가 1:1로 대응하고, 둘이 <b>평행</b>이라 내적은 그냥 \\(E\\)가 된다.</p>
<div class="say">"미소면적 법선벡터 하나와 전기력선 하나는 수직해요, 평행해요? — 평행. 이것만 답을 하면 다 해결이 돼."</div>
{fig_da}
<div class="why">\\(E\\)가 가우스면 위에서 일정하면 적분 밖으로 나온다: \\(E\\oint dA=q/\\varepsilon_0\\). 그러면 남는 건 <b>표면적</b> 계산뿐. 그래서 표면적을 쉽게 아는 3가지 면만 쓴다.</div>
<div class="analogy">그물 안에 물고기가 몇 마리인지 알고 싶으면, 그물 표면을 뚫고 나오는 "냄새 줄기"를 세면 된다. 그물 모양은 상관없고 안에 있는 물고기 수만 정한다 — 그것이 폐곡면과 \\(q_{{enc}}\\)의 뜻. 그물 <b>밖</b>의 물고기는 줄기가 들어왔다 나가서 0으로 상쇄된다.</div>
<div class="memo"><b>외울 것</b> \\(\\oint\\) = 폐곡면 · \\(\\hat n\\) = 법선벡터 · \\(q_{{enc}}\\) = 면 <b>안</b>의 알짜전하 · \\(E\\)가 일정하면 \\(E\\cdot(\\text{{표면적}})=q_{{enc}}/\\varepsilon_0\\)</div>
<figure class="board"><img data-photo="일반물리학2/2026-09-16/판서_1_가우스법칙_정의_축구공.jpg" alt="판서 1"><figcaption>판서 ① 정의 + 축구공 (02:05~07:31)</figcaption></figure>
</section>

<section class="s" data-id="s2">
<h2>2. 3종으로 지난 결과를 한 줄에 다시 얻는다</h2>
{fig_re}
<p><b>무한 평면</b>: 지난 시간 원판에서 \\(R\\to\\infty\\)로 얻은 \\(\\sigma/2\\varepsilon_0\\). 가우스 법칙으로는 — 전기력선이 판 <b>양쪽</b>으로 나가므로 가우스면(앞·뒤 두 장)의 넓이는 \\(2A\\): \\(E\\cdot2A=q/\\varepsilon_0\\) → \\(E=q/2\\varepsilon_0A=\\sigma/2\\varepsilon_0\\) ✓.</p>
<p><b>직선 도선</b>: 원통 옆면 \\(2\\pi rL\\), 안의 전하 \\(\\lambda L\\): \\(E\\cdot2\\pi rL=\\lambda L/\\varepsilon_0\\) → \\(E=\\lambda/(2\\pi\\varepsilon_0 r)\\) — <b>무한히 긴</b> 도선을 <b>옆</b>에서 본 결과. 9/9의 유한 도선(연장선 위 점, \\(q/a(a+L)\\))과는 배치가 다르다. 적분으로 하면 반 페이지, 가우스로는 한 줄.</p>
<p><b>도체 표면 한쪽</b>: \\(EA=q/\\varepsilon_0\\) → \\(\\sigma/\\varepsilon_0\\). 무한 평면(\\(2A\\))과 두 배 차이가 나는 이유가 "양쪽이냐 한쪽이냐"다.</p>
<div class="say">"이 말이 이해가 되면 가우스 법칙 진짜 쉽게 설명이 될 텐데." · "4개, 5개 만들 수 있냐? 있다. 그런데 그딴 짓은 안 한다. 한 번도 본 적이 없다."</div>
<div class="analogy">적분은 벽돌을 하나하나 쌓아 집을 짓는 것, 가우스 법칙은 대칭이 좋은 집을 통째로 들어 올리는 것. 대칭(면·원통·구)이 있을 때만 통한다.</div>
<div class="memo"><b>외울 것</b> 면 \\(2A\\)(부도체 무한 평면) → \\(\\sigma/2\\varepsilon_0\\) · 원통 옆면 \\(2\\pi rL\\) → \\(\\lambda/2\\pi\\varepsilon_0 r\\) · 구 \\(4\\pi r^2\\) → \\(q/4\\pi\\varepsilon_0 r^2\\) · 도체 표면 한쪽 \\(A\\) → \\(\\sigma/\\varepsilon_0\\)</div>
<figure class="board"><img data-photo="일반물리학2/2026-09-16/판서_3_가우스면3종_무한평면_클로즈업.jpg" alt="판서 3"><figcaption>판서 ③ 3종 넓이 + 무한 평면 2A (13:27~17:24)</figcaption></figure>
</section>

<section class="s" data-id="s3">
<h2>3. 여기까지가 교과서 — 응용은 도체구·부도체구</h2>
<div class="say">"도체구와 부도체구의 응용을 하면 시험 문제는 이거에서 산수 계산하는 거에서 많이 나와요. 이 앞에서 했던 건 안 나와."</div>
<p>먼저 용어. <b>도체</b>(conductor)는 전기가 흐르고 <b>부도체</b>(nonconductor)는 안 흐른다. <b>둘 다 전하는 있다.</b> 흐르냐 안 흐르냐는 <b>자유전자</b>가 있느냐의 차이(유동속도는 26장).</p>
<div class="pitfall">"부도체에는 전하가 없다"고 착각하기 쉽다. 부도체구에도 전하는 있고, 오히려 <b>안에까지 고르게</b> 퍼져 있어 계산이 더 어렵다. 교수님이 학생을 지목해 정정한 부분.</div>
<h3>도체구 = 고립도체 — 전하는 표면에만</h3>
<p>실에 매단 도체구에 전기장을 걸면 + −가 양끝으로 갈라져 가운데가 빈다. 그 상태에서 전기장을 갑자기 없애면(또는 확 들어 올리면) 그것이 책의 <b>고립도체</b>. 결론 하나: <b>도체의 전하는 표면에만 있고 내부에는 없다</b>.</p>
{fig_cond}
<div class="formula">\\[r&lt;R:\\ E=0\\qquad r\\ge R:\\ E\\cdot4\\pi r^2=\\frac{{q}}{{\\varepsilon_0}}\\ \\Rightarrow\\ E=\\frac{{q}}{{4\\pi\\varepsilon_0 r^2}}\\]</div>
<div class="why">안쪽 가우스면(반지름 \\(r&lt;R\\)) 안에는 전하가 하나도 없다 → \\(q_{{enc}}=0\\) → \\(E=0\\). 바깥 가우스면은 전하 \\(q\\)를 전부 품으므로 중심에 점전하 \\(q\\)가 있는 것과 구별이 안 된다.</div>
<div class="say">"문제에 '반지름 R인 도체구'가 나오면 바로 이 정리가 떠올라야 한다. 이게 제일 중요한 내용."</div>
<div class="analogy">도체는 사람이 자유롭게 걸어 다니는 광장. 같은 부호끼리 서로 밀어내니 최대한 멀리 — 가장자리(표면)로 흩어지고 가운데는 빈다. 부도체는 좌석이 고정된 극장 — 전하가 자리에 박혀 안에도 그대로 있다.</div>
<div class="memo"><b>외울 것</b> 도체구: 전하는 표면에만 · 안 \\(E=0\\) · 밖 \\(E=q/4\\pi\\varepsilon_0r^2\\)(점전하와 같다) · 도체·부도체 둘 다 전하는 있다</div>
<figure class="board"><img data-photo="일반물리학2/2026-09-16/판서_7_고립도체_도체구_시험대비.jpg" alt="판서 7"><figcaption>판서 ⑦ 고립도체 → 도체구 안 0 / 밖 점전하 (사진에 「시험대비」 캡션)</figcaption></figure>
</section>

<section class="s" data-id="s4">
<h2>4. 부도체구 — 제일 어렵고 마지막: 안에서는 r에 비례</h2>
<p>반지름 \\(R\\), 전하 \\(q\\)가 <b>부피에 균일</b>하게 퍼져 있다. 바깥(\\(r\\ge R\\))은 도체구와 같은 \\(q/4\\pi\\varepsilon_0r^2\\). 안(\\(r&lt;R\\))은 가우스면 안에 든 전하 \\(q'\\)만 센다.</p>
{fig_ins}
<div class="why">균일하니까 부피전하밀도 \\(\\rho=q/V\\)가 어디서나 같다: \\(\\dfrac{{q}}{{\\frac43\\pi R^3}}=\\dfrac{{q'}}{{\\frac43\\pi r^3}}\\) → \\(q'=\\dfrac{{r^3}}{{R^3}}q\\). 이걸 \\(E\\cdot4\\pi r^2=q'/\\varepsilon_0\\)에 넣으면 \\(r^3/r^2=r\\)이 남는다.</div>
<div class="formula">\\[E_{{in}}=\\frac{{q\\,r}}{{4\\pi\\varepsilon_0R^3}}\\ (\\propto r),\\qquad E_{{out}}=\\frac{{q}}{{4\\pi\\varepsilon_0r^2}}\\]</div>
<div class="analogy">안개 속을 걸어 들어갈수록 "내 뒤에 남은 안개"가 늘어난다. 부도체구 안에서 중심에서 멀어질수록 가우스면 안의 전하가 \\(r^3\\)으로 늘어, 넓이 \\(r^2\\)로 나눠도 \\(r\\)만큼 커진다.</div>
<p>그래프는 원점에서 직선으로 올라 \\(r=R\\)에서 꺾이고 \\(1/r^2\\)로 내려온다. 도체구 그래프는 \\(r&lt;R\\)에서 0이었다가 표면에서 갑자기 최대 — 이 차이가 시험 개념 문제 후보.</p>
<div class="say">"반지름 3배 줄이면 27배" 같은 의미 없는 산수 문제는 안 낸다. "가우스 법칙에서 나오는 값은 다 스칼라" — 이 말이 중요한 말이야.</div>
<div class="memo"><b>외울 것</b> 부도체구 안 \\(E=\\dfrac{{qr}}{{4\\pi\\varepsilon_0R^3}}\\)(∝ r) · 밖 \\(\\dfrac{{q}}{{4\\pi\\varepsilon_0r^2}}\\) · \\(q'=(r^3/R^3)q\\) · 표면에서 최대</div>
<figure class="board"><img data-photo="일반물리학2/2026-09-16/판서_6_부도체구_내외부_유도_그래프.jpg" alt="판서 6"><figcaption>판서 ⑥ 부도체구 안·밖 유도 + E–r 그래프 (31:45~37:37)</figcaption></figure>
</section>

<section class="s" data-id="s5">
<h2>5. 범위별 전기장 문제 — "100% 시험" 유형</h2>
<div class="say">"교재 670페이지 연습문제 + 강의노트 문제(부도체구 – 도체 껍질 – 범위별로 전기장 구하기): 모든 책에 가장 많이 나와. 그건 100% 시험 문제 나올 거야."</div>
{fig_shell}
<details class="ex"><summary>교재 23장 31번 (교수 표시) — 부도체 공(반지름 a, +q 균일) + 동심 도체 껍질(안 b=2a, 밖 c=2.4a, 알짜 −q). 각 위치의 E와 껍질 표면 전하</summary><div class="body">
<p><b>규칙</b>: 반지름 \\(r\\)인 구 가우스면을 잡고 <b>그 안의 알짜전하만</b> 센다. 영역마다 \\(q_{{enc}}\\)가 바뀐다.</p>
<p>(a) \\(r=a/2\\) 부도체 안: \\(q_{{enc}}=(1/8)q\\) → \\(E=\\dfrac{{q\\,(a/2)}}{{4\\pi\\varepsilon_0a^3}}=\\dfrac{{q}}{{8\\pi\\varepsilon_0a^2}}\\)</p>
<p>(b) \\(r=1.5a\\) 공과 껍질 사이: \\(q_{{enc}}=q\\) → \\(E=\\dfrac{{q}}{{4\\pi\\varepsilon_0(1.5a)^2}}=\\dfrac{{q}}{{9\\pi\\varepsilon_0a^2}}\\)</p>
<p>(c) \\(r=2.3a\\) 도체 껍질 안: 도체 내부 → \\(E=0\\). 그러려면 껍질 <b>안쪽 표면에 \\(-q\\)</b>가 유도되어야 한다(가우스면 안 알짜 0).</p>
<p>(d) \\(r=3.5a\\) 바깥: \\(q_{{enc}}=q+(-q)=0\\) → \\(E=0\\). 껍질 알짜가 \\(-q\\)인데 안쪽 표면이 \\(-q\\)를 다 썼으니 <b>바깥 표면은 0</b>.</p>
<p>강의노트 p.12 필수문제 1·2도 같은 구조(껍질 알짜가 \\(-2q\\)면 바깥 표면에 \\(-q\\)가 남는 식). 숫자만 바뀐다.</p></div></details>
<div class="analogy">양파를 한 겹씩 벗기듯, 반지름 \\(r\\)을 키우며 "지금까지 껍질 안에 든 전하"만 센다. 겹이 바뀔 때마다(부도체 안 → 사이 → 도체 안 → 밖) 안에 든 전하가 달라지고, 그때마다 \\(E\\) 식도 바뀐다.</div>
<div class="memo"><b>외울 것</b> 영역마다 \\(q_{{enc}}\\) 새로 세기 · 도체 안 \\(E=0\\) ⇒ 껍질 안쪽 표면에 \\(-q_{{안}}\\) 유도 · 바깥 표면 = 껍질 알짜 − 안쪽 표면 · 부도체 안은 \\((r^3/R^3)q\\)</div>
<div class="memo">교수님: 강의노트 문제 그대로는 안 낸다("포인트 안 올려놨어요") — 이해해야 푸는 변형. 영역 하나하나 \\(q_{{enc}}\\)를 새로 세는 습관이 전부다.</div>
<figure class="board"><img data-photo="일반물리학2/2026-09-16/교재_23장_연습문제_29-33_31번표시.jpg" alt="교재 31번"><figcaption>교재 23장 연습문제 29~33 (31번 표시)</figcaption></figure>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 가우스 법칙</div><div class="qb">가우스 법칙으로 옳은 것은?</div><ol class="choices"><li data-ok="1">\\(\\oint\\vec E\\cdot\\hat n\\,dA=q_{{enc}}/\\varepsilon_0\\)</li><li>\\(\\oint\\vec E\\cdot\\hat n\\,dA=\\varepsilon_0q_{{enc}}\\)</li><li>\\(\\oint\\vec E\\,dA=q_{{enc}}\\)</li><li>\\(\\int\\vec E\\cdot d\\vec r=q_{{enc}}/\\varepsilon_0\\)</li></ol><div class="ans">폐곡면 면적분 = 안의 알짜전하/ε₀. 선적분 \\(\\int\\vec E\\cdot d\\vec r\\)은 전위(24장).</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 도체구 내부</div><div class="qb">반지름 \\(R\\), 전하 \\(q\\)인 도체구의 내부(\\(r&lt;R\\)) 전기장은?</div><ol class="choices"><li data-ok="1">0 — 전하가 표면에만 있어 가우스면 안 전하가 없다</li><li>\\(q/(4\\pi\\varepsilon_0 r^2)\\)</li><li>\\(qr/(4\\pi\\varepsilon_0 R^3)\\)</li><li>\\(q/(4\\pi\\varepsilon_0 R^2)\\), 일정</li></ol><div class="ans">고립도체의 전하는 표면에만 → \\(q_{{enc}}=0\\). 외부는 점전하와 같다.</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 부도체구 내부</div><div class="qb">반지름 \\(R\\)에 전하 \\(q\\)가 균일하게 퍼진 부도체구의 내부(\\(r&lt;R\\)) 전기장은?</div><ol class="choices"><li data-ok="1">\\(\\dfrac{{qr}}{{4\\pi\\varepsilon_0R^3}}\\) — r에 비례</li><li>0</li><li>\\(\\dfrac{{q}}{{4\\pi\\varepsilon_0 r^2}}\\)</li><li>\\(\\dfrac{{q}}{{4\\pi\\varepsilon_0 R^2}}\\), 일정</li></ol><div class="ans">가우스면 안 전하 \\(q'=(r^3/R^3)q\\) → \\(E\\cdot4\\pi r^2=q'/\\varepsilon_0\\).</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 무한 평면에 2A</div><div class="qb">무한 평면(부도체, 면밀도 σ)에 가우스 법칙을 쓸 때 넓이를 \\(2A\\)로 잡는 이유는?</div><ol class="choices"><li data-ok="1">전기력선이 판 양쪽으로 나가 가우스면 앞·뒤 두 장을 모두 지난다</li><li>평면이 두 장이기 때문</li><li>전하가 두 배이기 때문</li><li>원판 공식의 2를 맞추기 위한 약속</li></ol><div class="ans">\\(E\\cdot2A=q/\\varepsilon_0\\) → \\(\\sigma/2\\varepsilon_0\\). 도체 표면 한쪽만이면 \\(\\sigma/\\varepsilon_0\\).</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 껍질의 유도 전하</div><div class="qb">부도체 공(+q) 바깥에 알짜 −q인 동심 도체 껍질이 있다. 껍질 <b>안쪽 표면</b>과 <b>바깥 표면</b>의 전하는?</div><ol class="choices"><li data-ok="1">안쪽 −q, 바깥 0</li><li>안쪽 0, 바깥 −q</li><li>안쪽 −q/2, 바깥 −q/2</li><li>안쪽 +q, 바깥 −2q</li></ol><div class="ans">도체 내부 \\(E=0\\)이 되려면 껍질 안쪽 표면이 \\(-q\\)로 안의 \\(+q\\)를 상쇄해야 한다. 알짜 \\(-q\\)를 다 써서 바깥은 0.</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 직선 도선을 가우스로</div><div class="qb">선전하밀도 λ인 무한 직선 도선에서 거리 r인 점의 전기장을 원통 가우스면(길이 L)으로 유도하라.</div><div class="ans">옆면에서 \\(\\vec E\\parallel\\hat n\\), 윗면·아랫면 기여 0. \\(E\\cdot2\\pi rL=\\lambda L/\\varepsilon_0\\) → \\(E=\\dfrac{{\\lambda}}{{2\\pi\\varepsilon_0 r}}\\). 점 P를 도선 옆에 두고 \\(-\\infty\\sim\\infty\\)로 적분해도 같은 값(9/9의 유한 도선·연장선 배치와는 다른 문제).</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
