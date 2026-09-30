# -*- coding: utf-8 -*-
"""공업수학1 2.4·2.7~2.10·3장 교재 선행 — 지식 노드 7개를 graph.json 에 넣고(있으면 갱신) build_lesson_nodes.py DECK_OVR 에 덱 em1-mid2 파트를 잇고
deck_index.py META 에 덱 범위를 적는다. 멱등. 순서: build_slides → deck_index → 이 스크립트 → build_lesson_nodes → build_slides 재실행 → deck_index 재실행"""
import io, os, json
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SRC = "교재 선행 — 교수 슬라이드 제2장 p.27~30·39~56 · 제3장 p.3~18 + Kreyszig 10판 (수업 전, 2026-09-30) · 공업수학1/_정리노트/2026-09-30_공업수학1_중간대비_2.4-3장_교재선행.html"
N = lambda **k: dict(level="전공", subject="공업수학1", tags=["미분방정식"], src=SRC, **k)
NODES = [
 N(id="ode.free_oscillation", name="2.4 자유진동 — 질량-용수철 · 과감쇠·임계감쇠·저감쇠", hours=1.5, prereq=["ode.const_coeff"],
   desc="my''+cy'+ky=0, ω₀=√(k/m), y=C cos(ω₀t−δ), α=c/2m, β=√(c²−4mk)/2m, c²>4mk 과감쇠 · =4mk 임계 (c₁+c₂t)e^(−αt) · <4mk 저감쇠 e^(−αt)(A cos ω*t + B sin ω*t)"),
 N(id="ode.undetermined_coeff", name="2.7 비제차 ODE — 미정계수법(기본·변형·합 규칙)", hours=2, prereq=["ode.const_coeff", "ode.superposition"],
   desc="y=y_h+y_p, 표 2.1(e^γx·x^n·cos/sin·e^αx cos/sin), 겹치면 x(이중근 x²) 곱, 합이면 따로 구해 더함, Step 1 제차 일반해 → Step 2 특수해 → Step 3 초기조건"),
 N(id="ode.forced_oscillation", name="2.8 강제진동 · 공진 · 맥놀이", hours=1.5, prereq=["ode.free_oscillation", "ode.undetermined_coeff"],
   desc="my''+cy'+ky=F₀cos ωt, y_p=a cos ωt+b sin ωt, 비감쇠 F₀/(m(ω₀²−ω²)) cos ωt, 공진 (F₀/2mω₀) t sin ω₀t, 맥놀이, 과도해 y_h → 정상상태해 y_p"),
 N(id="ode.rlc", name="2.9 RLC 회로 모델화 — 전기·역학 상사성", hours=1, prereq=["ode.forced_oscillation", "em.kirchhoff"],
   desc="LI''+RI'+I/C=E'(t), 리액턴스 S=ωL−1/(ωC), I₀=E₀/√(R²+S²), L↔m · R↔c · 1/C↔k"),
 N(id="ode.variation_params", name="2.10 매개변수변환법(변수변분법)", hours=1.5, prereq=["ode.wronskian", "ode.undetermined_coeff"],
   desc="표준형에서 y_p=−y₁∫(y₂r/W)dx+y₂∫(y₁r/W)dx, W=y₁y₂'−y₂y₁', 표 2.1에 없는 r(x)(sec, csc, e^x/x)에 쓴다"),
 N(id="ode.higher_homog", name="3.1~3.2 고계 제차 선형 ODE — n계 이론 · 상수계수 · 고계 오일러-코시", hours=2, prereq=["ode.const_coeff", "ode.euler_cauchy", "ode.wronskian", "lin.det3"],
   desc="해 n개·기저, n×n 론스키안(0이면 종속), 특성방정식 n차: 서로 다른 근·복소근·m중근 x^k e^(λx), 오일러-코시 x^m(중근 ln x 곱)"),
 N(id="ode.higher_nonhomog", name="3.3 고계 비제차 — 미정계수 · 매개변수변환 일반화", hours=1.5, prereq=["ode.higher_homog", "ode.undetermined_coeff", "ode.variation_params"],
   desc="y=y_h+y_p, 곱의 원리(겹치면 x^m), y_p=Σ y_k∫(W_k/W) r dx (W_k: k열을 [0…0 1]^T로), 표준형 r(x), 탄성보 EI y⁗=f(x)"),
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
line = ' "em1-mid2": {"parts": {"1": ["ode.free_oscillation"], "2": ["ode.undetermined_coeff"], "3": ["ode.forced_oscillation", "ode.rlc"], "4": ["ode.variation_params"], "5": ["ode.higher_homog"], "6": ["ode.higher_nonhomog"]}},\n'
if '"em1-mid2"' not in s:
    anchor = ' "em1-w1-3": {"parts":'
    assert s.count(anchor) == 1
    s = s.replace(anchor, line + anchor, 1)
    io.open(bp, "w", encoding="utf-8", newline="\n").write(s)
    print("DECK_OVR em1-mid2 추가")

dp = os.path.join(ROOT, "docs", "tools", "deck_index.py")
t = io.open(dp, encoding="utf-8").read()
if '"em1-mid2"' not in t:
    anchor = '    "em1-w1-3":       {'
    assert t.count(anchor) == 1
    t = t.replace(anchor, '    "em1-mid2":       {"weeks": [5, 6, 7], "scope": "2.4 자유진동 · 2.7 미정계수법 · 2.8 강제진동·공진 · 2.9 RLC · 2.10 매개변수변환 · 3.1~3.3 고계 선형 — 수업 전 교재 선행"},\n' + anchor, 1)
    io.open(dp, "w", encoding="utf-8", newline="\n").write(t)
    print("deck_index META em1-mid2 추가")
