// 학교 화면 틀(대표님 10/9): 위 고정 줄 = 「GREENLIGHT | SCHOOL」 · 탭 · 비서별 토큰 사용량 · 대표실 버튼,
// 아래 고정 줄 = 김주영 스앵님(기본 캐릭터 rig.js) + 채팅 바(대화·질문). 스크롤해도 위·아래는 그대로.
// 수업(교실) 화면에서는 아래 줄을 숨긴다(교실은 자기 조작 줄이 있음). index.html·v3.css 는 건드리지 않고 이 모듈이 덮는다.
import { createRig } from './rig.js';
import { officeHref } from './worldmap.js';

const CSS = `
.school{--gl-top:64px;--gl-bottom:96px}
/* ── 위 고정 줄 */
.school > header{position:sticky!important;top:0;z-index:40;display:flex!important;align-items:center;gap:14px;min-height:var(--gl-top);padding:8px 16px!important;
  background:#fffffff2!important;backdrop-filter:blur(8px);border-bottom:1px solid #e3e8e4!important;box-sizing:border-box}
.school > header #home.brand{font:800 17px/1 "Pretendard Variable",Pretendard,system-ui,sans-serif!important;letter-spacing:.06em;color:#14261f!important;white-space:nowrap;background:none!important;border:0!important;padding:0!important}
.school > header #home.brand span{border:0!important;padding:0!important;margin:0!important;font:inherit!important;letter-spacing:inherit!important}
.school > header #home.brand .gl-sep{color:#b9c7bf!important;font-weight:400!important;margin:0 .45em!important}
.school > header #home.brand .gl-school{color:#2e6b52!important}
.school > header #location{display:none!important}
.school > header nav.rooms{display:flex!important;gap:4px;margin:0 0 0 6px}
.school > header nav.rooms .room-door{display:inline-flex!important;align-items:center;height:38px;padding:0 14px!important;border-radius:10px!important;border:0!important;background:none!important;color:#4b6358!important;font:600 14.5px/1 "Pretendard Variable",Pretendard,system-ui,sans-serif!important;cursor:pointer}
.school > header nav.rooms .room-door i{display:none!important}
.school > header nav.rooms .room-door[aria-pressed=true]{background:#e6f2ec!important;color:#1f4d3b!important}
.school > header .room-sub{display:none!important}
.gl-right{margin-left:auto;display:flex;align-items:center;gap:8px}
.gl-usage{display:flex;gap:6px}
.gl-gauge{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 10px;border-radius:999px;background:#f3f6f4;border:1px solid #dde5e0;font:600 12.5px/1 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#1f3d33;white-space:nowrap}
.gl-gauge b{font-weight:700;color:#4b6358}
.gl-gauge .gl-meter{width:34px;height:6px;border-radius:3px;background:#dde5e0;overflow:hidden}
.gl-gauge .gl-meter i{display:block;height:100%;background:#2e6b52}
.gl-gauge[data-warn] .gl-meter i{background:#c9603a}
.gl-gauge[data-wait]{color:#8a9a92}
.gl-office{display:inline-grid;place-items:center;width:40px;height:40px;border-radius:10px;border:1px solid #dde5e0;background:#fff;color:#1f3d33;text-decoration:none}
.gl-office:focus-visible{outline:3px solid #f2c94c;outline-offset:2px}
/* ── 아래 고정 줄: 스앵님 + 채팅 */
.sb{position:fixed;z-index:45;left:0;right:0;bottom:0;height:var(--gl-bottom);display:flex;align-items:center;gap:12px;padding:10px 16px max(10px,env(safe-area-inset-bottom)) 116px;box-sizing:border-box;
  background:#fffffff5;backdrop-filter:blur(8px);border-top:1px solid #e3e8e4}
.sb-who{position:absolute;left:18px;bottom:4px;width:84px;height:122px;pointer-events:none}   /* 바 위로는 30px 남짓만 나오게 */
.sb-bubble{position:absolute;left:112px;cursor:pointer;right:16px;bottom:calc(100% + 8px);max-width:640px;padding:10px 14px;border-radius:14px 14px 14px 4px;background:#16291f;color:#f6f2e6;
  font:500 15px/1.55 "Pretendard Variable",Pretendard,system-ui,sans-serif;box-shadow:0 8px 20px #0003;max-height:30dvh;overflow:auto}
.sb-bubble[hidden]{display:none}
.sb-bubble .sb-name{display:block;font:700 12px/1.4 inherit;color:#eadfbd;margin-bottom:2px}
.sb form{flex:1;display:flex;gap:8px;align-items:center;min-width:0}
.sb input{flex:1;min-width:0;height:46px;padding:0 16px;border-radius:23px;border:1px solid #d5ddd8;background:#fff;font:500 15px "Pretendard Variable",Pretendard,system-ui,sans-serif}
.sb input:focus{outline:2px solid #2e6b52;outline-offset:1px}
.sb button{flex:none;width:46px;height:46px;border-radius:50%;border:1px solid #d5ddd8;background:#fff;color:#1f3d33;display:grid;place-items:center;cursor:pointer}
.sb button.sb-send{background:#2e6b52;border-color:#2e6b52;color:#fff}
.sb button[aria-pressed=true]{background:#e6f2ec;border-color:#2e6b52}
.sb-log{position:fixed;z-index:46;left:16px;right:16px;bottom:calc(var(--gl-bottom) + 10px);max-width:720px;margin:0 auto;max-height:52dvh;overflow:auto;padding:14px;border-radius:16px;background:#fff;box-shadow:0 14px 40px #0003;display:flex;flex-direction:column;gap:8px}
.sb-log[hidden]{display:none}
.sb-msg{max-width:85%;padding:8px 12px;border-radius:14px;font:500 14.5px/1.5 "Pretendard Variable",Pretendard,system-ui,sans-serif;white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere}
.sb-msg.me{align-self:flex-end;background:#e6f2ec;color:#1f3d33}
.sb-msg.saeng{align-self:flex-start;background:#f3f6f4;color:#1f3d33}
.sb-log .sb-empty{color:#7a8a80;font:500 14px/1.5 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.school[data-mode=classroom] .sb,.school[data-mode=classroom] .sb-log{display:none!important}
.school:not([data-mode=classroom]) #dock{display:none!important}
.school:not([data-mode=classroom]) > footer{display:none!important}
.school:not([data-mode=classroom]) #scene{padding-bottom:calc(var(--gl-bottom) + 70px)!important}
/* ── 메인 대시보드(workspace.js renderDashboard) */
.db-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;max-width:1120px;margin:14px auto 0}
.db-card{background:#fff!important;border-radius:18px!important;padding:16px 18px!important;box-shadow:0 1px 0 #d9e1d8!important;border:1px solid #e3e8e4!important;min-width:0}
.db-card h2{margin:0 0 10px!important;font:700 16px/1.3 "Pretendard Variable",Pretendard,system-ui,sans-serif!important;color:#14261f!important}
.db-card h3.db-sub{margin:12px 0 6px;font:700 13px/1.3 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#4b6358}
.db-row{display:flex;align-items:center;gap:12px;width:100%;padding:10px 12px;border-radius:12px;background:#f7f9f8;border:1px solid #edf1ee;margin:0 0 6px;text-align:left;box-sizing:border-box;font:500 14px/1.4 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#1f3d33}
button.db-row{cursor:pointer}button.db-row:hover{border-color:#2e6b52}
.db-l{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.db-l b{font-weight:700}.db-l small,.db-r small{color:#6b7c73;font-size:12.5px}
.db-d{flex:none;min-width:58px;text-align:center;font:800 18px/1 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#2e6b52}
.db-exam.soon .db-d{color:#c9603a}
.db-ready{flex:none;font:600 12.5px/1 inherit;color:#4b6358}
.db-total{margin:0 0 10px;font:700 15px/1.4 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#14261f}
.db-bar{display:block;height:6px;border-radius:3px;background:#e3e8e4;overflow:hidden}.db-bar i{display:block;height:100%;background:#2e6b52}
.db-course.pace-tight .db-bar i{background:#c9a227}.db-course.pace-behind .db-bar i{background:#c9603a}
.db-r{flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:2px}
.db-time{flex:none;min-width:86px;font:700 13px/1.3 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#2e6b52;font-variant-numeric:tabular-nums}
.db-item.kind-due .db-time{color:#c9603a}
.db-title{flex:1;min-width:0}
.db-empty{color:#6b7c73;margin:4px 0}
.school[data-mode=workspace] #workspace{max-width:1160px;margin:0 auto}
@media (max-width:1280px){.gl-gauge .gl-meter{display:none}.gl-gauge{padding:0 9px}.school > header{gap:10px}}
@media (max-width:760px){.db-grid{grid-template-columns:1fr}.school > header nav.rooms .room-door{padding:0 9px!important}}
@media (max-width:600px){
  .school{--gl-top:104px}
  .school > header{flex-wrap:wrap;row-gap:6px;padding:6px 10px!important}
  .school > header > *{order:1}
  .school > header #home{order:0;margin-right:auto}
  .school > header .gl-right{order:2;flex:1 0 100%;justify-content:space-between;margin:0}
  .school > header nav.rooms{order:3;flex:1 0 100%;margin:0;justify-content:space-between}
  .school:not([data-mode=classroom]) > header .view-toggle{display:none!important}   /* 폰 홈에선 3D 보기 전환 숨김 */
  .gl-right{gap:4px}.gl-usage{gap:4px}.gl-gauge{padding:0 7px;height:28px;font-size:11px;gap:4px}.gl-office{width:34px;height:34px}
  .sb{padding-left:84px}.sb-who{width:64px;height:96px;left:10px}.sb-bubble{left:80px;right:10px}
}
`;
const svg = (d) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  office: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 10h.01M15 10h.01"/>',
  send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
  log: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
};

export function setupShell({ api, eventId, course = () => '', history = () => [] } = {}) {
  const school = document.querySelector('.school'); if (!school) return null;
  if (!document.getElementById('shell-css')) { const s = document.createElement('style'); s.id = 'shell-css'; s.textContent = CSS; document.head.append(s); }
  const header = school.querySelector(':scope > header');
  // 상호: GREENLIGHT | SCHOOL
  const home = document.getElementById('home');
  if (home) { home.innerHTML = 'GREENLIGHT<span class="gl-sep" aria-hidden="true">|</span><span class="gl-school">SCHOOL</span>'; home.setAttribute('aria-label', 'GREENLIGHT SCHOOL 홈'); }
  const lobbyTab = document.getElementById('mainArea'); if (lobbyTab) { lobbyTab.lastChild.textContent = '홈'; }
  // 오른쪽: 비서별 토큰 사용량 + 대표실
  const right = document.createElement('div'); right.className = 'gl-right';
  const usage = document.createElement('div'); usage.className = 'gl-usage'; usage.setAttribute('aria-label', '비서별 토큰 사용량');
  const gauge = (name) => { const g = document.createElement('span'); g.className = 'gl-gauge'; g.innerHTML = `<b>${name}</b><span class="gl-v">—</span><span class="gl-meter" aria-hidden="true"><i style="width:0"></i></span>`; g.dataset.wait = ''; usage.append(g); return g; };
  const gAtom = gauge('아톰'), gOtta = gauge('오타'), gToto = gauge('토토');
  right.append(usage);
  const href = officeHref() || '/kingdom/';
  const office = document.createElement('a'); office.className = 'gl-office'; office.href = href; office.innerHTML = svg(ICON.office); office.setAttribute('aria-label', '대표실로'); office.title = '대표실로';
  right.append(office);
  // 탭 뒤, 기존 더보기·보기 전환 앞
  const nav = header?.querySelector('nav.rooms'); (nav || home)?.after(right);
  const setGauge = (g, pct, text, tip) => {
    const v = g.querySelector('.gl-v'), i = g.querySelector('.gl-meter i');
    if (pct == null || !Number.isFinite(pct)) { v.textContent = text || '—'; i.style.width = '0'; g.dataset.wait = ''; delete g.dataset.warn; }
    else { v.textContent = text || Math.round(pct) + '%'; i.style.width = Math.max(0, Math.min(100, pct)) + '%'; delete g.dataset.wait; if (pct >= 80) g.dataset.warn = ''; else delete g.dataset.warn; }
    g.title = tip || '';
  };
  async function poll() {
    try {
      const r = await fetch('/api/kingdom/limits', { credentials: 'same-origin', cache: 'no-store' }); if (!r.ok) throw new Error(r.status);
      const j = await r.json();
      for (const [g, v, name] of [[gAtom, j.atom, '아톰'], [gOtta, j.otta, '오타']]) {
        const used = v?.session?.used;
        setGauge(g, typeof used === 'number' ? used : null, typeof used === 'number' ? null : '대기', `${name} 현재 세션 사용 ${typeof used === 'number' ? Math.round(used) + '%' : '갱신 대기'}${typeof v?.weekly?.used === 'number' ? ` · 주간 ${Math.round(v.weekly.used)}%` : ''}`);
      }
    } catch { setGauge(gAtom, null, '—', '사용량을 못 읽었어요'); setGauge(gOtta, null, '—', '사용량을 못 읽었어요'); }
    try {
      const r = await fetch('/api/toto/budget', { credentials: 'same-origin', cache: 'no-store' }); if (!r.ok) throw new Error(r.status);
      const j = await r.json(); const spent = Number(j.spent) || 0, budget = Number(j.budget) || 10;
      setGauge(gToto, spent / budget * 100, '$' + spent.toFixed(2), `토토 이번 달 $${spent.toFixed(2)} / $${budget}`);
    } catch { setGauge(gToto, null, '—', '토토 예산을 못 읽었어요'); }
  }
  poll(); const pollTimer = setInterval(() => { if (!document.hidden) poll(); }, 60000);

  // ── 아래 고정 줄: 스앵님 + 채팅
  const bar = document.createElement('div'); bar.className = 'sb'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', '김주영 스앵님과 대화');
  const who = document.createElement('div'); who.className = 'sb-who';
  const bubble = document.createElement('div'); bubble.className = 'sb-bubble'; bubble.hidden = true; bubble.setAttribute('aria-live', 'polite');
  const form = document.createElement('form');
  const input = document.createElement('input'); input.type = 'text'; input.maxLength = 1500; input.autocomplete = 'off'; input.placeholder = '스앵님께 말하기 · 오늘 뭐부터 할까요?'; input.setAttribute('aria-label', '스앵님께 말하기');
  const send = document.createElement('button'); send.type = 'submit'; send.className = 'sb-send'; send.innerHTML = svg(ICON.send); send.setAttribute('aria-label', '보내기');
  const logBtn = document.createElement('button'); logBtn.type = 'button'; logBtn.innerHTML = svg(ICON.log); logBtn.setAttribute('aria-label', '대화 기록'); logBtn.setAttribute('aria-pressed', 'false');
  form.append(input, send, logBtn); bar.append(who, bubble, form);
  const log = document.createElement('div'); log.className = 'sb-log'; log.hidden = true; log.setAttribute('aria-label', '스앵님 대화 기록');
  school.append(bar, log);
  const rig = createRig(who, { label: '김주영 스앵님' }); rig.setExpr('smile');
  bubble.onclick = () => { bubble.hidden = true; };   // 말풍선은 누르면 닫힘
  const messages = [];   // 이 화면에서 오간 말(서버 기록 상담 이력 뒤에 붙음)
  const say = (text, react) => {
    if (!text) { bubble.hidden = true; return; }
    bubble.replaceChildren(Object.assign(document.createElement('span'), { className: 'sb-name', textContent: '김주영 스앵님' }), document.createTextNode(text));
    bubble.hidden = false; rig.speak(text); if (react) rig.react(react);
  };
  const drawLog = () => {
    const past = (history() || []).slice(-10).flatMap((e) => [{ me: true, t: e.question }, { me: false, t: e.answer }]);
    const all = [...past, ...messages];
    log.replaceChildren(...(all.length ? all.map((m) => Object.assign(document.createElement('div'), { className: 'sb-msg ' + (m.me ? 'me' : 'saeng'), textContent: m.t })) : [Object.assign(document.createElement('p'), { className: 'sb-empty', textContent: '아직 나눈 대화가 없어요.' })]));
    log.scrollTop = log.scrollHeight;
  };
  const setLog = (open) => { log.hidden = !open; logBtn.setAttribute('aria-pressed', String(open)); if (open) drawLog(); };
  logBtn.onclick = (e) => { e.stopPropagation(); setLog(log.hidden); };
  document.addEventListener('pointerdown', (e) => { if (!log.hidden && !e.target.closest('.sb-log, .sb')) setLog(false); }, true);   // 바깥 누르면 닫힘
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !log.hidden) { setLog(false); logBtn.focus(); } });
  let busy = false;
  form.onsubmit = async (e) => {
    e.preventDefault(); const q = input.value.trim(); if (!q || busy) return;
    busy = true; send.disabled = true; input.value = ''; messages.push({ me: true, t: q }); if (!log.hidden) drawLog();
    say('음… 잠깐만요. 시험이랑 오늘 계획 보고 말해 줄게요.'); rig.setExpr('think');
    try {
      const r = await api('coach', { course: course() || '', question: q, mode: 'consultation', id: eventId() });
      const a = String(r?.answer || '').trim() || '지금은 답을 정리하지 못했어요. 한 번만 더 말해 줄래요?';
      messages.push({ me: false, t: a }); say(a, 'idle'); rig.setExpr('smile');
    } catch (err) { const a = '지금은 답을 못 가져왔어요. ' + (err?.message || ''); messages.push({ me: false, t: a }); say(a); rig.setExpr('sad'); }
    finally { busy = false; send.disabled = false; if (!log.hidden) drawLog(); }
  };
  // 다른 화면이 보내는 스앵님 신호(react·line)도 아래 줄에서
  window.addEventListener('saeng', (e) => { if (school.dataset.mode === 'classroom') return; const { react, line } = e.detail || {}; if (react) rig.react(react); if (line) say(line); });
  // 처음 인사(몇 초 뒤 저절로 닫힘)
  setTimeout(() => { if (school.dataset.mode !== 'classroom') { say('어서 와요. 궁금한 거나 오늘 상황을 아래에 말해 주세요.', 'idle'); const t = bubble.textContent; setTimeout(() => { if (bubble.textContent === t) bubble.hidden = true; }, 7000); } }, 900);
  return { say, rig, poll, focus: () => input.focus(), destroy() { clearInterval(pollTimer); rig.destroy(); bar.remove(); log.remove(); right.remove(); } };
}
