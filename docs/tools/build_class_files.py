"""기존 자료 색인과 실제 서빙 사본에서 수업 파일 조회용 목록을 만든다."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[2]
library = json.loads((root/'knowledge/library.json').read_text(encoding='utf-8'))
items = []
seen = set()
for item in library['items']:
    if '/_과제/' in item['id'] or '/_교수분석/' in item['id']:
        continue
    rel = '_private/media/' + item['id']
    seen.add(rel)
    items.append({**item, 'href': rel if (root/rel).is_file() else None})
for folder in (root/'_private/media').iterdir():
    if not folder.is_dir():
        continue
    for kind, label in [('_교재', 'textbook'), ('_강의자료', 'pre')]:
        for file in (folder/kind).glob('*'):
            rel = file.relative_to(root).as_posix()
            if file.is_file() and rel not in seen and file.suffix.lower() in ['.pdf', '.html', '.pptx', '.docx']:
                items.append({'course': folder.name, 'type': label, 'file': file.name, 'date': None, 'href': rel})
                seen.add(rel)
out = root/'_private/class-files.json'
out.write_text(json.dumps({'generatedAt': library['generatedAt'], 'items': items}, ensure_ascii=False, indent=2), encoding='utf-8')
print('class file index:', len(items), 'openable:', sum(bool(i['href']) for i in items))
