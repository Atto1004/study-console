"""Independent in-memory backend regression: never opens a database."""
import importlib.util
import json
from pathlib import Path
import sys
import threading
from types import SimpleNamespace

backend = next(Path('C:/Users/user').glob('*/atom/school_workspace.py'))
sys.modules['school_assignments'] = SimpleNamespace(STATUS_LOCK=threading.Lock())
spec = importlib.util.spec_from_file_location('review_workspace', backend)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
original = {'activeTermId':'T','terms':[{'id':'T','start':'2026-09-01','end':'2026-12-21','courses':[{'id':'C','name':'Course','slots':[]}],'sessions':[],'plans':[]}], 'misc':{'sentinel':[1,2]},'profile':{'dailyCap':1}, 'v60':{'assignmentStatus':{'A':{'submitted':True}},'workspaceRevision':0}}
store={'study_state':json.dumps(original)}
api=SimpleNamespace(kv_get=lambda k,d='':store.get(k,d),kv_set=lambda k,v:store.__setitem__(k,v))
def mutation(**fields):
    return module.mutate(api,dict(termId='T',revision=module.revision(json.loads(store['study_state'])),**fields))
mutation(op='plan-add',plans=[dict(courseId='C',date='2026-10-07',s='08:00',e='08:30',kind='review',note='direct')])
saved=json.loads(store['study_state'])
assert saved['misc']==original['misc']
assert saved['v60']['assignmentStatus']==original['v60']['assignmentStatus']
assert saved['v60']['workspaceRevision']==1
before=store['study_state']
for request in [dict(termId='T',revision=0,op='attendance',courseId='C',date='2026-10-07',status='present'),dict(termId='T',revision=1,op='attendance',courseId='C',date='2099-10-07',status='present'),dict(termId='T',revision=1,op='plan-add',plans=[dict(courseId='C',date='2026-10-07',s='08:20',e='08:45',note='overlap')]),dict(termId='T',revision=1,op='plan-add',plans=[dict(courseId='C',date='2026-10-07',s='10:00',e='10:45',note='over cap')])]:
    try: module.mutate(api,request)
    except ValueError: pass
    else: raise AssertionError('invalid mutation accepted: '+str(request))
    assert store['study_state']==before
assert not json.loads(store['study_state'])['terms'][0]['sessions']
print('GREEN: preserve unrelated fields and assignmentStatus; stale revision/future attendance/plan overlap/daily cap reject without writes; attendance remains unconfirmed.')

state=json.loads(store['study_state'])
state['terms'][0].update(startDate='2026-10-05',endDate='2026-10-09')
state['terms'][0]['courses'][0]['slots']=[{'d':1,'s':'09:00','e':'10:00'},{'d':3,'s':'09:00','e':'10:00'}]
store['study_state']=json.dumps(state)
before=store['study_state']
view=module.overview(api,'2026-10-07')
assert len(view['expected'])==2
assert all(not row['record'] for row in view['expected'])
assert store['study_state']==before
store[module.INDEX_KEY]=json.dumps({'items':[{'id':'S','course':'Course','date':'2026-10-05','file':'lesson.md','hash':'H'}]})
mutation(op='source-link',sourceId='S',courseId='C',date='2026-10-07')
linked=json.loads(store['study_state'])
assert linked['v60']['sourceLinks']['S']['date']=='2026-10-07'
assert not linked['terms'][0]['sessions']
assert linked['misc']==original['misc']
assert linked['v60']['assignmentStatus']==original['v60']['assignmentStatus']
print('GREEN: expected timetable stays virtual; source linking changes only its mapping and preserves attendance and unrelated fields.')

# Run the real save_work function with only its dependencies mocked.
import ast
import base64
import hashlib
import time
import uuid
runtime = backend.with_name('school_runtime.py')
tree = ast.parse(runtime.read_text(encoding='utf8'))
function = next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='save_work')
work_store={'learning':json.dumps({'revision':0,'events':[],'work':{},'other':{'keep':True}})}
source={'course':'C','steps':[{'id':'Q','kind':'quiz','prompt':'first problem'}]}
scope=dict(json=json,hashlib=hashlib,base64=base64,time=time,uuid=uuid,Path=Path,LOCK=threading.RLock(),KEY='learning',resolve_lesson=lambda *args:source,load=lambda get:json.loads(get('learning')))
exec(compile(ast.Module(body=[function],type_ignores=[]),str(runtime),'exec'),scope)
work_api=SimpleNamespace(STUDY_DIR='unused',schoolTest=True,kv_get=lambda k,d='':work_store.get(k,d),kv_set=lambda k,v:work_store.__setitem__(k,v))
request=dict(lesson='L',step='Q',mode='screen',text='student answer',strokes=[],revision=0)
first=scope['save_work'](work_api,request)
assert first['sourceHash']
before=work_store['learning']
source['steps'][0]['prompt']='changed problem'
try: scope['save_work'](work_api,{**request,'revision':1,'submit':True})
except ValueError: pass
else: raise AssertionError('changed source was accepted without acknowledgment')
assert work_store['learning']==before
second=scope['save_work'](work_api,{**request,'revision':1,'acknowledgeSource':True,'submit':True})
assert second['sourceHash']!=first['sourceHash']
assert json.loads(work_store['learning'])['other']=={'keep':True}
assert json.loads(work_store['learning'])['events'][-1]['assessment']=='unverified'
print('GREEN: changed original rejects submission and preserves prior work; explicit acknowledgment updates source hash; other fields preserved; submission stays unverified.')
