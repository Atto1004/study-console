// ALiVEWEEK 레이어(대표님 10/12 「프로크리에이트 레이어 패널처럼 성격이 같은 일정끼리 켜고 끄며 모아 보고 관리」).
// 이 파일은 화면 없는 순수 부분: 레이어 정의·자동 분류·보이기 필터·세어 보기·영업시간 조회·저장 변경 함수.
// 저장은 v60.layers 한 곳(서버 study_state 에 같이 저장돼 웹·아이패드가 같이 본다). 기본값은 코드(BASE)에 있고 저장에는 사용자가 고친 차이만 둔다.
// 옛 데이터(layers 필드 없음)는 기본값과 자동 분류로만 읽고 저장하지 않는다.
export const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
export const BASE = [
  { id: 'exercise', name: '운동', color: '#2e9d5b', vis: true, kw: '헬스,크로스핏,벗히얼,PT,운동,러닝,클라이밍,수영,요가,필라테스,풋살', subs: [{ n: '헬스', kw: '헬스,웨이트,PT' }, { n: '크로스핏', kw: '크로스핏,벗히얼' }] },
  { id: 'hospital', name: '병원', color: '#e0548a', vis: true, kw: '병원,의원,피부과,아토피,광선,제모,레이저,정신과,새론,진료,치과,검진,처방', subs: [{ n: '피부과 · 아토피', kw: '아토피,광선,강남피부과' }, { n: '피부과 · 레이저 제모', kw: '제모,스노우,레이저' }, { n: '정신과', kw: '정신과,새론,ADHD' }, { n: '병원', kw: '병원,의원,진료,치과,검진,처방' }] },
  { id: 'club', name: '동아리', color: '#8e5bd1', vis: true, kw: '동아리', subs: [] },
  { id: 'class', name: '수업', color: '#2c5aa0', vis: true, kw: '수업,강의,휴강,보강,주차,개강,종강', subs: [] },
  { id: 'labor', name: '노동', color: '#b8791a', vis: true, kw: '근로,근무,알바,아르바이트,파쓰쿠찌,파스쿠치,조교,출근', subs: [{ n: '근로', kw: '근로,조교' }, { n: '알바', kw: '알바,아르바이트,파쓰쿠찌,파스쿠치' }] },
  { id: 'income', name: '수입', color: '#12877a', vis: false, kw: '월급,급여,입금,수입,용돈,환급,지급', subs: [{ n: '고정', kw: '월급,급여' }, { n: '변동', kw: '용돈,환급,입금' }] },
  { id: 'expense', name: '지출', color: '#a3336e', vis: false, kw: '납부,결제,구독,공과금,통신비,등록금,세금,이체,송금,대출,관리비,월세', subs: [{ n: '고정', kw: '월세,구독,통신비,공과금,관리비,대출' }, { n: '변동', kw: '결제,이체,송금' }] },
  { id: 'sleep', name: '수면', color: '#3b4a8f', vis: true, kw: '', subs: [] },
  { id: 'todo', name: '할 일', color: '#3c9ec7', vis: true, kw: '신청,접수,지원서,공모전,스터디', subs: [{ n: '공부', kw: '공부,복습,예습' }, { n: '과제', kw: '과제,숙제,레포트' }, { n: '신청', kw: '신청,접수,지원서' }] },
  { id: 'deadline', name: '마감', color: '#b3261e', vis: true, kw: '마감,데드라인,기한,제출,시험,중간고사,기말고사,퀴즈', subs: [] },
  { id: 'appt', name: '약속', color: '#e08a2e', vis: true, kw: '약속,모임,미팅,회식,번개,생일,만남', subs: [] },
  { id: 'etc', name: '기타', color: '#7b8794', vis: true, kw: '@이동,@준비,@밥', subs: [{ n: '이동', kw: '@이동' }, { n: '준비', kw: '@준비' }, { n: '식사', kw: '@밥' }] },
];
export const SWATCH = ['#2e9d5b', '#e0548a', '#8e5bd1', '#2c5aa0', '#b8791a', '#12877a', '#a3336e', '#3b4a8f', '#3c9ec7', '#b3261e', '#e08a2e', '#7b8794'];
// 제목 키워드를 보는 차례: 사용자가 만든 레이어가 먼저, 그다음 이 순서(돈 관련이 노동보다 앞 — 「국가근로 월급날」은 수입). 수면·기타는 키워드로 가지 않는다
const KW_ORDER = ['deadline', 'hospital', 'exercise', 'club', 'income', 'expense', 'labor', 'appt', 'todo', 'class'];
const COLOR_TO = { 2: 'appt', 6: 'labor', 7: 'todo', 9: 'class', 11: 'deadline' };   // 캘린더 색 → 레이어(1 이동은 아래 @이동, 8 돈은 키워드로만, 3·10 은 대응 레이어 없음)
const SECRET = /^\s*운선/;
export const AUTO = '@auto';   // 이 회차만 「자동 분류」(반복 지정이 있어도 따르지 않음)
export const isSecretText = (t) => SECRET.test(String(t || ''));
export const isSecret = (b) => !!b && (isSecretText(b.ev?.title) || isSecretText(b.plan?.note) || isSecretText(b.title));
export const labelOf = (b) => (isSecret(b) ? '개인 일정' : String(b?.title || ''));
const hexOk = (c) => /^#[0-9a-f]{6}$/i.test(String(c || ''));
export const nameOk = (n) => { const t = String(n || '').trim(); return t.length >= 1 && t.length <= 12 ? t : null; };

// ── 모델: 기본값 + 저장된 차이 ──
const cache = new WeakMap(); let defaultModel = null;
export function layerModel(raw) {
  const ok = raw && typeof raw === 'object';
  if (!ok) return (defaultModel ||= build({}));
  let m = cache.get(raw); if (!m) { m = build(raw); cache.set(raw, m); } return m;
}
function build(raw) {
  const stored = new Map((Array.isArray(raw.items) ? raw.items : []).filter((x) => x && typeof x.id === 'string').map((x) => [x.id, x]));
  const items = BASE.map((d) => merge(d, stored.get(d.id) || {}, false));
  for (const o of stored.values()) if (o.user && !o.del && !BASE.some((d) => d.id === o.id)) items.push(merge({ id: o.id, name: '새 레이어', color: '#7b8794', vis: true, kw: '', subs: [] }, o, true));
  const order = Array.isArray(raw.order) ? raw.order : [];
  const at = (id) => { const i = order.indexOf(id); return i < 0 ? 1e6 : i; };
  items.sort((a, b) => at(a.id) - at(b.id));   // sort 는 안정 정렬 — 순서 기록이 없는 것은 원래 차례(기본 → 만든 차례) 그대로
  const byId = Object.fromEntries(items.map((x) => [x.id, x]));
  const kwOrder = [...items.filter((x) => x.user), ...KW_ORDER.map((id) => byId[id]).filter(Boolean)].filter((x) => x.kw.trim());
  const kws = kwOrder.map((x) => ({ id: x.id, toks: tokens(x.kw) }));
  const deleted = new Set((Array.isArray(raw.items) ? raw.items : []).filter((x) => x && x.del).map((x) => x.id));
  return { items, byId, kws, assign: raw.assign && typeof raw.assign === 'object' ? raw.assign : {}, places: raw.places && typeof raw.places === 'object' ? raw.places : {}, deleted, order: items.map((x) => x.id) };
}
// 필드가 있는지로 합친다(보이기 false·키워드 비움 같은 「비운 값」이 기본값에 먹히지 않게)
function merge(d, o, user) {
  return { id: d.id, name: nameOk(o.name) || d.name, color: hexOk(o.color) ? o.color : d.color, vis: typeof o.vis === 'boolean' ? o.vis : d.vis, kw: typeof o.kw === 'string' ? o.kw : d.kw, subs: d.subs, user };
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function tokens(kw) {
  return String(kw || '').split(/[,\n，]/).map((t) => t.trim()).filter(Boolean).map((t) => ({ t: t.toLowerCase(), kind: t.startsWith('@') ? t.slice(1) : null, re: /^[a-z0-9 .+\-]+$/i.test(t) ? new RegExp('(^|[^a-z0-9])' + esc(t.toLowerCase()) + '($|[^a-z0-9])', 'i') : null }));
}
const hit = (toks, text) => toks.some((k) => !k.kind && (k.re ? k.re.test(text) : text.includes(k.t)));

// ── 블록 키(사용자 지정용 안정 id). 이 회차만(inst) · 같은 반복 모두(series). 제목으로는 만들지 않는다(운선 제목이 저장되지 않게). 캘린더는 id·recurringEventId, 수업은 과목 id(+날짜), 기본 시간표는 루틴 id(+날짜) ──
export function blockKeys(b) {
  if (!b || isSecret(b)) return secretKeys(b);
  const d = b.date || '';
  if (b.k === 'class' && b.cls?.courseId) return { series: `class:${b.cls.courseId}`, inst: `class:${b.cls.courseId}@${d}` };
  if (b.k === 'cal' && b.ev?.id) return { series: b.ev.recurringEventId ? `cal:${b.ev.recurringEventId}` : null, inst: `cal:${b.ev.id}` };   // 구글이 주는 회차 id(반복이면 …_날짜 꼴)와 반복 원본 id(recurringEventId)
  if (b.k === 'work' && b.routine?.id) return { series: `work:${b.routine.id}`, inst: `work:${b.routine.id}@${d}` };
  if (b.k === 'plan' && b.plan?.id) return { series: null, inst: `plan:${b.plan.id}` };
  if (b.k === 'exam') return { series: null, inst: `exam:${d}|${b.title}` };
  return { series: null, inst: null };
}
function secretKeys(b) { return { series: null, inst: null, secret: !!b }; }

// ── 자동 분류 ── 돌려주는 값: {id, sub, why} — why = secret · user · kind · kw · color · fallback (오분류를 고칠 때 근거)
const KIND_BK = ['고정', '공부', '과제', '이동', '준비', '밥'];
const bkOf = (p) => (KIND_BK.includes(p?.bk) ? p.bk : /^\s*(과제|공모전)\s*·/.test(p?.note || '') ? '과제' : '공부');
const LIFE_SUB = { 이동: '이동', 준비: '준비', 밥: '식사' };
const INCOME_AMT = /(지원금|장학금)\s*[+]?\d[\d,.]*\s*(만\s*원|원)/;   // 금액(숫자+원)이 붙은 지원금·장학금만 수입. 마감·신청 같은 말이 있으면 그쪽이 먼저(byKw 순서)
function subOf(L, text) { const s = L.subs.find((x) => hit(tokens(x.kw), text)); return s ? s.n : null; }
const res = (M, id, why, text) => { const L = M.byId[id] || M.byId.etc; return { id: L.id, sub: text != null ? subOf(L, text) : null, why }; };
export function classify(b, M) {
  if (!b) return res(M, 'etc', 'fallback');
  if (isSecret(b)) return res(M, 'appt', 'secret');   // 개인 일정: 제목을 읽지 않고 약속에 고정(지정·키워드·색 모두 무시)
  const keys = blockKeys(b), iv = keys.inst ? M.assign[keys.inst] : undefined, u = iv !== undefined ? iv : keys.series ? M.assign[keys.series] : undefined;   // 회차 지정 > 반복 지정 > 자동
  const text = [b.title, b.plan?.note, b.ev?.title].filter(Boolean).join(' ').toLowerCase();
  if (u && u !== AUTO && M.byId[u]) return res(M, u, 'user', text);
  const life = (kind) => { const k = M.kws.find((x) => x.toks.some((t) => t.kind === kind)); return k ? { id: k.id, sub: null, why: 'kind' } : { id: 'etc', sub: LIFE_SUB[kind], why: 'kind' }; };
  switch (b.k) {
    case 'sleep': return res(M, 'sleep', 'kind');
    case 'exam': return res(M, 'deadline', 'kind');
    case 'class': return res(M, 'class', 'kind');
    case 'auto': return res(M, 'todo', 'kind', /과제/.test(text) ? '과제' : '공부');
    case 'plan': {
      const bk = bkOf(b.plan);
      if (bk === '이동' || bk === '준비' || bk === '밥') return life(bk);
      if (bk === '공부' || bk === '과제') return { id: 'todo', sub: bk, why: 'kind' };
      return byKw(M, text) || res(M, 'appt', 'kind');   // 고정 일정(약속 등): 키워드가 없으면 약속
    }
    case 'work': return byKw(M, text) || (b.routine?.kind === '수업' ? res(M, 'class', 'kind') : b.routine?.kind === '근무' ? res(M, 'labor', 'kind', text) : res(M, 'etc', 'fallback'));   // 기본 시간표(routine.json)는 kind 가 수업·근무
    case 'cal': {
      const col = String(b.ev?.color ?? '');
      if (col === '1') return life('이동');
      return byKw(M, text) || (COLOR_TO[col] ? res(M, COLOR_TO[col], 'color', text) : res(M, 'etc', 'fallback'));
    }
    default: return res(M, 'etc', 'fallback');
  }
}
function byKw(M, text) {
  for (const k of M.kws) {
    if (k.id === 'income' && INCOME_AMT.test(text)) return res(M, 'income', 'kw', text);   // 수입 차례에서만(사용자 키워드·병원·운동·마감이 먼저, 수입 키워드를 비우면 이 규칙도 없음)
    if (hit(k.toks, text)) return res(M, k.id, 'kw', text);
  }
  return null;
}
export const isShown = (M, id) => !!M.byId[id]?.vis;
export const showBlock = (M, b) => isShown(M, classify(b, M).id);
export const filterBlocks = (list, M) => list.filter((b) => showBlock(M, b));
// 종일 줄 항목(allDayItems 가 만든 것) → 분류용 블록 모양
export const adBlock = (it) => (it.kind === 'cal' ? { k: 'cal', ev: it.ev, title: it.title, allDay: true, date: it.from } : { k: 'plan', plan: it.plan, title: it.title, allDay: true, date: it.from });

// 세어 보기: 블록 목록 → {byId:{id:{n,subs:{이름:n}}}, unknown, etcKnown}. 「분류 불명」 = 어떤 규칙에도 안 걸려 기타가 된 것(0 이 목표), 이동·준비·식사는 알고 기타에 둔 것
export function tally(blocks, M) {
  const byId = Object.fromEntries(M.items.map((x) => [x.id, { n: 0, subs: {} }]));
  let unknown = 0;
  for (const b of blocks) {
    const c = classify(b, M), o = byId[c.id]; o.n++; if (c.sub) o.subs[c.sub] = (o.subs[c.sub] || 0) + 1;
    if (c.why === 'fallback') unknown++;
  }
  return { byId, unknown };
}

// ── 영업·운영 시간 ──
// 장소 하나 = {id, layer, name, week:{요일:[[시작,끝]...]}, classes?:{요일:['07:10'...]|'OPEN GYM'}, brk?:[시작,끝], src}
// 시드 = 옛 얼라이브위크 layers.json(GET /api/layers). 앱에서 고친 것은 v60.layers.places[같은 id] 로 통째 덮어쓴다(지우면 시드로 돌아감). {off:1} 이면 그 장소는 이 화면에서 뺀다
const POLICY_LAYER = { 운동: 'exercise', 진료: 'hospital', 미용: 'hospital', 공부: 'todo' };
export function legacyPlaces(apiLayers) {
  const out = [];
  for (const l of Array.isArray(apiLayers) ? apiLayers : []) {
    const d = l?.detail || {}, layer = POLICY_LAYER[l?.policy || d.policy];
    if (l?.type !== 'place' || !layer || !d.hours || typeof d.hours !== 'object') continue;
    const week = {}; for (const w of DAYS) { const v = d.hours[w]; week[w] = Array.isArray(v) && v.length === 2 ? [[v[0], v[1]]] : []; }
    const classes = {}; for (const w of DAYS) { const v = d.classes?.[w]; if (Array.isArray(v) || v === 'OPEN GYM') classes[w] = v; }
    out.push({ id: 'legacy:' + l.id, layer, name: l.name, week, classes, brk: Array.isArray(d.break) && d.break.length === 2 ? d.break : null, src: 'layers.json' });
  }
  return out;
}
export const hmMin = (s) => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || '')); if (!m) return null; const v = +m[1] * 60 + +m[2]; return +m[2] < 60 && v <= 1440 ? v : null; };
export const minHm = (n) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
export const dowOf = (date) => DAYS[(new Date(date + 'T00:00:00Z').getUTCDay() + 6) % 7];
export function mergedPlaces(M, legacy) {
  const out = [];
  for (const p of legacy || []) { const o = M.places[p.id]; if (o && o.off) continue; out.push(o ? { ...o, id: p.id, src: 'app' } : p); }
  for (const [id, o] of Object.entries(M.places)) if (!id.startsWith('legacy:') && o && !o.off && o.layer) out.push({ ...o, id, src: 'app' });
  return out;
}
// 구간은 [시작, 끝) 분. 겹치면 합치고, 쉬는 시간(brk)은 뺀다
function mergeRanges(rs) {
  const s = rs.filter((r) => r[1] > r[0]).sort((a, b) => a[0] - b[0]), out = [];
  for (const r of s) { const l = out[out.length - 1]; if (l && r[0] <= l[1]) l[1] = Math.max(l[1], r[1]); else out.push([r[0], r[1]]); }
  return out;
}
const cut = (rs, b) => (b ? rs.flatMap(([x, y]) => [[x, Math.min(y, b[0])], [Math.max(x, b[1]), y]]).filter((r) => r[1] > r[0]) : rs);
// 반환: [{id, place, ranges, classes(시작 분들)|null, openGym, status:'open'|'closed', src, at}]. 시드를 못 불러왔으면(legacy=null) 시드 장소는 아예 안 나온다 — 휴무로 단정하지 않는다
export function layerHoursAt(M, legacy, layerId, date) {
  const dow = dowOf(date);
  return mergedPlaces(M, legacy).filter((p) => p.layer === layerId).map((p) => {
    const raw = Array.isArray(p.week?.[dow]) ? p.week[dow] : [];
    const rs = raw.map(([a, b]) => [hmMin(a), hmMin(b)]).filter((r) => r[0] != null && r[1] != null);
    const brk = Array.isArray(p.brk) ? [hmMin(p.brk[0]), hmMin(p.brk[1])] : null;
    const ranges = cut(mergeRanges(rs), brk && brk[0] != null && brk[1] != null ? brk : null);
    const cl = p.classes?.[dow];
    return { id: p.id, place: p.name, ranges, classes: Array.isArray(cl) ? cl.map(hmMin).filter((x) => x != null) : null, openGym: cl === 'OPEN GYM', status: ranges.length ? 'open' : 'closed', src: p.src, at: p.at || null };
  });
}

// ── 저장 변경(모두 save(mutate) 에 넘기는 함수: 지금 있는 최신 상태 s 에서 해당 id 의 해당 필드만 「~로 설정」) ──
function copy(s) {
  const b = s.layers && typeof s.layers === 'object' ? s.layers : {};
  return { ver: 1, items: (Array.isArray(b.items) ? b.items : []).filter((x) => x && typeof x.id === 'string').map((x) => ({ ...x })), order: Array.isArray(b.order) ? [...b.order] : [], assign: { ...(b.assign || {}) }, places: { ...(b.places || {}) } };
}
const keyOk = (k) => typeof k === 'string' && /^(cal|class|work|plan|exam):/.test(k) && !/운선/.test(k);
const slot = (L, id) => { let x = L.items.find((y) => y.id === id); if (!x) { x = { id }; L.items.push(x); } return x; };
export const LM = {
  // 보이기. 끄는 쪽은 마지막 하나를 못 끈다(최신 상태에서 다시 검사). 돌려주는 값: 적용됐는가
  setVis(s, id, on) {
    const M = layerModel(s.layers); if (!M.byId[id]) return false;
    if (!on && M.items.filter((x) => x.vis && x.id !== id).length === 0) return false;
    const L = copy(s); slot(L, id).vis = !!on; s.layers = L; return true;
  },
  showAll(s) { const L = copy(s), M = layerModel(s.layers); for (const x of M.items) slot(L, x.id).vis = true; s.layers = L; },
  only(s, id) { const L = copy(s), M = layerModel(s.layers); if (!M.byId[id]) return false; for (const x of M.items) slot(L, x.id).vis = x.id === id; s.layers = L; return true; },
  add(s, id, name, color) {
    const M = layerModel(s.layers), n = nameOk(name); if (!n || M.byId[id] || M.deleted.has(id)) return false;
    const L = copy(s); L.items.push({ id, user: 1, name: n, color: hexOk(color) ? color : '#7b8794', vis: true, kw: '' }); s.layers = L; return true;
  },
  // 사용자가 만든 레이어만 지운다(표식을 남겨 다른 기기에서 늦게 오는 지정이 되살리지 못하게). 그 레이어로의 지정은 같이 정리
  remove(s, id) {
    const M = layerModel(s.layers), x = M.byId[id]; if (!x || !x.user) return false;
    if (M.items.filter((y) => y.vis && y.id !== id).length === 0) return false;   // 이 레이어가 마지막으로 보이는 것이면 지우지 않는다
    const L = copy(s), it = slot(L, id); it.del = 1; it.vis = false; L.order = L.order.filter((y) => y !== id);
    for (const [k, v] of Object.entries(L.assign)) if (v === id) delete L.assign[k];
    for (const [k, p] of Object.entries(L.places)) if (p && p.layer === id) delete L.places[k];
    s.layers = L; return true;
  },
  patch(s, id, patch) {
    const M = layerModel(s.layers); if (!M.byId[id]) return false;
    const L = copy(s), it = slot(L, id);
    if ('name' in patch && nameOk(patch.name)) it.name = nameOk(patch.name);
    if ('color' in patch && hexOk(patch.color)) it.color = patch.color;
    if ('kw' in patch) it.kw = String(patch.kw || '').slice(0, 400);
    s.layers = L; return true;
  },
  reset(s, id) { const M = layerModel(s.layers); if (!M.byId[id] || M.byId[id].user) return false; const L = copy(s), it = slot(L, id); delete it.name; delete it.color; delete it.kw; s.layers = L; return true; },
  move(s, id, to) {
    const M = layerModel(s.layers); if (!M.byId[id]) return false;
    const ids = M.order.filter((x) => x !== id); ids.splice(Math.max(0, Math.min(ids.length, to)), 0, id);
    const L = copy(s); L.order = ids; s.layers = L; return true;
  },
  // 일정 하나(키)를 레이어에 지정. layerId 가 null 이면 지정을 푼다. 없어졌거나 지워진 레이어로는 지정하지 않는다
  assign(s, key, layerId) {
    if (!keyOk(key)) return false;
    const M = layerModel(s.layers); if (layerId && !M.byId[layerId]) return false;
    const L = copy(s); if (layerId) L.assign[key] = layerId; else delete L.assign[key]; s.layers = L; return true;
  },
  // 일정 창·모아보기의 「레이어」 고르기. scope 'inst' = 이 회차만, 'series' = 같은 반복 모두(이 회차의 예외 지정은 지움). layerId null = 자동 분류:
  // 이 회차만 자동이면 반복 지정이 있어도 따르지 않게 @auto 표식을 남기고, 반복 전체를 자동으로 하면 반복 지정과 이 회차 예외를 함께 푼다. 한 번에(원자적) 처리 — 409 뒤 재적용돼도 같은 결과
  assignAt(s, keys, scope, layerId) {
    const M = layerModel(s.layers); if (layerId && !M.byId[layerId]) return false;
    const k = scope === 'inst' ? keys.inst : keys.series || keys.inst; if (!keyOk(k)) return false;
    const L = copy(s);
    if (scope === 'inst') { if (layerId) L.assign[k] = layerId; else if (keys.series && L.assign[keys.series] && M.byId[L.assign[keys.series]]) L.assign[k] = AUTO; else delete L.assign[k]; }
    else { if (layerId) L.assign[k] = layerId; else delete L.assign[k]; if (keys.inst && keys.series) delete L.assign[keys.inst]; }
    s.layers = L; return true;
  },
  // 영업시간 장소: place = {layer,name,week,classes?,brk?}. 앱에서 고친 때(at)를 남긴다
  setPlace(s, id, place, at) {
    const M = layerModel(s.layers); if (!M.byId[place.layer]) return false;
    const L = copy(s); L.places[id] = { layer: place.layer, name: String(place.name || '').slice(0, 30) || '이름 없음', week: place.week || {}, ...(place.classes ? { classes: place.classes } : {}), ...(place.brk ? { brk: place.brk } : {}), at: at || null }; s.layers = L; return true;
  },
  delPlace(s, id, off) { const L = copy(s); if (off) L.places[id] = { off: 1 }; else delete L.places[id]; s.layers = L; return true; },
};
