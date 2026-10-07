// 서버에 못 올라간 입력을 잃지 않는지: node docs/tools/recovery_check.cjs index.html
const fs = require('fs'), vm = require('vm'), assert = require('assert/strict');
const src = fs.readFileSync(process.argv[2] || 'index.html', 'utf8');
const grab = name => { const i = src.indexOf('function ' + name + '('); let d = 0; for (let k = src.indexOf('{', i); k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}' && --d === 0) return src.slice(i, k + 1); } };
const K = 'mech-console-v2';
function run({ server, local, unsynced, recovery, answers = [] }) {
  const store = {};
  if (local) store[K] = JSON.stringify(local);
  if (unsynced) store[K + '.unsynced'] = String(unsynced);
  if (recovery) store[K + '.recovery'] = JSON.stringify(recovery);
  const asked = [];
  const ctx = {
    KEY: K, ATOM_HOSTED: true, atomState: server, S: null, ui: {}, pushed: 0,
    $: () => ({ textContent: '' }), migrate: x => JSON.parse(JSON.stringify(x)),
    localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
    confirm: m => { asked.push(m); return answers.shift() ?? false; }, markSave() {}, atomPush() { ctx.pushed++; }, render() {}, Date,
  };
  vm.createContext(ctx);
  vm.runInContext(['recoveryList', 'load', 'offerRecovery', 'persist'].map(grab).join('\n') + '; load(); offerRecovery();', ctx);
  const rec = store[K + '.recovery'] ? JSON.parse(store[K + '.recovery']) : [];
  return { S: ctx.S, store, asked, pushed: ctx.pushed, rec: (Array.isArray(rec) ? rec : [rec]).map(x => x.v).sort() };
}
const srv = t => ({ updatedAt: t, v: 'server' }), loc = (t, v = 'local') => ({ updatedAt: t, v });
let r = run({ server: srv(1), local: loc(2), unsynced: 2, answers: [true] });
assert.equal(r.S.v, 'local'); assert.equal(r.pushed, 1); assert.deepEqual(r.rec, [], '되돌리면 사본 정리');
r = run({ server: srv(1), local: loc(2), unsynced: 2, answers: [false, false] });
assert.equal(r.S.v, 'server'); assert.deepEqual(r.rec, ['local'], '취소해도 사본 유지');
r = run({ server: srv(3), local: loc(2), unsynced: 2, answers: [false, false] });
assert.deepEqual(r.rec, ['local'], '서버가 더 새로워도 못 올라간 입력은 보존');
r = run({ server: srv(1), local: loc(2) });
assert.equal(r.S.v, 'server'); assert.equal(r.asked.length, 0, '이미 올라간 로컬은 묻지 않음');
r = run({ server: srv(5), local: srv(5), recovery: [loc(2)], answers: [false, false] });
assert.equal(r.asked.length, 2, '남겨 둔 사본은 다음에 다시 묻는다'); assert.deepEqual(r.rec, ['local']);
r = run({ server: srv(5), local: srv(5), recovery: [loc(2)], answers: [false, true] });
assert.deepEqual(r.rec, [], '지우기를 고르면 사본 삭제');
r = run({ server: srv(4), local: loc(4), unsynced: 4 });
assert.deepEqual(r.rec, [], '같은 시각이면 같은 기록으로 본다');
// 오타 3차 재현: 사본 A 를 남긴 뒤 새 입력 B 도 못 올라가면 A·B 둘 다 남는다 (예전 한 개 형식 A 도 읽는다)
r = run({ server: srv(5), local: loc(7, 'B'), unsynced: 7, recovery: loc(3, 'A'), answers: [false, false, false, false] });
assert.deepEqual(r.rec, ['A', 'B']); assert.equal(r.asked.length, 4, '사본마다 묻는다');
// 둘 중 최신 B 만 되돌리면 A 는 남는다
r = run({ server: srv(5), local: loc(7, 'B'), unsynced: 7, recovery: [loc(3, 'A')], answers: [true] });
assert.equal(r.S.v, 'B'); assert.deepEqual(r.rec, ['A']);
// B 는 지우고 A 는 남긴다
r = run({ server: srv(5), local: loc(7, 'B'), unsynced: 7, recovery: [loc(3, 'A')], answers: [false, true, false, false] });
assert.deepEqual(r.rec, ['A']);
console.log('recovery ok 10/10');
