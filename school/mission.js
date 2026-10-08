const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const button=(text,action)=>{const b=node('button',text);b.type='button';b.onclick=action;return b;};
export function createMission(app){
  let mode='pencil';try{mode=localStorage.getItem('school-solve-mode')||'pencil';}catch{}
  let currentKey='',draft={},strokes=[],image=null,undo=[],tool='pen',active=null,saveQueue=Promise.resolve(),delay=null,generation=0,dirty=false,workContext=null,editingVersion=0,loading=false,saveError=false,latestDraft=null;
  const host=node('section',undefined,'mission-work');host.id='missionWork';document.getElementById('room').append(host);
  const canvas=node('canvas');canvas.width=1200;canvas.height=720;canvas.setAttribute('aria-label','문제 풀이 필기 공간');
  const input=node('textarea');input.placeholder='최종 답과 풀이 과정을 적어주세요. 단위와 방향도 함께 확인해요.';input.maxLength=6000;input.rows=4;input.setAttribute('aria-label','내 답과 풀이');
  const stateLabel=node('small','풀이를 불러오는 중…');stateLabel.setAttribute('role','status');
  function setMode(value){if(value===mode)return;mode=value;try{localStorage.setItem('school-solve-mode',mode);}catch{}if(host.isConnected&&currentKey){draw();schedule();}}
  function renderCanvas(){
    const ctx=canvas.getContext?.('2d');if(!ctx)return;
    ctx.clearRect(0,0,1200,720);
    for(const s of strokes){ctx.globalCompositeOperation=s.tool==='eraser'?'destination-out':'source-over';ctx.strokeStyle='#214b67';ctx.lineCap='round';ctx.lineJoin='round';const p=s.points;if(!p.length)continue;ctx.beginPath();ctx.moveTo(p[0][0]*1200,p[0][1]*720);for(const point of p){ctx.lineWidth=s.tool==='eraser'?28:Math.max(2,point[2]*5);ctx.lineTo(point[0]*1200,point[1]*720);}ctx.stroke();}
    ctx.globalCompositeOperation='source-over';
  }
  const point=e=>{const r=canvas.getBoundingClientRect();return [Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),Math.min(1,Math.max(0,(e.clientY-r.top)/r.height)),Math.min(1,Math.max(0,e.pressure||.5))];};
  canvas.onpointerdown=e=>{if(mode!=='pencil'||e.button>0||active)return;canvas.setPointerCapture(e.pointerId);active={id:e.pointerId,stroke:{tool,points:[point(e)]}};strokes.push(active.stroke);undo=[];renderCanvas();};
  // 펜이 움직일 때는 새로 생긴 구간만 그린다 — 획이 많아도 버벅이지 않게(대표님 10/8 「렉 최대한 안 걸리게」).
  function drawSegment(stroke,from){const ctx=canvas.getContext?.('2d');if(!ctx)return;const p=stroke.points;ctx.globalCompositeOperation=stroke.tool==='eraser'?'destination-out':'source-over';ctx.strokeStyle='#214b67';ctx.lineCap='round';ctx.lineJoin='round';for(let i=Math.max(1,from);i<p.length;i++){ctx.lineWidth=stroke.tool==='eraser'?28:Math.max(2,p[i][2]*5);ctx.beginPath();ctx.moveTo(p[i-1][0]*1200,p[i-1][1]*720);ctx.lineTo(p[i][0]*1200,p[i][1]*720);ctx.stroke();}ctx.globalCompositeOperation='source-over';}
  canvas.onpointermove=e=>{if(active?.id!==e.pointerId)return;const from=active.stroke.points.length;for(const sample of e.getCoalescedEvents?.()||[e])active.stroke.points.push(point(sample));drawSegment(active.stroke,from);};
  const finish=e=>{if(active?.id!==e.pointerId)return;active=null;schedule();};canvas.onpointerup=finish;canvas.onpointercancel=finish;
  input.oninput=()=>schedule();
  function schedule(){dirty=true;++editingVersion;stateLabel.textContent='풀이 저장 대기…';clearTimeout(delay);delay=setTimeout(()=>save().catch(()=>{}),650);}
  function snapshot(){const c=workContext;return {lesson:c.lesson.id,step:c.step.id,mode,text:input.value,strokes:structuredClone(strokes),assisted:app.context()?.lesson.id===c.lesson.id?app.context().assisted:c.assisted,revision:draft.revision||0,acknowledgeSource:!!draft.acknowledgeSource,...(image?{image}:{})};}
  function save(submit=false){
    clearTimeout(delay);if(!currentKey)return Promise.resolve();
    // 두 기기 학습에서 칠판 쪽(모니터)은 보기만 한다. 책상(아이패드)의 풀이를 덮어쓰지 않게.
    if(document.querySelector('.school')?.dataset.role==='board'){dirty=false;return Promise.resolve();}if(loading||saveError)return Promise.reject(new Error(loading?'풀이를 불러오는 중입니다.':'최신 풀이 확인 후 저장해주세요.'));
    const key=currentKey,request=snapshot(),token=generation,version=editingVersion;
    saveQueue=saveQueue.catch(()=>{}).then(async()=>{
      if(token!==generation&&!submit)return;
      if(loading||saveError)throw new Error('최신 풀이 확인 후 저장해주세요.');
      request.revision=draft.revision||0;request.submit=submit;
      try{stateLabel.textContent='풀이 저장 중…';const result=await app.api('work',request);if(key===currentKey&&token===generation){draft=result;if(version===editingVersion){image=null;dirty=false;stateLabel.textContent=submit?'풀이 제출됨 · AI 피드백은 확인이 필요합니다.':'풀이 서버 저장됨';}}return result;}
      catch(e){if(key===currentKey){dirty=true;saveError=true;stateLabel.textContent='저장 실패 · '+e.message;try{sessionStorage.setItem('school-work-backup:'+key,JSON.stringify(snapshot()));}catch{}draw();}throw e;}
    });return saveQueue;
  }
  async function mount(){
    const c=app.context();if(!c?.lesson)return;
    const key=c.lesson.id+'/'+c.step.id;
    const top=document.getElementById('missionHeader')||node('div',undefined,'mission-header');top.id='missionHeader';
    const count=c.total||c.lesson.steps.length,number=c.number||c.index+1;
    top.replaceChildren(node('span',c.step.kind==='quiz'?'문제 미션':'개념·수업 미션','mission-tag'),node('b',`${number} / ${count}`));
    const progress=node('progress');progress.max=count;progress.value=number;progress.setAttribute('aria-label','미션 진행');top.append(progress);document.getElementById('room').prepend(top);
    let face=document.getElementById('missionTutorFace');if(!face){face=node('img');face.id='missionTutorFace';face.alt='김주영 스앵님';document.querySelector('#dialogue .speech').prepend(face);}face.src='../notes/classroom/assets/tutor/neutral.png';
    host.hidden=false;
    if(key===currentKey){draw();return;}
    if(dirty){try{await save();}catch{return;}}
    currentKey=key;workContext=c;++generation;const token=generation,loadVersion=editingVersion;draft={revision:0};strokes=[];image=null;input.value='';saveError=false;latestDraft=null;loading=true;draw();host.inert=true;input.disabled=true;
    try{const saved=await app.api('work?lesson='+encodeURIComponent(c.lesson.id)+'&step='+encodeURIComponent(c.step.id));if(token!==generation)return;draft=saved;if(loadVersion===editingVersion){strokes=saved.strokes||[];input.value=saved.text||'';if(saved.mode)mode=app.forcedMode?.()||saved.mode;}stateLabel.textContent=saved.at?'이전 풀이를 이어서 할 수 있습니다.':'풀이 방식은 언제든 바꿀 수 있습니다.';draw();}catch(e){if(token===generation)stateLabel.textContent=e.message;}finally{if(token===generation){loading=false;host.inert=false;input.disabled=false;}}
  }
  function draw(){
    host.replaceChildren(node('h2','내 풀이'));
    if(draft.sourceChanged&&!draft.acknowledgeSource){host.append(node('p','문제 원문이 변경됐습니다. 아래 이전 풀이와 현재 문제를 대조한 뒤 이어가주세요.','notice'),button('변경된 문제를 확인하고 이어가기',()=>{draft.acknowledgeSource=true;if(latestDraft)latestDraft.acknowledgeSource=true;draw();schedule();}));}
    const modes=node('div',undefined,'solve-modes');for(const [value,label] of [['pencil','펜슬로 풀기'],['notebook','공책에 풀기'],['screen','화면으로 풀기']]){const b=button(label,()=>setMode(value));b.setAttribute('aria-pressed',String(mode===value));modes.append(b);}host.append(modes);
    if(mode==='pencil'){
      const tools=node('div',undefined,'pen-tools');for(const [value,label] of [['pen','펜'],['eraser','지우개']]){const b=button(label,()=>{tool=value;draw();});b.setAttribute('aria-pressed',String(tool===value));tools.append(b);}tools.append(button('되돌리기',()=>{if(strokes.length)undo.push(strokes.pop());renderCanvas();schedule();}),button('다시 하기',()=>{if(undo.length)strokes.push(undo.pop());renderCanvas();schedule();}),button('넓게 쓰기',()=>{host.classList.toggle('expanded');canvas.focus();}));host.append(tools,canvas);renderCanvas();
    }else if(mode==='notebook')host.append(node('p','공책에 풀고, 답은 아래에서 골라 바로 확인해요. 풀이 사진을 올리면 스앵님이 과정까지 봐 줘요.'));
    host.append(input);
    const imageInput=node('input');imageInput.type='file';imageInput.accept='image/png,image/jpeg';imageInput.setAttribute('aria-label','공책 풀이 사진 첨부');imageInput.onchange=async()=>{const file=imageInput.files?.[0];if(!file)return;if(file.size>15_000_000||!['image/png','image/jpeg'].includes(file.type)){stateLabel.textContent='PNG/JPEG 사진, 15MB 이내로 선택해주세요.';return;}try{const bitmap=await createImageBitmap(file),scale=Math.min(1,2000/Math.max(bitmap.width,bitmap.height)),copy=document.createElement('canvas');copy.width=Math.round(bitmap.width*scale);copy.height=Math.round(bitmap.height*scale);copy.getContext('2d').drawImage(bitmap,0,0,copy.width,copy.height);bitmap.close();image=copy.toDataURL('image/jpeg',.85);schedule();draw();}catch{stateLabel.textContent='사진을 읽지 못했습니다. PNG/JPEG로 다시 선택해주세요.';}};host.append(imageInput);
    if(image||draft.image){const preview=node('img');preview.className='work-preview';preview.alt='내 풀이 사진';preview.src=image||'/api/school/work-image?id='+draft.image;host.append(preview);}
    const actions=node('div',undefined,'work-actions');actions.append(button('풀이 저장',()=>save().catch(()=>{})),button('풀이 제출·피드백',submit));host.append(actions,stateLabel);
    if(draft.review)showReview(draft.review);
    let backup=null;try{backup=JSON.parse(sessionStorage.getItem('school-work-backup:'+currentKey)||'null');}catch{}
    if(backup)host.append(button('보관된 입력 복구',()=>{input.value=backup.text||'';strokes=backup.strokes||[];image=backup.image||null;mode=backup.mode||mode;draw();schedule();}));
    if(saveError){
      host.append(node('p','현재 입력은 보존했습니다. 서버의 최신 풀이를 확인한 뒤 저장할 수 있습니다.'),button('최신 풀이 확인·내 입력 보존',async()=>{
        const token=generation;
        try{const saved=await app.api('work?lesson='+encodeURIComponent(workContext.lesson.id)+'&step='+encodeURIComponent(workContext.step.id));if(token!==generation)return;latestDraft=saved;draw();}catch(e){stateLabel.textContent=e.message;}
      }));
      if(latestDraft){
        const comparison=node('details');comparison.open=true;comparison.append(node('summary','서버에 저장된 풀이'),node('p',latestDraft.text||'작성된 텍스트 없음'),node('small',`필기 ${(latestDraft.strokes||[]).length}개 · 사진 ${latestDraft.image?'있음':'없음'} · revision ${latestDraft.revision}`));host.append(comparison);
        if(latestDraft.sourceChanged)host.append(node('p','원문이 바뀌었습니다. 문제와 풀이를 대조한 뒤 원문 변경 확인도 해주세요.'));
        host.append(button('비교 완료·현재 입력을 저장',async()=>{clearTimeout(delay);await saveQueue.catch(()=>{});draft={...latestDraft,acknowledgeSource:!!(latestDraft.acknowledgeSource||draft.acknowledgeSource)};latestDraft=null;saveError=false;draw();try{await save();}catch{}}));
      }
    }
  }
  async function submit(){
    const c=app.context(),token=generation;const b=host.querySelector('.work-actions button:last-child');b.disabled=true;
    try{
      if(mode==='pencil'&&strokes.length)image=canvas.toDataURL('image/png');
      await save(true);if(token!==generation)return;
      app.feedback('풀이를 남겼습니다. 스앵님이 계산·단위·방향에서 확인할 부분을 짚고 있어요.','submitted');
      const result=await app.api('work-review',{lesson:c.lesson.id,step:c.step.id});
      if(token===generation){draft.review=result;app.helped?.();app.feedback(result.hint+'\n'+result.followUp,result.status==='retry'?'retry':'review');draw();stateLabel.textContent=result.assessment;}
    }catch(e){if(token===generation){app.feedback(e.message+' 풀이와 사진은 저장된 상태를 확인하고 다시 요청할 수 있습니다.','retry');}}
    finally{if(b.isConnected)b.disabled=false;}
  }
  function showReview(review){
    const section=node('section',undefined,'work-diagnosis');section.append(node('h3',review.requiresConfirmation?'필기 판독 확인':review.status==='retry'?'처음 확인할 단계':review.status==='supported'?'풀이 확인 · 새 문제에서 다시 확인':'판단 보류'));
    if(review.firstError)section.append(node('mark',review.firstError),node('p','확인할 부분: '+review.category));
    section.append(node('p',review.hint),node('p',review.followUp));
    if(review.requiresConfirmation){const transcript=node('textarea');transcript.value=review.transcript;transcript.rows=6;transcript.maxLength=6000;transcript.setAttribute('aria-label','인식된 필기 · 직접 확인하고 수정');const confirm=button('이렇게 쓴 게 맞아요 · 풀이 분석',async()=>{const token=generation;try{await saveQueue;if(dirty||review.workRevision!==draft.revision)throw new Error('풀이가 바뀌었습니다. 현재 풀이로 피드백을 다시 받아주세요.');const result=await app.api('work-review',{lesson:workContext.lesson.id,step:workContext.step.id,transcript:transcript.value,reviewId:review.id,workRevision:review.workRevision});if(token!==generation)return;draft.review=result;app.feedback(result.hint+'\n'+result.followUp,result.status==='retry'?'retry':'review');draw();}catch(e){stateLabel.textContent=e.message;}});confirm.disabled=dirty||review.workRevision!==draft.revision;section.append(transcript,confirm);}
    else {
      if(review.status==='retry')section.append(button('관련 개념 보충하기',()=>app.remedial?.()));
      section.append(button('힌트 없이 새 문제 풀기',()=>app.retest?.(workContext.lesson.id)));
    }
    if(review.workRevision!==draft.revision)section.append(node('small','이 관찰 이후 풀이가 수정되었습니다. 저장 후 다시 피드백을 받아주세요.'));
    section.append(node('small','AI 관찰입니다. 읽히지 않은 식은 확인하며 스킬 획득으로 자동 처리하지 않습니다.'));host.append(section);
  }
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
  return {mount,setMode,get mode(){return mode;},save:()=>dirty?save():saveQueue.catch(()=>{}),hide:async()=>{if(dirty)await save();host.hidden=true;},feedback:(kind)=>{host.dataset.feedback=kind;window.dispatchEvent(new CustomEvent('saeng',{detail:{react:kind==='correct'?'correct':kind==='retry'?'wrong':'idle'}}));const face=document.getElementById('missionTutorFace');const expression='../notes/classroom/assets/tutor/'+(kind==='correct'?'proud':kind==='retry'?'sharp':'neutral')+'.png';if(face)face.src=expression;const teacher=document.getElementById('teacher');if(teacher)teacher.src=expression;}};
}
