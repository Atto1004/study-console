// 강의실 배치 A 검사(room-wide.js, 오타 검수 10/9): 사이트 보기 — 칠판 3:1·스앵님 칠판 오른쪽 안·대사창 칠판 아래·
// 💬 서랍 열기/바깥 누르면 닫힘/Esc 닫힘 + 초점 💬 로/Q 로 열림 · 게임 보기 — 💬 없음·기존 대화 기록 보임·배치 그대로
const { chromium } = require('C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/.test-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const fail = []; const expect = (ok, m) => { if (!ok) fail.push(m); };
  const open = async (view, W = 1194, H = 834) => {
    const p = await b.newPage({ viewport: { width: W, height: H } });
    const errors = []; p.on('pageerror', (e) => errors.push(e.message)); p.errors = errors;
    await fetch('http://127.0.0.1:8797/api/_reset', { method: 'POST' });
    await p.addInitScript((v) => { localStorage.setItem('school-setup', 'solo'); localStorage.setItem('school-view', v); }, view);
    await p.goto('http://127.0.0.1:8797/school/index.html?lesson=statics-2026-09-14');
    await p.waitForFunction(() => document.querySelector('.school').dataset.mode === 'classroom', null, { timeout: 20000 });
    await p.waitForTimeout(view === 'game' ? 5000 : 900);
    return p;
  };
  // ── 사이트 보기
  const p = await open('site');
  const g = await p.evaluate(() => { const r = (s) => document.querySelector(s)?.getBoundingClientRect(); const bd = r('#board'), t = r('.v3-stage .teacher'), vn = r('.vn-box');
    return { ratio: bd.width / bd.height, teacherIn: t.left >= bd.left && t.right <= bd.right && t.left > bd.left + bd.width / 2, vnBelow: vn.top >= bd.bottom, logShown: getComputedStyle(document.getElementById('chatLog')).display !== 'none' }; });
  expect(Math.abs(g.ratio - 3) < 0.15, '칠판 비율 3:1 아님 ' + g.ratio.toFixed(2));
  expect(g.teacherIn, '스앵님이 칠판 오른쪽 안에 없음');
  expect(g.vnBelow, '대사창이 칠판 아래가 아님');
  expect(!g.logShown, '서랍이 처음부터 열려 있음');
  const isOpen = () => p.evaluate(() => document.querySelector('.school').dataset.log === 'open' && getComputedStyle(document.getElementById('chatLog')).display !== 'none' && document.getElementById('chatLog').getBoundingClientRect().height > 40);
  await p.click('.rw-log'); await p.waitForTimeout(200);
  expect(await isOpen(), '💬 로 서랍 안 열림');
  await p.mouse.click(400, 120); await p.waitForTimeout(200);   // 칠판(바깥)
  expect(!(await isOpen()), '바깥 눌러도 안 닫힘');
  await p.click('.rw-log'); await p.waitForTimeout(200); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  expect(!(await isOpen()), 'Esc 로 안 닫힘');
  expect(await p.evaluate(() => document.activeElement?.classList.contains('rw-log')), 'Esc 뒤 초점이 💬 로 안 돌아옴');
  await p.evaluate(() => document.activeElement?.blur()); await p.keyboard.press('KeyQ'); await p.waitForTimeout(250);
  expect(await isOpen() && await p.evaluate(() => document.activeElement?.id === 'chatInput'), 'Q 로 서랍·입력 칸 안 열림');
  expect(!p.errors.length, '사이트 오류 ' + p.errors.join('|'));
  await p.close();
  // ── 게임 보기: 기존 대화창·버튼 그대로
  const q = await open('game');
  const gg = await q.evaluate(() => ({ btn: (() => { const e = document.querySelector('.rw-log'); return e ? getComputedStyle(e).display : 'none'; })(),
    log: getComputedStyle(document.getElementById('chatLog')).display, chat: getComputedStyle(document.querySelector('.v3-chat')).display, dlgOverflow: getComputedStyle(document.getElementById('dialogue')).overflow }));
  expect(gg.btn === 'none', '게임 보기에 💬 버튼이 보임');
  expect(gg.log !== 'none' && gg.chat !== 'none', '게임 보기 대화 기록·입력이 숨겨짐 ' + JSON.stringify(gg));
  await q.evaluate(() => document.activeElement?.blur()); await q.keyboard.press('KeyQ'); await q.waitForTimeout(250);
  expect(await q.evaluate(() => !document.querySelector('.school').dataset.log && document.activeElement?.id === 'chatInput'), '게임 보기 Q 가 서랍을 열거나 입력 칸으로 안 감');
  expect(!q.errors.length, '게임 오류 ' + q.errors.join('|'));
  await q.close(); await b.close();
  console.log(fail.length ? 'FAIL ' + JSON.stringify(fail) : 'room wide: 칠판 3:1·스앵님·대사창·서랍(💬·바깥·Esc 초점·Q)·게임 보기 그대로 ok');
  process.exit(fail.length ? 1 : 0);
})();
