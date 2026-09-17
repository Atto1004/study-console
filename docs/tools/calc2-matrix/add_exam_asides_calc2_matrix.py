# -*- coding: utf-8 -*-
"""행렬 노트 v2: 교수 시험 언급(9/3 녹음 원문)을 aside.exam(data-level·data-when)으로 해당 파트/문제에 붙인다 (지침 §3). 멱등."""
import io
P = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\미분적분학2\_정리노트\2026-09-17_행렬_1-2주차_개념학습.html"
s = io.open(P, encoding="utf-8").read()
if 'class="exam"' in s:
    print("already"); raise SystemExit
def aside(level, when, quote):
    return '\n  <aside class="exam" data-level="%s" data-when="%s">%s</aside>' % (level, when, quote)
n = 0
# 파트 2 개념: 배제 — 덧셈·실수배 안 나옴
h = '<h3><span class="tag c">개념</span>같은 자리끼리 더하고, 「앞 행 × 뒤 열」로 곱한다</h3>'
assert s.count(h) == 1; s = s.replace(h, h + aside("배제", "9/3 24:05", "덧셈·실수배는 시험 문제 안 나온다.")); n += 1
# 파트 3 개념: 확정 2 + 강조 1
h = '<h3><span class="tag c">개념</span>정사각행렬을 숫자 하나로</h3>'
assert s.count(h) == 1
s = s.replace(h, h + aside("확정", "9/3 30:54", "시험 문제는 행렬식부터 나올 건데, 머릿속에 암기를 해야죠.")
                 + aside("확정", "9/3 32:00", "중간고사 관련 문제 두 문제나 세 문제를 낼 예정인데 이 행렬식을 가지고 문제 나오는 파트가 있다.")
                 + aside("강조", "9/3 58:40", "전자계산기 손 못 대. 손으로 계산해야 돼. 손으로 풀 수 있는 건 3차까지.")); n += 1
# 응용 3-1 (Ex03): 확정 — det=0일 때 x
q = '<div class="q"><div class="qn a">응용 3-1 · det=0 (Ex03)</div>'
assert s.count(q) == 1; s = s.replace(q, q + '<aside class="exam" data-level="확정" data-when="9/3">행렬 A 주고 det가 0일 때 x를 구하라 — 이런 유형을 낸다.</aside>'); n += 1
# 노트(PDF)용 스타일
s = s.replace("</style>", ".exam{display:block;border:4px solid #FF4D8D;padding:8px 12px;margin:8px 0;font-size:.95em}.exam::before{content:'📌 시험 언급 · ' attr(data-level) ' · ' attr(data-when);display:block;color:#FF4D8D;font-weight:700;font-size:.85em}\n</style>", 1)
io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("exam asides", n)
