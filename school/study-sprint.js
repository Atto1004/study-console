import { scopeLessons } from './lesson-order.js';
import { focusCourses } from './focus.js';

export function sprintLessons(course, today, exam) {
  return scopeLessons(course).filter(l => l.date <= today && (!exam || l.date < exam.date));
}
// 위치 이동이나 예전 수강 완료를 회독 완료로 바꾸지 않는다.
export function passCount(events, lesson) {
  const completed = new Set();
  const runs = new Set();
  for (const e of events) {
    if (e.kind !== 'review' || e.action !== 'study-pass-complete' || e.lesson !== lesson || !e.runId) continue;
    if(runs.has(e.runId))continue;
    runs.add(e.runId);
    if (e.pass === 1) completed.add(1);
    if (e.pass === 2 && completed.has(1)) completed.add(2);
  }
  return completed.size;
}
export function currentRun(events, lesson, sessionId) {
  return [...events].reverse().find(e => e.kind === 'review' && e.action === 'study-pass-start' && e.lesson === lesson && e.sessionId === sessionId) || null;
}
export function runComplete(events, run, steps) {
  if (!run || !run.required?.length) return false;
  const start = events.findIndex(e => e.id === run.id);
  if (start < 0) return false;
  const after = events.slice(start + 1).filter(e => e.lesson === run.lesson);
  if(after.some(e=>e.action==='study-pass-start'&&e.runId!==run.runId))return false;
  const own=after.filter(e=>e.runId===run.runId&&e.sessionId===run.sessionId);
  const visited = new Set(own.filter(e => e.kind === 'position').map(e => steps[e.index]?.id));
  const answered = new Set(own.filter(e => e.kind === 'answer').map(e => e.step));
  return run.required.every(id => {
    const step = steps.find(s => s.id === id);
    return !!step && visited.has(id) && (step.kind !== 'quiz' || answered.has(id));
  });
}
export function sprintCourses(catalog, events, today, exams = []) {
  return focusCourses().map(name => {
    const course = catalog.courses.find(c => c.name === name);
    const exam = exams.find(e => e.course === name && e.written && e.kind === '중간' && e.date >= today);
    const lessons = sprintLessons(course, today, exam);
    const completed = [1,2].map(pass => lessons.filter(l => passCount(events,l.id) >= pass).length);
    const pass = completed[0] < lessons.length ? 1 : 2;
    const next = lessons.find(l => passCount(events,l.id) < pass) || null;
    return {name, exam, lessons, completed, pass, next};
  }).sort((a,b) => (a.exam?.date || '9999').localeCompare(b.exam?.date || '9999'));
}
// 1~3일차 전체 첫 회독, 4~6일차 전체 두 번째 회독. 시간 추정이나 캘린더 예약은 하지 않는다.
export function sixDayTargets(courses) {
  return Array.from({length:6},(_,day) => ({day:day+1,pass:day<3?1:2,
    targets:courses.map(c => ({name:c.name,lessons:c.lessons.slice(Math.floor((day%3)*c.lessons.length/3),Math.floor((day%3+1)*c.lessons.length/3))}))}));
}

export function renderSprint(host, {catalog, events, today, exams, start, resume, session}) {
  const doc=host.ownerDocument, make=(tag,text)=>{const e=doc.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
  const section=make('section');section.className='study-sprint';section.setAttribute('aria-label','6일 2회독');
  section.append(make('h2','6일 · 두 번 공부하기'),make('p','1회독: 개념·예제·확인 문제를 순서대로. 2회독: 다시 풀며 막힌 부분을 확인해요. 회독 수와 정답률은 따로 기록합니다.'));
  const courses=sprintCourses(catalog,events,today,exams);
  const list=make('div');list.className='sprint-courses';
  for(const c of courses){
    const row=make('div');row.className='sprint-course';row.append(make('strong',c.name),make('span',`1회독 ${c.completed[0]}/${c.lessons.length} · 2회독 ${c.completed[1]}/${c.lessons.length}`));
    const action=make('button');action.type='button';
    const active=session?.course===c.name&&c.lessons.some(l=>l.id===session.lessonId)&&currentRun(events,session.lessonId,session.id);
    const unfinished=active&&!events.some(e=>e.action==='study-pass-complete'&&e.runId===active.runId);
    action.textContent=unfinished?'회독 이어가기':c.next?`${c.pass}회독 시작 · ${c.next.label || c.next.date.slice(5)}`:c.lessons.length?'두 번 완료 · 복습하기':'수업 연결 확인';
    action.disabled=!c.lessons.length;
    action.onclick=()=>unfinished?resume():start(c.next?.id||c.lessons[0].id,{index:0,studyPass:true});
    row.append(action);list.append(row);
  }
  section.append(list);
  const details=make('details');details.append(make('summary','6일 목표 분량 보기'));
  for(const day of sixDayTargets(courses)){
    const row=make('div');row.className='sprint-day';row.append(make('strong',`${day.day}일차 · ${day.pass}회독`));
    for(const t of day.targets)row.append(make('span',`${t.name} ${t.lessons.length}회차`));
    details.append(row);
  }
  details.append(make('p','현재 연결된 수업을 세 날씩 나눈 목표입니다. 실제 소요 시간과 시험 범위 검증은 별도로 확인해야 합니다. 읽기만 있는 회차의 완료는 이해도 검증이 아닙니다.'));
  section.append(details);host.append(section);
  return section;
}
