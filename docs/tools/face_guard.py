# -*- coding: utf-8 -*-
"""얼굴 검사 — 수업 사진 칸에 사람 얼굴이 든 사진이 들어가지 않게 (대표님 2026-10-02 「내 사진을 넣으면 어떻게 해」).
본사\\atom\\.venv-face 의 MTCNN 으로 돌린다. 셀카처럼 얼굴이 크게 찍힌 사진만 출력한다(확률 ≥ 0.90, 얼굴 짧은 변 ≥ 사진 짧은 변의 MIN). 칠판 사진에 작게 찍힌 교수님 얼굴은 통과(대표님 10/2).
인자 --size 를 주면 「경로<TAB>최대 얼굴 비율」을 전부 출력(기준 조정용).
사용: <.venv-face python> face_guard.py <목록.txt>   (목록 = 한 줄에 이미지 경로 하나) → 얼굴 있는 경로만 한 줄씩"""
import sys, io
from PIL import Image, ImageOps
from facenet_pytorch import MTCNN

mtcnn = MTCNN(keep_all=True, device="cpu")
MIN = 0.26   # 실측 10/2: 셀카 0.31~0.36 · 칠판 속 교수님 0.06~0.19
SIZE = "--size" in sys.argv
paths = [l.strip() for l in io.open(sys.argv[1], encoding="utf-8") if l.strip()]
out = []
for p in paths:
    try:
        im = ImageOps.exif_transpose(Image.open(p)).convert("RGB")
        im.thumbnail((1024, 1024))
        boxes, probs = mtcnn.detect(im)
        if boxes is None:
            continue
        side = min(im.size)
        r = max([min(b[2] - b[0], b[3] - b[1]) / side for b, pr in zip(boxes, probs) if pr is not None and pr >= 0.90] or [0])
        if SIZE:
            out.append("%s	%.3f" % (p, r))
        elif r >= MIN:
            out.append(p)
    except Exception as e:
        out.append(p)  # 못 읽으면 안전하게 뺀다
sys.stdout.reconfigure(encoding="utf-8")
print("\n".join(out))
