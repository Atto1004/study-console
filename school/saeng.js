// 김주영 스앵님 레이어드 2D. 원형: docs/demo/saeng/index.html (10/4). 그림은 manifest 규격만 맞추면 엔진 수정 없이 교체.
const ORDER = ["base", "expr_neutral", "expr_smile", "expr_strict", "expr_surprise", "expr_praise",
  "eyes_open", "eyes_half", "eyes_closed", "eyes_side", "mouth_closed", "mouth_half", "mouth_open"];
const TILT = { strict: "-1.6deg", surprise: "1.2deg", praise: "-2deg", smile: "1deg", neutral: "0deg" };
// 학습 상황 → 표정 흐름. 오답은 엄격하게 짚고 바로 다독인다.
const REACT = {
  idle: ["neutral"],
  correct: ["praise"],
  wrong: ["strict", "smile"],
  stuck: ["smile"],
  deadline: ["strict"],
  question: ["surprise", "smile"],
};

const CSS = `
.saeng{position:relative;aspect-ratio:440/584;transform-origin:50% 100%;will-change:transform;transition:rotate 420ms cubic-bezier(.34,1.56,.64,1)}
.saeng img{position:absolute;left:0;top:0;width:100%;height:auto;pointer-events:none;user-select:none;-webkit-user-drag:none}
.saeng .ly{opacity:0;transition:opacity 160ms ease}
.saeng .ly.on{opacity:1}
.saeng .ly.snap{transition:none}
.saeng.breath{animation:saeng-breath 3.4s ease-in-out infinite}
@keyframes saeng-breath{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-.4%) scale(1.012)}}
.saeng.hop{animation:saeng-hop 520ms cubic-bezier(.34,1.56,.64,1)}
@keyframes saeng-hop{0%,100%{transform:translateY(0)}40%{transform:translateY(-2.5%)}}
@media (prefers-reduced-motion:reduce){.saeng,.saeng.breath,.saeng.hop{animation:none;transition:none}.saeng .ly{transition:none}}
`;

function injectCss() {
  if (document.getElementById("saeng-css")) return;
  const s = document.createElement("style");
  s.id = "saeng-css";
  s.textContent = CSS;
  document.head.append(s);
}

// 그림을 못 받으면 원래 자리의 정지 그림을 그대로 둔다.
export async function attachSaeng(host, options) {
  try { return await mountSaeng(host, options); } catch { return null; }
}

export async function mountSaeng(host, { dir = "../docs/demo/saeng/layers2/" } = {}) {
  injectCss();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const M = await (await fetch(dir + "manifest.json")).json();
  const el = document.createElement("div");
  el.className = "saeng breath";
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", "김주영 스앵님");
  const LY = {};
  const [W, H] = M.size;
  const loads = [];
  for (const n of ORDER) {
    const img = new Image();
    img.alt = "";
    img.decoding = "async";
    img.className = n === "base" ? "base" : "ly";
    if (n !== "base") {
      const b = M.boxes[M.layers[n].box];
      img.style.left = (b[0] / W) * 100 + "%";
      img.style.top = (b[1] / H) * 100 + "%";
      img.style.width = ((b[2] - b[0]) / W) * 100 + "%";
    }
    loads.push(new Promise((ok) => { img.onload = img.onerror = ok; }));
    img.src = dir + n + ".png";
    el.append(img);
    LY[n] = img;
  }
  // 전부 받은 뒤에 붙인다 — 반쯤 그려진 얼굴이 먼저 보이지 않게.
  await Promise.all(loads);
  host.replaceChildren(el);

  let expr = "neutral", blinking = false, gazing = false, talking = false, alive = true;
  const timers = new Set();
  const stop = () => { alive = false; for (const t of timers) clearTimeout(t); timers.clear(); };
  // 화면에서 빠진 스앵님은 스스로 멈춘다(다시 그릴 때 타이머가 쌓이지 않게).
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (!alive) return; if (!el.isConnected) { stop(); return; } fn(); }, ms); timers.add(t); return t; };

  const set = (n, on, snap) => { const i = LY[n]; if (!i) return; i.classList.toggle("snap", !!snap); i.classList.toggle("on", !!on); };
  const only = (group, n, snap) => { for (const k in LY) if (k.startsWith(group)) set(k, k === n, snap); };
  // 표정 패치에는 그 표정의 눈·입이 들어 있다. 기본 표정일 때만 기본 눈·입을 올린다.
  const eyesRest = (snap) => only("eyes_", expr === "neutral" ? "eyes_open" : null, snap);
  const mouthRest = (snap) => only("mouth_", expr === "neutral" ? "mouth_closed" : null, snap);

  function blink(twice) {
    if (blinking || gazing) return;
    blinking = true;
    let t = 0;
    for (const [n, d] of [["eyes_half", 40], ["eyes_closed", 70], ["eyes_half", 50], [null, 110]]) {
      later(() => (n ? only("eyes_", n, true) : eyesRest(true)), t);
      t += d;
    }
    later(() => { blinking = false; if (twice) blink(false); }, t + 20);
  }
  const schedBlink = () => later(() => { blink(Math.random() < 0.18); schedBlink(); }, 3000 + Math.random() * 3000);
  function gaze() {
    if (blinking || talking || reduced) return;
    gazing = true;
    only("eyes_", "eyes_side");
    later(() => { eyesRest(); gazing = false; }, 600 + Math.random() * 400);
  }
  const schedGaze = () => later(() => { gaze(); schedGaze(); }, 8000 + Math.random() * 7000);

  function setExpr(x) {
    if (!TILT[x]) x = "neutral";
    expr = x;
    later(() => {
      only("expr_", "expr_" + x);
      if (!reduced) el.style.rotate = TILT[x];
      if (!blinking && !gazing) eyesRest();
      if (!talking) later(mouthRest, 120);
    }, 120);
  }

  // 글자를 찍는 쪽은 부른 화면이 맡고, 여기서는 입만 움직인다. onChar 로 한 글자씩 넘겨준다.
  let talkId = 0;
  function speak(text, onChar = () => {}) {
    const id = ++talkId;
    return new Promise((done) => {
      talking = true;
      let i = 0, m = 0;
      const shapes = ["mouth_closed", "mouth_half", "mouth_open", "mouth_half"];
      const step = () => {
        if (id !== talkId) { done(); return; }
        if (i >= text.length) { talking = false; mouthRest(); done(); return; }
        const ch = text[i++];
        onChar(ch, i);
        if (/[,.。!?\s]/.test(ch)) { mouthRest(true); later(step, /\s/.test(ch) ? 70 : 240); return; }
        m = (m + 1) % shapes.length;
        only("mouth_", shapes[m], true);
        later(step, 55 + Math.random() * 30);
      };
      later(step, 240);
    });
  }

  function react(kind) {
    const seq = REACT[kind] || REACT.idle;
    setExpr(seq[0]);
    // 폴짝 뛰기 없음 — 스앵님은 제자리에 서 있는다(대표님 10/9 「공중에 안 뜨고」). 칭찬은 표정으로만
    if (seq[1]) later(() => setExpr(seq[1]), 1400);
  }

  set("expr_neutral", true, true);
  eyesRest(true);
  mouthRest(true);
  schedBlink();
  schedGaze();

  return {
    el,
    setExpr,
    speak,
    react,
    get expr() { return expr; },
    destroy() { stop(); el.remove(); },
  };
}
