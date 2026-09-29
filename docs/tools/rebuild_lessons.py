# -*- coding: utf-8 -*-
"""수업 노트·교실·암기노트 전체 재빌드 — lessons.json 에 등록된 회차마다
   ① docs/tools/lessons/<약칭>_<날짜>.py 실행(원본 HTML 생성) → ② build_lesson_nodes.py(스앵님 판정용 개념 노드 연결표, 원본 전체를 본다)
   → ③ build_lesson.py(읽기용 수업 노트) · build_classroom.py(교실) → ④ build_memo.py(과목별 암기노트)
사용: python docs/tools/rebuild_lessons.py [phys2 ...]   (인자 없으면 전부) · --no-gen 이면 ① 생략"""
import io, os, sys, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
SM = os.path.join(os.path.dirname(ROOT), "study-materials")
COURSE = {"phys2": "일반물리학2", "statics": "정역학", "em1": "공업수학1", "calc2": "미분적분학2"}
only = [a for a in sys.argv[1:] if not a.startswith("--")]; gen = "--no-gen" not in sys.argv
reg = json.load(io.open(os.path.join(ROOT, "knowledge", "lessons.json"), encoding="utf-8"))["courses"]
env = dict(os.environ, PYTHONIOENCODING="utf-8"); n = 0
todo = [(slug, cn, date, rec) for slug, cn in COURSE.items() if not only or slug in only for date, rec in sorted(reg.get(cn, {}).items())]
def run(args, what):
    r = subprocess.run([sys.executable] + args, env=env, capture_output=True, text=True, encoding="utf-8")
    if r.returncode: print("FAIL", what, (r.stdout + r.stderr)[-600:]); sys.exit(1)
    return r.stdout
if gen:
    for slug, cn, date, rec in todo:
        g = os.path.join(HERE, "lessons", f"{slug}_{date}.py")
        if not os.path.exists(g): print("WARN 생성기 없음:", g); continue
        run([g], "생성기 " + g)
print(run([os.path.join(HERE, "build_lesson_nodes.py")], "노드 연결표").strip())
for slug, cn, date, rec in todo:
    src = os.path.join(SM, cn, "_수업노트", f"{date}.html")
    for tool in ("build_lesson.py", "build_classroom.py"):
        run([os.path.join(HERE, tool), src, slug, date, "--minutes", str(rec.get("minutes", 18))], f"{tool} {slug} {date}")
    n += 1; print("OK", slug, date)
print(run([os.path.join(HERE, "build_memo.py")], "암기노트").strip())
print("재빌드", n, "회차")
