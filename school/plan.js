// 공부 계획(대표님 10/9 「인스타 버전 학습앱의 공부계획 기능을 그대로 재구성해서 제작」 · 「공부할 거(복습 목록)는 지우고」 · 「시간표는 오늘 기준이 기본」).
// 예전 관제탑 V60·V73 기능을 학교 화면 부품으로 새로 만든다(그 화면을 끼워 넣지 않음):
//   ① 오늘 할 과제 — 남은 과제 + 직접 넣은 할 일, 과목별 묶음, 마감 임박(오늘·내일) 위로, 예상 분(고칠 수 있음),
//      ▶ ⏸ ■ 타이머(멈추면 실제 분 기록 → 같은 과목 실제 평균이 다음 예상), 완료 체크·끝낸 것 목록(되돌리기)
//   ② 숫자 줄 — 지금부터 빈 시간 · 남은 과제 예상 · 오늘 실제
//   ③ 하루 시간표(기본 = 오늘) — 수업·캘린더·고정 일정(근로 등)·계획 + 「다시 짜기」로 과제를 빈 시간에 자동 배치
// 저장은 예전과 같은 원장 S.v60(/api/study/state: est·done·act·run·extra)이라 기록이 이어진다. 저장 충돌(409)이면 새로 읽고 다시.
const el = (tag, text, cls) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; };
const svg = (d) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = { play: '<path d="M7 5l12 7-12 7z" fill="currentColor"/>', pause: '<path d="M8 5v14M16 5v14"/>', stop: '<rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/>', prev: '<path d="M15 6l-6 6 6 6"/>', next: '<path d="M9 6l6 6-6 6"/>', replan: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>', plus: '<path d="M12 5v14M5 12h14"/>', undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>' };
const ib = (icon, label, cls = '') => { const b = el('button', undefined, 'pl-ib ' + cls); b.type = 'button'; b.innerHTML = svg(ICON[icon]); b.setAttribute('aria-label', label); b.title = label; return b; };
const mins = (hm) => { const [h, m] = String(hm || '0:0').split(':').map(Number); return h * 60 + (m || 0); };
const hm = (n) => `${String(Math.floor(n / 60) % 24).padStart(2, '0')}:${String(Math.round(n % 60)).padStart(2, '0')}`;
const dur = (n) => { n = Math.max(0, Math.round(n)); const h = Math.floor(n / 60), m = n % 60; return h ? `${h}시간${m ? ' ' + m + '분' : ''}` : `${m}분`; };
const kst = (d = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(d);
const nowMin = () => { const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()); return mins(p); };
const addDays = (date, n) => { const d = new Date(date + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const WD = ['일', '월', '화', '수', '목', '금', '토'];
const wd = (date) => WD[new Date(date + 'T00:00:00Z').getUTCDay()];
const keyOf = (c, t) => `${c}|${t}`;
const DAY = { start: 0, end: 24 * 60, wake: 8 * 60, bed: 24 * 60 };   // 시간표 0~24시, 자동 배치는 08~24시
const BREAK = 10, MIN_SLOT = 25, DEFAULT_EST = 60;

const CSS = `
.pl{display:flex;flex-direction:column;gap:14px;max-width:1120px;margin:12px auto 0}
.pl-card{background:#fff;border:1px solid #e3e8e4;border-radius:18px;padding:16px 18px}
.pl-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 10px}
.pl-head h2{margin:0;font:700 17px/1.3 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#14261f}
.pl-head small{color:#6b7c73;font:500 13px "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-hot{background:#c9472f;color:#fff;border-radius:999px;padding:3px 9px;font:700 12px/1.2 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-group{border:1px solid #edf1ee;border-radius:14px;padding:10px 12px;margin:0 0 10px}
.pl-group.urgent{border-color:#f0c4ba;background:#fff8f6}
.pl-gname{display:flex;gap:8px;align-items:baseline;margin:0 0 6px;font:700 15px/1.3 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#1f3d33}
.pl-group.urgent .pl-gname b{color:#b23a22}
.pl-gname small{font-weight:500;color:#6b7c73;font-size:12.5px}
.pl-task{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid #f0f3f1}
.pl-task:first-of-type{border-top:0}
.pl-body{flex:1;min-width:0}
.pl-title{font:600 14.5px/1.4 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#14261f;overflow-wrap:anywhere}
.pl-meta{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:3px;font:500 12.5px/1.4 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#6b7c73}
.pl-meta .due.soon{color:#b23a22;font-weight:700}
.pl-meta input{width:60px!important;height:28px!important;min-height:0!important;margin:0!important;padding:0 6px!important;border:1px solid #d5ddd8!important;border-radius:8px!important;font:600 13px "Pretendard Variable",Pretendard,system-ui,sans-serif!important;flex:none}
.pl-clock{font:700 13px/1 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#2e6b52;font-variant-numeric:tabular-nums;min-width:52px;text-align:right}
.pl-ib{flex:none;width:40px;height:40px;border-radius:50%;border:1px solid #d5ddd8;background:#fff;color:#1f3d33;display:grid;place-items:center;cursor:pointer;padding:0}
.pl-ib.go{background:#2e6b52;border-color:#2e6b52;color:#fff}
.pl-ib:focus-visible{outline:3px solid #f2c94c;outline-offset:2px}
.pl-check{flex:none;width:24px;height:24px;accent-color:#2e6b52;cursor:pointer}
.pl-done .pl-title{text-decoration:line-through;color:#8a9a92}
.pl-sub-hw{color:#b0581f!important}.pl-sub-st{color:#2e6b52!important}
.pl-sub{margin:12px 0 6px;font:700 13px/1.3 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#4b6358}
.pl-add{display:flex!important;flex-wrap:wrap;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid #edf1ee}
.pl-add > *{width:auto!important;margin:0!important;min-height:0!important}
.pl-add select{flex:0 0 150px}.pl-add select[name=kind]{flex:0 0 84px}.pl-add input[name=due]{flex:0 0 150px}
.pl-add select,.pl-add input{height:40px!important;box-sizing:border-box;border:1px solid #d5ddd8;border-radius:10px;padding:0 10px;font:500 14px "Pretendard Variable",Pretendard,system-ui,sans-serif;background:#fff}
.pl-add input[name=t]{flex:1 1 200px;min-width:0}.pl-add input[name=est]{flex:0 0 76px}
.pl-add button{height:38px;padding:0 14px;border-radius:10px;border:1px solid #2e6b52;background:#2e6b52;color:#fff;font:600 14px "Pretendard Variable",Pretendard,system-ui,sans-serif;cursor:pointer}
.pl-empty{color:#6b7c73;font:500 14px/1.5 "Pretendard Variable",Pretendard,system-ui,sans-serif;margin:4px 0}
.pl-nums{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.pl-num{background:#fff;border:1px solid #e3e8e4;border-radius:14px;padding:12px 14px}
.pl-num small{display:block;color:#6b7c73;font:500 12.5px "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-num b{display:block;margin-top:4px;font:800 19px/1.2 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#14261f}
.pl-bar{display:flex;align-items:center;gap:6px;margin-left:auto}
.pl-bar .pl-today{height:40px;padding:0 14px;border-radius:10px;border:1px solid #d5ddd8;background:#fff;font:600 14px "Pretendard Variable",Pretendard,system-ui,sans-serif;cursor:pointer}
.pl-day{position:relative;height:min(62dvh,620px);overflow:auto;border:1px solid #edf1ee;border-radius:12px;overscroll-behavior:contain}
.pl-grid{position:relative;margin-left:52px}
.pl-hour{position:absolute;left:-52px;right:0;border-top:1px solid #f0f3f1;font:600 11.5px/1 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#8a9a92}
.pl-hour span{position:absolute;left:8px;top:4px}
.pl-blk{position:absolute;left:6px;right:8px;border-radius:8px;padding:4px 8px;overflow:hidden;font:600 12.5px/1.35 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#14261f;background:#fff;border:1px solid #dfe5e1;box-shadow:inset 4px 0 0 var(--k,#8a9a92)}
.pl-blk small{display:block;font-weight:500;color:#6b7c73}
.pl-blk.k-class{--k:#4f6b8a}.pl-blk.k-cal{--k:#7a8796}.pl-blk.k-work{--k:#c98a2b}.pl-blk.k-plan{--k:#2e6b52}
.pl-blk.k-auto{--k:#2e6b52;background:#eef6f1;border-style:dashed}
.pl-blk.past{opacity:.55}
.pl-now{position:absolute;left:-6px;right:0;height:0;border-top:2px solid #d0453a;z-index:3}
.pl-now span{position:absolute;left:-46px;top:-9px;background:#d0453a;color:#fff;border-radius:6px;padding:1px 5px;font:700 11px "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-seg{display:flex;gap:2px;padding:2px;border-radius:12px;background:#f3f6f4}
.pl-seg .pl-ib{border:0;background:none;width:38px;height:38px;border-radius:10px}
.pl-seg .pl-ib[aria-pressed=true]{background:#fff;box-shadow:0 1px 3px #0002;color:#1f4d3b}
.pl-week{display:block}
.pl-wkhead{position:sticky;top:0;z-index:4;display:grid;grid-template-columns:40px repeat(7,minmax(0,1fr));background:#fff;border-bottom:1px solid #edf1ee}
.pl-wkday{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0;border:0;background:none;cursor:pointer;font:700 15px/1.1 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#1f3d33}
.pl-wkday small{font:600 11px "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#6b7c73}
.pl-wkday.today b{background:#2e6b52;color:#fff;border-radius:999px;padding:2px 7px}
.pl-wkbody{position:relative;display:grid;grid-template-columns:40px repeat(7,minmax(0,1fr))}
.pl-wkgut{position:relative}.pl-wkgut span{position:absolute;left:6px;transform:translateY(-6px);font:600 10.5px/1 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#8a9a92}
.pl-wkcol{position:relative;border-left:1px solid #f0f3f1}.pl-wkcol.today{background:#f7fbf8}
.pl-wkline{position:absolute;left:0;right:0;border-top:1px solid #f4f6f5}
.pl-wkcol .pl-blk{left:2px;right:2px;padding:2px 4px;font-size:11px}
.pl-wkcol .pl-now{left:0}
.pl-blk.k-exam{--k:#c9472f;background:#fff1ee;font-weight:700}
.pl-grid.has-lane .pl-blk{right:92px}
.pl-lane{position:absolute;top:0;bottom:0;right:4px;width:80px;border-left:1px dashed #e3e8e4}
.pl-place{position:absolute;left:6px;right:0;border-radius:8px;background:#eef2f7;border:1px solid #d9e1ea;color:#3d4f63;font:700 11.5px/1.2 "Pretendard Variable",Pretendard,system-ui,sans-serif;padding:3px 6px;overflow:hidden}
.pl-place.move{background:repeating-linear-gradient(135deg,#f4f6f8 0 6px,#e9edf2 6px 12px);color:#6b7c8a}
.pl-placebar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 10px}
.pl-placelabel{font:700 13px "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#4b6358;margin-right:2px}
.pl-chip{height:34px;padding:0 12px;border-radius:999px;border:1px solid #d5ddd8;background:#fff;font:600 13px "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#1f3d33;cursor:pointer}
.pl-chip:hover{border-color:#2e6b52}
.pl-placein{width:90px!important;height:34px!important;min-height:0!important;margin:0!important;padding:0 10px!important;border:1px solid #d5ddd8!important;border-radius:999px!important;font:500 13px "Pretendard Variable",Pretendard,system-ui,sans-serif!important}
.pl-placebar .pl-ib{width:34px;height:34px}
.pl-mode{height:40px;padding:0 12px;border-radius:10px;border:1px solid #d5ddd8;background:#fff;font:600 13.5px "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#1f3d33;cursor:pointer}
.pl-fill{background:#eef6f1;border-color:#2e6b52;color:#1f4d3b}
.pl-mode[aria-pressed=true]{background:#2e6b52;border-color:#2e6b52;color:#fff}
.pl-week.planning .pl-wkcol{cursor:copy}.pl-week.planning .pl-wkcol:hover{background:#f2f8f4}
.pl-exam{overflow-x:auto}
.pl-wkday.exam small,.pl-wkday.exam b{color:#b23a22}
.pl-wkcol.exam{background:#fff7f5}
.pl-schedule{position:relative}
.pl-pop{position:fixed;z-index:70;width:290px;display:flex!important;flex-direction:column;gap:6px;padding:12px;border-radius:14px;background:#fff;box-shadow:0 14px 36px #0003;border:1px solid #e3e8e4}
.pl-pop b{font:700 14px "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#14261f}
.pl-pop select,.pl-pop input{width:100%!important;height:38px!important;min-height:0!important;margin:0!important;border:1px solid #d5ddd8!important;border-radius:10px!important;padding:0 10px!important;font:500 14px "Pretendard Variable",Pretendard,system-ui,sans-serif!important;box-sizing:border-box}
.pl-pop button{height:38px;border-radius:10px;border:1px solid #2e6b52;background:#2e6b52;color:#fff;font:600 14px "Pretendard Variable",Pretendard,system-ui,sans-serif;cursor:pointer}
.pl-pop button.danger{background:#fff;color:#b23a22;border-color:#e6b4a8}
.pl-blk.edit{cursor:pointer}.pl-blk.edit:hover,.pl-blk.edit:focus-visible{outline:2px solid #2e6b52;outline-offset:1px}
.pl-place{cursor:pointer}
.pl-pop button.ghost{background:#fff;color:#1f3d33;border-color:#d5ddd8}
.pl-inclass{display:flex;align-items:baseline;gap:8px;padding:6px 2px;color:#4b6358;font:500 13.5px/1.4 "Pretendard Variable",Pretendard,system-ui,sans-serif}.pl-inclass b{font-weight:700;color:#1f3d33}.pl-inclass small{margin-left:auto;color:#8a9a92}
.pl-unsaved{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 10px;padding:8px 12px;border-radius:12px;background:#fff4e5;border:1px solid #f0d9a8;color:#8a5a14;font:600 13px "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-popnote{color:#6b7c73;font:500 12px/1.4 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-note{margin:8px 0 0;color:#6b7c73;font:500 12.5px "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-left{margin-top:8px;color:#b23a22;font:600 13px "Pretendard Variable",Pretendard,system-ui,sans-serif}
@media (max-width:600px){.pl-nums{grid-template-columns:1fr 1fr 1fr}.pl-num{padding:10px}.pl-num b{font-size:16px}.pl-card{padding:14px}.pl-task{flex-wrap:wrap}.pl-body{flex-basis:calc(100% - 40px)}}
`;

export function createPlan(app) {
  if (!document.getElementById('plan-css')) { const s = document.createElement('style'); s.id = 'plan-css'; s.textContent = CSS; document.head.append(s); }
  let st = null, v60 = null, host = null, ctx = null, day = kst(), tick = null, gen = 0, saving = Promise.resolve();
  const cache = new Map(), calFail = new Map();   // 날짜별 캘린더(확인된 것만) · 받기 실패 시각
  let bootDay = kst();
  const calOk = (date) => cache.has(date);

  async function load() {
    const r = await fetch('/api/study/state', { credentials: 'same-origin', cache: 'no-store' });
    if (!r.ok) throw new Error('공부 계획 기록을 불러오지 못했어요.');
    st = (await r.json()).state || {};
    v60 = st.v60 || (st.v60 = {});
    for (const k of ['est', 'done', 'act', 'run']) if (!v60[k] || typeof v60[k] !== 'object') v60[k] = {};
    if (!Array.isArray(v60.extra)) v60.extra = [];
  }
  // 바꾸기(오타 검수 10/9 반영): 바꾸기 함수를 「아직 저장 안 된 목록」(pend)에 쌓고, 저장은 한 줄로(직렬).
  // 보낸 만큼 성공하면 그만큼 목록에서 뺀다. 다른 화면이 먼저 바꿨으면(409) 새로 읽고 「안 된 것 전부」를 차례로 다시 적용해 재시도.
  // 그 밖의 실패면 목록을 남겨 두고 「저장 안 된 변경 N개 · 다시 저장」을 보여 준다. 바꾸기 함수는 값(시각·분)을 밖에서 미리 정해 두어
  // 다시 적용해도 같은 결과가 되게 한다.
  let pend = [], saveErr = '';
  function save(mutate) { mutate(v60); pend.push(mutate); draw(); return flush(); }
  function flush() {
    saving = saving.then(async () => {
      for (let tryNo = 0; pend.length && tryNo < 3; tryNo++) {
        const batch = pend.length, body = JSON.stringify({ state: st, client: 'school-plan' });
        const r = await fetch('/api/study/state', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body }).catch(() => null);
        if (r?.ok) { const j = await r.json().catch(() => ({})); if (j.workspaceRevision) v60.workspaceRevision = j.workspaceRevision; pend.splice(0, batch); saveErr = ''; continue; }
        if (r?.status === 409) { await load(); for (const m of pend) m(v60); continue; }
        throw new Error('저장하지 못했어요' + (r ? `(${r.status})` : '(연결 끊김)'));
      }
      if (pend.length) throw new Error('다른 화면에서 계속 바뀌어 저장하지 못했어요. 다시 저장을 눌러 주세요.');
    }).catch((e) => { saveErr = e.message; app.status?.(e.message, true); }).then(() => draw());
    return saving;
  }

  // 과제 + 직접 넣은 할 일 → 할 일 하나 = {key, c, t, due(날짜), time, days(남은 날), est, kind, src, files, extraId}
  function tasks() {
    const today = ctx.today, out = [];   // 서버 날짜 기준(화면 전체와 같게)
    for (const r of ctx.deadlines || []) {
      if (r.submitted) continue;   // pendingDeadlines 가 이미 제출 전만 주지만 한 번 더
      const t = String(r.title || '').replace(new RegExp('^\\s*' + (r.course || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*[·:-]?\\s*'), '');
      out.push({ key: keyOf(r.course, r.title), c: r.course, t, due: r.deadlineDate || '', time: r.deadlineTime || '', days: r.deadlineDays, kind: '과제', files: r.files || [] });
    }
    for (const x of v60.extra) {
      const days = x.due ? Math.round((Date.parse(x.due) - Date.parse(today)) / 864e5) : null;
      out.push({ key: keyOf(x.c, x.t), c: x.c, t: x.t, due: x.due || '', time: x.time || '', days, kind: x.kind === '과제' ? '과제' : '공부', extraId: x.id, estDefault: x.est });   // 직접 넣은 것: 공부(기본) 또는 과제
    }
    for (const t of out) { t.est = estimate(t); t.inClass = !!ctx.inClass?.(t.c); }   // 수업 당일 과제(CADD 등)
    return out;
  }
  // 예상 분: 직접 고친 값 > 같은 과목·종류 실제 평균 > 넣을 때 적은 값 > 60
  function estimate(t) {
    if (Number.isFinite(v60.est[t.key])) return { min: v60.est[t.key], src: '직접' };
    const same = Object.values(v60.act).filter((a) => a && a.c === t.c && (a.kind || '과제') === t.kind && a.min > 0);
    if (same.length) return { min: Math.round(same.reduce((n, a) => n + a.min, 0) / same.length), src: `실제 평균 ${same.length}건` };
    if (Number.isFinite(t.estDefault)) return { min: t.estDefault, src: '넣은 값' };
    return { min: DEFAULT_EST, src: '기본값' };
  }
  // 실제 분 기록: ■ 와 완료 체크 둘 다 이 한 길로 — 이전 기록에 더한다(덮어쓰지 않음). 날짜는 화면 날짜(ctx.today)
  function finishAct(s, t, add, now) {
    const prev = s.act[t.key];
    s.act[t.key] = { c: t.c, t: t.t, kind: t.kind, min: (prev?.min || 0) + add, at: now, date: ctx.today, days: { ...(prev?.days || {}), [ctx.today]: ((prev?.days || {})[ctx.today] || 0) + add } };
  }
  const running = (key) => v60.run[key];
  const elapsed = (key) => { const r = running(key); if (!r) return 0; return (r.acc || 0) + (r.t0 ? Date.now() - r.t0 : 0); };
  const clock = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 3600) ? Math.floor(s / 3600) + ':' : ''}${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

  function taskRow(t, done) {
    const row = el('div', undefined, 'pl-task' + (done ? ' pl-done' : '')); row.dataset.key = t.key;
    const body = el('div', undefined, 'pl-body'); body.append(el('div', t.t, 'pl-title'));
    const meta = el('div', undefined, 'pl-meta');
    if (t.due) { const soon = t.days !== null && t.days <= 1; meta.append(el('span', t.days === 0 ? `오늘 ${t.time || ''}`.trim() : t.days === 1 ? `내일 ${t.time || ''}`.trim() : t.days < 0 ? `${-t.days}일 지남` : `${t.due.slice(5).replace('-', '/')}(${wd(t.due)}) · D-${t.days}`, 'due' + (soon ? ' soon' : ''))); }
    if (!done) {
      const inp = el('input'); inp.type = 'number'; inp.min = 5; inp.max = 600; inp.step = 5; inp.value = t.est.min; inp.setAttribute('aria-label', `${t.t} 예상 분`);
      inp.onchange = () => { const v = Math.max(5, Math.min(600, Math.round(Number(inp.value) || DEFAULT_EST))); save((s) => { s.est[t.key] = v; }); };
      meta.append(el('span', '약'), inp, el('span', `분 · ${t.kind} · ${t.est.src}`));
    } else { const a = v60.act[t.key]; meta.append(el('span', a?.min ? `실제 ${dur(a.min)}` : '끝냄')); }
    for (const f of (t.files || []).slice(0, 2)) if (f.href) { const a = el('a', f.label || '파일'); a.href = '../' + f.href; a.target = '_blank'; a.rel = 'noopener'; meta.append(a); }
    body.append(meta); row.append(body);
    if (!done) {
      const r = running(t.key);
      if (r) { const c = el('span', clock(elapsed(t.key)), 'pl-clock'); c.dataset.clock = t.key; row.append(c); }
      // 값(시각·누적)은 누르는 순간 밖에서 정해 두고 바꾸기 함수는 그 값만 쓴다 — 충돌 뒤 다시 적용해도 같은 결과(오타 검수 10/9)
      if (!r || !r.t0) { const b = ib('play', r ? '이어서' : '시작', 'go'); b.onclick = () => { const now = Date.now(), acc = r?.acc || 0; save((s) => { s.run[t.key] = { t0: now, acc, c: t.c, t: t.t, kind: t.kind, day: ctx.today }; }); }; row.append(b); }
      else { const b = ib('pause', '잠깐 멈춤'); b.onclick = () => { const acc = elapsed(t.key); save((s) => { const x = s.run[t.key]; if (x) { x.acc = acc; x.t0 = null; } }); }; row.append(b); }
      if (r) { const b = ib('stop', '끝내고 실제 시간 기록'); b.onclick = () => { const add = Math.round(elapsed(t.key) / 60000), now = Date.now(); save((s) => { delete s.run[t.key]; finishAct(s, t, add, now); }); }; row.append(b); }
    }
    const ck = el('input', undefined, 'pl-check'); ck.type = 'checkbox'; ck.checked = !!done; ck.setAttribute('aria-label', done ? `${t.t} 완료 되돌리기` : `${t.t} 완료`);
    ck.onchange = () => {
      if (ck.checked) { const now = Date.now(), add = running(t.key) ? Math.round(elapsed(t.key) / 60000) : 0;
        save((s) => { s.done[t.key] = now; (s.doneDate = s.doneDate || {})[t.key] = ctx.today; if (s.run[t.key]) { delete s.run[t.key]; if (add > 0) finishAct(s, t, add, now); } }); }
      else save((s) => { delete s.done[t.key]; if (s.doneDate) delete s.doneDate[t.key]; });
    };
    row.append(ck);
    return row;
  }

  function taskCard(all) {
    const card = el('section', undefined, 'pl-card pl-tasks'); card.setAttribute('aria-label', '오늘 할 일');
    const inClass = all.filter((t) => t.inClass && !v60.done[t.key]); all = all.filter((t) => !t.inClass);
    // 오늘 끝낸 것 = 완료 날짜(doneDate, 화면 날짜)가 오늘. 예전 기록(날짜 없음)은 체크 시각의 날짜로
    const open = all.filter((t) => !v60.done[t.key]), finished = all.filter((t) => v60.done[t.key] && (v60.doneDate?.[t.key] || kst(new Date(v60.done[t.key]))) === ctx.today);
    const urgent = open.filter((t) => t.days !== null && t.days <= 1).length;
    const head = el('div', undefined, 'pl-head'); head.append(el('h2', '오늘 할 일')); if (urgent) head.append(el('span', `마감 임박 ${urgent}`, 'pl-hot'));
    head.append(el('small', `${open.length}개 · 예상 합계 ${dur(open.reduce((n, t) => n + t.est.min, 0))}`)); card.append(head);
    if (pend.length && saveErr) { const bar = el('div', `저장 안 된 변경 ${pend.length}개 — ${saveErr} `, 'pl-unsaved'); bar.setAttribute('role', 'alert'); const re = el('button', '다시 저장', 'pl-today'); re.type = 'button'; re.onclick = () => { saveErr = ''; flush(); }; bar.append(re); card.append(bar); }
    if (!open.length) card.append(el('p', '오늘 남은 일이 없어요.', 'pl-empty'));
    const focus = (t) => !ctx.focus || ctx.focus(t.c);
    // 과제(제출하는 것)와 공부(시험 준비)를 나눠서(대표님 10/9 「과제랑 공부 구분」), 집중 과목 밖은 맨 아래
    for (const kind of ['과제', '공부', '그 밖']) {
      const list = kind === '그 밖' ? open.filter((t) => !focus(t)) : open.filter((t) => t.kind === kind && focus(t));
      if (!list.length) { if (kind === '공부') card.append(el('div', '공부', 'pl-sub pl-sub-st'), el('p', '오늘 할 공부가 아직 없어요. 아래에서 넣거나 스앵님께 계획을 부탁하세요.', 'pl-empty')); continue; }
      card.append(el('div', kind === '그 밖' ? '그 밖 과목 — 시험 기간엔 자동 배치 안 함' : kind, 'pl-sub pl-sub-' + (kind === '과제' ? 'hw' : kind === '공부' ? 'st' : 'etc')));
      const groups = new Map(); for (const t of list) { if (!groups.has(t.c)) groups.set(t.c, []); groups.get(t.c).push(t); }
      const order = [...groups.entries()].sort((a, b) => Math.min(...a[1].map((t) => t.days ?? 999)) - Math.min(...b[1].map((t) => t.days ?? 999)));
      for (const [c, ts] of order) {
        ts.sort((a, b) => (a.days ?? 999) - (b.days ?? 999));
        const g = el('div', undefined, 'pl-group' + (ts.some((t) => t.days !== null && t.days <= 1) ? ' urgent' : ''));
        const n = el('div', undefined, 'pl-gname'); n.append(el('b', c), el('small', `${ts.length}개 · 약 ${dur(ts.reduce((s, t) => s + t.est.min, 0))}`)); g.append(n);
        for (const t of ts) g.append(taskRow(t, false));
        card.append(g);
      }
    }
    if (inClass.length) {   // 수업 당일 과제: 타이머·자동 배치 없이 참고로만
      card.append(el('div', '수업 중에 할 과제', 'pl-sub pl-sub-etc'));
      for (const t of inClass) { const r = el('div', undefined, 'pl-inclass'); r.append(el('b', t.c), el('span', t.t), el('small', t.due ? `${t.due.slice(5).replace('-', '/')}(${wd(t.due)})${t.days !== null && t.days >= 0 ? ' · D-' + t.days : ''}` : '')); card.append(r); }
    }
    if (finished.length) { card.append(el('div', '오늘 끝낸 것', 'pl-sub')); for (const t of finished) card.append(taskRow(t, true)); }
    // 할 일 넣기: 과목 · 할 일 · 마감 날짜 · 예상 분
    const add = el('form', undefined, 'pl-add'); add.setAttribute('aria-label', '할 일 넣기');
    const kindSel = el('select'); kindSel.name = 'kind'; kindSel.setAttribute('aria-label', '종류'); for (const k of ['공부', '과제']) kindSel.append(Object.assign(el('option', k), { value: k }));
    const sel = el('select'); sel.name = 'c'; sel.setAttribute('aria-label', '과목'); for (const c of ctx.courses || []) sel.append(Object.assign(el('option', c), { value: c }));
    const t = el('input'); t.name = 't'; t.placeholder = '할 일'; t.required = true; t.maxLength = 120; t.setAttribute('aria-label', '할 일');
    const due = el('input'); due.name = 'due'; due.type = 'date'; due.value = ctx.today; due.setAttribute('aria-label', '마감 날짜');
    const est = el('input'); est.name = 'est'; est.type = 'number'; est.min = 5; est.max = 600; est.step = 5; est.value = 30; est.setAttribute('aria-label', '예상 분');
    const go = el('button', '추가'); go.type = 'submit'; add.append(kindSel, sel, t, due, est, go);
    add.onsubmit = (e) => { e.preventDefault(); const text = t.value.trim(); if (!text) return; const item = { id: 'x' + Date.now().toString(36), kind: kindSel.value, c: sel.value, t: text, due: due.value, time: '', est: Math.max(5, Number(est.value) || 30) };
      if (v60.extra.some((x) => x.c === item.c && x.t === item.t)) { app.status?.('같은 할 일이 이미 있어요.', true); return; } save((s) => { s.extra.push(item); }); };
    card.append(add);
    return card;
  }

  // 하루 고정 블록: 수업(오늘은 학교 시간표) · 캘린더 · 고정 일정(근로 등 routine) · 공부 계획(workspace plans)
  function fixedBlocks(date) {
    const out = [];
    if (date === ctx.today) for (const c of ctx.scheduled || []) if (!c.record?.cancelled) out.push({ s: mins(c.s), e: mins(c.e), title: c.course + ' 수업', k: 'class' });
    for (const ev of cache.get(date) || []) { if (ev.allDay || !ev.start || !ev.end) continue; const title = /^\s*운선/.test(ev.title || '') ? '개인 일정' : (ev.title || '일정'); out.push({ s: mins(ev.start), e: mins(ev.end), title, k: 'cal' }); }
    const hol = (ctx.routine?.holidays || []).find((h) => h.date === date);
    for (const r of ctx.routine?.grid?.[wd(date)] || []) {
      if ((r.validFrom && date < r.validFrom) || (r.validUntil && date > r.validUntil) || (r.exdate || []).includes(date) || (hol && (hol.affects || []).includes(r.kind))) continue;
      out.push({ s: mins(r.start), e: mins(r.end), title: r.title, k: 'work' });
    }
    for (const x of (ctx.exams || []).filter((x) => x.date === date)) { const s = x.time ? mins(x.time) : 9 * 60; out.push({ s, e: s + 90, title: `시험 · ${x.course}${x.assumed ? ' (예정)' : ''}`, k: 'exam' }); }
    for (const p of (ctx.plans || []).filter((p) => p.date === date && !p.activity)) out.push({ s: mins(p.s), e: mins(p.e), title: (ctx.courseName?.(p.courseId) || '') + (p.note ? ' · ' + p.note : ''), k: 'plan', plan: p });
    return out.filter((b) => b.e > b.s).sort((a, b) => a.s - b.s);
  }
  // 빈 칸: 깨어 있는 시간(08~24시, 오늘이면 지금부터)에서 고정 블록을 빼고, 앞뒤 쉬는 10분, 25분 이상만
  function freeSlots(date, fixed) {
    let from = DAY.wake; if (date === ctx.today) from = Math.max(from, Math.ceil(nowMin() / 5) * 5);
    const slots = []; let cur = from;
    for (const b of fixed) { if (b.e <= cur) continue; if (b.s - BREAK > cur) slots.push([cur, b.s - BREAK]); cur = Math.max(cur, b.e + BREAK); }
    if (DAY.bed > cur) slots.push([cur, DAY.bed]);
    return slots.filter(([a, b]) => b - a >= MIN_SLOT);
  }

  // 채우기(대표님 10/9 「고정 일정은 그대로 두고 변동 일정만 학습 관련으로 자동 계산해 채우기」):
  // 고정 블록(수업·캘린더·routine·시험·이미 있는 계획)은 건드리지 않고, 그 사이 빈 시간에만 공부 계획을 만들어 저장한다.
  //  ① 남은 과제·공부(마감 빠른 순, 남은 분만큼, 마감일 지나서는 안 넣음) ② 그다음 시험 공부(집중 4과목, 시험 가까운 순 돌아가며 50분)
  //  하루 공부 상한(dailyCap 시간) 안에서, 과목 시험일 이후엔 그 과목 시험 공부 없음. 날마다 따로 저장(수업 겹침 등 서버 거절은 그날만 실패로 알림).
  const FILL_BLOCK = 50;
  function buildFill(dates, all) {
    const queue = all.filter((t) => !t.inClass && !v60.done[t.key] && (t.days === null || t.days >= 0) && (!ctx.focus || ctx.focus(t.c) || (t.days !== null && t.days <= 1)))
      .map((t) => ({ t, need: t.est.min - Math.round(elapsed(t.key) / 60000) - (v60.act[t.key]?.min || 0) })).filter((x) => x.need > 0)
      .sort((a, b) => (a.t.days ?? 999) - (b.t.days ?? 999));
    const exams = (ctx.exams || []).slice().sort((a, b) => a.date.localeCompare(b.date));
    const cap = (ctx.dailyCap || 4) * 60, perDay = [];
    let rot = 0;
    for (const date of dates) {
      if (date < ctx.today) continue;
      const fixed = fixedBlocks(date);
      if (!calOk(date)) { perDay.push({ date, items: [], skipped: '캘린더 확인 못 함' }); continue; }
      let used = fixed.filter((b) => b.k === 'plan').reduce((n, b) => n + (b.e - b.s), 0);
      const slots = freeSlots(date, fixed).map(([a, b]) => ({ a, b })), items = [];
      const put = (min, courseName, note) => {
        for (const sl of slots) {
          const room = Math.min(sl.b - sl.a, cap - used); if (room < MIN_SLOT) continue;
          const len = Math.min(room, min); if (len < MIN_SLOT && len < min) continue;
          items.push({ date, s: hm(sl.a), e: hm(sl.a + len), courseId: ctx.courseId?.(courseName), note, kind: '자동 채움' });
          sl.a += len + BREAK; used += len; return len;
        }
        return 0;
      };
      for (const q of queue) {
        if (q.need <= 0 || (q.t.due && q.t.due < date)) continue;
        while (q.need > 0) { const got = put(q.need, q.t.c, `${q.t.kind} · ${q.t.t}`); if (!got) break; q.need -= got; }
      }
      const live = exams.filter((x) => x.date > date);   // 그날 이후 시험이 남은 과목만
      for (let guard = 0; live.length && used + MIN_SLOT <= cap && guard < 20; guard++) {
        const x = live[rot++ % live.length];
        if (!put(FILL_BLOCK, x.course, `시험 공부 · ${x.course} (시험 ${x.date.slice(5).replace('-', '/')})`)) break;
      }
      perDay.push({ date, items: items.filter((i) => i.courseId) });
    }
    return perDay;
  }
  async function runFill(dates, all) {
    const plan = buildFill(dates, all), total = plan.reduce((n, d) => n + d.items.length, 0);
    if (!total) { app.status?.('채울 빈 시간이 없어요(고정 일정·하루 상한·캘린더 확인을 봐 주세요).'); return; }
    const span = plan.filter((d) => d.items.length).map((d) => d.date.slice(5).replace('-', '/'));
    if (!confirm(`빈 시간에 공부 계획 ${total}개를 넣을까요?\n${span.join(', ')}\n고정 일정·이미 있는 계획은 그대로 둬요.`)) return;
    let ok = 0; const bad = [];
    for (const d of plan) {
      for (let i = 0; i < d.items.length; i += 12) {   // 서버는 한 번에 12개까지
        const r = await ctx.addPlan?.(d.items.slice(i, i + 12), true);
        if (r === false) { bad.push(d.date.slice(5).replace('-', '/')); break; }
        ok += Math.min(12, d.items.length - i);
      }
    }
    app.status?.(`공부 계획 ${ok}개를 채웠어요.` + (bad.length ? ` ${bad.join(', ')} 은 겹침 등으로 못 넣었어요.` : ''), !!bad.length);
  }
  // 다시 짜기: 마감 빠른 과제부터 빈 칸에 예상 분만큼(칸이 모자라면 나눠서), 과제 사이 10분 쉼
  function autoPlan(date, all, fixed) {
    if (!calOk(date)) return { out: [], left: [], blocked: true };   // 캘린더를 확인 못 한 날은 빈 시간을 모르니 배치하지 않음(오타 검수 10/9)
    const slots = freeSlots(date, fixed).map(([a, b]) => ({ a, b })), out = [], left = [];
    const queue = all.filter((t) => !t.inClass && !v60.done[t.key] && (t.days === null || t.days >= 0) && (!ctx.focus || ctx.focus(t.c) || (t.days !== null && t.days <= 1))).sort((x, y) => (x.days ?? 999) - (y.days ?? 999) || x.est.min - y.est.min);
    for (const t of queue) {
      let need = t.est.min - Math.round(elapsed(t.key) / 60000) - (v60.act[t.key]?.min || 0); if (need <= 0) continue;   // 예상만큼 했으면 남은 0분
      for (const s of slots) { if (need <= 0) break; const room = s.b - s.a; if (room < MIN_SLOT) continue; let use = Math.min(room, need);
        if (need - use > 0 && need - use < MIN_SLOT) use = need - MIN_SLOT;   // 나눠도 남는 조각이 25분 미만이 되지 않게
        if (use < MIN_SLOT) continue; out.push({ s: s.a, e: s.a + use, title: `${t.c} · ${t.t}`, k: 'auto', key: t.key }); need -= use; s.a += use + BREAK; }
      if (need > 0) left.push({ t, need });
    }
    return { out, left };
  }

  // 시간표: 하루(기본, 오늘) ↔ 한 주(대표님 10/9). 오늘 하루 보기는 지금 시각으로 자동 맞춤 — 1분마다 지금 선이 움직이고
  // 화면이 따라간다(직접 스크롤하면 2분 동안은 그대로).
  let view = (() => { try { return localStorage.getItem('school-plan-view') === 'week' ? 'week' : 'day'; } catch { return 'day'; } })();
  let followBox = null, userScroll = 0, programmatic = false;
  const weekStart = (date) => { const n = new Date(date + 'T00:00:00Z').getUTCDay(); return addDays(date, -((n + 6) % 7)); };   // 그 주 월요일
  const ICON_VIEW = {
    day: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 9h16M9 3v4M15 3v4M12 13v4"/>',
    week: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 9h16M9 3v4M15 3v4M8 12v6M12 12v6M16 12v6"/>',
    exam: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  };
  const VIEW_NAME = { day: '하루', week: '한 주', exam: '시험까지' };
  let planMode = false;   // 계획 모드(한 주·시험까지): 빈 칸을 누르면 그 시각에 공부 계획 넣기
  const examEnd = () => { const ds = (ctx.exams || []).map((e) => e.date).filter(Boolean).sort(); return ds.length ? ds[ds.length - 1] : addDays(ctx.today, 13); };
  // 위치 기록(오늘 하루 보기 오른쪽 줄): v60.place[날짜] = [{t:'HH:MM', p:'학교'}] — 기록한 때부터 다음 기록까지 그곳
  const PLACES = ['집', '학교', '도서관', '카페', '이동 중'];
  function placeLane(date, PX, nowM) {
    const lane = el('div', undefined, 'pl-lane'); lane.setAttribute('aria-label', '있던 곳');
    const recs = (v60.place?.[date] || []).slice().sort((a, b) => a.t.localeCompare(b.t));
    recs.forEach((r, i) => {
      const s = mins(r.t), e = i + 1 < recs.length ? mins(recs[i + 1].t) : (date === ctx.today ? Math.max(s + 15, nowM) : 24 * 60);
      const seg = el('div', undefined, 'pl-place' + (r.p === '이동 중' ? ' move' : '')); seg.style.top = s * PX + 'px'; seg.style.height = Math.max(16, (e - s) * PX - 2) + 'px';
      seg.append(el('span', r.p)); seg.title = `${r.t}부터 ${r.p} — 누르면 이 기록 지우기`; seg.tabIndex = 0; seg.setAttribute('role', 'button'); seg.setAttribute('aria-label', `${r.t} ${r.p} 기록 지우기`);
      const rm = () => { if (!confirm(`${r.t} ${r.p} 기록을 지울까요?`)) return; save((s) => { const list = s.place?.[date] || []; const i = list.findIndex((x) => x.t === r.t && x.p === r.p); if (i >= 0) list.splice(i, 1); }); };
      seg.onclick = rm; seg.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rm(); } }; lane.append(seg);
    });
    return lane;
  }
  function placeBar(date) {
    const box = el('div', undefined, 'pl-placebar'); box.setAttribute('role', 'group'); box.setAttribute('aria-label', '지금 위치 기록');
    box.append(el('span', '지금 위치', 'pl-placelabel'));
    const add = (p) => { const t = hm(nowMin()); save((s) => { s.place = s.place || {}; const list = (s.place[date] = s.place[date] || []); const last = list[list.length - 1]; if (last && last.t === t) last.p = p; else if (!last || last.p !== p) list.push({ t, p }); }); };
    for (const p of PLACES) { const b = el('button', p, 'pl-chip'); b.type = 'button'; b.onclick = () => add(p); box.append(b); }
    const other = el('input', undefined, 'pl-placein'); other.placeholder = '직접'; other.maxLength = 20; other.setAttribute('aria-label', '다른 장소');
    other.onkeydown = (e) => { if (e.key === 'Enter' && other.value.trim()) { add(other.value.trim()); other.value = ''; } };
    box.append(other);
    if ((v60.place?.[date] || []).length) { const u = ib('undo', '마지막 위치 기록 지우기'); u.onclick = () => { const last = (v60.place?.[date] || []).slice(-1)[0]; if (!last) return; save((s) => { const list = s.place?.[date] || []; const i = list.findIndex((r) => r.t === last.t && r.p === last.p); if (i >= 0) list.splice(i, 1); }); }; box.append(u); }
    return box;
  }
  // 계획 모드: 칸을 눌러 그 시각에 계획 넣기(과목·할 일·시작·길이) → 학교 공부 계획(workspace plan-add)으로 저장
  // 창은 화면(body)에 띄운다 — 시간표가 다시 그려져도(캘린더 도착 등) 사라지지 않게. 바깥 누르기·Esc 로 닫힘.
  function planPopup(card, date, startMin, anchor, at, pickDate, existing) {
    document.querySelector('.pl-pop')?.remove();
    const pop = el('form', undefined, 'pl-pop'); pop.setAttribute('aria-label', `${date} 계획 넣기`);
    const close = () => { pop.remove(); document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', esc, true); };
    const outside = (e) => { if (!pop.contains(e.target)) close(); };
    const esc = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    setTimeout(() => { document.addEventListener('pointerdown', outside, true); document.addEventListener('keydown', esc, true); });
    pop.append(el('b', existing ? '계획 고치기' : pickDate ? '일정 추가 — 공부 계획' : `${date.slice(5).replace('-', '/')}(${wd(date)}) 계획 넣기`));
    const dIn = el('input'); dIn.type = 'date'; dIn.value = date; if (!existing) dIn.min = ctx.today; dIn.setAttribute('aria-label', '날짜'); if (pickDate) pop.append(dIn);
    const sel = el('select'); sel.setAttribute('aria-label', '과목'); for (const c of ctx.courses || []) sel.append(Object.assign(el('option', c), { value: c }));
    const note = el('input'); note.placeholder = '할 일(예: 12.3 연습문제)'; note.maxLength = 80; note.required = true; note.setAttribute('aria-label', '할 일');
    const st = el('input'); st.type = 'time'; st.step = 600; st.value = hm(startMin); st.setAttribute('aria-label', '시작');
    const len = el('select'); len.setAttribute('aria-label', '길이'); const lens = [30, 45, 60, 90, 120]; const curLen = existing ? mins(existing.e) - mins(existing.s) : 60; if (!lens.includes(curLen) && curLen > 0) lens.push(curLen); for (const m of lens.sort((a, b) => a - b)) len.append(Object.assign(el('option', dur(m)), { value: m })); len.value = String(curLen);
    if (existing) { const cn = ctx.courseName?.(existing.courseId); if (cn && ![...sel.options].some((o) => o.value === cn)) sel.append(Object.assign(el('option', cn), { value: cn })); if (cn) sel.value = cn; note.value = existing.note || ''; note.required = false; st.value = existing.s; }
    const ok = el('button', '넣기'); ok.type = 'submit'; const no = el('button', '닫기', 'ghost'); no.type = 'button'; no.onclick = close;
    if (existing) ok.textContent = '저장';
    pop.append(sel, note, st, len, ok);
    if (existing) { const del = el('button', '지우기', 'danger'); del.type = 'button'; let armed = false;
      del.onclick = async () => { if (!armed) { armed = true; del.textContent = '정말 지우기'; return; } del.disabled = true; const r = await ctx.deletePlan?.(existing.id); if (r === false) { del.disabled = false; armed = false; del.textContent = '지우기'; } else close(); };
      pop.append(del); }
    pop.append(no);
    if (pickDate) pop.append(el('small', existing ? '구글 캘린더 일정은 캘린더에서 고쳐 주세요.' : '구글 캘린더 일정(약속 등)은 캘린더에서 넣으면 여기 시간표에 같이 보여요.', 'pl-popnote'));
    pop.onsubmit = async (e) => { e.preventDefault(); const s = mins(st.value), end = s + Number(len.value); if (end > 24 * 60) { app.status?.('자정을 넘겨요. 시작을 앞당겨 주세요.', true); return; }
      ok.disabled = true; const item = { date: pickDate ? dIn.value || date : date, s: hm(s), e: hm(end), courseId: ctx.courseId?.(sel.value), note: note.value.trim(), kind: existing?.kind || '시험 대비' };
      const done = existing ? await ctx.updatePlan?.({ ...existing, ...item, id: existing.id }) : await ctx.addPlan?.(item); if (done === false) ok.disabled = false; else close(); };
    document.body.append(pop);
    const x = at?.x ?? anchor.getBoundingClientRect().left, y = at?.y ?? anchor.getBoundingClientRect().top;
    pop.style.left = Math.min(Math.max(8, x - 20), innerWidth - 300) + 'px'; pop.style.top = Math.min(Math.max(8, y - 20), innerHeight - 330) + 'px';
    note.focus();
  }
  function blockEl(b, PX, now) {
    const blk = el('div', undefined, `pl-blk k-${b.k}` + (now >= 0 && b.e <= now ? ' past' : '')); blk.style.top = b.s * PX + 'px'; blk.style.height = Math.max(14, (b.e - b.s) * PX - 2) + 'px';
    blk.append(el('span', b.title)); if ((b.e - b.s) * PX > 34) blk.append(el('small', `${hm(b.s)}–${hm(b.e)}${b.k === 'auto' ? ' · 추천' : ''}`)); blk.title = `${hm(b.s)}–${hm(b.e)} ${b.title}`;
    if (b.plan) { blk.classList.add('edit'); blk.tabIndex = 0; blk.setAttribute('role', 'button'); blk.setAttribute('aria-label', `${b.title} ${hm(b.s)}–${hm(b.e)} 고치기·지우기`);
      const openEdit = (e) => { e.stopPropagation(); planPopup(null, b.plan.date, b.s, blk, e.clientX ? { x: e.clientX, y: e.clientY } : null, true, b.plan); };
      blk.onclick = openEdit; blk.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEdit(e); } }; }
    return blk;
  }
  function setScroll(box, top) { programmatic = true; box.scrollTop = Math.max(0, top); requestAnimationFrame(() => { programmatic = false; }); }
  function scrollToNow(box, PX, force) {
    if (!box?.isConnected) return; if (!force && Date.now() - userScroll < 120000) return;
    setScroll(box, (nowMin() - 90) * PX);   // 지금이 위에서 1시간 반 아래쯤
  }
  function dayCard(all) {
    const card = el('section', undefined, 'pl-card pl-schedule'); card.setAttribute('aria-label', '시간표');
    const isWeek = view === 'week', isExam = view === 'exam', ws = weekStart(day), end = examEnd();
    const head = el('div', undefined, 'pl-head');
    head.append(el('h2', '시간표'), el('small', isExam ? `오늘 ~ ${end.slice(5).replace('-', '/')}(${wd(end)}) 시험 끝까지` : isWeek ? `${ws.slice(5).replace('-', '/')}(월) ~ ${addDays(ws, 6).slice(5).replace('-', '/')}(일)${ws === weekStart(ctx.today) ? ' · 이번 주' : ''}` : `${day.slice(5).replace('-', '/')}(${wd(day)})${day === ctx.today ? ' · 오늘' : ''}`));
    const bar = el('div', undefined, 'pl-bar');
    const prev = ib('prev', isWeek ? '지난주' : '전날'), next = ib('next', isWeek ? '다음 주' : '다음 날'), today = el('button', '오늘', 'pl-today'); today.type = 'button';
    const seg = el('div', undefined, 'pl-seg'); seg.setAttribute('role', 'group'); seg.setAttribute('aria-label', '보기');
    for (const v of ['day', 'week', 'exam']) {
      const b = el('button', undefined, 'pl-ib'); b.type = 'button'; b.innerHTML = svg(ICON_VIEW[v]); b.setAttribute('aria-label', VIEW_NAME[v]); b.title = VIEW_NAME[v]; b.setAttribute('aria-pressed', String(view === v));
      b.onclick = () => { view = v; if (v === 'day') planMode = false; try { localStorage.setItem('school-plan-view', v); } catch {} draw(); }; seg.append(b);
    }
    const replan = ib('replan', '다시 짜기 — 과제를 빈 시간에 다시 배치', 'go');
    prev.onclick = () => { day = addDays(day, isWeek ? -7 : -1); draw(); }; next.onclick = () => { day = addDays(day, isWeek ? 7 : 1); draw(); };
    today.onclick = () => { day = ctx.today; userScroll = 0; draw(); };
    replan.onclick = () => { draw(); app.status?.('빈 시간에 다시 짰어요.'); };
    const plus = ib('plus', '일정 추가', 'go'); plus.onclick = (e) => { const d = isWeek || isExam ? (day >= ctx.today ? day : ctx.today) : day; const m = d === ctx.today ? Math.ceil((nowMin() + 10) / 30) * 30 : 9 * 60; planPopup(card, d, Math.min(m, 23 * 60), plus, { x: e.clientX - 260, y: e.clientY + 24 }, true); };
    const fill = el('button', '채우기', 'pl-mode pl-fill'); fill.type = 'button'; fill.title = '고정 일정은 그대로, 빈 시간에만 공부 계획 자동 계산해 넣기';
    fill.onclick = () => { const ds = []; if (isExam) { for (let d = ctx.today; d <= end; d = addDays(d, 1)) ds.push(d); } else if (isWeek) { for (let i = 0; i < 7; i++) ds.push(addDays(ws, i)); } else ds.push(day); runFill(ds, all); };
    const pm = el('button', '계획 모드', 'pl-mode'); pm.type = 'button'; pm.setAttribute('aria-pressed', String(planMode)); pm.title = '빈 칸을 눌러 그 시각에 공부 계획 넣기';
    pm.onclick = () => { planMode = !planMode; draw(); };
    if (isExam) bar.append(today, seg, pm, fill, plus, replan); else bar.append(prev, today, next, seg, ...(isWeek ? [pm] : []), fill, plus, replan);
    head.append(bar); card.append(head);
    const todayFixed = fixedBlocks(ctx.today), todayPlan = autoPlan(ctx.today, all, todayFixed);
    if (!isWeek && !isExam) {
      const fixed = day === ctx.today ? todayFixed : fixedBlocks(day), plan = day === ctx.today ? todayPlan : { out: [], left: [] };
      const box = el('div', undefined, 'pl-day'), grid = el('div', undefined, 'pl-grid has-lane'), PX = 54 / 60;
      grid.style.height = 24 * 60 * PX + 'px';
      for (let h = 0; h < 24; h++) { const line = el('div', undefined, 'pl-hour'); line.style.top = h * 60 * PX + 'px'; line.append(el('span', String(h).padStart(2, '0'))); grid.append(line); }
      const now = day === ctx.today ? nowMin() : -1;
      for (const b of [...fixed, ...plan.out]) grid.append(blockEl(b, PX, now));
      grid.append(placeLane(day, PX, now));   // 오른쪽 여백: 있던 곳
      if (now >= 0) { const n = el('div', undefined, 'pl-now'); n.style.top = now * PX + 'px'; n.append(el('span', hm(now))); grid.append(n); }
      if (day === ctx.today) card.append(placeBar(day));
      box.append(grid); card.append(box);
      box.addEventListener('scroll', () => { if (!programmatic) userScroll = Date.now(); }, { passive: true });
      followBox = now >= 0 ? { box, PX, line: grid.querySelector('.pl-now') } : null;
      requestAnimationFrame(() => { if (now >= 0) scrollToNow(box, PX, true); else setScroll(box, DAY.wake * PX); });
      if (plan.blocked) { const n = el('p', '캘린더를 확인하지 못해 자동 배치를 미뤘어요. ', 'pl-left'); const again = el('button', '다시 확인', 'pl-today'); again.type = 'button'; again.onclick = () => { calFail.delete(day); draw(); }; n.append(again); card.append(n); }
      if (plan.left.length) card.append(el('p', `오늘 빈 시간에 다 못 넣은 과제 ${plan.left.length}개 · ${dur(plan.left.reduce((n, x) => n + x.need, 0))}`, 'pl-left'));
      return { card, fixed };
    }
    // 여러 날: 한 주(월~일 7칸) 또는 시험까지(오늘~마지막 시험, 옆으로 넘김). 날짜를 누르면 그날 하루 보기.
    // 오늘 칸에만 자동 배치·지금 선. 계획 모드면 빈 칸을 눌러 계획 넣기.
    const dates = []; if (isExam) { for (let d = ctx.today; d <= end; d = addDays(d, 1)) dates.push(d); } else for (let i = 0; i < 7; i++) dates.push(addDays(ws, i));
    const box = el('div', undefined, 'pl-day pl-week' + (isExam ? ' pl-exam' : '') + (planMode ? ' planning' : '')), PX = 40 / 60, nowM = nowMin();
    const cols = `40px repeat(${dates.length},minmax(${isExam ? '104px' : '0'},1fr))`;
    const headRow = el('div', undefined, 'pl-wkhead'); headRow.style.gridTemplateColumns = cols; headRow.append(el('span'));
    const body = el('div', undefined, 'pl-wkbody'); body.style.gridTemplateColumns = cols;
    const gutter = el('div', undefined, 'pl-wkgut'); gutter.style.height = 24 * 60 * PX + 'px';
    for (let h = 0; h < 24; h++) { const t = el('span', String(h).padStart(2, '0')); t.style.top = h * 60 * PX + 'px'; gutter.append(t); }
    body.append(gutter);
    for (const date of dates) {
      const isToday = date === ctx.today, name = wd(date), exams = (ctx.exams || []).filter((e) => e.date === date);
      const h = el('button', undefined, 'pl-wkday' + (isToday ? ' today' : '') + (exams.length ? ' exam' : '')); h.type = 'button';
      h.append(el('b', isExam ? `${Number(date.slice(5, 7))}/${Number(date.slice(8))}` : String(Number(date.slice(8)))), el('small', name + (exams.length ? ' · 시험' : '')));
      h.setAttribute('aria-label', `${date} ${name}요일${exams.length ? ' 시험 ' + exams.map((e) => e.course).join(', ') : ''} 하루 보기`);
      h.onclick = () => { day = date; view = 'day'; planMode = false; try { localStorage.setItem('school-plan-view', 'day'); } catch {} draw(); };
      headRow.append(h);
      const col = el('div', undefined, 'pl-wkcol' + (isToday ? ' today' : '') + (exams.length ? ' exam' : '')); col.style.height = 24 * 60 * PX + 'px'; col.dataset.date = date;
      for (let hh = 1; hh < 24; hh++) { const l = el('div', undefined, 'pl-wkline'); l.style.top = hh * 60 * PX + 'px'; col.append(l); }
      for (const b of (isToday ? [...todayFixed, ...todayPlan.out] : fixedBlocks(date))) col.append(blockEl(b, PX, isToday ? nowM : (date < ctx.today ? 1e9 : -1)));
      if (isToday) { const n = el('div', undefined, 'pl-now'); n.style.top = nowM * PX + 'px'; col.append(n); }
      if (planMode && date >= ctx.today) col.onclick = (e) => {
        if (e.target.closest('.pl-blk')) return;
        const r = col.getBoundingClientRect(), m = Math.max(0, Math.min(23 * 60 + 30, Math.floor(((e.clientY - r.top) / PX) / 30) * 30));
        if (date === ctx.today && m < nowMin()) { app.status?.('지난 시각엔 계획을 못 넣어요.', true); return; }
        planPopup(card, date, m, col, { x: e.clientX, y: e.clientY });
      };
      body.append(col);
    }
    box.append(headRow, body); card.append(box);
    followBox = null;
    requestAnimationFrame(() => setScroll(box, ((isExam || ws === weekStart(ctx.today)) ? nowM - 120 : DAY.wake) * PX));
    card.append(el('p', (planMode ? '계획 모드 — 빈 칸을 누르면 그 시각에 공부 계획을 넣어요. ' : '') + '수업은 오늘 칸만 학교 시간표에서 가져와요. 다른 날은 캘린더·고정 일정·계획·시험만 보여요.', 'pl-note'));
    return { card, fixed: todayFixed };
  }

  function nums(all, fixed) {
    const open = all.filter((t) => !v60.done[t.key]);
    const free = freeSlots(ctx.today, ctx.today === day ? fixed : fixedBlocks(ctx.today)).reduce((n, [a, b]) => n + (b - a), 0);
    const actual = Object.values(v60.act).reduce((n, a) => n + (a?.days ? (a.days[ctx.today] || 0) : a?.date === ctx.today ? (a.min || 0) : 0), 0)
      + Object.entries(v60.run).reduce((n, [k, r]) => n + ((r?.day || ctx.today) === ctx.today ? Math.round(elapsed(k) / 60000) : 0), 0);
    const box = el('div', undefined, 'pl-nums');
    for (const [label, value] of [['지금부터 빈 시간', dur(free)], ['남은 과제 예상', dur(open.reduce((n, t) => n + t.est.min, 0))], ['오늘 실제', dur(actual)]]) { const c = el('div', undefined, 'pl-num'); c.append(el('small', label), el('b', value)); box.append(c); }
    return box;
  }

  function draw(keepScroll) {
    if (!host || !v60 || !host.isConnected) return;
    const all = tasks();
    const sched = dayCard(all);
    const wrap = el('div', undefined, 'pl'); wrap.append(taskCard(all), nums(all, sched.fixed), sched.card);
    host.replaceChildren(wrap);
  }
  // 캘린더: 보이는 날(하루 = 그날, 한 주 = 월~일)을 한 번에 받아 날짜별로 기억
  async function ensureCal(from, to) {
    const dates = []; for (let d = from; d <= to; d = addDays(d, 1)) dates.push(d);
    if (dates.every((d) => cache.has(d))) return;
    try { const r = await fetch(`/api/cal?from=${from}&to=${to}`, { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(5000) }); const j = await r.json(); if (!j?.ok) throw new Error('cal'); for (const d of dates) if (!cache.has(d)) cache.set(d, j.days?.[d] || []); }
    catch { const at = Date.now(); for (const d of dates) if (!cache.has(d)) calFail.set(d, at); }   // 실패 = 모름(빈 일정 아님)
  }
  const origDraw = draw;
  draw = function (keep) {
    const my = ++gen, from = view === 'week' ? weekStart(day) : view === 'exam' ? ctx.today : day, to = view === 'week' ? addDays(from, 6) : view === 'exam' ? examEnd() : day;
    let missing = false; for (let d = from; d <= to; d = addDays(d, 1)) if (!cache.has(d) && !(Date.now() - (calFail.get(d) || 0) < 30000)) missing = true;
    origDraw(keep); if (missing) ensureCal(from, to).then(() => { if (my === gen) origDraw(keep); });
  };

  return {
    // host 에 그리기. c = { today, courses[](집중 과목), focus(name)→bool, scheduled[], plans[], deadlines[](pendingDeadlines 결과), calendar[](오늘), routine, courseName(id) }
    // 집중 과목 밖 과제는 목록 아래 「그 밖 과목」으로, 자동 배치는 마감 오늘·내일일 때만
    async render(target, c) {
      host = target; ctx = c; day = c.today; bootDay = kst(); if (c.calendarOk) cache.set(c.today, c.calendar || []); else cache.delete(c.today);   // 확인 못 한 오늘 캘린더는 다시 받기
      host.replaceChildren(el('p', '공부 계획을 불러오는 중…', 'pl-empty'));
      try { await load(); } catch (e) { host.replaceChildren(el('p', e.message, 'pl-empty')); return; }
      draw();
      clearInterval(tick); let sec = 0;
      tick = setInterval(() => {
        if (!host?.isConnected) { clearInterval(tick); return; }
        for (const c2 of host.querySelectorAll('[data-clock]')) c2.textContent = clock(elapsed(c2.dataset.clock));
        if (kst() !== bootDay && !pend.length) { clearInterval(tick); ctx.reload?.(); return; }   // 자정 지나면 새 날짜로 다시(기록이 전날로 가지 않게)
        if (++sec % 60 === 0 && followBox?.box?.isConnected) {   // 1분마다 지금 선을 옮기고, 직접 스크롤 안 했으면 화면이 따라감
          const now = nowMin(); if (followBox.line) { followBox.line.style.top = now * followBox.PX + 'px'; followBox.line.querySelector('span').textContent = hm(now); }
          scrollToNow(followBox.box, followBox.PX, false);
        }
      }, 1000);
    },
    destroy() { clearInterval(tick); host = null; },
  };
}
