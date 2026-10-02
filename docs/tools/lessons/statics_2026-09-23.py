# -*- coding: utf-8 -*-
"""정역학 · 2026-09-23 수업 노트 (아토 녹음 없음 — 교수필기_한글_4주차_W4-2 9p 순서가 뼈대 + 영상정리_4주차_W4-2 65분 + 수업요약으로 재구성)"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\정역학\_수업노트\2026-09-23.html"

def outdot(x, y, color=GREEN):
    return circle(x, y, 9, color, w=2) + f'<circle cx="{x}" cy="{y}" r="3" fill="{color}"/>'
def R(v): return round(v, 1)

# 1) 점 (4,2,0) 에 10j N
O = (70, 190); S = 40; A = (O[0] + 4 * S, O[1] - 2 * S)
fig_ex1 = canvas(560, 230,
    step(1, axis(O[0], O[1], 330, 30, "x (m)", "y (m)"), text(O[0] - 6, O[1] + 18, "O", 13, INK, "end", True),
        dot(A[0], A[1], "", 4, INK), text(A[0] + 8, A[1] + 18, "(4, 2, 0)", 12, INK),
        arrow(A[0], A[1], A[0], A[1] - 60, GREEN, "10j N", 3, 30, 0),
        text(A[0], O[1] + 18, "4", 12, GRAY, "middle"), text(O[0] - 8, A[1] + 4, "2", 12, GRAY, "end")),
    step(2, line(A[0], 26, A[0], A[1] - 62, BLUE, 1.6, "6 5"), line(A[0], A[1], A[0], O[1], BLUE, 1.6, "6 5"),
        line(O[0], O[1], A[0], O[1], RED, 3.2), text(150, 178, "D = 4 m", 13, RED, "middle", True)),
    step(3, text(350, 66, "방법 1 : D × F = 4 × 10 = 40 N·m", 12.5, INK), text(350, 90, "반시계 → +z → M_O = 40k N·m", 12.5, GREEN, "start", True)),
    step(4, arrow(O[0], O[1], A[0] - 4, A[1] + 2, RED, "r = 4i + 2j", 2.2, -26, -18, "6 4"),
        text(350, 140, "방법 2 : r × F = (4i + 2j) × 10j", 12.5, INK), text(350, 164, "= 40k + 20(j × j) = 40k N·m", 12.5, GREEN, "start", True),
        text(350, 188, "j × j = 0", 12.5, PINK)),
    cap="필기 p.2 예제: 점 \\((4,2,0)\\) m 에 \\(10\\mathbf j\\) N. 세로 힘의 작용선은 \\(x=4\\) 인 세로선이라 원점에서 수직거리 \\(D=4\\) m. 두 방법 모두 \\(\\mathbf M_O=40\\mathbf k\\) N·m.", name="ex1")

# 2) 바리뇽 — 한 점 Q 에서 만나는 힘들
P2 = (80, 190); Q2 = (300, 110)
fig_var = canvas(560, 290,
    step(1, dot(Q2[0], Q2[1], "", 5, INK), text(286, 96, "Q", 14, INK, "end", True),
        arrow(Q2[0], Q2[1], 400, 60, GREEN, "F_1", 2.6, -12, -14), arrow(Q2[0], Q2[1], 260, 30, BLUE, "F_2", 2.6, -16, 0),
        arrow(Q2[0], Q2[1], 360, 190, PINK, "F_3", 2.6, 16, 0), text(440, 130, "작용선이 Q 에서 만남", 12, GRAY), text(440, 150, "(concurrent)", 12, GRAY)),
    step(2, dot(P2[0], P2[1], "", 5, INK), text(72, 210, "P", 14, INK, "end", True),
        arrow(P2[0], P2[1], Q2[0] - 4, Q2[1] + 2, RED, "r_PQ", 2.6, -10, -14)),
    step(3, text(40, 230, "ΣM_P = r_PQ × F_1 + r_PQ × F_2 + r_PQ × F_3", 13, INK), text(40, 252, "= r_PQ × (F_1 + F_2 + F_3) = r_PQ × ΣF", 13, RED, "start", True)),
    step(4, text(40, 274, "→ M_P(F) = M_P(F_x) + M_P(F_y) + M_P(F_z)", 13, GREEN, "start", True)),
    cap="바리뇽 정리(필기 p.3): 한 점 Q 에서 만나는 힘들은 같은 \\(\\mathbf r_{PQ}\\) 를 공유하므로 외적의 분배법칙으로 묶인다. 합력의 모멘트 = 각 힘 모멘트의 합.", name="var")

# 3) 직선에 대한 모멘트 = M_P 의 L 방향 정사영
L0 = (40, 200); L1 = (520, 80); dx, dy = L1[0] - L0[0], L1[1] - L0[1]; Ln = math.hypot(dx, dy); d = (dx / Ln, dy / Ln)
Pp = (150, R(200 - 120 * 110 / 480)); Mt = (260, 40)
pr = (Mt[0] - Pp[0]) * d[0] + (Mt[1] - Pp[1]) * d[1]; Ft = (R(Pp[0] + pr * d[0]), R(Pp[1] + pr * d[1]))
Ea = (400, R(200 - 120 * 360 / 480)); Eb = (R(Ea[0] + 44 * d[0]), R(Ea[1] + 44 * d[1]))
fig_proj = canvas(560, 240,
    step(1, line(L0[0], L0[1], L1[0], L1[1], BLUE, 2), text(530, 76, "L", 14, BLUE, "start", True),
        dot(Pp[0], Pp[1], "", 5, INK), text(150, 196, "P (L 위 아무 점)", 12, INK, "middle"),
        arrow(Ea[0], Ea[1], Eb[0], Eb[1], BLUE, "", 3), text(Ea[0] + 22, Ea[1] - 16, "e", 14, BLUE, "middle", True)),
    step(2, arrow(Pp[0], Pp[1], Mt[0], Mt[1], GREEN, "", 3), text(Mt[0] + 8, Mt[1] - 2, "M_P = r × F", 13, GREEN, "start", True)),
    step(3, line(Mt[0], Mt[1], Ft[0], Ft[1], GRAY, 1.4, "5 4"), arrow(Pp[0], Pp[1], Ft[0], Ft[1], PINK, "", 4.5),
        text(225, 178, "M_L", 14, PINK, "middle", True)),
    step(4, text(330, 186, "M_L = (e · M_P) e", 14, INK, "start", True), text(330, 210, "= M_P 를 L 위로 정사영", 12.5, GRAY)),
    cap="필기 p.4: 직선 L 위 아무 점 P 의 모멘트 \\(\\mathbf M_P\\) 중 <b>L 에 평행한 성분</b>만 남긴 것이 L 에 대한 모멘트. 내적 \\(\\mathbf e\\cdot\\mathbf M_P\\) 가 평행한 크기를 뽑는다.", name="proj")

# 4) 부호
fig_sign = canvas(560, 200,
    step(1, line(30, 100, 260, 100, BLUE, 2), arrow(40, 100, 92, 100, BLUE, "e", 3, 0, -12), arrow(130, 100, 236, 100, PINK, "M_L", 4.5, 0, -12),
        text(145, 146, "e · (r × F) > 0", 13, INK, "middle", True), text(145, 170, "→ M_L 은 e 방향", 13, GREEN, "middle", True)),
    step(2, line(300, 100, 530, 100, BLUE, 2), arrow(310, 100, 362, 100, BLUE, "e", 3, 0, -12), arrow(510, 100, 404, 100, PINK, "M_L", 4.5, 0, -12),
        text(415, 146, "e · (r × F) < 0", 13, INK, "middle", True), text(415, 170, "→ M_L 은 e 반대 방향", 13, RED, "middle", True)),
    cap="괄호 안 \\(\\mathbf e\\cdot(\\mathbf r\\times\\mathbf F)\\) 는 스칼라(혼합삼중적). 부호가 방향을 알려 준다. \\(\\mathbf e\\) 는 처음에 아무 쪽으로나 정해도 된다.", name="sign")

# 5) 직선 위 점 선택 무관
fig_anyp = canvas(560, 262,
    step(1, line(30, 170, 530, 170, BLUE, 2), text(530, 160, "L", 14, BLUE, "end", True), arrow(44, 170, 96, 170, BLUE, "e", 3, 0, -12),
        dot(170, 170, "", 5, INK), text(170, 192, "P", 14, INK, "middle", True), dot(260, 60, "", 4, INK),
        arrow(260, 60, 370, 40, GREEN, "F", 3, 4, -12), arrow(170, 170, 257, 64, RED, "r", 2.6, -14, 0)),
    step(2, dot(350, 170, "", 5, INK), text(350, 192, "P′", 14, INK, "middle", True), arrow(350, 170, 263, 64, RED, "", 2.2, dash="7 4"), text(318, 112, "r′", 14, RED, "start", True),
        arrow(346, 170, 176, 170, PINK, "u", 3, 0, 22)),
    step(3, text(40, 226, "e · (u × F) = 0 : e ∥ u → 평행육면체를 못 만든다 (부피 0)", 13, PINK, "start", True),
        text(40, 246, "→ M_L 은 L 위에서 고른 점과 무관", 13, GREEN, "start", True)),
    cap="필기 p.5: L 위 다른 점 P′ 에서 \\(\\mathbf r'=\\mathbf r+\\mathbf u\\). \\(\\mathbf u\\) 는 L 위에 놓여 \\(\\mathbf e\\) 와 평행하므로 \\(\\mathbf e\\cdot(\\mathbf u\\times\\mathbf F)=0\\). 그래서 r 은 계산이 제일 쉬운 점에서 잡는다.", name="anyp")

# 6) 터빈 (Fig 4.14) — 축 L = z
Q6 = (200, 140); P6 = (164, 224)
fig_turb = canvas(560, 280,
    step(1, axes3d(Q6[0], Q6[1], 90), line(Q6[0], Q6[1], Q6[0], 272, BLUE, 2, "7 5"), text(208, 266, "L = z축 (터빈 축)", 12, BLUE),
        dot(Q6[0], Q6[1], "", 5, INK), text(192, 132, "Q", 13, INK, "end", True)),
    step(2, arrow(Q6[0], Q6[1], P6[0] + 2, P6[1] - 4, RED, "", 2.6), text(208, 192, "r = a i − b k", 13, RED, "start", True), dot(P6[0], P6[1], "", 4, INK), text(156, 230, "P", 13, INK, "end", True)),
    step(3, arrow(P6[0], P6[1], 140, 244, GRAY, "", 2.4), text(134, 262, "F_x", 13, GRAY, "end"),
        arrow(P6[0], P6[1], P6[0], 178, BLUE, "", 2.4), text(156, 196, "F_z", 13, BLUE, "end"),
        arrow(P6[0], P6[1], 252, P6[1], GREEN, "", 3.2), text(258, 230, "F_y", 13, GREEN, "start", True)),
    step(4, text(310, 60, "M_Q = r × F", 13, INK, "start", True), text(310, 84, "= bF_y i − (aF_z + bF_x) j + aF_y k", 12.5, INK)),
    step(5, text(310, 176, "M_L = (k · M_Q) k = aF_y k", 14, GREEN, "start", True), text(310, 200, "F_x · F_z 는 축에 대한 모멘트 0", 12.5, RED)),
    cap="필기 p.6(교재 Fig 4.14): 터빈은 z 축 둘레로만 돈다. 축 위 점 Q 에서 힘이 걸린 점 P 까지 \\(\\mathbf r=a\\mathbf i-b\\mathbf k\\). 축 방향 단위벡터가 \\(\\mathbf k\\) 라서 \\(\\mathbf M_Q\\) 의 \\(\\mathbf k\\) 성분만 남는다.", name="turb")

# 7) Fig 4.15 — A(2,0,4), B(−7,6,2), Q(8,6,4), F = 10i + 60j − 20k
OX, OY, SS = 170, 180, 14
def P3(x, y, z): return (R(OX + y * SS - x * SS * .5), R(OY - z * SS + x * SS * .35))
Aq, Bq, Qq, Oq = P3(2, 0, 4), P3(-7, 6, 2), P3(8, 6, 4), P3(0, 0, 0)
BA = (Bq[0] - Aq[0], Bq[1] - Aq[1]); nBA = math.hypot(*BA); uBA = (BA[0] / nBA, BA[1] / nBA)
Ls = (R(Aq[0] - .5 * BA[0]), R(Aq[1] - .5 * BA[1])); Le = (R(Bq[0] + .6 * BA[0]), R(Bq[1] + .6 * BA[1]))
Fs = (R(Qq[0] + 92.4), R(Qq[1] + 39.5))
E0 = (R(Aq[0] + .35 * BA[0]), R(Aq[1] + .35 * BA[1])); E1 = (R(E0[0] + 46 * uBA[0]), R(E0[1] + 46 * uBA[1]))
Xe, Ye, Ze = P3(10, 0, 0), P3(0, 10, 0), P3(0, 0, 7)
fig_415 = canvas(560, 260,
    step(1, arrow(Oq[0], Oq[1], Xe[0], Xe[1], INK, "", 1.5), arrow(Oq[0], Oq[1], Ye[0], Ye[1], INK, "", 1.5), arrow(Oq[0], Oq[1], Ze[0], Ze[1], INK, "", 1.5),
        text(Xe[0] - 6, Xe[1] + 4, "x", 13, INK, "end"), text(Ye[0] + 6, Ye[1] + 5, "y", 13, INK), text(Ze[0] - 6, Ze[1] + 4, "z", 13, INK, "end"),
        line(Ls[0], Ls[1], Le[0], Le[1], BLUE, 2, "7 5"), text(Le[0] + 6, Le[1] + 2, "L", 14, BLUE, "start", True),
        dot(Aq[0], Aq[1], "", 4, BLUE), text(Aq[0] - 6, Aq[1] - 12, "A(2, 0, 4)", 12, BLUE, "end"),
        dot(Bq[0], Bq[1], "", 4, BLUE), text(Bq[0], Bq[1] - 14, "B(−7, 6, 2)", 12, BLUE, "middle")),
    step(2, dot(Qq[0], Qq[1], "", 4, INK), text(Qq[0] + 16, Qq[1] - 6, "Q(8, 6, 4)", 12, INK),
        arrow(Qq[0], Qq[1], Fs[0], Fs[1], GREEN, "", 3), text(Fs[0] - 60, Fs[1] + 14, "F = 10i + 60j − 20k", 12, GREEN, "middle")),
    step(3, arrow(Aq[0], Aq[1], Qq[0] - 3, Qq[1] - 2, RED, "", 2.4), text(Aq[0] - 6, Aq[1] + 30, "r_AQ = 6i + 6j", 12, RED, "end")),
    step(4, arrow(E0[0], E0[1], E1[0], E1[1], PINK, "", 3.4), text(E1[0] - 6, E1[1] - 12, "e_AB", 13, PINK, "middle", True)),
    step(5, text(360, 176, "M_A = −120i + 120j + 300k", 12.5, INK), text(360, 198, "e_AB = (−9i + 6j − 2k)/11", 12.5, PINK),
        text(360, 220, "e_AB · M_A = 1200/11 ≈ 109", 12.5, INK), text(360, 244, "M_L = 109 e_AB N·m", 14, GREEN, "start", True)),
    cap="필기 p.7~8(교재 Fig 4.15): 직선 L 은 A, B 를 지나고 힘은 Q 에 걸린다. 0 이 들어 있어 계산이 편한 점 A 를 골랐다. 그림은 축척을 맞춘 사시도가 아니라 배치만 보인다.", name="f415")

# 8) 특수한 경우 3
fig_spec = canvas(560, 220,
    step(1, line(50, 30, 50, 170, BLUE, 2), text(42, 40, "L", 14, BLUE, "end", True), line(50, 100, 120, 100, RED, 1.8, "5 4"), text(85, 92, "D", 13, RED, "middle", True),
        outdot(130, 100), text(130, 128, "F (지면 밖)", 12, GREEN, "middle"), text(100, 160, "|M_L| = F·D", 13, INK, "middle", True),
        text(100, 200, "① 평면에 수직 → F·D", 12.5, INK, "middle", True)),
    step(2, line(230, 30, 230, 170, BLUE, 2), text(222, 40, "L", 14, BLUE, "end", True), line(300, 26, 300, 60, GREEN, 1.4, "5 4"), line(300, 150, 300, 172, GREEN, 1.4, "5 4"),
        arrow(300, 150, 300, 62, GREEN, "F", 3, 14, 0), text(270, 200, "② 평행 → M_L = 0", 12.5, INK, "middle", True)),
    step(3, line(420, 30, 420, 170, BLUE, 2), text(412, 40, "L", 14, BLUE, "end", True), line(420, 143, 466, 113, GREEN, 1.4, "5 4"),
        arrow(466, 113, 528, 72, GREEN, "F", 3, 12, 10), dot(420, 143, "", 4, RED), text(412, 160, "교점", 12, RED, "end"),
        text(460, 200, "③ 만남 → M_L = 0", 12.5, INK, "middle", True)),
    cap="필기 p.9 유용한 특수한 경우. ② 평행이면 그 힘으로는 축을 못 돌리고, ③ 작용선(연장선 포함)이 L 과 만나면 L 에서 작용선까지 거리가 0.", name="spec")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>정역학 · 9/23 점 모멘트 예제 · 바리뇽 · 직선에 대한 모멘트</title></head><body>
<header>
<h1>"점은 r × F, 직선은 삼중곱" — 바리뇽 정리와 직선(축)에 대한 모멘트</h1>
<p class="lead">지난 시간 <b>점에 대한 모멘트</b>를 예제 하나로 두 방법(\\(DF\\) · \\(\\mathbf r\\times\\mathbf F\\))으로 마무리하고, <b>바리뇽 정리</b>(합력의 모멘트 = 각 힘 모멘트의 합 → 성분으로 쪼개도 된다)를 정리했다. 본론은 <b>직선(축)에 대한 모멘트</b>: \\(\\mathbf M_P\\) 중 L 과 평행한 성분, 식은 3주차의 <b>혼합삼중적</b> \\(\\mathbf e\\cdot(\\mathbf r\\times\\mathbf F)\\). L 위 어느 점을 골라도 같고, 예제 2개(터빈 · 두 점 직선)와 계산 없이 끝나는 <b>특수한 경우 3가지</b>로 마쳤다. 녹음이 없어 교수님 필기본 9쪽과 LMS 영상으로 정리했다.</p>
<p class="meta"><span>교수 필기본 W4-2 9p</span><span>LMS 영상 65분</span><span>녹음 없음</span><span>4주차 · 수 · 중간 범위(Ch.3~5)</span></p>
</header>

<section class="s" data-id="s1" data-nodes="mech.moment">
<h2>1. 예제 — 점 (4, 2, 0) 에 10j N, 원점에 대한 모멘트를 두 방법으로</h2>
<p>필기 p.2: 점 \\((4,2,0)\\) m 에 위쪽 힘 \\(\\mathbf F=10\\mathbf j\\) N. 원점 O 에 대한 모멘트 \\(\\mathbf M_O\\) 를 W4-1 에서 배운 두 방법으로 구한다.</p>
{fig_ex1}
<div class="formula">\\[\\text{{방법 1}}:\\ |\\mathbf M_O|=DF=4\\ \\mathrm{{m}}\\times10\\ \\mathrm{{N}}=40\\ \\mathrm{{N\\cdot m}},\\ \\text{{반시계}}\\Rightarrow+z\\qquad \\text{{방법 2}}:\\ \\mathbf r\\times\\mathbf F=(4\\mathbf i+2\\mathbf j)\\times10\\mathbf j=40\\mathbf k+20(\\mathbf j\\times\\mathbf j)=40\\mathbf k\\]</div>
<div class="why">방법 1 에서 \\(D\\) 는 원점에서 힘의 <b>작용선</b>(\\(x=4\\) 세로선)까지의 수직거리라 4 m 다. 점까지 거리 \\(\\sqrt{{4^2+2^2}}\\) 가 아니다. 방향은 이 힘이 원점을 반시계로 돌리므로 +z(C.C.W). 방법 2 에서는 \\(\\mathbf i\\times\\mathbf j=\\mathbf k\\), \\(\\mathbf j\\times\\mathbf j=0\\)(같은 벡터끼리 외적은 0). y 성분 2 m 는 힘과 평행한 방향이라 모멘트에 기여하지 않는다 — W4-1 의 「r 은 작용선 위 아무 점」 그대로 \\(\\mathbf r=4\\mathbf i\\) 로 잡아도 같다.</div>
<div class="analogy">2D 처럼 그림이 바로 보이면 방법 1(팔 길이 × 힘)이 빠르고, 3D 처럼 수직거리가 안 보이면 방법 2(외적)가 안전하다. 두 개를 다 쓸 줄 알면 하나로 풀고 다른 하나로 검산할 수 있다.</div>
<div class="memo"><b>외울 것</b> \\(\\mathbf M_O=40\\mathbf k\\) N·m (두 방법 같음) · \\(D\\) = 작용선까지 · \\(\\mathbf j\\times\\mathbf j=0\\), \\(\\mathbf i\\times\\mathbf j=\\mathbf k\\) · 반시계 = +z</div>
</section>

<section class="s" data-id="s2" data-nodes="mech.moment mech.moment_line">
<h2>2. 바리뇽 정리 (Varignon's theorem) — 합력의 모멘트 = 각 힘 모멘트의 합</h2>
<p>필기 p.3: 작용선이 한 점 Q 에서 만나는 힘들 \\(\\mathbf F_1,\\mathbf F_2,\\dots,\\mathbf F_N\\)(<b>공점력계, concurrent system</b>)을 생각한다. 다른 점 P 에서 Q 로 가는 위치벡터 \\(\\mathbf r_{{PQ}}\\) 를 모든 힘이 같이 쓸 수 있다 — 작용선이 모두 Q 를 지나니까.</p>
{fig_var}
<div class="formula">\\[\\sum\\mathbf M_P=\\mathbf r_{{PQ}}\\times\\mathbf F_1+\\mathbf r_{{PQ}}\\times\\mathbf F_2+\\cdots+\\mathbf r_{{PQ}}\\times\\mathbf F_N=\\mathbf r_{{PQ}}\\times(\\mathbf F_1+\\cdots+\\mathbf F_N)=\\mathbf r_{{PQ}}\\times\\sum\\mathbf F\\]</div>
<div class="say">뜻(필기 빨간 글씨): <b>합력의 모멘트 = 각 힘 모멘트의 합</b>. "각각 계산해서 더해도, 합력 하나로 계산해도 결과가 같다."</div>
<div class="why">근거는 외적의 <b>분배법칙</b> 하나다. 정역학에서 이 정리를 쓰는 방식은 한 힘을 x, y, z 성분으로 쪼개는 것 — 세 성분은 같은 점에 걸린 공점력이니까. \\(M_P(\\mathbf F)=M_P(F_x)+M_P(F_y)+M_P(F_z)\\). 왜 쪼개나: <b>모멘트가 0 인 성분을 바로 날릴 수 있어서</b>(작용선이 P 를 지나거나 축과 평행한 성분). W4-1 에서 "상황 보고 쪼개라"고 한 이유가 이것.</div>
<div class="formula">\\[M_P(\\mathbf F)=M_P(F_x)+M_P(F_y)+M_P(F_z)\\]</div>
<div class="analogy">세 사람이 한 지점에 묶은 줄을 각자 당긴다. 세 사람 힘을 먼저 합쳐 한 사람 힘으로 보고 돌리는 효과를 재든, 한 명씩 재서 더하든 같다. 영수증을 품목별로 계산해 더하든 합계로 계산하든 같은 것처럼.</div>
<div class="memo"><b>외울 것</b> \\(\\sum\\mathbf M_P=\\mathbf r_{{PQ}}\\times\\sum\\mathbf F\\) (공점력, 분배법칙) · 합력의 모멘트 = 각 힘 모멘트의 합 · \\(M_P(\\mathbf F)=M_P(F_x)+M_P(F_y)+M_P(F_z)\\) · 쪼개는 이유 = 0 인 성분 날리기</div>
</section>

<section class="s" data-id="s3" data-nodes="mech.moment_line mech.projection">
<h2>3. 직선에 대한 힘의 모멘트 — M_P 중 L 과 평행한 성분</h2>
<p>필기 p.4 <b>Moment of a force about a line</b>. 직선 L 과 힘 \\(\\mathbf F\\). <b>L 위 아무 점 P</b> 를 고르고 \\(\\mathbf M_P\\) 를 구한다. F 의 L 에 대한 모멘트 = \\(\\mathbf M_P\\) 중 <b>L 에 평행한 성분</b>.</p>
{fig_proj}
<div class="formula">\\[\\mathbf M_L=(\\mathbf e\\cdot\\mathbf M_P)\\,\\mathbf e\\qquad(\\mathbf e:\\ \\text{{L 방향 단위벡터}})\\]</div>
<div class="say">교수님 질문 "<b>평행? 수직?</b>" → <b>평행</b>. 그리고 "2장 「직선에 평행·수직인 벡터 성분」 부분을 다시 확인할 것"(필기 파란 메모).</div>
<div class="why">축 L 을 "뱅글뱅글" 돌리는 모멘트는 방향(오른손 엄지)이 L 과 나란해야 한다. \\(\\mathbf M_P\\) 에서 L 과 수직인 성분은 축을 꺾으려는(베어링이 받아 주는) 몫이라 축을 돌리지 못한다. 평행한 크기는 내적 \\(\\mathbf e\\cdot\\mathbf M_P\\) 로 뽑고 방향은 \\(\\mathbf e\\) 를 붙인다 — 2장의 \\(\\mathbf U_\\parallel=(\\mathbf U\\cdot\\mathbf e)\\mathbf e\\), 즉 \\(\\mathbf M_P\\) 를 L 위에 <b>정사영(projection)</b> 한 것이다.</div>
<div class="analogy">문의 경첩 축이 L 이다. 문을 비스듬히 밀면 그 힘의 모멘트 중 경첩 축 방향 몫만 문을 돌리고, 나머지는 경첩을 위아래로 비트는 데 쓰여 경첩이 버텨 준다.</div>
<div class="memo"><b>외울 것</b> L 에 대한 모멘트 = \\(\\mathbf M_P\\)(P 는 L 위 아무 점) 의 <b>L 평행 성분</b> · \\(\\mathbf M_L=(\\mathbf e\\cdot\\mathbf M_P)\\mathbf e\\) = 정사영 · 2장 평행·수직 성분 복습</div>
</section>

<section class="s" data-id="s4" data-nodes="mech.moment_line mech.triple_product">
<h2>4. M_L = [e·(r × F)] e — 혼합삼중적 · 행렬식 · 부호</h2>
<p>\\(\\mathbf M_P=\\mathbf r\\times\\mathbf F\\) 를 넣으면 괄호 안이 3주차에 배운 <b>혼합삼중적(mixed triple product, 삼중곱)</b>이 된다. 결과는 <b>스칼라</b>이고 3×3 행렬식으로 계산한다.</p>
<div class="formula">\\[\\mathbf M_L=[\\mathbf e\\cdot(\\mathbf r\\times\\mathbf F)]\\,\\mathbf e,\\qquad \\mathbf e\\cdot(\\mathbf r\\times\\mathbf F)=\\begin{{vmatrix}}e_x&e_y&e_z\\\\r_x&r_y&r_z\\\\F_x&F_y&F_z\\end{{vmatrix}}\\]</div>
<div class="say">"<b>기억하셔야 됩니다</b>" — 행렬식. 한 줄 정리: "<b>점에 대한 모멘트는 r × F, 직선에 대한 모멘트는 삼중곱</b>."</div>
{fig_sign}
<div class="why">부호(필기 p.4): 계산값 <b>&gt; 0 이면 \\(\\mathbf M_L\\) 은 \\(\\mathbf e\\) 방향, &lt; 0 이면 \\(\\mathbf e\\) 반대 방향</b>. \\(\\mathbf e\\) 는 처음에 L 의 두 방향 중 아무 쪽으로 정해도 되고, 반대로 잡으면 값의 부호만 바뀌어 결과 벡터 \\([\\cdot]\\mathbf e\\) 는 같다. 행 순서는 \\(\\mathbf e\\) → \\(\\mathbf r\\) → \\(\\mathbf F\\) — 두 행을 바꾸면 부호가 반대(3주차).</div>
<div class="analogy">점 모멘트가 "어느 방향으로 얼마나 돌리나"의 화살표라면, 직선 모멘트는 그 화살표를 축에 비춘 그림자의 길이. 그림자가 축의 + 쪽에 생기면 양수, 반대쪽이면 음수.</div>
<div class="memo"><b>외울 것</b> \\(\\mathbf M_L=[\\mathbf e\\cdot(\\mathbf r\\times\\mathbf F)]\\mathbf e\\) · \\(\\mathbf e\\cdot(\\mathbf r\\times\\mathbf F)=\\det[\\mathbf e;\\mathbf r;\\mathbf F]\\) (스칼라) · 양수 → \\(\\mathbf e\\) 방향, 음수 → 반대 · 점은 \\(\\mathbf r\\times\\mathbf F\\), 직선은 삼중곱</div>
</section>

<section class="s" data-id="s5" data-nodes="mech.moment_line mech.triple_product">
<h2>5. 직선 위 어느 점을 골라도 같다 (Independence of the point chosen on the line)</h2>
<p>필기 p.5: L 위 다른 점 P′ 을 고르면 \\(\\mathbf r'=\\mathbf r+\\mathbf u\\) (\\(\\mathbf u\\) = P′ 에서 P 로, L 위의 벡터). 넣어서 전개한다.</p>
{fig_anyp}
<div class="formula">\\[\\mathbf M_L=[\\mathbf e\\cdot(\\mathbf r'\\times\\mathbf F)]\\mathbf e=[\\mathbf e\\cdot(\\mathbf r\\times\\mathbf F)+\\mathbf e\\cdot(\\mathbf u\\times\\mathbf F)]\\mathbf e=[\\mathbf e\\cdot(\\mathbf r\\times\\mathbf F)]\\mathbf e\\]</div>
<div class="why">\\(\\mathbf e\\cdot(\\mathbf u\\times\\mathbf F)\\) 는 세 벡터가 만드는 평행육면체의 부피다. \\(\\mathbf e\\) 와 \\(\\mathbf u\\) 가 같은 직선 위에 있어 평행하므로 상자가 납작하게 눌려 <b>부피 0</b>. 그래서 <b>\\(\\mathbf M_L\\) 은 L 위에서 고른 점과 무관</b>하다. 교수님 팁: 삼중적은 <b>행렬식</b>과 <b>평행육면체 부피</b> 두 가지로 기억해 두면 빠르다 — 두 벡터가 평행하거나 셋이 한 평면이면 계산 없이 0. 바리뇽으로 x, y, z 로 쪼개는 이유도 이렇게 0 으로 날릴 항이 생겨서.</div>
<div class="say">"<b>r 은 제일 계산하기 쉬운 점에서 잡아라.</b>"</div>
<div class="analogy">W4-1 의 「r 은 작용선 위 아무 점」과 짝이다. 점 모멘트는 <b>힘의 작용선 위</b>에서 r 의 끝을 옮겨도 같고, 직선 모멘트는 거기에 더해 <b>L 위</b>에서 r 의 시작점을 옮겨도 같다. 양쪽 끝을 다 편한 곳으로 옮길 수 있다.</div>
<div class="memo"><b>외울 것</b> \\(\\mathbf r'=\\mathbf r+\\mathbf u\\), \\(\\mathbf u\\parallel\\mathbf e\\) → \\(\\mathbf e\\cdot(\\mathbf u\\times\\mathbf F)=0\\)(부피 0) → <b>M_L 은 L 위 점 선택과 무관</b> · 0 이 많은 점을 고른다</div>
</section>

<section class="s" data-id="s6" data-nodes="mech.moment_line">
<h2>6. 예제 1 — 터빈 (교재 Fig 4.14) : M_L = aF_y k</h2>
<p>필기 p.6: 터빈이 축 L 둘레로 돈다. <b>L = z 축</b>. 축 위 점 Q 에서 힘이 걸린 점 P 까지 \\(\\mathbf r=a\\mathbf i-b\\mathbf k\\), 힘 \\(\\mathbf F=F_x\\mathbf i+F_y\\mathbf j+F_z\\mathbf k\\).</p>
{fig_turb}
<div class="formula">\\[\\mathbf M_Q=\\mathbf r\\times\\mathbf F=(a\\mathbf i-b\\mathbf k)\\times(F_x\\mathbf i+F_y\\mathbf j+F_z\\mathbf k)=bF_y\\,\\mathbf i-(aF_z+bF_x)\\,\\mathbf j+aF_y\\,\\mathbf k\\]</div>
<div class="formula">\\[\\mathbf e=\\mathbf k\\ \\Rightarrow\\ \\mathbf M_L=(\\mathbf k\\cdot\\mathbf M_Q)\\,\\mathbf k=aF_y\\,\\mathbf k\\]</div>
<div class="why">축이 z 축이면 단위벡터가 \\(\\mathbf k\\) 라서 \\(\\mathbf M_Q\\) 의 \\(\\mathbf k\\) 성분만 남는다. 결론(필기 파란 메모): <b>\\(F_x\\) 와 \\(F_z\\) 는 터빈 축에 대한 모멘트를 만들지 않는다. \\(F_y\\) 만.</b> \\(F_z\\) 는 축과 평행(밀어도 안 돈다), \\(F_x\\) 는 작용선이 축을 향해 축과 만난다(당겨도 안 돈다). 축을 돌리는 건 옆으로 치는 \\(F_y\\), 팔 길이는 축에서 P 까지 거리 \\(a\\) — 8절의 특수한 경우가 그대로 보인다.</div>
<div class="say">"옆으로 탕탕 쳐줘야 돈다." "다 풀어도 되지만 <b>aF_y 가 눈으로 바로 보이면 제일 좋다</b>. 눈으로 풀 수 있는 문제가 생각보다 많다."</div>
<div class="analogy">회전문을 돌리려면 문짝 면을 옆으로 밀어야 한다. 기둥 쪽으로 밀거나(반지름 방향) 위아래로 밀면(축 방향) 아무리 세게 해도 안 돈다.</div>
<div class="memo"><b>외울 것</b> 터빈(L = z 축): \\(\\mathbf M_Q=bF_y\\mathbf i-(aF_z+bF_x)\\mathbf j+aF_y\\mathbf k\\) → \\(\\mathbf M_L=aF_y\\mathbf k\\) · 축 모멘트는 \\(F_y\\) 만 (\\(F_x\\)·\\(F_z\\) 는 0)</div>
</section>

<section class="s" data-id="s7" data-nodes="mech.moment_line">
<h2>7. 예제 2 — 두 점으로 정한 직선 (교재 Fig 4.15) : M_L = 109 e_AB N·m</h2>
<p>필기 p.7~8: \\(\\mathbf F=10\\mathbf i+60\\mathbf j-20\\mathbf k\\) N, 작용점 Q \\((8,6,4)\\) m, 직선 L 은 A \\((2,0,4)\\) m 와 B \\((-7,6,2)\\) m 를 지난다. \\(\\mathbf M_L\\) 은?</p>
{fig_415}
<p>① <b>L 위 점 선택 → A</b> ("0 이 들어가 있어 계산이 편할 것 같아서"). \\(\\mathbf r_{{AQ}}=(8-2)\\mathbf i+(6-0)\\mathbf j+(4-4)\\mathbf k=6\\mathbf i+6\\mathbf j\\) m.</p>
<div class="formula">\\[\\text{{②}}\\ \\mathbf M_A=\\mathbf r_{{AQ}}\\times\\mathbf F=\\begin{{vmatrix}}\\mathbf i&\\mathbf j&\\mathbf k\\\\6&6&0\\\\10&60&-20\\end{{vmatrix}}=-120\\mathbf i+120\\mathbf j+300\\mathbf k\\ \\ \\mathrm{{N\\cdot m}}\\]</div>
<p>③ 방향벡터는 "나중 점에서 첫 점 빼기": \\(\\mathbf r_{{AB}}=(-7-2)\\mathbf i+(6-0)\\mathbf j+(2-4)\\mathbf k=-9\\mathbf i+6\\mathbf j-2\\mathbf k\\) m, \\(|\\mathbf r_{{AB}}|=\\sqrt{{81+36+4}}=\\sqrt{{121}}=11\\).</p>
<div class="formula">\\[\\mathbf e_{{AB}}=-\\tfrac{{9}}{{11}}\\mathbf i+\\tfrac{{6}}{{11}}\\mathbf j-\\tfrac{{2}}{{11}}\\mathbf k,\\qquad \\text{{④}}\\ \\mathbf e_{{AB}}\\cdot\\mathbf M_A=\\tfrac{{(-9)(-120)+6(120)+(-2)(300)}}{{11}}=\\tfrac{{1200}}{{11}}\\approx109\\]</div>
<div class="formula">\\[\\text{{⑤}}\\ \\mathbf M_L=109\\,\\mathbf e_{{AB}}\\ \\mathrm{{N\\cdot m}}\\ \\approx-89.3\\mathbf i+59.5\\mathbf j-19.8\\mathbf k\\ \\mathrm{{N\\cdot m}}\\]</div>
<div class="say">"<b>고민하기 싫을 땐 일단 삼중곱으로 계산할 수 있다는 건 알고 있어야 한다.</b>" · "스스로 한번 쭉 계산해 보라."</div>
<div class="why">5단계 = <b>점 선택 → r → M_P → e → 내적</b>. 값이 양수(109)라 \\(\\mathbf M_L\\) 은 \\(\\mathbf e_{{AB}}\\) 방향(A → B 쪽 축을 오른손으로 감는 회전). 정확값은 \\(1200/11=109.09\\). ②와 ④를 한 번에 하면 행렬식 \\(\\det[\\mathbf e_{{AB}};\\mathbf r_{{AQ}};\\mathbf F]\\) 하나다.</div>
<details class="ex"><summary>연습(아톰) — 같은 문제를 점 B 기준으로 (점 선택 무관 확인)</summary><div class="body"><p>\\(\\mathbf r_{{BQ}}=(8+7)\\mathbf i+(6-6)\\mathbf j+(4-2)\\mathbf k=15\\mathbf i+2\\mathbf k\\). \\(\\mathbf M_B=\\begin{{vmatrix}}\\mathbf i&\\mathbf j&\\mathbf k\\\\15&0&2\\\\10&60&-20\\end{{vmatrix}}=-120\\mathbf i+320\\mathbf j+900\\mathbf k\\) — \\(\\mathbf M_A\\) 와 다르다. 그런데 \\(\\mathbf e_{{AB}}\\cdot\\mathbf M_B=\\frac{{1080+1920-1800}}{{11}}=\\frac{{1200}}{{11}}\\approx109\\) — 같다. 점 모멘트는 점마다 다르지만, 그 L 방향 성분은 같다.</p></div></details>
<div class="analogy">요리 레시피처럼 순서를 외워 두면 어떤 숫자가 와도 손이 먼저 간다. 고민 없이 5단계를 돌리고, 시간이 남으면 8절의 특수한 경우로 눈풀이 검산.</div>
<div class="memo"><b>외울 것</b> 5단계: ① L 위 점(0 많은 점) ② \\(\\mathbf r\\) → \\(\\mathbf M_P=\\mathbf r\\times\\mathbf F\\) ③ \\(\\mathbf e=\\mathbf r_{{AB}}/|\\mathbf r_{{AB}}|\\) (B − A) ④ \\(\\mathbf e\\cdot\\mathbf M_P\\) ⑤ \\(\\mathbf M_L=(\\cdot)\\mathbf e\\) · Fig 4.15 답 \\(109\\,\\mathbf e_{{AB}}\\) N·m</div>
</section>

<section class="s" data-id="s8" data-nodes="mech.moment_line">
<h2>8. 유용한 특수한 경우 3 — 수직이면 FD, 평행이면 0, 만나면 0</h2>
<p>필기 p.9 <b>Useful special cases</b>. 계산 없이 눈으로 끝나는 경우들.</p>
{fig_spec}
<div class="formula">\\[\\text{{① 작용선이 L 을 포함하는 평면에 수직}}\\Rightarrow|\\mathbf M_L|=FD\\qquad \\text{{② 작용선}}\\parallel L\\Rightarrow\\mathbf M_L=0\\qquad \\text{{③ 작용선이 L 과 만남}}\\Rightarrow\\mathbf M_L=0\\]</div>
<div class="why">① 힘이 축을 포함하는 평면을 수직으로 뚫으면 힘 전체가 축을 돌리는 데 쓰이고, 팔 길이는 L 에서 작용선까지 거리 \\(D\\) — "외우지 않아도 보면 느껴진다". ② 축과 평행한 힘은 축을 밀기만 한다("이 힘으로는 돌려도 안 돈다"). 삼중적으로도 \\(\\mathbf F\\parallel\\mathbf e\\) 면 두 행이 비례해 행렬식 0. ③ 작용선(연장선 포함)이 L 과 만나면 그 교점을 P 로 잡을 수 있어 \\(\\mathbf r=0\\) → 0. 6절 터빈의 \\(F_z\\)(평행)·\\(F_x\\)(만남)가 바로 ②·③.</div>
<div class="say">교수님 질문 "평행한 힘의 M_L 은?", "만나는 힘의 M_L 은?" → 둘 다 0. "<b>고민을 해보셔야 됩니다, 이거.</b>"</div>
<details class="ex"><summary>연습(아톰) — x 축에 대한 모멘트: 점 (2, 4, 0) m 에 \\(\\mathbf F=3\\mathbf i+5\\mathbf j+10\\mathbf k\\) N</summary><div class="body"><p>삼중적: \\(\\mathbf e=\\mathbf i\\), \\(\\mathbf r=2\\mathbf i+4\\mathbf j\\) → \\(\\begin{{vmatrix}}1&0&0\\\\2&4&0\\\\3&5&10\\end{{vmatrix}}=1\\cdot(4\\cdot10-0\\cdot5)=40\\) → \\(\\mathbf M_L=40\\mathbf i\\) N·m. 눈풀이: \\(F_x\\) 는 x 축과 <b>평행 → 0</b>, \\(F_y\\) 의 작용선(점 \\((2,y,0)\\) 들, 즉 \\(x=2,\\ z=0\\) 인 직선)은 x 축과 \\((2,0,0)\\) 에서 <b>만남 → 0</b>, \\(F_z=10\\) N 은 x 축에서 거리 \\(y=4\\) m, 수직 → \\(4\\times10=40\\) ✓.</p></div></details>
<div class="analogy">자전거 바퀴 축을 생각하자. 축 방향으로 밀거나(평행) 바퀴살을 따라 축 중심을 향해 당기면(만남) 안 돈다. 바퀴 둘레를 옆으로 쳐야(수직) 돈다.</div>
<div class="memo"><b>외울 것</b> 특수한 경우: 수직 → \\(|\\mathbf M_L|=FD\\) · <b>평행 → 0</b> · <b>만남(연장선 포함) → 0</b> · 계산 전에 먼저 0 인 성분부터 지운다</div>
</section>

<div class="q" data-qid="q1" data-nodes="mech.moment"><div class="qn">확인 1 · 점 모멘트 예제 (필기 p.2)</div><div class="qb">점 \\((4,2,0)\\) m 에 \\(\\mathbf F=10\\mathbf j\\) N 이 작용한다. 원점에 대한 모멘트 \\(\\mathbf M_O\\) 는?</div><ol class="choices"><li data-ok="1">\\(40\\mathbf k\\) N·m</li><li>\\(-40\\mathbf k\\) N·m</li><li>\\(20\\mathbf k\\) N·m</li><li>\\(10\\sqrt{{20}}\\,\\mathbf k\\) N·m</li></ol><div class="ans">\\((4\\mathbf i+2\\mathbf j)\\times10\\mathbf j=40\\mathbf k+20(\\mathbf j\\times\\mathbf j)=40\\mathbf k\\). 수직거리 4 m × 10 N, 반시계라 +z. 점까지 거리 \\(\\sqrt{{20}}\\) 를 곱하면 틀린다.</div></div>
<div class="q" data-qid="q2" data-nodes="mech.moment mech.moment_line"><div class="qn">확인 2 · 바리뇽 정리</div><div class="qb">한 점에서 만나는 힘들에 대한 바리뇽 정리 \\(\\sum\\mathbf M_P=\\mathbf r_{{PQ}}\\times\\sum\\mathbf F\\) 의 뜻은?</div><ol class="choices"><li data-ok="1">합력의 모멘트 = 각 힘 모멘트의 합 (그래서 성분으로 쪼개 계산해도 된다)</li><li>모멘트의 합은 항상 0 이다</li><li>힘의 합은 모멘트와 무관하다</li><li>한 점에서 만나는 힘들은 모멘트를 만들지 않는다</li></ol><div class="ans">외적의 분배법칙. \\(M_P(\\mathbf F)=M_P(F_x)+M_P(F_y)+M_P(F_z)\\) — 0 인 성분을 바로 날리려고 쪼갠다.</div></div>
<div class="q" data-qid="q3" data-nodes="mech.moment_line mech.projection"><div class="qn">확인 3 · 직선 모멘트의 정의 (교수님 질문)</div><div class="qb">힘 F 의 직선 L 에 대한 모멘트는 L 위 점 P 의 \\(\\mathbf M_P\\) 의 어떤 성분인가?</div><ol class="choices"><li data-ok="1">L 에 평행한 성분 \\((\\mathbf e\\cdot\\mathbf M_P)\\mathbf e\\)</li><li>L 에 수직한 성분</li><li>\\(\\mathbf M_P\\) 전체</li><li>\\(\\mathbf F\\) 의 L 방향 성분</li></ol><div class="ans">축을 돌리는 모멘트는 방향이 축과 나란해야 한다. \\(\\mathbf M_P\\) 를 L 위로 정사영한 것.</div></div>
<div class="q" data-qid="q4" data-nodes="mech.moment_line mech.triple_product"><div class="qn">확인 4 · 삼중적의 부호</div><div class="qb">\\(\\mathbf e\\cdot(\\mathbf r\\times\\mathbf F)=-30\\) N·m 이 나왔다. \\(\\mathbf M_L\\) 은?</div><ol class="choices"><li data-ok="1">크기 30 N·m, \\(\\mathbf e\\) 와 반대 방향</li><li>크기 30 N·m, \\(\\mathbf e\\) 방향</li><li>계산이 틀렸다 — 크기는 음수가 될 수 없다</li><li>0</li></ol><div class="ans">\\(\\mathbf M_L=-30\\,\\mathbf e\\). 값이 음수면 \\(\\mathbf e\\) 반대 방향. \\(\\mathbf e\\) 를 반대로 잡았다면 +30 이 나와 같은 벡터.</div></div>
<div class="q" data-qid="q5" data-nodes="mech.moment_line mech.triple_product"><div class="qn">확인 5 · 점 선택 무관</div><div class="qb">L 위 다른 점을 골라도 \\(\\mathbf M_L\\) 이 같은 이유는?</div><ol class="choices"><li data-ok="1">\\(\\mathbf u\\)(L 위의 벡터)가 \\(\\mathbf e\\) 와 평행해서 \\(\\mathbf e\\cdot(\\mathbf u\\times\\mathbf F)\\) = 평행육면체 부피 0</li><li>\\(\\mathbf u\\) 가 \\(\\mathbf F\\) 와 평행해서</li><li>\\(\\mathbf M_P\\) 가 점마다 같아서</li><li>\\(\\mathbf F\\) 가 L 과 수직이라서</li></ol><div class="ans">\\(\\mathbf M_P\\) 자체는 점마다 다르다(7절 연습: \\(\\mathbf M_A\\ne\\mathbf M_B\\)). L 방향 성분만 같다.</div></div>
<div class="q" data-qid="q6" data-nodes="mech.moment_line"><div class="qn">확인 6 · 터빈 (교재 Fig 4.14)</div><div class="qb">z 축 둘레로 도는 터빈에서 \\(\\mathbf r=a\\mathbf i-b\\mathbf k\\), \\(\\mathbf F=F_x\\mathbf i+F_y\\mathbf j+F_z\\mathbf k\\). 축에 대한 모멘트 \\(\\mathbf M_L\\) 은?</div><ol class="choices"><li data-ok="1">\\(aF_y\\,\\mathbf k\\)</li><li>\\(bF_y\\,\\mathbf k\\)</li><li>\\(-(aF_z+bF_x)\\,\\mathbf k\\)</li><li>\\((aF_y+bF_x)\\,\\mathbf k\\)</li></ol><div class="ans">\\(\\mathbf M_Q\\) 의 \\(\\mathbf k\\) 성분 \\(aF_y\\). \\(F_z\\) 는 축과 평행, \\(F_x\\) 는 축과 만나서 0.</div></div>
<div class="q" data-qid="q7" data-nodes="mech.moment_line"><div class="qn">확인 7 · 교재 Fig 4.15</div><div class="qb">\\(\\mathbf F=10\\mathbf i+60\\mathbf j-20\\mathbf k\\) N 이 Q \\((8,6,4)\\) m 에, 직선 L 은 A \\((2,0,4)\\), B \\((-7,6,2)\\) m 를 지난다. \\(\\mathbf M_L\\) 은?</div><ol class="choices"><li data-ok="1">\\(\\approx109\\,\\mathbf e_{{AB}}\\) N·m</li><li>\\(300\\,\\mathbf e_{{AB}}\\) N·m</li><li>\\(1200\\,\\mathbf e_{{AB}}\\) N·m</li><li>\\(-120\\mathbf i+120\\mathbf j+300\\mathbf k\\) N·m</li></ol><div class="ans">\\(\\mathbf M_A=-120\\mathbf i+120\\mathbf j+300\\mathbf k\\) 는 점 A 에 대한 모멘트(4번). 여기에 \\(\\mathbf e_{{AB}}=(-9,6,-2)/11\\) 을 내적하면 \\(1200/11\\approx109\\). 11 로 나누는 것을 잊으면 1200(3번).</div></div>
<div class="q" data-qid="q8" data-nodes="mech.moment_line"><div class="qn">확인 8 · 특수한 경우 (교수님 질문)</div><div class="qb">힘의 작용선(연장선 포함)이 직선 L 과 한 점에서 만난다. \\(\\mathbf M_L\\) 은?</div><ol class="choices"><li data-ok="1">0</li><li>\\(F\\times\\) (교점까지 거리)</li><li>\\(F\\) 의 L 방향 성분 × 거리</li><li>점을 어디로 잡느냐에 따라 다르다</li></ol><div class="ans">교점을 L 위의 점으로 잡으면 \\(\\mathbf r=0\\). L 과 평행해도 0, 평면에 수직이면 \\(FD\\). "고민을 해보셔야 됩니다, 이거."</div></div>
<div class="q" data-qid="q9" data-nodes="mech.moment_line mech.triple_product"><div class="qn">확인 9 · x 축에 대한 모멘트 (연습)</div><div class="qb">점 \\((2,4,0)\\) m 에 \\(\\mathbf F=3\\mathbf i+5\\mathbf j+10\\mathbf k\\) N 이 작용한다. x 축에 대한 모멘트 \\(\\mathbf M_L\\) 을 삼중적으로 구하고, 특수한 경우로 검산하라.</div><div class="ans">\\(\\det[\\mathbf i;\\ 2\\mathbf i+4\\mathbf j;\\ \\mathbf F]=1\\cdot(4\\cdot10-0\\cdot5)=40\\) → \\(\\mathbf M_L=40\\mathbf i\\) N·m. 검산: \\(F_x\\) 평행 → 0, \\(F_y\\) 작용선이 x 축과 만남 → 0, \\(F_z\\) 는 거리 4 m 에서 수직 → 40.</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
