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

export async function mountOffice3D() {
  if (window.__office3d) return window.__office3d;
  const ready = await waitFor(() => IDS.every((id) => document.querySelector(`.gl-workstation.${id} .gl-person`)));
  if (!ready) return null;
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
    const avatar = createAvatar(T, id); avatar.setPose('sit'); scene.add(avatar.group);
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
    if (document.hidden || now - last < 33) return;      // 30fps 면 충분
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
