# -*- coding: utf-8 -*-
"""정역학 Ch.4 수업분 + Ch.5 교재 선행 — 지식 노드 5개를 graph.json 에 넣고(있으면 갱신), build_lesson_nodes.py DECK_OVR 에 덱 statics-mid2 파트를 잇고,
deck_index.py META 에 범위를 적는다. 점 모멘트는 기존 mech.moment 를 쓴다. 멱등."""
import io, os, json
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SRC = "정역학/2026-09-21·23·28 교수필기·수업요약(Ch.4) + Ch.5 교재 선행(B&F 장 구성, 수업 전 2026-09-30) · 정역학/_정리노트/2026-09-30_정역학_중간대비_Ch4-5.html"
N = lambda **k: dict(level="전공", subject="정역학", tags=["정역학"], src=SRC, **k)
NODES = [
 N(id="mech.moment_line", name="Ch.4 직선에 대한 모멘트 · 바리뇽 정리", hours=1.5, prereq=["mech.moment", "mech.triple_product", "mech.projection"],
   desc="바리뇽 ΣM_P = r_PQ × ΣF(성분별 합), M_L = [e·(r×F)]e = 3×3 행렬식 × e, L 위 점 선택 무관, 평행하거나 만나면 0, 수직이면 FD"),
 N(id="mech.couple", name="Ch.4 우력 · 등가계 · 힘 옮기기 · 렌치", hours=1.5, prereq=["mech.moment"],
   desc="우력 ΣF=0·|M|=DF·어느 점이나 같다, 등가 = 합력·한 점 모멘트 같음, P의 힘 ≡ Q의 힘 + r×F, 렌치 = F + 평행 우력 M_p (r_PQ × F = M_n)"),
 N(id="mech.rigid_2d", name="Ch.5 2D 강체 평형 — 지지·반력·평형 방정식 3개", hours=2, prereq=["mech.moment", "mech.equilibrium_particle", "mech.couple"],
   desc="ΣFx=ΣFy=ΣM_P=0, 롤러 1·핀 2·고정 3(Ax,Ay,M_A), 지지를 반력으로 바꾼 FBD, 미지수가 많이 지나는 점에 대한 모멘트부터"),
 N(id="mech.indeterminate", name="Ch.5 부정정 · 부적절한 지지 · 2력·3력 부재", hours=1, prereq=["mech.rigid_2d"],
   desc="부정정 차수 = 미지수 − 3, 반력이 모두 평행하거나 한 점에 모이면 부적절, 2력 부재 = 두 점을 잇는 직선 방향, 3력 부재 = 한 점에서 만나거나 평행"),
 N(id="mech.rigid_3d", name="Ch.5 3D 강체 평형 — 지지 5종·평형 방정식 6개", hours=1.5, prereq=["mech.rigid_2d", "mech.moment_line"],
   desc="ΣF 3식 + ΣM 3식, 볼-소켓 3·롤러 1·경첩 3+2·베어링 2+2·고정 3+3, 수직 힘 F_z 의 M_x = yF_z, M_y = −xF_z"),
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
line = ' "statics-mid2": {"parts": {"1": ["mech.moment", "mech.equilibrium_particle"], "2": ["mech.moment_line"], "3": ["mech.couple"], "4": ["mech.rigid_2d"], "5": ["mech.indeterminate"], "6": ["mech.rigid_3d"]}},\n'
if '"statics-mid2"' not in s:
    anchor = ' "statics-w1-3": {"parts":'
    assert s.count(anchor) == 1
    s = s.replace(anchor, line + anchor, 1)
    io.open(bp, "w", encoding="utf-8", newline="\n").write(s)
    print("DECK_OVR statics-mid2 추가")

dp = os.path.join(ROOT, "docs", "tools", "deck_index.py")
t = io.open(dp, encoding="utf-8").read()
if '"statics-mid2"' not in t:
    anchor = '    "em1-w1-3":       {'
    assert t.count(anchor) == 1
    t = t.replace(anchor, '    "statics-mid2":   {"weeks": [4, 5, 6, 7], "scope": "Ch.4 점·직선 모멘트·우력·등가계(9/21·9/23·9/28 수업) · Ch.5 강체 평형 2D·부정정·2력·3D(교재 선행)"},\n' + anchor, 1)
    io.open(dp, "w", encoding="utf-8", newline="\n").write(t)
    print("deck_index META statics-mid2 추가")
