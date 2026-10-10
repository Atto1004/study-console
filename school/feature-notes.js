const STORAGE = 'school-feature-notes-v1' + (new URLSearchParams(location.search).get('test') === '1' ? '-test' : '');
const empty = () => ({version:1, notes:[], draft:null});
const element = (tag, text, className) => {
  const el=document.createElement(tag); if(text!==undefined)el.textContent=text;
  if(className)el.className=className; return el;
};
export function mountFeatureNotes({storage=localStorage, context=()=>({})}={}) {
  const menu=document.querySelector('.secondary-menu > div'); if(!menu)return;
  let state=empty(), active=null, loading=false, readable=false;
  const trigger=element('button','메모');trigger.type='button';trigger.id='featureNotes';menu.append(trigger);
  const dialog=element('dialog',undefined,'feature-notes');dialog.setAttribute('aria-label','기능·수정 메모');
  const header=element('header'), heading=element('h2','기능·수정 메모'),close=element('button','닫기');close.type='button';header.append(heading,close);
  const notice=element('p','이 브라우저에 저장됩니다. 자동 검토·수정 반영은 아직 연결하지 않았습니다.','feature-notes-notice');
  const layout=element('div',undefined,'feature-notes-layout'),sidebar=element('aside'),fresh=element('button','새 메모'),list=element('div',undefined,'feature-notes-list');fresh.type='button';sidebar.append(fresh,list);
  const form=element('form'),title=element('input'),category=element('select'),body=element('textarea');
  title.maxLength=120;title.placeholder='예: 문제를 풀 때 정답 확인 버튼 추가';body.maxLength=6000;body.placeholder='생각난 기능이나 고칠 부분을 적어 주세요.';body.rows=10;
  for(const name of ['기능 아이디어','수정 요청','기타'])category.append(element('option',name));
  const label=(name,input)=>{const l=element('label',name);l.append(input);form.append(l);};
  label('제목',title);label('분류',category);label('메모 내용',body);
  const source=element('p',undefined,'feature-notes-context'),status=element('p',undefined,'feature-notes-status');status.setAttribute('role','status');
  const save=element('button','메모 저장');save.type='submit';save.className='feature-notes-save';
  const replies=element('section',undefined,'feature-notes-replies');replies.hidden=true;
  form.append(source,status,save,replies);layout.append(sidebar,form);dialog.append(header,notice,layout);document.body.append(dialog);
  const read=()=>{
    try {const raw=storage.getItem(STORAGE);const data=raw?JSON.parse(raw):empty();
      if(data.version!==1 || !Array.isArray(data.notes) || data.notes.some(n=>!n || typeof n.id!=='string' || typeof n.title!=='string' || typeof n.body!=='string' || typeof n.updatedAt!=='string'))throw new Error('invalid');state=data;readable=true;return true;
    }catch {readable=false;status.textContent='저장된 메모를 읽지 못했습니다. 기존 내용을 보호하기 위해 저장을 중단했습니다.';save.disabled=true;fresh.disabled=true;list.replaceChildren();return false;}
  };
  const persist=()=>{
    if(!readable)return false;
    try {storage.setItem(STORAGE,JSON.stringify(state));return true;}
    catch {status.textContent='저장하지 못했습니다. 내용을 복사해 두고 브라우저 저장 공간을 확인해 주세요.';return false;}
  };
  const values=()=>({title:title.value.trim(),body:body.value.trim(),category:category.value});
  const draft=()=>{
    if(loading || save.disabled)return;
    state.draft={...values(),id:active,context:state.draft?.context||context(),updatedAt:new Date().toISOString()};
    if(persist())status.textContent='작성 중인 내용을 임시 저장했습니다.';
  };
  const date=value=>value?new Date(value).toLocaleString('ko-KR'):'';
  function show(note=null,isDraft=false) {
    loading=true;active=note?.id||null;title.value=note?.title||'';body.value=note?.body||'';category.value=note?.category||'기능 아이디어';
    const origin=note?.context||context();state.draft={...values(),id:active,context:origin};
    source.textContent=[origin.course,origin.part,note?.createdAt&&'작성 '+date(note.createdAt),note?.updatedAt&&'수정 '+date(note.updatedAt)].filter(Boolean).join(' · ');
    status.textContent=isDraft?'임시 저장한 내용을 이어서 작성합니다.':note?'저장한 메모를 수정할 수 있습니다.':'새 메모를 적어 주세요.';
    save.textContent=active?'수정 저장':'메모 저장';replies.replaceChildren();replies.hidden=!note?.replies?.length;
    if(!replies.hidden){replies.append(element('h3','답변'));for(const reply of note.replies){const p=element('p',reply.body);replies.append(p);}}
    loading=false;paintList();
  }
  function paintList() {
    list.replaceChildren();
    if(!state.notes.length){list.append(element('p','저장한 메모가 없습니다.'));return;}
    for(const note of [...state.notes].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))){
      const b=element('button');b.type='button';b.setAttribute('aria-label','메모 열기: '+note.title);b.setAttribute('aria-pressed',String(note.id===active));
      b.append(element('strong',note.title),element('span',note.category+' · '+date(note.updatedAt)));
      b.onclick=()=>{show(note);persist();};list.append(b);
    }
  }
  form.addEventListener('input',draft);form.addEventListener('change',draft);
  form.onsubmit=e=>{
    e.preventDefault();if(!readable)return;const input=values();if(!input.body){status.textContent='메모 내용을 적어 주세요.';body.focus();return;}
    const now=new Date().toISOString(),old=state.notes.find(n=>n.id===active);
    const note={...old,...input,id:old?.id||(crypto.randomUUID?.()||'note-'+Date.now()+'-'+Math.random().toString(36).slice(2)),title:input.title||input.body.split('\n')[0].slice(0,60),createdAt:old?.createdAt||now,updatedAt:now,context:old?.context||state.draft?.context||context(),replies:old?.replies||[]};
    const before=state;state={...state,notes:[...state.notes.filter(n=>n.id!==note.id),note],draft:null};
    if(!persist()){state=before;return;}show(note);state.draft=null;status.textContent='저장했습니다.';
  };
  fresh.onclick=()=>{show();persist();body.focus();};
  close.onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>trigger.focus());
  trigger.onclick=()=>{
    document.querySelector('.secondary-menu').open=false;save.disabled=false;fresh.disabled=false;active=null;
    const ok=read();dialog.showModal();if(ok)show(state.draft,state.draft!==null);body.focus();
  };
  return {dialog,trigger};
}
mountFeatureNotes({context:()=>({course:document.querySelector('.subject-context strong')?.textContent||document.querySelector('#roomLabel')?.textContent||'',part:document.querySelector('.subject-context p')?.textContent||document.querySelector('#stepLabel')?.textContent||'',url:location.pathname+location.search})});
