# -*- coding: utf-8 -*-
"""중간고사 대비 덱을 앱 노트 목록(V49.NOTES)에 등록 — 원본 docs/layers/v49-layer-src.js 의 NOTES 블록을 knowledge/decks.json(문제 덱)으로 다시 쓰고,
index.html 의 V49 LAYER 블록을 그 원본으로 제자리 교체한다(자기 블록만, 2026-09-24 규칙). 멱등.
기존 항목의 week·date 는 그대로 두고, 새 덱은 deck_index META 의 첫 주차와 NEW_DATE 를 쓴다. 부가 설명 금지(§24) — sub 는 빈 문자열."""
import io, os, re, json
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SRC = os.path.join(ROOT, "docs", "layers", "v49-layer-src.js")
IDX = os.path.join(ROOT, "index.html")
DECKS = os.path.join(ROOT, "knowledge", "decks.json")
NEW_DATE = "2026-09-30"

src = io.open(SRC, encoding="utf-8").read().replace("\r\n", "\n")
m = re.search(r"  V49\.NOTES=\[\n(.*?)\n  \];\n", src, re.S)
assert m, "NOTES 블록을 못 찾음"
old = {}
for row in m.group(1).split("\n"):
    f = re.search(r'file:"([^"]+)"', row); w = re.search(r"week:(\d+)", row); d = re.search(r'date:"([^"]+)"', row)
    if f: old[f.group(1)] = (int(w.group(1)), d.group(1))
decks = [d for d in json.load(io.open(DECKS, encoding="utf-8"))["decks"] if d["kind"] == "exam" and d["id"] != "calc2-matrix"]   # 행렬 덱은 V40 이 등록
rows = []
for d in decks:
    week, date = old.get(d["file"], ((d.get("weeks") or [4])[0], NEW_DATE))
    t = "%s — %d파트 · 문제 %d" % (d["title"], d["parts"], d["qN"])
    rows.append('    {course:%s,file:%s,title:%s,week:%d,date:"%s",sub:""}' % (json.dumps(d["course"], ensure_ascii=False), json.dumps(d["file"]), json.dumps(t, ensure_ascii=False), week, date))
src2 = src[:m.start()] + "  V49.NOTES=[\n" + ",\n".join(rows) + "\n  ];\n" + src[m.end():]
io.open(SRC, "w", encoding="utf-8", newline="\n").write(src2)

s = io.open(IDX, encoding="utf-8").read().replace("\r\n", "\n")
hdr = "/* ============================================================\n   V49 LAYER"
i0 = s.find(hdr); assert i0 >= 0, "index.html 에 V49 LAYER 없음"
j0 = s.find("\n})();\n", i0); assert j0 > i0
layer = src2.rstrip("\n") + "\n"
assert layer.startswith(hdr) and layer.endswith("\n})();\n"), "원본 형식이 블록과 다름"
s = s[:i0] + layer + s[j0 + len("\n})();\n"):]
io.open(IDX, "w", encoding="utf-8", newline="\n").write(s)
print("V49.NOTES", len(rows), "개:", ", ".join(d["id"] for d in decks), "· index V49 블록", s.count("   V49 LAYER"))
