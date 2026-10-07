"""6주차 원문과 검산 결과를 기존 혼자 풀기(스앵님) 문제은행에 연결한다."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[2]
hw=root/'notes/lessons/_private/em1/hw'
def choice(q,options,answer,hints,explain,nodes):
    return dict(q=q,kind='choice',choices=options,answer=answer,hints=hints,explain=explain,nodes=nodes)
def num(q,value,hints,explain,nodes):
    return dict(q=q,kind='num',answer=dict(v=value,unit='',tol=.001),hints=hints,explain=explain,nodes=nodes)
base=['ode.higher_homog','ode.const_coeff']
basis=['ode.basis','ode.wronskian']
ivp=['ode.ivp','ode.higher_homog']
problems=[]
def problem(pid,given,ask,final,steps):
    problems.append(dict(id=pid,title=pid.replace('-', ' #')+' (6주차 과제)',given=given,ask=ask,exam=False,final=final,steps=steps))
problem('3.1-2',["y‴ − 2y″ − y′ + 2y = 0",'주어진 함수: eˣ, e⁻ˣ, e²ˣ'], '세 함수가 해인지 확인하고, 임의의 구간에서 기저임을 증명', 'W = −6e²ˣ ≠ 0 → 임의의 구간에서 해의 기저',[
    choice('이 문제에서 해야 할 일은?', ['초기값으로 상수 정하기','주어진 함수가 해인지, 서로 독립인지 확인','특수해만 구하기'],1,['문제에 함수 세 개가 이미 있습니다.','미분방정식의 해인지 대입해 확인합니다.','독립성을 확인하면 기저를 판단할 수 있습니다.'],'해인지 확인한 뒤 Wronskian으로 독립성을 확인합니다.',basis),
    choice('eʳˣ를 대입하여 얻는 특성다항식은?', ['r³ − 2r² − r + 2','r³ + 2r² − r + 2','r² − 2r + 2'],0,['미분 한 번마다 r이 곱해집니다.','y‴는 r³, y″는 r²에 대응합니다.','원래 식의 계수와 부호를 유지합니다.'],'p(r)=r³−2r²−r+2=(r−1)(r+1)(r−2).',base),
    choice('세 함수의 지수 1, −1, 2를 대입한 결과는?', ['모두 0 → 세 함수 모두 해','하나만 0 → 하나만 해','모두 1 → 세 함수 모두 해'],0,['특성다항식의 인수들을 보세요.','각 숫자가 어느 인수를 0으로 만드는지 봅니다.','p(1)=p(−1)=p(2)=0입니다.'],'각 함수의 원식 대입 잔차가 0입니다.',base),
    num('Wronskian의 x=0 값을 구하세요. 열 순서는 eˣ, e⁻ˣ, e²ˣ입니다.',-6,['각 행은 함수, 1차 미분, 2차 미분입니다.','x=0에서 행렬은 [1,1,1; 1,−1,2; 1,1,4]입니다.','첫 행으로 전개하면 −6입니다.'],'W(x)=−6e²ˣ.',basis),
    choice('W(x)=−6e²ˣ에서 기저를 결론 내릴 수 있는 이유는?', ['x=0에서만 0이 아니기 때문에','모든 실수 x에서 W≠0이고, 3차 방정식의 독립인 해가 세 개이기 때문에','함수가 모두 양수이기 때문에'],1,['e²ˣ는 0이 되지 않습니다.','Wronskian이 0이 아니면 독립입니다.','최고차항 계수가 1인 3차 방정식입니다.'],'세 함수는 임의의 구간에서 해의 기저입니다.',basis)])
problem('3.1-5',['y‴ + 2y″ + 5y′ = 0','주어진 함수: 1, e⁻ˣ cos 2x, e⁻ˣ sin 2x'], '주어진 함수가 해이고 임의의 구간에서 기저임을 증명','W = 10e⁻²ˣ ≠ 0 → 임의의 구간에서 해의 기저',[
    choice('상수 함수 1을 원래 식에 넣으면?', ['잔차 5','모든 미분이 0이므로 잔차 0','상수는 해가 될 수 없음'],1,['원래 식에 y 자체의 항은 없습니다.','상수의 미분은 0입니다.','y′, y″, y‴가 모두 0입니다.'],'L[1]=0이므로 1은 해입니다.',basis),
    choice('특성방정식과 근은?', ['r(r²+2r+5)=0, 근 0와 −1±2i','r²+2r+5=0, 근 −1±2i만','r(r²−2r+5)=0, 근 0와 1±2i'],0,['미분차수 3, 2, 1을 그대로 옮깁니다.','r을 묶으면 r(r²+2r+5)입니다.','이차식은 (r+1)²+4입니다.'],'복소근 −1±2i에 대응하는 실수해가 e⁻ˣ cos 2x, e⁻ˣ sin 2x입니다.',base),
    choice('f=e⁻ˣ cos 2x의 1차 미분은?', ['e⁻ˣ(−cos 2x − 2sin 2x)','e⁻ˣ(cos 2x − 2sin 2x)','−2e⁻ˣ sin 2x'],0,['곱의 미분을 씁니다.','(e⁻ˣ)′=−e⁻ˣ입니다.','(cos 2x)′=−2sin 2x입니다.'],'f′=e⁻ˣ(−cos 2x−2sin 2x).',basis),
    num('Wronskian의 x=0 값은? 열 순서는 1, e⁻ˣ cos 2x, e⁻ˣ sin 2x입니다.',10,['첫 열은 [1,0,0]입니다.','나머지 미분값은 [−1,2; −3,−4]입니다.','(−1)(−4)−2(−3)를 계산합니다.'],'W(x)=10e⁻²ˣ.',basis),
    choice('W=10e⁻²ˣ의 결론은?', ['x>0에서만 기저','임의의 구간에서 기저','W가 양수이므로 해가 아님'],1,['지수함수는 모든 실수 x에서 양수입니다.','따라서 W는 어느 점에서도 0이 아닙니다.','세 함수는 독립인 해 세 개입니다.'],'임의의 구간에서 해의 기저입니다.',basis)])
problem('3.2-2',['y⁽⁴⁾ + 2y″ + y = 0'], '일반해와 풀이 과정','y = (C₁+C₂x)cos x + (C₃+C₄x)sin x',[
    choice('사용할 풀이 방법은?', ['상수계수 동차방정식의 특성방정식','미정계수법으로 외력 항 구하기','변수분리'],0,['오른쪽이 0입니다.','미분 항의 계수들이 상수입니다.','y=eʳˣ를 가정합니다.'],'상수계수 동차 선형방정식입니다.',base),
    choice('특성다항식의 인수분해는?', ['(r²+1)²','(r²−1)²','(r+1)⁴'],0,['r⁴+2r²+1입니다.','a²+2a+1=(a+1)²입니다.','a=r²로 놓습니다.'],'(r²+1)²=0.',base),
    num('근 i의 중복도는 얼마인가요?',2,['r²+1=(r−i)(r+i)입니다.','이 전체가 제곱되어 있습니다.','i와 −i가 각각 두 번 반복됩니다.'],'±i는 각각 2중근입니다.',base),
    choice('네 개의 독립인 실수해를 모두 포함한 일반해는?', ['C₁cos x+C₂sin x','(C₁+C₂x)cos x+(C₃+C₄x)sin x','C₁eˣ+C₂e⁻ˣ+C₃e²ˣ+C₄e⁻²ˣ'],1,['복소근 ±i는 cos x와 sin x를 만듭니다.','중근이므로 x를 곱한 해도 필요합니다.','4차 방정식의 일반해에는 상수 네 개가 필요합니다.'],'y=(C₁+C₂x)cos x+(C₃+C₄x)sin x.',base)])
problem('3.2-4',['(D³ − D² − D + I)y = 0','D는 미분 연산자, I는 항등 연산자'], '일반해와 풀이 과정','y = (C₁+C₂x)eˣ + C₃e⁻ˣ',[
    choice('Iy를 풀어 쓴 것은?', ['1','y','y′'],1,['I는 함수를 그대로 두는 연산입니다.','미분하지 않습니다.','따라서 Iy=y입니다.'],'원식은 y‴−y″−y′+y=0입니다.',['ode.diff_operator']),
    choice('특성다항식 인수분해는?', ['(r−1)²(r+1)','(r+1)²(r−1)','r(r−1)(r+1)'],0,['r³−r²−r+1입니다.','r²(r−1)−(r−1)로 묶습니다.','(r−1)(r²−1)을 다시 인수분해합니다.'],'(r−1)²(r+1)=0.',base),
    num('근 r=1의 중복도는?',2,['인수 (r−1)의 지수를 봅니다.','(r−1)²입니다.','같은 근이 두 번 나옵니다.'],'r=1은 2중근, r=−1은 단근입니다.',base),
    choice('일반해는?', ['C₁eˣ+C₂e⁻ˣ','(C₁+C₂x)eˣ+C₃e⁻ˣ','(C₁+C₂x)e⁻ˣ+C₃eˣ'],1,['r=1에는 eˣ와 xeˣ가 대응합니다.','r=−1에는 e⁻ˣ가 대응합니다.','상수 세 개를 모두 포함합니다.'],'y=(C₁+C₂x)eˣ+C₃e⁻ˣ.',base)])
problem('3.2-8',['y‴ + 7.5y″ + 14.25y′ − 9.125y = 0','y(0)=10.05, y′(0)=−54.975, y″(0)=257.5125'], 'CAS를 사용한 일반해·초기조건을 적용한 특수해·그래프','y = 0.05eˣᐟ² + 10e⁻⁴ˣ(cos(3x/2) − sin(3x/2))',[
    choice('특성다항식 인수분해는?', ['(r−0.5)(r²+8r+18.25)','(r+0.5)(r²+8r+18.25)','(r−0.5)(r²−8r+18.25)'],0,['상수항이 −9.125입니다.','−0.5×18.25=−9.125입니다.','r²의 계수는 8−0.5=7.5입니다.'],'근은 0.5와 −4±1.5i입니다.',base),
    choice('일반해는?', ['C₁eˣᐟ²+e⁻⁴ˣ(C₂cos(3x/2)+C₃sin(3x/2))','C₁e⁻ˣᐟ²+e⁴ˣ(C₂cos(3x/2)+C₃sin(3x/2))','C₁eˣᐟ²+C₂e⁻⁴ˣ+C₃xe⁻⁴ˣ'],0,['실근 0.5는 eˣᐟ²를 만듭니다.','복소근의 실수부 −4는 e⁻⁴ˣ입니다.','허수부 1.5는 삼각함수의 주파수입니다.'],'상수 세 개를 초기조건 세 개로 결정합니다.',base),
    choice('y′(0)에 해당하는 연립방정식은?', ['0.5C₁−4C₂+1.5C₃=−54.975','0.5C₁+4C₂+1.5C₃=−54.975','0.5C₁−4C₂−1.5C₃=−54.975'],0,['지수함수와 삼각함수의 곱을 미분합니다.','x=0에서 sin 0=0, cos 0=1입니다.','sin(1.5x)의 미분은 +1.5cos(1.5x)입니다.'],'두 번 미분한 조건은 0.25C₁+13.75C₂−12C₃=257.5125입니다.',ivp),
    num('세 초기조건을 함께 풀었을 때 C₁은?',.05,['C₁+C₂=10.05입니다.','나머지 두 조건과 함께 연립합니다.','C₂=10, C₃=−10이 나오므로 C₁=0.05입니다.'],'C₁=0.05.',ivp),
    num('같은 연립방정식의 C₂는?',10,['일반해에서 cos 항의 계수입니다.','C₁+C₂=10.05를 이용합니다.','10.05−0.05를 계산합니다.'],'C₂=10.',ivp),
    num('같은 연립방정식의 C₃는?',-10,['0.5C₁−4C₂+1.5C₃=−54.975입니다.','0.025−40+1.5C₃=−54.975입니다.','1.5C₃=−15입니다.'],'C₃=−10. 따라서 y=0.05eˣᐟ²+10e⁻⁴ˣ(cos(3x/2)−sin(3x/2)).',ivp),
    choice('문제에서 요구한 결과를 모두 갖추려면?', ['특수해만 적는다','일반해·특수해·그래프를 제시하고 초기조건을 검산한다','그래프 없이 상수만 적는다'],1,['교재 7~13번 공통 지시를 확인합니다.','일반해와 particular solution이 모두 필요합니다.','해의 그래프도 요구합니다.'],'표시 구간 0≤x≤2의 그래프는 자료에 함께 준비했습니다. 구간은 확인용으로 선택한 것입니다.',ivp)])
problem('3.2-12',['y⁽⁵⁾ − 5y‴ + 4y′ = 0','y(0)=3, y′(0)=−5, y″(0)=11, y‴(0)=−23, y⁽⁴⁾(0)=47'], 'CAS를 사용한 일반해·초기조건을 적용한 특수해·그래프','y = 1 − e⁻ˣ + 3e⁻²ˣ',[
    choice('특성방정식의 인수분해는?', ['r(r²−1)(r²−4)=0','r(r²+1)(r²+4)=0','(r²−1)(r²−4)=0'],0,['r⁵−5r³+4r입니다.','먼저 r을 묶습니다.','r⁴−5r²+4=(r²−1)(r²−4)입니다.'],'근은 0, ±1, ±2입니다.',base),
    choice('근 r=0에 대응하는 해는?', ['0이므로 일반해에서 제외','상수 함수 1','함수 x'],1,['eʳˣ에 r=0을 넣습니다.','e⁰=1입니다.','독립인 상수해를 포함해야 합니다.'],'일반해는 C₀+C₁eˣ+C₂e⁻ˣ+C₃e²ˣ+C₄e⁻²ˣ입니다.',base),
    choice('y′(0)=−5에 대응하는 식은?', ['C₁−C₂+2C₃−2C₄=−5','C₀+C₁−C₂+2C₃−2C₄=−5','C₁+C₂+2C₃+2C₄=−5'],0,['상수 C₀를 미분하면 0입니다.','e⁻ˣ의 미분 계수는 −1입니다.','e⁻²ˣ의 미분 계수는 −2입니다.'],'미분 차수별로 각 지수의 거듭제곱을 계수로 사용합니다.',ivp),
    num('초기조건 다섯 개를 연립했을 때 상수항 C₀는?',1,['근 순서는 0,1,−1,2,−2입니다.','네 미분 조건에서 C₁=0, C₂=−1, C₃=0, C₄=3입니다.','y(0)=3에서 C₀−1+3=3입니다.'],'C₀=1.',ivp),
    num('e⁻ˣ의 계수 C₂는?',-1,['홀수차 미분 조건 두 개를 빼 봅니다.','짝수차 미분 조건 두 개도 함께 사용합니다.','연립하면 C₁=0, C₂=−1입니다.'],'C₂=−1.',ivp),
    num('e⁻²ˣ의 계수 C₄는?',3,['C₃+C₄=3, C₃−C₄=−3입니다.','두 식을 더하면 C₃=0입니다.','따라서 C₄=3입니다.'],'y=1−e⁻ˣ+3e⁻²ˣ입니다.',ivp),
    choice('특수해의 그래프에서 x가 커질 때 y는 어디에 가까워지나요?', ['0','1','무한대'],1,['x가 커지면 e⁻ˣ는 0에 가까워집니다.','e⁻²ˣ도 0에 가까워집니다.','남는 항은 상수 1입니다.'],'그래프를 그리고 초기조건 다섯 개와 원식을 검산합니다.',ivp)])
data=dict(ch='3',course='공업수학1',title='6주차 과제 · 3.1절 2·5번 / 3.2절 2·4·8·12번',due='마감 미확인 — 판서 사진에 표기 없음',src='대표님 제공 10/7 판서 + Kreyszig 10e 인쇄 p.111·116 / PDF 137·142쪽. 6주차_검산.json으로 원식·초기조건 확인.',problems=problems)
(hw/'ch3.json').write_text(json.dumps(data,ensure_ascii=False,indent=1)+'\n',encoding='utf-8')
meta_path=hw/'meta.json'; meta=json.loads(meta_path.read_text(encoding='utf-8'))
if not any(t[0]=='3' for t in meta['tabs']): meta['tabs'].append(['3','6주차 · 3장'])
meta['banner']='6주차 과제 추가 · 3.1 #2·5 / 3.2 #2·4·8·12 · 마감 미확인'
meta_path.write_text(json.dumps(meta,ensure_ascii=False,indent=1)+'\n',encoding='utf-8')
registry=root/'_private/submit.json'; data=json.loads(registry.read_text(encoding='utf-8'))
link=dict(course='공업수학1',match='6주차',file='notes/lessons/_private/em1/hw/index.html?ch=3',label='혼자 풀기(스앵님) · 6주차')
# 서버는 파일 존재를 확인하므로 URL query 대신 별도 진입 파일을 사용한다.
entry=hw/'week6.html'
entry.write_text('<!doctype html><meta charset="utf-8"><title>6주차 과제 혼자 풀기</title><script>location.replace("index.html?ch=3");</script><a href="index.html?ch=3">6주차 과제 혼자 풀기(스앵님)</a>',encoding='utf-8')
link['file']='notes/lessons/_private/em1/hw/week6.html'
existing=next((f for f in data['files'] if f.get('course')=='공업수학1' and f.get('match')=='6주차' and '혼자' in f.get('label','')),None)
if existing: existing.update(link)
else: data['files'].insert(0,link)
for f in data['files']:
    if f.get('course')=='공업수학1' and f.get('match')=='주차 과제' and '혼자' in f.get('label',''):
        f['match']='^(?!6주차).*주차 과제'
submission=root.parent/'study-materials/공업수학1/_과제/6주차_과제_제출용.pdf'
if submission.exists():
    import shutil
    shutil.copy2(submission,root/'_private/submit/em1_hw6.pdf')
    pdf_link=dict(course='공업수학1',match='6주차',file='_private/submit/em1_hw6.pdf',label='제출용 PDF (손으로 옮겨 적기)')
    if not any(f.get('file')==pdf_link['file'] for f in data['files']): data['files'].insert(1,pdf_link)
registry.write_text(json.dumps(data,ensure_ascii=False,indent=1)+'\n',encoding='utf-8')
print('6주차 6문제 ·',sum(len(p['steps']) for p in problems),'단계 · 기존 스앵님 질문/힌트/실전 채점에 연결')
