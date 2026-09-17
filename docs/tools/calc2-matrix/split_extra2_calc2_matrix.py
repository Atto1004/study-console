# -*- coding: utf-8 -*-
"""보충 ②를 두 장으로: ②-1 꼴부터 / ②-2 한 칸씩 (1024×768에서 스크롤 없이). 멱등."""
import io, re
P = r"C:\Users\user\Desktop\아톰OS\기술실\study-materials\미분적분학2\_정리노트\2026-09-17_행렬_1-2주차_개념학습.html"
s = io.open(P, encoding="utf-8").read()
if "보충 ②-2" in s:
    print("already"); raise SystemExit
m = re.search(r'  <div class="extra" data-title="보충 ② · Ex02 \(4\) AB\^t — 꼴부터, 그다음 한 칸씩">.*?\n  </div>', s, re.S)
assert m, "extra 2 not found"
blk = m.group(0)
# 분리 지점: "결과의 <b>(i행, j열)</b>" 문단부터 표까지를 ②-2로
i = blk.index("      <p>결과의 <b>(i행, j열)</b>")
head = blk[:i]
tail = blk[i:]
# head 마무리
head = head.replace('data-title="보충 ② · Ex02 (4) AB^t — 꼴부터, 그다음 한 칸씩"', 'data-title="보충 ②-1 · Ex02 (4) AB^t — 먼저 꼴(몇×몇)부터"')
head += '    </div>\n    <div class="one">한 줄: 전치부터 쓰고, (m×n)(n×r)=m×r로 곱할 수 있는지와 결과 꼴을 먼저 정한다.</div>\n  </div>\n'
# tail 을 새 extra로
tail = ('  <div class="extra" data-title="보충 ②-2 · Ex02 (4) AB^t — 한 칸씩 짝지어 곱해 더한다">\n'
        '    <div class="concept">\n' + tail)
tail = tail.replace('    <div class="one">한 줄: 꼴(m×n)(n×r)=m×r 확인 → 칸마다 「앞 행 × 뒤 열」 짝지어 곱해 더한다.</div>',
                    '    <div class="one">한 줄: 칸마다 「앞 행 × 뒤 열」을 짝지어 곱해 더한다. 칸 하나 = 곱셈 두 번 + 덧셈 한 번.</div>')
s = s[:m.start()] + head + tail + s[m.end():]
io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("split ok")
