"""검토한 5회차만 실제 자료 폴더에 적용한다. 다른 날짜·원자료는 수정하지 않는다."""
import argparse
import datetime
import json
import os
import shutil
from pathlib import Path
from build_recent_exam_lessons import LESSONS


def apply(source, target):
    source, target = source.resolve(), target.resolve()
    index_path=target/'knowledge/lessons.json'
    before_bytes=index_path.read_bytes()
    before=json.loads(before_bytes.decode('utf-8'))
    prepared=json.loads((source/'knowledge/lessons.json').read_text(encoding='utf-8'))
    entries=[]; files=[]
    for spec in LESSONS:
        course,date=spec['course'],spec['date']
        entry=prepared['courses'][course][date]
        existing=before.get('courses',{}).get(course,{}).get(date)
        if existing is not None and existing != entry:
            raise ValueError(f'{course}/{date}: 다른 등록이 있으므로 중단합니다.')
        entries.append((course,date,entry))
        for relative in [entry['classroom'],f"knowledge/lectures/{entry['id']}.json"]:
            src,dest=source/relative,target/relative
            if not src.resolve().is_relative_to(source) or not dest.resolve().is_relative_to(target):
                raise ValueError('자료 경로가 저장소 밖입니다.')
            body=src.read_bytes()
            if dest.exists() and dest.read_bytes()!=body:
                raise ValueError(f'{relative}: 다른 파일이 있으므로 중단합니다.')
            files.append((dest,body))
    stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    backup=target/'_private/backups'/('recent-lessons-'+stamp)
    backup.mkdir(parents=True,exist_ok=False)
    (backup/'lessons-before.json').write_bytes(before_bytes)
    for dest,body in files:
        if not dest.exists():
            dest.parent.mkdir(parents=True,exist_ok=True)
            dest.write_bytes(body)
    # 처음 읽은 색인이 다른 작업에서 변경됐으면 등록을 중단한다. 생성한 새 파일은 보존한다.
    if index_path.read_bytes()!=before_bytes:
        raise ValueError('적용 중 색인이 변경되어 등록을 중단합니다.')
    for course,date,entry in entries:
        before['courses'].setdefault(course,{})[date]=entry
    tmp=index_path.with_name('lessons-recent-'+stamp+'.json')
    tmp.write_text(json.dumps(before,ensure_ascii=False,indent=1)+'\n',encoding='utf-8')
    os.replace(tmp,index_path)
    print(json.dumps({'registered':[entry['id'] for _,_,entry in entries],
                      'backup':str(backup),'preservedOtherDates':True},ensure_ascii=False,indent=2))


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('source',type=Path)
    parser.add_argument('target',type=Path)
    args=parser.parse_args()
    apply(args.source,args.target)
