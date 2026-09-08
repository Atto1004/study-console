# -*- coding: utf-8 -*-
"""build_graph.py — graph.json 생성기 (야간 작업 2026-09-09). 노드를 고치려면 여기서 고치고 다시 실행한다.
사용: python build_graph.py  → graph.json 덮어씀 → python check_graph.py 로 검증."""
import json, os
N = []
def n(id, name, level, subject, hours, prereq, tags, desc, src=None):
    d = {"id": id, "name": name, "level": level, "subject": subject, "hours": hours, "prereq": prereq, "tags": tags, "desc": desc}
    if src:
        d["src"] = src
    N.append(d)
G = "일반 지식"
K = "공업수학1/_정리노트/Ch1_1계상미분방정식_정리노트.html"
K2 = "공업수학1/2026-09-02/정리.md"
K3 = "공업수학1/2026-09-04/정리.md"
M = "미분적분학2/2026-09-01/학습지_정리.md"
M2 = "미분적분학2/2026-09-03/정리.md"
P = "일반물리학2/2026-09-04/정리.md"
P2 = "일반물리학2/_정리노트/2026-09-04_전하와전기장서론.html"
S = "정역학/2026-09-02/정리.md"
# ── 중등 ──
n("alg.integer_fraction", "정수·유리수 계산", "중등", "공통", 1, [], ["대수"], "음수·분수·소수의 사칙연산과 부호 규칙", G)
n("alg.ratio", "비와 비율", "중등", "공통", 1, [], ["대수"], "비·비율·비례식, 단위당 양(속력·밀도) 계산", G)
n("alg.expression", "문자와 식", "중등", "공통", 1, ["alg.integer_fraction"], ["대수"], "문자로 식 세우기, 동류항 정리, 대입", G)
n("alg.exponent_rules", "지수법칙", "중등", "공통", 1, ["alg.expression"], ["대수"], "aᵐ·aⁿ=aᵐ⁺ⁿ, (aᵐ)ⁿ, 음의 지수·분수 지수", G)
n("alg.sqrt", "제곱근과 무리수", "중등", "공통", 1, ["alg.exponent_rules"], ["대수"], "√의 뜻, 제곱근의 계산·유리화", G)
n("alg.linear_eq", "일차방정식", "중등", "공통", 1, ["alg.expression"], ["대수"], "이항·양변 나누기로 미지수 하나 풀기", G)
n("alg.simul_eq", "연립일차방정식", "중등", "공통", 1.5, ["alg.linear_eq"], ["대수"], "가감법·대입법으로 미지수 2~3개 풀기", G)
n("alg.linear_func", "일차함수와 그래프", "중등", "공통", 1.5, ["alg.linear_eq"], ["대수", "함수"], "y=ax+b, 기울기와 절편, 직선의 방정식", G)
n("alg.factoring", "전개와 인수분해", "중등", "공통", 1.5, ["alg.expression"], ["대수"], "곱셈공식, 공통인수·완전제곱·합차 인수분해", G)
n("alg.quadratic_eq", "이차방정식", "중등", "공통", 1.5, ["alg.factoring", "alg.sqrt"], ["대수"], "인수분해·근의 공식·판별식", G)
n("alg.quadratic_func", "이차함수", "중등", "공통", 2, ["alg.quadratic_eq", "alg.linear_func"], ["대수", "함수"], "y=ax²+bx+c 그래프, 꼭짓점, 최대·최소", G)
n("geo.angle", "각과 평행선·삼각형의 성질", "중등", "공통", 1, [], ["기하"], "동위각·엇각, 삼각형 내각의 합 180°", G)
n("geo.similarity", "도형의 닮음", "중등", "공통", 1, ["geo.angle", "alg.ratio"], ["기하"], "닮은 삼각형의 대응변 비, 축척", G)
n("geo.pythagoras", "피타고라스 정리", "중등", "공통", 1, ["alg.sqrt", "geo.angle"], ["기하"], "a²+b²=c², 직각삼각형 빗변·거리 계산", G)
n("geo.solid", "입체도형과 전개도", "중등", "공통", 1, ["geo.angle"], ["기하"], "기둥·뿔·구의 모양, 전개도·단면, 겉넓이·부피", G)
# ── 고교 ──
n("alg.function", "함수의 개념·합성·역함수", "고교", "공통", 1.5, ["alg.quadratic_func"], ["대수", "함수"], "정의역·치역, 합성함수, 역함수, 그래프 이동", G)
n("alg.polynomial", "다항식의 연산·항등식", "고교", "공통", 1.5, ["alg.factoring"], ["대수"], "다항식 나눗셈, 나머지정리, 항등식의 계수 비교", G)
n("alg.rational_func", "유리식과 부분분수", "고교", "공통", 1.5, ["alg.polynomial"], ["대수"], "분수식 통분·약분, A/(x−a)+B/(x−b) 꼴로 쪼개기", G)
n("alg.exp_log", "지수함수·로그함수", "고교", "공통", 2, ["alg.exponent_rules", "alg.function"], ["대수", "함수"], "eˣ와 ln x, 로그의 성질, 지수·로그 방정식", G)
n("alg.inverse_square", "역제곱 관계", "고교", "공통", 0.5, ["alg.ratio", "alg.exponent_rules"], ["대수", "물리"], "F ∝ 1/r²: 거리 2배면 1/4, 그래프 모양과 계산", G)
n("alg.sequence", "수열과 급수", "고교", "공통", 2, ["alg.function"], ["대수"], "등차·등비수열, Σ 기호, 무한급수의 합", G)
n("trig.ratio", "삼각비 (sin·cos·tan)", "고교", "공통", 1.5, ["geo.pythagoras", "geo.similarity"], ["삼각"], "직각삼각형에서 변의 비, 특수각 값 30°·45°·60°", G)
n("trig.radian", "호도법과 일반각", "고교", "공통", 1, ["trig.ratio"], ["삼각"], "π rad = 180°, 각의 부호와 사분면", G)
n("trig.function", "삼각함수와 그래프", "고교", "공통", 2, ["trig.radian", "alg.function"], ["삼각", "함수"], "sin·cos·tan의 그래프, 주기·진폭, 단위원 정의", G)
n("trig.identity", "삼각함수 항등식·덧셈정리", "고교", "공통", 2, ["trig.function"], ["삼각"], "sin²+cos²=1, 덧셈·배각·반각 공식", G)
n("trig.law", "사인법칙·코사인법칙", "고교", "공통", 1.5, ["trig.ratio"], ["삼각", "기하"], "일반 삼각형에서 변·각 구하기 (힘의 평행사변형에 쓰임)", G)
n("vec.basic", "벡터의 뜻·덧셈·실수배", "고교", "공통", 1.5, ["alg.expression", "geo.pythagoras"], ["벡터"], "크기와 방향, 화살표 덧셈(삼각형·평행사변형), 스칼라배", G)
n("vec.components", "벡터의 성분 분해", "고교", "공통", 2, ["vec.basic", "trig.ratio"], ["벡터"], "Fx=F cosθ, Fy=F sinθ, 성분끼리 더해 합벡터, 크기=√(x²+y²)", G)
n("vec.unit", "단위벡터와 방향코사인", "고교", "공통", 1, ["vec.components"], ["벡터"], "i, j, k 표기, 크기 1로 나누기, 방향각 cosα·cosβ·cosγ", G)
n("vec.3d", "3차원 벡터와 공간좌표", "고교", "공통", 1.5, ["vec.components"], ["벡터"], "(x,y,z) 성분, 공간에서 크기·거리·중점", G)
n("vec.dot", "벡터의 내적", "고교", "공통", 1.5, ["vec.components", "trig.function"], ["벡터"], "A·B=|A||B|cosθ=AxBx+AyBy+AzBz, 두 벡터 사이 각·정사영", G)
n("calc.limit", "극한", "고교", "공통", 2, ["alg.function"], ["미적분"], "x→a 일 때 함수값이 다가가는 값, 좌·우극한, ∞ 극한", G)
n("calc.continuity", "연속", "고교", "공통", 1, ["calc.limit"], ["미적분"], "극한값 = 함수값이면 연속, 불연속점 판정", G)
n("calc.derivative", "미분계수와 도함수", "고교", "공통", 2, ["calc.limit"], ["미적분"], "순간변화율 = 접선 기울기, f′(x)=lim Δy/Δx", G)
n("calc.diff_rules", "미분법 (곱·몫·연쇄)", "고교", "공통", 2, ["calc.derivative", "alg.polynomial"], ["미적분"], "(fg)′=f′g+fg′, (f/g)′, 합성함수 연쇄법칙", G)
n("calc.trans_diff", "초월함수의 미분", "고교", "공통", 2, ["calc.diff_rules", "alg.exp_log", "trig.function"], ["미적분"], "(eˣ)′=eˣ, (ln x)′=1/x, (sin x)′=cos x, (cos x)′=−sin x", G)
n("calc.implicit", "음함수 미분", "고교", "공통", 1.5, ["calc.diff_rules"], ["미적분"], "F(x,y)=0 을 x 로 미분해 dy/dx 구하기 (y 를 x 의 함수로 보고 연쇄법칙)", G)
n("calc.integral", "부정적분·적분법", "고교", "공통", 2, ["calc.diff_rules"], ["미적분"], "미분의 역연산, ∫xⁿdx, ∫eˣdx, ∫(1/x)dx=ln|x|+C, 적분상수", G)
n("calc.definite", "정적분과 넓이", "고교", "공통", 2, ["calc.integral"], ["미적분"], "∫ₐᵇ f dx = F(b)−F(a), 넓이·누적량 계산, 무한소 dx 로 쪼개 더하기", G)
n("calc.substitution", "치환적분", "고교", "공통", 2, ["calc.integral"], ["미적분"], "u=g(x) 로 바꿔 ∫f(g(x))g′(x)dx=∫f(u)du", G)
n("calc.by_parts", "부분적분", "고교", "공통", 2, ["calc.substitution", "calc.trans_diff"], ["미적분"], "∫u dv = uv − ∫v du, x·eˣ·삼각 곱 적분", G)
n("calc.partial_fraction_int", "부분분수 적분", "고교", "공통", 1.5, ["calc.integral", "alg.rational_func"], ["미적분"], "∫1/((x−a)(x−b)) 를 쪼개 ln 으로 적분 (로지스틱·분리형 ODE 에 필수)", G)
n("phys.units", "단위·차원·유효숫자", "고교", "공통", 1, ["alg.ratio"], ["물리"], "SI 기본단위(m·kg·s·A), 접두어(k·m·μ·n), 단위 환산과 차원 확인", G)
n("phys.scalar_vector", "스칼라와 벡터 물리량", "고교", "공통", 0.5, ["vec.basic", "phys.units"], ["물리", "벡터"], "크기만 있는 양(질량·에너지) vs 방향도 있는 양(힘·속도·전기장)", G)
n("mech.kinematics", "운동학 (위치·속도·가속도)", "고교", "공통", 2, ["calc.derivative", "phys.units"], ["역학"], "v=dx/dt, a=dv/dt, 등가속도 공식, 그래프 해석", G)
n("mech.newton", "뉴턴 운동 법칙", "고교", "공통", 2, ["mech.kinematics", "vec.components"], ["역학"], "1법칙 관성, 2법칙 ΣF=ma, 3법칙 작용·반작용, 벡터 방정식", G)
n("mech.force_types", "힘의 종류", "고교", "공통", 1.5, ["mech.newton"], ["역학"], "중력 mg, 수직항력, 마찰력 μN, 장력, 탄성력 kx", G)
n("mech.fbd", "자유물체도 (FBD)", "고교", "공통", 1.5, ["mech.force_types"], ["역학"], "물체 하나만 떼어 작용하는 힘을 전부 화살표로 그리기", G)
n("mech.energy", "일과 에너지", "고교", "공통", 2, ["mech.newton", "calc.definite"], ["역학"], "W=∫F·dx, 운동·위치에너지, 에너지 보존", G)
n("em.charge", "전하와 전하량 보존·양자화", "고교", "일반물리학2", 1, ["phys.units"], ["전자기"], "전기의 소스 = 전하, q=ne (e=1.6×10⁻¹⁹ C), 마찰·유도·알짜 전하 세기", P)
n("em.coulomb", "쿨롱 법칙", "고교", "일반물리학2", 2, ["em.charge", "vec.components", "alg.inverse_square"], ["전자기"], "F=k q₁q₂/r², k=1/4πε₀≈9×10⁹, 인력·척력 방향은 두 전하를 잇는 직선", P2)
# ── 대학기초 ──
n("lin.matrix", "행렬의 정의와 종류", "대학기초", "미분적분학2", 1.5, ["alg.simul_eq", "alg.expression"], ["선형대수"], "m×n 행렬, 성분 aᵢⱼ, 정사각·단위(I)·영(O)·전치(Aᵀ)·대칭행렬", M)
n("lin.matrix_ops", "행렬의 연산", "대학기초", "미분적분학2", 2, ["lin.matrix"], ["선형대수"], "상등·합차·실수배·곱(m×n · n×p → m×p, 앞 열 수 = 뒤 행 수)·거듭제곱, AB≠BA", M2)
n("lin.det2", "2차 행렬식", "대학기초", "미분적분학2", 1, ["lin.matrix_ops"], ["선형대수"], "det A = ad − bc, 표기 |A| (세로줄), det=0 이면 특이행렬", M2)
n("lin.det3", "3차 행렬식·사루스 법칙", "대학기초", "미분적분학2", 1.5, ["lin.det2"], ["선형대수"], "↘ 3개 곱의 합 − ↙ 3개 곱의 합, 손계산 3차까지", M2)
n("lin.cofactor", "소행렬식과 여인수 전개", "대학기초", "미분적분학2", 2, ["lin.det3"], ["선형대수"], "Mᵢⱼ 소행렬식, Cᵢⱼ=(−1)ⁱ⁺ʲMᵢⱼ, 임의 행·열로 전개해 n차 행렬식", M)
n("lin.det_props", "행렬식의 성질", "대학기초", "미분적분학2", 1.5, ["lin.cofactor"], ["선형대수"], "행 교환 부호 반전, 실수배, 두 행 같으면 0, det(AB)=det A·det B", G)
n("lin.inverse", "역행렬", "대학기초", "미분적분학2", 2, ["lin.det_props", "lin.cofactor"], ["선형대수"], "존재 조건 det A≠0, A⁻¹=adj A/det A, 2차 공식, AA⁻¹=I", M)
n("lin.linear_system", "연립1차방정식의 행렬 표현", "대학기초", "미분적분학2", 1.5, ["lin.matrix_ops", "alg.simul_eq"], ["선형대수"], "Ax=b 로 쓰기, 계수행렬·상수벡터, 해의 존재와 det", G)
n("lin.cramer", "크래머 법칙", "대학기초", "미분적분학2", 1.5, ["lin.inverse", "lin.linear_system"], ["선형대수"], "xᵢ = det(Aᵢ)/det(A), Aᵢ 는 i열을 상수항으로 교체", M)
n("vec.cross", "벡터의 외적", "대학기초", "공통", 2, ["vec.dot", "lin.det3"], ["벡터", "선형대수"], "A×B = |A||B|sinθ n̂, 3×3 행렬식으로 계산, 오른손 법칙", G)
n("calc.multivar", "다변수 함수와 편미분", "대학기초", "공통", 2, ["calc.trans_diff", "vec.3d"], ["미적분"], "z=f(x,y), ∂f/∂x 는 y 를 상수로 보고 미분, 혼합 편도함수 fxy=fyx", G)
n("calc.total_diff", "전미분과 다변수 연쇄법칙", "대학기초", "공통", 1.5, ["calc.multivar"], ["미적분"], "du = uₓdx + u_y dy, 매개변수 t 에 대한 미분", G)
n("calc.taylor", "테일러·매클로린 급수", "대학기초", "공통", 2, ["calc.trans_diff", "alg.sequence"], ["미적분"], "f(x)=Σ f⁽ⁿ⁾(a)(x−a)ⁿ/n!, eˣ·sin·cos 전개, 근사", G)
n("ode.concept", "미분방정식의 개념·계·ODE/PDE", "대학기초", "공업수학1", 1.5, ["calc.derivative", "calc.integral"], ["미분방정식"], "미지 함수의 도함수가 든 식, 상미분(변수 1개) vs 편미분, 계 = 최고 도함수 차수 ((dy/dx)³ 은 1계)", K2)
n("ode.modeling", "수학적 모델화 3단계", "대학기초", "공업수학1", 1.5, ["ode.concept", "mech.newton"], ["미분방정식", "모델링"], "물리 상황 → 미분방정식 세우기 → 풀기 → 해석. 예: 뉴턴 냉각, 공기저항 낙하, 투사체", K2)
n("ode.linearity", "선형·비선형 판별", "대학기초", "공업수학1", 1, ["ode.concept"], ["미분방정식"], "y 와 그 도함수가 1차이고 계수가 x 만의 함수면 선형. y², yy′, sin y 는 비선형", K2)
n("ode.solution", "해의 종류 (일반해·특수해·특이해)", "대학기초", "공업수학1", 1, ["ode.concept"], ["미분방정식"], "일반해 = 적분상수 c 포함, 특수해 = c 결정, 특이해는 공학에서 거의 안 다룸. n계 → 상수 n개", K3)
n("ode.ivp", "초기값 문제", "대학기초", "공업수학1", 1, ["ode.solution"], ["미분방정식"], "y(x₀)=y₀ 조건으로 c 결정. 초기조건(독립변수 0) vs 경계조건. Ex.4 y′=3y", K3)
n("ode.direction_field", "방향장과 오일러 방법", "대학기초", "공업수학1", 1.5, ["ode.solution", "alg.linear_func"], ["미분방정식"], "각 점에서 기울기 y′=f(x,y) 를 짧은 선분으로 그려 해 곡선 모양 보기, 등경사선, 수치해 y₁=y₀+hf", K)
n("ode.separable", "변수분리형 ODE", "대학기초", "공업수학1", 2, ["ode.ivp", "calc.integral", "alg.exp_log"], ["미분방정식"], "g(y)dy = f(x)dx 로 갈라 양변 적분. ln 이 나오면 e 로 벗겨 y 정리", K)
n("ode.homogeneous", "동차형 (y=ux 치환)", "대학기초", "공업수학1", 1.5, ["ode.separable"], ["미분방정식"], "y′=f(y/x) 꼴은 y=ux 로 두면 변수분리형이 된다 (1.3 확장)", K)
n("ode.exact", "완전미분방정식", "대학기초", "공업수학1", 2, ["ode.separable", "calc.multivar"], ["미분방정식"], "M dx + N dy = 0, ∂M/∂y=∂N/∂x 이면 완전. u(x,y)=c 를 적분으로 복원", K)
n("ode.integrating_factor", "적분인자", "대학기초", "공업수학1", 1.5, ["ode.exact"], ["미분방정식"], "완전하지 않으면 F=e^{∫R dx} 를 곱해 완전하게 만든다", K)
n("ode.linear1", "1계 선형 ODE", "대학기초", "공업수학1", 2, ["ode.integrating_factor", "calc.by_parts"], ["미분방정식"], "y′+p(x)y=r(x), 적분인자 e^{∫p dx} 곱해 (e^{∫p}y)′=e^{∫p}r → 공식 한 방", K)
n("ode.bernoulli", "베르누이 방정식", "대학기초", "공업수학1", 1.5, ["ode.linear1"], ["미분방정식"], "y′+py=gyᵃ 는 u=y^{1−a} 치환으로 선형이 된다", K)
n("ode.exp_model", "지수 성장·감쇠 모델", "대학기초", "공업수학1", 1, ["ode.separable", "ode.modeling"], ["미분방정식", "모델링"], "y′=ky → y=ce^{kx}. 뉴턴 냉각·방사성 붕괴·인구 모델", K)
# ── 전공 ──
n("ode.second_order", "2계 선형 ODE 개요", "전공", "공업수학1", 3, ["ode.linear1", "lin.det2"], ["미분방정식"], "y″+py′+qy=r, 동차해·특수해, 특성방정식 (Ch.2, 4~5주차 예정)", G)
n("em.field", "전기장의 정의·점전하의 전기장", "전공", "일반물리학2", 2, ["em.coulomb"], ["전자기"], "E = F/q₀ (시험전하 +1 C 가 받는 힘), 점전하 E=kq/r², 방향은 +전하에서 밖으로", P2)
n("em.superposition", "전기장의 중첩 (벡터 합)", "전공", "일반물리학2", 2, ["em.field", "vec.components"], ["전자기"], "여러 전하의 E 를 성분으로 나눠 더한다. 불연속 Σ, 연속 ∫", P2)
n("em.field_lines", "전기력선", "전공", "일반물리학2", 1, ["em.field"], ["전자기"], "+에서 −로, 밀도 ∝ 세기, 교차하지 않음. 전기장 = 전기력선 개수 세기", P)
n("em.constants", "ε₀·μ₀·c 의 관계", "전공", "일반물리학2", 0.5, ["em.coulomb"], ["전자기"], "ε₀=8.854×10⁻¹² 진공 유전율, μ₀=4π×10⁻⁷ 투자율, c=1/√(ε₀μ₀)", P)
n("em.continuous", "연속 전하분포의 전기장", "전공", "일반물리학2", 3, ["em.superposition", "calc.definite", "trig.ratio"], ["전자기"], "선·고리·원판 전하: dq=λdl 로 쪼개 dE 적분, 대칭으로 성분 소거", P2)
n("em.dipole", "전기 쌍극자와 토크", "전공", "일반물리학2", 1.5, ["em.field", "vec.cross"], ["전자기"], "p=qd, 균일 전기장 속 토크 τ=p×E, 쌍극자 축 위 전기장", P2)
n("mech.statics_intro", "정역학 개요·단위계", "전공", "정역학", 1, ["phys.units", "mech.newton"], ["역학"], "평형 상태의 힘 해석, SI/US 단위계, 뉴턴 3법칙 재정리, 유효숫자 (Ch.1)", S)
n("mech.force_vector", "힘의 벡터 표현과 합력", "전공", "정역학", 2, ["vec.components", "trig.law"], ["역학", "벡터"], "힘 = 벡터, 평행사변형 법칙, 직각성분으로 합력 R=ΣF, 방향각 (Ch.2)", S)
n("mech.force_3d", "3차원 힘과 방향코사인", "전공", "정역학", 2, ["mech.force_vector", "vec.unit", "vec.3d"], ["역학", "벡터"], "F=F(cosα i+cosβ j+cosγ k), 두 점을 잇는 단위벡터로 힘 표현 (Ch.2)", S)
n("mech.dot_apps", "내적의 응용 (성분·사이각)", "전공", "정역학", 1.5, ["vec.dot", "mech.force_vector"], ["역학", "벡터"], "어떤 방향으로의 힘 성분 = F·u, 두 힘 사이 각 (Ch.2)", S)
n("mech.cross_apps", "외적과 모멘트 개념", "전공", "정역학", 2, ["vec.cross", "mech.force_vector"], ["역학", "벡터"], "r×F 로 회전 효과, 방향은 오른손 법칙 (Ch.2 도입, Ch.4 본격)", S)
n("mech.equilibrium_particle", "질점의 평형", "전공", "정역학", 2, ["mech.fbd", "mech.force_vector"], ["역학"], "ΣF=0 → 성분별 방정식, 장력·스프링 문제 (Ch.3, 중간 범위)", S)
n("mech.moment", "힘의 모멘트", "전공", "정역학", 2, ["mech.cross_apps"], ["역학"], "M=r×F, 2차원은 M=Fd, 우력 (Ch.4, 중간 범위)", S)
n("cad.orthographic", "정투상법 (제3각법)", "전공", "CADD", 2, ["geo.solid"], ["CAD", "제도"], "정면·평면·측면도 배치, 숨은선·중심선 규칙 (KS/ISO)", G)
n("cad.dimensioning", "치수 기입", "전공", "CADD", 1.5, ["cad.orthographic"], ["CAD", "제도"], "치수선·치수보조선·화살표, 지름 φ·반지름 R, 중복 치수 금지 (KS 제도 규칙)", G)
n("cad.sketch_constraints", "스케치 구속 (기하·치수)", "전공", "CADD", 2, ["cad.dimensioning", "geo.angle"], ["CAD"], "수평·수직·일치·접선·동심 구속과 치수 구속으로 스케치를 완전 정의", G)
n("cad.tool", "CATIA 기본 조작", "전공", "CADD", 2, [], ["CAD"], "작업대(Sketcher·Part Design), 스케치 → 패드/포켓, 시점·선택 (강의계획서: CATIA 사용)", "study-console index.html CADD_SYLLABUS")

out = {"version": 1, "updated": "2026-09-09", "levels": ["중등", "고교", "대학기초", "전공"],
       "subjects": ["공통", "공업수학1", "미분적분학2", "일반물리학2", "정역학", "CADD"],
       "note": "id 접두어: alg 대수 · geo 기하 · trig 삼각 · vec 벡터 · calc 미적분 · lin 선형대수 · ode 미분방정식 · phys 물리기초 · mech 역학 · em 전자기 · cad CAD. src 가 '일반 지식'이면 표준 정의만 담았고 수업 자료 근거는 없다. 그 외 src 는 study-materials/ 아래 경로.",
       "nodes": N}
here = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(here, "graph.json"), "w", encoding="utf-8", newline="\n") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print(len(N), "nodes ->", os.path.join(here, "graph.json"))
