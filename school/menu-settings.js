const paths={
  settings:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  note:'M5 3h14v18H5z M8 7h8 M8 11h8 M8 15h5',
  book:'M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3z M12 6v15',
  folder:'M3 5h7l2 3h9v12H3z',
  chart:'M4 3v18h17 M8 17v-5 M13 17V8 M18 17V5',
  map:'M3 5l6-2 6 2 6-2v16l-6 2-6-2-6 2z M9 3v16 M15 5v16',
  mail:'M3 5h18v14H3z M3 5l9 7 9-7',
  check:'M6 3h12v18H6z M9 11l2 2 4-4 M9 17h6',
  link:'M10 8l3-3a4 4 0 0 1 6 6l-3 3 M14 16l-3 3a4 4 0 0 1-6-6l3-3 M8 16l8-8',
  help:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M9 8a3 3 0 0 1 6 1c0 2-3 2-3 4 M12 17h.01'
};
export function menuIcon(label){
  const key=/설정/.test(label)?'settings':/메모/.test(label)?'note':/자료실/.test(label)?'folder':/과목/.test(label)?'book':/기록/.test(label)?'chart':/지도/.test(label)?'map':/메일/.test(label)?'mail':/결재/.test(label)?'check':/연동/.test(label)?'link':'help';
  return `<svg class="school-menu-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[key]}"/></svg>`;
}
export function mountSettingsMenu(){
  const menu=document.querySelector('.secondary-menu>div');if(!menu)return;
  const learning=document.getElementById('learnSettings'),teacher=document.getElementById('settings');if(!learning||!teacher)return;
  const sources=document.createElement('div');sources.hidden=true;sources.className='settings-sources';sources.append(learning,teacher);document.body.append(sources);
  const trigger=document.createElement('button');trigger.type='button';trigger.id='schoolSettings';trigger.textContent='설정';menu.append(trigger);
  const dialog=document.createElement('dialog');dialog.className='school-settings';dialog.setAttribute('aria-label','설정');
  const header=document.createElement('header'),title=document.createElement('h2'),close=document.createElement('button');title.textContent='설정';close.textContent='닫기';close.type='button';header.append(title,close);dialog.append(header);
  for(const [name,description,target] of [['학습 설정','공부 방식, 화면과 움직임 설정',learning],['스앵님 설정','응답 엔진과 음성 설정',teacher]]){
    const button=document.createElement('button');button.type='button';button.className='school-settings-option';button.innerHTML=menuIcon(name);
    const texts=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=name;small.textContent=description;texts.append(strong,small);button.append(texts);
    button.onclick=()=>{dialog.close();target.click();};dialog.append(button);
  }
  document.body.append(dialog);close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>trigger.focus());trigger.onclick=()=>{document.querySelector('.secondary-menu').open=false;dialog.showModal();};
  for(const button of menu.querySelectorAll('button')){const label=button.textContent;button.innerHTML=menuIcon(label);const span=document.createElement('span');span.textContent=label;button.append(span);}
  return {dialog,trigger};
}
mountSettingsMenu();
