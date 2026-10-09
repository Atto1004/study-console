// 강의실 화면 v1 검사(세계 기획 4부 보완, 정역학 9/14 강의안) — 모의 서버(8797):
//  ① 섹션 칩 5 + 학습지 칩, 지금 섹션 표시 ② 입장 대사 동안만 입장 카드, 본 대사에서 걷힘
//  ③ 섹션 확인 오답 → 다시 듣기 아이콘 → 그 섹션 첫 판서로(답 기록 추가 없음) → 강의 끝나면 같은 확인 문제 → 정답 → 칩 통과
//  ④ 칩으로 섹션 3 이동 · 앞쪽 미통과(섹션 2) 점선 · 칩 연타해도 이동 한 번 ⑤ 학습지 오답엔 다시 듣기 아이콘 없음
//  ⑥ 결과 창: 섹션 줄(혼자/도움/미통과) · 학습지 n/5 · 한 장 요약, 미통과 줄 누르면 그 섹션으로
// 사용: node docs/tools/lecture_ui_check.cjs [w h]   (SHOT_DIR 있으면 캡처)
const { chromium } = require('C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/.test-tools/node_modules/playwright');
const [W, H] = [+process.argv[2] || 1194, +process.argv[3] || 834];
const SHOT = process.env.SHOT_DIR;
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  const fail = []; const expect = (ok, m) => { if (!ok) fail.push(m); };
  const posts = []; p.on('request', (r) => { if (r.method() === 'POST' && /\/api\//.test(r.url())) { try { posts.push({ k: r.url().split('/').pop(), b: JSON.parse(r.postData() || '{}') }); } catch {} } });
  const answers = () => posts.filter((x) => x.k === 'event' && x.b.kind === 'answer');
  const positions = () => posts.filter((x) => x.k === 'event' && x.b.kind === 'position').map((x) => x.b.index);
  await fetch('http://127.0.0.1:8797/api/_reset', { method: 'POST' });
  await p.addInitScript(() => { localStorage.setItem('school-setup', 'solo'); localStorage.setItem('school-view', 'site'); });
  await p.goto('http://127.0.0.1:8797/school/index.html?lesson=statics-2026-09-14');
  await p.waitForFunction(() => document.querySelector('.school').dataset.mode === 'classroom', null, { timeout: 15000 });
  const lesson = await p.evaluate(() => fetch('/api/study/lesson?id=statics-2026-09-14').then((r) => r.json()));
  const pack = require('../../knowledge/lectures/statics-2026-09-14.json');
  const at = new Map(lesson.steps.map((s, i) => [s.id, i]));
  const ui = () => p.evaluate(() => ({
    label: document.getElementById('stepLabel')?.textContent,
    chips: [...document.querySelectorAll('.lc-chip')].map((c) => ({ t: c.textContent.trim(), pass: c.hasAttribute('data-pass'), where: c.dataset.where || '', cur: c.getAttribute('aria-current') === 'step', loading: c.hasAttribute('data-loading') })),
    intro: !!document.querySelector('.lc-intro[data-on]'), sub: document.getElementById('subtitle')?.textContent || '',
    relisten: (() => { const e = document.querySelector('.v3-relisten'); if (!e) return false; const r = e.getBoundingClientRect(), x = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight && (x === e || e.contains(x)); })(), boardTitle: document.querySelector('#board h2, #board .title, #board [class*=title]')?.textContent?.trim() || '', lecture: document.querySelector('.school').dataset.lecture,
    oldProgress: getComputedStyle(document.querySelector('.v3-progress')).display,
  }));
  await p.waitForTimeout(500);
  const s0 = await ui();
  expect(s0.chips.length === 6 && s0.chips[0].cur && !s0.chips[0].loading, '칩 6개·섹션 1 지금 표시 ' + JSON.stringify(s0.chips));
  expect(s0.oldProgress === 'none', '옛 진행 글자가 여전히 보임');
  expect(s0.intro && /지난 시간/.test(s0.sub), '입장 대사 동안 입장 카드 안 뜸');
  if (SHOT) await p.screenshot({ path: `${SHOT}/ui-intro-${W}.png` });
  // 입장 대사(회상 3 + 목표 4줄)를 넘기면 본 대사 → 카드 걷힘
  for (let i = 0; i < 12 && (await ui()).intro; i++) { await p.click('.v3-skip'); await p.waitForTimeout(150); }
  const s1 = await ui();
  expect(!s1.intro && s1.label === '섹션 1 / 5', '본 대사에서 입장 카드가 안 걷힘 ' + s1.sub);
  // 섹션 1 끝까지 → 확인 문제
  for (let i = 0; i < 160 && (await ui()).label !== '섹션 1 확인'; i++) { await p.click('.v3-skip').catch(() => {}); await p.waitForTimeout(80); }
  await p.waitForTimeout(500);
  const pick = async (n) => { const bs = await p.$$('#choices button[data-opt]'); await bs[n].click(); await p.waitForTimeout(700); };
  const c1 = lesson.steps[at.get('c1')];
  const nAns = answers().length;
  await pick((c1.answer + 1) % 4);   // 오답
  const w = await ui();
  expect(w.relisten, '확인 오답 뒤 다시 듣기 아이콘이 없거나 화면에서 안 보임(가려짐)');
  expect(/섹션 1 확인/.test(await p.evaluate(() => document.getElementById('board')?.textContent || '')), '칠판 제목이 「섹션 1 확인」 아님');
  if (SHOT) await p.screenshot({ path: `${SHOT}/ui-wrong-${W}.png` });
  const nAfterWrong = answers().length;
  await p.click('.v3-relisten'); await p.waitForTimeout(900);
  const back = await ui();
  expect(back.label === '섹션 1 / 5', '다시 듣기 뒤 섹션 1 판서로 안 감 ' + back.label);
  expect(positions().at(-1) === at.get('s1-1:0'), '다시 듣기 목적지가 섹션 1 첫 판서가 아님 ' + positions().at(-1));
  expect(answers().length === nAfterWrong && nAfterWrong === nAns + 1, '다시 듣기가 답 기록을 만듦');
  // 다시 섹션 끝까지 → 같은 확인 문제 → 정답 → 칩 1 통과
  for (let i = 0; i < 200 && (await ui()).label !== '섹션 1 확인'; i++) { await p.click('.v3-skip').catch(() => {}); await p.waitForTimeout(80); }
  await p.waitForTimeout(500);
  expect((await ui()).label === '섹션 1 확인', '강의 끝나고 같은 확인 문제로 안 돌아옴');
  await pick(c1.answer); await p.waitForTimeout(2600);
  const s2 = await ui();
  expect(s2.chips[0].pass && s2.label === '섹션 2 / 5', '정답 뒤 칩 1 통과·섹션 2 아님 ' + JSON.stringify(s2.chips[0]) + s2.label);
  // 칩 3 연타 → 섹션 3, 위치 기록 1번, 섹션 2 는 앞쪽 미통과(점선)
  const nPos = positions().length;
  const chip3 = (await p.$$('.lc-chip'))[2];
  await chip3.click(); await chip3.click().catch(() => {}); await chip3.click().catch(() => {});
  await p.waitForTimeout(1200);
  const s3 = await ui();
  expect(s3.label === '섹션 3 / 5', '칩 3 으로 섹션 3 안 감 ' + s3.label);
  expect(positions().length - nPos === 1 || positions().slice(nPos).every((v) => v === at.get('s3-1:0')), '칩 연타로 이동이 여러 번 ' + JSON.stringify(positions().slice(nPos)));
  expect(s3.chips[1].where === 'ahead' && !s3.chips[1].pass && s3.chips[2].cur && s3.chips[0].pass, '칩 상태 틀림 ' + JSON.stringify(s3.chips));
  if (SHOT) await p.screenshot({ path: `${SHOT}/ui-chips-${W}.png` });
  // 학습지 칩 → 학습지 첫 문항, 오답이어도 다시 듣기 아이콘 없음
  await (await p.$$('.lc-chip'))[5].click(); await p.waitForTimeout(1200);
  for (let i = 0; i < 20 && (await ui()).lecture === 'playing'; i++) { await p.click('.v3-skip').catch(() => {}); await p.waitForTimeout(100); }
  const ws0 = lesson.steps[at.get(pack.worksheet[0].id)];
  expect((await ui()).label === '학습지 1 / 5', '학습지 칩으로 안 감 ' + (await ui()).label);
  await pick((ws0.answer + 1) % 4);
  expect(!(await ui()).relisten, '학습지 오답에 다시 듣기 아이콘이 뜸');
  // 학습지 끝까지 정답 → 결과 창
  let done = false;
  for (let i = 0; i < 400 && !done; i++) {
    done = await p.evaluate(() => !!document.getElementById('panel')?.open && /수업 완료 · 학습지 결과/.test(document.getElementById('panel').textContent));
    if (done) break;
    const pos = positions().at(-1), st = lesson.steps[pos];
    const bs = await p.$$('#choices button[data-opt]');
    if (st?.options && bs.length === 4 && (await ui()).lecture !== 'playing') { await bs[st.answer].click(); await p.waitForTimeout(2600); }
    else { await p.click('.v3-skip').catch(() => {}); await p.waitForTimeout(100); }
  }
  expect(done, '결과 창 안 뜸');
  const res = await p.evaluate(() => ({ rows: [...document.querySelectorAll('#panel .lc-row')].map((r) => r.dataset.s + ':' + r.textContent.trim()), summary: document.querySelector('#panel .lc-summary li')?.textContent, katex: document.querySelectorAll('#panel .lc-summary .katex').length, raw: [...document.querySelectorAll('#panel .lc-summary li')].some((li) => [...li.childNodes].some((n) => n.nodeType === 3 && n.textContent.includes('\\('))) }));   // 안 그려진 \( 가 글자로 남았는지(KaTeX 주석 칸은 제외)
  expect(res.rows.length === 6, '결과 줄 수 ' + res.rows.length);
  expect(/^own:/.test(res.rows[0]) || /^help:/.test(res.rows[0]), '섹션 1 결과가 통과 아님 ' + res.rows[0]);
  expect(/^no:/.test(res.rows[1]), '섹션 2 결과가 미통과 아님 ' + res.rows[1]);
  expect(/학습지/.test(res.rows[5]) && /5 \/ 5/.test(res.rows[5]), '학습지 결과 ' + res.rows[5]);
  expect(!!res.summary && res.katex >= 5 && !res.raw, '한 장 요약 수식이 안 그려짐 katex=' + res.katex);
  if (SHOT) await p.screenshot({ path: `${SHOT}/ui-result-${W}.png` });
  // 미통과 줄(섹션 2) 누르면 창 닫고 섹션 2 로
  await p.click('#panel button.lc-row'); await p.waitForTimeout(1200);
  const r2 = await ui();
  expect(r2.label === '섹션 2 / 5' && !(await p.evaluate(() => document.getElementById('panel')?.open)), '결과 줄로 섹션 2 안 감 ' + r2.label);
  expect(!errors.length, '페이지 오류 ' + errors.join(' | '));
  console.log(JSON.stringify({ rows: res.rows }));
  console.log(fail.length ? 'FAIL ' + JSON.stringify(fail) : `lecture ui ${W}x${H}: 칩·입장 카드·다시 듣기·칩 이동·학습지·결과 창 ok`);
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
