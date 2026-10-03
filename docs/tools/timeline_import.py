# -*- coding: utf-8 -*-
"""구글 지도 타임라인 → 공부계획 위치(_private/plan.json stays) (대표님 2026-10-03 「내 위치 현황은 구글 지도 타임라인을 근거로,
거기에 내가 한 말이 있으면 그걸로 수정해서 위치 적용」).
타임라인은 2024년 말부터 휴대폰 안에만 저장된다 — 휴대폰에서 내보낸 JSON 을 iCloud Drive(또는 다운로드)에 두면 이 스크립트가 읽는다.
 · 찾는 곳: ~/iCloudDrive/위치/*.json → ~/iCloudDrive/*.json → ~/Downloads/*.json 중 타임라인 형식인 가장 새 파일
 · 형식: Android 「semanticSegments」 · iOS 배열(visit.topCandidate) 둘 다
규칙: 시각 = 타임라인, 장소 이름 = 대표님 말(src "said")이 우선.
 · 말한 체류(said)와 겹치는 방문 → 말한 이름 그대로, from/to 만 타임라인 시각으로 고침(src "said+timeline")
 · 말이 없는 방문 → 타임라인 유형으로 이름(집 · 직장 · 그 밖은 「방문 장소」 + 좌표), src "timeline"
 · 최근 14일만. 하루 종일 숙소 같은 긴 말한 체류(12시간 넘게)는 건드리지 않는다.
실행: python docs/tools/timeline_import.py [파일]   (--dry 면 쓰지 않고 보여만 줌)"""
import datetime as dt, glob, io, json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PLAN = os.path.join(ROOT, "_private", "plan.json")
HOME = os.path.expanduser("~")
KST = dt.timezone(dt.timedelta(hours=9))
TYPE = {"HOME": "집", "INFERRED_HOME": "집", "WORK": "직장", "INFERRED_WORK": "직장"}


def find_file():
    pats = [os.path.join(HOME, "iCloudDrive", "위치", "*.json"), os.path.join(HOME, "iCloudDrive", "*.json"), os.path.join(HOME, "Downloads", "*.json")]
    for pat in pats:
        for p in sorted(glob.glob(pat), key=os.path.getmtime, reverse=True):
            try:
                head = io.open(p, encoding="utf-8").read(4000)
            except OSError:
                continue
            if "semanticSegments" in head or "topCandidate" in head:
                return p
    return None


def ts(s):
    t = dt.datetime.fromisoformat(str(s).replace("Z", "+00:00"))
    return t.astimezone(KST)


def latlng(pl):
    if isinstance(pl, dict):
        pl = pl.get("latLng", "")
    nums = re.findall(r"-?\d+\.\d+", str(pl or ""))
    return (float(nums[0]), float(nums[1])) if len(nums) >= 2 else None


def visits(data):
    segs = data.get("semanticSegments", []) if isinstance(data, dict) else data
    out = []
    for s in segs or []:
        v = s.get("visit") if isinstance(s, dict) else None
        if not v:
            continue
        tc = v.get("topCandidate", {})
        try:
            a, b = ts(s["startTime"]), ts(s["endTime"])
        except (KeyError, ValueError):
            continue
        out.append({"from": a, "to": b, "type": tc.get("semanticType", ""), "ll": latlng(tc.get("placeLocation")),
                    "pid": tc.get("placeId") or tc.get("placeID") or ""})
    return out


def fmt(t):
    return t.strftime("%Y-%m-%d %H:%M")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    f = args[0] if args else find_file()
    if not f:
        print("타임라인 파일 없음 — 휴대폰 구글 지도에서 타임라인을 내보내 iCloud Drive › 위치 폴더에 넣어 주세요"); return
    vs = visits(json.load(io.open(f, encoding="utf-8")))
    since = dt.datetime.now(KST) - dt.timedelta(days=14)
    vs = [v for v in vs if v["to"] >= since]
    plan = json.load(io.open(PLAN, encoding="utf-8"))
    stays = plan.get("stays", [])
    said = [s for s in stays if s.get("src", "said").startswith("said")]
    used, n_fix, n_new = set(), 0, 0
    for s in said:
        a = dt.datetime.strptime(s["from"], "%Y-%m-%d %H:%M").replace(tzinfo=KST)
        b = dt.datetime.strptime(s["to"], "%Y-%m-%d %H:%M").replace(tzinfo=KST) if s.get("to") else dt.datetime.now(KST)
        if (b - a).total_seconds() > 12 * 3600:
            continue
        best = None
        for i, v in enumerate(vs):
            if i in used:
                continue
            ov = (min(b, v["to"]) - max(a, v["from"])).total_seconds()
            if ov > 0 or abs((v["from"] - a).total_seconds()) <= 3600:
                if best is None or abs((v["from"] - a).total_seconds()) < abs((vs[best]["from"] - a).total_seconds()):
                    best = i
        if best is not None:
            v = vs[best]; used.add(best)
            s["from"] = fmt(v["from"])
            if v["to"] < dt.datetime.now(KST) - dt.timedelta(minutes=5):
                s["to"] = fmt(v["to"])
            s["src"] = "said+timeline"; n_fix += 1
    kept = [s for s in stays if s.get("src") != "timeline"]
    for i, v in enumerate(vs):
        if i in used:
            continue
        name = TYPE.get(v["type"], "방문 장소")
        st = {"from": fmt(v["from"]), "to": fmt(v["to"]), "place": name, "sub": ("%.4f, %.4f" % v["ll"]) if v["ll"] and name == "방문 장소" else "",
              "src": "timeline", "note": "구글 지도 타임라인 — 이름은 대표님이 알려 주면 고침"}
        kept.append(st); n_new += 1
    kept.sort(key=lambda s: s["from"], reverse=True)
    plan["stays"] = kept
    plan["timeline"] = {"file": os.path.basename(f), "at": fmt(dt.datetime.now(KST)), "visits": len(vs)}
    if "--dry" in sys.argv:
        print(json.dumps(kept[:8], ensure_ascii=False, indent=1))
    else:
        io.open(PLAN, "w", encoding="utf-8").write(json.dumps(plan, ensure_ascii=False, indent=1))
    print("타임라인", os.path.basename(f), "· 방문", len(vs), "· 말과 맞춘 것", n_fix, "· 새로", n_new)


if __name__ == "__main__":
    main()
