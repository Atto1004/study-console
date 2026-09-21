# -*- coding: utf-8 -*-
"""덱 템플릿 v5b (아토 2026-09-21 "학습하면서 아톰·오타에게 질문", 브리프 v50 r3 §2·§6):
  앱(부모 창)에 현재 장 문맥을 postMessage 로 보낸다. 앱이 {type:"mc-ctx?",gen} 을 보내면 gen 을 저장하고 즉시 응답,
  이후 render() 마다 {type:"mc-slide",v:1,gen,deck,...} 전송. #check(빌드 검사)·gen 없음·최상위 창이면 안 보냄.
템플릿 + 빌드된 덱 5개 동일 치환. 멱등."""
import io, glob
ROOT = r"C:\Users\user\Desktop\아톰OS\기술실\study-console"
FILES = [ROOT + r"\docs\tools\slides_tpl.html", r"C:\Users\user\.claude\scratch\sc_test\slides_tpl.html"] + glob.glob(ROOT + r"\notes\*slides*.html")

BLOCK = r'''
/* V5B-CTX: 학습 질문 패널용 문맥 (아토 2026-09-21). 앱이 gen 을 주기 전엔 보내지 않는다 — 이전 창의 늦은 메시지를 앱이 gen 으로 걸러낸다 */
let CTX_GEN=null;
const ctxPlain=(h,n)=>{ const t=String(h||"").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim(); return t.length>n?t.slice(0,n)+"…(잘림)":t; };
function postCtx(){
  try{
    if(location.hash==="#check"||!CTX_GEN||window.parent===window) return;
    const s=SLIDES[Math.max(0,Math.min(ST.idx,SLIDES.length-1))]; if(!s) return;
    const p=s.part?PARTS.find(x=>x.n===s.part):null; const li=lastInfo()||{};
    const msg={type:"mc-slide",v:1,gen:CTX_GEN,deck:DECK_ID,title:String(document.title).slice(0,80),sid:s.id,stype:s.type,part:s.part||null,
      partTitle:p?String(p.title).replace(/[\s★]+$/,"").slice(0,60):"",label:String(li.where||"").slice(0,80),q:null};
    if(s.type==="q"){
      const rev=!!ST.revealed[s.id], mc=Array.isArray(s.choices)&&s.choices.length>0, my=(ST.answer||{})[s.id];
      msg.q={qn:String(s.qn||"").slice(0,80),kind:String(s.kind||"").slice(0,10),text:ctxPlain(s.html,600),
        choices:mc?s.choices.slice(0,6).map(c=>ctxPlain(c.html,120)):[],
        my: my==null||my===""?null:(mc?(s.choices[+my]?ctxPlain(s.choices[+my].html,120):null):String(my).slice(0,200)),
        revealed:rev, correct: rev&&typeof ST.correct[s.id]==="boolean"?ST.correct[s.id]:null,
        answer: rev&&mc?(s.choices.map((c,i)=>c.ok?i+1:0).filter(Boolean).join(",")||null):null};
    } else if(s.type==="concept"||s.type==="mu"){ msg.q={qn:String(s.title||"").slice(0,80),kind:s.type==="mu"?"암기·이해":"개념",text:ctxPlain(s.type==="mu"?[].concat(s.mem||[],s.und||[]).join(" · "):s.html,600),choices:[],my:null,revealed:true,correct:null,answer:null}; }
    window.parent.postMessage(msg, location.origin);
  }catch(e){}
}
window.addEventListener("message",e=>{ if(e.origin!==location.origin||e.source!==window.parent) return; const d=e.data; if(d&&d.type==="mc-ctx?"&&typeof d.gen==="string"&&d.gen.length<64){ CTX_GEN=d.gen; postCtx(); } });
const _renderV5b=render; render=function(){ _renderV5b(); postCtx(); };
'''

def patch(p):
    s = io.open(p, encoding="utf-8").read()
    if "V5B-CTX" in s: print("skip", p[-40:]); return
    anchor = "function boot(){"
    assert s.count(anchor) == 1, p
    s = s.replace(anchor, BLOCK.lstrip("\n") + anchor, 1)
    io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p[-40:])

for f in FILES: patch(f)
