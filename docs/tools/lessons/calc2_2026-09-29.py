# -*- coding: utf-8 -*-
"""미분적분학2 · 2026-09-29 수업 노트 (근거: 2026-09-29/정리.md — 판서 8장(09:20~10:23) + 녹음 79분(09:04~). 필기 미수신(10/1 누적본 p.27 수신).
섹션 순서 = 판서 1~8 순서: [Def 01]·[Def 02] → 열 교환 → a×b = |i j k; a; b| → Ex01 → §12.5 ① 방향코사인 → 내적 유도 → ± · 방향비 → ② 매개·대칭방정식
본문은 raw 문자열(역슬래시 그대로) — 그림은 {FIG:이름} 자리에 끼운다."""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\미분적분학2\_수업노트\2026-09-29.html"
F = {}

# 판서 1 — [Def 01] 2×2 행렬식 셋 · [Def 02] 3×3 1행 전개
F["def"] = canvas(560, 214,
    step(1, text(14, 30, "[Def 01]  a⃗ × b⃗ = ( c₁, c₂, c₃ )", 14, INK, "start", True),
        mat(40, 46, [["a_2", "a_3"], ["b_2", "b_3"]], 30, 24, bars=True), mat(150, 46, [["a_3", "a_1"], ["b_3", "b_1"]], 30, 24, bars=True),
        mat(260, 46, [["a_1", "a_2"], ["b_1", "b_2"]], 30, 24, bars=True),
        text(70, 114, "c₁", 13, GRAY, "middle"), text(180, 114, "c₂", 13, GRAY, "middle"), text(290, 114, "c₃", 13, GRAY, "middle"),
        text(450, 64, "순환 (2,3) (3,1) (1,2)", 12.5, GRAY, "middle"), text(450, 86, "가운데가 3·1 — 헷갈리는 자리", 12, RED, "middle")),
    step(2, text(14, 160, "[Def 02]", 14, INK, "start", True),
        band(88, 147, 174, 147, 20, RED, .14), mat(86, 136, [["a_1", "a_2", "a_3"], ["b_1", "b_2", "b_3"], ["c_1", "c_2", "c_3"]], 30, 22, bars=True),
        text(190, 162, "= a₁M₁₁ − a₂M₁₂ + a₃M₁₃", 14, INK, "start", True),
        text(190, 190, "M₁₂ = 1행과 2열을 지운 2×2 행렬식", 12, GRAY)),
    step(3, text(500, 162, "부호 + − +", 14, RED, "middle", True)),
    cap="판서 1. 위 = 9/22 의 외적 정의(2×2 행렬식 셋), 아래 = 3×3 행렬식을 1행으로 전개하는 [Def 02]. 아무 말 없으면 1행 기준.", name="def")

# 판서 2 — 열 교환 → 부호 −, ㄱ과 같은 모양 → |i j k; a; b|
F["ijk"] = canvas(560, 214,
    step(1, mat(30, 26, [["a_3", "a_1"], ["b_3", "b_1"]], 30, 24, bars=True),
        arrow(100, 50, 168, 50, GREEN, "", 2), text(134, 40, "열 교환", 12, GREEN, "middle"),
        text(184, 57, "−", 20, RED, "middle", True), mat(198, 26, [["a_1", "a_3"], ["b_1", "b_3"]], 30, 24, bars=True),
        text(276, 56, "두 열(행)을 바꾸면 −1배", 12.5, RED)),
    step(2, text(30, 112, "ㄴ  a⃗ × b⃗ = (2×2)i⃗ − (2×2)j⃗ + (2×2)k⃗   → 부호 + − +", 13, INK)),
    step(3, text(30, 152, "ㄱ 과 비교 : 1행 = i⃗, j⃗, k⃗", 13, BLUE, "start", True), text(30, 178, "2행 = a⃗ 의 성분 · 3행 = b⃗ 의 성분", 13, BLUE),
        text(408, 167, "a⃗×b⃗ =", 13, INK, "end", True),
        mat(418, 132, [["i⃗", "j⃗", "k⃗"], ["a_1", "a_2", "a_3"], ["b_1", "b_2", "b_3"]], 32, 22, bars=True, hl=[(0, 0), (0, 1), (0, 2)])),
    cap="판서 2. 가운데 2×2 의 두 열을 바꾸면 부호가 바뀌어 + + + 가 + − + 가 된다 — [Def 02] 와 같은 모양이 되어 외적을 3×3 행렬식 하나로 쓴다.", name="ijk")

# 판서 3 — Ex01
F["ex01"] = canvas(560, 196,
    step(1, fbox(14, 14, 190, 64, "a⃗ = (1, 3, 4)", INK, sub="b⃗ = (2, 7, −5)", size=14)),
    step(2, arrow(206, 46, 232, 46, GREEN, "", 2),
        rect(236, 10, 310, 72, BLUE, fill="rgba(255,255,255,.75)", sw=1.6, rx=9),
        text(250, 32, "i⃗ : 3·(−5) − 4·7 = −43", 13, BLUE), text(250, 52, "j⃗ : −(1·(−5) − 4·2) = +13", 13, RED), text(250, 72, "k⃗ : 1·7 − 3·2 = 1", 13, BLUE)),
    step(3, fbox(14, 112, 250, 62, "a⃗ × b⃗ = (−43, 13, 1)", RED, sub="= −43i⃗ + 13j⃗ + k⃗", size=14)),
    step(4, fbox(282, 112, 264, 62, "a⃗·(a⃗×b⃗) = −43 + 39 + 4 = 0", GREEN, sub="b⃗·(a⃗×b⃗) = −86 + 91 − 5 = 0", size=12.5)),
    cap="판서 3 Ex01. 1행 i, j, k 로 전개 — j 앞의 − 를 잊으면 13 이 −13 이 된다. 마지막은 두 벡터에 모두 수직인지 내적으로 확인.", name="ex01")

# 판서 4 — 방향코사인 그림
ox, oy = 150, 176
P0 = (204, 124)
F["dircos"] = canvas(560, 236,
    step(1, axes3d(ox, oy, 110), dot(ox, oy, "", 3, INK), text(ox + 6, oy + 20, "O", 13, INK),
        arrow(ox, oy, ox - 26, oy + 21, BLUE, "", 3), arrow(ox, oy, ox + 40, oy, BLUE, "", 3), arrow(ox, oy, ox, oy - 40, BLUE, "", 3)),
    step(2, line(ox - 34, oy + 31, 230, 102, RED, 2.2), arrow(ox, oy, P0[0], P0[1], GREEN, "", 3), dot(P0[0], P0[1], "", 5, PINK),
        text(214, 140, "P₀(x₀, y₀, z₀)", 12.5, PINK), text(238, 104, "g", 14, RED, "start", True)),
    step(3, text(190, 166, "β", 13, RED, "middle", True), text(168, 136, "γ", 13, RED, "middle", True), text(128, 166, "α", 13, RED, "middle", True)),
    step(4, text(320, 40, "OP₀ = (x₀, y₀, z₀)", 13, INK), text(320, 64, "방향 = 단위벡터 OP₀ / |OP₀|", 13, INK),
        text(320, 96, "l, m, n = cos α, cos β, cos γ", 13, RED, "start", True)),
    step(5, text(320, 130, "E⃗_x = (1,0,0), E⃗_y = (0,1,0)", 12.5, BLUE), text(320, 152, "E⃗_z = (0,0,1) — 축 방향 단위벡터", 12.5, BLUE),
        text(320, 186, "α, β, γ = OP₀ 와 x·y·z 축의 각", 12, GRAY)),
    cap="판서 4. 원점 O 와 P₀ 를 지나는 직선 g. 방향각의 코사인을 l, m, n 으로 부른다(파랑 = 축 방향 단위벡터).", name="dircos")

# 판서 5 — 내적으로 cos α
F["dot"] = canvas(560, 150,
    step(1, fbox(14, 18, 166, 60, "E⃗_x · OP₀ = x₀", INK, sub="(1,0,0)·(x₀,y₀,z₀)", size=13.5)),
    step(2, arrow(182, 48, 204, 48, GREEN, "", 2), fbox(208, 18, 170, 60, "|E⃗_x||OP₀| cos α = x₀", BLUE, sub="교각의 정의 · |E⃗_x| = 1", size=12.5)),
    step(3, arrow(380, 48, 402, 48, GREEN, "", 2), fbox(406, 18, 140, 60, "cos α = x₀/|OP₀|", RED, sub="= l", size=13)),
    step(4, text(280, 112, "같은 방법 : cos β = y₀/|OP₀| (= m),  cos γ = z₀/|OP₀| (= n)", 12.5, GRAY, "middle")),
    cap="판서 5. 「두 벡터의 교각의 정의」 a·b = |a||b|cos θ 에 b = 축 방향 단위벡터를 넣는다 — 9/22 방향코사인과 같은 식.", name="dot")

# 판서 6 — 반대 방향 · 방향비
F["ratio"] = canvas(560, 200,
    step(1, line(60, 145, 240, 55, INK, 2), arrow(150, 100, 236, 100, GRAY, "", 1.5), text(240, 118, "x축 방향", 12, GRAY, "end"),
        arrow(150, 100, 222, 64, GREEN, "", 3), dot(222, 64, "", 5, PINK), text(214, 50, "P₀", 13, PINK, "end"), arc(150, 100, 36, -26.6, 0, RED, 1.5, "α", 50)),
    step(2, arrow(150, 100, 78, 136, BLUE, "", 3, dash="6 4"), arc(150, 100, 22, 0, 153.4, BLUE, 1.5), text(150, 150, "π + α", 13, BLUE, "middle", True)),
    step(3, text(300, 40, "cos(π + α) = −cos α", 13, BLUE), text(300, 64, "l = ± x₀/|OP₀|,  m = ± y₀/|OP₀|", 13, INK), text(300, 86, "n = ± z₀/|OP₀|", 13, INK)),
    step(4, text(300, 128, "l : m : n = x₀ : y₀ : z₀", 15, RED, "start", True), text(300, 154, "← 방향비 (± 와 |OP₀| 는 공통)", 12.5, GRAY)),
    cap="판서 6. 직선은 양쪽으로 뻗는다 — 반대 방향 각 π + α 도 같은 직선이라 방향코사인은 ± 까지만 정해지고, 비는 x₀ : y₀ : z₀ 로 고정.", name="ratio")

# 판서 7·8 — 매개·대칭방정식
O = (110, 186); Pa = (196, 104); d = (50, -27)
F["line"] = canvas(560, 236,
    step(1, axes3d(O[0], O[1], 96), text(O[0] + 6, O[1] + 20, "O", 13, INK),
        arrow(O[0], O[1], O[0] + d[0], O[1] + d[1], YEL, "", 3), text(O[0] + 58, O[1] - 10, "v⃗ = (A, B, C)", 12.5, YEL, "start", True)),
    step(2, line(Pa[0] - d[0], Pa[1] - d[1], Pa[0] + 1.7 * d[0], Pa[1] + 1.7 * d[1], RED, 2.2), dot(Pa[0], Pa[1], "", 5, PINK), text(Pa[0] - 10, Pa[1] - 10, "P₀", 13, PINK, "end"),
        line(O[0], O[1], Pa[0], Pa[1], GRAY, 1.4, "5 4")),
    step(3, dot(Pa[0] + d[0], Pa[1] + d[1], "", 5, BLUE), text(Pa[0] + d[0] - 8, Pa[1] + d[1] - 12, "P(x, y, z)", 12.5, BLUE, "end"),
        arrow(Pa[0], Pa[1], Pa[0] + d[0], Pa[1] + d[1], GREEN, "", 3),
        text(320, 40, "P₀P = OP − OP₀", 13, INK), text(320, 62, "= (x − x₀, y − y₀, z − z₀)", 13, INK),
        text(320, 92, "P₀P ∥ v⃗  ⇔  P₀P = t v⃗", 13, GREEN, "start", True)),
    step(4, text(320, 130, "x = x₀ + tA, y = y₀ + tB, z = z₀ + tC", 12.5, RED, "start", True), text(320, 150, "← 매개방정식", 12, GRAY)),
    step(5, text(320, 186, "(x−x₀)/A = (y−y₀)/B = (z−z₀)/C", 12.5, RED, "start", True), text(320, 206, "← 대칭방정식 (= t)", 12, GRAY)),
    cap="판서 7·8. 지나는 점 P₀ 와 방향벡터 v 가 직선을 정한다. 직선 위 아무 점 P 에 대해 P₀P 는 v 의 실수배.", name="line")

html = r'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>미분적분학2 · 9/29 외적 = 3×3 행렬식 · Ex01 · 12.5 직선의 방정식</title></head><body>
<header>
<h1>12.4 외적을 3×3 행렬식으로 → 12.5 직선의 방정식 (방향코사인 · 방향비 · 매개 · 대칭)</h1>
<p class="lead">앞 30분은 12.4를 마무리했다. 9/22에 외운 외적 성분(2×2 행렬식 셋)을 <b>3×3 행렬식 하나</b> \(\begin{vmatrix}\vec i&\vec j&\vec k\\a_1&a_2&a_3\\b_1&b_2&b_3\end{vmatrix}\)로 바꾸고, Ex01로 계산했다. 뒤 45분은 <b>12.5 직선의 방정식</b> — 원점과 P₀를 지나는 직선의 방향코사인 l, m, n, 반대 방향을 생각한 ±, 방향비 l : m : n = x₀ : y₀ : z₀, 그리고 한 점 P₀와 방향벡터 \(\vec v\)로 쓰는 <b>매개방정식·대칭방정식</b>. 교수님 말로 12.5부터가 중간고사 문제 구간이다.</p>
<p class="meta"><span>판서 8장 (09:20~10:23)</span><span>녹음 79분 (09:04~)</span><span>교재 12.4~12.5</span><span>5주차 · 화</span></p>
</header>

<section class="s" data-id="s1" data-nodes="vec.cross lin.cofactor lin.det3">
<h2>1. [Def 01] 외적 복습 → [Def 02] 3×3 행렬식의 1행 전개 (판서 1)</h2>
{FIG:def}
<p>지난 시간(9/22)에 \(\vec a\)와 \(\vec b\)에 동시에 수직인 벡터를 구해 보니 성분이 2×2 행렬식 세 개로 나왔다 — 이것이 [Def 01]. <b>2×2 행렬식</b>은 숫자 네 개를 정사각형으로 놓고 \(\begin{vmatrix}p&q\\r&s\end{vmatrix}=ps-qr\)(↘ 곱 − ↗ 곱)로 계산하는 한 수다(9/3). 각 성분은 「자기 번호를 뺀 두 번호」를 순환 순서 (2,3), (3,1), (1,2)로 넣는데, 가운데 성분이 3·1 순서라 헷갈린다. 교수님은 이 방식이 「너무 암기 위주」라고 하고, 더 넓게 쓰이는 패턴인 [Def 02]를 칠판에 적었다.</p>
<div class="formula">\[\vec a\times\vec b=\Big(\begin{vmatrix}a_2&a_3\\b_2&b_3\end{vmatrix},\ \begin{vmatrix}a_3&a_1\\b_3&b_1\end{vmatrix},\ \begin{vmatrix}a_1&a_2\\b_1&b_2\end{vmatrix}\Big)=(c_1,c_2,c_3)\qquad \begin{vmatrix}a_1&a_2&a_3\\b_1&b_2&b_3\\c_1&c_2&c_3\end{vmatrix}=a_1\begin{vmatrix}b_2&b_3\\c_2&c_3\end{vmatrix}-a_2\begin{vmatrix}b_1&b_3\\c_1&c_3\end{vmatrix}+a_3\begin{vmatrix}b_1&b_2\\c_1&c_2\end{vmatrix}\]</div>
<div class="why">[Def 02]는 3×3 행렬식을 <b>1행으로 전개</b>(여인수 전개)하는 규칙이다. 1행의 원소 \(a_1, a_2, a_3\)를 하나씩 골라, 그 원소가 있는 행과 열을 지우고 남은 2×2 행렬식(<b>소행렬식</b>, minor)을 곱한다. 부호는 자리 (행 번호 + 열 번호)가 짝수면 +, 홀수면 − 라서 1행은 <b>+ − +</b>. 교수님: 「아무 말 없으면 무조건 1행 기준」. 이 식에 ㄱ이라는 이름을 붙여 두고 다음 판서에서 외적과 비교한다.</div>
<div class="analogy">큰 상자(3×3)를 바로 계산하지 않고, 맨 윗줄 세 칸을 하나씩 집어 그 칸의 가로·세로 줄을 지운 작은 상자(2×2) 셋으로 쪼갠다 — 작은 상자는 이미 계산할 줄 안다.</div>
<div class="memo"><b>외울 것</b> 2×2 행렬식 \(ps-qr\) · [Def 02] 1행 전개: 원소 × (그 행·열 지운 2×2) · 부호 + − + · 아무 말 없으면 1행 기준</div>
</section>

<section class="s" data-id="s2" data-nodes="vec.cross lin.det_props lin.cofactor">
<h2>2. 두 정의 잇기 — 열을 바꾸면 −1배 → \(\vec a\times\vec b=|\vec i\ \vec j\ \vec k;\ \vec a;\ \vec b|\) (판서 2) ★</h2>
{FIG:ijk}
<p>\(\vec a=a_1\vec i+a_2\vec j+a_3\vec k\), \(\vec b=b_1\vec i+b_2\vec j+b_3\vec k\)처럼 <b>표준기저벡터</b>(9/17: 각 축 방향 크기 1인 벡터 \(\vec i,\vec j,\vec k\))로 쓰면 [Def 01]은 \(\vec a\times\vec b=c_1\vec i+c_2\vec j+c_3\vec k\), 즉 세 2×2 행렬식에 \(\vec i,\vec j,\vec k\)를 붙인 꼴이다. 그런데 이 부호는 + + + 이고 ㄱ(1행 전개)은 + − + 이다. 가운데를 맞춰야 한다.</p>
<div class="formula">\[\begin{vmatrix}a_3&a_1\\b_3&b_1\end{vmatrix}=-\begin{vmatrix}a_1&a_3\\b_1&b_3\end{vmatrix}\ \Rightarrow\ \vec a\times\vec b=\begin{vmatrix}a_2&a_3\\b_2&b_3\end{vmatrix}\vec i-\begin{vmatrix}a_1&a_3\\b_1&b_3\end{vmatrix}\vec j+\begin{vmatrix}a_1&a_2\\b_1&b_2\end{vmatrix}\vec k=\begin{vmatrix}\vec i&\vec j&\vec k\\a_1&a_2&a_3\\b_1&b_2&b_3\end{vmatrix}\]</div>
<div class="why">행렬식의 성질(증명은 하지 않고 사용): <b>두 행 또는 두 열을 바꾸면 값이 −1배</b>가 된다. 확인: \(a_3b_1-a_1b_3=-(a_1b_3-a_3b_1)\). 가운데 2×2의 두 열을 바꾸면 부호가 −로 나와 + − + 가 된다(이것이 ㄴ). ㄴ을 ㄱ과 나란히 놓으면 1행 자리에 \(\vec i,\vec j,\vec k\), 2행에 \(\vec a\)의 성분, 3행에 \(\vec b\)의 성분이 들어간 3×3 행렬식의 1행 전개와 똑같다. 그래서 외적은 <b>외울 공식이 아니라 행렬식 패턴</b>이 된다 — 교수님: 「행렬식 패턴을 앞에서 배운 이유가 이거」. 1행 원소가 숫자가 아니라 벡터라서 진짜 행렬식은 아니고, 계산 방법을 빌려 쓰는 기호다.</div>
<div class="say">(19:54) 「사라스(Sarrus) 적용할 필요 없어요. <b>무조건 여인수 전개</b> 방법.」 — 9/22 ★★ 「3차 행렬식으로 계산, Sarrus 아님」과 같은 줄기. 답안은 \(|\vec i\ \vec j\ \vec k;\ \vec a;\ \vec b|\) → 2×2 셋(\(\vec j\) 앞 −) → 성분 순서로.</div>
<div class="analogy">외우던 세 칸짜리 표를, 이미 알고 있는 「맨 윗줄 전개」 틀에 끼워 넣은 것 — 틀만 기억하면 순서를 따로 외울 필요가 없다.</div>
<div class="memo"><b>외울 것</b> 두 행(열)을 바꾸면 −1배 · \(\vec a\times\vec b=\begin{vmatrix}\vec i&\vec j&\vec k\\a_1&a_2&a_3\\b_1&b_2&b_3\end{vmatrix}\) · 1행 전개 + − + · Sarrus 쓰지 않는다</div>
</section>

<section class="s" data-id="s3" data-nodes="vec.cross lin.cofactor">
<h2>3. Ex01 — \(\vec a=(1,3,4)\), \(\vec b=(2,7,-5)\)의 \(\vec a\times\vec b\) (판서 3) ★</h2>
{FIG:ex01}
<div class="formula">\[\vec a\times\vec b=\begin{vmatrix}\vec i&\vec j&\vec k\\1&3&4\\2&7&-5\end{vmatrix}=\begin{vmatrix}3&4\\7&-5\end{vmatrix}\vec i-\begin{vmatrix}1&4\\2&-5\end{vmatrix}\vec j+\begin{vmatrix}1&3\\2&7\end{vmatrix}\vec k=-43\vec i+13\vec j+\vec k=(-43,\ 13,\ 1)\]</div>
<div class="why">sol. i) 1행 \(\vec i,\vec j,\vec k\), 2행 \(\vec a\), 3행 \(\vec b\)로 놓고 1행 전개. \(\vec i,\vec j,\vec k\)는 숫자가 아니니 2×2 행렬식 <b>뒤로</b> 뺀다. \(\vec i\): \(3\cdot(-5)-4\cdot7=-15-28=-43\). \(\vec j\): \(1\cdot(-5)-4\cdot2=-5-8=-13\)인데 앞에 −가 있으므로 \(-(-13)=+13\). \(\vec k\): \(1\cdot7-3\cdot2=7-6=1\). 답은 수가 아니라 <b>벡터</b> \((-43,13,1)\)다. 확인: \(\vec a\cdot(\vec a\times\vec b)=-43+39+4=0\), \(\vec b\cdot(\vec a\times\vec b)=-86+91-5=0\) — 둘 다 내적 0이니 \(\vec a\)에도 \(\vec b\)에도 수직(9/22 [Th 2] 수직조건). 교재 Stewart 12.4 Example 1과 같은 문제다.</div>
<div class="say">(23:11) 「여기 <b>마이너스가 있으니까 조심</b>해야 돼요」(\(\vec j\) 성분). (24:28) 「답만 구하면 뭔 말이냐 — 이게 뭘 의미하는지 설명할 수 있어야」. (29:19) 두 벡터에 동시에 수직인 벡터를 찾을 때 외적을 쓴다 — 「<b>뒤에 시험하고 연관된 내용</b>이 나온다」. 스칼라 삼중곱은 <b>패스</b>(「작년부터 패스」).</div>
<div class="say">(31:36) 중간고사는 <b>10월 20일(화) 예정</b> — 「다음 주에 공식적으로 올려놓을 것, 장소는 다른 곳」. 공식 공지 전이다.</div>
<div class="analogy">책상 위에 연필 두 자루(\(\vec a,\vec b\))를 놓으면, 둘 모두와 직각인 방향은 책상을 뚫고 위로 선 기둥 방향뿐이다 — 외적이 그 기둥.</div>
<div class="memo"><b>외울 것</b> Ex01 답 \((-43,13,1)\) · \(\vec j\) 앞 − 를 잊지 않기 · 검산 = \(\vec a\cdot(\vec a\times\vec b)=0\), \(\vec b\cdot(\vec a\times\vec b)=0\) · 스칼라 삼중곱은 범위 밖</div>
</section>

<section class="s" data-id="s4" data-nodes="vec.line_eq vec.unit">
<h2>4. §12.5 직선 ① 원점과 P₀를 지나는 직선의 방향코사인 l, m, n (판서 4) ★</h2>
{FIG:dircos}
<p>12.5 Equations of Lines and Planes — 3차원 공간의 직선과 평면의 방정식. 교수님: 「직선·평면의 방정식 = <b>중간고사 문제에 관련된 내용</b>, 수업 시간에 다 가르쳐 준다. 잘 체크해서 집중적으로」. 직선의 방정식은 두 가지(<b>매개방정식 · 대칭방정식</b>)로 쓰는데, 거기까지 가는 재료로 먼저 <b>방향코사인</b>을 직선 위에서 다시 본다.</p>
<div class="formula">\[l=\cos\alpha,\quad m=\cos\beta,\quad n=\cos\gamma\qquad \overrightarrow{OP_0}=(x_0,y_0,z_0),\quad \frac{1}{|\overrightarrow{OP_0}|}\overrightarrow{OP_0}=\frac{1}{\sqrt{x_0^2+y_0^2+z_0^2}}(x_0,y_0,z_0)\]</div>
<div class="why">ㄱ 원점 O(0,0,0)과 처음 주어진 점 P₀(x₀,y₀,z₀)를 지나는 직선을 g라 하자(아래 첨자 0 = 「처음 주어진 점」). 두 점으로 만든 벡터는 「종점 − 시점」이라 \(\overrightarrow{OP_0}=(x_0,y_0,z_0)\). 직선의 <b>방향</b>만 필요하니 길이를 1로 맞춘 <b>단위벡터</b> \(\overrightarrow{OP_0}/|\overrightarrow{OP_0}|\)를 쓴다(9/17 단위벡터). 이 직선이 양의 x, y, z축과 이루는 각이 방향각 α, β, γ이고, 그 코사인을 차례로 <b>l, m, n</b>이라 부른다. 판서 오른쪽 파란 글씨 \(\cos\theta=\frac{\vec a\cdot\vec b}{|\vec a||\vec b|}\)가 다음 판서의 열쇠.</div>
<div class="say">(32:24~34:52) 「(12.5부터) 여기서 중간고사 문제가 막 나오기 시작해요」 · 매개·대칭방정식을 고등학교처럼 암기하면 「응용하는 문제는 그게 안 먹혀」 — 실제 시험은 정해진 틀이 아니다.</div>
<div class="analogy">손전등을 원점에 두고 P₀ 쪽으로 비추면, 빛줄기가 세 벽(축)에 대해 얼마나 기울었는지가 l, m, n — 손전등의 세기(길이)와는 상관없다.</div>
<div class="memo"><b>외울 것</b> l, m, n = cos α, cos β, cos γ · \(\overrightarrow{OP_0}=(x_0,y_0,z_0)\) · 방향은 단위벡터 \(\overrightarrow{OP_0}/|\overrightarrow{OP_0}|\)</div>
</section>

<section class="s" data-id="s5" data-nodes="vec.line_eq vec.dot_calc2 vec.unit">
<h2>5. 방향코사인을 내적으로 — \(\cos\alpha=x_0/|\overrightarrow{OP_0}|\) (판서 5)</h2>
{FIG:dot}
<div class="formula">\[\vec E_x\cdot\overrightarrow{OP_0}=(1,0,0)\cdot(x_0,y_0,z_0)=x_0\ \Leftrightarrow\ |\vec E_x||\overrightarrow{OP_0}|\cos\alpha=x_0\ \Leftrightarrow\ \cos\alpha=\frac{x_0}{|\overrightarrow{OP_0}|}\ (=l)\]</div>
<div class="why">「두 벡터의 교각의 정의에 의하여」 — 교각은 두 벡터가 이루는 각이고, 그 정의가 \(\vec a\cdot\vec b=|\vec a||\vec b|\cos\theta\)(9/17 정리 1). x축 방향 단위벡터 \(\vec E_x=(1,0,0)\)과 \(\overrightarrow{OP_0}\)의 내적을 두 가지로 계산한다. 성분으로 하면 \(1\cdot x_0+0\cdot y_0+0\cdot z_0=x_0\), 정의로 하면 \(|\vec E_x||\overrightarrow{OP_0}|\cos\alpha\). \(|\vec E_x|=1\)이라 지워지고 \(\cos\alpha=x_0/|\overrightarrow{OP_0}|\). 같은 방법으로 \(\vec E_y=(0,1,0)\)에서 \(\cos\beta=y_0/|\overrightarrow{OP_0}|\)(= m), \(\vec E_z=(0,0,1)\)에서 \(\cos\gamma=z_0/|\overrightarrow{OP_0}|\)(= n). 9/22의 \(\cos\alpha=a_1/|\vec a|\)를 직선 위 점 P₀로 다시 쓴 것이다 — 교수님: 「어디서 많이 본 거죠」.</div>
<div class="analogy">같은 그림자 길이를 두 방법으로 잰다 — 좌표로 바로 읽으면 x₀, 길이 × 기울기로 재면 \(|\overrightarrow{OP_0}|\cos\alpha\). 둘이 같다는 식에서 기울기가 나온다.</div>
<div class="memo"><b>외울 것</b> \(\cos\alpha=x_0/|\overrightarrow{OP_0}|,\ \cos\beta=y_0/|\overrightarrow{OP_0}|,\ \cos\gamma=z_0/|\overrightarrow{OP_0}|\) · 유도 = 축 단위벡터와 내적, \(|\vec E_x|=1\)</div>
</section>

<section class="s" data-id="s6" data-nodes="vec.line_eq">
<h2>6. ㄴ 반대 방향 → 부호 ± · ㄷ 방향비 l : m : n = x₀ : y₀ : z₀ (판서 6) ★</h2>
{FIG:ratio}
<div class="formula">\[\cos(\pi+\alpha)=-\cos\alpha\ \Rightarrow\ l=\pm\frac{x_0}{|\overrightarrow{OP_0}|},\ m=\pm\frac{y_0}{|\overrightarrow{OP_0}|},\ n=\pm\frac{z_0}{|\overrightarrow{OP_0}|}\qquad l:m:n=x_0:y_0:z_0\ (\text{방향비})\]</div>
<div class="why">ㄴ 직선은 화살표가 아니라 <b>양쪽으로 끝없이 뻗는다</b>. P₀ 쪽을 보면 각이 α, 반대쪽을 보면 각이 π + α이고 둘 다 같은 직선의 방향이다. \(\cos(\pi+\alpha)=-\cos\alpha\)(각에 π(180°)를 더하면 원 위의 점이 정반대로 가서 코사인 값의 부호가 바뀐다 — 교수님은 「90°×n, n 짝수면 함수 그대로, 3사분면이면 cos 음수」로 설명). 그래서 직선의 방향코사인은 <b>± 까지만</b> 정해진다. ㄷ 세 식에서 ±와 분모 \(|\overrightarrow{OP_0}|\)는 셋 다 똑같으니 비를 잡으면 사라지고 분자만 남는다: \(l:m:n=x_0:y_0:z_0\). 이 비를 <b>방향비</b>(direction ratio)라 한다 — 길이·방향 부호와 상관없이 직선의 기울어진 모양만 담는다. 교수님: 「초기값이 제일 중요」.</div>
<div class="analogy">지도에서 「동쪽 3, 북쪽 4 비율로 뻗은 길」이라고만 하면 어느 쪽으로 걷든 같은 길이다 — 비율(3 : 4)이 길을 정하고, 걷는 방향(±)과 걸음 수(길이)는 상관없다.</div>
<div class="memo"><b>외울 것</b> 직선은 양방향 → 방향코사인은 ± · 방향비 \(l:m:n=x_0:y_0:z_0\) (± 와 \(|\overrightarrow{OP_0}|\)는 약분)</div>
</section>

<section class="s" data-id="s7" data-nodes="vec.line_eq vec.position_ops">
<h2>7. ② 한 점 P₀ + 방향벡터 \(\vec v\) → 매개방정식 → 대칭방정식 (판서 7·8) ★</h2>
{FIG:line}
<p>한 점 P₀를 지나는 직선은 무수히 많다(P₀에서 사방으로). 하나로 정하려면 방향이 필요하다 — 그 방향을 주는 벡터가 <b>방향벡터</b>(direction vector) \(\vec v=(A,B,C)\). 중학교의 「한 점 + 기울기」에서 기울기 자리를 3차원에서는 방향벡터가 맡는다. 직선 위를 움직이는 점 P(x, y, z)가 만족하는 식(자취의 방정식)을 찾는다.</p>
<div class="formula">\[\overrightarrow{P_0P}=\overrightarrow{OP}-\overrightarrow{OP_0}=(x-x_0,\ y-y_0,\ z-z_0),\qquad \overrightarrow{P_0P}\parallel\vec v\ \Leftrightarrow\ \overrightarrow{P_0P}=t\,\vec v\ \ (t\text{는 실수})\]</div>
<div class="formula">\[x=x_0+tA,\quad y=y_0+tB,\quad z=z_0+tC\ \ (\text{매개방정식})\qquad \frac{x-x_0}{A}=\frac{y-y_0}{B}=\frac{z-z_0}{C}\ (=t)\ \ (\text{대칭방정식})\]</div>
<div class="why">P가 직선 위에 있으면 P₀에서 P로 가는 벡터 \(\overrightarrow{P_0P}\)는 \(\vec v\)와 <b>평행</b>하고, 평행하다는 것은 \(\vec v\)를 실수 t배 한 것과 같다는 뜻이다(t = 2면 두 배 앞, t = −1이면 반대로 한 칸). 성분끼리 같다고 놓으면 \(x-x_0=tA\) 등 → <b>매개방정식</b>(t = 매개변수: x, y, z를 한꺼번에 움직이는 「숨은 변수」). x₀, y₀, z₀는 초기값, A, B, C는 방향벡터의 성분(= 판서 6의 방향비 역할). 세 식을 각각 t에 대해 풀면 \(t=(x-x_0)/A\) 등이 되고, 셋이 같은 t이니 등호로 이으면 <b>대칭방정식</b>(symmetric equation). 두 식은 서로 바꿔 쓸 수 있고 뜻은 같다. A, B, C 중 0이 있으면 나눌 수 없는데, 그 경우는 이날 판서에 없다.</div>
<div class="say">(33:43) 매개·대칭방정식을 암기해서 쓰면 「응용하는 문제는 안 먹혀」 → 그림(\(\overrightarrow{P_0P}=t\vec v\))부터 유도할 수 있어야 한다. (77:33) 「암기보다 그림으로 풀어라」 · 다음 시간(10/1): 두 점을 지나는 직선 + 문제.</div>
<div class="analogy">기찻길(직선)은 출발역(P₀)과 선로 방향(\(\vec v\))으로 정해지고, t는 출발 뒤 지난 시간이다 — 시간을 정하면 기차의 위치(x, y, z)가 정해진다.</div>
<div class="memo"><b>외울 것</b> \(\overrightarrow{P_0P}=t\vec v\)에서 출발 · 매개 \(x=x_0+tA,\ y=y_0+tB,\ z=z_0+tC\) · 대칭 \(\frac{x-x_0}{A}=\frac{y-y_0}{B}=\frac{z-z_0}{C}\) · 연습: 점 (1,2,3), \(\vec v=(2,-1,4)\)로 두 식 쓰기</div>
</section>

<div class="q" data-qid="q1" data-nodes="lin.cofactor lin.det3"><div class="qn">확인 1 · [Def 02] 부호</div><div class="qb">3×3 행렬식을 1행으로 전개할 때 \(a_1, a_2, a_3\) 항에 붙는 부호는 차례로?</div><ol class="choices"><li data-ok="1">\(+,\ -,\ +\)</li><li>\(+,\ +,\ +\)</li><li>\(-,\ +,\ -\)</li><li>\(+,\ -,\ -\)</li></ol><div class="ans">자리 (행 + 열)이 짝수면 +, 홀수면 −: (1,1) +, (1,2) −, (1,3) +.</div></div>
<div class="q" data-qid="q2" data-nodes="lin.det_props"><div class="qn">확인 2 · 열 교환</div><div class="qb">\(\begin{vmatrix}a_3&a_1\\b_3&b_1\end{vmatrix}\)과 같은 것은?</div><ol class="choices"><li data-ok="1">\(-\begin{vmatrix}a_1&a_3\\b_1&b_3\end{vmatrix}\)</li><li>\(\begin{vmatrix}a_1&a_3\\b_1&b_3\end{vmatrix}\)</li><li>\(\begin{vmatrix}b_3&b_1\\a_3&a_1\end{vmatrix}\)</li><li>\(0\)</li></ol><div class="ans">두 열을 바꾸면 −1배: \(a_3b_1-a_1b_3=-(a_1b_3-a_3b_1)\). 3번은 두 행을 바꾼 것이라 역시 −1배가 되어 같지 않다.</div></div>
<div class="q" data-qid="q3" data-nodes="vec.cross"><div class="qn">확인 3 · Ex01</div><div class="qb">\(\vec a=(1,3,4)\), \(\vec b=(2,7,-5)\)일 때 \(\vec a\times\vec b\)는?</div><ol class="choices"><li data-ok="1">\((-43,\ 13,\ 1)\)</li><li>\((-43,\ -13,\ 1)\)</li><li>\((13,\ -43,\ 1)\)</li><li>\((-13,\ 13,\ 1)\)</li></ol><div class="ans">\(\vec i\): \(-15-28=-43\), \(\vec j\): \(-(-5-8)=+13\), \(\vec k\): \(7-6=1\). 2번은 \(\vec j\) 앞의 − 를 빠뜨린 답.</div></div>
<div class="q" data-qid="q4" data-nodes="vec.cross"><div class="qn">확인 4 · 외적의 의미</div><div class="qb">Ex01의 답 \(\vec c=(-43,13,1)\)이 맞는지 확인하는 가장 직접적인 방법은?</div><ol class="choices"><li data-ok="1">\(\vec a\cdot\vec c=0\)과 \(\vec b\cdot\vec c=0\)을 계산한다</li><li>\(|\vec c|=|\vec a|+|\vec b|\)인지 본다</li><li>\(\vec c=\vec a+\vec b\)인지 본다</li><li>\(\vec a\times\vec c=\vec 0\)인지 본다</li></ol><div class="ans">외적은 두 벡터에 모두 수직 → 내적 0 두 개: \(-43+39+4=0\), \(-86+91-5=0\).</div></div>
<div class="q" data-qid="q5" data-nodes="vec.cross lin.cofactor"><div class="qn">확인 5 · 표준기저벡터</div><div class="qb">\(\vec i\times\vec j=\begin{vmatrix}\vec i&\vec j&\vec k\\1&0&0\\0&1&0\end{vmatrix}\)의 값은?</div><ol class="choices"><li data-ok="1">\(\vec k\)</li><li>\(-\vec k\)</li><li>\(\vec 0\)</li><li>\(1\)</li></ol><div class="ans">\(\vec i\): \(0\cdot0-0\cdot1=0\), \(\vec j\): \(-(1\cdot0-0\cdot0)=0\), \(\vec k\): \(1\cdot1-0\cdot0=1\) → \(\vec k\) (교재 12.4 Example 2). 결과는 벡터라 4번처럼 수가 되지 않는다.</div></div>
<div class="q" data-qid="q6" data-nodes="vec.line_eq vec.unit"><div class="qn">확인 6 · 방향코사인</div><div class="qb">원점과 P₀(2, −1, 2)를 지나는 직선의 방향코사인 (l, m, n)은?</div><ol class="choices"><li data-ok="1">\(\pm\left(\tfrac23,\ -\tfrac13,\ \tfrac23\right)\)</li><li>\((2,\ -1,\ 2)\)</li><li>\(\pm\left(\tfrac29,\ -\tfrac19,\ \tfrac29\right)\)</li><li>\(\left(\tfrac23,\ \tfrac13,\ \tfrac23\right)\)만</li></ol><div class="ans">\(|\overrightarrow{OP_0}|=\sqrt{4+1+4}=3\) → 성분 ÷ 3. 직선은 양방향이라 ± (판서 6). 3번은 크기의 제곱으로 나눈 실수.</div></div>
<div class="q" data-qid="q7" data-nodes="vec.line_eq"><div class="qn">확인 7 · 방향비</div><div class="qb">원점과 P₀(x₀, y₀, z₀)를 지나는 직선의 방향비 l : m : n은?</div><ol class="choices"><li data-ok="1">\(x_0 : y_0 : z_0\)</li><li>\(x_0^2 : y_0^2 : z_0^2\)</li><li>\(1 : 1 : 1\)</li><li>\(|\overrightarrow{OP_0}| : 1 : 1\)</li></ol><div class="ans">\(l, m, n\)의 ±와 분모 \(|\overrightarrow{OP_0}|\)는 공통이라 비에서 사라지고 분자 \(x_0, y_0, z_0\)만 남는다.</div></div>
<div class="q" data-qid="q8" data-nodes="vec.line_eq"><div class="qn">확인 8 · 매개·대칭방정식</div><div class="qb">점 (1, 2, 3)을 지나고 방향벡터 \(\vec v=(2,-1,4)\)에 평행한 직선의 매개방정식과 대칭방정식을 써라.</div><div class="ans">\(\overrightarrow{P_0P}=t\vec v\) → 매개 \(x=1+2t,\ y=2-t,\ z=3+4t\) · 대칭 \(\frac{x-1}{2}=\frac{y-2}{-1}=\frac{z-3}{4}\ (=t)\). 검산: t = 1이면 (3, 1, 7) — 세 분수 모두 1.</div></div>
</body></html>'''

for k, v in F.items():
    html = html.replace("{FIG:" + k + "}", v)
assert "{FIG:" not in html
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("->", OUT, len(html))
