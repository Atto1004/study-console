# -*- coding: utf-8 -*-
"""정역학 · 2026-09-14 수업 노트 (근거: 2026-09-14/정리.md 녹음 64분(영어 구간 단편) + 교수필기_한글_3주차_W3-1 + 영상정리_3주차_W3-1 54분)"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\정역학\_수업노트\2026-09-14.html"

fig_ijk = canvas(560, 200,
    axes3d(150, 150, 90), arrow(150, 150, 150, 92, RED, "", 3.2), text(160, 96, "k", 14, RED, "start", True),
    arrow(150, 150, 210, 150, RED, "", 3.2), text(206, 170, "j", 14, RED, "middle", True),
    arrow(150, 150, 114, 180, RED, "", 3.2), text(102, 196, "i", 14, RED, "middle", True),
    text(400, 50, "i·i = j·j = k·k = 1", 15, INK, "middle", True), text(400, 76, "i·j = j·k = k·i = 0", 15, INK, "middle", True),
    text(400, 110, "같은 방향 → cos 0° = 1", 12.5, GRAY, "middle"), text(400, 130, "수직 → cos 90° = 0", 12.5, GRAY, "middle"),
    text(400, 168, "그래서 성분 전개에서 교차항이 사라진다", 12.5, GREEN, "middle", True),
    cap="단위벡터끼리의 내적 표. 필기본에서 x·y·z 축에 \\(\\mathbf i,\\mathbf j,\\mathbf k\\)를 빨간색으로 표시한 그림.")

fig_proj = canvas(560, 230,
    line(40, 170, 520, 170, INK, 2.2), text(500, 192, "직선 L", 13, INK, "end"),
    arrow(120, 170, 200, 170, GREEN, "", 3.4), text(160, 192, "e (|e| = 1)", 13, GREEN, "middle"),
    arrow(120, 170, 380, 50, BLUE, "", 3), text(240, 96, "U", 16, BLUE, "middle", True),
    arc(120, 170, 46, -25, 0, GRAY, 1.5, "θ", 58),
    line(380, 50, 380, 170, GRAY, 1.2, "5 4"),
    arrow(120, 156, 380, 156, RED, "", 2.6), text(250, 146, "U_p = (U·e) e   |U_p| = |U| cos θ", 13, RED, "middle"),
    arrow(394, 170, 394, 50, PINK, "", 2.6), text(408, 112, "U_n = U − U_p", 13, PINK, "start"),
    cap="정사영: 벡터 \\(\\mathbf U\\)를 직선 L에 <b>평행한 성분</b> \\(\\mathbf U_p\\)와 <b>수직한 성분</b> \\(\\mathbf U_n\\)으로. 크기는 내적으로, 방향은 단위벡터 \\(\\mathbf e\\)로.")

fig_cross = canvas(560, 250,
    # 평면 (평행사변형)
    path("M120 200 L 300 200 L 380 120 L 200 120 Z", GRAY, 1.5, "rgba(138,151,166,.12)", "4 3"),
    arrow(120, 200, 300, 200, BLUE, "", 3), text(210, 222, "U", 15, BLUE, "middle", True),
    arrow(120, 200, 200, 120, RED, "", 3), text(146, 150, "V", 15, RED, "middle", True),
    arc(120, 200, 44, -45, 0, GRAY, 1.5, "θ", 56),
    line(200, 120, 200, 200, GRAY, 1.2, "3 3"), text(214, 166, "|V| sin θ", 11.5, GRAY),
    arrow(120, 200, 120, 40, GREEN, "", 3.4), text(134, 46, "U × V = |U||V| sin θ · e", 14, GREEN, "start", True),
    text(134, 66, "e ⊥ U, e ⊥ V (평면에 수직)", 12, GREEN, "start"),
    text(250, 90, "|U × V| = 평행사변형의 넓이", 13, INK, "middle"),
    text(470, 150, "오른손 법칙", 13.5, INK, "middle", True), text(470, 170, "손가락 U → V 로 감으면", 12, GRAY, "middle"), text(470, 188, "엄지가 U × V", 12, GRAY, "middle"),
    text(470, 218, "V × U = −(U × V)", 13.5, RED, "middle", True),
    cap="외적은 <b>벡터</b>. 크기 = 두 벡터가 만드는 평행사변형의 넓이, 방향 = 두 벡터가 이루는 평면에 수직(오른손 법칙). 평행이면 sin θ = 0 → 0.")

fig_cyc = canvas(560, 190,
    circle(150, 95, 60, INK, w=2), text(150, 30, "i", 16, RED, "middle", True), text(206, 128, "j", 16, RED, "middle", True), text(94, 128, "k", 16, RED, "middle", True),
    arc(150, 95, 60, -60, 20, GREEN, 2.5), arc(150, 95, 60, 60, 140, GREEN, 2.5), arc(150, 95, 60, 180, 260, GREEN, 2.5),
    text(150, 100, "순환 → +", 12.5, GREEN, "middle", True),
    text(400, 50, "i × j = k,  j × k = i,  k × i = j", 15, INK, "middle", True),
    text(400, 80, "거꾸로 가면 −:  j × i = −k,  k × j = −i,  i × k = −j", 13, RED, "middle"),
    text(400, 110, "같은 것끼리: i × i = j × j = k × k = 0", 13, INK, "middle"),
    text(400, 150, "\"같은 방향은 0, 반대로 하면 마이너스\"", 12.5, GRAY, "middle"),
    cap="i → j → k → i 순환 순서대로면 +, 거꾸로면 −. 오른손으로 확인해도 된다.")

fig_comp = canvas(560, 205,
    text(60, 52, "U =", 15, BLUE, "end", True), text(60, 96, "V =", 15, RED, "end", True), text(60, 150, "곱 =", 15, INK, "end", True),
    text(130, 52, "1", 17, BLUE, "middle"), text(220, 52, "2", 17, BLUE, "middle"), text(310, 52, "2", 17, BLUE, "middle"),
    text(130, 96, "2", 17, RED, "middle"), text(220, 96, "0", 17, RED, "middle"), text(310, 96, "1", 17, RED, "middle"),
    arrow(130, 62, 130, 84, GRAY, "", 1.2), arrow(220, 62, 220, 84, GRAY, "", 1.2), arrow(310, 62, 310, 84, GRAY, "", 1.2),
    arrow(130, 106, 130, 132, GRAY, "", 1.2), arrow(220, 106, 220, 132, GRAY, "", 1.2), arrow(310, 106, 310, 132, GRAY, "", 1.2),
    text(130, 150, "2", 17, INK, "middle", True), text(220, 150, "0", 17, INK, "middle", True), text(310, 150, "2", 17, INK, "middle", True),
    text(130, 30, "i 끼리", 11.5, GRAY, "middle"), text(220, 30, "j 끼리", 11.5, GRAY, "middle"), text(310, 30, "k 끼리", 11.5, GRAY, "middle"),
    text(370, 150, "→ 더하면 U·V = 4", 15, GREEN, "start", True),
    text(440, 60, "|U| = √(1+4+4) = 3", 13, INK, "middle"), text(440, 84, "|V| = √(4+0+1) = √5", 13, INK, "middle"),
    text(440, 118, "cos θ = 4 / (3√5) = 0.596", 13.5, INK, "middle", True), text(440, 140, "θ ≈ 53.4°", 15, GREEN, "middle", True),
    text(280, 190, "성분끼리 곱해서 더한다 — 교차항(i·j 등)은 0이라 사라졌다", 12.5, GRAY, "middle"),
    cap="성분 내적의 흐름: 같은 축 성분끼리 곱해 더하면 스칼라 하나. 정의식과 붙이면 사이각이 나온다.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>정역학 · 9/14 내적 마무리 · 정사영 · 외적 · 행렬식</title></head><body>
<header>
<h1>내적으로 각과 정사영을, 외적으로 모멘트를 — 벡터의 두 곱셈</h1>
<p class="lead">앞 30분은 지난 시간 정의만 한 <b>내적</b>을 끝낸다: 성질 → 단위벡터 표 → 성분 공식 → 사이각 → <b>직선 위 정사영</b>. 뒤 25분은 <b>외적</b>을 정의부터 행렬식까지 한 번에. 교수님이 먼저 답한 질문 — "외적은 왜 배우나? <b>모멘트</b>를 계산할 때 쓴다(4장)."</p>
<p class="meta"><span>녹음 64분</span><span>교수 필기본 W3-1 12p</span><span>LMS 영상 54분</span><span>3주차 · 월</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 내적의 성질과 단위벡터 표</h2>
<div class="formula">\\[\\mathbf U\\cdot\\mathbf V=\\mathbf V\\cdot\\mathbf U\\ (\\text{{교환}}),\\quad a(\\mathbf U\\cdot\\mathbf V)=(a\\mathbf U)\\cdot\\mathbf V=\\mathbf U\\cdot(a\\mathbf V),\\quad \\mathbf U\\cdot(\\mathbf V+\\mathbf W)=\\mathbf U\\cdot\\mathbf V+\\mathbf U\\cdot\\mathbf W\\ (\\text{{분배}})\\]</div>
{fig_ijk}
<div class="say">"방향이 같으면 1이고 수직이면 무조건 0" — 교수님이 9개를 하나씩 다 읽었다.</div>
<div class="why">이 표가 다음 절의 전부다. \\(\\mathbf U\\cdot\\mathbf V\\)를 성분으로 전개하면 9개 항이 나오는데, 서로 다른 축끼리(\\(\\mathbf i\\cdot\\mathbf j\\) 등) 6개는 0으로 사라지고 같은 축끼리 3개만 남는다.</div>
<div class="analogy">동서남북으로 곧게 난 길 위에서 "동쪽 길과 북쪽 길이 겹치는 정도"는 0, "동쪽 길과 동쪽 길"은 100%. 단위벡터 표는 그 겹침표다.</div>
<div class="memo"><b>외울 것</b> \\(\\mathbf i\\cdot\\mathbf i=\\mathbf j\\cdot\\mathbf j=\\mathbf k\\cdot\\mathbf k=1\\) · 서로 다른 것끼리 0 · 교환·분배 성립</div>
</section>

<section class="s" data-id="s2">
<h2>2. 성분으로 내적 → 두 벡터 사이의 각 ★</h2>
<div class="formula">\\[\\mathbf U\\cdot\\mathbf V=U_xV_x+U_yV_y+U_zV_z\\qquad\\Rightarrow\\qquad \\cos\\theta=\\frac{{U_xV_x+U_yV_y+U_zV_z}}{{|\\mathbf U||\\mathbf V|}},\\quad \\theta=\\cos^{{-1}}\\!\\left(\\frac{{\\mathbf U\\cdot\\mathbf V}}{{|\\mathbf U||\\mathbf V|}}\\right)\\]</div>
<div class="say">"<b>i 성분끼리 곱하고, j 성분끼리 곱하고, k 성분끼리 곱해서</b> 더하면 됩니다." · "이 공식은 <b>공간에서 두 벡터 또는 두 직선 사이의 각</b>을 구할 때 쓴다."</div>
{fig_comp}
<div class="why">정의식 \\(|\\mathbf U||\\mathbf V|\\cos\\theta\\)와 성분식이 같은 값이므로 둘을 붙이면 \\(\\cos\\theta\\)가 나온다. 각도기를 못 대는 3차원 공간의 두 선(케이블 두 가닥, 축과 힘)의 각을 좌표만으로 구하는 도구.</div>
<details class="ex"><summary>연습 — \\(\\mathbf U=(1,2,2)\\), \\(\\mathbf V=(2,0,1)\\)의 사이각</summary><div class="body"><p>\\(\\mathbf U\\cdot\\mathbf V=1\\cdot2+2\\cdot0+2\\cdot1=4\\), \\(|\\mathbf U|=\\sqrt{{1+4+4}}=3\\), \\(|\\mathbf V|=\\sqrt{{4+0+1}}=\\sqrt5\\approx2.236\\).</p><p>\\(\\cos\\theta=\\dfrac{{4}}{{3\\times2.236}}=0.596\\) → \\(\\theta\\approx53.4^\\circ\\).</p></div></details>
<div class="analogy">두 사람이 각자 "동·북·위로 몇 걸음" 갔는지만 알려 주면, 만나지 않아도 두 사람의 진행 방향 사이 각을 계산할 수 있다.</div>
<div class="memo"><b>외울 것</b> \\(\\mathbf U\\cdot\\mathbf V=U_xV_x+U_yV_y+U_zV_z\\) · \\(\\theta=\\cos^{{-1}}\\big(\\mathbf U\\cdot\\mathbf V/|\\mathbf U||\\mathbf V|\\big)\\)</div>
</section>

<section class="s" data-id="s3">
<h2>3. 직선에 평행·수직한 성분 — 정사영 ★★</h2>
<p>덧셈 때 \\(x\\)·\\(y\\)로 나눴듯, 공학 문제에서는 <b>어떤 직선 L에 평행한 성분과 수직한 성분</b>으로 나누면 계산이 쉽다. 벡터 \\(\\mathbf U\\)와 직선 L이 있으면 항상 \\(\\mathbf U=\\mathbf U_p+\\mathbf U_n\\).</p>
{fig_proj}
<div class="formula">\\[|\\mathbf U_p|=|\\mathbf U|\\cos\\theta,\\qquad \\mathbf e\\cdot\\mathbf U=|\\mathbf e||\\mathbf U|\\cos\\theta=|\\mathbf U|\\cos\\theta\\ (\\text{{L 방향 스칼라 성분}})\\] \\[\\boxed{{\\ \\mathbf U_p=(\\mathbf U\\cdot\\mathbf e)\\,\\mathbf e\\ }}\\qquad \\mathbf U_n=\\mathbf U-\\mathbf U_p\\]</div>
<div class="say">"내적은 스칼라니까" 크기가 나오고, 방향은 단위벡터 \\(\\mathbf e\\)로 — "<b>이게 크기, 이게 방향</b>." · 수직 성분은 "평행 성분을 구했으면 원래 벡터에서 빼면" 된다. · "2학년 올라가서 배울 <b>재료역학·동역학 다 똑같다</b>."</div>
<div class="why">\\((\\mathbf U\\cdot\\mathbf e)\\)는 부호 있는 길이(L의 + 방향이면 +, 반대면 −), 여기에 \\(\\mathbf e\\)를 곱하면 방향이 붙어 벡터가 된다. 완전히 수직이면 \\(\\mathbf U_p=0\\), 평행이면 \\(\\mathbf U_n=0\\). 필기본에서 <b>빨간 박스</b>를 친 시험 공식.</div>
<details class="ex"><summary>연습 — \\(\\mathbf U=4\\mathbf i+3\\mathbf j\\)를 직선 L(방향 \\(\\mathbf i+\\mathbf j\\))에 대해 분해</summary><div class="body"><p>① \\(\\mathbf e=(\\mathbf i+\\mathbf j)/\\sqrt2\\) ② \\(\\mathbf U\\cdot\\mathbf e=(4+3)/\\sqrt2=7/\\sqrt2\\approx4.95\\) ③ \\(\\mathbf U_p=(7/\\sqrt2)\\,(\\mathbf i+\\mathbf j)/\\sqrt2=3.5\\mathbf i+3.5\\mathbf j\\) ④ \\(\\mathbf U_n=\\mathbf U-\\mathbf U_p=0.5\\mathbf i-0.5\\mathbf j\\). 검산: \\(\\mathbf U_n\\cdot\\mathbf e=(0.5-0.5)/\\sqrt2=0\\) ✓ 수직.</p></div></details>
<div class="analogy">햇빛이 직선 L 방향으로 비칠 때 막대 \\(\\mathbf U\\)의 그림자 길이가 \\(|\\mathbf U|\\cos\\theta\\). 그림자가 평행 성분, 막대에서 그림자를 뺀 나머지가 수직 성분.</div>
<div class="memo"><b>외울 것</b> \\(\\mathbf U_p=(\\mathbf U\\cdot\\mathbf e)\\mathbf e\\) · \\(\\mathbf U_n=\\mathbf U-\\mathbf U_p\\) · \\(\\mathbf e\\)는 반드시 단위벡터 · 검산 \\(\\mathbf U_n\\cdot\\mathbf e=0\\)</div>
</section>

<section class="s" data-id="s4">
<h2>4. 외적(cross product) — 정의 · 오른손 법칙 · 넓이</h2>
<div class="say">"외적은 왜 배우는지 아시나요? — 외적은 <b>모멘트(moment)</b>를 계산할 때 쓴다." (4장: \\(\\mathbf M=\\mathbf r\\times\\mathbf F\\))</div>
{fig_cross}
<div class="formula">\\[\\mathbf U\\times\\mathbf V=|\\mathbf U||\\mathbf V|\\sin\\theta\\ \\mathbf e\\qquad(\\mathbf e\\perp\\mathbf U,\\ \\mathbf e\\perp\\mathbf V,\\ |\\mathbf e|=1)\\] \\[\\mathbf V\\times\\mathbf U=-(\\mathbf U\\times\\mathbf V),\\qquad \\mathbf U\\parallel\\mathbf V\\Rightarrow\\mathbf U\\times\\mathbf V=0\\]</div>
<div class="why">내적은 스칼라였는데 외적은 <b>벡터</b>라 vector product라고도 부른다. 방향은 두 벡터가 이루는 평면에 수직인데 위·아래 둘 중 하나 — <b>오른손 법칙</b>: 손가락을 \\(\\mathbf U\\)에서 \\(\\mathbf V\\)로 감을 때 엄지 방향. 순서를 바꾸면 엄지가 반대로 → 교환법칙 불성립. 크기 \\(|\\mathbf U||\\mathbf V|\\sin\\theta\\)는 \\(\\mathbf U\\)를 밑변, \\(|\\mathbf V|\\sin\\theta\\)를 높이로 한 <b>평행사변형의 넓이</b>(삼각형은 절반). 평행이면 평행사변형이 안 그려지니 0.</div>
<div class="analogy">나사를 \\(\\mathbf U\\)에서 \\(\\mathbf V\\) 쪽으로 돌리면 나사가 나아가는 방향이 \\(\\mathbf U\\times\\mathbf V\\). 반대로 돌리면 빠진다(−). 렌치로 볼트를 돌리는 힘(모멘트)이 이 방향으로 정의되는 이유.</div>
<div class="memo"><b>외울 것</b> \\(|\\mathbf U\\times\\mathbf V|=|\\mathbf U||\\mathbf V|\\sin\\theta\\) = 평행사변형 넓이 · 방향 = 평면에 수직, 오른손 · \\(\\mathbf V\\times\\mathbf U=-\\mathbf U\\times\\mathbf V\\) · 평행 ⇔ 0</div>
</section>

<section class="s" data-id="s5">
<h2>5. 성질 · 단위벡터 순환 · 성분 전개 · 행렬식 ★★</h2>
<div class="formula">\\[a(\\mathbf U\\times\\mathbf V)=(a\\mathbf U)\\times\\mathbf V=\\mathbf U\\times(a\\mathbf V),\\qquad \\mathbf U\\times(\\mathbf V+\\mathbf W)=\\mathbf U\\times\\mathbf V+\\mathbf U\\times\\mathbf W\\]</div>
{fig_cyc}
<p>\\((U_x\\mathbf i+U_y\\mathbf j+U_z\\mathbf k)\\times(V_x\\mathbf i+V_y\\mathbf j+V_z\\mathbf k)\\)를 위 표로 전개하면 9항 중 3항이 0:</p>
<div class="formula">\\[\\mathbf U\\times\\mathbf V=(U_yV_z-U_zV_y)\\,\\mathbf i-(U_xV_z-U_zV_x)\\,\\mathbf j+(U_xV_y-U_yV_x)\\,\\mathbf k=\\begin{{vmatrix}}\\mathbf i&\\mathbf j&\\mathbf k\\\\U_x&U_y&U_z\\\\V_x&V_y&V_z\\end{{vmatrix}}\\]</div>
<div class="why">"행렬 배우셨죠?" — 3×3 행렬식을 첫 행으로 전개하면 위 식이 그대로 나온다. \\(\\mathbf i\\)·\\(\\mathbf j\\)·\\(\\mathbf k\\) 각각에 대해 그 행·열을 지우고 남는 2×2 행렬식(\\(\\begin{{vmatrix}}a&b\\\\c&d\\end{{vmatrix}}=ad-bc\\))을 붙인다. <b>\\(\\mathbf j\\) 항의 부호가 −</b>.</div>
<div class="say">"<b>j 항은 마이너스다. 플러스가 아니라 마이너스. 조심해라</b>" — 두 번 반복. "부호(minus)가 많이 쓰이니까 조심하셔야 돼요."</div>
<details class="ex"><summary>연습 — \\(\\mathbf U=(1,2,3)\\), \\(\\mathbf V=(4,5,6)\\)</summary><div class="body"><p>\\(\\mathbf i\\): \\(2\\cdot6-3\\cdot5=-3\\) · \\(\\mathbf j\\): \\(-(1\\cdot6-3\\cdot4)=-(6-12)=+6\\) · \\(\\mathbf k\\): \\(1\\cdot5-2\\cdot4=-3\\) → \\(\\mathbf U\\times\\mathbf V=-3\\mathbf i+6\\mathbf j-3\\mathbf k\\).</p><p>검산: \\(\\mathbf U\\cdot(\\mathbf U\\times\\mathbf V)=-3+12-9=0\\) ✓ (결과는 \\(\\mathbf U\\)에 수직).</p></div></details>
<div class="analogy">행렬식은 "지우고 곱하기" 놀이다. \\(\\mathbf j\\) 차례에만 부호를 뒤집는 것을 잊으면 답의 한 성분이 통째로 틀린다 — 검산은 결과를 \\(\\mathbf U\\)와 내적해 0이 나오는지.</div>
<div class="memo"><b>외울 것</b> 행렬식 \\(\\begin{{vmatrix}}\\mathbf i&\\mathbf j&\\mathbf k\\\\U_x&U_y&U_z\\\\V_x&V_y&V_z\\end{{vmatrix}}\\) · <b>j 항은 −</b> · 순환 i→j→k는 +, 거꾸로 − · 검산: 결과 · U = 0</div>
<p>"수요일에 보자" — 9/16: 혼합삼중적, 그리고 Ch.3 힘(중간고사 범위 시작).</p>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 성분 내적</div><div class="qb">\\(\\mathbf U=(1,2,2)\\), \\(\\mathbf V=(2,0,1)\\)일 때 \\(\\mathbf U\\cdot\\mathbf V\\)는?</div><ol class="choices"><li data-ok="1">4</li><li>2</li><li>\\((2,0,2)\\)</li><li>6</li></ol><div class="ans">\\(1\\cdot2+2\\cdot0+2\\cdot1=4\\). 3번은 성분끼리 곱만 하고 안 더한 것(내적은 스칼라).</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 사이각</div><div class="qb">위 두 벡터의 사이각은 약?</div><ol class="choices"><li data-ok="1">53°</li><li>37°</li><li>90°</li><li>0°</li></ol><div class="ans">\\(\\cos\\theta=4/(3\\sqrt5)=0.596\\) → \\(53.4^\\circ\\).</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 정사영</div><div class="qb">직선 L 방향의 단위벡터가 \\(\\mathbf e\\)일 때, \\(\\mathbf U\\)의 L에 평행한 <b>벡터</b> 성분은?</div><ol class="choices"><li data-ok="1">\\(\\mathbf U_p=(\\mathbf U\\cdot\\mathbf e)\\,\\mathbf e\\)</li><li>\\(\\mathbf U_p=\\mathbf U\\cdot\\mathbf e\\)</li><li>\\(\\mathbf U_p=\\mathbf U/|\\mathbf e|\\)</li><li>\\(\\mathbf U_p=(\\mathbf U\\times\\mathbf e)\\,\\mathbf e\\)</li></ol><div class="ans">크기 \\((\\mathbf U\\cdot\\mathbf e)\\)에 방향 \\(\\mathbf e\\). 2번은 스칼라 성분(크기)일 뿐.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 외적의 성질</div><div class="qb">외적에 대해 옳은 것은?</div><ol data-x="" class="choices"><li data-ok="1">\\(\\mathbf V\\times\\mathbf U=-(\\mathbf U\\times\\mathbf V)\\) — 교환법칙이 성립하지 않는다</li><li>\\(\\mathbf U\\times\\mathbf V=\\mathbf V\\times\\mathbf U\\)</li><li>두 벡터가 평행일 때 크기가 최대다</li><li>결과는 스칼라다</li></ol><div class="ans">오른손 법칙에서 순서를 바꾸면 엄지가 반대. 평행이면 \\(\\sin\\theta=0\\) → 0. 결과는 벡터.</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 행렬식</div><div class="qb">\\(\\mathbf U=(1,2,3)\\), \\(\\mathbf V=(4,5,6)\\)일 때 \\(\\mathbf U\\times\\mathbf V\\)는?</div><ol class="choices"><li data-ok="1">\\((-3,\\,6,\\,-3)\\)</li><li>\\((-3,\\,-6,\\,-3)\\)</li><li>\\((3,\\,-6,\\,3)\\)</li><li>\\((4,\\,10,\\,18)\\)</li></ol><div class="ans">2번은 \\(\\mathbf j\\) 항 부호를 빠뜨린 것, 3번은 \\(\\mathbf V\\times\\mathbf U\\), 4번은 성분끼리 곱한 것(외적 아님).</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 정사영 계산</div><div class="qb">\\(\\mathbf U=4\\mathbf i+3\\mathbf j\\)를 방향 \\(\\mathbf i+\\mathbf j\\)인 직선에 대해 \\(\\mathbf U_p\\), \\(\\mathbf U_n\\)으로 분해하라.</div><div class="ans">\\(\\mathbf e=(\\mathbf i+\\mathbf j)/\\sqrt2\\), \\(\\mathbf U\\cdot\\mathbf e=7/\\sqrt2\\), \\(\\mathbf U_p=3.5\\mathbf i+3.5\\mathbf j\\), \\(\\mathbf U_n=0.5\\mathbf i-0.5\\mathbf j\\). 검산 \\(\\mathbf U_n\\cdot\\mathbf e=0\\).</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
