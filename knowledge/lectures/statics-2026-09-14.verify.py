# 정역학 9/14 강의안 검산(docs/강의안-작성-규격.md: 회차마다 <lessonId>.verify.py, lecture_check.py 가 실행해 종료 코드 0 이어야 통과).
# 대본 예제·섹션 확인 c1~c5·학습지 w1~w3 의 정답과 오답 해설 숫자를 다시 계산한다.
import math
dot = lambda a, b: sum(x * y for x, y in zip(a, b))
cross = lambda a, b: (a[1]*b[2]-a[2]*b[1], -(a[0]*b[2]-a[2]*b[0]), a[0]*b[1]-a[1]*b[0])
norm = lambda a: math.sqrt(dot(a, a))
ang = lambda a, b: math.degrees(math.acos(dot(a, b) / (norm(a) * norm(b))))
close = lambda x, y, t=0.05: abs(x - y) < t

# 대본 예제 — s2: U=(1,2,2), V=(2,0,1) → U·V=4, |U|=3, |V|=√5, θ≈53.4°
assert dot((1, 2, 2), (2, 0, 1)) == 4 and norm((1, 2, 2)) == 3 and close(ang((1, 2, 2), (2, 0, 1)), 53.4)
# s3: U=4i+3j, L 방향 i+j → U·e=7/√2≈4.95, U_p=3.5i+3.5j, U_n=0.5i−0.5j, U_n·e=0
e = (1 / math.sqrt(2), 1 / math.sqrt(2), 0); s = dot((4, 3, 0), e)
assert close(s, 4.95, 0.01) and all(close(s * x, 3.5, 1e-9) for x in e[:2])
assert close(dot((0.5, -0.5, 0), e), 0, 1e-12)
# s5: U=(1,2,3), V=(4,5,6) → (−3, 6, −3), U·(U×V)=0
assert cross((1, 2, 3), (4, 5, 6)) == (-3, 6, -3) and dot((1, 2, 3), (-3, 6, -3)) == 0

# c1: (i+2j+3k)·(2i−j)=0 · 오답 4 = −1 부호를 놓침(2+2), (2,−2,0) = 곱만 하고 안 더함
assert dot((1, 2, 3), (2, -1, 0)) == 0 and 1 * 2 + 2 * 1 == 4
# c2: (2,1,2),(1,0,1) → 19.5° · 오답 61.9° = z 성분 곱 누락(U·V=2) · 53.4° = 강의 예제 답
assert close(ang((2, 1, 2), (1, 0, 1)), 19.5) and close(math.degrees(math.acos(2 / (3 * math.sqrt(2)))), 61.9)
# c3: 3i+5j 를 i+j 방향으로 → U_p=4i+4j · 오답 8i+8j = e 미정규화 · 8/√2 = 한 번만 나눔 · −i+j = U_n
e = (1 / math.sqrt(2), 1 / math.sqrt(2), 0); s = dot((3, 5, 0), e)
assert close(s * e[0], 4, 1e-9) and dot((3, 5, 0), (1, 1, 0)) == 8 and close(dot((-1, 1, 0), e), 0, 1e-12)
# c4: |U|=2,|V|=3,30° → 3 · 오답 3√3 = cos 사용 · 6 = sin 빠뜨림
assert close(2 * 3 * math.sin(math.radians(30)), 3, 1e-9) and close(2 * 3 * math.cos(math.radians(30)), 3 * math.sqrt(3), 1e-9)
# c5: (2,0,1)×(1,3,0) = (−3,1,6) · 오답 (−3,−1,6) = j 부호 누락 · (3,−1,−6) = V×U
assert cross((2, 0, 1), (1, 3, 0)) == (-3, 1, 6) and cross((1, 3, 0), (2, 0, 1)) == (3, -1, -6) and dot((2, 0, 1), (-3, 1, 6)) == 0

# q3(개념): U 의 L 평행 성분 = (U·e)e — 위 s3 예제에서 (U·e)e 가 3.5i+3.5j 로 맞고, 스칼라 U·e 만으로는 벡터가 아님
assert close(dot((4, 3, 0), e3 := (1 / math.sqrt(2), 1 / math.sqrt(2), 0)) * e3[0], 3.5, 1e-9)
# q4(개념): V×U = −(U×V), 평행이면 0 — 교환법칙 불성립
assert cross((4, 5, 6), (1, 2, 3)) == tuple(-x for x in cross((1, 2, 3), (4, 5, 6))) and cross((1, 2, 3), (2, 4, 6)) == (0, 0, 0)
# w1(도전): A(1,0,0) B(0,2,0) C(0,0,3) → AB×AC=(6,3,2), |·|=7 → 넓이 7/2 · 오답 7 = 절반 안 함 · 11/2 = 성분 합/2
assert cross((-1, 2, 0), (-1, 0, 3)) == (6, 3, 2) and norm((6, 3, 2)) == 7 and (6 + 3 + 2) / 2 == 5.5
# w2(변형, s2): (1,1,0),(0,1,1) → U·V=1, |U|=|V|=√2 → 60° · 오답 45° = 크기 하나만 나눔(1/√2) · 30° = 1/2 을 사인으로 역산 · 90° = y 성분 곱 1 누락(U·V=0)
assert dot((1, 1, 0), (0, 1, 1)) == 1 and close(ang((1, 1, 0), (0, 1, 1)), 60)
assert close(math.degrees(math.acos(1 / math.sqrt(2))), 45) and close(math.degrees(math.asin(0.5)), 30) and close(math.degrees(math.acos(0)), 90)
# w3(변형, s3): U=3i+j 를 방향 i−j 직선으로 → e=(i−j)/√2, U·e=2/√2=√2, U_p=i−j, U_n=2i+2j, U_n·e=0
#   오답 2i−2j = e 미정규화((U·(i−j))(i−j)), √2i−√2j = 한 번만 나눔, 2i+2j = U_n
e = (1 / math.sqrt(2), -1 / math.sqrt(2), 0); s = dot((3, 1, 0), e)
assert close(s, math.sqrt(2), 1e-12) and close(s * e[0], 1, 1e-9) and close(s * e[1], -1, 1e-9)
assert close(dot((2, 2, 0), e), 0, 1e-12) and dot((3, 1, 0), (1, -1, 0)) == 2
print('검산 문항: c1 c2 c3 c4 c5 w1 w2 w3 q3 q4')   # q3·q4 는 개념 문항(식 고르기)이라 위 assert 로 정답 식을 확인

