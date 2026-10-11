// 정역학 강 시작 암기카드 (교실 페이지 게이트와 같은 규칙, 최종본.md §20)
//  · 카드 원본 = docs/tools/lessons/cards/statics.json (날짜 → 강 연결, 공통 + 강 카드)
//  · 본인 판정: 답을 먼저 적고 정답을 본 뒤 맞았어요/틀렸어요. 틀린 카드만 다시, 전부 맞혀야 수업이 열린다
//  · 게이트 중 Enter·Space 로는 판정하지 않는다(마우스·터치만). Esc·닫기는 수업을 열지 않는다
const CARDS_URL = '/docs/tools/lessons/cards/statics.json';
let cache = null;
const passed = new Set();   // 이 화면을 연 동안 통과한 수업 — 새로고침하면 다시 묻는다

async function load(fetcher) {
  if (!cache) {
    const r = await fetcher(CARDS_URL, { cache: 'no-store' });
    if (!r.ok) throw new Error('암기카드를 불러오지 못했습니다.');
    cache = await r.json();
  }
  return cache;
}

// 날짜 → {state: gate|free|error}. 병합 전에 카드 수·ID 중복을 검사한다
export function cardsFor(g, date) {
  if (g.free && g.free[date]) return { state: 'free' };
  const hit = Object.entries(g.lectures || {}).filter(([, v]) => (v.dates || []).includes(date));
  if (hit.length === 0) return { state: 'free' };   // 아직 강에 연결하지 않은 날짜(5강 이후 예정 수업)
  if (hit.length > 1) return { state: 'error' };
  const [k, lec] = hit[0];
  if ((g.common || []).length !== g.expect?.common || lec.cards.length !== g.expect?.[k]) return { state: 'error' };
  const cards = [...g.common, ...lec.cards];
  const ids = cards.map((c) => c.id);
  if (new Set(ids).size !== ids.length || cards.some((c) => !c.q || !c.a)) return { state: 'error' };
  return { state: 'gate', lecture: k, name: lec.name, cards };
}

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

function showGate(info) {
  return new Promise((resolve) => {
    const wrap = el('div', 'card-gate'); wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true');
    const box = el('div', 'card-gate-box');
    const head = el('div', 'card-gate-head'); const title = el('b', null, '암기카드 확인'); const prog = el('span', 'card-gate-prog');
    head.append(title, prog);
    const body = el('div', 'card-gate-body'); const row = el('div', 'card-gate-row');
    box.append(head, body, row); wrap.append(box); document.body.append(wrap);
    const G = { todo: info.state === 'gate' ? info.cards.slice() : [], wrong: [], i: 0, shown: false, why: false, round: 1 };
    const keys = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(false); return; }
      if (e.key === 'Enter' || e.key === ' ' || /^Arrow/.test(e.key)) { e.preventDefault(); e.stopPropagation(); }
    };
    window.addEventListener('keydown', keys, true);
    function done(ok) { window.removeEventListener('keydown', keys, true); wrap.remove(); resolve(ok); }
    function btn(label, cls, f) { const b = el('button', 'card-gate-btn ' + cls, label); b.type = 'button'; b.onclick = f; row.append(b); return b; }
    function view() {
      body.replaceChildren(); row.replaceChildren(); prog.textContent = '';
      if (info.state === 'error') { body.append(el('p', 'card-gate-note', '이 수업의 암기카드를 불러오지 못해 수업을 열 수 없어요. 아톰에게 알려 주세요.')); btn('닫기', 'ghost', () => done(false)); return; }
      if (G.i >= G.todo.length) {
        if (G.wrong.length) {
          G.todo = G.wrong; G.wrong = []; G.i = 0; G.shown = false; G.why = false; G.round++;
          body.append(el('p', 'card-gate-note', '틀린 카드 ' + G.todo.length + '개만 다시 봅니다.'));
          btn('다시 보기', 'primary', view); btn('닫기', 'ghost', () => done(false)); return;
        }
        return done(true);
      }
      const c = G.todo[G.i];
      prog.textContent = (G.i + 1) + ' / ' + G.todo.length + (G.round > 1 ? ' · ' + G.round + '차' : '');
      body.append(el('div', 'card-gate-q', c.q));
      if (!G.shown) {
        body.append(el('p', 'card-gate-note', '답을 종이나 화면에 먼저 적고, 정답을 보세요.'));
        btn('정답 보기', 'primary', () => { G.shown = true; view(); });
      } else {
        const a = el('div', 'card-gate-a'); a.append(el('i', null, '정답'), document.createTextNode(c.a)); body.append(a);
        body.append(el('p', 'card-gate-note', '적은 답과 비교해 판정하세요. 핵심 식·방향·조건을 모두 썼으면 맞음.'));
        if (G.why && c.why) {
          const h = el('div', 'card-gate-a'); h.append(el('i', null, '과제'), document.createTextNode(c.why.hw)); body.append(h);
          const f = el('div', 'card-gate-a'); f.append(el('i', null, '흐름'), document.createTextNode(c.why.flow)); body.append(f);
        }
        btn('틀렸어요', 'wrong', () => { G.wrong.push(c); G.i++; G.shown = false; G.why = false; view(); });
        btn('맞았어요', 'ghost', () => { G.i++; G.shown = false; G.why = false; view(); });
        if (c.why) btn('왜 외우나?', 'ghost', () => { G.why = !G.why; view(); });
      }
      btn('닫기', 'ghost', () => done(false));
    }
    view();
    row.querySelector('button')?.focus();
  });
}

// 정역학 수업이면 그 강의 카드를 통과해야 true. 다른 과목·연결 안 된 날짜는 바로 true
export async function cardGate(lessonId, fetcher = fetch) {
  const m = /^statics-(\d{4}-\d{2}-\d{2})$/.exec(String(lessonId || ''));
  if (!m || passed.has(lessonId)) return true;
  let info;
  try { info = cardsFor(await load(fetcher), m[1]); } catch { info = { state: 'error' }; }
  if (info.state === 'free') return true;
  const ok = await showGate(info);
  if (ok) passed.add(lessonId);
  return ok;
}
