# -*- coding: utf-8 -*-
"""덱 템플릿 v6c — 여백 제거 (아토 2026-09-21 "학습하기 여백이 너무 많고 디자인 수정이 제일 시급"):
  ① 16:10 고정 스테이지 → 뷰포트 전체(회색 띠 없음). 아주 넓은 화면만 1400px 로 제한
  ② 글자 크기가 화면 높이에 따라(clamp) — 큰 화면에서 작게 남던 본문이 채워진다
  ③ 문제 장: 보기 카드가 남은 높이를 나눠 채움(grid-auto-rows 1fr), 문제 본문 살짝 크게
  ④ 개념·표지 장: 넘치지 않는 내용은 세로 가운데
템플릿 + 덱 5개. 멱등."""
import io, glob
ROOT = r"C:\Users\user\Desktop\아톰OS\기술실\study-console"
FILES = [ROOT + r"\docs\tools\slides_tpl.html", r"C:\Users\user\.claude\scratch\sc_test\slides_tpl.html"] + glob.glob(ROOT + r"\notes\*slides*.html")
CSS = r'''
/* ===== V6C 여백 제거 (아토 2026-09-21) ===== */
:root{--fs-title:clamp(26px,3.6vh,36px);--fs-body:clamp(18px,2.7vh,26px);--fs-note:clamp(13px,1.9vh,18px)}
body{padding:0;display:block}
#stage{width:100vw;height:100dvh;max-width:none;aspect-ratio:auto;border:0;border-radius:0;box-shadow:none;margin:0}
@media(min-width:1480px){#stage{width:1400px;margin:0 auto;border-left:1px solid var(--line);border-right:1px solid var(--line)}}
#top{padding:10px clamp(16px,3vw,40px)}
#foot{padding:10px clamp(16px,3vw,40px)}
#body{padding:clamp(14px,3vh,28px) clamp(20px,4vw,56px) clamp(10px,2vh,20px)}
#body:not(.q-mode):not(.scrollable){display:flex;flex-direction:column;justify-content:center}
#body:not(.q-mode):not(.scrollable)>*{flex:0 0 auto}
#body:not(.q-mode):not(.scrollable){--cs:1;font-size:calc(var(--fs-body)*var(--cs))}
#body:not(.q-mode):not(.scrollable) h1,#body:not(.q-mode):not(.scrollable) h2{font-size:calc(var(--fs-title)*var(--cs))}
#body:not(.q-mode):not(.scrollable) :is(.why,.concept,.one,.say,.extra,.mu>div){padding:calc(12px*var(--cs)) calc(16px*var(--cs))}
@media(min-height:680px) and (min-width:900px){#body:not(.q-mode):not(.scrollable){--cs:1.12}}
@media(min-height:760px) and (min-width:1100px){#body:not(.q-mode):not(.scrollable){--cs:1.22}}
@media(min-width:1300px){#body{padding-left:max(56px,calc((100% - 1180px)/2));padding-right:max(56px,calc((100% - 1180px)/2))}}
#body.q-mode{--qs:1}
@media(min-height:680px) and (min-width:900px){#body.q-mode{--qs:1.15}}
@media(min-height:760px) and (min-width:1000px){#body.q-mode{--qs:1.3}}
@media(min-height:900px) and (min-width:1100px){#body.q-mode{--qs:1.45}}
#body.q-mode h2{font-size:calc(var(--fs-title)*var(--qs))}
#body.q-mode .qbody{font-size:calc(var(--fs-body)*1.1*var(--qs));margin-top:8px}
#body.q-mode{justify-content:safe center}
#body.q-mode .choices{flex:0 1 auto;min-height:0;grid-auto-rows:minmax(72px,auto);margin-top:calc(18px*var(--qs));gap:calc(14px*var(--qs))}
#body.q-mode .choice{min-height:calc(72px*var(--qs));padding:calc(16px*var(--qs)) calc(20px*var(--qs));font-size:calc(var(--fs-body)*1.12*var(--qs))}
#body.q-mode .choice .cn{flex:0 0 32px;width:32px;height:32px;font-size:14px}
#body.q-mode .myans textarea{font-size:calc(18px*var(--qs))}
#body.q-mode .myans{flex:1 1 auto;display:flex;flex-direction:column;min-height:0}
#body.q-mode .myans textarea{flex:1 1 auto;min-height:88px}
.cover .big{font-size:calc(var(--fs-title)*1.25)}
.cover .sub{max-width:60ch}
@media(max-width:700px){.choices{grid-template-columns:minmax(0,1fr)}#body{padding:14px 16px 10px;overflow:auto}#body.q-mode{justify-content:flex-start}#top,#foot{padding-left:12px;padding-right:12px}#srcs{display:none}#foot{gap:6px}.btn{white-space:nowrap;padding:6px 12px}#act .hint{display:none}#chapter{display:none}}
'''
def patch(p):
    s = io.open(p, encoding="utf-8").read()
    if "V6C 여백 제거" in s: print("skip", p[-40:]); return
    assert s.count("</style>") == 1
    s = s.replace("</style>", CSS + "</style>", 1)
    io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p[-40:])
for f in FILES: patch(f)
