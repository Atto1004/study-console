# -*- coding: utf-8 -*-
"""V62 LAYER(대표님 10/2 공업수학1 중간 범위 1장~3.3)를 index.html 에 넣고 BUILD .104 · PATCHNOTES 항목을 단다 — 원본 docs/layers/v62-layer-src.js. 있으면 자기 블록만 제자리 교체, 없으면 V61 블록 바로 뒤. 멱등."""
import io, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IDX = os.path.join(ROOT, "index.html")
SRC = os.path.join(ROOT, "docs", "layers", "v62-layer-src.js")
END = "\n})();\n"
s = io.open(IDX, encoding="utf-8").read().replace("\r\n", "\n")
layer = io.open(SRC, encoding="utf-8").read().replace("\r\n", "\n").rstrip("\n") + "\n"
hdr = "/* ============================================================\n   V62 LAYER"
assert layer.startswith(hdr) and layer.endswith(END)
i0 = s.find(hdr)
if i0 >= 0:
    j0 = s.find(END, i0); assert j0 > i0
    s = s[:i0] + layer + s[j0 + len(END):]
    how = "교체"
else:
    h = "/* ============================================================\n   V61 LAYER"
    k = s.find(h); assert k >= 0, "V61 블록 없음"
    e = s.find(END, k); assert e > k
    s = s[:e + len(END)] + layer + s[e + len(END):]
    how = "삽입"
assert s.count(hdr) == 1

B_OLD, B_NEW = 'var BUILD="2026-10-02.103";', 'var BUILD="2026-10-02.104";'
if B_NEW not in s:
    assert s.count(B_OLD) == 1; s = s.replace(B_OLD, B_NEW)

PN = 'var PATCHNOTES=[\n'
ITEM = ('  {v:"2026-10-02.104",d:"10-02",items:[\n'
        '    "공업수학1 중간 범위 = 1장 ~ 3.3 (교수 10/2, 10/7 수업에서 범위 끝까지) — 시험 카드 범위 갱신",\n'
        '    "5주차 수업 노트 · 교실 8회차 추가 — 미적2 9/29 · 10/1, 공수1 9/30, 일물2 9/30, 정역학 9/21 · 9/23 · 9/28 · 9/30 (암기노트 · 개념 판정 연결 포함)"\n'
        '  ]},\n')
if '{v:"2026-10-02.104"' not in s:
    assert s.count(PN) == 1; s = s.replace(PN, PN + ITEM)
io.open(IDX, "w", encoding="utf-8", newline="\n").write(s)
print("V62", how)
