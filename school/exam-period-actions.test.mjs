import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mock} from 'node:test';
import {mergeExamTimeline,periodPlanKey} from './exam-timeline.js';
const {JSDOM}=createRequire(import.meta.url)('jsdom');
const dom=new JSDOM('<!doctype html><body><div id="h"></div>',{pretendToBeVisual:true,url:'http://127.0.0.1/'}),w=dom.window;
for(const k of ['document','localStorage','requestAnimationFrame','innerWidth','innerHeight'])Object.defineProperty(globalThis,k,{value:w[k],configurable:true,writable:true});
mock.timers.enable({apis:['Date'],now:Date.parse('2026-10-13T05:00:00Z')});
const study={start:'16:00',end:'17:00',kind:'study',title:'정역학 시험 공부'},fixed={start:'09:00',end:'10:00',kind:'fixed',title:'정역학 수업'};
const day={date:'2026-10-13',events:[fixed,study]},key=periodPlanKey(day.date,study);
let server={marker:'preserve',v60:{done:{old:123},act:{old:[{m:25}]},run:{old:{t0:123}}}},fail=false,conflict=true;
globalThis.fetch=async(url,opt={})=>{
 const json=o=>({ok:true,json:async()=>o});
 if(String(url).includes('_private/plan.json'))return json({examPeriod:{days:[day]}});
 if(String(url).startsWith('/api/cal'))return json({ok:true,days:{}});
 if(String(url)==='/api/study/state'){
  if(opt.method==='POST'){
   if(fail)return {ok:false,status:503};
   if(conflict){conflict=false;server.v60.otherDevice='preserved after conflict';return {ok:false,status:409};}
   server=JSON.parse(opt.body).state;return json({workspaceRevision:1});
  }
  return json({state:structuredClone(server)});
 }
 throw Error('unexpected fetch '+url);
};
const {createPlan}=await import('./plan.js');
const context={today:day.date,courses:['정역학'],courseId:()=> 'c1',courseName:()=> '정역학',focus:()=>true,inClass:()=>false,
 scheduled:[],classSlots:[],sessions:[],plans:[],calendarOk:true,calendar:[],routine:{grid:{}},exams:[],deadlines:[],dailyCap:4};
const host=document.getElementById('h'),plan=createPlan({status(){}});
const flush=async()=>{for(let i=0;i<12;i++)await new Promise(r=>setTimeout(r,0));};
const block=title=>[...host.querySelectorAll('.pl-blk')].find(e=>e.textContent.includes(title));
const click=e=>e.dispatchEvent(new w.MouseEvent('click',{bubbles:true,clientX:100,clientY:100}));
await plan.render(host,context);await flush();
assert.equal(block(study.title).getAttribute('role'),'button');
assert.ok(block(study.title).classList.contains('c-plan'),'generated study is tentative, not completed study');
click(block(study.title));await flush();
assert.ok(document.querySelector('.pl-pop').textContent.includes('공부 계획'));
click([...document.querySelectorAll('.pl-pop button')].find(b=>b.textContent==='이 계획 삭제'));await flush();
assert.equal(server.v60.examPeriodDismissed[key],true);assert.equal(block(study.title),undefined);
assert.equal(server.marker,'preserve');assert.equal(server.v60.done.old,123);
assert.equal(server.v60.otherDevice,'preserved after conflict');
assert.deepEqual(server.v60.act.old,[{m:25}]);assert.deepEqual(server.v60.run.old,{t0:123});
assert.ok(block(fixed.title),'fixed entry remains');
const undo=[...document.querySelectorAll('.pl-toast button')].find(b=>b.textContent==='지운 계획 되돌리기');assert.ok(undo);conflict=true;click(undo);await flush();
assert.ok(block(study.title));assert.equal(server.v60.examPeriodDismissed[key],undefined);
click(block(fixed.title));await flush();
assert.ok(![...document.querySelectorAll('.pl-pop button')].some(b=>b.textContent==='이 계획 삭제'));
assert.equal(mergeExamTimeline([],day,{[periodPlanKey(day.date,fixed)]:true}).length,2,'fixed source cannot be hidden by stored flag');
document.querySelector('.pl-pop').remove();
fail=true;click(block(study.title));await flush();click([...document.querySelectorAll('.pl-pop button')].find(b=>b.textContent==='이 계획 삭제'));await flush();
assert.ok(host.querySelector('.pl-unsaved'),'failure remains explicit and retryable');assert.equal(server.v60.examPeriodDismissed[key],undefined);
fail=false;click(host.querySelector('.pl-unsaved button'));await flush();assert.equal(server.v60.examPeriodDismissed[key],true);
document.querySelector('.pl-pop')?.remove();await plan.render(host,context);await flush();assert.equal(block(study.title),undefined,'reload restores server deletion');
const otherHost=document.createElement('div');document.body.append(otherHost);const otherPlan=createPlan({status(){}});await otherPlan.render(otherHost,context);await flush();
assert.ok(!otherHost.textContent.includes(study.title),'new instance reads same server deletion');
assert.deepEqual(server.v60.act.old,[{m:25}]);assert.deepEqual(server.v60.run.old,{t0:123});
otherPlan.destroy();
const savedFetch=globalThis.fetch;let resolveOld,privateReads=0;
globalThis.fetch=(url,opt)=>{
 if(String(url).includes('_private/plan.json')){
  if(++privateReads===1)return new Promise(resolve=>{resolveOld=resolve;});
  return Promise.resolve({ok:true,json:async()=>({examPeriod:{days:[{date:day.date,events:[{...study,title:'최신 계획'}]}]}})});
 }
 return savedFetch(url,opt);
};
const oldRender=plan.render(host,context);await flush();await plan.render(host,context);assert.ok(host.textContent.includes('최신 계획'));
resolveOld({ok:true,json:async()=>({examPeriod:{days:[{date:day.date,events:[{...study,title:'늦게 도착한 계획'}]}]}})});await oldRender;await flush();
assert.ok(host.textContent.includes('최신 계획'));assert.ok(!host.textContent.includes('늦게 도착한 계획'));
plan.destroy();dom.window.close();console.log('exam-period actions: delete/undo/conflict/fixed protection/save failure/new instance/stale render PASS');process.exit(0);
