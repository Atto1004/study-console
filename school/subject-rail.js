// 과목 레일(교실 v2 1·3절): 강의실은 하나, 왼쪽 세로 레일에서 과목을 고르면 그 과목 수업으로 바뀐다. 1~5 키.
// 과목 이름은 내용이라 글자(첫 글자)로 두고 색 원에 담는다. 이름은 aria-label·말풍선(data-tip).
const short = (name) => (/^[A-Za-z]/.test(name) ? name.slice(0, 1) : [...name][0]);
export function createSubjectRail({ subjects, current, choose }) {
  const rail = document.createElement('nav'); rail.className = 'subject-rail'; rail.setAttribute('aria-label', '과목 바꾸기');
  const buttons = subjects.map((s, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'subject-chip';
    b.style.setProperty('--c', '#' + (s.color ?? 0x5c6f65).toString(16).padStart(6, '0'));
    b.setAttribute('aria-label', `${s.name} (${i + 1})`); b.dataset.tip = `${s.name} · ${i + 1}`; b.dataset.subject = s.name;
    b.innerHTML = `<span aria-hidden="true"></span><kbd aria-hidden="true">${i + 1}</kbd>`; b.querySelector('span').textContent = short(s.name);
    b.onclick = () => { if (b.getAttribute('aria-current') !== 'true') choose(s.name); };
    rail.append(b); return b;
  });
  function update() { const now = current(); for (const b of buttons) b.setAttribute('aria-current', String(b.dataset.subject === now)); }
  document.querySelector('.school')?.append(rail);
  window.addEventListener('keydown', (e) => {
    const sc = document.querySelector('.school');
    if (sc.dataset.mode !== 'classroom' || sc.dataset.world === 'walking' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable) return;
    if (document.getElementById('panel')?.open || [...document.querySelectorAll('.setup-sheet,.map-sheet')].some((x) => !x.hidden)) return;
    const n = Number(e.key); if (n >= 1 && n <= subjects.length) { e.preventDefault(); buttons[n - 1].click(); }
  });
  update();
  return { update, el: rail };
}
