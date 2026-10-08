// 교실 v3 아이패드(WebKit iPad Pro 11 가로·세로) 확인: 시작 자동 재생 · 세 칸 겹침 없음 · 탭으로 ⏸/⏭ · 강의 끝 확인 질문 · 게임 보기 3D
const { webkit, devices } = require('C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/.test-tools/node_modules/playwright');
const OUT = 'C:/Users/user/.claude/jobs/a132f963/tmp/';
(async () => {
  const b = await webkit.launch();
  const all = {};
  for (const [name, dev] of [['land', devices['iPad Pro 11 landscape']], ['port', devices['iPad Pro 11']]]) {
    for (const view of ['site', 'game']) {
      const ctx = await b.newContext({ ...dev }); const p = await ctx.newPage();
      const errors = []; p.on('pageerror', (e) => errors.push(e.message));
      const fail = []; const expect = (ok, m) => { if (!ok) fail.push(m); };
      await p.addInitScript((v) => { localStorage.setItem('school-setup', 'solo'); localStorage.setItem('school-view', v); }, view);
      await p.goto('http://127.0.0.1:8797/school/index.html?lesson=' + encodeURIComponent('session:CADD:2026-09-08'));
      await p.waitForFunction(() => document.querySelector('.school').dataset.mode === 'classroom', null, { timeout: 20000 });
      await p.waitForTimeout(view === 'game' ? 6000 : 1200);
      const st = await p.evaluate(() => {
        const R = (id) => { const e = document.getElementById(id); const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) }; };
        const sc = document.scrollingElement; const btns = [...document.querySelectorAll('.v3-bar button, .v3-bar summary, .v3-chat button')].map((x) => { const r = x.getBoundingClientRect(); return Math.round(Math.min(r.width, r.height)); });
        const bd = document.getElementById('board').getBoundingClientRect(), su = document.getElementById('subtitle').getBoundingClientRect(), stg = document.getElementById('lectureStage').getBoundingClientRect();
        const ov = Math.max(0, Math.min(bd.right, su.right) - Math.max(bd.left, su.left)) * Math.max(0, Math.min(bd.bottom, su.bottom) - Math.max(bd.top, su.top));
        const strays = [...document.querySelectorAll('#workZone button, #workZone label')].filter((x) => x.getClientRects().length && getComputedStyle(x).position !== 'static').map((x) => (x.getAttribute('aria-label') || x.textContent).slice(0, 15));
        return { boardH: Math.round(bd.height), stageH: Math.round(stg.height), subOverBoard: Math.round(ov), strays, lecture: document.querySelector('.school').dataset.lecture, sub: !document.getElementById('subtitle').hidden, stage: R('lectureStage'), work: R('workZone'), dlg: R('dialogue'), vh: innerHeight, hscroll: sc.scrollWidth > innerWidth + 1, minBtn: Math.min(...btns), world: document.querySelector('.school').dataset.world };
      });
      expect(st.lecture === 'playing' && st.sub, '시작 자동 재생 아님');
      expect(st.stage.bottom <= st.work.top + 1 && st.work.bottom <= st.dlg.top + 1 && st.dlg.bottom <= st.vh + 1, '세 칸 겹침/화면 밖 ' + JSON.stringify(st));
      expect(st.work.h <= 120, '강의 중 가운데 칸이 큼 ' + st.work.h);
      if (view === 'site') expect(st.boardH >= st.stageH * 0.5, '칠판이 강의 칸의 절반보다 작음 ' + st.boardH + '/' + st.stageH);
      expect(st.subOverBoard < 2000, '자막이 칠판을 덮음 ' + st.subOverBoard);
      expect(!st.hscroll, '가로 스크롤 생김');
      expect(st.minBtn >= 44, '버튼 44px 미만 ' + st.minBtn);
      if (view === 'game') {
        expect(st.world === 'seated', '게임 보기인데 3D 착석 안 됨');
        const sd = await p.evaluate(() => { const n = document.querySelector('.seat-controls'), s = document.getElementById('lectureStage').getBoundingClientRect(), r = n.getBoundingClientRect(); return { pos: getComputedStyle(n).position, dx: r.left - s.left, dy: r.top - s.top }; });
        expect(sd.pos === 'absolute' && sd.dx < 30 && sd.dy < 30, '일어나기 버튼이 강의 칸 왼쪽 위가 아님 ' + JSON.stringify(sd));
      }
      await p.screenshot({ path: OUT + `ipad-${name}-${view}.png` });
      await p.locator('.v3-play').tap(); await p.waitForTimeout(300);
      const paused = await p.evaluate(() => document.querySelector('.school').dataset.lecture); expect(paused === 'paused', '탭 ⏸ 안 됨');
      for (let i = 0; i < 30 && (await p.evaluate(() => document.querySelector('.school').dataset.lecture)) !== 'ended'; i++) { await p.locator('.v3-skip').tap(); await p.waitForTimeout(120); }
      await p.waitForTimeout(500);
      const end = await p.evaluate(() => ({ tutor: document.getElementById('dialogue').dataset.tutor, form: !document.querySelector('#workZone form')?.hidden }));
      expect(end.tutor === 'check' && end.form, '강의 끝 확인 질문 없음 ' + JSON.stringify(end));
      const endSz = await p.evaluate(() => ({ work: Math.round(document.getElementById('workZone').getBoundingClientRect().height), board: Math.round(document.getElementById('board').getBoundingClientRect().height) }));
      expect(endSz.work >= 150, '강의 끝 뒤 가운데 칸 작음 ' + endSz.work); if (view === 'site') expect(endSz.board >= 120, '강의 끝 뒤 칠판 줄어듦 ' + endSz.board);
      await p.locator('#tutorInput').tap(); await p.waitForTimeout(400);
      const kb = await p.evaluate(() => ({ focus: document.activeElement?.id, inView: (() => { const r = document.getElementById('tutorInput').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; })() }));
      expect(kb.focus === 'tutorInput' && kb.inView, '답 칸 탭 안 됨/화면 밖');
      await p.screenshot({ path: OUT + `ipad-${name}-${view}-end.png` });
      all[name + '-' + view] = { st, fail, errors };
      await ctx.close();
    }
  }
  console.log(JSON.stringify(all, null, 1)); await b.close();
  process.exit(Object.values(all).some((x) => x.fail.length || x.errors.length) ? 1 : 0);
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
