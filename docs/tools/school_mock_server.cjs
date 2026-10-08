// 화면 확인용 가짜 서버. 실제 학습 기록을 읽거나 쓰지 않는다.
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(process.argv[2]), port = +process.argv[3] || 8797;
const fx = JSON.parse(fs.readFileSync(path.join(root, '.test-tools/school-fixture.json'), 'utf8'));
const today = '2026-10-07';
const courses = fx.catalog.courses;
const cid = n => 'c-' + courses.findIndex(c => c.name === n);
const exams = [
  ['정역학', '2026-10-19', '09:00'], ['미분적분학2', '2026-10-20', '10:30'], ['공업수학1', '2026-10-21', '09:00'],
  ['일반물리학2', '2026-10-23', '13:00'], ['CADD', '2026-10-22', '15:00', true],
].map(([course, date, time, assumed]) => ({ course, courseId: cid(course), kind: '중간', date, time, written: true, assumed: !!assumed,
  dday: Math.round((Date.parse(date) - Date.parse(today)) / 864e5), scope: '과제 수준' }));
const events = [];
let t = 1;
const ans = (course, lesson, step, correct, assisted) => events.push({ id: 'e' + t, kind: 'answer', course, lesson, step, correct, assisted, at: 1759000000 + t++ });
const pick = (n, k) => courses.find(c => c.name === n).lessons.slice(0, k).map(l => l.id);
pick('정역학', 7).forEach((l, i) => { ans('정역학', l, 1, true, false); ans('정역학', l, 2, i % 3 !== 0, i % 2 === 0); });
pick('미분적분학2', 3).forEach((l, i) => { ans('미분적분학2', l, 1, i !== 1, true); });
pick('공업수학1', 5).forEach((l, i) => { ans('공업수학1', l, 1, true, i % 2 === 1); ans('공업수학1', l, 2, true, false); });
const state = { version: 1, revision: 0, plans: {}, events, rules: {}, progress: {}, drafts: {}, settings: { engine: 'auto', voice: false } };
const sources = [
  { id: 's1', course: '정역학', date: '2026-09-30', kind: 'material', file: '강의자료_Ch5_Equilibrium.pdf' },
  { id: 's2', course: '정역학', date: '2026-09-30', kind: 'recording', file: '클로바_정역학_0930.txt' },
  { id: 's3', course: '정역학', date: '2026-09-30', kind: 'summary', file: '정리.md', href: 'notes/lessons/statics/2026-09-30.html' },
  { id: 's4', course: '정역학', date: '2026-09-28', kind: 'photo', file: '판서_0928_3.jpg' },
  { id: 's5', course: '공업수학1', date: '2026-09-30', kind: 'material', file: 'HW-Ch2.pdf' },
  { id: 's6', course: '공업수학1', date: '2026-09-30', kind: 'summary', file: '정리.md' },
];
const assignments = { asOf: today, notice: '', rows: [
  { id: 'a1', course: '정역학', title: 'HW Ch.5', due: '2026-10-08T23:59', submission: '미제출', workDone: false, submitted: false, files: [{ label: '문제지 PDF', href: '_private/submit/statics_ch5_questions.pdf' }, { label: 'HW-Ch5 제출본 v11', href: '_private/submit/x.pdf' }] },
  { id: 'a2', course: 'CADD', title: 'Week6 모델링', due: '2026-10-12T23:59', submission: '미제출', workDone: true, submitted: false, files: [] },
  { id: 'a3', course: '공업수학1', title: '3장 숙제', due: '2026-10-14', submission: '미제출', workDone: false, submitted: false, files: [{ label: '혼자 풀기 (스앵님 코칭)', href: 'notes/lessons/_private/em1/hw/index.html' }] },
] };
const workspace = { date: today, termId: 'demo', revision: 0, examMode: true, courses: courses.map((c, i) => ({ id: 'c-' + i, name: c.name })), exams, plans: [
  { id: 'p1', date: today, s: '19:00', e: '20:00', courseId: cid('정역학'), note: 'Ch.5 과제 2문제 답지 없이', kind: '시험 대비' }],
  sessions: [], scheduled: [{ courseId: cid('공업수학1'), course: '공업수학1', date: today, s: '09:00', e: '10:15' }, { courseId: cid('일반물리학2'), course: '일반물리학2', date: today, s: '13:00', e: '14:15' }],
  sources, candidates: [], lmsMaterials: [{ course: '정역학', module: '6주차', title: 'W6-1 영상', url: '#' }], profile: { dailyCap: 4 }, sync: { at: 1759800000 }, attendanceNotice: '' };
const json = (res, body) => { res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)); };
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'), p = u.pathname;
  if (p.startsWith('/api/')) {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const k = p.split('/').pop();
      if (k === 'workspace') return json(res, workspace);
      if (k === 'catalog') return json(res, fx.catalog);
      if (k === 'state') return json(res, p.includes('/study/') ? { state: { terms: [], activeTermId: null } } : state);
      if (k === 'capabilities') return json(res, { testMode: true, engines: ['auto'], voice: false });
      if (k === 'session') return json(res, null);
      if (k === 'assignments') return json(res, assignments);
      if (k === 'cal') return json(res, { ok: true, days: { [today]: [{ start: '16:00', end: '17:00', title: '창업팀 회의' }] } });
      if (k === 'lesson') return json(res, fx.lessons[u.searchParams.get('id')] || null);
      if (k === 'event') { const ev = { ...JSON.parse(body || '{}'), at: Date.now() / 1000 }; state.events.push(ev); return json(res, { event: ev, revision: ++state.revision, projection: {} }); }
      json(res, {});
    });
    return;
  }
  const f = path.join(root, decodeURIComponent(p));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(port, '127.0.0.1', () => console.log('mock on', port));
