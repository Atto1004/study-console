# 검산 스크립트 실행기(lecture_check.py 가 부름): 스크립트를 그대로 실행하면서 실제로 실행된 assert 문(줄 기준, 중복 없이)을 센다.
# 실행 안 된 assert(if False: 안 등)는 세지 않는다(오타 검수 10/9). 결과는 표준 오류 마지막에 「@@asserts_run N」.
import sys, ast
path = sys.argv[1]
src = open(path, encoding='utf-8').read()
tree = ast.parse(src)
want = {n.lineno for n in ast.walk(tree) if isinstance(n, ast.Assert)}
# assert 는 자기 줄에 혼자 있어야 한다: `if x: assert …`·`a = 1; assert …` 처럼 다른 문장과 같은 줄이면
# 그 줄이 실행돼도 assert 가 실행됐다는 뜻이 아니라 셀 수 없다 → 거부(오타 검수 10/9)
shared = sorted(n.lineno for n in ast.walk(tree) if isinstance(n, ast.stmt) and not isinstance(n, ast.Assert) and n.lineno in want)
if shared:
    sys.stderr.write(f'assert 는 자기 줄에 혼자 써야 함(다른 문장과 같은 줄: {shared})\n@@asserts_run 0\n')
    sys.exit(2)
hit = set()
code = compile(src, path, 'exec')

def trace(frame, event, arg):
    if frame.f_code.co_filename != path:
        return None
    if event == 'line' and frame.f_lineno in want:
        hit.add(frame.f_lineno)
    return trace

sys.settrace(trace)
try:
    exec(code, {'__name__': '__main__', '__file__': path})
finally:
    sys.settrace(None)
    sys.stdout.flush()
    sys.stderr.write(f'\n@@asserts_run {len(hit)}\n')
