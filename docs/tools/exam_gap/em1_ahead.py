# -*- coding: utf-8 -*-
"""공업수학1 · 중간고사 대비 2 — 2.4 자유진동 · 2.7~2.10 비제차 · 3장 고계 선형 (교재 선행) 정리노트 v2 생성기
대표님 2026-09-30 「교재에 있는 개념으로 우선적으로 시험범위 내용 정리 … 나머지 과목들도」.
근거(§24 교수 자료 우선): 교수 슬라이드 제1장5절_제2장_2계선형ODE_이기영_61p(p.27~30 · 39~56) · 제3장_고계선형ODE_이기영_18p(p.3~18)
  → 순서·표기(y_h·y_p, Step 1 제차 일반해 → Step 2 비제차 특수해 → Step 3 초기조건 적용, 표 2.1, 기본·변형·합 규칙, ω₀·ω*·α·β, W_k)
  + 교재 Kreyszig 10판(2.4·2.7~2.10·3.1~3.3) 개념. 9/23 수업은 2.6(슬라이드 p.38)까지 — 그 뒤는 수업 전.
범위: 강의계획서 기준(4~7주차: 자유진동 · 오일러-코시 · 론스키안 · 비제차 · 강제진동·공진 · 고계 제차 · 고계 비제차). 시험 범위 공지는 없다.
2.9·2.10 은 강의계획서 주차표에 이름이 없지만 교수 슬라이드에 있고 3.3 이 2.10 매개변수변환법을 일반화해 쓰므로 넣었다.
문제는 교수 슬라이드 예제·교재 유형을 숫자만 바꿔 새로 만들고 em1_ahead_check.py(sympy 대입)로 전부 검산했다.
출력: study-materials/공업수학1/_정리노트/2026-09-30_공업수학1_중간대비_2.4-3장_교재선행.html → build_slides.py → 덱 em1-mid2"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *

OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\공업수학1\_정리노트\2026-09-30_공업수학1_중간대비_2.4-3장_교재선행.html"
FIGS = []

def fig(w, h, *parts, cap="", name=""):
    FIGS.append(name)
    s = canvas(w, h, *parts, cap=cap, name=name)
    s = s.replace('<svg class="fig-svg"', '<svg class="fig-svg" style="max-width:100%;height:auto"', 1)
    return s.replace("<figcaption>", '<figcaption style="font-size:.86em;opacity:.85;margin-top:4px">', 1)

def _spring():
    s = line(60, 30, 300, 30, INK, 3) + "".join(line(70 + 18 * k, 30, 60 + 18 * k, 20, GRAY, 1.2) for k in range(13))
    # 용수철(k) — 세로 지그재그
    s += wire((120, 30), (120, 44)) + resistor(120, 44, 120, 112, "k", lpos="l", body=58, n=10, amp=10) + wire((120, 112), (120, 124))
    # 감쇠기(c) — 실린더 + 피스톤
    s += wire((220, 30), (220, 62)) + rect(206, 62, 28, 34, INK, fill="#F1F3F5", sw=2, rx=2) + line(208, 84, 232, 84, INK, 3) + wire((220, 84), (220, 124))
    s += text(246, 86, "c", 13, INK)
    s += block(96, 124, 148, 44, "m")
    s += line(270, 146, 330, 146, GRAY, 1.2, "5 4") + text(338, 150, "평형 위치", 12, GRAY)
    s += arrow(300, 146, 300, 196, GREEN, "", 2) + text(308, 188, "y (아래로 +)", 13, GREEN)
    s += text(420, 50, "Hooke: F₁ = −ky", 13, INK, "middle") + text(420, 72, "감쇠력: F₂ = −cy'", 13, INK, "middle")
    s += text(420, 98, "my'' = F₁ + F₂", 13, INK, "middle", True) + text(420, 120, "→ my'' + cy' + ky = 0", 13, BLUE, "middle", True)
    return s
F_SPRING = fig(560, 206, _spring(), cap="평형 위치에서 잰 변위 \\(y\\). 용수철 복원력 \\(-ky\\), 감쇠력 \\(-cy'\\) → \\(my''+cy'+ky=0\\) (감쇠 없으면 \\(c=0\\)).", name="spring")

def _damp():
    X0, Y0, W, H = 60, 110, 440, 80
    s = arrow(X0, Y0, X0 + W + 14, Y0, INK, "", 1.5) + arrow(X0, 196, X0, 22, INK, "", 1.5)
    s += text(X0 + W + 10, Y0 + 18, "t", 13, INK, "end") + text(X0 - 8, 32, "y", 13, INK, "end")
    X = lambda t: X0 + t * W / 8; Y = lambda y: Y0 - H * y
    s += fplot(lambda t: 2 * math.exp(-0.5 * t) - math.exp(-2.0 * t), 0, 8, X, Y, 90, BLUE)
    s += fplot(lambda t: (1 + t) * math.exp(-t), 0, 8, X, Y, 90, GREEN)
    s += fplot(lambda t: math.exp(-0.35 * t) * math.cos(2.4 * t), 0, 8, X, Y, 160, RED)
    s += text(300, 52, "과감쇠 (c² > 4mk)", 13, BLUE) + text(300, 74, "임계감쇠 (c² = 4mk)", 13, GREEN) + text(300, 170, "저감쇠 (c² < 4mk)", 13, RED)
    return s
F_DAMP = fig(560, 206, _damp(), cap="같은 처음 변위에서 출발: 과감쇠·임계감쇠는 진동 없이 0으로, 저감쇠는 진폭이 \\(e^{-\\alpha t}\\)로 줄며 진동한다.", name="damp")

def _res():
    s = ""
    X0, Y0, W, H = 50, 105, 210, 70
    s += arrow(X0, Y0, X0 + W + 10, Y0, INK, "", 1.5) + arrow(X0, 185, X0, 20, INK, "", 1.5)
    s += text(X0 + W + 8, Y0 + 18, "t", 13, INK, "end") + text(X0 - 8, 30, "y", 13, INK, "end")
    X = lambda t: X0 + t * W / 25; Y = lambda y: Y0 - H * y / 25
    s += fplot(lambda t: t, 0, 25, X, Y, 20, GRAY, 1.2, "5 4") + fplot(lambda t: -t, 0, 25, X, Y, 20, GRAY, 1.2, "5 4")
    s += fplot(lambda t: t * math.sin(t * 2.0), 0, 25, X, Y, 400, RED)
    s += text(X0 + W / 2, 200, "공진 ω = ω₀: t sin ω₀t", 13, RED, "middle")
    X1 = 320
    s += arrow(X1, Y0, X1 + W + 10, Y0, INK, "", 1.5) + arrow(X1, 185, X1, 20, INK, "", 1.5)
    s += text(X1 + W + 8, Y0 + 18, "t", 13, INK, "end") + text(X1 - 8, 30, "y", 13, INK, "end")
    Xb = lambda t: X1 + t * W / 21; Yb = lambda y: Y0 - H * y / 2.1
    env = lambda t: 2 * math.sin(0.3 * t)
    s += fplot(env, 0, 21, Xb, Yb, 60, GRAY, 1.2, "5 4") + fplot(lambda t: -env(t), 0, 21, Xb, Yb, 60, GRAY, 1.2, "5 4")
    s += fplot(lambda t: math.cos(5.4 * t) - math.cos(6.0 * t), 0, 21, Xb, Yb, 700, BLUE, 1.6)
    s += text(X1 + W / 2, 200, "맥놀이 ω ≈ ω₀", 13, BLUE, "middle")
    return s
F_RES = fig(560, 210, _res(), cap="비감쇠 강제진동: 구동 주파수가 고유 주파수와 같으면 진폭이 \\(t\\)에 비례해 커지고(공진), 조금 다르면 진폭이 천천히 커졌다 작아진다(맥놀이).", name="res")

def _rlc():
    s = ""
    s += wire((90, 170), (90, 136)) + ac_source(90, 136, 90, 96, "E(t)", lpos="l") + wire((90, 96), (90, 50), (130, 50))
    s += resistor(130, 50, 210, 50, "R") + wire((210, 50), (250, 50)) + inductor(250, 50, 330, 50, "L") + wire((330, 50), (400, 50), (400, 84))
    s += capacitor(400, 84, 400, 130, "C") + wire((400, 130), (400, 170), (90, 170))
    s += current(140, 170, 190, 170, "I(t)", RED, lpos="b")
    return s
F_RLC = fig(470, 200, _rlc(), cap="RLC 직렬 회로. 전압법칙: \\(LI'+RI+\\frac1C\\int I\\,dt=E(t)\\) → 미분하면 \\(LI''+RI'+\\frac1CI=E'(t)\\).", name="rlc")

TABLE21 = r"""<table><tr><th>\(r(x)\)의 항</th><th>\(y_p\) 선택</th></tr>
<tr><td>\(ke^{\gamma x}\)</td><td>\(Ce^{\gamma x}\)</td></tr>
<tr><td>\(kx^n\ (n=0,1,\dots)\)</td><td>\(K_nx^n+\dots+K_1x+K_0\)</td></tr>
<tr><td>\(k\cos\omega x\), \(k\sin\omega x\)</td><td>\(K\cos\omega x+M\sin\omega x\)</td></tr>
<tr><td>\(ke^{\alpha x}\cos\omega x\), \(ke^{\alpha x}\sin\omega x\)</td><td>\(e^{\alpha x}(K\cos\omega x+M\sin\omega x)\)</td></tr></table>"""

HEAD = r"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>공업수학1 · 중간고사 대비 2 — 2.4 자유진동 · 2.7~2.10 비제차 · 3장 고계 선형 (교재 선행)</title>
<!-- 정리노트 v2. 생성기 docs/tools/exam_gap/em1_ahead.py → build_slides.py 로 덱 em1-mid2. 수업 전(9/23 수업이 2.6 p.38 까지, 2026-09-30) 교재 선행 정리.
     근거: 교수 슬라이드 제2장 p.27~30·39~56, 제3장 p.3~18 + Kreyszig 10판. 수업이 나가면 판서·녹음이 뼈대가 된다(지침 §24). -->
<style>body{font-family:Pretendard,"Malgun Gothic",sans-serif;max-width:900px;margin:24px auto;padding:0 16px;line-height:1.6}section{border-top:2px solid #333;padding-top:12px;margin-top:28px}h2 .no{display:inline-block;background:#1f2a44;color:#fff;font-size:13px;padding:2px 8px;border-radius:6px;margin-right:8px}h3 .tag{display:inline-block;font-size:12px;padding:1px 7px;border-radius:5px;margin-right:6px;background:#eee}.tag.c{background:#dbe7ff}.tag.b{background:#dff5e1}.tag.a{background:#ffe6cc}.why{background:#f6f6f6;padding:10px 12px;border-radius:8px}.one{border-left:4px solid #1f2a44;padding:6px 10px;margin:8px 0;background:#fafafa}.q{border:1px solid #ddd;border-radius:8px;padding:10px 12px;margin:10px 0}.qn{font-weight:700;color:#1f2a44}.choices li[data-ok]{font-weight:700}.mu{display:grid;grid-template-columns:1fr 1fr;gap:10px}.mu-mem{background:#fff8d6;padding:8px 10px;border-radius:8px}.mu-und{background:#e3efff;padding:8px 10px;border-radius:8px}.mu-h{font-weight:700;margin-bottom:4px}aside.exam{background:#ffe0ec;border-left:4px solid #d0397a;padding:6px 10px;margin:8px 0;font-size:14px}figure.fig{margin:10px 0}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 8px;font-size:14px}</style>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"><script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body,{delimiters:[{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true}]})"></script>
</head>
<body>
<h1>공업수학1 · 중간고사 대비 2 — 2.4 자유진동 · 2.7~2.10 비제차 · 3장 고계 선형 (교재 선행)</h1>
<p>이기영 교수 · 범위는 강의계획서 기준(4~7주차, 시험 범위 공지 없음) · 9/23 수업이 2.6(슬라이드 p.38)까지라 그 뒤를 <b>교수 슬라이드 순서와 표기</b>(Step 1 제차 일반해 → Step 2 비제차 특수해 → Step 3 초기조건 적용)대로 교재 개념으로 채웠다. 2.9·2.10은 강의계획서 주차표에 없지만 슬라이드에 있고 3.3이 2.10을 일반화해 쓴다.</p>
"""

P1 = r"""
<section>
  <h2><span class="no">파트 1 · 교재 선행</span>2.4 모델화: 자유진동 — 질량-용수철 시스템</h2>
  <h3><span class="tag c">개념</span>my'' + cy' + ky = 0 — c² 과 4mk 를 비교해 운동 모양이 갈린다</h3>
  <div class="why">2.2에서 배운 상수계수 2계 제차 ODE가 실제로 어디에 쓰이는지 보여 주는 절이다. 용수철에 매단 물체의 운동은 특성방정식의 근이 실근이냐 중근이냐 복소근이냐에 따라 전혀 다른 모양이 된다.</div>
  <div class="concept">
    <p><b>[물리 선수 개념]</b> 뉴턴 제2법칙: 질량 × 가속도 = 힘(\(my''=F\), \(y''\)는 변위를 시간으로 두 번 미분한 가속도). 훅의 법칙: 용수철 힘은 늘어난 길이에 비례하고 반대 방향(\(F=-ky\), \(k\): 용수철 상수).</p>
    <p><b>정적 평형</b>: 물체를 매달면 용수철이 \(s_0\)만큼 늘어나 멈춘다. 용수철 힘 \(F_0=-ks_0\)와 무게 \(W=mg\)가 맞선다: \(F_0+W=-ks_0+mg=0\). 그래서 변위 \(y\)를 <b>평형 위치에서</b> 재면 무게와 \(ks_0\)가 서로 지워진다.</p>
    @@F_SPRING@@
    <p><b>비감쇠</b>(\(c=0\)): 복원력 \(F_1=-ky\), \(my''=F_1\) → \[my''+ky=0\] 특성방정식 \(m\lambda^2+k=0\) → \(\lambda=\pm i\omega_0\), \(\omega_0=\sqrt{k/m}\). 해 \(y(t)=A\cos\omega_0t+B\sin\omega_0t=C\cos(\omega_0t-\delta)\) — 조화진동. \(C=\sqrt{A^2+B^2}\)(진폭), \(\tan\delta=B/A\).</p>
    <p><b>[보충] 복소근 → 삼각함수</b>: 2.2에서 본 것처럼 \(\lambda=\pm i\omega_0\)이면 오일러 공식 \(e^{i\theta}=\cos\theta+i\sin\theta\) 때문에 실수 해 \(\cos\omega_0t\), \(\sin\omega_0t\)가 기저가 된다. 고유 주파수는 \(\omega_0/2\pi\)(1초에 몇 번 흔들리나).</p>
    <p><b>감쇠</b>: 속도에 비례해 운동을 방해하는 감쇠력 \(F_2=-cy'\)(\(c&gt;0\): 감쇠 상수). \(my''=F_1+F_2\) → \[my''+cy'+ky=0\] 양변을 \(m\)으로 나눈 특성방정식 \(\lambda^2+\frac cm\lambda+\frac km=0\)의 근은 \(\lambda_{1,2}=-\alpha\pm\beta\), \(\alpha=\dfrac{c}{2m}\), \(\beta=\dfrac{\sqrt{c^2-4mk}}{2m}\).</p>
    <p><b>과감쇠</b> \(c^2&gt;4mk\)(서로 다른 실근): \(y=c_1e^{-(\alpha-\beta)t}+c_2e^{-(\alpha+\beta)t}\). 두 지수가 모두 음수라 진동 없이 0으로 간다.</p>
    <p><b>임계감쇠</b> \(c^2=4mk\)(실중근 \(\lambda=-\alpha\)): \(y=(c_1+c_2t)e^{-\alpha t}\). 진동하지 않는 경계로, 진동 없이 가장 빨리 평형으로 돌아온다.</p>
    <p><b>저감쇠</b> \(c^2&lt;4mk\)(복소근 \(\lambda=-\alpha\pm i\omega^*\)): \(y=e^{-\alpha t}(A\cos\omega^*t+B\sin\omega^*t)=Ce^{-\alpha t}\cos(\omega^*t-\delta)\), \(\omega^*=\dfrac{\sqrt{4mk-c^2}}{2m}=\sqrt{\dfrac km-\dfrac{c^2}{4m^2}}\). 진폭이 \(e^{-\alpha t}\)로 줄며 진동한다.</p>
    @@F_DAMP@@
  </div>
  <div class="one">한 줄: \(my''+cy'+ky=0\) · 비감쇠 \(\omega_0=\sqrt{k/m}\), \(y=C\cos(\omega_0t-\delta)\) · \(c^2\gtrless4mk\)로 과감쇠·임계감쇠·저감쇠.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>\(my''+cy'+ky=0\), \(\omega_0^2=k/m\)</li><li>\(\alpha=\dfrac{c}{2m}\), \(\beta=\dfrac{\sqrt{c^2-4mk}}{2m}\)</li><li>과감쇠 \(c^2&gt;4mk\) · 임계 \(c^2=4mk\) · 저감쇠 \(c^2&lt;4mk\) 의 해 모양 셋</li><li>\(\omega^*=\sqrt{k/m-c^2/4m^2}\)</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>평형 위치에서 재면 무게가 식에서 사라지는 이유</li><li>특성근의 종류(2.2)가 곧 운동의 종류인 것</li><li>\(A\cos+B\sin\)을 \(C\cos(\omega t-\delta)\) 하나로 합치는 이유(진폭이 보인다)</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 1-1 · 고유 각진동수</div><p>질량 \(m=2\) kg인 물체가 용수철 상수 \(k=8\) N/m인 용수철에 매달려 감쇠 없이 진동한다. \(\omega_0\)는?</p><ol class="choices"><li data-ok="1">2 rad/s</li><li>4 rad/s</li><li>16 rad/s</li><li>0.5 rad/s</li></ol><details><summary>답</summary><div class="ans">\(\omega_0=\sqrt{k/m}=\sqrt{8/2}=\sqrt4=2\) rad/s. 제곱근을 빼먹으면 4가 나온다. 주기는 \(2\pi/\omega_0=\pi\) s.</div></details></div>
  <div class="q"><div class="qn">기초 1-2 · 감쇠 판별</div><p>\(m=1\), \(k=4\), \(c=5\)인 감쇠 진동 \(y''+5y'+4y=0\)의 운동 종류는?</p><ol class="choices"><li data-ok="1">과감쇠</li><li>임계감쇠</li><li>저감쇠</li><li>비감쇠</li></ol><details><summary>답</summary><div class="ans">\(c^2=25\), \(4mk=16\) → \(c^2&gt;4mk\) → 과감쇠. 특성근 \(\lambda^2+5\lambda+4=(\lambda+1)(\lambda+4)=0\) → \(-1,-4\) 서로 다른 음의 실근 ✓.</div></details></div>
  <div class="q"><div class="qn">기초 1-3 · 임계 감쇠 상수</div><p>\(m=1\), \(k=4\)인 질량-용수철 시스템이 임계감쇠가 되는 감쇠 상수 \(c\)는?</p><ol class="choices"><li data-ok="1">4</li><li>2</li><li>16</li><li>8</li></ol><details><summary>답</summary><div class="ans">임계감쇠 \(c^2=4mk=16\) → \(c=4\)(\(c&gt;0\)). 16은 \(c^2\)이다.</div></details></div>
  <div class="q"><div class="qn">기초 1-4 · 저감쇠의 해</div><p>\(y''+2y'+5y=0\)의 일반해는?</p><ol class="choices"><li data-ok="1">\(e^{-t}(A\cos2t+B\sin2t)\)</li><li>\(e^{-2t}(A\cos t+B\sin t)\)</li><li>\(Ae^{-t}+Be^{-5t}\)</li><li>\((A+Bt)e^{-t}\)</li></ol><details><summary>답</summary><div class="ans">\(\lambda^2+2\lambda+5=0\) → \(\lambda=\dfrac{-2\pm\sqrt{4-20}}{2}=-1\pm2i\). 실수부 \(-1\)이 감쇠(\(\alpha=1\)), 허수부 2가 \(\omega^*\). 공식으로도 \(\omega^*=\sqrt{5-1}=2\) ✓.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 1-1 · 비감쇠 초기값 문제</div><p>\(m=2\) kg, \(k=8\) N/m인 비감쇠 질량-용수철 시스템에서 처음 변위 \(y(0)=0.1\) m, 처음 속도 \(y'(0)=0.4\) m/s이다. \(y(t)\)와 진폭을 구하라.</p><details><summary>답</summary><div class="ans">Step 1 일반해: \(2y''+8y=0\) → \(\omega_0=2\), \(y=A\cos2t+B\sin2t\). Step 2 특수해(초기조건 적용): \(y(0)=A=0.1\). \(y'=-2A\sin2t+2B\cos2t\) → \(y'(0)=2B=0.4\) → \(B=0.2\). ∴ \(y=0.1\cos2t+0.2\sin2t\). 진폭 \(C=\sqrt{0.1^2+0.2^2}=\sqrt{0.05}\approx0.22\) m.</div></details></div>
  <div class="q"><div class="qn a">응용 1-2 · 임계감쇠 초기값 문제</div><p>\(y''+4y'+4y=0\), \(y(0)=1\), \(y'(0)=0\)을 풀고 운동 종류를 쓰라.</p><details><summary>답</summary><div class="ans">Step 1 일반해: \(\lambda^2+4\lambda+4=(\lambda+2)^2=0\) → 중근 \(-2\) → 임계감쇠(\(c^2=16=4mk\)). \(y=(c_1+c_2t)e^{-2t}\). Step 2 특수해(초기조건 적용): \(y(0)=c_1=1\). \(y'=c_2e^{-2t}-2(c_1+c_2t)e^{-2t}\) → \(y'(0)=c_2-2c_1=0\) → \(c_2=2\). ∴ \(y=(1+2t)e^{-2t}\) — 진동 없이 0으로 간다.</div></details></div>
</section>
"""

P2 = r"""
<section>
  <h2><span class="no">파트 2 · 교재 선행</span>2.7 비제차 상미분방정식 — 미정계수법</h2>
  <h3><span class="tag c">개념</span>일반해 = 제차 일반해 y_h + 특수해 y_p — y_p 는 표 2.1로 모양을 정하고 계수를 맞춘다</h3>
  <div class="why">지금까지는 오른쪽이 0인 제차 방정식만 풀었다. 오른쪽에 \(r(x)\)(외부 입력)가 붙으면 비제차다. 풀이는 두 조각: 입력이 없을 때의 답 \(y_h\) + 입력 때문에 생기는 답 하나 \(y_p\).</div>
  <div class="concept">
    <p><b>비제차 선형 ODE</b>: \(y''+p(x)y'+q(x)y=r(x)\), \(r(x)\neq0\). \(r(x)\)가 0이면 제차(2.1~2.6).</p>
    <p><b>해 사이의 관계(교수님 슬라이드)</b>: ① 비제차의 두 해의 차는 제차의 해다(빼면 \(r\)이 지워진다). ② 비제차의 해 + 제차의 해 = 비제차의 해.</p>
    <p><b>정의) 일반해</b>: \[y(x)=y_h(x)+y_p(x)\] \(y_h=c_1y_1+c_2y_2\)는 제차 방정식의 일반해, \(y_p\)는 임의의 상수를 포함하지 않는 비제차 방정식의 해 하나.</p>
    <p><b>미정계수법</b>: <b>상수계수</b> 방정식 \(y''+ay'+by=r(x)\)에서 \(r(x)\)가 지수·다항식·사인·코사인과 그 곱이면, \(y_p\)도 같은 꼴에 모르는 계수를 붙여 가정하고 원식에 넣어 계수를 맞춘다. 표 2.1(교수님 슬라이드):</p>
    @@TABLE21@@
    <p><b>선택 규칙 셋</b> ① <b>기본 규칙</b>: \(r(x)\)가 표의 왼쪽 함수면 오른쪽 꼴로 \(y_p\)를 잡는다. ② <b>변형 규칙</b>: 잡은 \(y_p\)의 항이 제차 해와 겹치면 \(x\)를 곱한다(특성방정식의 이중근과 겹치면 \(x^2\)). ③ <b>합 규칙</b>: \(r(x)\)가 여러 항의 합이면 각각의 \(y_p\)를 더한다.</p>
    <p><b>예(기본 규칙)</b>: \(y''-3y'+2y=4x\). Step 1 제차 일반해: \(\lambda^2-3\lambda+2=(\lambda-1)(\lambda-2)=0\) → \(y_h=c_1e^x+c_2e^{2x}\). Step 2 비제차 특수해: \(r=4x\)(1차 다항식) → \(y_p=K_1x+K_0\), \(y_p'=K_1\), \(y_p''=0\).</p>
    <p>원식에 대입: \(0-3K_1+2(K_1x+K_0)=4x\) → \(x\)의 계수 \(2K_1=4\) → \(K_1=2\), 상수항 \(-3K_1+2K_0=0\) → \(K_0=3\). ∴ \(y=c_1e^x+c_2e^{2x}+2x+3\).</p>
    <p><b>예(변형 규칙)</b>: \(y''-3y'+2y=e^x\). 표대로 \(Ce^x\)를 잡으면 \(e^x\)가 이미 \(y_h\)에 있어 대입하면 0이 된다 → \(y_p=Cxe^x\). \(y_p'=C(1+x)e^x\), \(y_p''=C(2+x)e^x\) → 대입 \(C[(2+x)-3(1+x)+2x]e^x=-Ce^x=e^x\) → \(C=-1\), \(y_p=-xe^x\).</p>
  </div>
  <div class="one">한 줄: \(y=y_h+y_p\) · 표 2.1로 \(y_p\) 모양 · 겹치면 \(x\)(이중근이면 \(x^2\))를 곱한다 · 합이면 따로 구해 더한다 · Step 1 → 2 → 3.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>\(y=y_h+y_p\)</li><li>표 2.1 네 줄: \(e^{\gamma x}\) · \(x^n\) · \(\cos,\sin\) · \(e^{\alpha x}\cos,\sin\)</li><li>기본·변형(\(x\), 이중근 \(x^2\))·합 규칙</li><li>풀이 형식 Step 1 제차 일반해 → Step 2 비제차 특수해 → Step 3 초기조건 적용</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>두 비제차 해의 차가 제차 해인 이유(선형성)</li><li>겹치는 항을 그대로 쓰면 대입했을 때 0이 되는 이유</li><li>초기조건은 \(y_h+y_p\) 전체에 적용해야 하는 이유</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 2-1 · 기본 규칙</div><p>\(y''+y=5e^{3x}\)에서 미정계수법으로 잡을 \(y_p\)의 꼴은?</p><ol class="choices"><li data-ok="1">\(Ce^{3x}\)</li><li>\(Cxe^{3x}\)</li><li>\(C\cos3x+M\sin3x\)</li><li>\(K_1x+K_0\)</li></ol><details><summary>답</summary><div class="ans">제차 해는 \(\cos x,\sin x\)라 \(e^{3x}\)와 겹치지 않는다 → 기본 규칙 \(Ce^{3x}\). 대입하면 \(9C+C=5\) → \(C=\frac12\).</div></details></div>
  <div class="q"><div class="qn">기초 2-2 · 변형 규칙</div><p>\(y''-y'-2y=3e^{2x}\)의 특수해 \(y_p\)는?</p><ol class="choices"><li data-ok="1">\(xe^{2x}\)</li><li>\(e^{2x}\)</li><li>\(x^2e^{2x}\)</li><li>\(3e^{2x}\)</li></ol><details><summary>답</summary><div class="ans">특성근 \(\lambda^2-\lambda-2=(\lambda-2)(\lambda+1)=0\) → 2, −1. \(e^{2x}\)가 제차 해(단순근) → \(y_p=Cxe^{2x}\). \(y_p'=C(1+2x)e^{2x}\), \(y_p''=C(4+4x)e^{2x}\) → 대입 \(C[(4+4x)-(1+2x)-2x]e^{2x}=3Ce^{2x}=3e^{2x}\) → \(C=1\).</div></details></div>
  <div class="q"><div class="qn">기초 2-3 · 합 규칙</div><p>\(y''+3y'+2y=4e^x+2x\)에서 잡을 \(y_p\)의 꼴은?</p><ol class="choices"><li data-ok="1">\(Ce^x+K_1x+K_0\)</li><li>\(Ce^x+K_1x\)</li><li>\(Cxe^x+K_1x+K_0\)</li><li>\((K_1x+K_0)e^x\)</li></ol><details><summary>답</summary><div class="ans">\(r\)이 \(4e^x\)와 \(2x\)의 합 → 각각 \(Ce^x\), \(K_1x+K_0\)(1차 다항식은 상수항까지)을 더한다. 특성근 −1, −2라 겹침 없음.</div></details></div>
  <div class="q"><div class="qn">기초 2-4 · 초기조건은 어디에</div><p>비제차 초기값 문제에서 초기조건 \(y(0),y'(0)\)을 넣는 대상은?</p><ol class="choices"><li data-ok="1">일반해 \(y=y_h+y_p\) 전체</li><li>제차 해 \(y_h\)만</li><li>특수해 \(y_p\)만</li><li>원래 방정식의 \(r(x)\)</li></ol><details><summary>답</summary><div class="ans">초기조건은 실제 운동 \(y\)에 대한 조건이라 \(y_h+y_p\) 전체에 넣어 \(c_1,c_2\)를 정한다(교수님 Step 3). \(y_h\)에만 넣으면 \(y_p\)의 값이 빠져 틀린다.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 2-1 · Step 1~3</div><p>\(y''+4y=8x^2\), \(y(0)=0\), \(y'(0)=2\)를 풀어라.</p><details><summary>답</summary><div class="ans">Step 1 제차 일반해: \(\lambda^2+4=0\) → \(\pm2i\) → \(y_h=A\cos2x+B\sin2x\). Step 2 비제차 특수해: \(y_p=K_2x^2+K_1x+K_0\) → \(y_p''=2K_2\) → \(2K_2+4(K_2x^2+K_1x+K_0)=8x^2\) → \(K_2=2\), \(K_1=0\), \(2K_2+4K_0=0\) → \(K_0=-1\) → \(y_p=2x^2-1\). Step 3 초기조건 적용: \(y(0)=A-1=0\) → \(A=1\), \(y'(0)=2B=2\) → \(B=1\). ∴ \(y=\cos2x+\sin2x+2x^2-1\).</div></details></div>
  <div class="q"><div class="qn a">응용 2-2 · 이중근과 겹칠 때</div><p>\(y''-4y'+4y=6e^{2x}\)의 일반해를 구하라.</p><details><summary>답</summary><div class="ans">Step 1: \((\lambda-2)^2=0\) → 이중근 2 → \(y_h=(c_1+c_2x)e^{2x}\). Step 2: \(e^{2x}\)도 \(xe^{2x}\)도 제차 해 → 변형 규칙(이중근)으로 \(y_p=Cx^2e^{2x}\). \(y_p'=C(2x+2x^2)e^{2x}\), \(y_p''=C(2+8x+4x^2)e^{2x}\) → 대입 \(C[(2+8x+4x^2)-4(2x+2x^2)+4x^2]e^{2x}=2Ce^{2x}=6e^{2x}\) → \(C=3\). ∴ \(y=(c_1+c_2x)e^{2x}+3x^2e^{2x}\).</div></details></div>
  <div class="q"><div class="qn a">응용 2-3 · 합 규칙 계산</div><p>\(y''+3y'+2y=4e^x+2x\)의 특수해 \(y_p\)를 구하라.</p><details><summary>답</summary><div class="ans">\(y_p=Ce^x+K_1x+K_0\). ① \(e^x\) 부분: \((1+3+2)C=6C=4\) → \(C=\frac23\). ② 다항식 부분: \(3K_1+2(K_1x+K_0)=2x\) → \(2K_1=2\) → \(K_1=1\), \(3K_1+2K_0=0\) → \(K_0=-\frac32\). ∴ \(y_p=\frac23e^x+x-\frac32\).</div></details></div>
</section>
"""

P3 = r"""
<section>
  <h2><span class="no">파트 3 · 교재 선행</span>2.8 강제진동 · 공진 · 맥놀이 + 2.9 RLC 회로</h2>
  <h3><span class="tag c">개념</span>my'' + cy' + ky = F₀cos ωt — 입력 주파수가 고유 주파수에 가까울수록 크게 흔들린다</h3>
  <div class="why">2.4의 용수철에 바깥에서 주기적으로 힘을 주면(강제진동) 방정식이 비제차가 된다. 2.7의 미정계수법으로 \(y_p\)를 구하면 공진·맥놀이 같은 현상이 식에서 바로 보인다. 전기 회로(RLC)도 똑같은 방정식이다.</div>
  <div class="concept">
    <p><b>자유운동</b>(외력 없음): \(my''+cy'+ky=0\). <b>강제운동</b>(외력 있음): \(my''+cy'+ky=r(t)\). \(r(t)\) = 입력(구동력), \(y(t)\) = 출력(시스템의 응답).</p>
    <p><b>주기적인 외력</b> \(r(t)=F_0\cos\omega t\)(감쇠가 있거나 \(\omega\neq\omega_0\)일 때): 미정계수법으로 \(y_p=a\cos\omega t+b\sin\omega t\), \[a=F_0\frac{m(\omega_0^2-\omega^2)}{m^2(\omega_0^2-\omega^2)^2+\omega^2c^2},\qquad b=F_0\frac{\omega c}{m^2(\omega_0^2-\omega^2)^2+\omega^2c^2}\]</p>
    <p><b>비감쇠</b>(\(c=0\), \(\omega\neq\omega_0\)): \(y_p=\dfrac{F_0}{m(\omega_0^2-\omega^2)}\cos\omega t\), 일반해 \(y=C\cos(\omega_0t-\delta)+\dfrac{F_0}{m(\omega_0^2-\omega^2)}\cos\omega t\) — 고유 진동(주파수 \(\omega_0/2\pi\))과 구동 진동(\(\omega/2\pi\))의 중첩.</p>
    <p><b>공진</b> \(\omega=\omega_0\): 분모가 0이 되어 위 \(y_p\)를 쓸 수 없다. \(\cos\omega_0t\)가 제차 해와 겹치므로 변형 규칙(\(t\) 곱)으로 \(y_p=\dfrac{F_0}{2m\omega_0}t\sin\omega_0t\) — 진폭이 \(t\)에 비례해 끝없이 커진다.</p>
    <p><b>맥놀이</b>(\(\omega\)가 \(\omega_0\)에 가깝지만 다를 때, 처음 정지 \(y(0)=y'(0)=0\)): \(y=\dfrac{F_0}{m(\omega_0^2-\omega^2)}(\cos\omega t-\cos\omega_0t)=\dfrac{2F_0}{m(\omega_0^2-\omega^2)}\sin\dfrac{(\omega_0+\omega)t}{2}\sin\dfrac{(\omega_0-\omega)t}{2}\) — 빠른 진동의 진폭이 느린 사인으로 커졌다 작아졌다 한다.</p>
    @@F_RES@@
    <p><b>감쇠 강제진동</b>: 일반해 = <b>과도해</b> \(y_h\)(시간이 지나면 0으로 사라짐) + <b>정상상태해</b> \(y_p\)(계속 남는 진동). 결국 \(y\to y_p\).</p>
    <p><b>2.9 RLC 회로</b>(일물2 27장 전압법칙과 같은 법칙): 저항 \(R\)의 전압 강하 \(RI\), 인덕터(코일 — 전류가 변하는 것을 막는 소자, 물리 30장) \(L\)은 \(L\dfrac{dI}{dt}\), 축전기 \(C\)는 \(\dfrac QC=\dfrac1C\int I\,dt\). 한 바퀴 합 = 기전력 \(E(t)\).</p>
    @@F_RLC@@
    <p><b>RLC 식</b>: \(LI''+RI'+\dfrac1CI=E'(t)\). \(E=E_0\sin\omega t\)이면 오른쪽 \(E_0\omega\cos\omega t\). 정상상태 전류 \(I_p=a\cos\omega t+b\sin\omega t\), \(a=\dfrac{-E_0S}{R^2+S^2}\), \(b=\dfrac{E_0R}{R^2+S^2}\), 리액턴스 \(S=\omega L-\dfrac1{\omega C}\), 진폭 \(I_0=\dfrac{E_0}{\sqrt{R^2+S^2}}\)(\(\sqrt{R^2+S^2}\) = 임피던스).</p>
    <p><b>상사성</b>: 전기 ↔ 역학이 같은 방정식이다. \(L\leftrightarrow m\) · \(R\leftrightarrow c\) · \(1/C\leftrightarrow k\) · \(E_0\omega\cos\omega t\leftrightarrow F_0\cos\omega t\) · 전류 \(I\leftrightarrow\) 변위 \(y\).</p>
  </div>
  <div class="one">한 줄: 강제진동 \(y_p=a\cos\omega t+b\sin\omega t\) · 비감쇠 \(\frac{F_0}{m(\omega_0^2-\omega^2)}\cos\omega t\) · 공진 \(\frac{F_0}{2m\omega_0}t\sin\omega_0t\) · 과도해 → 정상상태해 · RLC ↔ 질량-용수철.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>비감쇠 \(y_p=\dfrac{F_0}{m(\omega_0^2-\omega^2)}\cos\omega t\)</li><li>공진 \(\omega=\omega_0\): \(y_p=\dfrac{F_0}{2m\omega_0}t\sin\omega_0t\)</li><li>과도해 = \(y_h\), 정상상태해 = \(y_p\)</li><li>RLC: \(LI''+RI'+I/C=E'(t)\), \(S=\omega L-\frac1{\omega C}\), \(I_0=E_0/\sqrt{R^2+S^2}\)</li><li>상사: \(L\)–\(m\), \(R\)–\(c\), \(1/C\)–\(k\)</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>공진에서 \(t\)가 곱해지는 이유(변형 규칙)</li><li>맥놀이가 두 진동의 합에서 생기는 이유</li><li>감쇠가 있으면 과도해가 사라지는 이유(\(e^{-\alpha t}\))</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 3-1 · 비감쇠 강제진동</div><p>\(y''+9y=16\cos t\)의 특수해 \(y_p\)는? (\(m=1\), \(\omega_0=3\), \(\omega=1\))</p><ol class="choices"><li data-ok="1">\(2\cos t\)</li><li>\(16\cos t\)</li><li>\(\frac{16}{9}\cos t\)</li><li>\(8t\sin t\)</li></ol><details><summary>답</summary><div class="ans">\(y_p=\dfrac{F_0}{m(\omega_0^2-\omega^2)}\cos\omega t=\dfrac{16}{1\cdot(9-1)}\cos t=2\cos t\). 검산: \(-2\cos t+18\cos t=16\cos t\) ✓.</div></details></div>
  <div class="q"><div class="qn">기초 3-2 · 공진</div><p>\(y''+4y=8\cos2t\)의 특수해는?</p><ol class="choices"><li data-ok="1">\(2t\sin2t\)</li><li>\(2\cos2t\)</li><li>\(\frac{8}{3}\cos2t\)</li><li>\(4t\cos2t\)</li></ol><details><summary>답</summary><div class="ans">\(\omega=\omega_0=2\) → 공진. \(y_p=\dfrac{F_0}{2m\omega_0}t\sin\omega_0t=\dfrac{8}{2\cdot1\cdot2}t\sin2t=2t\sin2t\). 진폭 \(2t\)가 시간에 비례해 커진다.</div></details></div>
  <div class="q"><div class="qn">기초 3-3 · 과도해와 정상상태해</div><p>감쇠가 있는 강제진동 \(my''+cy'+ky=F_0\cos\omega t\)(\(c&gt;0\))에서 충분히 시간이 지난 뒤 남는 것은?</p><ol class="choices"><li data-ok="1">정상상태해 \(y_p\)</li><li>과도해 \(y_h\)</li><li>\(y_h\)와 \(y_p\) 둘 다 0</li><li>처음 변위 \(y(0)\)</li></ol><details><summary>답</summary><div class="ans">\(y_h\)는 \(e^{-\alpha t}\)가 붙어 0으로 사라지는 과도해, \(y_p\)는 외력과 같은 주파수로 계속 남는 정상상태해.</div></details></div>
  <div class="q"><div class="qn">기초 3-4 · 상사성</div><p>RLC 회로 \(LI''+RI'+\frac1CI=E'(t)\)와 \(my''+cy'+ky=r(t)\)를 비교할 때 저항 \(R\)에 대응하는 것은?</p><ol class="choices"><li data-ok="1">감쇠 상수 \(c\)</li><li>질량 \(m\)</li><li>용수철 상수 \(k\)</li><li>변위 \(y\)</li></ol><details><summary>답</summary><div class="ans">같은 자리의 계수끼리: \(L\leftrightarrow m\)(2계 미분 앞), \(R\leftrightarrow c\)(1계 미분 앞, 에너지를 열로 버림), \(1/C\leftrightarrow k\).</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 3-1 · 감쇠 강제진동의 정상상태</div><p>\(y''+2y'+5y=10\cos t\)의 정상상태해를 구하고 그 진폭을 구하라.</p><details><summary>답</summary><div class="ans">\(m=1\), \(c=2\), \(k=5\) → \(\omega_0^2=5\), \(\omega=1\), \(F_0=10\). 분모 \(m^2(\omega_0^2-\omega^2)^2+\omega^2c^2=16+4=20\). \(a=10\cdot\dfrac{1\cdot4}{20}=2\), \(b=10\cdot\dfrac{1\cdot2}{20}=1\) → \(y_p=2\cos t+\sin t\). 검산(직접 대입): \(y_p''=-2\cos t-\sin t\), \(2y_p'=-4\sin t+2\cos t\), \(5y_p=10\cos t+5\sin t\) → 합 \(10\cos t\) ✓. 진폭 \(\sqrt{2^2+1^2}=\sqrt5\).</div></details></div>
  <div class="q" data-def="R,L"><div class="qn a">응용 3-2 · RLC 정상상태 전류</div><p>\(R=4\ \Omega\), \(L=1\) H, 전기 용량 \(C=\frac13\) F, 기전력 \(E(t)=10\sin t\) V인 RLC 직렬 회로의 정상상태 전류 \(I_p\)와 진폭 \(I_0\)를 구하라.</p><details><summary>답</summary><div class="ans">① \(\omega=1\), \(E_0=10\). 리액턴스 \(S=\omega L-\dfrac1{\omega C}=1-3=-2\). ② \(R^2+S^2=16+4=20\). ③ \(a=\dfrac{-E_0S}{R^2+S^2}=\dfrac{20}{20}=1\), \(b=\dfrac{E_0R}{R^2+S^2}=\dfrac{40}{20}=2\) → \(I_p=\cos t+2\sin t\). ④ \(I_0=\dfrac{E_0}{\sqrt{R^2+S^2}}=\dfrac{10}{\sqrt{20}}=\sqrt5\) A(\(=\sqrt{1^2+2^2}\) ✓). 검산: \(I''+4I'+3I=10\cos t\) 에 넣으면 성립.</div></details></div>
</section>
"""

P4 = r"""
<section>
  <h2><span class="no">파트 4 · 교재 선행</span>2.10 매개변수변환법 — 어떤 r(x)에도 쓰는 공식</h2>
  <h3><span class="tag c">개념</span>y_p = −y₁∫(y₂r/W)dx + y₂∫(y₁r/W)dx — 표준형에서만</h3>
  <div class="why">미정계수법은 \(r(x)\)가 표 2.1에 있는 함수일 때만 된다. \(\sec x\), \(\csc x\), \(e^x/x\)처럼 표에 없는 입력이면 매개변수변환법(변수변분법)을 쓴다. 대신 적분 계산이 따라온다.</div>
  <div class="concept">
    <p><b>적용 조건</b>: 구간 \(I\)에서 연속인 \(p(x),q(x),r(x)\)를 갖는 \(y''+p(x)y'+q(x)y=r(x)\). 반드시 <b>표준형</b>(\(y''\)의 계수가 1)으로 쓴 뒤 적용한다 — \(x^2y''+\dots\)이면 먼저 \(x^2\)으로 나눈다.</p>
    <p><b>아이디어</b>: 제차 일반해 \(y_h=c_1y_1+c_2y_2\)의 상수 \(c_1,c_2\)를 함수 \(u(x),v(x)\)로 바꿔 \(y_p=u(x)y_1+v(x)y_2\)로 놓는다. 조건 \(u'y_1+v'y_2=0\)을 붙이고 원식에 넣으면 \(u'y_1'+v'y_2'=r(x)\).</p>
    <p><b>연립해서</b>(크래머, 분모가 론스키안 \(W=y_1y_2'-y_2y_1'\)): \(u'=-\dfrac{y_2r}{W}\), \(v'=\dfrac{y_1r}{W}\) → \[y_p(x)=-y_1\int\frac{y_2r}{W}dx+y_2\int\frac{y_1r}{W}dx\] 적분상수는 붙이지 않는다(\(y_h\)에 이미 들어 있다).</p>
    <p><b>예</b>: \(y''+y=\csc x\)(\(\sin x\neq0\)인 구간). 기저 \(y_1=\cos x\), \(y_2=\sin x\), \(W=\cos^2x+\sin^2x=1\). \(y_p=-\cos x\int\sin x\csc x\,dx+\sin x\int\cos x\csc x\,dx=-\cos x\int1\,dx+\sin x\int\cot x\,dx=-x\cos x+\sin x\ln|\sin x|\).</p>
    <p><b>[보충] 적분</b>: \(\int\cot x\,dx=\ln|\sin x|\)(분모 \(\sin x\)의 미분이 분자 \(\cos x\)), \(\int\tan x\,dx=-\ln|\cos x|\).</p>
  </div>
  <div class="one">한 줄: 표준형 · \(W=y_1y_2'-y_2y_1'\) · \(y_p=-y_1\int\frac{y_2r}{W}dx+y_2\int\frac{y_1r}{W}dx\) · 적분상수 없음.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>\(y_p=-y_1\int\dfrac{y_2r}{W}dx+y_2\int\dfrac{y_1r}{W}dx\) (앞 항이 −)</li><li>\(W=y_1y_2'-y_2y_1'\)</li><li>표준형(\(y''\) 계수 1)에서만</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>상수를 함수로 바꾼다는 이름의 뜻</li><li>\(u'y_1+v'y_2=0\) 조건을 붙이는 이유(2계 도함수가 생기지 않게)</li><li>미정계수법과 언제 무엇을 쓰는지</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 4-1 · 어느 방법</div><p>\(y''+4y=\sec2x\)의 특수해를 구하려 한다. 알맞은 방법은?</p><ol class="choices"><li data-ok="1">매개변수변환법 — \(\sec2x\)는 표 2.1에 없다</li><li>미정계수법 — \(y_p=K\sec2x\)</li><li>미정계수법 — \(y_p=K\cos2x+M\sin2x\)</li><li>차수축소법만 쓸 수 있다</li></ol><details><summary>답</summary><div class="ans">\(\sec2x=1/\cos2x\)는 미분할수록 새 꼴(\(\sec\tan\) …)이 생겨 유한 개의 계수로 맞출 수 없다 → 매개변수변환법.</div></details></div>
  <div class="q"><div class="qn">기초 4-2 · 론스키안</div><p>\(y''+4y=0\)의 기저 \(y_1=\cos2x\), \(y_2=\sin2x\)의 론스키안은?</p><ol class="choices"><li data-ok="1">2</li><li>1</li><li>\(\cos4x\)</li><li>0</li></ol><details><summary>답</summary><div class="ans">\(W=y_1y_2'-y_2y_1'=\cos2x\cdot2\cos2x-\sin2x\cdot(-2\sin2x)=2(\cos^22x+\sin^22x)=2\).</div></details></div>
  <div class="q"><div class="qn">기초 4-3 · 표준형</div><p>\(x^2y''-xy'+y=x^3\)(\(x&gt;0\))에 매개변수변환법을 쓸 때 공식에 넣는 \(r(x)\)는?</p><ol class="choices"><li data-ok="1">\(x\)</li><li>\(x^3\)</li><li>\(x^5\)</li><li>\(1/x\)</li></ol><details><summary>답</summary><div class="ans">표준형으로 \(x^2\)으로 나눈다: \(y''-\frac1xy'+\frac1{x^2}y=x\) → \(r(x)=x\). 나누지 않고 \(x^3\)을 넣으면 틀린다.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 4-1 · sec 입력</div><p>\(y''+4y=\sec2x\)(\(\cos2x\neq0\)인 구간)의 일반해를 구하라.</p><details><summary>답</summary><div class="ans">① \(y_1=\cos2x\), \(y_2=\sin2x\), \(W=2\). ② \(-y_1\int\dfrac{y_2r}{W}dx=-\cos2x\int\dfrac{\sin2x\sec2x}{2}dx=-\cos2x\int\dfrac{\tan2x}{2}dx=-\cos2x\cdot\left(-\dfrac14\ln|\cos2x|\right)\). ③ \(y_2\int\dfrac{y_1r}{W}dx=\sin2x\int\dfrac12dx=\dfrac x2\sin2x\). ∴ \(y=c_1\cos2x+c_2\sin2x+\dfrac14\cos2x\ln|\cos2x|+\dfrac x2\sin2x\).</div></details></div>
  <div class="q"><div class="qn a">응용 4-2 · 이중근 기저</div><p>\(y''-2y'+y=\dfrac{e^x}{x}\)(\(x&gt;0\))의 일반해를 구하라.</p><details><summary>답</summary><div class="ans">① \((\lambda-1)^2=0\) → \(y_1=e^x\), \(y_2=xe^x\). ② \(W=e^x(e^x+xe^x)-xe^x\cdot e^x=e^{2x}\). ③ \(-y_1\int\dfrac{xe^x\cdot e^x/x}{e^{2x}}dx=-e^x\int1\,dx=-xe^x\). ④ \(y_2\int\dfrac{e^x\cdot e^x/x}{e^{2x}}dx=xe^x\int\dfrac1xdx=xe^x\ln x\). ∴ \(y=(c_1+c_2x)e^x-xe^x+xe^x\ln x\) — \(-xe^x\)는 \(y_h\)에 흡수해 \(y=(c_1+c_2x)e^x+xe^x\ln x\)로 써도 된다.</div></details></div>
</section>
"""

P5 = r"""
<section>
  <h2><span class="no">파트 5 · 교재 선행</span>3.1~3.2 고계 제차 선형 ODE — n계 이론 · 상수계수 · 고계 오일러-코시</h2>
  <h3><span class="tag c">개념</span>2계에서 배운 것을 n계로 — 해 n개, n×n 론스키안, 특성방정식 n차</h3>
  <div class="why">3장은 새 방법이 아니라 2장을 n계로 넓힌 것이다. 해가 n개 필요하고, 1차독립 판정은 n×n 론스키안(행렬식), 상수계수면 n차 특성방정식의 근으로 기저를 만든다.</div>
  <div class="concept">
    <p><b>n계 선형 ODE</b>: \(y^{(n)}+p_{n-1}(x)y^{(n-1)}+\dots+p_1(x)y'+p_0(x)y=r(x)\)(표준형: \(y^{(n)}\)의 계수 1). \(r=0\)이면 제차, \(r\neq0\)이면 비제차.</p>
    <p><b>정리 1(기본 정리)</b>: 제차 선형 방정식의 해들의 합과 상수배도 해다(중첩). 비제차·비선형에서는 성립하지 않는다.</p>
    <p><b>일반해</b> \(y=c_1y_1+\dots+c_ny_n\), <b>기저</b> = 1차독립인 해 \(y_1,\dots,y_n\) 한 벌, <b>특수해</b> = \(c_1,\dots,c_n\)에 특정한 값을 준 것. 초기값 문제는 초기조건 n개(\(y(x_0),y'(x_0),\dots,y^{(n-1)}(x_0)\))로, 계수가 구간 \(I\)에서 연속이고 \(x_0\)가 \(I\) 안에 있으면 해가 하나로 정해진다(존재·유일성 — 2.6 정리 1의 확장).</p>
    <p><b>1차독립</b>: \(k_1y_1+\dots+k_ny_n=0\)이 구간 전체에서 성립하는 것은 \(k_1=\dots=k_n=0\)뿐일 때. 하나라도 0이 아닌 \(k\)로 성립하면 1차종속.</p>
    <p><b>론스키안</b>: \(W(y_1,\dots,y_n)\) = 1행에 \(y_1\dots y_n\), 2행에 도함수, …, n행에 \((n-1)\)계 도함수를 쓴 n×n 행렬식. 해들이 1차종속 ⟺ 어떤 \(x_0\)에서 \(W=0\)(그러면 \(I\) 전체에서 \(W\equiv0\)). \(W\neq0\)인 점이 하나라도 있으면 1차독립 → 기저.</p>
    <p><b>[미적2 연결] 3×3 행렬식</b>은 1행 여인수 전개로 계산한다: \(\begin{vmatrix}a&amp;b&amp;c\\d&amp;e&amp;f\\g&amp;h&amp;i\end{vmatrix}=a(ei-fh)-b(di-fg)+c(dh-eg)\).</p>
    <p><b>정리 4·5</b>: 계수가 연속이면 일반해가 존재하고, 일반해는 모든 해를 포함한다(특이해가 없다).</p>
    <p><b>상수계수</b> \(y^{(n)}+a_{n-1}y^{(n-1)}+\dots+a_0y=0\): \(y=e^{\lambda x}\)를 넣으면 특성방정식 \(\lambda^n+a_{n-1}\lambda^{n-1}+\dots+a_0=0\). 근의 종류대로 기저를 모은다.</p>
    <p>① 서로 다른 실근 \(\lambda_1,\dots\): \(e^{\lambda_1x},\dots\) ② 단순 복소근 \(\gamma\pm i\omega\): \(e^{\gamma x}\cos\omega x\), \(e^{\gamma x}\sin\omega x\) ③ m중 실근 \(\lambda\): \(e^{\lambda x},xe^{\lambda x},\dots,x^{m-1}e^{\lambda x}\) ④ 복소 이중근: \(e^{\gamma x}\cos\omega x,e^{\gamma x}\sin\omega x,xe^{\gamma x}\cos\omega x,xe^{\gamma x}\sin\omega x\).</p>
    <p><b>[보충] 3차 방정식 풀기</b>: 상수항의 약수(±1, ±2, …)를 넣어 0이 되는 근을 하나 찾고, 그 1차식으로 나눠(조립제법) 2차식으로 만든다.</p>
    <p><b>고계 오일러-코시</b>: \(x^3y'''+ax^2y''+bxy'+cy=0\) 꼴(\(x&gt;0\))은 \(y=x^m\)을 넣는다(\(x^3y'''=m(m-1)(m-2)x^m\) …). 보조방정식의 근이 서로 다른 실근이면 \(x^{m_1},x^{m_2},x^{m_3}\), 중근 \(m\)이면 \(x^m,(\ln x)x^m\), 삼중근이면 \((\ln x)^2x^m\)까지, 복소근 \(p\pm iq\)면 \(x^p\cos(q\ln x),x^p\sin(q\ln x)\).</p>
  </div>
  <div class="one">한 줄: 해 n개 · n×n 론스키안 ≠ 0이면 기저 · 특성방정식 n차: 서로 다른 근·복소근·m중근(\(x^ke^{\lambda x}\)) · 오일러-코시는 \(x^m\), 중근이면 \(\ln x\) 곱.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>m중 실근 → \(e^{\lambda x},xe^{\lambda x},\dots,x^{m-1}e^{\lambda x}\)</li><li>복소근 \(\gamma\pm i\omega\) → \(e^{\gamma x}\cos\omega x,e^{\gamma x}\sin\omega x\)(중근이면 \(x\)도 곱)</li><li>\(W\)의 모양(행마다 한 번 더 미분)</li><li>오일러-코시: 중근 \((\ln x)x^m\), 삼중근 \((\ln x)^2x^m\)</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>n계면 초기조건이 n개 필요한 이유</li><li>\(W=0\)과 1차종속의 관계</li><li>2장 규칙이 그대로 n계로 늘어나는 것</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 5-1 · 서로 다른 실근</div><p>\(y'''-6y''+11y'-6y=0\)의 일반해는?</p><ol class="choices"><li data-ok="1">\(c_1e^x+c_2e^{2x}+c_3e^{3x}\)</li><li>\(c_1e^{-x}+c_2e^{-2x}+c_3e^{-3x}\)</li><li>\((c_1+c_2x+c_3x^2)e^x\)</li><li>\(c_1e^x+c_2e^{6x}+c_3e^{11x}\)</li></ol><details><summary>답</summary><div class="ans">특성방정식 \(\lambda^3-6\lambda^2+11\lambda-6=0\). \(\lambda=1\)을 넣으면 \(1-6+11-6=0\) → \((\lambda-1)(\lambda^2-5\lambda+6)=(\lambda-1)(\lambda-2)(\lambda-3)\) → 근 1, 2, 3.</div></details></div>
  <div class="q"><div class="qn">기초 5-2 · 중근이 섞일 때</div><p>\(y'''-3y'+2y=0\)의 일반해는?</p><ol class="choices"><li data-ok="1">\((c_1+c_2x)e^x+c_3e^{-2x}\)</li><li>\(c_1e^x+c_2e^{-2x}\)</li><li>\(c_1e^x+c_2e^{x}+c_3e^{-2x}\)</li><li>\((c_1+c_2x)e^{-2x}+c_3e^x\)</li></ol><details><summary>답</summary><div class="ans">\(\lambda^3-3\lambda+2\)에 \(\lambda=1\): \(1-3+2=0\) → \((\lambda-1)(\lambda^2+\lambda-2)=(\lambda-1)^2(\lambda+2)\). 1은 이중근 → \(e^x,xe^x\), −2 → \(e^{-2x}\). \(e^x\)를 두 번 쓰면 1차종속이라 기저가 아니다.</div></details></div>
  <div class="q"><div class="qn">기초 5-3 · 3×3 론스키안</div><p>\(1,\ x,\ x^2\)의 론스키안은?</p><ol class="choices"><li data-ok="1">2</li><li>0</li><li>\(2x\)</li><li>\(x^2\)</li></ol><details><summary>답</summary><div class="ans">\(W=\begin{vmatrix}1&amp;x&amp;x^2\\0&amp;1&amp;2x\\0&amp;0&amp;2\end{vmatrix}\) — 아래 삼각 부분이 0이라 대각선 곱 \(1\cdot1\cdot2=2\neq0\) → 1차독립(\(y'''=0\)의 기저).</div></details></div>
  <div class="q"><div class="qn">기초 5-4 · 고계 오일러-코시</div><p>\(x^3y'''+3x^2y''-2xy'+2y=0\)(\(x&gt;0\))의 일반해는?</p><ol class="choices"><li data-ok="1">\(c_1x+c_2x\ln x+c_3x^{-2}\)</li><li>\(c_1x+c_2x^2+c_3x^{-2}\)</li><li>\(c_1e^x+c_2xe^x+c_3e^{-2x}\)</li><li>\(c_1x+c_2x^{-1}+c_3x^{2}\)</li></ol><details><summary>답</summary><div class="ans">\(y=x^m\): \(m(m-1)(m-2)+3m(m-1)-2m+2=m^3-3m+2=(m-1)^2(m+2)=0\) → 중근 1, 단순근 −2 → \(x,\ (\ln x)x,\ x^{-2}\). 상수계수처럼 \(e^{x}\)를 쓰면 안 된다.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 5-1 · 3계 초기값 문제</div><p>\(y'''+y'=0\), \(y(0)=2\), \(y'(0)=1\), \(y''(0)=-1\)을 풀어라.</p><details><summary>답</summary><div class="ans">Step 1: \(\lambda^3+\lambda=\lambda(\lambda^2+1)=0\) → \(0,\ \pm i\) → \(y=c_1+c_2\cos x+c_3\sin x\). Step 2 초기조건: \(y(0)=c_1+c_2=2\). \(y'=-c_2\sin x+c_3\cos x\) → \(y'(0)=c_3=1\). \(y''=-c_2\cos x-c_3\sin x\) → \(y''(0)=-c_2=-1\) → \(c_2=1\), \(c_1=1\). ∴ \(y=1+\cos x+\sin x\).</div></details></div>
  <div class="q"><div class="qn a">응용 5-2 · 론스키안으로 기저 판정</div><p>\(e^x,\ e^{2x},\ e^{3x}\)의 론스키안을 구하고, 이 셋이 \(y'''-6y''+11y'-6y=0\)의 기저인지 판정하라.</p><details><summary>답</summary><div class="ans">\(W=\begin{vmatrix}e^x&amp;e^{2x}&amp;e^{3x}\\e^x&amp;2e^{2x}&amp;3e^{3x}\\e^x&amp;4e^{2x}&amp;9e^{3x}\end{vmatrix}=e^{6x}\begin{vmatrix}1&amp;1&amp;1\\1&amp;2&amp;3\\1&amp;4&amp;9\end{vmatrix}\)(각 열에서 공통인수를 뺀다). 1행 전개: \(1(18-12)-1(9-3)+1(4-2)=6-6+2=2\) → \(W=2e^{6x}\neq0\). 셋 다 해(특성근 1, 2, 3)이고 1차독립 → 기저.</div></details></div>
</section>
"""

P6 = r"""
<section>
  <h2><span class="no">파트 6 · 교재 선행</span>3.3 고계 비제차 선형 ODE — 미정계수법 · 매개변수변환법의 일반화</h2>
  <h3><span class="tag c">개념</span>y = y_h + y_p — y_p 는 미정계수(곱의 원리 포함) 또는 y_p = Σ y_k∫(W_k/W) r dx</h3>
  <div class="why">2.7·2.10을 n계로 넓힌다. 미정계수법의 규칙은 그대로(겹치면 \(x\)를 곱한다), 매개변수변환법은 론스키안 \(W\)와 \(W_k\)(한 열을 바꾼 행렬식)로 공식이 일반화된다.</div>
  <div class="concept">
    <p><b>n계 비제차</b>: \(y^{(n)}+p_{n-1}y^{(n-1)}+\dots+p_0y=r(x)\), 일반해 \(y=y_h+y_p\)(\(y_h\): 제차 일반해, \(y_p\): 상수 없는 비제차 해 하나).</p>
    <p><b>미정계수법(교수님 표, 상수계수 방정식)</b>: 기본 원리 — \(r\)이 다항식·사인·코사인·지수함수면 같은 꼴로. 중첩의 원리 — \(r=\sum r_k\)이면 \(y_p=\sum y_{pk}\). 곱의 원리 — \(r\)의 꼴이 보조해(\(y_h\))의 일부와 겹치면 겹치지 않을 때까지 \(x\)를 곱해 고친다(m중근이면 \(x^m\)).</p>
    <p><b>매개변수변환법의 일반화</b>(표준형에서): \[y_p(x)=\sum_{k=1}^{n}y_k(x)\int\frac{W_k(x)}{W(x)}r(x)\,dx\] \(W\) = 기저 \(y_1,\dots,y_n\)의 론스키안, \(W_k\) = \(W\)의 \(k\)번째 열을 열벡터 \([0\ 0\ \cdots\ 0\ 1]^T\)로 바꾼 행렬식. n = 2이면 2.10 공식과 같다(\(W_1=-y_2\), \(W_2=y_1\)).</p>
    <p><b>교수님 Ex.2 흐름</b>(비제차 오일러-코시 \(x^3y'''-3x^2y''+6xy'-6y=x^4\ln x\), \(x&gt;0\)): Step 1 보조방정식 \(m(m-1)(m-2)-3m(m-1)+6m-6=0\) → \(m=1,2,3\) → \(y_h=c_1x+c_2x^2+c_3x^3\). Step 2 행렬식 \(W=2x^3\), \(W_1=x^4\), \(W_2=-2x^3\), \(W_3=x^2\).</p>
    <p>Step 3 적분: 표준형으로 \(x^3\)을 나눠 \(r=x\ln x\)를 넣으면 \(y_p=\frac16x^4\left(\ln x-\frac{11}6\right)\). <b>표준형 \(r\)</b>을 쓰는 것이 핵심이다(\(x^4\ln x\)를 그대로 넣으면 틀린다).</p>
    <p><b>탄성보(교수님 Ex.3)</b>: 들보의 처짐 \(y\)는 \(EIy^{(4)}=f(x)\)(\(f\): 단위 길이당 하중) — 4계 비제차 ODE. 지지 조건이 경계조건: 단순지지 \(y=y''=0\), 고정 \(y=y'=0\), 자유단 \(y''=y'''=0\).</p>
  </div>
  <div class="one">한 줄: \(y=y_h+y_p\) · 미정계수: 기본·중첩·곱(겹치면 \(x^m\)) · 매개변수변환: \(y_p=\sum y_k\int\frac{W_k}{W}r\,dx\), \(W_k\)는 k열을 \([0\cdots01]^T\)로 · 반드시 표준형 \(r\).</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>\(y_p=\sum y_k\int\dfrac{W_k}{W}r\,dx\)</li><li>\(W_k\): \(W\)의 k번째 열 → \([0,\dots,0,1]^T\)</li><li>곱의 원리: 겹치면 \(x\)(m중근이면 \(x^m\))</li><li>표준형으로 나눈 \(r(x)\)를 쓴다</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>n = 2일 때 2.10 공식과 같아지는 것</li><li>\(W_k\)가 크래머 법칙에서 나오는 이유</li><li>탄성보 식이 4계인 이유와 경계조건의 뜻</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 6-1 · 곱의 원리</div><p>\(y'''-y'=2x\)의 특수해는?</p><ol class="choices"><li data-ok="1">\(-x^2\)</li><li>\(-2x\)</li><li>\(x^2\)</li><li>\(-x^2+x\)</li></ol><details><summary>답</summary><div class="ans">특성근 \(\lambda(\lambda^2-1)=0\) → \(0,\pm1\). \(r=2x\)(다항식)의 꼴 \(K_1x+K_0\)의 상수항이 \(\lambda=0\)의 해 1과 겹침 → \(x\)를 곱해 \(y_p=x(K_1x+K_0)=K_1x^2+K_0x\). \(y_p'=2K_1x+K_0\), \(y_p'''=0\) → \(-(2K_1x+K_0)=2x\) → \(K_1=-1\), \(K_0=0\).</div></details></div>
  <div class="q"><div class="qn">기초 6-2 · 기본 원리</div><p>\(y'''-2y''-y'+2y=e^{3x}\)의 특수해는?</p><ol class="choices"><li data-ok="1">\(\frac18e^{3x}\)</li><li>\(e^{3x}\)</li><li>\(\frac1{20}e^{3x}\)</li><li>\(xe^{3x}\)</li></ol><details><summary>답</summary><div class="ans">특성근은 1, −1, 2라 3과 겹치지 않는다. \(y_p=Ce^{3x}\) → \((27-18-3+2)C=8C=1\) → \(C=\frac18\).</div></details></div>
  <div class="q" data-def="W,T"><div class="qn">기초 6-3 · W_k 만들기</div><p>3계 방정식의 기저 \(y_1,y_2,y_3\)로 매개변수변환법을 쓸 때 \(W_2\)는?</p><ol class="choices"><li data-ok="1">\(W\)의 두 번째 열을 \([0\ 0\ 1]^T\)로 바꾼 행렬식</li><li>\(W\)의 두 번째 행을 \([0\ 0\ 1]\)로 바꾼 행렬식</li><li>\(W\)에서 두 번째 행과 열을 지운 행렬식</li><li>\(y_2\)와 그 도함수만의 곱</li></ol><details><summary>답</summary><div class="ans">크래머 법칙에서 k번째 미지수의 분자 = 계수 행렬의 k번째 <b>열</b>을 오른쪽 변(여기서는 \([0,0,1]^T\))으로 바꾼 행렬식.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 6-1 · 비제차 오일러-코시(매개변수변환법)</div><p>\(x^3y'''-3x^2y''+6xy'-6y=6x^4\)(\(x&gt;0\))의 일반해를 매개변수변환법으로 구하라.</p><details><summary>답</summary><div class="ans">Step 1 제차 일반해: \(y=x^m\) → \(m^3-6m^2+11m-6=(m-1)(m-2)(m-3)=0\) → \(y_h=c_1x+c_2x^2+c_3x^3\). Step 2 행렬식: \(W=\begin{vmatrix}x&amp;x^2&amp;x^3\\1&amp;2x&amp;3x^2\\0&amp;2&amp;6x\end{vmatrix}=2x^3\), \(W_1=x^4\), \(W_2=-2x^3\), \(W_3=x^2\). 표준형: \(x^3\)으로 나눠 \(r=6x\). Step 3 적분: \(y_p=x\int\dfrac{x^4}{2x^3}6x\,dx+x^2\int\dfrac{-2x^3}{2x^3}6x\,dx+x^3\int\dfrac{x^2}{2x^3}6x\,dx=x\cdot x^3-x^2\cdot3x^2+x^3\cdot3x=x^4\). ∴ \(y=c_1x+c_2x^2+c_3x^3+x^4\). 검산: \(y=x^4\) → \(24x^4-36x^4+24x^4-6x^4=6x^4\) ✓.</div></details></div>
  <div class="q"><div class="qn a">응용 6-2 · 미정계수 3계 초기값</div><p>\(y'''-y'=2x\), \(y(0)=0\), \(y'(0)=0\), \(y''(0)=0\)을 풀어라.</p><details><summary>답</summary><div class="ans">Step 1: \(y_h=c_1+c_2e^x+c_3e^{-x}\). Step 2: \(r=2x\)의 꼴 \(K_1x+K_0\)의 상수항이 \(\lambda=0\)의 해 1과 겹치므로 \(y_p=x(K_1x+K_0)\) → 대입하면 \(-(2K_1x+K_0)=2x\) → \(K_1=-1\), \(K_0=0\), \(y_p=-x^2\). \(y=c_1+c_2e^x+c_3e^{-x}-x^2\). Step 3: \(y(0)=c_1+c_2+c_3=0\), \(y'(0)=c_2-c_3=0\), \(y''(0)=c_2+c_3-2=0\) → \(c_2=c_3=1\), \(c_1=-2\). ∴ \(y=-2+e^x+e^{-x}-x^2\)(\(=2\cosh x-2-x^2\)).</div></details></div>
</section>
"""

TAIL = "\n</body>\n</html>\n"

def build():
    body = HEAD + P1 + P2 + P3 + P4 + P5 + P6 + TAIL
    rep = {"@@F_SPRING@@": F_SPRING, "@@F_DAMP@@": F_DAMP, "@@TABLE21@@": TABLE21, "@@F_RES@@": F_RES, "@@F_RLC@@": F_RLC}
    for k, v in rep.items():
        assert body.count(k) == 1, k
        body = body.replace(k, v)
    assert "@@" not in body
    for ch in "\a\b\v\f":
        assert ch not in body, "제어문자 — 역슬래시가 빠진 수식"
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(body)
    print("그림", len(FIGS), "·", ", ".join(FIGS))
    print("→", OUT)

if __name__ == "__main__":
    build()
