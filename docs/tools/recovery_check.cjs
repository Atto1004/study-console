const fs = require('fs'), vm = require('vm'), assert = require('assert/strict');
const src = fs.readFileSync(process.argv[2], 'utf8');
const grab = name => { const i = src.indexOf('function ' + name + '('); let d = 0, j = src.indexOf('{', i); for (let k = j; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}' && --d === 0) return src.slice(i, k + 1); } };
function run(server, local, unsynced, answer) {
  const store = { 'mech-console-v2': JSON.stringify(local) };
  if (unsynced) store['mech-console-v2.unsynced'] = String(unsynced);
  const ctx = {
    KEY: 'mech-console-v2', ATOM_HOSTED: true, atomState: server, S: null, ui: {}, pushed: 0, rendered: 0,
    $: () => ({ textContent: '' }), migrate: x => JSON.parse(JSON.stringify(x)),
    localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
    confirm: () => answer, markSave() {}, atomPush() { ctx.pushed++; }, render() { ctx.rendered++; }, Date,
  };
  vm.createContext(ctx);
  vm.runInContext(grab('load') + grab('offerRecovery') + grab('persist') + '; load(); offerRecovery();', ctx);
  return { ctx, store };
}
// 서버 1, 저장 안 된 로컬 2: 복구 사본을 남기고, 되돌리기를 고르면 로컬 입력이 살아난다
let r = run({ updatedAt: 1, v: 'server' }, { updatedAt: 2, v: 'local' }, 2, true);
assert.equal(JSON.parse(r.store['mech-console-v2.recovery']).v, 'local');
assert.equal(r.ctx.S.v, 'local'); assert.equal(r.ctx.pushed, 1);
// 취소하면 서버 기록을 쓰고 복구 사본은 남아 있다
r = run({ updatedAt: 1, v: 'server' }, { updatedAt: 2, v: 'local' }, 2, false);
assert.equal(r.ctx.S.v, 'server'); assert.ok(r.store['mech-console-v2.recovery']);
// 이미 올라간 로컬(표시 없음)은 묻지 않고 서버를 쓴다
r = run({ updatedAt: 1, v: 'server' }, { updatedAt: 2, v: 'local' }, 0, true);
assert.equal(r.ctx.S.v, 'server'); assert.equal(r.store['mech-console-v2.recovery'], undefined);
// 서버가 더 새것이면 묻지 않는다
r = run({ updatedAt: 3, v: 'server' }, { updatedAt: 2, v: 'local' }, 2, true);
assert.equal(r.ctx.S.v, 'server');
console.log('recovery ok 4/4');
