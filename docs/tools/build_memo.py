# -*- coding: utf-8 -*-
"""암기노트 빌더(대표님 2026-09-29 「무조건 암기해야 하는 것, 이해해야 하는 것 구분 · 암기노트 따로」) — 과목마다 notes/memo/<약칭>.html
원본 = 회차 수업 노트 원문(study-materials/<과목>/_수업노트/<날짜>.html, 원본은 한 곳): 섹션마다
  · 공식 상자(div.formula) → 공식 항목 하나
  · 「외울 것」 정리 상자(div.memo 첫 <b>외울 것</b>) → 「 · 」로 나눈 항목들(식 안의 · 는 나누지 않는다)
항목 = 앞말(= · : · — 앞)과 답(뒤). 가리기 모드에서는 답만 흐리게, 누르면 보인다. ✓ = 외움(기기 저장 mc-memo-<약칭>) → 스앵님 판정 기록(memo).
사용: python build_memo.py            (lessons.json 의 과목 전부)"""
import io, os, re, sys, json, datetime
from xml.sax.saxutils import escape
from lxml import html as LH
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
SM = os.path.join(os.path.dirname(ROOT), "study-materials")
COURSE = {"phys2": "일반물리학2", "statics": "정역학", "em1": "공업수학1", "calc2": "미분적분학2", "cadd": "CADD", "writing": "아카데믹글쓰기"}
DAY = "일월화수목금토"

def inner(el):
    s = escape(el.text or "")
    for ch in el: s += LH.tostring(ch, encoding="unicode", with_tail=True)
    return s.strip()

def split_top(html, sep=" · "):
    """식(\\( \\) · \\[ \\]) · 태그 · 괄호 밖의 sep 로만 나눈다 — 「근호 정리(√9 → 3)」가 괄호 안 → 에서 갈렸다(2026-09-29)"""
    out, buf, i, depth, tag, par, opened = [], "", 0, 0, False, 0, 0
    while i < len(html):
        if html.startswith("\\(", i) or html.startswith("\\[", i): depth += 1; buf += html[i:i + 2]; i += 2; continue
        if html.startswith("\\)", i) or html.startswith("\\]", i): depth = max(0, depth - 1); buf += html[i:i + 2]; i += 2; continue
        c = html[i]
        if c == "<":
            tag = True
            # 열린 요소(<b>…</b>) 안에서는 나누지 않는다 — 「<b>A = B · C = D</b>」가 닫히지 않은 두 조각으로 갈렸다(오타 .91 설계 검수 ⑤)
            m = re.match(r"<(/?)([A-Za-z][A-Za-z0-9]*)", html[i:])
            if m and m.group(2).lower() not in ("br", "img", "hr", "wbr", "input"):
                if m.group(1): opened = max(0, opened - 1)
                else:
                    end = html.find(">", i)
                    if not (end > 0 and html[end - 1] == "/"): opened += 1
        elif c == ">": tag = False
        elif not depth and not tag and c in "(（「": par += 1
        elif not depth and not tag and c in ")）」": par = max(0, par - 1)
        if not depth and not tag and not par and not opened and html.startswith(sep, i): out.append(buf); buf = ""; i += len(sep); continue
        buf += c; i += 1
    out.append(buf)
    return [x.strip() for x in out if x.strip()]

def key_ans(h):
    """「앞말 = 답」 · 「앞말 : 답」 · 「앞말 — 답」 — 식·태그 밖의 첫 구분자. 없으면 전체가 답"""
    for sep in (" = ", " : ", " — ", " → "):
        parts = split_top(h, sep)
        if len(parts) >= 2 and 1 <= len(re.sub(r"<[^>]+>", "", parts[0])) <= 40:
            return parts[0], sep.strip(), sep.join(parts[1:])
    return "", "", h

def build_course(slug, reg, nodes):
    cn = COURSE[slug]; lessons = []
    for date in sorted(reg.get(cn) or {}):
        src = os.path.join(SM, cn, "_수업노트", f"{date}.html")
        if not os.path.exists(src): continue
        doc = LH.fromstring(io.open(src, encoding="utf-8").read())
        h1 = doc.xpath("//header//h1"); title = h1[0].text_content().strip() if h1 else date
        lid = f"{slug}-{date}"; sec_nodes = ((nodes.get(lid) or {}).get("sec") or {})
        chs = []
        for i, sec in enumerate(doc.xpath('//section[contains(concat(" ",normalize-space(@class)," ")," s ")]'), 1):
            sid = sec.get("data-id") or f"s{i}"
            h2 = sec.xpath("./h2"); ct = re.sub(r"^\d+[.)]\s*", "", h2[0].text_content().strip()) if h2 else f"챕터 {i}"
            items = []
            for el in sec.xpath('.//div[contains(concat(" ",normalize-space(@class)," ")," formula ") or contains(concat(" ",normalize-space(@class)," ")," memo ")]'):
                cls = (el.get("class") or "").split()
                if "formula" in cls:
                    items.append({"t": "f", "a": inner(el)})
                else:
                    b = el.xpath("./b[1]")
                    if not (b and not (el.text or "").strip() and b[0].text_content().strip() == "외울 것"): continue
                    rest = (b[0].tail or "").lstrip(" :：·—-")
                    for ch in list(el)[1:]: rest += LH.tostring(ch, encoding="unicode", with_tail=True)
                    parts = []
                    for part in split_top(escape(rest) if "<" not in rest and "&" not in rest else rest):
                        # 짧은 조각(글자 8자 미만, 식 제외)은 앞 항목에 붙인다 — 「행 m · 열 n」이 「열 n」 한 항목으로 떨어졌다(2026-09-29 캡처)
                        vis = re.sub(r"\\\(.*?\\\)|<[^>]+>", "", part).strip()
                        if parts and len(vis) < 8 and "\\(" not in part: parts[-1] += " · " + part
                        else: parts.append(part)
                    for part in parts:
                        # 외울 것이 아닌 안내(다음 회차 예고 · 할 일 · 연습 지시)는 암기노트에 넣지 않는다
                        if re.match(r"(다음\s*[(（:·]|다음 \d|다음 시간|할 일|연습\s*[:：]|주말 연습|학습지 Ex|\d+주차 과제|과제\s*\d)", re.sub(r"<[^>]+>", "", part).strip()): continue
                        k, sep, a = key_ans(part)
                        items.append({"t": "m", "k": k, "s": sep, "a": a})
            for n, it in enumerate(items, 1): it["id"] = f"{date}-{sid}-{n}"
            if items: chs.append({"sid": sid, "title": ct, "n": sec_nodes.get(sid) or [], "items": items})
        if chs:
            d = datetime.date.fromisoformat(date); wk = ((d - datetime.date(2026, 8, 30)).days // 7) + 1
            lessons.append({"date": date, "label": f"{d.month}/{d.day}({DAY[(d.weekday() + 1) % 7]}) · {wk}주차", "title": title, "chs": chs,
                            "classroom": f"../classroom/{slug}/{date}.html"})
    return lessons

def main():
    reg = json.load(io.open(os.path.join(ROOT, "knowledge", "lessons.json"), encoding="utf-8"))["courses"]
    lnp = os.path.join(ROOT, "knowledge", "lesson_nodes.json")
    nodes = (json.load(io.open(lnp, encoding="utf-8")).get("lessons") or {}) if os.path.exists(lnp) else {}
    tpl = io.open(os.path.join(HERE, "memo_tpl.html"), encoding="utf-8").read()
    judge = io.open(os.path.join(HERE, "tutor_judge.js"), encoding="utf-8").read().replace("</", "<\\/")
    out_dir = os.path.join(ROOT, "notes", "memo"); os.makedirs(out_dir, exist_ok=True)
    for slug, cn in COURSE.items():
        if cn not in reg: continue
        L = build_course(slug, reg, nodes)
        if not L: continue
        n = sum(len(c["items"]) for l in L for c in l["chs"])
        data = {"slug": slug, "course": cn, "lessons": L}
        splittex = io.open(os.path.join(HERE, "split_tex.js"), encoding="utf-8").read().replace("</", "<\\/")   # 이은 식 → 식마다 한 줄
        page = (tpl.replace("__JUDGE__", judge).replace("__SPLITTEX__", splittex).replace("__TITLE__", f"{cn} · 암기노트").replace("__COURSE__", cn)
                   .replace("__DATA__", json.dumps(data, ensure_ascii=False).replace("</", "<\\/")))
        io.open(os.path.join(out_dir, f"{slug}.html"), "w", encoding="utf-8", newline="\n").write(page)
        print(f"암기노트 {slug}: 회차 {len(L)} · 항목 {n} → notes/memo/{slug}.html")

if __name__ == "__main__":
    main()
