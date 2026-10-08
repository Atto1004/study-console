// 1인칭 조작 (3D 세계 설계 v2 계약 B — 오타 10/8). 이 모듈이 가진 것: 키·터치 패드·시선(포인터 잠금·끌기·휠)·
// 이동·충돌 조회·상호작용 「요청」·1인칭 팔. 카메라에는 walking 상태일 때만 쓴다.
// 가지지 않는 것: 방·문·착석·카메라 전환·수업 저장·동기화(학교 space.js), 지도 구조(world-map).
// 겹친 창(overlay)이 하나라도 열려 있거나 입력칸에 포커스가 있으면 이동·시선·E 를 모두 무시하고 눌린 키를 푼다.
import { createArms } from './fp-arms.js';

// 한글 입력 상태에서도 같은 자리의 키로 움직이도록 글자(key)가 아니라 키 위치(code)로 읽는다.
const MOVE = { KeyW: 'w', ArrowUp: 'w', KeyS: 's', ArrowDown: 's', KeyA: 'a', ArrowLeft: 'a', KeyD: 'd', ArrowRight: 'd', ShiftLeft: 'shift', ShiftRight: 'shift' };
const TYPING = /INPUT|TEXTAREA|SELECT/;
export const typingTarget = (el) => !!el && (TYPING.test(el.tagName) || el.isContentEditable);

export function createController({ T, camera, canvas, isOverlay = () => false, blocked = () => false, onInteract = () => {}, eyeHeight = 1.65, reduced = () => false }) {
  const keys = new Set();
  let mode = 'hidden', yaw = 0, pitch = 0, drag = null, dragged = false, step = 0, wasOverlay = false;
  const arms = createArms(T, camera); arms.visible = false;
  const clampPitch = (p) => Math.max(-1.1, Math.min(1.1, p));
  const overlay = () => isOverlay() || typingTarget(document.activeElement);
  function release() { keys.clear(); drag = null; document.exitPointerLock?.(); }
  const look = (dx, dy, k) => { yaw -= dx * k; pitch = clampPitch(pitch - dy * k); };

  canvas.addEventListener('click', () => { if (mode === 'walking' && !dragged && !overlay()) canvas.requestPointerLock?.()?.catch?.(() => {}); });
  canvas.addEventListener('pointerdown', (e) => { canvas.focus(); dragged = false; if (mode === 'walking' && !overlay() && document.pointerLockElement !== canvas) { drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; try { canvas.setPointerCapture(e.pointerId); } catch {} } });
  canvas.addEventListener('pointermove', (e) => {
    if (mode !== 'walking' || overlay()) return;
    if (document.pointerLockElement === canvas) look(e.movementX, e.movementY, 0.0025);
    else if (drag?.id === e.pointerId) { if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 2) dragged = true; look(e.clientX - drag.x, e.clientY - drag.y, 0.005); drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; }
  });
  for (const t of ['pointerup', 'pointercancel']) canvas.addEventListener(t, () => (drag = null));
  canvas.addEventListener('wheel', (e) => { if (mode !== 'walking' || overlay()) return; e.preventDefault(); look(e.deltaX, e.deltaY, 0.004); }, { passive: false });
  window.addEventListener('keydown', (e) => {
    if (mode === 'walking' && e.key === 'Escape') { release(); return; }
    if (mode !== 'walking' || overlay() || typingTarget(e.target)) return;
    const k = MOVE[e.code]; if (k) { keys.add(k); e.preventDefault(); }
    if (e.code === 'KeyE' && !e.repeat) { e.preventDefault(); interact(); }
  });
  window.addEventListener('keyup', (e) => { const k = MOVE[e.code]; if (k) keys.delete(k); });
  window.addEventListener('blur', release);
  document.addEventListener('visibilitychange', () => { if (document.hidden) release(); });
  function interact() { if (mode !== 'walking' || overlay()) return; arms.reach(); onInteract(); }

  return {
    get mode() { return mode; },
    // 상태 바꾸기: 벗어날 때 키·끌기·포인터 잠금을 모두 푼다
    setMode(next) { if (next !== mode) { release(); mode = next; } arms.visible = mode === 'walking'; },
    get yaw() { return yaw; }, set yaw(v) { yaw = v; },
    get pitch() { return pitch; }, set pitch(v) { pitch = mode === 'seated' ? Math.max(-Math.PI / 2, Math.min(Math.PI / 2, v)) : clampPitch(v); },
    // 터치 패드 버튼이 누르고 떼는 키
    hold(key, down) { if (down && (mode !== 'walking' || overlay())) return; if (down) keys.add(key); else keys.delete(key); },
    interact,
    release,
    // walking 일 때만 카메라를 움직인다. 반환: 움직였는가
    update(dt) {
      const ov = overlay();
      if (ov && !wasOverlay) release();            // 창이 열리는 순간 눌린 키를 푼다
      wasOverlay = ov;
      let moving = false;
      if (mode === 'walking' && !ov) {
        let forward = (keys.has('w') ? 1 : 0) - (keys.has('s') ? 1 : 0), side = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0);
        const n = Math.hypot(forward, side) || 1; forward /= n; side /= n;
        const run = keys.has('shift'), speed = 2.65 * dt * (run ? 1.9 : 1);
        const x = camera.position.x + (-Math.sin(yaw) * forward + Math.cos(yaw) * side) * speed;
        const z = camera.position.z + (-Math.cos(yaw) * forward - Math.sin(yaw) * side) * speed;
        if (!blocked(x, camera.position.z)) camera.position.x = x;
        if (!blocked(camera.position.x, z)) camera.position.z = z;
        const amount = Math.abs(forward) + Math.abs(side); moving = amount > 0;
        step += speed * amount;
        camera.position.y = eyeHeight + (reduced() ? 0 : Math.sin(step * 8) * 0.022 * amount);
        arms.update(dt, { moving, running: run && moving });
      } else if (mode === 'walking') arms.update(dt);
      return moving;
    },
    // 카메라 방향은 소유 상태가 정한 yaw·pitch 로 매 프레임 맞춘다(전환 중에는 학교가 yaw·pitch 를 쓴다)
    apply() { camera.rotation.set(pitch, yaw, 0, 'YXZ'); },
    arms,
  };
}
