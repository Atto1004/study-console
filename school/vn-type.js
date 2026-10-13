// 대사창 한 글자씩 쓰기 (대표님 10/12 「쯔꾸르·연애 시뮬레이션 자막」) — classroom-v3.js 의 .v3-vn 이 쓴다.
//  · 문장 전체를 먼저 깔아 두고 아직 안 쓴 뒷부분만 투명하게 두어(visibility:hidden) 줄 바꿈이 흔들리지 않는다. 가운데 정렬 글자가 한 글자마다 좌우로 튀지 않는다.
//  · 읽어 주는 도구에는 문장 전체를 한 번만 알린다(.vn-sr). 쓰는 중인 칸은 aria-hidden.
//  · 쓰는 중에 페이지가 다시 나뉘어(p 가 바뀜) 구조가 깨지면 그냥 끝낸 것으로 본다.
const reduced = () => !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

export function typeInto(p, onDone) {
  const full = p.textContent;
  if (!full || reduced()) { onDone?.(); return { finish() {}, get active() { return false; } }; }
  const row = p.parentElement;
  const sr = document.createElement('span'); sr.className = 'vn-sr'; sr.textContent = full; row?.append(sr);
  const seen = document.createElement('span'), rest = document.createElement('span');
  seen.setAttribute('aria-hidden', 'true'); rest.setAttribute('aria-hidden', 'true'); rest.className = 'vn-rest';
  p.textContent = ''; p.append(seen, rest); rest.textContent = full;
  let n = 0, timer = null, over = false;
  const intact = () => p.firstChild === seen && p.lastChild === rest && p.childNodes.length === 2;
  const end = (restore) => { if (over) return; over = true; clearTimeout(timer); timer = null; if (restore && intact()) p.textContent = full; sr.remove(); onDone?.(); };
  const tick = () => {
    if (over) return;
    if (!intact()) { end(false); return; }
    n++; seen.textContent = full.slice(0, n); rest.textContent = full.slice(n);
    if (n >= full.length) { end(true); return; }
    timer = setTimeout(tick, /[,.!?。…]/.test(full[n - 1]) ? 140 : 30);
  };
  tick();
  return { finish() { end(true); }, get active() { return !over; } };
}
