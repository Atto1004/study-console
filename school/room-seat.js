// 교실 = 내 자리에 앉아서 본 장면(대표님 10/9 「칠판이랑 자리에 착석해서 앉은 시점으로, 처음에 만들었던 연애시뮬레이션 느낌으로」).
// 사이트 보기 교실에서만(게임 보기·다른 방은 그대로):
//   무대(.v3-stage) 배경 = 앉은 자리에서 본 교실 그림(앞에 내 책상·공책, 정면 칠판, 오른쪽 교탁)
//   칠판 글씨(#board)·입장 카드는 그림 속 칠판 자리에 정확히 얹고, 스앵님은 칠판 오른쪽 앞(교탁 앞) 상반신,
//   대사창은 화면 아래(책상 위)에 겹쳐 연애 시뮬처럼. 화면 크기마다 칠판·교탁이 다 보이게 그림을 키우고 잘라 맞춘다.
// 그림 좌표는 classroom-seat.webp(1672×941)에서 잰 비율. 좌측 과목 레일·아래 버튼 줄은 room-wide.js 그대로.
const IMG = { src: 'assets/classroom-seat.webp', w: 1672, h: 941 };   // school/index.html 기준 경로
const BOARD = { x: 0.291, y: 0.168, w: 0.521, h: 0.353 };   // 칠판 초록 면
const WIDE = { x0: 0.25, x1: 0.985, y0: 0.10, y1: 0.97 };    // 넓은 화면: 칠판 + 교탁 + 앞 책상까지
const NARROW = { x0: 0.275, x1: 0.83, y0: 0.07, y1: 1.0 };   // 좁은 화면(폰): 칠판 폭에 맞춤
const S = '.school[data-seat][data-view3=site][data-mode=classroom]';
const CSS = `
${S} #room{justify-content:flex-start!important}
${S} .v3-stage{position:relative!important;flex:1 1 0!important;min-height:240px!important;height:auto!important;overflow:hidden!important;border-radius:18px!important;
  background:#2a2018 var(--seat-img) no-repeat!important;background-size:var(--bg-w) var(--bg-h)!important;background-position:var(--bg-x) var(--bg-y)!important;
  box-shadow:0 10px 30px #2a1a0c33;display:block!important;padding:0!important;gap:0!important}
${S} .v3-stage::after{content:"";position:absolute;inset:auto 0 0 0;height:34%;background:linear-gradient(transparent,#1a120b66);pointer-events:none;z-index:1}   /* 책상 쪽을 살짝 어둡게 — 대사창 글자 대비 */
${S} .v3-stage .teaching-space{position:absolute!important;inset:0!important;width:auto!important;height:auto!important;padding:0!important;display:block!important;z-index:2}
${S} .v3-stage .teaching-space::after{display:none!important}
${S} .v3-stage #board{position:absolute!important;left:var(--bd-x);top:var(--bd-y);width:var(--bd-w);height:var(--bd-h)!important;max-height:none!important;aspect-ratio:auto!important;margin:0!important;box-sizing:border-box;
  background:#1d3a2ee6!important;border:0!important;border-radius:3px!important;box-shadow:inset 0 0 0 1px #0004,inset 0 0 40px #0003!important;
  padding:clamp(10px,2.2%,22px) var(--bd-pr) clamp(10px,2.2%,18px) clamp(12px,3%,28px)!important;overflow:auto!important;font-size:var(--bd-fs)}
${S} .v3-stage #board h1{font-size:calc(var(--bd-fs) * 1.35)!important;margin:.2em 0 .35em!important}
${S} .v3-stage #board .caption,${S} .v3-stage #board .annotation{font-size:calc(var(--bd-fs) * .78)!important}
${S} .v3-stage #board .content{font-size:var(--bd-fs)!important}
${S} .lc-intro{position:absolute!important;left:var(--bd-x)!important;top:var(--bd-y)!important;width:var(--bd-w)!important;height:var(--bd-h)!important;right:auto!important;bottom:auto!important;inset:var(--bd-y) auto auto var(--bd-x)!important;
  aspect-ratio:auto!important;max-height:none!important;box-sizing:border-box;border-radius:3px!important;padding:clamp(10px,2.4%,22px) var(--bd-pr) 12px clamp(12px,3%,28px)!important;overflow:auto;z-index:3}
${S} .v3-relisten{top:calc(var(--bd-y) + 8px)!important;right:auto!important;left:calc(var(--bd-x) + var(--bd-w) - var(--bd-pr) - 4px)!important;transform:translateX(-100%);z-index:4}
${S} .v3-stage .teacher{position:absolute!important;inset:auto!important;left:var(--t-x)!important;top:var(--t-y)!important;width:var(--t-w)!important;height:var(--t-h)!important;z-index:5;pointer-events:none;display:block!important}
${S} .v3-stage .teacher #dock,${S} .v3-stage .teacher #dockFace{width:100%!important;height:100%!important;max-width:none!important;max-height:none!important}
${S} .v3-stage .teacher #dockFace{filter:drop-shadow(0 10px 14px #0006)}
${S} .v3-stage .teacher #dockFace .saeng{width:100%!important;height:100%!important}
${S} .vn-box{position:absolute!important;z-index:6!important;left:var(--vn-l)!important;right:var(--vn-r)!important;bottom:var(--vn-b)!important;top:auto!important;margin:0!important;
  background:linear-gradient(#fffaf2f2,#f6efe2f2)!important;color:#2b2118!important;border:2px solid #c9a56b!important;border-radius:14px!important;box-shadow:0 8px 24px #0005!important}
${S} .vn-box .vn-name{background:#3a6b55!important;color:#fff!important;border-color:#c9a56b!important}
${S} .vn-box .vn-text{color:#2b2118!important}
${S} .vn-box .vn-next{border-top-color:#c9a56b!important}
`;

// 화면(W×H)에 그림을 맞추는 계산 — 보여야 할 범위(want)가 다 들어가게 가장 크게(넓은 화면), 폰은 꽉 채우고 칠판 가운데 기준으로 자름
export function fitScene(W, H, want, cover = false) {
  const vw = (want.x1 - want.x0) * IMG.w, vh = (want.y1 - want.y0) * IMG.h;
  const s = cover ? Math.max(W / vw, H / vh) : Math.min(W / vw, H / vh);   // cover = 화면을 꽉 채움(폰 세로: 칠판 가까이 앉은 시점)
  const bw = IMG.w * s, bh = IMG.h * s;
  const cx = ((want.x0 + want.x1) / 2) * bw, cy = ((want.y0 + want.y1) / 2) * bh;
  let ox = W / 2 - cx, oy = H / 2 - cy;
  ox = bw <= W ? (W - bw) / 2 : Math.min(0, Math.max(W - bw, ox));   // 그림 밖(빈 곳)이 안 보이게
  oy = bh <= H ? (H - bh) / 2 : Math.min(0, Math.max(H - bh, oy));
  return { s, bw, bh, ox, oy, at: (fx, fy) => ({ x: ox + fx * bw, y: oy + fy * bh }) };
}

export function layoutSeat(W, H, vnH0, vnHidden = false) {
  const narrow = W < 640 || W / H < 1.05;
  const vnH = vnH0 || (narrow ? 92 : 104), vnB = narrow ? 8 : 14, vnZone = vnHidden ? 8 : vnH + vnB + 8, m = narrow ? 6 : 12;
  let f = fitScene(W, H, narrow ? NARROW : WIDE, true), close = false;   // 꽉 채움(검은 띠 없음) — 칠판이 잘리면 아래 클로즈업
  const rect = (f) => { const a = f.at(BOARD.x, BOARD.y), b = f.at(BOARD.x + BOARD.w, BOARD.y + BOARD.h); return { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y }; };
  let board = rect(f);
  // 장면이 낮아져(문제·서술형 칸이 열림) 칠판이 대사창에 걸리면 → 칠판 가까이(클로즈업): 칠판이 대사창 위 빈 곳에 가장 크게 들어가게
  // 세로 화면(narrow)은 칠판 판을 화면 폭에 맞춰 얹으므로 가로로 넘치는 건 괜찮다 — 세로로 걸릴 때만
  if (board.y + board.h > H - vnZone || board.y < 0 || (!narrow && (board.x < 0 || board.x + board.w > W))) {
    close = true;
    // 배경은 늘 화면을 덮는다(오타 검수 10/9: 낮은 무대에서 그림 양옆이 비던 것) — 최소 높이(minStageH)가 칠판 폭을 지켜 줌
    const s = Math.max(Math.min((W - 2 * m) / (BOARD.w * IMG.w), (H - vnZone - 2 * m) / (BOARD.h * IMG.h)), W / IMG.w, H / IMG.h);
    const bw = IMG.w * s, bh = IMG.h * s;
    const ox = Math.min(0, Math.max(W - bw, (W - BOARD.w * bw) / 2 - BOARD.x * bw)), oy = Math.min(0, Math.max(H - bh, m - BOARD.y * bh));
    f = { s, bw, bh, ox, oy, at: (fx, fy) => ({ x: ox + fx * bw, y: oy + fy * bh }) };
    board = rect(f);
  }
  // 좁은 화면은 그림 속 칠판이 낮아 글씨가 안 들어가므로 아래(벽 판넬)로 늘린다 — 대사창·스앵님 자리는 남김
  if (narrow && !close) { const room = H - vnZone - 64 - board.y; board.h = Math.max(board.h, Math.min(room, H * 0.5)); }
  if (narrow) { board.x = Math.max(m, board.x); board.w = Math.min(W - 2 * m, board.w); }
  // 스앵님: 넓은 화면은 칠판 오른쪽 끝 앞(교탁 앞) 상반신, 좁은 화면은 칠판 아래 오른쪽(자리 없으면 대사창 이름표로만)
  let t;
  if (!narrow) { const th = Math.max(0, Math.min(H * 0.7, H - vnB - vnH * 0.45 - Math.max(8, board.y))), tw = th * 0.76; const tx = Math.min(W - tw - 6, board.x + board.w - tw * 0.42); t = { x: tx, y: H - vnB - vnH * 0.45 - th, w: tw, h: th }; }
  else { const top0 = board.y + board.h + 4, th = Math.max(0, Math.min(H * 0.42, 460, H - vnB - vnH * 0.4 - top0)), top = H - vnB - vnH * 0.4 - th, tw = th * 0.76; t = { x: W - tw - 6, y: top, w: th < 70 ? 0 : tw, h: th < 70 ? 0 : th }; }
  const overlap = narrow ? 0 : Math.max(0, board.x + board.w - t.x);   // 칠판 글씨가 스앵님에 가리지 않게 오른쪽 여백(폰은 스앵님이 칠판 아래라 안 가림)
  const fs = Math.max(13, Math.min(22, board.w / (narrow ? 24 : 34)));
  return { narrow, close, f, board, teacher: t, padRight: Math.max(narrow ? 14 : 22, overlap + 16), fs, vn: { l: narrow ? 8 : 16, r: narrow ? 8 : 16, b: vnB, h: vnH } };
}

// 무대 최소 높이: 칠판이 대사창 위에 폭 55%(폰 = 화면 폭) 이상으로 들어갈 만큼(오타 검수 10/9). 무대가 이보다 낮아지면 방이 스크롤된다
export function minStageH(W, vnH0, vnHidden = false) {
  const narrow = W < 640, vnH = vnH0 || (narrow ? 92 : 104), vnB = narrow ? 8 : 14, vnZone = vnHidden ? 8 : vnH + vnB + 8, m = narrow ? 6 : 12;
  const bw = narrow ? W - 2 * m : W * 0.58;
  return Math.max(240, Math.ceil(vnZone + 2 * m + bw * (BOARD.h * IMG.h) / (BOARD.w * IMG.w)));
}

export function setupSeatRoom() {
  const school = document.querySelector('.school'); const stage = document.querySelector('.v3-stage');
  if (!school || !stage) return null;
  if (!document.getElementById('room-seat-css')) { const s = document.createElement('style'); s.id = 'room-seat-css'; s.textContent = CSS; document.head.append(s); }
  school.dataset.seat = '1';
  stage.style.setProperty('--seat-img', `url("${IMG.src}")`);
  const px = (n) => Math.round(n) + 'px';
  function apply() {
    const W = stage.clientWidth; if (!W) return;
    const vn = stage.querySelector('.vn-box'), hid = !vn || vn.hidden || !vn.getClientRects().length, vh = hid ? 0 : vn.offsetHeight;
    const need = minStageH(W, vh, hid) + 'px'; if (stage.style.minHeight !== need) stage.style.setProperty('min-height', need, 'important');
    const H = stage.clientHeight; if (!H) return;
    const L = layoutSeat(W, H, vh, hid), v = stage.style;
    v.setProperty('--bg-w', px(L.f.bw)); v.setProperty('--bg-h', px(L.f.bh)); v.setProperty('--bg-x', px(L.f.ox)); v.setProperty('--bg-y', px(L.f.oy));
    v.setProperty('--bd-x', px(L.board.x)); v.setProperty('--bd-y', px(L.board.y)); v.setProperty('--bd-w', px(L.board.w)); v.setProperty('--bd-h', px(L.board.h));
    v.setProperty('--bd-pr', px(L.padRight)); v.setProperty('--bd-fs', px(L.fs));
    v.setProperty('--t-x', px(L.teacher.x)); v.setProperty('--t-y', px(L.teacher.y)); v.setProperty('--t-w', px(L.teacher.w)); v.setProperty('--t-h', px(L.teacher.h));
    v.setProperty('--vn-l', px(L.vn.l)); v.setProperty('--vn-r', px(L.vn.r)); v.setProperty('--vn-b', px(L.vn.b));
    stage.dataset.seatNarrow = L.narrow ? '1' : ''; stage.dataset.seatClose = L.close ? '1' : '';
  }
  let raf = 0; const later = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; apply(); }); };   // 감시 콜백 안에서 높이를 바꾸면 ResizeObserver loop 오류 → 다음 그리기로
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(later) : null; ro?.observe(stage); const vnBox = stage.querySelector('.vn-box'); if (vnBox) ro?.observe(vnBox); apply();
  return { apply, destroy() { ro?.disconnect(); delete school.dataset.seat; } };
}
