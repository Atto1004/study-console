const KEY='school-lecture-quests-v1'+(new URLSearchParams(location.search).get('test')==='1'?'-test':'');
export function lectureQuestEvidence(lesson,events=[]) {
  const quizzes=lesson.steps.filter(s=>s.options?.length && Number.isInteger(s.answer));
  const latest=new Map();for(const event of events)if(event.kind==='answer'&&event.lesson===lesson.id)latest.set(event.step,event);
  const completed=quizzes.filter(s=>latest.get(s.id)?.correct===true && !latest.get(s.id)?.assisted);
  return {total:quizzes.length,completed:completed.length,next:quizzes.find(s=>!completed.includes(s))?.id};
}
export function createLectureQuests({host=document.getElementById('room'),storage=localStorage,onStep=()=>{}}={}) {
  const aside=document.createElement('aside');aside.className='lecture-quests';aside.setAttribute('aria-label','수업 도전');aside.hidden=true;host?.append(aside);
  let checks={},readable=true,lesson=null,events=[];
  try {const data=JSON.parse(storage.getItem(KEY)||'{}');if(!data||typeof data!=='object'||Array.isArray(data))throw Error('invalid');checks=data;}
  catch {readable=false;}
  const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
  function render(nextLesson,nextEvents=[]){
    lesson=nextLesson;events=nextEvents;aside.hidden=!lesson;if(!lesson)return;aside.replaceChildren();
    const evidence=lectureQuestEvidence(lesson,events),saved=checks[lesson.id]||{};
    const example=lesson.steps.find(s=>s.kind==='example');
    const goals=[
      {id:'concept',title:'개념을 내 말로 설명하기',detail:'교재를 덮고 이 수업의 핵심을 설명합니다.',done:!!saved.concept},
      {id:'method',title:example?'예제의 풀이 순서 재현하기':'공식의 적용 조건 구분하기',detail:example?example.title:'언제 사용할 수 있고, 언제 사용할 수 없는지 구분합니다.',done:!!saved.method},
      {id:'solve',title:evidence.total?'확인 문제를 도움 없이 풀기':'같은 유형 문제를 스스로 풀기',detail:evidence.total?`${evidence.completed} / ${evidence.total}문제 · 정답 기록으로 확인`:'풀이를 보지 않고 직접 해결해 봅니다.',done:evidence.total?evidence.completed===evidence.total:!!saved.solve,verified:!!evidence.total}
    ];
    const count=goals.filter(g=>g.done).length;
    aside.append(el('h2','수업 도전'),el('p',[lesson.date,lesson.course].filter(Boolean).join(' · '),'quest-lesson'),el('p',lesson.title,'quest-topic'),el('p',count===3?'3 / 3 · 도전 완료':`${count} / 3 완료`,'quest-count'));
    const list=el('ol');
    for(const goal of goals){
      const item=el('li',undefined,'quest-item'+(goal.done?' done':'')),label=el('label'),check=el('input');check.type='checkbox';check.checked=goal.done;check.setAttribute('aria-label',goal.title);check.disabled=!readable;
      const circle=el('span',goal.done?'✓':'','quest-circle');circle.setAttribute('aria-hidden','true');
      const text=el('span',undefined,'quest-text');text.append(el('strong',goal.title),el('small',goal.detail),el('em',goal.verified?'문제 풀이로 확인':'직접 체크'));
      check.onchange=()=>{
        if(goal.verified){check.checked=goal.done;if(!goal.done&&evidence.next)onStep(evidence.next);return;}
        const previous=checks;checks={...checks,[lesson.id]:{...saved,[goal.id]:check.checked}};
        try {storage.setItem(KEY,JSON.stringify(checks));render(lesson,events);}
        catch {checks=previous;check.checked=goal.done;notice.textContent='체크를 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.';}
      };
      label.append(check,circle,text);item.append(label);list.append(item);
    }
    aside.append(list,el('p','임시 공통 항목 · 강의별 구성 예정','quest-notice'));const notice=el('p',readable?'직접 체크는 자기 점검이며, 정답 확인은 이 수업의 확인 문제 기록입니다.':'저장한 체크를 읽지 못해 변경을 중단했습니다.','quest-notice');aside.append(notice);
  }
  return {el:aside,render};
}
