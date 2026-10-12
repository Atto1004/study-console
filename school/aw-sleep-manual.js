// ALiVEWEEK 수면 직접 입력(대표님 10/12 「이미 지나간 빈시간칸 눌러서 오늘 취침일정 등록하고 싶은데」).
// 지난 칸을 눌러 연 일정 추가 창에서 유형 「수면」을 고르면 취침·기상 시각(날짜 포함)을 받아 기존 수면 기록 v60.sleep[기상일] 에 쓴다.
// 계획 레코드가 아니다(새 저장소 없음). 값 {bed, wake, src:'app', bedAt, wakeAt, via:'manual'} — src:'app' 은 서버 health()·수면 블록이 읽는 정밀 경로이고, via 는 「직접 입력」 표시용(서버·기존 소비처는 모르는 필드를 읽지 않고, state 통째 저장이라 버리지도 않는다).
// 화면(plan.js)은 얇게 연결만 하고 계산·검증·변경 적용은 여기서 한다(DOM 없는 함수는 노드에서 바로 검사).
const p2 = (n) => String(n).padStart(2, '0');
const mins = (hm) => { const [h, m] = String(hm || '0:0').split(':').map(Number); return h * 60 + (m || 0); };
const okHM = (v) => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(v || ''));
const hmOf = (n) => `${p2(Math.floor(n / 60) % 24)}:${p2(Math.round(n % 60))}`;
const addDays = (date, n) => { const d = new Date(date + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const msOf = (date, m) => { const [y, mo, d] = date.split('-').map(Number); return Date.UTC(y, mo - 1, d) + m * 60000 - 9 * 3600e3; };
const dateMinOf = (ms) => { const t = new Date(ms + 9 * 3600e3); return { date: t.toISOString().slice(0, 10), min: t.getUTCHours() * 60 + t.getUTCMinutes() }; };
const canonOf = (o) => (o && typeof o === 'object' ? JSON.stringify(Object.keys(o).sort().map((k) => [k, o[k]])) : '');   // 키 순서와 상관없이 같은 객체면 같은 글자. 기록 없음 = ''
const fmtH = (h) => { const n = Math.max(0, Math.round(h * 60)), hh = Math.floor(n / 60), mm = n % 60; return hh ? `${hh}시간${mm ? ' ' + mm + '분' : ''}` : `${mm}분`; };

export const MANUAL = { minH: 3, maxH: 14, hardH: 24, defGoalBed: 60, defGoalH: 8 };

// datetime-local 값('YYYY-MM-DDTHH:MM') → {date, min}. 없는 날짜(2026-02-30)는 왕복 비교로 거른다
export function parseLocal(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)$/.exec(String(v || '')); if (!m) return null;
  const [y, mo, d] = m.slice(1, 4).map(Number), u = new Date(Date.UTC(y, mo - 1, d));
  if (u.getUTCFullYear() !== y || u.getUTCMonth() !== mo - 1 || u.getUTCDate() !== d) return null;
  return { date: `${m[1]}-${m[2]}-${m[3]}`, min: Number(m[4]) * 60 + Number(m[5]) };
}
export const toLocal = (date, min) => `${date}T${p2(Math.floor(min / 60))}:${p2(min % 60)}`;
const kstAt = (date, min) => `${date}T${p2(Math.floor(min / 60))}:${p2(min % 60)}:00+09:00`;

// 취침 기본값(오타 1차 정리): 목표 취침(cfg.bed, 허용 18:00~05:59, 아니면 01:00)이 기상 직전에 오는 시각. 목표가 12:00 이후면 전날 밤, 아니면 기상일 새벽에서 시작해
// 그 시각이 기상과 같거나 늦으면 하루 앞으로 뺀다. 그렇게 얻은 간격이 3~14시간 밖이면(예: 기상이 00:30) 기상 − 목표 수면시간(cfg.sleepH 4~12, 아니면 8시간, 5분 단위)을 쓴다.
export function defaultBed({ wakeDate, wakeMin, cfg }) {
  const okBed = okHM(cfg?.bed) && (mins(cfg.bed) >= 1080 || mins(cfg.bed) < 360), bed = okBed ? mins(cfg.bed) : MANUAL.defGoalBed;
  const hN = cfg?.sleepH == null || cfg?.sleepH === '' ? NaN : Number(cfg.sleepH), hours = Number.isFinite(hN) && hN >= 4 && hN <= 12 ? hN : MANUAL.defGoalH;
  const wakeMs = msOf(wakeDate, wakeMin);
  let bedMs = msOf(bed >= 720 ? addDays(wakeDate, -1) : wakeDate, bed); if (bedMs >= wakeMs) bedMs -= 86400e3;
  const gap = (wakeMs - bedMs) / 36e5;
  if (!(gap >= MANUAL.minH && gap <= MANUAL.maxH)) bedMs = wakeMs - Math.round((hours * 60) / 5) * 5 * 60000;
  return dateMinOf(bedMs);
}

// 입력 검증: bedL·wakeL = datetime-local 값. 결과 {error} 또는 {key, bed, wake, bedAt, wakeAt, hours, confirm}
// 서버 app_sleep_hours·화면 appSleepHours 와 같은 규칙: 기상일 = 키, bed·wake(HH:MM) = 전체 시각과 일치, 간격 0 초과 24 이하. 기상이 지금보다 미래면 화면이 표시하지 않으므로 거절(여유 없음, 오타 1차).
export function checkManual({ bedL, wakeL, nowMs }) {
  const b = parseLocal(bedL), w = parseLocal(wakeL);
  if (!b || !w) return { error: '취침과 기상 시각을 날짜까지 넣어 주세요.' };
  const bm = msOf(b.date, b.min), wm = msOf(w.date, w.min);
  if (!(wm > bm)) return { error: '기상이 취침보다 빨라요. 날짜를 확인해 주세요.' };
  const hours = (wm - bm) / 36e5;
  if (hours > MANUAL.hardH) return { error: '취침–기상 간격이 24시간을 넘어요. 날짜를 확인해 주세요.' };
  if (wm > nowMs) return { error: '아직 오지 않은 시각은 기록할 수 없어요. 기상 시각을 확인해 주세요.' };
  return { key: w.date, bed: hmOf(b.min), wake: hmOf(w.min), bedAt: kstAt(b.date, b.min), wakeAt: kstAt(w.date, w.min), hours, confirm: hours < MANUAL.minH || hours > MANUAL.maxH };
}
export const recordFrom = (c) => ({ bed: c.bed, wake: c.wake, src: 'app', bedAt: c.bedAt, wakeAt: c.wakeAt, via: 'manual' });

// 저장 변경 한 번(409 재적용 때도 그대로 돈다). 결과 'applied' · 'kept'(이미 이 값으로 저장돼 있음 — 자기 저장의 재적용) · 'conflict'(열 때 본 기록과 달라져 안 덮음)
// seen = 열 때(「이 기록 수정」을 누른 때) 본 기록의 canon, 기록이 없었으면 ''. 순서(오타 1차): 현재가 이미 저장하려는 값 → kept, 현재 = seen → applied, 그 밖 → conflict.
// 덮을 때는 현재 기록의 모르는 필드를 보존하고(병합) 우리가 쓰는 필드만 바꾼다.
export function applyManual(s, { key, rec, seen }) {
  s.sleep = s.sleep && typeof s.sleep === 'object' ? s.sleep : {};
  const cur = s.sleep[key];
  if (cur && typeof cur === 'object' && Object.entries(rec).every(([k, v]) => cur[k] === v)) return 'kept';
  if (canonOf(cur) !== seen) return 'conflict';
  s.sleep[key] = { ...(cur && typeof cur === 'object' ? cur : {}), ...rec };
  return 'applied';
}

// 이미 있는 기록 한 줄: 「23:40–07:30」 · 취침만 · 기상만 · 시각 모를 때
export function recordText(rec) {
  if (!rec || typeof rec !== 'object') return '';
  const b = okHM(rec.bed) ? rec.bed : '', w = okHM(rec.wake) ? rec.wake : '';
  return b && w ? `${b}–${w}` : b ? `${b} 취침만 · 기상 없음` : w ? `기상 ${w}만` : '시각을 읽을 수 없는 기록';
}
export const recordSource = (rec) => (rec?.via === 'manual' ? '직접 입력' : rec?.src === 'app' ? '앱 기록' : '말로 준 기록');

// 새벽(00:00~11:59)에 연 지난 칸이면 「지난밤 수면」으로 추천
export const suggestsSleep = (min) => Number.isInteger(min) && min >= 0 && min < 720;

// ── 입력 폼(DOM) ──
// deps: { el, date(탭한 날), wakeMin(기본 기상 분), cfg(), nowMs(), record(K)→기록, apple(K)→{main}|null|undefined, appleFail(K)→bool, ensureApple(K)→Promise, onChange() }
// 돌려줌: { root, read() → {ok, reason, rec, key, seen, prev, needConsent, hours, confirm}, consent(): 「이 기록 수정」 누른 것으로 취급 }
export function createSleepForm(deps) {
  const { el } = deps;
  const root = el('div', undefined, 'pl-sl'); root.setAttribute('role', 'group'); root.setAttribute('aria-label', '수면 기록');
  const now = () => deps.nowMs();
  // 기본값: 기상 = 탭한 칸 시각(오늘이고 아직 안 온 시각이면 지금 5분 내림), 취침 = defaultBed
  let wd = deps.date, wm = deps.wakeMin;
  { const n = dateMinOf(now()); if (msOf(wd, wm) > now()) { wd = n.date; wm = Math.floor(n.min / 5) * 5; } }
  const bd = defaultBed({ wakeDate: wd, wakeMin: wm, cfg: deps.cfg?.() });
  const mk = (label, val) => {
    const row = el('label', undefined, 'pl-sl-row'), t = el('span', label); const i = el('input'); i.type = 'datetime-local'; i.step = 300; i.value = val; i.required = true; i.setAttribute('aria-label', `${label} 시각(날짜 포함)`);
    row.append(t, i); return { row, i };
  };
  const bed = mk('취침', toLocal(bd.date, bd.min)), wake = mk('기상', toLocal(wd, wm));
  const status = el('small', '', 'pl-popnote pl-sl-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const exBox = el('div', undefined, 'pl-sl-exist'); exBox.hidden = true;
  const exTxt = el('small', '', 'pl-popnote pl-sl-extext'), exEdit = el('button', '이 기록 수정', 'ghost'), exNo = el('button', '취소', 'ghost');
  exEdit.type = 'button'; exNo.type = 'button';
  const exRow = el('div', undefined, 'pl-pick'); exRow.append(exEdit, exNo); exBox.append(exTxt, exRow);
  const apNote = el('small', '', 'pl-popnote pl-sl-apple'); apNote.hidden = true;
  root.append(bed.row, wake.row, exBox, apNote, status);
  let consented = null;   // {key, seen, prev} — 「이 기록 수정」을 누른 키(기상일이 바뀌면 다시 받는다, 오타 1차)
  const keyNow = () => parseLocal(wake.i.value)?.date || null;
  const snapOf = (rec) => (rec ? JSON.parse(JSON.stringify(rec)) : null);
  const sync = () => {
    const K = keyNow(), rec = K ? deps.record(K) : null, has = !!rec && typeof rec === 'object';
    if (consented && consented.key !== K) consented = null;
    exBox.hidden = !has; exEdit.hidden = !has || !!consented; exNo.hidden = !has || !!consented;
    if (has) exTxt.textContent = consented ? `${K.slice(5).replace('-', '/')} 기상일의 기록(${recordText(rec)})을 고치는 중이에요. 저장하면 이 기록을 바꿔요.` : `이미 기록이 있어요 · ${recordText(rec)} (${recordSource(rec)}). 덮어쓰지 않아요 — 고치려면 「이 기록 수정」을 눌러요.`;
    const ap = K ? deps.apple(K) : undefined;
    apNote.hidden = !(K && (ap?.main || deps.appleFail(K)));
    if (!apNote.hidden) apNote.textContent = ap?.main ? '건강 앱 기록이 우선이에요 — 이 날 건강 점수에는 Apple 값이 쓰이고, 여기 입력은 시간표 블록에 같이 남아요.' : '건강 앱 기록을 확인하지 못했어요. 있으면 건강 점수에는 그 값이 먼저 쓰여요.';
    const r = read();
    status.textContent = r.ok ? `기상일 ${K.slice(5).replace('-', '/')} 기록으로 저장돼요 · 간격 ${fmtH(r.hours)}${r.confirm ? ' (보통 3~14시간이라 저장할 때 한 번 물어봐요)' : ''}${r.needConsent ? ' · 위 기록을 먼저 정해 주세요' : ''}` : r.reason;
    deps.onChange?.(r);
  };
  function read() {
    const c = checkManual({ bedL: bed.i.value, wakeL: wake.i.value, nowMs: now() });
    if (c.error) return { ok: false, reason: c.error };
    const cur = deps.record(c.key), has = !!cur && typeof cur === 'object';
    const needConsent = has && !(consented && consented.key === c.key);
    return { ok: true, key: c.key, rec: recordFrom(c), hours: c.hours, confirm: c.confirm, needConsent, exists: has, seen: has ? (consented ? consented.seen : canonOf(cur)) : '', prev: has ? (consented ? consented.prev : snapOf(cur)) : null, status: null };
  }
  const fillFrom = (rec) => { if (/^\d{4}-\d{2}-\d{2}T/.test(rec?.bedAt || '') && /^\d{4}-\d{2}-\d{2}T/.test(rec?.wakeAt || '')) { bed.i.value = String(rec.bedAt).slice(0, 16); wake.i.value = String(rec.wakeAt).slice(0, 16); } };
  const consent = () => { const K = keyNow(), rec = K ? deps.record(K) : null; if (!rec) return; consented = { key: K, seen: canonOf(rec), prev: snapOf(rec) }; fillFrom(rec); sync(); };
  exEdit.onclick = consent;
  for (const i of [bed.i, wake.i]) { i.addEventListener('input', sync); i.addEventListener('change', sync); }
  const ensure = () => { const K = keyNow(); if (K && deps.ensureApple) Promise.resolve(deps.ensureApple(K)).then(() => { if (root.isConnected) sync(); }).catch(() => {}); };
  return { root, read, sync, consent, ensure, cancelBtn: exNo, inputs: { bed: bed.i, wake: wake.i } };
}
