const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const {JSDOM,VirtualConsole}=require(path.join(root,'.test-tools/node_modules/jsdom'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
let count=0;for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(!/\bsrc=/.test(match[1])&&match[2].trim()){new vm.Script(match[2]);count++;}}
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html,{url:'https://school.invalid/study/index.html?view=classic',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
 w.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
 w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
 w.fetch=async url=>{const relative=String(url).split('?')[0].replace(/^\.\//,'');const file=path.resolve(root,relative);if(file.startsWith(root+path.sep)&&fs.existsSync(file)&&fs.statSync(file).isFile()){const text=fs.readFileSync(file,'utf8');return {ok:true,status:200,text:async()=>text,json:async()=>JSON.parse(text)};}return {ok:false,status:404,text:async()=>'',json:async()=>({})};};
}});
setTimeout(()=>{try{assert.equal(errors.length,0,errors.join('\n'));assert.ok(dom.window.document.querySelector('body'));console.log(`기존 관제탑: inline 문법 ${count}건 · jsdom errors=0`);}catch(e){console.error(e);process.exitCode=1;}finally{dom.window.close();}},1500);
