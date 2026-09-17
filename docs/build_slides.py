# -*- coding: utf-8 -*-
"""정리노트(v2 HTML: 파트 섹션 → 개념/기초/응용) → 가로 PPT형 학습 슬라이드 HTML.
사용: python build_slides.py <note.html> <out.html> <deck-id> <title>
슬라이드: 파트 표지 → 개념(읽음 확인) → 기초 문제(답 보기 → 맞음/틀림) → 응용 문제 → 파트 결과. 마지막에 전체 결과.
한 페이지 완료 전에는 다음 화살표가 나오지 않는다. 진행은 localStorage에 저장."""
import io, sys, re, json
from lxml import html as LH

src, out, deck_id, title = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]

# 자기완결 검사 — 문제 한 장에 필요한 행렬이 다 적혀 있어야 한다 (아토 2026-09-17 "bc가 없는데 어딜 보고 풀라는 거야"). 위반이면 덱을 만들지 않는다.
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from check_q_refs import check as _check_refs
_bad = _check_refs(src)
if _bad:
    for _qn, _und, _refs in _bad: print("!! " + _qn + " | 정의 없는 기호: " + ",".join(_und) + " | 참조 문구: " + ",".join(_refs))
    print("자기완결 위반 %d건 — 슬라이드 생성 중단. 정리노트의 문제 본문을 고쳐라." % len(_bad)); sys.exit(1)
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
            # 선택지: ol.choices > li (정답 li[data-ok]). 있으면 버튼형 문제, 없으면 텍스트 답
            ch = el.xpath('./ol[contains(@class,"choices")]')
            choices = None
            if ch:
                choices = [{"html": inner(li), "ok": li.get("data-ok") == "1"} for li in ch[0].xpath('./li')]
                assert sum(1 for c in choices if c["ok"]) == 1, "선택지 정답은 정확히 하나: " + qn
                body = [LH.tostring(x, encoding="unicode") for x in el if x.tag not in ("details", "ol") and "qn" not in (x.get("class") or "")]
            slides.append({"id": f"p{pi}-{'b' if mode=='b' else 'a'}{q_index}", "type": "q", "part": pi, "kind": "기초" if mode == "b" else "응용",
                           "qn": qn, "html": "".join(body), "ans": inner(ans[0]) if ans else "", "choices": choices})
    # 개념 슬라이드는 표지 바로 뒤에 삽입
    cover_idx = next(i for i, s in enumerate(slides) if s["id"] == f"p{pi}-cover")
    slides.insert(cover_idx + 1, {"id": f"p{pi}-concept", "type": "concept", "part": pi, "title": concept_head if 'concept_head' in dir() else "개념", "html": "".join(concept_html)})
    # 암기 vs 이해 (div.mu) — 개념 바로 뒤 한 장
    mu = sec.xpath('./div[@class="mu"]')
    if mu:
        mem = [inner(li) for li in mu[0].xpath('./div[@class="mu-mem"]/ul/li')]
        und = [inner(li) for li in mu[0].xpath('./div[@class="mu-und"]/ul/li')]
        slides.insert(cover_idx + 2, {"id": f"p{pi}-mu", "type": "mu", "part": pi, "title": ptitle, "mem": mem, "und": und})
    slides.append({"id": f"p{pi}-result", "type": "result", "part": pi, "title": ptitle})
slides.append({"id": "final", "type": "final"})

# 진도 목차 (0절 표)
toc = doc.xpath('//section[.//h2/span[@class="no"][starts-with(normalize-space(text()),"0")]]')
toc_html = LH.tostring(toc[0].xpath('.//div[@class="tw"]')[0], encoding="unicode") if toc else ""
slides.insert(0, {"id": "toc", "type": "concept", "part": 0, "title": "일차별 진도 목차 — 어디를 배웠나", "html": toc_html})
slides.insert(0, {"id": "start", "type": "start"})

# 출처 발췌 이미지: <note>.sources.json 이 있으면 PDF 영역을 잘라 <out dir>/src/<deck>/ 에 JPEG로 넣고 슬라이드에 src 목록을 붙인다
srcs_json = src.rsplit(".", 1)[0] + ".sources.json"
if os.path.exists(srcs_json):
    import fitz, warnings
    warnings.filterwarnings("ignore")
    SM = json.load(io.open(srcs_json, encoding="utf-8"))
    out_dir = os.path.join(os.path.dirname(os.path.abspath(out)), "src", deck_id)
    os.makedirs(out_dir, exist_ok=True)
    docs = {k: fitz.open(os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(src)), v["path"]))) for k, v in SM["docs"].items()}
    by_id = {sl["id"]: sl for sl in slides}
    n_img = 0
    for sid, lst in SM["slides"].items():
        if sid not in by_id: print("  (출처 지정됐지만 슬라이드 없음)", sid); continue
        out_list = []
        for k, it in enumerate(lst):
            pg = docs[it["doc"]][it["page"] - 1]
            x0, y0, x1, y1 = it["rect"]; pad = 6
            clip = fitz.Rect(max(0, x0 - pad), max(0, y0 - pad), min(pg.rect.width, x1 + pad), min(pg.rect.height, y1 + pad))
            fn = f"{sid}-{k+1}.jpg"
            pix = pg.get_pixmap(dpi=130, clip=clip)
            pix.save(os.path.join(out_dir, fn), jpg_quality=78)
            out_list.append({"img": f"src/{deck_id}/{fn}", "label": it.get("label", SM["docs"][it["doc"]]["label"]), "w": pix.width, "h": pix.height})
            n_img += 1
        by_id[sid]["src"] = out_list
    for sl in slides:   # 암기/이해 장은 개념 장과 같은 출처
        if sl["type"] == "mu" and "src" not in sl and f"p{sl['part']}-concept" in by_id and "src" in by_id[f"p{sl['part']}-concept"]:
            sl["src"] = by_id[f"p{sl['part']}-concept"]["src"]
    print("출처 발췌", n_img, "장 →", out_dir)

parts_meta = [{"n": i, "title": p.xpath('./h2')[0].text_content().replace(p.xpath('./h2/span[@class="no"]/text()')[0], "").strip()} for i, p in enumerate(parts, 1)]

tpl = io.open(__file__.replace("build_slides.py", "slides_tpl.html"), encoding="utf-8").read()
page = tpl.replace("__TITLE__", title).replace("__DECK_ID__", deck_id).replace("__SLIDES__", json.dumps(slides, ensure_ascii=False)).replace("__PARTS__", json.dumps(parts_meta, ensure_ascii=False))
io.open(out, "w", encoding="utf-8", newline="\n").write(page)
print("slides", len(slides), "→", out)
