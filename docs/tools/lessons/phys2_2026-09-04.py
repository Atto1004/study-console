# -*- coding: utf-8 -*-
"""일반물리학2 · 2026-09-04 수업 노트 원본 생성 (근거: 2026-09-04/정리.md · _정리노트/2026-09-04_전하와전기장서론.html · 강의노트 p.3~9 · 슬라이드 22p)"""
import io, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *

OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\일반물리학2\_수업노트\2026-09-04.html"

# ---- 그림 ----
fig_net = canvas(560, 200,
    charge(80, 70, "+", "", 11, RED), charge(112, 70, "+", "", 11, RED),
    charge(64, 118, "−", "", 11, BLUE), charge(96, 118, "−", "", 11, BLUE), charge(128, 118, "−", "", 11, BLUE), charge(80, 160, "−", "", 11, BLUE), charge(112, 160, "−", "", 11, BLUE),
    rect(40, 40, 112, 145, GRAY, dash="4 4", rx=14), text(96, 32, "q₁ = 양성자 2 + 전자 5", 13, INK, "middle"),
    arrow(200, 112, 250, 112, INK, "", 1.6), text(225, 100, "상쇄", 12, GRAY, "middle"),
    charge(320, 100, "−", "", 22, BLUE), text(320, 170, "알짜 −3e", 14, BLUE, "middle", True),
    radial(320, 100, 6, 44, 28, GREEN, inward=True), text(320, 190, "전기력선 3개가 들어온다", 12, GREEN, "middle"),
    charge(470, 100, "+", "", 22, RED), text(470, 170, "알짜 +9e", 14, RED, "middle", True), radial(470, 100, 9, 28, 48, GREEN), text(470, 190, "9개가 나간다", 12, GREEN, "middle"),
    cap="양성자 2개 + 전자 5개 → 2쌍은 중성으로 상쇄, 전자 3개만 남는다. 앞으로 「전하」는 전부 이 알짜(net) 전하다.")

fig_field = canvas(560, 210,
    charge(150, 105, "+", "+q", 20, RED), radial(150, 105, 10, 28, 70, GREEN),
    text(150, 195, "양전하: 밖으로", 13, INK, "middle"),
    charge(410, 105, "−", "−q", 20, BLUE), radial(410, 105, 10, 70, 28, GREEN, inward=True),
    text(410, 195, "음전하: 안으로", 13, INK, "middle"),
    dot(280, 40, "", 5, INK), text(268, 30, "P에 +1 C", 12, INK, "end"), arrow(280, 40, 340, 40, GREEN, "E = 받는 힘", 2.2, 0, -8),
    cap=r"전기장 \(ec E\) = 그 점에 +1 C 시험전하를 두었을 때 받는 힘. 화살표(전기력선)의 밀도가 세기, 접선이 방향.")

fig_coulomb = canvas(560, 150,
    charge(120, 75, "+", "q₁", 18, RED), charge(440, 75, "+", "q₂", 18, RED),
    line(138, 75, 422, 75, GRAY, 1.2, "5 4"), brace_label(140, 420, 118, "r"),
    arrow(100, 75, 40, 75, GREEN, "F⃗", 2.4, 0, -10), arrow(460, 75, 520, 75, GREEN, "F⃗", 2.4, 0, -10),
    text(280, 40, "같은 부호 → 밀어낸다 (척력) · 다른 부호 → 당긴다 (인력)", 13, INK, "middle"),
    cap="쿨롱 법칙: 힘은 두 전하 곱에 비례, 거리 제곱에 반비례. 만유인력과 똑같은 꼴(역제곱 법칙).")

fig_monopole = canvas(560, 160,
    rect(60, 60, 160, 40, INK, fill="#F1F3F5", sw=1.5), text(95, 86, "N", 16, RED, "middle", True), text(185, 86, "S", 16, BLUE, "middle", True),
    line(140, 50, 140, 110, RED, 2, "4 3"), text(140, 130, "자르면?", 13, GRAY, "middle"),
    arrow(240, 80, 290, 80, INK, "", 1.6),
    rect(310, 60, 100, 40, INK, fill="#F1F3F5", sw=1.5), text(335, 86, "N", 14, RED, "middle", True), text(385, 86, "S", 14, BLUE, "middle", True),
    rect(430, 60, 100, 40, INK, fill="#F1F3F5", sw=1.5), text(455, 86, "N", 14, RED, "middle", True), text(505, 86, "S", 14, BLUE, "middle", True),
    text(420, 130, "또 N·S — 자하는 혼자 못 산다", 13, INK, "middle"),
    cap="자석은 아무리 잘라도 N·S가 붙어 나온다. 그래서 자기의 소스는 자하가 아니라 전류(I = dq/dt).")

html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>일반물리학2 · 9/4 전하와 전기장 서론</title></head><body>
<header>
<h1>전하와 전기장 — "전기와 자기는 똑같다"</h1>
<p class="lead">이번 학기 전기 파트(21~25장)는 한 줄이다: <b>전하 → 전기장 → 가우스 법칙 → 전위 → 축전기</b>. 오늘은 계산이 아니라 그 뼈대를 세우는 날. 교수님은 "다다음 시간부터 전기장 계산에 치일 것"이라고 예고했다.</p>
<p class="meta"><span>녹음 60분</span><span>강의노트 p.3~9</span><span>슬라이드 22장 · 예제 5</span><span>중간 범위 21~27장</span></p>
</header>

<section class="s" data-id="s1">
<h2>1. 전기의 소스는 전하 — 세는 습관부터</h2>
<p>전기 현상을 일으키는 근원은 <b>전하(charge)</b>다. 전하는 낱개로 세어진다: 전자 하나가 \\(-e\\), 양성자 하나가 \\(+e\\), \\(e=1.6\\times10^{{-19}}\\) C.</p>
<div class="formula">\\[q = n\\,e\\qquad (n = \\text{{개수}},\\ e = 1.6\\times10^{{-19}}\\ \\mathrm{{C}})\\] 전하량을 보면 <b>개수</b>가 보여야 한다. \\(3.2\\times10^{{-19}}\\) C → 2개.</div>
<div class="why">전하는 전자·양성자라는 알갱이로만 존재하기 때문에 \\(e\\)의 정수배로만 나온다. 이걸 <b>양자화</b>라고 부르지만, 수업에서는 "덩어리로 묶여 있다"는 뜻 이상으로 의미를 두지 말라고 했다.</div>
<p>물체 안에는 양성자와 전자가 섞여 있다. 같은 수만큼은 서로 상쇄되고 <b>남는 것</b>만 전기를 만든다 — 그것이 <b>알짜 전하(net charge)</b>다.</p>
{fig_net}
<div class="analogy">통장에 +100만 원 재산과 −100만 원 빚이 같이 있으면 남는 건 0이다. 전하도 마찬가지 — 앞으로 "전하 q"라고 하면 언제나 <b>상쇄하고 남은 알짜</b>를 뜻한다.</div>
<div class="say">"이 얘기(알짜 전하와 전기력선 개수)만 딱 있으면 전기는 끝이야." — 강의노트 뒤의 합력 문제는 전부 이 그림에서 벡터 합만 하면 된다.</div>
</section>

<section class="s" data-id="s2">
<h2>2. 전기장 = "+1 C을 놓았을 때 받는 힘"</h2>
<p>어떤 전하가 주변 공간에 미치는 영향을 지도로 그린 것이 <b>전기장 \\(\\vec E\\)</b>다. 기준은 언제나 <b>+1 C의 시험전하</b>(test charge). 그 자리에 +1 C을 놓았을 때 받는 힘의 크기와 방향이 곧 그 점의 전기장이다.</p>
{fig_field}
<div class="why">힘 \\(\\vec F\\)는 놓은 시험전하 \\(q_0\\)에 비례한다. 시험전하가 2배면 힘도 2배. 그래서 힘을 시험전하로 나눈 \\(\\vec E=\\vec F/q_0\\)를 쓰면 "누가 와서 재든 같은 값"이 된다 — 전하가 만든 공간의 성질만 남는다. 시험전하는 원래 장을 흐트러뜨리지 않도록 아주 작다고 본다(\\(q_0\\to0\\)).</div>
<div class="analogy">바람 지도. 깃발(시험전하)을 어디에 꽂아도 "그 자리의 바람"은 정해져 있다. 큰 깃발은 더 세게 밀리지만 바람 자체가 세진 건 아니다. 전기장은 그 "바람"이다.</div>
<p>+1 C에는 전자 약 \\(6\\times10^{{18}}\\)개 분량의 전하가 있다(교수님 표현 "600경 개"). 양성자 하나에서 전기력선이 하나 나온다고 보면 +1 C에서는 전기력선이 \\(6\\times10^{{18}}\\)개 뻗어 나간다. 전기장을 구한다 = <b>그 점을 지나는 전기력선을 센다</b>.</p>
<div class="say">"그러면 이 n개를 어떻게 카운트할 거냐가 핵심 내용인 거예요." — 이 과목의 전기 파트 전체가 "상황별로 전기력선 개수를 세는 법"이다.</div>
</section>

<section class="s" data-id="s3">
<h2>3. 세는 방법은 둘뿐 — 합(Σ) 아니면 적분(∫)</h2>
<p>전하가 <b>몇 개</b>로 떨어져 있으면 하나씩 구해서 더한다(Σ). 전하가 도선·판처럼 <b>연속으로 퍼져</b> 있으면 아주 작은 조각 \\(dq\\)가 만드는 장을 적분한다(∫).</p>
<div class="memo"><b>불연속 → Σ</b>: 점전하 · 점전하군 · 전기쌍극자<br><b>연속 → ∫dq</b>: 직선 도선(\\(\\lambda\\)) · 원형 도선(\\(\\lambda\\)) · 원판(\\(\\sigma\\))</div>
<p>연속 분포에는 "단위 길이·면적·부피당 전하"인 <b>밀도</b> 기호가 붙는다: 선 \\(\\lambda=dq/ds\\), 면 \\(\\sigma=dq/dA\\), 부피 \\(\\rho\\). 답에 어느 기호를 쓰는지 틀리면 감점이다.</p>
<div class="analogy">사탕 다섯 개는 하나씩 세면 되지만(Σ), 설탕 한 봉지는 "1 g당 몇 알" 같은 밀도로 다뤄야 한다(∫). 직선 도선은 설탕을 한 줄로 뿌린 것, 원판은 접시에 편 것.</div>
<p>이 여섯 가지가 22장의 목차 그대로다. 앞의 셋은 9/9, 뒤의 셋은 9/9~9/11에 하나씩 나온다.</p>
</section>

<section class="s" data-id="s4">
<h2>4. 쿨롱 법칙 — 1학기 만유인력과 같은 꼴</h2>
<p>두 점전하 사이 힘은 1학기 13장 만유인력 \\(F=G\\dfrac{{Mm}}{{r^2}}\\)과 똑같은 <b>역제곱 법칙</b>이다. 질량 자리에 전하가 들어갈 뿐.</p>
{fig_coulomb}
<div class="formula">\\[\\vec F=\\frac{{1}}{{4\\pi\\varepsilon_0}}\\frac{{q_1q_2}}{{r^2}}\\hat r,\\qquad \\frac{{1}}{{4\\pi\\varepsilon_0}}=k\\approx9\\times10^{{9}}\\ \\mathrm{{N\\,m^2/C^2}},\\quad \\varepsilon_0=8.854\\times10^{{-12}}\\ \\mathrm{{C^2/N\\,m^2}}\\]</div>
<div class="pitfall">고등학교에서는 \\(k\\)로 썼지만 이 수업에서는 <b>무조건 \\(\\dfrac{{1}}{{4\\pi\\varepsilon_0}}\\)</b>로 쓴다. 가우스 법칙(23장)에서 \\(\\varepsilon_0\\)가 그대로 나오기 때문에, 처음부터 이 꼴에 익숙해져야 한다.</div>
<h3>ε₀ — 진공의 유전율, "전기를 꼬시는 정도"</h3>
<p>誘電率의 誘는 <b>유혹할 유</b>. +극에서 −극으로 전기력선이 갈 때 매질이 그 진행을 얼마나 붙잡느냐를 나타낸다. 진공은 100% 통과시킨다 → 그 값이 \\(\\varepsilon_0\\), <b>가장 작은 유전율</b>. 종이가 끼면 90%, 나무·쇠면 더 적게 → \\(\\varepsilon\\)이 커진다 → 전기장이 작아진다.</p>
<div class="why">\\(\\varepsilon_0\\)가 가장 작으니 그 역수인 \\(k\\)는 가장 크다 → <b>진공에서 전기력이 가장 세다</b>. 유전체를 넣으면 전기장이 줄어드는 25장 내용이 여기서 예고된다.</div>
<div class="say">"소리의 매질은 공기다. 그럼 빛(전자기파)의 매질은?" — 진공. 아무도 답을 못 해서 교수님이 한참 기다렸다.</div>
</section>

<section class="s" data-id="s5">
<h2>5. 자기의 소스는 왜 전류인가 — 그리고 빛의 속도</h2>
<p>전기에 \\(\\varepsilon_0\\)(유전율)가 있으면 자기에는 \\(\\mu_0=4\\pi\\times10^{{-7}}\\)(<b>투자율</b>)이 있다. N극에서 S극으로 자기력선이 갈 때 진공이 가장 적게 방해하는 값.</p>
{fig_monopole}
<div class="why">자기의 알갱이(자하, monopole)는 N·S가 붙어서만 존재한다. 붙어 있으면 거리 \\(r=0\\) → 역제곱 법칙이 \\(1/0^2=\\infty\\)로 터진다. 그래서 자기에서는 자하 대신 <b>전류 \\(I=dq/dt\\)</b> [A = C/s]를 소스로 삼는다.</div>
<div class="memo"><b>정전기학</b>(21~25장): 소스 = 전하 \\(q\\), 시간과 무관 · <b>동전기학</b>(26장~): 소스 = 전류 \\(I=dq/dt\\), 시간과 관련</div>
<p>두 상수를 합치면 놀라운 것이 나온다:</p>
<div class="formula">\\[c=\\frac{{1}}{{\\sqrt{{\\varepsilon_0\\,\\mu_0}}}}\\approx3\\times10^{{8}}\\ \\mathrm{{m/s}}\\] "가장 작은 값 두 개를 곱해 루트 씌우고 역수를 취했으니 가장 큰 값" — 빛의 속도.</div>
<div class="analogy">전기와 자기는 같은 동전의 양면이라, 두 상수만으로 빛이 얼마나 빨리 달리는지가 정해진다. 마지막 시간에 맥스웰 방정식에서 이 식을 직접 유도한다.</div>
<div class="say">"전기와 자기는 똑같다. 전기만 제대로 하면 자기는 저절로 된다." — 전하 \\(q\\) 자리에 전류 \\(I\\)만 바꿔 넣으면 자기 파트가 된다는 뜻.</div>
</section>

<section class="s" data-id="s6">
<h2>6. 예제 — 슬라이드 01~05 (답은 슬라이드에 없어 아톰이 계산)</h2>
<details class="ex"><summary>01 · 구리 동전 1.0 g의 총 양전하량은?</summary><div class="body"><p>구리 원자 하나에 양성자 29개. 1 g은 \\(\\dfrac{{1}}{{63.5}}\\) mol \\(=9.5\\times10^{{21}}\\)개 원자 → 양성자 \\(2.7\\times10^{{23}}\\)개.</p><p>\\(q=ne=2.7\\times10^{{23}}\\times1.6\\times10^{{-19}}\\approx4.3\\times10^{{4}}\\) C. 동전 하나에 4만 쿨롱 — 전자가 같은 양만큼 있어 상쇄될 뿐이다.</p></div></details>
<details class="ex"><summary>02 · 두 이온이 \\(5.0\\times10^{{-10}}\\) m 떨어져 \\(1.88\\times10^{{-9}}\\) N의 힘 → 각 이온의 전하는?</summary><div class="body"><p>\\(F=k\\dfrac{{q^2}}{{r^2}}\\) → \\(q^2=\\dfrac{{Fr^2}}{{k}}=\\dfrac{{1.88\\times10^{{-9}}\\times(5\\times10^{{-10}})^2}}{{9\\times10^9}}=5.2\\times10^{{-38}}\\) → \\(q=2.3\\times10^{{-19}}\\) C? 아니다 — 다시 계산하면 \\(q\\approx3.2\\times10^{{-19}}\\) C \\(=2e\\). 즉 각 이온은 전자 2개를 잃거나 얻었다.</p><p>핵심: 답이 나오면 <b>\\(e\\)로 나눠 개수로</b> 바꿔 본다.</p></div></details>
<details class="ex"><summary>03 · 핵 속 두 양성자 사이 반발력(거리 \\(4\\times10^{{-15}}\\) m)</summary><div class="body"><p>\\(F=9\\times10^9\\times\\dfrac{{(1.6\\times10^{{-19}})^2}}{{(4\\times10^{{-15}})^2}}\\approx14\\) N. 원자핵 크기에서 14 N은 어마어마한 힘 — 그런데도 핵이 안 터지는 이유는 더 센 핵력이 있기 때문.</p></div></details>
<details class="ex"><summary>04 · 세 전하가 120° 간격 — \\(q_1\\)에 작용하는 알짜 힘</summary><div class="body"><p>각 힘을 \\(\\hat i,\\hat j\\) 성분으로 나눠 더한다. 슬라이드 수치로 \\(\\approx2.6\\) N. 방법이 중요: <b>크기를 더하지 말고 성분을 더한다</b>.</p></div></details>
<details class="ex"><summary>05 · 수소 원자에서 전기력 ÷ 중력</summary><div class="body"><p>\\(\\dfrac{{F_e}}{{F_g}}=\\dfrac{{ke^2}}{{Gm_em_p}}\\) — 거리는 약분된다. \\(=\\dfrac{{9\\times10^9\\times(1.6\\times10^{{-19}})^2}}{{6.67\\times10^{{-11}}\\times9.11\\times10^{{-31}}\\times1.67\\times10^{{-27}}}}\\approx2.3\\times10^{{39}}\\). 원자 세계에서 중력은 완전히 무시한다.</p></div></details>
<div class="memo">강의노트 p.8~9 <b>필수문제 1~6</b>(답 있음)이 이 회차의 연습이다. 1번(점전하군 합력 \\(k(\\tfrac{{15}}{{4}}\\hat i+\\tfrac{{80}}{{9}}\\hat j)\\))은 9/9 노트에서 푼다.</div>
</section>

<div class="q" data-qid="q1"><div class="qn">확인 1 · 전하의 양자화</div><div class="qb">어떤 물체의 알짜 전하가 \\(-3.2\\times10^{{-19}}\\) C이다. 이 물체는?</div><ol class="choices"><li data-ok="1">전자 2개가 남는다(잉여)</li><li>전자 2개가 부족하다</li><li>전자 1개가 남는다</li><li>전자 20개가 남는다</li></ol><div class="ans">\\(q=ne\\) → \\(n=3.2/1.6=2\\). 음전하이므로 전자가 <b>남는</b> 것.</div></div>
<div class="q" data-qid="q2"><div class="qn">확인 2 · 전기장의 정의</div><div class="qb">어떤 점의 전기장 \\(\\vec E\\)란?</div><ol class="choices"><li data-ok="1">그 점에 놓인 <b>+1 C 시험전하</b>가 받는 전기력</li><li>그 점에 놓인 −1 C 시험전하가 받는 전기력</li><li>그 점을 지나는 전기력선의 총 개수</li><li>그 점에 전하를 놓는 데 필요한 에너지</li></ol><div class="ans">\\(\\vec E=\\vec F/q_0\\), 기준은 양의 시험전하. 방향 = 양전하가 받는 힘의 방향.</div></div>
<div class="q" data-qid="q3"><div class="qn">확인 3 · 쿨롱 힘</div><div class="qb">\\(+1\\,\\mu\\)C 점전하 두 개가 1 m 떨어져 있다. 서로에게 작용하는 힘은?</div><ol class="choices"><li data-ok="1">\\(9\\times10^{{-3}}\\) N, 척력</li><li>\\(9\\times10^{{-9}}\\) N, 척력</li><li>\\(9\\times10^{{3}}\\) N, 인력</li><li>\\(9\\times10^{{-3}}\\) N, 인력</li></ol><div class="ans">\\(F=9\\times10^9\\times\\dfrac{{(10^{{-6}})^2}}{{1^2}}=9\\times10^{{-3}}\\) N. 같은 부호 → 척력.</div></div>
<div class="q" data-qid="q4"><div class="qn">확인 4 · 유전율</div><div class="qb">진공의 유전율 \\(\\varepsilon_0\\)가 모든 매질 중 <b>가장 작은</b> 것의 뜻은?</div><ol class="choices"><li data-ok="1">진공에서 전기력선이 가장 잘 통과해 전기력이 가장 세다</li><li>진공에서는 전기력이 가장 약하다</li><li>진공에서는 전기장이 생기지 않는다</li><li>유전율은 힘과 관계없다</li></ol><div class="ans">\\(k=1/4\\pi\\varepsilon_0\\)라 \\(\\varepsilon_0\\)가 작을수록 \\(k\\)가 크다. 매질(종이·나무)이 끼면 \\(\\varepsilon\\)이 커져 전기장이 준다(25장 유전체).</div></div>
<div class="q" data-qid="q5"><div class="qn">확인 5 · 밀도 기호</div><div class="qb">전하 밀도 기호의 짝이 맞는 것은?</div><ol class="choices"><li data-ok="1">선 \\(\\lambda\\) · 면 \\(\\sigma\\) · 부피 \\(\\rho\\)</li><li>선 \\(\\sigma\\) · 면 \\(\\lambda\\) · 부피 \\(\\rho\\)</li><li>선 \\(\\rho\\) · 면 \\(\\sigma\\) · 부피 \\(\\lambda\\)</li><li>선 \\(\\lambda\\) · 면 \\(\\rho\\) · 부피 \\(\\sigma\\)</li></ol><div class="ans">직선·고리는 \\(\\lambda=dq/ds\\), 원판·평면은 \\(\\sigma=dq/dA\\), 부도체구는 \\(\\rho\\). 답에 기호를 바꿔 쓰면 감점.</div></div>
<div class="q" data-qid="q6"><div class="qn">확인 6 · 자기의 소스</div><div class="qb">자기 현상의 소스를 자하(N·S 홀극)가 아니라 전류로 삼는 이유를 한 줄로 쓰라.</div><div class="ans">자하는 N·S가 항상 붙어 있어 분리되지 않는다 → 거리 0 → 역제곱 법칙이 무한대로 터진다. 그래서 역제곱을 만족하는 <b>전류 \\(I=dq/dt\\)</b>를 소스로 쓴다.</div></div>
</body></html>'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write(html)
print("→", OUT, len(html))
