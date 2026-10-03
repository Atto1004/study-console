# -*- coding: utf-8 -*-
"""과제 혼자 풀기 — docs/tools/hw_play.html 을 notes/lessons/_private/<과목>/hw/index.html 로 복사하고 ch*.json 형식을 검사한다.
비공개(교재 스캔 그림): atom /study/notes/lessons/_private/<과목>/hw/ 에서만 열린다.
복사할 때 hw_play.html 안의 /*__JUDGE__*/ 를 docs/tools/tutor_judge.js 내용으로 바꿔 넣는다(교실 빌더 __JUDGE__ 와 같은 방식).
과목 폴더마다 meta.json(course·title·key·exam·banner·tabs) — 탭 id t 의 데이터 = ch<t>.json.
사용: python docs/tools/build_hw_play.py            (기본 statics — 예전과 같은 동작)
      python docs/tools/build_hw_play.py calc2      (과목 slug)
      python docs/tools/build_hw_play.py all        (_private/*/hw 전부)
검사 실패면 exit 1. img 는 선택 필드(없으면 검사 안 함)."""
import io, os, sys, json, glob
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PRIV = os.path.join(ROOT, "notes", "lessons", "_private")
HERE = os.path.join(ROOT, "docs", "tools")


def page():
    tpl = io.open(os.path.join(HERE, "hw_play.html"), encoding="utf-8").read()
    jp = os.path.join(HERE, "tutor_judge.js")
    if "/*__JUDGE__*/" in tpl and os.path.exists(jp):
        judge = io.open(jp, encoding="utf-8").read().replace("</", "<\\/")
        tpl = tpl.replace("/*__JUDGE__*/", judge)
    return tpl


def build(slug, tpl):
    DST = os.path.join(PRIV, slug, "hw")
    os.makedirs(DST, exist_ok=True)
    io.open(os.path.join(DST, "index.html"), "w", encoding="utf-8", newline="\n").write(tpl)
    bad = []
    mp = os.path.join(DST, "meta.json")
    if os.path.exists(mp):
        meta = json.load(io.open(mp, encoding="utf-8"))
        for t in meta.get("tabs") or []:
            if not os.path.exists(os.path.join(DST, "ch%s.json" % t[0])): bad.append(f"meta 탭 {t[0]}: ch{t[0]}.json 없음")
    for f in sorted(glob.glob(os.path.join(DST, "ch*.json"))):
        d = json.load(io.open(f, encoding="utf-8"))
        for p in d.get("problems", []):
            pid = p.get("id")
            if p.get("img") and not os.path.exists(os.path.join(DST, p["img"])): bad.append(f"{pid}: 그림 없음 {p.get('img')}")
            st = p.get("steps") or []
            if not 3 <= len(st) <= 10: bad.append(f"{pid}: 단계 수 {len(st)}")
            for i, s in enumerate(st, 1):
                k = s.get("kind")
                if k not in ("multi", "choice", "num", "self"): bad.append(f"{pid} {i}: kind {k}"); continue
                if len(s.get("hints") or []) != 3 and k != "self": bad.append(f"{pid} {i}: 힌트 {len(s.get('hints') or [])}개")
                if k == "choice" and not (isinstance(s.get("answer"), int) and 0 <= s["answer"] < len(s.get("choices", []))): bad.append(f"{pid} {i}: choice 답")
                if k == "multi" and not (isinstance(s.get("answer"), list) and s["answer"] and all(0 <= a < len(s.get("choices", [])) for a in s["answer"])): bad.append(f"{pid} {i}: multi 답")
                if k == "num":
                    a = s.get("answer") or {}
                    try: float(a.get("v"))
                    except Exception: bad.append(f"{pid} {i}: num 값")
                if k == "self" and not s.get("model"): bad.append(f"{pid} {i}: self 모범 없음")
            if not any(s.get("kind") == "num" for s in st): bad.append(f"{pid}: 숫자 답 단계 없음(실전 모드 불가)")
        print(slug, os.path.basename(f), "문제", len(d.get("problems", [])), "단계", sum(len(p.get("steps", [])) for p in d.get("problems", [])))
    print("index.html →", DST)
    return bad


if __name__ == "__main__":
    arg = sys.argv[1] if len(sys.argv) > 1 else "statics"
    slugs = sorted(os.path.basename(os.path.dirname(h)) for h in glob.glob(os.path.join(PRIV, "*", "hw"))) if arg == "all" else [arg]
    tpl = page()
    bad = []
    for s in slugs: bad += build(s, tpl)
    if bad:
        print("문제", len(bad)); print("\n".join(bad)); sys.exit(1)
    print("문제 0")
