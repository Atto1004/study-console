// 공부 계획 저장·시간 견고성 검사(오타 검수 10/9 RED 5건) — 모의 서버(8797), /api/study/state 는 가로채 서버처럼 흉내:
//  ① 빠르게 두 번 추가 + 첫 저장 409 → 둘 다 저장 ② 저장 500 → 「저장 안 된 변경」 + 다시 저장으로 복구
//  ③ ■ 20분 뒤 다시 30분 하고 완료 체크 → 실제 50분(덮어쓰기 아님) ④ 예상 60·실제 60 → 남은 0분이라 자동 배치 없음
//  ⑤ 캘린더 받기 실패 → 자동 배치 보류 안내, 빈 일정으로 배치하지 않음
const { chromium } = require('C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/.test-tools/node_modules/playwright');
const T0 = new Date('2026-10-07T09:00:00+09:00');   // 모의 서버 날짜(10/7)와 맞춘 시계
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const fail = []; const expect = (ok, m) => { if (!ok) fail.push(m); };
  async function page({ calFail = false } = {}) {
    const p = await b.newPage({ viewport: { width: 1194, height: 834 } });
    p.errors = []; p.on('pageerror', (e) => p.errors.push(e.message));
    p.server = { state: { v60: {} }, rev: 0, mode: [] };   // mode: 다음 POST 응답들('409'|'500')
    await p.clock.install({ time: T0 });
    await p.route('**/api/study/state', async (r) => {
      const srv = p.server;
      if (r.request().method() === 'POST') {
        const m = srv.mode.shift();
        if (m === '409') { srv.state.v60.extra = [...(srv.state.v60.extra || []), { id: 'other', kind: '공부', c: '정역학', t: '다른 화면에서 넣은 것', due: '2026-10-07', est: 20 }]; return r.fulfill({ status: 409, contentType: 'application/json', body: '{"error":"x"}' }); }
        if (m === '500') return r.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"x"}' });
        srv.state = JSON.parse(r.request().postData()).state; return r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
      }
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ state: JSON.parse(JSON.stringify(srv.state)) }) });
    });
    if (calFail) await p.route('**/api/cal*', (r) => r.fulfill({ status: 500, body: 'x' }));
    await fetch('http://127.0.0.1:8797/api/_reset', { method: 'POST' });
    await p.goto('http://127.0.0.1:8797/school/index.html'); await p.waitForSelector('.pl-tasks', { timeout: 15000 }); await p.waitForTimeout(500);
    return p;
  }
  const extras = (p) => (p.server.state.v60.extra || []).map((x) => x.t);
  const add = async (p, text) => { await p.fill('.pl-add input[name=t]', text); await p.click('.pl-add button'); };
  // ①
  let p = await page();
  p.server.mode.push('409');
  await add(p, 'A 문제'); await add(p, 'B 문제'); await p.waitForTimeout(1500);
  const ex1 = extras(p);
  expect(ex1.includes('A 문제') && ex1.includes('B 문제') && ex1.includes('다른 화면에서 넣은 것'), '409 뒤 저장 누락 ' + JSON.stringify(ex1));
  // ②
  p.server.mode.push('500');
  await add(p, 'C 문제'); await p.waitForTimeout(800);
  const bar = await p.evaluate(() => document.querySelector('.pl-unsaved')?.textContent || '');
  expect(/저장 안 된 변경 1개/.test(bar) && !extras(p).includes('C 문제'), '500 뒤 미저장 표시 없음 ' + bar);
  await p.click('.pl-unsaved button'); await p.waitForTimeout(800);
  expect(extras(p).includes('C 문제') && !(await p.$('.pl-unsaved')), '다시 저장으로 복구 안 됨');
  // ③ ■ 20분 → 다시 30분 → 완료 체크 = 50분
  const row = '.pl-task[data-key="정역학|HW Ch.5"]';
  await p.click(`${row} button[aria-label="시작"]`); await p.waitForTimeout(300);
  await p.clock.fastForward('20:00'); await p.click(`${row} button[aria-label="끝내고 실제 시간 기록"]`); await p.waitForTimeout(400);
  const a1 = p.server.state.v60.act?.['정역학|HW Ch.5']?.min;
  await p.click(`${row} button[aria-label="시작"]`); await p.waitForTimeout(300);
  await p.clock.fastForward('30:00'); await p.click(`${row} input.pl-check`); await p.waitForTimeout(500);
  const a2 = p.server.state.v60.act?.['정역학|HW Ch.5'];
  expect(a1 === 20 && a2?.min === 50 && a2?.days?.['2026-10-07'] === 50, '실제 분 누적 ' + JSON.stringify({ a1, a2 }));
  await p.close();
  // ④ 예상 60 · 실제 60 → 자동 배치 없음
  p = await page();
  p.server.state = { v60: { act: { '공업수학1|3장 숙제': { c: '공업수학1', t: '3장 숙제', kind: '과제', min: 60, date: '2026-10-06' } }, est: { '공업수학1|3장 숙제': 60 } } };
  await p.reload(); await p.waitForSelector('.pl-tasks'); await p.waitForTimeout(500);
  const auto4 = await p.evaluate(() => [...document.querySelectorAll('.pl-blk.k-auto')].map((x) => x.textContent));
  expect(!auto4.some((x) => /3장 숙제/.test(x)), '남은 0분인데 배치됨 ' + JSON.stringify(auto4));
  await p.close();
  // ⑤ 캘린더 실패 → 배치 보류
  p = await page({ calFail: true });
  const c5 = await p.evaluate(() => ({ auto: document.querySelectorAll('.pl-blk.k-auto').length, note: document.querySelector('.pl-schedule .pl-left')?.textContent || '' }));
  expect(c5.auto === 0 && /자동 배치를 미뤘어요/.test(c5.note), '캘린더 실패인데 배치 ' + JSON.stringify(c5));
  const errs = p.errors; await p.close();
  expect(!errs.length, '오류 ' + errs.join(' | '));
  console.log(fail.length ? 'FAIL ' + JSON.stringify(fail) : 'plan robust: 409 연속 저장·500 미저장 표시와 복구·실제 분 누적·남은 0분·캘린더 실패 보류 ok');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
