/* V50 재검수 항목: 공유 파트 한 번 판정 · 오늘 회차(진행 중이어도 「오늘」) · 브리핑 집계 분리 */
const fs=require("fs"),path=require("path");const {JSDOM,VirtualConsole}=require("jsdom");
const ROOT="C:/Users/user/Desktop/아톰OS/기술실/study-console";const errs=[];const vc=new VirtualConsole();vc.on("jsdomError",e=>errs.push(e.message));
const d=new JSDOM(fs.readFileSync(ROOT+"/index.html","utf8"),{runScripts:"dangerously",pretendToBeVisual:true,virtualConsole:vc,url:"http://localhost/study/index.html",beforeParse(w){
 w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
 w.fetch=(u)=>{const p=path.join(ROOT,String(u).replace(/^\.\//,"").split("?")[0]);if(fs.existsSync(p))return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(JSON.parse(fs.readFileSync(p,"utf8")))});return Promise.resolve({ok:false,status:404,json:()=>Promise.reject(new Error("404"))});};}});
let fail=0;const ok=(c,m)=>{console.log((c?"OK  ":"FAIL ")+m);if(!c)fail++;};
const decks=JSON.parse(fs.readFileSync(ROOT+"/knowledge/decks.json","utf8")).decks;const P=(id,n)=>decks.find(x=>x.id===id).partList.find(p=>p.n===n);
setTimeout(()=>{const w=d.window;
 // 「오늘」을 9/23(수)로: 공수1·일물2·정역학 수업일. 정역학 파트5(9/16·21·23, 판정 9/23) 한 장만 읽음 → 9/23 = 오늘(진행 중이어도)
 w.today=()=>"2026-09-23";
 const s1=P("statics-mid",1), s5=P("statics-mid",5);const done={},correct={};s1.sids.forEach(s=>done[s]=true);s1.qids.forEach(q=>correct[q]=true);done[s5.sids[0]]=true;
 w.localStorage.setItem("mc-slides-statics-mid",JSON.stringify({idx:0,done,correct}));
 w.go("study");
 setTimeout(()=>{const doc=w.document;const items=w.V50.items();const st=items.find(it=>it.c.name==="정역학");const by=dt=>st.past.find(x=>x.date===dt);
  console.log("   정역학:",st.past.map(x=>x.date.slice(5)+":"+x.st).join(" "));
  ok(by("2026-09-07").st==="done","9/7 = 따라감 (파트1은 9/9에서 판정, 완료됨)");
  ok(by("2026-09-09").st==="done","9/9 = 따라감 (판정용 파트1 완료; 파트2는 9/14에서 판정)");
  ok(by("2026-09-14").st==="todo","9/14 = 밀림 (파트2 미착수)");
  ok(by("2026-09-16").st==="todo","9/16 = 밀림 (파트3·4 판정, 미착수)");
  ok(by("2026-09-21").st==="cont","9/21 = 이어짐 (파트5는 9/23에서 판정, 밀림 아님)");
  ok(by("2026-09-23").st==="today","9/23 = 오늘 수업 (한 장 읽어도 「오늘」): "+by("2026-09-23").st);
  ok(st.todo.length===2&&st.todayL.length===1,"정역학 밀림 2 · 오늘 1: "+st.todo.length+"/"+st.todayL.length);
  const top=doc.querySelector("#v50Card .v50-top").textContent;console.log("   상단:",top.slice(0,100));ok(/오늘 수업/.test(top),"상단에 오늘 수업 별도 표시");
  w.go("today");setTimeout(()=>{const s=doc.querySelector("#v50Step");console.log("   브리핑:",s&&s.textContent.trim().slice(0,110));
   ok(s&&/오늘 수업 \d+회차/.test(s.textContent)&&/밀린 회차 \d+개/.test(s.textContent),"브리핑 줄 밀림·오늘 분리");
   console.log("errs",errs.length,errs.slice(0,3));process.exit(fail?1:0)},400)},900)},1500);
