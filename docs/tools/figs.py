# -*- coding: utf-8 -*-
"""수업 노트 그림 조각 — 인라인 SVG 생성기 (대표님 2026-09-26: 아톰이 그린 그림만 공개 저장소에).
색: 양전하 빨강 #E03131 · 음전하 파랑 #1971C2 · 전기장/힘 초록 #2F9E44 · 가우스면 분홍 점선 #FF4D8D · 선·글자 남색 #1F2A44 · 보조 회색 #8A97A6.
모든 함수는 SVG 조각 문자열을 돌려준다. canvas() 로 감싼다."""
INK = "#1F2A44"; RED = "#E03131"; BLUE = "#1971C2"; GREEN = "#2F9E44"; PINK = "#FF4D8D"; GRAY = "#8A97A6"; YEL = "#F59F00"
import re as _re
def _sub(t):
    """SVG 라벨의 `U_y` · `r_AB` · `q_{enc}` 를 진짜 아래첨자(tspan)로. 캡션(KaTeX)에는 쓰지 않는다."""
    return _re.sub(r'_\{([^}]+)\}|_([A-Za-z0-9]+)', lambda m: '<tspan baseline-shift="sub" font-size="72%">' + (m.group(1) or m.group(2)) + '</tspan>', str(t))

def canvas(w, h, *parts, cap=""):
    body = "".join(parts)
    defs = ('<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
            '<path d="M0 0 L10 5 L0 10 z" fill="context-stroke"/></marker></defs>')
    svg = (f'<svg class="fig-svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" xmlns="http://www.w3.org/2000/svg" '
           f'font-family="Pretendard,-apple-system,sans-serif" font-size="14" fill="{INK}">{defs}{body}</svg>')
    return f'<figure class="fig">{svg}' + (f'<figcaption>{cap}</figcaption>' if cap else "") + '</figure>'

def charge(x, y, sign="+", label="", r=14, color=None):
    c = color or (RED if sign == "+" else BLUE)
    s = f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}" fill-opacity=".15" stroke="{c}" stroke-width="2"/>'
    s += f'<text x="{x}" y="{y+5}" text-anchor="middle" font-size="16" font-weight="700" fill="{c}">{sign}</text>'
    if label: s += f'<text x="{x}" y="{y+r+16}" text-anchor="middle" font-size="13" fill="{INK}">{_sub(label)}</text>'
    return s

def dot(x, y, label="", r=4, color=None, dy=-8):
    c = color or INK
    s = f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>'
    if label: s += f'<text x="{x+8}" y="{y+dy+8}" font-size="13" fill="{c}">{_sub(label)}</text>'
    return s

def arrow(x1, y1, x2, y2, color=None, label="", w=2, lx=0, ly=-6, dash=""):
    c = color or GREEN
    d = f' stroke-dasharray="{dash}"' if dash else ""
    s = f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}" marker-end="url(#ah)"{d}/>'
    if label: s += f'<text x="{(x1+x2)/2+lx}" y="{(y1+y2)/2+ly}" text-anchor="middle" font-size="13" fill="{c}">{_sub(label)}</text>'
    return s

def line(x1, y1, x2, y2, color=None, w=2, dash=""):
    c = color or INK
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}"{d}/>'

def text(x, y, t, size=14, color=None, anchor="start", bold=False):
    c = color or INK
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{c}" text-anchor="{anchor}"{" font-weight=\"700\"" if bold else ""}>{_sub(t)}</text>'

def circle(x, y, r, color=None, dash="", fill="none", w=2):
    c = color or INK
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{c}" stroke-width="{w}"{d}/>'

def rect(x, y, w, h, color=None, dash="", fill="none", sw=2, rx=0):
    c = color or INK
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{c}" stroke-width="{sw}"{d}/>'

def gauss(x, y, r, label="가우스면"):
    return circle(x, y, r, PINK, dash="6 5") + (text(x + r + 6, y - r + 4, label, 12, PINK) if label else "")

def radial(x, y, n=8, r0=18, r1=48, color=None, inward=False):
    import math
    c = color or GREEN; s = ""
    for i in range(n):
        a = 2 * math.pi * i / n
        p0 = (x + r0 * math.cos(a), y + r0 * math.sin(a)); p1 = (x + r1 * math.cos(a), y + r1 * math.sin(a))
        if inward: p0, p1 = p1, p0
        s += arrow(round(p0[0], 1), round(p0[1], 1), round(p1[0], 1), round(p1[1], 1), c, w=1.6)
    return s

def axis(x0, y0, x1, y1, xl="", yl=""):
    s = arrow(x0, y0, x1, y0, INK, w=1.5) + arrow(x0, y0, x0, y1, INK, w=1.5)
    if xl: s += text(x1 - 4, y0 + 18, xl, 13, INK, "end")
    if yl: s += text(x0 - 6, y1 + 4, yl, 13, INK, "end")
    return s

def path(d, color=None, w=2, fill="none", dash=""):
    c = color or INK
    dd = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<path d="{d}" fill="{fill}" stroke="{c}" stroke-width="{w}"{dd}/>'

def plate(x, y, w, h, sign="+", n=6):
    """평행판: 가로 판 + 전하 기호 n개"""
    c = RED if sign == "+" else BLUE
    s = rect(x, y, w, h, INK, fill="#F1F3F5", sw=1.5)
    for i in range(n):
        s += text(x + w * (i + .5) / n, y + h / 2 + 5, sign, 13, c, "middle", True)
    return s

def brace_label(x1, x2, y, label, color=None):
    c = color or GRAY
    return (line(x1, y, x2, y, c, 1.2) + line(x1, y - 4, x1, y + 4, c, 1.2) + line(x2, y - 4, x2, y + 4, c, 1.2) +
            text((x1 + x2) / 2, y + 16, label, 12, c, "middle"))

# ---- 정역학용 (2026-09-26) ----
def axes3d(ox, oy, L=90, xl="x", yl="y", zl="z", color=None):
    """오른손 좌표계 사시도: z 위 · y 오른쪽 · x 앞(왼쪽 아래)"""
    c = color or INK
    s = arrow(ox, oy, ox + L, oy, c, w=1.5) + arrow(ox, oy, ox, oy - L, c, w=1.5) + arrow(ox, oy, ox - L * .6, oy + L * .5, c, w=1.5)
    s += text(ox + L + 6, oy + 5, yl, 13, c) + text(ox - 4, oy - L - 6, zl, 13, c, "end") + text(ox - L * .6 - 16, oy + L * .5 + 8, xl, 13, c)
    return s

def p3(ox, oy, x, y, z, s=1.0):
    """(x,y,z) → 사시도 화면 좌표 (y 오른쪽, z 위, x 는 왼쪽 아래)"""
    return (round(ox + y * s - x * s * .6, 1), round(oy - z * s + x * s * .5, 1))

def arc(cx, cy, r, a0, a1, color=None, w=1.5, label="", lr=None):
    """각도 호 (도 단위, 화면 좌표라 시계 방향이 +). label 은 호 중앙 바깥"""
    import math
    c = color or GRAY
    x0, y0 = cx + r * math.cos(math.radians(a0)), cy + r * math.sin(math.radians(a0))
    x1, y1 = cx + r * math.cos(math.radians(a1)), cy + r * math.sin(math.radians(a1))
    large = 1 if abs(a1 - a0) > 180 else 0; sweep = 1 if a1 > a0 else 0
    s = f'<path d="M{x0:.1f} {y0:.1f} A {r} {r} 0 {large} {sweep} {x1:.1f} {y1:.1f}" fill="none" stroke="{c}" stroke-width="{w}"/>'
    if label:
        am = math.radians((a0 + a1) / 2); rr = lr or (r + 12)
        s += text(round(cx + rr * math.cos(am), 1), round(cy + rr * math.sin(am) + 4, 1), label, 12, c, "middle")
    return s

def block(x, y, w, h, label="", color=None, fill="#F1F3F5"):
    c = color or INK
    return rect(x, y, w, h, c, fill=fill, sw=2, rx=6) + (text(x + w / 2, y + h / 2 + 5, label, 13, c, "middle", True) if label else "")
