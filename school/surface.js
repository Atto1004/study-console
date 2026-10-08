// 칠판·공책을 3D 면 위에 그대로 띄운다(교실 v2 1절, 대표님 10/8 「칠판 탭 말고 게임 칠판에 그냥 뜨게」).
// 오타 파트 A 계약: window 'school:viewrect' {view, board, desk} — 착석 시점이 도착하면 칠판(lecture)·공책(notebook) 면의 화면 사각형.
// 이동 중·걷기·숨김이면 null → 그동안 HTML 을 숨긴다. 앉아 있지 않으면(2D 문제 풀이) 아무것도 하지 않는다(기존 화면 그대로).
export function startSurfaces() {
  const school = document.querySelector('.school');
  const board = document.getElementById('board'), work = document.getElementById('missionWork') || null;
  let last = null;
  // 3D 면 사각형을 화면에 보이는 영역(위 HUD 아래 ~ 대화 바 위)과 겹치는 부분으로 자른다 — 면이 화면보다 크면 넘치지 않게
  // 위쪽은 HUD(미션 진행·수업 제목) 아래부터
  const hudBottom = () => Math.max(112, ...['#missionHeader', '#room .room-title'].map((q) => { const e = document.querySelector(q); const r = e && e.getClientRects().length ? e.getBoundingClientRect() : null; return r ? r.bottom + 8 : 0; }));
  const safe = () => { const top = hudBottom(), dlg = document.getElementById('dialogue'); const bottom = dlg && !dlg.hidden ? dlg.getBoundingClientRect().top - 10 : innerHeight - 10; return { top, bottom: Math.max(top + 40, bottom) }; };
  const place = (el, r) => { const s = safe(); const y = Math.max(r.y, s.top), h = Math.min(r.y + r.h, s.bottom) - y; el.style.left = r.x + 'px'; el.style.top = y + 'px'; el.style.width = r.w + 'px'; el.style.height = Math.max(0, h) + 'px'; };   // 쓸 수 있는 높이를 절대 넘지 않는다 — 최소값 때문에 대화 바와 겹치던 것(오타 10/8)
  const clear = (el) => { if (!el) return; for (const k of ['left', 'top', 'width', 'height']) el.style[k] = ''; el.classList.remove('on-surface', 'on-paper'); };
  function apply(d) {
    last = d;
    const notebook = document.getElementById('missionWork');
    if (school.dataset.world !== 'seated' || !d) { delete school.dataset.surface; clear(board); clear(notebook); return; }
    const view = d.view, target = view === 'notebook' ? d.desk : (view === 'lecture' || view === 'paper') ? d.board : null;
    if (!target) { school.dataset.surface = 'moving'; return; }   // 시점 이동 중: 숨김
    school.dataset.surface = view === 'notebook' ? 'desk' : 'board';
    // 공책 보기: 풀 때도 문제가 보여야 한다 — 공책 면 위쪽에 문제(칠판 내용)를 종이 위 글씨로, 그 아래가 풀이 칸
    if (view === 'notebook') {
      const sf = safe(), y0 = Math.max(target.y, sf.top), y1 = Math.min(target.y + target.h, sf.bottom), h = Math.max(0, y1 - y0);
      const head = Math.min(300, Math.round(h * 0.4));
      place(board, { x: target.x, y: y0, w: target.w, h: head }); board.classList.add('on-surface', 'on-paper');
      if (notebook) { place(notebook, { x: target.x, y: y0 + head, w: target.w, h: h - head }); notebook.classList.add('on-surface'); }
    }
    else { if (notebook) clear(notebook); board.classList.remove('on-paper'); place(board, target); board.classList.add('on-surface'); }
  }
  window.addEventListener('school:viewrect', (e) => apply(e.detail));
  // 대화 바 높이가 바뀌면(대사가 길어짐) 다시 맞춘다
  const dlg = document.getElementById('dialogue'); if (dlg && 'ResizeObserver' in window) new ResizeObserver(() => { if (last) apply(last); }).observe(dlg);
  // 앉음이 풀리면 바로 원래 배치로
  new MutationObserver(() => { if (school.dataset.world !== 'seated') apply(null); }).observe(school, { attributes: true, attributeFilter: ['data-world'] });
  return { get last() { return last; } };
}
