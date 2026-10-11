// 판서 쪽(교실 수업): 서버가 판서 칸 하나를 칠판 줄마다 한 단계로 나누고(id = 「칸:줄」), 칸의 스앵님 말을 모든 줄에 똑같이 붙인다.
// 그래서 같은 말이 줄 수만큼 반복되고 줄마다 확인 질문이 붙었다(대표님 10/11). 여기서 칸 안 위치를 계산해
//  · 칸의 말은 줄마다 나눠 한 번씩만 하고(lecture.js)
//  · 칸 끝·단원 끝에서만 멈춘다(tutor.js).
const PAGE = /^(.*):(\d+)$/;
const PRACTICE = /직접 풀기|직접 풀어/;

export function boardPage(c) {
  const steps = c?.lesson?.steps, i = c?.index;
  if (!Array.isArray(steps) || !steps[i]) return null;
  const m = PAGE.exec(String(steps[i].id || ''));
  if (!m) return null;
  const base = m[1], k = +m[2];
  let first = i; while (first > 0 && PAGE.exec(String(steps[first - 1].id || ''))?.[1] === base) first--;
  let last = i; while (last + 1 < steps.length && PAGE.exec(String(steps[last + 1].id || ''))?.[1] === base) last++;
  const n = last - first + 1, step = steps[i];
  const nextStep = steps[last + 1];
  const speech = String(step.speech || '').trim();
  const itemBodies = steps.slice(first, last + 1).map((s) => s.body || '').join('\n');
  // 바로 앞 칸이 「직접 풀기」 칸(벼락치기 문제 칸)이면 이미 멈췄으니 이 칸의 물음에서는 다시 멈추지 않는다(오타 설계 10/11 · 이중 멈춤 방지)
  const prevBase = first > 0 ? PAGE.exec(String(steps[first - 1].id || ''))?.[1] : null;
  let prevStart = first - 1; while (prevBase && prevStart > 0 && PAGE.exec(String(steps[prevStart - 1].id || ''))?.[1] === prevBase) prevStart--;
  const afterPractice = !!prevBase && PRACTICE.test(steps.slice(prevStart, first).map((s) => (s.body || '') + ' ' + (s.speech || '')).join('\n'));   // 문제 칸 표시는 칠판 줄 또는 대사(10/12: 칠판 자리 아끼려 대사로 옮김)
  return {
    base, k, n, first: i === first, itemEnd: i === last,
    sectionEnd: i === last && (!nextStep || nextStep.title !== step.title || !!nextStep.options),
    practice: PRACTICE.test(itemBodies) || PRACTICE.test(speech),
    asks: /[?？]\s*$/.test(speech) && !afterPractice,
  };
}

// 칸의 말(문장 여러 개)을 칸의 줄 수만큼 순서대로 나눈다. 문장이 줄보다 적으면 앞 줄부터 하나씩 주되
// 마지막 문장은 늘 마지막 줄에 — 물음으로 끝나는 칸이 물음 뒤에 줄을 더 쓰지 않고 바로 멈추게(오타 10/11 1차 RED 1)
export function speechShare(sentences, k, n) {
  const len = sentences.length;
  if (!len || n <= 1) return k === 0 ? sentences : [];
  if (len <= n) { if (k === n - 1) return [sentences[len - 1]]; return k < len - 1 ? [sentences[k]] : []; }
  return sentences.filter((_, j) => Math.min(n - 1, Math.floor((j * n) / len)) === k);
}
