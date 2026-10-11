// 회차 강의안(knowledge/lectures/<lessonId>.json, 세계 기획 v1 10절·3부, 오타 GREEN 10/9).
// 강의안은 대본·판서 순서·섹션만 갖는다. 확인 문제·학습지 문항은 교실 데이터 quiz(문항 원본 하나)를 id 로 가리킬 뿐이다.
// 수업 순서 = 섹션마다 [판서 단계들 → 그 섹션 확인 문제] → 끝에 학습지. 강의안이 없거나 레슨과 안 맞으면 null(기존 경로 그대로).
const cache = new Map();
// 학습지 칸은 문항 id 문자열 또는 {id, kind: 개념|변형|도전, section} (규격 v1.1)
export const sheetIds = (pack) => (pack.worksheet || []).map((w) => (typeof w === 'string' ? w : w?.id));

export function loadPack(lessonId) {
  if (!/^[\w-]{1,80}$/.test(String(lessonId || ''))) return Promise.resolve(null);
  if (!cache.has(lessonId)) {
    cache.set(lessonId, fetch(new URL(`../knowledge/lectures/${lessonId}.json`, document.baseURI), { cache: 'no-cache' })   // 학교 화면은 늘 school/ 아래
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => (p && p.schemaVersion === 1 && p.lessonId === lessonId && Array.isArray(p.sections) ? p : null))
      .catch(() => null));
  }
  return cache.get(lessonId);
}

// 레슨 단계 번호 순서. 강의안이 가리키는 id 가 레슨에 하나라도 없으면(판서가 바뀜) 강의안을 쓰지 않는다.
export function packRoute(pack, steps) {
  const at = new Map(steps.map((s, i) => [s.id, i]));
  const ids = [...pack.sections.flatMap((sec) => [...Object.keys(sec.script || {}), sec.check]), ...sheetIds(pack)];
  const out = ids.map((id) => at.get(id));
  return out.length && out.every((i) => i !== undefined) && new Set(out).size === out.length ? out : null;
}

// 단계 하나가 수업에서 어디인지: 판서(섹션 n) · 확인(섹션 n 끝) · 학습지(n번)
export function place(pack, stepId) {
  for (const [k, sec] of pack.sections.entries()) {
    const ids = Object.keys(sec.script || {});
    if (ids.includes(stepId)) return { role: 'board', n: k + 1, of: pack.sections.length, sec, opening: k === 0 && ids[0] === stepId };
    if (sec.check === stepId) return { role: 'check', n: k + 1, of: pack.sections.length, sec };
  }
  const ws = sheetIds(pack), w = ws.indexOf(stepId);
  return w >= 0 ? { role: 'sheet', n: w + 1, of: ws.length } : null;
}

export function label(pack, stepId) {
  const p = place(pack, stepId);
  if (!p) return '';
  return p.role === 'board' ? `섹션 ${p.n} / ${p.of}` : p.role === 'check' ? `섹션 ${p.n} 확인` : `학습지 ${p.n} / ${p.of}`;
}

// 이 단계에서 스앵님이 할 말 [{say, mood}]. 첫 단계는 입장(지난 시간 회상 + 오늘 목표)부터.
export function packLines(pack, stepId) {
  const p = place(pack, stepId);
  if (!p) return [];
  if (p.role === 'board') {
    // 입장 줄(회상·목표)에는 intro 표시 — 화면은 이 표시가 있는 대사 동안만 입장 카드를 띄운다(4부 보완 B)
    const intro = p.opening ? [...(pack.recap || []), { say: `오늘 목표는 ${pack.goals.length}가지예요.`, mood: 'neutral' },
      ...pack.goals.map((g, i) => ({ say: `${i + 1}. ${g}.`, mood: 'neutral' }))].map((l) => ({ ...l, intro: true })) : [];
    return [...intro, ...(p.sec.script[stepId] || [])];
  }
  if (p.role === 'check') return [{ say: `섹션 ${p.n} 확인 문제예요. 방금 본 예제에서 숫자나 조건만 바꿨어요.`, mood: 'smile' }];
  return p.n === 1 ? [{ say: `이제 오늘 학습지 ${p.of}문제예요. 강의에서 다룬 것만 나와요.`, mood: 'smile' }] : [];
}
