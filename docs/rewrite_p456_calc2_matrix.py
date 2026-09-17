# -*- coding: utf-8 -*-
"""행렬 노트 v2: 파트 4·5·6(소행렬식·여인수 → 역행렬 → 연립방정식·크래머)을 처음부터 다시 쓴다 (아토 2026-09-17 "13장부터 쭉 다시").
채팅에서 통한 순서 그대로: 지운다 → 부호 붙인다 → 곱해 더한다 / 역행렬 4단계 / AX=B 선언 → 역행렬 · 크래머(j열 교체). 한 칸씩 계산은 표로. 멱등."""
import io, re
P = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\미분적분학2\_정리노트\2026-09-17_행렬_1-2주차_개념학습.html"
s = io.open(P, encoding="utf-8").read()
MARK = "<!-- p456-v3 -->"
if MARK in s:
    print("already"); raise SystemExit
i0 = s.index('<section>\n  <h2><span class="no">파트 4')
i6 = s.index('<span class="no">파트 6')
i1 = s.index('</section>', i6) + len('</section>')

M = lambda *rows: r"\begin{pmatrix}" + r"\\".join("&".join(str(c) for c in r) for r in rows) + r"\end{pmatrix}"
V = lambda *rows: r"\begin{vmatrix}" + r"\\".join("&".join(str(c) for c in r) for r in rows) + r"\end{vmatrix}"
A123 = M((1,2,3),(4,5,6),(7,8,9))
EX8 = M((1,2,0),(2,1,2),(-1,3,0))

NEW = MARK + r'''
<section>
  <h2><span class="no">파트 4 · 9/8</span>소행렬식 · 여인수 · 여인수 전개 <span class="star">★</span></h2>
  <h3><span class="tag c">개념</span>지운다 → 부호 붙인다 → 곱해 더한다</h3>
  <aside class="exam" data-level="확정" data-when="9/3">여기서 중간고사 문제 나옵니다.</aside>
  <div class="why">사루스는 3차까지만 되고, 숫자가 크거나 문자가 섞이면 불편하다. 그래서 <b>3차 행렬식을 2차 행렬식 세 개로 쪼개는</b> 방법이 필요하다. 부품이 둘 — 소행렬식(지운 것)과 여인수(부호 붙인 것). 이 파트는 딱 세 단어다: <span class="hl">지운다 → 부호 붙인다 → 곱해 더한다</span>.</div>
  <div class="concept">
    <p><b>1단계 · 지운다 = 소행렬식 \(M_{ij}\).</b> \(a_{ij}\)가 있는 <b>i행과 j열을 지우고</b> 남은 2×2의 행렬식. 앞 숫자가 지울 행, 뒤 숫자가 지울 열(성분 \(a_{ij}\)와 같은 규칙).</p>
    <p>\(A=''' + A123 + r'''\)에서 \(M_{11}\): 1행·1열을 지우면 \(''' + V((5,6),(8,9)) + r'''=45-48=-3\). \(M_{12}\): 1행·2열을 지우면 \(''' + V((4,6),(7,9)) + r'''=36-42=-6\).</p>
  </div>
  <div class="concept">
    <p><b>2단계 · 부호 붙인다 = 여인수 \(A_{ij}=(-1)^{i+j}M_{ij}\).</b> i+j가 짝수면 그대로, 홀수면 뒤집는다. 공식보다 <span class="hl">부호판</span>이 빠르다 — 체스판처럼 번갈아, (1,1)은 항상 +.</p>
    \[\begin{pmatrix}+&-&+\\-&+&-\\+&-&+\end{pmatrix}\qquad A_{11}=(+)(-3)=-3,\quad A_{12}=(-)(-6)=+6\]
    <p><span class="red">부호판의 부호와 소행렬식 값의 부호는 별개</span>. \(M_{12}=-6\)인데 (1,2)가 − 자리라 결과는 +6. 여기서 실수가 제일 많다.</p>
  </div>
  <div class="concept">
    <p><b>3단계 · 곱해 더한다 = 여인수 전개.</b> 한 줄(보통 1행)을 골라, 그 줄의 성분과 같은 자리 여인수를 곱해 더하면 \(\det\).</p>
    \[\det A=a_{11}A_{11}+a_{12}A_{12}+a_{13}A_{13}=1(-3)+2(+6)+3(-3)=-3+12-9=0\]
    <p>사루스로 해도 0. <b>같은 값이 나오는 게 정상</b>이고, 그게 이 방법이 맞다는 확인이다. 학습지 p.7의 그림이 정확히 이 순서 — 가운데 항만 −인 이유가 부호판 (1,2) 자리.</p>
    <p><b>어느 행·열로 전개해도 값이 같다</b> → <span class="hl">0이 많은 줄</span>을 고르면 계산이 준다. 열로 전개하면 부호판을 세로로 읽는다.</p>
  </div>
  <div class="one">한 줄: 지우고(소행렬식) → 부호 붙이고(여인수) → 기준 줄 성분과 곱해 더한다. 어느 줄이든 값은 같다.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것 — 외워서 바로 나와야</div><ul><li>여인수 \(A_{ij}=(-1)^{i+j}M_{ij}\)</li><li>부호판 \(\begin{pmatrix}+&-&+\\-&+&-\\+&-&+\end{pmatrix}\) — 체스판, (1,1)은 +</li><li>전개식 \(\det A=a_{11}A_{11}+a_{12}A_{12}+a_{13}A_{13}\) (한 행 또는 한 열 기준)</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것 — 왜 그런지 설명할 수 있어야</div><ul><li>소행렬식 \(M_{ij}\) = 그 성분의 행과 열을 지우고 남은 2차 행렬식</li><li>어느 행·열로 전개해도 값이 같다 → <b>0이 많은 줄</b>을 고르면 계산이 준다</li><li>사루스와 같은 값이 나온다 — 같은 여섯 항을 묶어 쓴 것뿐(Ex05·Ex06으로 확인)</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제 — 학습지 Ex05</h3>
  <div class="q"><div class="qn">기초 4-1 · 지운다 — 소행렬식 하나 (Ex05 (i))</div><p>\(A=''' + A123 + r'''\)의 \(M_{22}\)는? 2행과 2열을 지우면 무엇이 남는지부터.</p><ol class="choices"><li data-ok="1">\(''' + V((1,3),(7,9)) + r'''=-12\)</li><li>\(''' + V((5,6),(8,9)) + r'''=-3\)</li><li>\(''' + V((1,2),(7,8)) + r'''=-6\)</li><li>\(''' + V((2,3),(8,9)) + r'''=-6\)</li></ol><details><summary>답</summary><div class="ans">2행·2열을 지우면 1행 (1, 3)과 3행 (7, 9)가 남는다 → \(''' + V((1,3),(7,9)) + r'''=9-21=-12\). 다른 보기는 각각 \(M_{11}, M_{23}, M_{21}\)이다.</div></details></div>
  <div class="q"><div class="qn">기초 4-2 · 지운다 — 소행렬식 아홉 개 (Ex05 (i))</div><p>\(A=''' + A123 + r'''\)의 소행렬식 아홉 개 \(M_{11}\sim M_{33}\)을 전부 구하라. (학습지 Ex05는 아홉 개 다 묻는다)</p><details><summary>답</summary><div class="ans">1행: \(M_{11}=''' + V((5,6),(8,9)) + r'''=-3\), \(M_{12}=''' + V((4,6),(7,9)) + r'''=-6\), \(M_{13}=''' + V((4,5),(7,8)) + r'''=-3\)<br>2행: \(M_{21}=''' + V((2,3),(8,9)) + r'''=-6\), \(M_{22}=''' + V((1,3),(7,9)) + r'''=-12\), \(M_{23}=''' + V((1,2),(7,8)) + r'''=-6\)<br>3행: \(M_{31}=''' + V((2,3),(5,6)) + r'''=-3\), \(M_{32}=''' + V((1,3),(4,6)) + r'''=-6\), \(M_{33}=''' + V((1,2),(4,5)) + r'''=-3\). 내 풀이본 p.8과 전부 같음 ✓.</div></details></div>
  <div class="q"><div class="qn">기초 4-3 · 부호 붙인다 — 여인수 하나</div><p>\(A=''' + A123 + r'''\)에서 \(M_{12}=-6\)이다. 여인수 \(A_{12}\)는?</p><ol class="choices"><li>\(-6\)</li><li data-ok="1">\(+6\)</li><li>\(0\)</li><li>\(-12\)</li></ol><details><summary>답</summary><div class="ans">부호판에서 (1,2)는 − 자리. \(A_{12}=(-1)^{1+2}M_{12}=-(-6)=+6\). 부호판의 −와 \(M\) 값의 −는 별개라서 둘이 만나 +가 된다.</div></details></div>
  <div class="q"><div class="qn">기초 4-4 · 부호 붙인다 — 여인수 아홉 개 (Ex05 (ii))</div><p>\(A=''' + A123 + r'''\)의 여인수 아홉 개 \(A_{11}\sim A_{33}\)을 전부 구하라. 소행렬식은 \(M_{11}=-3, M_{12}=-6, M_{13}=-3, M_{21}=-6, M_{22}=-12, M_{23}=-6, M_{31}=-3, M_{32}=-6, M_{33}=-3\).</p><details><summary>답</summary><div class="ans">부호판 \(\begin{pmatrix}+&-&+\\-&+&-\\+&-&+\end{pmatrix}\)를 곱한다.<br>\(A_{11}=-3\), \(A_{12}=+6\), \(A_{13}=-3\)<br>\(A_{21}=+6\), \(A_{22}=-12\), \(A_{23}=+6\)<br>\(A_{31}=-3\), \(A_{32}=+6\), \(A_{33}=-3\). <span class="red">부호가 바뀌는 자리는 (1,2)(2,1)(2,3)(3,2) 네 곳뿐</span>. 내 풀이본 p.8과 전부 같음 ✓.</div></details></div>
  <div class="q"><div class="qn">기초 4-5 · 곱해 더한다 — 1행 전개로 det</div><p>\(A=''' + A123 + r'''\)의 \(\det A\)를 1행 기준 여인수 전개로 구하라. 1행 여인수는 \(A_{11}=-3, A_{12}=+6, A_{13}=-3\).</p><ol class="choices"><li>\(6\)</li><li>\(-3\)</li><li data-ok="1">\(0\)</li><li>\(12\)</li></ol><details><summary>답</summary><div class="ans">\(\det A=1(-3)+2(+6)+3(-3)=-3+12-9=0\). 사루스 \((45+84+96)-(105+48+72)=0\)과 같다 ✓.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제 — Ex06 + 변형</h3>
  <div class="q"><div class="qn a">응용 4-1 · 문자 행렬식 (Ex06)</div><p>\(D=\begin{vmatrix}1&a&b+c\\1&b&c+a\\1&c&a+b\end{vmatrix}\)를 여인수 전개로 구하라. 1열이 전부 1이니 1열 기준(부호는 세로로 +, −, +).</p><details><summary>답</summary><div class="ans">\(D=1\cdot(+)''' + V(("b","c+a"),("c","a+b")) + r'''+1\cdot(-)''' + V(("a","b+c"),("c","a+b")) + r'''+1\cdot(+)''' + V(("a","b+c"),("b","c+a")) + r'''\) \(=[b(a+b)-c(c+a)]-[a(a+b)-c(b+c)]+[a(c+a)-b(b+c)]\) → 전부 소거 → \(0\) ✓ (내 풀이본 p.8). 빠른 이유: 2열+3열 = \(a+b+c\)(모든 행 같음) = 상수 × 1열 → 종속.</div></details></div>
  <div class="q"><div class="qn a">응용 4-2 · 0 많은 줄 고르기</div><p>\(\begin{vmatrix}2&0&1\\1&3&0\\0&1&4\end{vmatrix}\)를 가장 편한 줄 기준으로 전개하라.</p><details><summary>답</summary><div class="ans">1행 기준: \(2\cdot''' + V((3,0),(1,4)) + r'''-0+1\cdot''' + V((1,3),(0,1)) + r'''=2\cdot12+1\cdot1=25\). 2열 기준도 \(-0+3\cdot''' + V((2,1),(0,4)) + r'''-1\cdot''' + V((2,1),(1,0)) + r'''=24-(-1)=25\) 같다.</div></details></div>
  <div class="q"><div class="qn a">응용 4-3 · 미지수</div><p>\(\begin{vmatrix}1&2&x\\0&1&2\\1&0&1\end{vmatrix}=0\)인 \(x\)를 구하라.</p><details><summary>답</summary><div class="ans">1행 전개: \(1(1-0)-2(0-2)+x(0-1)=1+4-x=5-x=0\) → \(x=5\).</div></details></div>
</section>

<section>
  <h2><span class="no">파트 5 · 9/8</span>역행렬 — 나눗셈 대신 <span class="star">★</span></h2>
  <h3><span class="tag c">개념</span>곱해서 단위행렬이 되는 행렬</h3>
  <div class="why">행렬엔 나눗셈이 없다. 숫자 3의 역수 \(\tfrac13\)이 "3에 곱하면 1이 되는 수"이듯, \(A\)의 역행렬 \(A^{-1}\)는 <span class="hl">\(AA^{-1}=I=A^{-1}A\)</span>가 되는 행렬이다. 방정식 \(AX=B\)를 풀 때 양변 <b>왼쪽</b>에 \(A^{-1}\)를 곱해 \(X=A^{-1}B\)로 만드는 게 쓰임이다(교환법칙이 없으니 곱하는 쪽이 정해져 있다).</div>
  <div class="concept">
    <p><b>2×2는 공식 하나로 끝난다 (Ex07, 교수님이 퀴즈로 낸 것).</b> 대각선 \(a, d\)를 맞바꾸고, 나머지 \(b, c\)는 부호만 바꾼 뒤, \(\det\)로 나눈다.</p>
    \[A=''' + M(("a","b"),("c","d")) + r'''\ \Rightarrow\ A^{-1}=\frac{1}{\det A}''' + M(("d","-b"),("-c","a")) + r''',\qquad \det A=ad-bc\ne0\]
    <p>\(A=''' + M((4,1),(6,2)) + r'''\): \(\det A=8-6=2\), \(A^{-1}=\tfrac12''' + M((2,-1),(-6,4)) + r'''=''' + M((1,"-\tfrac12"),(-3,2)) + r'''\). 검산 \(AA^{-1}=''' + M(("4\cdot1+1\cdot(-3)","4\cdot(-\tfrac12)+1\cdot2"),("6\cdot1+2\cdot(-3)","6\cdot(-\tfrac12)+2\cdot2")) + r'''=''' + M((1,0),(0,1)) + r'''\) ✓.</p>
  </div>
  <div class="concept">
    <p><b>3×3은 공식이 없어서 여인수로 만든다 (Ex8 ★). 4단계 고정.</b></p>
    <ol>
      <li>\(\det A\)를 구한다. <span class="red">0이면 역행렬이 없다</span> — 여기서 끝.</li>
      <li>여인수 9개 \(A_{11}\sim A_{33}\)를 전부 구한다(파트 4).</li>
      <li>여인수를 자리대로 놓은 행렬을 <b>전치</b>한다 → 이것이 <span class="term" data-k="수반행렬">수반행렬</span> \(\mathrm{adj}(A)\). <span class="red">전치를 빼먹는 게 제일 흔한 실수.</span></li>
      <li>\(A^{-1}=\dfrac{1}{\det A}\,\mathrm{adj}(A)\).</li>
    </ol>
  </div>
  <div class="one">한 줄: 2×2는 대각 바꾸고 부호 바꿔 det로 나눔. 3×3은 det → 여인수 9개 → 전치(adj) → det로 나눔. det=0이면 없다.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것 — 외워서 바로 나와야</div><ul><li>2×2: \(A^{-1}=\frac{1}{\det A}''' + M(("d","-b"),("-c","a")) + r'''\) — 대각 맞바꾸고 나머지 부호 바꿈</li><li>3×3: \(A^{-1}=\frac{1}{\det A}\,\mathrm{adj}(A)\), \(\mathrm{adj}(A)\) = 여인수 행렬의 <b>전치</b></li><li>4단계 수순: det → 여인수 9개 → 전치 → det로 나눔 (Ex8 ★)</li><li><span class="red">\(\det A=0\)이면 역행렬이 없다</span></li></ul></div><div class="mu-und"><div class="mu-h">이해할 것 — 왜 그런지 설명할 수 있어야</div><ul><li>역행렬은 나눗셈 대신: \(AA^{-1}=I=A^{-1}A\)가 되는 행렬</li><li>\(AX=B\)의 양변 <b>왼쪽</b>에 \(A^{-1}\)를 곱해 \(X=A^{-1}B\) — 교환이 안 되니 곱하는 쪽이 정해져 있다</li><li>검산은 \(AA^{-1}\)을 실제로 곱해 \(I\)가 나오는지 보는 것</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제 — 학습지 Ex07(Quiz) · Ex8 부품</h3>
  <div class="q"><div class="qn">기초 5-1 · 2×2 (Ex07)</div><p>\(A=''' + M((4,1),(6,2)) + r'''\)의 역행렬은?</p><ol class="choices"><li data-ok="1">\(''' + M((1,"-\tfrac12"),(-3,2)) + r'''\)</li><li>\(''' + M((2,-1),(-6,4)) + r'''\)</li><li>\(''' + M(("\tfrac14",1),(6,"\tfrac12")) + r'''\)</li><li>\(''' + M((1,"\tfrac12"),(3,2)) + r'''\)</li></ol><details><summary>답</summary><div class="ans">\(\det A=2\ne0\) → \(A^{-1}=\tfrac12''' + M((2,-1),(-6,4)) + r'''=''' + M((1,"-\tfrac12"),(-3,2)) + r'''\) ✓. 2번은 det로 안 나눈 것, 4번은 부호를 안 바꾼 것.</div></details></div>
  <div class="q"><div class="qn">기초 5-2 · 검산</div><p>\(A=''' + M((4,1),(6,2)) + r'''\), \(A^{-1}=''' + M((1,"-\tfrac12"),(-3,2)) + r'''\)를 곱하면 \(AA^{-1}\)은?</p><ol class="choices"><li data-ok="1">\(I=''' + M((1,0),(0,1)) + r'''\) — 단위행렬이 된다</li><li>\(O=''' + M((0,0),(0,0)) + r'''\)</li><li>\(''' + M((1,0),(0,-1)) + r'''\)</li><li>\(2I=''' + M((2,0),(0,2)) + r'''\)</li></ol><details><summary>답</summary><div class="ans">\(''' + M(("4-3","-2+2"),("6-6","-3+4")) + r'''=''' + M((1,0),(0,1)) + r'''\). 역행렬이 맞으면 반드시 \(I\).</div></details></div>
  <div class="q"><div class="qn">기초 5-3 · 2×2 하나 더</div><p>\(''' + M((3,1),(5,2)) + r'''\)의 역행렬은?</p><ol class="choices"><li>\(''' + M((2,1),(5,3)) + r'''\)</li><li>\(''' + M((3,-1),(-5,2)) + r'''\)</li><li data-ok="1">\(''' + M((2,-1),(-5,3)) + r'''\)</li><li>\(''' + M((-2,1),(5,-3)) + r'''\)</li></ol><details><summary>답</summary><div class="ans">\(\det=6-5=1\) → \(''' + M((2,-1),(-5,3)) + r'''\). det가 1이라 나눌 것이 없다.</div></details></div>
  <div class="q"><div class="qn">기초 5-4 · Ex8의 부품 — 여인수 하나</div><p>\(A=''' + EX8 + r'''\)의 여인수 \(A_{23}\)은? 2행·3열을 지우고, 부호판 (2,3) 자리를 본다.</p><ol class="choices"><li>\(+5\)</li><li data-ok="1">\(-5\)</li><li>\(-2\)</li><li>\(7\)</li></ol><details><summary>답</summary><div class="ans">2행·3열을 지우면 \(''' + V((1,2),(-1,3)) + r'''=3+2=5\). (2,3)은 − 자리 → \(A_{23}=-5\). 내 풀이본 p.11과 같음 ✓.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제 — Ex8 + 변형 (★ 3×3 역행렬 유형)</h3>
  <div class="q"><div class="qn a">응용 5-1 · 3×3 수반행렬 (Ex8, 아토 별표)</div><p>\(A=''' + EX8 + r'''\)의 역행렬을 4단계 수순 그대로 구하라. (① det ② 여인수 9개 ③ 전치 ④ det로 나눔)</p><details><summary>답</summary><div class="ans">① 3열에 0이 둘이라 3열로 전개: \(\det A=0-2\cdot''' + V((1,2),(-1,3)) + r'''+0=-2(3+2)=-10\).<br>② 여인수: \(A_{11}=-6,\ A_{12}=-2,\ A_{13}=7,\ A_{21}=0,\ A_{22}=0,\ A_{23}=-5,\ A_{31}=4,\ A_{32}=-2,\ A_{33}=-3\).<br>③ 자리대로 놓고 전치: \(\mathrm{adj}(A)=''' + M((-6,0,4),(-2,0,-2),(7,-5,-3)) + r'''\).<br>④ \(A^{-1}=\tfrac{1}{-10}\mathrm{adj}(A)=''' + M(("\tfrac35",0,"-\tfrac25"),("\tfrac15",0,"\tfrac15"),("-\tfrac{7}{10}","\tfrac12","\tfrac{3}{10}")) + r'''\). 내 풀이본 p.11과 같음 ✓.</div></details></div>
  <div class="q"><div class="qn a">응용 5-2 · 역행렬이 없을 조건</div><p>\(''' + M(("x",2),(3,"x-1")) + r'''\)의 역행렬이 없는 \(x\)를 구하라.</p><details><summary>답</summary><div class="ans">\(\det=x(x-1)-6=x^2-x-6=(x-3)(x+2)=0\) → \(x=3\) 또는 \(-2\). det가 0이면 나눌 수 없어 역행렬이 없다.</div></details></div>
  <div class="q"><div class="qn a">응용 5-3 · 3×3 하나 더</div><p>\(B=''' + M((1,0,2),(0,1,0),(1,0,3)) + r'''\)의 역행렬을 4단계로 구하고 \(BB^{-1}=I\)로 검산하라.</p><details><summary>답</summary><div class="ans">① 2행 기준 전개: \(\det B=1\cdot''' + V((1,2),(1,3)) + r'''=3-2=1\). ② 여인수 \(3,0,-1;\ 0,1,0;\ -2,0,1\). ③ 전치 \(\mathrm{adj}(B)=''' + M((3,0,-2),(0,1,0),(-1,0,1)) + r'''\). ④ det가 1이라 \(B^{-1}=\mathrm{adj}(B)\). 검산 1행: \((1,0,2)\cdot\)각 열 \(=(3-2,\ 0,\ -2+2)=(1,0,0)\) ✓.</div></details></div>
</section>

<section>
  <h2><span class="no">파트 6 · 9/8</span>연립방정식 풀기 — 역행렬 · 크래머의 법칙 <span class="star">★</span></h2>
  <h3><span class="tag c">개념</span>\(AX=B\)로 선언하고 두 가지로 푼다</h3>
  <div class="why">연립일차방정식은 <b>계수 행렬 \(A\) · 미지수 열 \(X\) · 상수 열 \(B\)</b>로 \(AX=B\)라고 쓸 수 있다. 내 풀이본 p.9 메모 "선언 필수" — 풀기 전에 \(A, X, B\)가 무엇인지 먼저 적는다. 그다음 두 길: <span class="hl">① 역행렬 \(X=A^{-1}B\)</span> (2차에 편함) · <span class="hl">② 크래머의 법칙</span> (3차 이상).</div>
  <div class="concept">
    <p><b>① 역행렬로 (Ex9).</b> \(x+2y=1,\ 3x+y=1\) → \(A=''' + M((1,2),(3,1)) + r''',\ X=''' + M(("x",),("y",)) + r''',\ B=''' + M((1,),(1,)) + r'''\).</p>
    <p>\(\det A=1-6=-5\ne0\) → \(A^{-1}=-\tfrac15''' + M((1,-2),(-3,1)) + r'''\) → \(X=A^{-1}B=-\tfrac15''' + M(("1-2",),("-3+1",)) + r'''=-\tfrac15''' + M((-1,),(-2,)) + r'''=''' + M(("\tfrac15",),("\tfrac25",)) + r'''\). 즉 \(x=\tfrac15, y=\tfrac25\).</p>
  </div>
  <div class="concept">
    <p><b>② 크래머의 법칙 — 3차 이상은 이걸로.</b> 조건 \(\det A\ne0\). 답은 행렬식 나눗셈 하나다:</p>
    \[x_j=\frac{\det(A_j)}{\det A},\qquad A_j=A\text{의 }j\text{열을 }B\text{로 바꾼 행렬}\]
    <p><b>왜 j열을 바꾸나</b>: j열은 \(x_j\)의 계수 자리라, 거기에 \(B\)를 넣은 행렬식이 \(x_j\)의 몫이 된다. 내 여백 질문 "j에 1을 못 넣지 않나?" → 일반형 표기일 뿐, \(j=1\)이면 \(B\)가 맨 앞 열, \(j=n\)이면 맨 뒤 열.</p>
    <p>미지수 3개면 행렬식을 <b>4번</b>(\(\det A,\ \det A_1,\ \det A_2,\ \det A_3\)) 계산한다. <span class="red">\(\det A=0\)이면 크래머를 못 쓴다</span> — 해가 없거나 무수히 많다.</p>
  </div>
  <div class="extra" data-title="보충 · Ex10을 크래머로 한 칸씩 — 행렬식 4번">
    <div class="concept">
      <p>\(x_1+2x_2+x_3=4,\ x_1-x_2+x_3=5,\ 2x_1+3x_2-x_3=1\) → \(A=''' + M((1,2,1),(1,-1,1),(2,3,-1)) + r''',\ B=''' + M((4,),(5,),(1,)) + r'''\)</p>
      <div class="tw"><table><thead><tr><th>행렬식</th><th>어느 열을 B로</th><th>값(사루스)</th></tr></thead><tbody>
        <tr><td>\(\det A\)</td><td>—</td><td>\((1+4+3)-(-2-2+3)=9\ne0\)</td></tr>
        <tr><td>\(\det A_1\)</td><td>1열 → \((4,5,1)\)</td><td>\((4+2+15)-(-1-10+12)=20\)</td></tr>
        <tr><td>\(\det A_2\)</td><td>2열 → \((4,5,1)\)</td><td>\((-5+8+1)-(10-4+1)=-3\)</td></tr>
        <tr><td>\(\det A_3\)</td><td>3열 → \((4,5,1)\)</td><td>\((-1+20+12)-(-8+2+15)=22\)</td></tr>
      </tbody></table></div>
      <p>\(x_1=\tfrac{20}{9},\ x_2=-\tfrac{3}{9}=-\tfrac13,\ x_3=\tfrac{22}{9}\). 검산 1식: \(\tfrac{20-6+22}{9}=\tfrac{36}{9}=4\) ✓. 내 풀이본 p.14와 같음.</p>
    </div>
  </div>
  <div class="one">한 줄: A·X·B부터 선언 → det A ≠ 0 확인 → 2차는 역행렬, 3차는 열을 B로 바꾼 행렬식 ÷ det A.</div>
  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것 — 외워서 바로 나와야</div><ul><li>역행렬 풀이 \(X=A^{-1}B\)</li><li>크래머 \(x_j=\dfrac{\det(A_j)}{\det A}\), \(A_j\) = \(A\)의 j열을 \(B\)로 바꾼 행렬</li><li>조건 \(\det A\ne0\) 먼저 확인</li></ul></div><div class="mu-und"><div class="mu-h">이해할 것 — 왜 그런지 설명할 수 있어야</div><ul><li>왜 j열을 바꾸나: j열은 \(x_j\)의 계수 자리라, 거기에 \(B\)를 넣은 행렬식이 \(x_j\) 몫이 된다</li><li>\(\det A=0\)이면 해가 없거나 무수히 많다(두 식이 같은 식) — 크래머 못 씀</li><li>미지수 3개면 행렬식을 4번 계산한다 — 3차부터는 역행렬보다 크래머가 편하다</li></ul></div></div>
  <h3><span class="tag b">개념 이해</span>기초 문제 — 학습지 Ex9</h3>
  <div class="q"><div class="qn">기초 6-1 · 역행렬로 (Ex9)</div><p>\(x+2y=1,\ 3x+y=1\)을 계수행렬·미지수·상수 열로 놓고 역행렬로 풀면?</p><ol class="choices"><li>\(x=\tfrac25,\ y=\tfrac15\)</li><li data-ok="1">\(x=\tfrac15,\ y=\tfrac25\)</li><li>\(x=-\tfrac15,\ y=-\tfrac25\)</li><li>\(x=1,\ y=0\)</li></ol><details><summary>답</summary><div class="ans">\(\det A=-5\), \(A^{-1}=-\tfrac15''' + M((1,-2),(-3,1)) + r'''\), \(X=-\tfrac15''' + M((-1,),(-2,)) + r'''=''' + M(("\tfrac15",),("\tfrac25",)) + r'''\) ✓. 검산: \(\tfrac15+\tfrac45=1\).</div></details></div>
  <div class="q"><div class="qn">기초 6-2 · 같은 문제를 크래머로</div><p>\(x+2y=1,\ 3x+y=1\)을 크래머 공식으로 풀면? (\(\det A=-5\))</p><ol class="choices"><li data-ok="1">\(\det A_1=-1,\ \det A_2=-2\) → \(x=\tfrac15,\ y=\tfrac25\)</li><li>\(\det A_1=-1,\ \det A_2=-2\) → \(x=-1,\ y=-2\)</li><li>\(\det A_1=1,\ \det A_2=2\) → \(x=-\tfrac15,\ y=-\tfrac25\)</li><li>\(\det A_1=-2,\ \det A_2=-1\) → \(x=\tfrac25,\ y=\tfrac15\)</li></ol><details><summary>답</summary><div class="ans">\(\det A_1=''' + V((1,2),(1,1)) + r'''=-1\), \(\det A_2=''' + V((1,1),(3,1)) + r'''=-2\) → \(x=\tfrac{-1}{-5}=\tfrac15\), \(y=\tfrac{-2}{-5}=\tfrac25\). 역행렬로 푼 답과 같다.</div></details></div>
  <div class="q"><div class="qn">기초 6-3 · 2차 크래머</div><p>\(2x+y=5,\ x-y=1\)을 크래머로 풀면?</p><ol class="choices"><li>\(x=1,\ y=2\)</li><li data-ok="1">\(x=2,\ y=1\)</li><li>\(x=-2,\ y=-1\)</li><li>\(x=3,\ y=-1\)</li></ol><details><summary>답</summary><div class="ans">\(\det A=-2-1=-3\), \(\det A_1=''' + V((5,1),(1,-1)) + r'''=-6\), \(\det A_2=''' + V((2,5),(1,1)) + r'''=-3\) → \(x=2,\ y=1\). 검산 \(4+1=5\) ✓.</div></details></div>
  <h3><span class="tag a">응용</span>응용 문제 — Ex10 + 변형</h3>
  <div class="q"><div class="qn a">응용 6-1 · 3차 크래머 (Ex10)</div><p>\(x_1+2x_2+x_3=4,\ x_1-x_2+x_3=5,\ 2x_1+3x_2-x_3=1\)을 크래머로 풀어라. (계수행렬·상수 열 선언 → 행렬식 → 열을 바꾼 행렬식 셋 → 나눗셈)</p><details><summary>답</summary><div class="ans">① \(A=''' + M((1,2,1),(1,-1,1),(2,3,-1)) + r''',\ B=''' + M((4,),(5,),(1,)) + r'''\). ② \(\det A=9\ne0\). ③ \(\det A_1=20,\ \det A_2=-3,\ \det A_3=22\). ④ \(x_1=\tfrac{20}{9},\ x_2=-\tfrac13,\ x_3=\tfrac{22}{9}\) ✓. 검산 1식 \(\tfrac{20-6+22}{9}=4\).</div></details></div>
  <div class="q"><div class="qn a">응용 6-2 · 해가 유일하지 않을 조건</div><p>\(x+2y=3,\ 2x+ky=6\)이 유일한 해를 갖지 않는 \(k\)는? 그때 해는?</p><details><summary>답</summary><div class="ans">\(\det A=k-4=0\) → \(k=4\). 두 식이 같은 식(2배)이라 해가 무수히 많다. \(k\ne4\)면 크래머로 유일.</div></details></div>
  <div class="q"><div class="qn a">응용 6-3 · 3차 하나 더</div><p>\(x+y+z=6,\ x-y+z=2,\ 2x+y-z=1\)을 크래머로 풀어라.</p><details><summary>답</summary><div class="ans">\(\det A=6\), \(\det A_1=6\), \(\det A_2=12\), \(\det A_3=18\) → \(x=1,\ y=2,\ z=3\). 검산 \(1+2+3=6\) ✓.</div></details></div>
</section>
'''
s = s[:i0] + NEW + s[i1:]
s = s.replace(chr(9) + "frac", chr(92) + "tfrac")   # 비raw 문자열의 	 탭 복구
io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("parts 4-6 rewritten")
