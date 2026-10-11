# -*- coding: utf-8 -*-
"""학습과 무관한 내용 검사 (지침 학습시스템 §35, 대표님 2026-10-11)
수업 화면에 실제로 나오는 글(교실 페이지의 제목·리드·판서·대사·교재·확인 문제, 수업 목록 제목)에서
출결·수강·행정·자료 제작 경위 같은 학습과 무관한 문구를 찾는다. 하나라도 있으면 종료 코드 1.
실행: python -X utf8 docs/tools/study_noise_check.py [과목 slug ...]   (기본 statics)"""
import json, re, sys, os, html
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
BAN = [
    r"출결", r"결석", r"지각", r"출석", r"수강\s*정정", r"수강\s*신청", r"학수번호", r"수업\s*코드", r"이수\s*단위",
    r"강의실\s*\d", r"제\d공학관", r"@hanyang", r"녹음이?\s*없", r"필기본\s*\d+\s*쪽", r"영상으로\s*(재구성|정리)",
    r"patch\s*V\d", r"최우선인가", r"전공\s*배치", r"부정행위", r"화장실", r"초청\s*강연",
]
PAT = re.compile("|".join(BAN))
def plain(s): return html.unescape(re.sub(r"<[^>]+>", " ", str(s or "")))
def page_texts(path):
    t = open(path, encoding="utf-8").read()
    m = re.search(r"(?:const|var|let)\s+D\s*=\s*", t)
    if not m: return []
    D, _ = json.JSONDecoder().raw_decode(t[m.end():])
    out = [("제목", D.get("title")), ("리드", D.get("lead"))]
    for ch in D.get("chapters", []):
        out.append(("챕터 " + ch.get("id", ""), ch.get("title")))
        for st in ch.get("steps", []):
            for b in st.get("b", []): out.append((st.get("id", "") + " 판서", b.get("h")))
            out.append((st.get("id", "") + " 대사", st.get("s")))
            for k in ("html", "q", "a", "say"):
                if st.get(k): out.append((st.get("id", "") + " " + k, st.get(k)))
    for q in D.get("quiz", []):
        out.append((q.get("id", "") + " 문제", q.get("html")))
        for c in q.get("choices") or []: out.append((q.get("id", "") + " 보기", c.get("html")))
        out.append((q.get("id", "") + " 해설", q.get("ans")))
    return [(w, plain(x)) for w, x in out if x]
def main():
    slugs = sys.argv[1:] or ["statics"]
    reg = json.load(open(os.path.join(ROOT, "knowledge", "lessons.json"), encoding="utf-8"))
    names = {"statics": "정역학", "em1": "공업수학1", "calc2": "미분적분학2", "phys2": "일반물리학2", "cadd": "CADD"}
    hits = 0
    for slug in slugs:
        course = names.get(slug, slug)
        for date, rec in sorted((reg.get("courses", {}).get(course) or {}).items()):
            if PAT.search(str(rec.get("title", ""))): print(f"[목록] {course} {date}: {rec.get('title')}"); hits += 1
        d = os.path.join(ROOT, "notes", "classroom", slug)
        if not os.path.isdir(d): continue
        for f in sorted(os.listdir(d)):
            if not f.endswith(".html"): continue
            for where, text in page_texts(os.path.join(d, f)):
                for m in PAT.finditer(text):
                    s = max(0, m.start() - 20); print(f"[{slug}/{f}] {where}: …{text[s:m.end() + 20].strip()}…"); hits += 1
    print(f"\n학습과 무관한 문구 {hits}건" if hits else "\n학습과 무관한 문구 0건")
    sys.exit(1 if hits else 0)
main()
