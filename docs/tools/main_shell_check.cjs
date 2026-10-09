// 학교 메인 화면 틀 검사(shell.js·workspace.js renderDashboard, 대표님 10/9 「초심으로」) — 모의 서버(8797):
//  ① 위 고정 줄: 「GREENLIGHT | SCHOOL」·탭 4(홈·교실·자료실·과제실)·비서 토큰 3(아톰·오타 %, 토토 $)·대표실 링크
//  ② 메인 = 위 요약 칩(시험 D-day·남은 회차) + 공부 계획(관제탑 공부계획 통합 보기: 오늘 할 과제·시간표) · 비서별 재설정 카운트다운 · ≡ 목록(지도 아이콘 대신)
//  ③ 스크롤해도 위 줄·아래 스앵님 바 제자리 ④ 채팅 보내면 답이 말풍선·대화 기록에 ⑤ 기록 창 바깥 누르면 닫힘
//  ⑥ 교실(수업)에 들어가면 아래 바 숨김 ⑦ 가로 스크롤 없음 · 오류 없음
// 사용: node docs/tools/main_shell_check.cjs [w h]
const { chromium } = require('C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/.test-tools/node_modules/playwright');
const [W, H] = [+process.argv[2] || 1194, +process.argv[3] || 834];
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  const fail = []; const expect = (ok, m) => { if (!ok) fail.push(m); };
  await fetch('http://127.0.0.1:8797/api/_reset', { method: 'POST' });
  await p.addInitScript(() => { localStorage.setItem('school-setup', 'solo'); localStorage.setItem('school-view', 'site'); });
  await p.goto('http://127.0.0.1:8797/school/index.html');
  await p.waitForSelector('.pl-tasks', { timeout: 15000 }); await p.waitForTimeout(800);
  const top = await p.evaluate(() => ({
    brand: document.getElementById('home').textContent.replace(/\s+/g, ' ').trim(),
    tabs: [...document.querySelectorAll('header nav.rooms .room-door')].filter((x) => x.getClientRects().length).map((x) => x.textContent.trim()),
    gauges: [...document.querySelectorAll('.gl-gauge')].map((g) => g.textContent.replace(/\s+/g, ' ').trim()),
    office: document.querySelector('.gl-office')?.getAttribute('href'),
    chips: document.querySelectorAll('.db-strip .db-chip').length,
    plan: { has: !!document.querySelector('.pl-tasks') && !!document.querySelector('.pl-nums') && !!document.querySelector('.pl-schedule'), fit: true },
    chipNames: [...document.querySelectorAll('.db-strip .db-chip span')].map((x) => x.textContent),
    countdown: [...document.querySelectorAll('.gl-gauge .gl-t')].map((t) => t.textContent),
    mapHidden: (() => { const m = document.querySelector('header .map-trigger'); return !m || getComputedStyle(m).display === 'none'; })(),
    hscroll: document.documentElement.scrollWidth > innerWidth + 1,
  }));
  expect(top.brand.replace(/\s/g, '') === 'GREENLIGHT|SCHOOL', '상호 ' + top.brand);   // 띄어쓰기는 여백(CSS)이라 글자에선 뺌
  expect(JSON.stringify(top.tabs) === JSON.stringify(['홈', '교실', '자료실', '과제실', '상담실']), '탭 ' + JSON.stringify(top.tabs));
  expect(top.gauges.length === 3 && /아톰\s*42%/.test(top.gauges[0]) && /오타\s*18%/.test(top.gauges[1]) && /토토\s*\$3\.20/.test(top.gauges[2]), '토큰 ' + JSON.stringify(top.gauges));
  expect(!!top.office, '대표실 링크 없음');
  expect(JSON.stringify(top.chipNames.slice().sort()) === JSON.stringify(['공업수학1', '미분적분학2', '일반물리학2', '정역학']), '집중 4과목 칩 아님 ' + JSON.stringify(top.chipNames));
  expect(top.plan.has, '공부 계획(오늘 할 과제)이 안 뜸');
  expect(top.countdown.length === 3 && top.countdown.every((t) => t && t !== '곧'), '재설정 카운트다운 ' + JSON.stringify(top.countdown));
  expect(top.mapHidden, '지도 아이콘이 아직 보임');
  // ≡ 목록: 열면 확인·메일함·결재함·연동 상태 + 학교 지도 + 기존 더보기 항목, 바깥 누르면 닫힘
  await p.click('.gl-menu'); await p.waitForTimeout(200);
  const menu = await p.evaluate(() => ({ open: !document.querySelector('.gl-pop').hidden, items: [...document.querySelectorAll('.gl-pop button')].map((b) => b.textContent) }));
  expect(menu.open && /^확인/.test(menu.items[0]) && menu.items[1] === '메일함' && /^결재함/.test(menu.items[2]) && menu.items[3] === '연동 상태' && menu.items.includes('학교 지도'), '≡ 목록 ' + JSON.stringify(menu));   // 맨 위 확인·메일함·결재함·연동(10/9)
  await p.mouse.click(40, Math.round(H / 2)); await p.waitForTimeout(200);
  expect(await p.evaluate(() => document.querySelector('.gl-pop').hidden), '≡ 목록이 바깥 눌러도 안 닫힘');
  expect(!top.hscroll, '가로 스크롤');
  // 스크롤해도 위·아래 제자리
  const pos = () => p.evaluate(() => ({ head: Math.round(document.querySelector('.school > header').getBoundingClientRect().top), bar: Math.round(document.querySelector('.sb').getBoundingClientRect().bottom), who: !!document.querySelector('.sb-who[data-face=saeng] .saeng') }));   // 강의실과 같은 웹툰 그림(10/9)
  const before = await pos();
  await p.evaluate(() => { const s = [document.scrollingElement, document.getElementById('scene'), document.querySelector('.school')].find((e) => e && e.scrollHeight > e.clientHeight + 5); if (s) s.scrollTop = 600; window.__scroller = s ? (s.id || s.className || 'root') : 'none'; });
  await p.waitForTimeout(300);
  const after = await pos();
  expect(after.head === before.head && after.head <= 1, '스크롤 뒤 위 줄이 움직임 ' + JSON.stringify([before, after]));
  expect(after.bar === before.bar && Math.abs(after.bar - H) <= 1, '스크롤 뒤 아래 바가 움직임 ' + JSON.stringify([before, after]));
  expect(after.who, '아래 바에 웹툰 스앵님 없음');
  // 채팅 → 답
  await p.fill('.sb input', '오늘 뭐부터 할까요?'); await p.press('.sb input', 'Enter');
  await p.waitForFunction(() => /모의|질문/.test(document.querySelector('.sb-bubble')?.textContent || ''), null, { timeout: 8000 }).catch(() => {});
  const chat = await p.evaluate(() => ({ bubble: document.querySelector('.sb-bubble')?.textContent || '', hidden: document.querySelector('.sb-bubble').hidden }));
  expect(!chat.hidden && /모의/.test(chat.bubble), '채팅 답이 말풍선에 없음 ' + chat.bubble);
  await p.click('.sb button[aria-label="대화 기록"]'); await p.waitForTimeout(200);
  const logs = await p.evaluate(() => [...document.querySelectorAll('.sb-log .sb-msg')].map((m) => m.className + ':' + m.textContent.slice(0, 20)));
  expect(logs.some((x) => /from-me:오늘 뭐부터/.test(x)) && logs.some((x) => /from-saeng:/.test(x)), '대화 기록 ' + JSON.stringify(logs));
  await p.mouse.click(Math.round(W / 2), 200); await p.waitForTimeout(200);
  expect(await p.evaluate(() => document.querySelector('.sb-log').hidden), '기록 창 바깥 눌러도 안 닫힘');
  // 말풍선은 Esc 로도 닫힘(키보드)
  await p.evaluate(() => { document.activeElement?.blur(); document.querySelector('.sb-bubble').hidden = false; });
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  expect(await p.evaluate(() => document.querySelector('.sb-bubble').hidden), 'Esc 로 말풍선 안 닫힘');
  // 예산 응답이 비면 $0 이 아니라 「—」
  for (const body of ['{}', '{"spent":null,"budget":10}', '{"spent":"","budget":10}']) {
  const q = await b.newPage({ viewport: { width: W, height: H } });
  await q.route('**/api/toto/budget', (r) => r.fulfill({ status: 200, contentType: 'application/json', body }));
  await q.addInitScript(() => { localStorage.setItem('school-setup', 'solo'); localStorage.setItem('school-view', 'site'); });
  await q.goto('http://127.0.0.1:8797/school/index.html'); await q.waitForSelector('.pl-tasks', { timeout: 15000 }); await q.waitForTimeout(1500);
  const toto = await q.evaluate(() => document.querySelectorAll('.gl-gauge')[2].textContent.replace(/\s+/g, ''));
  expect(toto === '토토—', '빈 예산 응답 표시 ' + body + ' → ' + toto);
  await q.close();
  }
  // 교실 들어가면 아래 바 숨김
  await p.goto('http://127.0.0.1:8797/school/index.html?lesson=statics-2026-09-14');
  await p.waitForFunction(() => document.querySelector('.school').dataset.mode === 'classroom', null, { timeout: 15000 }); await p.waitForTimeout(500);
  expect(await p.evaluate(() => getComputedStyle(document.querySelector('.sb')).display === 'none'), '교실에서 아래 바가 보임');
  expect(!errors.length, '오류 ' + errors.join(' | '));
  console.log(JSON.stringify({ gauges: top.gauges, scroller: await p.evaluate(() => window.__scroller) }));
  console.log(fail.length ? 'FAIL ' + JSON.stringify(fail) : `main shell ${W}x${H}: 상호·탭·토큰+카운트다운·대표실·≡ 목록·요약 칩·공부 계획·위아래 고정·채팅·기록·교실 숨김 ok`);
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
