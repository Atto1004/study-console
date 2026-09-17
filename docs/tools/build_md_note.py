# -*- coding: utf-8 -*-
"""임시 정리노트 생성기: 과목 폴더의 회차 정리.md(7섹션)를 v2 노트 HTML(파트 = 회차, 개념 장만)로 바꾼다. 문제는 없다.
사용: python build_md_note.py <과목 폴더> <out.html> <노트 제목>
우선순위(지침 §14): ② 판서 → ③ 녹음 → ④ 강의자료 → ⑤ 필기 → ① 교재. ⑥ 시험 언급 → aside.exam. ⑦ 과제는 뺀다."""
import io, os, re, sys, glob, html

src_dir, out, title = sys.argv[1], sys.argv[2], sys.argv[3]
BS = chr(92)

def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"(?<!\*)\*(?!\*)([^*]+)\*(?!\*)", r"<i>\1</i>", t)
    t = t.replace("★", '<span class="star">★</span>')
    return t

def md_block(lines):
    """마크다운 줄 목록 → HTML. 문단·불릿·번호·표·코드펜스·#### 소제목."""
    out, i, n = [], 0, len(lines)
    while i < n:
        ln = lines[i]
        if ln.strip().startswith("```"):
            j = i + 1; buf = []
            while j < n and not lines[j].strip().startswith("```"): buf.append(lines[j]); j += 1
            for k0 in range(0, len(buf), 6):   # 코드펜스는 6줄씩 잘라 장 분할이 되게
                out.append("<pre>" + html.escape("\n".join(buf[k0:k0 + 6])) + "</pre>")
            i = j + 1; continue
        if ln.startswith("|") and i + 1 < n and re.match(r"^\|[\s:|-]+\|?$", lines[i + 1].strip()):
            hdr = [c.strip() for c in ln.strip().strip("|").split("|")]
            rows = []; j = i + 2
            while j < n and lines[j].startswith("|"): rows.append([c.strip() for c in lines[j].strip().strip("|").split("|")]); j += 1
            for r0 in range(0, len(rows), 2):   # 표는 2행씩 쪼개 장 분할이 되게(머리글 반복)
                out.append('<div class="tw"><table><thead><tr>' + "".join("<th>" + inline(h) + "</th>" for h in hdr) + "</tr></thead><tbody>" +
                           "".join("<tr>" + "".join("<td>" + inline(c) + "</td>" for c in r) + "</tr>" for r in rows[r0:r0 + 2]) + "</tbody></table></div>")
            i = j; continue
        m = re.match(r"^(#{3,6})\s+(.*)", ln)
        if m:
            out.append("<p><b>" + inline(m.group(2)) + "</b></p>"); i += 1; continue
        if re.match(r"^\s*[-*]\s+", ln) or re.match(r"^\s*\d+[.)]\s+", ln):
            items = []; j = i
            while j < n and (re.match(r"^\s*[-*]\s+", lines[j]) or re.match(r"^\s*\d+[.)]\s+", lines[j]) or (lines[j].startswith("  ") and items)):
                s2 = lines[j]
                if re.match(r"^\s*[-*]\s+", s2) or re.match(r"^\s*\d+[.)]\s+", s2):
                    items.append(re.sub(r"^\s*([-*]|\d+[.)])\s+", "", s2))
                else:
                    items[-1] += " " + s2.strip()
                j += 1
            out.append("<ul>" + "".join("<li>" + inline(x) + "</li>" for x in items) + "</ul>"); i = j; continue
        if ln.strip() == "" or ln.strip() == "---":
            i += 1; continue
        # 문단(연속 줄 합침)
        buf = [ln.strip()]; j = i + 1
        while j < n and lines[j].strip() and not re.match(r"^(#{1,6}\s|[-*]\s|\d+[.)]\s|\||```)", lines[j].strip()): buf.append(lines[j].strip()); j += 1
        out.append("<p>" + inline(" ".join(buf)) + "</p>"); i = j
    return "\n".join(out)

def split_sections(text):
    """## 로 시작하는 절로 나눈다 → [(제목, 줄들)]"""
    secs, cur, buf = [], None, []
    for ln in text.split("\n"):
        if ln.startswith("## "):
            if cur is not None: secs.append((cur, buf))
            cur, buf = ln[3:].strip(), []
        else:
            buf.append(ln)
    if cur is not None: secs.append((cur, buf))
    return secs

ORDER = ["②", "③", "④", "⑤", "①"]
parts = []
for d in sorted(glob.glob(os.path.join(src_dir, "2026-*"))):
    f = os.path.join(d, "정리.md")
    if not os.path.exists(f) or os.path.getsize(f) < 1500: continue
    text = io.open(f, encoding="utf-8").read()
    h1 = next((l[2:] for l in text.split("\n") if l.startswith("# ")), os.path.basename(d))
    date = os.path.basename(d)
    md = re.search(r"(\d{4})-(\d{2})-(\d{2})", date); mdl = f"{int(md.group(2))}/{int(md.group(3))}"
    ptitle = re.sub(r"^.*?\d{4}-\d{2}-\d{2}\s*\([^)]*\)\s*·\s*", "", h1)
    ptitle = re.sub(r"^\d+주차[^·]*·\s*", "", ptitle).strip() or h1
    head = "\n".join(text.split("\n")[1:12])
    prog = re.search(r"진도[:：]\s*\**(.+?)\**\s*$", head, re.M)
    secs = split_sections(text)
    byk = {}
    for t, ls in secs:
        k = t[:1]
        byk.setdefault(k, []).append((t, ls))
    blocks, exams = [], []
    for k in ORDER:
        for t, ls in byk.get(k, []):
            body = md_block(ls).strip()
            if not body or re.search(r"(미보유|없음)\s*$", t) and len(body) < 40: continue
            blocks.append('<div class="concept"><p><b>' + inline(t) + '</b></p>' + body + '</div>')
    for t, ls in byk.get("⑥", []):
        for ln in ls:
            m = re.match(r"^\s*[-*]\s+(.*)", ln)
            if m and len(m.group(1)) > 6 and not re.search(r"없음|미확인", m.group(1)):
                exams.append(re.sub(r"\*\*|`", "", m.group(1)))
    parts.append({"no": f"파트 {len(parts)+1} · {mdl}", "title": ptitle, "date": date, "blocks": blocks, "exams": exams,
                  "one": ("한 줄: " + re.sub(r"\*\*", "", prog.group(1))) if prog else "한 줄: 이 회차 정리를 읽고 다음으로."})

CSS = ".concept{border:2px solid #1971C2;padding:8px 12px;margin:8px 0}.why{background:#eef;padding:8px 12px}.one{border-left:4px solid #333;background:#f5f5f5;padding:8px 12px;margin:8px 0}.star{color:#FF4D8D}.exam{display:block;border:4px solid #FF4D8D;padding:8px 12px;margin:8px 0}pre{white-space:pre-wrap;font-size:.85em}table{border-collapse:collapse}td,th{border-top:1px solid #ddd;padding:3px 8px}"
h = ['<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>' + html.escape(title) + '</title><style>' + CSS + '</style></head><body>',
     '<h1>' + html.escape(title) + '</h1><p class="say">임시 정리(자동 변환). 회차 정리.md의 판서·녹음·강의자료·필기·교재 절을 그대로 옮겼다. 문제는 아직 없다.</p>']
for p in parts:
    h.append('<section>\n  <h2><span class="no">' + p["no"] + '</span>' + html.escape(p["title"]) + '</h2>')
    h.append('  <h3><span class="tag c">개념</span>' + html.escape(p["title"]) + '</h3>')
    for e in p["exams"]: h.append('  <aside class="exam" data-level="강조" data-when="' + p["date"][5:].replace("-", "/") + '">' + inline(e) + '</aside>')
    h.extend("  " + b for b in p["blocks"])
    h.append('  <div class="one">' + inline(p["one"]) + '</div>')
    h.append('</section>')
h.append('</body></html>')
io.open(out, "w", encoding="utf-8", newline="\n").write("\n".join(h))
print("parts", len(parts), "→", out)
