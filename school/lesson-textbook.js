import { splitText } from './learning.js';

// 수업 원자료 중 읽기 단계만 사용한다. 문제·정답·피드백은 이 패널의 자료가 아니다.
const readableKinds = new Set(['understand', 'remember', 'concept', 'visual', 'example']);
const node = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
};

export function createLessonTextbook({ math = () => {}, onStep = () => {} } = {}) {
  const el = node('section', 'lesson-textbook');
  el.setAttribute('aria-label', '수업교재');
  const header = node('header', 'lesson-textbook-header');
  const heading = node('h2', '', '수업교재');
  const metadata = node('p', 'lesson-textbook-meta');
  header.append(heading, metadata);
  const contents = node('nav', 'lesson-textbook-contents');
  contents.setAttribute('aria-label', '교재 목차');
  const title = node('h3', 'lesson-textbook-title');
  const readingGuide = node('p', 'lesson-textbook-guide');
  const illustration = node('figure', 'lesson-textbook-figure'); illustration.hidden = true;
  const body = node('div', 'lesson-textbook-body');
  body.setAttribute('aria-live', 'polite');
  const pages = node('div', 'lesson-textbook-pages');
  const previous = node('button', '', '이전 쪽');
  const position = node('span');
  const next = node('button', '', '다음 쪽');
  previous.type = next.type = 'button';
  pages.append(previous, position, next);
  el.append(header, contents, title, readingGuide, illustration, body, pages);
  let material = [], page = 0, sourceText = '', pageLimit = 300, renderVersion = 0;
  function paginate() {
    material = [];
    for (const part of sourceText.trim() ? splitText(sourceText, pageLimit) : []) {
      const previous = material.at(-1);
      if (previous && previous.length + part.length + 2 <= pageLimit) material[material.length - 1] += '\n\n' + part;
      else material.push(part);
    }
    page = Math.min(page, Math.max(0, material.length - 1));
  }

  function showPage() {
    body.replaceChildren();
    const text = material[page] || '이 수업 단계에 연결된 개념·예제 자료가 없습니다.';
    for (const paragraph of text.split(/\n\s*\n/)) body.append(node('p', 'textbook-paragraph', paragraph));
    position.textContent = material.length ? `${page + 1} / ${material.length}쪽` : '자료 없음';
    previous.disabled = page <= 0;
    next.disabled = page >= material.length - 1;
    math(body);
    const version = renderVersion;
    globalThis.requestAnimationFrame?.(() => {
      if (version === renderVersion && body.clientHeight > 30 && body.scrollHeight > body.clientHeight + 2 && pageLimit > 45) {
        pageLimit = Math.max(45, Math.floor(pageLimit * .65)); paginate(); showPage();
      }
    });
  }
  previous.addEventListener('click', () => { if (page > 0) { page--; showPage(); } });
  next.addEventListener('click', () => { if (page < material.length - 1) { page++; showPage(); } });
  if (globalThis.ResizeObserver) {
    let lastSize = '';
    new ResizeObserver(() => {
      const size = `${body.clientWidth}:${body.clientHeight}`;
      if (size === lastSize || body.clientHeight <= 30) return;
      lastSize = size;
      showPage();
    }).observe(body);
  }

  function render(lesson, index = 0) {
    const steps = Array.isArray(lesson?.steps) ? lesson.steps : [];
    const entries = [];
    steps.forEach((step, stepIndex) => {
      if (!readableKinds.has(step.kind)) return;
      const prior = entries.at(-1);
      if (prior && prior.endIndex === stepIndex - 1 && prior.step.title === step.title) {
        prior.parts.push(step.body || step.speech || ''); prior.endIndex = stepIndex;
      } else entries.push({step,stepIndex,endIndex:stepIndex,parts:[step.body || step.speech || '']});
    });
    const selected = entries.find(entry => entry.stepIndex <= index && entry.endIndex >= index)
      || entries.filter(entry => entry.stepIndex <= index).at(-1);
    metadata.textContent = [lesson?.date, lesson?.title].filter(Boolean).join(' · ');
    contents.replaceChildren();
    // 목차도 버튼 페이지로 나누므로 많은 단계가 있어도 패널을 밀어내지 않는다.
    const selectedPosition = selected ? entries.indexOf(selected) : 0;
    let contentsPage = Math.floor(selectedPosition / 3);
    function showContents() {
      contents.replaceChildren();
      const back = node('button', 'lesson-textbook-toc-page', '앞 목차');
      back.type = 'button'; back.disabled = contentsPage === 0;
      back.addEventListener('click', () => { contentsPage--; showContents(); });
      contents.append(back);
      for (const { step } of entries.slice(contentsPage * 3, contentsPage * 3 + 3)) {
        const button = node('button', '', step.title || '수업 자료');
        button.type = 'button';
        if (selected?.step === step) button.setAttribute('aria-current', 'page');
        button.addEventListener('click', () => onStep(step.id));
        contents.append(button);
      }
      const forward = node('button', 'lesson-textbook-toc-page', '뒤 목차');
      forward.type = 'button'; forward.disabled = (contentsPage + 1) * 3 >= entries.length;
      forward.addEventListener('click', () => { contentsPage++; showContents(); });
      contents.append(forward);
    }
    contents.hidden = !entries.length;
    showContents();
    title.textContent = selected?.step.title || '연결 자료';
    const example = /예제|Ex\d|계산/i.test(selected?.step.title || '');
    const sourceLabel = String(lesson?.id || '').startsWith('draft:') ? 'AI 보충 자료' : lesson?.generated || String(lesson?.id || '').startsWith('exam-') ? '자체 제작 시험 대비' : '연결된 수업 자료';
    readingGuide.textContent = (example ? '예제 풀이' : '개념 이해') + ' · ' + sourceLabel + ' · ' + (selected?.parts.length || 0) + '개 단계';
    illustration.replaceChildren(); illustration.hidden = true;
    if (/곱셈|행렬곱/.test(selected?.step.title || '')) {
      illustration.hidden = false;
      const diagram = node('div');
      diagram.innerHTML = '<svg viewBox="0 0 360 68" role="img" aria-label="행렬곱의 크기: 앞의 열 수와 뒤의 행 수가 같으면 결과는 앞의 행 수와 뒤의 열 수"><rect x="5" y="8" width="96" height="45" rx="7" fill="#edf1e9"/><text x="53" y="36" text-anchor="middle" fill="#263c2c" font-size="20">m × n</text><text x="119" y="36" fill="#5c705a" font-size="20">·</text><rect x="144" y="8" width="96" height="45" rx="7" fill="#edf1e9"/><text x="192" y="36" text-anchor="middle" fill="#263c2c" font-size="20">n × r</text><text x="255" y="36" fill="#5c705a" font-size="20">→</text><text x="320" y="36" text-anchor="middle" fill="#263c2c" font-size="20">m × r</text><path d="M78 54 Q140 75 174 54" fill="none" stroke="#ad9058" stroke-width="2"/></svg>';
      illustration.append(diagram,node('figcaption','','안쪽 크기 n이 같아야 곱할 수 있습니다.'));
    }
    const unique = new Set();
    const text = selected?.parts.filter(part => {
      if (typeof part !== 'string' || !part.trim() || unique.has(part.trim())) return false;
      unique.add(part.trim()); return true;
    }).join('\n\n') || '';
    sourceText = text; pageLimit = 300; renderVersion++; page = 0; paginate();
    showPage();
  }
  render(null);
  return { el, render };
}
