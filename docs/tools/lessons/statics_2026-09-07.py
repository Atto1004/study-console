# -*- coding: utf-8 -*-
"""정역학 · 2026-09-07 수업 노트 (근거: 2026-09-07/정리.md — 녹음 53분·판서 1장·강의자료 W11 Ch1-2)"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\정역학\_수업노트\2026-09-07.html"

fig_tree = canvas(560, 190,
    rect(190, 26, 180, 46, INK, fill="rgba(31,42,68,.06)", sw=2, rx=10), text(280, 46, "Mechanics 역학", 15, INK, "middle", True), text(280, 63, "힘(力)이 물체에 가해졌을 때 생기는 변화 전부", 11.5, GRAY, "middle"),
    line(280, 72, 280, 96, INK, 1.5), line(150, 96, 410, 96, INK, 1.5), arrow(150, 96, 150, 116, INK, "", 1.5), arrow(410, 96, 410, 116, INK, "", 1.5),
    rect(60, 118, 180, 58, GREEN, fill="rgba(47,158,68,.08)", sw=2, rx=10), text(150, 140, "Statics 정역학", 14, GREEN, "middle", True), text(150, 161, "\"equilibrium\" 평형 · 정지 · 이번 학기", 11.5, INK, "middle"),
    rect(320, 118, 180, 58, GRAY, fill="rgba(138,151,166,.10)", sw=2, rx=10), text(410, 140, "Dynamics 동역학", 14, GRAY, "middle", True), text(410, 161, "운동(motion) · 나중", 11.5, INK, "middle"),
    cap="판서 ①의 구조. 교수님이 Mechanics·divided 아래 점선을 긋고 equilibrium 에 따옴표를 쳤다 — 이번 학기의 핵심어.")

fig_unit = canvas(560, 150,
    line(60, 110, 500, 110, INK, 2), block(200, 60, 60, 50, "1 kg"),
    arrow(130, 85, 196, 85, GREEN, "F = 1 N", 2.6, 0, -10),
    arrow(270, 40, 340, 40, BLUE, "a = 1 m/s²", 2.2, 0, -8),
    text(280, 138, "1 N = 1 kg · 1 m/s²   (kN = 10³ N · MN = 10⁶ N)", 13.5, INK, "middle", True),
    cap="힘의 단위 뉴턴: 1 kg 을 1 m/s² 로 가속하는 힘. 각도는 rad — 한 바퀴 2π rad = 360°.")

fig_particle = canvas(560, 200,
    dot(130, 100, "", 7, INK), arrow(40, 100, 122, 100, GREEN, "F", 2.6, 0, -10), text(130, 150, "입자(particle): 크기 없음", 13, INK, "middle"), text(130, 170, "작용선이 항상 중심을 지난다 → 회전 없음", 12, GRAY, "middle"),
    block(340, 60, 120, 80, "", INK), dot(400, 100, "", 4, GRAY),
    arrow(250, 72, 332, 72, GREEN, "F", 2.6, 0, -10), line(332, 72, 470, 72, GRAY, 1, "4 3"), text(478, 76, "작용선", 11, GRAY),
    arc(400, 100, 34, 200, 340, RED, 2, "회전(모멘트)", 50),
    text(400, 178, "크기가 있으면 작용선 위치에 따라 돈다", 12.5, INK, "middle"),
    cap="1장에서 「입자」로 두는 이유: 크기가 있으면 힘의 작용선이 중심에서 비껴 모멘트가 생긴다. 모멘트는 4장에서.")

fig_vec = canvas(560, 180,
    arrow(60, 130, 200, 50, BLUE, "", 3), text(112, 78, "u", 16, BLUE, "middle", True), text(150, 158, "길이 ∝ 크기 |u| · 화살표 방향 = 방향", 12.5, INK, "middle"),
    dot(330, 130, "", 5, INK), text(318, 152, "A (시작)", 12, INK, "middle"), dot(500, 60, "", 5, INK), text(500, 48, "B (끝)", 12, INK, "middle"),
    arrow(336, 126, 494, 64, GREEN, "", 2.6), text(430, 84, "r_AB", 14, GREEN, "middle", True),
    text(420, 168, "앞 첨자 = 시작점, 뒤 첨자 = 끝점", 12.5, INK, "middle"),
    cap="벡터는 크기와 방향이 둘 다 같아야 같은 벡터. 위치벡터 \\(\\mathbf r_{AB}\\)는 A에서 B로 쏘는 벡터.")

fig_add = canvas(560, 225,
    arrow(40, 170, 160, 130, BLUE, "u", 2.6, 0, -8), arrow(160, 130, 210, 50, RED, "v", 2.6, 12, 0), arrow(40, 170, 210, 50, GREEN, "u + v", 3, -36, -4),
    text(130, 208, "삼각형 법칙: u 꼬리에서 v 머리로", 12.5, INK, "middle"),
    arrow(300, 170, 420, 130, BLUE, "u", 2.6, 0, -8), arrow(300, 170, 350, 90, RED, "v", 2.6, -12, 0),
    line(420, 130, 470, 50, GRAY, 1.2, "4 3"), line(350, 90, 470, 50, GRAY, 1.2, "4 3"), arrow(300, 170, 470, 50, GREEN, "u + v", 3, -36, -4),
    text(390, 208, "평행사변형 법칙: 결과는 같다 (교환법칙)", 12.5, INK, "middle"),
    cap="덧셈 두 가지 그림. \\(\\mathbf u+\\mathbf v=\\mathbf v+\\mathbf u\\), 묶는 순서도 상관없다(결합법칙). 뺄셈은 \\(-\\mathbf v\\)를 더한다.")

fig_unitv = canvas(560, 150,
    arrow(60, 100, 300, 40, BLUE, "", 3), text(180, 56, "u = |u| e", 15, BLUE, "middle", True),
    arrow(60, 100, 120, 85, GREEN, "", 3.4), text(96, 122, "e (크기 1)", 13, GREEN, "middle"),
    text(420, 58, "e = u / |u|", 16, INK, "middle", True), text(420, 82, "방향만 남긴다", 13, GRAY, "middle"), text(420, 102, "크기가 1이라 곱해도 크기가 안 바뀐다", 12, GRAY, "middle"),
    cap="단위벡터: 크기 1, 방향만 지정. 어떤 벡터든 「크기 × 방향」으로 쪼갠다 — 3장에서 케이블 힘을 성분으로 쓸 때의 핵심.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>정역학 · 9/7 역학의 정의 · 뉴턴 법칙 · 벡터 시작</title></head><body>
<header>
<h1>역학이란 무엇인가 — 그리고 벡터의 첫걸음</h1>
<p class="lead">첫 수업의 절반은 <b>Ch.1 소개</b>(역학의 정의·단위·뉴턴 법칙), 나머지는 <b>Ch.2 벡터</b>의 시작(표기·덧셈·단위벡터)이다. 교수님이 두 번 말한 한 학기의 뼈대는 딱 두 개 — <b>평형방정식</b>과 <b>모멘트</b>. 영어 강의 + 한국어 요약으로 진행된다.</p>
<p class="meta"><span>녹음 53분</span><span>판서 1장</span><span>강의자료 W11 (Ch.1~2)</span><span>2주차 · 월</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 역학 = "힘이 가해졌을 때 물체에 생기는 변화"</h2>
<p>역학의 <b>역</b>은 힘 力. 힘이 물체에 가해지면 물체는 <b>움직이거나</b>, <b>버티며 스트레스를 받거나</b>, <b>변형된다</b> — 이 변화를 통틀어 다루는 학문이 역학(Mechanics)이다.</p>
{fig_tree}
<div class="say">"저희 기계공학이지만 <b>Machine이 아니고 Mechanical Engineering</b>이잖아요. Mechanics의 정의를 꼭 알고 가셔야 됩니다."</div>
<div class="why">정역학(Statics)은 <b>정지해 있는</b>(평형 상태의) 물체를, 동역학(Dynamics)은 <b>운동하는</b> 물체를 다룬다. 이번 학기는 정역학 — 움직이지 않으니 "왜 안 움직이는가"를 힘의 균형으로 설명하는 것이 전부다.</div>
<div class="say">"결국에는 <b>평형(equilibrium)이 가장 중요</b>합니다. <b>평형방정식을 잘 세우는 것</b>이 제일 중요하고요. 그리고 <b>모멘트</b>, 이 두 가지 가지고 한 학기 동안 하는 거예요." — 두 번 반복.</div>
<div class="analogy">다리·건물·크레인은 서 있는 채로 힘을 받는다. 무너지지 않는 이유를 설명하는 것이 정역학, 자동차·로켓처럼 움직이는 것을 설명하는 것이 동역학. 같은 「힘」을 다루지만 질문이 다르다.</div>
<div class="memo"><b>외울 것</b> Mechanics = Statics(평형) + Dynamics(운동) · 정역학의 두 기둥 = <b>평형방정식</b> · <b>모멘트</b> · 이번 학기 = 정역학</div>
<figure class="board"><img data-photo="정역학/2026-09-07/판서_1_역학정의_정역학동역학.jpg" alt="판서 1"><figcaption>판서 ① 역학의 정의 — Statics / Dynamics (15:08, 태블릿 화면)</figcaption></figure>
</section>

<section class="s" data-id="s2">
<h2>2. 단위 — 뉴턴은 kg·m/s²</h2>
<p>주로 <b>SI 단위</b>를 쓴다(US customary 는 참고만). 힘의 단위 뉴턴은 정의부터 기억한다.</p>
{fig_unit}
<div class="formula">\\[1\\ \\mathrm{{N}}=1\\ \\mathrm{{kg\\cdot m/s^2}},\\qquad \\mathrm{{kN}}=10^3\\ \\mathrm N,\\quad \\mathrm{{MN}}=10^6\\ \\mathrm N,\\qquad 2\\pi\\ \\mathrm{{rad}}=360^\\circ\\]</div>
<div class="why">뉴턴 2법칙 \\(F=ma\\)에서 나온 단위다. 그래서 힘 문제의 답이 kg·m/s² 로 떨어지면 맞게 계산한 것 — 단위 검산에 쓴다.</div>
<div class="analogy">사과 하나(약 100 g)를 손에 올렸을 때 느끼는 무게가 대략 1 N. "kN" 이 나오면 사과 천 개, 자동차 한 대 무게가 10 kN 남짓.</div>
<div class="memo"><b>외울 것</b> \\(1\\ \\mathrm N=1\\ \\mathrm{{kg\\,m/s^2}}\\) · 속도 = 위치의 변화율, 가속도 = 속도의 변화율 · 각도는 rad</div>
</section>

<section class="s" data-id="s3">
<h2>3. 뉴턴의 법칙 — 정역학은 항상 ΣF = 0</h2>
<table><tr><th></th><th>내용</th><th>정역학에서의 뜻</th></tr>
<tr><td><b>1법칙</b></td><td>\\(\\sum\\mathbf F=0\\)이면 속도가 일정</td><td>정지해 있으면 계속 정지. <b>정역학은 항상 \\(\\sum\\mathbf F=0\\)</b></td></tr>
<tr><td><b>2법칙</b></td><td>\\(\\sum\\mathbf F=d\\mathbf p/dt\\) (선운동량의 변화율)</td><td>합력이 0이라 안 쓴다 — 동역학 개념</td></tr>
<tr><td><b>3법칙</b></td><td>\\(\\mathbf F_{{A\\to B}}=-\\mathbf F_{{B\\to A}}\\), 크기 같고 방향 반대</td><td>자유물체도(3장)의 근거</td></tr></table>
<div class="say">"we study statics right so <b>always the summation of forces will be zero</b>"</div>
<h3>왜 「입자(particle)」라고 하는가 — 교수님이 질문으로 짚은 포인트</h3>
{fig_particle}
<div class="say">"부피가 있으면 <b>힘의 작용선이 달라져</b> 버리면 얘가 회전을 하게 되겠죠. <b>모멘트가 생기기 때문에.</b>"</div>
<div class="why">크기가 있는 물체는 같은 힘이라도 <b>어디에</b> 걸리느냐에 따라 회전한다. 1장에서는 그 복잡함을 일단 빼려고 물체를 크기 없는 점(입자)으로 본다. 회전(모멘트)은 4장에서 정식으로 다룬다.</div>
<div class="analogy">문을 경첩 바로 옆에서 밀면 안 열리고, 손잡이 쪽에서 밀면 쉽게 돈다. 힘은 같은데 <b>작용선의 위치</b>가 다르기 때문 — 이것이 모멘트.</div>
<p>만유인력 \\(F=G\\dfrac{{m_1m_2}}{{r^2}}\\) — 두 입자 사이, 크기 같고 방향 반대. "이 중력이 사실상 만유인력이랑 똑같잖아요." 지표면 근처에서는 \\(W=mg\\)로 쓴다(3장).</p>
<div class="memo"><b>외울 것</b> 정역학 = \\(\\sum\\mathbf F=0\\) · 입자 = 크기 없음 → 모멘트 없음 · 3법칙 = 작용·반작용(자유물체도) · \\(W=mg\\)</div>
</section>

<section class="s" data-id="s4">
<h2>4. Ch.2 벡터 — 스칼라와 벡터, 표기, 위치벡터</h2>
<p><b>스칼라</b>는 숫자 하나로 완전히 기술되는 양(방향 불필요). <b>벡터</b>는 <b>크기(magnitude)와 방향(direction)</b>이 둘 다 같아야 같은 벡터다.</p>
{fig_vec}
<div class="memo"><b>표기</b> 벡터는 볼드체 \\(\\mathbf u\\)(손글씨는 화살표·밑줄) · 크기는 \\(|\\mathbf u|\\) — 방향이 사라지고 크기만 남는다 · 그림은 화살표: <b>길이 ∝ 크기</b>, 화살표 방향 = 벡터 방향</div>
<div class="why"><b>위치벡터 \\(\\mathbf r_{{AB}}\\)</b> = 점 A에서 점 B로 쏘는 벡터. 앞 첨자가 시작점, 뒤 첨자가 끝점. 다음 시간 "끝점 − 시작점" 계산의 뿌리이고, 4장 모멘트 \\(\\mathbf M=\\mathbf r\\times\\mathbf F\\)의 \\(\\mathbf r\\)이 바로 이것.</div>
<div class="analogy">"서울에서 부산까지 400 km"는 스칼라(거리), "서울에서 부산 쪽으로 400 km"는 벡터(변위). 방향을 뒤집으면 다른 벡터가 된다.</div>
<div class="memo"><b>외울 것</b> 벡터 = 크기 + 방향 · \\(|\\mathbf u|\\) = 크기(스칼라) · \\(\\mathbf r_{{AB}}\\): A → B</div>
</section>

<section class="s" data-id="s5">
<h2>5. 덧셈 · 스칼라배 · 뺄셈</h2>
{fig_add}
<div class="formula">\\[\\mathbf u+\\mathbf v=\\mathbf v+\\mathbf u\\ (\\text{{교환}}),\\quad (\\mathbf u+\\mathbf v)+\\mathbf w=\\mathbf u+(\\mathbf v+\\mathbf w)\\ (\\text{{결합}}),\\qquad \\mathbf r_{{AC}}=\\mathbf r_{{AB}}+\\mathbf r_{{BC}}\\]</div>
<div class="say">"당장은 어디다 써먹을지 모르겠지만 나중에 문제를 풀면 (쓰인다)" — \\(\\mathbf r_{{AC}}=\\mathbf r_{{AB}}+\\mathbf r_{{BC}}\\)에 대해.</div>
<div class="why"><b>스칼라배</b> \\(a\\mathbf u\\)도 벡터. 크기는 \\(|a||\\mathbf u|\\), 방향은 \\(a\\)의 부호에 따라 — \\(a&lt;0\\)이면 반대 방향. 결합·분배법칙이 성립하고, 스칼라로 나누기는 \\(1/a\\)를 곱하는 것. <b>뺄셈</b>은 \\(\\mathbf u-\\mathbf v=\\mathbf u+(-\\mathbf v)\\) — "반대 방향 벡터를 더한다고 생각하면 된다".</div>
<div class="analogy">지도에서 A → B → C로 돌아가나 A → C로 직행하나 도착지는 같다. 그것이 \\(\\mathbf r_{{AC}}=\\mathbf r_{{AB}}+\\mathbf r_{{BC}}\\). 어느 길로 묶어 더하든 결과가 같다는 것이 결합법칙.</div>
<div class="memo"><b>외울 것</b> 삼각형 법칙(꼬리→머리) = 평행사변형 법칙 · \\(a\\mathbf u\\): 부호가 방향 · \\(\\mathbf u-\\mathbf v=\\mathbf u+(-\\mathbf v)\\)</div>
</section>

<section class="s" data-id="s6">
<h2>6. 단위벡터 — 크기 1, 방향만 남긴다 ★</h2>
{fig_unitv}
<div class="formula">\\[\\mathbf e=\\frac{{\\mathbf u}}{{|\\mathbf u|}},\\quad |\\mathbf e|=1,\\qquad \\mathbf u=|\\mathbf u|\\,\\mathbf e\\ (\\text{{크기}}\\times\\text{{방향}})\\]</div>
<div class="why">쓰는 이유는 하나 — <b>방향만 지정</b>하려고. 크기가 1이라 어떤 수를 곱해도 방향은 그대로고 크기만 그 수가 된다. "케이블이 A에서 B 방향으로 500 N을 당긴다"를 식으로 쓰려면 \\(500\\,\\mathbf e_{{AB}}\\)가 필요하다.</div>
<div class="say">"안 쓸 것 같지만 생각보다 많이 쓰이고 <b>고체역학 가서도 많이 쓰기 때문에</b> 한 번씩 (봐 두세요)"</div>
<div class="analogy">나침반 바늘은 길이가 아니라 방향만 알려 준다. 단위벡터는 그 바늘 — "얼마나 세게"(크기)는 따로 곱한다.</div>
<div class="memo"><b>외울 것</b> \\(\\mathbf e=\\mathbf u/|\\mathbf u|\\) · \\(\\mathbf u=|\\mathbf u|\\mathbf e\\) · 다음 시간: 성분 \\(\\mathbf i,\\mathbf j,\\mathbf k\\)와 방향여현</div>
<p>수업 운영: "1장은 그냥 가볍게 introduction". 교수님이 강의 녹화를 처음 시도 — LMS 녹화본·PDF 확인.</p>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 정역학의 정의</div><div class="qb">정역학(Statics)이 다루는 것은?</div><ol class="choices"><li data-ok="1">평형(정지) 상태에 있는 물체와 그에 작용하는 힘</li><li>운동하는 물체의 가속도</li><li>기계(machine)의 설계</li><li>물체의 온도 변화</li></ol><div class="ans">Statics = study of objects in "equilibrium". 운동은 Dynamics.</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 뉴턴 법칙</div><div class="qb">정역학에서 <b>항상</b> 성립하는 식은?</div><ol class="choices"><li data-ok="1">\\(\\sum\\mathbf F=0\\)</li><li>\\(\\sum\\mathbf F=d\\mathbf p/dt\\ne0\\)</li><li>\\(\\sum\\mathbf F=m\\mathbf a,\\ \\mathbf a\\ne0\\)</li><li>\\(\\mathbf F_{{A\\to B}}=\\mathbf F_{{B\\to A}}\\)</li></ol><div class="ans">정지(평형)이므로 합력 0. 3법칙은 부호가 반대(\\(-\\)). 2법칙은 동역학.</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 단위</div><div class="qb">1 N의 정의는?</div><ol class="choices"><li data-ok="1">1 kg 물체에 \\(1\\ \\mathrm{{m/s^2}}\\)의 가속도를 만드는 힘</li><li>1 kg 물체의 무게</li><li>1 g 물체에 \\(1\\ \\mathrm{{m/s^2}}\\)의 가속도를 만드는 힘</li><li>1 m를 1 s에 가는 속도</li></ol><div class="ans">\\(1\\ \\mathrm N=1\\ \\mathrm{{kg\\,m/s^2}}\\). 1 kg의 무게는 9.81 N.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 왜 입자인가</div><div class="qb">1장에서 물체를 「입자」로 보는 이유는?</div><ol class="choices"><li data-ok="1">크기가 있으면 힘의 작용선 위치에 따라 회전(모멘트)이 생기는데, 이를 일단 배제하려고</li><li>모든 물체는 실제로 크기가 없기 때문</li><li>입자는 힘을 받지 않기 때문</li><li>질량을 무시하기 위해</li></ol><div class="ans">"부피가 있으면 힘의 작용선이 달라져 회전 — 모멘트가 생기기 때문". 모멘트는 4장.</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 위치벡터</div><div class="qb">\\(\\mathbf r_{{AB}}\\)는?</div><ol class="choices"><li data-ok="1">점 A에서 점 B로 향하는 벡터</li><li>점 B에서 점 A로 향하는 벡터</li><li>A와 B 사이의 거리(스칼라)</li><li>A와 B의 중점</li></ol><div class="ans">앞 첨자 = 시작, 뒤 첨자 = 끝. \\(\\mathbf r_{{BA}}=-\\mathbf r_{{AB}}\\).</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 단위벡터</div><div class="qb">단위벡터 \\(\\mathbf e\\)의 정의와, 벡터 \\(\\mathbf u\\)를 단위벡터로 나타내는 식, 그리고 단위벡터를 쓰는 이유를 한 줄로 쓰라.</div><div class="ans">\\(\\mathbf e=\\mathbf u/|\\mathbf u|\\), 크기 1. \\(\\mathbf u=|\\mathbf u|\\,\\mathbf e\\)(크기 × 방향). 이유: <b>방향만</b> 지정하기 위해 — 크기가 1이라 곱해도 크기가 안 바뀐다.</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
