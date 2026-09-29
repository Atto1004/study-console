# -*- coding: utf-8 -*-
"""김주영 스앵님 동작 시트(흰 바탕, 전신 한 줄) → 기존 전신 포즈(pose-point.png)와 같은 캔버스·같은 키·같은 발 위치·같은 몸 중심의 PNG
대표님 2026-09-29 「팔은 안 움직이고 멀뚱히 서 있다 → 움직임·표정」: 교실은 말하는 동안 이 그림들을 교차 페이드로 바꾼다 — 크기나 위치가 어긋나면 사람이 튀어 보이므로
기준 그림에 맞춘다: 키(머리 끝~발끝) · 발 바닥 줄 · 다리 폭의 가운데(키의 85% 높이 줄에서 불투명 픽셀의 좌우 끝 가운데).
사용: python tutor_gesture_cut.py <sheet.png> <out_dir> --names=pose-talk,pose-stress,... [--ref=notes/classroom/assets/tutor/pose-point.png] [--contact=<png>]
결과: <out_dir>/<name>.png (기준과 같은 크기) · 캔버스 밖으로 잘린 부분(동작 손·지시봉 끝) 픽셀 수 보고"""
import os, sys
import numpy as np
from PIL import Image

def to_alpha(img):
    im = img.convert("RGBA"); a = np.asarray(im).astype(np.float32)
    if a[..., 3].min() < 250: return im   # 이미 투명
    d = np.sqrt(((255 - a[..., :3]) ** 2).sum(-1)); a[..., 3] = np.clip((d - 8) / 32.0, 0, 1) * 255
    return Image.fromarray(a.astype(np.uint8), "RGBA")

def bands(profile, min_gap, thr):
    on = profile > thr; out = []; s = None; gap = 0
    for i, v in enumerate(on):
        if v:
            if s is None: s = i
            gap = 0
        elif s is not None:
            gap += 1
            if gap >= min_gap: out.append((s, i - gap + 1)); s = None; gap = 0
    if s is not None: out.append((s, len(on)))
    return out

def metrics(rgba):
    A = np.asarray(rgba)[..., 3] > 60
    ys = np.where(A.any(1))[0]; xs = np.where(A.any(0))[0]
    top, bot = int(ys[0]), int(ys[-1]); h = bot - top
    row = top + int(h * 0.85); r = np.where(A[row])[0]
    cx = (r[0] + r[-1]) / 2.0 if len(r) else (xs[0] + xs[-1]) / 2.0
    return {"top": top, "bot": bot, "h": h, "cx": cx, "x0": int(xs[0]), "x1": int(xs[-1])}

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    opts = {k[2:].split("=")[0]: (k.split("=", 1)[1] if "=" in k else "1") for k in sys.argv[1:] if k.startswith("--")}
    sheet, out = args[0], args[1]; os.makedirs(out, exist_ok=True)
    names = opts["names"].split(",")
    ref = Image.open(opts.get("ref", "notes/classroom/assets/tutor/pose-point.png")).convert("RGBA"); W, H = ref.size; R = metrics(ref)
    # --canvas=640x1000 --anchor=260: 기준 그림과 같은 키·발 줄, 다리 가운데를 anchor 에 — 팔을 양옆으로 벌린 동작이 잘리지 않게 넓은 캔버스(교실 동작 세트 assets/tutor/g/)
    if "canvas" in opts: W, H = [int(x) for x in opts["canvas"].split("x")]
    if "anchor" in opts: R = dict(R, cx=float(opts["anchor"]))
    im = to_alpha(Image.open(sheet)); A = np.asarray(im)[..., 3] > 60; Hh = A.shape[0]
    # (Pillow 12: fromarray 로 만든 그림은 numpy 버퍼를 빌려 써서 floodfill 이 조용히 무시된다 → .copy() 필수)
    # 인물 나누기: 세로 빈 줄로는 못 나눈다(지시봉 끝과 옆 사람 팔꿈치가 같은 열에 걸침, 2026-09-29 시트) →
    # 아래쪽(다리) 열 무리로 인물 수를 세고, 인물마다 다리 픽셀 하나를 씨앗으로 연결 영역 채우기(PIL floodfill, 4-연결)
    y_low = int(Hh * 0.62)
    legs = [b for b in bands(A[y_low:].sum(0), min_gap=4, thr=1) if b[1] - b[0] > im.width * 0.004]
    figs = []
    for b in legs:
        if figs and b[0] - figs[-1][1] < im.width * 0.025: figs[-1] = (figs[-1][0], b[1])   # 한 사람의 두 다리
        else: figs.append(b)
    assert len(figs) == len(names), f"인물 {len(figs)}명 ≠ 이름 {len(names)}개: {figs}"
    from PIL import ImageDraw
    lab = Image.fromarray((A * 255).astype(np.uint8), "L").copy(); comps = []
    for (x0, x1) in figs:
        ys, xs = np.nonzero(A[y_low:, x0:x1]); k = len(ys) // 2; seed = (int(xs[k] + x0), int(ys[k] + y_low))
        ImageDraw.floodfill(lab, seed, 128); L = np.asarray(lab) == 128; comps.append(L.copy())
        lab = Image.fromarray(np.where(L, 0, np.asarray(lab)).astype(np.uint8), "L").copy()   # 채운 사람은 지워 다음 채우기와 섞이지 않게
    # 어느 사람에도 안 붙은 조각(손과 한두 픽셀 끊긴 지시봉 · 귀걸이 반짝임) → 조각마다 「가장 가까운 사람 몸 픽셀」에게. 다리 중심 거리로 붙였더니 지시봉이 옆 사람에게 갔다(2026-09-29)
    def edge(m):
        e = m.copy(); e[1:, :] &= m[:-1, :]; e[:-1, :] &= m[1:, :]; e[:, 1:] &= m[:, :-1]; e[:, :-1] &= m[:, 1:]
        return m & ~e
    rng = np.random.default_rng(0)
    bnd = []
    for c in comps:
        yy, xx = np.nonzero(edge(c)); k = rng.choice(len(yy), size=min(len(yy), 8000), replace=False); bnd.append(np.stack([yy[k], xx[k]], 1).astype(np.float32))
    rimg = Image.fromarray(((np.asarray(lab) == 255) * 255).astype(np.uint8), "L").copy()
    while True:
        R0 = np.asarray(rimg) == 255
        if not R0.any(): break
        ys, xs = np.nonzero(R0); ImageDraw.floodfill(rimg, (int(xs[0]), int(ys[0])), 128); blob = np.asarray(rimg) == 128
        by, bx = np.nonzero(blob); k = rng.choice(len(by), size=min(len(by), 300), replace=False); P = np.stack([by[k], bx[k]], 1).astype(np.float32)
        dist = [float(np.sqrt(((P[:, None, :] - B[None, :, :]) ** 2).sum(-1)).min()) for B in bnd]
        i = int(np.argmin(dist))
        if dist[i] <= 80: comps[i] |= blob   # 멀리 떨어진 먼지는 버린다
        rimg = Image.fromarray(np.where(blob, 0, np.asarray(rimg)).astype(np.uint8), "L").copy()
    arr = np.asarray(im); tiles = []
    for comp, name in zip(comps, names):
        ys, xs = np.nonzero(comp); x0, x1 = int(xs.min()), int(xs.max())
        one = arr.copy(); one[..., 3] = np.where(comp, one[..., 3], 0)
        cell = Image.fromarray(one, "RGBA").crop((max(0, x0 - 4), 0, min(im.width, x1 + 5), im.height)); M = metrics(cell)
        s = R["h"] / M["h"]; sc = cell.resize((max(1, round(cell.width * s)), max(1, round(cell.height * s))), Image.LANCZOS)
        dx = round(R["cx"] - M["cx"] * s); dy = round(R["bot"] - M["bot"] * s)
        canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0)); canvas.alpha_composite(sc, (dx, dy)) if dx >= 0 and dy >= 0 else canvas.paste(sc, (dx, dy), sc)
        # 캔버스 밖으로 나간 불투명 픽셀
        SA = np.asarray(sc)[..., 3] > 60; ys, xs = np.nonzero(SA); gx, gy = xs + dx, ys + dy
        lost = int(((gx < 0) | (gx >= W) | (gy < 0) | (gy >= H)).sum())
        canvas.save(os.path.join(out, name + ".png"), optimize=True); tiles.append(canvas)
        print(f"{name}: 칸 {x0}-{x1} · 키 {M['h']}→{R['h']} (×{s:.3f}) · 다리 가운데 {M['cx']:.0f}→{R['cx']:.0f} · 캔버스 밖 {lost}px")
    if "contact" in opts:
        refs = [Image.open(os.path.join(os.path.dirname(opts.get("ref", "")) or ".", n + ".png")).convert("RGBA") for n in ("pose-point", "pose-book", "pose-cross") if os.path.exists(os.path.join(os.path.dirname(opts.get("ref", "")) or ".", n + ".png"))]
        allt = refs + tiles; cs = Image.new("RGBA", (W * len(allt), H), (40, 70, 55, 255))
        for i, t in enumerate(allt): cs.alpha_composite(t, (i * W, 0))
        cs.convert("RGB").save(opts["contact"]); print("contact", opts["contact"])

if __name__ == "__main__":
    main()
