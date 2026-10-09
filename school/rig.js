// 기본 캐릭터 뼈대(대표님 10/9 「초심으로 — 눈코입·얼굴·팔다리·표정 정도만, 나중에 어떤 스킨을 적용해도 잘 붙게 동작만」).
// SVG 부위 하나하나에 data-part 이름을 달고, 모양은 스킨이 정한다:
//   스킨 = { colors: {...}, parts: { 부위: 'url' }, expr: { 표정: { eye|brow|mouth: 'url' } }, talk: { mouth: ['url', 'url'] } }
//   parts 로 바꿀 수 있는 건 고정 부위(face·hair-back·hair-front·neck·nose·cheek·torso·arm·hand·leg·shoe)뿐.
//   표정 부위(eye·brow·mouth)는 그림 하나로 고정하면 표정이 안 바뀌니 expr(표정별 그림)·talk(입 모양 그림)로만 바꾼다(오타 검수 10/9).
// 뼈대가 하는 일은 「표정」과 「동작」뿐: setExpr(이름) · play(동작) · speak(글) · setSkin(스킨).
// 표정: neutral · smile · laugh · think · serious · surprise · sad
// 동작: idle(숨쉬기·깜빡임, 늘) · talk(말하기 손짓) · wave · point(칠판 가리키기) · nod
const NS = 'http://www.w3.org/2000/svg';
const DEFAULT = { colors: { skin: '#f3d7c2', hair: '#2b2421', top: '#f4f1ea', bottom: '#2f3b46', shoes: '#1f1a17', line: '#3a2f2a', cheek: '#f0a5a0', eye: '#2a2320' } };
const EXPR = {   // 눈썹 기울기·눈 모양·입 모양
  neutral: { brow: 0, eye: 'open', mouth: 'flat' },
  smile: { brow: -2, eye: 'open', mouth: 'smile' },
  laugh: { brow: -3, eye: 'happy', mouth: 'open' },
  think: { brow: 4, eye: 'side', mouth: 'small' },
  serious: { brow: 6, eye: 'open', mouth: 'flat' },
  surprise: { brow: -6, eye: 'wide', mouth: 'o' },
  sad: { brow: -5, eye: 'down', mouth: 'frown' },
};
const MOUTH = {   // 입 path(얼굴 중심 기준)
  flat: 'M-7 0 Q0 1 7 0', smile: 'M-8 -1 Q0 7 8 -1', open: 'M-8 -1 Q0 11 8 -1 Z', small: 'M-4 1 Q0 2 4 1',
  o: 'M-4 0 a4 5 0 1 0 8 0 a4 5 0 1 0 -8 0', frown: 'M-7 3 Q0 -3 7 3', talk1: 'M-6 -1 Q0 6 6 -1 Z', talk2: 'M-7 -1 Q0 9 7 -1 Z',
};
const CSS = `
.rig{display:block;width:100%;height:100%;overflow:visible}
.rig [data-part]{transition:transform .25s ease}
.rig .rig-body{transform-origin:100px 150px;animation:rig-breathe 3.6s ease-in-out infinite}
.rig .rig-head{transform-origin:100px 96px}
.rig[data-motion=nod] .rig-head{animation:rig-nod .7s ease-in-out 2}
.rig .rig-arm-l{transform-origin:72px 128px}.rig .rig-arm-r{transform-origin:128px 128px}
.rig[data-motion=talk] .rig-arm-r{animation:rig-gesture 1.4s ease-in-out infinite}
.rig[data-motion=wave] .rig-arm-r{animation:rig-wave .5s ease-in-out 4}
.rig[data-motion=point] .rig-arm-r{transform:rotate(-115deg)}
.rig .rig-lid{transform-box:fill-box;transform-origin:50% 0;transform:scaleY(0)}
.rig[data-blink] .rig-lid{transform:scaleY(1);transition:transform .06s}
@keyframes rig-breathe{50%{transform:translateY(1.6px) scaleY(.992)}}
@keyframes rig-nod{50%{transform:rotate(8deg) translateY(2px)}}
@keyframes rig-gesture{0%,100%{transform:rotate(0)}40%{transform:rotate(-38deg)}70%{transform:rotate(-22deg)}}
@keyframes rig-wave{0%,100%{transform:rotate(-140deg)}50%{transform:rotate(-170deg)}}
@media (prefers-reduced-motion:reduce){.rig *{animation:none!important}}
`;
const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); parent?.append(e); return e; };

export function createRig(host, { skin, label = '캐릭터' } = {}) {
  if (!document.getElementById('rig-css')) { const s = document.createElement('style'); s.id = 'rig-css'; s.textContent = CSS; document.head.append(s); }
  const svg = el('svg', { class: 'rig', viewBox: '0 0 200 300', role: 'img', 'aria-label': label });
  const g = (cls, parent = svg) => el('g', { class: cls }, parent);
  const body = g('rig-body');
  // 다리 · 신발
  const legs = g('rig-legs', body);
  for (const x of [88, 112]) { el('rect', { 'data-part': 'leg', x: x - 7, y: 196, width: 14, height: 70, rx: 6, fill: 'var(--rig-bottom)' }, legs); el('ellipse', { 'data-part': 'shoe', cx: x, cy: 270, rx: 12, ry: 6, fill: 'var(--rig-shoes)' }, legs); }
  // 몸통
  el('path', { 'data-part': 'torso', d: 'M70 128 Q100 116 130 128 L136 200 Q100 208 64 200 Z', fill: 'var(--rig-top)', stroke: 'var(--rig-line)', 'stroke-width': 1.5 }, body);
  // 팔(어깨 기준 회전)
  const arm = (cls, x) => { const a = g(cls, body); el('rect', { 'data-part': 'arm', x: x - 6, y: 126, width: 12, height: 60, rx: 6, fill: 'var(--rig-top)', stroke: 'var(--rig-line)', 'stroke-width': 1.2 }, a); el('circle', { 'data-part': 'hand', cx: x, cy: 190, r: 7, fill: 'var(--rig-skin)' }, a); return a; };
  const armL = arm('rig-arm-l', 72), armR = arm('rig-arm-r', 128);
  // 머리
  const head = g('rig-head', body);
  el('rect', { 'data-part': 'neck', x: 93, y: 104, width: 14, height: 16, fill: 'var(--rig-skin)' }, head);
  el('path', { 'data-part': 'hair-back', d: 'M58 70 Q60 22 100 20 Q140 22 142 70 L146 118 Q100 124 54 118 Z', fill: 'var(--rig-hair)' }, head);
  el('ellipse', { 'data-part': 'face', cx: 100, cy: 70, rx: 38, ry: 44, fill: 'var(--rig-skin)', stroke: 'var(--rig-line)', 'stroke-width': 1.2 }, head);
  el('path', { 'data-part': 'hair-front', d: 'M62 60 Q72 26 104 26 Q136 28 140 62 Q118 44 96 48 Q78 50 62 60 Z', fill: 'var(--rig-hair)' }, head);
  const brows = g('rig-brows', head), eyes = g('rig-eyes', head), lids = g('rig-lids', head);
  const browL = el('path', { 'data-part': 'brow', d: 'M76 56 L92 56', stroke: 'var(--rig-hair)', 'stroke-width': 3, 'stroke-linecap': 'round' }, brows);
  const browR = el('path', { 'data-part': 'brow', d: 'M108 56 L124 56', stroke: 'var(--rig-hair)', 'stroke-width': 3, 'stroke-linecap': 'round' }, brows);
  const eyeL = el('ellipse', { 'data-part': 'eye', cx: 84, cy: 68, rx: 4, ry: 5.5, fill: 'var(--rig-eye)' }, eyes);
  const eyeR = el('ellipse', { 'data-part': 'eye', cx: 116, cy: 68, rx: 4, ry: 5.5, fill: 'var(--rig-eye)' }, eyes);
  for (const cx of [84, 116]) el('rect', { class: 'rig-lid', x: cx - 6, y: 61, width: 12, height: 13, fill: 'var(--rig-skin)' }, lids);
  el('path', { 'data-part': 'nose', d: 'M100 74 Q97 84 101 86', stroke: 'var(--rig-line)', 'stroke-width': 1.4, fill: 'none', 'stroke-linecap': 'round' }, head);
  for (const cx of [78, 122]) el('ellipse', { 'data-part': 'cheek', cx, cy: 84, rx: 6, ry: 3.5, fill: 'var(--rig-cheek)', opacity: .45 }, head);
  const mouthG = el('g', { transform: 'translate(100 96)' }, head);
  const mouth = el('path', { 'data-part': 'mouth', d: MOUTH.flat, stroke: 'var(--rig-line)', 'stroke-width': 2, fill: '#b5534f', 'fill-opacity': 0, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, mouthG);
  host.append(svg);

  let expr = 'neutral', base = 'flat', talkTimer = null, blinkTimer = null, motionTimer = null, alive = true;
  let talkImg = null;
  const setMouth = (k) => {
    mouth.setAttribute('d', MOUTH[k] || MOUTH.flat); mouth.setAttribute('fill-opacity', /open|talk|o/.test(k) ? 1 : 0);
    // 스킨의 talk.mouth 그림이 있으면 말하는 동안 입은 그 그림을 번갈아
    const frames = skinNow.talk?.mouth;
    if (talkTimer && frames?.length) {
      if (!talkImg) { mouth.style.visibility = 'hidden'; talkImg = el('image', { 'data-skin': 'talk', 'data-of': 'mouth', x: -10, y: -6, width: 20, height: 14, preserveAspectRatio: 'xMidYMid meet' }, mouthG); }   // mouthG 기준(입 중심)
      talkImg.setAttribute('href', frames[(frames.length + (k === 'talk2' ? 1 : 0)) % frames.length]);
    } else if (talkImg) { talkImg.remove(); talkImg = null; mouth.style.visibility = ''; applyExprSkin(); }
  };
  function setExpr(name) {
    const e = EXPR[name] || EXPR.neutral; expr = EXPR[name] ? name : 'neutral'; base = e.mouth;
    browL.setAttribute('transform', `rotate(${e.brow} 84 56)`); browR.setAttribute('transform', `rotate(${-e.brow} 116 56)`);
    const ey = { open: [4, 5.5, 68, 0], wide: [4.8, 6.6, 67, 0], happy: [5, 1.6, 69, 0], side: [4, 5.5, 68, 3], down: [4, 3.4, 70, 0] }[e.eye];
    for (const [i, el2] of [eyeL, eyeR].entries()) { el2.setAttribute('rx', ey[0]); el2.setAttribute('ry', ey[1]); el2.setAttribute('cy', ey[2]); el2.setAttribute('cx', (i ? 116 : 84) + ey[3]); }
    if (!talkTimer) setMouth(base);
    svg.dataset.expr = expr;
    applyExprSkin();
  }
  function play(motion = 'idle', ms) {
    clearTimeout(motionTimer);
    if (motion === 'idle') { delete svg.dataset.motion; return; }
    svg.dataset.motion = motion;
    const dur = ms ?? { wave: 2000, nod: 1400, point: 2400 }[motion];
    if (dur) motionTimer = setTimeout(() => { if (svg.dataset.motion === motion) delete svg.dataset.motion; }, dur);
  }
  // 말하기: 글자 흐름에 맞춰 입을 열고 닫고, 손짓. 문장 끝이면 원래 표정 입으로.
  function speak(text = '') {
    clearInterval(talkTimer); talkTimer = null;
    const chars = [...String(text)].filter((c) => /\S/.test(c)).length; if (!chars) { setMouth(base); return; }
    let i = 0; play('talk');
    talkTimer = setInterval(() => {
      if (!alive || i++ >= Math.min(chars, 120)) { clearInterval(talkTimer); talkTimer = null; setMouth(base); if (svg.dataset.motion === 'talk') play('idle'); return; }
      setMouth(i % 3 === 0 ? 'small' : i % 2 ? 'talk1' : 'talk2');
    }, 90);
  }
  function blink() {
    if (!alive) return;
    svg.dataset.blink = ''; setTimeout(() => { delete svg.dataset.blink; }, 120);
    blinkTimer = setTimeout(blink, 2600 + Math.random() * 3200);
  }
  const STATIC = new Set(['face', 'hair-back', 'hair-front', 'neck', 'nose', 'cheek', 'torso', 'arm', 'hand', 'leg', 'shoe']);
  const EXPRESSIVE = ['eye', 'brow', 'mouth'];
  let skinNow = {};
  // 부위 도형을 숨기고 같은 자리(경계 상자)에 그림을 깐다. kind = 'part'(고정) | 'expr'(표정마다 바뀜)
  const overlay = (part, url, kind) => svg.querySelectorAll(`[data-part="${part}"]`).forEach((shape) => {
    const b = shape.getBBox(); shape.style.visibility = 'hidden';
    el('image', { 'data-skin': kind, 'data-of': part, href: url, x: b.x, y: b.y, width: b.width, height: b.height, preserveAspectRatio: 'xMidYMid meet' }, shape.parentNode);
  });
  const clear = (kind) => { svg.querySelectorAll(`image[data-skin${kind ? `="${kind}"` : ''}]`).forEach((x) => { svg.querySelectorAll(`[data-part="${x.dataset.of}"]`).forEach((sh) => { sh.style.visibility = ''; }); x.remove(); }); };
  function applyExprSkin() {   // 지금 표정(말하는 중이면 입은 talk 그림)에 맞는 표정 부위 그림
    clear('expr');
    const set = skinNow.expr?.[expr] || {};
    for (const part of EXPRESSIVE) if (set[part] && !(part === 'mouth' && talkTimer)) overlay(part, set[part], 'expr');
  }
  function setSkin(s = {}) {
    skinNow = s || {};
    const c = { ...DEFAULT.colors, ...(s.colors || {}) };
    for (const [k, v] of Object.entries(c)) svg.style.setProperty('--rig-' + k, v);
    clear();   // 이전 스킨 그림을 걷고 원래 도형을 전부 되살린 뒤
    for (const [part, url] of Object.entries(s.parts || {})) {
      if (!STATIC.has(part)) { console.warn(`rig: ${part} 는 parts 로 못 바꿔요(표정 부위는 expr·talk 로)`); continue; }
      overlay(part, url, 'part');
    }
    applyExprSkin();
  }
  setSkin(skin || DEFAULT); setExpr('neutral'); blinkTimer = setTimeout(blink, 1800);
  return {
    el: svg, setExpr, play, speak, setSkin,
    react(kind) { const m = { correct: ['laugh', 'nod'], wrong: ['serious', 'idle'], stuck: ['think', 'idle'], question: ['surprise', 'idle'], idle: ['neutral', 'idle'] }[kind] || ['neutral', 'idle']; setExpr(m[0]); play(m[1]); setTimeout(() => alive && setExpr('smile'), 1600); },
    get expr() { return expr; },
    destroy() { alive = false; clearInterval(talkTimer); clearTimeout(blinkTimer); clearTimeout(motionTimer); svg.remove(); },
  };
}
