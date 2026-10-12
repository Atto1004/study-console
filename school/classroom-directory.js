import { groupCourseLessons } from './course-scope.js?v=212';
import { lectureStatus } from './subject-scope.js?v=238';
import { focusCourses } from './focus.js';
import { orderedLessons, orderedTitle, scopeLessons } from './lesson-order.js?v=297';

export function renderClassroomDirectory({doors,courses,events=[],session,onLesson,onOther}) {
  const doc=doors.ownerDocument;
  const make=(tag,text,cls)=>{const e=doc.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
  const chosen=doors.dataset.selectedCourse || session?.course || focusCourses()[0];
  const main=courses.filter(c=>focusCourses().includes(c.name)).sort((a,b)=>focusCourses().indexOf(a.name)-focusCourses().indexOf(b.name));
  doors.replaceChildren();
  doors.closest('.class-directory')?.querySelector('h2')?.replaceChildren(doc.createTextNode('중간고사 대비 과목'));
  let progress=doors.parentElement.querySelector('.classroom-progress-list');
  if(!progress){progress=make('section','','classroom-progress-list');progress.setAttribute('aria-label','과목별 수업 진행 목록');doors.after(progress);}
  const select=name=>{
    doors.dataset.selectedCourse=name;
    for(const b of doors.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.course===name));
    progress.replaceChildren(make('h3',name+' · 수업 진행 목록'));
    const rawCourse=courses.find(c=>c.name===name);
    const course={...rawCourse,lessons:scopeLessons(rawCourse)};
    const row=(lesson,title)=>{
      const status=lectureStatus(lesson.id,events,session?.lessonId);
      const r=make('button','','classroom-progress-lesson');r.type='button';r.dataset.status=status;
      const indicator=make('span',status==='complete'?'✓':status==='started'?'◐':'○','classroom-progress-state');
      const text=make('span');text.append(make('strong',title),make('small',{complete:'수강 완료',started:'수강 중',unheard:'미수강'}[status]));
      r.append(indicator,text,make('span','목차 선택 ›'));r.onclick=()=>onLesson(lesson,name);return r;
    };
    const ordered=orderedLessons(course);
    if(ordered){const list=make('div','','classroom-progress-unit');for(const l of ordered)list.append(row(l,orderedTitle(l)));progress.append(list);}
    else for(const [i,unit] of groupCourseLessons(course).entries()){
      const block=make('details','','classroom-progress-unit');block.open=i===0||unit.lessons.some(l=>l.id===session?.lessonId);
      block.append(make('summary',unit.title+' · '+unit.lessons.length+'회 수업'));
      for(const lesson of unit.lessons){const r=row(lesson,lesson.title);r.querySelector('small').textContent=lesson.date+' · '+r.querySelector('small').textContent;block.append(r);}
      progress.append(block);
    }
    if(!course.lessons.length)progress.append(make('p','연결된 수업 자료가 아직 없습니다.'));
    if(course.excludedLessons?.length){
      const excluded=make('details','','classroom-progress-unit');excluded.append(make('summary','회독에서 제외한 기록 · '+course.excludedLessons.length+'건'));
      for(const l of course.excludedLessons)excluded.append(make('p',l.date+' · '+l.reason));
      excluded.append(make('p','원자료와 출결 기록은 보존합니다. 자료실에서 원자료를 확인할 수 있습니다.'));progress.append(excluded);
    }
  };
  for(const course of main){const b=make('button','','door');b.type='button';b.dataset.course=course.name;const text=make('span','','door-info');text.append(make('b',course.name),make('small',scopeLessons(course).length+'회 수업'));b.append(text);b.onclick=()=>select(course.name);doors.append(b);}
  if(main.length) select(main.some(c=>c.name===chosen)?chosen:main[0].name);
  else progress.replaceChildren(make('p','시험 대비 과목에 연결된 자료가 아직 없습니다.'));
  let other=doors.parentElement.querySelector('.classroom-other-courses');
  if(!other){other=make('details','','classroom-other-courses');progress.after(other);}
  other.replaceChildren(make('summary','다른 과목 보기'));
  for(const c of courses.filter(c=>!focusCourses().includes(c.name)&&c.name!=='사회봉사')){const b=make('button',c.name);b.type='button';b.onclick=()=>onOther(c.name);other.append(b);}
}
