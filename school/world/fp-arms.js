// 1인칭 팔·손 (대표님 10/8: 「내 팔 정도만 보이면 될 것 같아, 팔이랑 손 정도는 보여야 하고 나머지는 구현 안 해도 될 듯」).
// 카메라에 붙는 팔 두 개. 옷·피부 색은 대표님 아바타 설정값(CAST.atto)을 그대로 쓴다.
// update(dt, {moving, running}) 로 숨·걸음 흔들림, reach() 로 문·물건을 누를 때 오른손을 뻗는다.
import { CAST } from '../avatar3d.js';

export function createArms(T, camera, spec = CAST.atto) {
  const mat = (color) => new T.MeshStandardMaterial({ color, roughness: 0.8 });
  const sleeve = mat(spec.top.color), skin = mat(spec.skin);
  const root = new T.Group(); root.name = 'fp-arms';
  const arm = (side) => {
    // 어깨는 화면 밖 아래쪽, 팔뚝·손만 화면 아래 모서리에 보이게
    const g = new T.Group(); g.position.set(side * 0.24, -0.3, -0.38);
    const fore = new T.Mesh(new T.CylinderGeometry(0.042, 0.05, 0.36, 12), sleeve);
    fore.rotation.x = Math.PI / 2; fore.position.z = 0.06; g.add(fore);
    const cuff = new T.Mesh(new T.CylinderGeometry(0.044, 0.044, 0.03, 12), mat(0x2a3542));
    cuff.rotation.x = Math.PI / 2; cuff.position.z = -0.12; g.add(cuff);
    const hand = new T.Group(); hand.position.set(0, 0, -0.17); g.add(hand);
    const palm = new T.Mesh(new T.BoxGeometry(0.075, 0.03, 0.085), skin); hand.add(palm);
    for (let i = 0; i < 4; i++) {                        // 손가락 4개 + 엄지 — 구조만
      const f = new T.Mesh(new T.BoxGeometry(0.016, 0.022, 0.05), skin);
      f.position.set((i - 1.5) * 0.019, 0, -0.064); hand.add(f);
    }
    const thumb = new T.Mesh(new T.BoxGeometry(0.018, 0.022, 0.045), skin);
    thumb.position.set(-side * 0.046, 0.004, -0.02); thumb.rotation.y = side * 0.6; hand.add(thumb);
    g.rotation.set(-0.12, side * -0.18, side * 0.12);
    root.add(g);
    return { g, base: g.position.clone(), rot: g.rotation.clone(), hand };
  };
  const L = arm(-1), R = arm(1);
  camera.add(root);
  root.traverse((o) => { o.renderOrder = 10; if (o.material) { o.material.depthTest = true; } });

  let t = 0, stride = 0, reachT = -1;
  return {
    root,
    update(dt, { moving = false, running = false } = {}) {
      t += dt;
      const speed = moving ? (running ? 1.9 : 1) : 0;
      stride += dt * 7.5 * speed;
      const bob = moving ? Math.sin(stride) * 0.012 * speed : Math.sin(t * 1.8) * 0.003;   // 걸음 / 숨
      const sway = moving ? Math.cos(stride * 0.5) * 0.01 * speed : 0;
      for (const [a, s] of [[L, -1], [R, 1]]) {
        a.g.position.set(a.base.x + sway * s, a.base.y + bob * (s > 0 ? 1 : -1), a.base.z);
        a.g.rotation.copy(a.rot);
      }
      if (reachT >= 0) {                                 // 오른손 뻗기 0.35초
        reachT += dt; const k = Math.sin(Math.min(1, reachT / 0.35) * Math.PI);
        R.g.position.z = R.base.z - 0.16 * k; R.g.position.y = R.base.y + 0.07 * k; R.g.rotation.x = R.rot.x + 0.25 * k;
        if (reachT >= 0.35) reachT = -1;
      }
    },
    reach() { reachT = 0; },
    set visible(v) { root.visible = !!v; },
    get visible() { return root.visible; },
  };
}
