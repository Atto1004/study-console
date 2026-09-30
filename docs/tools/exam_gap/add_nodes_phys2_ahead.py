# -*- coding: utf-8 -*-
"""일물2 26·27장 교재 선행 — 지식 노드 6개를 graph.json 에 넣고(이미 있으면 갱신) build_lesson_nodes.py DECK_OVR 에 덱 phys2-mid2 파트를 잇는다. 멱등.
순서(오타 계획 2차 GREEN): build_slides → deck_index → 이 스크립트 → build_lesson_nodes → build_slides 재실행 → deck_index 재실행"""
import io, os, json, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SRC = "교재 선행 — 강의노트 Part-06·07 + 교재 26.1~27.4 (수업 전, 2026-09-30) · 일반물리학2/_정리노트/2026-09-30_일반물리학2_중간대비_26-27장_교재선행.html"
NODES = [
 dict(id="em.current", name="26장 전류 · 전류밀도 · 유동속도", level="전공", subject="일반물리학2", hours=1, prereq=["em.charge"], tags=["전자기"],
      desc="i = dq/dt [A], 전류 방향 = 양전하 방향(전자와 반대), 접합점 들어온 합 = 나간 합, J = i/A, i = neAv_d, J = nev_d", src=SRC),
 dict(id="em.resistance", name="26장 저항 · 비저항 · 옴의 법칙", level="전공", subject="일반물리학2", hours=1.5, prereq=["em.current", "em.potential"], tags=["전자기"],
      desc="R = V/i [Ω], R = ρL/A, E = ρJ (σ = 1/ρ), ρ−ρ₀ = ρ₀α(T−T₀), 옴성 = 전류가 전압에 비례, 미시적 ρ = m/(nq²τ)", src=SRC),
 dict(id="em.power", name="26장 전력 · 줄의 법칙", level="전공", subject="일반물리학2", hours=1, prereq=["em.resistance", "em.potential_energy"], tags=["전자기"],
      desc="P = iV (모든 소자), 저항은 P = i²R = V²/R (줄 열), W = Pt, 1 kWh = 3.6×10⁶ J", src=SRC),
 dict(id="em.emf_loop", name="27장 기전력 · 전압법칙(고리 규칙) · 단일 고리", level="전공", subject="일반물리학2", hours=1.5, prereq=["em.resistance"], tags=["전자기"],
      desc="ε = dW/dq, 한 바퀴 전위 변화 합 = 0, 부호: −→+ +ε · +→− −ε · 전류 방향 −iR · 반대 +iR, i = ε/(R+r), 단자 전압 V = ε−ir, 직렬 R_eq = ΣR", src=SRC),
 dict(id="em.kirchhoff", name="27장 다중 고리 · 전류법칙 · 병렬 · 전류계와 전압계", level="전공", subject="일반물리학2", hours=1.5, prereq=["em.emf_loop", "lin.det2"], tags=["전자기"],
      desc="접합점: 들어온 합 = 나간 합, 병렬 1/R_eq = Σ1/R(전위차 같음), 미지 전류 수만큼 식 → 크래머, 음수 = 반대 방향, 전류계 직렬(작은 R)·전압계 병렬(큰 R)", src=SRC),
 dict(id="em.rc", name="27장 RC 회로 — 충전 · 방전 · 시간 상수", level="전공", subject="일반물리학2", hours=1.5, prereq=["em.emf_loop", "em.capacitance", "ode.separable"], tags=["전자기"],
      desc="충전 q = Cε(1−e^(−t/RC)), i = (ε/R)e^(−t/RC), 방전 q = q₀e^(−t/RC), τ = RC (63%·37%), 처음 축전기 = 도선 · 나중 = 끊긴 도선, 절반 RC ln2", src=SRC),
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
line = ' "phys2-mid2": {"parts": {"1": ["em.current"], "2": ["em.resistance"], "3": ["em.power"], "4": ["em.emf_loop"], "5": ["em.kirchhoff"], "6": ["em.rc"]}},\n'
if '"phys2-mid2"' not in s:
    anchor = ' "phys2-w1-3": {"parts":'
    assert s.count(anchor) == 1
    s = s.replace(anchor, line + anchor, 1)
    io.open(bp, "w", encoding="utf-8", newline="\n").write(s)
    print("DECK_OVR phys2-mid2 추가")
else:
    print("DECK_OVR phys2-mid2 이미 있음")
