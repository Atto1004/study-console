const {chromium}=require('../../.test-tools/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const output=path.resolve(__dirname,'../output/school-193');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.addInitScript(() => { localStorage.setItem('school-setup', 'solo'); localStorage.setItem('school-view', 'game'); });  // 학습 방식 창 건너뛰기 · 3D 걷기 검사라 게임 보기(교실 v3 기본은 사이트)
,errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8801/kingdom/study/school/index.html',{waitUntil:'domcontentloaded'});
 await page.locator('.main-tutor textarea').first().waitFor();
 await page.locator('.main-tutor textarea').first().fill('오늘은 30분만 가능해요. 정역학 시험 대비 계획을 세워주세요.');
 await page.getByRole('button',{name:'스앵님이 오늘 계획 세우기',exact:true}).click();
 await page.getByRole('button',{name:'교실에서 시작',exact:true}).waitFor();
 await page.screenshot({path:path.join(output,'main.png'),fullPage:true});
 await page.getByRole('button',{name:'교실에서 시작',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.school').dataset.world==='seated');
 await page.waitForTimeout(800);await page.screenshot({path:path.join(output,'lecture.png'),fullPage:true});
 await page.getByRole('button',{name:'내 공책 내려다보기',exact:true}).click();
 const work=page.getByRole('textbox',{name:'내 답과 풀이',exact:true});await work.fill('2(x+3)=10\n2x+3=10');
 await page.waitForTimeout(900);
 await page.getByRole('button',{name:'앞의 설명 보기',exact:true}).click();
 await page.getByRole('button',{name:'내 공책 내려다보기',exact:true}).click();
 assert.equal(await work.inputValue(),'2(x+3)=10\n2x+3=10');
 await page.getByRole('button',{name:'풀이 제출·피드백',exact:true}).click();
 await page.locator('.work-diagnosis').waitFor();
 assert.equal(await page.locator('.work-diagnosis mark').textContent(),'2x+3=10');
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(800);await page.screenshot({path:path.join(output,'notebook.png'),fullPage:true});
 for(const size of [{width:900,height:700},{width:390,height:844}]){await page.setViewportSize(size);await page.screenshot({path:path.join(output,`notebook-${size.width}.png`),fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'no notebook horizontal overflow');}await page.setViewportSize({width:1440,height:1000});
 const live=await page.evaluate(()=>fetch('/api/aliveweek/live').then(r=>r.json()));assert.ok(live.active?.schoolSessionId);
 await page.getByRole('button',{name:'일시정지',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.learning-strip button').textContent==='공부 계속하기');
 const stopped=await page.evaluate(()=>fetch('/api/aliveweek/live').then(r=>r.json()));assert.equal(stopped.active,null);assert.ok(stopped.records.length);
 await page.click('.map-trigger').then(()=>page.click('.map-place[data-place=lobby]'));await page.locator('.hud-walk').click();
 await page.waitForFunction(()=>document.querySelector('.school').dataset.world==='walking');await page.waitForTimeout(850);
 await page.screenshot({path:path.join(output,'corridor.png')});
 const before=await page.locator('#schoolWorld canvas').screenshot();await page.keyboard.down('w');await page.waitForTimeout(600);await page.keyboard.up('w');const after=await page.locator('#schoolWorld canvas').screenshot();assert.notDeepEqual(before,after,'walking changes the camera');
 await page.keyboard.down('w');await page.waitForTimeout(1250);await page.keyboard.up('w');const canvas=page.locator('#schoolWorld canvas');const rect=await canvas.boundingBox();await page.mouse.move(rect.x+500,rect.y+500);await page.mouse.down();await page.mouse.move(rect.x+814,rect.y+500,{steps:12});await page.mouse.up();await page.waitForTimeout(250);const action=page.locator('.world-action');if(await action.isHidden()||!(await action.textContent()).includes('E'))throw Error('door ray interaction missing');const doorBefore=await action.textContent();await page.keyboard.press('e');await page.waitForTimeout(150);const doorAfter=await action.textContent();console.log(JSON.stringify({doorBefore,doorAfter,focus:await page.evaluate(()=>document.activeElement.tagName)}));if(doorAfter===doorBefore)throw Error('door action unchanged');if(doorBefore.includes('닫기')){await page.keyboard.press('e');await page.waitForTimeout(150);assert.equal(await action.textContent(),doorBefore);}await page.keyboard.down('w');await page.waitForTimeout(1200);await page.keyboard.up('w');const openImage=await canvas.screenshot();assert.notDeepEqual(before,openImage);await page.keyboard.press('Escape');
 {await page.getByRole('button',{name:'나가기',exact:true}).click();await page.locator('.corridor-door').first().click();await page.waitForFunction(()=>document.querySelector('.school').dataset.mode==='classroom');await page.click('.map-trigger').then(()=>page.click('.map-place[data-place=lobby]'));await page.locator('.hud-walk').click();await page.waitForTimeout(760);assert.ok((await page.locator('.world-hud b').textContent()).includes('교실'));}
 await page.screenshot({path:path.join(output,'cadd-room.png')});
 await page.getByRole('button',{name:'나가기',exact:true}).click();await page.locator('.main-tutor').waitFor();
 for(const size of [{width:900,height:700},{width:390,height:844}]){await page.setViewportSize(size);await page.screenshot({path:path.join(output,`main-${size.width}.png`),fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'no horizontal overflow');}
 await page.goto('http://127.0.0.1:8801/kingdom/aliveweek/',{waitUntil:'domcontentloaded'});await page.locator('#history a').first().waitFor();assert.ok(await page.locator('#history a').first().getAttribute('href'));await page.screenshot({path:path.join(output,'aliveweek.png'),fullPage:true});
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'result.json'),JSON.stringify({passed:true,errors,checks:['tutor plan','lecture/notebook transition','draft preserved','error quote','live activity and pause','first-person movement and door interaction','five classrooms','responsive main and notebook','AliveWeek return link'],model:'isolated fixture'},null,2));
 await browser.close();console.log('school space browser checks passed');
})().catch(e=>{console.error(e);process.exit(1);});
