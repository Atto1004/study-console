// 아이패드(WebKit·터치)에서 1인칭 교실이 움직이는지: node docs/tools/school_mock_server.cjs . 8797 & 띄운 뒤 node docs/tools/ipad_touch_check.cjs
const { webkit, devices } = require(require('path').resolve(__dirname,'../../.test-tools/node_modules/playwright'));
(async () => {
  const browser = await webkit.launch();
  const ctx = await browser.newContext({ ...devices['iPad Pro 11 landscape'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:8797/school/index.html', { waitUntil: 'load' });
  await page.waitForSelector('.corridor-door', { timeout: 20000 });
  await page.tap('.hud-walk');
  await page.waitForTimeout(4000);
  const info = await page.evaluate(() => {
    const c = document.querySelector('#schoolWorld canvas'), b = [...document.querySelectorAll('.world-pad button')][0];
    return { world: document.querySelector('.school').dataset.world, canvas: !!c, canvasTouch: c && getComputedStyle(c).touchAction, padTouch: b && getComputedStyle(b).touchAction, padSelect: b && (getComputedStyle(b).webkitUserSelect || getComputedStyle(b).userSelect), webgl: !!c && !!(c.getContext('webgl2') || c.getContext('webgl')) };
  });
  const before = await page.screenshot();
  // 앞으로 버튼을 1.5초 누르고 있기(터치 포인터)
  const box = await page.locator('.world-pad [aria-label="앞으로"]').boundingBox();
  await page.evaluate(({ x, y }) => {
    const b = document.elementFromPoint(x, y);
    b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y }));
  }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
  await page.waitForTimeout(1500);
  await page.evaluate(({ x, y }) => {
    const b = document.elementFromPoint(x, y);
    b.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y }));
  }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
  await page.waitForTimeout(500);
  const after = await page.screenshot({ });
  console.log(JSON.stringify({ info, moved: !before.equals(after), errors }));
  const a = require('assert/strict'); a.equal(info.canvasTouch, 'none'); a.equal(info.padTouch, 'none'); a.equal(info.padSelect, 'none'); a.ok(!before.equals(after), '앞으로 버튼으로 움직인다'); a.deepEqual(errors, []);
  await browser.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
