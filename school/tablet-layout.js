const school = document.querySelector('.school');
school.classList.add('tablet-layout');
const toggle = document.createElement('button');
toggle.type = 'button';
toggle.className = 'tablet-toc-toggle';
toggle.textContent = '교재 목차';
toggle.setAttribute('aria-expanded', 'false');
toggle.onclick = () => {
  const open = school.dataset.tabletToc !== 'open';
  school.dataset.tabletToc = open ? 'open' : 'closed';
  toggle.setAttribute('aria-expanded', String(open));
};
school.append(toggle);
// Late fonts and source panels can change the usable board size after boot.
let layoutTimer;
const measure = () => {
  if (!matchMedia('(min-width:641px) and (max-width:1366px)').matches) return;
  const headerHeight = school.querySelector('header')?.getBoundingClientRect().height;
  const chatHeight = document.querySelector('[aria-label="김주영 스앵님과 대화"]')?.getBoundingClientRect().height;
  if (headerHeight) school.style.setProperty('--tablet-top', `${headerHeight}px`);
  if (chatHeight) school.style.setProperty('--tablet-bottom', `${chatHeight}px`);
  const book = document.getElementById('workZone')?.getBoundingClientRect();
  if (book?.height) {
    school.style.setProperty('--tablet-toc-top', `${book.top + 14}px`);
    school.style.setProperty('--tablet-book-middle', `${book.top + book.height / 2 - 24}px`);
  }
};
const reflow = () => {
  if (!matchMedia('(min-width:641px) and (max-width:1366px)').matches) return;
  measure();
  clearTimeout(layoutTimer);
  layoutTimer = setTimeout(() => window.dispatchEvent(new Event('resize')), 180);
};
const board = document.getElementById('board');
if (board && window.ResizeObserver) new ResizeObserver(reflow).observe(board);
if (window.ResizeObserver && school.querySelector('header')) new ResizeObserver(reflow).observe(school.querySelector('header'));
window.addEventListener('resize', measure);
document.fonts?.ready.then(reflow);
