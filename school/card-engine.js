// 암기카드 객관식 게이트 엔진 (화면 없음, 순수 로직)
//  · 학교 화면(school/card-gate.js)은 import 하고, 교실 페이지는 build_classroom.py 가 줄머리 `export ` 를 떼어 통째로 끼워 넣는다.
//  · 흐름: 객관식(보기 4 + 몰라요) → 틀림·몰라요만 외우기 → 그 카드만 다시 객관식 → 전부 맞히면
//          한 번이라도 못 맞힌 카드는 「써서 확인」 → 그것까지 통과하면 끝.
//  · 보기 순서는 (seed, 카드 id, 판 번호)로 정해져 시험에서 재현된다. 같은 카드가 다시 나오면 직전 순서와 다르게 바꾼다.

export function hashSeed(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function shuffle(arr, rand) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// 카드 한 장의 보기: [{text, ok}] 4개. mc 가 없으면 null.
export function optionsOf(card, seed, round, last) {
  const m = card && card.mc; if (!m || !m.right || !Array.isArray(m.wrong) || m.wrong.length !== 3) return null;
  const all = [{ text: m.right, ok: true }, ...m.wrong.map((t) => ({ text: t, ok: false }))];
  let out = shuffle(all, rng(hashSeed(seed + '|' + card.id + '|' + round)));
  if (last && out.map((o) => o.text).join('\u0001') === last) out = out.slice(1).concat(out[0]);
  return out;
}

export function createEngine(cards, opts = {}) {
  const seed = opts.seed != null ? String(opts.seed) : String(Date.now());
  const order = cards.map((c) => c.id);
  const E = {
    phase: cards.length ? 'quiz' : 'done', queue: cards.slice(), i: 0, round: 1,
    miss: [],                   // 이번 판에서 틀림·몰라요 낸 카드
    first: {},                  // 카드 id → 처음 낸 결과 ok | wrong | unknown
    ever: new Set(),            // 한 번이라도 못 맞힌 카드 id
    wrote: new Set(),           // 써서 확인을 통과한 카드 id
    writeFail: [], shown: false, answered: null, opts: null, lastOrder: {},
  };
  const rand = rng(hashSeed(seed + '|q'));
  function prepare() { E.answered = null; E.shown = false; E.opts = null;
    if (E.phase === 'quiz') { const c = E.queue[E.i]; E.opts = optionsOf(c, seed, E.round, E.lastOrder[c.id]); if (!E.opts) throw new Error('보기 없는 카드: ' + c.id); E.lastOrder[c.id] = E.opts.map((o) => o.text).join('\u0001'); } }
  function afterQuiz() {
    if (E.miss.length) { E.phase = 'study'; E.queue = E.miss; E.miss = []; E.i = 0; return; }
    const need = cards.filter((c) => E.ever.has(c.id) && !E.wrote.has(c.id));
    if (need.length) { E.phase = 'write'; E.queue = need; E.i = 0; E.writeFail = []; return; }
    E.phase = 'done';
  }
  prepare();
  const E2 = {
    seed,
    view() {
      const c = E.queue[E.i], total = E.queue.length;
      if (E.phase === 'quiz') return { kind: 'quiz', card: c, q: (c.mc && c.mc.q) || c.q, options: E.opts.map((o) => o.text), pos: E.i + 1, total, round: E.round, answered: E.answered };
      if (E.phase === 'study') return { kind: 'study', card: c, pos: E.i + 1, total, last: E.i === total - 1 };
      if (E.phase === 'write') return { kind: 'write', card: c, pos: E.i + 1, total, shown: E.shown };
      return { kind: 'done', summary: E2.summary() };
    },
    // 보기 번호(0~3)로 답하기. 이미 답했으면 무시.
    pick(n) { if (E.phase !== 'quiz' || E.answered || !E.opts[n]) return null; return record(E.opts[n].ok ? 'ok' : 'wrong', n); },
    unknown() { if (E.phase !== 'quiz' || E.answered) return null; return record('unknown', -1); },
    // 답한 뒤 다음 카드로
    next() { if (E.phase !== 'quiz' || !E.answered) return; E.i++; if (E.i >= E.queue.length) { E.round++; afterQuiz(); } prepare(); },
    // 외우기 화면 다음
    studied() { if (E.phase !== 'study') return; E.i++; if (E.i >= E.queue.length) { E.phase = 'quiz'; E.queue = shuffle(E.queue, rand); E.i = 0; } prepare(); },
    reveal() { if (E.phase === 'write') E.shown = true; },
    // 써서 확인: 본인 판정
    judge(ok) { if (E.phase !== 'write' || !E.shown) return;
      const c = E.queue[E.i]; if (ok) E.wrote.add(c.id); else E.writeFail.push(c);
      E.i++; E.shown = false;
      if (E.i >= E.queue.length) { if (E.writeFail.length) { E.phase = 'study'; E.queue = E.writeFail; E.writeFail = []; E.i = 0; } else E.phase = 'done'; }
      prepare(); },
    summary() { const f = Object.values(E.first); return { total: cards.length, ok: f.filter((x) => x === 'ok').length, wrong: f.filter((x) => x === 'wrong').length, unknown: f.filter((x) => x === 'unknown').length, missed: E.ever.size }; },
    state() { return E; },
  };
  function record(result, n) {
    const c = E.queue[E.i];
    if (!(c.id in E.first)) E.first[c.id] = result;
    if (result !== 'ok') { E.miss.push(c); E.ever.add(c.id); }
    const right = E.opts.findIndex((o) => o.ok);
    E.answered = { pick: n, result, right };
    return E.answered;
  }
  return E2;
}
