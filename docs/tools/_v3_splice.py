# -*- coding: utf-8 -*-
"""교실 템플릿 v3 스킨 교체(2026-09-28): <style> 블록을 _v3_style.css 로, 칠판 마크업(.frame/.green/.tray)을 .slide 로, 글꼴 링크를 Pretendard+Gothic A1+Gowun Dodum+Inter 로. JS 는 그대로(다른 스크립트가 고친다). 멱등."""
import io, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
TPL = os.path.join(HERE, "classroom_tpl.html")
CSS = io.open(os.path.join(HERE, "_v3_style.css"), encoding="utf-8").read().rstrip("\n") + "\n"
s = io.open(TPL, encoding="utf-8").read().replace("\r\n", "\n")
# 1) 머리 주석·글꼴 링크
s = re.sub(r"<!-- 교실 모드 템플릿 v2.*?-->", "<!-- 교실 모드 템플릿 v3 (대표님 2026-09-28: 메가스터디처럼 세련·깔끔 — 흰 강의 슬라이드 + 네이비 머리띠, 판서 = 단계별 핵심 카드(형광펜·식 카드·함정 카드), 그림 = 단계 애니메이션(선 그리기·페이드·맥동) + 다시 보기, 글꼴 = 제목 Gothic A1 · 본문 Pretendard · 말풍선 Gowun Dodum · 숫자 Inter · 말투 = 일타강사 구어체 존댓말)\n     v2 회차(D.v===2)는 판서 파일(BOARD)로 만든 단계(판서 줄 누적 + 그림 단계 + 대사), v1 회차는 원문 문단 그대로(「구버전 판서」 표시).\n     저장: mc-tutor(전역 XP·연속일·하트·호감도 + 회차 위치 {mode,cid,sid,qi,ver}) + mc-lesson-<id>(챕터 읽음·문제, 수업 노트·앱 V52 와 공유). 오타 설계 회의 1·2차 + 구현 검수 1~6차 조건 반영. -->", s, count=1, flags=re.S)
s = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com/css2\?[^"]*">',
           '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Gothic+A1:wght@700;800&family=Inter:wght@500;600;700&display=swap">', s, count=1)
# 2) <style> 블록 교체
i0 = s.find("<style>"); i1 = s.find("</style>", i0)
assert i0 > 0 and i1 > i0
s = s[:i0] + "<style>\n" + CSS + s[i1:]
# 3) 칠판 마크업 → 슬라이드
old_board = re.search(r'    <div class="frame">.*?<div class="tray">.*?</div>\n', s, flags=re.S)
assert old_board, "칠판 마크업을 못 찾음"
s = s[:old_board.start()] + '    <div class="slide"><div class="chk" id="chk"></div><div id="bwrap"><div id="bc"></div></div></div>\n' + s[old_board.end():]
assert s.count('id="bwrap"') == 1 and s.count('class="tray"') == 0 and s.count('class="green"') == 0
io.open(TPL, "w", encoding="utf-8", newline="\n").write(s)
print("v3 splice ok · size", len(s))
