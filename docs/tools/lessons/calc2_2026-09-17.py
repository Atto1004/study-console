# -*- coding: utf-8 -*-
"""미분적분학2 · 2026-09-17 수업 노트 (근거: 2026-09-17/정리.md — 녹음 68분·판서 7장·필기 2장, 검산 완료)"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\미분적분학2\_수업노트\2026-09-17.html"

fig_ab = canvas(560, 200,
    dot(80, 160, "", 5, INK), text(64, 178, "O", 13, INK, "middle", True),
    dot(220, 60, "", 5, PINK), text(214, 48, "A(x₁, y₁, z₁)", 12, PINK, "middle"), dot(420, 120, "", 5, PINK), text(430, 116, "B(x₂, y₂, z₂)", 12, PINK),
    arrow(86, 156, 214, 64, YEL, "", 2.6), text(130, 100, "OA⃗", 13, "#B26A00", "middle", True), arrow(86, 158, 414, 121, YEL, "", 2.6), text(250, 152, "OB⃗", 13, "#B26A00", "middle", True),
    arrow(226, 62, 414, 118, GREEN, "", 3), text(330, 78, "AB⃗ = OB⃗ − OA⃗", 14, GREEN, "middle", True),
    text(330, 184, "= (x₂−x₁, y₂−y₁, z₂−z₁)   「끝점 − 시작점」 — 거리 공식에서 루트만 안 씌운 것", 12, INK, "middle"),
    cap="원점이 없는 두 점 벡터를 위치벡터로 환원(판서 ①). BA 로 읽으면 안 된다 — 확 바뀐다.")

fig_mag = canvas(560, 190,
    axes3d(150, 150, 85), arrow(150, 150, *p3(150, 150, 50, 90, 70), GREEN, "", 3), dot(*p3(150, 150, 50, 90, 70), "", 5, PINK),
    line(*p3(150, 150, 50, 90, 0), *p3(150, 150, 50, 90, 70), GRAY, 1, "4 3"), line(*p3(150, 150, 50, 0, 0), *p3(150, 150, 50, 90, 0), GRAY, 1, "4 3"), line(*p3(150, 150, 0, 90, 0), *p3(150, 150, 50, 90, 0), GRAY, 1, "4 3"),
    text(p3(150, 150, 50, 90, 70)[0] + 8, p3(150, 150, 50, 90, 70)[1] - 4, "(a₁, a₂, a₃)", 12, PINK),
    text(400, 60, "|a⃗| = √(a₁² + a₂² + a₃²)", 15, INK, "middle", True), text(400, 86, "= 원점에서 끝점까지 거리", 12.5, GRAY, "middle"),
    text(400, 116, "읽기: 「a 벡터의 크기」", 12.5, INK, "middle"), text(400, 140, "성분 → 크기는 성분 제곱합의 제곱근", 12, GRAY, "middle"),
    cap="벡터의 크기(magnitude) = 직육면체의 대각선 = 거리 공식(판서 ②).")

fig_ijk = canvas(560, 200,
    axes3d(150, 150, 90), arrow(150, 150, *p3(150, 150, 0, 40, 0), RED, "", 3.4), text(p3(150, 150, 0, 40, 0)[0] + 2, p3(150, 150, 0, 40, 0)[1] + 18, "j⃗", 14, RED, "middle", True),
    arrow(150, 150, *p3(150, 150, 0, 0, 40), RED, "", 3.4), text(p3(150, 150, 0, 0, 40)[0] - 12, p3(150, 150, 0, 0, 40)[1] + 4, "k⃗", 14, RED, "end", True),
    arrow(150, 150, *p3(150, 150, 40, 0, 0), RED, "", 3.4), text(p3(150, 150, 40, 0, 0)[0] - 14, p3(150, 150, 40, 0, 0)[1] + 4, "i⃗", 14, RED, "end", True),
    text(400, 46, "i⃗ = (1,0,0),  j⃗ = (0,1,0),  k⃗ = (0,0,1)", 13, INK, "middle", True),
    text(400, 76, "a⃗ = (a₁, a₂, a₃) = (a₁,0,0) + (0,a₂,0) + (0,0,a₃)", 12, INK, "middle"), text(400, 98, "= a₁(1,0,0) + a₂(0,1,0) + a₃(0,0,1)", 12, INK, "middle"),
    text(400, 126, "= a₁ i⃗ + a₂ j⃗ + a₃ k⃗", 15, RED, "middle", True),
    text(400, 160, "★ 「시험 문제와 연관되는 건 여기부터」", 12.5, GRAY, "middle"),
    cap="표준기저벡터(standard basis vector): 각 축에서 크기 1 인 점. i, j, k 앞의 값이 곧 성분 — 두 표기를 자유롭게 오간다.")

fig_unit = canvas(560, 150,
    dot(40, 110, "", 5, INK), text(30, 128, "O", 12, INK, "middle", True),
    arrow(46, 107, 300, 40, BLUE, "", 3), text(200, 56, "a⃗ = 2i − j − 2k,  |a⃗| = 3", 13, BLUE, "middle", True),
    arrow(46, 107, 130, 85, GREEN, "", 3.4), text(88, 130, "u⃗ = (1/|a|) a⃗", 13, GREEN, "middle", True), text(88, 146, "같은 방향, 원점에서 1/3 지점", 11, GRAY, "middle"),
    text(430, 60, "★⑤ 단위벡터 = 크기 1", 14, INK, "middle", True), text(430, 84, "u⃗ = a⃗ / |a⃗| = ⅔i − ⅓j − ⅔k (Ex04)", 12.5, INK, "middle"),
    text(430, 112, "「u 라고만 쓰면 일반 벡터 — (1/|a|)a 꼴로 써야」", 11.5, RED, "middle"),
    cap="어떤 벡터든 자기 크기로 나누면 같은 방향의 단위벡터. i, j, k 도 단위벡터.")

fig_dot = canvas(560, 200,
    dot(80, 160, "", 5, INK), text(66, 178, "O", 13, INK, "middle", True),
    dot(300, 50, "", 5, PINK), text(300, 38, "A", 13, PINK, "middle"), dot(440, 150, "", 5, PINK), text(452, 154, "B", 13, PINK),
    arrow(86, 156, 294, 54, BLUE, "", 3), text(170, 96, "a⃗ = OA⃗", 13, BLUE, "middle", True), arrow(86, 158, 434, 151, RED, "", 3), text(260, 172, "b⃗ = OB⃗", 13, RED, "middle", True),
    arrow(434, 146, 306, 56, GREEN, "", 2.6), text(392, 92, "BA⃗ = a⃗ − b⃗", 13, GREEN, "middle", True),
    arc(80, 160, 44, -27, -2, GRAY, 1.5, "θ", 54),
    text(470, 40, "[Def 01] a⃗·b⃗ = a₁b₁ + a₂b₂ + a₃b₃", 12.5, INK, "middle", True), text(470, 64, "결과는 실수(스칼라) → scalar product", 11.5, GRAY, "middle"),
    text(470, 96, "[Thm 01] a⃗·b⃗ = |a⃗||b⃗| cos θ", 12.5, INK, "middle", True), text(470, 118, "삼각형 OAB, 일각삼변 → 코사인 제2법칙", 11.5, GRAY, "middle"),
    cap="12.3 내적 도입. 점은 진하게(× 금지), 순서 무관. 증명(코사인 법칙)은 9/22.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>미분적분학2 · 9/17 벡터 계산 — 두 점 벡터 · 크기 · 표준기저 · 단위벡터 · 내적 도입</title></head><body>
<header>
<h1>벡터 계산 — 두 점 벡터, 크기, 표준기저벡터 i j k, 단위벡터</h1>
<p class="lead">12.2를 끝내는 날. 개념 ①~⑤(위치벡터 → 두 점 벡터 = \\(\\overrightarrow{{OB}}-\\overrightarrow{{OA}}\\) → 크기 → 연산 → ★표준기저벡터 → ★단위벡터)와 예제 넷, 마지막 10분에 12.3 <b>내적</b>의 정의와 정리 1 도입. 교수님: "시험 문제와 연관되는 건 <b>④ 표준기저벡터부터</b>", "\\(|2\\vec a-3\\vec b|\\) 유형은 <b>퀴즈</b>", "i, j, k로 주어진 문제는 답도 i, j, k로 써야 <b>만점</b>".</p>
<p class="meta"><span>녹음 68분</span><span>판서 7장 · 필기 2장 검산</span><span>교재 12.2 → 12.3 도입</span><span>3주차 · 목 · 중간 범위 시작</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 두 점으로 정한 벡터 — 끝점 − 시작점 ★</h2>
{fig_ab}
<div class="formula">\\[\\overrightarrow{{AB}}=\\overrightarrow{{OB}}-\\overrightarrow{{OA}}=\\langle x_2-x_1,\\ y_2-y_1,\\ z_2-z_1\\rangle\\qquad \\text{{Ex01 }}A(2,-3,4),\\ B(-2,1,1):\\ \\overrightarrow{{AB}}=\\langle-4,4,-3\\rangle\\]</div>
<div class="say">"두 점 A, B의 벡터라 하면 <b>자동으로 앞이 시작점, 뒤가 끝점</b>. BA로 읽으면 안 됨 — 확 바뀐다." · "어디서 많이 본 것? 거리 공식과 똑같다 — <b>루트만 안 씌운 것</b>."</div>
<div class="why">모든 벡터의 시작점을 원점으로 두면(위치벡터) 성분 = 좌표. 원점이 시작점이 아닌 \\(\\overrightarrow{{AB}}\\)는 두 위치벡터의 차로 환원한다. Ex01의 그림: \\(\\langle-4,4,-3\\rangle\\)은 원점에서 그은 위치벡터 자리에 있고 A→B 화살표는 그것을 <b>평행 이동</b>한 것 — "꼭 그 위에 있어야 하는 게 아니라 방향이 같다"(뒤의 공간 직선의 방향벡터 암시).</div>
<div class="analogy">A 집에서 B 집으로 가는 길 = (원점에서 B까지) − (원점에서 A까지). 지도의 원점이 어디든 차이는 같다.</div>
<div class="memo"><b>외울 것</b> \\(\\overrightarrow{{AB}}=\\overrightarrow{{OB}}-\\overrightarrow{{OA}}\\) · 끝 − 시작 · Ex01 \\(\\langle-4,4,-3\\rangle\\) · 유향선분(有向) = 방향 있는 선분</div>
</section>

<section class="s" data-id="s2">
<h2>2. 크기 = 거리 · 연산은 덧셈·뺄셈·실수배에만 닫혀 있다</h2>
{fig_mag}
<div class="formula">\\[|\\vec a|=\\sqrt{{a_1^2+a_2^2+a_3^2}}\\qquad \\vec a=\\vec b\\Leftrightarrow a_i=b_i,\\quad \\vec a\\pm\\vec b=\\langle a_1\\pm b_1,a_2\\pm b_2,a_3\\pm b_3\\rangle,\\quad k\\vec a=\\langle ka_1,ka_2,ka_3\\rangle\\]</div>
<div class="why">크기(magnitude)는 \\(|\\vec a|\\)로 쓰고 "a 벡터의 크기"라 읽는다(절댓값 a 벡터 ✗). 연산은 <b>같은 차원끼리</b>(행렬처럼), 앞으로는 말 안 해도 전부 R³. 벡터는 덧셈·뺄셈·실수배에만 닫혀 있고 곱셈·나눗셈은 없다(내적·외적은 별도) — 여담: 사칙연산 전부에 닫힌 것이 미적1의 극한, 그래서 미분·적분이 가능.</div>
<div class="say">"상등은 대학에서 물어보면 <b>2점짜리</b>." · "<b>클리닉 센터에서 벡터 연산과 크기 구하기를 물어본다</b> — 기본 중 기본."</div>
<div class="analogy">같은 종류 동전끼리만 더한다(x는 x끼리). 실수배는 모든 동전을 k배로. 벡터끼리 "곱하기"는 없다 — 그 자리를 내적(9/22)이 다른 뜻으로 채운다.</div>
<div class="memo"><b>외울 것</b> \\(|\\vec a|=\\sqrt{{\\sum a_i^2}}\\) · 상등·합차·실수배는 성분끼리 · 곱셈·나눗셈 없음 · 클리닉 질문 항목</div>
</section>

<section class="s" data-id="s3">
<h2>3. ★④ 표준기저벡터 i, j, k — 시험은 여기부터</h2>
{fig_ijk}
<div class="say">(20:46) "시험 문제와 연관되는 건 네 번째부터." · "고등과정에 없는 대학 내용. <b>문제가 이 표현으로 나온다</b> → 알아야 한다." · "i, j, k 앞의 값이 곧 성분 → <b>두 표기를 자유롭게 왔다 갔다</b>."</div>
<div class="why">standard(표준) + basis(기저, 기본) + vector. 각 축에서 크기 1인 점 \\((1,0,0),(0,1,0),(0,0,1)\\). 성분 표기를 실수배·덧셈으로 풀면 \\(\\vec a=a_1\\vec i+a_2\\vec j+a_3\\vec k\\) — 어떤 벡터든 세 기저의 1차결합. \\(\\vec b=4\\vec i+7\\vec k\\)처럼 \\(\\vec j\\)가 없으면 <b>0·j</b>가 있는 것(성분으로 \\((4,0,7)\\)).</div>
<details class="ex" open><summary>Ex03 \\(\\vec a=\\vec i+2\\vec j-3\\vec k\\), \\(\\vec b=4\\vec i+7\\vec k\\) → \\(2\\vec a+3\\vec b\\)</summary><div class="body"><p>풀이 1(권장): \\(2\\vec a=2\\vec i+4\\vec j-6\\vec k\\), \\(3\\vec b=12\\vec i+21\\vec k\\) → i끼리·j끼리·k끼리: <b>\\(14\\vec i+4\\vec j+15\\vec k\\)</b>. 풀이 2: 성분 \\((1,2,-3),(4,0,7)\\) → \\((14,4,15)\\) → 다시 기저로. "답은 같지만 왔다 갔다는 <b>시간 낭비</b>. <b>i, j, k로 주어지면 답도 i, j, k로</b> 써야 만점 — 출제자가 원하는 형태를 따라가라."</p></div></details>
<div class="analogy">동·서·남·북·위·아래 같은 기준 방향(기저)이 있으면 어떤 이동도 "동쪽 3, 북쪽 2, 위 1"처럼 쓸 수 있다. i, j, k가 그 기준 방향.</div>
<div class="memo"><b>외울 것</b> \\(\\vec a=a_1\\vec i+a_2\\vec j+a_3\\vec k\\) · 성분 ↔ 기저 자유롭게 · 문제 표기대로 답 · Ex03 \\(14\\vec i+4\\vec j+15\\vec k\\)</div>
</section>

<section class="s" data-id="s4">
<h2>4. ★⑤ 단위벡터 — 방향은 같고 크기만 1로</h2>
{fig_unit}
<div class="formula">\\[|\\vec i|=|\\vec j|=|\\vec k|=1,\\qquad \\vec u=\\frac{{1}}{{|\\vec a|}}\\vec a\\ (\\text{{a 와 같은 방향의 단위벡터}})\\qquad \\text{{Ex04: }}\\vec a=2\\vec i-\\vec j-2\\vec k,\\ |\\vec a|=3,\\ \\vec u=\\tfrac23\\vec i-\\tfrac13\\vec j-\\tfrac23\\vec k\\]</div>
<div class="say">"u라고만 쓰면 그냥 일반 벡터(v, w처럼). 단위벡터로 쓰려면 앞에 단위벡터라고 밝히거나 \\((1/|\\vec a|)\\vec a\\) 꼴을 써야 한다." · "④⑤는 별거 아니지만 머릿속에 기억 — 뒤에서 공식이 왜 그렇게 나오는지 설명할 때 필요."</div>
<div class="why">벡터를 자기 크기로 나누면 방향은 그대로, 크기는 1. 그림으로: 점 \\(P(2,-1,-2)\\)까지가 \\(\\vec a\\)(크기 3), 단위벡터는 <b>같은 방향 위, 원점에서 1/3 지점</b>. 검산 \\(|\\vec u|=\\sqrt{{4/9+1/9+4/9}}=1\\). "계산만 하면 안 되고 이 그림을 이해해야 뒤 문제가 쉬워진다."</div>
<details class="ex"><summary>Ex02 \\(\\vec a=(2,1,3)\\), \\(\\vec b=(3,-2,1)\\), \\(|2\\vec a-3\\vec b|\\) — "퀴즈 문제로 나온다"</summary><div class="body"><p>i) \\(2\\vec a-3\\vec b=(4,2,6)-(9,-6,3)=(-5,8,3)\\) (실수배는 숫자만 곱하고 빼기는 그대로 두면 안 헷갈린다) ii) \\(|\\cdot|=\\sqrt{{25+64+9}}=\\sqrt{{98}}=\\sqrt{{2\\cdot49}}=\\mathbf{{7\\sqrt2}}\\). √ 안은 반드시 소인수분해 — √98로 끝내면 감점. (아토 필기의 −8은 +8로 고칠 것.)</p></div></details>
<div class="analogy">단위벡터는 "방향만 남긴 나침반 바늘"(정역학 9/7과 같은 말). 길이를 1로 맞춰 두면 "얼마나"는 따로 곱한다.</div>
<div class="memo"><b>외울 것</b> \\(\\vec u=\\vec a/|\\vec a|\\) · 표기: 단위벡터라 밝히거나 \\((1/|a|)a\\) · Ex02 \\(7\\sqrt2\\) · Ex04 \\(\\frac23\\vec i-\\frac13\\vec j-\\frac23\\vec k\\) · sol. i) ii) 단계 번호 형식</div>
</section>

<section class="s" data-id="s5">
<h2>5. 12.3 내적 도입 — 정의(성분 합)와 정리 1(코사인) ★</h2>
{fig_dot}
<div class="formula">\\[\\textbf{{Def 01}}\\ \\vec a\\cdot\\vec b=a_1b_1+a_2b_2+a_3b_3\\ (\\text{{실수}})\\qquad \\textbf{{Thm 01}}\\ \\vec a\\cdot\\vec b=|\\vec a||\\vec b|\\cos\\theta\\ \\Rightarrow\\ \\cos\\theta=\\frac{{\\vec a\\cdot\\vec b}}{{|\\vec a||\\vec b|}}\\ \\Rightarrow\\ \\theta\\]</div>
<div class="say">"dot product = 점의 곱 → 내적(inner product). 스칼라 프로덕트라고도 — <b>결과가 항상 실수</b>." · "점을 <b>진하게</b> 찍는다. 연필로 살짝 ✗, ×나 다른 기호 ✗. 순서 무관." · (58:40) "<b>중간고사 문제 관련 내용.</b>"</div>
<div class="why">정의는 같은 성분끼리 곱해 전부 더한 것(정역학 9/14와 같다). 정리 1은 삼각형 OAB에서 \\(\\overrightarrow{{OA}}=\\vec a\\), \\(\\overrightarrow{{OB}}=\\vec b\\), \\(\\overrightarrow{{BA}}=\\vec a-\\vec b\\)(뒤 − 앞)로 세 변의 길이 \\(|\\vec a|,|\\vec b|,|\\vec a-\\vec b|\\)와 사이각 \\(\\theta\\) — <b>일각삼변 = 코사인 제2법칙</b>. 증명은 9/22. 필기에는 결론 \\(\\cos\\theta=\\vec a\\cdot\\vec b/(|\\vec a||\\vec b|)\\)까지.</div>
<div class="analogy">정역학 9/9·9/14의 내적(정의·성질·정사영)이 그대로 예습 자료 — 두 과목이 같은 내용을 같은 주에 다룬다.</div>
<div class="memo"><b>외울 것</b> \\(\\vec a\\cdot\\vec b=\\sum a_ib_i\\) · 스칼라 · 점 진하게, × 금지 · \\(\\cos\\theta=\\vec a\\cdot\\vec b/|\\vec a||\\vec b|\\) · 다음(9/22) 증명·방향각</div>
<p>출결·과제(00:00): 아파서 빠지면 처방전 사진을 이메일로. 결석 1회 −1점, 11회 = F. <b>레포트(중간·기말 때) 반드시 제출</b>. 12.2 교재 연습문제는 각자.</p>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 두 점 벡터</div><div class="qb">\\(A(2,-3,4)\\), \\(B(-2,1,1)\\)일 때 \\(\\overrightarrow{{AB}}\\)는?</div><ol class="choices"><li data-ok="1">\\(\\langle-4,4,-3\\rangle\\)</li><li>\\(\\langle4,-4,3\\rangle\\)</li><li>\\(\\langle0,-2,5\\rangle\\)</li><li>\\(\\langle-4,-2,4\\rangle\\)</li></ol><div class="ans">끝 − 시작: \\((-2-2,\\ 1+3,\\ 1-4)\\). 2번은 \\(\\overrightarrow{{BA}}\\).</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · Ex02</div><div class="qb">\\(\\vec a=(2,1,3)\\), \\(\\vec b=(3,-2,1)\\)일 때 \\(|2\\vec a-3\\vec b|\\)는?</div><ol class="choices"><li data-ok="1">\\(7\\sqrt2\\)</li><li>\\(\\sqrt{{98}}\\)</li><li>\\(\\sqrt{{50}}\\)</li><li>\\(14\\)</li></ol><div class="ans">\\((-5,8,3)\\), \\(\\sqrt{{98}}=7\\sqrt2\\). √98로 끝내면 감점.</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 표준기저</div><div class="qb">\\(\\vec a=\\vec i+2\\vec j-3\\vec k\\), \\(\\vec b=4\\vec i+7\\vec k\\)일 때 \\(2\\vec a+3\\vec b\\)를 만점 형식으로 쓰면?</div><ol class="choices"><li data-ok="1">\\(14\\vec i+4\\vec j+15\\vec k\\)</li><li>\\((14,4,15)\\)</li><li>\\(14\\vec i+15\\vec k\\)</li><li>\\(6\\vec i+4\\vec j+4\\vec k\\)</li></ol><div class="ans">i, j, k로 주어졌으니 답도 i, j, k로. \\(\\vec b\\)의 j 성분은 0이지만 \\(\\vec a\\)의 \\(4\\vec j\\)는 남는다.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 단위벡터</div><div class="qb">\\(\\vec a=2\\vec i-\\vec j-2\\vec k\\)와 같은 방향의 단위벡터는?</div><ol class="choices"><li data-ok="1">\\(\\tfrac23\\vec i-\\tfrac13\\vec j-\\tfrac23\\vec k\\)</li><li>\\(2\\vec i-\\vec j-2\\vec k\\)</li><li>\\(\\tfrac13\\vec i-\\tfrac13\\vec j-\\tfrac13\\vec k\\)</li><li>\\(\\tfrac29\\vec i-\\tfrac19\\vec j-\\tfrac29\\vec k\\)</li></ol><div class="ans">\\(|\\vec a|=3\\), \\(\\vec u=\\vec a/3\\). 4번은 \\(|\\vec a|^2\\)으로 나눈 것.</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 내적의 정의</div><div class="qb">\\(\\vec a\\cdot\\vec b\\)의 정의(Def 01)와 결과의 종류는?</div><ol class="choices"><li data-ok="1">\\(a_1b_1+a_2b_2+a_3b_3\\), 결과는 실수(스칼라)</li><li>\\(\\langle a_1b_1,a_2b_2,a_3b_3\\rangle\\), 결과는 벡터</li><li>\\(|\\vec a||\\vec b|\\), 항상 양수</li><li>\\(a_1b_2-a_2b_1\\), 스칼라</li></ol><div class="ans">같은 성분끼리 곱해 더한다 → 실수. 그래서 scalar product.</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 닫힘</div><div class="qb">벡터가 닫혀 있는 연산 세 가지와, 상등의 정의를 쓰라.</div><div class="ans">덧셈·뺄셈·실수배(곱셈·나눗셈 ✗). \\(\\vec a=\\vec b\\Leftrightarrow a_1=b_1,\\ a_2=b_2,\\ a_3=b_3\\) — 같은 차원에서 모든 성분이 같다.</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
