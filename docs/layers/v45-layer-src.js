/* ============================================================
   V45 LAYER — 학습 중 질문 패널: 아톰·오타 동시 호출 (아토 2026-09-21 "학습할 때 오타랑 아톰 같이 불러와서 학습하면서 질문", 브리프 docs/briefs/v50-study-chat-brief-r3.md, 오타 4차 GREEN)
   - 덱/노트 뷰어(#ntv) 헤더 [질문] → 오른쪽 열(≥861px) / 아래 시트(폰). 질문은 atom 그룹 채팅(kind "group": 아톰 답 → 오타 검증 → …)으로 간다.
   - 서버 수정 없음(다른 세션이 server.py 작업 중). 쓰는 API: GET /api/conversations(그룹 id) · GET /api/conversations/<id>(기록) · POST /api/send(SSE) · EventSource /api/watch(재조회 트리거만).
   - 문맥: 덱(템플릿 v5b)이 postMessage {type:"mc-slide",v:1,gen,deck,...}. 앱은 openNote 마다 gen 발급 → iframe load 때 {type:"mc-ctx?",gen} 요청. origin·source·type·v·gen·deck 전부 맞아야 채택.
   - 상태: idle → sending → running(turn) → synced(기록 동기화됨 · 완료 미확정) / unauth / locked / http / dropped. 입력 잠금 해제 = 스트림 EOF. 완료는 주장하지 않는다(서버에 flow_end 없음 — .51).
   - 실시간 말풍선은 내 스트림에서만(provisional). EOF·watch(user/done) → 기록 재조회 → 서버 메시지 id 로 교체·병합(중복 없음).
   ============================================================ */
(function(){
  if(window.V45) return;
  var V45=window.V45={};
  V45.LIM={title:80,partTitle:60,label:80,qn:80,text:600,choice:120,choices:6,my:200,block:1500,answerNote:1500};
  V45.mode="study";   /* "study" = 김주영 스앵님 전용 대화(kind study, 아토 2026-09-21) · "group" = 서버가 아직 study 대화를 모를 때의 임시 경로(아톰·오타) */
  V45.gen=null; V45.seq=0; V45.expectDeck=null; V45.ctx=null; V45.groupId=null; V45.msgs=[]; V45.live=[]; V45.req=null; V45.state="idle"; V45.open=false; V45.draft="";
  try{ V45.open=localStorage.getItem("mc-qa-open")==="1"; }catch(e){}
  var hosted=function(){ return !!window.ATOM_HOSTED; };

  /* ---------- 문맥 ---------- */
  V45.deckOf=function(file){ var m=/notes\/([\w-]+)-slides\.html/.exec(String(file||"")); return m?m[1]:null; };
  V45.acceptCtx=function(e){
    try{
      if(!e||e.origin!==location.origin) return false;
      var fr=$("#ntvFrame"); if(!fr||e.source!==fr.contentWindow) return false;
      var d=e.data; if(!d||typeof d!=="object"||d.type!=="mc-slide"||d.v!==1) return false;
      if(typeof d.gen!=="string"||d.gen!==V45.gen) return false;
      if(typeof d.deck!=="string"||!V45.expectDeck||d.deck!==V45.expectDeck) return false;
      var L=V45.LIM, cut=function(v,n){ v=(v==null?"":String(v)); return v.length>n?v.slice(0,n)+"…":v; };
      var c={deck:d.deck,title:cut(d.title,L.title),sid:cut(d.sid,40),stype:cut(d.stype,12),part:(typeof d.part==="number"?d.part:null),partTitle:cut(d.partTitle,L.partTitle),label:cut(d.label,L.label),q:null};
      if(d.q&&typeof d.q==="object"){
        var q=d.q; c.q={qn:cut(q.qn,L.qn),kind:cut(q.kind,12),text:cut(q.text,L.text),choices:Array.isArray(q.choices)?q.choices.slice(0,L.choices).map(function(x){return cut(x,L.choice);}):[],
          my:(q.my==null?null:cut(q.my,L.my)),revealed:q.revealed===true,correct:(typeof q.correct==="boolean"?q.correct:null),answer:(q.answer==null?null:cut(q.answer,40))};
      }
      V45.ctx=c; return true;
    }catch(e2){ return false; }
  };
  window.addEventListener("message",function(e){ if(V45.acceptCtx(e)) V45.renderChip(); });
  V45.askCtx=function(){ try{ var fr=$("#ntvFrame"); if(fr&&fr.contentWindow&&V45.gen) fr.contentWindow.postMessage({type:"mc-ctx?",gen:V45.gen},location.origin); }catch(e){} };

  V45.ctxBlock=function(){
    var c=V45.ctx; if(!c) return "";
    var lines=["덱: "+c.title+(c.part?" · 파트 "+c.part+(c.partTitle?" "+c.partTitle:""):"")+(c.label?" › "+c.label:"")];
    if(c.q){
      lines.push((c.q.kind?c.q.kind+" ":"")+"문제 "+c.q.qn+": "+c.q.text);
      if(c.q.choices.length) lines.push("보기: "+c.q.choices.map(function(x,i){return "("+(i+1)+") "+x;}).join("  "));
      if(!c.q.revealed) lines.push("내 답: (아직 안 풀었음)");
      else if(c.q.my==null) lines.push("내 답: (미응답)");
      else lines.push("내 답: "+c.q.my+(c.q.correct===true?" → 정답":c.q.correct===false?" → 오답"+(c.q.answer?" (정답 "+c.q.answer+")":""):" → 판정 전"));
      if(/…\(잘림\)|…$/.test(c.q.text)) lines.push("(문제 본문이 잘렸고 수식·그림은 생략됐을 수 있음 — 추측하지 말 것)");
    }
    var block=lines.join("\n");
    if(block.length>V45.LIM.block){ var over=block.length-V45.LIM.block; if(c.q){ c=JSON.parse(JSON.stringify(c)); c.q.text=c.q.text.slice(0,Math.max(40,c.q.text.length-over-8))+"…(잘림)"; var save=V45.ctx; V45.ctx=c; block=V45.ctxBlock(); V45.ctx=save; } else block=block.slice(0,V45.LIM.block); }
    return block;
  };
  V45.prompt=function(q){
    var b=V45.ctxBlock();
    var head= V45.mode==="study"
      ? "[학습 질문]\n질문: "+q
      : "[학습 질문 — 설명·검증만, 후속 실행 요청 없음]\n아톰: 학생 눈높이로 1,500자 안에 설명. 오타: 아톰 설명의 수학·논리 정확성만 판정(코드·파일 대상 아님). 판정 형식은 AGENTS.md 그대로.\n질문: "+q;
    return head+(b?"\n--- 참고 문맥 (덱에서 자동 수집) ---\n"+b:"\n(문맥 없음 — 덱 미지원 화면)");
  };

  /* ---------- SSE 파서 (청크 경계·UTF-8 안전) ---------- */
  V45.parseSSE=function(){ var buf=""; return { push:function(chunk){ buf+=chunk; var out=[], i; while((i=buf.indexOf("\n\n"))>=0){ var frame=buf.slice(0,i); buf=buf.slice(i+2); var ev=(frame.match(/^event: ?(.*)$/m)||[])[1]||"message", dl=frame.split("\n").filter(function(l){return l.indexOf("data:")===0;}).map(function(l){return l.slice(5).replace(/^ /,"");}).join("\n"); var data=null; try{ data=dl?JSON.parse(dl):{}; }catch(e){ data={raw:dl}; } out.push({event:ev,data:data}); } return out; } }; };

  /* ---------- API ---------- */
  V45.api=function(url,opt){ return fetch(url,Object.assign({credentials:"same-origin"},opt||{})); };
  V45.findGroup=function(){
    return V45.api("/api/conversations").then(function(r){ if(r.status===401) throw {kind:"unauth"}; if(!r.ok) throw {kind:"http",status:r.status}; return r.json(); })
      .then(function(list){ var arr=Array.isArray(list)?list:(list&&list.conversations)||[]; var st=arr.filter(function(c){return c.kind==="study";})[0], g=arr.filter(function(c){return c.kind==="group";})[0];
        if(st){ V45.mode="study"; V45.groupId=st.id; } else if(g){ V45.mode="group"; V45.groupId=g.id; } else throw {kind:"nogroup"};
        V45.renderHead(); return V45.groupId; });
  };
  V45.loadHistory=function(){
    if(!V45.groupId) return Promise.resolve(false);
    return V45.api("/api/conversations/"+V45.groupId).then(function(r){ if(r.status===401) throw {kind:"unauth"}; if(!r.ok) throw {kind:"http",status:r.status}; return r.json(); })
      .then(function(j){ var ms=(j&&j.messages)||[]; V45.merge(ms); return true; });
  };
  V45.merge=function(serverMsgs){
    /* 서버 메시지(id 있음)가 원본. 이미 그린 id 는 건너뛰고, provisional(내 스트림) 말풍선은 같은 role+내용이 서버에 있으면 제거 */
    var have={}; V45.msgs.forEach(function(m){ have[m.id]=1; });
    serverMsgs.forEach(function(m){ if(!have[m.id]){ V45.msgs.push({id:m.id,role:m.role,text:m.content||"",ts:m.created}); have[m.id]=1; } });
    V45.msgs.sort(function(a,b){return a.id-b.id;});
    if(V45.msgs.length>60) V45.msgs=V45.msgs.slice(-60);
    V45.live=V45.live.filter(function(l){ return !serverMsgs.some(function(m){ var c=m.content||""; return m.role===l.role&&(c===l.text||(l.role==="user"&&c.indexOf("질문: "+l.text)>=0)); }); });
  };

  /* ---------- 요청 상태 기계 ---------- */
  V45.setState=function(s,extra){ V45.state=s; V45.stateExtra=extra||""; V45.renderStatus(); V45.renderInput(); };
  V45.send=function(text){
    if(!text||V45.req) return;
    if(!V45.groupId){ V45.setState("nogroup"); return; }
    var req={id:Date.now()+"-"+(++V45.seq),start:Date.now(),turn:"",cur:null}; V45.req=req; V45.live=[];
    var body={conv_id:V45.groupId,text:V45.prompt(text),client:"study"};
    V45.live.push({role:"user",text:text,provisional:true}); V45.renderMsgs();
    V45.setState("sending");
    var ctrl=(typeof AbortController!=="undefined")?new AbortController():null;
    return V45.api("/api/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),signal:ctrl&&ctrl.signal}).then(function(r){
      if(r.status===401) throw {kind:"unauth"};
      if(!r.ok) throw {kind:"http",status:r.status};
      var ct=(r.headers.get("content-type")||""); if(ct.indexOf("text/event-stream")<0) throw {kind:"http",status:r.status,note:"비SSE"};
      var reader=r.body.getReader(), dec=new TextDecoder("utf-8"), parser=V45.parseSSE(), locked=false;
      var handle=function(ev){
        var d=ev.data||{};
        if(ev.event==="error"){ locked=/답변 중/.test(d.message||""); V45.setState(locked?"locked":"error",d.message||""); return; }
        if(ev.event==="turn"){ req.turn=d.text||""; req.cur={role:d.role||"assistant",text:"",provisional:true}; V45.live.push(req.cur); V45.setState("running",req.turn); V45.renderMsgs(); return; }
        if(ev.event==="token"){ if(!req.cur){ req.cur={role:"assistant",text:"",provisional:true}; V45.live.push(req.cur); } req.cur.text+=String(d.text||""); V45.renderMsgs(true); return; }
        if(ev.event==="status"){ V45.stateExtra=String(d.text||""); V45.renderStatus(); return; }
        if(ev.event==="done"){ if(!d.role&&!d.text) return; /* error 뒤 빈 done */ var role=d.role||"assistant"; if(req.cur&&req.cur.role===role){ req.cur.text=String(d.text||req.cur.text); req.cur.done=true; } else { V45.live.push({role:role,text:String(d.text||""),provisional:true,done:true}); } req.cur=null; V45.renderMsgs(); return; }
      };
      var pump=function(){ return reader.read().then(function(x){ if(x.done){ return "eof"; } parser.push(dec.decode(x.value,{stream:true})).forEach(handle); return pump(); }); };
      return pump().then(function(){ if(locked){ V45.draftKeep=text; } V45.finish(locked?"locked":"eof"); },function(){ V45.finish("dropped"); });
    }).catch(function(err){ var k=(err&&err.kind)||"dropped"; if(k==="unauth"||k==="http"){ V45.live=V45.live.filter(function(l){return l.role!=="user";}); } V45.finish(k,err&&err.status); });
  };
  V45.finish=function(how,status){
    V45.req=null;
    var after=function(okSync){
      if(how==="eof") V45.setState(okSync?"synced":"unsynced");
      else if(how==="dropped") V45.setState("dropped");
      else if(how==="locked") V45.setState("locked");
      else if(how==="unauth") V45.setState("unauth");
      else if(how==="http") V45.setState("http",String(status||""));
      else V45.setState("error",String(status||""));
      V45.renderMsgs();
    };
    V45.loadHistory().then(function(){ after(true); },function(){ after(false); });
  };
  V45.elapsed=function(){ if(!V45.req) return ""; var s=Math.floor((Date.now()-V45.req.start)/1000); return s<60?s+"초":Math.floor(s/60)+"분 "+(s%60)+"초"; };

  /* ---------- watch: 재조회 트리거만 ---------- */
  V45.watch=function(){
    if(V45.es||!hosted()||typeof EventSource==="undefined") return;
    try{ V45.es=new EventSource("/api/watch"); }catch(e){ return; }
    var timer=null;
    V45.es.onmessage=function(e){ try{ var d=JSON.parse(e.data||"{}"); if(!V45.groupId||String(d.conv_id)!==String(V45.groupId)) return; if(d.type==="user"||d.type==="done"||d.type==="turn"){ if(V45.req&&d.client==="study") return; clearTimeout(timer); timer=setTimeout(function(){ V45.loadHistory().then(function(){ V45.renderMsgs(); },function(){}); },800); } }catch(e2){} };
  };

  /* ---------- 렌더 ---------- */
  var md=function(t){ var h=esc(t); h=h.replace(/```([\s\S]*?)```/g,function(_,c){return '<pre>'+c+'</pre>';}).replace(/`([^`\n]+)`/g,'<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>'); return h.split(/\n/).map(function(l){ return /^\s*[-•] /.test(l)?'<div class="v45-li">'+l.replace(/^\s*[-•] /,'')+'</div>':l; }).join("<br>").replace(/(<\/div>)<br>/g,'$1').replace(/<br>(<pre>)/g,'$1'); };
  V45.roleName={user:"아토",assistant:"아톰",otta:"오타"};
  V45.who=function(role){ return role==="assistant"&&V45.mode==="study"?"스앵님":V45.roleName[role]; };
  V45.renderHead=function(){ var t=$("#v45Panel .v45-ht b"), n=$("#v45Panel .v45-ht .v45-mut"); if(!t) return;
    if(V45.mode==="study"){ t.textContent="김주영 스앵님에게 질문"; n.textContent="학습앱 전용 AI · 아톰·오타와 다른 정체성"; }
    else { t.textContent="아톰 · 오타에게 질문"; n.textContent="스앵님 대화가 아직 없어 아톰·오타 그룹 채팅으로 갑니다(서버 갱신 전)"; } };
  /* 서버에 저장된 아토 메시지는 문맥 블록이 붙은 전체 프롬프트 → 질문 줄만 보이고 문맥은 접는다 */
  V45.userView=function(t){ if(t.indexOf("[학습 질문")!==0) return {q:t,ctx:""}; var m=/\n질문: ([\s\S]*?)(?:\n--- 참고 문맥[^\n]*\n([\s\S]*)|\n\(문맥 없음[^\n]*\)|$)/.exec(t); return m?{q:m[1].trim(),ctx:(m[2]||"").trim()}:{q:t,ctx:""}; };
  V45.renderChip=function(){ var el=$("#v45Chip"); if(!el) return; var c=V45.ctx;
    if(!V45.expectDeck) el.innerHTML='<span class="v45-mut">문맥 없음 · 덱 미지원 화면</span>';
    else if(!c) el.innerHTML='<span class="v45-mut">덱 문맥 기다리는 중…</span>';
    else el.innerHTML='<b>'+esc(c.title)+'</b>'+(c.part?' · 파트 '+c.part+(c.partTitle?' '+esc(c.partTitle):''):'')+(c.label?' › '+esc(c.label):'')+(c.q&&c.q.revealed&&c.q.correct!==null?' <span class="chip '+(c.q.correct?"ok":"crit")+'">'+(c.q.correct?"정답":"오답")+'</span>':''); };
  V45.renderMsgs=function(soft){
    var box=$("#v45Msgs"); if(!box) return;
    var all=V45.msgs.map(function(m){return m;}).concat(V45.live);
    var atBottom=box.scrollHeight-box.scrollTop-box.clientHeight<40;
    box.innerHTML=all.length?all.map(function(m){ var role=m.role==="user"?"user":m.role==="otta"?"otta":"assistant"; var long=role==="assistant"&&m.text.length>V45.LIM.answerNote;
      var body=m.text, ctxHtml=""; if(role==="user"){ var uv=V45.userView(m.text); body=uv.q; if(uv.ctx) ctxHtml='<details class="v45-det"><summary>문맥</summary>'+md(uv.ctx)+'</details>'; }
      return '<div class="v45-m '+role+(m.provisional?" prov":"")+'"><div class="v45-who">'+V45.who(role)+(m.provisional&&!m.done&&role!=="user"?' <i>…</i>':'')+'</div><div class="v45-b">'+md(body)+ctxHtml+'</div>'+(long?'<div class="v45-note">1,500자 이후는 오타 검증에 들어가지 않았습니다(서버 맥락 절단)</div>':'')+'</div>'; }).join("")
      :'<div class="v45-empty">'+(V45.mode==="study"?"덱을 보다가 막히면 스앵님에게 물어보세요. 결론 → 원리 → 확인 문제 순으로 답합니다.":"덱을 보다가 막히면 여기서 물어보세요. 아톰이 설명하고 오타가 검증합니다.")+'</div>';
    if(atBottom||!soft) box.scrollTop=box.scrollHeight;
  };
  V45.renderStatus=function(){ var el=$("#v45Status"); if(!el) return; var s=V45.state, x=V45.stateExtra||""; var t={idle:"",sending:"보내는 중…",running:(x||"답하는 중")+" · "+V45.elapsed(),synced:"기록 동기화됨 · 완료 미확정",unsynced:"기록 확인 안 됨 · 새로고침",dropped:"연결이 끊겼습니다 — 서버는 계속 답할 수 있습니다",locked:"다른 창에서 답변 중 — 초안은 남겨 두었습니다",unauth:"atom 로그인이 필요합니다",nogroup:"그룹 채팅을 찾지 못했습니다",http:"서버 오류 "+x,error:"오류 "+x}[s]||""; el.textContent=t; el.className="v45-status "+s;
    var rb=$("#v45Reload"); if(rb) rb.style.display=(s==="dropped"||s==="unsynced"||s==="synced")?"":"none"; };
  V45.renderInput=function(){ var ta=$("#v45In"), b=$("#v45Send"); if(!ta) return; var lock=!!V45.req||!hosted()||V45.state==="unauth"||V45.state==="nogroup"; ta.disabled=lock; b.disabled=lock; if(V45.draftKeep){ ta.value=V45.draftKeep; V45.draftKeep=""; } };
  V45.tick=function(){ if(V45.req&&V45.state==="running") V45.renderStatus(); };
  setInterval(V45.tick,1000);

  /* ---------- 패널 DOM ---------- */
  V45.ensure=function(){
    var v=$("#ntv"); if(!v||$("#v45Panel")) return;
    var h=$("#ntv .ntv-h"); var btn=document.createElement("button"); btn.className="btn xs v45-btn"; btn.id="v45Btn"; btn.textContent="질문"; btn.title="김주영 스앵님에게 질문"; btn.onclick=V45.toggle; h.appendChild(btn);
    var wrap=document.createElement("div"); wrap.id="v45Wrap"; var fr=$("#ntvFrame"); fr.parentNode.insertBefore(wrap,fr); wrap.appendChild(fr);
    var p=document.createElement("aside"); p.id="v45Panel"; p.setAttribute("aria-label","스앵님에게 질문");
    p.innerHTML='<div class="v45-h"><div class="v45-ht"><b>김주영 스앵님에게 질문</b><span class="v45-mut">학습앱 전용 AI · 아톰·오타와 다른 정체성</span></div><button class="btn xs" id="v45Close" aria-label="닫기">닫기</button></div>'+
      '<div class="v45-ctx"><label><input type="checkbox" id="v45Use" checked> 이 문제 문맥 붙이기</label><div id="v45Chip"></div></div>'+
      '<div id="v45Msgs" class="v45-msgs"></div>'+
      '<div id="v45Status" class="v45-status"></div>'+
      '<div class="v45-in"><textarea id="v45In" rows="2" placeholder="막히는 부분을 물어보세요 (Enter 전송 · Shift+Enter 줄바꿈)"></textarea><button class="btn a" id="v45Send">보내기</button><button class="btn xs" id="v45Reload" style="display:none">기록 새로고침</button></div>';
    wrap.appendChild(p);
    $("#v45Close").onclick=V45.toggle;
    $("#v45Send").onclick=V45.submit;
    $("#v45Reload").onclick=function(){ V45.loadHistory().then(function(){ V45.renderMsgs(); V45.setState("synced"); },function(){ V45.setState("unsynced"); }); };
    var ta=$("#v45In"); ta.onkeydown=function(e){ if(e.key==="Enter"&&!e.shiftKey){ if(e.isComposing||e.keyCode===229) return; e.preventDefault(); V45.submit(); } };
    ta.oninput=function(){ V45.draft=ta.value; };
    if(window.visualViewport){ window.visualViewport.addEventListener("resize",function(){ var pnl=$("#v45Panel"); if(pnl&&window.innerWidth<=860&&$("#ntv").classList.contains("v45-open")) pnl.style.maxHeight=Math.round(window.visualViewport.height*0.6)+"px"; }); }
  };
  V45.submit=function(){
    var ta=$("#v45In"); if(!ta) return; var t=ta.value.trim(); if(!t||V45.req) return;
    if(!hosted()){ toast("atom 안(/study/)에서만 질문할 수 있습니다"); return; }
    var use=$("#v45Use")&&$("#v45Use").checked; var saveCtx=V45.ctx; if(!use) V45.ctx=null;
    var p=V45.send(t); V45.ctx=saveCtx; V45.draft=""; ta.value="";
    return p;
  };
  V45.toggle=function(){
    V45.ensure(); var v=$("#ntv"); V45.open=!v.classList.contains("v45-open"); v.classList.toggle("v45-open",V45.open);
    try{ localStorage.setItem("mc-qa-open",V45.open?"1":"0"); }catch(e){}
    if(V45.open){ if(!hosted()){ toast("atom 안(/study/)에서만 질문할 수 있습니다 — 여기서는 미리보기"); V45.setState("idle"); V45.renderChip(); V45.renderMsgs(); return; }
      V45.askCtx(); V45.renderChip(); V45.renderMsgs();
      var ready=V45.groupId?Promise.resolve():V45.findGroup();
      ready.then(function(){ V45.watch(); return V45.loadHistory(); }).then(function(){ V45.renderMsgs(); if(!V45.req) V45.setState(V45.state==="idle"?"idle":V45.state); V45.renderInput(); })
        .catch(function(err){ V45.setState((err&&err.kind)||"http",err&&err.status); });
    }
  };

  /* ---------- openNote / closeNote 래핑: gen·expectDeck·ctx ---------- */
  var _openNote=openNote;
  openNote=function(file,title){
    _openNote(file,title); V45.ensure(); document.body.classList.add("ntv-on");
    V45.gen=Date.now()+"-"+(++V45.seq); V45.ctx=null; V45.expectDeck=V45.deckOf(file); V45.renderChip();
    var fr=$("#ntvFrame"); if(fr){ fr.onload=function(){ V45.askCtx(); }; }
    var v=$("#ntv"); if(V45.open){ v.classList.remove("v45-open"); V45.toggle(); } else v.classList.remove("v45-open");
    var b=$("#v45Btn"); if(b) b.classList.toggle("off",!hosted());
  };
  var _closeNote=closeNote;
  closeNote=function(){ _closeNote(); document.body.classList.remove("ntv-on"); V45.ctx=null; V45.expectDeck=null; V45.gen=null; V45.renderChip(); };

  var css=document.createElement("style"); css.id="v45css";
  css.textContent=[
    "#v45Wrap{flex:1 1 auto;min-height:0;display:flex;flex-direction:row}#v45Wrap iframe{flex:1 1 auto;min-width:0;height:auto}",
    "#v45Panel{display:none;flex:0 0 380px;width:380px;border-left:1px solid var(--line);background:var(--surface);flex-direction:column;min-height:0}",
    ".ntv.v45-open #v45Panel{display:flex}",
    ".v45-btn.off{opacity:.55}",
    "#v45Panel .v45-h{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line);flex:0 0 auto}.v45-ht{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px}#v45Panel .v45-h b{font-size:14px;line-height:18px;white-space:nowrap}#v45Panel .v45-h .v45-mut{font-size:11px;line-height:14px}#v45Panel .v45-h .btn{margin-left:auto;flex:0 0 auto}",
    ".v45-mut{font-size:12px;color:var(--ink-3)}",
    ".v45-ctx{padding:8px 12px;border-bottom:1px solid var(--line);font-size:12px;line-height:16px;flex:0 0 auto}.v45-ctx label{display:flex;gap:6px;align-items:center;color:var(--ink-2)}#v45Chip{margin-top:4px;color:var(--ink);overflow-wrap:anywhere}",
    ".v45-msgs{flex:1 1 auto;min-height:0;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:10px;background:var(--bg)}",
    ".v45-m{max-width:92%;display:flex;flex-direction:column;gap:3px}.v45-m.user{align-self:flex-end;align-items:flex-end}",
    ".v45-who{font-size:11px;color:var(--ink-3);display:flex;gap:4px;align-items:center}.v45-m.assistant .v45-who::before{content:'';width:7px;height:7px;border-radius:50%;background:var(--accent)}.v45-m.otta .v45-who::before{content:'';width:7px;height:7px;border-radius:50%;background:var(--ink-3)}",
    ".v45-b{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:8px 12px;font-size:14px;line-height:20px;overflow-wrap:anywhere}.v45-m.user .v45-b{background:var(--accent);color:#fff;border-color:transparent}",
    ".v45-m.prov .v45-b{opacity:.85}.v45-b pre{white-space:pre-wrap;font-size:12px;background:var(--surface-2);padding:6px 8px;border-radius:8px;margin:4px 0}.v45-b code{font-size:12px;background:var(--surface-2);padding:1px 4px;border-radius:4px}.v45-li{padding-left:12px;position:relative}.v45-li::before{content:'·';position:absolute;left:2px}",
    ".v45-det{font-size:11px;opacity:.85;margin-top:4px}.v45-det summary{cursor:pointer}",
    ".v45-note{font-size:11px;color:var(--warn)}.v45-empty{font-size:13px;color:var(--ink-3);padding:12px}",
    ".v45-status{font-size:12px;color:var(--ink-3);padding:4px 12px;min-height:16px;flex:0 0 auto}.v45-status.dropped,.v45-status.unauth,.v45-status.http,.v45-status.error,.v45-status.unsynced,.v45-status.locked{color:var(--crit)}",
    ".v45-in{display:flex;gap:6px;padding:8px 12px calc(8px + env(safe-area-inset-bottom));border-top:1px solid var(--line);flex:0 0 auto;align-items:flex-end;flex-wrap:wrap}.v45-in textarea{flex:1 1 200px;min-height:44px;max-height:120px;resize:vertical;border:1px solid var(--line);border-radius:10px;padding:10px 12px;font:inherit;font-size:14px;background:var(--surface);color:var(--ink)}.v45-in .btn.a{min-height:44px}",
    "#ntvOpen{display:none}",   /* 아토 2026-09-21: 새 탭/새 창 열기 불필요 */
    ".ntv .ntv-h{flex-wrap:nowrap}.ntv .ntv-h .tt{display:block;min-width:0;grid-template-columns:none}.ntv .ntv-h .btn{flex:0 0 auto;white-space:nowrap}body.ntv-on .tabbar{display:none}",   /* .tt 는 시간표 격자 클래스(min-width 520px)와 이름이 겹쳐 폰에서 헤더 버튼을 밀어냈다 */
    "@media(max-width:860px){#v45Wrap{flex-direction:column}#v45Panel{flex:0 0 auto;width:100%;max-height:60dvh;border-left:0;border-top:1px solid var(--line)}}"
  ].join("\n");
  document.head.appendChild(css);
})();
