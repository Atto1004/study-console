# -*- coding: utf-8 -*-
"""일반물리학2 · 중간고사 대비 26·27장 (교재 선행) — 정리노트 v2 생성기
대표님 2026-09-30 「학습앱 물리 26장 27장 우선 교재에 있는 개념으로 우선적으로 시험범위 내용 정리」.
근거(§24 교수 자료 우선): 교수 강의노트 63p Part-06(p.22~23)·Part-07(p.24~27)·전기 기초문제(p.29~32 의 26·27장 문항)
  → 순서·표기(전류 i, 전류밀도 J, 유동속도 v_d, 수밀도 n, 비저항 ρ, 전기전도율 σ, 완화시간 τ, 기전력 ε, 전압법칙·전류법칙)
  + 교재 요약 슬라이드(교재_일반물리학2_9MB.pdf p.135~186: 26.1~26.5 · 27.1~27.4) → 개념·용어·보기 유형.
문제는 교수 필수·기초문제와 교재 보기·확인문제 유형을 숫자만 바꿔 새로 만들고 전부 검산(phys2_ahead_check.py). 공개 저장소라 원문을 옮기지 않는다.
출력: study-materials/일반물리학2/_정리노트/2026-09-30_일반물리학2_중간대비_26-27장_교재선행.html → build_slides.py → 덱 phys2-mid2"""
import io, os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from figs import *

OUT = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\일반물리학2\_정리노트\2026-09-30_일반물리학2_중간대비_26-27장_교재선행.html"
FIGS = []   # 만든 그림 이름 — 그림 수 대조(오타 1차 RED 6)

def fig(w, h, *parts, cap="", name=""):
    FIGS.append(name)
    s = canvas(w, h, *parts, cap=cap, name=name)
    # 덱·폰에서 줄어들게(고정 폭 그대로면 좁은 화면에서 넘친다)
    s = s.replace('<svg class="fig-svg"', '<svg class="fig-svg" style="max-width:100%;height:auto"', 1)
    return s.replace("<figcaption>", '<figcaption style="font-size:.86em;opacity:.85;margin-top:4px">', 1)

def ellipse(cx, cy, rx, ry, color=INK, w=2, fill="none", dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{color}" stroke-width="{w}"{d}/>'

def elec(x, y, arrow_len=20, lab=""):
    """자유전자(파란 −) + 왼쪽으로 가는 유동속도 화살표"""
    return charge(x, y, "−", r=9) + arrow(x - 11, y, x - 11 - arrow_len, y, BLUE, lab, 1.8, 0, -7)

# ================= 그림 =================
F_WIRE = fig(560, 196,
    line(70, 60, 490, 60, INK, 2), line(70, 124, 490, 124, INK, 2),
    ellipse(70, 92, 12, 32, INK, 2, "#F1F3F5"), ellipse(490, 92, 12, 32, INK, 2),
    ellipse(250, 92, 12, 32, PINK, 2, "rgba(255,77,141,.16)"), ellipse(370, 92, 12, 32, PINK, 1.5, "none", "5 4"),
    text(250, 48, "단면 (넓이 A)", 13, PINK, "middle"),
    elec(288, 78, 16), elec(318, 106, 16), elec(344, 80, 16), text(482, 48, "← 전자의 유동속도 v_d", 12, BLUE, "end"),
    elec(140, 104, 16), elec(196, 80, 16), elec(440, 104, 16),
    brace_label(250, 370, 146, "v_d dt"),
    current(40, 178, 120, 178, "", RED), text(128, 183, "전류 i (전자와 반대)", 13, RED),
    cap="시간 \\(dt\\) 동안 단면 A를 지나는 전자는 길이 \\(v_d\\,dt\\) 원기둥 안에 있던 전자: \\(dN=nAv_d\\,dt\\).", name="wire")

F_ROD = fig(560, 170,
    line(120, 50, 440, 50, INK, 2), line(120, 104, 440, 104, INK, 2),
    ellipse(120, 77, 11, 27, INK, 2, "rgba(255,77,141,.14)"), ellipse(440, 77, 11, 27, INK, 2),
    text(120, 36, "넓이 A", 13, INK, "middle"),
    arrow(200, 77, 360, 77, GREEN, "E", 2.2, 0, -7),
    current(30, 77, 100, 77, "i", RED), current(460, 77, 530, 77, "i", RED),
    brace_label(120, 440, 128, "길이 L"),
    text(120, 162, "전위 높음 (a)", 12, GRAY, "middle"), text(440, 162, "전위 낮음 (b)", 12, GRAY, "middle"),
    cap="균일한 도선: \\(V_a-V_b=EL\\), \\(E=\\rho J\\), \\(J=i/A\\) → \\(R=\\rho L/A\\).", name="rod")

def _vi_panels():
    s = ""
    # 왼쪽: 옴성 — 원점 지나는 직선
    s += arrow(40, 100, 250, 100, INK, "", 1.5) + arrow(145, 172, 145, 22, INK, "", 1.5)
    s += text(246, 118, "V", 13, INK, "end") + text(136, 30, "i", 13, INK, "end")
    s += polyline([(75, 158), (215, 42)], BLUE, 2.4)
    s += text(145, 190, "옴성 (저항기): 직선", 13, BLUE, "middle")
    # 오른쪽: 비옴성(다이오드) — 한쪽으로만
    s += arrow(320, 100, 530, 100, INK, "", 1.5) + arrow(425, 172, 425, 22, INK, "", 1.5)
    s += text(526, 118, "V", 13, INK, "end") + text(416, 30, "i", 13, INK, "end")
    pts = [(330, 100), (425, 100)]
    for k in range(1, 21):
        v = k / 20
        pts.append((425 + 60 * v, 100 - 0.9 * (math.exp(4.2 * v) - 1)))
    s += polyline([(x, max(y, 30)) for x, y in pts], RED, 2.4)
    s += text(425, 190, "비옴성 (다이오드): 곡선", 13, RED, "middle")
    return s
F_VI = fig(560, 200, _vi_panels(), cap="옴의 법칙을 따르는 소자는 \\(V\\)–\\(i\\) 그래프가 원점을 지나는 직선(기울기 일정 → \\(R\\) 일정).", name="vi")

# 27장 — 단일 고리(내부저항)
F_LOOP = fig(520, 226,
    wire((110, 60), (110, 84)), resistor(110, 84, 110, 124, "r", lpos="l"),
    battery(110, 124, 110, 164, "ε", plus=1, lpos="l"), wire((110, 164), (110, 190), (410, 190), (410, 60), (320, 60)),
    resistor(320, 60, 200, 60, "R"), wire((200, 60), (110, 60)),
    rect(60, 74, 88, 100, GRAY, dash="5 4", sw=1.2, rx=6), text(104, 212, "실제 전지 = ε + r", 12, GRAY, "middle"),
    current(150, 60, 185, 60, "i"), loop_dir(260, 125, 22, True),
    text(262, 166, "고리 방향", 12, GREEN, "middle"),
    cap="시계 방향으로 한 바퀴: \\(+\\varepsilon-ir-iR=0\\) → \\(i=\\dfrac{\\varepsilon}{R+r}\\).", name="loop")

def _sign_panels():
    s = text(280, 20, "초록 화살표 = 고리를 도는 방향", 13, GREEN, "middle")
    res = [("+ε", "−극 → +극"), ("−ε", "+극 → −극"), ("−iR", "전류와 같은 방향"), ("+iR", "전류와 반대 방향")]
    for k, (val, note) in enumerate(res):
        cx = 70 + 140 * k
        if k == 0: s += battery(cx - 50, 70, cx + 50, 70, "", plus=2)
        elif k == 1: s += battery(cx - 50, 70, cx + 50, 70, "", plus=1)
        else:
            s += resistor(cx - 50, 70, cx + 50, 70, "")
            s += current(cx - 22, 46, cx + 22, 46, "", RED) if k == 2 else current(cx + 22, 46, cx - 22, 46, "", RED)
            s += text(cx + 30, 40, "i", 13, RED)
        s += arrow(cx - 40, 104, cx + 40, 104, GREEN, "", 2)
        s += text(cx, 136, val, 17, INK, "middle", True) + text(cx, 158, note, 12, GRAY, "middle")
        if k: s += line(cx - 70, 34, cx - 70, 166, "#DDE3EA", 1)
    return s
F_SIGN = fig(560, 172, _sign_panels(), cap="교수님 표기 \\(V=V_f-V_i\\): 지나간 뒤 전위 − 지나가기 전 전위. 한 바퀴 더하면 0(전압법칙).", name="sign")

def _series_parallel():
    s = ""
    s += terminal(30, 96) + wire((34, 96), (50, 96)) + resistor(50, 96, 110, 96, "R_1") + resistor(110, 96, 170, 96, "R_2") + resistor(170, 96, 230, 96, "R_3") + wire((230, 96), (246, 96)) + terminal(250, 96)
    s += text(140, 142, "직렬 — 전류가 같다", 13, INK, "middle", True) + text(140, 164, "R_eq = R_1 + R_2 + R_3", 13, BLUE, "middle")
    for y, lab in ((52, "R_1"), (96, "R_2"), (140, "R_3")):
        s += wire((340, y), (370, y)) + resistor(370, y, 450, y, lab) + wire((450, y), (480, y))
    s += wire((340, 52), (340, 140)) + wire((480, 52), (480, 140))
    s += terminal(304, 96) + wire((308, 96), (340, 96)) + wire((480, 96), (512, 96)) + terminal(516, 96)
    s += junction(340, 96) + junction(480, 96)
    s += text(410, 178, "병렬 — 전위차가 같다", 13, INK, "middle", True) + text(410, 198, "1/R_eq = 1/R_1 + 1/R_2 + 1/R_3", 13, BLUE, "middle")
    return s
F_SP = fig(560, 208, _series_parallel(), cap="직렬은 같은 전류가 차례로, 병렬은 같은 전위차 아래 전류가 나뉜다.", name="sp")

def two_loop(e1, e2, r1, r2, r3, name, cap):
    """세 갈래 회로: 왼쪽 ε1·R1, 가운데 R3, 오른쪽 ε2·R2. a(위 접합점)·b(아래 접합점)"""
    s = ""
    s += wire((110, 56), (110, 128)) + battery(110, 128, 110, 168, e1, plus=1) + wire((110, 168), (110, 206))
    s += wire((110, 56), (150, 56)) + resistor(150, 56, 240, 56, r1) + wire((240, 56), (280, 56))
    s += wire((280, 56), (320, 56)) + resistor(320, 56, 410, 56, r2) + wire((410, 56), (450, 56))
    s += wire((450, 56), (450, 128)) + battery(450, 128, 450, 168, e2, plus=1, lpos="r") + wire((450, 168), (450, 206))
    s += wire((110, 206), (450, 206))
    s += wire((280, 56), (280, 86)) + resistor(280, 86, 280, 176, r3) + wire((280, 176), (280, 206))
    s += junction(280, 56, "a", lpos="tr") + junction(280, 206, "b", lpos="br")
    s += current(110, 112, 110, 76, "i_1", lpos="r") + current(450, 112, 450, 76, "i_2", lpos="l") + current(280, 180, 280, 202, "i_3", lpos="l")
    s += loop_dir(195, 172, 18, True) + loop_dir(365, 172, 18, False)
    return fig(560, 232, s, cap=cap, name=name)

F_TWO = two_loop("ε_1 = 10 V", "ε_2 = 5 V", "R_1 = 2 Ω", "R_2 = 2 Ω", "R_3 = 4 Ω", "twoloop",
                 "예제 회로. 전류 방향은 일단 정해 두고(빨강), 왼쪽 고리는 시계·오른쪽 고리는 반시계로 돈다(초록).")

def _rc():
    s = ""
    s += wire((70, 186), (70, 150)) + battery(70, 150, 70, 110, "ε", plus=2) + wire((70, 110), (70, 56), (150, 56))
    s += terminal(154, 56, "a", lpos="t")
    s += terminal(154, 116, "b", lpos="l") + wire((154, 120), (154, 186))
    s += junction(154, 186)
    s += f'<circle cx="214" cy="86" r="4" fill="{INK}"/>' + line(214, 86, 158, 58, INK, 2.4) + text(222, 76, "S", 13, INK, "start", True)
    s += wire((214, 86), (250, 86)) + resistor(250, 86, 340, 86, "R") + wire((340, 86), (420, 86), (420, 110))
    s += capacitor(420, 110, 420, 160, "C") + wire((420, 160), (420, 186), (70, 186))
    return s
F_RC = fig(520, 206, _rc(), cap="S를 a에 두면 전지가 축전기를 충전, b로 옮기면 전지 없이 축전기가 R을 통해 방전한다.", name="rc")

def _rc_graphs():
    s = ""
    X0, Y0, W, H, T = 60, 160, 200, 118, 42
    s += arrow(X0, Y0, X0 + W + 10, Y0, INK, "", 1.5) + arrow(X0, Y0, X0, Y0 - H - 22, INK, "", 1.5)
    s += text(X0 + W + 8, Y0 + 18, "t", 13, INK, "end") + text(X0 - 8, Y0 - H - 12, "q", 13, INK, "end")
    s += line(X0, Y0 - H, X0 + W, Y0 - H, GRAY, 1.2, "5 4") + text(X0 + W, Y0 - H - 8, "Cε", 13, GRAY, "end")
    s += fplot(lambda t: 1 - math.exp(-t / T), 0, W, lambda t: X0 + t, lambda y: Y0 - H * y, 60, BLUE)
    yq = Y0 - H * (1 - math.exp(-1))
    s += line(X0 + T, Y0, X0 + T, yq, GRAY, 1.2, "4 3") + dot(X0 + T, yq) + text(X0 + T + 8, yq + 16, "63%", 12, BLUE)
    s += text(X0 + T, Y0 + 18, "τ", 13, INK, "middle")
    s += text(X0 + W / 2, 196, "충전: 전하 q(t)", 13, BLUE, "middle")
    X1 = 330
    s += arrow(X1, Y0, X1 + W + 10, Y0, INK, "", 1.5) + arrow(X1, Y0, X1, Y0 - H - 22, INK, "", 1.5)
    s += text(X1 + W + 8, Y0 + 18, "t", 13, INK, "end") + text(X1 - 8, Y0 - H - 12, "i", 13, INK, "end")
    s += text(X1 - 8, Y0 - H + 5, "ε/R", 13, RED, "end")
    s += fplot(lambda t: math.exp(-t / T), 0, W, lambda t: X1 + t, lambda y: Y0 - H * y, 60, RED)
    yi = Y0 - H * math.exp(-1)
    s += line(X1 + T, Y0, X1 + T, yi, GRAY, 1.2, "4 3") + dot(X1 + T, yi) + text(X1 + T + 8, yi - 8, "37%", 12, RED)
    s += text(X1 + T, Y0 + 18, "τ", 13, INK, "middle")
    s += text(X1 + W / 2, 196, "충전: 전류 i(t)", 13, RED, "middle")
    return s
F_RCG = fig(560, 206, _rc_graphs(), cap="\\(t=\\tau=RC\\)에서 전하는 최종값의 63%, 전류는 처음의 37%.", name="rcgraph")

# ---- 문제 그림 ----
def _q_twobat():
    s = ""
    s += wire((130, 56), (130, 66)) + battery(130, 106, 130, 66, "ε_1 = 6.0 V", plus=2) + wire((130, 106), (130, 116))
    s += resistor(130, 116, 130, 166, "r_1 = 1.0 Ω", lpos="l") + wire((130, 166), (130, 190), (410, 190), (410, 166))
    s += resistor(410, 166, 410, 116, "r_2 = 1.0 Ω", lpos="r") + wire((410, 116), (410, 106))
    s += battery(410, 106, 410, 66, "ε_2 = 2.0 V", plus=2, lpos="r") + wire((410, 66), (410, 56), (320, 56))
    s += resistor(320, 56, 220, 56, "R = 6.0 Ω") + wire((220, 56), (130, 56))
    return s
F_Q_TWOBAT = fig(540, 206, _q_twobat(), name="q-twobat")

def _q_open():
    s = ""
    s += wire((90, 186), (90, 150)) + battery(90, 150, 90, 110, "ε = 9.0 V", plus=2) + wire((90, 110), (90, 50), (130, 50))
    s += resistor(130, 50, 220, 50, "R_1 = 1.0 Ω") + wire((220, 50), (280, 50), (280, 80))
    s += resistor(280, 80, 280, 156, "R_2 = 2.0 Ω", lpos="l") + wire((280, 156), (280, 186), (90, 186))
    s += junction(280, 50, "P", lpos="tl") + junction(280, 186, "Q", lpos="bl")
    s += wire((280, 50), (330, 50)) + battery(330, 50, 380, 50, "ε' = 2.0 V", plus=2) + wire((380, 50), (456, 50)) + terminal(460, 50, "a")
    s += wire((280, 186), (330, 186)) + resistor(330, 186, 410, 186, "R_3 = 5.0 Ω", lpos="b") + wire((410, 186), (456, 186)) + terminal(460, 186, "b")
    return s
F_Q_OPEN = fig(520, 222, _q_open(), name="q-open")

F_Q_TWO = two_loop("ε_1 = 9.0 V", "ε_2 = 3.0 V", "R_1 = 1.0 Ω", "R_2 = 1.0 Ω", "R_3 = 2.0 Ω", "q-twoloop", "")

def _q_bulbs():
    s = ""
    s += wire((70, 160), (70, 124)) + battery(70, 124, 70, 84, "100 V", plus=2) + wire((70, 84), (70, 50), (110, 50))
    s += bulb(110, 50, 180, 50, "전구 1") + wire((180, 50), (230, 50))
    s += junction(230, 50) + wire((230, 50), (270, 50)) + bulb(270, 50, 340, 50, "전구 2") + wire((340, 50), (380, 50))
    s += wire((230, 50), (230, 110), (270, 110)) + bulb(270, 110, 340, 110, "전구 3", lpos="b") + wire((340, 110), (380, 110), (380, 50))
    s += junction(380, 50) + wire((380, 50), (420, 50), (420, 160), (70, 160))
    return s
F_Q_BULBS = fig(470, 176, _q_bulbs(), name="q-bulbs")

def _q_sp():
    s = ""
    s += wire((70, 170), (70, 130)) + battery(70, 130, 70, 90, "18 V", plus=2) + wire((70, 90), (70, 50), (100, 50))
    s += resistor(100, 50, 190, 50, "2.0 Ω") + wire((190, 50), (250, 50))
    s += junction(250, 50) + wire((250, 50), (250, 76)) + resistor(250, 76, 250, 146, "3.0 Ω") + wire((250, 146), (250, 170))
    s += wire((250, 50), (360, 50), (360, 76)) + resistor(360, 76, 360, 146, "6.0 Ω") + wire((360, 146), (360, 170))
    s += wire((360, 170), (70, 170)) + junction(250, 170)
    return s
F_Q_SP = fig(450, 186, _q_sp(), name="q-sp")

def _q_rcsw():
    s = ""
    s += wire((84, 186), (84, 140)) + battery(84, 140, 84, 100, "ε = 12 V", plus=2) + wire((84, 100), (84, 50), (114, 50))
    s += resistor(114, 50, 184, 50, "R_1 = 2 Ω") + wire((184, 50), (200, 50)) + switch(200, 50, 254, 50, closed=True, label="S") + wire((254, 50), (294, 50))
    s += junction(294, 50, "P", lpos="tr") + wire((294, 50), (294, 76)) + resistor(294, 76, 294, 150, "R_2 = 4 Ω", lpos="l") + wire((294, 150), (294, 186))
    s += wire((294, 50), (414, 50), (414, 66)) + resistor(414, 66, 414, 116, "R_3 = 2 Ω") + wire((414, 116), (414, 130))
    s += capacitor(414, 130, 414, 166, "C = 1.0 F") + wire((414, 166), (414, 186), (84, 186)) + junction(294, 186)
    return s
F_Q_RCSW = fig(534, 204, _q_rcsw(), name="q-rcsw")

# ================= 본문 =================
HEAD = r"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>일반물리학2 · 중간고사 대비 26 전류와 저항 · 27 회로 (교재 선행)</title>
<!-- 정리노트 v2 (파트 → 개념 / 암기·이해 / 기초 / 응용). 생성기 docs/tools/exam_gap/phys2_ahead.py → build_slides.py 로 덱 phys2-mid2.
     수업 전(26·27장 아직 안 나감, 2026-09-30) 교재 선행 정리. 근거: 교수 강의노트 63p Part-06·07·기초문제 + 교재 요약 26.1~26.5·27.1~27.4.
     수업이 나가면 판서·녹음이 뼈대가 된다(지침 §24) — 그때 회차 정리로 따로 들어온다. -->
<style>body{font-family:Pretendard,"Malgun Gothic",sans-serif;max-width:900px;margin:24px auto;padding:0 16px;line-height:1.6}section{border-top:2px solid #333;padding-top:12px;margin-top:28px}h2 .no{display:inline-block;background:#1f2a44;color:#fff;font-size:13px;padding:2px 8px;border-radius:6px;margin-right:8px}h3 .tag{display:inline-block;font-size:12px;padding:1px 7px;border-radius:5px;margin-right:6px;background:#eee}.tag.c{background:#dbe7ff}.tag.b{background:#dff5e1}.tag.a{background:#ffe6cc}.why{background:#f6f6f6;padding:10px 12px;border-radius:8px}.one{border-left:4px solid #1f2a44;padding:6px 10px;margin:8px 0;background:#fafafa}.q{border:1px solid #ddd;border-radius:8px;padding:10px 12px;margin:10px 0}.qn{font-weight:700;color:#1f2a44}.choices li[data-ok]{font-weight:700}.mu{display:grid;grid-template-columns:1fr 1fr;gap:10px}.mu-mem{background:#fff8d6;padding:8px 10px;border-radius:8px}.mu-und{background:#e3efff;padding:8px 10px;border-radius:8px}.mu-h{font-weight:700;margin-bottom:4px}aside.exam{background:#ffe0ec;border-left:4px solid #d0397a;padding:6px 10px;margin:8px 0;font-size:14px}figure.fig{margin:10px 0}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 8px;font-size:14px}</style>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"><script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body,{delimiters:[{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true}]})"></script>
</head>
<body>
<h1>일반물리학2 · 중간고사 대비 — 26장 전류와 저항 · 27장 회로 (교재 선행)</h1>
<p>김민수 교수 · 중간 범위 <b>21~27장(RC 회로까지, 28장 제외)</b> · 26·27장은 아직 수업 전이라 <b>교수 강의노트 Part-06·07 순서와 표기</b>에 교재 개념을 채웠다. 문제는 강의노트 필수·기초문제와 교재 보기 유형을 숫자만 바꿨다.</p>
"""

P1 = r"""
<section>
  <h2><span class="no">파트 1 · 교재 선행</span>26장 ① 전류와 전류밀도 — 전하가 흐르는 양</h2>
  <aside class="exam" data-level="범위" data-when="9/18 40:48">중간고사 범위는 27장 RC 회로까지, 28장은 제외</aside>
  <h3><span class="tag c">개념</span>전류 = 1초에 단면을 지나는 전하량, 전류밀도 = 넓이 1 m²당 전류</h3>
  <div class="why">21~25장은 멈춰 있는 전하(정전기학)였다. 26장부터 전하가 도선 속을 흐른다. 도선 양 끝에 전위차를 걸면 도선 안에 전기장이 생기고, 그 전기장이 자유전자를 한 방향으로 민다. 이 흐름이 전류다.</div>
  <div class="concept">
    <p><b>[중2 과학 복습] 전류의 세기</b> = 1초 동안 도선의 한 단면을 지나가는 전하의 양. 단위는 암페어 A이고 \(1\,\mathrm A=1\,\mathrm{C/s}\)다.</p>
    <p><b>정의</b>: 아주 짧은 시간 \(dt\) 동안 단면을 지나간 전하가 \(dq\)이면 \[i=\frac{dq}{dt}\] 거꾸로 전하량은 \(q=\int_0^t i\,dt\), 전류가 일정하면 \(q=it\)다.</p>
    <p><b>전류의 방향</b> = <b>양전하가 알짜로 움직이는 방향</b>. 저항·도선 속에서는 높은 전위 → 낮은 전위로 흐른다(전류를 내보내는 — 방전 중인 — 전지 속에서는 거꾸로 낮은 쪽 → 높은 쪽으로 밀려 올라간다). 금속에서 실제로 움직이는 것은 음전하인 전자라서 <b>전자는 전류와 반대 방향</b>으로 간다.</p>
    <p>전류는 <b>스칼라</b>(수 하나로 나타내는 양)다. 도선을 따라 화살표로 흐르는 쪽만 표시할 뿐, 벡터(크기와 방향이 함께 있는 양)처럼 성분으로 나눠 더하지 않는다.</p>
    <p><b>갈림길(접합점)</b>에서 전하는 생기거나 없어지지 않는다(전하 보존). 그래서 들어온 전류의 합 = 나간 전류의 합, 예를 들어 \(i_0=i_1+i_2\). 27장 전류법칙의 뿌리다.</p>
    @@F_WIRE@@
    <p><b>전류밀도</b> \(\vec J\): 단면의 넓이 1 m²마다 흐르는 전류. 단면에서 고르게 흐르면 \[J=\frac{i}{A}\quad[\mathrm{A/m^2}]\] 방향이 있는 <b>벡터</b>이고 양전하가 가는 방향을 가리킨다. 고르지 않으면 \(i=\int\vec J\cdot d\vec A\) — 내적 \(\vec J\cdot d\vec A\)는 작은 넓이 \(dA\)를 수직으로 지나가는 성분만 골라 더한다는 뜻이다.</p>
    <p><b>유동속도</b> \(v_d\)(drift velocity): 전자 하나하나는 약 \(10^6\) m/s로 마구 움직이지만 평균하면 0이다. 전기장이 걸리면 전자 무리 전체가 한쪽으로 아주 느리게 밀려가는데, 그 평균 속도가 \(v_d\)다.</p>
    <p><b>수밀도</b> \(n\) = 부피 1 m³ 안의 전하 운반자(자유전자) 개수, \(n=dN/dV\). 그림처럼 \(dt\) 동안 단면을 지나는 전자는 길이 \(v_d\,dt\), 넓이 \(A\)인 원기둥 안에 있던 것이다.</p>
    <p><b>교수님 유도</b>: \(dN=n\,dV=nAv_d\,dt\) → 전하량 \(dq=e\,dN=neAv_d\,dt\) → \[i=\frac{dq}{dt}=neAv_d,\qquad J=\frac{i}{A}=nev_d\] 여기서 \(e=1.6\times10^{-19}\) C은 기본 전하의 <b>크기</b>(양수)이고 전자 한 개의 전하는 \(-e\)다. 그래서 벡터로는 \(\vec J=-ne\vec v_d\) — 전자의 유동속도는 전류밀도와 반대 방향이다.</p>
    <p><b>크기 감각</b>: 구리(\(n\approx8.5\times10^{28}\ \mathrm{/m^3}\)) 1 mm² 도선에 1 A → \(v_d\approx7\times10^{-5}\) m/s. 1 m 가는 데 4시간쯤 걸린다. 그래도 스위치를 켜면 불이 거의 바로 켜진다. 전기장의 변화가 빛에 가까운 속도로 도선을 따라 전해져, 도선 곳곳의 전자가 곧바로 차례차례 밀리기 시작하기 때문이다(스위치 쪽 전자가 전구까지 달려오는 것이 아니다).</p>
  </div>
  <div class="one">한 줄: \(i=dq/dt\) [A] · 전류 방향 = 양전하 방향(전자와 반대) · \(J=i/A\) · \(i=neAv_d\), \(J=nev_d\).</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>\(i=\dfrac{dq}{dt}\), \(1\,\mathrm A=1\,\mathrm{C/s}\)</li><li>\(J=\dfrac iA\) [A/m²] — 벡터</li><li>\(i=neAv_d\), \(J=nev_d\) (교수님 필수문제 ①②)</li><li>전류 방향 = 양전하 방향, 전자는 반대</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>\(dN=nAv_d\,dt\): 왜 길이 \(v_d\,dt\) 원기둥인지</li><li>\(v_d\)가 그렇게 느린데 불이 바로 켜지는 이유</li><li>전류는 스칼라, 전류밀도는 벡터인 이유</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 1-1 · 전류의 정의</div><p>도선의 한 단면을 2.0 s 동안 6.0 C의 전하가 일정하게 지나갔다. 전류의 세기는?</p><ol class="choices"><li data-ok="1">3.0 A</li><li>12 A</li><li>0.33 A</li><li>6.0 A</li></ol><details><summary>답</summary><div class="ans">전류가 일정하면 \(i=\dfrac{q}{t}=\dfrac{6.0\ \mathrm C}{2.0\ \mathrm s}=3.0\) A. 곱하면 12가 나오는데, 단위가 C·s라 전류가 아니다.</div></details></div>
  <div class="q"><div class="qn">기초 1-2 · 전류의 방향</div><p>구리 도선 안에서 자유전자가 오른쪽으로 움직인다. 전류의 방향과, 도선 두 끝 중 전위가 높은 쪽은?</p><ol class="choices"><li data-ok="1">전류는 왼쪽 · 오른쪽 끝의 전위가 높다</li><li>전류는 오른쪽 · 왼쪽 끝의 전위가 높다</li><li>전류는 오른쪽 · 오른쪽 끝의 전위가 높다</li><li>전류는 왼쪽 · 왼쪽 끝의 전위가 높다</li></ol><details><summary>답</summary><div class="ans">① 전류 방향 = 양전하가 가는 방향 = 전자와 반대 → <b>왼쪽</b>. ② 전류는 높은 전위에서 낮은 전위로 흐르므로, 왼쪽으로 흐른다는 것은 <b>오른쪽 끝이 높다</b>는 뜻이다. (음전하인 전자는 거꾸로 전위가 높은 쪽으로 끌려간다 — 같은 결론.)</div></details></div>
  <div class="q"><div class="qn">기초 1-3 · 접합점</div><p>도선의 갈림길로 5.0 A가 들어오고, 갈래 하나로 2.0 A가 나간다. 나머지 갈래로 나가는 전류는?</p><ol class="choices"><li data-ok="1">3.0 A</li><li>7.0 A</li><li>2.5 A</li><li>10 A</li></ol><details><summary>답</summary><div class="ans">전하 보존: 들어온 합 = 나간 합 → \(5.0=2.0+i\) → \(i=3.0\) A. 전류는 스칼라라 그냥 더하고 뺀다.</div></details></div>
  <div class="q" data-def="J"><div class="qn">기초 1-4 · 전류밀도</div><p>반지름 1.0 mm인 원형 단면 도선에 3.14 A가 단면 전체에 고르게 흐른다. 전류밀도의 크기 \(J\)는?</p><ol class="choices"><li data-ok="1">\(1.0\times10^{6}\ \mathrm{A/m^2}\)</li><li>\(1.0\times10^{3}\ \mathrm{A/m^2}\)</li><li>\(3.1\times10^{6}\ \mathrm{A/m^2}\)</li><li>\(1.0\times10^{9}\ \mathrm{A/m^2}\)</li></ol><details><summary>답</summary><div class="ans">① mm를 m로: \(r=1.0\times10^{-3}\) m. ② 넓이 \(A=\pi r^2=3.14\times(10^{-3})^2=3.14\times10^{-6}\ \mathrm{m^2}\). ③ \(J=\dfrac{i}{A}=\dfrac{3.14}{3.14\times10^{-6}}=1.0\times10^{6}\ \mathrm{A/m^2}\). \(r\)를 제곱하지 않으면 \(10^3\)이 나온다.</div></details></div>
  <div class="q" data-def="A,J"><div class="qn">기초 1-5 · 유동속도로 쓴 전류</div><p>단위 부피당 \(n\)개의 전하 운반자(각 전하량 \(q\))가 유동속도 \(v_d\)로 움직이는, 단면적 \(A\)인 도선이 있다. 전류 \(i\)와 전류밀도 \(J\)는?</p><ol class="choices"><li data-ok="1">\(i=nqAv_d,\ J=nqv_d\)</li><li>\(i=nqv_d/A,\ J=nqAv_d\)</li><li>\(i=nAv_d,\ J=nv_d/q\)</li><li>\(i=qv_d/(nA),\ J=qv_d/n\)</li></ol><details><summary>답</summary><div class="ans">\(dt\) 동안 지나는 운반자 수 \(dN=nAv_d\,dt\) → 전하 \(dq=q\,dN\) → \(i=dq/dt=nqAv_d\). \(J=i/A=nqv_d\). 단위 확인: (1/m³)·C·m²·(m/s) = C/s = A.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 1-1 · 유동속도의 크기</div><p>한 변이 2.0 mm인 정사각형 단면의 구리 도선에 0.50 A의 전류가 흐른다. 구리의 자유전자 수밀도는 \(n=8.5\times10^{28}\ \mathrm{/m^3}\), 기본 전하는 \(e=1.6\times10^{-19}\) C이다. 전자의 유동속도 \(v_d\)를 구하고, 이 속도로 1.0 m를 가는 데 걸리는 시간을 구하라.</p><details><summary>답</summary><div class="ans">① 단면적 \(A=(2.0\times10^{-3})^2=4.0\times10^{-6}\ \mathrm{m^2}\). ② \(i=neAv_d\) 를 \(v_d\)에 대해 풀면 \(v_d=\dfrac{i}{neA}\). ③ 분모 \(neA=8.5\times10^{28}\times1.6\times10^{-19}\times4.0\times10^{-6}=5.44\times10^{4}\) C/m. ④ \(v_d=\dfrac{0.50}{5.44\times10^4}\approx9.2\times10^{-6}\) m/s(약 9.2 μm/s). ⑤ 시간 \(t=\dfrac{1.0}{9.2\times10^{-6}}\approx1.1\times10^{5}\) s — 약 30시간.</div></details></div>
  <div class="q"><div class="qn a">응용 1-2 · 굵기가 다른 도선 잇기</div><p>반지름 1.0 mm인 구리 도선의 끝에 반지름 0.50 mm인 구리 도선을 용접해 이었다. 이 도선에 2.0 A가 흐를 때 각 도선의 전류밀도를 구하고, 가는 도선 속 유동속도가 굵은 도선의 몇 배인지 구하라.</p><details><summary>답</summary><div class="ans">① 전하 보존: 이어진 도선이라 두 곳의 전류는 똑같이 2.0 A. ② 굵은 쪽 \(A_1=\pi(1.0\times10^{-3})^2=3.14\times10^{-6}\ \mathrm{m^2}\) → \(J_1=2.0/(3.14\times10^{-6})\approx6.4\times10^{5}\ \mathrm{A/m^2}\). ③ 가는 쪽 \(A_2=\pi(0.50\times10^{-3})^2=7.85\times10^{-7}\ \mathrm{m^2}\) → \(J_2\approx2.5\times10^{6}\ \mathrm{A/m^2}\). ④ 같은 구리라 \(n\)이 같으므로 \(v_d=J/ne\propto J\) → 반지름 절반 → 넓이 1/4 → <b>4배</b>. (물이 좁은 관에서 빨라지는 것과 같다.)</div></details></div>
</section>
"""

P2 = r"""
<section>
  <h2><span class="no">파트 2 · 교재 선행</span>26장 ② 저항 · 비저항 · 옴의 법칙</h2>
  <h3><span class="tag c">개념</span>저항은 물체의 성질, 비저항은 물질의 성질 — R = ρL/A</h3>
  <div class="why">같은 전압을 걸어도 도선마다 흐르는 전류가 다르다. 전류를 방해하는 정도가 저항이다. 저항은 모양·크기에 따라 달라지는 <b>물체</b>의 성질이고, 비저항은 구리냐 철이냐로 정해지는 <b>물질</b>의 성질이다.</div>
  <div class="concept">
    <p><b>[중2 과학 복습] 옴의 법칙</b> 전압 = 전류 × 저항. 저항의 정의는 \[R=\frac{V}{i}\quad[\Omega=\mathrm{V/A}]\] 1 Ω은 1 V를 걸 때 1 A가 흐르는 저항이다.</p>
    <p><b>교수님 표기</b>: 거시적 옴의 법칙 \(V=iR\)(도선 전체) ↔ 미시적 옴의 법칙 \(|\vec J|=\sigma|\vec E|\)(도선 속 한 점). 물질 속 한 점에서는 전기장이 전류밀도를 만든다.</p>
    <p><b>비저항</b> \(\rho\): \(\vec E=\rho\vec J\)의 비례 상수, 단위 Ω·m. <b>전기전도도(전도율)</b> \(\sigma=1/\rho\), 단위 \((\Omega\cdot\mathrm m)^{-1}\). 방향에 따라 성질이 같은 물질(등방성)에서 성립한다.</p>
    @@F_ROD@@
    <p><b>유도(교수님 순서)</b>: 길이 \(L\), 단면적 \(A\)인 도선의 두 끝 a(높은 쪽)·b(낮은 쪽)에 전위차를 걸면 안의 전기장은 균일하고, 전압 강하의 크기는 \(\Delta V=V_a-V_b=EL\)이다(a → b로 가며 전위가 \(EL\)만큼 내려간다). 여기에 \(E=\rho J\), \(J=i/A\)를 넣으면 \(\Delta V=\rho\frac{i}{A}L\). 양변을 \(i\)로 나누면 \[R=\frac{\Delta V}{i}=\rho\frac{L}{A}\]</p>
    <p>길이에 비례, 단면적에 반비례한다. 물 호스로 생각하면 길고 가는 호스일수록 물이 덜 흐르는 것과 같다.</p>
    <p><b>비저항 크기</b>(Ω·m, 20 °C): 은 \(1.6\times10^{-8}\) · 구리 \(1.7\times10^{-8}\) · 철 \(9.7\times10^{-8}\)(금속) ≪ 순수 규소 \(2.5\times10^{3}\)(반도체) ≪ 유리 \(10^{10}\sim10^{14}\)(절연체).</p>
    <p><b>온도</b>: 금속의 비저항은 온도가 오르면 거의 직선으로 커진다. \[\rho-\rho_0=\rho_0\alpha(T-T_0)\] \(\alpha\) = 비저항의 온도 계수, \(T_0\)는 보통 293 K(20 °C). 반도체는 반대로 온도가 오르면 작아진다.</p>
    @@F_VI@@
    <p><b>옴의 법칙의 정확한 뜻</b>: 소자에 흐르는 전류가 걸어 준 전위차에 <b>비례</b>한다는 성질, 즉 \(R\)이 전압의 크기·방향과 무관하다는 것이다. 모든 소자가 따르지는 않는다. 도선·저항기는 온도가 일정한 범위에서 따르고(옴성), 다이오드는 따르지 않는다(비옴성). \(R=V/i\)는 정의라서 비옴성 소자에도 쓸 수 있지만 그때 \(R\)은 전압마다 달라진다.</p>
    <p><b>미시적 관점(교수님 「전도의 미시적 이론」)</b>: 전하 운반자(질량 \(m\), 전하 \(q\))에 전기력 \(qE\)와, 속도에 비례하는 마찰(충돌) 효과 \(-bv\)(\(b\): 마찰 계수)가 작용한다. \[m\frac{dv}{dt}=qE-bv\] 시간이 지나 두 힘이 같아지면 속도가 일정해진다(종속도): \(v_d=\dfrac{qE}{b}\).</p>
    <p>완화시간 \(\tau=m/b\)(전자가 충돌 없이 움직이는 평균 시간)로 쓰면 \(v_d=\dfrac{q\tau}{m}E\). 이것을 \(J=nqv_d\)에 넣으면 \(J=\dfrac{nq^2\tau}{m}E\) → \[\rho=\frac{m}{nq^2\tau}\] 온도가 일정해 \(n\)과 \(\tau\)가 변하지 않는 범위에서는 \(\rho\)가 전기장과 무관하므로 금속은 옴의 법칙을 따른다.</p>
  </div>
  <div class="one">한 줄: \(R=V/i\) [Ω] · \(R=\rho L/A\) · \(\vec E=\rho\vec J\) (\(\sigma=1/\rho\)) · \(\rho-\rho_0=\rho_0\alpha(T-T_0)\) · 옴성 = 전류가 전압에 비례.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>\(R=V/i\), \(1\ \Omega=1\ \mathrm{V/A}\)</li><li>\(R=\rho\dfrac LA\), \(\sigma=\dfrac1\rho\), \(E=\rho J\)</li><li>\(\rho-\rho_0=\rho_0\alpha(T-T_0)\)</li><li>비저항: 금속 ≪ 반도체 ≪ 절연체</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>저항(물체)과 비저항(물질)의 차이</li><li>\(\Delta V=EL\)에서 \(R=\rho L/A\)가 나오는 과정</li><li>옴의 법칙이 모든 소자의 법칙이 아닌 이유</li><li>마찰력이 속도에 비례하면 \(v_d\propto E\)가 되는 이유</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 2-1 · 저항의 정의</div><p>어떤 저항기에 12 V를 걸었더니 0.50 A가 흘렀다. 저항은?</p><ol class="choices"><li data-ok="1">24 Ω</li><li>6.0 Ω</li><li>0.042 Ω</li><li>12.5 Ω</li></ol><details><summary>답</summary><div class="ans">\(R=\dfrac{V}{i}=\dfrac{12}{0.50}=24\ \Omega\). 곱하면 6.0이 나오는데, 그것은 전력(W)이다.</div></details></div>
  <div class="q"><div class="qn">기초 2-2 · 늘인 도선의 저항</div><p>단면이 고른 금속 도선을 부피는 그대로 둔 채 길이만 2배로 늘였다(비저항은 변하지 않고 단면은 여전히 고르다). 저항은 처음의 몇 배가 되는가?</p><ol class="choices"><li data-ok="1">4배</li><li>2배</li><li>1배(변화 없음)</li><li>1/2배</li></ol><details><summary>답</summary><div class="ans">부피 \(=AL\)이 일정하므로 길이가 2배면 단면적은 1/2배. \(R=\rho\dfrac{L}{A}\)에서 분자 2배, 분모 1/2배 → \(2\div\frac12=\) <b>4배</b>. 비저항이 변하지 않는다고 했으니 \(\rho\)는 그대로.</div></details></div>
  <div class="q" data-def="E,J"><div class="qn">기초 2-3 · 미시적 옴의 법칙</div><p>비저항 \(\rho=2.0\times10^{-8}\ \Omega\cdot\mathrm m\)인 도선 안의 전류밀도가 \(J=5.0\times10^{6}\ \mathrm{A/m^2}\)이다. 도선 안 전기장의 크기 \(E\)는?</p><ol class="choices"><li data-ok="1">0.10 V/m</li><li>\(2.5\times10^{14}\) V/m</li><li>\(4.0\times10^{-15}\) V/m</li><li>10 V/m</li></ol><details><summary>답</summary><div class="ans">\(E=\rho J=2.0\times10^{-8}\times5.0\times10^{6}=0.10\) V/m. 나누면(\(J/\rho\)) 전도도 식과 헷갈린 것.</div></details></div>
  <div class="q"><div class="qn">기초 2-4 · 옴성 판정</div><p>두 소자에 전압을 바꿔 걸며 전류를 쟀다. 소자 가: (2 V, 4.0 A) · (4 V, 8.0 A) · (6 V, 12 A). 소자 나: (2 V, 1.0 A) · (4 V, 1.5 A) · (6 V, 1.8 A). 옴의 법칙을 따르지 않는 소자는?</p><ol class="choices"><li data-ok="1">소자 나</li><li>소자 가</li><li>둘 다</li><li>둘 다 따른다</li></ol><details><summary>답</summary><div class="ans">\(R=V/i\)를 계산한다. 가: 0.5 · 0.5 · 0.5 Ω → 일정(옴성). 나: 2.0 · 2.7 · 3.3 Ω → 전압마다 달라짐(비옴성).</div></details></div>
  <div class="q"><div class="qn">기초 2-5 · 온도와 비저항</div><p>상온 근처에서 금속 도선의 온도를 올리면 비저항은?</p><ol class="choices"><li data-ok="1">온도에 거의 비례해 커진다</li><li>작아진다</li><li>변하지 않는다</li><li>0이 된다</li></ol><details><summary>답</summary><div class="ans">\(\rho-\rho_0=\rho_0\alpha(T-T_0)\), 금속은 \(\alpha>0\) → 온도가 오르면 원자 진동이 커져 전자가 더 자주 부딪힌다(완화시간 \(\tau\) 감소). 작아지는 것은 반도체, 0이 되는 것은 초전도체.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 2-1 · 직육면체의 두 방향 저항</div><p>크기가 2.0 cm × 2.0 cm × 40 cm인 탄소 막대가 있다(비저항 \(\rho=3.5\times10^{-5}\ \Omega\cdot\mathrm m\)). (가) 두 정사각형 면 사이의 저항과 (나) 마주 보는 두 직사각형 면 사이의 저항을 구하라.</p><details><summary>답</summary><div class="ans">전류가 지나가는 방향의 길이가 \(L\), 전류가 지나는 면의 넓이가 \(A\)다. (가) \(L=0.40\) m, \(A=0.020\times0.020=4.0\times10^{-4}\ \mathrm{m^2}\) → \(R=3.5\times10^{-5}\times\dfrac{0.40}{4.0\times10^{-4}}=0.035\ \Omega\). (나) \(L=0.020\) m, \(A=0.020\times0.40=8.0\times10^{-3}\ \mathrm{m^2}\) → \(R=3.5\times10^{-5}\times\dfrac{0.020}{8.0\times10^{-3}}\approx8.8\times10^{-5}\ \Omega\). 같은 막대라도 방향에 따라 400배 다르다 — 물체의 성질인 이유.</div></details></div>
  <div class="q"><div class="qn a">응용 2-2 · 도선 속 전기장 · 전위차 · 저항</div><p>반지름 1.0 mm, 길이 100 m인 구리 도선(비저항 \(1.7\times10^{-8}\ \Omega\cdot\mathrm m\))에 2.0 A가 흐른다. (a) 도선 안 전기장의 크기 (b) 도선 양 끝의 전위차 (c) 도선의 저항을 구하라.</p><details><summary>답</summary><div class="ans">(a) 넓이 \(A=\pi(10^{-3})^2=3.14\times10^{-6}\ \mathrm{m^2}\) → \(J=i/A=6.37\times10^{5}\ \mathrm{A/m^2}\) → \(E=\rho J=1.7\times10^{-8}\times6.37\times10^{5}\approx1.1\times10^{-2}\) V/m. (b) \(\Delta V=EL\approx1.08\times10^{-2}\times100\approx1.1\) V. (c) \(R=\Delta V/i\approx0.54\ \Omega\). 검산: \(R=\rho L/A=(1.7\times10^{-8}\times100)/(3.14\times10^{-6})\approx0.54\ \Omega\) ✓.</div></details></div>
</section>
"""

P3 = r"""
<section>
  <h2><span class="no">파트 3 · 교재 선행</span>26장 ③ 전력(일률)과 줄의 법칙 · 반도체 · 초전도체</h2>
  <h3><span class="tag c">개념</span>P = iV — 저항에서는 P = i²R = V²/R</h3>
  <div class="why">전류가 저항을 지나면 전하가 높은 전위에서 낮은 전위로 내려가며 전기 위치 에너지를 잃는다. 그 에너지가 열(전열기)·빛(전구)·운동(전동기)이 된다. 1초에 바뀌는 에너지가 전력(일률) \(P\)다.</div>
  <div class="concept">
    <p><b>유도</b>: 전하 \(dq\)가 전위차 \(V\)만큼 내려가면 잃는 위치 에너지는 \(dU=dq\,V\)(24장 \(U=qV\)). 1초당으로 나누면 \[P=\frac{dU}{dt}=\frac{dq}{dt}V=iV\quad[\mathrm W=\mathrm{J/s}=\mathrm{V\cdot A}]\] 교수님 표기로 「전기 에너지 전달률」. 저항·전동기·전구 어디에나 쓴다.</p>
    <p><b>줄의 법칙(저항 소모율)</b>: 저항에서는 \(V=iR\)를 넣어 \[P=i^2R=\frac{V^2}{R}\] 이 에너지는 전부 열(줄 열)이 된다.</p>
    <p><b>어느 식을 쓰나</b>: 전류가 고정이면(직렬로 같은 전류) \(i^2R\), 전압이 고정이면(병렬·같은 콘센트) \(V^2/R\). 같은 콘센트에 꽂는 전열기는 저항이 작을수록 더 뜨겁다.</p>
    <p><b>에너지</b> = 전력 × 시간: \(W=Pt\). 전기 요금의 1 kWh = \(1000\ \mathrm W\times3600\ \mathrm s=3.6\times10^{6}\) J.</p>
    <p><b>얼마나 변하나(교재 확인문제)</b>: \(R\) 고정에 전압 2배 → \(V^2\) 때문에 4배. \(R\) 고정에 전류 2배 → 4배. 전압 고정에 \(R\) 2배 → 1/2배. 전류 고정에 \(R\) 2배 → 2배.</p>
    <p><b>반도체</b>: 전하 운반자 수 \(n\)이 금속보다 훨씬 적어 비저항이 크다. 온도가 오르면 \(n\)이 늘어 비저항이 작아진다. 불순물을 넣어(도핑) \(n\)을 조절한 것이 트랜지스터·다이오드다.</p>
    <p><b>초전도체</b>: 어떤 온도(임계 온도) 아래에서 비저항이 정확히 0이 된다. 전류가 열 손실 없이 흐른다(MRI 전자석 등).</p>
  </div>
  <div class="one">한 줄: \(P=iV\)(모든 소자) · 저항은 \(P=i^2R=V^2/R\)(줄 열) · \(W=Pt\) · 초전도체는 임계 온도 아래 \(\rho=0\).</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>\(P=iV\) [W], \(1\ \mathrm W=1\ \mathrm{J/s}=1\ \mathrm{V\cdot A}\)</li><li>\(P=i^2R=V^2/R\) (줄의 법칙)</li><li>\(W=Pt\), 1 kWh \(=3.6\times10^6\) J</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>\(P=iV\)가 \(U=qV\)에서 나오는 과정</li><li>\(i^2R\)과 \(V^2/R\) 중 무엇이 고정인지 보고 고르기</li><li>같은 전압에서 저항을 반으로 자르면 전력이 커지는 이유</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 3-1 · 전력의 정의</div><p>12 V 전지가 회로에 2.0 A를 내보낸다. 전지가 회로에 공급하는 전력은?</p><ol class="choices"><li data-ok="1">24 W</li><li>6.0 W</li><li>144 W</li><li>0.17 W</li></ol><details><summary>답</summary><div class="ans">\(P=iV=2.0\times12=24\) W. 144는 \(V^2\)만 계산한 값이다.</div></details></div>
  <div class="q"><div class="qn">기초 3-2 · 전압이 주어졌을 때</div><p>저항 30 Ω인 전열선에 120 V를 걸었다. 소모 전력은?</p><ol class="choices"><li data-ok="1">480 W</li><li>4.0 W</li><li>3600 W</li><li>120 W</li></ol><details><summary>답</summary><div class="ans">전압이 주어졌으니 \(P=\dfrac{V^2}{R}=\dfrac{120^2}{30}=480\) W. 검산: \(i=120/30=4.0\) A → \(i^2R=16\times30=480\) W ✓. 4.0은 전류다.</div></details></div>
  <div class="q"><div class="qn">기초 3-3 · 전압을 2배로</div><p>저항은 그대로 두고 걸어 준 전압을 2배로 올렸다. 저항에서 소모되는 전력은 처음의 몇 배인가?</p><ol class="choices"><li data-ok="1">4배</li><li>2배</li><li>1/2배</li><li>변하지 않는다</li></ol><details><summary>답</summary><div class="ans">\(P=V^2/R\)에서 \(V\)가 2배 → \(V^2\)은 4배 → <b>4배</b>. 전류도 2배가 되므로 \(P=iV\)로 봐도 \(2\times2=4\)배.</div></details></div>
  <div class="q"><div class="qn">기초 3-4 · 초전도체</div><p>임계 온도보다 낮은 온도에서 초전도체의 비저항은?</p><ol class="choices"><li data-ok="1">0이다</li><li>무한대다</li><li>온도에 비례한다</li><li>구리와 같다</li></ol><details><summary>답</summary><div class="ans">초전도 상태의 비저항은 정확히 0 → 전류가 흘러도 \(i^2R=0\), 열이 생기지 않는다.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 3-1 · 늘인 열선의 전력</div><p>원통형 전열선을 100 V에 연결했더니 전력이 500 W였다. 부피는 그대로 두고 길이만 3배로 늘인 뒤 300 V에 연결하면 전력은 얼마인가? (비저항은 변하지 않고 단면은 고르다)</p><details><summary>답</summary><div class="ans">① 부피 \(AL\) 일정 → 길이 3배면 넓이 1/3배. ② \(R=\rho L/A\) → \(3\div\frac13=\) 9배, \(R'=9R\). ③ 전압 3배 → \(V'^2=9V^2\). ④ \(P'=\dfrac{V'^2}{R'}=\dfrac{9V^2}{9R}=P=500\) W. 저항이 9배 되는 만큼 전압 제곱도 9배라 그대로다.</div></details></div>
  <div class="q"><div class="qn a">응용 3-2 · 전열선 자르기</div><p>길이 6.0 m, 저항 36 Ω인 니크롬선이 있다(단면이 고르고, 비저항은 온도에 따라 변하지 않는다고 한다). 콘센트 전압은 120 V다. (가) 선 전체를 120 V에 연결할 때 (나) 선을 반으로 잘라 한 토막만 120 V에 연결할 때 (다) 두 토막을 나란히(병렬) 120 V에 연결할 때 전체 전력을 각각 구하라.</p><details><summary>답</summary><div class="ans">전압이 120 V로 고정이므로 \(P=V^2/R\), \(V^2=14400\). (가) \(R=36\ \Omega\) → \(P=14400/36=400\) W. (나) 반 토막 \(R=18\ \Omega\) → \(P=14400/18=800\) W. (다) 두 토막 각각 800 W가 동시에 → 1600 W. 저항을 줄이면 같은 전압에서 전류가 커져 더 뜨거워진다(단, 선이 녹을 수 있다).</div></details></div>
</section>
"""

P4 = r"""
<section>
  <h2><span class="no">파트 4 · 교재 선행</span>27장 ① 기전력 · 전압법칙(고리 규칙) · 단일 고리 회로</h2>
  <h3><span class="tag c">개념</span>한 바퀴 돌면 전위 변화의 합은 0 — 부호 규칙 4가지</h3>
  <div class="why">저항에서는 전하가 전위를 내려가며 에너지를 잃는다. 회로가 계속 돌려면 누군가 전하를 다시 높은 전위로 올려 줘야 한다. 그 전하 펌프가 전지 같은 기전력 장치다. 회로 계산은 「한 바퀴 돌아 제자리에 오면 전위도 제자리」라는 한 문장에서 나온다.</div>
  <div class="concept">
    <p><b>기전력</b> \(\varepsilon\)(교재는 ℰ로 쓴다): 기전력 장치가 전하 \(dq\)를 −극에서 +극으로 옮기며 해 준 일 \(dW\)에 대해 \[\varepsilon=\frac{dW}{dq}\quad[\mathrm{J/C}=\mathrm V]\] 화학(전지)·빛(태양전지)·운동(발전기) 에너지를 전기 위치 에너지로 바꾼다. 회로 기호는 긴 가는 판이 +극, 짧은 굵은 판이 −극.</p>
    <p><b>이상적인 전지</b>는 내부저항이 0이라 두 극 사이 전위차가 늘 \(\varepsilon\)이다. <b>실제 전지</b>는 이상적 \(\varepsilon\)에 작은 내부저항 \(r\)이 직렬로 붙은 것으로 본다.</p>
    <p><b>키르히호프 법칙(교수님 표)</b> ① 전류법칙(KIL, 접합점, 전하 보존): 한 점에 들어온 전류의 합 = 나간 전류의 합. 들어오는 것을 +, 나가는 것을 −로 세면 \(\sum i=0\). ② 전압법칙(KVL, 고리, 에너지 보존): 닫힌 회로를 한 바퀴 돌며 소자마다 부호를 붙인 전위 변화를 더하면 \(\sum\Delta V=0\).</p>
    <p>교수님 표의 \(\varepsilon=\sum V\)는 같은 말을 「기전력의 합 = 저항들에서 내려간 전위의 합」으로 쓴 것이다. 전압법칙은 닫힌 회로에만 쓴다.</p>
    @@F_SIGN@@
    <p><b>부호 규칙</b>: 고리를 도는 방향으로 소자를 지날 때 ① 전지를 −극 → +극으로: \(+\varepsilon\) ② +극 → −극으로: \(-\varepsilon\) ③ 저항을 전류와 같은 방향으로: \(-iR\)(전류는 높은 곳 → 낮은 곳) ④ 전류와 반대 방향으로: \(+iR\).</p>
    <p><b>왜 0인가</b>: 전위는 위치마다 값이 하나로 정해진다(24장). 출발점으로 돌아오면 전위도 같으니 변화의 합은 0이다. 산을 한 바퀴 돌아 제자리에 오면 오르막 합 = 내리막 합인 것과 같다.</p>
    @@F_LOOP@@
    <p><b>단일 고리</b>: 시계 방향으로 한 바퀴 → \(+\varepsilon-ir-iR=0\) → \[i=\frac{\varepsilon}{R+r}\] <b>단자 전압</b>(전지 두 극 사이 실제 전위차): 전지가 전류를 내보낼 때(방전) \(V=\varepsilon-ir\)로 \(\varepsilon\)보다 작고, 다른 전지에 밀려 전류가 +극으로 들어갈 때(충전) \(V=\varepsilon+ir\)로 \(\varepsilon\)보다 크다.</p>
    <p><b>에너지로 봐도 같다(교재 에너지 방법)</b>: 시간 \(dt\) 동안 전지가 한 일 \(\varepsilon\,dq=\varepsilon i\,dt\) = 저항들의 열 \(i^2(R+r)\,dt\) → 같은 식.</p>
    <p><b>직렬 연결</b>: 같은 전류가 차례로 지난다. 한 바퀴 \(\varepsilon-iR_1-iR_2-iR_3=0\) → \(i=\varepsilon/(R_1+R_2+R_3)\) → \[R_{eq}=R_1+R_2+R_3+\cdots\]</p>
    <p><b>두 점 사이 전위차</b>: 한 점에서 다른 점까지 회로를 <b>아무 길로나</b> 따라가며 부호 규칙대로 더한다. \(V_b-V_a\) = (a에서 b까지 변화의 합). 어느 길로 가도 답이 같다(검산에 쓴다). 전류가 흐르지 않는 갈래의 저항은 전위 변화가 0.</p>
    <p><b>일률</b>: 기전력 장치가 전하에 주는 일률 \(P_{emf}=i\varepsilon\), 내부저항에서 열로 나가는 \(P_r=i^2r\), 바깥 회로로 가는 \(P=iV\) (\(i\varepsilon=i^2r+iV\)).</p>
  </div>
  <div class="one">한 줄: \(\varepsilon=dW/dq\) [V] · 한 바퀴 합 = 0 · 전지 −→+ \(+\varepsilon\) · 저항을 전류 방향으로 \(-iR\) · \(i=\varepsilon/(R+r)\) · 방전 단자 전압 \(V=\varepsilon-ir\) · 직렬 \(R_{eq}=\sum R\).</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>부호 4가지: −→+ \(+\varepsilon\) · +→− \(-\varepsilon\) · 전류 방향 \(-iR\) · 반대 \(+iR\)</li><li>\(i=\dfrac{\varepsilon}{R+r}\), 단자 전압 방전 \(V=\varepsilon-ir\) · 충전 \(V=\varepsilon+ir\)</li><li>직렬 \(R_{eq}=R_1+R_2+\cdots\)</li><li>\(P_{emf}=i\varepsilon\), \(P_r=i^2r\)</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>전압법칙 = 에너지 보존(전위는 위치마다 하나)</li><li>전류 방향을 반대로 가정해도 답이 음수로 나올 뿐인 이유</li><li>단자 전압이 방전 때는 기전력보다 작고 충전 때는 큰 이유</li><li>두 점 전위차를 어느 길로 구해도 같은 이유</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 4-1 · 기전력의 정의</div><p>전지가 2.0 C의 전하를 −극에서 +극으로 옮기며 18 J의 일을 했다. 이 전지의 기전력은?</p><ol class="choices"><li data-ok="1">9.0 V</li><li>36 V</li><li>0.11 V</li><li>16 V</li></ol><details><summary>답</summary><div class="ans">\(\varepsilon=\dfrac{W}{q}=\dfrac{18\ \mathrm J}{2.0\ \mathrm C}=9.0\) V. 기전력은 전하 1 C당 해 준 일이다.</div></details></div>
  <div class="q" data-def="R"><div class="qn">기초 4-2 · 저항을 지날 때</div><p>고리를 도는 방향으로 저항 \(R\)을 지나는데, 그 저항에 흐르는 전류 \(i\)도 같은 방향이다. 전위 변화는?</p><ol class="choices"><li data-ok="1">\(-iR\)</li><li>\(+iR\)</li><li>0</li><li>\(-i/R\)</li></ol><details><summary>답</summary><div class="ans">전류는 높은 전위 → 낮은 전위로 흐른다. 전류와 같은 방향으로 가면 전위가 내려가므로 \(-iR\).</div></details></div>
  <div class="q"><div class="qn">기초 4-3 · 전지를 지날 때</div><p>고리를 도는 방향으로 이상적인 전지(기전력 \(\varepsilon\))를 +극에서 −극 쪽으로 지난다. 전위 변화는?</p><ol class="choices"><li data-ok="1">\(-\varepsilon\)</li><li>\(+\varepsilon\)</li><li>0</li><li>\(+2\varepsilon\)</li></ol><details><summary>답</summary><div class="ans">+극이 −극보다 전위가 \(\varepsilon\)만큼 높다. 높은 쪽에서 낮은 쪽으로 가므로 \(-\varepsilon\). 전류 방향과는 상관없다(이상적 전지).</div></details></div>
  <div class="q"><div class="qn">기초 4-4 · 내부저항과 단자 전압</div><p>기전력 12 V, 내부저항 1.0 Ω인 전지에 5.0 Ω 저항을 연결했다. 회로의 전류와 전지의 단자 전압은?</p><ol class="choices"><li data-ok="1">2.0 A, 10 V</li><li>2.4 A, 12 V</li><li>2.0 A, 12 V</li><li>3.0 A, 9.0 V</li></ol><details><summary>답</summary><div class="ans">① \(i=\dfrac{\varepsilon}{R+r}=\dfrac{12}{5.0+1.0}=2.0\) A. ② 단자 전압 \(V=\varepsilon-ir=12-2.0\times1.0=10\) V(= \(iR=2.0\times5.0\) ✓). 내부저항을 빼먹으면 2.4 A가 나온다.</div></details></div>
  <div class="q"><div class="qn">기초 4-5 · 직렬 연결</div><p>저항 \(R_1&gt;R_2&gt;R_3\)인 세 저항을 전지에 직렬로 연결했다. 옳은 것은?</p><ol class="choices"><li data-ok="1">세 저항의 전류는 같고, 전위차는 \(R_1\) 양 끝이 가장 크다</li><li>전류는 \(R_3\)이 가장 크고, 전위차는 셋이 같다</li><li>전류와 전위차 모두 \(R_1\)이 가장 크다</li><li>전류는 \(R_1\)이 가장 작고, 전위차는 \(R_3\)이 가장 크다</li></ol><details><summary>답</summary><div class="ans">직렬은 한 길이라 전류가 모두 같다(전하 보존). 전위차 \(V=iR\)는 \(i\)가 같으니 \(R\)이 큰 순서: \(R_1\) 양 끝이 가장 크다.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 4-1 · 두 전지가 마주 보는 고리</div><p>그림처럼 전지 1(기전력 6.0 V, 내부저항 1.0 Ω)과 전지 2(기전력 2.0 V, 내부저항 1.0 Ω)가 +극끼리 같은 쪽(위)을 향하게 연결되고, 위쪽 전선에 저항 \(R=6.0\ \Omega\)이 있다. (a) 회로의 전류 크기와 방향 (b) 전지 1과 전지 2 각각의 단자 전압을 구하라.</p>@@F_Q_TWOBAT@@<details><summary>답</summary><div class="ans">(a) 전지 1은 전류를 시계 방향(왼쪽 변 위로)으로, 전지 2는 반시계 방향(오른쪽 변 위로)으로 밀어 서로 반대다. 시계 방향 전류 \(i\)를 가정하고 왼쪽 아래에서 시계 방향으로 한 바퀴(그림 순서대로): \(r_1\)을 전류 방향으로 \(-1.0i\), 전지 1을 −→+로 \(+6.0\), \(R\)을 \(-6.0i\), 전지 2를 +→−로 \(-2.0\), \(r_2\)를 \(-1.0i\) → \(6.0-2.0-8.0i=0\) → \(i=0.50\) A, 양수라 가정대로 <b>시계 방향</b>. (b) 전지 1: 전류가 −극에서 +극으로 나오므로 \(V_1=\varepsilon_1-ir_1=6.0-0.50=5.5\) V. 전지 2: 전류가 +극으로 들어가 거꾸로 밀리므로(충전되는 쪽) \(V_2=\varepsilon_2+ir_2=2.0+0.50=2.5\) V. 검산: 바깥 저항 전위차 \(iR=3.0\) V \(=V_1-V_2\) ✓.</div></details></div>
  <div class="q"><div class="qn a">응용 4-2 · 열린 단자 사이 전위차</div><p>그림에서 기전력 \(\varepsilon=9.0\) V인 이상적 전지와 저항 \(R_1=1.0\ \Omega\), \(R_2=2.0\ \Omega\)이 고리를 이룬다. 점 P에서 기전력 \(\varepsilon'=2.0\) V인 이상적 전지(+극이 단자 a 쪽)를 거쳐 단자 a로, 점 Q에서 저항 \(R_3=5.0\ \Omega\)을 거쳐 단자 b로 선이 나와 있고 a·b에는 아무것도 연결되어 있지 않다. \(\Delta V_{ab}=V_b-V_a\)를 구하라.</p>@@F_Q_OPEN@@<details><summary>답</summary><div class="ans">① a·b가 열려 있으니 그 두 갈래에는 전류가 없다. 전류는 고리에만: \(i=\dfrac{9.0}{1.0+2.0}=3.0\) A(시계 방향, \(R_2\)를 P → Q로 내려감). ② \(V_P-V_Q=iR_2=6.0\) V. ③ P → a: 전지 \(\varepsilon'\)을 −극 → +극으로 지나므로 \(V_a=V_P+2.0\). ④ Q → b: \(R_3\)에 전류가 없으니 \(V_b=V_Q\). ⑤ \(V_b-V_a=V_Q-V_P-2.0=-6.0-2.0=\) <b>−8.0 V</b>(a가 8.0 V 높다).</div></details></div>
</section>
"""

P5 = r"""
<section>
  <h2><span class="no">파트 5 · 교재 선행</span>27장 ② 다중 고리 회로 · 병렬 · 전류계와 전압계</h2>
  <h3><span class="tag c">개념</span>미지 전류 수만큼 식을 세운다 — 전류법칙 + 전압법칙</h3>
  <div class="why">갈림길이 있는 회로에는 갈래마다 전류가 다르다. 모르는 전류가 몇 개인지 세고, 그 수만큼 식을 전류법칙(접합점)과 전압법칙(고리)으로 만든 뒤 연립해서 푼다.</div>
  <div class="concept">
    <p><b>전류법칙(접합점 규칙)</b>: 한 접합점에 들어온 전류의 합 = 나간 전류의 합. 전하가 쌓이지도 사라지지도 않기 때문이다(전하 보존).</p>
    @@F_SP@@
    <p><b>병렬 연결</b>: 저항들의 두 끝이 같은 두 점에 붙어 있어 <b>전위차가 모두 같다</b>. 각 전류 \(i_k=V/R_k\), 전체 전류 \(i=\sum i_k\) → \(\dfrac{V}{R_{eq}}=\dfrac{V}{R_1}+\dfrac{V}{R_2}+\cdots\) → \[\frac{1}{R_{eq}}=\frac1{R_1}+\frac1{R_2}+\frac1{R_3}+\cdots\] 두 개면 \(R_{eq}=\dfrac{R_1R_2}{R_1+R_2}\). 병렬 등가저항은 가장 작은 저항보다도 작다(길이 늘어나는 것이 아니라 단면적이 넓어지는 것).</p>
    <p><b>다중 고리 풀이 순서</b> ① 갈래마다 전류 이름과 방향을 아무렇게나 정한다 ② 접합점 식(접합점 수 − 1개) ③ 서로 독립인 고리 식(부족한 수만큼 — 이미 쓴 식끼리 더하거나 빼서 나오지 않는 고리) ④ 연립해서 푼다(크래머 법칙 — 미적2 행렬식) ⑤ 음수가 나오면 실제 방향이 가정과 반대.</p>
    @@F_TWO@@
    <p><b>예제</b>: 접합점 a: \(i_1+i_2=i_3\). 왼쪽 고리(b에서 시계 방향): \(+10-2i_1-4i_3=0\). 오른쪽 고리(b에서 반시계 방향): \(+5-2i_2-4i_3=0\). \(i_3\)를 넣어 정리하면 \(6i_1+4i_2=10\), \(4i_1+6i_2=5\).</p>
    <p><b>크래머 법칙(미적2 행렬식)</b>: 연립방정식 \(ax+by=u,\ cx+dy=v\)에서 \(D=ad-bc\neq0\)이면 \(x=\dfrac{ud-bv}{D}\), \(y=\dfrac{av-cu}{D}\).</p>
    <p><b>예제에 적용</b>: 계수 행렬식 \(D=6\cdot6-4\cdot4=20\) → \(i_1=\dfrac{10\cdot6-4\cdot5}{20}=2.0\) A, \(i_2=\dfrac{6\cdot5-4\cdot10}{20}=-0.50\) A, \(i_3=i_1+i_2=1.5\) A. \(i_2\)가 음수 → 실제로는 오른쪽 갈래를 <b>아래로</b> 0.50 A 흐른다(전지 2는 거꾸로 밀려 충전된다).</p>
    <p><b>전류계와 전압계</b>: 전류계는 재려는 갈래에 <b>직렬</b>로 넣고 자기 저항 \(R_A\)가 아주 작아야 한다(원래 전류를 바꾸지 않게). 전압계는 재려는 두 점에 <b>병렬</b>로 대고 저항 \(R_V\)가 아주 커야 한다(전류를 빼앗지 않게). 둘을 합친 것이 멀티미터.</p>
  </div>
  <div class="one">한 줄: 접합점: 들어온 합 = 나간 합 · 병렬 \(1/R_{eq}=\sum1/R\), 전위차가 같다 · 미지 전류 수만큼 식 · 음수 = 반대 방향 · 전류계 직렬(작은 R) · 전압계 병렬(큰 R).</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>병렬 \(\dfrac1{R_{eq}}=\sum\dfrac1{R_k}\), 둘이면 \(\dfrac{R_1R_2}{R_1+R_2}\)</li><li>직렬 = 전류가 같다 · 병렬 = 전위차가 같다</li><li>풀이 순서 5단계, 음수 = 반대 방향</li><li>전류계 직렬·작은 저항 / 전압계 병렬·큰 저항</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>병렬로 저항을 더하면 등가저항이 줄어드는 이유</li><li>식이 몇 개 필요한지 세는 법(미지수 = 식 수)</li><li>계기의 내부저항 조건이 그렇게 정해진 이유</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 5-1 · 병렬 등가저항</div><p>6.0 Ω과 3.0 Ω 저항을 병렬로 연결했다. 등가저항은?</p><ol class="choices"><li data-ok="1">2.0 Ω</li><li>9.0 Ω</li><li>4.5 Ω</li><li>0.50 Ω</li></ol><details><summary>답</summary><div class="ans">\(R_{eq}=\dfrac{6.0\times3.0}{6.0+3.0}=\dfrac{18}{9.0}=2.0\ \Omega\). 가장 작은 3.0 Ω보다 작은지 확인 ✓. \(1/R_{eq}=1/6+1/3=1/2\)만 하고 멈추면 0.50이 나온다 — 뒤집어야 한다.</div></details></div>
  <div class="q"><div class="qn">기초 5-2 · 병렬 전류</div><p>12 V 이상적 전지에 4.0 Ω과 6.0 Ω 저항을 병렬로 연결했다. 전지에서 나오는 전류는?</p><ol class="choices"><li data-ok="1">5.0 A</li><li>1.2 A</li><li>3.0 A</li><li>2.0 A</li></ol><details><summary>답</summary><div class="ans">병렬이라 두 저항 모두 12 V. \(i_1=12/4.0=3.0\) A, \(i_2=12/6.0=2.0\) A → 합 5.0 A. 검산: \(R_{eq}=2.4\ \Omega\) → \(12/2.4=5.0\) A ✓. 1.2 A는 직렬로 착각한 값.</div></details></div>
  <div class="q"><div class="qn">기초 5-3 · 계기 연결</div><p>회로의 한 저항에 흐르는 전류와 그 저항 양 끝의 전위차를 재려 한다. 옳은 연결은?</p><ol class="choices"><li data-ok="1">전류계는 저항과 직렬(내부저항 아주 작게), 전압계는 저항과 병렬(내부저항 아주 크게)</li><li>전류계는 병렬(내부저항 크게), 전압계는 직렬(내부저항 작게)</li><li>둘 다 직렬, 내부저항은 작을수록 좋다</li><li>둘 다 병렬, 내부저항은 클수록 좋다</li></ol><details><summary>답</summary><div class="ans">전류계는 같은 전류가 지나가야 하니 직렬, 끼워도 전류가 안 바뀌게 저항이 거의 0. 전압계는 두 점의 전위를 비교하니 병렬, 전류를 빼앗지 않게 저항이 아주 크다.</div></details></div>
  <div class="q"><div class="qn">기초 5-4 · 음수 전류</div><p>다중 고리 회로를 연립해서 풀었더니 한 갈래의 전류가 \(-0.5\) A로 나왔다. 뜻은?</p><ol class="choices"><li data-ok="1">실제 전류는 처음 정한 방향과 반대로 0.5 A 흐른다</li><li>계산이 틀렸으니 방향을 바꿔 다시 풀어야 한다</li><li>그 갈래의 전류가 0.5 A만큼 줄어든다</li><li>그 갈래가 에너지를 만들어 낸다</li></ol><details><summary>답</summary><div class="ans">방향은 아무렇게나 정해도 된다. 반대로 정했으면 크기는 같고 부호만 음수로 나온다. 다시 풀 필요 없다.</div></details></div>
  <div class="q" data-def="V,R"><div class="qn">기초 5-5 · 직렬과 병렬 비교</div><p>전압 \(V\)인 이상적 전지에 같은 저항 \(R\) 두 개를 (가) 직렬로 (나) 병렬로 연결한다. 전지에서 나오는 전류의 비 (나):(가)는?</p><ol class="choices"><li data-ok="1">4 : 1</li><li>2 : 1</li><li>1 : 1</li><li>1 : 4</li></ol><details><summary>답</summary><div class="ans">(가) \(R_{eq}=2R\) → \(i=V/2R\). (나) \(R_{eq}=R/2\) → \(i=2V/R\). 비 \(\dfrac{2V/R}{V/2R}=4\) → 4 : 1.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 5-1 · 세 갈래 회로</div><p>그림 회로에서 \(\varepsilon_1=9.0\) V, \(\varepsilon_2=3.0\) V(둘 다 이상적, +극이 위), \(R_1=R_2=1.0\ \Omega\), \(R_3=2.0\ \Omega\)이다. 전류 \(i_1\)(왼쪽 갈래 위로), \(i_2\)(오른쪽 갈래 위로), \(i_3\)(가운데 갈래 아래로)를 구하라.</p>@@F_Q_TWO@@<details><summary>답</summary><div class="ans">① 접합점 a: \(i_1+i_2=i_3\). ② 왼쪽 고리(b에서 시계 방향): \(+9.0-1.0i_1-2.0i_3=0\). ③ 오른쪽 고리(b에서 반시계 방향): \(+3.0-1.0i_2-2.0i_3=0\). ④ \(i_3\)을 넣으면 \(3i_1+2i_2=9\), \(2i_1+3i_2=3\). ⑤ 크래머: \(D=3\cdot3-2\cdot2=5\), \(i_1=\dfrac{9\cdot3-2\cdot3}{5}=4.2\) A, \(i_2=\dfrac{3\cdot3-2\cdot9}{5}=-1.8\) A, \(i_3=4.2-1.8=2.4\) A. ⑥ \(i_2\) 음수 → 실제로는 오른쪽 갈래를 <b>아래로</b> 1.8 A. 검산(바깥 큰 고리): \(9.0-4.2\times1.0+(-1.8)\times1.0-3.0=0\) ✓.</div></details></div>
  <div class="q"><div class="qn a">응용 5-2 · 전구 세 개</div><p>세 전구는 모두 「100 V에서 50 W」 규격이다. 그림처럼 전구 1과, 서로 병렬인 전구 2·3을 직렬로 이어 100 V에 연결했다. 전구 저항은 일정하다고 할 때 (a) 세 전구가 쓰는 전체 전력 (b) 가장 밝은 전구와 그 전력을 구하라.</p>@@F_Q_BULBS@@<details><summary>답</summary><div class="ans">① 규격에서 저항: \(R=\dfrac{V^2}{P}=\dfrac{100^2}{50}=200\ \Omega\). ② 전구 2·3 병렬 = 100 Ω, 전구 1과 직렬 → \(R_{eq}=300\ \Omega\). (a) \(P=\dfrac{V^2}{R_{eq}}=\dfrac{10000}{300}\approx33\) W. (b) 전체 전류 \(i=100/300=1/3\) A가 전구 1을 모두 지나고, 2·3에는 반씩(1/6 A). 전구 1: \(i^2R=\frac19\times200\approx22\) W, 전구 2·3: 각 \(\frac1{36}\times200\approx5.6\) W → <b>전구 1이 가장 밝다</b>. 합 22.2 + 5.6 + 5.6 ≈ 33 W ✓.</div></details></div>
  <div class="q"><div class="qn a">응용 5-3 · 저항마다 전력</div><p>그림처럼 기전력 18 V인 이상적 전지에 2.0 Ω 저항이 직렬로, 그 뒤에 3.0 Ω과 6.0 Ω 저항이 병렬로 연결되어 있다. 각 저항에서 소모되는 전력을 구하고, 합이 전지가 내는 전력과 같은지 확인하라.</p>@@F_Q_SP@@<details><summary>답</summary><div class="ans">① 병렬 부분 \(\dfrac{3.0\times6.0}{3.0+6.0}=2.0\ \Omega\) → 전체 \(R_{eq}=4.0\ \Omega\). ② 전체 전류 \(i=18/4.0=4.5\) A. ③ 2.0 Ω: \(i^2R=4.5^2\times2.0=40.5\) W. ④ 병렬 부분 전위차 \(4.5\times2.0=9.0\) V → 3.0 Ω: \(9.0^2/3.0=27\) W, 6.0 Ω: \(9.0^2/6.0=13.5\) W. ⑤ 합 \(40.5+27+13.5=81\) W, 전지 \(i\varepsilon=4.5\times18=81\) W ✓(에너지 보존).</div></details></div>
</section>
"""

P6 = r"""
<section>
  <h2><span class="no">파트 6 · 교재 선행</span>27장 ③ RC 회로 — 충전 · 방전 · 시간 상수</h2>
  <h3><span class="tag c">개념</span>축전기가 끼면 전류가 시간에 따라 변한다 — 지수함수 하나로</h3>
  <div class="why">빈 축전기는 처음엔 도선처럼 전류를 받아들이다가, 전하가 찰수록 전류를 막는다. 이 변화는 \(e^{-t/RC}\) 하나로 모두 설명된다. 교수님 강의노트 Part-07 마지막 절(전류의 크기가 시간에 따라 변하는 회로)이 중간 범위의 끝이다.</div>
  <div class="concept">
    <p><b>[고등 수학 복습] 지수·로그</b>: \(e\approx2.718\). \(e^{-x}\)는 \(x=0\)에서 1이고 \(x\)가 1 늘 때마다 약 0.37배로 준다. \(e^{-1}\approx0.37\), \(1-e^{-1}\approx0.63\). \(\ln\)은 그 역: \(e^{-x}=\frac12\) ↔ \(x=\ln2\approx0.69\).</p>
    @@F_RC@@
    <p><b>충전(스위치 a)</b>: 시계 방향 전압법칙 \(\varepsilon-iR-\dfrac qC=0\)(축전기 두 판의 전위차는 25장 \(V=q/C\)). 여기서 \(i=\dfrac{dq}{dt}\)이므로 \[R\frac{dq}{dt}+\frac qC=\varepsilon\] 충전 방정식이다. 공업수학1 1장의 1계 선형 미분방정식이고, 변수분리(1.3)로 풀린다. 처음에는 비어 있다: \(q(0)=0\).</p>
    <p><b>풀이</b>: \(\dfrac{dq}{dt}=\dfrac{C\varepsilon-q}{RC}\) → \(\dfrac{dq}{C\varepsilon-q}=\dfrac{dt}{RC}\) → 양변을 0부터 적분 \(-\ln(C\varepsilon-q)+\ln(C\varepsilon)=\dfrac{t}{RC}\) → \(\ln\dfrac{C\varepsilon-q}{C\varepsilon}=-\dfrac{t}{RC}\) → \[q=C\varepsilon\left(1-e^{-t/RC}\right)\]</p>
    <p><b>전류와 전위차</b>: \(i=\dfrac{dq}{dt}=\dfrac{\varepsilon}{R}e^{-t/RC}\). 축전기 \(V_C=\dfrac qC=\varepsilon(1-e^{-t/RC})\), 저항 \(V_R=iR=\varepsilon e^{-t/RC}\). 언제나 \(V_C+V_R=\varepsilon\).</p>
    @@F_RCG@@
    <p><b>시간 상수</b> \(\tau=RC\)(교수님 \(\tau_C\), 단위 Ω·F = s): \(t=\tau\)에서 \(q=(1-e^{-1})C\varepsilon\approx0.63\,C\varepsilon\), 전류는 처음의 37%. \(\tau\)가 작을수록 빨리 찬다. \(5\tau\)면 99% 이상.</p>
    <p><b>처음과 충분히 오래 지난 뒤</b>: 처음 비어 있던 축전기는 연결 직후(\(t=0\)) 전위차가 0 → <b>도선처럼</b>, 전류 \(\varepsilon/R\). \(t\to\infty\) 가득 찬 축전기는 전류가 0 → <b>끊긴 도선처럼</b>, \(q=C\varepsilon\), \(V_C=\varepsilon\).</p>
    <p><b>방전(스위치 b, 전지 없음)</b>: \(iR+\dfrac qC=0\) → \(R\dfrac{dq}{dt}+\dfrac qC=0\), \(q(0)=q_0\). 변수분리 \(\dfrac{dq}{q}=-\dfrac{dt}{RC}\) → 0부터 적분 \(\ln\dfrac{q}{q_0}=-\dfrac{t}{RC}\) → \[q=q_0e^{-t/RC},\qquad i=\frac{dq}{dt}=-\frac{q_0}{RC}e^{-t/RC}\] 음수 = 충전 때와 반대 방향으로 흐른다.</p>
    <p><b>비율로 구하는 시간</b>: 방전으로 절반 \(t=RC\ln2\) · 1/3 \(t=RC\ln3\) · 1/4 \(t=RC\ln4=2RC\ln2\) · 충전 중 \(V_C=V_R\)가 되는 때 \(e^{-t/RC}=\frac12\) → \(t=RC\ln2\) · 99% 충전 \(1-e^{-t/RC}=0.99\) → \(t=RC\ln100=2RC\ln10\approx4.6RC\).</p>
  </div>
  <div class="one">한 줄: 충전 \(q=C\varepsilon(1-e^{-t/RC})\), \(i=\frac\varepsilon Re^{-t/RC}\) · 방전 \(q=q_0e^{-t/RC}\) · \(\tau=RC\)(63%·37%) · 처음(빈) 축전기 = 도선처럼, 충분히 지난 뒤 = 끊긴 도선처럼.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것</div><ul><li>충전 \(q=C\varepsilon(1-e^{-t/RC})\), \(i=\dfrac\varepsilon Re^{-t/RC}\)</li><li>방전 \(q=q_0e^{-t/RC}\)</li><li>\(\tau=RC\): 63% 충전 · 전류 37%</li><li>절반 \(RC\ln2\) · 99% \(2RC\ln10\)</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것</div><ul><li>처음 전류가 \(\varepsilon/R\)인 이유(빈 축전기의 전위차 0)</li><li>충전이 점점 느려지는 이유(\(q/C\)가 \(\varepsilon\)에 가까워져 \(R\)의 전위차가 준다)</li><li>충전 방정식이 1계 선형 ODE인 것(공수1 연결)</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제</h3>
  <div class="q"><div class="qn">기초 6-1 · 시간 상수</div><p>저항 2.0 kΩ과 전기 용량 50 μF 축전기로 만든 RC 회로의 시간 상수는?</p><ol class="choices"><li data-ok="1">0.10 s</li><li>100 s</li><li>\(1.0\times10^{-4}\) s</li><li>40 s</li></ol><details><summary>답</summary><div class="ans">접두어부터: 2.0 kΩ \(=2.0\times10^3\ \Omega\), 50 μF \(=50\times10^{-6}\) F. \(\tau=RC=2.0\times10^3\times5.0\times10^{-5}=0.10\) s.</div></details></div>
  <div class="q"><div class="qn">기초 6-2 · 63%</div><p>처음에 비어 있는 축전기를 \(t=0\)에 스위치를 닫아 RC 회로로 충전한다. 시간 상수 \(\tau\)만큼 지났을 때 축전기 전하는 최종값의 몇 %인가?</p><ol class="choices"><li data-ok="1">약 63%</li><li>약 37%</li><li>50%</li><li>100%</li></ol><details><summary>답</summary><div class="ans">\(q/C\varepsilon=1-e^{-1}\approx1-0.37=0.63\). 37%는 그때의 전류 비율(\(e^{-1}\))이다.</div></details></div>
  <div class="q"><div class="qn">기초 6-3 · 스위치를 닫는 순간</div><p>비어 있는 축전기, 저항 10 Ω, 기전력 20 V인 이상적 전지가 직렬로 연결된다. 스위치를 닫는 순간의 전류는?</p><ol class="choices"><li data-ok="1">2.0 A</li><li>0</li><li>200 A</li><li>0.50 A</li></ol><details><summary>답</summary><div class="ans">\(t=0\)에서 \(q=0\) → 축전기 전위차 0 → 도선과 같다. 전압법칙 \(20-10i=0\) → \(i=2.0\) A \(=\varepsilon/R\).</div></details></div>
  <div class="q"><div class="qn">기초 6-4 · 오래 지난 뒤</div><p>저항 \(R\), 기전력 \(\varepsilon\)인 RC 직렬 충전 회로에서 스위치를 닫고 충분히 오래 지난 뒤의 전류와 축전기 전위차는?</p><ol class="choices"><li data-ok="1">전류 0, 축전기 전위차 \(\varepsilon\)</li><li>전류 \(\varepsilon/R\), 전위차 0</li><li>전류 \(\varepsilon/2R\), 전위차 \(\varepsilon/2\)</li><li>전류가 끝없이 커진다</li></ol><details><summary>답</summary><div class="ans">\(e^{-t/RC}\to0\) → \(i\to0\), \(q\to C\varepsilon\), \(V_C\to\varepsilon\). 가득 찬 축전기는 끊긴 도선처럼 전류를 막는다.</div></details></div>
  <div class="q"><div class="qn">기초 6-5 · 방전 절반</div><p>RC 방전 회로에서 축전기 전하가 처음의 절반이 되는 시간은?</p><ol class="choices"><li data-ok="1">\(RC\ln2\)</li><li>\(RC/2\)</li><li>\(2RC\)</li><li>\(RC\ln\frac12\)</li></ol><details><summary>답</summary><div class="ans">\(q_0e^{-t/RC}=\frac12q_0\) → \(e^{-t/RC}=\frac12\) → 양변 ln: \(-t/RC=-\ln2\) → \(t=RC\ln2\approx0.69RC\). \(RC\ln\frac12\)은 음수라 시간이 될 수 없다.</div></details></div>
  <div class="q"><div class="qn">기초 6-6 · 축전기 두 개 직렬</div><p>2.0 μF과 8.0 μF 축전기를 직렬로 잇고 0.20 MΩ 저항과 연결한 RC 회로의 시간 상수는?</p><ol class="choices"><li data-ok="1">0.32 s</li><li>2.0 s</li><li>0.40 s</li><li>1.6 s</li></ol><details><summary>답</summary><div class="ans">25장: 직렬 축전기는 \(\dfrac1{C_{eq}}=\dfrac1{C_1}+\dfrac1{C_2}\) → \(C_{eq}=\dfrac{2.0\times8.0}{10}=1.6\ \mu\)F. \(\tau=RC_{eq}=0.20\times10^6\times1.6\times10^{-6}=0.32\) s. 병렬처럼 더하면(10 μF) 2.0 s가 나온다.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제</h3>
  <div class="q"><div class="qn a">응용 6-1 · RC 충전과 방전 한 세트</div><p>비어 있는 축전기(전기 용량 50 μF), 저항 200 kΩ, 기전력 12 V인 이상적 전지와 스위치가 직렬로 연결되어 있다. ① 스위치를 닫은 뒤 전류 \(i\), 축전기 전하 \(q\)로 전압법칙 식을 쓰라. ② 시간 상수와 그 뜻 ③ 축전기에 쌓이는 최대 전하 ④ 스위치를 닫고 5.0 s 뒤의 전류 ⑤ 가득 찬 뒤 전지를 빼고 같은 저항으로 방전시킬 때 전하가 처음의 1/3이 되는 시간을 구하라.</p><details><summary>답</summary><div class="ans">① \(\varepsilon-\dfrac qC-iR=0\). ② \(\tau=RC=2.0\times10^5\times5.0\times10^{-5}=10\) s — 최대 전하의 \(1-1/e\approx63\%\)까지 차는 시간. ③ \(q_{max}=C\varepsilon=5.0\times10^{-5}\times12=6.0\times10^{-4}\) C. ④ \(i=\dfrac\varepsilon Re^{-t/\tau}=\dfrac{12}{2.0\times10^5}e^{-5/10}=6.0\times10^{-5}e^{-1/2}\approx3.6\times10^{-5}\) A. ⑤ \(q_0e^{-t/\tau}=\frac13q_0\) → \(t=\tau\ln3=10\ln3\approx11\) s.</div></details></div>
  <div class="q"><div class="qn a">응용 6-2 · 스위치를 열 때</div><p>그림 회로(\(\varepsilon=12\) V, \(R_1=2\ \Omega\), \(R_2=4\ \Omega\), \(R_3=2\ \Omega\), 전기 용량 \(C=1.0\) F)에서 스위치 S를 오랫동안 닫아 두어 축전기가 완전히 충전되었다. ① 각 저항의 전류 ② 축전기 전하 ③ \(t=0\)에 S를 열 때 \(R_2\)를 지나는 전류를 시간의 함수로 ④ 축전기 전하가 처음의 1/4이 되는 시간을 구하라.</p>@@F_Q_RCSW@@<details><summary>답</summary><div class="ans">① 오래 지나 충전이 끝나면 축전기 갈래(\(R_3\)–\(C\))에는 전류가 없다. 전류는 \(R_1\) → \(R_2\)로만: \(I_1=I_2=\dfrac{12}{2+4}=2.0\) A, \(I_3=0\). ② 축전기 전위차 = \(R_2\) 전위차(\(R_3\)에 전류가 없어 전위 변화 0) \(=2.0\times4=8.0\) V → \(Q=CV=1.0\times8.0=8.0\) C. ③ S를 열면 전지 쪽 길이 끊겨, 축전기가 \(R_3\)와 \(R_2\)를 직렬로 지나 방전한다: \(\tau=(R_2+R_3)C=6.0\) s. \(q(t)=8.0e^{-t/6}\) C. 축전기의 +판(위, \(R_3\) 쪽)에서 나온 전류가 \(R_3\) → P → \(R_2\)를 지나 아래 접합점으로 흐르므로 \(R_2\)에서는 P에서 아래로: \(i_2(t)=\left|\dfrac{dq}{dt}\right|=\dfrac{8.0}{6.0}e^{-t/6}=\dfrac43e^{-t/6}\) A. ④ \(e^{-t/6}=\frac14\) → \(t=6\ln4=12\ln2\approx8.3\) s.</div></details></div>
  <div class="q" data-def="C"><div class="qn a">응용 6-3 · 두 전위차가 같아지는 때</div><p>저항 5.0 kΩ, 전기 용량 \(C=2.0\ \mu\)F, 기전력 10 V인 RC 직렬 충전 회로가 있다. 처음 축전기는 비어 있고 \(t=0\)에 스위치를 닫는다. (a) 축전기 전위차와 저항 전위차가 같아지는 시각 (b) 축전기가 최대 전하의 99%까지 차는 시각을 구하라.</p><details><summary>답</summary><div class="ans">\(\tau=RC=5.0\times10^3\times2.0\times10^{-6}=0.010\) s. (a) \(V_C=V_R\) ↔ \(\varepsilon(1-e^{-t/\tau})=\varepsilon e^{-t/\tau}\) ↔ \(e^{-t/\tau}=\frac12\) → \(t=\tau\ln2\approx6.9\times10^{-3}\) s. (b) \(1-e^{-t/\tau}=0.99\) → \(e^{-t/\tau}=0.01\) → \(t=\tau\ln100=2\tau\ln10\approx0.046\) s(약 \(4.6\tau\)).</div></details></div>
</section>
"""

TAIL = "\n</body>\n</html>\n"

def build():
    body = HEAD + P1 + P2 + P3 + P4 + P5 + P6 + TAIL
    rep = {"@@F_WIRE@@": F_WIRE, "@@F_ROD@@": F_ROD, "@@F_VI@@": F_VI, "@@F_LOOP@@": F_LOOP, "@@F_SIGN@@": F_SIGN,
           "@@F_SP@@": F_SP, "@@F_TWO@@": F_TWO, "@@F_RC@@": F_RC, "@@F_RCG@@": F_RCG,
           "@@F_Q_TWOBAT@@": F_Q_TWOBAT, "@@F_Q_OPEN@@": F_Q_OPEN, "@@F_Q_TWO@@": F_Q_TWO, "@@F_Q_BULBS@@": F_Q_BULBS,
           "@@F_Q_SP@@": F_Q_SP, "@@F_Q_RCSW@@": F_Q_RCSW}
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
