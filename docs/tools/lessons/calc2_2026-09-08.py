# -*- coding: utf-8 -*-
"""미분적분학2 · 2026-09-08 수업 노트 (결석 회차 — 학습지 Lecture 2-1 (4)~(7) + 아토 풀이 검산본으로 재구성. 근거: 2026-09-08/정리.md)"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\미분적분학2\_수업노트\2026-09-08.html"

fig_cof = canvas(560, 200,
    mat(30, 30, [["a_11", "a_12", "a_13"], ["a_21", "a_22", "a_23"], ["a_31", "a_32", "a_33"]], 44, 28, bars=True, hl=(0, 1)),
    line(30, 30 + 14, 162, 30 + 14, RED, 1.2, "3 3"), line(30 + 66, 30, 30 + 66, 114, RED, 1.2, "3 3"),
    text(96, 138, "a₁₂ 의 행·열을 지우면", 12, INK, "middle"), text(96, 156, "남는 2×2 = 소행렬식 M₁₂", 12, INK, "middle", True),
    mat(230, 40, [["+", "−", "+"], ["−", "+", "−"], ["+", "−", "+"]], 30, 26, bars=True), text(275, 130, "부호판 (−1)^(i+j)", 12, INK, "middle"),
    text(430, 44, "M_ij : 소행렬식 (minor)", 13, INK, "middle"), text(430, 68, "A_ij = (−1)^(i+j) M_ij : 여인수", 13.5, RED, "middle", True),
    text(430, 100, "det A = a₁₁A₁₁ + a₁₂A₁₂ + a₁₃A₁₃", 13, INK, "middle", True), text(430, 122, "(1행 기준 전개 — 어느 행·열이든 값은 같다)", 11.5, GRAY, "middle"),
    text(430, 152, "0 이 많은 행·열을 고르면 계산이 준다", 12, GREEN, "middle"),
    cap="여인수 전개: 3차를 2차 셋으로 쪼갠다. 부호는 여인수(부호판)가 결정.")

fig_inv2 = canvas(560, 130,
    mat(40, 26, [["a", "b"], ["c", "d"]], 34, 28), text(74, 104, "A", 13, INK, "middle"),
    arrow(120, 54, 170, 54, GREEN, "⁻¹", 2, 0, -8),
    text(190, 60, "1/(ad − bc)", 14, INK, "middle"), mat(250, 26, [["d", "−b"], ["−c", "a"]], 34, 28, hl=[(0, 0), (1, 1)]),
    text(284, 104, "주대각 맞바꾸고, 부대각에 −", 12, INK, "middle"),
    text(450, 46, "det A = 0 이면 역행렬 없음", 13, RED, "middle", True), text(450, 70, "AA⁻¹ = A⁻¹A = I", 13, INK, "middle"), text(450, 94, "Ex07 [4 1; 6 2] → det 2 → [1 −½; −3 2]", 11.5, GRAY, "middle"),
    cap="2×2 역행렬: 외워 두는 공식 하나. 나눗셈 대신 「역행렬을 곱한다」.")

fig_adj = canvas(560, 140,
    fbox(14, 26, 100, 56, "det A", INK, sub="≠ 0 확인", size=14), arrow(116, 54, 146, 54, GREEN, "", 2),
    fbox(150, 26, 120, 56, "여인수 9개", BLUE, sub="A_ij = (−1)^(i+j)M_ij", size=13), arrow(272, 54, 302, 54, GREEN, "", 2),
    fbox(306, 26, 110, 56, "adj(A)", BLUE, sub="여인수 행렬의 전치", size=14), arrow(418, 54, 448, 54, GREEN, "", 2),
    fbox(452, 26, 98, 56, "÷ det A", RED, sub="A⁻¹ = adj/det", size=13),
    text(280, 118, "「행렬은 괄호, 행렬식은 세로줄」 · 「선언 필수」(A, X, B 가 무엇인지 먼저)", 12, GRAY, "middle"),
    cap="3×3 역행렬의 수순(Ex8 ★). det → 여인수 → 전치 → 나누기.")

fig_cramer = canvas(560, 170,
    mat(30, 30, [["a_11", "a_12", "a_13"], ["a_21", "a_22", "a_23"], ["a_31", "a_32", "a_33"]], 42, 26, bars=True), text(93, 128, "det A", 13, INK, "middle", True),
    mat(200, 30, [["b_1", "a_12", "a_13"], ["b_2", "a_22", "a_23"], ["b_3", "a_32", "a_33"]], 42, 26, bars=True, hl=[(0, 0), (1, 0), (2, 0)]), text(263, 128, "det A₁ (1열 → B)", 13, RED, "middle", True),
    text(430, 50, "x_j = det(A_j) / det(A)", 15, INK, "middle", True), text(430, 76, "A_j = A 의 j 열을 상수항 B 로 교체", 12.5, INK, "middle"),
    text(430, 104, "조건 det A ≠ 0", 13, RED, "middle", True), text(430, 130, "j = 1 이면 b 가 맨 앞 열, j = n 이면 맨 뒤 열", 11.5, GRAY, "middle"),
    text(280, 158, "Ex10: det A = 9, det A₁ = 20, det A₂ = −3, det A₃ = 22 → x = (20/9, −1/3, 22/9)", 12, GRAY, "middle"),
    cap="크래머의 법칙: 열 하나를 상수항으로 바꾼 행렬식을 원래 행렬식으로 나눈다.")

fig_solve = canvas(560, 120,
    fbox(14, 24, 110, 54, "선언", INK, sub="A, X, B 가 무엇인지", size=13), arrow(126, 51, 152, 51, GREEN, "", 1.8),
    fbox(156, 24, 90, 54, "AX = B", BLUE, size=14), arrow(248, 51, 274, 51, GREEN, "", 1.8),
    fbox(278, 24, 120, 54, "왼쪽에 A⁻¹", BLUE, sub="교환법칙 ✗ — 위치 주의", size=13), arrow(400, 51, 426, 51, GREEN, "", 1.8),
    fbox(430, 24, 120, 54, "X = A⁻¹B → 검산", RED, sub="대입해 확인", size=13),
    cap="역행렬로 연립방정식 풀기(Ex9). 행렬은 괄호, 행렬식은 세로줄.")

fig_types = canvas(560, 130,
    fbox(10, 20, 104, 44, "3차 행렬식", INK, sub="사루스", size=12), fbox(120, 20, 104, 44, "det = 0 인 x", INK, sub="2차방정식", size=12),
    fbox(230, 20, 104, 44, "여인수 전개", INK, sub="기준 줄 선언", size=12), fbox(340, 20, 104, 44, "3×3 역행렬 ★", RED, sub="det→여인수→전치→÷", size=11.5), fbox(450, 20, 100, 44, "연립방정식", RED, sub="A⁻¹B · 크래머", size=12),
    text(280, 92, "한 도구(행렬식)의 다섯 쓰임 — 표기 감점: det·세로줄 · 괄호 · × 금지", 12, GRAY, "middle"),
    cap="중간고사 행렬 파트 2~3문제의 유형(9/3 발언 기준). 답을 구했으면 대입 검산까지.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>미분적분학2 · 9/8 여인수 전개 · 역행렬 · 크래머의 법칙</title></head><body>
<header>
<h1>행렬 파트의 본체 — 여인수 전개, 역행렬, 크래머의 법칙</h1>
<p class="lead">이 회차(결석)는 학습지 p.7~14와 아토가 손으로 푼 Ex05~Ex10(아톰 검산: 전부 정답)으로 재구성했다. 9/3에 "시험은 행렬식부터, 손계산 3차까지"라고 했으니 <b>3×3 역행렬(Ex8)·크래머(Ex10)·여인수 전개(Ex06)</b>가 중간고사 행렬 파트의 유형이다. 교수님이 말로 보탠 것·건너뛴 것은 알 수 없다.</p>
<p class="meta"><span>결석 회차 · 학습지 (4)~(7) 재구성</span><span>Ex05~Ex10 아토 풀이 검산 완료</span><span>2주차 · 화</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 소행렬식과 여인수 — 3차를 2차로 쪼갠다 ★</h2>
{fig_cof}
<div class="formula">\\[M_{{ij}}=a_{{ij}}\\text{{의 행·열을 뺀 }}(n-1)\\text{{차 행렬식}},\\quad A_{{ij}}=(-1)^{{i+j}}M_{{ij}},\\quad \\det A=a_{{11}}A_{{11}}+a_{{12}}A_{{12}}+a_{{13}}A_{{13}}=a_{{11}}M_{{11}}-a_{{12}}M_{{12}}+a_{{13}}M_{{13}}\\]</div>
<div class="why">사루스는 성분이 크거나 문자면 복잡하다. 대신 한 행(또는 열)을 기준으로 잡고, 각 성분 × 그 성분의 <b>여인수</b>를 더하면 행렬식 — <b>어느 행·열을 기준으로 잡아도 값은 같다</b>(아토 필기 "기준을 선언"). 그래서 0이 많은 줄을 고른다. 부호는 부호판 \\(+-+/-+-/+-+\\).</div>
<details class="ex"><summary>Ex05 \\(A=\\begin{{bmatrix}}1&2&3\\\\4&5&6\\\\7&8&9\\end{{bmatrix}}\\)의 소행렬식·여인수 (검산 ✓)</summary><div class="body"><p>\\(M_{{11}}=5\\cdot9-6\\cdot8=-3\\), \\(M_{{12}}=4\\cdot9-6\\cdot7=-6\\), \\(M_{{13}}=-3\\), \\(M_{{22}}=1\\cdot9-3\\cdot7=-12\\) … 여인수는 부호판: \\(A_{{12}}=+6\\), \\(A_{{21}}=+6\\), \\(A_{{22}}=-12\\), \\(A_{{23}}=+6\\), \\(A_{{32}}=+6\\), 나머지 \\(-3\\). \\(\\det A=1(-3)+2(6)+3(-3)=0\\) — 행 1·2·3이 등차라 특이행렬.</p></div></details>
<details class="ex"><summary>Ex06 \\(D=\\begin{{vmatrix}}1&a&b+c\\\\1&b&c+a\\\\1&c&a+b\\end{{vmatrix}}\\) 여인수 전개</summary><div class="body"><p>1열 기준 전개 → 전부 소거 → \\(D=0\\). 빠른 이유: 2열 + 3열 = \\(a+b+c\\)(모든 행 동일) = \\((a+b+c)\\times\\)1열 → 열이 종속 → 0. "왜 0인가"를 물으면 이 논리.</p></div></details>
<div class="analogy">큰 상자를 열어 보니 작은 상자 셋 — 3차 행렬식 하나는 2차 행렬식 셋(각각 부호와 성분이 붙은)으로 풀린다. 4차면 3차 넷 — 그래서 손계산은 3차까지.</div>
<div class="memo"><b>외울 것</b> \\(A_{{ij}}=(-1)^{{i+j}}M_{{ij}}\\) · 부호판 · 기준 행·열 선언, 값은 동일 · 0 많은 줄 선택</div>
</section>

<section class="s" data-id="s2">
<h2>2. 역행렬 — 2×2는 공식, 3×3은 수반행렬 ★</h2>
<div class="formula">\\[AX=B\\ \\Rightarrow\\ X=A^{{-1}}B\\qquad(AA^{{-1}}=A^{{-1}}A=I,\\ \\text{{양변 왼쪽에 }}A^{{-1}})\\]</div>
{fig_inv2}
<div class="why">행렬에는 나눗셈이 없으니 "나누기" 대신 <b>역행렬을 곱한다</b>. 곱은 교환법칙이 없으므로 왼쪽에 곱하면 왼쪽에, 오른쪽이면 오른쪽에(아토 필기 "교환법칙 성립 ✗", "선언 필수"). 2×2는 주대각을 맞바꾸고 부대각에 음의 부호, \\(\\det\\)로 나눈다 — \\(\\det A=0\\)이면 역행렬이 없다.</div>
{fig_adj}
<details class="ex" open><summary>Ex8 ★ \\(A=\\begin{{bmatrix}}1&2&0\\\\2&1&2\\\\-1&3&0\\end{{bmatrix}}\\) — 3×3 역행렬 수순</summary><div class="body"><p>① \\(\\det A=(0-4+0)-(0+6+0)=-10\\). ② 여인수: \\(A_{{11}}=-6,\\ A_{{12}}=-2,\\ A_{{13}}=7;\\ A_{{21}}=0,\\ A_{{22}}=0,\\ A_{{23}}=-5;\\ A_{{31}}=4,\\ A_{{32}}=-2,\\ A_{{33}}=-3\\). ③ 전치 → \\(\\mathrm{{adj}}(A)=\\begin{{bmatrix}}-6&0&4\\\\-2&0&-2\\\\7&-5&-3\\end{{bmatrix}}\\). ④ \\(A^{{-1}}=\\dfrac{{1}}{{-10}}\\mathrm{{adj}}(A)=\\begin{{bmatrix}}3/5&0&-2/5\\\\1/5&0&1/5\\\\-7/10&1/2&3/10\\end{{bmatrix}}\\) ✓. 아토가 별표 친 문제 — 이 수순 그대로가 시험 유형.</p></div></details>
<div class="analogy">숫자 \\(5\\)의 역수 \\(1/5\\)를 곱하면 1이 되듯, \\(A^{{-1}}\\)를 곱하면 \\(I\\). 역수가 없는 숫자가 0뿐이듯, 역행렬이 없는 행렬은 \\(\\det=0\\)인 것.</div>
<div class="memo"><b>외울 것</b> 2×2: \\(\\frac1{{ad-bc}}\\begin{{bmatrix}}d&-b\\\\-c&a\\end{{bmatrix}}\\) · 3×3: \\(A^{{-1}}=\\mathrm{{adj}}(A)/\\det A\\), adj = 여인수 행렬의 전치 · \\(\\det=0\\)이면 없음</div>
</section>

<section class="s" data-id="s3">
<h2>3. 역행렬로 연립방정식 풀기 — Ex9</h2>
{fig_solve}
<div class="formula">\\[\\begin{{cases}}x+2y=1\\\\3x+y=1\\end{{cases}}\\ \\Rightarrow\\ A=\\begin{{bmatrix}}1&2\\\\3&1\\end{{bmatrix}},\\ B=\\begin{{bmatrix}}1\\\\1\\end{{bmatrix}},\\ \\det A=-5,\\ A^{{-1}}=-\\tfrac15\\begin{{bmatrix}}1&-2\\\\-3&1\\end{{bmatrix}},\\ X=A^{{-1}}B=\\begin{{bmatrix}}1/5\\\\2/5\\end{{bmatrix}}\\]</div>
<div class="why">"선언"부터: \\(A\\)(계수), \\(X\\)(미지수), \\(B\\)(상수항)가 무엇인지 쓰고 \\(AX=B\\). 그다음 \\(A^{{-1}}\\)를 <b>왼쪽에</b> 곱한다. 검산은 대입: \\(\\tfrac15+\\tfrac45=1\\), \\(\\tfrac35+\\tfrac25=1\\) ✓. 9/1 첫 시간의 "행렬은 연립방정식을 푸는 도구"가 여기서 실현된다.</div>
<div class="analogy">자물쇠(\\(A\\))에 맞는 열쇠(\\(A^{{-1}}\\))를 돌리면 안의 물건(\\(X\\))이 바로 나온다. 열쇠를 만드는 비용이 역행렬 계산.</div>
<div class="memo"><b>외울 것</b> \\(AX=B\\Rightarrow X=A^{{-1}}B\\) · 선언 → 역행렬 → 왼쪽 곱 → 대입 검산 · Ex9 \\((1/5,\\,2/5)\\)</div>
</section>

<section class="s" data-id="s4">
<h2>4. 크래머의 법칙 — 역행렬 없이 행렬식만으로 ★</h2>
{fig_cramer}
<div class="formula">\\[\\det A\\ne0:\\quad x_j=\\frac{{\\det(A_j)}}{{\\det(A)}},\\qquad A_j=A\\text{{의 }}j\\text{{열을 }}B\\text{{로 바꾼 행렬}}\\]</div>
<details class="ex" open><summary>Ex10 \\(x_1+2x_2+x_3=4,\\ x_1-x_2+x_3=5,\\ 2x_1+3x_2-x_3=1\\)</summary><div class="body"><p>\\(\\det A=\\begin{{vmatrix}}1&2&1\\\\1&-1&1\\\\2&3&-1\\end{{vmatrix}}=9\\), \\(\\det A_1=\\begin{{vmatrix}}4&2&1\\\\5&-1&1\\\\1&3&-1\\end{{vmatrix}}=20\\), \\(\\det A_2=-3\\), \\(\\det A_3=22\\) → \\(x_1=\\tfrac{{20}}9,\\ x_2=-\\tfrac13,\\ x_3=\\tfrac{{22}}9\\). 검산(1식): \\(\\tfrac{{20}}9-\\tfrac69+\\tfrac{{22}}9=\\tfrac{{36}}9=4\\) ✓.</p></div></details>
<div class="why">3차 이상 연립방정식을 빠르게 푸는 도구 — 9/1 도입부에서 "행렬식 계산법을 익혀야 한다"고 한 이유. 아토의 여백 질문 "j에 1을 못 넣지 않나?" → 일반형 표기일 뿐: \\(j=1\\)이면 \\(b\\)가 맨 앞 열(Ex10의 \\(\\det A_1\\)), \\(j=n\\)이면 맨 뒤 열.</div>
<div class="analogy">투표 결과를 열 하나만 바꿔 다시 세는 것: 원래 결과(\\(\\det A\\)) 대비 바뀐 결과(\\(\\det A_j\\))의 비가 그 미지수의 값.</div>
<div class="memo"><b>외울 것</b> \\(x_j=\\det A_j/\\det A\\) · \\(\\det A\\ne0\\) 조건 · 행렬식 4개(3차) 계산 → 사루스 또는 여인수 · Ex10 \\((20/9,-1/3,22/9)\\)</div>
</section>

<section class="s" data-id="s5">
<h2>5. 시험 대비 — 이 회차가 행렬 파트의 유형</h2>
{fig_types}
<table><tr><th>유형</th><th>학습지</th><th>핵심 동작</th></tr>
<tr><td>3차 행렬식(수치)</td><td>예제 4(9/3)</td><td>사루스, 곱 6개 따로</td></tr>
<tr><td>\\(\\det=0\\)인 \\(x\\)</td><td>예제 3(9/3)</td><td>2차방정식 → 인수분해</td></tr>
<tr><td>여인수 전개(문자·큰 수)</td><td>Ex06</td><td>기준 줄 선언, 부호판, "왜 0인가"</td></tr>
<tr><td>3×3 역행렬</td><td>Ex8 ★</td><td>det → 여인수 9개 → 전치 → 나누기</td></tr>
<tr><td>연립방정식</td><td>Ex9·Ex10</td><td>\\(X=A^{{-1}}B\\) 또는 크래머</td></tr></table>
<div class="why">표기 감점 항목(9/3): \\(\\det\\)·세로줄, 행렬은 괄호, × 금지. 답을 구했으면 <b>대입 검산</b>까지가 답안. 9/15 발언 "12.1은 시험 X, 벡터부터 중간 범위"와 별도로 행렬 파트는 이 유형에서 2~3문제.</div>
<div class="analogy">다섯 유형은 한 도구(행렬식)의 다섯 쓰임 — 계산·방정식·전개·역행렬·해. 도구 하나를 다섯 방향에서 익히면 어느 문제가 나와도 같은 손놀림.</div>
<div class="memo"><b>외울 것</b> 유형 5 · 표기 감점 3 · 검산 필수 · 할 일: Ex06(다른 행 기준)·Ex8·Ex10 답 가리고 재풀이, 시간 재기</div>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 여인수</div><div class="qb">여인수 \\(A_{{ij}}\\)와 소행렬식 \\(M_{{ij}}\\)의 관계는?</div><ol class="choices"><li data-ok="1">\\(A_{{ij}}=(-1)^{{i+j}}M_{{ij}}\\)</li><li>\\(A_{{ij}}=M_{{ij}}\\)</li><li>\\(A_{{ij}}=(-1)^{{ij}}M_{{ij}}\\)</li><li>\\(A_{{ij}}=M_{{ji}}\\)</li></ol><div class="ans">부호판 \\(+-+/-+-/+-+\\). 지수는 \\(i+j\\).</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · Ex05</div><div class="qb">\\(A=\\begin{{bmatrix}}1&2&3\\\\4&5&6\\\\7&8&9\\end{{bmatrix}}\\)의 여인수 \\(A_{{12}}\\)는?</div><ol class="choices"><li data-ok="1">\\(+6\\)</li><li>\\(-6\\)</li><li>\\(-3\\)</li><li>\\(+3\\)</li></ol><div class="ans">\\(M_{{12}}=4\\cdot9-6\\cdot7=-6\\), 부호 \\((-1)^{{3}}=-1\\) → \\(+6\\).</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 2×2 역행렬</div><div class="qb">\\(A=\\begin{{bmatrix}}4&1\\\\6&2\\end{{bmatrix}}\\)의 역행렬은?</div><ol class="choices"><li data-ok="1">\\(\\begin{{bmatrix}}1&-1/2\\\\-3&2\\end{{bmatrix}}\\)</li><li>\\(\\begin{{bmatrix}}2&-1\\\\-6&4\\end{{bmatrix}}\\)</li><li>\\(\\begin{{bmatrix}}4&-1\\\\-6&2\\end{{bmatrix}}\\)</li><li>\\(\\begin{{bmatrix}}1/4&1\\\\1/6&1/2\\end{{bmatrix}}\\)</li></ol><div class="ans">\\(\\det=2\\), \\(\\frac12\\begin{{bmatrix}}2&-1\\\\-6&4\\end{{bmatrix}}\\). 2번은 나누기를 빠뜨린 것.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 수반행렬</div><div class="qb">3×3 역행렬 \\(A^{{-1}}=\\mathrm{{adj}}(A)/\\det A\\)에서 \\(\\mathrm{{adj}}(A)\\)는?</div><ol class="choices"><li data-ok="1">여인수 행렬의 전치</li><li>여인수 행렬 그대로</li><li>소행렬식 행렬</li><li>\\(A\\)의 전치</li></ol><div class="ans">\\([A_{{ij}}]^T\\) — 행과 열을 바꾼다(Ex8에서 전치 확인).</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 크래머</div><div class="qb">Ex10에서 \\(\\det A=9\\), \\(\\det A_2=-3\\)일 때 \\(x_2\\)는?</div><ol class="choices"><li data-ok="1">\\(-1/3\\)</li><li>\\(-3\\)</li><li>\\(3\\)</li><li>\\(-27\\)</li></ol><div class="ans">\\(x_2=\\det A_2/\\det A=-3/9\\).</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · Ex9</div><div class="qb">\\(x+2y=1\\), \\(3x+y=1\\)을 역행렬로 풀라(선언 → 역행렬 → 곱 → 검산).</div><div class="ans">\\(A=\\begin{{bmatrix}}1&2\\\\3&1\\end{{bmatrix}}\\), \\(X=\\begin{{bmatrix}}x\\\\y\\end{{bmatrix}}\\), \\(B=\\begin{{bmatrix}}1\\\\1\\end{{bmatrix}}\\); \\(\\det A=-5\\), \\(A^{{-1}}=-\\frac15\\begin{{bmatrix}}1&-2\\\\-3&1\\end{{bmatrix}}\\); \\(X=A^{{-1}}B=(1/5,\\,2/5)\\). 대입: \\(1/5+4/5=1\\), \\(3/5+2/5=1\\) ✓.</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
