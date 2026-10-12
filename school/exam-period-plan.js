export function validExamPeriod(period){
  const time=t=>typeof t==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$|^24:00$/.test(t);
  return !!period&&Array.isArray(period.days)&&period.days.length>0&&period.days.every(d=>d&&/^\d{4}-\d{2}-\d{2}$/.test(d.date)&&typeof d.label==='string'&&Array.isArray(d.events)&&d.events.every(e=>e&&typeof e.title==='string'&&time(e.start)&&time(e.end)&&e.start<e.end));
}
export async function renderExamPeriodPlan(host, today) {
  const el=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
  let period;
  try {const r=await fetch(new URL('../_private/plan.json',import.meta.url),{credentials:'same-origin',cache:'no-store'});if(!r.ok)throw Error('계획을 읽지 못했습니다');period=(await r.json()).examPeriod;}catch(e){host.textContent='시험기간 계획을 읽지 못했습니다. 새로고침해 주세요.';return;}
  if(!host.isConnected)return;
  if(!validExamPeriod(period)){host.textContent='시험기간 계획이 없거나 형식을 확인해야 합니다.';return;}
  host.className='exam-period-plan';host.setAttribute('aria-label','얼라이브위크 시험기간 24시간 계획');
  const select=el('select');select.setAttribute('aria-label','시험기간 계획 날짜');
  for(const d of period.days){const o=el('option',d.label);o.value=d.date;select.append(o);}
  select.value=period.days.some(d=>d.date===today)?today:period.days[0].date;
  const focus=el('p'),now=el('p');now.setAttribute('aria-live','polite');
  const details=el('details'),table=el('table'),head=el('thead'),row=el('tr'),body=el('tbody');
  for(const t of ['시간','일정'])row.append(el('th',t));head.append(row);
  table.append(el('caption','계획 배정 · 실제 수행 기록과 별도'),head,body);
  details.append(el('summary','하루 전체 일정 보기'),table);
  host.append(el('h2','얼라이브위크 · 시험기간 24시간 계획'),select,focus,now,details);
  const style=el('style');style.textContent='.exam-period-plan{margin:14px 0;padding:16px;background:var(--card,#fff);border:1px solid var(--line,#dce4db);border-radius:12px;color:var(--ink,#223329)}.exam-period-plan h2{font-size:18px;margin:0 0 12px}.exam-period-plan select{max-width:100%;min-height:44px;font:inherit}.exam-period-plan summary{padding:10px 0;cursor:pointer}.exam-period-plan table{width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed}.exam-period-plan th,.exam-period-plan td{padding:8px 6px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line,#dce4db);overflow-wrap:anywhere}.exam-period-plan th:first-child,.exam-period-plan td:first-child{width:95px}.exam-period-plan caption{text-align:left;padding:8px 0}.exam-period-plan td small{display:block;margin-top:4px}';host.append(style);
  const min=t=>Number(t.slice(0,2))*60+Number(t.slice(3));
  function draw(){
    const d=period.days.find(d=>d.date===select.value);if(!d)return;focus.textContent=d.focus||'';
    const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    const time=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date());
    const current=d.date===date?d.events.find(e=>min(e.start)<=min(time)&&min(time)<min(e.end)):null;
    const next=current?d.events[d.events.indexOf(current)+1]:null;
    now.textContent=current?'지금 계획: '+current.title+(next?' · 다음 '+next.start+' '+next.title:''):'선택한 날짜의 계획입니다.';
    body.replaceChildren(...d.events.map(e=>{const tr=el('tr'),td=el('td',e.title);if(e.detail)td.append(el('small',e.detail));tr.append(el('td',e.start+'–'+e.end),td);return tr;}));
  }
  select.onchange=draw;draw();
  const tick=setInterval(()=>{if(host.isConnected)draw();else clearInterval(tick);},60000);
}
