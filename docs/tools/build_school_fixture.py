"""실제 DB를 건드리지 않는 학교 UI 검사 입력. .test-tools는 git 제외."""
import json
import sys
from pathlib import Path
root=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(Path.home()/'본사/atom'))
import school_runtime as school
catalog=school.catalog(root)
ids=[l['id'] for c in catalog['courses'] for l in c['lessons']]
ids += ['node:'+n['id'] for c in catalog['courses'] for n in c['nodes']]
ids += ['node:'+n['id'] for n in catalog['basics']]
data={'catalog':catalog,'lessons':{i:school.lesson(root,i) for i in ids}}
(root/'.test-tools').mkdir(exist_ok=True)
(root/'.test-tools/school-fixture.json').write_text(json.dumps(data,ensure_ascii=False),encoding='utf-8')
print(f'비공개 검사 입력: {len(ids)}개 수업/개념')
