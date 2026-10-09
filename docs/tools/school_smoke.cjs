const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const {JSDOM}=require(path.join(root,'.test-tools/node_modules/jsdom'));
const fixture=JSON.parse(fs.readFileSync(path.join(root,'.test-tools/school-fixture.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'school/index.html'),'utf8');
const source=fs.readFileSync(path.join(root,'school/school.js'),'utf8').replace(/^import[\s\S]*?from\s+["'][^"']+["'];\s*/gm,'');
new vm.Script(source);
let state={version:1,revision:0,plans:{},events:[],rules:{},progress:{},drafts:{},settings:{engine:'auto',voice:false}}, prerequisiteMode=false;
const errors=[];
const assignments={asOf:'2026-10-06',notice:'풀이 완료와 제출 완료',rows:[{id:'a',course:'공업수학1',title:'풀이 과제',due:'2099-10-07',submission:'미제출',workDone:false,submitted:false,files:[],source:'판서'},{id:'b',course:'정역학',title:'제출 과제',due:'2026-10-05',submission:'제출',workDone:false,submitted:true,files:[]}]};
const dom=new JSDOM(html,{url:'https://school.invalid/kingdom/study/school/index.html?test=1',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document;
w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
w.requestAnimationFrame=()=>{};w.structuredClone=structuredClone;w.HTMLCanvasElement.prototype.getContext=()=>null;
w.addEventListener('error',e=>errors.push(e.error||e.message));
w.fetch=async(url,options={})=>{
 const parsed=new URL(url,w.location.href);let body;
 if(parsed.pathname.endsWith('/knowledge/materials.json'))body=JSON.parse(fs.readFileSync(path.join(root,'knowledge/materials.json'),'utf8'));
 else if(parsed.pathname.endsWith('/knowledge/sessions.json'))body=JSON.parse(fs.readFileSync(path.join(root,'knowledge/sessions.json'),'utf8'));
 else if(parsed.pathname.endsWith('/_private/class-files.json'))body=JSON.parse(fs.readFileSync(path.join(root,'_private/class-files.json'),'utf8'));
 else if(parsed.pathname.endsWith('/_private/submit.json'))body=JSON.parse(fs.readFileSync(path.join(root,'_private/submit.json'),'utf8'));
 else if(parsed.pathname.endsWith('/workspace'))body={date:'2026-10-07',termId:'test',revision:0,courses:fixture.catalog.courses,exams:[],plans:[],sessions:[],scheduled:[],sources:[],candidates:[],profile:{dailyCap:4},sync:{}};
 else if(parsed.pathname.endsWith('/cal'))body={ok:true,days:{'2026-10-07':[]}};
 else if(parsed.pathname.endsWith('/work'))body={revision:0,strokes:[]};
 else if(parsed.pathname.endsWith('/catalog'))body=fixture.catalog;
 else if(parsed.pathname.endsWith('/session')){if(options.body){const request=JSON.parse(options.body);assert.equal(request.revision,state.activeSession?.revision||0);state.activeSession={...request,revision:request.revision+1};}body=state.activeSession||null;}
 else if(parsed.pathname.endsWith('/state'))body=state;
 else if(parsed.pathname.endsWith('/capabilities'))body={testMode:true,engines:['auto','claude','codex'],voice:false};
 else if(parsed.pathname.endsWith('/assignments'))body=assignments;
 else if(parsed.pathname.endsWith('/assignment-status')){const request=JSON.parse(options.body);body=assignments.rows.find(r=>r.id===request.id);body[request.field]=request.value;}
 else if(parsed.pathname.endsWith('/lesson'))body=fixture.lessons[parsed.searchParams.get('id')];
 else if(parsed.pathname.endsWith('/event')){
  const event={...JSON.parse(options.body),at:Date.now()/1000};
  const prior=state.events.find(e=>e.id===event.id);
  if(!prior){state.events.push(event);state.revision++;}
  if(event.kind==='plan')state.plans[event.plan.course]=event.plan;
  if(event.kind==='position')state.progress[event.lesson]={index:event.index};
  body={event:prior||event,revision:state.revision,projection:{plans:state.plans,progress:state.progress}};
 }else if(parsed.pathname.endsWith('/coach')&&JSON.parse(options.body).mode==='teachback'&&/핵심/.test(JSON.parse(options.body).question)){
  body={answer:'좋아요, 핵심을 짚었어요.',feedback:{assessment:'supported'},engine:'mock'};
 }else if(parsed.pathname.endsWith('/coach')){
  const request=JSON.parse(options.body),lesson=fixture.lessons[request.lesson];
  const quiz=lesson.steps.findIndex(s=>s.kind==='quiz');
  const feedback={assessment:'misconception',misconception:'단위를 다시 설명해보세요.',studentQuote:request.question,notice:'AI 관찰',target:{lesson:lesson.id,index:quiz,label:'직접 확인 문제 풀기'}};
  if(prerequisiteMode) feedback.target={lesson:Object.keys(fixture.lessons).find(id=>id.startsWith('node:')&&id!==lesson.id),label:'선수 개념 보충'};
  body={answer:'다시 확인해볼게요.',engine:'fixture',feedback};
  state.events.push({...request,kind:'question',answer:body.answer,feedback,engine:body.engine,at:Date.now()/1000});
 }else throw new Error('예상하지 않은 요청 '+url);
 if(body===undefined)throw new Error('없는 fixture '+url);
 return {ok:true,json:async()=>JSON.parse(JSON.stringify(body))};
};
w.eval(fs.readFileSync(path.join(root,'school/learning.js'),'utf8').replace(/^export /gm,''));
const strip=s=>s.replace(/^import[\s\S]*?from\s+["'][^"']+["'];\s*/gm,'').replace(/^export /gm,'');
// 모듈 상수는 eval 마다 갇히므로 다른 파일이 쓰는 것만 창에 올린다.
const shared={'metrics.js':'window.KINDS=KINDS;window.WEIGHTS=WEIGHTS;','worldmap.js':'window.officeHref=officeHref;'};
for(const f of ['metrics.js','saeng.js','worldmap.js','setup.js','workspace.js','mission.js','tutor.js','subject-rail.js','surface.js','lecture.js','lecture-pack.js','lecture-ui.js','room-wide.js','rig.js','focus.js','plan.js','shell.js','vn-dialog.js','classroom-v3.js'])w.eval(strip(fs.readFileSync(path.join(root,'school',f),'utf8'))+'\n'+(shared[f]||''));
w.createSpace=()=>({seated(){},view(){},hide(){},walk(){}});w.ROOMS=[{name:'정역학'},{name:'공업수학1'}];w.createGrowth=()=>({notifySkills(){},stop:async()=>{},step(){},task(){},tutorPlan(){}});
w.eval(source+'\nwindow.__smokeAssignments=showAssignments;window.__smokeConcept=()=>startLesson(lastLesson,{concept:true});window.__smokeLobby=()=>{legacyLobbyMode=true;showLobby();legacyLobbyMode=false;};');
const settle=()=>new Promise(resolve=>setTimeout(resolve,10));
const check=(label)=>[...d.querySelectorAll('.assignment-check')].find(el=>el.textContent===label)?.querySelector('input');
const byText=text=>[...d.querySelectorAll('button')].find(b=>b.textContent===text);
(async()=>{
 const badge=d.createElement('span');badge.textContent='상냥';d.querySelector('#dock').append(badge);await settle();assert.equal(badge.style.display,'none');assert.ok(d.querySelector('#dockLine').textContent);assert.equal(d.querySelector('#dockTalk').textContent,'상담');badge.textContent='실제 대사';await settle();assert.equal(badge.style.display,'');badge.remove();
 await settle();await settle();d.querySelector('#learningArea').click();await settle();w.__smokeLobby();assert.equal(d.querySelector('#resume').disabled,false,d.querySelector('#status').textContent+' '+errors.map(String).join(' '));assert.equal(d.querySelectorAll('.door').length,7);
 assert.equal(d.querySelectorAll('header nav.rooms .room-door').length,5,'방 5개: 홈·교실·자료실·과제실·상담실(10/9)');
 assert.equal(d.querySelectorAll('.room-sub button').length,2);
 d.querySelector('#mainArea').click();await settle();/* 10/9 메인 = 요약 칩 + 공부 계획(관제탑 공부계획 통합 보기) */assert.ok(d.querySelector('.db-strip'),'위 요약 줄');for(let i=0;i<20&&!d.querySelector('.pl-tasks');i++)await settle();assert.ok(d.querySelector('.pl-tasks'),'공부 계획(오늘 할 과제)');assert.ok(d.querySelector('.sb form input'),'아래 고정 스앵님 채팅 바');assert.equal(d.querySelector('.school').dataset.room,'lobby');
 d.querySelector('#materialsArea').click();for(let i=0;i<20&&!d.querySelector('.kind-chip');i++)await settle();assert.equal(d.querySelector('.school').dataset.room,'library');assert.equal(d.querySelectorAll('.kind-chip').length,5,'자료 4분류 + 전체');
 d.querySelector('#progressArea').click();await settle();assert.equal(d.querySelector('#workspace').hidden,false);
 w.__smokeAssignments();await settle();assert.equal(d.querySelector('#lobby').hidden,true);assert.equal(d.querySelector('#assignments').hidden,false);assert.ok(d.querySelector('#assignments').textContent.includes('풀이 과제'));assert.ok(!d.querySelector('#assignments').textContent.includes('제출 과제'));
 assert.ok(!d.querySelector('#assignments').textContent.includes('혼자 풀기'));assert.ok(!d.querySelector('#assignments').textContent.includes('필요한 개념 학습'));
 assert.equal(w.eval('isStudyPractice({label:"혼자 풀기 (스앵님 코칭)",href:"notes/lessons/_private/em1/hw/index.html"})'),true);
 assert.equal(w.eval('isStudyPractice({label:"문제지 PDF",href:"_private/submit/statics_ch5_questions.pdf"})'),false);
 check('풀이 완료').click();await settle();assert.equal(assignments.rows[0].workDone,true);assert.equal(assignments.rows[0].submitted,false);assert.equal(check('풀이 완료').checked,true);
 w.__smokeAssignments();await settle();assert.equal(check('풀이 완료').checked,true,'다시 조회해도 완료 표시 유지');
 check('풀이 완료').click();await settle();assert.equal(assignments.rows[0].workDone,false);
 check('제출 완료').click();await settle();assert.equal(assignments.rows[0].submitted,true);assert.equal(assignments.rows[0].workDone,false);assert.ok(!d.querySelector('#assignments').textContent.includes('풀이 과제'));
 byText('제출 완료').click();assert.ok(d.querySelector('#assignments').textContent.includes('제출 과제'));check('제출 완료').click();await settle();assert.equal(assignments.rows[0].submitted,false);
 w.__smokeLobby();assert.equal(d.querySelector('#assignments').hidden,true);assert.equal(d.querySelector('#lobby').hidden,false);
 d.querySelector('#consult').click();assert.equal(d.querySelector('#panel').open,true);
 {const p=d.querySelector('#panel'),fire=(t,x)=>p.dispatchEvent(new w.MouseEvent(t,{bubbles:true,clientX:x,clientY:5}));p.getBoundingClientRect=()=>({left:100,right:500,top:0,bottom:400});
  fire('pointerdown',300);fire('click',600);assert.equal(p.open,true,'창 안에서 시작해 바깥에서 뗀 클릭은 닫지 않는다');
  fire('pointerdown',600);fire('click',600);assert.equal(p.open,false,'바깥(어두운 부분)을 누르면 닫힌다');delete p.getBoundingClientRect;}
 d.querySelector('#consult').click();assert.equal(d.querySelector('#panel').open,true);
 d.querySelector('#panelBody form').dispatchEvent(new w.Event('submit',{cancelable:true}));await settle();
 for(let i=0;i<5&&byText('아직 모르겠어요');i++){byText('아직 모르겠어요').click();await settle();}
 assert.ok(byText('이 계획 적용하고 시작'));byText('이 계획 적용하고 시작').click();await settle();
 assert.equal(d.querySelector('#panel').open,false,'계획 저장을 기다린 뒤 수업으로 진입');
 assert.equal(d.querySelector('#room').hidden,false);assert.equal(d.querySelector('#next').disabled,true);
 /* 교실 v3: 단계에 들어가면 강의가 먼저 재생 → ⏭ 로 넘겨 끝내면 확인 질문 */assert.equal(d.querySelector('.school').dataset.lecture,'playing','단계 시작 때 강의 자동 재생');for(let i=0;i<300&&d.querySelector('#dialogue').dataset.tutor!=='check';i++){d.querySelector('.v3-skip')?.click();await settle();}assert.equal(d.querySelector('#dialogue').dataset.tutor,'check','강의 뒤 스앵님 확인 질문');d.querySelector('#tutorInput').value='핵심은 단위를 맞춰 더하는 거예요';d.querySelector('.tutor-reply').dispatchEvent(new w.Event('submit',{cancelable:true}));for(let i=0;i<20&&d.querySelector('#next').disabled;i++)await settle();assert.equal(d.querySelector('#next').disabled,false);
 d.querySelector('#next').click();await settle();assert.equal(state.progress[state.plans['공업수학1'].start].index,1);
 d.querySelector('#askToggle').click();assert.equal(d.querySelector('#chat').hidden,false);d.querySelector('#closeChat').click();assert.equal(d.querySelector('#chat').hidden,true);
 d.querySelector('#askToggle').click();d.querySelector('#question').value='분수 단위가 같다고 생각해요';
 d.querySelector('#chatForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await settle();await settle();
 assert.equal(state.events.at(-1).mode,'question');   /* 설명 확인(teachback)은 스앵님 확인 질문(tutor.js)이 맡고, 대화 창은 질문용(교실 v2) */assert.ok(d.querySelector('.feedback'));assert.equal(state.events.filter(e=>e.kind==='answer').length,0,'AI 피드백으로 정답을 만들지 않는다');
 byText('직접 확인 문제 풀기').click();await settle();assert.ok(d.querySelector('#choices .check-answer') || fixture.lessons[state.plans['공업수학1'].start].steps[state.progress[state.plans['공업수학1'].start].index].kind==='quiz');
 prerequisiteMode=true;d.querySelector('#askToggle').click();d.querySelector('#question').value='다시 설명합니다';d.querySelector('#chatForm').dispatchEvent(new w.Event('submit',{cancelable:true}));await settle();await settle();
 byText('선수 개념 보충').click();await settle();assert.ok(byText('원래 문제로 돌아가기'),'보충 진입 직후 복귀 버튼을 표시한다');
 byText('원래 문제로 돌아가기').click();await settle();assert.ok(d.querySelector('#board').textContent);
 assert.equal(errors.length,0,errors.map(String).join('\n'));
 console.log('학교 jsdom: 상담·진단·계획·수업·저장·서술형 피드백·확인 문제·보충 후 복귀 errors=0');
 dom.window.close();
})().catch(error=>{console.error(error);dom.window.close();process.exitCode=1;});
