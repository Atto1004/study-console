// 학습 방식 = 이 기기로 어떻게 공부하는가 (대표님 10/8). 기기마다 따로 기억한다.
// dual  : 모니터 + 아이패드 — 모니터는 칠판(설명), 아이패드는 책상(문제·펜). 같은 수업 위치를 서로 따라간다.
// solo  : 아이패드만 — 위를 보면 칠판, 아래를 보면 책상(펜으로 필기·풀이).
// paper : 아이패드 + 공책 — 화면으로 배우고 공책에 푼 뒤 답을 화면에서 골라 확인한다.
const SETUPS = {
  dual: { title: '모니터 + 아이패드', text: '모니터는 칠판, 아이패드는 책상', icon: 'M2 3h14v10H2zM6 17h6M9 13v4M15 11h7v10h-7zM18 18h1' },
  solo: { title: '아이패드만', text: '위를 보면 칠판, 아래를 보면 책상', icon: 'M5 2h14v20H5zM11 18h2M8 7h8M8 11h5' },
  paper: { title: '아이패드 + 공책', text: '화면으로 배우고 공책에 풀기', icon: 'M2 6h8v14H2zM14 4h8v16h-8zM4 10h4M4 13h4M4 16h3' },
};
const ROLES = { board: { title: '이 기기는 칠판', text: '모니터 · 설명과 스앵님' }, desk: { title: '이 기기는 책상', text: '아이패드 · 문제와 펜' } };
const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
import { modalFocus } from './worldmap.js';

export function createSetup({ onChange }) {
  const school = document.querySelector('.school');
  let setup = SETUPS[read('school-setup')] ? read('school-setup') : 'solo';
  let role = ROLES[read('school-role')] ? read('school-role') : 'desk';

  function apply() {
    school.dataset.setup = setup;
    if (setup === 'dual') school.dataset.role = role; else delete school.dataset.role;
  }
  function choose(next, nextRole) {
    const changed = next !== setup || (next === 'dual' && nextRole !== role);
    setup = next; write('school-setup', next);
    if (nextRole) { role = nextRole; write('school-role', nextRole); }
    apply(); if (!sheet.hidden) { render(); sheet.querySelector(`[data-setup="${setup}"]`)?.focus(); }
    if (changed) onChange?.(setup, role);
  }

  // 고르는 창: 바깥을 누르면 닫힌다(10/8 기본 동작).
  const sheet = document.createElement('div'); sheet.className = 'setup-sheet'; sheet.hidden = true;
  sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', '학습 설정');
  sheet.addEventListener('pointerdown', (e) => { if (e.target === sheet) close(); });
  document.addEventListener('keydown', (e) => { if (!sheet.hidden && e.key === 'Escape') { e.preventDefault(); close(); } });
  function render() {
    const card = document.createElement('div'); card.className = 'setup-card';
    const h = document.createElement('h2'); h.textContent = '학습 설정';
    const p = document.createElement('p'); p.textContent = '이 기기에서만 기억합니다.';
    const x = document.createElement('button'); x.type = 'button'; x.className = 'setup-close'; x.textContent = '닫기'; x.onclick = close;
    const sec = (t) => { const e = document.createElement('h3'); e.className = 'setup-sec'; e.textContent = t; return e; };
    const list = document.createElement('div'); list.className = 'setup-options';
    for (const [key, s] of Object.entries(SETUPS)) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'setup-option'; b.dataset.setup = key;
      b.setAttribute('aria-pressed', String(setup === key));
      b.innerHTML = `${svg(s.icon)}<b></b><small></small>`; b.querySelector('b').textContent = s.title; b.querySelector('small').textContent = s.text;
      b.onclick = () => { if (key === 'dual') roles.hidden = false; else choose(key); };
      list.append(b);
    }
    const roles = document.createElement('div'); roles.className = 'setup-roles'; roles.hidden = setup !== 'dual';
    for (const [key, r] of Object.entries(ROLES)) {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.role = key;
      b.setAttribute('aria-pressed', String(setup === 'dual' && role === key));
      b.innerHTML = '<b></b><small></small>'; b.querySelector('b').textContent = r.title; b.querySelector('small').textContent = r.text;
      b.onclick = () => choose('dual', key); roles.append(b);
    }
    // 화면: 움직임 줄이기 · 해상도 자동 조절(렉 줄이기, 10/8)
    const toggles = document.createElement('div'); toggles.className = 'setup-toggles';
    for (const [key, label, def] of [['school-reduced-motion', '움직임 줄이기 (걸을 때 흔들림·전환 효과 끔)', '0'], ['world-adaptive', '3D 해상도 자동 조절 (버벅이면 낮춤)', '1']]) {
      const row = document.createElement('label'); row.className = 'setup-toggle';
      const box = document.createElement('input'); box.type = 'checkbox'; box.checked = (read(key) ?? def) === '1' || (key === 'world-adaptive' && read(key) !== '0');
      if (key === 'school-reduced-motion') box.checked = read(key) === '1';
      box.onchange = () => { write(key, box.checked ? '1' : '0'); onChange?.(setup, role, key); };
      row.append(box, document.createTextNode(label)); toggles.append(row);
    }
    // 단축키
    const keys = document.createElement('dl'); keys.className = 'setup-keys';
    for (const [k, v] of [['W · ↑', '칠판 보기'], ['S · ↓', '책상(공책) 보기'], ['Space · Enter', '다음'], ['←', '이전'], ['H', '힌트'], ['E', '더 쉽게'], ['Q', '스앵님께 말하기'], ['1 ~ 5', '과목 바꾸기'], ['Esc', '자리에서 일어나기']]) {
      const dt = document.createElement('dt'); dt.textContent = k; const dd = document.createElement('dd'); dd.textContent = v; keys.append(dt, dd);
    }
    card.append(x, h, p, sec('학습 방식'), list, roles, sec('화면'), toggles, sec('단축키'), keys); sheet.replaceChildren(card);
  }
  function open() { render(); sheet.hidden = false; modal.opened(sheet.querySelector('[aria-pressed=true]')); }
  function close() { if (sheet.hidden) return; sheet.hidden = true; modal.closed(); }

  document.body.append(sheet);
  const modal = modalFocus(sheet);
  apply();

  return {
    get: () => setup,
    role: () => (setup === 'dual' ? role : null),
    open, close,
    // 이 기기에서 고정된 시점. null 이면 고개 동작(칠판↔책상)으로 바꾼다.
    fixedView: () => (setup === 'dual' ? (role === 'board' ? 'lecture' : 'notebook') : setup === 'paper' ? 'paper' : null),
    // 풀이 방식: 펜 있는 기기는 펜슬, 공책이면 공책.
    solveMode: () => (setup === 'paper' ? 'notebook' : setup ? 'pencil' : null),
  };
}
