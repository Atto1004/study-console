# -*- coding: utf-8 -*-
"""행렬 노트 v2를 학습지(Lecture 2-1) 전체와 1:1로 맞춘다 (아토 2026-09-17 "행렬은 학습지가 전부, 학습지 내용은 다 들어가야").
빠진 것: 항등행렬 이름, Ex01 (1)(4)의 전치, Ex05 소행렬식 9개·여인수 9개 전부. 멱등."""
import io, re
P = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\미분적분학2\_정리노트\2026-09-17_행렬_1-2주차_개념학습.html"
s = io.open(P, encoding="utf-8").read()
n = 0
def rep(old, new, must=True):
    global s, n
    if new in s: return
    if s.count(old) != 1:
        if must: raise SystemExit("not unique/found: " + old[:70])
        return
    s = s.replace(old, new); n += 1

# 1) 단위행렬 = 항등행렬 (학습지 정의02 (ii))
rep('<td><span class="term" data-k="단위행렬">단위행렬</span> \\(I_n\\)</td>',
    '<td><span class="term" data-k="단위행렬">단위행렬</span>(= 항등행렬, identity) \\(I_n\\) 또는 \\(E_n\\)</td>')

# 2) Ex01 (1)(4) 전치 — 기초 1-4 (기초 1-3 뒤에 추가)
q13_end_pat = re.compile(r'(<div class="q"><div class="qn">기초 1-3 · 대칭 판별.*?</details></div>)', re.S)
m = q13_end_pat.search(s)
assert m
q14 = ('\n  <div class="q"><div class="qn">기초 1-4 · 전치 쓰기 (Ex01 (1)(4))</div>'
       '<p>\\(A=\\begin{pmatrix}2&0&0\\\\0&2&0\\\\0&0&2\\end{pmatrix}\\), \\(D=\\begin{pmatrix}0&5&3\\\\5&6&7\\\\3&7&12\\end{pmatrix}\\)의 전치행렬 \\(A^t\\), \\(D^t\\)를 쓰고 원래 행렬과 비교하라.</p>'
       '<ol class="choices"><li>\\(A^t=A\\)이지만 \\(D^t\\ne D\\)</li><li data-ok="1">\\(A^t=A\\), \\(D^t=D\\) — 둘 다 원래와 같다(대칭행렬)</li>'
       '<li>\\(A^t\\ne A\\), \\(D^t=D\\)</li><li>둘 다 원래와 다르다</li></ol>'
       '<details><summary>답</summary><div class="ans">\\(A^t=\\begin{pmatrix}2&0&0\\\\0&2&0\\\\0&0&2\\end{pmatrix}=A\\), \\(D^t=\\begin{pmatrix}0&5&3\\\\5&6&7\\\\3&7&12\\end{pmatrix}=D\\). 대각선을 거울로 놓고 뒤집어도 같으니 둘 다 대칭행렬. 내 풀이본 p.2와 같음 ✓.</div></details></div>')
if "기초 1-4 · 전치 쓰기" not in s:
    s = s[:m.end()] + q14 + s[m.end():]; n += 1

# 3) Ex05 전부 — 소행렬식 9개, 여인수 9개
m41 = re.search(r'<div class="q"><div class="qn">기초 4-1 · 소행렬식</div>.*?</details></div>', s, re.S)
old41 = m41.group(0) if m41 else None
new41 = ('<div class="q"><div class="qn">기초 4-1 · 소행렬식 (Ex05 (i))</div>'
         '<p>\\(A=\\begin{pmatrix}1&2&3\\\\4&5&6\\\\7&8&9\\end{pmatrix}\\)의 소행렬식 아홉 개 \\(M_{11}, M_{12}, M_{13}, M_{21}, M_{22}, M_{23}, M_{31}, M_{32}, M_{33}\\)을 전부 구하라. (학습지 Ex05는 아홉 개 다 묻는다)</p>'
         '<details><summary>답</summary><div class="ans">1행: \\(M_{11}=\\begin{vmatrix}5&6\\\\8&9\\end{vmatrix}=45-48=-3\\), \\(M_{12}=\\begin{vmatrix}4&6\\\\7&9\\end{vmatrix}=36-42=-6\\), \\(M_{13}=\\begin{vmatrix}4&5\\\\7&8\\end{vmatrix}=32-35=-3\\)<br>'
         '2행: \\(M_{21}=\\begin{vmatrix}2&3\\\\8&9\\end{vmatrix}=18-24=-6\\), \\(M_{22}=\\begin{vmatrix}1&3\\\\7&9\\end{vmatrix}=9-21=-12\\), \\(M_{23}=\\begin{vmatrix}1&2\\\\7&8\\end{vmatrix}=8-14=-6\\)<br>'
         '3행: \\(M_{31}=\\begin{vmatrix}2&3\\\\5&6\\end{vmatrix}=12-15=-3\\), \\(M_{32}=\\begin{vmatrix}1&3\\\\4&6\\end{vmatrix}=6-12=-6\\), \\(M_{33}=\\begin{vmatrix}1&2\\\\4&5\\end{vmatrix}=5-8=-3\\). 내 풀이본 p.8과 전부 같음 ✓.</div></details></div>')
if old41: rep(old41, new41)
m42 = re.search(r'<div class="q"><div class="qn">기초 4-2 · 여인수</div>.*?</details></div>', s, re.S)
old42 = m42.group(0) if m42 else None
new42 = ('<div class="q"><div class="qn">기초 4-2 · 여인수 (Ex05 (ii))</div>'
         '<p>\\(A=\\begin{pmatrix}1&2&3\\\\4&5&6\\\\7&8&9\\end{pmatrix}\\)의 여인수 아홉 개 \\(A_{11}\\sim A_{33}\\)을 전부 구하라. \\(A_{ij}=(-1)^{i+j}M_{ij}\\), 소행렬식은 \\(M_{11}=-3, M_{12}=-6, M_{13}=-3, M_{21}=-6, M_{22}=-12, M_{23}=-6, M_{31}=-3, M_{32}=-6, M_{33}=-3\\).</p>'
         '<details><summary>답</summary><div class="ans">부호판 \\(\\begin{pmatrix}+&-&+\\\\-&+&-\\\\+&-&+\\end{pmatrix}\\)를 곱한다.<br>'
         '\\(A_{11}=-3\\), \\(A_{12}=+6\\), \\(A_{13}=-3\\)<br>\\(A_{21}=+6\\), \\(A_{22}=-12\\), \\(A_{23}=+6\\)<br>\\(A_{31}=-3\\), \\(A_{32}=+6\\), \\(A_{33}=-3\\). '
         '<span class="red">부호가 바뀌는 자리는 (1,2)(2,1)(2,3)(3,2) 네 곳뿐</span>. 내 풀이본 p.8과 전부 같음 ✓.</div></details></div>')
if old42: rep(old42, new42)

io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("filled", n)
