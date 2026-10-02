# -*- coding: utf-8 -*-
"""정역학 · 2026-09-21 수업 노트 (아토 녹음 없음 — 교수필기_한글_4주차_W4-1 11p 순서가 뼈대 + 영상정리_4주차_W4-1 54분 + 수업요약으로 재구성)"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\정역학\_수업노트\2026-09-21.html"

def rmark(x, y, sx, sy, n=9, color=GRAY):
    """직각 표시: 꼭짓점 (x,y), 두 변 방향 부호 (sx, sy)"""
    return path(f"M{x + sx * n} {y} L{x + sx * n} {y + sy * n} L{x} {y + sy * n}", color, 1.3)

def outdot(x, y, color=GREEN):
    """지면 밖으로 나오는 벡터 기호(원 + 점)"""
    return circle(x, y, 9, color, w=2) + f'<circle cx="{x}" cy="{y}" r="3" fill="{color}"/>'

# 1) 두 블록 — 하나씩 떼어 보기
fig_blocks = canvas(560, 260,
    step(1, line(50, 24, 170, 24, INK, 3), line(110, 24, 110, 64, INK, 2), block(80, 64, 60, 40, "W", INK),
        line(110, 104, 110, 144, RED, 3), block(80, 144, 60, 40, "W", INK),
        text(120, 40, "D", 12, GRAY), text(120, 60, "C", 12, GRAY), text(120, 120, "B", 12, RED), text(120, 140, "A", 12, RED),
        text(110, 220, "① 매달린 두 블록 (정지)", 12, INK, "middle")),
    step(2, block(240, 120, 60, 40, "아래", INK),
        arrow(270, 120, 270, 72, RED, "T_AB", 2.6, 26, 0), arrow(270, 160, 270, 208, INK, "W", 2.6, 16, 0),
        text(270, 240, "② T_AB = W", 13, GREEN, "middle", True)),
    step(3, block(420, 110, 60, 40, "위", INK),
        arrow(450, 110, 450, 62, GREEN, "T_CD", 2.6, 28, 0),
        arrow(436, 150, 436, 198, INK, "W", 2.4, -14, 0), arrow(464, 150, 464, 198, RED, "T_AB", 2.4, 28, 0),
        text(450, 240, "③ T_CD = W + T_AB = 2W", 13, GREEN, "middle", True)),
    cap="두 블록 예제(교수 필기 p.3). 아래 블록부터 떼면 \\(T_{AB}=W\\), 위 블록은 아래 줄이 <b>아래로</b> 당기는 \\(T_{AB}\\)까지 받아 \\(T_{CD}=2W\\). 필기본에서 가운데 줄 B–A 는 빨간색.", name="blocks")

# 2) 통째 FBD
fig_whole = canvas(560, 240,
    step(1, line(50, 24, 190, 24, INK, 3), line(120, 24, 120, 64, INK, 2), block(90, 64, 60, 40, "W", INK),
        line(120, 104, 120, 144, RED, 3), block(90, 144, 60, 40, "W", INK),
        rect(76, 54, 88, 140, PINK, dash="6 5", fill="none", sw=1.8), text(172, 120, "계 = 두 블록", 12, PINK)),
    step(2, rect(296, 56, 88, 140, PINK, dash="6 5", fill="none", sw=1.8), block(310, 66, 60, 40, "W", INK), line(340, 106, 340, 146, GRAY, 1.6, "4 3"), block(310, 146, 60, 40, "W", INK),
        arrow(340, 56, 340, 14, RED, "T_CD", 2.8, 30, 4), arrow(322, 196, 322, 234, INK, "W", 2.4, -14, 0), arrow(358, 196, 358, 234, INK, "W", 2.4, 14, 0)),
    step(3, text(470, 96, "ΣF_y = T_CD − 2W = 0", 13, INK, "middle", True), text(470, 122, "T_CD = 2W", 14, GREEN, "middle", True),
        text(470, 160, "가운데 줄 T_AB = 내력", 12, RED, "middle"), text(470, 180, "→ 통째 FBD에 안 그린다", 12, RED, "middle")),
    cap="두 블록을 점선으로 묶어 한 물체로 본 자유물체도(필기 p.4, \\(T_{CD}\\)는 빨간 화살표). 가운데 줄이 위·아래 블록에 주는 힘은 크기가 같고 방향이 반대라 서로 지워진다.", name="whole")

# 3) M_P = DF · 부호 · D = 0
fig_df = canvas(560, 240,
    step(1, dot(120, 190, "", 5, INK), text(128, 214, "P", 14, INK, "start", True),
        arrow(300, 180, 300, 96, GREEN, "F", 3, 16, 0)),
    step(2, line(300, 22, 300, 96, BLUE, 1.6, "6 5"), line(300, 180, 300, 226, BLUE, 1.6, "6 5"), text(308, 36, "작용선", 12, BLUE),
        line(120, 190, 300, 190, RED, 2.6), rmark(300, 190, -1, -1), text(210, 212, "D (수직거리)", 13, RED, "middle", True)),
    step(3, text(440, 100, "M_P = D F", 16, INK, "middle", True), text(440, 126, "단위 N·m (힘 × 길이)", 12, GRAY, "middle")),
    step(4, arc(120, 190, 32, -15, -165, GREEN, 2), text(120, 146, "반시계 = +", 12, GREEN, "middle", True), text(440, 162, "시계 방향이면 −", 12, GRAY, "middle")),
    step(5, line(70, 240, 150, 160, PINK, 1.4, "5 4"), arrow(150, 160, 196, 114, PINK, "", 2.6), text(204, 108, "D = 0", 12, PINK),
        text(440, 196, "작용선이 P를 지나면 M = 0", 12, PINK, "middle", True)),
    cap="2차원 모멘트(필기 p.5~6): 점 P 에서 힘의 <b>작용선</b>까지 수직거리 \\(D\\) 에 힘의 크기 \\(F\\) 를 곱한다. 그림의 F 는 P 를 반시계로 돌리므로 +.", name="df")

# 4) 성분별 모멘트 (연습: F = 3i + 4j N at A(2,1) m, P = 원점)
O = (90, 196); S = 50
A = (O[0] + 2 * S, O[1] - 1 * S)
fig_sum = canvas(560, 240,
    step(1, axis(O[0], O[1], 330, 30, "x (m)", "y (m)"), dot(O[0], O[1], "", 5, INK), text(O[0] - 8, O[1] + 18, "P (원점)", 12, INK, "middle"),
        dot(A[0], A[1], "", 4, INK), text(A[0] - 8, A[1] + 18, "A(2, 1)", 12, INK, "end"),
        arrow(A[0], A[1], A[0] + 45, A[1] - 60, GREEN, "F = 3i + 4j", 3, 58, 0)),
    step(2, arrow(A[0], A[1], A[0] + 45, A[1], BLUE, "F_x", 2.4, 6, 20), text(370, 96, "M(F_x) = −(1)(3) = −3  시계", 12.5, BLUE)),
    step(3, arrow(A[0], A[1], A[0], A[1] - 60, RED, "F_y", 2.4, -18, 0), text(370, 124, "M(F_y) = (2)(4) = +8  반시계", 12.5, RED)),
    step(4, text(370, 160, "ΣM_P = −3 + 8 = +5 N·m", 14, INK, "start", True), text(370, 184, "검산 DF : D = 1 m, F = 5 N", 12, GRAY)),
    cap="성분으로 쪼개 따로 구해 더하기(필기 p.8, \\(M_P(\\mathbf F)=M_P(F_x)+M_P(F_y)\\)). 숫자는 아톰 연습 문제 — \\(F_x\\) 는 P 를 시계로, \\(F_y\\) 는 반시계로 돌린다.", name="sum")

# 5) r × F — θ · D = r sinθ · 방향
P5 = (110, 200); A5 = (270, 80)
fig_rxf = canvas(560, 250,
    step(1, line(40, 80, 530, 80, BLUE, 1.6, "6 5"), text(530, 70, "작용선", 12, BLUE, "end"),
        dot(P5[0], P5[1], "", 5, INK), text(102, 222, "P", 14, INK, "end", True),
        arrow(P5[0], P5[1], A5[0], A5[1], RED, "r", 2.8, 14, 14), dot(A5[0], A5[1], "", 4, INK),
        arrow(A5[0], A5[1], 370, 80, GREEN, "F", 3, 20, -10)),
    step(2, line(A5[0], A5[1], 350, 20, RED, 1.4, "5 4"), arc(A5[0], A5[1], 34, -37, 0, INK, 1.6), text(318, 70, "θ", 14, INK, "middle", True),
        text(360, 30, "꼬리끼리 붙인 각", 12, GRAY)),
    step(3, line(P5[0], P5[1], P5[0], 80, INK, 1.6, "4 3"), rmark(P5[0], 80, 1, 1), text(100, 140, "D", 14, INK, "end", True),
        text(370, 140, "|M_P| = rF sinθ = DF", 14, INK, "start", True), text(370, 164, "D = r sinθ", 13, GRAY)),
    step(4, outdot(P5[0] + 40, P5[1] + 10), text(160, 236, "M_P : r·F 둘 다에 수직 (지면 밖)", 12, GREEN, "start"),
        text(370, 200, "오른손 : r → F 로 감으면", 12, GREEN), text(370, 220, "엄지 = M_P 방향", 12, GREEN)),
    cap="모멘트 벡터 \\(\\mathbf M_P=\\mathbf r\\times\\mathbf F\\)(필기 p.8~10). \\(\\mathbf r\\) 은 P 에서 작용선 위의 점까지. 크기는 \\(rF\\sin\\theta\\), 그런데 \\(r\\sin\\theta\\) 가 곧 수직거리 \\(D\\) 라서 \\(DF\\) 와 같다.", name="rxf")

# 6) r 선택 무관
P6 = (90, 196)
fig_anyr = canvas(560, 230,
    step(1, line(40, 70, 530, 70, BLUE, 1.6, "6 5"), dot(P6[0], P6[1], "", 5, INK), text(82, 216, "P", 14, INK, "end", True),
        arrow(P6[0], P6[1], 200, 70, RED, "r", 2.6, -14, 4), dot(200, 70, "", 4, INK),
        arrow(420, 70, 510, 70, GREEN, "F", 3, 0, -10)),
    step(2, arrow(P6[0], P6[1], 330, 70, RED, "", 2.2, dash="7 4"), text(300, 112, "r′", 14, RED, "start", True), dot(330, 70, "", 4, INK),
        arrow(200, 70, 326, 70, PINK, "u", 2.6, 0, -10)),
    step(3, text(320, 150, "r′ × F = (r + u) × F", 13, INK, "start", True), text(320, 174, "= r × F + u × F", 13, INK),
        text(320, 200, "u ∥ F → u × F = 0", 13, PINK, "start", True), text(320, 222, "→ 같은 모멘트", 13, GREEN, "start", True)),
    cap="필기 p.11 「Same moment」: 작용선 위 다른 점으로 가는 \\(\\mathbf r'=\\mathbf r+\\mathbf u\\). \\(\\mathbf u\\) 는 작용선을 따라가므로 \\(\\mathbf F\\) 와 평행하고, 평행한 두 벡터의 외적은 0.", name="anyr")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>정역학 · 9/21 평형 마무리 · Ch.4 점에 대한 모멘트 — M = DF · r × F</title></head><body>
<header>
<h1>"FBD는 외력만" — 두 블록으로 평형을 마무리하고, 모멘트를 시작한다</h1>
<p class="lead">Ch.3 평형의 마무리. 좌표축 잡는 법, <b>매달린 두 블록</b>을 하나씩 떼어 볼 때와 통째로 볼 때를 비교해 "<b>자유물체도에는 외력만</b>"을 확인한 뒤, 평형식을 2D·3D 성분식으로 정리했다. 이어서 <b>Ch.4 힘계와 모멘트</b>: 평형이면 모멘트의 합도 0, 2D 모멘트 \\(M_P=DF\\), 부호(반시계 +), 성분별 합, 모멘트 벡터 \\(\\mathbf M_P=\\mathbf r\\times\\mathbf F\\), 그리고 <b>r 은 작용선 위 아무 점</b>. 녹음이 없어 교수님 필기본 11쪽과 LMS 영상으로 정리했다.</p>
<p class="meta"><span>교수 필기본 W4-1 11p</span><span>LMS 영상 54분</span><span>녹음 없음</span><span>4주차 · 월 · 중간 범위(Ch.3~5)</span></p>
</header>

<section class="s" data-id="s1" data-nodes="mech.particle_2d mech.fbd">
<h2>1. 평형 문제의 좌표계 · 두 블록 장력 — 하나씩 떼어 보기</h2>
<p>좌표축은 아무렇게나 잡지 않는다. 힘이 대부분 <b>수평·수직</b>이면 x 축·y 축도 수평·수직으로 — 좌표계는 <b>문제의 기하와 힘의 방향</b>을 보고 정한다(필기 p.2).</p>
<p>예제(필기 p.3): 무게 \\(W\\) 로 같은 <b>정지한(stationary)</b> 블록 2개가 케이블로 매달려 있다. 위 케이블 D–C, 가운데 케이블 B–A. 두 케이블의 장력 \\(T_{{AB}}\\), \\(T_{{CD}}\\) 는? 교수님은 "직접 구해 보라"며 시간을 줬다. 정지 → 가속도 0 → 합력 0.</p>
{fig_blocks}
<div class="formula">\\[\\text{{아래 블록}}:\\ \\sum F_y=T_{{AB}}\\,\\mathbf j-W\\,\\mathbf j=0\\ \\Rightarrow\\ T_{{AB}}=W\\qquad \\text{{위 블록}}:\\ \\sum F_y=T_{{CD}}\\,\\mathbf j-W\\,\\mathbf j-T_{{AB}}\\,\\mathbf j=0\\ \\Rightarrow\\ T_{{CD}}=2W\\]</div>
<div class="why">위 블록의 FBD 에서 가장 많이 빠뜨리는 힘이 <b>아래로 당기는 \\(T_{{AB}}\\)</b> 다. 가운데 줄은 위 블록에 매달려 있으니 위 블록 입장에서는 아래 블록 무게를 줄을 통해 전달받는다. 그래서 위 줄은 블록 두 개를 버틴다 — \\(T_{{CD}}=2W\\).</div>
<div class="analogy">2층 침대를 천장에 매단다고 생각하자. 아래 칸을 거는 줄은 아래 칸 하나만, 위 칸을 거는 줄은 위 칸 + 아래 칸(아래 줄이 위 칸을 끌어내리니까)을 버틴다. 위로 갈수록 줄이 굵어야 하는 이유.</div>
<div class="memo"><b>외울 것</b> 좌표축 = 문제의 기하·힘 방향 기준 · 아래 블록부터: \\(T_{{AB}}=W\\) · 위 블록은 \\(T_{{AB}}\\)(아래로)까지: \\(T_{{CD}}=2W\\)</div>
</section>

<section class="s" data-id="s2" data-nodes="mech.fbd mech.equilibrium_particle">
<h2>2. 두 블록 통째로 — 내력은 안 그린다 · 2D/3D 힘 평형식</h2>
<p>이번에는 두 블록을 점선으로 묶어 <b>한 물체</b>로 본다(필기 p.4). 이 계에 작용하는 외력은 아래로 \\(W\\) 두 개, 위로 \\(T_{{CD}}\\) 하나뿐이다.</p>
{fig_whole}
<div class="formula">\\[\\sum F_y=T_{{CD}}\\,\\mathbf j-2W\\,\\mathbf j=0\\ \\Rightarrow\\ T_{{CD}}=2W\\]</div>
<div class="say">"<b>T_AB 는 왜 고려하지 않나?</b>" → \\(T_{{AB}}\\) 는 <b>내력(internal force)</b>. "<b>Free body diagram only considers external forces.</b>"</div>
<div class="why">계를 크게 잡으면 가운데 줄이 위 블록을 아래로 당기는 힘과 아래 블록을 위로 당기는 힘이 크기가 같고 방향이 반대라 서로 지워진다. 3주차에 배운 대로 외력·내력은 "물체를 어디까지로 잡느냐"에 따라 달라진다 — 같은 \\(T_{{AB}}\\) 가 블록 하나를 잡으면 외력, 두 블록을 잡으면 내력. 한 번에 구하고 싶은 것(\\(T_{{CD}}\\))만 외력으로 남도록 계를 잡으면 식 하나로 끝난다.</div>
<p>평형식은 성분으로 쪼개 쓴다. 벡터 합이 0 이면 각 방향 성분도 0 이다.</p>
<div class="formula">\\[\\text{{2D}}:\\ \\sum\\mathbf F=(\\textstyle\\sum F_x)\\mathbf i+(\\sum F_y)\\mathbf j=0\\ \\Rightarrow\\ \\sum F_x=0,\\ \\sum F_y=0\\qquad \\text{{3D}}:\\ \\sum F_x=0,\\ \\sum F_y=0,\\ \\sum F_z=0\\]</div>
<div class="say">"정역학은 결국 <b>힘의 합력 0</b>, 나중에 <b>모멘트의 합 0</b>. <b>이 두 개가 제일 중요</b>."</div>
<div class="analogy">팀 전체를 하나로 보면 팀원끼리 주고받는 힘은 안 보인다(내력). 밖에서 팀을 미는 힘만 보인다(외력). 회사 매출을 볼 때 부서끼리 주고받은 돈을 빼는 것과 같다.</div>
<div class="memo"><b>외울 것</b> <b>FBD 에는 외력만</b> · 여러 물체를 통째로 잡으면 그 사이 줄·접촉력은 내력이라 빠진다 · 2D 식 2개 \\(\\sum F_x=\\sum F_y=0\\) · 3D 식 3개 \\(\\sum F_x=\\sum F_y=\\sum F_z=0\\)</div>
</section>

<section class="s" data-id="s3" data-nodes="mech.moment">
<h2>3. Ch.4 힘계와 모멘트 — 평형이면 모멘트도 0 · M_P = DF · 부호 · 단위</h2>
<p><b>Chapter 4. 힘계와 모멘트(Systems of Forces and Moments)</b>. 첫 선언(필기 p.5 ✓): <b>물체가 평형이면, 물체에 작용하는 힘들에 의한 임의의 점에 대한 전체 모멘트는 0 이어야 한다.</b> 한 점에 대해서만 0 이고 다른 점에 모멘트가 남으면 물체가 그쪽으로 돈다는 뜻이니, 원래는 모든 점에 대해 0. 실제로 모든 점을 다 계산하지는 않는다 — 한 점만 만족하면 나머지도 0 이 되는 이론은 차차 배운다.</p>
<p><b>모멘트(moment)</b> = 힘이 한 점을 중심으로 물체를 <b>회전시키려는 경향</b>. 모멘트는 항상 <b>어떤 점에 대해</b> 정의한다.</p>
{fig_df}
<div class="formula">\\[M_P=D\\,F\\qquad(D:\\ \\text{{점 P 에서 힘의 작용선까지 수직거리}},\\ F:\\ \\text{{힘의 크기}})\\]</div>
<div class="why">문을 열 때 손잡이(경첩에서 먼 곳)를 미는 이유가 \\(D\\) 다. 같은 힘이라도 수직거리가 길수록 잘 돈다. 그리고 거리는 힘이 걸린 점까지가 아니라 <b>작용선(line of action)까지의 수직거리(perpendicular distance)</b>다 — 힘을 작용선 따라 밀어도 회전 효과는 같으니까. 부호(필기 p.6): <b>반시계(counterclockwise, CCW) = +, 시계(clockwise, CW) = −</b>. 힘의 작용선이 P 를 지나면 \\(D=0\\) 이라 \\(M=0\\) (교수님 질문 "몇일까요?"). 단위는 힘 × 길이 = <b>N·m</b>.</div>
<div class="say">"모멘트는 한 점에 대해 정의된다 — <b>지금 기억해야</b>."</div>
<div class="analogy">경첩에 대고 문을 밀면(작용선이 회전축을 지남) 아무리 세게 밀어도 문이 안 돈다. \\(D=0\\) 이니까. 스패너가 길수록 볼트가 잘 풀리는 것도 같은 식.</div>
<div class="memo"><b>외울 것</b> 평형 = \\(\\sum\\mathbf F=0\\) + \\(\\sum M=0\\) · \\(M_P=DF\\), \\(D\\) = P 에서 <b>작용선까지 수직거리</b> · 반시계 +, 시계 − · 작용선이 P 를 지나면 0 · 단위 N·m</div>
</section>

<section class="s" data-id="s4" data-nodes="mech.moment">
<h2>4. 모멘트의 합 · 성분으로 쪼개 계산하기</h2>
<p>여러 힘이 있으면 점 P 에 대한 전체 모멘트는 각 힘의 모멘트를 <b>더한 것</b>이다(필기 p.7). 힘을 더하듯 하나씩 더하되, 각 모멘트에 <b>회전 방향대로 + 또는 −</b> 를 붙인다.</p>
<div class="formula">\\[\\sum M_P=M_{{P,1}}+M_{{P,2}}+M_{{P,3}}+\\cdots\\qquad M_P(\\mathbf F)=M_P(F_x)+M_P(F_y)\\]</div>
<p>힘이 성분으로 주어지면 \\(M_P\\) 는 <b>각 성분의 P 에 대한 모멘트의 합</b>과 같다(필기 p.8). "한 번에 계산하는 게 편할 때도, \\(F_x\\)·\\(F_y\\) 로 나누는 게 편할 때도 있다. 상황 보고" — 수요일(W4-2)에 <b>바리뇽 정리</b>로 이유가 나온다.</p>
{fig_sum}
<details class="ex"><summary>연습(아톰) — 점 A(2, 1) m 에 \\(\\mathbf F=3\\mathbf i+4\\mathbf j\\) N, 원점 P 에 대한 모멘트</summary><div class="body"><p>성분별: \\(F_x=3\\) N 은 A 의 높이 \\(y=1\\) m 만큼 떨어져 P 를 <b>시계</b>로 돌린다 → \\(-1\\cdot3=-3\\) N·m. \\(F_y=4\\) N 은 \\(x=2\\) m 만큼 떨어져 <b>반시계</b> → \\(+2\\cdot4=+8\\) N·m. 합 \\(+5\\) N·m(반시계). 검산 \\(DF\\): \\(|\\mathbf F|=5\\) N, 작용선까지 수직거리 \\(D=|2\\cdot4-1\\cdot3|/5=1\\) m → \\(1\\times5=5\\) N·m.</p></div></details>
<div class="why">성분으로 쪼개면 각 성분의 수직거리가 그냥 좌표값이 된다. \\(F_x\\)(가로 힘)의 팔은 \\(y\\), \\(F_y\\)(세로 힘)의 팔은 \\(x\\). 비스듬한 힘의 수직거리 \\(D\\) 를 기하로 구하는 것보다 훨씬 쉽다. 단 부호는 그림을 보고 방향마다 따로 판단한다.</div>
<div class="analogy">대각선으로 문을 미는 힘 = "문면에 수직으로 미는 몫" + "문면을 따라 미는 몫". 회전에 쓰이는 몫만 각각 계산해 더하면 된다.</div>
<div class="memo"><b>외울 것</b> \\(\\sum M_P=M_{{P,1}}+M_{{P,2}}+\\cdots\\) (부호 붙여) · \\(M_P(\\mathbf F)=M_P(F_x)+M_P(F_y)\\) · \\(F_x\\) 의 팔 = \\(y\\), \\(F_y\\) 의 팔 = \\(x\\)</div>
</section>

<section class="s" data-id="s5" data-nodes="mech.moment mech.cross_apps vec.cross">
<h2>5. 모멘트 벡터 M_P = r × F — 크기 rF sinθ = DF · 방향은 오른손</h2>
<p>모멘트는 스칼라? 벡터? → <b>벡터</b>(시계/반시계라는 방향이 있었으니까). 힘 벡터 \\(\\mathbf F\\) 와 점 P 에 대해(필기 p.8):</p>
<div class="formula">\\[\\mathbf M_P=\\mathbf r\\times\\mathbf F\\qquad(\\mathbf r:\\ \\text{{점 P 에서 F 의 작용선 위 아무 점까지의 위치벡터}})\\]</div>
<div class="say">"\\(\\mathbf r\\) 은 <b>작용선 위 아무 점(any point on the line of action of F)</b>" — 필기 빨간 글씨. "<b>잘 기억해 주시면 계산이 쉬워진다</b>."</div>
{fig_rxf}
<div class="why">크기(필기 p.9): \\(|\\mathbf M_P|=|\\mathbf r\\times\\mathbf F|=rF\\sin\\theta\\). 여기서 \\(\\theta\\) 는 \\(\\mathbf r\\) 과 \\(\\mathbf F\\) 를 <b>꼬리끼리 붙였을 때(tail to tail)</b> 사이각. 그림에서 P 에서 작용선까지 수직선을 내리면 \\(r\\sin\\theta=D\\) — 그래서 \\(rF\\sin\\theta=DF\\). 지금까지 쓴 \\(DF\\) 가 사실 외적의 크기였다. 방향(필기 p.10): 외적이므로 \\(\\mathbf M_P\\) 는 \\(\\mathbf r\\)·\\(\\mathbf F\\) <b>둘 다에 수직</b> → 점 P 와 힘 F 가 들어 있는 평면에 수직. <b>오른손 법칙</b>: 손가락을 \\(\\mathbf r\\) 에서 \\(\\mathbf F\\) 쪽으로 감으면 엄지가 \\(\\mathbf M_P\\). 평면에서 반시계로 감으면 엄지가 지면 밖(+z) — 반시계를 + 로 잡았던 이유가 이것.</div>
<div class="formula">\\[|\\mathbf M_P|=rF\\sin\\theta=DF,\\qquad D=r\\sin\\theta\\]</div>
<div class="analogy">드라이버로 나사를 돌린다. 손을 돌리는 방향(r 에서 F 로 감는 방향)을 오른손 손가락으로 따라가면 엄지가 나사가 나아가는 방향 — 그게 모멘트 벡터의 방향이다.</div>
<div class="memo"><b>외울 것</b> \\(\\mathbf M_P=\\mathbf r\\times\\mathbf F\\), \\(\\mathbf r\\) = P → <b>작용선 위 아무 점</b> · \\(|\\mathbf M_P|=rF\\sin\\theta=DF\\) (\\(\\theta\\) 는 꼬리끼리) · 방향 = 평면에 수직, 오른손 r → F · 반시계 = +z</div>
</section>

<section class="s" data-id="s6" data-nodes="mech.moment mech.cross_apps">
<h2>6. r 은 작용선 위 아무 점 — 같은 모멘트</h2>
<p>필기 p.11: P 에서 작용선 위 여러 점으로 가는 빨간 \\(\\mathbf r\\) 들 → <b>모두 같은 모멘트(Same moment)</b>. 증명은 한 줄이다. 작용선 위 다른 점으로 가는 위치벡터를 \\(\\mathbf r'=\\mathbf r+\\mathbf u\\) 라 하면 \\(\\mathbf u\\) 는 작용선을 따라가므로 \\(\\mathbf F\\) 와 평행하다.</p>
{fig_anyr}
<div class="formula">\\[\\mathbf r'\\times\\mathbf F=(\\mathbf r+\\mathbf u)\\times\\mathbf F=\\mathbf r\\times\\mathbf F+\\mathbf u\\times\\mathbf F=\\mathbf r\\times\\mathbf F\\qquad(\\mathbf u\\parallel\\mathbf F\\ \\Rightarrow\\ \\mathbf u\\times\\mathbf F=0)\\]</div>
<div class="say">교수님 질문 "<b>u 와 F 의 외적값 얼마죠?</b>" → 0. 외적의 크기 = 평행사변형 넓이인데, 평행하면 넓이가 0. "기호만 써서 헷갈릴 수 있는데, <b>예제를 풀면 바로 이해된다</b>" — 예제는 수요일(W4-2).</div>
<div class="why">이 성질 덕분에 \\(\\mathbf r\\) 을 고를 때 <b>계산이 제일 쉬운 점</b>(좌표에 0 이 많은 점, 축 위의 점)을 골라도 된다. 힘이 걸린 바로 그 점이 아니어도 된다.</div>
<details class="ex"><summary>연습(아톰) — 4절 연습을 작용선 위 다른 점으로</summary><div class="body"><p>A(2, 1) 에서 \\(\\mathbf F\\) 방향으로 한 번 더 간 점 \\((2+3,\\ 1+4)=(5,5)\\) 도 작용선 위. \\(\\mathbf r'\\times\\mathbf F=(5\\cdot4-5\\cdot3)\\mathbf k=5\\mathbf k\\) N·m — 4절과 같다. 2D 에서는 \\(\\mathbf r\\times\\mathbf F=(xF_y-yF_x)\\mathbf k\\).</p></div></details>
<div class="analogy">밧줄로 수레를 끈다. 밧줄의 어느 지점을 잡아 당기든(같은 직선 위) 수레를 돌리는 효과는 같다. 힘을 작용선 따라 미끄러뜨려도 모멘트는 그대로.</div>
<div class="memo"><b>외울 것</b> \\(\\mathbf r'=\\mathbf r+\\mathbf u\\), \\(\\mathbf u\\parallel\\mathbf F\\) → \\(\\mathbf u\\times\\mathbf F=0\\) → <b>같은 모멘트</b> · 2D: \\(\\mathbf r\\times\\mathbf F=(xF_y-yF_x)\\mathbf k\\) · 계산 쉬운 점을 고른다</div>
</section>

<div class="q" data-qid="q1" data-nodes="mech.particle_2d mech.fbd"><div class="qn">확인 1 · 두 블록 장력 (필기 p.3)</div><div class="qb">무게 \\(W\\) 로 같은 정지한 블록 두 개가 위 줄 CD, 가운데 줄 AB 로 매달려 있다. 장력은?</div><ol class="choices"><li data-ok="1">\\(T_{{AB}}=W,\\ T_{{CD}}=2W\\)</li><li>\\(T_{{AB}}=W,\\ T_{{CD}}=W\\)</li><li>\\(T_{{AB}}=2W,\\ T_{{CD}}=W\\)</li><li>\\(T_{{AB}}=W/2,\\ T_{{CD}}=W\\)</li></ol><div class="ans">아래 블록: \\(T_{{AB}}-W=0\\). 위 블록: \\(T_{{CD}}-W-T_{{AB}}=0\\) → \\(2W\\). 위 블록에는 아래 줄이 아래로 당기는 \\(T_{{AB}}\\) 가 있다.</div></div>
<div class="q" data-qid="q2" data-nodes="mech.fbd"><div class="qn">확인 2 · 통째 FBD (교수님 질문)</div><div class="qb">두 블록을 한 물체로 묶은 자유물체도에 \\(T_{{AB}}\\) 를 그리지 않는 이유는?</div><ol class="choices"><li data-ok="1">\\(T_{{AB}}\\) 는 이 계의 내력이고, 자유물체도에는 외력만 그린다</li><li>\\(T_{{AB}}=0\\) 이기 때문</li><li>\\(T_{{AB}}\\) 는 \\(T_{{CD}}\\) 와 같기 때문</li><li>줄의 질량을 무시했기 때문</li></ol><div class="ans">"Free body diagram only considers external forces." 가운데 줄이 위·아래 블록에 주는 힘은 크기가 같고 방향이 반대라 계 안에서 지워진다.</div></div>
<div class="q" data-qid="q3" data-nodes="mech.moment"><div class="qn">확인 3 · 작용선이 P 를 지나면</div><div class="qb">힘 \\(F=50\\) N 의 작용선이 점 P 를 지난다. P 에 대한 모멘트는?</div><ol class="choices"><li data-ok="1">0</li><li>50 N·m</li><li>P 에서 힘이 걸린 점까지 거리 × 50</li><li>정할 수 없다</li></ol><div class="ans">수직거리 \\(D\\) 는 작용선까지 재므로 \\(D=0\\) → \\(M=DF=0\\). 교수님 질문 "몇일까요?"</div></div>
<div class="q" data-qid="q4" data-nodes="mech.moment"><div class="qn">확인 4 · 부호와 단위</div><div class="qb">2차원 모멘트의 부호 약속과 단위로 맞는 것은?</div><ol class="choices"><li data-ok="1">반시계 +, 시계 −, 단위 N·m</li><li>시계 +, 반시계 −, 단위 N·m</li><li>반시계 +, 시계 −, 단위 N/m</li><li>부호 없음, 단위 N</li></ol><div class="ans">반시계 = 외적 방향 +z(지면 밖)라서 +. 모멘트 = 힘 × 길이 = N·m.</div></div>
<div class="q" data-qid="q5" data-nodes="mech.moment"><div class="qn">확인 5 · 성분별 모멘트 (연습)</div><div class="qb">점 A(2, 1) m 에 \\(\\mathbf F=3\\mathbf i+4\\mathbf j\\) N 이 작용한다. 원점에 대한 모멘트는?</div><ol class="choices"><li data-ok="1">\\(+5\\) N·m (반시계, \\(5\\mathbf k\\))</li><li>\\(+11\\) N·m</li><li>\\(-5\\) N·m (시계)</li><li>\\(+10\\) N·m</li></ol><div class="ans">\\(xF_y-yF_x=2\\cdot4-1\\cdot3=5\\). 성분별로 \\(-3\\)(시계) \\(+8\\)(반시계). 11 은 부호를 무시하고 더한 값.</div></div>
<div class="q" data-qid="q6" data-nodes="mech.moment mech.cross_apps"><div class="qn">확인 6 · 모멘트 벡터의 크기</div><div class="qb">\\(|\\mathbf r\\times\\mathbf F|=rF\\sin\\theta\\) 에서 \\(\\theta\\) 와 \\(r\\sin\\theta\\) 의 뜻은?</div><ol class="choices"><li data-ok="1">\\(\\theta\\) = r 과 F 를 꼬리끼리 붙인 사이각, \\(r\\sin\\theta\\) = P 에서 작용선까지 수직거리 \\(D\\)</li><li>\\(\\theta\\) = F 와 x 축 사이각, \\(r\\sin\\theta\\) = 힘의 y 성분</li><li>\\(\\theta\\) = r 의 머리와 F 의 꼬리를 붙인 각, \\(r\\sin\\theta=r\\)</li><li>\\(\\theta\\) = 90° 로 고정</li></ol><div class="ans">tail to tail. \\(D=r\\sin\\theta\\) 이므로 \\(|\\mathbf M_P|=DF\\).</div></div>
<div class="q" data-qid="q7" data-nodes="mech.moment mech.cross_apps"><div class="qn">확인 7 · r 선택 무관 (교수님 질문)</div><div class="qb">작용선 위 다른 점으로 가는 \\(\\mathbf r'=\\mathbf r+\\mathbf u\\) 로 계산해도 모멘트가 같은 이유는?</div><ol class="choices"><li data-ok="1">\\(\\mathbf u\\) 가 \\(\\mathbf F\\) 와 평행해서 \\(\\mathbf u\\times\\mathbf F=0\\)</li><li>\\(\\mathbf u\\) 가 \\(\\mathbf F\\) 와 수직이라서 \\(\\mathbf u\\cdot\\mathbf F=0\\)</li><li>\\(|\\mathbf r'|=|\\mathbf r|\\) 이라서</li><li>같지 않다 — 힘이 걸린 점만 써야 한다</li></ol><div class="ans">\\((\\mathbf r+\\mathbf u)\\times\\mathbf F=\\mathbf r\\times\\mathbf F+\\mathbf u\\times\\mathbf F\\), 평행한 두 벡터의 외적 = 평행사변형 넓이 0.</div></div>
<div class="q" data-qid="q8" data-nodes="mech.particle_2d mech.fbd"><div class="qn">확인 8 · 블록 3개 (연습)</div><div class="qb">질량 5 kg 블록 3개가 위에서부터 줄 1·2·3 으로 이어져 매달려 정지해 있다(\\(g=9.81\\ \\mathrm{{m/s^2}}\\)). 맨 위 줄 장력 \\(T_1\\) 을 통째 FBD 로 구하라.</div><div class="ans">세 블록 전체: \\(T_1-3W=0\\), \\(W=5\\times9.81=49.05\\) N → \\(T_1=147.15\\) N. 분리 FBD 로도 \\(T_3=49.05\\) → \\(T_2=98.1\\) → \\(T_1=147.15\\) N. \\(T_2\\)·\\(T_3\\) 는 통째 FBD 에서 내력.</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
