# -*- coding: utf-8 -*-
"""스티커 시트(종이 위 스티커, 흰 테두리 + 회색 그림자) → 스티커별 투명 PNG.
배경 제거 도구는 종이 카드까지 전경으로 남기고, 흰색 거리로 자르면 스티커의 흰 테두리까지 사라진다 → 색(채도)과 어두움으로 스티커 본체만 뽑고, 흰 테두리는 다시 그린다.
사용: python docs/tools/sticker_cut.py <sheet.png> <out_dir> --names=star,flame,heart,trophy,rosette,laurel [--size=256] [--outline=6]"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter

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

def main():
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    opts = {k[2:].split("=")[0]: (k.split("=", 1)[1] if "=" in k else "1") for k in sys.argv[1:] if k.startswith("--")}
    src, out = args[0], args[1]; os.makedirs(out, exist_ok=True)
    names = opts.get("names", "star,flame,heart,trophy,rosette,laurel").split(",")
    size = int(opts.get("size", "256")); outline = int(opts.get("outline", "6"))
    im = Image.open(src).convert("RGB"); hsv = np.asarray(im.convert("HSV")).astype(np.float32) / 255.0
    S, V = hsv[..., 1], hsv[..., 2]
    body = ((S > 0.22) | (V < 0.55)).astype(np.uint8) * 255      # 색이 있거나 어두운 곳 = 스티커 본체(흰 종이·회색 그림자 제외)
    m = Image.fromarray(body, "L").filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))   # 안쪽 흰 하이라이트 메우기(닫힘)
    M = np.asarray(m).astype(np.float32) / 255.0
    H, W = M.shape
    rows = bands(M.sum(1), max(6, H // 60), W * 0.01)
    cells = []
    for (r0, r1) in rows:
        sub = M[r0:r1]
        for (c0, c1) in bands(sub.sum(0), max(6, W // 60), (r1 - r0) * 0.01):
            blk = sub[:, c0:c1]; ys, xs = np.where(blk > 0.5)
            if len(xs) == 0 or (xs.max() - xs.min()) < W * 0.04 or (ys.max() - ys.min()) < H * 0.04: continue   # 종이 가장자리 그림자 같은 가는 띠 제외
            cells.append((c0 + xs.min(), r0 + ys.min(), c0 + xs.max() + 1, r0 + ys.max() + 1))
    print(f"행 {len(rows)} · 스티커 {len(cells)}:", [f"{c[2]-c[0]}x{c[3]-c[1]}" for c in cells])
    if len(cells) != len(names): print("스티커 수 ≠ 이름 수"); sys.exit(1)
    rgb = np.asarray(im)
    for name, (x0, y0, x1, y1) in zip(names, cells):
        pad = outline + 4
        x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)
        mask = Image.fromarray((M[y0:y1, x0:x1] * 255).astype(np.uint8), "L")
        edge = mask.filter(ImageFilter.GaussianBlur(0.8))                                  # 본체 가장자리 살짝 부드럽게
        ring = mask.filter(ImageFilter.MaxFilter(2 * outline + 1)).filter(ImageFilter.GaussianBlur(0.8))   # 흰 테두리 = 본체를 outline 만큼 키운 것
        layer = Image.new("RGBA", mask.size, (255, 255, 255, 0)); white = Image.new("RGBA", mask.size, (255, 255, 255, 255))
        layer.paste(white, (0, 0), ring)
        bodyimg = Image.fromarray(rgb[y0:y1, x0:x1]).convert("RGBA"); bodyimg.putalpha(edge)
        layer = Image.alpha_composite(layer, bodyimg)
        layer = layer.crop(layer.getbbox()); w, h = layer.size; k = size / max(w, h)
        layer = layer.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
        cv = Image.new("RGBA", (size, size), (0, 0, 0, 0)); cv.paste(layer, ((size - layer.width) // 2, (size - layer.height) // 2), layer)
        cv.save(os.path.join(out, name + ".png")); print(name, layer.size, os.path.getsize(os.path.join(out, name + ".png")) // 1024, "KB")
    sheet = Image.new("RGBA", (size * len(names), size), (47, 93, 75, 255))   # 칠판색 위 대조표(흰 테두리 확인용)
    for i, n in enumerate(names): sheet.paste(Image.open(os.path.join(out, n + ".png")), (size * i, 0), Image.open(os.path.join(out, n + ".png")))
    sheet.save(os.path.join(out, "contact.png"))

if __name__ == "__main__":
    main()
