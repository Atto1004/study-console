const minutes=t=>Number(t.slice(0,2))*60+Number(t.slice(3));
const sourceId=b=>b.k==='class'?b.cls?.id:b.k==='cal'?b.ev?.id:b.k==='work'?b.routine?.id:b.id;
export const periodPlanKey=(date,event)=>JSON.stringify([date,event.start,event.end,event.kind,event.title]);
export const periodEditable=event=>!!event&&['study','task','sleep','life'].includes(event.kind);
export function mergeExamTimeline(base,day,dismissed={}){
 const time=t=>typeof t==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$|^24:00$/.test(t);
 if(!day||!/^\d{4}-\d{2}-\d{2}$/.test(day.date)||!Array.isArray(day.events)||!day.events.every(e=>e&&typeof e.title==='string'&&time(e.start)&&time(e.end)&&e.start<e.end))return base;
 // 원본은 이름으로 지우거나 시각을 바꾸지 않는다. 휴강은 날짜와 확인된 수업 ID만 사용한다.
 const retained=base.filter(b=>!(b.k==='class'&&b.date===day.date&&Array.isArray(day.cancelledClassIds)&&day.cancelledClassIds.includes(b.cls?.id)));
 const planned=day.events.flatMap((e,i)=>{
  const periodKey=periodPlanKey(day.date,e);
  if(periodEditable(e)&&dismissed[periodKey])return [];
  const ref=e.sourceRef;
  if(ref?.id&&retained.some(b=>b.k===ref.kind&&sourceId(b)===ref.id&&b.date===day.date))return [];
  const category=['fixed','work','exam'].includes(e.kind)?'고정':e.kind==='sleep'?'수면':e.kind==='study'?'공부':e.kind==='task'?'과제':/아침|점심|저녁/.test(e.title)?'밥':/준비/.test(e.title)?'준비':/이동|출발|귀가|등교/.test(e.title)?'이동':'준비';
  return {s:minutes(e.start),e:minutes(e.end),title:e.title,k:'exam-period',category,date:day.date,periodEntry:e,periodIndex:i,periodKey};
 });
 // 목표 수면과 실제 수면을 원본 그대로 보존한다.
 return [...retained,...planned].sort((a,b)=>a.s-b.s);
}
export async function readExamPeriod(fetcher,url,timeoutMs=4000){
 const controller=new AbortController();let timer;
 try{return await Promise.race([
  (async()=>{const r=await fetcher(url,{credentials:'same-origin',cache:'no-store',signal:controller.signal});if(!r.ok)return null;const j=await r.json();return Array.isArray(j.examPeriod?.days)?j.examPeriod:null;})(),
  new Promise(resolve=>{timer=setTimeout(()=>{controller.abort();resolve(null);},timeoutMs);})
 ]);}catch{return null;}finally{clearTimeout(timer);controller.abort();}
}
