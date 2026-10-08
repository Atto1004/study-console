**회의 판정(설계): GREEN.** 파트 A 구현과 검사를 완료했습니다. 독립 코드 검토도 통과했습니다.

구현 커밋은 `otta-classroom-1008` 브랜치의 2개입니다.

- `d780894` — 강의실 통합, 칠판·공책 투영 API, 강의 동작 추가.
- `4be8563` — paper 고정 모드를 유지하며 칠판 정면으로 시점 정렬.

3D 강의실 문·책상·칠판·스앵님을 각각 하나로 구성했습니다. W/S·↑/↓는 0.7초로 전환하며, 입력칸·겹친 창·고정 시점에서는 무시합니다. 작업 폴더는 깨끗합니다.

아톰이 사용할 API는 다음과 같습니다.

- `space.setSubject(name) → boolean` — 방 색·칠판 위 과목명·소품 변경. 미등록 과목은 `false`.
- `space.boardRect()` / `space.deskRect() → {x,y,w,h} | null` — viewport 기준 CSS px. `desk`는 공책 윗면입니다. 이동 중·걷기·숨김에는 `null`.
- `space.saeng.lecture(on) → void` — 말하기와 강의 몸짓.
- `space.saeng.point() → void` — 칠판을 1.2초 가리킨 뒤 복귀.
- `window`의 `school:viewrect` 이벤트 — `detail: {view, board, desk}`. 이동 시작·도착·resize·과목 변경·숨김 때 발생합니다.

`lecture`와 `paper`에서는 `board`, `notebook`에서는 `desk`를 사용하면 됩니다. 연결 계약과 결과를 [파트 A 기록](C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/otta-classroom/docs/classroom-v2-A-notes.md)에 저장했습니다.

검사 명령과 종료 코드입니다.

- `node C:/Users/user/.claude/jobs/a132f963/tmp/otta_A_<검사명>.cjs`
  - `sit_flow`, `overlay_check`, `stage2_check`, `sync_check`
  - `practice_flow_check`, `sit_lesson_check`, `ipad_keyboard_check`, `school_smoke`
  - **8개 모두 종료 코드 0.**
- `node docs/tools/classroom_surface_check.cjs` — **종료 코드 0.** Chrome·iPad WebKit에서 활성 면의 네 꼭짓점과 사각형 오차가 0.01px 이내입니다. resize·paper 고정 시점·키 반복도 통과했습니다.
- 모듈 문법 검사와 `git diff --check` — **종료 코드 0.**

앞 네 기존 검사는 작업 폴더에 없어 기존 tmp 사본을 사용했습니다. [기존 검사 요약](C:/Users/user/.claude/jobs/a132f963/tmp/otta_A_tests_summary.txt)에 근거를 남겼습니다.

남은 것은 B 병합 후 HTML 칠판·공책과 새 HUD를 겹친 최종 화면 검수입니다. 배포와 외부 노션 기록은 수행하지 않았습니다.

상태: 파트 A 커밋 완료, B 통합 대기입니다.