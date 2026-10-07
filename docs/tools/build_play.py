# -*- coding: utf-8 -*-
"""문제 풀기(공통 풀이 화면 + 하단 스앵님 도크) — UI 개편 2·3단계 시범 (오타 ui-restructure-1004 · 1004b).
docs/tools/play.html 을 notes/lessons/_private/play/index.html 로 복사하면서 /*__JUDGE__*/ 자리에 docs/tools/tutor_judge.js 를 넣는다
(build_hw_play.py 와 같은 방식). _private 이라 atom /study/ 안에서만 열린다.
검사: bank.json 존재 · src=hw 문제가 있는 과목의 hw/meta.json 과 탭 ch*.json · bank 의 hw 문제 id 가 실제 데이터에 있는지 · 스앵님 초상 5장.
사용: PYTHONIOENCODING=utf-8 python docs/tools/build_play.py      검사 실패면 exit 1."""
import io, os, sys, json
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.join(ROOT, "docs", "tools")
PRIV = os.path.join(ROOT, "notes", "lessons", "_private")
DST = os.path.join(PRIV, "play")
FACES = ["neutral", "wide", "smile", "proud", "sharp"]


def page():
    tpl = io.open(os.path.join(HERE, "play.html"), encoding="utf-8").read()
    jp = os.path.join(HERE, "tutor_judge.js")
    if "/*__JUDGE__*/" not in tpl: raise SystemExit("play.html 에 /*__JUDGE__*/ 자리가 없음")
    judge = io.open(jp, encoding="utf-8").read().replace("</", "<\\/")
    return tpl.replace("/*__JUDGE__*/", judge)


def check():
    bad = []
    bp = os.path.join(PRIV, "bank.json")
    if not os.path.exists(bp): return ["bank.json 없음 — build_bank.py 먼저"]
    bank = json.load(io.open(bp, encoding="utf-8"))
    for name, c in bank["courses"].items():
        slug = c["slug"]
        probs = [p for ch in c["chapters"] for p in (ch.get("unsorted") or []) + [q for s in ch.get("sections") or [] for q in s.get("problems") or []]]
        hw = [p for p in probs if p["src"] == "hw"]
        print(f"{slug}: 문제 {len(probs)} (과제 {len(hw)} · 덱 {sum(p['src']=='deck' for p in probs)} · 교실 {sum(p['src']=='class' for p in probs)})")
        for p in probs:
            if p["src"] != "hw" and not p.get("open"): bad.append(f"{p['pid']}: open 경로 없음")
            if p["src"] != "hw" and p.get("open") and not os.path.exists(os.path.join(ROOT, p["open"].split("#")[0])): bad.append(f"{p['pid']}: 파일 없음 {p['open']}")
        if not hw: continue
        mp = os.path.join(PRIV, slug, "hw", "meta.json")
        if not os.path.exists(mp): bad.append(f"{slug}: hw/meta.json 없음"); continue
        meta = json.load(io.open(mp, encoding="utf-8"))
        ids = set()
        for t in meta.get("tabs") or []:
            f = os.path.join(PRIV, slug, "hw", "ch%s.json" % t[0])
            if not os.path.exists(f): bad.append(f"{slug}: ch{t[0]}.json 없음"); continue
            for p in json.load(io.open(f, encoding="utf-8")).get("problems", []): ids.add(p.get("id"))
        for p in hw:
            hid = p["pid"].split(":", 2)[2]
            if hid not in ids: bad.append(f"{p['pid']}: hw 데이터에 없음")
    for f in FACES:
        if not os.path.exists(os.path.join(ROOT, "notes", "classroom", "assets", "tutor", f + ".png")): bad.append(f"초상 {f}.png 없음")
    return bad


if __name__ == "__main__":
    bad = check()
    os.makedirs(DST, exist_ok=True)
    out = os.path.join(DST, "index.html")
    html = page()
    old = io.open(out, encoding="utf-8").read() if os.path.exists(out) else None
    if old != html: io.open(out, "w", encoding="utf-8", newline="\n").write(html)
    print("index.html →", out, "(변경 없음)" if old == html else "")
    if bad:
        print("문제", len(bad)); print("\n".join(bad)); sys.exit(1)
    print("문제 0")
