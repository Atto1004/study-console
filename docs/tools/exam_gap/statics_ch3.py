# -*- coding: utf-8 -*-
"""정역학 · 중간고사 대비 3 — Ch.3 입자의 평형 문제 풀이(2D·3D) 정리노트 v2 생성기
대표님 2026-09-30 「정역학은 3, 4, 5 장이 시험범위임」 — Ch.3 은 9/24 덱(statics-mid)에 개념 두 파트뿐이고 2D·3D 평형 문제 풀이가 비어 있었다.
근거(§24 교수 자료 우선): 개념 = 9/16 교수필기(면의 접촉력·장력·도르래 T₁ = T₂·스프링 F = k|L − L₀|) · 9/21 교수필기(좌표계는 힘 방향 보고,
  2D/3D 평형식). 문제 유형 = 교수님이 낸 과제 Chapter 3 (3.11 경사면 · 3.26 두 줄 · 3.47 링크 · 3.51 줄+스프링 · 3.63·3.69 3D 세 줄) —
  OT(9/2 슬라이드 p.8) 「과제 1~2문제가 시험에 그대로」. 과제 원문·답은 공개 저장소에 옮기지 않고 같은 유형을 숫자만 바꿔 새로 만들었다(마감 9/30 23:59).
검산: statics_ch3_check.py (numpy).
출력: study-materials/정역학/_정리노트/2026-09-30_정역학_중간대비_Ch3_입자평형.html → build_slides.py → 덱 statics-mid3"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *

OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\정역학\_정리노트\2026-09-30_정역학_중간대비_Ch3_입자평형.html"
FIGS = []

def fig(w, h, *parts, cap="", name=""):
    FIGS.append(name)
    s = canvas(w, h, *parts, cap=cap, name=name)
    s = s.replace('<svg class="fig-svg"', '<svg class="fig-svg" style="max-width:100%;height:auto"', 1)
    return s.replace("<figcaption>", '<figcaption style="font-size:.86em;opacity:.85;margin-top:4px">', 1)

# ---- 공통 조각 ----
def hatch_h(x0, x1, y, down=True):
    s = line(x0, y, x1, y, INK, 1.8)
    for k in range(int((x1 - x0) // 8) + 1):
        xx = x0 + 8 * k
        s += line(xx, y, xx - 6, y + 7 if down else y - 7, GRAY, 1.1)
    return s
def pin_sup(x, y):
    return path(f"M{x} {y} L{x-14} {y+24} L{x+14} {y+24} Z", INK, 2, "#F1F3F5") + hatch_h(x - 22, x + 22, y + 24) + f'<circle cx="{x}" cy="{y}" r="4" fill="#fff" stroke="{INK}" stroke-width="2"/>'
def pin(x, y):
    return f'<circle cx="{x}" cy="{y}" r="5" fill="#fff" stroke="{INK}" stroke-width="2"/>'
def fill_poly(pts, fill):
    return '<path d="M' + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + f' Z" fill="{fill}" stroke="none"/>'
def spring(x1, y1, x2, y2, n=10, amp=6, lead=12, color=None, w=1.8):
    """스프링 지그재그(양 끝 곧은 부분 lead)"""
    L = math.hypot(x2 - x1, y2 - y1); ux, uy = (x2 - x1) / L, (y2 - y1) / L; px, py = -uy, ux
    pts = [(x1, y1), (x1 + lead * ux, y1 + lead * uy)]
    body = L - 2 * lead
    for i in range(1, 2 * n):
        t = lead + body * i / (2 * n); sgn = 1 if i % 2 else -1
        pts.append((x1 + t * ux + sgn * amp * px, y1 + t * uy + sgn * amp * py))
    pts += [(x2 - lead * ux, y2 - lead * uy), (x2, y2)]
    return polyline(pts, color or INK, w)
def legend_xy(x, y, L=34):
    return arrow(x, y, x + L, y, INK, "", 1.4) + arrow(x, y, x, y - L, INK, "", 1.4) + text(x + L + 4, y + 4, "x", 13, INK) + text(x + 6, y - L + 2, "y", 13, INK)
def dim_top(x0, x1, y, label):
    return line(x0, y, x1, y, GRAY, 1.2) + line(x0, y - 4, x0, y + 4, GRAY, 1.2) + line(x1, y - 4, x1, y + 4, GRAY, 1.2) + text((x0 + x1) / 2, y - 6, label, 12, GRAY, "middle")

# ---- 파트 1: 매듭 B 와 두 줄 ----
def _knot():
    B = (100, 110); A = (41.26, 40); C = (221.24, 40)
    s = hatch_h(20, 250, 40, down=False)
    s += line(B[0], B[1], A[0], A[1], INK, 2) + line(B[0], B[1], C[0], C[1], INK, 2)
    s += line(100, 110, 100, 146, INK, 2) + block(82, 146, 36, 28, "m")
    s += line(55, 110, 175, 110, GRAY, 1.2, "5 4")
    s += arc(100, 110, 26, 180, 230, GRAY, 1.3, "α", lr=40) + arc(100, 110, 34, 330, 360, GRAY, 1.3, "β", lr=48)
    s += dot(B[0], B[1]) + text(30, 58, "A", 14, INK, "end", True) + text(230, 58, "C", 14, INK, "start", True) + text(88, 128, "B", 14, INK, "end", True)
    # 자유물체도
    O = (400, 125)
    s += text(400, 24, "매듭 B의 자유물체도", 13, INK, "middle", True)
    s += line(340, 125, 470, 125, GRAY, 1.2, "5 4")
    s += arrow(O[0], O[1], round(400 - 80 * math.cos(math.radians(50)), 1), round(125 - 80 * math.sin(math.radians(50)), 1), GREEN, "", 2.4)
    s += arrow(O[0], O[1], round(400 + 80 * math.cos(math.radians(30)), 1), round(125 - 80 * math.sin(math.radians(30)), 1), GREEN, "", 2.4)
    s += arrow(O[0], O[1], 400, 200, RED, "", 2.4)
    s += text(340, 60, "T_BA", 14, GREEN, "end", True) + text(476, 82, "T_BC", 14, GREEN, "start", True) + text(408, 198, "W", 14, RED, "start", True)
    s += arc(400, 125, 24, 180, 230, GRAY, 1.3, "α", lr=36) + arc(400, 125, 30, 330, 360, GRAY, 1.3, "β", lr=46)
    s += dot(O[0], O[1]) + legend_xy(480, 200)
    return s
F_KNOT = fig(540, 230, _knot(), cap="매듭 B를 떼어 낸 자유물체도: 두 줄의 장력은 줄을 따라 B에서 멀어지는 쪽, 무게는 아래. \\(\\alpha\\)·\\(\\beta\\)는 수평에서 잰 각.", name="knot")

def _q_rt():
    A, C, B = (60, 42), (320, 42), (98.5, 134.3)
    s = dim_top(60, 320, 20, "1.3 m") + hatch_h(50, 330, 42, down=False)
    s += line(A[0], A[1], B[0], B[1], INK, 2) + line(B[0], B[1], C[0], C[1], INK, 2)
    e1 = ((A[0] - B[0]) / 100, (A[1] - B[1]) / 100); e2 = ((C[0] - B[0]) / 240, (C[1] - B[1]) / 240)
    p1 = (B[0] + 10 * e1[0], B[1] + 10 * e1[1]); p3 = (B[0] + 10 * e2[0], B[1] + 10 * e2[1]); p2 = (p1[0] + 10 * e2[0], p1[1] + 10 * e2[1])
    s += path(f"M{p1[0]:.1f} {p1[1]:.1f} L{p2[0]:.1f} {p2[1]:.1f} L{p3[0]:.1f} {p3[1]:.1f}", GRAY, 1.2)
    s += line(B[0], B[1], B[0], 150, INK, 2) + block(80, 150, 37, 24) + text(124, 168, "20 kg", 13, INK)
    s += dot(B[0], B[1]) + text(52, 59, "A", 14, INK, "end", True) + text(328, 59, "C", 14, INK, "start", True) + text(88, 139, "B", 14, INK, "end", True)
    s += text(70, 97, "0.5 m", 12, GRAY, "end") + text(230, 109, "1.2 m", 12, GRAY, "middle")
    return s
F_Q_RT = fig(380, 182, _q_rt(), name="q-rt")

# ---- 파트 2: 경사면 · 도르래 ----
def _incline():
    th = math.radians(30); u = (math.cos(th), -math.sin(th)); n = (-math.sin(th), -math.cos(th))
    s = path("M25 205 L245 205 L245 78 Z", INK, 2, "#F1F3F5")
    s += arc(25, 205, 40, 330, 360, GRAY, 1.3, "θ", lr=54)
    P = (25 + 125 * u[0], 205 + 125 * u[1]); c = (P[0] + 15 * n[0], P[1] + 15 * n[1])
    corners = [(c[0] + a * 23 * u[0] + b * 15 * n[0], c[1] + a * 23 * u[1] + b * 15 * n[1]) for a, b in ((1, 1), (1, -1), (-1, -1), (-1, 1))]
    s += path("M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in corners) + " Z", INK, 2, "#DDE3EA")
    s += text(round(c[0], 1), round(c[1] + 5, 1), "m", 13, INK, "middle", True)
    face = (c[0] + 23 * u[0], c[1] + 23 * u[1])
    P2 = (25 + 205 * u[0], 205 + 205 * u[1]); stake = (P2[0] + 20 * n[0], P2[1] + 20 * n[1]); tie = (P2[0] + 15 * n[0], P2[1] + 15 * n[1])
    s += line(round(P2[0], 1), round(P2[1], 1), round(stake[0], 1), round(stake[1], 1), INK, 3)
    s += line(round(face[0], 1), round(face[1], 1), round(tie[0], 1), round(tie[1], 1), INK, 2)
    s += text(150, 190, "매끄러운 면", 12, GRAY, "middle")
    # 자유물체도 (축을 경사면에)
    O = (395, 118)
    s += text(420, 22, "상자의 자유물체도", 13, INK, "middle", True)
    P = lambda k, v: (round(O[0] + k * v[0], 1), round(O[1] + k * v[1], 1))
    a0, a1 = P(-50, u), P(105, u); s += arrow(a0[0], a0[1], a1[0], a1[1], GRAY, "", 1.2, dash="4 3") + text(a1[0] + 4, a1[1] - 3, "x", 13, GRAY)
    b0, b1 = P(-60, n), P(95, n); s += arrow(b0[0], b0[1], b1[0], b1[1], GRAY, "", 1.2, dash="4 3") + text(b1[0] - 7, b1[1] - 1, "y", 13, GRAY, "end")
    e = P(70, n); s += arrow(O[0], O[1], e[0], e[1], GREEN, "", 2.4) + text(376, 72, "N", 14, GREEN, "start", True)
    e = P(80, u); s += arrow(O[0], O[1], e[0], e[1], GREEN, "", 2.4) + text(470, 96, "T", 14, GREEN, "start", True)
    s += arrow(O[0], O[1], O[0], O[1] + 85, RED, "", 2.4) + text(403, 203, "mg", 14, RED, "start", True)
    e = P(-85 * math.sin(th), u); s += arrow(O[0], O[1], e[0], e[1], GRAY, "", 1.6, dash="5 3") + text(352, 158, "mg sinθ", 12, GRAY, "end")
    e = P(-85 * math.cos(th), n); s += arrow(O[0], O[1], e[0], e[1], GRAY, "", 1.6, dash="5 3") + text(438, 190, "mg cosθ", 12, GRAY, "start")
    s += arc(O[0], O[1], 26, 60, 90, GRAY, 1.3, "θ", lr=38)
    s += dot(O[0], O[1])
    return s
F_INCLINE = fig(540, 240, _incline(), cap="매끄러운 경사면(경사각 \\(\\theta\\))의 상자와 자유물체도: 축을 경사면 방향 \\(x\\)·수직 방향 \\(y\\)로 잡으면 \\(N\\)과 \\(T\\)는 축 위에 있고, 무게만 \\(mg\\sin\\theta\\)(경사면 아래쪽)와 \\(mg\\cos\\theta\\)(면 쪽)로 나눈다. 무게와 면의 수직선 사이 각이 \\(\\theta\\).", name="incline")

def pulley_sys(dx=0, top=30, mid=150, fixc=60, block_lab="W", hand_lab="T", drop=46):
    """천장 고정점 → 움직도르래(두 가닥) → 고정 도르래 → 손. dx 만큼 옮겨 그린다"""
    X = lambda x: x + dx
    s = hatch_h(X(300), X(450), top, down=False)
    s += line(X(396), top, X(396), fixc, INK, 1.6) + circle(X(396), fixc, 22, INK, fill="#F1F3F5", w=1.6) + dot(X(396), fixc, "", 3)
    s += circle(X(352), mid, 22, INK, fill="#F1F3F5", w=1.6) + dot(X(352), mid, "", 3)
    s += line(X(330), top, X(330), mid, INK, 2) + path(f"M{X(330)} {mid} A22 22 0 0 0 {X(374)} {mid}", INK, 2)
    s += line(X(374), mid, X(374), fixc, INK, 2) + path(f"M{X(374)} {fixc} A22 22 0 0 1 {X(418)} {fixc}", INK, 2)
    s += line(X(418), fixc, X(418), mid, INK, 2) + arrow(X(418), mid, X(418), mid + drop, RED, "", 2.4)
    s += line(X(352), mid, X(352), mid + 32, INK, 2) + block(X(332), mid + 32, 40, 24, "" if block_lab.endswith("kg") else block_lab)
    return s

def _pulley():
    s = text(130, 16, "고정 도르래", 13, INK, "middle", True) + hatch_h(60, 200, 30, down=False)
    s += line(130, 30, 130, 46, INK, 1.6) + circle(130, 70, 24, INK, fill="#F1F3F5", w=1.6) + dot(130, 70, "", 3)
    s += path("M106 70 A24 24 0 0 1 154 70", INK, 2) + line(106, 70, 106, 175, INK, 2) + line(154, 70, 154, 150, INK, 2)
    s += block(88, 175, 36, 28, "W") + arrow(154, 150, 154, 196, RED, "", 2.4)
    s += text(96, 140, "T_1", 14, GREEN, "end", True) + text(162, 190, "T_2", 14, RED, "start", True) + text(130, 228, "T_1 = T_2", 13, INK, "middle", True)
    s += text(375, 16, "움직도르래", 13, INK, "middle", True) + pulley_sys()
    s += text(322, 100, "T", 14, GREEN, "end", True) + text(382, 110, "T", 14, GREEN, "start", True) + text(426, 190, "T", 14, RED, "start", True)
    s += text(352, 230, "2T = W", 13, INK, "middle", True)
    return s
F_PULLEY = fig(540, 240, _pulley(), cap="도르래는 줄의 방향만 바꾸고 장력은 그대로(\\(T_1=T_2\\)). 오른쪽: 물체에 달린 움직도르래를 줄 두 가닥이 받치면 \\(2T=W\\).", name="pulley")

def _q_pulley():
    s = pulley_sys(dx=-290, top=22, mid=132, fixc=50, block_lab="60 kg", drop=38)
    s += text(88, 182, "60 kg", 13, INK) + text(136, 172, "사람", 13, RED)
    return s
F_Q_PULLEY = fig(260, 200, _q_pulley(), name="q-pulley")

# ---- 파트 3: 스프링 · 링크 ----
def _q_spring():
    A, C = (50, 42), (274, 42); B = (181.25, 146.87)
    s = dim_top(50, 274, 18, "0.8 m") + hatch_h(40, 284, 42, down=False)
    s += line(A[0], A[1], B[0], B[1], INK, 2) + spring(C[0], C[1], B[0], B[1], n=9, amp=6, lead=14)
    s += line(B[0], B[1], B[0], 160, INK, 2) + block(162, 160, 38, 24) + text(206, 178, "30 kg", 13, INK)
    s += dot(B[0], B[1]) + text(42, 58, "A", 14, INK, "end", True) + text(282, 58, "C", 14, INK, "start", True) + text(166, 156, "B", 14, INK, "end", True)
    s += text(100, 112, "0.6 m", 12, GRAY, "end") + text(246, 112, "스프링 0.5 m", 12, GRAY) + text(246, 128, "(자연 길이 0.4 m)", 12, GRAY)
    return s
F_Q_SPRING = fig(380, 196, _q_spring(), name="q-spring")

def _q_link():
    A, B, C, D = (100, 200), (212, 200), (100, 116), (268, 46)
    s = pin_sup(*A) + pin_sup(*B)
    s += path(f"M{D[0]} {D[1]} L{D[0]-12} 24 L{D[0]+12} 24 Z", INK, 2, "#F1F3F5") + hatch_h(248, 288, 24, down=False)
    s += line(A[0], A[1], C[0], C[1], INK, 6) + line(C[0], C[1], D[0], D[1], INK, 6)
    s += line(B[0], B[1], 152, 155, "#AAB4C0", 14) + line(152, 155, C[0], C[1], INK, 5)
    for p in (A, B, C, D): s += pin(*p)
    s += arrow(C[0], C[1], 64, 89, RED, "", 2.6) + text(58, 84, "6 kN", 13, RED, "end", True)
    s += text(88, 197, "A", 14, INK, "end", True) + text(224, 197, "B", 14, INK, "start", True) + text(90, 136, "C", 14, INK, "end", True) + text(278, 52, "D", 14, INK, "start", True)
    s += text(178, 158, "실린더", 12, GRAY)
    s += legend_xy(330, 215)
    return s
F_Q_LINK = fig(390, 236, _q_link(), name="q-link")

# ---- 파트 4: 3D ----
def _3d():
    s3, ox, oy = 22, 240, 50
    Pp = lambda x, y, z: (round(ox + s3 * x - 0.5 * s3 * z, 1), round(oy - s3 * y + 0.35 * s3 * z, 1))
    s = fill_poly([Pp(-6, 0, -5), Pp(8, 0, -5), Pp(8, 0, 4), Pp(-6, 0, 4)], "#EEF1F5")
    A, B, C, D = Pp(0, -5, 0), Pp(6, 0, -1), Pp(-4, 0, 3), Pp(-3, 0, -4)
    for q in (B, C, D): s += line(A[0], A[1], q[0], q[1], INK, 2) + dot(q[0], q[1])
    s += line(A[0], A[1], A[0], A[1] + 18, INK, 2) + block(A[0] - 18, A[1] + 18, 36, 26, "m")
    ux, uy = B[0] - A[0], B[1] - A[1]; L = math.hypot(ux, uy); ux, uy = ux / L, uy / L
    s += arrow(A[0], A[1], round(A[0] + 46 * ux, 1), round(A[1] + 46 * uy, 1), RED, "", 3)
    s += text(round(A[0] + 50 * ux + 6, 1), round(A[1] + 46 * uy + 16, 1), "T_AB e_AB", 13, RED, "start", True)
    s += text(322, 116, "r_AB = B − A", 13, BLUE, "start", True)
    s += dot(A[0], A[1]) + text(A[0] - 12, A[1] + 4, "A", 14, INK, "end", True)
    s += text(B[0] + 7, B[1] - 2, "B", 14, INK, "start", True) + text(C[0] - 9, C[1] - 3, "C", 14, INK, "end", True) + text(D[0] - 8, D[1] - 1, "D", 14, INK, "end", True)
    s += text(300, 26, "천장 (y = 0)", 12, GRAY, "start")
    # 축 범례: x 오른쪽 · y 위 · z 앞(왼쪽 아래)
    O = (60, 222)
    s += arrow(O[0], O[1], O[0] + 36, O[1], INK, "", 1.4) + arrow(O[0], O[1], O[0], O[1] - 36, INK, "", 1.4) + arrow(O[0], O[1], O[0] - 20, O[1] + 14, INK, "", 1.4)
    s += text(O[0] + 40, O[1] + 4, "x", 13, INK) + text(O[0] + 6, O[1] - 32, "y", 13, INK) + text(O[0] - 26, O[1] + 20, "z", 13, INK, "end")
    return s
F_3D = fig(500, 250, _3d(), cap="매듭 A에서 줄 끝 B로 가는 위치벡터 \\(\\vec r_{AB}\\)(끝점 − 시작점)를 길이로 나눈 단위벡터 \\(\\vec e_{AB}\\)에 장력을 곱한 \\(T_{AB}\\vec e_{AB}\\)가 줄의 힘. \\(y\\)축이 연직 위.", name="cables3d")

HEAD = r"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>정역학 · 중간고사 대비 3 — Ch.3 입자의 평형 문제 풀이(2D·3D)</title>
<!-- 정리노트 v2. 생성기 docs/tools/exam_gap/statics_ch3.py → build_slides.py 로 덱 statics-mid3.
     개념 = 9/16·9/21 교수 필기, 문제 = 과제 Chapter 3 과 같은 유형(숫자를 바꿔 새로 만듦). -->
<style>body{font-family:Pretendard,"Malgun Gothic",sans-serif;max-width:900px;margin:24px auto;padding:0 16px;line-height:1.6}section{border-top:2px solid #333;padding-top:12px;margin-top:28px}h2 .no{display:inline-block;background:#1f2a44;color:#fff;font-size:13px;padding:2px 8px;border-radius:6px;margin-right:8px}h3 .tag{display:inline-block;font-size:12px;padding:1px 7px;border-radius:5px;margin-right:6px;background:#eee}.tag.c{background:#dbe7ff}.tag.b{background:#dff5e1}.tag.a{background:#ffe6cc}.why{background:#f6f6f6;padding:10px 12px;border-radius:8px}.one{border-left:4px solid #1f2a44;padding:6px 10px;margin:8px 0;background:#fafafa}.q{border:1px solid #ddd;border-radius:8px;padding:10px 12px;margin:10px 0}.qn{font-weight:700;color:#1f2a44}.choices li[data-ok]{font-weight:700}.mu{display:grid;grid-template-columns:1fr 1fr;gap:10px}.mu-mem{background:#fff8d6;padding:8px 10px;border-radius:8px}.mu-und{background:#e3efff;padding:8px 10px;border-radius:8px}.mu-h{font-weight:700;margin-bottom:4px}aside.exam{background:#ffe0ec;border-left:4px solid #d0397a;padding:6px 10px;margin:8px 0;font-size:14px}figure.fig{margin:10px 0}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 8px;font-size:14px}</style>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"><script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body,{delimiters:[{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true}]})"></script>
</head>
<body>
<h1>정역학 · 중간고사 대비 3 — Ch.3 입자의 평형 문제 풀이(2D·3D)</h1>
<p>중간 10/19 · 범위 Ch.3~5 · 개념은 9/16·9/21 수업 교수님 필기의 순서와 표기, 문제는 교수님이 낸 과제 Chapter 3(3.11·3.26·3.47·3.51·3.63·3.69)와 같은 유형으로 숫자를 바꿔 새로 만들었다.</p>
"""

P1 = r"""
<section>
  <h2><span class="no">파트 1 · 9/21</span>2D 입자 평형 ① 두 줄에 매단 물체 — 매듭 점 · 성분 · 연립 <span class="star">★★</span></h2>
  <aside class="exam" data-level="강조" data-when="9/2 OT 슬라이드 p.8">과제 1~2문제가 시험에 그대로 출제 — 틀리면 부분점수 없음</aside>
  <h3><span class="tag c">개념</span>매듭 점 하나를 떼어 내고 ΣFx = 0, ΣFy = 0</h3>
  <div class="why">Ch.3 과제 6문제가 전부 이 모양이다: 줄·스프링·면에 붙잡힌 물체(또는 줄이 모인 매듭)에서 \(\sum\vec F=0\). 수업에서 배운 평형 방정식을 삼각비와 연립방정식으로 푸는 연습이다.</div>
  <div class="concept">
    <p><b>입자(particle)</b>: 크기를 무시하고 한 점으로 보는 물체. 모든 힘이 한 점에 모이므로 평형 조건은 \(\sum\vec F=0\) 하나다(9/21 판서). 줄 여러 개가 묶인 매듭(knot)도 입자로 본다.</p>
    <p><b>풀이 순서</b> ① 떼어 낼 점 고르기 — 모르는 장력이 모두 걸린 점(보통 매듭) ② 자유물체도(FBD): 그 점에 작용하는 외력만 — 무게 \(mg\)는 아래, 장력은 줄을 따라 그 점에서 <b>멀어지는</b> 쪽(줄은 당기기만 한다) ③ 좌표축: 힘이 대부분 수평·수직이면 축도 수평·수직(9/21 판서) ④ 힘마다 성분 → \(\sum F_x=0,\ \sum F_y=0\) 두 식 → 모르는 값 두 개까지 풀린다.</p>
    @@F_KNOT@@
    <p><b>[중학 수학 연결] 삼각비</b>: 크기 \(T\)인 힘이 수평과 각 \(\alpha\)를 이루면 수평 성분 \(T\cos\alpha\), 수직 성분 \(T\sin\alpha\). 직각삼각형에서 빗변 × cos = 각에 붙은 변, 빗변 × sin = 각의 맞은편 변이기 때문이다. 각을 <b>연직선</b>에서 쟀다면 sin과 cos이 서로 바뀐다 — 각을 어디서 쟀는지 먼저 본다. 부호는 방향으로: 왼쪽·아래는 −.</p>
    <p><b>식 세우기(그림의 매듭 B)</b>: \(\sum F_x=-T_{BA}\cos\alpha+T_{BC}\cos\beta=0\), \(\sum F_y=T_{BA}\sin\alpha+T_{BC}\sin\beta-W=0\).</p>
    <p><b>[중학 수학 연결] 연립방정식</b>: 첫 식에서 \(T_{BC}=T_{BA}\cos\alpha/\cos\beta\) → 둘째 식에 대입하면 \(T_{BA}\)가 나오고, 다시 첫 식으로 \(T_{BC}\). 정리하면 \(T_{BA}=\dfrac{W\cos\beta}{\sin(\alpha+\beta)}\), \(T_{BC}=\dfrac{W\cos\alpha}{\sin(\alpha+\beta)}\) — 외울 필요는 없고 검산용.</p>
    <p><b>길이로 주어지면</b>: 각 대신 변의 길이를 주는 문제가 많다(과제 3.26). 세 변이 \(a^2+b^2=c^2\)를 만족하면 [중학 수학 연결] 피타고라스 정리의 역으로 두 줄이 만나는 각이 직각 → cos·sin이 변의 비로 바로 나온다(3-4-5면 0.6·0.8). 직각이 아니면 코사인 법칙(파트 3).</p>
    <p><b>감각</b>: 무게 \(W\)를 두 줄이 수평과 같은 각 \(\theta\)로 대칭으로 매달면 \(2T\sin\theta=W\) → \(T=\dfrac{W}{2\sin\theta}\). 줄이 수평에 가까울수록(\(\theta\)가 작을수록) 장력이 커진다 — 빨랫줄을 완전히 수평으로 팽팽하게 만들 수 없는 이유.</p>
  </div>
  <div class="one">한 줄: 매듭을 떼어 FBD(장력은 줄을 따라 바깥쪽) → 성분(각을 어디서 쟀는지 확인) → \(\sum F_x=0,\ \sum F_y=0\) 연립 → 식에 다시 넣어 검산.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>평형(equilibrium): \(\sum F_x=0,\ \sum F_y=0\)</li><li>장력(tension)은 줄 방향, 떼어 낸 점에서 멀어지는 쪽</li><li>수평에서 잰 각: \((T\cos\alpha,\ T\sin\alpha)\)</li><li>3-4-5 삼각형: cos·sin = 0.6·0.8</li><li>자유물체도 = free-body diagram(FBD)</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>매듭을 떼어 내는 이유 — 모르는 장력이 한 점에 모인다</li><li>각이 작을수록 장력이 커지는 이유</li><li>연직선에서 잰 각이면 sin·cos이 바뀌는 이유</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 1-1 · 장력의 성분</div><p>장력 \(T=200\) N인 줄이 매듭을 오른쪽 위로, 수평과 30°를 이루며 당긴다. 이 힘의 \((x,\ y)\) 성분은?</p><ol class="choices"><li data-ok="1">(173.2, 100) N</li><li>(100, 173.2) N</li><li>(230.9, 400) N</li><li>(200, 200) N</li></ol><details><summary>답</summary><div class="ans">수평에서 잰 각이므로 \(x\) 성분 \(200\cos30°=173.2\) N, \(y\) 성분 \(200\sin30°=100\) N. 2번은 sin·cos을 바꾼 것, 3번은 곱하지 않고 나눈 것. 검산: \(\sqrt{173.2^2+100^2}=200\) ✓.</div></details></div>
  <div class="q" data-def="W"><div class="qn">기초 1-2 · 줄의 각과 장력</div><p>무게 \(W\)인 물체를 두 줄이 좌우 대칭으로, 각각 수평과 각 \(\theta\)를 이루며 매단다. \(\theta\)를 점점 작게 하면(줄을 수평에 가깝게) 장력은?</p><ol class="choices"><li data-ok="1">커진다</li><li>작아진다</li><li>변하지 않는다</li><li>\(W/2\)로 일정하다</li></ol><details><summary>답</summary><div class="ans">연직 방향 평형 \(2T\sin\theta=W\) → \(T=\dfrac{W}{2\sin\theta}\). \(\theta\)가 작아지면 \(\sin\theta\)가 작아져 \(T\)가 커진다. 예: \(\theta=30°\)면 \(T=W\), \(\theta=10°\)면 \(T\approx2.88W\). \(W/2\)는 두 줄이 연직(\(\theta=90°\))일 때뿐.</div></details></div>
  <div class="q"><div class="qn">기초 1-3 · 장력의 방향</div><p>매듭을 떼어 내 자유물체도를 그릴 때, 매듭에 묶인 줄이 매듭에 주는 힘의 방향은?</p><ol class="choices"><li data-ok="1">줄을 따라 매듭에서 멀어지는 쪽</li><li>줄을 따라 매듭 쪽으로 미는 방향</li><li>줄 방향과 상관없이 연직 위쪽</li><li>줄에 수직인 방향</li></ol><details><summary>답</summary><div class="ans">줄은 당기기만 하고 밀 수 없다(9/16 판서: 장력의 작용선은 케이블과 일직선). 그래서 떼어 낸 점에서 줄이 뻗은 쪽으로 화살표를 그린다. 계산에서 장력이 음수로 나오면 자유물체도나 좌표를 다시 본다.</div></details></div>
  <div class="q"><div class="qn">기초 1-4 · 3-4-5 방향</div><p>매듭에서 줄이 오른쪽으로 4, 위로 3의 비율로 뻗어 있고 장력의 크기는 50 N이다. 줄이 매듭에 주는 힘의 \((x,\ y)\) 성분은?</p><ol class="choices"><li data-ok="1">(40, 30) N</li><li>(30, 40) N</li><li>(200, 150) N</li><li>(4, 3) N</li></ol><details><summary>답</summary><div class="ans">방향의 길이 \(\sqrt{4^2+3^2}=5\) → 단위벡터 \((4/5,\ 3/5)=(0.8,\ 0.6)\). 힘 \(=50\times(0.8,\ 0.6)=(40,\ 30)\) N. 3번은 5로 나누지 않은 것.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 1-1 · 각이 다른 두 줄</div><p>질량 50 kg인 물체가 매듭 B에 매달려 있다. B에서 줄 BA는 왼쪽 위로 수평과 50°, 줄 BC는 오른쪽 위로 수평과 30°를 이루며 천장에 묶여 있다. 두 줄의 장력 \(T_{BA}\), \(T_{BC}\)를 구하라(\(g=9.81\ \mathrm{m/s^2}\)).</p><details><summary>답</summary><div class="ans">① 무게 \(W=50\times9.81=490.5\) N. ② B의 자유물체도: \(T_{BA}\)는 왼쪽 위 50°, \(T_{BC}\)는 오른쪽 위 30°, \(W\)는 아래. ③ \(\sum F_x=-T_{BA}\cos50°+T_{BC}\cos30°=0\) → \(T_{BC}=T_{BA}\dfrac{\cos50°}{\cos30°}=0.7422\,T_{BA}\). ④ \(\sum F_y=T_{BA}\sin50°+T_{BC}\sin30°-490.5=0\) → \(T_{BA}(0.7660+0.7422\times0.5)=1.1372\,T_{BA}=490.5\) → \(T_{BA}\approx431.3\) N. ⑤ \(T_{BC}=0.7422\times431.3\approx320.2\) N. 검산: \(x\) 성분 \(-431.3\times0.6428+320.2\times0.8660=-277.2+277.3\approx0\) ✓, 공식 \(T_{BA}=W\cos30°/\sin80°=431.3\) ✓.</div></details></div>
  <div class="q"><div class="qn a">응용 1-2 · 길이로 주어진 두 줄</div><p>그림처럼 천장의 두 점 A, C(사이 1.3 m)에 줄 AB(0.5 m)와 줄 BC(1.2 m)를 묶고, 매듭 B에 질량 20 kg인 물체를 매달았다. 두 줄의 장력을 구하라(\(g=9.81\ \mathrm{m/s^2}\)).</p>@@F_Q_RT@@<details><summary>답</summary><div class="ans">① 변 확인: \(0.5^2+1.2^2=0.25+1.44=1.69=1.3^2\) → B에서 두 줄이 직각(피타고라스 정리의 역). ② 각: 줄 AB가 수평과 이루는 각의 cos \(=0.5/1.3=5/13\)(약 67.4°), 줄 BC는 cos \(=1.2/1.3=12/13\)(약 22.6°). ③ B에서 A 쪽 단위벡터 \((-\tfrac{5}{13},\ \tfrac{12}{13})\), C 쪽 \((\tfrac{12}{13},\ \tfrac{5}{13})\). ④ \(W=20\times9.81=196.2\) N. \(\sum F_x=-\tfrac{5}{13}T_{AB}+\tfrac{12}{13}T_{BC}=0\) → \(T_{AB}=2.4\,T_{BC}\). \(\sum F_y=\tfrac{12}{13}T_{AB}+\tfrac{5}{13}T_{BC}-196.2=0\) → \(\tfrac{12\times2.4+5}{13}T_{BC}=2.6\,T_{BC}=196.2\) → \(T_{BC}\approx75.5\) N, \(T_{AB}=2.4\times75.46\approx181.1\) N. 검산(축을 두 줄 방향으로 잡으면 식 하나에 미지수 하나): \(T_{AB}=W\times\tfrac{12}{13}=181.1\) ✓, \(T_{BC}=W\times\tfrac{5}{13}=75.5\) ✓.</div></details></div>
</section>
"""

P2 = r"""
<section>
  <h2><span class="no">파트 2 · 9/16</span>2D 입자 평형 ② 경사면과 도르래 — 축을 면에 맞춘다 · 장력은 줄을 따라 같다 <span class="star">★★</span></h2>
  <aside class="exam" data-level="범위" data-when="9/16 영상 ②06:38">"여기서부터 중간고사 범위. 3, 4, 5장"</aside>
  <h3><span class="tag c">개념</span>매끄러운 면은 수직력 하나 · 도르래는 방향만 바꾼다</h3>
  <div class="why">과제 3.11(매끄러운 경사면의 상자)과 도르래 문제의 핵심은 두 가지다: 면이 주는 힘의 방향, 그리고 도르래를 지나도 장력이 같다는 것. 둘 다 9/16 판서 내용이다.</div>
  <div class="concept">
    <p><b>면의 접촉력(9/16 판서)</b>: 면이 물체에 주는 힘 = 면에 수직인 수직력 \(\vec N\)(normal force) + 면에 평행한 마찰력 \(\vec f\)(friction). <b>매끄러운(smooth) 면</b> = 마찰 없음 → 수직력 하나뿐. 방향은 면에서 물체 쪽(면은 밀기만 한다).</p>
    <p><b>경사면 요령</b>: 축을 경사면 방향(\(x\))과 경사면에 수직(\(y\))으로 잡는다. 수직력은 \(y\)축에, 경사면과 평행한 줄의 장력은 \(x\)축에 놓여 나눌 필요가 없고, 무게만 나누면 된다.</p>
    @@F_INCLINE@@
    <p><b>무게의 성분</b>: 경사각 \(\theta\)이면 경사면을 따라 아래로 \(mg\sin\theta\), 면을 누르는 쪽으로 \(mg\cos\theta\). 이유: 무게(연직)와 면의 수직선 사이 각이 경사각과 같은 \(\theta\)다 — 수평선과 경사면을 각각 90° 돌린 것이 연직선과 수직선이라 사이각이 그대로다. 확인: \(\theta=0\)(평평한 바닥)이면 경사면 방향 성분 \(mg\sin0=0\), \(\theta=90°\)(벽)이면 \(mg\) 전부.</p>
    <p><b>평형식(그림)</b>: \(\sum F_x=T-mg\sin\theta=0\), \(\sum F_y=N-mg\cos\theta=0\). 줄이나 미는 힘이 축과 비스듬하면 그 힘도 두 성분으로 나눈다.</p>
    <p><b>도르래(pulley, 9/16 판서)</b>: 줄의 방향만 바꾸고 장력은 그대로 \(T_1=T_2\) — 줄의 질량이 0이라 줄 한 토막의 양끝 장력이 같다. 도르래 축의 마찰도 무시한다.</p>
    @@F_PULLEY@@
    <p><b>움직도르래</b>: 물체에 달린 도르래를 줄 두 가닥이 받치면, 도르래+물체를 떼어 낸 자유물체도에 위로 \(T\) 두 개 → \(2T=W\). 가닥이 \(n\)개면 \(T=W/n\). <b>도르래 축이 받는 힘</b>: 도르래만 떼어 내면 줄 두 가닥의 장력이 모두 도르래에서 멀어지는 쪽 → 축(지지대)이 그 합력의 반대 힘을 준다.</p>
  </div>
  <div class="one">한 줄: 매끄러운 면 → 수직력 \(N\) 하나(면에 수직) · 경사면은 축을 면에 맞추고 무게만 \(mg\sin\theta\)·\(mg\cos\theta\)로 · 도르래는 \(T_1=T_2\) · 가닥 \(n\)개면 \(T=W/n\).</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>매끄러운(smooth) = 마찰 없음 → \(N\)만</li><li>경사면: 면 방향 \(mg\sin\theta\), 수직 \(mg\cos\theta\)</li><li>도르래(pulley): \(T_1=T_2\)</li><li>움직도르래 두 가닥: \(2T=W\)</li><li>수직력 = normal force</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>무게와 면의 수직선 사이 각이 경사각과 같은 이유</li><li>도르래를 지나도 장력이 같은 이유(줄 질량 0)</li><li>축을 면에 맞추면 계산이 줄어드는 이유</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 2-1 · 매끄러운 면의 힘</div><p>매끄러운(마찰 없는) 면이 그 면에 놓인 물체에 주는 힘의 방향은?</p><ol class="choices"><li data-ok="1">면에 수직, 면에서 물체 쪽</li><li>면에 평행</li><li>항상 연직 위쪽</li><li>물체가 미끄러지려는 방향의 반대</li></ol><details><summary>답</summary><div class="ans">접촉력 = 수직력(면에 수직) + 마찰력(면에 평행). 매끄러우면 마찰력 0 → 수직력만 남고, 면은 물체를 밀기만 하므로 면에서 물체 쪽. 경사면이면 연직이 아니라 경사면에 수직이다.</div></details></div>
  <div class="q"><div class="qn">기초 2-2 · 무게의 경사면 방향 성분</div><p>경사각 \(\theta\)인 경사면에 질량 \(m\)인 물체가 놓여 있다. 무게 중 경사면을 따라 아래로 향하는 성분의 크기는?</p><ol class="choices"><li data-ok="1">\(mg\sin\theta\)</li><li>\(mg\cos\theta\)</li><li>\(mg\tan\theta\)</li><li>\(mg\)</li></ol><details><summary>답</summary><div class="ans">무게와 경사면의 수직선 사이 각이 \(\theta\) → 면에 수직인 성분 \(mg\cos\theta\), 면 방향 성분 \(mg\sin\theta\). 확인: \(\theta=0\)(평평)이면 면 방향 성분이 0이어야 하는데 \(\sin0=0\) ✓.</div></details></div>
  <div class="q"><div class="qn">기초 2-3 · 경사면 상자의 자유물체도</div><p>매끄러운 경사면에 놓인 상자가 경사면과 평행한 줄에 붙잡혀 정지해 있다. 상자의 자유물체도에 그려야 하는 힘을 모두 고르면?</p><ol class="choices"><li data-ok="1">무게, 수직력, 장력</li><li>무게, 수직력, 장력, 마찰력</li><li>무게, 장력</li><li>무게, 수직력, 장력, 경사면을 따라 미끄러지려는 힘</li></ol><details><summary>답</summary><div class="ans">매끄러운 면 → 마찰력 없음. 「미끄러지려는 힘」은 따로 있는 힘이 아니라 무게의 경사면 방향 성분 \(mg\sin\theta\)이다 — 무게를 그렸으면 다시 그리지 않는다.</div></details></div>
  <div class="q" data-def="W"><div class="qn">기초 2-4 · 움직도르래</div><p>무게 \(W\)인 물체가 달린 움직도르래를 줄 두 가닥이 연직으로 받치고 있다(줄·도르래의 무게와 마찰 무시). 줄의 장력은?</p><ol class="choices"><li data-ok="1">\(W/2\)</li><li>\(W\)</li><li>\(2W\)</li><li>\(W/4\)</li></ol><details><summary>답</summary><div class="ans">도르래+물체를 떼어 내면 위로 \(T\) 두 개(같은 줄이라 장력이 같다), 아래로 \(W\) → \(2T-W=0\) → \(T=W/2\).</div></details></div>
  <div class="q"><div class="qn">기초 2-5 · 도르래 축이 받는 힘</div><p>천장에 매달린 고정 도르래에 줄이 걸려 있고, 줄의 두 가닥이 모두 연직 아래로 내려가며 장력은 각각 100 N이다. 천장의 지지대가 도르래를 받치는 힘은? (도르래 무게 무시)</p><ol class="choices"><li data-ok="1">200 N, 연직 위로</li><li>100 N, 연직 위로</li><li>0</li><li>200 N, 연직 아래로</li></ol><details><summary>답</summary><div class="ans">도르래만 떼어 내면 두 가닥이 도르래를 각각 100 N씩 아래로 당긴다 → 지지대는 \(2\times100=200\) N을 위로.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 2-1 · 매끄러운 경사면의 상자</div><p>수평과 40°를 이루는 매끄러운 경사면에 질량 80 kg인 상자가 놓여 있고, 경사면과 평행하게 위쪽으로 당기는 줄이 상자를 붙잡고 있다. (a) 상자의 자유물체도에 들어갈 힘을 쓰라. (b) 줄의 장력과 경사면의 수직력을 구하라(\(g=9.81\ \mathrm{m/s^2}\)).</p><details><summary>답</summary><div class="ans">(a) 무게 \(mg=784.8\) N(연직 아래) · 수직력 \(N\)(경사면에 수직, 면에서 상자 쪽) · 장력 \(T\)(경사면을 따라 위쪽). 마찰 없음. (b) 축: 경사면 방향 \(x\)(위쪽 +), 수직 방향 \(y\). \(\sum F_x=T-784.8\sin40°=0\) → \(T=784.8\times0.6428\approx504.5\) N. \(\sum F_y=N-784.8\cos40°=0\) → \(N=784.8\times0.7660\approx601.2\) N. 검산: \(\sqrt{504.5^2+601.2^2}\approx784.8=mg\) ✓(두 힘의 합력이 무게와 균형).</div></details></div>
  <div class="q"><div class="qn a">응용 2-2 · 수평으로 미는 힘</div><p>수평과 30°를 이루는 매끄러운 경사면에 질량 20 kg인 상자가 놓여 있다. 수평 방향의 힘 \(F\)로 상자를 경사면 쪽으로 밀어 정지시켰다. \(F\)와 수직력 \(N\)을 구하라(\(g=9.81\ \mathrm{m/s^2}\)).</p><details><summary>답</summary><div class="ans">① \(mg=196.2\) N. ② 축: 경사면 방향 \(x\)(위쪽 +), 면에 수직 \(y\)(면 바깥 +). 수평 힘 \(F\)는 경사면과 30° → 경사면 위쪽 성분 \(F\cos30°\), 면을 누르는 쪽 성분 \(F\sin30°\). ③ \(\sum F_x=F\cos30°-196.2\sin30°=0\) → \(F=196.2\tan30°\approx113.3\) N. ④ \(\sum F_y=N-196.2\cos30°-F\sin30°=0\) → \(N=169.91+56.64\approx226.6\) N. 검산(수평·연직 축): 연직 \(N\cos30°=196.2\) → \(N=226.6\) ✓, 수평 \(F=N\sin30°=113.3\) ✓ — 축을 다르게 잡아도 답은 같다.</div></details></div>
  <div class="q"><div class="qn a">응용 2-3 · 움직도르래와 고정 도르래</div><p>그림처럼 줄의 한 끝은 천장에 묶여 있고, 줄은 질량 60 kg 물체가 달린 움직도르래 아래를 감아 올라가 천장의 고정 도르래를 지나 사람의 손으로 내려온다. 모든 줄 가닥은 연직이고, 줄·도르래의 무게와 마찰은 무시한다. (a) 사람이 당기는 힘 (b) 고정 도르래의 지지대가 도르래를 받치는 힘을 구하라(\(g=9.81\ \mathrm{m/s^2}\)).</p>@@F_Q_PULLEY@@<details><summary>답</summary><div class="ans">(a) 움직도르래+물체를 떼어 낸다: 위로 장력 \(T\) 두 가닥, 아래로 \(W=60\times9.81=588.6\) N → \(2T=588.6\) → \(T=294.3\) N. 줄 하나라 어디서나 장력이 같으므로 사람이 당기는 힘도 294.3 N. (b) 고정 도르래만 떼어 낸다: 움직도르래 쪽 가닥과 손 쪽 가닥이 모두 아래로 \(T\) → 지지대는 \(2T=588.6\) N을 위로. 검산(전체를 한 덩어리로): 천장 고정점 \(T\) + 지지대 \(2T\) − 손 \(T\) − \(W\) \(=294.3+588.6-294.3-588.6=0\) ✓.</div></details></div>
</section>
"""

P3 = r"""
<section>
  <h2><span class="no">파트 3 · 9/16</span>2D 입자 평형 ③ 스프링 · 두 점을 잇는 방향의 힘 — 길이로 각을 구한다 <span class="star">★★</span></h2>
  <h3><span class="tag c">개념</span>스프링 힘 F = k|L − L₀| · 세 변이면 코사인 법칙 · 방향 = (끝점 − 시작점) ÷ 길이</h3>
  <div class="why">과제 3.51(줄과 스프링으로 매단 물체의 스프링 상수)과 3.47(링크 두 개와 실린더가 한 점에 거는 힘)이 이 유형이다. 둘 다 각이 주어지지 않고 길이·좌표만 주어진다 — 방향을 스스로 만들어야 한다.</div>
  <div class="concept">
    <p><b>스프링(9/16 판서)</b>: 힘이 없을 때 길이 = 자연 길이 \(L_0\)(unstretched length), 지금 길이 \(L\). 힘의 크기 \(F=k\lvert L-L_0\rvert\), \(k\) = 스프링 상수(spring constant, 단위 N/m). 늘어났으면(\(L\gt L_0\)) 당기고, 줄었으면(\(L\lt L_0\)) 민다 — 원래 길이로 돌아가려는 쪽.</p>
    <p><b>스프링이 줄 대신 매달 때</b>: 스프링도 두 끝을 잇는 방향으로 힘을 준다. 평형식으로 스프링 힘 \(F\)를 먼저 구하고 → \(k=F/\lvert L-L_0\rvert\), 또는 늘어난 경우 \(L_0=L-F/k\).</p>
    <p><b>[고등 수학 연결] 코사인 법칙</b>: 세 변 \(a,b,c\)인 삼각형에서 변 \(a\)의 맞은편 각 \(A\)는 \(a^2=b^2+c^2-2bc\cos A\) → \(\cos A=\dfrac{b^2+c^2-a^2}{2bc}\). 세 변만 알면 세 각을 모두 구한다. 확인: 세 각의 합 = 180°. 직각이면 \(\cos90°=0\)이라 피타고라스 정리가 된다.</p>
    <p><b>[중학 수학 연결] 엇각</b>: 천장(수평)의 점 A에서 잰 삼각형의 각은, 아래 매듭에서 줄이 수평과 이루는 각과 같다 — 평행한 두 수평선을 줄이 가로지르며 만드는 엇각이다.</p>
    <p><b>[2주차 연결] 두 점을 잇는 방향</b>: 점 P에서 점 Q 쪽 단위벡터 \(\vec e_{PQ}=\dfrac{\overrightarrow{PQ}}{\lvert\overrightarrow{PQ}\rvert}\), \(\overrightarrow{PQ}\) = 끝점 Q − 시작점 P. 크기를 모르는 힘은 \(F\,\vec e\)로 두고 \(F\)를 미지수로 푼다.</p>
    <p><b>음수가 나오면</b>: 링크(양 끝이 핀인 막대)는 당길 수도 밀 수도 있다. 방향을 가정하고 풀어 \(F\)가 음수면 가정의 반대 방향이다 — 틀린 게 아니다(과제 3.47). 반면 줄의 장력이 음수면 자유물체도를 잘못 그린 것(줄은 밀 수 없다).</p>
    <p><b>세 힘이 한 점에서 만나면</b>: 물체에 크기가 있어도 모든 힘의 작용선이 한 점을 지나면 그 점에 대한 모멘트가 저절로 0이라, 입자처럼 \(\sum\vec F=0\)만 쓰면 된다(과제 3.47의 실린더 — 세 힘이 모두 C를 지난다).</p>
  </div>
  <div class="one">한 줄: 스프링 \(F=k\lvert L-L_0\rvert\)(늘면 당김·줄면 밂) · 세 변 → 코사인 법칙으로 각 · 두 점 방향 \(\vec e\) = (끝점 − 시작점) ÷ 길이 · 링크 힘이 음수면 반대 방향.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>\(F=k\lvert L-L_0\rvert\), \(k\) [N/m] — spring constant</li><li>자연 길이 = unstretched length</li><li>\(\cos A=\dfrac{b^2+c^2-a^2}{2bc}\)</li><li>\(\vec e_{PQ}\) = (Q − P) ÷ 길이</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>늘어난 스프링은 당기고 줄어든 스프링은 미는 이유</li><li>링크 힘은 음수가 나와도 되고 줄 장력은 안 되는 이유</li><li>세 힘이 한 점을 지나면 입자처럼 풀 수 있는 이유</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 3-1 · 줄어든 스프링</div><p>스프링 상수 800 N/m, 자연 길이 0.30 m인 스프링이 지금 0.24 m로 줄어 있다. 스프링이 끝에 붙은 물체에 주는 힘은?</p><ol class="choices"><li data-ok="1">48 N, 물체를 민다</li><li>48 N, 물체를 당긴다</li><li>192 N, 물체를 민다</li><li>240 N, 물체를 당긴다</li></ol><details><summary>답</summary><div class="ans">\(F=k\lvert L-L_0\rvert=800\times\lvert0.24-0.30\rvert=800\times0.06=48\) N. 줄어 있으니(\(L\lt L_0\)) 원래 길이로 늘어나려고 <b>민다</b>. 3번은 \(k\times L\), 4번은 \(k\times L_0\)로 계산한 것.</div></details></div>
  <div class="q"><div class="qn">기초 3-2 · 코사인 법칙</div><p>세 변의 길이가 5, 7, 8인 삼각형에서 길이 7인 변의 맞은편 각은?</p><ol class="choices"><li data-ok="1">60°</li><li>30°</li><li>45°</li><li>90°</li></ol><details><summary>답</summary><div class="ans">\(\cos A=\dfrac{5^2+8^2-7^2}{2\times5\times8}=\dfrac{25+64-49}{80}=\dfrac{40}{80}=0.5\) → \(A=60°\). 맞은편 변(7)의 제곱을 <b>빼는</b> 자리에 둔다.</div></details></div>
  <div class="q"><div class="qn">기초 3-3 · 두 점을 잇는 단위벡터</div><p>점 P(1, 2) m에서 점 Q(4, 6) m 쪽을 가리키는 단위벡터는?</p><ol class="choices"><li data-ok="1">(0.6, 0.8)</li><li>(−0.6, −0.8)</li><li>(3, 4)</li><li>(0.8, 0.6)</li></ol><details><summary>답</summary><div class="ans">\(\overrightarrow{PQ}=(4-1,\ 6-2)=(3,\ 4)\), 길이 \(\sqrt{9+16}=5\) → \((3/5,\ 4/5)=(0.6,\ 0.8)\). 2번은 Q에서 P 쪽(끝점·시작점을 바꾼 것), 3번은 길이로 나누지 않은 것.</div></details></div>
  <div class="q"><div class="qn">기초 3-4 · 음수로 나온 링크 힘</div><p>링크 AC가 점 C에 주는 힘을 \(F_{AC}\,\vec e_{AC}\)(\(\vec e_{AC}\)는 A에서 C 쪽 단위벡터)로 두고 평형식을 풀었더니 \(F_{AC}=-5\) kN이 나왔다. 옳은 해석은?</p><ol class="choices"><li data-ok="1">크기 5 kN, C에서 A 쪽으로 작용한다</li><li>계산이 틀렸으니 다시 풀어야 한다</li><li>크기가 −5 kN인 힘이다</li><li>링크 AC에는 힘이 없다</li></ol><details><summary>답</summary><div class="ans">링크는 밀 수도 당길 수도 있다. 가정한 방향(A→C)의 반대라는 뜻 → 크기 5 kN, 방향은 C→A(C를 A 쪽으로 당긴다). 힘의 크기는 음수가 될 수 없다.</div></details></div>
  <div class="q"><div class="qn">기초 3-5 · 자연 길이 구하기</div><p>무게 150 N인 물체를 스프링(스프링 상수 3000 N/m) 하나로 연직으로 매달았더니 스프링 길이가 0.35 m가 되어 정지했다. 스프링의 자연 길이는?</p><ol class="choices"><li data-ok="1">0.30 m</li><li>0.40 m</li><li>0.35 m</li><li>0.05 m</li></ol><details><summary>답</summary><div class="ans">평형: 스프링 힘 = 무게 = 150 N. 늘어난 길이 \(=F/k=150/3000=0.05\) m. 매달려 늘어났으므로 \(L_0=L-0.05=0.35-0.05=0.30\) m. 2번은 더한 것, 4번은 늘어난 길이만.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 3-1 · 줄과 스프링으로 매단 물체</div><p>그림처럼 천장의 두 점 A, C(사이 0.8 m)에 줄 AB(0.6 m)와 스프링 CB를 걸고 매듭 B에 질량 30 kg인 물체를 매달았더니 스프링 길이가 0.5 m가 되어 정지했다. 스프링의 자연 길이가 0.4 m일 때 스프링 상수 \(k\)를 구하라(\(g=9.81\ \mathrm{m/s^2}\)).</p>@@F_Q_SPRING@@<details><summary>답</summary><div class="ans">① 각(코사인 법칙): A에서 \(\cos\alpha=\dfrac{0.6^2+0.8^2-0.5^2}{2(0.6)(0.8)}=\dfrac{0.75}{0.96}=0.78125\) → \(\alpha\approx38.6°\). C에서 \(\cos\gamma=\dfrac{0.5^2+0.8^2-0.6^2}{2(0.5)(0.8)}=\dfrac{0.53}{0.8}=0.6625\) → \(\gamma\approx48.5°\). 엇각이라 B에서 줄 BA는 수평과 \(\alpha\), 스프링 BC는 수평과 \(\gamma\). ② B의 자유물체도: 줄 장력 \(T\)는 B→A(왼쪽 위), 스프링 힘 \(F\)는 B→C(오른쪽 위) — 늘어나 있으니 당긴다. 무게 \(W=30\times9.81=294.3\) N. ③ \(\sum F_x=-T\cos\alpha+F\cos\gamma=0\) → \(T=\dfrac{0.6625}{0.78125}F=0.848F\). ④ \(\sum F_y=T\sin\alpha+F\sin\gamma-294.3=0\), \(\sin\alpha=0.6242\), \(\sin\gamma=0.7491\) → \((0.848\times0.6242+0.7491)F=1.2784F=294.3\) → \(F\approx230.2\) N, \(T\approx195.2\) N. ⑤ \(k=\dfrac{F}{L-L_0}=\dfrac{230.2}{0.5-0.4}\approx2302\) N/m \(\approx2.30\) kN/m.</div></details></div>
  <div class="q"><div class="qn a">응용 3-2 · 한 점에 모인 세 힘</div><p>그림처럼 점 C(0, 0.6) m에 세 힘이 작용해 평형이다: ① 실린더가 주는 크기 6 kN의 힘(점 B(0.8, 0) m에서 C 쪽 방향) ② 링크 AC가 주는 힘(직선 A–C와 평행, A(0, 0)) ③ 링크 CD가 주는 힘(직선 C–D와 평행, D(1.2, 1.1) m). ②와 ③의 크기와 방향을 구하라.</p>@@F_Q_LINK@@<details><summary>답</summary><div class="ans">① 실린더 힘: \(\overrightarrow{BC}=(0-0.8,\ 0.6-0)=(-0.8,\ 0.6)\), 길이 1.0 → \(\vec F_B=6(-0.8,\ 0.6)=(-4.8,\ 3.6)\) kN. ② 단위벡터: \(\vec e_{AC}=(0,\ 0.6)/0.6=(0,\ 1)\), \(\overrightarrow{CD}=(1.2,\ 0.5)\), 길이 \(\sqrt{1.44+0.25}=1.3\) → \(\vec e_{CD}=(0.9231,\ 0.3846)\). ③ 모르는 힘을 \(F_{AC}\vec e_{AC}\), \(F_{CD}\vec e_{CD}\)로 두면 \(\sum F_x=-4.8+0.9231F_{CD}=0\) → \(F_{CD}=5.2\) kN. \(\sum F_y=3.6+F_{AC}+0.3846\times5.2=0\) → \(F_{AC}=-5.6\) kN. ④ 해석: 링크 CD는 5.2 kN으로 C를 D 쪽으로 당기고, 링크 AC는 음수라 가정(A→C)의 반대 — 5.6 kN으로 C를 A 쪽(아래)으로 당긴다. 검산: \(x\) \(-4.8+4.8=0\) ✓, \(y\) \(3.6-5.6+2.0=0\) ✓.</div></details></div>
</section>
"""

P4 = r"""
<section>
  <h2><span class="no">파트 4 · 9/21</span>3D 입자 평형 — 좌표 → 위치벡터 → 단위벡터 → 세 식 <span class="star">★★</span></h2>
  <h3><span class="tag c">개념</span>줄마다 T e 로 쓰고 x·y·z 성분별로 합 = 0</h3>
  <div class="why">과제 3.63·3.69(세 줄로 매단 물체)가 이 유형이다. 2D와 방법은 같고, 각 대신 좌표로 방향을 만든다는 것만 다르다. 식이 세 개라 모르는 장력 세 개까지 풀린다.</div>
  <div class="concept">
    <p><b>3D 평형(9/21 판서)</b>: \(\sum\vec F=(\sum F_x)\vec i+(\sum F_y)\vec j+(\sum F_z)\vec k=0\) → \(\sum F_x=0,\ \sum F_y=0,\ \sum F_z=0\) 세 식.</p>
    <p><b>줄의 힘 만들기 5단계</b> ① 좌표 읽기: 매듭 A, 줄 끝 B·C·D ② 위치벡터 \(\vec r_{AB}\) = 끝점 B − 시작점 A(매듭에서 줄 끝 쪽 — 장력이 매듭을 그쪽으로 당기니까) ③ 길이 \(\lvert\vec r_{AB}\rvert=\sqrt{r_x^2+r_y^2+r_z^2}\) ④ 단위벡터 \(\vec e_{AB}=\vec r_{AB}/\lvert\vec r_{AB}\rvert\) ⑤ 장력 벡터 \(T_{AB}\,\vec e_{AB}\).</p>
    @@F_3D@@
    <p><b>무게</b>: 연직 아래. 과제 3.63·3.69처럼 \(y\)축이 연직 위인 그림이면 \(\vec W=-mg\,\vec j\), \(z\)축이 위면 \(-mg\,\vec k\) — 축 방향을 그림에서 먼저 확인한다.</p>
    <p><b>세 식</b>: \(T_{AB}\vec e_{AB}+T_{AC}\vec e_{AC}+T_{AD}\vec e_{AD}+\vec W=0\)을 성분별로 — \(x\)성분끼리, \(y\)성분끼리, \(z\)성분끼리 더해 0.</p>
    <p><b>푸는 요령</b>: 성분에 0이 있어 미지수가 두 개뿐인 식부터 푼다 → 한 장력을 다른 장력으로 나타내 → 나머지 식에 대입([중학 수학 연결] 대입법). 미지수 셋인 연립방정식도 이렇게 하나씩 줄이면 된다.</p>
    <p><b>검산</b>: 구한 장력을 세 식에 다시 넣어 모두 0인지. 장력이 음수면 좌표를 잘못 읽었거나 (시작점 − 끝점)으로 뒤집은 것이다 — 줄은 밀 수 없다.</p>
  </div>
  <div class="one">한 줄: \(\vec r\) = 끝점 − 매듭 → \(\vec e=\vec r/\lvert\vec r\rvert\) → \(T\vec e\) → \(x\)·\(y\)·\(z\) 합 = 0 세 식 → 0이 있는 식부터 대입 → 다시 넣어 검산.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>\(\sum F_x=\sum F_y=\sum F_z=0\) — 미지수 최대 3개</li><li>\(\vec e_{AB}=\vec r_{AB}/\lvert\vec r_{AB}\rvert\) — unit vector</li><li>위치벡터(position vector) = 끝점 − 시작점</li><li>\(y\)가 연직 위면 \(\vec W=-mg\,\vec j\)</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>위치벡터를 매듭에서 줄 끝 쪽으로 잡는 이유</li><li>0 성분이 있는 식부터 풀면 빨라지는 이유</li><li>장력이 음수면 어디가 틀렸는지</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 4-1 · 좌표로 단위벡터</div><p>매듭 A(0, −2, 0) m에서 줄 끝 B(2, 0, 1) m로 뻗은 줄의 단위벡터 \(\vec e_{AB}\)는?</p><ol class="choices"><li data-ok="1">\((\tfrac23,\ \tfrac23,\ \tfrac13)\)</li><li>\((-\tfrac23,\ -\tfrac23,\ -\tfrac13)\)</li><li>\((2,\ 2,\ 1)\)</li><li>\((\tfrac25,\ \tfrac25,\ \tfrac15)\)</li></ol><details><summary>답</summary><div class="ans">\(\vec r_{AB}\) = B − A = \((2-0,\ 0-(-2),\ 1-0)=(2,\ 2,\ 1)\), 길이 \(\sqrt{4+4+1}=3\) → \((\tfrac23,\ \tfrac23,\ \tfrac13)\). 2번은 A − B(방향 반대), 4번은 성분을 제곱하지 않고 더해(2+2+1=5) 나눈 것.</div></details></div>
  <div class="q"><div class="qn">기초 4-2 · 장력 벡터</div><p>장력의 크기가 150 N이고 단위벡터가 \((\tfrac23,\ \tfrac23,\ \tfrac13)\)인 줄이 매듭에 주는 힘은?</p><ol class="choices"><li data-ok="1">(100, 100, 50) N</li><li>(50, 50, 100) N</li><li>(225, 225, 450) N</li><li>(150, 150, 150) N</li></ol><details><summary>답</summary><div class="ans">\(150\times(\tfrac23,\ \tfrac23,\ \tfrac13)=(100,\ 100,\ 50)\) N. 검산: \(\sqrt{100^2+100^2+50^2}=\sqrt{22500}=150\) ✓. 3번은 곱하지 않고 나눈 것.</div></details></div>
  <div class="q"><div class="qn">기초 4-3 · 식의 개수</div><p>3차원에서 한 점(입자)의 평형 방정식만으로 구할 수 있는 모르는 값은 최대 몇 개인가?</p><ol class="choices"><li data-ok="1">3개</li><li>2개</li><li>6개</li><li>1개</li></ol><details><summary>답</summary><div class="ans">\(\sum F_x=0,\ \sum F_y=0,\ \sum F_z=0\) 세 식 → 3개. 2개는 2D 입자, 6개는 Ch.5 3D 강체(힘 세 식 + 모멘트 세 식).</div></details></div>
  <div class="q"><div class="qn">기초 4-4 · 무게 벡터</div><p>\(y\)축이 연직 위쪽인 좌표계에서 질량 20 kg인 물체의 무게 벡터는? (\(g=9.81\ \mathrm{m/s^2}\))</p><ol class="choices"><li data-ok="1">\(-196.2\,\vec j\) N</li><li>\(-196.2\,\vec k\) N</li><li>\(196.2\,\vec j\) N</li><li>\(-20\,\vec j\) N</li></ol><details><summary>답</summary><div class="ans">크기 \(mg=20\times9.81=196.2\) N, 방향은 연직 아래 = \(-y\) → \(-196.2\,\vec j\) N. 2번은 \(z\)가 위인 좌표계일 때의 답, 4번은 질량을 그대로 쓴 것.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 4-1 · 세 줄에 매단 물체</div><p>질량 100 kg인 물체가 매듭 A(0, −6, 0) m에 매달려 있고, 매듭에서 세 줄이 천장의 점 B(8, 0, 0) m, C(−3, 0, 2) m, D(−2, 0, −3) m로 뻗어 있다. \(y\)축이 연직 위일 때 세 줄의 장력을 구하라(\(g=9.81\ \mathrm{m/s^2}\)).</p><details><summary>답</summary><div class="ans">① 위치벡터(끝점 − A): \(\vec r_{AB}=(8,\ 6,\ 0)\), 길이 10 / \(\vec r_{AC}=(-3,\ 6,\ 2)\), 길이 \(\sqrt{9+36+4}=7\) / \(\vec r_{AD}=(-2,\ 6,\ -3)\), 길이 7. ② 단위벡터 \(\vec e_{AB}=(0.8,\ 0.6,\ 0)\), \(\vec e_{AC}=(-\tfrac37,\ \tfrac67,\ \tfrac27)\), \(\vec e_{AD}=(-\tfrac27,\ \tfrac67,\ -\tfrac37)\). ③ 세 식(\(W=981\) N): \(x\): \(0.8T_{AB}-\tfrac37T_{AC}-\tfrac27T_{AD}=0\) / \(y\): \(0.6T_{AB}+\tfrac67T_{AC}+\tfrac67T_{AD}=981\) / \(z\): \(\tfrac27T_{AC}-\tfrac37T_{AD}=0\). ④ \(z\)식(미지수 둘)부터: \(T_{AC}=1.5T_{AD}\). \(x\)식에 넣으면 \(0.8T_{AB}=\tfrac{4.5+2}{7}T_{AD}\) → \(T_{AB}=1.1607T_{AD}\). ⑤ \(y\)식: \((0.6\times1.1607+\tfrac67\times2.5)T_{AD}=2.8393T_{AD}=981\) → \(T_{AD}\approx345.5\) N, \(T_{AC}\approx518.3\) N, \(T_{AB}\approx401.0\) N. 검산 \(x\): \(320.8-222.1-98.7=0\) ✓.</div></details></div>
  <div class="q"><div class="qn a">응용 4-2 · 기둥 세 개에 건 줄</div><p>높이 3 m인 수직 기둥 세 개의 꼭대기 B(−1, 3, 2) m, C(2, 3, −1) m, D(−2, 3, −1) m에 줄을 걸어 매듭 A(0, 1, 0) m에 질량 40 kg인 물체를 매달았다(\(y\)축이 연직 위). 세 줄의 장력을 구하라(\(g=9.81\ \mathrm{m/s^2}\)).</p><details><summary>답</summary><div class="ans">① \(\vec r_{AB}=(-1,\ 2,\ 2)\), \(\vec r_{AC}=(2,\ 2,\ -1)\), \(\vec r_{AD}=(-2,\ 2,\ -1)\) — 길이가 모두 \(\sqrt9=3\). ② \(W=40\times9.81=392.4\) N. 세 식에 3을 곱해 분모를 없애면 \(x\): \(-T_{AB}+2T_{AC}-2T_{AD}=0\) / \(y\): \(2(T_{AB}+T_{AC}+T_{AD})=3\times392.4\) / \(z\): \(2T_{AB}-T_{AC}-T_{AD}=0\). ③ \(z\)식 → \(T_{AC}+T_{AD}=2T_{AB}\) → \(y\)식에 넣으면 \(2(3T_{AB})=1177.2\) → \(T_{AB}=196.2\) N. ④ \(T_{AC}+T_{AD}=392.4\), \(x\)식 → \(T_{AC}-T_{AD}=T_{AB}/2=98.1\) → \(T_{AC}=245.25\) N, \(T_{AD}=147.15\) N. 검산 \(z\): \(392.4-245.25-147.15=0\) ✓.</div></details></div>
</section>
"""

TAIL = "\n</body>\n</html>\n"

def build():
    body = HEAD + P1 + P2 + P3 + P4 + TAIL
    rep = {"@@F_KNOT@@": F_KNOT, "@@F_Q_RT@@": F_Q_RT, "@@F_INCLINE@@": F_INCLINE, "@@F_PULLEY@@": F_PULLEY, "@@F_Q_PULLEY@@": F_Q_PULLEY,
           "@@F_Q_SPRING@@": F_Q_SPRING, "@@F_Q_LINK@@": F_Q_LINK, "@@F_3D@@": F_3D}
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
