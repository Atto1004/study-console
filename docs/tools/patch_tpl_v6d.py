# -*- coding: utf-8 -*-
"""덱 템플릿 v6d — 본문 서체 교체 (아토 2026-09-21 "손글씨체 말고 더 이쁜 대안 있으면 적용해도 됨"):
  Nanum Pen Script → Gowun Dodum(고운돋움, 둥근 산세리프 — 학습지 느낌, 가독성) 본문·보기·제목. UI 는 Pretendard, 수식은 KaTeX 그대로.
  글꼴 경고도 Gowun Dodum 기준. 사이즈는 x-height 가 커서 한 단계 줄임.
  FONT 변수로 다른 후보(Pretendard 등)도 같은 스크립트로 바꿀 수 있다.
템플릿 + 덱 5개. 멱등(폰트명 기준)."""
import io, glob, sys
ROOT = r"C:\Users\user\Desktop\아톰OS\기술실\study-console"
FILES = [ROOT + r"\docs\tools\slides_tpl.html", r"C:\Users\user\.claude\scratch\sc_test\slides_tpl.html"] + glob.glob(ROOT + r"\notes\*slides*.html")
FONT = sys.argv[1] if len(sys.argv) > 1 else "Gowun Dodum"
GF = {"Gowun Dodum": "Gowun+Dodum", "Gowun Batang": "Gowun+Batang:wght@400;700", "Noto Serif KR": "Noto+Serif+KR:wght@400;600", "IBM Plex Sans KR": "IBM+Plex+Sans+KR:wght@400;600"}
link_old = '<link href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=block" rel="stylesheet">'
link_new = ('<link href="https://fonts.googleapis.com/css2?family=%s&display=swap" rel="stylesheet">' % GF[FONT]) if FONT in GF else ""
CSS = '''
/* ===== V6D 본문 서체: %s (아토 2026-09-21 "손글씨 대신 더 이쁜 대안") ===== */
:root{--font-hand:'%s',Pretendard,-apple-system,"Malgun Gothic","Apple SD Gothic Neo",sans-serif;--fs-title:clamp(24px,3.2vh,32px);--fs-body:clamp(17px,2.4vh,23px);--fs-note:clamp(13px,1.8vh,16px)}
html,body{line-height:1.55}
#body h1,#body h2{font-weight:700;letter-spacing:-.01em}
#body .why,#body .concept,#body .one,#body .say{line-height:1.6}
''' % (FONT, FONT)

def patch(p):
    s = io.open(p, encoding="utf-8").read()
    if ("V6D 본문 서체: %s" % FONT) in s: print("skip", p[-40:]); return
    import re
    s = re.sub(r"\n/\* ===== V6D 본문 서체:.*?\n(?=/\* =====|</style>)", "\n", s, flags=re.S)   # 다른 후보로 바꿀 때 이전 블록 제거
    if link_old in s: s = s.replace(link_old, link_new, 1)
    elif link_new and link_new not in s: s = s.replace("<style>", link_new + "\n<style>", 1)
    s = s.replace("</style>", CSS + "</style>", 1)
    s = re.sub(r'document\.fonts\.check\("22px \'[^\']+\'"\)', 'document.fonts.check("22px \'%s\'")' % FONT, s)
    io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p[-40:], "→", FONT)

for f in FILES: patch(f)
