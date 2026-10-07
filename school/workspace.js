import { courseMetrics, sourceKind, pickQuest, KINDS } from "./metrics.js";
const el = (tag, text, cls) => { const e=document.createElement(tag); if(text!==undefined)e.textContent=text; if(cls)e.className=cls; return e; };
const btn = (text, action, cls='') => { const b=el('button',text,cls); b.type='button'; b.onclick=action; return b; };
const minutes = s => Number(s.slice(0,2))*60+Number(s.slice(3));
const hm = n => `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
export const ddayLabel = n => n===0?'D-day':`D-${n}`;
export const hiddenDeadline = task => !!(task.hiddenFromMain&&task.workDone&&task.deadlineDays!==0);
export function pendingDeadlines(rows, today) {
  const day=Date.parse(today+'T00:00:00Z');
  return rows.filter(r=>!r.submitted).map(r=>{
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

const ROOM={main:'lobby',learning:'class',materials:'library',progress:'library',attendance:'library',assignments:'homework'};
const pct=x=>Math.round(x*100);
function ring(value){
  const r=34,c=2*Math.PI*r,svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 84 84');svg.setAttribute('class','ready-ring');svg.setAttribute('aria-hidden','true');
  svg.innerHTML=`<circle cx="42" cy="42" r="${r}" class="ring-bg"/><circle cx="42" cy="42" r="${r}" class="ring-fg" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-value/100)}"/>`;
  return svg;
}
export function createWorkspace(app){
  let data=null, calendar=null, assignments=null, assignmentError='', area='main', generation=0, consultBusy=false, proposal=[], filter='', kindFilter='', timer=null;
  const root=el('section',undefined,'workspace');root.id='workspace';document.getElementById('scene').append(root);
  const navIds=['mainArea','learningArea','progressArea','materialsArea','attendanceArea','assignmentArea'];
  async function activate(which){
    await app.leave();
    area=which;
    for(const id of ['lobby','room','dialogue','progress','assignments','integratedWorkspace']){const e=document.getElementById(id);if(e)e.hidden=true;}
    root.hidden=false;document.getElementById('scene').className='scene workspace-scene';
    const school=document.querySelector('.school');school.dataset.mode='workspace';school.dataset.room=ROOM[which]||'lobby';
    const door={lobby:'mainArea',class:'learningArea',library:'materialsArea',homework:'assignmentArea'}[ROOM[which]];
    navIds.forEach(id=>document.getElementById(id)?.setAttribute('aria-pressed',String(id===door||id===({progress:'progressArea',attendance:'attendanceArea'})[which])));
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
    filter='';try{await activate(which);}catch(error){app.status(error.message,true);return;}root.replaceChildren(el('p','불러오는 중…','loading'));
    try{await refresh();if(area!==which)return;render();}catch(e){root.replaceChildren(el('p',e.message,'error'),btn('다시 불러오기',()=>open(which)));}
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
    else if(area==='assignments'){root.hidden=true;app.assignments();}
    else renderManagement();
  }
  function examMetrics(){
    const written=data.exams.filter(e=>e.written&&e.kind==='중간'&&e.dday>=0).sort((a,b)=>a.dday-b.dday);
    return written.map(e=>{
      const course=app.catalog().courses.find(c=>c.name===e.course);
      const events=(app.events?.()||[]).filter(x=>x.course===e.course);
      return {exam:e,m:courseMetrics({lessons:course?.lessons||[],events,exam:e,today:data.date})};
    });
  }
  function renderToday(){
    const host=el('section',undefined,'today-strip');host.setAttribute('aria-label','오늘 수업과 일정');
    const classes=data.scheduled.filter(s=>!s.record?.cancelled).sort((a,b)=>a.s.localeCompare(b.s));
    const others=(calendar?.events||[]).filter(e=>!e.allDay&&e.start).filter(e=>!classes.some(c=>c.s===e.start));
    host.append(el('b',new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short',timeZone:'Asia/Seoul'}).format(new Date(data.date+'T12:00:00+09:00')),'today-date'));
    if(!classes.length&&!others.length)host.append(el('span',calendar?.verified?'오늘 수업·일정 없음':'오늘 일정 확인 필요','today-empty'));
    for(const c of classes)host.append(el('span',`${c.s} ${c.course}`,'today-class'));
    for(const e of others.slice(0,4))host.append(el('span',`${e.start} ${e.title||e.summary||'일정'}`,'today-event'));
    root.append(host);
  }
  function renderBoard(){
    const rows=examMetrics();
    const board=card('','ready-board');
    const quest=pickQuest(rows,pendingDeadlines(assignments?.rows||[],data.date));
    if(!quest){board.append(el('p','다가오는 중간고사와 하루 안 마감 과제가 없습니다.'));root.append(board);return;}
    const next=el('div',undefined,'next-quest');
    if(quest.type==='assignment'){
      const t=quest.task;
      next.classList.add('quest-deadline');
      next.append(el('small','지금 할 것 · 과제'),el('b',`${t.course} · ${t.title}`),el('span',`${t.deadlineDays?'내일':'오늘'} ${t.deadlineTime||''} 마감 · ${t.workDone?'풀이 완료, 제출만 남음':'제출 전'}`));
      next.append(btn('과제실로',()=>open('assignments'),'primary'));
      window.dispatchEvent(new CustomEvent('saeng',{detail:{react:'deadline',line:`${t.course} ${t.title}, ${t.deadlineDays?'내일':'오늘'} 마감이에요. 이것부터.`}}));
    }else{
      const {exam,m}=quest;
      next.append(el('small','지금 할 것'),el('b',`${exam.course} · ${m.remaining?`남은 수업 ${m.remaining}회차`:'문제 풀기'}`),el('span',`A+ 준비도 ${m.readiness} · 시험 ${ddayLabel(exam.dday)}`));
      next.append(btn('시작',()=>startCourse(exam.course),'primary'));
      window.dispatchEvent(new CustomEvent('saeng',{detail:{react:'idle',line:`${exam.course}부터 가요. 시험 ${ddayLabel(exam.dday)}, 준비도 ${m.readiness}.`}}));
    }
    board.append(next);
    if(!rows.length){board.append(el('p','다가오는 중간고사가 없습니다.'));root.append(board);return;}
    const grid=el('div',undefined,'ready-grid');
    for(const {exam:e,m} of rows){
      const tile=el('button',undefined,'ready-tile pace-'+m.pace);tile.type='button';tile.onclick=()=>startCourse(e.course);
      const head=el('div',undefined,'ready-head'),score=el('div',undefined,'ready-score');
      score.append(ring(m.readiness),el('strong',String(m.readiness)));
      const title=el('div');title.append(el('b',e.course),el('small',`${ddayLabel(e.dday)} · ${e.date.slice(5).replace('-','/')}${e.assumed?' 예정':''}`));
      head.append(score,title);
      const track=el('div',undefined,'dday-track');track.setAttribute('aria-label',`진도 ${pct(m.progress)}%`);
      const fill=el('i');fill.style.width=pct(m.progress)+'%';track.append(fill);
      const stats=el('dl',undefined,'ready-stats');
      for(const [k,v] of [['진도',`${m.covered}/${m.scope}`],['정답률',m.tested?pct(m.accuracy)+'%':'—'],['이해도',m.tested?pct(m.understanding)+'%':'—']]){stats.append(el('dt',k),el('dd',v));}
      const pace=el('p',m.remaining?(m.perDay===Infinity?`남은 ${m.remaining}회차 · 오늘 안에`:`하루 ${Math.ceil(m.perDay*10)/10}회차씩`):'범위 수업 다 봄','pace');
      tile.append(head,track,stats,pace);grid.append(tile);
    }
    board.append(grid);
    const info=el('details',undefined,'ready-info');info.append(el('summary','ⓘ'),el('p','A+ 준비도 = 이해도 50 + 정답률 30 + 진도 20. 이해도 = 혼자 맞힌 문항 비율, 정답률 = 도움 포함 맞힌 비율, 진도 = 시험 전 수업 중 공부한 회차. 성적 예측이 아닙니다.'));
    board.append(info);root.append(board);
  }
  function renderMain(){
    renderToday();
    renderBoard();
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
    if(!plans.length)host.append(el('p','오늘 계획이 없습니다. 아래 추천을 선택하거나 스앵님과 정해보세요.','empty-state'));
    for(const p of plans){const row=el('div',undefined,'plan-row'+(p.done?' done':'')),label=el('label'),check=el('input');check.type='checkbox';check.checked=!!p.done;check.setAttribute('aria-label',`${p.note} 완료`);check.onchange=async()=>{check.disabled=true;if(!await change({op:'plan-done',id:p.id,done:check.checked})){check.checked=!check.checked;check.disabled=false;}};label.append(check,el('span',`${p.s}–${p.e}`));const body=el('div');body.append(el('b',data.courses.find(c=>c.id===p.courseId)?.name||'공부'),el('p',p.note));row.append(label,body,btn('시작',()=>startCourse(data.courses.find(c=>c.id===p.courseId)?.name,p)),btn('수정',()=>editPlan(p)));host.append(row);}
    host.append(btn('계획 추가',()=>editPlan(), 'subtle'));
    host.append(el('h3','빈 시간 추천'));
    const recs=recommendPlans(data,calendar);
    if(!calendar?.verified)host.append(el('small','외부 일정 확인 필요 · 시간은 직접 정해 적용할 수 있습니다.'));
    if(!recs.length)host.append(el('p','오늘 남은 시간이나 공부 상한에 맞는 추천이 없습니다. 계획을 직접 조정할 수 있습니다.'));
    for(const p of recs){const r=el('div',undefined,'recommendation');r.append(el('b',p.course),el('small',`${p.reason}${p.s?' · '+p.s+'–'+p.e:''}`),el('p',p.note),btn('계획에 추가',()=>p.unscheduled?editPlan(p):change({op:'plan-add',plans:[p]})));host.append(r);}
  }
  function editPlan(p={},preview=false,onChange=()=>{}){
    const host=app.panel(p.id?'공부 계획 수정':'오늘 계획 추가'),form=el('form'),select=el('select');
    for(const c of data.courses.filter(c=>c.name!=='사회봉사')){const o=el('option',c.name);o.value=c.id;select.append(o);}select.value=p.courseId||select.options[0]?.value;
    const fields={};for(const [key,label,type,value] of [['date','날짜','date',p.date||data.date],['s','시작','time',p.s||'19:00'],['e','종료','time',p.e||'19:45'],['note','할 일','text',p.note||'']]){const l=el('label',label),i=el('input');i.type=type;i.value=value;i.required=true;if(key==='note')i.maxLength=1200;l.append(i);fields[key]=i;form.append(l);}
    form.prepend(select);const message=el('p',''),save=btn('저장',()=>{},'primary');save.type='submit';form.append(message,save);host.append(form);
    form.onsubmit=async e=>{e.preventDefault();save.disabled=true;const item={...p,courseId:select.value,kind:p.kind||'시험 대비'};for(const k in fields)item[k]=fields[k].value;if(preview){if(item.e<=item.s){message.textContent='종료 시간을 시작보다 늦게 정해주세요.';save.disabled=false;return;}Object.assign(p,item,{course:data.courses.find(c=>c.id===item.courseId)?.name,unscheduled:false});onChange();app.close();return;}const ok=await change(p.id?{op:'plan-update',plan:item}:{op:'plan-add',plans:[item]});if(ok)app.close();else{save.disabled=false;message.textContent='저장하지 못했습니다. 시간 충돌 또는 최신 기록을 확인해주세요.';}};
  }
  function renderTutor(host){
    const intro=el('div',undefined,'tutor-intro');const session=app.session?.();intro.append(el('p',session?`${session.course}${session.stepTitle?' · '+session.stepTitle:''} 수업의 ${session.phase==='quiz'?'직접 풀기':session.phase==='example'?'함께 풀기':'개념 설명'} 단계에서 이어갈 수 있어요. 지난 풀이를 펼쳐볼까요?`:'지금 가능한 시간과 막힌 부분을 말해주세요. 오늘 할 일을 같이 정해볼게요.'));host.append(intro);if(session)host.append(btn('지난 수업 이어가기',()=>app.resume(),'primary resume-study'),btn('다른 공부 선택',()=>open('learning')));
    const messages=el('div',undefined,'main-messages');messages.id='mainMessages';messages.setAttribute('aria-live','polite');
    for(const event of (app.history?.()||[]).slice(-4)){messages.append(el('p',event.question,'student-message'),el('p',event.answer,'tutor-message'));}
    const shortcuts=el('div',undefined,'tutor-shortcuts'),input=el('textarea');input.placeholder='예: 펜슬 없이 30분만 가능해요. 정역학부터 하고 싶어요.';input.maxLength=3000;input.rows=2;input.required=true;input.setAttribute('aria-label','스앵님에게 오늘 공부 상담');
    for(const text of ['오늘 뭐부터 할까요?','정역학 과제가 막혀요','30분만 가능해요','계획 다시 잡아줘'])shortcuts.append(btn(text,()=>{input.value=text;input.focus();}));
    const form=el('form'),send=btn('스앵님과 계획 정하기',()=>{},'primary');send.type='submit';form.append(input,send);host.append(shortcuts,messages,form);
    form.onsubmit=async e=>{e.preventDefault();if(consultBusy)return;consultBusy=true;send.disabled=true;const question=input.value.trim(),message=el('p',question,'student-message'),reply=el('p','시험과 기록을 확인하고 있어요.','tutor-message');messages.append(message,reply);
      const aliases={'공업수학1':['공수','공업수학'],'미분적분학2':['미적','미적분'],'일반물리학2':['물리','일물'],'CADD':['캐드','cadd'],'아카데믹글쓰기':['아글','글쓰기'],'창업아이디어탐색':['창업']};
      const explicit=data.courses.find(c=>question.includes(c.name)||(aliases[c.name]||[]).some(a=>question.toLowerCase().includes(a)));
      const requested=explicit||data.courses.find(c=>c.id===data.exams.find(e=>e.written)?.courseId)||data.courses[0];
      const budget=Number(/(\d+)\s*분/.exec(question)?.[1]||0)||undefined;
      proposal=recommendPlans(data,calendar,new Date(),budget,explicit?.id);
      try{const result=await app.api('coach',{id:crypto.randomUUID(),mode:'consultation',course:requested?.name||'',question});reply.textContent=result.answer;await app.refreshLearning?.();}catch(error){reply.textContent=`${error.message}\n실제 시험·수업 기록으로 만든 아래 계획안은 직접 확인해 적용할 수 있습니다.`;}
      const preview=el('div',undefined,'consult-proposal');preview.append(el('h3','오늘 계획안'));
      if(!proposal.length)preview.append(el('p','남은 시간에 맞는 계획안이 없습니다. 직접 시간을 정해주세요.'),btn('직접 계획 추가',()=>editPlan()));
      proposal.forEach(p=>{const row=el('div',undefined,'proposal-row'),label=el('label'),check=el('input'),title=el('span'),note=el('p');const redraw=()=>{title.textContent=`${p.course} · ${p.s?p.s+'–'+p.e:p.duration+'분 · 시간 직접 지정'}`;note.textContent=p.note;};redraw();check.type='checkbox';check.checked=true;check.onchange=()=>p.exclude=!check.checked;label.append(check,title);row.append(label,note,btn('시간·할 일 수정',()=>editPlan(p,true,redraw)));preview.append(row);});
      if(proposal.length)preview.append(btn('선택한 계획 적용',async()=>{const selected=proposal.filter(p=>!p.exclude);if(selected.some(p=>p.unscheduled)){reply.textContent='외부 일정 확인 전입니다. 계획별 시간·할 일 수정에서 시간을 정해 추가해주세요.';return;}if(selected.length&&await change({op:'plan-add',plans:selected,consultation:true}))app.status('오늘 계획에 저장했습니다.');},'primary'));
      messages.append(preview);consultBusy=false;send.disabled=false;
    };
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
  function renderMaterials(){
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
  window.addEventListener('focus',()=>{if(area==='main'&&!root.hidden&&!consultBusy&&!root.querySelector('textarea')?.value.trim()&&!root.querySelector('#mainMessages')?.children.length)open('main');});
  setInterval(()=>{const day=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date());if(data&&data.date!==day&&!root.hidden&&!consultBusy)open(area);},60000);
  return {open,startCourse,refresh,hide:()=>{root.hidden=true;++generation;},get data(){return data;}};
}
