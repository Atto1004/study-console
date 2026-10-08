// 학교 위쪽 탭 바 대신 「지도」 아이콘 하나 (게임 UI 규격 초안 §2, 대표님 10/8).
// 장소 이동은 복도의 문·표지판이 기본이고, 지도는 「지금 어디 / 어디로 갈 수 있나」만 보여 준다.
// 탭 버튼(#mainArea 등)은 화면에서만 숨기고 그대로 둔다 — 지금 위치(aria-pressed)와 이동은 그 버튼을 쓴다.
const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
const ICON = {
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
  office: 'M3 21h18M5 21V8l7-4 7 4v13M9 21v-5h6v5M9 11h.01M15 11h.01',
  lobby: 'M3 10 12 4l9 6M5 9v11h14V9M10 20v-6h4v6',
  class: 'M3 4h18v12H3zM8 20h8M12 16v4',
  library: 'M4 19V5M8 19V5M12 19 15 5M18 19V5M3 19h18',
  homework: 'M9 4h6v3H9zM6 6h12v15H6zM9 12l2 2 4-4',
};
// 대표실은 A++O 주소(/kingdom/) 아래에서 열렸을 때만 있다(데모·GitHub Pages 판에는 없음).
export const officeHref = () => (location.pathname.startsWith('/kingdom/') ? '/kingdom/' : null);

// 모달 창 공통(오타 10/8): 열려 있는 동안 학교 화면은 inert, Tab 은 창 안에서만 돈다.
export function modalFocus(sheet) {
  const school = document.querySelector('.school');
  // 숨긴 칸(예: 학습 방식의 역할 줄) 안 버튼은 빼야 포커스가 문서 밖으로 떨어지지 않는다.
  const focusable = () => [...sheet.querySelectorAll('button:not([disabled]),[tabindex="0"]')].filter((b) => b.getClientRects().length);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || sheet.hidden) return;
    const list = focusable(); if (!list.length) { e.preventDefault(); return; }
    const first = list[0], last = list[list.length - 1];
    if (e.shiftKey && (document.activeElement === first || !sheet.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || !sheet.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
  });
  return {
    opened(preferred) { if (school) school.inert = true; const t = [preferred, ...focusable()].find((b) => b && !b.disabled && b.isConnected && b.getClientRects().length); (t || sheet.firstElementChild)?.focus({ preventScroll: true }); },
    closed() { if (school) school.inert = false; },
  };
}

export function createWorldMap() {
  const header = document.querySelector('.school > header');
  const places = [
    { id: 'office', name: '대표실', note: 'GREEN LIGHT 대표실로 돌아가기', go: () => { location.href = officeHref(); }, here: () => false, show: () => !!officeHref() },
    { id: 'lobby', name: '복도', note: '오늘 수업 · 교실 문 · 퀘스트', button: 'mainArea' },
    { id: 'class', name: '교실', note: '지금 하던 수업', button: 'learningArea' },
    { id: 'library', name: '자료실', note: '수업 자료 · 수업 범위 · 출결', button: 'materialsArea', also: ['progressArea', 'attendanceArea'] },
    { id: 'homework', name: '과제실', note: '마감순 과제 · 제출본', button: 'assignmentArea' },
  ];
  const pressed = (id) => document.getElementById(id)?.getAttribute('aria-pressed') === 'true';
  const isHere = (p) => (p.here ? p.here() : [p.button, ...(p.also || [])].some(pressed));

  const trigger = document.createElement('button'); trigger.type = 'button'; trigger.className = 'map-trigger';
  trigger.innerHTML = svg(ICON.map); trigger.title = '지도'; trigger.setAttribute('aria-label', '학교 지도 · 지금 위치와 갈 수 있는 곳');
  trigger.setAttribute('aria-haspopup', 'dialog');
  header?.querySelector('.secondary-menu')?.before(trigger);

  const sheet = document.createElement('div'); sheet.className = 'map-sheet'; sheet.hidden = true;
  sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', '학교 지도');
  sheet.addEventListener('pointerdown', (e) => { if (e.target === sheet) close(); });   // 바깥 누르면 닫힘(10/8 기본)
  document.addEventListener('keydown', (e) => { if (!sheet.hidden && e.key === 'Escape') close(); });
  document.body.append(sheet);
  const modal = modalFocus(sheet);

  function render() {
    const card = document.createElement('div'); card.className = 'map-card'; card.tabIndex = -1;
    const h = document.createElement('h2'); h.textContent = '학교 지도';
    const list = document.createElement('div'); list.className = 'map-places';
    for (const p of places) {
      if (p.show && !p.show()) continue;
      const here = isHere(p), b = document.createElement('button'); b.type = 'button'; b.className = 'map-place'; b.dataset.place = p.id;
      const disabled = p.button && document.getElementById(p.button)?.disabled;
      b.disabled = !!disabled; if (here) b.setAttribute('aria-current', 'location');
      b.innerHTML = `${svg(ICON[p.id])}<b></b><small></small>`; b.querySelector('b').textContent = p.name; b.querySelector('small').textContent = here ? '지금 여기' : p.note;
      b.onclick = () => { close(); if (here) return; if (p.go) p.go(); else document.getElementById(p.button)?.click(); };
      list.append(b);
    }
    card.append(h, list); sheet.replaceChildren(card);
  }
  function open() { render(); sheet.hidden = false; trigger.setAttribute('aria-expanded', 'true'); modal.opened(sheet.querySelector('[aria-current]')); }
  function close() { if (sheet.hidden) return; sheet.hidden = true; modal.closed(); trigger.setAttribute('aria-expanded', 'false'); trigger.focus({ preventScroll: true }); }
  // 열린 채로 탭 상태(부팅 끝·이동)가 바뀌면 지도도 다시 그린다(오타 10/8: 부팅 중 연 지도가 비활성으로 남던 것).
  const rooms = header?.querySelector('.rooms'), sub = header?.querySelector('.room-sub');
  const watch = new MutationObserver(() => { if (sheet.hidden) return; const at = document.activeElement?.dataset?.place; render(); modal.opened(sheet.querySelector(`[data-place="${at}"]`) || sheet.querySelector('[aria-current]')); });
  for (const n of [rooms, sub]) if (n) watch.observe(n, { subtree: true, attributes: true, attributeFilter: ['disabled', 'aria-pressed'] });
  trigger.onclick = () => (sheet.hidden ? open() : close());
  return { open, close };
}
