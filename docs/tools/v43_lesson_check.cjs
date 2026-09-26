/* V43×V52 검사: 「이어서 학습하기」가 수업 노트(중첩 경로)를 과목에 연결하고 「섹션 n/m」으로 표시하는지 (오타 RED 2026-09-26) */
const fs=require("fs"),path=require("path");const {JSDOM,VirtualConsole}=require("jsdom");
const ROOT="C:/Users/user/Desktop/아톰OS/기술실/study-console";const errs=[];const vc=new VirtualConsole();vc.on("jsdomError",e=>errs.push(e.message));
const L=JSON.parse(fs.readFileSync(ROOT+"/knowledge/lessons.json","utf8")).courses["일반물리학2"]["2026-09-04"];
const d=new JSDOM(fs.readFileSync(ROOT+"/index.html","utf8"),{runScripts:"dangerously",pretendToBeVisual:true,virtualConsole:vc,url:"http://localhost/study/index.html",beforeParse(w){
 w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
 w.fetch=(u)=>{const p=path.join(ROOT,String(u).replace(/^\.\//,"").split("?")[0]);if(fs.existsSync(p))return Promise.resolve({ok:true,status:200,json:()=>Promise.resolve(JSON.parse(fs.readFileSync(p,"utf8")))});return Promise.resolve({ok:false,status:404,json:()=>Promise.reject(new Error("404"))});};
 const rd={s1:true,s2:true,s3:true}; w.localStorage.setItem("mc-lesson-"+L.id,JSON.stringify({read:rd,done:{q1:true},correct:{q1:true},answer:{}}));
 w.localStorage.setItem("mc-slides-last",JSON.stringify({deck:L.id,title:"일반물리학2 · 9/4 전하와 전기장 서론",href:"http://localhost/study/"+L.file,idx:2,n:6,sid:"s4",part:null,partTitle:"",where:"읽는 중 · 4. 쿨롱 법칙",qDone:1,qN:6,ts:Date.now()})); }});
let fail=0;const ok=(c,m)=>{console.log((c?"OK  ":"FAIL ")+m);if(!c)fail++;};
setTimeout(()=>{const w=d.window;
 ok(!!w.V43&&!!w.V52&&w.V43._v52===true,"V43·V52 존재, V43 래핑됨");
 ok(!!w.V52.L,"lessons.json 로드");
 const rec=w.V43.last(); ok(!!rec&&rec.deck===L.id,"V43.last 수업 노트 레코드");
 ok(w.V43.file(rec)===L.file,"V43.file 중첩 경로 → "+w.V43.file(rec));
 ok(w.V43.courseName(rec)==="일반물리학2","V43.courseName → "+w.V43.courseName(rec));
 const h=w.V43.html(rec,true);
 ok(/섹션 3\/6/.test(h)&&!/\d+\/\d+장/.test(h),"카드에 「섹션 3/6」 (장 표기 없음)");
 ok(/일반물리학2/.test(h)&&/문제 1\/6/.test(h),"과목 칩 + 문제 1/6");
 ok(/이어서 학습하기<\/button>/.test(h)&&!/끝까지 봤음/.test(h),"버튼 「이어서 학습하기」, 미완");
 /* 일반 덱은 전과 같이 */
 const rec2={deck:"calc2-vectors",title:"t",href:"http://localhost/study/notes/calc2-vectors-slides.html",idx:2,n:10,sid:"",part:null,partTitle:"",where:"",qDone:0,qN:0,ts:Date.now()};
 ok(w.V43.file(rec2)==="notes/calc2-vectors-slides.html","일반 덱 경로 그대로");
 ok(/3\/10장/.test(w.V43.html(rec2,false)),"일반 덱 「3/10장」 유지");
 /* 회차 표 칸(V37): 정리.md 없는 9/16 정역학 → 「수업 노트 0/5 읽음」, 정리 있는 9/7 → 「섹션 n/5 · 수업 노트 …」 */
 try{ const c=w.courses().find(x=>x.name==="정역학"); const split=!!(w.V36&&w.V36.split(c));
   const h16=w.V37.cellHTML(c,w.V37.cell(c,{date:"2026-09-16",week:3},split)); ok(/수업 노트 0\/5 읽음/.test(h16)&&!/정리 없음/.test(h16),"V37 9/16 칸: 정리 없음 → 수업 노트 0/5 읽음");
   const h07=w.V37.cellHTML(c,w.V37.cell(c,{date:"2026-09-07",week:2},split)); ok(/수업 노트 0\/6 읽음/.test(h07)&&/학습하기/.test(h07),"V37 9/7 칸: 수업 노트 0/6 + 학습하기 버튼");
   const h02=w.V37.cellHTML(c,w.V37.cell(c,{date:"2026-09-02",week:1},split)); ok(!/수업 노트/.test(h02),"V37 9/2 칸(노트 없음): 그대로");
 }catch(e){ ok(false,"V37 칸 검사 예외 "+e.message); }
 /* 오늘 탭에 카드 */
 try{ w.ui.view="today"; w.renderToday(); }catch(e){ console.log("renderToday err",e.message); }
 setTimeout(()=>{ const c=w.document.querySelector("#v43Today"); ok(!!c&&/섹션 3\/6/.test(c.innerHTML),"오늘 탭 이어서 카드에 섹션 3/6");
   console.log(errs.length?"jsdom errors: "+errs.slice(0,3).join(" | "):"jsdom errors 0"); console.log(fail?"FAIL "+fail:"ALL OK"); process.exit(fail?1:0); },400);
},1500);
