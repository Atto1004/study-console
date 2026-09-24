# -*- coding: utf-8 -*-
"""V6E — 덱 템플릿 「문제만 풀기」 모드 (#quiz). 대표님 2026-09-24 "학습앱에서 시험공부할 수 있게 세팅".
- #quiz 로 열면 문제(type q) 장만 + 시작 장 + 전체 결과 장. 개념·암기·파트 결과 장은 뺀다.
- 저장 키 분리: mc-slides-<deck>-quiz. 학습 진행(mc-slides-<deck>)·이어서 학습 위치(mc-slides-last*)는 건드리지 않는다.
멱등: 이미 적용돼 있으면 아무것도 안 한다. 사용: python patch_tpl_v6e.py"""
import io, os
P = os.path.join(os.path.dirname(os.path.abspath(__file__)), "slides_tpl.html")
s = io.open(P, encoding="utf-8").read().replace("\r\n", "\n")
if "V6E-QUIZ" in s:
    print("이미 적용됨"); raise SystemExit(0)

def rep(old, new):
    global s
    assert s.count(old) == 1, "패치 대상이 정확히 하나여야 함: " + old[:60]
    s = s.replace(old, new, 1)

rep('const PARTS=__PARTS__;\n',
    'const PARTS=__PARTS__;\n'
    '/* V6E-QUIZ: #quiz 로 열면 문제 장만(시작·전체 결과 포함). 저장 키를 분리하고 이어서-학습 위치는 건드리지 않는다 (대표님 2026-09-24 시험 대비) */\n'
    'const QUIZ=(location.hash==="#quiz");\n'
    'if(QUIZ){ const qs=SLIDES.filter(x=>x.type==="q"); SLIDES.length=0; SLIDES.push({id:"start",type:"start"}); qs.forEach(q=>SLIDES.push(q)); SLIDES.push({id:"final",type:"final"}); }\n')
rep('const KEY="mc-slides-"+DECK_ID;', 'const KEY="mc-slides-"+DECK_ID+(QUIZ?"-quiz":"");')
rep('const li=lastInfo(); if(li){', 'const li=QUIZ?null:lastInfo(); if(li){')
rep("'<div class=\"cover\"><div class=\"kicker\">학습 슬라이드 · 가로 화면</div><div class=\"big\">__TITLE__</div>'+",
    "'<div class=\"cover\"><div class=\"kicker\">'+(QUIZ?\"문제만 풀기 · 시험 대비\":\"학습 슬라이드 · 가로 화면\")+'</div><div class=\"big\">__TITLE__</div>'+")
rep("'<div class=\"sub\">파트 '+num(PARTS.length)+'개 · 문제 '+num(SLIDES.filter(x=>x.type===\"q\").length)+'개</div></div>';",
    "'<div class=\"sub\">'+(QUIZ?'문제 '+num(SLIDES.filter(x=>x.type===\"q\").length)+'개 · 보기를 누르면 바로 채점 · 끝 장에서 틀린 문제만 다시':'파트 '+num(PARTS.length)+'개 · 문제 '+num(SLIDES.filter(x=>x.type===\"q\").length)+'개')+'</div></div>';")
io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("V6E 적용 · size", len(s))
