import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from '../.test-tools/node_modules/jsdom/lib/api.js';
import { renderClassroomDirectory } from './classroom-directory.js';
import { courseMetrics } from './metrics.js';
import { scopeLessons, orderedLessons, orderedTitle, visibleCatalog, sourceHidden, lmsHidden, lessonHidden, HIDDEN_LESSON_IDS, HIDDEN_LESSON_DATES, EXCLUDED_LESSONS } from './lesson-order.js';
const ids=['statics-2026-09-02','statics-2026-09-07','statics-2026-09-09','statics-2026-09-14','statics-2026-09-16','statics-2026-09-21','statics-2026-09-23','statics-2026-09-28','statics-2026-09-30','statics-2026-10-07','exam-statics-2026-10-09','statics-2026-10-10','statics-2026-10-11'];
const statics={name:'정역학',units:[{title:'Ch.1 Introduction',dates:['2026-09-02','2026-09-07']}],lessons:ids.map(id=>({id:id==='statics-2026-09-02'?'session:정역학:2026-09-02':id,title:'주제 '+id,date:id.replace(/^(exam-)?statics-/,'')}))};   // 9/2 는 실제 카탈로그처럼 session: id
test('출결·미확인 자료는 공부 분량에서 빠지고 제외 이유와 원본은 보존한다',()=>{
 const raw={name:'일반물리학2',lessons:[{id:'session:일반물리학2:2026-09-02',date:'2026-09-02'}, {id:'phys2-2026-09-04',date:'2026-09-04'}, {id:'session:일반물리학2:2026-10-07',date:'2026-10-07'}, {id:'exam-phys',date:'2026-10-09',generated:true}]};
 const before=JSON.stringify(raw), c=visibleCatalog({courses:[raw]}).courses[0];
 assert.deepEqual(scopeLessons(c).map(l=>l.id),['phys2-2026-09-04']);
 assert.equal(c.excludedLessons.length,2);assert.match(c.excludedLessons[0].reason,/출결/);
 assert.equal(JSON.stringify(raw),before);assert.equal(lessonHidden(undefined,{}),false);
 const dom=new JSDOM('<section class="class-directory"><h2></h2><div id="courseDoors"></div></section>');
 renderClassroomDirectory({doors:dom.window.document.querySelector('#courseDoors'),courses:[c],onLesson:()=>{},onOther:()=>{}});
 assert.match(dom.window.document.body.textContent,/1회 수업/);
 assert.match(dom.window.document.body.textContent,/회독에서 제외한 기록 · 2건/);
 assert.equal(dom.window.document.querySelectorAll('.classroom-progress-lesson').length,1);dom.window.close();
});
test('수업 옆 목차도 정역학 7개 공통 순서를 사용하고 원본은 보존한다',()=>{
 assert.deepEqual(scopeLessons(statics),orderedLessons(statics));
 assert.equal(scopeLessons(statics).at(-1).label,'벼락치기');
 assert.equal(statics.lessons.length,13);
 for(const name of ['일반물리학2','미분적분학2','공업수학1']){
  const lessons=[{id:'b',date:'2026-09-09'},{id:'exam-x',date:'2026-09-08'},{id:'generated',date:'2026-09-06',generated:true},{id:'a',date:'2026-09-04'}];
  assert.deepEqual(scopeLessons({name,lessons}).map(l=>l.id),['a','b']);
  assert.equal(lessons[0].id,'b');
 }
 assert.deepEqual(scopeLessons(),[]);
});
test('정역학 순서표는 1강~6강+벼락치기만, 숨김 수업은 제외',()=>{
 const o=orderedLessons(statics);
 assert.deepEqual(o.map(l=>l.label),['1강','2강','3강','4강','5강','6강','벼락치기']);
 assert.equal(orderedTitle(o[0]),'1강 · 9/16 · 주제 statics-2026-09-16');
 assert.equal(orderedLessons({name:'공업수학1',lessons:[]}),null);
});
test('교실 탭 정역학 목록: 장 묶음 없이 7줄, 카드 수업 수도 7, 숨김 수업 이름 없음',()=>{
 const dom=new JSDOM('<section class="class-directory"><h2></h2><div id="courseDoors"></div></section>');
 const doors=dom.window.document.querySelector('#courseDoors');let picked;
 renderClassroomDirectory({doors,courses:[statics],events:[],onLesson:(l,n)=>picked=[l.id,n],onOther:()=>{}});
 const rows=[...dom.window.document.querySelectorAll('.classroom-progress-lesson')];
 assert.equal(rows.length,7);
 assert.equal(dom.window.document.querySelectorAll('.classroom-progress-list summary').length,0);
 assert.match(doors.textContent,/7회 수업/);
 assert.match(rows[0].textContent,/^.*1강 · 9\/16/);
 assert.match(rows[6].textContent,/벼락치기 · 10\/11/);
 assert.doesNotMatch(dom.window.document.body.textContent,/09-02|09-07|09-09|09-14|10-10|10-09|statics-2026-09-02/);
 rows[1].click();assert.deepEqual(picked,['statics-2026-09-21','정역학']);
 dom.window.close();
});
test('화면 카탈로그에서 정역학 숨김 수업 6개만 빠지고 다른 과목은 그대로',()=>{
 const other={name:'공업수학1',lessons:[{id:'em1-2026-09-02',date:'2026-09-02',title:'x'}]};
 const v=visibleCatalog({basics:[1],courses:[statics,other]});
 assert.equal(v.courses[0].lessons.length,7);
 assert.deepEqual(v.courses[0].lessons.map(l=>l.id).filter(id=>/09-02|09-07|09-09|09-14|10-10|exam-/.test(id)),[]);
 assert.equal(v.courses[1].lessons.length,1);
 assert.equal(statics.lessons.length,13);   // 원본은 건드리지 않는다
 assert.deepEqual(v.basics,[1]);
});
test('자료실: 정역학 숨김 날짜 자료와 Orientation LMS 항목만 숨김',()=>{
 assert.equal(sourceHidden({course:'정역학',date:'2026-09-02'}),true);
 assert.equal(sourceHidden({course:'정역학',date:'2026-09-16'}),false);
 assert.equal(sourceHidden({course:'CADD',date:'2026-09-02'}),false);
 assert.equal(lmsHidden({course:'정역학',title:'Week 1 Orientation'}),true);
 assert.equal(lmsHidden({course:'CADD',title:'Week 1 Orientation'}),false);
});
test('같은 날짜의 다른 정역학 수업은 숨기지 않고, 숨김 id 는 정확히 6개',()=>{
 assert.equal(lessonHidden('정역학',{id:'statics-2026-09-02-extra',date:'2026-09-02'}),false);
 assert.equal(lessonHidden('정역학',{id:'session:정역학:2026-09-02',date:'2026-09-02'}),true);
 assert.equal(lessonHidden('공업수학1',{id:'statics-2026-09-07',date:'2026-09-07'}),false);
 const v=visibleCatalog({courses:[{name:'정역학',lessons:[{id:'x-extra',date:'2026-09-02'},{id:'statics-2026-09-07',date:'2026-09-07'}]}]});
 assert.deepEqual(v.courses[0].lessons.map(l=>l.id),['x-extra']);
 assert.equal(HIDDEN_LESSON_IDS.size,6);
});
test('정역학은 하루에 수업 하나(자료실 날짜 숨김의 전제, 실제 카탈로그 13개 날짜는 중복 없음을 10/12 직접 확인)',()=>{
 const dates=statics.lessons.map(l=>l.date);assert.equal(new Set(dates).size,dates.length);
 assert.equal(HIDDEN_LESSON_DATES.size,5);
});
test('숨긴 수업에 완료 기록이 남아 있어도 보이는 수업 수·진행률에서 빠진다',()=>{
 const v=visibleCatalog({courses:[statics]}).courses[0];
 const events=[{kind:'practice',action:'answer',lesson:'statics-2026-09-07',correct:true},{kind:'practice',action:'answer',lesson:'statics-2026-09-16',correct:true}];
 const m=courseMetrics({lessons:v.lessons,events,today:'2026-10-12'});
 assert.equal(m.scope,7);
 assert.ok(m.covered<=1);
});
test('수업 선택 창과 교실 탭 목록은 같은 이름·순서',()=>{
 const dom=new JSDOM('<section class="class-directory"><h2></h2><div id="courseDoors"></div></section>');
 const doors=dom.window.document.querySelector('#courseDoors');
 renderClassroomDirectory({doors,courses:[statics],events:[],onLesson:()=>{},onOther:()=>{}});
 const rows=[...dom.window.document.querySelectorAll('.classroom-progress-lesson strong')].map(e=>e.textContent);
 assert.deepEqual(rows,orderedLessons(statics).map(orderedTitle));
 dom.window.close();
});


test('새 정역학 7강은 교실과 회독 순서에 포함되고 기존 제외 및 호환 규칙을 보존한다',async()=>{
 const {canonicalLessonId}=await import('./lesson-order.js');
 const recent={id:'statics-2026-10-12',date:'2026-10-12',title:'3차원 지점 반력과 두 힘·세 힘 부재'};
 const raw={...statics,lessons:[...statics.lessons,recent]};
 const before=JSON.stringify(raw), rows=scopeLessons(raw);
 assert.equal(rows.length,8);assert.equal(rows.at(-2).id,recent.id);assert.equal(rows.at(-2).label,'7강');
 assert.equal(rows.at(-1).label,'벼락치기');
 assert.equal(JSON.stringify(raw),before);
 assert.equal(canonicalLessonId('phys2-2026-09-04'),'phys2-reviewed-2026-09-04');
 assert.equal(lessonHidden('일반물리학2',{id:'session:일반물리학2:2026-09-02'}),true);
 const {sprintLessons}=await import('./study-sprint.js');
 assert.ok(sprintLessons(raw,'2026-10-13').some(l=>l.id===recent.id));
 assert.equal(sprintLessons(raw,'2026-10-11').some(l=>l.id===recent.id),false);
});
