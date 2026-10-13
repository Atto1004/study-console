// 강의실 왼쪽 서랍 검사. 실행: NODE_PATH=<jsdom 이 있는 node_modules> node school/class-drawer.test.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { JSDOM } = require('jsdom');
let fail = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fail++; };
const tick = () => new Promise((r) => setTimeout(r, 20));
const dom = new JSDOM(`<!doctype html><body>
<div class="school tablet-layout" data-mode="classroom" data-view3="site">
  <main id="scene"><div id="room"><section id="workZone" class="v3-work"><div class="lesson-textbook">교재</div></section><aside class="lecture-quests" hidden>도전</aside></div></main>
  <section class="subject-context"><strong>정역학</strong><section class="subject-textbook-toc"><div class="lesson-textbook-contents"><button>1</button></div></section></section>
</div></body>`, { pretendToBeVisual: true });
const { window } = dom; globalThis.window = window; globalThis.document = window.document; globalThis.MutationObserver = window.MutationObserver;
const { mountClassDrawer } = await import('./class-drawer.js');
const school = document.querySelector('.school');
const api = mountClassDrawer();
const drawer = document.querySelector('.class-drawer'), tab = document.querySelector('.class-drawer-tab'), scrim = document.querySelector('.class-drawer-scrim');
const inSlot = (sel, slot) => document.querySelector(sel)?.parentElement?.dataset.slot === slot;
ok(!!api && !!drawer && !!tab, '서랍·탭 생성');
ok(inSlot('.lecture-quests', 'quests') && inSlot('.subject-context', 'toc') && inSlot('#workZone', 'book'), '수업 도전·교재 목차·수업교재가 서랍 칸으로 옮겨짐');
ok(drawer.hidden && scrim.hidden && school.dataset.drawer === 'closed' && !tab.hidden, '처음엔 닫힘, 탭은 보임');
ok(document.querySelector('[data-slot=quests]').hidden && !document.querySelector('[data-slot=toc]').hidden, '숨겨진 수업 도전 칸은 접힘');
tab.click(); ok(!drawer.hidden && !scrim.hidden && school.dataset.drawer === 'open' && tab.getAttribute('aria-expanded') === 'true', '탭을 누르면 열림');
ok(document.activeElement === document.querySelector('.class-drawer-close') && drawer.tabIndex === -1, '열면 닫기 버튼으로 초점이 옮겨짐');
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' })); ok(drawer.hidden && school.dataset.drawer === 'closed', 'Esc 로 닫힘');
ok(document.activeElement === tab, '닫으면 탭으로 초점이 돌아옴');
tab.click(); scrim.dispatchEvent(new window.Event('pointerdown', { bubbles: true, cancelable: true })); ok(drawer.hidden, '바깥(스크림)을 누르면 닫힘');
tab.click(); document.querySelector('.class-drawer-close').click(); ok(drawer.hidden, '닫기 버튼으로 닫힘');
tab.click(); document.querySelector('.subject-textbook-toc button').click(); await new Promise((r) => setTimeout(r, 200)); ok(drawer.hidden, '교재 목차에서 고르면 서랍이 닫혀 칠판을 본다');
document.querySelector('.lecture-quests').hidden = false; await tick(); ok(!document.querySelector('[data-slot=quests]').hidden, '수업 도전이 나중에 보이게 되면 칸이 열림');
// 태블릿 레이아웃이 꺼지면(데스크톱 폭) 원래 자리로
tab.click(); school.classList.remove('tablet-layout'); await tick();
ok(document.querySelector('#workZone').parentElement.id === 'room' && document.querySelector('.lecture-quests').parentElement.id === 'room', '태블릿 레이아웃이 꺼지면 수업교재·수업 도전이 #room 으로 복귀');
ok(document.querySelector('.subject-context').parentElement === school, '현재 수업 위치(교재 목차)는 .school 로 복귀');
ok(tab.hidden && drawer.hidden && !school.hasAttribute('data-drawer'), '탭과 서랍 숨김');
school.classList.add('tablet-layout'); await tick();
ok(inSlot('#workZone', 'book') && !tab.hidden, '다시 켜지면 서랍으로 들어감');
ok(mountClassDrawer() === null && document.querySelectorAll('.class-drawer').length === 1, '두 번 불러도 서랍은 하나');
console.log(fail ? `\n실패 ${fail}` : '\n전부 통과'); process.exit(fail ? 1 : 0);
