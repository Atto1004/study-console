# -*- coding: utf-8 -*-
"""김주영 스앵님 표정 시트(격자, 흰 바탕 또는 투명) → 표정별 PNG + 대조용 시트.
사용: python docs/tools/tutor_crop.py <sheet.png> <out_dir> [--bg=white|alpha] [--pick=0,1,2,4,5,6] [--names=neutral,sharp,smile,angry,wide,proud] [--fade=0.12]
  - 행을 먼저 나누고(행 투영의 빈 띠) 행마다 열을 나눈다(칸 수가 행마다 달라도 됨 — 4+3 같은 배치).
  - --pick 은 읽기 순서(왼→오, 위→아래) 칸 번호. 기본은 앞에서 6개.
  - 흰 바탕이면 배경을 알파로(흰색 거리 기반). 아래쪽은 --fade 비율만큼 알파를 서서히 0으로(격자 절단선을 감춤).
  - 결과: <out_dir>/<name>.png (같은 크기, 바닥 정렬, 여백 8) + contact.png"""
import os, sys
from PIL import Image
import numpy as np

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

def to_alpha(img, mode):
    im = img.convert("RGBA"); a = np.asarray(im).astype(np.float32)
    if mode == "alpha" and a[..., 3].min() < 250: return im
    rgb = a[..., :3]; d = np.sqrt(((255 - rgb) ** 2).sum(-1))
    a[..., 3] = np.clip((d - 8) / 32.0, 0, 1) * 255
    return Image.fromarray(a.astype(np.uint8), "RGBA")

def main():
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    opts = {k[2:].split("=")[0]: (k.split("=", 1)[1] if "=" in k else "1") for k in sys.argv[1:] if k.startswith("--")}
    src, out = args[0], args[1]; os.makedirs(out, exist_ok=True)
    names = opts.get("names", "neutral,sharp,smile,angry,wide,proud").split(",")
    fade = float(opts.get("fade", "0.12"))
    im = to_alpha(Image.open(src), opts.get("bg", "white"))
    A = np.asarray(im)[..., 3].astype(np.float32) / 255.0
    H, W = A.shape
    rows = bands(A.sum(1), max(4, H // 100), W * 0.01)
    cells = []
    ratio = float(opts.get("ratio", "0.85"))   # 칸 폭 = 행 높이 × ratio (어깨가 이웃과 닿아 있어도 머리 중심 기준으로 자른다)
    mode = opts.get("mode", "head")            # head = 머리 위치로 열 분할(어깨가 닿는 흉상 시트) · cols = 빈 띠로 열 분할 + 내용 상자(떨어져 있는 전신·스티커 시트)
    for (r0, r1) in rows:
        rh = r1 - r0; sub = A[r0:r1]
        if mode == "cols":
            for (c0, c1) in bands(sub.sum(0), max(4, W // 200), rh * 0.01):
                blk = sub[:, c0:c1]; ys, xs = np.where(blk > 0.05)
                if len(xs) == 0 or (xs.max() - xs.min()) < W * 0.04: continue
                cells.append((c0 + xs.min(), r0 + ys.min(), c0 + xs.max() + 1, r0 + ys.max() + 1))
            continue
        head = sub[: int(rh * 0.5)]   # 위쪽 절반(머리·목)에서만 열을 나눈다 — 아래쪽 어깨는 서로 닿는다
        for (c0, c1) in bands(head.sum(0), max(4, W // 200), rh * 0.5 * 0.01):
            if (c1 - c0) < W * 0.06: continue   # 부스러기 제외
            cx = (c0 + c1) / 2; cw = rh * ratio
            x0 = int(max(0, cx - cw / 2)); x1 = int(min(W, cx + cw / 2))
            cells.append((x0, r0, x1, r1))
    print(f"행 {len(rows)} · 칸 {len(cells)}:", [f"{c[2]-c[0]}x{c[3]-c[1]}" for c in cells])
    pick = [int(x) for x in opts["pick"].split(",")] if "pick" in opts else list(range(min(6, len(cells))))
    if len(pick) != len(names): print("pick 수 ≠ 이름 수"); sys.exit(1)
    faces = [im.crop(cells[i]) for i in pick]
    h = max(f.height for f in faces); w = max(f.width for f in faces)
    for name, f in zip(names, faces):
        canvas = Image.new("RGBA", (w + 16, h + 16), (0, 0, 0, 0))
        canvas.paste(f, ((w - f.width) // 2 + 8, h - f.height + 8), f)
        if fade > 0:   # 아래쪽 알파 페이드
            arr = np.asarray(canvas).astype(np.float32); n = int((h + 16) * fade)
            ramp = np.linspace(1, 0, n)[:, None]; arr[-n:, :, 3] *= ramp
            canvas = Image.fromarray(arr.astype(np.uint8), "RGBA")
        canvas.save(os.path.join(out, f"{name}.png"))
    sheet = Image.new("RGBA", ((w + 16) * len(names), h + 16), (255, 255, 255, 255))
    for i, name in enumerate(names): sheet.paste(Image.open(os.path.join(out, f"{name}.png")), ((w + 16) * i, 0))
    sheet.save(os.path.join(out, "contact.png"))
    print("표정", len(names), "장 →", out, f"({w + 16}×{h + 16})")

if __name__ == "__main__":
    main()
