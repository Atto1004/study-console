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
  let setup = SETUPS[read('school-setup')] ? read('school-setup') : null;
  let role = ROLES[read('school-role')] ? read('school-role') : 'desk';

  function apply() {
    if (setup) school.dataset.setup = setup; else delete school.dataset.setup;
    if (setup === 'dual') school.dataset.role = role; else delete school.dataset.role;
    trigger.innerHTML = svg(SETUPS[setup || 'solo'].icon);
    trigger.title = '학습 방식: ' + (setup ? SETUPS[setup].title + (setup === 'dual' ? ' · ' + ROLES[role].title : '') : '고르기');
    trigger.setAttribute('aria-label', trigger.title);
  }
  function choose(next, nextRole) {
    const changed = next !== setup || (next === 'dual' && nextRole !== role);
    setup = next; write('school-setup', next);
    if (nextRole) { role = nextRole; write('school-role', nextRole); }
    apply(); close();
    if (changed) onChange?.(setup, role);
  }

  // 고르는 창: 바깥을 누르면 닫힌다(10/8 기본 동작).
  const sheet = document.createElement('div'); sheet.className = 'setup-sheet'; sheet.hidden = true;
  sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', '학습 방식 고르기');
  sheet.addEventListener('pointerdown', (e) => { if (e.target === sheet) close(); });
  document.addEventListener('keydown', (e) => { if (!sheet.hidden && e.key === 'Escape') close(); });
  function render() {
    const card = document.createElement('div'); card.className = 'setup-card';
    const h = document.createElement('h2'); h.textContent = '어떻게 공부할까요?';
    const p = document.createElement('p'); p.textContent = '이 기기에서만 기억합니다. 언제든 위의 아이콘으로 바꿀 수 있어요.';
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
    card.append(h, p, list, roles); sheet.replaceChildren(card);
  }
  function open() { render(); sheet.hidden = false; modal.opened(sheet.querySelector('[aria-pressed=true]')); }
  function close() { if (sheet.hidden) return; sheet.hidden = true; modal.closed(); }

  const trigger = document.createElement('button'); trigger.type = 'button'; trigger.className = 'setup-trigger icon-btn'; trigger.onclick = open;
  document.querySelector('#room .room-title')?.append(trigger);
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
