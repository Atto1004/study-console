# V36 설계 회의 — 주 2회 과목의 주차 정리를 요일별 회차로 분리 (2026-09-17)
아토 지시: "주차별 수업정리: 주 2회인 과목들은 각 1주차하고 각 요일별 수업들별로 따로 정리". 코딩 설계는 오타 주도, 코드는 아톰이 씀. 오타는 파일을 쓰지 않는다.

## 1. 현재
- 정리 데이터 = `c.weekNotes[w]` 한 덩어리(7섹션: range·summary·textbook·board·recording·material·notes·exam[]·tasks[]·links[]). 편집 `weekSheet(cid,w)`(id `wn_*`, 내부 `weekNote(c,w,true)`·`planned(c)`), 학습 `openStudy(cid,w)`→`renderStudyUnit()`(`weekNote(c,w)`·`studySessionsOf(c,w)`), 할 일 수집 `allTasks()`(weekNotes만 순회), 상태 `weekNoteHas(c,w)`, V33 `hwState`가 `weekNotes[w].links` 읽음, 회차 요약 패널 `wnRead(c,w)`.
- V34 과목 화면 16주 목록 `V34.renderWeeks`(주 단위 행). V35가 미적2 1~3주차를 주 단위로 시드(2·3주차는 두 요일 내용이 한 필드에 합쳐짐).
- PC 원본은 이미 날짜 단위(`<과목>/<날짜>/정리.md`).

## 2. 아톰 초안 (V36 LAYER)
### 2.1 데이터
- `c.dayNotes[date]` = weekNote와 같은 모양(range 대신 date 고정). `V36.dayNote(c,date,create)`. 주 단위 `weekNotes[w]`는 그대로 두고 **「주 합본」**으로 표시(있을 때만). 주 1회 과목은 기존대로 주 단위(요일 행 없음).
- 판정 `V36.split(c)` = `c.slots.length>=2`(주 2회 이상).
### 2.2 과목 화면 목록
- `V34.renderWeeks` 래핑: split 과목은 각 주차 행을 **머리줄(주차·날짜범위·시험 라벨·주 합본 요약/버튼(있을 때만))** + **요일 하위 행**(`planned` 그 주 회차마다: 요일 M/D · 회차 상태(V34.weekState의 회차 단위 축약: 휴강/미수강/결석/기록 없음/정리 없음/요약) · 섹션 n/5 · ★ n · 할 일 n · [학습][열기]). `weekNoteHas` 래핑: split 과목은 day note 중 하나라도 내용 있으면 true(주 단위 상태 판정 유지).
### 2.3 편집·학습 — 함수 스왑
- `V36.daySheet(cid,date)`: `ui.dayCtx={cid,date}` 두고 `weekSheet(cid,weekOf(date))` 호출. `weekSheet` 래핑: `ui.dayCtx`가 있으면 호출 동안 `weekNote`→`dayNote` 반환, `planned(c)`→그 날짜 회차만, 제목 「M/D(요일) 회차 정리」로 바꾼 뒤 원본 실행, 끝나면 복원(동기). mount 안 `reopen()`은 전역 `weekSheet`를 다시 부르므로 `ui.dayCtx`가 살아 있는 동안 day로 유지. `closeSheet` 래핑에서 `ui.dayCtx=null`(단, reopen은 closeSheet→weekSheet 순서라 ctx가 먼저 지워짐 → **reopen 감지**: closeSheet 래핑은 ctx를 `ui.dayCtxPending`으로 옮기고, 다음 동기 weekSheet 호출이 같은 cid·주면 복원, 아니면 폐기. 오타: 더 단순한 방법?).
- `openStudy(cid,w,date)` 3번째 인자 → `ui.studyUnit.date`. `renderStudyUnit` 래핑: date 있으면 실행 동안 `weekNote`→dayNote, `studySessionsOf`→그 날짜만, 제목에 날짜. 「주차 정리 편집」 버튼 → daySheet.
- `allTasks` 래핑: dayNotes tasks도 포함(`{c,w:weekOf(date),t,date}`). `V33.hwState`·`wnRead`는 주 단위 유지 + day links 합집합으로 보강(래핑).
### 2.4 데이터 이관 (1회, `term().patchV36a`)
- 미적2 V35 시드를 날짜별로 다시 씀: dayNotes 9/1·9/3·9/8·9/10·9/15·9/17(각 회차 정리.md 기준, 시험 언급·할 일은 그 날짜 것만). V35가 넣은 주 단위 문자열 필드는 **V35 시드 문자열과 동일할 때만** 비움(아토 수정본 보존), exam/tasks/links는 날짜별로 이동(quote/text/url 일치하는 것만). 다른 과목의 기존 주 단위 시드(공수1·일물2·정역학·글쓰기)는 「주 합본」으로 유지 — 날짜별 재작성은 다음 단계.
### 2.5 검증
- 게이트 · 스모크: (a) 미적2 3주차 하위 행 2개(9/15·9/17), 주 1회 과목(글쓰기) 하위 행 없음 (b) daySheet 열면 `#wn_summary` 값이 day note, 저장 후 dayNotes에 반영·weekNotes 불변 (c) reopen(시험 언급 추가) 뒤에도 day 유지 (d) 학습 화면 날짜 제목·그 날짜 회차만 (e) allTasks에 day task 포함 (f) 이관 후 V35 주 단위 필드 비고 dayNotes 채움, 재실행 무동작 (g) 렌더 DOM 이모지 0.

## 3. 오타에게
1. 2.3 함수 스왑(전역 `weekNote`/`planned`/`studySessionsOf` 임시 치환)의 재진입·비동기 위험과 reopen 처리의 더 단순한 대안.
2. 2.4 이관에서 아토 수정본을 잃는 경로.
3. 2.2 주 합본과 요일 행이 같이 있을 때 상태·할 일 집계 중복.
4. 그 외 RED. GREEN 조건. 한국어 존댓말 900자 안팎.
