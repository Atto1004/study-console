// 강의 재생기(교실 v3 2절, 대표님 10/8 「재생하면 선생님이 강의를 해줘야지」「자막·말풍선·대화창」).
// 단계에 들어가면 바로 강의: 대본(그 단계 speech + 칠판 내용)을 문장으로 나눠, 문장마다
//   칠판에 그만큼 써지고(위→아래로 드러남) · 말풍선 자막이 뜨고 · 스앵님이 말하고(게임: 3D 입·몸짓 / 사이트: 초상)
//   · 음성이 켜져 있으면 읽어 준다(꺼져 있으면 글자 수만큼 기다림).
// ▶/⏸ 강의 멈춤·다시, ⏮ 이 단계 처음부터, ⏭ 다음 문장(끝이면 onEnd 뒤 「다음 단계」는 school.js).
// 재생 한 번 = 세대 하나(오타 검수 10/8 P1): 시작·멈춤·계속·처음부터·건너뛰기마다 세대를 올리고, 이전 세대의
// 타이머·음성은 취소하며, 모든 await 뒤에 세대를 확인해 오래된 재생이 새 강의에 끼어들지 못하게 한다.
const splitSentences = (text) => String(text || '')
  .replace(/\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]/g, (m) => m.replace(/[.!?。]/g, '․'))   // 수식 안 마침표로 자르지 않게
  .split(/(?<=[.!?。…])\s+|\n{1,}/).map((s) => s.replace(/․/g, '.').trim()).filter((s) => s.length > 1);
import { readable } from './readable.js';
const plain = (s) => s.replace(/\$\$?|\\\(|\\\)|\\\[|\\\]/g, '').replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}_^]/g, '').replace(/\s+/g, ' ').trim();

export function createLecture(app) {
  // app: { ctx(), talk(on), subtitle(text|null), board(fraction), voiceOn(), voice(text, signal) → Promise, onEnd(), onState(state),
  //        script(step) → [{say, mood, intro}]|null (회차 강의안, lecture-pack.js), mood(name), line({text, mood, intro}|null) }
  // 줄 하나 = {text, mood}. 강의안이 있으면 그 대본, 없으면 예전처럼 단계 speech·본문으로 만든다.
  let lines = [], i = 0, playing = false, ended = false, gen = 0, run = null;
  const total = () => lines.reduce((n, l) => n + l.text.length, 0) || 1;
  const done = () => lines.slice(0, i + 1).reduce((n, l) => n + l.text.length, 0) / total();
  const state = () => app.onState?.({ playing, index: i, count: lines.length, ended });

  function build() {
    const c = app.ctx(); if (!c) return [];
    // 자막으로 가는 줄은 전부 읽기 쉬운 글자로(수식 원문·내부 파일 표시가 「코드」처럼 뜨던 것, 대표님 10/9). 칠판 원문은 그대로
    // 문제 단계는 풀기 전에 푸는 방법(개념 카드의 예제 풀이) — app.howto(step) → [{say, mood}] (대표님 10/9 「어떻게 푸는지 설명은 해줘야」)
    // 풀이 방법은 자리만 잡아 두고(lazy), 그 줄에 닿을 때 채운다 — 카드가 늦게 와도 강의는 바로 시작(단계 들어가면 바로 강의)
    const how = c.step.options ? [{ text: '…', mood: null, lazy: true }] : [];
    const fix = (arr) => arr.map((l) => (l.lazy ? l : { ...l, text: readable(l.text) })).filter((l) => l.lazy || l.text.length > 1);
    const script = app.script?.(c.step);
    if (script) return fix([...script.filter((l) => l && l.say).map((l) => ({ text: l.say, mood: l.mood || 'neutral', intro: !!l.intro })), ...how]);
    const intro = splitSentences(c.step.speech);
    const body = splitSentences(c.step.body);
    const head = c.step.title ? [c.step.title + (c.step.options ? ' — 문제부터 볼게요.' : '.')] : [];
    const seen = new Set(); const out = [];
    for (const s of [...intro, ...head, ...body]) { const k = plain(s); if (k && !seen.has(k)) { seen.add(k); out.push(s); } }
    const lines = out.slice(0, 24).map((text) => ({ text, mood: null }));
    if (c.step.options) lines.push(...how);
    return fix(lines);
  }
  // 지금 재생을 끊는다: 세대를 올리고, 그 재생이 가진 타이머·음성을 취소(대기 Promise 도 끝낸다)
  function cancel() { gen++; if (run) { clearTimeout(run.timer); run.abort.abort(); run.resolve?.(); run = null; } }
  // 문장 하나를 이 세대로 말한다. 세대가 바뀌면 아무것도 하지 않고 끝난다.
  async function play(idx) {
    const my = ++gen; const r = { timer: null, abort: new AbortController(), resolve: null }; run = r;
    const alive = () => my === gen && playing;
    const wait = (ms) => new Promise((res) => { r.resolve = res; r.timer = setTimeout(res, ms); });
    for (let k = idx; k < lines.length; k++) {
      if (!alive()) return;
      if (lines[k].lazy) { expand(k); if (k >= lines.length) break; }
      i = k; state(); app.board?.(done()); app.subtitle?.(lines[k].text); app.talk?.(true);
      if (lines[k].mood) app.mood?.(lines[k].mood);
      app.line?.(lines[k]);
      const ms = Math.max(1800, Math.min(9000, plain(lines[k].text).length * 95));
      if (app.voiceOn?.()) {
        try { await app.voice(plain(lines[k].text), r.abort.signal); }
        catch { if (!alive()) return; await wait(ms); }   // 취소면 바로 끝, 음성 실패만 시간으로
      } else await wait(ms);
      if (!alive()) return;
      app.talk?.(false);
    }
    if (alive()) finish();
  }
  // 자리표(lazy)를 그 단계의 풀이 방법 줄로 바꾼다. 카드가 아직 없으면 howto 가 「준비된 예제 없음」 줄을 준다(지어내지 않음)
  function expand(k) {
    const c = app.ctx(); const add = (c && app.howto?.(c.step)) || [];
    const got = add.map((l) => ({ text: readable(l.say), mood: l.mood || null })).filter((l) => l.text.length > 1);
    lines.splice(k, 1, ...(got.length ? got : [{ text: '보기 중에서 직접 골라 보세요.', mood: null }]));
  }
  function finish() { cancel(); playing = false; ended = true; app.talk?.(false); app.board?.(1); app.subtitle?.(null); app.line?.(null); state(); app.onEnd?.(); }
  function begin() { const c = app.ctx(); if (!c) return false; cancel(); lines = build(); i = 0; ended = false; if (!lines.length || c.passed) { finish(); return false; } playing = true; app.board?.(0); play(0); return true; }

  return {
    // 단계가 바뀔 때 school.js 가 부른다 — 바로 강의 시작
    start() { begin(); },
    toggle() {
      if (ended) { begin(); return; }
      if (playing) { playing = false; cancel(); app.talk?.(false); state(); }
      else { playing = true; play(i); }
    },
    restart() { begin(); },
    // ⏭: 강의 중이면 다음 문장, 끝났으면 false(다음 단계는 school.js)
    skip() {
      if (ended) return false;
      if (i + 1 >= lines.length) { finish(); return true; }
      cancel(); i++;
      if (lines[i]?.lazy) expand(i);
      if (playing) play(i); else { state(); app.board?.(done()); app.subtitle?.(lines[i].text); app.line?.(lines[i]); }
      return true;
    },
    stop() { cancel(); playing = false; app.talk?.(false); app.subtitle?.(null); app.line?.(null); },
    get playing() { return playing; }, get ended() { return ended; },
  };
}
