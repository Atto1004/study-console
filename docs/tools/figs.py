# -*- coding: utf-8 -*-
"""수업 노트 그림 조각 — 인라인 SVG 생성기 (대표님 2026-09-26: 아톰이 그린 그림만 공개 저장소에).
색: 양전하 빨강 #E03131 · 음전하 파랑 #1971C2 · 전기장/힘 초록 #2F9E44 · 가우스면 분홍 점선 #FF4D8D · 선·글자 남색 #1F2A44 · 보조 회색 #8A97A6.
모든 함수는 SVG 조각 문자열을 돌려준다. canvas() 로 감싼다."""
INK = "#1F2A44"; RED = "#E03131"; BLUE = "#1971C2"; GREEN = "#2F9E44"; PINK = "#FF4D8D"; GRAY = "#8A97A6"; YEL = "#F59F00"
import re as _re
def _sub(t):
    """SVG 라벨의 `U_y` · `r_AB` · `q_{enc}` 를 진짜 아래첨자(tspan)로, 벡터 결합 화살표(a⃗)·모자(n̂)는 굵은 글자 + 작은 위첨자로.
    결합 문자는 Pretendard 에서 깨져 보이므로 SVG 텍스트에 그대로 두지 않는다. 캡션(KaTeX)에는 쓰지 않는다."""
    s = _re.sub(r'([A-Za-z]+)⃗', lambda m: '<tspan font-weight="700">' + m.group(1) + '</tspan><tspan baseline-shift="super" font-size="62%">→</tspan>', str(t))
    s = _re.sub(r'([A-Za-z])̂', lambda m: '<tspan font-weight="700">' + m.group(1) + '</tspan><tspan baseline-shift="super" font-size="62%">^</tspan>', s)
    return _re.sub(r'_\{([^}]+)\}|_([A-Za-z0-9]+)', lambda m: '<tspan baseline-shift="sub" font-size="72%">' + (m.group(1) or m.group(2)) + '</tspan>', s)

def _fit(t, size, maxw):
    """라벨이 상자보다 넓으면 글자 크기를 줄인다(폭 어림: 라틴 0.56em · 한글 0.98em · 기호 0.6em)"""
    est = sum((0.98 if ord(ch) > 0x2E7F else 0.56 if ch.isalnum() else 0.6) for ch in _re.sub(r'<[^>]+>', '', str(t))) * size
    return round(size * maxw / est, 1) if est > maxw else size

def band(x1, y1, x2, y2, w=8, color=None, alpha=.16):
    """글자 위를 지나는 대각선 대신 쓰는 반투명 띠(획 없음) — 사루스 대각선·지우기 표시 등"""
    import math
    c = color or GREEN; dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1
    nx, ny = -dy / L * w / 2, dx / L * w / 2
    pts = [(x1 + nx, y1 + ny), (x2 + nx, y2 + ny), (x2 - nx, y2 - ny), (x1 - nx, y1 - ny)]
    return '<path d="M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + f' Z" fill="{c}" fill-opacity="{alpha}" stroke="none"/>'

def canvas(w, h, *parts, cap="", name=""):
    """name 을 주면 <figure data-fig="name"> — 교실 v2 판서 파일(BOARD)이 그림을 이름으로 가리킨다"""
    body = "".join(parts)
    defs = ('<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
            '<path d="M0 0 L10 5 L0 10 z" fill="context-stroke"/></marker></defs>')
    svg = (f'<svg class="fig-svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" xmlns="http://www.w3.org/2000/svg" '
           f'font-family="Pretendard,-apple-system,sans-serif" font-size="14" fill="{INK}">{defs}{body}</svg>')
    attr = f' data-fig="{name}"' if name else ""
    return f'<figure class="fig"{attr}>{svg}' + (f'<figcaption>{cap}</figcaption>' if cap else "") + '</figure>'

def step(n, *parts):
    """교실 v2 단계 애니메이션: 감싼 요소들이 그림 단계 n 에서 나타난다(<g data-step="n">). 읽기용 노트에서는 그냥 그룹."""
    return f'<g data-step="{int(n)}">' + "".join(parts) + '</g>'

def charge(x, y, sign="+", label="", r=14, color=None):
    c = color or (RED if sign == "+" else BLUE)
    fs = 16 if r >= 13 else round(r * 1.15)   # 작은 원에서는 기호가 원 테두리를 넘지 않게
    s = f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff"/><circle cx="{x}" cy="{y}" r="{r}" fill="{c}" fill-opacity=".15" stroke="{c}" stroke-width="2"/>'
    s += f'<text x="{x}" y="{y + fs * .32:.1f}" text-anchor="middle" font-size="{fs}" font-weight="700" fill="{c}">{sign}</text>'
    if label: s += f'<text x="{x}" y="{y+r+16}" text-anchor="middle" font-size="13" fill="{INK}">{_sub(_esc(label))}</text>'
    return s

def dot(x, y, label="", r=4, color=None, dy=-8):
    c = color or INK
    s = f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>'
    if label: s += f'<text x="{x+8}" y="{y+dy+8}" font-size="13" fill="{c}">{_sub(_esc(label))}</text>'
    return s

def arrow(x1, y1, x2, y2, color=None, label="", w=2, lx=0, ly=-6, dash=""):
    c = color or GREEN
    d = f' stroke-dasharray="{dash}"' if dash else ""
    s = f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}" marker-end="url(#ah)"{d}/>'
    if label: s += f'<text x="{(x1+x2)/2+lx}" y="{(y1+y2)/2+ly}" text-anchor="middle" font-size="13" fill="{c}">{_sub(_esc(label))}</text>'
    return s

def line(x1, y1, x2, y2, color=None, w=2, dash=""):
    c = color or INK
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}"{d}/>'

def _esc(t):
    """라벨의 < > & 를 이스케이프한다 — 안 하면 「r<a」 의 <a 가 브라우저에서 태그로 읽혀 라벨이 사라지고 뒤 요소까지 깨진다(일물2 9/16 에서 발견). 이미 넣은 tspan 마크업은 없다(모든 라벨은 순수 글자)."""
    return str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def text(x, y, t, size=14, color=None, anchor="start", bold=False):
    """글자에는 흰 테두리(halo)를 둘러 선 옆에서도 읽히게 한다 — 겹침 자체는 fig_check 로 0건을 만든다"""
    c = color or INK
    return (f'<text x="{x}" y="{y}" font-size="{size}" fill="{c}" text-anchor="{anchor}"{" font-weight=\"700\"" if bold else ""}'
            f' paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round">{_sub(_esc(t))}</text>')

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

def radial(x, y, n=8, r0=18, r1=48, color=None, inward=False, a0=0):
    import math
    c = color or GREEN; s = ""
    for i in range(n):
        a = 2 * math.pi * i / n + math.radians(a0)
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
    """평행판: 가로 판 + 전하 기호 n개 (기호 크기는 판 두께에 맞춰 테두리를 넘지 않게)"""
    c = RED if sign == "+" else BLUE
    s = rect(x, y, w, h, INK, fill="#F1F3F5", sw=1.5)
    fs = max(8, round(h * .6))
    for i in range(n):
        s += text(x + w * (i + .5) / n, y + h / 2 + fs * .34, sign, fs, c, "middle", True)
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
    # x 축 라벨은 화살촉 왼쪽·살짝 위(캔버스 아래로 나가지 않게)
    s += text(ox + L + 6, oy + 5, yl, 13, c) + text(ox - 4, oy - L - 6, zl, 13, c, "end") + text(ox - L * .6 - 6, oy + L * .5 - 10, xl, 13, c, "end")
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

# ---- 공업수학용 (2026-09-26): 그래프 · 흐름도 ----
def polyline(pts, color=None, w=2, dash="", close=False):
    c = color or INK
    if not pts: return ""
    d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + (" Z" if close else "")
    return path(d, c, w, dash=dash)

def fplot(fn, x0, x1, X, Y, n=80, color=None, w=2.2, dash="", ylim=None):
    """fn(x) 의 그래프. X(x)·Y(y) 는 수학 좌표 → 화면 좌표 함수. ylim=(lo,hi) 밖은 끊는다"""
    pts = []; out = ""
    for i in range(n + 1):
        x = x0 + (x1 - x0) * i / n
        try: y = fn(x)
        except Exception: y = None
        if y is None or y != y or abs(y) > 1e6 or (ylim and not (ylim[0] <= y <= ylim[1])):
            if pts: out += polyline(pts, color, w, dash); pts = []
            continue
        pts.append((X(x), Y(y)))
    return out + polyline(pts, color, w, dash)

def fbox(x, y, w, h, label, color=None, fill=None, size=13, sub="", bold=True):
    """흐름도 상자: label 가운데, sub 는 아래 작은 글씨. 글자가 상자보다 넓으면 자동으로 줄인다"""
    c = color or INK
    s = rect(x, y, w, h, c, fill=fill or "rgba(255,255,255,.75)", sw=1.6, rx=9)
    size = _fit(label, size, w - 14)
    s += text(x + w / 2, y + h / 2 + (5 if not sub else -2), label, size, c, "middle", bold)
    if sub: s += text(x + w / 2, y + h / 2 + 14, sub, _fit(sub, 11, w - 12), GRAY, "middle")
    return s

def mat(x, y, rows, cw=30, ch=26, color=None, size=13, hl=None, bars=False):
    """행렬 그림(대괄호) / bars=True 면 행렬식(세로줄). rows=[[...],[...]], hl=(i,j) 강조 칸. 성분의 _ 는 아래첨자"""
    c = color or INK; s = ""
    n = len(rows); m = max(len(r) for r in rows); W = m * cw; H = n * ch
    if bars: s += line(x, y, x, y + H, c, 1.8) + line(x + W, y, x + W, y + H, c, 1.8)
    else: s += path(f"M{x+8} {y} L{x} {y} L{x} {y+H} L{x+8} {y+H}", c, 1.8) + path(f"M{x+W-8} {y} L{x+W} {y} L{x+W} {y+H} L{x+W-8} {y+H}", c, 1.8)
    for i, r in enumerate(rows):
        for j, v in enumerate(r):
            if hl and (i, j) in (hl if isinstance(hl, list) else [hl]): s += rect(x + j * cw + 3, y + i * ch + 2, cw - 6, ch - 4, RED, fill="rgba(224,49,49,.12)", sw=1, rx=4)
            s += text(x + j * cw + cw / 2, y + i * ch + ch / 2 + 5, str(v), size, c, "middle")
    return s

def diamond(cx, cy, w, h, label, color=None, size=12.5):
    c = color or INK
    s = path(f"M{cx} {cy - h/2} L{cx + w/2} {cy} L{cx} {cy + h/2} L{cx - w/2} {cy} Z", c, 1.6, "rgba(255,255,255,.75)")
    return s + text(cx, cy + 5, label, size, c, "middle", True)

# ---- 회로도 (2026-09-30, 일물2 26·27장) ----
# 부품은 가로·세로 선분 (x1,y1)→(x2,y2) 위에만 놓는다. 그 구간 전체가 부품 자리이고 몸체는 가운데에 그린다(양옆은 전선).
# 라벨 자리 lpos: t 위 · b 아래 · l 왼쪽 · r 오른쪽. 전류 화살표는 빨강, 고리 방향은 초록.
def _axis(x1, y1, x2, y2):
    if y1 == y2 and x1 != x2: return "h", (1 if x2 > x1 else -1)
    if x1 == x2 and y1 != y2: return "v", (1 if y2 > y1 else -1)
    raise ValueError("회로 부품은 가로·세로 선분에만 놓는다")

def _lab(mx, my, pos, gap, label, size, c):
    if not label: return ""
    if pos == "t": return text(mx, my - gap, label, size, c, "middle")
    if pos == "b": return text(mx, my + gap + size * .8, label, size, c, "middle")
    if pos == "r": return text(mx + gap, my + size * .35, label, size, c, "start")
    return text(mx - gap, my + size * .35, label, size, c, "end")

def wire(*pts, color=None, w=2):
    """전선 — 꺾은선 (x,y) 점들"""
    return polyline(list(pts), color or INK, w)

def junction(x, y, label="", color=None, lpos="tr", size=13):
    """접합점(검은 점) + 이름. lpos 는 tr·tl·br·bl"""
    c = color or INK
    s = f'<circle cx="{x}" cy="{y}" r="3.6" fill="{c}"/>'
    if label:
        dx = 7 if "r" in lpos else -7; dy = -7 if "t" in lpos else 17
        s += text(x + dx, y + dy, label, size, c, "start" if dx > 0 else "end", True)
    return s

def terminal(x, y, label="", color=None, lpos="r", size=13):
    """열린 단자(속이 빈 원) — 아무것도 연결되지 않은 끝"""
    c = color or INK
    return f'<circle cx="{x}" cy="{y}" r="4" fill="#fff" stroke="{c}" stroke-width="2"/>' + _lab(x, y, lpos, 11, label, size, c)

def resistor(x1, y1, x2, y2, label="", color=None, lpos=None, body=40, n=6, amp=7, size=13):
    """지그재그 저항. 라벨 기본 자리: 가로면 위, 세로면 오른쪽"""
    c = color or INK
    ax, sg = _axis(x1, y1, x2, y2)
    L = abs(x2 - x1) + abs(y2 - y1); b = min(body, L * .7); lead = (L - b) / 2
    pts = [(x1, y1)]
    for k in range(n + 1):
        t = lead + b * k / n; off = 0 if k in (0, n) else (amp if k % 2 else -amp)
        pts.append((x1 + sg * t, y1 + off) if ax == "h" else (x1 + off, y1 + sg * t))
    pts.append((x2, y2))
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    return polyline(pts, c, 2) + _lab(mx, my, lpos or ("t" if ax == "h" else "r"), amp + 7, label, size, c)

def battery(x1, y1, x2, y2, label="", plus=2, color=None, lpos=None, size=13, sign=True):
    """전지: 긴 가는 판 = +극, 짧은 굵은 판 = −극. plus=1 이면 (x1,y1) 쪽 판이 +극, 2 면 (x2,y2) 쪽.
    「+」 표시는 라벨 반대편에 둔다(겹침 방지)"""
    c = color or INK
    ax, sg = _axis(x1, y1, x2, y2)
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2; g = 5
    if ax == "h":
        pa, pb = mx - sg * g, mx + sg * g
        lp, sp = (pa, pb) if plus == 1 else (pb, pa)
        pos = lpos or "b"
        s = line(x1, y1, pa, my, c) + line(pb, my, x2, y2, c)
        s += line(lp, my - 14, lp, my + 14, c, 2) + line(sp, my - 7, sp, my + 7, c, 4.5)
        if sign: s += text(lp + (-10 if lp < sp else 10), (my - 17) if pos != "t" else (my + 27), "+", 13, c, "middle", True)
        return s + _lab(mx, my, pos, 17, label, size, c)
    pa, pb = my - sg * g, my + sg * g
    lp, sp = (pa, pb) if plus == 1 else (pb, pa)
    pos = lpos or "l"
    s = line(x1, y1, mx, pa, c) + line(mx, pb, x2, y2, c)
    s += line(mx - 14, lp, mx + 14, lp, c, 2) + line(mx - 7, sp, mx + 7, sp, c, 4.5)
    if sign: s += text(mx + (21 if pos != "r" else -21), lp + (-4 if lp < sp else 14), "+", 13, c, "middle", True)
    return s + _lab(mx, my, pos, 20, label, size, c)

def capacitor(x1, y1, x2, y2, label="", color=None, lpos=None, size=13):
    """축전기: 같은 길이 두 판"""
    c = color or INK
    ax, sg = _axis(x1, y1, x2, y2)
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2; g = 5
    if ax == "h":
        pa, pb = mx - sg * g, mx + sg * g
        s = line(x1, y1, pa, my, c) + line(pb, my, x2, y2, c) + line(pa, my - 13, pa, my + 13, c, 3) + line(pb, my - 13, pb, my + 13, c, 3)
        return s + _lab(mx, my, lpos or "t", 19, label, size, c)
    pa, pb = my - sg * g, my + sg * g
    s = line(x1, y1, mx, pa, c) + line(mx, pb, x2, y2, c) + line(mx - 13, pa, mx + 13, pa, c, 3) + line(mx - 13, pb, mx + 13, pb, c, 3)
    return s + _lab(mx, my, lpos or "r", 19, label, size, c)

def switch(x1, y1, x2, y2, closed=False, label="S", color=None, lpos=None, size=13):
    """스위치: 두 접점(빈 원) + 칼날. 열림이면 칼날이 30° 들린다(가로는 위로, 세로는 오른쪽으로)"""
    c = color or INK
    ax, sg = _axis(x1, y1, x2, y2)
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2; h = 14
    if ax == "h":
        pa, pb = mx - sg * h, mx + sg * h
        s = line(x1, y1, pa, my, c) + line(pb, my, x2, y2, c)
        tip = (pb, my) if closed else (round(pa + sg * 2 * h * .87, 1), round(my - 2 * h * .5, 1))
        s += line(pa, my, tip[0], tip[1], c, 2.2)
        s += f'<circle cx="{pa}" cy="{my}" r="3.2" fill="#fff" stroke="{c}" stroke-width="2"/><circle cx="{pb}" cy="{my}" r="3.2" fill="#fff" stroke="{c}" stroke-width="2"/>'
        return s + _lab(mx, my, lpos or "t", 24, label, size, c)
    pa, pb = my - sg * h, my + sg * h
    s = line(x1, y1, mx, pa, c) + line(mx, pb, x2, y2, c)
    tip = (mx, pb) if closed else (round(mx + 2 * h * .5, 1), round(pa + sg * 2 * h * .87, 1))
    s += line(mx, pa, tip[0], tip[1], c, 2.2)
    s += f'<circle cx="{mx}" cy="{pa}" r="3.2" fill="#fff" stroke="{c}" stroke-width="2"/><circle cx="{mx}" cy="{pb}" r="3.2" fill="#fff" stroke="{c}" stroke-width="2"/>'
    return s + _lab(mx, my, lpos or "l", 12, label, size, c)

def bulb(x1, y1, x2, y2, label="", color=None, lpos=None, r=12, size=13):
    """전구: 원 + ×. 전선은 원 테두리에서 끊는다"""
    c = color or INK
    ax, sg = _axis(x1, y1, x2, y2)
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    if ax == "h": s = line(x1, y1, mx - sg * r, my, c) + line(mx + sg * r, my, x2, y2, c)
    else: s = line(x1, y1, mx, my - sg * r, c) + line(mx, my + sg * r, x2, y2, c)
    k = r * .7
    s += f'<circle cx="{mx}" cy="{my}" r="{r}" fill="#FFF9DB" stroke="{c}" stroke-width="2"/>'
    s += line(mx - k, my - k, mx + k, my + k, c, 1.6) + line(mx - k, my + k, mx + k, my - k, c, 1.6)
    return s + _lab(mx, my, lpos or ("t" if ax == "h" else "r"), r + 6, label, size, c)

def meter(x1, y1, x2, y2, letter="A", color=None, r=13):
    """전류계(A)·전압계(V): 원 안 글자. 전선은 원 테두리에서 끊어 글자 위로 선이 지나가지 않게"""
    c = color or INK
    ax, sg = _axis(x1, y1, x2, y2)
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    if ax == "h": s = line(x1, y1, mx - sg * r, my, c) + line(mx + sg * r, my, x2, y2, c)
    else: s = line(x1, y1, mx, my - sg * r, c) + line(mx, my + sg * r, x2, y2, c)
    return s + f'<circle cx="{mx}" cy="{my}" r="{r}" fill="#fff" stroke="{c}" stroke-width="2"/>' + f'<text x="{mx}" y="{my + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="{c}">{letter}</text>'

def current(x1, y1, x2, y2, label="i", color=None, lpos=None, size=13, gap=9):
    """전류 화살표(빨강) — 전선 위에 겹쳐 그린다. 라벨은 선 옆"""
    c = color or RED
    ax, sg = _axis(x1, y1, x2, y2)
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    return (f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="2.6" marker-end="url(#ah)"/>'
            + _lab(mx, my, lpos or ("t" if ax == "h" else "r"), gap, label, size, c))

def inductor(x1, y1, x2, y2, label="", color=None, lpos=None, n=4, r=6, size=13):
    """코일(유도기): 반원 n개. 가로는 위로, 세로는 오른쪽으로 볼록"""
    c = color or INK
    ax, sg = _axis(x1, y1, x2, y2)
    L = abs(x2 - x1) + abs(y2 - y1); b = 2 * r * n; lead = (L - b) / 2
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    sweep = 1 if sg > 0 else 0
    if ax == "h":
        x0 = x1 + sg * lead
        d = f"M{x1} {y1} L{x0} {y1}" + "".join(f" A {r} {r} 0 0 {sweep} {x0 + sg * 2 * r * (k + 1)} {y1}" for k in range(n)) + f" L{x2} {y2}"
        return path(d, c, 2) + _lab(mx, my, lpos or "t", r + 8, label, size, c)
    y0 = y1 + sg * lead
    d = f"M{x1} {y1} L{x1} {y0}" + "".join(f" A {r} {r} 0 0 {sweep} {x1} {y0 + sg * 2 * r * (k + 1)}" for k in range(n)) + f" L{x2} {y2}"
    return path(d, c, 2) + _lab(mx, my, lpos or "r", r + 8, label, size, c)

def ac_source(x1, y1, x2, y2, label="", color=None, lpos=None, r=14, size=13):
    """교류 전원: 원 + 사인 곡선(글자 없음). 전선은 원 테두리에서 끊는다"""
    c = color or INK
    ax, sg = _axis(x1, y1, x2, y2)
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    if ax == "h": s = line(x1, y1, mx - sg * r, my, c) + line(mx + sg * r, my, x2, y2, c)
    else: s = line(x1, y1, mx, my - sg * r, c) + line(mx, my + sg * r, x2, y2, c)
    s += f'<circle cx="{mx}" cy="{my}" r="{r}" fill="#fff" stroke="{c}" stroke-width="2"/>'
    s += path(f"M{mx - 8} {my} C{mx - 5} {my - 9} {mx - 1} {my - 9} {mx} {my} C{mx + 1} {my + 9} {mx + 5} {my + 9} {mx + 8} {my}", c, 1.8)
    return s + _lab(mx, my, lpos or ("t" if ax == "h" else "l"), r + 6, label, size, c)

def loop_dir(cx, cy, r=18, cw=True, color=None):
    """고리(순환) 방향 표시 — 원호 300° + 화살촉. cw=True 시계 방향"""
    c = color or GREEN
    k, h = round(r * .866, 1), round(r * .5, 1)
    if cw: d = f"M{cx - k} {cy - h} A {r} {r} 0 1 1 {cx - k} {cy + h}"
    else: d = f"M{cx + k} {cy - h} A {r} {r} 0 1 0 {cx + k} {cy + h}"
    return f'<path d="{d}" fill="none" stroke="{c}" stroke-width="2" marker-end="url(#ah)"/>'
