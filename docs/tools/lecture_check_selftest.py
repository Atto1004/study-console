# lecture_check.py 자기 검사: 견본 강의안(정역학 9/14)을 일부러 망가뜨려 각 규칙이 오류를 내는지 본다. 끝나면 원본 그대로 되돌린다.
import json, os, subprocess, sys, copy
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
LID = 'statics-2026-09-14'; P = f'knowledge/lectures/{LID}.json'
orig = open(P, encoding='utf-8').read(); base = json.loads(orig)
def run(mut):
    d = copy.deepcopy(base); mut(d)
    open(P, 'w', encoding='utf-8', newline='\n').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    r = subprocess.run([sys.executable, '-I', 'docs/tools/lecture_check.py', LID], capture_output=True, text=True, encoding='utf-8')
    return r.returncode, r.stdout
cases = {
    '목표 2개': lambda d: d['goals'].pop(),
    '섹션 3개': lambda d: d['sections'].__delitem__(slice(3, 5)),
    '학습지 4개': lambda d: d['worksheet'].pop(),
    '학습지 중복': lambda d: d['worksheet'].__setitem__(1, dict(d['worksheet'][0])),
    '학습지 구성': lambda d: d['worksheet'][0].__setitem__('kind', '도전'),
    '확인=학습지': lambda d: d['worksheet'][0].__setitem__('id', 'c1'),
    '같은 확인': lambda d: d['sections'][1].__setitem__('check', 'c1'),
    '81자 대사': lambda d: d['sections'][0]['script']['s1-1:0'][0].__setitem__('say', '가' * 81),
    '대사 수식': lambda d: d['sections'][0]['script']['s1-1:0'][0].__setitem__('say', 'U \\cdot V 는'),
    'recap 수식': lambda d: d['recap'][0].__setitem__('say', '√2 예요'),
    'mood 틀림': lambda d: d['sections'][0]['script']['s1-1:0'][0].__setitem__('mood', 'angry'),
    '판서 빠짐': lambda d: d['sections'][0]['script'].pop('s1-3:0'),
    '구간 끊김': lambda d: d['sections'][1]['script'].__setitem__('s1-3:0', d['sections'][0]['script'].pop('s1-3:0')),
    '없는 판서': lambda d: d['sections'][0]['script'].__setitem__('s9-9:0', [{'say': '가', 'mood': 'neutral'}]),
    '근거 없는 강조': lambda d: d['sections'][0].__setitem__('exam', '시험에 꼭 나와요'),
    'sources 없음': lambda d: d.pop('sources'),
    'summary 없음': lambda d: d.pop('summary'),
    '섹션 id 중복': lambda d: d['sections'][1].__setitem__('id', 's1'),
    'goals 형식': lambda d: d.__setitem__('goals', 'a,b,c'),
}
bad = []
try:
    code, out = run(lambda d: None)
    if code != 0: bad.append('원본이 통과 못 함: ' + out)
    for name, mut in cases.items():
        code, out = run(mut)
        if code == 0: bad.append(name)
        print(('잡음 ' if code else '놓침 ') + name)
finally:
    open(P, 'w', encoding='utf-8', newline='\n').write(orig)
print('lecture_check 자기 검사 ok' if not bad else 'FAIL 놓친 규칙: ' + ', '.join(bad))
sys.exit(1 if bad else 0)
