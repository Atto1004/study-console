# 검산 스크립트 실행기(lecture_check.py 가 부름): 스크립트를 그대로 실행하면서 **실제로 실행된 assert 문 개수**를 센다.
# 줄 실행 여부로 세면 `if x: assert …`·여러 줄 조건 머리줄과 같은 줄의 assert 를 구분 못 한다(오타 검수 10/9).
# 그래서 실행 전 구문 트리에서 assert 문마다 바로 앞에 같은 블록 안 문장으로 __hit(번호) 를 끼워 넣는다 —
# 그 assert 가 실행되는 경우에만 __hit 도 실행된다. 결과는 표준 오류 마지막에 「@@asserts_run N」(서로 다른 assert 수).
import sys, ast
path = sys.argv[1]
src = open(path, encoding='utf-8').read()
hit = set()

class Mark(ast.NodeTransformer):
    n = 0
    def visit_Assert(self, node):
        Mark.n += 1
        call = ast.Expr(ast.Call(func=ast.Name('__hit', ast.Load()), args=[ast.Constant(Mark.n)], keywords=[]))
        return [ast.copy_location(call, node), node]

tree = ast.fix_missing_locations(Mark().visit(ast.parse(src)))
code = compile(tree, path, 'exec')
try:
    exec(code, {'__name__': '__main__', '__file__': path, '__hit': hit.add})
finally:
    sys.stdout.flush()
    sys.stderr.write(f'\n@@asserts_run {len(hit)}\n')
