import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {JSDOM} from '../.test-tools/node_modules/jsdom/lib/api.js';
import {currentRun,runComplete,passCount,sprintCourses} from './study-sprint.js';
import {evidenceSummary} from './learning.js';
import {inFocus} from './focus.js';
const source=fs.readFileSync(new URL('./school.js',import.meta.url),'utf8');
const finish=source.slice(source.indexOf('async function finish()'),source.indexOf('\nasync function consult('));
test('실제 기록 함수는 위치와 답변을 현재 회독 세션에만 귀속한다',()=>{
 const marker={id:'start',kind:'review',action:'study-pass-start',lesson:'lesson',sessionId:'session',runId:'run'};
 const context=vm.createContext({pending:[],state:{events:[marker]},activeSession:{id:'session',lessonId:'lesson'},currentRun,eventId:()=> 'new-id',flush:()=>{}});
 vm.runInContext(source.slice(source.indexOf('function record('),source.indexOf('\nfunction flush(')),context);
 context.record({kind:'position',lesson:'lesson',index:0});context.record({kind:'answer',lesson:'lesson',step:'quiz'});context.record({kind:'position',lesson:'other',index:0});
 assert.equal(context.pending[0].runId,'run');assert.equal(context.pending[1].sessionId,'session');assert.equal(context.pending[2].runId,undefined);
});
function harness({saveFails=false,midway=false}={}){
 const dom=new JSDOM('<main></main>');const doc=dom.window.document,host=doc.querySelector('main');
 const lesson={id:'statics-2026-09-16',course:'정역학',date:'2026-09-16',title:'입자 평형',steps:[{id:'a',kind:'understand'},{id:'b',kind:'quiz'}]};
 const run={id:'begin',kind:'review',action:'study-pass-start',lesson:lesson.id,course:lesson.course,sessionId:'session1',runId:'run1',pass:1,required:['a','b']};
 const events=midway?[]:[run];
 events.push({kind:'position',course:lesson.course,lesson:lesson.id,index:0,runId:'run1',sessionId:'session1'},{kind:'position',course:lesson.course,lesson:lesson.id,index:1,runId:'run1',sessionId:'session1'},{kind:'answer',course:lesson.course,lesson:lesson.id,step:'b',correct:false,runId:'run1',sessionId:'session1'});
 const calls=[];
 const node=(tag,text,cls)=>{const e=doc.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 const context=vm.createContext({current:lesson,course:lesson.course,activeSession:{id:'session1'},state:{events,plans:{}},pending:[],missionIndices:null,finishing:false,
  currentRun,runComplete,passCount,sprintCourses,evidenceSummary,inFocus,
  catalog:{courses:[{name:'정역학',lessons:[lesson,{id:'statics-2026-09-21',date:'2026-09-21',title:'모멘트'}]}]},
  workspace:{data:{exams:[]},open:()=>{}},curPack:()=>false,growth:null,panel:()=>host,node,
  showReviews:()=>{},showCourse:()=>{},button:(text,go,cls)=>{const b=node('button',text,cls);b.onclick=go;return b;},
  record:e=>context.pending.push({id:'event'+(calls.length+context.pending.length),...e}),
  flush:async()=>{if(!saveFails){context.state.events.push(...context.pending);context.pending.length=0;}},
  startLesson:(...args)=>calls.push(args),renderMath:()=>{}});
 vm.runInContext(finish,context);return {dom,host,context,calls};
}
test('실제 종료 화면은 회독을 저장하고 계획 없이 다음 수업과 오답 복습을 제공한다',async()=>{
 const h=harness();await h.context.finish();
 assert.equal(passCount(h.context.state.events,'statics-2026-09-16'),1);
 const next=[...h.host.querySelectorAll('button')].find(b=>b.textContent==='1회독 · 다음 수업 계속');assert.ok(next);next.click();
 assert.equal(h.calls[0][0],'statics-2026-09-21');assert.equal(h.calls[0][1].index,0);assert.equal(h.calls[0][1].studyPass,true);
 assert.match(h.host.textContent,/막힌 확인 문제 바로 다시 풀기/);h.dom.window.close();
});
test('회독 저장 실패 시 다음 수업으로 진행하지 않는다',async()=>{
 const h=harness({saveFails:true});await h.context.finish();await h.context.finish();assert.equal(h.host.children.length,0);assert.equal(h.calls.length,0);assert.ok(h.context.pending.length>=1);h.dom.window.close();
});
test('저장 중 종료를 다시 눌러도 완료는 한 번만 기록한다',async()=>{
 const h=harness();let release;h.context.flush=()=>new Promise(resolve=>{release=()=>{h.context.state.events.push(...h.context.pending);h.context.pending.length=0;resolve();};});
 const first=h.context.finish();await h.context.finish();release();await first;
 assert.equal(h.context.state.events.filter(e=>e.action==='study-pass-complete').length,1);h.dom.window.close();
});
test('회독 시작 없는 누적 위치 기록을 새 회독 완료로 인정하지 않는다',async()=>{
 const h=harness({midway:true});await h.context.finish();assert.equal(passCount([...h.context.state.events,...h.context.pending],'statics-2026-09-16'),0);
 assert.match(h.host.textContent,/처음부터 다시 확인/);h.dom.window.close();
});
