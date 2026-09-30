# -*- coding: utf-8 -*-
"""미분적분학2 · 중간고사 대비 2 — 12.4 외적 계산·12.5 직선(9/29 수업) + 12.5 평면·12.6 기둥면·13.1~13.2 벡터함수(교재 선행) 정리노트 v2 생성기
대표님 2026-09-30 「교재에 있는 개념으로 우선적으로 시험범위 내용 정리 … 나머지 과목들도」.
근거(§24): 파트 1·2 = 9/29 판서 8장 + 녹음(study-materials/미분적분학2/2026-09-29/정리.md) — [Def 02] 1행 여인수 전개, a×b = |i j k; a; b|, Ex01 형식,
  방향코사인 l·m·n → 방향비 → 방향벡터 v = (A, B, C) → 매개방정식 → 대칭방정식(그림 P₀P = t v 에서 유도). 「스칼라 삼중곱 패스」(9/29).
  파트 3~6 = 수업 전 — 강의계획서 6주차 「직선과 평면의 방정식 / 기둥면」, 7주차 「벡터함수와 공간곡선 / 벡터의 미적분」(Stewart 12.5~12.6, 13.1~13.2), 9주차 곡률은 제외.
시험: 10/20(화) 예정(교수 9/29 31:36, 확정 공지 전). 문제는 판서 예제·교재 유형을 숫자만 바꿔 새로 만들고 calc2_ahead_check.py(sympy)로 검산.
출력: study-materials/미분적분학2/_정리노트/2026-09-30_미분적분학2_중간대비_12.5-13.2.html → build_slides.py → 덱 calc2-mid2"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *

OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\미분적분학2\_정리노트\2026-09-30_미분적분학2_중간대비_12.5-13.2.html"
FIGS = []

def fig(w, h, *parts, cap="", name=""):
    FIGS.append(name)
    s = canvas(w, h, *parts, cap=cap, name=name)
    s = s.replace('<svg class="fig-svg"', '<svg class="fig-svg" style="max-width:100%;height:auto"', 1)
    return s.replace("<figcaption>", '<figcaption style="font-size:.86em;opacity:.85;margin-top:4px">', 1)

OX, OY = 150, 190
def P3(x, y, z, s=40): return p3(OX, OY, x, y, z, s)

def _line():
    s = axes3d(OX, OY, 120, "x", "y", "z")
    s += text(OX + 8, OY + 16, "O", 13, INK, "start", True)
    P0 = P3(1.2, 1.0, 1.4); v = (0.6, 1.8, 1.1)
    far = P3(1.2 + 2.4 * v[0], 1.0 + 2.4 * v[1], 1.4 + 2.4 * v[2]); back = P3(1.2 - 0.9 * v[0], 1.0 - 0.9 * v[1], 1.4 - 0.9 * v[2])
    s += line(back[0], back[1], far[0], far[1], YEL, 3)
    P = P3(1.2 + 1.6 * v[0], 1.0 + 1.6 * v[1], 1.4 + 1.6 * v[2])
    s += arrow(OX, OY, P0[0], P0[1], GRAY, "", 1.4) + arrow(OX, OY, P[0], P[1], GRAY, "", 1.4)
    s += arrow(P0[0], P0[1], P[0], P[1], RED, "", 2.4)
    vt = P3(1.2 + 0.7 * v[0] - 0.9, 1.0 + 0.7 * v[1] + 0.2, 1.4 + 0.7 * v[2] + 1.4)
    vh = (vt[0] + (P[0] - P0[0]) * 0.45, vt[1] + (P[1] - P0[1]) * 0.45)
    s += arrow(vt[0], vt[1], vh[0], vh[1], GREEN, "", 2.4) + text(vh[0] + 6, vh[1] - 4, "v = (A, B, C)", 13, GREEN, "start", True)
    s += dot(P0[0], P0[1], "", 4, INK) + text(P0[0] - 10, P0[1] - 8, "P₀(x₀, y₀, z₀)", 12, INK, "end")
    s += dot(P[0], P[1], "", 4, INK) + text(P[0] + 8, P[1] + 14, "P(x, y, z)", 12, INK)
    s += text(470, 40, "P₀P = t v", 14, RED, "end", True)
    return s
F_LINE = fig(500, 250, _line(), cap="직선 위의 점 P는 \\(\\overrightarrow{P_0P}\\parallel\\vec v\\), 즉 \\(\\overrightarrow{P_0P}=t\\vec v\\)인 실수 \\(t\\)가 있다 — 여기서 매개방정식과 대칭방정식이 나온다.", name="line")

def _plane():
    A, B, C, D = (90, 170), (330, 170), (420, 90), (180, 90)
    s = polyline([A, B, C, D], INK, 1.8, close=True).replace('fill="none"', 'fill="rgba(25,113,194,.07)"')
    P0 = (220, 140); P = (320, 118)
    s += dot(P0[0], P0[1], "", 4, INK) + text(P0[0] - 8, P0[1] + 18, "P₀", 13, INK, "end", True)
    s += dot(P[0], P[1], "", 4, INK) + text(P[0] + 8, P[1] + 16, "P", 13, INK, "start", True)
    s += arrow(P0[0], P0[1], P[0] - 3, P[1] + 1, RED, "", 2.2) + text(270, 146, "r − r₀", 12, RED, "middle")
    s += arrow(P0[0], P0[1], P0[0], 26, GREEN, "", 2.4) + text(P0[0] + 8, 36, "n = (a, b, c)", 13, GREEN, "start", True)
    s += path(f"M{P0[0]} {P0[1]-12} L{P0[0]+11} {P0[1]-14.5} L{P0[0]+11} {P0[1]-2.5}", GREEN, 1.3)
    return s
F_PLANE = fig(460, 196, _plane(), cap="평면: 법선벡터 \\(\\vec n\\)이 평면 위 모든 벡터 \\(\\vec r-\\vec r_0\\)와 수직 → \\(\\vec n\\cdot(\\vec r-\\vec r_0)=0\\).", name="plane")

def ellipse(cx, cy, rx, ry, color=INK, w=2, fill="none", dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{color}" stroke-width="{w}"{d}/>'

def _cyl():
    s = ellipse(150, 50, 70, 18, INK, 2, "rgba(25,113,194,.08)") + line(80, 50, 80, 170, INK, 2) + line(220, 50, 220, 170, INK, 2)
    s += path("M80 170 A 70 18 0 0 0 220 170", INK, 2) + path("M80 170 A 70 18 0 0 1 220 170", INK, 1.2, dash="5 4")
    for xx in (110, 150, 190): s += line(xx, 64 + (0 if xx == 150 else -3), xx, 186 - (0 if xx == 150 else 3), GRAY, 1, "4 4")
    s += text(150, 214, "x² + y² = 1 (원기둥)", 13, INK, "middle", True)
    # 포물기둥 z = y²: yz 평면의 포물선을 x 방향으로 민 것 — 옆 그림
    X0 = 330
    s += fplot(lambda t: t * t, -1.3, 1.3, lambda t: X0 + 60 * t, lambda z: 180 - 70 * z, 60, BLUE, 2.2)
    s += fplot(lambda t: t * t, -1.3, 1.3, lambda t: X0 + 60 + 60 * t, lambda z: 150 - 70 * z, 60, BLUE, 1.2, "5 4")
    for t in (-1.2, 0, 1.2):
        a = (X0 + 60 * t, 180 - 70 * t * t); b = (X0 + 60 + 60 * t, 150 - 70 * t * t)
        s += line(a[0], a[1], b[0], b[1], GRAY, 1, "4 4")
    s += text(X0 + 30, 214, "z = y² (포물기둥)", 13, BLUE, "middle", True)
    return s
F_CYL = fig(470, 226, _cyl(), cap="기둥면: 식에 빠진 변수 방향으로 곡선을 그대로 민 곡면. \\(x^2+y^2=1\\)은 \\(z\\)가 빠져 \\(z\\)축 방향, \\(z=y^2\\)은 \\(x\\)가 빠져 \\(x\\)축 방향으로 민다.", name="cyl")

def _helix():
    s = axes3d(OX, OY, 120, "x", "y", "z")
    pts = []
    for k in range(0, 241):
        t = k * 4 * math.pi / 240
        pts.append(P3(1.6 * math.cos(t), 1.6 * math.sin(t), t / 3.4))
    s += polyline(pts, RED, 2.4)
    s += text(360, 60, "r(t) = ⟨cos t, sin t, t⟩ 모양", 13, RED, "middle", True)
    s += text(360, 84, "원기둥 둘레를 돌며 올라가는 나선", 12, GRAY, "middle")
    return s
F_HELIX = fig(480, 258, _helix(), cap="공간곡선 = 벡터함수 \\(\\vec r(t)\\)의 끝점이 그리는 곡선. 나선은 \\(x,y\\)가 원을 돌고 \\(z\\)가 일정하게 늘어난다.", name="helix")

def _tangent():
    s = fplot(lambda t: 0.5 + 0.9 * math.sin(t), 0, 3.4, lambda t: 70 + 110 * t, lambda y: 180 - 90 * y, 80, BLUE, 2.4)
    O = (40, 196); s += dot(O[0], O[1]) + text(O[0] - 6, O[1] + 4, "O", 13, INK, "end", True)
    t0, t1 = 0.8, 1.35
    P = (70 + 110 * t0, 180 - 90 * (0.5 + 0.9 * math.sin(t0))); Q = (70 + 110 * t1, 180 - 90 * (0.5 + 0.9 * math.sin(t1)))
    s += arrow(O[0], O[1], P[0], P[1], GRAY, "", 1.6) + arrow(O[0], O[1], Q[0], Q[1], GRAY, "", 1.6)
    s += text(78, 128, "r(t)", 13, GRAY, "end") + text(186, 170, "r(t+h)", 13, GRAY, "start")
    dx, dy = 110, -90 * 0.9 * math.cos(t0); L = math.hypot(dx, dy)
    s += arrow(P[0], P[1], P[0] + 90 * dx / L, P[1] + 90 * dy / L, RED, "", 2.6) + text(P[0] + 90 * dx / L + 4, P[1] + 90 * dy / L - 6, "r′(t)", 14, RED, "start", True)
    s += dot(P[0], P[1], "", 4, INK)
    return s
F_TAN = fig(470, 212, _tangent(), cap="\\(\\vec r'(t)=\\lim_{h\\to0}\\dfrac{\\vec r(t+h)-\\vec r(t)}{h}\\) — 곡선에 접하는 방향(접선벡터).", name="tangent")

QUAD = r"""<table><tr><th>이름</th><th>표준형(예)</th><th>자취(단면)</th></tr>
<tr><td>타원면</td><td>\(\frac{x^2}{a^2}+\frac{y^2}{b^2}+\frac{z^2}{c^2}=1\)</td><td>모두 타원</td></tr>
<tr><td>원뿔(타원뿔)</td><td>\(\frac{z^2}{c^2}=\frac{x^2}{a^2}+\frac{y^2}{b^2}\)</td><td>수평 단면 타원, 수직 단면 두 직선·쌍곡선</td></tr>
<tr><td>타원포물면</td><td>\(\frac zc=\frac{x^2}{a^2}+\frac{y^2}{b^2}\)</td><td>수평 타원, 수직 포물선</td></tr>
<tr><td>쌍곡포물면(말안장)</td><td>\(\frac zc=\frac{x^2}{a^2}-\frac{y^2}{b^2}\)</td><td>수평 쌍곡선, 수직 포물선</td></tr>
<tr><td>일엽쌍곡면</td><td>\(\frac{x^2}{a^2}+\frac{y^2}{b^2}-\frac{z^2}{c^2}=1\)</td><td>수평 타원, 수직 쌍곡선(한 덩어리)</td></tr>
<tr><td>이엽쌍곡면</td><td>\(-\frac{x^2}{a^2}-\frac{y^2}{b^2}+\frac{z^2}{c^2}=1\)</td><td>수평 타원(\(|z|\ge c\)), 두 덩어리</td></tr></table>"""

HEAD = r"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>미분적분학2 · 중간고사 대비 2 — 12.4 외적 계산 · 12.5 직선과 평면 · 12.6 기둥면 · 13.1~13.2 벡터함수</title>
<!-- 정리노트 v2. 생성기 docs/tools/exam_gap/calc2_ahead.py → build_slides.py 로 덱 calc2-mid2.
     파트 1·2 = 9/29 수업(판서·녹음 뼈대), 파트 3~6 = 수업 전 교재 선행(강의계획서 6~7주차). -->
<style>body{font-family:Pretendard,"Malgun Gothic",sans-serif;max-width:900px;margin:24px auto;padding:0 16px;line-height:1.6}section{border-top:2px solid #333;padding-top:12px;margin-top:28px}h2 .no{display:inline-block;background:#1f2a44;color:#fff;font-size:13px;padding:2px 8px;border-radius:6px;margin-right:8px}h3 .tag{display:inline-block;font-size:12px;padding:1px 7px;border-radius:5px;margin-right:6px;background:#eee}.tag.c{background:#dbe7ff}.tag.b{background:#dff5e1}.tag.a{background:#ffe6cc}.why{background:#f6f6f6;padding:10px 12px;border-radius:8px}.one{border-left:4px solid #1f2a44;padding:6px 10px;margin:8px 0;background:#fafafa}.q{border:1px solid #ddd;border-radius:8px;padding:10px 12px;margin:10px 0}.qn{font-weight:700;color:#1f2a44}.choices li[data-ok]{font-weight:700}.mu{display:grid;grid-template-columns:1fr 1fr;gap:10px}.mu-mem{background:#fff8d6;padding:8px 10px;border-radius:8px}.mu-und{background:#e3efff;padding:8px 10px;border-radius:8px}.mu-h{font-weight:700;margin-bottom:4px}aside.exam{background:#ffe0ec;border-left:4px solid #d0397a;padding:6px 10px;margin:8px 0;font-size:14px}figure.fig{margin:10px 0}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 8px;font-size:14px}</style>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"><script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body,{delimiters:[{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true}]})"></script>
</head>
<body>
<h1>미분적분학2 · 중간고사 대비 2 — 12.4 외적 계산 · 12.5 직선과 평면 · 12.6 기둥면 · 13.1~13.2 벡터함수</h1>
<p>중간 10/20(화) 예정(9/29 발표, 공식 공지 전) · 파트 1·2는 9/29 판서·녹음 순서와 표기, 파트 3~6은 아직 수업 전이라 강의계획서 6~7주차(직선과 평면의 방정식 / 기둥면 · 벡터함수와 공간곡선 / 벡터의 미적분) 범위를 교재 개념으로 채웠다. 곡률(9주차)은 뺐다.</p>
"""

P1 = r"""
<section>
  <h2><span class="no">파트 1 · 9/29</span>12.4 외적 계산 — 3×3 행렬식 1행 여인수 전개 · 넓이</h2>
  <aside class="exam" data-level="강조" data-when="9/29 19:54·23:11">「사라스 적용할 필요 없어요. 무조건 여인수 전개」 · j 성분 「마이너스가 있으니까 조심」</aside>
  <aside class="exam" data-level="범위" data-when="9/29 29:19">외적의 의미(두 벡터에 동시에 수직) 「뒤에 시험하고 연관된 내용이 나온다」 · 스칼라 삼중곱은 이번 학기 패스</aside>
  <h3><span class="tag c">개념</span>a × b = |i j k ; a₁ a₂ a₃ ; b₁ b₂ b₃| — 1행 기준 + − + 로 전개</h3>
  <div class="why">9/22에 외적을 성분식 [Def 01]로 정의했다. 외우기 어려운 그 식을 1학기 행렬식 [Def 02]로 바꿔 쓰면 규칙 하나로 계산된다. 결과는 두 벡터에 동시에 수직인 벡터다.</div>
  <div class="concept">
    <p><b>[Def 01] 성분식</b>: \(\vec a\times\vec b=(a_2b_3-a_3b_2,\ a_3b_1-a_1b_3,\ a_1b_2-a_2b_1)\) — 각 성분이 2×2 행렬식이다. 가운데(\(y\)) 성분의 순서 3·1이 헷갈린다.</p>
    <p><b>[Def 02] 3×3 행렬식 1행 여인수 전개</b>: 1행의 원소마다, 그 원소의 행과 열을 지운 2×2 행렬식(소행렬식)을 곱하고 부호 + − +를 붙인다. \[\begin{vmatrix}a_1&amp;a_2&amp;a_3\\b_1&amp;b_2&amp;b_3\\c_1&amp;c_2&amp;c_3\end{vmatrix}=a_1\begin{vmatrix}b_2&amp;b_3\\c_2&amp;c_3\end{vmatrix}-a_2\begin{vmatrix}b_1&amp;b_3\\c_1&amp;c_3\end{vmatrix}+a_3\begin{vmatrix}b_1&amp;b_2\\c_1&amp;c_2\end{vmatrix}\]</p>
    <p><b>둘을 잇기(교수님 판서)</b>: \(\vec a=a_1\vec i+a_2\vec j+a_3\vec k\)로 쓰면 [Def 01]의 가운데 항 \(\begin{vmatrix}a_3&amp;a_1\\b_3&amp;b_1\end{vmatrix}\)은 두 열을 바꾸면 부호가 바뀌어 \(-\begin{vmatrix}a_1&amp;a_3\\b_1&amp;b_3\end{vmatrix}\) → + − + 모양이 된다. 그래서 \[\vec a\times\vec b=\begin{vmatrix}\vec i&amp;\vec j&amp;\vec k\\a_1&amp;a_2&amp;a_3\\b_1&amp;b_2&amp;b_3\end{vmatrix}\]</p>
    <p><b>[1학기 복습] 2×2 행렬식</b>: \(\begin{vmatrix}p&amp;q\\r&amp;s\end{vmatrix}=ps-qr\). 행렬식 성질: 두 행(또는 두 열)을 바꾸면 −1배.</p>
    <p><b>교수님 Ex01 흐름</b>: \(\vec a=(1,3,4)\), \(\vec b=(2,7,-5)\) → \(\vec i\) 항 \(3\cdot(-5)-4\cdot7=-43\), \(\vec j\) 항 \(-(1\cdot(-5)-4\cdot2)=+13\), \(\vec k\) 항 \(1\cdot7-3\cdot2=1\) → \((-43,13,1)\). 검산: \(\vec a\cdot(\vec a\times\vec b)=-43+39+4=0\) — 수직.</p>
    <p><b>[교재 보충] 성질과 크기</b>: \(\vec b\times\vec a=-\vec a\times\vec b\), \(\vec a\times\vec a=\vec0\), \(\vec i\times\vec j=\vec k\), \(\vec j\times\vec k=\vec i\), \(\vec k\times\vec i=\vec j\). 크기 \(|\vec a\times\vec b|=|\vec a||\vec b|\sin\theta\) = 두 벡터가 만드는 평행사변형의 넓이(삼각형은 그 절반). 방향은 오른손 법칙.</p>
  </div>
  <div class="one">한 줄: \(\vec a\times\vec b=|\,\vec i\ \vec j\ \vec k;\ \vec a;\ \vec b\,|\)를 1행 + − +로 전개(사라스 금지) · 결과는 \(\vec a,\vec b\)에 수직 · \(|\vec a\times\vec b|\) = 평행사변형 넓이.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>1행 여인수 전개 + − +, \(\vec j\) 항 앞 −</li><li>\(\vec a\times\vec b=|\vec i\ \vec j\ \vec k;\vec a;\vec b|\)</li><li>\(\vec b\times\vec a=-\vec a\times\vec b\), \(\vec i\times\vec j=\vec k\)</li><li>\(|\vec a\times\vec b|=|\vec a||\vec b|\sin\theta\) = 평행사변형 넓이</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>[Def 01]이 [Def 02] 모양이 되는 이유(열 교환 → −1배)</li><li>외적이 두 벡터에 수직인지 내적으로 확인하는 법</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 1-1 · 외적 계산</div><p>\(\vec a=(2,1,0)\), \(\vec b=(1,3,2)\)일 때 \(\vec a\times\vec b\)는?</p><ol class="choices"><li data-ok="1">\((2,-4,5)\)</li><li>\((2,4,5)\)</li><li>\((-2,4,-5)\)</li><li>\((2,-4,-5)\)</li></ol><details><summary>답</summary><div class="ans">\(\begin{vmatrix}\vec i&amp;\vec j&amp;\vec k\\2&amp;1&amp;0\\1&amp;3&amp;2\end{vmatrix}=(1\cdot2-0\cdot3)\vec i-(2\cdot2-0\cdot1)\vec j+(2\cdot3-1\cdot1)\vec k=2\vec i-4\vec j+5\vec k\). \(\vec j\) 항의 −를 빼먹으면 \((2,4,5)\).</div></details></div>
  <div class="q"><div class="qn">기초 1-2 · j 성분 부호</div><p>\(\vec a=(1,2,3)\), \(\vec b=(4,5,6)\)일 때 \(\vec a\times\vec b\)는?</p><ol class="choices"><li data-ok="1">\((-3,6,-3)\)</li><li>\((-3,-6,-3)\)</li><li>\((3,-6,3)\)</li><li>\((0,0,0)\)</li></ol><details><summary>답</summary><div class="ans">\(\vec i\): \(2\cdot6-3\cdot5=-3\), \(\vec j\): \(-(1\cdot6-3\cdot4)=-(-6)=6\), \(\vec k\): \(1\cdot5-2\cdot4=-3\). 검산 \(\vec a\cdot(-3,6,-3)=-3+12-9=0\) ✓.</div></details></div>
  <div class="q"><div class="qn">기초 1-3 · 성질</div><p>옳은 것은?</p><ol class="choices"><li data-ok="1">\(\vec j\times\vec i=-\vec k\)</li><li>\(\vec j\times\vec i=\vec k\)</li><li>\(\vec a\times\vec a=|\vec a|^2\)</li><li>\(\vec a\times\vec b=\vec b\times\vec a\)</li></ol><details><summary>답</summary><div class="ans">\(\vec i\times\vec j=\vec k\)이고 순서를 바꾸면 부호가 바뀐다. \(\vec a\times\vec a=\vec0\)(사이각 0), 외적은 교환법칙이 안 된다.</div></details></div>
  <div class="q"><div class="qn">기초 1-4 · 평행사변형 넓이</div><p>\(\vec a=(3,0,0)\), \(\vec b=(1,2,0)\)이 만드는 평행사변형의 넓이는?</p><ol class="choices"><li data-ok="1">6</li><li>3</li><li>\(\sqrt{45}\)</li><li>12</li></ol><details><summary>답</summary><div class="ans">\(\vec a\times\vec b=(0\cdot0-0\cdot2)\vec i-(3\cdot0-0\cdot1)\vec j+(3\cdot2-0\cdot1)\vec k=(0,0,6)\) → 넓이 6. 3은 삼각형 넓이.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 1-1 · 두 벡터에 수직인 단위벡터</div><p>\(\vec a=(1,-1,2)\), \(\vec b=(3,0,1)\)에 동시에 수직인 단위벡터를 모두 구하라.</p><details><summary>답</summary><div class="ans">① \(\vec a\times\vec b=\begin{vmatrix}\vec i&amp;\vec j&amp;\vec k\\1&amp;-1&amp;2\\3&amp;0&amp;1\end{vmatrix}=(-1\cdot1-2\cdot0)\vec i-(1\cdot1-2\cdot3)\vec j+(1\cdot0-(-1)\cdot3)\vec k=(-1,5,3)\). ② 검산 \(\vec a\cdot(-1,5,3)=-1-5+6=0\), \(\vec b\cdot(-1,5,3)=-3+0+3=0\) ✓. ③ 크기 \(\sqrt{1+25+9}=\sqrt{35}\) → 단위벡터 \(\pm\frac{1}{\sqrt{35}}(-1,5,3)\)(두 개).</div></details></div>
  <div class="q"><div class="qn a">응용 1-2 · 세 점이 만드는 삼각형</div><p>세 점 P\((1,0,0)\), Q\((0,2,0)\), R\((0,0,3)\)이 만드는 삼각형의 넓이를 구하라.</p><details><summary>답</summary><div class="ans">① \(\overrightarrow{PQ}=(-1,2,0)\), \(\overrightarrow{PR}=(-1,0,3)\). ② \(\overrightarrow{PQ}\times\overrightarrow{PR}=(2\cdot3-0\cdot0)\vec i-((-1)\cdot3-0\cdot(-1))\vec j+((-1)\cdot0-2\cdot(-1))\vec k=(6,3,2)\). ③ 크기 \(\sqrt{36+9+4}=7\) = 평행사변형 넓이 → 삼각형 \(\frac72\).</div></details></div>
</section>
"""

P2 = r"""
<section>
  <h2><span class="no">파트 2 · 9/29</span>12.5 ① 직선의 방정식 — 방향코사인 · 방향비 · 매개방정식 · 대칭방정식</h2>
  <aside class="exam" data-level="강조" data-when="9/29 32:24~34:52">「직선·평면의 방정식 = 중간고사 문제에 관련된 내용 … 잘 체크해서 집중적으로」 · 암기한 공식만으로는 「응용하는 문제는 안 먹혀」 — 그림에서 유도</aside>
  <h3><span class="tag c">개념</span>P₀P = t v 한 줄에서 매개방정식과 대칭방정식이 나온다</h3>
  <div class="why">평면(\(\mathbb R^2\))에서는 직선을 기울기로 썼다. 공간(\(\mathbb R^3\))에서는 기울기 하나로 방향을 못 나타내서 방향벡터를 쓴다. 공식을 외우지 말고 그림(\(\overrightarrow{P_0P}\parallel\vec v\))에서 매번 유도할 수 있어야 한다.</div>
  <div class="concept">
    <p><b>① 방향코사인</b>(교수님 판서): 원점 O와 점 \(P_0(x_0,y_0,z_0)\)을 지나는 직선 g의 방향은 단위벡터 \(\frac{1}{|\overrightarrow{OP_0}|}\overrightarrow{OP_0}\). \(x\)축 단위벡터 \(\vec E_x=(1,0,0)\)과의 내적 \(\vec E_x\cdot\overrightarrow{OP_0}=x_0=|\overrightarrow{OP_0}|\cos\alpha\) → \[\cos\alpha=\frac{x_0}{|\overrightarrow{OP_0}|},\ \cos\beta=\frac{y_0}{|\overrightarrow{OP_0}|},\ \cos\gamma=\frac{z_0}{|\overrightarrow{OP_0}|}\] 이것을 \(l,m,n\)으로 부른다(9/22 방향코사인과 같은 식).</p>
    <p><b>ㄴ 부호 ±</b>: 직선은 반대로도 뻗으니 각에 \(\pi\)를 더한 방향도 같은 직선이고 \(\cos(\pi+\alpha)=-\cos\alpha\) → \(l=\pm\frac{x_0}{|\overrightarrow{OP_0}|}\), \(m\), \(n\)도 ±.</p>
    <p><b>ㄷ 방향비</b>: ±와 분모는 셋이 같으니 비는 고정 — \(l:m:n=x_0:y_0:z_0\)(direction ratio).</p>
    @@F_LINE@@
    <p><b>② 한 점과 방향벡터</b>: \(P_0(x_0,y_0,z_0)\)를 지나고 방향벡터 \(\vec v=(A,B,C)\)에 평행한 직선. 직선 위 점 \(P(x,y,z)\)이면 \(\overrightarrow{P_0P}=(x-x_0,\,y-y_0,\,z-z_0)\parallel\vec v\) ⇔ \(\overrightarrow{P_0P}=t\vec v\)인 실수 \(t\)가 있다.</p>
    <p><b>매개방정식</b>: 성분끼리 같다고 놓으면 \[x=x_0+tA,\qquad y=y_0+tB,\qquad z=z_0+tC\] \(t\)(매개변수)가 모든 실수를 돌면 직선 전체가 그려진다.</p>
    <p><b>대칭방정식</b>: 세 식을 \(t\)에 대해 풀어 같다고 놓으면 \[\frac{x-x_0}{A}=\frac{y-y_0}{B}=\frac{z-z_0}{C}\ (=t)\] 분모 \(A,B,C\)가 방향비 역할. <b>[교재 보충]</b> 성분 하나가 0이면(예 \(B=0\)) 그 좌표는 상수: \(\frac{x-x_0}{A}=\frac{z-z_0}{C},\ y=y_0\).</p>
    <p><b>[교재 보충] 두 점을 지나는 직선</b>: A, B를 지나면 \(\vec v=\overrightarrow{AB}\). <b>두 직선의 위치</b>: 방향벡터가 평행하면 평행(또는 일치), 아니면 연립해서 해가 있으면 한 점에서 만나고, 없으면 <b>꼬인 위치</b>(평행하지도 만나지도 않음 — 공간에서만).</p>
  </div>
  <div class="one">한 줄: \(l,m,n=\pm\frac{x_0,y_0,z_0}{|\overrightarrow{OP_0}|}\), 방향비 \(x_0:y_0:z_0\) · \(\overrightarrow{P_0P}=t\vec v\) → 매개 \(x=x_0+tA\) … → 대칭 \(\frac{x-x_0}A=\frac{y-y_0}B=\frac{z-z_0}C\).</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>\(\cos\alpha=x_0/|\overrightarrow{OP_0}|\) … (\(l,m,n\)), 부호 ±</li><li>방향비 \(l:m:n=x_0:y_0:z_0\)</li><li>매개방정식 · 대칭방정식</li><li>공간의 두 직선: 평행 · 교차 · 꼬인 위치</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>\(\overrightarrow{P_0P}=t\vec v\) 그림에서 두 방정식을 유도하는 과정</li><li>방향코사인이 ±까지만 정해지는 이유</li><li>방향벡터 성분이 0일 때 대칭방정식을 고쳐 쓰는 이유</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 2-1 · 방향코사인</div><p>원점과 \(P_0(2,-1,2)\)를 지나는 직선의 방향코사인 \((l,m,n)\)은?</p><ol class="choices"><li data-ok="1">\(\pm\left(\frac23,-\frac13,\frac23\right)\)</li><li>\((2,-1,2)\)</li><li>\(\pm\left(\frac29,-\frac19,\frac29\right)\)</li><li>\(\left(\frac23,\frac13,\frac23\right)\)</li></ol><details><summary>답</summary><div class="ans">\(|\overrightarrow{OP_0}|=\sqrt{4+1+4}=3\) → \(l=\pm\frac23\), \(m=\mp\frac13\), \(n=\pm\frac23\)(복부호 동순). 제곱하지 않은 거리 9로 나누면 틀린다.</div></details></div>
  <div class="q"><div class="qn">기초 2-2 · 매개방정식</div><p>점 \((1,2,-1)\)을 지나고 \(\vec v=(3,0,4)\)에 평행한 직선의 매개방정식은?</p><ol class="choices"><li data-ok="1">\(x=1+3t,\ y=2,\ z=-1+4t\)</li><li>\(x=3+t,\ y=2t,\ z=4-t\)</li><li>\(x=1+3t,\ y=2+t,\ z=-1+4t\)</li><li>\(x=3t,\ y=0,\ z=4t\)</li></ol><details><summary>답</summary><div class="ans">\(x=x_0+tA\) 꼴: \(1+3t\), \(2+0\cdot t=2\), \(-1+4t\). 점과 방향을 바꿔 넣으면 다른 직선.</div></details></div>
  <div class="q"><div class="qn">기초 2-3 · 두 점과 대칭방정식</div><p>A\((1,0,2)\), B\((3,4,1)\)을 지나는 직선의 대칭방정식은?</p><ol class="choices"><li data-ok="1">\(\frac{x-1}{2}=\frac{y}{4}=\frac{z-2}{-1}\)</li><li>\(\frac{x-1}{3}=\frac{y}{4}=\frac{z-2}{1}\)</li><li>\(\frac{x+1}{2}=\frac{y}{4}=\frac{z+2}{-1}\)</li><li>\(\frac{x-2}{1}=\frac{y-4}{0}=\frac{z+1}{2}\)</li></ol><details><summary>답</summary><div class="ans">\(\vec v=\overrightarrow{AB}=(2,4,-1)\), 점 A → \(\frac{x-1}{2}=\frac{y-0}{4}=\frac{z-2}{-1}\). B의 좌표를 분모에 쓰면 틀린다.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 2-1 · xy평면과 만나는 점</div><p>A\((1,3,-2)\), B\((2,1,2)\)를 지나는 직선이 \(xy\)평면과 만나는 점을 구하라.</p><details><summary>답</summary><div class="ans">① \(\vec v=\overrightarrow{AB}=(1,-2,4)\) → 매개 \(x=1+t,\ y=3-2t,\ z=-2+4t\). ② \(xy\)평면은 \(z=0\) → \(-2+4t=0\) → \(t=\frac12\). ③ \((1.5,\ 2,\ 0)\).</div></details></div>
  <div class="q"><div class="qn a">응용 2-2 · 두 직선의 위치 관계</div><p>\(L_1:\ x=1+2t,\ y=t,\ z=3-t\)과 \(L_2:\ x=s,\ y=2+s,\ z=1+2s\)가 평행한지, 만나는지, 꼬인 위치인지 판정하라.</p><details><summary>답</summary><div class="ans">① 방향 \(\vec v_1=(2,1,-1)\), \(\vec v_2=(1,1,2)\) — 한쪽이 다른 쪽의 실수배가 아니므로 평행 아님. ② 만나는지: \(1+2t=s\), \(t=2+s\)를 풀면 \(t=-3,\ s=-5\). ③ 셋째 좌표: \(3-t=6\), \(1+2s=-9\) → 다르다 → 공통점 없음. ∴ 평행하지도 만나지도 않는 <b>꼬인 위치</b>.</div></details></div>
</section>
"""

P3 = r"""
<section>
  <h2><span class="no">파트 3 · 교재 선행</span>12.5 ② 평면의 방정식 — 법선벡터 · 두 평면 · 점과 평면 사이 거리</h2>
  <h3><span class="tag c">개념</span>n · (r − r₀) = 0 → a(x−x₀) + b(y−y₀) + c(z−z₀) = 0</h3>
  <div class="why">직선은 방향벡터 하나로 정해졌다. 평면은 「평면에 수직인 방향」 하나(법선벡터)와 한 점으로 정해진다. 세 점이 주어지면 법선을 외적으로 만든다 — 파트 1의 외적(두 벡터에 동시에 수직)이 여기서 쓰인다.</div>
  <div class="concept">
    <p><b>법선벡터</b>: 평면에 수직인 벡터 \(\vec n=(a,b,c)\). 평면 위의 한 점 \(P_0(x_0,y_0,z_0)\)과 임의의 점 \(P(x,y,z)\)에 대해 \(\overrightarrow{P_0P}=\vec r-\vec r_0\)는 평면 안의 벡터라 \(\vec n\)과 수직(내적 0).</p>
    @@F_PLANE@@
    <p><b>평면의 방정식</b>: \[\vec n\cdot(\vec r-\vec r_0)=0\iff a(x-x_0)+b(y-y_0)+c(z-z_0)=0\] 전개하면 \(ax+by+cz+d=0\)(일차방정식). 거꾸로 \(ax+by+cz+d=0\)의 법선은 계수 \((a,b,c)\).</p>
    <p><b>세 점을 지나는 평면</b>: P, Q, R이면 \(\vec n=\overrightarrow{PQ}\times\overrightarrow{PR}\)(두 벡터에 동시에 수직 = 평면에 수직), 점은 셋 중 아무거나.</p>
    <p><b>두 평면</b>: 법선이 평행하면 평면도 평행. 두 평면이 이루는 각 = 법선 사이 각 \(\cos\theta=\dfrac{|\vec n_1\cdot\vec n_2|}{|\vec n_1||\vec n_2|}\). 평행하지 않은 두 평면의 교선은 직선이고, 방향은 \(\vec n_1\times\vec n_2\)(두 법선 모두에 수직).</p>
    <p><b>직선과 평면의 교점</b>: 직선의 매개방정식을 평면 식에 넣어 \(t\)를 구한다.</p>
    <p><b>점과 평면 사이 거리</b>: 점 \((x_1,y_1,z_1)\)에서 평면 \(ax+by+cz+d=0\)까지 \[D=\frac{|ax_1+by_1+cz_1+d|}{\sqrt{a^2+b^2+c^2}}\] (평면 위 한 점에서 그 점으로 가는 벡터를 법선 방향으로 정사영한 길이 — 12.3 정사영.)</p>
  </div>
  <div class="one">한 줄: \(a(x-x_0)+b(y-y_0)+c(z-z_0)=0\), 법선 = 계수 · 세 점 → \(\vec n=\overrightarrow{PQ}\times\overrightarrow{PR}\) · 두 평면 각 = 법선 각, 교선 방향 \(\vec n_1\times\vec n_2\) · 거리 \(\frac{|ax_1+by_1+cz_1+d|}{\sqrt{a^2+b^2+c^2}}\).</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>\(\vec n\cdot(\vec r-\vec r_0)=0\), \(ax+by+cz+d=0\)의 법선 \((a,b,c)\)</li><li>세 점 평면의 법선 = 외적</li><li>교선 방향 \(\vec n_1\times\vec n_2\)</li><li>점-평면 거리 공식</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>평면 위 벡터가 모두 법선과 수직인 이유</li><li>두 평면의 각을 법선으로 재는 이유</li><li>거리 공식이 정사영인 이유</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 3-1 · 평면의 방정식</div><p>점 \((1,-2,3)\)을 지나고 법선벡터가 \((2,1,-1)\)인 평면은?</p><ol class="choices"><li data-ok="1">\(2x+y-z+3=0\)</li><li>\(2x+y-z-3=0\)</li><li>\(x-2y+3z=0\)</li><li>\(2x+y-z=0\)</li></ol><details><summary>답</summary><div class="ans">\(2(x-1)+(y+2)-(z-3)=0\) → \(2x-2+y+2-z+3=0\) → \(2x+y-z+3=0\). 검산: 점을 넣으면 \(2-2-3+3=0\) ✓.</div></details></div>
  <div class="q"><div class="qn">기초 3-2 · 법선벡터 읽기</div><p>평면 \(3x-y+2z=5\)의 법선벡터는?</p><ol class="choices"><li data-ok="1">\((3,-1,2)\)</li><li>\((3,-1,5)\)</li><li>\((-1,2,5)\)</li><li>\((3,1,2)\)</li></ol><details><summary>답</summary><div class="ans">\(ax+by+cz+d=0\)의 \(x,y,z\) 계수 \((3,-1,2)\). 오른쪽 상수 5는 위치(평행 이동)만 바꾼다.</div></details></div>
  <div class="q"><div class="qn">기초 3-3 · 점과 평면 사이 거리</div><p>점 \((1,2,3)\)과 평면 \(2x-y+2z=10\) 사이의 거리는?</p><ol class="choices"><li data-ok="1">\(\frac43\)</li><li>4</li><li>\(\frac{4}{9}\)</li><li>\(\frac{10}{3}\)</li></ol><details><summary>답</summary><div class="ans">\(2x-y+2z-10=0\)으로 옮겨 \(D=\frac{|2-2+6-10|}{\sqrt{4+1+4}}=\frac{4}{3}\). 분모에 제곱근을 빼먹으면 \(\frac49\).</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 3-1 · 세 점을 지나는 평면</div><p>P\((1,0,0)\), Q\((0,2,0)\), R\((0,0,3)\)을 지나는 평면의 방정식을 구하라.</p><details><summary>답</summary><div class="ans">① \(\overrightarrow{PQ}=(-1,2,0)\), \(\overrightarrow{PR}=(-1,0,3)\). ② \(\vec n=\overrightarrow{PQ}\times\overrightarrow{PR}=(6,3,2)\). ③ 점 P: \(6(x-1)+3y+2z=0\) → \(6x+3y+2z=6\). 검산: Q \(6=6\), R \(6=6\) ✓(양변 6으로 나누면 \(\frac x1+\frac y2+\frac z3=1\) — 절편형).</div></details></div>
  <div class="q"><div class="qn a">응용 3-2 · 두 평면의 각과 교선</div><p>두 평면 \(x+y+z=2\)와 \(x-y+2z=1\)이 이루는 각의 코사인과 교선의 매개방정식을 구하라.</p><details><summary>답</summary><div class="ans">① \(\vec n_1=(1,1,1)\), \(\vec n_2=(1,-1,2)\), \(\vec n_1\cdot\vec n_2=1-1+2=2\) → \(\cos\theta=\frac{2}{\sqrt3\sqrt6}=\frac{\sqrt2}{3}\)(약 62°). ② 교선 방향 \(\vec n_1\times\vec n_2=(1\cdot2-1\cdot(-1),\ -(1\cdot2-1\cdot1),\ 1\cdot(-1)-1\cdot1)=(3,-1,-2)\). ③ 교선 위 한 점: \(z=0\)으로 두면 \(x+y=2,\ x-y=1\) → \((1.5,0.5,0)\). ∴ \(x=1.5+3t,\ y=0.5-t,\ z=-2t\).</div></details></div>
  <div class="q"><div class="qn a">응용 3-3 · 직선과 평면의 교점</div><p>직선 \(x=1+t,\ y=2-t,\ z=3t\)와 평면 \(2x+y+z=7\)의 교점을 구하라.</p><details><summary>답</summary><div class="ans">평면 식에 넣으면 \(2(1+t)+(2-t)+3t=7\) → \(4+4t=7\) → \(t=\frac34\). 교점 \(\left(\frac74,\frac54,\frac94\right)\). 검산 \(\frac{14}{4}+\frac54+\frac94=\frac{28}{4}=7\) ✓.</div></details></div>
</section>
"""

P4 = r"""
<section>
  <h2><span class="no">파트 4 · 교재 선행</span>12.6 기둥면과 이차곡면 — 자취(단면)로 모양 알아보기</h2>
  <h3><span class="tag c">개념</span>빠진 변수 방향으로 민 곡면 = 기둥면 · x·y·z 의 2차식 = 이차곡면</h3>
  <div class="why">\(\mathbb R^3\)에서 방정식 하나는 곡면을 나타낸다. 곡면의 모양은 좌표평면과 평행한 평면으로 잘라 본 단면(자취)으로 알아낸다. 강의계획서에는 「기둥면」까지만 적혀 있어 이차곡면을 어디까지 다룰지는 수업을 봐야 안다.</div>
  <div class="concept">
    <p><b>기둥면(cylinder)</b>: 평면 곡선 하나와, 그 곡선을 지나며 한 직선에 평행한 모든 직선으로 이루어진 곡면. 방정식에 <b>변수 하나가 빠지면</b> 그 변수 축 방향의 기둥면이다.</p>
    @@F_CYL@@
    <p><b>예</b>: \(x^2+y^2=1\)은 \(\mathbb R^2\)에서는 원이지만 \(\mathbb R^3\)에서는 \(z\)가 무엇이든 성립 → 원을 \(z\)축 방향으로 민 원기둥. \(z=y^2\)은 \(x\)가 빠져 포물선을 \(x\)축 방향으로 민 포물기둥.</p>
    <p><b>자취(trace)</b>: \(z=k\)(수평) 또는 \(x=k,\ y=k\)(수직) 평면으로 잘랐을 때의 곡선. 이 단면들을 모아 입체를 떠올린다.</p>
    <p><b>이차곡면</b>: \(x,y,z\)의 2차방정식이 나타내는 곡면. 평행 이동·회전으로 아래 표준형 중 하나가 된다.</p>
    @@QUAD@@
    <p><b>알아보는 요령</b>: ① 1차로 들어간 변수가 있으면 포물면(부호가 같으면 타원포물면, 다르면 쌍곡포물면) ② 모두 2차면 = 1의 부호를 센다: + 셋이면 타원면, − 하나면 일엽쌍곡면, − 둘이면 이엽쌍곡면, 우변이 0이면 원뿔.</p>
  </div>
  <div class="one">한 줄: 빠진 변수 방향으로 민 것 = 기둥면 · 자취로 모양 판단 · 이차곡면 6종(타원면·원뿔·타원포물면·쌍곡포물면·일엽·이엽쌍곡면).</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>변수 하나가 빠지면 그 축 방향 기둥면</li><li>이차곡면 6종의 표준형</li><li>부호로 구별: 1차 변수 → 포물면, − 개수 → 일엽/이엽</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>\(\mathbb R^2\)의 원이 \(\mathbb R^3\)에서 원기둥이 되는 이유</li><li>자취로 입체를 그리는 방법</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q" data-def="R"><div class="qn">기초 4-1 · 기둥면</div><p>\(\mathbb R^3\)에서 \(x^2+y^2=4\)가 나타내는 도형은?</p><ol class="choices"><li data-ok="1">\(z\)축 방향으로 뻗은 반지름 2인 원기둥</li><li>반지름 2인 원</li><li>반지름 2인 구</li><li>\(z=4\)인 평면</li></ol><details><summary>답</summary><div class="ans">\(z\)가 빠져 있어 모든 \(z\)에서 성립 → \(xy\)평면의 원 \(x^2+y^2=4\)를 \(z\)축 방향으로 민 원기둥. 원으로 답하면 \(\mathbb R^2\)의 답이다.</div></details></div>
  <div class="q"><div class="qn">기초 4-2 · 이차곡면 이름</div><p>\(z=y^2-x^2\)이 나타내는 곡면은?</p><ol class="choices"><li data-ok="1">쌍곡포물면(말안장)</li><li>타원포물면</li><li>원뿔</li><li>일엽쌍곡면</li></ol><details><summary>답</summary><div class="ans">\(z\)가 1차 → 포물면. \(x^2\)과 \(y^2\)의 부호가 다르다 → 쌍곡포물면. 수평 자취 \(y^2-x^2=k\)는 쌍곡선, 수직 자취는 포물선.</div></details></div>
  <div class="q"><div class="qn">기초 4-3 · 부호 세기</div><p>\(x^2+y^2-z^2=1\)이 나타내는 곡면은?</p><ol class="choices"><li data-ok="1">일엽쌍곡면</li><li>이엽쌍곡면</li><li>타원면</li><li>원뿔</li></ol><details><summary>답</summary><div class="ans">모두 2차이고 우변 1, − 부호가 하나 → 일엽쌍곡면(한 덩어리). 수평 자취 \(x^2+y^2=1+k^2\)는 어떤 높이에서도 원이 있다. − 둘이면 이엽, 우변 0이면 원뿔.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 4-1 · 자취로 모양 알기</div><p>곡면 \(z=4x^2+y^2\)의 자취를 (a) \(z=4\) (b) \(x=0\)에서 구하고 곡면 이름을 쓰라.</p><details><summary>답</summary><div class="ans">(a) \(4x^2+y^2=4\) → \(x^2+\frac{y^2}{4}=1\) — 타원. (b) \(z=y^2\) — 포물선. 수평 자취가 타원, 수직 자취가 포물선이고 \(z\)가 1차 → <b>타원포물면</b>(\(z\ge0\), 원점이 꼭짓점).</div></details></div>
</section>
"""

P5 = r"""
<section>
  <h2><span class="no">파트 5 · 교재 선행</span>13.1 벡터함수와 공간곡선</h2>
  <h3><span class="tag c">개념</span>r(t) = ⟨f(t), g(t), h(t)⟩ — 실수 t 하나에 벡터 하나, 끝점이 그리는 것이 공간곡선</h3>
  <div class="why">12.5의 직선 \(\vec r=\vec r_0+t\vec v\)가 사실 벡터함수의 가장 간단한 예다. 성분을 \(t\)의 아무 함수로 바꾸면 공간의 곡선(나선, 교선 등)을 나타낼 수 있다. 계산은 늘 「성분별로」다.</div>
  <div class="concept">
    <p><b>벡터함수</b>: 정의역이 실수, 값이 벡터인 함수 \(\vec r(t)=\langle f(t),g(t),h(t)\rangle=f(t)\vec i+g(t)\vec j+h(t)\vec k\). \(f,g,h\)를 성분함수라 한다. 정의역은 세 성분함수가 <b>모두</b> 정의되는 \(t\).</p>
    <p><b>극한</b>: 성분별로 \(\lim_{t\to a}\vec r(t)=\left\langle\lim f,\lim g,\lim h\right\rangle\)(셋 다 존재할 때). <b>연속</b>: \(\lim_{t\to a}\vec r(t)=\vec r(a)\) ⇔ 세 성분이 모두 연속.</p>
    <p><b>공간곡선</b>: \(x=f(t),\ y=g(t),\ z=h(t)\)(매개방정식)를 만족하는 점들의 모임. \(\vec r(t)\)는 원점에서 곡선 위 점까지의 위치벡터.</p>
    @@F_HELIX@@
    <p><b>예(나선)</b>: \(\vec r(t)=\langle\cos t,\sin t,t\rangle\) — \(x^2+y^2=\cos^2t+\sin^2t=1\)이라 늘 원기둥 위에 있고, \(t\)가 늘면 \(z\)가 올라가 나선이 된다.</p>
    <p><b>선분</b>: \(\vec r_0\)에서 \(\vec r_1\)까지 \(\vec r(t)=(1-t)\vec r_0+t\vec r_1,\ 0\le t\le1\).</p>
    <p><b>두 곡면의 교선 매개화</b>: 원기둥 \(x^2+y^2=R^2\)이 들어 있으면 \(x=R\cos t,\ y=R\sin t\)로 두고 나머지 식에서 \(z\)를 \(t\)로 쓴다.</p>
    <p><b>[고등 수학 복습]</b> \(\lim_{t\to0}\frac{\sin t}{t}=1\), \(\lim_{t\to0}\frac{e^t-1}{t}=1\), \(\ln u\)는 \(u&gt;0\)에서만, \(\sqrt u\)는 \(u\ge0\)에서만 정의된다.</p>
  </div>
  <div class="one">한 줄: \(\vec r(t)=\langle f,g,h\rangle\) · 정의역은 세 성분 공통 · 극한·연속은 성분별 · 선분 \((1-t)\vec r_0+t\vec r_1\) · 원기둥 교선은 \(x=R\cos t,\ y=R\sin t\).</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>정의역 = 성분함수 정의역의 교집합</li><li>극한·연속은 성분별</li><li>선분 \((1-t)\vec r_0+t\vec r_1\), \(0\le t\le1\)</li><li>나선 \(\langle\cos t,\sin t,t\rangle\)</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>직선 \(\vec r_0+t\vec v\)도 벡터함수인 것</li><li>교선을 매개화할 때 원기둥을 \(\cos,\sin\)으로 두는 이유</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 5-1 · 정의역</div><p>\(\vec r(t)=\left\langle e^t,\ \ln(t-1),\ \sqrt{5-t}\right\rangle\)의 정의역은?</p><ol class="choices"><li data-ok="1">\(1\lt t\le5\)</li><li>\(1\le t\le5\)</li><li>\(t&gt;1\)</li><li>\(t\le5\)</li></ol><details><summary>답</summary><div class="ans">\(e^t\)는 모든 \(t\), \(\ln(t-1)\)은 \(t&gt;1\), \(\sqrt{5-t}\)는 \(t\le5\) → 교집합 \(1\lt t\le5\).</div></details></div>
  <div class="q"><div class="qn">기초 5-2 · 극한</div><p>\(\lim_{t\to0}\left\langle\cos t,\ \frac{e^t-1}{t},\ t^2+2\right\rangle\)은?</p><ol class="choices"><li data-ok="1">\(\langle1,1,2\rangle\)</li><li>\(\langle1,0,2\rangle\)</li><li>\(\langle0,1,2\rangle\)</li><li>존재하지 않는다</li></ol><details><summary>답</summary><div class="ans">성분별: \(\cos0=1\), \(\lim\frac{e^t-1}{t}=1\), \(0+2=2\). 가운데를 그냥 넣으면 \(\frac00\)이라 막히는데 알려진 극한 1이다.</div></details></div>
  <div class="q"><div class="qn">기초 5-3 · 곡선 알아보기</div><p>\(\vec r(t)=\langle\cos t,\sin t,t\rangle\)이 그리는 곡선은?</p><ol class="choices"><li data-ok="1">원기둥 \(x^2+y^2=1\) 둘레를 돌며 올라가는 나선</li><li>\(xy\)평면의 원</li><li>원점을 지나는 직선</li><li>구면에 놓인 원</li></ol><details><summary>답</summary><div class="ans">\(x^2+y^2=1\)을 늘 만족하고 \(z=t\)가 계속 늘어난다 → 나선. \(z\)가 없으면 원이 된다.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 5-1 · 선분의 벡터함수</div><p>P\((1,3,-2)\)에서 Q\((2,-1,3)\)까지의 선분을 벡터함수로 나타내라.</p><details><summary>답</summary><div class="ans">\(\vec r(t)=(1-t)\langle1,3,-2\rangle+t\langle2,-1,3\rangle=\langle1+t,\ 3-4t,\ -2+5t\rangle\), \(0\le t\le1\). 검산: \(t=0\)이면 P, \(t=1\)이면 Q ✓. 이것은 방향벡터 \(\overrightarrow{PQ}=(1,-4,5)\)인 직선의 일부.</div></details></div>
  <div class="q"><div class="qn a">응용 5-2 · 교선의 매개화</div><p>원기둥 \(x^2+y^2=4\)와 평면 \(z=1+x\)가 만나는 곡선을 벡터함수로 나타내라.</p><details><summary>답</summary><div class="ans">① 원기둥: \(x=2\cos t,\ y=2\sin t\)(\(x^2+y^2=4\cos^2t+4\sin^2t=4\) ✓). ② 평면: \(z=1+x=1+2\cos t\). ∴ \(\vec r(t)=\langle2\cos t,\ 2\sin t,\ 1+2\cos t\rangle\), \(0\le t\le2\pi\) — 기울어진 타원.</div></details></div>
</section>
"""

P6 = r"""
<section>
  <h2><span class="no">파트 6 · 교재 선행</span>13.2 벡터함수의 미분과 적분 — 접선벡터 · 단위접선벡터 · 미분 규칙</h2>
  <h3><span class="tag c">개념</span>r′(t) = ⟨f′, g′, h′⟩ — 곡선의 접선 방향. 적분도 성분별</h3>
  <div class="why">1학기 미분을 성분마다 한 번씩 하면 된다. 새로 생기는 뜻은 방향: \(\vec r'(t)\)는 곡선에 접하는 벡터라 접선의 방정식을 만들 수 있다.</div>
  <div class="concept">
    <p><b>도함수</b>: \(\vec r'(t)=\lim_{h\to0}\dfrac{\vec r(t+h)-\vec r(t)}{h}=\langle f'(t),g'(t),h'(t)\rangle\). 성분별로 미분한다.</p>
    @@F_TAN@@
    <p><b>접선벡터</b>: \(\vec r'(t)\neq\vec0\)이면 점 \(\vec r(t)\)에서 곡선에 접하는 방향. <b>단위접선벡터</b> \(\vec T(t)=\dfrac{\vec r'(t)}{|\vec r'(t)|}\). <b>접선</b>: 점 \(\vec r(t_0)\)을 지나고 방향 \(\vec r'(t_0)\)인 직선(12.5 매개방정식).</p>
    <p><b>미분 규칙</b>(\(\vec u,\vec v\): 벡터함수, \(c\): 상수, \(f\): 실수함수): \((\vec u+\vec v)'=\vec u'+\vec v'\) · \((c\vec u)'=c\vec u'\) · \((f\vec u)'=f'\vec u+f\vec u'\) · \((\vec u\cdot\vec v)'=\vec u'\cdot\vec v+\vec u\cdot\vec v'\) · \((\vec u\times\vec v)'=\vec u'\times\vec v+\vec u\times\vec v'\)(외적은 순서 유지) · \(\vec u(f(t))'=f'(t)\,\vec u'(f(t))\).</p>
    <p><b>중요한 결과</b>: \(|\vec r(t)|=c\)(일정)이면 \(\vec r(t)\cdot\vec r'(t)=0\) — 구면 위를 움직이면 위치와 접선이 늘 수직. 이유: \(\vec r\cdot\vec r=c^2\)을 미분하면 \(2\vec r\cdot\vec r'=0\).</p>
    <p><b>적분</b>: 성분별로 \(\int_a^b\vec r(t)\,dt=\left\langle\int_a^bf,\int_a^bg,\int_a^bh\right\rangle\). 부정적분은 \(\vec R(t)+\vec C\)(\(\vec C\): 상수 벡터), 미적분학의 기본정리 \(\int_a^b\vec r\,dt=\vec R(b)-\vec R(a)\)도 그대로.</p>
  </div>
  <div class="one">한 줄: \(\vec r'=\langle f',g',h'\rangle\) = 접선 방향 · \(\vec T=\vec r'/|\vec r'|\) · 내적·외적의 곱 미분(외적은 순서 유지) · \(|\vec r|\) 일정 → \(\vec r\cdot\vec r'=0\) · 적분은 성분별 + 상수 벡터.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>\(\vec r'(t)\), \(\vec T(t)=\vec r'/|\vec r'|\)</li><li>\((\vec u\cdot\vec v)'\), \((\vec u\times\vec v)'\) 곱의 미분</li><li>\(|\vec r|=c\Rightarrow\vec r\cdot\vec r'=0\)</li><li>적분 = 성분별, 부정적분 + \(\vec C\)</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>\(\vec r'\)가 접선 방향인 이유(할선 → 접선)</li><li>외적 미분에서 순서를 바꾸면 안 되는 이유</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 6-1 · 도함수</div><p>\(\vec r(t)=\langle t^3,\ e^{2t},\ \sin3t\rangle\)의 \(\vec r'(t)\)는?</p><ol class="choices"><li data-ok="1">\(\langle3t^2,\ 2e^{2t},\ 3\cos3t\rangle\)</li><li>\(\langle3t^2,\ e^{2t},\ \cos3t\rangle\)</li><li>\(\langle t^2,\ 2e^{t},\ -3\cos3t\rangle\)</li><li>\(\langle3t^2,\ 2e^{2t},\ -3\cos3t\rangle\)</li></ol><details><summary>답</summary><div class="ans">성분별로: \((t^3)'=3t^2\), \((e^{2t})'=2e^{2t}\)(합성함수), \((\sin3t)'=3\cos3t\).</div></details></div>
  <div class="q"><div class="qn">기초 6-2 · 단위접선벡터</div><p>\(\vec r(t)=\langle1+t,\ 2t,\ t^2\rangle\)의 \(t=0\)에서 단위접선벡터는?</p><ol class="choices"><li data-ok="1">\(\frac{1}{\sqrt5}\langle1,2,0\rangle\)</li><li>\(\langle1,2,0\rangle\)</li><li>\(\frac{1}{\sqrt5}\langle1,0,0\rangle\)</li><li>\(\frac{1}{3}\langle1,2,2\rangle\)</li></ol><details><summary>답</summary><div class="ans">\(\vec r'(t)=\langle1,2,2t\rangle\) → \(\vec r'(0)=\langle1,2,0\rangle\), 크기 \(\sqrt5\) → \(\vec T(0)=\frac{1}{\sqrt5}\langle1,2,0\rangle\). 크기로 나누지 않으면 단위벡터가 아니다.</div></details></div>
  <div class="q"><div class="qn">기초 6-3 · 외적의 미분</div><p>\(\dfrac{d}{dt}[\vec u(t)\times\vec v(t)]\)는?</p><ol class="choices"><li data-ok="1">\(\vec u'\times\vec v+\vec u\times\vec v'\)</li><li>\(\vec u'\times\vec v'\)</li><li>\(\vec v'\times\vec u+\vec v\times\vec u'\)</li><li>\(\vec u'\cdot\vec v+\vec u\cdot\vec v'\)</li></ol><details><summary>답</summary><div class="ans">곱의 미분과 같은 모양, 단 외적은 \(\vec a\times\vec b=-\vec b\times\vec a\)라 순서를 그대로 둔다. 셋째 보기는 순서를 뒤집어 부호가 반대.</div></details></div>
  <div class="q"><div class="qn">기초 6-4 · 적분</div><p>\(\int_0^1\langle2t,\ 3t^2,\ 1\rangle\,dt\)는?</p><ol class="choices"><li data-ok="1">\(\langle1,1,1\rangle\)</li><li>\(\langle2,3,1\rangle\)</li><li>\(\langle t^2,t^3,t\rangle\)</li><li>\(\langle1,1,0\rangle\)</li></ol><details><summary>답</summary><div class="ans">성분별 정적분: \([t^2]_0^1=1\), \([t^3]_0^1=1\), \([t]_0^1=1\). 정적분의 답은 벡터 하나(상수)다.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 6-1 · 접선의 방정식</div><p>곡선 \(\vec r(t)=\langle2\cos t,\ \sin t,\ t\rangle\)에서 \(t=\frac\pi2\)인 점의 접선의 매개방정식을 구하라.</p><details><summary>답</summary><div class="ans">① 점: \(\vec r(\frac\pi2)=\langle0,1,\frac\pi2\rangle\). ② \(\vec r'(t)=\langle-2\sin t,\ \cos t,\ 1\rangle\) → \(\vec r'(\frac\pi2)=\langle-2,0,1\rangle\). ③ 접선: \(x=-2s,\ y=1,\ z=\frac\pi2+s\)(\(s\): 매개변수).</div></details></div>
  <div class="q"><div class="qn a">응용 6-2 · 도함수에서 원래 함수</div><p>\(\vec r'(t)=\langle2t,\ 3t^2,\ 4t^3\rangle\)이고 \(\vec r(0)=\langle1,0,-1\rangle\)일 때 \(\vec r(t)\)를 구하라.</p><details><summary>답</summary><div class="ans">성분별 부정적분: \(\vec r(t)=\langle t^2,\ t^3,\ t^4\rangle+\vec C\). \(t=0\): \(\vec C=\langle1,0,-1\rangle\). ∴ \(\vec r(t)=\langle t^2+1,\ t^3,\ t^4-1\rangle\). 검산: 미분하면 \(\langle2t,3t^2,4t^3\rangle\) ✓.</div></details></div>
  <div class="q"><div class="qn a">응용 6-3 · 증명 — 크기가 일정하면 수직</div><p>모든 \(t\)에서 \(|\vec r(t)|=c\)(상수)인 미분가능한 벡터함수에 대해 \(\vec r(t)\cdot\vec r'(t)=0\)임을 보여라.</p><details><summary>답</summary><div class="ans">① \(\vec r(t)\cdot\vec r(t)=|\vec r(t)|^2=c^2\)(상수). ② 양변을 \(t\)로 미분: 왼쪽은 내적의 곱 미분으로 \(\vec r'\cdot\vec r+\vec r\cdot\vec r'=2\vec r\cdot\vec r'\), 오른쪽은 0. ③ \(2\vec r\cdot\vec r'=0\) → \(\vec r\cdot\vec r'=0\). 뜻: 원점 중심 구면 위를 움직이는 점의 속도(접선)는 늘 위치벡터에 수직.</div></details></div>
</section>
"""

TAIL = "\n</body>\n</html>\n"

def build():
    body = HEAD + P1 + P2 + P3 + P4 + P5 + P6 + TAIL
    rep = {"@@F_LINE@@": F_LINE, "@@F_PLANE@@": F_PLANE, "@@F_CYL@@": F_CYL, "@@QUAD@@": QUAD, "@@F_HELIX@@": F_HELIX, "@@F_TAN@@": F_TAN}
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
