# 강의안 문항(섹션 확인·학습지)을 그 회차 교실 데이터 quiz 에 넣는다(docs/강의안-작성-규격.md 2절 ②). 문항 원본은 여기 하나.
#   python -I docs/tools/lecture_add_quiz.py <lessonId> 문항.json
# 문항.json = [{id, qn, html, choices:[4개], ok:정답번호(0부터), ans, nodes:[]}]. 같은 id 가 있으면 그 자리에서 고친다.
# 교실 파일의 다른 내용은 바꾸지 않고, <script> 안이라 </ 는 원본처럼 <\/ 로 쓴다.
import json, re, sys, os
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
if len(sys.argv) != 3:
    sys.exit('사용: lecture_add_quiz.py <lessonId> 문항.json')
lesson_id, items_path = sys.argv[1], sys.argv[2]
entry = next((e for c in json.load(open('knowledge/lessons.json', encoding='utf-8'))['courses'].values() for e in c.values() if e.get('id') == lesson_id), None)
if not entry:
    sys.exit(f'lessons.json 에 없는 회차: {lesson_id}')
items = json.load(open(items_path, encoding='utf-8'))
for it in items:
    for k in ('id', 'qn', 'html', 'choices', 'ok', 'ans'):
        if k not in it: sys.exit(f'{it.get("id", "?")}: {k} 없음')
    if not re.fullmatch(r'[a-z]\d{1,3}', it['id']): sys.exit(f'{it["id"]}: id 는 c1·w1·q1 꼴')
    if not 0 <= it['ok'] < len(it['choices']): sys.exit(f'{it["id"]}: ok 가 보기 범위 밖')
P = entry['classroom']
t = open(P, encoding='utf-8').read()
m = re.search(r'(?:const|var|let)\s+D\s*=\s*', t)
d, end = json.JSONDecoder().raw_decode(t[m.end():])
d.setdefault('quiz', [])
at = {q['id']: i for i, q in enumerate(d['quiz'])}
added, fixed = [], []
for it in items:
    q = {'id': it['id'], 'qn': it['qn'], 'html': it['html'], 'choices': [{'html': c, 'ok': i == it['ok']} for i, c in enumerate(it['choices'])], 'ans': it['ans']}
    if it['id'] in at: d['quiz'][at[it['id']]] = q; fixed.append(it['id'])
    else: d['quiz'].append(q); added.append(it['id'])
    if it.get('nodes'): d.setdefault('nodes', {}).setdefault('q', {})[it['id']] = it['nodes']
t = t[:m.end()] + json.dumps(d, ensure_ascii=False).replace('</', '<\\/') + t[m.end() + end:]
open(P, 'w', encoding='utf-8', newline='').write(t)
print(f'{P}: 추가 {added} · 고침 {fixed} · 문항 {len(d["quiz"])}개')
