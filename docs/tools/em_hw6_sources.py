"""10/7 판서 과제 접수와 교재 원문 확인. 공개 저장소에는 사진·문제 원문을 넣지 않는다."""
import hashlib
import json
import re
import shutil
from pathlib import Path
import fitz

root=Path(__file__).resolve().parents[2]
materials=root.parent/'study-materials'/'공업수학1'
source=Path.home()/'Downloads'/'공수과제 10_07.jpg'
day=materials/'2026-10-07'
target=day/'과제_6주차_대표님확인.jpg'
assert source.is_file()
day.mkdir(parents=True,exist_ok=True)
if target.exists():
    assert hashlib.sha256(target.read_bytes()).digest()==hashlib.sha256(source.read_bytes()).digest()
else: shutil.copy2(source,target)
scope=[{'section':'3.1','numbers':[2,5]},{'section':'3.2','numbers':[2,4,8,12]}]
path=root/'knowledge'/'materials.json'
data=json.loads(path.read_text(encoding='utf-8'))
assignments=data['courses']['공업수학1'].setdefault('assignments',[])
title='6주차 과제 3.1 #2·5 · 3.2 #2·4·8·12'
if not any(a.get('title')==title for a in assignments):
    assignments.append({'title':title,'given':'2026-10-07','due':'','dueNote':'사진에 마감 표기 없음 — 확인 필요','src':'10/7 과제 판서 사진 · 대표님 제공','problems':scope})
    path.write_text(json.dumps(data,ensure_ascii=False,indent=1)+'\n',encoding='utf-8')
summary=day/'정리.md'
if summary.exists():
    old=summary.read_text(encoding='utf-8')
    backup=day/'정리_과제교정전.md'
    if not backup.exists(): backup.write_text(old,encoding='utf-8')
    corrected=re.sub(r'## ⑤ 필기[\s\S]*?(?=## ⑦)', '## ⑤ 필기\n### 6주차 과제 판서 확인\n- 3.1절: 2·5번\n- 3.2절: 2·4·8·12번\n- 근거: 대표님 제공 과제 사진. 기존 자동 판독의 절·문제 번호를 교정했다.\n\n## ⑥ 과제\n- 6주차 과제 총 6문제.\n- 마감: 사진에 표기 없음, 확인 필요.\n\n',old)
    summary.write_text(corrected.replace('(5주차)','(6주차)',1),encoding='utf-8')
out=materials/'_과제'; out.mkdir(exist_ok=True)
(out/'6주차_과제접수.json').write_text(json.dumps({'title':title,'given':'2026-10-07','due':None,'source':str(target),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'problems':scope,'status':'교재 원문 확인 중'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('과제 접수·원본 보관·잘못된 과제 판독 교정 완료. 마감 미확인.')
book=materials/'_교재'/'교재_Kreyszig_AEM_10e_영문_1283p.pdf'
doc=fitz.open(book)
for i in range(100,190):
    text=doc[i].get_text()
    if re.search(r'PROBLEMSET3\.[12]',re.sub(r'\s','',text),re.I):
        print('PDF page',i+1,'\n',text)
        doc[i].get_pixmap(matrix=fitz.Matrix(1.4,1.4)).save(out/f'hw6_source_p{i+1}.png')
