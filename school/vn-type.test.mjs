// 대사창 한 글자씩 쓰기 검사. 실행: NODE_PATH=<jsdom 이 있는 node_modules> node school/vn-type.test.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
let fail = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fail++; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const dom = new JSDOM('<!doctype html><body><div class="v3-msg"><p>안녕하세요 반갑습니다</p></div></body>');
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.matchMedia = () => ({ matches: false });
const { typeInto } = await import('./vn-type.js');
const row = () => document.querySelector('.v3-msg'), p = () => row().querySelector('p');
const FULL = '안녕하세요 반갑습니다';
let done = 0; const t = typeInto(p(), () => done++);
ok(t.active && p().textContent === FULL, '쓰는 중에도 p 의 전체 글자는 그대로(보이는 앞부분 + 투명한 뒷부분) — 줄 바꿈이 흔들리지 않음');
ok(p().querySelectorAll('[aria-hidden=true]').length === 2 && row().querySelector('.vn-sr')?.textContent === FULL, '쓰는 칸은 aria-hidden, 읽어 주는 도구에는 전체를 한 번만(.vn-sr)');
await wait(120);
ok(p().querySelector('span:first-child').textContent.length > 0 && p().querySelector('span:first-child').textContent.length < FULL.length, '한 글자씩 늘어남');
t.finish(); ok(!t.active && p().textContent === FULL && p().children.length === 0 && !row().querySelector('.vn-sr') && done === 1, 'finish: 전체 글자·단일 텍스트로 복원, .vn-sr 제거, 끝 콜백 한 번');
t.finish(); ok(done === 1, 'finish 를 또 불러도 콜백은 한 번');
// 쓰는 중에 p 가 다른 글로 바뀌면(페이지 다시 나눔) 조용히 끝
row().querySelector('p').textContent = FULL; let d2 = 0; const t2 = typeInto(p(), () => d2++); p().textContent = '나뉜 앞부분'; await wait(80);
ok(!t2.active && d2 === 1 && p().textContent === '나뉜 앞부분', '구조가 깨지면 끝낸 것으로 보고 새 글을 덮어쓰지 않음');
// 움직임 줄이기: 바로 끝
globalThis.matchMedia = () => ({ matches: true }); p().textContent = FULL; let d3 = 0; const t3 = typeInto(p(), () => d3++);
ok(!t3.active && d3 === 1 && p().textContent === FULL && !row().querySelector('.vn-sr'), '움직임 줄이기: 바로 다 보이고 끝');
console.log(fail ? `\n실패 ${fail}` : '\n전부 통과'); process.exit(fail ? 1 : 0);
