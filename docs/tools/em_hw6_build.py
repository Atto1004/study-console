"""사진·교재로 확인한 6주차 공수 과제. 정확한 유리수로 검산하고 개인 자료를 생성한다."""
from pathlib import Path
import json
import sympy as s
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

root = Path(__file__).resolve().parents[2]
out = root.parent/'study-materials'/'공업수학1'/'_과제'
x, r = s.symbols('x r', real=True)
y8 = s.exp(x/2)/20 + 10*s.exp(-4*x)*(s.cos(3*x/2)-s.sin(3*x/2))
y12 = 1-s.exp(-x)+3*s.exp(-2*x)
checks = {}
for key,y,terms,initial in [
    ('3.2-8',y8,[(3,1),(2,s.Rational(15,2)),(1,s.Rational(57,4)),(0,-s.Rational(73,8))],[s.Rational(201,20),-s.Rational(2199,40),s.Rational(20601,80)]),
    ('3.2-12',y12,[(5,1),(3,-5),(1,4)],[3,-5,11,-23,47])]:
    residual=s.simplify(sum(c*s.diff(y,x,k) for k,c in terms))
    values=[s.simplify(s.diff(y,x,k).subs(x,0)) for k in range(len(initial))]
    assert residual==0 and values==initial, (key,residual,values)
    checks[key]={'ode_residual':str(residual),'initial_values':[str(v) for v in values],'solution':str(y)}
    xx=np.linspace(0,2,401)
    plt.figure(figsize=(5.8,2.5))
    plt.plot(xx,s.lambdify(x,y,'numpy')(xx),color='#3e5c8a',lw=2)
    plt.axhline(0,color='#aaa',lw=.6); plt.grid(alpha=.22)
    plt.xlabel('x'); plt.ylabel('y'); plt.title('Problem '+key+' | 0 <= x <= 2',fontsize=10)
    plt.tight_layout(); plt.savefig(out/(key+'_graph.png'),dpi=180); plt.close()
for key,fs,terms in [
    ('3.1-2',[s.exp(x),s.exp(-x),s.exp(2*x)],[(3,1),(2,-2),(1,-1),(0,2)]),
    ('3.1-5',[s.Integer(1),s.exp(-x)*s.cos(2*x),s.exp(-x)*s.sin(2*x)],[(3,1),(2,2),(1,5)])]:
    residuals=[s.simplify(sum(c*s.diff(f,x,k) for k,c in terms)) for f in fs]
    w=s.simplify(s.det(s.Matrix([[s.diff(f,x,k) for f in fs] for k in range(3)])))
    assert residuals==[0,0,0] and w!=0
    checks[key]={'residuals':[str(v) for v in residuals],'wronskian':str(w)}
for key,fs,terms in [
    ('3.2-2',[s.cos(x),x*s.cos(x),s.sin(x),x*s.sin(x)],[(4,1),(2,2),(0,1)]),
    ('3.2-4',[s.exp(x),x*s.exp(x),s.exp(-x)],[(3,1),(2,-1),(1,-1),(0,1)])]:
    residuals=[s.simplify(sum(c*s.diff(f,x,k) for k,c in terms)) for f in fs]
    w=s.simplify(s.det(s.Matrix([[s.diff(f,x,k) for f in fs] for k in range(len(fs))])))
    assert all(v==0 for v in residuals) and w!=0
    checks[key]={'residuals':[str(v) for v in residuals],'wronskian':str(w)}
(out/'6주차_검산.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8')

def math(tex): return '<div class="line">\\['+tex+'\\]</div>'
def step(title,*eq): return '<div class="stp">'+title+'</div>'+''.join(math(t) for t in eq)
def ans(tex): return '<div class="ans">'+math(tex)+'</div>'
def question(no,eq,tag,body): return '<section class="q"><div class="qh"><span class="no">'+no+'</span><div class="qq">'+math(eq)+'</div><span class="tag">'+tag+'</span></div><div class="body">'+body+'</div></section>'
qs=[]
qs.append(('3.1 #2',r"y'''-2y''-y'+2y=0",'기저',
    step('Step 1 해인지 확인',r'p(r)=r^3-2r^2-r+2=(r-1)(r+1)(r-2)',r'p(1)=p(-1)=p(2)=0',r'L[e^x]=L[e^{-x}]=L[e^{2x}]=0')+
    step('Step 2 Wronskian 구하기',r'W=\begin{vmatrix}e^x&e^{-x}&e^{2x}\\e^x&-e^{-x}&2e^{2x}\\e^x&e^{-x}&4e^{2x}\end{vmatrix}=-6e^{2x}\ne0')+
    ans(r'\{e^x,e^{-x},e^{2x}\}:\ \text{임의의 구간에서 해의 기저}')))
qs.append(('3.1 #5',r"y'''+2y''+5y'=0",'기저',
    step('Step 1 해인지 확인',r'p(r)=r(r^2+2r+5),\quad r=0,-1\pm2i',r'L[1]=0,\quad L[e^{-x}\cos2x]=L[e^{-x}\sin2x]=0')+
    step('Step 2 Wronskian 구하기',r'c=\cos2x,\quad t=\sin2x',r'W=e^{-2x}\begin{vmatrix}-c-2t&2c-t\\-3c+4t&-4c-3t\end{vmatrix}',r'W=10e^{-2x}(c^2+t^2)=10e^{-2x}\ne0')+
    ans(r'\{1,e^{-x}\cos2x,e^{-x}\sin2x\}:\ \text{임의의 구간에서 해의 기저}')))
qs.append(('3.2 #2',r'y^{(4)}+2y^{\prime\prime}+y=0','중근',
    step('Step 1 특성방정식 구하기',r'r^4+2r^2+1=(r^2+1)^2=0',r'r=\pm i\quad(\text{각각 2중근})')+
    step('Step 2 일반해 구하기')+ans(r'y=(C_1+C_2x)\cos x+(C_3+C_4x)\sin x')))
qs.append(('3.2 #4',r'(D^3-D^2-D+I)y=0','중근',
    step('Step 1 특성방정식 구하기',r'D=\frac{d}{dx},\quad Iy=y',r'r^3-r^2-r+1=(r-1)^2(r+1)=0',r'r=1\ (\text{2중근}),\quad r=-1')+
    step('Step 2 일반해 구하기')+ans(r'y=(C_1+C_2x)e^x+C_3e^{-x}')))
qs.append(('3.2 #8',r"y'''+7.5y''+14.25y'-9.125y=0",'초기값',
    math(r"y(0)=10.05,\quad y'(0)=-54.975,\quad y''(0)=257.5125")+
    step('Step 1 특성방정식 구하기',r'r^3+\frac{15}{2}r^2+\frac{57}{4}r-\frac{73}{8}=(r-\frac12)(r^2+8r+\frac{73}{4})=0',r'r=\frac12,\quad -4\pm\frac32i')+
    step('Step 2 일반해 구하기',r'y=C_1e^{x/2}+e^{-4x}(C_2\cos\frac{3x}{2}+C_3\sin\frac{3x}{2})')+
    step('Step 3 초기조건 적용',r'C_1+C_2=10.05',r'\frac12C_1-4C_2+\frac32C_3=-54.975',r'\frac14C_1+\frac{55}{4}C_2-12C_3=257.5125',r'C_1=0.05,\quad C_2=10,\quad C_3=-10')+
    ans(r'y=0.05e^{x/2}+10e^{-4x}(\cos\frac{3x}{2}-\sin\frac{3x}{2})')+
    '<div class="stp">해의 그래프</div><img class="graph" src="3.2-8_graph.png">'))
qs.append(('3.2 #12',r'y^{(5)}-5y^{\prime\prime\prime}+4y^{\prime}=0','초기값',
    math(r"y(0)=3,\ y'(0)=-5,\ y''(0)=11,\ y'''(0)=-23,\ y^{(4)}(0)=47")+
    step('Step 1 특성방정식 구하기',r'r^5-5r^3+4r=r(r^2-1)(r^2-4)=0',r'r=0,1,-1,2,-2')+
    step('Step 2 일반해 구하기',r'y=C_0+C_1e^x+C_2e^{-x}+C_3e^{2x}+C_4e^{-2x}')+
    step('Step 3 초기조건 적용',r'C_0+C_1+C_2+C_3+C_4=3',r'C_1-C_2+2C_3-2C_4=-5',r'C_1+C_2+4C_3+4C_4=11',r'C_1-C_2+8C_3-8C_4=-23',r'C_1+C_2+16C_3+16C_4=47',r'C_0=1,\ C_1=0,\ C_2=-1,\ C_3=0,\ C_4=3')+
    ans(r'y=1-e^{-x}+3e^{-2x}')+'<div class="stp">해의 그래프</div><img class="graph" src="3.2-12_graph.png">'))

template=(out/'5주차_과제_제출용.html').read_text(encoding='utf-8')
style=template[template.index('<style>'):template.index('</style>')+8]
style+='<style>.q{padding:12px 0}.page{break-after:page}.page:last-child{break-after:auto}.graph{width:300px}@media print{.sheet{zoom:.85}.q{margin:0}.page{padding-top:5px}}.explain{margin:8px 0;color:#4a5666}</style>'
def document(title,body):
    return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>'+title+'</title>'+style+'''<script>window.MathJax={tex:{inlineMath:[['\\(','\\)']]},svg:{fontCache:'local'}};</script><script src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js"></script></head><body><main class="sheet"><div class="top"><div class="l">MATHEMATICS<br>SOLUTION</div><div class="c"><h1>공업수학1</h1><div class="sub">'''+title+'''</div></div><div class="r">KREYSZIG · 10e<br>3.1 / 3.2</div></div><div class="rule"></div><div class="rule thin"></div>'''+body+'</main></body></html>'
submission='<div class="who"><span>이름: __________ 학번: __________</span><span>6주차 · 2026.10.07 공지</span></div>'
for group in [qs[:2],qs[2:4],qs[4:5],qs[5:]]:
    submission+='<div class="page">'+''.join(question(*q) for q in group)+'</div>'
(out/'6주차_과제_제출용.html').write_text(document('6주차 과제 · 제출용',submission),encoding='utf-8')
explanations=[
    '이 문제는 답을 새로 구하는 문제가 아닙니다. 주어진 세 함수가 미분방정식의 해인지, 서로 겹치지 않는 독립적인 해인지 확인합니다. 지수함수를 미분하면 지수 앞의 숫자가 반복해서 곱해지므로 특성다항식에 1, −1, 2를 넣어 확인할 수 있습니다. Wronskian이 0이 아니면 세 함수가 독립이고, 3차 방정식에 필요한 세 개의 기본 해를 갖춘 것입니다.',
    '상수 1의 미분은 모두 0이라 바로 해가 됩니다. 나머지 둘은 지수함수와 삼각함수의 곱입니다. 복소근 −1±2i는 감쇠하는 cos·sin 한 쌍을 만듭니다. c와 t는 계산을 짧게 쓰기 위한 cos 2x, sin 2x의 임시 이름입니다. c²+t²=1을 쓰면 Wronskian이 정리됩니다.',
    '먼저 y=e^(rx)라고 가정하면 미분방정식을 r에 대한 방정식으로 바꿀 수 있습니다. ±i가 각각 두 번 반복됩니다. cos x와 sin x만 쓰면 네 개여야 할 독립적인 해 중 두 개가 빠집니다. 각각에 x를 곱한 해까지 넣어야 합니다.',
    'D는 한 번 미분하라는 연산이고 I는 원래 함수를 그대로 두는 연산입니다. I를 숫자 1이 아니라 함수 y로 읽어야 원래 방정식이 됩니다. r=1이 두 번 반복되므로 e^x뿐 아니라 xe^x도 포함합니다.',
    '초기값 세 개는 일반해의 상수 세 개를 정해 줍니다. 해를 한 번, 두 번 미분하고 x=0을 넣어 세 개의 연립방정식을 만듭니다. e^0=1, cos 0=1, sin 0=0이라 계산이 단순해집니다. 소수는 정확한 분수로 바꿔 검산했습니다. 그래프의 표시 구간 0≤x≤2는 확인을 위해 선택한 구간이며, 문제에서 지정한 구간은 아닙니다.',
    '5차 방정식에는 상수 다섯 개가 필요합니다. r=0은 상수해를 만드므로 C₀를 빠뜨리면 안 됩니다. 초기값 다섯 개로 상수를 정하면 e^x와 e^(2x)의 계수는 0이 됩니다. 따라서 특수해에는 세 항만 남습니다. 그래프에서는 x가 커질 때 두 지수항이 사라져 y가 1에 가까워지는 것을 확인할 수 있습니다.'
]
understanding=''
guide='<p>확인한 범위: 3.1절 2·5번, 3.2절 2·4·8·12번. 총 6문제.</p><p>마감·제출 방식: 사진에 없음, 확인 필요. 제출용은 손으로 옮겨 쓸 수 있도록 수식 중심으로 구성했습니다.</p><p>교재 근거: 영문 10판 인쇄 p.111·116 (PDF 137·142쪽). 3.2절 8·12번은 CAS 풀이와 일반해·특수해·그래프를 요구합니다.</p>'
for q,explain in zip(qs,explanations):
    understanding+='<div class="page"><h2>'+q[0]+' · '+q[2]+'</h2><p class="explain">'+explain+'</p>'+question(*q)+'</div>'
    guide+='<section class="q"><h2>'+q[0]+'</h2>'+math(q[1])+'<p>'+explain+'</p><p>스스로 풀기 → 제출용의 결과와 비교 → 원래 미분방정식에 대입하여 검산.</p></section>'
guide+='<p>검산: 6문제의 해를 원식에 대입한 잔차가 모두 0입니다. 기저 문제의 Wronskian은 각각 −6e^(2x), 10e^(−2x)로 모든 실수 x에서 0이 아닙니다. 초기값 문제의 모든 조건도 정확히 일치합니다.</p>'
for name,title,body in [('6주차_과제_이해용','6주차 과제 · 이해용',understanding),('6주차_과제가이드','6주차 과제 · 풀이 가이드',guide)]:
    (out/(name+'.html')).write_text(document(title,body),encoding='utf-8')
print('6문제 기호 검산 통과 · HTML 3종과 초기값 그래프 2종 생성')
