export function lectureStatus(id,events=[],currentId){
  const own=events.filter(e=>e.lesson===id);
  if(own.some(e=>e.kind==='review'&&e.action==='lecture-complete'))return 'complete';
  return id===currentId||own.some(e=>['read','position','answer'].includes(e.kind))?'started':'unheard';
}
export function createSubjectScope({lessons,current,events,topics,select,onOpen=()=>{},onClose=()=>{},fallback=()=>{}}){
  const popup=document.createElement('section');popup.className='subject-scope';popup.hidden=true;popup.setAttribute('role','dialog');popup.setAttribute('aria-label','강의 목차 선택');
  const header=document.createElement('div'),title=document.createElement('strong'),closeButton=document.createElement('button');closeButton.type='button';closeButton.textContent='×';closeButton.setAttribute('aria-label','강의 목차 닫기');header.className='scope-header';header.append(title,closeButton);
  const list=document.createElement('div');list.className='subject-scope-list';list.tabIndex=0;list.setAttribute('aria-label','강의 목차 · 드래그 또는 스크롤로 이동');popup.append(header,list);document.querySelector('.school')?.append(popup);
  let anchor=null,generation=0,drag=null,suppressClick=false,courseName='';
  function space(button){return (document.querySelector('#board')?.getBoundingClientRect().left??innerWidth)-12-(button.getBoundingClientRect().right+8);}
  function place(){if(popup.hidden||!anchor)return;if(space(anchor)<110){close();fallback(courseName);return;}const button=anchor.getBoundingClientRect(),board=document.querySelector('#board')?.getBoundingClientRect(),bar=document.querySelector('.sb')?.getBoundingClientRect();const left=button.right+8,right=(board?.left??innerWidth)-12;popup.style.left=left+'px';popup.style.width=(right-left)+'px';const context=document.querySelector('.subject-context')?.getBoundingClientRect(),top=Math.max(board?.top??74,(context?.bottom??62)+12);popup.style.top=top+'px';popup.style.height=Math.max(120,(bar?.top||innerHeight-80)-top-12)+'px';}
  function close(){if(popup.hidden)return;popup.hidden=true;++generation;anchor?.setAttribute('aria-expanded','false');onClose();anchor?.focus();}
  function center(item){if(item){const r=item.getBoundingClientRect(),parent=list.getBoundingClientRect();list.scrollTop=Math.max(0,list.scrollTop+r.top-parent.top-list.clientHeight/2+r.height/2);}}
  async function expand(row,lesson,token,initial=false){
    let body=row.querySelector('.scope-topics');if(body){body.hidden=!body.hidden;row.querySelector('.scope-lecture').setAttribute('aria-expanded',String(!body.hidden));return;}
    body=document.createElement('div');body.className='scope-topics';body.textContent='목차를 불러오는 중…';row.append(body);row.querySelector('.scope-lecture').setAttribute('aria-expanded','true');
    try{const entries=await topics(lesson);if(token!==generation||popup.hidden)return;body.replaceChildren();for(const [i,topic] of entries.entries()){const b=document.createElement('button');b.type='button';b.textContent=`${i+1}. ${topic.title}`;if(lesson.id===current()?.lesson&&topic.current){b.setAttribute('aria-current','true');}b.onclick=()=>{close();select(lesson.id,topic.stepId);};body.append(b);}if(initial)requestAnimationFrame(()=>center(body.querySelector('[aria-current=true]')||row.querySelector('.scope-lecture')));}
    catch{body.textContent='목차를 불러오지 못했습니다.';const retry=document.createElement('button');retry.textContent='다시 불러오기';retry.onclick=()=>{body.remove();expand(row,lesson,token,initial);};body.append(retry);}
  }
  function open(name,button){if(!popup.hidden&&anchor===button){close();return;}close();if(space(button)<110){fallback(name);return;}anchor=button;courseName=name;const token=++generation;title.textContent=name+' · 목차';list.replaceChildren();popup.hidden=false;anchor.setAttribute('aria-expanded','true');onOpen();place();
    const rows=lessons(name);for(const [i,lesson] of rows.entries()){const row=document.createElement('div');row.className='scope-lesson';const b=document.createElement('button');b.type='button';b.className='scope-lecture';const state=lectureStatus(lesson.id,events(),current()?.lesson);b.dataset.status=state;b.setAttribute('aria-expanded','false');const circle=document.createElement('span');circle.className='scope-number';circle.textContent=state==='complete'?'✓':String(i+1);const text=document.createElement('span');const label=document.createElement('strong');label.textContent=`${i+1}강 · ${lesson.title}`;const meta=document.createElement('small');meta.textContent=lesson.date+' · '+({complete:'수강 완료',started:'수강 중',unheard:'미수강'}[state]);text.append(label,meta);b.append(circle,text);b.onclick=()=>expand(row,lesson,token);if(lesson.id===current()?.lesson)b.setAttribute('aria-current','true');row.append(b);list.append(row);}
    const selected=list.querySelector('.scope-lecture[aria-current=true]');if(selected){center(selected);const row=selected.parentElement,lesson=rows.find(l=>l.id===current()?.lesson);expand(row,lesson,token,true);}list.focus();
  }
  closeButton.onclick=close;
  list.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0){suppressClick=false;drag={y:e.clientY,scroll:list.scrollTop,id:e.pointerId,moved:false};}});
  list.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const delta=e.clientY-drag.y;if(Math.abs(delta)>5&&!drag.moved){drag.moved=true;list.setPointerCapture(e.pointerId);list.classList.add('dragging');}if(drag.moved){e.preventDefault();list.scrollTop=drag.scroll-delta;}});
  const end=()=>{if(!drag)return;suppressClick=drag.moved;drag=null;list.classList.remove('dragging');};list.addEventListener('pointerup',end);list.addEventListener('pointercancel',end);
  list.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}},true);
  document.addEventListener('pointerdown',e=>{if(!popup.hidden&&!popup.contains(e.target)&&!anchor?.contains(e.target))close();});
  popup.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}else if(['ArrowLeft','ArrowRight','Enter',' '].includes(e.key))e.stopPropagation();});
  window.addEventListener('resize',place);new ResizeObserver(place).observe(document.querySelector('#room'));new MutationObserver(()=>{if(document.querySelector('.school').dataset.mode!=='classroom')close();}).observe(document.querySelector('.school'),{attributes:true,attributeFilter:['data-mode']});
  return {open,close,el:popup};
}
