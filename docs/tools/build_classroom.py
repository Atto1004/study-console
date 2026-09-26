# -*- coding: utf-8 -*-
"""교실 모드 빌더 — 회차 원본 HTML(study-materials/<과목>/_수업노트/<날짜>.html) → notes/classroom/<약칭>/<날짜>.html + knowledge/lessons.json 에 classroom 경로 등록
사용: python build_classroom.py <src.html> <course-slug> <YYYY-MM-DD> [--minutes 18]
      python build_classroom.py --all          (lessons.json 에 등록된 회차 전부 다시 빌드)
원본 마크업은 build_lesson.py 와 같다(수업 노트와 같은 원본을 쓴다 — 원본은 한 곳).
챕터 = section.s 하나. 단계 = 섹션 안의 요소를 순서대로 자른 것:
  p(연속 2개까지 한 단계) · figure.fig(그림 한 단계, 붙임 자료) · figure.board(판서 사진, atom 안에서만) · div.why/.analogy/.formula/.pitfall/.memo/.say(상자 한 단계)
  details.ex(예제: 문제 → 풀이 두 단계 표시) · h3(다음 단계의 소제목) · table/ul/ol(글 단계에 붙음)
  요소에 data-tutor="…" 를 주면 그 단계의 스앵님 대사를 그 문장으로 쓴다(없으면 템플릿의 대사 풀).
"""
import io, os, re, sys, json, datetime
from xml.sax.saxutils import escape
from lxml import html as LH

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SM = os.path.join(os.path.dirname(ROOT), "study-materials")
COURSE = {"phys2": "일반물리학2", "statics": "정역학", "em1": "공업수학1", "calc2": "미분적분학2", "cadd": "CADD", "writing": "아카데믹글쓰기"}
DAY = "일월화수목금토"
BOXES = ("why", "analogy", "formula", "pitfall", "memo", "say")

def inner(el):
    # el.text 는 풀린 글자(&lt; → <)라서 다시 이스케이프한다 — 안 하면 \[r<R\] 의 < 가 브라우저에서 태그로 읽혀 수식이 사라진다(일물2 9/16 CH3에서 발견)
    s = escape(el.text or "")
    for ch in el: s += LH.tostring(ch, encoding="unicode", with_tail=True)
    return s

def outer(el):
    el = el.__copy__() if hasattr(el, "__copy__") else el
    s = LH.tostring(el, encoding="unicode", with_tail=False)
    return s

def cls_of(el):
    return (el.get("class") or "").split()

def build(src, slug, date, minutes=18):
    course = COURSE[slug]; lesson_id = f"{slug}-{date}"
    doc = LH.fromstring(io.open(src, encoding="utf-8").read())
    head = doc.xpath("//header")[0]
    title = head.xpath(".//h1")[0].text_content().strip()
    lead = head.xpath('.//p[@class="lead"]'); lead_html = inner(lead[0]) if lead else ""
    d = datetime.date.fromisoformat(date); wk = ((d - datetime.date(2026, 8, 30)).days // 7) + 1
    sess = f"{d.month}/{d.day}({DAY[(d.weekday()+1)%7]}) · {wk}주차"
    chapters = []
    for i, sec in enumerate(doc.xpath('//section[contains(concat(" ",normalize-space(@class)," ")," s ")]'), 1):
        sid = sec.get("data-id") or f"s{i}"
        h2 = sec.xpath("./h2"); ctitle = re.sub(r"^\d+[.)]\s*", "", h2[0].text_content().strip()) if h2 else f"챕터 {i}"
        steps, buf, sub = [], [], None
        def flush():
            nonlocal buf, sub
            if buf: steps.append({"t": "talk", "html": "".join(buf), "sub": sub}); buf = []; sub = None
        for el in sec:
            if not isinstance(el.tag, str): continue
            tag = el.tag; c = cls_of(el)
            if tag in ("h2",) or "no" in c: continue
            tut = el.get("data-tutor")
            if tag == "h3": flush(); sub = el.text_content().strip(); continue
            if tag == "p":
                buf.append(outer(el))
                if len(buf) >= 2: flush()
                if tut: steps[-1]["say"] = tut
                continue
            if tag in ("table", "ul", "ol", "pre", "blockquote"):
                buf.append(outer(el)); flush(); continue
            flush()
            st = None
            if tag == "figure" and "fig" in c:
                st = {"t": "fig", "html": inner(el)}
            elif tag == "figure" and "board" in c:
                img = el.xpath(".//img"); p = img[0].get("data-photo") if img else None
                cap = el.xpath("./figcaption"); cap_html = inner(cap[0]) if cap else ""
                if p:
                    fn = os.path.basename(p)
                    st = {"t": "board", "src": f"../../lessons/_private/{slug}/{date}/{fn}", "cap": cap_html}
            elif tag == "details" and "ex" in c:
                sm = el.xpath("./summary"); body = el.xpath('./div[@class="body"]')
                st = {"t": "ex", "q": inner(sm[0]) if sm else "", "a": inner(body[0]) if body else inner(el)}
            elif tag == "div" and any(x in c for x in BOXES):
                kind = [x for x in BOXES if x in c][0]
                st = {"t": kind, "html": inner(el)}
            else:
                st = {"t": "talk", "html": outer(el)}
            if st is None: continue
            if sub: st["sub"] = sub; sub = None
            if tut: st["say"] = tut
            steps.append(st)
        flush()
        chapters.append({"id": sid, "title": ctitle, "steps": steps, "say": sec.get("data-tutor")})
    quiz = []
    for k, q in enumerate(doc.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," q ")]'), 1):
        qid = q.get("data-qid") or f"q{k}"
        qn = (q.xpath('./div[@class="qn"]/text()') or [f"문제 {k}"])[0].strip()
        qb = q.xpath('./div[@class="qb"]'); qhtml = inner(qb[0]) if qb else ""
        ch = q.xpath('./ol[contains(@class,"choices")]'); choices = None
        if ch:
            choices = [{"html": inner(li), "ok": li.get("data-ok") == "1"} for li in ch[0].xpath("./li")]
            assert sum(1 for c in choices if c["ok"]) == 1, "정답은 정확히 하나: " + qn
        ans = q.xpath('./div[@class="ans"]'); ans_html = inner(ans[0]) if ans else ""
        quiz.append({"id": qid, "qn": qn, "html": qhtml, "choices": choices, "ans": ans_html})
    data = {"id": lesson_id, "slug": slug, "course": course, "date": date, "sess": sess, "title": title, "lead": lead_html, "minutes": minutes, "chapters": chapters, "quiz": quiz}
    js = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    tpl = io.open(os.path.join(HERE, "classroom_tpl.html"), encoding="utf-8").read()
    # 김주영 스앵님 캐릭터: 원본 docs/tools/tutor.svg 하나 → 교실 페이지에 인라인 + notes/classroom/assets/tutor.svg (앱이 fetch)
    # 폴더 이름에 _ 를 쓰면 GitHub Pages(Jekyll)가 올리지 않는다(2026-09-27 _assets 404) — assets 로.
    tutor = io.open(os.path.join(HERE, "tutor.svg"), encoding="utf-8").read()
    tutor = re.sub(r"<!--.*?-->", "", tutor, flags=re.S).strip()
    assets = os.path.join(ROOT, "notes", "classroom", "assets"); os.makedirs(assets, exist_ok=True)
    io.open(os.path.join(assets, "tutor.svg"), "w", encoding="utf-8", newline="\n").write(tutor + "\n")
    page = (tpl.replace("__TITLE__", title.replace("<", "&lt;")).replace("__DATA__", js).replace("__TUTOR__", tutor)
               .replace("__LESSON__", f"../../lessons/{slug}/{date}.html").replace("__APPLESSON__", f"notes/lessons/{slug}/{date}.html"))
    out_dir = os.path.join(ROOT, "notes", "classroom", slug); os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, f"{date}.html")
    io.open(out, "w", encoding="utf-8", newline="\n").write(page)
    # lessons.json 등록
    lp = os.path.join(ROOT, "knowledge", "lessons.json")
    reg = json.load(io.open(lp, encoding="utf-8")) if os.path.exists(lp) else {"courses": {}}
    rec = reg.setdefault("courses", {}).setdefault(course, {}).setdefault(date, {"id": lesson_id})
    rec["classroom"] = f"notes/classroom/{slug}/{date}.html"; rec["chapters"] = len(chapters); rec["steps"] = sum(len(c["steps"]) for c in chapters)
    reg["generated"] = datetime.datetime.now().isoformat(timespec="seconds")
    io.open(lp, "w", encoding="utf-8", newline="\n").write(json.dumps(reg, ensure_ascii=False, indent=1))
    print(f"교실 {slug} {date}: 챕터 {len(chapters)} · 단계 {rec['steps']} · 문제 {len(quiz)} → {os.path.relpath(out, ROOT)}")
    return data

if __name__ == "__main__":
    if "--all" in sys.argv:
        reg = json.load(io.open(os.path.join(ROOT, "knowledge", "lessons.json"), encoding="utf-8"))
        inv = {v: k for k, v in COURSE.items()}
        for cn, m in reg["courses"].items():
            slug = inv[cn]
            for date, rec in sorted(m.items()):
                src = os.path.join(SM, cn, "_수업노트", f"{date}.html")
                if not os.path.exists(src): print("WARN 원본 없음:", src); continue
                build(src, slug, date, rec.get("minutes", 18))
    else:
        src, slug, date = sys.argv[1], sys.argv[2], sys.argv[3]
        minutes = int(sys.argv[sys.argv.index("--minutes") + 1]) if "--minutes" in sys.argv else 18
        build(src, slug, date, minutes)
