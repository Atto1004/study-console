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
    var g=$(".topbar .topbar-in"); if(!g) return; var old=$("#v65Clock"); if(old&&old.parentNode===g&&g.firstChild===old) return; if(old) old.remove();   /* 대표님 10/2 「아예 완전 왼쪽으로, 좀 크게」 */
    var el=document.createElement("div"); el.id="v65Clock"; el.className="v65-clock";
    var roll=function(sec){ var s='<span class="v65-w"><span class="v65-r" style="animation-duration:'+sec+'s">'; for(var i=0;i<10;i++) s+='<i>'+i+'</i>'; return s+'</span></span>'; };
    el.innerHTML='<span class="v65-t"><b id="v65H">--:--:--</b><small id="v65Ms">.'+roll(1)+roll(0.1)+roll(0.01)+'</small></span><span class="v65-d" id="v65D"></span>';
    g.insertBefore(el,g.firstChild);
    /* 10/3 가볍게(BUILD .131, 대표님 「최적화 한번 해줘」): 예전엔 JS 가 1초에 60번 밀리초 글자를 바꿔 가만히 둬도 메인스레드 6%(시계 빼면 0.1%).
       이제 밀리초 = 숫자 띠를 CSS 애니메이션으로 굴린다(GPU) — 보이는 건 같고 JS 는 1초에 한 번 시:분:초·날짜만.
       시작 지연 -(지금 ms)로 벽시계와 맞추고, 탭에 돌아오면 다시 맞춘다. 시계가 화면에서 빠지면 타이머도 멈춘다(예전엔 id 로 찾아 루프가 겹칠 수 있었다) */
    var H=el.querySelector("#v65H"), D=el.querySelector("#v65D"), R=el.querySelectorAll(".v65-r"), lastD="";
    var sync=function(){   /* 애니메이션 위치를 직접 맞춘다(지연만 주면 그려지기 시작한 때부터라 0.3초쯤 늦었다). 애니메이션 시계는 이번 프레임 시작 시각이라 그 차이만큼 앞당긴다 */
      var lag=(document.timeline&&document.timeline.currentTime!=null&&window.performance)?Math.max(0,performance.now()-document.timeline.currentTime):0, ms=(Date.now()+lag)%1000;
      for(var i=0;i<R.length;i++){ var a=R[i].getAnimations?R[i].getAnimations()[0]:null; if(a) a.currentTime=ms; else R[i].style.animationDelay=(-ms)+"ms"; } };
    var tick=function(){ if(!el.isConnected){ document.removeEventListener("visibilitychange",onVis); return; } var d=new Date();
      H.textContent=p2(d.getHours())+":"+p2(d.getMinutes())+":"+p2(d.getSeconds());
      var s=(d.getMonth()+1)+"월 "+d.getDate()+"일 ("+DW[d.getDay()]+")"; if(s!==lastD){ lastD=s; D.textContent=s; }
      if(d.getSeconds()===0) sync();   /* 1분에 한 번 다시 맞춤 */
      setTimeout(tick, 1000-Date.now()%1000+5); };
    var onVis=function(){ if(!document.hidden) sync(); };
    document.addEventListener("visibilitychange",onVis);
    sync(); tick();
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

  /* ---------- ③ 미적분 클리닉룸 (대표님 10/2 「학습앱에서 클리닉룸 예약도」) — 운영표 · 예약 사이트 · 예약한 시간 기록(→ 공부계획 바쁜 시간) ----------
     출처: 미적2 LMS 공지 「[필독] 미분적분학2 클리닉룸 운영 안내」(9/4). 예약 사이트는 미적1 아이디로 로그인 — 로그인은 대표님만. */
  V65.CLINIC={url:"https://clinic-room-attendance.vercel.app/",
    slots:[["월","16:00","17:00","융합교육관 503·504"],["월","17:00","18:00","융합교육관 503·504"],["화","16:00","17:00","융합교육관 206·207"],["화","17:00","18:00","융합교육관 206·207"],
      ["수","13:00","14:00","융합교육관 503·504"],["수","14:00","15:00","융합교육관 503·504"],["목","16:00","17:00","융합교육관 206·207"],["목","17:00","18:00","융합교육관 206·207"],["금","16:00","17:00","융합교육관 503·504"],["금","17:00","18:00","융합교육관 503·504"]],
    rule:"중간고사 전(2~8주차) 1회 · 기말고사 전(9~15주차) 1회 이상 퀴즈 합격 · 타임당 20명"};
  V65.bookings=function(){ S.clinic=S.clinic||[]; return S.clinic; };
  V65.clinicHTML=function(){
    var td=today(), bk=V65.bookings().filter(function(b){ return b.date>=td; }).sort(function(a,b){ return (a.date+a.start)<(b.date+b.start)?-1:1; });
    var opts=V65.CLINIC.slots.map(function(x,i){ return '<option value="'+i+'">'+x[0]+' '+x[1]+'–'+x[2]+' · '+x[3]+'</option>'; }).join("");
    return '<div class="card v65-cl" id="v65Clinic"><div class="card-h"><h3>클리닉룸</h3><span class="hs">'+esc(V65.CLINIC.rule)+'</span><div class="ha"><a class="btn a" href="'+V65.CLINIC.url+'" target="_blank" rel="noopener">예약하러 가기</a></div></div><div class="card-b">'+
      '<div class="v65-clg">'+["월","화","수","목","금"].map(function(d){ var xs=V65.CLINIC.slots.filter(function(x){ return x[0]===d; }); return '<div class="v65-cld"><b>'+d+'</b><span>'+esc(xs[0][1]+'–'+xs[xs.length-1][2])+'</span><small>'+esc(xs[0][3])+'</small></div>'; }).join("")+'</div>'+
      (bk.length?'<div class="v65-bk">'+bk.map(function(b){ return '<div class="lrow"><div class="gr"><div class="t">'+esc(b.date)+' '+esc(b.start)+'–'+esc(b.end)+'</div><div class="s">'+esc(b.place||"")+'</div></div><button type="button" class="v65-x" data-v65cx="'+esc(b.id)+'" aria-label="예약 지우기">✕</button></div>'; }).join("")+'</div>':'')+
      '<div class="v65-add"><input class="input" type="date" id="v65cD" value="'+td+'"><select class="input" id="v65cS">'+opts+'</select><button type="button" class="btn" id="v65cB">예약한 시간 넣기</button></div></div></div>';
  };
  V65.clinic=function(){
    if(ui.view!=="course") return; var c=course(ui.course); var old=$("#v65Clinic"); if(old) old.remove(); if(!c||c.name!=="미분적분학2") return;
    var host=$("#v58Card")||$("#v55Hero"); var v=$("#v-course"); if(!v) return;
    var w=document.createElement("div"); w.innerHTML=V65.clinicHTML(); var card=w.firstChild;
    if(host&&host.parentNode===v) v.insertBefore(card,host.nextSibling); else v.insertBefore(card,v.children[1]||null);
    var b=$("#v65cB",card); if(b) b.onclick=function(){ var d=$("#v65cD",card).value, x=V65.CLINIC.slots[+$("#v65cS",card).value]; if(!d||!x) return;
      V65.bookings().push({id:uid(),date:d,start:x[1],end:x[2],place:x[3]}); persist(); toast("클리닉룸 예약을 공부계획에 넣었어요"); V65.clinic(); };
    $$("[data-v65cx]",card).forEach(function(x){ x.onclick=function(){ S.clinic=V65.bookings().filter(function(q){ return q.id!==x.dataset.v65cx; }); persist(); V65.clinic(); }; });
  };

  var _render=render;
  render=function(){ V65.hook(); _render.apply(this,arguments); V65.clock(); setTimeout(V65.clinic,50); };

  var css=document.createElement("style"); css.id="v65css";
  css.textContent=[
    ".v65-clock{order:-1;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;line-height:1.1;padding:6px 16px;border-right:1px solid var(--line);font-variant-numeric:tabular-nums;white-space:nowrap;flex:none}",
    ".v65-t b{font-size:24px;font-weight:800;letter-spacing:.01em}.v65-t small{font-size:15px;font-weight:700;color:var(--ink-3);margin-left:1px;display:inline-block;width:38px;height:17px;line-height:17px;overflow:hidden;vertical-align:-3px}.v65-w{display:inline-block;height:17px;overflow:hidden;vertical-align:top}.v65-r{display:block;will-change:transform;animation:v65roll 1s steps(10) infinite}.v65-r i{display:block;font-style:normal;height:17px;line-height:17px}@keyframes v65roll{to{transform:translateY(-100%)}}",
    ".v65-d{font-size:13px;font-weight:700;color:var(--ink-2);margin-top:2px}",
    ".topbar-in{align-items:center}",
    "@media (max-width:600px){.v65-clock{padding:4px 10px 4px 0;border-right:0}.v65-t b{font-size:18px}.v65-t small{font-size:12px;width:30px;height:14px;line-height:14px;vertical-align:-2px}.v65-w,.v65-r i{height:14px;line-height:14px}.v65-d{font-size:11px}}",
    ".v65-clg{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}.v65-cld{border:1px solid var(--line);border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:2px;font-size:13px}.v65-cld b{font-size:14px}.v65-cld small{color:var(--ink-3);font-size:11.5px}",
    ".v65-add{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}.v65-add .input{min-height:42px}.v65-add select{flex:1;min-width:200px}.v65-bk{margin-top:8px}",
    "@media (max-width:600px){.v65-clg{grid-template-columns:repeat(3,minmax(0,1fr))}}",
    ".v65-x{flex:none;width:36px;height:36px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink-3);font-size:14px;cursor:pointer;margin-left:6px}.v65-x:hover{color:#C7261B;border-color:#C7261B}"
  ].join("\n");
  document.head.appendChild(css);
})();
