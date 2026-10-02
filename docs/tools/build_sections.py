# -*- coding: utf-8 -*-
"""세부단원(절) 학습 경로 빌더 — 대표님 2026-10-02 「공업수학 먼저 각 세부단원별로 나눠서 학습 경로로 구체화 · 교수님 학습자료도
세부단원별로 나눠서 첨부 · 그날 수업에 찍은 사진 따로 첨부하는 항목, 없으면 빈칸」.

출력
  knowledge/sections.json                       (공개) 절 목록 · 수업일 · 수업 노트/교실/덱/암기노트 링크 · 슬라이드 조각 경로
  notes/lessons/_private/<약칭>/slides/<절>.pdf  (비공개, .gitignore) 교수님 슬라이드를 절 단위로 자른 것
  notes/lessons/_private/<약칭>/photos/<날짜>/*.jpg + photos.json  (비공개) 그날 수업 사진(판서·자료·필기·미분류, 중복_ 제외)
비공개 파일은 atom /study/ 로컬 서빙에서만 열린다(지침 학습시스템 §21). GitHub Pages 에서는 없음 → 앱이 빈칸으로 둔다.
사용: python docs/tools/build_sections.py"""
import io, os, re, json, datetime
import pymupdf
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MAT = os.path.join(os.path.dirname(ROOT), "study-materials")
FACE_PY = r"C:\Users\user\본사\atom\.venv-face\Scripts\python.exe"   # face_guard.py 를 돌릴 환경(MTCNN)

EM1_SLIDE1 = "제1장_1계ODE_이기영_46p.pdf"
EM1_SLIDE2 = "제1장5절_제2장_2계선형ODE_이기영_61p_아토회차태그.pdf"
EM1_SLIDE3 = "제3장_고계선형ODE_이기영_18p.pdf"
# 대표님 10/2 업로드 — 교수 슬라이드 1장(p.9~46)+2장(p.12~61)+3장(p.2~18) 105쪽 + 대표님 회차 표시. 쪽 = 이 파일 쪽
EM1_RANGE = "중간고사범위_슬라이드1장-3.3_회차태그_105p.pdf"
COURSES = {
 "공업수학1": {
  "slug": "em1", "folder": "공업수학1", "decks": ["em1-mid", "em1-mid2"], "memo": "notes/memo/em1.html",
  "deck_ovr": [("2.6", "em1-mid", 4)],  # 파트 4 제목 끝 「론스키안」
  "chapters": {"1": "1장 1계 상미분방정식", "2": "2장 2계 선형 상미분방정식", "3": "3장 고계 선형 상미분방정식"},
  "sections": [
   # no, 제목(슬라이드 표기), 슬라이드 (파일, 첫 쪽, 끝 쪽), 수업일, 수업 노트 섹션 찾기 키워드, 예정/메모
   ("1.1", "기본개념 · 모델화", [(EM1_RANGE, 2, 12)], ["2026-09-02", "2026-09-04"], "모델|해의 종류|초기값|기본 ?개념", ""),
   ("1.3", "변수분리형 상미분방정식", [(EM1_RANGE, 13, 20)], ["2026-09-04"], "변수분리|동차|y ?= ?ux", ""),
   ("1.4", "완전상미분방정식 · 적분인자", [(EM1_RANGE, 21, 28)], ["2026-09-09", "2026-09-11"], "완전|적분인자", ""),
   ("1.5", "선형 상미분방정식 · 베르누이", [(EM1_RANGE, 29, 38)], ["2026-09-11", "2026-09-16"], "선형|베르누이|해 공식|흐름도", ""),
   ("2.1", "2계 제차 선형 상미분방정식", [(EM1_RANGE, 40, 46)], ["2026-09-16"], "2계|중첩|기저|차수축소|1차독립", ""),
   ("2.2", "상수계수를 갖는 제차 선형 상미분방정식", [(EM1_RANGE, 47, 51)], ["2026-09-18"], "특성방정식|상수계수", ""),
   ("2.3", "미분연산자", [(EM1_RANGE, 52, 53)], ["2026-09-18"], "연산자", ""),
   ("2.4", "모델화: 자유진동 (질량-용수철)", [(EM1_RANGE, 54, 57)], ["2026-09-18"], "자유진동|용수철", ""),
   ("2.5", "오일러-코시 방정식", [(EM1_RANGE, 58, 62)], ["2026-09-23"], "오일러", ""),
   ("2.6", "해의 존재성과 유일성 · 론스키안", [(EM1_RANGE, 63, 65)], ["2026-09-23"], "론스키|Wronsk|존재", ""),
   ("2.7", "비제차 상미분방정식 · 미정계수법", [(EM1_RANGE, 66, 72)], ["2026-09-30"], "비제차|미정계수|해의 구조|선택 규칙|표 2\\.1|Ex\\.|예제", ""),
   ("2.8", "모델화: 강제진동 · 공진", [(EM1_RANGE, 73, 75)], ["2026-09-30"], "강제진동|공진|맥놀이|과도해", ""),
   ("2.9", "모델화: 전기회로 (RLC)", [(EM1_RANGE, 76, 78)], ["2026-10-02"], "회로|RLC", ""),
   ("2.10", "매개변수변환법", [(EM1_RANGE, 79, 88)], ["2026-10-02"], "매개변수", ""),
   ("3.1", "고계 제차 선형 상미분방정식", [(EM1_RANGE, 90, 94)], ["2026-10-02", "2026-10-07"], "고계|n계", ""),
   ("3.2", "상수계수 · 변수계수(고계 오일러-코시) 제차", [(EM1_RANGE, 95, 99)], ["2026-10-07"], "고계|오일러", "10/7 예정"),
   ("3.3", "고계 비제차 선형 상미분방정식", [(EM1_RANGE, 100, 105)], ["2026-10-07"], "비제차|들보", "10/7 예정 · 중간 범위 끝"),
  ],
 },
}
IMG = re.compile(r"\.(jpe?g|png|heic)$", re.I)
KIND = [("판서_", "판서"), ("자료_", "자료"), ("강의자료_", "자료"), ("과제_", "과제"), ("필기_", "필기"), ("미분류사진_", "사진"), ("교재_", "교재")]


def sec_key(no):
    a, b = no.split(".")
    return (int(a), int(b))


def expand(token, allno):
    """덱 파트 제목의 「1.1~1.3」「2.8 … + 2.9」「3.1~3.2」 → 절 목록"""
    out = []
    for m in re.finditer(r"(\d+)\.(\d+)(?:\s*~\s*(\d+)\.(\d+))?", token):
        a = (int(m.group(1)), int(m.group(2)))
        b = (int(m.group(3)), int(m.group(4))) if m.group(3) else a
        out += [n for n in allno if a <= sec_key(n) <= b]
    return out


def lesson_sections(path):
    if not os.path.exists(path):
        return []
    h = io.open(path, encoding="utf-8").read()
    res = []
    for m in re.finditer(r'<section[^>]*data-id="(s\d+)"[^>]*>(.*?)</h2>', h, re.S):
        title = re.sub(r"<[^>]+>", "", m.group(2))
        title = re.sub(r"\s+", " ", title).strip()
        res.append((m.group(1), title))
    return res


def label_of(fn):
    base = os.path.splitext(fn)[0]
    kind = "사진"
    for pre, k in KIND:
        if base.startswith(pre):
            kind = k; base = base[len(pre):]; break
    base = re.sub(r"_?IMG_\d+(\(\d+\))?", "", base)
    base = re.sub(r"_\d{4}$", "", base).strip("_ ")
    t = re.search(r"_(\d{4})(?:_|$)", os.path.splitext(fn)[0])
    return kind, base.replace("_", " "), (t.group(1)[:2] + ":" + t.group(1)[2:]) if t else ""


def main():
    out = {"_meta": {"updated": datetime.date.today().isoformat(),
                     "note": "세부단원(절) 학습 경로 — docs/tools/build_sections.py 가 만든다. slides·photos 경로는 notes/lessons/_private(비공개, atom 안에서만)."},
           "courses": {}}
    decks = json.load(io.open(os.path.join(ROOT, "knowledge", "decks.json"), encoding="utf-8"))
    decks = decks["decks"] if isinstance(decks, dict) and "decks" in decks else decks
    lessons = json.load(io.open(os.path.join(ROOT, "knowledge", "lessons.json"), encoding="utf-8"))
    for cname, C in COURSES.items():
        slug = C["slug"]
        priv = os.path.join(ROOT, "notes", "lessons", "_private", slug)
        os.makedirs(os.path.join(priv, "slides"), exist_ok=True)
        allno = [s[0] for s in C["sections"]]
        deckmap = {}
        for d in decks:
            if d.get("id") not in C["decks"]:
                continue
            for p in d.get("partList", []):
                for n in expand(p.get("title", ""), allno):
                    deckmap.setdefault(n, []).append({"href": d["file"] + "#at=p%d-cover" % p["n"], "quiz": d["file"] + "#quiz",
                                                      "label": "파트 %d" % p["n"], "deck": d.get("title", d["id"])})
        for n, did, pn in C.get("deck_ovr", []):
            for d in decks:
                if d.get("id") == did:
                    deckmap.setdefault(n, []).append({"href": d["file"] + "#at=p%d-cover" % pn, "quiz": d["file"] + "#quiz", "label": "파트 %d" % pn, "deck": d.get("title", did)})
        reg = lessons.get("courses", {}).get(cname, {})
        reg = reg.get("dates", reg) if isinstance(reg, dict) else {}
        # 사진 — 절에 걸린 수업일 전부
        dates = sorted({d for s in C["sections"] for d in s[3]})
        import shutil
        if os.path.isdir(os.path.join(priv, "photos")):
            shutil.rmtree(os.path.join(priv, "photos"))  # 만든 사본만 — 매번 새로(원본은 study-materials)
        photos = {}
        for d in dates:
            src = os.path.join(MAT, C["folder"], d)
            if not os.path.isdir(src):
                continue
            # 분류된 수업 사진만(판서·자료·필기·과제·교재) — 미분류사진_ 은 수업과 무관한 개인 사진이 섞인다(10/2 셀카 확인)
            files = sorted(f for f in os.listdir(src) if IMG.search(f) and any(f.startswith(k) for k, _ in KIND if k != "미분류사진_"))
            if not files:
                continue
            od = os.path.join(priv, "photos", d)
            os.makedirs(od, exist_ok=True)
            lst = []
            for f in files:
                name = os.path.splitext(f)[0] + ".jpg"
                dst = os.path.join(od, name)
                if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(os.path.join(src, f)):
                    try:
                        im = ImageOps.exif_transpose(Image.open(os.path.join(src, f))).convert("RGB")
                        im.thumbnail((1800, 1800))
                        im.save(dst, "JPEG", quality=82)
                    except Exception as e:
                        print("  사진 실패", d, f, type(e).__name__); continue
                k, lab, hm = label_of(f)
                lst.append({"f": "notes/lessons/_private/%s/photos/%s/%s" % (slug, d, name), "kind": k, "label": lab, "t": hm})
            photos[d] = lst
        # 셀카 검사(대표님 10/2 「내 셀카를 수업자료에 넣으면 안 되지」 · 칠판 속 교수님 얼굴은 괜찮음) — 큰 얼굴이 잡힌 사본은 지우고 목록에서 뺀다. 검사기를 못 돌리면 사진 칸 전체를 비운다.
        import subprocess, tempfile
        allp = [os.path.join(ROOT, x["f"].replace("/", os.sep)) for v in photos.values() for x in v]
        bad = set()
        if allp:
            lst = tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".txt", delete=False)
            lst.write("\n".join(allp)); lst.close()
            try:
                r = subprocess.run([FACE_PY, os.path.join(ROOT, "docs", "tools", "face_guard.py"), lst.name],
                                   capture_output=True, encoding="utf-8", errors="replace", timeout=1800)
                if r.returncode != 0:
                    raise RuntimeError(r.stderr[-300:])
                bad = {os.path.normcase(os.path.abspath(l.strip())) for l in r.stdout.splitlines() if l.strip()}
            except Exception as e:
                print("  얼굴 검사 실패 → 사진 칸 비움:", type(e).__name__, str(e)[:200])
                bad = {os.path.normcase(os.path.abspath(p)) for p in allp}
            finally:
                os.remove(lst.name)
        nbad = 0
        for d in list(photos):
            keep = []
            for x in photos[d]:
                fp = os.path.normcase(os.path.abspath(os.path.join(ROOT, x["f"].replace("/", os.sep))))
                if fp in bad:
                    nbad += 1
                    try: os.remove(fp)
                    except OSError: pass
                else:
                    keep.append(x)
            photos[d] = keep
        print("  셀카(큰 얼굴)로 뺀 사진", nbad, "장")
        json.dump(photos, io.open(os.path.join(priv, "photos.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        # 절
        secs = []
        for no, title, sl, sdates, kw, note in C["sections"]:
            slides = []
            for pdf, a, b in sl:
                srcp = os.path.join(MAT, C["folder"], "_강의자료", pdf)
                dst = os.path.join(priv, "slides", "%s.pdf" % no)
                doc = pymupdf.open(srcp)
                nd = pymupdf.open(); nd.insert_pdf(doc, from_page=a - 1, to_page=b - 1); nd.save(dst); nd.close()
                slides.append({"href": "notes/lessons/_private/%s/slides/%s.pdf" % (slug, no), "label": "p.%d~%d" % (a, b), "pages": b - a + 1})
            les = []
            for d in sdates:
                ent = reg.get(d)
                if not ent:
                    continue
                f = ent["file"]
                sid = None
                for i, (s, t) in enumerate(lesson_sections(os.path.join(ROOT, f))):
                    if re.search(kw, t):
                        sid = s; break
                les.append({"date": d, "note": f + ("#s=" + sid if sid else ""),
                            "cls": (ent.get("classroom") + ("#ch=" + sid[1:] if sid else "")) if ent.get("classroom") else None,
                            "title": ent.get("title", "")})
            secs.append({"no": no, "ch": no.split(".")[0], "title": title, "dates": sdates, "note": note,
                         "slides": slides, "lessons": les, "decks": deckmap.get(no, [])})
        out["courses"][cname] = {"slug": slug, "chapters": C["chapters"], "memo": C["memo"], "sections": secs}
        print(cname, "절", len(secs), "· 슬라이드", sum(len(s["slides"]) for s in secs), "· 사진 날짜", len(photos),
              "장", sum(len(v) for v in photos.values()), "· 수업 노트 연결", sum(len(s["lessons"]) for s in secs),
              "· 덱 연결", sum(len(s["decks"]) for s in secs))
    io.open(os.path.join(ROOT, "knowledge", "sections.json"), "w", encoding="utf-8", newline="\n").write(
        json.dumps(out, ensure_ascii=False, indent=1) + "\n")


if __name__ == "__main__":
    main()
