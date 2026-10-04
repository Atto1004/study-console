# -*- coding: utf-8 -*-
"""스앵님 전신 동작 세트 만들기 (2026-10-04) — 힉스필드 전신 PNG(투명) → notes/classroom/assets/tutor/g/<동작>.png 640×1000, 발바닥 y=990, 몸 가운데 x=260
(classroom_tpl.html 의 gset 규격: 640×1000 · 다리 가운데 x=260 · 좌우 반전은 CSS 가 함). 사용: python docs/tools/tutor_gset.py <원본 폴더>"""
import io, os, sys
from PIL import Image
SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "notes", "classroom", "assets", "tutor", "g")
W, H, FOOT, CX, BODY_H = 640, 1000, 990, 260, 950
for f in sorted(os.listdir(SRC)):
    if not f.lower().endswith(".png") or f.startswith("_"): continue
    name = os.path.splitext(f)[0].split("_", 1)[-1]          # 121_point.png → point
    im = Image.open(os.path.join(SRC, f)).convert("RGBA"); bb = im.getbbox(); im = im.crop(bb)
    k = BODY_H / im.height; im = im.resize((max(1, int(im.width * k)), BODY_H), Image.LANCZOS)
    # 다리 가운데: 아래 25% 영역의 알파 무게중심 x
    a = im.split()[3]; low = a.crop((0, int(im.height * .75), im.width, im.height))
    px = low.load(); sx = n = 0
    for y in range(low.height):
        for x in range(low.width):
            if px[x, y] > 40: sx += x; n += 1
    legx = sx / n if n else im.width / 2
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    canvas.alpha_composite(im, (int(CX - legx), FOOT - im.height))
    canvas.save(os.path.join(OUT, name + ".png"), optimize=True)
    print(name, im.size, "legx", round(legx), os.path.getsize(os.path.join(OUT, name + ".png")) // 1024, "KB")
