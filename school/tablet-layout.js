import { usesTabletLayout } from "./tablet-device.js?v=262";
const school = document.querySelector('.school');
if (school) {
  const previewParams = new URLSearchParams(location.search);
  const enabled = () => usesTabletLayout({width:window.innerWidth,userAgent:navigator.userAgent,platform:navigator.platform,maxTouchPoints:navigator.maxTouchPoints,preview:previewParams.get('test')==='1' && previewParams.get('tablet')==='1'});
  const fitTextbookMath = () => {
    for (const math of school.querySelectorAll('.lesson-textbook-body .katex-display > .katex')) {
      const display = math.parentElement;
      if (!display.clientWidth || !math.offsetWidth) continue;
      const style = getComputedStyle(display);
      const available = display.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const scale = Math.min(1, Math.max(0, available - 2) / math.scrollWidth);
      const transform = `scale(${scale})`;
      const height = `${math.offsetHeight * scale + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)}px`;
      if (math.style.transform !== transform) math.style.transform = transform;
      if (display.style.height !== height) display.style.height = height;
    }
  };
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
    school.classList.toggle('tablet-layout',enabled());
    if (!enabled()) {
      for (const math of school.querySelectorAll('.lesson-textbook-body .katex-display > .katex')) {
        math.style.transform = '';
        math.parentElement.style.height = '';
      }
      return;
    }
    fitTextbookMath();
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
    school.classList.toggle('tablet-layout',enabled());
    if (!enabled()) {
      for (const math of school.querySelectorAll('.lesson-textbook-body .katex-display > .katex')) {
        math.style.transform = '';
        math.parentElement.style.height = '';
      }
      return;
    }
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
  new MutationObserver(records => { if (records.some(record => record.addedNodes.length)) { observePanels(); if(enabled()) fitTextbookMath(); } }).observe(school, {childList:true,subtree:true});
  observePanels();
  window.addEventListener('resize', measure);
  window.visualViewport?.addEventListener('resize', reflow);
  window.visualViewport?.addEventListener('scroll', measure);
  document.fonts?.ready.then(reflow);
  document.fonts?.addEventListener('loadingdone',reflow);
  measure();
}