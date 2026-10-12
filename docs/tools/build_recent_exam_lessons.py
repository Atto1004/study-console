"""판서 대조 후 작성한 최근 수업 5회를 학교의 기존 교실 데이터로 생성한다.

원자료·학생 기록은 읽거나 수정하지 않는다. 출력은 지정한 checkout 안의
교실 HTML, 강의 순서 JSON, lessons.json의 다섯 날짜 등록뿐이다.
"""
import argparse
import html
import json
import re
from pathlib import Path


def section(title, concept, worked, check, options, why):
    return dict(title=title, concept=concept, worked=worked,
                check=check, options=options, why=why)


LESSONS = [
    dict(slug='calc2', course='미분적분학2', date='2026-10-06',
         title='12.5 평면과 교선 — 법선·외적·사잇각', sections=[
        section('평면의 법선벡터',
                r'평면 \(Ax+By+Cz=D\)의 법선벡터는 \((A,B,C)\)입니다. 평면 안의 방향벡터와 내적하면 0입니다.',
                r'예제: \(x+y+z=1\)의 법선은 \((1,1,1)\). 점 \((1,0,0)\)을 넣으면 좌변이 1이므로 이 평면 위에 있습니다.',
                r'평면 \(2x-y+3z=7\)의 법선벡터는?',
                ['(2, −1, 3)', '(2, 1, 3)', '(7, 7, 7)', '(2, −1, 7)'],
                'x, y, z의 계수만 차례대로 읽습니다. 오른쪽 상수 7은 법선의 성분이 아닙니다.'),
        section('세 점을 지나는 평면',
                r'세 점 P,Q,R에서 \(\overrightarrow{PQ}\), \(\overrightarrow{PR}\)를 만듭니다. 외적이 0이 아니면 두 벡터에 수직인 법선이 됩니다.',
                r'P(1,3,2), Q(3,−1,6), R(5,2,0): PQ=(2,−4,4), PR=(4,−1,−2). 외적=(12,20,14). 따라서 \(6x+10y+7z=50\). 세 점을 각각 넣어 확인합니다.',
                'P(0,0,1), Q(1,0,1), R(0,2,1)을 지나는 평면은?',
                ['z=1', 'x=1', 'y=1', 'x+y+z=1'],
                'PQ=(1,0,0), PR=(0,2,0), 외적=(0,0,2). P를 지나므로 2(z−1)=0, 즉 z=1입니다.'),
        section('교선의 방향벡터',
                r'두 평면의 교선은 두 법선에 모두 수직입니다. 법선의 외적이 0이 아니면 그 외적을 교선의 방향벡터로 쓸 수 있습니다.',
                r'\(x+y+z=1\), \(x-2y+3z=1\): 법선은 (1,1,1), (1,−2,3). 외적=(5,−2,−3). 두 법선과 내적하면 각각 0입니다.',
                '법선 (1,0,1), (0,1,1)의 외적은?',
                ['(−1, −1, 1)', '(1, 1, 1)', '(−1, 1, 1)', '(1, −1, 1)'],
                '외적의 성분은 (0·1−1·1, 1·0−1·1, 1·1−0·0)=(−1,−1,1)입니다. 두 법선과의 내적도 0입니다.'),
        section('교선 위의 점과 방정식',
                r'방향벡터만으로 직선의 위치는 정해지지 않습니다. 두 평면을 동시에 만족하는 점도 하나 찾아야 합니다.',
                r'앞의 두 평면에서 z=0으로 두면 x+y=1, x−2y=1. 따라서 (1,0,0). 교선은 \(\mathbf r(t)=(1,0,0)+t(5,-2,-3)\). 두 평면에 대입하면 모든 t에서 1입니다.',
                r'\(x+y+z=2\), \(x-y+z=0\)의 교선 위에 있는 점은?',
                ['(1, 1, 0)', '(2, 0, 0)', '(0, 0, 2)', '(0, 1, 0)'],
                '두 식을 빼면 2y=2이므로 y=1. z=0이면 x=1. (1,1,0)은 두 식을 모두 만족합니다.'),
        section('두 평면 사이의 작은 각',
                r'평면 사이의 작은 각 \(0\leq\theta\leq\pi/2\)는 \(\cos\theta=|\mathbf n_1\cdot\mathbf n_2|/(|\mathbf n_1||\mathbf n_2|)\)로 구합니다. 절댓값으로 법선의 부호 선택 영향을 없앱니다.',
                r'(1,1,1)·(1,−2,3)=2, 크기는 √3과 √14. 따라서 \(\cos\theta=2/\sqrt{42}\). 각도는 이 값의 역코사인입니다.',
                '법선 (1,0,0), (1,1,0)인 두 평면의 작은 각은?',
                ['45°', '0°', '60°', '90°'],
                '내적은 1, 크기의 곱은 √2. cosθ=1/√2이므로 θ=45°입니다.'),
    ], worksheet=[
        (r'\(x+y+z=1\), \(x-2y+3z=1\)의 교선식으로 옳은 것은?',
         [r'\(\mathbf r=(1,0,0)+t(5,-2,-3)\)', r'\(\mathbf r=(0,0,0)+t(5,-2,-3)\)', r'\(\mathbf r=(1,0,0)+t(1,1,1)\)', r'\(\mathbf r=(1,0,0)+t(1,-2,3)\)'],
         '점 (1,0,0)은 두 평면 위에 있고 방향 (5,−2,−3)은 두 법선에 수직입니다. 법선 자체를 방향으로 쓰면 교선이 되지 않습니다.'),
        ('P(1,0,0), Q(0,2,0), R(0,0,3)을 지나는 평면은?',
         ['6x+3y+2z=6', 'x+2y+3z=1', '6x+3y+2z=1', 'x+y+z=6'],
         'PQ=(−1,2,0), PR=(−1,0,3), 외적=(6,3,2). P를 대입하면 오른쪽 상수는 6. Q와 R도 좌변이 6입니다.')]),
    dict(slug='calc2', course='미분적분학2', date='2026-10-08',
         title='13.1 벡터함수 — 정의역·극한·공간곡선·선분', sections=[
        section('벡터함수와 성분',
                r'\(\mathbf r(t)=(f(t),g(t),h(t))\)는 t 하나를 넣으면 위치벡터 하나가 나오는 함수입니다. 세 성분이 각각 x,y,z 좌표를 정합니다.',
                r'\(\mathbf r(t)=(1+t,2+5t,-1+6t)\)에서 t=0이면 (1,2,−1), t=1이면 (2,7,5)입니다.',
                r'\(\mathbf r(t)=(2-t,t^2,3t)\)에서 \(\mathbf r(2)\)는?',
                ['(0, 4, 6)', '(2, 4, 3)', '(0, 2, 6)', '(4, 4, 6)'],
                't=2를 각 성분에 따로 넣습니다. (2−2, 2², 3·2)=(0,4,6).'),
        section('정의역은 교집합',
                r'정의역은 모든 성분을 동시에 계산할 수 있는 t입니다. 로그의 진수는 양수, 실수 제곱근의 안은 0 이상이어야 합니다.',
                r'\(\mathbf r(t)=(t^3,\ln(3-t),\sqrt t)\): 로그는 t<3, 제곱근은 t≥0. 교집합은 \([0,3)\)입니다.',
                r'\(\mathbf r(t)=(\sqrt{t-1},\ln(5-t),t)\)의 실수 정의역은?',
                ['[1, 5)', '(1, 5]', '[1, 5]', '(−∞, 5)'],
                't−1≥0에서 t≥1, 5−t>0에서 t<5. 둘 다 만족하는 [1,5)입니다.'),
        section('극한은 성분별로',
                r'벡터함수의 극한은 각 성분의 극한을 구한 뒤 한 벡터로 모읍니다. 모든 성분 극한이 존재해야 합니다.',
                r'\(\lim_{t\to0}(1+t^3,te^{-t},\sin t/t)=(1,0,1)\). 마지막 성분은 t=0에 직접 대입하는 대신 표준극한을 씁니다.',
                r'\(\lim_{t\to0}(2+t,te^t,\sin(2t)/t)\)는?',
                ['(2, 0, 2)', '(2, 0, 1)', '(0, 0, 2)', '(2, 1, 2)'],
                '앞 두 극한은 2와 0. sin(2t)/t=2·sin(2t)/(2t)이므로 마지막 극한은 2입니다.'),
        section('공간곡선과 직선',
                r'\(\mathbf r(t)=\mathbf r_0+t\mathbf v\)에서 \(\mathbf v\neq\mathbf0\)이면 직선입니다. t가 모든 실수이면 양방향 전체 직선이 됩니다.',
                r'(1+t,2+5t,−1+6t)의 시작점은 (1,2,−1), 방향벡터는 (1,5,6)입니다. 좌표의 상수항과 t의 계수를 분리해 읽습니다.',
                'r(t)=(3−2t, 1+t, 4)의 직선 방향벡터는?',
                ['(−2, 1, 0)', '(3, 1, 4)', '(−2, 1, 4)', '(2, −1, 4)'],
                't의 계수는 (−2,1,0)입니다. z는 4로 고정되어 t의 계수가 0입니다.'),
        section('나선의 투영과 교점',
                r'\(\mathbf r(t)=(\cos t,\sin t,t)\)는 \(x^2+y^2=1\)인 원기둥 위 나선입니다. xy평면으로 투영한 자취는 원이지만, z=0과 만나는 곳은 t=0 한 점입니다.',
                r't=0이면 (1,0,0), t=π/2이면 (0,1,π/2). 높이가 계속 변하므로 공간곡선 전체가 xy평면의 원은 아닙니다.',
                'r(t)=(cos t, sin t, t)가 z=0 평면과 만나는 점은?',
                ['(1, 0, 0) 한 점', '단위원 전체', '(0, 1, 0) 한 점', '교점 없음'],
                'z=t=0에서 t=0. 그때 x=cos0=1, y=sin0=0입니다. 투영과 교점을 구별해야 합니다.'),
        section('두 점을 잇는 선분',
                r'P에서 Q로 가는 선분은 \(\mathbf r(t)=(1-t)P+tQ=P+t(Q-P),\ 0\leq t\leq1\)입니다. t 범위까지 써야 선분이 됩니다.',
                r'P(1,3,−2), Q(2,−1,3): Q−P=(1,−4,5). 따라서 (1+t,3−4t,−2+5t), 0≤t≤1. t=0과 1을 넣어 끝점을 검산합니다.',
                'P(0,1,2), Q(2,3,0)을 잇는 선분의 벡터식은?',
                ['r(t)=(2t, 1+2t, 2−2t), 0≤t≤1', 'r(t)=(2t, 1+2t, 2−2t), t∈ℝ', 'r(t)=(2t, 3t, 0), 0≤t≤1', 'r(t)=(2, 3, 0)+t(2, 2, −2), 0≤t≤1'],
                'Q−P=(2,2,−2). P+t(Q−P)=(2t,1+2t,2−2t)이고 0≤t≤1에서 정확히 두 점 사이만 지나갑니다.'),
    ], worksheet=[
        (r'\(\mathbf r(t)=(1/(t-2),\sqrt{t+1},\ln(4-t))\)의 실수 정의역은?',
         ['[−1,2) ∪ (2,4)', '[−1,4)', '(−1,4]', '[2,4)'],
         '분모는 t≠2, 제곱근은 t≥−1, 로그는 t<4. 교집합 [−1,4)에서 2만 뺍니다.'),
        ('P(1,−1,2), Q(5,3,−2)의 선분을 r(t)=P+t(Q−P), 0≤t≤1로 쓸 때 t=1/2의 점은?',
         ['(3, 1, 0)', '(2, 2, −2)', '(5, 3, −2)', '(1, −1, 2)'],
         'Q−P=(4,4,−4). 절반을 P에 더하면 (1,−1,2)+(2,2,−2)=(3,1,0), 선분의 중점입니다.')]),
    dict(slug='em1', course='공업수학1', date='2026-10-02',
         title='2.9~3.1 RLC와 매개변수변환법 — 표준형·론스키안', sections=[
        section('비제차 해를 두 부분으로 나누기',
                r'선형 비제차 미분방정식의 일반해는 \(y=y_h+y_p\)입니다. 제차해는 우변 0의 일반해, 특수해는 주어진 우변을 만족하는 해 하나입니다.',
                r'\(y^{\prime\prime}+y=\sec x\)에서 제차해는 \(c_1\cos x+c_2\sin x\). 우변 sec x는 미정계수법의 지수·다항식·sin/cos 표에 없으므로 매개변수변환법을 씁니다.',
                'y″+y=ln x (x>0)를 푸는 방법으로 적절한 것은?',
                ['매개변수변환법으로 특수해 구하기', '특수해를 상수 A로 두면 항상 된다', '제차해만 구하면 일반해가 된다', '우변을 0으로 바꾸어 원래 식의 답으로 낸다'],
                'ln x는 표준 미정계수법의 우변 형태가 아닙니다. 제차해를 구한 뒤 매개변수변환법으로 특수해를 더해야 합니다.'),
        section('RLC 모델을 표준형으로',
                r'전류 i(t)에 대한 RLC 식은 \(Li^{\prime\prime}+Ri^{\prime}+i/C=E^{\prime}(t)\)입니다. L>0으로 나누면 최고차 미분의 계수가 1이 됩니다.',
                r'L=2, R=4, C=1/8, E′(t)=6cos t이면 2i″+4i′+8i=6cos t. 표준형은 i″+2i′+4i=3cos t입니다.',
                '3y″+6y′+12y=9cos x의 표준형 우변은?',
                ['3cos x', '9cos x', 'cos x', '27cos x'],
                '왼쪽과 오른쪽 전체를 최고차 계수 3으로 나눕니다. 우변도 9/3=3배의 cos x로 바뀝니다.'),
        section('론스키안과 공식의 조건',
                r'\(y^{\prime\prime}+p(x)y^{\prime}+q(x)y=r(x)\)에서 p,q,r가 한 구간에서 연속이고 y₁,y₂가 제차해의 기저이면 \(W=y_1y_2^{\prime}-y_2y_1^{\prime}\neq0\). p,q가 상수일 필요는 없습니다.',
                r'y₁=cos x, y₂=sin x이면 W=cos²x+sin²x=1. 단, sec x가 우변이면 cos x=0인 점을 가로지르지 않는 구간에서 풉니다.',
                'y₁=eˣ, y₂=e⁻ˣ의 론스키안 W=y₁y₂′−y₂y₁′은?',
                ['−2', '2', '0', 'e²ˣ'],
                'eˣ(−e⁻ˣ)−e⁻ˣ(eˣ)=−1−1=−2. 0이 아니므로 두 함수는 독립입니다.'),
        section('상수를 함수로 바꾸기',
                r'\(y_p=u(x)y_1+v(x)y_2\)로 두고 \(u^{\prime}y_1+v^{\prime}y_2=0\), \(u^{\prime}y_1^{\prime}+v^{\prime}y_2^{\prime}=r\)를 풉니다. 따라서 \(u^{\prime}=-y_2r/W\), \(v^{\prime}=y_1r/W\).',
                r'y″+y=sec x, y₁=cos x, y₂=sin x, W=1: u′=−tan x, v′=1. 적분해 u=ln|cos x|, v=x로 선택할 수 있습니다.',
                'y″+y=csc x에서 같은 기저와 W=1을 쓰면 (u′,v′)는?',
                ['(−1, cot x)', '(1, −cot x)', '(−tan x, 1)', '(sin x, cos x)'],
                'r=1/sin x. u′=−sin x·r=−1, v′=cos x·r=cot x입니다.'),
        section('sec x 예제 완성',
                r'\(y_p=\cos x\ln|\cos x|+x\sin x\). 일반해에는 제차해의 상수 두 개를 반드시 남깁니다.',
                r'일반해: \(y=c_1\cos x+c_2\sin x+\cos x\ln|\cos x|+x\sin x\). 검산은 \(y_p^{\prime\prime}+y_p=\sec x\). 로그의 절댓값을 빠뜨리지 않습니다.',
                'y″+y=sec x의 특수해 하나를 구했다. 일반해를 완성하려면?',
                ['c₁cos x+c₂sin x를 더한다', '특수해에 0만 더한다', '초기조건이 없어도 c₁=c₂=0으로 확정한다', 'c₁x+c₂x²를 더한다'],
                '제차식 y″+y=0의 독립해는 cos x와 sin x입니다. 초기조건이 없으면 두 상수는 임의 상수로 남깁니다.'),
        section('csc x 예제와 방법 선택',
                r'\(y^{\prime\prime}+y=\csc x\)의 특수해는 \(-x\cos x+\sin x\ln|\sin x|\). sin x=0을 포함하지 않는 구간에서 적용합니다.',
                r'u=−x, v=ln|sin x|를 uy₁+vy₂에 넣습니다. 일반해는 이 식에 c₁cos x+c₂sin x를 더합니다. cosh 2x는 (e²ˣ+e⁻²ˣ)/2라 미정계수법도 가능합니다.',
                'y″+y=csc x의 공식을 적용할 때 구간에 필요한 조건은?',
                ['sin x=0인 점을 포함하지 않는다', '반드시 x가 양수인 모든 구간이다', '반드시 p,q가 상수인 경우에만 가능하다', '로그의 진수 부호와 무관하게 절댓값을 지운다'],
                'csc x=1/sin x가 연속인 구간이어야 합니다. ln|sin x|의 절댓값을 유지하고 sin x=0인 점을 피합니다.'),
    ], worksheet=[
        ('2y″+2y=2sec x에 매개변수변환법을 적용한다. 올바른 (u′,v′)는?',
         ['(−tan x, 1)', '(−2tan x, 2)', '(tan x, −1)', '(−tan x, 2)'],
         '먼저 전체를 2로 나누어 y″+y=sec x로 만듭니다. r=sec x와 W=1을 쓰므로 u′=−tan x, v′=1입니다.'),
        ('y″−y=e²ˣ의 특수해를 yₚ=Ae²ˣ로 두면 A는?',
         ['1/3', '1', '−1/3', '1/4'],
         'yₚ″−yₚ=(4A−A)e²ˣ=3Ae²ˣ. 우변 계수 1과 맞추어 A=1/3. e²ˣ는 제차해 eˣ,e⁻ˣ와 겹치지 않습니다.')]),
    dict(slug='em1', course='공업수학1', date='2026-10-07',
         title='3.1~3.3 고계 선형방정식 — 중근·오일러코시·공명', sections=[
        section('기저와 론스키안',
                r'n계 제차 선형방정식의 일반해는 독립인 해 n개의 선형결합입니다. 계수가 연속인 같은 표준형 제차방정식의 해들에 대해 W가 한 점에서 0이 아니면 기저가 됩니다.',
                r'\(y_1=e^x,\ y_2=e^{-x},\ y_3=e^{x/2}\)의 W는 \(\frac32 e^{x/2}\neq0\). 일반 함수들에는 W가 한 점에서 0이라는 사실만으로 종속을 결론 내리지 않습니다.',
                '같은 3계 제차방정식의 독립인 해 3개로 일반해를 쓸 때 임의 상수는 몇 개인가?',
                ['3개', '1개', '2개', '4개'],
                'y=c₁y₁+c₂y₂+c₃y₃입니다. 3계 초기치 문제에서 세 상수를 정하려면 독립인 초기조건 세 개가 필요합니다.'),
        section('서로 다른 실근',
                r'상수계수 식에 y=e^{λx}를 넣어 특성방정식을 만듭니다. 서로 다른 실근 λ마다 e^{λx} 하나를 일반해에 넣습니다.',
                r'y‴−2y″−y′+2y=0: λ³−2λ²−λ+2=(λ−1)(λ+1)(λ−2). 일반해는 c₁eˣ+c₂e⁻ˣ+c₃e²ˣ입니다.',
                '특성방정식 (λ−2)(λ+1)(λ−3)=0의 일반해는?',
                ['c₁e²ˣ+c₂e⁻ˣ+c₃e³ˣ', 'c₁e²ˣ+c₂xe²ˣ+c₃e³ˣ', 'c₁cos2x+c₂sin2x+c₃e³ˣ', 'c₁x²+c₂x⁻¹+c₃x³'],
                '근은 2,−1,3으로 모두 다릅니다. 각각 e²ˣ,e⁻ˣ,e³ˣ를 사용합니다. 상수계수식과 오일러코시의 xᵐ을 섞지 않습니다.'),
        section('중근과 복소 이중근',
                r'실근 λ가 m중근이면 e^{λx},xe^{λx},…,x^{m−1}e^{λx}. 복소근 α±iβ가 이중근이면 e^{αx}cosβx, e^{αx}sinβx와 각각 x를 곱한 해가 필요합니다.',
                r'y⁽⁴⁾+2y″+y=0: (λ²+1)². 일반해는 (c₁+c₂x)cos x+(c₃+c₄x)sin x입니다. 독립인 해가 총 네 개입니다.',
                '특성방정식 (λ−1)³=0의 일반해는?',
                ['(c₁+c₂x+c₃x²)eˣ', '(c₁+c₂+c₃)eˣ', 'c₁eˣ+c₂e²ˣ+c₃e³ˣ', 'c₁+c₂x+c₃x²'],
                '근 1이 3중근이므로 eˣ,xeˣ,x²eˣ를 사용합니다. 같은 eˣ를 세 번 더해도 독립해 세 개가 되지 않습니다.'),
        section('0 중근과 다른 중근 함께',
                r'근 0에 대응하는 e⁰ˣ는 1입니다. 0이 이중근이면 1과 x를 넣습니다. 다른 근의 중복도 따로 처리합니다.',
                r'y⁽⁵⁾−3y⁽⁴⁾+3y‴−y″=0: λ²(λ−1)³. 일반해는 c₁+c₂x+(c₃+c₄x+c₅x²)eˣ입니다. 상수는 5개입니다.',
                '특성방정식 λ²(λ+2)=0의 일반해는?',
                ['c₁+c₂x+c₃e⁻²ˣ', 'c₁+c₂e⁻²ˣ', '(c₁+c₂x)e⁻²ˣ+c₃', 'c₁x²+c₂x+c₃'],
                '0이 이중근이므로 1,x, −2는 단순근이므로 e⁻²ˣ입니다. 세 독립해에 상수 세 개를 붙입니다.'),
        section('고계 오일러코시',
                r'오일러코시는 y=xᵐ을 직접 대입합니다. y′=mx^{m−1}, y″=m(m−1)x^{m−2}, y‴=m(m−1)(m−2)x^{m−3}. 여기서는 x>0 구간을 씁니다.',
                r'x³y‴−3x²y″+6xy′−6y=0: m(m−1)(m−2)−3m(m−1)+6m−6=(m−1)(m−2)(m−3). 따라서 c₁x+c₂x²+c₃x³.',
                'x²y″−xy′+y=0 (x>0)의 일반해는?',
                ['c₁x+c₂x ln x', 'c₁eˣ+c₂xeˣ', 'c₁x+c₂x²', 'c₁cos x+c₂sin x'],
                'y=xᵐ을 넣으면 m(m−1)−m+1=(m−1)². 오일러코시 중근 1에는 x와 x ln x가 대응합니다.'),
        section('비제차 공명과 초기조건',
                r'우변 e^{αx}가 특성근 α와 겹치면 그 근의 중복도 m만큼 xᵐ을 곱해 특수해를 가정합니다. 제차해부터 구해야 겹침을 판단할 수 있습니다.',
                r'y‴+3y″+3y′+y=30e⁻ˣ: 근 −1이 3중근. yₚ=Ax³e⁻ˣ를 넣으면 6Ae⁻ˣ, A=5. y(0)=3,y′(0)=−3,y″(0)=−47이면 y=(3−25x²+5x³)e⁻ˣ입니다.',
                'y″−2y′+y=eˣ에서 특수해 가정으로 맞는 것은?',
                ['Ax²eˣ', 'Aeˣ', 'Axeˣ', 'Acos x'],
                '특성방정식 (λ−1)²에서 근 1은 이중근입니다. eˣ,xeˣ와 겹치지 않도록 x²을 곱합니다. 대입하면 2Aeˣ=eˣ이므로 A=1/2입니다.'),
    ], worksheet=[
        ('x³y‴+5x²y″+7xy′+8y=0 (x>0)의 보조방정식은 (m+2)(m²+4)=0. 일반해는?',
         ['c₁x⁻²+c₂cos(2ln x)+c₃sin(2ln x)', 'c₁e⁻²ˣ+c₂cos2x+c₃sin2x', 'c₁x⁻²+c₂x²+c₃x⁴', 'c₁x⁻²+(c₂+c₃ln x)x²'],
         '실근 −2는 x⁻², 복소근 ±2i는 cos(2ln x),sin(2ln x)입니다. 상수계수식의 지수 해와 구별합니다.'),
        ('y″−2y′+y=eˣ, y(0)=1, y′(0)=0의 해는?',
         ['(1−x+x²/2)eˣ', '(1+x+x²/2)eˣ', '(1−x)eˣ', '(x²/2)eˣ'],
         '일반해=(c₁+c₂x+x²/2)eˣ. y(0)=c₁=1, y′(0)=c₁+c₂=0이므로 c₂=−1입니다. 대입하면 y″−2y′+y=eˣ입니다.')]),
    dict(slug='phys2', course='일반물리학2', date='2026-10-02',
         title='27장 회로 — 키르히호프 부호·RC 충전·시상수', sections=[
        section('접점과 고리 규칙',
                r'접점에서는 들어오는 전류의 합=나가는 전류의 합입니다. 고리에서는 한 바퀴의 전위 변화 합이 0입니다. 전류의 가정 방향과 고리를 도는 방향을 먼저 표시합니다.',
                '접점에 0.50 A가 들어오고 0.20 A와 I가 나가면 0.50=0.20+I, 따라서 I=0.30 A입니다. 전하가 접점에 쌓이지 않는 정상 상태의 규칙입니다.',
                '접점으로 0.8 A와 0.3 A가 들어오고 한 가지로 전류 I가 나간다. I는?',
                ['1.1 A', '0.5 A', '−0.5 A', '0.24 A'],
                '들어오는 전류 두 개를 더합니다. I=0.8+0.3=1.1 A.'),
        section('전위 변화 부호',
                r'저항을 전류 방향으로 지나면 전위 변화는 −IR, 반대면 +IR입니다. 전지를 −극에서 +극으로 지나면 +ε, 반대면 −ε입니다. 이 변화들을 더해 0으로 둡니다.',
                '6 V 전지의 −→+를 지나고 I=0.5 A인 4 Ω 저항을 전류 방향으로 지나면 +6−(0.5×4)=+4 V입니다. 전체 고리를 쓰려면 나머지 소자도 포함해야 합니다.',
                '2 Ω 저항을 3 A 전류의 반대 방향으로 지날 때 전위 변화는?',
                ['+6 V', '−6 V', '+1.5 V', '0 V'],
                '전류 반대 방향은 전위가 올라가는 방향입니다. +IR=+(3×2)=+6 V.'),
        section('연립식과 음수 전류',
                r'처음 정한 전류 화살표를 기준으로 부호를 유지해 연립식을 풉니다. 전류 해가 음수면 실제 방향이 가정한 화살표와 반대입니다.',
                '판서 식: i₁+i₂−i₃=0, −4i₁−4i₃=−3, −4i₂−4i₃=0. 마지막 식에서 i₂=−i₃, 첫 식에서 i₁=2i₃. 따라서 (i₁,i₂,i₃)=(1/2,−1/4,1/4) A입니다.',
                '가정한 방향을 기준으로 계산한 I=−0.20 A의 뜻은?',
                ['실제 전류는 가정 방향의 반대로 0.20 A', '실제 전류가 없다', '가정 방향으로 0.20 A', '전하 보존이 깨졌다'],
                '음수는 방향 표시입니다. 크기는 0.20 A이고 가정 화살표의 반대로 흐릅니다.'),
        section('RC 충전 식 세우기',
                r'전압 ε의 전지·저항 R·축전기 C가 직렬인 충전 회로에서 \(\varepsilon=iR+q/C\), \(i=dq/dt\). 따라서 \(R\,dq/dt+q/C=\varepsilon\).',
                r'충전 전 q(0)=0이면 \(q(t)=C\varepsilon(1-e^{-t/(RC)})\). t=0이면 0, t→∞이면 Cε이므로 초기값과 최종값을 확인할 수 있습니다.',
                '처음 전하가 0인 RC 충전에서 t→∞일 때 전하 q는?',
                ['Cε', '0', 'ε/R', 'RC'],
                '시간이 충분히 지나면 전류가 0이고 축전기 전압이 ε입니다. q=CV=Cε. ε/R은 전류, RC는 시간입니다.'),
        section('시상수와 63%',
                r'시상수 \(\tau=RC\)의 단위는 초입니다. 처음 전하가 0인 충전에서 t=τ이면 \(q/(C\varepsilon)=1-e^{-1}\approx0.632\). 최종 전하의 약 63.2%입니다.',
                'R=2 kΩ, C=100 μF이면 τ=(2000 Ω)(100×10⁻⁶ F)=0.20 s. k와 μ를 기본 단위로 바꾼 뒤 곱합니다.',
                'R=3 kΩ, C=200 μF인 RC 회로의 시상수는?',
                ['0.60 s', '600 s', '0.006 s', '6 s'],
                '3000×200×10⁻⁶=0.60 s입니다. k=10³, μ=10⁻⁶을 함께 반영합니다.'),
        section('충전 전류와 극한',
                r'충전 전류는 \(i=dq/dt=(\varepsilon/R)e^{-t/(RC)}\). 처음에는 ε/R이고 시간이 지나면 0으로 감소합니다. 전하는 증가하고 전류는 감소합니다.',
                'ε=12 V, R=4 kΩ이면 i(0)=12/4000=3 mA. t=τ에는 3/e≈1.10 mA입니다. 전류가 초기값의 36.8% 남는 때 전하는 최종값의 63.2%입니다.',
                '처음 전하가 0인 RC 충전에서 t=RC의 전류는 초기 전류의 몇 배인가?',
                ['e⁻¹≈0.368배', '1−e⁻¹≈0.632배', '1배', '0배'],
                r'\(i(t)/i(0)=e^{-t/(RC)}\). t=RC이면 e⁻¹입니다. 전하의 충전 비율 1−e⁻¹과 혼동하지 않습니다.'),
    ], worksheet=[
        ('ε=10 V, C=20 μF, 처음 전하 0인 RC 회로에서 t=RC의 전하는 약 얼마인가?',
         ['126 μC', '200 μC', '73.6 μC', '20 μC'],
         '최종 전하 Cε=20 μF×10 V=200 μC. 시상수 한 번 후에는 200(1−e⁻¹)≈126.4 μC입니다.'),
        (r'충전식 \(q=C\varepsilon(1-e^{-t/(RC)})\)에서 R만 2배로 바꾸면?',
         ['시상수는 2배, 최종 전하는 그대로', '시상수와 최종 전하가 모두 2배', '시상수는 절반, 최종 전하는 그대로', '시상수는 그대로, 최종 전하는 2배'],
         'τ=RC이므로 R을 2배로 하면 충전 속도가 느려져 시상수가 2배입니다. 최종 전하 Cε는 R에 의존하지 않습니다.')]),
]


def material(spec):
    lesson_id = spec['slug'] + '-' + spec['date']
    data = dict(id=lesson_id, slug=spec['slug'], course=spec['course'], date=spec['date'],
                sess=spec['date'], title=spec['title'], v=2, ver='2026-10-13-reviewed-1',
                lead='수업 판서 대조 학습본. 확인 문제는 학습앱에서 만든 연습 문제입니다.',
                chapters=[], quiz=[], nodes={'sec': {}, 'q': {}})
    pack = dict(schemaVersion=1, lessonId=lesson_id, course=spec['course'], date=spec['date'], title=spec['title'],
                goals=[s['title'] for s in spec['sections']], recap=[], sections=[], worksheet=[])
    for i, s in enumerate(spec['sections'], 1):
        chapter = dict(id=f's{i}', title=s['title'], steps=[])
        script = {}
        for j, (body, cue) in enumerate([(s['concept'], '정의와 조건을 먼저 확인해 주세요.'),
                                        (s['worked'], '예제를 공책에 쓰고 마지막 조건까지 확인해 주세요.')], 1):
            step_id = f's{i}-{j}'
            chapter['steps'].append(dict(id=step_id, s=body, b=[dict(k='text', h=body)]))
            # 실제 설명을 문장별로 재생한다. 짧은 안내만 읽고 판서가 넘어가지 않도록 한다.
            script[step_id+':0'] = [dict(say=line, mood='neutral') for line in re.split(r'(?<=[.!?])\s+',body)]
        qid = f'q{i}'
        data['chapters'].append(chapter)
        data['quiz'].append(question(qid, s['check'], s['options'], s['why'], i))
        pack['sections'].append(dict(title=s['title'], script=script, check=qid))
    for i, (q, options, why) in enumerate(spec['worksheet'], 1):
        qid = f'ws{i}'
        data['quiz'].append(question(qid, q, options, why, len(spec['sections'])+i))
        pack['worksheet'].append(dict(id=qid, kind='변형', section=len(spec['sections'])))
    return data, pack


def question(qid, q, options, why, seed):
    # 작성 배열의 첫 항목이 정답. 실제 보기는 회전해 정답 위치를 네 곳에 분산한다.
    offset = seed % 4
    choices = options[offset:] + options[:offset]
    answer = (-offset) % 4
    assert len(choices) == 4 and len(set(choices)) == 4
    return dict(id=qid, q=q, html=q, options=choices, answer=answer, why=why,
                choices=[dict(html=o, ok=k == answer) for k, o in enumerate(choices)], ans=why)


def page(data):
    # 원자료 사본을 게시하지 않는다. 학교가 파싱할 D와 읽기용 학습본만 담는다.
    payload = json.dumps(data, ensure_ascii=False).replace('</', '<\\/')
    title = html.escape(data['title'])
    intro = html.escape(data['lead'])
    content = ''.join('<section><h2>'+html.escape(ch['title'])+'</h2>' +
                      ''.join('<p>'+html.escape(st['b'][0]['h'])+'</p>' for st in ch['steps'])+'</section>'
                      for ch in data['chapters'])
    return f'''<!doctype html>
<html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><style>body{{font:18px/1.8 system-ui,sans-serif;color:#173c2c;background:#f7faf7;margin:0}}main{{max-width:850px;padding:24px;margin:auto}}section{{background:white;padding:18px;margin:16px 0;border:1px solid #d4e1d7;border-radius:12px}}p{{overflow-wrap:anywhere}}.katex-display{{overflow-x:auto;overflow-y:hidden}}a{{color:#185537}}</style>
<main><a href="../../../school/index.html?lesson={data['id']}">학교에서 이 수업 공부하기</a><h1>{title}</h1><p>{intro}</p>{content}</main>
<script>const D={payload};</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.querySelector('main'),{{throwOnError:false}})"></script></html>
'''


def build(root):
    root = Path(root).resolve()
    index_path = root / 'knowledge/lessons.json'
    index = json.loads(index_path.read_text(encoding='utf-8'))
    for spec in LESSONS:
        data, pack = material(spec)
        relative = f"notes/classroom/{spec['slug']}/{spec['date']}.html"
        dest = root / relative
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(page(data), encoding='utf-8')
        pack_path = root / f"knowledge/lectures/{data['id']}.json"
        pack_path.parent.mkdir(parents=True, exist_ok=True)
        pack_path.write_text(json.dumps(pack, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
        index['courses'].setdefault(spec['course'], {})[spec['date']] = dict(
            id=data['id'], title=data['title'], classroom=relative, file=relative,
            week=6 if spec['date'] >= '2026-10-04' else 5,
            chapters=len(data['chapters']), steps=2*len(data['chapters'])+len(data['quiz']),
            sids=[c['id'] for c in data['chapters']], qids=[q['id'] for q in data['quiz']])
    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=1)+'\n', encoding='utf-8')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('output_root', help='isolated checkout to generate into')
    build(parser.parse_args().output_root)
