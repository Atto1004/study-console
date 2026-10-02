# -*- coding: utf-8 -*-
"""미분적분학2 · 2026-10-01 수업 노트 (근거: 2026-10-01/정리.md — 판서 9장(09:38~10:17) + 녹음 69분(09:11~) + 대표님 누적 필기 p.27 하단~p.28 + 교재 Stewart 12.5 Example 1·2·4).
섹션 순서 = 수업 순서: 복습 → ③ 두 점 직선 유도(판서 사진 전 구간 — 필기 p.27 하단·녹음 04:04~17:36) → 판서 1·2 Ex01 → 판서 3·4 Ex02 ① → 판서 5 Ex02 ② → 판서 6·7 평면 정의 → 판서 8·9 평면 방정식
본문은 raw 문자열(역슬래시 그대로) — 그림은 {FIG:이름} 자리에 끼운다."""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\미분적분학2\_수업노트\2026-10-01.html"
F = {}

# ③ 두 점 P1, P2 를 지나는 직선 (필기 p.27 하단)
ox, oy = 80, 160
P1 = (150, 122); P2 = (226, 84)
F["two"] = canvas(560, 262,
    step(1, axes3d(ox, oy, 84), text(ox + 6, oy + 20, "O", 13, INK),
        line(118, 138, 262, 66, RED, 2.2), dot(P1[0], P1[1], "", 5, BLUE), dot(P2[0], P2[1], "", 5, BLUE),
        text(144, 144, "P₁", 13, BLUE, "end"), text(232, 104, "P₂", 13, BLUE)),
    step(2, arrow(P1[0], P1[1], P2[0], P2[1], GREEN, "", 3), text(176, 84, "P₁P₂", 13, GREEN, "end", True)),
    step(3, text(290, 36, "P₁ 을 지나고 v⃗ = (A, B, C) 에 평행", 12.5, INK),
        text(290, 60, "(x−x₁)/A = (y−y₁)/B = (z−z₁)/C = t", 12.5, INK)),
    step(4, text(290, 96, "P₂ 도 그 직선 위 → x 자리에 x₂ …", 12.5, INK),
        text(290, 120, "(x₂−x₁)/A = (y₂−y₁)/B = (z₂−z₁)/C = t", 12.5, INK)),
    step(5, text(280, 196, "(x−x₁)/(x₂−x₁) = (y−y₁)/(y₂−y₁) = (z−z₁)/(z₂−z₁) (= t)", 13, RED, "middle", True),
        text(280, 172, "두 식을 나누면 A, B, C 가 약분된다", 12, GRAY, "middle")),
    step(6, text(280, 232, "분모 (x₂−x₁, y₂−y₁, z₂−z₁) = 벡터 P₁P₂ 의 성분 = 방향벡터", 12.5, GREEN, "middle", True)),
    cap="③ 두 점을 지나는 직선 — 한 점 P₁ 을 지나는 직선의 식에 P₂ 를 넣어 보면, 방향벡터 자리에 P₁P₂ 가 들어간다(필기 p.27 하단).", name="two")

# 판서 1·2 Ex01 — P0(5,1,3), v=(1,4,-2)
ox, oy = 80, 150
P0 = (160, 95); dv = (40.8, 30)
F["ex01"] = canvas(560, 222,
    step(1, axes3d(ox, oy, 90), text(ox + 6, oy + 20, "O", 13, INK),
        dot(P0[0], P0[1], "", 5, BLUE), text(166, 80, "P₀(5, 1, 3)", 12.5, BLUE)),
    step(2, arrow(ox, oy, round(ox + dv[0], 1), round(oy + dv[1], 1), YEL, "", 3), text(128, 200, "v⃗ = (1, 4, −2)", 12.5, YEL, "start", True)),
    step(3, line(round(P0[0] - 1.3 * dv[0], 1), round(P0[1] - 1.3 * dv[1], 1), round(P0[0] + 1.6 * dv[0], 1), round(P0[1] + 1.6 * dv[1], 1), RED, 2.2),
        text(262, 36, "① 매개 : x = 5 + t, y = 1 + 4t, z = 3 − 2t", 12.5, RED, "start", True),
        text(262, 62, "② 대칭 : (x−5)/1 = (y−1)/4 = (z−3)/(−2)", 12.5, RED, "start", True)),
    step(4, dot(round(P0[0] + dv[0], 1), round(P0[1] + dv[1], 1), "", 4, GREEN), dot(round(P0[0] - dv[0], 1), round(P0[1] - dv[1], 1), "", 4, GREEN),
        text(208, 118, "t = 1", 12, GREEN), text(128, 56, "t = −1", 12, GREEN),
        text(262, 104, "t = 1 → (6, 5, 1)", 13, GREEN), text(262, 128, "t = −1 → (4, −3, 5)", 13, GREEN),
        text(262, 154, "t = 0 은 P₀ 자기 자신 — 주지 않는다", 12, GRAY)),
    cap="판서 1·2 Ex01. P₀ 를 지나고 v 와 평행하게 그은 선이 그 직선. 직선 위 다른 점은 t 값만 바꾼다.", name="ex01")

# 판서 3·4 Ex02 — P1(2,4,-3), P2(3,-1,1)
ox, oy = 70, 170
Q1 = (230, 160); Q2 = (163, 118)
F["ex02"] = canvas(560, 214,
    step(1, axes3d(ox, oy, 90), text(ox + 6, oy + 20, "O", 13, INK),
        dot(Q1[0], Q1[1], "", 5, BLUE), dot(Q2[0], Q2[1], "", 5, BLUE),
        text(240, 190, "P₁(2, 4, −3)", 12.5, BLUE), text(170, 104, "P₂(3, −1, 1)", 12.5, BLUE)),
    step(2, arrow(Q1[0], Q1[1], Q2[0], Q2[1], GREEN, "", 3), text(206, 134, "P₁P₂", 13, GREEN, "start", True),
        text(280, 36, "P₁P₂ = OP₂ − OP₁", 12.5, GREEN, "start", True), text(280, 60, "= (3−2, −1−4, 1+3) = (1, −5, 4) = v⃗", 12.5, GREEN)),
    step(3, line(252, 173.8, 110, 85, RED, 2.2),
        text(280, 104, "매개 : x = 2 + t, y = 4 − 5t, z = −3 + 4t", 12, RED, "start", True),
        text(280, 128, "대칭 : (x−2)/1 = (y−4)/(−5) = (z+3)/4", 12, RED, "start", True)),
    cap="판서 3·4 Ex02. 방향벡터가 주어지지 않으면 두 점으로 벡터 P₁P₂ 를 만들어 v 로 선언한다(종점 − 시점).", name="ex02")

# 판서 5 Ex02 ② xy평면과 만나는 점
F["xy"] = canvas(560, 172,
    step(1, fbox(14, 16, 150, 58, "xy평면 ⇔ z = 0", INK, sub="매개방정식 z = −3 + 4t 에", size=13.5)),
    step(2, arrow(166, 45, 190, 45, GREEN, "", 2), fbox(194, 16, 150, 58, "−3 + 4t = 0", BLUE, sub="∴ t = 3/4", size=14)),
    step(3, arrow(346, 45, 370, 45, GREEN, "", 2), fbox(374, 16, 172, 58, "x = 2 + 3/4 = 11/4", BLUE, sub="y = 4 − 5·(3/4) = 1/4", size=13)),
    step(4, fbox(140, 96, 280, 44, "직선은 점 (11/4, 1/4, 0) 에서 xy평면과 만남", RED, size=13)),
    step(5, text(280, 162, "같은 방법 : yz평면 = x = 0 · zx평면 = y = 0", 12, GRAY, "middle")),
    cap="판서 5. 평면과 만나는 점 = 그 평면의 조건(z = 0)을 매개방정식에 넣어 t 를 구하고, t 를 다시 넣는다.", name="xy")

# 판서 6·7 평면 — 점 P0 + 법선벡터 n
Pp = (170, 158); Pq = (246, 140)
F["plane"] = canvas(560, 214,
    step(1, path("M60 190 L 240 190 L 300 126 L 120 126 Z", YEL, 1.6, "rgba(245,159,0,.12)"),
        dot(Pp[0], Pp[1], "", 5, GREEN), text(162, 178, "P₀(x₀, y₀, z₀)", 12.5, GREEN, "end"),
        text(320, 40, "한 점 P₀ 를 지나고", 13, INK), text(320, 62, "영벡터 아닌 n⃗ = (A, B, C) 에 수직인 평면", 13, INK)),
    step(2, arrow(Pp[0], Pp[1], Pp[0], 46, RED, "", 3), text(180, 56, "n⃗ = (A, B, C)", 13, RED, "start", True),
        text(320, 96, "n⃗ : 법선벡터 (normal vector)", 13, RED, "start", True), text(320, 118, "A, B, C : 평면의 방향비", 12.5, GRAY)),
    step(3, dot(Pq[0], Pq[1], "", 5, BLUE), text(256, 116, "P(x, y, z)", 12.5, BLUE),
        arrow(Pp[0], Pp[1], Pq[0], Pq[1], BLUE, "", 2.6), polyline([(170, 146), (181.7, 143.2), (181.7, 155.2)], INK, 1.2),
        text(320, 152, "평면 위 아무 점 P → P₀P⃗ ⊥ n⃗", 13, BLUE, "start", True)),
    cap="판서 6·7. 직선은 「v 에 평행」, 평면은 「n 에 수직」. P₀ 를 품은 평면은 무수히 많고, 그중 n 과 수직인 것 하나.", name="plane")

# 판서 8·9 평면의 방정식 유도
F["deriv"] = canvas(560, 186,
    step(1, fbox(14, 14, 180, 60, "P₀P⃗ · n⃗ = 0", INK, sub="수직 ⇔ 내적 0", size=14)),
    step(2, arrow(196, 44, 220, 44, GREEN, "", 2), fbox(224, 14, 322, 60, "(x−x₀, y−y₀, z−z₀) · (A, B, C) = 0", BLUE, size=13.5)),
    step(3, fbox(14, 104, 290, 60, "A(x−x₀) + B(y−y₀) + C(z−z₀) = 0", RED, sub="성분끼리 곱해 더함", size=13.5)),
    step(4, arrow(306, 134, 330, 134, GREEN, "", 2), fbox(334, 104, 212, 60, "Ax + By + Cz = D", RED, sub="D = Ax₀ + By₀ + Cz₀", size=15)),
    cap="판서 8·9. 수직 → 내적 0 → 전개. 상수를 오른쪽으로 넘기면 Ax + By + Cz = D (or Ax + By + Cz + D = 0).", name="deriv")

html = r'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>미분적분학2 · 10/1 두 점을 지나는 직선 · Ex01 · Ex02 · 평면의 방정식</title></head><body>
<header>
<h1>12.5 두 점을 지나는 직선 · Ex01 · Ex02 → 평면의 방정식 (법선벡터)</h1>
<p class="lead">9/29의 「한 점 P₀ + 방향벡터 \(\vec v\)」 직선을 복습하고, <b>③ 두 점 P₁, P₂를 지나는 직선</b>은 새 공식이 아니라 방향벡터 자리에 \(\overrightarrow{P_1P_2}\)를 넣은 것임을 유도했다. 교재 예제 그대로 <b>Ex01</b>(한 점 + 방향벡터, 직선 위 다른 두 점)과 <b>Ex02</b>(두 점, xy평면과 만나는 점)를 풀고, 마지막 15분에 <b>평면</b> — 한 점 P₀와 법선벡터 \(\vec n=(A,B,C)\)로 \(A(x-x_0)+B(y-y_0)+C(z-z_0)=0\). 교수님: 「직선의 방정식에서 중간고사 한 문제」.</p>
<p class="meta"><span>판서 9장 (09:38~10:17)</span><span>녹음 69분 (09:11~) · 필기 p.27~28</span><span>교재 12.5 Example 1·2</span><span>5주차 · 목</span></p>
</header>

<section class="s" data-id="s1" data-nodes="vec.line_eq vec.position_ops">
<h2>1. 복습 → ③ 두 점 P₁, P₂를 지나는 직선 — 방향벡터 = \(\overrightarrow{P_1P_2}\) (필기 p.27 하단)</h2>
{FIG:two}
<p>복습: 점 P₀(x₀,y₀,z₀)를 지나고 \(\vec v=(A,B,C)\)에 평행한 직선은 매개방정식 \(x=x_0+tA,\ y=y_0+tB,\ z=z_0+tC\), 대칭방정식 \(\frac{x-x_0}{A}=\frac{y-y_0}{B}=\frac{z-z_0}{C}\ (=t)\). 대칭방정식은 「세 비율이 모두 같은 값 t」라는 뜻이다. 공식을 쓰기 전에 ① 지나는 점 P₀와 ② 방향벡터 \(\vec v\)를 먼저 <b>선언</b>한다. 이날 판서 사진은 Ex01부터라, 이 절은 대표님 필기(p.27 하단)와 녹음으로 복원했다.</p>
<div class="formula">\[\frac{x-x_1}{A}=\frac{y-y_1}{B}=\frac{z-z_1}{C}=t,\quad \frac{x_2-x_1}{A}=\frac{y_2-y_1}{B}=\frac{z_2-z_1}{C}=t\ \Rightarrow\ \frac{x-x_1}{x_2-x_1}=\frac{y-y_1}{y_2-y_1}=\frac{z-z_1}{z_2-z_1}\ (=t)\]</div>
<div class="why">공간의 두 점 P₁(x₁,y₁,z₁), P₂(x₂,y₂,z₂)를 지나는 직선. 둘 중 아무 점(P₁)을 「지나는 점」으로 잡고, 방향벡터 \(\vec v=(A,B,C)\)에 평행하다고 하면 ②의 대칭방정식을 그대로 쓴다(교수님은 매개보다 대칭방정식이 편해서 선호). P₂도 이 직선 위에 있으니 x, y, z 자리에 x₂, y₂, z₂를 넣어도 성립한다. 두 식을 나란히 놓고 같은 칸끼리 나누면 A, B, C가 약분되어 위 식이 된다(필기의 사선 표시). 분모 \(x_2-x_1,\ y_2-y_1,\ z_2-z_1\)은 「종점 − 시점」, 곧 \(\overrightarrow{P_1P_2}\)의 성분이다. 결론: <b>두 점 직선 = 한 점 P₁ + 방향벡터 자리에 \(\overrightarrow{P_1P_2}\)</b>. 방향벡터를 몰라도 \(\overrightarrow{P_1P_2}\)를 구하면 그것이 방향벡터다. P₂를 지나는 점으로 잡아도 되지만, 그때는 분자도 \(x-x_2\) … 로 바꿔 시점·종점을 맞춘다.</div>
<div class="say">(02:34·15:25) 「대학에서는 <b>모든 과정은 풀이 과정</b>이 있어야 돼요」 · 두 점을 공식에 바로 넣고 계산하면 「<b>빵점 처리</b> … 그런 공식은 세상에 없어요. 이해를 해야 돼」. (14:19) 실제 시험은 방향벡터를 주지 않고 「두 점 P₁, P₂를 지나는 직선의 방정식을 구하라」만 나온다.</div>
<div class="analogy">두 역을 지나는 기찻길 — 첫 역에서 둘째 역을 바라보는 방향(\(\overrightarrow{P_1P_2}\))이 곧 선로 방향이다. 새 규칙이 필요 없다.</div>
<div class="memo"><b>외울 것</b> 두 점 직선 = P₁ + \(\vec v=\overrightarrow{P_1P_2}=\overrightarrow{OP_2}-\overrightarrow{OP_1}\) · 공식에 바로 넣지 말고 방향벡터를 선언 · 선언 순서: 지나는 점 → 방향벡터 → 매개 → 대칭</div>
</section>

<section class="s" data-id="s2" data-nodes="vec.line_eq">
<h2>2. Ex01 — 점 (5,1,3)을 지나고 방향벡터 (1,4,−2)에 평행한 직선 (판서 1·2) ★</h2>
{FIG:ex01}
<div class="say">(18:47) 「<b>직선의 방정식에서 중간고사 한 문제 출제할 예정</b>이니까, 첫 번째 케이스(한 점 + 방향벡터)가 되든 두 번째 케이스(두 점)가 되든 둘 중에 하나가 나온다는 것을 염두에 두시라.」 → 바로 Ex01·Ex02(교재 Example 1·2).</div>
<div class="formula">\[P_0(5,1,3),\ \vec v=(1,4,-2)\ \Rightarrow\ x=5+t,\ y=1+4t,\ z=3-2t\ (\text{매개}),\qquad \frac{x-5}{1}=\frac{y-1}{4}=\frac{z-3}{-2}\ (=t)\ (\text{대칭})\]</div>
<div class="why">문제: ① 매개·대칭방정식 ② 이 직선 위의 다른 두 점. sol ① i) 선언부터: <b>P₀(5,1,3)</b>을 지나고 <b>\(\vec v=(1,4,-2)\)</b>에 평행(위에 x₀ y₀ z₀ / A B C 표시는 안 써도 되지만 선언은 해야 한다). 매개: \(x=5+1\cdot t\), \(y=1+4t\), \(z=3+(-2)t=3-2t\). 대칭: 분자 \(x-5,\ y-1,\ z-3\), 분모 1, 4, −2 — 분모의 음수는 괄호째 둔다. 그림: 원점에서 (1,4,−2)로 가는 화살표를 대충 그리고, P₀를 지나 그 화살표와 평행하게 그은 선이 이 직선. ② 다른 점은 <b>t 값만 바꾼다</b>(매개방정식에 넣는 게 편하다). t = 0은 P₀ 자기 자신이라 의미가 없으니 0에 가까운 1, −1: t = 1 → (5+1, 1+4, 3−2) = <b>(6, 5, 1)</b>, t = −1 → (5−1, 1−4, 3+2) = <b>(4, −3, 5)</b>. 필기·교재와 같은 답.</div>
<div class="say">(21:41~22:49 · 69:06) 「<b>벡터는 무조건 위에 화살표</b>」 — 교재의 굵은 글씨 v는 컴퓨터만 가능, 손으로 쓸 때 화살표가 없으면 「그냥 알파벳 v」. (33:29) 「값만 구하는 게 아니라 이 그림을 이해해야 돼요」.</div>
<div class="analogy">출발역 (5,1,3)에서 (1,4,−2) 방향 선로를 탄다 — t = 1은 한 정거장 앞, t = −1은 한 정거장 뒤.</div>
<div class="memo"><b>외울 것</b> Ex01 매개 \(x=5+t,\ y=1+4t,\ z=3-2t\) · 대칭 \(\frac{x-5}{1}=\frac{y-1}{4}=\frac{z-3}{-2}\) · 다른 점 t = ±1 → (6,5,1), (4,−3,5) · t = 0 금지 · 벡터는 화살표</div>
</section>

<section class="s" data-id="s3" data-nodes="vec.line_eq vec.position_ops">
<h2>3. Ex02 ① — 두 점 (2,4,−3), (3,−1,1)을 지나는 직선 (판서 3·4) ★</h2>
{FIG:ex02}
<div class="formula">\[\overrightarrow{P_1P_2}=\overrightarrow{OP_2}-\overrightarrow{OP_1}=(1,-5,4)=\vec v\ \Rightarrow\ x=2+t,\ y=4-5t,\ z=-3+4t,\qquad \frac{x-2}{1}=\frac{y-4}{-5}=\frac{z+3}{4}\ (=t)\]</div>
<div class="why">문제: ① 매개·대칭방정식 ② 이 직선이 xy평면과 만나는 점. 「방향벡터라는 말이 없다」 — 여기서 공식에 두 점을 그냥 넣으면 감점이다. sol ① i) 두 점에 이름을 붙인다: P₁(2,4,−3), P₂(3,−1,1)(A, B여도 된다). P₁을 시점, P₂를 종점으로 \(\overrightarrow{P_1P_2}=(3-2,\ -1-4,\ 1-(-3))=(1,-5,4)\) — 이것을 <b>방향벡터 \(\vec v\)로 선언</b>한다. P₂를 시점으로 잡으면 \(\overrightarrow{P_2P_1}=(-1,5,-4)\), 방향만 반대이고 같은 직선이다. ii) P₁을 지나고 \(\vec v\)에 평행 → 매개 \(x=2+t,\ y=4-5t,\ z=-3+4t\), 대칭 \(\frac{x-2}{1}=\frac{y-4}{-5}=\frac{z+3}{4}\). \(z-(-3)=z+3\)으로 정리한다. 교재 Example 2와 같은 답.</div>
<div class="say">(44:53) 「1번은 방향벡터가 주어졌고 2번은 안 주어졌다. <b>두 점을 지나는 걸 다이렉트로 하면 안 돼. 반드시 방향벡터를 언급</b>해야 돼.」 (34:38) 「나중에 빵점 처리, 들어주는 거 없어」.</div>
<div class="analogy">지도에 두 지점만 찍혀 있으면, 먼저 「첫 지점에서 둘째 지점으로 가는 화살표」를 그려 방향을 만든 다음 길을 설명한다.</div>
<div class="memo"><b>외울 것</b> 두 점 → \(\vec v=\overrightarrow{P_1P_2}=(1,-5,4)\) 선언 → 매개 \(x=2+t,\ y=4-5t,\ z=-3+4t\) → 대칭 \(\frac{x-2}{1}=\frac{y-4}{-5}=\frac{z+3}{4}\)</div>
</section>

<section class="s" data-id="s4" data-nodes="vec.line_eq">
<h2>4. Ex02 ② — 직선이 xy평면과 만나는 점 (판서 5)</h2>
{FIG:xy}
<div class="formula">\[z=0:\ -3+4t=0\ \Rightarrow\ t=\frac34\ \Rightarrow\ x=2+\frac34=\frac{11}{4},\quad y=4-5\cdot\frac34=\frac{16-15}{4}=\frac14\ \Rightarrow\ \left(\frac{11}{4},\ \frac14,\ 0\right)\]</div>
<div class="why">xy평면은 높이가 0인 바닥, 곧 <b>z = 0</b>인 점들이다. 직선 위 점은 t 하나로 정해지니, z = 0이 되는 t를 먼저 찾는다: \(-3+4t=0\), \(t=3/4\). 이 t를 x, y에 넣으면 \(x=2+3/4=11/4\), \(y=4-15/4=1/4\)(판서 여백의 16 − 15 = 16/4 − 15/4). 그래서 직선은 점 \((11/4,\ 1/4,\ 0)\)에서 xy평면과 만난다. 대칭방정식에 z = 0을 넣어도 같은 답이 나온다(교재는 이 방법도 보여 준다): \(\frac{x-2}{1}=\frac{3}{4}\), \(\frac{y-4}{-5}=\frac34\). 같은 방법으로 yz평면은 x = 0, zx평면은 y = 0을 넣는다.</div>
<div class="analogy">비탈길을 내려오는 공이 바닥(z = 0)에 닿는 순간의 시각 t를 먼저 구하고, 그 시각의 x, y를 읽는다.</div>
<div class="memo"><b>외울 것</b> xy평면 z = 0 · yz평면 x = 0 · zx평면 y = 0 · 조건 → t → 다시 대입 · Ex02 답 \((11/4,\ 1/4,\ 0)\)</div>
</section>

<section class="s" data-id="s5" data-nodes="vec.plane_eq">
<h2>5. 2) Planes — 한 점 P₀ + 법선벡터 \(\vec n=(A,B,C)\) (판서 6·7) ★</h2>
{FIG:plane}
<p>직선은 방향벡터가 있어야 정해졌다. 평면은 무엇이 필요한가 — 한 점 P₀(x₀,y₀,z₀)와 <b>영벡터가 아닌</b> 벡터 \(\vec n=(A,B,C)\). 직선의 \(\vec v\)는 직선을 만드는 방향이고, 평면의 \(\vec n\)은 평면에 <b>수직</b>으로 서서 평면의 기울기를 정하는 벡터, 곧 <b>법선벡터</b>(normal vector)다. A, B, C는 평면의 방향비라 부른다(판서에서 A, B, C 아래 「≠0」은 \(\vec n\ne\vec0\)의 뜻).</p>
<div class="formula">\[P_0(x_0,y_0,z_0),\ \vec n=(A,B,C)\ne\vec 0\qquad P(x,y,z)\ \text{가 평면 위}\ \Leftrightarrow\ \overrightarrow{P_0P}\perp\vec n\]</div>
<div class="why">「P₀를 지나고 \(\vec n\)에 <b>수직인</b> 평면의 방정식」을 유도한다. 직선은 「\(\vec v\)에 평행」, 평면은 「\(\vec n\)에 수직」이라 처음엔 와닿지 않는다. 그림으로 보면: P₀를 품은 평면은 P₀를 축으로 빙글빙글 돌려 무수히 많이 만들 수 있다. 그중 \(\vec n\)(P₀를 시점으로 세운 화살표)과 직각을 이루는 것이 딱 하나다. 평면 위에 아무 점 P(x, y, z)를 잡아 \(\overrightarrow{P_0P}\)를 만들면, 이 벡터는 평면 안에 누워 있으니 \(\vec n\)과 수직이다. 반대로 \(\overrightarrow{P_0P}\perp\vec n\)인 점 P는 모두 그 평면 위에 있다.</div>
<div class="say">(51:19) 「중간고사 한 문제 후보 얘기했어요. 1번, 2번 뭐가 좀 더 어려울까, 뭐가 의미가 있을까 찾아보라」. 평면 유도 직전 「이건 그림을 잘 보세요 … <b>시험 문제 한 문제</b>를 낼 …」 — 「평면의 방정식에서도 한 문제」로 읽히지만 녹음이 불분명하다 [확인 못 함]. 「이 설명만 잘 들으면 직선·평면 응용 문제가 많아도 외우지 않고 풀 수 있다」.</div>
<div class="analogy">탁자(평면) 한가운데에 꽂은 깃대(\(\vec n\)) — 탁자 위 어느 방향으로 그은 선도 깃대와 직각이다. 깃대 방향과 꽂은 자리(P₀)만 알면 탁자가 정해진다.</div>
<div class="memo"><b>외울 것</b> 평면 = 점 P₀ + 법선벡터 \(\vec n=(A,B,C)\ne\vec0\) · 직선은 \(\vec v\)에 평행, 평면은 \(\vec n\)에 수직 · 평면 위 P → \(\overrightarrow{P_0P}\perp\vec n\)</div>
</section>

<section class="s" data-id="s6" data-nodes="vec.plane_eq vec.dot_calc2">
<h2>6. 평면의 방정식 유도 — 내적 0 → \(Ax+By+Cz=D\) (판서 8·9) ★</h2>
{FIG:deriv}
<div class="formula">\[\overrightarrow{P_0P}\cdot\vec n=0\ \Leftrightarrow\ (x-x_0,\ y-y_0,\ z-z_0)\cdot(A,B,C)=0\ \Leftrightarrow\ A(x-x_0)+B(y-y_0)+C(z-z_0)=0\]</div>
<div class="formula">\[\Leftrightarrow\ Ax+By+Cz=D,\quad D=Ax_0+By_0+Cz_0\qquad (\text{or }Ax+By+Cz+D=0)\]</div>
<div class="why">두 벡터가 수직 ⇔ <b>내적 = 0</b>(9/22 [Th 2]). \(\overrightarrow{P_0P}=(x-x_0,\ y-y_0,\ z-z_0)\)와 \(\vec n=(A,B,C)\)를 성분끼리 곱해 더하면 \(A(x-x_0)+B(y-y_0)+C(z-z_0)=0\) — 교수님은 A, B, C를 앞에 쓰기를 권한다. 괄호를 풀면 \(Ax+By+Cz-Ax_0-By_0-Cz_0=0\)이고, 상수(x, y, z가 없는 항)를 오른쪽으로 넘기면 <b>\(Ax+By+Cz=D\)</b>, \(D=Ax_0+By_0+Cz_0\). 상수를 왼쪽에 모아 \(Ax+By+Cz+D=0\)으로 쓰기도 한다 — 이때 D는 부호가 바뀐 값이지만 「플러스 마이너스는 신경 쓰지 마」, 교수님은 앞의 꼴을 선호. 핵심: <b>x, y, z의 계수 (A, B, C) = 법선벡터</b>. 예(교재 Example 4): 점 (2,4,−1), \(\vec n=(2,3,4)\) → \(2(x-2)+3(y-4)+4(z+1)=0\) → \(2x+3y+4z=12\).</div>
<div class="say">(65:29) 「30초만 더 — 중요한 거」: \(\vec n\)은 평면을 나타내는 벡터, \(\overrightarrow{P_0P}\)는 (평면 안) 직선을 나타내는 벡터 → <b>평면의 법선벡터와 평면 안 직선의 방향벡터는 항상 수직</b>. 「이 의미를 이해해야 응용된다」. (66:52) 다음 주 화요일(10/6) 「이거 관련된 내용 쭉 풀어볼 테니까 한번 정리해 보라」.</div>
<div class="analogy">탁자 위에 놓인 연필은 어느 방향이든 깃대와 직각 — 「직각이면 내적 0」 한 줄을 성분으로 풀어 쓴 것이 평면의 방정식이다.</div>
<div class="memo"><b>외울 것</b> \(\overrightarrow{P_0P}\cdot\vec n=0\) → \(A(x-x_0)+B(y-y_0)+C(z-z_0)=0\) → \(Ax+By+Cz=D\), \(D=Ax_0+By_0+Cz_0\) · 계수 (A, B, C) = 법선벡터 · 법선벡터 ⊥ 평면 안 직선의 방향벡터</div>
</section>

<div class="q" data-qid="q1" data-nodes="vec.line_eq"><div class="qn">확인 1 · Ex01 매개방정식</div><div class="qb">점 (5, 1, 3)을 지나고 방향벡터 \(\vec v=(1,4,-2)\)에 평행한 직선의 매개방정식은?</div><ol class="choices"><li data-ok="1">\(x=5+t,\ y=1+4t,\ z=3-2t\)</li><li>\(x=1+5t,\ y=4+t,\ z=-2+3t\)</li><li>\(x=5+t,\ y=1+4t,\ z=3+2t\)</li><li>\(x=5t,\ y=4t,\ z=-2t\)</li></ol><div class="ans">초기값 = 지나는 점, t의 계수 = 방향벡터 성분. 2번은 점과 방향을 바꿔 쓴 것, 3번은 −2의 부호를 놓친 것.</div></div>
<div class="q" data-qid="q2" data-nodes="vec.line_eq"><div class="qn">확인 2 · 직선 위의 점</div><div class="qb">확인 1의 직선 위에 있는 점은?</div><ol class="choices"><li data-ok="1">\((4,\ -3,\ 5)\)</li><li>\((6,\ 5,\ 5)\)</li><li>\((4,\ 5,\ 1)\)</li><li>\((1,\ 4,\ -2)\)</li></ol><div class="ans">t = −1: \((5-1,\ 1-4,\ 3+2)=(4,-3,5)\). 2번은 t = 1이면 z = 1이어야 한다. 4번은 방향벡터의 끝점일 뿐 직선 위가 아니다(t를 맞춰 보면 x에서 t = −4, y에서 t = 3/4로 안 맞음).</div></div>
<div class="q" data-qid="q3" data-nodes="vec.line_eq vec.position_ops"><div class="qn">확인 3 · Ex02 방향벡터</div><div class="qb">두 점 P₁(2, 4, −3), P₂(3, −1, 1)을 지나는 직선의 방향벡터로 선언할 \(\overrightarrow{P_1P_2}\)는?</div><ol class="choices"><li data-ok="1">\((1,\ -5,\ 4)\)</li><li>\((5,\ 3,\ -2)\)</li><li>\((1,\ -5,\ -2)\)</li><li>\((-1,\ 5,\ 4)\)</li></ol><div class="ans">종점 − 시점: \((3-2,\ -1-4,\ 1-(-3))=(1,-5,4)\). 2번은 두 점을 더한 것, 3번은 \(1-(-3)\)을 \(1-3\)으로 계산한 실수.</div></div>
<div class="q" data-qid="q4" data-nodes="vec.line_eq"><div class="qn">확인 4 · xy평면과 만나는 점</div><div class="qb">직선 \(x=2+t,\ y=4-5t,\ z=-3+4t\)가 xy평면과 만나는 점은?</div><ol class="choices"><li data-ok="1">\(\left(\tfrac{11}{4},\ \tfrac14,\ 0\right)\)</li><li>\((2,\ 4,\ 0)\)</li><li>\(\left(\tfrac34,\ \tfrac14,\ 0\right)\)</li><li>\(\left(\tfrac{11}{4},\ \tfrac{31}{4},\ 0\right)\)</li></ol><div class="ans">z = 0 → \(t=3/4\) → \(x=2+3/4=11/4\), \(y=4-15/4=1/4\). 3번은 x에 t 자체를 쓴 것, 4번은 \(-5t\)의 부호를 놓친 것.</div></div>
<div class="q" data-qid="q5" data-nodes="vec.line_eq"><div class="qn">확인 5 · yz평면과 만나는 점</div><div class="qb">같은 직선 \(x=2+t,\ y=4-5t,\ z=-3+4t\)가 yz평면과 만나는 점을 구하라.</div><div class="ans">yz평면 = x = 0 → \(2+t=0\), \(t=-2\) → \(y=4+10=14\), \(z=-3-8=-11\) → \((0,\ 14,\ -11)\).</div></div>
<div class="q" data-qid="q6" data-nodes="vec.line_eq"><div class="qn">확인 6 · 두 점 직선 답안</div><div class="qb">「두 점 P₁, P₂를 지나는 직선의 방정식을 구하라」에서 교수님이 요구한 풀이 순서로 옳은 것은?</div><ol class="choices"><li data-ok="1">점에 이름 → \(\vec v=\overrightarrow{P_1P_2}=\overrightarrow{OP_2}-\overrightarrow{OP_1}\) 선언 → P₁을 지나고 \(\vec v\)에 평행 → 매개·대칭</li><li>두 점 공식 \(\frac{x-x_1}{x_2-x_1}=\cdots\)에 바로 대입</li><li>두 점의 중점을 구해 지나는 점으로 쓴다</li><li>원점과 P₂를 잇는 \(\overrightarrow{OP_2}\)를 방향벡터로 쓴다</li></ol><div class="ans">(44:53) 「반드시 방향벡터를 언급」 — 2번처럼 공식에 바로 넣으면 0점 처리라고 했다. 4번은 P₁을 지나지 않는 방향이라 틀린 직선이 된다.</div></div>
<div class="q" data-qid="q7" data-nodes="vec.plane_eq"><div class="qn">확인 7 · 평면의 방정식</div><div class="qb">점 (2, 4, −1)을 지나고 법선벡터 \(\vec n=(2,3,4)\)인 평면의 방정식은? (교재 12.5 Example 4)</div><ol class="choices"><li data-ok="1">\(2x+3y+4z=12\)</li><li>\(2x+4y-z=12\)</li><li>\(2x+3y+4z=0\)</li><li>\(2x+3y+4z=20\)</li></ol><div class="ans">\(2(x-2)+3(y-4)+4(z+1)=0\) → \(2x+3y+4z=4+12-4=12\). 2번은 점과 법선을 바꿔 쓴 것, 4번은 \(z_0=-1\)의 부호를 놓친 것.</div></div>
<div class="q" data-qid="q8" data-nodes="vec.plane_eq vec.dot_calc2"><div class="qn">확인 8 · 법선벡터의 의미</div><div class="qb">평면의 법선벡터 \(\vec n\)과, 그 평면 안에 놓인 직선의 방향벡터 \(\vec v\) 사이에 항상 성립하는 것은?</div><ol class="choices"><li data-ok="1">\(\vec n\cdot\vec v=0\) (수직)</li><li>\(\vec n=t\vec v\) (평행)</li><li>\(|\vec n|=|\vec v|\)</li><li>\(\vec n\times\vec v=\vec 0\)</li></ol><div class="ans">평면 안의 벡터 \(\overrightarrow{P_0P}\)는 모두 \(\vec n\)에 수직 — 평면 방정식 유도의 출발점(65:29 「항상 수직」).</div></div>
</body></html>'''

for k, v in F.items():
    html = html.replace("{FIG:" + k + "}", v)
assert "{FIG:" not in html
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("->", OUT, len(html))
