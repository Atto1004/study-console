# -*- coding: utf-8 -*-
"""일반물리학2 · 2026-09-11 수업 노트 (근거: 2026-09-11/정리.md — 녹음 44분·판서 5장·필기 p.7~8)"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\일반물리학2\_수업노트\2026-09-11.html"

def ellipse(cx, cy, rx, ry, color=INK, w=2, fill="none", dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{color}" stroke-width="{w}"{d}/>'

fig_ring = canvas(560, 250,
    ellipse(280, 190, 120, 34, RED, 2.5, "rgba(224,49,49,.06)"),
    text(280, 236, "반지름 R 고리 (전하 q 균일)", 13, INK, "middle"),
    line(280, 190, 280, 40, GRAY, 1.2, "5 4"), text(292, 120, "z", 13, GRAY),
    dot(280, 40, "", 5, INK), text(296, 36, "P (축 위)", 13, INK),
    dot(160, 190, "", 5, RED), text(150, 214, "dq", 12, RED, "middle"), dot(400, 190, "", 5, RED), text(418, 224, "dq (반대편)", 12, RED, "middle"),
    line(160, 190, 280, 40, GRAY, 1, "3 3"), line(400, 190, 280, 40, GRAY, 1, "3 3"),
    arrow(280, 40, 330, -22 + 62, GREEN, "", 2), arrow(280, 40, 230, 40, GREEN, "", 2), arrow(280, 40, 330, 40, GREEN, "", 2),
    text(230, 24, "수평 성분: 서로 상쇄", 12, GREEN, "end"), text(336, 24, "z 성분만 살아남는다", 12, GREEN),
    arrow(280, 40, 280, 6, GREEN, "", 2.6),
    cap="고리의 정반대편 두 조각이 만드는 장: 수평 성분은 반대라 지워지고 \\(z\\) 성분만 남는다. \\(\\cos\\theta=z/\\sqrt{z^2+R^2}\\).")

fig_disk = canvas(560, 254,
    ellipse(280, 185, 150, 42, INK, 2, "rgba(31,42,68,.05)"),
    ellipse(280, 185, 80, 22, RED, 2.5, "rgba(224,49,49,.08)"), ellipse(280, 185, 70, 19, RED, 2.5),
    text(280, 246, "반지름 R 원판 (면밀도 σ) — 반지름 r, 폭 dr 인 고리 띠를 0~R까지 쌓는다", 12.5, INK, "middle"),
    line(280, 185, 280, 40, GRAY, 1.2, "5 4"), text(292, 115, "z", 13, GRAY),
    dot(280, 40, "", 5, INK), text(296, 36, "P", 13, INK),
    line(206, 185, 280, 40, GRAY, 1, "3 3"), text(226, 108, "u = √(r²+z²)", 12, GRAY, "end"),
    arrow(280, 40, 280, 6, GREEN, "dE_z", 2.4, 34, 0),
    text(446, 160, "dq = σ·2πr dr", 12.5, RED, "start"),
    cap="원판 = 원형 고리를 반지름 \\(0\\to R\\)로 적분한 것. 띠의 넓이 \\(dA=2\\pi r\\,dr\\).")

fig_plane = canvas(560, 170,
    axis(60, 130, 520, 130, "z (판에서 거리)", "E"),
    line(60, 60, 520, 60, GREEN, 3), text(300, 50, "무한 평면: E = σ/2ε₀, 거리와 무관", 13, GREEN, "middle"),
    path("M60 60 C 200 62, 320 110, 520 125", RED, 2.5, dash="6 4"), text(400, 88, "유한 원판: 멀어지면 줄어든다", 12, RED, "middle"),
    cap="원판 결과에서 \\(R\\to\\infty\\)이면 둘째 항이 0 → 어디서 재도 같은 \\(\\sigma/2\\varepsilon_0\\).")

fig_gauss = canvas(560, 232,
    circle(150, 110, 70, PINK, dash="7 5", w=2.5), text(150, 224, "가우스면(가상의 폐곡면)", 12.5, PINK, "middle"),
    charge(150, 110, "+", "", 14, RED), text(129, 161, "+1 C", 12, RED, "middle"),
    radial(150, 110, 8, 22, 100, GREEN),
    rect(196, 82, 18, 18, INK, fill="rgba(255,255,255,.6)", sw=1.5), text(224, 62, "da (미소면적)", 12, INK),
    arrow(214, 91, 250, 84, INK, "n̂", 2, 8, -6),
    text(420, 70, "전기력선 하나 ↔ da 하나", 13, INK, "middle"), text(420, 92, "법선벡터 n̂ 와 전기력선이", 13, INK, "middle"), text(420, 112, "나란하다(평행) → E·n̂ = E", 13, GREEN, "middle", True),
    text(420, 150, "∮ E da = q_enc / ε₀", 15, INK, "middle", True),
    cap="축구공 비유: 중심의 +1 C이 뿜는 전기력선이 공 표면의 미소면적을 하나씩 수직으로 뚫고 나간다.")

fig_three = canvas(560, 180,
    rect(50, 60, 110, 70, PINK, dash="6 4", fill="rgba(255,77,141,.06)"), text(105, 155, "면 · 넓이 A", 13, INK, "middle"),
    ellipse(280, 60, 45, 14, PINK, 2, "rgba(255,77,141,.06)", "6 4"), ellipse(280, 130, 45, 14, PINK, 2, "none", "6 4"), line(235, 60, 235, 130, PINK, 2, "6 4"), line(325, 60, 325, 130, PINK, 2, "6 4"),
    text(280, 165, "원통 · 옆면만 2πrL", 13, INK, "middle"), text(345, 100, "L", 12, GRAY),
    circle(460, 95, 42, PINK, dash="6 4", w=2), line(460, 95, 502, 95, GRAY, 1), text(482, 88, "r", 12, GRAY),
    text(460, 160, "구 · 4πr²", 13, INK, "middle"),
    cap="교수님: 물리책의 가우스면은 딱 3개 — 표면적을 쉽게 구할 수 있는 것만 쓴다.")

fig_map = canvas(560, 160,
    rect(24, 20, 200, 116, GRAY, dash="5 4", rx=12), text(124, 46, "Σ · 불연속", 13, INK, "middle", True),
    charge(60, 88, "+", "점전하", 11, RED), charge(118, 84, "+", "", 9, RED), charge(140, 94, "−", "점전하군", 9, BLUE), charge(196, 80, "+", "", 8, RED), charge(196, 100, "−", "쌍극자", 8, BLUE),
    rect(244, 20, 200, 116, GRAY, dash="5 4", rx=12), text(344, 46, "∫dq · 연속", 13, INK, "middle", True),
    rect(262, 86, 50, 7, RED, fill="rgba(224,49,49,.25)", sw=1), text(287, 112, "직선 λ", 11.5, INK, "middle"),
    circle(344, 88, 15, RED, w=2.5), text(344, 118, "고리 λ", 11.5, INK, "middle"),
    circle(404, 88, 17, RED, w=2, fill="rgba(224,49,49,.15)"), text(404, 118, "원판 σ", 11.5, INK, "middle"),
    arrow(450, 74, 480, 74, INK, "", 1.6), text(518, 70, "다음:", 12, PINK, "middle"), text(518, 88, "가우스", 12, PINK, "middle", True), text(518, 104, "(부피 ρ)", 11, PINK, "middle"),
    cap="오늘 위치: 연속 분포의 마지막 둘(고리·원판)을 끝내고 가우스 법칙으로 넘어간다.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>일반물리학2 · 9/11 원형 도선 · 원판 · 가우스 법칙 서론</title></head><body>
<header>
<h1>원형 도선 · 원판의 전기장 — 그리고 가우스 법칙의 축구공</h1>
<p class="lead">22장의 마지막 두 적분(원형 도선·원판)은 지난 직선 도선과 <b>같은 수순</b>이다. 핵심은 계산이 아니라 <b>대칭으로 어느 성분이 살아남는지</b>. 그 뒤 15분, 교수님은 가우스 법칙을 축구공 하나로 설명했다.</p>
<p class="meta"><span>녹음 44분</span><span>판서 5장</span><span>필기 강의노트 p.7~8</span><span>22장 끝 → 23장 서론</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 지도 다시 보기 — Σ와 ∫, 그리고 밀도 기호</h2>
<p>교수님이 첫머리에 다시 짚었다. 전기장 구하기는 전하 분포가 <b>불연속이냐 연속이냐</b>로 갈린다.</p>
<div class="memo"><b>불연속 → Σ</b>: 점전하, 전기 쌍극자 · <b>연속 → ∫</b>: 직선 도선(\\(\\lambda\\)) · 원형 도선(\\(\\lambda\\)) · 원판(\\(\\sigma\\)) · <b>다음</b>: 가우스 법칙(부피 \\(\\rho\\))</div>
<div class="say">"6개 다 했어. 직선 도선, 원형 도선, 원판 — 그걸 전하의 분포가 썸이냐 인테그럴이냐 한 거잖아."</div>
{fig_map}
<div class="analogy">여섯 문제는 전부 같은 레시피다 — "조각 하나의 장(점전하 식) → 대칭으로 살아남는 성분 → 더하기(Σ 또는 ∫)". 레시피가 하나라 재료(전하 분포)만 바뀐다. 새 문제를 보면 "조각은 뭐고, 어느 성분이 남나"부터 묻는다.</div>
<div class="pitfall">밀도 기호를 바꿔 쓰면 감점: 선은 \\(\\lambda=dq/ds\\), 면은 \\(\\sigma=dq/dA\\), 부피는 \\(\\rho\\). 원형 도선은 "선"이라 \\(\\lambda\\), 원판은 "면"이라 \\(\\sigma\\).</div>
<div class="memo"><b>외울 것</b> 불연속 Σ 3개 · 연속 ∫ 3개 · \\(\\lambda=dq/ds\\), \\(\\sigma=dq/dA\\), \\(\\rho=dq/dV\\) · 조각의 장은 늘 점전하 식 \\(\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{dq}}{{r^2}}\\)</div>
<figure class="board"><img data-photo="일반물리학2/2026-09-11/판서_01_전하분포_불연속연속_직선도선.jpg" alt="판서 1"><figcaption>판서 ① 단원 지도 + 직선 도선 복습 (10:38)</figcaption></figure>
</section>

<section class="s" data-id="s2">
<h2>2. 원형 도선 — "직선 도선을 휜 것", 살아남는 건 z 성분뿐</h2>
<p>반지름 \\(R\\)인 고리에 전하 \\(q\\)가 균일. 축 위 높이 \\(z\\)인 점 P의 장을 구한다. 조각은 \\(dx\\)가 아니라 고리를 따라가는 \\(ds\\): \\(dq=\\lambda\\,ds\\). P까지 거리는 모든 조각이 같다: \\(r=\\sqrt{{z^2+R^2}}\\).</p>
{fig_ring}
<div class="why">고리의 정반대편에 똑같은 조각이 있다. 두 조각의 \\(d\\vec E\\)는 수평 성분이 정확히 반대라 <b>상쇄</b>되고, \\(z\\) 성분만 같은 방향으로 쌓인다. 그래서 \\(dE_z=dE\\cos\\theta\\)만 적분하면 된다.</div>
<div class="say">"가운데를 중심으로 정반대쪽에 똑같은 게 또 하나 있네. 얘네들은 벡터니까 서로 반대 방향으로 상쇄되네. 살아남는 건 z 성분만."</div>
<div class="analogy">원탁에 둘러앉은 사람들이 가운데 위에 뜬 풍선을 각자 자기 쪽으로 당긴다고 하자. 옆으로 당기는 몫은 맞은편 사람이 정확히 지워 주고, <b>위로 당기는 몫만</b> 쌓인다 — 그래서 \\(z\\) 성분만 남고, 풍선이 탁자 높이(\\(z=0\\))에 있으면 사방에서 당겨 0.</div>
<div class="formula">\\[dE=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{\\lambda\\,ds}}{{z^2+R^2}},\\quad \\cos\\theta=\\frac{{z}}{{\\sqrt{{z^2+R^2}}}}\\ \\Rightarrow\\ E_z=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{\\lambda z}}{{(z^2+R^2)^{{3/2}}}}\\int_0^{{2\\pi R}}ds=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{qz}}{{(z^2+R^2)^{{3/2}}}}\\]</div>
<p>적분 안의 모든 값이 \\(ds\\)와 무관해서 \\(\\int_0^{{2\\pi R}}ds=2\\pi R\\)이 고리 둘레로 나온다. \\(\\lambda\\cdot2\\pi R=q\\).</p>
<div class="say">"좌우 대칭으로 수평 성분은 싹 없어지고 수직 성분만 남는데, 한 바퀴 삥 도니까 0에서 2πR까지 적분해 버리면 된다는 사실만 딱 이해되면 돼." · "이거는 시험 볼 때 쓰려니까 막 하죠."</div>
<div class="memo"><b>검산</b>: \\(z\\gg R\\)이면 \\((z^2+R^2)^{{3/2}}\\approx z^3\\) → \\(E\\to\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{q}}{{z^2}}\\) 점전하. \\(z=0\\)(중심)이면 \\(E=0\\) — 사방에서 당겨 상쇄.</div>
<figure class="board"><img data-photo="일반물리학2/2026-09-11/판서_02_원형도선_유도.jpg" alt="판서 2"><figcaption>판서 ② 원형 도선 전체 유도 (10:41)</figcaption></figure>
</section>

<section class="s" data-id="s3">
<h2>3. 원판 — 고리를 쌓는다, 그리고 무한 평면</h2>
<p>원판은 전하가 <b>면</b>에 퍼져 있으니 \\(\\sigma\\). 반지름 \\(r\\), 폭 \\(dr\\)인 가는 고리 띠 하나가 "원형 도선"이고, 그 띠의 전하는 \\(dq=\\sigma\\,dA=\\sigma\\cdot2\\pi r\\,dr\\).</p>
{fig_disk}
<div class="say">"원판은 더 어려워. 0에서 R까지 원형 도선을 적분하는 거다라고 하는 것만 알면 돼."</div>
<div class="formula">\\[dE_z=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{\\sigma\\,2\\pi r\\,dr}}{{r^2+z^2}}\\cdot\\frac{{z}}{{\\sqrt{{r^2+z^2}}}}=\\frac{{\\sigma z}}{{2\\varepsilon_0}}\\frac{{r\\,dr}}{{(r^2+z^2)^{{3/2}}}}\\] 치환 \\(A^2=r^2+z^2\\), \\(A\\,dA=r\\,dr\\); \\(r=0\\to A=z\\), \\(r=R\\to A=\\sqrt{{z^2+R^2}}\\): \\[E=\\frac{{\\sigma z}}{{2\\varepsilon_0}}\\int_z^{{\\sqrt{{z^2+R^2}}}}\\frac{{dA}}{{A^2}}=\\frac{{\\sigma}}{{2\\varepsilon_0}}\\left(1-\\frac{{z}}{{\\sqrt{{z^2+R^2}}}}\\right)\\]</div>
<div class="why">치환의 이유: 분자에 \\(r\\,dr\\), 분모에 \\(r^2+z^2\\)의 거듭제곱 — \\(r^2+z^2\\)를 통째로 새 변수로 두면 \\(r\\,dr\\)이 \\(A\\,dA\\)로 딱 바뀐다. 구간을 \\(A\\) 기준으로 다시 잡는 것을 빠뜨리지 말 것(판서에서 화살표 두 개로 강조).</div>
<h3>무한 평면 — 거리와 무관해진다 ★★</h3>
{fig_plane}
<div class="formula">\\[R\\to\\infty:\\quad E=\\frac{{\\sigma}}{{2\\varepsilon_0}}=\\frac{{q}}{{2\\varepsilon_0A}}\\]</div>
<div class="say">"무한 평면의 전기장이에요. z에 안 들어가. 거리와 무관하다." — 판서에 「(의미)」라고 따로 써서 강조.</div>
<div class="analogy">벽 앞에 서면 벽이 얼마나 큰지 못 느낀다. 어디에 있든 "앞에 벽 하나"일 뿐 — 무한히 넓은 판의 장이 거리와 무관한 이유.</div>
<div class="memo"><b>외울 것</b> 원판 \\(E=\\dfrac{{\\sigma}}{{2\\varepsilon_0}}\\Big(1-\\dfrac{{z}}{{\\sqrt{{z^2+R^2}}}}\\Big)\\) · 치환 \\(A^2=r^2+z^2\\), 구간 \\(z\\to\\sqrt{{z^2+R^2}}\\) · 무한 평면 \\(\\sigma/2\\varepsilon_0\\)(거리 무관)</div>
<figure class="board"><img data-photo="일반물리학2/2026-09-11/판서_04_원판_치환적분_무한평면.jpg" alt="판서 4"><figcaption>판서 ④ 치환 적분 → 결과 → 무한 평면 (10:53)</figcaption></figure>
</section>

<section class="s" data-id="s4">
<h2>4. 가우스 법칙 서론 — 축구공 하나로</h2>
<div class="formula">\\[\\oint\\vec E\\cdot\\hat n\\,dA=\\frac{{q_{{enc}}}}{{\\varepsilon_0}}\\]</div>
<div class="say">"가우스 법칙이라고 하는 놈은 전기장을 구하는 법칙인데 실질적으로는 알짜전하를 구하는 놈이야. 맨 처음에 전하 얘기할 때 양성자·전자 개념과 똑같은 개념이야."</div>
<p>교수님의 설명 순서를 그대로 따라가자.</p>
<ol><li>내가 <b>+1 C</b>이고 축구공 정가운데 있다.</li><li>나는 전기력선을 \\(6\\times10^{{18}}\\)개 뿜는다.</li><li>축구공 표면은 실제로 없는, 내가 만든 <b>가상의 폐곡면 = 가우스면</b>.</li><li>그 표면을 미소면적 \\(dA\\) \\(6\\times10^{{18}}\\)개로 쪼갠다.</li><li>\\(dA\\) 하나에 전기력선 하나가 들어간다.</li><li>\\(dA\\)마다 <b>법선벡터 \\(\\hat n\\)</b>(수직 벡터)이 하나씩 있다.</li></ol>
{fig_gauss}
<div class="why">전기력선과 법선벡터가 <b>평행</b>이면 사이각 0° → \\(\\vec E\\cdot\\hat n=E\\cdot1\\cdot\\cos0^\\circ=E\\). 벡터의 내적이 그냥 숫자가 되어 \\(\\oint E\\,dA=q/\\varepsilon_0\\). 그래서 가우스 법칙에서 나오는 값은 전부 스칼라다.</div>
<div class="say">"전기력선 하나와 미소면적 법선벡터 하나는 서로 수직하냐 평행하냐 — 평행한 게 머릿속에 그려져야 돼요."</div>
<div class="analogy">축구공 안에 전등(+1 C)이 있고 공 표면에 작은 창(\\(dA\\))이 \\(6\\times10^{{18}}\\)개 있다. 창 하나마다 빛줄기(전기력선) 하나가 창에 <b>수직으로</b> 빠져나간다. 창을 다 세면 전등의 밝기(전하)가 나온다 — 창을 세는 것이 가우스 법칙이고, 공 대신 어떤 봉지를 씌워도 빠져나가는 빛줄기 수는 같다.</div>
<h3>가우스면은 딱 3개</h3>
{fig_three}
<div class="why">어렵게 전기장을 구하려는 게 아니라 <b>쉽게</b> 구하려는 것. 그래서 표면적을 바로 쓸 수 있는 세 모양만 쓴다: 면 \\(A\\), 원통 옆면 \\(2\\pi rL\\)(윗면·아랫면은 전기력선과 평행이라 기여 0), 구 \\(4\\pi r^2\\).</div>
<figure class="board"><img data-photo="일반물리학2/2026-09-11/판서_05_가우스면3종.jpg" alt="판서 5"><figcaption>판서 ⑤ 가우스면 3종 (11:06)</figcaption></figure>
<div class="memo"><b>외울 것</b> \\(\\oint\\vec E\\cdot\\hat n\\,dA=q_{{enc}}/\\varepsilon_0\\) · 전기력선 ∥ 법선벡터 → 내적은 \\(E\\) · 가우스면 3종: 면 \\(A\\) · 원통 옆면 \\(2\\pi rL\\) · 구 \\(4\\pi r^2\\)</div>
<p>다음 시간: 가우스 법칙 본격 — 3종으로 지난 결과를 다시 뽑고, 도체구·부도체구.</p>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 원형 도선의 대칭</div><div class="qb">균일하게 대전된 고리의 중심축에서 전기장을 구할 때 살아남는 성분과 이유는?</div><ol class="choices"><li data-ok="1">축(z) 성분만 — 정반대편 조각의 수평 성분이 상쇄</li><li>수평 성분만 — 축 성분이 상쇄</li><li>모든 성분 — 상쇄되는 것이 없다</li><li>아무 성분도 없다 — 축에서는 항상 0</li></ol><div class="ans">\\(dE_z=dE\\cos\\theta\\)만 한 바퀴 적분. 중심(\\(z=0\\))에서만 0이 된다.</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 원형 도선 결과</div><div class="qb">반지름 \\(R\\), 전하 \\(q\\)인 고리의 축에서 거리 \\(z\\)인 점의 전기장은?</div><ol class="choices"><li data-ok="1">\\(\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{qz}}{{(z^2+R^2)^{{3/2}}}}\\)</li><li>\\(\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{q}}{{\\sqrt{{z^2+R^2}}}}\\)</li><li>\\(\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{q}}{{z^2+R^2}}\\)</li><li>\\(\\dfrac{{\\sigma}}{{2\\varepsilon_0}}\\)</li></ol><div class="ans">\\(\\cos\\theta=z/\\sqrt{{z^2+R^2}}\\)가 곱해져 분모가 3/2 제곱. 2번은 전위(24장)의 꼴.</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 무한 평면</div><div class="qb">면전하밀도 \\(\\sigma\\)인 무한 평면에서 거리 \\(z\\)인 점의 전기장은?</div><ol class="choices"><li data-ok="1">\\(\\sigma/2\\varepsilon_0\\), \\(z\\)와 무관</li><li>\\(\\sigma/\\varepsilon_0\\), \\(z\\)와 무관</li><li>\\(\\sigma/(2\\varepsilon_0z^2)\\)</li><li>\\(\\sigma/(2\\varepsilon_0z)\\)</li></ol><div class="ans">원판 결과에서 \\(R\\to\\infty\\) → 둘째 항 0. (도체 표면 한쪽만 볼 때의 \\(\\sigma/\\varepsilon_0\\)와 구별 — 23장.)</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 가우스면 3종</div><div class="qb">교수님이 "이것뿐"이라고 한 가우스면 3종과 넓이는?</div><ol class="choices"><li data-ok="1">면 \\(A\\) · 원통 옆면 \\(2\\pi rL\\) · 구 \\(4\\pi r^2\\)</li><li>면 \\(A\\) · 원통 \\(2\\pi r^2+2\\pi rL\\) · 구 \\(4\\pi r^2\\)</li><li>정육면체 \\(6a^2\\) · 원통 \\(2\\pi rL\\) · 구 \\(4\\pi r^2\\)</li><li>면 \\(A\\) · 원뿔 · 구 \\(\\frac43\\pi r^3\\)</li></ol><div class="ans">원통은 옆면만(윗면·아랫면은 전기력선과 평행). 구는 표면적(부피 아님).</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 왜 스칼라인가</div><div class="qb">가우스 법칙 \\(\\oint\\vec E\\cdot\\hat n\\,dA\\)에서 내적이 그냥 \\(E\\)가 되는 이유를 한 줄로 쓰라.</div><div class="ans">가우스면 위 미소면적의 법선벡터 \\(\\hat n\\)과 전기력선(\\(\\vec E\\))이 평행 → 사이각 0° → \\(E\\cdot1\\cdot\\cos0^\\circ=E\\). 그래서 \\(E\\oint dA=q/\\varepsilon_0\\), 값은 스칼라.</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 원판 치환</div><div class="qb">원판 적분 \\(\\int_0^R\\frac{{r\\,dr}}{{(r^2+z^2)^{{3/2}}}}\\)에 치환 \\(A^2=r^2+z^2\\)를 쓸 때 새 적분 구간은?</div><ol class="choices"><li data-ok="1">\\(A=z\\)부터 \\(\\sqrt{{z^2+R^2}}\\)까지</li><li>\\(A=0\\)부터 \\(R\\)까지</li><li>\\(A=0\\)부터 \\(z\\)까지</li><li>\\(A=R\\)부터 \\(z\\)까지</li></ol><div class="ans">\\(r=0\\)이면 \\(A=z\\), \\(r=R\\)이면 \\(A=\\sqrt{{z^2+R^2}}\\). 구간을 안 바꾸는 것이 가장 흔한 실수.</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
