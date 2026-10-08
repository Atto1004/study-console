// 강의 재생기(교실 v3 2절, 대표님 10/8 「재생하면 선생님이 강의를 해줘야지」「자막·말풍선·대화창」).
// 단계에 들어가면 바로 강의: 대본(그 단계 speech + 칠판 내용)을 문장으로 나눠, 문장마다
//   칠판에 그만큼 써지고(위→아래로 드러남) · 말풍선 자막이 뜨고 · 스앵님이 말하고(게임: 3D 입·몸짓 / 사이트: 초상)
//   · 음성이 켜져 있으면 읽어 준다(꺼져 있으면 글자 수만큼 기다림).
// ▶/⏸ 강의 멈춤·다시, ⏮ 이 단계 처음부터, ⏭ 다음 문장(끝이면 onEnd 뒤 「다음 단계」는 school.js).
const splitSentences = (text) => String(text || '')
  .replace(/\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]/g, (m) => m.replace(/[.!?。]/g, '․'))   // 수식 안 마침표로 자르지 않게
  .split(/(?<=[.!?。…])\s+|\n{1,}/).map((s) => s.replace(/․/g, '.').trim()).filter((s) => s.length > 1);
const plain = (s) => s.replace(/\$\$?|\\\(|\\\)|\\\[|\\\]/g, '').replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}_^]/g, '').replace(/\s+/g, ' ').trim();

export function createLecture(app) {
  // app: { ctx(), talk(on), say(text), subtitle(text|null), board(fraction), voiceOn(), voice(text, signal) → Promise, onEnd(), onState(state) }
  let lines = [], i = 0, playing = false, timer = null, abort = null, key = '', ended = false;
  const total = () => lines.reduce((n, l) => n + l.length, 0) || 1;
  const done = () => lines.slice(0, i + 1).reduce((n, l) => n + l.length, 0) / total();
  const state = () => app.onState?.({ playing, index: i, count: lines.length, ended });

  function build() {
    const c = app.ctx(); if (!c) return [];
    const intro = splitSentences(c.step.speech);
    const body = splitSentences(c.step.body);
    const head = c.step.title ? [c.step.title + (c.step.options ? ' — 문제부터 볼게요.' : '.')] : [];
    const seen = new Set(); const out = [];
    for (const s of [...intro, ...head, ...body]) { const k = plain(s); if (k && !seen.has(k)) { seen.add(k); out.push(s); } }
    if (c.step.options) out.push('보기 중에서 직접 골라 보세요.');
    return out.slice(0, 24);
  }
  function clear() { clearTimeout(timer); timer = null; abort?.abort(); abort = null; }
  async function speakLine(idx) {
    const text = lines[idx]; if (text == null) return;
    app.board?.(done()); app.subtitle?.(text); app.talk?.(true);
    const k = key, ms = Math.max(1800, Math.min(9000, plain(text).length * 95));
    if (app.voiceOn?.()) {
      abort = new AbortController();
      try { await app.voice(plain(text), abort.signal); } catch { /* 음성 실패면 시간으로 */ await wait(ms); }
    } else await wait(ms);
    if (k !== key || !playing) return;
    app.talk?.(false);
    if (idx + 1 < lines.length) { i = idx + 1; state(); speakLine(i); }
    else finish();
  }
  function wait(ms) { return new Promise((res) => { timer = setTimeout(res, ms); }); }
  function finish() { clear(); playing = false; ended = true; app.talk?.(false); app.board?.(1); app.subtitle?.(null); state(); app.onEnd?.(); }

  return {
    // 단계가 바뀔 때 school.js 가 부른다 — 바로 강의 시작
    start() {
      clear(); const c = app.ctx(); if (!c) return;
      key = c.lesson.id + '/' + c.step.id; lines = build(); i = 0; ended = false;
      if (!lines.length || c.passed) { finish(); return; }
      playing = true; app.board?.(0); state(); speakLine(0);
    },
    toggle() {
      if (ended) { this.restart(); return; }
      if (playing) { playing = false; clear(); app.talk?.(false); state(); }
      else { playing = true; state(); speakLine(i); }
    },
    restart() { const c = app.ctx(); if (!c) return; clear(); key = c.lesson.id + '/' + c.step.id + '#' + Date.now(); lines = build(); i = 0; ended = false; playing = true; app.board?.(0); state(); speakLine(0); },
    // ⏭: 강의 중이면 다음 문장, 끝났으면 false(다음 단계는 school.js)
    skip() { if (ended) return false; clear(); key += '+'; if (i + 1 < lines.length) { i++; state(); if (playing) speakLine(i); else { app.board?.(done()); app.subtitle?.(lines[i]); } } else finish(); return true; },
    stop() { clear(); playing = false; key += '~'; app.talk?.(false); app.subtitle?.(null); },
    get playing() { return playing; }, get ended() { return ended; },
  };
}
