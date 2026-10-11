// Fit the current board page before deciding whether another page is needed.
const observed = new WeakSet();
export function fitBoard(host) {
  const content = host.querySelector('.content');
  if (!content || !host.clientWidth || !content.clientHeight) return true;
  host.style.setProperty('overflow','hidden','important');
  if (!observed.has(host)) {
    observed.add(host);
    const refresh = () => { if (host.isConnected && !fitBoard(host)) window.dispatchEvent(new Event('resize')); };
    if (globalThis.ResizeObserver) new ResizeObserver(refresh).observe(host);
    globalThis.document?.fonts?.ready.then(refresh);
    globalThis.document?.fonts?.addEventListener('loadingdone',refresh);
  }
  const title = host.querySelector('h1');
  const width = content.clientWidth;
  if (title) title.style.setProperty('font-size', `${Math.max(20, Math.min(34, width / 22))}px`, 'important');
  const formulas = () => {
    for (const display of content.querySelectorAll('.katex-display')) {
      const math = display.querySelector(':scope > .katex');
      if (!math || !math.scrollWidth) continue;
      const scale = Math.min(1, Math.max(1, display.clientWidth - 2) / math.scrollWidth, Math.max(1, content.clientHeight - 8) / (math.offsetHeight + 8));
      math.style.transform = `scale(${scale})`;
      display.style.height = scale < 1 ? `${(math.offsetHeight + 8) * scale}px` : '';
    }
    for (const math of content.querySelectorAll('.katex:not(.katex-display .katex)')) {
      math.style.fontSize = '1.21em';
      if (math.scrollWidth > content.clientWidth) math.style.fontSize = `${1.21 * content.clientWidth / math.scrollWidth}em`;
    }
  };
  const max = Math.max(18, Math.min(32, width / 24));
  const min = +host.dataset.fitMin || 16;   // 판서 칸 한 화면(whole) 은 12px 까지 줄여 한 칸을 다 담는다(10/12 세로 잘림)
  for (let size = max; size >= min; size -= .5) {
    content.style.setProperty('--board-text-size', `${size}px`);
    content.style.setProperty('font-size', `${size}px`, 'important');
    formulas();
    if (content.scrollHeight <= content.clientHeight + 1 && content.scrollWidth <= content.clientWidth + 1 && host.scrollHeight <= host.clientHeight + 1) break;
  }
  return content.scrollHeight <= content.clientHeight + 2 && content.scrollWidth <= content.clientWidth + 2 && host.scrollHeight <= host.clientHeight + 2;
}
