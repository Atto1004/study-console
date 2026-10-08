// 팝업 창·더보기 메뉴가 바깥을 누르면 닫히는지(크롬 마우스·아이패드 터치). school_mock_server.cjs 를 8797 에 띄운 뒤 실행
const { chromium, webkit, devices } = require(require('path').resolve(__dirname,'../../.test-tools/node_modules/playwright'));
async function run(kind) {
  const browser = kind === 'chrome' ? await chromium.launch({ channel: 'chrome', headless: true }) : await webkit.launch();
  const ctx = kind === 'chrome' ? await browser.newContext({ viewport: { width: 1040, height: 918 } }) : await browser.newContext({ ...devices['iPad Pro 11 landscape'] });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const press = (x, y) => kind === 'chrome' ? page.mouse.click(x, y) : page.touchscreen.tap(x, y);
  await page.goto('http://127.0.0.1:8797/school/index.html?room=learning', { waitUntil: 'load' });
  await page.waitForSelector('#consult:not([disabled])');
  await page.click('#consult'); await page.waitForTimeout(600);
  const opened = await page.evaluate(() => document.querySelector('#panel').open);
  const box = await page.locator('#panel').boundingBox();
  await press(box.x + 20, box.y + 20); await page.waitForTimeout(300);
  const insideStill = await page.evaluate(() => document.querySelector('#panel').open);
  await press(8, box.y + box.height / 2); await page.waitForTimeout(300);
  const afterOutside = await page.evaluate(() => document.querySelector('#panel').open);
  await page.click('.secondary-menu summary'); await page.waitForTimeout(200);
  const menuOpen = await page.evaluate(() => document.querySelector('.secondary-menu').open);
  await press(500, 600); await page.waitForTimeout(200);
  const menuAfter = await page.evaluate(() => document.querySelector('.secondary-menu').open);
  await browser.close();
  return { kind, opened, insideStill, afterOutside, menuOpen, menuAfter, errors };
}
function verify(r) {
  const a = require('assert/strict');
  a.equal(r.opened, true, r.kind + ': 창 열림');
  a.equal(r.insideStill, true, r.kind + ': 창 안을 누르면 유지');
  a.equal(r.afterOutside, false, r.kind + ': 바깥을 누르면 닫힘');
  a.equal(r.menuOpen, true, r.kind + ': 더보기 열림');
  a.equal(r.menuAfter, false, r.kind + ': 더보기 바깥 누르면 닫힘');
  a.deepEqual(r.errors, [], r.kind + ': 페이지 오류 없음');
  return r;
}
(async () => { console.log(JSON.stringify(verify(await run('chrome')))); console.log(JSON.stringify(verify(await run('ipad')))); console.log('ok'); })().catch(e => { console.error('FAIL', e.message); process.exit(1); });
