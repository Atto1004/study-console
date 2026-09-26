# -*- coding: utf-8 -*-
"""일반물리학2 · 2026-09-09 수업 노트 (결석 회차 — 강의노트 p.6~7 + 9/11 복습 대목으로 재구성. 근거: 2026-09-09/정리.md)"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\일반물리학2\_수업노트\2026-09-09.html"

fig_point = canvas(560, 200,
    charge(120, 110, "+", "q", 20, RED),
    dot(420, 60, "P", 5, INK),
    arrow(140, 106, 405, 63, INK, "", 1.8, dash="6 4"), text(270, 70, "r (q에서 P까지 위치벡터)", 13, INK, "middle"),
    arrow(420, 60, 500, 47, GREEN, "E", 2.4, 6, -10),
    text(120, 160, "장을 만드는 전하", 12, GRAY, "middle"), text(430, 95, "+1 C을 놓아 본 자리", 12, GRAY, "start"),
    cap="점전하의 전기장: 크기는 \\(q/r^2\\)에 비례, 방향은 \\(q\\)에서 P를 향하는 단위벡터 \\(\\hat r=\\vec r/r\\). 그래서 \\(\\frac{q}{r^2}\\hat r=\\frac{q}{r^3}\\vec r\\).")

fig_group = canvas(560, 250,
    axis(80, 200, 520, 200, "x", "") + arrow(80, 200, 80, 30, INK, "", 1.5) + text(70, 40, "y", 13, INK, "end"),
    charge(80, 200, "+", "q₁ = 20 C (0,0)", 18, RED),
    charge(400, 200, "−", "q₂ = −3 C (4,0)", 18, BLUE),
    charge(80, 60, "−", "q₃ = −4 C (0,3)", 18, BLUE),
    brace_label(98, 382, 232, "4 m"), text(52, 130, "3 m", 12, GRAY, "middle"),
    arrow(100, 200, 200, 200, GREEN, "F₂ (q₂ 쪽으로, 인력)", 2.4, 20, -12),
    arrow(80, 180, 80, 100, GREEN, "", 2.4), text(135, 140, "F₃ (q₃ 쪽으로, 인력)", 13, GREEN, "middle"),
    arrow(100, 180, 190, 107, YEL, "합력", 2.6, 24, -6, dash="5 4"),
    cap="필수문제 1: \\(q_1\\)이 받는 힘은 각 전하가 주는 힘을 <b>벡터로</b> 더한 것. 인력이면 상대 전하 쪽을 향한다.")

fig_dipole = canvas(560, 230,
    line(280, 30, 280, 210, GRAY, 1.2, "5 4"),
    charge(280, 150, "+", "+q", 16, RED), charge(280, 195, "−", "−q", 16, BLUE),
    brace_label(300, 300, 172, "") , text(318, 176, "d", 13, GRAY),
    dot(280, 50, "", 5, INK), text(266, 54, "P", 13, INK, "end"), text(280, 100, "축 위, 중심에서 z", 12, GRAY, "middle"),
    arrow(290, 50, 356, 50, GREEN, "E₊ (밖으로, 더 세다)", 2.4, 10, 20),
    arrow(270, 50, 234, 50, GREEN, "E₋ (안으로)", 2.0, -14, -10),
    text(280, 225, "가까운 +q가 조금 더 세다 → 차이만 남는다", 13, INK, "middle"),
    cap="전기 쌍극자: 축 위 점에서 \\(+q\\)와 \\(-q\\)의 장이 거의 상쇄되고 <b>거리 차이</b> 때문에 남는 값이 \\(1/z^3\\)으로 준다.")

fig_rod = canvas(560, 190,
    axis(40, 120, 530, 120, "x", ""),
    dot(70, 120, "", 6, INK), text(70, 150, "P (원점)", 13, INK, "middle"),
    rect(200, 108, 260, 24, RED, fill="rgba(224,49,49,.12)", sw=2), text(330, 100, "+ + + + + + + + + +", 13, RED, "middle"),
    rect(300, 108, 14, 24, INK, fill="rgba(31,42,68,.35)", sw=1), text(307, 160, "dq = λ dx", 13, INK, "middle"),
    brace_label(72, 198, 175, "a"), brace_label(200, 460, 175, "L (전하 q)"),
    arrow(307, 96, 307, 60, GRAY, "", 1.2, dash="3 3"), text(307, 52, "x", 13, GRAY, "middle"),
    arrow(66, 120, 20, 120, GREEN, "dE", 2.2, 0, -10),
    cap="직선 도선: 위치 \\(x\\)의 조각 \\(dq=\\lambda dx\\)가 P에 만드는 장은 점전하 식 \\(\\frac{1}{4\\pi\\varepsilon_0}\\frac{dq}{x^2}\\). 이것을 \\(x=a\\)부터 \\(a+L\\)까지 더한다.")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>일반물리학2 · 9/9 전기장 계산 ①~④</title></head><body>
<header>
<h1>22장 전기장 계산 ①~④ — 점전하 · 점전하군 · 쌍극자 · 직선 도선</h1>
<p class="lead">이 회차는 결석이라 강의노트 p.6~7과 9/11 수업의 복습 대목으로 재구성했다. 내용은 단순하다: <b>점전하 공식 하나</b>를 알고, 전하가 여러 개면 <b>벡터로 더하고</b>, 연속이면 <b>조각으로 잘라 적분</b>한다.</p>
<p class="meta"><span>결석 회차(인정)</span><span>강의노트 p.6~7</span><span>다음 9/11에 복습됨</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 전기장 구하기의 틀 — "시험전하를 가져왔을 때"</h2>
<p>강의노트의 문제 형식은 늘 같다: "다음 전하 분포에 <b>시험전하를 가져왔을 경우</b> 각각의 전기장을 구하라." 전기장은 단위 양전하가 받는 힘이므로 쿨롱 법칙을 시험전하 \\(q'\\)로 나누면 된다.</p>
<div class="formula">\\[\\vec F=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{qq'}}{{r^2}}\\hat r\\ \\Rightarrow\\ \\vec E=\\lim_{{q'\\to0}}\\frac{{\\vec F}}{{q'}}=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{q}}{{r^2}}\\hat r=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{q}}{{r^3}}\\vec r\\]</div>
{fig_point}
<div class="why">\\(\\hat r\\)은 길이 1인 방향 벡터라 \\(\\hat r=\\vec r/r\\). 분모에 \\(r\\)이 하나 더 붙어 \\(r^3\\)이 되지만 <b>같은 식</b>이다. 교수님은 벡터 \\(\\vec r\\)로 쓴 꼴을 요구한다 — 방향이 식 안에 들어 있어서 부호 실수가 줄기 때문.</div>
<div class="say">"E⃗ = (1/4πε₀)(q/r³) r⃗ — 시험 문제 내면 반드시 써야 된다." (9/11 복습 때)</div>
<div class="pitfall">\\(q\\)의 부호를 식에 그대로 넣는다. \\(q&lt;0\\)이면 \\(\\vec E\\)가 \\(\\vec r\\)과 반대 → 전하 쪽으로 향한다. 크기만 구하고 방향을 따로 붙이는 습관보다 벡터식 하나로 끝내는 게 안전하다.</div>
</section>

<section class="s" data-id="s2">
<h2>2. 점전하군 — 겹치면 벡터로 더한다 (중첩 원리)</h2>
<p>전하가 여러 개면 각각이 만드는 장을 <b>따로 구해서 벡터로 더한다</b>. 크기를 더하면 틀린다.</p>
<div class="formula">\\[\\vec E=\\sum_i\\vec E_i=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\sum_i\\frac{{q_i}}{{r_i^2}}\\hat r_i\\]</div>
{fig_group}
<div class="analogy">여러 사람이 한 사람을 서로 다른 방향으로 밀면, "힘의 크기 합"이 아니라 <b>밀리는 방향까지 합쳐서</b> 어디로 움직이는지가 정해진다. 전기장도 그 "밀리는 방향의 합"이다.</div>
<details class="ex"><summary>강의노트 필수문제 1 — \\(q_1=20\\) C(원점), \\(q_2=-3\\) C(4,0), \\(q_3=-4\\) C(0,3) [m]. \\(q_1\\)이 받는 알짜 힘은?</summary><div class="body">
<p>① \\(q_2\\)가 주는 힘: 부호가 달라 인력 → \\(q_2\\) 쪽(+x). 크기 \\(k\\dfrac{{20\\times3}}{{4^2}}=\\dfrac{{15}}{{4}}k\\).</p>
<p>② \\(q_3\\)가 주는 힘: 인력 → \\(q_3\\) 쪽(+y). 크기 \\(k\\dfrac{{20\\times4}}{{3^2}}=\\dfrac{{80}}{{9}}k\\).</p>
<p>③ 벡터 합: \\(\\vec F=k\\left(\\dfrac{{15}}{{4}}\\hat i+\\dfrac{{80}}{{9}}\\hat j\\right)\\) N. 크기는 \\(k\\sqrt{{(15/4)^2+(80/9)^2}}\\approx9.6k\\), 방향은 x축에서 \\(\\tan^{{-1}}\\dfrac{{80/9}}{{15/4}}\\approx67^\\circ\\).</p>
<p>강의노트 답과 같다. 시험은 이 문제의 숫자를 바꾼 꼴 — "각 힘의 방향 → 성분 → 합"의 수순을 손에 익힐 것.</p></div></details>
</section>

<section class="s" data-id="s3">
<h2>3. 전기 쌍극자 — 멀리서는 1/z³으로 사라진다</h2>
<p>\\(+q\\)와 \\(-q\\)가 거리 \\(d\\)만큼 떨어진 것이 <b>전기 쌍극자</b>. 쌍극자 모멘트 \\(\\vec p=q\\vec d\\)(\\(-q\\)에서 \\(+q\\) 방향)로 한 덩어리처럼 다룬다.</p>
{fig_dipole}
<p>축 위 점 P(중심에서 \\(z\\))의 장은 두 점전하의 장을 더한 것:</p>
<div class="formula">\\[E=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\left[\\frac{{q}}{{(z-d/2)^2}}-\\frac{{q}}{{(z+d/2)^2}}\\right]\\ \\xrightarrow{{\\ z\\gg d\\ }}\\ \\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{2qd}}{{z^3}}=\\frac{{1}}{{2\\pi\\varepsilon_0}}\\frac{{p}}{{z^3}}\\]</div>
<div class="why">두 항이 거의 같아서 빼면 작은 값만 남고, 그 작은 값이 \\(d\\)에 비례한다. 점전하는 \\(1/z^2\\)인데 쌍극자는 \\(1/z^3\\) — 멀리서 보면 +와 −가 상쇄되어 <b>더 빨리 사라진다</b>.</div>
<div class="analogy">멀리서 보면 서로 반대인 두 목소리가 거의 지워져 작게 들린다. 가까이 가야 "누가 더 가까운지" 차이가 드러난다.</div>
<p>쌍극자가 균일한 전기장 안에서 받는 토크와 에너지는 뒤에 나온다(강의노트 p.8).</p>
</section>

<section class="s" data-id="s4">
<h2>4. 직선 도선 — 연속 분포의 첫 예: 조각 → 적분</h2>
<p>길이 \\(L\\), 총 전하 \\(q\\)가 균일한 직선 도선. 선전하밀도 \\(\\lambda=q/L\\), 미소 조각의 전하 \\(dq=\\lambda\\,dx\\).</p>
{fig_rod}
<p>P는 도선의 연장선에서 가까운 끝으로부터 \\(a\\) 떨어진 점. 위치 \\(x\\)의 조각이 P에 만드는 장(도선 방향 성분만):</p>
<div class="formula">\\[dE_x=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{\\lambda\\,dx}}{{x^2}},\\qquad E=\\int_a^{{a+L}}\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{\\lambda}}{{x^2}}dx=\\frac{{\\lambda}}{{4\\pi\\varepsilon_0}}\\left[-\\frac1x\\right]_a^{{a+L}}=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{q}}{{a(a+L)}}\\]</div>
<div class="why">적분 구간이 <b>\\(a\\)부터 \\(a+L\\)</b>인 이유: P에서 도선의 가까운 끝까지가 \\(a\\), 먼 끝까지가 \\(a+L\\). 마지막에 \\(\\lambda L=q\\)로 되돌린다.</div>
<div class="memo"><b>검산</b>: \\(a\\gg L\\)이면 \\(a+L\\approx a\\) → \\(E\\to\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{q}}{{a^2}}\\) — 멀리서 보면 점전하. 유도 결과가 맞는지 확인하는 표준 방법이고, 시험 서술에 한 줄 넣을 만하다.</div>
<div class="analogy">긴 막대를 멀리서 보면 점 하나로 보인다. 식도 똑같이 점전하 식으로 돌아가야 정상이다.</div>
<p>이 수순 — \\(dq\\to dE\\to\\) 대칭으로 살아남는 성분만 \\(\\int\\) — 이 다음 시간 원형 도선·원판에도 그대로 쓰인다.</p>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 점전하 벡터식</div><div class="qb">점전하 \\(q\\)에서 위치벡터 \\(\\vec r\\)만큼 떨어진 점의 전기장으로 옳은 것은?</div><ol class="choices"><li data-ok="1">\\(\\vec E=\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{q}}{{r^3}}\\vec r\\)</li><li>\\(\\vec E=\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{q}}{{r^2}}\\vec r\\)</li><li>\\(\\vec E=\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\dfrac{{q}}{{r}}\\hat r\\)</li><li>\\(\\vec E=\\dfrac{{q}}{{\\varepsilon_0 r^2}}\\hat r\\)</li></ol><div class="ans">\\(\\hat r=\\vec r/r\\)이므로 \\(\\frac{{q}}{{r^2}}\\hat r=\\frac{{q}}{{r^3}}\\vec r\\). \\(\\frac{{q}}{{r^2}}\\vec r\\)은 차원이 틀리다.</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 중첩</div><div class="qb">전하 세 개가 만드는 전기장을 구할 때 옳은 방법은?</div><ol class="choices"><li data-ok="1">각 전하의 장을 성분으로 나눠 <b>벡터로</b> 더한다</li><li>각 전하의 장의 크기를 더한다</li><li>가장 가까운 전하의 장만 쓴다</li><li>세 전하를 합친 알짜 전하 하나로 바꿔 계산한다</li></ol><div class="ans">중첩 원리 = 벡터 합. 알짜 전하 하나로 바꾸는 것은 멀리서 볼 때만 근사로 가능.</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 필수문제 1</div><div class="qb">\\(q_1=20\\) C(원점), \\(q_2=-3\\) C(4,0), \\(q_3=-4\\) C(0,3) [m]. \\(q_1\\)이 받는 알짜 힘은? (\\(k=1/4\\pi\\varepsilon_0\\))</div><ol class="choices"><li data-ok="1">\\(k\\left(\\tfrac{{15}}{{4}}\\hat i+\\tfrac{{80}}{{9}}\\hat j\\right)\\)</li><li>\\(k\\left(-\\tfrac{{15}}{{4}}\\hat i-\\tfrac{{80}}{{9}}\\hat j\\right)\\)</li><li>\\(k\\left(\\tfrac{{15}}{{4}}+\\tfrac{{80}}{{9}}\\right)\\)</li><li>\\(k\\left(\\tfrac{{60}}{{16}}\\hat i+\\tfrac{{80}}{{3}}\\hat j\\right)\\)</li></ol><div class="ans">둘 다 인력이라 \\(q_1\\)은 \\(q_2\\)(+x)·\\(q_3\\)(+y) 쪽으로 당겨진다. 크기 \\(k\\cdot60/16\\), \\(k\\cdot80/9\\). 벡터로 답한다(3번처럼 크기 합은 오답).</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 쌍극자</div><div class="qb">전기 쌍극자의 축에서 멀리(\\(z\\gg d\\)) 떨어진 점의 전기장 크기는 \\(z\\)에 대해?</div><ol class="choices"><li data-ok="1">\\(1/z^3\\)에 비례</li><li>\\(1/z^2\\)에 비례</li><li>\\(1/z\\)에 비례</li><li>\\(z\\)와 무관</li></ol><div class="ans">두 점전하의 장이 거의 상쇄되고 거리 차이만 남아 \\(2qd/z^3\\). 점전하(\\(1/z^2\\))보다 빨리 준다.</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 직선 도선의 극한</div><div class="qb">직선 도선 결과 \\(E=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{q}}{{a(a+L)}}\\)에서 \\(a\\gg L\\)이면?</div><ol class="choices"><li data-ok="1">\\(\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{q}}{{a^2}}\\) — 점전하와 같아진다</li><li>\\(\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{q}}{{aL}}\\)</li><li>0</li><li>\\(\\frac{{\\lambda}}{{2\\pi\\varepsilon_0 a}}\\)</li></ol><div class="ans">\\(a+L\\approx a\\). 멀리서 본 도선은 점전하 — 유도 결과의 검산.</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 적분 설정</div><div class="qb">직선 도선(길이 \\(L\\), 선밀도 \\(\\lambda\\)) 연장선에서 끝으로부터 \\(a\\) 떨어진 점의 전기장을 구할 때, 미소 조각 \\(dq\\)와 적분 구간을 쓰라.</div><div class="ans">\\(dq=\\lambda\\,dx\\), \\(dE=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{\\lambda dx}}{{x^2}}\\), 구간 \\(x=a\\)~\\(a+L\\). 결과 \\(\\frac{{\\lambda}}{{4\\pi\\varepsilon_0}}\\big(\\frac1a-\\frac{{1}}{{a+L}}\\big)=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{q}}{{a(a+L)}}\\).</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
