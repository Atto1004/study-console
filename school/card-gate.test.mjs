// 정역학 암기카드 팝업 검사 (학교 화면). 실행: NODE_PATH=<jsdom 경로> node school/card-gate.test.mjs
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><body></body>');
globalThis.window = dom.window; globalThis.document = dom.window.document;
const CARDS = process.env.CARDS || 'C:/Users/user/Desktop/아톰OS/기술실/study-console/docs/tools/lessons/cards/statics.json';
const raw = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
const fetcher = async () => ({ ok: true, json: async () => raw });
const { cardGate, cardsFor } = await import('./card-gate.js');

let fail = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fail++; };
const tick = () => new Promise((r) => setTimeout(r, 0));
const btn = (t) => [...document.querySelectorAll('.card-gate-btn')].find((b) => b.textContent === t);
const open = () => !!document.querySelector('.card-gate');
const key = (k) => window.dispatchEvent(new window.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

// 날짜 판정
ok(cardsFor(raw, '2026-09-16').state === 'gate', '9/16 (1강) 게이트');
ok(cardsFor(raw, '2026-09-14').state === 'free', '9/14 (2장 선수) 무게이트');
ok(cardsFor(raw, '2026-10-10').state === 'free', '10/10 (시험 대비) 무게이트');
const n16 = cardsFor(raw, '2026-09-16').cards.length;

// 1) 열리고, Enter 로는 통과 안 되고, Esc 는 닫기만
let p = cardGate('statics-2026-09-16', fetcher); await tick(); await tick();
ok(open(), '1강 수업 열 때 팝업이 뜬다');
ok(document.querySelector('.card-gate-prog').textContent.startsWith('1 / ' + n16), '카드 ' + n16 + '장 진행 표시');
btn('정답 보기').click(); key('Enter');
ok(open() && document.querySelector('.card-gate-prog').textContent.startsWith('1 / '), 'Enter 로 판정되지 않는다');
key('Escape'); ok((await p) === false && !open(), 'Esc 는 수업을 열지 않는다');

// 2) 1장 틀리고 나머지 맞힘 → 틀린 1장만 다시 → 맞히면 열림
p = cardGate('statics-2026-09-16', fetcher); await tick(); await tick();
for (let i = 0; i < n16; i++) { btn('정답 보기').click(); btn(i === 0 ? '틀렸어요' : '맞았어요').click(); }
ok(document.querySelector('.card-gate-body').textContent.includes('틀린 카드 1개만'), '틀린 카드만 다시 출제');
btn('다시 보기').click();
ok(document.querySelector('.card-gate-prog').textContent.startsWith('1 / 1'), '다시 출제는 1장');
btn('정답 보기').click();
const why = btn('왜 외우나?'); ok(!!why, '「왜 외우나?」 버튼이 있다'); why?.click(); ok(document.querySelector('.card-gate-body').textContent.includes('과제'), '「왜 외우나?」를 누르면 과제 설명이 펼쳐진다');
btn('맞았어요').click();
ok((await p) === true && !open(), '전부 맞히면 수업이 열린다');

// 3) 같은 화면에서 이미 통과한 수업은 다시 묻지 않음, 무게이트 날짜는 바로 열림
ok((await cardGate('statics-2026-09-16', fetcher)) === true && !open(), '통과한 수업은 다시 묻지 않는다');
ok((await cardGate('statics-2026-09-14', fetcher)) === true && !open(), '9/14 는 바로 열린다');
ok((await cardGate('em1-2026-09-16', fetcher)) === true && !open(), '다른 과목은 바로 열린다');

console.log(fail ? '\n실패 ' + fail : '\n전부 통과'); process.exit(fail ? 1 : 0);
