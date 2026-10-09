// 기본 캐릭터 뼈대 검사(rig.js, 오타 검수 10/9): 스킨 왕복 교체 · 표정 부위는 parts 로 못 바꿈 · 표정별 그림(expr) · 말하기 입 그림(talk)
const { chromium } = require('C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/.test-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const p = await b.newPage({ viewport: { width: 600, height: 500 } });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  await p.goto('http://127.0.0.1:8797/docs/demo/rig.html'); await p.waitForTimeout(500);
  const r = await p.evaluate(async () => {
    const { createRig } = await import('/school/rig.js');
    const host = document.createElement('div'); host.style.cssText = 'width:120px;height:180px'; document.body.append(host);
    const rig = createRig(host);
    const img = (c) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="${c}"/></svg>`);
    const vis = (part) => [...rig.el.querySelectorAll(`[data-part="${part}"]`)].every((x) => x.style.visibility !== 'hidden');
    const imgs = (kind) => rig.el.querySelectorAll(`image[data-skin${kind ? `="${kind}"` : ''}]`).length;
    const out = {};
    rig.setSkin({ parts: { face: img('red') } }); out.faceSwapped = !vis('face') && imgs('part') === 1;
    rig.setSkin({}); out.faceBack = vis('face') && imgs() === 0;
    rig.setSkin({ parts: { mouth: img('blue') } }); out.mouthRefused = vis('mouth') && imgs() === 0;
    rig.setSkin({ expr: { smile: { mouth: img('green'), eye: img('green') } } });
    rig.setExpr('smile'); out.exprOn = imgs('expr') === 3 && !vis('mouth') && !vis('eye');   // 눈 2 + 입 1
    rig.setExpr('neutral'); out.exprOff = imgs('expr') === 0 && vis('mouth') && vis('eye');
    rig.setSkin({ talk: { mouth: [img('#111'), img('#999')] } }); rig.setExpr('neutral');
    rig.speak('말하는 중이에요'); await new Promise((res) => setTimeout(res, 300)); out.talking = imgs('talk') === 1 && !vis('mouth');
    await new Promise((res) => setTimeout(res, 1600)); out.talkDone = imgs('talk') === 0 && vis('mouth');
    rig.setSkin({ parts: { face: img('red') } }); rig.setSkin({ parts: { face: img('blue') } }); out.noStack = imgs('part') === 1;
    // 말하는 중 스킨 교체 → 다음 입 프레임에 새 말하기 그림 1개
    rig.setSkin({ talk: { mouth: [img('#111'), img('#999')] } }); rig.speak('말하는 중에 스킨을 바꿔 봐요 계속 말해요');
    await new Promise((res) => setTimeout(res, 250)); rig.setSkin({ talk: { mouth: [img('#f00'), img('#0f0')] } });
    await new Promise((res) => setTimeout(res, 250)); out.talkAfterSkin = imgs('talk') === 1 && /f00|0f0/.test(decodeURIComponent(rig.el.querySelector('image[data-skin=talk]')?.getAttribute('href') || ''));
    return out;
  });
  const fail = Object.entries(r).filter(([, v]) => !v).map(([k]) => k);
  if (errors.length) fail.push('오류 ' + errors.join('|'));
  console.log(JSON.stringify(r));
  console.log(fail.length ? 'FAIL ' + JSON.stringify(fail) : 'rig: 스킨 왕복·표정 부위 거부·표정별 그림·말하기 입 그림·겹침 없음 ok');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
