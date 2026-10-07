'use strict';
// 시안 진행은 기존 학습 상태와 별도로 저장합니다.
const KEY='study-school-preview-v2';
const $=id=>document.getElementById(id);
const STEPS=[
  {formula:'y′ = 2',choices:[['물의 양','no'],['물이 늘어나는 속도','yes']]},
  {formula:'y = 2t + C',input:true,expected:3},
  {formula:'y(0) = 3',input:true,expected:11},
  {formula:'y′ = 3,  y(0) = 5',input:true,expected:17}
];
const copy=[
 ['변화율을 식으로 표현하기','변화율을, 식으로.','시간 t에 따라 물의 양 y가 변합니다. y′는 그 순간 물이 얼마나 빠르게 늘어나는지를 나타냅니다.','매분 2 L씩 증가. y는 물의 양, t는 시간입니다.','먼저 기호부터 확인해볼까요. y′는 물의 양일까요, 물이 늘어나는 속도일까요?'],
 ['같은 변화율, 다른 출발점','증가 속도만으로는 부족해요.','y′ = 2를 만족하는 물의 양은 하나가 아닙니다. 처음 들어 있던 물의 양도 필요합니다.','C는 출발점을 나타내는 상수입니다. t로 미분하면 y′ = 2.','처음에 물이 3 L 있었다면 C는 얼마일까요?'],
 ['초기조건으로 해 선택하기','출발점을 식에 넣어요.','처음에 3 L. 매분 2 L씩 늘어납니다. 이번 상황의 식은 y = 2t + 3입니다.','y(0) = 3은 초기조건입니다. 변화율의 식과 함께 이번 해를 정합니다.','4분 뒤에는 물이 몇 L일까요? 직접 식에 넣어 계산해주세요.'],
 ['새 조건에서 독립 풀이','이번에는 혼자 해볼까요.','처음에 5 L. 매분 3 L씩 늘어납니다. 4분 뒤의 물의 양을 구해주세요.','출발점과 변화율을 함께 쓰는 시안용 확인 문제입니다.','조건이 바뀌었어요. 힌트 없이 풀 수 있는지 확인해볼게요.']
];
STEPS.forEach((s,i)=>{[s.title,s.heading,s.body,s.note,s.speech]=copy[i];});
STEPS[0].choices=[['물의 양','no'],['물이 늘어나는 속도','yes']];
let state={version:1,room:'lobby',step:0,route:null,evidence:[],help:{},draft:''};
let storageFailed=false;
try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v&&v.version===1&&['lobby','consult','class','done'].includes(v.room)&&Number.isInteger(v.step)&&v.step>=0&&v.step<STEPS.length&&Array.isArray(v.evidence)&&v.help&&typeof v.help==='object')state={...state,...v};}catch{storageFailed=true;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));storageFailed=false;}catch{storageFailed=true;}$('saveStatus').textContent=storageFailed?'시안 저장 실패 · 이 창에서만 이어집니다':'이 기기에 시안 진행 저장';}
function button(label,handler,primary=false){const b=document.createElement('button');b.type='button';b.textContent=label;if(primary)b.className='primary';b.onclick=handler;$('choices').append(b);}
function board(caption,heading,body,formula,note){$('board').replaceChildren();[['div',caption,'caption'],['h1',heading,''],['p',body,''],['div',formula,'equation'],['div',note,'annotation']].forEach(([tag,text,cls])=>{if(!text)return;const el=document.createElement(tag);el.className=cls;el.textContent=text;$('board').append(el);});}
function speak(text){$('speech').textContent=text;}
function enter(room){stopCoach();state.room=room;state.draft='';save();render();}
function next(){stopCoach();if(state.step<STEPS.length-1){state.step++;state.draft='';save();render();}else enter('done');}
function markHelp(){state.help[state.step]=true;save();}
function evaluate(correct){state.evidence.push({step:state.step,correct,assisted:!!state.help[state.step],at:Date.now()});save();if(correct){speak(state.step===0?'맞아요. y′는 변화율입니다. 이제 출발점이 왜 필요한지 볼까요?':'계산이 맞아요. '+(state.help[state.step]?'도움을 받아 해결한 것으로 남길게요.':'이 단계는 힌트 없이 해결했어요.'));$('choices').replaceChildren();$('answerForm').hidden=true;button(state.step===STEPS.length-1?'수업 결과 보기':'다음 단계',next,true);}else{markHelp();speak(state.step===0?'물의 양은 y입니다. y′는 그 양이 변하는 속도예요. 다시 골라볼까요?':'아직 맞지 않아요. 처음의 양에, 매분 늘어난 양 × 지난 시간을 더해보세요. 다시 계산해볼까요?');}}
function render(){const lobby=state.room==='lobby';$('lobby').hidden=!lobby;$('room').hidden=lobby;$('dialogue').hidden=lobby;$('scene').className='scene '+(lobby?'lobby':'in-room');$('scene').setAttribute('aria-label',lobby?'학교 로비':'공업수학1 교실');$('choices').replaceChildren();$('answerForm').hidden=true;$('hint').disabled=state.room!=='class';$('simpler').disabled=state.room!=='class';$('back').disabled=state.room!=='class'||state.step===0;
  $('resumeText').textContent=state.route?'상담에서 정한 출발점 · '+(state.route==='foundation'?'변화율 기초부터':'초기조건 확인부터'):'짧은 상담으로 시작점을 정해보세요.';$('resume').textContent=state.route?'수업 이어가기':'상담 시작';
  $('location').textContent=lobby?'첫 수업을 앞두고':state.room==='consult'?'김주영 스앵님 상담실':'공업수학1 · 1.1';
  $('scene').classList.toggle('consult',state.room==='consult');
  if(lobby)return;
  if(state.room==='consult'){$('roomLabel').textContent='상담실';$('stepLabel').textContent='짧은 진단';board('시작점을 함께 정해요','기호부터 확인해볼까요.','y = t²일 때, y′는 무엇일까요?','y = t²','이 한 문제로 전체 실력을 단정하지 않습니다.');speak('미분을 어디까지 알고 계신지 확인하려고 해요. 모르겠다고 답해도 괜찮아요.');[['2t','initial'],['t','foundation'],['아직 모르겠어요','foundation']].forEach(([label,route])=>button(label,()=>{state.route=route;state.step=route==='foundation'?0:1;state.evidence.push({kind:'diagnostic',choice:label,at:Date.now()});save();board('첫 수업 제안','여기서 시작해봐요.',route==='foundation'?'변화율 기호부터 짚고, 물의 양을 식으로 표현해봅니다.':'미분 기호는 확인했어요. 초기조건이 해를 정하는 과정부터 배워봅니다.','','설명 · 확인 질문 · 새 문제 풀이로 진행합니다.');speak('이 출발점으로 해볼까요? 어렵거나 쉬우면 수업 중 조정할 수 있어요.');$('choices').replaceChildren();button('이 방식으로 시작',()=>enter('class'),true);button('기호부터 다시 배우기',()=>{state.route='foundation';state.step=0;enter('class');});}));}
  else if(state.room==='done'){$('roomLabel').textContent='수업 기록';$('stepLabel').textContent='첫 확인 완료';const last=state.evidence.filter(e=>e.step===3).at(-1);board('오늘 확인한 것','변화율과 출발점을 연결했어요.','이번 숫자 문제를 해결했습니다. 일반적인 미분방정식 풀이와 장기 기억은 아직 확인하지 않았습니다.','y = 변화율 × 시간 + 출발점',last?.assisted?'마지막 문제: 도움받아 해결':'마지막 문제: 힌트 없이 해결');speak('이 결과는 시안 기록에만 남아요. 기존 이해도나 시험 준비 상태는 바꾸지 않았습니다.');button('조건을 바꾼 문제 다시 보기',()=>{state.step=3;state.help[3]=false;enter('class');});button('학교로 돌아가기',()=>enter('lobby'),true);}
  else{const s=STEPS[state.step];$('roomLabel').textContent='공업수학1 · '+s.title;$('stepLabel').textContent=(state.step+1)+' / '+STEPS.length;board('1.1 기본개념 · 모델화',s.heading,s.body,s.formula,s.note);speak(s.speech);if(s.choices)s.choices.forEach(([label,result])=>button(label,()=>evaluate(result==='yes')));if(s.input){$('answerForm').hidden=false;$('answer').value=state.draft||'';}}
  save();
}
$('teacher').onload=()=>{$('teacher').hidden=false;};if($('teacher').complete&&$('teacher').naturalWidth)$('teacher').hidden=false;
$('home').onclick=()=>enter('lobby');document.querySelectorAll('[data-room]').forEach(b=>b.onclick=()=>enter(b.dataset.room));$('resume').onclick=()=>enter(state.route?'class':'consult');$('sources').onclick=()=>$('sourceDialog').showModal();$('closeSources').onclick=()=>$('sourceDialog').close();
$('answer').oninput=()=>{state.draft=$('answer').value;save();};$('answerForm').onsubmit=e=>{e.preventDefault();const raw=$('answer').value.trim().replace(/\s*L$/i,'');if(!raw||!Number.isFinite(Number(raw))){speak('이 시안에서는 계산한 숫자를 입력해주세요.');return;}evaluate(Number(raw)===STEPS[state.step].expected);};
$('hint').onclick=()=>{markHelp();speak(['y는 양, y′는 변화율입니다. 식의 왼쪽에 어떤 기호가 있나요?','t = 0을 식 y = 2t + C에 넣어보세요.','처음의 3 L에 4분 동안 늘어난 양을 더해주세요.','처음의 양 + 매분 증가량 × 시간으로 계산해보세요.'][state.step]);};$('simpler').onclick=()=>{markHelp();speak('물통에 물을 붓는다고 생각해봐요. 이미 들어 있던 물에, 시간이 흐르며 새로 들어온 물을 더하면 됩니다. y′는 물을 붓는 속도예요.');};$('back').onclick=()=>{if(state.step>0){state.step--;state.draft='';save();render();}};
let coachController=null;
function stopCoach(){if(coachController)coachController.abort();coachController=null;$('askSend').disabled=false;$('askStop').hidden=true;$('askForm').hidden=true;$('coachReply').hidden=true;}
$('askToggle').onclick=()=>{$('askForm').hidden=!$('askForm').hidden;if(!$('askForm').hidden)$('question').focus();};
$('askStop').onclick=stopCoach;
$('askForm').onsubmit=async e=>{
  e.preventDefault();const question=$('question').value.trim();if(!question||coachController)return;
  markHelp();const controller=new AbortController();coachController=controller;
  $('askSend').disabled=true;$('askStop').hidden=false;$('coachReply').hidden=false;$('coachReply').textContent='스앵님에게 질문을 전달하고 있어요…';
  try{
    if(!location.pathname.includes('/study/'))throw new Error('비서앱 안에서 열어야 질문을 연결할 수 있습니다.');
    const listResponse=await fetch('/api/conversations',{credentials:'same-origin',signal:controller.signal});if(!listResponse.ok)throw new Error('로그인 또는 학습 대화 연결을 확인해주세요.');
    const list=await listResponse.json();const conversation=(Array.isArray(list)?list:list.conversations||[]).find(c=>c.kind==='study');if(!conversation)throw new Error('학습 대화를 찾지 못했습니다.');
    const step=STEPS[state.step];const context=state.room==='class'?`${step.heading}\n${step.body}\n${step.formula}`:'첫 수업 시작점 상담';
    const response=await fetch('/api/send',{method:'POST',credentials:'same-origin',signal:controller.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({conv_id:conversation.id,client:'study',text:`[학습 질문]\n학교 시범 수업 · 공업수학1 1.1\n현재 화면: ${context}\n학생 질문: ${question}\n기초부터 짧게 설명하고 확인 질문 하나로 끝내세요. 학생이 풀기 전 정답 숫자를 먼저 주지 마세요. 교수님 출제 경향은 확인된 근거가 없으므로 단정하지 마세요.`})});
    if(!response.ok||!response.headers.get('content-type')?.includes('text/event-stream'))throw new Error('스앵님 연결이 응답하지 않았습니다. 잠시 뒤 다시 시도해주세요.');
    const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',answer='';
    while(true){const chunk=await reader.read();if(chunk.done)break;buffer+=decoder.decode(chunk.value,{stream:true}).replace(/\r\n/g,'\n');let end;
      while((end=buffer.indexOf('\n\n'))>=0){const frame=buffer.slice(0,end);buffer=buffer.slice(end+2);const event=frame.match(/^event: ?(.*)$/m)?.[1];const raw=frame.split('\n').filter(line=>line.startsWith('data:')).map(line=>line.slice(5).trimStart()).join('\n');if(!raw)continue;const data=JSON.parse(raw);
        if(event==='error')throw new Error(data.message||'스앵님이 다른 질문에 답하고 있습니다.');if(event==='token')answer+=data.text||'';if(event==='done'&&data.text)answer=data.text;if(answer&&coachController===controller)$('coachReply').textContent=answer;
      }
    }
    if(!answer)throw new Error('답변이 도착하지 않았습니다. 다시 질문해주세요.');
    state.evidence.push({kind:'question',step:state.step,question,answer,at:Date.now()});save();
  }catch(error){if(error.name!=='AbortError'&&coachController===controller)$('coachReply').textContent=error.message;}
  finally{if(coachController===controller){coachController=null;$('askSend').disabled=false;$('askStop').hidden=true;}}
};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
$('library').onclick=async()=>{
  $('libraryDialog').showModal();const host=$('materialList');host.textContent='자료 색인을 읽는 중입니다.';
  try{const response=await fetch('../../../knowledge/sections.json');if(!response.ok)throw new Error();const data=await response.json();host.replaceChildren();
    for(const section of data.courses['공업수학1'].sections){const row=document.createElement('div');row.className='material-row';const title=document.createElement('strong');title.textContent=`${section.no} · ${section.title}`;row.append(title);
      for(const source of section.slides||[]){const link=document.createElement('a');link.href='../../../'+source.href;link.target='_blank';link.rel='noopener';link.textContent='교수님 슬라이드 · '+source.label;row.append(link);}
      const info=document.createElement('small');info.textContent=`연결된 수업: ${(section.dates||[]).join(', ')||'색인 없음'} · 녹음과 내용 대조: 미검증`;row.append(info);host.append(row);
    }
  }catch{host.textContent='자료 색인을 불러오지 못했습니다. 출처 메뉴의 직접 링크를 이용해주세요.';}
};
$('records').onclick=()=>{
  $('recordList').replaceChildren();if(!state.evidence.length)$('recordList').textContent='아직 기록이 없습니다. 상담이나 첫 수업부터 시작해주세요.';
  for(const evidence of state.evidence){const row=document.createElement('p');row.textContent=evidence.kind==='diagnostic'?`시작 진단 · ${evidence.choice}`:evidence.kind==='question'?`질문 · ${evidence.question}`:`${evidence.step+1}단계 · ${evidence.correct?'정답':'재시도'} · ${evidence.assisted?'도움 사용':'도움 없이 응답'}`;$('recordList').append(row);}
  $('recordDialog').showModal();
};
$('exportRecord').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='학교-시범수업-기록.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
render();

