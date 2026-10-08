// 대표실(kingdom/company.js) 비서 자리의 픽셀 그림을 학교와 같은 3D 아바타로 바꾼다 (대표님 10/8).
// 대표실 코드는 건드리지 않고, 자리(.gl-workstation.{id} .gl-person) 안에 캔버스를 얹어 상태를 읽어 동작으로 옮긴다.
//   잠(한도 소진) → 졸기 · 작업 중 → 타자 · 대표/동료와 대화 → 그쪽을 본다 · 말풍선 → 입 · 오프라인 → 흐리게
// 렌더러는 하나만 쓰고 비서마다 차례로 그려 2D 캔버스에 옮긴다(WebGL 문맥 1개).
const BASE = new URL('./', import.meta.url).href;
const IDS = ['atom', 'otta', 'toto'];

async function waitFor(fn, ms = 30000) {
  const end = performance.now() + ms;
  while (performance.now() < end) { const v = fn(); if (v) return v; await new Promise((r) => setTimeout(r, 300)); }
  return null;
}

// 사실풍 비서(대표님 10/9 「사실적으로」 → A안): cast.json 이 사실풍(v3-realistic)이면 3D 캔버스 대신 실사급 상반신 그림을 자리에 세우고
// 같은 상태로 표정만 바꾼다. 작업 중=집중(serious) · 말풍선=웃음(smile) · 잠=무표정+흐림 · 동료/대표와 대화=그쪽으로 몸 돌림(좌우 반전).
// 그림 경로는 대표실 img/office/cast.json 의 stand[표정] — 그림 교체는 그 파일만.
async function mountRealistic() {
  let cast;
  try { cast = await (await fetch('img/office/cast.json', { cache: 'no-cache' })).json(); } catch { return null; }
  if (!/realistic/.test(cast?.version || '') || !IDS.every((id) => cast[id]?.stand?.neutral)) return null;
  const style = document.createElement('style');
  style.textContent = `.gl-person.has-real .gl-sprite{visibility:hidden}
.gl-real{position:absolute;left:50%;bottom:0;height:104%;width:auto;max-width:none;transform:translateX(-50%) scaleX(var(--face,1));transform-origin:50% 100%;pointer-events:none;transition:transform .35s ease,opacity .3s,filter .3s;filter:drop-shadow(0 6px 10px #0004)}
.gl-workstation.away .gl-real{opacity:.45;filter:grayscale(.7)}
.gl-workstation:has(.has-real) .gl-bubble{translate:0 calc(-1 * var(--real-lift,56px))}   /* 실사 그림은 옛 도트보다 키가 커서 말풍선이 얼굴을 가린다 — 머리 위로 */
.gl-real[data-expr=sleep]{filter:brightness(.72) saturate(.8);transform:translateX(-50%) scaleX(var(--face,1)) rotate(-4deg) translateY(4%)}
@media (prefers-reduced-motion:reduce){.gl-real{transition:none}}`;
  document.head.append(style);
  const staff = IDS.map((id) => {
    const node = document.querySelector(`.gl-workstation.${id}`), person = node.querySelector('.gl-person');
    if (getComputedStyle(person).position === 'static') person.style.position = 'relative';
    const img = new Image(); img.className = 'gl-real'; img.alt = ''; img.decoding = 'async'; img.src = cast[id].stand.neutral;
    // 표정 그림을 미리 받아 둔다(바뀔 때 깜빡임 없게)
    for (const src of new Set(Object.values(cast[id].stand))) { const pre = new Image(); pre.src = src; }
    person.append(img); person.classList.add('has-real');
    return { id, node, person, img, expr: 'neutral' };
  });
  const centerX = (s) => { const r = s.node.getBoundingClientRect(); return r.left + r.width / 2; };
  const pick = (id, e) => cast[id].stand[e] || cast[id].stand.neutral;
  let stopped = false;
  function tick() {
    if (stopped) return;
    if (!document.hidden && !document.body.classList.contains('gl-computer-open')) {
      const modes = window.Company?.state?.().modes || {};
      for (const s of staff) {
        const gaze = s.node.dataset.gaze || 'work', bubble = s.node.querySelector('.gl-bubble');
        const asleep = gaze === 'sleep' || s.node.classList.contains('sleep');
        const expr = asleep ? 'sleep' : bubble && !bubble.hidden ? 'smile' : gaze === 'work' && modes[s.id] === 'work' ? 'serious' : 'neutral';
        if (expr !== s.expr) { s.expr = expr; s.img.dataset.expr = expr; const src = pick(s.id, expr === 'sleep' ? 'neutral' : expr); if (s.img.getAttribute('src') !== src) s.img.src = src; }
        const other = gaze === 'peer' ? staff.find((o) => o !== s && o.node.dataset.gaze === 'peer') : staff.find((o) => o.id === gaze);
        s.img.style.setProperty('--face', other && centerX(other) < centerX(s) ? -1 : 1);   // 그림은 정면 — 왼쪽 상대면 좌우 반전으로 몸을 돌린 느낌
      }
    }
    setTimeout(tick, 400);
  }
  tick();
  const api = { mode: 'realistic', staff: Object.fromEntries(staff.map((s) => [s.id, s.img])), stop() { stopped = true; for (const s of staff) { s.img.remove(); s.person.classList.remove('has-real'); } } };
  window.__office3d = api;
  return api;
}

export async function mountOffice3D() {
  if (window.__office3d) return window.__office3d;
  const ready = await waitFor(() => IDS.every((id) => document.querySelector(`.gl-workstation.${id} .gl-person`)));
  if (!ready) return null;
  const real = await mountRealistic();
  if (real) return real;
  const [T, { createAvatar }] = await Promise.all([import(BASE + 'vendor/three.module.js'), import(BASE + 'avatar3d.js')]);
  let renderer;
  try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); }
  catch { return null; }                                  // WebGL 이 없으면 기존 그림 그대로
  renderer.setClearColor(0x000000, 0);
  const SIZE = 256, dpr = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(1); renderer.setSize(SIZE * dpr, SIZE * dpr, false);

  const style = document.createElement('style');
  style.textContent = `.gl-person.has-3d .gl-sprite{visibility:hidden}
.gl-avatar3d{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.gl-workstation.away .gl-avatar3d{opacity:.45;filter:grayscale(.6)}`;
  document.head.append(style);

  const staff = IDS.map((id) => {
    const node = document.querySelector(`.gl-workstation.${id}`), person = node.querySelector('.gl-person');
    const scene = new T.Scene();
    scene.add(new T.HemisphereLight(0xfff6e6, 0x6b5a48, 2.2));
    const sun = new T.DirectionalLight(0xfff1dc, 1.5); sun.position.set(1.5, 3, 4); scene.add(sun);
    const avatar = createAvatar(T, id); avatar.setPose('sit'); avatar.snap(); scene.add(avatar.group);
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 20);
    // 자리 그림(의자 등받이·노트북)에 맞춰 상반신이 노트북 위로 보이게 잡는다.
    camera.position.set(0, 1.2, 2.3); camera.lookAt(0, 1.05, 0);
    const canvas = document.createElement('canvas'); canvas.className = 'gl-avatar3d'; canvas.width = SIZE * dpr; canvas.height = SIZE * dpr; canvas.setAttribute('aria-hidden', 'true');
    if (getComputedStyle(person).position === 'static') person.style.position = 'relative';
    person.append(canvas); person.classList.add('has-3d');
    return { id, node, person, scene, camera, avatar, canvas, ctx: canvas.getContext('2d'), turn: 0 };
  });

  // 자리끼리 화면상 좌우로 동료를 바라본다.
  const centerX = (s) => { const r = s.node.getBoundingClientRect(); return r.left + r.width / 2; };
  function read(s) {
    const gaze = s.node.dataset.gaze || 'work';
    const modes = window.Company?.state?.().modes || {};
    const bubble = s.node.querySelector('.gl-bubble');
    const asleep = gaze === 'sleep' || s.node.classList.contains('sleep');
    s.avatar.doze(asleep);
    s.avatar.type(!asleep && gaze === 'work' && modes[s.id] === 'work');
    s.avatar.talk(!asleep && bubble && !bubble.hidden);
    let turn = 0;
    // 동료 대화는 두 사람 모두 gaze='peer'(company.js) → 같이 peer 인 다른 비서가 상대.
    const other = gaze === 'peer' ? staff.find((o) => o !== s && o.node.dataset.gaze === 'peer') : staff.find((o) => o.id === gaze);
    if (other) turn = Math.sign(centerX(other) - centerX(s)) * 0.7;
    s.turn += (turn - s.turn) * 0.12;
    s.avatar.group.rotation.y = s.turn;
  }

  const clock = new T.Clock();
  let last = 0, stopped = false;
  function frame(now) {
    if (stopped) return;
    requestAnimationFrame(frame);
    // 24fps 면 충분하고, 업무 컴퓨터 창이 화면을 덮고 있으면 그리지 않는다(렉 줄이기, 10/8).
    if (document.hidden || document.body.classList.contains('gl-computer-open') || now - last < 41) return;
    last = now;
    const dt = Math.min(clock.getDelta(), 0.1);
    for (const s of staff) {
      if (!s.person.isConnected || !s.person.getClientRects().length) continue;
      read(s); s.avatar.update(dt);
      renderer.render(s.scene, s.camera);
      s.ctx.clearRect(0, 0, s.canvas.width, s.canvas.height);
      s.ctx.drawImage(renderer.domElement, 0, 0);
    }
  }
  requestAnimationFrame(frame);
  renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); api.stop(); });
  const api = {
    staff: Object.fromEntries(staff.map((s) => [s.id, s.avatar])),
    stop() { stopped = true; for (const s of staff) { s.canvas.remove(); s.person.classList.remove('has-3d'); } },
  };
  window.__office3d = api;
  return api;
}

mountOffice3D().catch((e) => console.warn('대표실 3D 비서를 띄우지 못했습니다. 기존 그림으로 둡니다.', e));
