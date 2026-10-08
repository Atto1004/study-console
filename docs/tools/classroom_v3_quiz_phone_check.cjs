// 교실 v3 보기·폰 검사(10/8): 문제 단계 q1 → 강의 넘김 → 보기 A~D 배지·2열(1040)/1열(390)·셀 채움, 폰은 머리줄 한 줄·칠판 전체 폭·세 칸 겹침 없음·가로 스크롤 없음
// 사용: node docs/tools/classroom_v3_quiz_phone_check.cjs [http://127.0.0.1:8797]
const path = require('path');
const { chromium } = require(path.join(__dirname, '../../.test-tools/node_modules/playwright'));
const BASE = process.argv[2] || 'http://127.0.0.1:8797';
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true }); const fail = []; const out = {};
  for (const vp of [{ width: 1040, height: 918 }, { width: 390, height: 844 }]) {
    const p = await b.newPage({ viewport: vp }); const errors = []; p.on('pageerror', (e) => errors.push(e.message));
    await p.addInitScript(() => { localStorage.setItem('school-setup', 'solo'); localStorage.setItem('school-view', 'site'); });
    await p.goto(BASE + '/school/index.html?lesson=em1-2026-09-02&step=q1');
    await p.waitForFunction(() => document.querySelector('.school').dataset.mode === 'classroom', null, { timeout: 20000 }); await p.waitForTimeout(800);
    for (let i = 0; i < 30 && (await p.evaluate(() => document.querySelector('.school').dataset.lecture)) !== 'ended'; i++) { await p.click('.v3-skip'); await p.waitForTimeout(100); }
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => {
      const R = (s) => document.querySelector(s).getBoundingClientRect(); const bs = [...document.querySelectorAll('#choices > button[data-opt]')];
      const ch = R('#choices'); const cols = getComputedStyle(document.getElementById('choices')).gridTemplateColumns.split(' ').length;
      return { n: bs.length, opt: bs.map((x) => x.dataset.opt).join(''), cols, fill: bs.length ? Math.min(...bs.map((x) => x.getBoundingClientRect().width)) / (ch.width / cols) : 0,
        header: Math.round(R('.school > header').height), board: Math.round(R('#board').width), stage: Math.round(R('#lectureStage').width),
        workBottom: Math.round(R('#workZone').bottom), dlgTop: Math.round(R('#dialogue').top), hscroll: document.scrollingElement.scrollWidth > innerWidth + 1 };
    });
    const k = vp.width; out[k] = { ...r, errors };
    if (r.n !== 4 || r.opt !== 'ABCD') fail.push(k + ': 보기 배지 ' + r.opt);
    if (r.cols !== (k > 640 ? 2 : 1)) fail.push(k + ': 보기 열 ' + r.cols);
    if (r.fill < 0.9) fail.push(k + ': 보기 카드가 칸을 못 채움 ' + r.fill.toFixed(2));
    if (r.workBottom > r.dlgTop + 1) fail.push(k + ': 문제 칸이 대화 칸과 겹침');
    if (r.hscroll) fail.push(k + ': 가로 스크롤');
    if (k <= 640 && (r.header > 90 || r.board < r.stage * 0.85)) fail.push(k + ': 폰 머리줄/칠판 폭 ' + r.header + '/' + r.board);
    if (errors.length) fail.push(k + ': 오류 ' + errors[0]);
    await p.close();
  }
  console.log(JSON.stringify({ out, fail })); await b.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
