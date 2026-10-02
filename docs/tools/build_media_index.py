# -*- coding: utf-8 -*-
"""수업 영상·녹음 목록 → _private/media.json (atom /study/ 에서만 열림, gitignore). 대표님 2026-10-02 「녹음본 주차별로 재생」.
- 파일은 study-materials 에 그대로 두고, study-console/_private/media 정션(→ study-materials)으로 가리킨다.
- 정역학: _영상원본/<주차>_Statics_W<주>-<회>-<조각>_YYMMDD.mp4 → 날짜 = YYMMDD
- CADD: _영상원본/<N>주차_<제목>.mp4 → 그 주 화요일(1주차 = 8/30 일요일 시작)
- 그 밖의 과목: 날짜 폴더의 *.m4a / *.mp3 / *.wav / *.mp4 (클로바 원본 오디오를 받게 되면 여기 잡힌다)
실행: python docs/tools/build_media_index.py
"""
import datetime, io, json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SM = os.path.join(os.path.dirname(ROOT), "study-materials")
OUT = os.path.join(ROOT, "_private", "media.json")
LINK = os.path.join(ROOT, "_private", "media")
W1 = datetime.date(2026, 8, 30)
AUD = (".m4a", ".mp3", ".wav", ".aac", ".mp4")


def rel(p):
    return "_private/media/" + os.path.relpath(p, SM).replace("\\", "/")


def main():
    items = []
    for subj in sorted(os.listdir(SM)):
        d = os.path.join(SM, subj)
        if not os.path.isdir(d) or subj.startswith("_"):
            continue
        vd = os.path.join(d, "_영상원본")
        if os.path.isdir(vd):
            for f in sorted(os.listdir(vd)):
                if not f.lower().endswith(".mp4"):
                    continue
                m = re.search(r"_(\d{6})\.mp4$", f)
                if m:
                    s = m.group(1); day = "20%s-%s-%s" % (s[:2], s[2:4], s[4:6])
                else:
                    w = re.match(r"(\d+)주차", f)
                    if not w:
                        continue
                    day = (W1 + datetime.timedelta(days=7 * (int(w.group(1)) - 1) + 2)).isoformat()
                piece = re.search(r"_W(\d+-\d+(?:-\d+)?)_", f)
                tx = os.path.splitext(os.path.join(vd, f))[0] + ".전사.txt"
                items.append({"subj": subj, "date": day, "kind": "video", "title": re.sub(r"^\d+주차_", "", os.path.splitext(f)[0]).replace("_", " "),
                              "piece": piece.group(1) if piece else "", "src": rel(os.path.join(vd, f)), "tx": rel(tx) if os.path.exists(tx) else "",
                              "mb": round(os.path.getsize(os.path.join(vd, f)) / 1048576)})
        for day in sorted(os.listdir(d)):
            dd = os.path.join(d, day)
            if not (os.path.isdir(dd) and re.match(r"\d{4}-\d{2}-\d{2}$", day)):
                continue
            for f in sorted(os.listdir(dd)):
                if f.lower().endswith(AUD):
                    items.append({"subj": subj, "date": day, "kind": "audio" if not f.lower().endswith(".mp4") else "video", "title": os.path.splitext(f)[0],
                                  "piece": "", "src": rel(os.path.join(dd, f)), "tx": "", "mb": round(os.path.getsize(os.path.join(dd, f)) / 1048576)})
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    io.open(OUT, "w", encoding="utf-8").write(json.dumps({"generated": datetime.datetime.now().isoformat(timespec="minutes"), "items": items}, ensure_ascii=False, indent=1))
    print("media", len(items), "→", OUT, "· link ok" if os.path.exists(LINK) else "· 정션 없음(_private/media → study-materials)")


if __name__ == "__main__":
    main()
