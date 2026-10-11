// http://<tailscale IP> 같은 보안 컨텍스트 아닌 주소 흉내(crypto.randomUUID 없음) — 대표님 10/9 「교실이 안 열리는」:
//  교실 탭 → 교실이 열림 · 페이지 오류 없음 · 대체 함수가 v4 형식 ID 를 만듦
const { chromium } = require('C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/.test-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  await p.addInitScript(() => { delete Crypto.prototype.randomUUID; });
  await fetch('http://127.0.0.1:8797/api/_reset', { method: 'POST' });
  await p.goto('http://127.0.0.1:8797/school/index.html'); await p.waitForSelector('.pl-schedule', { timeout: 15000 }); await p.waitForTimeout(600);
  await p.click('#learningArea'); await p.waitForTimeout(2500);
  const r = await p.evaluate(() => ({ mode: document.querySelector('.school').dataset.mode, id: crypto.randomUUID() }));
  const fail = [];
  if (r.mode !== 'classroom') fail.push('교실 안 열림 ' + r.mode);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(r.id)) fail.push('ID 형식 ' + r.id);
  if (errors.length) fail.push('오류 ' + errors.join(' | '));
  console.log(fail.length ? 'FAIL ' + JSON.stringify(fail) : 'insecure origin: randomUUID 없이도 교실 열림·v4 ID ok');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
