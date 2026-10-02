/* ============================================================
   V67 LAYER — 교실 하단 질문창 ↔ 스앵님 답 (대표님 2026-10-02 「질문할게요 버튼 말고 하단 채팅창, 스앵님이 그 자리에서 답 — 우측 새 창 X」) (BUILD 2026-10-02.127)
   교실 iframe 이 {type:"mc-ask-q",v:1,text} 를 보내면 V45(스앵님 study 대화, /api/send SSE)로 보내고, 흘러오는 답을 {type:"mc-answer",v:1,text,done} 로 교실에 돌려준다.
   오른쪽 질문 패널은 열지 않는다(기록은 V45 대화에 그대로 남음).
   ============================================================ */
(function(){
  if(window.V67) return;
  var V67=window.V67={relay:null};
  V67.post=function(m){ var fr=$("#ntvFrame"); if(!fr||!fr.contentWindow) return; try{ fr.contentWindow.postMessage(Object.assign({type:"mc-answer",v:1},m),location.origin); }catch(e){} };
  V67.lastAnswer=function(){ var l=(window.V45&&V45.live)||[]; for(var i=l.length-1;i>=0;i--){ if(l[i].role!=="user") return String(l[i].text||""); } return ""; };
  V67.ask=function(text){
    text=String(text||"").trim().slice(0,600); if(!text) return;
    if(!window.ATOM_HOSTED||!window.V45){ V67.post({error:"atom 안에서 열어야 스앵님이 답할 수 있어요.",done:1}); return; }
    if(V45.req){ V67.post({error:"앞 질문에 답하는 중이에요. 끝나면 다시 물어봐 주세요.",done:1}); return; }
    var go=function(){ V67.relay=true; try{ if(V45.ensure) V45.ensure(); }catch(e){} var p=V45.send(text); if(!p) { V67.relay=null; V67.post({error:"보내지 못했어요. 잠시 뒤 다시 해 주세요.",done:1}); } };
    if(V45.groupId) go(); else V45.findGroup().then(go).catch(function(err){ V67.post({error:(err&&err.kind==="unauth")?"atom 로그인이 필요해요.":"스앵님 대화를 찾지 못했어요.",done:1}); });
  };
  V67.hook=function(){
    if(!window.V45||V45._v67) return; V45._v67=true;
    var _rm=V45.renderMsgs; V45.renderMsgs=function(){ var r=_rm.apply(this,arguments); if(V67.relay){ var t=V67.lastAnswer(); if(t) V67.post({text:t}); } return r; };
    var _fin=V45.finish; V45.finish=function(how,status){ var t=V67.lastAnswer(), was=V67.relay; V67.relay=null; var r=_fin.apply(this,arguments);
      if(was){ var msg={done:1,text:t}; if(how==="unauth") msg.error="atom 로그인이 필요해요."; else if(how==="locked") msg.error="스앵님이 다른 질문에 답하는 중이에요."; else if(how!=="eof"&&!t) msg.error="답을 받지 못했어요."; V67.post(msg); }
      return r; };
  };
  window.addEventListener("message",function(e){
    try{ if(e.origin!==location.origin) return; var fr=$("#ntvFrame"); if(!fr||e.source!==fr.contentWindow) return; var d=e.data; if(!d||d.v!==1||d.type!=="mc-ask-q") return;
      V67.hook(); V67.ask(d.text); }catch(err){}
  });
})();
