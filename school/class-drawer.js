// 강의실 왼쪽 서랍 (대표님 10/12 「아이패드 화면에서는 수업도전, 교재목차도 왼쪽 안에다가 숨겨주고」)
//  · 태블릿 레이아웃(641~1366 폭·아이패드)의 교실에서만 쓴다. 평소에는 칠판·스앵님·대사창이 화면을 다 쓰고,
//    왼쪽 가장자리 탭을 누르면 수업 도전 · 교재 목차 · 수업교재가 든 서랍이 열린다. 바깥을 누르거나 Esc·닫기로 닫는다.
//  · 새 합성 레이어를 만들지 않는다: 서랍은 fixed + left/top/bottom 만 쓰고 transform·backdrop-filter·will-change 는 없다(열고 닫기는 hidden).
//  · 서랍으로 옮기는 것은 원래 있던 노드 그대로다(수업 도전 aside · 현재 수업 위치/교재 목차 section · 수업교재 #workZone).
//    태블릿 레이아웃이 꺼지면(데스크톱 폭) 원래 자리로 돌려놓는다.
const PARTS = [
  ['quests', '.lecture-quests'],
  ['toc', '.subject-context'],
  ['book', '#workZone'],
];

export function mountClassDrawer() {
  const school = document.querySelector('.school');
  if (!school || school.querySelector(':scope > .class-drawer')) return null;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };

  const tab = el('button', 'class-drawer-tab'); tab.type = 'button';
  tab.setAttribute('aria-label', '수업 서랍 열기 — 수업 도전 · 교재 목차'); tab.setAttribute('aria-expanded', 'false');
  tab.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/></svg><span>수업 서랍</span>';
  const scrim = el('div', 'class-drawer-scrim'); scrim.hidden = true;
  const drawer = el('aside', 'class-drawer'); drawer.hidden = true; drawer.tabIndex = -1; drawer.setAttribute('role', 'dialog'); drawer.setAttribute('aria-label', '수업 서랍');
  const head = el('div', 'class-drawer-head'); const title = el('b', null, '수업 서랍');
  const close = el('button', 'class-drawer-close'); close.type = 'button'; close.setAttribute('aria-label', '서랍 닫기');
  close.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  head.append(title, close);
  const body = el('div', 'class-drawer-body');
  const slots = {}; for (const [k] of PARTS) { const s = el('div', 'class-drawer-slot'); s.dataset.slot = k; slots[k] = s; body.append(s); }
  drawer.append(head, body);
  school.append(scrim, drawer, tab);

  const watched = new WeakSet();   // hidden 속성을 지켜보는 노드(수업 도전은 서랍을 만든 뒤에 생기고, 나중에 보이게 되기도 한다)
  const home = new Map();   // 노드 → { parent, next } (서랍 안으로 옮기기 전 자리)
  const active = () => school.classList.contains('tablet-layout') && school.dataset.mode === 'classroom' && school.dataset.view3 === 'site';
  let open = false;
  const mo = new MutationObserver(() => sync());

  function setOpen(v) {
    open = !!v && active();
    drawer.hidden = scrim.hidden = !open;
    tab.setAttribute('aria-expanded', String(open));
    school.dataset.drawer = open ? 'open' : 'closed';
    // 열면 닫기 버튼으로, 닫으면 탭으로 초점을 옮긴다(키보드·보조기기 사용자가 서랍 밖에서 길을 잃지 않게)
    try { (open ? close : tab).focus({ preventScroll: true }); } catch {}
  }
  function sync() {
    const on = active();
    tab.hidden = !on;
    for (const [k, sel] of PARTS) {
      const node = school.querySelector(sel) || document.querySelector(sel);
      if (!node) continue;
      if (!watched.has(node)) { watched.add(node); mo.observe(node, { attributes: true, attributeFilter: ['hidden'] }); }
      if (on && node.parentElement !== slots[k]) {
        if (!home.has(node)) home.set(node, { parent: node.parentElement, next: node.nextSibling });
        slots[k].append(node);
      } else if (!on && home.has(node) && node.parentElement === slots[k]) {
        const h = home.get(node);
        if (h.parent && h.parent.isConnected) h.parent.insertBefore(node, h.next && h.next.parentElement === h.parent ? h.next : null);
        home.delete(node);
      }
    }
    if (!on && open) setOpen(false);
    if (!on) school.removeAttribute('data-drawer'); else if (!school.dataset.drawer) school.dataset.drawer = 'closed';
    // 서랍 안이 비면(수업 도전 숨김 등) 그 칸은 접는다
    for (const [k] of PARTS) { const n = slots[k].firstElementChild; slots[k].hidden = !n || n.hidden; }
  }

  tab.addEventListener('click', () => setOpen(!open));
  close.addEventListener('click', () => setOpen(false));
  scrim.addEventListener('pointerdown', (e) => { e.preventDefault(); setOpen(false); });
  scrim.addEventListener('click', () => setOpen(false));
  window.addEventListener('keydown', (e) => { if (open && e.key === 'Escape') { e.preventDefault(); setOpen(false); } });
  // 수업 도전·교재 목차에서 단계를 고르면 서랍을 닫아 칠판을 바로 본다
  drawer.addEventListener('click', (e) => { if (e.target.closest('.lesson-textbook-contents button, .subject-textbook-toc button')) setTimeout(() => setOpen(false), 120); });

  mo.observe(school, { attributes: true, attributeFilter: ['class', 'data-mode', 'data-view3'], childList: true });
  const room = document.getElementById('room'); if (room) mo.observe(room, { childList: true });
  window.addEventListener('resize', sync);
  sync();
  return { open: () => setOpen(true), close: () => setOpen(false), sync, get isOpen() { return open; } };
}
