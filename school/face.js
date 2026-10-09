// 아래 줄·상담실의 스앵님 = 강의실과 같은 그림(saeng.js, 대표님 10/9 「좌측 하단 비서도 강의실 스앵님처럼」).
// 바로 기본 캐릭터(rig.js)로 보이고, 그림을 다 받으면 그림으로 바꾼다. 못 받으면 기본 캐릭터 그대로.
// 부르는 쪽은 rig 와 같은 이름(setExpr·speak·react·destroy)만 쓰면 되고, 표정 이름 차이는 여기서 맞춘다.
import { createRig } from './rig.js';
import { attachSaeng } from './saeng.js';

const TO_SAENG = { neutral: 'neutral', smile: 'smile', laugh: 'praise', think: 'neutral', serious: 'strict', surprise: 'surprise', sad: 'smile' };

export function createFace(host, opts = {}) {
  let cur = createRig(host, opts), saeng = null, dead = false, expr = 'neutral';
  const face = {
    setExpr(x) { expr = x; if (saeng) saeng.setExpr(TO_SAENG[x] || 'neutral'); else cur.setExpr?.(x); },
    speak(t) { return saeng ? saeng.speak(String(t || '')) : cur.speak?.(t); },
    react(k) { if (saeng) saeng.react(k); else cur.react?.(k); },
    get kind() { return saeng ? 'saeng' : 'rig'; },
    destroy() { dead = true; saeng?.destroy(); cur?.destroy?.(); },
  };
  attachSaeng(host, opts.dir ? { dir: opts.dir } : undefined).then((s) => {
    if (!s) return;   // 그림 못 받음 → 기본 캐릭터 유지(attachSaeng 은 실패 시 자리를 건드리지 않음)
    if (dead || !host.isConnected) { s.destroy(); return; }
    cur.destroy?.(); cur = null; saeng = s; host.append(s.el); host.dataset.face = 'saeng';
    s.setExpr(TO_SAENG[expr] || 'neutral');
  });
  return face;
}
