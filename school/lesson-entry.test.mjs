import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { lessonHidden, HIDDEN_LESSON_IDS, canonicalLessonId, EXCLUDED_LESSONS, LESSON_ALIASES } from './lesson-order.js';
import { pendingDeadlines } from './workspace.js';

// Run the actual entry function with instrumented boundaries; no learner records are written.
const source = fs.readFileSync(new URL('./school.js', import.meta.url), 'utf8');
const entry = source.slice(source.indexOf('async function startLesson('), source.indexOf('\nfunction saveSession('));
function harness(api) {
  const calls = [];
  const context = vm.createContext({lessonHidden, canonicalLessonId, EXCLUDED_LESSONS, sessionEpoch: 4, requestGeneration: 0,
    current: null, pausedLesson: {lesson: 'old'}, state: {progress: {}, events: []}, pending: [],
    mission: {save: async () => calls.push('save')}, growth: null, isBoard: () => true,
    cardGate: async () => {calls.push('card'); return true;},
    showCourse: name => calls.push(name), status: msg => calls.push(msg),
    api: async path => {calls.push(path); return api?.(path, context);},
    loadPack: async () => {throw new Error('stop before rendering');},
  });
  vm.runInContext(entry, context);
  return {context, calls};
}
test('최근 수업의 옛 URL은 새 학습본을 열며 옛 읽음 위치를 복사하지 않는다',async()=>{
  for(const [oldId,newId] of Object.entries(LESSON_ALIASES)){
    const {context,calls}=harness(()=>({id:newId,course:'공업수학1',steps:[{id:'s1-1:0'}]}));
    context.state.progress[oldId]={index:90};
    await context.startLesson(oldId,{index:90,stepId:'line:99:0'});
    assert.ok(calls.includes('lesson?id='+encodeURIComponent(newId)));
    assert.ok(!calls.includes('lesson?id='+encodeURIComponent(oldId)));
    assert.equal(context.state.events.length,0);
    assert.equal(context.state.progress[oldId].index,90);
  }
});
test('옛 세션 이어하기는 안내 후 명시적으로 새 수업을 시작하며 다른 기기 전송은 무시한다',async()=>{
  for(const oldId of Object.keys(LESSON_ALIASES)){
    const {context,calls}=harness();let host=[];
    context.panel=()=>({append:(...nodes)=>host.push(...nodes)});
    context.node=(tag,text)=>({tag,text});context.button=(text,action)=>({text,action});
    await context.startLesson(oldId,{resume:{stepId:'line:1:0'}});
    assert.equal(calls.length,0);assert.equal(host.length,2);
    assert.match(host[0].text,/이전 읽음 기록은 보존/);
    await context.startLesson(oldId,{follow:true,epoch:4});
    assert.equal(calls.length,0);
  }
});
test('미확인 내용·출결 메모는 직접 URL로 열어도 카드·저장·학습 API를 호출하지 않는다',async()=>{
  for(const id of Object.keys(EXCLUDED_LESSONS)){
    const {context,calls}=harness();
    await context.startLesson(id);
    assert.equal(calls.some(x=>x==='card'||x==='save'||x.startsWith('lesson?id=')),false);
    assert.ok(calls.includes(EXCLUDED_LESSONS[id].course));
  }
});
test('hidden URL/resume/follow entry never reaches cards, save or lesson API', async () => {
  for (const id of HIDDEN_LESSON_IDS) for (const options of [{}, {resume: {returnTo: {lessonId:'base'}}}, {follow:true, epoch:4}]) {
    const {context, calls} = harness();
    await context.startLesson(id, options);
    assert.equal(calls.some(x => x === 'card' || x === 'save' || x.startsWith('lesson?id=')), false);
    assert.equal(context.pausedLesson.lesson, 'old');
  }
});
test('stale hidden follow cannot replace the current screen', async () => {
  const {context,calls} = harness();
  await context.startLesson([...HIDDEN_LESSON_IDS][0], {follow:true,epoch:3});
  assert.equal(calls.length,0);
});
const lesson = {id:'visible',course:'정역학',steps:[{id:'step'}]};
test('이어하기는 시험 모드와 보충 전 원래 수업 참조를 보존한다',async()=>{
 const {context,calls}=harness(()=>lesson);let saved;
 context.pickQuestions=()=>[0];context.saveSession=async(l,i,options)=>{saved=options;throw new Error('stop before UI');};
 const ref={lessonId:'base',stepId:'step'};
 await context.startLesson('visible',{resume:{id:'session',stepId:'step',purpose:'exam',returnTo:ref}});
 assert.equal(saved.purpose,'exam');assert.equal(saved.returnTo,ref);assert.equal(calls.includes('stop before rendering'),false);
});
test('visible resume restores reference and skips hidden reference API', async () => {
  for (const hidden of [false,true]) {
    const ref = hidden ? [...HIDDEN_LESSON_IDS][0] : 'base';
    const {context,calls} = harness(path => path.endsWith('visible') ? lesson : {...lesson,id:'base'});
    await context.startLesson('visible',{resume:{stepId:'step',returnTo:{lessonId:ref,stepId:'step'}}});
    assert.equal(calls.includes('lesson?id='+encodeURIComponent(ref)),!hidden);
    assert.equal(context.pausedLesson?.lesson ?? null,hidden?null:'base');
  }
});
test('late reference response cannot overwrite paused lesson after navigation', async () => {
  const {context} = harness((path,ctx) => {
    if(path.endsWith('visible')) return lesson;
    ctx.requestGeneration++;
    return {...lesson,id:'base'};
  });
  await context.startLesson('visible',{resume:{stepId:'step',returnTo:{lessonId:'base',stepId:'step'}}});
  assert.equal(context.pausedLesson.lesson,'old');
});
test('보충 전 옛·제외·실패한 복귀 참조가 현재 수업의 이어하기를 막지 않는다',async()=>{
 for(const ref of [Object.keys(LESSON_ALIASES)[0],Object.keys(EXCLUDED_LESSONS)[0],'missing-base']){
  const {context,calls}=harness(path=>{
   if(path.endsWith('visible'))return lesson;
   throw new Error('없는 복귀 회차');
  });
  await context.startLesson('visible',{resume:{stepId:'step',returnTo:{lessonId:ref,stepId:'old-line'}}});
  assert.equal(context.pausedLesson,null);
  assert.ok(calls.includes('stop before rendering'));
  assert.ok(!calls.includes('없는 복귀 회차'));
  if(ref!=='missing-base')assert.ok(!calls.includes('lesson?id='+encodeURIComponent(ref)));
 }
});
test('복귀 참조는 렌더링보다 먼저 서버에 보존하고 보존 실패 시 세션을 바꾸지 않는다',async()=>{
 for(const archiveFails of [false,true]){
  const {context,calls}=harness(()=>lesson);const persisted=[];
  context.isBoard=()=>false;context.loadPack=async()=>null;context.inFocus=()=>false;
  context.record=e=>context.pending.push(e);
  context.flush=async()=>{if(!archiveFails)persisted.push(...context.pending.splice(0));};
  context.saveSession=async(l,i,opts)=>{assert.equal(persisted.length,1);assert.equal(opts.returnTo,null);calls.push('session-saved');};
  context.workspace=null;context.closeDialogs=()=>{};context.document={querySelector:()=>({dataset:{}})};
  context.$=()=>({setAttribute:()=>{},className:'',hidden:false,textContent:''});
  context.renderStep=async()=>{throw new Error('render-failed');};
  const reference={lessonId:Object.keys(LESSON_ALIASES)[0],stepId:'old-line'};
  await context.startLesson('visible',{resume:{stepId:'step',returnTo:reference}});
  assert.equal(calls.includes('session-saved'),!archiveFails);
  if(archiveFails){assert.equal(persisted.length,0);assert.equal(context.pending[0].reference,reference);}
  else{assert.equal(persisted[0].reference,reference);assert.ok(calls.includes('render-failed'));}
 }
});
test('home shows combined service round once without changing source or submission state', () => {
  const rows = [
    {course:'사회봉사',title:'3회차 콘텐츠 2건 SNS 게시 + 결과보고서 (2회차 미제출분도 같이)',due:'2026-10-18T23:59',source:'할 일 원본'},
    {course:'사회봉사',title:'3회차 콘텐츠 2건 SNS 게시 + 결과보고서 2건 체리플랫폼 제출',due:'2026-10-18',source:'7주차 기록'},
    {course:'사회봉사',title:'4회차 콘텐츠 제출',due:'2026-11-01'},
    {course:'사회봉사',title:'소감문 보고서 포털 입력',due:'2026-11-30'},
    {course:'공업수학1',title:'과제',due:'2026-10-14'},
  ];
  const before=JSON.stringify(rows);
  const visible=pendingDeadlines(rows,'2026-10-13');
  assert.equal(visible.filter(r=>r.course==='사회봉사').length,1);
  assert.equal(visible.length,2);
  assert.equal(JSON.stringify(rows),before);
  assert.equal(pendingDeadlines(rows.slice(1),'2026-10-13').filter(r=>r.course==='사회봉사').length,1);
  assert.equal(pendingDeadlines([rows[3]],'2026-10-13').length,0);
  assert.equal(pendingDeadlines([rows[3]],'2026-11-20').length,0);
  assert.equal(pendingDeadlines([rows[3]],'2026-11-23').length,1);
  assert.equal(pendingDeadlines([rows[3]],'2026-11-30').length,1);
});
test('current narrative assignment replaces only its same-date initial reminder on home', () => {
  const rows = [
    {course:'아카데믹글쓰기',source:'할 일 원본',title:'8주차 자기서사 완성본(중간고사 대체)',due:'2026-10-20T12:00'},
    {course:'아카데믹글쓰기',source:'1주차 기록',title:'자기서사 글쓰기 (중간 대체, 8주차 제출·그 주 수업 없음)',due:'2026-10-20'},
    {course:'아카데믹글쓰기',source:'LMS',title:'다른 자기서사 활동지 과제',due:'2026-10-20'},
  ];
  const before=JSON.stringify(rows);
  assert.equal(pendingDeadlines(rows,'2026-10-13').length,2);
  assert.equal(JSON.stringify(rows),before);
  assert.equal(pendingDeadlines(rows.slice(1),'2026-10-13').length,2);
  assert.equal(pendingDeadlines([rows[0],{...rows[1],due:'2026-10-21'}],'2026-10-13').length,2);
});
