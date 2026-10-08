# 회의 판정(설계): GREEN

설계 6절 파트 A에 동의합니다. 외부 설계 파일은 읽기만 했습니다.
HTML을 사각형으로 놓으려면 활성 면을 정면에서 보아야 합니다.
칠판 시점은 벽 정면, 공책 시점은 공책 바로 위로 고정했습니다.
걷는 시점의 pitch 제한은 유지하고 착석 시점만 수직 내려다보기를 허용했습니다.

## 파트 B 연결 계약

기존 `createSpace(app)` 반환 객체에 다음 API를 추가했습니다.

- `space.setSubject(name): boolean` — ROOMS의 정확한 과목명만 받습니다. 성공 `true`, 미등록 `false`. 로딩 전에도 선택을 기억합니다. 방·문 색, 칠판 위 제목, 소품을 바꿉니다. 수업 선택이나 서버 저장은 호출하지 않습니다.
- `space.boardRect(): {x,y,w,h} | null` — viewport 기준 CSS px의 칠판 면 경계입니다.
- `space.deskRect(): {x,y,w,h} | null` — viewport 기준 CSS px의 공책 윗면 경계입니다. 책상 전체가 아닙니다.
- `space.saeng.lecture(on): void` — 말하기와 강의 몸짓을 시작/종료합니다. 종료 시 가리키기도 끝납니다.
- `space.saeng.point(): void` — 오른팔로 칠판을 1.2초 가리킨 뒤 복귀합니다.
- `window`의 `school:viewrect` — `CustomEvent`, `detail: {view, board, desk}`. `view`는 기존 `lecture`/`notebook`/`paper` 또는 숨김 시 `null`; 두 면은 위 사각형 또는 `null`입니다.

초기 로딩 전·걷기·숨김·시점 이동 중에는 사각형을 `null`로 반환합니다. 카메라 뒤에 있는 면도 `null`입니다. 이동 시작에는 두 사각형이 `null`인 이벤트, 도착·resize·과목 변경·hide에는 현재 상태 이벤트를 보냅니다. 창 크기가 이동 중 바뀌면 도착 이벤트까지 HTML을 숨겨 두세요.

`lecture`에서 `board`, `notebook`에서 `desk`를 사용하세요. 활성 면은 네 꼭짓점과 사각형이 일치합니다. 다른 면이나 기존 `paper` 시점의 반환값은 축에 정렬한 경계이며, 기울어진 면에 HTML을 직접 덮을 용도로 쓰지 마세요. 기존 paper 고정 시점은 보존했습니다.

HTML 위치는 `position:fixed`로 `{left:x, top:y, width:w, height:h}`를 적용합니다. 글·수식·펜 캔버스의 넘침 처리는 B의 책임입니다. 새 HUD가 기존 `.board`/`.mission-work`와 다른 클래스라면 `view-moving` 또는 null 이벤트로 가려야 합니다.

`seated(name,kind,cameraView)`·`walk(name)`·`enter(name)`는 기존 과목명을 계속 받지만 물리 방 하나를 공유합니다. ROOMS 5개는 기존 과목 선택 경로를 위해 유지합니다. 2D 복도의 과목 카드/HUD는 B에서 바꾸어야 합니다. 기존 FP 팔·복도·대표실 출입·저장 후 이동·학습 설정의 고정 시점 계약은 유지했습니다. 동기화 API는 수정하지 않았습니다.

## 검증

신규 `docs/tools/classroom_surface_check.cjs`는 8798을 기본으로 사용합니다. Chrome과 iPad WebKit에서 원본 3D 면의 투영 꼭짓점을 사각형 네 모서리와 비교합니다(허용 오차 0.01 CSS px). 좁은 화면, resize, 과목 5개, 미등록 과목, W/S, 입력칸, 겹친 창, 고정 시점, 이동 중 null 및 도착 이벤트를 검사합니다.

실행: `node docs/tools/classroom_surface_check.cjs`.
`PLAYWRIGHT_PATH` 및 `SCHOOL_URL` 환경변수로 경로/서버를 지정할 수 있습니다.

독립 코드 검토에서 중복 resize 선언·로딩 전 강의 상태 동기화·가리키기 방향을 지적받아 수정했습니다. 실제 Three.js 아바타 메모리 검사에서 오른손 이동량 Δx=+0.052531, Δz=-0.481384 및 1.5초 뒤 복귀를 확인했습니다. 검토자는 이 세 경로를 GREEN으로 판정했습니다. B 통합 화면의 최종 교차 검수는 남아 있습니다.

기존 검사 8개는 요청대로 tmp 사본에서 서버 8798 및 지정 Playwright 경로로 바꿔 실행했습니다. 모든 최종 종료 코드는 0입니다.

사본·로그 폴더: `C:/Users/user/.claude/jobs/a132f963/tmp`.
각 명령은 `node C:/Users/user/.claude/jobs/a132f963/tmp/otta_A_<이름>.cjs`입니다.

- `sit_flow` — 0, Chrome·iPad 걷기→착석→일어나기→나가기.
- `overlay_check` — 0, 겹친 창에서 카메라 정지 및 닫은 뒤 재개.
- `stage2_check` — 0, 연결 복도·대표실 문·저장 실패 시 이동 중단.
- `sync_check` — 0, 두 기기 수업 위치와 지연 응답 처리.
- `practice_flow_check` — 0, 문제풀기에서 3D 지연 로딩 및 이후 걷기/착석.
- `sit_lesson_check` — 0, Chrome·iPad 착석 수업 전체 흐름.
- `ipad_keyboard_check` — 0, 한글/영문 W·방향키·휠.
- `school_smoke` — 0, 상담·진단·계획·저장·서술형·확인문제·보충 복귀.

앞 네 검사는 이 작업 폴더 docs/tools에 없어 기존 tmp 사본을 기반으로 서버/경로만 교체했습니다. 뒤 네 검사는 이 작업 폴더 docs/tools를 기반으로 했습니다. 초기 중복 선언과 과도한 병렬 실행으로 실패한 실행은 수정 후 위 검사로 다시 통과했습니다.

신규 투영 검사: `node docs/tools/classroom_surface_check.cjs` — 0, Chrome·iPad WebKit. 꼭짓점 오차 0.01 CSS px 이내, 페이지 오류 0. 길게 누른 W 반복 이벤트가 전환을 재시작하지 않는 것도 확인했습니다.

최종 `git diff --check` 및 변경 ES module의 `node --input-type=module --check`도 0입니다. 실제 서비스 배포·B 병합·새 HUD/수식/공책을 겹쳐 놓은 최종 화면 검수는 수행하지 않았습니다. 기존 2D 복도 카드 및 HUD는 이 파트의 변경 범위 밖입니다. 외부 노션 기록은 하지 않았고 이 파일을 로컬 결과 기록으로 남깁니다.
