/* ============================================================
   V71 LAYER — 설명 문구는 원형 (i) 아이콘 안으로 (대표님 2026-10-03 「이런 말은 굳이 UI 상에 표시해 둘 이유가 없으니까 i 에 원으로 둘러싸인 아이콘,
   그거 누르면 뜨는 식으로. 이건 지침이야」 — 지침 학습시스템 §30) (BUILD 2026-10-03.147)
   V71.info(글) → (i) 버튼 HTML. 누르면 말풍선, 다시 누르거나 바깥을 누르면 닫힘. 다른 레이어는 render 때 window.V71 이 있으면 쓴다.
   ============================================================ */
(function(){
  if(window.V71) return;
  var V71=window.V71={pop:null,btn:null};
  V71.info=function(t){ return '<button type="button" class="v71-i" aria-label="설명 보기" data-v71tip="'+esc(t)+'">i</button>'; };
  V71.close=function(){ if(V71.pop){ V71.pop.remove(); V71.pop=null; } if(V71.btn){ V71.btn.classList.remove("on"); V71.btn=null; } };
  V71.open=function(b){
    V71.close(); var p=document.createElement("div"); p.className="v71-pop"; p.setAttribute("role","tooltip"); p.textContent=b.getAttribute("data-v71tip")||"";
    document.body.appendChild(p); var r=b.getBoundingClientRect(), w=Math.min(300,window.innerWidth-24);
    p.style.maxWidth=w+"px"; var left=Math.max(12,Math.min(r.left+r.width/2-p.offsetWidth/2,window.innerWidth-p.offsetWidth-12));
    var top=r.bottom+8; if(top+p.offsetHeight>window.innerHeight-12) top=r.top-p.offsetHeight-8;
    p.style.left=left+"px"; p.style.top=top+"px"; b.classList.add("on"); V71.pop=p; V71.btn=b;
  };
  document.addEventListener("click",function(e){ var b=e.target&&e.target.closest&&e.target.closest(".v71-i");
    if(b){ e.preventDefault(); e.stopPropagation(); if(V71.btn===b) V71.close(); else V71.open(b); return; }
    if(V71.pop&&!(e.target.closest&&e.target.closest(".v71-pop"))) V71.close(); },true);
  window.addEventListener("scroll",function(){ V71.close(); },true);
  window.addEventListener("keydown",function(e){ if(e.key==="Escape") V71.close(); });
  var css=document.createElement("style"); css.id="v71css";
  css.textContent=[
    ".v71-i{position:relative;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;margin:0 0 0 6px;border-radius:50%;border:1.5px solid var(--ink-3,#8a93a8);background:transparent;color:var(--ink-3,#8a93a8);font:italic 700 12px/1 Georgia,'Times New Roman',serif;cursor:pointer;vertical-align:middle;flex:none}",
    ".v71-i::after{content:'';position:absolute;inset:-10px}",
    ".v71-i:hover,.v71-i.on{border-color:var(--ink-2,#444);color:var(--ink-2,#444)}",
    ".v71-pop{position:fixed;z-index:10000;background:#1d1d1f;color:#fff;font-size:13px;line-height:1.55;padding:10px 12px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.22);white-space:pre-line}"
  ].join("\n");
  document.head.appendChild(css);
})();
