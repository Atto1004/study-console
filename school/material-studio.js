import { sourceHidden } from './lesson-order.js';
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const btn=(text,go)=>{const b=el('button',text);b.type='button';b.onclick=go;return b;};
const sourceLink=(source)=>{const a=el('a',source.label||source.file);a.href=source.href?'../'+source.href:'/api/school/source-file?id='+source.id;a.target='_blank';a.rel='noopener';return a;};

export function renderMaterialStudio(root,app,data,name,refresh){
  const course=app.catalog().courses.find(c=>c.name===name),files=data.sources.filter(s=>s.course===name&&!sourceHidden(s)),lessons=course?.lessons||[];
  const studio=el('section',undefined,'material-studio');studio.append(el('h2',name+' · 자료 정리·생성'),el('p','원자료 확보 → 회차 정리 → 수업 화면 변환 → 보충 교재 생성. 현재 색인으로 확인한 결과입니다.'));
  const dates=[...new Set([...files.map(s=>s.date),...lessons.filter(l=>!l.generated).map(l=>l.date)])].filter(Boolean).sort().reverse();
  for(const date of dates){
    const sources=files.filter(s=>s.date===date),lesson=lessons.find(l=>l.date===date&&!l.generated),summary=sources.filter(s=>s.kind==='summary');
    const group=el('details',undefined,'material-group');
    group.append(el('summary',date+' · '+(lesson?.title||'수업자료')+' · '+(summary.length?'정리본 있음':'정리본 미확인')+' · '+(lesson?'수업 연결됨':'수업 변환 대기')));
    group.append(el('p',sources.length+'개 자료 · 사진·필기 '+sources.filter(s=>s.kind==='photo').length+' · 녹음·텍스트 '+sources.filter(s=>s.kind==='recording').length+' · 정리본 '+summary.length));
    group.append(el('p',lesson?(lesson.id.startsWith('session:')?'기존 회차 정리본을 단락별 수업으로 변환합니다.':'기존 수업 원문과 교실 데이터를 단계별 수업으로 연결했습니다.'):'수업에 연결할 정리본이 필요합니다. 파일 확보만으로 정리 완료를 표시하지 않습니다.'));
    for(const source of sources){const p=el('p');p.append(sourceLink(source));group.append(p);}
    for(const entry of lessons.filter(l=>l.date===date&&!l.generated)){group.append(el('h4',entry.title),btn('수업 원문·단계 확인',()=>showLesson(entry)),btn('개념·예제·퀴즈 생성',()=>app.generateMaterial(entry.id,name)));}
    studio.append(group);
  }
  if(!dates.length)studio.append(el('p','현재 색인에서 확보된 회차를 확인하지 못했습니다.'));
  const drafts=(app.materialDrafts?.()||[]).filter(d=>d.course===name);
  studio.append(el('h3','생성한 보충 교재 · '+drafts.length+'개'));
  if(!drafts.length)studio.append(el('p','이 과목에 저장된 보충 교재가 아직 없습니다. 위에서 근거 수업을 선택해 생성할 수 있습니다.'));
  for(const draft of drafts){
    const group=el('details',undefined,'material-group');
    group.append(el('summary',draft.title+' · '+({reviewed:'내용 검토 통과',pending:'검토 대기',rejected:'검토 오류'}[draft.review?.status]||'내용 미검증')),el('p','생성 방식: '+(draft.engine||'엔진 미기록')+' · 기반 수업: '+(draft.baseLesson||'미기록')),el('p',draft.generatedAt?'생성 시각: '+new Date(draft.generatedAt*1000).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}):'생성 시각 미기록'));
    for(const source of draft.sources||[]){const p=el('p');if(source.href)p.append(sourceLink(source));else p.textContent=source.label;group.append(p);}
    const open=btn('생성 교재 열기',()=>app.start(draft.id));open.disabled=['rejected','pending'].includes(draft.review?.status);group.append(open);
    if(draft.review?.notice)group.append(el('p',draft.review.notice));
    const preview=el('details');preview.append(el('summary','생성 내용 확인'));
    for(const step of draft.steps||[])preview.append(el('h4',step.title),el('p',step.body));group.append(preview);
    const reviewStatus=el('p');
    const review=btn('내용 검토 다시 요청',async()=>{review.disabled=true;reviewStatus.textContent='원자료와 생성 내용을 다시 검토하고 있습니다.';try{await app.api('review',{lesson:draft.id});await app.refreshLearning();refresh();}catch(error){reviewStatus.textContent=error.message;review.disabled=false;}});
    group.append(review,reviewStatus);
    studio.append(group);
  }
  const exam=lessons.filter(l=>l.generated);
  if(exam.length){studio.append(el('h3','자체 제작 시험 대비 교재'));for(const lesson of exam)studio.append(btn(lesson.title,()=>showLesson(lesson)));}
  studio.append(el('p','사진 OCR·녹음 전사와 회차 정리본 작성은 현재 이 생성 버튼에 포함되지 않습니다. 생성 버튼은 연결된 수업을 바탕으로 보충 설명·예제·퀴즈를 만듭니다.'),btn('확보 현황·누락·교수 규칙 확인',()=>app.materialSources(name)),btn('생성 목록 새로 확인',async()=>{await app.refreshLearning();refresh();}));
  root.append(studio); app.formatMaterial?.(studio);
  async function showLesson(lesson){
    const host=app.panel(lesson.date+' · 생성 근거');host.append(el('p','수업 원문을 확인하는 중…'));
    try{const source=await app.api('lesson?id='+encodeURIComponent(lesson.id));if(!host.isConnected)return;host.replaceChildren(el('h2',source.title));
      for(const warning of source.warnings||[])host.append(el('p',warning));
      for(const item of source.sources||[]){const p=el('p');if(item.href)p.append(sourceLink(item));else p.textContent=item.label;host.append(p);}
      for(const title of new Set(source.steps.map(s=>s.title)))host.append(el('p',title));
      host.append(btn('이 수업으로 보충 교재 생성',()=>app.generateMaterial(lesson.id,source.course)));
    }catch(error){host.replaceChildren(el('p',error.message,'error'),btn('다시 확인',()=>showLesson(lesson)));}
  }
}
