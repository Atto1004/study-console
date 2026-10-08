// 교실 v3 화면(설계 docs/classroom-v3-1008.md, 대표님 10/8): 위 강의 · 가운데 문제 · 아래 대화, 헤더에 게임↔사이트 전환.
// 기존 요소(#board·.teacher·#choices·#missionWork·#dialogue)를 세 칸으로 옮겨 담고, 쓰지 않는 것(시점 아이콘 줄·학습 기록 띠·
// 중복 진행 표시·도구 줄)은 숨긴다. 버튼 동작은 기존 것을 그대로 부른다.
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const ICON = {
  game: 'M12 2 3 7v10l9 5 9-5V7zM3 7l9 5 9-5M12 12v10',
  site: 'M3 4h18v13H3zM8 21h8M12 17v4',
  restart: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  play: 'M7 4l12 8-12 8z', pause: 'M8 5v14M16 5v14',
  skip: 'M5 4l10 8-10 8zM19 5v14',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z',
};
const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
const iconBtn = (icon, label, cls) => { const b = el('button', 'v3-btn ' + (cls || '')); b.type = 'button'; b.innerHTML = svg(ICON[icon]); b.setAttribute('aria-label', label); b.dataset.tip = label; b.classList.add('ico-btn'); return b; };
const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

export function startClassroomV3(app) {
  // app: { onToggle(), onRestart(), onSkip(), onChat(text), onViewChange(view), progress() }
  const school = document.querySelector('.school');
  school.dataset.layout = 'v3';
  let view = read('school-view') === 'game' ? 'game' : 'site';
  school.dataset.view3 = view;

  // ── 세 칸
  const room = document.getElementById('room'), dialogue = document.getElementById('dialogue');
  const stage = el('section', 'v3-stage'); stage.id = 'lectureStage'; stage.setAttribute('aria-label', '강의');
  const work = el('section', 'v3-work'); work.id = 'workZone'; work.setAttribute('aria-label', '문제 풀이');
  const teaching = room.querySelector('.teaching-space');
  const subtitle = el('div', 'v3-subtitle'); subtitle.id = 'subtitle'; subtitle.setAttribute('aria-live', 'polite'); subtitle.hidden = true;
  const mount3d = el('div', 'v3-3d'); mount3d.id = 'stage3d';
  stage.append(mount3d, teaching, subtitle);
  room.append(stage, work);
  const choices = document.getElementById('choices'); work.append(choices);
  const moveWork = () => { const w = document.getElementById('missionWork'); if (w && w.parentElement !== work) work.append(w);
    const sc = room.querySelector(':scope > .seat-controls'); if (sc) stage.append(sc); };   // 게임 보기: 「자리에서 일어나기」만 강의 칸 모서리에
  moveWork(); new MutationObserver(moveWork).observe(room, { childList: true });

  // ── 아래: 대화 기록 + 입력 + 진행 조작
  const log = el('div', 'v3-log'); log.id = 'chatLog'; log.setAttribute('aria-live', 'polite');
  const chat = el('form', 'v3-chat'); const input = el('input'); input.id = 'chatInput'; input.placeholder = '스앵님께 말하기 · 질문은 ?로 끝내기 (Q)'; input.autocomplete = 'off'; input.maxLength = 600;
  const send = iconBtn('send', '보내기', 'v3-send'); send.type = 'submit'; chat.append(input, send);
  const bar = el('div', 'v3-bar');
  const restart = iconBtn('restart', '이 단계 강의 처음부터'), play = iconBtn('pause', '강의 멈춤 (Space)', 'v3-play'), skip = iconBtn('skip', '다음 (Enter)', 'v3-skip');
  const progress = el('span', 'v3-progress'); const track = el('span', 'v3-track'); const fill = el('i'); track.append(fill);
  const hint = document.getElementById('hint'), simpler = document.getElementById('simpler');
  const more = el('details', 'v3-more'); const sum = el('summary'); sum.innerHTML = svg(ICON.more); sum.setAttribute('aria-label', '더보기'); sum.dataset.tip = '근거·보충·공부 종료';
  const menu = el('div', 'v3-menu');
  for (const [id, label] of [['source', '이 수업의 근거'], ['generate', '맞춤 보충 수업']]) { const b = el('button', 'v3-menu-item', label); b.type = 'button'; b.onclick = () => { more.open = false; document.getElementById(id)?.click(); }; menu.append(b); }
  const endStudy = el('button', 'v3-menu-item', '공부 종료'); endStudy.type = 'button'; endStudy.onclick = () => { more.open = false; [...document.querySelectorAll('.learning-strip button')].find((b) => /공부 종료/.test(b.getAttribute('aria-label') || b.textContent))?.click(); };
  const skills = el('button', 'v3-menu-item', '내 스킬'); skills.type = 'button'; skills.onclick = () => { more.open = false; [...document.querySelectorAll('.learning-strip button')].find((b) => /내 스킬/.test(b.getAttribute('aria-label') || b.textContent))?.click(); };
  menu.append(endStudy, skills); more.append(sum, menu);
  bar.append(restart, play, skip, progress, track, hint, simpler, more);
  dialogue.prepend(log); dialogue.append(chat, bar);

  restart.onclick = () => app.onRestart?.();
  play.onclick = () => app.onToggle?.();
  skip.onclick = () => app.onSkip?.();
  chat.addEventListener('submit', (e) => { e.preventDefault(); const t = input.value.trim(); if (!t) return; input.value = ''; addMine(t); app.onChat?.(t); });

  // 스앵님 말(#speech)이 바뀔 때마다 대화 기록에 한 줄
  const speech = document.getElementById('speech'); let lastLine = '';
  new MutationObserver(() => { const t = speech.textContent.trim(); if (t && t !== lastLine) { lastLine = t; addLine('saeng', t); } }).observe(speech, { childList: true, characterData: true, subtree: true });
  function addLine(who, text) {
    text = String(text).replace(/[ \t]*\n\s*/g, '\n').replace(/[ \t]{2,}/g, ' ').trim(); if (!text) return;
    const row = el('div', 'v3-msg v3-' + who); /* 'saeng' 그대로 쓰면 기존 초상 스타일과 겹친다 */ const b = el('p', undefined, text); row.append(b); log.append(row);
    while (log.children.length > 40) log.firstChild.remove();
    log.scrollTop = log.scrollHeight;
  }
  function addMine(text) { addLine('me', text); }
  // 가운데 답 칸에서 낸 답도 내 말로 남김
  work.addEventListener('submit', (e) => { const i = e.target.querySelector?.('input'); if (i?.value.trim()) addMine(i.value.trim()); }, true);

  // 게임 보기: 자막 말풍선이 3D 스앵님 머리를 따라간다(오타 A3 계약 school:viewrect.head)
  window.addEventListener('school:viewrect', (e) => { const h = e.detail?.head; if (!h) { subtitle.style.removeProperty('--hx'); subtitle.style.removeProperty('--hy'); return; } const r = stage.getBoundingClientRect(); subtitle.style.setProperty('--hx', (h.x - r.left) + 'px'); subtitle.style.setProperty('--hy', (h.y - r.top) + 'px'); subtitle.dataset.side = (h.x - r.left) > r.width * 0.55 ? 'right' : 'left'; });   // 칠판을 가리지 않게 머리 바깥쪽(칠판 반대편)

  // ── 헤더: 게임 ↔ 사이트
  const toggle = el('button', 'view-toggle'); toggle.type = 'button';
  const paint = () => { toggle.innerHTML = `<span data-v="site">${svg(ICON.site)}</span><span data-v="game">${svg(ICON.game)}</span>`; toggle.dataset.view = view; toggle.setAttribute('aria-label', view === 'game' ? '지금 게임(3D) — 사이트로 바꾸기' : '지금 사이트 — 게임(3D)로 바꾸기'); toggle.dataset.tip = view === 'game' ? '게임(3D) 모드' : '사이트 모드'; };
  toggle.onclick = () => { view = view === 'game' ? 'site' : 'game'; write('school-view', view); school.dataset.view3 = view; paint(); app.onViewChange?.(view); };
  // 지도 버튼(worldmap.js)이 나중에 생기므로, 생기면 그 앞으로 옮긴다
  paint(); const header = document.querySelector('.school > header');
  const place = () => { const m = header?.querySelector('.map-trigger'); if (m && toggle.nextElementSibling !== m) m.before(toggle); else if (!m && !toggle.isConnected) header?.append(toggle); return !!m; };
  if (!place() && header) { const mo = new MutationObserver(() => { if (place()) mo.disconnect(); }); mo.observe(header, { childList: true, subtree: true }); }

  return {
    stage, mount3d, work,
    get view() { return view; },
    subtitle(text) { subtitle.hidden = !text; subtitle.textContent = text || ''; },
    head(point) { if (!point) { subtitle.style.removeProperty('--hx'); subtitle.style.removeProperty('--hy'); return; } const r = stage.getBoundingClientRect(); subtitle.style.setProperty('--hx', (point.x - r.left) + 'px'); subtitle.style.setProperty('--hy', (point.y - r.top) + 'px'); },
    board(f) { document.querySelector('#board .content')?.style.setProperty('--reveal', String(Math.max(0, Math.min(1, f)))); },
    state({ playing, index, count, ended }) {
      play.innerHTML = svg(ICON[playing ? 'pause' : 'play']); play.setAttribute('aria-label', playing ? '강의 멈춤 (Space)' : ended ? '강의 다시 듣기 (Space)' : '강의 계속 (Space)'); play.dataset.tip = play.getAttribute('aria-label');
      const p = app.progress?.() || ''; progress.textContent = p; fill.style.width = count ? Math.round(((ended ? count : index) / count) * 100) + '%' : '0';
      school.dataset.lecture = ended ? 'ended' : playing ? 'playing' : 'paused';
    },
    focusChat() { input.focus(); },
    say: addLine,
  };
}
