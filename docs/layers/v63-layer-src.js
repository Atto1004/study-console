/* ============================================================
   V63 LAYER — 과목 화면 「세부단원」: 절(1.1 ~ 3.3)마다 학습 경로 (BUILD 2026-10-02.111)
   대표님 2026-10-02 「공업수학 먼저 각 세부단원별로 나눠서 학습 경로로 구체화해주고 교수님 학습자료도 세부단원별로 나눠서 첨부해주고
   거기에 그날 수업에 찍은 사진 따로 첨부하는 항목도 생성해줘 없으면 빈칸으로 두고」
   데이터: knowledge/sections.json(docs/tools/build_sections.py) — 절 · 수업일 · 교수님 슬라이드 조각 · 수업 노트/교실 · 덱 파트
         + notes/lessons/_private/<약칭>/photos.json — 그날 사진(비공개, atom /study/ 에서만 · 없으면 빈칸)
   학습 경로 = 교수님 자료 → 교실 → 수업 노트 → 문제 → 암기. 읽음 = V52.st(수업 노트 기록)의 그 섹션.
   ============================================================ */
(function(){
  if(window.V63) return;
  var V63=window.V63={S:null,P:{},open:{}};
  V63.load=function(){ if(V63.SP) return V63.SP;
    V63.SP=fetch("knowledge/sections.json",{cache:"no-cache"}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }).then(function(d){ V63.S=d; return d; });
    return V63.SP; };
  V63.loadPhotos=function(slug){ if(V63.P[slug]!==undefined) return Promise.resolve(V63.P[slug]);
    return fetch("notes/lessons/_private/"+slug+"/photos.json",{cache:"no-cache"}).then(function(r){ return r.ok?r.json():{}; }).catch(function(){ return {}; })
      .then(function(d){ V63.P[slug]=d||{}; return V63.P[slug]; }); };
  V63.data=function(c){ return V63.S&&V63.S.courses&&V63.S.courses[c.name]||null; };
  var md=function(d){ return fmtDate(d); };
  var sidOf=function(h){ var m=/#s=(s\d+)/.exec(h||""); return m?m[1]:null; };
  V63.read=function(c,l){ try{ var x=V52.lesson(c,l.date); if(!x) return null; var sid=sidOf(l.note), st=V52.st(x.id), rd=st.read||{};
    return sid?!!rd[sid]:((x.sids||[]).length&&(x.sids||[]).every(function(s){ return rd[s]; })); }catch(e){ return null; } };
  V63.state=function(c,s){
    var td=today();
    if(!s.dates.length) return s.note&&/예정/.test(s.note)?"plan":"none";
    if(s.dates[0]>td) return "plan";
    var r=s.lessons.map(function(l){ return V63.read(c,l); });
    if(r.length&&r.every(function(x){ return x===true; })) return "done";
    if(r.some(function(x){ return x===true; })) return "part";
    return "todo";
  };
  V63.ST={done:["읽음","ok"],part:["읽는 중","part"],todo:["아직","todo"],plan:["예정","plan"],none:["수업 미확인","none"]};
  V63.row=function(c,D,s,ph){
    var st=V63.state(c,s), lab=V63.ST[st];
    var step=function(n,inner){ return '<div class="v63-step"><span class="v63-sn">'+n+'</span><div class="v63-sc">'+inner+'</div></div>'; };
    var btn=function(href,txt,title,cls){ return '<button class="v63-btn'+(cls?' '+cls:'')+'" data-href="'+esc(href)+'" data-title="'+esc(title||txt)+'">'+txt+'</button>'; };
    var sl=s.slides.map(function(x){ return btn(x.href,"교수님 자료 "+esc(x.label),"공업수학1 "+s.no+" 교수님 자료 "+x.label,"prof"); }).join("");
    var cls=s.lessons.filter(function(l){ return l.cls; }).map(function(l){ return btn(l.cls,"교실 "+md(l.date),s.no+" 교실 "+md(l.date)); }).join("");
    var nt=s.lessons.map(function(l){ var r=V63.read(c,l); return btn(l.note,(r?"✓ ":"")+"수업 노트 "+md(l.date),s.no+" 수업 노트 "+md(l.date),r?"rd":""); }).join("");
    var dk=s.decks.map(function(x){ return btn(x.href,"문제 "+esc(x.label),x.deck+" "+x.label)+btn(x.quiz,"문제만",x.deck+" 문제만","q"); }).join("");
    var mm=D.memo?btn(D.memo,"암기노트","공업수학1 암기노트"):"";
    var pics=s.dates.map(function(d){ var L=(ph&&ph[d])||[];
      return '<div class="v63-pd"><span class="v63-pdd">'+md(d)+'</span>'+(L.length?L.map(function(p,i){
        return '<button class="v63-th" data-href="'+esc(p.f)+'" data-title="'+esc(md(d)+" "+p.kind+(p.label?" · "+p.label:""))+'"><img loading="lazy" src="'+esc(p.f)+'" alt="'+esc(p.kind+" "+p.label)+'"><span>'+esc(p.kind)+(p.t?" "+esc(p.t):"")+'</span></button>'; }).join(""):'<span class="v63-empty"></span>')+'</div>'; }).join("");
    return '<div class="v63-r st-'+st+(V63.open[s.no]?' on':'')+'" data-no="'+esc(s.no)+'">'+
      '<button class="v63-h" aria-expanded="'+(V63.open[s.no]?"true":"false")+'"><b class="v63-no">'+esc(s.no)+'</b><span class="v63-t">'+esc(s.title)+'</span>'+
        '<span class="v63-d">'+(s.dates.length?s.dates.map(md).join(" · "):(st==="plan"?esc(s.note||""):""))+'</span><span class="v63-st '+lab[1]+'">'+lab[0]+'</span></button>'+
      '<div class="v63-body">'+
        step(1,sl||'<span class="v63-empty"></span>')+
        step(2,cls||'<span class="v63-empty"></span>')+
        step(3,nt||'<span class="v63-empty"></span>')+
        step(4,dk||'<span class="v63-empty"></span>')+
        step(5,mm||'<span class="v63-empty"></span>')+
        '<div class="v63-ph"><span class="v63-phh">그날 수업 사진</span>'+(pics||'<span class="v63-empty"></span>')+'</div>'+
      '</div></div>';
  };
  V63.html=function(c,D,ph){
    var by={}; D.sections.forEach(function(s){ (by[s.ch]=by[s.ch]||[]).push(s); });
    return Object.keys(by).sort().map(function(ch){
      var L=by[ch], n=L.filter(function(s){ return V63.state(c,s)==="done"; }).length;
      return '<div class="v63-ch"><div class="v63-chh"><b>'+esc(D.chapters[ch]||ch+"장")+'</b><span>'+n+' / '+L.length+'</span></div>'+L.map(function(s){ return V63.row(c,D,s,ph); }).join("")+'</div>';
    }).join("");
  };
  V63.summary=function(c,D){ var all=D.sections.length, d=D.sections.filter(function(s){ return V63.state(c,s)==="done"; }).length; return d+" / "+all; };
  V63.render=function(){
    var v=$("#v-course"), c=course(ui.course); if(!v||!c||isPersonal(c)) return;
    var old=$("#v63Card",v);
    if(!V63.S){ V63.load().then(function(){ if(V63.S&&ui.view==="course"&&course(ui.course)===c) V63.render(); }); if(old) old.remove(); return; }
    var D=V63.data(c); if(!D){ if(old) old.remove(); return; }
    var card=old;
    if(!card){ card=document.createElement("div"); card.id="v63Card"; card.className="card v63";
      card.innerHTML='<div class="card-h"><h3>세부단원</h3><span class="hs" id="v63Hs"></span></div><div class="v63-b" id="v63B"></div>'; }
    var anchor=$("#v58Card",v)||$("#v55Hero",v); if(!anchor) return;
    if(card.previousElementSibling!==anchor) anchor.insertAdjacentElement("afterend",card);
    var draw=function(ph){
      var b=$("#v63B",card); b.innerHTML=V63.html(c,D,ph);
      $("#v63Hs",card).textContent=V63.summary(c,D);
      $$(".v63-h",b).forEach(function(h){ h.onclick=function(){ var r=h.parentNode, no=r.getAttribute("data-no"); V63.open[no]=!V63.open[no]; r.classList.toggle("on",!!V63.open[no]); h.setAttribute("aria-expanded",V63.open[no]?"true":"false"); }; });
      $$("[data-href]",b).forEach(function(x){ x.onclick=function(e){ e.stopPropagation(); openNote(x.getAttribute("data-href"),x.getAttribute("data-title")); }; });
      $$(".v63-th img",b).forEach(function(im){ im.onerror=function(){ var bt=im.parentNode; if(bt&&bt.parentNode) bt.parentNode.removeChild(bt); }; });
    };
    draw(V63.P[D.slug]||{});
    if(V63.P[D.slug]===undefined) V63.loadPhotos(D.slug).then(function(ph){ if(ui.view==="course"&&course(ui.course)===c) draw(ph); });
  };
  if(window.V55&&V55.render&&!V55._v63){ var _r=V55.render; V55.render=function(){ var x=_r.apply(this,arguments); try{ V63.render(); }catch(e){ if(window.console) console.warn("V63",e); } return x; }; V55._v63=1; }
  if(typeof closeNote==="function"&&!window._v63cn){ var _cn=closeNote; closeNote=function(){ var x=_cn.apply(this,arguments); try{ if(ui.view==="course") V63.render(); }catch(e){} return x; }; window._v63cn=1; }
  var css=document.createElement("style"); css.id="v63css";
  css.textContent=[
    ".v63-b{padding:6px 14px 14px}",
    ".v63-ch{margin-top:10px}.v63-chh{display:flex;align-items:baseline;gap:8px;padding:6px 2px;border-bottom:2px solid var(--line)}.v63-chh b{font-size:14px}.v63-chh span{font-family:var(--font-num,inherit);font-size:12px;color:var(--ink-3)}",
    ".v63-r{border-bottom:1px solid var(--line)}",
    ".v63-h{display:flex;align-items:center;gap:10px;width:100%;min-height:44px;padding:8px 4px;background:none;border:0;text-align:left;cursor:pointer;color:inherit;font:inherit}",
    ".v63-no{font-family:var(--font-num,inherit);font-weight:800;min-width:34px;color:var(--duo-green-text,#2E7D00)}",
    ".v63-t{flex:1;min-width:0;font-weight:700;font-size:13.5px}",
    ".v63-d{font-size:12px;color:var(--ink-3);white-space:nowrap;font-family:var(--font-num,inherit)}",
    ".v63-st{font-size:11px;font-weight:800;padding:2px 8px;border-radius:99px;border:1.5px solid currentColor;white-space:nowrap}",
    ".v63-st.ok{color:#1B7A2E}.v63-st.part{color:#9A5B00}.v63-st.todo{color:#C7261B}.v63-st.plan{color:#1E5FA8}.v63-st.none{color:var(--ink-3)}",
    ".v63-body{display:none;padding:2px 4px 12px 44px}.v63-r.on .v63-body{display:block}",
    ".v63-step{display:flex;gap:10px;align-items:flex-start;padding:4px 0}",
    ".v63-sn{flex:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:11.5px;font-weight:800;background:color-mix(in srgb,var(--line) 60%,transparent);color:var(--ink-2,#444);margin-top:6px}",
    ".v63-sc{display:flex;flex-wrap:wrap;gap:6px;min-height:34px;align-items:center}",
    ".v63-btn{min-height:34px;padding:5px 12px;border-radius:8px;border:1.5px solid var(--line);background:var(--surface);color:var(--ink,#111);font-size:12.5px;font-weight:700;cursor:pointer}",
    ".v63-btn.prof{border-color:#1E5FA8;color:#1E5FA8}.v63-btn.rd{border-color:#1B7A2E;color:#1B7A2E}.v63-btn.q{font-weight:600;color:var(--ink-2,#444)}",
    ".v63-empty{display:inline-block;min-width:120px;height:30px;border:1.5px dashed var(--line);border-radius:8px}",
    ".v63-ph{margin-top:8px;padding-top:8px;border-top:1px dashed var(--line)}.v63-phh{display:block;font-size:12px;font-weight:800;color:var(--ink-3);margin-bottom:6px}",
    ".v63-pd{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:6px}.v63-pdd{font-family:var(--font-num,inherit);font-size:12px;font-weight:700;min-width:48px;color:var(--ink-2,#444)}",
    ".v63-th{width:84px;padding:0;border:1.5px solid var(--line);border-radius:8px;overflow:hidden;background:var(--surface);cursor:pointer;display:flex;flex-direction:column}",
    ".v63-th img{width:100%;height:60px;object-fit:cover;display:block}.v63-th span{font-size:10.5px;color:var(--ink-3);padding:2px 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    "@media (max-width:600px){.v63-b{padding:4px 6px 12px}.v63-body{padding-left:4px}.v63-d{display:none}.v63-th{width:72px}}"
  ].join("\n");
  document.head.appendChild(css);
})();
