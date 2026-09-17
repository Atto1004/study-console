# -*- coding: utf-8 -*-
"""행렬 노트 v2: 파트 2 기초 2-2와 2-3 사이에 보충(div.extra) — Ex02 (3)(4)(5)가 막히는 지점을 한 칸씩. (아토 2026-09-17 "예제 2-3부터 이해 안 돼"). 멱등."""
import io, re
P = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\미분적분학2\_정리노트\\2026-09-17_행렬_1-2주차_개념학습.html"
s = io.open(P, encoding="utf-8").read()
if 'class="extra"' in s:
    print("already"); raise SystemExit
m = re.search(r'(<div class="q"><div class="qn">기초 2-2 · 실수배.*?</details></div>)', s, re.S)
assert m
extra = r"""
  <div class="extra" data-title="보충 ① · Ex02 (3) A−2B는 두 단계">
    <div class="why">여기서 막히는 건 정상이다. (1)(2)는 <b>같은 자리끼리</b>만 보면 되지만, (3)은 <b>두 단계</b>(실수배 → 뺄셈)다.</div>
    <div class="concept">
      <p>\(A=\begin{pmatrix}3&2\\6&3\\5&4\end{pmatrix}\), \(B=\begin{pmatrix}2&4\\0&3\\0&2\end{pmatrix}\)</p>
      <p><b>① 먼저 \(2B\)</b>: 모든 성분에 2를 곱한다 → \(2B=\begin{pmatrix}4&8\\0&6\\0&4\end{pmatrix}\)</p>
      <p><b>② 그다음 같은 자리끼리 뺀다</b> → \(A-2B=\begin{pmatrix}3-4&2-8\\6-0&3-6\\5-0&4-4\end{pmatrix}=\begin{pmatrix}-1&-6\\6&-3\\5&0\end{pmatrix}\)</p>
    </div>
    <div class="one">한 줄: 실수배 먼저, 뺄셈은 같은 자리끼리. 꼴(3×2)은 그대로.</div>
  </div>
  <div class="extra" data-title="보충 ② · Ex02 (4) AB^t — 꼴부터, 그다음 한 칸씩">
    <div class="why">(4)는 <b>전치 + 곱</b>. 곱은 자리끼리가 아니라 <span class="hl">앞 행 × 뒤 열</span>이라 규칙이 바뀐다. 이게 막히는 진짜 지점.</div>
    <div class="concept">
      <p>\(B^t=\begin{pmatrix}2&0&0\\4&3&2\end{pmatrix}\)(행·열 맞바꿈). \(A\)는 3×2, \(B^t\)는 2×3 → <span class="hl">앞의 열 수 2 = 뒤의 행 수 2</span>라 곱할 수 있고, 결과는 <b>3×3</b>(앞의 행 × 뒤의 열).</p>
      <p>결과의 <b>(i행, j열)</b> 칸 = \(A\)의 i행과 \(B^t\)의 j열을 <b>짝지어 곱해 더한다</b>. 1열부터(내 풀이본 p.4 여백 계산 그대로):</p>
      <div class="tw"><table><thead><tr><th>칸</th><th>A의 행</th><th>B^t의 열</th><th>계산</th></tr></thead><tbody>
        <tr><td>(1,1)</td><td>\((3,\,2)\)</td><td>\((2,\,4)\)</td><td>\(3\cdot2+2\cdot4=6+8=\mathbf{14}\)</td></tr>
        <tr><td>(2,1)</td><td>\((6,\,3)\)</td><td>\((2,\,4)\)</td><td>\(6\cdot2+3\cdot4=12+12=\mathbf{24}\)</td></tr>
        <tr><td>(3,1)</td><td>\((5,\,4)\)</td><td>\((2,\,4)\)</td><td>\(5\cdot2+4\cdot4=10+16=\mathbf{26}\)</td></tr>
        <tr><td>(1,2)</td><td>\((3,\,2)\)</td><td>\((0,\,3)\)</td><td>\(3\cdot0+2\cdot3=\mathbf{6}\)</td></tr>
      </tbody></table></div>
      <p>같은 식으로 아홉 칸 → \(AB^t=\begin{pmatrix}14&6&4\\24&9&6\\26&12&8\end{pmatrix}\). <span class="red">같은 자리끼리 곱하는 게 아니다</span> — 칸 하나에 곱셈 두 번, 덧셈 한 번.</p>
    </div>
    <div class="one">한 줄: 꼴(m×n)(n×r)=m×r 확인 → 칸마다 「앞 행 × 뒤 열」 짝지어 곱해 더한다.</div>
  </div>
  <div class="extra" data-title="보충 ③ · Ex02 (5) A² = AA — 같은 규칙">
    <div class="why">거듭제곱은 그냥 자기 자신과의 곱. 규칙은 (4)와 똑같다.</div>
    <div class="concept">
      <p>\(A=\begin{pmatrix}1&2&5\\2&4&10\\-1&-2&-5\end{pmatrix}\). 3×3 · 3×3 → 3×3.</p>
      <p>(1,1) 칸 = 1행 \((1,2,5)\) × 1열 \((1,2,-1)\) = \(1\cdot1+2\cdot2+5\cdot(-1)=1+4-5=0\)</p>
      <p>(1,2) 칸 = 1행 \((1,2,5)\) × 2열 \((2,4,-2)\) = \(2+8-10=0\), (2,1) 칸 = 2행 \((2,4,10)\) × 1열 \((1,2,-1)\) = \(2+8-10=0\) …</p>
      <p>아홉 칸이 전부 0 → \(A^2=O\). 왜 전부 0인가: 모든 열이 \((1,2,-1)\)의 배수이고 \((1,2,5)\cdot(1,2,-1)=0\)이라서.</p>
    </div>
    <div class="one">한 줄: A² = A×A, 칸마다 「앞 행 × 뒤 열」. 숫자가 아닌데도 제곱이 0이 될 수 있다.</div>
  </div>"""
s = s[:m.end()] + extra + s[m.end():]
io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("extra added")
