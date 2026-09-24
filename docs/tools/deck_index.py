# -*- coding: utf-8 -*-
"""덱 색인 생성 — notes/*-slides.html 의 SLIDES 를 읽어 knowledge/decks.json 을 만든다.
학습앱 「중간고사 대비」 허브(V49)가 이 파일만 읽는다(코드에 덱 목록을 박지 않는다). 덱을 새로 만들거나 다시 만들면 실행.
사용: python deck_index.py"""
import io, os, re, json, glob, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
COURSE = {"calc2": "미분적분학2", "em1": "공업수학1", "em": "공업수학1", "phys2": "일반물리학2", "statics": "정역학", "writing": "아카데믹글쓰기", "cadd": "CADD"}
# 덱마다 어느 주차·범위를 덮는지 (덱 파일 안에는 없는 정보)
META = {
    "calc2-matrix":   {"weeks": [1, 2], "scope": "행렬 · 행렬식 · 역행렬 · 크래머 (학습지 (1)~(7))"},
    "calc2-vectors":  {"weeks": [2, 3, 4], "scope": "12.1 3차원 좌표계 · 12.2 벡터 · 12.3 내적 도입"},
    "em1-mid":        {"weeks": [1, 2, 3, 4], "scope": "1장 1계 ODE 전부 · 2.1~2.3 2계 선형(기저·특성방정식·연산자)"},
    "phys2-mid":      {"weeks": [1, 2, 3, 4], "scope": "21 전하 · 22 전기장 · 23 가우스 · 24 전위 · 25 전기용량 도입"},
    "statics-mid":    {"weeks": [2, 3, 4], "scope": "Ch.2 벡터(성분·방향여현·내적·정사영·외적·삼중적) · Ch.3 힘·평형·자유물체도"},
    "em1-w1-3":       {"weeks": [2, 3], "scope": "회차 정리 자동 변환(9/9·9/11·9/16)"},
    "phys2-w1-3":     {"weeks": [1, 2, 3], "scope": "회차 정리 자동 변환(9/4~9/18)"},
    "statics-w1-3":   {"weeks": [2, 3], "scope": "회차 정리 자동 변환(9/7·9/9·9/14)"},
    "writing-w1-3":   {"weeks": [2, 3], "scope": "회차 정리 자동 변환(9/8·9/15)"},
}
out = []
for f in sorted(glob.glob(os.path.join(ROOT, "notes", "*-slides.html"))):
    s = io.open(f, encoding="utf-8").read()
    m = re.search(r'const DECK_ID="([^"]+)";', s)
    j = re.search(r'const SLIDES=(\[.*?\]);\nconst PARTS=', s, re.S)
    if not m or not j:
        print("건너뜀(형식 불명)", os.path.basename(f)); continue
    did = m.group(1); slides = json.loads(j.group(1))
    title = (re.search(r"<title>([^<]*)</title>", s) or [None, did])[1]
    qs = [x for x in slides if x.get("type") == "q"]
    parts = sorted(set(x.get("part") for x in slides if x.get("type") == "cover"))
    # 파트별 회차 날짜·슬라이드 id — 「수업 따라가기」(V50)가 회차 ↔ 파트를 잇는다. 표지 no "파트 1 · 9/7·9/9" / "9/16 → 9/21·23" 에서 날짜를 읽는다
    def part_dates(no):
        ds, mon = [], None
        for m in re.finditer(r"(\d{1,2})/(\d{1,2})|(?<=[·,~→ ])(\d{1,2})(?![/\d])", no or ""):
            if m.group(1): mon, day = int(m.group(1)), int(m.group(2))
            elif mon: day = int(m.group(3))
            else: continue
            if 1 <= mon <= 12 and 1 <= day <= 31: ds.append("2026-%02d-%02d" % (mon, day))
        return sorted(set(ds))
    plist = []
    for n in parts:
        cov = [x for x in slides if x.get("type") == "cover" and x.get("part") == n][0]
        sids = [x["id"] for x in slides if x.get("part") == n and x.get("type") in ("concept", "mu", "q")]
        plist.append({"n": n, "title": re.sub(r"[\s★]+$", "", cov.get("title") or ""), "no": cov.get("no") or "", "dates": part_dates(cov.get("no")),
                      "sids": sids, "qids": [x["id"] for x in slides if x.get("part") == n and x.get("type") == "q"]})
    pre = did.split("-")[0]
    meta = META.get(did, {})
    out.append({"id": did, "file": "notes/" + os.path.basename(f), "title": title, "course": COURSE.get(pre, "?"),
                "weeks": meta.get("weeks", []), "scope": meta.get("scope", ""), "parts": len(parts), "partList": plist,
                "qN": len(qs), "qMC": sum(1 for q in qs if q.get("choices")), "slides": len(slides),
                "kind": "exam" if qs else "temp", "quiz": "V6E-QUIZ" in s})
data = {"generated": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S"), "decks": out}
p = os.path.join(ROOT, "knowledge", "decks.json")
io.open(p, "w", encoding="utf-8", newline="\n").write(json.dumps(data, ensure_ascii=False, indent=1))
for d in out: print("%-16s %-8s 문제 %3d (객관식 %3d) 파트 %2d 장 %3d quiz=%s %s" % (d["id"], d["course"], d["qN"], d["qMC"], d["parts"], d["slides"], d["quiz"], d["kind"]))
print("→", p)
