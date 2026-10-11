import { textbookEmphasis } from './lecture-chalk.js?v=235';
const labels = {warning:'주의 · 혼동하지 않기',memory:'꼭 기억할 것',condition:'성립 조건',example:'풀이 흐름',concept:'개념 정리'};

export function presentNotebookPage(body, title) {
  let prior = '';
  for (const row of body.querySelectorAll('.textbook-paragraph')) {
    const text = row.textContent.trim();
    row.dataset.noteDuplicate = String(text === title.trim());
    if (row.dataset.noteDuplicate === 'true') continue;
    const formula = !!row.querySelector('.katex-display') || /\\\[|\$\$/.test(text);
    const symbols = !formula && /단위벡터|스칼라 성분|[a-zA-Z]_[a-zA-Z].*=/.test(text);
    const kind = formula ? 'formula' : symbols ? 'symbols' : /정의/.test(text) ? 'definition' : /주의|혼동|반례/.test(text) ? 'warning' : /조건|같아야|성립|일 때/.test(text) ? 'condition' : /암기|기억|외우|반드시|★/.test(text) ? 'memory' : /풀이|예제|계산/.test(text) ? 'example' : 'concept';
    const label = formula ? '공식 · 식의 구조' : symbols ? '기호 읽기' : kind === 'definition' ? '정의' : labels[kind];
    row.dataset.noteKind = kind;
    row.dataset.noteLabel = prior === kind ? '' : label;
    prior = kind;
  }
  // A symbolic sketch of the source's orthogonal components; no made-up values.
  if (/2차원 성분/.test(title) && /벡터 U/.test(body.textContent) && /직교좌표|x·y 성분/.test(body.textContent) && (!body.clientHeight || body.clientHeight > 300)) {
    const figure = body.ownerDocument.createElement('figure');
    figure.className = 'notebook-diagram';
    figure.innerHTML = '<svg viewBox="0 0 300 120" role="img" aria-label="벡터 U를 수평 성분 U_x와 수직 성분 U_y로 분해한 개념도"><path d="M40 90H260M40 90V10" stroke="#97a99e" fill="none"/><path d="M40 90H215V27" stroke="#5085a4" stroke-width="2" stroke-dasharray="5 4" fill="none"/><path d="M40 90L215 27M204 27L215 27L207 37" stroke="#315f4e" stroke-width="3" fill="none"/><text x="123" y="110" fill="#426b8b" font-size="15">Uₓ</text><text x="224" y="64" fill="#426b8b" font-size="15">Uᵧ</text><text x="127" y="43" fill="#315f4e" font-size="16">U</text><text x="266" y="95" fill="#718077" font-size="13">x</text><text x="30" y="12" fill="#718077" font-size="13">y</text></svg>';
    const anchor = body.querySelector('.textbook-paragraph:not([data-note-duplicate=true])');
    anchor?.after(figure);
  }
}
