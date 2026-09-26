# -*- coding: utf-8 -*-
"""정역학 · 2026-09-09 수업 노트 (결석 회차 — 교수 필기본 W12 11p + LMS 영상 48분 전사로 재구성. 근거: 2026-09-09/정리.md · 영상정리_2주차_W2-2)"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\정역학\_수업노트\2026-09-09.html"

fig_2d = canvas(560, 220,
    axis(60, 180, 300, 180, "x", "y") + arrow(60, 180, 60, 30, INK, "", 1.5),
    arrow(60, 180, 240, 70, BLUE, "", 3), text(160, 112, "U", 16, BLUE, "middle", True),
    line(240, 70, 240, 180, GRAY, 1.2, "5 4"), line(60, 70, 240, 70, GRAY, 1.2, "5 4"),
    arrow(60, 190, 240, 190, RED, "", 2.2), text(150, 208, "Uₓ i", 13, RED, "middle"),
    arrow(46, 180, 46, 70, GREEN, "", 2.2), text(30, 128, "U_y j", 13, GREEN, "end"),
    text(420, 70, "U = Uₓ i + U_y j", 16, INK, "middle", True), text(420, 100, "|U| = √(Uₓ² + U_y²)", 15, INK, "middle"),
    text(420, 140, "i, j = +x, +y 방향 단위벡터", 12.5, GRAY, "middle"), text(420, 160, "Uₓ, U_y = 스칼라 성분", 12.5, GRAY, "middle"),
    cap="직교좌표(Cartesian)에 놓으면 벡터가 x·y 성분으로 갈라진다. 크기는 피타고라스.")

fig_pos = canvas(560, 200,
    axis(50, 160, 330, 160, "x", "y") + arrow(50, 160, 50, 30, INK, "", 1.5),
    dot(120, 130, "", 5, INK), text(112, 152, "A (x_A, y_A)", 12, INK, "middle"), dot(290, 55, "", 5, INK), text(290, 44, "B (x_B, y_B)", 12, INK, "middle"),
    arrow(126, 127, 286, 58, GREEN, "", 2.8), text(216, 82, "r_AB", 14, GREEN, "middle", True),
    line(120, 130, 290, 130, GRAY, 1.2, "5 4"), line(290, 130, 290, 55, GRAY, 1.2, "5 4"), text(205, 146, "x_B − x_A", 12, GRAY, "middle"), text(300, 96, "y_B − y_A", 12, GRAY),
    text(450, 80, "r_AB = (x_B − x_A) i", 14, INK, "middle", True), text(450, 102, "      + (y_B − y_A) j", 14, INK, "middle", True), text(450, 140, "\"끝점 − 시작점\"", 15, GREEN, "middle", True),
    cap="두 점 사이 위치벡터: 성분마다 <b>끝점에서 시작점을 뺀다</b>. 3D는 \\(z\\) 성분이 하나 더 붙을 뿐.")

ox, oy = 200, 170
tip = p3(ox, oy, 50, 110, 90); px = p3(ox, oy, 50, 0, 0); py = p3(ox, oy, 0, 110, 0); pz = p3(ox, oy, 0, 0, 90)
fig_3d = canvas(560, 250,
    axes3d(ox, oy, 100),
    arrow(ox, oy, tip[0], tip[1], BLUE, "", 3), text(tip[0] + 14, tip[1] - 4, "U", 16, BLUE, "start", True),
    line(ox, oy, px[0], px[1], RED, 1.6, "5 4"), line(ox, oy, py[0], py[1], RED, 1.6, "5 4"), line(ox, oy, pz[0], pz[1], RED, 1.6, "5 4"),
    text(px[0] - 10, px[1] + 14, "Uₓ", 12, RED, "middle"), text(py[0], py[1] + 16, "U_y", 12, RED, "middle"), text(pz[0] - 12, pz[1] + 4, "U_z", 12, RED, "end"),
    text(216, 118, "θ_z", 12, GRAY), text(258, 158, "θ_y", 12, GRAY), text(184, 178, "θₓ", 12, GRAY),
    text(430, 60, "Uₓ = |U| cos θₓ", 14, INK, "middle"), text(430, 84, "U_y = |U| cos θ_y", 14, INK, "middle"), text(430, 108, "U_z = |U| cos θ_z", 14, INK, "middle"),
    text(430, 150, "cos²θₓ + cos²θ_y + cos²θ_z = 1", 15, RED, "middle", True), text(430, 176, "세 각은 독립이 아니다", 12.5, GRAY, "middle"),
    cap="3D에서 방향은 각 하나로 못 정한다 — +x, +y, +z 축과 이루는 각 \\(\\theta_x,\\theta_y,\\theta_z\\) 셋. 그 코사인이 <b>방향여현</b>.")

fig_cable = canvas(560, 200,
    line(40, 170, 520, 170, INK, 2), block(90, 110, 60, 60, "A", INK),
    line(430, 170, 430, 40, INK, 4), dot(430, 40, "", 5, INK), text(446, 44, "B", 13, INK),
    line(150, 122, 430, 40, GRAY, 1.5), text(280, 72, "케이블 (A → B)", 12, GRAY, "middle"),
    arrow(150, 122, 262, 89, GREEN, "", 3), text(200, 118, "F = |F| e_AB", 14, GREEN, "middle", True),
    text(300, 150, "e_AB = r_AB / |r_AB|  ← 방향은 두 점의 좌표로", 13, INK, "middle"),
    cap="정역학의 기본 동작: 케이블·로프의 힘은 <b>두 점의 좌표</b>로 방향(단위벡터)을 만들고 크기를 곱한다. 3장 평형에서 계속 쓴다.")

fig_dot = canvas(560, 190,
    arrow(60, 140, 220, 140, BLUE, "", 3), text(140, 162, "U", 15, BLUE, "middle", True),
    arrow(60, 140, 170, 50, RED, "", 3), text(100, 88, "V", 15, RED, "middle", True),
    arc(60, 140, 40, -39, 0, GRAY, 1.5, "θ", 52),
    text(150, 30, "꼬리를 맞대고 사이각 θ", 12.5, GRAY, "middle"),
    text(400, 50, "U · V = |U||V| cos θ  (스칼라)", 15, INK, "middle", True),
    text(400, 84, "θ = 0°  → +|U||V| (최대)", 13, GREEN, "middle"), text(400, 108, "θ = 90° → 0", 13, INK, "middle", True), text(400, 132, "θ = 180° → −|U||V|", 13, RED, "middle"),
    text(400, 164, "\"얼마나 같은 방향을 향하는가\"의 척도", 12.5, GRAY, "middle"),
    cap="내적의 정의. 단위는 두 벡터 단위의 곱(둘 다 힘이면 N²). 방향이 없는 스칼라다.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>정역학 · 9/9 성분 · 위치벡터 · 방향여현 · 내적 정의</title></head><body>
<header>
<h1>벡터를 숫자로 다루기 — 성분 · 방향여현 · 내적의 정의</h1>
<p class="lead">이 회차는 결석(−2점 확정)이라 <b>교수님 필기본 11쪽</b>과 <b>LMS 영상 48분</b>으로 재구성했다. 내용은 한 줄이다: 벡터를 \\(\\mathbf i,\\mathbf j,\\mathbf k\\) 성분으로 쪼개면 덧셈·크기·방향이 전부 <b>산수</b>가 된다. 마지막 12분은 내적의 정의 — 교수님은 정의보다 "왜 배우는지"를 먼저 말했다.</p>
<p class="meta"><span>결석 회차(−2점)</span><span>교수 필기본 W12 11p</span><span>LMS 영상 48분</span><span>2주차 · 수</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 2차원 성분 — 벡터를 두 숫자로</h2>
{fig_2d}
<div class="formula">\\[\\mathbf U=U_x\\,\\mathbf i+U_y\\,\\mathbf j,\\qquad |\\mathbf U|=\\sqrt{{U_x^2+U_y^2}}\\] \\[\\mathbf U+\\mathbf V=(U_x+V_x)\\mathbf i+(U_y+V_y)\\mathbf j,\\qquad a\\mathbf U=aU_x\\,\\mathbf i+aU_y\\,\\mathbf j\\]</div>
<div class="why">지난 시간의 삼각형 법칙은 그림이었다. 성분으로 쓰면 <b>같은 성분끼리 더하기</b>만 하면 된다 — 그림 없이 숫자로 끝난다. 스칼라배는 각 성분에 곱한다(분배법칙).</div>
<div class="say">"모두가 이해 못 할 수도 있지만, x·y 좌표는 단위벡터 \\(\\mathbf i,\\mathbf j\\)로 표현할 수 있다."</div>
<div class="analogy">동쪽으로 3 km, 북쪽으로 4 km 걸으면 출발점에서 직선거리 5 km. (3, 4)가 성분, 5가 크기. 두 사람의 이동을 합치려면 동쪽끼리·북쪽끼리 더하면 된다.</div>
<div class="memo"><b>외울 것</b> \\(\\mathbf U=U_x\\mathbf i+U_y\\mathbf j\\) · \\(|\\mathbf U|=\\sqrt{{U_x^2+U_y^2}}\\) · 덧셈은 같은 성분끼리</div>
</section>

<section class="s" data-id="s2">
<h2>2. 두 점 사이의 위치벡터 = "끝점 − 시작점" ★</h2>
{fig_pos}
<div class="formula">\\[\\mathbf r_{{AB}}=(x_B-x_A)\\mathbf i+(y_B-y_A)\\mathbf j\\ \\ (+(z_B-z_A)\\mathbf k),\\qquad |\\mathbf r_{{AB}}|=\\sqrt{{\\Delta x^2+\\Delta y^2+\\Delta z^2}}\\]</div>
<div class="say">"지난 시간에 포지션 벡터는 r로 쓴다 했잖아요." · "<b>끝점 − 시작점</b>(final minus initial)" — 두 번 반복해서 강조. 3D는 "2D와 같다".</div>
<div class="pitfall">순서를 바꾸면 부호가 전부 뒤집힌다: \\(\\mathbf r_{{BA}}=-\\mathbf r_{{AB}}\\). 문제에서 "A에서 B로 당긴다"인지 "B에서 A로"인지 먼저 확정하고 뺄셈 순서를 정한다.</div>
<div class="analogy">A 집 주소와 B 집 주소를 알면 "B로 가려면 동쪽으로 얼마, 북쪽으로 얼마"가 바로 나온다 — 좌표의 차이가 곧 길 안내(벡터)다.</div>
<div class="memo"><b>외울 것</b> \\(\\mathbf r_{{AB}}\\) = (B 좌표) − (A 좌표), 성분마다 · 크기는 \\(\\sqrt{{\\Delta x^2+\\Delta y^2+\\Delta z^2}}\\)</div>
</section>

<section class="s" data-id="s3">
<h2>3. 3차원 성분과 방향여현 ★★</h2>
<p>\\(\\mathbf U=U_x\\mathbf i+U_y\\mathbf j+U_z\\mathbf k\\), \\(|\\mathbf U|=\\sqrt{{U_x^2+U_y^2+U_z^2}}\\). 축은 <b>오른손 좌표계</b>(그림: \\(z\\) 위, \\(y\\) 오른쪽, \\(x\\) 앞). 2D는 각 하나로 방향이 정해졌지만 3D는 각이 <b>셋</b> 필요하다.</p>
{fig_3d}
<div class="formula">\\[U_x=|\\mathbf U|\\cos\\theta_x,\\quad U_y=|\\mathbf U|\\cos\\theta_y,\\quad U_z=|\\mathbf U|\\cos\\theta_z\\qquad\\Rightarrow\\qquad \\cos^2\\theta_x+\\cos^2\\theta_y+\\cos^2\\theta_z=1\\]</div>
<div class="why">관계식이 나오는 이유: 세 성분을 크기 식에 넣으면 \\(|\\mathbf U|^2=|\\mathbf U|^2(\\cos^2\\theta_x+\\cos^2\\theta_y+\\cos^2\\theta_z)\\) → 괄호가 1. 그래서 세 각은 <b>독립이 아니다</b> — 둘을 알면 나머지 하나가 정해진다(부호는 따로). 필기본에서 빨간색으로 강조한 식.</div>
<div class="say">"방향여현 들어봤어요? 왜 쓰는지 지금은 모르겠지만 차차 설명." · "\\(\\theta_x\\)가 바뀌면 나머지도 같이 바뀐다."</div>
<details class="ex"><summary>예 — \\(\\mathbf U=2\\mathbf i+3\\mathbf j+6\\mathbf k\\)의 방향여현</summary><div class="body"><p>\\(|\\mathbf U|=\\sqrt{{4+9+36}}=7\\) → \\(\\cos\\theta_x=2/7\\), \\(\\cos\\theta_y=3/7\\), \\(\\cos\\theta_z=6/7\\). 검산: \\(\\dfrac{{4+9+36}}{{49}}=1\\) ✓. 각으로 바꾸면 \\(\\theta_x\\approx73.4^\\circ\\), \\(\\theta_y\\approx64.6^\\circ\\), \\(\\theta_z\\approx31.0^\\circ\\) — \\(z\\) 쪽으로 가장 기울어 있다(성분이 가장 크니까).</p></div></details>
<div class="analogy">막대에 손전등을 세 방향(앞·옆·위)에서 비추면 세 벽에 그림자가 생긴다. 그림자 길이가 성분 \\(U_x,U_y,U_z\\), "막대 길이 × 각의 코사인"이고, 세 그림자의 제곱합은 막대 길이의 제곱 — 그래서 코사인 제곱합이 1.</div>
<div class="memo"><b>외울 것</b> \\(\\cos^2\\theta_x+\\cos^2\\theta_y+\\cos^2\\theta_z=1\\) · 성분 = 크기 × 방향여현 · 오른손 좌표계</div>
</section>

<section class="s" data-id="s4">
<h2>4. 단위벡터의 성분 = 방향여현 → 케이블 힘 쓰기 ★</h2>
<div class="formula">\\[\\mathbf e=\\frac{{\\mathbf U}}{{|\\mathbf U|}}=\\frac{{U_x}}{{|\\mathbf U|}}\\mathbf i+\\frac{{U_y}}{{|\\mathbf U|}}\\mathbf j+\\frac{{U_z}}{{|\\mathbf U|}}\\mathbf k=\\cos\\theta_x\\,\\mathbf i+\\cos\\theta_y\\,\\mathbf j+\\cos\\theta_z\\,\\mathbf k\\]</div>
<div class="why">단위벡터의 성분이 <b>곧 방향여현</b>이다. 그래서 "단위벡터를 알면 방향여현을 다 안 것"이고, 거꾸로 방향여현 셋을 알면 단위벡터가 나온다. 벡터 = 크기 × 단위벡터 = 크기와 방향여현으로 표현할 수 있다.</div>
{fig_cable}
<div class="formula">\\[\\mathbf e_{{AB}}=\\frac{{\\mathbf r_{{AB}}}}{{|\\mathbf r_{{AB}}|}},\\qquad \\mathbf F=|\\mathbf F|\\,\\mathbf e_{{AB}}=|\\mathbf F|\\,\\frac{{\\mathbf r_{{AB}}}}{{|\\mathbf r_{{AB}}|}}\\]</div>
<div class="say">"두 점으로 방향벡터를 쓸 수도 있고 코사인으로 쓸 수도 있지만, 결국 벡터는 <b>크기와 방향</b>으로 나뉜다는 걸 보여준 것."</div>
<details class="ex"><summary>연습 — A(1, 2, 3)에서 B(4, −2, 5)로 향하는 크기 100 N의 힘을 성분으로</summary><div class="body">
<p>① \\(\\mathbf r_{{AB}}=(4-1)\\mathbf i+(-2-2)\\mathbf j+(5-3)\\mathbf k=3\\mathbf i-4\\mathbf j+2\\mathbf k\\), \\(|\\mathbf r_{{AB}}|=\\sqrt{{9+16+4}}=\\sqrt{{29}}\\approx5.385\\)</p>
<p>② \\(\\mathbf e_{{AB}}=(0.557,\\,-0.743,\\,0.371)\\) — 검산: \\(0.557^2+0.743^2+0.371^2=0.310+0.552+0.138=1.00\\) ✓</p>
<p>③ \\(\\mathbf F=100\\,\\mathbf e_{{AB}}=55.7\\mathbf i-74.3\\mathbf j+37.1\\mathbf k\\) N. 방향여현은 ②의 세 수 그대로: \\(\\theta_x=\\cos^{{-1}}0.557\\approx56.1^\\circ\\).</p></div></details>
<div class="analogy">GPS 좌표 두 개(A, B)만 있으면 "어느 방향으로"가 정해지고, 거기에 "몇 N"만 곱하면 힘이 완성된다 — 방향은 기하(좌표), 크기는 물리(힘).</div>
<div class="memo"><b>외울 것</b> \\(\\mathbf e=\\cos\\theta_x\\mathbf i+\\cos\\theta_y\\mathbf j+\\cos\\theta_z\\mathbf k\\) · \\(\\mathbf F=|\\mathbf F|\\,\\mathbf r_{{AB}}/|\\mathbf r_{{AB}}|\\) · 단위벡터 검산: 성분 제곱합 = 1</div>
</section>

<section class="s" data-id="s5">
<h2>5. 내적(dot product)의 정의 — "왜 배우나"부터</h2>
<div class="say">정의보다 먼저: "내적은 ① <b>두 벡터 사이의 각</b>을 구하고 ② 벡터를 <b>직선에 평행한 성분과 수직한 성분으로 분해</b>하기 위해 배운다. 정의는 언제든 찾아볼 수 있다. 어디에 왜 쓰는지를 기억하는 게 낫다. 공대 전 학과가 배우는데 왜 배우는지 기억 못 하는 학생이 많다."</div>
{fig_dot}
<div class="formula">\\[\\mathbf U\\cdot\\mathbf V=|\\mathbf U||\\mathbf V|\\cos\\theta\\qquad(\\text{{결과는 스칼라}})\\]</div>
<div class="why">두 벡터의 꼬리를 맞대고 사이각을 \\(\\theta\\)라 한다. 결과에 방향이 없다(교수님 질문 "벡터? 스칼라?" → 스칼라). 단위는 두 벡터 단위의 곱 — 둘 다 힘(N)이면 N². 의미는 "두 벡터가 <b>얼마나 같은 방향</b>을 향하는가": 같은 방향 최대(+), 수직이면 <b>0</b>, 반대면 최소(−).</div>
<table><tr><th>관계</th><th>θ</th><th>cos θ</th><th>U·V</th></tr><tr><td>같은 방향</td><td>0°</td><td>1</td><td>\\(+|\\mathbf U||\\mathbf V|\\) (최대)</td></tr><tr><td>수직</td><td>90°</td><td>0</td><td><b>0</b></td></tr><tr><td>반대 방향</td><td>180°</td><td>−1</td><td>\\(-|\\mathbf U||\\mathbf V|\\)</td></tr></table>
<div class="analogy">두 사람이 같은 방향으로 걸으면 "같이 가는 정도"가 최대, 직각으로 갈라지면 같이 가는 몫이 0, 정반대면 음수. 내적은 그 "같이 가는 정도"를 곱셈 하나로 잰다.</div>
<div class="memo"><b>외울 것</b> \\(\\mathbf U\\cdot\\mathbf V=|\\mathbf U||\\mathbf V|\\cos\\theta\\) · 스칼라 · 수직 ⇔ 0 · 쓰임: 사이각 · 평행/수직 분해(9/14 정사영)</div>
<p>"오늘 수업은 여기까지, 다음 주에" — 9/14: 내적의 성질·성분 계산·정사영·외적.</p>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 크기</div><div class="qb">\\(\\mathbf U=3\\mathbf i+4\\mathbf j\\)의 크기 \\(|\\mathbf U|\\)는?</div><ol class="choices"><li data-ok="1">5</li><li>7</li><li>25</li><li>\\(\\sqrt7\\)</li></ol><div class="ans">\\(\\sqrt{{3^2+4^2}}=5\\). 성분을 그냥 더하면(7) 틀린다.</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 위치벡터</div><div class="qb">A(1, 2), B(4, 6)일 때 \\(\\mathbf r_{{AB}}\\)는?</div><ol class="choices"><li data-ok="1">\\(3\\mathbf i+4\\mathbf j\\)</li><li>\\(-3\\mathbf i-4\\mathbf j\\)</li><li>\\(5\\mathbf i+8\\mathbf j\\)</li><li>\\(4\\mathbf i+6\\mathbf j\\)</li></ol><div class="ans">끝점 − 시작점: \\((4-1,\\,6-2)\\). 2번은 \\(\\mathbf r_{{BA}}\\).</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 방향여현 관계식</div><div class="qb">방향여현 사이에 항상 성립하는 식은?</div><ol class="choices"><li data-ok="1">\\(\\cos^2\\theta_x+\\cos^2\\theta_y+\\cos^2\\theta_z=1\\)</li><li>\\(\\cos\\theta_x+\\cos\\theta_y+\\cos\\theta_z=1\\)</li><li>\\(\\cos\\theta_x\\cos\\theta_y\\cos\\theta_z=1\\)</li><li>\\(\\theta_x+\\theta_y+\\theta_z=180^\\circ\\)</li></ol><div class="ans">성분 제곱합 = 크기 제곱에서 나온다. 세 각은 독립이 아니다.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 방향여현 계산</div><div class="qb">\\(\\cos\\theta_x=0.5\\), \\(\\cos\\theta_y=0.6\\)일 때 \\(\\cos\\theta_z\\)는?</div><ol class="choices"><li data-ok="1">\\(\\pm0.62\\)</li><li>\\(-0.1\\)</li><li>\\(\\pm0.9\\)</li><li>0</li></ol><div class="ans">\\(\\cos^2\\theta_z=1-0.25-0.36=0.39\\) → \\(\\pm\\sqrt{{0.39}}=\\pm0.624\\). 2번(\\(1-0.5-0.6\\))은 제곱을 빠뜨린 것.</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 내적의 뜻</div><div class="qb">내적 \\(\\mathbf U\\cdot\\mathbf V=|\\mathbf U||\\mathbf V|\\cos\\theta\\)에 대해 옳은 것은?</div><ol class="choices"><li data-ok="1">두 벡터가 수직이면 0이다</li><li>두 벡터가 평행이면 0이다</li><li>결과는 항상 양수다</li><li>결과는 벡터다</li></ol><div class="ans">\\(\\cos90^\\circ=0\\). 평행(0°)이면 최대, 반대(180°)면 음수. 결과는 스칼라.</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 케이블 힘</div><div class="qb">A(1, 2, 3)에서 B(4, −2, 5)를 향해 100 N. 힘을 성분(\\(\\mathbf i,\\mathbf j,\\mathbf k\\))으로 쓰라.</div><div class="ans">\\(\\mathbf r_{{AB}}=3\\mathbf i-4\\mathbf j+2\\mathbf k\\), \\(|\\mathbf r_{{AB}}|=\\sqrt{{29}}\\approx5.39\\), \\(\\mathbf e_{{AB}}=(0.557,-0.743,0.371)\\) → \\(\\mathbf F\\approx55.7\\mathbf i-74.3\\mathbf j+37.1\\mathbf k\\) N. 검산: \\(\\sqrt{{55.7^2+74.3^2+37.1^2}}\\approx100\\).</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
