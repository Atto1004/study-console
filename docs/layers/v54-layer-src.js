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
  /* 설정 → 「화면」 카드: 듀오링고 톤 ↔ 클래식(글래스) — 스킨이 꺼져 있어도 카드는 있어야 되돌릴 수 있다 */
  if(typeof renderSet==="function"&&!renderSet._v54){
    var _rs=renderSet;
    renderSet=function(){ _rs(); try{ var v=$("#v-set"); if(!v||$("#v54Card")) return; var g=v.querySelector(".grid"); var c=document.createElement("div"); c.className="card"; c.id="v54Card";
      c.innerHTML='<div class="card-h"><h3>화면</h3><span class="hs">SKIN</span></div><div class="card-b v54-sw"><button class="btn'+(V54.on?" a":"")+'" id="v54Duo" type="button">듀오링고 톤</button><button class="btn'+(V54.on?"":" a")+'" id="v54Classic" type="button">클래식(글래스)</button><span class="hint">밝고 둥근 게임 톤 ↔ 이전 유리 화면. 누르면 새로 고침됩니다.</span></div>';
      (g||v).appendChild(c); $("#v54Duo").onclick=function(){ V54.set(true); }; $("#v54Classic").onclick=function(){ V54.set(false); }; }catch(e){} };
    renderSet._v54=true;
  }
  if(!V54.on) return;
  document.documentElement.classList.add("v54");
  var L=[
    /* 토큰 */
    ':root{--font-body:"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;--font-num:"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,sans-serif;',
    /* 글자색은 흰 바탕 4.5:1 이상(오타 v54 D): ink-3 #707070 = 5.3 · 초록 글자 #2E7D00 = 5.2 · 주황 #B85C00 = 4.6 · 빨강 #D42020 = 5.0 · 파랑 #0A7BBF = 4.6. 밝은 듀오링고 색(#58CC02 · #1CB0F6 …)은 배경·테두리·큰 도형에만 */
    '--bg:#F7F7F7;--bg-grid:transparent;--surface:#FFFFFF;--surface-2:#F0F0F0;--surface-3:#E5E5E5;--ink:#3C3C3C;--ink-2:#575757;--ink-3:#707070;--line:#E5E5E5;--line-2:#CFCFCF;',
    '--accent:#2E7D00;--accent-ink:#2E7D00;--accent-soft:#E6F9D6;--accent-line:#A5ED6E;--ok:#2E7D00;--ok-soft:#E6F9D6;--warn:#B85C00;--warn-soft:#FFE9CC;--crit:#D42020;--crit-soft:#FFE0E0;--info:#0A7BBF;--info-soft:#DDF4FF;',
    '--shadow:none;--r:16px;--r-s:12px;--r-pill:999px;--duo-green:#58CC02;--duo-blue:#1CB0F6;--duo-blue-2:#1899D6;--duo-green-2:#46A302;--duo-yel:#FFC800;--duo-purple:#CE82FF;',
    /* 글자용 색은 테마마다 따로(오타 v55 2: 어두운 바탕에서 #0A7BBF 는 3.2:1) — 밝음: 짙은색, 어두움: 밝은색 */
    '--duo-blue-text:#0A7BBF;--duo-green-text:#2E7D00;--duo-red-text:#D42020;--duo-orange-text:#9A5B00;',
    /* 글래스 층(V51) 토큰을 단색으로 — 유리·블러·번지는 빛을 끄고 평평한 듀오링고 면으로 */
    '--gl:var(--surface);--gl-2:var(--surface-2);--gl-3:var(--surface);--gl-line:var(--line);--gl-line-2:var(--line);--gl-hi:none;--gl-sh:none;--gl-blur:none;--gl-on:var(--surface-2);--gl-bg0:var(--bg);--gl-bg1:var(--bg);--gl-bg2:var(--bg);--gl-b1:transparent;--gl-b2:transparent;--gl-b3:transparent;--on-accent:#fff}',
    ':root:not([data-theme="dark"]){--ink-2:#575757;--ink-3:#707070}',
    '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){--ink-2:#C7D3DA;--ink-3:#8FA3AE;--gl:var(--surface);--gl-2:var(--surface-2);--gl-3:var(--surface);--gl-line:var(--line);--gl-line-2:var(--line);--gl-hi:none;--gl-sh:none;--gl-on:var(--surface-2);--gl-bg0:var(--bg);--gl-bg1:var(--bg);--gl-bg2:var(--bg);--gl-b1:transparent;--gl-b2:transparent}}',
    ':root[data-theme="dark"]{--gl:var(--surface);--gl-2:var(--surface-2);--gl-3:var(--surface);--gl-line:var(--line);--gl-line-2:var(--line);--gl-hi:none;--gl-sh:none;--gl-on:var(--surface-2);--gl-bg0:var(--bg);--gl-bg1:var(--bg);--gl-bg2:var(--bg);--gl-b1:transparent;--gl-b2:transparent}',
    'html.v54{background:var(--bg)}html.v54 body::before,html.v54 body::after{display:none}',
    'html.v54 .card,html.v54 .tile,html.v54 .modebar,html.v54 .exboard{background:var(--surface);-webkit-backdrop-filter:none;backdrop-filter:none}',
    'html.v54 .card .card{background:var(--surface);border:2px solid var(--line)}',
    'html.v54 .sheet{background:var(--surface);-webkit-backdrop-filter:none;backdrop-filter:none;border:2px solid var(--line);box-shadow:0 20px 60px rgba(0,0,0,.22);border-radius:20px}',
    'html.v54 .toast{background:var(--surface);-webkit-backdrop-filter:none;backdrop-filter:none;border:2px solid var(--line)}',
    'html.v54 .scrim{background:rgba(20,30,40,.55);-webkit-backdrop-filter:none;backdrop-filter:none}',
    'html.v54 .lrow,html.v54 .crow,html.v54 .drow,html.v54 .v47-wk,html.v54 .v49-deck,html.v54 .v50-s,html.v54 .v45-msg,html.v54 .exrow{background:var(--surface);border:2px solid var(--line);border-radius:12px}',
    'html.v54 .crow:hover,html.v54 .lrow:hover,html.v54 .drow:hover{background:var(--surface-2)}',
    'html.v54 .v49-today,html.v54 .v50-top,html.v54 .v47-next{background:var(--surface-2);border:2px solid var(--line);border-radius:12px}',
    'html.v54 .seg{background:var(--surface-2);border:2px solid var(--line);border-radius:12px;padding:3px}html.v54 .seg button{border-radius:9px;font-weight:700}html.v54 .seg button[aria-pressed="true"]{background:var(--surface);box-shadow:none;color:var(--duo-blue-text)}',
    'html.v54 .iconbtn{background:var(--surface);border:2px solid var(--line);border-radius:10px}',
    'html.v54 .bar,html.v54 .v49-bar,html.v54 .v47-bar{background:var(--surface-3);border-radius:99px;overflow:hidden}',
    '@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#131F24;--surface:#1B2A31;--surface-2:#243640;--surface-3:#2E434F;--ink:#F1F7FB;--ink-2:#C7D3DA;--ink-3:#8FA3AE;--line:#37464F;--line-2:#4A5D69;',
    '--accent:#58CC02;--accent-ink:#93D333;--accent-soft:rgba(88,204,2,.16);--accent-line:rgba(88,204,2,.45);--ok:#58CC02;--ok-soft:rgba(88,204,2,.16);--warn:#FF9600;--warn-soft:rgba(255,150,0,.16);--crit:#FF6B6B;--crit-soft:rgba(255,75,75,.18);--info:#1CB0F6;--info-soft:rgba(28,176,246,.16);--shadow:none;--thumb:#4A5D69;',
    '--duo-blue-text:#5AC8FA;--duo-green-text:#7ED957;--duo-red-text:#FF7B7B;--duo-orange-text:#FFB347}}',
    ':root[data-theme="dark"]{--bg:#131F24;--surface:#1B2A31;--surface-2:#243640;--surface-3:#2E434F;--ink:#F1F7FB;--ink-2:#C7D3DA;--ink-3:#8FA3AE;--line:#37464F;--line-2:#4A5D69;',
    '--accent:#58CC02;--accent-ink:#93D333;--accent-soft:rgba(88,204,2,.16);--accent-line:rgba(88,204,2,.45);--ok:#58CC02;--ok-soft:rgba(88,204,2,.16);--warn:#FF9600;--warn-soft:rgba(255,150,0,.16);--crit:#FF6B6B;--crit-soft:rgba(255,75,75,.18);--info:#1CB0F6;--info-soft:rgba(28,176,246,.16);--shadow:none;--thumb:#4A5D69;',
    '--duo-blue-text:#5AC8FA;--duo-green-text:#7ED957;--duo-red-text:#FF7B7B;--duo-orange-text:#FFB347}',
    /* 바탕·글꼴 */
    'html.v54 body{background-image:none;font-family:var(--font-body);letter-spacing:-.01em;font-weight:500}',
    'html.v54 h1,html.v54 h2,html.v54 h3,html.v54 h4{font-weight:800;letter-spacing:-.025em}',
    'html.v54 .num,html.v54 .gauge-v,html.v54 .tile-v{font-family:var(--font-num)}',
    /* 상단바 */
    'html.v54 .topbar{background:var(--surface);backdrop-filter:none;-webkit-backdrop-filter:none;border-bottom:2px solid var(--line)}',
    'html.v54 .brand-mark{border-radius:12px;background:var(--duo-green);box-shadow:0 3px 0 var(--duo-green-2)}',
    'html.v54 .brand-t{font-weight:800;font-size:14px}html.v54 .brand-s{font-weight:600}',
    'html.v54 .gauge{border-right:2px solid var(--line)}html.v54 .gauge-l{font-weight:700;color:var(--ink-3)}html.v54 .gauge-v{font-weight:800}',
    'html.v54 .gauge.hot .gauge-v{color:var(--crit)}html.v54 .gauge.near .gauge-v{color:var(--warn)}',
    /* 레일 */
    'html.v54 .rail{border-right:2px solid var(--line);background:var(--surface);padding:16px 12px;gap:4px}',
    'html.v54 .navb{border-radius:12px;font-weight:800;font-size:14px;padding:11px 12px;border:2px solid transparent;color:var(--ink-2);gap:12px}',
    'html.v54 .navb .ic{width:22px;font-size:17px;opacity:1}html.v54 .navb .ic svg{width:22px;height:22px}',
    'html.v54 .navb:hover{background:var(--surface-2);color:var(--ink)}',
    'html.v54 .navb[aria-current="true"]{background:var(--info-soft);border-color:#84D8FF;color:var(--duo-blue-text);font-weight:800}',
    'html.v54 :root[data-theme="dark"] .navb[aria-current="true"],html.v54 .navb[aria-current="true"]:where(:root[data-theme="dark"] *){border-color:rgba(28,176,246,.5)}',
    'html.v54 .rail-sec{font-weight:800;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3)}',
    /* 카드·타일 */
    'html.v54 .card{border:2px solid var(--line);border-radius:16px;box-shadow:none}',
    'html.v54 .card-h{border-bottom:2px solid var(--line);padding:14px 16px}html.v54 .card-h h3{font-weight:800;font-size:16px}',
    'html.v54 .card-h .hs{font-weight:700;color:var(--ink-3)}',
    'html.v54 .tile{border:2px solid var(--line);border-radius:16px;box-shadow:none}html.v54 .tile-l{font-weight:700}html.v54 .tile-v{font-weight:900;letter-spacing:-.03em}html.v54 .tile-n{font-weight:500}',
    /* 버튼: 2px 테두리 + 바닥 4px, 누르면 내려감 */
    'html.v54 .btn{border:2px solid var(--line);border-bottom-width:4px;border-radius:12px;font-weight:800;color:var(--duo-blue-text);background:var(--surface);padding:8px 14px;transition:filter .12s;letter-spacing:-.01em}',
    'html.v54 .btn:hover{background:var(--surface);filter:brightness(.97)}html.v54 .btn:active{transform:translateY(2px);border-bottom-width:2px;margin-bottom:2px}',
    /* 기본 버튼: 밝은 초록 바탕 + 짙은 초록 글자(7.2:1) — 흰 글자는 2.1:1 이라 못 쓴다 */
    'html.v54 .btn.a{background:var(--duo-green);border-color:var(--duo-green);border-bottom-color:var(--duo-green-2);color:#0B2E00}html.v54 .btn.a:hover{filter:brightness(1.05)}',
    'html.v54 :root[data-theme="dark"] .btn.a,html.v54 .btn.a:where(:root[data-theme="dark"] *){color:#0B2E00}',
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
    'html.v54 .tabb{font-weight:800}html.v54 .tabb[aria-current="true"]{background:var(--info-soft);color:var(--duo-blue-text)}}',
    /* 스킨 끄기(설정) */
    'html.v54 .v54-sw{display:flex;align-items:center;gap:10px;flex-wrap:wrap}'
  ];
  var css=document.createElement("style"); css.id="v54css"; css.textContent=L.join("\n"); document.head.appendChild(css);
})();
