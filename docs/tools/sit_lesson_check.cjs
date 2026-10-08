// 1인칭 교실: 걷기 → 자리에 앉아 수업 시작 → 일어나기 → 나가기 (크롬·아이패드). school_mock_server.cjs 를 8797 에 띄운 뒤 실행
const { chromium, webkit, devices } = require(require('path').resolve(__dirname,'../../.test-tools/node_modules/playwright'));
async function run(kind) {
  const browser = kind === 'chrome' ? await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }) : await webkit.launch();
  const ctx = kind === 'chrome' ? await browser.newContext({ viewport: { width: 1040, height: 918 } }) : await browser.newContext({ ...devices['iPad Pro 11 landscape'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const st = () => page.evaluate(() => ({ world: document.querySelector('.school').dataset.world || null, mode: document.querySelector('.school').dataset.mode, lesson: document.querySelector('#roomLabel')?.textContent || null, padShown: getComputedStyle(document.querySelector('.world-pad')).display !== 'none', hudButtons: [...document.querySelectorAll('.world-hud button')].filter(b => !b.hidden).map(b => b.textContent), walkBtn: !!document.querySelector('#walkSchool') }));
  await page.goto('http://127.0.0.1:8797/school/index.html', { waitUntil: 'load' });
  await page.waitForSelector('.corridor-door');
  if (kind === 'chrome') await page.click('.hud-walk'); else await page.tap('.hud-walk');
  await page.waitForTimeout(3500);
  const walking = await st();
  await page.getByRole('button', { name: '자리에 앉아 수업 시작' }).click();
  await page.waitForTimeout(5000);
  const seated = await st();

  await page.getByRole('button', { name: '자리에서 일어나기' }).click();
  await page.waitForTimeout(3500);
  const stood = await st();
  await page.getByRole('button', { name: '나가기', exact: true }).click();
  await page.waitForTimeout(2500);
  const out = await st();
  await browser.close();
  return { kind, walking, seated: { world: seated.world, mode: seated.mode, lesson: seated.lesson }, stood: { world: stood.world }, out: { world: out.world, mode: out.mode }, errors };
}
(async () => { console.log(JSON.stringify(await run('chrome'))); console.log(JSON.stringify(await run('ipad'))); })().catch(e => { console.error('FAIL', e.message); process.exit(1); });
