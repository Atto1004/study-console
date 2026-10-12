// ALiVEWEEK 「지금 위치」 GPS 칩(대표님 10/12 추가 E). 1단계: 서버가 이미 가진 위치(GET /api/location: 좌표 없이 장소·정확도·시각)를 칩으로 보이고,
// 「지금 위치 갱신」 버튼을 눌렀을 때만 브라우저 위치를 받아 POST /api/location {src:'study'} 로 보낸다. GPS 는 제안일 뿐 위치 기록(v60.place)에 자동으로 쓰지 않는다
// (대표님 규칙 「위치 = 타임라인 + 대표님 말」). 좌표는 이 모듈 안에서 잠깐 쓰고 화면·상태·로그에 남기지 않는다(이동 판정용 직전 점은 메모리에만).
export const FRESH_MIN = 15;          // 이 안쪽이면 「GPS · 장소 · N분 전」, 넘으면 「GPS 오래됨」
export const LOW_ACC_M = 500;         // 이보다 정확도가 나쁘면 장소를 제안하지 않는다
export const AUTO_MIN = 5;            // 자동 갱신 간격(분) — 화면이 보이는 동안만
export const STILL_M = 60, STILL_MIN = 3;   // 이 거리 안쪽에서 이 시간 이상 멈춰 있으면 「멈춰 있어요」(도착 제안 보조)

export function ageText(min) {
  min = Math.max(0, Math.round(min));
  if (min < 1) return '방금'; if (min < 60) return `${min}분 전`;
  const h = Math.floor(min / 60), m = min % 60; if (h < 24) return m ? `${h}시간 ${m}분 전` : `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}
// last = GET /api/location 의 last({ts(초),acc,place,fresh}) 또는 null. 상태: off(기록 없음) · fresh · stale · lowacc
export function describeFix(last, nowMs = Date.now()) {
  if (!last || !Number.isFinite(last.ts)) return { state: 'off', text: 'GPS 꺼짐', place: '', ageMin: null };
  const ageMin = Math.max(0, (nowMs - last.ts * 1000) / 60000), age = ageText(ageMin), place = String(last.place || '').trim(), acc = Number(last.acc) || 0;
  if (ageMin > FRESH_MIN) return { state: 'stale', text: `GPS 오래됨 · ${age}`, place, ageMin };
  if (acc > LOW_ACC_M) return { state: 'lowacc', text: `GPS · 정확도 낮음 · ${age}`, place: '', ageMin };
  return { state: 'fresh', text: `GPS · ${place ? place + ' 근처' : '장소 모름'} · ${age}`, place, ageMin };
}
// GPS 가 알려 준 장소 이름이 기존 위치 버튼 이름과 같으면(또는 그 이름을 포함하면) 그 버튼을 「GPS 제안」으로. 신선하고 정확할 때만
export function suggestPlace(desc, buttons) {
  if (!desc || desc.state !== 'fresh' || !desc.place) return '';
  const p = desc.place.replace(/\s+/g, ''); return buttons.find((b) => b && b !== '이동 중' && (p === b || p.includes(b))) || '';
}
const rad = (d) => (d * Math.PI) / 180;
export function metersBetween(a, b) {
  const R = 6371000, dLa = rad(b.la - a.la), dLo = rad(b.lo - a.lo), x = Math.sin(dLa / 2) ** 2 + Math.cos(rad(a.la)) * Math.cos(rad(b.la)) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}
// 메모리에만 두는 최근 점들(좌표는 저장·표시하지 않는다): 두 점이 STILL_MIN 분 이상 떨어져 있고 둘 다 정확하며 STILL_M 안쪽이면 멈춰 있는 것
export function stillNow(points, nowMs = Date.now()) {
  const ok = points.filter((p) => nowMs - p.t <= 20 * 60000 && p.acc <= 150); if (ok.length < 2) return false;
  const last = ok[ok.length - 1], prev = [...ok].reverse().find((p) => last.t - p.t >= STILL_MIN * 60000); if (!prev) return false;
  return ok.filter((p) => p.t >= prev.t).every((p) => metersBetween(p, last) <= STILL_M);
}
const ERR = { 1: 'denied', 2: 'unavailable', 3: 'timeout' };
// 브라우저 위치 한 번. 권한 요청은 이 함수를 부른 때(= 버튼을 누른 때)만 일어난다
export function getPosition(geo, timeout = 15000) {
  return new Promise((resolve, reject) => {
    if (!geo?.getCurrentPosition) { reject(Object.assign(new Error('unsupported'), { kind: 'unsupported' })); return; }
    geo.getCurrentPosition((p) => resolve({ la: p.coords.latitude, lo: p.coords.longitude, acc: Math.round(p.coords.accuracy || 0) }), (e) => reject(Object.assign(new Error(e?.message || 'geo'), { kind: ERR[e?.code] || 'unavailable' })), { enableHighAccuracy: true, timeout, maximumAge: 30000 });
  });
}
export async function fetchLast(fetchFn = fetch) {
  const r = await fetchFn('/api/location', { credentials: 'same-origin', cache: 'no-store' }); if (!r.ok) throw new Error('last ' + r.status);
  const j = await r.json(); return j?.last || null;
}
export async function postFix(pos, fetchFn = fetch) {
  const r = await fetchFn('/api/location', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lat: pos.la, lon: pos.lo, acc: pos.acc, src: 'study' }) });
  if (!r.ok) throw Object.assign(new Error('post ' + r.status), { kind: 'server' }); return r.json().catch(() => ({}));
}
export const secureOk = (w = globalThis) => w.isSecureContext !== false;
export const ERR_TEXT = { denied: '위치 권한이 꺼져 있어요 · 설정에서 허용해요', unavailable: '위치를 잡지 못했어요 · 다시 눌러요', timeout: '위치를 잡지 못했어요(시간 초과) · 다시 눌러요', unsupported: '이 화면은 위치를 지원하지 않아요', server: '서버에 위치를 보내지 못했어요 · 다시 눌러요' };
