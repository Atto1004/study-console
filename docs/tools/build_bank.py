# -*- coding: utf-8 -*-
"""문제 은행 통합 색인(bank.json) 빌더 — UI 개편 1단계 (오타 설계 ui-restructure-1004b ⑤-1).

입력(읽기만):
  notes/lessons/_private/{statics,calc2,em1}/hw/meta.json · ch*.json   단계형 과제 문제
  knowledge/decks.json + notes/<deck>-slides.html (SLIDES 의 type=q · NDS)  덱 문제
  knowledge/lessons.json · lesson_nodes.json + notes/classroom/<slug>/<date>.html 의 quiz  교실 확인 문제(본문 복사 안 함)
  knowledge/units.json (장) · sections.json (공수1·정역학 절)
출력: notes/lessons/_private/bank.json (교재 내용 → _private)

배정 규칙
  과제: 문제 번호로 장·절 (정역학은 sections.json 의 hw 매핑).
  덱  : 장 = sections.json 의 덱 파트→절 매핑이 장 하나로 모이면 그 장, 아니면 파트 제목의 units.num(장 번호) 하나,
        아니면 파트 제목의 units.kw 하나, 아니면 덱 제목의 num 하나. 그래도 없으면 「장 미분류」.
        절 = sections.json 매핑이 그 장 안에서 절 하나일 때, 아니면 파트 제목에 적힌 절 번호가 하나일 때. 아니면 그 장 unsorted.
  교실: 장 = units.dates(회차 날짜가 그 단원에 명시) → 회차 제목 num → kw. 절은 정하지 않는다(날짜만으로 절 단정 금지) → unsorted.
  중복(같은 문제가 과제·덱에 둘 다) 판단은 하지 않는다.
멱등: 내용이 같으면 파일을 다시 쓰지 않는다(generated 유지).
실행: PYTHONIOENCODING=utf-8 python docs/tools/build_bank.py
"""
import json, os, re, glob, sys
from datetime import datetime

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "notes", "lessons", "_private", "bank.json")

def P(*a): return os.path.join(ROOT, *a)
def load(path):
    with open(path, encoding="utf-8") as f: return json.load(f)

COURSES = [  # (과목명, slug, 시험일 기본값 — 앱 기본값, 공수1은 가정)
    ("정역학", "statics", "2026-10-19"),
    ("미분적분학2", "calc2", "2026-10-20"),
    ("공업수학1", "em1", "2026-10-21"),
    ("일반물리학2", "phys2", "2026-10-23"),
]
# 미적2 는 sections.json 에 절 목록이 없다 → 교재(Stewart 9E) 목차의 절 제목. 덱 제목의 짧은 이름을 따름.
CALC2_SECTIONS = {
    "12.1": "3차원 좌표계", "12.2": "벡터", "12.3": "내적", "12.4": "외적",
    "12.5": "직선과 평면의 방정식", "12.6": "기둥면과 이차곡면",
    "13.1": "벡터함수와 공간곡선", "13.2": "벡터함수의 도함수와 적분",
    "13.3": "호의 길이와 곡률", "13.4": "공간에서의 운동: 속도와 가속도",
}

def jsdecode(text, marker):
    """text 안 marker 뒤에 오는 JSON 값 하나를 읽는다. 없으면 None."""
    i = text.find(marker)
    if i < 0: return None
    j = i + len(marker)
    while text[j] in " \t": j += 1
    return json.JSONDecoder().raw_decode(text, j)[0]

def sec_key(no):
    try: return tuple(int(x) for x in no.split("."))
    except Exception: return (999,)

def ch_key(ch):
    return (0, int(ch)) if str(ch).isdigit() else ((-1, 0) if ch != "?" else (9, 0))

# ---------- 장(단원) 표 ----------
def unit_ch(course, u, sec_chapters):
    t = u["title"]
    m = re.match(r"^(\d+)장", t) or re.match(r"^Ch\.(\d+)", t) or re.search(r"\((\d+)\.\d", t) or re.search(r"\\b(\d+)\\\.", u.get("num", ""))
    ch = m.group(1) if m else re.split(r"과 |와 |[ —(]", t)[0]   # 번호 없는 단원(미적2 행렬) → 「행렬」
    if ch in sec_chapters: title = sec_chapters[ch]
    else:
        title = re.sub(r"\s*\([^)]*\)", "", t.split(" — ")[0]).strip()
        if ch.isdigit() and not re.match(r"^(\d+장|Ch\.)", title): title = f"{ch}장 {title}"
    return ch, title

def main():
    units = load(P("knowledge", "units.json"))
    sections = load(P("knowledge", "sections.json"))["courses"]
    decks = load(P("knowledge", "decks.json"))["decks"]
    lessons = load(P("knowledge", "lessons.json"))["courses"]
    lnodes = load(P("knowledge", "lesson_nodes.json"))
    problems_issue = []

    bank = {}
    stats = {}
    for cname, slug, exam_default in COURSES:
        secs = sections.get(cname, {})
        sec_chapters = secs.get("chapters", {})
        ulist = []
        for u in units.get(cname, {}).get("units", []):
            ch, title = unit_ch(cname, u, sec_chapters)
            ulist.append(dict(ch=ch, title=title, num=u.get("num") or "", kw=u.get("kw") or "", dates=u.get("dates") or []))
        # 절 표: no → (ch, title)
        sec_table = {}
        for s in secs.get("sections", []):
            sec_table[s["no"]] = (s["ch"], s["title"])
        if cname == "미분적분학2":
            for no, t in CALC2_SECTIONS.items(): sec_table[no] = (no.split(".")[0], t)
        # 덱 파트 → 절 (sections.json)
        part2secs = {}
        for s in secs.get("sections", []):
            for d in s.get("decks", []):
                m = re.match(r"notes/([\w-]+)-slides\.html#at=p(\d+)-", d.get("href", ""))
                if m: part2secs.setdefault((m.group(1), int(m.group(2))), set()).add(s["no"])
        # 정역학 과제 → 절
        hw2sec = {}
        for s in secs.get("sections", []):
            for h in s.get("hw", []): hw2sec[h["id"]] = s["no"]

        exam = exam_default
        chapters = {}   # ch -> {title, sections{no:[...]}, unsorted[]}
        def chap(ch, title=None):
            if ch not in chapters:
                if title is None:
                    title = next((u["title"] for u in ulist if u["ch"] == ch), "장 미분류" if ch == "?" else f"{ch}장")
                chapters[ch] = {"ch": ch, "title": title, "sections": {}, "unsorted": []}
            return chapters[ch]
        def put(ch, no, prob):
            c = chap(ch)
            if no: c["sections"].setdefault(no, []).append(prob)
            else: c["unsorted"].append(prob)

        def match_units(text, field):
            out = []
            for u in ulist:
                pat = u[field]
                if pat and re.search(pat, text or ""): out.append(u["ch"])
            return list(dict.fromkeys(out))

        # ---------- 1. 과제 ----------
        hwdir = P("notes", "lessons", "_private", slug, "hw")
        if os.path.isdir(hwdir):
            meta = load(os.path.join(hwdir, "meta.json"))
            exam = meta.get("exam") or exam
            for f in sorted(glob.glob(os.path.join(hwdir, "ch*.json")), key=lambda x: int(re.search(r"ch(\d+)", x).group(1))):
                d = load(f)
                ch = str(d["ch"])
                ctitle = d.get("title", "")
                for q in d["problems"]:
                    pid = q["id"]
                    if slug == "statics":
                        no = hw2sec.get(pid)
                        label = pid
                        title = q.get("title") or q.get("ask", "")
                        hwname = re.sub(r"\s*—.*$", "", ctitle).strip() or None
                    else:
                        no = re.match(r"^(\d+\.\d+)-", pid).group(1)
                        label = re.sub(r"\s*\(.*\)$", "", q.get("title", pid))
                        title = q.get("ask") or label
                        g0 = (q.get("given") or [""])[0]
                        if len(title) <= 12 and g0 and not g0.startswith("「"):   # 공수1 ask 가 「일반해」처럼 짧으면 식을 앞에
                            title = f"{g0} — {title}"
                        wk = re.search(r"\((\d+주차 과제)\)", q.get("title", ""))
                        if wk: hwname = wk.group(1)
                        else:
                            m = re.search(r"(중간과제물\(\d+\)|과제)", ctitle)
                            hwname = m.group(1) if m else None
                    if no and no.split(".")[0] != ch: no = None
                    nodes = []
                    for s in q.get("steps", []):
                        for n in (s.get("nodes") or []):
                            if n not in nodes: nodes.append(n)
                    for n in (q.get("nodes") or []):
                        if n not in nodes: nodes.append(n)
                    kinds = {s.get("kind") for s in q.get("steps", [])}
                    prob = {
                        "pid": f"{slug}:hw:{pid}", "src": "hw", "label": label, "title": title,
                        "kind": "step" if q.get("steps") else "open", "steps": len(q.get("steps", [])),
                        "nodes": nodes,
                        "open": f"notes/lessons/_private/{slug}/hw/index.html#p={pid}",
                        "exam": bool(q.get("exam")), "hw": hwname,
                    }
                    if ch not in chapters:
                        # 과제 파일 장 제목이 있으면 units 제목보다 우선(예: 「12장 벡터와 공간기하」)
                        m = re.search(r"—\s*(.+?)(\s*\(.*\))?$", ctitle)
                        t = m.group(1).strip() if m else None
                        if t and slug == "statics": t = f"Ch.{ch} {t}"
                        chap(ch, sec_chapters.get(ch) or t)
                    put(ch, no, prob)

        # ---------- 2. 덱 ----------
        nd_decks = lnodes.get("decks", {})
        for dk in decks:
            if dk.get("course") != cname: continue
            path = P(*dk["file"].split("/"))
            if not os.path.exists(path):
                problems_issue.append(f"덱 파일 없음: {dk['file']}"); continue
            html = open(path, encoding="utf-8").read()
            slides = jsdecode(html, "const SLIDES=") or []
            parts = {p["n"]: p for p in (jsdecode(html, "const PARTS=") or [])}
            nds = jsdecode(html, "NDS=") or nd_decks.get(dk["id"], {})
            qs = [s for s in slides if s.get("type") == "q"]
            for q in qs:
                pn = q.get("part")
                ptitle = (parts.get(pn) or {}).get("title", "")
                mapped = part2secs.get((dk["id"], pn), set())
                mch = {sec_table[n][0] for n in mapped if n in sec_table}
                ch = None
                if len(mch) == 1: ch = mch.pop()
                if ch is None:
                    c = match_units(ptitle, "num")
                    if len(c) == 1: ch = c[0]
                if ch is None:
                    c = match_units(ptitle, "kw")
                    if len(c) == 1: ch = c[0]
                if ch is None:
                    c = match_units(dk.get("title", ""), "num")
                    if len(c) == 1: ch = c[0]
                if ch is None: ch = "?"
                no = None
                if ch != "?":
                    cand = [n for n in mapped if n in sec_table and sec_table[n][0] == ch]
                    if len(cand) == 1: no = cand[0]
                    elif not mapped:
                        nums = [n for n in dict.fromkeys(re.findall(r"(?<![\d.])(\d+\.\d+)(?![\d.])", ptitle))
                                if n in sec_table and sec_table[n][0] == ch]
                        if "~" not in ptitle and len(nums) == 1: no = nums[0]
                ns = (nds.get("q") or {}).get(q["id"])
                nsrc = "q"
                if not ns:
                    ns = (nds.get("parts") or {}).get(str(pn)) or []
                    nsrc = "part" if ns else None
                qn = q.get("qn") or q["id"]
                lab, _, tit = qn.partition(" · ")
                prob = {
                    "pid": f"{slug}:deck:{dk['id']}/{q['id']}", "src": "deck", "label": lab.strip(),
                    "title": (tit or qn).strip(), "kind": "choice" if q.get("choices") else "open", "steps": 0,
                    "nodes": list(ns),
                    "open": f"{dk['file']}#at={q['id']}",
                    "exam": bool(q.get("exam")), "hw": None,
                    "deck": dk["id"], "part": pn, "partTitle": ptitle, "qkind": q.get("kind"),
                }
                if nsrc == "part": prob["nodesFrom"] = "part"
                put(ch, no, prob)

        # ---------- 3. 교실 확인 문제 (색인만) ----------
        for date, L in sorted(lessons.get(cname, {}).items()):
            cls = L.get("classroom")
            if not cls: continue
            cpath = P(*cls.split("/"))
            quiz = {}
            if os.path.exists(cpath):
                ht = open(cpath, encoding="utf-8").read()
                k = 0
                while True:
                    i = ht.find('"quiz": [', k)
                    if i < 0: break
                    arr = json.JSONDecoder().raw_decode(ht, i + len('"quiz": '))[0]
                    for x in arr:
                        if isinstance(x, dict) and x.get("id"): quiz[x["id"]] = x
                    k = i + 1
            ch = None
            for u in ulist:
                if date in u["dates"]: ch = u["ch"]; break
            if ch is None:
                c = match_units(L.get("title", ""), "num")
                if len(c) == 1: ch = c[0]
            if ch is None:
                c = match_units(L.get("title", ""), "kw")
                if len(c) == 1: ch = c[0]
            if ch is None: ch = "?"
            qn_map = (lnodes.get("lessons", {}).get(L["id"]) or {}).get("q", {})
            mmdd = f"{int(date[5:7])}/{int(date[8:10])}"
            for qid in L.get("qids", []):
                x = quiz.get(qid, {})
                qn = x.get("qn") or qid
                lab, _, tit = qn.partition(" · ")
                prob = {
                    "pid": f"{slug}:class:{date}/{qid}", "src": "class", "label": f"{mmdd} {lab.strip()}",
                    "title": (tit or qn).strip(), "kind": "choice" if x.get("choices") else "open", "steps": 0,
                    "nodes": list(qn_map.get(qid, [])),
                    "open": cls, "exam": bool(x.get("exam")), "hw": None,
                    "lesson": L["id"], "qid": qid, "origin": "교실 회차",
                }
                put(ch, None, prob)

        # ---------- 정리 ----------
        out_ch = []
        for ch in sorted(chapters, key=ch_key):
            c = chapters[ch]
            out_ch.append({
                "ch": ch, "title": c["title"],
                "sections": [{"no": no, "title": sec_table.get(no, (None, ""))[1], "problems": c["sections"][no]}
                             for no in sorted(c["sections"], key=sec_key)],
                "unsorted": c["unsorted"],
            })
        bank[cname] = {"slug": slug, "exam": exam, "chapters": out_ch}

    return bank, problems_issue

# ---------- 검증 ----------
def verify(bank):
    errs = []
    cache = {}
    def text(rel):
        if rel not in cache:
            p = P(*rel.split("/"))
            cache[rel] = open(p, encoding="utf-8").read() if os.path.exists(p) else None
        return cache[rel]
    hwids = {}
    pids = set()
    for cname, c in bank.items():
        for ch in c["chapters"]:
            for pr in [p for s in ch["sections"] for p in s["problems"]] + ch["unsorted"]:
                if pr["pid"] in pids: errs.append(f"pid 중복 {pr['pid']}")
                pids.add(pr["pid"])
                path, _, frag = pr["open"].partition("#")
                t = text(path)
                if t is None: errs.append(f"파일 없음 {pr['open']}"); continue
                if pr["src"] == "hw":
                    pid = frag.split("=", 1)[1]
                    d = os.path.dirname(P(*path.split("/")))
                    if d not in hwids:
                        hwids[d] = {q["id"] for f in glob.glob(os.path.join(d, "ch*.json")) for q in load(f)["problems"]}
                    if pid not in hwids[d]: errs.append(f"과제 id 없음 {pr['open']}")
                    if "[#&]p=" not in t: errs.append(f"#p= 처리기 없음 {path}")
                elif pr["src"] == "deck":
                    qid = frag.split("=", 1)[1]
                    ids = {s.get("id") for s in (jsdecode(t, "const SLIDES=") or [])}
                    if qid not in ids: errs.append(f"덱 문제 id 없음 {pr['open']}")
                    if "#(from|done|at)=" not in t: errs.append(f"#at= 처리기 없음 {path}")
                else:
                    if f'"id": "{pr["qid"]}"' not in t: errs.append(f"교실 문제 id 없음 {pr['open']} {pr['qid']}")
    return errs, len(pids)

def summary(bank):
    print(f"{'과목':<8} {'장':>3} {'절':>3} {'과제':>4} {'덱':>4} {'교실':>4} {'합계':>4} {'미분류':>5} {'노드없음':>6}")
    tot = {"hw": 0, "deck": 0, "class": 0}
    for cname, c in bank.items():
        cnt = {"hw": 0, "deck": 0, "class": 0}; uns = 0; nonode = 0; nsec = 0
        for ch in c["chapters"]:
            nsec += len(ch["sections"])
            allp = [p for s in ch["sections"] for p in s["problems"]] + ch["unsorted"]
            uns += len(ch["unsorted"])
            for p in allp:
                cnt[p["src"]] += 1
                if not p["nodes"]: nonode += 1
        for k in tot: tot[k] += cnt[k]
        print(f"{cname:<8} {len(c['chapters']):>3} {nsec:>3} {cnt['hw']:>4} {cnt['deck']:>4} {cnt['class']:>4} {sum(cnt.values()):>4} {uns:>5} {nonode:>6}")
    print(f"합계 과제 {tot['hw']} · 덱 {tot['deck']} · 교실 {tot['class']} · 총 {sum(tot.values())}")
    print()
    print("장별 (절 배정 / 미분류, 출처 hw·deck·class):")
    for cname, c in bank.items():
        for ch in c["chapters"]:
            sc = {"hw": 0, "deck": 0, "class": 0}; uc = {"hw": 0, "deck": 0, "class": 0}
            for s in ch["sections"]:
                for p in s["problems"]: sc[p["src"]] += 1
            for p in ch["unsorted"]: uc[p["src"]] += 1
            secs = ",".join(s["no"] for s in ch["sections"])
            print(f"  {cname} [{ch['ch']}] {ch['title']}: 절 {len(ch['sections'])}({secs}) "
                  f"배정 {sc['hw']}/{sc['deck']}/{sc['class']} · 미분류 {uc['hw']}/{uc['deck']}/{uc['class']}")

if __name__ == "__main__":
    bank, issues = main()
    body = {"courses": bank}
    old = None
    if os.path.exists(OUT):
        try: old = load(OUT)
        except Exception: old = None
    if old and old.get("courses") == bank:
        gen = old.get("generated"); wrote = False
    else:
        gen = datetime.now().isoformat(timespec="seconds"); wrote = True
        with open(OUT, "w", encoding="utf-8") as f:
            json.dump({"generated": gen, "note": "문제 은행 통합 색인 — docs/tools/build_bank.py 가 만든다. 중복(과제=덱) 판단 전. 교실은 색인만(본문은 회차 파일).", "courses": bank}, f, ensure_ascii=False, indent=1)
    print(("새로 씀" if wrote else "변경 없음") + f" · {os.path.relpath(OUT, ROOT)} · generated {gen}")
    for i in issues: print("! " + i)
    errs, n = verify(bank)
    print(f"검증: 문제 {n}개 · open 경로 오류 {len(errs)}개")
    for e in errs[:50]: print("  ✗ " + e)
    summary(bank)
    hw_total = sum(1 for c in bank.values() for ch in c["chapters"] for p in [p for s in ch["sections"] for p in s["problems"]] + ch["unsorted"] if p["src"] == "hw")
    print(f"과제 문제 {hw_total}개 (기대 76)")
    sys.exit(1 if errs or hw_total != 76 else 0)
