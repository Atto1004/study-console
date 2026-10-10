const KEY='school-refresh-position-v1';
export function createUpdateCheck({button,loaded,read}){
  let busy=false;
  return async()=>{if(busy)return;busy=true;try{const latest=await read();if(latest&&loaded){const available=latest!==loaded;button.dataset.updateAvailable=String(available);button.title=available?'새 업데이트가 있습니다 · 현재 화면 새로고침':'현재 화면 새로고침';button.setAttribute('aria-description',available?'초록색 점: 새 업데이트를 반영할 수 있습니다.':'현재 최신 버전입니다.');}}catch{/* 연결 실패를 업데이트 없음으로 처리하지 않는다. */}finally{busy=false;}};
}
export function captureRefreshPosition(doc=document, win=window) {
  return {url:win.location.href,at:Date.now(),scrollX:win.scrollX,scrollY:win.scrollY,
    course:doc.querySelector('.management-tools select')?.value,
    kind:doc.querySelector('.kind-filter [aria-pressed=true]')?.textContent.replace(/\s+\d+$/,'').trim(),
    boardPage:parseInt(doc.querySelector('.board-pages span')?.textContent||'1',10),
    textbookPage:parseInt(doc.querySelector('.lesson-textbook-pages span')?.textContent||'1',10),
    chat:doc.querySelector('.sb input')?.value,
    memoOpen:!!doc.querySelector('.feature-notes[open]'),
    sceneScroll:doc.getElementById('scene')?.scrollTop||0};
}
export function restoreRefreshPosition(saved, doc=document, win=window) {
  if(!saved || saved.url!==win.location.href || Date.now()-saved.at>10*60*1000)return false;
  const select=doc.querySelector('.management-tools select');
  if(select && [...select.options].some(o=>o.value===saved.course)){select.value=saved.course;select.dispatchEvent(new Event('change',{bubbles:true}));}
  const kind=[...doc.querySelectorAll('.kind-filter button')].find(b=>b.textContent.replace(/\s+\d+$/,'').trim()===saved.kind);kind?.click();
  for(const [selector,target] of [['.board-pages',saved.boardPage],['.lesson-textbook-pages',saved.textbookPage]]){
    for(let i=0;i<Math.min(100,Number(target)||1);i++){
      const controls=doc.querySelector(selector),page=parseInt(controls?.querySelector('span')?.textContent||'1',10),next=controls?.querySelector('button:last-child');
      if(!next || next.disabled || page>=target)break;next.click();
    }
  }
  const chat=doc.querySelector('.sb input');if(chat && typeof saved.chat==='string')chat.value=saved.chat;
  if(saved.memoOpen)doc.getElementById('featureNotes')?.click();
  win.requestAnimationFrame(()=>{win.scrollTo(Number(saved.scrollX)||0,Number(saved.scrollY)||0);const scene=doc.getElementById('scene');if(scene)scene.scrollTop=Number(saved.sceneScroll)||0;});return true;
}
export function mountSchoolRefresh({beforeReload=async()=>{},status=()=>{}}={}) {
  const header=document.querySelector('.school>header');if(!header)return;
  const button=document.createElement('button');button.type='button';button.className='school-refresh';button.id='schoolRefresh';
  button.setAttribute('aria-label','현재 화면 새로고침');button.title='현재 화면 새로고침';
  button.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.5-1L20 12M4 12l2.4 6A7 7 0 0 0 17.9 17"/></svg>';
  const right=header.querySelector('.gl-right');if(right)right.insertBefore(button,right.querySelector('.gl-office'));else header.append(button);
  const loaded=document.querySelector('script[src*="school.js?"]')?.getAttribute('src');
  const checkUpdate=createUpdateCheck({button,loaded,read:async()=>{const response=await fetch(new URL('index.html',location.href),{cache:'no-store',credentials:'same-origin',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('update');const source=new DOMParser().parseFromString(await response.text(),'text/html');return source.querySelector('script[src*="school.js?"]')?.getAttribute('src');}});
  checkUpdate();setInterval(()=>{if(!document.hidden)checkUpdate();},60000);window.addEventListener('focus',checkUpdate);
  button.onclick=async()=>{
    button.disabled=true;button.setAttribute('aria-busy','true');
    try {await beforeReload();sessionStorage.setItem(KEY,JSON.stringify(captureRefreshPosition()));location.reload();}
    catch(error){status('새로고침 전에 저장하지 못했습니다. '+(error.message||''),true);button.disabled=false;button.removeAttribute('aria-busy');}
  };
  return {restore(){let saved;try{saved=JSON.parse(sessionStorage.getItem(KEY)||'null');sessionStorage.removeItem(KEY);}catch{return;}restoreRefreshPosition(saved);}};
}
