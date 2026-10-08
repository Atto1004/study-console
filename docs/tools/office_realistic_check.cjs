// 대표실 후보 미리 보기 + 작업본 office3d.js(사실풍 A안)로 자리 그림 확인 — 쓰기 요청은 가로챔
const fs = require('fs');
const { chromium } = require(require('path').join(__dirname,'../../.test-tools/node_modules/playwright'));
const OUT = 'C:/Users/user/.claude/jobs/a132f963/tmp/';
const token = fs.readFileSync(OUT + 'atom_cookie.txt', 'utf8').trim();
const VER = process.argv[2], W = Number(process.argv[3] || 1040), H = Number(process.argv[4] || 918);
const SRC = fs.readFileSync(require('path').join(__dirname, '../../school/office3d.js'), 'utf8');
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await b.newContext({ viewport: { width: W, height: H } });
  await ctx.addCookies([{ name: 'atom_auth', value: token, domain: '127.0.0.1', path: '/' }]);
  await ctx.route('**/api/**', (r) => (r.request().method() === 'GET' ? r.continue() : r.fulfill({ json: {} })));
  await ctx.route('**/kingdom/study/school/office3d.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: SRC }));
  const p = await ctx.newPage(); const errors = []; const bad = [];
  p.on('pageerror', (e) => errors.push(e.message)); p.on('response', (res) => { if (/office\/v3/.test(res.url()) && res.status() >= 400) bad.push(res.status() + ' ' + res.url()); });
  await p.goto(`http://127.0.0.1:8787/kingdom/release/${VER}/index.html`, { waitUntil: 'load', timeout: 60000 });
  await p.waitForFunction(() => window.__office3d, null, { timeout: 40000 }).catch(() => {});
  await p.waitForTimeout(2500);
  const st = await p.evaluate(() => ({ mode: window.__office3d?.mode || (window.__office3d ? '3d' : 'none'), imgs: [...document.querySelectorAll('.gl-real')].map((i) => ({ src: i.getAttribute('src').split('/').pop(), ok: i.complete && i.naturalWidth > 0, expr: i.dataset.expr || '', box: (() => { const r = i.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; })() })) }));
  await p.screenshot({ path: OUT + `office-real-${W}.png` });
  // 상태 바꿔 보기: 오타 자리에 말풍선, 토토 잠
  await p.evaluate(() => { const o = document.querySelector('.gl-workstation.otta'); let bb = o.querySelector('.gl-bubble'); if (bb) bb.hidden = false; const t = document.querySelector('.gl-workstation.toto'); t.dataset.gaze = 'sleep'; });
  await p.waitForTimeout(1200);
  const st2 = await p.evaluate(() => [...document.querySelectorAll('.gl-real')].map((i) => i.dataset.expr + ':' + i.getAttribute('src').split('/').pop()));
  // 말풍선이 얼굴(그림 위쪽 22%)을 가리는지
  const cover = await p.evaluate(() => [...document.querySelectorAll('.gl-workstation')].map((w) => { const b = w.querySelector('.gl-bubble'), i = w.querySelector('.gl-real'); if (!b || b.hidden || !i || !b.getClientRects().length) return null; const br = b.getBoundingClientRect(), ir = i.getBoundingClientRect(); const faceTop = ir.top + ir.height * 0.0, faceBot = ir.top + ir.height * 0.24; return { who: [...w.classList].join('.'), bubbleBottom: Math.round(br.bottom), faceTop: Math.round(faceTop), faceBot: Math.round(faceBot), covers: br.bottom > faceTop + ir.height * 0.06 && br.top < faceBot }; }).filter(Boolean));
  console.log('cover', JSON.stringify(cover));
  await p.screenshot({ path: OUT + `office-real-${W}-states.png` });
  console.log(JSON.stringify({ st, st2, bad, errors: errors.slice(0, 3) }, null, 1));
  await b.close();
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
