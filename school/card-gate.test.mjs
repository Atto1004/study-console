// 정역학 암기카드(객관식) 검사 (학교 화면). 실행: NODE_PATH=<jsdom 이 있는 node_modules> node school/card-gate.test.mjs
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const here = path.dirname(fileURLToPath(import.meta.url));
const dom = new JSDOM('<!doctype html><body></body>');
globalThis.window = dom.window; globalThis.document = dom.window.document;
const CARDS = process.env.CARDS || path.join(here, '..', 'docs', 'tools', 'lessons', 'cards', 'statics.json');
const raw = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
const fetcher = async () => ({ ok: true, json: async () => raw });
const { cardGate, cardsFor } = await import('./card-gate.js');
const engMod = await import('./card-engine.js');

let fail = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fail++; };
const tick = () => new Promise((r) => setTimeout(r, 0));
const btn = (t) => [...document.querySelectorAll('.card-gate-btn')].find((b) => b.textContent === t);
const open = () => !!document.querySelector('.card-gate');
const key = (k, target = window) => target.dispatchEvent(new window.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
const text = () => document.querySelector('.card-gate-body').textContent;
const title = () => document.querySelector('.card-gate-head b').textContent;
const prog = () => document.querySelector('.card-gate-prog').textContent;
const qText = () => document.querySelector('.card-gate-q').textContent;
const opts = () => [...document.querySelectorAll('.card-gate-opt')];
const allCards = [...raw.common, ...Object.values(raw.lectures).flatMap((l) => l.cards)];
const byQ = new Map(allCards.map((c) => [(c.mc.q || c.q), c]));
const cur = () => byQ.get(qText());
const rightBtn = () => opts().find((b) => b.textContent.startsWith(cur().mc.right));
const wrongBtn = () => opts().find((b) => !b.textContent.startsWith(cur().mc.right));
const optOrder = () => opts().map((b) => b.textContent).join('|');

// ---- 0) 카드 데이터: 모든 카드에 보기 4개(정답 1 + 오답 3), 서로 다름, 오답이 원문 정답과 같지 않음
const norm = (s) => String(s).normalize('NFKC').toLowerCase().replace(/[\s·,()\[\]{}:;'"]+/g, '');
ok(allCards.length === 35, '카드 35장');
ok(allCards.every((c) => c.mc && c.mc.right && c.mc.wrong.length === 3), '모든 카드에 정답 1 + 오답 3');
ok(allCards.every((c) => new Set([c.mc.right, ...c.mc.wrong].map(norm)).size === 4), '모든 카드의 보기 4개가 서로 다르다');
ok(allCards.every((c) => c.mc.wrong.every((w) => norm(w) !== norm(c.a))), '오답이 원문 정답과 같은 카드가 없다');
ok(allCards.every((c) => c.tip && c.tip.length > 5), '모든 카드에 기억 요령');

// ---- 1) 날짜 판정
ok(cardsFor(raw, '2026-09-16').state === 'gate', '9/16 (1강) 게이트');
ok(cardsFor(raw, '2026-09-14').state === 'free', '9/14 (2장 선수) 무게이트');
ok(cardsFor(raw, '2026-10-10').state === 'free', '10/10 (시험 대비) 무게이트');
const broken = structuredClone(raw); delete broken.lectures['1'].cards[0].mc;
ok(cardsFor(broken, '2026-09-16').state === 'error', '보기가 빠진 카드가 있으면 error (조용히 열지 않는다)');
const n16 = cardsFor(raw, '2026-09-16').cards.length;

// ---- 2) 엔진: 시드 재현 · 정답 위치 분포 · 직전과 다른 순서
const E1 = allCards.map((c) => engMod.optionsOf(c, 'S', 1).map((o) => o.text).join('|'));
const E2 = allCards.map((c) => engMod.optionsOf(c, 'S', 1).map((o) => o.text).join('|'));
ok(E1.join('#') === E2.join('#'), '같은 시드면 보기 순서가 같다 (재현 가능)');
ok(allCards.every((c) => engMod.optionsOf(c, 'S', 1).filter((o) => o.ok).length === 1), '어떤 시드에서도 정답 보기는 정확히 1개');
const pos = new Set(allCards.map((c) => engMod.optionsOf(c, 'S', 1).findIndex((o) => o.ok)));
ok(pos.size === 4, '정답 위치가 4곳 모두 나온다 (한 자리에 몰리지 않음)');
{ const c = allCards[0]; const a = engMod.optionsOf(c, 'S', 1).map((o) => o.text).join('\u0001'); const b = engMod.optionsOf(c, 'S', 2, a).map((o) => o.text).join('\u0001'); ok(a !== b, '다시 낼 때는 직전과 다른 순서'); }

// ---- 3) 열리고, 키로 판정 안 되고, Esc 는 닫기만
let p = cardGate('statics-2026-09-16', fetcher); await tick(); await tick();
ok(open() && title() === '암기카드 확인', '1강 수업 열 때 팝업이 뜬다');
ok(document.activeElement === document.querySelector('.card-gate-box'), '처음 포커스는 팝업 상자(버튼을 미리 누르지 않는다)');
ok(prog().startsWith('1 / ' + n16), '카드 ' + n16 + '장 진행 표시');
ok(opts().length === 4 && !!document.querySelector('.card-gate-unknown'), '보기 4개 + 몰라요 버튼');
ok(document.querySelector('.card-gate-unknown').textContent === '몰라요' && !opts().some((b) => b.textContent === '몰라요'), '몰라요는 보기와 다른 버튼');
const first = opts()[0]; first.focus();
const ev1 = new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }); first.dispatchEvent(ev1);
const ev2 = new window.KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }); first.dispatchEvent(ev2);
for (const k of ['1', '2', '3', '4', 'ArrowDown']) key(k);
ok(ev1.defaultPrevented && ev2.defaultPrevented, '버튼에 포커스가 있어도 Enter·Space 는 기본 동작이 막힌다');
ok(!document.querySelector('.card-gate-res') && prog().startsWith('1 / '), 'Enter·Space·숫자키로는 판정되지 않는다');
{ const bs = [...document.querySelectorAll('.card-gate button')]; bs[bs.length - 1].focus(); const t = new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }); bs[bs.length - 1].dispatchEvent(t);
  ok(t.defaultPrevented && document.activeElement === bs[0], 'Tab 은 팝업 안에서 돈다 (마지막 버튼 → 첫 버튼)'); }
ok((await cardGate('statics-2026-09-21', fetcher)) === false && document.querySelectorAll('.card-gate').length === 1, '팝업이 열려 있는 동안 다른 수업 게이트를 또 열지 않는다');
key('Escape'); ok((await p) === false && !open(), 'Esc 는 수업을 열지 않는다');

// ---- 4) 전체 흐름: 1번 몰라요, 2번 틀림, 나머지 맞힘 → 두 장만 외우기 → 다시 풀기 → 쓰기 확인
p = cardGate('statics-2026-09-16', fetcher); await tick(); await tick();
const first2 = []; const firstOrder = {};
for (let i = 0; i < n16; i++) {
  const c = cur(); firstOrder[c.id] = optOrder();
  if (i === 0) { document.querySelector('.card-gate-unknown').click(); first2.push(c.id); ok(document.querySelector('.card-gate-res').textContent === '몰라요', '몰라요 결과 표시'); ok(text().includes(c.mc.right) && !!document.querySelector('.card-gate-opt.ok'), '몰라요 뒤 정답을 보여 준다'); }
  else if (i === 1) { wrongBtn().click(); first2.push(c.id); ok(document.querySelector('.card-gate-res').textContent === '틀렸어요' && !!document.querySelector('.card-gate-opt.bad') && !!document.querySelector('.card-gate-opt.ok'), '틀림: 내 선택(빨강)과 정답(초록) 표시'); }
  else { rightBtn().click(); if (i === 2) ok(document.querySelector('.card-gate-res').textContent === '맞았어요', '맞음 표시'); }
  if (i === 2) { const snap = text(); opts()[0].click(); opts()[1].click(); ok(text() === snap, '답한 뒤 보기를 다시 눌러도 바뀌지 않는다'); }
  if (c.why && !/^확인 중/.test(c.why.hw) && i > 1) ok(text().includes(c.why.flow), '답하자마자 「왜」 설명을 보여 준다');
  btn('다음').click();
}
ok(title() === '외우기' && prog() === '1 / 2', '틀림·몰라요 2장만 외우기 화면');
ok(text().includes(byQ.get(qText()).a) && text().includes('요령'), '외우기: 정답과 요령');
btn('다음 카드').click(); ok(prog() === '2 / 2', '외우기 2/2'); ok(!!btn('다시 풀기'), '마지막 장은 「다시 풀기」');
btn('다시 풀기').click();
ok(title() === '암기카드 확인' && prog() === '1 / 2 · 2차', '그 2장만 다시 객관식 (2차)');
const again = []; for (let i = 0; i < 2; i++) { const c = cur(); again.push(c.id); ok(optOrder() !== firstOrder[c.id], '다시 낸 보기 순서는 처음과 다르다 ' + c.id); rightBtn().click(); btn('다음').click(); }
ok(again.slice().sort().join() === first2.slice().sort().join(), '다시 나온 카드 = 처음 못 맞힌 카드');
ok(title() === '써서 확인' && prog() === '1 / 2', '못 맞힌 적 있는 카드는 써서 확인');
const wq = qText(); const wc = allCards.find((c) => c.q === wq);
ok(!text().includes(wc.a) && !!btn('적었어요 · 정답 보기'), '쓰기 확인: 정답을 먼저 가리고 시작');
btn('적었어요 · 정답 보기').click(); ok(text().includes(wc.a), '정답 공개');
btn('틀렸어요').click();   // 첫 카드 쓰기 실패
ok(prog() === '2 / 2' && title() === '써서 확인', '쓰기 실패 뒤 다음 쓰기 카드로');
btn('적었어요 · 정답 보기').click(); btn('맞았어요').click();
ok(title() === '외우기' && prog() === '1 / 1', '쓰기에서 틀린 카드는 다시 외우기로');
btn('다시 풀기').click(); ok(title() === '암기카드 확인' && prog().startsWith('1 / 1'), '그 카드만 다시 객관식');
rightBtn().click(); btn('다음').click();
ok(title() === '써서 확인' && prog() === '1 / 1' && qText() === wq, '그 카드만 다시 써서 확인');
btn('적었어요 · 정답 보기').click(); ok(open(), '아직 열리지 않았다 (완료 전)'); btn('맞았어요').click();
ok(text().includes('모르던 카드 2개 · 다시 맞힘'), '끝 화면 한 줄: 모르던 카드 2개 · 다시 맞힘');
ok(text().includes('맞음 ' + (n16 - 2) + ' · 틀림 1 · 몰라요 1'), '처음 결과 요약');
let settled = false; p.then(() => { settled = true; }); await tick(); ok(!settled && open(), '「수업 열기」를 눌러야 열린다');
btn('수업 열기').click();
ok((await p) === true && !open(), '전부 통과하면 수업이 열린다');
ok((await cardGate('statics-2026-09-16', fetcher)) === true && !open(), '통과한 수업은 다시 묻지 않는다');

// ---- 5) 전부 처음부터 맞히면 외우기·쓰기 없이 끝
p = cardGate('statics-2026-09-21', fetcher); await tick(); await tick();
let guard = 0; while (title() === '암기카드 확인' && !btn('수업 열기') && guard++ < 50) { rightBtn().click(); btn('다음').click(); }
ok(text().includes('다 맞혔어요') && !text().includes('모르던'), '전부 맞힘: 외우기·쓰기 없이 끝 화면');
btn('수업 열기').click(); ok((await p) === true, '수업이 열린다');

// ---- 6) 닫기 후 다시 열면 처음부터 (상태 비저장), 무게이트 날짜
p = cardGate('statics-2026-09-23', fetcher); await tick(); await tick();
document.querySelector('.card-gate-unknown').click(); btn('다음').click(); btn('닫기').click();
ok((await p) === false && !open(), '닫기: 수업을 열지 않는다');
p = cardGate('statics-2026-09-23', fetcher); await tick(); await tick();
ok(prog().startsWith('1 / ') && title() === '암기카드 확인', '다시 열면 처음부터');
key('Escape'); await p;
ok((await cardGate('statics-2026-09-14', fetcher)) === true && !open(), '9/14 는 바로 열린다');
ok((await cardGate('em1-2026-09-16', fetcher)) === true && !open(), '다른 과목은 바로 열린다');

// ---- 7) 교실 인라인판 = 학교 모듈 (줄머리 export 를 뗀 같은 소스가 같은 결과)
const src = fs.readFileSync(path.join(here, 'card-engine.js'), 'utf8');
ok(!/^\s*import\b/m.test(src) && src.split('\n').filter((l) => !/^\s*\/\//.test(l) && /\bexport\b/.test(l)).every((l) => /^export (function|const) /.test(l)), '엔진은 줄머리 export function|const 만 쓴다');
const inl = new Function(src.replace(/^export /gm, '') + '\nreturn {createEngine,optionsOf};')();
function trace(mod, script) {
  const e = mod.createEngine(allCards.slice(0, 13), { seed: 'T' }); const t = []; let n = 0;
  while (e.view().kind !== 'done' && n++ < 400) {
    const v = e.view(); t.push(v.kind + ':' + v.card.id + ':' + (v.options || []).join('/'));
    if (v.kind === 'quiz') { const k = script(v, n); if (k < 0) e.unknown(); else e.pick(k); const a = e.view().answered; t.push('r:' + a.result); e.next(); }
    else if (v.kind === 'study') e.studied();
    else { e.reveal(); e.judge(n % 3 !== 0); }
  }
  return t.join('\n') + '\n' + JSON.stringify(e.summary());
}
const scr = (v, n) => (n % 5 === 0 ? -1 : n % 4 === 0 ? v.options.findIndex((t) => t !== v.card.mc.right) : v.options.indexOf(v.card.mc.right));
ok(trace(engMod, scr) === trace(inl, scr) && trace(inl, scr).includes('study:'), '학교 모듈과 교실 인라인판이 같은 답변에 같은 단계를 낸다');

console.log(fail ? '\n실패 ' + fail : '\n전부 통과'); process.exit(fail ? 1 : 0);
