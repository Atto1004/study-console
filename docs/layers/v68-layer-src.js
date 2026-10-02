/* ============================================================
   V68 LAYER — 할 일 = 반복 루틴 / 그냥 할 일 분리 (대표님 2026-10-02 「반복적으로 특정 시간대에 생기는 과제·할 일은 시스템이 알아야 하니까 따로 정리」, 지침 §26) (BUILD 2026-10-02.128)
   할 일 탭 맨 위 「반복 루틴」 카드: 이번 주 루틴 항목(체크 그대로) + 과목별 루틴 목록(요일 · 횟수). 아래 주간 카드는 일회성 할 일만 남는다.
   ============================================================ */
(function(){
  if(window.V68) return;
  var V68=window.V68={};
  var DW=["일","월","화","수","목","금","토"];
  V68.render=function(){
    var wb=$("#weeklyBox"); if(!wb) return; var wcard=wb.closest(".card"); if(!wcard) return;
    var card=$("#v68Card");
    if(!card){ card=document.createElement("div"); card.className="card v68"; card.id="v68Card"; wcard.parentNode.insertBefore(card,wcard); }
    var rows=[].filter.call(wb.querySelectorAll(".it"),function(it){ var s=it.querySelector(".src"); return s&&/매주 루틴/.test(s.textContent); });
    var list=[]; courses().filter(isActive).forEach(function(c){ (c.routines||[]).forEach(function(r){ list.push({c:c,r:r}); }); });
    card.innerHTML='<div class="card-h"><h3>반복 루틴</h3><span class="hs">'+list.length+'</span></div><div class="card-b"><div class="v68-wk wkt"></div>'+
      '<details class="v68-all"><summary>루틴 목록</summary>'+list.map(function(x){ return '<div class="lrow"><div class="gr"><div class="t"><span class="cchip">'+esc(x.c.name)+'</span> '+esc(x.r.label)+'</div><div class="s">매주 '+DW[+x.r.dow||0]+'요일까지'+(x.r.count>1?' · '+x.r.count+'번':'')+'</div></div></div>'; }).join("")+'</details></div>';
    var wk=card.querySelector(".v68-wk");
    if(rows.length) rows.forEach(function(r){ var s=r.querySelector(".src"); if(s) s.remove(); wk.appendChild(r); });
    else wk.innerHTML='<div class="hint" style="padding:6px 0">이번 주 루틴을 모두 했습니다.</div>';
    var h=wcard.querySelector(".card-h h3"); if(h&&/할 일/.test(h.textContent)&&!/일회성/.test(h.textContent)) h.textContent=h.textContent.replace(/할 일/,"할 일 (일회성)");
  };
  var _rt=renderTodo; renderTodo=function(){ _rt.apply(this,arguments); try{ V68.render(); }catch(e){ if(window.console) console.warn("V68",e); } };
  var css=document.createElement("style"); css.id="v68css";
  css.textContent=[
    ".v68-wk{display:block}.v68-wk .it{width:100%}.v68-wk .it:first-child{border-top:0}",
    ".v68-all{margin-top:8px}.v68-all summary{cursor:pointer;font-size:13px;color:var(--ink-3);min-height:40px;display:flex;align-items:center}"
  ].join("\n");
  document.head.appendChild(css);
})();
