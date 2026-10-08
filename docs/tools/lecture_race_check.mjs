// 강의 재생기 경쟁 검사(오타 검수 10/8 P1·P2): ⏸→▶ 연타·음성 중 건너뛰기·처음부터에서 오래된 재생이 끼어들지 않는지
import { createLecture } from '../../school/lecture.js';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fail = [];
const step = { speech: '하나입니다. 둘입니다. 셋입니다. 넷입니다.', title: '', body: '' };
function make(voice) {
  const said = []; let ends = 0, voices = 0;
  const lec = createLecture({
    ctx: () => ({ lesson: { id: 'L' }, step, index: 0, passed: false }),
    subtitle: (t) => { if (t) said.push(t); }, board() {}, talk() {}, onState() {}, onEnd: () => ends++,
    voiceOn: () => !!voice,
    voice: (text, signal) => { voices++; return new Promise((res, rej) => { const t = setTimeout(res, 120); signal.addEventListener('abort', () => { clearTimeout(t); rej(new Error('abort')); }); }); },
  });
  return { lec, said, get ends() { return ends; }, get voices() { return voices; } };
}
// 1) 음성 중 ⏸→▶ 연타: 한 번에 한 재생만 → 문장이 두 번씩 나오지 않음
{ const m = make(true); m.lec.start(); await sleep(30); for (let k = 0; k < 5; k++) { m.lec.toggle(); m.lec.toggle(); } await sleep(1200);
  const dup = m.said.filter((s, j) => j && s === m.said[j - 1] && s !== '하나입니다.').length;
  const counts = {}; for (const s of m.said) counts[s] = (counts[s] || 0) + 1;
  if (m.ends !== 1) fail.push('연타 뒤 끝 ' + m.ends + '번');
  if (counts['둘입니다.'] > 1 || counts['넷입니다.'] > 1) fail.push('연타 뒤 문장 중복 ' + JSON.stringify(counts)); }
// 2) 음성 중 건너뛰기 연타 → 끝 1번, 끝난 뒤 늦은 타이머가 없음
{ const m = make(true); m.lec.start(); await sleep(20); m.lec.skip(); m.lec.skip(); await sleep(20); m.lec.skip(); m.lec.skip(); await sleep(600);
  if (!m.lec.ended || m.ends !== 1) fail.push('건너뛰기 끝 ' + m.ends + ' ended=' + m.lec.ended);
  const n = m.said.length; await sleep(2500); if (m.said.length !== n) fail.push('끝난 뒤에도 자막이 이어짐'); }
// 3) 음성 없이(시간 대기) 처음부터 → 이전 타이머가 새 재생을 앞당기지 않음
{ const m = make(false); m.lec.start(); await sleep(1000); m.lec.restart(); const t0 = Date.now(); await sleep(1000);
  if (m.said.at(-1) !== '하나입니다.') fail.push('처음부터 뒤 1초 안에 넘어감: ' + m.said.at(-1) + ' ' + (Date.now() - t0)); m.lec.stop(); }
console.log(fail.length ? 'FAIL ' + JSON.stringify(fail) : 'lecture race: ⏸▶ 연타·건너뛰기 연타·처음부터 ok');
process.exit(fail.length ? 1 : 0);
