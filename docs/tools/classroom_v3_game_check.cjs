// 교실 v3 게임 모드: 수업 열기 → 3D 캔버스가 강의 칸(#stage3d) 안 · 칠판 HTML 이 강의 칸 안 · 자막 --hx/--hy · 사이트로 전환하면 3D 숨김 · 다시 게임
const { chromium } = require('C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/.test-tools/node_modules/playwright');
const OUT = 'C:/Users/user/.claude/jobs/a132f963/tmp/';
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: Number(process.argv[2]) ? { width: Number(process.argv[2]), height: Number(process.argv[3]) } : { width: 1194, height: 834 } });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  const fail = []; const expect = (ok, m) => { if (!ok) fail.push(m); }; const out = {};
  await p.addInitScript(() => { localStorage.setItem('school-setup', 'solo'); localStorage.setItem('school-view', 'game'); });
  await p.goto('http://127.0.0.1:8797/school/index.html?lesson=' + encodeURIComponent('session:CADD:2026-09-08'));
  await p.waitForFunction(() => document.querySelector('.school').dataset.mode === 'classroom', null, { timeout: 15000 });
  await p.waitForTimeout(5000);
  const snap = () => p.evaluate(() => {
    const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const st = document.getElementById('lectureStage'), cv = document.querySelector('canvas.school-world-canvas, #schoolWorld canvas, #stage3d canvas');
    const sub = document.getElementById('subtitle');
    return { world: document.querySelector('.school').dataset.world, surface: document.querySelector('.school').dataset.surface, view3: document.querySelector('.school').dataset.view3,
      stage: R(st), canvas: R(cv), canvasIn: !!cv && st.contains(cv), canvasVis: cv ? getComputedStyle(cv).visibility + '/' + getComputedStyle(cv.parentElement).display : null,
      board: R(document.getElementById('board')), sub: { hx: sub.style.getPropertyValue('--hx'), hy: sub.style.getPropertyValue('--hy'), hidden: sub.hidden }, teacher: getComputedStyle(document.querySelector('.v3-stage .teacher')).display };
  });
  out.game = await snap();
  const s = out.game.stage, bd = out.game.board;
  expect(out.game.world === 'seated', '게임 모드인데 앉지 않음 ' + out.game.world);
  expect(out.game.canvasIn, '3D 캔버스가 강의 칸 밖');
  expect(bd && s && bd[1] >= s[1] - 1 && bd[1] + bd[3] <= s[1] + s[3] + 1 && bd[2] > 100, '칠판이 강의 칸 안에 없음');
  expect(!!out.game.sub.hx, '자막이 머리를 안 따라감');
  expect(out.game.teacher === 'none', '게임 모드에 2D 초상이 남음');
  await p.screenshot({ path: OUT + 'v3-game.png' });
  await p.click('.view-toggle'); await p.waitForTimeout(800); out.site = await snap();
  expect(out.site.view3 === 'site' && out.site.world !== 'seated', '사이트로 바꿨는데 3D 그대로');
  expect(out.site.teacher !== 'none', '사이트에서 2D 초상 없음');
  await p.screenshot({ path: OUT + 'v3-game-to-site.png' });
  await p.click('.view-toggle'); await p.waitForTimeout(4000); out.back = await snap();
  expect(out.back.world === 'seated' && out.back.canvasIn, '다시 게임으로 3D 복귀 안 됨');
  // 착석 중 전환 경쟁(오타 재검수 P2): 사이트 → 게임 → 곧바로 사이트. 늦게 끝난 착석이 3D 를 다시 붙이면 안 된다
  await p.click('.view-toggle'); await p.waitForTimeout(300); await p.click('.view-toggle'); await p.waitForTimeout(30); await p.click('.view-toggle'); await p.waitForTimeout(5000);
  out.race = await snap();
  expect(out.race.view3 === 'site' && !out.race.canvasIn && out.race.world !== 'seated', '착석 중 사이트로 바꿨는데 3D 가 다시 붙음 ' + JSON.stringify(out.race));
  out.errors = errors; out.fail = fail; console.log(JSON.stringify(out)); await b.close(); process.exit(fail.length || errors.length ? 1 : 0);
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
