import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from '../.test-tools/node_modules/jsdom/lib/api.js';
import {validExamPeriod,renderExamPeriodPlan} from './exam-period-plan.js';
const period={days:[{date:'2026-10-13',label:'오늘',focus:'정역학',events:[{start:'00:00',end:'24:00',title:'계획'}]}]};
test('없는 날짜·일정과 잘못된 시간을 읽기 화면에서 거부한다',()=>{
 assert.equal(validExamPeriod(period),true);
 for(const p of [null,{days:[]},{days:[null]},{days:[{date:'2026-10-13',label:'오늘'}]},{days:[{...period.days[0],events:[null]}]},{days:[{...period.days[0],events:[{start:'25:00',end:'26:00',title:'오류'}]}]}])assert.equal(validExamPeriod(p),false);
});
test('깨진 계획은 안내로 격리하고 정상 계획은 수행 기록과 구분해 그린다',async()=>{
 const dom=new JSDOM('<section></section>');const old={document:globalThis.document,fetch:globalThis.fetch,setInterval:globalThis.setInterval};
 globalThis.document=dom.window.document;globalThis.setInterval=()=>0;
 try{
  const host=dom.window.document.querySelector('section');
  globalThis.fetch=async()=>({ok:true,json:async()=>({examPeriod:{days:[{date:'2026-10-13',label:'오늘'}]}})});
  await renderExamPeriodPlan(host,'2026-10-13');assert.match(host.textContent,/형식을 확인/);
  host.replaceChildren();globalThis.fetch=async()=>({ok:true,json:async()=>({examPeriod:period})});
  await renderExamPeriodPlan(host,'2026-10-13');assert.match(host.textContent,/실제 수행 기록과 별도/);assert.match(host.textContent,/00:00–24:00/);
 }finally{Object.assign(globalThis,old);dom.window.close();}
});
