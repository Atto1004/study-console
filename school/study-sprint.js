import { scopeLessons } from './lesson-order.js?v=290';
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

const dateDay = date => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return null;
  const value = Date.parse(date+'T00:00:00Z');
  return Number.isFinite(value) && new Date(value).toISOString().slice(0,10) === date ? value : null;
};
// 서버에 저장된 첫 실제 회독 시작 시각이 기준이다. 새로고침이나 다음 날 접속으로 1일차를 다시 만들지 않는다.
export function sprintWindow(courses, events, today) {
  const now = dateDay(today);
  if (now === null) return null;
  const ids = new Set(courses.flatMap(c => c.lessons.map(l => l.id)));
  const names = new Set(focusCourses());
  // 시작 기록의 과목은 실제 서버 기록에 남는다. 나중에 수업이 제외·교체돼도 기준일을 보존한다.
  const dates = events.filter(e => e.kind === 'review' && e.action === 'study-pass-start' && e.runId && (names.has(e.course) || (!e.course && ids.has(e.lesson))) && Number.isFinite(e.at) && e.at > 0 && e.at <= 8640000000000)
    .map(e => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(e.at*1000)))
    .filter(date => dateDay(date) !== null && date <= today).sort();
  const from = dates[0] || today, base = dateDay(from);
  return {from, day:Math.floor((now-base)/86400000)+1, dates:Array.from({length:6},(_,i)=>new Date(base+i*86400000).toISOString().slice(0,10))};
}
export function dueSprintTargets(courses, events, day) {
  const due = sixDayTargets(courses).filter(d => d.day <= Math.min(6,Math.max(1,day)));
  return courses.map(c => ({name:c.name, targets:due.flatMap(d => d.targets.find(t=>t.name===c.name).lessons
    .filter(l => passCount(events,l.id)<d.pass).map(lesson=>({lesson,pass:d.pass}))) }));
}

export function renderSprint(host, {catalog, events, today, exams, start, resume, session}) {
  const doc=host.ownerDocument, make=(tag,text)=>{const e=doc.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
  const section=make('section');section.className='study-sprint';section.setAttribute('aria-label','6일 2회독');
  section.append(make('h2','6일 · 두 번 공부하기'),make('p','1회독: 개념·예제·확인 문제를 순서대로. 2회독: 다시 풀며 막힌 부분을 확인해요. 회독 수와 정답률은 따로 기록합니다.'));
  const courses=sprintCourses(catalog,events,today,exams);
  const window=sprintWindow(courses,events,today);
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
  if(window){
    section.append(make('p',`${window.from} 시작 · ${window.dates[5]}까지 · ${window.day<=6?window.day+'일차':'6일 목표 기간 지남'}`));
    const due=make('div');due.className='sprint-due';due.append(make('h3','오늘 남은 목표'));
    for(const row of dueSprintTargets(courses,events,window.day)){
      const line=make('div');line.append(make('strong',row.name));
      const active=session?.course===row.name && currentRun(events,session.lessonId,session.id);
      const unfinished=active&&!events.some(e=>e.action==='study-pass-complete'&&e.runId===active.runId);
      const continuing=unfinished && row.targets.find(t=>t.lesson.id===session.lessonId);
      const next=continuing || row.targets[0];
      if(next){
        const actualPass=Math.min(2,passCount(events,next.lesson.id)+1),action=make('button',`${actualPass}회독 · ${next.lesson.label||next.lesson.title||next.lesson.date.slice(5)} ${continuing?'이어가기':'시작'}`);
        action.type='button';action.onclick=()=>continuing?resume():start(next.lesson.id,{index:0,studyPass:true});
        line.append(make('span',` 수업 ${row.targets.length}회 남음 · `),action);
      }else line.append(make('span',courses.find(c=>c.name===row.name)?.lessons.length?' 오늘까지 목표 완료':' 수업 연결 확인'));
      due.append(line);
    }
    due.append(make('p','지난 날짜의 미완료 분량도 포함합니다. 2회독 분량은 해당 수업의 1회독을 마친 뒤 시작합니다.'));
    section.append(due);
  }
  const details=make('details');details.append(make('summary','6일 목표 분량 보기'));
  for(const day of sixDayTargets(courses)){
    const row=make('div');row.className='sprint-day';row.append(make('strong',`${window?window.dates[day.day-1]+' · ':''}${day.day}일차 · ${day.pass}회독`));
    for(const t of day.targets)row.append(make('span',`${t.name} ${t.lessons.length}회차`));
    details.append(row);
  }
  details.append(make('p','현재 연결된 수업을 세 날씩 나눈 목표입니다. 실제 소요 시간과 시험 범위 검증은 별도로 확인해야 합니다. 읽기만 있는 회차의 완료는 이해도 검증이 아닙니다.'));
  section.append(details);host.append(section);
  return section;
}
