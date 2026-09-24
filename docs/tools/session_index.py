# -*- coding: utf-8 -*-
"""회차 색인 — study-materials/<과목>/<날짜>/ 의 정리 파일 제목·진도 한 줄을 knowledge/sessions.json 으로.
학습앱 「수업 따라가기」(V50)가 회차 제목·정리 유무를 여기서 읽는다(강의 내용만 — 교수 실명·발언 분석은 넣지 않는다, 지침 §4).
사용: python session_index.py   (새 정리.md 가 생기면 다시 실행)"""
import io, os, re, json, glob, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SM = os.path.join(os.path.dirname(ROOT), "study-materials")
PRIORITY = ["정리.md", "수업요약_", "영상정리_", "자료요약_"]   # 회차 제목을 고를 파일 순서

def h1(path):
    for ln in io.open(path, encoding="utf-8"):
        if ln.startswith("# "):
            return ln[2:].strip()
    return ""

def prog_line(path):
    for ln in io.open(path, encoding="utf-8"):
        if re.match(r"^\s*-\s*진도", ln):
            t = re.sub(r"^\s*-\s*진도[^:：]*[:：]\s*", "", ln).strip()
            t = re.sub(r"\*\*|`", "", t)
            return t[:180]
    return ""

def title_of(h, course, date):
    # "공업수학1 · 2026-09-02 (수) · 1주차 1일차 · 2.5 오일러-코시 …" / "정역학 수업요약 · 3주차 W3-2 · 2026-09-16(수) — 혼합삼중적 · …"
    # → 날짜·요일 토큰을 지우고, 과목명 칸·주차 칸을 버린 나머지. 과목명 띄어쓰기는 무시("아카데믹 글쓰기")
    h2 = re.sub(r"\d{4}-\d{2}-\d{2}\s*\([월화수목금토일]\)\s*[—–-]?\s*", "", h)
    parts = [p.strip() for p in h2.split(" · ") if p.strip()]
    if parts and parts[0].replace(" ", "").startswith(course.replace(" ", "")):
        parts = parts[1:]
    parts = [p for p in parts if not re.search(r"\d+\s*주차", p)]
    rest = " · ".join(parts).strip(" —–-·")
    return rest   # 비면 앱이 덱 파트 제목으로 대신한다

out = {}
for cdir in sorted(glob.glob(os.path.join(SM, "*"))):
    course = os.path.basename(cdir)
    if not os.path.isdir(cdir) or course.startswith("_"):
        continue
    for ddir in sorted(glob.glob(os.path.join(cdir, "2026-*"))):
        date = os.path.basename(ddir)
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
            continue
        files = sorted(os.listdir(ddir))
        pick = None
        for pre in PRIORITY:
            for f in files:
                if (f == pre) or (pre.endswith("_") and f.startswith(pre) and f.endswith(".md")):
                    pick = f; break
            if pick: break
        mds = [f for f in files if f.endswith(".md")]
        entry = {"has": bool(pick), "md": len(mds), "files": len(files)}
        if pick:
            p = os.path.join(ddir, pick)
            entry["title"] = title_of(h1(p), course, date)
            entry["prog"] = prog_line(p)
            if (len(entry["title"]) < 8 or re.search(r"결석|지각|정리 없음", entry["title"])) and entry["prog"]:
                entry["title"] = entry["prog"][:90]   # 제목이 출결 메모뿐인 stub 은 진도 줄로
            entry["src"] = pick
        out.setdefault(course, {})[date] = entry
data = {"generated": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S"), "courses": out}
dst = os.path.join(ROOT, "knowledge", "sessions.json")
io.open(dst, "w", encoding="utf-8", newline="\n").write(json.dumps(data, ensure_ascii=False, indent=1))
for c, ds in out.items():
    print(c, ", ".join(d[5:] + ("✓" if v["has"] else "·") for d, v in ds.items()))
print("→", dst)
