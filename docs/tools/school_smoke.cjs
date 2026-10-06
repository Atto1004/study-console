const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const {JSDOM}=require(path.join(root,'.test-tools/node_modules/jsdom'));
const fixture=JSON.parse(fs.readFileSync(path.join(root,'.test-tools/school-fixture.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'school/index.html'),'utf8');
const source=fs.readFileSync(path.join(root,'school/school.js'),'utf8').replace(/^import[\s\S]*?from\s+["'][^"']+["'];\s*/,'');
new vm.Script(source);
let state={version:1,revision:0,plans:{},events:[],rules:{},progress:{},drafts:{},settings:{engine:'auto',voice:false}}, prerequisiteMode=false;
const errors=[];
const dom=new JSDOM(html,{url:'https://school.invalid/kingdom/study/school/index.html?test=1',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document;
w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
w.requestAnimationFrame=()=>{};
w.addEventListener('error',e=>errors.push(e.error||e.message));
w.fetch=async(url,options={})=>{
 const parsed=new URL(url,w.location.href);let body;
 if(parsed.pathname.endsWith('/catalog'))body=fixture.catalog;
 else if(parsed.pathname.endsWith('/state'))body=state;
 else if(parsed.pathname.endsWith('/capabilities'))body={testMode:true,engines:['auto','claude','codex'],voice:false};
 else if(parsed.pathname.endsWith('/lesson'))body=fixture.lessons[parsed.searchParams.get('id')];
 else if(parsed.pathname.endsWith('/event')){
  const event={...JSON.parse(options.body),at:Date.now()/1000};
  const prior=state.events.find(e=>e.id===event.id);
  if(!prior){state.events.push(event);state.revision++;}
  if(event.kind==='plan')state.plans[event.plan.course]=event.plan;
  if(event.kind==='position')state.progress[event.lesson]={index:event.index};
  body={event:prior||event,revision:state.revision,projection:{plans:state.plans,progress:state.progress}};
 }else if(parsed.pathname.endsWith('/coach')){
  const request=JSON.parse(options.body),lesson=fixture.lessons[request.lesson];
  const quiz=lesson.steps.findIndex(s=>s.kind==='quiz');
  const feedback={assessment:'misconception',misconception:'단위를 다시 설명해보세요.',studentQuote:request.question,notice:'AI 관찰',target:{lesson:lesson.id,index:quiz,label:'직접 확인 문제 풀기'}};
  if(prerequisiteMode) feedback.target={lesson:Object.keys(fixture.lessons).find(id=>id.startsWith('node:')&&id!==lesson.id),label:'선수 개념 보충'};
  body={answer:'다시 확인해볼게요.',engine:'fixture',feedback};
  state.events.push({...request,kind:'question',answer:body.answer,feedback,engine:body.engine,at:Date.now()/1000});
 }else throw new Error('예상하지 않은 요청 '+url);
 if(!body)throw new Error('없는 fixture '+url);
 return {ok:true,json:async()=>JSON.parse(JSON.stringify(body))};
};
w.eval(fs.readFileSync(path.join(root,'school/learning.js'),'utf8').replace(/^export /gm,''));
w.eval(source);
const settle=()=>new Promise(resolve=>setTimeout(resolve,10));
const byText=text=>[...d.querySelectorAll('button')].find(b=>b.textContent===text);
(async()=>{
 await settle();assert.equal(d.querySelector('#resume').disabled,false,d.querySelector('#status').textContent+' '+errors.map(String).join(' '));assert.equal(d.querySelectorAll('.door').length,7);
 d.querySelector('#consult').click();assert.equal(d.querySelector('#panel').open,true);
 d.querySelector('#panelBody form').dispatchEvent(new w.Event('submit',{cancelable:true}));await settle();
 for(let i=0;i<5&&byText('아직 모르겠어요');i++){byText('아직 모르겠어요').click();await settle();}
 assert.ok(byText('이 계획 적용하고 시작'));byText('이 계획 적용하고 시작').click();await settle();
 assert.equal(d.querySelector('#panel').open,false,'계획 저장을 기다린 뒤 수업으로 진입');
 assert.equal(d.querySelector('#room').hidden,false);assert.equal(d.querySelector('#next').disabled,true);
 byText('설명할 수 있어요 · 읽음 확인').click();await settle();assert.equal(d.querySelector('#next').disabled,false);
 d.querySelector('#next').click();await settle();assert.equal(state.progress[state.plans['공업수학1'].start].index,1);
 d.querySelector('#askToggle').click();assert.equal(d.querySelector('#chat').hidden,false);d.querySelector('#closeChat').click();assert.equal(d.querySelector('#chat').hidden,true);
 byText('내 말로 설명하고 피드백 받기').click();d.querySelector('#question').value='분수 단위가 같다고 생각해요';
 d.querySelector('#chatForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await settle();await settle();
 assert.equal(state.events.at(-1).mode,'teachback');assert.ok(d.querySelector('.feedback'));assert.equal(state.events.filter(e=>e.kind==='answer').length,0,'AI 피드백으로 정답을 만들지 않는다');
 byText('직접 확인 문제 풀기').click();await settle();assert.ok(d.querySelector('#choices .check-answer') || fixture.lessons[state.plans['공업수학1'].start].steps[state.progress[state.plans['공업수학1'].start].index].kind==='quiz');
 prerequisiteMode=true;d.querySelector('#askToggle').click();d.querySelector('#question').value='다시 설명합니다';d.querySelector('#chatForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await settle();await settle();
 byText('선수 개념 보충').click();await settle();assert.ok(byText('원래 문제로 돌아가기'),'보충 진입 직후 복귀 버튼을 표시한다');
 byText('원래 문제로 돌아가기').click();await settle();assert.ok(d.querySelector('#board').textContent);
 assert.equal(errors.length,0,errors.map(String).join('\n'));
 console.log('학교 jsdom: 상담·진단·계획·수업·저장·서술형 피드백·확인 문제·보충 후 복귀 errors=0');
 dom.window.close();
})().catch(error=>{console.error(error);dom.window.close();process.exitCode=1;});
