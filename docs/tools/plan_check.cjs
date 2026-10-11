// 공부 계획(plan.js) 검사 — 오늘 할 일 = 과제 · 공부 구분 — 모의 서버(8797), 저장은 /api/study/state POST 를 가로채 본다:
//  ① 과목별 묶음·마감 임박 위 ② 예상 분 고치면 est 저장 ③ ▶ → run(t0) · ⏸ → acc · ■ → act(실제 분)·run 지움
//  ④ 체크 → done · 「오늘 끝낸 것」 · 되돌리기 ⑤ 할 일 넣기 → extra ⑥ 시간표 기본 = 오늘, 자동 배치는 집중 4과목(CADD 없음) ⑦ ‹ › 날짜 이동
const { chromium } = require('C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/.test-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  const fail = []; const expect = (ok, m) => { if (!ok) fail.push(m); };
  let saved = null; let saves = 0;
  await p.route('**/api/study/state', async (r) => {
    if (r.request().method() === 'POST') { saved = JSON.parse(r.request().postData()).state; saves++; return r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"workspaceRevision":1}' }); }
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ state: saved || { terms: [], v60: {} } }) });
  });
  await p.clock.install({ time: new Date('2026-10-07T11:00:00+09:00') });   // 모의 날짜 낮 — 밤에 돌리면 오늘 빈 시간이 없어 자동 배치가 비던 것
  await fetch('http://127.0.0.1:8797/api/_reset', { method: 'POST' });
  await p.goto('http://127.0.0.1:8797/school/index.html'); await p.waitForSelector('.pl-tasks', { timeout: 15000 }); await p.waitForTimeout(600);
  const groups = await p.evaluate(() => [...document.querySelectorAll('.pl-tasks .pl-group')].map((g) => (g.classList.contains('urgent') ? '!' : '') + g.querySelector('.pl-gname b').textContent));
  expect(groups[0] === '!정역학', '마감 임박 묶음이 맨 위가 아님 ' + JSON.stringify(groups));
  expect(await p.evaluate(() => [...document.querySelectorAll('.pl-inclass')].some((x) => /CADD/.test(x.textContent)) && ![...document.querySelectorAll('.pl-gname b')].some((x) => x.textContent === 'CADD')), 'CADD(수업 당일 과제)가 「수업 중에 할 과제」로 안 감');
  expect(await p.evaluate(() => document.querySelector('.pl-tasks h2')?.textContent === '오늘 할 일' && !!document.querySelector('.pl-sub-hw') && !!document.querySelector('.pl-sub-st')), '「오늘 할 일」 아래 과제·공부 구분 없음');
  const row = '.pl-task[data-key="정역학|HW Ch.5"]';
  await p.fill(`${row} input[type=number]`, '90'); await p.press(`${row} input[type=number]`, 'Tab'); await p.waitForTimeout(400);
  expect(saved?.v60?.est?.['정역학|HW Ch.5'] === 90, '예상 분 저장 안 됨');
  await p.click(`${row} button[aria-label="시작"]`); await p.waitForTimeout(1300);
  expect(!!saved?.v60?.run?.['정역학|HW Ch.5']?.t0, '▶ 뒤 run.t0 없음');
  expect(await p.evaluate((sel) => /\d\d:\d\d/.test(document.querySelector(sel + ' .pl-clock')?.textContent || ''), row), '돌아가는 시계 없음');
  await p.click(`${row} button[aria-label="잠깐 멈춤"]`); await p.waitForTimeout(300);
  const r1 = saved?.v60?.run?.['정역학|HW Ch.5']; expect(r1 && !r1.t0 && r1.acc > 0, '⏸ 뒤 acc 없음 ' + JSON.stringify(r1));
  await p.evaluate(() => { /* 실제 분이 0 이 안 되게 누적을 3분으로 */ });
  await p.click(`${row} button[aria-label="이어서"]`); await p.waitForTimeout(300);
  await p.click(`${row} button[aria-label="끝내고 실제 시간 기록"]`); await p.waitForTimeout(300);
  expect(!saved?.v60?.run?.['정역학|HW Ch.5'] && saved?.v60?.act?.['정역학|HW Ch.5'], '■ 뒤 act 없음·run 남음');
  await p.click(`${row} input.pl-check`); await p.waitForTimeout(400);
  expect(saved?.v60?.done?.['정역학|HW Ch.5'], '체크 done 저장 안 됨');
  expect(await p.evaluate(() => [...document.querySelectorAll('.pl-done .pl-title')].some((x) => x.textContent === 'HW Ch.5')), '오늘 끝낸 것에 없음');
  await p.click('.pl-done input.pl-check'); await p.waitForTimeout(400);
  expect(!saved?.v60?.done?.['정역학|HW Ch.5'], '되돌리기 안 됨');
  await p.selectOption('.pl-add select[name=kind]', '공부'); await p.selectOption('.pl-add select[name=c]', '미분적분학2'); await p.fill('.pl-add input[name=t]', '12.3 연습문제 1~5'); await p.fill('.pl-add input[name=est]', '40'); await p.click('.pl-add button'); await p.waitForTimeout(400);
  expect((saved?.v60?.extra || []).some((x) => x.kind === '공부' && x.c === '미분적분학2' && x.t === '12.3 연습문제 1~5' && x.est === 40), '할 일 넣기 저장 안 됨');
  const sched = await p.evaluate(() => ({ head: document.querySelector('.pl-schedule .pl-head small')?.textContent, auto: [...document.querySelectorAll('.pl-blk.k-auto')].map((x) => x.textContent), now: !!document.querySelector('.pl-now') }));
  expect(/오늘/.test(sched.head) && sched.now, '시간표 기본이 오늘이 아님 ' + sched.head);
  expect(sched.auto.length >= 1 && !sched.auto.some((x) => /CADD/.test(x)), '자동 배치 ' + JSON.stringify(sched.auto));
  await p.click('.pl-schedule button[aria-label="다음 날"]'); await p.waitForTimeout(500);
  const next = await p.evaluate(() => ({ head: document.querySelector('.pl-schedule .pl-head small')?.textContent, now: !!document.querySelector('.pl-now') }));
  expect(!/오늘/.test(next.head) && !next.now, '다음 날로 안 넘어감 ' + next.head);
  await p.click('.pl-schedule .pl-today'); await p.waitForTimeout(400);
  expect(/오늘/.test(await p.evaluate(() => document.querySelector('.pl-schedule .pl-head small')?.textContent)), '「오늘」로 안 돌아옴');
  // ⑦-2 + 일정 추가: 날짜·과목·할 일 → 공부 계획 저장 → 하루 시간표에 표시
  await p.click('.pl-schedule button[aria-label="일정 추가"]'); await p.waitForTimeout(300);
  expect(await p.evaluate(() => !!document.querySelector('.pl-pop input[type=date]')), '+ 창에 날짜 칸 없음');
  await p.fill('.pl-pop input[aria-label="할 일"]', '미적 12.4 복습'); await p.fill('.pl-pop input[aria-label="시작"]', '22:00'); await p.click('.pl-pop button[type=submit]'); await p.waitForTimeout(1500);
  expect(await p.evaluate(() => [...document.querySelectorAll('.pl-blk.k-plan')].some((b) => /미적 12\.4 복습/.test(b.textContent))), '+ 로 넣은 일정이 시간표에 없음');
  // ⑧ 위치 기록: 칩 → place 저장·오른쪽 줄 표시
  await p.click('.pl-placebar .pl-chip:has-text("도서관")'); await p.waitForTimeout(400);
  expect((Object.values(saved?.v60?.place || {})[0] || []).some((r) => r.p === '도서관') && await p.evaluate(() => [...document.querySelectorAll('.pl-place')].some((x) => x.textContent === '도서관')), '위치 기록 안 됨');
  // ⑨ 시험까지: 오늘~마지막 시험, 시험 날 표시
  await p.click('.pl-seg button[aria-label="시험까지"]'); await p.waitForTimeout(700);
  const ex = await p.evaluate(() => ({ cols: [...document.querySelectorAll('.pl-wkcol')].map((c) => c.dataset.date), exam: document.querySelectorAll('.pl-blk.k-exam').length }));
  expect(ex.cols[0] && ex.cols.at(-1) === '2026-10-23' && ex.exam >= 4, '시험까지 보기 ' + JSON.stringify({ first: ex.cols[0], last: ex.cols.at(-1), exam: ex.exam }));
  // ⑩ 계획 모드: 빈 칸(토 10/10 15시) → 창 → 넣기 → 시간표에 계획
  await p.click('.pl-mode'); await p.waitForTimeout(400);
  const sat = await p.$('.pl-wkcol[data-date="2026-10-10"]');
  await sat.click({ position: { x: 20, y: 40 * 15 + 5 } }); await p.waitForTimeout(300);
  expect(await p.evaluate(() => !!document.querySelector('.pl-pop')), '계획 모드 창 안 뜸');
  await p.fill('.pl-pop input[aria-label="할 일"]', '정역학 Ch.5 다시 풀기'); await p.click('.pl-pop button[type=submit]'); await p.waitForTimeout(1500);
  expect(await p.evaluate(() => [...document.querySelectorAll('.pl-wkcol[data-date="2026-10-10"] .pl-blk.k-plan')].some((b) => /Ch\.5 다시 풀기/.test(b.textContent))), '넣은 계획이 시간표에 없음');
  await p.evaluate(() => localStorage.removeItem('school-plan-view'));
  expect(!errors.length, '오류 ' + errors.join(' | '));
  console.log(JSON.stringify({ saves, groups, auto: sched.auto }));
  console.log(fail.length ? 'FAIL ' + JSON.stringify(fail) : 'plan: 묶음·임박·예상 분·▶⏸■ 실제 시간·완료·되돌리기·할 일·오늘 시간표·4과목 자동 배치·날짜 이동 ok');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
