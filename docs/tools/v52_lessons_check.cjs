/* V52 검사: 수업 노트가 있는 회차는 노트로 판정·연결 */
const fs=require("fs"),path=require("path");const {JSDOM,VirtualConsole}=require("jsdom");
const ROOT="C:/Users/user/Desktop/아톰OS/기술실/study-console";const errs=[];const vc=new VirtualConsole();vc.on("jsdomError",e=>errs.push(e.message));
const d=new JSDOM(fs.readFileSync(ROOT+"/index.html","utf8"),{runScripts:"dangerously",pretendToBeVisual:true,virtualConsole:vc,url:"http://localhost/study/index.html",beforeParse(w){
 w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
 w.fetch=(u)=>{const p=path.join(ROOT,String(u).replace(/^\.\//,"").split("?")[0]);if(fs.existsSync(p))return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(JSON.parse(fs.readFileSync(p,"utf8")))});return Promise.resolve({ok:false,status:404,json:()=>Promise.reject(new Error("404"))});};}});
let fail=0;const ok=(c,m)=>{console.log((c?"OK  ":"FAIL ")+m);if(!c)fail++;};
const L=JSSON=JSON.parse(fs.readFileSync(ROOT+"/knowledge/lessons.json","utf8")).courses["일반물리학2"];
setTimeout(()=>{const w=d.window;
 // 9/4 노트: 섹션 전부 읽음 + 문제 전부 정답 → 따라감. 9/9: 섹션 1개만 읽음 → 진행 중
 const l4=L["2026-09-04"], l9=L["2026-09-09"];const rd={};l4.sids.forEach(s=>rd[s]=true);const dn={},co={};l4.qids.forEach(q=>{dn[q]=true;co[q]=true;});
 w.localStorage.setItem("mc-lesson-"+l4.id,JSON.stringify({read:rd,done:dn,correct:co}));
 w.localStorage.setItem("mc-lesson-"+l9.id,JSON.stringify({read:{[l9.sids[0]]:true},done:{},correct:{}}));
 w.go("study");
 setTimeout(()=>{const doc=w.document;ok(!!w.V52&&!!w.V52.L,"lessons.json 로드");
  const items=w.V50.items();const ph=items.find(it=>it.c.name==="일반물리학2");const by=dt=>ph.past.find(x=>x.date===dt);
  console.log("   일물2:",ph.past.map(x=>x.date.slice(5)+":"+x.st).join(" "));
  ok(by("2026-09-04").st==="done","9/4 = 따라감 (노트 전부 읽음+정답)");
  ok(by("2026-09-09").st==="part","9/9 = 진행 중 (섹션 1개 읽음)");
  ok(by("2026-09-11").st==="todo"&&by("2026-09-11").parts[0].lesson,"9/11 = 밀림, 판정 근거는 수업 노트");
  ok(by("2026-09-16").parts[0].lesson&&by("2026-09-18").parts[0].lesson&&by("2026-09-23").parts[0].lesson,"9/16·18·23 노트 연결");
  const row=[...doc.querySelectorAll("#v50Card .v50-row")].find(r=>/일반물리학2/.test(r.textContent));
  const b=row.querySelector(".v50-tgt [data-v50open]");ok(b&&/notes\/lessons\/phys2\/2026-09-09\.html#resume$/.test(b.dataset.v50open),"다음 따라갈 회차 버튼 → 9/9 수업 노트: "+(b&&b.dataset.v50open));
  ok(/약 \d+분/.test(row.querySelector(".v50-tgt").textContent),"읽는 시간 표시");
  const c=ph.c;const df=w.V38.deckFor(c,null,"2026-09-16");ok(df&&/lessons\/phys2\/2026-09-16\.html#resume$/.test(df.url),"회차 표 [학습하기] → 수업 노트: "+(df&&df.url));
  const notes=w.NOTES.filter(n=>/^수업 노트/.test(n.title)&&n.course==="일반물리학2");ok(notes.length===6,"NOTES 등록 6건: "+notes.length);
  // 정역학은 노트 없음 → 덱 파트 그대로
  const st=items.find(it=>it.c.name==="정역학");ok(st.past.some(x=>x.parts.length&&!x.parts[0].lesson),"노트 없는 과목은 덱 파트 유지");
  row.querySelector("[data-v50tg]").click();const s4=[...doc.querySelectorAll("#v50Card .v50-s")].find(el=>/9\/4/.test(el.querySelector("b").textContent));
  ok(s4&&/섹션 6\/6 읽음/.test(s4.textContent),"회차 줄에 「섹션 n/m 읽음」: "+(s4&&s4.querySelector(".v50-parts").textContent.trim().slice(0,60)));
  console.log("errs",errs.length,errs.slice(0,3));process.exit(fail?1:0)},1000)},1500);
