# -*- coding: utf-8 -*-
"""행렬 노트 v2: 파트마다 「암기할 것 / 이해할 것」 상자(div.mu)를 한 줄 요약(div.one) 바로 뒤에 넣는다 (아토 2026-09-17 "암기해야 하는 거 이해해야 하는 거 구분!"). 멱등."""
import io, re
P = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\미분적분학2\_정리노트\2026-09-17_행렬_1-2주차_개념학습.html"
s = io.open(P, encoding="utf-8").read()
MU = {
 1: (["성분 \\(a_{ij}\\): <b>i = 행, j = 열</b> (앞이 줄, 뒤가 칸)",
      "다섯 종류의 이름과 기호: 정사각(n차) · 단위 \\(I_n\\)(대각선 1) · 영 \\(O\\) · 전치 \\(A^t\\)(\\(a_{ij}\\to a_{ji}\\)) · 대칭(\\(A^t=A\\))",
      "<span class=\"red\">대칭행렬은 정사각행렬에서만</span> 말한다"],
     ["행렬 = 연립방정식의 계수만 뽑아 넣은 상자. 그래서 행렬을 다루면 방정식을 다루는 것",
      "전치 = 행과 열을 맞바꿈 → m×n이 n×m이 된다(2×3의 전치는 3×2)",
      "대칭 = 대각선을 거울로 놓고 접어도 같다. 그래서 \\(A^t=A\\)"]),
 2: (["곱의 성분 \\(c_{ij}=\\sum_k a_{ik}b_{kj}\\) — <b>앞 행 × 뒤 열</b>",
      "곱 가능 조건과 꼴: \\((m\\times n)(n\\times r)=m\\times r\\) — 앞의 열 수 = 뒤의 행 수",
      "거듭제곱 법칙 \\(A^rA^s=A^{r+s}\\), \\((A^r)^s=A^{rs}\\)",
      "<span class=\"hl\">교수: 덧셈·실수배는 시험에 안 나온다</span> — 곱셈에 집중"],
     ["덧셈·실수배는 같은 자리끼리. 그래서 꼴이 같아야만 더한다",
      "곱은 <span class=\"red\">교환법칙이 안 된다</span>(\\(AB\\ne BA\\)) — 앞 행·뒤 열 규칙 때문",
      "숫자가 아닌데도 \\(A^2=O\\)가 될 수 있다(Ex02 (5)) — 행·열이 서로 배수라 곱하면 다 0"]),
 3: (["2차: \\(\\det A=ad-bc\\)",
      "3차 사루스: ↘ 세 개 더하고 ↙ 세 개 뺀다 — 화살표 6개 순서까지",
      "표기 \\(\\det A=|A|\\), <span class=\"red\">세로줄과 det는 반드시 쓴다</span>",
      "<span class=\"star\">★ 시험은 행렬식부터 · 계산기 없이 손으로 3차까지</span>"],
     ["행렬식 = 정사각행렬을 숫자 하나로 요약한 것(정사각이 아니면 없다)",
      "\\(\\det=0\\)이면 뒤에서 역행렬이 없고 연립방정식의 해가 유일하지 않다 — 그래서 먼저 확인한다",
      "↙ 방향에 −가 붙는 이유: 2차 \\(ad-bc\\)의 확장"]),
 4: (["여인수 \\(A_{ij}=(-1)^{i+j}M_{ij}\\)",
      "부호판 \\(\\begin{pmatrix}+&-&+\\\\-&+&-\\\\+&-&+\\end{pmatrix}\\) — 체스판, (1,1)은 +",
      "전개식 \\(\\det A=a_{11}A_{11}+a_{12}A_{12}+a_{13}A_{13}\\) (한 행 또는 한 열 기준)"],
     ["소행렬식 \\(M_{ij}\\) = 그 성분의 행과 열을 지우고 남은 2차 행렬식",
      "어느 행·열로 전개해도 값이 같다 → <b>0이 많은 줄</b>을 고르면 계산이 준다",
      "사루스와 같은 값이 나온다 — 같은 여섯 항을 묶어 쓴 것뿐(Ex05·Ex06으로 확인)"]),
 5: (["2×2: \\(A^{-1}=\\frac{1}{\\det A}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}\\) — 대각 맞바꾸고 나머지 부호 바꿈",
      "3×3: \\(A^{-1}=\\frac{1}{\\det A}\\,\\mathrm{adj}(A)\\), \\(\\mathrm{adj}(A)\\) = 여인수 행렬의 <b>전치</b>",
      "4단계 수순: det → 여인수 9개 → 전치 → det로 나눔 (Ex8 ★)",
      "<span class=\"red\">\\(\\det A=0\\)이면 역행렬이 없다</span>"],
     ["역행렬은 나눗셈 대신: \\(AA^{-1}=I=A^{-1}A\\)가 되는 행렬",
      "\\(AX=B\\)의 양변 <b>왼쪽</b>에 \\(A^{-1}\\)를 곱해 \\(X=A^{-1}B\\) — 교환이 안 되니 곱하는 쪽이 정해져 있다",
      "검산은 \\(AA^{-1}\\)을 실제로 곱해 \\(I\\)가 나오는지 보는 것"]),
 6: (["역행렬 풀이 \\(X=A^{-1}B\\)",
      "크래머 \\(x_j=\\dfrac{\\det(A_j)}{\\det A}\\), \\(A_j\\) = \\(A\\)의 j열을 \\(B\\)로 바꾼 행렬",
      "조건 \\(\\det A\\ne0\\) 먼저 확인"],
     ["왜 j열을 바꾸나: j열은 \\(x_j\\)의 계수 자리라, 거기에 \\(B\\)를 넣은 행렬식이 \\(x_j\\) 몫이 된다",
      "\\(\\det A=0\\)이면 해가 없거나 무수히 많다(두 식이 같은 식) — 크래머 못 씀",
      "미지수 3개면 행렬식을 4번(det A, det A₁, A₂, A₃) 계산한다 — 3차부터는 역행렬보다 크래머가 편하다"]),
}
def box(mem, und):
    li = lambda xs: "".join("<li>" + x + "</li>" for x in xs)
    return ('\n  <div class="mu"><div class="mu-mem"><div class="mu-h">암기할 것 — 외워서 바로 나와야</div><ul>' + li(mem) + '</ul></div>'
            '<div class="mu-und"><div class="mu-h">이해할 것 — 왜 그런지 설명할 수 있어야</div><ul>' + li(und) + '</ul></div></div>')
ones = [m for m in re.finditer(r'<div class="one">.*?</div>', s)]
assert len(ones) == 6, len(ones)
if 'class="mu"' not in s:
    out, last = "", 0
    for k, m in enumerate(ones, 1):
        out += s[last:m.end()] + box(*MU[k]); last = m.end()
    s = out + s[last:]
    s = s.replace("</style>", ".mu{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 14px}.mu>div{border-radius:10px;padding:10px 12px 8px}.mu-mem{background:#FFF8C4;border:1.5px solid #E6C84A}.mu-und{background:#E8F0FB;border:1.5px solid #8EB4E6}.mu-h{font-weight:700;font-size:.92em;margin-bottom:4px}.mu-mem .mu-h{color:#7A5A00}.mu-und .mu-h{color:#1B4F8C}.mu ul{margin:0;padding-left:18px}.mu li{margin:3px 0;font-size:.95em}@media(max-width:600px){.mu{grid-template-columns:1fr}}\n</style>", 1)
    # 맨 위 안내(0절 앞) 범례
    s = s.replace('<section>', '<div class="mu-legend"><span class="lg-m">노랑 = 암기할 것</span> <span class="lg-u">파랑 = 이해할 것</span> — 파트마다 한 줄 요약 아래에 있다. 시험 직전엔 노랑만, 막히면 파랑을 읽는다.</div>\n<section>', 1)
    s = s.replace("</style>", ".mu-legend{margin:8px 0 16px;font-size:.92em;color:#3F4C5A}.lg-m{background:#FFF8C4;border:1px solid #E6C84A;border-radius:6px;padding:1px 8px}.lg-u{background:#E8F0FB;border:1px solid #8EB4E6;border-radius:6px;padding:1px 8px}\n</style>", 1)
    io.open(P, "w", encoding="utf-8", newline="\n").write(s); print("mu added 6")
else:
    print("already")
