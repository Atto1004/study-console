# -*- coding: utf-8 -*-
"""미적2 12.4 외적 계산·12.5 직선(9/29) + 12.5 평면·12.6·13.1~13.2(교재 선행) — 지식 노드 5개(graph.json), DECK_OVR calc2-mid2, deck_index META. 멱등.
외적은 기존 vec.cross · lin.cofactor 를 쓴다."""
import io, os, json
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SRC = "미분적분학2/2026-09-29 판서·녹음(12.4 외적 계산·12.5 직선) + 교재 선행(12.5 평면·12.6·13.1~13.2, 수업 전 2026-09-30) · 미분적분학2/_정리노트/2026-09-30_미분적분학2_중간대비_12.5-13.2.html"
N = lambda **k: dict(level="전공", subject="미분적분학2", tags=["벡터"], src=SRC, **k)
NODES = [
 N(id="vec.line_eq", name="12.5 직선의 방정식 — 방향코사인·방향비·매개·대칭", hours=1.5, prereq=["vec.dot_calc2", "vec.position_ops"],
   desc="l,m,n = ±(x₀,y₀,z₀)/|OP₀|, 방향비 x₀:y₀:z₀, P₀P = t v → 매개 x = x₀+tA …, 대칭 (x−x₀)/A = (y−y₀)/B = (z−z₀)/C, 평행·교차·꼬인 위치"),
 N(id="vec.plane_eq", name="12.5 평면의 방정식 — 법선·두 평면·점과 평면 거리", hours=1.5, prereq=["vec.line_eq", "vec.cross", "vec.dot_calc2"],
   desc="n·(r−r₀)=0 → a(x−x₀)+b(y−y₀)+c(z−z₀)=0, 세 점 → n = PQ×PR, 두 평면 각 = 법선 각, 교선 방향 n₁×n₂, 거리 |ax₁+by₁+cz₁+d|/√(a²+b²+c²)"),
 N(id="vec.quadric", name="12.6 기둥면과 이차곡면 — 자취", hours=1, prereq=["vec.coords3d"],
   desc="빠진 변수 방향으로 민 곡면 = 기둥면, 자취(단면)로 모양 판단, 이차곡면 6종(타원면·원뿔·타원포물면·쌍곡포물면·일엽·이엽쌍곡면)"),
 N(id="vec.vector_func", name="13.1 벡터함수와 공간곡선", hours=1, prereq=["vec.line_eq", "calc.limit"],
   desc="r(t) = ⟨f,g,h⟩, 정의역은 성분 공통, 극한·연속 성분별, 선분 (1−t)r₀+t r₁, 나선 ⟨cos t, sin t, t⟩, 원기둥 교선 x=R cos t, y=R sin t"),
 N(id="vec.vector_calc", name="13.2 벡터함수의 미분과 적분 — 접선벡터", hours=1.5, prereq=["vec.vector_func", "calc.derivative", "calc.integral"],
   desc="r′ = ⟨f′,g′,h′⟩ 접선 방향, T = r′/|r′|, 내적·외적 곱의 미분(외적 순서 유지), |r| 일정 → r·r′ = 0, 적분 성분별 + 상수 벡터"),
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
line = ' "calc2-mid2": {"parts": {"1": ["vec.cross", "lin.cofactor"], "2": ["vec.line_eq"], "3": ["vec.plane_eq"], "4": ["vec.quadric"], "5": ["vec.vector_func"], "6": ["vec.vector_calc"]}},\n'
if '"calc2-mid2"' not in s:
    anchor = ' "calc2-matrix": {"parts":'
    assert s.count(anchor) == 1
    s = s.replace(anchor, line + anchor, 1)
    io.open(bp, "w", encoding="utf-8", newline="\n").write(s)
    print("DECK_OVR calc2-mid2 추가")

dp = os.path.join(ROOT, "docs", "tools", "deck_index.py")
t = io.open(dp, encoding="utf-8").read()
if '"calc2-mid2"' not in t:
    anchor = '    "em1-w1-3":       {'
    assert t.count(anchor) == 1
    t = t.replace(anchor, '    "calc2-mid2":     {"weeks": [5, 6, 7], "scope": "12.4 외적 계산·12.5 직선(9/29 수업) · 12.5 평면·12.6 기둥면·13.1~13.2 벡터함수(교재 선행)"},\n' + anchor, 1)
    io.open(dp, "w", encoding="utf-8", newline="\n").write(t)
    print("deck_index META calc2-mid2 추가")
