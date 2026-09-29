# -*- coding: utf-8 -*-
"""생성기·판서 파일에서 태그가 아닌 '<'(TeX 부등호 등)가 HTML 태그로 읽힐 위치를 찾는다 — 오타 4차 ①(em1 9/11 '-\\pi/2<x<\\pi/2')"""
import re, glob, io, os, sys
os.chdir(r"C:\Users\user\Desktop\아톰OS\기술실\study-console\docs\tools\lessons")
TAGS = ("b|i|br|p|div|span|li|ol|ul|h[1-6]|sup|sub|small|em|strong|details|summary|figure|figcaption|img|table|thead|tbody|tr|td|th|code|kbd|a|section|header|"
        "svg|g|path|line|circle|rect|text|polygon|polyline|ellipse|defs|marker|use|tspan|style|script|hr|blockquote|mark|u|s|dl|dt|dd|pre|nav|main|footer|label|input|button|iframe|meta|link|title|html|head|body|clipPath|foreignObject|pattern|linearGradient|stop|filter|feGaussianBlur")
tag_re = re.compile(r"<(" + TAGS + r")(?=[\s>/])")
n = 0
for f in sorted(glob.glob("*.py") + glob.glob("board/*.py")):
    s = io.open(f, encoding="utf-8").read()
    for m in re.finditer(r"<(?=[A-Za-z\\])", s):
        if tag_re.match(s, m.start()): continue
        ln = s.count("\n", 0, m.start()) + 1
        print(f, ln, repr(s[max(0, m.start() - 30):m.start() + 30])); n += 1
print("suspects", n)
