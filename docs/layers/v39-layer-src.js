/* ============================================================
   V39 LAYER — 메뉴 레일 폭 축소 · 학습 타이머는 시험기간 모드에서만 (아토 2026-09-17)
   ① 좌측 메뉴 레일 184px → 128px. 항목 글자가 2~3자라 오른쪽 여백이 남던 것을 없앤다(폰 ≤860px는 원래 숨김).
   ② 공부 타이머(오늘 탭 카드)와 학습 화면의 시간 표시는 phase()==="EXAM"(시험기간)일 때만 나온다.
      평시에는 카드 자체를 만들지 않고, 이미 있으면 지운다. 진행 중이던 타이머 상태(mc-timer)는 건드리지 않는다.
   ============================================================ */
(function(){
  if(window.V39) return;
  var V39=window.V39={};
  V39.examOn=function(){ try{ return phase()==="EXAM"; }catch(e){ return false; } };
  /* ② 오늘 탭 타이머 카드 */
  if(window.V25&&V25.renderTimer){
    var _rt=V25.renderTimer;
    V25.renderTimer=function(){
      if(!V39.examOn()){ var c=$("#timerCard"); if(c) c.remove(); return; }
      return _rt.apply(this,arguments);
    };
  }
  /* ② 학습 화면(studyunit) 시간 표시 */
  var _rsu=renderStudyUnit;
  renderStudyUnit=function(){
    var r=_rsu.apply(this,arguments);
    var t=$("#stTimer"); if(t){ var on=V39.examOn(); t.style.display=on?"":"none"; var h=t.nextElementSibling; if(h&&h.classList.contains("hint")) h.style.display=on?"":"none"; }
    return r;
  };
  var _tick=tickStudy;
  tickStudy=function(){ if(!V39.examOn()) return; return _tick.apply(this,arguments); };
  /* ① 레일 폭 */
  var css=document.createElement("style"); css.id="v39css";
  css.textContent=[
    "@media(min-width:861px){.rail{width:128px;padding:12px 8px}.navb{padding:0 10px;gap:8px}.rail-sec{padding-left:10px}}"
  ].join("\n");
  document.head.appendChild(css);
})();
