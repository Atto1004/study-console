# -*- coding: utf-8 -*-
"""미분적분학2 · 2026-09-01 수업 노트 (근거: 2026-09-01/정리.md 녹음 35분 · 학습지_정리.md Lecture 2-1 (1))"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\미분적분학2\_수업노트\2026-09-01.html"

fig_why = canvas(560, 150,
    text(90, 44, "2x + 3y − z = 1", 14, INK, "middle"), text(90, 70, "x − y + 4z = 5", 14, INK, "middle"), text(90, 96, "3x + 2y + z = 0", 14, INK, "middle"),
    text(90, 128, "미지수가 많아지면 소거법이 느리다", 11.5, GRAY, "middle"),
    arrow(190, 70, 240, 70, GREEN, "계수만 뽑기", 2, 0, -10),
    mat(260, 30, [[2, 3, -1], [1, -1, 4], [3, 2, 1]], 34, 26), text(311, 128, "계수행렬 A (3×3)", 12, INK, "middle"),
    text(470, 56, "행렬 = 숫자의", 13, INK, "middle", True), text(470, 76, "직사각형 배열", 13, INK, "middle", True), text(470, 104, "연립방정식을 푸는 도구", 12, GRAY, "middle"),
    cap="행렬이 등장하는 이유. 미지수 4개 이상이면 중학교식 소거법은 복잡·느리다 → 계수만 배열로 다룬다.")

fig_def = canvas(560, 170,
    mat(40, 26, [["a_11", "a_12", "…", "a_1n"], ["a_21", "a_22", "…", "a_2n"], ["⋮", "", "", "⋮"], ["a_m1", "a_m2", "…", "a_mn"]], 52, 28, hl=(1, 1)),
    text(146, 158, "m × n 행렬 A = (a_ij)", 13, INK, "middle", True),
    arrow(300, 30, 300, 120, BLUE, "", 1.8), text(316, 80, "행 i (row, 가로) m 개", 12.5, BLUE),
    arrow(330, 140, 470, 140, GREEN, "", 1.8), text(400, 158, "열 j (column, 세로) n 개", 12.5, GREEN, "middle"),
    text(430, 60, "a_ij = i 행 j 열 성분", 13, RED, "middle", True), text(430, 104, "행렬은 대문자 A, 성분은 소문자 a", 12, GRAY, "middle"),
    cap="정의: 행 m 개 × 열 n 개. 첨자 순서는 「행 먼저, 열 나중」 — a₂₂ 처럼 강조된 칸은 2행 2열.")

fig_kinds = canvas(560, 200,
    mat(20, 30, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], 26, 24), text(59, 118, "단위행렬 I₃", 12, INK, "middle", True), text(59, 134, "대각 1, 나머지 0 = 숫자 1", 10.5, GRAY, "middle"),
    mat(130, 30, [[0, 0], [0, 0]], 26, 24), text(156, 118, "영행렬 O", 12, INK, "middle", True), text(156, 134, "전부 0 = 숫자 0", 10.5, GRAY, "middle"),
    mat(230, 30, [[1, 2], [3, 4]], 26, 24), arrow(290, 54, 320, 54, GREEN, "ᵀ", 1.8, 0, -6), mat(326, 30, [[1, 3], [2, 4]], 26, 24), text(300, 118, "전치행렬 Aᵀ", 12, INK, "middle", True), text(300, 134, "행 ↔ 열 (a_ij → a_ji)", 10.5, GRAY, "middle"),
    band(420, 30, 510, 102, 9, RED, .14), mat(420, 30, [[0, 5, 3], [5, 6, 7], [3, 7, 12]], 30, 24), text(465, 118, "대칭행렬 Aᵀ = A", 12, INK, "middle", True), text(465, 134, "대각선 기준 거울", 10.5, GRAY, "middle"),
    text(280, 176, "+ 정사각행렬(n×n, n차) — 단위·대칭은 정사각행렬에서만", 12.5, INK, "middle"),
    cap="정의02 의 다섯 종류. 단위행렬은 1, 영행렬은 0 의 역할(A·I = A, A·O = O).")

fig_ex = canvas(560, 150,
    mat(30, 24, [[2, 0, 0], [0, 2, 0], [0, 0, 2]], 24, 22), text(66, 106, "(a) 대칭 ✓", 12, GREEN, "middle", True),
    mat(150, 24, [[1, 2, 3], [0, 4, 5], [0, 0, 6]], 24, 22), text(186, 106, "(b) ✗ 상삼각", 12, RED, "middle", True),
    mat(270, 24, [[1, 2, 3], [4, 5, 6]], 24, 22), text(306, 106, "(c) 정사각 아님", 12, GRAY, "middle", True), text(306, 122, "→ 대칭 논할 수 없음", 10.5, GRAY, "middle"),
    mat(390, 24, [[0, 5, 3], [5, 6, 7], [3, 7, 12]], 26, 22), text(429, 106, "(d) 대칭 ✓", 12, GREEN, "middle", True),
    cap="예제 — 다음 중 대칭행렬은? 판정 순서: ① 정사각인가 ② Aᵀ = A 인가.")

fig_road = canvas(560, 120,
    fbox(10, 24, 76, 50, "(1) 정의", GREEN, sub="9/1 ✓", size=12), arrow(88, 49, 104, 49, GRAY, "", 1.4),
    fbox(106, 24, 76, 50, "(2) 연산", INK, sub="9/3", size=12), arrow(184, 49, 200, 49, GRAY, "", 1.4),
    fbox(202, 24, 80, 50, "(3) 행렬식", INK, sub="9/3 사루스", size=12), arrow(284, 49, 300, 49, GRAY, "", 1.4),
    fbox(302, 24, 80, 50, "(4)(5) 여인수", INK, sub="9/8", size=11.5), arrow(384, 49, 400, 49, GRAY, "", 1.4),
    fbox(402, 24, 70, 50, "(6) 역행렬", RED, sub="9/8", size=12), arrow(474, 49, 490, 49, GRAY, "", 1.4),
    fbox(492, 24, 60, 50, "(7) 크래머", RED, sub="9/8", size=11.5),
    text(280, 104, "학습지 Lecture 2-1 (14p) — 「시험은 여기서 나온다」. Ex01~Ex10 이 사실상 문제은행", 12, GRAY, "middle"),
    cap="행렬 단원의 지도. 세 회차(9/1·9/3·9/8)에 끝내고 12장 벡터로 넘어간다.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>미분적분학2 · 9/1 행렬의 정의와 종류</title></head><body>
<header>
<h1>행렬 — 연립방정식을 푸는 도구, 그리고 다섯 가지 기본 행렬</h1>
<p class="lead">첫 수업 35분. 교재(Stewart)에 행렬 단원이 없어 교수님이 <b>학습지 Lecture 2-1(14p)</b>을 따로 줬고, 그것이 행렬 파트의 유일한 교재다. 오늘은 학습지 (1)절: <b>행렬의 정의</b>와 <b>다섯 가지 기본 행렬</b>(정사각·단위·영·전치·대칭)까지. 계산은 없고 말(용어·표기)을 정하는 날 — 판서는 영어·알파벳 위주라 용어에 익숙해져야 한다.</p>
<p class="meta"><span>녹음 35분</span><span>학습지 Lecture 2-1 (1)</span><span>1주차 · 화</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 왜 행렬인가 — 연립일차방정식의 계수만 뽑는다</h2>
{fig_why}
<div class="why">미지수가 2~3개면 중학교식 소거법으로 풀지만, 4개 이상이면 복잡하고 느리다. 계수만 <b>직사각형 배열</b>로 뽑아 놓고 그 배열을 해석하는 것이 행렬. 뒤에서 배울 행렬식·역행렬·크래머 법칙이 전부 "이 배열로 연립방정식을 푸는 법"이다.</p></div>
<div class="say">"예전엔 4차까지 시험에 냈지만 손으로 푸는 건 3차까지, 그 이상은 컴퓨터의 몫." · "교재가 없으니 도서관에서 행렬·행렬식 교재를 빌려 풀어 보길."</div>
<div class="analogy">엑셀 표. 문제의 숫자를 표에 넣어 두면 "몇 번째 줄, 몇 번째 칸"으로 부를 수 있고, 표 전체를 한 덩어리로 다룰 수 있다.</div>
<div class="memo"><b>외울 것</b> 행렬 = 연립방정식의 계수 배열 · 손계산은 3차까지 · 학습지 = 유일한 교재(시험 출처)</div>
</section>

<section class="s" data-id="s2">
<h2>2. 정의 — m×n 행렬과 성분 a_ij</h2>
{fig_def}
<div class="formula">\\[A=(a_{{ij}})=\\begin{{bmatrix}}a_{{11}}&a_{{12}}&\\cdots&a_{{1n}}\\\\a_{{21}}&a_{{22}}&\\cdots&a_{{2n}}\\\\\\vdots&&&\\vdots\\\\a_{{m1}}&a_{{m2}}&\\cdots&a_{{mn}}\\end{{bmatrix}}\\qquad(\\text{{행 }}m\\text{{개}}\\times\\text{{열 }}n\\text{{개}})\\]</div>
<div class="why"><b>행(row)</b>은 가로, <b>열(column)</b>은 세로. 성분 \\(a_{{ij}}\\)의 첨자는 <b>i = 행, j = 열</b> 순서 — "집합은 대문자, 원소는 소문자"와 같은 이치로 행렬은 대문자 \\(A\\), 성분은 소문자 \\(a_{{ij}}\\). 괄호는 \\([\\ ]\\) 또는 \\((\\ )\\).</div>
<div class="pitfall">\\(a_{{23}}\\)은 "2행 3열"이지 "2열 3행"이 아니다. 행·열을 바꿔 읽으면 전치행렬을 읽는 셈 — 뒤에서 곱셈 조건(앞의 열 수 = 뒤의 행 수)을 틀리는 원인.</div>
<details class="ex"><summary>읽기 연습 — \\(A=\\begin{{bmatrix}}1&2&3\\\\4&5&6\\end{{bmatrix}}\\)</summary><div class="body"><p>행 2개, 열 3개 → \\(2\\times3\\) 행렬. \\(a_{{12}}=2\\)(1행 2열), \\(a_{{23}}=6\\)(2행 3열), \\(a_{{31}}\\)은 없다(3행이 없으니까). 정사각이 아니므로 "몇 차"라고 부르지 않는다. 전치하면 \\(3\\times2\\).</p></div></details>
<div class="analogy">극장 좌석 "3열 7번"처럼, 행렬의 성분도 주소가 두 개(행·열). 주소 순서를 약속해 두어야 서로 같은 칸을 가리킨다.</div>
<div class="memo"><b>외울 것</b> \\(m\\times n\\) = 행 m · 열 n · \\(a_{{ij}}\\): i 행 j 열 · 대문자 = 행렬, 소문자 = 성분</div>
</section>

<section class="s" data-id="s3">
<h2>3. 다섯 가지 기본 행렬 (정의02)</h2>
{fig_kinds}
<table><tr><th>종류</th><th>영어</th><th>정의</th><th>비고</th></tr>
<tr><td>정사각행렬</td><td>square matrix</td><td>행 = 열, \\(n\\times n\\) → \\(n\\)차</td><td>2차·3차부터(1차는 없음)</td></tr>
<tr><td>단위(항등)행렬</td><td>identity / unit, \\(I_n\\)</td><td>대각(\\(i=j\\)) 1, 나머지 0</td><td>숫자 1의 역할: \\(AI=A\\)</td></tr>
<tr><td>영행렬</td><td>zero matrix, \\(O\\)</td><td>모든 성분 0</td><td>숫자 0의 역할: \\(AO=O\\). 대문자 O</td></tr>
<tr><td>전치행렬</td><td>transpose, \\(A^T\\)</td><td>행 ↔ 열 (\\(a_{{ij}}\\to a_{{ji}}\\))</td><td>\\(m\\times n\\to n\\times m\\), 어떤 행렬이든 가능</td></tr>
<tr><td>대칭행렬</td><td>symmetric</td><td>\\(A^T=A\\)</td><td>정사각행렬에서만 의미. 대각선 기준 대칭</td></tr></table>
<div class="why">단위행렬과 영행렬은 숫자 세계의 1과 0을 행렬 세계로 옮긴 것 — 곱해도 안 바뀌고(\\(AI=A\\)), 곱하면 0(\\(AO=O\\)). 전치는 "뒤집기"라 아무 행렬에나 되지만, 대칭은 "뒤집어도 같다"라서 정사각형 모양이어야 비교가 된다.</div>
<div class="analogy">거울 앞에 선 사람: 좌우를 바꾼 것이 전치, 바꿔도 똑같이 보이면 대칭. 직사각형 그림은 거울에 비추면 모양(가로세로)이 바뀌어 "똑같다"를 말할 수 없다.</div>
<div class="memo"><b>외울 것</b> 정사각 · 단위 \\(I\\) · 영 \\(O\\) · 전치 \\(A^T\\) · 대칭 \\(A^T=A\\) · \\(AI=A,\\ AO=O\\)</div>
</section>

<section class="s" data-id="s4">
<h2>4. 예제 — 다음 중 대칭행렬은? (Ex01)</h2>
{fig_ex}
<div class="why">판정 순서 두 단계: ① 정사각인가 — (c)는 \\(2\\times3\\)이라 전치(\\(3\\times2\\))는 되지만 대칭은 논할 수 없다. ② \\(A^T=A\\)인가 — (a) 대각행렬은 뒤집어도 그대로, (d)는 \\(a_{{12}}=a_{{21}}=5\\), \\(a_{{13}}=a_{{31}}=3\\), \\(a_{{23}}=a_{{32}}=7\\)로 대칭. (b)는 상삼각이라 \\(a_{{12}}=2\\ne a_{{21}}=0\\). 대칭이라고 대각선 밖이 0일 필요는 없다.</div>
<div class="say">"뒷자리는 글씨가 안 보일 수 있으니 앞자리에." · 다음: 목요일(9/3) 기본 연산 → 행렬식 계산 시작, 행렬 단원은 다음 주 화요일(9/8) 마무리 — "결석 금지."</div>
<div class="analogy">대칭행렬 판정은 종이를 대각선으로 접어 보는 것 — 겹치는 칸의 숫자가 전부 같으면 대칭.</div>
<div class="memo"><b>외울 것</b> 대칭 판정 = 정사각? → \\(a_{{ij}}=a_{{ji}}\\)? · 학습지 Ex01 4문항 · 다음 9/3 연산·행렬식(시험은 행렬식부터)</div>
</section>

<section class="s" data-id="s5">
<h2>5. 학습지의 구성 — 앞으로 세 회차의 지도</h2>
{fig_road}
<table><tr><th>절</th><th>내용</th><th>수업</th></tr>
<tr><td>(1)</td><td>정의 — \\(m\\times n\\), 다섯 종류, Ex01</td><td>9/1 ✓</td></tr>
<tr><td>(2)</td><td>기본 연산 — 상등·합차·실수배·곱·거듭제곱, Ex02</td><td>9/3</td></tr>
<tr><td>(3)</td><td>행렬식 — 2차 \\(ad-bc\\), 3차 사루스, 예제 3·4</td><td>9/3</td></tr>
<tr><td>(4)(5)</td><td>소행렬식·여인수·여인수 전개, Ex05·06</td><td>9/8</td></tr>
<tr><td>(6)</td><td>역행렬 — \\(\\det A\\ne0\\) 조건, 연립방정식 해, Ex07~09</td><td>9/8</td></tr>
<tr><td>(7)</td><td>크래머의 법칙, Ex10</td><td>9/8</td></tr></table>
<div class="why">9/1 도입부에서 "행렬식 계산법을 익혀야 한다"고 강조한 이유가 (6)(7)에 있다 — 3차 이상 연립방정식을 빠르게 푸는 도구가 목적지. 오늘의 정의는 그 길의 첫 칸.</div>
<div class="analogy">여행 첫날에 지도를 펴 보는 것. 오늘 위치(정의)와 목적지(연립방정식의 해)를 알면 중간 역(연산·행렬식·여인수)이 왜 필요한지 보인다.</div>
<div class="memo"><b>공부 전략</b> 학습지를 인쇄해 예제를 손으로 · Ex01~Ex10 = 문제은행 · 계산 반복(사루스·크래머는 손에 익혀야 실수 없음) · 도서관 행렬 교재 보충</div>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 정의</div><div class="qb">\\(m\\times n\\) 행렬에서 \\(m\\)과 \\(n\\)은?</div><ol class="choices"><li data-ok="1">\\(m\\) = 행(가로줄)의 수, \\(n\\) = 열(세로줄)의 수</li><li>\\(m\\) = 열의 수, \\(n\\) = 행의 수</li><li>\\(m\\) = 성분의 개수, \\(n\\) = 차수</li><li>\\(m=n\\)이어야 한다</li></ol><div class="ans">행 먼저, 열 나중. \\(m\\ne n\\)이어도 행렬이다(정사각이 아닐 뿐).</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 성분</div><div class="qb">\\(a_{{23}}\\)은 어느 성분인가?</div><ol class="choices"><li data-ok="1">2행 3열</li><li>3행 2열</li><li>2열 3행</li><li>23번째 성분</li></ol><div class="ans">\\(a_{{ij}}\\): i = 행, j = 열.</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 대칭행렬</div><div class="qb">대칭행렬의 정의는?</div><ol class="choices"><li data-ok="1">\\(A^T=A\\)인 정사각행렬</li><li>대각선 밖 성분이 모두 0인 행렬</li><li>\\(A^T=-A\\)인 행렬</li><li>행과 열의 수가 같은 행렬</li></ol><div class="ans">뒤집어도 같다. 2번은 대각행렬(대칭의 특수한 경우), 4번은 정사각행렬.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 예제</div><div class="qb">다음 중 대칭행렬은?</div><ol class="choices"><li data-ok="1">\\(\\begin{{bmatrix}}0&5&3\\\\5&6&7\\\\3&7&12\\end{{bmatrix}}\\)</li><li>\\(\\begin{{bmatrix}}1&2&3\\\\0&4&5\\\\0&0&6\\end{{bmatrix}}\\)</li><li>\\(\\begin{{bmatrix}}1&2&3\\\\4&5&6\\end{{bmatrix}}\\)</li><li>\\(\\begin{{bmatrix}}1&2\\\\3&4\\end{{bmatrix}}\\)</li></ol><div class="ans">\\(a_{{ij}}=a_{{ji}}\\) 전부 성립. 2번 상삼각, 3번 정사각 아님, 4번 \\(2\\ne3\\).</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 단위·영행렬</div><div class="qb">단위행렬 \\(I\\)와 영행렬 \\(O\\)의 역할로 옳은 것은?</div><ol class="choices"><li data-ok="1">\\(AI=A\\), \\(AO=O\\) — 숫자 1과 0의 역할</li><li>\\(AI=O\\), \\(AO=A\\)</li><li>\\(AI=I\\), \\(AO=A\\)</li><li>\\(I\\)와 \\(O\\)는 정사각행렬이 아니어도 된다</li></ol><div class="ans">단위행렬은 대각 1(정사각), 영행렬은 전부 0.</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 전치</div><div class="qb">\\(A=\\begin{{bmatrix}}1&2&3\\\\4&5&6\\end{{bmatrix}}\\)의 전치행렬을 쓰고, 이 행렬이 대칭행렬인지 말하라.</div><div class="ans">\\(A^T=\\begin{{bmatrix}}1&4\\\\2&5\\\\3&6\\end{{bmatrix}}\\) (\\(3\\times2\\)). \\(A\\)는 정사각행렬이 아니므로 대칭 여부를 논할 수 없다(전치만 가능).</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
