# 강의안 검사(docs/강의안-작성-규격.md 4절). 사용:
#   python -I docs/tools/lecture_check.py <lessonId>          강의안 검사(오류가 있으면 종료 코드 1)
#   python -I docs/tools/lecture_check.py <lessonId> --steps  그 회차 판서 단계 id·내용 보기(대본 쓸 때)
import json, re, sys, os
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
MOODS = {'neutral', 'smile', 'serious', 'think'}

def classroom(lesson_id):
    for course in json.load(open('knowledge/lessons.json', encoding='utf-8'))['courses'].values():
        for entry in course.values():
            if entry.get('id') == lesson_id:
                t = open(entry['classroom'], encoding='utf-8').read()
                m = re.search(r'(?:const|var|let)\s+D\s*=\s*', t)
                return entry, json.JSONDecoder().raw_decode(t[m.end():])[0]
    sys.exit(f'lessons.json 에 없는 회차: {lesson_id}')

def plain(h):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', h or '')).strip()

def board_steps(d):
    out = []
    for ch in d.get('chapters', []):
        for st in ch.get('steps', []):
            blocks = st.get('b') or ([{'h': st.get('h') or st.get('html') or st.get('s')}] if (st.get('h') or st.get('html') or st.get('s')) else [])
            for i, b in enumerate(blocks):
                if plain(b.get('h')):
                    out.append((f"{st['id']}:{i}", ch['id'], plain(b.get('h'))))
    return out

lesson_id = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__ or '사용: lecture_check.py <lessonId> [--steps]')
entry, d = classroom(lesson_id)
steps = board_steps(d)
if '--steps' in sys.argv:
    for sid, ch, body in steps:
        print(f'{sid}\t[{ch}]\t{body[:140]}')
    print(f'\n판서 {len(steps)}단계 · 문항 {[q["id"] for q in d.get("quiz", [])]}')
    sys.exit(0)

errors, warns = [], []
path = f'knowledge/lectures/{lesson_id}.json'
if not os.path.exists(path):
    sys.exit(f'강의안 파일 없음: {path}')
try:
    pack = json.load(open(path, encoding='utf-8'))
except json.JSONDecodeError as e:
    sys.exit(f'JSON 형식 오류: {e}')

if pack.get('schemaVersion') != 1: errors.append('schemaVersion 은 1')
if pack.get('lessonId') != lesson_id: errors.append(f'lessonId 가 파일 이름과 다름: {pack.get("lessonId")}')
if not pack.get('goals'): errors.append('goals(오늘 목표) 없음')
elif len(pack['goals']) > 4: warns.append(f'goals {len(pack["goals"])}개 — 3개 안팎 권장')
if not pack.get('recap'): warns.append('recap(지난 시간 회상) 없음')
secs = pack.get('sections') or []
if not 3 <= len(secs) <= 7: warns.append(f'섹션 {len(secs)}개 — 4~6개 권장')

ids = [s for s, _, _ in steps]
quiz = {q['id']: q for q in d.get('quiz', [])}
seen, order = set(), []
lines = []
for k, sec in enumerate(secs):
    name = sec.get('id') or f'섹션{k+1}'
    script = sec.get('script') or {}
    if not script: errors.append(f'{name}: script 비어 있음')
    for sid, says in script.items():
        if sid not in ids: errors.append(f'{name}: 없는 판서 단계 {sid}')
        if sid in seen: errors.append(f'{name}: 판서 단계 {sid} 가 두 섹션에 들어감')
        seen.add(sid); order.append(sid)
        if not says: errors.append(f'{name}/{sid}: 대사 없음')
        for line in says or []:
            say = (line or {}).get('say', '')
            lines.append(say)
            if not say.strip(): errors.append(f'{name}/{sid}: 빈 대사')
            if (line or {}).get('mood', 'neutral') not in MOODS: errors.append(f'{name}/{sid}: mood 는 {sorted(MOODS)} 중 하나')
            if len(say) > 80: warns.append(f'{name}/{sid}: 대사 {len(say)}자(80자 넘음) — 「{say[:30]}…」')
            if re.search(r'\\[a-zA-Z]+|\\\(|\$|\^|_\{', say): errors.append(f'{name}/{sid}: 대사에 수식 기호 — 말로 풀어 쓰기 「{say[:40]}」')
    c = sec.get('check')
    if not c: errors.append(f'{name}: check(섹션 확인 문제) 없음')
    elif c not in quiz: errors.append(f'{name}: 확인 문제 {c} 가 교실 quiz 에 없음(lecture_add_quiz.py 로 넣기)')
missing = [s for s in ids if s not in seen]
if missing: errors.append(f'대사 없는 판서 단계 {len(missing)}개: {missing[:8]}{" …" if len(missing) > 8 else ""}')
if order != [s for s in ids if s in seen]: warns.append('script 순서가 판서 순서와 다름 — 강의는 script 순서대로 진행됨')

ws = pack.get('worksheet') or []
if len(ws) != 5: warns.append(f'학습지 {len(ws)}문항 — 5문항 권장')
for qid in ws + [s.get('check') for s in secs if s.get('check')]:
    q = quiz.get(qid)
    if not q: continue
    ch = q.get('choices') or []
    if len(ch) != 4: warns.append(f'{qid}: 보기 {len(ch)}개 — 4개 권장')
    if sum(bool(x.get('ok')) for x in ch) != 1: errors.append(f'{qid}: 정답 보기가 정확히 1개가 아님')
    if not q.get('ans'): errors.append(f'{qid}: 풀이·오답 해설(ans) 없음')
    if re.search(r'(?:^|[\s(])위(?:의)?\s*(?:두\s*)?(벡터|문제|식|그림)', plain(q.get('html'))): errors.append(f'{qid}: 다른 문제 참조 — 자기완결로')
for qid in ws:
    if qid not in quiz: errors.append(f'학습지 문항 {qid} 가 교실 quiz 에 없음')
if not pack.get('summary'): warns.append('summary(한 장 요약) 없음')

chars = sum(len(x) for x in lines)
print(f'{lesson_id}: 섹션 {len(secs)} · 판서 {len(seen)}/{len(ids)} · 대사 {len(lines)}줄 · 약 {round(chars * 0.095 / 60, 1)}분 · 학습지 {len(ws)}')
for w in warns: print('  주의', w)
for e in errors: print('  오류', e)
print('오류 0 — 다음: 오타 내용 검수' if not errors else f'오류 {len(errors)}개 — 고친 뒤 다시')
sys.exit(1 if errors else 0)
