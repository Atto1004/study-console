# 강의안 검사(docs/강의안-작성-규격.md 4절, v1.1 — 오타 검수 10/9 반영). 사용:
#   python -I docs/tools/lecture_check.py <lessonId>          강의안 검사(오류가 있으면 종료 코드 1)
#   python -I docs/tools/lecture_check.py <lessonId> --steps  그 회차 판서 단계 id·내용 보기(대본 쓸 때)
# 규격의 필수 조건은 전부 「오류」. 「주의」는 사람이 보고 판단할 것.
# 이 도구가 확인하는 것은 형식·연결·검산 스크립트 통과까지다. 대본이 근거와 맞는지, 오답이 정말 그 실수에서 나오는지,
# 정답이 유일한지, 확인 문제가 그 예제의 변형인지는 오타 내용 검수가 본다.
import json, re, sys, os, subprocess
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(ROOT)
MOODS = {'neutral', 'smile', 'serious', 'think'}
KINDS = {'개념': 2, '변형': 2, '도전': 1}
EVIDENCE = re.compile(r'녹음|필기|판서|슬라이드|교재|강의자료|LMS|p\.?\s*\d|쪽|\d{1,2}:\d{2}')
REFER = re.compile(r'(?:^|[\s(])위(?:의)?\s*(?:두\s*)?(?:벡터|문제|식|그림|조건|값)|앞(?:의)?\s*문제|앞서\s*구한|이전\s*문제|위에서\s*구한|(?:같은|동일한)\s*조건')
MATHSAY = re.compile(r'\\[a-zA-Z]+|\\\(|\\\[|\$|\^|_\{|[∫∑√θ×⋅]')   # 가운뎃점 · 은 한국어 나열(교환·분배)이라 제외

def classroom(lesson_id):
    for course in json.load(open('knowledge/lessons.json', encoding='utf-8'))['courses'].values():
        for entry in course.values():
            if entry.get('id') == lesson_id:
                t = open(entry['classroom'], encoding='utf-8').read()
                m = re.search(r'(?:const|var|let)\s+D\s*=\s*', t)
                return entry, json.JSONDecoder().raw_decode(t[m.end():])[0]
    sys.exit(f'lessons.json 에 없는 회차: {lesson_id}')

def plain(h):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', h if isinstance(h, str) else '')).strip()

def board_steps(d):
    out = []
    for ch in d.get('chapters', []):
        for st in ch.get('steps', []):
            blocks = st.get('b') or ([{'h': st.get('h') or st.get('html') or st.get('s')}] if (st.get('h') or st.get('html') or st.get('s')) else [])
            for i, b in enumerate(blocks):
                if plain(b.get('h')):
                    out.append((f"{st['id']}:{i}", ch['id'], plain(b.get('h'))))
    return out

if len(sys.argv) < 2:
    sys.exit('사용: lecture_check.py <lessonId> [--steps]')
lesson_id = sys.argv[1]
entry, d = classroom(lesson_id)
steps = board_steps(d)
if '--steps' in sys.argv:
    for sid, ch, body in steps:
        print(f'{sid}\t[{ch}]\t{body[:140]}')
    print(f'\n판서 {len(steps)}단계 · 문항 {[q.get("id") for q in d.get("quiz", [])]}')
    sys.exit(0)

errors, warns = [], []
err = errors.append
path = f'knowledge/lectures/{lesson_id}.json'
if not os.path.exists(path):
    sys.exit(f'강의안 파일 없음: {path}')
try:
    pack = json.load(open(path, encoding='utf-8'))
except json.JSONDecodeError as e:
    sys.exit(f'JSON 형식 오류: {e}')
if not isinstance(pack, dict):
    sys.exit('강의안 최상위는 객체여야 함')

# ── 머리 칸
if pack.get('schemaVersion') != 1: err('schemaVersion 은 1')
if pack.get('lessonId') != lesson_id: err(f'lessonId 가 파일 이름과 다름: {pack.get("lessonId")}')
src = pack.get('sources')
if not isinstance(src, list) or not src or not all(isinstance(x, dict) and isinstance(x.get('label'), str) and x['label'].strip() for x in src):
    err('sources: [{label, href}] 1개 이상 필요(무엇을 근거로 썼는지)')
elif not any(EVIDENCE.search(x['label']) for x in src):
    err('sources label 에 근거 종류(녹음·필기·판서·슬라이드·교재·쪽수 등)가 안 보임')
goals = pack.get('goals')
if not isinstance(goals, list) or not all(isinstance(g, str) and g.strip() for g in goals): err('goals: 문자열 배열이어야 함')
elif len(goals) != 3: err(f'goals {len(goals)}개 — 3개')

lines = []
def check_lines(where, says):
    if not isinstance(says, list) or not says:
        err(f'{where}: 대사 배열이 비었거나 형식이 아님'); return
    for line in says:
        if not isinstance(line, dict) or not isinstance(line.get('say'), str) or not line['say'].strip():
            err(f'{where}: 대사는 {{"say": "…", "mood": "…"}}'); continue
        say = line['say']; lines.append(say)
        if line.get('mood', 'neutral') not in MOODS: err(f'{where}: mood 는 {sorted(MOODS)} 중 하나')
        if len(say) > 80: err(f'{where}: 대사 {len(say)}자(최대 80) 「{say[:30]}…」')
        if MATHSAY.search(say): err(f'{where}: 대사에 수식 기호 — 말로 풀어 쓰기 「{say[:40]}」')

check_lines('recap', pack.get('recap'))
summary = pack.get('summary')
if not isinstance(summary, list) or not summary or not all(isinstance(x, str) and x.strip() for x in summary): err('summary: 한 장 요약 문자열 배열 필요')

# ── 문항(교실 데이터 quiz): 중복·형식
qlist = d.get('quiz') or []
qids = [q.get('id') for q in qlist]
for dup in sorted({x for x in qids if qids.count(x) > 1}): err(f'교실 quiz 에 문항 id 중복: {dup}')
quiz = {q.get('id'): q for q in qlist}

def check_item(qid, role):
    q = quiz.get(qid)
    if not q: err(f'{role} {qid}: 교실 quiz 에 없음(lecture_add_quiz.py 로 넣기)'); return
    ch = q.get('choices')
    if not isinstance(ch, list) or not all(isinstance(c, dict) and isinstance(c.get('html'), str) for c in ch):
        err(f'{qid}: 저장 형식은 choices: [{{"html": "…", "ok": true|false}}] — lecture_add_quiz.py 로 넣으면 이렇게 바뀜'); return
    if len(ch) != 4: err(f'{qid}: 보기 {len(ch)}개 — 4개')
    if any(not isinstance(c.get('ok'), bool) for c in ch): err(f'{qid}: ok 는 true/false 불리언')
    elif sum(c['ok'] for c in ch) != 1: err(f'{qid}: 정답 보기가 정확히 1개가 아님')
    bodies = [plain(c['html']) for c in ch]
    if len(set(bodies)) != len(bodies): err(f'{qid}: 같은 내용의 보기 중복')
    if not isinstance(q.get('ans'), str) or len(plain(q.get('ans'))) < 20: err(f'{qid}: ans 에 풀이와 오답별 이유 필요')
    if not isinstance(q.get('html'), str) or not plain(q['html']): err(f'{qid}: 문제 본문(html) 없음')
    elif REFER.search(plain(q['html'])): err(f'{qid}: 다른 문제·조건 참조 의심 — 자기완결로 「{plain(q["html"])[:40]}」')

# ── 섹션
secs = pack.get('sections')
if not isinstance(secs, list): err('sections 는 배열'); secs = []
if not 4 <= len(secs) <= 6: err(f'섹션 {len(secs)}개 — 4~6개')
ids = [s for s, _, _ in steps]
pos = {s: i for i, s in enumerate(ids)}
sec_ids, checks, seen, order = [], [], set(), []
for k, sec in enumerate(secs):
    if not isinstance(sec, dict): err(f'섹션 {k+1}: 객체가 아님'); continue
    name = sec.get('id') if isinstance(sec.get('id'), str) else f'섹션{k+1}'
    sec_ids.append(name)
    for f in ('title', 'goal'):
        if not isinstance(sec.get(f), str) or not sec[f].strip(): err(f'{name}: {f} 없음')
    if 'exam' in sec and (not isinstance(sec['exam'], str) or not EVIDENCE.search(sec['exam'])):
        err(f'{name}: exam(교수님 강조)에는 근거(녹음 시각·필기·판서·교재 쪽) 표기 필요, 근거 없으면 빼기')
    script = sec.get('script')
    if not isinstance(script, dict) or not script: err(f'{name}: script 비어 있음'); script = {}
    mine = []
    for sid, says in script.items():
        if sid not in pos: err(f'{name}: 없는 판서 단계 {sid}'); continue
        if sid in seen: err(f'{name}: 판서 단계 {sid} 가 두 섹션에 들어감')
        seen.add(sid); order.append(sid); mine.append(pos[sid])
        check_lines(f'{name}/{sid}', says)
    if mine and mine != list(range(mine[0], mine[0] + len(mine))):
        err(f'{name}: 판서 단계가 판서 순서대로 이어진 구간이 아님(빠지거나 순서가 바뀜)')
    c = sec.get('check')
    if not isinstance(c, str) or not c: err(f'{name}: check(섹션 확인 문제 id) 없음')
    else: checks.append(c); check_item(c, f'{name} 확인')
for dup in sorted({x for x in sec_ids if sec_ids.count(x) > 1}): err(f'섹션 id 중복: {dup}')
for dup in sorted({x for x in checks if checks.count(x) > 1}): err(f'같은 확인 문제를 여러 섹션이 씀: {dup}')
missing = [s for s in ids if s not in seen]
if missing: err(f'대사 없는 판서 단계 {len(missing)}개: {missing[:8]}{" …" if len(missing) > 8 else ""}')
if order != sorted(order, key=lambda s: pos.get(s, 0)): err('섹션 순서가 판서 순서와 다름')

# ── 학습지: 5문항 · 개념 2 · 변형 2 · 도전 1 · 중복 없음 · 확인 문제와 겹치지 않음
ws = pack.get('worksheet')
if not isinstance(ws, list): err('worksheet 는 배열'); ws = []
if len(ws) != 5: err(f'학습지 {len(ws)}문항 — 5문항')
wids, kinds = [], {}
for w in ws:
    if not isinstance(w, dict) or not isinstance(w.get('id'), str): err('학습지 칸은 {"id", "kind": 개념|변형|도전, "section"}'); continue
    wids.append(w['id']); kinds[w.get('kind')] = kinds.get(w.get('kind'), 0) + 1
    if w.get('kind') not in KINDS: err(f'{w["id"]}: kind 는 개념·변형·도전 중 하나')
    if w.get('section') not in sec_ids: err(f'{w["id"]}: section 은 이 강의안의 섹션 id')
    check_item(w['id'], '학습지')
if ws and kinds != KINDS: err(f'학습지 구성 {kinds} — 개념 2 · 변형 2 · 도전 1')
for dup in sorted({x for x in wids if wids.count(x) > 1}): err(f'학습지 문항 중복: {dup}')
for x in sorted(set(wids) & set(checks)): err(f'{x}: 확인 문제와 학습지에 같은 문항')

# ── 검산 스크립트
vpath = f'knowledge/lectures/{lesson_id}.verify.py'
if not os.path.exists(vpath):
    err(f'검산 스크립트 없음: {vpath} (예제·확인·학습지 정답과 오답 해설 숫자를 assert 로)')
else:
    r = subprocess.run([sys.executable, '-I', vpath], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=60)
    if r.returncode != 0: err(f'검산 실패: {(r.stderr or r.stdout).strip().splitlines()[-1] if (r.stderr or r.stdout).strip() else r.returncode}')
    elif 'assert' not in open(vpath, encoding='utf-8').read(): err('검산 스크립트에 assert 가 없음')

chars = sum(len(x) for x in lines)
print(f'{lesson_id}: 섹션 {len(secs)} · 판서 {len(seen)}/{len(ids)} · 대사 {len(lines)}줄 · 약 {round(chars * 0.095 / 60, 1)}분 · 학습지 {len(ws)}')
for w in warns: print('  주의', w)
for e in errors: print('  오류', e)
print('오류 0 — 다음: 오타 내용 검수' if not errors else f'오류 {len(errors)}개 — 고친 뒤 다시')
sys.exit(1 if errors else 0)
