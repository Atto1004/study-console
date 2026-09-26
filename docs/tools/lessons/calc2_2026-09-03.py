# -*- coding: utf-8 -*-
"""미분적분학2 · 2026-09-03 수업 노트 (근거: 2026-09-03/정리.md + _정리노트/_archive/2026-09-03_행렬연산_행렬식.html — 녹음 62분)"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\미분적분학2\_수업노트\2026-09-03.html"

fig_mul = canvas(560, 190,
    mat(30, 40, [["a_11", "a_12"], ["a_21", "a_22"]], 44, 28, hl=[(0, 0), (0, 1)]), text(74, 118, "A (2×2)", 12, INK, "middle"), text(74, 134, "i 행", 11, RED, "middle"),
    text(130, 82, "·", 22, INK, "middle", True),
    mat(150, 40, [["b_11", "b_12"], ["b_21", "b_22"]], 44, 28, hl=[(0, 1), (1, 1)]), text(194, 118, "B (2×2)", 12, INK, "middle"), text(194, 134, "j 열", 11, RED, "middle"),
    text(250, 82, "=", 20, INK, "middle"),
    mat(270, 40, [["c_11", "c_12"], ["c_21", "c_22"]], 44, 28, hl=(0, 1)), text(314, 118, "AB", 12, INK, "middle"),
    text(450, 50, "c_12 = a_11 b_12 + a_12 b_22", 13, RED, "middle", True), text(450, 74, "i 행 × j 열: 짝지어 곱해 더한다", 12, INK, "middle"),
    text(450, 104, "A(m×n) · B(n×r) → m×r", 13.5, INK, "middle", True), text(450, 126, "앞의 열 수 = 뒤의 행 수 (가운데 n 소거)", 12, GRAY, "middle"), text(450, 150, "그래서 보통 AB ≠ BA", 12, RED, "middle"),
    text(280, 176, "예: [1 2; 3 4]·[0 1; 2 0] = [1·0+2·2  1·1+2·0; 3·0+4·2  3·1+4·0] = [4 1; 8 3]", 11.5, GRAY, "middle"),
    cap="행렬의 곱: 결과의 (i, j) 성분 = 앞 행렬 i 행과 뒤 행렬 j 열의 짝 곱의 합.")

fig_det2 = canvas(560, 120,
    band(66, 34, 122, 84, 10, GREEN, .22), band(122, 34, 66, 84, 10, RED, .16), mat(60, 30, [["a", "b"], ["c", "d"]], 34, 28, bars=True),
    text(94, 104, "det A = ad − bc", 13, INK, "middle", True),
    text(330, 48, "↘ 주대각 곱 (+)  −  ↙ 반대 대각 곱 (−)", 13, INK, "middle"), text(330, 72, "고1 유리함수 y = (ax+b)/(cx+d) 의 역함수에서 보던 ad − bc", 11.5, GRAY, "middle"),
    text(330, 98, "행렬식은 행렬이 아니라 「값」 — det A 또는 |A| (절댓값 아님)", 12, RED, "middle", True),
    cap="2차 행렬식. 세로줄과 det 표기를 반드시 쓴다 — 「당연히 알겠지 하고 안 쓰면 감점」.")

def sarrus(x, y, rows, cw=30, ch=26):
    # 대각선은 글자를 관통하는 선 대신 반투명 띠(획 없음)로 — 글자 위에 선이 겹치지 않는다
    s = ""
    for k in range(3):
        s += band(x + (k + .5) * cw, y + ch * .5, x + (k + 2.5) * cw, y + ch * 2.5, 11, GREEN, .2)
        s += band(x + (k + 2.5) * cw, y + ch * .5, x + (k + .5) * cw, y + ch * 2.5, 11, RED, .15)
    s += mat(x, y, rows, cw, ch, bars=True)
    # 오른쪽에 1·2열 반복
    for i, r in enumerate(rows):
        s += text(x + 3 * cw + cw / 2, y + i * ch + ch / 2 + 5, str(r[0]), 13, GRAY, "middle") + text(x + 4 * cw + cw / 2, y + i * ch + ch / 2 + 5, str(r[1]), 13, GRAY, "middle")
    return s
fig_sarrus = canvas(560, 200,
    sarrus(40, 30, [["a_11", "a_12", "a_13"], ["a_21", "a_22", "a_23"], ["a_31", "a_32", "a_33"]], 42, 30),
    text(146, 140, "↘ 초록 3개 곱의 합  −  ↙ 빨강 3개 곱의 합", 12.5, INK, "middle"),
    text(430, 50, "3차 = 사루스(Sarrus) 법칙", 14, INK, "middle", True),
    text(430, 78, "+ a₁₁a₂₂a₃₃ + a₁₂a₂₃a₃₁ + a₁₃a₂₁a₃₂", 12, GREEN, "middle"), text(430, 100, "− a₁₃a₂₂a₃₁ − a₁₂a₂₁a₃₃ − a₁₁a₂₃a₃₂", 12, RED, "middle"),
    text(430, 132, "「그림 모양이 아니라 3개씩 곱한다」", 12, GRAY, "middle"), text(430, 152, "각 곱을 작게 적어 두고 합산 — 부호 실수 방지", 12, GRAY, "middle"),
    text(280, 186, "2차·3차까지만. 4차 이상은 컴퓨터(계산기 불가) → 다음 시간 여인수 전개", 11.5, INK, "middle"),
    cap="사루스 법칙: 1·2열을 오른쪽에 다시 쓰고 대각선 3개씩. 「왜」가 아니라 정의 — 갖다 쓰면 된다.")

fig_ex4 = canvas(560, 160,
    sarrus(40, 26, [[2, 1, 3], [4, 2, 1], [6, -3, 4]], 30, 26),
    text(300, 48, "+ : 2·2·4 = 16,  1·1·6 = 6,  3·4·(−3) = −36  → −14", 12.5, GREEN, "start"),
    text(300, 76, "− : 3·2·6 = 36,  1·4·4 = 16,  2·1·(−3) = −6  → 46", 12.5, RED, "start"),
    text(300, 108, "det B = −14 − 46 = −60", 15, INK, "start", True),
    text(300, 134, "「세 개를 다 계산해서 조그맣게 써 놓으면 돼요」", 11.5, GRAY, "start"),
    cap="예제 4 — 3차 행렬식 계산. 부호가 섞이므로 + 를 미리 쓰지 말고 곱마다 따로 적은 뒤 합산.")

fig_add = canvas(560, 130,
    mat(30, 30, [[1, 2], [3, 4]], 28, 26), text(60, 100, "A", 12, INK, "middle"), text(96, 60, "+", 18, INK, "middle"),
    mat(112, 30, [[5, 6], [7, 8]], 28, 26), text(142, 100, "B", 12, INK, "middle"), text(178, 60, "=", 18, INK, "middle"),
    mat(194, 30, [[6, 8], [10, 12]], 32, 26, hl=(0, 0)), text(226, 100, "같은 자리끼리", 11.5, RED, "middle"),
    text(300, 60, "·", 1), text(320, 60, "2A =", 15, INK, "middle"), mat(352, 30, [[2, 4], [6, 8]], 28, 26), text(382, 100, "모든 성분에 2", 11.5, INK, "middle"),
    text(470, 48, "같은 꼴(m×n)일 때만", 12, GRAY, "middle"), text(470, 70, "나눗셈은 없다", 12, RED, "middle", True),
    cap="덧셈·실수배는 성분끼리 — 「너무 심플, 시험에 안 나온다」.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>미분적분학2 · 9/3 행렬의 연산과 행렬식</title></head><body>
<header>
<h1>행렬의 연산과 행렬식 — "시험 문제는 행렬식부터 나온다"</h1>
<p class="lead">9/1의 정의에 이어 <b>기본 연산</b>(상등·덧셈·실수배·곱셈·거듭제곱)과 <b>행렬식</b>(2차 \\(ad-bc\\), 3차 사루스 법칙). 교수님이 직접 "중간고사 행렬식 관련 2~3문제, 시험 문제는 여기서부터"라고 했으니 후반부가 중간고사의 출발점이다. 채점은 표기부터: \\(\\det\\)·세로줄 누락 감점, 곱셈에 × 기호 금지, 손계산 3차까지.</p>
<p class="meta"><span>녹음 62분</span><span>학습지 (2)(3) · 예제 2·3·4</span><span>1주차 · 목</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 기본 연산 — 되는 것과 안 되는 것</h2>
<div class="formula">\\[A=B\\ \\Leftrightarrow\\ a_{{ij}}=b_{{ij}}\\ (\\text{{모든 }}i,j)\\qquad A\\pm B=(a_{{ij}}\\pm b_{{ij}})\\ (\\text{{같은 꼴일 때만}})\\qquad kA=(k\\,a_{{ij}})\\]</div>
{fig_add}
<div class="why">덧셈·뺄셈·실수배는 <b>같은 자리 성분끼리</b>. 같은 꼴(\\(m\\times n\\))이어야 더할 수 있다. 곱셈은 다음 절의 규칙대로 되고, <b>나눗셈은 없다</b>(닫혀 있지 않다 — 대신 역행렬, 9/8).</div>
<div class="say">예제 2 (1)(2)(3)에 대해: "1번, 2번은 너무 심플. <b>시험에 안 나온다.</b>" · (3) \\(A-2B\\)는 "수능 2점짜리" — 부호는 그대로 두고 숫자 2만 \\(B\\)에 곱해서 빼는 방식 권장.</div>
<div class="analogy">같은 크기의 두 표를 겹쳐 놓고 칸마다 더하는 것. 크기가 다르면 겹쳐지지 않아 더할 수 없다.</div>
<div class="memo"><b>외울 것</b> 상등·합·실수배 = 성분끼리 · 같은 꼴만 · 나눗셈 없음 · 시험에는 안 나옴(기본)</div>
</section>

<section class="s" data-id="s2">
<h2>2. 곱셈 — 앞의 열 수 = 뒤의 행 수 · 거듭제곱</h2>
{fig_mul}
<div class="formula">\\[A_{{m\\times n}}B_{{n\\times r}}=C_{{m\\times r}},\\qquad c_{{ij}}=\\sum_{{k=1}}^{{n}}a_{{ik}}b_{{kj}}=a_{{i1}}b_{{1j}}+a_{{i2}}b_{{2j}}+\\cdots+a_{{in}}b_{{nj}}\\]</div>
<div class="why">가운데 \\(n\\)이 소거되어야 곱이 정의된다 — 그래서 \\(AB\\)는 되는데 \\(BA\\)는 아예 정의가 안 되기도 하고, 정사각행렬끼리도 보통 \\(AB\\ne BA\\). 교수님은 교재의 인덱스 \\(r\\) 대신 \\(\\Sigma\\)의 인덱스를 고교 수열처럼 \\(k\\)로 통일. <b>거듭제곱</b> \\(A^n=AA\\cdots A\\), \\(A^rA^s=A^{{r+s}}\\), \\((A^r)^s=A^{{rs}}\\).</div>
<div class="say">"저도 계산하다 잘못할 수 있어요. 머릿속에서 안 되면 <b>써 놔야 돼.</b>" · 행렬 곱에 <b>× 기호를 쓰지 말 것</b> — 나중에 외적의 뜻으로 쓰인다. 점을 찍거나 나란히 쓴다.</div>
<details class="ex"><summary>예제 2 (4)(5) — 꼴이 안 맞으면 전치로, 영행렬이 아닌데 제곱이 영행렬</summary><div class="body"><p>(4) \\(A\\)(3×2)와 \\(B\\)(3×2)는 그대로 곱할 수 없다 → \\(B^T\\)(2×3)를 취해 \\(AB^T\\)(3×3) \\(=\\begin{{bmatrix}}14&6&4\\\\24&9&6\\\\26&12&8\\end{{bmatrix}}\\). (5) 3차 행렬 \\(A\\)에 0이 하나도 없는데 \\(A^2=O\\) — "영행렬이 아닌 둘을 곱해도 영행렬이 나올 수 있다"(수능 2~3점 유형). 숫자와 다른 점이다.</p></div></details>
<div class="analogy">기차 연결: 앞 차량의 연결고리 수(열)와 뒤 차량의 고리 수(행)가 맞아야 이어진다. 순서를 바꾸면 고리가 안 맞을 수 있다 — 교환법칙이 없는 이유.</div>
<div class="memo"><b>외울 것</b> \\((m\\times n)(n\\times r)=m\\times r\\) · \\(c_{{ij}}\\) = i 행 · j 열 · \\(AB\\ne BA\\) · × 금지 · \\(A^2=O\\)여도 \\(A\\ne O\\) 가능</div>
</section>

<section class="s" data-id="s3">
<h2>3. 행렬식(determinant) — 오늘의 키 포인트 ★</h2>
<p>행렬식은 행렬이 아니라 <b>값</b>(숫자 또는 문자식). 표기 \\(\\det A\\) 또는 \\(|A|\\) — \\(|A|\\)는 절댓값이 아니니 헷갈리면 \\(\\det A\\)로. 출발점은 연립방정식 \\(AX=B\\): 계수행렬의 행렬식이 <b>해의 존재</b>를 결정한다(9/8 역행렬·크래머로 연결).</p>
{fig_det2}
<div class="say">(32:00) "오늘 배운 거 오늘 바로 하면, <b>중간고사 관련 문제 두세 문제</b>를 낼 예정인데 이 행렬식을 가지고 문제 나오는 파트가 있다. <b>시험 문제는 여기서부터</b> 하나씩 나온다." · (44:43) "중간고사 내용, 결과입니다. 이렇게 써야 돼."</div>
<div class="why">\\(ad-bc\\)는 사실 3차 사루스 규칙의 특수한 경우지만 2차는 공식처럼 쓴다. 표기가 채점 항목: 세로줄 \\(|\\ |\\)과 \\(\\det\\)를 반드시 쓴다 — "당연히 알겠지 하고 안 쓰면 감점."</div>
<div class="analogy">행렬은 "표", 행렬식은 그 표를 한 숫자로 요약한 "점수". 점수가 0이면(9/8) 표가 담은 연립방정식이 제대로 안 풀린다.</div>
<div class="memo"><b>외울 것</b> \\(\\det\\begin{{bmatrix}}a&b\\\\c&d\\end{{bmatrix}}=ad-bc\\) · 행렬식 = 값 · 세로줄·det 표기 필수(감점) · 시험은 여기서부터</div>
</section>

<section class="s" data-id="s4">
<h2>4. 3차 행렬식 — 사루스(Sarrus) 법칙</h2>
{fig_sarrus}
<div class="formula">\\[\\det A=\\underbrace{{a_{{11}}a_{{22}}a_{{33}}+a_{{12}}a_{{23}}a_{{31}}+a_{{13}}a_{{21}}a_{{32}}}}_{{\\searrow\\ 3\\text{{개}}}}-\\underbrace{{\\big(a_{{13}}a_{{22}}a_{{31}}+a_{{12}}a_{{21}}a_{{33}}+a_{{11}}a_{{23}}a_{{32}}\\big)}}_{{\\swarrow\\ 3\\text{{개}}}}\\]</div>
<div class="say">"그림 모양이 중요한 게 아니라 <b>3개씩 곱한다</b>는 것. 왜 그렇게 되냐가 아니라 정의다. 갖다 쓰면 된다." · "3차 행렬식 자체는 머릿속에 암기해야."</div>
<div class="why">1·2열을 오른쪽에 다시 적으면 ↘ 대각선 3개, ↙ 대각선 3개가 보인다. 성분이 크거나 문자면 사루스가 복잡하고 계산기는 못 쓰니, 3차를 2차로 쪼개는 <b>소행렬식·여인수 전개</b>를 9/8에 배운다(중간 범위). 행렬식의 성질을 이용한 계산은 올해부터 뺐다.</div>
<div class="analogy">세 줄짜리 뜨개질: 오른쪽 아래로 세 코, 왼쪽 아래로 세 코. 코를 세는 순서만 지키면 된다.</div>
<div class="memo"><b>외울 것</b> 사루스 = ↘ 3개 합 − ↙ 3개 합 · 1·2열 복사 · 곱마다 작게 적고 합산 · 4차 이상 없음</div>
</section>

<section class="s" data-id="s5">
<h2>5. 예제 3·4 — det = 0인 x · 3차 행렬식 계산</h2>
<details class="ex" open><summary>예제 3 — \\(\\det A=0\\)을 만족하는 \\(x\\)</summary><div class="body"><p>성분에 \\(x\\)가 든 2차 행렬에서 \\(ad-bc=x^2-5x+6=(x-2)(x-3)=0\\) → \\(x=2\\) 또는 \\(3\\). 흐름: <b>행렬식 → 2차방정식 → 인수분해</b>. "실제 시험에서는 답이 하나만 나오게 낸다." 답 표기는 sol 또는 \\(\\therefore\\).</p></div></details>
{fig_ex4}
<div class="why">부호가 섞이므로 +를 미리 쓰지 말고 <b>여섯 곱을 각각</b> 적은 뒤 합산한다. \\(-14-46=-60\\). 예제 3 유형(\\(\\det=0\\)인 \\(x\\))과 예제 4 유형(3차 수치 계산)이 교수님이 말한 "행렬식 문제"의 두 얼굴.</div>
<div class="say">(58:40) 성분이 크거나 문자면 사루스가 복잡 → 다음 주 화요일 소행렬식·여인수. "주말에 강의자료실에 행렬·행렬식 연습문제(답안 포함)를 올린다. 제출은 아니지만 화요일 전까지 풀어올 것" — 사실상 출제 풀.</div>
<div class="analogy">예제 3은 "점수가 0이 되는 \\(x\\)를 찾아라"(방정식), 예제 4는 "점수를 계산하라"(산수). 같은 도구로 묻는 방향만 다르다.</div>
<div class="memo"><b>외울 것</b> \\(\\det=0\\) → 방정식 → 인수분해 · 예제 4 \\(\\det B=-60\\) · 곱 6개 따로 적기 · 주말 연습문제 = 출제 풀</div>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 곱셈 조건</div><div class="qb">\\(A\\)가 \\(m\\times n\\), \\(B\\)가 \\(p\\times r\\)일 때 \\(AB\\)가 정의되는 조건과 결과의 꼴은?</div><ol class="choices"><li data-ok="1">\\(n=p\\)일 때, 결과는 \\(m\\times r\\)</li><li>\\(m=r\\)일 때, 결과는 \\(n\\times p\\)</li><li>\\(m=p\\)일 때, 결과는 \\(n\\times r\\)</li><li>항상 정의되고 결과는 \\(m\\times n\\)</li></ol><div class="ans">앞의 열 수 = 뒤의 행 수. 가운데가 소거된다.</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 곱 계산</div><div class="qb">\\(A=\\begin{{bmatrix}}1&2\\\\3&4\\end{{bmatrix}}\\), \\(B=\\begin{{bmatrix}}0&1\\\\2&0\\end{{bmatrix}}\\)일 때 \\(AB\\)는?</div><ol class="choices"><li data-ok="1">\\(\\begin{{bmatrix}}4&1\\\\8&3\\end{{bmatrix}}\\)</li><li>\\(\\begin{{bmatrix}}0&2\\\\6&0\\end{{bmatrix}}\\)</li><li>\\(\\begin{{bmatrix}}3&4\\\\2&4\\end{{bmatrix}}\\)</li><li>\\(\\begin{{bmatrix}}1&3\\\\5&3\\end{{bmatrix}}\\)</li></ol><div class="ans">\\(c_{{11}}=1\\cdot0+2\\cdot2=4\\), \\(c_{{12}}=1\\cdot1+2\\cdot0=1\\), \\(c_{{21}}=8\\), \\(c_{{22}}=3\\). 2번은 성분끼리 곱한 것(행렬 곱 아님).</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 2차 행렬식</div><div class="qb">\\(\\det\\begin{{bmatrix}}a&b\\\\c&d\\end{{bmatrix}}\\)는?</div><ol class="choices"><li data-ok="1">\\(ad-bc\\)</li><li>\\(ab-cd\\)</li><li>\\(ad+bc\\)</li><li>\\(ac-bd\\)</li></ol><div class="ans">주대각 곱 − 반대 대각 곱.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 예제 4</div><div class="qb">\\(B=\\begin{{bmatrix}}2&1&3\\\\4&2&1\\\\6&-3&4\\end{{bmatrix}}\\)의 행렬식은?</div><ol class="choices"><li data-ok="1">\\(-60\\)</li><li>\\(60\\)</li><li>\\(-14\\)</li><li>\\(32\\)</li></ol><div class="ans">↘ \\(16+6-36=-14\\), ↙ \\(36+16-6=46\\) → \\(-14-46=-60\\). 3번은 ↙를 빼기 전.</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 예제 3</div><div class="qb">2차 행렬식이 \\(x^2-5x+6\\)일 때 \\(\\det A=0\\)이 되는 \\(x\\)는?</div><ol class="choices"><li data-ok="1">\\(x=2\\) 또는 \\(3\\)</li><li>\\(x=-2\\) 또는 \\(-3\\)</li><li>\\(x=1\\) 또는 \\(6\\)</li><li>\\(x=0\\)</li></ol><div class="ans">\\((x-2)(x-3)=0\\). 시험은 답이 하나 나오게 낸다.</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 사루스</div><div class="qb">3차 행렬식의 사루스 법칙을 말로 설명하고, 답안에서 감점되는 표기 두 가지를 쓰라.</div><div class="ans">1·2열을 오른쪽에 다시 쓰고 ↘ 대각선 3개 곱의 합에서 ↙ 대각선 3개 곱의 합을 뺀다. 감점: \\(\\det\\)·세로줄 누락, 행렬 곱에 × 기호(그리고 \\(|A|\\)를 절댓값으로 착각).</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
