# -*- coding: utf-8 -*-
"""정역학 · 중간고사 대비 2 — Ch.4 힘계와 모멘트(9/21·9/23·9/28 수업분) + Ch.5 강체의 평형(교재 선행) 정리노트 v2 생성기
대표님 2026-09-30 「교재에 있는 개념으로 우선적으로 시험범위 내용 정리 … 나머지 과목들도」.
근거(§24 교수 자료 우선): 파트 1~3 = 수업한 회차라 교수 필기·영상 요약이 뼈대 — 2026-09-21·23·28 폴더의 교수필기_한글_*.md · 수업요약_*.md
  (M_P = DF, 반시계 +, M_P = r × F 「작용선 위 아무 점」, 바리뇽, M_L = [e·(r×F)]e 삼중적, 우력 |M| = DF, 등가계, 힘 옮기기, 렌치).
  파트 4~6 = Ch.5 는 아직 수업 전 — OT 주차표의 Bedford & Fowler 장 구성(5.1 2D · 5.2 부정정 · 5.3 3D · 5.4 2력·3력)에 교재 개념을 채움(폴더의 Pytel 4e 는 장 번호가 달라 개념만).
범위: 중간 10/19 = Ch.3~5(OT·수업 확인). 문제는 수업 예제·교재 유형을 숫자만 바꿔 새로 만들고 statics_ahead_check.py 로 검산.
출력: study-materials/정역학/_정리노트/2026-09-30_정역학_중간대비_Ch4-5.html → build_slides.py → 덱 statics-mid2"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *

OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\정역학\_정리노트\2026-09-30_정역학_중간대비_Ch4-5.html"
FIGS = []

def fig(w, h, *parts, cap="", name=""):
    FIGS.append(name)
    s = canvas(w, h, *parts, cap=cap, name=name)
    s = s.replace('<svg class="fig-svg"', '<svg class="fig-svg" style="max-width:100%;height:auto"', 1)
    return s.replace("<figcaption>", '<figcaption style="font-size:.86em;opacity:.85;margin-top:4px">', 1)

# ---- 지지 기호 ----
def hatch_h(x0, x1, y, down=True):
    s = line(x0, y, x1, y, INK, 1.8)
    for k in range(int((x1 - x0) // 8) + 1):
        xx = x0 + 8 * k
        s += line(xx, y, xx - 6, y + 7 if down else y - 7, GRAY, 1.1)
    return s
def hatch_v(x, y0, y1):
    s = line(x, y0, x, y1, INK, 2)
    for k in range(int((y1 - y0) // 8) + 1):
        yy = y0 + 8 * k
        s += line(x, yy, x - 7, yy + 6, GRAY, 1.1)
    return s
def pin_sup(x, y):
    return path(f"M{x} {y} L{x-14} {y+24} L{x+14} {y+24} Z", INK, 2, "#F1F3F5") + hatch_h(x - 22, x + 22, y + 24) + f'<circle cx="{x}" cy="{y}" r="4" fill="#fff" stroke="{INK}" stroke-width="2"/>'
def roller_sup(x, y):
    return (path(f"M{x} {y} L{x-12} {y+16} L{x+12} {y+16} Z", INK, 2, "#F1F3F5") + circle(x - 6, y + 21, 4.5, INK, fill="#fff") + circle(x + 6, y + 21, 4.5, INK, fill="#fff")
            + hatch_h(x - 22, x + 22, y + 26) + f'<circle cx="{x}" cy="{y}" r="4" fill="#fff" stroke="{INK}" stroke-width="2"/>')

def _dfig():
    L0, L1, Pp = (110, 40), (490, 124), (250, 172)
    ux, uy = L1[0] - L0[0], L1[1] - L0[1]; n = math.hypot(ux, uy); ux, uy = ux / n, uy / n
    t = (Pp[0] - L0[0]) * ux + (Pp[1] - L0[1]) * uy
    fx, fy = round(L0[0] + t * ux, 1), round(L0[1] + t * uy, 1)
    qx, qy = 300, round(L0[1] + (300 - L0[0]) * (L1[1] - L0[1]) / (L1[0] - L0[0]), 1)
    ex, ey = 400, round(L0[1] + (400 - L0[0]) * (L1[1] - L0[1]) / (L1[0] - L0[0]), 1)
    s = line(L0[0], L0[1], L1[0], L1[1], GRAY, 1.4, "6 4") + text(488, 144, "작용선", 12, GRAY, "end")
    s += arrow(qx, qy, ex, ey, RED, "", 2.6) + text(405, 94, "F", 14, RED, "start", True)
    s += dot(Pp[0], Pp[1]) + text(236, 178, "P", 14, INK, "end", True)
    s += line(Pp[0], Pp[1], fx, fy, GREEN, 1.8) + text(246, 124, "D", 14, GREEN, "end", True)
    k = 9; px, py = -uy, ux   # 작용선에 수직(P 쪽)
    if (Pp[0] - fx) * px + (Pp[1] - fy) * py < 0: px, py = -px, -py
    s += path(f"M{fx + k*px:.1f} {fy + k*py:.1f} L{fx + k*px - k*ux:.1f} {fy + k*py - k*uy:.1f} L{fx - k*ux:.1f} {fy - k*uy:.1f}", GREEN, 1.4)
    s += arrow(Pp[0], Pp[1], qx, qy, BLUE, "", 1.8) + text(292, 140, "r", 14, BLUE, "start", True)
    s += text(60, 30, "M_P = DF = |r × F|", 14, INK, "start", True)
    return s
F_DF = fig(520, 196, _dfig(), cap="점 P에 대한 모멘트: 크기 = 힘 × (P에서 작용선까지의 수직거리 D). 벡터로는 \\(\\vec M_P=\\vec r\\times\\vec F\\), \\(\\vec r\\)는 P에서 작용선 위 아무 점까지.", name="df")

def _couple():
    s = arrow(200, 160, 200, 70, RED, "", 2.6) + text(186, 66, "F", 14, RED, "end", True)
    s += arrow(320, 70, 320, 160, RED, "", 2.6) + text(334, 168, "−F", 14, RED, "start", True)
    s += line(200, 70, 200, 40, GRAY, 1, "4 3") + line(320, 70, 320, 40, GRAY, 1, "4 3")
    s += brace_label(200, 320, 32, "")
    s += text(260, 26, "D", 14, INK, "middle", True)
    s += '<path d="M228.1 103.4 A 34 34 0 0 1 289.4 98" fill="none" stroke="' + BLUE + '" stroke-width="2" marker-end="url(#ah)"/>'
    s += text(400, 110, "ΣF = 0", 14, INK, "start", True) + text(400, 134, "|M| = DF", 14, BLUE, "start", True)
    return s
F_COUPLE = fig(520, 190, _couple(), cap="우력: 크기가 같고 방향이 반대인 두 힘(작용선이 다름). 알짜힘은 0인데 회전은 준다. 모멘트는 어느 점에 대해 재도 같다.", name="couple")

def _supports():
    s = ""
    # 핀
    s += line(40, 70, 130, 70, INK, 6) + pin_sup(90, 74) + text(90, 30, "핀 지지 — 미지수 2", 13, INK, "middle", True)
    s += arrow(40, 90, 80, 90, RED, "", 2.2) + text(36, 95, "A_x", 13, RED, "end") + arrow(90, 170, 90, 116, RED, "", 2.2) + text(98, 166, "A_y", 13, RED)
    # 롤러
    s += line(210, 70, 300, 70, INK, 6) + roller_sup(255, 74) + text(255, 30, "롤러 — 미지수 1", 13, INK, "middle", True)
    s += arrow(255, 170, 255, 118, RED, "", 2.2) + text(263, 166, "B_y", 13, RED)
    # 고정
    s += hatch_v(400, 44, 120) + line(400, 72, 500, 72, INK, 6) + text(450, 30, "고정 지지 — 미지수 3", 13, INK, "middle", True)
    s += arrow(452, 110, 404, 110, RED, "", 2.2) + text(458, 115, "A_x", 13, RED) + arrow(430, 176, 430, 124, RED, "", 2.2) + text(438, 172, "A_y", 13, RED)
    s += '<path d="M413 49.5 A 26 26 0 0 1 413 94.5" fill="none" stroke="' + RED + '" stroke-width="2" marker-end="url(#ah)"/>' + text(434, 58, "M_A", 13, RED)
    return s
F_SUP = fig(540, 188, _supports(), cap="2D 지지와 반력(빨강): 핀 = 두 방향 힘, 롤러 = 지지면에 수직인 힘 하나, 고정 = 두 방향 힘 + 우력.", name="supports")

def beam_fig(Lm, loads, name, cap="", fbd=False, W=380, x0=70):
    """단순보: A(핀) 왼쪽, B(롤러) 오른쪽. loads = [(위치 m, 크기 kN)] 아래로"""
    X = lambda m: x0 + W * m / Lm
    s = rect(x0, 60, W, 12, INK, fill="#DDE3EA", sw=1.6, rx=2)
    if not fbd:
        s += pin_sup(x0, 72) + roller_sup(x0 + W, 72)
    for pos, P in loads:
        s += arrow(X(pos), 16, X(pos), 58, RED, "", 2.4) + text(X(pos) + 7, 26, f"{P:g} kN", 13, RED)
    if fbd:
        s += arrow(x0 - 40, 66, x0 - 4, 66, GREEN, "", 2.2) + text(x0 - 44, 71, "A_x", 13, GREEN, "end")
        s += arrow(x0, 118, x0, 76, GREEN, "", 2.2) + text(x0 + 8, 116, "A_y", 13, GREEN)
        s += arrow(x0 + W, 118, x0 + W, 76, GREEN, "", 2.2) + text(x0 + W + 8, 116, "B_y", 13, GREEN)
    ys = 140 if not fbd else 140
    pts = [0] + [p for p, _ in loads] + [Lm]
    for a, b in zip(pts, pts[1:]):
        if b > a: s += brace_label(X(a), X(b), ys, f"{b - a:g} m")
    s += text(x0, 52, "A", 14, INK, "middle", True) if fbd else text(x0 - 10, 56, "A", 14, INK, "end", True)
    s += text(x0 + W, 52, "B", 14, INK, "middle", True) if fbd else text(x0 + W + 10, 56, "B", 14, INK, "start", True)
    return fig(W + 2 * x0, 172, s, cap=cap, name=name)

F_BEAM = beam_fig(6, [(2, 12)], "beam", cap="단순보: 왼쪽 A 핀, 오른쪽 B 롤러, 길이 6 m, A에서 2 m 지점에 12 kN.")
F_BEAM_FBD = beam_fig(6, [(2, 12)], "beam-fbd", cap="자유물체도: 지지를 떼고 반력 \\(A_x,A_y,B_y\\)(초록)로 바꿔 그린다.", fbd=True)
F_Q_BEAM2 = beam_fig(5, [(1, 10), (4, 6)], "q-beam2")

def _cant():
    s = hatch_v(70, 40, 120) + line(70, 80, 330, 80, INK, 8)
    s += text(58, 34, "A", 14, INK, "end", True) + text(340, 70, "B", 14, INK, "start", True)
    ang = math.radians(30)
    x1, y1 = 330, 80
    s += arrow(x1 - 70 * math.cos(ang), y1 - 70 * math.sin(ang), x1 - 3, y1 - 2, RED, "", 2.4)
    s += text(250, 34, "8 kN", 13, RED, "end")
    s += arc(330, 80, 44, 180, 210, GRAY, 1.3, "30°", lr=60)
    s += brace_label(70, 330, 140, "2 m")
    return s
F_Q_CANT = fig(420, 170, _cant(), name="q-cant")

def _strut():
    ax, ay, Lp = 64, 58, 176
    bx, cy = ax + Lp, ay + Lp
    s = hatch_v(ax, ay - 38, cy + 12)
    s += line(ax, ay, bx, ay, INK, 7) + line(bx, ay, ax, cy, INK, 5)
    for (x, y) in ((ax, ay), (bx, ay), (ax, cy)): s += circle(x, y, 5, INK, fill="#fff")
    s += text(ax - 12, ay - 6, "A", 14, INK, "end", True) + text(bx + 10, ay - 6, "B", 14, INK, "start", True) + text(ax - 12, cy + 6, "C", 14, INK, "end", True)
    mx = (ax + bx) / 2
    s += arrow(mx, ay - 46, mx, ay - 6, RED, "", 2.4) + text(mx + 8, ay - 34, "10 kN", 13, RED)
    s += text(118, ay + 22, "AB = 4 m", 12, GRAY) + text(ax + 10, 150, "AC = 4 m", 12, GRAY)
    s += arc(ax, cy, 26, -90, -45, GRAY, 1.3, "45°", lr=40)
    return s
F_STRUT = fig(300, 252, _strut(), name="q-strut")

def _two_three():
    s = path("M60 150 C 90 60, 180 60, 220 130", INK, 6)
    s += f'<circle cx="60" cy="150" r="5" fill="#fff" stroke="{INK}" stroke-width="2"/><circle cx="220" cy="130" r="5" fill="#fff" stroke="{INK}" stroke-width="2"/>'
    s += line(60, 150, 220, 130, GRAY, 1.2, "5 4")
    s += arrow(60, 150, 20, 155, RED, "", 2.4) + arrow(220, 130, 260, 125, RED, "", 2.4)
    s += text(40, 176, "F", 13, RED, "middle", True) + text(250, 116, "F", 13, RED, "middle", True) + text(70, 168, "A", 13, INK, "start", True) + text(214, 154, "B", 13, INK, "end", True)
    s += text(140, 186, "2력 부재: 두 힘은 A–B 직선 위", 13, INK, "middle", True)
    cx, cy = 420, 90
    s += dot(cx, cy, "", 4, GREEN)
    s += arrow(cx - 90, cy + 50, cx - 4, cy + 2, RED, "", 2.2) + arrow(cx + 80, cy + 60, cx + 4, cy + 3, RED, "", 2.2) + arrow(cx, cy - 70, cx, cy - 6, RED, "", 2.2)
    s += text(cx, 186, "3력 부재: 세 힘은 한 점에서 만남", 13, INK, "middle", True)
    return s
F_23 = fig(540, 196, _two_three(), cap="2력 부재는 두 점을 잇는 직선 방향으로만, 3력 부재의 세 힘은 한 점에서 만나거나 서로 평행하다.", name="twothree")

def _plate():
    X = lambda x: 100 + 60 * x; Y = lambda y: 190 - 60 * y
    s = rect(X(0), Y(2), 180, 120, INK, fill="rgba(31,42,68,.05)", sw=2)
    for (x, y, lab, anc, dx, dy) in ((0, 0, "A (0,0)", "end", -12, 20), (3, 0, "B (3,0)", "start", 12, 20), (0, 2, "C (0,2)", "end", -12, -8)):
        s += circle(X(x), Y(y), 7, GREEN, fill="#E6F4EA", w=2) + text(X(x) + dx, Y(y) + dy, lab, 13, GREEN, anc, True)
    s += circle(X(1), Y(1), 9, RED, fill="#fff", w=2) + line(X(1) - 6, Y(1) - 6, X(1) + 6, Y(1) + 6, RED, 2) + line(X(1) - 6, Y(1) + 6, X(1) + 6, Y(1) - 6, RED, 2)
    s += text(X(1) + 14, Y(1) + 5, "600 N (아래로)", 13, RED)
    s += arrow(380, 180, 420, 180, INK, "", 1.5) + arrow(380, 180, 380, 140, INK, "", 1.5) + text(424, 185, "x", 13, INK) + text(386, 140, "y", 13, INK)
    s += text(400, 118, "z = 위쪽", 12, GRAY, "middle")
    return s
F_PLATE = fig(440, 222, _plate(), name="q-plate")

HEAD = r"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>정역학 · 중간고사 대비 2 — Ch.4 모멘트·우력·등가계(수업분) · Ch.5 강체의 평형(교재 선행)</title>
<!-- 정리노트 v2. 생성기 docs/tools/exam_gap/statics_ahead.py → build_slides.py 로 덱 statics-mid2.
     파트 1~3 = 9/21·9/23·9/28 수업(교수 필기·영상 요약 뼈대), 파트 4~6 = Ch.5 수업 전 교재 선행. -->
<style>body{font-family:Pretendard,"Malgun Gothic",sans-serif;max-width:900px;margin:24px auto;padding:0 16px;line-height:1.6}section{border-top:2px solid #333;padding-top:12px;margin-top:28px}h2 .no{display:inline-block;background:#1f2a44;color:#fff;font-size:13px;padding:2px 8px;border-radius:6px;margin-right:8px}h3 .tag{display:inline-block;font-size:12px;padding:1px 7px;border-radius:5px;margin-right:6px;background:#eee}.tag.c{background:#dbe7ff}.tag.b{background:#dff5e1}.tag.a{background:#ffe6cc}.why{background:#f6f6f6;padding:10px 12px;border-radius:8px}.one{border-left:4px solid #1f2a44;padding:6px 10px;margin:8px 0;background:#fafafa}.q{border:1px solid #ddd;border-radius:8px;padding:10px 12px;margin:10px 0}.qn{font-weight:700;color:#1f2a44}.choices li[data-ok]{font-weight:700}.mu{display:grid;grid-template-columns:1fr 1fr;gap:10px}.mu-mem{background:#fff8d6;padding:8px 10px;border-radius:8px}.mu-und{background:#e3efff;padding:8px 10px;border-radius:8px}.mu-h{font-weight:700;margin-bottom:4px}aside.exam{background:#ffe0ec;border-left:4px solid #d0397a;padding:6px 10px;margin:8px 0;font-size:14px}figure.fig{margin:10px 0}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 8px;font-size:14px}</style>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"><script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body,{delimiters:[{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true}]})"></script>
</head>
<body>
<h1>정역학 · 중간고사 대비 2 — Ch.4 힘계와 모멘트(9/21·9/23·9/28) · Ch.5 강체의 평형(교재 선행)</h1>
<p>중간 10/19 · 범위 Ch.3~5 · 파트 1~3은 수업한 회차라 <b>교수님 필기·영상의 순서와 표기</b>를 그대로 따랐고, 파트 4~6(Ch.5)은 아직 수업 전이라 OT 주차표의 장 구성(5.1 2D · 5.2 부정정 · 5.3 3D · 5.4 2력·3력)에 교재 개념을 채웠다.</p>
"""

P1 = r"""
<section>
  <h2><span class="no">파트 1 · 9/21</span>Ch.3 마무리 · Ch.4 ① 점에 대한 모멘트 — M = DF, M = r × F</h2>
  <aside class="exam" data-level="강조" data-when="9/21 영상②">「힘의 합력 0, 모멘트의 합 0 — 이 두 개가 제일 중요」</aside>
  <h3><span class="tag c">개념</span>FBD 에는 외력만 · 평형 = 합력 0 + 모멘트 합 0 · 모멘트 크기 = 힘 × 수직거리</h3>
  <div class="why">Ch.3은 힘이 한 점에 모이는 경우(입자)의 평형 \(\sum\vec F=0\)이었다. 물체가 크기를 가지면 힘이 물체를 돌릴 수도 있다. 그 돌리는 정도가 모멘트이고, 평형이 되려면 모멘트의 합도 0이어야 한다.</div>
  <div class="concept">
    <p><b>좌표계</b>: 문제의 기하와 힘 방향을 보고 잡는다. 힘이 대부분 수평·수직이면 \(x\)·\(y\)축도 수평·수직으로.</p>
    <p><b>두 블록 예제(교수님 판서)</b>: 무게 \(W\)인 블록 두 개가 케이블 D–C(위)와 B–A(가운데)로 매달려 정지. 아래 블록만 떼면 \(T_{AB}=W\), 위 블록만 떼면 \(T_{CD}=W+T_{AB}=2W\).</p>
    <p><b>통째로 떼기</b>: 두 블록을 한 덩어리로 자유물체도(FBD)를 그리면 \(T_{CD}=2W\)가 한 번에 나온다. 가운데 줄 \(T_{AB}\)는 덩어리 안에서 주고받는 <b>내력</b>이라 FBD에 넣지 않는다 — <b>FBD는 외력만</b>.</p>
    <p><b>평형 방정식</b>: 2D \(\sum F_x=0,\ \sum F_y=0\) / 3D \(\sum F_x=\sum F_y=\sum F_z=0\). 물체가 평형이면 여기에 더해 <b>임의의 점에 대한 모멘트의 합도 0</b>이다.</p>
    <p><b>[중학 과학 연결] 지레</b>: 시소에서 무게 × 받침점까지 거리가 양쪽이 같으면 균형 — 그 「무게 × 거리」가 모멘트다.</p>
    @@F_DF@@
    <p><b>2D 모멘트</b>: 점 P에 대한 힘 \(F\)의 모멘트 크기 \(M_P=DF\) — \(D\) = P에서 힘의 <b>작용선</b>까지 수직거리. 부호: 반시계(CCW) +, 시계(CW) −. 단위 N·m. 작용선이 P를 지나면 \(D=0\) → \(M=0\).</p>
    <p><b>모멘트의 합</b>: \(\sum M_P=M_{P,1}+M_{P,2}+\cdots\)(각각 회전 방향대로 부호). 힘을 성분으로 나눠도 된다: \(M_P(\vec F)=M_P(F_x)+M_P(F_y)\). 원점 O에 대해 점 \((x,y)\)에 작용하는 힘이면 \(M_O=xF_y-yF_x\).</p>
    <p><b>모멘트 벡터</b>: \(\vec M_P=\vec r\times\vec F\). \(\vec r\)는 P에서 <b>작용선 위 아무 점</b>까지의 위치벡터. 크기 \(|\vec M_P|=rF\sin\theta=DF\)(\(\theta\): \(\vec r\)과 \(\vec F\)를 꼬리끼리 붙였을 때 사이각, \(D=r\sin\theta\)).</p>
    <p><b>방향</b>: \(\vec M_P\)는 \(\vec r\)과 \(\vec F\) 모두에 수직 — P와 \(\vec F\)가 있는 평면에 수직. 오른손 손가락을 \(\vec r\)에서 \(\vec F\)로 감으면 엄지가 \(\vec M_P\). 2D에서 반시계 = \(+\vec k\) 방향이라 부호 규칙과 맞는다.</p>
    <p><b>\(\vec r\)의 선택은 상관없다</b>: 다른 점까지의 \(\vec r_2=\vec r+\vec u\)(\(\vec u\)는 \(\vec F\)와 평행)이면 \((\vec r+\vec u)\times\vec F=\vec r\times\vec F+\vec u\times\vec F=\vec r\times\vec F\) — 평행한 벡터의 외적은 0.</p>
  </div>
  <div class="one">한 줄: FBD는 외력만 · 평형 = \(\sum\vec F=0\) + \(\sum\vec M=0\) · \(M_P=DF\)(반시계 +) · \(\vec M_P=\vec r\times\vec F\), \(\vec r\)는 작용선 위 아무 점까지.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>FBD에는 외력만(내력은 빠진다)</li><li>\(M_P=DF\), 반시계 +·시계 −, [N·m]</li><li>\(\vec M_P=\vec r\times\vec F\), \(|\vec M_P|=rF\sin\theta=DF\)</li><li>2D 원점 기준 \(M_O=xF_y-yF_x\)</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>통째 FBD에서 가운데 장력이 사라지는 이유</li><li>작용선 위 아무 점이나 써도 모멘트가 같은 이유(\(\vec u\times\vec F=0\))</li><li>반시계가 +인 이유(외적 방향 +z)</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q" data-def="W"><div class="qn">기초 1-1 · 통째 FBD</div><p>무게 \(W\)인 블록 세 개가 케이블(무게 무시)로 위아래 한 줄로 매달려 정지해 있다. 천장에 붙은 케이블의 장력은?</p><ol class="choices"><li data-ok="1">\(3W\)</li><li>\(W\)</li><li>\(2W\)</li><li>\(W/3\)</li></ol><details><summary>답</summary><div class="ans">세 블록을 통째로 FBD: 위로 맨 위 장력 \(T\), 아래로 \(3W\). 블록 사이 케이블 장력은 내력이라 빠진다 → \(T-3W=0\) → \(T=3W\).</div></details></div>
  <div class="q" data-def="P"><div class="qn">기초 1-2 · M = DF</div><p>점 P에서 작용선까지의 수직거리가 0.5 m인 20 N 힘이 P에 대해 반시계 방향으로 돌리려 한다. \(M_P\)는?</p><ol class="choices"><li data-ok="1">+10 N·m</li><li>−10 N·m</li><li>+40 N·m</li><li>+20.5 N·m</li></ol><details><summary>답</summary><div class="ans">\(M_P=DF=0.5\times20=10\) N·m, 반시계라 +.</div></details></div>
  <div class="q"><div class="qn">기초 1-3 · r × F</div><p>원점 O에 대해, 점 \((3,1,0)\) m에 작용하는 힘 \(\vec F=10\vec j\) N의 모멘트는?</p><ol class="choices"><li data-ok="1">\(30\vec k\) N·m</li><li>\(-30\vec k\) N·m</li><li>\(10\vec k\) N·m</li><li>\(30\vec i\) N·m</li></ol><details><summary>답</summary><div class="ans">\(\vec r\times\vec F=(3\vec i+\vec j)\times10\vec j=30(\vec i\times\vec j)+10(\vec j\times\vec j)=30\vec k+0\). 2D로 보면 \(xF_y-yF_x=3\cdot10-1\cdot0=30\), 반시계.</div></details></div>
  <div class="q"><div class="qn">기초 1-4 · 작용선이 점을 지날 때</div><p>힘의 작용선이 점 P를 지난다. 이 힘의 P에 대한 모멘트는?</p><ol class="choices"><li data-ok="1">0</li><li>힘의 크기와 같다</li><li>힘의 크기 × 작용점까지 거리</li><li>정할 수 없다</li></ol><details><summary>답</summary><div class="ans">수직거리 \(D=0\) → \(M=DF=0\). 벡터로도 \(\vec r\)을 P 자신(작용선 위의 점)으로 잡으면 \(\vec r=\vec0\).</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 1-1 · 성분으로 나눈 모멘트</div><p>점 \((2,1)\) m에 크기 50 N인 힘이 수평(\(+x\))에서 위로 30° 방향으로 작용한다. 원점 O에 대한 모멘트를 구하라(반시계 +).</p><details><summary>답</summary><div class="ans">① 성분: \(F_x=50\cos30°=25\sqrt3\approx43.3\) N, \(F_y=50\sin30°=25\) N. ② \(M_O=xF_y-yF_x=2\times25-1\times25\sqrt3=50-43.3\approx6.7\) N·m. ③ 양수 → 반시계. \(F_y\)는 O를 반시계로, \(F_x\)는 시계로 돌리려 하고 반시계 쪽이 조금 크다.</div></details></div>
  <div class="q"><div class="qn a">응용 1-2 · 두 블록 장력</div><p>질량 5 kg인 블록 아래에 질량 3 kg인 블록이 케이블로 매달리고, 위쪽 블록은 천장에 케이블로 매달려 정지해 있다(케이블 무게 무시, \(g=9.81\ \mathrm{m/s^2}\)). 두 케이블의 장력을 구하라.</p><details><summary>답</summary><div class="ans">① 아래 블록 FBD: \(T_{아래}-3g=0\) → \(T_{아래}=29.43\) N. ② 두 블록 통째 FBD: \(T_{위}-(5+3)g=0\) → \(T_{위}=78.48\) N(가운데 케이블은 내력이라 빠짐). 검산: 위 블록만 떼면 \(T_{위}=5g+T_{아래}=49.05+29.43=78.48\) ✓.</div></details></div>
</section>
"""

P2 = r"""
<section>
  <h2><span class="no">파트 2 · 9/23</span>Ch.4 ② 바리뇽 정리 · 직선에 대한 모멘트 — M_L = [e·(r × F)]e</h2>
  <aside class="exam" data-level="강조" data-when="9/23 영상③·⑥">직선에 대한 모멘트 = 삼중적 행렬식 「기억하셔야 됩니다」 · 「고민하기 싫을 땐 일단 삼중곱으로 계산할 수 있다는 건 알고 있어야」</aside>
  <h3><span class="tag c">개념</span>한 점 모멘트를 직선 방향으로 정사영한 것이 직선 모멘트 — 혼합삼중적 하나</h3>
  <div class="why">문이 경첩(직선)을 축으로 돌듯, 실제 기계는 점이 아니라 축(직선) 둘레로 돈다. 그래서 「이 힘이 이 축을 얼마나 돌리나」가 필요하다. 3주차 정사영과 혼합삼중적이 그대로 쓰인다.</div>
  <div class="concept">
    <p><b>예제(교수님 판서)</b>: 점 \((4,2,0)\) m에 \(10\vec j\) N. 방법 1 수직거리 4 m × 10 N = 40 N·m 반시계. 방법 2 \((4\vec i+2\vec j)\times10\vec j=40\vec k+20(\vec j\times\vec j)=40\vec k\) N·m. 두 방법이 같다.</p>
    <p><b>바리뇽 정리</b>: 한 점 Q에 모이는 힘들은 \(\sum\vec M_P=\vec r_{PQ}\times\sum\vec F\) — 합력의 모멘트 = 각 힘 모멘트의 합. 그래서 힘을 \(x,y,z\) 성분으로 쪼개 따로 계산해 더해도 된다(0이 되는 성분을 날리려고 쪼갠다).</p>
    <p><b>직선에 대한 모멘트</b>: 직선 L 위 아무 점 P에 대한 \(\vec M_P\) 중 <b>L에 평행한 성분</b>. L의 단위벡터 \(\vec e\)로 정사영하면 \[\vec M_L=(\vec e\cdot\vec M_P)\,\vec e=[\vec e\cdot(\vec r\times\vec F)]\,\vec e\] 괄호 안은 스칼라. \(\vec r\)는 P에서 \(\vec F\)의 작용선 위 아무 점까지.</p>
    <p><b>[3주차 연결] 혼합삼중적 = 3×3 행렬식</b>: \[\vec e\cdot(\vec r\times\vec F)=\begin{vmatrix}e_x&amp;e_y&amp;e_z\\r_x&amp;r_y&amp;r_z\\F_x&amp;F_y&amp;F_z\end{vmatrix}\] 값이 양수면 \(\vec M_L\)은 \(\vec e\) 방향, 음수면 반대 방향.</p>
    <p><b>점 선택은 상관없다</b>: L 위 다른 점을 쓰면 \(\vec r\)에 L과 평행한 \(\vec u\)가 더해지는데 \(\vec e\cdot(\vec u\times\vec F)=0\)(평행한 두 벡터가 만드는 평행육면체의 부피 0). 그래서 계산이 쉬운 점(0이 많은 점)을 고른다.</p>
    <p><b>풀이 5단계(두 점으로 주어진 직선)</b>: ① L 위 점 하나 고르기 ② \(\vec r\)(그 점 → 작용선 위 점) ③ \(\vec e=\overrightarrow{AB}/|\overrightarrow{AB}|\) ④ 행렬식 ⑤ \(\vec M_L=(\text{값})\,\vec e\).</p>
    <p><b>특수한 경우 셋</b>: 작용선이 L을 포함한 평면에 수직이면 \(|\vec M_L|=FD\)(D = L까지 수직거리) / 작용선이 L과 <b>평행</b>이면 0 / 작용선이 L과 <b>만나면</b> 0. 문을 경첩과 평행하게 밀거나 경첩을 직접 밀면 안 돌아가는 것과 같다.</p>
  </div>
  <div class="one">한 줄: 바리뇽 \(\sum\vec M_P=\vec r_{PQ}\times\sum\vec F\) · \(\vec M_L=[\vec e\cdot(\vec r\times\vec F)]\vec e\) = 3×3 행렬식 × \(\vec e\) · 점 선택 무관 · 평행하거나 만나면 0.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>\(\vec M_L=[\vec e\cdot(\vec r\times\vec F)]\vec e\) — 행렬식 행 순서 \(\vec e,\vec r,\vec F\)</li><li>양수 → \(\vec e\) 방향, 음수 → 반대</li><li>특수한 경우: 수직 \(FD\) · 평행 0 · 만남 0</li><li>바리뇽: 성분별 모멘트를 더해도 된다</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>직선 모멘트 = 점 모멘트의 정사영인 이유</li><li>L 위 어느 점을 써도 같은 이유(부피 0)</li><li>터빈 축처럼 축 방향 힘은 돌리지 못하는 이유</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q" data-def="F,D"><div class="qn">기초 2-1 · 특수한 경우</div><p>힘의 작용선이 직선 L과 한 점에서 만난다. 이 힘의 L에 대한 모멘트는?</p><ol class="choices"><li data-ok="1">0</li><li>\(FD\)</li><li>힘의 크기와 같다</li><li>\(\vec r\times\vec F\) 전체</li></ol><details><summary>답</summary><div class="ans">만나는 점을 L 위의 점이자 작용선 위의 점으로 잡으면 \(\vec r=\vec0\) → \(\vec M_L=0\). 평행할 때도 \(\vec r\times\vec F\)가 L에 수직이라 정사영이 0.</div></details></div>
  <div class="q"><div class="qn">기초 2-2 · z축에 대한 모멘트</div><p>점 \((4,1,0)\) m에 \(\vec F=2\vec i+3\vec j+5\vec k\) N이 작용한다. \(z\)축에 대한 모멘트 \(\vec M_z\)는?</p><ol class="choices"><li data-ok="1">\(10\vec k\) N·m</li><li>\(-20\vec k\) N·m</li><li>\(5\vec k\) N·m</li><li>\(14\vec k\) N·m</li></ol><details><summary>답</summary><div class="ans">\(\vec e=\vec k\), 원점(축 위의 점)에서 \(\vec r=(4,1,0)\). \(\vec r\times\vec F=(1\cdot5-0\cdot3)\vec i-(4\cdot5-0\cdot2)\vec j+(4\cdot3-1\cdot2)\vec k=5\vec i-20\vec j+10\vec k\). \(\vec k\) 성분 10 → \(\vec M_z=10\vec k\). 짧게: \(xF_y-yF_x=12-2=10\). \(F_z\)는 축과 평행이라 기여 0.</div></details></div>
  <div class="q"><div class="qn">기초 2-3 · 바리뇽 정리</div><p>한 점에 모이는 두 힘의 한 점 P에 대한 모멘트에 대해 옳은 것은?</p><ol class="choices"><li data-ok="1">각 힘의 모멘트를 더한 것 = 합력의 모멘트</li><li>각 힘의 모멘트를 곱한 것 = 합력의 모멘트</li><li>큰 힘의 모멘트만 남는다</li><li>두 힘이 수직일 때만 더할 수 있다</li></ol><details><summary>답</summary><div class="ans">바리뇽: \(\vec r\times\vec F_1+\vec r\times\vec F_2=\vec r\times(\vec F_1+\vec F_2)\) — 외적의 분배법칙.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q" data-def="L"><div class="qn a">응용 2-1 · 두 점으로 주어진 직선</div><p>직선 L이 점 A\((0,0,0)\) m과 B\((2,1,2)\) m를 지난다. 점 C\((3,0,0)\) m에 힘 \(\vec F=30\vec j\) N이 작용할 때 L에 대한 모멘트 \(\vec M_L\)을 구하라.</p><details><summary>답</summary><div class="ans">① 점 A를 고른다. ② \(\vec r=\overrightarrow{AC}=(3,0,0)\). ③ \(\overrightarrow{AB}=(2,1,2)\), \(|\overrightarrow{AB}|=\sqrt{4+1+4}=3\) → \(\vec e=(\frac23,\frac13,\frac23)\). ④ \(\begin{vmatrix}\frac23&amp;\frac13&amp;\frac23\\3&amp;0&amp;0\\0&amp;30&amp;0\end{vmatrix}=\frac23(0-0)-\frac13(0-0)+\frac23(90-0)=60\) N·m. ⑤ \(\vec M_L=60\vec e=40\vec i+20\vec j+40\vec k\) N·m(양수라 \(\vec e\) 방향). 검산: B를 골라 \(\vec r=\overrightarrow{BC}=(1,-1,-2)\)로 해도 행렬식 60.</div></details></div>
</section>
"""

P3 = r"""
<section>
  <h2><span class="no">파트 3 · 9/28</span>Ch.4 ③ 우력 · 등가계 · 힘 옮기기 · 렌치</h2>
  <h3><span class="tag c">개념</span>우력은 알짜힘 없이 회전만 · 힘계는 한 점의 힘 하나 + 우력 하나로 바꿀 수 있다</h3>
  <div class="why">복잡한 힘계를 계산하기 쉬운 가장 간단한 모양으로 바꾸는 법이다. 핵심 도구는 우력: 크기가 같고 방향이 반대인 두 힘. Ch.5 평형 문제에서 고정 지지의 반력 우력이 바로 이것이다.</div>
  <div class="concept">
    <p><b>우력(couple)</b>: 크기가 같고 방향이 반대이며 작용선이 다른 두 힘. \(\sum\vec F=\vec F+(-\vec F)=0\)인데 \(\sum\vec M\neq0\) — 알짜힘 없이 모멘트만 줄 수 있다(교수님 판서의 「Yes」).</p>
    @@F_COUPLE@@
    <p><b>우력 모멘트</b>: 점 P에 대해 \(\vec M=\vec r_1\times\vec F+\vec r_2\times(-\vec F)=(\vec r_1-\vec r_2)\times\vec F=\vec r\times\vec F\). \(\vec r\)는 \(-\vec F\) 위의 점 → \(\vec F\) 위의 점이라 P와 무관 → <b>어느 점에 대해서나 같다</b>. 크기 \(|\vec M|=DF\)(D: 두 작용선 사이 수직거리).</p>
    <p><b>등가계</b>: 두 힘계는 \((\sum\vec F)_1=(\sum\vec F)_2\)이고 한 점 P에 대해 \((\sum\vec M_P)_1=(\sum\vec M_P)_2\)이면 등가다. 한 점에서 같으면 다른 모든 점에서도 같다.</p>
    <p><b>힘-우력 계</b>: 어떤 힘계든 한 점 P의 힘 하나 \(\vec F=\sum\vec F\) + 우력 하나 \(\vec M=\sum\vec M_P\)로 바꿀 수 있다.</p>
    <p><b>힘 옮기기</b>: 점 P의 힘 \(\vec F_P\)를 점 Q로 옮기면 우력 \(\vec r\times\vec F_P\)(\(\vec r\) = Q → P)가 붙는다. 「P의 힘 ≡ Q의 같은 힘 + \(\vec r\times\vec F_P\)」. 이 우력은 늘 \(\vec F\)에 수직이다.</p>
    <p><b>렌치(wrench)</b>: 힘 \(\vec F\) + \(\vec F\)에 <b>평행한</b> 우력 \(\vec M_p\) — 가장 간단한 등가계. 우력을 \(\vec M=\vec M_p+\vec M_n\)(평행 + 수직)으로 나누면, 힘을 옮겨서 없앨 수 있는 것은 수직 성분 \(\vec M_n\)뿐이다: 옮길 위치는 \(\vec r_{PQ}\times\vec F=\vec M_n\).</p>
    <p><b>[계산 도구] 평행 성분</b>: \(\vec F\)의 단위벡터 \(\vec e\)로 \(\vec M_p=(\vec e\cdot\vec M)\vec e\), \(\vec M_n=\vec M-\vec M_p\)(2주차 정사영). 옮길 위치 하나는 \(\vec r_{PQ}=\dfrac{\vec F\times\vec M_n}{|\vec F|^2}\).</p>
  </div>
  <div class="one">한 줄: 우력 \(\sum\vec F=0\), \(\vec M=\vec r\times\vec F\) 어느 점이나 같다, \(|\vec M|=DF\) · 등가 = 합력·한 점 모멘트가 같다 · 옮기면 \(\vec r\times\vec F\)가 붙는다 · 렌치 = \(\vec F\) + 평행 우력.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>우력: \(\sum\vec F=0\), \(\sum\vec M\neq0\), \(|\vec M|=DF\)</li><li>등가 조건 두 개(합력, 한 점 모멘트)</li><li>P의 힘 ≡ Q의 힘 + \(\vec r\times\vec F\)(\(\vec r\): Q→P)</li><li>렌치 = \(\vec F\) + \(\vec M_p\), \(\vec r_{PQ}\times\vec F=\vec M_n\)</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>우력 모멘트가 점과 무관한 이유</li><li>힘을 옮기면 생기는 우력이 늘 힘에 수직인 이유</li><li>평행 성분은 힘을 옮겨도 못 없애는 이유</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 3-1 · 우력의 성질</div><p>우력에 대해 옳은 것은?</p><ol class="choices"><li data-ok="1">알짜힘은 0이고, 모멘트는 어느 점에 대해 재도 같다</li><li>알짜힘은 0이고, 모멘트는 재는 점마다 다르다</li><li>알짜힘도 모멘트도 0이다</li><li>알짜힘은 두 힘의 합의 두 배다</li></ol><details><summary>답</summary><div class="ans">\(\vec F+(-\vec F)=0\). 모멘트 \((\vec r_1-\vec r_2)\times\vec F\)에서 \(\vec r_1-\vec r_2\)는 두 작용선을 잇는 벡터라 기준점이 들어가지 않는다.</div></details></div>
  <div class="q"><div class="qn">기초 3-2 · 힘 옮기기</div><p>점 P\((3,0,0)\) m의 힘 \(20\vec j\) N을 원점 O로 옮긴다. O에 둘 것은?</p><ol class="choices"><li data-ok="1">힘 \(20\vec j\) N + 우력 \(60\vec k\) N·m</li><li>힘 \(20\vec j\) N만</li><li>힘 \(20\vec j\) N + 우력 \(-60\vec k\) N·m</li><li>우력 \(60\vec k\) N·m만</li></ol><details><summary>답</summary><div class="ans">\(\vec r\) = O → P = \(3\vec i\). 붙는 우력 \(3\vec i\times20\vec j=60\vec k\). 검산: 다른 점 \((0,5,0)\)에서 원래 \((3\vec i-5\vec j)\times20\vec j=60\vec k\), 새 계 \((-5\vec j)\times20\vec j+60\vec k=60\vec k\) ✓.</div></details></div>
  <div class="q"><div class="qn">기초 3-3 · 우력 모멘트 계산</div><p>점 \((6,1,0)\) m에 \(3\vec j\) kN, 점 \((2,5,0)\) m에 \(-3\vec j\) kN이 작용한다. 우력 모멘트는?</p><ol class="choices"><li data-ok="1">\(12\vec k\) kN·m</li><li>\(-12\vec k\) kN·m</li><li>\(24\vec k\) kN·m</li><li>0</li></ol><details><summary>답</summary><div class="ans">원점 기준 합: \((6\vec i+\vec j)\times3\vec j+(2\vec i+5\vec j)\times(-3\vec j)=18\vec k-6\vec k=12\vec k\). D·F: 두 작용선 \(x=6\)과 \(x=2\) 사이 거리 4 m × 3 kN = 12, 오른쪽이 위·왼쪽이 아래라 반시계(+).</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 3-1 · 힘-우력 계와 한 힘</div><p>원점에 \(10\vec j\) N, 점 \((4,0,0)\) m에 \(-6\vec j\) N이 작용한다. (a) 원점의 힘-우력 계로 바꾸라. (b) 우력 없이 힘 하나로 바꾸면 그 힘은 \(x\)축의 어느 점에 작용해야 하나?</p><details><summary>답</summary><div class="ans">(a) 합력 \(10\vec j-6\vec j=4\vec j\) N. 원점 모멘트 \(4\vec i\times(-6\vec j)=-24\vec k\) N·m → 원점에 \(4\vec j\) N + 우력 \(-24\vec k\) N·m. (b) 힘 \(4\vec j\)를 \(x=d\)에 두면 원점 모멘트 \(d\vec i\times4\vec j=4d\vec k=-24\vec k\) → \(d=-6\) m. 원점 왼쪽 6 m.</div></details></div>
  <div class="q"><div class="qn a">응용 3-2 · 렌치로 줄이기</div><p>원점 P에 힘 \(\vec F=10\vec j\) N과 우력 \(\vec M=3\vec i+4\vec j\) N·m이 있다. 렌치로 바꾸라(평행 우력 \(\vec M_p\)와 힘이 지나는 위치).</p><details><summary>답</summary><div class="ans">① \(\vec e=\vec j\) → \(\vec M_p=(\vec e\cdot\vec M)\vec e=4\vec j\), \(\vec M_n=\vec M-\vec M_p=3\vec i\). ② \(\vec r_{PQ}=\dfrac{\vec F\times\vec M_n}{|\vec F|^2}=\dfrac{10\vec j\times3\vec i}{100}=\dfrac{-30\vec k}{100}=-0.3\vec k\) m. ③ 렌치: 힘 \(10\vec j\) N이 점 \((0,0,-0.3)\) m를 지나는 \(y\) 방향 직선 위 + 평행 우력 \(4\vec j\) N·m. 검산: \((-0.3\vec k)\times10\vec j=3\vec i=\vec M_n\) ✓.</div></details></div>
</section>
"""

P4 = r"""
<section>
  <h2><span class="no">파트 4 · 교재 선행</span>Ch.5 ① 2D 강체의 평형 — 지지와 반력 · 평형 방정식 3개</h2>
  <h3><span class="tag c">개념</span>ΣF_x = 0, ΣF_y = 0, ΣM = 0 — 지지를 반력으로 바꿔 그린 FBD 에 적용</h3>
  <div class="why">Ch.3(입자)과 Ch.4(모멘트)를 합치는 장이다. 물체가 크기를 가지면 평형 조건이 두 개(\(\sum\vec F=0\), \(\sum\vec M=0\))이고, 2D에서는 식이 3개라 모르는 반력을 3개까지 구할 수 있다.</div>
  <div class="concept">
    <p><b>강체의 평형</b>: \(\sum\vec F=0\) 그리고 <b>임의의 점</b>에 대해 \(\sum\vec M=0\). 2D에서는 \[\sum F_x=0,\qquad\sum F_y=0,\qquad\sum M_P=0\] 독립인 식이 3개 → 모르는 것도 3개까지.</p>
    <p><b>지지(support)와 반력</b>: 지지는 물체의 움직임을 막는 만큼 힘(또는 우력)을 준다. 막는 방향 하나당 미지수 하나.</p>
    @@F_SUP@@
    <p><b>2D 지지 표</b>: 케이블·로프 — 케이블 방향으로 당기는 힘 1개 / 매끄러운 면 — 면에 수직인 힘 1개 / <b>롤러</b> — 지지면에 수직인 힘 1개 / <b>핀</b> — \(A_x,A_y\) 2개(돌 수는 있다) / <b>고정(끼워 박음)</b> — \(A_x,A_y\) + 우력 \(M_A\) 3개(돌지도 못한다).</p>
    <p><b>FBD 그리는 순서</b>: ① 물체만 떼어 그린다 ② 알려진 힘(하중·무게)을 그린다 ③ 지지를 떼고 그 자리에 반력을 그린다 — 방향을 모르면 + 방향으로 가정(답이 음수면 반대) ④ 치수와 좌표축.</p>
    @@F_BEAM@@
    @@F_BEAM_FBD@@
    <p><b>예(단순보)</b>: ① \(\sum F_x=0\) → \(A_x=0\). ② B에 반력이 하나뿐이고 A에는 둘 → <b>미지수가 많이 지나는 A에 대해</b> 모멘트: \(\sum M_A=6B_y-2\times12=0\) → \(B_y=4\) kN. ③ \(\sum F_y=A_y+B_y-12=0\) → \(A_y=8\) kN. 검산: \(\sum M_B=-6A_y+4\times12=-48+48=0\) ✓.</p>
    <p><b>요령</b>: 모멘트 식은 모르는 힘이 가장 많이 지나는 점에 대해 세우면 식 하나에 미지수 하나만 남는다(그 점을 지나는 힘은 모멘트가 0).</p>
    <p><b>우력 하중</b>: 보에 우력(돌리는 짝힘) \(M\)이 걸리면 \(\sum F\)에는 안 들어가고 \(\sum M\)에만 그대로 들어간다(어느 점에 대해서나 같은 값 — 파트 3).</p>
  </div>
  <div class="one">한 줄: 2D 평형 식 3개 \(\sum F_x=\sum F_y=\sum M_P=0\) · 롤러 1 · 핀 2 · 고정 3 · 지지를 반력으로 바꿔 FBD · 모멘트는 미지수가 많이 지나는 점에 대해.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>2D 평형: \(\sum F_x=0,\ \sum F_y=0,\ \sum M_P=0\)</li><li>반력 수: 케이블·매끄러운 면·롤러 1 · 핀 2 · 고정 3(\(A_x,A_y,M_A\))</li><li>FBD 4단계, 모르는 방향은 + 가정</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>지지가 막는 움직임 = 반력의 종류</li><li>모멘트 기준점을 잘 고르면 식이 쉬워지는 이유</li><li>우력 하중이 힘 합에는 안 들어가는 이유</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 4-1 · 지지의 미지수</div><p>2D 문제에서 핀 지지, 롤러, 고정 지지의 반력 미지수 개수는 차례로?</p><ol class="choices"><li data-ok="1">2, 1, 3</li><li>1, 2, 3</li><li>2, 2, 2</li><li>3, 1, 2</li></ol><details><summary>답</summary><div class="ans">핀은 두 방향 이동을 막음(\(A_x,A_y\)), 롤러는 면에 수직 방향만(1개), 고정은 이동 두 방향 + 회전(\(A_x,A_y,M_A\)).</div></details></div>
  <div class="q" data-def="A"><div class="qn">기초 4-2 · 외팔보</div><p>길이 3 m인 외팔보(왼쪽 끝 A 고정, 보의 무게 무시)의 오른쪽 끝에 5 kN이 아래로 작용한다. A의 반력 우력 \(M_A\)는?(반시계 +)</p><ol class="choices"><li data-ok="1">+15 kN·m</li><li>−15 kN·m</li><li>+5 kN·m</li><li>0</li></ol><details><summary>답</summary><div class="ans">\(\sum M_A=M_A-3\times5=0\) → \(M_A=15\) kN·m(반시계). 끝의 하중이 보를 시계 방향으로 돌리려 하니 벽은 반시계로 막는다. \(A_y=5\) kN(위), \(A_x=0\).</div></details></div>
  <div class="q"><div class="qn">기초 4-3 · 우력을 받는 단순보</div><p>길이 4 m 단순보(왼쪽 A 핀, 오른쪽 B 롤러, 보의 무게 무시)의 가운데에 시계 방향 우력 20 kN·m만 걸려 있다. 반력 \(A_y\), \(B_y\)(위쪽 +)는?</p><ol class="choices"><li data-ok="1">\(A_y=-5\) kN, \(B_y=+5\) kN</li><li>\(A_y=+5\) kN, \(B_y=-5\) kN</li><li>둘 다 +10 kN</li><li>둘 다 0</li></ol><details><summary>답</summary><div class="ans">\(\sum M_A=4B_y-20=0\)(시계 우력은 −20) → \(B_y=5\). \(\sum F_y=A_y+B_y=0\) → \(A_y=-5\)(실제로는 아래로 5 kN). 두 반력이 반대 방향 우력(4 m × 5 kN = 20)을 만들어 버틴다.</div></details></div>
  <div class="q"><div class="qn">기초 4-4 · 모멘트 기준점</div><p>단순보(A 핀: \(A_x,A_y\), B 롤러: \(B_y\))에서 \(B_y\)를 식 하나로 바로 구하려면 모멘트를 어느 점에 대해 세우나?</p><ol class="choices"><li data-ok="1">A</li><li>B</li><li>보의 가운데</li><li>하중이 걸린 점</li></ol><details><summary>답</summary><div class="ans">A를 지나는 \(A_x,A_y\)는 A에 대한 모멘트가 0 → \(\sum M_A\)에는 미지수 \(B_y\)만 남는다.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 4-1 · 하중 두 개인 단순보</div><p>그림처럼 길이 5 m 단순보(왼쪽 A 핀, 오른쪽 B 롤러, 보의 무게 무시)에 A에서 1 m 지점에 10 kN, 4 m 지점에 6 kN이 아래로 작용한다. 반력 \(A_x\), \(A_y\), \(B_y\)를 구하라.</p>@@F_Q_BEAM2@@<details><summary>답</summary><div class="ans">① \(\sum F_x=0\) → \(A_x=0\). ② \(\sum M_A=5B_y-10\times1-6\times4=0\) → \(B_y=\dfrac{34}{5}=6.8\) kN. ③ \(\sum F_y=A_y+6.8-16=0\) → \(A_y=9.2\) kN. 검산 \(\sum M_B=-5\times9.2+10\times4+6\times1=-46+46=0\) ✓. 하중이 A 쪽에 더 가까워 A가 더 많이 받는다.</div></details></div>
  <div class="q" data-def="A"><div class="qn a">응용 4-2 · 비스듬한 하중의 외팔보</div><p>그림처럼 왼쪽 끝 A가 벽에 고정된 길이 2 m 외팔보(무게 무시)의 오른쪽 끝 B에 크기 8 kN인 힘이 오른쪽 아래로, 수평과 30°를 이루며 작용한다. A의 반력 \(A_x\), \(A_y\), \(M_A\)를 구하라(오른쪽 +, 위쪽 +, 반시계 +).</p>@@F_Q_CANT@@<details><summary>답</summary><div class="ans">① 힘 성분: \(F_x=8\cos30°=4\sqrt3\approx6.93\) kN(오른쪽), \(F_y=-8\sin30°=-4\) kN(아래). ② \(\sum F_x=A_x+6.93=0\) → \(A_x=-6.93\) kN(왼쪽). ③ \(\sum F_y=A_y-4=0\) → \(A_y=4\) kN. ④ \(\sum M_A=M_A+(2\vec i\times\vec F)_z=M_A+2F_y=M_A-8=0\) → \(M_A=8\) kN·m(반시계). \(F_x\)는 작용선이 A를 지나(보의 축 위) 모멘트 0.</div></details></div>
</section>
"""

P5 = r"""
<section>
  <h2><span class="no">파트 5 · 교재 선행</span>Ch.5 ② 부정정 · 부적절한 지지 · 2력 부재와 3력 부재</h2>
  <h3><span class="tag c">개념</span>미지수가 식보다 많으면 부정정 · 두 점에서만 힘을 받는 부재는 그 두 점을 잇는 방향으로만 힘을 받는다</h3>
  <div class="why">평형 방정식으로 다 풀리는지 먼저 세어 봐야 한다. 그리고 부재의 모양을 보고 힘의 방향을 미리 알아내면(2력 부재) 미지수가 확 준다 — 트러스·프레임(기말 범위)의 준비 운동이다.</div>
  <div class="concept">
    <p><b>정정 vs 부정정</b>: 2D에서 독립인 평형 방정식은 3개다. 반력 미지수가 3개면 다 구해진다(정정). 3개보다 많으면 식만으로는 못 구한다 — <b>부정정</b>(과잉 지지, 차수 = 미지수 − 식 수). 부정정 문제는 재료의 변형을 함께 써야 풀린다(재료역학).</p>
    <p><b>부적절한 지지</b>: 미지수가 3개 이상이어도 반력들이 모두 <b>평행</b>하거나 모두 <b>한 점을 지나면</b> 어떤 하중에서는 평형을 이룰 수 없다(예: 롤러 셋이 모두 수직 반력이면 수평으로 미끄러짐을 못 막는다). 개수만이 아니라 방향도 봐야 한다.</p>
    @@F_23@@
    <p><b>2력 부재</b>: 두 점에서만 힘을 받고 우력이 없는 물체(무게 무시). 평형이면 두 힘은 크기가 같고 방향이 반대이며 <b>두 점을 잇는 직선 위</b>에 있다 — 부재가 휘어 있어도 마찬가지. 그래서 방향은 알고 크기(1개)만 모른다.</p>
    <p><b>왜 그런가</b>: 한 끝 A에 대한 모멘트가 0이려면 B의 힘의 작용선이 A를 지나야 하고, 힘의 합이 0이려면 A의 힘은 B의 힘과 크기가 같고 반대여야 한다.</p>
    <p><b>3력 부재</b>: 세 점에서 힘을 받는 물체(우력 없음)의 세 힘은 한 평면에 있고, <b>한 점에서 만나거나 서로 평행</b>하다. 두 힘의 작용선이 만나는 점에 대한 모멘트가 0이려면 셋째 힘도 그 점을 지나야 하기 때문.</p>
  </div>
  <div class="one">한 줄: 미지수 > 3 → 부정정(차수 = 미지수 − 3) · 반력이 모두 평행하거나 한 점에 모이면 부적절 · 2력 부재 = 두 점을 잇는 방향 · 3력 부재 = 한 점에서 만나거나 평행.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>부정정 차수 = 미지수 − 독립 식 수(2D 3)</li><li>부적절 = 반력이 모두 평행 또는 한 점에 모임</li><li>2력 부재: 크기 같고 반대, 두 점을 잇는 직선 위</li><li>3력 부재: 한 점에서 만남 또는 평행</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>휘어진 부재도 2력 부재인 이유(모멘트 평형)</li><li>개수가 맞아도 부적절할 수 있는 이유</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 5-1 · 부정정 차수</div><p>2D 보의 양 끝을 모두 핀으로 지지했다. 부정정 차수는?</p><ol class="choices"><li data-ok="1">1</li><li>0</li><li>2</li><li>4</li></ol><details><summary>답</summary><div class="ans">핀 2개 × 미지수 2 = 4, 독립 식 3 → 4 − 3 = 1차 부정정(수평 반력 둘이 나뉘는 몫을 식만으로 못 정한다).</div></details></div>
  <div class="q"><div class="qn">기초 5-2 · 2력 부재</div><p>무게를 무시하는 휘어진 막대가 양 끝 A, B의 핀에서만 힘을 받아 평형이다. A에서 막대가 받는 힘의 방향은?</p><ol class="choices"><li data-ok="1">A와 B를 잇는 직선 방향</li><li>막대의 A 끝 접선 방향</li><li>수직 방향</li><li>정할 수 없다</li></ol><details><summary>답</summary><div class="ans">2력 부재: B에 대한 모멘트 평형 → A의 힘의 작용선이 B를 지나야 한다 → A–B 직선 방향. 막대 모양과는 상관없다.</div></details></div>
  <div class="q"><div class="qn">기초 5-3 · 부적절한 지지</div><p>보를 롤러 세 개로 받쳤고 세 반력이 모두 수직이다. 옳은 것은?</p><ol class="choices"><li data-ok="1">미지수가 3개여도 수평 하중이 오면 평형이 불가능 — 부적절한 지지</li><li>미지수 3개라 항상 정정</li><li>1차 부정정</li><li>반력이 모두 0</li></ol><details><summary>답</summary><div class="ans">반력이 모두 평행(수직) → \(\sum F_x=0\)을 만족시킬 반력이 없다. 수평 하중이 조금만 있어도 미끄러진다.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 5-1 · 버팀대로 받친 보</div><p>그림처럼 수평 보 AB(길이 4 m)의 A는 벽에 핀으로, B는 버팀대 BC로 받쳐져 있다. C는 A 바로 아래 4 m 지점의 벽 핀이고, 버팀대는 양 끝만 핀으로 연결되며 보와 버팀대의 무게는 무시한다. 보의 가운데에 10 kN이 아래로 작용할 때 버팀대의 힘(인장/압축)과 A의 반력을 구하라.</p>@@F_STRUT@@<details><summary>답</summary><div class="ans">① BC는 2력 부재 → 힘은 C → B 방향(45°). 크기를 \(F\)로 두면 B에서 보가 받는 힘 \(\left(\frac{F}{\sqrt2},\frac{F}{\sqrt2}\right)\)(압축이면 보를 오른쪽 위로 민다). ② \(\sum M_A=4\cdot\frac{F}{\sqrt2}-2\times10=0\) → \(F=5\sqrt2\approx7.07\) kN, 양수라 가정대로 <b>압축</b>. ③ \(\sum F_x=A_x+5=0\) → \(A_x=-5\) kN(왼쪽 5 kN). ④ \(\sum F_y=A_y+5-10=0\) → \(A_y=5\) kN(위). 검산 \(\sum M_B=-4A_y+2\times10=-20+20=0\) ✓.</div></details></div>
</section>
"""

P6 = r"""
<section>
  <h2><span class="no">파트 6 · 교재 선행</span>Ch.5 ③ 3D 강체의 평형 — 지지 5종 · 평형 방정식 6개</h2>
  <h3><span class="tag c">개념</span>ΣF = 0 세 식 + ΣM = 0 세 식 — 미지수 6개까지</h3>
  <div class="why">2D의 식 3개가 3D에서는 6개(힘 3 + 모멘트 3)로 늘어난다. 지지도 막는 방향이 늘어 종류가 많아진다. 푸는 요령(미지수가 많이 지나는 축에 대한 모멘트부터)은 2D와 같다.</div>
  <div class="concept">
    <p><b>3D 평형 방정식</b>: \(\sum F_x=\sum F_y=\sum F_z=0\), \(\sum M_x=\sum M_y=\sum M_z=0\) — 6개. 벡터로 \(\sum\vec F=0\), \(\sum\vec M_P=\sum\vec r\times\vec F+\sum\vec M=0\).</p>
    <p><b>3D 지지 표</b>: <b>볼-소켓</b> — 힘 3개(\(A_x,A_y,A_z\)), 어느 방향으로도 돌 수 있다 / <b>롤러·매끄러운 면</b> — 면에 수직인 힘 1개 / <b>경첩(힌지)</b> — 힘 3개 + 우력 2개(경첩 축 둘레로만 돈다) / <b>베어링</b> — 축에 수직인 힘 2개 + 우력 2개(축 둘레로 돌고 축 방향으로 미끄러진다) / <b>고정</b> — 힘 3개 + 우력 3개.</p>
    <p><b>[Ch.4 연결] 축에 대한 모멘트</b>: \(\sum M_x=0\)은 \(x\)축에 대한 모멘트의 합이다. 파트 2의 직선 모멘트 — 그 축과 평행하거나 그 축과 만나는 힘은 0이라 빠진다. 그래서 미지수가 많이 지나는 축을 고르면 식이 간단해진다.</p>
    <p><b>수직 힘만 있는 판</b>: 수평한 판을 수직 힘들이 받치면 \(\sum F_x=\sum F_y=\sum M_z=0\)은 저절로 성립하고, 남는 식은 \(\sum F_z=0\), \(\sum M_x=0\), \(\sum M_y=0\) 셋. 점 \((x,y)\)의 수직 힘 \(F_z\)의 모멘트는 \(M_x=yF_z\), \(M_y=-xF_z\).</p>
  </div>
  <div class="one">한 줄: 3D 식 6개 · 볼-소켓 3 · 롤러 1 · 경첩 5 · 베어링 4 · 고정 6 · 축에 평행하거나 만나는 힘은 그 축 모멘트 0.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>3D 평형 식 6개</li><li>반력 수: 볼-소켓 3 · 롤러 1 · 경첩 3+2 · 베어링 2+2 · 고정 3+3</li><li>수직 힘 \(F_z\)의 모멘트: \(M_x=yF_z\), \(M_y=-xF_z\)</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>지지가 막는 이동·회전 방향 = 반력·반력 우력</li><li>축을 잘 고르면 미지수가 빠지는 이유(직선 모멘트)</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 6-1 · 3D 식의 수</div><p>3차원 강체의 평형에서 독립인 평형 방정식은 최대 몇 개인가?</p><ol class="choices"><li data-ok="1">6개</li><li>3개</li><li>9개</li><li>4개</li></ol><details><summary>답</summary><div class="ans">힘 성분 3개 + 모멘트 성분 3개 = 6개.</div></details></div>
  <div class="q"><div class="qn">기초 6-2 · 볼-소켓</div><p>볼-소켓 지지가 주는 반력은?</p><ol class="choices"><li data-ok="1">세 방향 힘(우력 없음)</li><li>세 방향 힘 + 세 방향 우력</li><li>면에 수직인 힘 하나</li><li>두 방향 힘 + 두 방향 우력</li></ol><details><summary>답</summary><div class="ans">공이 소켓 안에서 어느 방향으로든 돌 수 있어 우력은 없고, 이동은 세 방향 모두 막아 힘 3개.</div></details></div>
  <div class="q"><div class="qn">기초 6-3 · 고정 지지</div><p>3D 고정 지지(벽에 끼워 박음)의 반력 미지수는 몇 개인가?</p><ol class="choices"><li data-ok="1">6개</li><li>3개</li><li>5개</li><li>1개</li></ol><details><summary>답</summary><div class="ans">이동 3방향 + 회전 3방향을 모두 막음 → 힘 3 + 우력 3.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 6-1 · 세 점에서 받친 판</div><p>그림(판을 내려다본 평면도)처럼 무게를 무시하는 수평한 판이 A\((0,0)\), B\((3,0)\), C\((0,2)\) m 세 점에서 수직 지지 반력만 받고, 점 \((1,1)\) m에 600 N이 아래로 작용한다(판의 좌표가 \(x,y\), 위쪽이 \(z\)). 세 반력을 구하라.</p>@@F_PLATE@@<details><summary>답</summary><div class="ans">남는 식 셋: ① \(\sum M_y\)(\(y\)축 = A와 C를 잇는 선): \(A\), \(C\)는 \(x=0\)이라 빠짐 → \(-3B+1\times600=0\) → \(B=200\) N. ② \(\sum M_x\)(\(x\)축 = A와 B를 잇는 선): \(2C-1\times600=0\) → \(C=300\) N. ③ \(\sum F_z\): \(A+200+300-600=0\) → \(A=100\) N. 검산: \(\sum\vec r\times\vec F=0\)(세 성분 모두 0) ✓. 해석: 하중이 \(x\) 방향으로 3 m 중 1 m 지점이라 B가 1/3(200 N), \(y\) 방향으로 2 m 중 1 m 지점이라 C가 1/2(300 N)을 지고 나머지를 A가 진다.</div></details></div>
</section>
"""

TAIL = "\n</body>\n</html>\n"

def build():
    body = HEAD + P1 + P2 + P3 + P4 + P5 + P6 + TAIL
    rep = {"@@F_DF@@": F_DF, "@@F_COUPLE@@": F_COUPLE, "@@F_SUP@@": F_SUP, "@@F_BEAM@@": F_BEAM, "@@F_BEAM_FBD@@": F_BEAM_FBD,
           "@@F_Q_BEAM2@@": F_Q_BEAM2, "@@F_Q_CANT@@": F_Q_CANT, "@@F_23@@": F_23, "@@F_STRUT@@": F_STRUT, "@@F_PLATE@@": F_PLATE}
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
