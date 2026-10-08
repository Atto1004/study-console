// 교실 v3 검사: 사이트 모드로 수업 열기 → 강의 자동 재생(자막·칠판 드러남) → Space 멈춤/계속 → ⏭/Enter 문장 넘김 → 끝나면 확인 질문(가운데) → 채팅 기록 · 보기 전환
const { chromium } = require('C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/.test-tools/node_modules/playwright');
const OUT = 'C:/Users/user/.claude/jobs/a132f963/tmp/';
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1194, height: 834 } });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  const fail = []; const expect = (ok, m) => { if (!ok) fail.push(m); }; const out = {};
  const st = () => p.evaluate(() => ({ lecture: document.querySelector('.school').dataset.lecture, sub: document.getElementById('subtitle')?.hidden ? null : document.getElementById('subtitle')?.textContent, reveal: document.querySelector('#board .content')?.style.getPropertyValue('--reveal'), tutor: document.getElementById('dialogue').dataset.tutor, log: document.querySelectorAll('#chatLog .v3-msg').length, form: (() => { const f = document.querySelector('#workZone form'); return f ? !f.hidden : null; })() }));
  await p.addInitScript(() => { localStorage.setItem('school-setup', 'solo'); localStorage.setItem('school-view', 'site'); });
  await p.goto('http://127.0.0.1:8797/school/index.html?lesson=' + encodeURIComponent('session:CADD:2026-09-08'));
  await p.waitForFunction(() => document.querySelector('.school').dataset.mode === 'classroom', null, { timeout: 15000 });
  await p.waitForTimeout(800);
  out.start = await st();
  expect(out.start.lecture === 'playing', '시작하자마자 강의 재생 아님 ' + out.start.lecture);
  expect(!!out.start.sub, '자막 없음');
  out.zones = await p.evaluate(() => ['lectureStage', 'workZone', 'dialogue'].map((id) => { const r = document.getElementById(id).getBoundingClientRect(); return [id, Math.round(r.top), Math.round(r.height)]; }));
  expect(out.zones[0][1] < out.zones[1][1] && out.zones[1][1] < out.zones[2][1], '세 칸 순서 틀림');
  await p.screenshot({ path: OUT + 'v3-playing.png' });
  await p.keyboard.press('Space'); await p.waitForTimeout(300); out.paused = await st();
  expect(out.paused.lecture === 'paused', 'Space 멈춤 안 됨');
  await p.keyboard.press('Space'); await p.waitForTimeout(300); out.resumed = await st();
  expect(out.resumed.lecture === 'playing', 'Space 계속 안 됨');
  const sub0 = out.resumed.sub; await p.keyboard.press('Enter'); await p.waitForTimeout(300); out.skipped = await st();
  expect(out.skipped.sub !== sub0 || out.skipped.lecture === 'ended', 'Enter 문장 넘김 안 됨');
  for (let i = 0; i < 30 && (await st()).lecture !== 'ended'; i++) { await p.click('.v3-skip'); await p.waitForTimeout(150); }
  await p.waitForTimeout(500); out.ended = await st();
  expect(out.ended.lecture === 'ended', '강의 끝나지 않음');
  expect(out.ended.tutor === 'check', '끝난 뒤 확인 질문 아님 ' + out.ended.tutor);
  expect(out.ended.form === true, '가운데 답 칸 안 보임');
  expect(out.ended.reveal === '1', '칠판 다 안 드러남 ' + out.ended.reveal);
  expect(out.ended.log >= 1, '채팅 기록 비어 있음');
  await p.screenshot({ path: OUT + 'v3-ended.png' });
  // 아래 채팅으로 질문
  await p.fill('#chatInput', '이건 왜 그런가요?'); await p.press('#chatInput', 'Enter'); await p.waitForTimeout(900);
  out.chat = await p.evaluate(() => [...document.querySelectorAll('#chatLog .v3-msg')].slice(-4).map((m) => m.className + ':' + m.textContent.slice(0, 30)));
  expect(out.chat.some((c) => /v3-me:/.test(c)), '내 질문이 기록에 없음');
  // 답하고 다음 단계
  await p.fill('#tutorInput', '트리가 사라지면 설정에서 다시 켜는 방법을 설명하는 부분이에요'); await p.press('#tutorInput', 'Enter'); await p.waitForTimeout(900);
  out.answered = await st();
  await p.keyboard.press('Enter'); await p.waitForTimeout(900); out.next = { ...(await st()), label: await p.evaluate(() => document.querySelector('.v3-progress').textContent) };
  expect(out.next.lecture === 'playing', '다음 단계에서 강의 다시 시작 안 함');
  // 보기 전환 버튼
  out.toggle = await p.evaluate(() => { const t = document.querySelector('.view-toggle'); return t ? t.dataset.view : null; });
  expect(out.toggle === 'site', '보기 전환 버튼 없음');
  out.hidden = await p.evaluate(() => ['.seat-controls', '.learning-strip', '#missionHeader'].map((s) => { const e = document.querySelector(s); return e ? getComputedStyle(e).display : 'none'; }));
  out.errors = errors; out.fail = fail; console.log(JSON.stringify(out, null, 1)); await b.close(); process.exit(fail.length || errors.length ? 1 : 0);
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
