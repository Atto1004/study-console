# -*- coding: utf-8 -*-
"""과제 혼자 풀기 데이터 전체 검사 — notes/lessons/_private/*/hw/ch*.json (+ meta.json).
build_hw_play.py 와 같은 규칙(단계 3~10 · 힌트 정확히 3개(self 제외) · choice/multi 답 범위 · num 값 · num 단계 1개 이상)
+ 각 단계 nodes 의 id 가 knowledge/graph.json 에 있는지 · 문제 id 중복 · meta 탭 ↔ ch<t>.json · img(있을 때만) 파일 존재.
아무것도 고치지 않는다(읽기 전용). 사용: python docs/tools/check_hw_bank.py   (문제 있으면 exit 1)"""
import io, os, sys, json, glob
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PRIV = os.path.join(ROOT, "notes", "lessons", "_private")
G = json.load(io.open(os.path.join(ROOT, "knowledge", "graph.json"), encoding="utf-8"))
IDS = {n["id"] for n in G["nodes"]}
bad, used = [], {}
for hw in sorted(glob.glob(os.path.join(PRIV, "*", "hw"))):
    slug = os.path.basename(os.path.dirname(hw))
    mp = os.path.join(hw, "meta.json")
    if os.path.exists(mp):
        meta = json.load(io.open(mp, encoding="utf-8"))
        for k in ("course", "title", "key", "exam", "tabs"):
            if k not in meta: bad.append(f"{slug} meta: {k} 없음")
        for t in meta.get("tabs") or []:
            if not os.path.exists(os.path.join(hw, "ch%s.json" % t[0])): bad.append(f"{slug} meta 탭 {t[0]}: ch{t[0]}.json 없음")
    else:
        bad.append(f"{slug}: meta.json 없음")
    seen = set()
    for f in sorted(glob.glob(os.path.join(hw, "ch*.json"))):
        d = json.load(io.open(f, encoding="utf-8"))
        np_ = ns = 0
        for p in d.get("problems", []):
            pid = f"{slug}/{p.get('id')}"; np_ += 1
            if p.get("id") in seen: bad.append(f"{pid}: id 중복")
            seen.add(p.get("id"))
            if p.get("img") and not os.path.exists(os.path.join(hw, p["img"])): bad.append(f"{pid}: 그림 없음 {p['img']}")
            st = p.get("steps") or []; ns += len(st)
            if not 3 <= len(st) <= 10: bad.append(f"{pid}: 단계 수 {len(st)}")
            for i, s in enumerate(st, 1):
                k = s.get("kind")
                if k not in ("multi", "choice", "num", "self"): bad.append(f"{pid} {i}: kind {k}"); continue
                if len(s.get("hints") or []) != 3 and k != "self": bad.append(f"{pid} {i}: 힌트 {len(s.get('hints') or [])}개")
                if not s.get("q"): bad.append(f"{pid} {i}: q 없음")
                if k == "choice" and not (isinstance(s.get("answer"), int) and 0 <= s["answer"] < len(s.get("choices", []))): bad.append(f"{pid} {i}: choice 답")
                if k in ("choice", "multi") and len(set(s.get("choices", []))) != len(s.get("choices", [])): bad.append(f"{pid} {i}: 보기 중복")
                if k == "multi" and not (isinstance(s.get("answer"), list) and s["answer"] and all(0 <= a < len(s.get("choices", [])) for a in s["answer"])): bad.append(f"{pid} {i}: multi 답")
                if k == "num":
                    a = s.get("answer") or {}
                    try: float(a.get("v"))
                    except Exception: bad.append(f"{pid} {i}: num 값")
                    if a.get("tol") is not None and not (0 < float(a["tol"]) < 1): bad.append(f"{pid} {i}: tol {a.get('tol')}")
                if k == "self" and not s.get("model"): bad.append(f"{pid} {i}: self 모범 없음")
                if "nodes" in s:
                    if not isinstance(s["nodes"], list): bad.append(f"{pid} {i}: nodes 형식")
                    for n in s.get("nodes") or []:
                        used[n] = used.get(n, 0) + 1
                        if n not in IDS: bad.append(f"{pid} {i}: graph.json 에 없는 노드 {n}")
            if not any(s.get("kind") == "num" for s in st): bad.append(f"{pid}: 숫자 답 단계 없음(실전 모드 불가)")
        print(f"{slug}/{os.path.basename(f)} 문제 {np_} 단계 {ns}")
print("노드 사용", len(used), "종:", " ".join(f"{k}({v})" for k, v in sorted(used.items())))
if bad:
    print("문제", len(bad)); print("\n".join(bad)); sys.exit(1)
print("문제 0")
