// ALiVEWEEK 레이어 패널(화면). 프로크리에이트 레이어 패널 구조 — 행마다 색·이름·항목 수·보이기 체크, 누르면 선택(모아보기), + 로 추가 —
// 에 구글 캘린더 「내 캘린더」 목록(색 체크박스로 켜고 끄기)을 합쳤다. 1366 가로·아이패드는 오른쪽 패널, 폰 세로는 아래서 올라오는 시트.
// plan.js 와는 createLayerKit(h) 의 h(저장·그리기·항목 목록·열기·이동) 로만 닿는다.
import { DAYS, BASE, AUTO, SWATCH, layerModel, classify, blockKeys, labelOf, isSecret, tally, LM, layerHoursAt, legacyPlaces, hmMin, minHm, mergedPlaces, filterBlocks, showBlock, adBlock } from './aw-layers.js';

const el = (tag, text, cls) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; };
const svg = (d, n = 20) => `<svg width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC = {
  layers: '<rect x="3" y="3" width="12" height="12" rx="2.5"/><rect x="9" y="9" width="12" height="12" rx="2.5" fill="#fff"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', plus: '<path d="M12 5v14M5 12h14"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>', back: '<path d="M15 6l-6 6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>', up: '<path d="M6 15l6-6 6 6"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  go: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 9h16M9 3v4M15 3v4"/>',
};
const ST = ['월', '화', '수', '목', '금', '토', '일'];
const WD = ['일', '월', '화', '수', '목', '금', '토'];
const addDays = (date, n) => { const d = new Date(date + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const wdOf = (date) => WD[new Date(date + 'T00:00:00Z').getUTCDay()];
const md = (date) => `${Number(date.slice(5, 7))}/${Number(date.slice(8))}`;
const hm = (n) => `${String(Math.floor(n / 60) % 24).padStart(2, '0')}:${String(Math.round(n % 60)).padStart(2, '0')}`;
const hme = (n) => (n >= 1440 ? '24:00' : hm(n));
const opId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const WHY = { user: '직접 지정', kw: '제목의 말로 자동 분류', color: '캘린더 색으로 자동 분류', kind: '일정 종류로 자동 분류', fallback: '분류 불명 — 기타에 뒀어요', secret: '개인 일정은 약속에 고정' };

export const CSS = `
.awl-btn{position:relative;width:44px!important;height:44px!important;border:1px solid #d5ddd8!important;background:#fff!important;color:#1f3d33}
.awl-btn[aria-expanded=true]{background:#e3f1ea!important;border-color:#2f7d5b!important}
.awl-btn .awl-badge{position:absolute;top:4px;right:4px;min-width:16px;height:16px;padding:0 4px;box-sizing:border-box;border-radius:8px;background:#b3261e;color:#fff;font:700 11px/16px "Pretendard Variable",Pretendard,system-ui,sans-serif;text-align:center}
.awl-btn:focus-visible,.awl-panel button:focus-visible,.awl-panel select:focus-visible,.awl-panel input:focus-visible,.awl-panel textarea:focus-visible{outline:3px solid #f2c94c;outline-offset:2px}
.awl-panel{position:fixed;top:64px;right:12px;bottom:12px;width:min(380px,calc(100vw - 24px));z-index:68;display:flex;flex-direction:column;box-sizing:border-box;background:#fff;color:#1f3d33;border:1px solid #cfd8d2;border-radius:18px;box-shadow:0 14px 36px #0003;font:500 14px/1.4 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.awl-panel *{box-sizing:border-box}
body:has(.awl-panel) .pl-fab{display:none}
.awl-head{display:flex;align-items:center;gap:6px;padding:10px 10px 6px 16px}
.awl-head h2{margin:0;flex:1;min-width:0;font:700 17px/1.3 "Pretendard Variable",Pretendard,system-ui,sans-serif;display:flex;align-items:center;gap:8px}
.awl-head h2 span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.awl-ib{flex:none;width:44px;height:44px;border-radius:12px;border:0;background:none;color:#1f3d33;display:grid;place-items:center;cursor:pointer;padding:0}
.awl-ib:hover{background:#eef2ef}.awl-ib:disabled{opacity:.4}
.awl-sub{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:0 16px 8px;color:#3d4f46;font-size:13px}
.awl-sub .awl-link{margin-left:auto}
.awl-link{min-height:44px;padding:0 10px;border:0;background:none;color:#1f5f45;font:700 13px "Pretendard Variable",Pretendard,system-ui,sans-serif;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.awl-link:disabled{color:#7b8a82;text-decoration:none;cursor:default}
.awl-body{flex:1;min-height:0;overflow:auto;padding:0 10px 10px}
.awl-msg{margin:0 16px 6px;min-height:0;color:#8f2a18;font:600 12.5px/1.4 "Pretendard Variable",Pretendard,system-ui,sans-serif}.awl-msg:empty{display:none}
.awl-row{display:flex;align-items:center;gap:2px;min-height:52px;margin:3px 0;padding:0 2px;border:1.5px solid transparent;border-radius:14px}
.awl-row.sel{background:#e3f1ea;border-color:#2f7d5b}
.awl-row.off .awl-name{color:#6b7c73}
.awl-chk{flex:none;width:44px;height:44px;border:0;background:none;display:grid;place-items:center;cursor:pointer;padding:0}
.awl-chk i{width:24px;height:24px;border-radius:7px;border:2.5px solid var(--c);display:grid;place-items:center;color:#fff;background:transparent}
.awl-chk[aria-checked=true] i{background:var(--c)}
.awl-chk i svg{width:16px;height:16px;opacity:0}.awl-chk[aria-checked=true] i svg{opacity:1}
.awl-main{flex:1;min-width:0;min-height:44px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:1px;padding:2px 6px;border:0;background:none;text-align:left;cursor:pointer;color:inherit;font:inherit}
.awl-name{font:700 15px/1.3 "Pretendard Variable",Pretendard,system-ui,sans-serif;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.awl-main small{color:#3d4f46;font:500 12.5px/1.35 "Pretendard Variable",Pretendard,system-ui,sans-serif;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.awl-subs{display:flex;flex-wrap:wrap;gap:6px;margin:0 4px 6px 52px}
.awl-subs span{padding:4px 10px;border-radius:999px;background:#eef2ef;color:#26352e;font:600 12.5px "Pretendard Variable",Pretendard,system-ui,sans-serif}
.awl-foot{padding:8px 16px 12px;border-top:1px solid #edf1ee;color:#3d4f46;font-size:12.5px}
.awl-foot p{margin:0 0 4px}
.awl-seg{display:flex;gap:4px;flex-wrap:wrap;padding:0 16px 8px}
.awl-seg button{min-height:44px;min-width:44px;padding:0 9px;border-radius:12px;border:1px solid #cfd8d2;background:#fff;color:#1f3d33;font:600 12.5px "Pretendard Variable",Pretendard,system-ui,sans-serif;cursor:pointer}
.awl-seg button[aria-pressed=true]{background:#2e6b52;border-color:#2e6b52;color:#fff}
.awl-day{margin:10px 6px 2px;display:flex;align-items:baseline;gap:8px;font:700 13.5px "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#26352e}
.awl-day em{font-style:normal;padding:2px 8px;border-radius:999px;background:#eef2ef;font:700 11.5px "Pretendard Variable",Pretendard,system-ui,sans-serif}
.awl-day em.soon{background:#fbe4cc;color:#46290f}
.awl-it{display:flex;flex-wrap:wrap;align-items:center;gap:0 4px;min-height:48px;border-top:1px solid #f0f3f1}
.awl-itmain{flex:1;min-width:0;min-height:44px;display:flex;align-items:center;gap:8px;padding:2px 4px;border:0;background:none;text-align:left;cursor:pointer;color:inherit;font:inherit}
.awl-itmain b{flex:none;min-width:84px;font:600 13px "Pretendard Variable",Pretendard,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#2f4036}
.awl-itmain span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.awl-itmain small{flex:none;color:#4b6358;font-size:12px}
.awl-pick{order:3;flex:1 0 100%;display:flex;align-items:center;gap:6px;padding:0 4px 8px 8px}
.awl-ib[aria-expanded=true]{background:#e3f1ea}
.awl-pick select{flex:1;min-width:0;min-height:44px;border:1px solid #cfd8d2;border-radius:10px;background:#fff;color:#1f3d33;font:600 13px "Pretendard Variable",Pretendard,system-ui,sans-serif;padding:0 6px}
.awl-pick button{min-height:44px;padding:0 10px;border-radius:10px;border:1px solid #cfd8d2;background:#fff;color:#1f3d33;font:600 12.5px "Pretendard Variable",Pretendard,system-ui,sans-serif;cursor:pointer}
.awl-pick button[aria-pressed=true]{background:#2e6b52;border-color:#2e6b52;color:#fff}
.awl-note{margin:2px 6px 6px;color:#3d4f46;font:500 12.5px/1.45 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.awl-empty{margin:16px;padding:12px 14px;border-radius:12px;background:#f6f8f7;color:#3d4f46}
.awl-form{display:flex;flex-direction:column;gap:6px;padding:4px 6px}
.awl-form label{display:flex;flex-direction:column;gap:4px;font:600 13px "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#26352e}
.awl-form input[type=text],.awl-form textarea,.awl-form select{min-height:44px;border:1px solid #9fb0a6;border-radius:10px;padding:8px 10px;font:500 15px "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#14261f;background:#fff;width:100%}
.awl-form textarea{min-height:76px}
.awl-form small{color:#3d4f46;font:500 12.5px/1.45 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.awl-sw{display:flex;flex-wrap:wrap;gap:6px}
.awl-sw button{width:44px;height:44px;border-radius:12px;border:2px solid transparent;background:none;display:grid;place-items:center;cursor:pointer;padding:0}
.awl-sw button i{width:28px;height:28px;border-radius:8px;background:var(--c)}
.awl-sw button[aria-pressed=true]{border-color:#14261f}
.awl-act{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}
.awl-act button{min-height:44px;padding:0 14px;border-radius:12px;border:1px solid #cfd8d2;background:#fff;color:#1f3d33;font:700 13.5px "Pretendard Variable",Pretendard,system-ui,sans-serif;cursor:pointer}
.awl-act button.go{background:#2e6b52;border-color:#2e6b52;color:#fff}
.awl-act button.danger{border-color:#b3261e;color:#8f2a18}
.awl-h3{margin:12px 6px 2px;font:700 14px "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#26352e}
.awl-place{margin:6px 0;padding:8px 10px 10px;border:1px solid #d5ddd8;border-radius:14px;display:flex;flex-direction:column;gap:6px}
.awl-place .awl-pt{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.awl-place .awl-pt b{flex:1;min-width:0;font:700 14px "Pretendard Variable",Pretendard,system-ui,sans-serif}
.awl-place .awl-pt i{font-style:normal;padding:2px 8px;border-radius:999px;background:#eef2ef;font:600 11.5px "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#26352e}
.awl-hr{display:grid;grid-template-columns:28px 1fr;gap:4px 6px;align-items:center}
.awl-hr span{font:700 13px "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#26352e}
.awl-place input[type=text]{min-height:44px;border:1px solid #9fb0a6;border-radius:10px;padding:6px 10px;font:500 14px "Pretendard Variable",Pretendard,system-ui,sans-serif;width:100%;color:#14261f;background:#fff}
.awl-place .awl-pt input{flex:1;font-weight:600}
.awl-hr input{min-height:44px;border:1px solid #9fb0a6;border-radius:10px;padding:6px 10px;font:500 14px "Pretendard Variable",Pretendard,system-ui,sans-serif;width:100%;font-variant-numeric:tabular-nums}
.awl-hr input[aria-invalid=true]{border-color:#b3261e;background:#fdf1ef}
body:has(.awl-panel) .pl-pop{z-index:80}
.awl-ldot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px;vertical-align:middle;flex:none}
.pl-prow .awl-pick{flex:1}
@media (max-width:600px){
  .awl-panel{top:auto;left:0;right:0;bottom:0!important;z-index:76;width:auto;max-height:82dvh;height:82dvh;border-radius:18px 18px 0 0;border-width:1px 0 0}
  .awl-panel{padding-bottom:env(safe-area-inset-bottom)}
  .awl-panel::before{content:"";display:block;width:40px;height:5px;border-radius:3px;background:#cfd8d2;margin:8px auto 0}
}
`;

export function createLayerKit(h) {
  const ui = { open: false, view: 'list', id: null, sel: null, range: (() => { try { return localStorage.getItem('aw-layers-range') || 'week'; } catch { return 'week'; } })(), exp: new Set(), msg: '', loading: false, pickOpen: new Set() };
  let panel = null, legacy = null, legacyFailed = false, btn = null, draft = null;
  const model = () => layerModel(h.v60()?.layers);
  const doSave = (fn) => h.save(fn);
  // 저장 변경 한 번: fn(s) 이 적용됐는지(true) 거부됐는지(false)를 돌려준다. 즉시 거부면 바로 알리고, 낙관 적용 뒤 서버 충돌(409)로 최신 상태에 다시 적용될 때 거부되면 그것도 알린다(마지막으로 불린 결과가 최종)
  function commit(fn, o = {}) {
    let applied = false; const saving = doSave((s) => { applied = !!fn(s); });
    const first = applied; if (!first) notify(o.fail || '바꾸지 못했어요.', true);
    return saving.then((saved) => { if (!saved) return false; if (!applied) { if (first && o.late !== false) notify(o.late || '다른 화면에서 먼저 바뀌어 적용하지 못했어요. 지금 상태를 확인해 주세요.', true); return false; } o.done?.(); return true; });
  }
  const notify = (t, bad) => { h.status?.(t, bad); say(t); };

  // ── 소비처에서 쓰는 것 ──
  const ok = (b) => showBlock(model(), b);
  const show = (list) => filterBlocks(list, model());
  const adPlans = (plans) => { const M = model(); return (plans || []).filter((p) => !p?.allDay || showBlock(M, adBlock({ kind: 'plan', plan: p, title: p.note, from: p.date }))); };
  const adCal = (fn) => (d) => { const M = model(), l = fn(d); return l ? l.filter((ev) => !ev?.allDay || showBlock(M, adBlock({ kind: 'cal', ev, title: ev.title, from: d }))) : l; };
  const dot = (b) => { const M = model(), c = classify(b, M), L = M.byId[c.id], i = el('i', undefined, 'awl-ldot'); i.style.background = L.color; i.title = '레이어 ' + L.name; return i; };
  async function init() {
    if (legacy || legacyFailed) return;
    try { const r = await fetch('/api/layers', { credentials: 'same-origin', cache: 'no-store' }); const j = await r.json(); if (!r.ok || !Array.isArray(j?.layers)) throw new Error('layers'); legacy = legacyPlaces(j.layers); if (ui.open && !(ui.view === 'settings' && (ui.dirty || draft))) paint(); }   // 장소 시간을 입력하는 중이면 다시 그리지 않는다
    catch { legacyFailed = true; }
  }
  const hoursAt = (layerId, date) => layerHoursAt(model(), legacy, layerId, date);
  // 분류 결과 보고(제목은 운선 가림 적용, 저장·네트워크 없음): 점검·검사용
  const report = (dates) => { const M = model(); return h.items(dates).map((e) => { const c = classify(e.blk, M); return { date: e.date, when: e.allDay ? '종일' : `${hm(e.s)}-${hme(e.e)}`, kind: e.blk.k, title: labelOf(e.blk), layer: M.byId[c.id].name, sub: c.sub, why: c.why, shown: M.byId[c.id].vis }; }); };
  const hoursState = () => (legacy ? 'ok' : legacyFailed ? 'failed' : 'loading');   // 옛 얼라이브위크 장소를 읽었나(failed/loading 이면 layerHoursAt 결과에 시드 장소가 빠져 있다 — 휴무가 아님)
  globalThis.awLayers = { layerHoursAt: hoursAt, hoursState, report };

  // ── 레이어 고르기(일정 창·모아보기 행 공용) ──
  function picker(blk, after) {
    const M = model(), c = classify(blk, M), keys = blockKeys(blk), box = el('span', undefined, 'awl-pick');
    const sel = el('select'); sel.setAttribute('aria-label', '레이어');
    const iv = keys.inst ? M.assign[keys.inst] : undefined, instExc = iv === AUTO || !!(iv && M.byId[iv]);   // 이 회차의 따로 지정(자동 표식 @auto 포함)
    const pinned = instExc ? iv !== AUTO : !!(keys.series && M.assign[keys.series] && M.byId[M.assign[keys.series]]);
    sel.append(Object.assign(el('option', pinned ? '자동 분류로 되돌리기' : `자동 · ${M.byId[c.id].name}`), { value: '' }));
    for (const L of M.items) sel.append(Object.assign(el('option', L.name), { value: L.id }));
    let inst = instExc;
    sel.value = pinned ? c.id : '';
    sel.title = (isSecret(blk) ? WHY.secret : WHY[c.why] || '') + ' · ' + M.byId[c.id].name;
    box.append(sel);
    let one = null;
    if (keys.series && keys.inst) { one = el('button', '이 날만'); one.type = 'button'; one.setAttribute('aria-pressed', String(inst)); one.title = '켜면 이 회차만, 끄면 같은 반복 일정 모두(이 회차의 따로 지정은 풀려요)'; one.onclick = () => { inst = !inst; one.setAttribute('aria-pressed', String(inst)); }; box.append(one); }
    if (!keys.inst || isSecret(blk)) { sel.disabled = true; if (one) one.disabled = true; sel.title = isSecret(blk) ? WHY.secret : '이 일정은 고정된 id 가 없어 레이어를 따로 지정할 수 없어요'; }
    sel.onchange = () => { const v = sel.value || null, scope = inst || !keys.series ? 'inst' : 'series', scopeTxt = scope === 'series' ? '같은 반복 일정 모두 ' : ''; commit((s) => LM.assignAt(s, keys, scope, v), { fail: '레이어를 바꾸지 못했어요.', done: () => { h.status?.(v ? `${scopeTxt}${M.byId[v].name} 레이어로 옮겼어요.` : `${scopeTxt}자동 분류로 되돌렸어요.`); after?.(); } }); };
    return box;
  }
  function row(b) {   // 일정 창의 「레이어」 한 줄
    if (b.k === 'sleep' || b.k === 'auto') return null;
    const r = el('div', undefined, 'pl-prow'); r.append(el('span', '레이어'), picker(b)); return r;
  }

  // ── 도구줄 아이콘 ──
  function button() {
    ensureCss();
    const M = model(), hidden = M.items.filter((x) => !x.vis && (BASE.find((d) => d.id === x.id)?.vis ?? true)).length;   // 처음부터 꺼져 있는 수입·지출은 세지 않는다
    const b = el('button', undefined, 'pl-ib awl-btn'); b.type = 'button'; b.innerHTML = svg(IC.layers, 22);
    b.setAttribute('aria-label', hidden ? `레이어 (${hidden}개 숨김)` : '레이어'); b.title = '레이어 — 성격이 같은 일정끼리 켜고 끄며 모아 봐요'; b.setAttribute('aria-controls', 'awl-panel'); b.setAttribute('aria-expanded', String(ui.open));
    if (hidden) b.append(Object.assign(el('span', String(hidden), 'awl-badge'), { ariaHidden: 'true' }));
    b.onclick = () => (ui.open ? close() : open());
    btn = b; return b;
  }

  // ── 패널 ──
  function ensureCss() { if (!document.getElementById('awl-css')) { const s = document.createElement('style'); s.id = 'awl-css'; s.textContent = CSS; document.head.append(s); } }
  function open() {
    ensureCss(); ui.open = true; ui.view = 'list'; ui.msg = '';
    panel?.remove(); panel = el('div', undefined, 'awl-panel'); panel.id = 'awl-panel'; panel.addEventListener('input', () => { if (ui.view === 'settings') ui.dirty = true; }); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', '레이어'); panel.tabIndex = -1;
    document.body.append(panel);
    document.addEventListener('pointerdown', outside, true); document.addEventListener("keydown", onKey, true);
    place(); paint(); syncBtn(); init(); panel.querySelector('.awl-ib, button')?.focus();
  }
  function close() {
    if (!ui.open) return; ui.open = false; panel?.remove(); panel = null; draft = null;
    document.removeEventListener('pointerdown', outside, true); document.removeEventListener("keydown", onKey, true);
    const b = document.querySelector('.awl-btn'); syncBtn(); try { b?.focus({ preventScroll: true }); } catch {}
  }
  // 오른쪽 패널은 아래 입력줄(.sb) 위에서 끝낸다. 폰 세로 시트는 바닥에 붙어 입력줄을 덮는다
  function place() {
    if (!panel) return;
    if (globalThis.matchMedia?.('(max-width:600px)')?.matches) { panel.style.bottom = ''; return; }
    const sb = document.querySelector('.sb'), top = sb && sb.getClientRects().length ? sb.getBoundingClientRect().top : innerHeight;
    panel.style.bottom = Math.max(12, innerHeight - top + 8) + 'px';
  }
  const syncBtn = () => { const b = document.querySelector('.awl-btn'); if (b) b.setAttribute('aria-expanded', String(ui.open)); };
  const outside = (e) => { if (!panel || panel.contains(e.target) || e.target.closest?.('.awl-btn, .pl-pop, .pl-toast')) return; close(); };
  const onKey = (e) => {
    if (!panel) return;
    if (document.querySelector('.pl-pop')) return;   // 열린 일정 창이 Esc·Tab 을 먼저 쓴다
    if (e.key === 'Escape') { e.stopPropagation(); if (ui.view !== 'list') { ui.view = 'list'; draft = null; paint(); } else close(); return; }
    if (e.key === 'Tab') {   // 패널 안에서 순환
      const f = [...panel.querySelectorAll('button:not([disabled]),select:not([disabled]),input:not([disabled]),textarea:not([disabled])')].filter((x) => !x.closest('[hidden]'));
      if (!f.length) return; const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  function paint() {
    if (!panel) return;
    const keep = panel.querySelector('.awl-body')?.scrollTop || 0, view = ui.view, af = document.activeElement, fk = panel.contains(af) ? af.dataset?.fk : null;
    if (view !== ui.viewPainted) ui.dirty = false;
    panel.replaceChildren();
    const body = view === 'collect' ? collectView() : view === 'settings' ? settingsView() : listView();
    panel.append(...body);
    const b = panel.querySelector('.awl-body'); if (b && view === ui.viewPainted) b.scrollTop = keep; ui.viewPainted = view;
    // 다시 그려도 눌렀던 자리에 초점을 돌려준다(보이기 체크 뒤 키보드 사용자가 처음으로 튕기지 않게)
    const seen = {}; for (const x of panel.querySelectorAll('button,select,input,textarea')) { const base = `${view}:${x.getAttribute('aria-label') || x.name || x.textContent.trim().slice(0, 20) || x.tagName}`; seen[base] = (seen[base] || 0) + 1; x.dataset.fk = `${base}#${seen[base]}`; }   // 라벨과 같은 라벨 안의 순번으로 — 목록 길이가 바뀌어도 같은 버튼으로 돌아간다
    if (fk && fk.startsWith(view + ':')) { const x = [...panel.querySelectorAll('[data-fk]')].find((y) => y.dataset.fk === fk); try { x?.focus({ preventScroll: true }); } catch {} }
  }
  const say = (t) => { ui.msg = t || ''; const m = panel?.querySelector('.awl-msg'); if (m) m.textContent = ui.msg; };
  const header = (title, { back, right = [], dotColor } = {}) => {
    const hd = el('div', undefined, 'awl-head');
    if (back) { const bk = el('button', undefined, 'awl-ib'); bk.type = 'button'; bk.innerHTML = svg(IC.back); bk.setAttribute('aria-label', '레이어 목록으로'); bk.onclick = () => { ui.view = 'list'; draft = null; paint(); }; hd.append(bk); }
    const t = el('h2'); if (dotColor) { const d = el('i', undefined, 'awl-ldot'); d.style.background = dotColor; d.style.width = d.style.height = '12px'; t.append(d); } t.append(el('span', title)); hd.append(t, ...right);
    const x = el('button', undefined, 'awl-ib'); x.type = 'button'; x.innerHTML = svg(IC.close); x.setAttribute('aria-label', '레이어 패널 닫기'); x.onclick = close; hd.append(x);
    return hd;
  };
  const msgLine = () => { const m = el('p', ui.msg, 'awl-msg'); m.setAttribute('role', 'status'); m.setAttribute('aria-live', 'polite'); return m; };

  // 목록 보기
  function listView() {
    const M = model(), dates = h.viewDates(), ent = h.items(dates), t = tally(ent.map((e) => e.blk), M), vis = M.items.filter((x) => x.vis).length;
    const add = el('button', undefined, 'awl-ib'); add.type = 'button'; add.innerHTML = svg(IC.plus); add.setAttribute('aria-label', '레이어 추가'); add.title = '레이어 추가';
    add.onclick = () => {
      const id = 'u' + opId(), used = new Set(M.items.map((x) => x.color)), color = SWATCH.find((c) => !used.has(c)) || SWATCH[0]; let done = false;
      commit((s) => (done = LM.add(s, id, '새 레이어', color))); if (done) { ui.view = 'settings'; ui.id = id; ui.sel = id; draft = null; ui.dirty = false; paint(); panel.querySelector('input[name=name]')?.select(); }
    };
    const hd = header('레이어', { right: [add] });
    const sub = el('div', undefined, 'awl-sub'); sub.append(el('span', `${h.viewLabel()} 일정 ${ent.length}개 · 레이어 ${vis}개 보임`));
    const all = el('button', '모두 보기', 'awl-link'); all.type = 'button'; all.disabled = vis === M.items.length; all.onclick = () => { say(''); commit((s) => { LM.showAll(s); return true; }); }; sub.append(all);
    const bodyEl = el('div', undefined, 'awl-body'); bodyEl.setAttribute('role', 'group'); bodyEl.setAttribute('aria-label', '레이어 목록');
    for (const L of M.items) bodyEl.append(...layerRow(L, t.byId[L.id], M));
    const foot = el('div', undefined, 'awl-foot');
    foot.append(el('p', t.unknown ? `분류 불명 ${t.unknown}개 — 기타에 있어요. 기타를 눌러 레이어를 정해 주세요.` : '분류 불명 0개'));
    foot.append(el('p', '켜고 끄면 시간표·종일 줄·이 날 일정 목록·위치 열·지금 하는 일에 같이 적용돼요. 빈 시간 계산은 숨긴 일정도 시간을 쓰는 것으로 봐요.'));
    return [hd, sub, msgLine(), bodyEl, foot];
  }
  function layerRow(L, c, M) {
    const r = el('div', undefined, 'awl-row' + (ui.sel === L.id ? ' sel' : '') + (L.vis ? '' : ' off')); r.dataset.id = L.id; r.style.setProperty('--c', L.color);
    const chk = el('button', undefined, 'awl-chk'); chk.type = 'button'; chk.setAttribute('role', 'checkbox'); chk.setAttribute('aria-checked', String(L.vis)); chk.setAttribute('aria-label', `${L.name} 보이기`); chk.style.setProperty('--c', L.color);
    chk.innerHTML = `<i>${svg(IC.check, 16)}</i>`;
    chk.onclick = () => { say(''); commit((s) => LM.setVis(s, L.id, !L.vis), { fail: '마지막 하나는 끌 수 없어요. 「모두 보기」로 되돌릴 수 있어요.', late: '다른 화면 변경과 겹쳐 이 레이어를 끄지 못했어요(마지막 하나는 켜 둬요).' }); };
    const main = el('button', undefined, 'awl-main'); main.type = 'button'; main.setAttribute('aria-label', `${L.name} 모아보기 · 이번 보기 ${c.n}개`);
    const subs = Object.entries(c.subs).map(([k, v]) => `${k} ${v}`).join(' · ');
    main.append(el('span', L.name, 'awl-name'), el('small', `${c.n}개${subs ? ' · ' + subs : ''}${!L.vis ? ' · 숨김' : ''}`));
    main.onclick = () => { ui.sel = L.id; ui.id = L.id; ui.view = 'collect'; say(''); paint(); loadRange(); };
    r.append(chk, main);
    if (L.subs.length) {
      const ex = el('button', undefined, 'awl-ib'); ex.type = 'button'; const on = ui.exp.has(L.id); ex.innerHTML = svg(on ? IC.up : IC.down, 18); ex.setAttribute('aria-expanded', String(on)); ex.setAttribute('aria-label', `${L.name} 세부 태그 ${on ? '접기' : '펼치기'}`);
      ex.onclick = () => { if (ui.exp.has(L.id)) ui.exp.delete(L.id); else ui.exp.add(L.id); paint(); }; r.append(ex);
    }
    const g = el('button', undefined, 'awl-ib'); g.type = 'button'; g.innerHTML = svg(IC.gear, 18); g.setAttribute('aria-label', `${L.name} 설정`); g.onclick = () => { ui.sel = L.id; ui.id = L.id; ui.view = 'settings'; draft = null; say(''); paint(); }; r.append(g);
    const out = [r];
    if (L.subs.length && ui.exp.has(L.id)) { const s = el('div', undefined, 'awl-subs'); for (const x of L.subs) s.append(el('span', `${x.n} ${c.subs[x.n] || 0}`)); out.push(s); }
    return out;
  }

  // 모아보기
  const RANGES = [['week', '이번 주'], ['next', '다음 주'], ['month', '이번 달'], ['exam', '시험까지'], ['all', '학기 전체']];
  function rangeDates(key) {
    const today = h.today(), mon = addDays(today, -((new Date(today + 'T00:00:00Z').getUTCDay() + 6) % 7)); let a, b;
    if (key === 'week') [a, b] = [mon, addDays(mon, 6)];
    else if (key === 'next') [a, b] = [addDays(mon, 7), addDays(mon, 13)];
    else if (key === 'month') { a = today.slice(0, 8) + '01'; const d = new Date(a + 'T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + 1); d.setUTCDate(0); b = d.toISOString().slice(0, 10); }
    else if (key === 'exam') [a, b] = [today, h.examEnd()];
    else [a, b] = [addDays(today, -7), h.termEnd()];
    const out = []; for (let d = a; d <= b && out.length < 220; d = addDays(d, 1)) out.push(d); return out;
  }
  let rangeSeq = 0;
  async function loadRange() {   // 그 기간의 캘린더를 받아 둔다(받는 동안 「불러오는 중」)
    const ds = rangeDates(ui.range), seq = ++rangeSeq; ui.loading = true; paint();
    try { await h.ensure(ds[0], ds[ds.length - 1]); } catch {}
    if (seq === rangeSeq) { ui.loading = false; if (ui.open && ui.view === 'collect') paint(); }
  }
  function collectView() {
    const M = model(), L = M.byId[ui.id]; if (!L) { ui.view = 'list'; return listView(); }
    const gear = el('button', undefined, 'awl-ib'); gear.type = 'button'; gear.innerHTML = svg(IC.gear, 18); gear.setAttribute('aria-label', `${L.name} 설정`); gear.onclick = () => { ui.view = 'settings'; draft = null; paint(); };
    const hd = header(L.name, { back: true, right: [gear], dotColor: L.color });
    const only = el('button', '이것만 보기', 'awl-link'); only.type = 'button'; only.onclick = () => { commit((s) => LM.only(s, L.id)); };
    const sub = el('div', undefined, 'awl-sub'); sub.append(el('span', L.vis ? '시간표에 보여요' : '시간표에서 숨겨져 있어요'), only);
    const seg = el('div', undefined, 'awl-seg'); seg.setAttribute('role', 'group'); seg.setAttribute('aria-label', '기간');
    for (const [k, t] of RANGES) { const b = el('button', t); b.type = 'button'; b.setAttribute('aria-pressed', String(ui.range === k)); b.onclick = () => { ui.range = k; try { localStorage.setItem('aw-layers-range', k); } catch {} loadRange(); }; seg.append(b); }
    const body = el('div', undefined, 'awl-body'); body.setAttribute('aria-live', 'polite');
    if (ui.loading) { body.append(el('p', '불러오는 중…', 'awl-empty')); return [hd, sub, seg, msgLine(), body]; }
    const dates = rangeDates(ui.range), ent = h.items(dates).filter((e) => classify(e.blk, M).id === L.id), miss = h.missing(dates);
    if (miss) body.append(el('p', `캘린더를 못 불러온 날이 ${miss}일 있어요. 그 날의 구글 캘린더 일정은 빠져 있어요.`, 'awl-empty'));
    ent.sort((x, y) => x.date.localeCompare(y.date) || (x.allDay ? -1 : 0) - (y.allDay ? -1 : 0) || (x.s || 0) - (y.s || 0));
    const dd = L.id === 'deadline' || L.id === 'todo', today = h.today();   // 마감·할 일은 기한순: 날짜 머리에 남은 날을 붙인다
    let last = '';
    for (const e of ent) {
      if (e.date !== last) { last = e.date; const g = el('div', undefined, 'awl-day'); g.append(el('span', `${md(e.date)}(${wdOf(e.date)})`)); if (dd) { const n = Math.round((Date.parse(e.date) - Date.parse(today)) / 864e5); g.append(Object.assign(el('em', n === 0 ? '오늘' : n > 0 ? `D-${n}` : `${-n}일 지남`), { className: n >= 0 && n <= 3 ? 'soon' : '' })); } else if (e.date === today) g.append(el('em', '오늘')); body.append(g); }
      body.append(entryRow(e, M));
    }
    if (L.id === 'todo') {   // 할 일 카드의 기한 있는 할 일(시간표 블록이 아님)
      const ts = h.tasksDue(dates);
      if (ts.length) { body.append(el('div', '기한 있는 할 일 (할 일 카드)', 'awl-h3')); for (const t of ts) { const n = Math.round((Date.parse(t.due) - Date.parse(today)) / 864e5), li = el('div', undefined, 'awl-it'); const m = el('div', undefined, 'awl-itmain'); m.append(el('b', `${md(t.due)}(${wdOf(t.due)}) ${n === 0 ? '오늘' : n > 0 ? 'D-' + n : -n + '일 지남'}`), el('span', `${t.c ? t.c + ' · ' : ''}${t.t}`), el('small', t.kind)); li.append(m); body.append(li); } }
    }
    if (!ent.length && !(L.id === 'todo' && h.tasksDue(dates).length)) {
      const money = L.id === 'income' || L.id === 'expense';
      body.append(el('p', money ? '재무부 데이터와 이어질 레이어예요. 지금은 시간표에 들어온 일정이 없어요.' : `${RANGES.find((r) => r[0] === ui.range)[1]}에는 ${L.name} 일정이 없어요.`, 'awl-empty'));
    }
    return [hd, sub, seg, msgLine(), body];
  }
  function entryRow(e, M) {
    const blk = e.blk, c = classify(blk, M), li = el('div', undefined, 'awl-it'), m = el('button', undefined, 'awl-itmain'); m.type = 'button';
    const when = e.allDay ? '종일' : `${hm(e.s)}–${hme(e.e)}`, title = labelOf(blk), subTxt = blk.k === 'auto' ? '추천' : c.sub || '';
    m.append(el('b', when), el('span', title)); if (subTxt) m.append(el('small', subTxt));
    const who = `${md(e.date)} ${when} ${title}`;   // 날짜·시각·이름이 들어가 같은 이름의 다른 항목과 라벨이 겹치지 않는다(초점 복구 키)
    m.setAttribute('aria-label', `${who}${subTxt ? ' ' + subTxt : ''} 열어서 고치기`);
    m.onclick = (ev) => h.openEntry(e, m, { x: ev.clientX || m.getBoundingClientRect().left, y: ev.clientY || m.getBoundingClientRect().top });
    const go = el('button', undefined, 'awl-ib'); go.type = 'button'; go.innerHTML = svg(IC.go, 18); go.setAttribute('aria-label', `시간표에서 보기 ${who}`); go.title = '시간표에서 보기';
    go.onclick = () => { h.goto(e.date); if (globalThis.matchMedia?.('(max-width:600px)')?.matches) close(); };
    const key = JSON.stringify([e.date, blk.k, blockKeys(blk).inst, e.s ?? 'ad']), isOpen = ui.pickOpen.has(key);
    const mv = el('button', undefined, 'awl-ib'); mv.type = 'button'; mv.innerHTML = svg(IC.layers, 18); mv.setAttribute('aria-expanded', String(isOpen)); mv.setAttribute('aria-label', `${who} 레이어 옮기기`); mv.title = `레이어 옮기기 · 지금 ${M.byId[c.id].name}`;
    mv.onclick = () => { if (ui.pickOpen.has(key)) ui.pickOpen.delete(key); else ui.pickOpen.add(key); paint(); };
    li.append(m, mv, go); if (isOpen) li.append(picker(blk, () => {})); return li;
  }

  // 설정 보기: 이름·색·키워드·순서·영업시간
  function settingsView() {
    const M = model(), L = M.byId[ui.id]; if (!L) { ui.view = 'list'; return listView(); }
    const hd = header(`${L.name} 설정`, { back: true, dotColor: L.color }), body = el('div', undefined, 'awl-body'), f = el('div', undefined, 'awl-form');
    const name = el('input'); name.type = 'text'; name.name = 'name'; name.maxLength = 12; name.value = L.name; name.setAttribute('aria-label', '레이어 이름');
    name.onchange = () => { if (!name.value.trim()) { name.value = L.name; return; } commit((s) => LM.patch(s, L.id, { name: name.value })); };
    const nl = el('label', '이름'); nl.append(name);
    const sw = el('div', undefined, 'awl-sw'); sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', '색');
    for (const c of SWATCH) { const b = el('button'); b.type = 'button'; b.style.setProperty('--c', c); b.innerHTML = '<i></i>'; b.setAttribute('aria-label', `색 ${c}`); b.setAttribute('aria-pressed', String(L.color.toLowerCase() === c)); b.onclick = () => { commit((s) => LM.patch(s, L.id, { color: c })); for (const x of sw.children) x.setAttribute('aria-pressed', String(x === b)); }; sw.append(b); }
    const kw = el('textarea'); kw.value = L.kw; kw.setAttribute('aria-label', '키워드'); kw.placeholder = '예: 헬스, 크로스핏';
    kw.onchange = () => { commit((s) => LM.patch(s, L.id, { kw: kw.value })); };
    const kl = el('label', '키워드 — 일정 제목에 이 말이 들어가면 이 레이어로 모아요 (쉼표로 구분)'); kl.append(kw);
    f.append(nl, el('div', '색', 'awl-h3'), sw, kl, el('small', '이동·준비·식사는 @이동 @준비 @밥 을 적으면 이 레이어로 와요. 직접 지정한 일정은 키워드보다 먼저예요.'));
    const act = el('div', undefined, 'awl-act');
    const ids = M.order, at = ids.indexOf(L.id);
    for (const [lab, to, icon] of [['위로', at - 1, IC.up], ['아래로', at + 1, IC.down]]) { const b = el('button'); b.type = 'button'; b.innerHTML = svg(icon, 16); b.append(el('span', ' ' + lab)); b.disabled = to < 0 || to >= ids.length; b.onclick = () => { commit((s) => LM.move(s, L.id, to)); paint(); }; act.append(b); }
    if (L.user) {
      const del = el('button', '이 레이어 지우기'); del.type = 'button'; del.className = 'danger'; let armed = false;
      del.onclick = () => { if (!armed) { armed = true; del.textContent = '정말 지우기 (일정은 그대로)'; return; } let done = false; commit((s) => (done = LM.remove(s, L.id)), { fail: '보이는 레이어가 이것뿐이라 지울 수 없어요. 다른 레이어를 먼저 켜 주세요.' }); if (done) { ui.view = 'list'; ui.sel = null; paint(); } };
      act.append(del);
    } else { const rs = el('button', '이름·색·키워드 기본값으로'); rs.type = 'button'; rs.onclick = () => { commit((s) => LM.reset(s, L.id)); paint(); }; act.append(rs); }
    f.append(act); body.append(f);
    body.append(...hoursEditor(L));
    return [hd, msgLine(), body];
  }

  // 영업·운영 시간 편집기: 장소마다 요일별 「06:00-23:00, 14:00-16:00」(비우면 휴무), 수업 시작 시각, 쉬는 시간
  const fmtRs = (rs) => (rs || []).map(([a, b]) => `${a}-${b}`).join(', ');
  function parseRs(txt) {
    const t = String(txt || '').trim(); if (!t) return [];
    const out = []; for (const part of t.split(/[,，]/)) { const m = /^\s*(\d{1,2}:\d{2})\s*[-–~]\s*(\d{1,2}:\d{2})\s*$/.exec(part); if (!m) return null; const a = hmMin(m[1]), b = hmMin(m[2]); if (a == null || b == null || b <= a || a >= 1440) return null; out.push([minHm(a), minHm(b)]); }
    return out;
  }
  function parseClasses(txt) { const t = String(txt || '').trim(); if (!t) return undefined; if (/^(오픈짐|open ?gym)$/i.test(t)) return 'OPEN GYM'; const xs = t.split(/[,，\s]+/).filter(Boolean).map(hmMin); return xs.every((x) => x != null) ? xs.map(minHm) : null; }
  function hoursEditor(L) {
    const M = model(), out = [el('div', '영업·운영 시간', 'awl-h3')];
    out.push(el('p', '학교 시간표 화면에만 적용돼요. 옛 얼라이브위크 후보 계산(layers.json)은 그대로예요. 나중에 추천 일정이 이 시간을 읽어요(아직 연결 전).', 'awl-note'));
    const places = mergedPlaces(M, legacy).filter((p) => p.layer === L.id);
    if (legacyFailed && !legacy) out.push(el('p', '기존 얼라이브위크 장소를 불러오지 못했어요. 새로 넣은 장소만 보여요.', 'awl-note'));
    if (!places.length) out.push(el('p', '등록된 장소가 없어요. 아래 「장소 추가」로 헬스장·병원 같은 곳의 시간을 넣어요.', 'awl-note'));
    for (const p of places) out.push(placeCard(L, p));
    if (draft && draft.new) out.push(placeCard(L, draft.place, true));
    const add = el('button', '장소 추가'); add.type = 'button'; add.className = 'awl-link'; add.onclick = () => { draft = { new: true, id: 'app:' + opId(), place: { id: 'app:' + opId(), layer: L.id, name: '', week: Object.fromEntries(DAYS.map((d) => [d, []])) } }; draft.place.id = draft.id; paint(); panel.querySelector('.awl-place:last-of-type input')?.focus(); };
    if (!draft) out.push(add);
    return out;
  }
  function placeCard(L, p, isNew) {
    const card = el('div', undefined, 'awl-place'), bad = { n: 0 }, cur = isNew ? p : { ...p, week: { ...(p.week || {}) }, classes: p.classes ? { ...p.classes } : undefined };
    const top = el('div', undefined, 'awl-pt'); const nm = el('input'); nm.type = 'text'; nm.value = cur.name; nm.placeholder = '장소 이름'; nm.maxLength = 30; nm.setAttribute('aria-label', '장소 이름');
    top.append(nm, el('i', isNew ? '새 장소' : p.src === 'layers.json' ? '기존 값(읽기)' : '앱에서 고친 값')); card.append(top);
    const inputs = {}, grid = el('div', undefined, 'awl-hr');
    for (const d of DAYS) {
      grid.append(el('span', d)); const i = el('input'); i.type = 'text'; i.value = fmtRs(cur.week?.[d]); i.placeholder = '휴무'; i.setAttribute('aria-label', `${d}요일 운영 시간`); i.inputMode = 'text';
      i.oninput = () => { i.setAttribute('aria-invalid', String(parseRs(i.value) === null)); }; inputs[d] = i; grid.append(i);
    }
    card.append(grid);
    const cl = el('input'); cl.type = 'text'; cl.setAttribute('aria-label', '수업 시작 시각'); cl.placeholder = '수업 시작 시각 · 요일별: 월 07:10 10:00 / 수 오픈짐';
    cl.value = DAYS.filter((d) => cur.classes?.[d]).map((d) => `${d} ${Array.isArray(cur.classes[d]) ? cur.classes[d].join(' ') : '오픈짐'}`).join(' / ');
    card.append(cl);
    const br = el('input'); br.type = 'text'; br.setAttribute('aria-label', '쉬는 시간'); br.placeholder = '쉬는 시간(선택) 12:30-13:20'; br.value = cur.brk ? cur.brk.join('-') : '';
    card.append(br);
    const act = el('div', undefined, 'awl-act');
    const copy = el('button', '월 값을 평일에 복사'); copy.type = 'button'; copy.onclick = () => { for (const d of ['화', '수', '목', '금']) { inputs[d].value = inputs['월'].value; inputs[d].setAttribute('aria-invalid', String(parseRs(inputs[d].value) === null)); } };
    const save = el('button', '저장'); save.type = 'button'; save.className = 'go';
    save.onclick = () => {
      const week = {}; for (const d of DAYS) { const v = parseRs(inputs[d].value); if (v === null) { inputs[d].setAttribute('aria-invalid', 'true'); say(`${d}요일 시간 형식을 확인해 주세요 (예: 06:00-23:00, 14:00-16:00).`); inputs[d].focus(); return; } week[d] = v; }
      let classes; const raw = cl.value.trim();
      if (raw) { classes = {}; for (const seg of raw.split('/')) { const m = /^\s*([월화수목금토일])\s+(.+)$/.exec(seg); if (!m) { say('수업 시작 시각은 「월 07:10 10:00 / 수 오픈짐」 꼴로 적어 주세요.'); cl.focus(); return; } const v = parseClasses(m[2]); if (v === null) { say('수업 시작 시각 형식을 확인해 주세요.'); cl.focus(); return; } if (v !== undefined) classes[m[1]] = v; } }
      let brk; if (br.value.trim()) { const r = parseRs(br.value); if (!r || r.length !== 1) { say('쉬는 시간은 12:30-13:20 처럼 한 구간으로 적어 주세요.'); br.focus(); return; } brk = r[0]; }
      const id = isNew ? draft.id : p.id, at = new Date().toISOString().slice(0, 16); save.disabled = true;
      commit((s) => LM.setPlace(s, id, { layer: L.id, name: nm.value.trim() || '이름 없음', week, classes, brk }, at), { fail: '저장하지 못했어요.', done: () => { say('저장했어요.'); draft = null; ui.dirty = false; paint(); } }).then((okk) => { if (!okk) save.disabled = false; });   // 서버 확정 뒤에만 「저장했어요」
    };
    act.append(copy, save);
    if (isNew) { const x = el('button', '취소'); x.type = 'button'; x.onclick = () => { draft = null; paint(); }; act.append(x); }
    else if (p.src === 'app' && String(p.id).startsWith('legacy:')) { const x = el('button', '기존 값으로 되돌리기'); x.type = 'button'; x.onclick = () => { commit((s) => LM.delPlace(s, p.id, false)); ui.dirty = false; paint(); }; act.append(x); }
    else if (!isNew) { const x = el('button', '이 장소 빼기'); x.type = 'button'; x.className = 'danger'; x.onclick = () => { commit((s) => LM.delPlace(s, p.id, String(p.id).startsWith('legacy:'))); ui.dirty = false; paint(); }; act.append(x); }
    card.append(act); return card;
  }

  function afterDraw() { if (!ui.open || !panel) return; place(); if (!h.hostAlive()) { close(); return; } if (ui.view === 'settings') return; paint(); }
  function destroy() { close(); }
  globalThis.addEventListener?.('resize', () => place());
  return { ok, show, adPlans, adCal, dot, row, button, init, hoursAt, afterDraw, destroy, open, close, isOpen: () => ui.open, model };
}
