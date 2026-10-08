// 효율 우선 흐름: 복도 문 → 바로 시험 범위 문제(3D 안 불러옴), 걷기 아이콘 → 1인칭, 앉기 → 3D 수업
const { chromium, webkit, devices } = require(require('path').resolve(__dirname,'../../.test-tools/node_modules/playwright'));
async function run(kind) {
  const browser = kind === 'chrome' ? await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }) : await webkit.launch();
  const ctx = kind === 'chrome' ? await browser.newContext({ viewport: { width: 1040, height: 918 } }) : await browser.newContext({ ...devices['iPad Pro 11 landscape'] });
  const page = await ctx.newPage();
  const errors = [], three = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (/three\.(module|core)\.js/.test(r.url())) three.push(r.url().split('/').pop()); });
  const st = () => page.evaluate(() => ({ world: document.querySelector('.school').dataset.world || null, mode: document.querySelector('.school').dataset.mode, lesson: document.querySelector('#roomLabel')?.textContent || null, mission: document.querySelector('#missionHeader')?.textContent?.slice(0, 40) || null }));
  await page.goto('http://127.0.0.1:8797/school/index.html', { waitUntil: 'load' });
  await page.waitForSelector('.corridor-door');
  const doorLabel = await page.getAttribute('.corridor-door.is-target', 'aria-label');
  const t0 = Date.now();
  await page.locator('.corridor-door.is-target').click();
  await page.waitForFunction(() => document.querySelector('.school').dataset.mode === 'classroom', null, { timeout: 15000 });
  const practiceMs = Date.now() - t0;
  const practiced = await st();
  const threeAfterPractice = three.length;

  await page.click('#mainArea'); await page.waitForSelector('.hud-walk');
  await page.locator('.hud-walk').click(); await page.waitForTimeout(4000);
  const walking = await st();
  await page.getByRole('button', { name: '자리에 앉아 수업 시작' }).click(); await page.waitForTimeout(5000);
  const seated = await st();
  await browser.close();
  return { kind, doorLabel, practiceMs, practiced, threeAfterPractice, walking: walking.world, seated: { world: seated.world, lesson: seated.lesson }, threeTotal: three.length, errors };
}
(async () => { console.log(JSON.stringify(await run('chrome'))); console.log(JSON.stringify(await run('ipad'))); })().catch(e => { console.error('FAIL', e.message); process.exit(1); });
