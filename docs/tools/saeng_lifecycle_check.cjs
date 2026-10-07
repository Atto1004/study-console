// 스앵님을 여러 번 붙였다 떼도 반복 타이머가 남지 않는지: node docs/tools/saeng_lifecycle_check.cjs
const fs = require('fs'), path = require('path'), assert = require('assert/strict');
const root = path.resolve(__dirname, '../..');
const { JSDOM } = require(path.join(root, '.test-tools/node_modules/jsdom'));
const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://x.invalid/school/', pretendToBeVisual: true, runScripts: 'outside-only' });
const w = dom.window;
const live = new Map();
let id = 0;
w.setTimeout = (fn, ms) => { const k = ++id; live.set(k, fn); return k; };
w.clearTimeout = k => live.delete(k);
w.matchMedia = () => ({ matches: false });
w.fetch = async () => ({ json: async () => JSON.parse(fs.readFileSync(path.join(root, 'docs/demo/saeng/layers2/manifest.json'), 'utf8')) });
// 그림은 바로 다 받은 것으로 친다
Object.defineProperty(w.HTMLImageElement.prototype, 'src', { set(v) { this.setAttribute('src', v); queueMicrotask(() => this.onload && this.onload()); }, get() { return this.getAttribute('src'); } });
const src = fs.readFileSync(path.resolve(root, process.argv[2] || 'school/saeng.js'), 'utf8').replace(/^export /gm, '');
w.eval(src + '\nwindow.__mount=mountSaeng;');
const tick = () => { for (let i = 0; i < 40; i++) { const [k, fn] = live.entries().next().value || []; if (!k) break; live.delete(k); fn(); } };
(async () => {
  for (let i = 0; i < 3; i++) {
    const host = w.document.createElement('div'); w.document.body.append(host);
    await w.__mount(host, { dir: '' });
    host.remove();
  }
  tick(); tick();
  assert.equal(live.size, 0, '떼어 낸 스앵님의 타이머가 남았다: ' + live.size);
  const host = w.document.createElement('div'); w.document.body.append(host);
  const s = await w.__mount(host, { dir: '' });
  assert.ok(live.size > 0, '붙어 있는 스앵님은 계속 움직인다');
  s.destroy(); assert.equal(live.size, 0, 'destroy 뒤 타이머 0');
  console.log('saeng lifecycle ok');
})().catch(e => { console.error(e.message); process.exitCode = 1; });
