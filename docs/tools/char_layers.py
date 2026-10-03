# -*- coding: utf-8 -*-
"""스앵님 레이어 자르기 (2026-10-04) — 힉스필드 변주를 기준 그림에 정합한 뒤 눈·입·표정 상자만 깃털 마스크로 잘라 PNG 레이어로.
사용: python docs/tools/char_layers.py [설정.json]
  설정 없음 = v1(터틀넥, docs/demo/saeng/layers) · docs/tools/char_layers_v2.json = v2 워터밤 룩(layers2)"""
import io, os, json, sys
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V1 = {"src": os.path.join(os.path.expanduser("~"), "Desktop", "학습시스템", "디자인", "2026-10-04_스앵님_웹툰"), "base": "base_B.png", "out": "demo/saeng/layers",
      "box": {"eyes": [190, 290, 520, 410], "mouth": [270, 500, 430, 600], "face": [180, 280, 530, 620]}, "stable": [250, 580, 650, 760],
      "parts": {"31_눈감음": ["eyes_closed", "eyes"], "32_눈반": ["eyes_half", "eyes"], "38_시선": ["eyes_side", "eyes"], "33_입반": ["mouth_half", "mouth"], "34_입아": ["mouth_open", "mouth"],
                "35_미소": ["expr_smile", "face"], "36_엄격": ["expr_strict", "face"], "37_놀람": ["expr_surprise", "face"], "39_칭찬": ["expr_praise", "face"]}}
CFG = json.load(io.open(sys.argv[1], encoding="utf-8")) if len(sys.argv) > 1 else V1
SRC = CFG["src"]; OUT = os.path.join(HERE, *CFG["out"].split("/")); os.makedirs(OUT, exist_ok=True)
SCALE = 0.5
BOX = {k: tuple(v) for k, v in CFG["box"].items()}
STABLE = tuple(CFG["stable"])          # 표정이 바뀌어도 안 움직이는 곳(목·옷깃)으로 정합
PARTS = {k: tuple(v) for k, v in CFG["parts"].items()}
BASE = CFG.get("base", "base_B.png")

def flat(im):
    bg = Image.new("RGBA", im.size, (128, 128, 128, 255)); bg.alpha_composite(im); return np.asarray(bg.convert("L"), dtype=np.float32)
base = Image.open(os.path.join(SRC, BASE)).convert("RGBA")
bL = flat(base); x0, y0, x1, y1 = STABLE; ref = bL[y0:y1, x0:x1]
def align(im, r=12):
    L = flat(im); best = (1e18, 0, 0)
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            p = L[y0 + dy:y1 + dy, x0 + dx:x1 + dx]
            e = float(np.mean((p - ref) ** 2))
            if e < best[0]: best = (e, dx, dy)
    return best
def feather(size, pad=14):
    m = Image.new("L", size, 0); d = ImageDraw.Draw(m)
    d.rounded_rectangle((pad, pad, size[0] - pad, size[1] - pad), radius=pad * 2, fill=255)
    return m.filter(ImageFilter.GaussianBlur(pad * 0.7))
man = {"scale": SCALE, "size": [int(base.width * SCALE), int(base.height * SCALE)], "boxes": {}, "layers": {}, "shift": {}}
for k, b in BOX.items(): man["boxes"][k] = [int(v * SCALE) for v in b]
def save_patch(im, name, boxk):
    bx = BOX[boxk]; patch = im.crop(bx)
    a = np.asarray(patch.split()[3]).astype(np.float32) * (np.asarray(feather(patch.size)).astype(np.float32) / 255)
    patch.putalpha(Image.fromarray(a.astype(np.uint8)))
    w, h = [int(round(v * SCALE)) for v in patch.size]
    patch.resize((w, h), Image.LANCZOS).save(os.path.join(OUT, name + ".png"), optimize=True)
    man["layers"][name] = {"box": boxk}
base.resize(man["size"], Image.LANCZOS).save(os.path.join(OUT, "base.png"), optimize=True)
save_patch(base, "eyes_open", "eyes"); save_patch(base, "mouth_closed", "mouth"); save_patch(base, "expr_neutral", "face")
for f, (name, boxk) in PARTS.items():
    fp = os.path.join(SRC, f + ".png")
    if not os.path.isfile(fp):
        print("없음:", f); continue
    im = Image.open(fp).convert("RGBA")
    e, dx, dy = align(im)
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); sh.paste(im, (-dx, -dy))   # 변주를 기준 좌표로 밀기
    save_patch(sh, name, boxk); man["shift"][name] = [dx, dy, round(e, 1)]
    print(f, name, "shift", dx, dy, "err", round(e, 1))
json.dump(man, io.open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("layers", len(man["layers"]), "→", OUT)
