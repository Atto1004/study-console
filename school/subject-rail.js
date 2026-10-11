// 과목 레일(교실 v2 1·3절): 강의실은 하나, 왼쪽 세로 레일에서 과목을 고르면 그 과목 수업으로 바뀐다. 1~5 키.
// 과목 이름은 내용이라 글자(첫 글자)로 두고 색 원에 담는다. 이름은 aria-label·말풍선(data-tip).
const short = (name) => (/^[A-Za-z]/.test(name) ? name.slice(0, 1) : [...name][0]);
export function createSubjectRail({ subjects, current, choose, openScope, available = () => true, position }) {
  const rail = document.createElement('nav'); rail.className = 'subject-rail'; rail.setAttribute('aria-label', '과목 바꾸기');
  const context=document.createElement('section');context.className='subject-context';context.setAttribute('aria-label','현재 수업 위치');context.hidden=true;document.querySelector('.school')?.append(context);
  const infoBox=document.createElement('div');context.append(infoBox);
  const toc=document.querySelector('.lesson-textbook-contents');
  if(toc){toc.parentElement.dataset.externalToc='true';const group=document.createElement('section');group.className='subject-textbook-toc';const label=document.createElement('h2');label.textContent='교재 목차';group.append(label,toc);context.append(group);}
  const toggle=document.createElement('button');toggle.type='button';toggle.className='subject-rail-toggle';toggle.setAttribute('aria-controls','subjectRail');document.querySelector('.school')?.append(toggle);
  rail.id='subjectRail';rail.hidden=true;
  const syncToggle=()=>{toggle.textContent=rail.hidden?'>':'<';toggle.setAttribute('aria-expanded',String(!rail.hidden));toggle.setAttribute('aria-label',rail.hidden?'과목 탭 펼치기':'과목 탭 접기');};
  toggle.onclick=()=>{rail.hidden=!rail.hidden;syncToggle();placeContext();};syncToggle();
  const list=document.createElement('div');list.className='subject-list';rail.append(list);
  let page=0,lastCurrent;const pageSize=4;
  const buttons = subjects.map((s, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'subject-chip';
    b.style.setProperty('--c', '#' + (s.color ?? 0x5c6f65).toString(16).padStart(6, '0'));
    b.setAttribute('aria-label', `${s.name} (${i + 1})`); b.dataset.tip = `${s.name} · ${i + 1}`; b.dataset.subject = s.name;
    b.innerHTML = `<span aria-hidden="true"></span><kbd aria-hidden="true">${i + 1}</kbd>`; b.querySelector('span').textContent = short(s.name);
    b.onclick = () => { if (b.dataset.subject === current()) openScope?.(s.name,b); else choose(s.name); };
    list.append(b); return b;
  });
  const controls=document.createElement('div');controls.className='subject-pages';
  const previous=document.createElement('button'),next=document.createElement('button');
  previous.type=next.type='button';previous.textContent='↑';next.textContent='↓';previous.setAttribute('aria-label','앞 과목 보기');next.setAttribute('aria-label','나머지 과목 보기');
  const paintPage=()=>{buttons.forEach((b,i)=>b.hidden=Math.floor(i/pageSize)!==page);previous.disabled=page===0;next.disabled=(page+1)*pageSize>=buttons.length;};
  previous.onclick=()=>{page=Math.max(0,page-1);paintPage();};next.onclick=()=>{page=Math.min(Math.ceil(buttons.length/pageSize)-1,page+1);paintPage();};
  controls.append(previous,next);controls.hidden=buttons.length<=pageSize;rail.append(controls);
  function update() { const now = current(); for (const b of buttons) {
    const active = b.dataset.subject === now;
    b.disabled = !available(b.dataset.subject);b.dataset.ready=String(!b.disabled);
    b.setAttribute('aria-current', String(active));
    b.dataset.tip = `${b.dataset.subject} · ${b.disabled ? '수업 연결 준비 중' : active ? '다시 눌러 수업 범위 선택' : '과목 바꾸기'}`;
    b.setAttribute('aria-label', b.dataset.subject + (b.disabled?' · 준비 중':''));
    if (active && openScope) b.setAttribute('aria-haspopup', 'dialog'); else b.removeAttribute('aria-haspopup');
  }
    const info=position?.();context.hidden=!info;
    if(info){infoBox.replaceChildren();for(const [tag,text] of [['strong',info.course],['span',info.lecture],['p',info.part]]){if(!text)continue;const e=document.createElement(tag);e.textContent=text;infoBox.append(e);}placeContext();}
    const activeIndex=subjects.findIndex(s=>s.name===now);if(activeIndex>=0 && now!==lastCurrent)page=Math.floor(activeIndex/pageSize);lastCurrent=now;paintPage();
  }
  document.querySelector('.school')?.append(rail);
  function placeContext(){const board=document.querySelector('#board')?.getBoundingClientRect();if(!board)return;context.style.left='16px';context.style.top=board.top+'px';context.style.width=Math.max(0,board.left-32)+'px';rail.style.top=board.top+'px';rail.style.left='36px';rail.style.maxHeight='none';const chatTop=document.querySelector('[aria-label="김주영 스앵님과 대화"]')?.getBoundingClientRect().top;const bottomLimit=chatTop>board.top?chatTop-64:window.innerHeight-120;toggle.style.top=Math.max(board.top,Math.min(context.getBoundingClientRect().bottom+16,bottomLimit))+'px';}
  window.addEventListener('resize',placeContext);
  if(document.querySelector('#room')){const layoutObserver=new ResizeObserver(placeContext);layoutObserver.observe(document.querySelector('#room'));layoutObserver.observe(context);}
  window.addEventListener('keydown', (e) => {
    const sc = document.querySelector('.school');
    if (sc.dataset.mode !== 'classroom' || sc.dataset.world === 'walking' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable) return;
    if (document.getElementById('panel')?.open || [...document.querySelectorAll('.setup-sheet,.map-sheet')].some((x) => !x.hidden)) return;
    const n = Number(e.key); if (n >= 1 && n <= subjects.length) { e.preventDefault(); buttons[n - 1].click(); }
  });
  update();
  return { update, el: rail };
}
