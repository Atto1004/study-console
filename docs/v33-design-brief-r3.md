# V33 설계 3차 — 2차 잔여 1건(CADD 영상 생산·조회 위치) 수정 (2026-09-16)
- `_영상정리`는 **공통 폴더에 넣지 않는다**(템플릿·스크립트만 있는 작업 폴더, 계속 SKIP). 
- CADD 영상 정리 산출물은 **날짜 폴더**에 둔다: `CADD/<수업일 화요일 YYYY-MM-DD>/영상정리_<주차>_<제목>.md` (LMS 업로드일이 월요일이지만 회차 = 화요일 수업일로 통일 — 지침 §10에 명시). classify `영상정리_*` → `lmsvideo`. 그러면 `items`에 `date`가 붙어 `V32.LIBMAP`·`LIB.items`에서 그 회차/그 주로 조회된다. 수정시각은 쓰지 않는다.
- 앱 판정 `V33.weeklyState(c,date)`: `LIB.items` 중 course=CADD, (type==="lmsvideo" || /영상정리/.test(file)), **weekOf(item.date)===weekOf(date)** 인 개수. LIB 없음 → unknown.
- 구현 방식 정정: MUST 스왑 대신 **V33이 mustHTML·V32.dotsHTML을 목록 인자 버전으로 다시 정의**한다(스펙 있는 과목은 `V33.itemsFor(c)`, 없으면 `MUST`). 전역 MUST는 건드리지 않음 — 1차 권고(인자 전달)와 일치. 일반 항목은 `V32.kindState` 재사용, hw/weekly 항목은 전용 판정.
- 검증 추가: (h) CADD 가짜 items(영상정리, date=이번 주 화 vs 지난 주 화) 넣고 이번 주만 충족.
