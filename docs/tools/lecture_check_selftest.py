# lecture_check.py 자기 검사: 견본 강의안(정역학 9/14)의 **임시 사본**을 일부러 망가뜨려(--pack/--verify 로 넘김)
# 각 규칙이 「그 규칙의 오류 문구」로 잡히는지 본다. 실제 강의안·검산 파일은 읽기만 한다(오타 검수 10/9).
# 비정상 종료(파이썬 예외)는 잡은 것으로 치지 않는다.
import json, os, subprocess, sys, copy, tempfile
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
LID = 'statics-2026-09-14'
base = json.load(open(f'knowledge/lectures/{LID}.json', encoding='utf-8'))
vbase = open(f'knowledge/lectures/{LID}.verify.py', encoding='utf-8').read()
tmp = tempfile.mkdtemp(prefix='lecture-selftest-')
PACK, VER = os.path.join(tmp, 'pack.json'), os.path.join(tmp, 'verify.py')

def run(mut=None, vmut=None):
    d = copy.deepcopy(base)
    if mut: mut(d)
    json.dump(d, open(PACK, 'w', encoding='utf-8'), ensure_ascii=False)
    open(VER, 'w', encoding='utf-8').write(vmut(vbase) if vmut else vbase)
    r = subprocess.run([sys.executable, '-I', 'docs/tools/lecture_check.py', LID, '--pack', PACK, '--verify', VER],
                       capture_output=True, text=True, encoding='utf-8', errors='replace')
    return r.returncode, r.stdout, r.stderr

def setk(path, key, value):
    return lambda d: path(d).__setitem__(key, value)

S0 = lambda d: d['sections'][0]
L0 = lambda d: d['sections'][0]['script']['s1-1:0'][0]
cases = [   # (이름, 강의안 바꾸기, 검산 바꾸기, 나와야 하는 오류 문구)
    ('목표 2개', lambda d: d['goals'].pop(), None, 'goals 2개'),
    ('goals 형식', setk(lambda d: d, 'goals', 'a,b,c'), None, 'goals: 문자열 배열'),
    ('섹션 3개', lambda d: d['sections'].__delitem__(slice(3, 5)), None, '섹션 3개'),
    ('섹션 id 없음', lambda d: S0(d).pop('id'), None, 'id 는 s1·s2 꼴'),
    ('섹션 id 숫자', setk(S0, 'id', 1), None, 'id 는 s1·s2 꼴'),
    ('섹션 id 중복', setk(lambda d: d['sections'][1], 'id', 's1'), None, '섹션 id 중복'),
    ('학습지 4개', lambda d: d['worksheet'].pop(), None, '학습지 4문항'),
    ('학습지 중복', lambda d: d['worksheet'].__setitem__(1, dict(d['worksheet'][0])), None, '학습지 문항 중복'),
    ('학습지 구성', setk(lambda d: d['worksheet'][0], 'kind', '도전'), None, '학습지 구성'),
    ('kind 배열', setk(lambda d: d['worksheet'][0], 'kind', []), None, 'kind 는 개념·변형·도전'),
    ('학습지 섹션', setk(lambda d: d['worksheet'][0], 'section', 's9'), None, 'section 은 이 강의안의 섹션 id'),
    ('확인=학습지', setk(lambda d: d['worksheet'][0], 'id', 'c1'), None, '확인 문제와 학습지에 같은 문항'),
    ('같은 확인', setk(lambda d: d['sections'][1], 'check', 'c1'), None, '같은 확인 문제를 여러 섹션이 씀'),
    ('없는 확인', setk(S0, 'check', 'c9'), None, '교실 quiz 에 없음'),
    ('81자 대사', setk(L0, 'say', '가' * 81), None, '대사 81자'),
    ('대사 수식', setk(L0, 'say', 'U \\cdot V 는'), None, '대사에 수식 기호'),
    ('recap 수식', setk(lambda d: d['recap'][0], 'say', '√2 예요'), None, '대사에 수식 기호'),
    ('mood 틀림', setk(L0, 'mood', 'angry'), None, 'mood 는'),
    ('판서 빠짐', lambda d: S0(d)['script'].pop('s1-3:0'), None, '대사 없는 판서 단계'),
    ('구간 끊김', lambda d: d['sections'][1]['script'].__setitem__('s1-3:0', S0(d)['script'].pop('s1-3:0')), None, '이어진 구간이 아님'),
    ('없는 판서', lambda d: S0(d)['script'].__setitem__('s9-9:0', [{'say': '가', 'mood': 'neutral'}]), None, '없는 판서 단계'),
    ('근거 없는 강조', setk(S0, 'exam', '시험에 꼭 나와요'), None, 'exam(교수님 강조)에는 근거'),
    ('sources 없음', lambda d: d.pop('sources'), None, 'sources: [{label, href}]'),
    ('summary 없음', lambda d: d.pop('summary'), None, 'summary: 한 장 요약'),
    ('검산 주석뿐', None, lambda v: "# assert\nprint('검산 문항: c1 c2 c3 c4 c5 w1 w2 w3 q3 q4')\n", '실제로 실행된 assert 0개'),
    ('검산 실패', None, lambda v: v + '\nassert 1 == 2\n', '검산 실패'),
    ('검산 문항 빠짐', None, lambda v: v.replace(" q3 q4')", "')"), "검산 안 한 문항: ['q3', 'q4']"),
    ('검산 문항 줄 없음', None, lambda v: v.replace("print('검산 문항:", "print('done:"), '마지막 줄이 「검산 문항'),
    ('검산 실행 안 됨', None, lambda v: "if False:\n" + "".join("    assert False\n" for _ in range(12)) + "print('검산 문항: c1 c2 c3 c4 c5 w1 w2 w3 q3 q4')\n", '실제로 실행된 assert 0개'),
    ('조건과 같은 줄 assert', None, lambda v: "flag = False\n" + "".join(f"if flag: assert False, {i}\n" for i in range(12)) + "print('검산 문항: c1 c2 c3 c4 c5 w1 w2 w3 q3 q4')\n", '실제로 실행된 assert 0개'),
    ('여러 줄 조건 머리 assert', None, lambda v: "flag = False\n" + "".join(f"if (\n    flag): assert False, {i}\n" for i in range(12)) + "print('검산 문항: c1 c2 c3 c4 c5 w1 w2 w3 q3 q4')\n", '실제로 실행된 assert 0개'),
    ('안 부른 함수 안 assert', None, lambda v: "def f():\n" + "".join(f"    assert False, {i}\n" for i in range(12)) + "print('검산 문항: c1 c2 c3 c4 c5 w1 w2 w3 q3 q4')\n", '실제로 실행된 assert 0개'),
    ('assert 모자람', None, lambda v: "assert 1 == 1\nassert 2 == 2\nassert 3 == 3\nprint('검산 문항: c1 c2 c3 c4 c5 w1 w2 w3 q3 q4')\n", '실제로 실행된 assert 3개'),
    ('문항 줄 뒤 출력', None, lambda v: v + "\nprint('끝')\n", '마지막 줄이 「검산 문항'),
]
bad = []
code, out, errout = run()
if code != 0: bad.append('원본 사본이 통과 못 함: ' + out + errout)
for name, mut, vmut, want in cases:
    code, out, errout = run(mut, vmut)
    caught = code == 1 and 'Traceback' not in errout and want in out
    print(('잡음 ' if caught else '놓침 ') + name + ('' if caught else f'  (종료 {code}, 원하는 문구 「{want}」, 받은 것 {out.strip()[-200:]} {errout.strip()[-200:]})'))
    if not caught: bad.append(name)
print('lecture_check 자기 검사 ok' if not bad else 'FAIL 놓친 규칙: ' + ', '.join(bad))
sys.exit(1 if bad else 0)
