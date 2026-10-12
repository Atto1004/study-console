"""신규 5회차의 실제 서버 파싱·강의 순서와 판서 계산을 검증한다."""
import argparse
import importlib.util
import json
import re
import sys
from pathlib import Path
import sympy as s


def verify_math():
    x, t, m = s.symbols('x t m', real=True)
    # 판서와 변형 문제: 평면의 법선, 교선의 방향과 모든 점, 세 점 대입.
    n1, n2 = s.Matrix([1, 1, 1]), s.Matrix([1, -2, 3])
    direction = n1.cross(n2)
    assert direction == s.Matrix([5, -2, -3])
    line = s.Matrix([1, 0, 0]) + t*direction
    assert s.expand(n1.dot(line)) == s.expand(n2.dot(line)) == 1
    P, Q, R = [s.Matrix(v) for v in [(1,3,2),(3,-1,6),(5,2,0)]]
    assert (Q-P).cross(R-P) == s.Matrix([12,20,14])
    assert all(s.Matrix([6,10,7]).dot(v) == 50 for v in [P,Q,R])
    assert all(s.Matrix([6,3,2]).dot(s.Matrix(v)) == 6 for v in [(1,0,0),(0,2,0),(0,0,3)])
    assert s.Matrix([1,0,1]).cross(s.Matrix([0,1,1])) == s.Matrix([-1,-1,1])
    assert s.limit(s.sin(2*t)/t,t,0) == 2
    assert s.Matrix([1,-1,2]) + s.Rational(1,2)*(s.Matrix([5,3,-2])-s.Matrix([1,-1,2])) == s.Matrix([3,1,0])
    # 2.10 판서 특수해를 원식에 직접 미분 대입한다. 양의 로그 진수 구간 사용.
    sec_example=s.cos(x)*s.log(s.cos(x))+x*s.sin(x)
    csc_example=-x*s.cos(x)+s.sin(x)*s.log(s.sin(x))
    assert s.trigsimp(s.diff(sec_example,x,2)+sec_example-1/s.cos(x)) == 0
    assert s.trigsimp(s.diff(csc_example,x,2)+csc_example-1/s.sin(x)) == 0
    variation_w=s.wronskian([s.exp(x),s.exp(-x)],x)
    assert variation_w == -2
    assert s.simplify(s.diff(s.exp(2*x)/3,x,2)-s.exp(2*x)/3-s.exp(2*x)) == 0
    # 3.1~3.3 근·기저·오일러코시·공명·초기조건을 직접 확인한다.
    assert s.factor(m**3-2*m**2-m+2) == (m-2)*(m-1)*(m+1)
    assert s.simplify(s.wronskian([s.exp(x),s.exp(-x),s.exp(x/2)],x)-s.Rational(3,2)*s.exp(x/2)) == 0
    for y in [1,x,s.exp(x),x*s.exp(x),x*x*s.exp(x)]:
        assert s.simplify(s.diff(y,x,5)-3*s.diff(y,x,4)+3*s.diff(y,x,3)-s.diff(y,x,2)) == 0
    assert s.expand(m*(m-1)*(m-2)+5*m*(m-1)+7*m+8) == s.expand((m+2)*(m*m+4))
    for y in [x,x*x,x**3]:
        assert s.simplify(x**3*s.diff(y,x,3)-3*x*x*s.diff(y,x,2)+6*x*s.diff(y,x)-6*y) == 0
    for y in [x**-2,s.cos(2*s.log(x)),s.sin(2*s.log(x))]:
        assert s.simplify(x**3*s.diff(y,x,3)+5*x*x*s.diff(y,x,2)+7*x*s.diff(y,x)+8*y) == 0
    y=(3-25*x*x+5*x**3)*s.exp(-x)
    assert s.simplify(s.diff(y,x,3)+3*s.diff(y,x,2)+3*s.diff(y,x)+y-30*s.exp(-x)) == 0
    assert [s.diff(y,x,k).subs(x,0) for k in range(3)] == [3,-3,-47]
    y=(1-x+x*x/2)*s.exp(x)
    assert s.simplify(s.diff(y,x,2)-2*s.diff(y,x)+y-s.exp(x)) == 0
    assert [y.subs(x,0),s.diff(y,x).subs(x,0)] == [1,0]
    # 물리 판서의 부호 있는 전류, 충전식·전류·시상수·단위.
    A=s.Matrix([[1,1,-1],[-4,0,-4],[0,-4,-4]])
    assert A.det() == -48
    assert A.inv()*s.Matrix([0,-3,0]) == s.Matrix([s.Rational(1,2),-s.Rational(1,4),s.Rational(1,4)])
    resistance, capacitance, emf = s.symbols('R C epsilon', positive=True)
    charge=capacitance*emf*(1-s.exp(-t/(resistance*capacitance)))
    assert s.simplify(resistance*s.diff(charge,t)+charge/capacitance-emf) == 0
    assert charge.subs(t,0) == 0 and s.limit(charge,t,s.oo) == capacitance*emf
    assert s.simplify(s.diff(charge,t)-emf/resistance*s.exp(-t/(resistance*capacitance))) == 0
    assert s.Rational(3000)*s.Rational(200,10**6) == s.Rational(3,5)
    assert abs(float(200*(1-s.exp(-1)))-126.4241) < 0.001


def verify_material(root, runtime_root):
    sys.path.insert(0,str(runtime_root))
    import school_runtime
    index=json.loads((root/'knowledge/lessons.json').read_text(encoding='utf-8'))
    report=[]
    memory={}
    get=lambda key,default='':memory.get(key,default)
    put=lambda key,value:memory.__setitem__(key,value)
    for course,slug,dates in [('미분적분학2','calc2',['2026-10-06','2026-10-08']),
                              ('공업수학1','em1',['2026-10-02','2026-10-07']),
                              ('일반물리학2','phys2',['2026-10-02'])]:
        for date in dates:
            lesson_id=slug+'-'+date
            entry=index['courses'][course][date]
            parsed=school_runtime.lesson(root,lesson_id)
            pack=json.loads((root/f'knowledge/lectures/{lesson_id}.json').read_text(encoding='utf-8'))
            ids=[step['id'] for step in parsed['steps']]
            quizzes=[step for step in parsed['steps'] if step['kind']=='quiz']
            route=[v for section in pack['sections'] for v in [*section['script'],section['check']]]+[w['id'] for w in pack['worksheet']]
            assert parsed['course']==course and parsed['date']==date
            assert len(ids)==len(set(ids))==entry['steps']
            assert len(route)==len(set(route)) and set(route)==set(ids)
            assert len(quizzes)>=7
            assert all(len(step['body'])<=320 for step in parsed['steps'])
            for q in quizzes:
                assert len(q['options'])==len(set(q['options']))==4 and 0<=q['answer']<4
                assert q['why']
                for choice in [q['answer'],(q['answer']+1)%4]:
                    # 실제 API의 판정 함수 사용. 테스트 메모리에만 기록하고 DB에는 쓰지 않는다.
                    state=school_runtime.apply_event(get,put,dict(id=f"audit-{lesson_id}-{q['id']}-{choice}",kind='answer',course=course,
                        lesson=lesson_id,step=q['id'],choice=choice,correct=choice!=q['answer']),root=root)
                    assert state['events'][-1]['correct'] == (choice==q['answer'])
                    assert state['events'][-1]['sourceHash']
            assert not parsed['warnings']
            report.append(dict(id=lesson_id,steps=len(ids),questions=len(quizzes),maxBody=max(len(st['body']) for st in parsed['steps']),routeComplete=True,serverGrading=True))
    return report


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('root',type=Path)
    parser.add_argument('runtime_root',type=Path)
    args=parser.parse_args()
    verify_math()
    print(json.dumps(dict(math='PASS',lessons=verify_material(args.root.resolve(),args.runtime_root.resolve())),ensure_ascii=False,indent=2))
