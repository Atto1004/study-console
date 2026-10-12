import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from '../.test-tools/node_modules/jsdom/lib/api.js';
import {passCount,runComplete,sprintCourses,sixDayTargets,renderSprint} from './study-sprint.js';
import {sprintLessons} from './study-sprint.js';
const steps=[{id:'a',kind:'understand'},{id:'b',kind:'quiz'}];
const run={id:'start',kind:'review',action:'study-pass-start',runId:'r1',sessionId:'s1',lesson:'one',required:['a','b']};
const complete=(pass,runId='r1')=>({kind:'review',action:'study-pass-complete',lesson:'one',pass,runId});
test('회독 범위는 미래·시험 이후·중복 문제집 회차를 제외한다',()=>{
 const c={name:'미분적분학2',lessons:[{id:'a',date:'2026-09-01'},{id:'exam-a',date:'2026-09-02'},{id:'g',date:'2026-09-03',generated:true},{id:'future',date:'2026-10-14'},{id:'exam-day',date:'2026-10-13'}]};
 assert.deepEqual(sprintLessons(c,'2026-10-13',{date:'2026-10-13'}).map(l=>l.id),['a']);
});
test('예전 위치·완료와 중복 완료는 두 회독으로 부풀리지 않는다',()=>{
 assert.equal(passCount([{kind:'review',action:'lecture-complete',lesson:'one'},complete(2)],'one'),0);
 assert.equal(passCount([complete(1),complete(1)],'one'),1);
 assert.equal(passCount([complete(1),complete(2)],'one'),1);
 assert.equal(passCount([complete(1),complete(2,'r2')],'one'),2);
});
test('이번 시작 이후 전체 경로와 문제 답변이 있어야 회독 완료',()=>{
 const positions=steps.map((_,index)=>({kind:'position',lesson:'one',index,runId:'r1',sessionId:'s1'}));
 const answer={kind:'answer',lesson:'one',step:'b',correct:false,runId:'r1',sessionId:'s1'};
 assert.equal(runComplete([...positions,answer,run],run,steps),false);
 assert.equal(runComplete([run,...positions],run,steps),false);
 assert.equal(runComplete([run,...positions,answer],run,steps),true);
 assert.equal(runComplete([run,...positions.slice(1),answer],run,steps),false);
 assert.equal(runComplete([run,...positions,answer],{...run,required:['missing']},steps),false);
 assert.equal(runComplete([run,...positions,answer,{...run,id:'new',runId:'r2'}],run,steps),false);
 assert.equal(runComplete([run,...positions.map(e=>({...e,runId:'r2',sessionId:'s2'})),{...answer,runId:'r2',sessionId:'s2'}],run,steps),false);
});
const catalog={courses:['정역학','일반물리학2','미분적분학2','공업수학1'].map(name=>({name,lessons:name==='정역학'?[{id:'statics-2026-09-16',date:'2026-09-16'}]:Array.from({length:7},(_,i)=>({id:name+i,date:'2026-09-0'+(i+1)}))}))};
test('6일 목표는 네 과목 전체를 각 회독에 정확히 한 번씩 배분',()=>{
 const courses=sprintCourses(catalog,[],'2026-10-13');const days=sixDayTargets(courses);
 assert.equal(days.length,6);
 for(const pass of [1,2])for(const c of courses){
  const ids=days.filter(d=>d.pass===pass).flatMap(d=>d.targets.find(t=>t.name===c.name).lessons.map(l=>l.id));
  assert.deepEqual(ids,c.lessons.map(l=>l.id));assert.equal(new Set(ids).size,ids.length);
 }
});
test('홈 버튼은 처음부터 회독 시작하며 완료한 세션을 이어가지 않는다',()=>{
 const dom=new JSDOM('<main></main>');let calls=[];
 renderSprint(dom.window.document.querySelector('main'),{catalog,events:[],today:'2026-10-13',exams:[],start:(...args)=>calls.push(args),resume:()=>calls.push('resume')});
 const buttons=[...dom.window.document.querySelectorAll('button')];assert.equal(buttons.length,4);buttons[0].click();
 assert.deepEqual(calls[0],['statics-2026-09-16',{index:0,studyPass:true}]);
 const other={courses:[{name:'미분적분학2',lessons:[{id:'one',date:'2026-09-01'}]}]};
 const host=dom.window.document.createElement('main');
 renderSprint(host,{catalog:other,events:[run,complete(1)],today:'2026-10-13',exams:[],session:{id:'s1',course:'미분적분학2',lessonId:'one'},start:()=>{},resume:()=>{}});
 assert.match(host.textContent,/2회독 시작/);assert.doesNotMatch(host.textContent,/회독 이어가기/);dom.window.close();
});
test('회독에서 제외한 세션이 진행 중이어도 검증된 다음 수업을 시작한다',()=>{
 const dom=new JSDOM('<main></main>'),host=dom.window.document.querySelector('main');let called;
 const excluded='session:일반물리학2:2026-10-07';
 const catalog={courses:[{name:'일반물리학2',lessons:[{id:'phys2-2026-09-04',date:'2026-09-04'},{id:excluded,date:'2026-10-07'}]}]};
 renderSprint(host,{catalog,events:[{...run,lesson:excluded}],today:'2026-10-13',exams:[],session:{id:'s1',course:'일반물리학2',lessonId:excluded},start:id=>called=id,resume:()=>{throw new Error('제외 회차 이어하기');}});
 assert.doesNotMatch(host.textContent,/회독 이어가기/);
 [...host.querySelectorAll('.sprint-course')].find(row=>row.textContent.includes('일반물리학2')).querySelector('button').click();
 assert.equal(called,'phys2-2026-09-04');dom.window.close();
});
