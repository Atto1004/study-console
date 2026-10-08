// A++O 3D 아바타 생성기. 대표님 10/8: 외형 디테일보다 몸 구조·아바타 생성 위주로 다섯 명 먼저.
// 몸 비율·머리·옷·소품만 설정값으로 바꾸고, 동작(서기·걷기·앉기·말하기·손 흔들기)은 모두 같은 뼈대로 움직인다.
// 얼굴 세부·옷 주름·공간 디자인은 나중(힉스필드).

export const CAST = {
  atto: {
    name: "아토", role: "대표님", height: 1.76, build: "average", skin: 0xf0c8a4,
    hair: { style: "short", color: 0x1c1b1f }, top: { type: "hoodie", color: 0x33404f, accent: 0xe9e4da },
    bottom: { type: "pants", color: 0x2a2d33 }, shoes: 0xf3f3f1, extras: [],
    note: "외형 정보가 없어 기본값 — 머리·옷 색을 알려 주시면 바꾼다",
  },
  atom: {
    name: "아톰", role: "비서실장", height: 1.78, build: "average", skin: 0xf2cfae,
    hair: { style: "messy", color: 0x15151a }, top: { type: "jacket", color: 0x1f4a36, inner: 0xf2efe6 },
    bottom: { type: "pants", color: 0x2b2e35 }, shoes: 0x1d1d20, extras: [],
  },
  otta: {
    name: "오타", role: "기술감사실장", height: 1.84, build: "broad", skin: 0xefcaa8,
    hair: { style: "neat", color: 0x121216 }, top: { type: "tee", color: 0x18181b },
    bottom: { type: "pants", color: 0x2c2f36 }, shoes: 0x18181b, extras: ["watch"],
  },
  toto: {
    name: "토토", role: "트렌드 담당", height: 1.72, build: "slim", skin: 0xf3d2b4,
    hair: { style: "perm", color: 0x8b7a69 }, top: { type: "hoodie", color: 0xefe6d6, accent: 0xe8735a },
    bottom: { type: "pants", color: 0x4d6c93 }, shoes: 0xf1ede6, extras: ["earphones"],
  },
  saeng: {
    name: "김주영 스앵님", role: "튜터", height: 1.67, build: "female", skin: 0xf3d3bb,
    hair: { style: "bun", color: 0x141416 }, top: { type: "shirt", color: 0xf7f6f2 },
    bottom: { type: "skirt", color: 0x1e1e22 }, shoes: 0x1a1a1d, extras: ["glasses", "necklace"], lips: 0x9b2c35,
  },
};

const BUILD = {
  average: { shoulder: 1.0, waist: 1.0, limb: 1.0 },
  broad: { shoulder: 1.18, waist: 1.05, limb: 1.12 },
  slim: { shoulder: 0.92, waist: 0.9, limb: 0.9 },
  female: { shoulder: 0.88, waist: 0.82, limb: 0.86 },
};

// 관절 각도(라디안). 동작마다 목표값을 정하고 매 프레임 그쪽으로 부드럽게 다가간다.
const POSES = {
  stand: { hipY: 0, lHip: 0, rHip: 0, lKnee: 0, rKnee: 0, lSh: 0.06, rSh: -0.06, lShX: 0, rShX: 0, lEl: -0.12, rEl: -0.12, spine: 0, head: 0 },
  sit: { hipY: -1, lHip: -1.5, rHip: -1.5, lKnee: 1.55, rKnee: 1.55, lSh: 0.1, rSh: -0.1, lShX: -0.55, rShX: -0.55, lEl: -0.9, rEl: -0.9, spine: 0.04, head: 0.06 },
};

function mat(T, color, opts = {}) {
  return new T.MeshStandardMaterial({ color, roughness: opts.rough ?? 0.72, metalness: opts.metal ?? 0 });
}

export function createAvatar(T, spec) {
  if (typeof spec === "string") spec = CAST[spec];
  const H = spec.height, b = BUILD[spec.build] || BUILD.average;
  const head = H / 6.6, legLen = H * 0.46, torsoLen = H * 0.29;
  const root = new T.Group(); root.name = spec.name;
  const body = new T.Group(); root.add(body);
  const skin = mat(T, spec.skin), top = mat(T, spec.top.color), bottom = mat(T, spec.bottom.color), shoe = mat(T, spec.shoes, { rough: 0.5 });
  const hairM = mat(T, spec.hair.color, { rough: 0.85 });
  const add = (parent, geo, m, x = 0, y = 0, z = 0) => { const o = new T.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; parent.add(o); return o; };
  const cap = (r, len) => new T.CapsuleGeometry(r, Math.max(0.001, len - 2 * r), 6, 12);

  // 엉덩이(골반) — 다리·몸통의 기준점
  const hips = new T.Group(); hips.position.y = legLen; body.add(hips);
  const pelvisW = 0.17 * b.waist;
  add(hips, new T.BoxGeometry(pelvisW * 2, 0.16, 0.2), spec.bottom.type === "skirt" ? bottom : bottom, 0, 0.02, 0).scale.set(1, 1, 1);

  // 다리: 엉덩이 관절 → 무릎 관절
  const leg = (side) => {
    const hip = new T.Group(); hip.position.set(side * pelvisW * 0.55, 0, 0); hips.add(hip);
    const r = 0.062 * b.limb, up = legLen * 0.5, low = legLen * 0.5;
    add(hip, cap(r, up), spec.bottom.type === "skirt" ? skin : bottom, 0, -up / 2, 0);
    const knee = new T.Group(); knee.position.y = -up; hip.add(knee);
    add(knee, cap(r * 0.9, low), spec.bottom.type === "skirt" ? skin : bottom, 0, -low / 2, 0);
    add(knee, new T.BoxGeometry(r * 2.2, 0.07, 0.24), shoe, 0, -low + 0.02, 0.05);
    return { hip, knee };
  };
  const L = leg(1), R = leg(-1);
  if (spec.bottom.type === "skirt") add(hips, new T.CylinderGeometry(pelvisW * 1.05, pelvisW * 1.45, legLen * 0.42, 18, 1, true), bottom, 0, -legLen * 0.19, 0).material.side = T.DoubleSide;

  // 몸통(척추) — 숨쉬기는 가슴 크기로
  const spine = new T.Group(); spine.position.y = 0.06; hips.add(spine);
  const chest = new T.Group(); spine.add(chest);
  const shW = 0.2 * b.shoulder;
  const torsoTop = spec.top.type === "jacket" ? mat(T, spec.top.inner) : top;
  const torso = add(chest, cap(shW * 0.95, torsoLen), torsoTop, 0, torsoLen / 2, 0); torso.scale.set(1, 1, 0.62);
  if (spec.top.type === "jacket") {                     // 열린 집업: 안에 흰 티, 바깥 양옆 재킷 판
    for (const s of [1, -1]) { const p = add(chest, new T.BoxGeometry(shW * 0.7, torsoLen * 0.95, 0.27), top, s * shW * 0.62, torsoLen / 2, 0.005); p.rotation.y = s * 0.12; }
  }
  if (spec.top.type === "hoodie") {                     // 후드: 목 뒤 고리 + 끈(포인트 색)
    add(chest, new T.TorusGeometry(shW * 0.55, 0.05, 8, 18), top, 0, torsoLen * 0.98, -0.07).rotation.x = Math.PI / 2.2;
    const acc = mat(T, spec.top.accent || 0xffffff);
    for (const s of [1, -1]) add(chest, new T.CylinderGeometry(0.008, 0.008, 0.16, 6), acc, s * 0.04, torsoLen * 0.8, 0.12);
  }
  if (spec.top.type === "shirt") add(chest, new T.ConeGeometry(0.06, 0.1, 3), mat(T, 0xffffff), 0, torsoLen * 0.93, 0.1).rotation.x = Math.PI;

  // 목·머리
  const neck = new T.Group(); neck.position.y = torsoLen; chest.add(neck);
  add(neck, new T.CylinderGeometry(0.05, 0.055, 0.09, 10), skin, 0, 0.04, 0);
  const headG = new T.Group(); headG.position.y = 0.08; neck.add(headG);
  const hr = head / 2;
  const skull = add(headG, new T.SphereGeometry(hr, 24, 18), skin, 0, hr, 0); skull.scale.set(0.92, 1.08, 0.98);
  const face = new T.Group(); face.position.set(0, hr * 1.02, hr * 0.86); headG.add(face);
  const eyeM = mat(T, 0x1b1b1f, { rough: 0.3 });
  const eyes = [1, -1].map((s) => add(face, new T.SphereGeometry(hr * 0.1, 10, 8), eyeM, s * hr * 0.34, 0.01, 0.02));
  for (const s of [1, -1]) add(face, new T.BoxGeometry(hr * 0.32, hr * 0.045, 0.01), hairM, s * hr * 0.34, hr * 0.22, 0.03).rotation.z = s * -0.08;
  const mouth = add(face, new T.BoxGeometry(hr * 0.3, hr * 0.05, 0.01), mat(T, spec.lips || 0xb5655f), 0, -hr * 0.42, 0.0);
  for (const s of [1, -1]) add(headG, new T.SphereGeometry(hr * 0.16, 8, 8), skin, s * hr * 0.93, hr * 0.98, 0);

  // 머리카락: 모양별로 간단한 덩어리
  const hairCap = add(headG, new T.SphereGeometry(hr * 1.06, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.42), hairM, 0, hr * 1.12, -hr * 0.1);
  hairCap.rotation.x = -0.32;                                 // 이마가 보이게 뒤로 기울인다
  hairCap.scale.set(0.97, 1.05, 1.04);
  const st = spec.hair.style;
  if (st === "messy" || st === "perm") {
    const n = st === "perm" ? 22 : 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, rr = st === "perm" ? hr * 0.26 : hr * 0.22;
      const tuft = add(headG, st === "perm" ? new T.SphereGeometry(rr, 8, 6) : new T.ConeGeometry(rr, hr * 0.5, 5), hairM, Math.cos(a) * hr * 0.8, hr * 1.55 + Math.sin(i * 1.7) * hr * 0.12, Math.sin(a) * hr * 0.75 - hr * 0.05);
      if (st === "messy") tuft.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9);
    }
  }
  if (st === "neat") add(headG, new T.BoxGeometry(hr * 1.5, hr * 0.18, hr * 0.5), hairM, hr * 0.15, hr * 1.78, hr * 0.42).rotation.z = -0.15;
  if (st === "short") add(headG, new T.BoxGeometry(hr * 1.6, hr * 0.2, hr * 0.4), hairM, 0, hr * 1.7, hr * 0.5).rotation.x = 0.35;
  if (st === "bun") {
    add(headG, new T.SphereGeometry(hr * 0.42, 14, 10), hairM, 0, hr * 0.62, -hr * 1.0);
    for (const s of [1, -1]) add(headG, new T.CylinderGeometry(hr * 0.04, hr * 0.02, hr * 0.9, 5), hairM, s * hr * 0.78, hr * 0.85, hr * 0.55).rotation.z = s * 0.12;
  }

  // 소품
  if (spec.extras.includes("glasses")) {
    const g = mat(T, 0xc9ccd2, { rough: 0.25, metal: 0.8 });
    for (const s of [1, -1]) add(face, new T.TorusGeometry(hr * 0.17, hr * 0.018, 6, 4), g, s * hr * 0.34, 0.01, 0.06).rotation.z = Math.PI / 4;
    add(face, new T.BoxGeometry(hr * 0.2, hr * 0.02, hr * 0.02), g, 0, 0.03, 0.06);
  }
  if (spec.extras.includes("earphones")) for (const s of [1, -1]) add(headG, new T.SphereGeometry(hr * 0.09, 8, 8), mat(T, 0xffffff, { rough: 0.3 }), s * hr * 1.02, hr * 0.98, hr * 0.05);
  if (spec.extras.includes("necklace")) {
    const sv = mat(T, 0xd0d3d8, { rough: 0.25, metal: 0.8 });
    add(chest, new T.TorusGeometry(0.07, 0.004, 6, 24), sv, 0, torsoLen * 0.86, 0.06).rotation.x = Math.PI / 2.4;
    add(chest, new T.BoxGeometry(0.012, 0.04, 0.006), sv, 0, torsoLen * 0.72, 0.125);
    add(chest, new T.BoxGeometry(0.03, 0.01, 0.006), sv, 0, torsoLen * 0.73, 0.125);
  }

  // 팔: 어깨 관절 → 팔꿈치 관절
  const arm = (side) => {
    const sh = new T.Group(); sh.position.set(side * shW * 1.05, torsoLen * 0.88, 0); chest.add(sh);
    const r = 0.048 * b.limb, up = H * 0.165, low = H * 0.15;
    const sleeve = spec.top.type === "tee" || spec.top.type === "shirt" ? top : top;
    add(sh, cap(r, up), sleeve, 0, -up / 2, 0);
    const el = new T.Group(); el.position.y = -up; sh.add(el);
    add(el, cap(r * 0.85, low), spec.top.type === "tee" ? skin : top, 0, -low / 2, 0);
    add(el, new T.SphereGeometry(r * 0.95, 10, 8), skin, 0, -low - 0.01, 0);
    if (side === 1 && spec.extras.includes("watch")) add(el, new T.TorusGeometry(r * 0.95, 0.01, 6, 16), mat(T, 0x9aa0a8, { metal: 0.7, rough: 0.3 }), 0, -low * 0.85, 0).rotation.x = Math.PI / 2;
    return { sh, el };
  };
  const LA = arm(1), RA = arm(-1);

  // 동작
  let pose = "stand", t = 0, nextBlink = 2 + Math.random() * 3, blinkT = -1, talking = false, waving = false, typing = false, dozing = false;
  let lecturing = false, pointUntil = 0;
  const cur = { ...POSES.stand };
  const seatDrop = legLen - 0.46;                         // 의자 높이 0.46m 에 앉는다
  function target(time) {
    const p = { ...(POSES[pose] || POSES.stand) };
    if (pose === "walk") {
      const w = time * 7.2, s = Math.sin(w);
      Object.assign(p, POSES.stand, { lHip: s * 0.5, rHip: -s * 0.5, lKnee: Math.max(0, -Math.cos(w)) * 0.7, rKnee: Math.max(0, Math.cos(w)) * 0.7, lShX: -s * 0.4, rShX: s * 0.4, lEl: -0.3, rEl: -0.3, spine: 0.05 });
    }
    // 타자: 두 팔을 책상 위로 뻗고 번갈아 두드린다. 졸기: 고개를 떨군다.
    if (typing) Object.assign(p, { lShX: -1.05 + Math.sin(time * 11) * 0.06, rShX: -1.05 + Math.sin(time * 11 + 1.7) * 0.06, lEl: -0.75, rEl: -0.75, lSh: 0.12, rSh: -0.12, head: 0.18 });
    if (dozing) Object.assign(p, { head: 0.5, spine: 0.16, lShX: -0.25, rShX: -0.25, lEl: -0.6, rEl: -0.6 });
    if (lecturing) Object.assign(p, { lSh: 0.2, lShX: -0.25, lEl: -0.65, rSh: -0.55, rShX: 0.35 + Math.sin(time * 2.2) * 0.12, rEl: -0.4, head: Math.sin(time * 2) * 0.035 });
    if (time < pointUntil) Object.assign(p, { rSh: -1.25, rShX: 0.35, rEl: -0.15, head: -0.04 });
    if (waving) Object.assign(p, { rSh: -2.6, rShX: 0, rEl: -0.5 + Math.sin(time * 9) * 0.35 });
    return p;
  }
  function update(dt) {
    t += dt;
    const p = target(t), k = Math.min(1, dt * 9);
    for (const key in p) cur[key] += (p[key] - cur[key]) * k;
    L.hip.rotation.x = cur.lHip; R.hip.rotation.x = cur.rHip; L.knee.rotation.x = cur.lKnee; R.knee.rotation.x = cur.rKnee;
    LA.sh.rotation.z = cur.lSh; RA.sh.rotation.z = cur.rSh; LA.sh.rotation.x = cur.lShX; RA.sh.rotation.x = cur.rShX; LA.el.rotation.x = cur.lEl; RA.el.rotation.x = cur.rEl;
    spine.rotation.x = cur.spine; headG.rotation.x = cur.head;
    hips.position.y = legLen + cur.hipY * seatDrop + (pose === "walk" ? Math.abs(Math.sin(t * 7.2)) * 0.025 : 0);
    const breath = 1 + Math.sin(t * (2 * Math.PI / 3.4)) * 0.012;  // 숨: 3.4초 주기
    chest.scale.set(breath, 1 + (breath - 1) * 0.6, breath);
    headG.rotation.y = Math.sin(t * 0.37) * 0.08 + (talking ? Math.sin(t * 3) * 0.04 : 0);
    if (dozing) { for (const e of eyes) e.scale.y = 0.08; blinkT = -1; nextBlink = t + 1; }
    else if (blinkT < 0 && t > nextBlink) blinkT = 0;          // 깜빡임: 3~6초 무작위, 가끔 두 번
    if (blinkT >= 0) {
      blinkT += dt; const c = blinkT < 0.07 ? 1 - blinkT / 0.07 : blinkT < 0.14 ? (blinkT - 0.07) / 0.07 : 1;
      for (const e of eyes) e.scale.y = Math.max(0.08, c);
      if (blinkT >= 0.14) { blinkT = -1; nextBlink = t + (Math.random() < 0.18 ? 0.25 : 3 + Math.random() * 3); }
    }
    mouth.scale.y = talking ? 1 + Math.abs(Math.sin(t * 13)) * 3 : 1;
  }
  return {
    group: root, spec, height: H,
    // 말풍선 꼬리는 머리와 함께 움직이는 정수리 기준점을 투영한다.
    headAnchor: headG,
    update,
    setPose(name) { pose = (POSES[name] || name === "walk") ? name : "stand"; },
    // 처음 놓을 때는 서 있다 앉는 과정 없이 바로 그 자세로(대표실에서 첫 프레임에 머리가 잘려 보이던 것).
    snap() { Object.assign(cur, target(t)); update(0); },
    get pose() { return pose; },
    talk(on) { talking = !!on; },
    lecture(on) { lecturing = talking = !!on; if (!on) pointUntil = 0; },
    point() { pointUntil = t + 1.2; },
    wave(on) { waving = !!on; },
    type(on) { typing = !!on; },
    doze(on) { if (dozing && !on) for (const e of eyes) e.scale.y = 1; dozing = !!on; },
  };
}
