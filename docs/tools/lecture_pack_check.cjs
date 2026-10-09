// 회차 강의안 수업 검사(세계 기획 v1 9절·3부, 정역학 9/14 시범) — 모의 서버(8797)에서:
//  ① 입장하면 회상·목표부터 강의 ② 판서 단계에서는 확인 질문 없이 다음 판서로 이어짐
//  ③ 섹션 끝에서만 확인 문제(보기) — 오답이면 같은 문제에 남고, 정답이면 다음 섹션
//  ④ 건너뛰기·자동 넘김은 「읽음」 기록을 남기지 않음(기록은 위치·답만) ⑤ 넘김이 겹쳐도 수업 순서를 건너뛰지 않음
// 사용: node docs/tools/lecture_pack_check.cjs [w h]   (SHOT_DIR 있으면 캡처)
const { chromium } = require('C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/.test-tools/node_modules/playwright');
const [W, H] = [+process.argv[2] || 1194, +process.argv[3] || 834];
const SHOT = process.env.SHOT_DIR;
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  const fail = []; const expect = (ok, m) => { if (!ok) fail.push(m); };
  const posts = []; p.on('request', (r) => { if (r.method() === 'POST' && /\/api\//.test(r.url())) { try { posts.push({ k: r.url().split('/').pop(), b: JSON.parse(r.postData() || '{}') }); } catch {} } });
  const st = () => p.evaluate(() => ({
    label: document.getElementById('stepLabel')?.textContent, lecture: document.querySelector('.school').dataset.lecture,
    tutor: document.getElementById('dialogue').dataset.tutor, sub: document.getElementById('subtitle')?.hidden ? null : document.getElementById('subtitle')?.textContent,
    form: (() => { const f = document.querySelector('#workZone form'); return f ? !f.hidden : null; })(),
    opts: [...document.querySelectorAll('#choices button[data-opt]')].map((x) => x.querySelector('.opt-body')?.textContent.trim()),
  }));
  await p.addInitScript(() => { localStorage.setItem('school-setup', 'solo'); localStorage.setItem('school-view', 'site'); });
  await fetch('http://127.0.0.1:8797/api/_reset', { method: 'POST' });   // 모의 서버 세션·기록 초기화(이전 검사 위치에서 이어 열리지 않게)
  await p.goto('http://127.0.0.1:8797/school/index.html?lesson=statics-2026-09-14');
  await p.waitForFunction(() => document.querySelector('.school').dataset.mode === 'classroom', null, { timeout: 15000 });
  await p.waitForTimeout(700);
  const s0 = await st();
  expect(s0.label === '섹션 1 / 5', '첫 라벨 ' + s0.label);
  expect(s0.lecture === 'playing', '입장하자마자 강의 아님 ' + s0.lecture);
  expect(/지난 시간에는 내적을/.test(s0.sub || ''), '입장 회상부터가 아님: ' + s0.sub);
  if (SHOT) await p.screenshot({ path: SHOT + '/pack-intro.png' });
  // 섹션 1 판서를 끝까지 넘긴다: 그동안 확인 질문(답 칸)이 한 번도 안 떠야 한다
  const seen = new Set(); let asked = 0;
  for (let i = 0; i < 160; i++) {
    const s = await st(); seen.add(s.label);
    if (s.label === '섹션 1 확인') break;
    if (s.tutor === 'check' || s.form === true) asked++;
    await p.click('.v3-skip').catch(() => {}); await p.waitForTimeout(90);
  }
  await p.waitForTimeout(600);
  const c1 = await st();
  expect(c1.label === '섹션 1 확인', '섹션 1 확인 문제에 못 옴 ' + c1.label);
  expect(asked === 0, '판서 단계에서 확인 질문이 ' + asked + '번 뜸');
  expect(c1.opts.length === 4, '확인 문제 보기 ' + c1.opts.length);
  if (SHOT) await p.screenshot({ path: SHOT + '/pack-check.png' });
  const reads = posts.filter((x) => x.k === 'event' && x.b.kind === 'read');
  expect(reads.length === 0, '「읽음」 기록이 남음 ' + reads.length);
  // 위치 기록이 수업 순서(강의안 route)대로 한 칸씩(겹친 넘김으로 건너뛰지 않음)
  const lesson = await p.evaluate(() => fetch('/api/study/lesson?id=statics-2026-09-14').then((r) => r.json()));
  const pack = require('../../knowledge/lectures/statics-2026-09-14.json');
  const at = new Map(lesson.steps.map((s, i) => [s.id, i]));
  const route = pack.sections.flatMap((sec) => [...Object.keys(sec.script), sec.check]).concat(pack.worksheet).map((id) => at.get(id));
  const pos = posts.filter((x) => x.k === 'event' && x.b.kind === 'position').map((x) => x.b.index);
  expect(JSON.stringify(pos) === JSON.stringify(route.slice(1, pos.length + 1)), '위치가 수업 순서와 다름 ' + JSON.stringify(pos));
  // 오답 → 같은 문제 / 정답 → 다음 섹션
  const pick = async (text) => { const bs = await p.$$('#choices button[data-opt]'); for (const x of bs) if ((await x.$eval('.opt-body', (e) => e.textContent.trim())) === text) { await x.click(); return true; } return false; };
  expect(await pick('4'), '오답 보기 못 찾음'); await p.waitForTimeout(900);
  const wrong = await st(); expect(wrong.label === '섹션 1 확인', '오답 뒤 문제를 떠남 ' + wrong.label);
  const ansW = posts.filter((x) => x.k === 'event' && x.b.kind === 'answer').at(-1);
  expect(ansW && ansW.b.step === 'c1', '오답 기록 문항 ' + JSON.stringify(ansW?.b?.step));
  expect(await pick('0'), '정답 보기 못 찾음'); await p.waitForTimeout(2600);   // 맞히면 1.8초 뒤 저절로 다음 섹션
  const s2 = await st();
  expect(s2.label === '섹션 2 / 5', '정답 뒤 섹션 2 로 안 감 ' + s2.label);
  expect(s2.lecture === 'playing', '섹션 2 강의 시작 안 함 ' + s2.lecture);
  if (SHOT) await p.screenshot({ path: SHOT + '/pack-s2.png' });
  const sess = posts.filter((x) => x.k === 'session').at(-1);
  expect(sess && /^s2-1:0$/.test(sess.b.stepId), '세션 저장 위치 ' + sess?.b?.stepId);
  expect(!errors.length, '페이지 오류 ' + errors.join(' | '));
  console.log(JSON.stringify({ labels: [...seen], s2: s2.label, positions: pos.length, answers: posts.filter((x) => x.b.kind === 'answer').map((x) => x.b.step) }));
  console.log(fail.length ? 'FAIL ' + JSON.stringify(fail) : 'lecture pack: 입장 회상·판서 무질문·섹션 확인·읽음 없음·순서 ok');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
