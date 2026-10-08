// 복도 문 숫자(진도·정답·이해·하루 N회차) 넘침 · 과제실 마감순 확인 — 1040·390
const { chromium } = require(require('path').join(__dirname,'../../.test-tools/node_modules/playwright'));
const OUT = require('os').tmpdir() + '/';
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true }); const fail = [];
  for (const vp of [{ width: 1040, height: 918 }, { width: 390, height: 844 }]) {
    const p = await b.newPage({ viewport: vp }); const errors = []; p.on('pageerror', (e) => errors.push(e.message));
    // 과제 종류 섞임(오타 검수 재현: quiz 10/20 → exam 10/15 → quiz 10/10) — 묶음 순위 고정·묶음 안 마감순이어야
    await p.route('**/api/school/assignments*', async (route) => { const res = await route.fetch(); const j = await res.json(); const mk = (cat, due, t) => ({ id: 'x-' + t, course: '정역학', title: t, due, category: cat, submitted: false, workDone: false, submission: '미제출', files: [] }); j.rows = [...(j.rows || []), mk('quiz', '2026-10-20T23:59', 'Q-1020'), mk('exam', '2026-10-15T23:59', 'E-1015'), mk('quiz', '2026-10-10T23:59', 'Q-1010')]; await route.fulfill({ response: res, json: j }); });
    await p.addInitScript(() => { localStorage.setItem('school-setup', 'solo'); localStorage.setItem('school-view', 'site'); });
    await p.goto('http://127.0.0.1:8797/school/index.html'); await p.waitForSelector('.corridor-door', { timeout: 20000 }); await p.waitForTimeout(800);
    const doors = await p.evaluate(() => [...document.querySelectorAll('.corridor-door')].map((d) => { const n = d.querySelector('.door-nums'); return { text: n.textContent, over: n.scrollWidth > n.clientWidth + 1 || [...n.children].some((c) => c.getBoundingClientRect().right > d.getBoundingClientRect().right + 1) }; }));
    await p.screenshot({ path: OUT + `lobby-${vp.width}.png` });
    if (doors.some((d) => d.over)) fail.push(vp.width + ': 문 숫자 넘침 ' + JSON.stringify(doors.filter((d) => d.over)));
    if (!doors.some((d) => /정답/.test(d.text))) fail.push(vp.width + ': 정답률 표시 없음');
    await p.evaluate(() => document.getElementById('assignmentArea')?.click()); await p.waitForTimeout(1500);
    const dues = await p.evaluate(() => [...document.querySelectorAll('.assignment-card')].map((c) => (c.textContent.match(/마감 (\d{4}-\d{2}-\d{2}[ T]?\d{0,2}:?\d{0,2})/) || [])[1] || '미확인'));
    const titles = await p.evaluate(() => [...document.querySelectorAll('.assignment-card h2')].map((h) => h.textContent));
    const extra = titles.filter((t) => /^[QE]-/.test(t));
    if (extra.join(',') !== 'Q-1010,Q-1020,E-1015') fail.push(vp.width + ': 종류 섞인 과제 순서 ' + extra.join(','));
    const firstExtra = titles.findIndex((t) => /^[QE]-/.test(t)), base = (firstExtra < 0 ? dues : dues.slice(0, firstExtra)).filter((d) => d !== '미확인');
    if (JSON.stringify(base) !== JSON.stringify([...base].sort())) fail.push(vp.width + ': 수업 과제 마감순 아님 ' + base.join(','));
    await p.screenshot({ path: OUT + `assign-${vp.width}.png` });
    console.log(vp.width, JSON.stringify(doors.map((d) => d.text)), dues.join(' | '), errors);
    if (errors.length) fail.push(vp.width + ': ' + errors[0]);
    await p.close();
  }
  console.log('fail', JSON.stringify(fail)); await b.close(); process.exit(fail.length ? 1 : 0);
})();
