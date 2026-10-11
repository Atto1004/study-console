// 공부 계획(대표님 10/9 「인스타 버전 학습앱의 공부계획 기능을 그대로 재구성해서 제작」 · 「공부할 거(복습 목록)는 지우고」 · 「시간표는 오늘 기준이 기본」).
// 예전 관제탑 V60·V73 기능을 학교 화면 부품으로 새로 만든다(그 화면을 끼워 넣지 않음):
//   ① 오늘 할 과제 — 남은 과제 + 직접 넣은 할 일, 과목별 묶음, 마감 임박(오늘·내일) 위로, 예상 분(고칠 수 있음),
//      ▶ ⏸ ■ 타이머(멈추면 실제 분 기록 → 같은 과목 실제 평균이 다음 예상), 완료 체크·끝낸 것 목록(되돌리기)
//   ② 숫자 줄 — 지금부터 빈 시간 · 남은 과제 예상 · 오늘 실제
//   ③ 하루 시간표(기본 = 오늘) — 수업·캘린더·고정 일정(근로 등)·계획 + 「다시 짜기」로 과제를 빈 시간에 자동 배치
// 저장은 예전과 같은 원장 S.v60(/api/study/state: est·done·act·run·extra)이라 기록이 이어진다. 저장 충돌(409)이면 새로 읽고 다시.
const el = (tag, text, cls) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; };
const svg = (d) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = { play: '<path d="M7 5l12 7-12 7z" fill="currentColor"/>', pause: '<path d="M8 5v14M16 5v14"/>', stop: '<rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/>', prev: '<path d="M15 6l-6 6 6 6"/>', next: '<path d="M9 6l6 6-6 6"/>', replan: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>', plus: '<path d="M12 5v14M5 12h14"/>', undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>', more: '<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>',
  up: '<path d="M6 15l6-6 6 6"/>', down: '<path d="M6 9l6 6 6-6"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>', moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>' };
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
// 할 일 종류 = 공부 · 과제 · 공모전(대표님 10/12). 예전 값은 그대로 읽는다: kind study·prep·cat review → 공부, cat hw → 과제, contest → 공모전, 그 밖 → 과제
export const KINDS = ['공부', '과제', '공모전'];
export const kindOf = (x) => (x.kind === '공모전' || x.kind === 'contest' || x.cat === 'contest') ? '공모전' : (x.kind === '공부' || x.kind === 'study' || x.kind === 'prep' || (!x.kind && (x.cat === 'review' || x.cat === 'study'))) ? '공부' : '과제';   // 어느 쪽도 아니면 과제(대표님 10/12)
// 끈 것(off)·다른 할 일로 합친 것(mergedInto)·보일 날(showFrom) 전인 것은 안 보임 — 서버 과제 목록(school_assignments.hidden)과 같은 규칙
// 할 일 이름(키)을 바꿀 때 기록(예상 분·완료·실제·타이머)을 통째로 새 키로 옮긴다. 새 키에 이미 기록이 있거나 다른 목록에 같은 키가 있으면
// 기록이 갈라지므로 막는다(오타 검수 10/12)
export const RECORD_KEYS = ['est', 'done', 'act', 'run', 'doneDate'];
export const renameBlocked = (s, from, to, otherKeys = []) => from !== to && (RECORD_KEYS.some((k) => s[k] && s[k][to] !== undefined) || otherKeys.includes(to));
export function moveRecords(s, from, to) { if (from === to) return; for (const k of RECORD_KEYS) if (s[k] && s[k][from] !== undefined) { s[k][to] = s[k][from]; delete s[k][from]; } }
// 직접 넣은 할 일 고치기 한 번(저장 충돌 뒤 다시 적용돼도 같은 결과). 고치기 창을 연 뒤 다른 화면에서 그 할 일 이름이 바뀌었으면('changed')
// 새 키가 막혀 있으면('blocked') 없어졌으면('gone') 아무것도 안 바꾼다. 'ok' 일 때만 값과 기록을 함께 옮긴다
export function applyEdit(s, id, fromKey, patch, otherKeys = []) {
  const x = (s.extra || []).find((y) => y.id === id); if (!x) return 'gone';
  const cur = keyOf(x.c, x.t), to = keyOf(patch.c, patch.t);
  if (cur !== fromKey) return 'changed';
  if (renameBlocked(s, cur, to, otherKeys)) return 'blocked';
  if ((s.extra || []).some((y) => y.id !== id && !y.off && keyOf(y.c, y.t) === to)) return 'blocked';   // 다른 할 일과 같은 이름(그 사이 추가된 것 포함)
  Object.assign(x, patch); moveRecords(s, cur, to); return 'ok';
}
export const hiddenTask = (x, today) => !!(x.off || x.mergedInto || (x.showFrom && String(x.showFrom).slice(0, 10) > today));
// ── 시간표 블록 종류 구분(대표님 10/12 「고정일정·공부블럭·과제블럭·계획일정 구분이 안 가서 기준 필요」) ──
// 4종: 고정일정(움직이지 않음: 수업·캘린더·근로·시험·확정한 고정 약속) · 공부블록(확정한 공부) · 과제블록(확정한 과제·제출물 작업) · 계획일정(아직 확정 안 한 것: 계획 모드로 넣은 것·채우기가 만든 것·저장 안 된 추천)
// 저장된 계획(plan)의 state 가 없으면(옛 계획) 확정으로 읽는다 — 지금도 채우기·다시 짜기가 저장된 계획을 건드리지 않아 동작이 같고, 화면 변화가 가장 작다.
export const CATS = ['고정', '공부', '과제', '계획'];
export const planState = (p) => p?.state === 'tentative' ? 'tentative' : 'confirmed';
export function planBk(p) {   // 확정 계획의 종류: bk 가 있으면 그대로, 없으면 note 로 추정(채우기는 note 를 「과제 · 이름」「시험 공부 · …」 꼴로 씀)
  if (p?.bk === '고정' || p?.bk === '공부' || p?.bk === '과제') return p.bk;
  return /^\s*(과제|공모전)\s*·/.test(p?.note || '') ? '과제' : '공부';
}
export function blockCat(b) {   // 시간표 블록 → 4종. 모르는 종류는 null(화면은 「?」 표식 — 분류 불명을 조용히 숨기지 않는다)
  if (!b) return null;
  if (b.k === 'auto') return '계획';
  if (b.k === 'plan') return planState(b.plan) === 'tentative' ? '계획' : planBk(b.plan);
  return ['class', 'cal', 'work', 'exam'].includes(b.k) ? '고정' : null;
}
export const CAT_CLASS = { 고정: 'c-fixed', 공부: 'c-study', 과제: 'c-hw', 계획: 'c-plan' };
export const CAT_NAME = { 고정: '고정일정', 공부: '공부블록', 과제: '과제블록', 계획: '계획일정' };
export const CAT_MEANS = { 고정: '움직이지 않는 일정 — 수업·약속·시험', 공부: '확정한 공부 시간', 과제: '확정한 과제·제출물 작업 시간', 계획: '아직 확정 안 한 자리 — 눌러서 확정' };
// 글자색·배경색(대비 4.5:1 이상 — 테스트가 계산). 지난 블록은 opacity .8 로 흐리게 하므로 그 합성값도 검사한다
export const BLOCK_COLORS = {
  'k-class': ['#2c4a6e', '#ffffff'], 'k-plan-fixed': ['#4b3f72', '#ffffff'], 'k-cal': ['#48525e', '#ffffff'], 'k-work': ['#6e4609', '#ffffff'], 'k-exam': ['#8f2a18', '#ffffff'],
  'c-study': ['#e0efe5', '#14261f'], 'c-hw': ['#fbe4cc', '#3a1f0c'], 'c-plan': ['#f4f7f5', '#26352e'],
  'tag-study': ['#245a43', '#ffffff'], 'tag-hw': ['#86400c', '#ffffff'], 'tag-plan': ['#f4f7f5', '#34483d'],
  'small-class': ['#2c4a6e', '#ffffff'], 'small-plan-fixed': ['#4b3f72', '#ffffff'], 'small-cal': ['#48525e', '#ffffff'], 'small-work': ['#6e4609', '#ffffff'], 'small-exam': ['#8f2a18', '#ffffff'],
  'small-study': ['#e0efe5', '#2f4036'], 'small-hw': ['#fbe4cc', '#46290f'], 'small-plan': ['#f4f7f5', '#2f4036'], 'legend': ['#ffffff', '#2f4036'],
};
export const PAST_OPACITY = 0.8;
// 같은 시간에 여러 종류가 겹칠 때: 위에 쌓지 않고(터치로 아래 것을 못 누른다) 겹치는 무리 전체를 열로 나눠 옆으로 늘어놓는다.
// 열 순서 = 고정 > 공부·과제 > 계획, 같은 순위는 시작 시각 → 제목 순. 안 겹치는 블록은 한 열(전체 폭).
const RANK = { 고정: 0, 공부: 1, 과제: 1, 계획: 2 };
export function layoutColumns(blocks) {
  const list = blocks.filter((b) => b.e > b.s).slice().sort((a, b) => a.s - b.s || a.e - b.e);
  const clusters = []; let cur = null, end = -1;
  for (const b of list) { if (!cur || b.s >= end) { cur = []; clusters.push(cur); end = b.e; } else end = Math.max(end, b.e); cur.push(b); }
  for (const cl of clusters) {
    const cols = [];
    for (const b of cl.slice().sort((a, b) => (RANK[blockCat(a)] ?? 0) - (RANK[blockCat(b)] ?? 0) || a.s - b.s || String(a.title).localeCompare(String(b.title), 'ko'))) {
      let i = cols.findIndex((c) => c.every((x) => x.e <= b.s || x.s >= b.e)); if (i < 0) { cols.push([]); i = cols.length - 1; }
      cols[i].push(b); b.col = i;
    }
    for (const b of cl) b.cols = cols.length;
  }
  return blocks;
}
// 같은 수업이 학교 시간표(class)·구글 캘린더(cal)·얼라이브위크 기본 시간표(work)에 한꺼번에 있는 경우가 많다 — 예전엔 같은 자리에 겹쳐 그려 맨 위 하나만 보였다.
// 열로 나누면 한 수업이 3칸이 되므로, 출처가 서로 다른(class·cal·work 중 다른 종류) 블록이 시작·끝이 같고 이름도 정확히 같으면(「수업」 꼬리·공백만 무시) 한 칸으로 합친다: 수업 > 캘린더 > 기본 시간표.
// 합쳐진 원본은 남은 블록의 also 에 담아 두고 창에서 눌러 열 수 있게 한다(정보를 숨기지 않음). 같은 출처끼리·이름이 조금이라도 다른 것은 합치지 않는다.
const canon = (o) => JSON.stringify(Object.keys(o || {}).sort().map((k) => [k, o[k]]));
const normTitle = (t) => String(t || '').replace(/\s*수업\s*$/, '').replace(/\s+/g, '').toLowerCase();
export function dedupeBlocks(list) {
  const rank = { class: 0, cal: 1, work: 2 }, kept = [];
  for (const b of list) delete b.also;   // 같은 객체로 다시 불러도 also 가 쌓이지 않게
  const has = (x, k) => x.k === k || (x.also || []).some((a) => a.k === k);   // 대표 블록과 이미 합친 것 중에 같은 출처가 있으면 합치지 않는다(같은 출처 두 개는 별개 일정)
  for (const b of list.slice().sort((x, y) => (rank[x.k] ?? 9) - (rank[y.k] ?? 9))) {
    const host = b.k in rank ? kept.find((x) => x.k in rank && !has(x, b.k) && x.s === b.s && x.e === b.e && normTitle(x.title) && normTitle(x.title) === normTitle(b.title)) : null;
    if (host) (host.also = host.also || []).push(b); else kept.push(b);
  }
  return list.filter((b) => kept.includes(b));
}
const DAY = { start: 0, end: 24 * 60, wake: 8 * 60, bed: 24 * 60 };   // 시간표 0~24시, 자동 배치는 08~24시
const BREAK = 10, MIN_SLOT = 25, DEFAULT_EST = 60;
const LAST = 24 * 60 - 1;   // 계획 끝은 23:59 까지(서버 시간 규격 HH:MM 은 24:00 이 없고 hm(1440) 은 00:00 이 된다 — 오타 검수 10/9)

const CSS = `
.pl{display:flex;flex-direction:column;gap:14px;max-width:1120px;margin:12px auto 0}
.pl-card{background:#fff;border:1px solid #e3e8e4;border-radius:18px;padding:16px 18px}
.pl-strip{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin:0 0 10px}
.pl-sday{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0;border-radius:12px;border:1px solid #e3e8e4;background:#fff;cursor:pointer;color:#1f3d33;font:600 15px/1.1 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-sday small{font-size:11.5px;color:#6b7c73;font-weight:600}
.pl-sday.today b{color:#2e6b52}.pl-sday.exam{border-color:#e7b9a8}
.pl-sday.on{background:#2e6b52;border-color:#2e6b52;color:#fff}.pl-sday.on small{color:#d7ebe1}.pl-sday.on b,.pl-sday.on.today b{color:#fff}
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
.pl-sub-hw{color:#b0581f!important}.pl-sub-st{color:#2e6b52!important}.pl-sub-ct{color:#3d5a8a!important}
button.pl-title.pl-edit{display:block;width:100%;text-align:left;background:none;border:0;padding:0;margin:0;cursor:pointer}
button.pl-title.pl-edit:hover,button.pl-title.pl-edit:focus-visible{text-decoration:underline;text-underline-offset:3px;outline:none}
.pl-tnote{color:#4b6358}
.pl-add input[name=contest]{flex:0 0 150px}
.pl-add [hidden],.pl-pop [hidden]{display:none!important}
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
.pl-blk small{display:block;font-weight:500;color:#2f4036}
.pl-grid{--l:6px;--r:8px}.pl-grid.has-lane{--r:92px}.pl-wkcol{--l:2px;--r:2px}
.pl-blk[data-n]{left:calc(var(--l) + (100% - var(--l) - var(--r)) * var(--c) / var(--n))!important;right:auto!important;width:calc((100% - var(--l) - var(--r)) / var(--n) - 2px)!important}
.pl-blk.c-fixed{background:var(--bg);color:#fff;border:1px solid var(--bg);box-shadow:none;border-radius:5px}
.pl-blk.c-fixed small{color:#ffffff}
.pl-blk.k-plan{--bg:#4b3f72}.pl-blk.k-class{--bg:#2c4a6e}.pl-blk.k-cal{--bg:#48525e}.pl-blk.k-work{--bg:#6e4609}.pl-blk.k-exam{--bg:#8f2a18;font-weight:700}
.pl-blk.c-study{background:#e0efe5;border:1.5px solid #2e6b52;box-shadow:inset 5px 0 0 #2e6b52;color:#14261f}
.pl-blk.c-hw{background:#fbe4cc;border:1.5px solid #9a4a10;box-shadow:inset 5px 0 0 #9a4a10;color:#3a1f0c}
.pl-blk.c-hw small{color:#46290f}
.pl-blk.c-plan{background:#f4f7f5;border:2px dashed #4f6b5c;box-shadow:none;color:#26352e}
.pl-blk.c-unknown{background:#fff;border:2px solid #b23a22;color:#14261f}
.pl-tag{display:inline-block;margin-right:4px;padding:0 4px;border-radius:4px;font:700 10px/14px "Pretendard Variable",Pretendard,system-ui,sans-serif;vertical-align:1px;white-space:nowrap}
.c-fixed .pl-tag{border:1px solid #fff;color:#fff}
.c-study .pl-tag{background:#245a43;color:#fff}.c-hw .pl-tag{background:#86400c;color:#fff}
.c-plan .pl-tag{border:1px dashed #4f6b5c;color:#34483d}
.pl-blk.past{opacity:.8}
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
.pl-pop.pl-info{width:300px}.pl-pop{max-height:calc(100dvh - 16px);overflow:auto;box-sizing:border-box}.pl-prow{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.pl-prow > span:first-child{min-width:44px;font:600 12.5px "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#4b6358}
.pl-pick{display:flex;gap:4px;flex-wrap:wrap}.pl-pop .pl-pick button{background:#fff;color:#1f3d33;border:1px solid #cfd8d2;min-width:44px}.pl-pop .pl-pick button[aria-pressed=true]{background:#2e6b52;color:#fff;border-color:#2e6b52}.pl-pop .pl-pick button:disabled{opacity:.45}.pl-ptime{font:500 12.5px "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#6b7c73}
.pl-pop button.danger{background:#fff;color:#b23a22;border-color:#e6b4a8}
.pl-blk.edit{cursor:pointer}.pl-blk.edit:hover,.pl-blk.edit:focus-visible{outline:2px solid #2e6b52;outline-offset:1px}
.pl-place{cursor:pointer}
.pl-pop button.ghost{background:#fff;color:#1f3d33;border-color:#d5ddd8}
.pl-inclass{display:flex;align-items:baseline;gap:8px;padding:6px 2px;color:#4b6358;font:500 13.5px/1.4 "Pretendard Variable",Pretendard,system-ui,sans-serif}.pl-inclass b{font-weight:700;color:#1f3d33}.pl-inclass small{margin-left:auto;color:#8a9a92}
.pl-unsaved{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 10px;padding:8px 12px;border-radius:12px;background:#fff4e5;border:1px solid #f0d9a8;color:#8a5a14;font:600 13px "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-popnote{color:#6b7c73;font:500 12px/1.4 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-note{margin:8px 0 0;color:#6b7c73;font:500 12.5px "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-left{margin-top:8px;color:#b23a22;font:600 13px "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-legend{display:flex;align-items:center;gap:6px 12px;flex-wrap:wrap;margin:0 0 10px;color:#2f4036;font:500 12.5px/1.3 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-legend .pl-ib{width:34px;height:34px;margin-left:auto}
.pl-leg{display:inline-flex;align-items:center;gap:6px}
.pl-sw{display:inline-block;width:20px;height:14px;border-radius:4px;flex:none}
.pl-sw.c-fixed{background:#2c4a6e}.pl-sw.c-study{background:#e0efe5;border:1.5px solid #2e6b52;box-shadow:inset 4px 0 0 #2e6b52}.pl-sw.c-hw{background:#fbe4cc;border:1.5px solid #9a4a10;box-shadow:inset 4px 0 0 #9a4a10}.pl-sw.c-plan{background:#f4f7f5;border:2px dashed #4f6b5c}
.pl-legend-off{display:flex;justify-content:flex-end;margin:0 0 6px}
.pl-legend-off .pl-ib{width:34px;height:34px}
.pl-toast{position:fixed;z-index:90;top:12px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:12px;max-width:min(92vw,520px);padding:8px 8px 8px 16px;border-radius:14px;background:#14261f;color:#fff;box-shadow:0 10px 28px #0004;font:600 14px/1.35 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-toast button{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 14px;border-radius:10px;border:1px solid #9fd4b9;background:#1f3d33;color:#e9f6ee;font:700 14px "Pretendard Variable",Pretendard,system-ui,sans-serif;cursor:pointer}
.pl-toast button:disabled{opacity:.6}
.pl-toast button:focus-visible{outline:3px solid #f2c94c;outline-offset:2px}
.pl-act{display:flex;gap:8px;flex-wrap:wrap}.pl-pop .pl-act button{flex:1 1 auto;min-height:44px;height:auto;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.pl-pop .pl-act button.danger{flex:0 0 auto}
.pl-pop .pl-act svg{flex:none}
.pl-tagline{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.pl-menu{width:300px}.pl-menu button{min-height:44px;text-align:left;padding:0 12px;background:#fff;color:#1f3d33;border:1px solid #d5ddd8;justify-content:flex-start}
.pl-menu button:disabled{opacity:.5}
.pl-also{display:flex;flex-direction:column;gap:6px}.pl-pop .pl-also button{min-height:44px;height:auto;text-align:left;padding:4px 10px}
.pl-list{margin:10px 0 0;border:1px solid #edf1ee;border-radius:12px;padding:0 12px}
.pl-list summary{min-height:44px;display:flex;align-items:center;gap:6px;cursor:pointer;font:700 13px "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#4b6358}
.pl-list button{display:flex;align-items:center;gap:10px;width:100%;min-height:44px;padding:4px 0;border:0;border-top:1px solid #f0f3f1;background:none;text-align:left;cursor:pointer;font:500 13.5px/1.35 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#14261f}
.pl-list .pl-tag{margin:0;border:1px solid #4f6b5c;color:#26352e}
.pl-list .pl-tt{color:#2f4036;font-variant-numeric:tabular-nums;flex:none}
@media (max-width:600px){.pl-nums{grid-template-columns:1fr 1fr 1fr}.pl-num{padding:10px}.pl-num b{font-size:16px}.pl-card{padding:14px}.pl-task{flex-wrap:wrap}.pl-body{flex-basis:calc(100% - 40px)}}
`;

// 되돌리기 토스트(약 10초). 화면이 다시 그려져도 유지(body 에 붙임). 누르는 동안 버튼 잠금 — 두 번 눌러도 한 번만. 실패(false)하면 토스트를 남겨 다시 시도할 수 있게.
// 마우스·손가락이 올라가 있거나 버튼에 초점이 있으면 자동으로 안 닫는다
let toastEl = null, toastTimer = 0;
export function toast(msg, label, action, ms = 10000) {
  toast.hide();
  const t = document.createElement('div'); t.className = 'pl-toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite');
  t.append(el('span', msg));
  const g = { hover: false, focus: false, busy: false };   // 손가락·초점·요청 중이면 타이머를 돌리지 않는다 — 모두 풀렸을 때만 시작
  const arm = () => { if (toastEl !== t) return; /* 이미 다른 토스트로 바뀌었으면 건드리지 않는다 */ clearTimeout(toastTimer); if (g.hover || g.focus || g.busy) return; toastTimer = setTimeout(() => toast.hide(), ms); };
  if (action) {
    const b = document.createElement('button'); b.type = 'button'; b.innerHTML = svg(ICON.undo); b.append(el('span', label));
    b.onclick = async () => { if (b.disabled) return; b.disabled = true; g.busy = true; if (toastEl === t) clearTimeout(toastTimer); let r = false; try { r = await action(); } catch { r = false; } g.busy = false; if (toastEl !== t) return; if (r === false) { b.disabled = false; arm(); } else toast.hide(); };
    t.append(b);
    t.addEventListener('pointerenter', () => { g.hover = true; clearTimeout(toastTimer); }); t.addEventListener('pointerleave', () => { g.hover = false; arm(); });
    t.addEventListener('focusin', () => { g.focus = true; clearTimeout(toastTimer); }); t.addEventListener('focusout', () => { g.focus = false; arm(); });
  }
  document.body.append(t); toastEl = t; arm();
  return t;
}
toast.hide = () => { clearTimeout(toastTimer); toastEl?.remove(); toastEl = null; };

export function createPlan(app) {
  if (!document.getElementById('plan-css')) { const s = document.createElement('style'); s.id = 'plan-css'; s.textContent = CSS; document.head.append(s); }
  let st = null, v60 = null, host = null, ctx = null, day = kst(), tick = null, gen = 0, saving = Promise.resolve();
  let keepDayUntil = 0;   // 계획을 넣고 지우면 workspace 가 홈을 다시 그린다 — 그 직후엔 보던 날을 유지한다(그 밖엔 늘 오늘부터)
  const keepDay = () => { keepDayUntil = Date.now() + 8000; };
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
  function save(mutate) { mutate(v60); pend.push(mutate); draw(); return flush().then(() => !pend.length && !saveErr); }   // true = 서버에 저장됨(실패면 false — 「저장 안 된 변경」 줄이 뜸)
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
      if (hiddenTask(x, today)) continue;
      if (x.due && x.due < today && !v60.done[keyOf(x.c, x.t)]) continue;   // 마감 지난 할 일은 안 보임(대표님 10/9)
      const days = x.due ? Math.round((Date.parse(x.due) - Date.parse(today)) / 864e5) : null;
      const item = { key: keyOf(x.c, x.t), c: x.c, t: x.t, due: x.due || '', time: x.time || '', days, kind: kindOf(x), extraId: x.id, estDefault: x.est, note: x.note || '', event: !!x.event };   // 직접 넣은 것: 공부(기본)·과제·공모전
      const same = out.find((o) => o.key === item.key);   // 과제 목록에도 같은 할 일이 있으면 두 줄로 만들지 않고 종류·메모만 넣은 값으로
      if (same) Object.assign(same, { kind: item.kind, extraId: item.extraId, estDefault: item.estDefault, note: item.note, event: item.event });
      else out.push(item);
    }
    for (const t of out) { t.est = estimate(t); t.inClass = t.kind !== '공모전' && !!ctx.inClass?.(t.c); }   // 수업 당일 과제(CADD 등)
    return out;
  }
  // 예상 분: 직접 고친 값 > 같은 과목·종류 실제 평균 > 넣을 때 적은 값 > 60
  function estimate(t) {
    if (t.event) return { min: 0, src: '일정' };   // 날짜만 보는 일정(워크숍·발표 등): 타이머·예상 분·자동 채우기 없음
    if (Number.isFinite(v60.est[t.key])) return { min: v60.est[t.key], src: '직접' };
    const same = Object.values(v60.act).filter((a) => a && a.c === t.c && (a.kind || '과제') === t.kind && a.min > 0);
    if (same.length) return { min: Math.round(same.reduce((n, a) => n + a.min, 0) / same.length), src: `실제 평균 ${same.length}건` };
    if (Number.isFinite(t.estDefault)) return { min: t.estDefault, src: '넣은 값' };
    return { min: DEFAULT_EST, src: '기본값' };
  }
  // 실제 분 기록: ■ 와 완료 체크 둘 다 이 한 길로 — 이전 기록에 더한다(덮어쓰지 않음). 날짜는 화면 날짜(ctx.today)
  // 저장 응답만 끊긴 뒤 409 → 서버 기록 위에 다시 적용될 수 있으므로, 더하기마다 고유 id(op)를 남기고 이미 있으면 건너뜀(오타 검수 10/9)
  const opId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  function finishAct(s, t, add, now, op) {
    const prev = s.act[t.key];
    if (op && (prev?.ops || []).includes(op)) return;
    s.act[t.key] = { c: t.c, t: t.t, kind: t.kind, min: (prev?.min || 0) + add, at: now, date: ctx.today, days: { ...(prev?.days || {}), [ctx.today]: ((prev?.days || {})[ctx.today] || 0) + add }, ops: [...(prev?.ops || []), op].filter(Boolean).slice(-30) };
  }
  const running = (key) => v60.run[key];
  const elapsed = (key) => { const r = running(key); if (!r) return 0; return (r.acc || 0) + (r.t0 ? Date.now() - r.t0 : 0); };
  const clock = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 3600) ? Math.floor(s / 3600) + ':' : ''}${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

  function taskRow(t, done) {
    const row = el('div', undefined, 'pl-task' + (done ? ' pl-done' : '')); row.dataset.key = t.key;
    const body = el('div', undefined, 'pl-body');
    if (t.extraId && !done) { const b = el('button', t.t, 'pl-title pl-edit'); b.type = 'button'; b.title = '고치기'; b.onclick = () => editPopup(t, b); body.append(b); }   // 직접 넣은 할 일은 제목을 눌러 고친다
    else body.append(el('div', t.t, 'pl-title'));
    const meta = el('div', undefined, 'pl-meta');
    if (t.due) { const soon = t.days !== null && t.days <= 1; meta.append(el('span', t.days === 0 ? `오늘 ${t.time || ''}`.trim() : t.days === 1 ? `내일 ${t.time || ''}`.trim() : t.days < 0 ? `${-t.days}일 지남` : `${t.due.slice(5).replace('-', '/')}(${wd(t.due)})${t.time ? ' ' + t.time : ''} · D-${t.days}`, 'due' + (soon ? ' soon' : ''))); }
    if (t.note) meta.append(el('span', t.note, 'pl-tnote'));
    if (t.event) {   // 일정: 날짜·메모와 끝남 체크만
      body.append(meta); row.append(body);
      const ck = el('input', undefined, 'pl-check'); ck.type = 'checkbox'; ck.checked = !!done; ck.setAttribute('aria-label', done ? `${t.t} 끝남 되돌리기` : `${t.t} 끝남`);
      ck.onchange = () => { if (ck.checked) { const now = Date.now(); save((s) => { s.done[t.key] = now; (s.doneDate = s.doneDate || {})[t.key] = ctx.today; }); } else save((s) => { delete s.done[t.key]; if (s.doneDate) delete s.doneDate[t.key]; }); };
      row.append(ck); return row;
    }
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
      if (r) { const b = ib('stop', '끝내고 실제 시간 기록'); b.onclick = () => { const add = Math.round(elapsed(t.key) / 60000), now = Date.now(), op = opId(); save((s) => { delete s.run[t.key]; finishAct(s, t, add, now, op); }); }; row.append(b); }
    }
    const ck = el('input', undefined, 'pl-check'); ck.type = 'checkbox'; ck.checked = !!done; ck.setAttribute('aria-label', done ? `${t.t} 완료 되돌리기` : `${t.t} 완료`);
    ck.onchange = () => {
      if (ck.checked) { const now = Date.now(), op = opId(), add = running(t.key) ? Math.round(elapsed(t.key) / 60000) : 0;
        save((s) => { s.done[t.key] = now; (s.doneDate = s.doneDate || {})[t.key] = ctx.today; if (s.run[t.key]) { delete s.run[t.key]; if (add > 0) finishAct(s, t, add, now, op); } }); }
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
    // 홈 할 일은 종류별 세 묶음만(대표님 10/12 「공부 / 과제 / 공모전」): 공부 = 시험 공부·복습, 과제 = 과목 과제·제출물(사회봉사 포함), 공모전 = 대회 일정·마감. 과목은 묶음 안에서 나눈다
    for (const kind of KINDS) {
      const list = open.filter((t) => t.kind === kind);
      if (!list.length) { if (kind === '공부') card.append(el('div', '공부', 'pl-sub pl-sub-st'), el('p', '오늘 할 공부가 아직 없어요. 아래에서 넣거나 스앵님께 계획을 부탁하세요.', 'pl-empty')); continue; }
      card.append(el('div', kind, 'pl-sub pl-sub-' + (kind === '과제' ? 'hw' : kind === '공부' ? 'st' : 'ct')));
      const groups = new Map(); for (const t of list) { if (!groups.has(t.c)) groups.set(t.c, []); groups.get(t.c).push(t); }
      const order = [...groups.entries()].sort((a, b) => Math.min(...a[1].map((t) => t.days ?? 999)) - Math.min(...b[1].map((t) => t.days ?? 999)));
      for (const [c, ts] of order) {
        ts.sort((a, b) => (a.days ?? 999) - (b.days ?? 999));
        const g = el('div', undefined, 'pl-group' + (ts.some((t) => t.days !== null && t.days <= 1) ? ' urgent' : ''));
        const n = el('div', undefined, 'pl-gname'), sum = ts.reduce((s, t) => s + t.est.min, 0); n.append(el('b', c), el('small', `${ts.length}개${sum ? ' · 약 ' + dur(sum) : ''}`)); g.append(n);
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
    const kindSel = el('select'); kindSel.name = 'kind'; kindSel.setAttribute('aria-label', '종류'); for (const k of KINDS) kindSel.append(Object.assign(el('option', k), { value: k }));
    const sel = el('select'); sel.name = 'c'; sel.setAttribute('aria-label', '과목'); for (const c of ctx.courses || []) sel.append(Object.assign(el('option', c), { value: c }));
    const contest = contestInput('contest');   // 공모전을 고르면 과목 대신 대회 이름
    const swap = () => { const on = kindSel.value === '공모전'; sel.hidden = on; contest.hidden = !on; contest.required = on; };
    kindSel.onchange = swap;
    const t = el('input'); t.name = 't'; t.placeholder = '할 일'; t.required = true; t.maxLength = 120; t.setAttribute('aria-label', '할 일');
    const due = el('input'); due.name = 'due'; due.type = 'date'; due.value = ctx.today; due.setAttribute('aria-label', '마감 날짜');
    const est = el('input'); est.name = 'est'; est.type = 'number'; est.min = 5; est.max = 600; est.step = 5; est.value = 30; est.setAttribute('aria-label', '예상 분');
    const go = el('button', '추가'); go.type = 'submit'; add.append(kindSel, sel, contest, t, due, est, go); swap();
    add.onsubmit = (e) => { e.preventDefault(); const text = t.value.trim(); if (!text) return; const c = kindSel.value === '공모전' ? contest.value.trim() : sel.value; if (!c) return;
      const item = { id: 'x' + opId(), kind: kindSel.value, c, t: text, due: due.value, time: '', est: Math.max(5, Number(est.value) || 30) };
      if (v60.extra.some((x) => x.c === item.c && x.t === item.t)) { app.status?.('같은 할 일이 이미 있어요.', true); return; } t.value = ''; save((s) => { if (!s.extra.some((x) => x.id === item.id)) s.extra.push(item); }); };
    card.append(add);
    return card;
  }

  // 하루 고정 블록: 수업(오늘은 학교 시간표) · 캘린더 · 고정 일정(근로 등 routine) · 공부 계획(workspace plans)
  function fixedBlocks(date) {
    const out = [];
    for (const c of classesOn(date)) out.push({ s: mins(c.s), e: mins(c.e), title: c.course + ' 수업', k: 'class', cls: c });
    for (const ev of cache.get(date) || []) { if (ev.allDay || !ev.start || !ev.end) continue; const title = /^\s*운선/.test(ev.title || '') ? '개인 일정' : (ev.title || '일정'); out.push({ s: mins(ev.start), e: mins(ev.end), title, k: 'cal', ev }); }
    const hol = (ctx.routine?.holidays || []).find((h) => h.date === date);
    for (const r of ctx.routine?.grid?.[wd(date)] || []) {
      if ((r.validFrom && date < r.validFrom) || (r.validUntil && date > r.validUntil) || (r.exdate || []).includes(date) || (hol && (hol.affects || []).includes(r.kind))) continue;
      out.push({ s: mins(r.start), e: mins(r.end), title: r.title, k: 'work', routine: r });
    }
    for (const x of (ctx.exams || []).filter((x) => x.date === date)) { const s = x.time ? mins(x.time) : 9 * 60; out.push({ s, e: s + 90, title: `시험 · ${x.course}${x.assumed ? ' (예정)' : ''}`, k: 'exam' }); }
    for (const p of (ctx.plans || []).filter((p) => p.date === date && (!p.activity || p.bk === '고정'))) out.push({ s: mins(p.s), e: mins(p.e), title: p.bk === '고정' ? (p.note || '고정 일정') : (ctx.courseName?.(p.courseId) || '') + (p.note ? ' · ' + p.note : ''), k: 'plan', plan: p });   // 고정 일정(약속 등)은 activity 표식이 있어도 시간표엔 그린다
    for (const b of out) b.date = date;
    return dedupeBlocks(out.filter((b) => b.e > b.s)).sort((a, b) => a.s - b.s);
  }
  // 빈 칸: 깨어 있는 시간(08~24시, 오늘이면 지금부터)에서 고정 블록을 빼고, 앞뒤 쉬는 10분, 25분 이상만
  function freeSlots(date, fixed) {
    let from = DAY.wake; if (date === ctx.today) from = Math.max(from, Math.ceil(nowMin() / 5) * 5);
    const slots = []; let cur = from;
    for (const b of fixed) { if (b.e <= cur) continue; if (b.s - BREAK > cur) slots.push([cur, b.s - BREAK]); cur = Math.max(cur, b.e + BREAK); }
    const bed = Math.min(DAY.bed, LAST); if (bed > cur) slots.push([cur, bed]);
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
      let used = fixed.filter((b) => b.k === 'plan' && b.plan?.bk !== '고정').reduce((n, b) => n + (b.e - b.s), 0);   // 하루 공부 상한: 고정 약속은 공부 시간이 아니라 안 센다(빈 시간 계산에는 그대로 쓴다)
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
    // 채운 계획은 「계획」(미확정)으로 저장하고 출처(src:'fill')·묶음(fb)을 달아 둔다 — 되돌리기·「채운 것 지우기」가 이 표식으로 찾는다. 표식 없는 옛 계획은 안 건드림
    keepDay();
    let ok = 0; const bad = [], created = [], fb = opId().toLowerCase().replace(/[^0-9a-z]/g, '').slice(0, 20);
    for (const d of plan) {
      for (let i = 0; i < d.items.length; i += 12) {   // 서버는 한 번에 12개까지
        const chunk = d.items.slice(i, i + 12).map((x) => ({ ...x, src: 'fill', state: 'tentative', fb }));
        const r = await ctx.addPlan?.(chunk, true);
        if (r === false) { bad.push(d.date.slice(5).replace('-', '/')); break; }
        ok += chunk.length; if (Array.isArray(r)) created.push(...r);
      }
    }
    app.status?.(`공부 계획 ${ok}개를 채웠어요.` + (bad.length ? ` ${bad.join(', ')} 은 겹침 등으로 못 넣었어요.` : ''), !!bad.length);
    if (created.length) toast(`계획 ${created.length}개를 채웠어요`, `채운 ${created.length}개 되돌리기`, () => eraseFilled(created));
  }
  // 채운 계획 지우기(서버가 「채우기가 만든 채로 아직 확정·완료 안 한 것」만 지운다 — 그 사이 확정한 계획은 건드리지 않음). 서버는 한 번에 200개라 나눠 보내고,
  // 중간에 실패하면 거기까지 지운 만큼만 알리고 되돌릴 수 있게 남긴다. 지운 id 그대로 되돌릴 수 있게 토스트
  const CHUNK = 200;
  async function eraseFilled(ids) {
    keepDay();
    const list = []; let failed = false;
    for (let i = 0; i < ids.length; i += CHUNK) {
      const gone = await ctx.deletePlans?.(ids.slice(i, i + CHUNK), 'fill');
      if (gone === false) { failed = true; break; }
      if (Array.isArray(gone)) list.push(...gone);
    }
    if (failed && !list.length) return false;
    const kept = ids.length - list.length;
    app.status?.(`채운 계획 ${list.length}개를 지웠어요.` + (failed ? ' 일부는 지우지 못했어요(위 안내 확인).' : kept > 0 ? ` 확정했거나 이미 없는 ${kept}개는 그대로예요.` : ''), failed);
    if (list.length) toast(`채운 계획 ${list.length}개를 지웠어요`, `지운 ${list.length}개 되돌리기`, restorer(list)); else toast.hide();
    return true;
  }
  // 되돌리기 한 번 = 이 함수가 만든 함수. 나눠 보내다 중간에 실패하면 이미 되살린 조각은 건너뛰고 남은 것부터 다시(두 번째 시도가 「이미 되살아남」 오류가 되지 않게)
  const restorer = (ids) => { let at = 0; return async () => { keepDay(); while (at < ids.length) { const r = await ctx.restorePlans?.(ids.slice(at, at + CHUNK)); if (r === false) return false; at += CHUNK; } app.status?.('되돌렸어요.'); return true; }; };
  // 다시 짜기: 마감 빠른 과제부터 빈 칸에 예상 분만큼(칸이 모자라면 나눠서), 과제 사이 10분 쉼
  function autoPlan(date, all, fixed) {
    if (!calOk(date)) return { out: [], left: [], blocked: true };   // 캘린더를 확인 못 한 날은 빈 시간을 모르니 배치하지 않음(오타 검수 10/9)
    const slots = freeSlots(date, fixed).map(([a, b]) => ({ a, b })), out = [], left = [];
    const hid = new Set(v60.hideAuto?.[date] || []);   // 「이 추천 숨기기」로 숨긴 할 일은 다시 짜기를 눌러도 그날 안 되살아난다
    const queue = all.filter((t) => !t.inClass && !hid.has(t.key) && !v60.done[t.key] && (t.days === null || t.days >= 0) && (!ctx.focus || ctx.focus(t.c) || (t.days !== null && t.days <= 1))).sort((x, y) => (x.days ?? 999) - (y.days ?? 999) || x.est.min - y.est.min);
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
  let planMode = false;   // 계획 모드(대표님 10/12): 켜면 새로 넣는 일정이 「계획」(미확정), 끄면 「확정 일정」. 하루·한 주·시험까지 모두에서 켜고 끄며 보기를 바꿔도 유지. 한 주·시험까지에서는 켠 채로 빈 칸을 눌러 넣는다
  let modeBtn = null;   // 툴바의 계획 모드 버튼 — 일정 창의 스위치가 모드를 바꾸면 같이 맞춘다
  const syncModeBtn = () => { if (modeBtn?.isConnected) modeBtn.setAttribute('aria-pressed', String(planMode)); for (const n of host?.querySelectorAll('.pl-modenote') || []) n.textContent = noteText(n); };
  const noteText = (n) => modeText() + (n.dataset.week ? (planMode ? ' 빈 칸을 누르면 그 시각에 넣어요. ' : ' 빈 칸 누르기는 계획 모드에서만 돼요. 확정 일정은 + 버튼으로 넣어요. ') + n.dataset.tail : '');
  const modeText = () => planMode ? '계획 모드 켜짐 — 새로 넣는 일정은 계획(미확정)이에요.' : '계획 모드 꺼짐 — 새로 넣는 일정은 확정 일정이에요.';
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
  // 창을 실제 크기로 화면 안에 놓기 — 높은 창(수업)이 아래에서 열리면 버튼이 화면 밖으로 잘렸다(10/9). 너무 길면 창 안 스크롤
  function placePop(pop, x, y) {
    const w = pop.offsetWidth || 300, h = pop.offsetHeight || 300;
    pop.style.left = Math.max(8, Math.min(x - 20, innerWidth - w - 8)) + 'px';
    pop.style.top = Math.max(8, Math.min(y - 20, innerHeight - h - 8)) + 'px';
  }
  // 대회 이름 입력(이미 넣은 대회 이름을 고를 수 있게)
  function contestInput(name) {
    const i = el('input'); i.name = name; i.placeholder = '대회 이름'; i.maxLength = 40; i.setAttribute('aria-label', '대회 이름');
    const id = 'pl-contests'; let list = document.getElementById(id); if (!list) { list = el('datalist'); list.id = id; document.body.append(list); }
    list.replaceChildren(...[...new Set(v60.extra.filter((x) => kindOf(x) === '공모전' && x.c).map((x) => x.c))].map((c) => Object.assign(el('option'), { value: c })));
    i.setAttribute('list', id); return i;
  }
  // 직접 넣은 할 일 고치기: 종류·과목(대회)·할 일·마감 날짜·시각, 그리고 숨기기(off — 지우지 않음).
  // 제목·과목이 바뀌면 예상 분·완료·실제 기록·타이머 키도 새 키로 옮긴다. 메모·일정 표시·보일 날 같은 다른 값은 그대로 둔다.
  function editPopup(t, anchor) {
    const x0 = v60.extra.find((x) => x.id === t.extraId); if (!x0) return;
    document.querySelector('.pl-pop')?.remove();
    const pop = el('form', undefined, 'pl-pop'); pop.setAttribute('aria-label', '할 일 고치기');
    const close = () => { pop.remove(); document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', esc, true); };
    const outside = (e) => { if (!pop.contains(e.target)) close(); };
    const esc = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    setTimeout(() => { document.addEventListener('pointerdown', outside, true); document.addEventListener('keydown', esc, true); });
    const kindSel = el('select'); kindSel.setAttribute('aria-label', '종류'); for (const k of KINDS) kindSel.append(Object.assign(el('option', k), { value: k })); kindSel.value = kindOf(x0);
    const sel = el('select'); sel.setAttribute('aria-label', '과목'); for (const c of ctx.courses || []) sel.append(Object.assign(el('option', c), { value: c }));
    if (x0.c && ![...sel.options].some((o) => o.value === x0.c)) sel.append(Object.assign(el('option', x0.c), { value: x0.c }));
    const contest = contestInput('contest');
    if (kindOf(x0) === '공모전') contest.value = x0.c || ''; else sel.value = x0.c;
    const swap = () => { const on = kindSel.value === '공모전'; sel.hidden = on; contest.hidden = !on; contest.required = on; }; kindSel.onchange = swap; swap();
    const text = el('input'); text.value = x0.t; text.required = true; text.maxLength = 120; text.setAttribute('aria-label', '할 일');
    const due = el('input'); due.type = 'date'; due.value = x0.due || ''; due.setAttribute('aria-label', '마감 날짜');
    const time = el('input'); time.type = 'time'; time.value = x0.time || ''; time.setAttribute('aria-label', '마감 시각');
    const ok = el('button', '저장'); ok.type = 'submit';
    const hide = el('button', '숨기기', 'danger'); hide.type = 'button';
    const no = el('button', '닫기', 'ghost'); no.type = 'button'; no.onclick = close;
    pop.append(el('b', '할 일 고치기'), kindSel, sel, contest, text, due, time, ok, hide, no, el('small', '숨긴 할 일은 지워지지 않고 목록에서만 빠져요.', 'pl-popnote'));
    hide.onclick = () => { const id = x0.id, at = Date.now(); save((s) => { const x = s.extra.find((y) => y.id === id); if (x) { x.off = true; x.offAt = at; } }); close(); };
    pop.onsubmit = (e) => {
      e.preventDefault(); const kind = kindSel.value, c = kind === '공모전' ? contest.value.trim() : sel.value, tt = text.value.trim(); if (!c || !tt) return;
      if (v60.extra.some((y) => y.id !== x0.id && !y.off && y.c === c && y.t === tt)) { app.status?.('같은 할 일이 이미 있어요.', true); return; }
      const id = x0.id, from = keyOf(x0.c, x0.t), to = keyOf(c, tt), d = due.value, tm = time.value;
      // 제목·과목을 바꾸면 기록(예상 분·완료·실제·타이머)을 새 키로 통째로 옮긴다. 새 키에 이미 기록이 있거나 과제 목록에 같은 할 일이 있으면
      // 기록이 갈라지므로 바꾸지 않는다(오타 검수 10/12). 저장 충돌 뒤 다시 적용할 때도 같은 검사를 해서 반만 옮기는 일이 없게
      const others = (ctx.deadlines || []).map((r) => keyOf(r.course, r.title));
      if (renameBlocked(v60, from, to, others)) { app.status?.('같은 이름의 할 일 기록이 이미 있어요. 다른 이름으로 해 주세요.', true); return; }
      const MSG = { changed: '그 사이 다른 화면에서 이 할 일이 바뀌어 고치지 않았어요. 다시 열어 고쳐 주세요.', blocked: '같은 이름의 할 일 기록이 이미 있어 고치지 않았어요.', gone: '이 할 일이 없어져 고치지 않았어요.' };
      save((s) => { const r = applyEdit(s, id, from, { kind, c, t: tt, due: d, time: tm }, others); if (r !== 'ok') app.status?.(MSG[r], true); });
      close();
    };
    document.body.append(pop);
    const r = anchor.getBoundingClientRect(); placePop(pop, r.left, r.bottom + 4);
    text.focus();
  }
  // 창을 닫은 뒤 초점 돌려주기 — 눌렀던 블록이 지워졌거나 다시 그려졌으면 날짜 줄(선택된 날·보기 버튼)로
  function refocus(a) { const t = a?.isConnected ? a : host?.querySelector('.pl-sday.on, .pl-seg [aria-pressed=true]'); try { t?.focus({ preventScroll: true }); } catch {} }
  // 팝업 공통: 바깥 누르기·Esc 로 닫힘, 닫으면 초점 복귀
  function mkPop(tag, cls, label, anchor) {
    document.querySelector('.pl-pop')?.remove();
    const pop = el(tag, undefined, 'pl-pop ' + (cls || '')); pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', label);
    const close = () => { pop.remove(); document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', esc, true); refocus(anchor); };
    const outside = (e) => { if (!pop.contains(e.target)) close(); };
    const esc = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    setTimeout(() => { document.addEventListener('pointerdown', outside, true); document.addEventListener('keydown', esc, true); });
    return { pop, close };
  }
  // 저장된 계획 지우기 — 한 번 누르면 지우고, 서버가 지운 뒤에 「되돌리기」 토스트(약 10초). 실패하면 아무 일도 없던 것으로 두고 이유만 알림(서버 메시지)
  async function removePlan(p) {
    keepDay();
    const r = await ctx.deletePlan?.(p.id);
    if (r === false) return false;
    toast('지웠어요', '지운 것 되돌리기', restorer([p.id]));
    return true;
  }
  // 저장 안 된 추천 숨기기: 그날 그 할 일의 추천을 다시 짜기에서 빼 둔다(v60.hideAuto — 다른 기기에서도 유지). 지난 날짜 기록은 정리
  async function hideRec(date, key, label) {
    const today = ctx.today;
    const ok = await save((s) => { s.hideAuto = s.hideAuto || {}; for (const d of Object.keys(s.hideAuto)) if (d < today) delete s.hideAuto[d]; const l = (s.hideAuto[date] = s.hideAuto[date] || []); if (!l.includes(key)) l.push(key); });
    if (!ok) return false;
    toast(`추천을 숨겼어요 · ${label}`, '숨긴 추천 되돌리기', () => showRec(date, key));
    return true;
  }
  async function showRec(date, key) {
    const ok = await save((s) => { const l = s.hideAuto?.[date]; if (!l) return; const i = l.indexOf(key); if (i >= 0) l.splice(i, 1); if (!l.length) delete s.hideAuto[date]; });
    return ok ? true : false;
  }
  // 시간표 메뉴: 보고 있는 주에서 오늘 이후 「채우기가 만든 채로 아직 확정·완료 안 한」 계획만 한꺼번에 지우기(표식 src:'fill' 이 없는 옛 계획은 절대 안 지움) · 숨긴 추천 되살리기
  function menuPopup(anchor, ws, ev) {
    const { pop, close } = mkPop('div', 'pl-menu', '시간표 메뉴', anchor);
    const wkEnd = addDays(ws, 6), label = ws === weekStart(ctx.today) ? '이번 주' : `${ws.slice(5).replace('-', '/')}~${wkEnd.slice(5).replace('-', '/')} 주`;
    const filled = (ctx.plans || []).filter((p) => p.src === 'fill' && planState(p) === 'tentative' && !p.done && p.date >= ctx.today && p.date >= ws && p.date <= wkEnd);
    const hid = (v60.hideAuto?.[ctx.today] || []).length;
    pop.append(el('b', '시간표 메뉴'));
    const erase = el('button', `${label} 자동으로 채운 것 지우기 (${filled.length}개)`); erase.type = 'button'; erase.disabled = !filled.length;
    erase.onclick = async () => {
      const ids = filled.map((p) => p.id);
      if (!confirm(`${label} 자동으로 채운 계획 ${ids.length}개를 지울까요?\n확정한 것·직접 넣은 것·예전 계획은 그대로 둬요. 지운 뒤 10초 동안 되돌릴 수 있어요.`)) return;
      erase.disabled = true; const r = await eraseFilled(ids); if (r === false) erase.disabled = false; else close();
    };
    const unhide = el('button', `숨긴 추천 되살리기 (${hid}개)`); unhide.type = 'button'; unhide.disabled = !hid;
    unhide.onclick = async () => { unhide.disabled = true; const today = ctx.today; const ok = await save((s) => { if (s.hideAuto) delete s.hideAuto[today]; }); if (ok) { app.status?.('숨긴 추천을 되살렸어요.'); close(); } else unhide.disabled = false; };
    const no = el('button', '닫기', 'ghost'); no.type = 'button'; no.onclick = close;
    pop.append(erase, unhide, el('small', '확정한 계획·직접 넣은 계획·예전 계획은 지우지 않아요. 개별 계획은 블록을 눌러 삭제.', 'pl-popnote'), no);
    document.body.append(pop);
    const r = anchor.getBoundingClientRect(); placePop(pop, (ev?.clientX || r.left) - 240, (ev?.clientY || r.bottom) + 16);
    erase.focus();
  }
  // 일정 넣기·고치기 창. 새로 넣을 때는 「계획 | 확정」 스위치 하나(대표님 10/12 「플랜모드 켜고 일정 추가하면 계획블럭으로, 끄고 추가하면 확정일정으로」):
  // 스위치 처음 값 = 계획 모드(켜짐 → 계획, 꺼짐 → 확정 — 추천에서 넣을 때도 같다), 스위치를 바꾸면 계획 모드도 같이 바뀐다. 계획은 점선 블록(미확정), 확정은 종류(고정·공부·과제)를 골라 그 모양으로.
  // 이미 있는 계획(미확정)은 [확정] 버튼으로 확정 일정이 된다 — 확정하면 채우기·다시 짜기가 건드리지 않는다.
  function planPopup(card, date, startMin, anchor, at, pickDate, existing, preset) {
    const tentativeNow = existing && planState(existing) === 'tentative';
    const { pop, close } = mkPop('form', '', existing ? '일정 고치기' : `${date} 일정 넣기`, anchor);
    let isTent = existing ? !!tentativeNow : planMode;   // 이 창에서 넣는 방식(새 일정만 바꿀 수 있음). 추천에서 넣을 때도 모드를 따른다(꺼짐 = 확정, 켜짐 = 계획)
    let bk = existing ? planBk(existing) : '공부';
    const titleEl = el('b'); pop.append(titleEl);
    const snap = existing ? canon(existing) : '';   // 열 때의 모습(고치는 사이 다른 곳에서 바뀌었는지 확인용)
    const catLine = el('div', undefined, 'pl-tagline'), catTag = el('span', '', 'pl-tag'), catTxt = el('small', '', 'pl-popnote'); catLine.append(catTag, catTxt);
    if (existing) pop.append(catLine);
    const dIn = el('input'); dIn.type = 'date'; dIn.value = date; if (!existing) dIn.min = ctx.today; dIn.setAttribute('aria-label', '날짜'); if (pickDate) pop.append(dIn);
    // 넣는 방식 스위치(새 일정만)
    const swRow = el('div', undefined, 'pl-prow'), swPick = el('div', undefined, 'pl-pick'), swBtns = [];
    swPick.setAttribute('role', 'group'); swPick.setAttribute('aria-label', '넣는 방식');
    for (const k of ['계획', '확정']) { const b = el('button', k); b.type = 'button'; b.dataset.mode = k; b.onclick = () => { isTent = k === '계획'; planMode = isTent; syncModeBtn(); paint(); }; swBtns.push(b); swPick.append(b); }
    swRow.append(el('span', '방식'), swPick); if (!existing) pop.append(swRow);
    const sel = el('select'); sel.setAttribute('aria-label', '과목'); for (const c of ctx.courses || []) sel.append(Object.assign(el('option', c), { value: c }));
    const note = el('input'); note.maxLength = 80; note.setAttribute('aria-label', '할 일');
    const st = el('input'); st.type = 'time'; st.step = 600; st.value = hm(startMin); st.setAttribute('aria-label', '시작');
    const len = el('select'); len.setAttribute('aria-label', '길이'); const lens = [30, 45, 60, 90, 120]; const curLen = existing ? mins(existing.e) - mins(existing.s) : 60; if (!lens.includes(curLen) && curLen > 0) lens.push(curLen); for (const m of lens.sort((a, b) => a - b)) len.append(Object.assign(el('option', dur(m)), { value: m })); len.value = String(curLen);
    if (preset) { if (preset.course && [...sel.options].some((o) => o.value === preset.course)) sel.value = preset.course; note.value = preset.note || ''; if (preset.len > 0) { if (![...len.options].some((o) => +o.value === preset.len)) len.append(Object.assign(el('option', dur(preset.len)), { value: preset.len })); len.value = String(preset.len); } }
    if (existing) { const cn = ctx.courseName?.(existing.courseId); if (cn && ![...sel.options].some((o) => o.value === cn)) sel.append(Object.assign(el('option', cn), { value: cn })); if (cn) sel.value = cn; note.value = existing.note || ''; st.value = existing.s; }
    // 종류(고정·공부·과제): 확정할 때와 고칠 때 고른다. 고정 일정은 과목이 없어도 된다(약속 등)
    const none = Object.assign(el('option', '(과목 없음)'), { value: '' });
    const bkRow = el('div', undefined, 'pl-prow'), bkBtns = [], bkPick = el('div', undefined, 'pl-pick'), bkLabel = el('span');
    bkPick.setAttribute('role', 'group'); bkPick.setAttribute('aria-label', '일정 종류');
    for (const k of ['고정', '공부', '과제']) { const b = el('button', k); b.type = 'button'; b.dataset.bk = k; b.onclick = () => { bk = k; paint(); }; bkBtns.push(b); bkPick.append(b); }
    bkRow.append(bkLabel, bkPick); pop.append(bkRow);
    const hint = el('small', '', 'pl-popnote'); hint.setAttribute('role', 'status'); hint.setAttribute('aria-live', 'polite');   // 스위치를 바꾸면 안내가 바뀐다 — 화면낭독도 읽게
    const paint = () => {
      const showBk = existing ? true : !isTent, fixed = showBk && bk === '고정';
      for (const b of swBtns) b.setAttribute('aria-pressed', String((b.dataset.mode === '계획') === isTent));
      for (const b of bkBtns) b.setAttribute('aria-pressed', String(b.dataset.bk === bk));
      bkRow.hidden = !showBk; bkLabel.textContent = isTent ? '확정할 종류' : '종류';
      if (fixed) { if (!none.isConnected) sel.prepend(none); if (existing && !existing.courseId) sel.value = ''; } else if (none.isConnected) { const was = sel.value; none.remove(); if (!was) sel.selectedIndex = 0; }
      note.placeholder = fixed ? '이름(예: 병원 예약)' : '할 일(예: 12.3 연습문제)'; note.required = !existing || fixed;
      const cat = isTent ? '계획' : bk;
      titleEl.textContent = existing ? (isTent ? '계획 고치기·확정' : '일정 고치기') : preset ? `추천을 ${isTent ? '계획' : '확정 ' + bk}으로 넣기` : pickDate ? `일정 추가 — ${isTent ? '계획' : '확정 ' + bk}` : `${date.slice(5).replace('-', '/')}(${wd(date)}) ${isTent ? '계획' : '확정 ' + bk} 넣기`;
      catTag.textContent = cat; catTag.className = 'pl-tag'; catTxt.textContent = `${CAT_NAME[cat]} — ${CAT_MEANS[cat]}`;
      hint.textContent = isTent ? '계획이에요 — 점선으로 보이고 눌러서 확정할 수 있어요. 채우기·다시 짜기는 이 자리를 피해서 짜요. 지우려면 삭제.' : `확정 ${bk} 일정이에요 — 채우기·다시 짜기가 건드리지 않아요.`;
      if (ok) ok.textContent = existing ? '저장' : isTent ? '계획으로 넣기' : '확정으로 넣기';
    };
    const ok = el('button', existing ? '저장' : '넣기'); ok.type = 'submit'; const no = el('button', '닫기', 'ghost'); no.type = 'button'; no.onclick = close;
    pop.append(sel, note, st, len, hint);
    const act = el('div', undefined, 'pl-act');
    let confirmBtn = null;
    if (tentativeNow) { confirmBtn = el('button'); confirmBtn.type = 'button'; confirmBtn.innerHTML = svg(ICON.check); confirmBtn.append(el('span', '확정')); act.append(confirmBtn); ok.classList.add('ghost'); }
    act.append(ok);
    if (existing) { const del = el('button'); del.type = 'button'; del.className = 'danger'; del.innerHTML = svg(ICON.trash); del.append(el('span', '삭제')); del.setAttribute('aria-label', '이 일정 삭제'); del.title = '삭제 — 지운 뒤 10초 동안 되돌릴 수 있어요';
      del.onclick = async () => { del.disabled = true; const r = await removePlan(existing); if (r === false) del.disabled = false; else close(); }; act.append(del); }
    pop.append(act);
    if (preset?.key) { const hide = el('button', '이 추천 숨기기(오늘)', 'ghost'); hide.type = 'button'; hide.onclick = async () => { hide.disabled = true; const r = await hideRec(preset.date || date, preset.key, preset.label || ''); if (r === false) hide.disabled = false; else close(); }; pop.append(hide); }
    pop.append(no);
    if (pickDate) pop.append(el('small', existing ? '구글 캘린더 일정은 캘린더에서 고쳐 주세요.' : '구글 캘린더 일정(약속 등)은 캘린더에서 넣으면 여기 시간표에 같이 보여요.', 'pl-popnote'));
    paint();
    const send = async (confirming) => {
      const s = mins(st.value), end = s + Number(len.value); if (end > LAST) { app.status?.('자정을 넘겨요. 시작을 앞당겨 주세요.', true); return; }
      const fixed = (existing ? (!isTent || confirming) : !isTent) && bk === '고정'; if (fixed && !note.value.trim()) { app.status?.('고정 일정은 이름을 적어 주세요.', true); note.focus(); return; }
      ok.disabled = true; if (confirmBtn) confirmBtn.disabled = true; keepDay();
      const item = { date: pickDate ? dIn.value || date : date, s: hm(s), e: hm(end), courseId: ctx.courseId?.(sel.value) || '', note: note.value.trim(), kind: existing?.kind || (fixed ? '고정 일정' : '시험 대비') };   // 고정 일정은 공부 계획 종류(시험 대비)로 세지 않게 따로 이름 붙임
      let done;
      if (existing) {
        // 창을 연 뒤 다른 곳에서 이 일정이 바뀌었으면(최신 목록과 열 때 모습이 다르면) 덮어쓰지 않고 멈춘다
        const cur = (ctx.plans || []).find((q) => q.id === existing.id);
        if (!cur || canon(cur) !== snap) { app.status?.(cur ? '그 사이 다른 화면에서 이 일정이 바뀌었어요. 창을 닫고 다시 열어 주세요.' : '이 일정이 이미 없어졌어요.', true); ok.disabled = false; if (confirmBtn) confirmBtn.disabled = false; return; }
        const meta = {}; if (planState(existing) === 'confirmed') { meta.bk = bk; if (existing.state) meta.state = 'confirmed'; } else if (confirming) { meta.state = 'confirmed'; meta.bk = bk; }
        try { done = await ctx.updatePlan?.({ ...existing, ...item, ...meta, id: existing.id }); } catch { done = false; }   // 통신 오류도 실패로: 창과 입력은 그대로, 버튼은 다시 활성
      } else { try { done = await ctx.addPlan?.({ ...item, src: 'manual', ...(isTent ? { state: 'tentative' } : { state: 'confirmed', bk }) }); } catch { done = false; } }
      if (done === false) { ok.disabled = false; if (confirmBtn) confirmBtn.disabled = false; } else close();
    };
    pop.onsubmit = (e) => { e.preventDefault(); send(false); };
    if (confirmBtn) confirmBtn.onclick = () => send(true);
    document.body.append(pop);
    const x = at?.x ?? anchor.getBoundingClientRect().left, y = at?.y ?? anchor.getBoundingClientRect().top;
    placePop(pop, x, y);
    note.focus();
  }
  // 수업·캘린더·고정 일정·시험 블록 창. 화면(body)에 띄우고 바깥 누르기·Esc 로 닫힘.
  //  수업: 출석(서버 attendance — 미래는 서버가 막음) · 이해도 1~5 · 시작/종료 시각(공부 기록 v60.classLog) · 휴강(두 번 확인)
  //  캘린더: 시각 고치기 → 확인 → 구글 캘린더 변경 대기열(/api/aliveweek/changes, 원본 버전이 맞을 때만). 「운선」 일정은 제목을 보이지 않음
  function blockPopup(b, anchor, at) {
    const { pop, close } = mkPop('div', 'pl-info', '', anchor);
    const date = b.date || ctx.today, when = `${date.slice(5).replace('-', '/')}(${wd(date)}) ${hm(b.s)}–${hm(b.e)}`, cat = blockCat(b);
    pop.setAttribute('aria-label', `${b.title} ${when}`);
    pop.append(el('b', b.title), el('small', when + (b.cls?.room ? ` · ${b.cls.room}` : ''), 'pl-popnote'));
    if (cat) { const line = el('div', undefined, 'pl-tagline'); line.append(el('span', cat, 'pl-tag'), el('small', `${CAT_NAME[cat]} — ${CAT_MEANS[cat]}`, 'pl-popnote')); pop.append(line); }
    // 지우기: 시간표에서 지우지 않는다 — 원본(캘린더·학교 시간표·얼라이브위크·상담실)에서만 바꾼다는 것을 버튼 자리에 안내
    const ORIGIN = { cal: '시간표에서 지우지 않아요 — 구글 캘린더 원본에서만 지우고 바꿔요.', class: '시간표에서 지우지 않아요 — 학교 시간표(수업) 원본이에요. 안 하는 날은 아래 「휴강으로 표시」.', work: '시간표에서 지우지 않아요 — 얼라이브위크 기본 시간표에서만 바꿔요.', exam: '시간표에서 지우지 않아요 — 시험 일정은 상담실에서만 바꿔요.' };
    if (ORIGIN[b.k]) pop.append(el('small', ORIGIN[b.k], 'pl-popnote pl-origin'));
    // 같은 시각·같은 이름이라 한 칸으로 합친 다른 출처(캘린더·기본 시간표·수업)는 여기서 눌러 열 수 있다 — 합치면서 원본에 닿는 길을 잃지 않게
    if (b.also?.length) {
      const NAME = { class: '학교 시간표 수업', cal: '구글 캘린더', work: '얼라이브위크 기본 시간표' }, box = el('div', undefined, 'pl-also');
      box.append(el('small', '같은 시간에 이 일정이 다른 곳에도 있어서 한 칸으로 합쳤어요.', 'pl-popnote'));
      for (const x of b.also) { const r = el('button', `${NAME[x.k] || x.k} · ${x.title}`, 'ghost'); r.type = 'button'; r.onclick = (e) => openBlock({ ...x, date: b.date }, anchor, { x: e.clientX || 0, y: e.clientY || 0 }); box.append(r); }
      pop.append(box);
    }
    const row = (label, ...kids) => { const r = el('div', undefined, 'pl-prow'); r.append(el('span', label), ...kids); return r; };
    const pick = (opts, cur, onPick) => { const g = el('div', undefined, 'pl-pick'); for (const [v, t] of opts) { const x = el('button', t); x.type = 'button'; x.setAttribute('aria-pressed', String(cur === v)); x.onclick = () => onPick(v, x); g.append(x); } return g; };
    if (b.k === 'class') {
      const c = b.cls, key = c.id, log = () => (v60.classLog || {})[key] || {}, future = date > ctx.today;
      const setLog = (patch) => save((st) => { st.classLog = st.classLog || {}; st.classLog[key] = { ...(st.classLog[key] || {}), ...patch, course: c.course, date }; });
      const ATT = [['present', '출석'], ['late', '지각'], ['absent', '결석'], ['excused', '공결']];
      const att = pick(ATT, c.record?.status || null, async (v, x) => { x.disabled = true; const r = await ctx.attend?.(c.courseId, date, v); x.disabled = false; if (r !== false) { c.record = { ...(c.record || {}), status: v }; for (const y of att.children) y.setAttribute('aria-pressed', String(y === x)); } });
      if (future) for (const y of att.children) y.disabled = true;
      pop.append(row('출석', att));
      if (future) pop.append(el('small', '미래 수업은 출석을 정할 수 없어요.', 'pl-popnote'));
      const und = pick([1, 2, 3, 4, 5].map((n) => [n, String(n)]), log().und ?? null, (v, x) => { setLog({ und: v }); for (const y of und.children) y.setAttribute('aria-pressed', String(y === x)); });
      und.setAttribute('aria-label', '이해도 1~5'); pop.append(row('이해도', und));
      const t = el('span', '', 'pl-ptime'); const paint = () => { const l = log(); t.textContent = `${l.startedAt ? '시작 ' + l.startedAt : ''}${l.endedAt ? ' · 끝 ' + l.endedAt : ''}` || '기록 없음'; };
      const sb = el('button', '시작'), eb = el('button', '종료'); sb.type = eb.type = 'button'; sb.setAttribute('aria-label', '수업 시작 기록'); eb.setAttribute('aria-label', '수업 종료 기록');
      sb.onclick = () => { setLog({ startedAt: hm(nowMin()) }); paint(); }; eb.onclick = () => { setLog({ endedAt: hm(nowMin()) }); paint(); };
      if (date !== ctx.today) sb.disabled = eb.disabled = true;
      paint(); pop.append(row('수업', sb, eb, t));
      const cancel = el('button', '휴강으로 표시', 'danger'); cancel.type = 'button'; let armed = false;
      cancel.onclick = async () => { if (!armed) { armed = true; cancel.textContent = '정말 휴강'; return; } cancel.disabled = true; const r = await ctx.attend?.(c.courseId, date, 'cancelled'); if (r === false) { cancel.disabled = false; armed = false; cancel.textContent = '휴강으로 표시'; } else close(); };
      pop.append(cancel);
    } else if (b.k === 'cal') {
      const ev = b.ev || {}, secret = /^\s*운선/.test(ev.title || '');
      const st = el('input'); st.type = 'time'; st.step = 300; st.value = hm(b.s); st.setAttribute('aria-label', '시작');
      const en = el('input'); en.type = 'time'; en.step = 300; en.value = hm(b.e); en.setAttribute('aria-label', '끝');
      const ok = el('button', '시각 바꾸기'); ok.type = 'button';
      pop.append(row('시각', st, el('span', '–'), en), ok, el('small', '구글 캘린더 원본을 바꿔요. 다른 기기에서 먼저 바뀌었으면 막고 알려 줘요.', 'pl-popnote'));
      if (!ev.id || !ctx.calChange) { ok.disabled = true; pop.append(el('small', '이 일정은 여기서 바꿀 수 없어요(원본 정보 없음). 캘린더에서 고쳐 주세요.', 'pl-popnote')); }
      ok.onclick = async () => {
        const s2 = mins(st.value), e2 = mins(en.value); if (!(e2 > s2)) { app.status?.('끝이 시작보다 늦어야 해요.', true); return; }
        if (!confirm(`구글 캘린더 일정${secret ? '' : ` 「${ev.title || '일정'}」`} 을 ${hm(s2)}–${hm(e2)} 로 바꿀까요?`)) return;
        ok.disabled = true; const r = await ctx.calChange({ ev, date, start: hm(s2), end: hm(e2) });
        if (r === false) ok.disabled = false; else { cache.delete(date); close(); draw(); }
      };
    } else if (b.k === 'work') {
      pop.append(el('small', '고정 일정(얼라이브위크 기본 시간표)이에요. 바꾸려면 얼라이브위크에서 고쳐 주세요.', 'pl-popnote'));
    } else if (b.k === 'exam') {
      pop.append(el('small', b.title.includes('(예정)') ? '날짜·시각이 확정되지 않은 시험이에요. 확인되면 상담실에서 고쳐 주세요.' : '시험 일정이에요.', 'pl-popnote'));
    }
    const no = el('button', '닫기', 'ghost'); no.type = 'button'; no.onclick = close; pop.append(no);
    document.body.append(pop);
    const x = at?.x ?? anchor.getBoundingClientRect().left, y = at?.y ?? anchor.getBoundingClientRect().top;
    placePop(pop, x, y);
    pop.querySelector('button:not([disabled])')?.focus();
  }
  // 블록을 누르면 종류별 창 — 시간표 블록과 아래 「일정 목록」이 같은 길을 쓴다
  function openBlock(b, anchor, at) {
    if (b.plan) planPopup(null, b.plan.date, b.s, anchor, at, true, b.plan);
    else if (b.k === 'auto') planPopup(null, b.date || ctx.today, b.s, anchor, at, true, null, { course: b.title.split(' · ')[0], note: b.title.split(' · ').slice(1).join(' · '), len: b.e - b.s, key: b.key, date: b.date || ctx.today, label: b.title });
    else blockPopup(b, anchor, at);
  }
  const WHAT = { plan: '고치기·삭제', class: '출석·이해도·시작·종료', cal: '시각 고치기', auto: '계획으로 넣기·숨기기', work: '내용 보기', exam: '내용 보기' };
  function blockEl(b, PX, now) {
    const cat = blockCat(b), sub = b.k === 'auto' ? ' · 추천' : '';
    const blk = el('div', undefined, `pl-blk k-${b.k} ${cat ? CAT_CLASS[cat] : 'c-unknown'}` + (now >= 0 && b.e <= now ? ' past' : '')); blk.style.top = b.s * PX + 'px'; blk.style.height = Math.max(14, (b.e - b.s) * PX - 2) + 'px';
    if (b.cols > 1) { blk.dataset.n = b.cols; blk.style.setProperty('--n', b.cols); blk.style.setProperty('--c', b.col); }   // 겹치는 무리는 열로 나눠 옆으로
    const line = el('span'); line.append(el('i', cat || '?', 'pl-tag'), document.createTextNode(b.title)); blk.append(line);
    if ((b.e - b.s) * PX > 34) blk.append(el('small', `${hm(b.s)}–${hm(b.e)}${sub}`)); blk.title = `${cat ? CAT_NAME[cat] : '종류 모름'} · ${hm(b.s)}–${hm(b.e)} ${b.title}`;
    // 누르면 종류별 창(대표님 10/9 「시간블럭 누르면 수정할 수가 없는데」): 계획 = 고치기·확정·삭제, 수업 = 출석·이해도·시작·종료, 캘린더 = 시각 고치기,
    // 추천 = 계획으로 넣기·숨기기, 고정 일정·시험 = 내용 보기
    const what = WHAT[b.k];
    if (what) { blk.classList.add('edit'); blk.tabIndex = 0; blk.setAttribute('role', 'button'); blk.setAttribute('aria-label', `${cat ? CAT_NAME[cat] : '종류 모름'} ${b.title} ${hm(b.s)}–${hm(b.e)} ${what}`);
      const open = (e) => { e.stopPropagation(); openBlock(b, blk, e.clientX ? { x: e.clientX, y: e.clientY } : null); };
      blk.onclick = open; blk.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(e); } }; }
    return blk;
  }
  // 시간표 위 범례(대표님 10/12 「구분이 안 가서 기준 마련」): 4종 한 줄, 접을 수 있음(접힘은 이 기기에 기억). 종류별 숨기기는 하지 않음
  function legend() {
    let open = true; try { open = localStorage.getItem('school-plan-legend') !== '0'; } catch {}
    const box = el('div'); box.id = 'pl-legend';
    const toggle = ib(open ? 'up' : 'down', open ? '범례 접기' : '범례 펴기'); toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-controls', 'pl-legend');
    toggle.onclick = () => { try { localStorage.setItem('school-plan-legend', open ? '0' : '1'); } catch {} draw(); };
    if (!open) { box.className = 'pl-legend-off'; box.append(toggle); return box; }
    box.className = 'pl-legend'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', '블록 종류 범례');
    for (const c of CATS) { const it = el('span', undefined, 'pl-leg'); it.title = CAT_MEANS[c]; it.append(el('i', undefined, 'pl-sw ' + CAT_CLASS[c]), el('span', `${CAT_NAME[c]} ${c === '계획' ? '(미확정)' : ''}`.trim())); box.append(it); }
    box.append(toggle);
    return box;
  }
  // 일정 목록: 짧거나 겹쳐서 누르기 힘든 블록도 44px 줄로 누를 수 있게(터치·키보드·화면낭독 경로)
  function blockList(blocks) {
    const d = el('details', undefined, 'pl-list'); d.append(el('summary', `이 날 일정 목록 (${blocks.length})`));
    for (const b of blocks.slice().sort((x, y) => x.s - y.s || x.e - y.e)) {
      if (!WHAT[b.k]) continue; const cat = blockCat(b);
      const r = el('button'); r.type = 'button'; r.append(el('i', cat || '?', 'pl-tag'), el('span', `${hm(b.s)}–${hm(b.e)}`, 'pl-tt'), el('span', b.title)); r.setAttribute('aria-label', `${cat ? CAT_NAME[cat] : '종류 모름'} ${b.title} ${hm(b.s)}–${hm(b.e)} ${WHAT[b.k]}`);
      r.onclick = (e) => openBlock(b, r, { x: e.clientX || r.getBoundingClientRect().left, y: e.clientY || r.getBoundingClientRect().top }); d.append(r);
    }
    return d;
  }
  function setScroll(box, top) { programmatic = true; box.scrollTop = Math.max(0, top); requestAnimationFrame(() => { programmatic = false; }); }
  function scrollToNow(box, PX, force) {
    if (!box?.isConnected) return; if (!force && Date.now() - userScroll < 120000) return;
    setScroll(box, (nowMin() - 90) * PX);   // 지금이 위에서 1시간 반 아래쯤
  }
  // 그날 수업: 오늘은 서버가 계산한 scheduled 그대로. 다른 날은 서버가 준 과목 시간표(slots)·휴일·학기 범위·회차 기록(휴강)이 다 있을 때만 계산
  // — 하나라도 없으면 그리지 않는다(모르는 수업을 지어내지 않음, 대표님 10/9)
  function classesOn(date) {
    if (date === ctx.today) return (ctx.scheduled || []).filter((c) => !c.record?.cancelled);
    const ymd = /^\d{4}-\d{2}-\d{2}$/;   // 시작·끝·휴일 셋 다 확인된 값일 때만(오타 검수 10/9: 끝 날짜 없으면 학기 뒤에도 그리던 것)
    if (!Array.isArray(ctx.holidays) || !ymd.test(ctx.term?.start || '') || !ymd.test(ctx.term?.end || '') || !Array.isArray(ctx.classSlots)) return [];
    if (date < ctx.term.start || date > ctx.term.end || ctx.holidays.includes(date)) return [];
    const dow = new Date(date + 'T00:00:00Z').getUTCDay(), out = [];   // 0=일 (서버 slot.d 와 같음)
    for (const c of ctx.classSlots) (c.slots || []).forEach((sl, i) => {
      if (sl.d !== dow) return;
      const record = (ctx.sessions || []).find((x) => x.courseId === c.id && x.date === date) || {};
      if (!record.cancelled) out.push({ id: `${c.id}:${date}:${i}`, courseId: c.id, course: c.name, date, slot: i, s: sl.s, e: sl.e, room: sl.room || '', record });
    });
    return out;
  }
  // 하루 보기 위 요일 줄: 그 주 월~일 + 날짜, 누르면 그날(대표님 10/9 「오늘 화면처럼 상단에 월화수목금토일」)
  function weekStrip() {
    const ws = weekStart(day), box = el('div', undefined, 'pl-strip'); box.setAttribute('role', 'tablist'); box.setAttribute('aria-label', '요일 고르기');
    for (let i = 0; i < 7; i++) {
      const d = addDays(ws, i), b = el('button', undefined, 'pl-sday' + (d === day ? ' on' : '') + (d === ctx.today ? ' today' : '') + ((ctx.exams || []).some((x) => x.date === d) ? ' exam' : '')); b.type = 'button';
      b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(d === day)); b.setAttribute('aria-label', `${d} ${wd(d)}요일`);
      b.append(el('small', wd(d)), el('b', String(Number(d.slice(8)))));
      b.onclick = () => { day = d; userScroll = 0; draw(); };
      box.append(b);
    }
    return box;
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
      b.onclick = () => { view = v; try { localStorage.setItem('school-plan-view', v); } catch {} draw(); }; seg.append(b);
    }
    const replan = ib('replan', '다시 짜기 — 과제를 빈 시간에 다시 배치', 'go');
    prev.onclick = () => { day = addDays(day, isWeek ? -7 : -1); draw(); }; next.onclick = () => { day = addDays(day, isWeek ? 7 : 1); draw(); };
    today.onclick = () => { day = ctx.today; userScroll = 0; draw(); };
    replan.onclick = () => { draw(); app.status?.('빈 시간에 다시 짰어요.'); };
    const plus = ib('plus', '일정 추가', 'go'); plus.onclick = (e) => { const d = isWeek || isExam ? (day >= ctx.today ? day : ctx.today) : day; const m = d === ctx.today ? Math.ceil((nowMin() + 10) / 30) * 30 : 9 * 60; planPopup(card, d, Math.min(m, 23 * 60), plus, { x: e.clientX - 260, y: e.clientY + 24 }, true); };
    const fill = el('button', '채우기', 'pl-mode pl-fill'); fill.type = 'button'; fill.title = '고정 일정은 그대로, 빈 시간에만 공부 계획 자동 계산해 넣기';
    fill.onclick = () => { const ds = []; if (isExam) { for (let d = ctx.today; d <= end; d = addDays(d, 1)) ds.push(d); } else if (isWeek) { for (let i = 0; i < 7; i++) ds.push(addDays(ws, i)); } else ds.push(day); runFill(ds, all); };
    const pm = el('button', '계획 모드', 'pl-mode'); pm.type = 'button'; pm.setAttribute('aria-pressed', String(planMode)); pm.title = '켜면 새로 넣는 일정이 계획(미확정, 점선)이 되고 끄면 확정 일정이 돼요. 한 주·시험까지 보기에서는 켠 채로 빈 칸을 눌러 넣어요.';
    pm.onclick = () => { planMode = !planMode; modeBtn = pm; draw(); }; modeBtn = pm;
    const more = ib('more', '시간표 메뉴 — 채운 것 지우기·숨긴 추천'); more.setAttribute('aria-haspopup', 'dialog'); more.onclick = (e) => menuPopup(more, ws, e);
    bar.append(...(isExam ? [today, seg] : [prev, today, next, seg]), pm, fill, plus, replan, more);
    head.append(bar); card.append(head);
    if (!isWeek && !isExam) card.append(weekStrip());
    card.append(legend());
    const todayFixed = fixedBlocks(ctx.today), todayPlan = autoPlan(ctx.today, all, todayFixed);
    if (!isWeek && !isExam) {
      const fixed = day === ctx.today ? todayFixed : fixedBlocks(day), plan = day === ctx.today ? todayPlan : { out: [], left: [] };
      const box = el('div', undefined, 'pl-day'), grid = el('div', undefined, 'pl-grid has-lane'), PX = 54 / 60;
      grid.style.height = 24 * 60 * PX + 'px';
      for (let h = 0; h < 24; h++) { const line = el('div', undefined, 'pl-hour'); line.style.top = h * 60 * PX + 'px'; line.append(el('span', String(h).padStart(2, '0'))); grid.append(line); }
      const now = day === ctx.today ? nowMin() : -1;
      const dayBlocks = layoutColumns([...fixed, ...plan.out]);
      for (const b of dayBlocks) grid.append(blockEl(b, PX, now));
      grid.onclick = (e) => {   // 빈칸 누르면 그 시각에 일정(공부 계획) 넣기(대표님 10/9)
        if (e.target.closest('.pl-blk, .pl-place, .pl-lane, .pl-now')) return;
        const r = grid.getBoundingClientRect(), m = Math.max(0, Math.min(23 * 60 + 30, Math.floor(((e.clientY - r.top) / PX) / 30) * 30));
        if (day < ctx.today || (day === ctx.today && m + 30 <= nowMin())) { app.status?.('지난 시각엔 계획을 못 넣어요.', true); return; }
        planPopup(card, day, day === ctx.today ? Math.max(m, Math.ceil(nowMin() / 10) * 10) : m, grid, { x: e.clientX, y: e.clientY });
      };
      grid.append(placeLane(day, PX, now));   // 오른쪽 여백: 있던 곳
      if (now >= 0) { const n = el('div', undefined, 'pl-now'); n.style.top = now * PX + 'px'; n.append(el('span', hm(now))); grid.append(n); }
      if (day === ctx.today) card.append(placeBar(day));
      box.append(grid); card.append(box);
      if (dayBlocks.length) card.append(blockList(dayBlocks));
      { const mn = el('p', modeText(), 'pl-note pl-modenote'); mn.setAttribute('role', 'status'); mn.setAttribute('aria-live', 'polite'); card.append(mn); }
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
      h.onclick = () => { day = date; view = 'day'; try { localStorage.setItem('school-plan-view', 'day'); } catch {} draw(); };
      headRow.append(h);
      const col = el('div', undefined, 'pl-wkcol' + (isToday ? ' today' : '') + (exams.length ? ' exam' : '')); col.style.height = 24 * 60 * PX + 'px'; col.dataset.date = date;
      for (let hh = 1; hh < 24; hh++) { const l = el('div', undefined, 'pl-wkline'); l.style.top = hh * 60 * PX + 'px'; col.append(l); }
      for (const b of layoutColumns(isToday ? [...todayFixed, ...todayPlan.out] : fixedBlocks(date))) col.append(blockEl(b, PX, isToday ? nowM : (date < ctx.today ? 1e9 : -1)));
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
    const wn = el('p', '', 'pl-note pl-modenote'); wn.setAttribute('role', 'status'); wn.setAttribute('aria-live', 'polite'); wn.dataset.week = '1'; wn.dataset.tail = ctx.holidays ? '수업은 학교 시간표(휴일·휴강 빼고)에서 가져와요.' : '수업은 오늘 칸만 학교 시간표에서 가져와요(휴일 정보가 없어 다른 날은 안 그려요).'; wn.textContent = noteText(wn); card.append(wn);
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
    // 저장이 끝날 때마다 다시 그리면 입력 중이던 글자·커서가 날아갔다(10/9) → 할 일 넣기 칸 값과 지금 커서 칸을 새 화면에 옮긴다
    const keyOfField = (f) => `${f.closest('[data-key]')?.dataset.key || ''}|${f.closest('form')?.className || ''}|${f.name || ''}|${f.getAttribute('aria-label') || ''}`;
    const fields = (root) => [...root.querySelectorAll('input:not([type=checkbox]),select,textarea')];
    const active = host.contains(document.activeElement) && document.activeElement.matches('input,select,textarea') ? document.activeElement : null;
    const keep = new Map(fields(host).filter((f) => f === active || f.closest('.pl-add')).map((f) => [keyOfField(f), f]));
    for (const f of fields(wrap)) {
      const old = keep.get(keyOfField(f)); if (!old) continue;
      if (old.closest('.pl-add') || old === active) f.value = old.value;
      if (old === active) queueMicrotask(() => { f.focus({ preventScroll: true }); try { f.setSelectionRange(old.selectionStart, old.selectionEnd); } catch {} });
    }
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
    // 할 일 목록은 공부·과제·공모전 세 묶음, 자동 배치는 집중 과목 밖이면 마감 오늘·내일일 때만
    async render(target, c) {
      const sameDay = ctx && ctx.today === c.today && Date.now() < keepDayUntil;
      host = target; ctx = c; day = sameDay ? day : c.today; bootDay = kst(); if (c.calendarOk) cache.set(c.today, c.calendar || []); else cache.delete(c.today);   // 확인 못 한 오늘 캘린더는 다시 받기
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
    destroy() { clearInterval(tick); host = null; toast.hide(); },
  };
}
