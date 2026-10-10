// Display only names supplied by the lesson or its linked concept index.
export function boardHierarchy(lesson,step,course){
  const title=step?.title||lesson?.title||'수업';
  const parts=title.split(/\s+—\s+/),section=course?.nodes?.find(n=>step?.nodes?.includes(n.id)&&/^(?:\d+\.\d+|Ch(?:apter)?\.?\s*\d+)/i.test(n.name||''));
  let parent=step?.parentTitle||step?.sectionTitle||step?.chapterTitle||section?.name?.split(/\s+—\s+/)[0]||(parts.length>1?parts[0]:lesson?.sectionTitle||lesson?.title||'');
  const child=step?.subtopicTitle||step?.subtitle||(parts.length>1?parts.slice(1).join(' — '):title);
  if(parent===child)parent=lesson?.title!==child?lesson?.title:'';
  return {parent:[lesson?.course,parent].filter(Boolean).join(' · '),child};
}
export function createBoardHierarchy(doc,labels,kind){
  const header=doc.createElement('div');header.className='board-hierarchy';header.setAttribute('role','group');header.setAttribute('aria-label','상위 단원과 현재 세부 개념');
  const parent=doc.createElement('div');parent.className='board-parent';parent.textContent=labels.parent;
  const child=doc.createElement('h1');child.textContent=labels.child;
  const cue=doc.createElement('div');cue.className='caption';cue.textContent=kind;
  header.append(parent,child,cue);return header;
}
