# -*- coding: utf-8 -*-
"""학습 활동 → 개념 노드 연결표: knowledge/lesson_nodes.json
대표님 2026-09-29 「개념 마인드맵은 김주영 스앵님이 학습을 통해 내가 뭘 알고 뭘 모르는지 알아서 파악」 — 스앵님 판정(tutor_judge.js)이
교실·수업 노트·학습 덱·암기노트의 기록(정답/오답 · 다시 설명 · 질문 · 챕터 끝 · 외움)을 노드(knowledge/graph.json)로 옮길 때 이 표를 쓴다.
- 원문 요소에 data-nodes="id id" 가 있으면 그것이 우선(사람이 정한 연결 — 새 회차 생성기는 섹션·문제에 이것을 단다)
- 없으면 글자 겹침으로 고른다. 후보 = 그 과목 노드. 점수 = 이름 두 글자 조각 겹침 비율 ×2 + 설명 겹침 비율 + (같은 날짜 출처 +0.4 · 같은 주차 노드 +0.25)
  섹션 = 최고점의 60% 이상, 최대 3개 · 문제 = 그 회차 섹션 노드 안에서 최대 2개(약하면 가장 비슷한 섹션의 첫 노드) · 덱 파트 = 최대 3개 · 덱 문제 = 파트 노드 안에서 최대 2개
사용: python build_lesson_nodes.py [--print]"""
import io, os, re, sys, json, glob, datetime
from lxml import html as LH
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
SM = os.path.join(os.path.dirname(ROOT), "study-materials")
COURSE = {"phys2": "일반물리학2", "statics": "정역학", "em1": "공업수학1", "calc2": "미분적분학2", "cadd": "CADD", "writing": "아카데믹글쓰기"}
K = lambda p: json.load(io.open(os.path.join(ROOT, "knowledge", p), encoding="utf-8"))

def grams(t):
    t = re.sub(r"<[^>]+>", " ", t or ""); t = re.sub(r"\\[a-zA-Z]+", " ", t).lower()
    g = set()
    for w in re.findall(r"[가-힣]{2,}", t):
        for i in range(len(w) - 1): g.add(w[i:i + 2])
    for w in re.findall(r"[a-z]{3,}", t): g.add(w)
    return g

def week_of(date):
    d = datetime.date.fromisoformat(date); return ((d - datetime.date(2026, 8, 30)).days // 7) + 1

class Scorer:
    """짧은 글(섹션 제목·문제 제목)은 「그 글이 노드 이름·설명에 얼마나 들어 있나」, 긴 글(본문)은 「노드 이름이 본문에 얼마나 들어 있나」로 잰다
    — 긴 글만 쓰면 이름이 짧은 노드(「2차 행렬식」)가 늘 이긴다(2026-09-29 1차 결과: 「대칭행렬」 문제가 역행렬로 감)"""
    def __init__(self, nodes):
        self.nodes = nodes; self.ng = {n["id"]: grams(n["name"]) for n in nodes}; self.dg = {n["id"]: grams((n.get("desc") or "") + " " + " ".join(n.get("tags") or [])) for n in nodes}
    def score(self, text, bonus=None, title=""):
        T = grams(text); H = grams(title); out = []
        for n in self.nodes:
            i = n["id"]; a, b = self.ng[i], self.dg[i]
            s = 2 * (len(a & T) / len(a) if a else 0) + (len(b & T) / len(b) if b else 0)
            if H: s += 1.5 * (2 * len(H & (a | b)) / len(H) + (len(a & H) / len(a) if a else 0))
            out.append((round(s + (bonus or {}).get(i, 0), 3), i))
        return sorted(out, reverse=True)
    @staticmethod
    def pick(sc, rel=.6, mx=3, floor=.5):
        if not sc or sc[0][0] < floor: return []
        top = sc[0][0]; return [i for s, i in sc[:mx] if s >= top * rel and s >= floor]

# 글자 겹침으로 못 잡는 것만 사람이 정한다(2026-09-29 검토) — 키 = 회차 id, 값 = {섹션·문제 id: [노드]}
OVR = {
 "phys2-2026-09-04": {"s1": ["em.charge"], "s2": ["em.field", "em.field_lines"], "s3": ["em.continuous", "em.superposition"], "s5": ["em.constants", "em.charge"], "s6": ["em.coulomb", "em.field"],
                      "q5": ["em.continuous"], "q6": ["em.constants"]},
 "phys2-2026-09-09": {"s3": ["em.dipole"], "s4": ["em.continuous"], "q1": ["em.field"], "q4": ["em.dipole"], "q5": ["em.continuous"], "q6": ["em.continuous"]},
 "phys2-2026-09-11": {"s1": ["em.continuous"], "s2": ["em.continuous"], "s3": ["em.continuous"], "q1": ["em.continuous"], "q2": ["em.continuous"], "q3": ["em.continuous"], "q5": ["em.gauss"], "q6": ["em.continuous"]},
 "phys2-2026-09-16": {"s1": ["em.gauss", "em.field_lines"], "s5": ["em.gauss_apps"], "q5": ["em.gauss_apps"]},
 "phys2-2026-09-18": {"s6": ["em.capacitance"], "q1": ["em.potential"], "q5": ["em.potential_dist"]},
 "phys2-2026-09-23": {"s2": ["em.capacitance"], "s4": ["em.capacitance"], "q1": ["em.capacitance"], "q4": ["em.capacitance"]},
 "statics-2026-09-07": {"s1": ["mech.statics_intro"], "s3": ["mech.statics_intro"], "s4": ["mech.force_vector"], "s6": ["mech.force_vector"],
                        "q3": ["mech.statics_intro"], "q4": ["mech.statics_intro"], "q5": ["mech.force_vector"], "q6": ["mech.force_vector"]},
 "statics-2026-09-09": {"s4": ["mech.force_3d"], "q6": ["mech.force_3d"]},
 "statics-2026-09-14": {"s5": ["mech.cross_apps"], "q1": ["mech.dot_apps"], "q4": ["mech.cross_apps"], "q5": ["mech.cross_apps"]},
 "statics-2026-09-16": {"s2": ["mech.equilibrium_particle"], "s3": ["mech.equilibrium_particle"], "s4": ["mech.equilibrium_particle"],
                        "q3": ["mech.equilibrium_particle"], "q4": ["mech.equilibrium_particle"], "q6": ["mech.equilibrium_particle"]},
 "em1-2026-09-02": {"s3": ["ode.concept"], "s5": ["ode.solution"], "q2": ["ode.concept"]},
 "em1-2026-09-04": {"q6": ["ode.homogeneous"]},
 "em1-2026-09-09": {"s2": ["ode.exact"], "s3": ["ode.exact"], "q1": ["ode.exact"], "q2": ["ode.exact"], "q3": ["ode.exact"], "q4": ["ode.integrating_factor"], "q6": ["ode.integrating_factor", "ode.ivp"]},
 "em1-2026-09-11": {"s2": ["ode.linear1"], "s3": ["ode.linear1"], "s4": ["ode.linear1"], "q2": ["ode.linear1"], "q3": ["ode.linear1"], "q4": ["ode.linear1"]},
 "em1-2026-09-16": {"q1": ["ode.bernoulli"], "q2": ["ode.separable"], "q5": ["ode.ivp", "ode.basis"]},
 "em1-2026-09-18": {"s2": ["ode.const_coeff"], "s3": ["ode.const_coeff", "ode.reduction_order"], "s4": ["ode.const_coeff", "ode.ivp"],
                    "q2": ["ode.const_coeff", "ode.ivp"], "q4": ["ode.const_coeff"], "q6": ["ode.const_coeff"]},
 "em1-2026-09-23": {"s2": ["ode.euler_cauchy", "ode.reduction_order"], "q2": ["ode.euler_cauchy"], "q3": ["ode.euler_cauchy"], "q4": ["ode.euler_cauchy"]},
 "calc2-2026-09-01": {"s1": ["lin.matrix", "lin.linear_system"], "s3": ["lin.matrix"], "s4": ["lin.matrix"], "s5": ["lin.matrix"], "q1": ["lin.matrix"], "q4": ["lin.matrix"], "q5": ["lin.matrix"]},
 "calc2-2026-09-03": {"s1": ["lin.matrix_ops"], "s3": ["lin.det2", "lin.det3"], "q1": ["lin.matrix_ops"], "q2": ["lin.matrix_ops"], "q4": ["lin.det3"], "q5": ["lin.det2"]},
 "calc2-2026-09-08": {"s5": ["lin.inverse", "lin.cramer", "lin.cofactor"], "q1": ["lin.cofactor"]},
 "calc2-2026-09-15": {"q2": ["vec.coords3d"]},
 "calc2-2026-09-17": {"s2": ["vec.position_ops"], "q2": ["vec.position_ops"]},
 "calc2-2026-09-22": {"s1": ["vec.dot_calc2"], "s2": ["vec.unit", "vec.dot_calc2"], "s3": ["vec.unit"], "s4": ["vec.cross"], "s5": ["vec.cross"],
                      "q1": ["vec.unit"], "q2": ["vec.unit"], "q3": ["vec.unit"], "q4": ["vec.cross"], "q5": ["vec.cross"], "q6": ["vec.cross"]},
}
DECK_OVR = {
 "calc2-vectors": {"parts": {"5": ["vec.cross"]}},
 "calc2-mid2": {"parts": {"1": ["vec.cross", "lin.cofactor"], "2": ["vec.line_eq"], "3": ["vec.plane_eq"], "4": ["vec.quadric"], "5": ["vec.vector_func"], "6": ["vec.vector_calc"]}},
 "calc2-matrix": {"parts": {"3": ["lin.det2", "lin.det3"], "6": ["lin.linear_system", "lin.inverse", "lin.cramer"]}},
 "phys2-mid": {"parts": {"1": ["em.charge", "em.coulomb", "em.field"], "2": ["em.superposition", "em.continuous", "em.dipole"], "4": ["em.potential_energy", "em.potential", "em.potential_dist"], "5": ["em.capacitance", "em.dielectric"]}},
 "phys2-mid2": {"parts": {"1": ["em.current"], "2": ["em.resistance"], "3": ["em.power"], "4": ["em.emf_loop"], "5": ["em.kirchhoff"], "6": ["em.rc"]}},
 "phys2-w1-3": {"parts": {"1": ["em.charge", "em.field", "em.coulomb"], "2": ["em.superposition", "em.dipole", "em.continuous"], "3": ["em.continuous", "em.gauss"], "4": ["em.gauss", "em.gauss_apps"], "5": ["em.potential_energy", "em.potential", "em.potential_dist"]}},
 "statics-mid": {"parts": {"1": ["mech.force_vector", "mech.force_3d"], "3": ["mech.cross_apps", "mech.triple_product"], "4": ["mech.equilibrium_particle"], "5": ["mech.equilibrium_particle"]}},
 "statics-mid2": {"parts": {"1": ["mech.moment", "mech.equilibrium_particle"], "2": ["mech.moment_line"], "3": ["mech.couple"], "4": ["mech.rigid_2d"], "5": ["mech.indeterminate"], "6": ["mech.rigid_3d"]}},
 "statics-mid3": {"parts": {"1": ["mech.particle_2d"], "2": ["mech.particle_2d", "mech.force_types"], "3": ["mech.particle_2d"], "4": ["mech.particle_3d"]}},
 "statics-w1-3": {"parts": {"1": ["mech.statics_intro", "mech.force_vector"], "2": ["mech.force_vector", "mech.force_3d", "mech.dot_apps"], "3": ["mech.dot_apps", "mech.projection", "mech.cross_apps"]}},
 "em1-mid": {"parts": {"1": ["ode.concept", "ode.ivp", "ode.separable", "ode.homogeneous"], "3": ["ode.linear1", "ode.bernoulli"], "5": ["ode.const_coeff", "ode.diff_operator"], "6": ["ode.euler_cauchy"]}},
 "em1-mid2": {"parts": {"1": ["ode.free_oscillation"], "2": ["ode.undetermined_coeff"], "3": ["ode.forced_oscillation", "ode.rlc"], "4": ["ode.variation_params"], "5": ["ode.higher_homog"], "6": ["ode.higher_nonhomog"]}},
 "em1-w1-3": {"parts": {"3": ["ode.bernoulli", "ode.superposition", "ode.basis"]}},
}

def explicit(el):
    v = (el.get("data-nodes") or "").split(); return v or None

def main():
    G = K("graph.json"); MAP = K("map.json"); REG = K("lessons.json")
    by_course = {}
    for n in G["nodes"]: by_course.setdefault(n["subject"], []).append(n)
    ids = {n["id"] for n in G["nodes"]}
    byid = {n["id"]: n for n in G["nodes"]}
    def cand_of(cn):
        d = MAP.get(cn) or {}; ref = [x for w in (d.get("weeks") or {}).values() for x in (w.get("nodes") or [])] + [x for p in (d.get("problems") or []) for x in (p.get("nodes") or [])]
        own = by_course.get(cn) or []; seen = {n["id"] for n in own}
        return own + [byid[x] for x in dict.fromkeys(ref) if x in byid and x not in seen]
    out = {"generated": datetime.datetime.now().isoformat(timespec="seconds"), "lessons": {}, "decks": {}}
    report = []
    for cn, m in REG["courses"].items():
        slug = {v: k for k, v in COURSE.items()}[cn]; cand = cand_of(cn)
        if not cand: continue
        sc = Scorer(cand)
        for date in sorted(m):
            src = os.path.join(SM, cn, "_수업노트", f"{date}.html")
            if not os.path.exists(src): continue
            doc = LH.fromstring(io.open(src, encoding="utf-8").read())
            wk = str(week_of(date)); wnodes = set(((MAP.get(cn) or {}).get("weeks") or {}).get(wk, {}).get("nodes") or [])
            bonus = {n["id"]: (.4 if date in (n.get("src") or "") else 0) + (.25 if n["id"] in wnodes else 0) for n in cand}
            rec = {"course": cn, "date": date, "nodes": [], "sec": {}, "q": {}}
            secs = doc.xpath('//section[contains(concat(" ",normalize-space(@class)," ")," s ")]')
            sec_text = {}
            for i, s in enumerate(secs, 1):
                sid = s.get("data-id") or f"s{i}"
                t = s.text_content(); sec_text[sid] = t
                h2 = (s.xpath("./h2") or [None])[0]; title = h2.text_content() if h2 is not None else ""
                pick = explicit(s) or OVR.get(f"{slug}-{date}", {}).get(sid) or Scorer.pick(sc.score(t, bonus, title=re.sub(r"^\s*\d+[.)]\s*", "", title)), floor=.8)
                rec["sec"][sid] = [x for x in pick if x in ids]
                report.append(f"{slug} {date} {sid} {title.strip()[:28]:<28} → {' '.join(rec['sec'][sid])}")
            secnodes = sorted({x for v in rec["sec"].values() for x in v}, key=lambda x: [n["id"] for n in cand].index(x) if x in [n["id"] for n in cand] else 99)
            rec["nodes"] = secnodes
            sub = Scorer([n for n in cand if n["id"] in secnodes]) if secnodes else sc
            for k, q in enumerate(doc.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," q ")]'), 1):
                qid = q.get("data-qid") or f"q{k}"
                t = q.text_content()
                qn = (q.xpath('./div[@class="qn"]') or [None])[0]; qt = qn.text_content() if qn is not None else ""
                qt = qt.split("·", 1)[1] if "·" in qt else qt
                qb = (q.xpath('./div[@class="qb"]') or [None])[0]; body = qb.text_content() if qb is not None else t
                pick = explicit(q) or OVR.get(f"{slug}-{date}", {}).get(qid) or Scorer.pick(sc.score(body, bonus, title=qt), rel=.7, mx=2, floor=.6)
                if not pick:   # 약하면 가장 비슷한 섹션의 첫 노드
                    T = grams(t); best = max(sec_text, key=lambda s: len(T & grams(sec_text[s])), default=None)
                    pick = (rec["sec"].get(best) or [])[:1]
                rec["q"][qid] = [x for x in pick if x in ids]
                report.append(f"{slug} {date}   {qid} {re.sub(r'\s+', ' ', t).strip()[:40]:<40} → {' '.join(rec['q'][qid])}")
            out["lessons"][f"{slug}-{date}"] = rec
    # 학습 덱: 파트 → 노드, 문제 → 파트 노드 안에서
    for d in K("decks.json")["decks"]:
        cand = cand_of(d.get("course"))
        f = os.path.join(ROOT, d["file"])
        if not cand or not os.path.exists(f): continue
        s = io.open(f, encoding="utf-8").read(); mm = re.search(r"const SLIDES=(\[.*?\]);\n", s, re.S)
        if not mm: continue
        slides = json.loads(mm.group(1)); sc = Scorer(cand); rec = {"course": d["course"], "parts": {}, "q": {}}
        for p in d.get("partList") or []:
            n = p["n"]; txt = " ".join((x.get("title") or "") + " " + (x.get("html") or "") + " " + " ".join(x.get("mem") or []) + " " + " ".join(x.get("und") or []) for x in slides if x.get("part") == n and x.get("type") != "q")
            bonus = {c["id"]: (.25 if any(dt in (c.get("src") or "") for dt in (p.get("dates") or [])) else 0) for c in cand}
            rec["parts"][str(n)] = ((DECK_OVR.get(d["id"]) or {}).get("parts") or {}).get(str(n)) or Scorer.pick(sc.score(txt, bonus, title=p.get("title") or ""), floor=.8)
            sub = Scorer([c for c in cand if c["id"] in rec["parts"][str(n)]]) if rec["parts"][str(n)] else sc
            for x in slides:
                if x.get("part") != n or x.get("type") != "q": continue
                t = (x.get("qn") or "") + " " + (x.get("html") or "") + " " + " ".join(c.get("html", "") for c in (x.get("choices") or [])) + " " + (x.get("ans") or "")
                rec["q"][x["id"]] = Scorer.pick(sub.score(t, title=x.get("qn") or ""), rel=.7, mx=2, floor=.6) or rec["parts"][str(n)][:1]
            report.append(f"deck {d['id']} part {n} {(p.get('title') or '')[:30]:<30} → {' '.join(rec['parts'][str(n)])}")
        out["decks"][d["id"]] = rec
    io.open(os.path.join(ROOT, "knowledge", "lesson_nodes.json"), "w", encoding="utf-8", newline="\n").write(json.dumps(out, ensure_ascii=False, indent=1))
    empty = [r for r in report if r.endswith("→ ")]
    print(f"lesson_nodes.json: 회차 {len(out['lessons'])} · 덱 {len(out['decks'])} · 빈 연결 {len(empty)}")
    if "--print" in sys.argv:
        sys.stdout.reconfigure(encoding="utf-8"); print("\n".join(report))

if __name__ == "__main__":
    main()
