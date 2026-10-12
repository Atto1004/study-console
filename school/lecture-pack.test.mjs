import test from 'node:test';
import assert from 'node:assert/strict';
import {packRoute,packLines} from './lecture-pack.js';
test('깨진 강의안은 오류 없이 기존 수업 경로로 돌아간다',()=>{
 for(const pack of [null,{sections:[null]},{sections:[null],goals:[]},{sections:[{}],goals:[]},{sections:[{script:{a:[]},check:'b'}],goals:[],worksheet:{} }])assert.equal(packRoute(pack,[{id:'a'},{id:'b'}]),null);
 assert.deepEqual(packRoute({sections:[{script:{a:[]},check:'b'}],goals:[],worksheet:[]},[{id:'a'},{id:'b'}]),[0,1]);
});
test('대사·회상은 실제 대사 배열이어야 하며 정상 판서는 펼쳐 읽는다',()=>{
 const base={sections:[{script:{a:[{say:'힘을 그려요'}]},check:'b'}],goals:['힘을 그린다'],worksheet:[]};const steps=[{id:'a'},{id:'b'}];
 assert.deepEqual(packRoute(base,steps),[0,1]);assert.ok(packLines(base,'a').some(l=>l.say==='힘을 그려요'));
 for(const value of [{},'대사',null,[{}],[null]])assert.equal(packRoute({...base,sections:[{script:{a:value},check:'b'}]},steps),null);
 for(const recap of [{},'회상',[{}],[null]])assert.equal(packRoute({...base,recap},steps),null);
});
