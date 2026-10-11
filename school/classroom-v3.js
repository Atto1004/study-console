// 교실 v3 화면(설계 docs/classroom-v3-1008.md, 대표님 10/8): 위 강의 · 가운데 문제 · 아래 대화, 헤더에 게임↔사이트 전환.
// 기존 요소(#board·.teacher·#choices·#missionWork·#dialogue)를 세 칸으로 옮겨 담고, 쓰지 않는 것(시점 아이콘 줄·학습 기록 띠·
// 중복 진행 표시·도구 줄)은 숨긴다. 버튼 동작은 기존 것을 그대로 부른다.
import { splitText } from './learning.js';
import { groupLessonTopics } from './course-scope.js';
import { chalkNote, chalkBoardText } from './lecture-chalk.js';
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const ICON = {
  game: 'M12 2 3 7v10l9 5 9-5V7zM3 7l9 5 9-5M12 12v10',
  site: 'M3 4h18v13H3zM8 21h8M12 17v4',
  restart: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  play: 'M7 4l12 8-12 8z', pause: 'M8 5v14M16 5v14',
  skip: 'M5 4l10 8-10 8zM19 5v14',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z',
  stand: 'M12 19V5M5 12l7-7 7 7',
};
const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
const iconBtn = (icon, label, cls) => { const b = el('button', 'v3-btn ' + (cls || '')); b.type = 'button'; b.innerHTML = svg(ICON[icon]); b.setAttribute('aria-label', label); b.dataset.tip = label; b.classList.add('ico-btn'); return b; };
const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

export function startClassroomV3(app) {
  // app: { onToggle(), onRestart(), onSkip(), onChat(text), onViewChange(view), progress() }
  const school = document.querySelector('.school');
  school.dataset.layout = 'v3';
  school.dataset.boardOnly = '1';
  let view = 'site';
  school.dataset.view3 = view;

  // ── 세 칸
  const room = document.getElementById('room'), dialogue = document.getElementById('dialogue');
  const stage = el('section', 'v3-stage'); stage.id = 'lectureStage'; stage.setAttribute('aria-label', '강의');
  const work = el('section', 'v3-work'); work.id = 'workZone'; work.setAttribute('aria-label', '문제 풀이');
  const teaching = room.querySelector('.teaching-space');
  const subtitle = el('div', 'v3-subtitle'); subtitle.id = 'subtitle'; subtitle.setAttribute('aria-live', 'polite'); subtitle.hidden = true;
  const mount3d = el('div', 'v3-3d'); mount3d.id = 'stage3d';
  stage.append(mount3d, teaching, subtitle);
  const guide = el('aside', 'v3-guide');
  guide.setAttribute('aria-label', '김주영 스앵님');
  const teacher = teaching.querySelector('.teacher');
  if (teacher) guide.append(teacher);
  room.append(stage, guide, work);
  school.append(dialogue);
  // Quiz choices stay on the board; written replies use the shared chat.
  const response = document.getElementById('board');
  response.append(document.getElementById('choices'));
  const pointer = el('div', 'v3-pointer'); pointer.setAttribute('aria-hidden', 'true');
  pointer.innerHTML = '<svg viewBox="0 0 160 90"><path d="M150 70Q117 77 105 52L70 37 76 18 120 34Q146 45 150 70" fill="#eee9e7" stroke="#b8ada7" stroke-width="2"/><path d="M77 19L61 13 33 19Q25 24 31 28L55 25 43 35Q40 42 48 42L72 37Z" fill="#e6beb0" stroke="#b39185" stroke-width="1.5"/><path d="M34 24L5 3" stroke="#d9c695" stroke-width="3" stroke-linecap="round"/></svg>';
  guide.append(pointer);
  const focusLine = el('div', 'v3-board-focus'); focusLine.hidden = true; stage.append(focusLine);
  const moveWork = () => { const w = room.ownerDocument.getElementById('missionWork'); if (w && w.parentElement !== work) work.append(w); };
  // 게임 보기에서 앉아 있을 때: 「자리에서 일어나기」 하나(기존 시점 줄의 같은 버튼을 누른다 — 줄 자체는 오타 A3 대로 숨김)
  const stand = iconBtn('stand', '자리에서 일어나기 (Esc)', 'v3-stand');
  stand.onclick = () => document.querySelector('.seat-controls [data-icon=stand]')?.click(); stage.append(stand);
  moveWork(); new MutationObserver(moveWork).observe(room, { childList: true });

  // ── 아래: 대화 기록 + 입력 + 진행 조작
  const log = el('div', 'v3-log'); log.id = 'chatLog'; log.setAttribute('aria-live', 'polite');
  const logPages = el('nav', 'v3-log-pages'); logPages.setAttribute('aria-label', '대화 내용 넘기기');
  const earlier = el('button', '', '이전 대화'), later = el('button', '', '다음 대화'), pageLabel = el('span');
  earlier.type = later.type = 'button';
  let messagePage = 0;
  const visualDialogue = el('section', 'v3-vn');
  visualDialogue.setAttribute('aria-label', '수업 대화');
  const speakerName = el('strong', 'v3-vn-name', '김주영 스앵님');
  function showMessage() {
    let rows = [...log.children]; messagePage = Math.max(0, Math.min(messagePage, rows.length - 1));
    rows.forEach((row, i) => { row.hidden = i !== messagePage; });
    // 실제 글꼴과 창 너비로 확인해서 긴 대사는 더 작은 페이지로 보존한다.
    let row = rows[messagePage], body = row?.querySelector('p');
    while (log.clientHeight && body && body.getBoundingClientRect().height > log.clientHeight && body.textContent.length > 1) {
      const parts = splitText(body.textContent, Math.ceil(body.textContent.length / 2));
      if (parts.length < 2) break;
      body.textContent = parts[0];
      let tail = row;
      for (const part of parts.slice(1)) {
        const next = el('div', row.className); next.hidden = true; next.append(el('p', undefined, part)); tail.after(next); tail = next;
      }
      rows = [...log.children];
    }
    speakerName.textContent = rows[messagePage]?.classList.contains('v3-me') ? '대표님' : '김주영 스앵님';
    earlier.disabled = messagePage === 0; later.disabled = messagePage >= rows.length - 1;
    pageLabel.textContent = rows.length ? `${messagePage + 1} / ${rows.length}` : '';
    logPages.hidden = !rows.length;
  }
  earlier.onclick = () => { messagePage--; showMessage(); };
  later.onclick = () => { messagePage++; showMessage(); };
  logPages.append(earlier, pageLabel, later); logPages.hidden = true;
  const chat = el('form', 'v3-chat'); const input = el('input'); input.id = 'chatInput'; input.placeholder = '스앵님께 말하기 · 답변이나 질문을 적어주세요'; input.autocomplete = 'off'; input.maxLength = 600; input.setAttribute('aria-label', '스앵님께 답변·질문 보내기');
  const send = iconBtn('send', '보내기', 'v3-send'); send.type = 'submit'; chat.append(input, send);
  const bar = el('div', 'v3-bar');
  const restart = iconBtn('restart', '이 단계 강의 처음부터'), play = iconBtn('pause', '강의 멈춤 (Space)', 'v3-play'), skip = iconBtn('skip', '다음 (Enter)', 'v3-skip');
  const progress = el('span', 'v3-progress');
  const journey = el('div', 'v3-journey'); journey.setAttribute('aria-label', '세부단원별 수업 진행');
  const route = el('nav', 'v3-route'); route.setAttribute('aria-label', '세부단원 바로 가기');
  const runner = el('span', 'v3-runner'); runner.setAttribute('aria-hidden', 'true'); runner.innerHTML = '<img src="../docs/demo/saeng/layers2/base.png" alt="">';
  const finish = el('span', 'v3-finish', '⚑'); finish.setAttribute('aria-label', '수업 도착점');
  journey.append(route, runner, finish); let journeyLesson = '', topics = [];
  const hint = document.getElementById('hint'), simpler = document.getElementById('simpler');
  const more = el('details', 'v3-more'); const sum = el('summary'); sum.innerHTML = svg(ICON.more); sum.setAttribute('aria-label', '더보기'); sum.dataset.tip = '근거·보충·공부 종료';
  const menu = el('div', 'v3-menu');
  // 더보기 메뉴는 목록(아이콘 + 이름) — 대표님 규칙의 「목록」 칸
  const strip = (re) => [...document.querySelectorAll('.learning-strip button')].find((b) => re.test(b.getAttribute('aria-label') || b.textContent));
  for (const [icon, label, go] of [
    ['M4 4h12l4 4v12H4zM8 12h8M8 16h5', '이 수업의 근거', () => document.getElementById('source')?.click()],
    ['M12 3v18M3 12h18', '맞춤 보충 수업', () => document.getElementById('generate')?.click()],
    ['M6 6h12v12H6z', '공부 종료', () => strip(/공부 종료/)?.click()],
    ['M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z', '내 스킬', () => strip(/내 스킬/)?.click()],
  ]) { const b = el('button', 'v3-menu-item'); b.type = 'button'; b.innerHTML = svg(icon); b.append(label); b.onclick = () => { more.open = false; go(); }; menu.append(b); }
  more.append(sum, menu);
  bar.append(journey, progress, restart, play, skip, hint, simpler, more);
  visualDialogue.append(speakerName, log, logPages);
  dialogue.prepend(visualDialogue); dialogue.append(chat, bar); room.append(dialogue);
  const placeDialogue = () => {
    if (school.dataset.mode !== 'classroom' || dialogue.hidden) return;
    const rect = room.getBoundingClientRect();
    if (!rect.width) return;
    school.style.setProperty('--class-chat-left', `${rect.left}px`);
    school.style.setProperty('--class-chat-width', `${rect.width}px`);
    school.style.setProperty('--class-chat-height', `${visualDialogue.offsetHeight + bar.offsetHeight}px`);
    school.style.setProperty('--class-board-height', `${stage.getBoundingClientRect().height}px`);
  };
  if (globalThis.ResizeObserver) {
    const observer = new ResizeObserver(placeDialogue);
    observer.observe(room); observer.observe(stage); observer.observe(visualDialogue); observer.observe(bar);
  }
  window.addEventListener('resize', placeDialogue);
  if (globalThis.ResizeObserver) new ResizeObserver(showMessage).observe(log);
  new MutationObserver(placeDialogue).observe(school, { attributes: true, attributeFilter: ['data-mode'] });

  restart.onclick = () => app.onRestart?.();
  play.onclick = () => app.onToggle?.();
  skip.onclick = () => app.onSkip?.();
  chat.addEventListener('submit', (e) => { e.preventDefault(); const t = input.value.trim(); if (!t) return; input.value = ''; addMine(t); app.onChat?.(t); });

  window.addEventListener('school:classroom-chat', (event) => { const text = String(event.detail?.text || '').trim(); if (school.dataset.mode !== 'classroom' || !text) return; addMine(text); app.onChat?.(text); });

  // 스앵님 말(#speech)이 바뀔 때마다 대화 기록에 한 줄
  const speech = document.getElementById('speech'); let lastLine = '';
  new MutationObserver(() => { const t = speech.textContent.trim(); if (t && t !== lastLine) { lastLine = t; addLine('saeng', t); } }).observe(speech, { childList: true, characterData: true, subtree: true });
  function addLine(who, text) {
    text = String(text).replace(/[ \t]*\n\s*/g, '\n').replace(/[ \t]{2,}/g, ' ').trim(); if (!text) return;
    if (who === 'me') { guide.dataset.pose='listen'; guide.dataset.direction='student'; }
    else { guide.dataset.pose='explain'; guide.dataset.direction='student'; }
    const first = log.children.length;
    for (const part of splitText(text, 140)) {
      const row = el('div', 'v3-msg v3-' + who); /* 'saeng' 그대로 쓰면 기존 초상 스타일과 겹친다 */ const b = el('p', undefined, part); row.append(b); log.append(row);
    }
    messagePage = first; showMessage();
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
    stage, mount3d, work, response,
    get view() { return view; },
    subtitle(text) { subtitle.hidden = !text || school.dataset.view3 === 'site'; subtitle.textContent = text || ''; },
    head(point) { if (!point) { subtitle.style.removeProperty('--hx'); subtitle.style.removeProperty('--hy'); return; } const r = stage.getBoundingClientRect(); subtitle.style.setProperty('--hx', (point.x - r.left) + 'px'); subtitle.style.setProperty('--hy', (point.y - r.top) + 'px'); },
    // 본문은 즉시 읽을 수 있게 두고, 강의 진행은 자막과 진행 표시로 안내한다.
    board(fraction) { stage.style.setProperty('--lecture-fraction', String(fraction)); document.querySelector('#board .content')?.style.setProperty('--reveal', '1'); },
    line(text) {
      if (!text) return;
      addLine('saeng', text);
      const context = app.context?.(), step = context?.lesson?.steps[context.index];
      const note = chalkNote(step ? {...step,body:chalkBoardText(context.lesson.steps,context.index)} : null, text);
      focusLine.hidden = !note;
      focusLine.textContent = note ? note.label + ' · ' + note.text : '';
      focusLine.dataset.kind = note?.kind || '';
      if (note) app.math?.(focusLine);
      focusLine.classList.remove('enter'); void focusLine.offsetWidth; focusLine.classList.add('enter');
      const kind = step?.kind;
      guide.dataset.gesture = kind === 'example' ? 'point' : kind === 'remember' ? 'emphasize' : 'explain';
      guide.dataset.pose = /보세요|칠판|행렬|공식|여기|조건/.test(text) || kind === 'example' || kind === 'remember' ? 'point' : 'explain';
      guide.dataset.direction = 'board';
      app.onMood?.(kind === 'example' ? 'smile' : kind === 'remember' ? 'strict' : 'neutral');
    },
    state({ playing, index, count, ended }) {
      play.innerHTML = svg(ICON[playing ? 'pause' : 'play']); play.setAttribute('aria-label', playing ? '강의 멈춤 (Space)' : ended ? '강의 다시 듣기 (Space)' : '강의 계속 (Space)'); play.dataset.tip = play.getAttribute('aria-label');
      const context = app.context?.();
      const currentStep = context?.lesson?.steps[context.index];
      school.dataset.step = currentStep?.options || currentStep?.kind === 'quiz' ? 'quiz' : 'board';
      if (school.dataset.step === 'quiz') focusLine.hidden = true;
      if (context?.lesson) {
        if (journeyLesson !== context.lesson.id) {
          journeyLesson = context.lesson.id; topics = groupLessonTopics(context.lesson.steps); route.replaceChildren();
          topics.forEach(topic => { const button = el('button', '', topic.title.split(' — ')[0]); button.type = 'button'; button.title = topic.title; button.onclick = () => app.onStep?.(topic.stepId); route.append(button); });
        }
        const step = context.index || 0, total = context.lesson.steps.length;
        const fraction = count ? (ended ? 1 : index / count) : 0;
        const pct = Math.min(100, Math.round((step + fraction) / Math.max(1,total) * 100));
        progress.textContent = `수업 진행 ${pct}%`; journey.style.setProperty('--journey-position', pct + '%');
        [...route.children].forEach((button, at) => { const active = step >= topics[at].index && step < (topics[at+1]?.index ?? total); button.classList.toggle('done', step >= (topics[at+1]?.index ?? total)); button.setAttribute('aria-current',active?'step':'false'); });
        journey.dataset.playing = String(playing);
      } else progress.textContent = app.progress?.() || '';
      school.dataset.lecture = ended ? 'ended' : playing ? 'playing' : 'paused';
    },
    focusChat() { (school.dataset.sharedChat ? school.querySelector('.sb input') : input)?.focus(); },
    say: addLine,
  };
}
