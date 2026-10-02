/* ============================================================
   V65 LAYER — 대표님 2026-10-02 (BUILD 2026-10-02.123)
   ① 맨 위 줄(중간고사 · 저장 · 새로고침) 맨 왼쪽에 시계 — 시:분:초.밀리초 + 날짜 · 요일
   ② LMS 공지 지우기 — 지난 공지(추석 클리닉룸 · 지난 휴강 등)를 ✕ 로 숨김(S.lmsHide), 할 일 탭 · 과목 화면 둘 다
   ============================================================ */
(function(){
  if(window.V65) return;
  var V65=window.V65={};
  var DW=["일","월","화","수","목","금","토"];
  function p2(n){ return (n<10?"0":"")+n; }
  function p3(n){ return (n<10?"00":n<100?"0":"")+n; }

  /* ---------- ① 시계 ---------- */
  V65.clock=function(){
    var g=$(".topbar .topact"); if(!g) return; var old=$("#v65Clock"); if(old&&old.parentNode===g&&g.firstChild===old) return; if(old) old.remove();
    var el=document.createElement("div"); el.id="v65Clock"; el.className="v65-clock";
    el.innerHTML='<span class="v65-t"><b id="v65H">--:--:--</b><small id="v65Ms">.000</small></span><span class="v65-d" id="v65D"></span>';
    g.insertBefore(el,g.firstChild);   /* 중간고사 D-day · 저장 · 새로고침 줄의 맨 왼쪽 */
    var tick=function(){ var d=new Date();
      var h=$("#v65H"), m=$("#v65Ms"), dd=$("#v65D"); if(!h) return;
      h.textContent=p2(d.getHours())+":"+p2(d.getMinutes())+":"+p2(d.getSeconds()); m.textContent="."+p3(d.getMilliseconds());
      var s=(d.getMonth()+1)+"월 "+d.getDate()+"일 ("+DW[d.getDay()]+")"; if(dd.textContent!==s) dd.textContent=s;
      requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };

  /* ---------- ② LMS 공지 지우기 ---------- */
  V65.key=function(a){ return String(a.id||a.url||((a.title||"")+"|"+(a.posted||""))); };
  V65.hidden=function(){ S.lmsHide=S.lmsHide||{}; return S.lmsHide; };
  V65.hook=function(){
    if(!window.V25||!V25.lms||V25._v65) return; V25._v65=true;
    var _l=V25.lms;
    V25.lms=function(cb){ _l(function(st){
      if(st&&st.announcements){ var h=V65.hidden(); st=Object.assign({},st,{announcements:st.announcements.filter(function(a){ return !h[V65.key(a)]; })}); }
      V65.last=st; cb(st); setTimeout(V65.decorate,0); }); };
  };
  V65.decorate=function(){
    var st=V65.last; if(!st) return; var ann=st.announcements||[];
    [["#lmsTodoBox",null,5],["#lmsCourseBox","course",4]].forEach(function(x){
      var box=$(x[0]); if(!box) return; var list=ann;
      if(x[1]==="course"){ var c=ui.course&&course(ui.course), lc=c&&V25.lmsCourse?V25.lmsCourse(c,st):null; if(!lc) return; list=ann.filter(function(a){ return a.course_id===lc.id; }); }
      list=list.slice(0,x[2]);
      var hint=[].filter.call(box.querySelectorAll(".hint"),function(h){ return /공지/.test(h.textContent); })[0]; if(!hint) return;
      var rows=[], n=hint.nextElementSibling; while(n&&n.classList.contains("lrow")){ rows.push(n); n=n.nextElementSibling; }
      rows.forEach(function(r,i){ var a=list[i]; if(!a||r.querySelector(".v65-x")) return;
        var b=document.createElement("button"); b.type="button"; b.className="v65-x"; b.setAttribute("aria-label","공지 지우기"); b.textContent="✕";
        b.onclick=function(){ V65.hidden()[V65.key(a)]=Date.now(); persist(); r.remove(); toast("공지를 지웠어요"); };
        r.appendChild(b); });
    });
  };

  var _render=render;
  render=function(){ V65.hook(); _render.apply(this,arguments); V65.clock(); };

  var css=document.createElement("style"); css.id="v65css";
  css.textContent=[
    ".v65-clock{display:flex;flex-direction:column;align-items:flex-end;justify-content:center;line-height:1.05;margin-right:4px;padding:4px 12px;border-radius:12px;background:var(--surface-2,rgba(31,42,68,.05));border:1px solid var(--line);font-variant-numeric:tabular-nums;white-space:nowrap}",
    ".v65-t b{font-size:17px;font-weight:800;letter-spacing:.01em}.v65-t small{font-size:12px;font-weight:700;color:var(--ink-3);margin-left:1px;display:inline-block;width:30px}",
    ".v65-d{font-size:11px;font-weight:700;color:var(--ink-2)}",
    ".topbar-in{align-items:center}",
    "@media (max-width:600px){.v65-clock{padding:2px 8px;margin-right:6px}.v65-t b{font-size:14px}.v65-t small{font-size:10px;width:24px}.v65-d{font-size:10px}}",
    ".v65-x{flex:none;width:36px;height:36px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink-3);font-size:14px;cursor:pointer;margin-left:6px}.v65-x:hover{color:#C7261B;border-color:#C7261B}"
  ].join("\n");
  document.head.appendChild(css);
})();
