/* ============================================================
   V74 LAYER — A++O·학습앱 디자인 통일: 장면 스킨 (대표님 2026-10-04 「전체적으로 A++O랑 학습앱 디자인 통일감 있게 개편한 거 적용」) (BUILD 2026-10-04.172 · .173 도트 게임 한 벌 — 같은 교실에서 창밖만 낮/밤)
   A++O(kingdom/scene.css)와 같은 재질 한 벌:
   ① 바탕 = 장면 사진(낮 06~19시 빈 강의실 뒷자리 · 밤 열람실) 위에 크림 막 — 게임의 「장소」. 화면 맨 뒤 고정 div 하나(iOS 는 background-attachment:fixed 가 안 먹어서)
   ② 색 = 진초록 #2FB344(행동) · 황동 #C9A44C(포인트) · 크림 바탕 · 거의 검정 글자. 듀오링고 파랑·보라·노랑 원색을 팔레트 안으로
   ③ 글꼴 = V54 확정 세트 그대로(제목 Gothic A1 · 본문 Gowun Dodum · 숫자 Inter) — A++O 도 같은 세트로 맞춤
   카드 구조·레이아웃은 건드리지 않는다(색·바탕·재질만). 되돌리기 = html.v74 클래스를 빼면 V54 그대로.
   ============================================================ */
(function(){
  if(window.V74) return;
  var V74=window.V74={};
  var root=document.documentElement; root.classList.add("v74");
  var bg=document.createElement("div"); bg.id="v74Scene"; bg.setAttribute("aria-hidden","true");
  (document.body?Promise.resolve():new Promise(function(r){ document.addEventListener("DOMContentLoaded",r,{once:true}); })).then(function(){ document.body.insertBefore(bg,document.body.firstChild); });
  V74.tick=function(){ var h=new Date().getHours(); root.classList.toggle("v74-night", h<6||h>=19); };
  V74.tick(); setInterval(V74.tick,60000);
  var lk=document.createElement("link"); lk.rel="stylesheet"; lk.href="https://cdn.jsdelivr.net/npm/galmuri@latest/dist/galmuri.css"; document.head.appendChild(lk);
  var css=document.createElement("style"); css.id="v74css";
  css.textContent=[
    "html.v74{background:#141915}",
    "html.v74 body{background:transparent!important}",
    "#v74Scene{position:fixed;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(180deg,rgba(243,239,228,.72),rgba(243,239,228,.86) 45%,rgba(243,239,228,.92)),url(img/scene/class_day.webp) center/cover no-repeat;transition:background-image 1.2s ease}",
    "html.v74-night #v74Scene{background:linear-gradient(180deg,rgba(243,239,228,.84),rgba(243,239,228,.92) 45%,rgba(243,239,228,.95)),url(img/scene/class_night.webp) center/cover no-repeat}",
    "html.v74{--bg:transparent;--surface:#FBF8F1;--surface-2:#F2EDE1;--surface-3:#E7E0D0;--ink:#1C211D;--ink-2:#4A524C;--ink-3:#6B726C;--line:#E3DCCC;--line-2:#CFC6B2;",
      "--accent:#1F7A30;--accent-ink:#1F7A30;--accent-soft:#E2F2DF;--accent-line:#9ED6A6;--ok:#1F7A30;--ok-soft:#E2F2DF;--info:#2C6E73;--info-soft:#E1EEEE;",
      "--duo-green:#2FB344;--duo-green-2:#248C36;--duo-blue:#2C6E73;--duo-blue-2:#235A5E;--duo-yel:#C9A44C;--duo-purple:#8C6F3E;--duo-blue-text:#2C6E73;--duo-green-text:#1F7A30;",
      "--gl:var(--surface);--gl-2:var(--surface-2);--gl-3:var(--surface);--gl-on:var(--surface-2);--gl-line:var(--line);--gl-line-2:var(--line);--gl-bg0:transparent;--gl-bg1:transparent;--gl-bg2:transparent}",
    /* 다크(설정 「어두운 화면」 또는 기기 다크) — 밤 열람실 위 짙은 초록 유리 */
    ":root.v74[data-theme=\"dark\"]{--surface:#182019;--surface-2:#1F2A21;--surface-3:#26332A;--ink:#EEE9DC;--ink-2:#C9C3B4;--ink-3:#9C978A;--line:#2C392F;--line-2:#3A4A3E;--accent:#5CCB6B;--accent-ink:#7FDA8B;--accent-soft:#1E3524}",
    ":root.v74[data-theme=\"dark\"] #v74Scene{background:linear-gradient(180deg,rgba(14,18,15,.70),rgba(14,18,15,.84) 45%,rgba(14,18,15,.90)),url(img/scene/class_night.webp) center/cover no-repeat}",
    "@media(prefers-color-scheme:dark){:root.v74:not([data-theme=\"light\"]){--surface:#182019;--surface-2:#1F2A21;--surface-3:#26332A;--ink:#EEE9DC;--ink-2:#C9C3B4;--ink-3:#9C978A;--line:#2C392F;--line-2:#3A4A3E;--accent:#5CCB6B;--accent-ink:#7FDA8B;--accent-soft:#1E3524}",
      ":root.v74:not([data-theme=\"light\"]) #v74Scene{background:linear-gradient(180deg,rgba(14,18,15,.70),rgba(14,18,15,.84) 45%,rgba(14,18,15,.90)),url(img/scene/class_night.webp) center/cover no-repeat}}",
    /* 카드는 바탕 사진이 아주 살짝 비치게 — 글 읽는 면은 거의 불투명 */
    "html.v74 .card,html.v74 .tile,html.v74 .modebar{background:color-mix(in srgb,var(--surface) 95%,transparent)}",
    /* 행동 버튼 = 초록 하나, 숫자 = Inter */
    "html.v74 .btn.a,html.v74 .btn.pri,html.v74 .btn.primary{background:#2FB344;border-color:#248C36;color:#fff}",
    "html.v74 .v65-clock,html.v74 .num,html.v74 .dnum{font-family:var(--font-num);font-variant-numeric:tabular-nums}",
    /* 지금 탭 = 하늘색(듀오링고) 대신 초록 */
    "html.v74 .navb[aria-current=\"true\"],html.v74 .tabb[aria-current=\"true\"]{background:var(--accent-soft)!important;border-color:var(--accent-line)!important;color:var(--accent-ink)!important}",
    /* .173 도트 게임 한 벌 — A++O 와 같은 판(황동 테두리·아래 그림자)·도트 글꼴 Galmuri(제목·숫자·탭) */
    "#v74Scene{image-rendering:pixelated}",
    "html.v74 .card,html.v74 .tile{border-radius:8px!important;border:2px solid #CDB27A!important;box-shadow:0 3px 0 rgba(60,48,20,.25)!important}",
    "html.v74 .btn{border-radius:6px!important;box-shadow:0 3px 0 rgba(30,24,10,.3)}",
    "html.v74 .btn:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(30,24,10,.3)}",
    "html.v74 .navb,html.v74 .tabb{border-radius:6px!important}",
    "html.v74 h1,html.v74 .vh h1,html.v74 .navb,html.v74 .tabb,html.v74 .v65-clock,html.v74 .chip{font-family:Galmuri11,Galmuri9,var(--font-head)!important;font-weight:400!important;letter-spacing:0!important}",
    "@media (prefers-reduced-motion:reduce){#v74Scene{transition:none}}"
  ].join("\n");
  document.head.appendChild(css);
})();
