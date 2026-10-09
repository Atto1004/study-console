// 강의 대사창 검사(대표님 10/9 「쯔꾸르 연애시뮬 자막」): 모의 서버(8797)에서 정역학 9/14 강의안 수업을 열어
//  ① 대사창·이름표가 뜨고 넷플릭스형 자막(#subtitle)은 화면에 안 보임 ② 글자가 한 자씩 써짐 → 다 쓰면 ▼
//  ③ 쓰는 중 누르면 한 줄 다 보임(대사 그대로) ④ 다 쓴 뒤 누르면 다음 대사 ⑤ 칠판 글자를 가리지 않음 ⑥ 가로 스크롤 없음
// 사용: node docs/tools/vn_dialog_check.cjs [w h] [site|game]   (SHOT_DIR 있으면 캡처)
const { chromium } = require('C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/.test-tools/node_modules/playwright');
const [W, H, VIEW] = [+process.argv[2] || 1194, +process.argv[3] || 834, process.argv[4] || 'site'];
const SHOT = process.env.SHOT_DIR;
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  const fail = []; const expect = (ok, m) => { if (!ok) fail.push(m); };
  await fetch('http://127.0.0.1:8797/api/_reset', { method: 'POST' });
  await p.addInitScript((v) => { localStorage.setItem('school-setup', 'solo'); localStorage.setItem('school-view', v); }, VIEW);
  await p.goto('http://127.0.0.1:8797/school/index.html?lesson=statics-2026-09-14');
  await p.waitForFunction(() => document.querySelector('.school').dataset.mode === 'classroom', null, { timeout: 15000 });
  const vn = () => p.evaluate(() => {
    const box = document.querySelector('.vn-box'), sub = document.getElementById('subtitle');
    const r = box?.getBoundingClientRect(), board = document.querySelector('#board .content, #board');
    const texts = [...(document.querySelectorAll('#board .content *') || [])].filter((e) => e.childElementCount === 0 && e.textContent.trim()).map((e) => e.getBoundingClientRect()).filter((t) => t.height && t.width);
    const covered = r ? texts.filter((t) => t.bottom > r.top + 2 && t.top < r.bottom && t.right > r.left && t.left < r.right).length : -1;
    return { shown: !!box && !box.hidden && r.height > 0, name: box?.querySelector('.vn-name')?.textContent, text: box?.querySelector('.vn-text')?.textContent || '', done: box?.hasAttribute('data-done'),
      subVisible: !!sub && getComputedStyle(sub).display !== 'none' && !sub.hidden, sub: sub?.textContent || '', covered, hscroll: document.documentElement.scrollWidth > innerWidth + 1,
      box: r && [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] };
  });
  await p.waitForTimeout(250);
  const typing = await vn();
  expect(typing.shown, '대사창 안 뜸');
  expect(typing.name === '김주영 스앵님', '이름표 ' + typing.name);
  expect(!typing.subVisible, '넷플릭스형 자막이 여전히 보임');
  expect(typing.text.length > 0 && typing.text.length < typing.sub.length && !typing.done, '한 자씩 써지지 않음 ' + typing.text.length + '/' + typing.sub.length);
  await p.click('.vn-box'); await p.waitForTimeout(120);   // 캡처는 느려서 그사이 다 써질 수 있으니 누른 뒤에
  const full = await vn();
  expect(full.done && full.text === full.sub, '누르면 한 줄 다 보이기 안 됨');
  const line1 = full.text;
  await p.waitForTimeout(150); await p.click('.vn-box'); await p.waitForTimeout(400);
  const nextLine = await vn();
  expect(nextLine.sub !== line1, '다 쓴 뒤 눌러도 다음 대사로 안 감');
  for (let i = 0; i < 80 && !(await vn()).done; i++) await p.waitForTimeout(100);
  // ⑦ 키를 누르고 있어도(반복 입력) 한 번만 넘김 · ⑧ 화면 읽기용 칸에는 문장 전체가 한 번에
  const srOk = await p.evaluate(() => { const sr = document.querySelector('.vn-sr'); return !!sr && sr.getAttribute('aria-live') === 'polite' && sr.textContent === document.getElementById('subtitle').textContent && document.querySelector('.vn-text').getAttribute('aria-hidden') === 'true'; });
  expect(srOk, '화면 읽기 칸에 문장 전체가 없음');
  // 강의를 멈춰 두고(저절로 넘어가는 것과 구분) 대사 바뀐 횟수를 센다
  await p.evaluate(() => document.activeElement?.blur());
  await p.keyboard.press('Space'); await p.waitForTimeout(200);
  await p.evaluate(() => { window.__subChanges = 0; new MutationObserver(() => window.__subChanges++).observe(document.getElementById('subtitle'), { childList: true, characterData: true, subtree: true }); });
  await p.focus('.vn-box');
  await p.keyboard.down('Enter'); await p.waitForTimeout(120);   // 쓰는 중이 아니면 다음 대사 1번
  await p.keyboard.down('Enter'); await p.keyboard.down('Enter'); await p.keyboard.down('Enter');   // 누르고 있음(repeat)
  await p.waitForTimeout(300); await p.keyboard.up('Enter');
  const changes = await p.evaluate(() => window.__subChanges);
  expect(changes === 1, 'Enter 를 누르고 있을 때 대사가 ' + changes + '번 넘어감(1번이어야)');
  for (let i = 0; i < 80 && !(await vn()).done; i++) await p.waitForTimeout(100);
  const settled = await vn();
  expect(settled.covered === 0, '칠판 글자를 가림 ' + settled.covered);
  expect(!settled.hscroll, '가로 스크롤 생김');
  if (SHOT) await p.screenshot({ path: `${SHOT}/vn-done-${W}-${VIEW}.png` });
  expect(!errors.length, '페이지 오류 ' + errors.join(' | '));
  console.log(JSON.stringify({ box: settled.box, typing: typing.text.length + '/' + typing.sub.length, covered: settled.covered }));
  console.log(fail.length ? 'FAIL ' + JSON.stringify(fail) : `vn dialog ${W}x${H} ${VIEW}: 이름표·한 자씩·▼·누르면 다 보이기·다음 대사·칠판 안 가림 ok`);
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
