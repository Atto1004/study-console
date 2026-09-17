# -*- coding: utf-8 -*-
"""정리노트(v2 HTML: 파트 섹션 → 개념/기초/응용) → 가로 PPT형 학습 슬라이드 HTML.
사용: python build_slides.py <note.html> <out.html> <deck-id> <title>
슬라이드: 파트 표지 → 개념(읽음 확인) → 기초 문제(답 보기 → 맞음/틀림) → 응용 문제 → 파트 결과. 마지막에 전체 결과.
한 페이지 완료 전에는 다음 화살표가 나오지 않는다. 진행은 localStorage에 저장."""
import io, sys, re, json
from lxml import html as LH

src, out, deck_id, title = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
doc = LH.fromstring(io.open(src, encoding="utf-8").read())

def inner(el):
    s = (el.text or "")
    for ch in el: s += LH.tostring(ch, encoding="unicode", with_tail=True)
    return s

slides = []
sections = doc.xpath('//section')
parts = [s for s in sections if s.xpath('.//h2/span[@class="no"]') and (s.xpath('.//h2/span[@class="no"]/text()') or [""])[0].startswith("파트")]
for pi, sec in enumerate(parts, 1):
    no = sec.xpath('./h2/span[@class="no"]/text()')[0].strip()
    h2 = sec.xpath('./h2')[0]
    ptitle = "".join(t for t in h2.itertext()).replace(no, "").strip()
    star = bool(h2.xpath('.//span[@class="star"]'))
    # 표지
    slides.append({"id": f"p{pi}-cover", "type": "cover", "part": pi, "no": no, "title": ptitle, "star": star})
    # 개념: why + concept + one (h3.tag.c 다음 요소들, 기초 h3 전까지)
    concept_html = []
    mode = None
    q_index = 0
    for el in sec:
        if el.tag == "h3":
            tag = el.xpath('./span[contains(@class,"tag")]/@class')
            cls = tag[0].split() if tag else []
            mode = "c" if "c" in cls else "b" if "b" in cls else "a" if "a" in cls else None
            head_txt = "".join(t for t in el.itertext())
            if mode == "c": concept_head = head_txt.replace("개념", "", 1).strip()
            if mode == "b": concept_head = concept_head if 'concept_head' in dir() else "개념"
            continue
        if mode == "c" and el.tag == "div" and any(c in (el.get("class") or "") for c in ["why", "concept", "one", "say"]):
            concept_html.append(LH.tostring(el, encoding="unicode"))
        elif mode in ("b", "a") and el.tag == "div" and "q" in (el.get("class") or "").split():
            qn = el.xpath('./div[contains(@class,"qn")]/text()')[0].strip()
            body = [LH.tostring(x, encoding="unicode") for x in el if x.tag not in ("details",) and "qn" not in (x.get("class") or "")]
            ans = el.xpath('.//div[@class="ans"]')
            q_index += 1
            slides.append({"id": f"p{pi}-{'b' if mode=='b' else 'a'}{q_index}", "type": "q", "part": pi, "kind": "기초" if mode == "b" else "응용",
                           "qn": qn, "html": "".join(body), "ans": inner(ans[0]) if ans else ""})
    # 개념 슬라이드는 표지 바로 뒤에 삽입
    cover_idx = next(i for i, s in enumerate(slides) if s["id"] == f"p{pi}-cover")
    slides.insert(cover_idx + 1, {"id": f"p{pi}-concept", "type": "concept", "part": pi, "title": concept_head if 'concept_head' in dir() else "개념", "html": "".join(concept_html)})
    slides.append({"id": f"p{pi}-result", "type": "result", "part": pi, "title": ptitle})
slides.append({"id": "final", "type": "final"})

# 진도 목차 (0절 표)
toc = doc.xpath('//section[.//h2/span[@class="no"][starts-with(normalize-space(text()),"0")]]')
toc_html = LH.tostring(toc[0].xpath('.//div[@class="tw"]')[0], encoding="unicode") if toc else ""
slides.insert(0, {"id": "toc", "type": "concept", "part": 0, "title": "일차별 진도 목차 — 어디를 배웠나", "html": toc_html})
slides.insert(0, {"id": "start", "type": "start"})

parts_meta = [{"n": i, "title": p.xpath('./h2')[0].text_content().replace(p.xpath('./h2/span[@class="no"]/text()')[0], "").strip()} for i, p in enumerate(parts, 1)]

tpl = io.open(__file__.replace("build_slides.py", "slides_tpl.html"), encoding="utf-8").read()
page = tpl.replace("__TITLE__", title).replace("__DECK_ID__", deck_id).replace("__SLIDES__", json.dumps(slides, ensure_ascii=False)).replace("__PARTS__", json.dumps(parts_meta, ensure_ascii=False))
io.open(out, "w", encoding="utf-8", newline="\n").write(page)
print("slides", len(slides), "→", out)
