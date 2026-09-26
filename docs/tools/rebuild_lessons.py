# -*- coding: utf-8 -*-
"""수업 노트·교실 전체 재빌드 — lessons.json 에 등록된 회차마다
   ① docs/tools/lessons/<약칭>_<날짜>.py 실행(원본 HTML 생성) → ② build_lesson.py(읽기용 수업 노트) → ③ build_classroom.py(교실)
사용: python docs/tools/rebuild_lessons.py [phys2 ...]   (인자 없으면 전부) · --no-gen 이면 ① 생략"""
import io, os, sys, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
SM = os.path.join(os.path.dirname(ROOT), "study-materials")
COURSE = {"phys2": "일반물리학2", "statics": "정역학", "em1": "공업수학1", "calc2": "미분적분학2"}
only = [a for a in sys.argv[1:] if not a.startswith("--")]; gen = "--no-gen" not in sys.argv
reg = json.load(io.open(os.path.join(ROOT, "knowledge", "lessons.json"), encoding="utf-8"))["courses"]
env = dict(os.environ, PYTHONIOENCODING="utf-8"); n = 0
for slug, cn in COURSE.items():
    if only and slug not in only: continue
    for date, rec in sorted(reg.get(cn, {}).items()):
        g = os.path.join(HERE, "lessons", f"{slug}_{date}.py"); src = os.path.join(SM, cn, "_수업노트", f"{date}.html")
        if gen:
            if not os.path.exists(g): print("WARN 생성기 없음:", g); continue
            r = subprocess.run([sys.executable, g], env=env, capture_output=True, text=True, encoding="utf-8")
            if r.returncode: print("FAIL 생성기", g, r.stderr[-400:]); sys.exit(1)
        for tool in ("build_lesson.py", "build_classroom.py"):
            r = subprocess.run([sys.executable, os.path.join(HERE, tool), src, slug, date, "--minutes", str(rec.get("minutes", 18))], env=env, capture_output=True, text=True, encoding="utf-8")
            if r.returncode: print("FAIL", tool, slug, date, r.stderr[-600:]); sys.exit(1)
        n += 1; print("OK", slug, date)
print("재빌드", n, "회차")
