// 계획 고치기·지우기 · 채우기 검사 — 모의 서버(8797), 시계를 모의 날짜(10/7 09:00)로:
//  ① 계획 블록 누르면 「계획 고치기」 → 시각 바꿔 저장(plan-update) → 시간표에 새 시각 ② 지우기 → 「정말 지우기」 → plan-delete → 사라짐
//  ③ 채우기(하루·오늘): 확인 창 → 빈 시간에만 「자동 채움」 계획, 고정 일정(수업·캘린더)과 안 겹침, 하루 상한 안
//  ④ 위치 기록 누르면 지우기(확인)
const { chromium } = require('C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/.test-tools/node_modules/playwright');
const T0 = new Date('2026-10-07T09:00:00+09:00');
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
  const plans = () => p.evaluate(() => [...document.querySelectorAll('.pl-blk.k-plan')].map((x) => x.textContent));
  // ① 고치기
  await p.click('.pl-blk.k-plan.edit'); await p.waitForTimeout(300);
  expect(await p.evaluate(() => /계획 고치기/.test(document.querySelector('.pl-pop b')?.textContent || '')), '계획 고치기 창 안 뜸');
  await p.fill('.pl-pop input[aria-label="시작"]', '20:30'); await p.click('.pl-pop button[type=submit]'); await p.waitForTimeout(1500);
  expect(posts.some((x) => x.op === 'plan-update' && x.plan?.s === '20:30') && (await plans()).some((t) => /20:30/.test(t)), '고친 시각이 안 바뀜 ' + JSON.stringify(await plans()));
  // ② 지우기
  await p.click('.pl-blk.k-plan.edit'); await p.waitForTimeout(300);
  await p.click('.pl-pop button.danger'); await p.waitForTimeout(150);
  expect(await p.evaluate(() => document.querySelector('.pl-pop button.danger')?.textContent === '정말 지우기'), '두 번 확인 없음');
  await p.click('.pl-pop button.danger'); await p.waitForTimeout(1500);
  expect(posts.some((x) => x.op === 'plan-delete') && !(await plans()).length, '지우기 안 됨 ' + JSON.stringify(await plans()));
  // ③ 채우기(오늘)
  const fixed = await p.evaluate(() => [...document.querySelectorAll('.pl-blk.k-class, .pl-blk.k-cal, .pl-blk.k-work, .pl-blk.k-exam')].map((x) => x.title));
  await p.click('.pl-fill'); await p.waitForTimeout(2000);
  const add = posts.filter((x) => x.op === 'plan-add').flatMap((x) => x.plans || []);
  const toMin = (h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));
  const fx = fixed.map((t) => { const m = t.match(/(\d\d:\d\d)–(\d\d:\d\d)/); return m ? [toMin(m[1]), toMin(m[2])] : null; }).filter(Boolean);
  const overlap = add.filter((x) => fx.some(([a, b2]) => Math.max(a, toMin(x.s)) < Math.min(b2, toMin(x.e))));
  const total = add.reduce((n, x) => n + toMin(x.e) - toMin(x.s), 0);
  expect(add.length >= 2 && add.every((x) => x.kind === '자동 채움' && x.date === '2026-10-07' && x.courseId), '채우기 계획 ' + JSON.stringify(add));
  expect(!overlap.length, '고정 일정과 겹침 ' + JSON.stringify(overlap));
  expect(total <= 240, '하루 상한 넘음 ' + total);
  expect(add.some((x) => /시험 공부/.test(x.note)) && add.some((x) => /과제 · /.test(x.note)), '과제·시험 공부 둘 다 안 들어감 ' + JSON.stringify(add.map((x) => x.note)));
  expect((await plans()).length === add.length, '채운 계획이 시간표에 안 보임');
  // ④ 위치 기록 지우기
  await p.click('.pl-placebar .pl-chip:has-text("카페")'); await p.waitForTimeout(400);
  await p.click('.pl-place'); await p.waitForTimeout(500);
  expect(!(Object.values(saved.v60.place || {})[0] || []).length && !(await p.$('.pl-place')), '위치 기록 지우기 안 됨');
  expect(!errors.length, '오류 ' + errors.join(' | '));
  console.log(JSON.stringify({ filled: add.map((x) => `${x.s}-${x.e} ${x.note}`), total }));
  console.log(fail.length ? 'FAIL ' + JSON.stringify(fail) : 'plan edit: 고치기·지우기(두 번 확인)·채우기(빈 시간만·고정 안 겹침·상한)·위치 지우기 ok');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
