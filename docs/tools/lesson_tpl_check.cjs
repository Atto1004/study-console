/* 수업 노트 템플릿 검사(jsdom): 문제 카드 채점 범위 · mc-slides-last · 완료 문구 (오타 RED 2026-09-26 재발 방지)
   사용: node docs/tools/lesson_tpl_check.cjs [notes/lessons/phys2/2026-09-04.html] */
const fs=require("fs");const {JSDOM,VirtualConsole}=require("jsdom");
const ROOT="C:/Users/user/Desktop/아톰OS/기술실/study-console";
const rel=process.argv[2]||"notes/lessons/phys2/2026-09-04.html";
const html=fs.readFileSync(ROOT+"/"+rel,"utf8").replace(/<script src="https:\/\/cdn[^"]*"[^>]*><\/script>/g,"");
const id=/const LESSON_ID="([^"]+)"/.exec(html)[1], K="mc-lesson-"+id;
const vc=new VirtualConsole();const errs=[];vc.on("jsdomError",e=>errs.push(e.message));
const URL="https://atto1004.github.io/study-console/"+rel;
function page(pre){ return new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,virtualConsole:vc,url:URL,beforeParse(w){
  w.renderMathInElement=function(){}; w.IntersectionObserver=class{constructor(){} observe(){} disconnect(){} unobserve(){}}; w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=function(){}; w.confirm=()=>true; if(pre) pre(w); }}); }
let fail=0;const ok=(c,m)=>{console.log((c?"OK  ":"FAIL ")+m);if(!c)fail++;};
const p1=page();
setTimeout(()=>{const w=p1.window,d=w.document;
  const sids=[...d.querySelectorAll("section.s[data-id]")].map(s=>s.dataset.id), qs=[...d.querySelectorAll("#qlist .q")].map(q=>q.dataset.q);
  ok(sids.length>=4&&qs.length>=6,"섹션 "+sids.length+" · 문제 "+qs.length);
  const mc=qs.filter(q=>d.querySelector('#qlist .q[data-q="'+q+'"] .choice'));
  ok(mc.length>=2,"객관식 "+mc.length+"개");
  const a=mc[0], b=mc[1];
  const okIdx=[...d.querySelectorAll('#qlist .q[data-q="'+a+'"] .choice')].findIndex(x=>x.textContent.trim()!==""); // 아무 보기
  d.querySelector('#qlist .q[data-q="'+a+'"] .choice[data-ci="0"]').click();
  let st=JSON.parse(w.localStorage.getItem(K));
  ok(Object.keys(st.done).join()===a,a+" 보기1 클릭 → "+a+"만 done ("+JSON.stringify(st.done)+")");
  ok(typeof st.correct[a]==="boolean",a+" 정오 기록");
  d.querySelector('#qlist .q[data-q="'+b+'"] .choice[data-ci="1"]').click();
  st=JSON.parse(w.localStorage.getItem(K));
  ok(Object.keys(st.done).sort().join()===[a,b].sort().join(),b+" 보기2 클릭 → "+a+"·"+b+"만 done");
  ok(!!d.querySelector('#qlist .q[data-q="'+b+'"].rev')&&!d.querySelector('#qlist .q[data-q="'+qs[qs.length-1]+'"].rev'),b+"만 공개, 마지막 문제 미공개");
  const last=JSON.parse(w.localStorage.getItem("mc-slides-last"));
  ok(last&&last.deck===id&&last.idx===0&&last.n===sids.length&&last.qDone===2&&last.qN===qs.length&&last.href===URL,"mc-slides-last: idx 0 · n "+sids.length+" · qDone 2 · href 그대로");
  d.querySelector('#qlist .q[data-q="'+b+'"] [data-retry]').click(); st=JSON.parse(w.localStorage.getItem(K));
  ok(!st.done[b]&&!(b in st.correct),b+" 다시 풀기 → 기록 해제");
  /* 전부 읽음 + 정답 60% 이상 → 따라감 문구 · idx = n-1 */
  const rd={}; sids.forEach(s=>rd[s]=true); const dn={},co={}; qs.forEach((q,i)=>{dn[q]=true;co[q]=i<Math.ceil(qs.length*.6);});
  const p2=page(w2=>w2.localStorage.setItem(K,JSON.stringify({read:rd,done:dn,correct:co,answer:{}})));
  setTimeout(()=>{const d2=p2.window.document, t=d2.querySelector("#done").textContent, l2=JSON.parse(p2.window.localStorage.getItem("mc-slides-last"));
    ok(new RegExp("정답 "+Math.ceil(qs.length*.6)+"/"+qs.length).test(t)&&/따라감으로 표시됩니다/.test(t)&&!/다시 풀어/.test(t),"완료 문구(60% 정답): "+t);
    ok(l2.idx===sids.length-1&&l2.n===sids.length,"전부 읽음 → idx n-1 ("+l2.idx+"/"+l2.n+")");
    const co3={}; qs.forEach((q,i)=>{co3[q]=i<Math.ceil(qs.length*.6)-1;});
    const p3=page(w3=>w3.localStorage.setItem(K,JSON.stringify({read:rd,done:dn,correct:co3,answer:{}})));
    setTimeout(()=>{const t3=p3.window.document.querySelector("#done").textContent;
      ok(/다시 풀어 \d+개 이상/.test(t3),"미달 문구: "+t3);
      console.log(errs.length?"jsdom errors: "+errs.slice(0,3).join(" | "):"jsdom errors 0"); console.log(fail?"FAIL "+fail:"ALL OK"); process.exit(fail?1:0); },250);
  },250);
},300);
