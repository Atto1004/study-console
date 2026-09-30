# -*- coding: utf-8 -*-
"""정역학 Ch.3 입자 평형 문제 풀이(덱 statics-mid3) — 지식 노드 2개(2D·3D 입자 평형)를 graph.json 에 넣고(있으면 갱신),
build_lesson_nodes.py DECK_OVR 에 파트를 잇고, deck_index.py META 에 범위를 적는다. statics-mid 의 범위 글에 Ch.2 = 시험 범위 밖(도구)을 밝힌다. 멱등."""
import io, os, json
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SRC = "정역학/2026-09-16·21 교수필기(Ch.3 힘·평형) + 과제 Chapter 3 유형(3.11·3.26·3.47·3.51·3.63·3.69) · 정역학/_정리노트/2026-09-30_정역학_중간대비_Ch3_입자평형.html"
N = lambda **k: dict(level="전공", subject="정역학", tags=["정역학"], src=SRC, **k)
NODES = [
 N(id="mech.particle_2d", name="Ch.3 2D 입자 평형 — 두 줄·경사면·도르래·스프링·링크", hours=2, prereq=["mech.equilibrium_particle", "mech.force_types", "trig.ratio", "trig.law"],
   desc="매듭을 떼어 FBD(장력은 줄 따라 바깥쪽) → 성분 → ΣFx=ΣFy=0 연립, 매끄러운 경사면은 축을 면에 맞춰 mg sinθ·mg cosθ, 도르래 T₁=T₂·움직도르래 2T=W, 스프링 F=k|L−L₀|, 세 변은 코사인 법칙, 링크 힘 음수 = 반대 방향"),
 N(id="mech.particle_3d", name="Ch.3 3D 입자 평형 — 좌표 → 단위벡터 → 세 식", hours=1.5, prereq=["mech.particle_2d", "mech.force_3d"],
   desc="r_AB = B − A(매듭 → 줄 끝), e = r/|r|, 장력 T e, ΣFx=ΣFy=ΣFz=0(미지수 최대 3), 0 성분 있는 식부터 대입, y 연직 위면 W = −mg j"),
]
gp = os.path.join(ROOT, "knowledge", "graph.json")
g = json.load(io.open(gp, encoding="utf-8"))
have = {n["id"]: i for i, n in enumerate(g["nodes"])}
added = 0
for nd in NODES:
    if nd["id"] in have: g["nodes"][have[nd["id"]]] = nd
    else: g["nodes"].append(nd); added += 1
g["updated"] = "2026-09-30"
io.open(gp, "w", encoding="utf-8", newline="\n").write(json.dumps(g, ensure_ascii=False, indent=1))
print("graph.json 노드 추가", added, "· 총", len(g["nodes"]))

bp = os.path.join(ROOT, "docs", "tools", "build_lesson_nodes.py")
s = io.open(bp, encoding="utf-8").read()
line = ' "statics-mid3": {"parts": {"1": ["mech.particle_2d"], "2": ["mech.particle_2d", "mech.force_types"], "3": ["mech.particle_2d"], "4": ["mech.particle_3d"]}},\n'
if '"statics-mid3"' not in s:
    anchor = ' "statics-w1-3": {"parts":'
    assert s.count(anchor) == 1
    s = s.replace(anchor, line + anchor, 1)
    io.open(bp, "w", encoding="utf-8", newline="\n").write(s)
    print("DECK_OVR statics-mid3 추가")

dp = os.path.join(ROOT, "docs", "tools", "deck_index.py")
t = io.open(dp, encoding="utf-8").read()
if '"statics-mid3"' not in t:
    anchor = '    "em1-w1-3":       {'
    assert t.count(anchor) == 1
    t = t.replace(anchor, '    "statics-mid3":   {"weeks": [3, 4], "scope": "Ch.3 입자 평형 문제 풀이 — 2D 두 줄·경사면·도르래·스프링·링크 · 3D 세 줄(과제 3.11·3.26·3.47·3.51·3.63·3.69 유형)"},\n' + anchor, 1)
    print("deck_index META statics-mid3 추가")
old = '"Ch.2 벡터(성분·방향여현·내적·정사영·외적·삼중적) · Ch.3 힘·평형·자유물체도"'
if old in t:
    t = t.replace(old, '"Ch.2 벡터(시험 범위 밖 — Ch.3~5 계산 도구: 성분·방향여현·내적·정사영·외적·삼중적) · Ch.3 힘·평형·자유물체도"', 1)
    print("statics-mid 범위 글: Ch.2 = 범위 밖(도구)")
io.open(dp, "w", encoding="utf-8", newline="\n").write(t)
