"""물리 첫 수업의 잘못된 비유를 교정한 별도 학습본을 생성한다. 기존 원자료는 보존한다."""
import argparse
import json
from pathlib import Path
from build_recent_exam_lessons import material, page, section

INTRO_SPEC = dict(slug='phys2-reviewed', course='일반물리학2', date='2026-09-04',
    title='전하와 전기장 — 단위·쿨롱 법칙·힘의 성분', sections=[
    section('전하의 부호와 양자화',
        r'보통 물체의 알짜 전하는 \(q=ne\), \(e=1.602\times10^{-19}\,\mathrm C\)입니다. n은 부호 있는 정수입니다. 전자가 남으면 음전하, 부족하면 양전하입니다.',
        '전자 2개가 남으면 q=−2e≈−3.20×10⁻¹⁹ C. 양성자와 전자 수가 같으면 각각 전하가 있어도 알짜 전하는 0입니다.',
        '전자 3개가 부족한 물체의 알짜 전하는?',
        ['+3e', '−3e', '+e/3', '0'],
        '음전하인 전자 3개가 부족하므로 양전하 +3e가 남습니다.'),
    section('쿨롱 법칙과 단위',
        r'점전하는 물체 크기가 거리에 비해 작아 전하를 한 점에 모인 것으로 취급하는 모델입니다. 진공의 힘 크기는 \(F=k|q_1q_2|/r^2\), \(k\approx9.0\times10^9\,\mathrm{N\,m^2/C^2}\). 같은 부호는 밀고 반대 부호는 당깁니다. μC=10⁻⁶ C, nC=10⁻⁹ C입니다.',
        '진공에서 +1 μC 두 개가 1 m 떨어지면 F=9×10⁹×(10⁻⁶)²=9×10⁻³ N, 척력. 같은 전하를 유지하고 거리를 2배로 하면 힘은 1/4입니다.',
        '전하가 그대로이고 거리를 3배로 하면 힘의 크기는?',
        ['원래의 1/9', '원래의 1/3', '원래의 3배', '원래의 9배'],
        '힘은 거리의 제곱에 반비례하므로 1/3²=1/9입니다.'),
    section('전기장과 시험전하가 받는 힘',
        r'전기장은 \(\vec E=\vec F/q_0\), 단위 N/C입니다. q₀≠0인 작은 시험전하로 장을 거의 바꾸지 않는다고 생각합니다. E의 방향은 양전하가 받는 힘의 방향입니다. 실제 전하 q가 받는 힘은 다른 전하들이 그 위치에 만드는 장으로 \(\vec F=q\vec E\)입니다.',
        'E가 오른쪽으로 200 N/C일 때 q=−2 μC이면 힘은 왼쪽으로 4×10⁻⁴ N. 음전하이므로 방향이 반대입니다. 전하 q(C)와 전류 I(C/s)는 서로 다른 양이라 공식에서 단순히 바꿔 넣을 수 없습니다.',
        '전기장이 위쪽일 때 음전하가 받는 전기력의 방향은?',
        ['아래쪽', '위쪽', '항상 오른쪽', '항상 힘이 0'],
        'F=qE에서 q가 음수이므로 힘의 방향은 전기장과 반대입니다.'),
    section('힘의 중첩과 성분',
        r'여러 전하가 만드는 힘은 벡터로 더합니다. +x축에서 반시계 방향으로 잰 각 θ에 대해 \(F_x=F\cos\theta\), \(F_y=F\sin\theta\). 각 힘의 성분을 더한 뒤 합력의 크기를 구합니다.',
        '6 N 힘 두 개가 +x축 기준 +60°와 −60°를 향하면, x성분 합=6 cos60°+6 cos60°=6 N. y성분은 상쇄되어 합력은 오른쪽 6 N입니다. 크기 6+6=12 N으로 더하면 안 됩니다.',
        '힘 (3,0) N과 (0,4) N의 합력 크기는? 괄호 안은 차례로 x성분과 y성분입니다.',
        ['5 N', '7 N', '1 N', '25 N'],
        '합력 성분은 (3,4) N이므로 크기는 √(3²+4²)=5 N입니다.'),
    section('점전하 합과 연속 분포의 적분',
        r'점전하가 여러 개면 \(\vec E=\sum_i\vec E_i\). dq는 작은 조각의 전하량이며 적분은 조각들의 장을 합하는 연산입니다. ds·dA·dV는 각각 작은 길이·면적·부피입니다. 선은 \(dq=\lambda\,ds\), 면은 \(dq=\sigma\,dA\), 부피는 \(dq=\rho\,dV\).',
        '균일한 선전하 밀도 λ=2 μC/m, 길이 L=0.5 m이면 Q=λL=1 μC. 면전하에는 σ(C/m²), 부피전하에는 ρ(C/m³)를 씁니다. 이들은 서로 다른 분포의 표현입니다.',
        '균일한 면전하 밀도 σ와 면적 A의 전하량은?',
        ['Q=σA', 'Q=σ/A', 'Q=λA', 'Q=ρA'],
        'dq=σdA를 면적에 걸쳐 적분합니다. σ가 일정하면 Q=σA이고, 단위는 (C/m²)×m²=C입니다.'),
    section('유전율 비교에는 조건이 필요합니다',
        r'성질이 위치·방향에 따라 같고 분극이 전기장에 비례하는 매질을 균질·등방성·선형 매질이라고 합니다. 경계 영향을 무시하며 다른 전하·외부장이 없는 정전기 점전하 두 개의 모델은 \(F=|q_1q_2|/(4\pi\varepsilon r^2)\), ε=εᵣε₀. 같은 자유전하와 거리에서 ε가 커지면 힘은 작아집니다.',
        'ε₀는 진공 유전율, εᵣ=ε/ε₀는 단위 없는 비율입니다. 위 모델에서 진공의 힘을 F₀라고 하면 εᵣ=4인 매질의 힘은 F₀/4. 다른 매질과 맞닿는 경계가 충분히 멀다고 가정합니다. 전압·전하 고정 조건과 경계도 확인합니다.',
        '같은 점전하·거리의 위 모델에서 εᵣ=2이면 힘은 진공의 몇 배인가?',
        ['1/2배', '2배', '1배', '4배'],
        '힘은 ε에 반비례합니다. ε=2ε₀이므로 진공 값의 1/2입니다.')
    ], worksheet=[
        ('진공에서 점전하 +2 μC와 −3 μC가 0.30 m 떨어져 있다. 힘의 크기와 성질은? k=9×10⁹ N·m²/C².',
         ['0.60 N, 인력', '0.60 N, 척력', '0.06 N, 인력', '6.0 N, 척력'],
         'F=9×10⁹×|2×10⁻⁶×(−3×10⁻⁶)|/0.30²=0.60 N. 부호가 반대이므로 인력입니다.'),
        ('전기장이 오른쪽 300 N/C일 때 −4 μC 전하가 받는 힘은?',
         ['왼쪽 1.2×10⁻³ N', '오른쪽 1.2×10⁻³ N', '왼쪽 1.2×10³ N', '오른쪽 75 N'],
         '크기 |q|E=4×10⁻⁶×300=1.2×10⁻³ N. 음전하이므로 전기장과 반대인 왼쪽입니다.')])

def build(root):
    root=Path(root).resolve()
    data,pack=material(INTRO_SPEC)
    data['ver']='2026-10-13-physics-intro-corrected-1'
    data['lead']='기존 수업의 전하·전기장 내용을 교정한 학습본. 확인 문제와 수치는 자체 작성한 연습입니다.'
    relative='notes/classroom/phys2-reviewed/2026-09-04.html'
    path=root/relative;path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(page(data),encoding='utf-8')
    (root/f"knowledge/lectures/{data['id']}.json").write_text(json.dumps(pack,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    index_path=root/'knowledge/lessons.json';index=json.loads(index_path.read_text(encoding='utf-8'))
    index.setdefault('legacyLessons',{})['phys2-2026-09-04']=dict(id='phys2-2026-09-04',
        classroom='notes/classroom/phys2/2026-09-04.html',file='notes/classroom/phys2/2026-09-04.html')
    index['courses']['일반물리학2']['2026-09-04']=dict(id=data['id'],title=data['title'],classroom=relative,file=relative,
        originalClassroom='notes/classroom/phys2/2026-09-04.html',week=1,chapters=6,steps=20,
        sids=[c['id'] for c in data['chapters']],qids=[q['id'] for q in data['quiz']])
    index_path.write_text(json.dumps(index,ensure_ascii=False,indent=1)+'\n',encoding='utf-8')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('output_root');build(parser.parse_args().output_root)
