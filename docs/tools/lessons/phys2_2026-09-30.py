# -*- coding: utf-8 -*-
"""일반물리학2 · 2026-09-30 수업 노트 (근거: 2026-09-30/정리.md — 판서 5장 + 녹음 62분(교수 설명 19:17~61:58). 강의자료·교재 없음.
순서 = 판서 순서(① 21~25장 복습 → ② 전류·유동 속도·전류 밀도 → ③ 비저항·저항 → ④ 미시적 이론·완화 시간 + 1학기 진동 복습 → ⑤ 27장 회로·키르히호프).
기호 약속(끝까지 같은 뜻): e = 기본 전하의 크기(양수, 1.6×10⁻¹⁹ C) · 전자 전하 = −e · v_d = 유동 속도의 크기 · J = 전류 밀도의 크기(방향 = 전류 방향 = E 방향)
HTML 본문은 raw 문자열(TeX 역슬래시 하나) + @이름@ 자리에 그림을 끼운다."""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *
OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\일반물리학2\_수업노트\2026-09-30.html"

def ellipse(cx, cy, rx, ry, color=INK, w=2, fill="none", dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{color}" stroke-width="{w}"{d}/>'

def pair(y, name, mid):
    return (fbox(40, y, 200, 26, name + " · E", GREEN, size=12.5) + line(240, y + 13, 268, y + 13, GRAY, 1.4)
            + text(280, y + 18, mid, 13, GRAY, "middle", True) + line(292, y + 13, 320, y + 13, GRAY, 1.4)
            + fbox(320, y, 200, 26, name + " · V", BLUE, size=12.5))
fig_review = canvas(560, 270,
    step(1, text(140, 22, "22장 전기장 E", 13.5, GREEN, "middle", True), text(420, 22, "24장 전위 V", 13.5, BLUE, "middle", True),
        pair(36, "점전하", "Σ"), pair(68, "점전하군", "Σ"), pair(100, "전기쌍극자", "Σ")),
    step(2, pair(140, "직선도선 (λ)", "∫"), pair(172, "원판 (σ)", "∫"), pair(204, "원형도선", "∫")),
    step(3, text(280, 254, "짝지어서 12개 중 2개 → 10점 × 2 = 20점", 14, RED, "middle", True)),
    cap="판서 ①의 22장·24장 항목을 짝지은 표. 위 셋은 점들의 합(\\(\\Sigma\\), 불균일), 아래 셋은 연속 분포의 적분(\\(\\int\\), 균일 분포).", name="review")

EL = [90, 150, 280, 400, 460]
fig_drift = canvas(560, 262,
    step(1, rect(40, 80, 480, 56, INK, fill="#F1F3F5", sw=1.6), *[charge(x, 108, "−", r=10) for x in EL],
        arrow(310, 62, 230, 62, BLUE, "", 2), text(320, 66, "v_d (전자의 유동 속도)", 12.5, BLUE)),
    step(2, line(200, 70, 200, 146, PINK, 2, "6 4"), line(340, 70, 340, 146, PINK, 2, "6 4"),
        brace_label(200, 340, 160, "ΔL = v_d Δt")),
    step(3, text(280, 200, "부피 A·ΔL 속 전자 수 N = nAΔL · 전하량 q = Ne", 13, INK, "middle")),
    step(4, arrow(60, 30, 180, 30, GREEN, "", 2), text(190, 35, "E", 14, GREEN, "start", True),
        arrow(380, 30, 500, 30, RED, "", 2.4), text(510, 35, "i", 14, RED, "start", True),
        text(280, 238, "i = Δq/Δt = neAv_d  →  J = i/A = nev_d  [A/m²]", 13.5, INK, "middle", True)),
    cap="전자는 \\(\\vec E\\)와 반대로 흐르고(전하가 음수), 전류 \\(i\\)의 방향은 양전하가 가는 쪽 = \\(\\vec E\\) 방향으로 약속한다. 판서는 전자의 이동 방향만 화살표로 그렸다.", name="drift")

fig_res = canvas(560, 236,
    step(1, rect(60, 70, 300, 60, INK, fill="#F1F3F5", sw=1.6), ellipse(60, 100, 12, 30, INK, 1.6, "#E9ECEF"), ellipse(360, 100, 12, 30, INK, 1.6),
        text(60, 54, "단면 A", 12.5, INK, "middle"), brace_label(60, 360, 150, "L"),
        text(60, 194, "높은 전위", 12.5, RED, "middle"), text(360, 194, "낮은 전위", 12.5, BLUE, "middle")),
    step(2, arrow(100, 100, 320, 100, GREEN, "", 2.4), text(210, 90, "E", 14, GREEN, "middle", True),
        text(210, 40, "등방성 도체 : E 가 일정", 12.5, GREEN, "middle", True)),
    step(3, text(470, 70, "예 : L → ½L", 12.5, INK, "middle"), text(470, 94, "A → 2A", 12.5, INK, "middle"),
        text(470, 124, "R → ¼ 배", 13.5, RED, "middle", True)),
    step(4, text(280, 226, "ΔV = EL = ρJL = ρ(i/A)L  →  R = ΔV/i = ρL/A", 13.5, INK, "middle", True)),
    cap="판서 ③. 길이 \\(L\\)·단면 \\(A\\)인 도선 안의 전기장이 일정하면 두 끝의 전위차는 \\(EL\\). 오른쪽은 판서의 배수 예(길이 반, 넓이 두 배 → 저항 1/4).", name="res")

IONS = [(x, y) for x in (70, 150, 230) for y in (60, 120, 180)]
zig = [(298, 90), (210, 90), (170, 150), (130, 150), (90, 90)]
fig_micro = canvas(560, 226,
    step(1, *[charge(x, y, "+", r=8) for x, y in IONS], arrow(70, 22, 230, 22, GREEN, "", 2), text(240, 27, "E", 14, GREEN, "start", True)),
    step(2, polyline(zig, BLUE, 2), arrow(90, 90, 42, 90, BLUE, "", 2), charge(312, 90, "−", r=10),
        text(260, 208, "충돌하며 E 반대쪽으로 평균 v_d", 12.5, BLUE, "middle")),
    step(3, text(350, 66, "F = qE − bv", 15, INK, "start", True), text(350, 90, "−bv : 충돌 = 마찰(저항력)", 12.5, GRAY)),
    step(4, text(350, 132, "F = 0 → v = qE/b", 14, INK), text(350, 158, "τ = m/b (완화 시간)", 14, RED, "start", True),
        text(350, 184, "v = qEτ/m", 14, INK)),
    cap="판서 ④ 미시적 이론. 이온(빨강 +)에 부딪히며 지그재그로 가지만 평균하면 일정한 속도 \\(v_d\\)로 흐른다. \\(q\\)는 운반자 전하 — 전자면 \\(q=-e\\)라 \\(\\vec v\\)는 \\(\\vec E\\)와 반대.", name="micro")

def spring_h(x0, x1, y, n=7, amp=8, color=INK):
    pts = [(x0, y), (x0 + 8, y)]; L = x1 - x0 - 16
    for i in range(n): pts.append((x0 + 8 + L * (i + .5) / n, y + (amp if i % 2 == 0 else -amp)))
    pts += [(x1 - 8, y), (x1, y)]
    return polyline(pts, color, 2)
XD = lambda t: 40 + t * 16; YD = lambda y: 192 - y * 38
fig_osc = canvas(560, 240,
    step(1, line(30, 36, 30, 100, INK, 3), spring_h(30, 110, 70), text(70, 54, "k", 13, INK, "middle"),
        block(110, 50, 50, 40, "m"), arrow(160, 70, 204, 70, RED, "", 2), text(212, 75, "F", 13, RED, "start", True),
        text(250, 46, "F = −kx → x = A cos(ωt + θ)  단순조화", 13, INK)),
    step(2, text(250, 74, "m x″ + b x′ + kx = 0  (−bv 저항)", 13, INK),
        text(250, 100, "x = A e^(−bt/2m) cos(ω′t + θ)  감쇠조화", 13, BLUE, "start", True),
        arrow(40, 192, 528, 192, INK, "", 1.4), text(532, 196, "t", 13, INK),
        fplot(lambda t: math.exp(-0.1 * t), 0, 30, XD, YD, color=GRAY, w=1.2, dash="5 4"),
        fplot(lambda t: -math.exp(-0.1 * t), 0, 30, XD, YD, color=GRAY, w=1.2, dash="5 4"),
        fplot(lambda t: math.exp(-0.1 * t) * math.cos(1.4 * t), 0, 30, XD, YD, n=400, color=BLUE, w=2)),
    step(3, text(250, 128, "외력 F_m cos ω_d t : ω_d ≈ ω 이면 진폭 최대", 13, RED, "start", True)),
    cap="판서 ④ 오른쪽 — 1학기 진동 복습. 저항력 \\(-bv\\)가 들어가면 진폭이 \\(e^{-bt/2m}\\)로 줄어든다. 같은 꼴이 31장 RLC 회로에서 다시 나온다(b 자리가 전기 저항).", name="osc")

fig_circ = canvas(560, 300,
    step(1, terminal(40, 50, "A", lpos="l"), resistor(40, 50, 200, 50, "R"), terminal(200, 50, "B", lpos="r"),
        current(46, 50, 92, 50, "i"), text(120, 96, "V_A − V_B = iR  (V_A > V_B)", 12.5, INK, "middle", True)),
    step(2, terminal(260, 50, "A", lpos="l"), capacitor(260, 50, 400, 50, "C"), terminal(400, 50, "B", lpos="r"),
        text(330, 96, "V_A − V_B = q/C", 12.5, INK, "middle", True)),
    step(3, wire((430, 50), (545, 50)), wire((482, 50), (482, 112)), junction(482, 50),
        current(434, 50, 474, 50, "i₁"), current(492, 50, 538, 50, "i₂"), current(482, 60, 482, 106, "i₃", lpos="r"),
        text(482, 134, "i₁ = i₂ + i₃", 13, RED, "middle", True)),
    step(4, battery(120, 250, 120, 160, "ε₁", plus=2, lpos="l"), resistor(120, 160, 280, 160, "R₁"), resistor(280, 160, 440, 160, "R₂"),
        battery(440, 160, 440, 250, "ε₂", plus=1, lpos="r"), wire((120, 250), (440, 250)),
        current(330, 250, 230, 250, "i", lpos="b"), loop_dir(280, 205, 18, cw=True)),
    step(5, text(280, 292, "고리 규칙 Σε = ΣΔV :  ε₁ − ε₂ = iR₁ + iR₂", 13.5, INK, "middle", True)),
    cap="판서 ⑤. 저항은 전류가 들어가는 쪽이 높은 전위, 분기점은 들어온 전류 = 나간 전류, 고리를 한 바퀴 돌면 기전력의 합 = 전위 강하의 합. 고리를 시계 방향으로 돌면 \\(\\varepsilon_1\\)은 −극→+극이라 \\(+\\), \\(\\varepsilon_2\\)는 +극→−극이라 \\(-\\).", name="circ")

html = r'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>일반물리학2 · 9/30 전류와 저항 · 키르히호프 법칙</title></head><body>
<header>
<h1>26장 전류와 저항 — 그리고 27장 회로 도입</h1>
<p class="lead">수업은 <b>21~25장을 한 판에 정리</b>하며 시작했다 — 「여기까지가 전기」이고 거의 다 시험에 나온다. 26장은 전하가 <b>움직이기</b> 시작하는 장: 전류 \(i\), 전류 밀도 \(J=nev_d\), 그리고 <b>\(R=\rho L/A\)를 유도</b>하는 것이 핵심(교수님: 시험 문제는 이것). 미시적 이론에서는 <b>완화 시간 \(\tau=m/b\)</b>를 용어로만, 끝 15분은 27장 회로의 출발점인 <b>키르히호프 두 법칙</b>.</p>
<p class="meta"><span>판서 5장</span><span>녹음 62분 (설명 19:17~61:58)</span><span>강의자료·교재 없음</span><span>5주차 · 수 · 숙제 없음</span></p>
</header>

<section class="s" data-id="s1" data-nodes="em.field em.potential em.gauss_apps em.capacitance">
<h2>1. 21~25장 복습 — 「여기까지가 전기」 (판서 ①)</h2>
<p>21장 전하 \(q=ne\)(양자화) → 22장 전기장(시험전하 \(q=+1\) C) → 23장 가우스 법칙(가우스면 = 면 \(A\) · 원통 \(2\pi rL\) · 구 \(4\pi r^2\)) → 24장 전위 → 25장 전기 용량·유전체. 22장과 24장은 같은 여섯 가지 분포를 다룬다: <b>불균일(\(\Sigma\))</b> 점전하·점전하군·전기쌍극자, <b>균일(\(\int\))</b> 직선도선(\(\lambda\))·원판(\(\sigma\))·원형도선.</p>
@review@
<div class="formula">\[E=\frac{1}{4\pi\varepsilon_0}\frac{q}{r^2},\qquad V=\frac{1}{4\pi\varepsilon_0}\frac{q}{r},\qquad C=\frac{q}{\Delta V}=\frac{\varepsilon_0\oint\vec E\cdot\hat n\,dA}{-\int_i^f\vec E\cdot d\vec r}\]</div>
<div class="formula">\[\text{도체구: } r\ge R\ \ E=\frac{1}{4\pi\varepsilon_0}\frac{q}{r^2},\ \ r&lt;R\ \ E=0\qquad \text{부도체구: } r&lt;R\ \ E=\frac{1}{4\pi\varepsilon_0}\frac{r}{R^3}q\]</div>
<div class="why">같은 분포의 \(E\)와 \(V\)를 짝으로 보면 일이 반으로 준다: \(V\)는 \(E\)를 선적분한 것(\(\Delta V=-\int\vec E\cdot d\vec r\))이고, 점전하에서 \(1/r^2\) → \(1/r\)이 그 관계다. 구 공식은 \(q&gt;0\) 약속의 크기 식(음전하면 크기는 절댓값, 방향만 반대).</div>
<div class="say">「이거 하고 이거 하고 <b>짝지어가지고 10점짜리로</b> — 이 6개 중에 전부 다 12개죠. <b>12개 중에 두 개가 나오는 거죠.</b> 이거 20점짜리 문제로」 (20:20 — 판서 ① 노란 손메모 「짝지어서 10점짜리로」와 같은 발언) · 「이렇게 생긴 거 3개 중에 하나가 나오 — 계산 문제, 연습 문제 값으로 산수 계산」 「이것 중에 하나 또 나올 거고」 (19:17~20:20, 가리킨 3개가 23장 면·원통·구인지 25장 평행판·원통형·구형 축전기인지는 확인 못 함) · 「<b>가우스 법칙은 전체 다 해야 돼요</b>」 — \(q_{enc}\)로 도체·부도체 구 (20:51) · 「여기까지 얘기한 건 거의 다 시험 문제 나올 거고요」 「시험 문제가 한 10개, 11개 정도」 1학기와 거의 같은 형식 (21:30)</div>
<div class="analogy">22장과 24장은 같은 동네(분포 6곳)를 두 지도로 그린 것 — 하나는 "바람의 세기와 방향"(\(\vec E\)), 하나는 "땅의 높이"(\(V\)). 같은 동네라 둘을 짝으로 외우면 된다.</div>
<div class="memo"><b>외울 것</b> 22장 \(E\) 6개 ↔ 24장 \(V\) 6개 짝(12개 중 2개, 20점) · 가우스 법칙 전부(\(q_{enc}\), 도체·부도체 구) · 가우스면 면·원통 \(2\pi rL\)·구 \(4\pi r^2\)</div>
</section>

<section class="s" data-id="s2" data-nodes="em.current">
<h2>2. 26장 전류 — 유동 속도와 전류 밀도 (판서 ②)</h2>
<p><b>전류(current)</b> = 전자의 흐름. 전자가 도선 안에서 평균적으로 이동하는 속력이 <b>유동(표류) 속도 \(v_d\)</b>(drift velocity) — 「어려운 거 하는 거 아니야」. 단면적 \(A\)인 도선에서 \(\Delta t\) 동안 전자가 가는 거리는 \(\Delta L=v_d\Delta t\)(거리 = 속력 × 시간).</p>
@drift@
<div class="formula">\[n=\frac{N}{V}\ \Rightarrow\ dN=n\,dV=nA\,dL=nAv_d\,dt,\qquad dq=e\,dN=neAv_d\,dt\]</div>
<div class="formula">\[i=\frac{dq}{dt}=neAv_d,\qquad J=\frac{i}{A}=nev_d\quad[\mathrm{A/m^2}]\]</div>
<div class="why">"얼마나 흘렀나"를 개수로 센다: <b>수밀도 \(n\)</b>(number density) = 단위 부피당 전자 수(이 장에서만 개수를 대문자 \(N\)으로). 두 단면 사이 부피 \(A\,dL\) 안의 전자가 \(dt\) 동안 전부 단면을 지나가니 \(dN=nAv_d\,dt\), 전하량은 개수 × \(e\). 여기서 \(e\)는 기본 전하의 <b>크기</b>(양수 \(1.6\times10^{-19}\) C)라 \(i,J\)는 크기다. 방향은 약속: 전류·\(\vec J\)는 양전하가 가는 쪽 = \(\vec E\) 방향, 전자는 그 반대로 간다(판서 \(|\vec J|=ne|\vec v_d|\)).</div>
<div class="say">「전류 밀도 \(J\) — 맨 마지막 32장(맥스웰) 방정식에 들어가는 기호」라 <b>기호 \(J\)를 기억</b>할 것. 단위 A/m².</div>
<div class="analogy">고속도로 요금소: 1초에 요금소를 지나는 차 수(\(i\)) = 차 밀도(\(n\)) × 도로 폭(\(A\)) × 차 속력(\(v_d\)). 차선 하나당으로 나누면 \(J\).</div>
<div class="memo"><b>외울 것</b> \(i=dq/dt=neAv_d\) · \(J=i/A=nev_d\) [A/m²] · \(n\) = 수밀도 · \(v_d\) = 유동 속도 · 전류 방향 = 전자 이동의 반대</div>
</section>

<section class="s" data-id="s3" data-nodes="em.resistance">
<h2>3. 비저항과 저항 — R = ρL/A 유도 (판서 ③)</h2>
<p>도선을 <b>등방성 도체</b>(= 안의 전기장이 일정한 도체)로 둔다 — 「앞으로도 많이 나올 거야」. 길이 \(L\)의 양 끝 전위차: 높은 쪽을 \(s=0\), 낮은 쪽을 \(s=L\)로 두면 \(\Delta V=-\int_L^0\vec E\cdot d\vec s=EL\).</p>
@res@
<div class="formula">\[\vec E=\rho\vec J\ \Rightarrow\ \Delta V=EL=\rho JL\ \Rightarrow\ \rho=\frac{\Delta V}{JL}=\frac{\Delta V}{(i/A)L}=\frac{\Delta V}{i}\cdot\frac{A}{L}=R\frac{A}{L}\]</div>
<div class="formula">\[\therefore\ R=\rho\frac{L}{A}\ [\Omega],\qquad \rho\ [\Omega\cdot\mathrm m]\ \text{비저항},\qquad \sigma=\frac1\rho\ [\Omega^{-1}\mathrm m^{-1}=\mathrm{mho/m}]\ \text{전기 전도도}\]</div>
<div class="why">\(\vec E=\rho\vec J\)가 출발점: 같은 전기장을 걸어도 물질마다 흐르는 전류 밀도가 다르고, 그 비율이 <b>비저항 \(\rho\)</b>(specific resistance, 물질마다 다른 저항의 정도). 나머지는 \(\Delta V=EL\), \(J=i/A\) 두 개를 넣고 \(R=\Delta V/i\)로 묶은 것뿐이다. 그래서 \(R\)은 물질(\(\rho\))과 모양(\(L,A\))으로 갈린다 — 길수록 크고, 굵을수록 작다. 비저항이 크면 전도도는 작다.</div>
<div class="say">「물리적으로 이렇게 정의해서 <b>시험 문제 나오는 건 이것밖에 없어요</b>」 (35:27) · 「고등학교 때 이걸로 시험이 많이 나왔는데 <b>이런(저항 배수) 시험 문제는 안 나올 거고, 핵심은 전기 저항 식을 유도할 줄 아는 것</b>」 (36:48)</div>
<div class="analogy">수도관: 관이 길면(\(L\)↑) 물이 덜 흐르고, 굵으면(\(A\)↑) 잘 흐른다. 관 안쪽이 거친 정도가 \(\rho\).</div>
<div class="pitfall">\(\rho\)(비저항, 물질의 성질)와 \(R\)(저항, 그 물질로 만든 도선 한 개의 성질)을 섞지 말 것. 단위도 \(\Omega\cdot\)m와 \(\Omega\)로 다르다.</div>
<div class="memo"><b>외울 것</b> 유도 순서 \(\vec E=\rho\vec J\) → \(\Delta V=EL=\rho JL\) → \(J=i/A\) → \(R=\rho L/A\) · \(\rho\) [Ω·m] · \(\sigma=1/\rho\) [mho/m]</div>
</section>

<section class="s" data-id="s4" data-nodes="em.resistance">
<h2>4. 미시적 이론 — 충돌과 완화 시간 (판서 ④ 왼쪽)</h2>
<p>실제 전자는 한 방향으로 곧게 가지 않고 이온과 <b>충돌</b>한다. 그 손실을 1학기의 저항력 \(\vec f=-b\vec v^{\,n}\)(여기서 \(n=1\))으로 쓴다 — 판서의 「마찰」.</p>
@micro@
<div class="formula">\[\vec F=q\vec E-b\vec v\ \xrightarrow{\ \vec F=0\ }\ \vec v=\frac{q\vec E}{b}=\frac{q\vec E}{m}\cdot\frac{m}{b},\qquad \tau=\frac{m}{b}\ (\text{완화 시간}),\qquad \vec v=\frac{q\vec E\tau}{m}\]</div>
<div class="why">전기력 \(q\vec E\)가 밀고 충돌(\(-b\vec v\))이 붙잡아 둘이 같아지면 알짜힘 0 → 일정한 속도, 이것이 유동 속도다(종단 속도와 같은 원리). 분자·분모에 \(m\)을 곱해 \(m/b\)를 한 묶음으로 본 것이 <b>충돌 완화 시간 \(\tau\)</b>(relaxation time). 전자는 \(q=-e\)라 \(\vec v\)가 \(\vec E\)와 반대. 같은 공간에 전자가 100개보다 200개면 충돌이 잦아 충돌 사이 간격(\(\tau\))이 짧다. (보충: 크기로 \(v_d=eE\tau/m\)를 \(J=nev_d\)에 넣으면 \(J=\frac{ne^2\tau}{m}E\) — 3절의 \(\rho\)가 \(\rho=\frac{m}{ne^2\tau}\)이다.)</div>
<div class="say">「<b>충돌 완화 시간 정도만, 용어만 기억</b>하면 될 것 같아요」 · 「26장 핵심 내용은 이것밖에 없어요」 · 「저런 문제 시험 문제 낼 일 없어요」 (48:43~49:38) — 26장은 자기(磁氣)의 소스가 전류라는 것을 말하려는 장.</div>
<div class="analogy">사람으로 꽉 찬 지하철 통로: 뒤에서 밀어도(\(qE\)) 계속 부딪혀서(\(-bv\)) 결국 일정한 걸음으로 걷게 된다. 사람이 많을수록 부딪히는 간격(\(\tau\))이 짧다.</div>
<div class="memo"><b>외울 것</b> \(\vec F=q\vec E-b\vec v\) · \(\tau=m/b\) = 충돌 완화 시간(relaxation time, 용어) · \(\vec v=q\vec E\tau/m\)</div>
</section>

<section class="s" data-id="s5" data-nodes="">
<h2>5. 1학기 진동 복습 — 단순 · 감쇠 · 강제 (판서 ④ 오른쪽)</h2>
<p>저항력 \(-bv\)가 나온 김에 1학기 진동을 다시 짚었다 — 「모르면 제일 중요하다고 한 거」. 같은 식이 31장 LC·RLC·RL 교류 회로에서 그대로 다시 나온다(b 항 = 전기의 저항).</p>
@osc@
<div class="formula">\[m\frac{d^2x}{dt^2}+b\frac{dx}{dt}+kx=0\ \Rightarrow\ x(t)=Ae^{-bt/2m}\cos(\omega' t+\theta),\qquad \omega=\sqrt{k/m},\ \ \omega'=\sqrt{\omega^2-(b/2m)^2}\]</div>
<div class="why">용수철만 있으면 \(F=-kx\) → \(x=A\cos(\omega t+\theta)\), <b>단순조화진동</b>(주파수 하나 = simple, 정수배 = harmonic). 저항 \(-bv\)를 넣으면 진폭이 \(e^{-bt/2m}\)로 지수적으로 줄어드는 <b>감쇠조화진동</b>. 바깥에서 진동수 \(\omega_d\)로 밀면(강제 진동) \(\omega_d\)가 고유 진동수 \(\omega\)와 거의 같을 때 진폭이 최대가 된다(판서 「\(\omega\approx\omega_d\) → 진폭 최대」). 판서는 감쇠 진동수도 \(\omega\)로 적었고, 녹음은 \(\omega'\)로 구분했다.</div>
<div class="say">「지금 몰라도 상관없으니까 나중에 다시」 — 31장에서 똑같이 다시 한다.</div>
<div class="analogy">그네: 그냥 두면 같은 폭으로 흔들리고(단순), 공기 저항이 있으면 점점 잦아들고(감쇠), 박자에 맞춰 밀면 가장 크게 흔들린다(강제·공명). 같은 날 공업수학1 2.8(강제진동·공진)과 같은 방정식이다.</div>
<div class="memo"><b>외울 것</b> 단순조화 \(x=A\cos(\omega t+\theta)\) · 감쇠 \(x=Ae^{-bt/2m}\cos(\omega't+\theta)\) · \(\omega_d\approx\omega\) → 진폭 최대 · 31장 RLC 에서 다시</div>
</section>

<section class="s" data-id="s6" data-nodes="em.emf_loop em.kirchhoff">
<h2>6. 27장 회로 — 전위차와 키르히호프 두 법칙 (판서 ⑤)</h2>
<div class="say">시험 범위·요일(50:00~55:37): 27장 회로를 오늘 마지막으로 설명 — 「<b>여기까지 시험 범위 할 거야</b>」. 시험 요일은 미정 — 이 반 다수는 금요일, 교수님은 수요일 선호, 「다음 번에 또 물어볼 거야」.</div>
@circ@
<div class="formula">\[\text{저항: } V_A-V_B=iR\ (V_A&gt;V_B),\qquad \text{축전기: } V_A-V_B=\Delta V=\frac{q}{C}\]</div>
<div class="formula">\[\text{제1법칙(접점 규칙): }\ \sum i=0\ \Rightarrow\ i_1=i_2+i_3,\qquad \text{제2법칙(고리 규칙): }\ \sum\varepsilon=\sum\Delta V\]</div>
<div class="why">저항: 전류가 A → B로 흐르면 A가 높은 전위, 그 차가 \(iR\) — 「이 개념만 알고 있으면 돼」. <b>제1법칙</b>은 분기점에 전하가 쌓이지 않는다는 <b>전하량 보존</b>: 들어온 만큼 나간다. <b>제2법칙</b>은 고리를 한 바퀴 돌아 제자리에 오면 전위가 같다는 <b>에너지 보존</b>: 전지가 올려 준 전위(\(\sum\varepsilon\)) = 저항에서 내려간 전위(\(\sum\Delta V\)). 부호 약속: 고리를 도는 방향으로 전지를 −극 → +극으로 지나면 \(+\varepsilon\), 반대면 \(-\varepsilon\)(두 전지면 \(\varepsilon_1-\varepsilon_2\)). 저항은 전류 방향으로 지나면 \(+iR\)만큼 내려간다.</div>
<div class="say">「전류 방향·고리 도는 방향·변수 이름은 전부 마음대로 — <b>엿장수가 되면 돼요</b>」 — 방향을 반대로 잡으면 답이 음수로 나올 뿐이다. 왜 그래도 되는지는 다음 시간(10/2) 회로 산수 계산으로 보인다.</div>
<div class="analogy">등산로 한 바퀴: 케이블카(전지)로 올라간 높이의 합 = 걸어 내려온 높이(저항)의 합. 출발점으로 돌아오면 높이는 그대로다. 갈림길(분기점)에서는 들어온 사람 수 = 나간 사람 수.</div>
<div class="memo"><b>외울 것</b> \(V_A-V_B=iR\)(전류가 들어가는 쪽이 높다) · \(V_A-V_B=q/C\) · 제1법칙 \(\sum i=0\) = 전하량 보존 · 제2법칙 \(\sum\varepsilon=\sum\Delta V\) = 에너지 보존 · −극→+극이면 \(+\varepsilon\)</div>
</section>

<div class="q" data-qid="q1" data-nodes="em.field em.potential"><div class="qn">확인 1 · 22장 ↔ 24장 짝</div><div class="qb">점전하 \(q\)에서 거리 \(r\)인 곳의 전기장 크기와 전위의 짝으로 옳은 것은? (\(k=\frac{1}{4\pi\varepsilon_0}\), \(q&gt;0\))</div><ol class="choices"><li data-ok="1">\(E=kq/r^2,\ V=kq/r\)</li><li>\(E=kq/r,\ V=kq/r^2\)</li><li>\(E=kq/r^2,\ V=kq/r^2\)</li><li>\(E=kq/r,\ V=kqr\)</li></ol><div class="ans">\(V\)는 \(E\)를 선적분한 것 — \(1/r^2\)을 적분하면 \(1/r\).</div></div>
<div class="q" data-qid="q2" data-nodes="em.gauss_apps"><div class="qn">확인 2 · 가우스 법칙 구</div><div class="qb">반지름 \(R\)인 부도체구에 전하 \(q(&gt;0)\)가 고르게 퍼져 있다. 구 안(\(r&lt;R\))의 전기장 크기는?</div><ol class="choices"><li data-ok="1">\(\frac{1}{4\pi\varepsilon_0}\frac{r}{R^3}q\)</li><li>\(0\)</li><li>\(\frac{1}{4\pi\varepsilon_0}\frac{q}{r^2}\)</li><li>\(\frac{1}{4\pi\varepsilon_0}\frac{q}{R^2}\)</li></ol><div class="ans">\(q_{enc}=q\,r^3/R^3\) → \(E\cdot4\pi r^2=q_{enc}/\varepsilon_0\). 2번(\(E=0\))은 도체구 안.</div></div>
<div class="q" data-qid="q3" data-nodes="em.current"><div class="qn">확인 3 · 전류 밀도</div><div class="qb">전류 밀도 \(J\)의 식과 단위로 옳은 것은? (\(n\): 수밀도, \(e\): 기본 전하의 크기, \(v_d\): 유동 속도)</div><ol class="choices"><li data-ok="1">\(J=nev_d\), A/m²</li><li>\(J=nev_d\), A</li><li>\(J=nev_dA\), A/m²</li><li>\(J=ne/v_d\), A/m</li></ol><div class="ans">\(J=i/A=nev_d\). \(neAv_d\)는 \(J\)가 아니라 전류 \(i\).</div></div>
<div class="q" data-qid="q4" data-nodes="em.current"><div class="qn">확인 4 · 유동 속도</div><div class="qb">단면적 \(1.0\ \mathrm{mm^2}\)인 구리선에 \(1.0\) A가 흐른다. \(n=8.5\times10^{28}\ \mathrm{m^{-3}}\), \(e=1.6\times10^{-19}\) C일 때 유동 속도는?</div><ol class="choices"><li data-ok="1">약 \(7.4\times10^{-5}\) m/s</li><li>약 \(7.4\times10^{-2}\) m/s</li><li>약 \(1.4\times10^{4}\) m/s</li><li>약 \(3\times10^{8}\) m/s</li></ol><div class="ans">\(v_d=\dfrac{i}{neA}=\dfrac{1.0}{8.5\times10^{28}\times1.6\times10^{-19}\times1.0\times10^{-6}}\approx7.4\times10^{-5}\) m/s — 1초에 0.07 mm. mm²를 m²로(\(10^{-6}\)) 바꾸는 것을 잊지 말 것.</div></div>
<div class="q" data-qid="q5" data-nodes="em.resistance"><div class="qn">확인 5 · R = ρL/A 유도</div><div class="qb">등방성 도체(길이 \(L\), 단면 \(A\))에서 \(R=\rho L/A\)를 유도하라.</div><div class="ans">\(\vec E=\rho\vec J\), \(E\) 일정 → \(\Delta V=EL=\rho JL\). \(J=i/A\)를 넣으면 \(\Delta V=\rho\frac{i}{A}L\) → \(R=\frac{\Delta V}{i}=\rho\frac{L}{A}\). (교수님: 시험 핵심은 이 유도)</div></div>
<div class="q" data-qid="q6" data-nodes="em.resistance"><div class="qn">확인 6 · 판서 ③ 예</div><div class="qb">같은 물질로 길이를 \(\tfrac12\)로, 단면적을 2배로 만든 도선의 저항은 원래의 몇 배인가?</div><ol class="choices"><li data-ok="1">\(\tfrac14\)배</li><li>1배</li><li>4배</li><li>\(\tfrac12\)배</li></ol><div class="ans">\(R\propto L/A=\frac{1/2}{2}=\frac14\). 수업 예(교수님: 이런 배수 문제는 시험에 안 낸다).</div></div>
<div class="q" data-qid="q7" data-nodes="em.resistance"><div class="qn">확인 7 · 완화 시간</div><div class="qb">\(\vec F=q\vec E-b\vec v\)에서 \(\vec F=0\)일 때 정의하는 충돌 완화 시간 \(\tau\)는?</div><ol class="choices"><li data-ok="1">\(\tau=m/b\)</li><li>\(\tau=b/m\)</li><li>\(\tau=qE/b\)</li><li>\(\tau=mb\)</li></ol><div class="ans">\(\vec v=q\vec E/b=\frac{q\vec E}{m}\cdot\frac mb\) → \(\tau=m/b\), \(\vec v=q\vec E\tau/m\).</div></div>
<div class="q" data-qid="q8" data-nodes="em.kirchhoff"><div class="qn">확인 8 · 접점 규칙</div><div class="qb">분기점으로 \(i_1=5\) A가 들어오고 한쪽으로 \(i_2=2\) A가 나간다. 나머지 가지의 전류 \(i_3\)와 이 법칙의 뿌리는?</div><ol class="choices"><li data-ok="1">3 A, 전하량 보존</li><li>7 A, 전하량 보존</li><li>3 A, 에너지 보존</li><li>2.5 A, 에너지 보존</li></ol><div class="ans">\(i_1=i_2+i_3\) → \(i_3=3\) A. 제1법칙 = 전하량 보존, 제2법칙(고리) = 에너지 보존.</div></div>
<div class="q" data-qid="q9" data-nodes="em.emf_loop"><div class="qn">확인 9 · 저항의 전위차</div><div class="qb">\(R=3\ \Omega\)인 저항에 A → B 방향으로 \(2\) A가 흐른다. \(V_A-V_B\)는?</div><ol class="choices"><li data-ok="1">\(+6\) V (A가 높다)</li><li>\(-6\) V (B가 높다)</li><li>\(+1.5\) V</li><li>\(0\) V</li></ol><div class="ans">\(V_A-V_B=iR=2\times3=6\) V. 전류가 들어가는 쪽이 높은 전위.</div></div>
<div class="q" data-qid="q10" data-nodes="em.emf_loop em.kirchhoff"><div class="qn">확인 10 · 고리 규칙</div><div class="qb">한 고리에 기전력 \(\varepsilon_1=12\) V, \(\varepsilon_2=3\) V인 전지가 서로 반대 방향으로, 저항 \(R_1=2\ \Omega\), \(R_2=1\ \Omega\)이 직렬로 있다. 고리 전류는? (\(\varepsilon_1\)이 미는 방향을 고리 방향으로)</div><ol class="choices"><li data-ok="1">3 A</li><li>5 A</li><li>4 A</li><li>9 A</li></ol><div class="ans">\(\sum\varepsilon=\sum\Delta V\): \(\varepsilon_1-\varepsilon_2=i(R_1+R_2)\) → \(12-3=3i\) → \(i=3\) A.</div></div>
</body></html>'''
for k, v in {"review": fig_review, "drift": fig_drift, "res": fig_res, "micro": fig_micro, "osc": fig_osc, "circ": fig_circ}.items():
    assert f"@{k}@" in html, k
    html = html.replace(f"@{k}@", v)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
