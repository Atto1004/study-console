# -*- coding: utf-8 -*-
"""정역학 · 2026-09-30 수업 노트 (녹음 없음 — 교수필기_한글_5주차_W5-2 14p 순서가 뼈대 + 영상정리_5주차_W5-2 51분 + 수업요약_5주차_W5-2)"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\정역학\_수업노트\2026-09-30.html"

def ground(x1, x2, y, n=None):
    """바닥선 + 빗금"""
    s = line(x1, y, x2, y, INK, 2.4)
    k = n or max(3, int((x2 - x1) / 12))
    for i in range(k):
        x = x1 + 6 + i * (x2 - x1 - 8) / k
        s += line(x, y + 2, x - 7, y + 10, GRAY, 1.2)
    return s

def pin_sup(x, y, label_y=None):
    """핀 지지: 보 아래 점 (x, y) 에 원 + 삼각대 + 바닥"""
    return (path(f"M{x} {y+4} L{x-16} {y+32} L{x+16} {y+32} Z", INK, 2, "#F1F3F5") + circle(x, y + 4, 4.5, INK, fill="#fff", w=2)
            + ground(x - 24, x + 24, y + 32, 4))

def roller_sup(x, y):
    """롤러: 삼각대 + 바퀴 두 개 + 바닥"""
    return (path(f"M{x} {y+4} L{x-14} {y+24} L{x+14} {y+24} Z", INK, 2, "#F1F3F5") + circle(x, y + 4, 4.5, INK, fill="#fff", w=2)
            + circle(x - 8, y + 30, 5.5, INK, w=1.8) + circle(x + 8, y + 30, 5.5, INK, w=1.8) + ground(x - 24, x + 24, y + 36, 4))

def beam(x, y, w, h=12):
    return rect(x, y, w, h, INK, fill="#F1F3F5", sw=1.8, rx=3)

# 1. Ch.4 요약 — 여러 힘 ⇒ F + M ⇒ 렌치
fig_recap = canvas(560, 200,
    step(1, rect(20, 50, 150, 110, GRAY, sw=1.6, rx=14, fill="rgba(138,151,166,.08)"),
        arrow(40, 140, 80, 110, GREEN, "", 2.4), arrow(150, 150, 130, 100, GREEN, "", 2.4), arrow(110, 70, 150, 64, GREEN, "", 2.4),
        loop_dir(70, 80, 13, False, RED), text(95, 186, "여러 힘 · 우력", 13, INK, "middle", True)),
    step(2, text(196, 112, "⇒", 22, INK, "middle", True),
        dot(270, 140, "", 4, INK), text(258, 156, "P", 13, INK, "end", True),
        arrow(270, 140, 300, 70, GREEN, "", 3), text(312, 80, "F", 14, GREEN, "start", True),
        loop_dir(250, 92, 15, False, RED), text(226, 70, "M", 14, RED, "middle", True),
        text(270, 186, "P 의 F + 우력 M", 13, INK, "middle", True)),
    step(3, text(352, 112, "⇒", 22, INK, "middle", True),
        dot(440, 150, "", 4, INK), arrow(440, 150, 440, 60, GREEN, "", 3), text(452, 72, "F", 14, GREEN, "start", True),
        arrow(480, 150, 480, 90, RED, "", 2.4), text(492, 100, "M∥", 14, RED, "start", True),
        text(460, 186, "렌치 F + M∥", 13, INK, "middle", True)),
    cap="필기 p.2·p.3 Ch.4 요약. 등가 = 합력 같고 한 점의 합모멘트 같음 → 어떤 계든 힘 하나 + 우력 하나 → 수직 성분은 힘을 옮겨 흡수해 렌치(\\(\\mathbf F+\\mathbf M_\\parallel\\)).", name="recap")

# 2. 평형식 3개 — 핀 + 롤러 보
fig_eq3 = canvas(580, 220,
    step(1, beam(40, 100, 280), pin_sup(60, 106), roller_sup(300, 106),
        arrow(180, 36, 180, 96, INK, "", 2.6), text(192, 50, "하중", 13, INK, "start", True),
        text(60, 180, "A", 13, INK, "middle", True), text(300, 186, "B", 13, INK, "middle", True)),
    step(2, arrow(2, 106, 38, 106, GREEN, "", 2.4), text(18, 94, "A_x", 13, GREEN, "middle", True),
        arrow(60, 98, 60, 48, GREEN, "", 2.4), text(72, 60, "A_y", 13, GREEN, "start", True),
        arrow(300, 98, 300, 48, GREEN, "", 2.4), text(312, 60, "B", 13, GREEN, "start", True)),
    step(3, text(470, 70, "ΣF_x = 0", 15, INK, "middle", True), text(470, 100, "ΣF_y = 0", 15, INK, "middle", True), text(470, 130, "ΣM_P = 0", 15, INK, "middle", True)),
    step(4, text(470, 170, "독립 방정식 최대 3개", 13, RED, "middle", True), text(470, 192, "→ 미지수 3개까지 푼다", 13, RED, "middle", True)),
    cap="2D 평형(필기 p.4·p.5). 반력 화살표는 지지대가 보에 주는 힘을 지지대 옆에 따로 그린 것. 미지수 \\(A_x,A_y,B\\) 3개 = 식 3개.", name="eq3")

# 3. free of motion ⇒ cannot exert force
fig_free = canvas(560, 210,
    step(1, line(40, 140, 520, 140, INK, 4), rect(230, 118, 80, 44, INK, fill="#F1F3F5", sw=2, rx=8),
        text(130, 122, "홈(막대)을 따라 움직이는 물체", 12.5, GRAY, "middle")),
    step(2, arrow(270, 92, 360, 92, GRAY, "", 2.4), arrow(270, 92, 180, 92, GRAY, "", 2.4),
        text(270, 70, "움직임이 자유 → 그 방향으로 힘을 줄 수 없다", 13, GRAY, "middle", True)),
    step(3, arrow(270, 204, 270, 166, GREEN, "", 3), text(284, 192, "막힌 방향 → 반력", 13, GREEN, "start", True)),
    step(4, text(110, 30, "free of motion ⇒ cannot exert force", 13, RED, "start", True)),
    cap="필기 p.6 빨간 글씨. 지지대는 물체가 <b>움직이지 못하게 막는 것</b>, 그래서 막는 방향에만 반력이 생긴다. 회전이 자유로우면 모멘트도 못 준다.", name="free")

# 4. 핀 · 롤러 — 지지대 그림과 자유물체도
fig_pr = canvas(580, 210,
    step(1, beam(20, 70, 110), pin_sup(100, 76), text(100, 140, "핀 (pin)", 13, INK, "middle", True)),
    step(2, beam(160, 70, 110),
        arrow(200, 96, 246, 96, GREEN, "", 2.4), text(222, 116, "A_x", 13, GREEN, "middle", True),
        arrow(250, 146, 250, 88, GREEN, "", 2.4), text(262, 130, "A_y", 13, GREEN, "start", True),
        text(204, 168, "모멘트 ✕", 13, RED, "middle", True)),
    step(3, line(296, 20, 296, 200, GRAY, 1, "3 4"),
        beam(312, 70, 110), roller_sup(392, 76), text(392, 140, "롤러 (roller)", 13, INK, "middle", True)),
    step(4, beam(450, 70, 110),
        arrow(540, 146, 540, 88, GREEN, "", 2.4), text(530, 130, "A ⊥ 면", 13, GREEN, "end", True),
        text(500, 168, "면에 평행한 힘 ✕", 13, RED, "middle", True)),
    cap="필기 p.7·p.8. 핀은 이동을 막아 힘 두 성분 \\(A_x,A_y\\)를 주지만 축 둘레 회전은 자유라 모멘트는 못 준다. 롤러(바퀴 위의 핀)는 면을 따라 자유라 면에 수직인 힘 하나.", name="pinroller")

# 5. 매끈한 면 · 거친 면 · 슬라이더 · 고정
fig_sf = canvas(600, 230,
    step(1, ground(12, 140, 150, 9), rect(45, 108, 60, 42, INK, fill="#F1F3F5", sw=2, rx=5),
        arrow(75, 200, 75, 156, GREEN, "", 2.4), text(88, 192, "N", 13, GREEN, "start", True),
        text(75, 30, "매끈한 면", 13, INK, "middle", True), text(75, 50, "수직력만 · 1", 12, GRAY, "middle")),
    step(2, ground(162, 290, 150, 9), rect(195, 108, 60, 42, INK, fill="#F1F3F5", sw=2, rx=5),
        arrow(240, 200, 240, 156, GREEN, "", 2.4), text(252, 192, "N", 13, GREEN, "start", True),
        arrow(220, 174, 176, 174, PINK, "", 2.4), text(186, 194, "f", 13, PINK, "middle", True),
        text(225, 30, "거친 면", 13, INK, "middle", True), text(225, 50, "수직력 + 마찰력 · 2", 12, GRAY, "middle")),
    step(3, line(312, 130, 438, 130, INK, 4), rect(355, 118, 40, 24, INK, fill="#F1F3F5", sw=2, rx=4),
        arrow(375, 98, 425, 98, GRAY, "", 2), arrow(375, 98, 325, 98, GRAY, "", 2), text(375, 84, "자유", 12, GRAY, "middle"),
        arrow(375, 196, 375, 148, GREEN, "", 2.4), text(388, 188, "A", 13, GREEN, "start", True),
        text(375, 30, "슬라이더", 13, INK, "middle", True), text(375, 50, "움직임에 수직 · 1", 12, GRAY, "middle")),
    step(4, rect(458, 70, 14, 130, INK, fill="rgba(138,151,166,.35)", sw=1.5), beam(472, 124, 100),
        arrow(540, 166, 482, 166, GREEN, "", 2.4), text(548, 171, "A_x", 13, GREEN, "start", True),
        arrow(500, 214, 500, 140, GREEN, "", 2.4), text(512, 208, "A_y", 13, GREEN, "start", True),
        loop_dir(500, 98, 13, False, RED), text(524, 102, "M_A", 13, RED, "start", True),
        text(525, 30, "고정 (built-in)", 13, INK, "middle", True), text(525, 50, "A_x, A_y, M_A · 3", 12, GRAY, "middle")),
    cap="필기 p.9~p.11. 숫자는 그 지지대가 만드는 미지수 개수. 원리는 하나 — 움직임이 막힌 방향에만 반력, 회전이 막혀야 모멘트.", name="supports")

# 6. 자유물체도 4단계 — 예제 1 (핀 + 30° 경사면 롤러)
c30, s30 = math.cos(math.radians(30)), math.sin(math.radians(30))
inc = lambda x: round(121 - math.tan(math.radians(30)) * (x - 410), 1)   # 경사면: (410,121) 을 지나고 오른쪽으로 30° 오르막
fig_fbd = canvas(600, 262,
    step(1, beam(60, 90, 360), pin_sup(70, 96),
        circle(410, 110, 6, INK, w=2), line(350, inc(350), 490, inc(490), INK, 2.4), line(350, inc(350), 440, inc(350), GRAY, 1.2, "4 3"),
        arc(350, inc(350), 34, -30, 0, GRAY, 1.4), text(382, inc(350) + 17, "30°", 12, GRAY, "start"),
        arrow(240, 30, 240, 86, INK, "", 2.6), text(252, 44, "하중", 13, INK, "start", True),
        text(70, 160, "A (핀)", 13, INK, "middle", True)),
    step(2, text(470, 22, "① 보만 떼어 낸다", 12.5, INK, "start"), text(470, 42, "② 지지대를 지운다", 12.5, INK, "start")),
    step(3, text(470, 62, "③ 반력으로 바꾼다", 12.5, GREEN, "start", True),
        arrow(12, 96, 56, 96, GREEN, "", 2.4), text(30, 86, "A_x", 13, GREEN, "middle", True),
        arrow(70, 88, 70, 40, GREEN, "", 2.4), text(82, 52, "A_y", 13, GREEN, "start", True),
        line(410, 104, 410, 196, GRAY, 1, "3 3"),
        arrow(round(410 + 70 * s30, 1), round(104 + 70 * c30, 1), 412, 107, GREEN, "", 2.6), text(452, 178, "B", 14, GREEN, "start", True),
        text(452, 198, "수직선과 30°", 12, GREEN, "start")),
    step(4, text(300, 224, "④ ΣF_x = 0 · ΣF_y = 0 · ΣM_A = 0", 13.5, INK, "middle", True),
        text(300, 244, "미지수 A_x, A_y, B = 3개 = 식 3개", 12.5, RED, "middle", True)),
    cap="예제 1(필기 p.13): 왼쪽 핀, 오른쪽 30° 경사면 위 롤러. 롤러 반력은 경사면에 수직 — 경사면이 수평과 30°면 그 법선은 수직선과 30°. 하중 숫자는 필기에 없다.", name="fbd")

# 7. 예제 2 — 고정 지지 + 케이블
fig_ex2 = canvas(560, 250,
    step(1, rect(26, 30, 14, 190, INK, fill="rgba(138,151,166,.35)", sw=1.5), beam(40, 144, 250), rect(278, 70, 12, 86, INK, fill="#F1F3F5", sw=1.8, rx=3),
        line(196, 14, 196, 30, INK, 2), circle(196, 44, 14, INK, w=2, fill="#fff"), dot(196, 44, "", 3, INK),
        line(132, 144, 183, 48, GRAY, 1.8), line(209, 48, 278, 84, GRAY, 1.8),
        text(46, 136, "A", 13, INK, "start", True), text(250, 30, "도르래", 12, GRAY, "start")),
    step(2, arrow(104, 168, 48, 168, GREEN, "", 2.4), text(112, 173, "A_x", 13, GREEN, "start", True),
        arrow(60, 240, 60, 162, GREEN, "", 2.4), text(72, 232, "A_y", 13, GREEN, "start", True),
        loop_dir(76, 100, 14, False, RED), text(100, 96, "M_A", 13, RED, "start", True)),
    step(3, arrow(132, 144, 150, 110, BLUE, "", 3), text(164, 128, "T", 14, BLUE, "start", True),
        arrow(278, 84, 240, 64, BLUE, "", 3), text(258, 98, "T", 14, BLUE, "middle", True),
        text(330, 96, "같은 케이블 → 크기 같은 T", 12.5, BLUE, "start")),
    step(4, text(330, 180, "ΣM_A : A_x, A_y 는 팔 0 → 빠진다", 13, RED, "start", True), text(330, 202, "남는 것 = M_A 와 T 항", 13, RED, "start", True)),
    cap="예제 2(필기 p.14) 단순화 그림: 벽에 고정된 ㄴ자 부재를 도르래를 지난 케이블이 두 곳에서 당긴다. 하중 숫자는 필기에 없다.", name="ex2")

html = r'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>정역학 · 9/30 Ch.4 요약 · Ch.5 평형 — 지지대와 반력 · 자유물체도</title></head><body>
<header>
<h1>움직임을 막는 곳에만 힘이 생긴다 — 평형식 3개와 지지대 반력</h1>
<p class="lead">앞부분은 Ch.4를 네 줄로 정리(등가계·힘 + 우력·힘 옮기기·렌치). 그다음 <b>Ch.5 평형</b>에 들어가며 "중간고사는 5장까지, 3·4·5"를 다시 못 박았다. 평형 = \(\sum\mathbf F=0\) 그리고 \(\sum\mathbf M_P=0\), 2D에서는 식 <b>3개</b>. 그 3개로 풀려면 지지대가 어떤 반력을 주는지 정확히 알아야 하고, 원리는 한 줄 — <b>자유롭게 움직이는 방향으로는 힘을 못 준다</b>. 핀·롤러·매끈한/거친 면·슬라이더·고정을 이 원리로 판정하고 자유물체도 4단계와 예제 2개로 마쳤다. 교수님 필기본 14쪽 순서대로, 말씀은 LMS 영상에서 옮겼다.</p>
<p class="meta"><span>교수 필기본 W5-2 14p</span><span>LMS 영상 51분</span><span>녹음 없음</span><span>5주차 · 수 · 중간 범위 Ch.5 시작</span><span>교재 대응 Pytel 4e 4.1~4.3</span></p>
</header>

<section class="s" data-id="s1" data-nodes="mech.couple">
<h2>1. Ch.4 요약 — 등가계 · 힘 하나 + 우력 하나 · M = r × F · 렌치</h2>
<p>필기 p.2: 두 힘·모멘트 계가 <b>등가</b>이려면 \((\sum\mathbf F)_1=(\sum\mathbf F)_2\) <b>그리고</b> 한 점 P에 대해 \((\sum\mathbf M_P)_1=(\sum\mathbf M_P)_2\). 아무리 복잡한 계도 <b>점 P의 힘 하나 + 우력 하나</b>로 나타낼 수 있다(빨강). 힘을 다른 점으로 옮기면 <b>우력 모멘트 \(\mathbf M=\mathbf r\times\mathbf F\)를 더해야</b> 한다.</p>
{fig_recap}
<div class="formula">\[\text{가장 단순한 일반 등가계}=\text{렌치}=\mathbf F+\mathbf M_\parallel\qquad(\mathbf M_\parallel\parallel\mathbf F)\]</div>
<div class="why">필기 p.3: \(\mathbf M_\parallel\)은 힘 \(\mathbf F\)와 <b>평행한</b> 우력 모멘트. 작용점을 잘 옮기면 \(\mathbf F\)에 수직인 모멘트 성분은 없앨 수 있고(\(\mathbf r\times\mathbf F\)는 늘 \(\mathbf F\)에 수직) 평행 성분만 남는다 — 9/28에 본 \(\mathbf M_p\)와 같은 것이다. 이 요약의 등가 조건 "한 점이면 충분"이 바로 다음 평형 조건으로 이어진다.</div>
<div class="analogy">짐이 잔뜩 든 장바구니도 결국 "어느 쪽으로 얼마나 끌리나(힘 하나)"와 "손목이 얼마나 비틀리나(우력 하나)" 두 가지로 느껴진다. 렌치는 그 비틀림 중 끌리는 방향 축 둘레 몫만 남긴 것.</div>
<div class="memo"><b>외울 것</b> 등가 = \(\sum\mathbf F\) 같고 한 점의 \(\sum\mathbf M_P\) 같음 · 어떤 계든 힘 하나 + 우력 하나 · 힘을 옮기면 \(\mathbf M=\mathbf r\times\mathbf F\) 추가 · 렌치 = \(\mathbf F+\mathbf M_\parallel\)</div>
</section>

<section class="s" data-id="s2" data-nodes="mech.rigid_2d">
<h2>2. Ch.5 평형 · 5.1 2D — 조건 두 개, 스칼라식 세 개</h2>
<div class="say">"저희 중간고사는 <b>5장까지</b> 시험 범위입니다. <b>3, 4, 5</b>." — Ch.5에 들어가며 범위를 다시 확인했다(중간고사 10/19).</div>
<p>필기 p.4: 물체가 평형이면 두 조건을 <b>모두</b> 만족해야 한다. ① 모든 외력의 벡터합 = 0 → \(\sum\mathbf F=0\). ② 임의의 점에 대한 모멘트 합 = 0 → \(\sum\mathbf M_P=0\). 파란 글씨: <b>모멘트 평형을 모든 점에서 확인할 필요는 없다</b> — 4장에서 "합력이 같고 한 점의 합모멘트가 같으면 모든 점에서 같다"를 보였으니, \(\sum\mathbf F=0\)이면 한 점에서 성립한 모멘트 평형이 다른 점에서도 성립한다.</p>
<div class="formula">\[\sum\mathbf F=0,\qquad\sum\mathbf M_P=0\quad\Longrightarrow\quad\sum F_x=0,\ \ \sum F_y=0,\ \ \sum M_P=0\]</div>
{fig_eq3}
<div class="why">필기 p.5: 2D에서는 벡터식을 그대로 써도 되지만 \(x\)·\(y\) 성분으로 풀어 쓴 <b>스칼라식 3개</b>가 훨씬 단순하다(평면 문제에서 모멘트는 \(z\) 성분 하나뿐). 그래서 <b>2D 자유물체도 하나에서 얻는 독립 방정식은 최대 3개</b>, 구할 수 있는 미지수도 3개다. 교수님 질문 "평형이면 외력 합은?" — 0.</div>
<div class="analogy">세 다리 의자처럼 생각하면 된다. 좌우로 안 밀리고(\(\sum F_x=0\)), 위아래로 안 밀리고(\(\sum F_y=0\)), 제자리에서 안 돈다(\(\sum M_P=0\)). 세 가지가 다 막혀야 가만히 있다.</div>
<div class="memo"><b>외울 것</b> 평형 ⇔ \(\sum\mathbf F=0\) 그리고 \(\sum\mathbf M_P=0\) · 모멘트는 한 점만 확인 · 2D: \(\sum F_x=\sum F_y=\sum M_P=0\) · 독립 방정식 최대 3개 · 중간고사 = 3·4·5장(10/19)</div>
</section>

<section class="s" data-id="s3" data-nodes="mech.rigid_2d mech.fbd">
<h2>3. 하중과 반력 — free of motion ⇒ cannot exert force</h2>
<p>필기 p.6: <b>지지대(support)</b>는 물체를 제자리에 잡아 두거나 <b>움직이지 못하게 막는 것</b>(prevent it from moving, 빨간 밑줄). 지지대가 물체에 가하는 힘과 우력 모멘트가 <b>반력(reactions)</b>이다. 움직이지 못하게 막으려면 그 반대로 힘을 줘야 하니까 반력이 생긴다.</p>
<div class="say">"prevented from moving — <b>이 개념을 잘 기억해 보시고</b>."</div>
{fig_free}
<div class="why">빨간 원리: <b>움직임이 자유롭다(free of motion) ⇒ 그 방향으로 힘을 줄 수 없다</b>. 어느 방향으로 자유롭게 움직인다는 건 그 방향으로는 아무것도 붙잡아 주지 않는다는 뜻이다. 회전도 같다 — 회전이 자유로우면 모멘트를 줘도 저항하지 않고 그냥 돌아가니 <b>모멘트를 못 준다</b>. 그래서 지지대마다 "무엇을 막는가"만 보면 반력이 정해진다.</div>
<div class="analogy">지하철 손잡이 고리는 앞뒤로 흔들리니 앞뒤로는 나를 붙잡아 주지 못하고, 위로 매달린 방향으로만 나를 받쳐 준다. 막아 주는 방향에만 힘이 있다.</div>
<div class="memo"><b>외울 것</b> 지지대 = 움직임을 막는 것 · 반력 = 지지대가 주는 힘·우력 · free of motion ⇒ cannot exert force · 회전이 자유면 모멘트 0</div>
</section>

<section class="s" data-id="s4" data-nodes="mech.rigid_2d">
<h2>4. 핀 지지 · 롤러 지지</h2>
<p>필기 p.7 <b>핀(pin)</b>: 물체의 이동을 막는다 → <b>물체에 힘을 줄 수 있다</b>. 핀 축 둘레 회전은 허용 → <b>우력 모멘트는 줄 수 없다</b>. 2D 반력은 힘 두 성분 \(A_x,A_y\). 힘의 방향을 모르니 크기·방향 두 미지수를 \(x\)·\(y\) 성분 두 개로 둔 것이다.</p>
<div class="say">"핀이 모멘트를 줄 수 있나요? — <b>없는 거죠</b>." 핀에 모멘트를 그려 넣으면 미지수가 하나 늘어 식 3개로 못 푼다 — 핀은 모멘트 0이라는 걸 애초에 알고 들어가야 한다.</div>
{fig_pr}
<p>필기 p.8 <b>롤러(roller)</b> = 바퀴 위에 올린 핀. <b>롤러는 받치는 면을 따라 자유롭게 움직인다 → 그 면에 평행한 힘은 줄 수 없다</b>. 반력은 <b>받치는 면에 수직인 힘 하나</b>. 땅을 뚫지도, 떠오르지도 않게 받쳐 주는 것이 롤러의 역할이다.</p>
<div class="why">핀과 롤러의 차이는 "면을 따라 움직일 수 있느냐" 하나다. 다리(교량)의 한쪽은 핀, 다른 쪽은 롤러로 받치는 이유도 여기 있다 — 온도에 따라 늘어나는 상판이 롤러 쪽으로 미끄러져 빠져나간다. 롤러에 평행력이나 모멘트를 그리면 미지수가 식보다 많아져 못 푼다.</div>
<div class="analogy">핀은 문 경첩 — 문을 떼어 갈 수는 없지만(힘) 돌리는 건 마음대로(모멘트 0). 롤러는 바퀴 달린 의자 — 바닥이 위로 받쳐 주기만 하고 옆으로 미는 건 못 막는다.</div>
<div class="memo"><b>외울 것</b> 핀 = \(A_x,A_y\) (2개, 모멘트 없음) · 롤러 = 면에 수직인 힘 1개(평행력 없음) · 핀에 모멘트, 롤러에 평행력을 그리면 감점</div>
</section>

<section class="s" data-id="s5" data-nodes="mech.rigid_2d">
<h2>5. 매끈한 면 · 거친 면 · 슬라이더 · 고정 지지 — 반력 개수 표</h2>
<p>필기 p.9: <b>매끈한 면</b>(마찰 무시)은 면에 <b>수직인 힘만</b>(normal force only). <b>거친 면</b>(마찰 무시 불가)은 <b>수직력 + 마찰력</b>. 필기 p.10: <b>구속 핀·슬라이더</b>는 한 방향 움직임은 허용하고 그에 수직인 방향은 구속한다 — 자유 방향은 cannot exert force, 반력은 그 수직 방향 하나. 필기 p.11: <b>고정 지지(built-in)</b>는 물체가 벽에 단단히 붙어 이동과 회전을 <b>모두</b> 막는다 — 힘 두 성분 + 우력 모멘트 하나 \(A_x,A_y,M_A\).</p>
<div class="say">"서포트에서 <b>힘이 몇 개냐, 미지수가 몇 개냐</b> 싸움이에요."</div>
{fig_sf}
<div class="memo"><b>외울 것</b> 2D 반력 개수 — 핀 2(\(A_x,A_y\)) · 롤러 1(면에 수직) · 매끈한 면 1(수직력) · 거친 면 2(수직력 + 마찰력) · 슬라이더 1(움직임에 수직) · 고정 3(\(A_x,A_y,M_A\))</div>
<div class="why">표를 통째로 외우기 전에 원리로 다시 만들어 본다. 막는 것: 핀 = 이동 → 힘 2 / 롤러·매끈한 면·슬라이더 = 한 방향 이동 → 힘 1 / 거친 면 = 수직·면 방향 이동 → 힘 2 / 고정 = 이동 + 회전 → 힘 2 + 모멘트 1. 교재(Pytel 4e 4.3)도 같은 이유를 적고 반력 표(Table 4.1)를 "완전히 익숙해져야 한다"고 강조한다.</div>
<div class="analogy">매끈한 면은 빙판(받치기만), 거친 면은 고무 매트(받치고 붙잡기), 슬라이더는 커튼 고리(봉을 따라만 움직임), 고정은 벽에 박힌 선반 받침(어느 쪽으로도 안 움직이고 안 돈다).</div>
</section>

<section class="s" data-id="s6" data-nodes="mech.fbd mech.rigid_2d">
<h2>6. 자유물체도 → 평형식 4단계 · 예제 1 (핀 + 30° 경사면 롤러)</h2>
<p>필기 p.12 핵심 단계: ① 관심 있는 물체만 떼어 낸다 ② 그림에서 지지대를 지운다 ③ 각 지지대를 <b>그 지지대가 줄 수 있는 반력</b>으로 바꾼다(4·5절 표가 여기서 쓰인다) ④ 모든 하중·반력을 표시한 뒤 평형 방정식을 적용한다.</p>
{fig_fbd}
<div class="why">필기 p.13 예제 1: 왼쪽 핀 → \(A_x,A_y\)(모멘트 없음), 오른쪽 <b>30° 경사면</b> 위 롤러 → <b>경사면에 수직인 힘 \(B\) 하나</b>. 경사면이 수평과 30°면 그 법선은 수직선과 30° — "사이각 30도가 그대로 유지". \(B\)를 \(x\)·\(y\)로 나눠 \(\sum F_x=0,\ \sum F_y=0\)(+ \(\sum M=0\))을 세운다. 미지수 \(A_x,A_y,B\) 3개 = 식 3개라 풀린다. 필기에 하중 숫자는 없고, 영상에서 "숫자 하중이 주어지면 쉽게 풀린다"고 했다.</div>
<details class="ex"><summary>연습 — 예제 1에 숫자 넣기(하중은 아톰 설정): 보 길이 4 m, 가운데에 아래로 2 kN</summary><div class="body"><p>\(\sum M_A=0\): \((B\cos30^\circ)(4)-(2)(2)=0\) → \(B=1/\cos30^\circ\approx1.155\) kN. 성분 \(B_x=-B\sin30^\circ\approx-0.577\) kN, \(B_y=B\cos30^\circ=1.000\) kN. \(\sum F_x=0\): \(A_x\approx0.577\) kN(오른쪽). \(\sum F_y=0\): \(A_y+1.000-2=0\) → \(A_y=1.000\) kN(위). 검산 \(\sum M_B=-A_y(4)+2(2)=0\) — 한 점에서 성립하면 다른 점에서도 성립한다.</p></div></details>
<div class="analogy">자유물체도는 무대에서 주인공 한 명만 남기고 조명을 끄는 것. 꺼진 배경(지지대)이 주던 손길은 화살표로만 남긴다 — 그 화살표 개수를 지지대 표대로 정확히 세는 게 4단계의 ③이다.</div>
<div class="memo"><b>외울 것</b> FBD 4단계: 물체만 떼기 → 지지대 지우기 → 지지대를 줄 수 있는 반력으로 바꾸기 → 하중·반력 표시 후 평형식 · 경사면 30° → 롤러 반력은 수직선과 30°</div>
</section>

<section class="s" data-id="s7" data-nodes="mech.rigid_2d mech.fbd">
<h2>7. 예제 2 — 고정 지지 + 케이블 · 모멘트는 힘이 많이 모인 점에서</h2>
<p>필기 p.14: 벽에 고정된 ㄴ자 부재를, 위쪽 도르래를 지나는 케이블이 부재 두 곳에서 당긴다. 자유물체도: 고정단 \(A_x,A_y,M_A\) + 케이블 장력 \(T\) 두 곳. 같은 케이블이니 두 곳의 크기는 같다(3주차 이상적인 도르래 \(T_1=T_2\)).</p>
{fig_ex2}
<div class="say">"모멘트는 한 점에서만 계산하면 됩니다. <b>되도록 힘이 많이 모인 점</b>을 잡으세요."</div>
<div class="why">A를 기준으로 잡으면 \(A_x,A_y\)는 A를 지나니 모멘트 팔이 0이라 \(\sum M_A\) 식에서 빠진다. 남는 것은 우력 \(M_A\)(우력은 어느 점에서나 그대로)와 \(T\)의 항. 필기에 숫자는 없다 — \(T\)가 주어지면 미지수 \(A_x,A_y,M_A\) 3개를 식 3개로 바로 푼다. 교수님 질문 "케이블 힘이 더 있나?"는 두 곳을 빠뜨리지 말라는 확인이다.</div>
<details class="ex"><summary>연습 — 고정 지지 외팔보: 벽에 고정된 2 m 막대 끝에 아래로 500 N</summary><div class="body"><p>\(\sum F_x=0\): \(A_x=0\). \(\sum F_y=0\): \(A_y=500\) N(위). \(\sum M_A=0\): \(M_A-500(2)=0\) → \(M_A=1000\) N·m(반시계). 검산(끝점 기준): \(M_A-A_y(2)=1000-1000=0\).</p></div></details>
<div class="analogy">교실에서 떠드는 사람이 많은 쪽에 서면 그 사람들 말은 안 들린다 — 모멘트 기준점을 미지수가 몰린 점에 두면 그 미지수들이 식에서 사라진다.</div>
<div class="memo"><b>외울 것</b> 고정 지지 = \(A_x,A_y,M_A\) · 같은 케이블 = 같은 \(T\) · 모멘트 기준점은 미지수가 많이 지나는 점(\(\sum M_A\)에서 \(A_x,A_y\) 빠짐, \(M_A\)는 남음) · 개수 판정: 핀 + 롤러 = 3 풀림 · 핀 + 핀 = 4 못 풂</div>
</section>

<div class="q" data-qid="q1" data-nodes="mech.rigid_2d"><div class="qn">확인 1 · 평형 조건</div><div class="qb">강체가 평형일 때 모멘트 평형 \(\sum\mathbf M_P=0\)은 어디서 확인하면 되는가?</div><ol class="choices"><li data-ok="1">\(\sum\mathbf F=0\)과 함께 아무 점 하나에서만</li><li>모든 점에서 하나씩 확인해야 한다</li><li>무게중심에서만</li><li>지지대가 있는 점 두 곳에서</li></ol><div class="ans">필기 p.4 파란 글씨: 모든 점에서 확인할 필요 없다. 4장 등가계 — 한 점에서 같으면 모든 점에서 같다.</div></div>
<div class="q" data-qid="q2" data-nodes="mech.rigid_2d"><div class="qn">확인 2 · 2D 평형식</div><div class="qb">2D 자유물체도 하나에서 얻을 수 있는 독립 평형 방정식의 최대 개수는?</div><ol class="choices"><li data-ok="1">3개 — \(\sum F_x=0,\ \sum F_y=0,\ \sum M_P=0\)</li><li>2개</li><li>6개</li><li>지지대 개수만큼</li></ol><div class="ans">그래서 구할 수 있는 미지수도 3개까지. 3D는 6개(Ch.5 뒷부분).</div></div>
<div class="q" data-qid="q3" data-nodes="mech.rigid_2d"><div class="qn">확인 3 · 핀 지지</div><div class="qb">2D 핀 지지의 반력은?</div><ol class="choices"><li data-ok="1">\(A_x,A_y\) — 힘 두 성분, 모멘트 없음</li><li>\(A_x,A_y,M_A\)</li><li>면에 수직인 힘 하나</li><li>모멘트 \(M_A\) 하나</li></ol><div class="ans">이동은 막지만 축 둘레 회전은 자유 → 모멘트를 못 준다("핀이 모멘트를 줄 수 있나요? — 없는 거죠").</div></div>
<div class="q" data-qid="q4" data-nodes="mech.rigid_2d"><div class="qn">확인 4 · 롤러 지지</div><div class="qb">롤러가 줄 수 없는 것은?</div><ol class="choices"><li data-ok="1">받치는 면에 평행한 힘</li><li>받치는 면에 수직인 힘</li><li>모든 힘 — 롤러는 반력이 없다</li><li>면에 수직인 힘과 평행한 힘 둘 다 준다</li></ol><div class="ans">면을 따라 자유롭게 움직이니 그 방향으로는 힘을 못 준다(free of motion ⇒ cannot exert force). 반력은 면에 수직인 힘 하나.</div></div>
<div class="q" data-qid="q5" data-nodes="mech.rigid_2d"><div class="qn">확인 5 · 반력 개수</div><div class="qb">반력 미지수가 3개인 2D 지지대는?</div><ol class="choices"><li data-ok="1">고정 지지(built-in)</li><li>핀</li><li>거친 면</li><li>슬라이더</li></ol><div class="ans">고정 = 이동·회전 모두 막음 → \(A_x,A_y,M_A\). 핀 2 · 거친 면 2 · 슬라이더 1.</div></div>
<div class="q" data-qid="q6" data-nodes="mech.rigid_2d mech.indeterminate"><div class="qn">확인 6 · 풀리는가</div><div class="qb">보 양 끝을 둘 다 핀으로 받쳤다. 평형식만으로 반력을 모두 구할 수 있는가?</div><ol class="choices"><li data-ok="1">없다 — 미지수 4개(2 + 2) > 식 3개</li><li>있다 — 미지수 3개</li><li>있다 — 미지수 2개</li><li>하중에 따라 항상 풀린다</li></ol><div class="ans">핀 + 롤러 = 2 + 1 = 3 → 풀림, 핀 + 핀 = 4 → 식 3개로 못 풂. 고정 하나 = 3 → 풀림.</div></div>
<div class="q" data-qid="q7" data-nodes="mech.fbd mech.rigid_2d"><div class="qn">확인 7 · 교재 Sample Problem 4.2 (Pytel 4e)</div><div class="qb">250 kg 삼각판이 A에서 핀, C에서 30° 경사면 위 롤러로 받쳐져 있다. 자유물체도의 미지수 개수는?</div><ol class="choices"><li data-ok="1">3개 — \(A_x,A_y,N_C\)</li><li>2개 — \(A_y,N_C\)</li><li>4개 — \(A_x,A_y,N_C\), 롤러 마찰력</li><li>4개 — \(A_x,A_y,M_A,N_C\)</li></ol><div class="ans">교재 답: 미지수 \(A_x,A_y,N_C\) 3개. 롤러 반력 \(N_C\)는 경사면에 수직(수직선과 30°), 무게 \(W=mg=250\times9.81\approx2453\) N은 이미 아는 힘.</div></div>
<div class="q" data-qid="q8" data-nodes="mech.fbd mech.rigid_2d"><div class="qn">확인 8 · 예제 1 숫자 넣기</div><div class="qb">길이 4 m 보 AB. A = 핀, B = 30° 경사면 위 롤러(반력은 수직선과 30°). 보 가운데에 아래로 2 kN. 롤러 반력 \(B\)의 크기는? (하중은 아톰 설정)</div><ol class="choices"><li data-ok="1">약 1.155 kN</li><li>1.000 kN</li><li>약 0.577 kN</li><li>2.000 kN</li></ol><div class="ans">\(\sum M_A=0\): \((B\cos30^\circ)(4)=2\times2\) → \(B=1/\cos30^\circ\approx1.155\) kN. 1.000은 \(B_y\)만 구한 값, 0.577은 \(B_x\) 크기.</div></div>
<div class="q" data-qid="q9" data-nodes="mech.rigid_2d"><div class="qn">확인 9 · 외팔보</div><div class="qb">벽에 고정된 2 m 막대 끝에 아래로 500 N. 고정단 반력 \(A_x,A_y,M_A\)를 구하라.</div><div class="ans">\(A_x=0\), \(A_y=500\) N(위), \(M_A=500\times2=1000\) N·m(반시계). 검산(끝점 기준) \(1000-500\times2=0\).</div></div>
</body></html>'''

for k, v in {"fig_recap": fig_recap, "fig_eq3": fig_eq3, "fig_free": fig_free, "fig_pr": fig_pr, "fig_sf": fig_sf, "fig_fbd": fig_fbd, "fig_ex2": fig_ex2}.items():
    html = html.replace("{" + k + "}", v)
assert "{fig_" not in html
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
