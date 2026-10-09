// 문제 풀이용 계산기 — 교실·과제 화면에서 띄우는 떠 있는 창 (대표님 10/9 「문제 풀 때 창에 계산기」)
// 시험(정역학 10/19)은 계산기 허용. 시험장 공학용 계산기처럼 각도는 도(DEG), 연립방정식(2·3원)까지.
// 계산은 eval 없이 직접 구문 분석한다. 기록은 저장하지 않는다(새로고침하면 비움).

const DEG = Math.PI / 180;
const FN = {
  sin: x => Math.sin(x * DEG), cos: x => Math.cos(x * DEG), tan: x => Math.tan(x * DEG),
  asin: x => Math.asin(x) / DEG, acos: x => Math.acos(x) / DEG, atan: x => Math.atan(x) / DEG,
  sqrt: Math.sqrt, abs: Math.abs, ln: Math.log, log: Math.log10,
};
const ALIAS = { "√": "sqrt", "sin⁻¹": "asin", "cos⁻¹": "acos", "tan⁻¹": "atan" };

function tokenize(src) {
  const s = src.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/²/g, "^2").replace(/\s+/g, "");
  const out = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    const num = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(i));
    if (num) { out.push({ t: "n", v: parseFloat(num[0]) }); i += num[0].length; continue; }
    const al = Object.keys(ALIAS).find(k => s.startsWith(k, i));
    if (al) { out.push({ t: "f", v: ALIAS[al] }); i += al.length; continue; }
    const w = /^[a-zA-Zπ]+/.exec(s.slice(i));
    if (w) {
      const word = w[0].toLowerCase();
      if (word === "π" || word === "pi") out.push({ t: "n", v: Math.PI, c: 1 });
      else if (word === "ans") out.push({ t: "ans" });
      else if (FN[word]) out.push({ t: "f", v: word });
      else throw new Error(`모르는 기호: ${w[0]}`);
      i += w[0].length; continue;
    }
    if ("+-*/^()".includes(c)) { out.push({ t: c }); i++; continue; }
    throw new Error(`모르는 기호: ${c}`);
  }
  // 곱하기 생략: 2(…), 2π, 2sin30, )( , )2
  const res = [];
  for (const tk of out) {
    const prev = res[res.length - 1];
    const prevVal = prev && (prev.t === "n" || prev.t === "ans" || prev.t === ")");
    const curStart = tk.t === "n" || tk.t === "ans" || tk.t === "f" || tk.t === "(";
    if (prevVal && curStart) res.push({ t: "*" });
    res.push(tk);
  }
  return res;
}

export function evaluate(src, ans = 0) {
  const tk = tokenize(String(src));
  if (!tk.length) throw new Error("식이 비었습니다");
  let p = 0;
  const peek = () => tk[p], take = () => tk[p++];
  const expect = t => { if (!peek() || peek().t !== t) throw new Error("괄호가 맞지 않습니다"); p++; };
  function expr() { let v = term(); while (peek() && (peek().t === "+" || peek().t === "-")) { const o = take().t; const r = term(); v = o === "+" ? v + r : v - r; } return v; }
  function term() { let v = unary(); while (peek() && (peek().t === "*" || peek().t === "/")) { const o = take().t; const r = unary(); v = o === "*" ? v * r : v / r; } return v; }
  function unary() { if (peek() && peek().t === "-") { take(); return -unary(); } if (peek() && peek().t === "+") { take(); return unary(); } return power(); }
  function power() { const b = atom(); if (peek() && peek().t === "^") { take(); return Math.pow(b, unary()); } return b; }
  function atom() {
    const k = take();
    if (!k) throw new Error("식이 끝나지 않았습니다");
    if (k.t === "n") return k.v;
    if (k.t === "ans") return ans;
    if (k.t === "(") { const v = expr(); expect(")"); return v; }
    if (k.t === "f") {
      let arg;
      if (peek() && peek().t === "(") { take(); arg = expr(); expect(")"); } else arg = power();
      return FN[k.v](arg);
    }
    throw new Error("식이 올바르지 않습니다");
  }
  const v = expr();
  if (p < tk.length) throw new Error("식이 올바르지 않습니다");
  if (!Number.isFinite(v)) throw new Error("계산할 수 없는 값입니다(0으로 나눔 또는 범위 밖)");
  return v;
}

// 가우스 소거(부분 피벗). A: n×n, b: n. 해가 하나로 안 정해지면 null.
export function solve(A, b) {
  const n = b.length;
  // 식마다 가장 큰 계수로 나눠 크기를 맞춘다 — 단위가 큰 식(1e13)·작은 식(1e-13)도 같은 기준으로 판정
  const M = A.map((r, i) => {
    const s = Math.max(...r.map(Math.abs));
    return s === 0 ? [...r, b[i]] : [...r.map(v => v / s), b[i] / s];
  });
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    if (Math.abs(M[piv][c]) < 1e-12) return null;
    [M[c], M[piv]] = [M[piv], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((r, i) => r[n] / r[i]);
}

export function fmt(v) {
  if (!Number.isFinite(v)) return "—";
  if (Math.abs(v) < 1e-12) return "0";
  const a = Math.abs(v);
  if (a >= 1e9 || a < 1e-5) return v.toExponential(5).replace(/\.?0+e/, "e");
  return String(parseFloat(v.toPrecision(10)));
}

// ───────── 화면 ─────────
const CSS = `
.calc-fab{position:fixed;right:18px;bottom:96px;z-index:60;display:flex;align-items:center;gap:6px;min-height:44px;padding:0 16px;border-radius:22px;border:1px solid var(--line,#dfe7df);background:var(--surface,#fff);color:var(--ink,#182a24);font:600 15px var(--font,sans-serif);box-shadow:var(--shadow-2,0 18px 50px #264c3020);cursor:pointer}
.calc-fab svg{width:20px;height:20px}
.calc-fab[hidden]{display:none}
.calc-win{position:fixed;z-index:61;width:min(340px,calc(100vw - 24px));background:var(--surface,#fff);color:var(--ink,#182a24);border:1px solid var(--line,#dfe7df);border-radius:var(--radius,18px);box-shadow:var(--shadow-2,0 18px 50px #264c3020);font:15px var(--font,sans-serif);touch-action:none;user-select:none}
.calc-win[hidden]{display:none}
.calc-head{display:flex;align-items:center;gap:8px;padding:8px 8px 6px 14px;cursor:grab;border-bottom:1px solid var(--line,#dfe7df)}
.calc-head b{flex:1;font-size:14px}
.calc-head small{color:var(--ink-2,#65736c);font-size:12px}
.calc-x{width:36px;height:36px;border:0;border-radius:10px;background:transparent;font-size:20px;color:var(--ink-2,#65736c);cursor:pointer}
.calc-tabs{display:flex;gap:4px;padding:8px 10px 0}
.calc-tabs button{flex:1;min-height:36px;border:1px solid var(--line,#dfe7df);border-radius:10px;background:var(--surface-2,#f5f7f3);font:600 14px var(--font,sans-serif);color:var(--ink-2,#65736c);cursor:pointer}
.calc-tabs button[aria-selected=true]{background:var(--room-class,#4273a4);border-color:var(--room-class,#4273a4);color:#fff}
.calc-body{padding:10px}
.calc-in{width:100%;box-sizing:border-box;min-height:44px;padding:8px 10px;border:1px solid var(--line,#dfe7df);border-radius:10px;font:500 18px ui-monospace,Consolas,monospace;text-align:right;background:var(--surface-2,#f5f7f3);color:var(--ink,#182a24);user-select:text}
.calc-out{min-height:34px;text-align:right;font:700 22px ui-monospace,Consolas,monospace;padding:4px 4px 6px;overflow-wrap:anywhere}
.calc-out.err{font:500 13px var(--font,sans-serif);color:#b3261e}
.calc-keys{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.calc-keys button{min-height:44px;border:1px solid var(--line,#dfe7df);border-radius:10px;background:var(--surface,#fff);font:600 16px var(--font,sans-serif);color:var(--ink,#182a24);cursor:pointer}
.calc-keys button.fn{background:var(--surface-2,#f5f7f3);font-size:14px}
.calc-keys button.op{color:var(--room-class,#4273a4)}
.calc-keys button.eq{grid-column:1/-1;background:var(--room-class,#4273a4);color:#fff;border-color:var(--room-class,#4273a4)}
.calc-keys button:active{transform:translateY(1px)}
.calc-hist{margin-top:8px;max-height:96px;overflow:auto;font:13px ui-monospace,Consolas,monospace;color:var(--ink-2,#65736c)}
.calc-hist div{padding:3px 4px;border-radius:6px;cursor:pointer;text-align:right}
.calc-hist div:hover{background:var(--surface-2,#f5f7f3)}
.calc-eqn-n{display:flex;gap:6px;margin-bottom:8px}
.calc-eqn-n button{flex:1;min-height:36px;border:1px solid var(--line,#dfe7df);border-radius:10px;background:var(--surface,#fff);font:600 14px var(--font,sans-serif);cursor:pointer}
.calc-eqn-n button[aria-pressed=true]{border-color:var(--room-class,#4273a4);color:var(--room-class,#4273a4)}
.calc-grid{display:grid;gap:5px;align-items:center}
.calc-grid input{width:100%;box-sizing:border-box;min-height:40px;padding:4px 6px;border:1px solid var(--line,#dfe7df);border-radius:8px;font:500 15px ui-monospace,Consolas,monospace;text-align:right;user-select:text}
.calc-grid span{font:600 13px var(--font,sans-serif);color:var(--ink-2,#65736c);text-align:center}
.calc-solve{width:100%;min-height:44px;margin-top:8px;border:0;border-radius:10px;background:var(--room-class,#4273a4);color:#fff;font:700 15px var(--font,sans-serif);cursor:pointer}
.calc-sol{margin-top:8px;font:600 16px ui-monospace,Consolas,monospace}
.calc-sol .err{font:500 13px var(--font,sans-serif);color:#b3261e}
.calc-note{margin-top:6px;font-size:12px;color:var(--ink-3,#85938b)}
`;
const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2.5"/><rect x="8" y="6" width="8" height="3" rx="0.8"/><path d="M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01"/></svg>';
const KEYS = [
  ["sin", "fn", "sin("], ["cos", "fn", "cos("], ["tan", "fn", "tan("], ["√", "fn", "√("], ["x²", "fn", "^2"],
  ["sin⁻¹", "fn", "sin⁻¹("], ["cos⁻¹", "fn", "cos⁻¹("], ["tan⁻¹", "fn", "tan⁻¹("], ["^", "fn", "^"], ["π", "fn", "π"],
  ["7", "", "7"], ["8", "", "8"], ["9", "", "9"], ["(", "op", "("], [")", "op", ")"],
  ["4", "", "4"], ["5", "", "5"], ["6", "", "6"], ["×", "op", "×"], ["÷", "op", "÷"],
  ["1", "", "1"], ["2", "", "2"], ["3", "", "3"], ["+", "op", "+"], ["−", "op", "−"],
  ["0", "", "0"], [".", "", "."], ["Ans", "fn", "Ans"], ["⌫", "fn", "BS"], ["AC", "fn", "AC"],
  ["=", "eq", "="],
];

function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

function mount() {
  if (document.querySelector(".calc-win")) return;
  const style = el("style"); style.textContent = CSS; document.head.append(style);
  const fab = el("button", "calc-fab", ICON + "<span>계산기</span>");
  fab.type = "button"; fab.hidden = true; fab.setAttribute("aria-label", "계산기 열기");
  const win = el("section", "calc-win"); win.hidden = true; win.setAttribute("role", "dialog"); win.setAttribute("aria-label", "계산기");
  win.innerHTML = `<div class="calc-head"><b>계산기</b><small>각도 DEG</small><button type="button" class="calc-x" aria-label="닫기">×</button></div>
  <div class="calc-tabs" role="tablist"><button type="button" role="tab" data-tab="basic" aria-selected="true">계산</button><button type="button" role="tab" data-tab="eqn" aria-selected="false">연립방정식</button></div>
  <div class="calc-body" data-pane="basic"><input class="calc-in" aria-label="식" autocomplete="off" spellcheck="false"><div class="calc-out" aria-live="polite"></div><div class="calc-keys"></div><div class="calc-hist"></div><div class="calc-note">함수는 괄호로: sin(30)^2. 각도는 도(°).</div></div>
  <div class="calc-body" data-pane="eqn" hidden><div class="calc-eqn-n"><button type="button" data-n="2" aria-pressed="true">미지수 2개</button><button type="button" data-n="3" aria-pressed="false">미지수 3개</button></div><div class="calc-grid"></div><button type="button" class="calc-solve">풀기</button><div class="calc-sol" aria-live="polite"></div><div class="calc-note">칸마다 숫자나 식(0.8, -3/5, sin(60), 5/√41). 빈 칸 없이 0도 직접 입력.</div></div>`;
  document.body.append(fab, win);

  const inp = win.querySelector(".calc-in"), out = win.querySelector(".calc-out"), hist = win.querySelector(".calc-hist");
  if (matchMedia("(pointer:coarse)").matches) inp.setAttribute("inputmode", "none"); // 아이패드: 화면 키보드 대신 계산기 자판
  let ans = 0, history = [];
  const show = (txt, err) => { out.textContent = txt; out.classList.toggle("err", !!err); };
  function calc() {
    const src = inp.value.trim(); if (!src) return;
    try {
      const v = evaluate(src, ans); ans = v; show("= " + fmt(v));
      history.unshift({ src, v }); history = history.slice(0, 6);
      hist.innerHTML = ""; for (const h of history) { const d = el("div"); d.textContent = `${h.src} = ${fmt(h.v)}`; d.onclick = () => { inp.value = fmt(h.v); inp.focus(); }; hist.append(d); }
    } catch (e) { show(e.message, true); }
  }
  function insert(s) {
    const a = inp.selectionStart ?? inp.value.length, b = inp.selectionEnd ?? inp.value.length;
    inp.value = inp.value.slice(0, a) + s + inp.value.slice(b);
    const pos = a + s.length; inp.setSelectionRange?.(pos, pos);
  }
  const keys = win.querySelector(".calc-keys");
  for (const [label, cls, val] of KEYS) {
    const k = el("button", cls); k.type = "button"; k.textContent = label;
    k.onclick = () => {
      if (val === "=") return calc();
      if (val === "AC") { inp.value = ""; show(""); return; }
      if (val === "BS") { const a = inp.selectionStart ?? inp.value.length; if (a > 0) { inp.value = inp.value.slice(0, a - 1) + inp.value.slice(a); inp.setSelectionRange?.(a - 1, a - 1); } return; }
      insert(val);
    };
    keys.append(k);
  }
  inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); calc(); } });

  // 연립방정식
  const grid = win.querySelector(".calc-grid"), sol = win.querySelector(".calc-sol");
  const VARS = ["x", "y", "z"];
  let n = 2;
  function buildGrid() {
    grid.innerHTML = ""; grid.style.gridTemplateColumns = `repeat(${n},1fr) 14px 1fr`;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) { const c = el("input"); c.dataset.r = i; c.dataset.c = j; c.placeholder = `${VARS[j]} 계수`; c.setAttribute("aria-label", `${i + 1}번째 식 ${VARS[j]} 계수`); grid.append(c); }
      grid.append(el("span", null, "="));
      const r = el("input"); r.dataset.r = i; r.dataset.c = "b"; r.placeholder = "우변"; r.setAttribute("aria-label", `${i + 1}번째 식 우변`); grid.append(r);
    }
    sol.textContent = "";
  }
  win.querySelectorAll(".calc-eqn-n button").forEach(b => b.onclick = () => {
    n = +b.dataset.n; win.querySelectorAll(".calc-eqn-n button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); buildGrid();
  });
  win.querySelector(".calc-solve").onclick = () => {
    try {
      const A = [...Array(n)].map(() => Array(n).fill(0)), bv = Array(n).fill(0);
      for (const c of grid.querySelectorAll("input")) {
        const src = c.value.trim();
        if (!src) throw new Error("모든 계수와 우변을 채우세요. 0도 직접 입력합니다.");
        const v = evaluate(src, ans);
        if (c.dataset.c === "b") bv[+c.dataset.r] = v; else A[+c.dataset.r][+c.dataset.c] = v;
      }
      const x = solve(A, bv);
      if (!x) { sol.innerHTML = '<div class="err">해가 하나로 정해지지 않습니다(식끼리 겹치거나 모순). 계수를 다시 확인하세요.</div>'; return; }
      sol.innerHTML = x.map((v, i) => `${VARS[i]} = ${fmt(v)}`).join("<br>");
      ans = x[0];
    } catch (e) { sol.innerHTML = `<div class="err">${e.message}</div>`; }
  };
  buildGrid();

  // 탭
  win.querySelectorAll(".calc-tabs button").forEach(t => t.onclick = () => {
    win.querySelectorAll(".calc-tabs button").forEach(x => x.setAttribute("aria-selected", String(x === t)));
    win.querySelectorAll(".calc-body").forEach(p => p.hidden = p.dataset.pane !== t.dataset.tab);
  });

  // 열고 닫기 · 끌어서 옮기기 (문제를 가리면 옮긴다. 바깥을 눌러도 닫히지 않는다 — 풀이와 번갈아 쓰는 도구라서)
  let placed = false;
  function open() {
    win.hidden = false;
    if (!placed) { const w = win.offsetWidth, h = win.offsetHeight; win.style.left = Math.max(12, innerWidth - w - 18) + "px"; win.style.top = Math.max(12, innerHeight - h - 150) + "px"; placed = true; }
    clamp(); if (!matchMedia("(pointer:coarse)").matches && !win.querySelector('[data-pane="basic"]').hidden) inp.focus();
  }
  function close() { win.hidden = true; fab.focus?.(); }
  function clamp() { const r = win.getBoundingClientRect(); win.style.left = Math.min(Math.max(8, r.left), innerWidth - r.width - 8) + "px"; win.style.top = Math.min(Math.max(8, r.top), innerHeight - 60) + "px"; }
  fab.onclick = () => (win.hidden ? open() : close());
  win.querySelector(".calc-x").onclick = close;
  win.addEventListener("keydown", e => { if (e.key === "Escape") { e.stopPropagation(); close(); } }); // 계산기 안에서만 — 다른 모달의 Esc 와 겹치지 않게
  addEventListener("resize", () => { if (!win.hidden) clamp(); });
  const head = win.querySelector(".calc-head");
  head.addEventListener("pointerdown", e => {
    if (e.target.closest("button")) return;
    const r = win.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
    head.setPointerCapture(e.pointerId); head.style.cursor = "grabbing";
    const move = ev => { win.style.left = ev.clientX - dx + "px"; win.style.top = ev.clientY - dy + "px"; };
    const up = () => { head.removeEventListener("pointermove", move); head.style.cursor = ""; clamp(); };
    head.addEventListener("pointermove", move); head.addEventListener("pointerup", up, { once: true });
  });

  // 문제 푸는 화면에서만 버튼을 보인다: 교실 수업, 공부하기(교실 방)·과제실
  const school = document.querySelector(".school");
  function sync() {
    const m = school?.dataset.mode, room = school?.dataset.room;
    const on = m === "classroom" || (m === "workspace" && (room === "class" || room === "homework"));
    fab.hidden = !on; if (!on && !win.hidden) close();
  }
  if (school) new MutationObserver(sync).observe(school, { attributes: true, attributeFilter: ["data-mode", "data-room"] });
  sync();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
}
