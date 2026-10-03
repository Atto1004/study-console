# -*- coding: utf-8 -*-
"""클로바노트 녹음본 → 학습앱 반영 상태 (대표님 2026-10-03 「상단에 연결끊김 한양포털 대신 클로바노트 녹음본 변환 몇 개 대기 중이고,
최근에 어떤 과목 녹음본까지 학습앱에 적용시켰는지」).
study-materials/_clova/state.json 의 녹음본마다: 과목 날짜 폴더에 원본_녹음_클로바노트.txt 가 있고
 · summarized.txt 에 있거나 · 정리.md 가 녹음을 반영(본문에 「녹음」, 원본보다 나중에 고침) → 반영
 · 아니면 대기. 과목이 「미분류」면 따로 센다(과목·날짜를 대표님이 알려 줘야 함).
결과: study-console/knowledge/clova-status.json (.gitignore — atom /study/ 안에서만).
실행: python docs/tools/clova_status.py  (check_integrations.ps1 매시간 · clova_daily.ps1 정리 뒤)"""
import datetime, io, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SM = os.path.join(os.path.dirname(ROOT), "study-materials")
CL = os.path.join(SM, "_clova")
OUT = os.path.join(ROOT, "knowledge", "clova-status.json")


def main():
    st = json.load(io.open(os.path.join(CL, "state.json"), encoding="utf-8")).get("notes", {})
    try:
        done = set(l.strip() for l in io.open(os.path.join(CL, "summarized.txt"), encoding="utf-8-sig") if l.strip())
    except OSError:
        done = set()
    seen, pend, ok, unc = set(), [], [], []
    for n in st.values():
        subj, date, out = n.get("subject") or "", n.get("date") or "", n.get("out") or ""
        if not out or not os.path.exists(out) or out in seen:
            continue
        seen.add(out)
        if subj == "미분류" or not subj:
            unc.append({"date": date, "name": n.get("name", "")})
            continue
        md = os.path.join(os.path.dirname(out), "정리.md")
        applied = out in done
        if not applied and os.path.exists(md):
            txt = io.open(md, encoding="utf-8", errors="ignore").read()
            applied = "녹음" in txt and os.path.getmtime(md) >= os.path.getmtime(out)
        x = {"subj": subj, "date": date, "name": n.get("name", "")}
        if applied:
            x["at"] = datetime.datetime.fromtimestamp(os.path.getmtime(md if os.path.exists(md) else out)).strftime("%Y-%m-%dT%H:%M")
            ok.append(x)
        else:
            pend.append(x)
    ok.sort(key=lambda x: (x["date"], x["at"]))
    pend.sort(key=lambda x: x["date"])
    res = {"ts": datetime.datetime.now().isoformat(timespec="minutes"), "pending": pend, "unclassified": len(unc),
           "last": ok[-1] if ok else None, "recent": ok[-5:][::-1], "applied": len(ok)}
    io.open(OUT, "w", encoding="utf-8").write(json.dumps(res, ensure_ascii=False, indent=1))
    print("반영", len(ok), "· 대기", len(pend), "· 미분류", len(unc), "· 최근", (ok[-1]["subj"] + " " + ok[-1]["date"]) if ok else "-")


if __name__ == "__main__":
    main()
