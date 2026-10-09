// ≡ 목록 안 확인·메일함·결재함·연동 검사(대표님 10/9) — 모의 서버(8797):
//  ① ≡ 에 빨간 점(확인 2 + 결재 1) · 목록 맨 위 네 항목 ② 확인: 질문 2개·급한 것 먼저 → 「맞아요」 → 공부 기록 asks.q1 저장, 답한 칸으로
//  ③ 메일함: 메일 제목·공고 ④ 결재함: 승인 → 확인 창 → decide {id, approved} → 목록에서 빠짐 ⑤ 연동: 끊김(클로바)·연결(LMS)·캘린더·토큰 ⑥ 바깥 누르면 닫힘
const { chromium } = require('C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/.test-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  const fail = []; const expect = (ok, m) => { if (!ok) fail.push(m); };
  let saved = { v60: {} };
  await p.route('**/api/study/state', async (r) => { if (r.request().method() === 'POST') { saved = JSON.parse(r.request().postData()).state; return r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); } return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ state: saved }) }); });
  p.on('dialog', (d) => d.accept());
  await fetch('http://127.0.0.1:8797/api/_reset', { method: 'POST' });
  await p.goto('http://127.0.0.1:8797/school/index.html'); await p.waitForSelector('.pl-schedule', { timeout: 15000 }); await p.waitForTimeout(1200);
  // ①
  expect(await p.evaluate(() => !document.querySelector('.gl-menu .gl-dot').hidden && /확인할 것 3/.test(document.querySelector('.gl-menu').getAttribute('aria-label'))), '≡ 빨간 점·숫자 없음');
  await p.click('.gl-menu'); await p.waitForTimeout(200);
  const items = await p.evaluate(() => [...document.querySelectorAll('.gl-pop button')].slice(0, 4).map((x) => x.textContent));
  expect(JSON.stringify(items) === JSON.stringify(['확인 · 2', '메일함', '결재함 · 1', '연동 상태']), '목록 네 항목 ' + JSON.stringify(items));
  // ②
  await p.click('.gl-pop button:has-text("확인")'); await p.waitForTimeout(700);
  const asks = await p.evaluate(() => [...document.querySelectorAll('.ib-body .ib-card b')].map((x) => x.textContent));
  expect(asks.length === 2 && /판서/.test(asks[0]) && await p.evaluate(() => document.querySelector('.ib-body .ib-card').classList.contains('urgent')), '확인 질문 ' + JSON.stringify(asks));
  await p.click('.ib-body .ib-card >> nth=0 >> button:has-text("맞아요")'); await p.waitForTimeout(800);
  expect(saved.asks?.q1?.a === '맞아요' && await p.evaluate(() => /답: 맞아요/.test(document.querySelector('.ib-body').textContent)), '답 저장 ' + JSON.stringify(saved.asks));
  // ③
  await p.click('.ib-tab[data-tab="mail"]'); await p.waitForTimeout(700);
  expect(await p.evaluate(() => /HW Ch\.5 제출 안내/.test(document.querySelector('.ib-body').textContent) && /모의 공고/.test(document.querySelector('.ib-body').textContent)), '메일함 내용 없음');
  // ④
  await p.click('.ib-tab[data-tab="appr"]'); await p.waitForTimeout(700);
  await p.click('.ib-body button:has-text("승인")'); await p.waitForTimeout(900);
  const dec = await (await fetch('http://127.0.0.1:8797/api/_decided')).json();
  expect(dec?.id === 7 && dec?.decision === 'approved' && await p.evaluate(() => /결재할 것이 없어요/.test(document.querySelector('.ib-body').textContent)), '결재 승인 ' + JSON.stringify(dec));
  // ⑤
  await p.click('.ib-tab[data-tab="link"]'); await p.waitForTimeout(1200);
  const link = await p.evaluate(() => document.querySelector('.ib-st').textContent);
  expect(/끊김클로바노트/.test(link) && /연결한양 LMS/.test(link) && /구글 캘린더/.test(link) && /토큰 · 아톰/.test(link), '연동 상태 ' + link);
  await p.screenshot({ path: 'C:/Users/user/.claude/jobs/a132f963/tmp/inbox-link.png' });
  // ⑥
  await p.mouse.click(200, 400); await p.waitForTimeout(200);
  expect(await p.evaluate(() => document.querySelector('.ib-panel').hidden), '바깥 눌러도 안 닫힘');
  expect(!errors.length, '오류 ' + errors.join(' | '));
  console.log(fail.length ? 'FAIL ' + JSON.stringify(fail) : 'inbox: ≡ 빨간 점·네 항목·확인 답 저장·메일함·결재 승인·연동 상태·바깥 닫힘 ok');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
