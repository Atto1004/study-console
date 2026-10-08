// 조작 버튼은 글자 대신 아이콘 (대표님 10/8 「버튼 같은 거 최대한 한글이나 텍스트로 넣지 말고 이미지·아이콘으로」).
// 버튼을 만드는 코드는 그대로 두고, 화면에 붙는 순간 이 층이 모양만 바꾼다: 원래 글자 → aria-label·title(툴팁),
// 숫자(「과제실 · 3건」)는 배지. 글자를 다시 쓰면(예: 일시정지 ↔ 공부 계속하기) 다시 바꾼다.
// 글자로 두는 것: 답 선택지·대사 선택지·목록 칸처럼 버튼 자체가 내용인 것(아래 규칙에 없는 글자는 건드리지 않는다).
// 아이콘을 다른 그림(피그마 등)으로 바꿀 때는 ICON 만 고치면 된다.
const ICON = {
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  pause: 'M8 5v14M16 5v14',
  play: 'M7 4l12 8-12 8z',
  stop: 'M6 6h12v12H6z',
  skills: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.4A8 8 0 1 1 21 12z',
  ask: 'M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.4A8 8 0 1 1 21 12zM10 9.5a2 2 0 1 1 2.6 1.9c-.4.2-.6.5-.6 1.1M12 15h.01',
  pen: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  eraser: 'M20 20H8l-5-5a2 2 0 0 1 0-2.8L13.2 2a2 2 0 0 1 2.8 0l5 5a2 2 0 0 1 0 2.8L11 20M6 11l7 7',
  undo: 'M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3',
  redo: 'M15 14l5-5-5-5M20 9H9a5 5 0 0 0 0 10h3',
  expand: 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
  save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z',
  prev: 'M15 18l-6-6 6-6',
  next: 'M5 12h14M13 6l6 6-6 6',
  flag: 'M4 22V4M4 4h13l-2 4 2 4H4',
  hint: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z',
  easier: 'M3 7h6v5h6v5h6',
  source: 'M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z',
  supplement: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM12 7v6M9 10h6',
  library: 'M4 19V5M8 19V5M12 19 15 5M18 19V5M3 19h18',
  homework: 'M9 4h6v3H9zM6 6h12v15H6zM9 12l2 2 4-4',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
  refresh: 'M21 12a9 9 0 1 1-2.6-6.4L21 8M21 3v5h-5',
  plan: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM12 13v5M9.5 15.5h5',
  edit: 'M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z',
  plus: 'M12 5v14M5 12h14',
  hide: 'M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10 10 0 0 1 12 4c5 0 9 5 10 8a13 13 0 0 1-2.2 3.4M6.6 6.6C4.4 8 2.8 10.2 2 12c1 3 5 8 10 8a10 10 0 0 0 5.4-1.6',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  grade: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.2 13.9 7 22l5-3 5 3-1.2-8.1',
  range: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  attendance: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM9 16l2 2 4-4',
  folder: 'M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l4 2',
  done: 'M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14l-3-3',
  office: 'M3 21h18M5 21V8l7-4 7 4v13M9 21v-5h6v5M9 11h.01M15 11h.01',
  seat: 'M7 3h10v8H7zM5 11h14v3H5zM7 14v7M17 14v7',
  collapse: 'M6 9l6 6 6-6',
  close: 'M18 6 6 18M6 6l12 12',
};
// [글자(정확히) 또는 정규식, 아이콘, 배지로 쓸 정규식 묶음 번호]
const RULES = [
  ['더보기', 'more'],
  ['일시정지', 'pause'], ['공부 계속하기', 'play'], ['공부 종료', 'stop'],
  ['내 스킬', 'skills'], ['내 스킬 보기', 'skills'], ['상담', 'chat'],
  ['펜', 'pen'], ['지우개', 'eraser'], ['되돌리기', 'undo'], ['다시 하기', 'redo'], ['넓게 쓰기', 'expand'],
  ['풀이 저장', 'save'], ['풀이 제출·피드백', 'send'],
  ['이전', 'prev'], ['힌트', 'hint'], ['더 쉽게', 'easier'], ['질문하기', 'ask'],
  ['이 수업의 근거', 'source'], ['맞춤 보충 수업', 'supplement'],
  ['다음', 'next'], ['다음 도전', 'next'], ['미션 결과 보기', 'flag'],
  ['← 자료실', 'library'], [/^과제실 · (\d+)건 →$/, 'homework', 1],
  ['ⓘ 숫자 읽는 법', 'info'], ['ⓘ', 'info'], ['계산 근거', 'info'],
  ['다시 불러오기', 'refresh'], ['새로 불러오기', 'refresh'], ['수업자료 색인 갱신', 'refresh'], ['자료 색인 동기화', 'refresh'],
  ['스앵님이 오늘 계획 세우기', 'plan'], ['시작', 'play'], ['수정', 'edit'], ['계획 추가', 'plus'],
  ['메인에서 숨김', 'hide'], [/^과제 전체 보기(?: · 제출 전 (\d+)건)?$/, 'list', 1],
  ['시간표', 'calendar'], ['성적·학점', 'grade'], ['수업 범위', 'range'], ['출결', 'attendance'],
  ['수업 범위 확인', 'range'], ['출결 확인', 'attendance'], ['자료 관리', 'folder'], ['전체 교재·자료실', 'library'],
  ['수업 이어가기', 'play'], [/^.+ · 수업 이어가기$/, 'play'], ['과제 작업 시작 · 얼라이브위크 기록', 'play'],
  ['대표실', 'office'], ['수업 시작', 'seat'],
  ['회차 확보·교수 규칙 보기', 'info'],
  ['접기', 'collapse'], ['보내기', 'send'], ['닫기', 'close'],
  ['진행', 'clock'], ['지난 기록', 'history'], ['제출 완료', 'done'], ['전체', 'list'],
];
// 내용인 버튼(답·대사 선택지)은 바꾸지 않는다.
const SKIP = '#choices, .corridor-vn, .map-place, .setup-option, .setup-roles, .secondary-menu > div';
const svg = (d) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;

function match(text) {
  for (const [m, icon, group] of RULES) {
    if (typeof m === 'string' ? m === text : m.test(text)) return { icon, badge: group && typeof m !== 'string' ? text.match(m)[group] || '' : '' };
  }
  return null;
}
function iconify(b) {
  if (!b.isConnected || b.closest(SKIP)) return;
  const badge = b.querySelector(':scope > .ico-badge')?.textContent || '';
  const text = (b.textContent || '').replace(/\s+/g, ' ').trim();
  if (b.dataset.ico && b.querySelector(':scope > svg.ico') && text === badge) return;   // 이미 바꿨고 글자가 다시 안 붙음
  const hit = match(text);
  if (!hit) { if (b.dataset.ico) unconvert(b); return; }   // 규칙 밖 글자로 바뀌면 이 층이 붙인 이름·모양을 걷어 낸다(오타 10/8)
  // 이름: 원래 설명이 따로 붙어 있던 버튼(예: 「자리에 앉아 수업 시작」)은 그 설명을 지키고,
  // 그 밖에는 이 층이 글자로 이름을 붙이고 글자가 바뀌면 같이 바꾼다(일시정지 ↔ 공부 계속하기).
  if (!b.dataset.icoOwn) b.dataset.icoOwn = b.hasAttribute('aria-label') && b.getAttribute('aria-label') !== text ? '1' : '0';
  if (b.dataset.icoOwn === '0') b.setAttribute('aria-label', text);
  b.dataset.ico = hit.icon; b.classList.add('ico-btn');
  b.dataset.tip = b.getAttribute('aria-label') || text;
  b.removeAttribute('title');
  b.innerHTML = svg(ICON[hit.icon]) + (hit.badge ? `<b class="ico-badge" aria-hidden="true">${hit.badge}</b>` : '');
}
function unconvert(b) {
  b.classList.remove('ico-btn', 'tip-on');
  if (b.dataset.icoOwn === '0') b.removeAttribute('aria-label');
  delete b.dataset.ico; delete b.dataset.tip; delete b.dataset.icoOwn;
}
// 아이콘 뜻 보기: 마우스는 올리면, 키보드는 포커스하면, 터치는 0.5초 길게 누르면 이름 말풍선(오타 10/8 — 터치에서 뜻 확인).
// 길게 눌러 말풍선을 본 뒤 손을 떼면 그 버튼은 눌리지 않는다.
function startTips() {
  let timer = null, shown = null, swallow = null;
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest?.('.ico-btn'); clearTimeout(timer);
    if (!b || e.pointerType === 'mouse') return;
    timer = setTimeout(() => { shown?.classList.remove('tip-on'); shown = b; swallow = b; b.classList.add('tip-on'); setTimeout(() => b.classList.remove('tip-on'), 1600); }, 500);
  }, true);
  for (const t of ['pointerup', 'pointercancel', 'pointermove']) document.addEventListener(t, (e) => { if (t !== 'pointermove' || Math.abs(e.movementX) + Math.abs(e.movementY) > 6) clearTimeout(timer); }, true);
  document.addEventListener('click', (e) => { if (swallow && e.target.closest?.('.ico-btn') === swallow) { e.preventDefault(); e.stopImmediatePropagation(); } swallow = null; }, true);
  document.addEventListener('contextmenu', (e) => { if (e.target.closest?.('.ico-btn')) e.preventDefault(); }, true);
}
let busy = false;
function sweep(root = document) {
  if (busy) return; busy = true;
  try { for (const b of root.querySelectorAll('button, summary')) iconify(b); } finally { busy = false; }
}
export function startIcons() {
  sweep(); startTips();
  new MutationObserver((list) => {
    if (busy) return;
    const targets = new Set();
    for (const m of list) {
      const n = m.target.nodeType === 1 ? m.target : m.target.parentElement;
      const b = n?.closest?.('button, summary'); if (b) targets.add(b);
      for (const a of m.addedNodes) if (a.nodeType === 1) { if (a.matches('button, summary')) targets.add(a); for (const x of a.querySelectorAll('button, summary')) targets.add(x); }
    }
    busy = true; try { for (const b of targets) iconify(b); } finally { busy = false; }
  }).observe(document.body, { subtree: true, childList: true, characterData: true });
}
startIcons();
