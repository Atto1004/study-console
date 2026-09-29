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
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from quizmix import Mixer, renum

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SM = os.path.join(os.path.dirname(ROOT), "study-materials")
COURSE = {"phys2": "일반물리학2", "statics": "정역학", "em1": "공업수학1", "calc2": "미분적분학2", "cadd": "CADD", "writing": "아카데믹글쓰기"}
DAY = "일월화수목금토"

src, slug, date = sys.argv[1], sys.argv[2], sys.argv[3]
minutes = int(sys.argv[sys.argv.index("--minutes") + 1]) if "--minutes" in sys.argv else 18
course = COURSE[slug]
lesson_id = f"{slug}-{date}"
_raw = io.open(src, encoding="utf-8", newline="").read()
# 제어문자 검사 — 생성기 문자열에 \rangle·\vec 를 역슬래시 하나로 쓰면 \r·\v 가 되어 식이 깨진다(2026-09-29 미적2, 오타 3차가 잡음)
_bad = {name: _raw.count(ch) for name, ch in (("BEL", "\x07"), ("BS", "\x08"), ("VT", "\x0b"), ("FF", "\x0c"), ("CR", "\r")) if _raw.replace("\r\n", "\n").count(ch)}
if _bad: raise SystemExit(f"원문에 제어문자 {_bad} — 생성기의 TeX 역슬래시를 \\\\ 로(예: \\\\rangle, \\\\vec): {src}")
doc = LH.fromstring(_raw)

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
    # 암기·이해 구분(대표님 2026-09-29): 「외울 것」 정리 상자 → .memo.am (알약 「암기」가 머리말을 대신하므로 <b>외울 것</b> 은 뺀다)
    for mb in sec.xpath('.//div[contains(concat(" ",normalize-space(@class)," ")," memo ")]'):
        b = mb.xpath("./b[1]")
        if b and not (mb.text or "").strip() and b[0].text_content().strip() == "외울 것":
            mb.set("class", (mb.get("class") or "") + " am")
            tail = (b[0].tail or "").lstrip(" :：·—-"); mb.text = tail; mb.remove(b[0])
body_html = "".join(LH.tostring(s, encoding="unicode") for s in sections)

# 문제
quiz = []; mixer = Mixer(lesson_id)
for k, q in enumerate(doc.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," q ")]'), 1):
    qid = q.get("data-qid") or f"q{k}"
    qn = (q.xpath('./div[@class="qn"]/text()') or [f"문제 {k}"])[0].strip()
    qb = q.xpath('./div[@class="qb"]'); qhtml = inner(qb[0]) if qb else ""
    ch = q.xpath('./ol[contains(@class,"choices")]')
    choices = None; newpos = None
    if ch:
        choices = [{"html": inner(li), "ok": li.get("data-ok") == "1"} for li in ch[0].xpath("./li")]
        assert sum(1 for c in choices if c["ok"]) == 1, "정답은 정확히 하나: " + qn
        choices, newpos = mixer.mix(choices, qid)   # 보기 섞기 — 원문은 정답이 늘 1번(대표님 2026-09-29), 교실 빌더와 같은 순서
    ans = q.xpath('./div[@class="ans"]'); ans_html = inner(ans[0]) if ans else ""
    if newpos: ans_html = renum(ans_html, newpos)
    quiz.append({"id": qid, "qn": qn, "html": qhtml, "choices": choices, "ans": ans_html})

tpl = io.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "lesson_tpl.html"), encoding="utf-8").read()
# 스앵님 판정: 노드 연결(knowledge/lesson_nodes.json) + 판정 스크립트(tutor_judge.js) — 교실 빌더와 같은 원본
_ln = os.path.join(ROOT, "knowledge", "lesson_nodes.json")
_rec = (json.load(io.open(_ln, encoding="utf-8")).get("lessons") or {}).get(lesson_id) if os.path.exists(_ln) else None
nodes_js = json.dumps({"sec": (_rec or {}).get("sec") or {}, "q": (_rec or {}).get("q") or {}}, ensure_ascii=False)
judge = io.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "tutor_judge.js"), encoding="utf-8").read().replace("</", "<\\/")
tpl = tpl.replace("__JUDGE__", judge)
tpl = tpl.replace("__SPLITTEX__", io.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "split_tex.js"), encoding="utf-8").read().replace("</", "<\/"))   # 이은 식 → 식마다 한 줄
page = (tpl.replace("__TITLE__", title).replace("__COURSE__", course).replace("__SESS__", sess).replace("__KICKER__", f"{course} · {sess}")
           .replace("__META__", meta_html).replace("__LEAD__", lead_html).replace("__BODY__", body_html)
           .replace("__QUIZ__", json.dumps(quiz, ensure_ascii=False)).replace("__NODES__", nodes_js).replace("__MEMO__", f"../../memo/{slug}.html#d{date}").replace("__ID__", lesson_id))
out_dir = os.path.join(ROOT, "notes", "lessons", slug); os.makedirs(out_dir, exist_ok=True)
out = os.path.join(out_dir, f"{date}.html")
io.open(out, "w", encoding="utf-8", newline="\n").write(page)

# lessons.json
lp = os.path.join(ROOT, "knowledge", "lessons.json")
L = json.load(io.open(lp, encoding="utf-8")) if os.path.exists(lp) else {"courses": {}}
# 기존 항목과 병합 — classroom 등 다른 빌더가 넣은 키를 지우지 않는다(오타 설계 회의 2026-09-27)
_rec = L.setdefault("courses", {}).setdefault(course, {}).setdefault(date, {})
_rec.update({"id": lesson_id, "file": f"notes/lessons/{slug}/{date}.html", "title": title, "minutes": minutes,
             "sids": sids, "qids": [q["id"] for q in quiz], "week": wk})
L["generated"] = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
io.open(lp, "w", encoding="utf-8", newline="\n").write(json.dumps(L, ensure_ascii=False, indent=1))
print(f"{lesson_id}: 섹션 {len(sids)} · 문제 {len(quiz)} · {minutes}분 → {out}")
