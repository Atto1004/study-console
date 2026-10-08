// Run against the A mock server. This harness isolates the public 3D API from B's HUD.
const assert=require('node:assert/strict');
const {chromium,webkit,devices}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/.test-tools/node_modules/playwright');
const origin=process.env.SCHOOL_URL||'http://127.0.0.1:8798';
const fixture=`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0"><main class="school" data-mode="classroom"><div id="room"></div><div id="board"></div><input id="input"><dialog id="panel"></dialog><div id="chat" hidden></div></main><script type="module">
import {createSpace} from '/school/space.js';
window.events=[];window.fixed=null;window.addEventListener('school:viewrect',e=>events.push(e.detail));
window.space=createSpace({pause:async()=>{},status:m=>{throw Error(m)},panel:()=>document.body,view:()=>{},fixedView:()=>fixed,select:()=>{},screen:()=>{}});
window.ready=true;</script></body></html>`;
async function run(kind){
 const browser=kind==='chrome'?await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}):await webkit.launch();
 try{
 const context=await browser.newContext(kind==='chrome'?{viewport:{width:1040,height:918}}:{...devices['iPad Pro 11 landscape']});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route(origin+'/A-surface',r=>r.fulfill({contentType:'text/html',body:fixture}));
 await page.goto(origin+'/A-surface');await page.waitForFunction(()=>window.ready);
 assert.equal(await page.evaluate(()=>space.boardRect()),null);
 await page.evaluate(async()=>{space.saeng.lecture(true);await space.seated('정역학');});
 await page.waitForFunction(()=>space.boardRect()&&!document.querySelector('.school').classList.contains('view-moving'));
 const check=async kind=>{
   const g=await page.evaluate(()=>window.__schoolViewGeometry());
   const rect=g[kind+'Rect'],corners=g[kind];assert.ok(rect&&rect.w>0&&rect.h>0);
   for(const p of corners){assert.ok(Math.min(Math.abs(p.x-rect.x),Math.abs(p.x-rect.x-rect.w))<.01);assert.ok(Math.min(Math.abs(p.y-rect.y),Math.abs(p.y-rect.y-rect.h))<.01);}
   const size=await page.evaluate(()=>({width:innerWidth,height:innerHeight}));assert.ok(rect.x>=0&&rect.y>=0&&rect.x+rect.w<=size.width+.01&&rect.y+rect.h<=size.height+.01,JSON.stringify({kind,rect,size}));
   assert.equal(g.doors,1);assert.equal(g.seats,1);assert.equal(g.teacherVisible,true);return rect;
 };
 const board=await check('board');
 for(const name of ['정역학','미분적분학2','공업수학1','일반물리학2','CADD'])assert.equal(await page.evaluate(name=>space.setSubject(name),name),true);
 assert.equal(await page.evaluate(()=>space.setSubject('없는 과목')),false);
 await page.keyboard.press('s');await page.waitForFunction(()=>space.mode==='notebook'&&space.deskRect());const desk=await check('desk');
 await page.focus('#input');await page.keyboard.press('w');assert.equal(await page.evaluate(()=>space.mode),'notebook');
 await page.evaluate(()=>{document.activeElement.blur();document.querySelector('#panel').showModal();});await page.keyboard.press('w');assert.equal(await page.evaluate(()=>space.mode),'notebook');
 await page.evaluate(()=>document.querySelector('#panel').close());await page.keyboard.press('w');await page.waitForFunction(()=>space.mode==='lecture'&&space.boardRect());
 await page.evaluate(()=>{for(let i=0;i<20;i++)window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW',key:'w',repeat:true}));});assert.ok(await page.evaluate(()=>space.boardRect()),'held key must not restart the transition');
 await page.setViewportSize({width:500,height:900});await page.waitForTimeout(150);await check('board');
 await page.evaluate(()=>space.view('notebook'));await page.waitForFunction(()=>space.deskRect());await check('desk');
 await page.evaluate(()=>{fixed='lecture';space.refresh();});await page.waitForFunction(()=>space.mode==='lecture'&&space.boardRect());await page.keyboard.press('s');assert.equal(await page.evaluate(()=>space.mode),'lecture');
 await page.evaluate(()=>{fixed='paper';space.refresh();});await page.waitForFunction(()=>space.mode==='paper'&&space.boardRect());await check('board');await page.keyboard.press('s');assert.equal(await page.evaluate(()=>space.mode),'paper');
 await page.evaluate(()=>{fixed=null;space.saeng.point();space.saeng.lecture(false);space.hide();});assert.equal(await page.evaluate(()=>space.boardRect()),null);
 assert.deepEqual(errors,[]);assert.ok(await page.evaluate(()=>events.some(e=>e.board===null)&&events.some(e=>e.board&&e.view==='lecture')&&events.some(e=>e.desk&&e.view==='notebook')));
 console.log(JSON.stringify({kind,board,desk,checks:'geometry, subjects, keys, input, overlay, resize, fixed-view, events, hide',errors}));
 }finally{await browser.close();}
}
(async()=>{await run('chrome');await run('ipad');})().catch(e=>{console.error(e);process.exitCode=1;});
