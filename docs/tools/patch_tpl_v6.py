# -*- coding: utf-8 -*-
"""덱 템플릿 v6 — 조작부 재설계 (아토 2026-09-21 "학습하기 문제·보기 버튼 모양·배치 개망, 실제 서비스처럼 깔끔하게" · 결정 ④ 본문 손글씨 유지, 조작부 정자):
  CSS 덮어쓰기 블록만 추가(마크업·JS 변경 없음). Pretendard 로드. 상단 = 연속 진행 막대(점 → 분절 막대) · 하단 = 평면 버튼(주버튼 초록 1개) ·
  보기 = 흰 카드 + 번호 배지 + 선택/정답/오답 상태색 · 개념 상자 = 좌측 3px 바 · 힌트/필기/풀이 판 = 둥근 평면 패널.
템플릿 + 덱 5개 동일. 멱등."""
import io, glob
ROOT = r"C:\Users\user\Desktop\아톰OS\기술실\study-console"
FILES = [ROOT + r"\docs\tools\slides_tpl.html", r"C:\Users\user\.claude\scratch\sc_test\slides_tpl.html"] + glob.glob(ROOT + r"\notes\*slides*.html")

CSS = r'''
/* ===== V6 UI — 조작부 재설계 (아토 2026-09-21). 본문(손글씨·5색)은 그대로, 조작부만 정자·평면 ===== */
:root{--ui:Pretendard,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Malgun Gothic","Apple SD Gothic Neo",sans-serif;--accent:#4F9A35;--accent-soft:#EAF4E6;--bad:#D23B3B;--bad-soft:#FBEAEA;--line:#E3E8E5;--soft:#F4F6F5;--bg:#EEF1EF;--muted:#6B7570;--ink-3:#8A9490}
body{background:var(--bg)}
#stage{border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.04)}
/* 상단: 분절 진행 막대 + 정자 라벨 */
#top{padding:12px 20px;gap:14px;font-family:var(--ui);font-size:13px;color:var(--muted);border-bottom:1px solid var(--line);background:#fff}
#progress{gap:3px;flex-wrap:nowrap;overflow:hidden}
.dot{flex:1 1 0;width:auto;min-width:6px;max-width:28px;height:6px;border:0;border-radius:3px;background:var(--line)}
.dot.done{background:var(--accent)}.dot.cur{background:#B7DBA8;outline:0;box-shadow:inset 0 0 0 1px var(--accent)}.dot.exam{background:#FFC2D8}.dot.exam.done{background:var(--exam)}
#chapter{font-family:var(--ui);font-size:13px;font-weight:600;color:#1F2A24}
#pos{font-family:var(--ui);font-variant-numeric:tabular-nums;font-size:13px;color:var(--muted)}
/* 본문 상자: 두꺼운 파란 테두리 → 좌측 바 */
#body .why,#body .concept{border:0;border-left:3px solid var(--concept);background:#F5F8FD;border-radius:0 10px 10px 0}
#body .one{border-radius:0 10px 10px 0}#body .say{border-radius:0 10px 10px 0}
#body .tw{border-radius:10px}
.mu-mem{border:0;border-left:3px solid #E5C400;background:#FFF9D6;border-radius:0 10px 10px 0}.mu-und{border:0;border-left:3px solid var(--concept);background:#F5F8FD;border-radius:0 10px 10px 0}
.q-kind{font-family:var(--ui);font-size:12px;font-weight:600;border:0;border-radius:999px;padding:2px 10px;background:var(--accent-soft);color:var(--accent);vertical-align:middle}
#body .kicker{font-family:var(--ui);font-size:12px;letter-spacing:0;color:var(--ink-3)}
/* 보기 카드 */
.choices{gap:10px;margin-top:12px}
.choice{font-family:var(--font-hand);border:1px solid var(--line);border-radius:14px;background:#fff;padding:12px 14px;min-height:56px;transition:border-color .12s,background .12s}
.choice:hover{border-color:#B9C4BE;background:var(--soft)}
.choice .cn{flex:0 0 28px;width:28px;height:28px;border:0;border-radius:50%;background:var(--soft);color:#1F2A24;font-family:var(--ui);font-size:13px;font-weight:600}
.choice.sel{border:2px solid var(--accent);padding:11px 13px}.choice.sel .cn{background:var(--accent);color:#fff}
.choice.ok{border:2px solid var(--accent);background:var(--accent-soft);padding:11px 13px}.choice.ok .cn{background:var(--accent);color:#fff}
.choice.bad{border:2px solid var(--bad);background:var(--bad-soft);padding:11px 13px}.choice.bad .cn{background:var(--bad);color:#fff}
.choice[disabled]:not(.ok):not(.bad){opacity:.55}
.choice:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
/* 주관식 */
.myans label{font-family:var(--ui);font-size:12px;color:var(--muted)}
.myans textarea{border:1px solid var(--line);border-radius:12px;padding:10px 14px;font-family:var(--ui);font-size:16px;background:#fff}
.myans textarea:focus-visible{outline:2px solid var(--accent);outline-offset:0;border-color:var(--accent)}
.myans-show{border:1px dashed #B9C4BE;border-radius:12px;background:var(--soft)}
.myans-txt{font-family:var(--ui);font-size:16px}
.myans-note{margin-top:8px}
/* 판정·안내 */
.verdict{font-family:var(--ui);font-size:13px;font-weight:600;border:0;border-radius:999px;padding:6px 12px;background:var(--soft);color:#1F2A24}
.verdict.ok{background:var(--accent-soft);color:var(--accent)}.verdict.bad{background:var(--bad-soft);color:var(--bad)}
#act .hint{font-family:var(--ui);font-size:12px;color:var(--ink-3)}
#doneTag{font-family:var(--ui);font-size:12px;color:var(--ink-3)}
/* 하단 바 · 버튼 */
#foot{padding:10px 16px;gap:8px;border-top:1px solid var(--line);background:#fff}
.btn{font-family:var(--ui);font-size:14px;font-weight:600;min-height:40px;padding:6px 16px;border:1px solid var(--line);border-radius:10px;background:#fff;color:#1F2A24;box-shadow:none}
.btn:hover{background:var(--soft)}
.btn.xs{font-size:13px;min-height:36px;padding:4px 12px}
.btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
.btn.primary:hover{filter:brightness(.95)}
#next{min-width:96px}
#next.undone{background:#fff;color:var(--accent);border:1px solid var(--accent);border-style:solid}
.btn[disabled]{opacity:.35}
.btn:focus-visible,.choice:focus-visible,.jp:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
#padBtn.on{background:#1F2A24;border-color:#1F2A24;color:#fff}
/* 출처 썸네일 */
#srcs{gap:6px}
.src-th{width:40px;height:40px;border:1px solid var(--line);border-radius:8px}
.src-th .src-n{font-family:var(--ui);font-size:11px;padding:0 5px;border-radius:6px 0 6px 0}
.src-x{font-family:var(--ui);font-size:14px;border:1px solid var(--line);border-radius:10px;min-height:40px}
.src-top{font-family:var(--ui);font-size:13px}.src-body{border-radius:12px}
.src-foot .hint{font-family:var(--ui);font-size:12px}
/* 힌트 · 필기 · 풀이 판 · 글꼴 경고 */
#hintBox{border:1px solid var(--line);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.08);bottom:70px}
#padPanel{border:1px solid var(--line);border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.08);bottom:70px}
.pad-bar{font-family:var(--ui);font-size:12px;padding:6px 10px;background:var(--soft);border-radius:14px 14px 0 0}
.pad-bar button{font-family:var(--ui);font-size:12px;font-weight:600;min-height:32px;padding:2px 10px;border:1px solid var(--line);border-radius:8px}
.pad-bar button.on{background:#1F2A24;border-color:#1F2A24;color:#fff}
#anslb{padding:16px 24px}
#anslb .ans{border:0;border-left:3px solid var(--example);background:#F3F9F2;border-radius:0 10px 10px 0}
.ans{border:0;border-left:3px solid var(--example);background:#F3F9F2;border-radius:0 10px 10px 0}
#anslb .ans-top .kicker{font-family:var(--ui);font-size:12px}
#fontWarn{border:1px solid var(--bad);border-radius:10px;font-family:var(--ui);font-size:12px}
/* 시작 위치 목록 · 결과 */
.jp{font-family:var(--ui);font-size:13px;border:1px solid var(--line);border-radius:8px;min-height:34px}
.jp.done{background:var(--accent-soft);color:var(--accent);border-color:var(--accent-soft)}.jp.cur{border:2px solid var(--accent)}
.score{gap:12px}.score .c{border:1px solid var(--line);border-radius:12px;background:var(--soft);padding:12px 18px;min-width:120px}
.score .c b{font-family:var(--ui);font-weight:700;font-size:28px;line-height:1.1}
.cover .kicker{font-family:var(--ui);font-size:12px;color:var(--ink-3)}
'''

def patch(p):
    s = io.open(p, encoding="utf-8").read()
    if "V6 UI — 조작부 재설계" in s: print("skip", p[-40:]); return
    assert s.count("</style>") == 1, p
    s = s.replace("</style>", CSS + "</style>", 1)
    link = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">'
    if link not in s:
        s = s.replace("<style>", link + "\n<style>", 1)
    io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p[-40:])

for f in FILES: patch(f)
