# -*- coding: utf-8 -*-
"""공업수학1 중간고사 범위 자료 — 대표님 2026-10-02 「각 주차별 진도 내용에 클로바노트 교수님 설명 내용 + 교수님 칠판 판서 대입해서
중간고사 시험범위 자료 뽑아줘, 최대한 양식 유지해서」.

뼈대 = 대표님이 올린 범위 PDF(교수 슬라이드 1장~3.3, 105쪽, 720×540pt) 그대로. 그 사이사이에 같은 크기·같은 슬라이드 양식(명조 제목 24pt ·
빨강 ● 글머리 · 오른쪽 아래 원 장식)으로 「교수님 설명(녹음) · ★ 시험 언급 · 칠판 판서 사진」 쪽을 끼운다.
내용 원본 = study-materials/공업수학1/_정리노트/중간범위_수업기록/<날짜>.json (정리.md + 클로바 녹음 + 판서 사진에서 뽑은 것).
사진 = 그 날짜 폴더의 판서_/자료_/과제_ 만(중복_·미분류사진_ 제외) + face_guard(셀카 크기 얼굴 제외).
출력 = study-materials/공업수학1/_정리노트/공업수학1_중간고사범위_슬라이드+수업기록.pdf (+ iCloudDrive\\학교 복사는 --icloud)
사용: python docs/tools/build_em1_range_notes.py [--icloud]"""
import io, os, sys, json, glob, html, subprocess, tempfile, shutil, re
import pymupdf
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EM1 = os.path.join(os.path.dirname(ROOT), "study-materials", "공업수학1")
SRC = os.path.join(EM1, "_강의자료", "중간고사범위_슬라이드1장-3.3_회차태그_105p.pdf")
REC = os.path.join(EM1, "_정리노트", "중간범위_수업기록")
OUT = os.path.join(EM1, "_정리노트", "공업수학1_중간고사범위_슬라이드+수업기록.pdf")
ICLOUD = r"C:\Users\user\iCloudDrive\학교"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
FACE_PY = r"C:\Users\user\본사\atom\.venv-face\Scripts\python.exe"
SESS = [  # 날짜, 라벨, 범위 PDF 쪽(대표님 회차 표시 기준), 진도
 ("2026-09-02", "1주차 수 9/2", "p.1~9", "1.1 기본개념 · 모델화 (결석)"),
 ("2026-09-04", "1주차 금 9/4", "p.10~20", "1.1 해 · 초기값 문제 → 1.3 변수분리형 · 동차형"),
 ("2026-09-09", "2주차 수 9/9", "p.21~28", "1.4 완전미분방정식 · 적분인자 (결석)"),
 ("2026-09-11", "2주차 금 9/11", "p.29~34", "1.4 정정 → 1.5 선형 ODE · RL 회로"),
 ("2026-09-16", "3주차 수 9/16", "p.35~46", "베르누이 → 1장 해법 정리 → 2.1 2계 선형 · 차수축소법"),
 ("2026-09-18", "3주차 금 9/18", "p.47~57", "2.2 상수계수 · 2.3 미분연산자 · 2.4 자유진동 (결석)"),
 ("2026-09-23", "4주차 수 9/23", "p.58~65", "2.5 오일러-코시 → 2.6 론스키안"),
 ("2026-09-30", "5주차 수 9/30", "p.66~75", "2.7 미정계수법 → 2.8 강제진동 · 공진"),
 ("2026-10-02", "6주차 금 10/2", "p.76~90", "2.9 전기회로 → 2.10 매개변수변환법 → 3.1 시작"),
 ("2026-10-07", "7주차 수 10/7", "p.91~105", "3.1 이어서 → 3.2 → 3.3 (예정)"),
]
e = html.escape

# 대표님 10/2 「시험에 나온다고 언급한 거는 형광펜, 빨간 펜, 별표, 교수님이 시험에 나온다고 하심 같은 것들로 표시」
# (범위 PDF 쪽, 형광펜 칠할 슬라이드 글자, 등급, 빨간 펜 메모) — 근거 = 회차 정리.md ⑥ · 녹음 원문(인용은 「」 그대로)
# 등급: exam = ★★ 교수님: 시험에 나온다 · memo = ★ 교수님: 꼭 외울 것 · emph = 교수님 강조 · note = 메모만(형광펜 없음)
MARKS = [
 (26, ["정리1)", "정리2)"], "memo", "9/16 「수학도 일정 부분은 외워야 돼요」 — 적분인자 정리 1·2"),
 (31, ["비제차미분방정식의해법"], "memo", "9/11 해 공식 y = e^(−h)[∫e^h·r dx + c] — 두 번 반복, 외울 것"),
 (32, [], "note", "9/11 「특수한 함수 적분은 시험에 나오면 공식을 알려줄 거예요」"),
 (35, ["Bernoulli Equation"], "memo", "9/16 외울 것 — 베르누이 치환 u = y^(1−a)"),
 (41, ["단, 이정리는비제차선형방정식또는비선형방정식에서는성립하지않는다."], "emph", "9/16 교재 빨간 글씨 — 제차 선형에만 성립(반례와 함께 강조)"),
 (43, ["일차독립(Linearly Independent)"], "emph", "9/16 교수님 정정 — 비례하면 종속, 아니면 독립"),
 (58, ["보조방정식:"], "memo", "9/23 「이거 한 바닥에 있는 거는 외워야 된다」 · 보조방정식 m² + (a−1)m + b 「이거 주의해야 된다」"),
 (61, ["Ex. 1 오일러-코시방정식"], "exam", "9/23 「시험 볼 때는 오일러-코시 방정식이라고 주어지지 않아요」 — 꼴을 보고 알아볼 것"),
 (62, ["예제) 다음오일러-코시방정식의해를구하시오."], "exam", "9/23 「중간고사 볼 때도 풀이 과정이 다 있어야 돼 … 없으면 점수를 안 줘요」"),
 (64, ["정리2) 해의일차종속과일차독립"], "emph", "9/23 「정리 2는 상당히 중요한 정리」 — 증명은 안 함"),
 (67, ["표2.1 미정계수방법"], "memo", "9/30 「표 2.1, 이거는 여러분들이 알아야 돼요. 꼭 알아야 돼요」"),
 (68, ["변형규칙(Modification Rule)", "미정계수법에대한선택규칙"], "exam", "9/30 변형 규칙 「굉장히 시험이 잘 나와요」 · 선택 규칙 세 가지 「이것도 알아야 돼요」"),
 (72, ["예제) 다음미분방정식의해를구하시오."], "exam", "9/30 「중간고사도 그냥 기본 규칙은 안 쓸 거예요」 → 변형 + 합 규칙 문제"),
]
MARK_HEAD = {"exam": "★★ 교수님: 시험에 나온다", "memo": "★ 교수님: 꼭 외울 것", "emph": "● 교수님 강조", "note": "✎ 교수님"}
FONT = r"C:\Windows\Fonts\malgunbd.ttf"
RED = (0.80, 0.08, 0.10)


def mark_page(pg, words, lvl, memo):
    """원본 슬라이드 위에 직접 그린다(주석 아님 — 어느 앱에서나 보이게)"""
    pg.insert_font(fontname="mk", fontfile=FONT)
    for w in words:
        hits = pg.search_for(w)
        if hits:
            y0 = hits[0].y0
            hits = [h for h in hits if abs(h.y0 - y0) < 40]  # 같은 문구(한두 줄)만 — 같은 글자가 다른 곳에 또 있으면 제외
        for i, r in enumerate(hits):
            box = pymupdf.Rect(r.x0 - 2, r.y0 - 1, r.x1 + 2, r.y1 + 1)
            pg.draw_rect(box, color=None, fill=(1.0, 0.92, 0.25), fill_opacity=0.45, overlay=True)
            if lvl == "exam":
                pg.draw_line(pymupdf.Point(box.x0, box.y1 + 1.5), pymupdf.Point(box.x1, box.y1 + 1.5), color=RED, width=1.6)
            if lvl in ("exam", "memo") and i == 0:
                pg.insert_text(pymupdf.Point(max(4, box.x0 - 17), box.y1 - 1), "★", fontname="mk", fontsize=14, color=RED)
    # 빨간 펜 메모 — 제목 위 여백(위 0~44pt)
    head = MARK_HEAD[lvl]
    rect = pymupdf.Rect(286, 3, 714, 37)
    pg.draw_rect(rect, color=RED, width=1.2, fill=(1, 1, 1), fill_opacity=0.92, overlay=True, radius=0.12)
    pg.insert_textbox(pymupdf.Rect(rect.x0 + 6, rect.y0 + 3, rect.x1 - 4, rect.y1), head + "  " + memo,
                      fontname="mk", fontsize=8.6, color=RED, align=0)


def slide_title(doc, p):
    t = doc[p - 1].get_text()
    for line in t.splitlines():
        line = line.strip()
        if re.match(r"^\d\.\d{1,2}\s*(?:\d계)?[가-힣]", line):
            return line
    return ""


def prep_photo(date, fn, tmp):
    src = os.path.join(EM1, date, fn)
    if not os.path.exists(src):
        return None
    dst = os.path.join(tmp, "ph", date + "_" + re.sub(r"[^\w.-]", "_", os.path.splitext(fn)[0]) + ".jpg")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    im.thumbnail((1100, 1100))
    im.save(dst, "JPEG", quality=72)
    return dst


CSS = r"""
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap');
@page{size:720pt 540pt;margin:0}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:'Noto Serif KR','Batang',serif;color:#111;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:720pt;height:540pt;position:relative;overflow:hidden;page-break-after:always;background:#fff}
.pg:last-child{page-break-after:auto}
.orn{position:absolute;right:22pt;bottom:18pt;width:26pt;height:26pt;border-radius:50%;background:radial-gradient(circle at 40% 40%,#D9542F,#A5301E 70%);box-shadow:0 0 0 2pt #fff,0 0 0 3pt #B8442A}
.ttl{position:absolute;left:46pt;top:34pt;right:40pt;display:flex;align-items:baseline;gap:12pt}
.ttl h1{margin:0;font-size:24pt;font-weight:400;letter-spacing:.5pt;white-space:nowrap}
.tag{margin-left:auto;font-family:'Noto Sans KR',sans-serif;font-size:9.5pt;font-weight:700;color:#fff;background:#A5301E;border-radius:3pt;padding:3pt 8pt;white-space:nowrap}
.tag.abs{background:#7a7a7a}
.sub{position:absolute;left:46pt;top:72pt;right:40pt;font-size:13pt;font-weight:600;color:#222}
.body{position:absolute;left:46pt;top:98pt;right:40pt;bottom:52pt;display:flex;gap:16pt}
.col{flex:1;min-width:0;display:flex;flex-direction:column;gap:8pt}
.ex{margin:0;padding:0;list-style:none}
.ex li{position:relative;padding-left:16pt;margin:0 0 5pt;font-size:var(--fs,13pt);line-height:1.42}
.ex li::before{content:"";position:absolute;left:1pt;top:.5em;width:7pt;height:7pt;border-radius:50%;background:#A5301E}
.exam{border:1.8pt solid #CC141A;background:linear-gradient(transparent 0,#FFF6B0 0);border-radius:4pt;padding:6pt 9pt;box-shadow:2pt 2pt 0 rgba(204,20,26,.18)}
.exam b{display:block;font-family:'Noto Sans KR',sans-serif;font-size:10pt;color:#CC141A;margin-bottom:2pt}
.exam div{font-size:calc(var(--fs,13pt) - 1pt);line-height:1.4}
.note{font-family:'Noto Sans KR',sans-serif;font-size:10.5pt;color:#555;border-left:3pt solid #999;padding:2pt 8pt}
.ph{flex:0 0 46%;display:flex;flex-direction:column;gap:6pt;min-height:0}
.ph figure{margin:0;flex:1;min-height:0;display:flex;flex-direction:column;border:.8pt solid #ccc;border-radius:3pt;overflow:hidden;background:#f6f6f6}
.ph img{flex:1;min-height:0;width:100%;object-fit:contain;background:#fff}
.ph figcaption{font-family:'Noto Sans KR',sans-serif;font-size:8.5pt;color:#333;padding:2pt 5pt;background:#fafafa;border-top:.6pt solid #ddd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.grid{position:absolute;left:46pt;top:80pt;right:40pt;bottom:50pt;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:8pt}
.grid figure{margin:0;display:flex;flex-direction:column;border:.8pt solid #ccc;border-radius:3pt;overflow:hidden;min-height:0}
.grid img{flex:1;min-height:0;width:100%;object-fit:contain;background:#fff}
.grid figcaption{font-family:'Noto Sans KR',sans-serif;font-size:8.5pt;padding:2pt 5pt;background:#fafafa;border-top:.6pt solid #ddd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
table.ss{border-collapse:collapse;width:100%;font-size:calc(var(--fs,13pt) - 2.5pt)}
table.ss th,table.ss td{border-bottom:.8pt solid #bbb;padding:3pt 5pt;text-align:left;vertical-align:top}
table.ss th{font-family:'Noto Sans KR',sans-serif;font-size:9.5pt;color:#555;border-bottom:1.4pt solid #111}
table.ss td.d{white-space:nowrap;font-weight:600}
.legend{font-family:'Noto Sans KR',sans-serif;font-size:9.5pt;color:#444;margin-top:10pt;line-height:1.6}
"""
FIT = r"""
<script>
document.fonts.ready.then(function(){
  document.querySelectorAll('.pg .col').forEach(function(c){
    var fs=13; c.style.setProperty('--fs',fs+'pt');
    while((c.scrollHeight>c.clientHeight+1)&&fs>9){ fs-=.5; c.style.setProperty('--fs',fs+'pt'); }
  });
  document.body.setAttribute('data-ready','1');
});
</script>"""


def page_block(title, tag, abs_, sub, explain, exam, note, photos):
    t = '<div class="pg"><div class="ttl"><h1>%s</h1><span class="tag%s">%s</span></div>' % (e(title), " abs" if abs_ else "", e(tag))
    if sub:
        t += '<div class="sub">%s</div>' % e(sub)
    col = ""
    if note:
        col += '<div class="note">%s</div>' % e(note)
    if explain:
        col += '<ul class="ex">' + "".join("<li>%s</li>" % e(x) for x in explain) + "</ul>"
    if exam:
        col += '<div class="exam"><b>★★ 교수님: 시험에 나온다고 하심</b>' + "".join("<div>%s</div>" % e(x) for x in exam) + "</div>"
    t += '<div class="body"><div class="col">%s</div>' % col
    if photos:
        t += '<div class="ph">' + "".join('<figure><img src="%s"><figcaption>%s</figcaption></figure>' % (p, e(c)) for p, c in photos) + "</div>"
    t += '</div><div class="orn"></div></div>'
    return t


def page_grid(title, tag, photos):
    n = len(photos)
    cols = "1fr" if n == 1 else "1fr 1fr"
    t = '<div class="pg"><div class="ttl"><h1>%s</h1><span class="tag">%s</span></div><div class="grid" style="grid-template-columns:%s">' % (e(title), e(tag), cols)
    t += "".join('<figure><img src="%s"><figcaption>%s</figcaption></figure>' % (p, e(c)) for p, c in photos)
    return t + '</div><div class="orn"></div></div>'


def main():
    doc = pymupdf.open(SRC)
    assert len(doc) == 105, len(doc)
    tmp = tempfile.mkdtemp(prefix="em1rng_")
    pages = []          # (after_page, html)  — after_page 0 = 표지 앞
    recs = {}
    for f in sorted(glob.glob(os.path.join(REC, "*.json"))):
        r = json.load(io.open(f, encoding="utf-8")); recs[r["date"]] = r
    # 사진 전처리 + 셀카 검사
    allph = {}
    for r in recs.values():
        for b in r.get("blocks", []):
            for ph in b.get("board", []):
                fn = ph["file"]
                if fn.startswith("중복_") or fn.startswith("미분류"):
                    continue
                p = prep_photo(r["date"], fn, tmp)
                if p: allph[(r["date"], fn)] = p
    bad = set()
    if allph:
        lst = os.path.join(tmp, "list.txt")
        io.open(lst, "w", encoding="utf-8").write("\n".join(allph.values()))
        try:
            out = subprocess.run([FACE_PY, os.path.join(ROOT, "docs", "tools", "face_guard.py"), lst], capture_output=True, encoding="utf-8", errors="replace", timeout=1800)
            if out.returncode != 0: raise RuntimeError(out.stderr[-300:])
            bad = {os.path.normcase(l.strip()) for l in out.stdout.splitlines() if l.strip()}
        except Exception as ex:
            print("셀카 검사 실패 → 사진 전부 뺌:", ex); bad = {os.path.normcase(p) for p in allph.values()}
    nph = 0; nbad = 0
    # 표지(맨 앞)
    rows = "".join('<tr><td class="d">%s</td><td>%s</td><td>%s</td><td>%s</td></tr>' % (
        e(lab), e(pp), e(prog), e("기록 %d쪽" % len(recs[d]["blocks"]) if d in recs else ("녹음 대기" if d <= "2026-10-02" else "예정")))
        for d, lab, pp, prog in SESS)
    cover = ('<div class="pg"><div class="ttl"><h1>공업수학1 중간고사 범위</h1><span class="tag">1장 ~ 3.3</span></div>'
             '<div class="sub">교수님 슬라이드(p.1~105) + 회차별 교수님 설명 · 칠판 판서</div>'
             '<div class="body"><div class="col"><table class="ss"><tr><th>회차</th><th>슬라이드</th><th>진도</th><th>수업 기록</th></tr>%s</table>'
             '<div class="legend">빨간 꼬리표 쪽 = 그날 교수님 설명(클로바 녹음) · ★ 시험 언급 · 칠판 판서 사진 — 해당 슬라이드 바로 뒤에 끼움.<br>'
             '회색 꼬리표 = 결석 회차(녹음·판서 없음, 슬라이드로 보강). 시험 10/16(금) 또는 10/21(수) · 10/14 정리 수업.</div></div></div><div class="orn"></div></div>') % rows
    pages.append((0, cover))
    for d, lab, pp, prog in SESS:
        r = recs.get(d)
        if not r:
            continue
        abs_ = r.get("status") == "결석"
        for b in sorted(r.get("blocks", []), key=lambda b: b["after_page"]):
            ap = int(b["after_page"]); assert 1 <= ap <= 105, (d, ap)
            title = slide_title(doc, ap) or b.get("title", "")
            title = re.sub(r"\s+", " ", title)[:28]
            tag = "교수님 설명 · %s%s" % (lab, (" · " + b["time"]) if b.get("time") else "")
            if abs_: tag = "결석 · %s · 슬라이드 보강" % lab
            phs = []
            for ph in b.get("board", []):
                p = allph.get((d, ph["file"]))
                if not p: continue
                if os.path.normcase(p) in bad: nbad += 1; continue
                phs.append((p, ph.get("caption", "")))
            nph += len(phs)
            sub = b.get("title", "")
            first, rest = phs[:2], phs[2:]
            pages.append((ap, page_block(title, tag, abs_, sub, b.get("explain", []), b.get("exam", []), r.get("note", "") if abs_ else "", first)))
            for k in range(0, len(rest), 4):
                pages.append((ap, page_grid(title, "칠판 판서 · %s" % lab, rest[k:k + 4])))
    # 10/2 녹음 대기 안내(기록 JSON 이 없을 때)
    if "2026-10-02" not in recs:
        pages.append((75, page_block("2.9 모델화: 전기회로", "6주차 금 10/2 · 녹음 변환 대기", True, "10/2 수업 기록 — 클로바 녹음 변환 · 판서 사진 수신 대기",
                                     [], [], "녹음이 들어오면 이 쪽을 교수님 설명으로 바꿔 다시 뽑는다.", [])))
    # 시험 표시 모아보기(표지 다음) — 최종 쪽 번호 계산: 앞쪽 2장 + 슬라이드 p 앞의 (슬라이드 + 끼움)
    cnt = {}
    for ap, _ in pages:
        if ap: cnt[ap] = cnt.get(ap, 0) + 1
    def final_page(p):
        return 2 + sum(1 + cnt.get(q, 0) for q in range(1, p)) + 1
    rows2 = "".join('<tr><td class="d">p.%d</td><td>%s</td><td style="color:#CC141A;font-weight:700;white-space:nowrap">%s</td><td>%s</td></tr>' % (
        final_page(p), e(re.sub(r"\s+", " ", next((slide_title(doc, q) for q in range(p, 0, -1) if slide_title(doc, q)), ""))[:14]), e(MARK_HEAD[l]), e(m)) for p, w, l, m in MARKS)
    summ = ('<div class="pg"><div class="ttl"><h1>★ 시험 표시 모아보기</h1><span class="tag">교수님 발언 기준</span></div>'
            '<div class="body"><div class="col"><table class="ss"><tr><th>쪽</th><th>슬라이드</th><th>표시</th><th>교수님 말씀</th></tr>%s</table>'
            '<div class="legend">슬라이드 위 노란 형광펜 = 해당 문구 · 빨간 ★ = 시험·암기 · 빨간 밑줄 = 「시험에 나온다」 직접 언급 · 맨 위 빨간 상자 = 교수님 말씀(날짜).</div>'
            '</div></div><div class="orn"></div></div>') % rows2
    pages.insert(1, (0, summ))
    # HTML → PDF
    htmlp = os.path.join(tmp, "ins.html")
    body = "".join(h for _, h in pages)
    io.open(htmlp, "w", encoding="utf-8").write('<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>%s</style></head><body>%s%s</body></html>' % (CSS, body, FIT))
    insp = os.path.join(tmp, "ins.pdf")
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--allow-file-access-from-files", "--no-pdf-header-footer",
                    "--virtual-time-budget=15000", "--run-all-compositor-stages-before-draw", "--print-to-pdf=" + insp, "file:///" + htmlp.replace("\\", "/")],
                   check=True, capture_output=True, timeout=300)
    ins = pymupdf.open(insp)
    assert len(ins) == len(pages), ("끼움 쪽 수 불일치 — 넘침", len(ins), len(pages))
    # 합치기
    out = pymupdf.open()
    idx = {}
    for i, (ap, _) in enumerate(pages):
        idx.setdefault(ap, []).append(i)
    for i in idx.get(0, []):
        out.insert_pdf(ins, from_page=i, to_page=i)
    toc = [[1, "표지 · 회차 목록", 1]]
    for p in range(1, 106):
        out.insert_pdf(doc, from_page=p - 1, to_page=p - 1)
        st = slide_title(doc, p)
        if st and (p == 1 or slide_title(doc, p - 1).split(" ")[0] != st.split(" ")[0]):
            toc.append([1, re.sub(r"\s+", " ", st)[:40], len(out)])
        for i in idx.get(p, []):
            out.insert_pdf(ins, from_page=i, to_page=i)
    toc.insert(1, [1, "★ 시험 표시 모아보기", 2])
    # 슬라이드 위 시험 표시
    spage = {}
    k = 0
    for i in range(len(out)):
        pass
    pos = len(idx.get(0, []))
    for p in range(1, 106):
        spage[p] = pos; pos += 1 + len(idx.get(p, []))
    for p, w, l, m in MARKS:
        mark_page(out[spage[p]], w, l, m)
    out.set_toc(toc)
    try:
        out.subset_fonts()  # 빨간 펜 메모 글꼴은 쓴 글자만
    except Exception as ex:
        print("글꼴 줄이기 건너뜀:", ex)
    out.save(OUT, garbage=4, deflate=True, deflate_images=True, deflate_fonts=True, clean=True)
    print("완료", OUT, "· 쪽", len(out), "(슬라이드 105 + 끼움", len(pages), ") · 사진", nph, "· 셀카 제외", nbad)
    if "--icloud" in sys.argv:
        os.makedirs(ICLOUD, exist_ok=True)
        shutil.copy2(OUT, os.path.join(ICLOUD, os.path.basename(OUT)))
        print("iCloud 학교 폴더에 복사")
    shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
