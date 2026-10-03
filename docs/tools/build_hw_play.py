# -*- coding: utf-8 -*-
"""정역학 과제 혼자 풀기 — docs/tools/hw_play.html 을 notes/lessons/_private/statics/hw/index.html 로 복사하고 ch*.json 형식을 검사한다.
비공개(교재 스캔 그림): atom /study/notes/lessons/_private/statics/hw/ 에서만 열린다.
사용: python docs/tools/build_hw_play.py   (검사 실패면 exit 1)"""
import io, os, sys, json, glob, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DST = os.path.join(ROOT, "notes", "lessons", "_private", "statics", "hw")
os.makedirs(DST, exist_ok=True)
shutil.copy2(os.path.join(ROOT, "docs", "tools", "hw_play.html"), os.path.join(DST, "index.html"))
bad = []
for f in sorted(glob.glob(os.path.join(DST, "ch*.json"))):
    d = json.load(io.open(f, encoding="utf-8"))
    for p in d.get("problems", []):
        pid = p.get("id")
        if not os.path.exists(os.path.join(DST, p.get("img", ""))): bad.append(f"{pid}: 그림 없음 {p.get('img')}")
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
    print(os.path.basename(f), "문제", len(d.get("problems", [])), "단계", sum(len(p.get("steps", [])) for p in d.get("problems", [])))
print("index.html →", DST)
if bad:
    print("문제", len(bad)); print("\n".join(bad)); sys.exit(1)
print("문제 0")
