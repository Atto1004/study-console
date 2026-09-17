# V34 설계 회의 r2 — 오타 1차 RED 6건 반영 (2026-09-17)
1차 문서 `v34-design-brief.md`, 1차 판정 `_v34-otta-1.md`. 바뀐 부분만.

## 2.1′ 예습 생성 조건 (오타 1 반영)
- 판정 함수 `V34.reviewBlocked(c, mon)`: 그 과목의 **종료된 이전 회차 전체**(`sessionEnded(c,s)`이고 `s.date < mon`)를 보고, `cancelled`·`status==="absent"`·`excused` 제외(결석은 기존 ④ `makeup:` 항목이 따로 만든다) → 남은 회차 중 `!s.reviewed`가 하나라도 있으면 true. 기록이 없는 회차(`sessionOn` null)는 **미복습으로 간주**(누락=완료 아님). `review:` 항목 존재 여부는 근거로 쓰지 않는다.
- `generateWeekly` 래핑: 원본 후 `study:{cid}:{w}` 항목 중 `!done && reviewBlocked` 인 것 제거. `again` 채점도 `reviewed=true`가 되므로 "복습을 한 번 했다"로 간주(의미 명시: 완료 = 학습 마무리 채점 또는 회차 시트 「복습함」 체크).
- 재생성 트리거: `gradeReview` 래핑(원본 실행·persist 후 `generateWeekly(weeklyKey(today()))`·`persist()`) + `captureLog` 래핑(같은 처리). 해제(체크 해제)도 다음 generateWeekly에서 제거되므로 `renderTodo` 전에 `V34.pruneStudy(mon)`을 호출해 양방향 동기화.
- 주 2회 과목: 두 회차 모두 완료해야 예습 생성.

## 2.5′ 할 일 초기화 범위 (오타 2 반영)
- 대상 = **이번 주(`weeklyKey(today())`) 항목만** `items=[]` 후 `generateWeekly` 재실행. 과거 주 이력·수동 항목(`key` 없는 항목)·주차노트 `tasks`·`weeklyRules`·루틴 정의는 보존. 삭제 전 건수를 `S.patches.v34a={at, removed:n}`에 기록. 아토 지시 "할일 내용 일단 초기화"를 이 범위로 해석하고 완료 보고에 명시(더 넓게 원하면 추가 지시).

## 2.8′ 16주 목록 (오타 3 반영)
- 8주차·16주차 행에 기본 라벨 「중간고사 주간」「기말고사 주간」(term 고정). 과목 `exams(c.id)`가 있으면 **그 시험 날짜가 속한 주차**(`weekOf(e.date)`) 행에 「중간 M/D」「기말 M/D」 배지 추가(회차 일치 요구 안 함). CADD: 8주차 기본 라벨 + 10주차 배지.
- 회차 없는 주: `planned(c)`에 그 주 회차가 0이면 「수업 없음」(휴강 단정 ✗). 휴강은 `holidayOn`/`cancelled` 있을 때만 「휴강」.
- 미래 판정: 그 주 첫 회차 날짜 > 오늘 → `.fut` 회색. 이번 주 강조. 지난 주 정리 없음 → 경고색.
- `#cNotes` 교체 후 `[data-wn]`·`[data-wst]` 바인딩 재연결(과거·이번 주만 버튼).

## 2.9′ 주차표 날짜 (오타 4 반영)
- `V32.renderGrid` 래핑: 원본 후 `.v32-grid tbody tr`을 순서대로 w=1..N, `td` 열 i=0..4 → `date=addDays(weekStart(w),(i+1 - D(ws).getDay()+7)%7)`(원본 byDow와 동일식) → `td`에 `.v32-cd`가 없으면 prepend. `off`·`hol` 셀 포함. 폰 목록 모드는 이미 날짜 있음.

## 2.2′ 책등 정렬 (오타 5 반영)
- `.shelf.spine{justify-content:flex-start}` + `.shelf.spine .book:first-child{margin-inline-start:auto}` + `.shelf.spine .book:last-child{margin-inline-end:auto}`.

## 2.7′·2.6′ (오타 6 반영)
- 표지 제목 CSS 선택자 `.shelf:not(.spine) .book.hascv .bk-t{…}` 로 한정. 책등은 2.2 규칙.
- 이모지: `V32.TYPES` 배열 값 교체 + `V33.SPEC` pre/post 순회 icon 치환 + `MUST` 전역 icon 치환 + **범례(8089행)·버튼(8095·8204행)은 `V32.renderGrid` 래핑 후 DOM에서 텍스트 치환**(`.v32-legend .demo` innerHTML 재작성, `#v32Lib` 텍스트) + `V33` 규칙 카드(8204)는 카드 생성 후 DOM 치환. 검증은 문자열 grep이 아니라 **렌더된 DOM(`document.body.innerText` + innerHTML)에서 U+1F300~1FAFF 검색 0** 으로 판정(스모크, 5개 화면: 책장·오늘·과목·주차표·라이브러리).

## 검증 추가 (오타 GREEN 조건)
- 스모크: (a) 복습 취소(체크 해제 후 pruneStudy) → study 제거 (b) 새로고침(재부팅) 후 study 상태 유지 (c) 주 2회 과목 한 회차만 reviewed → 차단 (d) patchV34a 재실행 시 2회째 무동작 (e) 390px 폭 책등 스크롤·표지 제목 표시.

## 오타에게
위 수정으로 GREEN인지, 남은 RED가 있으면 항목 번호로. 600자 안팎.
