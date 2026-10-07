const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const { JSDOM, VirtualConsole } = require(path.join(root, '.test-tools/node_modules/jsdom'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const bridge = fs.readFileSync(path.join(root, 'school/integrated.js'), 'utf8');
const source = fs.readFileSync(path.join(root, 'school/school.js'), 'utf8');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function checkEngine(section) {
  const errors = [], messages = [], saves = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(html, {
    url: `https://school.invalid/study/index.html?view=classic&integrated=1&lobby=off&section=${section}&course=${encodeURIComponent('정역학')}`,
    runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
      w.scrollTo = () => {};
      w.HTMLElement.prototype.scrollIntoView = function () {};
      w.postMessage = message => messages.push(message);
      // All requests remain in memory or local fixture files. No real API is used.
      w.fetch = async (url, options = {}) => {
        if (String(url) === '/api/study/state' && options.method === 'POST') {
          saves.push(JSON.parse(options.body).state);
          return { ok: true, status: 200, json: async () => ({ ok: true }) };
        }
        const relative = String(url).split('?')[0].replace(/^\.\//, '');
        const file = path.resolve(root, relative);
        if (file.startsWith(root + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()) {
          const text = fs.readFileSync(file, 'utf8');
          return { ok: true, status: 200, text: async () => text, json: async () => JSON.parse(text) };
        }
        return { ok: false, status: 404, text: async () => '', json: async () => ({}) };
      };
    },
  });
  try {
    // Run immediately, before asynchronous classic boot has finished.
    dom.window.eval(bridge);
    const deadline = Date.now() + 5000;
    while (!messages.length && Date.now() < deadline) await delay(50);
    assert.equal(messages[0]?.type, 'school-integrated-ready', JSON.stringify(messages));
    assert.equal(dom.window.ui.view, section);
    assert.equal(dom.window.document.querySelector('.view.on')?.id, `v-${section}`);
    await delay(500);
    assert.equal(dom.window.ui.view, section, 'Late boot must not overwrite the requested view');
    assert.deepEqual(errors, []);
    if (section === 'course') {
      const w = dom.window;
      w.S.misc = { preserved: ['sentinel'] };
      w.S.v60 = { assignmentStatus: { test: { workDone: false, submitted: true } }, other: 'keep' };
      const before = JSON.parse(JSON.stringify(w.S));
      const c = w.term().courses.find(c => c.name === '정역학');
      const date = '2026-09-07';
      w.logSheet(c.id, date);
      await delay(100);
      assert.ok(w.document.querySelector('#lqSum details'), 'Verified class-file list must be present');
      w.document.querySelector('#lqP').value = 'memory-only integration progress';
      w.document.querySelector('#lqM').value = 'memory-only memo';
      w.captureLog(c.id, date);
      w.persist();
      await delay(100);
      const saved = saves.at(-1);
      assert.ok(saved, 'Integrated edit must promptly POST into the existing state route');
      assert.deepEqual(saved.misc, before.misc);
      assert.deepEqual(saved.v60, before.v60);
      assert.equal(saved.activeTermId, before.activeTermId);
      assert.deepEqual(saved.terms.map(t => t.id), before.terms.map(t => t.id));
      const beforeTerm = before.terms.find(t => t.id === before.activeTermId);
      const savedTerm = saved.terms.find(t => t.id === saved.activeTermId);
      assert.deepEqual(savedTerm.courses, beforeTerm.courses);
      assert.deepEqual(savedTerm.exams, beforeTerm.exams);
      const session = savedTerm.sessions.find(s => s.courseId === c.id && s.date === date);
      assert.equal(session.progress, 'memory-only integration progress');
      assert.equal(session.memo, 'memory-only memo');
    }
  } finally { dom.window.close(); }
}

function checkTestIsolation() {
  const body = source.slice(source.indexOf('function openIntegrated('), source.indexOf('function openStudyAsset('));
  const messages = [];
  const context = {
    TEST: true,
    status: (...args) => messages.push(args),
    stopVoice: () => { throw new Error('Test mode must not reach frame creation'); },
  };
  vm.runInNewContext(body + '\nopenIntegrated("test", "grade");', context);
  assert.equal(messages.length, 1);
  assert.equal(messages[0][1], true);
}

(async () => {
  checkTestIsolation();
  for (const section of ['today', 'plan', 'study', 'cal', 'grade', 'course', 'shelf', 'set']) await checkEngine(section);
  console.log('통합 화면 8개: 초기 진입·늦은 부팅 유지·오류 0 · 회차 저장/기존 원장 보존 · 검증 모드 차단 통과 (실제 API 없음)');
})().catch(error => { console.error(error); process.exitCode = 1; });
