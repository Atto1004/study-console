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
  up: '<path d="M6 15l6-6 6 6"/>', down: '<path d="M6 9l6 6 6-6"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>', moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>', pin: '<path d="M12 21s-6.5-5.4-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.6 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.3"/>' };
const ib = (icon, label, cls = '') => { const b = el('button', undefined, 'pl-ib ' + cls); b.type = 'button'; b.innerHTML = svg(ICON[icon]); b.setAttribute('aria-label', label); b.title = label; return b; };
const mins = (hm) => { const [h, m] = String(hm || '0:0').split(':').map(Number); return h * 60 + (m || 0); };
const hme = (n) => n >= 1440 ? '24:00' : hm(n);
const hm = (n) => `${String(Math.floor(n / 60) % 24).padStart(2, '0')}:${String(Math.round(n % 60)).padStart(2, '0')}`;
const dur = (n) => { n = Math.max(0, Math.round(n)); const h = Math.floor(n / 60), m = n % 60; return h ? `${h}시간${m ? ' ' + m + '분' : ''}` : `${m}분`; };
const kst = (d = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(d);
const nowMin = () => { const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()); return mins(p); };   // 0~1439 (자정 직후 24:05 로 나오지 않게 h23)
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
export const CATS = ['고정', '공부', '과제', '이동', '준비', '밥', '수면', '계획'];
// 준비(외출·등교 준비: 씻기·옷 입기)·밥(식사)도 이동처럼 과목 없이 시간만 정하는 일정 — 움직이지 않는 일정과 같은 순위, 공부 상한·통계·추천에서 제외(서버 activity 표식)
export const NONSTUDY_BK = ['이동', '준비', '밥'];
export const SIMPLE_BK = ['준비', '밥'];
export const PREP_LENS = [15, 30, 45, 60, 90], MEAL_LENS = [15, 20, 30, 40, 60];
export const lensOf = (bk) => bk === '준비' ? PREP_LENS : MEAL_LENS;
export const defaultLen = (bk) => bk === '준비' ? 30 : 40;
export const mealName = (m) => m >= 300 && m < 600 ? '아침' : m >= 600 && m < 900 ? '점심' : m >= 900 && m < 1320 ? '저녁' : '밥';   // 5~10시 아침 · 10~15시 점심 · 15~22시 저녁 · 그 밖 밥
export const defaultName = (bk, startMin) => bk === '준비' ? '준비' : bk === '밥' ? mealName(startMin) : '';
export const planState = (p) => p?.state === 'tentative' ? 'tentative' : 'confirmed';
// 끝 시각이 지났는지(KST). 계획(미확정)인데 끝이 지났으면 「계획대로 확정됨」으로 보여 준다 — 화면에서만 바꾸는 파생이고 서버 기록은 그대로(실제로 했는지는 모른다)
export const planEndMs = (p) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(p?.date || '')) return null; const d = p.allDay ? planAllDaySpan(p).to : p.date, m = p.allDay ? 1440 : /^\d{2}:\d{2}$/.test(p?.e || '') ? mins(p.e) : null; return m == null ? null : Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) + m * 60000 - 9 * 3600e3; };   // 종일은 마지막 날 24:00 이 끝
export const planLapsed = (p, nowMs) => planState(p) === 'tentative' && !p?.done && planEndMs(p) != null && planEndMs(p) <= nowMs;
export function planBk(p) {   // 확정 계획의 종류: bk 가 있으면 그대로, 없으면 note 로 추정(채우기는 note 를 「과제 · 이름」「시험 공부 · …」 꼴로 씀)
  if (['고정', '공부', '과제', '이동', '준비', '밥'].includes(p?.bk)) return p.bk;
  return /^\s*(과제|공모전)\s*·/.test(p?.note || '') ? '과제' : '공부';
}
// 구글 캘린더에서 들어온 이동: 대표님 색 규칙 colorId 1 = 이동. 색이 1 인 것만 이동 모양으로 본다(제목 글자로는 추정하지 않는다 — 「이동 수업」 같은 제목을 이동으로 잘못 보는 위험)
export const isMoveEvent = (ev) => String(ev?.color ?? '') === '1';
// 이동 일정의 이름 기본값(출발 → 도착). 입력이 하나도 없으면 빈 글자
export const moveName = (from, to) => { const a = String(from || '').trim(), b = String(to || '').trim(); return a && b ? `${a} → ${b}` : a ? `${a}에서 출발` : b ? `→ ${b}` : ''; };
export const MOVE_LENS = [5, 10, 15, 20, 30, 45, 60];
export function blockCat(b) {   // 시간표 블록 → 4종. 모르는 종류는 null(화면은 「?」 표식 — 분류 불명을 조용히 숨기지 않는다)
  if (!b) return null;
  if (b.k === 'auto') return '계획';
  if (b.k === 'plan') return planState(b.plan) === 'tentative' ? '계획' : planBk(b.plan);
  if (b.k === 'sleep') return '수면';
  if (b.k === 'cal' && isMoveEvent(b.ev)) return '이동';
  return ['class', 'cal', 'work', 'exam'].includes(b.k) ? '고정' : null;
}
export const CAT_CLASS = { 고정: 'c-fixed', 공부: 'c-study', 과제: 'c-hw', 이동: 'c-move', 준비: 'c-prep', 밥: 'c-meal', 수면: 'c-sleep', 계획: 'c-plan' };
export const CAT_NAME = { 고정: '고정일정', 공부: '공부블록', 과제: '과제블록', 이동: '이동', 준비: '준비', 밥: '밥', 수면: '수면', 계획: '계획일정' };
export const CAT_MEANS = { 고정: '움직이지 않는 일정 — 수업·약속·시험', 공부: '확정한 공부 시간', 과제: '확정한 과제·제출물 작업 시간', 이동: '움직이지 않는 이동 시간 — 출발지 → 도착지', 준비: '움직이지 않는 준비 시간 — 외출·등교 준비(씻기·옷 입기)', 밥: '움직이지 않는 식사 시간', 수면: '잔 시간(기록은 채움) · 앞으로 올 밤은 목표로 계산한 점선', 계획: '아직 확정 안 한 자리 — 눌러서 확정' };
// 글자색·배경색(대비 4.5:1 이상 — 테스트가 계산). 지난 블록은 opacity .8 로 흐리게 하므로 그 합성값도 검사한다
export const BLOCK_COLORS = {
  'k-class': ['#2c4a6e', '#ffffff'], 'k-plan-fixed': ['#4b3f72', '#ffffff'], 'k-cal': ['#48525e', '#ffffff'], 'k-work': ['#6e4609', '#ffffff'], 'k-exam': ['#8f2a18', '#ffffff'],
  'c-study': ['#e0efe5', '#14261f'], 'c-hw': ['#fbe4cc', '#3a1f0c'], 'c-plan': ['#f4f7f5', '#26352e'], 'c-move': ['#e8e4f4', '#2a1f4a'], 'c-prep': ['#d9f0f0', '#0d2b2c'], 'c-meal': ['#fdeccf', '#3d2504'], 'tag-prep': ['#155456', '#ffffff'], 'tag-meal': ['#744510', '#ffffff'], 'small-prep': ['#d9f0f0', '#1d4a4b'], 'small-meal': ['#fdeccf', '#58360a'], 'c-sleep': ['#1d2340', '#f4f7fb'], 'c-sleep-stripe': ['#2a3260', '#f4f7fb'], 'c-sleep-plan': ['#e9ecf8', '#1d2340'], 'tag-sleep': ['#f4f7fb', '#1d2340'], 'small-sleep': ['#1d2340', '#e3e8f7'], 'lane-move': ['#e8e4f4', '#2a1f4a'], 'lane-group': ['#eef2f7', '#2f4254'], 'small-sleep-plan': ['#e9ecf8', '#2b3566'],
  'tag-study': ['#245a43', '#ffffff'], 'tag-hw': ['#86400c', '#ffffff'], 'tag-plan': ['#f4f7f5', '#34483d'], 'tag-move': ['#5a4a8a', '#ffffff'],
  'small-class': ['#2c4a6e', '#ffffff'], 'small-plan-fixed': ['#4b3f72', '#ffffff'], 'small-cal': ['#48525e', '#ffffff'], 'small-work': ['#6e4609', '#ffffff'], 'small-exam': ['#8f2a18', '#ffffff'],
  'sleep-text': ['#f4f7fb', '#1c2a3a'], 'sleep-small': ['#f4f7fb', '#3a4a5d'], 'sleep-btn': ['#22344a', '#ffffff'], 'sleep-ghost': ['#ffffff', '#22344a'], 'night-big': ['#0f1a22', '#e6edf3'], 'night-sub': ['#0f1a22', '#b4c0cc'], 'night-btn': ['#1d3040', '#ffffff'],
  'small-study': ['#e0efe5', '#2f4036'], 'small-hw': ['#fbe4cc', '#46290f'], 'small-plan': ['#f4f7f5', '#2f4036'], 'small-move': ['#e8e4f4', '#3b2f66'], 'legend': ['#ffffff', '#2f4036'],
};
export const PAST_OPACITY = 0.8;
// 같은 시간에 여러 종류가 겹칠 때: 위에 쌓지 않고(터치로 아래 것을 못 누른다) 겹치는 무리 전체를 열로 나눠 옆으로 늘어놓는다.
// 열 순서 = 고정 > 공부·과제 > 계획, 같은 순위는 시작 시각 → 제목 순. 안 겹치는 블록은 한 열(전체 폭).
const RANK = { 고정: 0, 이동: 0, 준비: 0, 밥: 0, 수면: 0, 공부: 1, 과제: 1, 계획: 2 };
// 수면: 기록(확정·취침 표식)은 고정과 같은 0, 목표로 계산한 계획 수면은 계획(2)보다 뒤 3 — 다른 블록이 수면 시간대에 들어오면 수면이 가장 오른쪽 열로 간다
export const rankOf = (b) => b?.k === 'sleep' && b.sleep?.state === 'plan' ? 3 : (RANK[blockCat(b)] ?? 0);   // (이동 = 고정과 같은 순위. 미확정 이동은 blockCat 이 「계획」이라 2)
export function layoutColumns(blocks) {
  const list = blocks.filter((b) => b.e > b.s).slice().sort((a, b) => a.s - b.s || a.e - b.e);
  const clusters = []; let cur = null, end = -1;
  for (const b of list) { if (!cur || b.s >= end) { cur = []; clusters.push(cur); end = b.e; } else end = Math.max(end, b.e); cur.push(b); }
  for (const cl of clusters) {
    const cols = [];
    for (const b of cl.slice().sort((a, b) => rankOf(a) - rankOf(b) || a.s - b.s || String(a.title).localeCompare(String(b.title), 'ko'))) {
      const lo = rankOf(b) === 3 ? Math.max(0, ...cols.flatMap((c) => c).filter((x) => x.e > b.s && x.s < b.e).map((x) => x.col + 1)) : 0;   // 계획 수면: 겹치는 다른 블록이 있으면 그 오른쪽 열부터(순위만으로는 왼쪽 빈 열에 들어갈 수 있다)
      let i = cols.findIndex((c, k) => k >= lo && c.every((x) => x.e <= b.s || x.s >= b.e)); if (i < 0) { cols.push([]); i = cols.length - 1; }
      while (i < lo) { cols.push([]); i = cols.length - 1; }
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
    const host = b.k in rank ? kept.find((x) => x.k in rank && !has(x, b.k) && x.s === b.s && x.e === b.e && blockCat(x) === blockCat(b) && normTitle(x.title) && normTitle(x.title) === normTitle(b.title)) : null;
    if (host) (host.also = host.also || []).push(b); else kept.push(b);
  }
  return list.filter((b) => kept.includes(b));
}
// ── 자기 전 접속 종료 → 수면 추정(대표님 10/12) ──
// 기록: v60.sleep[기상일] = {bed:'HH:MM', wake?:'HH:MM', src:'app', bedAt, wakeAt?} — 옛 관제탑·서버 health() 와 같은 자리(새 저장소 없음).
// 키 = 기상일(누른 때가 12:00 이후면 다음 날, 12:00 전이면 같은 날). bedAt·wakeAt 은 KST(+09:00) 전체 시각 — 서버는 앱 기록이면 이 둘의 차이로 계산하고, 하나라도 이상하면 무효로 둔다.
// 정직성: 누른 시각은 「자러 간 시각」이지 잠든 시각이 아니다 — 입면 보정 없이 그대로의 간격만 보여 주고 「추정」이라 부른다.
export const SLEEP = { lead: 120, end: 360, morningFrom: 240, shortcutUntil: 720, shortcutGapMs: 2 * 3600e3, confirmH: 16, maxH: 24 };
const okHM = (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(v || ''));
const p2 = (n) => String(n).padStart(2, '0');
// 수면 시간대: 취침 목표(v60.cfg.bed, 기본 01:00) 2시간 전(포함)부터 06:00(제외). 목표가 06:00~18:00 같은 이상값이면 기본값
export function sleepWindow(bedCfg) {
  let b = okHM(bedCfg) ? mins(bedCfg) : 60;
  if (b >= 360 && b < 1080) b = 60;
  return { start: (b - SLEEP.lead + 1440) % 1440, end: SLEEP.end };
}
export function inSleepWindow(m, bedCfg) { const { start, end } = sleepWindow(bedCfg); return start > end ? (m >= start || m < end) : (m >= start && m < end); }
export const sleepKeyFor = (date, m) => (m >= 720 ? addDays(date, 1) : date);   // 날짜 문자열 덧셈만(브라우저 현지 날짜 연산 안 섞음)
export const kstStamp = (date, h, m, s = 0) => `${date}T${p2(h)}:${p2(m)}:${p2(s)}+09:00`;
// KST 전체 시각 → 밀리초. 없는 날짜(2026-02-30)·없는 시각을 Date 가 다음 달·다음 날로 밀어 주는 것을 막으려고 부품으로 다시 만들어 왕복이 같은지 확인한다(서버 fromisoformat 과 같은 판정)
const parseKst = (v) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\+09:00$/.exec(String(v || '')); if (!m) return null;
  const [y, mo, d, h, mi, sec] = m.slice(1).map(Number), u = new Date(Date.UTC(y, mo - 1, d, h, mi, sec));
  if (u.getUTCFullYear() !== y || u.getUTCMonth() !== mo - 1 || u.getUTCDate() !== d || u.getUTCHours() !== h || u.getUTCMinutes() !== mi || u.getUTCSeconds() !== sec) return null;
  return u.getTime() - 9 * 3600e3;
};
export function sleepHours(bedAt, wakeAt) { const a = parseKst(bedAt), b = parseKst(wakeAt); if (a == null || b == null) return null; const h = (b - a) / 36e5; return h > 0 && h <= SLEEP.maxH ? h : null; }
// 앱 기록(src:'app')의 간격 — 서버 app_sleep_hours 와 같은 검증: 전체 시각이 유효하고, 기상일이 기록 키와 같고, HH:MM(bed·wake)이 전체 시각과 일치하고, 0 초과 24 이하
export function appSleepHours(rec, key) {
  if (!rec || rec.bed !== String(rec.bedAt || '').slice(11, 16) || rec.wake !== String(rec.wakeAt || '').slice(11, 16) || String(rec.wakeAt || '').slice(0, 10) !== key) return null;
  return sleepHours(rec.bedAt, rec.wakeAt);
}
export const legacyHours = (bed, wake) => { if (!okHM(bed) || !okHM(wake)) return null; const d = (mins(wake) - mins(bed) + 1440) % 1440; return d ? d / 60 : null; };   // 옛 기록(HH:MM 만): 취침이 더 늦으면 전날로 본다
export const fmtHours = (h) => dur(Math.round(h * 60));
export const sleepCanon = canon;   // (canon 은 위에서 정의: 키 순서와 상관없이 같은 객체면 같은 문자열)
// 화면에 보일 것 계산(순수 함수): 취침 버튼 · 기상 대기 줄(앱 기록 중 취침만 있는 것) · 어젯밤 요약
export function sleepView({ sleep = {}, date, min, nowMs, bedCfg }) {
  const inWin = inSleepWindow(min, bedCfg), key = sleepKeyFor(date, min), here = sleep[key];
  const out = { inWin, key, button: inWin && !here, rows: [], more: 0, summary: null, lock: null };
  if (inWin && here && !(here.src === 'app' && here.bed && !here.wake)) out.lock = here.bed ? `${here.bed} 취침 기록 있음` : null;   // 직접 입력·말로 준 기록·이미 끝난 기록은 건드리지 않는다
  const pend = Object.entries(sleep).filter(([k, r]) => r && r.src === 'app' && r.bed && !r.wake && k <= addDays(date, 1)).sort((a, b) => b[0].localeCompare(a[0]));
  out.more = Math.max(0, pend.length - 3);
  for (const [k, r] of pend.slice(0, 3)) {
    const t0 = parseKst(r.bedAt), night = k > date || (k === date && min < SLEEP.morningFrom);   // 아직 밤(기상 질문 전)
    const gap = t0 != null && nowMs != null && nowMs - t0 >= SLEEP.shortcutGapMs;   // bedAt 이 없거나 이상하거나 미래면 지름길 없음
    out.rows.push({ key: k, bed: r.bed, rec: r, night, wakeInput: k <= date, shortcut: k === date && min >= SLEEP.morningFrom && min < SLEEP.shortcutUntil && gap, again: inWin && k === key });
  }
  const t = sleep[date];
  if (t && t.bed && t.wake) {
    const app = t.src === 'app', h = app ? appSleepHours(t, date) : legacyHours(t.bed, t.wake);
    out.summary = { bed: t.bed, wake: t.wake, hours: h, app };
  }
  return out;
}
// 저장 한 번에 하나씩 최신 상태에서 다시 검사하는 변경(409 재적용 때도 그대로 돈다). 결과: 'applied' 적용 · 'kept' 이미 기록이 있어 유지 · 'conflict' 그 사이 바뀌어 중단 · 'invalid' 값 이상
export function applyBed(s, { key, bed, bedAt, force = false, seen = '' }) {
  s.sleep = s.sleep || {}; const cur = s.sleep[key];
  if (!force) { if (cur) return 'kept'; s.sleep[key] = { bed, src: 'app', bedAt }; return 'applied'; }   // 같은 밤 첫 기록 유지(있으면 안 덮음)
  if (!cur || cur.src !== 'app' || cur.wake || canon(cur) !== seen) return 'conflict';   // 다시 기록: 사용자가 본 앱 기록 그대로이고 기상이 아직 없을 때만
  s.sleep[key] = { bed, src: 'app', bedAt }; return 'applied';
}
export function applyWake(s, { key, wake, wakeAt, seen }) {
  const cur = s.sleep?.[key];
  if (!cur || cur.src !== 'app' || cur.wake || canon(cur) !== seen) return 'conflict';   // 사용자가 본 취침 기록이 그대로일 때만 기상을 붙인다
  if (appSleepHours({ ...cur, wake, wakeAt }, key) == null) return 'invalid';   // 최신 취침 기준으로 서버와 같은 검증(전체 시각·기상일=키·HH:MM 일치·간격)
  cur.wake = wake; cur.wakeAt = wakeAt; return 'applied';
}
export function applyClear(s, { key, seen }) {
  const cur = s.sleep?.[key];
  if (!cur || cur.src !== 'app' || cur.wake || canon(cur) !== seen) return 'conflict';
  delete s.sleep[key]; return 'applied';
}
// 되돌리기: 이 작업이 저장한 값(saved)이 아직 그대로일 때만 이전 객체 전체(prev, 없었으면 없음)로 복원
export function applyRestore(s, { key, prev, saved }) {
  const cur = s.sleep?.[key];
  if (canon(cur) !== saved) return 'conflict';
  s.sleep = s.sleep || {}; if (prev) s.sleep[key] = JSON.parse(JSON.stringify(prev)); else delete s.sleep[key]; return 'applied';
}
// ── 수면 블록(대표님 10/12 「취침시간도 넣어줘. 과거는 확정, 미래는 계획으로 자동설정」) ──
// 밤 하나 = 기상일 키 K. 저장된 기록(Apple 건강 > 앱 기록 > 직접 입력)이 있으면 확정, 없으면 목표(v60.cfg.bed·sleepH)로 계산한 계획. 계획은 저장하지 않는다(렌더 때마다 계산).
// 모든 시각은 KST 절대 시각(ms)으로 다루고, 날짜 경계에서만 잘라 날짜별 조각으로 만든다.
export const SLEEP_GOAL = { minH: 4, maxH: 12, defBed: 60, defH: 8 };
const okBedGoal = (v) => okHM(v) && (mins(v) >= 1080 || mins(v) < 360);   // 취침 목표 허용: 18:00~23:59(전날 밤) · 00:00~05:59(그날 새벽)
export const okSleepH = (h) => typeof h === 'number' && Number.isFinite(h) && h >= SLEEP_GOAL.minH && h <= SLEEP_GOAL.maxH && Math.round(h * 2) === h * 2;
export function sleepGoal(cfg) {
  const bedOk = okBedGoal(cfg?.bed), hN = cfg?.sleepH == null || cfg?.sleepH === '' ? null : Number(cfg.sleepH);
  const hOk = hN != null && Number.isFinite(hN) && hN >= SLEEP_GOAL.minH && hN <= SLEEP_GOAL.maxH;
  const bed = bedOk ? mins(cfg.bed) : SLEEP_GOAL.defBed, hours = hOk ? hN : SLEEP_GOAL.defH, notes = [];
  if (cfg?.bed != null && !bedOk) notes.push('취침 목표가 범위(18:00~05:59) 밖이라 기본 01:00 을 써요.');
  if (cfg?.sleepH != null && !hOk) notes.push('수면 목표 시간이 범위(4~12시간) 밖이라 기본 8시간을 써요.');
  return { bed, hours, wake: (bed + Math.round(hours * 60)) % 1440, bedHM: hm(bed), notes };
}
const msOf = (date, m) => { const [y, mo, d] = date.split('-').map(Number); return Date.UTC(y, mo - 1, d) + m * 60000 - 9 * 3600e3; };
const dateMinOf = (ms) => { const t = new Date(ms + 9 * 3600e3); return { date: t.toISOString().slice(0, 10), min: t.getUTCHours() * 60 + t.getUTCMinutes() }; };
// 목표 구간(밤 K 의 목표 취침~기상) 절대 시각. 취침 목표가 18시 이후면 전날 밤
export function goalSpan(K, goal) { const bedDate = goal.bed >= 720 ? addDays(K, -1) : K, b = msOf(bedDate, goal.bed); return [b, b + Math.round(goal.hours * 60) * 60000]; }
// 한 밤의 기록 해석. apple: undefined=조회 못 함/아직, null=없음, {main}=있음. 결과 {key, parts:[{kind:'done'|'mark'|'plan', from, to}], src, notes[], bedMs, wakeMs, goalWake}
export function sleepNight(K, { sleep = {}, apple, goal, nowMs, appleFailed = false }) {
  const out = { key: K, parts: [], src: null, notes: [], bedMs: null, wakeMs: null, goalSpan: null };
  let bedMs = null, wakeMs = null, src = null;
  const am = apple?.main;
  if (am) {
    const b = parseKst(`${am.bed}:00+09:00`), w = parseKst(`${am.wake}:00+09:00`), ok = b != null && w != null && w > b && (w - b) / 36e5 <= 24 && String(am.wake).slice(0, 10) === K && w <= nowMs;
    if (ok) { bedMs = b; wakeMs = w; src = 'Apple 건강'; } else out.notes.push('Apple 건강 기록의 시각이 이상해 쓰지 않았어요.');
  }
  const r = sleep[K];
  if (src == null && r && typeof r === 'object') {
    if (r.src === 'app') {
      const b = parseKst(r.bedAt), bd = b != null ? dateMinOf(b) : null;
      if (b == null || r.bed !== String(r.bedAt).slice(11, 16) || b > nowMs || ![K, addDays(K, -1)].includes(bd.date)) out.notes.push('앱 취침 기록의 시각이 이상해 표시하지 않았어요.');
      else {
        bedMs = b; src = '앱 기록';
        if (r.wake || r.wakeAt) { const w = parseKst(r.wakeAt); if (appSleepHours(r, K) != null && w != null && w <= nowMs) wakeMs = w; else { out.notes.push('앱 기상 기록이 이상해 기상 없음으로 봐요.'); } }
      }
    } else if (r.bed || r.wake) {
      src = '직접 입력'; out.notes.push('직접 입력 · 날짜는 시각으로 추정했어요.');
      if (r.wake && r.bed) {
        if (!okHM(r.bed) || !okHM(r.wake) || r.bed === r.wake) { src = null; out.notes = ['시각이 모호해 표시하지 않음 (직접 입력 기록).']; }
        else {
          const wb = mins(r.wake), bb = mins(r.bed), w = msOf(K, wb), b = msOf(bb > wb ? addDays(K, -1) : K, bb), h = (w - b) / 36e5;
          if (h < 3 || h > 14 || w > nowMs) { src = null; out.notes = ['시각이 모호해 표시하지 않음 (직접 입력 기록 — 간격이 3~14시간 밖이거나 아직 오지 않은 시각).']; } else { bedMs = b; wakeMs = w; }
        }
      } else if (r.bed && !r.wake) {
        const bb = okHM(r.bed) ? mins(r.bed) : null;
        if (bb == null || (bb >= 360 && bb < 1080)) { src = null; out.notes = ['시각이 모호해 표시하지 않음 (취침만 있는 직접 입력 기록).']; }
        else { const b = msOf(bb >= 720 ? addDays(K, -1) : K, bb); if (b > nowMs) { src = null; out.notes = []; } else bedMs = b; }
      } else { src = null; out.notes = ['기상만 있는 직접 입력 기록이라 표시하지 않아요.']; }
    }
  }
  if (src == null && !r && appleFailed) out.notes.push('Apple 건강을 확인하지 못했어요.');
  if (src && appleFailed && src !== 'Apple 건강') out.notes.push('Apple 건강 조회 실패 · 저장된 기록을 썼어요.');
  out.src = src; out.bedMs = bedMs; out.wakeMs = wakeMs;
  const gs = goal ? goalSpan(K, goal) : null; out.goalSpan = gs;
  if (bedMs != null && wakeMs != null) { out.parts.push({ kind: 'done', from: bedMs, to: wakeMs }); return out; }
  if (bedMs != null) {
    out.parts.push({ kind: 'mark', from: bedMs, to: bedMs + 60000 });
    if (gs && gs[1] > nowMs && gs[1] > bedMs + 60000) out.parts.push({ kind: 'plan', from: Math.max(nowMs, bedMs + 60000), to: gs[1] });
    return out;
  }
  if (src == null && gs && gs[1] > nowMs) out.parts.push({ kind: 'plan', from: Math.max(gs[0], nowMs), to: gs[1] });
  return out;
}
// 절대 구간 → KST 날짜별 조각. [from,to) 이고 날짜 경계에서 자름(길이 0 조각은 만들지 않음)
export function splitByDate(from, to) {
  const out = []; let cur = from;
  while (cur < to) {
    const { date, min } = dateMinOf(cur), dayEnd = msOf(addDays(date, 1), 0), end = Math.min(to, dayEnd);
    out.push({ date, s: min, e: end === dayEnd ? 1440 : dateMinOf(end).min, contPrev: cur !== from, contNext: end < to || false });
    cur = end;
  }
  return out.filter((x) => x.e > x.s);
}
export const hmAbs = (ms) => { const { min } = dateMinOf(ms); return hm(min); };
// 그 날짜에 보일 수면 블록(조각). 그 날 아침의 밤(K=date)과 그 날 저녁에 자러 가는 밤(K=date+1)
export function sleepBlocksOn(date, { sleep, appleFor, appleFail, cfg, nowMs }) {
  const goal = sleepGoal(cfg), out = [];
  for (const K of [date, addDays(date, 1)]) {
    const night = sleepNight(K, { sleep, apple: appleFor ? appleFor(K) : undefined, goal, nowMs, appleFailed: !!appleFail?.(K) });
    for (const p of night.parts) for (const seg of splitByDate(p.from, p.to)) {
      if (seg.date !== date) continue;
      const bedS = night.bedMs != null ? hmAbs(night.bedMs) : null, wakeS = night.wakeMs != null ? hmAbs(night.wakeMs) : null;
      const title = p.kind === 'done' ? `취침 ${bedS} – 기상 ${wakeS}` : p.kind === 'mark' ? `취침 ${bedS} · 기상 기록 없음` : `목표 ${hmAbs(night.goalSpan[0])} – ${hmAbs(night.goalSpan[1])}`;
      out.push({ k: 'sleep', s: seg.s, e: seg.e, title, date, sleep: { key: K, state: p.kind, src: night.src, bedMs: night.bedMs, wakeMs: night.wakeMs, goal: night.goalSpan, goalHours: goal.hours, goalNotes: goal.notes, notes: night.notes, contPrev: seg.contPrev, contNext: seg.contNext, from: p.from, to: p.to } });
    }
  }
  return out;
}
// 취침 목표 저장 한 번(저장 충돌 뒤 다시 적용돼도 같은 결과): 열 때 본 두 값(seen)이 그대로일 때만 바꾼다. 'applied' · 'conflict' · 'invalid'
export const goalSeen = (cfg) => canon({ bed: cfg?.bed ?? null, sleepH: cfg?.sleepH ?? null });
export function applyGoal(s, { bed, sleepH, seen }) {
  if (!okBedGoal(bed) || !(okSleepH(sleepH) || (Number.isFinite(sleepH) && sleepH >= SLEEP_GOAL.minH && sleepH <= SLEEP_GOAL.maxH && sleepH === Number(s.cfg?.sleepH)))) return 'invalid';   // 0.5 간격이 아닌 기존 값은 그 값 그대로일 때만
  if (goalSeen(s.cfg) !== seen) return 'conflict';
  s.cfg = s.cfg || {}; s.cfg.bed = bed; s.cfg.sleepH = sleepH; return 'applied';
}
// ── 위치 열(대표님 10/12 「이동 일정이 등록되면 오른쪽 위치 영역에 서울 → 안산으로 뜨게 하고, 같은 지역 일정은 묶어서 안산 하나로」) ──
// 위치 기록(v60.place)이 실제 위치라 우선이고, 이동 일정(출발지·도착지 글자)에서 계산한 막대는 보조다: 이동 막대(출발 → 도착) + 도착한 뒤 다음 이동 전까지 그 도착지 묶음 막대.
// 첫 이동 앞 구간은 직전 이동의 도착지(prevTo)가 있을 때만 채운다(없으면 비움 — 지어내지 않음). 같은 지역인지는 입력한 글자가 같을 때만 본다(별칭 표 없음).
// moves: [{s,e(분),from,to,tentative}] · recs: [{t:'HH:MM',p}] · 결과 rec(기록 막대) · derived(계산 막대, 기록과 겹치는 시간은 뺀다)
export function placeSegments({ moves = [], recs = [], prevTo = '', prevTentative = false, nowM = null, isToday = false, dayEnd = 1440 }) {
  const cap = isToday && nowM != null ? nowM : dayEnd;   // 오늘의 기록은 지금까지만(지금 이후 시각의 기록·구간은 없는 것으로)
  const rs = recs.filter((r) => mins(r.t) <= cap).sort((a, b) => a.t.localeCompare(b.t)), rec = rs.map((r, i) => { const st = mins(r.t); return { s: st, e: Math.min(cap, i + 1 < rs.length ? mins(rs[i + 1].t) : cap), p: r.p, r }; }).filter((x) => x.e >= x.s);   // 지금 막 남긴 기록은 길이 0 이어도 남긴다(화면이 최소 높이로 그림)
  const ms = moves.filter((m) => m.e > m.s).slice().sort((a, b) => a.s - b.s || a.e - b.e), raw = [];
  const txt = (v) => String(v || '').trim();
  if (ms.length) {
    const f0 = txt(ms[0].from);
    if (txt(prevTo) && ms[0].s > 0 && (!f0 || f0 === txt(prevTo))) raw.push({ s: 0, e: ms[0].s, kind: 'group', label: txt(prevTo), tentative: !!prevTentative, inferred: true });   // 직전 도착지와 첫 이동의 출발지 글자가 다르면 앞 구간을 단정하지 않고 비운다
    ms.forEach((m, i) => {
      const from = txt(m.from), to = txt(m.to), next = ms[i + 1], endAt = next ? next.s : dayEnd;
      if (from || to) raw.push({ s: m.s, e: m.e, kind: 'move', from, to, label: from && to ? from + ' → ' + to : from ? from + ' →' : '→ ' + to, tentative: !!m.tentative });
      const nf = next ? txt(next.from) : '';
      if (to && endAt > m.e && (!next || !nf || nf === to)) raw.push({ s: m.e, e: endAt, kind: 'group', label: to, tentative: !!m.tentative });   // 다음 이동의 출발지 글자가 도착지와 다르면 그 사이는 비운다
    });
  }
  const merged = [];   // 이어지는 같은 글자 묶음은 하나로
  for (const x of raw.sort((a, b) => a.s - b.s)) { const l = merged[merged.length - 1]; if (l && l.kind === 'group' && x.kind === 'group' && l.label === x.label && l.e === x.s && l.tentative === x.tentative) l.e = x.e; else merged.push({ ...x }); }
  const derived = [];
  for (const x of merged) {   // 기록과 겹치는 시간을 뺀다(기록이 우선)
    let pieces = [[x.s, x.e]];
    for (const r of rec) pieces = pieces.flatMap(([a, b]) => r.e <= a || r.s >= b ? [[a, b]] : [[a, Math.max(a, r.s)], [Math.min(b, r.e), b]].filter(([p, q]) => q - p > 0));
    for (const [a, b] of pieces) if (b - a >= 5) derived.push({ ...x, s: a, e: b });
  }
  return { rec, derived };
}
// ── 종일 일정(대표님 10/12 「종일일정 추가 가능하도록」) ──
// 앱 계획 레코드: {allDay:true, date(시작일), endDate?(마지막 날, 시작일 이후), bk:'고정'|'과제', state, note(이름), memo?, s:'00:00', e:'23:59'}. 시간 격자에는 올리지 않고 위쪽 「종일」 줄에만 보인다.
// 구글 캘린더 종일 이벤트(/api/cal 의 allDay:true)는 날짜마다 같은 이벤트가 들어 있고 startISO·endISO 는 UTC 날짜(T00:00:00Z)이며 endISO 는 마지막 날의 다음 날(배타) —
// 날짜 부분을 문자열 그대로 읽는다(Date 변환·+09:00 로 하루 어긋나지 않게).
export const ALLDAY_BK = ['고정', '과제'];
export const ALLDAY_MAX_DAYS = 31;
const isoDay = (v) => { const m = /^(\d{4}-\d{2}-\d{2})T00:00:00(?:\.0+)?(?:Z|[+-]\d{2}:\d{2})$/.exec(String(v || '')); return m ? m[1] : null; };
export function calAllDaySpan(ev, dayKey) {
  const a = isoDay(ev?.startISO), b = isoDay(ev?.endISO);
  if (!a) return { from: dayKey, to: dayKey };
  let to = b && b > a ? addDays(b, -1) : a;
  if (dayKey < a || dayKey > to) return { from: dayKey, to: dayKey };   // 날짜 칸과 안 맞는 이상한 값은 그 날 하루만
  return { from: a, to };
}
export const planAllDaySpan = (p) => ({ from: p.date, to: p.endDate && p.endDate > p.date ? p.endDate : p.date });
export const allDayDays = (from, to) => Math.round((Date.parse(to + 'T00:00:00Z') - Date.parse(from + 'T00:00:00Z')) / 864e5) + 1;
// 보이는 날짜(dates, 이어진 날짜 배열)에 걸치는 종일 항목 + 칸·줄 배치. calDay(date) → 그 날 이벤트 배열(모르면 undefined)
export function allDayItems({ dates, plans = [], calDay = () => undefined, nowMs = Date.now() }) {
  if (!dates.length) return [];
  const first = dates[0], last = dates[dates.length - 1], out = [], seen = new Set();
  for (const p of plans) {
    if (!p?.allDay || !/^\d{4}-\d{2}-\d{2}$/.test(p.date || '')) continue;
    const sp = planAllDaySpan(p); if (sp.to < first || sp.from > last) continue;
    out.push({ key: 'p:' + p.id, kind: 'plan', plan: p, ...sp, title: p.note || '종일 일정', tentative: planState(p) === 'tentative', lapsed: planLapsed(p, nowMs), cat: planBk(p) });   // 종류(고정·과제). 계획 여부는 tentative 로 따로 표시
  }
  for (const d of dates) for (const ev of calDay(d) || []) {
    if (!ev?.allDay) continue; const key = 'c:' + (ev.id || ev.title) + '|' + (ev.cal || ''); if (seen.has(key)) continue; seen.add(key);
    const sp = calAllDaySpan(ev, d), secret = /^\s*운선/.test(ev.title || '');
    out.push({ key, kind: 'cal', ev, ...sp, title: secret ? '개인 일정' : (ev.title || '종일 일정'), tentative: false, lapsed: false, cat: '캘린더' });
  }
  out.sort((x, y) => x.from.localeCompare(y.from) || (y.to > x.to ? 1 : y.to < x.to ? -1 : 0) || (x.kind === y.kind ? 0 : x.kind === 'plan' ? -1 : 1) || String(x.title).localeCompare(String(y.title), 'ko'));
  const lanes = [];   // 줄(lane)마다 마지막으로 차지한 칸
  for (const it of out) {
    it.c0 = Math.max(0, dates.indexOf(it.from < first ? first : it.from)); it.c1 = Math.min(dates.length - 1, dates.indexOf(it.to > last ? last : it.to));
    it.contL = it.from < first; it.contR = it.to > last;
    let i = lanes.findIndex((end) => end < it.c0); if (i < 0) { lanes.push(-1); i = lanes.length - 1; }
    lanes[i] = it.c1; it.lane = i;
  }
  return out;
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
.pl-blk.c-move{background:#e8e4f4;border:1px solid #5a4a8a;border-top:3px double #5a4a8a;border-bottom:3px double #5a4a8a;box-shadow:none;border-radius:3px;color:#2a1f4a;padding-top:0;padding-bottom:0}
.pl-blk.c-move small{color:#3b2f66}
.pl-blk.c-unknown{background:#fff;border:2px solid #b23a22;color:#14261f}
.pl-tag{display:inline-block;margin-right:4px;padding:0 4px;border-radius:4px;font:700 10px/14px "Pretendard Variable",Pretendard,system-ui,sans-serif;vertical-align:1px;white-space:nowrap}
.c-fixed .pl-tag{border:1px solid #fff;color:#fff}
.c-study .pl-tag{background:#245a43;color:#fff}.c-hw .pl-tag{background:#86400c;color:#fff}
.c-move .pl-tag{background:#5a4a8a;color:#fff}
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
.pl-sw.c-fixed{background:#2c4a6e}.pl-sw.c-study{background:#e0efe5;border:1.5px solid #2e6b52;box-shadow:inset 4px 0 0 #2e6b52}.pl-sw.c-hw{background:#fbe4cc;border:1.5px solid #9a4a10;box-shadow:inset 4px 0 0 #9a4a10}.pl-sw.c-move{background:#e8e4f4;border:1px solid #5a4a8a;border-top:3px double #5a4a8a;border-bottom:3px double #5a4a8a;border-radius:2px}.pl-sw.c-plan{background:#f4f7f5;border:2px dashed #4f6b5c}
.pl-blk.c-sleep{background:repeating-linear-gradient(0deg,#1d2340 0 6px,#2a3260 6px 7px);border:1px solid #1d2340;box-shadow:none;border-radius:5px;color:#f4f7fb}
.pl-blk.c-sleep small{color:#e3e8f7}
.c-sleep .pl-tag{background:#f4f7fb;color:#1d2340}
.pl-blk.c-sleep.sleep-plan{background:#e9ecf8;border:2px dashed #1d2340;color:#1d2340}
.pl-blk.c-sleep.sleep-plan small{color:#2b3566}
.c-sleep.sleep-plan .pl-tag{background:transparent;border:1px dashed #1d2340;color:#1d2340}
.pl-blk.c-sleep.sleep-mark{border-top:3px solid #f4f7fb;border-bottom:1px solid #1d2340;border-radius:0 0 5px 5px}
.pl-sw.c-sleep{background:repeating-linear-gradient(0deg,#1d2340 0 3px,#2a3260 3px 4px);border:1px solid #1d2340}
.pl-goal label{display:flex;flex-direction:column;gap:4px;font:600 13px "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#26352e}
.pl-goal input,.pl-goal select{height:44px;border:1px solid #9fb0c3;border-radius:10px;padding:0 10px;font:600 15px "Pretendard Variable",Pretendard,system-ui,sans-serif;background:#fff}
.pl-wkcol.has-lane{--r:26px}.pl-wkcol.has-lane .pl-blk{right:26px}
.pl-lane.narrow{right:0;width:22px;border-left:1px dashed #e3e8e4}
.pl-lane.narrow .pl-place{left:2px;right:1px;padding:2px 1px;text-align:center;font-size:10px;line-height:1.1;display:flex;flex-direction:column;align-items:center;gap:2px}
.pl-lane.narrow .pl-place span{display:flex;flex-direction:column;align-items:center;gap:2px}
.pl-vtext{font-style:normal;writing-mode:vertical-rl;max-height:100%;overflow:hidden;white-space:nowrap;font-size:10.5px}
.pl-pin{display:inline-flex;vertical-align:-1px}.pl-place.derived .pl-pin{margin-right:2px}
.pl-place.derived{cursor:default;font-weight:600}
.pl-place.derived.mv{background:#e8e4f4;border:1px solid #5a4a8a;border-top:2px double #5a4a8a;border-bottom:2px double #5a4a8a;color:#2a1f4a;border-radius:4px}
.pl-place.derived.grp{background:#eef2f7;border:1px solid #c9d3de;color:#2f4254}
.pl-place.derived.plan{border-style:dashed}
.pl-place.derived.inferred{opacity:.9}
.pl-place.derived b{margin:0 2px}
.pl-blk.c-prep{background:#d9f0f0;border:1px solid #155456;border-left:4px double #155456;border-right:4px double #155456;border-radius:3px;box-shadow:none;color:#0d2b2c}
.pl-blk.c-prep small{color:#1d4a4b}
.c-prep .pl-tag{background:#155456;color:#fff}
.pl-blk.c-meal{background:#fdeccf;border:1.5px solid #8a5412;border-radius:14px;box-shadow:inset 0 -4px 0 #e6b566;color:#3d2504}
.pl-blk.c-meal small{color:#58360a}
.c-meal .pl-tag{background:#744510;color:#fff}
.pl-sw.c-prep{background:#d9f0f0;border:1px solid #155456;border-left:3px double #155456;border-right:3px double #155456;border-radius:2px}
.pl-sw.c-meal{background:#fdeccf;border:1.5px solid #8a5412;border-radius:7px;box-shadow:inset 0 -3px 0 #e6b566}
.pl-wkstick{position:sticky;top:0;z-index:4;background:#fff}.pl-wkstick .pl-wkhead{position:static}
.pl-adrow{display:flex;gap:8px;align-items:flex-start;margin:0 0 8px}
.pl-adlabel{flex:none;min-width:44px;padding-top:12px;font:700 12px/1.2 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#3a4a3f}
.pl-adlist{flex:1;display:flex;flex-direction:column;gap:4px;min-width:0}
.pl-adgrid{display:grid;gap:3px 2px;padding:3px 0 4px;border-bottom:1px solid #edf1ee;background:#fff}
.pl-adgrid .pl-adlabel{grid-column:1;grid-row:1;padding:12px 0 0 2px;min-width:0}
.pl-ad{display:flex;align-items:center;gap:6px;min-height:44px;padding:2px 10px;border-radius:10px;border:1px solid transparent;font:600 13px/1.25 "Pretendard Variable",Pretendard,system-ui,sans-serif;text-align:left;cursor:pointer;min-width:0;overflow:hidden}
.pl-ad .pl-adt{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
.pl-ad small{flex:none;font:500 11px "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-ad.c-fixed{background:#2c4a6e;border-color:#2c4a6e;color:#fff}.pl-ad.c-fixed small{color:#fff}
.pl-ad.c-hw{background:#fbe4cc;border:1.5px solid #9a4a10;color:#3a1f0c}.pl-ad.c-hw small{color:#46290f}
.pl-ad.c-study{background:#e0efe5;border:1.5px solid #2e6b52;color:#14261f}.pl-ad.c-study small{color:#2f4036}
.pl-ad.c-plan{background:#f4f7f5;border:2px dashed #4f6b5c;color:#26352e}.pl-ad.c-plan small{color:#2f4036}
.pl-ad.cal{background:#48525e;border-color:#48525e;color:#fff;cursor:pointer}.pl-ad.cal small{color:#fff}
.pl-ad.cal .pl-tag,.pl-ad.c-fixed .pl-tag{border:1px solid #fff;color:#fff;background:transparent}
.pl-ad.past{opacity:.8}
.pl-ad.contL{border-top-left-radius:2px;border-bottom-left-radius:2px}.pl-ad.contR{border-top-right-radius:2px;border-bottom-right-radius:2px}
.pl-admore{min-height:44px;border:1px dashed #9fb0a6;border-radius:10px;background:#fff;color:#2f4036;font:600 12.5px "Pretendard Variable",Pretendard,system-ui,sans-serif;cursor:pointer;padding:0 10px}
.pl-adbox{display:flex;flex-direction:column;gap:8px}.pl-adbox label{display:flex;flex-direction:column;gap:4px;font:600 13px "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#26352e}
.pl-flow{flex-basis:100%;order:5;color:#3a4a3f;font:500 12px/1.4 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-legend .pl-ib{order:4}
.pl-blk.c-plan.lapsed{border-color:#a1661a}
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
.pl-sleep{display:flex;flex-direction:column;gap:6px;padding:10px 14px;border:1px solid #cfd8e3;border-radius:14px;background:#f4f7fb;color:#1c2a3a;font:500 13.5px/1.4 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-sleep-row{display:flex;align-items:center;flex-wrap:wrap;gap:8px 10px}
.pl-sleep-row.summary{flex-direction:column;align-items:flex-start;gap:2px}
.pl-sleep-t{color:#1c2a3a}.pl-sleep-s{color:#3a4a5d;font:500 12px/1.4 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-sleep .pl-sleepbtn{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 16px;border-radius:12px;border:1px solid #22344a;background:#22344a;color:#fff;font:700 14px "Pretendard Variable",Pretendard,system-ui,sans-serif;cursor:pointer}   /* .workspace button 보다 우선 */
.pl-sleep .pl-sleepbtn.ghost{background:#fff;color:#22344a}
.pl-sleepbtn:focus-visible,.pl-night button:focus-visible{outline:3px solid #f2c94c;outline-offset:2px}
.pl-sleep-edit{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.pl-sleep-edit input{height:44px;border:1px solid #9fb0c3;border-radius:10px;padding:0 10px;font:600 15px "Pretendard Variable",Pretendard,system-ui,sans-serif;background:#fff}
.pl-night{position:fixed;inset:0;z-index:100;background:#0f1a22;color:#e6edf3;display:grid;place-items:center;padding:24px;font-family:"Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-night-box{max-width:420px;text-align:center;display:flex;flex-direction:column;gap:12px}.pl-night h2{margin:0;font:700 34px/1.2 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-night-big{margin:0;font:700 22px/1.3 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#e6edf3;font-variant-numeric:tabular-nums}.pl-night-sub{margin:0;color:#b4c0cc;font:500 14.5px/1.55 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.pl-night-act{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:8px}.pl-night button{min-height:44px;padding:0 18px;border-radius:12px;border:1px solid #6b8197;background:#1d3040;color:#fff;font:700 14px "Pretendard Variable",Pretendard,system-ui,sans-serif;cursor:pointer}.pl-night button.ghost{background:transparent}
.pl-mv{display:flex;flex-direction:column;gap:6px}.pl-mvest{display:flex;align-items:center;gap:6px;min-height:44px;font:500 13px/1.3 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#2f4036}.pl-pop .pl-mvest input{width:22px!important;height:22px!important;padding:0!important;flex:none}.pl-pop .pl-mvplaces button{min-height:38px}
.pl-pop .pl-attmsg.bad{color:#b3261e;font-weight:600}.pl-pick button[aria-busy=true]{opacity:.6}
.pl-more{margin:2px 0}.pl-more>summary{cursor:pointer;min-height:44px;display:flex;align-items:center;color:#4b6358;font:600 12.5px "Pretendard Variable",Pretendard,system-ui,sans-serif}.pl-more>.pl-moreb{display:flex;flex-direction:column;gap:6px;padding:2px 0 6px}
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
  // Apple 건강 수면(읽기 전용 /api/health/sleep): 기상일별로 기억. apple.get(K) = 기록 객체 · null(조회했고 없음), 없으면 아직/실패. 실패한 날은 30초 뒤 다시
  const apple = new Map(), appleFailAt = new Map(), appleAt = new Map(); let lastSleepSig = '';
  const APPLE_TTL = 120000;   // 어제·오늘 기상일은 워치 동기화로 나중에 채워질 수 있어 2분 뒤 다시 받는다(지난 날은 한 번이면 충분)
  const appleFor = (K) => apple.has(K) ? apple.get(K) : undefined;
  const appleFail = (K) => appleFailAt.has(K) && !(apple.has(K) && (appleAt.get(K) || 0) > appleFailAt.get(K));
  const appleMissing = (a, b) => { const out = []; for (let d = a; d <= b; d = addDays(d, 1)) { const stale = apple.has(d) && d >= addDays(ctx.today, -1) && Date.now() - (appleAt.get(d) || 0) > APPLE_TTL; if ((!apple.has(d) || stale) && !(Date.now() - (appleFailAt.get(d) || 0) < 30000)) out.push(d); } return out; };
  async function ensureApple(from, to) {   // 기상일 from~to(오늘까지만). 서버는 한 번에 62일까지라 60일 창으로 나눠 받는다
    const need = appleMissing(from, to > ctx.today ? ctx.today : to); let i = 0;
    while (i < need.length) {
      const a = need[i], lim = addDays(a, 59); let j = i; while (j < need.length && need[j] <= lim) j++;
      const win = need.slice(i, j), b = win[win.length - 1]; i = j;
      try {
        const r = await fetch(`/api/health/sleep?from=${a}&to=${b}`, { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(6000) }); const jj = await r.json();
        if (!r.ok || !jj || typeof jj.sleep !== 'object' || jj.sleep === null || (jj.tz && jj.tz !== 'Asia/Seoul')) throw new Error('sleep');
        for (const d of win) { apple.set(d, jj.sleep[d] || null); appleAt.set(d, Date.now()); appleFailAt.delete(d); }
      } catch { const at = Date.now(); for (const d of win) appleFailAt.set(d, at); }   // 실패 = 모름(없음 아님)
    }
  }
  const sleepOn = (date) => sleepBlocksOn(date, { sleep: v60?.sleep || {}, appleFor, appleFail, cfg: v60?.cfg, nowMs: Date.now() });

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
    for (const p of (ctx.plans || []).filter((p) => !p.allDay && p.date === date && (!p.activity || p.bk === '고정' || NONSTUDY_BK.includes(p.bk)))) out.push({ s: mins(p.s), e: mins(p.e), title: SIMPLE_BK.includes(p.bk) ? (p.note || p.bk) : p.bk === '이동' ? (p.note || moveName(p.from, p.to) || '이동') + (p.est ? ' (추정)' : '') : p.bk === '고정' ? (p.note || '고정 일정') : (ctx.courseName?.(p.courseId) || '') + (p.note ? ' · ' + p.note : ''), k: 'plan', plan: p, lapsed: planLapsed(p, Date.now()) });   // 고정 일정(약속 등)은 activity 표식이 있어도 시간표엔 그린다
    for (const b of out) b.date = date;
    return [...dedupeBlocks(out.filter((b) => b.e > b.s)), ...sleepOn(date)].sort((a, b) => a.s - b.s);   // 수면 블록(기록=확정·목표=계획)은 채우기·다시 짜기도 피하도록 같은 목록에 둔다
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
      let used = fixed.filter((b) => b.k === 'plan' && b.plan?.bk !== '고정' && !NONSTUDY_BK.includes(b.plan?.bk)).reduce((n, b) => n + (b.e - b.s), 0);   // 하루 공부 상한: 고정 약속은 공부 시간이 아니라 안 센다(빈 시간 계산에는 그대로 쓴다)
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
  let innerKey = '', innerTop = 0, innerReset = false;   // 시간표 격자 안 세로 스크롤: 다시 그려도(저장·출석 등) 보던 자리를 유지한다. 보기·날짜가 바뀌거나 「오늘」을 누르면 처음 규칙(지금 시각)으로
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
  const PIN = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON.pin + '</svg>';
  // 이동 일정에서 위치 열 조각 계산: 그날 이동(확정·계획, 지난 계획은 확정으로 침) + 직전 이동(최근 7일)의 도착지
  function placeInfo(date, nowM) {
    const isMv = (p) => p.bk === '이동' && (p.from || p.to), all = (ctx.plans || []).filter(isMv);
    const moves = all.filter((p) => p.date === date).map((p) => ({ s: mins(p.s), e: mins(p.e), from: p.from, to: p.to, tentative: planState(p) === 'tentative' }));   // 확정 전(지난 계획 포함)은 점선 — 실제로 갔는지 모르는 것을 실선으로 단정하지 않는다
    const prev = all.filter((p) => p.date < date && p.date >= addDays(date, -7) && p.to).sort((a, b) => (a.date + a.e).localeCompare(b.date + b.e)).pop();
    return placeSegments({ moves, recs: v60.place?.[date] || [], prevTo: prev?.to || '', prevTentative: !!prev && planState(prev) === 'tentative', nowM, isToday: date === ctx.today });
  }
  function placeLane(date, PX, nowM, narrow) {
    const lane = el('div', undefined, 'pl-lane' + (narrow ? ' narrow' : '')); lane.setAttribute('aria-label', '있던 곳');
    const info = placeInfo(date, nowM);
    for (const d of info.derived) {   // 이동 일정에서 계산한 막대(고칠 수 없음 — 이동 일정 블록에서 고친다)
      const seg = el('div', undefined, 'pl-place derived ' + (d.kind === 'move' ? 'mv' : 'grp') + (d.tentative ? ' plan' : '') + (d.inferred ? ' inferred' : '')); seg.style.top = d.s * PX + 'px'; seg.style.height = Math.max(16, (d.e - d.s) * PX - 2) + 'px';
      const small = narrow || (d.e - d.s) * PX < 30, line = el('span');
      const pin = () => { const i = el('i', undefined, 'pl-pin'); i.innerHTML = PIN; return i; };
      if (d.kind === 'move') { line.append(pin()); if (!small) { line.append(document.createTextNode(d.from || ''), el('b', '→'), pin(), document.createTextNode(d.to || '')); } } else { line.append(pin()); if (!small) line.append(document.createTextNode(d.label)); }
      if (small && narrow && (d.e - d.s) * PX >= 60) { const v = el('em', d.kind === 'move' ? d.label : d.label, 'pl-vtext'); line.append(v); }
      seg.append(line);
      const why = d.kind === 'move' ? '이동 일정' : d.inferred ? '직전 이동의 도착지' : '이동 일정의 도착지';
      seg.title = `${hm(d.s)}–${hme(d.e)} ${d.label} — ${why}${d.tentative ? '(미확정)' : ''}에서 예상한 위치예요. 실제 위치는 「지금 위치」 기록이 우선이에요.`; seg.setAttribute('role', 'img'); seg.setAttribute('aria-label', seg.title); lane.append(seg);
    }
    const recs = info.rec;
    recs.forEach(({ s, e, r }) => {
      const seg = el('div', undefined, 'pl-place' + (r.p === '이동 중' ? ' move' : '')); seg.style.top = s * PX + 'px'; seg.style.height = Math.max(16, (e - s) * PX - 2) + 'px';
      seg.append(el('span', narrow ? '' : r.p)); if (narrow) { const i = el('i', undefined, 'pl-pin'); i.innerHTML = PIN; seg.firstChild.append(i); if ((e - s) * PX >= 60) seg.firstChild.append(el('em', r.p, 'pl-vtext')); } seg.title = `${r.t}부터 ${r.p} — 누르면 이 기록 지우기`; seg.tabIndex = 0; seg.setAttribute('role', 'button'); seg.setAttribute('aria-label', `${r.t} ${r.p} 기록 지우기`);
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
  async function removePlan(p, noAsk) {
    if (!noAsk && planState(p) === 'confirmed' && (planEndMs(p) ?? Infinity) <= Date.now() && !confirm('이미 지난 확정 일정은 기록이에요. 정말 지울까요?\n지운 뒤 10초 동안은 되돌릴 수 있어요.')) return false;
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
    const gl = sleepGoal(v60.cfg), goalBtn = el('button', `취침 목표 · ${gl.bedHM} 취침, 수면 ${gl.hours}시간`); goalBtn.type = 'button'; goalBtn.onclick = () => { close(); goalPopup(anchor); };
    pop.append(erase, unhide, goalBtn, el('small', '확정한 계획·직접 넣은 계획·예전 계획은 지우지 않아요. 개별 계획은 블록을 눌러 삭제.', 'pl-popnote'), no);
    document.body.append(pop);
    const r = anchor.getBoundingClientRect(); placePop(pop, (ev?.clientX || r.left) - 240, (ev?.clientY || r.bottom) + 16);
    erase.focus();
  }
  // 일정 넣기·고치기 창. 새로 넣을 때는 「계획 | 확정」 스위치 하나(대표님 10/12 「플랜모드 켜고 일정 추가하면 계획블럭으로, 끄고 추가하면 확정일정으로」):
  // 스위치 처음 값 = 계획 모드(켜짐 → 계획, 꺼짐 → 확정 — 추천에서 넣을 때도 같다), 스위치를 바꾸면 계획 모드도 같이 바뀐다. 계획은 점선 블록(미확정), 확정은 종류(고정·공부·과제)를 골라 그 모양으로.
  // 이미 있는 계획(미확정)은 [확정] 버튼으로 확정 일정이 된다 — 확정하면 채우기·다시 짜기가 건드리지 않는다.
  function planPopup(card, date, startMin, anchor, at, pickDate, existing, preset) {
    const tentativeNow = existing && planState(existing) === 'tentative', lapsed = !!existing && planLapsed(existing, Date.now());
    const { pop, close } = mkPop('form', '', existing ? '일정 고치기' : `${date} 일정 넣기`, anchor);
    let isTent = existing ? !!tentativeNow : planMode;   // 이 창에서 넣는 방식(새 일정만 바꿀 수 있음). 추천에서 넣을 때도 모드를 따른다(꺼짐 = 확정, 켜짐 = 계획)
    let bk = existing ? planBk(existing) : '공부', forcedConfirm = false;   // forcedConfirm = 지난 시각이라 계획에서 확정으로 바뀐 것(시각을 다시 미래로 고치면 계획으로 되돌린다)
    let allDay = !!existing?.allDay, adBk = existing?.allDay ? planBk(existing) : '고정';   // 종일: 시간 칸 대신 날짜(+종료일)만. 종류는 고정·과제
    const titleEl = el('b'); pop.append(titleEl);
    const snap = existing ? canon(existing) : '';   // 열 때의 모습(고치는 사이 다른 곳에서 바뀌었는지 확인용)
    const catLine = el('div', undefined, 'pl-tagline'), catTag = el('span', '', 'pl-tag'), catTxt = el('small', '', 'pl-popnote'); catLine.append(catTag, catTxt);
    const dIn = el('input'); dIn.type = 'date'; dIn.value = date; dIn.setAttribute('aria-label', '날짜'); if (pickDate) pop.append(dIn);
    // 넣는 방식 스위치(새 일정만)
    const swRow = el('div', undefined, 'pl-prow'), swPick = el('div', undefined, 'pl-pick'), swBtns = [];
    swPick.setAttribute('role', 'group'); swPick.setAttribute('aria-label', '넣는 방식');
    for (const k of ['계획', '확정']) { const b = el('button', k); b.type = 'button'; b.dataset.mode = k; b.onclick = () => { if (b.disabled) return; forcedConfirm = false; const was = isTent; isTent = k === '계획'; planMode = isTent; if (was !== isTent) { if (isTent) tentBk = NONSTUDY_BK.includes(bk) ? bk : ''; else if (tentBk) bk = tentBk; } syncModeBtn(); paint(); }; swBtns.push(b); swPick.append(b); }
    swRow.append(el('span', '방식'), swPick); if (!existing) pop.append(swRow);
    // 종일 스위치 + 종일 종류(고정·과제) + 종료일(선택) + 메모(선택)
    const adRow = el('div', undefined, 'pl-prow'), adBtn = el('button', '종일'); adBtn.type = 'button'; adBtn.setAttribute('aria-pressed', 'false'); adBtn.dataset.allday = '1';
    adRow.append(el('span', '하루 종일'), adBtn); pop.append(adRow);
    const adBox = el('div', undefined, 'pl-adbox'), adPick = el('div', undefined, 'pl-pick'), adBtns = [];
    adPick.setAttribute('role', 'group'); adPick.setAttribute('aria-label', '종일 종류');
    for (const k of ALLDAY_BK) { const b = el('button', k); b.type = 'button'; b.dataset.adbk = k; b.onclick = () => { adBk = k; paint(); }; adBtns.push(b); adPick.append(b); }
    const endIn = el('input'); endIn.type = 'date'; endIn.value = existing?.endDate || ''; endIn.setAttribute('aria-label', '종료일(선택)');
    const endLab = el('label', '종료일(선택) — 며칠짜리면 마지막 날'); endLab.append(endIn);
    const memoIn = el('input'); memoIn.maxLength = 300; memoIn.value = existing?.memo || ''; memoIn.placeholder = '메모(선택)'; memoIn.setAttribute('aria-label', '메모(선택)');
    adBox.append(adPick, endLab, memoIn);
    const adErr = el('small', '', 'pl-popnote'); adErr.setAttribute('role', 'status'); adErr.setAttribute('aria-live', 'polite');
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
    for (const k of ['고정', '공부', '과제', '이동', '준비', '밥']) { const b = el('button', k); b.type = 'button'; b.dataset.bk = k; b.onclick = () => { bk = k; paint(); }; bkBtns.push(b); bkPick.append(b); }
    // 새로 넣는 계획(미확정)은 종류를 확정할 때 고른다 — 다만 이동은 과목 없이 저장돼야 해서 처음부터 고른다: [공부·과제 | 이동]
    const tkPick = el('div', undefined, 'pl-pick'), tkBtns = [];
    tkPick.setAttribute('role', 'group'); tkPick.setAttribute('aria-label', '계획 종류');
    for (const [v, t] of [['', '공부·과제'], ['이동', '이동'], ['준비', '준비'], ['밥', '밥']]) { const b = el('button', t); b.type = 'button'; b.dataset.tk = v; b.dataset.mv = v === '이동' ? 'true' : v === '' ? 'false' : v; b.onclick = () => { tentBk = v; bk = v || (NONSTUDY_BK.includes(bk) ? '공부' : bk); paint(); }; tkBtns.push(b); tkPick.append(b); }
    bkRow.append(bkLabel, bkPick, tkPick); pop.append(bkRow);
    // 이동 입력: 출발지 → 도착지(선택) · 길이(분) · 추정
    const mvTop = el('div', undefined, 'pl-mv'), fromIn = el('input'), toIn = el('input');
    for (const [i, t] of [[fromIn, '출발지'], [toIn, '도착지(선택)']]) { i.maxLength = 40; i.placeholder = t; i.setAttribute('aria-label', t); }
    const chips = el('div', undefined, 'pl-pick pl-mvplaces'); let chipTarget = fromIn;
    fromIn.onfocus = () => { chipTarget = fromIn; }; toIn.onfocus = () => { chipTarget = toIn; };
    for (const pl of ['집', '학교', '도서관', '카페']) { const b = el('button', pl); b.type = 'button'; b.setAttribute('aria-label', `${pl} 넣기`); b.onclick = () => { (!fromIn.value ? fromIn : !toIn.value ? toIn : chipTarget).value = pl; autoName(); }; chips.append(b); }
    mvTop.append(fromIn, toIn, chips);
    const mvLen = el('select'); mvLen.setAttribute('aria-label', '이동 시간(분)');
    for (const m of MOVE_LENS) mvLen.append(Object.assign(el('option', `${m}분`), { value: m }));
    mvLen.append(Object.assign(el('option', '직접 입력'), { value: 'x' }));
    const mvCustom = el('input'); mvCustom.type = 'number'; mvCustom.min = 1; mvCustom.max = 240; mvCustom.step = 1; mvCustom.placeholder = '분'; mvCustom.setAttribute('aria-label', '이동 시간 직접 입력(분)');
    const estLab = el('label', undefined, 'pl-mvest'), est = el('input'); est.type = 'checkbox'; estLab.append(est, document.createTextNode(' 소요 시간은 추정이에요'));
    const mvBot = el('div', undefined, 'pl-mv'); mvBot.append(mvLen, mvCustom, estLab);
    mvLen.onchange = () => paint();
    // 준비·밥: 시작 시각 + 길이(선택 + 직접 1~240분)
    const pLen = el('select'); pLen.setAttribute('aria-label', '길이(분)');
    const pCustom = el('input'); pCustom.type = 'number'; pCustom.min = 1; pCustom.max = 240; pCustom.step = 1; pCustom.placeholder = '분'; pCustom.setAttribute('aria-label', '길이 직접 입력(분)');
    let pKind = '';
    const fillLens = (k) => { pLen.replaceChildren(); for (const m of lensOf(k)) pLen.append(Object.assign(el('option', `${m}분`), { value: m })); pLen.append(Object.assign(el('option', '직접 입력'), { value: 'x' })); pLen.value = String(defaultLen(k)); pKind = k; };
    const pBox = el('div', undefined, 'pl-mv'); pBox.append(pLen, pCustom); pLen.onchange = () => paint();
    let tentBk = '', noteAuto = '', pos = null, lastKind = null;   // pos = 창을 처음 놓은 자리(종류를 바꿔 창이 커지면 화면 안으로 다시 맞춘다)
    const curBk = () => allDay ? '종일' : existing ? bk : isTent ? tentBk : bk;   // 지금 고른 종류('' = 공부·과제 계획, '종일' = 종일 일정)
    const moveNow = () => curBk() === '이동', simpleNow = () => SIMPLE_BK.includes(curBk());
    const lenNow = () => moveNow() ? Number(mvLen.value === 'x' ? mvCustom.value : mvLen.value) : simpleNow() ? Number(pLen.value === 'x' ? pCustom.value : pLen.value) : Number(len.value);
    // 이름 기본값: 이동 = 출발 → 도착, 준비 = 「준비」, 밥 = 시각에 따라 아침·점심·저녁·밥. 직접 쓴 이름은 덮어쓰지 않는다
    let userNamed = !!note.value.trim();   // 사용자가 이름 칸에 직접 글자를 쓴 뒤로는 자동 이름이 덮지 않는다(자동값과 같은 글자를 직접 써도 보존). 칸을 비우면 다시 자동
    note.addEventListener('input', () => { userNamed = !!note.value.trim(); });
    const autoName = () => { const k = curBk(), n = k === '이동' ? moveName(fromIn.value, toIn.value) : defaultName(k, mins(st.value)); if (!userNamed) { note.value = n; } noteAuto = n; };
    fromIn.oninput = autoName; toIn.oninput = autoName; st.addEventListener('input', () => { if (simpleNow()) autoName(); });
    if (existing?.bk === '이동') { fromIn.value = existing.from || ''; toIn.value = existing.to || ''; est.checked = existing.est === true; noteAuto = moveName(existing.from, existing.to); const l = mins(existing.e) - mins(existing.s); if (MOVE_LENS.includes(l)) mvLen.value = String(l); else { mvLen.value = 'x'; mvCustom.value = String(l); } } else mvLen.value = '10';
    if (SIMPLE_BK.includes(existing?.bk)) { fillLens(existing.bk); const l = mins(existing.e) - mins(existing.s); if (lensOf(existing.bk).includes(l)) pLen.value = String(l); else { pLen.value = 'x'; pCustom.value = String(l); } noteAuto = defaultName(existing.bk, mins(existing.s)); }
    if (existing && note.value === noteAuto) userNamed = false;   // 저장된 이름이 자동 이름 그대로면 계속 따라간다
    // 지난 시각: 끝 시각이 지났으면 계획으로 넣을 수 없다(서버도 같은 기준 — 이미 끝난 일은 확정=기록만)
    const endPast = () => { const d = pickDate ? dIn.value || date : date; if (allDay) return !!d && msOf(endIn.value && endIn.value >= d ? endIn.value : d, 1440) <= Date.now(); if (!d || !st.value) return false; const l = lenNow(); return msOf(d, mins(st.value) + (Number.isFinite(l) ? l : 0)) <= Date.now(); };
    const movedFromSaved = () => { if (!existing) return true; if (allDay || existing.allDay) { const d0 = pickDate ? dIn.value || date : date; return !(allDay && existing.allDay && d0 === existing.date && (endIn.value || '') === (existing.endDate || '')); } const d = pickDate ? dIn.value || date : date, l = lenNow(), sNow = mins(st.value); return d !== existing.date || hm(sNow) !== existing.s || hm(sNow + (Number.isFinite(l) ? l : 0)) !== existing.e; };   // 서버와 같은 비교: 날짜·시각이 그대로면 지난 계획의 다른 칸은 고칠 수 있다
    for (const x of [dIn, st, len, mvCustom, pCustom, endIn]) { x.addEventListener('input', () => paint()); x.addEventListener('change', () => paint()); }
    const pastNote = el('small', '', 'pl-popnote'); pastNote.setAttribute('role', 'status'); pastNote.setAttribute('aria-live', 'polite');
    const hint = el('small', '', 'pl-popnote'); hint.setAttribute('role', 'status'); hint.setAttribute('aria-live', 'polite');   // 스위치를 바꾸면 안내가 바뀐다 — 화면낭독도 읽게
    const paint = () => {
      { const k0 = curBk(); if (simpleNow() && pKind !== k0) fillLens(k0); }   // 길이 선택지를 먼저 채운다(빈 길이를 0분으로 보고 지난 시각으로 잘못 판단하지 않게)
      const past = endPast();
      if (!existing && past && isTent) { isTent = false; forcedConfirm = true; if (tentBk) bk = tentBk; }   // 지난 시각은 계획 불가 → 확정으로(스위치도 따라 바뀐다)
      else if (!existing && !past && forcedConfirm && !isTent) { isTent = true; forcedConfirm = false; tentBk = NONSTUDY_BK.includes(bk) ? bk : ''; }   // 시각을 다시 미래로 고치면 원래 고른 계획으로
      swBtns[0].disabled = !existing && past;
      // 종일 가능 여부: 새 계획은 공부·과제 계획일 때, 그 밖엔 고정·과제일 때. 공부·이동·준비·밥은 시각이 의미 있어 종일 불가(스위치 꺼짐)
      if (!existing && allDay && !isTent) bk = adBk;   // 종일이 켜진 채 확정이 되면(지난 시각으로 강제된 경우 포함) 확정 종류는 종일 종류
      const adOk = existing ? (!!existing.allDay || ALLDAY_BK.includes(bk)) : isTent ? tentBk === '' : ALLDAY_BK.includes(bk);
      if (!adOk && allDay) allDay = false;
      if (!existing) dIn.min = isTent && !allDay ? ctx.today : '';   // 시간 일정 계획은 오늘부터, 종일은 끝 날짜 기준(endPast)으로만 막는다. 확정은 지난 날짜도 기록할 수 있다
      endIn.min = (pickDate ? dIn.value || date : date) || '';
      adBtn.disabled = !adOk; adBtn.setAttribute('aria-pressed', String(allDay)); adBtn.title = adOk ? '시각 없이 하루(또는 며칠) 전체에 걸치는 일정' : '공부·이동·준비·밥·수면은 시각이 의미 있어 종일로 못 해요';
      adBox.hidden = !allDay; for (const b of adBtns) b.setAttribute('aria-pressed', String(b.dataset.adbk === adBk));
      { const d0 = pickDate ? dIn.value || date : date; adErr.textContent = allDay && endIn.value ? (endIn.value < d0 ? '종료일은 시작일과 같거나 늦어야 해요.' : allDayDays(d0, endIn.value) > ALLDAY_MAX_DAYS ? `종일 일정은 최대 ${ALLDAY_MAX_DAYS}일까지예요.` : '') : ''; }
      const isMove = moveNow(), isSimple = simpleNow(), kNow = curBk();
      if (lastKind !== kNow) { lastKind = kNow; autoName(); }
      const showBk = true, fixed = !isMove && !(isTent && !existing) && bk === '고정';
      const newTent = isTent && !existing;
      bkPick.hidden = newTent; tkPick.hidden = !newTent;
      for (const b of tkBtns) b.setAttribute('aria-pressed', String(b.dataset.tk === tentBk));
      mvTop.hidden = !isMove; mvBot.hidden = !isMove; mvCustom.hidden = !(isMove && mvLen.value === 'x'); mvCustom.required = isMove && mvLen.value === 'x'; sel.hidden = isMove || isSimple || allDay; len.hidden = isMove || isSimple || allDay; st.hidden = allDay; bkRow.hidden = allDay;
      pBox.hidden = !isSimple; pCustom.hidden = !(isSimple && pLen.value === 'x'); pCustom.required = isSimple && pLen.value === 'x'; pLen.disabled = !isSimple; pCustom.disabled = !(isSimple && pLen.value === 'x');   // 숨은 직접 길이 칸은 꺼서 범위 검증에 걸리지 않게
      st.step = isMove || isSimple ? 300 : 600;
      for (const b of swBtns) b.setAttribute('aria-pressed', String((b.dataset.mode === '계획') === isTent));
      for (const b of bkBtns) b.setAttribute('aria-pressed', String(b.dataset.bk === bk));
      bkRow.hidden = !showBk || allDay; bkLabel.textContent = newTent ? '종류' : isTent ? '확정할 종류' : '종류';
      if (fixed) { if (!none.isConnected) sel.prepend(none); if (existing && !existing.courseId) sel.value = ''; } else if (none.isConnected) { const was = sel.value; none.remove(); if (!was) sel.selectedIndex = 0; }
      note.placeholder = allDay ? '이름(예: 공모전 마감)' : isMove ? '이름(비우면 출발 → 도착)' : isSimple ? `이름(비우면 ${defaultName(kNow, mins(st.value))})` : fixed ? '이름(예: 병원 예약)' : '할 일(예: 12.3 연습문제)'; note.required = allDay ? true : isMove || isSimple ? false : (!existing || fixed);
      const cat = isTent ? '계획' : allDay ? adBk : bk;
      titleEl.textContent = existing ? (isTent ? '계획 고치기·확정' : '일정 고치기') : preset ? `추천을 ${isTent ? '계획' : '확정 ' + bk}으로 넣기` : pickDate ? `일정 추가 — ${allDay ? '종일 ' : ''}${isTent ? '계획' : '확정 ' + (allDay ? adBk : bk)}` : `${date.slice(5).replace('-', '/')}(${wd(date)}) ${allDay ? '종일 ' : ''}${isTent ? '계획' : '확정 ' + (allDay ? adBk : bk)} 넣기`;
      catTag.textContent = cat; catTag.className = 'pl-tag'; catTxt.textContent = `${CAT_NAME[cat]} — ${CAT_MEANS[cat]}`;
      hint.textContent = allDay ? (isTent ? '종일 계획이에요 — 점선으로 위쪽 종일 줄에 보여요. 시간 일정과 겹쳐도 돼요. 눌러서 확정할 수 있어요. 캘린더에는 넣지 않아요.' : '확정 종일 일정이에요 — 위쪽 종일 줄에 보여요. 시간 일정과 겹쳐도 돼요. 캘린더에는 넣지 않아요.') : isSimple ? (isTent ? `${kNow} 계획이에요 — 점선으로 보이고 눌러서 확정할 수 있어요. 채우기·다시 짜기는 이 자리를 피해서 짜요. 캘린더에는 넣지 않아요.` : `확정 ${kNow} 일정이에요 — 움직이지 않는 일정으로 보고 채우기·다시 짜기가 피해서 짜요. 캘린더에는 넣지 않아요.`) : isMove ? (isTent ? '이동 계획이에요 — 점선으로 보이고 눌러서 확정할 수 있어요. 채우기·다시 짜기는 이 자리를 피해서 짜요. 캘린더에는 넣지 않아요.' : '확정 이동 일정이에요 — 움직이지 않는 일정으로 보고 채우기·다시 짜기가 피해서 짜요. 소요를 모르면 추정을 켜요. 캘린더에는 넣지 않아요.') : isTent ? '계획이에요 — 점선으로 보이고 눌러서 확정할 수 있어요. 채우기·다시 짜기는 이 자리를 피해서 짜요. 지우려면 삭제.' : `확정 ${bk} 일정이에요 — 채우기·다시 짜기가 건드리지 않아요.`;
      for (const b of [fromIn, toIn]) b.disabled = !isMove; mvCustom.disabled = !(isMove && mvLen.value === 'x');
      if (pop.isConnected && pos) placePop(pop, pos.x, pos.y);
      if (ok) { { const lab = existing ? '저장' : isTent ? '계획으로 넣기' : '확정으로 넣기'; if (ok.textContent !== lab) ok.textContent = lab; }   /* 같은 글자면 다시 쓰지 않는다 — 시각 칸을 벗어나며(change) 다시 그릴 때 누르던 버튼의 글자 노드가 바뀌면 WebKit 에서 클릭이 사라진다 */ ok.disabled = (!!existing && isTent && past && movedFromSaved()) || !!adErr.textContent; }
      if (confirmBtn) confirmBtn.disabled = !!adErr.textContent;
      pastNote.textContent = past ? (!existing ? '이미 지난 시각이라 계획으로 넣을 수 없어요 — 지난 일정은 확정(기록)으로만 넣어요.' : isTent ? (lapsed ? '지난 계획이에요. 실제로 했는지는 기록돼 있지 않아요 — 아래에서 정해 주세요.' : '지난 시각엔 계획으로 둘 수 없어요 — 시각을 고치거나 확정해 주세요.') : '지난 확정 일정은 기록이에요. 삭제하면 한 번 더 물어봐요.') : (isTent ? '' : '미래 확정은 바뀔 수 있어요 — 시각·길이·종류를 고치거나 삭제할 수 있어요.');
    };
    const ok = el('button', existing ? '저장' : '넣기'); ok.type = 'submit'; const no = el('button', '닫기', 'ghost'); no.type = 'button'; no.onclick = close;
    pop.append(mvTop, sel, note, adBox, st, len, mvBot, pBox, adErr, pastNote);
    const act = el('div', undefined, 'pl-act');
    let confirmBtn = null;
    if (tentativeNow) { confirmBtn = el('button'); confirmBtn.type = 'button'; confirmBtn.innerHTML = svg(ICON.check); confirmBtn.append(el('span', lapsed ? '했어요' : '확정')); if (lapsed) confirmBtn.setAttribute('aria-label', '계획대로 했어요 — 확정으로 기록'); act.append(confirmBtn); ok.classList.add('ghost'); }
    if (lapsed) { const nope = el('button'); nope.type = 'button'; nope.className = 'danger'; nope.innerHTML = svg(ICON.trash); nope.append(el('span', '안 했어요')); nope.setAttribute('aria-label', '안 했어요 — 이 계획 지우기'); nope.title = '지운 뒤 10초 동안 되돌릴 수 있어요'; nope.onclick = async () => { nope.disabled = true; const r = await removePlan(existing, true); if (r === false) nope.disabled = false; else close(); }; act.append(nope); }
    act.append(ok);
    if (existing) { const del = el('button'); del.type = 'button'; del.className = 'danger'; del.innerHTML = svg(ICON.trash); del.append(el('span', '삭제')); del.setAttribute('aria-label', '이 일정 삭제'); del.title = '삭제 — 지운 뒤 10초 동안 되돌릴 수 있어요';
      del.onclick = async () => { del.disabled = true; const r = await removePlan(existing); if (r === false) del.disabled = false; else close(); }; act.append(del); }
    pop.append(act);
    if (preset?.key) { const hide = el('button', '이 추천 숨기기(오늘)', 'ghost'); hide.type = 'button'; hide.onclick = async () => { hide.disabled = true; const r = await hideRec(preset.date || date, preset.key, preset.label || ''); if (r === false) hide.disabled = false; else close(); }; pop.append(hide); }
    pop.append(no);
    { const mb = moreBox(hint, pickDate ? el('small', existing ? '구글 캘린더 일정은 캘린더에서 고쳐 주세요.' : '구글 캘린더 일정(약속 등)은 캘린더에서 넣으면 여기 시간표에 같이 보여요.', 'pl-popnote') : null); if (mb) pop.append(mb); }
    paint();
    adBtn.onclick = () => { if (adBtn.disabled) return; allDay = !allDay; if (allDay) { if (ALLDAY_BK.includes(bk)) adBk = bk; } else if (st.value === '00:00') { st.value = '09:00'; len.value = '60'; } paint(); };
    const send = async (confirming) => {
      const bkEff = allDay ? adBk : bk;
      if (allDay) {
        const d0 = pickDate ? dIn.value || date : date; if (!note.value.trim()) { app.status?.('종일 일정은 이름을 적어 주세요.', true); note.focus(); return; } if (adErr.textContent) { app.status?.(adErr.textContent, true); return; }
        ok.disabled = true; if (confirmBtn) confirmBtn.disabled = true; keepDay();
        const item = { date: d0, s: '00:00', e: '23:59', allDay: true, courseId: '', note: note.value.trim(), kind: '종일' }; if (endIn.value && endIn.value !== d0) item.endDate = endIn.value; if (memoIn.value.trim()) item.memo = memoIn.value.trim();
        let done2;
        if (existing) {
          const cur = (ctx.plans || []).find((q) => q.id === existing.id);
          if (!cur || canon(cur) !== snap) { app.status?.(cur ? '그 사이 다른 화면에서 이 일정이 바뀌었어요. 창을 닫고 다시 열어 주세요.' : '이 일정이 이미 없어졌어요.', true); ok.disabled = false; if (confirmBtn) confirmBtn.disabled = false; return; }
          const meta = { bk: bkEff }; if (planState(existing) === 'confirmed') { if (existing.state) meta.state = 'confirmed'; } else if (confirming) meta.state = 'confirmed';
          const body = { ...existing, ...item, ...meta, id: existing.id }; if (!item.endDate) delete body.endDate; if (!item.memo) delete body.memo; delete body.from; delete body.to; delete body.est;
          try { done2 = await ctx.updatePlan?.(body); } catch { done2 = false; }
        } else { try { done2 = await ctx.addPlan?.({ ...item, src: 'manual', state: isTent ? 'tentative' : 'confirmed', bk: bkEff }); } catch { done2 = false; } }
        if (done2 === false) { ok.disabled = false; if (confirmBtn) confirmBtn.disabled = false; } else close();
        return;
      }
      const isMove = moveNow(), isSimple = simpleNow(), lenMin = lenNow();
      if (isSimple && !(Number.isInteger(lenMin) && lenMin >= 1 && lenMin <= 240)) { app.status?.('길이는 1~240분 사이 숫자로 적어 주세요.', true); pCustom.focus(); return; }
      if (isMove && !(Number.isInteger(lenMin) && lenMin >= 1 && lenMin <= 240)) { app.status?.('이동 시간은 1~240분 사이 숫자로 적어 주세요.', true); mvCustom.focus(); return; }
      const s = mins(st.value), end = s + lenMin; if (end > LAST) { app.status?.('자정을 넘겨요. 시작을 앞당겨 주세요.', true); return; }
      const fixed = (existing ? (!isTent || confirming) : !isTent) && bk === '고정'; if (fixed && !note.value.trim()) { app.status?.('고정 일정은 이름을 적어 주세요.', true); note.focus(); return; }
      ok.disabled = true; if (confirmBtn) confirmBtn.disabled = true; keepDay();
      const item = { date: pickDate ? dIn.value || date : date, s: hm(s), e: hm(end), courseId: isMove || isSimple ? '' : ctx.courseId?.(sel.value) || '', note: isMove ? (note.value.trim() || moveName(fromIn.value, toIn.value) || '이동') : isSimple ? (note.value.trim() || defaultName(curBk(), s)) : note.value.trim(), kind: isMove ? '이동' : isSimple ? curBk() : (existing?.kind && !NONSTUDY_BK.includes(existing.kind) ? existing.kind : (fixed ? '고정 일정' : '시험 대비')) };
      if (isMove) Object.assign(item, { from: fromIn.value.trim(), to: toIn.value.trim(), est: est.checked });   // 고정 일정은 공부 계획 종류(시험 대비)로 세지 않게 따로 이름 붙임
      let done;
      if (existing) {
        // 창을 연 뒤 다른 곳에서 이 일정이 바뀌었으면(최신 목록과 열 때 모습이 다르면) 덮어쓰지 않고 멈춘다
        const cur = (ctx.plans || []).find((q) => q.id === existing.id);
        if (!cur || canon(cur) !== snap) { app.status?.(cur ? '그 사이 다른 화면에서 이 일정이 바뀌었어요. 창을 닫고 다시 열어 주세요.' : '이 일정이 이미 없어졌어요.', true); ok.disabled = false; if (confirmBtn) confirmBtn.disabled = false; return; }
        const meta = {}; if (planState(existing) === 'confirmed') { meta.bk = bk; if (existing.state) meta.state = 'confirmed'; } else if (confirming) { meta.state = 'confirmed'; meta.bk = bk; } else if (NONSTUDY_BK.includes(bk) || NONSTUDY_BK.includes(existing.bk)) meta.bk = bk;   // 미확정 이동은 종류를 계속 들고 있어야 과목 없이 저장된다
        const body = { ...existing, ...item, ...meta, id: existing.id }; if (!isMove) { delete body.from; delete body.to; delete body.est; } delete body.allDay; delete body.endDate; delete body.memo;   // 시간 일정에는 종일 값이 없다(종일에서 바꾼 경우 정리)
        try { done = await ctx.updatePlan?.(body); } catch { done = false; }   // 통신 오류도 실패로: 창과 입력은 그대로, 버튼은 다시 활성
      } else { try { done = await ctx.addPlan?.({ ...item, src: 'manual', ...(isTent ? { state: 'tentative', ...(NONSTUDY_BK.includes(curBk()) ? { bk: curBk() } : {}) } : { state: 'confirmed', bk }) }); } catch { done = false; } }
      if (done === false) { ok.disabled = false; if (confirmBtn) confirmBtn.disabled = false; } else close();
    };
    pop.onsubmit = (e) => { e.preventDefault(); send(false); };
    if (confirmBtn) confirmBtn.onclick = () => send(true);
    document.body.append(pop);
    const x = at?.x ?? anchor.getBoundingClientRect().left, y = at?.y ?? anchor.getBoundingClientRect().top;
    pos = { x, y }; placePop(pop, x, y);
    note.focus();
  }
  // 수업·캘린더·고정 일정·시험 블록 창. 화면(body)에 띄우고 바깥 누르기·Esc 로 닫힘.
  //  수업: 출석(서버 attendance — 미래는 서버가 막음) · 이해도 1~5 · 시작/종료 시각(공부 기록 v60.classLog) · 휴강(두 번 확인)
  //  캘린더: 시각 고치기 → 확인 → 구글 캘린더 변경 대기열(/api/aliveweek/changes, 원본 버전이 맞을 때만). 「운선」 일정은 제목을 보이지 않음
  // 접힌 「자세히」(기본 접힘): 원본 안내·합쳐진 원본 열기 같은 평소엔 필요 없는 것. 눈에 안 보이게 하되 원본에 닿는 길은 둔다
  function moreBox(...kids) { const k = kids.flat().filter(Boolean); if (!k.length) return null; const d = el('details', undefined, 'pl-more'), b = el('div', undefined, 'pl-moreb'); d.append(el('summary', '자세히')); b.append(...k); d.append(b); return d; }
  function blockPopup(b, anchor, at) {
    const { pop, close } = mkPop('div', 'pl-info', '', anchor);
    const date = b.date || ctx.today, when = `${date.slice(5).replace('-', '/')}(${wd(date)}) ${hm(b.s)}–${hme(b.e)}`, cat = blockCat(b);
    pop.setAttribute('aria-label', `${b.title} ${when}`);
    pop.append(el('b', b.title), el('small', when + (b.cls?.room ? ` · ${b.cls.room}` : ''), 'pl-popnote'));
    // 지우기: 시간표에서 지우지 않는다 — 원본(캘린더·학교 시간표·얼라이브위크·상담실)에서만 바꾼다는 것을 버튼 자리에 안내
    const ORIGIN = { cal: '시간표에서 지우지 않아요 — 구글 캘린더 원본에서만 지우고 바꿔요.', class: '시간표에서 지우지 않아요 — 학교 시간표(수업) 원본이에요. 안 하는 날은 아래 「휴강으로 표시」.', work: '시간표에서 지우지 않아요 — 얼라이브위크 기본 시간표에서만 바꿔요.', exam: '시간표에서 지우지 않아요 — 시험 일정은 상담실에서만 바꿔요.' };
    const moreKids = []; if (ORIGIN[b.k]) moreKids.push(el('small', ORIGIN[b.k], 'pl-popnote pl-origin'));
    // 같은 시각·같은 이름이라 한 칸으로 합친 다른 출처(캘린더·기본 시간표·수업)는 여기서 눌러 열 수 있다 — 합치면서 원본에 닿는 길을 잃지 않게
    if (b.also?.length) {
      const NAME = { class: '학교 시간표 수업', cal: '구글 캘린더', work: '얼라이브위크 기본 시간표' }, box = el('div', undefined, 'pl-also');
      box.append(el('small', '같은 시간에 같은 일정이 다른 곳에도 있어서 한 칸으로 합쳤어요.', 'pl-popnote'));
      for (const x of b.also) { const r = el('button', `${NAME[x.k] || x.k} · ${x.title}`, 'ghost'); r.type = 'button'; r.onclick = (e) => openBlock({ ...x, date: b.date }, anchor, { x: e.clientX || 0, y: e.clientY || 0 }); box.append(r); }
      moreKids.push(box);
    }
    const row = (label, ...kids) => { const r = el('div', undefined, 'pl-prow'); r.append(el('span', label), ...kids); return r; };
    const pick = (opts, cur, onPick) => { const g = el('div', undefined, 'pl-pick'); for (const [v, t] of opts) { const x = el('button', t); x.type = 'button'; x.setAttribute('aria-pressed', String(cur === v)); x.onclick = () => onPick(v, x); g.append(x); } return g; };
    if (b.k === 'class') {
      const c = b.cls, key = c.id, log = () => (v60.classLog || {})[key] || {}, future = date > ctx.today;
      const setLog = (patch) => save((st) => { st.classLog = st.classLog || {}; st.classLog[key] = { ...(st.classLog[key] || {}), ...patch, course: c.course, date }; });
      const ATT = [['present', '출석'], ['late', '지각'], ['absent', '결석'], ['excused', '공결']];
      // 출석(대표님 10/12 「출석이 안 눌러짐」): 눌러도 반응 없는 상태를 없앤다 — 저장 중 표시, 성공/실패는 창 안 한 줄로, 어떤 경로에서도(finally) 버튼을 다시 연다.
      // 미래 날짜만 서버가 막는다(날짜 기준 · 오늘은 시작 전이어도 가능). 막힌 이유는 서버 문구를 그대로 쓰지 않고 풀어서 보여 준다.
      const attMsg = el('small', '', 'pl-popnote pl-attmsg'); attMsg.setAttribute('role', 'status'); attMsg.setAttribute('aria-live', 'polite'); attMsg.hidden = true;
      const say = (t, bad) => { attMsg.textContent = t || ''; attMsg.hidden = !t; attMsg.classList.toggle('bad', !!bad); };
      const why = (r) => { const m = String(r?.error || '');
        if (r?.unknown) return '저장 여부를 확인하지 못했어요 · 새로고침해서 확인해요';
        if (/미래/.test(m)) return '아직 오지 않은 날의 수업이라 출석을 정할 수 없어요.';
        if (/여러 회차|^그 사이|^현재 출결|^학기가 바뀌/.test(m)) return m;
        return '저장하지 못했어요 · 다시 눌러요' + (/[가-힣]/.test(m) && m !== '저장하지 못했어요' ? ` (${m})` : ''); };
      // 출석·휴강은 같은 잠금 하나를 쓴다(오타 검수 10/12): 저장 중엔 둘 다 못 누르고, 끝나면(성공이든 실패든 예외든) 함께 풀린다
      let busy = false;
      const lock = (on) => { busy = on; for (const y of att.children) y.disabled = on || future; cancel.disabled = on; };
      const att = pick(ATT, c.record?.status || null, async (v, x) => {
        if (busy || future) return;
        lock(true); x.setAttribute('aria-busy', 'true'); say('저장 중…');
        try {
          keepDay();   // 저장하면 홈이 다시 그려진다 — 보던 날(지난날)이 오늘로 튀지 않게(try 안: 예외가 나도 finally 로 풀린다)
          const r = ctx.attend ? await ctx.attend(c.courseId, date, v) : { error: '이 화면에서는 출석을 저장할 수 없어요' };
          if (r === false || r?.error) say(why(r), true);
          else { c.record = { ...(c.record || {}), status: v }; for (const y of att.children) y.setAttribute('aria-pressed', String(y === x)); say(`${ATT.find((q) => q[0] === v)[1]} 저장했어요`); }
        } catch { say('저장 여부를 확인하지 못했어요 · 새로고침해서 확인해요', true); }
        finally { x.removeAttribute('aria-busy'); lock(false); }
      });
      if (future) for (const y of att.children) y.disabled = true;
      pop.append(row('출석', att), attMsg);
      if (future) pop.append(el('small', `미래 수업은 출석을 정할 수 없어요 · ${date.slice(5).replace('-', '/')}(${wd(date)}) 그날부터 눌러요.`, 'pl-popnote'));
      const und = pick([1, 2, 3, 4, 5].map((n) => [n, String(n)]), log().und ?? null, (v, x) => { setLog({ und: v }); for (const y of und.children) y.setAttribute('aria-pressed', String(y === x)); });
      und.setAttribute('aria-label', '이해도 1~5'); pop.append(row('이해도', und));
      const t = el('span', '', 'pl-ptime'); const paint = () => { const l = log(); t.textContent = `${l.startedAt ? '시작 ' + l.startedAt : ''}${l.endedAt ? ' · 끝 ' + l.endedAt : ''}` || '기록 없음'; };
      const sb = el('button', '시작'), eb = el('button', '종료'); sb.type = eb.type = 'button'; sb.setAttribute('aria-label', '수업 시작 기록'); eb.setAttribute('aria-label', '수업 종료 기록');
      sb.onclick = () => { setLog({ startedAt: hm(nowMin()) }); paint(); }; eb.onclick = () => { setLog({ endedAt: hm(nowMin()) }); paint(); };
      if (date !== ctx.today) sb.disabled = eb.disabled = true;
      paint(); pop.append(row('수업', sb, eb, t));
      const cancel = el('button', '휴강으로 표시', 'danger'); cancel.type = 'button'; let armed = false;
      cancel.onclick = async () => {
        if (busy) return;
        if (!armed) { armed = true; cancel.textContent = '정말 휴강'; return; }
        lock(true); say('저장 중…'); let ok = false;
        try { keepDay(); const r = ctx.attend ? await ctx.attend(c.courseId, date, 'cancelled') : { error: '이 화면에서는 저장할 수 없어요' }; if (r === false || r?.error) say(why(r), true); else ok = true; }
        catch { say('저장 여부를 확인하지 못했어요 · 새로고침해서 확인해요', true); }
        finally { lock(false); if (!ok) { armed = false; cancel.textContent = '휴강으로 표시'; } }
        if (ok) close();
      };
      pop.append(cancel);
    } else if (b.k === 'cal') {
      const ev = b.ev || {}, secret = /^\s*운선/.test(ev.title || '');
      const st = el('input'); st.type = 'time'; st.step = 300; st.value = hm(b.s); st.setAttribute('aria-label', '시작');
      const en = el('input'); en.type = 'time'; en.step = 300; en.value = hm(b.e); en.setAttribute('aria-label', '끝');
      const ok = el('button', '시각 바꾸기'); ok.type = 'button';
      pop.append(row('시각', st, el('span', '–'), en), ok); moreKids.push(el('small', '시각 바꾸기는 구글 캘린더 원본을 바꿔요. 다른 기기에서 먼저 바뀌었으면 막고 알려 줘요.', 'pl-popnote'));
      if (!ev.id || !ctx.calChange) { ok.disabled = true; pop.append(el('small', '이 일정은 여기서 바꿀 수 없어요(원본 정보 없음). 캘린더에서 고쳐 주세요.', 'pl-popnote')); }
      ok.onclick = async () => {
        const s2 = mins(st.value), e2 = mins(en.value); if (!(e2 > s2)) { app.status?.('끝이 시작보다 늦어야 해요.', true); return; }
        if (!confirm(`구글 캘린더 일정${secret ? '' : ` 「${ev.title || '일정'}」`} 을 ${hm(s2)}–${hm(e2)} 로 바꿀까요?`)) return;
        ok.disabled = true; const r = await ctx.calChange({ ev, date, start: hm(s2), end: hm(e2) });
        if (r === false) ok.disabled = false; else { cache.delete(date); close(); draw(); }
      };
    } else if (b.k === 'work') {
    } else if (b.k === 'exam') {
      if (b.title.includes('(예정)')) pop.append(el('small', '날짜·시각이 아직 확정되지 않았어요.', 'pl-popnote'));
    }
    { const mb = moreBox(moreKids); if (mb) pop.append(mb); }
    const no = el('button', '닫기', 'ghost'); no.type = 'button'; no.onclick = close; pop.append(no);
    document.body.append(pop);
    const x = at?.x ?? anchor.getBoundingClientRect().left, y = at?.y ?? anchor.getBoundingClientRect().top;
    placePop(pop, x, y);
    pop.querySelector('button:not([disabled])')?.focus();
  }
  // 수면 블록 창: 확정(출처·간격) · 취침만(기상 기록 없음) · 계획(목표 기준, 삭제 불가)
  const absLabel = (ms) => { const d = dateMinOf(ms); return `${d.date.slice(5).replace('-', '/')}(${wd(d.date)}) ${hm(d.min)}`; };
  function sleepPopup(b, anchor, at) {
    const { pop, close } = mkPop('div', 'pl-info', '', anchor), n = b.sleep, sleepMore = [];
    pop.setAttribute('aria-label', b.title);
    if (n.state === 'plan') {
      pop.append(el('b', '계획 수면'), el('small', `취침 ${hmAbs(n.goal[0])} · 기상 ${hmAbs(n.goal[1])}(목표 수면 ${fmtHours(n.goalHours)} 기준)`, 'pl-popnote'));
      sleepMore.push(el('small', '저장하지 않는 계산 블록이에요. 삭제할 수 없고, 목표를 바꾸면 앞으로 올 모든 밤의 계획이 같이 바뀌어요.' + (n.bedMs != null ? ' 이 밤은 취침 기록이 있어 그 뒤 목표 기상까지만 계획으로 이어 보여요.' : n.from > n.goal[0] ? ' 지금 진행 중인 밤이라 지금부터 목표 기상까지만 보여요.' : ''), 'pl-popnote'));
      const go = el('button', '목표 바꾸기'); go.type = 'button'; go.onclick = () => { close(); goalPopup(anchor); }; pop.append(go);
    } else if (n.state === 'mark') {
      pop.append(el('b', '취침 기록'), el('small', `${absLabel(n.bedMs)} 취침 · 기상 기록 없음`, 'pl-popnote'));
      sleepMore.push(el('small', `출처: ${n.src}. 기상 시각을 목표값으로 채워 넣지 않았어요. 앱 기록이면 홈 위쪽 수면 줄에서 기상을 남겨요.`, 'pl-popnote'));
    } else {
      pop.append(el('b', '수면 기록'), el('small', `${absLabel(n.bedMs)} 취침 → ${absLabel(n.wakeMs)} 기상`, 'pl-popnote'));
      sleepMore.push(el('small', `취침–기상 간격 ${fmtHours((n.wakeMs - n.bedMs) / 36e5)}(실제 잔 시간과 다를 수 있어요) · 출처: ${n.src}`, 'pl-popnote'));
    }
    { const mb = moreBox(sleepMore, [...(n.notes || []), ...(n.state === 'plan' ? n.goalNotes || [] : [])].map((t) => el('small', t, 'pl-popnote'))); if (mb) pop.append(mb); }
    const no = el('button', '닫기', 'ghost'); no.type = 'button'; no.onclick = close; pop.append(no);
    document.body.append(pop);
    placePop(pop, at?.x ?? anchor.getBoundingClientRect().left, at?.y ?? anchor.getBoundingClientRect().top);
    pop.querySelector('button')?.focus();
  }
  // 취침 목표 창(시간표 메뉴): v60.cfg.bed · sleepH 에 저장(옛 관제탑이 같은 값을 읽음). 열 때 본 값이 그대로일 때만 바꾼다
  function goalPopup(anchor) {
    const g = sleepGoal(v60.cfg), seen = goalSeen(v60.cfg), { pop, close } = mkPop('form', 'pl-goal', '취침 목표', anchor);
    pop.append(el('b', '취침 목표'));
    const l1 = el('label', '취침 시각 (18:00 ~ 다음 날 05:59)'), t = el('input'); t.type = 'time'; t.required = true; t.value = g.bedHM; t.setAttribute('aria-label', '취침 시각'); l1.append(t);
    const l2 = el('label', '수면 시간'), sel = el('select'); sel.setAttribute('aria-label', '수면 시간');
    const hs = []; for (let h = SLEEP_GOAL.minH; h <= SLEEP_GOAL.maxH; h += 0.5) hs.push(h); if (!hs.includes(g.hours)) { hs.push(g.hours); hs.sort((a, b) => a - b); }   // 기존 값이 0.5 간격이 아니어도 그 값을 보여 준다
    for (const h of hs) { const o = el('option', `${h}시간`); o.value = String(h); if (h === g.hours) o.selected = true; sel.append(o); }
    l2.append(sel);
    const wake = el('small', '', 'pl-popnote'), paint = () => { const b = okBedGoal(t.value) ? mins(t.value) : null; wake.textContent = b == null ? '취침 시각을 18:00 ~ 05:59 사이로 정해 주세요.' : `기상 목표 ${hm((b + Math.round(Number(sel.value) * 60)) % 1440)}`; };
    t.oninput = paint; sel.onchange = paint; paint();
    const ok = el('button', '저장'); ok.type = 'submit'; const no = el('button', '취소', 'ghost'); no.type = 'button'; no.onclick = close;
    pop.append(l1, l2, wake, el('small', '앞으로 올 모든 밤의 계획 수면에 적용돼요. 기록된 밤은 그대로예요.', 'pl-popnote'), ok, no);
    pop.onsubmit = (e) => {
      e.preventDefault(); const bed = t.value, sleepH = Number(sel.value); if (!okBedGoal(bed) || !Number.isFinite(sleepH)) { paint(); return; }
      close();
      runSleep('goal', (s) => applyGoal(s, { bed, sleepH, seen }), (o) => app.status?.(o === 'applied' ? `취침 목표를 ${bed}, 수면 ${sleepH}시간으로 바꿨어요.` : o === 'invalid' ? '취침 목표 값을 확인해 주세요.' : '그 사이 다른 화면에서 취침 목표가 바뀌어 적용하지 않았어요. 다시 열어 주세요.', o !== 'applied'));
    };
    document.body.append(pop); const r = anchor.getBoundingClientRect(); placePop(pop, r.left - 200, r.bottom + 16); t.focus();
  }
  // 블록을 누르면 종류별 창 — 시간표 블록과 아래 「일정 목록」이 같은 길을 쓴다
  function openBlock(b, anchor, at) {
    if (b.k === 'sleep') sleepPopup(b, anchor, at);
    else if (b.plan) planPopup(null, b.plan.date, b.s, anchor, at, true, b.plan);
    else if (b.k === 'auto') planPopup(null, b.date || ctx.today, b.s, anchor, at, true, null, { course: b.title.split(' · ')[0], note: b.title.split(' · ').slice(1).join(' · '), len: b.e - b.s, key: b.key, date: b.date || ctx.today, label: b.title });
    else blockPopup(b, anchor, at);
  }
  const WHAT = { plan: '고치기·삭제', class: '출석·이해도·시작·종료', cal: '시각 고치기', auto: '계획으로 넣기·숨기기', work: '내용 보기', exam: '내용 보기', sleep: '내용 보기·목표 바꾸기' };
  function blockEl(b, PX, now) {
    const cat = blockCat(b), sub = b.k === 'auto' ? ' · 추천' : b.lapsed ? ' · 수행 확인 필요 · 했어요?' : b.k === 'sleep' ? (b.sleep.state === 'plan' ? ' · 목표' : '') + (b.sleep.contPrev ? ' · 전날에서 이어짐' : '') + (b.sleep.contNext ? ' · 다음 날로 이어짐' : '') : '';
    const blk = el('div', undefined, `pl-blk k-${b.k} ${cat ? CAT_CLASS[cat] : 'c-unknown'}` + (b.k === 'sleep' ? ` sleep-${b.sleep.state}` : '') + (b.lapsed ? ' lapsed' : '') + (now >= 0 && b.e <= now ? ' past' : '')); blk.style.top = b.s * PX + 'px'; blk.style.height = Math.max(14, (b.e - b.s) * PX - 2) + 'px';
    if (b.cols > 1) { blk.dataset.n = b.cols; blk.style.setProperty('--n', b.cols); blk.style.setProperty('--c', b.col); }   // 겹치는 무리는 열로 나눠 옆으로
    const line = el('span'); line.append(el('i', b.lapsed ? '지난 계획' : cat || '?', 'pl-tag'), document.createTextNode(b.title)); blk.append(line);
    if ((b.e - b.s) * PX > 34) blk.append(el('small', `${hm(b.s)}–${hme(b.e)}${sub}`)); blk.title = `${cat ? CAT_NAME[cat] : '종류 모름'} · ${hm(b.s)}–${hme(b.e)} ${b.title}`;
    // 누르면 종류별 창(대표님 10/9 「시간블럭 누르면 수정할 수가 없는데」): 계획 = 고치기·확정·삭제, 수업 = 출석·이해도·시작·종료, 캘린더 = 시각 고치기,
    // 추천 = 계획으로 넣기·숨기기, 고정 일정·시험 = 내용 보기
    const what = WHAT[b.k];
    if (what) { blk.classList.add('edit'); blk.tabIndex = 0; blk.setAttribute('role', 'button'); blk.setAttribute('aria-label', `${cat ? CAT_NAME[cat] : '종류 모름'} ${b.title} ${hm(b.s)}–${hme(b.e)} ${what}`);
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
    box.append(el('span', '계획 → 확정 → 지나면 기록 · 미래 확정은 바뀔 수 있어요', 'pl-flow'), toggle);
    return box;
  }
  // 종일 줄(시간 격자 위): 하루 보기 = 세로 목록, 한 주·시험까지 = 날짜 칸에 걸친 가로 막대. 두 줄까지만 보이고 나머지는 「+N개」로 펼친다
  let adOpen = false; const AD_LIM = 2;
  const adMD = (d) => `${Number(d.slice(5, 7))}/${Number(d.slice(8))}`;
  function adEl(it, narrow) {
    const cls = it.kind === 'cal' ? 'cal' : it.tentative ? 'c-plan' : CAT_CLASS[it.cat] || 'c-plan', b = el('button', undefined, 'pl-ad ' + cls + (it.lapsed ? ' lapsed' : '') + (it.contL ? ' contL' : '') + (it.contR ? ' contR' : '')); b.type = 'button';
    const span = it.from === it.to ? adMD(it.from) : `${adMD(it.from)}–${adMD(it.to)}`;
    b.append(el('i', '종일', 'pl-tag'), el('i', it.kind === 'cal' ? '캘린더' : it.cat, 'pl-tag'));
    if (it.tentative) b.append(el('i', it.lapsed ? '지난 계획' : '계획', 'pl-tag'));
    b.append(el('span', it.title, 'pl-adt'));
    if (!narrow) b.append(el('small', span + (it.lapsed ? ' · 수행 확인 필요' : '')));
    const what = it.kind === 'cal' ? '구글 캘린더 일정 — 내용 보기' : '고치기·삭제';
    const kindTxt = it.kind === 'cal' ? '캘린더' : `${it.cat}${it.tentative ? (it.lapsed ? ' 지난 계획' : ' 계획') : ''}`;
    b.title = `종일 · ${kindTxt} · ${it.title} (${span})`; b.setAttribute('aria-label', `종일 ${kindTxt} ${it.title} ${span} ${what}`);
    b.onclick = (e) => { e.stopPropagation(); const at = { x: e.clientX || b.getBoundingClientRect().left, y: e.clientY || b.getBoundingClientRect().top }; if (it.kind === 'cal') allDayInfoPopup(it, b, at); else planPopup(null, it.plan.date, 0, b, at, true, it.plan); };
    return b;
  }
  function allDayInfoPopup(it, anchor, at) {
    const { pop, close } = mkPop('div', 'pl-info', '', anchor); pop.setAttribute('aria-label', `종일 ${it.title}`);
    const span = it.from === it.to ? `${adMD(it.from)}(${wd(it.from)})` : `${adMD(it.from)}(${wd(it.from)}) – ${adMD(it.to)}(${wd(it.to)})`;
    pop.append(el('b', it.title), el('small', span, 'pl-popnote'));
    { const mb = moreBox(el('small', `구글 캘린더 종일 일정${it.ev?.cal ? ' · ' + it.ev.cal : ''}이에요. 여기서 고치지 않고 구글 캘린더에서 고쳐요.`, 'pl-popnote pl-origin')); if (mb) pop.append(mb); }
    const no = el('button', '닫기', 'ghost'); no.type = 'button'; no.onclick = close; pop.append(no);
    document.body.append(pop); placePop(pop, at?.x ?? anchor.getBoundingClientRect().left, at?.y ?? anchor.getBoundingClientRect().top); no.focus();
  }
  function allDayDay(items) {   // 하루 보기: 격자 위 세로 목록
    if (!items.length) return null;
    const row = el('div', undefined, 'pl-adrow'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', '종일 일정');
    const list = el('div', undefined, 'pl-adlist'); row.append(el('span', '종일', 'pl-adlabel'), list);
    const shown = adOpen ? items : items.slice(0, AD_LIM);
    for (const it of shown) list.append(adEl(it, false));
    if (items.length > AD_LIM) { const m = el('button', adOpen ? '접기' : `+${items.length - AD_LIM}개`, 'pl-admore'); m.type = 'button'; m.setAttribute('aria-expanded', String(adOpen)); m.setAttribute('aria-label', adOpen ? '종일 일정 접기' : `종일 일정 ${items.length - AD_LIM}개 더 보기`); m.onclick = () => { adOpen = !adOpen; draw(true); }; list.append(m); }
    return row;
  }
  function allDayGrid(dates, items, cols) {   // 한 주·시험까지: 날짜 열에 맞춰 가로 막대
    if (!items.length) return null;
    const g = el('div', undefined, 'pl-adgrid'); g.style.gridTemplateColumns = cols; g.setAttribute('role', 'group'); g.setAttribute('aria-label', '종일 일정');
    g.append(el('span', '종일', 'pl-adlabel'));
    const lanes = Math.max(...items.map((i) => i.lane)) + 1, vis = adOpen ? lanes : Math.min(lanes, AD_LIM), hidden = new Array(dates.length).fill(0);
    for (const it of items) {
      if (it.lane >= vis) { for (let c = it.c0; c <= it.c1; c++) hidden[c]++; continue; }
      const b = adEl(it, true); b.style.gridColumn = `${it.c0 + 2} / ${it.c1 + 3}`; b.style.gridRow = String(it.lane + 1); g.append(b);
    }
    if (!adOpen && lanes > AD_LIM) hidden.forEach((n, c) => { if (!n) return; const m = el('button', `+${n}개`, 'pl-admore'); m.type = 'button'; m.setAttribute('aria-expanded', 'false'); m.setAttribute('aria-label', `${dates[c]} 종일 일정 ${n}개 더 보기`); m.style.gridColumn = String(c + 2); m.style.gridRow = String(AD_LIM + 1); m.onclick = () => { adOpen = true; draw(true); }; g.append(m); });
    if (adOpen && lanes > AD_LIM) { const m = el('button', '접기', 'pl-admore'); m.type = 'button'; m.setAttribute('aria-expanded', 'true'); m.setAttribute('aria-label', '종일 일정 접기'); m.style.gridColumn = '2 / 4'; m.style.gridRow = String(lanes + 1); m.onclick = () => { adOpen = false; draw(true); }; g.append(m); }
    return g;
  }
  const adItemsFor = (dates) => allDayItems({ dates, plans: ctx.plans || [], calDay: (d) => cache.get(d), nowMs: Date.now() });
  // 일정 목록: 짧거나 겹쳐서 누르기 힘든 블록도 44px 줄로 누를 수 있게(터치·키보드·화면낭독 경로)
  function blockList(blocks) {
    const d = el('details', undefined, 'pl-list'); d.append(el('summary', `이 날 일정 목록 (${blocks.length})`));
    for (const b of blocks.slice().sort((x, y) => x.s - y.s || x.e - y.e)) {
      if (!WHAT[b.k]) continue; const cat = blockCat(b);
      const r = el('button'); r.type = 'button'; r.append(el('i', cat || '?', 'pl-tag'), el('span', `${hm(b.s)}–${hme(b.e)}`, 'pl-tt'), el('span', b.title)); r.setAttribute('aria-label', `${cat ? CAT_NAME[cat] : '종류 모름'} ${b.title} ${hm(b.s)}–${hme(b.e)} ${WHAT[b.k]}`);
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
      b.onclick = () => { day = d; userScroll = 0; innerKey = ''; innerReset = true; draw(); };
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
    today.onclick = () => { day = ctx.today; userScroll = 0; innerKey = ''; innerReset = true; draw(); };
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
    { const a0 = isExam ? ctx.today : isWeek ? ws : day, a1 = isExam ? end : isWeek ? addDays(ws, 6) : day; let bad = false; for (let d = a0; d <= addDays(a1, 1) && d <= ctx.today; d = addDays(d, 1)) if (appleFail(d)) bad = true;
      if (bad) { const n = el('p', '건강앱(Apple) 수면 조회에 실패했어요. 저장된 수면 기록만 보여 줘요.', 'pl-note pl-applefail'); n.setAttribute('role', 'status'); card.append(n); } }
    lastSleepSig = sleepSig();
    const todayFixed = fixedBlocks(ctx.today), todayPlan = autoPlan(ctx.today, all, todayFixed);
    if (!isWeek && !isExam) {
      const fixed = day === ctx.today ? todayFixed : fixedBlocks(day), plan = day === ctx.today ? todayPlan : { out: [], left: [] };
      { const adr = allDayDay(adItemsFor([day])); if (adr) card.append(adr); }
      const box = el('div', undefined, 'pl-day'), grid = el('div', undefined, 'pl-grid has-lane'), PX = 54 / 60;
      grid.style.height = 24 * 60 * PX + 'px';
      for (let h = 0; h < 24; h++) { const line = el('div', undefined, 'pl-hour'); line.style.top = h * 60 * PX + 'px'; line.append(el('span', String(h).padStart(2, '0'))); grid.append(line); }
      const now = day === ctx.today ? nowMin() : -1;
      const dayBlocks = layoutColumns([...fixed, ...plan.out]);
      for (const b of dayBlocks) grid.append(blockEl(b, PX, now));
      grid.onclick = (e) => {   // 빈칸 누르면 그 시각에 일정(공부 계획) 넣기(대표님 10/9)
        if (e.target.closest('.pl-blk, .pl-place, .pl-lane, .pl-now')) return;
        const r = grid.getBoundingClientRect(), m = Math.max(0, Math.min(23 * 60 + 30, Math.floor(((e.clientY - r.top) / PX) / 30) * 30));
        if (day < ctx.today || (day === ctx.today && m + 30 <= nowMin())) { app.status?.('지난 시각엔 계획을 못 넣어요. 지난 일정은 + 버튼으로 확정해 넣어요.', true); return; }
        planPopup(card, day, day === ctx.today ? Math.max(m, Math.ceil(nowMin() / 10) * 10) : m, grid, { x: e.clientX, y: e.clientY });
      };
      grid.append(placeLane(day, PX, now));   // 오른쪽 여백: 있던 곳
      if (now >= 0) { const n = el('div', undefined, 'pl-now'); n.style.top = now * PX + 'px'; n.append(el('span', hm(now))); grid.append(n); }
      if (day === ctx.today) card.append(placeBar(day));
      box.append(grid); card.append(box);
      if (dayBlocks.length) card.append(blockList(dayBlocks));
      { const mn = el('p', modeText(), 'pl-note pl-modenote'); mn.setAttribute('role', 'status'); mn.setAttribute('aria-live', 'polite'); card.append(mn); }
      const ikey = view + '|' + day; box.dataset.ikey = ikey; box.addEventListener('scroll', () => { box.dataset.touched = '1'; innerKey = ikey; innerTop = box.scrollTop; if (!programmatic) userScroll = Date.now(); }, { passive: true });
      followBox = now >= 0 ? { box, PX, line: grid.querySelector('.pl-now') } : null;
      requestAnimationFrame(() => { if (innerKey === ikey) return; if (now >= 0) scrollToNow(box, PX, true); else setScroll(box, DAY.wake * PX); });
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
      { const lane = placeLane(date, PX, nowM, true); if (lane.children.length) { col.classList.add('has-lane'); col.append(lane); } }
      if (isToday) { const n = el('div', undefined, 'pl-now'); n.style.top = nowM * PX + 'px'; col.append(n); }
      if (planMode && date >= ctx.today) col.onclick = (e) => {
        if (e.target.closest('.pl-blk, .pl-lane')) return;
        const r = col.getBoundingClientRect(), m = Math.max(0, Math.min(23 * 60 + 30, Math.floor(((e.clientY - r.top) / PX) / 30) * 30));
        if (date === ctx.today && m + 30 <= nowMin()) { app.status?.('지난 시각엔 계획을 못 넣어요. 지난 일정은 + 버튼으로 확정해 넣어요.', true); return; }
        planPopup(card, date, m, col, { x: e.clientX, y: e.clientY });
      };
      body.append(col);
    }
    const stick = el('div', undefined, 'pl-wkstick'); stick.append(headRow); { const adg = allDayGrid(dates, adItemsFor(dates), cols); if (adg) stick.append(adg); }
    box.append(stick, body); card.append(box);
    followBox = null;
    const wkey = view + '|' + day; box.dataset.ikey = wkey; box.addEventListener('scroll', () => { box.dataset.touched = '1'; innerKey = wkey; innerTop = box.scrollTop; }, { passive: true });
    requestAnimationFrame(() => { if (innerKey === wkey) return; setScroll(box, ((isExam || ws === weekStart(ctx.today)) ? nowM - 120 : DAY.wake) * PX); });
    const wn = el('p', '', 'pl-note pl-modenote'); wn.setAttribute('role', 'status'); wn.setAttribute('aria-live', 'polite'); wn.dataset.week = '1'; wn.dataset.tail = ctx.holidays ? '수업은 학교 시간표(휴일·휴강 빼고)에서 가져와요.' : '수업은 오늘 칸만 학교 시간표에서 가져와요(휴일 정보가 없어 다른 날은 안 그려요).'; wn.textContent = noteText(wn); card.append(wn);
    return { card, fixed: todayFixed };
  }

  // ── 수면 기록 줄(홈 맨 위): 수면 시간대엔 「자기 전 접속 종료」, 아침엔 기상 확인, 어젯밤 요약 ──
  // 저장이 끝나기 전에는 「기록됨」·잘 자요 화면·아침 질문을 만들지 않는다(저장 중 → 실패면 다시 저장). 저장 성공과 변경 적용(applied)은 별개라 결과를 구분한다.
  let sleepOp = null;   // {kind, status:'saving'|'failed', retry}
  const kstNow = () => { const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date()).split(':').map(Number); return { date: kst(), h: p[0], m: p[1], s: p[2], min: p[0] * 60 + p[1] }; };
  const sleepCfgBed = () => v60?.cfg?.bed;
  async function runSleep(kind, apply, done) {
    if (sleepOp) return;   // 한 번에 하나(중복 클릭 차단)
    let out = 'conflict';
    const settle = (ok) => { if (!ok) { sleepOp = { kind, status: 'failed', retry }; paintSleep(); return; } sleepOp = null; paintSleep(); done(out); };
    const retry = async () => { sleepOp = { kind, status: 'saving', retry }; paintSleep(); saveErr = ''; await flush(); settle(!pend.length && !saveErr); };
    sleepOp = { kind, status: 'saving', retry }; paintSleep();
    const ok = await save((s) => { out = apply(s); });   // 클릭 순간에 정한 값만 쓴다 — 409 재적용이 새 시각을 만들지 않음
    settle(ok);
  }
  const OUT_MSG = { kept: '다른 화면에서 이미 취침을 기록했어요. 기존 기록을 유지했어요.', conflict: '그 사이 다른 화면에서 이 기록이 바뀌어 적용하지 않았어요. 줄을 확인해 주세요.', invalid: '취침과 기상 시각을 확인해 주세요.' };
  const undoable = (key, prev, savedObj, label) => () => runSleep('undo', (s) => applyRestore(s, { key, prev, saved: sleepCanon(savedObj) }), (o) => { app.status?.(o === 'applied' ? `${label}을 되돌렸어요.` : OUT_MSG.conflict, o !== 'applied'); });
  function recordBed(again) {
    const n = kstNow(), key = sleepKeyFor(n.date, n.min), bed = hm(n.min), bedAt = kstStamp(n.date, n.h, n.m, n.s);
    const prev = again ? JSON.parse(JSON.stringify(again)) : null, seen = again ? sleepCanon(again) : '', saved = { bed, src: 'app', bedAt };
    runSleep('bed', (s) => applyBed(s, { key, bed, bedAt, force: !!again, seen }), (o) => {
      if (o === 'applied') { goodnight(key, saved, () => undoable(key, prev, saved, again ? '다시 기록' : '취침 기록')(), again ? '이전 취침 기록으로 되돌리기' : '기록 취소'); return; }
      app.status?.(OUT_MSG[o] || OUT_MSG.conflict, o !== 'kept');
      if (o === 'kept' && v60.sleep?.[key]?.bed) goodnight(key, v60.sleep[key], null);
    });
  }
  function clearBed(row) {
    const prev = JSON.parse(JSON.stringify(row.rec)), seen = sleepCanon(row.rec);
    runSleep('clear', (s) => applyClear(s, { key: row.key, seen }), (o) => {
      if (o === 'applied') toast(`${row.bed} 취침 기록을 지웠어요`, '지운 기록 되돌리기', () => runSleep('undo', (s) => { if (s.sleep?.[row.key]) return 'conflict'; s.sleep = s.sleep || {}; s.sleep[row.key] = JSON.parse(JSON.stringify(prev)); return 'applied'; }, (o2) => app.status?.(o2 === 'applied' ? '기록을 되돌렸어요.' : OUT_MSG.conflict, o2 !== 'applied')));
      else app.status?.(OUT_MSG[o] || OUT_MSG.conflict, true);
    });
  }
  function setWake(row, wakeMin, nowSec) {
    const n = kstNow(), wake = hm(wakeMin), wakeAt = kstStamp(row.key, Math.floor(wakeMin / 60), wakeMin % 60, nowSec ?? 0);
    const h = sleepHours(row.rec.bedAt, wakeAt);
    if (h == null) { app.status?.('기상 시각이 취침 기록보다 빨라요(또는 너무 멀어요). 시각을 확인해 주세요.', true); return; }
    if (parseKst(wakeAt) > Date.now() + 60e3) { app.status?.('아직 오지 않은 시각이에요. 시각을 확인해 주세요.', true); return; }
    if (h > SLEEP.confirmH && !confirm(`취침–기상 간격이 ${fmtHours(h)}이에요. 맞나요?`)) return;
    const seen = sleepCanon(row.rec), prev = JSON.parse(JSON.stringify(row.rec)), saved = { ...row.rec, wake, wakeAt };
    runSleep('wake', (s) => applyWake(s, { key: row.key, wake, wakeAt, seen }), (o) => {
      if (o === 'applied') toast(`기상 ${wake} 기록 · 취침–기상 간격 ${fmtHours(h)}(수면 추정)`, '기상 기록 되돌리기', undoable(row.key, prev, saved, '기상 기록'));
      else app.status?.(OUT_MSG[o] || OUT_MSG.conflict, true);
    });
  }
  // 조용한 종료 화면: 소리·알림·진동 없음. 화면(앱)을 대신 닫아 주지는 못하므로 「이제 화면을 닫아 주세요」. 기록 취소는 이 화면에 계속 있다.
  function goodnight(key, rec, undo, cancelLabel = '기록 취소') {
    document.querySelector('.pl-night')?.remove();
    const root = el('div', undefined, 'pl-night'); root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'pl-night-t');
    const box = el('div', undefined, 'pl-night-box'); const h = el('h2', '잘 자요'); h.id = 'pl-night-t';
    box.append(h, el('p', `${rec.bed} 취침 기록`, 'pl-night-big'), el('p', '자러 간 시각이에요. 잠든 시각이 아니라서 실제 수면 시간과 다를 수 있어요.', 'pl-night-sub'), el('p', '아침에 이 앱을 열면 기상 시각을 물어볼게요. 이제 화면을 닫아 주세요.', 'pl-night-sub'));
    const act = el('div', undefined, 'pl-night-act'), back = el('button', '앱으로 돌아가기'); back.type = 'button';
    const others = [...document.body.children].filter((n) => n !== root), was = others.map((n) => !!n.inert); others.forEach((n) => { n.inert = true; });
    const prevFocus = document.activeElement;
    const close = () => { document.removeEventListener('keydown', key2, true); root.remove(); others.forEach((n, i) => { n.inert = was[i]; }); try { (prevFocus?.isConnected ? prevFocus : host?.querySelector('.pl-sleep button'))?.focus({ preventScroll: true }); } catch {} };
    back.onclick = close;
    if (undo) { const cancel = el('button', cancelLabel, 'ghost'); cancel.type = 'button'; cancel.onclick = async () => { cancel.disabled = true; await undo(); close(); }; act.append(cancel); }
    act.append(back); box.append(act); root.append(box); document.body.append(root);
    const key2 = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } else if (e.key === 'Tab') { const bs = [...root.querySelectorAll('button:not([disabled])')]; if (!bs.length) return; const i = bs.indexOf(document.activeElement); e.preventDefault(); bs[(i + (e.shiftKey ? bs.length - 1 : 1)) % bs.length].focus(); } };
    document.addEventListener('keydown', key2, true); back.focus();
  }
  function sleepBar() {
    if (!v60) return null;
    const n = kstNow(), view = sleepView({ sleep: v60.sleep || {}, date: n.date, min: n.min, nowMs: Date.now(), bedCfg: sleepCfgBed() });
    const box = el('section', undefined, 'pl-sleep'); box.setAttribute('aria-label', '수면 기록');
    const line = (cls) => { const r = el('div', undefined, 'pl-sleep-row' + (cls ? ' ' + cls : '')); box.append(r); return r; };
    let any = false; const sig = [];
    if (sleepOp) { const r = line(); any = true; sig.push('op:' + sleepOp.status);
      if (sleepOp.status === 'saving') r.append(el('span', '저장 중…', 'pl-sleep-t')); else { r.append(el('span', '수면 기록을 저장하지 못했어요. 누른 시각은 그대로 남아 있어요.', 'pl-sleep-t')); const b = el('button', '다시 저장', 'pl-sleepbtn ghost'); b.type = 'button'; b.onclick = () => sleepOp?.retry?.(); r.append(b); }
    } else {
      if (view.button) { const r = line(); any = true; sig.push('btn');
        const b = el('button', undefined, 'pl-sleepbtn'); b.type = 'button'; b.innerHTML = svg(ICON.moon); b.append(el('span', '자기 전 접속 종료')); b.setAttribute('aria-label', '자기 전 접속 종료 — 지금 시각을 취침 기록으로 남겨요'); b.onclick = () => recordBed(null);
        r.append(b, el('span', '누른 시각을 자러 간 시각으로 기록해요. 수면 시간은 추정이에요.', 'pl-sleep-t')); }
      if (view.lock) { const r = line(); any = true; sig.push('lock:' + view.lock); r.append(el('span', `${view.lock} — 직접 입력·이미 끝난 기록은 여기서 바꾸지 않아요.`, 'pl-sleep-t')); }
      for (const row of view.rows) {
        const r = line(); any = true; sig.push(`row:${row.key}:${row.bed}:${row.night}:${row.shortcut}:${row.again}`);
        const d = row.key; const when = `${d.slice(5).replace('-', '/')}(${wd(d)})`;
        r.append(el('span', row.night ? `${row.bed} 취침 기록됨 — 잘 자요` : `${row.bed}에 자러 간 기록이 있어요 · 기상 시각 없음${row.key < n.date ? ` (${when} 기록)` : ''}`, 'pl-sleep-t'));
        if (row.shortcut) { const b = el('button', '일어났어요', 'pl-sleepbtn'); b.type = 'button'; b.setAttribute('aria-label', `지금(${hm(n.min)})을 기상 시각으로 기록`); b.onclick = () => { const k = kstNow(); setWake(row, k.min, k.s); }; r.append(b); }
        if (row.wakeInput) { const b = el('button', '시각 고치기', 'pl-sleepbtn ghost'); b.type = 'button'; b.setAttribute('aria-label', `${when} 기상 시각 직접 입력`); b.onclick = () => {
          if (r.querySelector('.pl-sleep-edit')) return; const f = el('form', undefined, 'pl-sleep-edit'); const t = el('input'); t.type = 'time'; t.required = true; t.setAttribute('aria-label', `${when} 기상 시각`);
          const ok = el('button', '저장', 'pl-sleepbtn'); ok.type = 'submit'; const no = el('button', '취소', 'pl-sleepbtn ghost'); no.type = 'button'; no.onclick = () => f.remove();
          f.append(el('span', `기상 ${when}`, 'pl-sleep-t'), t, ok, no); f.onsubmit = (e) => { e.preventDefault(); if (!t.value) return; setWake(row, mins(t.value), 0); }; r.append(f); t.focus(); }; r.append(b); }
        if (row.again) { const b = el('button', '다시 기록', 'pl-sleepbtn ghost'); b.type = 'button'; b.setAttribute('aria-label', '취침을 지금 시각으로 다시 기록'); b.onclick = () => recordBed(row.rec); r.append(b); }
        const c = el('button', '기록 지우기', 'pl-sleepbtn ghost'); c.type = 'button'; c.onclick = () => clearBed(row); r.append(c);
      }
      if (view.more) { const r = line(); any = true; sig.push('more:' + view.more); r.append(el('span', `기상이 없는 오래된 취침 기록이 ${view.more}건 더 있어요. 위 기록을 처리하면 이어서 나와요.`, 'pl-sleep-t')); }
      if (view.summary) { const r = line('summary'); any = true; const sm = view.summary;
        sig.push(`sum:${sm.bed}:${sm.wake}:${sm.hours}`);
        r.append(el('span', `어젯밤 취침 기록 ${sm.bed} · 기상 ${sm.wake} · ${sm.hours != null ? `취침–기상 간격 ${fmtHours(sm.hours)}(수면 추정, 실제와 다를 수 있어요)` : '간격을 계산할 수 없어요(기록을 확인해 주세요)'}${sm.app ? '' : ' · 수면 기록'}`, 'pl-sleep-t'));
        r.append(el('small', 'Apple 건강 수면이 있는 날은 건강 점수에 그 값을 써요.', 'pl-sleep-s')); }
    }
    if (!any) return null; box.dataset.sig = sig.join('|'); return box;
  }
  // 1분 틱·저장 상태 바뀔 때: 문구가 같으면 그대로 두고(화면낭독이 같은 말을 되풀이하지 않게), 달라졌을 때만 줄을 바꾼다
  function paintSleep() {
    if (!host?.isConnected) return; const wrap = host.querySelector('.pl'); if (!wrap) return;
    const old = host.querySelector('.pl-sleep'), nu = sleepBar();
    if ((old?.dataset.sig || '') === (nu?.dataset.sig || '')) return;
    if (old && nu) old.replaceWith(nu); else if (nu) wrap.prepend(nu); else old?.remove();
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

  // 홈이 스크롤되는 칸(학교 화면은 main#scene, 아니면 문서)
  function pageScroller(from) { for (let n = from?.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) { const o = getComputedStyle(n).overflowY; if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight + 1) return n; } return document.scrollingElement; }
  function draw(keepScroll) {
    if (!host || !v60 || !host.isConnected) return;
    const all = tasks();
    const sched = dayCard(all);
    const wrap = el('div', undefined, 'pl'); const sleepRow = sleepBar(); wrap.append(...(sleepRow ? [sleepRow] : []), taskCard(all), nums(all, sched.fixed), sched.card);
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
    // 다시 그려도 위치를 지킨다: 창(문서) 스크롤 · 시간표 격자 안 스크롤 · 열어 둔 「일정 목록」
    const sc = pageScroller(host), y0 = sc ? sc.scrollTop : 0, listOpen = !!host.querySelector('.pl-list')?.open;
    { const old = host.querySelector('.pl-schedule .pl-day'); if (!innerReset && old?.dataset.touched && old.dataset.ikey === view + '|' + day) { innerKey = old.dataset.ikey; innerTop = old.scrollTop; } }   // 교체 직전의 실제 위치(scroll 이벤트 전에 다시 그려도)
    innerReset = false;
    host.replaceChildren(wrap);
    if (listOpen) { const l = host.querySelector('.pl-list'); if (l) l.open = true; }
    const gb = host.querySelector('.pl-schedule .pl-day'); if (gb && innerKey === view + '|' + day) { programmatic = true; gb.scrollTop = innerTop; requestAnimationFrame(() => { programmatic = false; }); }
    if (sc && Math.abs(sc.scrollTop - y0) > 1) sc.scrollTop = y0;
  }
  // 캘린더: 보이는 날(하루 = 그날, 한 주 = 월~일)을 한 번에 받아 날짜별로 기억
  async function ensureCal(from, to) {
    const dates = []; for (let d = from; d <= to; d = addDays(d, 1)) dates.push(d);
    if (dates.every((d) => cache.has(d))) return;
    try { const r = await fetch(`/api/cal?from=${from}&to=${to}`, { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(5000) }); const j = await r.json(); if (!j?.ok) throw new Error('cal'); for (const d of dates) if (!cache.has(d)) cache.set(d, j.days?.[d] || []); }
    catch { const at = Date.now(); for (const d of dates) if (!cache.has(d)) calFail.set(d, at); }   // 실패 = 모름(빈 일정 아님)
  }
  const sleepSig = () => [ctx.today, addDays(ctx.today, 1)].map((d) => sleepOn(d).map((b) => `${b.s}-${b.e}-${b.sleep.state}`).join(',')).join('|');
  const origDraw = draw;
  draw = function (keep) {
    const my = ++gen, from = view === 'week' ? weekStart(day) : view === 'exam' ? ctx.today : day, to = view === 'week' ? addDays(from, 6) : view === 'exam' ? examEnd() : day;
    let missing = false; for (let d = from; d <= to; d = addDays(d, 1)) if (!cache.has(d) && !(Date.now() - (calFail.get(d) || 0) < 30000)) missing = true;
    const aTo = addDays(to, 1) > ctx.today ? ctx.today : addDays(to, 1), aMissing = appleMissing(from, aTo).length > 0;   // 마지막 날 저녁에 자러 가는 밤은 다음 날 기상일이라 하루 더
    origDraw(keep); if (missing || aMissing) Promise.all([missing ? ensureCal(from, to) : null, aMissing ? ensureApple(from, aTo) : null]).then(() => { if (my === gen) origDraw(keep); });
  };

  return {
    // host 에 그리기. c = { today, courses[](집중 과목), focus(name)→bool, scheduled[], plans[], deadlines[](pendingDeadlines 결과), calendar[](오늘), routine, courseName(id) }
    // 할 일 목록은 공부·과제·공모전 세 묶음, 자동 배치는 집중 과목 밖이면 마감 오늘·내일일 때만
    async render(target, c) {
      const sameDay = ctx && ctx.today === c.today && Date.now() < keepDayUntil;
      host = target; ctx = c; day = sameDay ? day : c.today; bootDay = kst(); if (c.calendarOk) cache.set(c.today, c.calendar || []); else cache.delete(c.today);   // 확인 못 한 오늘 캘린더는 다시 받기
      host.replaceChildren(el('p', '공부 계획을 불러오는 중…', 'pl-empty'));
      try { await load(); } catch (e) { host.replaceChildren(el('p', e.message, 'pl-empty')); ctx.afterDraw?.(); return; }
      draw(); ctx.afterDraw?.();
      clearInterval(tick); let sec = 0;
      tick = setInterval(() => {
        if (!host?.isConnected) { clearInterval(tick); return; }
        for (const c2 of host.querySelectorAll('[data-clock]')) c2.textContent = clock(elapsed(c2.dataset.clock));
        if (kst() !== bootDay && !pend.length) { clearInterval(tick); ctx.reload?.(); return; }   // 자정 지나면 새 날짜로 다시(기록이 전날로 가지 않게)
        if (sec % 60 === 59 && ctx && appleMissing(addDays(ctx.today, -1), ctx.today).length) ensureApple(addDays(ctx.today, -1), ctx.today).then(() => { if (host?.isConnected && !document.querySelector('.pl-pop') && !pend.length) draw(); });   // 워치 동기화로 늦게 채워지는 어젯밤·오늘 아침
        if (sec % 60 === 59) { paintSleep(); if (ctx && v60 && lastSleepSig && sleepSig() !== lastSleepSig && !document.querySelector('.pl-pop') && !pend.length) draw(); }   // 목표 시각을 지나 계획이 바뀌면 시간표를 다시 그린다(열린 창이 있으면 미룸)   // 수면 시간대에 들어오거나 아침 확인 때가 되면 줄을 바꾼다(같은 문구면 그대로)
        if (++sec % 60 === 0 && followBox?.box?.isConnected) {   // 1분마다 지금 선을 옮기고, 직접 스크롤 안 했으면 화면이 따라감
          const now = nowMin(); if (followBox.line) { followBox.line.style.top = now * followBox.PX + 'px'; followBox.line.querySelector('span').textContent = hm(now); }
          scrollToNow(followBox.box, followBox.PX, false);
        }
      }, 1000);
    },
    destroy() { clearInterval(tick); host = null; toast.hide(); },
    _repaintSleep() { paintSleep(); },   // 시험용: 1분 틱을 기다리지 않고 수면 줄을 다시 계산
  };
}
