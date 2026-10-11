// 강의실 화면 v1(세계 기획 4부·4부 보완, 오타 GREEN 10/9): 섹션 칩 줄 · 입장 카드 · 결과 창 섹션 줄과 한 장 요약.
// 상태는 기존 answer 기록과 지금 위치로만 계산하고 새 기록을 만들지 않는다. 이동은 전부 school.js 의 goRoute(pos) 한 길로.
import { sheetIds } from './lecture-pack.js';

const CSS = `
.school[data-pack] .v3-progress,.school[data-pack] .v3-track{display:none!important}
.lc-chips{display:flex;align-items:center;gap:6px;flex:1 1 auto;min-width:0;overflow-x:auto;scrollbar-width:none;padding:2px 2px}
.lc-chips::-webkit-scrollbar{display:none}
.lc-chip{flex:0 0 auto;width:34px;height:34px;border-radius:50%;border:2px solid #b9c7bf;background:#fff;color:#4b6358;cursor:pointer;
  font:700 14px/1 "Pretendard Variable",Pretendard,system-ui,sans-serif;display:grid;place-items:center;padding:0;-webkit-tap-highlight-color:transparent}
.lc-chip[data-pass]{background:#2e6b52;border-color:#2e6b52;color:#fff}
.lc-chip[data-where=ahead]:not([data-pass]){border-style:dashed;border-color:#c98a2b;color:#8a5a14}
.lc-chip[data-where=behind]:not([data-pass]){opacity:.55}
.lc-chip[data-loading]{background:#eef1ef;border-color:#d5ddd8;color:#9aa8a1}
.lc-chip[aria-current=step]{border-width:3px!important;border-color:#c9a227!important;box-shadow:0 0 0 3px #f2c94c55!important;transform:scale(1.08)}
.lc-chip.lc-sheet{border-radius:10px;width:auto;padding:0 10px}
.lc-chip:focus-visible{outline:3px solid #f2c94c;outline-offset:2px}
.lc-intro{position:absolute;z-index:6;inset:14px 196px 112px 14px;border-radius:14px;background:linear-gradient(160deg,#1d3a2e,#13261e);color:#f6f2e6;
  box-shadow:inset 0 0 0 2px #eadfbd55;display:flex;flex-direction:column;justify-content:center;padding:22px 30px;gap:10px;pointer-events:none;
  opacity:0;transform:translateY(6px);transition:opacity .35s,transform .35s}
.lc-intro[data-on]{opacity:1;transform:none}
.lc-intro .lc-meta{font:600 13px/1.4 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#eadfbd;letter-spacing:.02em}
.lc-intro h2{margin:0;font:700 clamp(18px,2.4vw,26px)/1.35 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.lc-intro ol{margin:4px 0 0;padding-left:1.3em;font:500 clamp(14px,1.7vw,17px)/1.6 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.school[data-view3=game] .lc-intro{inset:14px 14px 112px 14px}
@media (max-width:600px){.lc-intro{inset:10px 10px 100px 10px;padding:14px 16px}
  .school[data-pack] .v3-bar{flex-wrap:wrap}
  .school[data-pack] .v3-bar .lc-chips{order:-1;flex:1 0 100%;justify-content:center;overflow:visible}
  .v3-bar .lc-chip{width:40px;height:40px;min-width:40px!important;min-height:40px!important;font-size:14px}}
@media (prefers-reduced-motion:reduce){.lc-intro{transition:none}}
.v3-relisten{position:absolute;z-index:8;top:24px;right:210px;width:48px;height:48px;border-radius:50%;border:2px solid #f2c94c;background:#2a2410e6;color:#f2c94c;display:grid;place-items:center;cursor:pointer;padding:0;box-shadow:0 6px 16px #0005}
.school[data-view3=game] .v3-relisten{right:24px}
@media (max-width:600px){.v3-relisten{top:16px;right:16px;width:44px;height:44px}}
.v3-relisten:focus-visible{outline:3px solid #f2c94c;outline-offset:2px}
.lc-result{margin:14px 0 0;display:grid;gap:8px}
.lc-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-radius:12px;background:#f3f6f4;border:1px solid #dde5e0;
  font:500 15px/1.4 "Pretendard Variable",Pretendard,system-ui,sans-serif;color:#1f3d33;text-align:left;width:100%}
button.lc-row{cursor:pointer}
.lc-row b{font-weight:700}
.lc-tag{flex:0 0 auto;white-space:nowrap}
.lc-row[data-s=own] .lc-tag{color:#2e6b52}.lc-row[data-s=help] .lc-tag{color:#8a5a14}.lc-row[data-s=no] .lc-tag{color:#b5473a}
.lc-summary{margin:14px 0 0;padding:14px 18px;border-radius:12px;background:#16291f;color:#f6f2e6;font:500 14.5px/1.65 "Pretendard Variable",Pretendard,system-ui,sans-serif}
.lc-summary h3{margin:0 0 6px;font:700 14px/1.4 inherit;color:#eadfbd}
.lc-summary ul{margin:0;padding-left:1.1em}
`;
const inject = () => { if (!document.getElementById('lecture-ui-css')) { const s = document.createElement('style'); s.id = 'lecture-ui-css'; s.textContent = CSS; document.head.append(s); } };

// 그 회차·그 문항의 최신 답(기록 배열 순서상 마지막). 없으면 null.
export function latestAnswer(events, lessonId, stepId) {
  let last = null;
  for (const e of events || []) if (e && e.kind === 'answer' && e.lesson === lessonId && e.step === stepId) last = e;
  return last;
}
// 섹션 상태: 통과 = 확인 문항 최신 답이 정답. help = 통과했지만 도움 받음.
export function sectionStates(pack, lessonId, events) {
  return pack.sections.map((sec) => {
    const a = latestAnswer(events, lessonId, sec.check);
    return { id: sec.id, title: sec.title, check: sec.check, pass: a?.correct === true, help: a?.correct === true && !!a.assisted, tried: !!a };
  });
}

export function createLectureUi({ goRoute }) {
  inject();
  let chips = null, card = null;
  const school = () => document.querySelector('.school');

  function mountChips() {
    if (chips?.isConnected) return chips;
    const progress = document.querySelector('.v3-progress'); if (!progress) return null;
    chips = document.createElement('div'); chips.className = 'lc-chips'; chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', '섹션 이동');
    progress.after(chips); return chips;
  }

  return {
    // ctx: {pack, route, index, steps, lessonId, events(null=아직 못 읽음)}
    update(ctx) {
      const sc = school();
      if (!ctx?.pack) { sc?.removeAttribute('data-pack'); chips?.replaceChildren(); return; }
      sc?.setAttribute('data-pack', '1');
      const host = mountChips(); if (!host) return;
      const { pack, route, index, steps, lessonId, events } = ctx;
      const at = new Map(route.map((i, p) => [steps[i]?.id, p]));
      const curId = steps[index]?.id;
      const curSec = pack.sections.findIndex((s) => Object.keys(s.script).includes(curId) || s.check === curId);
      const inSheet = sheetIds(pack).includes(curId);
      const states = events ? sectionStates(pack, lessonId, events) : null;
      const out = pack.sections.map((sec, k) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'lc-chip'; b.textContent = String(k + 1);
        const st = states?.[k];
        if (!states) { b.dataset.loading = ''; b.setAttribute('aria-label', `섹션 ${k + 1} ${sec.title} · 확인 중`); }
        else {
          if (st.pass) b.dataset.pass = '';
          const where = curSec < 0 ? (inSheet ? 'ahead' : 'behind') : k < curSec ? 'ahead' : k > curSec ? 'behind' : 'here';
          b.dataset.where = where;
          b.setAttribute('aria-label', `섹션 ${k + 1} ${sec.title} · ${st.pass ? '통과' : where === 'ahead' ? '앞쪽 미통과' : '미통과'}`);
        }
        if (k === curSec) b.setAttribute('aria-current', 'step');
        const first = at.get(Object.keys(sec.script)[0]);
        b.onclick = () => { if (first !== undefined) goRoute(first); };
        return b;
      });
      const ws = sheetIds(pack), firstSheet = at.get(ws[0]);
      const s = document.createElement('button'); s.type = 'button'; s.className = 'lc-chip lc-sheet'; s.setAttribute('aria-label', '학습지');
      s.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>';
      if (inSheet) s.setAttribute('aria-current', 'step');
      s.onclick = () => { if (firstSheet !== undefined) goRoute(firstSheet); };
      host.replaceChildren(...out, s);
    },
    // 입장 카드: 강의 대사에 입장 표시가 있을 때만(재생 상태 기준)
    intro(on, info) {
      if (!on) { if (card) delete card.dataset.on; return; }
      const stage = document.querySelector('.v3-stage'); if (!stage) return;
      if (!card?.isConnected) { card = document.createElement('div'); card.className = 'lc-intro'; card.setAttribute('aria-hidden', 'true'); stage.append(card); }
      if (card.dataset.key !== info.key) {
        card.dataset.key = info.key;
        const meta = document.createElement('div'); meta.className = 'lc-meta'; meta.textContent = `오늘 수업 · ${info.course} · ${info.date}`;
        const h = document.createElement('h2'); h.textContent = info.title;
        const ol = document.createElement('ol'); for (const g of info.goals) { const li = document.createElement('li'); li.textContent = g; ol.append(li); }
        card.replaceChildren(meta, h, ol);
      }
      card.dataset.on = '';
    },
    // 결과 창에 섹션 줄 + 학습지 n/5 + 한 장 요약
    result(host, { pack, route, steps, lessonId, events }) {
      const at = new Map(route.map((i, p) => [steps[i]?.id, p]));
      const box = document.createElement('div'); box.className = 'lc-result';
      for (const [k, st] of sectionStates(pack, lessonId, events).entries()) {
        const s = st.pass ? (st.help ? 'help' : 'own') : 'no';
        const row = document.createElement(s === 'no' ? 'button' : 'div'); row.className = 'lc-row'; row.dataset.s = s;
        if (s === 'no') { row.type = 'button'; row.onclick = () => { const p = at.get(Object.keys(pack.sections[k].script)[0]); if (p !== undefined) goRoute(p, { closeDialogs: true }); }; }
        const name = document.createElement('span'); name.innerHTML = `<b>${k + 1}</b> `; name.append(st.title);
        const tag = document.createElement('span'); tag.className = 'lc-tag'; tag.textContent = s === 'own' ? '혼자 통과' : s === 'help' ? '도움 받아 통과' : '미통과 · 다시 듣기';
        row.append(name, tag); box.append(row);
      }
      const ws = sheetIds(pack), right = ws.filter((id) => latestAnswer(events, lessonId, id)?.correct === true).length;
      const sheet = document.createElement('div'); sheet.className = 'lc-row'; sheet.dataset.s = right === ws.length ? 'own' : 'no';
      sheet.innerHTML = '<span><b>학습지</b></span>'; const t = document.createElement('span'); t.className = 'lc-tag'; t.textContent = `${right} / ${ws.length}`; sheet.append(t); box.append(sheet);
      host.append(box);
      if (pack.summary?.length) {
        const sum = document.createElement('div'); sum.className = 'lc-summary';
        const h = document.createElement('h3'); h.textContent = '한 장 요약'; const ul = document.createElement('ul');
        for (const x of pack.summary) { const li = document.createElement('li'); li.textContent = x; ul.append(li); }
        sum.append(h, ul); host.append(sum);
      }
    },
  };
}
