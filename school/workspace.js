import { courseMetrics, sourceKind, pickQuest, KINDS } from "./metrics.js";
import { attachSaeng } from "./saeng.js";
import { officeHref } from "./worldmap.js";
import { inFocus, focusCourses, isInClass } from "./focus.js";
const el = (tag, text, cls) => { const e=document.createElement(tag); if(text!==undefined)e.textContent=text; if(cls)e.className=cls; return e; };
const btn = (text, action, cls='') => { const b=el('button',text,cls); b.type='button'; b.onclick=action; return b; };
const minutes = s => Number(s.slice(0,2))*60+Number(s.slice(3));
const hm = n => `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
export const ddayLabel = n => n===0?'D-day':`D-${n}`;
export const hiddenDeadline = task => !!(task.hiddenFromMain&&task.workDone&&task.deadlineDays!==0);
// 마감이 지난 과제: 마감 날짜가 오늘 전이거나, 오늘인데 마감 시각이 이미 지남(한국 시각). 마감 날짜를 모르면 지난 것으로 보지 않음
export function pastDue(r, today) {
  const m=/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/.exec(r.due||''); if(!m)return false;
  if(m[1]<today)return true;
  if(m[1]>today||!m[2])return false;
  const now=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
  const kstToday=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul'}).format(new Date());
  return kstToday===today&&m[2]<now;
}
export function pendingDeadlines(rows, today) {
  const day=Date.parse(today+'T00:00:00Z');
  return rows.filter(r=>!r.submitted&&!pastDue(r,today)).map(r=>{   // 지난 과제는 아예 안 보임(대표님 10/9)
    const match=/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2})(?::\d{2})?)?$/.exec(r.due||'');
    const stamp=match?Date.parse(match[1]+'T'+(match[2]||'23:59')+':00Z'):NaN;
    const valid=match&&Number.isFinite(stamp)&&new Date(stamp).toISOString().slice(0,10)===match[1];
    const days=valid?Math.round((Date.parse(match[1]+'T00:00:00Z')-day)/86400000):null;
    return {...r,deadlineOrder:valid?stamp:Infinity,deadlineDays:days,deadlineDate:valid?match[1]:null,deadlineTime:valid?match[2]:null};
  }).sort((a,b)=>a.deadlineOrder-b.deadlineOrder||a.course.localeCompare(b.course)||a.title.localeCompare(b.title));
}
export function recommendPlans(data, calendar, now=new Date(), budget, preferredId) {
  const today=data.date, current=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
  const used=data.plans.filter(p=>p.date===today&&!p.activity).reduce((n,p)=>n+minutes(p.e)-minutes(p.s),0);
  let left=Math.max(0,Math.min(Number(data.profile.dailyCap||4)*60-used,budget||Infinity));
  const priorities=data.exams.filter(e=>e.written&&e.kind==='중간').map(e=>data.courses.find(c=>c.id===e.courseId)).filter(Boolean);
  const others=data.courses.filter(c=>!['NONE','SUBMIT'].includes(c.typeA)&&c.name!=='사회봉사');
  const candidates=[...new Map([...(data.examMode?priorities:[...priorities,...others])].map(c=>[c.id,c])).values()].filter(c=>!preferredId||c.id===preferredId);
  const result=[];
  for(const c of candidates){
    if(data.plans.some(p=>p.date===today&&p.courseId===c.id&&p.kind==='시험 대비'))continue;
    const exam=data.exams.find(e=>e.courseId===c.id&&e.written);
    const unresolved=data.sessions.filter(s=>s.courseId===c.id&&!s.reviewed&&s.progress&&s.date<=today).sort((a,b)=>a.date.localeCompare(b.date))[0];
    const range=exam?.scope||unresolved?.progress||'확보된 수업 자료';
    const note=`${range} · ${exam?'과제·예제 답지 없이 풀기 → 오답 확인':'수업 내용 복습·직접 확인'}`;
    result.push({courseId:c.id,course:c.name,date:today,kind:exam?'시험 대비':'복습',note,reason:exam?`${ddayLabel(exam.dday)} · 시험 가까운 순`:unresolved?'미복습 회차':'수업 자료 확인',duration:budget&&budget<45?Math.max(5,budget):45});
  }
  if(!calendar?.verified){const preview=[];for(const p of result){if(left<p.duration)break;preview.push({...p,unscheduled:true});left-=p.duration;if(preview.length===3)break;}return preview;}
  const blocks=[...data.scheduled.filter(x=>!x.record?.cancelled).map(x=>({s:x.s,e:x.e})),...data.plans.filter(p=>p.date===today),...(calendar.events||[]).filter(e=>!e.allDay&&e.start&&e.end).map(e=>({s:e.start,e:e.end}))].sort((a,b)=>minutes(a.s)-minutes(b.s));
  let cursor=Math.max(480,minutes(current)+5), end=1380, gaps=[];
  for(const b of blocks){const start=minutes(b.s),stop=minutes(b.e);if(start>cursor)gaps.push([cursor,Math.min(start,end)]);cursor=Math.max(cursor,stop);}
  if(cursor<end)gaps.push([cursor,end]);
  const planned=[];
  for(const candidate of result){
    if(left<candidate.duration)break;
    const gap=gaps.find(g=>g[1]-g[0]>=candidate.duration);
    if(!gap)break;
    planned.push({...candidate,s:hm(gap[0]),e:hm(gap[0]+candidate.duration)});
    gap[0]+=candidate.duration+10;left-=candidate.duration;
  }
  return planned.slice(0,3);
}

const ROOM={main:'lobby',learning:'class',materials:'library',progress:'library',attendance:'library',assignments:'homework',counsel:'counsel'};
const pct=x=>Math.round(x*100);
export function createWorkspace(app){
  let corridorSaeng=null, corridorGen=0;
  let data=null, calendar=null, assignments=null, assignmentError='', area='main', generation=0, navigation=0, consultBusy=false, proposal=[], filter='', kindFilter='', timer=null;
  const root=el('section',undefined,'workspace');root.id='workspace';document.getElementById('scene').append(root);
  const navIds=['mainArea','learningArea','progressArea','materialsArea','attendanceArea','assignmentArea','counselArea'];
  async function activate(which,token){
    corridorSaeng?.destroy();corridorSaeng=null;++corridorGen;
    await app.leave();
    if(token!==navigation)return false;
    area=which;
    for(const id of ['lobby','room','dialogue','progress','assignments','integratedWorkspace']){const e=document.getElementById(id);if(e)e.hidden=true;}
    root.hidden=false;document.getElementById('scene').className='scene workspace-scene';
    const school=document.querySelector('.school');school.dataset.mode='workspace';school.dataset.room=ROOM[which]||'lobby';
    const door={lobby:'mainArea',class:'learningArea',library:'materialsArea',homework:'assignmentArea',counsel:'counselArea'}[ROOM[which]];
    navIds.forEach(id=>document.getElementById(id)?.setAttribute('aria-pressed',String(id===door||id===({progress:'progressArea',attendance:'attendanceArea'})[which])));
    app.screen?.({room:which});return true;
  }
  async function refresh(){
    const token=++generation;
    const [fetched, homework]=await Promise.all([app.api('workspace'),app.api('assignments').then(value=>({value})).catch(error=>({error:error.message}))]);
    if(token!==generation)return;
    data=fetched;
    assignments=homework.value;assignmentError=homework.error||'';
    try{const r=await fetch(`/api/cal?from=${data.date}&to=${data.date}`,{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(5000)});const j=await r.json();if(token!==generation)return;calendar={verified:!!j.ok&&Object.hasOwn(j.days||{},data.date),events:j.days?.[data.date]||[]};}catch{calendar={verified:false,events:[]};}
    decorateDoors();
  }
  function decorateDoors(){
    for(const door of document.querySelectorAll('#courseDoors .door')){
      const name=door.querySelector('b')?.textContent,e=data.exams.find(e=>e.course===name&&e.kind==='중간'&&e.written);
      door.querySelector('.exam-chip')?.remove();if(e)door.append(el('span',`중간 중요 · ${ddayLabel(e.dday)}${e.assumed?' · 예정':''}`,'exam-chip'));
    }
  }
  async function open(which='main'){
    const token=++navigation;filter='';try{if(!await activate(which,token))return;}catch(error){app.status(error.message,true);return;}root.replaceChildren(el('p','불러오는 중…','loading'));
    try{await refresh();if(token!==navigation||area!==which)return;render();}catch(e){if(token===navigation)root.replaceChildren(el('p',e.message,'error'),btn('다시 불러오기',()=>open(which)));}
  }
  async function change(request){
    try{data=await app.api('workspace',{...request,termId:data.termId,revision:data.revision});render();return true;}catch(e){app.status(e.message,true);return false;}
  }
  function card(title,cls=''){const c=el('section',undefined,'workspace-card '+cls);if(title)c.append(el('h2',title));return c;}
  function render(){
    if(!data)return;
    if(area==='learning'){root.hidden=true;app.lobby();document.getElementById('studyOverview').hidden=true;decorateDoors();return;}
    root.replaceChildren();
    const session=app.session?.();
    if(session&&area!=='main')root.append(btn(`${session.course} · 수업 이어가기`,()=>app.resume(),'session-return'));
    if(area==='main')renderMain();
    else if(area==='counsel')renderCounsel();
    else if(area==='assignments'){root.hidden=true;app.assignments();}
    else renderManagement();
  }
  function examMetrics(){
    const written=data.exams.filter(e=>e.written&&e.kind==='중간'&&e.dday>=0).sort((a,b)=>a.dday-b.dday);
    const names=[...new Set([...written.map(e=>e.course),...(app.rooms?.()||[])])];
    return names.map(name=>{
      const exam=written.find(e=>e.course===name)||null;
      const course=app.catalog().courses.find(c=>c.name===name);
      if(!exam&&!course)return null;
      const events=(app.events?.()||[]).filter(x=>x.course===name);
      return {name,exam,m:courseMetrics({lessons:course?.lessons||[],events,exam,today:data.date})};
    }).filter(Boolean).sort((a,b)=>(a.exam?a.exam.dday:999)-(b.exam?b.exam.dday:999));
  }
  // 로비 = 복도 장면. 문 하나가 과목 하나, 문패가 진행판, 퀘스트 문이 빛난다. 문을 누르면 1인칭 교실로 들어간다.
  function renderCorridor(){
    const rows=examMetrics();
    const deadlines=pendingDeadlines(assignments?.rows||[],data.date);
    const quest=pickQuest(rows.filter(r=>r.exam),deadlines);
    const day=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short',timeZone:'Asia/Seoul'}).format(new Date(data.date+'T12:00:00+09:00'));
    const scene=el('section',undefined,'corridor');scene.setAttribute('aria-label','학교 복도');
    const backdrop=el('div',undefined,'corridor-backdrop');backdrop.setAttribute('aria-hidden','true');
    for(const x of [9,24,68,83]){const w=el('i',undefined,'corridor-window');w.style.left=x+'%';backdrop.append(w);}
    backdrop.append(el('i',undefined,'corridor-base'),el('i',undefined,'corridor-floor'));
    scene.append(backdrop);
    // HUD: 날짜 · 오늘 수업 · 첫 시험
    const hud=el('div',undefined,'corridor-hud');
    const chip=(label,value)=>{const c=el('div',undefined,'hud-chip');c.append(el('small',label),el('b',value));return c;};
    const classes=data.scheduled.filter(s=>!s.record?.cancelled).sort((a,b)=>a.s.localeCompare(b.s));
    const first=data.exams.filter(e=>e.written&&e.dday>=0).sort((a,b)=>a.dday-b.dday)[0];
    hud.append(chip('복도 · 1층',day),chip('오늘 수업',classes.length?classes.map(c=>`${c.s} ${c.course}`).join(' · '):(calendar?.verified?'없음':'확인 필요')),chip('첫 시험',first?`${ddayLabel(first.dday)} ${first.course}`:'없음'));
    // 퀘스트
    const q=el('div',undefined,'corridor-quest');
    const steps=el('ul');const step=(text,done)=>{const li=el('li',text);if(done)li.className='done';steps.append(li);};
    let primary,line,react,target=null;
    if(quest?.type==='assignment'){
      const t=quest.task;target=null;
      q.classList.add('is-deadline');q.append(el('small',`퀘스트 · ${t.deadlineDays?'내일':'오늘'} 마감`),el('b',`${t.course} ${t.title}`));
      step('풀이',t.workDone);step('제출',t.submitted);
      primary={label:t.workDone?'제출하러 과제실로':'과제 풀러 가기',go:()=>open('assignments')};
      line=`${t.course} ${t.title}, ${t.deadlineDays?'내일':'오늘'}${t.deadlineTime?' '+t.deadlineTime:''}까지예요. ${t.workDone?'제출만 남았어요.':'지금 같이 풀어요.'}`;react='deadline';target=t.course;
    }else if(quest){
      const {exam,m}=quest;q.append(el('small',`퀘스트 · 시험 ${ddayLabel(exam.dday)}`),el('b',`${exam.course} 준비도 올리기`));
      step(`수업 ${m.covered}/${m.scope}회차 풀기`,m.scope>0&&m.covered===m.scope);step(`혼자 맞히기 ${m.tested?pct(m.understanding)+'%':'아직'}`,m.tested>0&&m.understanding>=.8);
      primary={label:`${exam.course} 문제 풀기`,go:()=>practiceIn(exam.course)};
      line=`${exam.course}부터 가요. 시험 ${ddayLabel(exam.dday)}, 준비도 ${m.readiness}. ${m.remaining?`남은 수업 ${m.remaining}회차예요.`:'문제로 다지면 돼요.'}`;react='idle';target=exam.course;
    }else{q.append(el('small','퀘스트'),el('b','오늘은 급한 일이 없어요'));line='급한 건 없어요. 약한 과목부터 한 문제만 풀어요.';react='idle';}
    const walk=btn('',()=>walkTo(target||rows[0]?.name),'hud-walk');walk.setAttribute('aria-label','1인칭으로 걸어서 들어가기');walk.title='1인칭으로 걸어서 들어가기';walk.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="M9 22l2-7 3 3v6M7 12l3-4 4 1 2 4 3 1M10 8l-1 5"/></svg>';if(rows.length)hud.append(walk);
    // 대표실로 돌아가는 표지판 — A++O 주소 아래에서만(데모·GitHub Pages 판에는 대표실이 없다)
    if(officeHref()){const office=btn('',()=>{location.href=officeHref();},'hud-office');office.setAttribute('aria-label','대표실로 돌아가기');office.title='대표실로 돌아가기';office.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg><span>대표실</span>';hud.append(office);}
    q.append(steps);hud.append(q);scene.append(hud);
    // 문
    const doors=el('div',undefined,'corridor-doors');
    for(const {name:course,exam:e,m} of rows){
      const when=e?ddayLabel(e.dday)+(e.assumed?' 예정':''):'시험 없음';
      const d=el('button',undefined,'corridor-door pace-'+m.pace+(course===target?' is-target':'')+(e?.assumed?' is-assumed':''));d.type='button';
      d.setAttribute('aria-label',`${course} · 시험 범위 문제 풀기 · A+ 준비도 ${m.readiness} · ${when}`);d.title=`${course} 문제 풀기`;d.onclick=()=>practiceIn(course);
      if(course===target)d.append(el('span',quest?.type==='assignment'?'오늘 할 일':'지금 여기','door-marker'));
      const plate=el('span',undefined,'door-plate'),name=el('span',undefined,'door-name');name.append(el('b',course),el('em',when));
      const bar=el('span',undefined,'door-bar'),fill=el('i');fill.style.width=Math.max(2,pct(m.progress))+'%';bar.append(fill);
      const nums=el('span',undefined,'door-nums');nums.append(el('span',`진도 ${m.covered}/${m.scope}`),el('span',`정답 ${m.tested?pct(m.accuracy)+'%':'—'}`),el('span',`이해 ${m.tested?pct(m.understanding)+'%':'—'}`));
      // 남은 기간 대비 진도: 시험까지 하루에 몇 회차를 풀어야 하는지(숫자로)
      // 하루 1회차 이상 필요할 때만 「하루 N회차」, 여유 있으면 「N회차 남음」(0.2회차 같은 숫자는 읽기 어렵다)
      if(e&&m.remaining>0)nums.append(el('span',m.daysLeft<=0?'시험 오늘':m.perDay>=1?`하루 ${Math.ceil(m.perDay)}`:`남음 ${m.remaining}`,'door-pace'));   // 「이름 값」 순서(문 숫자는 위 이름·아래 값 두 줄)
      plate.append(name,bar,nums);
      const frame=el('span',undefined,'door-frame');frame.append(el('i',undefined,'door-pane'),el('i',undefined,'door-knob'));
      const score=el('span',undefined,'door-score');score.style.setProperty('--s',m.readiness);score.append(el('b',String(m.readiness)),el('small','A+ 준비도'));
      d.append(plate,frame,score);doors.append(d);
    }
    if(!rows.length)doors.append(el('p','등록된 과목 교실이 없어요.','corridor-empty'));
    scene.append(doors);
    const left=btn('← 자료실',()=>open('materials'),'corridor-sign sign-library'),right=btn(`과제실 · ${deadlines.filter(r=>r.deadlineDays!==null&&r.deadlineDays>=0).length}건 →`,()=>open('assignments'),'corridor-sign sign-homework');
    scene.append(left,right);

    // 스앵님 + 대사창
    const face=el('div',undefined,'corridor-saeng');face.append(Object.assign(el('img'),{src:'../docs/demo/saeng/layers2/base.png',alt:''}));   /* 정지 그림도 강의실과 같은 웹툰 그림체(10/9), 움직이는 그림은 아래 attachSaeng 하나만 */
    scene.append(face);
    corridorSaeng?.destroy();corridorSaeng=null;const gen=++corridorGen;
    attachSaeng(face).then(s=>{if(!s)return;if(gen!==corridorGen||!face.isConnected){s.destroy();return;}corridorSaeng=s;s.react(react);s.speak(line);});
    const vn=el('div',undefined,'corridor-vn');vn.setAttribute('role','dialog');vn.setAttribute('aria-label','김주영 스앵님');
    const choices=el('div',undefined,'vn-choices');
    if(primary)choices.append(btn(primary.label,primary.go,'primary'));
    const alt=rows.filter(r=>r.exam&&r.name!==target).sort((a,b)=>(100-b.m.readiness)/Math.max(b.exam.dday,1)-(100-a.m.readiness)/Math.max(a.exam.dday,1))[0];
    if(alt)choices.append(btn(`${alt.name} 먼저 할래요`,()=>practiceIn(alt.name)));
    choices.append(btn('오늘 계획 다시 짜줘요',()=>{const box=root.querySelector('.main-tutor textarea');if(box){box.value='오늘 계획 다시 잡아줘';box.scrollIntoView({block:'center'});box.focus();}}));
    vn.append(el('span','김주영','vn-tag'),el('p',line,'vn-line'),choices);
    scene.append(vn);
    root.append(scene);
    const info=el('details',undefined,'ready-info');info.append(el('summary','ⓘ 숫자 읽는 법'),el('p','문 가운데 숫자 = A+ 준비도 = 진도 × (이해도 50 + 정답률 30 + 20). 진도 = 시험 전 회차 중 문제를 푼 회차 비율, 정답 = 맞힌 문항 비율, 이해도 = 혼자 맞힌 문항 비율, 「남음」 = 시험 전까지 아직 안 푼 회차 수, 「하루」 = 하루에 1회차 이상 풀어야 할 만큼 급할 때 하루 몫, 「시험 오늘」 = 오늘이 시험일. 잊는 정도와 교수님이 정한 범위 문장은 아직 반영하지 않아요. 성적 예측이 아니에요.'));
    root.append(info);
  }
  function walkTo(course){
    return app.walk?app.walk(course):startCourse(course);
  }
  function practiceIn(course){
    return app.practice?app.practice(course):startCourse(course);
  }
  // 메인 = 위 요약 한 줄(시험 D-day·남은 회차) + 공부 계획(plan.js — 예전 관제탑 공부계획 기능을 학교 화면으로 다시 만든 것, 대표님 10/9).
  let routine=null;
  async function loadRoutine(){
    if(routine)return routine;
    for(const u of ['/api/routine','../knowledge/routine-week.json']){try{const r=await fetch(u,{credentials:'same-origin',cache:'no-store'});if(r.ok){const j=await r.json();routine=j.routine||j;if(routine?.grid)return routine;}}catch{}}
    return routine={grid:{},holidays:[]};
  }
  function renderDashboard(){
    const rows=examMetrics(), top=el('div',undefined,'db-strip');
    const exams=rows.filter(r=>r.exam&&inFocus(r.name));   // 집중 4과목만(focus.js)
    for(const r of exams){const b=btn('',()=>startCourse(r.name),'db-chip'+(r.exam.dday<=3?' soon':''));b.append(el('strong',ddayLabel(r.exam.dday)),el('span',r.name),el('small',`${r.m.remaining}회차 남음`));b.title=`${r.name} · ${r.exam.date}${r.exam.time?' '+r.exam.time:''} · 준비도 ${r.m.readiness}`;top.append(b);}
    if(!exams.length)top.append(el('p','등록된 시험이 없어요.','db-empty'));
    const host=el('div',undefined,'db-plan');root.append(top,host);
    const deadlines=assignments?pendingDeadlines(assignments.rows||[],data.date):[];
    loadRoutine().then(rt=>{if(!host.isConnected)return;app.plan?.render(host,{today:data.date,courses:focusCourses().filter(n=>data.courses.some(c=>c.name===n)),focus:inFocus,inClass:isInClass,scheduled:data.scheduled,classSlots:data.courses.filter(c=>Array.isArray(c.slots)),holidays:Array.isArray(data.holidays)?data.holidays:null,term:data.term||null,sessions:data.sessions||[],plans:data.plans,deadlines,calendar:calendar?.events||[],calendarOk:!!calendar?.verified,reload:()=>open('main'),routine:rt,courseName:id=>data.courses.find(c=>c.id===id)?.name||'',courseId:name=>data.courses.find(c=>c.name===name)?.id,exams:data.exams.filter(e=>e.written&&inFocus(e.course)&&e.date>=data.date).map(e=>({course:e.course,date:e.date,time:e.time||'',assumed:!!e.assumed})),addPlan:(item,many)=>change({op:'plan-add',plans:many?item:[item]}),dailyCap:Number(data.profile?.dailyCap)||4,updatePlan:item=>change({op:'plan-update',plan:item}),deletePlan:id=>change({op:'plan-delete',id}),attend:(courseId,date,status)=>change({op:'attendance',courseId,date,status}),calChange:async({ev,date,start,end})=>{/* 구글 캘린더 시각 바꾸기(대표님 10/9): 그날 캘린더를 새로 읽고 → 최신 원본 버전으로 변경 대기열에 넣는다. 원본이 바뀌었으면 서버가 409 로 막음 */
  try{const j=(u)=>fetch(u,{credentials:'same-origin',cache:'no-store'}).then(r=>r.json());await j(`/api/cal?from=${date}&to=${date}&force=1`);const cx=await j(`/api/aliveweek/context?from=${date}&to=${date}`);
    const cur=(cx.calendar?.[date]||[]).find(e=>e.id===ev.id);if(!cur){app.status('원본 일정을 다시 찾지 못했어요. 잠시 뒤 다시 해 주세요.',true);return false;}
    const body={operationId:crypto.randomUUID(),action:'reschedule',source:'calendar',calendarId:cur.calendarId||cur.cal,eventId:cur.id,date,after:{title:cur.title||'',location:cur.location||'',start:`${date}T${start}:00+09:00`,end:`${date}T${end}:00+09:00`},expectedSourceVersion:cur.sourceVersion};
    const w=await fetch('/api/aliveweek/changes',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const x=await w.json().catch(()=>({}));
    if(!w.ok){app.status(x.error||`캘린더를 바꾸지 못했어요(${w.status})`,true);return false;}
    app.status('구글 캘린더에 반영하는 중이에요. 잠시 뒤 시간표에 보여요.');return true;}catch(e){app.status('캘린더를 바꾸지 못했어요. '+(e.message||''),true);return false;}}});});
  }
  // 상담실(대표님 10/9): 김주영 스앵님과 면담하며 학습자료 고치기·시험 범위·일정·공부 계획을 조율하는 공간.
  // 대화는 상담 모드(coach consultation, 서버에 상담 기록), 진단·계획 세우기는 기존 상담 흐름(app.consult)을 그대로.
  function renderCounsel(){
    const room=el('div',undefined,'counsel-room'),side=el('div',undefined,'counsel-side'),main=el('div',undefined,'counsel-main');
    const face=el('div',undefined,'counsel-face');side.append(face,el('b','김주영 스앵님','counsel-name'),el('p','시험·자료·계획, 뭐든 같이 정해요.','counsel-sub'));
    const rig=app.rig?.(face);rig?.setExpr('smile');
    const topics=el('div',undefined,'counsel-topics');topics.setAttribute('aria-label','상담 주제');
    const log=el('div',undefined,'counsel-log');log.setAttribute('aria-live','polite');
    const form=el('form',undefined,'counsel-form'),input=el('textarea');input.rows=2;input.maxLength=1500;input.placeholder='예) 정역학 9/21 강의 설명이 너무 짧아요 · 공수1 시험 범위가 바뀌었어요';input.setAttribute('aria-label','스앵님께 말하기');
    const send=btn('보내기',()=>{},'primary');send.type='submit';form.append(input,send);
    for(const [label,text] of [['학습자료 고치기','이 강의 자료에서 고쳐야 할 부분이 있어요: '],['시험 범위·일정','시험 범위·일정을 다시 맞춰요: '],['공부 계획 조정','오늘·이번 주 공부 계획을 조정하고 싶어요: '],['오늘 상태','오늘 컨디션이랑 쓸 수 있는 시간은요: ']]){
      topics.append(btn(label,()=>{input.value=text;input.focus();input.setSelectionRange(text.length,text.length);},'counsel-topic'));}
    const msg=(me,t)=>{const m=el('div',t,'counsel-msg '+(me?'from-me':'from-saeng'));   /* 'saeng' 클래스는 saeng.js 초상 규칙(aspect-ratio)과 겹침 */log.append(m);log.scrollTop=log.scrollHeight;return m;};
    for(const e of (app.history?.()||[]).slice(-12)){msg(true,e.question);msg(false,e.answer);}
    if(!log.children.length)msg(false,'어서 와요. 고치고 싶은 자료나 바뀐 시험 범위, 계획 이야기 뭐든 말해 줘요.');
    let busy=false;
    form.onsubmit=async e=>{e.preventDefault();const q=input.value.trim();if(!q||busy)return;busy=true;send.disabled=true;input.value='';msg(true,q);const wait=msg(false,'음… 확인해 볼게요.');rig?.setExpr('think');
      try{const r=await app.api('coach',{course:'',question:q,mode:'consultation',id:crypto.randomUUID()});wait.textContent=String(r?.answer||'').trim()||'지금은 답을 정리하지 못했어요.';rig?.speak(wait.textContent);rig?.setExpr('smile');}
      catch(err){wait.textContent='지금은 답을 못 가져왔어요. '+(err?.message||'');rig?.setExpr('sad');}
      finally{busy=false;send.disabled=false;}};
    const tools=el('div',undefined,'counsel-tools');
    tools.append(btn('진단하고 오늘 계획 세우기',()=>app.consult?.(),'counsel-tool'),btn('공부 계획 열기',()=>app.integrated?.('공부 계획','plan',{area:'learningArea'}),'counsel-tool'),btn('과제실',()=>open('assignments'),'counsel-tool'),btn('자료실',()=>open('materials'),'counsel-tool'));
    main.append(el('h1','상담실','counsel-title'),topics,log,form,tools);room.append(side,main);root.append(room);
    new MutationObserver((_,o)=>{if(!room.isConnected){rig?.destroy();o.disconnect();}}).observe(root,{childList:true});
  }
  function renderMain(){
    renderDashboard();
    if(true)return;   // 옛 복도 화면(renderCorridor)·상담 카드는 대시보드로 대체(10/9). 아래는 되돌릴 때를 위해 남김
    renderCorridor();
    const written=data.exams.filter(e=>e.written&&e.kind==='중간');
    const exams=card('','exam-board other-exams');
    const other=el('details');other.append(el('summary','발표·과제 대체 및 다른 시험'));
    for(const e of data.exams.filter(e=>!written.includes(e)))other.append(el('p',`${e.course} · ${e.kind} · ${ddayLabel(e.dday)} · ${e.date}${e.assumed?' · 예정':''} · ${e.written?'시험':'발표·과제 대체'}`));if(other.children.length>1){exams.append(other);root.append(exams);}
    renderDeadlines();
    const columns=el('div',undefined,'dashboard-columns'),plan=card('오늘 공부 계획','day-plan'),tutor=card('김주영 스앵님','main-tutor');
    renderPlans(plan);renderTutor(tutor);columns.append(tutor,plan);root.append(columns);
  }
  function renderChecks(){
    const checks=card('확인할 기록','checks');
    const unconfirmed=data.scheduled.filter(s=>!s.record?.status&&!s.record?.cancelled&&minutes(s.e)<=minutes(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())));
    checks.append(el('p',`오늘 출결 미확인 ${unconfirmed.length}회 · 수업 범위 후보 ${data.candidates.length}건`));
    checks.append(btn('출결 확인',()=>open('attendance')),btn('수업 범위 확인',()=>open('progress')),btn('자료 관리',()=>open('materials')));
    const sync=data.sync;checks.append(el('small',`자료 색인 ${sync.at?new Date(sync.at*1000).toLocaleString('ko-KR'):'대기 중'} · ${sync.error?'수집 실패: '+sync.error:'로컬 자료 자동 확인 10분 주기'} · LMS ${sync.lmsAt?new Date(sync.lmsAt*1000).toLocaleString('ko-KR'):'동기화 시각 확인 필요'}`));
    checks.append(btn('자료 색인 동기화',async()=>{data=await app.api('sync',{});render();}));root.append(checks);
  }
  function renderDeadlines(){
    const host=card('과제 제출 마감','deadline-board');
    if(!assignments){host.append(el('p',assignmentError||'과제 마감을 불러오지 못했습니다.','error'),btn('다시 불러오기',()=>open('main')));root.append(host);return;}
    const rows=pendingDeadlines(assignments.rows||[],data.date);
    const visible=rows.filter(r=>!hiddenDeadline(r)),hidden=rows.filter(hiddenDeadline);
    const upcoming=visible.filter(r=>r.deadlineDays!==null&&r.deadlineDays>=0),past=visible.filter(r=>r.deadlineDays!==null&&r.deadlineDays<0),unknown=visible.filter(r=>r.deadlineDays===null);
    if(!rows.length)host.append(el('p','제출 전인 과제가 없습니다.','deadline-empty'));
    else if(!upcoming.length)host.append(el('p','오늘 이후 마감이 확인된 제출 전 과제가 없습니다.','deadline-empty'));
    function taskRow(task){
      const days=task.deadlineDays,overdue=days!==null&&days<0;
      const row=el('div',undefined,'deadline-row'+(overdue?' overdue':days!==null&&days<=3?' urgent':'')),detail=el('button',undefined,'deadline-open');detail.type='button';
      const badge=days===null?'마감 미확인':overdue?`${-days}일 지남`:days===0?'오늘 마감':`D-${days}`;
      const body=el('span',undefined,'deadline-body');body.append(el('b',task.title),el('small',`${task.course} · ${task.deadlineDate?task.deadlineDate+(task.deadlineTime?' '+task.deadlineTime:' · 시간 미확인'):task.due||'마감 확인 필요'}`));
      detail.append(el('strong',badge,'deadline-badge'),body,el('span',task.workDone?'풀이 완료 · 제출 전':'제출 전','deadline-state'));detail.onclick=()=>open('assignments');row.append(detail);
      if(task.hiddenFromMain&&days===0)body.append(el('small','숨겨둔 과제 · 오늘 제출일이라 다시 표시','submission-today'));
      if(task.workDone&&days!==0)row.append(btn(hiddenDeadline(task)?'다시 표시':'메인에서 숨김',async()=>{
        try{const saved=await app.api('assignment-status',{id:task.id,field:'hiddenFromMain',value:!hiddenDeadline(task)});Object.assign(assignments.rows.find(r=>r.id===task.id),saved);render();app.status(saved.hiddenFromMain?'메인에서 숨겼습니다. 제출 마감 당일에는 다시 표시합니다.':'메인에 다시 표시했습니다.');}catch(error){app.status(error.message,true);}
      },'deadline-toggle'));
      return row;
    }
    const today=upcoming.filter(r=>r.deadlineDays===0),later=upcoming.filter(r=>r.deadlineDays>0);
    if(today.length)host.append(el('h3','오늘 제출','submission-today-title'));
    for(const task of [...today,...later.slice(0,3)])host.append(taskRow(task));
    for(const [label,group] of [['지난 마감 · 제출 확인',past],['마감 미확인',unknown]])if(group.length){const detail=el('details',undefined,'deadline-history');detail.append(el('summary',`${label} · ${group.length}건`));for(const task of group)detail.append(taskRow(task));host.append(detail);}
    if(hidden.length){const detail=el('details',undefined,'deadline-history');detail.append(el('summary',`숨긴 과제 · ${hidden.length}건 · 마감 당일 다시 표시`));for(const task of hidden)detail.append(taskRow(task));host.append(detail);}
    host.append(btn(`과제 전체 보기${rows.length?' · 제출 전 '+rows.length+'건':''}`,()=>open('assignments'),'subtle'));root.append(host);
  }
  function renderPlans(host){
    const plans=data.plans.filter(p=>p.date===data.date&&!p.activity).sort((a,b)=>a.s.localeCompare(b.s));
    const total=plans.reduce((n,p)=>n+minutes(p.e)-minutes(p.s),0),done=plans.filter(p=>p.done).reduce((n,p)=>n+minutes(p.e)-minutes(p.s),0);
    host.append(el('p',`${plans.length}개 계획 · ${done}/${total}분 완료`,'plan-summary'));
    if(!plans.length)host.append(el('p','오늘 계획이 없습니다. 스앵님과 오늘 상황을 보고 정해보세요.','empty-state'));
    for(const p of plans){const row=el('div',undefined,'plan-row'+(p.done?' done':'')),label=el('label'),check=el('input');check.type='checkbox';check.checked=!!p.done;check.setAttribute('aria-label',`${p.note} 완료`);check.onchange=async()=>{check.disabled=true;if(!await change({op:'plan-done',id:p.id,done:check.checked})){check.checked=!check.checked;check.disabled=false;}};label.append(check,el('span',`${p.s}–${p.e}`));const body=el('div');body.append(el('b',data.courses.find(c=>c.id===p.courseId)?.name||'공부'),el('p',p.note));row.append(label,body,btn('시작',()=>p.lessonId?app.start(p.lessonId,{purpose:'tutoring'}):startCourse(data.courses.find(c=>c.id===p.courseId)?.name,p)),btn('수정',()=>editPlan(p)));host.append(row);}
    host.append(btn('계획 추가',()=>editPlan(), 'subtle'));
  }

  function editPlan(p={},preview=false,onChange=()=>{}){
    const host=app.panel(p.id?'공부 계획 수정':'오늘 계획 추가'),form=el('form'),select=el('select');
    for(const c of data.courses.filter(c=>c.name!=='사회봉사')){const o=el('option',c.name);o.value=c.id;select.append(o);}select.value=p.courseId||select.options[0]?.value;
    const fields={};for(const [key,label,type,value] of [['date','날짜','date',p.date||data.date],['s','시작','time',p.s||'19:00'],['e','종료','time',p.e||'19:45'],['note','할 일','text',p.note||'']]){const l=el('label',label),i=el('input');i.type=type;i.value=value;i.required=true;if(key==='note')i.maxLength=1200;l.append(i);fields[key]=i;form.append(l);}
    form.prepend(select);const message=el('p',''),save=btn('저장',()=>{},'primary');save.type='submit';form.append(message,save);host.append(form);
    form.onsubmit=async e=>{e.preventDefault();save.disabled=true;const item={...p,courseId:select.value,kind:p.kind||'시험 대비'};for(const k in fields)item[k]=fields[k].value;if(preview){if(item.e<=item.s){message.textContent='종료 시간을 시작보다 늦게 정해주세요.';save.disabled=false;return;}Object.assign(p,item,{course:data.courses.find(c=>c.id===item.courseId)?.name,unscheduled:false});onChange();app.close();return;}const ok=await change(p.id?{op:'plan-update',plan:item}:{op:'plan-add',plans:[item]});if(ok)app.close();else{save.disabled=false;message.textContent='저장하지 못했습니다. 시간 충돌 또는 최신 기록을 확인해주세요.';}};
  }
  function renderTutor(host){
    app.tutorPlan(host,data,()=>open('main'));
  }
  function startCourse(name, plan){
    const c=app.catalog().courses.find(c=>c.name===name);if(!c)return;
    const modal=app.panel(`${name} · 수업 선택`);modal.append(el('p',data.exams.find(e=>e.course===name)?.scope||c.strategy,'mission-goal'));
    const controls=el('div',undefined,'mission-modes');controls.append(el('span','지금 풀이 방식'));
    for(const [mode,label] of [['pencil','펜슬'],['notebook','공책'],['screen','화면만']])controls.append(btn(label,()=>{app.mode(mode);controls.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===label)));}));modal.append(controls);
    if(plan)modal.append(btn('기록하는 공부 타이머 열기',()=>startTimer(plan), 'subtle'));
    const units=(c.nodes||[]).filter(n=>/전공/.test(n.level||'')||n.subject===name).slice();
    const recent=c.lessons.filter(l=>l.date<=data.date).slice().reverse();
    for(const l of recent.slice(0,4))modal.append(btn(`스앵님과 수업 · ${l.date} ${l.title}`,()=>{root.hidden=true;app.start(l.id,{purpose:"tutoring"});},'mission-launch'));
    const concepts=el('details');concepts.append(el('summary','개념 미션·기초부터 공부'));
    for(const n of units.slice(0,16)){const row=el('div',undefined,'concept-mission');row.append(el('span',n.name),btn('문제 도전',()=>{root.hidden=true;app.start('node:'+n.id,{purpose:'exam'});}),btn('개념부터',()=>{root.hidden=true;app.start('node:'+n.id,{concept:true});}));concepts.append(row);}modal.append(concepts);
    for(const l of recent.slice(0,2))modal.append(btn(`시험 확인 문제 · ${l.date}`,()=>app.start(l.id,{purpose:'exam'})));
    modal.append(btn('오늘 공부·타이머·복습 기록',()=>app.integrated('오늘 공부','today')));
    modal.append(btn('개인 공부·공부 계획',()=>app.integrated('개인 공부','study')));
    modal.append(btn('모든 수업·암기노트·개념지도·혼자풀기',()=>app.course(name)));
  }
  function startTimer(plan){ app.integrated('공부 타이머·학습 기록','today',{course:plan.courseId}); }
  function renderManagement(){
    const title={progress:'자료실 · 수업 범위',materials:'자료실',attendance:'자료실 · 출결'}[area];root.append(el('h1',title));
    const tools=el('div',undefined,'management-tools'),select=el('select');select.setAttribute('aria-label','과목 선택');select.append(Object.assign(el('option','모든 과목'),{value:''}));for(const c of data.courses){const o=el('option',c.name);o.value=c.name;select.append(o);}select.value=filter;select.onchange=()=>{filter=select.value;render();};tools.append(select,btn('새로 불러오기',()=>open(area)),btn('시간표',()=>app.integrated('시간표','cal',{mode:'week'})),btn('성적·학점',()=>app.integrated('성적·학점','grade')));root.append(tools);
    if(area==='materials'){renderMaterials();renderChecks();}else if(area==='attendance')renderAttendance();else renderProgress();
  }
  // 자료실 맨 위 = 과목별 묶음(대표님 10/9 「과목별로 나눠놓은 구성은 자료실로」). 카드를 누르면 그 과목 모든 수업·암기노트·혼자풀기
  function renderCourseShelf(){
    const shelf=card('과목별','course-shelf'),grid=el('div',undefined,'shelf-grid');
    for(const c of app.catalog().courses){
      const exam=data.exams.find(e=>e.course===c.name&&e.written&&e.dday>=0);
      const b=btn('',()=>app.course(c.name),'shelf-card');b.append(el('b',c.name),el('small',`${c.lessons.length}회 수업${exam?' · '+ddayLabel(exam.dday):''}`));grid.append(b);
    }
    shelf.append(grid);root.append(shelf);
  }
  function renderMaterials(){
    if(!filter)renderCourseShelf();
    const sources=data.sources.filter(s=>!filter||s.course===filter).map(s=>{const k=sourceKind(s);return {...s,cls:k.kind,sure:k.sure};});
    const lmsItems=(data.lmsMaterials||[]).filter(i=>!filter||i.course===filter).map(i=>({...i,cls:sourceKind({...i,lms:true}).kind,sure:true}));
    const homework=(assignments?.rows||[]).filter(r=>!filter||r.course===filter).flatMap(r=>(r.files||[]).map(f=>({course:r.course,title:r.title,file:f.label||f.file||f.href,href:f.href,cls:/혼자\s*풀기|스앵님|코칭/.test(f.label||'')?'tutor':'assignment',sure:true})));
    const all=[...sources,...lmsItems,...homework];
    const kinds=el('div',undefined,'kind-filter');kinds.setAttribute('role','group');kinds.setAttribute('aria-label','자료 종류');
    for(const [key,{label}] of [['',{label:'전체'}],...Object.entries(KINDS).sort((a,b)=>a[1].order-b[1].order)]){
      const n=key?all.filter(x=>x.cls===key).length:all.length;
      const b=btn(`${label} ${n}`,()=>{kindFilter=key;render();},'kind-chip'+(key?' kind-'+key:''));b.setAttribute('aria-pressed',String(kindFilter===key));kinds.append(b);
    }
    root.append(kinds);
    const show=x=>!kindFilter||x.cls===kindFilter;
    const badge=(c,sure=true)=>{const b=el('span',KINDS[c].label+(sure?'':' · 추정'),'kind-badge kind-'+c+(sure?'':' guessed'));if(!sure)b.title='파일 이름으로 짐작한 분류예요.';return b;};
    const items=sources.filter(show),by=new Map();for(const s of items){const key=s.course+' · '+s.date;if(!by.has(key))by.set(key,[]);by.get(key).push(s);}
    root.append(btn('전체 교재·자료실',()=>app.library()),btn('수업자료 색인 갱신',async()=>{data=await app.api('sync',{});render();}));
    const lmsShown=lmsItems.filter(show);
    if(lmsShown.length){const lms=el('details',undefined,'material-group');lms.append(el('summary',`LMS 강의자료·영상 · ${lmsShown.length}개`));for(const item of lmsShown){const row=el('div',undefined,'material-row'),a=el('a',`${item.course||item.lmsCourse+' · 과목 연결 확인 필요'} · ${item.module} · ${item.title}`);a.href=item.url;a.target='_blank';a.rel='noopener';row.append(badge(item.cls),a);lms.append(row);}root.append(lms);}
    const hwShown=homework.filter(show);
    if(hwShown.length){const hw=el('details',undefined,'material-group');hw.append(el('summary',`과제 파일 · ${hwShown.length}개`));for(const f of hwShown){const row=el('div',undefined,'material-row');row.append(badge(f.cls),el('span',`${f.course} · ${f.title} · ${f.file}`));if(f.href){const a=el('a','열기');a.href='../'+f.href;a.target='_blank';a.rel='noopener';row.append(a);}hw.append(row);}root.append(hw);}
    for(const [key,files] of [...by].reverse()){const group=el('details',undefined,'material-group');group.append(el('summary',`${key} · ${files.length}개`));for(const f of files){const row=el('div',undefined,'material-row');row.append(badge(f.cls,f.sure),el('span',f.file),el('small',({summary:'정리본',photo:'사진·필기',recording:'녹음·텍스트',material:'수업자료'})[f.kind]||''));const a=el('a','열기');a.href=f.href?'../'+f.href:'/api/school/source-file?id='+f.id;a.target='_blank';a.rel='noopener';a.onclick=()=>app.record({kind:'review',course:f.course,action:'material-opened',sourceId:f.id,date:f.date});row.append(a,btn('수업 연결',()=>linkSource(f)));if(f.candidate)row.append(el('small','범위 후보: '+f.candidate));group.append(row);}root.append(group);}
    if(!all.filter(show).length)root.append(el('p','이 종류의 자료가 아직 없습니다.'));
  }
  function linkSource(source){const host=app.panel('자료의 수업 회차 연결'),select=el('select'),day=el('input');day.type='date';day.value=source.date;for(const c of data.courses){const o=el('option',c.name);o.value=c.id;select.append(o);}select.value=data.courses.find(c=>c.name===source.course)?.id||data.courses[0]?.id;host.append(el('p',source.file),select,day,btn('이 회차로 연결',async()=>{if(await change({op:'source-link',sourceId:source.id,courseId:select.value,date:day.value}))app.close();},'primary'));}
  function renderAttendance(){
    root.append(el('p',data.attendanceNotice));
    const schedule=(data.expected||data.scheduled).filter(s=>!filter||s.course===filter).sort((a,b)=>b.date.localeCompare(a.date)||a.s.localeCompare(b.s)),past=data.sessions.filter(s=>s.date<=data.date&&(!filter||data.courses.find(c=>c.id===s.courseId)?.name===filter)).sort((a,b)=>b.date.localeCompare(a.date));
    const rows=[...schedule.map(s=>({...s.record,courseId:s.courseId,date:s.date,course:s.course,time:`${s.s}–${s.e}`})),...past.filter(s=>!schedule.some(x=>x.courseId===s.courseId&&x.date===s.date)).map(s=>({...s,course:data.courses.find(c=>c.id===s.courseId)?.name}))];
    for(const s of rows){const row=card(`${s.course} · ${s.date}${s.time?' · '+s.time:''}`,'attendance-row');row.append(el('small',s.attendanceSource||'기존 수업 기록'));const select=el('select');select.setAttribute('aria-label',`${s.course} ${s.date} 출결`);for(const [value,label] of [['unknown','미확인'],['present','출석'],['late','지각'],['absent','결석'],['excused','공결'],['cancelled','휴강']])select.append(Object.assign(el('option',label),{value}));select.value=s.cancelled?'cancelled':s.status||'unknown';row.append(select,btn('출결 확인·저장',()=>change({op:'attendance',courseId:s.courseId,date:s.date,status:select.value})));root.append(row);}
  }
  function renderProgress(){
    root.append(el('p','수업에서 나간 범위와 내가 직접 공부한 증거를 구분해 봅니다. 읽음은 이해 완료가 아닙니다.'));
    for(const c of data.courses.filter(c=>c.name!=='사회봉사'&&(!filter||c.name===filter))){
      const group=card(c.name,'progress-course'),evidence=app.evidence(c.name);group.append(el('p',`확인 문제 ${evidence.tested} · 독립 해결 ${evidence.independent} · 도움 사용 ${evidence.assisted} · 재도전 ${evidence.retry}`));
      const rows=data.sessions.filter(s=>s.courseId===c.id).sort((a,b)=>b.date.localeCompare(a.date));
      for(const s of rows.slice(0,10)){const row=el('div',undefined,'progress-row'),input=el('input');input.value=s.progress||'';input.placeholder='수업 범위 확인 필요';input.maxLength=1500;input.setAttribute('aria-label',`${c.name} ${s.date} 수업 범위`);row.append(el('b',s.date),input,el('small',s.progressSource||'기존 수업 기록'),el('span',s.reviewed?'기존 복습 확인':'복습 확인 필요'),btn('범위 저장',()=>change({op:'progress',courseId:c.id,date:s.date,progress:input.value})));group.append(row);}
      for(const item of data.candidates.filter(i=>i.course===c.name).slice(0,6)){const row=el('div',undefined,'range-candidate');row.append(el('b',`${item.date} · 자동 범위 후보`),el('p',item.candidate),el('small',item.evidence),btn('검토·확정',()=>{const host=app.panel('수업 범위 확인'),input=el('textarea');input.value=item.candidate;host.append(el('p',item.evidence),input,btn('이 범위로 확정',async()=>{if(await change({op:'progress',courseId:c.id,date:item.date,progress:input.value,sourceId:item.id}))app.close();},'primary'));}));group.append(row);}
      group.append(btn('이 과목 공부하기',()=>startCourse(c.name)),btn('전체 회차·기존 기록',()=>app.integrated(c.name+' · 회차 관리','course',{course:c.name})));root.append(group);
    }
  }
  window.addEventListener('focus',()=>{if(data&&!document.querySelector('.school').dataset.booting&&area==='main'&&!root.hidden&&!consultBusy&&!root.querySelector('textarea')?.value.trim()&&!root.querySelector('#mainMessages')?.children.length)open('main');});
  setInterval(()=>{const day=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date());if(data&&data.date!==day&&!root.hidden&&!consultBusy)open(area);},60000);
  return {open,startCourse,refresh,hide:()=>{root.hidden=true;++generation;++navigation;},get data(){return data;}};
}
