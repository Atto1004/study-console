/* ============================================================
   V54 LAYER — 듀오링고식 밝고 둥근 게임 톤 스킨 (대표님 2026-09-26 "학습앱 전체 UI 디자인이 별로 → 세련되고 이쁘게 감각적으로", 지침 §23: 듀오링고 톤, 아이패드 1040 먼저)
   CSS 만 바꾼다(구조·기능 변화 없음). 맨 마지막에 <style id="v54css"> 로 붙어 위 애플 레이어 토큰을 덮는다.
   팔레트(듀오링고): feather green #58CC02 · mask green #89E219 · macaw #1CB0F6 · cardinal #FF4B4B · bee #FFC800 · fox #FF9600 · beetle #CE82FF · eel #4B4B4B · wolf #777 · hare #AFAFAF · swan #E5E5E5
   글꼴: Pretendard(둥글고 굵게), 버튼은 2px 테두리 + 4px 바닥(눌리는 3D), 카드는 2px 테두리·16px 모서리·그림자 없음.
   끄기: localStorage mc-skin = "classic" 또는 ?skin=classic (문제가 생기면 바로 이전 모습으로).
   ============================================================ */
(function(){
  if(window.V54) return;
  var V54=window.V54={on:true};
  try{ var q=new URLSearchParams(location.search).get("skin"); if(q==="classic"||(!q&&localStorage.getItem("mc-skin")==="classic")) V54.on=false; if(q==="duo") localStorage.removeItem("mc-skin"); }catch(e){}
  V54.set=function(on){ try{ if(on) localStorage.removeItem("mc-skin"); else localStorage.setItem("mc-skin","classic"); }catch(e){} location.reload(); };
  if(!V54.on) return;
  document.documentElement.classList.add("v54");
  var L=[
    /* 토큰 */
    ':root{--font-body:"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;--font-num:"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif;',
    '--bg:#F7F7F7;--bg-grid:transparent;--surface:#FFFFFF;--surface-2:#F0F0F0;--surface-3:#E5E5E5;--ink:#3C3C3C;--ink-2:#6F6F6F;--ink-3:#8E8E8E;--line:#E5E5E5;--line-2:#CFCFCF;',
    '--accent:#58CC02;--accent-ink:#3D8F00;--accent-soft:#E6F9D6;--accent-line:#A5ED6E;--ok:#58CC02;--ok-soft:#E6F9D6;--warn:#FF9600;--warn-soft:#FFE9CC;--crit:#FF4B4B;--crit-soft:#FFE0E0;--info:#1CB0F6;--info-soft:#DDF4FF;',
    '--shadow:none;--r:16px;--r-s:12px;--r-pill:999px;--duo-blue:#1CB0F6;--duo-blue-2:#1899D6;--duo-green-2:#46A302;--duo-yel:#FFC800;--duo-purple:#CE82FF}',
    '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#131F24;--surface:#1B2A31;--surface-2:#243640;--surface-3:#2E434F;--ink:#F1F7FB;--ink-2:#C7D3DA;--ink-3:#8FA3AE;--line:#37464F;--line-2:#4A5D69;',
    '--accent:#58CC02;--accent-ink:#93D333;--accent-soft:rgba(88,204,2,.16);--accent-line:rgba(88,204,2,.45);--ok:#58CC02;--ok-soft:rgba(88,204,2,.16);--warn:#FF9600;--warn-soft:rgba(255,150,0,.16);--crit:#FF4B4B;--crit-soft:rgba(255,75,75,.18);--info:#1CB0F6;--info-soft:rgba(28,176,246,.16);--shadow:none;--thumb:#4A5D69}}',
    ':root[data-theme="dark"]{--bg:#131F24;--surface:#1B2A31;--surface-2:#243640;--surface-3:#2E434F;--ink:#F1F7FB;--ink-2:#C7D3DA;--ink-3:#8FA3AE;--line:#37464F;--line-2:#4A5D69;',
    '--accent:#58CC02;--accent-ink:#93D333;--accent-soft:rgba(88,204,2,.16);--accent-line:rgba(88,204,2,.45);--ok:#58CC02;--ok-soft:rgba(88,204,2,.16);--warn:#FF9600;--warn-soft:rgba(255,150,0,.16);--crit:#FF4B4B;--crit-soft:rgba(255,75,75,.18);--info:#1CB0F6;--info-soft:rgba(28,176,246,.16);--shadow:none;--thumb:#4A5D69}',
    /* 바탕·글꼴 */
    'html.v54 body{background-image:none;font-family:var(--font-body);letter-spacing:-.01em;font-weight:500}',
    'html.v54 h1,html.v54 h2,html.v54 h3,html.v54 h4{font-weight:800;letter-spacing:-.025em}',
    'html.v54 .num,html.v54 .gauge-v,html.v54 .tile-v{font-family:var(--font-num)}',
    /* 상단바 */
    'html.v54 .topbar{background:var(--surface);backdrop-filter:none;-webkit-backdrop-filter:none;border-bottom:2px solid var(--line)}',
    'html.v54 .brand-mark{border-radius:12px;background:var(--accent);box-shadow:0 3px 0 var(--duo-green-2)}',
    'html.v54 .brand-t{font-weight:800;font-size:14px}html.v54 .brand-s{font-weight:600}',
    'html.v54 .gauge{border-right:2px solid var(--line)}html.v54 .gauge-l{font-weight:700;color:var(--ink-3)}html.v54 .gauge-v{font-weight:800}',
    'html.v54 .gauge.hot .gauge-v{color:var(--crit)}html.v54 .gauge.near .gauge-v{color:var(--warn)}',
    /* 레일 */
    'html.v54 .rail{border-right:2px solid var(--line);background:var(--surface);padding:16px 12px;gap:4px}',
    'html.v54 .navb{border-radius:12px;font-weight:800;font-size:14px;padding:11px 12px;border:2px solid transparent;color:var(--ink-2);gap:12px}',
    'html.v54 .navb .ic{width:22px;font-size:17px;opacity:1}html.v54 .navb .ic svg{width:22px;height:22px}',
    'html.v54 .navb:hover{background:var(--surface-2);color:var(--ink)}',
    'html.v54 .navb[aria-current="true"]{background:var(--info-soft);border-color:#84D8FF;color:var(--duo-blue);font-weight:800}',
    'html.v54 :root[data-theme="dark"] .navb[aria-current="true"],html.v54 .navb[aria-current="true"]:where(:root[data-theme="dark"] *){border-color:rgba(28,176,246,.5)}',
    'html.v54 .rail-sec{font-weight:800;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3)}',
    /* 카드·타일 */
    'html.v54 .card{border:2px solid var(--line);border-radius:16px;box-shadow:none}',
    'html.v54 .card-h{border-bottom:2px solid var(--line);padding:14px 16px}html.v54 .card-h h3{font-weight:800;font-size:16px}',
    'html.v54 .card-h .hs{font-weight:700;color:var(--ink-3)}',
    'html.v54 .tile{border:2px solid var(--line);border-radius:16px;box-shadow:none}html.v54 .tile-l{font-weight:700}html.v54 .tile-v{font-weight:900;letter-spacing:-.03em}html.v54 .tile-n{font-weight:500}',
    /* 버튼: 2px 테두리 + 바닥 4px, 누르면 내려감 */
    'html.v54 .btn{border:2px solid var(--line);border-bottom-width:4px;border-radius:12px;font-weight:800;color:var(--duo-blue);background:var(--surface);padding:8px 14px;transition:filter .12s;letter-spacing:-.01em}',
    'html.v54 .btn:hover{background:var(--surface);filter:brightness(.97)}html.v54 .btn:active{transform:translateY(2px);border-bottom-width:2px;margin-bottom:2px}',
    'html.v54 .btn.a{background:var(--accent);border-color:var(--accent);border-bottom-color:var(--duo-green-2);color:#fff}html.v54 .btn.a:hover{filter:brightness(1.05)}',
    'html.v54 :root[data-theme="dark"] .btn.a,html.v54 .btn.a:where(:root[data-theme="dark"] *){color:#fff}',
    'html.v54 .btn.q{border-color:transparent;border-bottom-color:transparent;background:var(--surface-2);color:var(--ink-2)}',
    'html.v54 .btn.sm{padding:5px 10px;border-radius:10px;border-bottom-width:3px}html.v54 .btn.sm:active{border-bottom-width:2px;margin-bottom:1px}',
    'html.v54 .btn.xs{padding:3px 8px;font-size:11.5px;border-radius:9px;border-width:2px;border-bottom-width:3px}html.v54 .btn.xs:active{border-bottom-width:2px;margin-bottom:1px}',
    'html.v54 .btn.dgr{color:var(--crit);border-color:var(--crit-soft);border-bottom-color:#F5B5B5}',
    'html.v54 .btn[disabled]{opacity:.45;transform:none}',
    'html.v54 .iconbtn{border-radius:10px;font-weight:800}',
    /* 칩·힌트·폼 */
    'html.v54 .chip{font-weight:800;border-width:2px;padding:2px 10px}html.v54 .chip.mut{background:var(--surface-2);border-color:var(--line)}',
    'html.v54 .hint{font-weight:500}',
    'html.v54 .input,html.v54 .select,html.v54 .ta{border:2px solid var(--line);border-radius:12px;font-weight:500}html.v54 .input:focus,html.v54 .select:focus,html.v54 .ta:focus{border-color:var(--duo-blue)}',
    'html.v54 .field>label{font-weight:700}',
    /* 진행 점·줄 */
    'html.v54 .v50-dot{width:12px;height:12px}html.v54 .v50-top{border-radius:12px;font-weight:600}',
    'html.v54 .nt-row{border:2px solid var(--line);border-radius:14px;margin-bottom:8px}html.v54 .nt-row .ty{font-weight:800;border-radius:8px}html.v54 .nt-row .t{font-weight:700}',
    /* 폰 탭바 */
    '@media(max-width:859px){html.v54 .tabbar{border:2px solid var(--line);background:var(--surface);backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:0 6px 0 var(--line)}',
    'html.v54 .tabb{font-weight:800}html.v54 .tabb[aria-current="true"]{background:var(--info-soft);color:var(--duo-blue)}}',
    /* 스킨 끄기(설정) */
    'html.v54 .v54-sw{display:flex;align-items:center;gap:10px;flex-wrap:wrap}'
  ];
  var css=document.createElement("style"); css.id="v54css"; css.textContent=L.join("\n"); document.head.appendChild(css);
})();
