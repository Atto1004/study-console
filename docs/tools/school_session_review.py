"""Independent real-function CAS tests; all state and lesson sources are mocked."""
import ast,json,re,threading,time
from pathlib import Path
from types import SimpleNamespace
runtime=next(Path('C:/Users/user').glob('*/atom/school_runtime.py'))
tree=ast.parse(runtime.read_text(encoding='utf8'))
names={'SessionConflict','active_session','save_session'}
definitions=[n for n in tree.body if isinstance(n,(ast.FunctionDef,ast.ClassDef)) and n.name in names]
sources={k:{'id':k,'course':'C','steps':[{'id':'concept','kind':'understand'},{'id':'example','kind':'example'},{'id':'quiz','kind':'quiz'}]} for k in ('base','extra')}
initial={'revision':7,'events':[{'id':'legacy-event','kind':'position','lesson':'base','index':2}],'progress':{'base':{'index':2}},'work':{'base/quiz':{'text':'student work'}},'drafts':{'keep':True},'settings':{'voice':False}}
store={'learning':json.dumps(initial)}
api=SimpleNamespace(STUDY_DIR='unused',kv_get=lambda k,d='':store.get(k,d),kv_set=lambda k,v:store.__setitem__(k,v))
def resolve(root,ident,state):
    if ident not in sources: raise ValueError('invalid lesson')
    return sources[ident]
scope=dict(json=json,re=re,time=time,LOCK=threading.RLock(),KEY='learning',load=lambda get:json.loads(get('learning')),resolve_lesson=resolve)
exec(compile(ast.Module(body=definitions,type_ignores=[]),str(runtime),'exec'),scope)
active,save=scope['active_session'],scope['save_session']
before=store['learning']
legacy=active(api)
assert legacy['lessonId']=='base' and legacy['stepId']=='quiz' and legacy['revision']==0
assert store['learning']==before
request=dict(id='session-0001',revision=0,course='C',lessonId='extra',stepId='concept',returnTo={'lessonId':'base','stepId':'quiz','assisted':True,'conversationCursor':'conversation'},assisted=False)
saved=save(api,request)
assert saved['revision']==1 and saved['returnTo']['workKey']=='base/quiz'
assert saved['returnTo']['assisted'] is True
state=json.loads(store['learning'])
for key in ('events','progress','work','drafts','settings'): assert state[key]==initial[key]
assert state['revision']==8
before=store['learning']
for bad in [request,{**request,'revision':True},{**request,'revision':1,'stepId':'missing'},{**request,'revision':1,'returnTo':{'lessonId':'base','stepId':'missing'}}]:
    try: save(api,bad)
    except ValueError: pass
    else: raise AssertionError('invalid or stale session accepted')
    assert store['learning']==before
returned=save(api,{**request,'revision':1,'lessonId':'base','stepId':'quiz','assisted':True,'returnTo':None})
assert returned['assisted'] and returned['returnTo'] is None and returned['revision']==2
assert active(api)==returned
barrier=threading.Barrier(2)
results=[]
def concurrent(step):
    barrier.wait()
    try: results.append(save(api,{**request,'revision':2,'lessonId':'base','stepId':step,'returnTo':None}))
    except scope['SessionConflict']: results.append('conflict')
workers=[threading.Thread(target=concurrent,args=(step,)) for step in ('concept','example')]
for worker in workers: worker.start()
for worker in workers: worker.join()
assert results.count('conflict')==1
assert sum(isinstance(result,dict) for result in results)==1
assert active(api)['revision']==3
assert json.loads(store['learning'])['work']==initial['work']
print('GREEN: legacy resume read-only; CAS stale/bool conflicts and invalid steps reject without writes; returnTo sanitized; work/evidence/materials preserved; return clears target and keeps assisted.')
print('GREEN: simultaneous saves with identical revision allow one writer and reject the other, preserving student work.')
coach_definition=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='coach')
exec(compile(ast.Module(body=[coach_definition],type_ignores=[]),str(runtime),'exec'),scope)
before=store['learning']
for bad in [dict(sessionId='stale-session',lesson='base',index=0),dict(sessionId=active(api)['id'],lesson='extra',index=0),dict(sessionId=active(api)['id'],lesson='base',index=2)]:
    try: scope['coach'](api,dict(id='new-question',question='check',course='C',**bad))
    except ValueError: pass
    else: raise AssertionError('stale/mismatched coach session accepted')
    assert store['learning']==before
print('GREEN: coach stale session id, wrong lesson and wrong step reject before model/file access, without state changes.')
