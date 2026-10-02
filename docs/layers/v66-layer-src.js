/* ============================================================
   V66 LAYER — 학습 탭 「강의 정리 노트」 다시 짜기 (대표님 2026-10-02 「지저분하다, 한눈에 보기 좋게, 조잡하지 않게」 · 지침 학습시스템 §26)
   과목마다 접힌 한 덩어리 → 펼치면 「시험 대비」 한 줄(칩) · 회차마다 한 줄(날짜 · 주제 + 교실 · 노트 · 덱 버튼) · 과제 · 그 밖의 자료(접힘).
   임시 · 자동 변환 · 구버전 표시가 붙은 것은 뺀다(파일은 남음). (BUILD 2026-10-02.124)
   ============================================================ */
(function(){
  if(window.V66) return;
  var V66=window.V66={};
  var DW=["일","월","화","수","목","금","토"];
  V66.open=(function(){ try{ return JSON.parse(localStorage.getItem("mc-nt-open")||"{}")||{}; }catch(e){ return {}; } })();
  V66.md=function(d){ var x=D(d); return (x.getMonth()+1)+"/"+x.getDate()+"("+DW[x.getDay()]+")"; };
  V66.kind=function(n){
    var f=n.file||"", t=n.title||"";
    if(/임시|자동 변환|구버전/.test(t)) return "skip";
    if(/notes\/classroom\//.test(f)) return "class";
    if(/notes\/lessons\//.test(f)) return "lesson";
    if(/중간고사 대비|기말고사 대비/.test(t)) return "exam";
    if(n.type==="과제"||/해답지|과제/.test(t)) return "hw";
    return "other";
  };
  V66.topic=function(t){
    t=String(t||"").replace(/^(수업 노트|교실)\s*·\s*\d{1,2}\/\d{1,2}\s*·\s*/,"").replace(/\s*[—-]\s*\d+파트.*$/,"").replace(/\s*·\s*문제\s*\d+.*$/,"");
    return t.length>34?t.slice(0,33)+"…":t;
  };
  V66.examChip=function(t){
    var m=String(t).match(/대비\s*(\d*)\s*\(([^)]*)\)/), n=m&&m[1]?m[1]:"1", sc=m?m[2]:String(t).replace(/^.*대비\s*/,"");
    sc=sc.replace(/\s*·\s*/g,"·").replace(/교재 선행/,"선행"); if(sc.length>22) sc=sc.slice(0,21)+"…";
    return "대비 "+n+" · "+sc;
  };
  V66.render=function(){
    var box=$("#ntList"); if(!box) return;
    var by={}; (window.NOTES||[]).forEach(function(n){ var k=V66.kind(n); if(k==="skip") return; var c=n.course||"전체"; (by[c]=by[c]||[]).push(Object.assign({k:k},n)); });
    var order=courses().map(function(c){ return c.name; }).filter(function(x){ return by[x]; }); Object.keys(by).forEach(function(k){ if(order.indexOf(k)<0) order.push(k); });
    var total=0;
    var html=order.map(function(name){
      var list=by[name], sess={}, exam=[], hw=[], other=[];
      list.forEach(function(n){
        if(n.k==="exam") exam.push(n); else if(n.k==="hw") hw.push(n);
        else if((n.k==="class"||n.k==="lesson")&&n.date){ var s=sess[n.date]=sess[n.date]||{date:n.date,f:{}}; s.f[n.k]=n; if(!s.t||n.k==="lesson") s.t=V66.topic(n.title); }
        else other.push(n);
      });
      var days=Object.keys(sess).sort().reverse(), c=courses().filter(function(x){ return x.name===name; })[0];
      var cnt=days.length+exam.length+hw.length; total+=cnt; if(!cnt&&!other.length) return "";
      var open=!!V66.open[name];
      var head='<button type="button" class="v66-h" data-v66c="'+esc(name)+'"><span class="crow-chip" style="background:'+(window.V44&&c?V44.color(c):"#5B6B8C")+'">'+esc(window.V44?V44.abbr(name):name.slice(0,2))+'</span><b>'+esc(name)+'</b>'+
        '<span class="v66-m">'+(days.length?"회차 "+days.length:"")+(exam.length?(days.length?" · ":"")+"시험 대비 "+exam.length:"")+(days.length?" · 최근 "+esc(V66.md(days[0])):"")+'</span><i class="v66-ar">'+(open?"−":"+")+'</i></button>';
      if(!open) return '<div class="v66-c">'+head+'</div>';
      var btn=function(n,lab,cls){ return n?'<button type="button" class="v66-b '+cls+'" data-note="'+esc(n.file)+'" data-title="'+esc(n.title)+'">'+lab+'</button>':''; };
      var rows='';
      if(exam.length) rows+='<div class="v66-r v66-ex"><span class="v66-d">시험 대비</span><span class="v66-chips">'+exam.map(function(n){ return '<button type="button" class="v66-chip" data-note="'+esc(n.file)+'" data-title="'+esc(n.title)+'">'+esc(V66.examChip(n.title))+'</button>'; }).join("")+'</span></div>';
      rows+=days.map(function(d){ var s=sess[d]; return '<div class="v66-r"><span class="v66-d">'+esc(V66.md(d))+'</span><span class="v66-t">'+esc(s.t||"")+'</span><span class="v66-bs">'+btn(s.f.class,"교실","cl")+btn(s.f.lesson,"노트","ln")+'</span></div>'; }).join("");
      if(hw.length) rows+='<div class="v66-r"><span class="v66-d">과제</span><span class="v66-chips">'+hw.map(function(n){ return '<button type="button" class="v66-chip" data-note="'+esc(n.file)+'" data-title="'+esc(n.title)+'">'+esc(V66.topic(n.title).replace(/\s*—.*$/,""))+'</button>'; }).join("")+'</span></div>';
      if(other.length) rows+='<details class="v66-more"><summary>그 밖의 자료 '+other.length+'</summary>'+other.map(function(n){ return '<div class="v66-r"><span class="v66-d">'+(n.date?esc(V66.md(n.date)):"")+'</span><span class="v66-t">'+esc(V66.topic(n.title))+'</span><span class="v66-bs">'+btn(n,"열기","ln")+'</span></div>'; }).join("")+'</details>';
      return '<div class="v66-c on">'+head+'<div class="v66-body">'+rows+'</div></div>';
    }).join("");
    $("#ntHs").textContent=total+"개";
    box.innerHTML=html||'<div class="empty">아직 노트가 없습니다.</div>';
    $$("[data-v66c]",box).forEach(function(b){ b.onclick=function(){ var k=b.dataset.v66c; V66.open[k]=!V66.open[k]; try{ localStorage.setItem("mc-nt-open",JSON.stringify(V66.open)); }catch(e){} V66.render(); }; });
    $$("[data-note]",box).forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); openNote(b.dataset.note,b.dataset.title); }; });
    var hub=$("#btnHub"); if(hub) hub.onclick=function(){ openNote("notes/hub.html","아토 학습 허브"); };
  };
  renderNotes=function(){ V66.render(); };

  var css=document.createElement("style"); css.id="v66css";
  css.textContent=[
    "#ntList{display:flex;flex-direction:column;gap:8px;padding:10px 12px 14px}",
    ".v66-c{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--surface)}",
    ".v66-h{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:10px;width:100%;padding:10px 14px;min-height:52px;cursor:pointer}",
    ".v66-h b{font-size:15px;font-weight:800}.v66-m{font-size:12.5px;color:var(--ink-3);flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.v66-ar{font-style:normal;font-size:18px;color:var(--ink-3);width:22px;text-align:center}",
    ".v66-body{border-top:1px solid var(--line);padding:4px 14px 10px}",
    ".v66-r{display:grid;grid-template-columns:78px minmax(0,1fr) auto;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 55%,transparent);font-size:15px}",
    ".v66-r:last-child{border-bottom:0}",
    ".v66-d{font-size:12.5px;font-weight:700;color:var(--ink-3);font-variant-numeric:tabular-nums}",
    ".v66-t{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".v66-bs{display:flex;gap:6px}.v66-b{border:1px solid var(--line);background:var(--surface);border-radius:9px;min-height:36px;padding:0 12px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;color:var(--ink)}.v66-b.cl{border-color:color-mix(in srgb,#2E7D00 40%,transparent);color:#2E7D00}",
    ".v66-ex .v66-chips,.v66-r .v66-chips{grid-column:2/4;display:flex;flex-wrap:wrap;gap:6px}",
    ".v66-chip{border:1px solid var(--line);background:var(--surface-2,var(--surface));border-radius:999px;min-height:34px;padding:0 12px;font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;color:var(--ink)}",
    ".v66-more summary{cursor:pointer;font-size:12.5px;color:var(--ink-3);min-height:40px;display:flex;align-items:center}",
    "#v-study .v66-c{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.14)}#v-study .v66-h b,#v-study .v66-t{color:#E6ECF5}#v-study .v66-b,#v-study .v66-chip{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.18);color:#E6ECF5}#v-study .v66-b.cl{color:#9BE07A}#v-study .v66-body{border-color:rgba(255,255,255,.12)}#v-study .v66-r{border-color:rgba(255,255,255,.08)}",
    "@media (max-width:600px){.v66-r{grid-template-columns:62px minmax(0,1fr);}.v66-bs{grid-column:2}.v66-m{display:none}}"
  ].join("\n");
  document.head.appendChild(css);
})();
