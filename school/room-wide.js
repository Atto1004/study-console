// 강의실 배치 A — 와이드 칠판(대표님 10/9 「어느 강의실 칠판이 정사각형이야」 · 「칠판 구조랑 버튼 구조가 제일 문제」, A안 선택).
// 사이트 보기에서만(게임 보기는 3D 교실 그대로):
//   위 = 가로로 긴 칠판(3:1, 나무 테두리·분필 받침), 스앵님은 칠판 오른쪽 앞에 서 있음(카드 테두리 없이)
//   그 아래 = 대사창 한 줄 · 그 아래 = 문제 칸(강의 재생 중엔 숨김, 문제·멈춤 때 나타남)
//   맨 아래 한 줄 = 왼쪽 섹션 칩 · 가운데 재생 묶음 · 오른쪽 도움 묶음(힌트·쉽게·대화·더보기)
//   대화 기록·입력은 💬 서랍으로 접음(바깥 누르면 닫힘). Q·? 는 서랍을 열고 입력 칸으로.
// v3.css·classroom-v3.js 는 건드리지 않고 이 모듈 CSS 가 덮는다(Codex 팀 작업 중).
const CSS = `
.school[data-wide][data-view3=site][data-mode=classroom] .v3-stage{flex:none!important;height:auto!important;min-height:0!important;overflow:visible;background:none;border-radius:0;display:flex;flex-direction:column;gap:10px}
.school[data-wide][data-view3=site] .v3-stage .teaching-space{position:relative!important;inset:auto!important;height:auto!important;display:block!important;padding:0!important;align-self:stretch!important;width:100%!important}   /* skin.css align-self:start 가 폭을 줄였다 */
.school[data-wide][data-view3=site] .v3-stage #board{aspect-ratio:3/1;width:100%;height:auto!important;max-height:calc(100dvh - 330px);box-sizing:border-box;
  border-radius:6px!important;border:10px solid #6e4b2c!important;border-bottom-width:18px!important;
  box-shadow:inset 0 0 0 1px #00000040,inset 0 -2px 0 #00000030,0 10px 24px #2a1a0c40!important;padding:22px calc(clamp(110px,15%,180px) + 18px) 18px 28px!important;overflow:auto}
.school[data-wide][data-view3=site] .v3-stage .teaching-space::after{content:"";position:absolute;left:6%;right:6%;bottom:-2px;height:7px;border-radius:3px;background:linear-gradient(#a37a50,#7a5534);box-shadow:0 2px 3px #0004;pointer-events:none}
.school[data-wide][data-view3=site] .v3-stage .teacher{position:absolute!important;z-index:4;inset:auto 2.2% 18px auto!important;width:clamp(110px,15%,180px)!important;height:auto!important;pointer-events:none;display:block!important}   /* v3.css inset:auto!important 를 이기게 */
.school[data-wide][data-view3=site] .v3-stage .teacher #dock{background:none!important;box-shadow:none!important;border:0!important;padding:0!important;pointer-events:none}
.school[data-wide][data-view3=site] .v3-stage .teacher #dock > :not(#dockFace){display:none!important}
.school[data-wide][data-view3=site] .v3-stage .teacher #dockFace{background:none!important;border:0!important;box-shadow:none!important;filter:drop-shadow(0 8px 10px #0005)}
.school[data-wide][data-view3=site] .vn-box{position:relative!important;left:auto!important;right:auto!important;bottom:auto!important;margin-top:8px}
.school[data-wide][data-view3=site] .lc-intro{inset:0 0 auto 0!important;aspect-ratio:3/1;max-height:calc(100dvh - 330px);border-radius:6px;padding-right:calc(clamp(110px,15%,180px) + 24px)}
.school[data-wide][data-view3=site] .v3-relisten{top:18px!important;right:calc(clamp(110px,15%,180px) + 30px)!important}
.school[data-wide][data-view3=site][data-lecture=playing][data-step=board] .v3-work{display:none!important}   /* 판서 강의 중엔 숨김, 문제 단계는 읽어 주는 동안에도 보기 보임 */
.school[data-wide][data-view3=site][data-mode=classroom] .v3-work{flex:0 1 auto!important;max-height:none!important;min-height:0!important}
/* 아래: 대화 기록 서랍 + 버튼 한 줄 */
.school[data-wide][data-view3=site][data-mode=classroom] #dialogue{position:relative;overflow:visible!important;z-index:15}   /* 서랍이 위로 뜨게(overflow:auto 가 잘랐다) */
.school[data-wide][data-view3=site][data-mode=classroom] #room{justify-content:center}
.school[data-wide][data-view3=site][data-mode=classroom] #dialogue .v3-log,.school[data-wide][data-view3=site][data-mode=classroom] #dialogue .v3-chat{display:none!important}
.school[data-wide][data-view3=site][data-log=open][data-mode=classroom] #dialogue .v3-log{display:flex!important;position:absolute;left:0;right:0;bottom:calc(100% + 8px);max-height:min(46dvh,420px);overflow:auto;z-index:20;
  background:#fff;border-radius:16px;box-shadow:0 14px 40px #0003;padding:12px 14px 70px}
.school[data-wide][data-view3=site][data-log=open][data-mode=classroom] #dialogue .v3-chat{display:flex!important;position:absolute;left:12px;right:12px;bottom:calc(100% + 18px);z-index:21}
.school[data-wide][data-view3=site] .v3-bar{flex-wrap:nowrap}
.school:not([data-view3=site]) .rw-log{display:none!important}   /* 게임 보기는 기존 대화창 그대로(오타 검수 10/9) */
.school[data-wide][data-view3=site] .v3-bar > details{display:flex;align-items:center;margin:0}
.school[data-wide][data-view3=site] .v3-bar .lc-chips{order:1;flex:0 1 auto}
.school[data-wide][data-view3=site] .v3-bar > :is(button,details){order:3}
.school[data-wide][data-view3=site] .v3-bar > :is([aria-label*="처음부터"],.v3-play,.v3-skip){order:2}
.school[data-wide][data-view3=site] .v3-bar > [aria-label*="처음부터"]{margin-left:auto}
.school[data-wide][data-view3=site] .v3-bar > .v3-skip{margin-right:auto}
.school[data-wide][data-view3=site] .v3-bar .rw-log[aria-pressed=true]{background:#e6f2ec!important;border-color:#2e6b52!important}
@media (max-width:600px){
  .school[data-wide][data-view3=site] .v3-stage #board{aspect-ratio:16/9;padding:14px 16px 12px 16px!important;border-width:7px!important;border-bottom-width:12px!important;max-height:42dvh}
  .school[data-wide][data-view3=site] .lc-intro{aspect-ratio:16/9;max-height:42dvh}
  .school[data-wide][data-view3=site] .v3-stage .teacher{display:none!important}   /* 폰은 칠판 글자를 가려서 스앵님은 대사창 이름표로만 */
  .school[data-wide][data-view3=site] .v3-stage #board{padding-right:16px!important}
  .school[data-wide][data-view3=site] .v3-bar{flex-wrap:wrap;gap:4px!important;justify-content:center}
  .school[data-wide][data-view3=site] .v3-bar > :is(button,details,summary),.school[data-wide][data-view3=site] .v3-bar > details > summary{min-width:40px!important;min-height:40px!important;width:40px;height:40px}
  .school[data-wide][data-view3=site] .v3-bar > [aria-label*="처음부터"]{margin-left:0}
  .school[data-wide][data-view3=site] .v3-bar > .v3-skip{margin-right:6px}
  .school[data-wide][data-view3=site] .v3-bar .lc-chips{order:0;flex:1 0 100%}
}
`;
const ICON_LOG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';

export function setupWideRoom(v3) {
  const school = document.querySelector('.school'); if (!school) return null;
  if (!document.getElementById('room-wide-css')) { const s = document.createElement('style'); s.id = 'room-wide-css'; s.textContent = CSS; document.head.append(s); }
  school.dataset.wide = '1';   // data-room 은 학교 공간 이름(workspace.js)이 쓰므로 따로
  const bar = document.querySelector('.v3-bar'), dialogue = document.getElementById('dialogue');
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'rw-log'; btn.innerHTML = ICON_LOG;
  btn.setAttribute('aria-label', '대화 기록·질문'); btn.setAttribute('aria-pressed', 'false'); btn.dataset.tip = '대화 기록·질문 (Q)';
  const more = bar?.querySelector('.v3-more'); if (more) bar.insertBefore(btn, more); else bar?.append(btn);
  const site = () => school.dataset.view3 === 'site';
  const set = (open) => { if (open) school.dataset.log = 'open'; else delete school.dataset.log; btn.setAttribute('aria-pressed', String(!!open)); if (open) { const log = document.getElementById('chatLog'); if (log) log.scrollTop = log.scrollHeight; } };
  btn.onclick = (e) => { e.stopPropagation(); set(school.dataset.log !== 'open'); if (school.dataset.log === 'open') document.getElementById('chatInput')?.focus(); };
  // 바깥을 누르면 닫힘(팝업 규칙). 서랍·입력·버튼 안은 제외
  document.addEventListener('pointerdown', (e) => {
    if (school.dataset.log !== 'open') return;
    if (e.target.closest('#chatLog, .v3-chat, .rw-log')) return;
    set(false);
  }, true);
  // Esc 로 닫으면 키보드 초점을 💬 버튼으로 돌려준다(오타 검수 10/9). 서랍이 먼저 닫히고 다른 Esc 처리(일어나기 등)는 이번엔 안 함
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && school.dataset.log === 'open') { set(false); btn.focus(); e.stopPropagation(); } }, true);
  // 게임 보기로 바뀌면 서랍 상태를 지운다(게임 보기는 기존 대화창)
  new MutationObserver(() => { if (!site() && school.dataset.log) set(false); }).observe(school, { attributes: true, attributeFilter: ['data-view3'] });
  // Q(말하기)는 서랍을 열고 입력 칸으로
  if (v3 && typeof v3.focusChat === 'function') { const f = v3.focusChat; v3.focusChat = () => { if (site()) set(true); f(); }; }
  return { open: () => set(true), close: () => set(false), get el() { return btn; }, dialogue };
}
