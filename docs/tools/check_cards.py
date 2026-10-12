# -*- coding: utf-8 -*-
"""정역학 암기카드 검사 (객관식 보기). 교실 빌드(build_classroom.gate_for)가 호출하고, 따로 돌려도 된다.
사용: python check_cards.py [--table 출력.md]
검사: ① 카드 수·ID 가 expect 와 일치, ID 중복 없음  ② 모든 카드에 mc(right 1 + wrong 3) 와 tip  ③ 보기 4개가 서로 달라야 함(공백·기호 무시)
      ④ 오답이 카드 원문 정답(a)과 같으면 안 됨 = 우연히 정답이 둘이 되는 보기 금지  ⑤ 보기 길이 편차가 너무 크면 경고(길이로 정답이 드러남)
의미상 두 번째 정답(오답처럼 쓴 보기가 사실은 맞는 경우)은 기계가 못 잡는다 → --table 로 뽑은 표를 사람과 오타가 읽고 판정한다."""
import io, json, os, re, sys, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
PATH = os.path.join(HERE, "lessons", "cards", "statics.json")

def norm(s):
    s = unicodedata.normalize("NFKC", str(s)).lower()
    return re.sub(r"[\s·,()\[\]{}:;'\"]+", "", s)

def all_cards(g):
    out = [("공통", c) for c in g.get("common", [])]
    for k, lec in g.get("lectures", {}).items():
        out += [(k + "강", c) for c in lec.get("cards", [])]
    return out

def check(g):
    err, warn = [], []
    exp = g.get("expect", {})
    if len(g.get("common", [])) != exp.get("common"): err.append(f"공통 카드 수 {len(g.get('common', []))} != expect {exp.get('common')}")
    for k, lec in g.get("lectures", {}).items():
        if len(lec.get("cards", [])) != exp.get(k): err.append(f"{k}강 카드 수 {len(lec.get('cards', []))} != expect {exp.get(k)}")
    cards = all_cards(g); ids = [c["id"] for _, c in cards]
    seen = {}
    for k, lec in g.get("lectures", {}).items():
        for dt in lec.get("dates", []):
            if dt in seen: err.append(f"날짜 {dt} 가 {seen[dt]}강과 {k}강에 중복 연결")
            seen[dt] = k
        if len(lec.get("dates", [])) != 1: err.append(f"{k}강 날짜가 정확히 1개여야 함 (화면 강 하나 = 날짜 하나)")
    if len(set(ids)) != len(ids): err.append("카드 ID 중복: " + ", ".join(sorted({i for i in ids if ids.count(i) > 1})))
    for grp, c in cards:
        cid = c.get("id"); mc = c.get("mc")
        if not c.get("q") or not c.get("a"): err.append(f"{cid}: q/a 없음"); continue
        if not isinstance(mc, dict) or not mc.get("right") or not isinstance(mc.get("wrong"), list): err.append(f"{cid}: mc(right, wrong[3]) 없음"); continue
        if len(mc["wrong"]) != 3: err.append(f"{cid}: 오답 보기가 {len(mc['wrong'])}개 (3개여야 함)")
        if not isinstance(mc.get("right"), str) or not all(isinstance(w, str) for w in mc["wrong"]): err.append(f"{cid}: 보기는 문자열이어야 함"); continue
        opts = [mc["right"]] + list(mc["wrong"])
        if any(not str(o).strip() for o in opts): err.append(f"{cid}: 빈 보기")
        n = [norm(o) for o in opts]
        if len(set(n)) != len(n): err.append(f"{cid}: 보기 중복 {opts}")
        na = norm(c["a"])
        for w in mc["wrong"]:
            if norm(w) == na: err.append(f"{cid}: 오답 보기가 원문 정답과 같음 → 정답이 둘: {w}")
        if not str(c.get("tip") or "").strip(): err.append(f"{cid}: tip(기억 요령) 없음")
        L = [len(str(o)) for o in opts]
        if len(L) == 4 and L[0] > 1.8 * max(L[1:]) and L[0] - max(L[1:]) > 12: warn.append(f"{cid}: 정답이 오답보다 훨씬 김 ({L}) — 길이로 정답이 드러남")
    return err, warn

def table(g):
    rows = ["| 카드 | 정답 | 보기 3개(함정) |", "|---|---|---|"]
    for grp, c in all_cards(g):
        mc = c["mc"]; q = mc.get("q") or c["q"]
        rows.append(f"| {c['id']} {q} | {mc['right']} | " + " ／ ".join(mc["wrong"]) + " |")
    return "\n".join(rows) + "\n"

def first(g):
    return (g.get("common") or next(iter(g["lectures"].values()))["cards"])[0]

def selftest(g):
    """검사기가 나쁜 데이터를 실제로 잡는지 확인한다(손상본을 만들어 오류가 나와야 통과)."""
    import copy
    def broken(f):
        h = copy.deepcopy(g); f(first(h)); return check(h)[0]
    cases = {
        "오답 2개": lambda c: c["mc"]["wrong"].pop(),
        "오답 4개": lambda c: c["mc"]["wrong"].append("추가 오답"),
        "오답이 정답과 같음": lambda c: c["mc"]["wrong"].__setitem__(0, c["mc"]["right"]),
        "오답이 원문 정답과 같음": lambda c: c["mc"]["wrong"].__setitem__(0, c["a"]),
        "오답끼리 같음": lambda c: c["mc"]["wrong"].__setitem__(1, c["mc"]["wrong"][0]),
        "빈 보기": lambda c: c["mc"]["wrong"].__setitem__(0, " "),
        "mc 없음": lambda c: c.pop("mc"),
        "tip 없음": lambda c: c.pop("tip"),
    }
    bad = [k for k, f in cases.items() if not broken(f)]
    h = copy.deepcopy(g); h["common"].append(copy.deepcopy(first(h)))
    if not check(h)[0]: bad.append("카드 수·ID 중복")
    return bad

if __name__ == "__main__":
    g = json.load(io.open(PATH, encoding="utf-8"))
    if "--selftest" in sys.argv:
        bad = selftest(g)
        print("selftest:", "통과 (손상본 9종 모두 잡힘)" if not bad else "못 잡은 경우 " + ", ".join(bad)); sys.exit(1 if bad else 0)
    err, warn = check(g)
    for w in warn: print("경고", w)
    for e in err: print("오류", e)
    if "--table" in sys.argv:
        io.open(sys.argv[sys.argv.index("--table") + 1], "w", encoding="utf-8", newline="\n").write(table(g))
    n = len(all_cards(g))
    print(f"카드 {n}장 · 오류 {len(err)} · 경고 {len(warn)}")
    sys.exit(1 if err else 0)
