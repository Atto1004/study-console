// 시간표 블록·요일 줄·빈칸 추가 검사(대표님 10/9) — 모의 서버(8797), 시계 10/7(수) 11:00:
//  ① 하루 보기 위 월~일 줄: 7칸·오늘 선택, 목(10/8) 누르면 그날 + 그날 수업(과목 시간표), 금(10/9 휴일)은 수업 없음
//  ② 빈칸 누르면 그 시각에 일정 넣기 창
//  ③ 오늘 수업 블록 → 출석(서버 attendance)·이해도·시작/종료(classLog) ④ 내일 수업은 출석 버튼 막힘
//  ⑤ 캘린더 블록 → 시각 바꾸기 → 확인 → 변경 대기열(원본 버전·캘린더 id) → 시간표에 새 시각
//  ⑥ 추천 블록 → 계획 넣기 창(과목·할 일 미리 채움)
const { chromium } = require('C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/.test-tools/node_modules/playwright');
const T0 = new Date('2026-10-07T11:00:00+09:00');
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  const fail = []; const expect = (ok, m) => { if (!ok) fail.push(m); };
  const posts = []; p.on('request', (r) => { if (r.method() === 'POST' && /\/api\/school\/workspace/.test(r.url())) posts.push(JSON.parse(r.postData() || '{}')); });
  let saved = { v60: {} };
  await p.route('**/api/study/state', async (r) => { if (r.request().method() === 'POST') { saved = JSON.parse(r.request().postData()).state; return r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); } return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ state: saved }) }); });
  p.on('dialog', (d) => d.accept());
  await p.clock.install({ time: T0 });
  await fetch('http://127.0.0.1:8797/api/_reset', { method: 'POST' });
  await p.goto('http://127.0.0.1:8797/school/index.html'); await p.waitForSelector('.pl-schedule', { timeout: 15000 }); await p.waitForTimeout(800);
  const blocks = (k) => p.evaluate((k) => [...document.querySelectorAll('.pl-day:not(.pl-week) .pl-blk' + (k ? '.k-' + k : ''))].map((x) => x.textContent), k);
  const closePop = async () => { await p.keyboard.press('Escape'); await p.waitForTimeout(150); };
  // ①
  const strip = await p.evaluate(() => [...document.querySelectorAll('.pl-strip .pl-sday')].map((x) => (x.classList.contains('on') ? '*' : '') + x.textContent));
  expect(strip.length === 7 && strip[2] === '*수7', '요일 줄 ' + JSON.stringify(strip));
  await p.click('.pl-strip .pl-sday:nth-child(4)'); await p.waitForTimeout(500);
  const thu = await blocks('class');
  expect(/10\/08/.test(await p.evaluate(() => document.querySelector('.pl-schedule .pl-head small').textContent)) && thu.some((t) => /미분적분학2 수업/.test(t)), '목요일 수업 ' + JSON.stringify(thu));
  // ④ 내일 수업: 출석 막힘
  await p.click('.pl-blk.k-class'); await p.waitForTimeout(300);
  expect(await p.evaluate(() => [...document.querySelectorAll('.pl-info .pl-pick button')].slice(0, 4).every((x) => x.disabled)), '내일 수업 출석이 안 막힘');
  await closePop();
  await p.click('.pl-strip .pl-sday:nth-child(5)'); await p.waitForTimeout(500);
  expect(!(await blocks('class')).length, '휴일(10/9)에 수업이 그려짐');
  // ② 빈칸 누르기(10/9 20:00 쯤)
  const grid = await p.$('.pl-grid'); const gb = await grid.boundingBox();
  await p.evaluate(() => { document.querySelector('.pl-day').scrollTop = 54 * 18; }); await p.waitForTimeout(200);
  const gb2 = await grid.boundingBox();
  await p.mouse.click(gb2.x + 120, gb2.y + 54 * 20 + 10); await p.waitForTimeout(300);
  const pop2 = await p.evaluate(() => ({ title: document.querySelector('.pl-pop b')?.textContent, start: document.querySelector('.pl-pop input[aria-label="시작"]')?.value }));
  expect(/10\/09/.test(pop2.title || '') && pop2.start === '20:00', '빈칸 추가 창 ' + JSON.stringify(pop2)); void gb;
  await closePop();
  // ③ 오늘 수업
  await p.click('.pl-schedule .pl-today'); await p.waitForTimeout(500);
  await p.click('.pl-blk.k-class:has-text("공업수학1")'); await p.waitForTimeout(300);
  await p.click('.pl-info .pl-pick button:has-text("출석")'); await p.waitForTimeout(800);
  expect(posts.some((x) => x.op === 'attendance' && x.status === 'present' && x.date === '2026-10-07'), '출석 저장 안 됨');
  await p.click('.pl-blk.k-class:has-text("공업수학1")'); await p.waitForTimeout(300);
  expect(await p.evaluate(() => document.querySelector('.pl-info .pl-pick button[aria-pressed=true]')?.textContent === '출석'), '다시 열었을 때 출석 표시 없음');
  await p.click('.pl-info .pl-pick[aria-label="이해도 1~5"] button:has-text("4")'); await p.waitForTimeout(400);
  await p.click('.pl-info button[aria-label="수업 시작 기록"]'); await p.waitForTimeout(400);
  const log = Object.values(saved.v60.classLog || {})[0];
  expect(log?.und === 4 && log?.startedAt === '11:00' && log?.course === '공업수학1', '이해도·시작 기록 ' + JSON.stringify(log));
  await closePop();
  // ⑤ 캘린더 블록
  await p.click('.pl-blk.k-cal'); await p.waitForTimeout(300);
  await p.fill('.pl-info input[aria-label="시작"]', '17:00'); await p.fill('.pl-info input[aria-label="끝"]', '18:00');
  await p.click('.pl-info button:has-text("시각 바꾸기")'); await p.waitForTimeout(1500);
  const ch = await (await fetch('http://127.0.0.1:8797/api/_changes')).json();
  expect(ch.length === 1 && ch[0].action === 'reschedule' && ch[0].calendarId === 'attoyd' && ch[0].eventId === 'ev1' && ch[0].expectedSourceVersion === 'v1' && ch[0].after.start === '2026-10-07T17:00:00+09:00', '캘린더 변경 요청 ' + JSON.stringify(ch));
  const cal = await p.evaluate(() => document.querySelector('.pl-blk.k-cal')?.title || '');
  expect(/17:00–18:00/.test(cal), '시간표에 새 시각 안 보임 ' + cal);
  // ⑥ 추천 블록
  const auto = await p.$('.pl-blk.k-auto');
  if (auto) { await auto.click(); await p.waitForTimeout(300); const pre = await p.evaluate(() => ({ c: document.querySelector('.pl-pop select[aria-label="과목"]')?.value, n: document.querySelector('.pl-pop input[aria-label="할 일"]')?.value })); expect(pre.c && pre.n, '추천 → 계획 미리 채움 ' + JSON.stringify(pre)); await closePop(); }
  else fail.push('추천 블록 없음');
  // ⑧ (오타 RED) 학기 끝 날짜나 휴일 목록이 없으면 다른 날 수업을 그리지 않음
  for (const [name, patch] of [['학기 끝 없음', (j) => { j.term = { start: '2026-09-01', end: null }; }], ['휴일 목록 없음', (j) => { j.holidays = null; }]]) {
    let hits = 0; await p.route('**/api/school/workspace*', async (r) => { if (r.request().method() !== 'GET') return r.continue(); hits++; const res = await r.fetch(); const j = await res.json(); patch(j); return r.fulfill({ response: res, json: j }); });
    await p.reload(); await p.waitForSelector('.pl-schedule', { timeout: 15000 }); await p.waitForTimeout(600);
    await p.click('.pl-strip .pl-sday:nth-child(4)'); await p.waitForTimeout(400);
    expect(hits > 0 && !(await blocks('class')).length, name + `인데 다른 날 수업이 그려짐(가로챔 ${hits})`);
    await p.unroute('**/api/school/workspace*');
  }
  expect(!errors.length, '오류 ' + errors.join(' | '));
  console.log(fail.length ? 'FAIL ' + JSON.stringify(fail) : 'plan block: 요일 줄·다른 날 수업·휴일·빈칸 추가·출석·이해도·시작·미래 출석 막힘·캘린더 시각 변경·추천→계획 ok');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
