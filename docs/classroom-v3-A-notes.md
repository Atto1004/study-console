# 회의 판정(설계): GREEN

설계 4절 A3에 동의합니다. 외부 설계 파일은 읽기만 했습니다. 기존 v3 A 계약 파일은 없어서 이 문서를 작업 폴더에 새로 기록합니다. 무대 안에서는 칠판 정면 시점만 쓰고, 전체 화면에서는 기존 학습 방식 고정 시점과 공책 시점을 보존합니다.

## B3 연결 계약

- `space.mount(stageEl | null): void` — DOM Element이면 3D 레이어를 요소 안에 붙이고 ResizeObserver로 크기를 맞춥니다. null이면 학교의 전체 화면 레이어로 복귀합니다. 3D 로딩을 시작하지 않습니다. static 요소만 position:relative를 임시 적용하고 해제할 때 기존 inline 값을 복원합니다. 반복 호출은 resize만 합니다.
- 게임 착석: `space.mount(stageEl)` 후 `await space.seated(name, kind, cameraView)`. 착석 후 mount도 지원합니다. 무대 안에서는 lecture 시점으로 고정하고 기존 시점 버튼을 숨깁니다.
- 걷기: `walk(name, opts)`가 자동으로 mount(null)을 적용합니다.
- 사이트: B3에서 space/Three를 import하거나 seated를 호출하지 않아야 합니다. 기존 동적 import는 유지했습니다. 이미 게임을 로딩했다면 `space.hide()`로 숨기고 사이트 화면을 그립니다. 이미 가져온 JS를 메모리에서 내리는 API는 없습니다.
- `space.boardRect(): {x,y,w,h} | null` — viewport 기준 CSS px, 실제 칠판 면의 네 꼭짓점 경계. HTML 오버레이는 position:fixed로 적용합니다.
- `space.saeng.headPoint(): {x,y} | null` — viewport 기준 CSS px. 머리 그룹의 정수리 기준점을 카메라로 투영합니다. 아바타 머리 회전과 몸 움직임을 따릅니다.
- `school:viewrect` — window CustomEvent, `detail: {view, board, desk, head}`. 기존 view/board/desk 반환 계약 유지. head는 위 API와 같습니다. 로딩 전·걷기·숨김·시점 이동 중에는 면과 머리가 null입니다. 3D 로딩 후 mount/resize, scroll/과목 변경/이동 시작·도착/hide 및 착석 렌더 직후 보냅니다.
- `space.saeng.lecture(on): void`, `space.saeng.point(): void`, `space.deskRect(): {x,y,w,h} | null`은 기존 계약을 유지합니다.

## 범위

변경은 school/space.js, school/avatar3d.js의 머리 기준점, school/space.css의 3D 무대 규칙입니다. school.js, lecture, HUD, 화면 배치를 수정하지 않았습니다. 서버 API와 동기화 코드도 수정하지 않았습니다.

## 검사

검사 결과는 완료 뒤 아래에 기록합니다. B3 통합 화면과 실제 서비스 적용은 이 작업에서 확인하지 않습니다.


## 완료 검증 (2026-10-08)

- 기준 브랜치 otta-v3-1008, HEAD 460df08에서 시작했습니다.
- 독립 검수자가 8798의 space.js와 작업 폴더 파일의 바이트 일치를 확인했습니다.
- 신규 검사: `node C:/Users/user/.claude/jobs/a132f963/tmp/otta_v3_stage_projection_check.cjs` — 종료 코드 0. 무대 900×400, 420×600, 1000×220, 320×240, 640×360. 칠판 면·머리 독립 투영·이벤트/API 일치·무대 위치 변경·무대 로딩 전 Three 요청 0·공책 시점 차단·걷기 전체 화면 복귀를 검사했습니다. 머리 오차 0.01 CSS px 이내입니다.
- 1000×220 화면의 발끝 잘림을 시각 검수에서 발견해 halfHeight를 2.0으로 넓혔습니다. 수정 뒤 신규 검사를 다시 통과했고 화면에서 전신 표시를 확인했습니다.
- 기존 검사 명령: `node C:/Users/user/.claude/jobs/a132f963/tmp/otta_A_<이름>.cjs`. ipad_keyboard_check, overlay_check, practice_flow_check, sit_flow, sit_lesson_check, stage2_check, sync_check — 각각 종료 코드 0.
- 원본 school_smoke — 종료 코드 0이지만 otta-classroom 파일을 읽으므로 현재 v3 검증으로 계산하지 않습니다. 경로와 tutor import를 보완한 `otta_v3_school_smoke_current.cjs` — 종료 코드 1, 89행에서 현재 수업 흐름에서 제거된 읽음 확인 버튼을 찾지 못했습니다. 검사 흐름 보완이 필요하며 B3 코드는 변경하지 않았습니다.
- 변경 JS 2개 `node --input-type=module --check` — 각각 0. `git diff --check` — 0.
- 독립 코드 검수: 무대 연결/머리 기준점/CSS/계약 확인. 실제 B3 통합 화면·실제 서비스 배포·main 병합·실기기 성능 측정은 하지 않았습니다. 성능 조절 코드는 유지했습니다.
- 실행 환경: Playwright 지정 경로, Chromium channel chrome. sandbox에 없는 ProgramFiles 값은 검사 자식 프로세스 환경에만 지정했습니다. exec_command 초기화 오류로 Node child_process를 사용했습니다.
- 로그: tmp/otta_v3_regression_results.json, tmp/otta_v3_bounded_results.json. 로컬 결과 기록은 이 문서입니다.
