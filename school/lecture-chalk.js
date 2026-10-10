// Emphasis describes the supplied lesson text. It never estimates exam odds.
const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
const classify = text => /주의|안 된다|않는다|불가능|혼동|반례|틀리|주의점/.test(text) ? 'warning'
  : /암기|기억|외우|반드시/.test(text) ? 'memory'
  : /조건|정의|일 때|같아야|성립|가능/.test(text) ? 'condition'
  : /예제|예시|Ex\s*\d|풀이|계산/.test(text) ? 'example' : 'concept';
const LABEL = {warning:'주의',memory:'기억할 것',condition:'성립 조건',example:'풀이 포인트',concept:'핵심 개념'};
export function chalkLines(value) {
  const formulas=[];
  const protectedText=String(value || '').replace(/\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|(?<!\$)\$(?!\$)[^$]*\$/g, text=>{formulas.push(text);return '\uE000'+(formulas.length-1)+'\uE001';});
  return protectedText.split(/\n+/).filter(text=>text.trim()).map(text=>text.replace(/\uE000(\d+)\uE001/g,(_,i)=>formulas[Number(i)]));
}
export function chalkPages(value, limit=440) {
  const pages=[];let page='',rows=0;
  const lines=chalkLines(value).flatMap(line=>{
    if(line.length<=limit || /\\\[|\\\(|\$/.test(line))return [line];
    const parts=[];let rest=line;
    while(rest.length>limit){let cut=rest.lastIndexOf(' ',limit);if(cut<limit/2)cut=limit;parts.push(rest.slice(0,cut));rest=rest.slice(cut).trimStart();}
    if(rest)parts.push(rest);return parts;
  });
  for(const line of lines) {
    if(page && (page.length+line.length+2>limit || rows>=4)){pages.push(page);page='';rows=0;}
    page+=(page?'\n\n':'')+line;rows++;
  }
  if(page)pages.push(page);
  return pages.length?pages:[''];
}
export function chalkBoardText(steps, index) {
  const step=steps[index]; if(!step) return '';
  if(step.options || ['quiz','reflection'].includes(step.kind)) return step.body || '';
  let first=index,last=index;
  while(first>0 && steps[first-1].title===step.title && !steps[first-1].options && !['quiz','reflection'].includes(steps[first-1].kind))first--;
  while(last+1<steps.length && steps[last+1].title===step.title && !steps[last+1].options && !['quiz','reflection'].includes(steps[last+1].kind))last++;
  const seen=new Set(),parts=[];
  for(const item of steps.slice(first,last+1))for(const line of chalkLines(item.body)){
    const key=clean(line);if(key && key!==clean(step.title) && !seen.has(key)){seen.add(key);parts.push(line);}
  }
  return parts.join('\n\n');
}

export function chalkNote(step, spoken = '') {
  if (!step || step.options || step.kind === 'quiz') return null;
  const title = clean(step.title), said = clean(spoken);
  const candidates = chalkLines(step.body).map(clean)
    .filter(text => text && text !== title && text !== said && !/^[#*\-\s]+$/.test(text));
  // Prefer an explicit condition, warning or memory cue over a repeated heading.
  const text = candidates.find(t => classify(t) !== 'concept') || candidates.find(t => !/\\\[|\$\$/.test(t)) || candidates[0];
  if (!text) return null;
  const kind = classify(text);
  return {kind,label:LABEL[kind],text};
}

export function decorateChalk(host, step) {
  host.dataset.emphasis = /★|키 포인트|중요|핵심/.test(step?.title || '') ? 'key' : 'normal';
  const content = host.querySelector('.content'); if (!content || content.dataset.chalk) return;
  content.dataset.chalk = 'true';
  // A TeX block is indivisible, even if it contains line breaks.
  const tokens = chalkLines(content.textContent);
  content.replaceChildren();
  for (const text of tokens) {
    if (!text.trim()) continue;
    const kind = classify(text), row = host.ownerDocument.createElement('p');
    row.className = 'chalk-row chalk-' + kind;
    if (kind === 'memory' || /중요|핵심|키 포인트/.test(text)) {
      const star = host.ownerDocument.createElement('span'); star.className='chalk-star'; star.textContent='★ '; star.setAttribute('aria-hidden','true'); row.append(star);
    }
    // Keep equations and every source word intact for the existing math renderer.
    row.append(host.ownerDocument.createTextNode(text)); content.append(row);
  }
  const caption = host.querySelector('.caption');
  if (caption) {
    const tag = host.ownerDocument.createElement('span'); tag.className='chalk-key';
    tag.textContent = step?.difficulty ? '난이도 · ' + step.difficulty : step?.kind === 'remember' ? '암기 연결' : step?.kind === 'example' ? '풀이 적용' : '개념과 조건';
    caption.append(tag);
  }
}
