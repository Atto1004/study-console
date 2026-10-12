import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { lessonHidden, HIDDEN_LESSON_IDS } from './lesson-order.js';
import { pendingDeadlines } from './workspace.js';

// Run the actual entry function with instrumented boundaries; no learner records are written.
const source = fs.readFileSync(new URL('./school.js', import.meta.url), 'utf8');
const entry = source.slice(source.indexOf('async function startLesson('), source.indexOf('\nfunction saveSession('));
function harness(api) {
  const calls = [];
  const context = vm.createContext({lessonHidden, sessionEpoch: 4, requestGeneration: 0,
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
