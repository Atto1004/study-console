// 강의실 10/9 검사(대표님 「공중에 안 뜨고 · 코드 텍스트 안 뜨게 · 풀기 전에 푸는 방법 · 하단 채팅 고정」) — 모의 서버(8797):
//  ① 문제 단계(공수1 9/2 q1, 개념 카드 ode.concept): 문제 → 「예제 하나 먼저」 → 단계 풀이 → 조심할 것 → 「직접 풀어 보세요」 순, 자막에 코드 글자 없음
//  ② 아이패드 가로·세로·폰: 스앵님 아래 끝 = 무대 바닥 ③ 아래 질문 칸이 늘 화면 안에 보임
const { chromium } = require('C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/.test-tools/node_modules/playwright');
const CODEY = /\\[a-zA-Z(\[\])]|\$|`|[{}]|\*\*/;
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const fail = []; const expect = (ok, m) => { if (!ok) fail.push(m); };
  for (const [w, h, tag] of [[1194, 834, 'ipad'], [834, 1194, 'port'], [390, 844, 'phone']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errors = []; p.on('pageerror', (e) => errors.push(e.message));
    await p.addInitScript(() => localStorage.setItem('school-setup', 'solo'));
    await fetch('http://127.0.0.1:8797/api/_reset', { method: 'POST' });
    await p.goto('http://127.0.0.1:8797/school/index.html?lesson=em1-2026-09-02&step=q1');
    await p.waitForFunction(() => document.querySelector('.school').dataset.mode === 'classroom', null, { timeout: 20000 });
    await p.waitForTimeout(1500);
    const seen = [];
    for (let i = 0; i < 16; i++) { const t = await p.evaluate(() => document.querySelector('.vn-sr')?.textContent || ''); if (t && seen.at(-1) !== t) seen.push(t); await p.locator('.v3-skip').click().catch(() => {}); await p.waitForTimeout(220); }
    if (tag === 'ipad') {
      const at = (re) => seen.findIndex((s) => re.test(s));
      const q = at(/가르는 기준/), ex = at(/예제 하나 먼저/), s1 = at(/^1단계:/), pit = at(/^조심할 것:/), go = at(/직접 풀어 보세요/);
      expect(q >= 0 && q < ex && ex < s1 && s1 < pit && pit < go, '풀이 방법 순서 ' + JSON.stringify(seen));
      expect(!seen.some((s) => CODEY.test(s)), '자막에 코드 글자 ' + JSON.stringify(seen.filter((s) => CODEY.test(s))));
    }
    const g = await p.evaluate(() => { const r = (q) => document.querySelector(q)?.getBoundingClientRect(); const t = r('.v3-stage .teacher'), s = r('#lectureStage'), c = r('#dialogue .v3-chat'); return { tb: t && t.height ? Math.round(t.bottom) : null, sb: Math.round(s.bottom), chat: c ? { top: Math.round(c.top), bottom: Math.round(c.bottom), h: Math.round(c.height) } : null, vh: innerHeight }; });
    expect(g.tb === null || Math.abs(g.tb - g.sb) <= 1, `${tag} 스앵님이 바닥에 안 붙음 ${JSON.stringify(g)}`);
    expect(g.chat && g.chat.h >= 40 && g.chat.bottom <= g.vh + 1, `${tag} 아래 질문 칸 ${JSON.stringify(g.chat)}`);
    expect(!errors.length, `${tag} 오류 ` + errors.join(' | '));
    await p.close();
  }
  console.log(fail.length ? 'FAIL ' + JSON.stringify(fail) : 'classroom howto: 문제 전 풀이 방법(예제·단계·조심할 것)·자막 코드 글자 없음·스앵님 바닥 고정·아래 질문 칸 ok');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
