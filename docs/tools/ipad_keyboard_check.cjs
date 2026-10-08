// 아이패드 매직 키보드·트랙패드: 한글 상태 W(ㅈ)·방향키·두 손가락 쓸기로 움직이는지. school_mock_server.cjs 를 8797 에 띄운 뒤 실행
const { webkit, devices } = require(require('path').resolve(__dirname,'../../.test-tools/node_modules/playwright'));
(async () => {
  const browser = await webkit.launch();
  const ctx = await browser.newContext({ ...devices['iPad Pro 11 landscape'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:8797/school/index.html', { waitUntil: 'load' });
  await page.waitForSelector('.corridor-door', { timeout: 20000 });
  await page.tap('.corridor-door.is-target');
  await page.waitForTimeout(4000);
  const shot = () => page.screenshot();
  const key = (type, key, code) => page.evaluate(([type, key, code]) => window.dispatchEvent(new KeyboardEvent(type, { key, code, bubbles: true, cancelable: true })), [type, key, code]);
  const hold = async (k, c) => { await key('keydown', k, c); await page.waitForTimeout(1200); await key('keyup', k, c); await page.waitForTimeout(400); };
  let a = await shot(); await hold('ㅈ', 'KeyW'); let b = await shot(); const hangulW = !a.equals(b);
  a = b; await hold('w', 'KeyW'); b = await shot(); const latinW = !a.equals(b);
  a = b; await hold('ArrowUp', 'ArrowUp'); b = await shot(); const arrow = !a.equals(b);
  // 트랙패드 두 손가락 쓸기(휠)로 시선
  a = b;
  await page.evaluate(() => { const c = document.querySelector('#schoolWorld canvas'); for (let i = 0; i < 10; i++) c.dispatchEvent(new WheelEvent('wheel', { deltaX: 30, deltaY: 0, bubbles: true, cancelable: true, clientX: 500, clientY: 400 })); });
  await page.waitForTimeout(500); b = await shot(); const wheel = !a.equals(b);
  console.log(JSON.stringify({ hangulW, latinW, arrow, wheel, errors }));
  await browser.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
