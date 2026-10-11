const school = document.querySelector('.school');
if (school) {
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
  let layoutTimer;
  const measure = () => {
    if (!matchMedia('(min-width:641px) and (max-width:1366px)').matches) return;
    const viewport = window.visualViewport;
    school.style.setProperty('--tablet-viewport-height', `${viewport?.height || window.innerHeight}px`);
    school.style.setProperty('--tablet-viewport-bottom', `${Math.max(0, window.innerHeight - (viewport ? viewport.height + viewport.offsetTop : window.innerHeight))}px`);
    const headerHeight = school.querySelector('header')?.getBoundingClientRect().height;
    school.dataset.tabletSharedChat = String(!!document.querySelector('[aria-label="김주영 스앵님과 대화"]'));
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
  const seen = new WeakSet();
  const resizeObserver = window.ResizeObserver ? new ResizeObserver(reflow) : null;
  const observePanels = () => {
    for (const panel of [document.getElementById('board'), school.querySelector('header'), document.querySelector('[aria-label="김주영 스앵님과 대화"]')]) {
      if (panel && !seen.has(panel)) {
        seen.add(panel);
        resizeObserver?.observe(panel);
        reflow();
      }
    }
  };
  // Board and shared chat may be mounted after this module.
  new MutationObserver(records => { if (records.some(record => record.addedNodes.length)) observePanels(); }).observe(school, {childList:true,subtree:true});
  observePanels();
  window.addEventListener('resize', measure);
  window.visualViewport?.addEventListener('resize', reflow);
  window.visualViewport?.addEventListener('scroll', measure);
  document.fonts?.ready.then(reflow);
  measure();
}