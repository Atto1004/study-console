// 정역학 강 시작 암기카드 (교실 페이지 게이트와 같은 규칙, 최종본.md §20)
//  · 카드 원본 = docs/tools/lessons/cards/statics.json (날짜 → 강 연결, 공통 + 강별 카드, 카드마다 mc 보기 4개와 tip)
//  · 흐름(로직은 card-engine.js): 객관식 4지선다 + 「몰라요」 → 틀림·몰라요만 외우기 → 그 카드만 다시 → 전부 맞히면 수업이 열린다(「써서 확인」 단계 없음, 대표님 10/12).
//  · 게이트 중 Enter·Space·방향키로는 판정하지 않는다(마우스·터치만). Esc·닫기는 수업을 열지 않는다.
//  · 「건너뛰고 수업 열기」(모든 화면, 하단 오른쪽): 확인 없이 한 번에 수업을 연다. 통과가 아니라 「건너뜀」으로만 기억한다(대표님 10/12). 「닫기」는 수업을 열지 않는다.
//  · 통과는 이 화면을 연 동안만 기억한다. 서버에는 아무것도 저장하지 않는다.
import { createEngine, optionsOf } from './card-engine.js?v=4';
// 모듈 위치 기준 상대 경로: 웹(/study/school/)과 아이패드(/school/) 어디서 열어도 같은 파일을 읽는다 (절대 경로 '/docs/…' 는 웹 쪽 /study/ 접두에서 404 였다)
const CARDS_URL = new URL('../docs/tools/lessons/cards/statics.json', import.meta.url).href;
let cache = null;
let pending = false;     // 팝업이 열려 있는 동안 다른 수업의 게이트를 또 열지 않는다
const passed = new Set();   // 이 화면을 연 동안 통과하거나 건너뛴 수업 (새로고침하면 다시 묻는다)
const skipped = new Set();  // 그중 「건너뛰고 수업 열기」로 연 수업 — 통과·맞음 집계에 섞지 않는다(서버 저장 없음)
export const gateSkipped = (id) => skipped.has(id);

async function load(fetcher) {
  if (!cache) {
    const r = await fetcher(CARDS_URL, { cache: 'no-store' });
    if (!r.ok) throw new Error('암기카드를 불러오지 못했습니다');
    cache = await r.json();
  }
  return cache;
}

// 날짜 → {state: gate|free|error}. 병합 전에 카드 수·ID 중복·보기 4개를 검사한다.
export function cardsFor(g, date) {
  if (g.free && g.free[date]) return { state: 'free' };
  const hit = Object.entries(g.lectures || {}).filter(([, v]) => (v.dates || []).includes(date));
  if (hit.length === 0) return { state: 'free' };   // 아직 강에 연결되지 않은 날짜(5강 이후 예정 수업)
  if (hit.length > 1) return { state: 'error' };
  const [k, lec] = hit[0];
  if ((g.common || []).length !== g.expect?.common || lec.cards.length !== g.expect?.[k]) return { state: 'error' };
  const cards = [...g.common, ...lec.cards];
  const ids = cards.map((c) => c.id);
  if (new Set(ids).size !== ids.length || cards.some((c) => !c.q || !c.a || !optionsOf(c, 'x', 1))) return { state: 'error' };
  return { state: 'gate', lecture: k, name: lec.name, cards };
}

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const box = (label, text) => { const a = el('div', 'card-gate-a'); a.append(el('i', null, label), document.createTextNode(text)); return a; };

function showGate(info) {
  return new Promise((resolve) => {
    // 수업 선택 창(showModal)은 최상위 층이라 z-index 로는 못 덮는다 → 먼저 닫는다.
    document.querySelectorAll('dialog[open]').forEach((d) => { try { d.close(); } catch {} });
    const wrap = el('div', 'card-gate'); wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true');
    const panel = el('div', 'card-gate-box'); const foot = el('div', 'card-gate-foot');
    const head = el('div', 'card-gate-head'); const title = el('b', null, '암기카드 확인'); const prog = el('span', 'card-gate-prog');
    head.append(title, prog);
    const body = el('div', 'card-gate-body'); const row = el('div', 'card-gate-row');
    panel.append(head, body, row, foot); wrap.append(panel); document.body.append(wrap);
    const eng = info.state === 'gate' ? createEngine(info.cards, { seed: info.seed }) : null;
    const keys = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(false); return; }
      if (e.key === 'Tab') {   // 포커스를 팝업 안에 가둔다(뒤 화면으로 못 나간다)
        const bs = [...wrap.querySelectorAll('button')]; if (!bs.length) return;
        const i = bs.indexOf(document.activeElement);
        if (i < 0) { e.preventDefault(); bs[e.shiftKey ? bs.length - 1 : 0].focus(); }
        else if (e.shiftKey && i === 0) { e.preventDefault(); bs[bs.length - 1].focus(); }
        else if (!e.shiftKey && i === bs.length - 1) { e.preventDefault(); bs[0].focus(); }
        return;
      }
      if (e.key === 'Enter' || e.key === ' ' || /^Arrow/.test(e.key)) { e.preventDefault(); e.stopPropagation(); }
    };
    window.addEventListener('keydown', keys, true);
    function done(ok) { window.removeEventListener('keydown', keys, true); wrap.remove(); resolve(ok); }
    function btn(label, cls, f) { const b = el('button', 'card-gate-btn ' + cls, label); b.type = 'button'; b.onclick = f; row.append(b); return b; }
    function why(c) {
      const w = c.why; if (!w) return;
      if (w.hw && !/^확인 중/.test(w.hw)) body.append(box('과제', w.hw));
      if (w.flow) body.append(box('왜', w.flow));
    }
    function view() {
      body.replaceChildren(); row.replaceChildren(); foot.replaceChildren(); prog.textContent = '';
      if (info.state === 'gate' && eng && eng.view().kind !== 'done') {   // 끝 화면에는 이미 「수업 열기」가 있다
        const sk = el('button', 'card-gate-skip', '건너뛰고 수업 열기'); sk.type = 'button'; sk.onclick = () => done('skip'); foot.append(sk);
      }
      if (!eng) { body.append(el('p', 'card-gate-note', '이 수업의 암기카드를 불러오지 못해 수업을 열 수 없어요. 아톰에게 알려 주세요.')); btn('닫기', 'ghost', () => done(false)); return; }
      const v = eng.view();
      title.textContent = v.kind === 'study' ? '외우기' : '암기카드 확인';
      if (v.kind === 'done') {
        const s = v.summary;
        body.append(el('div', 'card-gate-q', '암기카드 끝'));
        body.append(el('p', 'card-gate-sum', s.missed ? '모르던 카드 ' + s.missed + '개 · 다시 맞힘' : '카드 ' + s.total + '장을 처음부터 다 맞혔어요'));
        if (s.missed) body.append(el('p', 'card-gate-note', '처음 결과: 맞음 ' + s.ok + ' · 틀림 ' + s.wrong + ' · 몰라요 ' + s.unknown));
        btn('수업 열기', 'primary', () => done(true)).focus();
        return;
      }
      if (v.kind === 'quiz') {
        prog.textContent = v.pos + ' / ' + v.total + (v.round > 1 ? ' · ' + v.round + '차' : '');
        body.append(el('div', 'card-gate-q', v.q));
        const a = v.answered, list = el('div', 'card-gate-opts');
        v.options.forEach((t, n) => {
          const b = el('button', 'card-gate-opt', t); b.type = 'button';
          if (a) {
            b.setAttribute('aria-disabled', 'true');
            if (n === a.right) { b.classList.add('ok'); b.append(el('span', 'card-gate-tag', '정답')); }
            else if (n === a.pick) { b.classList.add('bad'); b.append(el('span', 'card-gate-tag', '내 선택')); }
            else b.classList.add('dim');
          } else b.onclick = () => { eng.pick(n); view(); };
          list.append(b);
        });
        body.append(list);
        if (!a) {
          const u = el('button', 'card-gate-unknown', '몰라요'); u.type = 'button'; u.onclick = () => { eng.unknown(); view(); };
          body.append(el('p', 'card-gate-note', '모르면 찍지 말고 몰라요. 틀린 것과 똑같이 복습만 하면 돼요.'), u);
        } else {
          body.append(el('div', 'card-gate-res ' + (a.result === 'ok' ? 'ok' : a.result === 'wrong' ? 'bad' : 'unk'), a.result === 'ok' ? '맞았어요' : a.result === 'wrong' ? '틀렸어요' : '몰라요'));
          if (a.result !== 'ok') body.append(box('정답', v.card.mc.right));
          why(v.card);
          btn('다음', 'primary', () => { eng.next(); view(); });
        }
      } else if (v.kind === 'study') {
        prog.textContent = v.pos + ' / ' + v.total;
        body.append(el('div', 'card-gate-q', v.card.q));
        body.append(box('정답', v.card.a)); why(v.card);
        if (v.card.tip) body.append(box('요령', v.card.tip));
        btn(v.last ? '다시 풀기' : '다음 카드', 'primary', () => { eng.studied(); view(); });
      }
      btn('닫기', 'ghost', () => done(false));
    }
    panel.tabIndex = -1; view(); panel.focus({ preventScroll: true });   // 처음 포커스는 팝업 상자(버튼을 미리 누르지 않게)
  });
}

// 정역학 수업이면 그 강의 카드를 통과해야 true. 다른 과목·연결 안 된 날짜는 바로 true
export async function cardGate(lessonId, fetcher = fetch) {
  const m = /^statics-(\d{4}-\d{2}-\d{2})$/.exec(String(lessonId || ''));
  if (!m || passed.has(lessonId)) return true;
  let info;
  try { info = cardsFor(await load(fetcher), m[1]); info.seed = Date.now(); } catch { info = { state: 'error' }; }
  if (info.state === 'free') return true;
  if (pending) return false;
  pending = true;
  let ok = false;
  try { ok = await showGate(info); } finally { pending = false; }
  if (ok) { passed.add(lessonId); if (ok === 'skip') skipped.add(lessonId); }
  return !!ok;
}
