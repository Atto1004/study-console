/* ============================================================
   V64 LAYER — 대표님 2026-10-02 (BUILD 2026-10-02.121)
   ① XP 표시 빼기 — 학습 탭 로비 레벨 링 · 「Lv · XP」, 과목 화면 「이 과목 XP」 (기록은 그대로 두고 화면에서만)
   ② 「확인」 탭 — 아톰이 자료를 만들기 전에 헷갈리는 것을 묻는 곳. 질문 = _private/asks.json(atom 안에서만), 첨부(사진 · 녹음 구간 · 영상 구간 · 파일).
      답(맞아요 · 아니에요 · 모르겠어요 · 고른 보기 · 메모)은 S.asks[id] 에 저장 → atom 학습 상태(kv study_state)로 올라가 아톰이 읽는다.
   ③ 수업 영상 · 녹음 주차별 재생 — _private/media.json(docs/tools/build_media_index.py) · 과목 화면 「수업 자료」 표에서 그날 ▶, 「확인」 탭 첨부에서도.
   ============================================================ */
(function(){
  if(window.V64) return;
  var V64=window.V64={};

  /* ---------- 데이터 ---------- */
  V64.A=null; V64.M=null;
  V64.load=function(){
    if(V64._p) return V64._p;
    var get=function(u){ return fetch(u,{cache:"no-cache"}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }); };
    V64._p=Promise.all([ATOM_HOSTED?get("_private/asks.json"):Promise.resolve(null),ATOM_HOSTED?get("_private/media.json"):Promise.resolve(null)]).then(function(x){
      V64.A=(x[0]&&x[0].asks)||[]; V64.M=(x[1]&&x[1].items)||[]; return true; });
    return V64._p;
  };
  /* S(상태)는 atom 안에서 boot() 가 atom 상태를 받을 때까지 null — 그 사이 asks.json 이 먼저 도착해 badge 가 돌면 S.asks 에서 예외가 나고,
     그 예외가 render 래퍼를 타고 올라가 뒤 레이어들의 후처리까지 끊었다(10/4 오류 점검). S 없으면 읽기는 빈 객체, 그리기·저장은 하지 않는다. boot() 뒤 첫 render 가 다시 그린다. */
  V64.ready=function(){ return !!S; };
  V64.ans=function(){ if(!S) return {}; S.asks=S.asks||{}; return S.asks; };
  V64.open=function(){ var a=V64.ans(); return (V64.A||[]).filter(function(q){ return !a[q.id]; }); };

  /* ---------- ① XP ---------- */
  var css0=document.createElement("style"); css0.id="v64xp";
  css0.textContent=".ow-ring,.ow-mhead span{display:none!important}.v55-stats>div:has(.v55-xp){display:none!important}";
  document.head.appendChild(css0);

  /* ---------- 탭 ---------- */
  V64.ensureNav=function(){
    if(window.V59&&V59.ensureNav) V59.ensureNav();
    if(NAV.some(function(x){ return x.k==="ask"; })) return;
    var i=NAV.map(function(x){ return x.k; }).indexOf("plan");
    NAV.splice(i<0?NAV.length:i+1,0,{k:"ask",n:"확인",ic:icon('<circle cx="12" cy="12" r="8.6"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.6"/><circle cx="12" cy="16.6" r=".6"/>')});
  };
  V64.ensureView=function(){
    if($("#v-ask")) return; var ref=$("#v-plan")||$("#v-study"); if(!ref) return;
    var v=document.createElement("section"); v.className="view"; v.id="v-ask";
    v.innerHTML='<div class="vh"><h1>확인</h1><div class="sub" id="v64Sub"></div></div><div id="v64Body"></div>';
    ref.parentNode.insertBefore(v,ref.nextSibling);
  };
  V64.badge=function(){
    if(!V64.ready()) return;
    var n=V64.open().length;
    $$('#rail .navb[data-k="ask"],#tabbar .tabb[data-k="ask"]').forEach(function(b){ var d=b.querySelector(".v64-dot"); if(n){ if(!d){ d=document.createElement("i"); d.className="v64-dot"; b.appendChild(d); } d.textContent=n; } else if(d) d.remove(); });
  };

  /* ---------- 첨부 ---------- */
  V64.attHTML=function(at){
    if(!at) return "";
    if(at.type==="image") return '<figure class="v64-att"><img src="'+esc(at.src)+'" alt="" loading="lazy">'+(at.cap?'<figcaption>'+esc(at.cap)+'</figcaption>':'')+'</figure>';
    if(at.type==="audio"||at.type==="video"){
      var src=esc(at.src)+(at.start!=null?'#t='+(+at.start)+(at.end!=null?','+(+at.end):''):'');
      var tag=at.type==="audio"?'<audio controls preload="metadata" src="'+src+'"></audio>':'<video controls preload="metadata" playsinline src="'+src+'"></video>';
      var mm=function(s){ s=+s||0; return Math.floor(s/60)+":"+(s%60<10?"0":"")+Math.floor(s%60); };
      return '<figure class="v64-att">'+tag+'<figcaption>'+(at.start!=null?mm(at.start)+(at.end!=null?'–'+mm(at.end):'')+' · ':'')+esc(at.cap||"")+(at.text?'<q>'+esc(at.text)+'</q>':'')+'</figcaption></figure>';
    }
    if(at.type==="text") return '<blockquote class="v64-quote">'+esc(at.text||"")+(at.cap?'<cite>'+esc(at.cap)+'</cite>':'')+'</blockquote>';
    return '<a class="v60-file" href="'+esc(at.src)+'" target="_blank" rel="noopener">'+esc(at.cap||"파일")+'</a>';
  };

  /* ---------- ② 확인 화면 ---------- */
  V64.render=function(){
    V64.ensureView(); var body=$("#v64Body"); if(!body) return;
    if(!V64.ready()){ body.innerHTML='<div class="v44-mut" style="padding:16px">…</div>'; return; }
    if(V64.A==null){ body.innerHTML='<div class="v44-mut" style="padding:16px">…</div>'; V64.load().then(function(){ if(ui.view==="ask") V64.render(); V64.badge(); }); return; }
    var a=V64.ans(), open=V64.open(), done=(V64.A||[]).filter(function(q){ return a[q.id]; });
    $("#v64Sub").textContent=open.length?"답 기다리는 것 "+open.length:"모두 답함";
    var card=function(q,ans){
      var opts=(q.options&&q.options.length?q.options:["맞아요","아니에요"]).concat(["모르겠어요"]);
      return '<div class="card v64-q'+(ans?' done':'')+'" data-q="'+esc(q.id)+'"><div class="card-b">'+
        '<div class="v64-h">'+(q.subj?'<span class="chip acc">'+esc(q.subj)+'</span>':'')+(q.urgent?'<span class="chip crit">급함</span>':'')+(q.when?'<span class="hint">'+esc(q.when)+'</span>':'')+'</div>'+
        '<div class="v64-t">'+esc(q.q)+'</div>'+(q.ctx?'<div class="v64-ctx">'+esc(q.ctx)+'</div>':'')+
        (q.att||[]).map(V64.attHTML).join("")+
        (ans?'<div class="v64-ans"><b>'+esc(ans.a)+'</b>'+(ans.note?' — '+esc(ans.note):'')+' <button type="button" class="btn xs" data-v64undo="'+esc(q.id)+'">다시 답하기</button></div>'
          :'<div class="v64-opts">'+opts.map(function(o){ return '<button type="button" class="btn'+(o==="모르겠어요"?'':' a')+'" data-v64a="'+esc(o)+'">'+esc(o)+'</button>'; }).join("")+'</div>'+
           '<div class="v64-mrow"><textarea class="input v64-note" rows="2" placeholder="메모"></textarea><button type="button" class="btn a v64-send" data-v64a="메모">보내기</button></div>')+'</div></div>';
    };
    body.innerHTML=(open.length?open.map(function(q){ return card(q,null); }).join(""):'<div class="empty">지금 확인할 것이 없습니다.</div>')+
      (done.length?'<details class="v64-done"><summary>답한 것 '+done.length+'</summary>'+done.map(function(q){ return card(q,a[q.id]); }).join("")+'</details>':'');
    $$("[data-v64a]",body).forEach(function(b){ b.onclick=function(){ if(!V64.ready()) return; var c=b.closest("[data-q]"), id=c.dataset.q, note=(c.querySelector(".v64-note")||{}).value||"";
      V64.ans()[id]={a:b.dataset.v64a,note:note.trim(),at:Date.now()}; persist(); toast("답을 보냈어요"); V64.render(); V64.badge(); }; });
    $$(".v64-note",body).forEach(function(t){ t.addEventListener("keydown",function(e){ if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){ e.preventDefault(); if(!t.value.trim()) return; var b=t.closest("[data-q]").querySelector(".v64-send"); if(b) b.click(); } }); });
    $$("[data-v64undo]",body).forEach(function(b){ b.onclick=function(){ if(!V64.ready()) return; delete V64.ans()[b.dataset.v64undo]; persist(); V64.render(); V64.badge(); }; });
  };

  /* ---------- ③ 수업 자료 표에서 그날 영상 · 녹음 ---------- */
  V64.mediaOf=function(subj,date){ return (V64.M||[]).filter(function(m){ return m.subj===subj&&m.date===date; }); };
  V64.player=function(list,title){
    var ov=document.createElement("div"); ov.className="v64-ov";
    ov.innerHTML='<div class="v64-pl"><div class="v64-plh"><b>'+esc(title)+'</b><button type="button" class="btn xs" data-x="1">닫기</button></div>'+
      '<div class="v64-plv"></div><div class="v64-pll">'+list.map(function(m,i){ return '<button type="button" class="v64-pi'+(i?'':' on')+'" data-i="'+i+'">'+(m.kind==="audio"?"♪ ":"▶ ")+esc(m.piece?("W"+m.piece):m.title)+(m.mb?'<small>'+m.mb+'MB</small>':'')+'</button>'; }).join("")+'</div></div>';
    document.body.appendChild(ov);
    var show=function(i){ var m=list[i]; $$(".v64-pi",ov).forEach(function(b){ b.classList.toggle("on",+b.dataset.i===i); });
      ov.querySelector(".v64-plv").innerHTML=(m.kind==="audio"?'<audio controls autoplay src="'+esc(m.src)+'"></audio>':'<video controls autoplay playsinline src="'+esc(m.src)+'"></video>')+(m.tx?'<a class="v60-file" href="'+esc(m.tx)+'" target="_blank" rel="noopener">전사 텍스트</a>':''); };
    $$(".v64-pi",ov).forEach(function(b){ b.onclick=function(){ show(+b.dataset.i); }; });
    ov.onclick=function(e){ if(e.target===ov||e.target.dataset.x) ov.remove(); };
    show(0);
  };
  V64.decorateV58=function(){
    if(!V64.M||!V64.M.length) return; var c=course(ui.course); if(!c) return;
    $$(".v58-t tr.v58-r").forEach(function(tr){
      if(tr.querySelector(".v64-play")) return;
      var m=(tr.textContent||"").match(/(\d{1,2})\/(\d{1,2})\(/); if(!m) return;
      var d=today().slice(0,4)+"-"+(m[1].length<2?"0":"")+m[1]+"-"+(m[2].length<2?"0":"")+m[2];
      var list=V64.mediaOf(c.name,d); if(!list.length) return;
      var td=tr.querySelector("td.v58-d")||tr.children[1]; if(!td) return;
      var b=document.createElement("button"); b.type="button"; b.className="btn xs v64-play"; b.textContent=(list[0].kind==="audio"?"♪ ":"▶ ")+list.length;
      b.onclick=function(e){ e.stopPropagation(); V64.player(list,c.name+" · "+m[1]+"/"+m[2]); };
      td.appendChild(b);
    });
  };

  /* ---------- 연결 ---------- */
  var _rn=renderNav; renderNav=function(){ V64.ensureNav(); V64.ensureView(); _rn.apply(this,arguments); setTimeout(V64.badge,0); };
  var _render=render;
  render=function(){ _render.apply(this,arguments); if(ui.view==="ask") V64.render(); V64.badge();
    if(ui.view==="course"){ if(V64.M==null) V64.load().then(function(){ setTimeout(V64.decorateV58,300); }); else setTimeout(V64.decorateV58,300); setTimeout(V64.decorateV58,1500); } };
  if(ATOM_HOSTED) V64.load().then(V64.badge);

  var css=document.createElement("style"); css.id="v64css";
  css.textContent=[
    ".v64-dot{position:absolute;top:4px;right:6px;min-width:18px;height:18px;border-radius:9px;background:#C7261B;color:#fff;font-size:11px;font-weight:800;font-style:normal;display:flex;align-items:center;justify-content:center;padding:0 5px}",
    "#rail .navb,#tabbar .tabb{position:relative}",
    ".v64-q .card-b{padding:14px 16px}.v64-q.done{opacity:.75}",
    ".v64-h{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:6px}",
    ".v64-t{font-size:16px;font-weight:800;line-height:1.5}.v64-ctx{font-size:13.5px;color:var(--ink-2);margin-top:4px;line-height:1.55}",
    ".v64-att{margin:10px 0 0}.v64-att img{max-width:100%;border-radius:10px;border:1px solid var(--line)}.v64-att audio{width:100%}.v64-att video{width:100%;max-height:360px;border-radius:10px;background:#000}",
    ".v64-att figcaption{font-size:12.5px;color:var(--ink-3);margin-top:4px}.v64-att q{display:block;margin-top:4px;color:var(--ink);font-size:13.5px}",
    ".v64-quote{margin:10px 0 0;padding:8px 12px;border-left:3px solid var(--line);background:var(--surface-2);border-radius:8px;font-size:13.5px}.v64-quote cite{display:block;font-size:11.5px;color:var(--ink-3);font-style:normal;margin-top:4px}",
    ".v64-opts{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.v64-opts .btn{min-height:46px;padding:0 18px}",
    ".v64-mrow{display:flex;gap:8px;margin-top:8px;align-items:stretch}.v64-note{flex:1;min-height:44px}.v64-send{min-width:84px}",
    ".v64-ans{margin-top:10px;font-size:14px}",
    ".v64-done{margin:12px 0 24px}.v64-done summary{cursor:pointer;font-weight:700;min-height:44px;display:flex;align-items:center}",
    ".v64-play{margin-left:6px;min-height:30px;vertical-align:middle}",
    ".v64-ov{position:fixed;inset:0;z-index:300;background:rgba(10,14,24,.6);display:flex;align-items:center;justify-content:center;padding:16px}",
    ".v64-pl{width:min(900px,100%);max-height:100%;overflow:auto;background:var(--surface);border-radius:16px;padding:12px}",
    ".v64-plh{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}",
    ".v64-plv video{width:100%;max-height:60vh;background:#000;border-radius:10px}.v64-plv audio{width:100%}.v64-plv .v60-file{margin-top:6px}",
    ".v64-pll{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.v64-pi{border:1.5px solid var(--line);background:var(--surface);border-radius:10px;padding:6px 12px;font:inherit;font-size:13px;min-height:40px;cursor:pointer}.v64-pi.on{border-color:var(--ac,#4F9A35);font-weight:800}.v64-pi small{margin-left:6px;color:var(--ink-3)}"
  ].join("\n");
  document.head.appendChild(css);
})();
