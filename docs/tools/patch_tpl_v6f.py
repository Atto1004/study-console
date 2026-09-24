# -*- coding: utf-8 -*-
"""V6F — 덱 템플릿 글래스 스킨 (대표님 2026-09-24 "학습앱도 글래스모피즘 형식으로 세련되게, 심플하고 깔끔하게").
배치·치수는 그대로(테두리 두께·여백 불변 → 1024×768 배치 검사 결과가 바뀌지 않는다). 바꾸는 것은 색·반투명·모서리·블러뿐.
- 바탕: 앱(V51)과 같은 그러데이션 + 번지는 빛 2개 · 무대(#stage)는 반투명 유리
- 상단·하단 바: 옅은 유리 띠 · 보기 카드·버튼·개념 상자·시험 언급·풀이 판: 유리 + 둥근 모서리
- 5색(암기 노랑·주의 빨강·개념 파랑·시험 핑크·예시 초록)은 그대로
멱등. 사용: python patch_tpl_v6f.py"""
import io, os
P = os.path.join(os.path.dirname(os.path.abspath(__file__)), "slides_tpl.html")
s = io.open(P, encoding="utf-8").read().replace("\r\n", "\n")
if "V6F 글래스" in s:
    print("이미 적용됨"); raise SystemExit(0)
css = """
/* ===== V6F 글래스 (대표님 2026-09-24) — 치수 불변, 색·투명·모서리만 ===== */
:root{--gl:rgba(255,255,255,.60);--gl-2:rgba(255,255,255,.42);--gl-3:rgba(255,255,255,.82);--gl-line:rgba(255,255,255,.80);--gl-hi:inset 0 1px 0 rgba(255,255,255,.85);--gl-blur:blur(18px) saturate(140%);--line:rgba(17,17,17,.14);--soft:rgba(255,255,255,.40)}
html{background:linear-gradient(160deg,#E9F0F5 0%,#F2F5F0 48%,#EDF2EE 100%) fixed}
body{background:transparent;position:relative}
body::before,body::after{content:"";position:fixed;z-index:0;border-radius:50%;pointer-events:none;filter:blur(60px)}
body::before{width:52vw;height:52vw;max-width:640px;max-height:640px;left:-14vw;top:-18vh;background:radial-gradient(circle at 40% 40%,rgba(74,222,128,.32),transparent 68%)}
body::after{width:60vw;height:60vw;max-width:760px;max-height:760px;right:-20vw;bottom:-24vh;background:radial-gradient(circle at 50% 50%,rgba(96,165,250,.30),transparent 66%)}
#stage{position:relative;z-index:1;background:var(--gl-2);-webkit-backdrop-filter:var(--gl-blur);backdrop-filter:var(--gl-blur);border-color:var(--gl-line)}
#top{background:var(--gl-2);border-bottom:1px solid var(--gl-line)}
#foot{background:var(--gl-2);border-top:1px solid var(--gl-line)}
.dot{background:rgba(255,255,255,.7)}
.btn{background:var(--gl);border-color:rgba(17,17,17,.55);border-radius:12px;box-shadow:var(--gl-hi)}
.btn.primary{background:#15803D;border-color:#15803D;color:#fff;box-shadow:0 4px 12px rgba(21,128,61,.28),inset 0 1px 0 rgba(255,255,255,.25)}
.choice{background:var(--gl);border-color:rgba(255,255,255,.85);border-radius:14px;box-shadow:0 2px 10px rgba(20,40,60,.06),var(--gl-hi)}
.choice.sel{border-color:var(--ink)}
.choice .cn{background:rgba(255,255,255,.7)}
#body .why,#body .concept{background:var(--gl-2);border-color:rgba(25,113,194,.38);border-radius:14px}
#body .say,#body .one{background:var(--gl-2);border-radius:0 12px 12px 0}
#body .tw{border-radius:10px;background:var(--gl-2)}
.exam-callout{background:rgba(255,77,141,.08);border-radius:14px;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.mu>div{border-radius:14px}
.score .c{border-radius:14px;background:var(--gl-2)}
.q-kind{border-radius:8px;background:var(--gl-2)}
.verdict{border-radius:12px;background:var(--gl)}
.jp{border-radius:10px;background:var(--gl)}
.myans textarea{border-radius:12px;background:var(--gl)}
#anslb,#padPanel{background:var(--gl-3);-webkit-backdrop-filter:blur(24px) saturate(150%);backdrop-filter:blur(24px) saturate(150%)}
#padPanel{border-radius:16px;border-color:rgba(17,17,17,.45)}
.pad{border-radius:10px;background:rgba(255,255,255,.85)}
#hintBox{border-radius:14px}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){#stage{background:#FAFBFA}.choice,.btn,#top,#foot,#body .why,#body .concept{background:#FFFFFF}}
"""
assert s.count("</style>") == 1
s = s.replace("</style>", css + "</style>", 1)
io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("V6F 적용 · size", len(s))
