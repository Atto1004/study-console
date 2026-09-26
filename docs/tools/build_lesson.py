# -*- coding: utf-8 -*-
"""수업 노트 빌더 — 회차 원본 HTML(study-materials/<과목>/_수업노트/<날짜>.html) → notes/lessons/<약칭>/<날짜>.html + knowledge/lessons.json
사용: python build_lesson.py <src.html> <course-slug> <YYYY-MM-DD> [--minutes 18]
원본 마크업:
  <header> 안: <h1>제목</h1> <p class="lead">한 줄 도입</p> <p class="meta">3주차 · 수 · 녹음 45분 …</p>
  <section class="s" data-id="s1"><h2>…</h2> 본문(p · figure.fig(인라인 SVG) · figure.board(판서 사진, atom 안에서만) · div.why/.say/.analogy/.formula/.pitfall/.memo · details.ex)</section> …
  문제: <div class="q" data-qid="q1"><div class="qn">…</div><div class="qb">…</div><ol class="choices"><li data-ok="1">…</li>…</ol><div class="ans">…</div></div>  (choices 없으면 답 입력형)
판서 사진 경로는 notes/lessons/_private/<약칭>/<날짜>/<파일> (gitignore) — 빌더가 study-materials 에서 복사한다(data-photo="상대경로").
"""
import io, os, re, sys, json, shutil, datetime
from xml.sax.saxutils import escape
from lxml import html as LH

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SM = os.path.join(os.path.dirname(ROOT), "study-materials")
COURSE = {"phys2": "일반물리학2", "statics": "정역학", "em1": "공업수학1", "calc2": "미분적분학2", "cadd": "CADD", "writing": "아카데믹글쓰기"}
DAY = "일월화수목금토"

src, slug, date = sys.argv[1], sys.argv[2], sys.argv[3]
minutes = int(sys.argv[sys.argv.index("--minutes") + 1]) if "--minutes" in sys.argv else 18
course = COURSE[slug]
lesson_id = f"{slug}-{date}"
doc = LH.fromstring(io.open(src, encoding="utf-8").read())

def inner(el):
    # el.text 는 풀린 글자(&lt; → <)라서 다시 이스케이프한다 — 안 하면 < 가 브라우저에서 태그로 읽혀 글이 사라진다(교실 빌더에서 발견, 2026-09-26)
    s = escape(el.text or "")
    for ch in el: s += LH.tostring(ch, encoding="unicode", with_tail=True)
    return s

head = doc.xpath("//header")[0]
title = head.xpath(".//h1")[0].text_content().strip()
lead = head.xpath('.//p[@class="lead"]'); lead_html = f'<div class="lead">{inner(lead[0])}</div>' if lead else ""
meta = head.xpath('.//p[@class="meta"]'); meta_html = inner(meta[0]) if meta else ""
d = datetime.date.fromisoformat(date)
wk = ((d - datetime.date(2026, 8, 30)).days // 7) + 1
sess = f"{d.month}/{d.day}({DAY[(d.weekday()+1)%7]}) · {wk}주차 · 약 {minutes}분"

# 섹션 · 판서 사진 복사
sections = doc.xpath('//section[contains(concat(" ",normalize-space(@class)," ")," s ")]')
sids = []
priv_dir = os.path.join(ROOT, "notes", "lessons", "_private", slug, date)
for i, sec in enumerate(sections, 1):
    sid = sec.get("data-id") or f"s{i}"; sec.set("data-id", sid); sids.append(sid)
    no = sec.xpath('./div[@class="no"]')
    if not no:
        n = LH.fromstring(f'<div class="no">{i} / {len(sections)}</div>'); sec.insert(0, n)
    for img in sec.xpath('.//figure[contains(@class,"board")]//img'):
        p = img.get("data-photo")
        if p:
            srcp = os.path.join(SM, p)
            if os.path.exists(srcp):
                os.makedirs(priv_dir, exist_ok=True)
                fn = os.path.basename(p); shutil.copy2(srcp, os.path.join(priv_dir, fn))
                img.set("src", f"../_private/{slug}/{date}/{fn}"); img.set("loading", "lazy")
            else:
                print("WARN 판서 사진 없음:", p); img.getparent().getparent().set("hidden", "hidden")
            del img.attrib["data-photo"]
body_html = "".join(LH.tostring(s, encoding="unicode") for s in sections)

# 문제
quiz = []
for k, q in enumerate(doc.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," q ")]'), 1):
    qid = q.get("data-qid") or f"q{k}"
    qn = (q.xpath('./div[@class="qn"]/text()') or [f"문제 {k}"])[0].strip()
    qb = q.xpath('./div[@class="qb"]'); qhtml = inner(qb[0]) if qb else ""
    ch = q.xpath('./ol[contains(@class,"choices")]')
    choices = None
    if ch:
        choices = [{"html": inner(li), "ok": li.get("data-ok") == "1"} for li in ch[0].xpath("./li")]
        assert sum(1 for c in choices if c["ok"]) == 1, "정답은 정확히 하나: " + qn
    ans = q.xpath('./div[@class="ans"]'); ans_html = inner(ans[0]) if ans else ""
    quiz.append({"id": qid, "qn": qn, "html": qhtml, "choices": choices, "ans": ans_html})

tpl = io.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "lesson_tpl.html"), encoding="utf-8").read()
page = (tpl.replace("__TITLE__", title).replace("__COURSE__", course).replace("__SESS__", sess).replace("__KICKER__", f"{course} · {sess}")
           .replace("__META__", meta_html).replace("__LEAD__", lead_html).replace("__BODY__", body_html)
           .replace("__QUIZ__", json.dumps(quiz, ensure_ascii=False)).replace("__ID__", lesson_id))
out_dir = os.path.join(ROOT, "notes", "lessons", slug); os.makedirs(out_dir, exist_ok=True)
out = os.path.join(out_dir, f"{date}.html")
io.open(out, "w", encoding="utf-8", newline="\n").write(page)

# lessons.json
lp = os.path.join(ROOT, "knowledge", "lessons.json")
L = json.load(io.open(lp, encoding="utf-8")) if os.path.exists(lp) else {"courses": {}}
L.setdefault("courses", {}).setdefault(course, {})[date] = {"id": lesson_id, "file": f"notes/lessons/{slug}/{date}.html", "title": title, "minutes": minutes,
                                                          "sids": sids, "qids": [q["id"] for q in quiz], "week": wk}
L["generated"] = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
io.open(lp, "w", encoding="utf-8", newline="\n").write(json.dumps(L, ensure_ascii=False, indent=1))
print(f"{lesson_id}: 섹션 {len(sids)} · 문제 {len(quiz)} · {minutes}분 → {out}")
