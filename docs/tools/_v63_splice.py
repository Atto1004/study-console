# -*- coding: utf-8 -*-
"""V63 LAYER(대표님 10/2 세부단원 학습 경로)를 index.html 에 넣고 BUILD .113 · PATCHNOTES 항목을 단다 — 원본 docs/layers/v63-layer-src.js. 있으면 자기 블록만 제자리 교체, 없으면 V62 블록 바로 뒤. 멱등."""
import io, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IDX = os.path.join(ROOT, "index.html")
SRC = os.path.join(ROOT, "docs", "layers", "v63-layer-src.js")
END = "\n})();\n"
s = io.open(IDX, encoding="utf-8").read().replace("\r\n", "\n")
layer = io.open(SRC, encoding="utf-8").read().replace("\r\n", "\n").rstrip("\n") + "\n"
hdr = "/* ============================================================\n   V63 LAYER"
assert layer.startswith(hdr) and layer.endswith(END)
i0 = s.find(hdr)
if i0 >= 0:
    j0 = s.find(END, i0); assert j0 > i0
    s = s[:i0] + layer + s[j0 + len(END):]
    how = "교체"
else:
    h = "/* ============================================================\n   V62 LAYER"
    k = s.find(h); assert k >= 0, "V62 블록 없음"
    e = s.find(END, k); assert e > k
    s = s[:e + len(END)] + layer + s[e + len(END):]
    how = "삽입"
assert s.count(hdr) == 1

B_OLD, B_NEW = 'var BUILD="2026-10-02.112";', 'var BUILD="2026-10-02.113";'
if B_NEW not in s:
    assert s.count(B_OLD) == 1; s = s.replace(B_OLD, B_NEW)
PN = 'var PATCHNOTES=[\n'
ITEM = ('  {v:"2026-10-02.111",d:"10-02",items:[\n'
        '    "과목 화면 「세부단원」 — 공업수학1 절(1.1 ~ 3.3)마다 교수님 자료(슬라이드 절별) · 교실 · 수업 노트 · 문제 · 암기노트 순서, 그날 수업 사진 칸(없으면 빈칸)"\n'
        '  ]},\n')
if '{v:"2026-10-02.111"' not in s:
    assert s.count(PN) == 1; s = s.replace(PN, PN + ITEM)
ITEM2 = ('  {v:"2026-10-02.113",d:"10-02",items:[' + chr(10) +
         '    "세부단원 데이터(sections.json) 배포 · 그날 수업 사진은 판서 · 자료 · 필기 · 과제만 (미분류 사진 제외)"' + chr(10) +
         '  ]},' + chr(10))
if '{v:"2026-10-02.113"' not in s:
    assert s.count(PN) == 1; s = s.replace(PN, PN + ITEM2)
io.open(IDX, "w", encoding="utf-8", newline="\n").write(s)
print("V63", how)
