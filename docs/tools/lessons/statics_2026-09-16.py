# -*- coding: utf-8 -*-
"""정역학 · 2026-09-16 수업 노트 (아토 녹음 없음 — 교수필기_한글_3주차_W3-2 13p + 영상정리_3주차_W3-2 53분 + 수업요약으로 재구성)"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\정역학\_수업노트\2026-09-16.html"

# 평행육면체: 밑면 V,W · 높이 U
o = (120, 190); V = (150, 0); W = (60, -40); U = (30, -95)
def add(*ps): return (sum(p[0] for p in ps), sum(p[1] for p in ps))
pV, pW, pU = add(o, V), add(o, W), add(o, U); pVW = add(o, V, W); pUV = add(o, U, V); pUW = add(o, U, W); pUVW = add(o, U, V, W)
fig_box = canvas(560, 240,
    path(f"M{o[0]} {o[1]} L{pV[0]} {pV[1]} L{pVW[0]} {pVW[1]} L{pW[0]} {pW[1]} Z", GRAY, 1.5, "rgba(138,151,166,.15)"),
    path(f"M{pU[0]} {pU[1]} L{pUV[0]} {pUV[1]} L{pUVW[0]} {pUVW[1]} L{pUW[0]} {pUW[1]} Z", GRAY, 1.5, "rgba(138,151,166,.06)"),
    line(pV[0], pV[1], pUV[0], pUV[1], GRAY, 1.5), line(pVW[0], pVW[1], pUVW[0], pUVW[1], GRAY, 1.5), line(pW[0], pW[1], pUW[0], pUW[1], GRAY, 1.5),
    arrow(o[0], o[1], pV[0], pV[1], BLUE, "", 3), text(195, 212, "V", 15, BLUE, "middle", True),
    arrow(o[0], o[1], pW[0], pW[1], RED, "", 3), text(190, 166, "W", 15, RED, "start", True),
    arrow(o[0], o[1], pU[0], pU[1], GREEN, "", 3), text(118, 120, "U", 15, GREEN, "end", True),
    text(240, 178, "밑면 |V×W|", 12, INK, "middle"),
    text(462, 44, "U·(V×W)", 13, INK, "middle", True), text(462, 66, "= |V×W| × (U의 수직 높이)", 11.5, INK, "middle"), text(462, 90, "= 평행육면체의 부피 (절댓값)", 11.5, INK, "middle", True),
    text(462, 126, "세 벡터가 한 평면에 있으면", 12, RED, "middle"), text(462, 146, "높이 0 → 부피 0 → U·(V×W) = 0", 11.5, RED, "middle", True),
    cap="혼합삼중적의 기하: 밑면(평행사변형 \\(\\mathbf V,\\mathbf W\\)) 넓이에 \\(\\mathbf U\\)의 수직 높이 성분을 곱한 것. 필기본 옆 한글 메모 「평행육면체」.")

fig_forces = canvas(560, 210,
    block(200, 70, 160, 90, "", INK), text(280, 88, "물체", 13, INK, "middle", True),
    arrow(120, 115, 194, 115, GREEN, "외력 (다른 물체가)", 2.8, -10, -12),
    arrow(280, 20, 280, 64, BLUE, "표면력: 접촉", 2.4, 70, 0),
    arrow(280, 160, 280, 200, RED, "체적력: 중력 W = mg", 2.6, 90, 0),
    line(280, 96, 280, 154, GRAY, 1.2, "4 3"), text(255, 108, "내력", 11.5, GRAY, "end"), text(255, 122, "(같은 물체의", 10.5, GRAY, "end"), text(255, 134, "다른 부분이)", 10.5, GRAY, "end"),
    cap="힘의 분류 두 가지. 외력/내력은 「물체」를 어디까지로 잡느냐에 따라 달라지고, 체적력(부피 전체)/표면력(표면)은 힘이 걸리는 자리로 나눈다.")

fig_contact = canvas(560, 220,
    path("M40 190 L 420 190 L 420 90 Z", INK, 2, "rgba(31,42,68,.05)"),
    # 경사면 위 블록 (회전 없이 단순화)
    rect(230, 108, 70, 44, INK, fill="#F1F3F5", sw=2, rx=5),
    arrow(265, 130, 285, 60, GREEN, "N (면에 수직)", 2.8, 60, -4),
    arrow(265, 130, 190, 150, PINK, "", 2.8), text(160, 148, "f (면에 평행)", 12, PINK, "end"),
    arrow(265, 130, 265, 200, RED, "W", 2.4, 14, 10),
    text(120, 60, "접촉력 F = N + f", 15, INK, "middle", True), text(120, 84, "곡면이면 접점의 접평면 기준", 12, GRAY, "middle"),
    text(480, 150, "손 ⇄ 벽", 13, INK, "middle", True), text(480, 170, "F(손→벽) = −F(벽→손)", 12, INK, "middle"), text(480, 188, "뉴턴 제3법칙", 12, RED, "middle", True),
    cap="면과 면이 닿을 때 접촉력은 <b>수직력 N</b>과 <b>마찰력 f</b>로 나뉜다. (그림의 경사면은 방향을 보이기 위한 예)")

fig_pulley = canvas(560, 230,
    line(60, 30, 240, 30, INK, 3), line(150, 30, 150, 70, INK, 2), circle(150, 95, 26, INK, w=2.5, fill="#F1F3F5"), dot(150, 95, "", 4, INK),
    line(124, 95, 124, 160, GRAY, 2), line(176, 95, 176, 150, GRAY, 2),
    block(94, 160, 60, 44, "m", INK), arrow(124, 158, 124, 120, GREEN, "T₁", 2.6, -14, 0),
    arrow(176, 150, 176, 112, GREEN, "T₂", 2.6, 16, 0), text(200, 176, "사람이 당김", 11.5, GRAY, "start"),
    text(150, 222, "도르래: 방향만 바꾼다, T₁ = T₂ (케이블 질량 0)", 12.5, INK, "middle", True),
    # 스프링
    line(340, 60, 340, 200, INK, 2), path("M340 80 l 20 8 l -40 8 l 40 8 l -40 8 l 40 8 l -40 8 l 20 8", INK, 2), line(340, 136, 340, 150, INK, 2),
    line(340, 60, 500, 60, GRAY, 1, "4 3"), line(340, 150, 500, 150, GRAY, 1, "4 3"), text(470, 108, "L₀ (자연 길이)", 12, GRAY, "middle"),
    text(430, 176, "F = k |L − L₀|   [k: N/m]", 13.5, INK, "middle", True), text(430, 196, "늘리면 당기고, 누르면 민다", 12, GRAY, "middle"),
    cap="장력 T의 작용선은 케이블과 일직선. 도르래를 지나도 크기는 그대로. 선형 스프링은 늘어난 길이에 비례해 원래 길이로 돌아가려 한다.")

fig_fbd = canvas(560, 200,
    # 왼쪽: 실제 상황
    line(40, 30, 200, 30, INK, 3), line(120, 30, 120, 90, GRAY, 2), block(90, 90, 60, 44, "상자", INK), text(120, 160, "① 분리할 물체 = 상자", 12, INK, "middle"),
    arrow(220, 100, 270, 100, INK, "", 1.8), text(245, 88, "떼어낸다", 11, GRAY, "middle"),
    # 오른쪽: FBD
    block(300, 80, 60, 44, "상자", INK), arrow(330, 78, 330, 30, GREEN, "T (케이블)", 2.8, 46, 0), arrow(330, 126, 330, 176, RED, "W = mg", 2.8, 44, 0),
    text(330, 196, "② 그 물체만 그리고 ③ 모든 외력 표시", 12, INK, "middle"),
    text(480, 70, "평형 → ΣF = 0", 14, INK, "middle", True), text(480, 94, "T − mg = 0", 13.5, GREEN, "middle"), text(480, 116, "T = mg", 13.5, GREEN, "middle", True),
    cap="자유물체도 3단계. 케이블·바닥·다른 물체는 지우고 그것들이 주던 <b>힘</b>만 남긴다. 그 다음 합력 0.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>정역학 · 9/16 혼합삼중적 · Ch.3 힘 — 종류 · 평형 · 자유물체도</title></head><body>
<header>
<h1>벡터의 마지막 도구, 그리고 "여기서부터 중간고사" — 힘의 종류와 자유물체도</h1>
<p class="lead">앞 15분은 Ch.2의 마지막 도구 <b>혼합삼중적</b>(행렬식·부피·공면 판정). 그다음 교수님이 "<b>여기서부터 중간고사 범위. 3, 4, 5장</b>"이라고 선언하고 <b>Ch.3 힘</b>에 들어갔다. 정역학의 두 핵심 <b>평형</b>과 <b>자유물체도</b>를 예고하고, 힘의 종류를 하나씩 정의한 뒤 \\(\\sum\\mathbf F=0\\)과 자유물체도 3단계로 마쳤다. 이 회차는 녹음이 없어 교수님 필기본 13쪽과 LMS 영상으로 정리했다.</p>
<p class="meta"><span>교수 필기본 W3-2 13p</span><span>LMS 영상 53분</span><span>녹음 없음</span><span>3주차 · 수 · 중간 범위 시작</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 혼합삼중적 U·(V×W) — 행렬식 · 부피 · 공면이면 0</h2>
<p>4장에서 <b>직선에 대한 힘의 모멘트</b>를 다룰 때 쓴다. 먼저 \\(\\mathbf V\\times\\mathbf W\\)(외적)를 구하고 그 결과와 \\(\\mathbf U\\)를 내적한다 — 마지막이 내적이니 결과는 <b>스칼라</b>(교수님 질문 "벡터? 스칼라?").</p>
<div class="formula">\\[\\mathbf U\\cdot(\\mathbf V\\times\\mathbf W)=\\begin{{vmatrix}}U_x&U_y&U_z\\\\V_x&V_y&V_z\\\\W_x&W_y&W_z\\end{{vmatrix}},\\qquad \\mathbf U\\cdot(\\mathbf V\\times\\mathbf W)=-\\mathbf V\\cdot(\\mathbf U\\times\\mathbf W)\\ (\\text{{두 벡터를 바꾸면 부호 반대}})\\]</div>
<div class="say">"<b>외우고 가자</b>" — 행렬식. "행렬식으로 계산해 보면 나온다. 행렬식 형태를 기억하라."</div>
{fig_box}
<div class="why">\\(|\\mathbf V\\times\\mathbf W|\\)는 밑면 평행사변형의 넓이, 거기에 \\(\\mathbf U\\)의 <b>밑면에 수직한 높이 성분</b>을 곱하니(내적) 평행육면체의 부피가 된다. 세 벡터가 한 평면에 있으면 높이가 0 → <b>공면(coplanar)이면 \\(\\mathbf U\\cdot(\\mathbf V\\times\\mathbf W)=0\\)</b> — "계산할 필요 없이 그냥 0". 필기본 빨간 밑줄 두 곳.</div>
<details class="ex"><summary>연습 — \\(\\mathbf U=(1,0,0)\\), \\(\\mathbf V=(0,2,0)\\), \\(\\mathbf W=(0,0,3)\\) / \\(\\mathbf W'=(1,1,0)\\)</summary><div class="body"><p>\\(\\begin{{vmatrix}}1&0&0\\\\0&2&0\\\\0&0&3\\end{{vmatrix}}=1\\cdot(2\\cdot3-0)=6\\) → 부피 6(직육면체 1×2×3). \\(\\mathbf W'\\)로 바꾸면 \\(\\begin{{vmatrix}}1&0&0\\\\0&2&0\\\\1&1&0\\end{{vmatrix}}=1\\cdot(2\\cdot0-0\\cdot1)=0\\) → 세 벡터가 모두 \\(z=0\\) 평면에 있다(공면).</p></div></details>
<div class="analogy">상자 부피 = 밑면 넓이 × 높이. 세 벡터가 납작하게 한 평면에 누우면 상자가 눌려 부피 0. "세 점(벡터)이 같은 평면 위에 있나?"를 숫자 하나로 판정하는 도구.</div>
<div class="memo"><b>외울 것</b> \\(\\mathbf U\\cdot(\\mathbf V\\times\\mathbf W)=\\det[\\mathbf U;\\mathbf V;\\mathbf W]\\) · 스칼라 · 절댓값 = 평행육면체 부피 · <b>공면이면 0</b> · 두 벡터 바꾸면 부호 반대</div>
</section>

<section class="s" data-id="s2">
<h2>2. Ch.3 힘 — "여기서부터 중간고사 범위" · 외력/내력 · 체적력/표면력</h2>
<div class="say">"<b>여기서부터 중간고사 범위. 3, 4, 5장이 중간고사 범위.</b>" · 이 장에서 정역학의 <b>가장 중요한 두 개념</b>: ① 평형(equilibrium) ② 자유물체도(free-body diagram) — "이 식(평형 방정식)만 쓸 수 있으면 된다."</div>
{fig_forces}
<div class="why"><b>외력</b> = 다른 물체가 가하는 힘, <b>내력</b> = 같은 물체의 다른 부분이 가하는 힘. "물체"를 어떻게 정의하느냐에 따라 달라진다 — 여러 개를 묶어 하나로 볼 수도 있다(물리에서 배운 것 반복). <b>체적력</b>(body force)은 부피 전체에 작용(예: 중력), <b>표면력</b>(surface force)은 표면에 작용(예: 접촉력). 무게의 크기 \\(|\\mathbf W|=mg\\), \\(g=9.81\\ \\mathrm{{m/s^2}}\\).</div>
<div class="analogy">팀을 "물체"로 잡으면 팀원끼리 주고받는 힘은 내력(밖에서 보면 상쇄), 다른 팀이 주는 압박이 외력. 팀원 한 명을 "물체"로 잡는 순간 동료의 힘도 외력이 된다 — 자유물체도의 첫 단계 "무엇을 분리할지"가 이래서 중요하다.</div>
<div class="memo"><b>외울 것</b> 중간고사 = Ch.3·4·5 (10/19) · Ch.3 핵심 = 평형 + 자유물체도 · 외력/내력은 물체의 정의에 따라 · 체적력(중력)/표면력(접촉) · \\(W=mg\\)</div>
</section>

<section class="s" data-id="s3">
<h2>3. 접촉력 = 수직력 N + 마찰력 f · 뉴턴 제3법칙</h2>
{fig_contact}
<div class="formula">\\[\\mathbf F=\\mathbf N+\\mathbf f\\qquad(\\mathbf N\\perp\\text{{면}},\\ \\mathbf f\\parallel\\text{{면}}),\\qquad \\mathbf F_{{손\\to벽}}=-\\mathbf F_{{벽\\to손}}\\]</div>
<div class="why">두 평면이 접촉할 때 한 면이 다른 면에 가하는 접촉력은 일반적으로 두 성분 — 면에 <b>수직</b>인 수직력 \\(\\mathbf N\\), 면에 <b>평행</b>한 마찰력 \\(\\mathbf f\\). 곡면끼리 닿아도 결론은 같다: <b>접촉점의 접평면</b>을 기준으로 나눈다. 손이 벽을 밀면 벽도 손을 같은 크기로 민다(3법칙) — 이것이 자유물체도에서 "떼어낸 자리에 힘을 그리는" 근거.</div>
<div class="analogy">얼음판에서는 마찰(평행 성분)이 거의 없어 미끄러지고, 모래밭에서는 마찰이 커서 버틴다. 수직력은 "바닥이 나를 받쳐 주는 힘", 마찰력은 "바닥이 나를 옆으로 붙잡는 힘".</div>
<div class="memo"><b>외울 것</b> 접촉력 \\(\\mathbf F=\\mathbf N+\\mathbf f\\) · \\(\\mathbf N\\) 수직 · \\(\\mathbf f\\) 평행 · 곡면은 접평면 · 3법칙 \\(\\mathbf F_{{A\\to B}}=-\\mathbf F_{{B\\to A}}\\)</div>
</section>

<section class="s" data-id="s4">
<h2>4. 장력 · 도르래 · 스프링</h2>
{fig_pulley}
<div class="why"><b>장력</b>: 로프·케이블이 물체에 <b>묶여서 당겨질 때</b> 가하는 접촉력. 크기 \\(T\\), 작용선은 <b>케이블과 일직선</b>(colinear), 반대쪽(크레인)에는 \\(-\\mathbf T\\). <b>도르래</b>는 홈 파인 바퀴로 케이블의 <b>방향을 바꾸는</b> 장치 — 장력은 유지된다: \\(T_1=T_2\\). <b>스프링</b>은 늘어나거나 압축되면 원래 길이로 돌아가려는 힘을 낸다: 자연 길이 \\(L_0\\), 현재 길이 \\(L\\), 선형이면 \\(|\\mathbf F|=k|L-L_0|\\), \\(k\\) [N/m]. \\(L&gt;L_0\\)면 물체를 당기고, \\(L&lt;L_0\\)면 민다. 이 과목은 선형 스프링만.</div>
<div class="say">교수님이 학생에게 되물음: "<b>왜 같다고 가정하나?</b>"(\\(T_1=T_2\\)) → <b>케이블 질량을 0</b>으로 가정. \\(F=ma\\)에서 \\(m=0\\)이니 합력 0 → 장력이 케이블 전체에서 일정. "실제로는 질량이 있어 마찰·중력이 생기니 다르다. 중요한 건 아니지만 적어 둔다."</div>
<div class="analogy">도르래는 힘의 "방향 전환기" — 아래로 당겨서 위로 들어 올린다, 크기는 그대로. 스프링은 "원래 길이로 돌아가려는 고집"이고, 그 고집의 세기가 \\(k\\).</div>
<div class="memo"><b>외울 것</b> 장력 작용선 = 케이블 방향 · 도르래 \\(T_1=T_2\\)(케이블 질량 0) · 스프링 \\(F=k|L-L_0|\\), [N/m] · 늘림 → 당김, 압축 → 밈</div>
</section>

<section class="s" data-id="s5">
<h2>5. 평형 ⇔ ΣF = 0 · 자유물체도 3단계 ★★</h2>
<div class="why"><b>평형</b>의 정의: 물체의 <b>각 부분이 같은 일정 속도</b>를 가짐 — 정지 또는 등속 → 가속도 0. 그러면 \\(\\sum\\mathbf F=m\\mathbf a=0\\): <b>평형이면 물체에 작용하는 모든 외력의 벡터 합 = 0</b>. 그래서 먼저 <b>물체에 작용하는 모든 외력을 빠짐없이 찾아</b> 표시하고 합을 0으로 놓는다 — 그 "찾아 표시하기"가 자유물체도.</div>
{fig_fbd}
<div class="formula">\\[\\text{{평형}}\\ \\Leftrightarrow\\ \\sum\\mathbf F_{{\\text{{외력}}}}=0\\] <b>자유물체도 3단계</b>: ① 분리할 물체를 정한다 → ② 주변에서 떼어내 그 물체만 그린다 → ③ 모든 외력을 표시한다</div>
<div class="say">"교재에 있지만, 예제를 직접 풀어 봐야 제일 빨리 이해된다. <b>다음 시간에 예제로 자유물체도 그리는 법</b>."</div>
<details class="ex"><summary>연습 — 질량 10 kg 상자를 케이블로 매달아 도르래를 거쳐 사람이 잡고 정지</summary><div class="body"><p>① 물체 = 상자 ② 상자만 그린다 ③ 외력: 케이블 장력 \\(T\\)(위), 무게 \\(mg\\)(아래). \\(\\sum F_y=T-mg=0\\) → \\(T=10\\times9.81=98.1\\) N. 도르래 반대편 사람 쪽 케이블도 98.1 N(방향만 다름, \\(T_1=T_2\\)).</p></div></details>
<div class="analogy">자유물체도는 "그 사람만 방에 남기고 나머지는 다 내보낸 뒤, 나간 사람들이 그에게 주던 힘만 화살표로 남기는 것". 화살표를 하나라도 빠뜨리면 평형식이 틀린다 — 그래서 3단계 중 ③이 점수를 가른다.</div>
<div class="memo"><b>외울 것</b> 평형 = 가속도 0 = 정지 또는 등속 · \\(\\sum\\mathbf F=0\\) · FBD ① 물체 정하기 ② 떼어내 그리기 ③ 모든 외력 · 과제 1~2문제가 시험에 그대로(OT)</div>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 삼중적의 결과</div><div class="qb">\\(\\mathbf U\\cdot(\\mathbf V\\times\\mathbf W)\\)의 결과는?</div><ol class="choices"><li data-ok="1">스칼라 — 마지막 연산이 내적이므로</li><li>벡터 — 외적이 들어 있으므로</li><li>3×3 행렬</li><li>각도</li></ol><div class="ans">외적(벡터)을 먼저 하고 내적(스칼라)으로 끝난다. 절댓값 = 평행육면체 부피.</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 행렬식 계산</div><div class="qb">\\(\\mathbf U=(1,0,0)\\), \\(\\mathbf V=(0,2,0)\\), \\(\\mathbf W=(0,0,3)\\)일 때 \\(\\mathbf U\\cdot(\\mathbf V\\times\\mathbf W)\\)는?</div><ol class="choices"><li data-ok="1">6</li><li>0</li><li>\\((1,2,3)\\)</li><li>5</li></ol><div class="ans">대각 행렬식 = \\(1\\cdot2\\cdot3=6\\) = 직육면체 부피. \\(\\mathbf W=(1,1,0)\\)이면 공면이라 0.</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 접촉력</div><div class="qb">면과 면이 닿을 때 접촉력의 두 성분은?</div><ol class="choices"><li data-ok="1">면에 수직한 수직력 \\(\\mathbf N\\) + 면에 평행한 마찰력 \\(\\mathbf f\\)</li><li>면에 평행한 수직력 + 면에 수직한 마찰력</li><li>수직력 \\(\\mathbf N\\)뿐이다</li><li>마찰력은 항상 무게와 같다</li></ol><div class="ans">\\(\\mathbf F=\\mathbf N+\\mathbf f\\). 곡면이면 접평면 기준.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 도르래</div><div class="qb">도르래 양쪽 케이블의 장력이 같다(\\(T_1=T_2\\))고 가정하는 근거는?</div><ol class="choices"><li data-ok="1">케이블 질량을 0으로 두면 \\(F=ma\\)에서 합력이 0이라 장력이 케이블 전체에서 일정</li><li>도르래가 회전하지 않기 때문</li><li>케이블이 늘어나기 때문</li><li>도르래의 마찰이 크기 때문</li></ol><div class="ans">교수님이 되물은 질문. 실제로는 질량·마찰이 있어 조금 다르다.</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 평형 방정식</div><div class="qb">물체가 평형일 때 성립하는 것은?</div><ol class="choices"><li data-ok="1">물체에 작용하는 모든 <b>외력</b>의 벡터 합 = 0</li><li>\\(\\sum\\mathbf F=m\\mathbf a\\), \\(\\mathbf a\\ne0\\)</li><li>내력의 합만 0이면 된다</li><li>무게와 장력은 항상 같다</li></ol><div class="ans">평형 = 가속도 0. 내력은 3법칙으로 저절로 상쇄되니 외력만 센다.</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 자유물체도</div><div class="qb">질량 10 kg 상자를 케이블로 매달아 정지시켰다. 자유물체도 3단계를 쓰고 장력을 구하라.</div><div class="ans">① 물체 = 상자 ② 상자만 그림 ③ 외력: \\(T\\)(위), \\(mg\\)(아래). \\(T-mg=0\\) → \\(T=98.1\\) N. 도르래 너머 사람 쪽도 98.1 N.</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
