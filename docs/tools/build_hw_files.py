# -*- coding: utf-8 -*-
"""과목별 과제 파일 모음 (대표님 2026-10-02 「과목별로 과제 제출용 파일 모아둔 건 따로 없는 거야?」).
① study-materials/<과목>/_과제 의 PDF · docx 를 iCloudDrive/학교/2026-2/<과목>/과제/ 로 복사(같은 이름 · 같은 크기면 건너뜀)
② study-console/_private/hwfiles.json — 앱 과목 화면 「과제 파일」 카드(atom 안에서만, 링크 = _private/media 정션). 10/3부터 주차(Ch.)마다 답 적힌 제출본 하나만(answer_score)
용도 판정(파일 이름): 제출용·풀이·제출본 = 제출본 · 손풀이·가이드·따라그리기 = 옮겨 적기 · 필기서식 = 필기 서식 · 이해용 = 이해용 · HW-Ch… .pdf(번호만) = 문제지 · 활동지 = 활동지.
실행: python docs/tools/build_hw_files.py"""
import datetime, io, json, os, re, shutil, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SM = os.path.join(os.path.dirname(ROOT), "study-materials")
ICLOUD = os.path.join(os.path.expanduser("~"), "iCloudDrive", "학교", "2026-2")
OUT = os.path.join(ROOT, "_private", "hwfiles.json")


def kind(f):
    n = f
    if re.search(r"필기서식", n): return "필기 서식"
    if re.search(r"손풀이|가이드|따라그리기", n): return "옮겨 적기"
    if re.search(r"이해용", n): return "이해용"
    if re.search(r"제출용|풀이_|제출본|늦은제출", n): return "제출본"
    if re.search(r"활동지|주제문", n): return "활동지"
    if re.match(r"HW-Ch[\d-]+\.pdf$", n): return "문제지"
    return "자료"


def answer_score(f):
    """앱 카드에 올릴 「답 적힌 제출본」 점수 — 대표님 10/3 「양식은 넣지 말고 풀이 제출본만, 답만 적혀서 보고 적어 낼 수 있는 것만」.
    0 이하면 앱에서 뺀다(양식 · 서식 · 가이드 · 따라그리기 · 필사 · 이해용 · 문제지). iCloud 에는 전부 그대로 복사."""
    if re.search(r"양식|필기서식|가이드|따라그리기|필사|이해용|긴검증", f):
        return 0
    m = re.search(r"_v(\d+)\.(pdf|docx|hwp)$", f)   # _v2 · _v3 … = 최신 판 우선 (정역학 제출본 · 글쓰기 활동지 모두)
    if m: return 100 + int(m.group(1)) + (1 if f.lower().endswith(".pdf") else 0)
    if "늦은제출" in f: return 50
    if re.search(r"풀이_", f): return 40
    if "제출용" in f: return 30
    if re.search(r"활동지.*김아토|주제문", f):
        return (20 if f.lower().endswith(".pdf") else 10) - (5 if "버전" in f else 0)
    return 0


def main():
    items = []
    for subj in sorted(os.listdir(SM)):
        d = os.path.join(SM, subj, "_과제")
        if not os.path.isdir(d):
            continue
        dst = os.path.join(ICLOUD, subj, "과제")
        names = set(os.listdir(d))
        for f in sorted(names):
            if not f.lower().endswith((".pdf", ".docx", ".hwp")) or "긴검증" in f:
                continue
            st, ext = os.path.splitext(f)
            if st + "_늦은제출" + ext in names:
                # 늦은제출판이 있으면 예전 판은 목록·복사에서 뺀다(대표님 10/3 「제일 좋은 것만 남기고」). 이미 있는 사본 삭제는 대표님이 직접
                continue
            p = os.path.join(d, f)
            k = kind(f)
            m = re.search(r"(\d+)주차|Ch\.?(\d+)|HW-Ch(\d+)", f)
            grp = (m.group(1) + "주차") if m and m.group(1) else ("Ch." + (m.group(2) or m.group(3))) if m else ""
            items.append({"subj": subj, "group": grp, "kind": k, "name": f, "src": "_private/media/" + subj + "/_과제/" + f,
                          "kb": round(os.path.getsize(p) / 1024), "mtime": datetime.datetime.fromtimestamp(os.path.getmtime(p)).strftime("%m-%d %H:%M")})
            os.makedirs(dst, exist_ok=True)
            t = os.path.join(dst, f)
            if not (os.path.exists(t) and os.path.getsize(t) == os.path.getsize(p)):
                # iCloud 폴더는 파이썬 copy 가 멈춘 적이 있어(9/30) 파워셸 Copy-Item 으로
                subprocess.run(["powershell", "-NoProfile", "-Command", "& { param($a,$b) Copy-Item -LiteralPath $a -Destination $b -Force }", p, t], check=False)
    # 앱 카드: 과목 · 주차(Ch.)마다 점수 가장 높은 제출본 하나만
    best = {}
    for it in items:
        sc = answer_score(it["name"])
        if sc <= 0:
            continue
        key = (it["subj"], it["group"] or it["name"])
        if key not in best or sc > best[key][0]:
            best[key] = (sc, it)
    total = len(items)
    items = [best[k][1] for k in sorted(best)]
    for it in items:
        it["kind"] = "제출본"
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    io.open(OUT, "w", encoding="utf-8").write(json.dumps({"generated": datetime.datetime.now().isoformat(timespec="minutes"), "items": items}, ensure_ascii=False, indent=1))
    print("iCloud 복사 대상", total)
    by = {}
    for it in items:
        by[it["subj"]] = by.get(it["subj"], 0) + 1
    print("과제 파일", len(items), by, "→ iCloud 학교/2026-2/<과목>/과제 ·", OUT)


if __name__ == "__main__":
    main()
