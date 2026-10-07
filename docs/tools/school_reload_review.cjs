const {chromium}=require('../../.test-tools/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>console.log(m.text()));
await page.addInitScript(()=>{addEventListener('DOMContentLoaded',()=>new MutationObserver(()=>console.log('status:',document.getElementById('status').textContent)).observe(document.getElementById('status'),{childList:true,subtree:true}));});
await page.goto('http://127.0.0.1:8801/kingdom/study/school/index.html');
await page.waitForFunction(()=>!document.querySelector('.school').dataset.booting);
assert.equal(new URL(page.url()).searchParams.get('room'),'main');
for(const [id,room,mode] of [['materialsArea','materials','workspace'],['progressArea','progress','workspace'],['attendanceArea','attendance','workspace'],['assignmentArea','assignments','assignments'],['learningArea','learning','lobby'],['mainArea','main','workspace']]){
 await page.locator('#'+id).click();await page.waitForFunction(room=>new URL(location.href).searchParams.get('room')===room,room);
 for(let i=0;i<2;i++){console.log('reload '+room+' '+i+' '+page.url());await page.reload({waitUntil:'domcontentloaded'});try{await page.waitForFunction(()=>!document.querySelector('.school').dataset.booting);}catch(e){console.log(await page.evaluate(()=>({status:document.querySelector('#status').textContent,mode:document.querySelector('.school').dataset.mode,boot:document.querySelector('.school').dataset.booting})),errors);throw e;}assert.equal(new URL(page.url()).searchParams.get('room'),room);assert.equal(await page.locator('.school').getAttribute('data-mode'),mode);}
}
await page.getByRole('textbox',{name:'오늘 상황',exact:true}).fill('30분 계획');await page.getByRole('button',{name:'스앵님이 오늘 계획 세우기',exact:true}).click();
await page.getByRole('button',{name:'교실에서 시작',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.school').dataset.world==='seated');
await page.getByRole('button',{name:'내 공책 내려다보기',exact:true}).click();
const work=page.getByRole('textbox',{name:'내 답과 풀이',exact:true});await work.fill('새로고침 전 풀이');await page.waitForTimeout(1000);
const target=new URL(page.url()).searchParams,id=await page.evaluate(()=>fetch('/api/school/session').then(r=>r.json()).then(s=>s.id));
for(let i=0;i<2;i++){
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!document.querySelector('.school').dataset.booting);
 assert.equal(new URL(page.url()).searchParams.get('lesson'),target.get('lesson'));assert.equal(new URL(page.url()).searchParams.get('step'),target.get('step'));assert.equal(await page.locator('.school').getAttribute('data-view'),'notebook');assert.equal(await work.inputValue(),'새로고침 전 풀이');
 assert.equal(await page.evaluate(()=>fetch('/api/school/session').then(r=>r.json()).then(s=>s.id)),id);
}
await page.getByRole('button',{name:'자리에서 일어나기',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.school').dataset.world==='walking');
for(let i=0;i<2;i++){await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!document.querySelector('.school').dataset.booting);assert.equal(await page.locator('.school').getAttribute('data-world'),'walking');assert.equal(new URL(page.url()).searchParams.get('subject'),'정역학');}
assert.deepEqual(errors,[]);console.log('Reload GREEN: six areas × two reloads; notebook draft/step/camera/session retained; classroom walking × two reloads; no page errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
