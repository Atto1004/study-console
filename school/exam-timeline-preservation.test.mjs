import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeExamTimeline,periodPlanKey,readExamPeriod} from './exam-timeline.js';
const date='2026-10-13';
const originals=[
 {id:'cl',date,k:'class',title:'정역학 수업',s:540,e:600,cls:{id:'class-1',course:'정역학'}},
 {id:'cal',date,k:'cal',title:'정역학 시험',s:660,e:720,ev:{id:'event-1'}},
 {id:'job',date,k:'work',title:'정역학 근무',s:720,e:780,routine:{id:'work-1'}},
 {id:'ex',date,k:'exam',title:'시험 · 정역학',s:900,e:990},
 {id:'goal',date,k:'sleep',title:'목표 수면',s:0,e:480,sleep:{state:'plan'}},
 {id:'slept',date,k:'sleep',title:'실제 수면',s:0,e:360,sleep:{state:'confirmed'}}
];
const event={kind:'exam',title:'시험 · 정역학',start:'15:00',end:'16:30'};
test('같은 제목의 다른 종류 원본은 ID·종류·시각을 유지한다',()=>{
 const before=structuredClone(originals),out=mergeExamTimeline(originals,{date,events:[event],cancelledCourses:['정역학']});
 for(const original of originals)assert.equal(out.find(b=>b.id===original.id),original);
 assert.deepEqual(originals,before);assert.equal(out.find(b=>b.periodEntry)?.k,'exam-period');
});
test('휴강은 해당 날짜의 수업 ID만 제거하며 동명 캘린더는 남는다',()=>{
 const out=mergeExamTimeline(originals,{date,events:[],cancelledClassIds:['class-1']});
 assert.ok(!out.some(b=>b.id==='cl'));assert.ok(out.some(b=>b.id==='cal'));
 assert.equal(mergeExamTimeline(originals,{date:'2026-10-14',events:[],cancelledClassIds:['class-1']}).length,originals.length);
});
test('명시적인 원본 종류·ID의 표시 사본만 생략한다',()=>{
 const out=mergeExamTimeline(originals,{date,events:[{...event,sourceRef:{kind:'exam',id:'ex'}}]});assert.equal(out.length,originals.length);
 const wrong=mergeExamTimeline(originals,{date,events:[{...event,sourceRef:{kind:'class',id:'ex'}}]});assert.equal(wrong.length,originals.length+1);
});
test('빈 날·공부만 있는 날·새 수면 계획 삭제 모두 기존 목표·실제 수면을 보존한다',()=>{
 const sleep={kind:'sleep',title:'새 수면 계획',start:'22:00',end:'24:00'};
 for(const day of [{date,events:[]},{date,events:[{...sleep,kind:'study'}]},{date,events:[sleep]}]){
  const out=mergeExamTimeline(originals,day,{[periodPlanKey(date,sleep)]:true});
  assert.equal(out.find(b=>b.id==='goal'),originals[4]);assert.equal(out.find(b=>b.id==='slept'),originals[5]);
 }
});
test('멈춘 응답·멈춘 JSON·HTTP실패 모두 제한 시간 안에 기본 상태로 복귀한다',async()=>{
 let aborted=false;
 assert.equal(await readExamPeriod((_,o)=>{o.signal.addEventListener('abort',()=>aborted=true);return new Promise(()=>{});},'test',10),null);
 assert.equal(aborted,true);
 assert.equal(await readExamPeriod(async()=>({ok:true,json:()=>new Promise(()=>{})}),'test',10),null);
 assert.equal(await readExamPeriod(async()=>({ok:false}),'test',10),null);
});
