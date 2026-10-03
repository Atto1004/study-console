# -*- coding: utf-8 -*-
"""V74 LAYER(A++O·학습앱 디자인 통일 장면 스킨)를 index.html 에 넣는다 — 원본 docs/layers/v74-layer-src.js. 있으면 자기 블록만 제자리 교체, 없으면 V73 블록 바로 뒤. 멱등."""
import io, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import sys
IDX = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "index.html")
SRC = os.path.join(ROOT, "docs", "layers", "v74-layer-src.js")
END = "\n})();\n"
s = io.open(IDX, encoding="utf-8").read().replace("\r\n", "\n")
layer = io.open(SRC, encoding="utf-8").read().replace("\r\n", "\n").rstrip("\n") + "\n"
hdr = "/* ============================================================\n   V74 LAYER"
assert layer.startswith(hdr) and layer.endswith(END)
i0 = s.find(hdr)
if i0 >= 0:
    j0 = s.find(END, i0); assert j0 > i0
    s = s[:i0] + layer + s[j0 + len(END):]
    how = "교체"
else:
    h57 = "/* ============================================================\n   V73 LAYER"
    k = s.find(h57); assert k >= 0, "V73 블록 없음"
    e = s.find(END, k); assert e > k
    s = s[:e + len(END)] + layer + s[e + len(END):]
    how = "삽입"
assert s.count(hdr) == 1
io.open(IDX, "w", encoding="utf-8", newline="\n").write(s)
print("V74", how)
