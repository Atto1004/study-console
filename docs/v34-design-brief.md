# V34 설계 회의 — 아토 패치 노트 9/17 (책장·예습 규칙·과목 주차 목록·정리) 
작성 아톰 2026-09-17. 코딩 설계는 오타 주도. 오타는 파일을 쓰지 않고, 코드는 아톰이 쓴다.

## 0. 아토 지시 (원문 그대로)
```
9/17(목)
- 복습안했으면 예습생성x(해당과목 복습완료시 예습하기 생성)
- 책등수정=> 초기 책등디자인(글자만), 책등 배치 [중앙정렬]
- 시간표 등록/과목추가 버튼 제거
- 복습큐 제거
- 할일 내용 일단 초기화
- 디자인에이모지 사용 지양할것
- 책표지에 이미지로 바뀐것 위에 잘보일수있게 한글로 과목명 기입
- 학습-과목별 정리내용 각과목별(책장-과목) 페이지안에 재정리 (1주차-> 16주차까지 생성하고 8주차에 중간고사 16주차에 기말고사로 기입하고 아직 수업안들은것 회색으로)
- 달력: 날짜 기입
```

## 1. 현재 코드 (index.html, BUILD .33, 8,4xx줄, 레이어 V25/V27/V31/V32/V33 파일 끝)
- 책장: `bookHTML(c)` — `.book`에 `hascv`면 `.bk-cv`(표지 사진) + `.bk-scrim`, **`.book.hascv .bk-t{display:none}`**(과목명 숨김). 책등 모드 `.shelf.spine .book` — 세로 제목 `.bk-t`(writing-mode) + 엠블럼 `.bk-em` + 요일 `.bk-days` + 게이지 `.bk-gaugerow` + D-day. `.shelf.spine{display:flex;align-items:flex-end}` (왼쪽 정렬, 가로 스크롤). 표지/책등 전환은 `ui.shelfView` 세그먼트(기존).
- 버튼: `#btnImportTT`(시간표 등록) `#btnAddCourse`(과목 추가) — `renderShelf()`가 personal이면 숨김/문구 변경, 7244행에서 onclick 바인딩.
- 복습 큐: 오늘 탭 `#reviewList` 카드(`<div class="card">…<h3>복습 큐</h3>…</div>`), `renderToday()` 안 `buildReviewQueue()` → 렌더. 학습 탭 `openStudy` 마무리 채점(gradeReview)은 별도.
- 할 일: `S.weekly[월요일]={items:[{key,cat,text,due,done,src}]}`. `generateWeekly(mon)`이 매주 만들고 기존 key는 안 건드림. `ensureWeekly()`는 없을 때만 생성. ③ 예습: `push("study:"+c.id+":"+w,"study",…)` — 조건 없이 이번 주 수업 있는 활성 과목 전부. ④ 복습: 지난주 회차 중 `!s.reviewed` 개수 k>0이면 `review:` 항목.
- 과목 화면 `renderCourse()` → `#cNotes`: `weekNoteHas(c,w)`인 주차만 목록(1주차부터). `weekNote(c,w)` 구조 `{range,summary,textbook,board,recording,material,notes,exam[],tasks[],links[]}`. 시험: `exams(c.id)` → `{kind:"중간"|"기말",date}`; 시드는 8주차(CADD 10주차) 중간, 기말은 term 16주차. `term().weeks=16`, `weekStart(w)`, `planned(c)`(회차 목록, `.week`).
- 달력: 월 보기 `renderCalMonth` 셀에 날짜 숫자 있음. 주 보기 `renderCalWeek` 헤더에 요일+날짜 있음. **주차표(V32 grid)**: 행 머리에 `N주차 + 주 시작일(M/D)`만 있고 **각 셀(요일)에는 날짜 없음**. 폰 목록 모드는 `V32.md(o.date)` 있음.
- 이모지(UI): V32/V33 자료 4종 아이콘 🎙📘✍️🧱 (dots·legend·라이브러리 탭 `V32.TYPES`·SPEC icon), 버튼 `📚 라이브러리`·`🗓 주차표`, 지식맵 `🧭`, 정리 `📝`, 과제 `📎`, 영상 `🎬`, 그 외 ★☆⚠✓✕✎(기호, 유지 대상). 아토 규칙(메모리 app-design-guideline): UI 이모지 지양.

## 2. 아톰 초안 (V34 LAYER, 기존 함수는 래핑·CSS는 뒤에 덧씀)
### 2.1 예습 생성 조건
- `generateWeekly` 래핑: 원본 실행 후 `study:{cid}:{w}` 항목 중 **그 과목의 지난주 회차에 `reviewed`가 아닌 끝난 회차가 하나라도 있으면**(= 같은 entry에 `review:{cid}:{prevMon}` 항목이 있거나 원본 ④의 k>0) 그 study 항목을 제거. 단 이미 `done` 처리된 study는 유지.
- 복습을 마치면(`gradeReview` 또는 `s.reviewed=true` 경로) 다시 생성되어야 함 → `gradeReview` 래핑 뒤 `generateWeekly(weeklyKey(today()))` 재실행(기존 key 보존이라 안전) + `renderTodo` 갱신.
- 1주차(지난주 회차 없음)는 복습 없음 → 예습 생성 O.
### 2.2 책등 = 글자만 + 중앙 정렬
- CSS: `.shelf.spine .bk-em,.shelf.spine .bk-foot,.shelf.spine .bk-dday,.shelf.spine .bk-alert,.shelf.spine .bk-fav,.shelf.spine .bk-fold,.shelf.spine .bk-pending,.shelf.spine .bk-cv,.shelf.spine .bk-scrim{display:none}` · `.shelf.spine .book.hascv .bk-t{display:block}` · `.shelf.spine{justify-content:center}` (책이 넘치면 스크롤 유지 — `justify-content:center`는 overflow 시 앞부분이 잘리므로 `margin:auto` 방식 또는 내부 래퍼로 처리. 오타 판단 요청).
### 2.3 버튼 제거
- CSS `#btnImportTT,#btnAddCourse{display:none!important}`. 기능(importTT/editCourse)은 설정 탭 경로가 있으면 유지, 없으면 삭제 대상 아님(숨김만). 책장 빈 문구 "시간표를 등록하면…"은 "설정에서…"로.
### 2.4 복습 큐 제거
- 오늘 탭 복습 큐 카드 `display:none`(`#reviewList`의 `.card`). `buildReviewQueue` 호출은 남되 렌더만 생략(renderToday 래핑에서 카드 숨김). FSRS 채점은 학습 탭 마무리에서만.
### 2.5 할 일 초기화
- 1회 패치 `patchV34a`: `S.weekly={}` 후 `ensureWeekly()`로 이번 주 재생성(2.1 규칙 적용). `S.patches.v34a` 플래그로 1회. 주차노트 `tasks`(과제)는 데이터라 유지 — "할일 내용"은 할 일 탭(S.weekly)로 해석. 오타: 이 해석 맞는지, `weeklyRules`(설정 규칙)도 비울지.
### 2.6 이모지 → 텍스트/기호
- V32.TYPES·SPEC icon·legend·dots: 🎙→「녹」 📘→「자」 ✍️→「필」 🧱→「판」 📝→「정」 📎→「과」 🎬→「영」 (한 글자 라벨, `.v32-dots i` 폰트 10px). 버튼 「라이브러리」「주차표」「지식맵」 텍스트만. `V32.dotsHTML`·`V32.fillDots`·`renderLib` 탭 라벨은 `V32.TYPES` 배열을 읽으므로 배열 값 교체로 대부분 해결. `MUST`(전역)·`V33.SPEC` 항목의 `icon` 필드도 교체(V33 post/pre 객체는 레이어 안 변수 → `V33.SPEC` 순회로 icon 치환 가능한지 오타 확인).
- 기호 ★☆⚠✓✕✎ 유지(이모지 아님).
### 2.7 표지 위 과목명
- `.book.hascv .bk-t{display:block;position:absolute;left:10px;right:10px;top:10px;z-index:3;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.85);font-size:…}` + 상단 스크림 `.bk-scrim2`(top 0, height 38%, 위→아래 rgba(0,0,0,.55→0)) 추가(bookHTML 래핑으로 삽입 또는 `.bk-cv::after`로 CSS만). 책등 모드에서는 2.2대로 세로 글자.
### 2.8 과목 화면 주차 목록 1~16
- `renderCourse` 래핑: `#cNotes`를 **1~term.weeks 전부** 그린다. 각 행: `w주차 · 날짜범위(월~일)` + 상태. 상태 판정: (a) `exams(c.id)`에 그 주 회차 날짜와 일치하는 시험 있으면 「중간고사」/「기말고사」 행(시험 없는 과목도 8주차·16주차 라벨은 기본 표기? — 오타: 시드 없는 과목은 term 기준 8/16으로 라벨만) (b) 그 주 첫 회차 날짜 > 오늘 → 「예정」 회색(`.fut`) (c) 지난 주인데 `weekNoteHas` 없음 → 「정리 없음」 경고색 (d) 정리 있음 → 기존 요약 행. 버튼 「학습」「열기」는 지난/이번 주만.
- 진행 중 표시: 이번 주 행 강조. 회차 없는 주(휴강만)는 「휴강」.
### 2.9 주차표 셀 날짜
- `V32.renderGrid` 표 모드 셀 `<td>` 맨 위에 `<div class="v32-cd">M/D</div>` — `V32.cellLine` 호출 전에 삽입(V32 함수 래핑 불가 → `V32.renderGrid`를 복제 대신 결과 DOM 후처리: 각 `td`의 열 인덱스와 행의 주차로 날짜 계산해 prepend). 오타: 후처리 vs 재정의 중 택일.
### 2.10 검증
- 게이트 구문 0 · 스모크(기존 52건 유지 + V34: (1) 지난주 미복습 회차 있는 과목의 study 항목 없음 / 없는 과목은 있음 (2) `#btnImportTT` 계산 스타일 none (3) 복습 큐 카드 none (4) 과목 화면 `#cNotes` 행 16개, 8주차 행에 「중간」, 미래 주 `.fut` (5) 주차표 td에 `.v32-cd` (6) index.html 내 이모지 문자(🎙📘🧱📚📝📎🧭🎬🗓 등 U+1F300~) 0개 — 단 PATCHNOTES 문자열은 예외) · 헤드리스 캡처: 책장 표지·책등, 과목 화면 주차 목록, 주차표.

## 3. 오타에게
1. 2.1 예습 조건의 함정 — `reviewed` 플래그의 출처가 학습 탭 마무리(gradeReview)뿐인지, 결석·휴강 회차 처리, 주 2회 과목에서 한 회차만 복습했을 때.
2. 2.5 "할일 내용 일단 초기화"의 해석(S.weekly만 vs 주차노트 tasks·weeklyRules 포함). 되돌릴 수 없는 삭제라 어디까지가 안전한지.
3. 2.8 16주 목록에서 시험 주차 라벨 근거(exams 시드 vs term 고정 8/16), CADD(중간 10주차)처럼 다른 과목 처리.
4. 2.9 DOM 후처리 vs `V32.renderGrid` 재정의.
5. 2.2 책등 중앙 정렬과 overflow 스크롤 양립 방법.
6. 그 외 RED. GREEN 조건 명시. 한국어 존댓말 1200자 안팎.
