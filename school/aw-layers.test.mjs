// 레이어 순수 부분 검사: 분류 규칙·사용자 지정·운선 가림·보이기 필터·저장 변경(동시 수정·재적용)·옛 데이터 호환·영업시간 조회
// 실행: node school/aw-layers.test.mjs
import assert from 'node:assert/strict';
import { BASE, layerModel, classify, blockKeys, labelOf, filterBlocks, showBlock, tally, LM, layerHoursAt, legacyPlaces, adBlock, isSecret } from './aw-layers.js';

const M0 = layerModel(undefined);
const cal = (title, color, id = 'e1', extra = {}, rec) => ({ k: 'cal', title, ev: { id, title, color, start: '10:00', end: '11:00', ...(rec ? { recurringEventId: rec } : {}) }, date: '2026-10-12', ...extra });
const plan = (bk, note, id = 'p1') => ({ k: 'plan', title: note, plan: { id, bk, note, date: '2026-10-12', s: '10:00', e: '11:00' }, date: '2026-10-12' });
const id = (b, M = M0) => classify(b, M).id;

// 기본 12개, 수입·지출만 꺼짐
assert.deepEqual(M0.items.map((x) => x.name), ['운동', '병원', '동아리', '수업', '노동', '수입', '지출', '수면', '할 일', '마감', '약속', '기타']);
assert.deepEqual(M0.items.filter((x) => !x.vis).map((x) => x.id), ['income', 'expense']);

// 종류 규칙
assert.equal(id({ k: 'sleep', title: '수면' }), 'sleep');
assert.equal(id({ k: 'exam', title: '시험 · 정역학', date: '2026-10-19' }), 'deadline');
assert.equal(id({ k: 'class', title: '정역학 수업', cls: { courseId: 'c1' }, date: '2026-10-12' }), 'class');
assert.equal(id({ k: 'auto', title: '정역학 · 12.3 연습문제' }), 'todo');
assert.equal(classify({ k: 'auto', title: '정역학 · 과제 3' }, M0).sub, '과제');
assert.equal(id(plan('공부', '12.3 연습문제')), 'todo');
assert.equal(id(plan('과제', 'HW')), 'todo');
assert.equal(id(plan(undefined, '아무 말')), 'todo', '미확정 계획(bk 없음) = 공부 계획');
assert.equal(id(plan('고정', '병원 예약')), 'hospital');
assert.equal(id(plan('고정', '친구 저녁')), 'appt', '고정 일정 기본 = 약속');
// 이동·준비·밥: 기타의 알고 있는 세부 태그(분류 불명이 아님)
for (const [bk, sub] of [['이동', '이동'], ['준비', '준비'], ['밥', '식사']]) { const c = classify(plan(bk, bk === '이동' ? '병원 → 집' : '아침'), M0); assert.deepEqual([c.id, c.sub, c.why], ['etc', sub, 'kind'], bk); }
assert.equal(classify(cal('아무 이동', '1'), M0).sub, '이동', '캘린더 색 1 = 이동');
assert.equal(id(plan('이동', '병원 가는 길')), 'etc', '이동 계획은 제목에 병원이 있어도 병원 아님');
// 사용자 레이어에 @이동 키워드를 주면 이동·준비·식사가 그리로 간다
{ const s = { layers: undefined }; LM.add(s, 'uLife', '생활', '#112233'); LM.patch(s, 'uLife', { kw: '@이동,@준비,@밥' }); const M = layerModel(s.layers); assert.equal(id(plan('이동', 'a → b'), M), 'uLife'); assert.equal(id(plan('밥', '점심'), M), 'uLife'); }

// 키워드·색 (실제 캘린더 제목)
const T = [
  ['미분적분학2', '9', 'class', 'color'], ['CADD', '9', 'class', 'color'], ['[휴강] 공업수학1', '9', 'class', null], ['7주차', '9', 'class', null],
  ['근로장학', '6', 'labor', null], ['입학처 근로', '', 'labor', 'kw'], ['국가근로 월급날', '8', 'income', 'kw'], ['파쓰쿠찌 마지막 월급날', '8', 'income', 'kw'],
  ['주거급여[+30만원]', '8', 'income', 'kw'], ['월세지원금 20만원', '', 'income', 'kw'], ['정역학 중간고사 (ch.3-5)', '11', 'deadline', 'kw'], ['미분적분학2 중간고사', '', 'deadline', 'kw'],
  ['일반물리학2 중간고사', '', 'deadline', 'kw'], ['서빈 청모', '2', 'appt', 'color'], ['애스크톤 본선 준비 워크숍', '', 'etc', 'fallback'],
  ['헬스 하체', '', 'exercise', 'kw'], ['벗히얼 크로스핏', '10', 'exercise', 'kw'], ['강남피부과 광선치료', '10', 'hospital', 'kw'], ['스노우 레이저제모', '', 'hospital', 'kw'], ['새론마음의원', '10', 'hospital', 'kw'],
  ['장학금 신청 마감', '', 'deadline', 'kw'], ['장학금 신청', '', 'todo', 'kw'], ['PPT 발표 준비', '', 'etc', 'fallback'], ['PT 30분', '', 'exercise', 'kw'], ['월세 납부', '8', 'expense', 'kw'], ['수상한 돈 일정', '8', 'etc', 'fallback'],
  ['건강 챙기기', '10', 'etc', 'fallback'], ['창업 미팅', '3', 'appt', 'kw'], ['동아리 회의', '', 'club', 'kw'],
];
for (const [t, col, want, why] of T) { const c = classify(cal(t, col), M0); assert.equal(c.id, want, `${t}(${col}) → ${c.id}/${c.why}`); if (why) assert.equal(c.why, why, `${t} why`); }
assert.equal(classify(cal('스노우 레이저제모', ''), M0).sub, '피부과 · 레이저 제모');
assert.equal(classify(cal('강남피부과 광선치료', '10'), M0).sub, '피부과 · 아토피');
assert.equal(classify(cal('벗히얼 크로스핏', ''), M0).sub, '크로스핏');
assert.equal(classify(cal('국가근로 월급날', '8'), M0).sub, '고정');

// 기본 시간표(work)
assert.equal(id({ k: 'work', title: '근로장학', routine: { id: 'r1', kind: '근무' } }), 'labor');
assert.equal(id({ k: 'work', title: '일반물리학2', routine: { id: 'r4', kind: '수업' } }), 'class', 'routine kind 수업');
assert.equal(id({ k: 'work', title: '헬스', routine: { id: 'r2', kind: '근무' } }), 'exercise', '키워드가 kind 보다 먼저');
assert.equal(classify({ k: 'work', title: '알 수 없는 루틴', routine: { id: 'r3' } }, M0).why, 'fallback', 'kind 도 없으면 분류 불명');

// 운선: 제목을 읽지 않고 약속 고정, 지정·키워드·색 무시, 키에 제목 없음, 표시는 개인 일정
{
  const b = cal('개인 일정', '10', 'sec1', { ev: { id: 'sec1', title: '운선 헬스 모임', color: '10' } });
  assert.ok(isSecret(b)); assert.equal(labelOf(b), '개인 일정');
  const s = { layers: undefined }; assert.equal(LM.assign(s, 'cal:sec1', 'exercise'), true, '키 자체는 일반 문자열이라 막지 않아도');
  assert.deepEqual([classify(b, layerModel(s.layers)).id, classify(b, layerModel(s.layers)).why], ['appt', 'secret'], '지정이 있어도 약속');
  assert.equal(blockKeys(b).inst, null); assert.equal(blockKeys(b).series, null);
  const p = plan('고정', '운선 병원'); assert.equal(id(p), 'appt'); assert.equal(labelOf(p), '개인 일정');
  assert.equal(LM.assign({}, '운선 비밀', 'exercise'), false, '운선으로 시작하는 키는 저장하지 않음');
  const ad = adBlock({ kind: 'cal', ev: { id: 'x', title: '운선 모임', allDay: true }, title: '개인 일정', from: '2026-10-12' }); assert.equal(id(ad), 'appt');
  const s2 = { layers: undefined }; LM.add(s2, 'u1', '새', '#000000'); LM.patch(s2, 'u1', { kw: '운선,헬스' }); assert.equal(id(b, layerModel(s2.layers)), 'appt', '사용자 키워드에도 안 걸림');
}

// 사용자 지정: 이 날만 > 같은 반복 모두 > 자동
{
  const b = cal('미분적분학2', '9', 'ev9_20261012T000000Z', {}, 'ev9'), keys = blockKeys(b);
  assert.deepEqual(keys, { series: 'cal:ev9', inst: 'cal:ev9_20261012T000000Z' });
  assert.deepEqual(blockKeys(cal('단발', '', 'solo1')), { series: null, inst: 'cal:solo1' }, '반복이 아니면 회차 키만');
  const s = { layers: undefined };
  assert.equal(LM.assign(s, keys.series, 'club'), true); assert.equal(id(b, layerModel(s.layers)), 'club');
  assert.equal(LM.assign(s, keys.inst, 'appt'), true); assert.equal(id(b, layerModel(s.layers)), 'appt', '이 날만이 반복 전체보다 먼저');
  assert.equal(id({ ...b, ev: { ...b.ev, id: 'ev9_20261019T000000Z' }, date: '2026-10-19' }, layerModel(s.layers)), 'club', '다른 회차는 반복 전체 지정');
  LM.assign(s, keys.inst, null); assert.equal(id(b, layerModel(s.layers)), 'club');
  LM.assign(s, keys.series, null); assert.equal(id(b, layerModel(s.layers)), 'class');
  assert.equal(LM.assign(s, keys.series, 'nope'), false, '없는 레이어로는 지정 안 함');
  assert.deepEqual(blockKeys({ k: 'sleep' }), { series: null, inst: null }); assert.equal(blockKeys({ k: 'auto', title: 'x' }).inst, null);
  assert.equal(blockKeys(plan('공부', 'x', 'pp')).inst, 'plan:pp');
  assert.equal(blockKeys({ k: 'exam', title: '시험 · 정역학', date: '2026-10-19' }).inst, 'exam:2026-10-19|시험 · 정역학');
}

// 보이기 필터·최소 1개·모두 보기·이것만
{
  const s = { layers: undefined }, blocks = [cal('미분적분학2', '9'), cal('근로장학', '6', 'e2'), cal('국가근로 월급날', '8', 'e3'), { k: 'sleep', title: '수면' }];
  assert.deepEqual(filterBlocks(blocks, layerModel(s.layers)).map((b) => b.title), ['미분적분학2', '근로장학', '수면'], '수입 기본 꺼짐');
  assert.equal(LM.setVis(s, 'labor', false), true); assert.deepEqual(filterBlocks(blocks, layerModel(s.layers)).map((b) => b.title), ['미분적분학2', '수면']);
  assert.equal(LM.setVis(s, 'labor', true), true);
  LM.only(s, 'class'); assert.deepEqual(filterBlocks(blocks, layerModel(s.layers)).map((b) => b.title), ['미분적분학2']);
  assert.equal(LM.setVis(s, 'class', false), false, '마지막 하나는 못 끔'); assert.equal(layerModel(s.layers).byId.class.vis, true);
  LM.showAll(s); assert.equal(layerModel(s.layers).items.every((x) => x.vis), true);
}

// 세어 보기 + 분류 불명
{
  const t = tally([cal('미분적분학2', '9'), cal('애스크톤 본선 준비 워크숍', ''), plan('이동', 'a → b'), plan('밥', '점심')], M0);
  assert.equal(t.byId.class.n, 1); assert.equal(t.byId.etc.n, 3); assert.equal(t.unknown, 1, '이동·식사는 알고 기타에 둔 것, 분류 불명은 1');
  assert.deepEqual(t.byId.etc.subs, { 이동: 1, 식사: 1 });
}

// 저장 변경: 최신 상태에서 해당 필드만, 재적용해도 같은 결과, 동시 수정이 서로 안 지움
{
  const server = { layers: undefined };
  const a = (s) => { LM.setVis(s, 'exercise', false); }, b = (s) => { LM.patch(s, 'exercise', { name: '몸 쓰기' }); }, c = (s) => { LM.add(s, 'uX', '내 레이어', '#abcdef'); };
  const deviceA = JSON.parse(JSON.stringify(server)), deviceB = JSON.parse(JSON.stringify(server));
  a(deviceA); b(deviceB);                 // 서로 모르는 두 기기
  const merged = JSON.parse(JSON.stringify(deviceA)); b(merged); c(merged);   // 409 뒤 최신(A 결과) 위에 B 의 mutate 재적용
  const M = layerModel(merged.layers); assert.equal(M.byId.exercise.vis, false, 'A 의 보이기 보존'); assert.equal(M.byId.exercise.name, '몸 쓰기', 'B 의 이름 반영');
  const again = JSON.parse(JSON.stringify(merged)); a(again); b(again); c(again); assert.deepEqual(layerModel(again.layers).items.map((x) => [x.id, x.name, x.vis]), M.items.map((x) => [x.id, x.name, x.vis]), '재적용해도 같음(추가 id 도 중복 안 됨)');
  assert.equal(M.items.filter((x) => x.id === 'uX').length, 1);
  // 삭제 + 늦게 온 지정
  LM.assign(merged, 'cal:e1', 'uX'); assert.equal(LM.remove(merged, 'uX'), true); assert.equal(layerModel(merged.layers).byId.uX, undefined); assert.equal(merged.layers.assign['cal:e1'], undefined, '삭제하면 그 지정도 정리');
  assert.equal(LM.assign(merged, 'cal:e2', 'uX'), false, '지운 레이어로 늦게 온 지정은 거부'); assert.equal(LM.add(merged, 'uX', '되살리기', '#000000'), false, '같은 id 로 되살리지 않음');
  assert.equal(LM.remove(merged, 'exercise'), false, '기본 레이어는 못 지움');
  assert.equal(id(cal('x', '', 'e1'), layerModel({ items: [], assign: { 'cal:e1': 'ghost' } })), 'etc', '이미 없는 레이어를 가리키는 지정은 무시');
  // 비운 값이 기본값에 먹히지 않음
  LM.patch(merged, 'club', { kw: '' }); assert.equal(layerModel(merged.layers).byId.club.kw, ''); assert.equal(classify(cal('동아리 회의', ''), layerModel(merged.layers)).id, 'etc');
  LM.reset(merged, 'club'); assert.equal(layerModel(merged.layers).byId.club.kw, '동아리');
  LM.move(merged, 'sleep', 0); assert.equal(layerModel(merged.layers).items[0].id, 'sleep');
  assert.equal(LM.patch(merged, 'club', { name: '   ' }) && layerModel(merged.layers).byId.club.name, '동아리', '빈 이름은 무시');
  assert.equal(LM.patch(merged, 'club', { color: 'red' }) && layerModel(merged.layers).byId.club.color, '#8e5bd1', '이상한 색은 무시');
}

// 옛 데이터 호환: layers 가 없거나 이상해도 기본값으로 읽고 아무것도 쓰지 않음
for (const bad of [undefined, null, 5, 'x', [], {}, { items: 'x', assign: 3, places: [] }, { items: [null, 1, {}, { id: 5 }] }]) { const M = layerModel(bad); assert.equal(M.items.length, 12); assert.equal(id(cal('근로장학', '6'), M), 'labor'); }
{ const old = { est: {}, extra: [] }; layerModel(old.layers); assert.deepEqual(old, { est: {}, extra: [] }, '읽기만 하면 v60 에 layers 를 만들지 않음'); }

// 영업시간
{
  const api = [
    { id: 'gym-crossfit', name: '벗히얼 크로스핏', type: 'place', policy: '운동', detail: { hours: { 월: ['07:10', '24:00'], 화: ['07:10', '24:00'], 수: ['07:10', '24:00'], 목: ['07:10', '24:00'], 금: ['07:10', '24:00'], 토: ['09:00', '21:00'], 일: null }, classes: { 월: ['07:10', '10:00', '17:00'], 수: 'OPEN GYM', 일: null } } },
    { id: 'psy-saeron', name: '새론마음의원', type: 'place', policy: '진료', detail: { hours: { 월: ['10:00', '16:30'], 화: ['12:00', '19:30'], 수: null }, break: ['12:30', '13:20'], classes: {} } },
    { id: 'clinic-calc2', name: '미적분 클리닉', type: 'place', policy: '공부', detail: { hours: { 월: ['16:00', '18:00'] } } },
    { id: 'money', name: '재무', type: 'money', policy: '재무', detail: {} },
  ];
  const lg = legacyPlaces(api); assert.deepEqual(lg.map((p) => [p.id, p.layer]), [['legacy:gym-crossfit', 'exercise'], ['legacy:psy-saeron', 'hospital'], ['legacy:clinic-calc2', 'todo']]);
  const mon = layerHoursAt(M0, lg, 'exercise', '2026-10-12');   // 월요일
  assert.deepEqual(mon[0].ranges, [[430, 1440]]); assert.deepEqual(mon[0].classes, [430, 600, 1020]); assert.equal(mon[0].status, 'open'); assert.equal(mon[0].src, 'layers.json');
  const wed = layerHoursAt(M0, lg, 'exercise', '2026-10-14'); assert.equal(wed[0].openGym, true); assert.equal(wed[0].classes, null);
  assert.equal(layerHoursAt(M0, lg, 'exercise', '2026-10-18')[0].status, 'closed', '일요일 휴무');
  const hosp = layerHoursAt(M0, lg, 'hospital', '2026-10-12')[0]; assert.deepEqual(hosp.ranges, [[600, 750], [800, 990]]);
  assert.deepEqual(layerHoursAt(M0, null, 'exercise', '2026-10-12'), [], '시드를 못 불러왔으면 장소가 아예 안 나옴(휴무로 단정 안 함)');
  // 덮어쓰기(완전), 시드로 되돌리기, 장소 빼기, 새 장소, 여러 구간 병합
  const s = { layers: undefined };
  LM.setPlace(s, 'legacy:gym-crossfit', { layer: 'exercise', name: '벗히얼 크로스핏', week: { 월: [['06:00', '08:00'], ['07:30', '09:00'], ['18:00', '22:00']] } }, '2026-10-12T20:00');
  const o = layerHoursAt(layerModel(s.layers), lg, 'exercise', '2026-10-12')[0]; assert.deepEqual(o.ranges, [[360, 540], [1080, 1320]]); assert.equal(o.src, 'app'); assert.equal(o.classes, null, '덮어쓰면 옛 수업 시각도 사라짐(완전 덮어쓰기)'); assert.equal(o.at, '2026-10-12T20:00');
  LM.delPlace(s, 'legacy:gym-crossfit', false); assert.equal(layerHoursAt(layerModel(s.layers), lg, 'exercise', '2026-10-12')[0].src, 'layers.json');
  LM.delPlace(s, 'legacy:gym-crossfit', true); assert.equal(layerHoursAt(layerModel(s.layers), lg, 'exercise', '2026-10-12').length, 0);
  LM.setPlace(s, 'app:z1', { layer: 'exercise', name: '동네 헬스', week: { 월: [['06:00', '23:00']], 토: [] }, classes: { 월: ['19:00'] } }); const z = layerHoursAt(layerModel(s.layers), lg, 'exercise', '2026-10-12'); assert.deepEqual(z.map((x) => x.place), ['동네 헬스']); assert.deepEqual(z[0].ranges, [[360, 1380]]); assert.deepEqual(z[0].classes, [1140]);
  assert.equal(layerHoursAt(layerModel(s.layers), lg, 'exercise', '2026-10-17')[0].status, 'closed');
  assert.equal(LM.setPlace(s, 'app:z2', { layer: 'ghost', name: 'x', week: {} }), false);
  LM.add(s, 'uG', '내 운동', '#123456'); LM.setPlace(s, 'app:z3', { layer: 'uG', name: '집', week: {} }); LM.remove(s, 'uG'); assert.equal(s.layers.places['app:z3'], undefined, '레이어를 지우면 그 장소도 정리');
}


// 회차·반복 지정 (1차 오타 검수 2차 RED): 반복 전체를 정하면 이 회차의 예외도 풀리고, 자동으로 되돌리면 자동 분류가 됨
{
  const b = cal('미분적분학2', '9', 'ev9_20261012T000000Z', {}, 'ev9'), keys = blockKeys(b), s = { layers: undefined };
  const at = (scope, v) => LM.assignAt(s, keys, scope, v), now = () => classify(b, layerModel(s.layers));
  at('inst', 'hospital'); at('series', 'exercise'); assert.equal(now().id, 'exercise', '반복 전체를 정하면 이 회차 예외가 풀려 같이 바뀜'); assert.equal(s.layers.assign[keys.inst], undefined);
  at('series', 'labor'); at('inst', 'hospital'); at('series', null); assert.equal(now().id, 'class', '반복 전체 자동 = 반복 지정과 이 회차 예외 모두 해제'); assert.deepEqual(s.layers.assign, {});
  at('series', 'labor'); at('inst', null); assert.equal(s.layers.assign[keys.inst], '@auto'); assert.equal(now().id, 'class', '이 회차만 자동 = 반복 지정이 있어도 자동 분류');
  assert.equal(classify({ ...b, ev: { ...b.ev, id: 'ev9_20261019T000000Z' } }, layerModel(s.layers)).id, 'labor', '다른 회차는 반복 지정을 따름');
  at('inst', 'club'); assert.equal(now().id, 'club'); at('inst', null); assert.equal(now().id, 'class'); at('series', null); at('inst', null); assert.deepEqual(s.layers.assign, {}, '반복 지정이 없으면 이 회차 자동은 아무 표식도 안 남김');
  const one = cal('단발', '', 'solo9'), k1 = blockKeys(one); LM.assignAt(s, k1, 'series', 'appt'); assert.equal(s.layers.assign['cal:solo9'], 'appt', '반복이 아니면 회차 키로');
  assert.equal(LM.assignAt(s, keys, 'inst', 'ghost'), false); assert.equal(LM.assign(s, '제목만 키', 'club'), false, '키 형식 검사'); assert.equal(LM.assign(s, 'cal:운선x', 'club'), false);
}
// 마지막 보이는 레이어는 지우기로도 못 숨김
{
  const s = { layers: undefined }; LM.add(s, 'uZ', '내', '#112233'); LM.only(s, 'uZ');
  assert.equal(LM.remove(s, 'uZ'), false, '보이는 게 이것뿐이면 못 지움'); assert.equal(layerModel(s.layers).byId.uZ.vis, true);
  LM.showAll(s); assert.equal(LM.remove(s, 'uZ'), true); assert.ok(layerModel(s.layers).items.some((x) => x.vis));
}
// 수입 판정(금액이 붙은 지원금·장학금만, 마감·신청이 먼저, 수입 키워드를 비우면 규칙도 없음)
for (const [t, want] of [['장학금[신청 마감]', 'deadline'], ['지원금 2차 신청 마감', 'deadline'], ['장학금 20만원 신청 마감', 'deadline'], ['장학금 20만원', 'income'], ['월세지원금 20만원', 'income'], ['지원금 신청', 'todo'], ['장학금 1,200,000원 입금', 'income']]) assert.equal(id(cal(t, ''), M0), want, t);
{ const s = { layers: undefined }; LM.patch(s, 'income', { kw: '' }); assert.notEqual(id(cal('장학금 20만원', ''), layerModel(s.layers)), 'income', '수입 키워드를 비우면 금액 규칙도 꺼짐'); }
{ const s = { layers: undefined }; LM.add(s, 'uK', '장학', '#abcdef'); LM.patch(s, 'uK', { kw: '장학금' }); assert.equal(id(cal('장학금 20만원', ''), layerModel(s.layers)), 'uK', '사용자 키워드가 먼저'); }

console.log('aw-layers ok');
