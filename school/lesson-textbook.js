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
  const body = node('div', 'lesson-textbook-body');
  body.setAttribute('aria-live', 'polite');
  const pages = node('div', 'lesson-textbook-pages');
  const previous = node('button', '', '이전 쪽');
  const position = node('span');
  const next = node('button', '', '다음 쪽');
  previous.type = next.type = 'button';
  pages.append(previous, position, next);
  el.append(header, contents, title, body, pages);
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
    body.textContent = material[page] || '이 수업 단계에 연결된 개념·예제 자료가 없습니다.';
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
    const text = selected?.parts.filter(part => typeof part === 'string' && part.trim()).join('\n\n') || '';
    sourceText = text; pageLimit = 300; renderVersion++; page = 0; paginate();
    showPage();
  }
  render(null);
  return { el, render };
}
