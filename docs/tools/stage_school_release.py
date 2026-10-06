"""학교 변경만 색인에 준비합니다. 다른 작업의 작업 트리 파일은 바꾸지 않습니다."""
from pathlib import Path
import subprocess

study=Path(__file__).resolve().parents[2]
atom=Path.home()/'본사'/'atom'

def head(root,name):
    return subprocess.check_output(['git','show','HEAD:'+name],cwd=root).decode('utf-8')

def stage(root,name,text):
    blob=subprocess.check_output(['git','hash-object','-w','--stdin'],input=text.encode('utf-8'),cwd=root).decode().strip()
    subprocess.run(['git','update-index','--add','--cacheinfo','100644,'+blob+','+name],cwd=root,check=True)

backend=head(atom,'server.py')
backend=backend.replace('import sys\n','import sys\nimport school_runtime\n',1)
anchor='        if work_dashboard.get_route(self, sys.modules[__name__], p):\n            return\n'
assert anchor in backend
backend=backend.replace(anchor,anchor+'        if school_runtime.get_route(self, sys.modules[__name__], p, urllib.parse.parse_qs(urlparse(self.path).query)):\n            return\n',1)
anchor='        if work_dashboard.post_route(self, sys.modules[__name__], p):\n'
assert anchor in backend
backend=backend.replace(anchor,'        if school_runtime.post_route(self, sys.modules[__name__], p):\n            return\n'+anchor,1)
stage(atom,'server.py',backend)

current=(study/'index.html').read_text(encoding='utf-8')
page=head(study,'index.html')
assert 'var BUILD="2026-10-04.173";' in page
page=page.replace('var BUILD="2026-10-04.173";','var BUILD="2026-10-06.179";',1)
entry='<script src="school/entry.js"></script>'
assert entry in current
anchor='<title>aTTo 학습앱</title>'
assert anchor in page
page=page.replace(anchor,anchor+'\n'+entry,1)
notes=current.split('var PATCHNOTES=[',1)[1].split('  {v:"2026-10-05.174"',1)[0]
page=page.replace('var PATCHNOTES=[','var PATCHNOTES=['+notes,1)
stage(study,'index.html',page)
log=(study/'CHANGELOG.md').read_text(encoding='utf-8').split('## 2026-10-06',1)[1].split('## 2026-10-05',1)[0]
old=head(study,'CHANGELOG.md')
title,body=old.split('\n\n',1)
stage(study,'CHANGELOG.md',title+'\n\n## 2026-10-06'+log+body)
print('서버 연결·학교 진입·학교 패치 기록만 선택해 준비했습니다.')
