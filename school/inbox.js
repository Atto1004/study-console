// ≡ 목록 안 「확인 · 메일함 · 결재함 · 연동」 패널(대표님 10/9 「예전 인스타 UI 확인 탭처럼, 메일함·결재함 목록 안에, 연동된 거 안 된 거 확인」).
// 전부 실제 서버 값만 보여 준다 — 못 받아 오면 「불러오지 못함」으로 적고 빈칸을 지어내지 않는다.
//  확인: _private/asks.json(아톰이 대표님께 묻는 것) → 답은 공부 기록 asks[id] = {a, note, at}(예전 인스타 UI 와 같은 자리)
//  메일함: GET /api/mailbox(메일 · 공고) · 다시 읽기 POST /api/mailbox/refresh
//  결재함: GET /api/approvals · 결정 POST /api/approvals/decide(누르기 전에 한 번 더 확인)
//  연동: GET /api/integrations(매시간 점검) + 캘린더(/api/cal 오늘 받기) + 토큰 한도(/api/kingdom/limits)
const CSS = `
.ib-panel{position:fixed;z-index:120;top:0;right:0;bottom:0;width:min(440px,100vw);background:#fff;box-shadow:-12px 0 40px #0003;display:flex;flex-direction:column;font:500 14px/1.45 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#1f3d33}
.ib-panel[hidden]{display:none}
.ib-head{display:flex;align-items:center;gap:8px;padding:14px 16px 8px}.ib-head h2{margin:0;font:700 17px/1.3 inherit;flex:1}
.ib-x{width:40px;height:40px;border-radius:10px;border:1px solid #dde5e0;background:#fff;cursor:pointer;display:grid;place-items:center}
.ib-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:0 12px 10px;border-bottom:1px solid #edf1ee}
.ib-tab{position:relative;height:38px;border-radius:10px;border:1px solid #e3e8e4;background:#fff;font:600 13.5px inherit;color:#1f3d33;cursor:pointer}
.ib-tab[aria-selected=true]{background:#2e6b52;border-color:#2e6b52;color:#fff}
.ib-tab b{position:absolute;top:-6px;right:-4px;min-width:18px;height:18px;border-radius:9px;background:#c9603a;color:#fff;font:700 11px/18px inherit;padding:0 5px}
.ib-body{flex:1;overflow:auto;padding:12px 14px 24px;display:flex;flex-direction:column;gap:10px}
.ib-card{border:1px solid #e3e8e4;border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;gap:6px}
.ib-card.urgent{border-color:#e7b9a8;background:#fff8f5}.ib-card.done{opacity:.7}
.ib-card small{color:#6b7c73}.ib-card p{margin:0;white-space:pre-wrap}
.ib-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.ib-row button{min-height:36px;padding:0 12px;border-radius:10px;border:1px solid #cfd8d2;background:#fff;color:#1f3d33;font:600 13px inherit;cursor:pointer}
.ib-row button.go{background:#2e6b52;border-color:#2e6b52;color:#fff}.ib-row button.no{color:#b23a22;border-color:#e6b4a8}
.ib-row textarea{flex:1 1 100%;min-height:54px;border:1px solid #cfd8d2;border-radius:10px;padding:8px;font:inherit}
.ib-att img,.ib-att video{max-width:100%;border-radius:10px}.ib-att audio{width:100%}
.ib-st{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;align-items:start}
.ib-ok{color:#2e6b52;font-weight:700}.ib-bad{color:#b23a22;font-weight:700}.ib-unk{color:#9a7b2d;font-weight:700}
.ib-empty{color:#6b7c73;margin:8px 2px}
.ib-sec{margin:8px 2px 0;font:700 13px inherit;color:#4b6358}
@media (max-width:600px){.ib-panel{width:100vw}}
`;
const el = (t, x, c) => { const n = document.createElement(t); if (x != null) n.textContent = x; if (c) n.className = c; return n; };
const get = async (u) => { const r = await fetch(u, { credentials: 'same-origin', cache: 'no-store' }); if (!r.ok) throw new Error(String(r.status)); return r.json(); };
const post = async (u, body) => { const r = await fetch(u, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || String(r.status)); return j; };
const when = (ts) => { if (!ts) return ''; const d = new Date(typeof ts === 'number' ? (ts < 1e12 ? ts * 1000 : ts) : ts); return isNaN(d) ? String(ts) : d.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }); };
const TABS = [['ask', '확인'], ['mail', '메일함'], ['appr', '결재함'], ['link', '연동']];

export function createInbox({ status } = {}) {
  if (!document.getElementById('inbox-css')) { const s = document.createElement('style'); s.id = 'inbox-css'; s.textContent = CSS; document.head.append(s); }
  const panel = el('aside', undefined, 'ib-panel'); panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', '확인·메일함·결재함·연동');
  const head = el('div', undefined, 'ib-head'), title = el('h2', '확인'), x = el('button', undefined, 'ib-x'); x.type = 'button'; x.setAttribute('aria-label', '닫기');
  x.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  head.append(title, x);
  const tabs = el('div', undefined, 'ib-tabs'); tabs.setAttribute('role', 'tablist');
  const body = el('div', undefined, 'ib-body');
  panel.append(head, tabs, body); document.body.append(panel);
  let tab = 'ask', counts = {}, opener = null, seq = 0;   // seq: 탭 전환·다시 읽기마다 번호 — 늦게 온 이전 응답이 본문을 덮지 않게(오타 검수 10/9)
  const fresh = (my) => my === seq;
  const tabBtns = TABS.map(([k, n]) => { const b = el('button', undefined, 'ib-tab'); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.tab = k; b.append(el('span', n)); b.onclick = () => show(k); tabs.append(b); return b; });
  function paintTabs() { for (const b of tabBtns) { const k = b.dataset.tab; b.setAttribute('aria-selected', String(k === tab)); b.querySelector('b')?.remove(); if (counts[k]) b.append(el('b', String(counts[k]))); } }
  const close = () => { panel.hidden = true; opener?.focus?.(); };
  x.onclick = close;
  document.addEventListener('pointerdown', (e) => { if (!panel.hidden && !panel.contains(e.target) && !e.target.closest('.gl-pop, .gl-menu, [role=dialog]:not(.ib-panel)') && !e.target.closest('.ib-keep')) close(); }, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { e.stopPropagation(); close(); } }, true);

  // ── 확인: 묻는 것 + 답(공부 기록)
  async function loadState() { const j = await get('/api/study/state'); return j.state || {}; }
  async function saveAnswer(id, ans) {   // 다른 화면이 먼저 저장했으면(409) 새로 읽어 다시 한 번
    for (let i = 0; i < 2; i++) {
      const st = await loadState(); st.asks = st.asks || {}; if (ans) st.asks[id] = ans; else delete st.asks[id];
      const r = await fetch('/api/study/state', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state: st, client: 'school-inbox' }) });
      if (r.ok) return true; if (r.status !== 409) throw new Error(String(r.status));
    }
    throw new Error('다른 화면에서 계속 바뀌어 저장하지 못했어요');
  }
  function attNode(a) {
    const box = el('div', undefined, 'ib-att'), src = a.src ? new URL('../' + String(a.src).replace(/^\/+/, ''), document.baseURI).href : '';
    if (a.type === 'image' && src) { const i = el('img'); i.src = src; i.alt = a.cap || '첨부 그림'; i.loading = 'lazy'; box.append(i); }
    else if (a.type === 'audio' && src) { const v = el('audio'); v.controls = true; v.src = src + (a.start ? `#t=${a.start}${a.end ? ',' + a.end : ''}` : ''); box.append(v); }
    else if (a.type === 'video' && src) { const v = el('video'); v.controls = true; v.src = src + (a.start ? `#t=${a.start}${a.end ? ',' + a.end : ''}` : ''); box.append(v); }
    else if (a.text) box.append(el('p', a.text));
    else if (src) { const l = el('a', a.cap || '첨부 열기'); l.href = src; l.target = '_blank'; l.rel = 'noopener'; box.append(l); }
    if (a.cap && a.type !== 'text') box.append(el('small', a.cap));
    return box;
  }
  async function renderAsk(my) {
    let asks, st = null;
    try { const j = await get(new URL('../_private/asks.json', document.baseURI).href); asks = Array.isArray(j?.asks) ? j.asks : []; }
    catch { if (fresh(my)) body.replaceChildren(el('p', '확인할 목록(asks.json)을 불러오지 못했어요.', 'ib-empty')); return; }
    try { st = await loadState(); } catch { st = null; }   // 못 읽으면 답한 건지 모름 — 미답변으로 세지 않고 답하기도 막음(오타 검수 10/9)
    if (!fresh(my)) return;
    const known = !!st, ans = st?.asks || {}, open = asks.filter((a) => !ans[a.id]), done = asks.filter((a) => ans[a.id]);
    if (known) counts.ask = open.length; else delete counts.ask; paintTabs();
    const out = [];
    if (!known) out.push(el('p', '답한 기록을 불러오지 못해 답변 상태를 확인 못 했어요. 잠시 뒤 다시 열어 주세요.', 'ib-empty'));
    if (!asks.length) out.push(el('p', '지금 확인할 것이 없어요.', 'ib-empty'));
    for (const a of [...open.sort((p, q) => (q.urgent ? 1 : 0) - (p.urgent ? 1 : 0)), ...done]) {
      const card = el('div', undefined, 'ib-card' + (a.urgent && !ans[a.id] ? ' urgent' : '') + (ans[a.id] ? ' done' : ''));
      card.append(el('small', [a.subj, a.when].filter(Boolean).join(' · ') || '확인'), el('b', a.q || ''));
      if (a.ctx) card.append(el('p', a.ctx));
      for (const t of a.att || []) card.append(attNode(t));
      const row = el('div', undefined, 'ib-row');
      if (ans[a.id]) {
        row.append(el('span', `답: ${ans[a.id].a}${ans[a.id].note ? ' · ' + ans[a.id].note : ''}`));
        const re = el('button', '다시 답하기'); re.type = 'button'; re.onclick = async () => { re.disabled = true; try { await saveAnswer(a.id, null); show('ask'); } catch (e) { status?.(e.message, true); re.disabled = false; } }; row.append(re);
      } else {
        const note = el('textarea'); note.placeholder = '메모(선택)'; note.maxLength = 500; note.setAttribute('aria-label', '메모');
        for (const o of [...(a.options?.length ? a.options : ['맞아요', '아니에요']), '모르겠어요']) {
          const b = el('button', o, o === '모르겠어요' ? '' : 'go'); b.type = 'button';
          b.disabled = !known; b.onclick = async () => { for (const y of row.querySelectorAll('button')) y.disabled = true; try { await saveAnswer(a.id, { a: o, note: note.value.trim(), at: Date.now() }); show('ask'); } catch (e) { status?.('답을 저장하지 못했어요. ' + e.message, true); for (const y of row.querySelectorAll('button')) y.disabled = false; } };
          row.append(b);
        }
        row.append(note);
      }
      card.append(row); out.push(card);
    }
    body.replaceChildren(...out);
  }
  // ── 메일함
  async function renderMail(my, refresh) {
    let d;
    try { if (refresh) await post('/api/mailbox/refresh'); d = await get('/api/mailbox'); }
    catch (e) { if (fresh(my)) body.replaceChildren(el('p', `메일함을 불러오지 못했어요(${e.message}).`, 'ib-empty')); return; }
    if (!fresh(my)) return;
    const out = [], tools = el('div', undefined, 'ib-row'), re = el('button', d.mail?.busy ? '읽는 중…' : '다시 읽기'); re.type = 'button'; re.disabled = !!d.mail?.busy; re.onclick = () => show('mail', true);
    tools.append(re, el('small', d.mail?.ts ? `메일 ${when(d.mail.ts)} 기준` : '메일 읽은 시각 확인 못 함')); out.push(tools);
    out.push(el('div', '확인할 메일', 'ib-sec'));
    if (!d.mail?.ok) out.push(el('p', d.mail?.err ? `메일을 읽지 못했어요: ${d.mail.err}` : '메일을 아직 읽지 못했어요.', 'ib-empty'));
    else if (!(d.mail.items || []).length) out.push(el('p', '확인할 메일이 없어요.', 'ib-empty'));
    for (const m of d.mail?.items || []) { const c = el('div', undefined, 'ib-card'); c.append(el('small', [m.from, m.date].filter(Boolean).join(' · ')), el('b', m.subject || '(제목 없음)')); if (m.why) c.append(el('p', m.why)); out.push(c); }
    const ns = (d.notices || []).filter((n) => n.mark !== 'hide' && n.mark !== 'dislike');
    out.push(el('div', `공고 ${ns.length}건`, 'ib-sec'));
    for (const n of ns.slice(0, 30)) {
      const c = el('div', undefined, 'ib-card'); c.append(el('small', [n.src || n.source, n.date || n.deadline].filter(Boolean).join(' · ')));
      const t = el(n.url ? 'a' : 'b', n.title || n.name || '(제목 없음)'); if (n.url) { t.href = n.url; t.target = '_blank'; t.rel = 'noopener'; } c.append(t);
      if (n.why || n.summary) c.append(el('p', n.why || n.summary)); out.push(c);
    }
    counts.mail = (d.mail?.items || []).length; paintTabs();
    body.replaceChildren(...out);
  }
  // ── 결재함
  async function renderAppr(my) {
    let d; try { d = await get('/api/approvals'); } catch (e) { if (fresh(my)) body.replaceChildren(el('p', `결재함을 불러오지 못했어요(${e.message}).`, 'ib-empty')); return; }
    if (!fresh(my)) return;
    counts.appr = d.count || 0; paintTabs();
    const out = [];
    if (d.attention?.length) { out.push(el('div', '캘린더 확인 필요', 'ib-sec')); for (const a of d.attention) out.push(apprCard(a, false)); }
    out.push(el('div', `결재 대기 ${d.pending?.length || 0}건`, 'ib-sec'));
    if (!d.pending?.length) out.push(el('p', '결재할 것이 없어요.', 'ib-empty'));
    for (const a of d.pending || []) out.push(apprCard(a, true));
    if (d.done?.length) { out.push(el('div', '최근 처리', 'ib-sec')); for (const a of d.done.slice(0, 10)) out.push(apprCard(a, false)); }
    body.replaceChildren(...out);
  }
  function apprCard(a, live) {
    const c = el('div', undefined, 'ib-card' + (live ? '' : ' done'));
    c.append(el('small', `#${a.id} · ${when(a.ts)}${a.status && a.status !== 'pending' ? ' · ' + ({ approved: '승인', rejected: '반려', chosen: '선택함', answered: '답함' }[a.status] || a.status) : ''}${a.run_state ? ' · 실행 ' + a.run_state : ''}`), el('b', a.title || '(제목 없음)'));
    if (a.text) c.append(el('p', String(a.text).slice(0, 1200)));
    if (a.answer) c.append(el('small', '답: ' + a.answer));
    if (!live) return c;
    const row = el('div', undefined, 'ib-row'); let opts = []; try { opts = JSON.parse(a.options || '[]'); } catch {}
    const decide = async (decision, answer, label) => {
      if (!confirm(`결재 #${a.id} 「${a.title}」 — ${label} 할까요?`)) return;
      for (const y of row.querySelectorAll('button,textarea')) y.disabled = true;
      try { await post('/api/approvals/decide', { id: a.id, decision, answer: answer || '' }); status?.(`결재 #${a.id} ${label}`); if (tab === 'appr') show('appr'); }
      catch (e) { status?.('결재를 처리하지 못했어요. ' + e.message, true); for (const y of row.querySelectorAll('button,textarea')) y.disabled = false; }
    };
    if (a.dtype === 'choose' && opts.length) for (const o of opts) { const b = el('button', String(o), 'go'); b.type = 'button'; b.onclick = () => decide('chosen', String(o), `「${o}」 선택`); row.append(b); }
    else if (a.dtype === 'ask') { const t = el('textarea'); t.placeholder = '답'; t.setAttribute('aria-label', '답'); const b = el('button', '답하기', 'go'); b.type = 'button'; b.onclick = () => { if (t.value.trim()) decide('answered', t.value.trim(), '답'); }; row.append(t, b); }
    else { const y = el('button', '승인', 'go'), n = el('button', '반려', 'no'); y.type = n.type = 'button'; y.onclick = () => decide('approved', '', '승인'); n.onclick = () => decide('rejected', '', '반려'); row.append(y, n); }
    c.append(row); return c;
  }
  // ── 연동
  async function renderLink(my) {
    const out = [], card = el('div', undefined, 'ib-card'), grid = el('div', undefined, 'ib-st'); card.append(grid); out.push(card);
    const line = (name, state, msg) => { grid.append(el('span', state === true ? '연결' : state === false ? '끊김' : '모름', state === true ? 'ib-ok' : state === false ? 'ib-bad' : 'ib-unk')); const d = el('div'); d.append(el('b', name)); if (msg) d.append(el('small', ' · ' + msg)); grid.append(d); };
    let bad = 0;
    try {
      const d = await get('/api/integrations');
      if (d.stale) out.unshift(el('p', `점검 결과가 오래됐어요(${when(d.ts)}). 아래 상태가 지금과 다를 수 있어요.`, 'ib-empty'));
      for (const it of d.items || []) { line(it.name || it.key, typeof it.ok === 'boolean' ? it.ok : null, [it.msg, it.ok === false && it.fix ? '고치기: ' + it.fix : ''].filter(Boolean).join(' · ')); if (it.ok === false) bad++; }
      if (!d.items?.length) line('연동 점검', null, '점검 결과가 없어요');
    } catch (e) { line('연동 점검', null, `불러오지 못함(${e.message})`); }
    try { const t = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date()); const c = await get(`/api/cal?from=${t}&to=${t}`); const ok = !!c.ok; line('구글 캘린더', ok, ok ? (c.agent ? '대신 받은 사본' : '오늘 일정 받음') : (c.error || '받지 못함')); if (!ok) bad++; }
    catch (e) { line('구글 캘린더', false, `받지 못함(${e.message})`); bad++; }
    try { const l = await get('/api/kingdom/limits'); for (const [k, n] of [['atom', '토큰 · 아톰'], ['otta', '토큰 · 오타']]) { const v = l[k]; line(n, v ? !!v.ok : null, v ? (v.ok ? `현재 세션 ${v.session?.used ?? '?'}%` : v.usage_err || '읽지 못함') : '값 없음'); if (v && !v.ok) bad++; } }
    catch (e) { line('토큰 한도', null, `불러오지 못함(${e.message})`); }
    if (!fresh(my)) return;
    counts.link = bad; paintTabs();
    body.replaceChildren(...out);
  }
  async function show(k, refresh) {
    const my = ++seq; tab = k; title.textContent = TABS.find((t) => t[0] === k)[1]; paintTabs();
    body.replaceChildren(el('p', '불러오는 중…', 'ib-empty'));
    await ({ ask: () => renderAsk(my), mail: () => renderMail(my, !!refresh), appr: () => renderAppr(my), link: () => renderLink(my) })[k]();
  }
  // 숫자(빨간 점)만 미리: 확인 안 한 질문·결재 대기
  async function peek() {
    try { const j = await get(new URL('../_private/asks.json', document.baseURI).href); const st = await loadState(); counts.ask = (j.asks || []).filter((a) => !(st.asks || {})[a.id]).length; } catch { delete counts.ask; }   // 못 읽으면 세지 않음
    try { counts.appr = (await get('/api/approvals')).count || 0; } catch {}
    paintTabs(); return counts;
  }
  return { open(k = 'ask', from) { opener = from || document.activeElement; panel.hidden = false; show(k); x.focus(); }, close, peek, get counts() { return counts; }, el: panel };
}
