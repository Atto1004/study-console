# -*- coding: utf-8 -*-
"""커리큘럼 갱신 — 3~4주차 (아토 2026-09-21 §16 ③ "과목별 진도·목차 커리큘럼 정리"). 원본 = 회차 정리.md 진도 줄.
  graph.json: 새 노드 22개(공수1 2계 ODE · 미적2 3D 좌표·벡터 · 일물2 가우스/전위/전기용량 · 정역학 정사영/삼중적/힘·FBD · 글쓰기 5) + 글쓰기 과목 추가
  map.json: 2주차 노드 보정(정리.md 기준) · 3주차 확정 · 4주차 planned(예고·강의계획서). 멱등(id 기준)."""
import io, json, os, datetime
K = r"C:\Users\user\Desktop\아톰OS\기술실\study-console\knowledge"
g = json.load(io.open(os.path.join(K, "graph.json"), encoding="utf-8"))
m = json.load(io.open(os.path.join(K, "map.json"), encoding="utf-8"))
have = {n["id"] for n in g["nodes"]}
NEW = [
 # 공업수학1 3주차 (9/16 정리.md)
 dict(id="ode.superposition", name="2계 선형 ODE — 중첩(선형성)의 원리", level="전공", subject="공업수학1", hours=1, prereq=["ode.second_order", "ode.linearity"], tags=["ODE"], desc="제차 선형 ODE의 해 y1, y2 의 선형결합 c1y1+c2y2 도 해 (정리 1). 비제차·비선형에는 성립 안 함", src="공업수학1/2026-09-16/정리.md ③-6"),
 dict(id="ode.basis", name="일반해 · 1차독립 · 기저", level="전공", subject="공업수학1", hours=1.5, prereq=["ode.superposition"], tags=["ODE"], desc="1차독립인 두 해(기저)로 일반해 y=c1y1+c2y2. 비례하면 종속. IVP 는 y(x0), y'(x0) 두 조건", src="공업수학1/2026-09-16/정리.md ③-7·③-8"),
 dict(id="ode.reduction_order", name="차수축소법 (Reduction of Order)", level="전공", subject="공업수학1", hours=1.5, prereq=["ode.basis", "ode.linear1"], tags=["ODE"], desc="해 하나 y1 을 알 때 y2=u·y1 로 두고 1계로 낮춰 두 번째 해를 구함", src="공업수학1/2026-09-16/정리.md ③-9 (예제 1 설정까지)"),
 dict(id="ode.const_coeff", name="2.2 상수계수 제차 선형 ODE — 특성방정식", level="전공", subject="공업수학1", hours=2, prereq=["ode.basis", "alg.quadratic_eq"], tags=["ODE"], desc="y''+ay'+by=0 → λ²+aλ+b=0. 서로 다른 실근·중근·복소근 세 경우의 일반해", src="4주차 예고 (강의계획서 순서) — planned"),
 # 미분적분학2 3주차 (9/15·9/17)
 dict(id="vec.coords3d", name="12.1 3차원 좌표계 · 곡면 그리기", level="전공", subject="미분적분학2", hours=1, prereq=["vec.3d"], tags=["벡터"], desc="R³ 좌표계 3종, 곡선(R²) vs 곡면(R³), z=0 기준으로 xy 평면에 먼저 그리고 올리기 (예제 1·2)", src="미분적분학2/2026-09-10·09-15/정리.md"),
 dict(id="vec.distance_sphere", name="두 점 사이 거리 · 구면의 방정식", level="전공", subject="미분적분학2", hours=1, prereq=["vec.coords3d", "alg.sqrt"], tags=["벡터"], desc="|P1P2|=√(Δx²+Δy²+Δz²), (x−a)²+(y−b)²+(z−c)²=r², 완전제곱으로 중심·반지름 찾기 (예제 4)", src="미분적분학2/2026-09-15/정리.md ③-3·③-4 ★"),
 dict(id="vec.position_ops", name="12.2 위치벡터 · 두 점 벡터 · 크기 · 연산", level="전공", subject="미분적분학2", hours=1.5, prereq=["vec.components", "vec.distance_sphere"], tags=["벡터"], desc="AB→ = OB − OA, |a| = 거리, 상등·덧셈·실수배(덧셈·뺄셈·실수배에만 닫힘)", src="미분적분학2/2026-09-17/정리.md ③-1~③-4 ★"),
 dict(id="vec.basis_unit", name="표준기저벡터 i,j,k · 단위벡터 u=a/|a|", level="전공", subject="미분적분학2", hours=1, prereq=["vec.position_ops", "vec.unit"], tags=["벡터"], desc="a = a1 i + a2 j + a3 k 표기, 단위벡터 = 방향만 남김. Ex01~03 (|2a−3b| 등)", src="미분적분학2/2026-09-17/정리.md ③-5·③-6 ★ (시험 언급)"),
 dict(id="vec.dot_calc2", name="12.3 내적 — 정의 · 각 · 정사영", level="전공", subject="미분적분학2", hours=1.5, prereq=["vec.basis_unit", "vec.dot"], tags=["벡터"], desc="a·b=|a||b|cosθ = Σaibi, 수직 판정, 스칼라·벡터 정사영", src="4주차 예고 (9/17 '다음은 12.3') — planned"),
 # 일반물리학2 3주차 (9/16 가우스 · 9/18 전위)
 dict(id="em.gauss", name="23장 가우스 법칙 — 정의 · 가우스면 3종", level="전공", subject="일반물리학2", hours=2, prereq=["em.continuous", "calc.definite"], tags=["전자기"], desc="∮E·n da = q/ε0. 면·원통·구 세 가우스면으로 무한평면·직선도선 재유도", src="일반물리학2/2026-09-16/정리.md ③-1~③-3 ★"),
 dict(id="em.gauss_apps", name="가우스 법칙 응용 — 도체구 · 부도체구", level="전공", subject="일반물리학2", hours=1.5, prereq=["em.gauss"], tags=["전자기"], desc="고립도체 내부 E=0·표면 전하, 부도체구 내부 E∝r · 외부 E∝1/r², 전기 선속", src="일반물리학2/2026-09-16/정리.md ③-4~③-8 ★"),
 dict(id="em.potential_energy", name="24장 전기 위치 에너지 U(r)", level="전공", subject="일반물리학2", hours=1, prereq=["em.coulomb", "calc.definite"], tags=["전자기"], desc="중력 위치 에너지(13장)와 대응. U = kq1q2/r, 기준점 무한대", src="일반물리학2/2026-09-18/정리.md ③-1~③-3 ★"),
 dict(id="em.potential", name="전위 V(r) — 점전하 · 여러 점전하", level="전공", subject="일반물리학2", hours=1.5, prereq=["em.potential_energy", "em.superposition"], tags=["전자기"], desc="V = U/q0 = kq/r (스칼라라 그냥 더함). 여러 점전하는 Σ", src="일반물리학2/2026-09-18/정리.md ③-4·③-5 ★★"),
 dict(id="em.potential_dist", name="연속 분포의 전위 — 쌍극자 · 직선 도선 · 원판", level="전공", subject="일반물리학2", hours=2, prereq=["em.potential", "calc.substitution"], tags=["전자기"], desc="쌍극자 V≈kp cosθ/r², 직선 도선 ∫ 적분(ln), 원판 전위. 원형 고리는 교재에 없는 이유", src="일반물리학2/2026-09-18/정리.md ③-6~③-9 ★★ 증명 후보"),
 dict(id="em.capacitance", name="25장 전기 용량 — 정의 · 단위 · 평행판", level="전공", subject="일반물리학2", hours=1.5, prereq=["em.potential", "em.gauss_apps"], tags=["전자기"], desc="C = Q/V [F], 평행판 C=ε0A/d (9/18 도입만, 4주차 계속)", src="일반물리학2/2026-09-18/정리.md 25장 도입 · 4주차 planned"),
 # 정역학 3주차 (9/14 · 9/16)
 dict(id="mech.projection", name="벡터의 선에 대한 정사영 — 평행·수직 성분", level="전공", subject="정역학", hours=1, prereq=["mech.dot_apps"], tags=["정역학"], desc="U∥ = (U·e)e, U⊥ = U − U∥. 내적으로 각·성분 분해", src="정역학/2026-09-14/정리.md ③-3"),
 dict(id="mech.triple_product", name="혼합삼중적 U·(V×W) — 행렬식 · 부피 · 공면 판정", level="전공", subject="정역학", hours=1, prereq=["mech.cross_apps", "lin.det3"], tags=["정역학"], desc="det|U;V;W|, 절댓값 = 평행육면체 부피, 두 벡터 바꾸면 부호 반대, 세 벡터가 한 평면이면 0 (Ch.4 직선 모멘트에 연결)", src="정역학/2026-09-16/수업요약_3주차_W3-2.md"),
 dict(id="mech.forces_types", name="Ch.3 힘의 종류 — 접촉력·장력·도르래·스프링·중력", level="전공", subject="정역학", hours=1.5, prereq=["mech.force_vector"], tags=["정역학"], desc="F = N + f, |W| = mg, 뉴턴 3법칙, 장력은 케이블 일직선·도르래 지나도 T1=T2, 스프링 F=kδ", src="정역학/2026-09-16/수업요약_3주차_W3-2.md 꼭 외울 것"),
 dict(id="mech.fbd", name="자유물체도 (Free Body Diagram)", level="전공", subject="정역학", hours=1, prereq=["mech.forces_types"], tags=["정역학"], desc="물체를 떼어내고 작용하는 힘만 그림. 평형 문제의 첫 단계", src="정역학/2026-09-16/수업요약_3주차_W3-2.md · 4주차 계속"),
 # 아카데믹글쓰기 (교재 『아카데믹 글쓰기』)
 dict(id="wr.topic", name="글감과 주제 설정 · 주제문", level="전공", subject="아카데믹글쓰기", hours=1, prereq=[], tags=["글쓰기"], desc="글감→주제→주제문(한 문장), 글쓰기 활동① 주제문 쓰기", src="아카데믹글쓰기/2026-09-08/정리.md"),
 dict(id="wr.structure", name="글의 구성 — 3단·4단·5단", level="전공", subject="아카데믹글쓰기", hours=1, prereq=["wr.topic"], tags=["글쓰기"], desc="서론·본론·결론 / 기승전결 / 발단·전개·위기·절정·결말. 논리적 흐름 vs 서사적 흐름 (교재 64쪽)", src="아카데믹글쓰기/2026-09-15/정리.md ③-2·③-4 ★"),
 dict(id="wr.outline", name="개요 — 정의 · 효과 5 · 종류 · 작성 절차 4단계", level="전공", subject="아카데믹글쓰기", hours=1.5, prereq=["wr.structure"], tags=["글쓰기"], desc="설계도. 단락/장절/줄거리 중심, 화제/문장 개요. 항목 정리→점검→분류→계열화 (교재 67~90쪽)", src="아카데믹글쓰기/2026-09-15/정리.md ③-5~③-8 ★"),
 dict(id="wr.paragraph", name="문장과 단락 — 들여쓰기 · 단락 나누기", level="전공", subject="아카데믹글쓰기", hours=1, prereq=["wr.outline"], tags=["글쓰기"], desc="단어<문장<단락, 중심 문장+뒷받침 문장, 들여쓰기로 구분 (교재 150·158쪽) — 기말 손메모 「들여쓰기」", src="아카데믹글쓰기/2026-09-15 48~53장 · 2026-09-22 4주차"),
 dict(id="wr.spelling", name="한글 맞춤법 · 띄어쓰기", level="전공", subject="아카데믹글쓰기", hours=2, prereq=[], tags=["글쓰기"], desc="'하' 탈락(40항)·-든/-던(56항)·예사소리 어미(53항)·사이시옷(30항)·조사 vs 의존명사(41·42항)·단위·호칭(43·48항) — 활동③ 연습문제, 기말 출제 예정", src="아카데믹글쓰기/_과제/4주차_활동3_맞춤법띄어쓰기_정답표.md"),
]
added = 0
for n in NEW:
    if n["id"] in have: continue
    g["nodes"].append(n); have.add(n["id"]); added += 1
if "아카데믹글쓰기" not in g["subjects"]: g["subjects"].append("아카데믹글쓰기")
g["updated"] = "2026-09-22"
io.open(os.path.join(K, "graph.json"), "w", encoding="utf-8", newline="\n").write(json.dumps(g, ensure_ascii=False, indent=1))
print("graph: +%d nodes → %d" % (added, len(g["nodes"])))

def week(sub, w, title, dates, nodes, materials, planned=False):
    d = m.setdefault(sub, {"weeks": {}, "problems": []})
    e = {"title": title, "dates": dates, "nodes": nodes, "materials": materials}
    if planned: e["planned"] = True
    d["weeks"][str(w)] = e

# 2주차 보정 (정리.md 진도 기준으로 빠진 노드 추가)
m["공업수학1"]["weeks"]["2"]["nodes"] = ["ode.direction_field", "ode.separable", "ode.homogeneous", "ode.exact", "ode.integrating_factor", "ode.linear1", "ode.bernoulli"]
m["공업수학1"]["weeks"]["2"]["title"] = "Ch.1 1.2 방향장 · 1.3 변수분리형 · 1.4 완전 ODE·적분인자 (9/9 결석) · 1.5 선형 ODE + 베르누이 (9/11)"
m["미분적분학2"]["weeks"]["2"]["nodes"] = ["lin.cofactor", "lin.det_props", "lin.inverse", "lin.linear_system", "lin.cramer", "vec.coords3d"]
m["미분적분학2"]["weeks"]["2"]["title"] = "(4)~(7) 소행렬식·여인수 → 역행렬 · 크래머 (9/8 결석) · 12.1 3차원 좌표계 도입 (9/10 지각)"
m["미분적분학2"]["weeks"]["2"].pop("planned", None)
m["일반물리학2"]["weeks"]["2"]["title"] = "22장 전기장 계산 — 점전하군·쌍극자(Σ)·직선 도선(∫) (9/9 결석) → 원형 도선·원판 + 23장 가우스 서론 (9/11)"
m["일반물리학2"]["weeks"]["2"]["nodes"] = ["em.superposition", "em.dipole", "em.continuous", "calc.definite", "em.gauss"]
m["정역학"]["weeks"]["2"]["nodes"] = ["mech.statics_intro", "mech.force_vector", "mech.force_3d", "mech.dot_apps"]
m["정역학"]["weeks"]["2"]["title"] = "Ch.1 Introduction 마무리 · Ch.2 벡터 — 단위벡터·성분(2D·3D)·위치벡터·방향여현·내적 정의 (9/7 · 9/9 결석)"

# 3주차 (2026-09-13 ~ 09-19)
week("공업수학1", 3, "베르누이 연습 · 1장 총정리 → 2.1 2계 선형 ODE(중첩 원리·IVP·1차독립·기저) · 차수축소법 소개 (9/16) · 9/18 회차 정리 없음", ["2026-09-16", "2026-09-18"],
     ["ode.bernoulli", "ode.second_order", "ode.superposition", "ode.basis", "ode.reduction_order"],
     ["공업수학1/2026-09-16/정리.md", "공업수학1/_과제/3주차_과제_제출용.html"])
week("미분적분학2", 3, "12.1 곡면 그리기·거리·구면의 방정식 (9/15) → 12.2 벡터 — 위치벡터·두 점 벡터·크기·연산·표준기저·단위벡터 (9/17)", ["2026-09-15", "2026-09-17"],
     ["vec.coords3d", "vec.distance_sphere", "vec.position_ops", "vec.basis_unit"],
     ["미분적분학2/2026-09-15/정리.md", "미분적분학2/2026-09-17/정리.md"])
week("일반물리학2", 3, "23장 가우스 법칙 전부 — 가우스면 3종·도체구·부도체구 (9/16) → 24장 전기 퍼텐셜 전부 + 25장 도입 (9/18)", ["2026-09-16", "2026-09-18"],
     ["em.gauss", "em.gauss_apps", "em.potential_energy", "em.potential", "em.potential_dist", "em.capacitance"],
     ["일반물리학2/2026-09-16/정리.md", "일반물리학2/2026-09-18/정리.md"])
week("정역학", 3, "2.3 내적 성질·각·정사영 → 2.4 외적 정의·행렬식 (9/14) · W3-2 혼합삼중적 → Ch.3 힘의 종류·자유물체도 (9/16 영상+교수필기)", ["2026-09-14", "2026-09-16"],
     ["mech.dot_apps", "mech.projection", "mech.cross_apps", "mech.triple_product", "mech.forces_types", "mech.fbd"],
     ["정역학/2026-09-14/정리.md", "정역학/2026-09-16/수업요약_3주차_W3-2.md", "정역학/2026-09-16/영상정리_3주차_W3-2_삼중적과힘.md"])
week("CADD", 3, "Week 3 투상도법 (LMS 영상 25분, 시청 완료) + CATIA Part Design 2D 실습 · Week3 과제 제출 완료", ["2026-09-15"],
     ["cad.orthographic", "cad.tool"],
     ["CADD/2026-09-15/영상정리_3주차_투상도법.md"])
week("아카데믹글쓰기", 3, "글의 구조화: 구성(3단·4단·5단)과 개요 — 효과 5·종류·유의점·절차 4단계 · 신형철 칼럼 구성 파악(활동②)", ["2026-09-15"],
     ["wr.structure", "wr.outline"],
     ["아카데믹글쓰기/2026-09-15/정리.md", "아카데믹글쓰기/2026-09-15/자료요약_3주차_글의구조화_구성과개요.md"])
# 1·2주차 글쓰기 (map 에 과목이 없었음)
week("아카데믹글쓰기", 1, "OT · 교과목 소개 · 평가(기말 20점 이론 키워드 등) (9/1)", ["2026-09-01"], [], ["아카데믹글쓰기/2026-09-01/자료요약_1주차_강의계획서.md"])
week("아카데믹글쓰기", 2, "글에 담는 내 생각: 글감과 주제 설정 · 활동① 주제문 쓰기 (9/8 결석 — LMS 44장으로 따라잡음)", ["2026-09-08"], ["wr.topic"], ["아카데믹글쓰기/2026-09-08/정리.md"])
# 4주차 (2026-09-20 ~ 09-26) — 예고·강의계획서 기준 planned. 추석 9/24(목)·9/25(금) 휴강
week("공업수학1", 4, "2.1 차수축소법 예제 → 2.2 상수계수 제차 선형 ODE(특성방정식 3경우) 예상 (9/23 수) · 9/25 금 추석 휴강", ["2026-09-23"],
     ["ode.reduction_order", "ode.const_coeff"], [], planned=True)
week("미분적분학2", 4, "12.2 Ex 마무리 → 12.3 내적(정의·각·정사영) 예상 (9/22 화) · 9/24 목 추석 휴강", ["2026-09-22"],
     ["vec.basis_unit", "vec.dot_calc2"], [], planned=True)
week("일반물리학2", 4, "25장 전기 용량 — 평행판·직렬/병렬·유전체 예상 (9/23 수) · 9/25 금 추석 휴강", ["2026-09-23"],
     ["em.capacitance"], [], planned=True)
week("정역학", 4, "Ch.3 입자의 평형 — FBD·2D/3D 평형 방정식 예상 (9/21 월 · 9/23 수)", ["2026-09-21", "2026-09-23"],
     ["mech.fbd", "mech.equilibrium_particle"], [], planned=True)
week("CADD", 4, "Week 4 LMS 영상(월 업로드) → 수 수업 → 일 마감 (9/22 화 수업)", ["2026-09-22"], ["cad.tool", "cad.dimensioning"], [], planned=True)
week("아카데믹글쓰기", 4, "글의 시각화: 문장과 단락 쓰기 (9/22) · 활동③ 맞춤법·띄어쓰기 토론방 ~9/27", ["2026-09-22"],
     ["wr.paragraph", "wr.spelling"], ["아카데믹글쓰기/2026-09-22/정리.md", "아카데믹글쓰기/_과제/4주차_활동3_맞춤법띄어쓰기_정답표.md"], planned=True)
m["_meta"]["updated"] = "2026-09-22"
m["_meta"]["note"] = m["_meta"].get("note", "") + " | 2026-09-22: 3주차 확정·4주차 planned(예고), 2주차 노드를 정리.md 진도 기준으로 보정, 아카데믹글쓰기 과목 추가."
io.open(os.path.join(K, "map.json"), "w", encoding="utf-8", newline="\n").write(json.dumps(m, ensure_ascii=False, indent=1))
print("map:", {k: sorted(v["weeks"].keys(), key=int) for k, v in m.items() if k != "_meta"})
