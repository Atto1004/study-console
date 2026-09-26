# -*- coding: utf-8 -*-
"""미분적분학2 · 2026-09-22 수업 노트 (근거: 2026-09-22/정리.md — 판서 6장(09:45~10:13) + 필기 1장. 녹음 없음. 9:05~9:45 지각 구간(Thm 01 증명)은 교재로 보충)"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\미분적분학2\_수업노트\2026-09-22.html"

fig_cos = canvas(560, 190,
    dot(70, 150, "", 5, INK), text(56, 168, "O", 13, INK, "middle", True), dot(270, 50, "", 5, PINK), text(270, 38, "A", 13, PINK, "middle"), dot(400, 140, "", 5, PINK), text(412, 144, "B", 13, PINK),
    arrow(76, 146, 264, 54, BLUE, "", 3), text(150, 92, "|a⃗|", 13, BLUE, "middle", True), arrow(76, 149, 394, 141, RED, "", 3), text(230, 162, "|b⃗|", 13, RED, "middle", True),
    arrow(394, 136, 276, 56, GREEN, "", 2.6), text(307, 138, "|a⃗ − b⃗|", 13, GREEN, "middle", True), arc(70, 150, 44, -27, -2, GRAY, 1.5, "θ", 54),
    text(452, 40, "코사인 제2법칙 (일각삼변)", 12.5, INK, "middle", True), text(452, 62, "|a−b|² = |a|² + |b|² − 2|a||b|cos θ", 11, INK, "middle"),
    text(452, 96, "한편 |a−b|² = (a−b)·(a−b)", 12, INK, "middle"), text(452, 116, "= |a|² − 2 a·b + |b|²", 12, INK, "middle"),
    text(452, 174, "∴ a⃗·b⃗ = |a⃗||b⃗| cos θ", 14, RED, "middle", True),
    cap="Thm 01 의 증명(교재) — 지각 구간(9:05~9:45)의 내용으로 추정. 두 식의 |a|², |b|² 이 지워지고 내적만 남는다.")

ox, oy = 150, 160
T = p3(ox, oy, 45, 95, 80)
fig_dir = canvas(560, 220,
    axes3d(ox, oy, 100), arrow(ox, oy, T[0], T[1], GREEN, "", 3), dot(T[0], T[1], "", 5, PINK), text(T[0] + 8, T[1] - 6, "a⃗ = (a₁, a₂, a₃)", 12.5, PINK),
    text(ox + 46, oy - 10, "β", 13, RED, "middle", True), text(ox - 4, oy - 60, "γ", 13, RED, "middle", True), text(ox - 30, oy + 12, "α", 13, RED, "middle", True),
    text(430, 44, "방향각 α, β, γ = a⃗ 가 x·y·z 축(i, j, k)과 이루는 각", 12, INK, "middle"),
    text(430, 74, "cos α = (a⃗·i⃗)/(|a⃗||i⃗|) = a₁/|a⃗|", 13, INK, "middle", True), text(430, 96, "cos β = a₂/|a⃗|,   cos γ = a₃/|a⃗|", 13, INK, "middle", True),
    text(430, 126, "ㄱ cos²α + cos²β + cos²γ = 1", 13, RED, "middle", True), text(430, 148, "ㄴ u⃗ = a⃗/|a⃗| = (cos α, cos β, cos γ)", 13, RED, "middle", True),
    text(430, 180, "사이각 공식에 b = i, j, k 를 넣은 것 (|i| = 1 이 지워진다)", 11.5, GRAY, "middle"),
    cap="방향각·방향코사인(판서 ①②). 단위벡터의 성분이 곧 방향코사인 — 정역학 9/9 와 같은 내용.")

fig_ex04 = canvas(560, 150,
    fbox(14, 26, 120, 56, "a⃗ = (3, 4, 5)", INK, sub="i) |a| = √50 = 5√2", size=14), arrow(136, 54, 166, 54, GREEN, "", 2),
    fbox(170, 20, 380, 68, "cos α = 3/(5√2) = 3√2/10 · cos β = 4/(5√2) = 2√2/5 · cos γ = 5/(5√2) = √2/2", RED, sub="α = cos⁻¹(3√2/10), β = cos⁻¹(2√2/5), γ = π/4", size=12),
    text(280, 122, "검산 ㄱ: 18/100 + 32/100 + 50/100 = 1 ✓ · 답은 cos⁻¹( ) 꼴 그대로, 특수각만 값으로", 12, GRAY, "middle"),
    cap="Ex04 (판서 ②③, 답 분홍 박스). 분모의 근호는 유리화해 정리.")

fig_cross = canvas(560, 230,
    path("M50 195 L 270 195 L 330 135 L 110 135 Z", GRAY, 1.5, "rgba(138,151,166,.12)", "4 3"),
    arrow(110, 178, 250, 178, BLUE, "", 3), text(180, 214, "a⃗", 15, BLUE, "middle", True), arrow(110, 178, 190, 142, RED, "", 3), text(150, 150, "b⃗", 15, RED, "middle", True),
    arrow(110, 178, 110, 40, GREEN, "", 3.4), text(124, 46, "c⃗ = a⃗ × b⃗  ⊥ a⃗, ⊥ b⃗", 14, GREEN, "start", True),
    text(440, 60, "[Def 01] 외적 (cross / outer product)", 13, INK, "middle", True),
    text(440, 88, "a⃗ × b⃗ = (a₂b₃ − a₃b₂,  a₃b₁ − a₁b₃,  a₁b₂ − a₂b₁)", 10.5, INK, "middle"),
    mat(340, 104, [["a_2", "a_3"], ["b_2", "b_3"]], 30, 24, bars=True), mat(410, 104, [["a_3", "a_1"], ["b_3", "b_1"]], 30, 24, bars=True), mat(480, 104, [["a_1", "a_2"], ["b_1", "b_2"]], 30, 24, bars=True),
    text(440, 176, "결과는 벡터 — 내적(스칼라)과 다르다", 11.5, RED, "middle"), text(440, 196, "자기 번호 뺀 두 번호 = 순환 (2,3)(3,1)(1,2)", 11, GRAY, "middle"),
    cap="12.4 외적의 정의(판서 ④). 2×2 행렬식 세 개 — 9/3 의 ad − bc 가 여기서 쓰인다.")

fig_der = canvas(560, 150,
    fbox(14, 24, 150, 56, "a⃗ ⊥ c⃗, b⃗ ⊥ c⃗", INK, sub="a·c = 0 (ㄱ), b·c = 0 (ㄴ)", size=13), arrow(166, 52, 196, 52, GREEN, "", 2),
    fbox(200, 24, 150, 56, "ㄱ×b₃ − ㄴ×a₃", BLUE, sub="c₃ 항 소거", size=13), arrow(352, 52, 382, 52, GREEN, "", 2),
    fbox(386, 24, 164, 56, "p·c₁ + q·c₂ = 0", RED, sub="c₁ = q, c₂ = −p 로 택함", size=13),
    text(280, 118, "p = a₁b₃ − a₃b₁,  q = a₂b₃ − a₃b₂  →  c = (a₂b₃−a₃b₂, a₃b₁−a₁b₃, a₁b₂−a₂b₁) = Def 01 ✓", 11.5, GRAY, "middle"),
    cap="[유도] (판서 ⑤⑥) 외적 = 두 벡터에 모두 수직인 벡터를 내적 0 조건으로 구한 것. 칠판의 「ㄱ×b₂」는 ×b₃ 가 맞다.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>미분적분학2 · 9/22 내적 정리 · 방향각·방향코사인 · 외적 정의·유도</title></head><body>
<header>
<h1>12.3 방향각·방향코사인 → 12.4 외적 — "두 벡터에 수직인 벡터"</h1>
<p class="lead">9:45 지각으로 앞 40분(12.3 정리 1의 증명으로 추정)은 못 들었고 녹음도 없어, 그 부분은 교재 증명으로 채웠다. 판서 6장(09:45~10:13)의 내용: <b>방향각·방향코사인</b>(사이각 공식에 i, j, k를 넣은 것)과 Ex04, 그리고 <b>12.4 외적</b>의 정의(2×2 행렬식 셋)와 <b>유도</b>(두 벡터에 수직인 벡터를 내적 0 조건으로). 정역학 9/9(방향여현)·9/14(외적)와 같은 내용이라 서로 예습·복습이 된다.</p>
<p class="meta"><span>판서 6장 (09:45~10:13)</span><span>녹음 없음 · 필기 1장</span><span>교재 12.3~12.4</span><span>4주차 · 화 · 지각 2회 누적</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. Thm 01 증명 — 코사인 제2법칙에서 a·b = |a||b|cos θ (지각 구간 보충)</h2>
{fig_cos}
<div class="formula">\\[|\\vec a-\\vec b|^2=|\\vec a|^2+|\\vec b|^2-2|\\vec a||\\vec b|\\cos\\theta\\quad\\text{{와}}\\quad |\\vec a-\\vec b|^2=(\\vec a-\\vec b)\\cdot(\\vec a-\\vec b)=|\\vec a|^2-2\\,\\vec a\\cdot\\vec b+|\\vec b|^2\\ \\Rightarrow\\ \\vec a\\cdot\\vec b=|\\vec a||\\vec b|\\cos\\theta\\]</div>
<div class="why">9/17 마지막에 세운 삼각형 OAB(\\(\\overrightarrow{{BA}}=\\vec a-\\vec b\\)). 한 각 \\(\\theta\\)와 세 변을 아는 삼각형 = <b>코사인 제2법칙</b>. 같은 변 \\(|\\vec a-\\vec b|^2\\)을 내적의 분배법칙으로도 전개하면 \\(|\\vec a|^2,|\\vec b|^2\\)이 지워지고 \\(\\vec a\\cdot\\vec b\\)만 남는다. 이 부분은 판서에 없어(9:45 이전) 교재 증명 — 녹음이 오면 교수님 순서로 고친다.</div>
<div class="analogy">같은 물건을 두 저울(기하: 코사인법칙, 대수: 성분 전개)로 재서 눈금을 맞추면 미지의 항(내적)이 정해진다.</div>
<div class="memo"><b>외울 것</b> \\(\\vec a\\cdot\\vec b=|\\vec a||\\vec b|\\cos\\theta\\) · \\(\\cos\\theta=\\vec a\\cdot\\vec b/(|\\vec a||\\vec b|)\\) · 증명 = 코사인법칙 + 분배 전개</div>
</section>

<section class="s" data-id="s2">
<h2>2. 방향각과 방향코사인 (판서 ①②) ★</h2>
{fig_dir}
<div class="formula">\\[\\cos\\alpha=\\frac{{\\vec a\\cdot\\vec i}}{{|\\vec a||\\vec i|}}=\\frac{{a_1}}{{|\\vec a|}},\\quad \\cos\\beta=\\frac{{a_2}}{{|\\vec a|}},\\quad \\cos\\gamma=\\frac{{a_3}}{{|\\vec a|}}\\qquad \\text{{ㄱ }}\\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma=1\\qquad \\text{{ㄴ }}\\vec u=\\frac{{\\vec a}}{{|\\vec a|}}=(\\cos\\alpha,\\cos\\beta,\\cos\\gamma)\\]</div>
<div class="why">방향각 = 벡터가 \\(x,y,z\\)축과 이루는 각. 사이각 공식에 \\(\\vec b=\\vec i,\\vec j,\\vec k\\)를 넣으면 분모의 \\(|\\vec i|=1\\)이 지워져(판서에서 1로 그어 지움) <b>성분/크기</b>만 남는다. ㄴ: \\(\\vec a\\)와 같은 방향의 단위벡터(9/17 ★⑤)의 성분이 곧 방향코사인, ㄱ: 그 단위벡터의 크기가 1이라는 뜻. 정역학 9/9 방향여현 \\(\\cos^2\\theta_x+\\cos^2\\theta_y+\\cos^2\\theta_z=1\\)과 같은 식.</div>
<div class="analogy">손전등을 세 방향에서 비춘 그림자 길이 ÷ 막대 길이 = 방향코사인. 세 그림자의 제곱합이 막대 길이의 제곱이라 코사인 제곱합이 1.</div>
<div class="memo"><b>외울 것</b> \\(\\cos\\alpha=a_1/|\\vec a|\\) 등 · ㄱ 제곱합 = 1 · ㄴ 단위벡터 = (cos α, cos β, cos γ)</div>
</section>

<section class="s" data-id="s3">
<h2>3. Ex04 — a = (3, 4, 5)의 방향각 (판서 ②③)</h2>
{fig_ex04}
<div class="formula">\\[|\\vec a|=\\sqrt{{50}}=5\\sqrt2,\\quad \\cos\\alpha=\\frac{{3}}{{5\\sqrt2}}=\\frac{{3\\sqrt2}}{{10}},\\ \\cos\\beta=\\frac{{4}}{{5\\sqrt2}}=\\frac{{2\\sqrt2}}{{5}},\\ \\cos\\gamma=\\frac{{5}}{{5\\sqrt2}}=\\frac{{\\sqrt2}}{{2}}\\ \\Rightarrow\\ \\alpha=\\cos^{{-1}}\\tfrac{{3\\sqrt2}}{{10}},\\ \\beta=\\cos^{{-1}}\\tfrac{{2\\sqrt2}}{{5}},\\ \\gamma=\\tfrac\\pi4\\]</div>
<div class="why">sol. i) 크기 ii) 세 방향코사인 — 9/17의 단계 번호 형식. 분모의 근호는 유리화(9/15 "근호 정리 안 하면 감점"), 답은 \\(\\cos^{{-1}}(\\ )\\) 꼴 그대로 두고 <b>특수각만 값으로</b>(\\(\\sqrt2/2\\to\\pi/4\\)). 검산 ㄱ: \\(18/100+32/100+50/100=1\\) ✓ — 세 코사인의 제곱합으로 스스로 확인할 수 있다.</div>
<div class="say">판서 ③ 옆 cf. \\(\\cos\\theta=\\vec a\\cdot\\vec b/(|\\vec a||\\vec b|)\\) — 방향각은 이 공식의 특수한 경우라는 표시.</div>
<div class="analogy">셋 중 하나(\\(\\gamma=\\pi/4\\))가 특수각으로 떨어지면 나머지는 역코사인으로 두는 것이 정상 — 억지로 소수로 바꾸지 않는다.</div>
<div class="memo"><b>외울 것</b> 수순: 크기 → 성분/크기 → 유리화 → \\(\\cos^{{-1}}\\) · 검산 ㄱ · Ex04 \\(\\gamma=\\pi/4\\)</div>
</section>

<section class="s" data-id="s4">
<h2>4. 12.4 외적(Cross Product) — 정의는 2×2 행렬식 셋 (판서 ④) ★</h2>
{fig_cross}
<div class="formula">\\[\\vec a\\times\\vec b=\\langle a_2b_3-a_3b_2,\\ a_3b_1-a_1b_3,\\ a_1b_2-a_2b_1\\rangle=\\Big(\\begin{{vmatrix}}a_2&a_3\\\\b_2&b_3\\end{{vmatrix}},\\ \\begin{{vmatrix}}a_3&a_1\\\\b_3&b_1\\end{{vmatrix}},\\ \\begin{{vmatrix}}a_1&a_2\\\\b_1&b_2\\end{{vmatrix}}\\Big)\\]</div>
<div class="why">내적은 스칼라, <b>외적은 벡터</b>. 성분마다 자기 번호를 뺀 나머지 두 번호가 <b>순환 순서</b>(2→3, 3→1, 1→2)로 2×2 행렬식(↘ 곱 − ↗ 곱)에 들어간다. 9/3의 \\(ad-bc\\)가 여기서 다시 쓰인다. 정역학 9/14는 같은 것을 3×3 행렬식 \\(\\begin{{vmatrix}}\\mathbf i&\\mathbf j&\\mathbf k\\\\a_1&a_2&a_3\\\\b_1&b_2&b_3\\end{{vmatrix}}\\)로 썼다 — 둘째 성분의 부호(\\(-(a_1b_3-a_3b_1)=a_3b_1-a_1b_3\\))가 같은 것임을 확인해 둘 것.</div>
<details class="ex"><summary>연습 — \\(\\vec a=(1,2,3)\\), \\(\\vec b=(4,5,6)\\)</summary><div class="body"><p>\\((2\\cdot6-3\\cdot5,\\ 3\\cdot4-1\\cdot6,\\ 1\\cdot5-2\\cdot4)=(-3,\\ 6,\\ -3)\\). 검산 \\(\\vec a\\cdot(\\vec a\\times\\vec b)=-3+12-9=0\\) ✓ — 외적은 두 벡터에 수직(§5).</p></div></details>
<div class="analogy">나사를 \\(\\vec a\\)에서 \\(\\vec b\\)로 돌릴 때 나사가 나아가는 방향(정역학 9/14) — 이번 시간은 그 방향의 벡터를 성분으로 쓰는 법.</div>
<div class="memo"><b>외울 것</b> 세 성분 = 2×2 행렬식 셋, 순환 (2,3)(3,1)(1,2) · 결과는 벡터 · 검산 \\(\\vec a\\cdot(\\vec a\\times\\vec b)=0\\)</div>
</section>

<section class="s" data-id="s5">
<h2>5. [유도] 왜 그 성분인가 — 두 벡터에 수직인 벡터 (판서 ⑤⑥)</h2>
{fig_der}
<div class="formula">\\[\\vec a\\perp\\vec c,\\ \\vec b\\perp\\vec c\\ \\Leftrightarrow\\ \\begin{{cases}}a_1c_1+a_2c_2+a_3c_3=0&\\cdots\\text{{ㄱ}}\\\\b_1c_1+b_2c_2+b_3c_3=0&\\cdots\\text{{ㄴ}}\\end{{cases}}\\ \\xrightarrow{{\\text{{ㄱ}}\\times b_3-\\text{{ㄴ}}\\times a_3}}\\ \\underbrace{{(a_1b_3-a_3b_1)}}_{{p}}c_1+\\underbrace{{(a_2b_3-a_3b_2)}}_{{q}}c_2=0\\]</div>
<div class="why">미지수 \\(c_1,c_2,c_3\\) 셋에 식이 둘 — 해가 한 방향으로 무수히 많다(수직인 벡터는 길이만 다르게 무한). \\(c_3\\)을 소거하면 \\(pc_1+qc_2=0\\); 한 해로 \\(c_1=q,\\ c_2=-p=a_3b_1-a_1b_3\\)을 택하고 되돌려 넣으면 \\(c_3=a_1b_2-a_2b_1\\) — 정확히 Def 01. 즉 <b>외적의 정의는 "둘 다에 수직"에서 나온 것</b>. 칠판의 「ㄱ×b₂」는 \\(c_3\\)을 지우려면 <b>×b₃</b>가 맞다(옆 주황 주석과 같다).</div>
<div class="say">판서 ⑤: \\(c_1,c_2,c_3\\) 밑줄(노랑) = unknown. 교수님이 판서 앞에 서 있어 \\(c_3\\) 유도 과정은 사진에 없음(결론만). 다음(9/24): 외적의 성질 — \\(\\vec a\\times\\vec b\\perp\\vec a,\\vec b\\) · \\(|\\vec a\\times\\vec b|=|\\vec a||\\vec b|\\sin\\theta\\) · 평행사변형 넓이 · \\(\\vec b\\times\\vec a=-\\vec a\\times\\vec b\\)(예상).</div>
<div class="analogy">두 벽(\\(\\vec a,\\vec b\\))에 동시에 수직인 기둥의 방향은 하나뿐(길이는 자유). 연립 두 식이 그 기둥의 방향을 정하고, "길이"를 정해 준 것이 Def 01의 성분.</div>
<div class="memo"><b>외울 것</b> 외적 = 두 벡터에 수직 · 유도 = 내적 0 두 식에서 \\(c_3\\) 소거 · 판서 오타 ×b₂ → ×b₃ · 할 일: 임의 \\(\\vec a,\\vec b\\)로 계산 후 \\(\\vec a\\cdot(\\vec a\\times\\vec b)=0\\) 확인</div>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 방향코사인</div><div class="qb">\\(\\vec a=(a_1,a_2,a_3)\\)의 방향각 \\(\\alpha\\)(x축과의 각)에 대해 \\(\\cos\\alpha\\)는?</div><ol class="choices"><li data-ok="1">\\(a_1/|\\vec a|\\)</li><li>\\(a_1\\)</li><li>\\(|\\vec a|/a_1\\)</li><li>\\(a_1/|\\vec a|^2\\)</li></ol><div class="ans">\\(\\cos\\alpha=\\vec a\\cdot\\vec i/(|\\vec a||\\vec i|)\\), \\(|\\vec i|=1\\). 필기의 \\(|a|^2\\)처럼 보이는 곳은 오독 — 제곱 아님.</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · Ex04</div><div class="qb">\\(\\vec a=(3,4,5)\\)의 방향각 \\(\\gamma\\)(z축과의 각)는?</div><ol class="choices"><li data-ok="1">\\(\\pi/4\\)</li><li>\\(\\cos^{{-1}}(3\\sqrt2/10)\\)</li><li>\\(\\pi/3\\)</li><li>\\(\\cos^{{-1}}(1/\\sqrt{{50}})\\)</li></ol><div class="ans">\\(\\cos\\gamma=5/(5\\sqrt2)=\\sqrt2/2\\) → 특수각 \\(\\pi/4\\). 2번은 \\(\\alpha\\).</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 성질 ㄱ</div><div class="qb">방향코사인 사이에 항상 성립하는 식은?</div><ol class="choices"><li data-ok="1">\\(\\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma=1\\)</li><li>\\(\\cos\\alpha+\\cos\\beta+\\cos\\gamma=1\\)</li><li>\\(\\alpha+\\beta+\\gamma=\\pi\\)</li><li>\\(\\cos\\alpha\\cos\\beta\\cos\\gamma=1\\)</li></ol><div class="ans">단위벡터 \\((\\cos\\alpha,\\cos\\beta,\\cos\\gamma)\\)의 크기가 1.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 외적 정의</div><div class="qb">\\(\\vec a\\times\\vec b\\)의 첫째 성분은?</div><ol class="choices"><li data-ok="1">\\(a_2b_3-a_3b_2\\)</li><li>\\(a_1b_1\\)</li><li>\\(a_3b_2-a_2b_3\\)</li><li>\\(a_1b_2-a_2b_1\\)</li></ol><div class="ans">자기 번호(1)를 뺀 (2,3) 순환 행렬식. 3번은 부호 반대(\\(\\vec b\\times\\vec a\\)), 4번은 셋째 성분.</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 유도의 뜻</div><div class="qb">외적 \\(\\vec c=\\vec a\\times\\vec b\\)를 유도할 때 출발한 조건은?</div><ol class="choices"><li data-ok="1">\\(\\vec c\\)가 \\(\\vec a\\)와 \\(\\vec b\\) 둘 다에 수직 — \\(\\vec a\\cdot\\vec c=0,\\ \\vec b\\cdot\\vec c=0\\)</li><li>\\(\\vec c\\)가 \\(\\vec a\\)와 평행</li><li>\\(|\\vec c|=|\\vec a||\\vec b|\\)</li><li>\\(\\vec c=\\vec a+\\vec b\\)</li></ol><div class="ans">두 내적 0 식에서 \\(c_3\\)을 소거해 성분을 정했다.</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 계산과 검산</div><div class="qb">\\(\\vec a=(1,2,3)\\), \\(\\vec b=(4,5,6)\\)의 \\(\\vec a\\times\\vec b\\)를 구하고 \\(\\vec a\\cdot(\\vec a\\times\\vec b)=0\\)임을 확인하라.</div><div class="ans">\\((2\\cdot6-3\\cdot5,\\ 3\\cdot4-1\\cdot6,\\ 1\\cdot5-2\\cdot4)=(-3,6,-3)\\). \\(\\vec a\\cdot(-3,6,-3)=-3+12-9=0\\) ✓ (정역학 9/14 연습과 같은 답).</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
