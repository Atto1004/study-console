/* V50 상태 판정 검사 (오타 v52 RED 3): 모든 파트 기준 충족 · 건너뜀 제외 · 문제 틀리면 미완 · 오늘 수업 분리 */
const fs=require("fs"),path=require("path");const {JSDOM,VirtualConsole}=require("jsdom");
const ROOT="C:/Users/user/Desktop/아톰OS/기술실/study-console";const errs=[];const vc=new VirtualConsole();vc.on("jsdomError",e=>errs.push(e.message));
const d=new JSDOM(fs.readFileSync(ROOT+"/index.html","utf8"),{runScripts:"dangerously",pretendToBeVisual:true,virtualConsole:vc,url:"http://localhost/study/index.html",beforeParse(w){
 w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
 w.fetch=(u)=>{/* 덱 논리 검사: 수업 노트(V52)는 없는 것으로 — lessons.json 404 */if(/lessons\.json/.test(String(u)))return Promise.resolve({ok:false,status:404,json:()=>Promise.reject(new Error("404"))});const p=path.join(ROOT,String(u).replace(/^\.\//,"").split("?")[0]);if(fs.existsSync(p))return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(JSON.parse(fs.readFileSync(p,"utf8")))});return Promise.resolve({ok:false,status:404,json:()=>Promise.reject(new Error("404"))});};}});
let fail=0;const ok=(c,m)=>{console.log((c?"OK  ":"FAIL ")+m);if(!c)fail++;};
const decks=JSON.parse(fs.readFileSync(ROOT+"/knowledge/decks.json","utf8")).decks;const D=id=>decks.find(x=>x.id===id);const P=(id,n)=>D(id).partList.find(p=>p.n===n);
setTimeout(()=>{const w=d.window;
 // 정역학: 파트1 전부 완료+정답 → 9/7 따라감. 파트2 전부 읽었지만 문제 전부 오답 → 9/9(파트1·2) = 진행 중(완료 아님), 9/14(파트2·3) = 진행 중
 const s1=P("statics-mid",1), s2=P("statics-mid",2);const done={},correct={};s1.sids.forEach(s=>done[s]=true);s1.qids.forEach(q=>correct[q]=true);s2.sids.forEach(s=>done[s]=true);s2.qids.forEach(q=>correct[q]=false);
 w.localStorage.setItem("mc-slides-statics-mid",JSON.stringify({idx:0,done,correct}));
 // 공수1: 파트1 전부 "건너뜀"(done+skip) → 9/2·9/4 는 밀림 그대로
 const e1=P("em1-mid",1);const ed={},sk={};e1.sids.forEach(s=>{ed[s]=true;sk[s]=true;});w.localStorage.setItem("mc-slides-em1-mid",JSON.stringify({idx:0,done:ed,correct:{},skip:sk}));
 // 미적2 벡터 덱 파트1(9/10·9/15 → 9/15 판정): 개념 다 읽고, 문제는 「문제만」 모드에서 전부 정답 → 9/15 따라감 (quiz 키 인정). (일물2는 수업 노트가 우선이라 덱으로 못 잰다)
 const p1=P("calc2-vectors",1);const pd={};p1.sids.filter(s=>p1.qids.indexOf(s)<0).forEach(s=>pd[s]=true);const qc={};p1.qids.forEach(q=>qc[q]=true);
 w.localStorage.setItem("mc-slides-calc2-vectors",JSON.stringify({idx:0,done:pd,correct:{}}));w.localStorage.setItem("mc-slides-calc2-vectors-quiz",JSON.stringify({idx:0,done:qc,correct:qc}));
 w.go("study");
 setTimeout(()=>{const doc=w.document;const items=w.V50.items();
  const st=items.find(it=>it.c.name==="정역학");const by=(it,date)=>it.past.find(x=>x.date===date);
  ok(by(st,"2026-09-07").st==="done","정역학 9/7 = 따라감 (파트1 완료+정답): "+by(st,"2026-09-07").st);
  ok(by(st,"2026-09-09").st==="done","정역학 9/9 = 따라감 (판정용 파트1 완료; 파트2는 9/14에서 판정): "+by(st,"2026-09-09").st);
  ok(by(st,"2026-09-14").st==="part","정역학 9/14 = 진행 중 (파트2 전부 읽었지만 문제 전부 오답): "+by(st,"2026-09-14").st);
  const em=items.find(it=>it.c.name==="공업수학1");ok(by(em,"2026-09-04").st==="todo","공수1 9/4 = 밀림 (전부 건너뜀은 완료 아님): "+by(em,"2026-09-04").st);
  const ca=items.find(it=>it.c.name==="미분적분학2");ok(by(ca,"2026-09-15").st==="done","미적2 9/15 = 따라감 (개념 읽음 + 문제만 정답): "+by(ca,"2026-09-15").st);
  ok(items.every(it=>it.todayL.every(x=>x.st==="today")&&it.todo.every(x=>x.st!=="today")),"오늘 수업은 밀림에 안 섞임");
  const top=doc.querySelector("#v50Card .v50-top").textContent;console.log("   상단:",top.slice(0,90));
  const row=[...doc.querySelectorAll("#v50Card .v50-row")].find(r=>/정역학/.test(r.textContent));row.querySelector("[data-v50tg]").click();
  const s909=[...doc.querySelectorAll("#v50Card .v50-s")].find(el=>/9\/9/.test(el.querySelector("b").textContent));console.log("   9/9 파트 줄:",s909&&s909.querySelector(".v50-parts").textContent.replace(/\s+/g," ").slice(0,160));
  ok(s909&&/공유/.test(s909.textContent),"공유 파트 표시");
  const s923=[...doc.querySelectorAll("#v50Card .v50-s")].find(el=>/9\/23/.test(el.querySelector("b").textContent));ok(s923&&/예상 진도/.test(s923.textContent),"정리 없는 회차에 「예상 진도」 표시");
  console.log("errs",errs.length,errs.slice(0,3));process.exit(fail?1:0)},900)},1500);
