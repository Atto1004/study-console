/* ============================================================
   V51 LAYER — 글래스 스킨 (대표님 2026-09-24 "학습앱도 글래스모피즘 형식으로 세련되게, 가능한 심플하고 깔끔하게")
   CSS만 덮는 층. 배치·마크업은 그대로 두고 3단으로만 나눈다: 바탕(부드러운 그러데이션 + 번지는 빛 2개) · 유리 패널(카드·상단바·레일·시트) · 안쪽 행(더 옅은 유리).
   브랜드 행동색은 알파인 그린 1색 그대로(지침 §15), 글자색은 기존 토큰(--ink) 유지 → 대비 유지. 낮(라이트) = 밝은 유리 + 검은 글자, 다크 = 어두운 유리 + 흰 글자 — atom 메인 글래스 시안(그린라이트/wire/main_glass)과 같은 규칙.
   backdrop-filter 미지원이면 불투명 표면으로 폴백. 덱(슬라이드)은 별도(템플릿 v6f).
   ============================================================ */
(function(){
  if(window.V51) return;
  var V51=window.V51={};
  var css=document.createElement("style"); css.id="v51glass";
  css.textContent=[
    /* ---- 토큰 ---- */
    ":root{--gl:rgba(255,255,255,.62);--gl-2:rgba(255,255,255,.38);--gl-3:rgba(255,255,255,.80);--gl-line:rgba(255,255,255,.78);--gl-line-2:rgba(255,255,255,.55);--gl-hi:inset 0 1px 0 rgba(255,255,255,.85);--gl-sh:0 10px 30px rgba(20,40,60,.10),0 1px 2px rgba(20,40,60,.05);--gl-blur:blur(20px) saturate(140%);--gl-on:rgba(11,26,17,.07);",
    " --gl-bg0:#E9F0F5;--gl-bg1:#F2F5F0;--gl-bg2:#EDF2EE;--gl-b1:rgba(74,222,128,.32);--gl-b2:rgba(96,165,250,.30);--gl-b3:rgba(253,224,71,.14);--r:20px;--r-s:12px}",
    "@media(prefers-color-scheme:dark){:root:not([data-theme=\"light\"]){--gl:rgba(18,26,24,.58);--gl-2:rgba(255,255,255,.05);--gl-3:rgba(18,26,24,.80);--gl-line:rgba(255,255,255,.10);--gl-line-2:rgba(255,255,255,.07);--gl-hi:inset 0 1px 0 rgba(255,255,255,.10);--gl-sh:0 12px 34px rgba(0,0,0,.35),0 1px 2px rgba(0,0,0,.3);--gl-on:rgba(255,255,255,.10);--gl-bg0:#0B1020;--gl-bg1:#0E1A16;--gl-bg2:#0B1412;--gl-b1:rgba(74,222,128,.20);--gl-b2:rgba(59,130,246,.22);--gl-b3:rgba(250,204,21,.06)}}",
    ":root[data-theme=\"dark\"]{--gl:rgba(18,26,24,.58);--gl-2:rgba(255,255,255,.05);--gl-3:rgba(18,26,24,.80);--gl-line:rgba(255,255,255,.10);--gl-line-2:rgba(255,255,255,.07);--gl-hi:inset 0 1px 0 rgba(255,255,255,.10);--gl-sh:0 12px 34px rgba(0,0,0,.35),0 1px 2px rgba(0,0,0,.3);--gl-on:rgba(255,255,255,.10);--gl-bg0:#0B1020;--gl-bg1:#0E1A16;--gl-bg2:#0B1412;--gl-b1:rgba(74,222,128,.20);--gl-b2:rgba(59,130,246,.22);--gl-b3:rgba(250,204,21,.06)}",
    /* ---- 바탕: 그러데이션 + 번지는 빛 (고정, 스크롤과 무관) ---- */
    "html{background:linear-gradient(160deg,var(--gl-bg0) 0%,var(--gl-bg1) 48%,var(--gl-bg2) 100%) fixed}",
    "body{background:transparent;position:relative}",
    "body::before,body::after{content:\"\";position:fixed;z-index:-1;border-radius:50%;pointer-events:none;filter:blur(60px)}",
    "body::before{width:52vw;height:52vw;max-width:640px;max-height:640px;left:-14vw;top:-18vh;background:radial-gradient(circle at 40% 40%,var(--gl-b1),transparent 68%)}",
    "body::after{width:60vw;height:60vw;max-width:760px;max-height:760px;right:-20vw;bottom:-24vh;background:radial-gradient(circle at 50% 50%,var(--gl-b2),transparent 66%)}",
    /* ---- 유리 패널 ---- */
    ".card,.tile,.modebar,.exboard{background:var(--gl);-webkit-backdrop-filter:var(--gl-blur);backdrop-filter:var(--gl-blur);border:1px solid var(--gl-line);border-radius:var(--r);box-shadow:var(--gl-sh),var(--gl-hi)}",
    ".card .card{background:var(--gl-3);-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:none;border-color:var(--gl-line-2)}",
    ":root:not([data-theme=\"dark\"]){--ink-2:#5B6A60;--ink-3:#66736B}",
    "@media(prefers-color-scheme:dark){:root:not([data-theme=\"light\"]){--ink-2:#9BAA9F;--ink-3:#8A978F}}",
    ".card-h{border-bottom:1px solid var(--gl-line-2);background:transparent}",
    ".topbar{background:var(--gl);-webkit-backdrop-filter:blur(24px) saturate(150%);backdrop-filter:blur(24px) saturate(150%);border-bottom:1px solid var(--gl-line)}",
    ".gauge{border-right:1px solid var(--gl-line-2)}",
    ".rail{background:var(--gl-2);-webkit-backdrop-filter:var(--gl-blur);backdrop-filter:var(--gl-blur);border-right:1px solid var(--gl-line)}",
    ".navb[aria-current=\"true\"]{background:var(--gl-on);color:var(--accent)}",
    ".sheet{background:var(--gl-3);-webkit-backdrop-filter:blur(30px) saturate(150%);backdrop-filter:blur(30px) saturate(150%);border:1px solid var(--gl-line);box-shadow:0 20px 60px rgba(0,0,0,.22),var(--gl-hi);border-radius:22px}",
    ".scrim{background:rgba(8,16,12,.38);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}",
    ".toast{background:var(--gl-3);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border:1px solid var(--gl-line);color:var(--ink)}",
    /* ---- 안쪽 행: 더 옅은 유리 ---- */
    ".lrow,.crow,.drow,.v47-wk,.v49-deck,.v50-s,.v45-msg,.exrow{background:var(--gl-2);border:1px solid var(--gl-line-2);border-radius:var(--r-s);box-shadow:none}",
    ".lrow{border-bottom:1px solid var(--gl-line-2);margin:0 0 6px}",
    ".v49-row,.v50-row,.v47-row{border-top-color:var(--gl-line-2)}",
    ".v49-deck.exam{border-color:color-mix(in srgb,var(--ok) 35%,var(--gl-line-2))}",
    ".v49-today,.v50-top,.v47-next{background:var(--gl-2);border:1px solid var(--gl-line-2);border-radius:var(--r-s)}",
    ".v49-today{border-color:color-mix(in srgb,var(--crit) 30%,var(--gl-line-2))}",
    ".v48{background:color-mix(in srgb,var(--crit-soft) 70%,transparent);-webkit-backdrop-filter:var(--gl-blur);backdrop-filter:var(--gl-blur);border-radius:var(--r-s)}",
    /* ---- 조작부: 버튼·세그먼트·칩·입력 ---- */
    ".btn{background:var(--gl);border:1px solid var(--gl-line);box-shadow:var(--gl-hi);border-radius:10px;color:var(--ink)}",
    ".btn:hover{background:var(--gl-3)}",
    ".btn.a{background:var(--accent);border-color:transparent;color:var(--on-accent);box-shadow:0 4px 12px rgba(21,128,61,.28),inset 0 1px 0 rgba(255,255,255,.25)}",
    ".btn.xs{border-radius:8px}",
    ".btn.q{background:transparent;border-color:transparent;box-shadow:none}",
    ".btn.dgr{background:var(--crit-soft);border-color:transparent;box-shadow:none}",
    ".iconbtn{background:var(--gl-2);border:1px solid var(--gl-line-2);border-radius:10px}",
    ".seg{background:var(--gl-on);border:0;border-radius:10px;padding:3px}",
    ".seg button[aria-pressed=\"true\"]{background:var(--gl-3);box-shadow:var(--gl-hi),0 1px 3px rgba(0,0,0,.08)}",
    ".chip.mut{background:var(--gl-on);color:var(--ink-2)}",
    ".input,.select,.ta{background:var(--gl);border:1px solid var(--gl-line);box-shadow:var(--gl-hi);border-radius:10px}",
    ".input:focus,.select:focus,.ta:focus{background:var(--gl-3);border-color:var(--accent)}",
    ".bar{background:var(--gl-on)}",
    ".v49-bar,.v47-bar{background:var(--gl-on)}",
    /* ---- 폰 하단 탭 · PC ---- */
    "@media(max-width:859px){.tabbar{background:var(--gl-3);border:1px solid var(--gl-line);box-shadow:0 12px 32px rgba(0,0,0,.18),var(--gl-hi)}.tabb[aria-current=\"true\"]{background:var(--gl-on)}}",
    "@media(min-width:860px){.navb{border-radius:12px}}",
    /* ---- 뷰어(덱 창) 상단 ---- */
    ".ntv-h{background:var(--gl-3);-webkit-backdrop-filter:var(--gl-blur);backdrop-filter:var(--gl-blur);border-bottom:1px solid var(--gl-line)}",
    /* ---- 브리핑 줄 긴 글: 폰에서 가로로 안 넘치게 (오늘 탭 .step 안 span, 예전부터 있던 넘침) ---- */
    ".step>*{min-width:0;overflow-wrap:anywhere}",
    /* ---- 폴백 ---- */
    "@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.card,.tile,.modebar,.exboard,.topbar,.rail,.sheet,.toast,.btn,.input,.select,.ta,.ntv-h,.iconbtn,.card .card{background:var(--surface)}.v48{background:var(--crit-soft)}.lrow,.crow,.drow,.v47-wk,.v49-deck,.v50-s,.v49-today,.v50-top,.seg{background:var(--surface-2)}}"
  ].join("\n");
  document.head.appendChild(css);
})();
