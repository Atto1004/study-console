# -*- coding: utf-8 -*-
"""미분적분학2 · 2026-09-15 수업 노트 (근거: 2026-09-15/정리.md — 녹음 67분·판서 5장, 전부 대조)"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\미분적분학2\_수업노트\2026-09-15.html"

def ellipse(cx, cy, rx, ry, color=INK, w=2, fill="none", dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{color}" stroke-width="{w}"{d}/>'

def panel(ox, title, body, sub):
    return axes3d(ox + 70, 150, 60) + body + text(ox + 85, 30, title, 12.5, INK, "middle", True) + text(ox + 85, 210, sub, 11, GRAY, "middle")
fig_surf = canvas(560, 222,
    panel(10, "Ex01  z = 3", path(f"M{10+70-40} {150-45+20} L{10+70+60} {150-45+20} L{10+70+80} {150-45} L{10+70-20} {150-45} Z", BLUE, 2, "rgba(25,113,194,.15)") + text(10 + 125, 150 - 52, "z = 3", 11, BLUE), "xy 평면 전체를 z=3 으로 올린 수평 평면"),
    panel(195, "Ex02 (b)  x²+y² = 1", ellipse(195 + 70, 150, 28, 10, YEL, 2) + ellipse(195 + 70, 150 - 70, 28, 10, BLUE, 2) + line(195 + 42, 150, 195 + 42, 80, BLUE, 2) + line(195 + 98, 150, 195 + 98, 80, BLUE, 2), "노란 원(z=0)을 위로 뽑은 속 빈 원기둥면"),
    panel(380, "Ex02 (c)  x²+y² ≤ 1, 2 ≤ z ≤ 4", ellipse(380 + 70, 150, 28, 10, YEL, 2, "rgba(245,159,0,.25)") + path(f"M{380+42} {150-30} L{380+42} {150-70} A 28 10 0 0 0 {380+98} {150-70} L{380+98} {150-30} A 28 10 0 0 1 {380+42} {150-30} Z", BLUE, 2, "rgba(25,113,194,.18)") + ellipse(380 + 70, 150 - 70, 28, 10, BLUE, 2, "rgba(25,113,194,.25)"), "원판을 z=2~4 로 올린 속 찬 원기둥 조각"),
    cap="R³ 곡면 그리기 규칙 — 「z = 0 기준으로 xy 평면에 먼저 그리고 z 만큼 올려라」. 식에 없는 변수 = 모든 값.")

fig_dist = canvas(560, 200,
    axes3d(150, 160, 90),
    dot(*p3(150, 160, 60, 40, 110), "", 5, PINK), text(p3(150, 160, 60, 40, 110)[0] + 8, p3(150, 160, 60, 40, 110)[1] - 6, "P(2, −1, 7)", 12, PINK),
    dot(*p3(150, 160, 30, 90, 70), "", 5, PINK), text(p3(150, 160, 30, 90, 70)[0] + 8, p3(150, 160, 30, 90, 70)[1] + 14, "Q(1, −3, 5)", 12, PINK),
    line(*p3(150, 160, 60, 40, 110), *p3(150, 160, 30, 90, 70), GREEN, 2.4), text(230, 96, "|PQ| = 3", 13, GREEN, "middle", True),
    text(420, 50, "|PQ| = √((x₂−x₁)² + (y₂−y₁)² + (z₂−z₁)²)", 12.5, INK, "middle", True),
    text(420, 80, "= √((1−2)² + (−3+1)² + (5−7)²)", 12.5, INK, "middle"), text(420, 104, "= √(1 + 4 + 4) = √9 = 3", 12.5, INK, "middle"),
    text(420, 140, "「√9 쓰면 안 돼요. 감점이에요. 3.」", 12.5, RED, "middle", True), text(420, 164, "R² 거리 공식에 z 항 하나 추가", 11.5, GRAY, "middle"),
    cap="두 점 사이의 거리(Ex03). 순서 무관, 근호는 반드시 정리.")

fig_sph = canvas(560, 220,
    circle(130, 110, 62, INK, w=2.2), ellipse(130, 110, 62, 16, GRAY, 1.2, "none", "4 3"), dot(130, 110, "", 5, RED), text(130, 104, "C(−2, 3, −1)", 11.5, RED, "middle"),
    line(130, 110, 192, 110, GREEN, 2), text(162, 128, "r = 2√2", 12, GREEN, "middle", True), text(130, 196, "Ex04  (x+2)² + (y−3)² + (z+1)² = 8", 12, INK, "middle"),
    circle(400, 110, 70, INK, w=2), circle(400, 110, 35, INK, w=2), path("M330 110 A 70 70 0 0 0 470 110 L 435 110 A 35 35 0 0 1 365 110 Z", BLUE, 1, "rgba(25,113,194,.22)"),
    line(320, 110, 480, 110, GRAY, 1.2, "4 3"), text(400, 200, "추가 예제  1 ≤ x²+y²+z² ≤ 4, z ≤ 0", 12, INK, "middle"), text(400, 40, "구 껍질 사이, 아래 반쪽 — 「달걀 반쪽의 흰자」", 11.5, GRAY, "middle"),
    cap="구면의 방정식 (x−h)² + (y−k)² + (z−l)² = r². 「값만 구하면 중고등학교. 대학은 이게 뭐냐를 그림으로.」")

fig_vec = canvas(560, 150,
    dot(40, 110, "", 5, INK), text(36, 130, "A 시작점 (initial)", 12, INK), dot(200, 40, "", 5, INK), text(196, 30, "B 끝점 (terminal)", 12, INK),
    arrow(46, 107, 194, 44, BLUE, "", 3), text(130, 90, "AB⃗ = v⃗", 15, BLUE, "middle", True),
    arrow(300, 110, 448, 47, BLUE, "", 2.4), arrow(330, 130, 478, 67, BLUE, "", 2.4), text(420, 120, "= u⃗ = w⃗ (크기·방향 같으면 같은 벡터)", 11.5, GRAY),
    text(470, 26, "스칼라 = 크기만 · 벡터 = 크기 + 방향", 12.5, INK, "middle", True),
    cap="12.2 벡터의 기하학적 표현. 손으로는 위에 화살표 필수(볼드체는 컴퓨터용). 순서를 바꾸면 안 된다.")

fig_pos = canvas(560, 190,
    axis(40, 150, 220, 150, "x", "y") + arrow(40, 150, 40, 30, INK, "", 1.5),
    dot(170, 60, "", 5, PINK), text(178, 56, "P(a₁, a₂)", 12, PINK), arrow(40, 150, 166, 63, GREEN, "", 2.8), text(90, 100, "a⃗ = OP⃗ = ⟨a₁, a₂⟩", 12.5, GREEN, "middle", True),
    axes3d(360, 150, 80), dot(*p3(360, 150, 50, 90, 80), "", 5, PINK), text(p3(360, 150, 50, 90, 80)[0] + 8, p3(360, 150, 50, 90, 80)[1] - 4, "Q(a₁, a₂, a₃)", 12, PINK),
    arrow(360, 150, *p3(360, 150, 50, 90, 80), GREEN, "", 2.8), line(*p3(360, 150, 50, 90, 0), *p3(360, 150, 50, 90, 80), GRAY, 1, "4 3"), dot(*p3(360, 150, 50, 90, 0), "", 3, GRAY),
    text(470, 178, "a⃗ = OQ⃗ = ⟨a₁, a₂, a₃⟩", 12.5, GREEN, "middle", True),
    cap="성분(component) = 원점에서 출발해 점 P 를 가리키는 벡터의 좌표 = 위치벡터(position vector).")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>미분적분학2 · 9/15 곡면 그리기 · 거리 · 구면 · 벡터 도입</title></head><body>
<header>
<h1>3차원을 그리는 법 — 곡면·거리·구면, 그리고 벡터의 시작</h1>
<p class="lead">앞 45분은 12.1의 나머지: <b>곡면 그리기 규칙</b>(예제 1·2), 두 점 사이 <b>거리</b>, <b>구면의 방정식</b>(예제 4). 교수님이 반복한 말은 둘 — "근호는 정리하라(√9 쓰면 감점)", "값만 구하면 안 된다, <b>그림과 기하학적 의미</b>까지가 답이고 채점 기준은 내 기준". 뒤 15분에 12.2 벡터의 기하적 표현과 성분·위치벡터. "벡터부터 <b>중간고사 관련 내용</b>이 하나씩 들어간다."</p>
<p class="meta"><span>녹음 67분</span><span>판서 5장 대조 완료</span><span>교재 12.1~12.2</span><span>3주차 · 화</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. R³ 곡면 그리기 — "xy 평면에 먼저 그리고 z만큼 올려라" ★</h2>
{fig_surf}
<div class="say">"모든 그림은 다 이래요. R³는 무조건 z=0일 때 기준을 두면서 xy 평면에서의 그림을 먼저 그린 다음에 z값 높이를 올려라." · 예제 1 \\(z=3\\): "x, y가 없는데 문제 잘못된 거 아니냐고 질문하는 게 정상. <b>없다 = 모든 영역</b>."</div>
<div class="why">식에 <b>없는</b> 변수는 제약이 없다(모든 값), <b>있는</b> 변수는 그만큼 제한된다. 예제 2 (a) \\(x^2+y^2=1,\\ z=3\\): 원둘레(내부 아님)를 높이 3에 올린 원. (b) \\(x^2+y^2=1\\): \\(z\\)가 없으니 원을 끝없이 올린 <b>속 빈 원기둥면</b>. (c) \\(x^2+y^2\\le1,\\ 2\\le z\\le4\\): \\(\\le\\)는 원 + 내부(원판), 그것을 2~4로 올린 <b>속 찬 원기둥 조각</b>. \\(z\\)가 음수면 아래로.</div>
<table><tr><th>식</th><th>바닥(xy) 그림</th><th>z</th><th>도형</th></tr>
<tr><td>\\(z=3\\)</td><td>평면 전체(제약 없음)</td><td>3</td><td>높이 3의 수평 평면</td></tr>
<tr><td>\\(x^2+y^2=1,\\ z=3\\)</td><td>원둘레</td><td>3</td><td>높이 3에 뜬 원</td></tr>
<tr><td>\\(x^2+y^2=1\\)</td><td>원둘레</td><td>모든 값</td><td>속 빈 원기둥면</td></tr>
<tr><td>\\(x^2+y^2\\le1,\\ 2\\le z\\le4\\)</td><td>원판(내부 포함)</td><td>2~4</td><td>속 찬 원기둥 조각</td></tr></table>
<div class="analogy">쿠키 틀: 반죽 위에 틀(xy 평면의 그림)을 먼저 찍고, 그 모양대로 위로 뽑아 올리는 높이가 \\(z\\)의 범위. 높이 제한이 없으면 한없이 긴 기둥.</div>
<div class="memo"><b>외울 것</b> 없는 변수 = 모든 값 · \\(=\\)은 둘레, \\(\\le\\)는 내부 포함 · 12.1은 시험 X, 그림의 바탕</div>
</section>

<section class="s" data-id="s2">
<h2>2. 두 점 사이의 거리 — z 항 하나 추가</h2>
{fig_dist}
<div class="formula">\\[R^2:\\ |AB|=\\sqrt{{(x_2-x_1)^2+(y_2-y_1)^2}}\\qquad R^3:\\ |PQ|=\\sqrt{{(x_2-x_1)^2+(y_2-y_1)^2+(z_2-z_1)^2}}\\]</div>
<div class="why">피타고라스(직각삼각형 빗변)를 한 번 더 쓴 것. 순서 무관(제곱하니까). 대학에서는 절댓값 기호 없이 \\(AB\\)로도 쓴다. 그림 해석: P는 \\(xy\\)에 \\((2,-1)\\) 찍고 \\(z=7\\) 올림, Q는 \\((1,-3)\\)에 \\(z=5\\) — "결과가 중요한 게 아니라 <b>기하학적 의미로 해석</b>할 수 있어야."</div>
<div class="say">(26:34) "√9 쓰면 안 돼요. 그러면 감점이에요. 3."</div>
<div class="analogy">방 안 두 지점의 직선거리: 바닥에서의 거리에 층 높이 차이를 한 번 더 피타고라스.</div>
<div class="memo"><b>외울 것</b> 거리 = 성분 차의 제곱합의 제곱근 · 근호 정리(√9 → 3) · Ex03 = 3</div>
</section>

<section class="s" data-id="s3">
<h2>3. 구면의 방정식 — 완전제곱으로 중심·반지름, 그리고 그림 ★</h2>
{fig_sph}
<div class="formula">\\[(x-h)^2+(y-k)^2+(z-l)^2=r^2\\quad(\\text{{중심 }}C(h,k,l),\\ \\text{{반지름 }}r)\\qquad \\text{{Ex04: }}(x+2)^2+(y-3)^2+(z+1)^2=8\\ \\Rightarrow\\ C(-2,3,-1),\\ r=2\\sqrt2\\]</div>
<div class="why">\\(x^2+y^2+z^2+4x-6y+2z+6=0\\): 미지수 3개, 최고차 2차 → 구면. \\(x\\)끼리·\\(y\\)끼리·\\(z\\)끼리 묶고 <b>1차 계수 절반의 제곱</b>을 더하고 빼면 \\(-6+4+9+1=8\\). \\(r=\\sqrt8=2\\sqrt2\\) — "√8 쓰면 감점, 4×2니까 2√2". \\(x^2+y^2+z^2\\)이 보이면 구면을 암시.</div>
<details class="ex" open><summary>완전제곱 절차(예제 4) — sol. i) 묶기 ii) 더하고 빼기 iii) 중심·반지름 iv) 그림</summary><div class="body"><p>i) \\((x^2+4x)+(y^2-6y)+(z^2+2z)=-6\\) ii) 양변에 \\(+4,+9,+1\\): \\((x+2)^2+(y-3)^2+(z+1)^2=8\\) iii) 완전제곱 안이 0이 되는 값이 중심 \\(C(-2,3,-1)\\), \\(r^2=8\\to r=2\\sqrt2\\) iv) 바닥에 \\((-2,3)\\)을 찍고 \\(z=-1\\)로 내린 점을 중심으로 반지름 \\(2.83\\)의 공 — "중심이 \\(C\\)이고 반지름이 \\(2\\sqrt2\\)인 구면"이라고 문장으로 쓴다.</p></div></details>
<div class="say">"값만 구하면 중고등학교. 대학은 이게 뭐냐를 알려줘야 돼." · 교재 비판: "교재는 답만 적었다. <b>채점 기준은 제가 가르친 기준.</b> 교재만 보면 점수 낮게 나온다." → 답안에 <b>그림 + 기하학적 의미 문장</b>.</div>
<details class="ex"><summary>추가 예제 \\(1\\le x^2+y^2+z^2\\le4,\\ z\\le0\\)</summary><div class="body"><p>중심 \\((0,0,0)\\)(3차원에선 극점이라고도), 반지름 1 이상 2 이하 → 큰 공(축구공) 안에 작은 공(핸드볼공)이 든 <b>구 껍질 사이 영역</b>. \\(z\\le0\\) → \\(z=0\\)에서 잘라 <b>아래 반쪽</b>. "달걀을 반으로 잘라 노른자를 빼낸 흰자" 모양. 특수한 꼴만 손으로 그리고 나머지는 컴퓨터가 그린다.</p></div></details>
<div class="analogy">중심을 찍는 법은 점 찍기와 같다 — \\(x=-2,\\ y=3\\)을 바닥에 찍고 \\(z=-1\\)만큼 내려간 점, 거기서 반지름 \\(2\\sqrt2\\approx2.83\\)의 공.</div>
<div class="memo"><b>외울 것</b> 완전제곱 → 중심·반지름 · 근호 정리 · <b>그림 + "중심 C, 반지름 r인 구면"</b> 문장까지 · 부등식 = 영역</div>
</section>

<section class="s" data-id="s4">
<h2>4. 12.2 벡터 — 크기 + 방향, 시작점과 끝점</h2>
{fig_vec}
<div class="say">"기하벡터 안 배웠어도, 문과여도 상관없음. <b>복습한 사람만 따라온다.</b> 공식 암기가 아니라 왜 나오는지 이해." · "벡터부터 중간고사 관련 내용이 하나씩 들어간다."</div>
<div class="why">스칼라는 크기만, <b>벡터는 크기와 방향</b>(2차원이든 3차원이든 둘 다). 점 A에서 B로: <b>시작점 A, 끝점 B</b>, 표기 \\(\\overrightarrow{{AB}}\\) — 손으로는 위에 화살표가 전 세계 약속(교재의 볼드체는 컴퓨터용). 소문자 \\(\\vec v,\\vec u,\\vec w\\) 아무거나. 교수님은 화살표를 글자에 이어 흘려 쓴다 — 판서에서 그 모양이면 벡터.</div>
<div class="analogy">"동쪽으로 3 km"는 벡터, "3 km"는 스칼라. 출발점을 바꿔도 같은 방향·같은 길이면 같은 이동 — 그래서 위치가 달라도 같은 벡터.</div>
<div class="memo"><b>외울 것</b> 벡터 = 크기 + 방향 · \\(\\overrightarrow{{AB}}\\): A 시작, B 끝, 순서 금지 · 화살표 필수</div>
</section>

<section class="s" data-id="s5">
<h2>5. 성분과 위치벡터 — 성분은 곧 점의 좌표</h2>
{fig_pos}
<div class="formula">\\[R^2:\\ \\vec a=\\langle a_1,a_2\\rangle=\\overrightarrow{{OP}},\\ P(a_1,a_2)\\qquad R^3:\\ \\vec a=\\langle a_1,a_2,a_3\\rangle=\\overrightarrow{{OQ}},\\ Q(a_1,a_2,a_3)\\]</div>
<div class="why">성분(component = element = 원소)은 <b>원점을 시작점</b>으로 놓았을 때 끝점의 좌표. 그런 벡터를 <b>위치벡터</b>라 한다. R³도 같은 절차 — \\(xy\\)에 \\((a_1,a_2)\\) 찍고 \\(z\\)를 \\(a_3\\)만큼 올린 점 Q. "그림을 잘 그리면 벡터가 쉬워진다. 벡터로 바꾸면 계산이 빨라진다(수능 문제도)."</div>
<div class="analogy">GPS 좌표 자체가 "원점(기준점)에서 여기까지"라는 벡터. 좌표 = 성분.</div>
<div class="memo"><b>외울 것</b> 성분 \\(\\langle a_1,a_2,a_3\\rangle\\) = 원점 기준 좌표 = 위치벡터 · 다음(9/17): 두 점 벡터·크기·표준기저·단위벡터</div>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 곡면</div><div class="qb">R³에서 \\(z=3\\)은 어떤 도형인가?</div><ol class="choices"><li data-ok="1">높이 3에 있는 수평 평면(\\(xy\\) 평면 전체를 올린 것)</li><li>\\(z\\)축 위의 점 하나</li><li>\\(z=3\\)인 직선</li><li>반지름 3인 구면</li></ol><div class="ans">\\(x,y\\)가 없다 = 모든 영역. 문제가 잘못된 게 아니다.</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 부등식 영역</div><div class="qb">\\(x^2+y^2\\le1,\\ 2\\le z\\le4\\)는?</div><ol class="choices"><li data-ok="1">원판을 \\(z=2\\)에서 4까지 올린 속이 찬 원기둥 조각</li><li>속 빈 원기둥면</li><li>높이 3에 있는 원</li><li>반지름 1인 구</li></ol><div class="ans">\\(\\le\\)는 원 + 내부, \\(z\\) 범위가 있으니 조각.</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 거리</div><div class="qb">\\(P(2,-1,7)\\), \\(Q(1,-3,5)\\)의 거리는?</div><ol class="choices"><li data-ok="1">3</li><li>\\(\\sqrt9\\)</li><li>\\(\\sqrt{{13}}\\)</li><li>9</li></ol><div class="ans">\\(\\sqrt{{1+4+4}}=3\\). "√9 쓰면 감점" — 정리해서 3.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 구면</div><div class="qb">\\(x^2+y^2+z^2+4x-6y+2z+6=0\\)의 중심과 반지름은?</div><ol class="choices"><li data-ok="1">\\(C(-2,3,-1)\\), \\(r=2\\sqrt2\\)</li><li>\\(C(2,-3,1)\\), \\(r=\\sqrt8\\)</li><li>\\(C(-2,3,-1)\\), \\(r=8\\)</li><li>\\(C(4,-6,2)\\), \\(r=\\sqrt6\\)</li></ol><div class="ans">완전제곱: \\((x+2)^2+(y-3)^2+(z+1)^2=8\\). \\(\\sqrt8=2\\sqrt2\\)로 정리. 답안에는 그림과 "중심 C, 반지름 r인 구면" 문장까지.</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 벡터</div><div class="qb">벡터 \\(\\overrightarrow{{AB}}\\)에 대한 설명으로 옳은 것은?</div><ol class="choices"><li data-ok="1">A가 시작점, B가 끝점이며 크기와 방향을 가진다</li><li>B가 시작점, A가 끝점이다</li><li>크기만 있고 방향은 없다</li><li>\\(\\overrightarrow{{AB}}=\\overrightarrow{{BA}}\\)</li></ol><div class="ans">순서를 바꾸면 방향이 반대. 손으로는 화살표 필수.</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 영역 설명</div><div class="qb">\\(1\\le x^2+y^2+z^2\\le4,\\ z\\le0\\)이 나타내는 영역을 말로 설명하라.</div><div class="ans">중심 원점, 반지름 1과 2인 두 구면 사이의 껍질 영역 중 \\(z\\le0\\)인 아래 반쪽 — "달걀을 반으로 잘라 노른자를 빼낸 흰자" 모양. 답에는 그림과 이 문장을 같이.</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
