"""Execute real status setter against an in-memory API; no real files or DB writes."""
import ast,json,threading
from datetime import datetime
from pathlib import Path
backend=next(Path('C:/Users/user').glob('*/atom/school_assignments.py'))
tree=ast.parse(backend.read_text(encoding='utf8'))
setter=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='set_status')
store={'study_state':json.dumps({'terms':[{'id':'keep'}],'misc':{'keep':True},'v60':{'assignmentStatus':{}}})}
class API:
    def kv_get(self,k,d=''): return store.get(k,d)
    def kv_set(self,k,v): store[k]=v
api=API()
def collect(api):
    manual=json.loads(api.kv_get('study_state'))['v60']['assignmentStatus'].get('A',{})
    return {'rows':[{'id':'A','workDone':False,'submitted':False,'hiddenFromMain':False,**manual}]}
scope=dict(json=json,datetime=datetime,STATUS_LOCK=threading.Lock(),collect=collect)
exec(compile(ast.Module(body=[setter],type_ignores=[]),str(backend),'exec'),scope)
def update(field,value): return scope['set_status'](api,dict(id='A',field=field,value=value))
before=store['study_state']
try: update('hiddenFromMain',True)
except ValueError: pass
else: raise AssertionError('unsolved task allowed hiding')
assert store['study_state']==before
update('workDone',True)
assert update('hiddenFromMain',True)['hiddenFromMain'] is True
assert collect(api)['rows'][0]['submitted'] is False
update('hiddenFromMain',False)
assert collect(api)['rows'][0]['hiddenFromMain'] is False
assert collect(api)['rows'][0]['workDone'] is True
assert json.loads(store['study_state'])['terms']==[{'id':'keep'}]
assert json.loads(store['study_state'])['misc']=={'keep':True}
print('GREEN: unsolved hide rejected without writes; hide and restore persist independently of submitted/workDone; unrelated state preserved.')
