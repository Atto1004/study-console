// aw-gps 순수 계산 검사. 실행: node school/aw-gps.test.mjs
import assert from 'node:assert/strict';
import { ageText, describeFix, suggestPlace, metersBetween, stillNow, getPosition, fetchLast, postFix, secureOk, FRESH_MIN } from './aw-gps.js';
assert.equal(ageText(0.2), '방금'); assert.equal(ageText(3), '3분 전'); assert.equal(ageText(41), '41분 전'); assert.equal(ageText(135), '2시간 15분 전'); assert.equal(ageText(180), '3시간 전'); assert.equal(ageText(60 * 50), '2일 전');
const now = Date.parse('2026-10-12T05:00:00Z'), ts = (minAgo) => (now - minAgo * 60000) / 1000;
assert.deepEqual(describeFix(null, now), { state: 'off', text: 'GPS 꺼짐', place: '', ageMin: null });
let d = describeFix({ ts: ts(3), acc: 30, place: '학교', fresh: true }, now); assert.equal(d.state, 'fresh'); assert.equal(d.text, 'GPS · 학교 근처 · 3분 전');
d = describeFix({ ts: ts(41), acc: 30, place: '학교' }, now); assert.equal(d.state, 'stale'); assert.equal(d.text, 'GPS 오래됨 · 41분 전');
d = describeFix({ ts: ts(3), acc: 900, place: '학교' }, now); assert.equal(d.state, 'lowacc'); assert.match(d.text, /정확도 낮음/); assert.equal(d.place, '', '정확도 낮으면 장소를 내놓지 않음');
d = describeFix({ ts: ts(FRESH_MIN + 1), acc: 10, place: '안산' }, now); assert.equal(d.state, 'stale');
d = describeFix({ ts: ts(1), acc: 10, place: '' }, now); assert.match(d.text, /장소 모름/);
// 제안: 정확·신선할 때만, 버튼 이름과 같거나 포함할 때
const B = ['집', '학교', '도서관', '카페', '이동 중'];
assert.equal(suggestPlace(describeFix({ ts: ts(1), acc: 20, place: '학교' }, now), B), '학교'); assert.equal(suggestPlace(describeFix({ ts: ts(1), acc: 20, place: '한양 도서관' }, now), B), '도서관');
assert.equal(suggestPlace(describeFix({ ts: ts(1), acc: 20, place: '사동' }, now), B), ''); assert.equal(suggestPlace(describeFix({ ts: ts(1), acc: 800, place: '학교' }, now), B), ''); assert.equal(suggestPlace(describeFix({ ts: ts(60), acc: 20, place: '학교' }, now), B), '');
assert.equal(suggestPlace(describeFix({ ts: ts(1), acc: 20, place: '이동 중' }, now), B), '', '이동 중은 제안하지 않음');
// 거리·멈춤 판정(메모리 점만)
assert.ok(Math.abs(metersBetween({ la: 37.3, lo: 126.8 }, { la: 37.3009, lo: 126.8 }) - 100) < 3);
const P = (min, la, lo, acc = 20) => ({ t: now - min * 60000, la, lo, acc });
assert.equal(stillNow([P(8, 37.3, 126.8), P(4, 37.30001, 126.8), P(0, 37.30002, 126.8)], now), true);
assert.equal(stillNow([P(8, 37.3, 126.8), P(0, 37.302, 126.8)], now), false, '움직임');
assert.equal(stillNow([P(1, 37.3, 126.8), P(0, 37.3, 126.8)], now), false, '3분 미만은 모름');
assert.equal(stillNow([P(8, 37.3, 126.8, 400), P(0, 37.3, 126.8, 400)], now), false, '정확도 낮으면 판정 안 함'); assert.equal(stillNow([], now), false);
// 위치 받기·서버 통신(가짜)
const geo = (ok) => ({ getCurrentPosition: (res, rej) => ok ? res({ coords: { latitude: 37.3, longitude: 126.8, accuracy: 12.4 } }) : rej({ code: 1, message: 'x' }) });
assert.deepEqual(await getPosition(geo(true)), { la: 37.3, lo: 126.8, acc: 12 });
await assert.rejects(getPosition(geo(false)), (e) => e.kind === 'denied'); await assert.rejects(getPosition(null), (e) => e.kind === 'unsupported');
let sent = null; const fx = async (u, o) => { sent = { u, o }; return { ok: true, json: async () => ({ ok: true, place: '안산' }) }; };
const res = await postFix({ la: 37.3, lo: 126.8, acc: 12 }, fx); assert.equal(sent.u, '/api/location'); assert.equal(sent.o.method, 'POST'); assert.deepEqual(JSON.parse(sent.o.body), { lat: 37.3, lon: 126.8, acc: 12, src: 'study' }); assert.equal(res.place, '안산');
await assert.rejects(postFix({ la: 1, lo: 2, acc: 3 }, async () => ({ ok: false, status: 500 })), (e) => e.kind === 'server');
assert.deepEqual(await fetchLast(async () => ({ ok: true, json: async () => ({ ok: true, last: { ts: 1, acc: 5, place: 'x' } }) })), { ts: 1, acc: 5, place: 'x' }); assert.equal(await fetchLast(async () => ({ ok: true, json: async () => ({ ok: true, last: null }) })), null);
assert.equal(secureOk({ isSecureContext: false }), false); assert.equal(secureOk({ isSecureContext: true }), true);
console.log('aw-gps ok');
