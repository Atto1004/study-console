// 강의 대사창(대표님 10/9 「넷플릭스형 자막 말고 쯔꾸르 연애시뮬레이션 자막」): 무대 아래 이름표 달린 대사창,
// 글자가 한 자씩 써지고 다 써지면 ▼ 가 깜빡인다. 창을 누르면 — 쓰는 중이면 한 줄 다 보이기, 다 썼으면 다음 대사(onNext = ⏭ 와 같음).
// 기존 자막(#subtitle)은 그대로 갱신해 두고(검사·접근성용) 화면에서는 이 창이 대신 보인다.
const CSS = `
.school[data-vn] .v3-subtitle{display:none!important}
.school[data-vn][data-view3=site] .v3-stage .teaching-space{padding-bottom:112px!important}
.vn-box{position:absolute;z-index:7;left:14px;right:14px;bottom:12px;min-height:84px;padding:18px 48px 14px 20px;box-sizing:border-box;
  border-radius:12px;background:linear-gradient(180deg,#16291fef,#0c1914f4);border:2px solid #eadfbd;color:#fbf8ef;cursor:pointer;
  box-shadow:inset 0 0 0 3px #16291f,inset 0 0 0 4px #eadfbd55,0 12px 28px #00000059;
  font:500 17px/1.65 "Pretendard Variable",Pretendard,system-ui,sans-serif;letter-spacing:-.005em;-webkit-tap-highlight-color:transparent;user-select:none}
.vn-box[hidden]{display:none}
.vn-box:focus-visible{outline:3px solid #f2c94c;outline-offset:3px}
.vn-name{position:absolute;top:-15px;left:16px;padding:3px 14px 4px;border-radius:8px;background:#eadfbd;color:#16291f;border:2px solid #16291f;
  font:700 14px/1.4 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.vn-text{white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere;min-height:1.65em}
.vn-next{position:absolute;right:18px;bottom:12px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:10px solid #f2c94c;opacity:0}
.vn-box[data-done] .vn-next{opacity:1;animation:vn-bob .9s ease-in-out infinite}
@keyframes vn-bob{50%{transform:translateY(4px)}}
@media (prefers-reduced-motion:reduce){.vn-box[data-done] .vn-next{animation:none}}
.school[data-view3=site] .vn-box{right:196px}
@media (max-width:600px){.school[data-vn][data-view3=site] .v3-stage .teaching-space{padding-bottom:100px!important}.vn-box{left:8px!important;right:8px!important;bottom:8px;min-height:78px;padding:16px 40px 12px 14px;font-size:15px}.vn-name{font-size:13px;top:-14px;left:12px}}
`;

export function createDialog(stage, { name = '김주영 스앵님', onNext } = {}) {
  if (!document.getElementById('vn-dialog-css')) { const s = document.createElement('style'); s.id = 'vn-dialog-css'; s.textContent = CSS; document.head.append(s); }
  const box = document.createElement('div'); box.className = 'vn-box'; box.hidden = true; box.tabIndex = 0; box.setAttribute('role', 'button'); box.setAttribute('aria-label', '대사 넘기기');
  const tag = document.createElement('div'); tag.className = 'vn-name'; tag.textContent = name;
  const text = document.createElement('div'); text.className = 'vn-text'; text.setAttribute('aria-live', 'polite');
  const next = document.createElement('span'); next.className = 'vn-next'; next.setAttribute('aria-hidden', 'true');
  box.append(tag, text, next); stage.append(box);
  document.querySelector('.school')?.setAttribute('data-vn', '1');
  const reduced = !!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  let full = '', shown = 0, timer = null;
  const finish = () => { clearTimeout(timer); timer = null; shown = full.length; text.textContent = full; box.dataset.done = ''; };
  const tick = () => {
    shown = Math.min(full.length, shown + 1); text.textContent = full.slice(0, shown);
    if (shown >= full.length) { finish(); return; }
    timer = setTimeout(tick, /[,.!?。…]/.test(full[shown - 1]) ? 140 : 32);
  };
  const press = (e) => { e.stopPropagation(); if (timer) finish(); else onNext?.(); };
  box.addEventListener('click', press);
  box.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); press(e); } });
  return {
    say(line) {
      clearTimeout(timer); timer = null; delete box.dataset.done;
      if (!line) { box.hidden = true; full = ''; text.textContent = ''; return; }
      box.hidden = false; full = String(line); shown = 0; text.textContent = '';
      if (reduced) finish(); else tick();
    },
    setName(n) { tag.textContent = n; },
    get el() { return box; },
  };
}
