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
    pending_exam = []
    concept_html = []
    concept_exam = []   # V4-EXAM: 개념 영역의 aside.exam → 개념 장에 붙인다
    mode = None
    q_index = 0
    for el in sec:
        if el.tag == "aside" and "exam" in (el.get("class") or "").split():
            ex = {"level": el.get("data-level") or "강조", "when": el.get("data-when") or "", "quote": el.text_content().strip()}
            if mode == "c" or mode is None:
                concept_exam.append(ex)
            else:
                # 문제 영역: 바로 뒤에 오는 문제에 붙인다 (pending에 쌓아 두고 다음 q 생성 시 소비)
                pending_exam.append(ex)
            continue
        if el.tag == "h3":
            tag = el.xpath('./span[contains(@class,"tag")]/@class')
            cls = tag[0].split() if tag else []
            mode = "c" if "c" in cls else "b" if "b" in cls else "a" if "a" in cls else None
            head_txt = "".join(t for t in el.itertext())
            if mode == "c": concept_head = head_txt.replace("개념", "", 1).strip()
            if mode == "b": concept_head = concept_head if 'concept_head' in dir() else "개념"
            continue
        if mode == "c" and el.tag == "div" and "extra" in (el.get("class") or "").split():
            # 개념 영역의 보충: 제목 줄 + 안의 블록들을 개념 장 재료로 (V4-EXTRA-C)
            concept_html.append('<div class="one"><b>' + (el.get("data-title") or "보충") + '</b></div>')
            for k in el: concept_html.append(LH.tostring(k, encoding="unicode", with_tail=False))
            continue
        if mode == "c" and el.tag == "div" and any(c in (el.get("class") or "") for c in ["why", "concept", "one", "say"]):
            concept_html.append(LH.tostring(el, encoding="unicode"))
        elif mode in ("b", "a") and el.tag == "div" and "extra" in (el.get("class") or "").split():
            # 보충(div.extra): 문제 사이에 끼는 개념 장 — 자리 그대로
            q_index += 1
            slides.append({"id": f"p{pi}-x{q_index}", "type": "concept", "part": pi, "title": el.get("data-title") or "보충",
                           "html": "".join(LH.tostring(x, encoding="unicode") for x in el)})
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
            q_exam = list(pending_exam); pending_exam = []
            for a in el.xpath('./aside[contains(@class,"exam")]'):
                q_exam.append({"level": a.get("data-level") or "강조", "when": a.get("data-when") or "", "quote": a.text_content().strip()})
            body = [x for x in body if not (x.startswith("<aside") and 'class="exam' in x[:40])]
            slides.append({"id": f"p{pi}-{'b' if mode=='b' else 'a'}{q_index}", "type": "q", "part": pi, "kind": "기초" if mode == "b" else "응용",
                           "qn": qn, "html": "".join(body), "ans": inner(ans[0]) if ans else "", "choices": choices, "exam": q_exam})
    # 개념 슬라이드는 표지 바로 뒤에 삽입
    cover_idx = next(i for i, s in enumerate(slides) if s["id"] == f"p{pi}-cover")
    # V4-SPLIT: 개념 장을 글자량으로 나눈다 (한 장 ≈ 420자, 표·수식 블록은 무겁게 셈)
    import re as _re
    def _weight(h):
        t = _re.sub(r"<[^>]+>", "", h)
        # 수식 소스는 글자 수 대신 고정 무게: 인라인 12, 디스플레이 60 (행렬은 아래서 따로 가산)
        n_inl = len(_re.findall(r"\\\(.*?\\\)", t, _re.S)); n_disp = len(_re.findall(r"\\\[.*?\\\]", t, _re.S))
        t2 = _re.sub(r"\\\(.*?\\\)", "", t, flags=_re.S); t2 = _re.sub(r"\\\[.*?\\\]", "", t2, flags=_re.S)
        w = len(t2) + 12 * n_inl + 60 * n_disp
        w += 140 * h.count("<table")            # 표
        w += 40 * h.count("\\begin{pmatrix}") + 40 * h.count("\\begin{vmatrix}")   # 행렬(세로로 큼)
        w += 12 * h.count("<tr")
        w += 26 * h.count("<li") + 22 * h.count("<br") + 30 * h.count(chr(10))   # 줄 수(목록·줄바꿈·코드 줄)
        return w
    _chunks = []
    for h in concept_html:
        # div.concept 안의 자식(p, 표, 수식 블록)을 낱개로 풀어 잘게 나눈다
        if h.startswith('<div class="concept"'):
            frag = LH.fragment_fromstring(h)
            kids = []
            if frag.text and frag.text.strip(): kids.append(frag.text)
            for k in frag:
                if k.tag in ("ul", "ol") and len(k) > 1:
                    for li in k:
                        kids.append("<" + k.tag + ">" + LH.tostring(li, encoding="unicode", with_tail=False) + "</" + k.tag + ">")
                else:
                    kids.append(LH.tostring(k, encoding="unicode", with_tail=False))
                if k.tail and k.tail.strip(): kids.append(k.tail)
            for k in kids: _chunks.append(('<div class="concept">' + k + '</div>'))
        else:
            _chunks.append(h)
    LIMIT = 440
    for _a in sys.argv:
        if _a.startswith('--limit='): LIMIT = int(_a.split('=')[1])
    exam_pages = []
    if len(concept_exam) >= 3:   # 시험 언급이 많으면 전용 장(2개씩)으로 앞에 낸다
        exam_pages = [concept_exam[i:i+2] for i in range(0, len(concept_exam), 2)]
        concept_exam = []
    pages, cur, cw = [], [], 170 * len(concept_exam)   # 첫 장에 붙는 시험 언급 상자 무게
    for h in _chunks:
        w = _weight(h)
        if cur and cw + w > LIMIT:
            pages.append(cur); cur, cw = [], 0
        cur.append(h); cw += w
    if cur: pages.append(cur)
    if not pages: pages = [[]]
    _title = concept_head if 'concept_head' in dir() else "개념"
    for k, ex in enumerate(exam_pages):
        slides.insert(cover_idx + 1 + k, {"id": f"p{pi}-exam-{k+1}", "type": "concept", "part": pi, "title": "시험 언급 (" + str(k+1) + "/" + str(len(exam_pages)) + ")", "html": "", "exam": ex})
    cover_idx += len(exam_pages)
    for k, pg in enumerate(pages):
        slides.insert(cover_idx + 1 + k, {"id": f"p{pi}-concept" + ("" if k == 0 else f"-{k+1}"), "type": "concept", "part": pi,
                       "title": _title + ("" if len(pages) == 1 else f" ({k+1}/{len(pages)})"), "html": "".join(pg), "exam": concept_exam if k == 0 else []})
    cover_idx += len(pages) - 1
    # 암기 vs 이해 (div.mu) — 개념 바로 뒤 한 장
    mu = sec.xpath('./div[@class="mu"]')
    if mu:
        mem = [inner(li) for li in mu[0].xpath('./div[@class="mu-mem"]/ul/li')]
        und = [inner(li) for li in mu[0].xpath('./div[@class="mu-und"]/ul/li')]
        slides.insert(cover_idx + 2, {"id": f"p{pi}-mu", "type": "mu", "part": pi, "title": ptitle, "mem": mem, "und": und})
    slides.append({"id": f"p{pi}-result", "type": "result", "part": pi, "title": ptitle})
slides.append({"id": "final", "type": "final"})

# 진도 목차 (0절 표)
# 일차별 진도 목차는 덱에 넣지 않는다 — 과목 페이지 회차 표가 그 역할 (아토 2026-09-17)
slides.insert(0, {"id": "jump", "type": "jump", "part": 0})
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
    for sl in slides:   # 암기/이해 장·분할된 개념 장은 개념 장과 같은 출처
        if (sl["type"] == "mu" or (sl["type"] == "concept" and "-concept-" in sl["id"])) and "src" not in sl and f"p{sl['part']}-concept" in by_id and "src" in by_id[f"p{sl['part']}-concept"]:
            sl["src"] = by_id[f"p{sl['part']}-concept"]["src"]
    print("출처 발췌", n_img, "장 →", out_dir)

def _hint(sec):
    one = sec.xpath('./div[@class="one"]')
    return one[0].text_content().strip() if one else ""
parts_meta = [{"n": i, "title": p.xpath('./h2')[0].text_content().replace(p.xpath('./h2/span[@class="no"]/text()')[0], "").strip(), "hint": _hint(p)} for i, p in enumerate(parts, 1)]

tpl = io.open(__file__.replace("build_slides.py", "slides_tpl.html"), encoding="utf-8").read()
page = tpl.replace("__TITLE__", title).replace("__DECK_ID__", deck_id).replace("__SLIDES__", json.dumps(slides, ensure_ascii=False)).replace("__PARTS__", json.dumps(parts_meta, ensure_ascii=False))
io.open(out, "w", encoding="utf-8", newline="\n").write(page)
print("slides", len(slides), "→", out)

# V4-GATE: 실제 배치 검사 — 헤드리스 크롬으로 #check 모드 실행, 실패 0이어야 통과 (지침 §0 "1건이라도 걸리면 실패")
if "--no-check" not in sys.argv:
    import subprocess, tempfile, glob, html as _html
    chrome = None
    for c in [r"C:\Program Files\Google\Chrome\Application\chrome.exe", r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"]:
        if os.path.exists(c): chrome = c; break
    if not chrome:
        print("검사 건너뜀: 크롬 없음"); sys.exit(0)
    url = "file:///" + os.path.abspath(out).replace("\\", "/") + "#check"
    prof = os.path.join(tempfile.gettempdir(), "pdfprof_chk_%d" % os.getpid())
    r = subprocess.run([chrome, "--headless=new", "--disable-gpu", "--virtual-time-budget=40000", "--window-size=1024,768",
                        "--user-data-dir=" + prof, "--dump-dom", url], capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=180)
    dom = r.stdout or ""
    m = re.search(r'id="chkTitle">검사: (\d+)장 · 실패 (\d+)</h2><pre id="chkList">(.*?)</pre>', dom, re.S)
    if not m:
        print("검사 결과를 못 읽음 — 크롬 출력 확인 필요"); sys.exit(1)
    n, bad, lst = int(m.group(1)), int(m.group(2)), _html.unescape(m.group(3)).strip()
    print("배치 검사(1024×768):", n, "장 · 실패", bad)
    if bad and "--soft" in sys.argv:
        ids = set(l.split(" ")[0] for l in lst.splitlines() if l.strip())
        for sl in slides:
            if sl["id"] in ids: sl["scroll"] = True
        page2 = tpl.replace("__TITLE__", title).replace("__DECK_ID__", deck_id).replace("__SLIDES__", json.dumps(slides, ensure_ascii=False)).replace("__PARTS__", json.dumps(parts_meta, ensure_ascii=False))
        io.open(out, "w", encoding="utf-8", newline="\n").write(page2)
        print("--soft: 넘친 " + str(len(ids)) + "장을 스크롤 허용으로 표시하고 통과 (임시 덱)"); sys.exit(0)
    if bad:
        print(lst); print("빌드 실패 — 넘치는 장은 정리노트에서 나누거나 build 분할 기준을 낮춰라."); sys.exit(1)

