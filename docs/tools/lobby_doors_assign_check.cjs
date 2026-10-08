// 복도 문 숫자(진도·정답·이해·하루 N회차) 넘침 · 과제실 마감순 확인 — 1040·390
const { chromium } = require(require('path').join(__dirname,'../../.test-tools/node_modules/playwright'));
const OUT = require('os').tmpdir() + '/';
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true }); const fail = [];
  for (const vp of [{ width: 1040, height: 918 }, { width: 390, height: 844 }]) {
    const p = await b.newPage({ viewport: vp }); const errors = []; p.on('pageerror', (e) => errors.push(e.message));
    await p.addInitScript(() => { localStorage.setItem('school-setup', 'solo'); localStorage.setItem('school-view', 'site'); });
    await p.goto('http://127.0.0.1:8797/school/index.html'); await p.waitForSelector('.corridor-door', { timeout: 20000 }); await p.waitForTimeout(800);
    const doors = await p.evaluate(() => [...document.querySelectorAll('.corridor-door')].map((d) => { const n = d.querySelector('.door-nums'); return { text: n.textContent, over: n.scrollWidth > n.clientWidth + 1 || [...n.children].some((c) => c.getBoundingClientRect().right > d.getBoundingClientRect().right + 1) }; }));
    await p.screenshot({ path: OUT + `lobby-${vp.width}.png` });
    if (doors.some((d) => d.over)) fail.push(vp.width + ': 문 숫자 넘침 ' + JSON.stringify(doors.filter((d) => d.over)));
    if (!doors.some((d) => /정답/.test(d.text))) fail.push(vp.width + ': 정답률 표시 없음');
    await p.evaluate(() => document.getElementById('assignmentArea')?.click()); await p.waitForTimeout(1500);
    const dues = await p.evaluate(() => [...document.querySelectorAll('.assignment-card')].map((c) => (c.textContent.match(/마감 (\d{4}-\d{2}-\d{2}[ T]?\d{0,2}:?\d{0,2})/) || [])[1] || '미확인'));
    const dated = dues.filter((d) => d !== '미확인'); const sorted = [...dated].sort();
    if (JSON.stringify(dated) !== JSON.stringify(sorted)) fail.push(vp.width + ': 과제 마감순 아님 ' + dated.join(','));
    await p.screenshot({ path: OUT + `assign-${vp.width}.png` });
    console.log(vp.width, JSON.stringify(doors.map((d) => d.text)), dues.join(' | '), errors);
    if (errors.length) fail.push(vp.width + ': ' + errors[0]);
    await p.close();
  }
  console.log('fail', JSON.stringify(fail)); await b.close(); process.exit(fail.length ? 1 : 0);
})();
