# -*- coding: utf-8 -*-
"""미분적분학2 · 2026-09-10 수업 노트 (지각 회차 — 판서 1장(10:19) + 아토 필기 1장 + 9/15 녹음의 '지난번' 언급으로 재구성. 근거: 2026-09-10/정리.md)"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\미분적분학2\_수업노트\2026-09-10.html"

ox, oy = 170, 170
P = p3(ox, oy, 70, 100, 90); Pxy = p3(ox, oy, 70, 100, 0); Px = p3(ox, oy, 70, 0, 0); Py = p3(ox, oy, 0, 100, 0)
fig_axes = canvas(560, 250,
    axes3d(ox, oy, 110),
    line(Px[0], Px[1], Pxy[0], Pxy[1], GRAY, 1.2, "4 3"), line(Py[0], Py[1], Pxy[0], Pxy[1], GRAY, 1.2, "4 3"),
    dot(Pxy[0], Pxy[1], "", 5, BLUE), text(Pxy[0] + 8, Pxy[1] + 16, "P(x₁, y₁, 0)  ① 먼저 찍고", 12, BLUE),
    line(Pxy[0], Pxy[1], P[0], P[1], GRAY, 1.2, "4 3"), arrow(Pxy[0] + 14, Pxy[1] - 6, P[0] + 14, P[1] + 8, GREEN, "② z₁ 만큼 올린다", 1.8, 62, -30),
    dot(P[0], P[1], "", 6, PINK), text(P[0] + 10, P[1] - 6, "P(x₁, y₁, z₁)", 13, PINK, "start", True),
    arrow(ox, oy, Pxy[0], Pxy[1], YEL, "", 2.4), text(200, 226, "r (동경)", 12, "#B26A00", "middle"),
    arc(ox, oy, 30, 0, 22, GRAY, 1.2, "θ", 40),
    text(450, 60, "직교좌표  P(x, y, z)  ✓", 13.5, INK, "middle", True), text(450, 84, "원주좌표  P(r, θ, z)  ✓", 13.5, INK, "middle", True), text(450, 108, "구면좌표  (ρ, θ, φ)  ✗ 뺀다", 13, GRAY, "middle"),
    text(450, 150, "원주좌표 = xy 평면의 극좌표 + 높이 z", 12, GRAY, "middle"), text(450, 170, "x = r cos θ, y = r sin θ, z = z", 12.5, INK, "middle"),
    cap="판서 ①의 그림: 공간의 점은 「z = 0 인 xy 평면에 먼저 찍고, z 만큼 올린다」. 같은 점을 (x, y, z) 로도 (r, θ, z) 로도 쓴다.")

fig_polar = canvas(560, 200,
    axis(60, 150, 260, 150, "x (θ=0)", "") + arrow(160, 150, 160, 30, INK, "", 1.5) + line(60, 150, 260, 150, INK, 1.5),
    text(160, 24, "y (θ=π/2)", 12, INK, "middle"), text(66, 166, "θ=π", 11, GRAY), text(160, 178, "θ=3π/2 (아래)", 11, GRAY, "middle"),
    dot(230, 80, "", 5, PINK), text(238, 72, "P(x, y) = P(r, θ)", 12.5, PINK),
    arrow(160, 150, 228, 82, YEL, "", 2.6), text(186, 108, "r", 13, "#B26A00", "middle", True), arc(160, 150, 32, -45, 0, GRAY, 1.2, "θ", 42),
    line(230, 80, 230, 150, GRAY, 1, "3 3"), line(160, 80, 230, 80, GRAY, 1, "3 3"),
    text(420, 70, "판서 우측 그림 — xy 평면만 떼어 놓은 것", 12.5, INK, "middle"), text(420, 96, "θ 기준각 4개: 0 · π/2 · π · 3π/2", 12.5, INK, "middle"),
    text(420, 130, "「문제는 주로 원주좌표계로 다룬다」", 12.5, RED, "middle", True), text(420, 152, "x² + y² = 1 이 r = 1 이 되는 이유 (9/15)", 11.5, GRAY, "middle"),
    cap="극좌표 복습. 원주좌표의 r 은 높이와 무관하게 xy 평면 안에서만 잰다.")

X1 = lambda x: 60 + x * 28; Y1 = lambda y: 160 - y * 28
fig_cs = canvas(560, 210,
    axis(60, 160, 220, 160, "x", "y") + arrow(60, 160, 60, 40, INK, "", 1.5),
    fplot(lambda x: 1.5 + 1.2 * math.sin(x), 0, 5.4, X1, Y1, color=RED, w=2.6), text(140, 190, "① R² : 곡선 (x, y)", 12.5, INK, "middle", True),
    line(280, 40, 280, 180, GRAY, 1, "3 3"),
    axes3d(360, 150, 70), path("M330 108 C 380 40, 470 50, 500 98 C 470 128, 380 138, 330 108 Z", RED, 2.2, "rgba(224,49,49,.10)"),
    text(430, 190, "★② R³ : 곡면 (x, y, z)", 12.5, INK, "middle", True),
    cap="변수 개수가 도형의 차원을 정한다. 이 과목의 대상은 곡면(판서 ② 앞의 별표는 교수님 분필).")

fig_step = canvas(560, 120,
    fbox(14, 24, 160, 54, "① 바닥에 찍기", BLUE, sub="xy 평면에 (x₁, y₁, 0)", size=13.5), arrow(176, 51, 206, 51, GREEN, "", 2),
    fbox(210, 24, 160, 54, "② 올리기", PINK, sub="z₁ 만큼 수직으로(음수면 아래)", size=13.5), arrow(372, 51, 402, 51, GREEN, "", 2),
    fbox(406, 24, 144, 54, "③ 점선 직사각형", GRAY, sub="투영 관계가 보이게", size=13),
    text(280, 106, "곡면(평면·원기둥·구)도 같은 순서 — 바닥 그림 먼저, 그다음 높이", 12, INK, "middle"),
    cap="3차원 점 찍기 3단계. 9/15 곡면 그리기의 기본 동작.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>미분적분학2 · 9/10 12.1 3차원 좌표계 도입</title></head><body>
<header>
<h1>12.1 3차원 좌표계 — 좌표계 둘, 곡선에서 곡면으로, 점 찍는 법</h1>
<p class="lead">행렬 단원이 끝나고 교재 12장으로. 이날은 수업이 끝난 뒤 도착해(지각) 설명을 듣지 못했고, <b>수업 종료 직후 찍은 판서 1장</b>과 그것을 옮긴 필기, 그리고 9/15 수업에서 교수님이 "지난번에 했다"고 짚은 대목으로 재구성했다. 내용은 짧다: 좌표계 3종 중 <b>직교·원주만</b> 쓴다, R²는 곡선·R³는 <b>곡면</b>, 3차원 점은 <b>xy 평면에 먼저 찍고 z만큼 올린다</b>.</p>
<p class="meta"><span>지각 회차 · 판서 1장(10:19) 재구성</span><span>교재 Stewart 12.1 앞부분</span><span>2주차 · 목 · 12.1은 시험 X</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 3D 공간의 좌표계 3종 — 쓰는 것은 둘</h2>
{fig_axes}
<div class="say">(9/15 녹음) "12장 1절 Three-Dimensional Coordinate Systems 파트 지난번에 했을 겁니다. 직교좌표 xyz가 있고, xy를 동경 r과 편각 θ로 바꾼 <b>(r, θ, z) 원주좌표계</b>로 일반적으로 문제를 다룰 예정. <b>구면좌표계는 조금 차원이 다른 얘기라 뺀다.</b>"</div>
<div class="why">판서에 직교·원주는 ✓, 구면은 ✗ — 이 강의의 좌표계는 두 개다. <b>직교좌표</b> \\(P(x,y,z)\\): 서로 수직인 세 축(오른손 법칙: \\(x\\to y\\)로 감으면 엄지 = \\(z\\)), 좌표평면 3개가 공간을 팔분공간 8개로 나눈다. <b>원주좌표</b> \\(P(r,\\theta,z)\\): \\(xy\\) 평면의 점을 극좌표 \\((r,\\theta)\\)로 쓰고 높이 \\(z\\)는 그대로 — \\(r\\)은 원점에서의 거리(동경), \\(\\theta\\)는 \\(x\\)축에서 잰 각(편각).</div>
<div class="analogy">건물 안의 위치를 "동쪽 몇 m, 북쪽 몇 m, 몇 층"(직교)으로 말할 수도, "입구에서 몇 m, 어느 방향, 몇 층"(원주)으로 말할 수도 있다. 층(z)은 둘 다 같다.</div>
<div class="memo"><b>외울 것</b> 직교 \\((x,y,z)\\) ✓ · 원주 \\((r,\\theta,z)\\) ✓ · 구면 ✗ · 원주 = 극좌표 + \\(z\\)</div>
</section>

<section class="s" data-id="s2">
<h2>2. 원주좌표 = 극좌표 + 높이 z (판서 우측 그림)</h2>
{fig_polar}
<div class="formula">\\[x=r\\cos\\theta,\\quad y=r\\sin\\theta,\\quad z=z\\qquad(r\\ge0,\\ \\theta\\text{{는 }}x\\text{{축에서 반시계}})\\]</div>
<div class="why">판서 우측의 2D 그림은 3D 그림에서 \\(xy\\) 평면만 떼어 놓은 것. 같은 점을 \\((x,y)\\)로도 \\((r,\\theta)\\)로도 쓴다 — 그래서 \\(x^2+y^2=1\\)은 \\(r=1\\)(9/15 원기둥). 축 끝에 \\(\\theta\\)의 기준각 4개(0·π/2·π·3π/2)를 적어 둔 것은 방향 감각을 잃지 말라는 뜻. 판서의 "동경벡터"는 \\(O\\)에서 \\(xy\\) 위 투영점까지의 화살표 — 높이와 무관.</div>
<div class="analogy">시계: 시침이 가리키는 방향(\\(\\theta\\))과 시침 길이(\\(r\\))로 시계판 위 점이 정해진다. 시계를 몇 층에 걸었느냐가 \\(z\\).</div>
<div class="memo"><b>외울 것</b> \\(x=r\\cos\\theta\\), \\(y=r\\sin\\theta\\) · \\(r^2=x^2+y^2\\) · 문제는 주로 원주좌표로</div>
</section>

<section class="s" data-id="s3">
<h2>3. R² 곡선 vs R³ 곡면 ★</h2>
{fig_cs}
<div class="say">(9/15) "지난번에 R²는 곡선, R³에서는 곡선이 아니라 <b>곡면</b>. xy 면적 위에 z 높이가 있으니 부피로 생각. 면적의 의미를 가진 곡선 = 곡면."</div>
<div class="why">변수가 2개(\\(x,y\\))면 평면 위의 곡선, 3개(\\(x,y,z\\))면 공간 속의 <b>면</b>. 같은 식이라도 어느 공간에서 보느냐로 도형이 달라진다 — 9/15 예제 2: \\(x^2+y^2=1\\)이 R²에선 원, R³에선 원기둥면. 판서 ② 앞의 별표는 "이 과목의 대상은 곡면"이라는 강조(시험 표시 아님).</div>
<div class="analogy">지도 위의 등고선(R² 곡선)과 실제 산(R³ 곡면). 같은 정보라도 "높이"라는 변수가 하나 더 붙으면 면이 된다.</div>
<div class="memo"><b>외울 것</b> 변수 2개 → 곡선, 3개 → 곡면 · 식에 없는 변수는 "모든 값"(9/15 예제 1·2의 열쇠)</div>
</section>

<section class="s" data-id="s4">
<h2>4. 3차원에 점 찍는 절차 — 모든 그림의 기본 동작</h2>
{fig_step}
<div class="say">(9/15 06:54) "3차원 공간에 점 찍는 것도 지난번에 보여드렸다 — <b>z = 0으로 둔 xy 평면에 projection해서 점을 찍은 다음 높이 z만큼 올려라.</b>" · (02:46) "12.1은 시험 문제가 안 나오지만 뒤로 가서 그림이 나올 때 3차원 관계를 이해해야 한다."</div>
<div class="formula">\\[P(x_1,y_1,z_1):\\ \\text{{① }}xy\\text{{ 평면에 }}(x_1,y_1,0)\\text{{을 찍는다(점선 직사각형)}}\\ \\to\\ \\text{{② }}z_1\\text{{만큼 수직으로 올린다(음수면 아래로)}}\\]</div>
<div class="why">3차원을 종이(2차원)에 그리는 유일한 방법은 "바닥에 먼저, 그다음 높이". 9/15의 곡면 그리기(평면·원기둥·구)도 전부 이 순서로 — 바닥 그림을 먼저 그리고 \\(z\\)로 올린다. 그래서 12.1이 시험에 안 나와도 그림 문제의 채점(9/15 "그림 + 기하학적 의미")은 이 습관에 달렸다.</div>
<div class="analogy">주차장에서 차 위치 말하기: "B구역 12번 자리(바닥) 3층(높이)". 바닥 자리를 먼저 정하지 않으면 층수는 의미가 없다.</div>
<div class="memo"><b>외울 것</b> 점 찍기 = 투영 → 올리기 · 연습: \\(P(2,-1,7)\\) 같은 점 3개 직접 찍어 보기 → 9/15 예제로</div>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 좌표계</div><div class="qb">이 강의에서 실제로 쓰는 3차원 좌표계는?</div><ol class="choices"><li data-ok="1">직교좌표 \\((x,y,z)\\)와 원주좌표 \\((r,\\theta,z)\\)</li><li>직교좌표와 구면좌표</li><li>원주좌표와 구면좌표</li><li>구면좌표만</li></ol><div class="ans">판서 ✓✓✗. 구면좌표는 "차원이 다른 얘기"라 뺐다.</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 원주좌표</div><div class="qb">원주좌표 \\(P(r,\\theta,z)\\)에서 \\(r\\)과 \\(\\theta\\)는?</div><ol class="choices"><li data-ok="1">\\(xy\\) 평면 위 투영점의 극좌표 — 원점에서의 거리와 \\(x\\)축에서 잰 각</li><li>원점에서 \\(P\\)까지의 3차원 거리와 \\(z\\)축에서 잰 각</li><li>\\(z\\)축 위의 위치와 회전 횟수</li><li>\\(x\\)좌표와 \\(y\\)좌표</li></ol><div class="ans">높이 \\(z\\)와 무관하게 바닥에서만 잰다(동경·편각). 2번은 구면좌표 쪽.</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 곡선과 곡면</div><div class="qb">\\(x^2+y^2=1\\)을 R³에서 보면?</div><ol class="choices"><li data-ok="1">\\(z\\) 방향으로 끝없이 뻗은 원기둥면</li><li>반지름 1인 원(평면 도형)</li><li>반지름 1인 구면</li><li>원판</li></ol><div class="ans">식에 \\(z\\)가 없다 = 모든 \\(z\\). R²에서는 원, R³에서는 원기둥면.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 점 찍기</div><div class="qb">3차원에 \\(P(x_1,y_1,z_1)\\)을 찍는 순서는?</div><ol class="choices"><li data-ok="1">\\(xy\\) 평면에 \\((x_1,y_1,0)\\)을 먼저 찍고 \\(z_1\\)만큼 올린다</li><li>\\(z\\)축에 \\(z_1\\)을 먼저 찍고 \\(x_1,y_1\\)만큼 옮긴다</li><li>원점에서 직선으로 한 번에 긋는다</li><li>순서는 상관없다</li></ol><div class="ans">"z = 0 기준으로 xy 평면에 projection 후 올려라" — 모든 3D 그림의 기본 동작.</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 변수와 차원</div><div class="qb">R³에서 변수 세 개(\\(x,y,z\\))를 가진 식이 나타내는 도형은 일반적으로?</div><ol class="choices"><li data-ok="1">곡면</li><li>곡선</li><li>점</li><li>부피(입체)</li></ol><div class="ans">"R³에서는 곡선이 아니라 곡면" — 이 과목의 대상.</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 변환</div><div class="qb">원주좌표 \\((r,\\theta,z)\\)를 직교좌표로 바꾸는 식을 쓰라.</div><div class="ans">\\(x=r\\cos\\theta\\), \\(y=r\\sin\\theta\\), \\(z=z\\). 거꾸로 \\(r^2=x^2+y^2\\), \\(\\tan\\theta=y/x\\).</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
