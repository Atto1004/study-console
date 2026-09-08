# -*- coding: utf-8 -*-
"""check_graph.py — 지식 그래프 검증 (야간 작업 2026-09-09)
  python check_graph.py            graph.json: 스키마·중복 id·끊긴 prereq·사이클·레벨 역행
  python check_graph.py --map      map.json  : 모든 node id 가 graph 에 존재, 주차·문제 스키마
  python check_graph.py --cards    cards/*.json: 스키마·answer 범위·퀴즈 5문항·id 가 graph 에 존재
종료 코드 0 = 문제 0건.  모든 검사를 한 번에: --all
"""
import glob, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
LEVELS = ["중등", "고교", "대학기초", "전공"]
REQ = {"id": str, "name": str, "level": str, "subject": str, "hours": (int, float), "prereq": list, "tags": list, "desc": str}
ID_PREFIX = ("alg.", "geo.", "trig.", "vec.", "calc.", "lin.", "ode.", "phys.", "mech.", "em.", "cad.")


def load(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as f:
        return json.load(f)


def check_graph():
    errs = []
    g = load("graph.json")
    nodes = g.get("nodes", [])
    ids = {}
    for i, nd in enumerate(nodes):
        for k, t in REQ.items():
            if k not in nd:
                errs.append(f"node[{i}] {nd.get('id')}: 필드 없음 {k}")
            elif not isinstance(nd[k], t):
                errs.append(f"node[{i}] {nd.get('id')}: {k} 타입 {type(nd[k]).__name__}")
        nid = nd.get("id", "")
        if nid in ids:
            errs.append(f"중복 id {nid}")
        ids[nid] = nd
        if not nid.startswith(ID_PREFIX):
            errs.append(f"{nid}: id 접두어 규칙 위반")
        if nd.get("level") not in LEVELS:
            errs.append(f"{nid}: level {nd.get('level')!r}")
        if nd.get("subject") not in g.get("subjects", []):
            errs.append(f"{nid}: subject {nd.get('subject')!r} 가 subjects 목록에 없음")
        if not (0 < float(nd.get("hours", 0)) <= 10):
            errs.append(f"{nid}: hours {nd.get('hours')}")
    for nd in nodes:
        for p in nd["prereq"]:
            if p not in ids:
                errs.append(f"{nd['id']}: 끊긴 prereq {p}")
            elif p == nd["id"]:
                errs.append(f"{nd['id']}: 자기 자신을 prereq")
            elif LEVELS.index(ids[p]["level"]) > LEVELS.index(nd["level"]):
                errs.append(f"{nd['id']}({nd['level']}) 의 prereq {p} 가 더 높은 레벨({ids[p]['level']})")
    # 사이클 (DFS 3색)
    color = {}
    stack = []
    def dfs(u):
        color[u] = 1
        stack.append(u)
        for v in ids[u]["prereq"]:
            if v not in ids:
                continue
            if color.get(v) == 1:
                errs.append("사이클: " + " → ".join(stack[stack.index(v):] + [v]))
            elif color.get(v) is None:
                dfs(v)
        stack.pop()
        color[u] = 2
    for u in ids:
        if color.get(u) is None:
            dfs(u)
    roots = [n for n in nodes if not n["prereq"]]
    print(f"graph.json: 노드 {len(nodes)} · 뿌리 {len(roots)} · 레벨별 " +
          " / ".join(f"{L} {sum(1 for n in nodes if n['level']==L)}" for L in LEVELS))
    return errs, ids


def check_map(ids):
    errs = []
    if not os.path.exists(os.path.join(HERE, "map.json")):
        return ["map.json 없음"]
    m = load("map.json")
    for subj, d in m.items():
        if subj.startswith("_"):
            continue
        for wk, w in (d.get("weeks") or {}).items():
            if not str(wk).isdigit():
                errs.append(f"{subj} 주차 키 {wk!r} 는 숫자여야")
            for k in ("title", "nodes"):
                if k not in w:
                    errs.append(f"{subj} {wk}주차: {k} 없음")
            for n in w.get("nodes", []):
                if n not in ids:
                    errs.append(f"{subj} {wk}주차: 없는 노드 {n}")
        for i, pr in enumerate(d.get("problems") or []):
            if not pr.get("ref"):
                errs.append(f"{subj} problems[{i}]: ref 없음")
            if not pr.get("nodes"):
                errs.append(f"{subj} problems[{i}]: nodes 비어 있음")
            for n in pr.get("nodes", []):
                if n not in ids:
                    errs.append(f"{subj} problems[{i}] {pr.get('ref')}: 없는 노드 {n}")
    print(f"map.json: 과목 {len([k for k in m if not k.startswith('_')])} · 주차 {sum(len(d.get('weeks') or {}) for k,d in m.items() if not k.startswith('_'))} · 문제 {sum(len(d.get('problems') or []) for k,d in m.items() if not k.startswith('_'))}")
    return errs


def check_cards(ids):
    errs = []
    files = sorted(glob.glob(os.path.join(HERE, "cards", "*.json")))
    if not files:
        return ["cards/*.json 없음"]
    for fp in files:
        name = os.path.basename(fp)
        try:
            c = json.load(open(fp, encoding="utf-8"))
        except Exception as e:
            errs.append(f"{name}: JSON 오류 {e}")
            continue
        cid = c.get("id")
        if cid != name[:-5]:
            errs.append(f"{name}: id {cid!r} 가 파일명과 다름")
        if cid not in ids:
            errs.append(f"{name}: graph 에 없는 id")
        for k in ("easy", "core", "example", "pitfall", "quiz"):
            if k not in c:
                errs.append(f"{name}: {k} 없음")
        ex = c.get("example") or {}
        if not ex.get("q") or not isinstance(ex.get("steps"), list) or not ex.get("steps"):
            errs.append(f"{name}: example.q / example.steps 비어 있음")
        q = c.get("quiz") or []
        if len(q) != 5:
            errs.append(f"{name}: 퀴즈 {len(q)}문항 (5 필요)")
        for i, it in enumerate(q):
            opts = it.get("options") or []
            if len(opts) < 2:
                errs.append(f"{name} quiz[{i}]: 선택지 {len(opts)}개")
            a = it.get("answer")
            if not isinstance(a, int) or not (0 <= a < len(opts)):
                errs.append(f"{name} quiz[{i}]: answer {a!r} 범위 밖")
            if not it.get("q") or not it.get("why"):
                errs.append(f"{name} quiz[{i}]: q/why 없음")
    print(f"cards: {len(files)} 장")
    return errs


def main(argv):
    do_map = "--map" in argv or "--all" in argv
    do_cards = "--cards" in argv or "--all" in argv
    errs, ids = check_graph()
    if do_map:
        errs += check_map(ids)
    if do_cards:
        errs += check_cards(ids)
    for e in errs:
        print("  ✗", e)
    print(f"문제 {len(errs)}건")
    return 1 if errs else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
