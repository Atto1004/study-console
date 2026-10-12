// 강의실 정렬·비율 자동 검사 (대표님 2026-10-12 「칠판 글자 들여써짐·중앙정렬 규칙」「스앵님 자막 중앙정렬」「12.9인치 아이패드 프로 기준」)
// 규칙(school/classroom-fit.css 와 같은 말):
//   칠판 : 좌우 padding 같음 · 모든 줄(상위 단원·캡션·본문·수식·도형)의 글자 중심 = 칠판 가로 중심(±2px) · text-align:center · text-indent 0 · 줄 왼쪽 막대 0 · 세로 잘림 0
//   자막 : 대사 가로 중심 ±2px · 세로 중심 ±4px(이름표 아래~버튼줄 위) · 이름표 왼쪽 위 · 이전/다음 버튼 줄 가운데 · 대사와 버튼 안 겹침
//   터치 : 조작줄·경로 버튼·자막 버튼·교재 목차·도전 항목 44px 이상
// 실행(서버 켜진 PC): node docs/tools/classroom_align_check.mjs
//   환경변수 BASE=http://127.0.0.1:8787/study  API=http://127.0.0.1:8787  VPS=l1366,p1024,i1180,d1280  STRIDE=1  DATES=...  PW_DIR=playwright-core 가 있는 폴더
// 쓰기 요청은 막고 가짜 응답, 암기카드는 열어 둔다(검사 대상 아님). 실제 기록에 쓰지 않는다.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { measureBoard, measureLayout } from './classroom_align_measure.mjs';
const PW_DIR = process.env.PW_DIR || 'C:/Users/user/AppData/Local/Temp/pwwk';
const { webkit } = createRequire(PW_DIR + '/x.js')('playwright-core');
const BASE = process.env.BASE || 'http://127.0.0.1:8787/study';
const API = process.env.API || 'http://127.0.0.1:8787';
const PW = (fs.readFileSync('C:/Users/user/AppData/Local/Temp/desk_probe.mjs', 'utf8').match(/pw=(\w+)/) || [])[1];
const login = await fetch(`${API}/api/login?pw=${PW}`, { redirect: 'manual' });
const TOKEN = process.env.ATOM_TOKEN || ((login.headers.get('set-cookie') || '').match(/atom_auth=([0-9a-f]+)/) || [])[1];
const H = { cookie: 'atom_auth=' + TOKEN, 'X-School-Test': '1' };
const get = async (p) => (await fetch(`${API}/api/school/` + p, { headers: H })).text();
const UA_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Safari/605.1.15';
const UA_IPAD = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const VP = { l1366: { w: 1366, h: 1024, ua: UA_MAC, t: 1 }, p1024: { w: 1024, h: 1366, ua: UA_MAC, t: 1 }, i1180: { w: 1180, h: 820, ua: UA_IPAD, t: 1 }, d1280: { w: 1280, h: 900, ua: null, t: 0 } };
const DATES = (process.env.DATES || '2026-09-16,2026-09-21,2026-09-23,2026-09-28,2026-09-30,2026-10-07,2026-10-11').split(',');
const TOL = +(process.env.TOL || 2);
const cache = { catalog: await get('catalog'), state: await get('state'), capabilities: await get('capabilities'), growth: '{}' };
const lessons = {}; for (const d of DATES) lessons['statics-' + d] = await get('lesson?id=statics-' + d);
const base = (id) => (/^(.*):\d+$/.exec(id) || [])[1];
const jobs = [];
for (const d of DATES) { const L = JSON.parse(lessons['statics-' + d]); L.steps.forEach((s, i) => { const b = base(s.id), nb = base(L.steps[i + 1]?.id || ''); if (!s.options && b && b === nb) return; jobs.push({ d, id: s.id }); }); }
const stride = +(process.env.STRIDE || 1);
const JJ = jobs.filter((_, i) => i % stride === 0);
const vps = (process.env.VPS || 'l1366,p1024,i1180,d1280').split(',');
const browser = await webkit.launch();
async function run(job, k) {
  const v = VP[k]; const o = { viewport: { width: v.w, height: v.h }, hasTouch: !!v.t, reducedMotion: 'reduce' }; if (v.ua) o.userAgent = v.ua;
  const ctx = await browser.newContext(o); await ctx.addCookies([{ name: 'atom_auth', value: TOKEN, url: BASE }]);
  await ctx.route('**/docs/tools/lessons/cards/statics.json', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ free: Object.fromEntries(DATES.map((d) => [d, '검사'])), lectures: {}, common: [], expect: {} }) }));
  await ctx.route('**/api/school/**', async (r) => {
    const u = new URL(r.request().url()); const p = u.pathname.replace('/api/school/', '') + u.search; const m = r.request().method();
    if (m === 'GET' && p.startsWith('lesson?id=')) return r.fulfill({ contentType: 'application/json', body: lessons[u.searchParams.get('id')] || '{}' });
    if (m === 'GET' && cache[p] !== undefined) return r.fulfill({ contentType: 'application/json', body: cache[p] });
    if (p.startsWith('session')) { if (m === 'POST') { const q = JSON.parse(r.request().postData() || '{}'); return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ...q, revision: (q.revision || 0) + 1, at: Date.now() / 1000 }) }); } return r.fulfill({ contentType: 'application/json', body: 'null' }); }
    return r.fulfill({ contentType: 'application/json', body: '{}' });
  });
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + `/school/index.html?test=1&lesson=statics-${job.d}&step=${encodeURIComponent(job.id)}`, { waitUntil: 'load' });
    await page.waitForFunction((id) => new URLSearchParams(location.search).get('step') === id && document.querySelector('#board .content'), job.id, { timeout: 30000 });
    await page.waitForTimeout(1800);
    const m = await page.evaluate(`(${measureBoard.toString()})()`), l = await page.evaluate(`(${measureLayout.toString()})()`);
    const c = await page.evaluate(() => { const h = document.getElementById('board'), c = h.querySelector('.content'), hr = h.getBoundingClientRect(), cr = c.getBoundingClientRect(), ann = h.querySelector('.annotation'); const limit = Math.min(cr.bottom, ann ? ann.getBoundingClientRect().top : Infinity, hr.bottom); const kids = [...c.querySelectorAll(':scope > *')].filter((e) => e.getBoundingClientRect().height > 0); const last = kids.at(-1); return { over: Math.round((last ? last.getBoundingClientRect().bottom : 0) - limit), scroll: c.scrollHeight - c.clientHeight, font: getComputedStyle(c).fontSize }; });
    return { ...job, vp: k, m, l, c };
  } catch (e) { return { ...job, vp: k, error: String(e).slice(0, 100) }; } finally { await ctx.close(); }
}
const q = []; for (const k of vps) for (const j of JJ) q.push([j, k]);
const out = [];
await Promise.all(Array.from({ length: +(process.env.PAR || 4) }, async () => { while (q.length) { const [j, k] = q.shift(); out.push(await run(j, k)); } }));
await browser.close();

const bad = {}; const note = (k, ex) => { (bad[k] ??= { n: 0, ex: [] }).n++; if (bad[k].ex.length < 3) bad[k].ex.push(ex); };
for (const r of out) {
  if (r.error) { note('측정 오류', `${r.vp} ${r.id} ${r.error}`); continue; }
  const id = `${r.vp} ${r.d.slice(5)}/${r.id}`, m = r.m;
  if (Math.abs(m.bpl - m.bpr) > 0.5) note('칠판 좌우 여백 비대칭', `${id} ${m.bpl}/${m.bpr}`);
  for (const w of m.rows) {
    if (w.kind === 'katexbox' || ['svg', 'figure', 'table', 'img'].includes(w.kind)) { if (Math.abs(w.boxDev) > TOL) note('수식·도형 중심 편차', `${id} ${w.kind} ${w.boxDev}`); continue; }
    if (w.dev === undefined) continue;
    if (Math.abs(w.dev) > TOL) note('줄 글자 중심 편차', `${id} ${w.kind} ${w.dev} "${w.text}"`);
    if (w.ti && w.ti !== '0px') note('text-indent', `${id} ${w.kind} ${w.ti}`);
    if (w.ta !== 'center' && w.kind !== 'math') note('text-align 이 가운데 아님', `${id} ${w.kind} ${w.ta}`);
    if (w.kind === 'row' && parseFloat(w.bl) !== parseFloat(w.br)) note('줄 왼쪽·오른쪽 테두리 비대칭(왼쪽 막대)', `${id} ${w.cls}`);
  }
  const v = m.vn;
  if (v) {
    if (v.inkL != null && Math.abs((v.inkL - v.inkR) / 2) > TOL) note('자막 가로 중심 편차', `${id} ${((v.inkL - v.inkR) / 2).toFixed(1)}`);
    if (v.inkT != null && v.log && Math.abs((v.inkT + v.inkB) / 2 - (v.log.y + v.log.h / 2)) > 4) note('자막 세로 중심 편차', `${id}`);
    if (v.ta && v.ta !== 'center') note('자막 text-align', `${id} ${v.ta}`);
    if (v.pages && v.pages.h > 0 && v.inkB != null && v.inkB > v.pages.y + 0.5) note('자막·버튼 겹침', id);
    if (v.name && (v.name.x - v.box.x > 30 || v.name.y - v.box.y > 20)) note('이름표 위치', id);
    if (v.pages && v.pages.h > 0 && Math.abs(v.pages.x + v.pages.w / 2 - (v.box.x + v.box.w / 2)) > 6) note('이전·다음 버튼 줄 가운데 아님', id);
  }
  if (r.c.over > 1 || r.c.scroll > 2) note('칠판 세로 잘림', `${id} over${r.c.over} scroll${r.c.scroll}`);
  if (r.l.touch.length) note('터치 44px 미만', `${id} ${r.l.touch.slice(0, 3).join(', ')}`);
  if (r.l.scrollW > r.l.vw + 1) note('가로 스크롤 발생', `${id} ${r.l.scrollW}>${r.l.vw}`);
}
console.log(`측정 ${out.length}칸 (${vps.join(',')}), 위반 종류 ${Object.keys(bad).length}`);
for (const [k, o] of Object.entries(bad)) console.log(`  ${String(o.n).padStart(4)}  ${k}   예) ${o.ex.join(' | ')}`);
process.exit(Object.keys(bad).length ? 1 : 0);
