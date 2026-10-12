import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from '../.test-tools/node_modules/jsdom/lib/api.js';
import { createLessonTextbook } from './lesson-textbook.js';

test('원자료 끝의 확인 문제도 강의안에서 연결한 단원 교재를 표시한다',()=>{
  const dom = new JSDOM('<body></body>');
  globalThis.document = dom.window.document;
  const book = createLessonTextbook();
  const lesson = {id:'test-lesson',course:'미분적분학2',steps:[
    {id:'a',title:'법선벡터',kind:'understand',body:'계수로 법선을 구합니다.'},
    {id:'b',title:'사잇각',kind:'understand',body:'내적으로 각을 구합니다.'},
    {id:'qa',title:'확인 문제',kind:'check',options:['A','B']},
    {id:'qb',title:'확인 문제',kind:'check',options:['A','B']}
  ]};
  const pack = {lessonId:lesson.id,sections:[
    {script:{a:[]},check:'qa'}, {script:{b:[]},check:'qb'}
  ]};
  book.render(lesson,2,pack);
  assert.equal(book.el.querySelector('h3').textContent,'법선벡터');
  assert.match(book.el.querySelector('.lesson-textbook-body').textContent,/계수로/);
  assert.doesNotMatch(book.el.querySelector('.lesson-textbook-body').textContent,/내적으로/);
  book.render(lesson,3,pack);
  assert.equal(book.el.querySelector('h3').textContent,'사잇각');
  book.render(lesson,2,{...pack,lessonId:'other'});
  assert.equal(book.el.querySelector('h3').textContent,'사잇각');
  book.render(lesson,0,pack);
  assert.equal(book.el.querySelector('h3').textContent,'법선벡터');
});
