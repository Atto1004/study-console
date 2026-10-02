# -*- coding: utf-8 -*-
"""정역학 · 2026-09-28 수업 노트 (녹음·영상 없음 — 교수필기_한글_5주차_W5-1 14p + 수업요약_5주차_W5-1 로 구성. 필기 쪽 순서가 뼈대)"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\정역학\_수업노트\2026-09-28.html"

# 1. 우력 — 두 평행 작용선 위의 F 와 −F, 임의의 점 P
fig_couple = canvas(560, 230,
    step(1, line(300, 70, 300, 214, GRAY, 1.2, "5 4"), line(430, 70, 430, 214, GRAY, 1.2, "5 4"),
        arrow(430, 170, 430, 96, GREEN, "", 3), text(442, 112, "F", 15, GREEN, "start", True),
        arrow(300, 96, 300, 170, RED, "", 3), text(292, 72, "−F", 15, RED, "end", True)),
    step(2, dot(70, 200, "", 4, INK), text(62, 222, "P (아무 점)", 12, INK, "start"),
        arrow(74, 198, 426, 172, BLUE, "", 2), text(250, 205, "r₁", 14, BLUE, "middle", True),
        arrow(74, 197, 296, 98, PINK, "", 2), text(162, 132, "r₂", 14, PINK, "middle", True)),
    step(3, arrow(304, 133, 426, 133, YEL, "", 2.6), text(365, 125, "r", 15, YEL, "middle", True)),
    step(4, text(20, 30, "M = r₁×F + r₂×(−F) = (r₁ − r₂)×F = r × F", 13.5, INK, "start", True),
        text(20, 54, "r 은 P 와 무관 → 어느 점에 대해서나 같다", 13, RED, "start", True)),
    cap="우력: 크기가 같고 방향이 반대이며 작용선이 다른 두 힘. \\(\\mathbf r=\\mathbf r_1-\\mathbf r_2\\)는 \\(-\\mathbf F\\) 쪽 점에서 \\(\\mathbf F\\) 쪽 점으로 가는 벡터라 P를 어디에 잡든 그대로다(필기 p.2).", name="couple")

# 2. Example 4.18 — (3,7)에 −2j, (7,2)에 2j
S = 24; OX, OY = 60, 222
def P2(x, y): return (OX + x * S, OY - y * S)
ax_, ay_ = P2(3, 7); bx_, by_ = P2(7, 2)
fig_ex = canvas(560, 260,
    step(1, axis(OX, OY, 280, 14, "x (m)", "y (m)"),
        dot(ax_, ay_, "", 4, INK), text(ax_ - 10, ay_ - 2, "(3, 7, 0)", 12, INK, "end"),
        arrow(ax_, ay_, ax_, ay_ + 58, RED, "", 3), text(ax_ + 12, ay_ + 34, "−2j kN", 13, RED, "start", True),
        dot(bx_, by_, "", 4, INK), text(bx_ + 10, by_ + 14, "(7, 2, 0)", 12, INK, "start"),
        arrow(bx_, by_, bx_, by_ - 58, GREEN, "", 3), text(bx_ + 10, by_ - 40, "2j kN", 13, GREEN, "start", True)),
    step(2, arrow(OX + 2, OY - 2, bx_ - 3, by_ + 2, BLUE, "", 1.8), text(170, 212, "r₁ = 7i + 2j", 12.5, BLUE, "middle"),
        arrow(OX + 1, OY - 3, ax_ - 2, ay_ + 4, PINK, "", 1.8), text(140, 128, "r₂ = 3i + 7j", 12, PINK, "start")),
    step(3, line(ax_, 240, bx_, 240, GRAY, 1.2), line(ax_, 234, ax_, 246, GRAY, 1.2), line(bx_, 234, bx_, 246, GRAY, 1.2),
        text((ax_ + bx_) / 2, 256, "D = 4 m", 12, GRAY, "middle")),
    step(4, loop_dir(450, 92, 26, False, GREEN), text(450, 150, "M = 8k kN·m", 15, INK, "middle", True),
        text(450, 172, "반시계 (+z)", 13, GREEN, "middle"), text(450, 196, "검산 D·F = 4 × 2 = 8", 12.5, GRAY, "middle")),
    cap="Example 4.18 (필기 p.4). 위로 미는 힘이 오른쪽, 아래로 미는 힘이 왼쪽 → 반시계. \\(\\mathbf r\\times\\mathbf F\\)로 계산한 값과 \\(DF\\)가 같다.", name="ex418")

# 3. 등가계 — System 1 ≡ System 2
fig_eq = canvas(560, 230,
    step(1, rect(20, 40, 200, 130, GRAY, "5 4", sw=1.4, rx=10), text(120, 32, "System 1", 13, INK, "middle", True),
        dot(50, 150, "", 4, INK), text(44, 166, "P", 13, INK, "end", True),
        arrow(110, 120, 150, 70, GREEN, "", 2.6), text(160, 70, "F_A", 13, GREEN, "start", True),
        arrow(170, 150, 205, 120, GREEN, "", 2.6), text(186, 160, "F_B", 13, GREEN, "middle", True),
        loop_dir(80, 82, 16, False, RED), text(80, 120, "M_C", 13, RED, "middle", True)),
    step(2, rect(340, 40, 200, 130, GRAY, "5 4", sw=1.4, rx=10), text(440, 32, "System 2", 13, INK, "middle", True),
        dot(370, 150, "", 4, INK), text(364, 166, "P", 13, INK, "end", True),
        arrow(450, 140, 500, 80, BLUE, "", 2.6), text(510, 80, "F_D", 13, BLUE, "start", True),
        loop_dir(400, 82, 16, False, RED), text(400, 120, "M_E", 13, RED, "middle", True),
        loop_dir(470, 150, 12, True, RED), text(505, 160, "M_F", 13, RED, "middle", True)),
    step(3, text(280, 112, "≡ ?", 22, INK, "middle", True),
        text(280, 196, "(ΣF)₁ = (ΣF)₂   그리고   (ΣM_P)₁ = (ΣM_P)₂", 13.5, INK, "middle", True)),
    step(4, text(280, 220, "한 점 P 에서 같으면 → 다른 모든 점 P* 에서도 같다", 13, RED, "middle", True)),
    cap="등가 조건(필기 p.5·p.6). 우력 \\(\\mathbf M_C,\\mathbf M_E,\\mathbf M_F\\)는 어느 점에서나 같으므로 모멘트 식에 그대로 더한다.", name="equiv")

# 4. 힘 옮기기 — P 의 F ≡ Q 의 F + r×F
fig_move = canvas(580, 220,
    step(1, rect(20, 120, 150, 14, INK, fill="#F1F3F5", sw=1.5, rx=3),
        dot(50, 127, "", 4, INK), text(50, 156, "P", 13, INK, "middle", True), dot(140, 127, "", 4, INK), text(140, 156, "Q", 13, INK, "middle", True),
        arrow(50, 120, 50, 50, GREEN, "", 3), text(62, 64, "F", 14, GREEN, "start", True)),
    step(2, text(188, 132, "=", 20, INK, "middle", True),
        rect(205, 120, 150, 14, INK, fill="#F1F3F5", sw=1.5, rx=3),
        dot(235, 127, "", 4, INK), text(235, 156, "P", 13, INK, "middle", True), dot(325, 127, "", 4, INK), text(325, 156, "Q", 13, INK, "middle", True),
        arrow(235, 120, 235, 50, GREEN, "", 3), text(247, 64, "F", 14, GREEN, "start", True),
        arrow(320, 120, 320, 50, GREEN, "", 3), text(308, 64, "F", 14, GREEN, "end", True),
        arrow(332, 134, 332, 200, GRAY, "", 2.4, dash="5 3"), text(344, 186, "−F", 13, GRAY, "start", True)),
    step(3, text(372, 132, "=", 20, INK, "middle", True),
        rect(390, 120, 150, 14, INK, fill="#F1F3F5", sw=1.5, rx=3),
        dot(420, 127, "", 4, INK), text(420, 156, "P", 13, INK, "middle", True), dot(510, 127, "", 4, INK), text(510, 156, "Q", 13, INK, "middle", True),
        arrow(510, 120, 510, 50, GREEN, "", 3), text(522, 64, "F", 14, GREEN, "start", True),
        loop_dir(440, 70, 18, False, RED), text(440, 40, "M", 14, RED, "middle", True)),
    step(4, text(290, 210, "M = r × F_P   (r = Q → P)", 14, RED, "middle", True)),
    cap="힘 옮기기(필기 p.8). Q에 \\(\\mathbf F\\)와 \\(-\\mathbf F\\)를 같이 놓아도(합 0) 아무것도 안 바뀐다 — 그중 P의 \\(\\mathbf F\\)와 Q의 \\(-\\mathbf F\\)가 우력이 되어 \\(\\mathbf M=\\mathbf r\\times\\mathbf F_P\\)로 남는다. 가운데 그림은 아톰 보충.", name="move")

# 5. 옮겨서 생기는 모멘트는 F 에 수직뿐
fig_perp = canvas(560, 230,
    step(1, dot(110, 170, "", 4, INK), text(98, 186, "P", 13, INK, "end", True),
        arrow(110, 170, 110, 70, GREEN, "", 3), text(122, 84, "F", 15, GREEN, "start", True)),
    step(2, dot(260, 170, "", 4, INK), text(272, 186, "Q", 13, INK, "start", True),
        arrow(114, 170, 256, 170, YEL, "", 2.4), text(185, 162, "r (P → Q)", 12.5, YEL, "middle", True),
        circle(185, 110, 11, RED, w=2), dot(185, 110, "", 3, RED), text(204, 106, "r × F", 13, RED, "start", True),
        text(204, 124, "F 에 수직", 12, RED, "start")),
    step(3, line(330, 20, 330, 210, GRAY, 1, "3 4"),
        dot(440, 170, "", 4, INK), arrow(440, 170, 440, 70, GREEN, "", 3), text(452, 84, "F", 15, GREEN, "start", True),
        arrow(410, 170, 410, 98, RED, "", 2.4), text(398, 106, "M_y j", 13, RED, "end", True),
        arrow(440, 172, 376, 204, BLUE, "", 2.4), text(470, 206, "M_x i", 13, BLUE, "start", True)),
    step(4, text(445, 44, "평행 M_y j : 옮겨서 못 만든다", 12.5, RED, "middle", True),
        text(445, 20, "수직 M_x i : 옮겨서 만든다", 12.5, BLUE, "middle", True)),
    cap="필기 p.10·p.11. 왼쪽: 힘을 옮겨 생기는 모멘트 \\(\\mathbf r\\times\\mathbf F\\)는 늘 \\(\\mathbf F\\)에 수직(여기서는 종이 밖으로 ⊙). 오른쪽: 우력을 \\(\\mathbf F\\)에 평행한 성분과 수직한 성분으로 나누면 평행 성분은 끝까지 남는다.", name="perp")

# 6. 렌치 — F + 평행 우력 M_p
fig_wr = canvas(560, 220,
    step(1, dot(80, 180, "", 4, INK), text(68, 196, "P", 13, INK, "end", True),
        arrow(80, 180, 80, 70, GREEN, "", 3), text(92, 82, "F", 15, GREEN, "start", True),
        arrow(130, 180, 130, 110, RED, "", 2.4), text(142, 120, "M_p", 13, RED, "start", True),
        arrow(160, 182, 210, 206, BLUE, "", 2.4), text(222, 200, "M_n", 13, BLUE, "start", True),
        text(120, 40, "M = M_p + M_n", 14, INK, "middle", True)),
    step(2, arrow(250, 130, 320, 130, INK, "", 2), text(285, 118, "옮긴다", 12, GRAY, "middle"),
        text(285, 156, "r_PQ × F = M_n", 13, BLUE, "middle", True)),
    step(3, dot(430, 180, "", 4, INK), text(418, 196, "Q", 13, INK, "end", True),
        arrow(430, 180, 430, 60, GREEN, "", 3), text(442, 72, "F", 15, GREEN, "start", True),
        arrow(480, 180, 480, 110, RED, "", 2.4), text(492, 120, "M_p ∥ F", 13, RED, "start", True)),
    step(4, path("M412 150 C 412 138, 448 138, 448 150", RED, 1.8), path("M412 126 C 412 114, 448 114, 448 126", RED, 1.8),
        text(450, 30, "렌치 = 밀면서 돌리는 나사", 13, INK, "middle", True)),
    cap="필기 p.12~p.14. 수직 성분 \\(\\mathbf M_n\\)은 힘의 작용선을 옮겨 흡수하고, 평행 성분 \\(\\mathbf M_p\\)만 남긴 것이 렌치 — 가장 간단한 등가계.", name="wrench")

html = r'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>정역학 · 9/28 우력 · 등가계 · 힘 옮기기 · 렌치</title></head><body>
<header>
<h1>알짜힘 없이 돌리기 — 우력, 등가계, 그리고 렌치</h1>
<p class="lead">4주차까지는 힘 <b>하나</b>의 모멘트였다. 이 회차는 <b>힘계 전체를 더 간단한 계로 바꾸는 법</b>이다. 먼저 <b>우력(couple)</b> — 알짜힘 0인데 모멘트만 주는 힘 한 쌍. 다음 <b>등가계(equivalent systems)</b> — 어떤 힘계든 <b>한 점의 힘 하나 + 우력 하나</b>로 바꿀 수 있다. 힘을 옮기면 \(\mathbf r\times\mathbf F\)가 붙고 그것은 늘 힘에 수직이라, 끝까지 남는 평행 성분까지 챙긴 것이 <b>렌치(wrench)</b>. 이 회차는 영상이 아직 올라오지 않아 교수님 필기본 14쪽 순서대로 정리했다.</p>
<p class="meta"><span>교수 필기본 W5-1 14p</span><span>영상 미게시 · 녹음 없음</span><span>5주차 · 월 · 중간 범위 Ch.4</span><span>교재 대응 Pytel 4e 2.7·2.8·3.2·3.5</span></p>
</header>

<section class="s" data-id="s1" data-nodes="mech.couple mech.moment">
<h2>1. 우력(couple) — ΣF = 0 인데 ΣM ≠ 0</h2>
<p>필기 첫 줄 질문: 물체에 <b>알짜힘 없이 모멘트만</b> 줄 수 있는가? 답은 빨간 글씨로 <b>Yes</b>. 그 도구가 <b>우력</b>이다 — <b>크기가 같고, 방향이 반대이고, 작용선이 다른</b> 두 힘. 두 힘을 더하면 \(\mathbf F+(-\mathbf F)=0\)이라 물체를 밀어 옮기지는 못하지만, 작용선이 어긋나 있어 돌리는 효과는 남는다.</p>
<p>임의의 점 P에서 \(\mathbf F\) 작용선 위 점까지 \(\mathbf r_1\), \(-\mathbf F\) 작용선 위 점까지 \(\mathbf r_2\)라 하면 두 힘의 모멘트 합은 \(\mathbf r_1\times\mathbf F+\mathbf r_2\times(-\mathbf F)=(\mathbf r_1-\mathbf r_2)\times\mathbf F\). 여기서 \(\mathbf r=\mathbf r_1-\mathbf r_2\)는 \(-\mathbf F\) 쪽 점에서 \(\mathbf F\) 쪽 점으로 가는 벡터다 — P가 사라졌다.</p>
{fig_couple}
<div class="formula">\[\mathbf M=\mathbf r_1\times\mathbf F+\mathbf r_2\times(-\mathbf F)=(\mathbf r_1-\mathbf r_2)\times\mathbf F=\mathbf r\times\mathbf F\]</div>
<div class="why">파란 메모 그대로 <b>\(\mathbf r\)은 점 P의 위치와 관계없다</b>. 그러므로 <b>우력의 모멘트는 어느 점에 대해서나 같다</b>. 4주차의 힘 하나의 모멘트 \(\mathbf r\times\mathbf F\)는 기준점을 바꾸면 값이 바뀌었는데, 우력은 기준점을 묻지 않는다 — 그래서 우력은 "어디에 붙어 있는지"를 따지지 않고 벡터 하나 \(\mathbf M\)으로만 다룬다.</div>
<div class="analogy">자동차 핸들을 두 손으로 돌릴 때 한 손은 위로, 한 손은 아래로 같은 힘을 준다. 핸들은 어느 쪽으로도 밀려가지 않고 돌기만 한다 — 그게 우력이다. 핸들 중심에서 재든 문 손잡이에서 재든 돌리는 세기는 같다.</div>
<div class="memo"><b>외울 것</b> 우력 = 같은 크기 · 반대 방향 · 다른 작용선 · \(\sum\mathbf F=0\), \(\sum\mathbf M\ne0\) · \(\mathbf M=\mathbf r\times\mathbf F\)(\(\mathbf r\): \(-\mathbf F\) 쪽 → \(\mathbf F\) 쪽) · 어느 점에 대해서나 같다</div>
</section>

<section class="s" data-id="s2" data-nodes="mech.couple mech.cross_apps">
<h2>2. 우력 모멘트의 크기 |M| = DF · Example 4.18</h2>
<p>크기는 \(|\mathbf M|=|\mathbf r\times\mathbf F|\). 두 작용선 사이 <b>수직거리</b>를 \(D\)라 하면 \(|\mathbf r\times\mathbf F|=|\mathbf r||\mathbf F|\sin\theta\)에서 \(|\mathbf r|\sin\theta\)가 바로 \(D\)라서 <b>\(|\mathbf M|=DF\)</b>(필기 빨간 "DF"). 방향은 두 힘이 놓인 평면에 수직, 오른손 법칙 — 평면 그림에서는 반시계가 \(+z\)다. \(D\)는 두 작용선 사이 거리이지 점 P까지의 거리가 아니다.</p>
<div class="formula">\[|\mathbf M|=DF\qquad(D:\ \text{두 작용선 사이 수직거리})\]</div>
{fig_ex}
<p><b>Example 4.18.</b> \((3,7,0)\) m에 \(-2\mathbf j\) kN, \((7,2,0)\) m에 \(2\mathbf j\) kN. 크기가 같고 방향이 반대인 두 힘이니 우력이다. 원점 O에서 \(\mathbf r_1=7\mathbf i+2\mathbf j\), \(\mathbf r_2=3\mathbf i+7\mathbf j\).</p>
<div class="formula">\[\mathbf M=(7\mathbf i+2\mathbf j)\times(2\mathbf j)+(3\mathbf i+7\mathbf j)\times(-2\mathbf j)=14\mathbf k-6\mathbf k=8\mathbf k\ \text{kN·m}\]</div>
<div class="why">필기의 파란 물결: \(\mathbf j\times\mathbf j=0\)이라 <b>\(\mathbf i\times\mathbf j\) 짝만 남는다</b>. \(7\mathbf i\times2\mathbf j=14\mathbf k\), \(3\mathbf i\times(-2\mathbf j)=-6\mathbf k\). 검산: 두 작용선 \(x=7\)과 \(x=3\) 사이 \(D=4\) m, \(F=2\) kN → \(DF=8\) kN·m, 오른쪽이 위로·왼쪽이 아래로 미니 반시계(\(+z\)). 두 방법이 같다.</div>
<details class="ex"><summary>연습 — A(0, 3, 0) m에 \(4\mathbf i\) kN, B(2, 0, 0) m에 \(-4\mathbf i\) kN</summary><div class="body"><p>\(DF\): 작용선 \(y=3\)과 \(y=0\) → \(D=3\) m → \(|\mathbf M|=12\) kN·m, 위는 오른쪽·아래는 왼쪽으로 밀어 시계 방향. \(\mathbf r\times\mathbf F\): \(\mathbf r=\mathbf r_A-\mathbf r_B=-2\mathbf i+3\mathbf j\) → \((-2\mathbf i+3\mathbf j)\times4\mathbf i=12(\mathbf j\times\mathbf i)=-12\mathbf k\) kN·m. 점 P(5, 5, 0) 기준으로 다시 해도 \((-5\mathbf i-2\mathbf j)\times4\mathbf i+(-3\mathbf i-5\mathbf j)\times(-4\mathbf i)=8\mathbf k-20\mathbf k=-12\mathbf k\) — 어느 점이나 같다.</p></div></details>
<div class="analogy">렌치(공구)로 볼트를 돌릴 때 손잡이가 길수록 쉽다 — 우력도 같다. 같은 힘이라도 두 손을 멀리 벌릴수록(\(D\)가 클수록) 더 세게 돌린다.</div>
<div class="memo"><b>외울 것</b> \(|\mathbf M|=DF\)(\(D\) = 작용선 사이 수직거리) · 방향 = 평면에 수직, 반시계 \(+z\) · Example 4.18 → \(8\mathbf k\) kN·m · \(\mathbf r\times\mathbf F\)와 \(DF\) 두 방법으로 검산</div>
</section>

<section class="s" data-id="s3" data-nodes="mech.couple">
<h2>3. 등가계(equivalent systems) — 합력 같고, 한 점의 합모멘트 같으면</h2>
<p>두 힘계가 물체에 <b>같은 효과</b>를 주려면 미는 효과와 돌리는 효과가 둘 다 같아야 한다. 필기 p.5의 두 조건:</p>
<div class="formula">\[(\textstyle\sum\mathbf F)_1=(\sum\mathbf F)_2,\qquad(\sum\mathbf M_P)_1=(\sum\mathbf M_P)_2\]</div>
{fig_eq}
<p>그림의 System 1(\(\mathbf F_A,\mathbf F_B\) + 우력 \(\mathbf M_C\))과 System 2(\(\mathbf F_D\) + 우력 \(\mathbf M_E,\mathbf M_F\))에 적용하면 \(\mathbf F_A+\mathbf F_B=\mathbf F_D\), \(\mathbf r_A\times\mathbf F_A+\mathbf r_B\times\mathbf F_B+\mathbf M_C=\mathbf r_D\times\mathbf F_D+\mathbf M_E+\mathbf M_F\). 우력은 어느 점에서나 같으니 모멘트 식에 그대로 더한다.</p>
<div class="why">필기 p.6: <b>합력이 같고 점 P에 대한 합모멘트가 같으면 다른 어떤 점 P*에 대해서도 합모멘트가 같다</b>. 이유는 기준점 바꾸기 식 \(\sum\mathbf M_{P^*}=\sum\mathbf M_P+\mathbf r_{P^*P}\times\sum\mathbf F\) — 오른쪽 두 항이 두 계에서 모두 같으니 왼쪽도 같다. 그래서 등가 판정은 <b>점 하나만</b> 골라 확인하면 끝이다(9/30 평형 조건에서 다시 쓴다).</div>
<div class="analogy">두 사람이 같은 상자를 각자 다른 손 위치로 밀어도, 미는 총량과 한 모서리 기준으로 돌리는 총량이 같으면 상자의 움직임은 똑같다. 어느 모서리를 기준으로 재도 결론이 같으니 한 번만 재면 된다.</div>
<div class="memo"><b>외울 것</b> 등가 = \((\sum\mathbf F)_1=(\sum\mathbf F)_2\) 그리고 \((\sum\mathbf M_P)_1=(\sum\mathbf M_P)_2\) · 한 점에서 같으면 모든 점에서 같다 · 우력은 모멘트 식에 그대로 더한다</div>
</section>

<section class="s" data-id="s4" data-nodes="mech.couple mech.moment">
<h2>4. 힘 하나 + 우력 하나 · 힘을 다른 점으로 옮기기</h2>
<p>필기 p.7: 임의의 힘·모멘트 계는 <b>언제나</b> 더 간단한 계 — <b>점 P에 작용하는 힘 하나 + 우력 하나</b> — 로 나타낼 수 있다. 힘은 \(\mathbf F=\sum\mathbf F\), 우력은 \(\mathbf M=\sum\mathbf M_P\). 두 조건(합력·P에 대한 합모멘트)을 그대로 맞춘 것이니 3절의 등가 조건을 만족한다.</p>
<div class="formula">\[\text{일반 힘계}\ \equiv\ \mathbf F=\sum\mathbf F\ (\text{P에 작용})\ +\ \mathbf M=\sum\mathbf M_P\ (\text{우력})\]</div>
<p>필기 p.8: P에 작용하는 힘 \(\mathbf F_P\)를 점 Q로 옮기면 <b>그 힘이 만드는 모멘트가 달라진다</b>. 그래서 Q에 같은 힘을 놓고 우력 \(\mathbf M=\mathbf r\times\mathbf F_P\)를 더해야 등가가 된다. 여기서 \(\mathbf r\)은 <b>Q에서 P로</b> 가는 위치벡터다.</p>
{fig_move}
<div class="formula">\[\text{P의 }\mathbf F_P\ \equiv\ \text{Q의 }\mathbf F_P+\mathbf r\times\mathbf F_P\qquad(\mathbf r:\ \text{Q}\to\text{P})\]</div>
<div class="why">왜 \(\mathbf r\times\mathbf F_P\)인가: Q에서 본 원래 힘의 모멘트가 \(\mathbf r_{Q\to P}\times\mathbf F_P\)다. 옮긴 힘은 Q를 지나니 Q에 대한 모멘트가 0 — 잃어버린 모멘트를 우력으로 채워 넣는 것이다. 우력은 어느 점에서나 같으니 다른 점에서 확인해도 등가가 유지된다.</div>
<details class="ex"><summary>연습 — P(2, 0, 0) m의 \(10\mathbf j\) N을 원점 O로 옮기기</summary><div class="body"><p>\(\mathbf r=\text{O}\to\text{P}=2\mathbf i\) → 붙는 우력 \(2\mathbf i\times10\mathbf j=20\mathbf k\) N·m. 결과: O에 \(10\mathbf j\) N + 우력 \(20\mathbf k\) N·m. 검산(다른 점 A(0, 5, 0)): 원래 \((2\mathbf i-5\mathbf j)\times10\mathbf j=20\mathbf k\), 새 계 \((-5\mathbf j)\times10\mathbf j+20\mathbf k=20\mathbf k\) — 같다.</p></div></details>
<div class="analogy">문을 손잡이에서 미는 것과 경첩 바로 옆에서 같은 힘으로 미는 것은 다르다. 경첩 옆으로 손을 옮겼다면 "손잡이에서 밀 때만큼 돌리는 효과"를 따로 더해 줘야 같은 결과가 된다 — 그 더하는 몫이 \(\mathbf r\times\mathbf F\)다.</div>
<div class="memo"><b>외울 것</b> 일반 힘계 ≡ P의 \(\mathbf F=\sum\mathbf F\) + 우력 \(\mathbf M=\sum\mathbf M_P\) · P의 힘 ≡ Q의 같은 힘 + \(\mathbf r\times\mathbf F_P\)(\(\mathbf r\): Q → P) · 옮기면 우력이 붙는다</div>
</section>

<section class="s" data-id="s5" data-nodes="mech.couple mech.projection">
<h2>5. 렌치(wrench) 정의 · 옮겨서 만들 수 있는 모멘트는 F에 수직뿐</h2>
<p>필기 p.9: 일반 힘계 ≡ P의 힘 \(\mathbf F\) + 우력 \(\mathbf M_P\). 한 단계 더 줄일 수 있는가? ⇒ <b>렌치(wrench)</b>. 빨간 정의: <b>힘 하나 \(\mathbf F\)와, 그 힘에 평행한 우력 모멘트 하나 \(\mathbf M_p\)</b>로 이루어진 가장 간단한 등가계.</p>
<p>왜 "평행"인가 — 필기 p.10. 힘을 P에서 Q로 옮겨서 생기는 모멘트는 \(\mathbf r\times\mathbf F\)(물결 밑줄)이고, <b>외적 \(\mathbf r\times\mathbf F\)는 언제나 \(\mathbf F\)에 수직</b>이다. 그래서 작용점을 옮겨서는 <b>힘에 수직인 모멘트 성분만</b> 만들 수 있다.</p>
{fig_perp}
<div class="why">필기 p.11: 원래 우력 \(\mathbf M\)에 힘에 수직인 성분과 평행한 성분이 둘 다 있으면(그림: \(\mathbf F\)는 \(y\) 방향, \(\mathbf M=M_x\mathbf i+M_y\mathbf j\)) — <b>수직 성분은 힘을 옮겨서 만들 수 있지만, 평행 성분은 힘을 옮기는 것만으로는 절대 만들 수 없다</b>. 그러므로 <b>힘 하나로는 충분하지 않다</b>. 평행 성분 몫의 우력이 하나 꼭 남는다 — 그게 렌치의 \(\mathbf M_p\)다.</div>
<div class="analogy">외적은 "두 벡터 모두에 수직"이라는 성질을 가진 계산이다. 힘을 아무리 옆으로 옮겨도 그 힘 방향 축 둘레로 비트는 몫은 생기지 않는다 — 망치를 어디로 옮겨 쳐도 못이 저절로 돌지 않는 것과 같다.</div>
<div class="memo"><b>외울 것</b> 렌치 = 힘 \(\mathbf F\) + \(\mathbf F\)에 평행한 우력 \(\mathbf M_p\)(가장 간단한 등가계) · 옮겨서 생기는 모멘트 \(\mathbf r\times\mathbf F\)는 늘 \(\mathbf F\)에 수직 · 평행 성분은 옮겨서 못 만든다</div>
</section>

<section class="s" data-id="s6" data-nodes="mech.couple mech.projection">
<h2>6. 모멘트를 두 성분으로 — M = M_p + M_n, r_PQ × F = M_n</h2>
<p>필기 p.12~p.13: 힘 \(\mathbf F\)를 기준으로 우력을 나눈다. <b>\(\mathbf M_p\)</b> = \(\mathbf F\)에 <b>평행</b>한 성분, <b>\(\mathbf M_n\)</b> = \(\mathbf F\)에 <b>수직</b>인 성분. 평행 성분은 없앨 수 없고, 수직 성분은 힘의 작용점을 옮겨서 만들 수 있다.</p>
<div class="formula">\[\mathbf M=\mathbf M_p+\mathbf M_n,\qquad \mathbf r_{PQ}\times\mathbf F=\mathbf M_n\]</div>
{fig_wr}
<p>〈원래 계〉 P에 \(\mathbf F\), 우력 \(\mathbf M=\mathbf M_p+\mathbf M_n\) ⇒ 〈새 계〉 같은 힘 \(\mathbf F\)가 Q에, 우력은 \(\mathbf M_p\)만. P에서 Q로 힘을 옮겨 생기는 모멘트가 \(\mathbf M_n\)을 대신하도록 Q를 고른다: \(\mathbf r_{PQ}\times\mathbf F=\mathbf M_n\). 필기 p.14 그림 정리: 반대 힘 두 개 ⇒ 우력 하나 / 여러 힘·우력 ⇒ 한 점의 \(\mathbf F\)와 \(\mathbf M\) ⇒ \(\mathbf F\)와 평행한 \(\mathbf M_p\)(렌치).</p>
<div class="why">계산 순서(아톰 보충): \(\mathbf e=\mathbf F/|\mathbf F|\) → \(\mathbf M_p=(\mathbf e\cdot\mathbf M)\mathbf e\)(2장 평행 성분, 4주차 \(\mathbf M_L\)과 같은 모양) → \(\mathbf M_n=\mathbf M-\mathbf M_p\) → \(\mathbf r_{PQ}\)를 \(\mathbf F\)에 수직으로 잡으면 \(\mathbf r_{PQ}=(\mathbf F\times\mathbf M_n)/|\mathbf F|^2\)(필기에 없는 식 — 아래 연습에서 검산). 7절 \(\mathbf r\)은 Q→P, 여기 \(\mathbf r_{PQ}\)는 P→Q라 방향이 반대일 뿐 같은 내용이다 — 문제에서 \(\mathbf r\)의 출발·도착점을 꼭 적는다.</div>
<details class="ex"><summary>연습 — 원점 P에 \(\mathbf F=10\mathbf j\) N, 우력 \(\mathbf M=6\mathbf i+8\mathbf j\) N·m를 렌치로</summary><div class="body"><p>\(\mathbf e=\mathbf j\) → \(\mathbf M_p=(\mathbf e\cdot\mathbf M)\mathbf e=8\mathbf j\), \(\mathbf M_n=6\mathbf i\). \(\mathbf r_{PQ}=(10\mathbf j\times6\mathbf i)/100=-0.6\mathbf k\) m. 렌치: \(\mathbf F=10\mathbf j\) N이 \((0,0,-0.6)\) m를 지나는 \(y\) 방향 선 위에 + 평행 우력 \(\mathbf M_p=8\mathbf j\) N·m. 검산(P 기준): \((-0.6\mathbf k)\times10\mathbf j+8\mathbf j=6\mathbf i+8\mathbf j=\mathbf M\).</p></div></details>
<div class="analogy">드라이버로 나사를 박을 때 손은 나사 축 방향으로 <b>밀면서</b>(힘 \(\mathbf F\)) 같은 축 둘레로 <b>돌린다</b>(평행 우력 \(\mathbf M_p\)). 렌치는 이 "밀면서 돌리기" 하나로 어떤 힘계든 대신할 수 있다는 말이다.</div>
<div class="memo"><b>외울 것</b> \(\mathbf M=\mathbf M_p\ (\parallel\mathbf F)+\mathbf M_n\ (\perp\mathbf F)\) · \(\mathbf M_p=(\mathbf e\cdot\mathbf M)\mathbf e\) · \(\mathbf r_{PQ}\times\mathbf F=\mathbf M_n\) 이 되게 Q를 고른다 · 남는 것 = \(\mathbf F\) + \(\mathbf M_p\)(렌치)</div>
</section>

<div class="q" data-qid="q1" data-nodes="mech.couple"><div class="qn">확인 1 · 우력의 성질</div><div class="qb">우력(couple)에 대해 옳은 것은?</div><ol class="choices"><li data-ok="1">\(\sum\mathbf F=0\)이지만 \(\sum\mathbf M\ne0\) — 알짜힘 없이 모멘트만 준다</li><li>\(\sum\mathbf F\ne0\)이고 \(\sum\mathbf M=0\)이다</li><li>두 힘의 작용선이 같아야 한다</li><li>우력의 모멘트는 기준점에 따라 달라진다</li></ol><div class="ans">크기 같고 방향 반대, 작용선이 다른 두 힘. \(\mathbf M=\mathbf r\times\mathbf F\)이고 \(\mathbf r\)이 기준점과 무관해 어느 점에서나 같다.</div></div>
<div class="q" data-qid="q2" data-nodes="mech.couple mech.cross_apps"><div class="qn">확인 2 · Example 4.18</div><div class="qb">\((3,7,0)\) m에 \(-2\mathbf j\) kN, \((7,2,0)\) m에 \(2\mathbf j\) kN이 작용한다. 우력 모멘트 \(\mathbf M\)은?</div><ol class="choices"><li data-ok="1">\(8\mathbf k\) kN·m</li><li>\(-8\mathbf k\) kN·m</li><li>\(20\mathbf k\) kN·m</li><li>\(4\mathbf k\) kN·m</li></ol><div class="ans">\((7\mathbf i+2\mathbf j)\times2\mathbf j+(3\mathbf i+7\mathbf j)\times(-2\mathbf j)=14\mathbf k-6\mathbf k=8\mathbf k\). 검산 \(DF=4\times2=8\), 반시계(\(+z\)). 20은 두 항을 더해 버린 실수.</div></div>
<div class="q" data-qid="q3" data-nodes="mech.couple"><div class="qn">확인 3 · 기준점 바꾸기</div><div class="qb">A(0, 3, 0) m에 \(4\mathbf i\) kN, B(2, 0, 0) m에 \(-4\mathbf i\) kN. 점 P(5, 5, 0)에 대한 두 힘의 모멘트 합은?</div><ol class="choices"><li data-ok="1">\(-12\mathbf k\) kN·m — 원점이나 B 기준과 같다</li><li>\(12\mathbf k\) kN·m</li><li>0 — 두 힘의 합이 0이므로</li><li>P까지 거리에 따라 달라 \(-20\mathbf k\) kN·m</li></ol><div class="ans">\((-5\mathbf i-2\mathbf j)\times4\mathbf i+(-3\mathbf i-5\mathbf j)\times(-4\mathbf i)=8\mathbf k-20\mathbf k=-12\mathbf k\). \(DF=3\times4=12\), 시계 방향.</div></div>
<div class="q" data-qid="q4" data-nodes="mech.couple mech.moment"><div class="qn">확인 4 · 교재 Sample Problem 2.10 (Pytel 4e)</div><div class="qb">기계 부품의 점 A에 작용하는 150 kN 힘을 점 B로 옮겨 힘-우력 계로 바꾼다. B에서 그 힘의 작용선까지 수직거리는 \(80+40=120\) mm다. 옮길 때 붙여야 하는 우력의 크기는?</div><ol class="choices"><li data-ok="1">18 kN·m</li><li>12 kN·m</li><li>6 kN·m</li><li>0 — 같은 힘이므로 우력이 필요 없다</li></ol><div class="ans">\(150\times0.120=18\) kN·m(교재 답: 시계 방향 \(-18\) kN·m). 교재 2번째 물음처럼 이 우력을 40 mm 떨어진 수평 힘 한 쌍으로 바꾸면 \(18/0.040=450\) kN.</div></div>
<div class="q" data-qid="q5" data-nodes="mech.couple mech.moment"><div class="qn">확인 5 · 힘 옮기기</div><div class="qb">P(2, 0, 0) m에 작용하는 \(10\mathbf j\) N을 원점 O로 옮긴다. O에 같은 힘과 함께 붙는 우력은?</div><ol class="choices"><li data-ok="1">\(20\mathbf k\) N·m</li><li>\(-20\mathbf k\) N·m</li><li>\(20\mathbf i\) N·m</li><li>붙지 않는다</li></ol><div class="ans">\(\mathbf r=\text{O}\to\text{P}=2\mathbf i\), \(2\mathbf i\times10\mathbf j=20\mathbf k\). 다른 점 A(0, 5, 0)에서 검산해도 두 계 모두 \(20\mathbf k\).</div></div>
<div class="q" data-qid="q6" data-nodes="mech.couple mech.projection"><div class="qn">확인 6 · 렌치가 필요한 이유</div><div class="qb">힘의 작용점을 옮겨서 만들 수 있는 모멘트 성분은?</div><ol class="choices"><li data-ok="1">힘에 수직인 성분뿐 — \(\mathbf r\times\mathbf F\)는 늘 \(\mathbf F\)에 수직</li><li>힘에 평행한 성분뿐</li><li>수직·평행 성분 모두</li><li>어떤 성분도 만들 수 없다</li></ol><div class="ans">그래서 평행 성분 \(\mathbf M_p\)는 끝까지 남고, 가장 간단한 등가계 = 렌치(\(\mathbf F\) + 평행 우력 \(\mathbf M_p\)).</div></div>
<div class="q" data-qid="q7" data-nodes="mech.couple mech.projection"><div class="qn">확인 7 · 렌치로 줄이기</div><div class="qb">원점 P에 \(\mathbf F=10\mathbf j\) N, 우력 \(\mathbf M=6\mathbf i+8\mathbf j\) N·m. 렌치의 평행 우력 \(\mathbf M_p\)와, \(\mathbf F\)에 수직으로 잡은 \(\mathbf r_{PQ}\)를 구하라.</div><div class="ans">\(\mathbf M_p=8\mathbf j\) N·m, \(\mathbf M_n=6\mathbf i\). \(\mathbf r_{PQ}=(\mathbf F\times\mathbf M_n)/|\mathbf F|^2=-0.6\mathbf k\) m. 검산 \((-0.6\mathbf k)\times10\mathbf j+8\mathbf j=6\mathbf i+8\mathbf j\).</div></div>
</body></html>'''

for k, v in {"fig_couple": fig_couple, "fig_ex": fig_ex, "fig_eq": fig_eq, "fig_move": fig_move, "fig_perp": fig_perp, "fig_wr": fig_wr}.items():
    html = html.replace("{" + k + "}", v)
assert "{fig_" not in html
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
